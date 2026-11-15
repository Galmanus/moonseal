"""Build the web app's texture set from NASA data (reproducible; run from the repo root).

Inputs
  data/lola/LDEM_75S_240M.IMG                LOLA south-pole DEM, 240 m/px, polar stereographic,
                                             int16 DN, height = DN * 0.5 m above 1737.4 km
  data/moonkit_raw/lroc_color_poles_8k.tif   NASA SVS CGI Moon Kit #4720 (LRO LROC WAC color)
  data/moonkit_raw/ldem_16.tif               NASA SVS CGI Moon Kit #4720 (LOLA elevation, 16 px/deg)

Outputs (web/app/tex/)
  pole_full_1906.i16     int16 LE DN, the whole 3812^2 DEM box-averaged 2x2  -> 480 m/px
  pole_inner_2048.i16    int16 LE DN, native 240 m crop centred on the pole  -> +-245.64 km
  moon_color_{2k,4k,8k}.jpg   equirectangular, left edge 180W, top = 90N
  moon_normal_4k.webp    tangent-space normal (R = east, G = north, B = up), true slopes
  tex_meta.json          projection + layout facts the shaders rely on

Usage:  python3 -I core/export_app_textures.py pole      (needs only the local DEM)
        python3 -I core/export_app_textures.py globe     (needs the two moonkit downloads)
"""
import os, sys, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
OUT = os.path.join(ROOT, "web", "app", "tex")
DEM = os.path.join(ROOT, "data", "lola", "LDEM_75S_240M.IMG")
KIT = os.path.join(ROOT, "data", "moonkit_raw")
N, PO, SCALE_M = 3812, 1905.5, 240.0
R_KM = 1737.4


def meta_update(d):
    p = os.path.join(OUT, "tex_meta.json")
    m = json.load(open(p)) if os.path.exists(p) else {}
    m.update(d)
    json.dump(m, open(p, "w"), indent=1)


