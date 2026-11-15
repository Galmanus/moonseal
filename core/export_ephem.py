"""Site-independent ephemeris for the browser: one JPL Horizons table (target Moon 301,
observer Earth geocenter 500@399, frame MOON_ME, east-longitude positive) with the
sub-Earth point, sub-solar point and Earth-Moon range, hourly 2026-01-01..2028-01-01.

From these three quantities the browser computes Sun/Earth azimuth+elevation for ANY
lunar site and ANY hour (web/app/ephem.js), so custom coordinates and dates need no server.

Writes web/ephem_data.js: window.LUNAR_EPHEM = {t0, step_h, n, sun_lat, sun_lon,
earth_lat, earth_lon, earth_dist_km, frame, source}.
"""
import os, re, json, sys

HERE = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(HERE, "..", "data", "ephem", "moon_subpoints_2026-2028_60min.txt")
OUT = os.path.join(HERE, "..", "web", "ephem_data.js")
NUM = re.compile(r"[-+]?\d+\.\d+(?:E[-+]\d+)?")


def parse(text):
    if "MOON_ME" not in text or "East-longitude positive" not in text:
        sys.exit("unexpected frame/longitude convention in Horizons header")
    body = re.search(r"\$\$SOE\n(.*?)\$\$EOE", text, re.S).group(1)
    rows = []
    for line in body.strip().splitlines():
        parts = [p.strip() for p in line.split(",")]
        nums = [float(p) for p in parts[1:] if NUM.fullmatch(p)]
        if len(nums) < 6:
            continue
        rows.append((parts[0], nums[0], nums[1], nums[2], nums[3], nums[4]))
    return rows


def main():
    rows = parse(open(RAW).read())
    if rows[0][0] != "2026-Jan-01 00:00":
        sys.exit(f"unexpected first epoch {rows[0][0]}")
    out = {"t0": "2026-01-01T00:00:00Z", "step_h": 1, "n": len(rows),
           "frame": "MOON_ME (= LOLA frame), east-longitude positive, sphere R=1737.4 km",
           "source": "JPL Horizons DE441, target 301, center 500@399, QUANTITIES 14,15,20",
           "earth_lon": [round(r[1], 4) for r in rows], "earth_lat": [round(r[2], 4) for r in rows],
           "sun_lon": [round(r[3], 4) for r in rows], "sun_lat": [round(r[4], 4) for r in rows],
           "earth_dist_km": [round(r[5], 1) for r in rows]}
    with open(OUT, "w") as f:
        f.write("window.LUNAR_EPHEM = " + json.dumps(out, separators=(",", ":")) + ";\n")
    print(f"rows {len(rows)}  first {rows[0][0]}  last {rows[-1][0]}  ->  {OUT} {os.path.getsize(OUT)} bytes")


if __name__ == "__main__":
    main()
