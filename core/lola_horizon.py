"""
Real terrain horizon from LOLA DEM (closes the spherical-horizon gap).

Input: LDEM_75S_240M (LOLA GDR, polar stereographic, 75-90 S, 240 m/px).
  3812x3812, LSB int16, elevation_m = DN * 0.5, over sphere R = 1737400 m.
  pole at pixel (1905.5, 1905.5); grid edge = -75 deg (rho = 457 km).

For a site (lat0,lon0) it computes horizon[azimuth] = the maximum elevation
angle (deg, curvature included) subtended by terrain in each 1-deg azimuth bin,
measured East-of-North in the body-fixed lon frame. A body at (az,el) from
JPL Horizons is visible iff el > horizon[round(az)]. The horizon can be NEGATIVE:
from a ridge or peak the terrain (and the sphere limb) sits below the local horizontal.

v0-terrain: 240 m/px, 75-90 S coverage. good for the far-field rims that gate
Earth (which sits near the horizon); local sub-rim detail would want the 20 m product.

Sampling (2026-11-14b): each bin is the max of two lower bounds on the same surface:
  - every DEM pixel centre binned by azimuth (complete in the far field, where many pixels
    share a bin), and
  - a continuous ray-cast, 3 rays per bin, bilinear on the native 240 m grid, exact
    curvature (complete in the near field: inside ~14 km one pixel spans > 1 deg, so
    binning centres alone leaves azimuth gaps and loses walls on sloped sites).
"""
from __future__ import annotations
import os, json
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "data", "lola", "LDEM_75S_240M.IMG")
N = 3812
R = 1737400.0            # m, reference radius (= OFFSET = A_AXIS_RADIUS)
SCALE = 240.0           # m/px
PO = 1905.5             # line/sample projection offset (pole pixel)
SCALING = 0.5           # DN -> m

_CACHE = {}


def load_dem():
    if "T" in _CACHE:
        return _CACHE
    dn = np.fromfile(IMG, dtype="<i2").astype(np.float32).reshape(N, N)
    elev = dn * SCALING                     # m, relative to R
    rows = np.arange(N, dtype=np.float32)
    cols = np.arange(N, dtype=np.float32)
    # plane coords (m). y up = decreasing row; lon = atan2(x, y) east-positive.
    X = (cols[None, :] - PO) * SCALE        # east-ish
    Y = (PO - rows[:, None]) * SCALE        # north-ish (toward lon 0 meridian)
    rho = np.sqrt(X * X + Y * Y)
    c = 2.0 * np.arctan(rho / (2.0 * R))    # colatitude from south pole (rad)
    lat = -90.0 + np.degrees(c)             # [-90, ~-75] inside circle
    lon = np.degrees(np.arctan2(X, Y)) % 360.0
    radius = R + elev
    # 3D planetocentric cartesian (float32)
    la = np.radians(lat); lo = np.radians(lon)
    cl = np.cos(la)
    Tx = (radius * cl * np.cos(lo)).astype(np.float32)
    Ty = (radius * cl * np.sin(lo)).astype(np.float32)
    Tz = (radius * np.sin(la)).astype(np.float32)
    valid = lat <= -75.0                    # inside stated coverage circle
    _CACHE.update(dict(elev=elev, lat=lat, lon=lon, radius=radius,
                       Tx=Tx, Ty=Ty, Tz=Tz, valid=valid))
    return _CACHE


def sphere_dip_deg(h0):
    """Dip (deg, >= 0) of the bare reference-sphere limb below the local horizontal for an
    observer h0 metres above R. Zero when the observer is at or below the sphere."""
    if h0 <= 0.0:
        return 0.0
    return float(np.degrees(np.arccos(R / (R + h0))))


def site_vec(lat0, lon0, h0=0.0):
    la = np.radians(lat0); lo = np.radians(lon0)
    r = R + h0
    u = np.array([np.cos(la) * np.cos(lo), np.cos(la) * np.sin(lo), np.sin(la)])
    return r * u, u, la, lo


SIN75 = float(np.sin(np.radians(75.0)))


