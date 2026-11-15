//! moonseal on-chain verifier: ML-DSA-65 (FIPS 204) signatures verified by a Solana program.
//!
//! A key (1952 B) and a signature (3309 B) do not fit a 1232-byte transaction and one verification
//! costs ~3.4M compute units (measured in LiteSVM), above the 1.4M per-transaction cap. So, as in
//! Vineland's staged STARK verifier (riverrun `staged.rs`), the data goes into a buffer account owned
//! by this program in packet-sized chunks, and verification runs as a short sequence of
//! transactions, each under the cap:
//!
//! ```text
//! INIT ─▶ WRITE* ─▶ PREP (seal + decode z, check norms, NTT(z), hints, mu, c) ─▶ ROWS(0,2) ─▶ ROWS(2,2) ─▶ ROWS(4,2) + FINAL
//! ```
//!
//! Properties (same discipline as riverrun's buffer protocol):
//! - **The authority set at INIT must sign every instruction.** Verification is deterministic, so this
//!   is griefing protection, not a trust assumption.
//! - **Immutable input after PREP.** WRITE is refused once the buffer is sealed; PREP records
//!   sha256(pk || sig || msg) and sha256(pk) so a consumer can check what was verified and by whom.
//! - **Stages in order.** ROWS must start at `rows_done`; FINAL runs only after the 6th row.
//! - **Only the program writes the result** (VERIFIED or REJECTED). A consumer program must check:
//!   owner == this program, magic/version, stage == DONE, result == VERIFIED, and the commitments.
//!
//! The monolithic `VERIFY_ONE` (5) instruction runs everything in one call: for tests and for runtimes
//! with a larger budget. The staged path is what fits Solana today.
pub mod mldsa65;

use mldsa65::{Poly, CT_LEN, K, L, N, PK_LEN, SIG_LEN};
use solana_program::{
    account_info::AccountInfo, clock::Clock, entrypoint::ProgramResult, hash::hashv, msg, program_error::ProgramError,
    pubkey::Pubkey, sysvar::Sysvar,
};

pub const PK: usize = PK_LEN;
pub const SIG: usize = SIG_LEN;
pub const MSG_MAX: usize = 1024;

// ---- account layout -------------------------------------------------------------------------
pub const H_MAGIC: usize = 0; //      b'M'
pub const H_VERSION: usize = 1; //    1
pub const H_STAGE: usize = 2; //      1 writing, 2 prepped, 3 done
pub const H_RESULT: usize = 3; //     0 pending, 1 verified, 2 rejected
pub const H_ROWS: usize = 4; //       rows of w1 done (0..=6)
pub const H_MSGLEN: usize = 5; //     u16 LE
pub const H_AUTH: usize = 7; //       [7, 39)   authority
pub const H_COMMIT: usize = 39; //    [39, 71)  sha256(pk || sig || msg), set at PREP
pub const H_KEYID: usize = 71; //     [71, 103) sha256(pk), set at PREP
pub const DATA: usize = 128; //       pk | sig | msg
pub const SCRATCH: usize = 6416; //   >= DATA + PK + SIG + MSG_MAX (6413)
pub const S_MU: usize = SCRATCH; //                64
pub const S_C: usize = S_MU + 64; //               c_hat, 256 x u32
pub const S_Z: usize = S_C + 4 * N; //             z_hat, L x 256 x u32
pub const S_W1: usize = S_Z + 4 * N * L; //        w1Encode, K x 128
pub const ACCOUNT_LEN: usize = S_W1 + 128 * K; //  13392

pub const MAGIC: u8 = b'M';
pub const STAGE_WRITING: u8 = 1;
pub const STAGE_PREPPED: u8 = 2;
pub const STAGE_DONE: u8 = 3;
pub const RESULT_VERIFIED: u8 = 1;
pub const RESULT_REJECTED: u8 = 2;

pub const IX_INIT: u8 = 0;
pub const IX_WRITE: u8 = 1;
pub const IX_PREP: u8 = 2;
pub const IX_ROWS: u8 = 3;
pub const IX_CLOSE: u8 = 4;
pub const IX_VERIFY_ONE: u8 = 5;

