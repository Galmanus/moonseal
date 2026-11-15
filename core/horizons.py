"""
Real NASA/JPL data engine (v1) for challenge #11.

Queries the JPL Horizons API (the source the challenge names) for the apparent
elevation of the Sun (10) and Earth (399) as seen from a geodetic site on the
Moon (center coord@301), then derives direct-to-Earth comm windows and solar
power windows from REAL DE441 ephemeris.

This replaces the analytic approximation in windows.py. Raw responses are
cached under data/ so the demo never depends on a live network connection.

Horizons observer-table CSV line looks like:
  2026-Feb-01 00:00,*,i,  15.647065,     1.245313,
columns: date, (marker), (marker), apparent azimuth, apparent elevation
"""
from __future__ import annotations
import os, sys, re, json, urllib.parse, urllib.request
from datetime import datetime

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from windows import find_windows, Window  # noqa: E402

HORIZONS = "https://ssd.jpl.nasa.gov/api/horizons.api"
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")

BODIES = {"sun": "10", "earth": "399"}


def _cache_path(body: str, lat: float, lon: float, start: str, stop: str, step: str) -> str:
    key = f"{body}_lat{lat}_lon{lon}_{start}_{stop}_{step}".replace(" ", "").replace(":", "")
    return os.path.join(DATA_DIR, f"horizons_{key}.txt")


def fetch_body(body: str, lat: float, lon: float, start: str, stop: str,
               step: str = "60 min", use_cache: bool = True) -> str:
    os.makedirs(DATA_DIR, exist_ok=True)
    cp = _cache_path(body, lat, lon, start, stop, step)
    if use_cache and os.path.exists(cp):
        with open(cp) as f:
            return f.read()
    params = {
        "format": "text", "COMMAND": f"'{BODIES[body]}'",
        "MAKE_EPHEM": "'YES'", "EPHEM_TYPE": "'OBSERVER'",
        "CENTER": "'coord@301'", "COORD_TYPE": "'GEODETIC'",
        "SITE_COORD": f"'{lon},{lat},0'",
        "START_TIME": f"'{start}'", "STOP_TIME": f"'{stop}'",
        "STEP_SIZE": f"'{step}'", "QUANTITIES": "'4'",
        "CSV_FORMAT": "'YES'", "ANG_FORMAT": "'DEG'",
    }
    url = HORIZONS + "?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=60) as r:
        text = r.read().decode("utf-8", "replace")
    with open(cp, "w") as f:
        f.write(text)
    return text


def parse_elevation(text: str):
    """Return (times:list[datetime], elev:list[float]) from a Horizons table."""
    m = re.search(r"\$\$SOE\n(.*?)\$\$EOE", text, re.S)
    if not m:
        raise ValueError("Horizons: no $$SOE..$$EOE block (query error?)")
    times, elev = [], []
    for line in m.group(1).strip().splitlines():
        parts = [p.strip() for p in line.split(",")]
        floats = [p for p in parts if re.fullmatch(r"[-+]?\d+\.\d+", p)]
        if len(floats) < 2:
            continue
        el = float(floats[-1])            # elevation is the last float (azi is -2)
        t = datetime.strptime(parts[0], "%Y-%b-%d %H:%M")
        times.append(t); elev.append(el)
    return times, elev


def analyze_real(lat: float, lon: float, start: str, stop: str, step: str = "60 min",
                 earth_mask_deg: float = 0.0, sun_mask_deg: float = 0.0,
                 use_cache: bool = True):
    te, ee = parse_elevation(fetch_body("earth", lat, lon, start, stop, step, use_cache))
    ts, es = parse_elevation(fetch_body("sun", lat, lon, start, stop, step, use_cache))
    n = min(len(te), len(ts))
    t0 = te[0]
    t_h = [ (te[i] - t0).total_seconds() / 3600.0 for i in range(n) ]
    comm = [ ee[i] > earth_mask_deg for i in range(n) ]
    power = [ es[i] > sun_mask_deg for i in range(n) ]
    import numpy as np
    return {
        "t_h": np.array(t_h),
        "earth_el": np.array(ee[:n]), "sun_el": np.array(es[:n]),
        "comm_windows": find_windows(np.array(comm), np.array(t_h)),
        "power_windows": find_windows(np.array(power), np.array(t_h)),
        "comm_coverage": sum(comm) / n, "power_coverage": sum(power) / n,
        "earth_el_range": (min(ee[:n]), max(ee[:n])),
        "sun_el_range": (min(es[:n]), max(es[:n])),
        "source": "JPL Horizons / DE441 (real)",
    }


def _summ(wins):
    if not wins:
        return 0, 0.0, 0.0
    durs = [w.dur_h for w in wins]
    return len(wins), max(durs), sum(durs) / len(durs)


if __name__ == "__main__":
    SITE_LAT, SITE_LON = -89.45, 0.0
    START, STOP, STEP = "2026-02-01", "2026-03-03", "60 min"   # ~30 days
    r = analyze_real(SITE_LAT, SITE_LON, START, STOP, STEP)

    print(f"=== REAL (JPL Horizons/DE441) sitio lat={SITE_LAT} lon={SITE_LON} ===")
    print(f"periodo {START} -> {STOP}, passo {STEP}")
    print(f"Earth elevacao: min {r['earth_el_range'][0]:+.2f}  max {r['earth_el_range'][1]:+.2f} deg")
    print(f"Sun   elevacao: min {r['sun_el_range'][0]:+.2f}  max {r['sun_el_range'][1]:+.2f} deg")
    n, lg, me = _summ(r["comm_windows"])
    print(f"\n[COMM] cobertura {r['comm_coverage']*100:.1f}%  janelas {n}  maior {lg:.1f} h  media {me:.1f} h")
    for w in r["comm_windows"][:6]:
        print(f"   t+{w.start_h:8.2f}h -> t+{w.end_h:8.2f}h  ({w.dur_h:6.1f} h)")
    n, lg, me = _summ(r["power_windows"])
    print(f"\n[POWER] cobertura {r['power_coverage']*100:.1f}%  janelas {n}  maior {lg:.1f} h  media {me:.1f} h")
    for w in r["power_windows"][:6]:
        print(f"   t+{w.start_h:8.2f}h -> t+{w.end_h:8.2f}h  ({w.dur_h:6.1f} h)")