def _elev_bilinear(gx, gy, gz, elev):
    """Bilinear DEM height (m) at unit vectors (gx, gy, gz) on the native 240 m grid;
    NaN outside the stated 75 S coverage circle. Stereographic, same convention as load_dem:
    X = 2R gy / (1 - gz), Y = 2R gx / (1 - gz)  (i.e. X = rho sin lon, Y = rho cos lon)."""
    den = 1.0 - gz
    fx = (2.0 * R * gy / den) / SCALE + PO
    fy = PO - (2.0 * R * gx / den) / SCALE
    x0 = np.floor(fx).astype(np.int64); y0 = np.floor(fy).astype(np.int64)
    tx = fx - x0; ty = fy - y0
    inside = (gz <= -SIN75) & (x0 >= 0) & (y0 >= 0) & (x0 < N - 1) & (y0 < N - 1)
    x0 = np.clip(x0, 0, N - 2); y0 = np.clip(y0, 0, N - 2)
    h = ((elev[y0, x0] * (1.0 - tx) + elev[y0, x0 + 1] * tx) * (1.0 - ty)
         + (elev[y0 + 1, x0] * (1.0 - tx) + elev[y0 + 1, x0 + 1] * tx) * ty)
    return np.where(inside, h, np.nan)


def _raycast_profile(up, east, north, h0, nbins, t0, sub=3, grow=1.02, add=120.0, tmax=930000.0):
    """Continuous horizon: per bin, the max elevation angle along `sub` great-circle rays
    (azimuths az + (k + 0.5)/sub of the bin), bilinear heights, exact curvature, from t0
    metres out to the DEM edge. Returns (profile_deg, reach_m); -90 where a bin saw nothing."""
    E = load_dem()["elev"]
    binw = 360.0 / nbins
    az = (np.arange(nbins)[:, None] + (np.arange(sub)[None, :] + 0.5) / sub) * binw
    A = np.radians(az.ravel())
    dirs = np.outer(np.cos(A), north) + np.outer(np.sin(A), east)              # (nr, 3)
    ts = [float(t0)]
    while ts[-1] < tmax:
        ts.append(ts[-1] * grow + add)
    ts = np.array(ts)                                                            # arc length, m
    g = ts / R
    G = (up[None, None, :] * np.cos(g)[None, :, None]
         + dirs[:, None, :] * np.sin(g)[None, :, None])                          # (nr, ns, 3) unit
    h = _elev_bilinear(G[..., 0], G[..., 1], G[..., 2], E)                       # NaN past the edge
    V = G * (R + np.nan_to_num(h))[..., None] - up * (R + h0)                    # observer -> surface
    ang = np.degrees(np.arcsin(np.clip((V @ up) / np.linalg.norm(V, axis=-1), -1.0, 1.0)))
    ok = ~np.isnan(h)
    ang = np.where(ok, ang, -90.0)
    prof = ang.max(axis=1).reshape(nbins, sub).max(axis=1)
    reach = np.where(ok, ts[None, :], 0.0).max(axis=1).reshape(nbins, sub).max(axis=1)
    return prof, reach


