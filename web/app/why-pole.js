/* moonseal: "Why the south pole", a plain-language explainer.
   Every outside fact is cited (NASA pages and two peer-reviewed papers, see SOURCES). Every number about a
   site is computed live by the same planner the site panel uses (JPL Horizons DE441 + LOLA skyline), for
   calendar 2026, so this sheet can never disagree with the rest of the app.
   The diagram is computed, not drawn: a 32 km slice at one scale on both axes, the Sun's rays at the true
   1.5°, and the lit / never-lit ground found by sweeping those rays from both sides over the profile. */
window.WhyPole = (function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var D2R = Math.PI / 180;
  var N26 = 8761;                       // hours of 2026 in the table (same bound as the panel's year facts)
  var built = false, opener = null, filled = false;

  var SRC = {
    shadows: ['NASA Science, “Shadows near the Moon’s South Pole”', 'https://science.nasa.gov/resource/shadows-near-the-moons-south-pole/',
      'At the poles the Sun is never more than 1.5° above or below the horizon; it skims the horizon through 360°; never-lit crater floors are some of the coldest spots in the solar system and trap volatiles, including water ice.'],
    shackleton: ['NASA Science, “Shackleton Crater’s Illuminated Rim & Shadowed Interior”', 'https://science.nasa.gov/resource/shackleton-craters-illuminated-rim-shadowed-interior/',
      'The Moon’s axis is tilted 1.5°, Earth’s 23.5°; rim peaks get almost continual sunlight while the interior stays in shadow; ice in shadowed craters could be a resource and a long-term record.'],
    phenomena: ['NASA Science, “9 Phenomena NASA Astronauts Will Encounter at Moon’s South Pole” (2024)', 'https://science.nasa.gov/solar-system/moon/phenomena-nasa-astronauts-will-encounter-at-moons-south-pole/',
      'Shadows 25 to 50 times longer than the objects casting them; the Sun hovers near the horizon instead of rising and setting; deep craters can dip to −334 °F.'],
    region: ['NASA, “The Lunar South Pole Region” (Moon Base, updated 3 Nov 2026)', 'https://www.nasa.gov/reference/moonbase-environment/',
      'Long-sunlit areas offer milder temperatures, shorter lunar nights and persistent solar power; shadowed regions as low as about −203 °C; ice may record where lunar water came from and how it moved through the inner solar system; some surfaces may be older than 3.85 billion years, older than any Apollo site; NASA plans its Moon Base in this region.'],
    diviner: ['NASA release 09-215, “NASA Lunar Satellite Begins Detailed Mapping of Moon’s South Pole” (2009)', 'https://www3.nasa.gov/home/hqnews/2009/sep/HQ_09-215_LRO_First_Light.html',
      'Diviner: permanently shadowed craters are cold enough to store water ice for billions of years.'],
    lcross: ['Colaprete et al., “Detection of water in the LCROSS ejecta plume”, Science 330, 463–468 (2010)', 'https://doi.org/10.1126/science.1186986',
      'On 9 October 2009 a spent Centaur stage struck the shadowed floor of Cabeus; water ice in the regolith at the impact site: 5.6 ± 2.9% by mass; other volatiles detected.'],
    m3: ['Li et al., “Direct evidence of surface exposed water ice in the lunar polar regions”, PNAS 115, 8907–8912 (2018)', 'https://doi.org/10.1073/pnas.1802345115',
      'Moon Mineralogy Mapper (Chandrayaan-1) spectra show water ice at the surface in polar cold traps; only about 3.5% of cold traps show exposed ice.'],
    water: ['NASA, “How Will We Extract Water on the Moon?”', 'https://www.nasa.gov/general/how-will-we-extract-water-on-the-moon-we-asked-a-nasa-technologist-episode-47/',
      'Living on the Moon will require local resources like water ice, which can be used for life support and fuel.'],
    a2022: ['NASA release, “NASA Identifies Candidate Regions for Landing Next Americans on Moon” (19 Aug 2022)', 'https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/',
      '13 candidate regions, each within six degrees of latitude of the south pole (including Connecting Ridge, Malapert Massif, de Gerlache Rim 2); criteria included slope, communications with Earth and lighting.'],
    a2024: ['NASA release, “NASA Provides Update on Artemis III Moon Landing Regions” (28 Oct 2024)', 'https://www.nasa.gov/news-release/nasa-provides-update-on-artemis-iii-moon-landing-regions/',
      'Nine regions, including Malapert Massif and de Gerlache Rim 2; factors included communication with Earth and lighting.'],
    a2026: ['NASA, “NASA Outlines Preliminary Artemis III Mission Plans” (13 May 2026)', 'https://www.nasa.gov/missions/artemis/artemis-3/nasa-outlines-preliminary-artemis-iii-mission-plans/',
      'Artemis III is now a crewed test flight in Earth orbit; crewed landing missions go to the south-pole region, the next landing with Artemis IV.']
  };
  var ORDER = ['shadows', 'shackleton', 'phenomena', 'region', 'diviner', 'lcross', 'm3', 'water', 'a2022', 'a2024', 'a2026'];
  function cite(k) { return '<a class="why-cite" href="#why-src-' + k + '" data-cite="' + k + '" aria-label="Source ' + (ORDER.indexOf(k) + 1) + '">' + (ORDER.indexOf(k) + 1) + '</a>'; }

  /* sites in the comparison table: [id, short description] */
  var ROWS = [
    ['connecting_ridge', 'High ridge, Shackleton–de Gerlache'],
    ['moon_base_zero', 'MoonDAO’s base, same ridge'],
    ['malapert_massif', 'Massif on the Earth-facing side'],
    ['de_gerlache_rim2', 'Crater rim'],
    ['apollo11', 'Equator, for contrast']
  ];

  /* ---------------------------------------------------------------- live numbers (2026) */
  function siteById(id) { var S = (window.__ui && __ui.SITES) || window.LUNAR_SITES || []; return S.find(function (s) { return s.id === id; }); }
  function yearStats(site) {
    var m = Model.compute(site), n = Math.min(N26, Model.n), sun = 0, ear = 0, run = 0, longest = 0;
    for (var i = 0; i < n; i++) { sun += m.sunUp[i]; ear += m.earUp[i]; run = m.sunUp[i] ? 0 : run + 1; if (run > longest) longest = run; }
    return { sun: sun / n, ear: ear / n, longest: longest };
  }
  function earthRange(site) {
    var n = Math.min(N26, Model.n), lo = 99, hi = -99;
    for (var i = 0; i < n; i++) { var e = LunarEphem.azel(site.lat, site.lon, i, site.elev_m || 0).earthEl; if (e < lo) lo = e; if (e > hi) hi = e; }
    return { lo: lo, hi: hi };
  }
  function p1(x) { return (Math.round(x * 1000) / 10).toFixed(1) + '%'; }
  function dur(h) { if (h < 48) return h + ' h'; var d = Math.floor(h / 24), r = h - d * 24; return d + ' d' + (r ? ' ' + r + ' h' : ''); }
  function sdeg(x) { return (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(1) + '°'; }

  function fill() {
    if (filled || !window.Model || !Model.n) return;
    var out = {};
    ROWS.forEach(function (r) { var s = siteById(r[0]); if (s) out[r[0]] = yearStats(s); });
    var cr = siteById('connecting_ridge'), er = cr ? earthRange(cr) : null;
    var set = function (k, v) { document.querySelectorAll('#why [data-k="' + k + '"]').forEach(function (el) { el.textContent = v; }); };
    Object.keys(out).forEach(function (id) {
      var o = out[id];
      set(id + '.sun', p1(o.sun)); set(id + '.ear', p1(o.ear)); set(id + '.dark', dur(o.longest));
      var bar = $('#why tr[data-site="' + id + '"] .why-bar i'); if (bar) bar.style.width = (o.sun * 100).toFixed(1) + '%';
      var ebar = $('#why tr[data-site="' + id + '"] .why-bar.e i'); if (ebar) ebar.style.width = (o.ear * 100).toFixed(1) + '%';
    });
    if (er) { set('cr.elo', sdeg(er.lo)); set('cr.ehi', sdeg(er.hi)); }
    filled = true;
  }

  /* ---------------------------------------------------------------- the diagram (computed) */
  function diagram() {
    var K = 22.5, MX = 34, Y0 = 150, W = MX * 2 + 32 * K, H = 238;   // 22.5 px per km on BOTH axes
    var X = function (x) { return MX + x * K; }, Y = function (z) { return Y0 - z * K; };
    // illustrative slice: a ridge, then a deep bowl crater (km). Monotone cubic through these knots.
    var knots = [[-1.6, 0.05], [0, 0.15], [1.5, 0.35], [3, 0.9], [4.2, 1.45], [5, 1.62], [5.8, 1.5], [6.6, 1.25], [8, 0.4], [9.5, -0.9], [11, -2.1],
      [12.4, -2.85], [13.5, -3.0], [16, -3.05], [18.5, -2.95], [20, -2.5], [22, -1.4], [24, -0.3], [25.8, 0.55], [27, 0.95], [28.2, 0.85], [30, 0.7], [32, 0.75], [33.6, 0.8]];
    var pts = monotone(knots, 0.05);                     // [[x, z], ...] every 50 m
    var t = Math.tan(1.5 * D2R), te = Math.tan(3 * D2R);  // Sun at its highest; Earth at an example +3°
    // sweep the rays: lit from the left (Sun on the far side) and from the right (two weeks later)
    var n = pts.length, litL = new Array(n), litR = new Array(n), mL = new Array(n), mR = new Array(n);
    var m = -1e9;
    for (var i = 0; i < n; i++) { if (i) m = Math.max(m, pts[i - 1][1]) - t * (pts[i][0] - pts[i - 1][0]); mL[i] = m; litL[i] = pts[i][1] >= m - 1e-9; }
    m = -1e9;
    for (i = n - 1; i >= 0; i--) { if (i < n - 1) m = Math.max(m, pts[i + 1][1]) - t * (pts[i + 1][0] - pts[i][0]); mR[i] = m; litR[i] = pts[i][1] >= m - 1e-9; }
    var ground = pts.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); });
    var terrain = 'M' + X(pts[0][0]).toFixed(1) + ',' + H + ' L' + ground.join(' L') + ' L' + X(pts[n - 1][0]).toFixed(1) + ',' + H + 'Z';
    // never-lit air volume over never-lit ground: below both shadow lines
    var dark = [], darkTop = [];
    for (i = 0; i < n; i++) if (!litL[i] && !litR[i] && pts[i][1] < 1.2) { dark.push(i); }
    var shadowPath = '';
    if (dark.length) {
      var a = dark[0], b = dark[dark.length - 1], top = [], bot = [];
      for (i = a; i <= b; i++) { top.push(X(pts[i][0]).toFixed(1) + ',' + Y(Math.min(mL[i], mR[i])).toFixed(1)); bot.push(X(pts[i][0]).toFixed(1) + ',' + Y(pts[i][1]).toFixed(1)); }
      shadowPath = 'M' + top.join(' L') + ' L' + bot.reverse().join(' L') + 'Z';
      darkTop = [X(pts[a][0]), X(pts[b][0])];
    }
    function runsOf(flag) {               // polyline runs where flag[i] is true
      var out = [], cur = null;
      for (var j = 0; j < n; j++) { if (flag[j]) { (cur = cur || []).push(ground[j]); } else if (cur) { out.push(cur); cur = null; } }
      if (cur) out.push(cur);
      return out.filter(function (r) { return r.length > 2; }).map(function (r) { return 'M' + r.join(' L'); }).join(' ');
    }
    var onlyR = litR.map(function (v, j) { return v && !litL[j]; });
    var peak = pts.reduce(function (best, p) { return p[0] > 2 && p[0] < 8 && p[1] > best[1] ? p : best; }, [0, -9]);
    var rim = pts.reduce(function (best, p) { return p[0] > 23 && p[0] < 31 && p[1] > best[1] ? p : best; }, [0, -9]);
    var floorP = pts.reduce(function (best, p) { return p[0] > 12 && p[0] < 20 && p[1] < best[1] ? p : best; }, [0, 9]);
    // rays from the left (true 1.5°), the grazing one through the ridge top
    var rayL = function (x, dz) { return peak[1] + dz - t * (x - peak[0]); };
    var rays = [0, 0.55, 1.1, 1.65].map(function (dz, k) {
      return '<line class="ray' + (k ? '' : ' graze') + '" x1="' + X(-1.4) + '" y1="' + Y(rayL(-1.4, dz)).toFixed(1) + '" x2="' + X(33.5) + '" y2="' + Y(rayL(33.5, dz)).toFixed(1) + '"/>';
    }).join('');
    var rayR = function (x, dz) { return rim[1] + dz - t * (rim[0] - x); };
    var raysR = [0, 0.55].map(function (dz) {       // stop each ray where it meets the ground: light does not pass through the ridge
      var xe = -1.4;
      for (var xx = 33.5; xx > -1.4; xx -= 0.05) { if (rayR(xx, dz) < zAt(pts, xx) - 0.002) { xe = xx; break; } }
      return '<line class="ray later" x1="' + X(33.5) + '" y1="' + Y(rayR(33.5, dz)).toFixed(1) + '" x2="' + X(xe).toFixed(1) + '" y2="' + Y(rayR(xe, dz)).toFixed(1) + '"/>';
    }).join('');
    // Earth at +3° (an example inside its real range): line of sight from the ridge top clears; from the floor it hits the far wall
    var ex = 32.9, ez = peak[1] + te * (ex - peak[0]);
    var hit = null, fx = floorP[0] - 2.5, fz = zAt(pts, fx) + 0.02;
    for (var x = fx + 0.05; x < 33; x += 0.05) { var zl = fz + te * (x - fx), zg = zAt(pts, x); if (zl < zg) { hit = [x, zg]; break; } }
    var sunY = Y(rayL(-1.05, 0.82)), sunX = X(-1.05);
    var laterY = Y(rayR(33.05, 0.25)), laterX = X(33.05);
    var sb0 = X(8.4), sb1 = X(13.4), sby = Y(5.55);
    var s = '';
    s += '<svg class="why-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-labelledby="whyFigT whyFigD" preserveAspectRatio="xMidYMid meet">';
    s += '<title id="whyFigT">Sunlight at the lunar south pole, drawn to scale</title>';
    s += '<desc id="whyFigD">A 32 kilometre slice of polar terrain at one scale on both axes. Sunlight arrives at most 1.5 degrees above the horizon, so the top of a ridge is lit while the floor of a deep crater is never lit from either side and stays cold enough to hold ice. Earth, a few degrees above the horizon, is in view from the ridge top and blocked from the crater floor.</desc>';
    s += '<defs>' +
      '<linearGradient id="wgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05060a"/><stop offset="1" stop-color="#0b0d14"/></linearGradient>' +
      '<linearGradient id="wgGround" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a4a50"/><stop offset=".35" stop-color="#2a2a2f"/><stop offset="1" stop-color="#141417"/></linearGradient>' +
      '<linearGradient id="wgDark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1222" stop-opacity=".25"/><stop offset=".55" stop-color="#060b16" stop-opacity=".78"/><stop offset="1" stop-color="#03060d" stop-opacity=".95"/></linearGradient>' +
      '<radialGradient id="wgSun"><stop offset="0" stop-color="#fff4d6"/><stop offset=".45" stop-color="#ffcf6e"/><stop offset="1" stop-color="#ffb340" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="wgEarth" cx=".38" cy=".35" r=".75"><stop offset="0" stop-color="#bfe2ff"/><stop offset=".5" stop-color="#5eb1ff"/><stop offset="1" stop-color="#1d4f8a"/></radialGradient>' +
      '<filter id="wfGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>' +
      '</defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#wgSky)"/>';
    // scale bar (top, in the empty sky)
    s += '<g class="scale"><line x1="' + sb0 + '" y1="' + sby + '" x2="' + sb1 + '" y2="' + sby + '"/><line x1="' + sb0 + '" y1="' + (sby - 4) + '" x2="' + sb0 + '" y2="' + (sby + 4) + '"/><line x1="' + sb1 + '" y1="' + (sby - 4) + '" x2="' + sb1 + '" y2="' + (sby + 4) + '"/>' +
      '<text class="lbl" x="' + ((sb0 + sb1) / 2) + '" y="' + (sby - 9) + '" text-anchor="middle">5 km · same scale up and across</text></g>';
    s += '<g class="rays">' + rays + raysR + '</g>';
    s += '<path class="terrain" d="' + terrain + '" fill="url(#wgGround)"/>';
    if (shadowPath) s += '<path class="psr" d="' + shadowPath + '" fill="url(#wgDark)"/>';
    s += '<path class="lit" d="' + runsOf(litL) + '"/>';
    s += '<path class="lit later" d="' + runsOf(onlyR) + '"/>';
    s += '<path class="never" d="' + runsOf(litL.map(function (v, j) { return !v && !litR[j] && pts[j][1] < 1.2; })) + '"/>';
    // ice glints on the never-lit floor
    var ice = '';
    for (var q = 0; q < 9; q++) { var ix = floorP[0] - 3.1 + q * 0.78 + (q % 2) * 0.21, iz = zAt(pts, ix); ice += '<circle cx="' + X(ix).toFixed(1) + '" cy="' + (Y(iz) - 2.6 - (q % 3) * 1.4).toFixed(1) + '" r="' + (q % 3 ? 1.3 : 1.8) + '"/>'; }
    s += '<g class="ice">' + ice + '</g>';
    // Earth line of sight
    s += '<line class="los" x1="' + X(peak[0]) + '" y1="' + Y(peak[1]) + '" x2="' + X(ex - 0.35) + '" y2="' + Y(peak[1] + te * (ex - 0.35 - peak[0])).toFixed(1) + '"/>';
    if (hit) {
      s += '<line class="los blocked" x1="' + X(fx) + '" y1="' + Y(fz) + '" x2="' + X(hit[0]).toFixed(1) + '" y2="' + Y(hit[1]).toFixed(1) + '"/>';
      var hx = X(hit[0]), hy = Y(hit[1]);
      s += '<g class="xmark"><line x1="' + (hx - 4) + '" y1="' + (hy - 4) + '" x2="' + (hx + 4) + '" y2="' + (hy + 4) + '"/><line x1="' + (hx - 4) + '" y1="' + (hy + 4) + '" x2="' + (hx + 4) + '" y2="' + (hy - 4) + '"/></g>';
    }
    // Sun (direction only), Sun two weeks later (direction only), Earth (direction only)
    s += '<g class="sun"><circle cx="' + sunX + '" cy="' + sunY.toFixed(1) + '" r="22" fill="url(#wgSun)"/><circle cx="' + sunX + '" cy="' + sunY.toFixed(1) + '" r="7.5" fill="#fff1cc"/></g>';
    s += '<g class="sun later"><circle cx="' + laterX + '" cy="' + laterY.toFixed(1) + '" r="7" /></g>';
    s += '<g class="earth"><circle cx="' + X(ex) + '" cy="' + Y(ez).toFixed(1) + '" r="13" fill="#5eb1ff" opacity=".28" filter="url(#wfGlow)"/><circle cx="' + X(ex) + '" cy="' + Y(ez).toFixed(1) + '" r="8" fill="url(#wgEarth)"/></g>';
    // labels (wide screens) and numbered markers (narrow screens)
    var L = function (x, y, txt, cls, anchor) { return '<text class="lbl ' + (cls || '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" text-anchor="' + (anchor || 'start') + '">' + txt + '</text>'; };
    var lab = '';
    lab += L(sunX - 6, sunY - 30, 'Sun, at most 1.5° up', 'sunc', 'start');
    lab += L(sunX - 6, sunY - 16, 'true angle', 'dim', 'start');
    lab += L(X(peak[0]) + 7, Y(peak[1]) - 40, 'Ridge top: lit most of the time', 'sunc', 'start');
    lab += '<line class="lead" x1="' + X(peak[0]) + '" y1="' + (Y(peak[1]) - 50) + '" x2="' + X(peak[0]) + '" y2="' + (Y(peak[1]) - 6) + '"/>';
    var cx = X(floorP[0]), cy = Y(floorP[1]);
    lab += L(cx, cy - 46, 'Never lit from any side', 'ice-c', 'middle');
    lab += L(cx, cy - 32, 'as cold as about −203 °C', 'dim', 'middle');
    lab += L(cx, cy - 18, 'ice can last here', 'dim', 'middle');
    lab += L(X(ex) - 14, Y(ez) - 18, 'Earth, a few degrees up', 'earthc', 'end');
    lab += L(X(20.3), Y(peak[1] + te * (20.3 - peak[0])) - 8, 'in view from the ridge', 'earthc small', 'middle');
    if (hit) lab += L(X(hit[0]) + 8, Y(hit[1]) + 16, 'blocked from the floor', 'earthc small', 'start');
    lab += L(laterX - 13, laterY - 9, 'Sun, two weeks later', 'dim small', 'end');
    s += '<g class="labels">' + lab + '</g>';
    var M = function (x, y, k) { return '<g class="mk"><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="21"/><text x="' + x.toFixed(1) + '" y="' + (y + 8).toFixed(1) + '" text-anchor="middle">' + k + '</text></g>'; };
    s += '<g class="markers">' + M(sunX + 40, sunY - 34, 1) + M(X(peak[0]), Y(peak[1]) - 44, 2) + M(cx, cy - 46, 3) + M(X(ex) - 44, Y(ez) - 12, 4) + '</g>';
    s += '</svg>';
    return s;
  }
  function zAt(pts, x) {
    var step = pts[1][0] - pts[0][0], i = Math.max(0, Math.min(pts.length - 2, Math.floor((x - pts[0][0]) / step))), f = (x - pts[i][0]) / step;
    return pts[i][1] * (1 - f) + pts[i + 1][1] * f;
  }
  function monotone(k, step) {          // Fritsch-Carlson monotone cubic: smooth, no overshoot, z stays a function of x
    var n = k.length, d = [], mm = [], i;
    for (i = 0; i < n - 1; i++) d.push((k[i + 1][1] - k[i][1]) / (k[i + 1][0] - k[i][0]));
    mm[0] = d[0]; mm[n - 1] = d[n - 2];
    for (i = 1; i < n - 1; i++) mm[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (i = 0; i < n - 1; i++) {
      if (d[i] === 0) { mm[i] = mm[i + 1] = 0; continue; }
      var a = mm[i] / d[i], b = mm[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { var tt = 3 / Math.sqrt(h); mm[i] = tt * a * d[i]; mm[i + 1] = tt * b * d[i]; }
    }
    var out = [], seg = 0;
    for (var x = k[0][0]; x <= k[n - 1][0] + 1e-9; x += step) {
      while (seg < n - 2 && x > k[seg + 1][0]) seg++;
      var x0 = k[seg][0], x1 = k[seg + 1][0], hh = x1 - x0, u = (x - x0) / hh;
      var h00 = 2 * u * u * u - 3 * u * u + 1, h10 = u * u * u - 2 * u * u + u, h01 = -2 * u * u * u + 3 * u * u, h11 = u * u * u - u * u;
      out.push([x, h00 * k[seg][1] + h10 * hh * mm[seg] + h01 * k[seg + 1][1] + h11 * hh * mm[seg + 1]]);
    }
    return out;
  }

  /* ---------------------------------------------------------------- the sheet */
  function K(k) { return '<b class="num" data-k="' + k + '">…</b>'; }
  function build() {
    var host = document.createElement('div');
    host.id = 'why'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-labelledby', 'whyTitle');
    var rows = ROWS.map(function (r) {
      var s = siteById(r[0]); if (!s) return '';
      return '<tr data-site="' + r[0] + '"><th scope="row"><button class="why-nm" data-site="' + r[0] + '">' + s.name + '</button><span class="ds">' + r[1] + '</span></th>' +
        '<td><span class="v">' + K(r[0] + '.sun') + '</span><span class="why-bar"><i></i></span></td>' +
        '<td><span class="v">' + K(r[0] + '.ear') + '</span><span class="why-bar e"><i></i></span></td>' +
        '<td class="dk">' + K(r[0] + '.dark') + '</td>' +
        '<td class="go"><button class="why-go" data-site="' + r[0] + '" aria-label="Show ' + s.name + ' on the Moon">Show me</button></td></tr>';
    }).join('');
    host.innerHTML =
      '<div class="sheet glass glass-strong why-sheet" tabindex="-1">' +
      '<div class="why-head"><div><div class="eyebrow">Field guide · the landing zone</div><h2 id="whyTitle">Why the south pole</h2></div>' +
      '<button class="icon-btn" id="whyClose" aria-label="Close">✕</button></div>' +
      '<p class="why-lede">NASA’s next crewed landings and its planned Moon Base all aim at one small region: the area around the Moon’s south pole' + cite('a2026') + cite('region') + '. ' +
      'It has ridges in near-constant sunlight, crater floors cold enough to keep ice for billions of years, and some of the oldest ground on the Moon. ' +
      'The same geometry makes it unforgiving: a hill kilometers away decides whether a lander has power and can talk to Earth. That is what moonseal computes.</p>' +
      '<figure class="why-fig">' + diagram() +
      '<figcaption>A 32 km slice through a ridge and a deep polar crater, drawn at the same scale up and across: no vertical exaggeration, so the light really arrives this flat. The Sun circles the horizon once every lunar day; from any side, the crater floor stays dark. Terrain is illustrative; the Sun’s 1.5° is not.</figcaption></figure>' +
      '<ol class="why-key">' +
        '<li><b class="sunc">Sun</b>, never more than about 1.5° above the horizon, drawn at that true angle.</li>' +
        '<li><b class="sunc">Ridge top</b>: lit most of the time, from one side and then the other.</li>' +
        '<li><b class="ice-c">Crater floor</b>: never lit, as cold as about −203 °C, so ice can last.</li>' +
        '<li><b class="earthc">Earth</b>, a few degrees up: in view from the ridge, blocked from the floor.</li></ol>' +
      '<div class="why-grid">' +
        '<section class="why-card sun"><div class="why-k"><i></i>Light</div><h3>The Sun never climbs</h3>' +
          '<p>Earth’s axis is tilted 23.5°; that tilt gives us seasons. The Moon’s is tilted only about 1.5°, so at its poles the Sun never gets more than about 1.5° above the horizon' + cite('shackleton') + cite('shadows') + '. It does not rise and set: it circles the horizon, and shadows stretch 25 to 50 times longer than whatever casts them' + cite('phenomena') + '.</p>' +
          '<p>So height wins. A high ridge can stay in sunlight most of the time: steadier solar power, milder temperatures, shorter nights' + cite('region') + '. In 2026 the Sun is up ' + K('connecting_ridge.sun') + ' of the time on Connecting Ridge, and its longest darkness lasts ' + K('connecting_ridge.dark') + '. At the Apollo 11 site on the equator: ' + K('apollo11.sun') + ', with nights of ' + K('apollo11.dark') + '.</p></section>' +
        '<section class="why-card ice"><div class="why-k"><i></i>Ice</div><h3>Cold traps keep water</h3>' +
          '<p>Crater floors that sunlight never reaches are some of the coldest spots in the solar system, as cold as about −203 °C (−334 °F)' + cite('shadows') + cite('region') + '. Water molecules that drift in freeze and stay, for up to billions of years' + cite('diviner') + '.</p>' +
          '<p>In 2009 NASA’s LCROSS crashed a spent rocket stage into the dark floor of Cabeus crater: the plume carried water, about 5.6 ± 2.9% of the soil by mass' + cite('lcross') + '. In 2018 the Moon Mineralogy Mapper on India’s Chandrayaan-1 showed ice exposed at the surface in polar cold traps, in patches: about 3.5% of cold traps show it' + cite('m3') + '.</p>' +
          '<p>Why it matters: water ice is a local resource for life support and fuel' + cite('water') + '. How much there is, and exactly where, is still being mapped' + cite('region') + '.</p></section>' +
        '<section class="why-card age"><div class="why-k"><i></i>Time</div><h3>A record of the early solar system</h3>' +
          '<p>Some ground near the south pole may be more than 3.85 billion years old, older than any Apollo landing site' + cite('region') + '.</p>' +
          '<p>The ice is an archive too: its makeup, age and layering could show where the Moon’s water came from and how water moved through the inner solar system over billions of years' + cite('region') + cite('shackleton') + '.</p></section>' +
      '</div>' +
      '<section class="why-catch"><div class="why-k"><i></i>The catch</div><h3>Sun and Earth both sit on the skyline</h3>' +
        '<p>Earth hangs low here too. From Connecting Ridge in 2026, Earth’s elevation swings between ' + K('cr.elo') + ' and ' + K('cr.ehi') + ' as the Moon slowly wobbles (libration). With the Sun and Earth this close to the horizon, a hill or a crater rim kilometers away can cut a lander’s power or its direct radio link to Earth for days. NASA weighed exactly these, lighting and communication with Earth, when it chose candidate landing regions' + cite('a2022') + cite('a2024') + '. moonseal computes both, hour by hour:</p>' +
        '<div class="why-tabwrap"><table class="why-tab"><thead><tr><th scope="col">Site · 2026</th><th scope="col"><span class="lg">Sun up</span><span class="sm">Sun</span></th><th scope="col"><span class="lg">Earth in view</span><span class="sm">Earth</span></th><th scope="col"><span class="lg">Longest dark</span><span class="sm">Dark</span></th><th scope="col"><span class="vh">Open</span></th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
        '<div class="cap">Computed by moonseal for every hour of 2026: Sun and Earth from JPL Horizons (DE441), skyline ray-cast from NASA LOLA terrain (240 m per pixel); a body is up when its centre clears the skyline. Line of sight only, not a full radio link budget. Malapert’s 100% rests on a thin margin (see How moonseal works). Apollo 11 lies outside the polar terrain map and uses a bare-sphere horizon.</div>' +
        '<div class="why-actions"><button class="btn light" id="whyMap">Show the Sun and Earth map of the pole</button><button class="btn" id="whyRidge">Open Connecting Ridge</button></div>' +
      '</section>' +
      '<section class="why-nasa"><h4>Where NASA is going</h4><p>In 2022 NASA named 13 candidate regions for the first crewed Artemis landing, all within 6° of latitude of the south pole, and in October 2024 narrowed them to 9; Malapert Massif and de Gerlache Rim 2 are on both lists' + cite('a2022') + cite('a2024') + '. In 2026 NASA made Artemis III a crewed test flight in Earth orbit; the next landing, Artemis IV, still targets the south-pole region' + cite('a2026') + ', where NASA also plans its Moon Base' + cite('region') + '.</p></section>' +
      '<details class="why-src" id="whySrc"><summary>Sources (' + ORDER.length + ')</summary><ol>' +
        ORDER.map(function (k) { var x = SRC[k]; return '<li id="why-src-' + k + '"><a href="' + x[1] + '" target="_blank" rel="noopener">' + x[0] + ' ↗</a><span>' + x[2] + '</span></li>'; }).join('') +
      '</ol><div class="cap">Site numbers are moonseal’s own computation, not NASA’s. Not affiliated with or endorsed by NASA or MoonDAO.</div></details>' +
      '<button class="btn" id="whyDone">Close</button>' +
      '</div>';
    document.body.appendChild(host);
    host.addEventListener('click', function (e) {
      if (e.target === host) return close();
      var go = e.target.closest('.why-go, .why-nm'); if (go) return showSite(go.dataset.site);
      var c = e.target.closest('.why-cite');
      if (c) { e.preventDefault(); var d = $('#whySrc'); d.open = true; var li = document.getElementById('why-src-' + c.dataset.cite); if (li) { li.scrollIntoView({ block: 'center', behavior: 'smooth' }); li.classList.remove('hl'); void li.offsetWidth; li.classList.add('hl'); } }
    });
    $('#whyClose').onclick = close; $('#whyDone').onclick = close;
    $('#whyMap').onclick = showMap;
    $('#whyRidge').onclick = function () { showSite('connecting_ridge'); };
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { e.stopPropagation(); close(); } }, true);
    built = true;
  }
  function isOpen() { var h = document.getElementById('why'); return !!h && h.classList.contains('open'); }
  function open() {
    if (!built) build();
    opener = document.activeElement;
    var host = $('#why'); host.classList.add('open');
    var sh = $('.why-sheet', host); sh.scrollTop = 0;
    sh.focus({ preventScroll: true });
    setTimeout(fill, 60);   // compute after the sheet is on screen (not rAF: busy WebGL frames can starve it)
  }
  function close() {
    var host = $('#why'); if (!host) return;
    host.classList.remove('open');
    if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
  }
  function showSite(id) {
    var s = siteById(id); if (!s || !window.__ui) return;
    close(); __ui.selectSite(s);
  }
  function showMap() {
    close();
    if (!window.__ui) return;
    __ui.setView('pole');
    var b = $('#mapBtn'); if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
  }
  return { open: open, close: close, isOpen: isOpen };
})();
