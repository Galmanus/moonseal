"""Horizon physics regression tests (run: python3 -m pytest core/tests -q).

An observer standing above the reference sphere sees the bare-sphere limb BELOW the
local horizontal (dip = arccos(R/(R+h))). Clamping the terrain horizon to >= 0 deg
throws that away and darkens exactly the high ridges/peaks chosen for sunlight.
"""
import os, sys
import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from lola_horizon import horizon_profile, sphere_dip_deg, R  # noqa: E402


def test_elevated_sites_see_below_zero():
    for lat, lon in [(-85.964, 357.681), (-89.45, 222.69)]:  # Malapert Massif, Connecting Ridge
        prof, h0 = horizon_profile(lat, lon)
        assert h0 > 0, (lat, lon, h0)
        assert (prof < 0).any(), f"no negative horizon at ({lat},{lon}) h0={h0:.0f} m"
        # the lowest horizon of a peak cannot sit far below its bare-sphere dip
        assert prof.min() > -(sphere_dip_deg(h0) + 3.0), (prof.min(), sphere_dip_deg(h0))


def test_sphere_dip_matches_small_angle_formula():
    h = 1954.5
    assert abs(sphere_dip_deg(h) - np.degrees(np.sqrt(2 * h / R))) < 0.01
    assert sphere_dip_deg(0.0) == 0.0
    assert sphere_dip_deg(-500.0) == 0.0  # observer below the sphere: no bare-sphere dip


def test_short_coverage_falls_back_to_sphere_limb():
    # a raised site just inside the DEM edge (75 S): toward the edge (az ~ 0, i.e. north)
    # the DEM ends long before the tangent distance sqrt(2 R h), so the horizon there
    # must fall back to the bare-sphere limb, never to an arbitrary 0 deg or -90 deg.
    for lon in range(0, 360, 15):
        prof, h0 = horizon_profile(-75.3, float(lon))
        if h0 > 500.0:
            break
    else:
        raise AssertionError("no raised site found near the DEM edge")
    north = np.r_[prof[355:], prof[:6]]
    assert np.all(north >= -sphere_dip_deg(h0) - 1e-6), (north.min(), -sphere_dip_deg(h0))


def _bilinear_elev_m(lat, lon):
    """Native 240 m DEM, bilinear (independent of horizon_profile's internals)."""
    from lola_horizon import load_dem, SCALE, PO
    E = load_dem()["elev"]
    c = np.radians(lat + 90.0); rho = 2.0 * R * np.tan(c / 2.0); lo = np.radians(lon)
    fx = rho * np.sin(lo) / SCALE + PO; fy = PO - rho * np.cos(lo) / SCALE
    x0, y0 = int(np.floor(fx)), int(np.floor(fy)); tx, ty = fx - x0, fy - y0
    return float((E[y0, x0] * (1 - tx) + E[y0, x0 + 1] * tx) * (1 - ty)
                 + (E[y0 + 1, x0] * (1 - tx) + E[y0 + 1, x0 + 1] * tx) * ty)


def _uphill(lat, lon, dd=480.0):
    """(azimuth E of N, slope) of steepest ascent, central differences +-dd metres."""
    la, lo = np.radians(lat), np.radians(lon)
    up = np.array([np.cos(la) * np.cos(lo), np.cos(la) * np.sin(lo), np.sin(la)])
    east = np.array([-np.sin(lo), np.cos(lo), 0.0])
    north = np.array([-np.sin(la) * np.cos(lo), -np.sin(la) * np.sin(lo), np.cos(la)])

    def h(dn, de):
        v = up * R + north * dn + east * de; v /= np.linalg.norm(v)
        return _bilinear_elev_m(np.degrees(np.arcsin(v[2])), np.degrees(np.arctan2(v[1], v[0])))
    gN = (h(dd, 0) - h(-dd, 0)) / (2 * dd); gE = (h(0, dd) - h(0, -dd)) / (2 * dd)
    return np.degrees(np.arctan2(gE, gN)) % 360.0, np.degrees(np.arctan(np.hypot(gN, gE)))


def test_uphill_wall_is_not_undersampled():
    # de Gerlache Rim 2 sits on a ~19 deg crater-wall slope. Within ~14 km a single 240 m pixel
    # spans more than one 1-deg bin, so binning pixel CENTRES leaves azimuth gaps and the uphill
    # wall goes missing from most bins. A continuous (bilinear) ray-cast sees it: ~18 deg uphill.
    lat, lon = -88.5157, 298.833
    upaz, slope = _uphill(lat, lon)
    assert slope > 15.0, slope
    prof, h0 = horizon_profile(lat, lon)
    hz = prof[int(upaz) % 360]
    assert hz >= 15.0, f"uphill (az {upaz:.1f}) horizon {hz:.2f} deg < 15 on a {slope:.1f} deg slope"
