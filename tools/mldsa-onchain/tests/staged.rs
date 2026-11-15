//! The staged protocol end to end in LiteSVM (the real SBF VM): every transaction under 1.4M CU and
//! 1232 bytes, a browser signature and a BouncyCastle signature VERIFIED on chain, tampering
//! REJECTED, and the protocol's guards (authority, sealing, stage order) enforced.
use litesvm::LiteSVM;
use mldsa_onchain::*;
use solana_sdk::{
    account::Account, compute_budget::ComputeBudgetInstruction, instruction::{AccountMeta, Instruction},
    pubkey::Pubkey, signature::{Keypair, Signer}, transaction::Transaction,
};

const CU_CAP: u64 = 1_400_000;
const CHUNK: usize = 900;

struct Run { txs: usize, max_cu: u64, max_bytes: usize, per_stage: Vec<(String, u64)> }

fn setup() -> (LiteSVM, Pubkey, Keypair) {
    let id = Pubkey::new_unique();
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(id, "target/deploy/mldsa_onchain.so").expect("cargo build-sbf first");
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    (svm, id, payer)
}

fn buffer(svm: &mut LiteSVM, id: Pubkey) -> Pubkey {
    let b = Pubkey::new_unique();
    let rent = svm.minimum_balance_for_rent_exemption(ACCOUNT_LEN);
    svm.set_account(b, Account { lamports: rent, data: vec![0; ACCOUNT_LEN], owner: id, executable: false, rent_epoch: 0 }).unwrap();
    b
}

fn send(svm: &mut LiteSVM, id: Pubkey, buf: Pubkey, signer: &Keypair, data: Vec<u8>, label: &str, run: &mut Run) -> Result<u64, String> {
    let ix = Instruction { program_id: id, accounts: vec![AccountMeta::new(buf, false), AccountMeta::new(signer.pubkey(), true)], data };
    let tx = Transaction::new_signed_with_payer(
        &[ComputeBudgetInstruction::set_compute_unit_limit(CU_CAP as u32), ComputeBudgetInstruction::request_heap_frame(256 * 1024), ix],
        Some(&signer.pubkey()), &[signer], svm.latest_blockhash());
    let bytes = bincode::serialize(&tx).unwrap().len();
    run.max_bytes = run.max_bytes.max(bytes);
    let res = svm.send_transaction(tx);
    svm.expire_blockhash(); // next identical instruction gets a fresh blockhash (no duplicate-signature drop)
    match res {
        Ok(m) => { run.txs += 1; run.max_cu = run.max_cu.max(m.compute_units_consumed); run.per_stage.push((label.into(), m.compute_units_consumed)); Ok(m.compute_units_consumed) }
        Err(f) => Err(format!("{label}: {:?} {:?}", f.err, f.meta.logs.iter().filter(|l| l.contains("failed") || l.contains("Error")).collect::<Vec<_>>())),
    }
}

fn verify_staged(pk: &[u8], sig: &[u8], m: &[u8]) -> (u8, Run) {
    let (mut svm, id, payer) = setup();
    let buf = buffer(&mut svm, id);
    let mut run = Run { txs: 0, max_cu: 0, max_bytes: 0, per_stage: vec![] };
    send(&mut svm, id, buf, &payer, [vec![IX_INIT], (m.len() as u16).to_le_bytes().to_vec()].concat(), "INIT", &mut run).unwrap();
    let data = [pk, sig, m].concat();
    for (i, ch) in data.chunks(CHUNK).enumerate() {
        let off = (i * CHUNK) as u16;
        send(&mut svm, id, buf, &payer, [vec![IX_WRITE], off.to_le_bytes().to_vec(), ch.to_vec()].concat(), "WRITE", &mut run).unwrap();
    }
    send(&mut svm, id, buf, &payer, vec![IX_PREP], "PREP", &mut run).unwrap();
    let acc = svm.get_account(&buf).unwrap();
    if acc.data[H_STAGE] != STAGE_DONE {
        for (first, count) in [(0u8, 2u8), (2, 2), (4, 2)] {
            send(&mut svm, id, buf, &payer, vec![IX_ROWS, first, count], &format!("ROWS {}-{}", first, first + count - 1), &mut run).unwrap();
        }
    }
    let acc = svm.get_account(&buf).unwrap();
    assert_eq!(&acc.data[H_KEYID..H_KEYID + 32], solana_sdk::hash::hashv(&[pk]).as_ref(), "key fingerprint recorded");
    (acc.data[H_RESULT], run)
}

