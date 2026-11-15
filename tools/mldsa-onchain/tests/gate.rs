//! The command gate, in LiteSVM (the real SBF VM): a base's registry of authorized ML-DSA-65 keys,
//! governed by its authority (in production a multisig), and AUTHORIZE, which turns a VERIFIED buffer
//! into an authorized uplink only if the key is registered, the signed ticket names THIS base, and its
//! counter is fresh. A valid signature from an unregistered key must be refused ON CHAIN.
//! Fixtures: `bun tests/gen-gate-fixtures.mjs` (noble ML-DSA-65, the web page's library).
use litesvm::LiteSVM;
use mldsa_onchain::*;
use solana_sdk::{
    account::Account, compute_budget::ComputeBudgetInstruction, hash::hashv, instruction::{AccountMeta, Instruction},
    pubkey::Pubkey, signature::{Keypair, Signer}, transaction::Transaction,
};

const CU_CAP: u32 = 1_400_000;
const CHUNK: usize = 900;
const REG_A: Pubkey = Pubkey::new_from_array([0x52; 32]); // the gate_t*.bin tickets name this base...
const REG_B: Pubkey = Pubkey::new_from_array([0x53; 32]); // ...except gate_tb.bin, which names this one

fn f(n: &str) -> Vec<u8> { std::fs::read(format!("tests/fixtures/{n}")).unwrap() }
fn keyid(pk: &[u8]) -> [u8; 32] { hashv(&[pk]).to_bytes() }
fn u64_at(d: &[u8], o: usize) -> u64 { u64::from_le_bytes(d[o..o + 8].try_into().unwrap()) }

struct T { svm: LiteSVM, id: Pubkey, gov: Keypair }

impl T {
    fn new() -> T {
        let id = Pubkey::new_unique();
        let mut svm = LiteSVM::new();
        svm.add_program_from_file(id, "target/deploy/mldsa_onchain.so").expect("cargo build-sbf first");
        let gov = Keypair::new();
        svm.airdrop(&gov.pubkey(), 50_000_000_000).unwrap();
        T { svm, id, gov }
    }
    fn stranger(&mut self) -> Keypair { let k = Keypair::new(); self.svm.airdrop(&k.pubkey(), 1_000_000_000).unwrap(); k }
    /// one instruction in its own transaction (fee payer = `signer`); Ok(logs) or Err(logs)
    fn send(&mut self, accounts: Vec<AccountMeta>, data: Vec<u8>, signer: &Keypair) -> Result<Vec<String>, Vec<String>> {
        let ix = Instruction { program_id: self.id, accounts, data };
        let tx = Transaction::new_signed_with_payer(
            &[ComputeBudgetInstruction::set_compute_unit_limit(CU_CAP), ComputeBudgetInstruction::request_heap_frame(256 * 1024), ix],
            Some(&signer.pubkey()), &[signer], self.svm.latest_blockhash());
        let r = self.svm.send_transaction(tx);
        self.svm.expire_blockhash();
        match r { Ok(m) => Ok(m.logs), Err(e) => Err(e.meta.logs) }
    }
    fn blank(&mut self, at: Pubkey, owner: Pubkey, len: usize) {
        let lamports = self.svm.minimum_balance_for_rent_exemption(len);
        self.svm.set_account(at, Account { lamports, data: vec![0; len], owner, executable: false, rent_epoch: 0 }).unwrap();
    }
    fn reg(&mut self, tag: u8, reg: Pubkey, who: &Keypair, key: Option<[u8; 32]>) -> Result<Vec<String>, Vec<String>> {
        let mut data = vec![tag];
        if let Some(k) = key { data.extend_from_slice(&k); }
        self.send(vec![AccountMeta::new(reg, false), AccountMeta::new(who.pubkey(), true)], data, who)
    }
    fn registry_with(&mut self, at: Pubkey, keys: &[[u8; 32]]) {
        let id = self.id;
        self.blank(at, id, REG_LEN);
        let gov = self.gov.insecure_clone();
        self.reg(IX_REG_INIT, at, &gov, None).unwrap();
        for k in keys { self.reg(IX_REG_ADD, at, &gov, Some(*k)).unwrap(); }
    }
    /// the staged verifier, start to finish; returns the buffer (DONE, VERIFIED or REJECTED)
    fn verified(&mut self, pk: &[u8], sig: &[u8], m: &[u8]) -> Pubkey {
        let (id, payer) = (self.id, self.gov.insecure_clone());
        let buf = Pubkey::new_unique();
        self.blank(buf, id, ACCOUNT_LEN);
        let meta = || vec![AccountMeta::new(buf, false), AccountMeta::new(payer.pubkey(), true)];
        self.send(meta(), [vec![IX_INIT], (m.len() as u16).to_le_bytes().to_vec()].concat(), &payer).unwrap();
        for (i, ch) in [pk, sig, m].concat().chunks(CHUNK).enumerate() {
            self.send(meta(), [vec![IX_WRITE], ((i * CHUNK) as u16).to_le_bytes().to_vec(), ch.to_vec()].concat(), &payer).unwrap();
        }
        self.send(meta(), vec![IX_PREP], &payer).unwrap();
        if self.svm.get_account(&buf).unwrap().data[H_STAGE] != STAGE_DONE {
            for (a, n) in [(0u8, 2u8), (2, 2), (4, 2)] { self.send(meta(), vec![IX_ROWS, a, n], &payer).unwrap(); }
        }
        buf
    }
    fn result(&self, buf: Pubkey) -> u8 { self.svm.get_account(&buf).unwrap().data[H_RESULT] }
    fn authorize(&mut self, buf: Pubkey, reg: Pubkey) -> Result<Vec<String>, Vec<String>> {
        let who = self.stranger(); // permissionless: anyone may submit; the signature + registry decide
        self.send(vec![AccountMeta::new_readonly(buf, false), AccountMeta::new(reg, false)], vec![IX_AUTHORIZE], &who)
    }
    fn reg_data(&self, reg: Pubkey) -> Vec<u8> { self.svm.get_account(&reg).unwrap().data }
}