def pole():
    dn = np.fromfile(DEM, dtype="<i2").reshape(N, N)
    # full cap, 2x2 box average -> 1906^2 at 480 m. texel j centre: X = (j - 952.5) * 0.48 km
    full = dn.astype(np.int32).reshape(N // 2, 2, N // 2, 2).mean(axis=(1, 3))
    full = np.round(full).astype("<i2")
    full.tofile(os.path.join(OUT, "pole_full_1906.i16"))
    # native crop centred on the pole: cols/rows 882..2929 -> X = (c - 1905.5) * 0.24 km
    c0 = 882
    inner = np.ascontiguousarray(dn[c0:c0 + 2048, c0:c0 + 2048]).astype("<i2")
    inner.tofile(os.path.join(OUT, "pole_inner_2048.i16"))
    meta_update({"pole": {
        "source": "LOLA LDEM_75S_240M (PDS), polar stereographic, centre lat -90, lon 0",
        "r_km": R_KM, "dn_to_km": 0.0005,
        "projection": "rho = 2R tan(c/2), c = colatitude from the south pole; "
                      "X = rho sin(lon), Y = rho cos(lon), lon east-positive (matches core/lola_horizon.py)",
        "row_order": "row 0 = +Y edge (north-ish, toward lon 0 meridian); col 0 = -X edge",
        "full": {"file": "pole_full_1906.i16", "size": 1906, "km_per_px": 0.48,
                 "half_width_km": 457.44, "uv": "s = 0.5 + X/914.88 ; t = 0.5 - Y/914.88"},
        "inner": {"file": "pole_inner_2048.i16", "size": 2048, "km_per_px": 0.24,
                  "half_width_km": 245.76, "uv": "s = 0.5 + X/491.52 ; t = 0.5 - Y/491.52"},
        "height_range_m": [float(dn.min()) * 0.5, float(dn.max()) * 0.5],
    }})
    print("pole: full", full.shape, "inner", inner.shape,
          "pole DN", int(dn[1905, 1905]), "->", int(full[952, 952]), int(inner[1023, 1023]))


def globe():
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    col = Image.open(os.path.join(KIT, "lroc_color_poles_8k.tif")).convert("RGB")
    print("color", col.size)
    for w, q in ((8192, 86), (4096, 88), (2048, 88)):
        im = col if col.size[0] == w else col.resize((w, w // 2), Image.LANCZOS)
        p = os.path.join(OUT, f"moon_color_{w // 1024}k.jpg")
        im.save(p, "JPEG", quality=q, progressive=True, optimize=True)
        print("  wrote", p, os.path.getsize(p) // 1024, "KiB")
    del col

    dem = np.asarray(Image.open(os.path.join(KIT, "ldem_16.tif")), dtype=np.float32)  # km
    H, W = dem.shape
    print("ldem_16", dem.shape, "range km", float(dem.min()), float(dem.max()))
    lat = 90.0 - (np.arange(H, dtype=np.float32) + 0.5) * (180.0 / H)
    coslat = np.cos(np.radians(lat)).astype(np.float32)[:, None]
    dl = np.radians(360.0 / W) * R_KM
    dp = np.radians(180.0 / H) * R_KM
    sx = (np.roll(dem, -1, axis=1) - np.roll(dem, 1, axis=1)) / (2.0 * dl * np.maximum(coslat, 0.02))
    sy = np.empty_like(dem)
    sy[1:-1] = (dem[:-2] - dem[2:]) / (2.0 * dp)        # row i-1 is further north
    sy[0] = sy[1]; sy[-1] = sy[-2]
    del dem
    fade = np.clip((88.0 - np.abs(lat)) / 3.0, 0.0, 1.0).astype(np.float32)[:, None]
    sx *= fade; sy *= fade
    tw, th = 4096, 2048
    sx = np.asarray(Image.fromarray(sx, "F").resize((tw, th), Image.BOX))
    sy = np.asarray(Image.fromarray(sy, "F").resize((tw, th), Image.BOX))
    inv = 1.0 / np.sqrt(sx * sx + sy * sy + 1.0)
    rgb = np.stack([-sx * inv, -sy * inv, inv], axis=-1) * 0.5 + 0.5
    rgb = np.clip(np.round(rgb * 255.0), 0, 255).astype(np.uint8)
    p = os.path.join(OUT, "moon_normal_4k.webp")
    Image.fromarray(rgb, "RGB").save(p, "WEBP", quality=92, method=6)
    print("  wrote", p, os.path.getsize(p) // 1024, "KiB", "max |slope|",
          float(np.max(np.abs(sx))), float(np.max(np.abs(sy))))
    meta_update({"globe": {
        "source": "NASA SVS CGI Moon Kit #4720 (LRO LROC WAC color, LOLA ldem_16)",
        "layout": "equirectangular, left edge 180W, top row 90N, east-positive",
        "normal": "tangent space, R=east G=north B=up, true (1x) slopes, faded to flat above |lat| 88",
        "color": ["moon_color_2k.jpg", "moon_color_4k.jpg", "moon_color_8k.jpg"],
    }})


def heights():
    """Global height field for terminator shadows: ldem_16 (km above 1737.4) box-resampled to
    4096 x 2048, int16 metres, row 0 = 90 N, col 0 = 180 W (same layout as the color map)."""
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    dem = Image.open(os.path.join(KIT, "ldem_16.tif"))
    small = np.asarray(dem.resize((4096, 2048), Image.BOX), dtype=np.float32)
    m = np.round(small * 1000.0).astype("<i2")
    m.tofile(os.path.join(OUT, "moon_height_4k.i16"))
    meta_update({"heights": {"file": "moon_height_4k.i16", "w": 4096, "h": 2048, "unit": "m above 1737.4 km",
                             "layout": "row 0 = 90 N, col 0 = 180 W, east-positive", "source": "LOLA ldem_16 (CGI Moon Kit #4720)",
                             "range_m": [int(m.min()), int(m.max())]}})
    print("heights", m.shape, "range m", int(m.min()), int(m.max()), os.path.getsize(os.path.join(OUT, "moon_height_4k.i16")) // 1024, "KiB")


PGDA = os.path.join(ROOT, "data", "pgda_raw")
# NASA PGDA LOLA 5 m/px Artemis-region DEMs (Barker et al. 2021) -> one tile per site, 2048^2, int16 0.5 m DN
SITE_TILES = {"Site01": ["connecting_ridge", "moon_base_zero"], "Site23": ["malapert_massif"],
              "SL2": ["de_gerlache_rim2"], "Site07": ["peak_near_shackleton"]}


def sitetiles():
    from PIL import Image
    Image.MAX_IMAGE_PIXELS = None
    dn = np.fromfile(DEM, dtype="<i2").reshape(N, N).astype(np.float32) * 0.5      # 240 m reference, metres
    out = {}
    for tile, ids in SITE_TILES.items():
        path = os.path.join(PGDA, f"{tile}_surf.tif")
        if not os.path.exists(path):
            print(tile, "missing"); continue
        im = Image.open(path)
        sx, sy = im.tag_v2[33550][:2]                      # ModelPixelScale (m)
        tp = im.tag_v2[33922]                              # ModelTiepoint: i j k X Y Z
        geokeys = im.tag_v2.get(34735)
        a = np.asarray(im, dtype=np.float32)
        H, W = a.shape
        x0, y1 = tp[3] - tp[0] * sx, tp[4] + tp[1] * sy   # upper-left corner (m), PixelIsArea assumed
        bad = ~np.isfinite(a) | (np.abs(a) > 20000)
        # georeference check against the 240 m LOLA DEM at pixel centres (and mirrored alternatives)
        rr = np.linspace(0, H - 1, 60).astype(int); cc = np.linspace(0, W - 1, 60).astype(int)
        R2, C2 = np.meshgrid(rr, cc, indexing="ij")
        X = x0 + (C2 + 0.5) * sx; Y = y1 - (R2 + 0.5) * sy
        def ref(X, Y):
            col = np.clip(np.round(X / SCALE_M + PO).astype(int), 0, N - 1); row = np.clip(np.round(PO - Y / SCALE_M).astype(int), 0, N - 1)
            return dn[row, col]
        v = a[R2, C2]; ok = ~bad[R2, C2]
        err = {k: float(np.median(np.abs(v[ok] - ref(*xy)[ok]))) for k, xy in
               {"as-is": (X, Y), "mirror-x": (-X, Y), "mirror-y": (X, -Y)}.items()}
        print(f"{tile}: {W}x{H} px, {sx} m/px, UL=({x0:.0f},{y1:.0f}) m, nodata {bad.mean()*100:.2f}%, "
              f"median |tile - LOLA240| m: " + ", ".join(f"{k} {e:.1f}" for k, e in err.items()) + f" | geokeys {geokeys[:8] if geokeys else None}")
        if err["as-is"] > 40 or err["as-is"] > 0.5 * min(err["mirror-x"], err["mirror-y"]):
            print("  ->", tile, "REFUSED: georeference does not match the 240 m DEM"); continue
        fill = np.where(bad, np.nan, a)
        if bad.any():                                       # fill holes from the 240 m DEM
            RR, CC = np.nonzero(bad); fill[RR, CC] = ref(x0 + (CC + 0.5) * sx, y1 - (RR + 0.5) * sy)
        small = np.asarray(Image.fromarray(fill.astype(np.float32), "F").resize((2048, 2048), Image.BOX))
        q = np.round(small / 0.5).astype("<i2")
        f = f"site_{tile}.i16"; q.tofile(os.path.join(OUT, f))
        rect = [x0 / 1000, (y1 - H * sy) / 1000, (x0 + W * sx) / 1000, y1 / 1000]   # x0, y0, x1, y1 km
        for i in ids:
            out[i] = {"file": f, "n": 2048, "rect": [round(r, 4) for r in rect], "texel_km": round(W * sx / 2048 / 1000, 5),
                      "source": f"NASA PGDA LOLA 5 m/px {tile} (Barker et al. 2021), box-resampled to 2048^2"}
        print(f"  -> wrote {f}: rect km {[round(r, 2) for r in rect]}, texel {W*sx/2048:.1f} m")
    open(os.path.join(ROOT, "web", "app", "site_tiles.js"), "w").write("window.MOONSEAL_TILES = " + json.dumps(out) + ";\n")
    print("site_tiles.js:", list(out))


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    what = sys.argv[1] if len(sys.argv) > 1 else "pole"
    {"pole": pole, "globe": globe, "heights": heights, "sitetiles": sitetiles}[what]()