fn f(n: &str) -> Vec<u8> { std::fs::read(format!("tests/fixtures/{n}")).unwrap() }

#[test]
fn browser_and_bouncycastle_signatures_verify_on_chain() {
    let m = f("msg.bin");
    for (who, pk, sig) in [("browser (@noble/post-quantum)", f("noble_pk.bin"), f("noble_sig.bin")), ("BouncyCastle 1.81 (Java)", f("bc_pk.bin"), f("bc_sig.bin"))] {
        let (res, run) = verify_staged(&pk, &sig, &m);
        println!("{who}: result={} txs={} max_cu={} max_tx_bytes={}", res, run.txs, run.max_cu, run.max_bytes);
        for (l, cu) in run.per_stage.iter().filter(|(l, _)| l != "WRITE") { println!("    {l:10} {cu:>9} CU"); }
        assert_eq!(res, RESULT_VERIFIED, "{who}");
        assert!(run.max_cu <= CU_CAP && run.max_bytes <= 1232);
    }
}

#[test]
fn tampering_is_rejected_on_chain() {
    let (pk, m, sig) = (f("noble_pk.bin"), f("msg.bin"), f("noble_sig.bin"));
    let mut m2 = m.clone(); m2[3] ^= 1;
    assert_eq!(verify_staged(&pk, &sig, &m2).0, RESULT_REJECTED, "tampered message");
    let mut s2 = sig.clone(); s2[2000] ^= 1;
    assert_eq!(verify_staged(&pk, &s2, &m).0, RESULT_REJECTED, "tampered signature (z)");
    let mut s3 = sig.clone(); s3[0] ^= 1;
    assert_eq!(verify_staged(&pk, &s3, &m).0, RESULT_REJECTED, "tampered signature (c~)");
    assert_eq!(verify_staged(&f("bc_pk.bin"), &sig, &m).0, RESULT_REJECTED, "wrong key");
}

#[test]
fn protocol_guards() {
    let (pk, m, sig) = (f("noble_pk.bin"), f("msg.bin"), f("noble_sig.bin"));
    let (mut svm, id, payer) = setup();
    let buf = buffer(&mut svm, id);
    let mut run = Run { txs: 0, max_cu: 0, max_bytes: 0, per_stage: vec![] };
    send(&mut svm, id, buf, &payer, [vec![IX_INIT], (m.len() as u16).to_le_bytes().to_vec()].concat(), "INIT", &mut run).unwrap();
    let other = Keypair::new();
    svm.airdrop(&other.pubkey(), 1_000_000_000).unwrap();
    assert!(send(&mut svm, id, buf, &other, vec![IX_WRITE, 0, 0, 1, 2, 3], "WRITE by stranger", &mut run).is_err(), "only the authority writes");
    let data = [&pk[..], &sig[..], &m[..]].concat();
    for (i, ch) in data.chunks(CHUNK).enumerate() {
        send(&mut svm, id, buf, &payer, [vec![IX_WRITE], ((i * CHUNK) as u16).to_le_bytes().to_vec(), ch.to_vec()].concat(), "WRITE", &mut run).unwrap();
    }
    assert!(send(&mut svm, id, buf, &payer, vec![IX_ROWS, 0, 2], "ROWS before PREP", &mut run).is_err(), "stage order");
    send(&mut svm, id, buf, &payer, vec![IX_PREP], "PREP", &mut run).unwrap();
    assert!(send(&mut svm, id, buf, &payer, vec![IX_WRITE, 0, 0, 9], "WRITE after seal", &mut run).is_err(), "sealed input is immutable");
    assert!(send(&mut svm, id, buf, &payer, vec![IX_ROWS, 2, 2], "ROWS out of order", &mut run).is_err(), "no gaps");
    send(&mut svm, id, buf, &payer, vec![IX_ROWS, 0, 2], "ROWS 0-1", &mut run).unwrap();
    assert!(send(&mut svm, id, buf, &payer, vec![IX_ROWS, 0, 2], "ROWS repeated", &mut run).is_err(), "no repeats");
    assert!(send(&mut svm, id, buf, &payer, vec![IX_INIT, 0, 0], "re-INIT", &mut run).is_err(), "no re-init");
}
