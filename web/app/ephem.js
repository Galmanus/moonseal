/* Lunar ephemeris in the browser: Sun and Earth azimuth/elevation from ANY lunar site at
 * ANY hour inside the precomputed table (web/ephem_data.js, JPL Horizons DE441, MOON_ME
 * frame = LOLA frame, east-longitude positive, sphere R = 1737.4 km).
 *
 * Inputs per hour: sub-solar point, sub-Earth point, Earth-Moon range.
 *   Sun   : direction = unit(sub-solar point). Parallax from the Moon's radius is
 *           1737/1.5e8 rad = 0.0007 deg, ignored.
 *   Earth : vector from the site = range * unit(sub-Earth point) - site position
 *           (topocentric parallax, up to ~0.26 deg, included).
 * Azimuth: 0 = North (toward the lunar north pole), 90 = East, same as JPL Horizons.
 * Elevation: angle above the plane perpendicular to the local radius (no atmosphere).
 * Between hourly samples values are interpolated linearly (longitude wrap handled).
 *
 * Pure functions, no DOM. Exposed as window.LunarEphem (or globalThis.LunarEphem). */
(function (root) {
  'use strict';
  var R_MOON_KM = 1737.4;
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  function unit(latDeg, lonDeg) {
    var la = latDeg * D2R, lo = lonDeg * D2R, cl = Math.cos(la);
    return [cl * Math.cos(lo), cl * Math.sin(lo), Math.sin(la)];
  }

  function lerp(a, b, f) { return a + (b - a) * f; }

  function lerpLon(a, b, f) {
    var d = b - a;
    if (d > 180) d -= 360; else if (d < -180) d += 360;
    var x = (a + d * f) % 360;
    return x < 0 ? x + 360 : x;
  }

  function table(E) {
    var t = E || root.LUNAR_EPHEM;
    if (!t) throw new Error('LunarEphem: LUNAR_EPHEM table not loaded');
    return t;
  }

  /* hours covered by the table: [0, (n-1)*step_h] */
  function range(E) {
    var t = table(E);
    return { t0: t.t0, startH: 0, endH: (t.n - 1) * t.step_h };
  }

  /* interpolated sub-points at `h` hours since t0; null outside the table */
  function subpoints(h, E) {
    var t = table(E), x = h / t.step_h;
    if (!(x >= 0) || x > t.n - 1) return null;
    var i = Math.min(Math.floor(x), t.n - 2), f = x - i;
    return {
      sunLat: lerp(t.sun_lat[i], t.sun_lat[i + 1], f),
      sunLon: lerpLon(t.sun_lon[i], t.sun_lon[i + 1], f),
      earthLat: lerp(t.earth_lat[i], t.earth_lat[i + 1], f),
      earthLon: lerpLon(t.earth_lon[i], t.earth_lon[i + 1], f),
      earthDistKm: lerp(t.earth_dist_km[i], t.earth_dist_km[i + 1], f)
    };
  }

  function frame(latDeg, lonDeg) {
    var la = latDeg * D2R, lo = lonDeg * D2R;
    return {
      up: unit(latDeg, lonDeg),
      east: [-Math.sin(lo), Math.cos(lo), 0],
      north: [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)]
    };
  }

  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  function toAzEl(v, F) {
    var e = dot(v, F.east), n = dot(v, F.north), u = dot(v, F.up);
    var az = Math.atan2(e, n) * R2D;
    if (az < 0) az += 360;
    return { az: az, el: Math.atan2(u, Math.sqrt(e * e + n * n)) * R2D };
  }

  /* Sun/Earth az/el (deg) from site (lat, lon east-positive, deg) at `h` hours since t0.
   * elevM: site height above the 1737.4 km sphere (only moves Earth parallax, ~1e-4 deg/km).
   * Returns null when h is outside the table. */
  function azel(latDeg, lonDeg, h, elevM, E) {
    var s = subpoints(h, E);
    if (!s) return null;
    var F = frame(latDeg, lonDeg);
    var sun = toAzEl(unit(s.sunLat, s.sunLon), F);
    var r = R_MOON_KM + (elevM || 0) / 1000;
    var eu = unit(s.earthLat, s.earthLon), up = F.up;
    var ev = [eu[0] * s.earthDistKm - up[0] * r, eu[1] * s.earthDistKm - up[1] * r,
              eu[2] * s.earthDistKm - up[2] * r];
    var earth = toAzEl(ev, F);
    return { sunAz: sun.az, sunEl: sun.el, earthAz: earth.az, earthEl: earth.el };
  }

  /* Hour index <-> Date helpers (t0 is UTC). */
  function hoursSinceT0(date, E) {
    return (date.getTime() - Date.parse(table(E).t0)) / 3600000;
  }
  function dateAt(h, E) {
    return new Date(Date.parse(table(E).t0) + h * 3600000);
  }

  root.LunarEphem = { azel: azel, subpoints: subpoints, range: range,
                      hoursSinceT0: hoursSinceT0, dateAt: dateAt, R_MOON_KM: R_MOON_KM };
})(typeof window !== 'undefined' ? window : globalThis);
