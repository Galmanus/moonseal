//! moonseal line of sight: is Earth in view from a point on the Moon at a given hour?
//!
//! Computed inside the transaction, with the site's own geometry (web/app/ephem.js `azel`, web/app/model.js `hzAt`):
//! a Moon-fixed frame (MOON_ME, the LOLA frame, sphere R = 1737.4 km), Earth's direction from the sub-Earth point
//! and the Earth-Moon distance (JPL Horizons DE441), topocentric parallax from the site's radius, and the site's
//! terrain skyline (LRO LOLA) in equal azimuth bins, nearest-lower bin. Earth is in view when its centre clears the
//! skyline. The inputs travel in the instruction, so anyone can re-run the same arithmetic.
//!
//! Instruction data, little-endian, 31 + 2n bytes:
//!   u8 tag = 1 | i32 site latitude (µdeg) | i32 site longitude east (µdeg) | i32 site elevation (m)
//!   | i32 sub-Earth latitude (µdeg) | i32 sub-Earth longitude east (µdeg) | u32 Earth distance (m)
//!   | u32 hour since 2026-01-01T00Z | u16 n | i16 skyline[n] (millidegrees)
//! Output: one log line, and return data [in view u8, then elevation, azimuth, skyline, margin as i32 millidegrees].
#![allow(unexpected_cfgs)]

use solana_program::{
    account_info::AccountInfo, entrypoint::ProgramResult, msg, program::set_return_data, program_error::ProgramError, pubkey::Pubkey,
};

#[cfg(not(feature = "no-entrypoint"))]
solana_program::entrypoint!(process);

pub const TAG_LOS: u8 = 1;
pub const R_MOON_KM: f64 = 1737.4;
pub const HEADER: usize = 31;
pub const MAX_BINS: usize = 720;

pub struct Query {
    pub lat: f64,
    pub lon: f64,
    pub elev_m: f64,
    pub earth_lat: f64,
    pub earth_lon: f64,
    pub earth_dist_km: f64,
    pub hour: u32,
    pub skyline: Vec<f64>,
}

pub struct Los {
    pub in_view: bool,
    pub el: f64,
    pub az: f64,
    pub sky: f64,
    pub margin: f64,
}

fn i32_at(d: &[u8], o: usize) -> Option<i32> { d.get(o..o + 4).and_then(|b| b.try_into().ok()).map(i32::from_le_bytes) }
fn u32_at(d: &[u8], o: usize) -> Option<u32> { d.get(o..o + 4).and_then(|b| b.try_into().ok()).map(u32::from_le_bytes) }

/// Decode and range-check the instruction. None for anything malformed or physically impossible.
pub fn parse(d: &[u8]) -> Option<Query> {
    if d.len() < HEADER || d[0] != TAG_LOS { return None; }
    let n = u16::from_le_bytes(d[29..31].try_into().ok()?) as usize;
    if n == 0 || n > MAX_BINS || d.len() != HEADER + 2 * n { return None; }
    let q = Query {
        lat: i32_at(d, 1)? as f64 * 1e-6,
        lon: i32_at(d, 5)? as f64 * 1e-6,
        elev_m: i32_at(d, 9)? as f64,
        earth_lat: i32_at(d, 13)? as f64 * 1e-6,
        earth_lon: i32_at(d, 17)? as f64 * 1e-6,
        earth_dist_km: u32_at(d, 21)? as f64 / 1000.0,
        hour: u32_at(d, 25)?,
        skyline: (0..n).map(|i| i16::from_le_bytes([d[HEADER + 2 * i], d[HEADER + 2 * i + 1]]) as f64 / 1000.0).collect(),
    };
    let lat_ok = (-90.0..=90.0).contains(&q.lat) && (-90.0..=90.0).contains(&q.earth_lat);
    let dist_ok = (340_000.0..=420_000.0).contains(&q.earth_dist_km);   // perigee to apogee, with margin
    let elev_ok = (-12_000.0..=12_000.0).contains(&q.elev_m);
    if lat_ok && dist_ok && elev_ok { Some(q) } else { None }
}

fn unit(lat_deg: f64, lon_deg: f64) -> [f64; 3] {
    let (la, lo) = (lat_deg.to_radians(), lon_deg.to_radians());
    let cl = libm::cos(la);
    [cl * libm::cos(lo), cl * libm::sin(lo), libm::sin(la)]
}
fn dot(a: &[f64; 3], b: &[f64; 3]) -> f64 { a[0] * b[0] + a[1] * b[1] + a[2] * b[2] }

/// The line of sight, exactly as the site computes it (ephem.js `azel` for Earth, model.js `hzAt` for the skyline).
pub fn line_of_sight(q: &Query) -> Los {
    let (la, lo) = (q.lat.to_radians(), q.lon.to_radians());
    let up = unit(q.lat, q.lon);
    let east = [-libm::sin(lo), libm::cos(lo), 0.0];
    let north = [-libm::sin(la) * libm::cos(lo), -libm::sin(la) * libm::sin(lo), libm::cos(la)];
    let r = R_MOON_KM + q.elev_m / 1000.0;
    let eu = unit(q.earth_lat, q.earth_lon);
    let v = [eu[0] * q.earth_dist_km - up[0] * r, eu[1] * q.earth_dist_km - up[1] * r, eu[2] * q.earth_dist_km - up[2] * r];
    let (e, n, u) = (dot(&v, &east), dot(&v, &north), dot(&v, &up));
    let mut az = libm::atan2(e, n).to_degrees();
    if az < 0.0 { az += 360.0; }
    let el = libm::atan2(u, libm::sqrt(e * e + n * n)).to_degrees();
    let nb = q.skyline.len();
    let wrapped = libm::fmod(libm::fmod(az, 360.0) + 360.0, 360.0);
    let bin = libm::floor(wrapped / (360.0 / nb as f64)) as usize;
    let sky = q.skyline[bin.min(nb - 1)];
    let margin = el - sky;
    Los { in_view: margin > 0.0, el, az, sky, margin }
}

fn mdeg(x: f64) -> i32 { libm::round(x * 1000.0) as i32 }
fn deg(x: f64) -> String {
    let m = mdeg(x) as i64;
    format!("{}{}.{:03}", if m < 0 { "-" } else { "" }, m.abs() / 1000, m.abs() % 1000)
}

pub fn process(_program_id: &Pubkey, _accounts: &[AccountInfo], data: &[u8]) -> ProgramResult {
    let q = parse(data).ok_or(ProgramError::InvalidInstructionData)?;
    let r = line_of_sight(&q);
    msg!(
        "moonseal: Earth {} from lat {} lon {} at hour {}: elevation {} deg, skyline {} deg at azimuth {} deg, margin {} deg",
        if r.in_view { "IN VIEW" } else { "HIDDEN" }, deg(q.lat), deg(q.lon), q.hour, deg(r.el), deg(r.sky), deg(r.az), deg(r.margin)
    );
    let mut out = Vec::with_capacity(17);
    out.push(r.in_view as u8);
    for x in [r.el, r.az, r.sky, r.margin] { out.extend_from_slice(&mdeg(x).to_le_bytes()); }
    set_return_data(&out);
    Ok(())
}
