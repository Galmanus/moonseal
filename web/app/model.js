/* Planner model. For a site, every hour of the ephemeris table (2026-2027, JPL Horizons DE441):
 * Sun and Earth elevation minus the site's terrain horizon at their azimuths (LOLA ray-cast,
 * sphere-edge dip included). Body "up" = centre above the horizon, the same test the Python
 * engine uses (core/export_stats.py), so the numbers here match web/site_stats.js.
 * Mission stats, countdowns, and "good day to land" are pure functions of these arrays. */
window.Model = (function () {
  'use strict';
  var E = window.LUNAR_EPHEM, n = E ? E.n : 0, cache = new Map();
  var D2R = Math.PI / 180, R = 1737.4;

  function hzAt(hz, az) {            // nearest-lower 1-degree bin, same as core/terrain_windows.horizon_at
    if (!hz) return 0;
    var nb = hz.length, i = Math.floor(((az % 360) + 360) % 360 / (360 / nb));
    return hz[Math.min(i, nb - 1)];
  }

  function compute(site) {
    var key = site.id + ':' + site.lat + ':' + site.lon;
    if (cache.has(key)) return cache.get(key);
    var hz = site.horizon_deg && site.horizon_deg.length ? site.horizon_deg : null;
    var sunM = new Float32Array(n), earM = new Float32Array(n);
    var sunUp = new Uint8Array(n), earUp = new Uint8Array(n);
    var cS = new Int32Array(n + 1), cE = new Int32Array(n + 1), cB = new Int32Array(n + 1);
    for (var i = 0; i < n; i++) {
      var a = LunarEphem.azel(site.lat, site.lon, i, site.elev_m || 0);
      sunM[i] = a.sunEl - hzAt(hz, a.sunAz);
      earM[i] = a.earthEl - hzAt(hz, a.earthAz);
      sunUp[i] = sunM[i] > 0 ? 1 : 0; earUp[i] = earM[i] > 0 ? 1 : 0;
      cS[i + 1] = cS[i] + sunUp[i]; cE[i + 1] = cE[i] + earUp[i]; cB[i + 1] = cB[i] + (sunUp[i] & earUp[i]);
    }
    var m = { site: site, hz: hz, sunM: sunM, earM: earM, sunUp: sunUp, earUp: earUp, cS: cS, cE: cE, cB: cB,
              darkRuns: runs(sunUp, 0), blackRuns: runs(earUp, 0) };
    cache.set(key, m);
    return m;
  }

  function runs(arr, val) {          // [start, end) of every run where arr == val
    var out = [], s = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] === val) { if (s < 0) s = i; } else if (s >= 0) { out.push([s, i]); s = -1; }
    }
    if (s >= 0) out.push([s, arr.length]);
    return out;
  }

  /* longest run of `val` inside [a, b) */
  function longestIn(arr, val, a, b) {
    var best = 0, cur = 0;
    for (var i = a; i < b; i++) { if (arr[i] === val) { cur++; if (cur > best) best = cur; } else cur = 0; }
    return best;
  }

  function clampH(h) { return Math.max(0, Math.min(n - 1.001, h)); }

  /* value of a margin array at fractional hour t */
  function at(arr, t) { t = clampH(t); var i = Math.floor(t), f = t - i; return arr[i] * (1 - f) + arr[i + 1] * f; }

  /* next horizon crossing after t: {up: is the body up now, inH: hours until it changes} */
  function countdown(arr, t) {
    t = clampH(t);
    var i = Math.floor(t), cur = at(arr, t), up = cur > 0;
    if ((arr[i + 1] > 0) !== up) {
      var tc = i + arr[i] / (arr[i] - arr[i + 1]);
      return { up: up, inH: Math.max(0, tc - t) };
    }
    for (var j = i + 2; j < n; j++) {
      if ((arr[j] > 0) !== up) {
        var t2 = (j - 1) + arr[j - 1] / (arr[j - 1] - arr[j]);
        return { up: up, inH: t2 - t };
      }
    }
    return { up: up, inH: null };     // no change before the end of the table
  }

  /* mission window [t, t + dur) in hours */
  function mission(m, t, durH) {
    var a = Math.round(clampH(t)), b = Math.min(n, a + Math.max(1, Math.round(durH))), len = b - a;
    return {
      a: a, b: b, len: len, truncated: a + Math.round(durH) > n,
      sunPct: (m.cS[b] - m.cS[a]) / len, earthPct: (m.cE[b] - m.cE[a]) / len, bothPct: (m.cB[b] - m.cB[a]) / len,
      longestDark: longestIn(m.sunUp, 0, a, b), longestBlackout: longestIn(m.earUp, 0, a, b)
    };
  }

  function verdict(ms, need) {
    var power = ms.longestDark <= need.battH, comm = ms.longestBlackout <= need.gapH;
    return { power: power, comm: comm, level: power && comm ? 'good' : (power || comm ? 'warn' : 'bad') };
  }

  /* good[i] = a mission starting at hour i never sees darkness longer than battH nor an Earth
     blackout longer than gapH. O(n) with a difference array over the offending runs. */
  function goodStarts(m, durH, need) {
    var key = durH + '|' + need.battH + '|' + need.gapH;
    m.good = m.good || {};
    if (m.good[key]) return m.good[key];
    var bad = new Int32Array(n + 1), D = Math.round(durH);
    function mark(rs, lim) {
      if (D <= lim) return;                 // a mission shorter than the limit can never exceed it
      rs.forEach(function (r) {
        var s = r[0], e = r[1];
        if (e - s <= lim) return;
        var lo = Math.max(0, s + lim - D + 1), hi = Math.min(n, e - lim);   // starts whose window overlaps > lim
        if (lo < hi) { bad[lo]++; bad[hi]--; }
      });
    }
    mark(m.darkRuns, need.battH); mark(m.blackRuns, need.gapH);
    var good = new Uint8Array(n), acc = 0;
    for (var i = 0; i < n; i++) { acc += bad[i]; good[i] = (acc === 0 && i + D <= n) ? 1 : 0; }
    m.good[key] = good;
    return good;
  }
  function nextGood(good, t) {
    for (var i = Math.ceil(t); i < good.length; i++) if (good[i]) return i;
    return null;
  }

  /* terrain horizon for any point inside the LOLA cap, in the browser (480/240 m DEM).
     Same idea as core/lola_horizon.py: max elevation angle along each azimuth, curvature included,
     the bare-sphere limb beyond the data. */
  function horizonFromDem(lat, lon, demH) {
    var la = lat * D2R, lo = lon * D2R, cl = Math.cos(la);
    var up = [cl * Math.cos(lo), cl * Math.sin(lo), Math.sin(la)];
    var east = [-Math.sin(lo), Math.cos(lo), 0];
    var north = [-Math.sin(la) * Math.cos(lo), -Math.sin(la) * Math.sin(lo), Math.cos(la)];
    var h0 = demH(lat, lon), r0 = R + h0, prof = new Float32Array(360);
    for (var az = 0; az < 360; az++) {
      var best = -90;
      for (var sub = 0; sub < 3; sub++) {  // 3 rays per 1-degree bin: the engine takes the max over the whole wedge
      var A = (az + (sub + 0.5) / 3) * D2R, ca = Math.cos(A), sa = Math.sin(A);
      var dir = [north[0] * ca + east[0] * sa, north[1] * ca + east[1] * sa, north[2] * ca + east[2] * sa];
      var t = 0.72;                        // skip the nearest 3 x 240 m pixels, as core/lola_horizon.py does
      while (t < 520) {
        var g = t / R, cg = Math.cos(g), sg = Math.sin(g);
        var G = [up[0] * cg + dir[0] * sg, up[1] * cg + dir[1] * sg, up[2] * cg + dir[2] * sg];
        var glat = Math.asin(G[2]) / D2R, glon = Math.atan2(G[1], G[0]) / D2R;
        var rr = R + demH(glat, glon);
        var vx = G[0] * rr - up[0] * r0, vy = G[1] * rr - up[1] * r0, vz = G[2] * rr - up[2] * r0;
        var vu = vx * up[0] + vy * up[1] + vz * up[2], vl = Math.sqrt(vx * vx + vy * vy + vz * vz);
        var ang = Math.asin(vu / vl) / D2R;
        if (ang > best) best = ang;
        t = t * 1.02 + 0.12;
      }
      }
      prof[az] = best;
    }
    return { horizon: prof, elevKm: h0 };
  }

  return { compute: compute, countdown: countdown, mission: mission, verdict: verdict, goodStarts: goodStarts,
           nextGood: nextGood, at: at, horizonFromDem: horizonFromDem, n: n };
})();
