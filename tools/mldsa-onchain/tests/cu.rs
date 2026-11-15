//! LiteSVM: ML-DSA-65 verify cost on SBF. Key and signature come from the browser bundle
//! (@noble/post-quantum), so this is also an interop check against the on-chain verifier.
use litesvm::LiteSVM;
use mldsa_onchain::*;
use solana_compute_budget::compute_budget::ComputeBudget;
use solana_sdk::{
    account::Account, compute_budget::ComputeBudgetInstruction, instruction::{AccountMeta, Instruction},
    pubkey::Pubkey, signature::{Keypair, Signer}, transaction::Transaction,
};

fn run(pk: &[u8], sig: &[u8], m: &[u8], big_budget: bool) -> (bool, u64, Vec<String>) {
    let id = Pubkey::new_unique();
    let mut svm = if big_budget {
        LiteSVM::new().with_compute_budget(ComputeBudget { compute_unit_limit: 50_000_000, heap_size: 256 * 1024, ..ComputeBudget::default() })
    } else { LiteSVM::new() };
    svm.add_program_from_file(id, "target/deploy/mldsa_onchain.so").expect("cargo build-sbf first");
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    // a buffer exactly as INIT + WRITE leave it (current layout, src/lib.rs), then the monolithic VERIFY_ONE
    let buf = Pubkey::new_unique();
    let mut data = vec![0u8; ACCOUNT_LEN];
    data[H_MAGIC] = MAGIC; data[H_VERSION] = 1; data[H_STAGE] = STAGE_WRITING;
    data[H_MSGLEN..H_MSGLEN + 2].copy_from_slice(&(m.len() as u16).to_le_bytes());
    data[H_AUTH..H_AUTH + 32].copy_from_slice(payer.pubkey().as_ref());
    let body = [pk, sig, m].concat();
    data[DATA..DATA + body.len()].copy_from_slice(&body);
    svm.set_account(buf, Account { lamports: 1_000_000_000, data, owner: id, executable: false, rent_epoch: 0 }).unwrap();
    let ix = Instruction { program_id: id, accounts: vec![AccountMeta::new(buf, false), AccountMeta::new(payer.pubkey(), true)], data: vec![IX_VERIFY_ONE] };
    let mut ixs = vec![];
    if !big_budget {
        ixs.push(ComputeBudgetInstruction::set_compute_unit_limit(1_400_000));
        ixs.push(ComputeBudgetInstruction::request_heap_frame(256 * 1024));
    }
    ixs.push(ix);
    let tx = Transaction::new_signed_with_payer(&ixs, Some(&payer.pubkey()), &[&payer], svm.latest_blockhash());
    match svm.send_transaction(tx) {
        Ok(meta) => (true, meta.compute_units_consumed, meta.logs),
        Err(f) => (false, f.meta.compute_units_consumed, f.meta.logs),
    }
}

#[test]
fn mldsa65_verify_cost() {
    let pk = std::fs::read("tests/fixtures/noble_pk.bin").unwrap();
    let sig = std::fs::read("tests/fixtures/noble_sig.bin").unwrap();
    let m = std::fs::read("tests/fixtures/msg.bin").unwrap();
    let (ok, cu, logs) = run(&pk, &sig, &m, false);
    println!("1.4M-capped tx: success={ok} CU={cu}");
    for l in logs.iter().filter(|l| l.contains("consumption") || l.contains("verify") || l.contains("failed") || l.contains("exceeded") || l.contains("Access")) { println!("  {l}"); }
    let (ok2, cu2, logs2) = run(&pk, &sig, &m, true);
    println!("uncapped measure: success={ok2} CU={cu2}");
    for l in logs2.iter().filter(|l| l.contains("consumption") || l.contains("verify") || l.contains("phase") || l.contains("failed") || l.contains("Access")) { println!("  {l}"); }
    let (bok, bcu, _) = run(&std::fs::read("tests/fixtures/bc_pk.bin").unwrap(), &std::fs::read("tests/fixtures/bc_sig.bin").unwrap(), &m, true);
    println!("BouncyCastle (Seeker) signature: success={bok} CU={bcu}");
    assert!(bok, "BouncyCastle signature must verify on-chain");
    let mut bad = m.clone(); bad[3] ^= 1;
    let (ok3, cu3, _) = run(&pk, &sig, &bad, true);
    println!("tampered message: success={ok3} CU={cu3}");
    assert!(ok2, "genuine signature must verify on-chain");
    assert!(!ok3, "tampered message must be rejected on-chain");
}
