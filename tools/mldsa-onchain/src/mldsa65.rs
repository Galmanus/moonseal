//! ML-DSA-65 signature verification (FIPS 204: ML-DSA.Verify, Algorithm 3, over Verify_internal,
//! Algorithm 8), written to run inside the Solana SBF virtual machine.
//!
//! Why not an off-the-shelf crate: a general-purpose implementation keeps the 6x5 matrix A and the
//! vectors on the stack (fips204 0.5.0's `verify_internal` needs a ~98 KB frame); SBF allows 4 KB per
//! frame, so it faults ("Access violation in stack frame"). Here every polynomial (256 x u32 = 1 KB)
//! lives on the heap and A is expanded one row at a time.
//!
//! All arithmetic is UNSIGNED. SBF has native unsigned div/mod (one compute unit) but no signed ones:
//! `i64 % i64` and `rem_euclid` compile to software routines that cost hundreds of units. Measured
//! in LiteSVM: the signed version spent ~400k CU per NTT; this one avoids every signed division.
//!
//! Verification only (public data in, bool out). Interop is pinned by tests against signatures from
//! @noble/post-quantum 0.7.1 (the browser) and BouncyCastle 1.81 (the Seeker app).

extern crate alloc;
use alloc::{boxed::Box, vec, vec::Vec};
use sha3::digest::{ExtendableOutput, Update, XofReader};
use sha3::{Shake128, Shake256};

pub const Q: u64 = 8_380_417;
pub const N: usize = 256;
pub const K: usize = 6;
pub const L: usize = 5;
const D: u32 = 13;
const TAU: usize = 49;
pub const CT_LEN: usize = 48; //             lambda / 4, lambda = 192
const GAMMA1: u64 = 1 << 19;
const GAMMA2: u64 = (Q - 1) / 32; //         261 888
const BETA: u64 = 196; //                    tau * eta
pub const OMEGA: usize = 55;
const M_W1: u64 = (Q - 1) / (2 * GAMMA2); // 16
pub const PK_LEN: usize = 32 + 320 * K; //   1952
pub const SIG_LEN: usize = CT_LEN + 640 * L + OMEGA + K; // 3309

pub type Poly = [u32; N];

const fn pow_mod(mut b: u64, mut e: u32) -> u64 {
    let mut r = 1u64;
    b %= Q;
    while e > 0 {
        if e & 1 == 1 {
            r = r * b % Q;
        }
        b = b * b % Q;
        e >>= 1;
    }
    r
}
const fn brv8(x: u32) -> u32 {
    let mut r = 0;
    let mut i = 0;
    while i < 8 {
        r |= ((x >> i) & 1) << (7 - i);
        i += 1;
    }
    r
}
/// zetas[m] = 1753^BitRev8(m) mod q (FIPS 204 Appendix B), computed at compile time.
const ZETAS: [u32; 256] = {
    let mut z = [0u32; 256];
    let mut m = 0;
    while m < 256 {
        z[m] = pow_mod(1753, brv8(m as u32)) as u32;
        m += 1;
    }
    z
};

/// FIPS 204 Algorithm 41. Coefficients in [0, q).
pub fn ntt(w: &mut Poly) {
    let (mut m, mut len) = (0usize, 128usize);
    while len >= 1 {
        let mut start = 0;
        while start < N {
            m += 1;
            let z = ZETAS[m] as u64;
            for j in start..start + len {
                let t = z * w[j + len] as u64 % Q;
                let a = w[j] as u64;
                w[j + len] = ((a + Q - t) % Q) as u32;
                w[j] = ((a + t) % Q) as u32;
            }
            start += 2 * len;
        }
        len /= 2;
    }
}

/// FIPS 204 Algorithm 42.
pub fn inv_ntt(w: &mut Poly) {
    let (mut m, mut len) = (256usize, 1usize);
    while len < N {
        let mut start = 0;
        while start < N {
            m -= 1;
            let z = Q - ZETAS[m] as u64; // -zetas[m] mod q
            for j in start..start + len {
                let t = w[j] as u64;
                let u = w[j + len] as u64;
                w[j] = ((t + u) % Q) as u32;
                w[j + len] = (z * ((t + Q - u) % Q) % Q) as u32;
            }
            start += 2 * len;
        }
        len *= 2;
    }
    const F: u64 = 8_347_681; // 256^-1 mod q
    for x in w.iter_mut() {
        *x = (*x as u64 * F % Q) as u32;
    }
}

