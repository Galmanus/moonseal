"""
Lunar direct-to-Earth communication & solar-power window engine (v0).

Deliverable floor for NASA Space Apps 2026 challenge #11
"Lunar Landing Site Navigator": for a candidate south-pole landing site,
compute when Earth is above the local horizon (direct-to-Earth comm window)
and when the Sun is above the local horizon (power-generation window).

HONESTY NOTE ON DATA (read before trusting a number):
  v0 models the two driving phenomena ANALYTICALLY, not from an ephemeris:
    - Earth's apparent motion over a lunar site is driven by OPTICAL LIBRATION
      (the Moon is tidally locked; the sub-Earth point sits near selenographic
      (0,0) and wobbles ~+/-7 deg over a month). We model libration in latitude
      and longitude as sinusoids with the standard max amplitudes and the
      draconic / anomalistic month periods.
    - The Sun's elevation is driven by the sub-solar point: its selenographic
      latitude swings +/-1.54 deg (the Moon's axial tilt to the ecliptic) over a
      draconic month, while its longitude sweeps 360 deg over a synodic month.
  This captures the REAL reason south-pole comm/power is marginal and
  site-dependent, with inspectable math. It is an APPROXIMATION.
  v1 swaps in JPL DE ephemeris (skyfield + de440s.bsp from NASA NAIF) for the
  true sub-Earth / sub-solar track. That is the "real NASA data" hookup; it
  replaces exactly the two functions sub_earth_point() and sub_solar_point().

Angles in degrees unless suffixed _rad.
"""
from __future__ import annotations
import numpy as np
from dataclasses import dataclass

# --- lunar motion constants (standard values; approximation for v0) ---
LIBRATION_LAT_AMP_DEG = 6.69     # max optical libration in latitude
LIBRATION_LON_AMP_DEG = 7.9      # max optical libration in longitude
SUBSOLAR_LAT_AMP_DEG = 1.54      # Moon's obliquity to the ecliptic
DRACONIC_MONTH_D = 27.212        # node-to-node: drives libration-lat & sub-solar-lat
ANOMALISTIC_MONTH_D = 27.555     # perigee-to-perigee: drives libration-lon
SYNODIC_MONTH_D = 29.531         # Sun-relative: drives sub-solar longitude sweep


