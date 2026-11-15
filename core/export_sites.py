"""Curated landing sites for the browser (web/sites_data.js: window.LUNAR_SITES).

Every coordinate below was read from the cited page; none is invented. Longitudes are
stored east-positive in [0, 360). Sites inside the LOLA LDEM_75S_240M coverage
(lat <= -75) get a ray-cast terrain horizon (unclamped, 360 x 1-deg bins, azimuth N=0 E=90)
and a DEM slope; sites outside it get terrain:false and an empty horizon (sphere only).
"""
import os, sys, json
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from lola_horizon import horizon_profile, site_slope_deg  # noqa: E402

OUT = os.path.join(HERE, "..", "web", "sites_data.js")
TERR = json.load(open(os.path.join(HERE, "..", "data", "lola", "horizons_terrain.json")))

ART = "Artemis III candidate regions"
SP = "South-pole landers"
AP = "Apollo (for contrast)"
NSSDC = "https://nssdc.gsfc.nasa.gov/planetary/lunar/lunar_sites.html"
SITES = [
    # the four engine sites; coordinates as cited in core/lola_horizon.py (sources not re-fetched this session)
    dict(id="connecting_ridge", name="Connecting Ridge", group=ART, lat=-89.45, lon=222.69,
         source="Point 89.45 S, 137.31 W on the Connecting Ridge, rounded from the Moon Base Zero location MoonDAO gives",
         note="Shackleton-de Gerlache connecting ridge"),
    dict(id="malapert_massif", name="Malapert Massif", group=ART, lat=-85.964, lon=357.681,
         source="Kring 2025, JGR Planets 2024JE008905 (NASA notional site), per core/lola_horizon.py; not re-verified",
         note="NASA's best-case Earth-visibility region"),
    dict(id="de_gerlache_rim2", name="de Gerlache Rim 2", group=ART, lat=-88.5157, lon=298.833,
         source="https://arxiv.org/abs/2406.19863 (Table 3, pt 726), per core/lola_horizon.py; not re-verified",
         note=""),
    dict(id="peak_near_shackleton", name="Peak Near Shackleton", group=ART, lat=-89.0118, lon=131.279,
         source="https://arxiv.org/abs/2406.19863 (Table 3, pt 1005), per core/lola_horizon.py; not re-verified",
         note=""),
    # actual / intended south-pole landings
    dict(id="im1_odysseus", name="IM-1 Odysseus (landed 2024)", group=SP, lat=-80.13, lon=1.44,
         source="https://www.nasa.gov/missions/lro/nasas-lro-images-intuitive-machines-odysseus-lander/",
         note="NASA: 80.13 S, 1.44 E, elevation 2,579 m (LOLA 240 m DEM: 2,598 m)"),
    dict(id="im2_athena", name="IM-2 Athena (intended site, 2025)", group=SP, lat=-84.78, lon=29.13,
         source="https://www.lroc.asu.edu/images/1401",
         note="LROC: intended site on Mons Mouton; the lander came down ~250 m away"),
    dict(id="chandrayaan3", name="Chandrayaan-3 Vikram (landed 2023)", group=SP, lat=-69.3741, lon=32.32,
         source="https://www.lroc.asu.edu/images/1314", elev_src=532.0,
         note="LROC: 69.3741 S, 32.32 E, 532 m; outside the 75-90 S LOLA polar DEM"),
    # Apollo lunar modules (NSSDC, Wagner et al. 2017, ME/DE421 frame)
    dict(id="apollo11", name="Apollo 11", group=AP, lat=0.67416, lon=23.47314, source=NSSDC, note="Lunar Module"),
    dict(id="apollo12", name="Apollo 12", group=AP, lat=-3.0128, lon=-23.4219, source=NSSDC, note="Lunar Module"),
    dict(id="apollo14", name="Apollo 14", group=AP, lat=-3.64589, lon=-17.47194, source=NSSDC, note="Lunar Module"),
    dict(id="apollo15", name="Apollo 15", group=AP, lat=26.13239, lon=3.63330, source=NSSDC, note="Lunar Module"),
    dict(id="apollo16", name="Apollo 16", group=AP, lat=-8.9734, lon=15.5011, source=NSSDC, note="Lunar Module"),
    dict(id="apollo17", name="Apollo 17", group=AP, lat=20.1911, lon=30.7723, source=NSSDC, note="Lunar Module"),
]


def main():
    out = []
    for s in SITES:
        lon = s["lon"] % 360.0
        terrain = s["lat"] <= -75.0
        if terrain and s["id"] in TERR:          # identical to the engine cache
            prof = TERR[s["id"]]["horizon_deg"]; elev = TERR[s["id"]]["site_elev_m"]
        elif terrain:
            p, elev = horizon_profile(s["lat"], lon)
            prof = [round(float(x), 3) for x in p]
        else:
            prof, elev = [], s.get("elev_src")
        out.append({"id": s["id"], "name": s["name"], "group": s["group"], "lat": s["lat"],
                    "lon": round(lon, 5), "elev_m": None if elev is None else round(float(elev), 1),
                    "slope_deg": round(site_slope_deg(s["lat"], lon), 2) if terrain else None,
                    "terrain": terrain, "horizon_deg": prof, "source": s["source"], "note": s["note"]})
        o = out[-1]
        hz = f"horizon {min(prof):+.2f}..{max(prof):+.2f}" if prof else "sphere only"
        print(f"{o['id']:22s} {o['lat']:+9.4f} {o['lon']:8.4f}  elev {o['elev_m']}  slope {o['slope_deg']}  {hz}")
    with open(OUT, "w") as f:
        f.write("window.LUNAR_SITES = " + json.dumps(out, separators=(",", ":")) + ";\n")
    print("written:", OUT, os.path.getsize(OUT), "bytes")


if __name__ == "__main__":
    main()