// ---- command registry: one account per base, its policy (which ML-DSA-65 keys may command it) ----
// Owned by this program, exactly REG_LEN bytes, magic b'R' (a buffer can never pass for a registry or
// the reverse). Governed by its authority: in production a multisig vault of the base's owners; the
// program only checks that the authority signed.
pub const REG_LEN: usize = 384;
pub const REG_MAGIC: u8 = b'R';
pub const R_MAGIC: usize = 0; //    b'R'
pub const R_VERSION: usize = 1; //  1
pub const R_NKEYS: usize = 2; //    authorized keys in use (<= REG_MAX_KEYS)
pub const R_AUTH: usize = 8; //     [8, 40)   governance authority
pub const R_COUNTER: usize = 40; // u64 LE    highest uplink counter authorized so far (replay guard)
pub const R_HOUR: usize = 48; //    i64 LE    planned hour of the last authorized uplink
pub const R_PACKET: usize = 56; //  [56, 88)  sha256 of the last authorized uplink packet
pub const R_SLOT: usize = 88; //    u64 LE    slot it was authorized in
pub const R_KEYID: usize = 96; //   [96, 128) sha256(pk) of the key that signed it
pub const R_KEYS: usize = 128; //   REG_MAX_KEYS x 32: sha256 of each authorized ML-DSA-65 public key
pub const REG_MAX_KEYS: usize = 8;
const _: () = assert!(R_KEYS + 32 * REG_MAX_KEYS == REG_LEN);

// ---- uplink ticket: the message the operator signs; AUTHORIZE parses it from the verified buffer ----
// [0,4) "MSUT" | [4] 1 | [5,37) registry pubkey (binds the ticket to one base) | [37,45) counter u64 LE |
// [45,53) planned hour i64 LE | [53,85) sha256(uplink packet) | [85,101) site id, ASCII, 0-padded
pub const TICKET_LEN: usize = 101;
pub const T_MAGIC: &[u8; 4] = b"MSUT";
pub const T_REGISTRY: usize = 5;
pub const T_COUNTER: usize = 37;
pub const T_HOUR: usize = 45;
pub const T_PACKET: usize = 53;
pub const T_SITE: usize = 85;

pub const IX_REG_INIT: u8 = 6; //    [registry w, authority s]
pub const IX_REG_ADD: u8 = 7; //     [registry w, authority s] + keyid[32]
pub const IX_REG_REMOVE: u8 = 8; //  [registry w, authority s] + keyid[32]
pub const IX_AUTHORIZE: u8 = 9; //   [buffer, registry w]: permissionless; the signature + registry decide

// custom errors of the gate
pub const E_NOT_VERIFIED: u32 = 20;
pub const E_KEY_NOT_REGISTERED: u32 = 21;
pub const E_NOT_A_TICKET: u32 = 22;
pub const E_OTHER_BASE: u32 = 23;
pub const E_REPLAY: u32 = 24;
pub const E_REGISTRY_FULL: u32 = 25;
pub const E_KEY_ALREADY: u32 = 26;
pub const E_KEY_UNKNOWN: u32 = 27;
pub const E_NOT_AUTHORITY: u32 = 28;
pub const E_NOT_A_REGISTRY: u32 = 29;

#[cfg(not(feature = "no-entrypoint"))]
solana_program::entrypoint!(process);

fn err(code: u32) -> ProgramError {
    ProgramError::Custom(code)
}

fn load_poly(d: &[u8], at: usize, p: &mut Poly) {
    for (i, v) in p.iter_mut().enumerate() {
        let o = at + 4 * i;
        *v = u32::from_le_bytes([d[o], d[o + 1], d[o + 2], d[o + 3]]);
    }
}
fn store_poly(d: &mut [u8], at: usize, p: &Poly) {
    for (i, v) in p.iter().enumerate() {
        d[at + 4 * i..at + 4 * i + 4].copy_from_slice(&v.to_le_bytes());
    }
}

fn hex8(b: &[u8]) -> String {
    b[..4].iter().map(|x| format!("{:02x}", x)).collect()
}

/// A registry is an account of this program, of exactly REG_LEN bytes.
fn registry_account(id: &Pubkey, reg: &AccountInfo) -> Result<(), ProgramError> {
    if reg.owner != id {
        return Err(ProgramError::IncorrectProgramId);
    }
    if reg.data_len() != REG_LEN {
        return Err(err(E_NOT_A_REGISTRY));
    }
    Ok(())
}

