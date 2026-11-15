"""Export the real LOLA south-polar cap as a 3D terrain for the web globe.

Downsamples LDEM_75S_240M onto a GRID x GRID lattice in the polar-stereographic
plane, emits the true planetocentric 3D positions (curved cap, not a flat plane),
per-vertex elevation, and a validity mask (inside the 75 S coverage circle).
Also locates the Artemis III sites on the grid. Writes:
  web/moon_dem.bin   float32: [pos(x,y,z) * G*G] then [elev * G*G]  (km, km)
  web/moon_dem.json  meta + sites (grid uv, lat/lon, metrics mirrored from windows_data)
Units: km, recentered so the south pole sits near the origin; +Z = toward the pole.
"""
import os, sys, json
import numpy as np
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lola_horizon import load_dem, N, R, SCALE, PO, SCALING  # noqa

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = os.path.join(HERE, "..", "web")
GRID = 384                       # output lattice per side
R_KM = R / 1000.0

# sites must match core/export_web.py
SITES = [
    {"id": "connecting_ridge",     "lat": -89.45,   "lon": 222.69},
    {"id": "malapert_massif",      "lat": -85.964,  "lon": 357.681},
    {"id": "de_gerlache_rim2",     "lat": -88.5157, "lon": 298.833},
    {"id": "peak_near_shackleton", "lat": -89.0118, "lon": 131.279},
]


def latlon_to_grid(lat, lon):
    """site (lat,lon) -> fractional (col,row) in the full DEM, then -> [0,GRID-1]."""
    c = np.radians(lat + 90.0)                  # colatitude from south pole
    rho = 2.0 * R * np.tan(c / 2.0)
    lo = np.radians(lon)
    X = rho * np.sin(lo); Y = rho * np.cos(lo)
    col = X / SCALE + PO
    row = PO - Y / SCALE
    u = col / (N - 1) * (GRID - 1)
    v = row / (N - 1) * (GRID - 1)
    return float(u), float(v)


def main():
    d = load_dem()
    step = N // GRID
    sl = slice(0, GRID * step, step)
    lat = d["lat"][sl, sl]; lon = d["lon"][sl, sl]
    elev = d["elev"][sl, sl] / 1000.0           # km (true, for color)
    valid = d["valid"][sl, sl]
    # recompute curved positions with vertical exaggeration so km-scale relief is visible
    EXAG = 25.0
    rad = (R / 1000.0) + (elev * EXAG)          # km, exaggerated along true radial
    la = np.radians(lat); lo = np.radians(lon); cl = np.cos(la)
    Tx = (rad * cl * np.cos(lo)).astype(np.float32)
    Ty = (rad * cl * np.sin(lo)).astype(np.float32)
    Tz = (rad * np.sin(la)).astype(np.float32)

    # recenter so the south pole (0,0,-R) sits at origin; flip so +Z points "up" (toward pole)
    px, py, pz = 0.0, 0.0, -R_KM
    X = (Tx - px); Yy = (Ty - py); Z = -(Tz - pz)   # Z >= 0, grows away from pole surface
    pos = np.stack([X, Yy, Z], axis=-1).astype(np.float32)   # (G,G,3)

    # elevation normalized for color
    ev = elev.copy()
    ev[~valid] = np.nan
    emin = float(np.nanmin(ev)); emax = float(np.nanmax(ev))

    posm = pos.copy(); posm[~valid] = 0.0               # finite everywhere (bounding sphere safe)
    elevm = elev.astype(np.float32).copy(); elevm[~valid] = np.nan   # NaN elev = the disc mask
    buf = np.concatenate([posm.reshape(-1), elevm.reshape(-1)])
    buf.astype("<f4").tofile(os.path.join(WEB, "moon_dem.bin"))

    sites_out = []
    for s in SITES:
        u, v = latlon_to_grid(s["lat"], s["lon"])
        sites_out.append({"id": s["id"], "lat": s["lat"], "lon": s["lon"],
                          "u": round(u, 2), "v": round(v, 2)})

    meta = {
        "grid": GRID, "r_km": round(R_KM, 3), "scale_m": SCALE, "exag": 25.0,
        "elev_min_km": round(emin, 4), "elev_max_km": round(emax, 4),
        "valid_count": int(valid.sum()),
        "layout": "float32 LE: positions[G*G*3] (x,y,z km) then elev[G*G] (km); row-major",
        "sites": sites_out,
    }
    json.dump(meta, open(os.path.join(WEB, "moon_dem.json"), "w"))
    print(f"grid {GRID} step {step} valid {int(valid.sum())}/{GRID*GRID} "
          f"elev {emin:.3f}..{emax:.3f} km")
    print("sites:", [(s['id'], s['u'], s['v']) for s in sites_out])
    print("wrote web/moon_dem.bin", os.path.getsize(os.path.join(WEB, 'moon_dem.bin')), "B")


if __name__ == "__main__":
    main()
