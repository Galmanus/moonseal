"""One-year (2026) site statistics with the terrain horizon (unclamped, see lola_horizon.py).

Input: direct topocentric JPL Horizons az/el per site (target Sun 10 / Earth 399,
center coord@301 at the site, 2026-01-01..2027-01-01, 60 min) cached as text files in
--cache (h_{sun,earth}_<lat>_<lon>.txt), plus data/lola/horizons_terrain.json.
Writes web/site_stats.js: window.LUNAR_STATS.

usage: python3 -I core/export_stats.py data/horizons_year
"""
import os, sys, json
from datetime import datetime, timedelta, timezone
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from terrain_windows import parse_azel, horizon_at  # noqa: E402

OUT = os.path.join(HERE, "..", "web", "site_stats.js")
_src = open(os.path.join(HERE, "..", "web", "sites_data.js")).read()
SITES = json.loads(_src[_src.index("["):_src.rindex("]") + 1])   # window.LUNAR_SITES
T0 = datetime(2026, 1, 1, tzinfo=timezone.utc)
BLOCK = 720  # 30 days of hourly samples


def runs(mask):
    """(start_idx, length) of every True run."""
    out, st, cur = [], 0, 0
    for i, v in enumerate(mask):
        if v:
            if cur == 0:
                st = i
            cur += 1
        elif cur:
            out.append((st, cur)); cur = 0
    if cur:
        out.append((st, cur))
    return out


def longest(mask):
    r = runs(mask)
    return max(r, key=lambda x: x[1]) if r else (0, 0)


def iso(h):
    return (T0 + timedelta(hours=int(h))).strftime("%Y-%m-%dT%H:%MZ")


def site_stats(cache, site):
    lat, lon = site["lat"], site["lon"]
    # terrain:false -> bare sphere seen from the surface: horizon 0 deg everywhere
    prof = np.array(site["horizon_deg"]) if site["terrain"] else np.zeros(360)
    eaz, eel = parse_azel(open(os.path.join(cache, f"h_earth_{lat}_{lon}.txt")).read())
    saz, sel = parse_azel(open(os.path.join(cache, f"h_sun_{lat}_{lon}.txt")).read())
    n = min(len(eel), len(sel))
    eaz, eel, saz, sel = eaz[:n], eel[:n], saz[:n], sel[:n]
    e_margin = eel - horizon_at(prof, eaz)
    s_margin = sel - horizon_at(prof, saz)
    comm, power = e_margin > 0, s_margin > 0
    both = comm & power
    d_st, d_len = longest(~power)
    b_st, b_len = longest(~comm)
    blocks = []
    for i in range(0, n - BLOCK + 1, BLOCK):
        sl = slice(i, i + BLOCK)
        blocks.append({"start": iso(i)[:10], "sun_pct": round(100 * float(power[sl].mean()), 1),
                       "earth_pct": round(100 * float(comm[sl].mean()), 1),
                       "longest_dark_h": longest(~power[sl])[1],
                       "longest_blackout_h": longest(~comm[sl])[1]})
    top = sorted(runs(both), key=lambda x: -x[1])[:3]
    return {
        "lat": lat, "lon": lon, "terrain": site["terrain"], "n_hours": int(n),
        "sun_pct": round(100 * float(power.mean()), 1),
        "earth_pct": round(100 * float(comm.mean()), 1),
        "sun_and_earth_pct": round(100 * float(both.mean()), 1),
        "longest_dark_h": int(d_len), "longest_dark_start": iso(d_st) if d_len else None,
        "longest_blackout_h": int(b_len), "longest_blackout_start": iso(b_st) if b_len else None,
        "min_sun_margin_deg": round(float(s_margin.min()), 2),
        "min_earth_margin_deg": round(float(e_margin.min()), 2),
        "blocks_30d": blocks,
        "best_windows": [{"start": iso(s), "end": iso(s + L), "hours": int(L), "days": round(L / 24, 1)}
                         for s, L in top],
    }


def main():
    cache = sys.argv[1]
    out = {"period": {"start": iso(0), "stop": "2027-01-01T00:00Z", "step_h": 1},
           "source": "JPL Horizons DE441 topocentric az/el (coord@301) + LOLA LDEM_75S_240M terrain horizon (unclamped)",
           "notes": "visible = elevation > terrain horizon at that azimuth (1-deg bins). runs are truncated at the period edges. "
                    "best_windows = longest continuous stretches with BOTH Sun and Earth visible.",
           "sites": {}}
    for site in SITES:
        sid = site["id"]
        if not os.path.exists(os.path.join(cache, f"h_sun_{site['lat']}_{site['lon']}.txt")):
            print(f"{sid:22s} (no cached Horizons year for this site: skipped; browser computes it)")
            continue
        s = site_stats(cache, site)
        out["sites"][sid] = s
        bw = ", ".join(f"{w['days']} d from {w['start'][:10]}" for w in s["best_windows"])
        print(f"{sid:22s} sun {s['sun_pct']:5.1f}%  earth {s['earth_pct']:5.1f}%  both {s['sun_and_earth_pct']:5.1f}%  "
              f"dark {s['longest_dark_h']:5d} h  blackout {s['longest_blackout_h']:4d} h  "
              f"margins sun {s['min_sun_margin_deg']:+.2f} earth {s['min_earth_margin_deg']:+.2f}")
        print(f"{'':22s} sun% per 30d {[b['sun_pct'] for b in s['blocks_30d']]}")
        print(f"{'':22s} earth% per 30d {[b['earth_pct'] for b in s['blocks_30d']]}")
        print(f"{'':22s} best sun+Earth: {bw}")
    with open(OUT, "w") as f:
        f.write("window.LUNAR_STATS = " + json.dumps(out, separators=(",", ":")) + ";\n")
    print("written:", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