fn said(logs: &[String], needle: &str) -> bool { logs.iter().any(|l| l.contains(needle)) }

#[test]
fn registry_is_governed_by_its_authority_only() {
    let mut t = T::new();
    let (op, gov, eve) = (keyid(&f("gate_op_pk.bin")), t.gov.insecure_clone(), t.stranger());
    let id = t.id;
    t.blank(REG_A, id, REG_LEN);
    t.reg(IX_REG_INIT, REG_A, &gov, None).expect("authority creates the registry");
    let d = t.reg_data(REG_A);
    assert_eq!((d[R_MAGIC], d[R_VERSION], d[R_NKEYS]), (REG_MAGIC, 1, 0));
    assert_eq!(&d[R_AUTH..R_AUTH + 32], gov.pubkey().as_ref());
    assert!(t.reg(IX_REG_INIT, REG_A, &eve, None).is_err(), "no re-init (would steal the registry)");
    assert!(t.reg(IX_REG_ADD, REG_A, &eve, Some(op)).is_err(), "a stranger cannot add a key");
    t.reg(IX_REG_ADD, REG_A, &gov, Some(op)).expect("authority adds a key");
    assert_eq!(t.reg_data(REG_A)[R_NKEYS], 1);
    assert_eq!(&t.reg_data(REG_A)[R_KEYS..R_KEYS + 32], &op);
    assert!(t.reg(IX_REG_ADD, REG_A, &gov, Some(op)).is_err(), "no duplicates");
    assert!(t.reg(IX_REG_REMOVE, REG_A, &eve, Some(op)).is_err(), "a stranger cannot remove a key");
    t.reg(IX_REG_REMOVE, REG_A, &gov, Some(op)).expect("authority removes a key");
    assert_eq!(t.reg_data(REG_A)[R_NKEYS], 0);
    assert!(t.reg(IX_REG_REMOVE, REG_A, &gov, Some(op)).is_err(), "removing an unknown key fails");
    for k in 0..REG_MAX_KEYS { t.reg(IX_REG_ADD, REG_A, &gov, Some([k as u8 + 1; 32])).unwrap(); }
    assert!(t.reg(IX_REG_ADD, REG_A, &gov, Some([0xEE; 32])).is_err(), "registry full");
    // type confusion: an account of the wrong size is never a registry
    let odd = Pubkey::new_unique();
    t.blank(odd, id, REG_LEN + 1);
    assert!(t.reg(IX_REG_INIT, odd, &gov, None).is_err(), "wrong-size account refused");
    let foreign = Pubkey::new_unique();
    t.blank(foreign, Pubkey::new_unique(), REG_LEN);
    assert!(t.reg(IX_REG_INIT, foreign, &gov, None).is_err(), "account of another program refused");
}

#[test]
fn registered_key_fresh_counter_is_authorized_and_recorded() {
    let mut t = T::new();
    let op_pk = f("gate_op_pk.bin");
    t.registry_with(REG_A, &[keyid(&op_pk)]);
    let (m1, s1) = (f("gate_t1.bin"), f("gate_t1.sig"));
    let b1 = t.verified(&op_pk, &s1, &m1);
    assert_eq!(t.result(b1), RESULT_VERIFIED);
    let logs = t.authorize(b1, REG_A).expect("registered key, this base, fresh counter");
    assert!(said(&logs, "moonseal: uplink AUTHORIZED"), "{logs:?}");
    let d = t.reg_data(REG_A);
    assert_eq!(u64_at(&d, R_COUNTER), 1);
    assert_eq!(&d[R_PACKET..R_PACKET + 32], &m1[T_PACKET..T_PACKET + 32], "stations read this packet hash");
    assert_eq!(&d[R_HOUR..R_HOUR + 8], &m1[T_HOUR..T_HOUR + 8]);
    assert_eq!(&d[R_KEYID..R_KEYID + 32], &keyid(&op_pk));
    let replay = t.authorize(b1, REG_A).expect_err("same ticket twice = replay");
    assert!(said(&replay, "replay"), "{replay:?}");
    let b2 = t.verified(&op_pk, &f("gate_t2.sig"), &f("gate_t2.bin"));
    t.authorize(b2, REG_A).expect("next counter");
    assert_eq!(u64_at(&t.reg_data(REG_A), R_COUNTER), 2);
    let late = t.authorize(b1, REG_A).expect_err("an older ticket after a newer one = replay");
    assert!(said(&late, "replay"), "{late:?}");
}

