//! The program's line of sight against the site's own (tests/fixtures.rs, generated from web/app/ephem.js and
//! web/app/model.js): same elevation, azimuth and skyline, and the same in-view answer, for 7 sites x 10 hours.
//! Inputs go through the same encoding the client uses, so quantization is part of the test.
mod fixtures;
use fixtures::{CASES, SITES};
use los_onchain::{line_of_sight, parse, HEADER, TAG_LOS};

fn encode(s: &fixtures::Site, c: &fixtures::Case) -> Vec<u8> {
    let mut d = vec![TAG_LOS];
    for v in [s.lat_ude, s.lon_ude, s.elev_m, c.elat_ude, c.elon_ude] { d.extend_from_slice(&v.to_le_bytes()); }
    d.extend_from_slice(&c.edist_m.to_le_bytes());
    d.extend_from_slice(&c.hour.to_le_bytes());
    d.extend_from_slice(&(s.hz_mdeg.len() as u16).to_le_bytes());
    for h in s.hz_mdeg { d.extend_from_slice(&h.to_le_bytes()); }
    assert_eq!(d.len(), HEADER + 2 * s.hz_mdeg.len());
    d
}

#[test]
fn matches_the_site_for_every_fixture() {
    let (mut worst_el, mut worst_az) = (0f64, 0f64);
    for c in CASES {
        let s = &SITES[c.site];
        let r = line_of_sight(&parse(&encode(s, c)).expect("valid instruction"));
        let daz = { let d = (r.az - c.az).abs(); d.min(360.0 - d) };
        worst_el = worst_el.max((r.el - c.el).abs());
        worst_az = worst_az.max(daz);
        assert!((r.el - c.el).abs() < 0.002, "{} hour {}: elevation {} vs site {}", s.name, c.hour, r.el, c.el);
        assert!(daz < 0.01, "{} hour {}: azimuth {} vs site {}", s.name, c.hour, r.az, c.az);
        assert!((r.sky - c.sky).abs() < 0.001, "{} hour {}: skyline {} vs site {}", s.name, c.hour, r.sky, c.sky);
        // the answer may only differ where the site itself is within quantization of the skyline
        if (c.el - c.sky).abs() > 0.002 { assert_eq!(r.in_view, c.visible, "{} hour {}: in view", s.name, c.hour); }
    }
    println!("{} cases; worst elevation difference {:.6} deg, worst azimuth difference {:.6} deg", CASES.len(), worst_el, worst_az);
}

#[test]
fn both_answers_occur() {
    let seen: Vec<bool> = CASES.iter().map(|c| line_of_sight(&parse(&encode(&SITES[c.site], c)).unwrap()).in_view).collect();
    assert!(seen.iter().any(|&v| v) && seen.iter().any(|&v| !v), "the fixtures must include Earth in view and hidden");
}

#[test]
fn rejects_malformed_input() {
    let (s, c) = (&SITES[0], &CASES[0]);
    let good = encode(s, c);
    assert!(parse(&good).is_some());
    assert!(parse(&good[..good.len() - 1]).is_none(), "truncated skyline");
    let mut bad = good.clone(); bad[0] = 2; assert!(parse(&bad).is_none(), "unknown tag");
    let mut bad = good.clone(); bad[1..5].copy_from_slice(&91_000_000i32.to_le_bytes()); assert!(parse(&bad).is_none(), "latitude > 90");
    let mut bad = good.clone(); bad[21..25].copy_from_slice(&1_000_000u32.to_le_bytes()); assert!(parse(&bad).is_none(), "Earth 1,000 km away");
    let mut bad = good.clone(); bad[29..31].copy_from_slice(&0u16.to_le_bytes()); assert!(parse(&bad[..HEADER]).is_none(), "no skyline");
    assert!(parse(&[]).is_none());
}