/// Little-endian bit unpacking of 256 coefficients of `bits` bits (SimpleBitUnpack).
fn unpack(src: &[u8], bits: u32, out: &mut Poly) {
    let (mut acc, mut nacc, mut p) = (0u64, 0u32, 0usize);
    let mask = (1u64 << bits) - 1;
    for c in out.iter_mut() {
        while nacc < bits {
            acc |= (src[p] as u64) << nacc;
            p += 1;
            nacc += 8;
        }
        *c = (acc & mask) as u32;
        acc >>= bits;
        nacc -= bits;
    }
}

/// FIPS 204 Algorithm 21 (HintBitUnpack). `h` must be K*N zeros. False on malformed input.
pub fn hint_unpack(y: &[u8], h: &mut [u8]) -> bool {
    let mut index = 0usize;
    for i in 0..K {
        let end = y[OMEGA + i] as usize;
        if end < index || end > OMEGA {
            return false;
        }
        let first = index;
        while index < end {
            if index > first && y[index - 1] >= y[index] {
                return false;
            }
            h[i * N + y[index] as usize] = 1;
            index += 1;
        }
    }
    y[index..OMEGA].iter().all(|&b| b == 0)
}

/// z_i from the signature: decode, check ||z||_inf < gamma1 - beta, return it mod q (None = reject).
/// The packed value v gives z = gamma1 - v; |z| < gamma1 - beta  <=>  beta < v < 2 gamma1 - beta.
pub fn decode_z(sig: &[u8], i: usize, out: &mut Poly) -> bool {
    unpack(&sig[CT_LEN + 640 * i..CT_LEN + 640 * (i + 1)], 20, out);
    for v in out.iter_mut() {
        let x = *v as u64;
        if x <= BETA || x >= 2 * GAMMA1 - BETA {
            return false;
        }
        *v = ((GAMMA1 + Q - x) % Q) as u32;
    }
    true
}

/// FIPS 204 Algorithm 29 (SampleInBall), over the full c~. Coefficients 0, 1 or q-1.
pub fn sample_in_ball(ct: &[u8], c: &mut Poly) {
    let mut x = Shake256::default();
    x.update(ct);
    let mut r = x.finalize_xof();
    let mut s = [0u8; 8];
    r.read(&mut s);
    let signs = u64::from_le_bytes(s);
    c.iter_mut().for_each(|v| *v = 0);
    for i in (N - TAU)..N {
        let mut j = [0u8; 1];
        loop {
            r.read(&mut j);
            if (j[0] as usize) <= i {
                break;
            }
        }
        let j = j[0] as usize;
        c[i] = c[j];
        c[j] = if (signs >> (i + TAU - N)) & 1 == 1 { (Q - 1) as u32 } else { 1 };
    }
}

/// FIPS 204 Algorithm 30 (RejNTTPoly) for A[r][s], seed rho || s || r (Algorithm 32 ExpandA).
pub fn rej_ntt_poly(rho: &[u8], s: u8, r: u8, a: &mut Poly) {
    let mut x = Shake128::default();
    x.update(rho);
    x.update(&[s, r]);
    let mut rd = x.finalize_xof();
    let mut buf = [0u8; 168]; // one SHAKE128 block (168 = 56 x 3)
    let mut j = 0;
    while j < N {
        rd.read(&mut buf);
        let mut k = 0;
        while k < 168 && j < N {
            let v = buf[k] as u32 | (buf[k + 1] as u32) << 8 | ((buf[k + 2] & 0x7f) as u32) << 16;
            if (v as u64) < Q {
                a[j] = v;
                j += 1;
            }
            k += 3;
        }
    }
}

/// FIPS 204 Algorithms 36 (Decompose) + 40 (UseHint), unsigned. r in [0, q). Returns w1 in [0, 16).
/// r0 = r mod+- 2*gamma2 is negative exactly when r mod 2*gamma2 > gamma2; the special case
/// r - r0 = q - 1 is exactly r1 == 16, where FIPS 204 sets r1 = 0 and r0 <= 0.
pub fn use_hint(hint: bool, r: u64) -> u64 {
    let r0p = r % (2 * GAMMA2);
    let neg = r0p > GAMMA2;
    let mut r1 = (r - r0p) / (2 * GAMMA2) + neg as u64;
    let mut r0_pos = !neg && r0p > 0;
    if r1 == M_W1 {
        r1 = 0;
        r0_pos = false;
    }
    if !hint {
        r1
    } else if r0_pos {
        (r1 + 1) % M_W1
    } else {
        (r1 + M_W1 - 1) % M_W1
    }
}

