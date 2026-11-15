"""Export per-site data for the console: real JPL Horizons az/el, the real LOLA
terrain horizon, and BOTH flat-horizon and terrain-gated comm/power windows
(so the UI can show the contrast). Writes web/windows_data.js."""
import os, sys, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from horizons import fetch_body        # noqa
from windows import find_windows       # noqa
from terrain_windows import parse_azel, horizon_at  # noqa
from lola_horizon import site_slope_deg  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "web", "windows_data.js")
TERR = json.load(open(os.path.join(HERE, "..", "data", "lola", "horizons_terrain.json")))

# Artemis III candidate landing regions (NASA 2022 list). Connecting Ridge hosts MoonDAO's
# Moon Base Zero. Malapert Massif is NASA's best-case Earth-visibility reference site.
SITES = [
    {"id": "connecting_ridge",     "name": "Connecting Ridge · Moon Base Zero", "lat": -89.45,   "lon": 222.69},
    {"id": "malapert_massif",      "name": "Malapert Massif · Artemis III",     "lat": -85.964,  "lon": 357.681},
    {"id": "de_gerlache_rim2",     "name": "de Gerlache Rim 2 · Artemis III",   "lat": -88.5157, "lon": 298.833},
    {"id": "peak_near_shackleton", "name": "Peak Near Shackleton · Artemis III", "lat": -89.0118, "lon": 131.279},
]
START, STOP, STEP = "2026-02-01", "2026-03-03", "60 min"


def win_list(mask, t_h):
    return [{"start_h": round(w.start_h, 2), "end_h": round(w.end_h, 2), "dur_h": round(w.dur_h, 2)}
            for w in find_windows(np.asarray(mask), t_h)]


def longest_false_run(mask):
    """longest consecutive stretch where mask is False, in hours (1 sample = 1 h)."""
    m = ~np.asarray(mask); best = cur = 0
    for v in m:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return int(best)


def longest_true_run(mask):
    m = np.asarray(mask); best = cur = 0
    for v in m:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return int(best)


def main():
    out = {"period": {"start": START, "stop": STOP, "step": STEP},
           "source": "JPL Horizons / DE441 + LOLA terrain horizon (LDEM_75S_240M)", "sites": []}
    for s in SITES:
        eaz, eel = parse_azel(fetch_body("earth", s["lat"], s["lon"], START, STOP, STEP))
        saz, sel = parse_azel(fetch_body("sun", s["lat"], s["lon"], START, STOP, STEP))
        n = min(len(eel), len(sel))
        eaz, eel, saz, sel = eaz[:n], eel[:n], saz[:n], sel[:n]
        t_h = np.arange(n, dtype=float)  # 60-min steps -> hours index == step count
        t_h = t_h * 1.0
        prof = np.array(TERR[s["id"]]["horizon_deg"])
        eh = horizon_at(prof, eaz); sh = horizon_at(prof, saz)
        comm_flat, comm_terr = eel > 0, eel > eh
        power_flat, power_terr = sel > 0, sel > sh
        out["sites"].append({
            "id": s["id"], "name": s["name"], "lat": s["lat"], "lon": s["lon"],
            "site_elev_m": TERR[s["id"]]["site_elev_m"],
            "t_h": [round(float(x), 2) for x in t_h],
            "earth_el": [round(float(x), 3) for x in eel],
            "sun_el": [round(float(x), 3) for x in sel],
            "earth_az": [round(float(x), 1) for x in eaz],   # azimuth for the sky view
            "sun_az": [round(float(x), 1) for x in saz],
            "earth_horizon": [round(float(x), 3) for x in eh],  # terrain horizon along Earth's track
            "sun_horizon": [round(float(x), 3) for x in sh],
            "horizon_deg": [round(float(x), 2) for x in prof],   # full 360 profile
            "comm_windows": win_list(comm_terr, t_h),
            "power_windows": win_list(power_terr, t_h),
            "comm_windows_flat": win_list(comm_flat, t_h),
            "power_windows_flat": win_list(power_flat, t_h),
            "comm_cov": round(float(comm_terr.mean()), 4),
            "power_cov": round(float(power_terr.mean()), 4),
            # operational survival metrics (the numbers planners actually weigh)
            "longest_dark_h": longest_false_run(power_terr),       # battery must survive this
            "longest_blackout_h": longest_false_run(comm_terr),    # comm autonomy needed for this
            "longest_contact_h": longest_true_run(comm_terr),
            "longest_sun_h": longest_true_run(power_terr),
            "slope_deg": round(site_slope_deg(s["lat"], s["lon"]), 2),  # descent hazard
            "comm_cov_flat": round(float(comm_flat.mean()), 4),
            "power_cov_flat": round(float(power_flat.mean()), 4),
            "earth_el_range": [round(float(eel.min()), 2), round(float(eel.max()), 2)],
            "sun_el_range": [round(float(sel.min()), 2), round(float(sel.max()), 2)],
        })
        d = out["sites"][-1]
        print(f"  {s['id']:16s} comm {d['comm_cov_flat']*100:4.0f}%->{d['comm_cov']*100:4.0f}%  "
              f"power {d['power_cov_flat']*100:4.0f}%->{d['power_cov']*100:4.0f}%  elev {d['site_elev_m']}m")
    with open(OUT, "w") as f:
        f.write("window.LUNAR_DATA = " + json.dumps(out) + ";\n")
    print("escrito:", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
