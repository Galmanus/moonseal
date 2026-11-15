/* Signal to Earth. A lander at a site can radio Earth when two things hold at the same hour:
 *   1. Earth clears the site's skyline (model.js: JPL Horizons geometry over LRO LOLA terrain);
 *   2. a dish of NASA's Deep Space Network has the Moon in its own sky, at least MIN_EL up.
 * (2) needs the Moon's place in Earth's sky: the Astronomical Almanac low-precision lunar series
 * (about 0.3 degrees) and Greenwich mean sidereal time. tests/radio.test.mjs checks it against
 * JPL Horizons at the three complexes over 2026-2027.
 * How strong the signal is comes from a free-space link budget for a stated reference radio.
 * And the real thing: which Moon spacecraft NASA's dishes are working right now, from the public
 * DSN Now feed (eyes.nasa.gov/dsn, served with Access-Control-Allow-Origin: *). */
(function (root) {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;

  /* Deep Space Network complexes, geodetic degrees (east-positive), near the large dishes. */
  var DSN = [
    { key: 'goldstone', code: 'gdscc', name: 'Goldstone', place: 'California, USA', lat: 35.4259, lon: -116.8895 },
    { key: 'madrid', code: 'mdscc', name: 'Madrid', place: 'Spain', lat: 40.4313, lon: -4.2480 },
    { key: 'canberra', code: 'cdscc', name: 'Canberra', place: 'Australia', lat: -35.4022, lon: 148.9813 }
  ];
  var MIN_EL = 10;            // degrees above the dish's horizon

  function sinD(a) { return Math.sin(a * D2R); }
  function cosD(a) { return Math.cos(a * D2R); }
  function jd(ms) { return ms / 86400000 + 2440587.5; }

  /* Geocentric Moon in the equatorial frame of date, in Earth radii. */
  function moon(ms) {
    var T = (jd(ms) - 2451545.0) / 36525;
    var lam = 218.32 + 481267.881 * T
      + 6.29 * sinD(135.0 + 477198.87 * T) - 1.27 * sinD(259.3 - 413335.36 * T)
      + 0.66 * sinD(235.7 + 890534.22 * T) + 0.21 * sinD(269.9 + 954397.74 * T)
      - 0.19 * sinD(357.5 + 35999.05 * T) - 0.11 * sinD(186.5 + 966404.03 * T);
    var bet = 5.13 * sinD(93.3 + 483202.02 * T) + 0.28 * sinD(228.2 + 960400.89 * T)
      - 0.28 * sinD(318.3 + 6003.15 * T) - 0.17 * sinD(217.6 - 407332.21 * T);
    var par = 0.9508 + 0.0518 * cosD(135.0 + 477198.87 * T) + 0.0095 * cosD(259.3 - 413335.36 * T)
      + 0.0078 * cosD(235.7 + 890534.22 * T) + 0.0028 * cosD(269.9 + 954397.74 * T);
    var r = 1 / sinD(par), eps = 23.439291 - 0.0130042 * T;
    var l = cosD(bet) * cosD(lam), m = cosD(bet) * sinD(lam), n = sinD(bet);
    return { x: r * l, y: r * (m * cosD(eps) - n * sinD(eps)), z: r * (m * sinD(eps) + n * cosD(eps)) };
  }

  function gmst(ms) { var d = jd(ms) - 2451545.0; return (((280.46061837 + 360.98564736629 * d) % 360) + 360) % 360; }

  /* Moon elevation (deg) above a complex's horizon: topocentric, so the Moon's ~1 degree parallax counts. */
  function moonEl(st, ms, mo) {
    mo = mo || moon(ms);
    var th = gmst(ms) + st.lon;
    var ux = cosD(st.lat) * cosD(th), uy = cosD(st.lat) * sinD(th), uz = sinD(st.lat);
    var dx = mo.x - ux, dy = mo.y - uy, dz = mo.z - uz;
    return Math.asin((dx * ux + dy * uy + dz * uz) / Math.sqrt(dx * dx + dy * dy + dz * dz)) * R2D;
  }

  /* The complex with the Moon highest in its sky at `ms`. */
  function bestDish(ms) {
    var mo = moon(ms), best = null;
    for (var k = 0; k < DSN.length; k++) {
      var el = moonEl(DSN[k], ms, mo);
      if (!best || el > best.el) best = { station: DSN[k], el: el };
    }
    best.up = best.el >= MIN_EL;
    return best;
  }

  /* Hourly coverage over the ephemeris table: 1 when some complex has the Moon >= MIN_EL.
     The same for every site on the Moon (they are all ~1,700 km from its centre). */
  var cover = null;
  function coverage(E) {
    if (cover) return cover;
    var t = E || root.LUNAR_EPHEM, t0 = Date.parse(t.t0), n = t.n, up = new Uint8Array(n);
    for (var i = 0; i < n; i++) up[i] = bestDish(t0 + i * t.step_h * 3600000).up ? 1 : 0;
    return (cover = up);
  }

  /* Reference radio for the budget: a small lander's X-band downlink to a 34 m DSN dish. */
  var REF = { band: 'X', fHz: 8.4e9, txW: 5, txGainDbi: 10, dishM: 34, dishEff: 0.7, tsysK: 30,
              otherLossDb: 2, ebn0ReqDb: 2.5, marginDb: 3 };

  /* Free-space link budget at `distKm`: power at the dish, carrier-to-noise density, top data rate. */
  function budget(distKm, ref) {
    ref = ref || REF;
    var lam = 299792458 / ref.fHz;
    var rxGain = 10 * Math.log10(ref.dishEff * Math.pow(Math.PI * ref.dishM / lam, 2));
    var fspl = 20 * Math.log10(4 * Math.PI * distKm * 1000 / lam);
    var prDbw = 10 * Math.log10(ref.txW) + ref.txGainDbi + rxGain - fspl - ref.otherLossDb;
    var cn0 = prDbw - (-228.6 + 10 * Math.log10(ref.tsysK));
    return { prDbm: prDbw + 30, fsplDb: fspl, rxGainDbi: rxGain, cn0DbHz: cn0,
             maxBps: Math.pow(10, (cn0 - ref.ebn0ReqDb - ref.marginDb) / 10) };
  }

  /* The answer for a site's model `m` at fractional hour `h`. */
  function signalAt(m, h, E) {
    var t = E || root.LUNAR_EPHEM, n = t.n;
    var i = Math.min(n - 2, Math.max(0, Math.floor(h))), f = Math.max(0, Math.min(1, h - i));
    var margin = m.earM[i] * (1 - f) + m.earM[i + 1] * f;
    var dish = bestDish(Date.parse(t.t0) + h * 3600000);
    var sp = root.LunarEphem ? root.LunarEphem.subpoints(h, t) : null;
    var nextDishH = null;
    if (!dish.up) {
      var cov = coverage(t);
      for (var j = i + 1; j < n; j++) if (cov[j]) { nextDishH = j - h; break; }
    }
    return { earthUp: margin > 0, earthMargin: margin, marginal: margin > 0 && margin < 1,
             dish: dish, nextDishH: nextDishH, ok: margin > 0 && dish.up,
             budget: budget(sp ? sp.earthDistKm : 384400) };
  }

  /* Share of the hours in [a, b) with a link: Earth over the skyline and a dish on the Moon. */
  function linkPct(m, a, b, E) {
    var cov = coverage(E), k = 0;
    for (var i = a; i < b; i++) if (m.earUp[i] && cov[i]) k++;
    return k / Math.max(1, b - a);
  }

  /* ---- live: NASA DSN Now ---- */
  var FEED = 'https://eyes.nasa.gov/dsn/data/dsn.xml';
  var MOON_CRAFT = {   // DSN Now codes of Moon missions, names from eyes.nasa.gov/dsn/config.xml
    LRO: 'Lunar Reconnaissance Orbiter (NASA)', KPLO: 'Danuri, Korea Pathfinder Lunar Orbiter (KARI)',
    CAPS: 'CAPSTONE (NASA)', CH2: 'Chandrayaan-2 (ISRO)', CH2O: 'Chandrayaan-2 Orbiter (ISRO)',
    CH2L: 'Chandrayaan-2 Lander (ISRO)', CH3: 'Chandrayaan-3 (ISRO)', EM2: 'Artemis II (NASA)',
    EM3: 'Artemis III (NASA)', LTB: 'Lunar Trailblazer (NASA)', LND1: 'Lunar Node 1', ARGO: 'ArgoMoon', LFL: 'Lunar Flashlight'
  };
  var SHORT = { LRO: 'LRO (NASA)', KPLO: 'Danuri (Korea)', CAPS: 'CAPSTONE (NASA)', CH2: 'Chandrayaan-2 (India)',
                CH2O: 'Chandrayaan-2 (India)', CH2L: 'Chandrayaan-2 lander (India)', CH3: 'Chandrayaan-3 (India)',
                EM2: 'Artemis II (NASA)', EM3: 'Artemis III (NASA)', LTB: 'Lunar Trailblazer (NASA)' };
  function attrs(tag) { var o = {}; tag.replace(/([A-Za-z]+)="([^"]*)"/g, function (_, k, v) { o[k] = v; return ''; }); return o; }

  function parseFeed(xml) {
    var out = [], station = null, re = /<station\b[^>]*\/>|<dish\b[^>]*>[\s\S]*?<\/dish>/g, mt;
    while ((mt = re.exec(xml))) {
      var s = mt[0];
      if (s.lastIndexOf('<station', 0) === 0) { station = attrs(s); continue; }
      var dish = attrs(s.match(/<dish\b[^>]*>/)[0]);
      var targets = (s.match(/<target\b[^>]*\/>/g) || []).map(attrs);
      var downs = (s.match(/<downSignal\b[^>]*\/>/g) || []).map(attrs);
      var ups = (s.match(/<upSignal\b[^>]*\/>/g) || []).map(attrs);
      targets.forEach(function (tg) {
        var code = String(tg.name || '').toUpperCase();
        if (!MOON_CRAFT[code]) return;
        var mine = function (x) { return String(x.spacecraft || '').toUpperCase() === code && x.active === 'true'; };
        var dn = downs.filter(mine)[0];
        out.push({ code: code, craft: MOON_CRAFT[code], short: SHORT[code] || MOON_CRAFT[code], dish: dish.name,
                   station: station ? station.name : '', complex: station ? station.friendlyName : '',
                   dishEl: +dish.elevationAngle, rangeKm: +tg.downlegRange > 0 ? +tg.downlegRange : null,
                   rtltS: +tg.rtlt > 0 ? +tg.rtlt : null,
                   down: dn ? { band: dn.band, dBm: +dn.power, bps: +dn.dataRate } : null,
                   up: ups.some(mine) });
      });
    }
    var ts = xml.match(/<timestamp>(\d+)<\/timestamp>/);
    return { time: ts ? +ts[1] : null, moon: out };
  }

  /* Does our math agree with what NASA is doing? A dish working a Moon spacecraft needs the Moon above that
     complex's horizon. Returns {station, el, agree}, or null for a complex we do not know. */
  function crossCheck(entry, ms) {
    var st = null;
    for (var k = 0; k < DSN.length; k++) if (DSN[k].code === entry.station) st = DSN[k];
    if (!st) return null;
    var el = moonEl(st, ms);
    return { station: st, el: el, agree: el > 0 };
  }

  function live(fetchImpl) {
    var f = fetchImpl || root.fetch.bind(root);
    return f(FEED + '?r=' + Date.now(), { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('DSN Now answered ' + r.status);
      return r.text();
    }).then(parseFeed);
  }

  root.Radio = { DSN: DSN, MIN_EL: MIN_EL, REF: REF, moon: moon, gmst: gmst, moonEl: moonEl, bestDish: bestDish,
                 coverage: coverage, budget: budget, signalAt: signalAt, linkPct: linkPct,
                 parseFeed: parseFeed, crossCheck: crossCheck, live: live, FEED: FEED };
})(typeof window !== 'undefined' ? window : globalThis);
