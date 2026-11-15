/* moonseal field guide: one block in the site panel with four tabs.
   - Conditions: computed by moonseal for every hour of 2026 (same table, same bound and same rules as the
     panel and the "Why the south pole" sheet), plus surface gravity from GRAIL's GM.
   - Geology, On Earth, Images: curated sites only, every outside fact cited to its source.
   Pictures: LRO Narrow Angle Camera, NASA/GSFC/Arizona State University, used non-commercially with the
   credit LROC asks for (https://lroc.im-ldi.com/about/terms). */
window.FieldGuide = (function () {
  'use strict';
  var N26 = 8761;                      // hours of 2026 in the table: same bound as why-pole.js and the panel
  var GM = 4902.80011526323;           // km^3/s^2, GRAIL GRGM1200A (PDS label)
  var R_REF = 1737.4;                  // km, lunar reference radius (NASA Moon Fact Sheet; LOLA elevations use it)
  var G_N = 9.80665;                   // m/s^2, standard acceleration of gravity (NIST, exact)

  var SRC = {
    factsheet: ['NASA, Moon Fact Sheet (volumetric mean radius 1737.4 km, surface gravity 1.62 m/s²)', 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/moonfact.html'],
    grail: ['NASA GRAIL gravity model GRGM1200A, PDS label: GM = 4902.80011526323 km³/s²', 'https://pds-geosciences.wustl.edu/grail/grail-l-lgrs-5-rdr-v1/grail_1001/shbdr/gggrx_1200a_shb_l50.xml'],
    nist: ['NIST, standard acceleration of gravity, 9.80665 m/s² (exact)', 'https://physics.nist.gov/cgi-bin/cuu/Value?gn'],
    region: ['NASA, “The Lunar South Pole Region” (Moon Base)', 'https://www.nasa.gov/reference/moonbase-environment/'],
    ridge: ['LROC, “Traversing the Shackleton de Gerlache Ridge” (14 March 2023)', 'https://www.lroc.asu.edu/images/1247'],
    shackleton: ['Zuber et al. (2012), Nature 486, 378: Shackleton is 21 km wide and 4.1 km deep (MIT News summary)', 'https://news.mit.edu/2012/shackletons-crater-0620'],
    malapert: ['LROC, “Malapert Massif” (14 March 2023)', 'https://www.lroc.asu.edu/posts/1294'],
    degerlache: ['USGS Gazetteer of Planetary Nomenclature, “de Gerlache”', 'https://planetarynames.wr.usgs.gov/Feature/1439'],
    a2022: ['NASA, “NASA Identifies Candidate Regions for Landing Next Americans on Moon” (2022)', 'https://www.nasa.gov/news-release/nasa-identifies-candidate-regions-for-landing-next-americans-on-moon/'],
    im1: ['LROC, “Intuitive Machines IM-1 On The Moon!” (26 February 2024)', 'https://www.lroc.asu.edu/images/1360'],
    im2: ['LROC, “IM-2 Athena Seen Obliquely” (10 March 2025)', 'https://www.lroc.asu.edu/images/1408'],
    mouton: ['DLR (German Aerospace Center), “IM-2 landing site: Mons Mouton”', 'https://www.dlr.de/en/latest/news/2025/new-lunar-mission-to-demonstrate-search-for-water-ice-at-moon-s-south-pole/im-2-landing-site-mons-mouton'],
    apollo11: ['LROC, “High Noon at Tranquility Base”', 'https://www.lroc.asu.edu/images/65'],
    nps_gc: ['US National Park Service, Grand Canyon park statistics (average depth 1 mile, 1.6 km; average rim to rim 10 miles, 16 km)', 'https://www.nps.gov/grca/learn/management/statistics.htm'],
    nps_denali: ['US National Park Service, “Denali” (20,310 ft; three and one-half vertical miles above its base)', 'https://www.nps.gov/articles/denali.htm'],
    wmo: ['WMO Weather and Climate Extremes Archive: lowest temperature, −89.2 °C, Vostok Station, Antarctica, 21 July 1983', 'https://wmo.int/asu-map?map=Temp_020'],
    iceland: ['NASA, “NASA’s Artemis II Crew Uses Iceland Terrain for Lunar Training”', 'https://science.nasa.gov/missions/artemis/nasas-artemis-ii-crew-uses-iceland-terrain-for-lunar-training/'],
    arizona: ['NASA, “Behind the Scenes of a NASA ‘Moonwalk’ in the Arizona Desert”', 'https://science.nasa.gov/missions/artemis/behind-the-scenes-of-a-nasa-moonwalk-in-the-arizona-desert/']
  };
  var CREDIT = 'NASA/GSFC/Arizona State University';

  /* ---------------------------------------------------------------- curated sites */
  // Text uses {cite:key} markers; numbers come from the cited source, never from guesswork.
  var RIDGE_IMG = { src: 'app/img/sites/ridge.jpg', w: 1100, h: 1100, src_page: 'https://www.lroc.asu.edu/images/1247',
    alt: 'Oblique view of the rim of Shackleton crater and the ridge that runs toward de Gerlache crater',
    caption: 'The rim of Shackleton crater (left) and the ridge to de Gerlache running from middle left to upper right; the ridgeline is about 14 km long. NAC M1348682369LR.' };
  var SHACK_GEO = 'Shackleton crater beside it is 21 km wide and 4.1 km deep{cite:shackleton}; its floor has been in shadow for billions of years{cite:ridge}.';
  var SHACK_EARTH = 'Shackleton crater is 4.1 km deep{cite:shackleton}: about two and a half times the Grand Canyon’s average depth of 1.6 km{cite:nps_gc}.';
  var CURATED = {
    connecting_ridge: {
      geology: ['An ancient ridge between the craters Shackleton and de Gerlache, its ridgeline about 14 km long{cite:ridge}. ' + SHACK_GEO,
        'Why it matters: ridges like this stay in sunlight most of the time while the crater floors beside them stay ice-cold, so a lander could use solar power and still reach shadowed ground{cite:ridge}.'],
      earth: [SHACK_EARTH], images: [RIDGE_IMG] },
    moon_base_zero: {
      geology: ['MoonDAO’s Moon Base Zero sits on the same ridge between Shackleton and de Gerlache, 402 m from NASA’s Connecting Ridge point (moonseal, from MoonDAO’s published coordinates). The ridgeline is about 14 km long{cite:ridge}. ' + SHACK_GEO],
      earth: [SHACK_EARTH], images: [RIDGE_IMG] },
    peak_near_shackleton: {
      geology: ['High ground near the rim of Shackleton crater, one of the 13 candidate regions NASA named in 2022 for the first crewed Artemis landing{cite:a2022}. ' + SHACK_GEO],
      earth: [SHACK_EARTH], images: [] },
    malapert_massif: {
      geology: ['Malapert Massif is thought to be a remnant of the rim of the South Pole-Aitken basin, which formed more than 4 billion years ago{cite:malapert}. Its summit rises more than 5,000 m above its base{cite:malapert}.',
        'It was selected as an Artemis III candidate landing region{cite:malapert}. Its Earth-facing slopes keep Earth in view (see Conditions).'],
      earth: ['Malapert rises more than 5,000 m above its base{cite:malapert}, close to Denali, which towers three and one-half vertical miles (about 5.6 km) above its base{cite:nps_denali}.'],
      images: [{ src: 'app/img/sites/malapert.jpg', w: 1100, h: 1100, src_page: 'https://www.lroc.asu.edu/posts/1294',
        alt: 'Oblique view of Malapert Massif near the lunar south pole',
        caption: 'Malapert Massif, photographed on 3 March 2023 from about 170 km beyond Shackleton crater; the image is 25 km wide in the center. NAC M1432398306LR.' }] },
    de_gerlache_rim2: {
      geology: ['On the rim of de Gerlache, a crater 32.71 km across, named after the Belgian Antarctic explorer Adrien de Gerlache{cite:degerlache}. It is on NASA’s 2022 list of candidate regions{cite:a2022}.',
        'The point moonseal uses is steep: about 20.8° in the LOLA terrain (see Conditions).'],
      earth: ['de Gerlache crater is 32.71 km across{cite:degerlache}, about twice the Grand Canyon’s average rim-to-rim width of 16 km{cite:nps_gc}.'],
      images: [] },
    im1_odysseus: {
      geology: ['Intuitive Machines’ Odysseus touched down on 22 February 2024 at 23:23:53 UTC and came to rest at 80.13° S, 1.44° E, 2,579 m elevation, inside a degraded crater about one kilometer across, on ground sloped about 12°{cite:im1}.'],
      earth: [],
      images: [{ src: 'app/img/sites/im1.jpg', w: 1100, h: 1100, src_page: 'https://www.lroc.asu.edu/images/1360',
        alt: 'LRO image of the Odysseus lander on the Moon, marked by an arrow',
        caption: 'The arrow marks Odysseus. Image 973 m wide, acquired 24 February 2024. NAC M1463440322L.' }] },
    im2_athena: {
      geology: ['Athena reached the surface on 6 March 2025 near the center of Mons Mouton. It hit the surface faster than intended and ended up on its side inside a 20 m crater at 84.7906° S, 29.1957° E, yet still sent back over 400 MB of data{cite:im2}. moonseal’s point is the intended site.',
        'Mons Mouton is a mountain about six kilometers high near 85° S, named in 2022 after the American mathematician Melba Roy Mouton (1929-1990){cite:mouton}.'],
      earth: ['Mons Mouton is about six kilometers high{cite:mouton}, close to Denali’s summit at 20,310 ft (6.19 km) above sea level{cite:nps_denali}.'],
      images: [{ src: 'app/img/sites/im2.jpg', w: 1100, h: 1100, src_page: 'https://www.lroc.asu.edu/images/1408',
        alt: 'Oblique LRO image of the Athena lander site on Mons Mouton, marked by an arrow',
        caption: 'The arrow marks Athena, on its side in a 20 m crater. Oblique view about 2 km wide, north to the right, taken on 7 March 2025, about 23.5 hours after touchdown. NAC M1495922531LR.' }] },
    apollo11: {
      geology: ['As the Lunar Module neared the surface, Neil Armstrong saw the landing area was on the rough, bouldery ejecta of West crater; he flew on and set down almost a kilometer to the west with only tens of seconds of fuel left{cite:apollo11}.',
        'Unlike the polar sites, this equatorial plain sees the Sun rise and set, so its nights last about two weeks (see Conditions).'],
      earth: [],
      images: [{ src: 'app/img/sites/apollo11.jpg', w: 1000, h: 1000, src_page: 'https://www.lroc.asu.edu/images/65',
        alt: 'LRO image of Tranquility Base with the Apollo 11 descent stage, the EASEP science package and Little West crater labeled',
        caption: 'Tranquility Base at high noon, 0.53 m per pixel: the descent stage, the EASEP science package and Little West crater, with West crater’s ejecta to the right. NAC M109080308RE.' }] }
  };

  /* ---------------------------------------------------------------- helpers */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function p1(x) { return (x * 100).toFixed(1) + '%'; }
  function deg(x) { return (x < 0 ? '−' : '+') + Math.abs(x).toFixed(1) + '°'; }
  function dur(h) { if (h < 48) return h + ' h'; var d = Math.floor(h / 24), r = h - d * 24; return d + ' d' + (r ? ' ' + r + ' h' : ''); }
  function fmt(n, d) { return n.toLocaleString('en', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }

  var cache = {};
  function conditions(site) {
    var key = site.id + ':' + site.lat + ':' + site.lon;
    if (cache[key]) return cache[key];
    var m = Model.compute(site), n = Math.min(N26, Model.n), sun = 0, ear = 0, rs = 0, re = 0, longS = 0, longE = 0;
    var sLo = 90, sHi = -90, eLo = 90, eHi = -90;
    for (var i = 0; i < n; i++) {
      sun += m.sunUp[i]; ear += m.earUp[i];
      rs = m.sunUp[i] ? 0 : rs + 1; if (rs > longS) longS = rs;
      re = m.earUp[i] ? 0 : re + 1; if (re > longE) longE = re;
      var a = LunarEphem.azel(site.lat, site.lon, i, site.elev_m || 0);
      if (a.sunEl < sLo) sLo = a.sunEl; if (a.sunEl > sHi) sHi = a.sunEl;
      if (a.earthEl < eLo) eLo = a.earthEl; if (a.earthEl > eHi) eHi = a.earthEl;
    }
    var hasElev = site.elev_m != null && isFinite(site.elev_m);
    var r = R_REF + (hasElev ? site.elev_m / 1000 : 0), g = GM / (r * r) * 1000;   // km^3/s^2 / km^2 -> km/s^2 -> m/s^2
    return (cache[key] = { sun: sun / n, ear: ear / n, longS: longS, longE: longE, sLo: sLo, sHi: sHi, eLo: eLo, eHi: eHi,
      g: g, hasElev: hasElev, terrain: !!(site.horizon_deg && site.horizon_deg.length) });
  }

  /* citations: numbered in order of first use inside one guide */
  function citer() {
    var order = [];
    // a boxed badge, never a bare superscript: after a unit ("km", "m/s²") a superscript would read as an exponent
    function cite(k) { var i = order.indexOf(k); if (i < 0) { order.push(k); i = order.length - 1; } return '<a class="fg-cite" href="' + SRC[k][1] + '" target="_blank" rel="noopener" title="' + esc(SRC[k][0]) + '" aria-label="Source ' + (i + 1) + '">' + (i + 1) + '</a>'; }
    function text(s) { return esc(s).replace(/\{cite:([a-z0-9_]+)\}/g, function (_, k) { return cite(k); }); }
    function list() {
      return order.length ? '<details class="fg-src"><summary>Sources (' + order.length + ')</summary><ol>' + order.map(function (k) {
        return '<li><a href="' + SRC[k][1] + '" target="_blank" rel="noopener">' + esc(SRC[k][0]) + '</a></li>'; }).join('') + '</ol></details>' : '';
    }
    return { cite: cite, text: text, list: list };
  }

  /* ---------------------------------------------------------------- render */
  function tile(k, v, s) { return '<div class="fg-t"><div class="fg-k">' + k + '</div><div class="fg-v num">' + v + '</div>' + (s ? '<div class="fg-s">' + s + '</div>' : '') + '</div>'; }

  function conditionsPane(site, c, C) {
    var weight = 1000 * c.g;
    return '<div class="fg-grid">' +
      tile('Sunlight · 2026', p1(c.sun), 'power') +
      tile('Earth in view · 2026', p1(c.ear), 'direct radio contact') +
      tile('Longest night', dur(c.longS), 'battery has to last this') +
      tile('Longest Earth blackout', dur(c.longE), 'no direct link this long') +
      tile('Sun elevation · 2026', deg(c.sLo) + ' to ' + deg(c.sHi), 'above the flat horizon') +
      tile('Earth elevation · 2026', deg(c.eLo) + ' to ' + deg(c.eHi), 'above the flat horizon') +
      (site.elev_m != null ? tile('Elevation', fmt(Math.round(site.elev_m)) + ' m', 'LOLA, above 1,737.4 km') : '') +
      (site.slope_deg != null ? tile('Slope', site.slope_deg.toFixed(1) + '°', 'LOLA terrain') : '') +
      '</div>' +
      '<div class="fg-gravity"><div class="fg-k">Surface gravity</div><div class="fg-gv"><b class="num">' + c.g.toFixed(3) + ' m/s²</b><span>' + (c.g / G_N).toFixed(3) + ' of Earth’s standard gravity, about one sixth</span></div>' +
        '<p>A 1,000 kg lander weighs ' + fmt(Math.round(weight)) + ' N here, against ' + fmt(Math.round(1000 * G_N)) + ' N on Earth. ' +
        'Point-mass estimate from GRAIL’s GM' + C.cite('grail') + ' at ' + (c.hasElev ? 'the site’s distance from the Moon’s center (reference radius 1,737.4 km' + C.cite('factsheet') + ' plus its elevation)' : 'the reference radius of 1,737.4 km' + C.cite('factsheet') + ' (no elevation data for this point)') +
        '; Earth’s standard gravity is 9.80665 m/s²' + C.cite('nist') + '. Local gravity anomalies are not included.</p></div>' +
      (site.lat <= -75.2 ? '<div class="fg-temp"><div class="fg-k">Temperature, regional</div><p>Some permanently shadowed crater floors near the pole reach about −203 °C, while nearby sunlit areas can be much warmer' + C.cite('region') + '. moonseal has no per-site temperature measurement.</p></div>' : '') +
      '<div class="cap">Computed by moonseal for every hour of 2026: Sun and Earth from JPL Horizons, ' + (c.terrain ? 'skyline ray-cast from NASA LOLA terrain' : 'bare-sphere horizon (outside the polar terrain map)') + '. Elevation ranges are above the flat horizon; whether the Sun or Earth is up also depends on the skyline.</div>';
  }

  function earthPane(cur, C, c) {
    var items = (cur ? cur.earth : []).map(function (t) { return '<li>' + C.text(t) + '</li>'; });
    items.push('<li>You would weigh about one sixth of your Earth weight: ' + c.g.toFixed(2) + ' m/s² here against 9.81 m/s² on Earth' + C.cite('nist') + '.</li>');
    items.push('<li>Some never-lit crater floors near the pole reach about −203 °C' + C.cite('region') + ', over 110 °C colder than the lowest air temperature ever measured on Earth: −89.2 °C at Vostok Station, Antarctica, on 21 July 1983' + C.cite('wmo') + '.</li>');
    items.push('<li>Astronauts train for the Moon on Earth: Iceland has served as a lunar stand-in since the Apollo missions, and the Artemis II crew trained there' + C.cite('iceland') + '; in the Arizona desert, NASA astronauts ran moonwalk simulations for the Artemis program' + C.cite('arizona') + '.</li>');
    return '<ul class="fg-list">' + items.join('') + '</ul>';
  }

  function imagesPane(cur) {
    return cur.images.map(function (im) {
      return '<figure class="fg-fig"><a href="' + im.src + '" target="_blank" rel="noopener" aria-label="Open the full image"><img src="' + im.src + '" alt="' + esc(im.alt) + '" width="' + im.w + '" height="' + im.h + '" loading="lazy" decoding="async"></a>' +
        '<figcaption>' + esc(im.caption) + ' <span class="fg-cr">' + CREDIT + '</span> · <a href="' + im.src_page + '" target="_blank" rel="noopener">LROC</a></figcaption></figure>';
    }).join('');
  }

  function html(site) {
    var cur = CURATED[site.id] || null;
    var tabs = [['cond', 'Conditions']];
    if (cur) tabs.push(['geo', 'Geology']);
    tabs.push(['earth', 'On Earth']);
    if (cur && cur.images.length) tabs.push(['img', 'Images · ' + cur.images.length]);
    return '<div class="sect fg" id="fieldGuide"><h3>Field guide</h3>' +
      '<div class="fg-tabs" role="tablist" aria-label="Field guide">' + tabs.map(function (t, i) {
        return '<button role="tab" id="fgt-' + t[0] + '" aria-controls="fgp" aria-selected="' + (i === 0) + '" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join('') + '</div>' +
      '<div class="fg-pane" id="fgp" role="tabpanel"></div></div>';
  }

  function mount(root, site) {
    var host = root.querySelector('#fieldGuide'); if (!host) return;
    var cur = CURATED[site.id] || null, pane = host.querySelector('#fgp');
    function show(tab) {
      host.querySelectorAll('.fg-tabs button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === tab)); });
      pane.setAttribute('aria-labelledby', 'fgt-' + tab);
      var C = citer(), c = conditions(site), body;
      if (tab === 'cond') body = conditionsPane(site, c, C);
      else if (tab === 'geo') body = cur.geology.map(function (t) { return '<p class="fg-p">' + C.text(t) + '</p>'; }).join('');
      else if (tab === 'earth') body = earthPane(cur, C, c);
      else body = imagesPane(cur);
      pane.innerHTML = body + C.list();
    }
    host.querySelectorAll('.fg-tabs button').forEach(function (b) { b.onclick = function () { show(b.dataset.tab); }; });
    show('cond');
  }

  return { html: html, mount: mount, conditions: conditions, curated: function (id) { return !!CURATED[id]; } };
})();
