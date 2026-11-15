//! The compiled program in the Solana VM (LiteSVM): the log line and the return data agree with the site's answer
//! for every fixture, inside the default compute budget. Build first: cargo build-sbf (the .so path is in LOS_SO).
mod fixtures;
use fixtures::{CASES, SITES};
use litesvm::LiteSVM;
use solana_sdk::{instruction::Instruction, pubkey::Pubkey, signature::{Keypair, Signer}, transaction::Transaction};

fn encode(s: &fixtures::Site, c: &fixtures::Case) -> Vec<u8> {
    let mut d = vec![1u8];
    for v in [s.lat_ude, s.lon_ude, s.elev_m, c.elat_ude, c.elon_ude] { d.extend_from_slice(&v.to_le_bytes()); }
    d.extend_from_slice(&c.edist_m.to_le_bytes());
    d.extend_from_slice(&c.hour.to_le_bytes());
    d.extend_from_slice(&(s.hz_mdeg.len() as u16).to_le_bytes());
    for h in s.hz_mdeg { d.extend_from_slice(&h.to_le_bytes()); }
    d
}

#[test]
fn every_fixture_in_the_svm() {
    let so = std::env::var("LOS_SO").unwrap_or_else(|_| "../mldsa-onchain/target/deploy/los_onchain.so".into());
    let id = Pubkey::new_unique();
    let mut svm = LiteSVM::new();
    svm.add_program_from_file(id, &so).expect("cargo build-sbf first");
    let payer = Keypair::new();
    svm.airdrop(&payer.pubkey(), 10_000_000_000).unwrap();
    let (mut max_cu, mut max_bytes) = (0u64, 0usize);
    for (k, c) in CASES.iter().enumerate() {
        let s = &SITES[c.site];
        let ix = Instruction { program_id: id, accounts: vec![], data: encode(s, c) };
        let tx = Transaction::new_signed_with_payer(&[ix], Some(&payer.pubkey()), &[&payer], svm.latest_blockhash());
        max_bytes = max_bytes.max(bincode_len(&tx));
        let meta = svm.send_transaction(tx).unwrap_or_else(|f| panic!("case {k}: {:?}", f.meta.logs));
        max_cu = max_cu.max(meta.compute_units_consumed);
        let line = meta.logs.iter().find(|l| l.contains("moonseal: Earth")).expect("the program logs its answer").clone();
        let rd = &meta.return_data.data;
        assert_eq!(rd.len(), 17);
        let in_view = rd[0] == 1;
        assert_eq!(line.contains("IN VIEW"), in_view);
        if (c.el - c.sky).abs() > 0.002 { assert_eq!(in_view, c.visible, "{} hour {}: {}", s.name, c.hour, line); }
        let el = i32::from_le_bytes(rd[1..5].try_into().unwrap()) as f64 / 1000.0;
        assert!((el - c.el).abs() < 0.002, "{} hour {}: elevation {} vs site {}", s.name, c.hour, el, c.el);
        svm.expire_blockhash();
    }
    println!("{} cases in the SVM; at most {} compute units and {} bytes per transaction", CASES.len(), max_cu, max_bytes);
    assert!(max_cu < 200_000, "fits the default compute budget");
    assert!(max_bytes <= 1232, "fits one transaction");
}

fn bincode_len(tx: &Transaction) -> usize { bincode::serialize(tx).map(|v| v.len()).unwrap_or(usize::MAX) }
