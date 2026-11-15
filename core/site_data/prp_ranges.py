# Read the LRO Diviner Polar Resource Product (PDS LRO-L-DLRE-5-PRP-V2.0, DLRE_PRP_SOUTH.TAB, 605 MB) around each site
# with HTTP byte ranges, instead of downloading the table. Layout found by probing rows (each row 210 bytes after a
# 210-byte header): 1200 x 1200 cells, 2 triangles per cell, cells in columns of 1200 ordered by increasing y, columns
# ordered by decreasing x, where x, y are Moon-centred coordinates (km) of triangle vertex 1 (about 0.5 km apart).
# Fields (1-based columns, from the PDS4 label): x1 1/12, y1 15/12, clon 127/15, clat 144/15, calt 161/15,
# temp_avg 178/8 (K, 2 cm down), temp_max 188/8 (K, surface), ice_depth 198/11 (m; 0 = stable at the surface,
# -999 = not stable in the top 2.8738 m).
# usage: python3 -I prp_ranges.py '{"site": [lat, east_lon, elev_m], ...}' > prp_sites.json
import json, math, subprocess, sys

U = 'https://pds-geosciences.wustl.edu/lro/urn-nasa-pds-lro_diviner_derived1/data_derived_prp/dlre_prp_south.tab'
N, ROW, R = 1200, 210, 1737.4

def get(a, b):
    out = subprocess.run(['curl', '-s', '--retry', '3', '-r', '%d-%d' % (a, b), U], capture_output=True, check=True).stdout
    assert len(out) == b - a + 1, (a, b, len(out))
    return out

def parse(b, off):
    f = lambda loc, ln: float(b[off + loc - 1:off + loc - 1 + ln])
    return {'x': f(1, 12), 'y': f(15, 12), 'lon': f(127, 15), 'lat': f(144, 15), 'alt_km': f(161, 15),
            'tavg': f(178, 8), 'tmax': f(188, 8), 'ice': f(198, 11)}

def cell(c, j):                       # both triangles of cell (column c, row j)
    i = (c * N + j) * 2
    b = get(ROW + i * ROW, ROW + (i + 2) * ROW - 1)
    return [parse(b, 0), parse(b, ROW)]

def block(c, j, k):                   # all triangles of cells c-k..c+k, j-k..j+k (one range per column, 8 at a time)
    from concurrent.futures import ThreadPoolExecutor
    j0, j1 = max(0, j - k), min(N - 1, j + k)
    def col(cc):
        i0, i1 = (cc * N + j0) * 2, (cc * N + j1) * 2 + 1
        b = get(ROW + i0 * ROW, ROW + (i1 + 1) * ROW - 1)
        return [parse(b, t * ROW) for t in range(i1 - i0 + 1)]
    with ThreadPoolExecutor(max_workers=8) as ex:
        return [t for part in ex.map(col, range(max(0, c - k), min(N - 1, c + k) + 1)) for t in part]

def gc(lat1, lon1, lat2, lon2):
    r = math.pi / 180
    a = math.sin(lat1 * r) * math.sin(lat2 * r) + math.cos(lat1 * r) * math.cos(lat2 * r) * math.cos((lon2 - lon1) * r)
    return R * math.acos(max(-1.0, min(1.0, a)))

def locate(lat, lon, elev_m):
    r = R + elev_m / 1000
    xs, ys = r * math.cos(math.radians(lat)) * math.cos(math.radians(lon)), r * math.cos(math.radians(lat)) * math.sin(math.radians(lon))
    c, j = int(round((299.52 - xs) / 0.4992)), int(round((ys + 299.52) / 0.4992))
    for _ in range(6):                # refine against the actual vertex coordinates
        c, j = max(0, min(N - 1, c)), max(0, min(N - 1, j))
        v = cell(c, j)[0]
        dc, dj = int(round((v['x'] - xs) / 0.4992)), int(round((ys - v['y']) / 0.4992))
        if dc == 0 and dj == 0:
            break
        c, j = c + dc, j + dj
    return c, j

sites = json.loads(sys.argv[1])
res = {}
for k, (lat, lon, elev) in sites.items():
    c, j = locate(lat, lon, elev)
    near = block(c, j, 3)
    for t in near:
        t['d'] = gc(lat, lon, t['lat'], t['lon'])
    near.sort(key=lambda t: t['d'])
    within = [t for t in near if t['d'] <= 1.0]
    trap = None
    for kk in (20, 60):               # nearest cell with ice stable at the surface; valid if inside the searched radius
        cand = [t for t in block(c, j, kk) if t['ice'] == 0.0]
        for t in cand:
            t['d'] = gc(lat, lon, t['lat'], t['lon'])
        cand.sort(key=lambda t: t['d'])
        if cand and cand[0]['d'] <= kk * 0.49:
            trap = {'km': round(cand[0]['d'], 2), 'tmax': cand[0]['tmax'], 'lat': cand[0]['lat'], 'lon': cand[0]['lon'], 'searched_km': round(kk * 0.49, 1)}
            break
    res[k] = {'cell': [c, j], 'nearest': near[0], 'within_1km': within, 'cold_trap': trap}
    print(k, 'cell', c, j, '| nearest triangle', round(near[0]['d'] * 1000), 'm | tmax', near[0]['tmax'], 'tavg', near[0]['tavg'],
          'ice', near[0]['ice'], '| cells within 1 km', len(within), '| cold trap', trap and trap['km'], file=sys.stderr)
print(json.dumps(res))