/// REG_INIT / REG_ADD / REG_REMOVE: the base's authority edits which keys may command it.
fn registry_admin(id: &Pubkey, accounts: &[AccountInfo], tag: u8, ix: &[u8]) -> ProgramResult {
    let (reg, auth) = match accounts {
        [r, a, ..] => (r, a),
        _ => return Err(ProgramError::NotEnoughAccountKeys),
    };
    registry_account(id, reg)?;
    if !auth.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let mut d = reg.try_borrow_mut_data()?;
    if tag == IX_REG_INIT {
        if d[R_MAGIC] != 0 {
            return Err(ProgramError::AccountAlreadyInitialized);
        }
        d[R_MAGIC] = REG_MAGIC;
        d[R_VERSION] = 1;
        d[R_NKEYS] = 0;
        d[R_AUTH..R_AUTH + 32].copy_from_slice(auth.key.as_ref());
        msg!("moonseal: registry created, authority {}", auth.key);
        return Ok(());
    }
    if d[R_MAGIC] != REG_MAGIC || d[R_VERSION] != 1 {
        return Err(ProgramError::UninitializedAccount);
    }
    if &d[R_AUTH..R_AUTH + 32] != auth.key.as_ref() {
        msg!("moonseal: only the registry's authority can change it");
        return Err(err(E_NOT_AUTHORITY));
    }
    let key: [u8; 32] = ix.get(1..33).and_then(|s| s.try_into().ok()).ok_or(err(1))?;
    let n = d[R_NKEYS] as usize;
    let mut pos = None;
    for i in 0..n {
        if d[R_KEYS + 32 * i..R_KEYS + 32 * (i + 1)] == key {
            pos = Some(i);
        }
    }
    if tag == IX_REG_ADD {
        if pos.is_some() {
            return Err(err(E_KEY_ALREADY));
        }
        if n >= REG_MAX_KEYS {
            return Err(err(E_REGISTRY_FULL));
        }
        d[R_KEYS + 32 * n..R_KEYS + 32 * (n + 1)].copy_from_slice(&key);
        d[R_NKEYS] = (n + 1) as u8;
        msg!("moonseal: key {} may now command this base", hex8(&key));
    } else {
        let i = pos.ok_or(err(E_KEY_UNKNOWN))?;
        let last = n - 1;
        let moved: [u8; 32] = d[R_KEYS + 32 * last..R_KEYS + 32 * (last + 1)].try_into().unwrap();
        d[R_KEYS + 32 * i..R_KEYS + 32 * (i + 1)].copy_from_slice(&moved); // swap-remove
        d[R_KEYS + 32 * last..R_KEYS + 32 * (last + 1)].fill(0);
        d[R_NKEYS] = last as u8;
        msg!("moonseal: key {} revoked", hex8(&key));
    }
    Ok(())
}

/// AUTHORIZE: a VERIFIED buffer becomes an authorized uplink only if (1) the key that signed is in the
/// base's registry, (2) the signed message is an uplink ticket naming THIS registry, and (3) its counter
/// is above every counter authorized before. Permissionless: whoever submits it, the outcome is the same.
/// On success the registry records the uplink's packet hash, hour, counter, key and slot: what ground
/// stations read before relaying.
fn authorize(id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let (buf, reg) = match accounts {
        [b, r, ..] => (b, r),
        _ => return Err(ProgramError::NotEnoughAccountKeys),
    };
    if buf.owner != id {
        return Err(ProgramError::IncorrectProgramId);
    }
    registry_account(id, reg)?;
    let b = buf.try_borrow_data()?;
    if b.len() < ACCOUNT_LEN || b[H_MAGIC] != MAGIC || b[H_VERSION] != 1 {
        return Err(ProgramError::UninitializedAccount);
    }
    let mut r = reg.try_borrow_mut_data()?;
    if r[R_MAGIC] != REG_MAGIC || r[R_VERSION] != 1 {
        return Err(ProgramError::UninitializedAccount);
    }
    if b[H_STAGE] != STAGE_DONE || b[H_RESULT] != RESULT_VERIFIED {
        msg!("moonseal: uplink DENIED: the signature is not VERIFIED");
        return Err(err(E_NOT_VERIFIED));
    }
    let keyid = &b[H_KEYID..H_KEYID + 32];
    let n = r[R_NKEYS] as usize;
    if !(0..n).any(|i| &r[R_KEYS + 32 * i..R_KEYS + 32 * (i + 1)] == keyid) {
        msg!("moonseal: uplink DENIED: key {} is not in this base's registry", hex8(keyid));
        return Err(err(E_KEY_NOT_REGISTERED));
    }
    let ml = u16::from_le_bytes([b[H_MSGLEN], b[H_MSGLEN + 1]]) as usize;
    let t = &b[DATA + PK + SIG..DATA + PK + SIG + ml];
    if ml != TICKET_LEN || &t[..4] != T_MAGIC || t[4] != 1 {
        msg!("moonseal: uplink DENIED: the signed message is not an uplink ticket");
        return Err(err(E_NOT_A_TICKET));
    }
    if &t[T_REGISTRY..T_REGISTRY + 32] != reg.key.as_ref() {
        msg!("moonseal: uplink DENIED: the ticket was signed for another base");
        return Err(err(E_OTHER_BASE));
    }
    let counter = u64::from_le_bytes(t[T_COUNTER..T_COUNTER + 8].try_into().unwrap());
    let last = u64::from_le_bytes(r[R_COUNTER..R_COUNTER + 8].try_into().unwrap());
    if counter <= last {
        msg!("moonseal: uplink DENIED: replay (counter {} is not above {})", counter, last);
        return Err(err(E_REPLAY));
    }
    let slot = Clock::get()?.slot;
    r[R_COUNTER..R_COUNTER + 8].copy_from_slice(&counter.to_le_bytes());
    r[R_HOUR..R_HOUR + 8].copy_from_slice(&t[T_HOUR..T_HOUR + 8]);
    r[R_PACKET..R_PACKET + 32].copy_from_slice(&t[T_PACKET..T_PACKET + 32]);
    r[R_SLOT..R_SLOT + 8].copy_from_slice(&slot.to_le_bytes());
    r[R_KEYID..R_KEYID + 32].copy_from_slice(keyid);
    msg!("moonseal: uplink AUTHORIZED counter {} packet {} key {}", counter, hex8(&t[T_PACKET..]), hex8(keyid));
    Ok(())
}