def horizon_profile(lat0, lon0, nbins=360, h0=None, min_px=3):
    d = load_dem()
    # site height from the DEM (nearest pixel) if not given
    if h0 is None:
        # inverse-project site to pixel
        la = np.radians(lat0)
        c = np.radians(lat0 + 90.0)
        rho = 2.0 * R * np.tan(c / 2.0)
        lo = np.radians(lon0)
        X = rho * np.sin(lo); Y = rho * np.cos(lo)
        col = int(round(X / SCALE + PO)); row = int(round(PO - Y / SCALE))
        row = min(max(row, 0), N - 1); col = min(max(col, 0), N - 1)
        h0 = float(d["elev"][row, col])
    S, u0, la0, lo0 = site_vec(lat0, lon0, h0)
    east = np.array([-np.sin(lo0), np.cos(lo0), 0.0])
    north = np.array([-np.sin(la0) * np.cos(lo0), -np.sin(la0) * np.sin(lo0), np.cos(la0)])
    up = u0
    Dx = d["Tx"] - np.float32(S[0]); Dy = d["Ty"] - np.float32(S[1]); Dz = d["Tz"] - np.float32(S[2])
    De = Dx * east[0] + Dy * east[1] + Dz * east[2]
    Dn = Dx * north[0] + Dy * north[1] + Dz * north[2]
    Du = Dx * up[0] + Dy * up[1] + Dz * up[2]
    horiz = np.sqrt(De * De + Dn * Dn)
    elang = np.degrees(np.arctan2(Du, horiz))
    az = np.degrees(np.arctan2(De, Dn)) % 360.0
    # mask: valid coverage, and drop the near ring around the site (self/noise)
    m = d["valid"] & (horiz > min_px * SCALE)
    az = az[m]; elang = elang[m]; dist = horiz[m]
    binw = 360.0 / nbins
    idx = np.minimum((az / binw).astype(int), nbins - 1)
    prof = np.full(nbins, -90.0, dtype=np.float64)
    np.maximum.at(prof, idx, elang)
    # near field: pixel centres leave azimuth gaps (one 240 m pixel > 1 deg inside ~14 km);
    # the continuous ray-cast fills them. Both are lower bounds on the surface: take the max.
    ray_prof, ray_reach = _raycast_profile(np.asarray(up, dtype=np.float64), east, north, h0,
                                           nbins, t0=min_px * SCALE)
    prof = np.maximum(prof, ray_prof)
    # No clamp at 0: from a raised site the true horizon dips below the local horizontal
    # (the terrain samples already carry curvature). Where the DEM ends before the
    # bare-sphere tangent distance sqrt(2 R h0), terrain beyond is unknown: assume the
    # reference sphere there, i.e. the horizon is at least the sphere limb (-dip).
    reach = np.zeros(nbins, dtype=np.float64)
    np.maximum.at(reach, idx, dist.astype(np.float64))
    reach = np.maximum(reach, ray_reach)
    dip = sphere_dip_deg(h0)
    short = reach < np.sqrt(2.0 * R * max(h0, 0.0))
    prof[short] = np.maximum(prof[short], -dip)
    prof[prof <= -90.0] = -dip   # bin with no terrain sample at all
    return prof, h0


def horizon_at(prof, az_deg):
    nbins = len(prof)
    i = int(az_deg % 360.0 / (360.0 / nbins)) % nbins
    return prof[i]


def site_slope_deg(lat0, lon0, win=3):
    """Local descent-safety slope (deg) at the site, from the LOLA DEM gradient.
    Planners flag hazard slopes typically above ~5-15 deg."""
    d = load_dem()
    c = np.radians(lat0 + 90.0)
    rho = 2.0 * R * np.tan(c / 2.0)
    lo = np.radians(lon0)
    X = rho * np.sin(lo); Y = rho * np.cos(lo)
    col = int(round(X / SCALE + PO)); row = int(round(PO - Y / SCALE))
    row = min(max(row, win), N - 1 - win); col = min(max(col, win), N - 1 - win)
    patch = d["elev"][row - win:row + win + 1, col - win:col + win + 1]
    gy, gx = np.gradient(patch, SCALE)           # m per m
    g = float(np.hypot(gx[win, win], gy[win, win]))
    return float(np.degrees(np.arctan(g)))


if __name__ == "__main__":
    # Artemis III candidate landing regions (NASA 2022 list). Coords sourced:
    #  connecting_ridge: Moon Base Zero / Shackleton-de Gerlache ridge (Mazarico 2011)
    #  malapert_massif:  NASA notional site -85.964, 357.681E (Kring 2025, JGR Planets 2024JE008905)
    #  de_gerlache_rim2: 88 30 56.38S, 61 10 02.35W -> 298.833E (arxiv 2406.19863 Table 3, pt 726)
    #  peak_near_shackleton: 89 00 42.35S, 131 16 44.46E (arxiv 2406.19863 Table 3, pt 1005)
    SITES = {"connecting_ridge": (-89.45, 222.69),
             "malapert_massif": (-85.964, 357.681),
             "de_gerlache_rim2": (-88.5157, 298.833),
             "peak_near_shackleton": (-89.0118, 131.279)}
    out = {}
    for name, (lat, lon) in SITES.items():
        prof, h0 = horizon_profile(lat, lon)
        out[name] = {"lat": lat, "lon": lon, "site_elev_m": round(h0, 1),
                     "horizon_deg": [round(float(x), 3) for x in prof]}
        amax = int(np.argmax(prof))
        print(f"{name:16s} elev {h0:7.1f} m  horizon min {prof.min():.2f} "
              f"mean {prof.mean():.2f} max {prof.max():.2f} deg @ az {amax}")
    cache = os.path.join(HERE, "..", "data", "lola", "horizons_terrain.json")
    json.dump(out, open(cache, "w"))
    print("escrito:", cache)
