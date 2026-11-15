//! Host-side correctness of the SBF verifier against independent implementations.
use mldsa_onchain::mldsa65::{verify, PK_LEN, SIG_LEN};
fn f(n: &str) -> Vec<u8> { std::fs::read(format!("tests/fixtures/{n}")).unwrap() }

#[test]
fn sizes_match_fips204() { assert_eq!((PK_LEN, SIG_LEN), (1952, 3309)); }

#[test]
fn verifies_noble_and_bouncycastle_signatures() {
    let m = f("msg.bin");
    assert!(verify(&f("noble_pk.bin"), &m, &f("noble_sig.bin"), &[]), "browser (@noble/post-quantum) signature");
    assert!(verify(&f("bc_pk.bin"), &m, &f("bc_sig.bin"), &[]), "BouncyCastle 1.81 (Java) signature");
}

#[test]
fn rejects_tampering() {
    let (pk, m, sig) = (f("noble_pk.bin"), f("msg.bin"), f("noble_sig.bin"));
    let mut m2 = m.clone(); m2[3] ^= 1;
    assert!(!verify(&pk, &m2, &sig, &[]), "tampered message");
    for &i in &[0usize, 47, 48, 1500, 3247, 3300, 3308] {           // c~, z, z, z, hints, hint counts
        let mut s2 = sig.clone(); s2[i] ^= 1;
        assert!(!verify(&pk, &m, &s2, &[]), "tampered signature byte {i}");
    }
    let mut pk2 = pk.clone(); pk2[100] ^= 1;
    assert!(!verify(&pk2, &m, &sig, &[]), "tampered public key");
    assert!(!verify(&f("bc_pk.bin"), &m, &sig, &[]), "wrong key");
    assert!(!verify(&pk, &m, &sig, b"ctx"), "wrong context");
}