def sub_earth_point(t_days: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Selenographic (lat, lon) of the sub-Earth point vs time (days).
    v0: optical libration as sinusoids about (0,0). v1: JPL DE ephemeris."""
    lat = LIBRATION_LAT_AMP_DEG * np.sin(2 * np.pi * t_days / DRACONIC_MONTH_D)
    lon = LIBRATION_LON_AMP_DEG * np.sin(2 * np.pi * t_days / ANOMALISTIC_MONTH_D)
    return lat, lon


def sub_solar_point(t_days: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Selenographic (lat, lon) of the sub-solar point vs time (days).
    v0: lat swings +/-1.54 deg (draconic), lon sweeps 360 deg/synodic month."""
    lat = SUBSOLAR_LAT_AMP_DEG * np.sin(2 * np.pi * t_days / DRACONIC_MONTH_D)
    lon = (-360.0 * t_days / SYNODIC_MONTH_D) % 360.0   # westward sweep
    return lat, lon


def elevation_deg(site_lat, site_lon, body_lat, body_lon):
    """Elevation of a body above the local horizon at a selenographic site,
    given the body's sub-point (lat,lon). Spherical Moon assumed.
    elevation = 90 - angular_separation(site, sub_point)."""
    p = np.radians(site_lat); l = np.radians(site_lon)
    b = np.radians(body_lat); m = np.radians(body_lon)
    cos_sep = np.sin(p) * np.sin(b) + np.cos(p) * np.cos(b) * np.cos(l - m)
    cos_sep = np.clip(cos_sep, -1.0, 1.0)
    sep = np.degrees(np.arccos(cos_sep))
    return 90.0 - sep


@dataclass
class Window:
    start_h: float
    end_h: float
    @property
    def dur_h(self) -> float:
        return self.end_h - self.start_h


def find_windows(mask: np.ndarray, t_hours: np.ndarray) -> list[Window]:
    """Contiguous True runs in `mask` -> list of Windows (hours)."""
    wins: list[Window] = []
    in_win = False; start = 0.0
    for i, v in enumerate(mask):
        if v and not in_win:
            in_win = True; start = t_hours[i]
        elif not v and in_win:
            in_win = False; wins.append(Window(start, t_hours[i]))
    if in_win:
        wins.append(Window(start, t_hours[-1]))
    return wins


def analyze(site_lat, site_lon, days=60.0, step_h=0.25,
            earth_mask_deg=0.0, sun_mask_deg=0.0):
    """Compute comm (Earth) and power (Sun) windows for a site.
    *_mask_deg: minimum elevation to count (0 = flat horizon; raise it to
    model a crater-rim / terrain horizon that a body must clear)."""
    t_h = np.arange(0.0, days * 24.0, step_h)
    t_d = t_h / 24.0
    e_lat, e_lon = sub_earth_point(t_d)
    s_lat, s_lon = sub_solar_point(t_d)
    earth_el = elevation_deg(site_lat, site_lon, e_lat, e_lon)
    sun_el = elevation_deg(site_lat, site_lon, s_lat, s_lon)
    comm = earth_el > earth_mask_deg
    power = sun_el > sun_mask_deg
    return {
        "t_h": t_h, "earth_el": earth_el, "sun_el": sun_el,
        "comm_windows": find_windows(comm, t_h),
        "power_windows": find_windows(power, t_h),
        "comm_coverage": float(comm.mean()),
        "power_coverage": float(power.mean()),
        "earth_el_range": (float(earth_el.min()), float(earth_el.max())),
        "sun_el_range": (float(sun_el.min()), float(sun_el.max())),
    }


def _summ(wins: list[Window]):
    if not wins:
        return "nenhuma", 0.0, 0.0
    durs = [w.dur_h for w in wins]
    return len(wins), max(durs), sum(durs) / len(durs)


if __name__ == "__main__":
    # Demo site: a near-rim point by Shackleton crater, lunar south pole.
    SITE_LAT, SITE_LON = -89.45, 0.0
    DAYS = 60.0
    r = analyze(SITE_LAT, SITE_LON, days=DAYS, step_h=0.25,
                earth_mask_deg=0.0, sun_mask_deg=0.0)

    print(f"=== sitio selenografico lat={SITE_LAT} lon={SITE_LON}, janela {DAYS:.0f} dias ===")
    print(f"Earth elevacao: min {r['earth_el_range'][0]:+.2f} deg  max {r['earth_el_range'][1]:+.2f} deg")
    print(f"Sun   elevacao: min {r['sun_el_range'][0]:+.2f} deg  max {r['sun_el_range'][1]:+.2f} deg")

    n, longest, mean = _summ(r["comm_windows"])
    print(f"\n[COMM / direct-to-Earth] cobertura {r['comm_coverage']*100:.1f}%  "
          f"janelas: {n}  maior {longest:.1f} h  media {mean:.1f} h")
    for w in r["comm_windows"][:6]:
        print(f"   t+{w.start_h:7.2f}h -> t+{w.end_h:7.2f}h   ({w.dur_h:5.1f} h)")

    n, longest, mean = _summ(r["power_windows"])
    print(f"\n[POWER / solar] cobertura {r['power_coverage']*100:.1f}%  "
          f"janelas: {n}  maior {longest:.1f} h  media {mean:.1f} h")
    for w in r["power_windows"][:6]:
        print(f"   t+{w.start_h:7.2f}h -> t+{w.end_h:7.2f}h   ({w.dur_h:5.1f} h)")

    # Intersection: a command can be SENT only when Earth is up (comm) AND,
    # if it needs live power, when the Sun is up too. This intersection is the
    # operational "command window" the PQC demo gates against.
    t_h = r["t_h"]
    both = (r["earth_el"] > 0) & (r["sun_el"] > 0)
    bw = find_windows(both, t_h)
    n, longest, mean = _summ(bw)
    print(f"\n[COMM & POWER simultaneos] cobertura {both.mean()*100:.1f}%  "
          f"janelas: {n}  maior {longest:.1f} h")
