# Sample NASA GRAIL GRGM1200A gridded free-air anomaly (and its error map) at moonseal's sites with HTTP byte ranges,
# without downloading the 66 MB maps. Geometry from the PDS3 labels (gggrx_1200a_anom_l660.lbl):
# 2880 lines x 5760 samples, PC_REAL float32 little-endian, milligals, 16 pixel/degree, simple cylindrical,
# lat -90..90, east lon 0..360, LINE_PROJECTION_OFFSET 1439.5, SAMPLE_PROJECTION_OFFSET 2879.5, CENTER_LONGITUDE 180,
# reference sphere radius 1738.0 km. So the centre of 0-based row r is 90 - (r + 0.5)/16, of column c is (c + 0.5)/16.
import json, struct, subprocess, sys, math

BASE = 'https://pds-geosciences.wustl.edu/grail/grail-l-lgrs-5-rdr-v1/grail_1001/rsdmap/'
NS, NL, RES = 5760, 2880, 16
ROWB = NS * 4

def rows(product, r0):
    rng = '%d-%d' % (r0 * ROWB, (r0 + 2) * ROWB - 1)
    b = subprocess.run(['curl', '-s', '-r', rng, BASE + product], capture_output=True, check=True).stdout
    assert len(b) == 2 * ROWB, (product, len(b))
    return [struct.unpack('<%df' % NS, b[i * ROWB:(i + 1) * ROWB]) for i in range(2)]

def sample(product, lat, lon):
    fr = (90.0 - lat) * RES - 0.5                # fractional 0-based row
    fc = (lon % 360.0) * RES - 0.5               # fractional 0-based column
    r0 = max(0, min(NL - 2, int(math.floor(fr))))
    c0 = int(math.floor(fc)) % NS
    c1 = (c0 + 1) % NS
    tr, tc = fr - r0, fc - math.floor(fc)
    a, b = rows(product, r0)
    top = a[c0] * (1 - tc) + a[c1] * tc
    bot = b[c0] * (1 - tc) + b[c1] * tc
    return top * (1 - tr) + bot * tr, (a[c0], a[c1], b[c0], b[c1])

sites = json.loads(sys.argv[1])
out = {}
for k, (lat, lon) in sites.items():
    v, corners = sample('gggrx_1200a_anom_l660.img', lat, lon)
    e, _ = sample('gggrx_1200a_anomerr_l660.img', lat, lon)
    out[k] = {'anom_mgal': round(v, 1), 'err_mgal': round(e, 1), 'corners': [round(x, 1) for x in corners]}
print(json.dumps(out))