pub fn process(id: &Pubkey, accounts: &[AccountInfo], ix: &[u8]) -> ProgramResult {
    let tag = *ix.first().ok_or(ProgramError::InvalidInstructionData)?;
    match tag {
        IX_REG_INIT | IX_REG_ADD | IX_REG_REMOVE => return registry_admin(id, accounts, tag, ix),
        IX_AUTHORIZE => return authorize(id, accounts),
        _ => {}
    }
    let (buf, auth) = match accounts {
        [b, a, ..] => (b, a),
        _ => return Err(ProgramError::NotEnoughAccountKeys),
    };
    if buf.owner != id {
        return Err(ProgramError::IncorrectProgramId);
    }
    if !auth.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    let mut d = buf.try_borrow_mut_data()?;
    if d.len() < ACCOUNT_LEN {
        return Err(ProgramError::AccountDataTooSmall);
    }

    if tag == IX_INIT {
        if d[H_MAGIC] != 0 {
            return Err(ProgramError::AccountAlreadyInitialized);
        }
        let ml = u16::from_le_bytes([*ix.get(1).ok_or(err(1))?, *ix.get(2).ok_or(err(1))?]) as usize;
        if ml > MSG_MAX {
            return Err(err(2));
        }
        d[H_MAGIC] = MAGIC;
        d[H_VERSION] = 1;
        d[H_STAGE] = STAGE_WRITING;
        d[H_MSGLEN..H_MSGLEN + 2].copy_from_slice(&(ml as u16).to_le_bytes());
        d[H_AUTH..H_AUTH + 32].copy_from_slice(auth.key.as_ref());
        return Ok(());
    }

    // every other instruction: initialized buffer, same authority
    if d[H_MAGIC] != MAGIC || d[H_VERSION] != 1 {
        return Err(ProgramError::UninitializedAccount);
    }
    if &d[H_AUTH..H_AUTH + 32] != auth.key.as_ref() {
        return Err(err(3));
    }
    let ml = u16::from_le_bytes([d[H_MSGLEN], d[H_MSGLEN + 1]]) as usize;
    let data_len = PK + SIG + ml;

    match tag {
        IX_WRITE => {
            if d[H_STAGE] != STAGE_WRITING {
                return Err(err(4)); // sealed: input is immutable
            }
            let off = u16::from_le_bytes([*ix.get(1).ok_or(err(1))?, *ix.get(2).ok_or(err(1))?]) as usize;
            let bytes = &ix[3..];
            if off + bytes.len() > data_len {
                return Err(err(5));
            }
            d[DATA + off..DATA + off + bytes.len()].copy_from_slice(bytes);
            Ok(())
        }
        IX_PREP => {
            if d[H_STAGE] != STAGE_WRITING {
                return Err(err(6));
            }
            d[H_STAGE] = STAGE_PREPPED; // seal
            let commit = hashv(&[&d[DATA..DATA + data_len]]).to_bytes();
            let keyid = hashv(&[&d[DATA..DATA + PK]]).to_bytes();
            d[H_COMMIT..H_COMMIT + 32].copy_from_slice(&commit);
            d[H_KEYID..H_KEYID + 32].copy_from_slice(&keyid);
            let input = d[DATA..DATA + data_len].to_vec(); // sealed copy: no borrow of `d` below
            let (pk, rest) = input.split_at(PK);
            let (sig, m) = rest.split_at(SIG);
            // z: decode + norm check + NTT
            let mut zs: Vec<Poly> = vec![[0u32; N]; L];
            let mut ok = true;
            for (i, z) in zs.iter_mut().enumerate() {
                if !mldsa65::decode_z(sig, i, z) {
                    ok = false;
                    break;
                }
                mldsa65::ntt(z);
            }
            let mut h = vec![0u8; K * N];
            ok = ok && mldsa65::hint_unpack(&sig[CT_LEN + 640 * L..], &mut h);
            if !ok {
                d[H_STAGE] = STAGE_DONE;
                d[H_RESULT] = RESULT_REJECTED;
                msg!("moonseal: rejected at PREP (malformed z or hints)");
                return Ok(());
            }
            let mu = mldsa65::mu(pk, m, &[]);
            let mut c: Box<Poly> = Box::new([0u32; N]);
            mldsa65::sample_in_ball(&sig[..CT_LEN], &mut c);
            mldsa65::ntt(&mut c);
            d[S_MU..S_MU + 64].copy_from_slice(&mu);
            store_poly(&mut d, S_C, &c);
            for (i, z) in zs.iter().enumerate() {
                store_poly(&mut d, S_Z + 4 * N * i, z);
            }
            d[H_ROWS] = 0;
            Ok(())
        }
        IX_ROWS => {
            if d[H_STAGE] != STAGE_PREPPED {
                return Err(err(7));
            }
            let first = *ix.get(1).ok_or(err(1))? as usize;
            let count = *ix.get(2).ok_or(err(1))? as usize;
            if first != d[H_ROWS] as usize || count == 0 || first + count > K {
                return Err(err(8)); // stages in order, no gaps, no repeats
            }
            let mut zs: Vec<Poly> = vec![[0u32; N]; L];
            for (i, z) in zs.iter_mut().enumerate() {
                load_poly(&d, S_Z + 4 * N * i, z);
            }
            let mut c: Box<Poly> = Box::new([0u32; N]);
            load_poly(&d, S_C, &mut c);
            let mut h = vec![0u8; K * N];
            mldsa65::hint_unpack(&d[DATA + PK + CT_LEN + 640 * L..DATA + PK + SIG], &mut h);
            let (mut a, mut t, mut acc): (Box<Poly>, Box<Poly>, Box<Poly>) = (Box::new([0; N]), Box::new([0; N]), Box::new([0; N]));
            let mut row = [0u8; 128];
            for r in first..first + count {
                mldsa65::row(&d[DATA..DATA + PK], r, &zs, &c, &h, &mut row, &mut a, &mut t, &mut acc);
                d[S_W1 + 128 * r..S_W1 + 128 * (r + 1)].copy_from_slice(&row);
            }
            d[H_ROWS] = (first + count) as u8;
            if first + count == K {
                let mut mu = [0u8; 64];
                mu.copy_from_slice(&d[S_MU..S_MU + 64]);
                let ct2 = mldsa65::final_hash(&mu, &d[S_W1..S_W1 + 128 * K]);
                let good = ct2[..] == d[DATA + PK..DATA + PK + CT_LEN];
                d[H_STAGE] = STAGE_DONE;
                d[H_RESULT] = if good { RESULT_VERIFIED } else { RESULT_REJECTED };
                msg!("moonseal: ML-DSA-65 {}", if good { "VERIFIED" } else { "REJECTED" });
            }
            Ok(())
        }
        IX_CLOSE => {
            drop(d);
            let lamports = buf.lamports();
            **buf.try_borrow_mut_lamports()? = 0;
            **auth.try_borrow_mut_lamports()? += lamports;
            buf.try_borrow_mut_data()?.fill(0);
            Ok(())
        }
        IX_VERIFY_ONE => {
            let (pk, rest) = d[DATA..].split_at(PK);
            let (sig, rest) = rest.split_at(SIG);
            let good = mldsa65::verify(pk, &rest[..ml], sig, &[]);
            msg!("moonseal: monolithic ML-DSA-65 {}", if good { "VERIFIED" } else { "REJECTED" });
            if good { Ok(()) } else { Err(ProgramError::InvalidArgument) }
        }
        _ => Err(ProgramError::InvalidInstructionData),
    }
}