#[test]
fn valid_signature_is_not_enough() {
    let mut t = T::new();
    let op_pk = f("gate_op_pk.bin");
    t.registry_with(REG_A, &[keyid(&op_pk)]);
    // forged: a perfectly VALID ML-DSA-65 signature, by a key the base never registered
    let bf = t.verified(&f("gate_att_pk.bin"), &f("gate_tf.sig"), &f("gate_tf.bin"));
    assert_eq!(t.result(bf), RESULT_VERIFIED, "the math alone says yes");
    let e = t.authorize(bf, REG_A).expect_err("but the base's registry says no");
    assert!(said(&e, "not in this base's registry"), "{e:?}");
    // a ticket the operator signed for ANOTHER base
    let bb = t.verified(&op_pk, &f("gate_tb.sig"), &f("gate_tb.bin"));
    assert_eq!(t.result(bb), RESULT_VERIFIED);
    let e = t.authorize(bb, REG_A).expect_err("ticket names another base");
    assert!(said(&e, "another base"), "{e:?}");
    // tampered in transit: one bit of the packet hash flipped, original signature
    let mut m = f("gate_t1.bin");
    m[T_PACKET] ^= 1;
    let bt = t.verified(&op_pk, &f("gate_t1.sig"), &m);
    assert_eq!(t.result(bt), RESULT_REJECTED);
    let e = t.authorize(bt, REG_A).expect_err("rejected signature");
    assert!(said(&e, "not VERIFIED"), "{e:?}");
    // a valid signature over something that is not an uplink ticket
    let nb_pk = f("noble_pk.bin");
    let gov = t.gov.insecure_clone();
    t.reg(IX_REG_ADD, REG_A, &gov, Some(keyid(&nb_pk))).unwrap();
    let bn = t.verified(&nb_pk, &f("noble_sig.bin"), &f("msg.bin"));
    assert_eq!(t.result(bn), RESULT_VERIFIED);
    let e = t.authorize(bn, REG_A).expect_err("not a ticket");
    assert!(said(&e, "not an uplink ticket"), "{e:?}");
    assert_eq!(u64_at(&t.reg_data(REG_A), R_COUNTER), 0, "nothing above changed the base's state");
}

#[test]
fn revoked_key_loses_authority() {
    let mut t = T::new();
    let op_pk = f("gate_op_pk.bin");
    t.registry_with(REG_A, &[keyid(&op_pk)]);
    let b1 = t.verified(&op_pk, &f("gate_t1.sig"), &f("gate_t1.bin"));
    t.authorize(b1, REG_A).unwrap();
    let gov = t.gov.insecure_clone();
    t.reg(IX_REG_REMOVE, REG_A, &gov, Some(keyid(&op_pk))).unwrap();
    let b5 = t.verified(&op_pk, &f("gate_t5.sig"), &f("gate_t5.bin"));
    assert_eq!(t.result(b5), RESULT_VERIFIED);
    assert!(t.authorize(b5, REG_A).is_err(), "revoked by the base's authority");
}

#[test]
fn accounts_cannot_be_swapped_or_faked() {
    let mut t = T::new();
    let op_pk = f("gate_op_pk.bin");
    t.registry_with(REG_A, &[keyid(&op_pk)]);
    let b1 = t.verified(&op_pk, &f("gate_t1.sig"), &f("gate_t1.bin"));
    assert!(t.authorize(REG_A, b1).is_err(), "buffer and registry swapped");
    assert!(t.authorize(b1, b1).is_err(), "buffer passed as registry");
    // a 'registry' with the right bytes but owned by another program
    let fake_reg = Pubkey::new_unique();
    let mut d = t.reg_data(REG_A);
    d[R_KEYS..R_KEYS + 32].copy_from_slice(&keyid(&op_pk));
    let lamports = t.svm.minimum_balance_for_rent_exemption(REG_LEN);
    t.svm.set_account(fake_reg, Account { lamports, data: d, owner: Pubkey::new_unique(), executable: false, rent_epoch: 0 }).unwrap();
    assert!(t.authorize(b1, fake_reg).is_err(), "registry of another program");
    // a 'VERIFIED' buffer forged by another program (copy of a real one)
    let fake_buf = Pubkey::new_unique();
    let real = t.svm.get_account(&b1).unwrap();
    t.svm.set_account(fake_buf, Account { owner: Pubkey::new_unique(), ..real }).unwrap();
    assert!(t.authorize(fake_buf, REG_A).is_err(), "buffer of another program");
    let _ = REG_B;
    t.authorize(b1, REG_A).expect("the real pair still works");
}