/// tr = H(pk, 64), mu = H(tr || M', 64) with M' = 0 || |ctx| || ctx || M.
pub fn mu(pk: &[u8], msg: &[u8], ctx: &[u8]) -> [u8; 64] {
    let mut tr = [0u8; 64];
    let mut x = Shake256::default();
    x.update(pk);
    x.finalize_xof().read(&mut tr);
    let mut out = [0u8; 64];
    let mut x = Shake256::default();
    x.update(&tr);
    x.update(&[0u8, ctx.len() as u8]);
    x.update(ctx);
    x.update(msg);
    x.finalize_xof().read(&mut out);
    out
}

/// One row r of w'_approx: A[r] . z_hat - c_hat . NTT(t1[r] * 2^d), back from NTT, UseHint,
/// w1Encode into `w1_row` (128 bytes). `z_hat` holds the L NTT'd z polynomials.
pub fn row(pk: &[u8], r: usize, z_hat: &[Poly], c_hat: &Poly, h: &[u8], w1_row: &mut [u8], a: &mut Poly, t: &mut Poly, acc: &mut Poly) {
    let rho = &pk[..32];
    acc.iter_mut().for_each(|v| *v = 0);
    for (s, zs) in z_hat.iter().enumerate() {
        rej_ntt_poly(rho, s as u8, r as u8, a);
        for j in 0..N {
            acc[j] = ((acc[j] as u64 + a[j] as u64 * zs[j] as u64) % Q) as u32;
        }
    }
    unpack(&pk[32 + 320 * r..32 + 320 * (r + 1)], 10, t);
    t.iter_mut().for_each(|v| *v = (((*v as u64) << D) % Q) as u32);
    ntt(t);
    for j in 0..N {
        acc[j] = ((acc[j] as u64 + Q - c_hat[j] as u64 * t[j] as u64 % Q) % Q) as u32;
    }
    inv_ntt(acc);
    for j in (0..N).step_by(2) {
        let lo = use_hint(h[r * N + j] == 1, acc[j] as u64);
        let hi = use_hint(h[r * N + j + 1] == 1, acc[j + 1] as u64);
        w1_row[j / 2] = (lo | (hi << 4)) as u8;
    }
}

/// c~' = H(mu || w1Encode(w1'), 48)
pub fn final_hash(mu: &[u8; 64], w1: &[u8]) -> [u8; CT_LEN] {
    let mut out = [0u8; CT_LEN];
    let mut x = Shake256::default();
    x.update(mu);
    x.update(w1);
    x.finalize_xof().read(&mut out);
    out
}

/// ML-DSA.Verify(pk, M, sigma, ctx), pure variant. Every input is public: no constant-time need.
pub fn verify(pk: &[u8], msg: &[u8], sig: &[u8], ctx: &[u8]) -> bool {
    verify_with(pk, msg, sig, ctx, &mut |_| {})
}

/// Same as `verify`, calling `mark(phase)` after each phase (used to profile compute units on SBF).
pub fn verify_with(pk: &[u8], msg: &[u8], sig: &[u8], ctx: &[u8], mark: &mut dyn FnMut(u8)) -> bool {
    if pk.len() != PK_LEN || sig.len() != SIG_LEN || ctx.len() > 255 {
        return false;
    }
    let mut z: Vec<Poly> = vec![[0u32; N]; L];
    for (i, zi) in z.iter_mut().enumerate() {
        if !decode_z(sig, i, zi) {
            return false;
        }
        ntt(zi);
    }
    mark(1);
    let mut h = vec![0u8; K * N];
    if !hint_unpack(&sig[CT_LEN + 640 * L..], &mut h) {
        return false;
    }
    let m = mu(pk, msg, ctx);
    mark(3);
    let mut c: Box<Poly> = Box::new([0u32; N]);
    sample_in_ball(&sig[..CT_LEN], &mut c);
    ntt(&mut c);
    mark(5);
    let mut w1 = vec![0u8; 128 * K];
    let (mut a, mut t, mut acc): (Box<Poly>, Box<Poly>, Box<Poly>) = (Box::new([0; N]), Box::new([0; N]), Box::new([0; N]));
    for r in 0..K {
        row(pk, r, &z, &c, &h, &mut w1[128 * r..128 * (r + 1)], &mut a, &mut t, &mut acc);
        mark(10 + r as u8);
    }
    final_hash(&m, &w1)[..] == sig[..CT_LEN]
}
