"""
Gate comm/power windows by the real LOLA terrain horizon and show the effect.

spherical:  body visible iff elevation > 0
terrain:    body visible iff elevation > horizon(azimuth)   [LOLA ray-cast]

Both use real JPL Horizons az/el. Prints before/after coverage per site, which
is the proof that terrain changes the answer (the gap the serious teams closed).
"""
import os, sys, re, json
import numpy as np
from datetime import datetime
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from horizons import fetch_body  # noqa
from windows import find_windows  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
TERR = json.load(open(os.path.join(HERE, "..", "data", "lola", "horizons_terrain.json")))

SITES = {"connecting_ridge": (-89.45, 222.69), "malapert_massif": (-85.964, 357.681), "de_gerlache_rim2": (-88.5157, 298.833), "peak_near_shackleton": (-89.0118, 131.279)}
START, STOP, STEP = "2026-02-01", "2026-03-03", "60 min"


def parse_azel(text):
    m = re.search(r"\$\$SOE\n(.*?)\$\$EOE", text, re.S)
    times, az, el = [], [], []
    for line in m.group(1).strip().splitlines():
        parts = [p.strip() for p in line.split(",")]
        fl = [p for p in parts if re.fullmatch(r"[-+]?\d+\.\d+", p)]
        if len(fl) < 2:
            continue
        az.append(float(fl[-2])); el.append(float(fl[-1]))
        times.append(parts[0])
    return np.array(az), np.array(el)


def horizon_at(prof, az):
    nb = len(prof)
    idx = np.minimum((az % 360.0 / (360.0 / nb)).astype(int), nb - 1)
    return prof[idx]


def cov(mask):
    return 100.0 * mask.mean()


if __name__ == "__main__":
    print(f"{'site':16s} | {'COMM sph':>8s} {'COMM terr':>9s} | {'POWER sph':>9s} {'POWER terr':>10s}")
    print("-" * 64)
    out = {}
    for name, (lat, lon) in SITES.items():
        prof = np.array(TERR[name]["horizon_deg"])
        eaz, eel = parse_azel(fetch_body("earth", lat, lon, START, STOP, STEP))
        saz, sel = parse_azel(fetch_body("sun", lat, lon, START, STOP, STEP))
        n = min(len(eel), len(sel))
        eaz, eel, saz, sel = eaz[:n], eel[:n], saz[:n], sel[:n]
        comm_sph = eel > 0
        comm_terr = eel > horizon_at(prof, eaz)
        power_sph = sel > 0
        power_terr = sel > horizon_at(prof, saz)
        print(f"{name:16s} | {cov(comm_sph):7.1f}% {cov(comm_terr):8.1f}% | "
              f"{cov(power_sph):8.1f}% {cov(power_terr):9.1f}%")
        out[name] = dict(comm_sph=round(cov(comm_sph), 1), comm_terr=round(cov(comm_terr), 1),
                         power_sph=round(cov(power_sph), 1), power_terr=round(cov(power_terr), 1))
    json.dump(out, open(os.path.join(HERE, "..", "data", "lola", "terrain_effect.json"), "w"))
    print("\nterrain gating applied with real LOLA 240 m/px horizon + JPL Horizons az/el.")
