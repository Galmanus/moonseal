/* moonseal: interface. One clock (the timeline), one selected site, everything
   reacts. Plain-language first, numbers one level deeper. */
(function () {
  'use strict';
  var E = window.LUNAR_EPHEM, N = E.n, SITES = (window.LUNAR_SITES || []).slice();
  var $ = function (s) { return document.querySelector(s); };
  var D2R = Math.PI / 180;
  var state = {
    t: 0, site: null, view: 'hero', playing: false, speed: 24, overlay: 0,
    durD: 14, need: { battH: 24, gapH: 48 }, compare: [], tl: { v0: 0, v1: N - 1 }
  };
  /* NASA's candidate regions for the first crewed landing: thirteen in 2022, nine in 2024. Connecting Ridge and
     Peak Near Shackleton were on the 2022 list only (arXiv:2610.34554, Table I). The lists were drawn up for
     Artemis III, which NASA turned into an Earth-orbit crew test in May 2026 (first landing: Artemis IV), so the
     label names the purpose, not the mission number. */
  var ARTEMIS_2024 = { malapert_massif: 1, de_gerlache_rim2: 1 };
  SITES.forEach(function (s) {
    if (s.group === 'Artemis III candidate regions') s.group = ARTEMIS_2024[s.id] ? 'NASA crewed-landing candidate region · 2022 and 2024 lists' : 'NASA crewed-landing candidate region · 2022 list only';
  });
  var POLE = SITES.filter(function (s) { return s.terrain; });

  /* ---------------------------------------------------------------- MoonDAO (facts from their open-source repo) */
  var MOONDAO = {
    repo: 'https://github.com/Official-MoonDao/MoonDAO/tree/0a9d527/ui/lib/lunar-atlas', scene: 'https://www.moondao.com/moonbase',
    sunPeak: 2.08, earthEl: 8.02, nightShiftH: 354   // sunpath.ts:24, EarthGlobe.tsx:67-71, DePrize Night Shift criterion
  };
  var yearCache = {};
  function yearFacts(s) {                 // live, from JPL Horizons + the site's LOLA skyline
    if (yearCache[s.id]) return yearCache[s.id];
    var m = Model.compute(s), n26 = Math.min(8761, Model.n), maxSun = -99, minE = 99, maxE = -99, run = 0, longest = 0, up = 0;
    for (var i = 0; i < Model.n; i++) {
      var a = LunarEphem.azel(s.lat, s.lon, i, s.elev_m || 0);
      if (a.sunEl > maxSun) maxSun = a.sunEl;
      if (a.earthEl < minE) minE = a.earthEl;
      if (a.earthEl > maxE) maxE = a.earthEl;
      if (i < n26) { run = m.sunUp[i] ? 0 : run + 1; if (run > longest) longest = run; up += m.earUp[i]; }
    }
    return (yearCache[s.id] = { maxSun: maxSun, minE: minE, maxE: maxE, longest: longest, earthPct: up / n26 });
  }
  function moondaoCard(s) {
    if (s.id === 'connecting_ridge') return '<div class="sect md"><p class="md-p">MoonDAO’s Moon Base Zero sits 402 m from this point. <button class="linkbtn" id="toMbz">Open it as a site</button></p></div>';
    if (s.id !== 'moon_base_zero') return '';
    var f = yearFacts(s);
    return '<div class="sect md"><h3>MoonDAO · Moon Base Zero, on real dates</h3>' +
      '<p class="md-p">MoonDAO’s open-source Moon Base Zero scene runs its Sun on phases, not dates: “Mapping them onto real dates is a separate job.” moonseal does that job for the base’s exact centre, from JPL Horizons and LOLA, for any hour of 2026–2027.</p>' +
      '<div class="facts">' +
        '<div class="fact"><div class="fk">Peak Sun elevation</div><div class="fv num">' + f.maxSun.toFixed(2) + '° <small>theirs ' + MOONDAO.sunPeak.toFixed(2) + '°</small></div></div>' +
        '<div class="fact"><div class="fk">Earth elevation, real range</div><div class="fv num">' + f.minE.toFixed(1) + '° to +' + f.maxE.toFixed(1) + '° <small>theirs fixed ' + MOONDAO.earthEl.toFixed(2) + '°</small></div></div>' +
        '<div class="fact"><div class="fk">Longest night in 2026</div><div class="fv num">' + f.longest + ' h <small>Night Shift asks ' + MOONDAO.nightShiftH + ' h</small></div></div>' +
        '<div class="fact"><div class="fk">Earth in view, 2026</div><div class="fv num">' + Math.round(f.earthPct * 100) + '% <small>of all hours</small></div></div>' +
      '</div>' +
      '<p class="md-p">The two models agree on the Sun to within ' + Math.abs(f.maxSun - MOONDAO.sunPeak).toFixed(2) + '°. Earth never climbs to the fixed ' + MOONDAO.earthEl.toFixed(2) + '° of their scene: here it peaks at ' + f.maxE.toFixed(1) + '° and hides behind the skyline about half the time, which is what a comms plan has to design for.</p>' +
      '<a class="md-link" href="' + MOONDAO.scene + '" target="_blank" rel="noopener">Open Moon Base Zero ↗</a>' +
      '<div class="cap">Not affiliated with or endorsed by MoonDAO. Figures quoted from their open-source repository (<a href="' + MOONDAO.repo + '" target="_blank" rel="noopener" style="color:var(--fg2)">Official-MoonDao/MoonDAO@0a9d527</a>).</div></div>';
  }

  /* ---------------------------------------------------------------- formatting */
  var fmtDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
  var fmtDay = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', year: 'numeric' });
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var fmtMon = { format: function (d) { return MON[d.getUTCMonth()]; } };
  function dateStr(h) { return fmtDate.format(LunarEphem.dateAt(h)).replace(',', '') + ' UTC'; }
  function dayStr(h) { return fmtDay.format(LunarEphem.dateAt(h)); }
  function dur(h) {
    if (h == null) return 'not before 2028';
    if (h < 1) return Math.max(1, Math.round(h * 60)) + ' min';
    if (h < 48) { var hh = Math.floor(h), mm = Math.round((h - hh) * 60); if (mm === 60) { hh++; mm = 0; } return hh + ' h' + (mm ? ' ' + mm + ' min' : ''); }
    var d = Math.floor(h / 24), r = Math.round(h - d * 24); if (r === 24) { d++; r = 0; } return d + ' d' + (r ? ' ' + r + ' h' : '');
  }
  function hrs(h) { return h < 48 ? h + ' h' : (h / 24).toFixed(h % 24 ? 1 : 0) + ' days'; }
  function deg(x) { return (x >= 0 ? '+' : '−') + Math.abs(x).toFixed(Math.abs(x) < 10 ? 2 : 1) + '°'; }
  function latlon(s) { return Math.abs(s.lat).toFixed(2) + '° ' + (s.lat < 0 ? 'S' : 'N') + ', ' + ((s.lon + 360) % 360).toFixed(2) + '° E'; }
  function pct(x) { return Math.round(x * 100) + '%'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function clampT(h) { return Math.max(0, Math.min(N - 1.001, h)); }

  /* ---------------------------------------------------------------- toast */
  var toastT = 0;
  function toast(msg) { var el = $('#toast'); el.textContent = msg; el.style.opacity = 1; clearTimeout(toastT); toastT = setTimeout(function () { el.style.opacity = 0; }, 2600); }

  /* ---------------------------------------------------------------- time */
  function setTime(h, opt) {
    state.t = clampT(h);
    Globe.setTime(state.t);
    scheduleLive();
    if (!(opt && opt.keepHash)) saveHash();
  }
  var tAnim = null;
  function animateTime(to) {             // spring the clock so the shadows sweep, not jump
    if (Spring.reduced()) return setTime(to);
    tAnim = Spring.create(state.t, { response: 0.75 }).to(clampT(to));
  }

  /* ---------------------------------------------------------------- live updates (rAF-batched) */
  var livePending = false;
  function scheduleLive() { if (!livePending) { livePending = true; requestAnimationFrame(live); } }
  function live() {
    livePending = false;
    $('#whenTxt').textContent = dateStr(state.t);
    $('#dockDate').textContent = dateStr(state.t);
    $('#heroWhen').textContent = dateStr(state.t);
    // with a site open the timeline writes this line (updateLandingLegend); without one it says what to do
    if (!state.site) $('#dockPhase').textContent = 'Pick a landing site to see when a lander can work there';
    if (state.site) updateSiteLive();
    drawTimeline();
  }

  /* ---------------------------------------------------------------- hero */
  function hero() {
    // one first action: choose a site from the ranked list (step 1)
    $('#heroChips').innerHTML =
      '<button class="chip primary" id="heroGo">Choose a landing site ›</button>';
    $('#heroWhy').onclick = function () { if (window.WhyPole) WhyPole.open(); };   // the one entry to the sheet
    $('#heroChips').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      if (b.id === 'heroGo') goStep(1);
    });
  }
  function showHero(on) {
    $('#hero').hidden = !on;
  }

  /* ---------------------------------------------------------------- views */
  function setView(v) {
    state.view = v;
    if (v === 'hero') { Globe.view('hero'); showHero(!state.site); }
    else if (v === 'earth') { Globe.view('earth'); showHero(false); toast('The Moon from Earth. Press play: the south pole tips toward you and away (libration).'); }
    else if (v === 'pole') { Globe.view('pole'); showHero(false); }
    else if (v === 'site') {
      // from the overview there is no site yet: open the last one viewed, or the headline site
      if (!state.site) { selectSite(state.lastSite || SITES.find(function (x) { return x.id === 'connecting_ridge'; })); return; }
      // sites with a NASA PGDA 5 m tile get a closer camera so that detail is actually on screen
      var tiled = window.MOONSEAL_TILES && window.MOONSEAL_TILES[state.site.id];
      Globe.viewSite(state.site.lat, state.site.lon, tiled ? { dist: 42, tilt: 56 } : {});
    }
    layoutInsets(); scheduleLive();
  }

  /* ---------------------------------------------------------------- site selection */
  function selectSite(s, opt) {
    if (!s) return;
    opt = opt || {};
    state.site = s;
    state.model = Model.compute(s);
    Globe.setSiteTile(s.id);
    showHero(false);
    $('#panel').hidden = false;
    renderPanel();
    if (!opt.noFly) setView('site');
    pins.forEach(function (p) { p.el.classList.toggle('sel', p.site === s); });
    closePicker();
    updateSteps(2);
    saveHash();
    rebuildTimeline();
    scheduleLive();
  }
  function closeSite() {
    state.lastSite = state.site; state.site = null; $('#panel').hidden = true;
    Globe.setSiteTile(null);
    pins.forEach(function (p) { p.el.classList.remove('sel'); });
    setView('hero'); updateSteps(0); rebuildTimeline(); saveHash();
  }

  /* ---------------------------------------------------------------- panel */
  function renderPanel() {
    var s = state.site;
    var src = s.source && /^https?:/.test(s.source) ? '<a href="' + esc(s.source) + '" target="_blank" rel="noopener" style="color:var(--fg2)">source</a>' : esc(s.source || '');
    var meta = [latlon(s)];
    if (s.elev_m != null) meta.push('elev ' + Math.round(s.elev_m).toLocaleString('en') + ' m');
    if (s.slope_deg != null) meta.push('slope ' + s.slope_deg.toFixed(1) + '°');
    $('#panelBody').innerHTML =
      '<div class="ph"><div><h2>' + esc(s.name) + '</h2><div class="sub num">' + meta.join(' · ') + '</div>' +
      '<span class="tag">' + esc(s.group || '') + '</span></div><button class="icon-btn close" id="closeSite" aria-label="Close">✕</button></div>' +
      // the answer comes first, in plain words: can a lander that lands at the selected time work here, and when
      // is the next good time. Everything technical waits under "More details".
      '<div class="sect answer">' +
        '<div class="verdict" id="verdict"><span class="pill" id="vPill"></span><p id="vTxt"></p></div>' +
        '<div class="presets" id="presets" role="group" aria-label="How long the lander stays"><span class="pl">Stay</span><button data-d="7">1 week</button><button data-d="14">2 weeks</button><button data-d="60">2 months</button></div>' +
        '<div class="meter"><div class="row"><span>Sunlight during the stay (power)</span><b class="num" id="mSun"></b></div><div class="bar sun"><span id="bSun"></span></div></div>' +
        '<div class="meter"><div class="row"><span>Earth in view during the stay (radio)</span><b class="num" id="mEar"></b></div><div class="bar earth"><span id="bEar"></span></div></div>' +
        '<div class="ask-sol"><button class="linkbtn" id="askEarth">Is Earth in view right now? Ask Solana ›</button><div class="ask-out" id="askOut"></div></div>' +
        '<button class="btn wide light" id="nextGood">Find the next good time to land</button>' +
        '<p class="hint">On the timeline below, <b>green</b> marks every good time to land. Press ▶ to watch the Sun and Earth move.</p>' +
        '<button class="btn wide pq seal-cta" id="cmdOpen"><span class="pq-dot"></span>Seal this site on Solana</button>' +
      '</div>' +
      '<details class="more"><summary>More details</summary>' +
      '<div class="sect"><h3 class="sky-h">The view from the site<span class="sky-btns"><button class="btn" id="skyBigBtn">Enlarge</button>' + (s.terrain ? '<button class="btn" id="standBtn">Stand here</button>' : '') + '</span></h3><canvas id="skyline" title="Enlarge"></canvas><div class="sky-now" id="skyNow"></div>' +
        '<div class="cap">' + (s.terrain ? 'The grey line is the real horizon seen from this spot, from NASA LOLA terrain, all the way around, facing Earth. The Sun or Earth is up when it clears that line.' : 'Outside the south-pole terrain map: this site uses a flat horizon.') + '</div></div>' +
      '<div class="sect"><h3>Other sites, same dates</h3><div class="cmp-list" id="cmp"></div></div>' +
      moondaoCard(s) +
        '<div class="sect"><button class="btn" id="mapToggle">Show sunlight and Earth on the map</button></div>' +
        '<div class="sect"><h3 id="nowHead">Right now</h3><div class="cards">' +
          '<div class="card sun" id="cSun"><div class="k"><i></i>Sun</div><div class="v num" id="sunEl">…</div><div class="s" id="sunTxt">…</div><div class="s dim" id="sunSub"></div></div>' +
          '<div class="card earth" id="cEarth"><div class="k"><i></i>Earth</div><div class="v num" id="earEl">…</div><div class="s" id="earTxt">…</div><div class="s dim" id="earSub"></div></div>' +
        '</div></div>' +
        '<div class="sect"><h3>Stay and mission limits</h3>' +
          '<div class="mission-row"><label>Stay</label><span class="stepper"><button data-dur="-1" aria-label="Shorter">−</button><span class="num" id="durTxt"></span><button data-dur="1" aria-label="Longer">+</button></span></div>' +
          '<div class="facts"><div class="fact"><div class="fk">Longest darkness</div><div class="fv num" id="fDark"></div></div><div class="fact"><div class="fk">Longest Earth blackout</div><div class="fv num" id="fBlack"></div></div></div>' +
          '<div class="mission-row" style="margin-top:10px"><label style="min-width:150px">Battery rides out darkness up to</label><span class="stepper"><button data-batt="-6">−</button><span class="num" id="battTxt"></span><button data-batt="6">+</button></span></div>' +
          '<div class="mission-row" style="margin-top:8px"><label style="min-width:150px">Can wait for Earth up to</label><span class="stepper"><button data-gap="-6">−</button><span class="num" id="gapTxt"></span><button data-gap="6">+</button></span></div>' +
        '</div>' +
        (window.FieldGuide ? FieldGuide.html(s) : '') +
        '<div class="cap" style="margin-top:14px">' + src + '</div>' +
      '</details>';
    $('#closeSite').onclick = closeSite;
    $('#askEarth').onclick = askEarth;
    var mapTxt = function () { return state.overlay ? 'Hide the sunlight and Earth map' : 'Show sunlight and Earth on the map'; };
    var mt = $('#mapToggle'); if (mt) { mt.textContent = mapTxt(); mt.onclick = function () { $('#mapBtn').click(); mt.textContent = mapTxt(); }; }
    var more = $('#panelBody .more'); if (more) more.addEventListener('toggle', function () { if (more.open) scheduleLive(); });   // the skyline draws at its real size
    if (window.FieldGuide) FieldGuide.mount($('#panelBody'), s);
    var tm = $('#toMbz'); if (tm) tm.onclick = function () { selectSite(SITES.find(function (x) { return x.id === 'moon_base_zero'; })); };
    var bb = $('#skyBigBtn'); if (bb) bb.onclick = openSkyBig;
    var sk = $('#skyline'); if (sk) sk.onclick = openSkyBig;
    var sb = $('#standBtn');
    if (sb) sb.onclick = function () {
      var ground = sb.dataset.on === '1';
      sb.dataset.on = ground ? '0' : '1'; sb.textContent = ground ? 'Stand here' : 'Back to orbit';
      if (ground) Globe.viewSite(s.lat, s.lon); else { Globe.viewSite(s.lat, s.lon, { firstPerson: true }); toast('Standing at ' + s.name + ', facing Earth. Earth and Sun at true size and position.'); }
    };
    $('#panelBody').querySelectorAll('[data-dur]').forEach(function (b) { b.onclick = function () { setDur(state.durD + (+b.dataset.dur) * (state.durD >= 14 ? 7 : 1)); }; });
    $('#presets').querySelectorAll('button').forEach(function (b) { b.onclick = function () { setDur(+b.dataset.d); }; });
    $('#panelBody').querySelectorAll('[data-batt]').forEach(function (b) { b.onclick = function () { state.need.battH = Math.max(0, state.need.battH + (+b.dataset.batt)); needChanged(); }; });
    $('#panelBody').querySelectorAll('[data-gap]').forEach(function (b) { b.onclick = function () { state.need.gapH = Math.max(0, state.need.gapH + (+b.dataset.gap)); needChanged(); }; });
    $('#nextGood').onclick = findNextGood;
    $('#cmdOpen').onclick = function () { openSeal(state.site); };
    setDur(state.durD, true);
  }
  function setDur(d, quiet) {
    state.durD = Math.max(1, Math.min(120, d));
    var t = $('#durTxt'); if (t) t.textContent = state.durD + ' d';
    var p = $('#presets'); if (p) p.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.d === state.durD)); });
    needChanged(quiet);
  }
  function needChanged(quiet) {
    var a = $('#battTxt'), g = $('#gapTxt');
    if (a) a.textContent = state.need.battH + ' h'; if (g) g.textContent = state.need.gapH + ' h';
    rebuildTimeline();
    if (!quiet) scheduleLive(); else updateSiteLive();
  }

  function updateSiteLive() {
    var s = state.site, m = state.model, t = state.t;
    if (!s || !$('#sunEl')) return;
    var a = LunarEphem.azel(s.lat, s.lon, t, s.elev_m || 0);
    var cs = Model.countdown(m.sunM, t), ce = Model.countdown(m.earM, t);
    $('#sunEl').textContent = deg(a.sunEl);
    $('#cSun').classList.toggle('down', !cs.up);
    function line(c, upWord, downWord, setWord, riseWord) {
      if (c.inH == null) return c.up ? upWord + ' through 2027' : downWord + ' through 2027';
      return c.up ? upWord + ' · ' + setWord + ' in ' + dur(c.inH) : downWord + ' · ' + riseWord + ' in ' + dur(c.inH);
    }
    function sky(az) { var hz = s.horizon_deg && s.horizon_deg.length ? s.horizon_deg[Math.floor(((az % 360) + 360) % 360) % 360] : 0; return 'skyline there ' + deg(hz); }
    $('#sunTxt').textContent = line(cs, 'Up', 'Below the skyline', 'sets', 'rises');
    $('#sunSub').textContent = 'azimuth ' + Math.round(a.sunAz) + '° · ' + sky(a.sunAz);
    $('#earEl').textContent = deg(a.earthEl);
    $('#cEarth').classList.toggle('down', !ce.up);
    $('#earTxt').textContent = line(ce, 'In view', 'Hidden', 'sets', 'rises');
    $('#earSub').textContent = 'azimuth ' + Math.round(a.earthAz) + '° · ' + sky(a.earthAz);
    $('#nowHead').textContent = 'At ' + dateStr(t);
    var ms = Model.mission(m, t, state.durD * 24), v = Model.verdict(ms, state.need);
    $('#mSun').textContent = pct(ms.sunPct); $('#bSun').style.width = (ms.sunPct * 100).toFixed(1) + '%';
    $('#mEar').textContent = pct(ms.earthPct); $('#bEar').style.width = (ms.earthPct * 100).toFixed(1) + '%';
    $('#fDark').textContent = ms.longestDark ? hrs(ms.longestDark) : 'none';
    $('#fBlack').textContent = ms.longestBlackout ? hrs(ms.longestBlackout) : 'none';
    var vEl = $('#verdict'); vEl.className = 'verdict ' + v.level;
    $('#vPill').textContent = v.level === 'good' ? 'Good time to land' : v.level === 'warn' ? 'Risky' : 'Not a good time';
    var why = [];
    if (!v.power) why.push('the longest night, ' + hrs(ms.longestDark) + ', outlasts the ' + state.need.battH + ' h battery');
    if (!v.comm) why.push('Earth stays out of view for ' + hrs(ms.longestBlackout) + ', longer than the ' + state.need.gapH + ' h the mission can wait');
    $('#vTxt').textContent = (v.level === 'good'
      ? 'Land on ' + dayStr(t) + ' and stay ' + state.durD + ' days: the lander keeps power and can radio Earth.'
      : 'Land on ' + dayStr(t) + ' and stay ' + state.durD + ' days: ' + why.join('; ') + '.') + (ms.truncated ? ' (The data ends 1 Jan 2028.)' : '');
    drawSkyline(a);
    updateCompare();
  }

  function updateCompare() {
    var el = $('#cmp'); if (!el) return;
    var t = state.t, rows = POLE.map(function (s) {
      var m = Model.compute(s), ms = Model.mission(m, t, state.durD * 24), v = Model.verdict(ms, state.need);
      return { s: s, ms: ms, v: v, score: (v.level === 'good' ? 2 : v.level === 'warn' ? 1 : 0) + ms.bothPct };
    }).sort(function (a, b) { return b.score - a.score; });
    var col = { good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)' };
    el.innerHTML = rows.map(function (r) {
      return '<div class="cmp-item' + (r.s === state.site ? ' sel' : '') + '" data-id="' + r.s.id + '"><span class="sw" style="background:' + col[r.v.level] + '"></span>' +
        '<span>' + esc(r.s.name) + '</span><span class="m">☀ ' + pct(r.ms.sunPct) + '</span><span class="m">⊕ ' + pct(r.ms.earthPct) + '</span></div>';
    }).join('');
    el.onclick = function (e) { var it = e.target.closest('.cmp-item'); if (it) selectSite(SITES.find(function (x) { return x.id === it.dataset.id; })); };
  }

  function findNextGood() {
    var g = Model.goodStarts(state.model, state.durD * 24, state.need);
    var i = Model.nextGood(g, state.t + 1);
    if (i == null) { toast('No good time to land before 2028 for this stay. Try a shorter stay.'); return; }
    animateTime(i);
    toast('Next good time to land: ' + dateStr(i));
  }

  /* ---------------------------------------------------------------- skyline */
  /* The view from the site: a 360-degree panorama facing Earth, the real LOLA skyline, the Sun and Earth where they are now,
     where they go next, and a plain line saying what it means. Heights are stretched so the hills show; the stretch is
     written on the picture. drawSkyline(a) paints the panel's view and, when it is open, the enlarged one. */
  function drawSkyline(a) {
    paintSkyline($('#skyline'), a, false);
    var big = $('#skyBig');
    if (big && big.style.display === 'grid') paintSkyline($('#skylineBig'), a, true);
    var now = $('#skyNow'); if (now) now.innerHTML = skyNowHtml();
    var nowBig = $('#skyNowBig'); if (nowBig && big && big.style.display === 'grid') nowBig.innerHTML = skyNowHtml();
  }
  function skyNowHtml() {
    var m = state.model, t = state.t, sm = Model.at(m.sunM, t), em = Model.at(m.earM, t);
    var line = function (cls, name, margin, yes, no) {
      return '<span class="sk ' + cls + (margin > 0 ? '' : ' off') + '"><i></i><b>' + name + '</b> ' + (margin > 0
        ? Math.abs(margin).toFixed(1) + '° above the skyline · ' + yes
        : 'hidden, ' + Math.abs(margin).toFixed(1) + '° below the skyline · ' + no) + '</span>';
    };
    return line('sun', 'Sun', sm, 'power', 'no sunlight') + line('earth', 'Earth', em, 'radio to Earth', 'no radio');
  }
  function paintSkyline(cv, a, big) {
    if (!cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return;
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    var c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    var s = state.site, m = state.model, t = state.t, hz = s.horizon_deg && s.horizon_deg.length ? s.horizon_deg : (m && m.hz) || null;
    var ff = getComputedStyle(document.body).fontFamily, center = a.earthAz;
    var hmin = hz ? Math.min.apply(null, Array.from(hz)) : 0, hmax = hz ? Math.max.apply(null, Array.from(hz)) : 0;
    // the range also holds where Earth is in 7 days and the Sun in 3, so the ends of their paths stay on the picture
    var e7 = LunarEphem.azel(s.lat, s.lon, clampT(t + 168), s.elev_m || 0) || a, s3 = LunarEphem.azel(s.lat, s.lon, clampT(t + 72), s.elev_m || 0) || a;
    var y0 = Math.min(-2, hmin - 0.6, a.earthEl - 1.4, a.sunEl - 1, e7.earthEl - 1, s3.sunEl - 1), y1 = Math.max(4, hmax + 1.2, a.earthEl + 1.8, a.sunEl + 1.4, e7.earthEl + 1.2, s3.sunEl + 1.2);
    y0 = Math.max(Math.floor(y0), -12); y1 = Math.min(Math.ceil(y1), 30);
    var padT = big ? 30 : 22, padB = big ? 30 : 22, plotH = H - padT - padB;
    function X(az) { var d = ((az - center + 540) % 360) - 180; return W / 2 + d / 360 * W; }
    function Y(el) { return padT + (y1 - el) / (y1 - y0) * plotH; }
    function hzAt(az) { return hz ? hz[Math.floor(((az % 360) + 360) % 360 / (360 / hz.length)) % hz.length] : 0; }
    // sky, and a quiet elevation grid in whole degrees
    var g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#03040a'); g.addColorStop(1, '#0c1019');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    var step = (y1 - y0) > 12 ? 4 : (y1 - y0) > 6 ? 2 : 1;
    c.font = '500 ' + (big ? 11 : 9.5) + 'px ' + ff; c.textAlign = 'right';
    for (var gy = Math.ceil(y0 / step) * step; gy <= y1; gy += step) {
      c.strokeStyle = gy === 0 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.06)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(0, Y(gy) + .5); c.lineTo(W, Y(gy) + .5); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.32)'; c.fillText((gy > 0 ? '+' : '') + gy + '°', W - 4, Y(gy) - 3);
    }
    // where they go next: the Sun over the next 3 days, Earth over two weeks around now
    function track(fn, h0, h1, color, width, label) {
      c.strokeStyle = color; c.lineWidth = width; c.lineCap = 'round'; c.beginPath();
      var prevX = null, end = null;
      for (var h = h0; h <= h1; h += 1) {
        var q = LunarEphem.azel(s.lat, s.lon, clampT(h), s.elev_m || 0); if (!q) continue;
        var v = fn(q), x = X(v.az), y = Y(v.el);
        if (prevX == null || Math.abs(x - prevX) > W / 2) c.moveTo(x, y); else c.lineTo(x, y);
        prevX = x; end = [x, y];
      }
      c.stroke();
      if (end && end[1] > padT - 2 && end[1] < H - padB + 2) {      // where it will be: a small mark and its name
        c.fillStyle = color; c.beginPath(); c.arc(end[0], end[1], big ? 3 : 2.4, 0, 7); c.fill();
        c.font = '500 ' + (big ? 11 : 9.5) + 'px ' + ff; c.textAlign = end[0] > W - 70 ? 'right' : 'left';
        c.fillText(label, end[0] + (end[0] > W - 70 ? -6 : 6), end[1] + 3);
      }
    }
    // where they go next, forward only: Earth over the next 7 days, the Sun over the next 3
    track(function (q) { return { az: q.earthAz, el: q.earthEl }; }, t, t + 168, 'rgba(94,177,255,.5)', big ? 2.2 : 1.6, 'Earth in 7 days');
    track(function (q) { return { az: q.sunAz, el: q.sunEl }; }, t, t + 72, 'rgba(255,179,64,.55)', big ? 2.2 : 1.6, 'Sun in 3 days');
    // the ground: the real skyline from LOLA, lit along its edge
    c.beginPath(); c.moveTo(0, H);
    for (var i = 0; i <= W; i += 1) c.lineTo(i, Y(hzAt(center - 180 + i / W * 360)));
    c.lineTo(W, H); c.closePath();
    var tg = c.createLinearGradient(0, Y(hmax), 0, H); tg.addColorStop(0, '#3b3c43'); tg.addColorStop(1, '#101114');
    c.fillStyle = tg; c.fill();
    c.strokeStyle = 'rgba(235,235,240,.75)'; c.lineWidth = big ? 1.4 : 1.1; c.beginPath();
    for (var k = 0; k <= W; k += 1) { var yk = Y(hzAt(center - 180 + k / W * 360)); if (k === 0) c.moveTo(k, yk); else c.lineTo(k, yk); }
    c.stroke();
    // the Sun and Earth now: a disc when up, an outline behind the hills when not
    function body(az, el, col, up, name, minR) {
      var x = X(az), y = Y(el), r = minR;
      c.save();
      if (up) { c.shadowColor = col; c.shadowBlur = big ? 22 : 14; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
      else { c.strokeStyle = col; c.globalAlpha = .8; c.lineWidth = 1.4; c.setLineDash([3, 3]); c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke(); }
      c.restore();
      var label = name + (up ? '' : ' · hidden');
      c.font = '600 ' + (big ? 13 : 11) + 'px ' + ff; c.textAlign = 'center';
      var tw = c.measureText(label).width, lx = Math.max(tw / 2 + 4, Math.min(W - tw / 2 - 4, x)), ly = Math.max(big ? 16 : 13, y - r - (big ? 10 : 7));
      c.fillStyle = 'rgba(3,4,10,.72)'; c.fillRect(lx - tw / 2 - 5, ly - (big ? 12 : 10), tw + 10, big ? 17 : 14);
      c.fillStyle = col; c.fillText(label, lx, ly);
    }
    body(a.earthAz, a.earthEl, '#5eb1ff', Model.at(m.earM, t) > 0, 'Earth', big ? 9 : 6);
    body(a.sunAz, a.sunEl, '#ffb340', Model.at(m.sunM, t) > 0, 'Sun', big ? 7 : 5);
    // directions along the bottom, and the honest stretch
    c.font = '600 ' + (big ? 12 : 10) + 'px ' + ff; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.55)';
    (big ? [['N', 0], ['NE', 45], ['E', 90], ['SE', 135], ['S', 180], ['SW', 225], ['W', 270], ['NW', 315]] : [['N', 0], ['E', 90], ['S', 180], ['W', 270]])
      .forEach(function (p) { c.fillText(p[0], X(p[1]), H - 8); });
    var stretch = Math.round((plotH / (y1 - y0)) / (W / 360));
    c.textAlign = 'left'; c.font = '500 ' + (big ? 11 : 9.5) + 'px ' + ff; c.fillStyle = 'rgba(255,255,255,.4)';
    c.fillText('heights ×' + stretch + (big ? ' so the hills show · facing Earth' : ''), 6, big ? 18 : 13);
  }
  function openSkyBig() {
    var host = $('#skyBig');
    if (!host) {
      host = document.createElement('div'); host.id = 'skyBig'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-label', 'The view from the site');
      host.innerHTML = '<div class="sky-sheet glass glass-strong"><div class="sky-head"><div><div class="eyebrow">The view from the site</div><h2 id="skyBigTitle"></h2></div>' +
        '<button class="icon-btn" id="skyBigClose" aria-label="Close">✕</button></div><canvas id="skylineBig"></canvas><div class="sky-now big" id="skyNowBig"></div>' +
        '<p class="sky-cap">The grey line is the real horizon seen from this spot, from NASA LOLA terrain, all the way around. The Sun or Earth is up when its centre clears that line. ' +
        'The faint lines show where they go next: Earth over the next 7 days, the Sun over the next 3. Heights are stretched so the hills show; the angles on the right are true.</p></div>';
      document.body.appendChild(host);
      $('#skyBigClose').onclick = function () { host.style.display = 'none'; };
      host.addEventListener('click', function (e) { if (e.target === host) host.style.display = 'none'; });
      window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && host.style.display === 'grid') host.style.display = 'none'; });
    }
    $('#skyBigTitle').textContent = state.site.name + ' · ' + dateStr(state.t);
    host.style.display = 'grid';
    scheduleLive();
  }

  /* ---------------------------------------------------------------- timeline */
  var tl = { cv: null, off: null, rows: [], gutter: 132 };
  var MONTH_H = [];
  (function months() {
    var t0 = Date.parse(E.t0);
    for (var y = 2026; y <= 2028; y++) for (var mo = 0; mo < 12; mo++) {
      var h = (Date.UTC(y, mo, 1) - t0) / 3600000; if (h >= 0 && h <= N) MONTH_H.push({ h: h, y: y, m: mo });
    }
  })();
  function rebuildTimeline() { tl.stale = true; drawTimeline(); }
  /* Only the selected site, in three rows named in plain words: its good days to land (the answer), then the two
     reasons, sunlight and Earth in view. Other sites are compared in the panel ("Other sites, same dates").
     Without a site the dock keeps a plain date track to drag. */
  function layoutTimeline() {
    var s = state.site;
    tl.rows = s ? [{ s: s, y: 18, kind: 'good', h: 16 }, { s: s, y: 41, kind: 'sun', h: 8 }, { s: s, y: 56, kind: 'earth', h: 8 }] : [];
    tl.height = s ? 68 : 34;
  }
  /* Landing windows of the selected site: [start, end) hour ranges where Model.goodStarts says a landing of
     the chosen stay keeps power (nights shorter than the battery) and Earth contact (blackouts shorter than
     the limit). Drawn as full-height columns so "when can we land?" reads at a glance. */
  function landingSegs() {
    if (!state.site) return null;
    var s = state.site, key = s.id + '|' + s.lat + '|' + s.lon + '|' + state.durD + '|' + state.need.battH + '|' + state.need.gapH;
    if (tl.segKey === key) return tl.segs;
    var g = Model.goodStarts(Model.compute(s), state.durD * 24, state.need), segs = [], s0 = -1;
    for (var hh = 0; hh <= g.length; hh++) {
      var on = hh < g.length && g[hh];
      if (on && s0 < 0) s0 = hh;
      if (!on && s0 >= 0) { segs.push([s0, hh]); s0 = -1; }
    }
    tl.segKey = key; tl.segs = segs;
    return segs;
  }
  function updateLandingLegend() {
    var el = $('#dockPhase'), segs = landingSegs();
    if (!segs) { el.classList.remove('landing', 'nogood'); return; }   // no site: the dock keeps its hint line
    var txt, cur = null;                  // the site's name is already on the panel: keep this line short
    for (var i = 0; i < segs.length; i++) if (segs[i][1] > state.t) { cur = segs[i]; break; }
    var count = ' · ' + segs.length + ' window' + (segs.length > 1 ? 's' : '') + ' in 2026-2027';
    if (!segs.length) txt = 'No good time to land here in 2026-2027 for a ' + state.durD + '-day stay';
    else if (!cur) txt = 'No good time to land after this date' + count;
    else txt = (cur[0] <= state.t ? 'Good time to land: now' : 'Next good time to land: ' + dayStr(cur[0])) + count;
    el.classList.add('landing');
    el.classList.toggle('nogood', !cur);
    if (el.textContent !== txt) el.textContent = txt;
  }
  function drawStrips() {
    var cv = tl.cv, dpr = Math.min(window.devicePixelRatio || 1, 2), W = cv.clientWidth, H = tl.height;
    var off = tl.off || (tl.off = document.createElement('canvas'));
    off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
    var c = off.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var G = tl.gutter, SW = W - G - 4, v0 = state.tl.v0, v1 = state.tl.v1;
    c.font = '500 11px ' + getComputedStyle(document.body).fontFamily;
    // month grid
    c.strokeStyle = 'rgba(255,255,255,.07)'; c.fillStyle = 'rgba(255,255,255,.42)'; c.textAlign = 'left';
    MONTH_H.forEach(function (mo) {
      if (mo.h < v0 || mo.h > v1) return;
      var x = G + (mo.h - v0) / (v1 - v0) * SW;
      c.beginPath(); c.moveTo(x, 14); c.lineTo(x, H); c.stroke();
      var lbl = mo.m === 0 ? String(mo.y) : fmtMon.format(new Date(Date.UTC(mo.y, mo.m, 1)));
      if ((v1 - v0) / SW * 34 < 24 * 31) c.fillText(lbl, x + 3, 10);
      else if (mo.m % 3 === 0) c.fillText(lbl, x + 3, 10);
    });
    var cols = Math.max(1, Math.round(SW * dpr)), img = c.createImageData(cols, 1), segs = landingSegs();
    var track = function (y, h) { c.save(); c.beginPath(); roundRect(c, G, y, SW, h, Math.min(4, h / 2)); c.clip(); c.fillStyle = 'rgb(30,31,36)'; c.fillRect(G, y, SW, h); };
    tl.rows.forEach(function (r) {
      if (r.kind === 'good') {                // the answer: solid green wherever a landing of the chosen stay works
        track(r.y, r.h); c.fillStyle = 'rgb(50,215,75)';
        (segs || []).forEach(function (sg) {
          if (sg[1] < v0 || sg[0] > v1) return;
          var xa = G + (Math.max(sg[0], v0) - v0) / (v1 - v0) * SW, xb = G + (Math.min(sg[1], v1) - v0) / (v1 - v0) * SW;
          c.fillRect(xa, r.y, Math.max(3, xb - xa), r.h);   // short windows stay 3 px wide
        });
        c.restore(); return;
      }
      var m = Model.compute(r.s), cum = r.kind === 'sun' ? m.cS : m.cE, rgb = r.kind === 'sun' ? [255, 179, 64] : [94, 177, 255];
      for (var x = 0; x < cols; x++) {
        var h0 = v0 + x / cols * (v1 - v0), h1 = v0 + (x + 1) / cols * (v1 - v0);
        var a0 = Math.max(0, Math.floor(h0)), a1 = Math.min(N, Math.max(a0 + 1, Math.floor(h1)));
        var f = (cum[a1] - cum[a0]) / (a1 - a0);
        var o = x * 4, base = 26;
        img.data[o] = base + (rgb[0] - base) * f; img.data[o + 1] = base + (rgb[1] - base) * f; img.data[o + 2] = (base + 4) + (rgb[2] - base - 4) * f; img.data[o + 3] = 255;
      }
      var tmp = document.createElement('canvas'); tmp.width = cols; tmp.height = 1; tmp.getContext('2d').putImageData(img, 0, 0);
      c.imageSmoothingEnabled = false;
      c.save(); c.beginPath(); roundRect(c, G, r.y, SW, r.h, Math.min(3, r.h / 2)); c.clip();
      c.drawImage(tmp, 0, 0, cols, 1, G, r.y, SW, r.h); c.restore();
    });
    if (!tl.rows.length) { track(18, 10); c.restore(); }
    // labels: what each row means, in the row's colour (no legend to decode)
    var ff = getComputedStyle(document.body).fontFamily;
    var LBL = { good: ['Good days to land', '600 12px ', '#32d74b'], sun: ['Sunlight', '500 11px ', 'rgba(255,179,64,.92)'], earth: ['Earth in view', '500 11px ', 'rgba(94,177,255,.95)'] };
    tl.rows.forEach(function (r) { var L = LBL[r.kind]; c.fillStyle = L[2]; c.font = L[1] + ff; c.fillText(L[0], 2, r.y + r.h / 2 + 4); });
    if (!tl.rows.length) { c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '500 11px ' + ff; c.fillText('Drag the date', 2, 27); }
    tl.stale = false; tl.drawnW = W;
  }
  function roundRect(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function drawTimeline() {
    var cv = tl.cv; if (!cv) return;
    var showRows = !!state.site || state.view !== 'hero';
    if (cv.hidden === showRows) { cv.hidden = !showRows; requestAnimationFrame(layoutInsets); }
    if (!showRows) return;
    layoutTimeline();
    updateLandingLegend();
    var dpr = Math.min(window.devicePixelRatio || 1, 2), W = cv.clientWidth, H = tl.height;
    if (!W || !H) return;                  // the dock is hidden (phone sheet at full height): nothing to draw
    if (cv.height !== Math.round(H * dpr) || cv.width !== Math.round(W * dpr)) {
      cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); tl.stale = true;
      layoutInsets();
    }
    if (tl.stale || tl.drawnW !== W) drawStrips();
    var c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.drawImage(tl.off, 0, 0);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    var G = tl.gutter, SW = W - G - 4, v0 = state.tl.v0, v1 = state.tl.v1;
    var x = G + (state.t - v0) / (v1 - v0) * SW;
    c.fillStyle = '#fff'; c.fillRect(Math.round(x) - 1, 13, 2, H - 13);
    c.beginPath(); c.arc(x, 13, 4.5, 0, 7); c.fill();
    if (!state.site) {
      c.fillStyle = 'rgba(255,255,255,.55)'; c.font = '500 12px ' + getComputedStyle(document.body).fontFamily;
    }
  }
  function tlHourAt(clientX) {
    var r = tl.cv.getBoundingClientRect(), G = tl.gutter, SW = r.width - G - 4;
    var f = (clientX - r.left - G) / SW;
    return state.tl.v0 + Math.max(0, Math.min(1, f)) * (state.tl.v1 - state.tl.v0);
  }
  function initTimeline() {
    tl.cv = $('#tl');
    var drag = false;
    tl.cv.addEventListener('pointerdown', function (e) {
      tl.cv.setPointerCapture(e.pointerId); drag = true; stopPlay();
      var r = tl.cv.getBoundingClientRect();
      if (e.clientX - r.left < tl.gutter) {      // tap a site name: select it
        var y = e.clientY - r.top, row = tl.rows.find(function (q) { return y >= q.y - 2 && y <= q.y + q.h + 4; });
        drag = false; if (row && row.s !== state.site) selectSite(row.s, { noFly: state.view !== 'site' });
        return;
      }
      tAnim = null; setTime(tlHourAt(e.clientX));
    });
    tl.cv.addEventListener('pointermove', function (e) { if (drag) setTime(tlHourAt(e.clientX)); });
    tl.cv.addEventListener('pointerup', function () { drag = false; Globe.invalidate(); });
    tl.cv.addEventListener('wheel', function (e) {
      e.preventDefault();
      var span = state.tl.v1 - state.tl.v0, at = tlHourAt(e.clientX);
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        var sh = e.deltaX / tl.cv.clientWidth * span;
        var a = Math.max(0, Math.min(N - 1 - span, state.tl.v0 + sh)); state.tl.v0 = a; state.tl.v1 = a + span;
      } else {
        var k = Math.exp(e.deltaY * 0.0022), ns = Math.max(24 * 5, Math.min(N - 1, span * k));
        var f = (at - state.tl.v0) / span, a0 = at - f * ns;
        a0 = Math.max(0, Math.min(N - 1 - ns, a0)); state.tl.v0 = a0; state.tl.v1 = a0 + ns;
      }
      rebuildTimeline();
    }, { passive: false });
    new ResizeObserver(function () { rebuildTimeline(); layoutInsets(); }).observe(tl.cv);
  }

  /* ---------------------------------------------------------------- playback */
  var lastP = 0;
  function loop(now) {
    requestAnimationFrame(loop);
    var dt = Math.min(0.05, (now - (lastP || now)) / 1000); lastP = now;
    if (tAnim) { tAnim.step(dt); setTime(tAnim.x, { keepHash: true }); Globe.playing = tAnim.active; if (!tAnim.active) { tAnim = null; Globe.invalidate(); saveHash(); } }
    if (state.playing) {
      var nt = state.t + state.speed * dt;
      if (nt >= N - 1.01) { stopPlay(); nt = N - 1.01; }
      setTime(nt, { keepHash: true });
    }
  }
  function startPlay() { state.playing = true; Globe.playing = true; $('#playBtn').textContent = '❚❚'; $('#playBtn').setAttribute('aria-label', 'Pause'); }
  function stopPlay() { if (!state.playing) return; state.playing = false; Globe.playing = false; $('#playBtn').textContent = '▶'; $('#playBtn').setAttribute('aria-label', 'Play'); Globe.invalidate(); saveHash(); }

  /* ---------------------------------------------------------------- pins */
  var pins = [];
  function makePins() {
    var host = $('#pins');
    SITES.forEach(function (s) { addPin(s, host); });
    Globe.on('frame', placePins);
    // a GPU the render budget had to step down: drop the glass blur too (app.css html.lowfx), for the session
    Globe.on('budget', function (q) { if (q.low) document.documentElement.classList.add('lowfx'); });
  }
  function addPin(s, host) {
    var el = document.createElement('button');
    el.className = 'pin'; el.innerHTML = '<span class="d"></span><span class="l">' + esc(s.name) + '</span>';
    el.setAttribute('aria-label', s.name);
    el.onclick = function () { selectSite(s); };
    (host || $('#pins')).appendChild(el);
    var p = { site: s, el: el }; pins.push(p); return p;
  }
  function pinRank(p) {
    if (p.site === state.site) return 0;
    if (p.site.id === 'pin') return 1;
    if (/Artemis/.test(p.site.group || '')) return 2;
    return p.site.terrain ? 3 : 4;
  }
  function placePins() {
    var W = window.innerWidth, H = window.innerHeight, hero = state.view === 'hero' && !state.site;
    var boxes = [];
    pins.slice().sort(function (a, b) { return pinRank(a) - pinRank(b); }).forEach(function (p) {
      var s = p.site, pr = Globe.project(s.lat, s.lon, (s.elev_m || 0) / 1000);
      var vis = !hero && pr.front && pr.x > -40 && pr.x < W + 40 && pr.y > -40 && pr.y < H + 40;
      p.el.style.display = vis ? '' : 'none';
      if (!vis) return;
      p.el.style.transform = 'translate(' + (pr.x - 6).toFixed(1) + 'px,' + (pr.y - 6).toFixed(1) + 'px)';
      var w = 26 + s.name.length * 6.7, box = [pr.x, pr.y - 11, pr.x + w, pr.y + 11];
      var clash = boxes.some(function (b) { return box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1]; });
      p.el.classList.toggle('dim', clash);
      if (!clash) boxes.push(box);
    });
  }

  /* ---------------------------------------------------------------- dropped pin (custom coordinates) */
  var custom = null;
  function dropPin(lat, lon) {
    var inCap = lat <= -75.2, h = inCap ? Model.horizonFromDem(lat, lon, Globe.demHeightKm) : null;
    var s = { id: 'pin', name: 'Dropped pin', group: inCap ? 'Your pin · terrain computed in your browser' : 'Your pin · bare-sphere horizon',
      lat: lat, lon: lon, elev_m: h ? Math.round(h.elevKm * 1000) : null, slope_deg: null, terrain: inCap,
      horizon_deg: h ? Array.from(h.horizon) : [],
      source: inCap ? 'Horizon ray-cast in your browser from LOLA LDEM_75S_240M (480 m)' : 'Outside the LOLA south-pole map: geometric horizon only' };
    if (custom) { custom.el.remove(); pins = pins.filter(function (p) { return p !== custom; }); }
    custom = addPin(s);
    selectSite(s, { noFly: true });
    Globe.viewSite(lat, lon, { dist: inCap ? 150 : 420 });
    toast('Pin dropped at ' + latlon(s));
  }

  /* ---------------------------------------------------------------- picker */
  /* The south-pole sites ranked on the three things a base needs: power (sunlight), water (where ice can last)
     and radio (Earth in view). Each criterion is ranked on its own and the three ranks are averaged, so each
     counts the same; ties share a rank. Sunlight and Earth: every hour of 2026-2027 against the LOLA skyline.
     Water: LRO Diviner, 0 km when ice is stable under the site (top 2.9 m), else the nearest cold trap. */
  function rankSites() {
    var dv = (window.MOONSEAL_SITE_DATA || {}).diviner || {};
    var rows = POLE.map(function (s) {
      var m = Model.compute(s), d = dv[s.id];
      var water = !d ? null : d.ice_depth_m >= 0 ? 0 : d.cold_trap_km != null ? d.cold_trap_km : null;
      return { s: s, sun: m.cS[N] / N * 100, earth: m.cE[N] / N * 100, water: water, under: !!d && d.ice_depth_m >= 0, iceDepth: d ? d.ice_depth_m : null };
    });
    function rank(key, better) {
      rows.forEach(function (r) {
        r['r_' + key] = r[key] == null ? rows.length : 1 + rows.filter(function (q) { return q[key] != null && better(q[key], r[key]); }).length;
      });
    }
    rank('sun', function (a, b) { return a > b; }); rank('earth', function (a, b) { return a > b; }); rank('water', function (a, b) { return a < b; });
    rows.forEach(function (r) { r.score = (r.r_sun + r.r_water + r.r_earth) / 3; });
    return rows.sort(function (a, b) { return a.score - b.score || b.sun - a.sun; });
  }

  /* What gets sealed: the site, the good time to land for the chosen stay (now if it is one, else the next one in
     2026-2027) and what the planner measured over that stay. Seal.open signs it (ML-DSA-65) and records it on Solana. */
  function sealFinding(s) {
    if (!s) return null;
    var m = Model.compute(s), g = Model.goodStarts(m, state.durD * 24, state.need), t = Math.floor(state.t);
    var h = g[t] ? t : Model.nextGood(g, t + 1), wins = 0;
    for (var i = 0; i < g.length; i++) if (g[i] && (i === 0 || !g[i - 1])) wins++;
    var at = h == null ? t : h, ms = Model.mission(m, at, state.durD * 24);
    return {
      moonseal: 'landing-site finding', v: 1,
      site: s.name, lat: Math.round(s.lat * 1e4) / 1e4, lon_e: Math.round(s.lon * 1e4) / 1e4,
      land_utc: LunarEphem.dateAt(at).toISOString().slice(0, 16) + 'Z', stay_days: state.durD,
      verdict: h == null ? 'no good time to land in 2026-2027' : 'good time to land',
      sunlight_pct: Math.round(ms.sunPct * 1000) / 10, earth_pct: Math.round(ms.earthPct * 1000) / 10,
      good_windows_2026_2027: wins,
      data: 'NASA JPL Horizons (DE441) + LRO LOLA LDEM_75S_240M',
      found_utc: new Date().toISOString().slice(0, 19) + 'Z'
    };
  }
  /* Ask Solana whether Earth is in view from this spot at the selected hour: the moonseal LOS program computes it from
     the planner's own inputs (the JPL Horizons sub-Earth point and distance, the LOLA skyline) and logs the answer. */
  async function askEarth() {
    var s = state.site, out = $('#askOut'), btn = $('#askEarth');
    if (!s || !window.Seal || !out) return;
    var h = Math.max(0, Math.min(N - 1, Math.floor(state.t))), sp = LunarEphem.subpoints(h), m = Model.compute(s);
    btn.disabled = true; out.className = 'ask-out'; out.textContent = 'Asking Solana…';
    try {
      var r = await Seal.askEarth({ lat: s.lat, lon: s.lon, elevM: s.elev_m || 0, earthLat: sp.earthLat, earthLon: sp.earthLon,
        earthDistKm: sp.earthDistKm, hour: h, skyline: m.hz && m.hz.length ? Array.from(m.hz) : [0] });
      var same = (m.earUp[h] === 1) === r.inView;
      out.className = 'ask-out ' + (r.inView ? 'ok' : 'bad');
      out.innerHTML = '<b>Solana: Earth ' + (r.inView ? 'in view' : 'hidden') + '</b> on ' + esc(dateStr(h)) + ', ' + Math.abs(r.margin).toFixed(2) + '° ' +
        (r.margin > 0 ? 'above' : 'below') + ' the skyline · ' + (same ? 'same answer as the planner' : 'the planner disagrees') + (r.link ? ' · ' + r.link : '');
    } catch (e) {
      out.className = 'ask-out bad';
      out.textContent = /429|too many/i.test(e.message) ? 'Solana devnet is busy for this network right now; try again in half a minute.' : 'Could not reach Solana: ' + e.message;
    }
    btn.disabled = false;
  }
  function openSeal(s) {
    if (!window.Seal || !s) return;
    var f = sealFinding(s), m = Model.compute(s), h = Math.max(0, Math.min(N - 1, Math.round(LunarEphem.hoursSinceT0(new Date(f.land_utc)))));
    var sp = LunarEphem.subpoints(h);
    var los = sp ? { lat: s.lat, lon: s.lon, elevM: s.elev_m || 0, earthLat: sp.earthLat, earthLon: sp.earthLon, earthDistKm: sp.earthDistKm, hour: h,
      skyline: m.hz && m.hz.length ? Array.from(m.hz) : [0] } : null;
    Seal.open(f, { los: los, plannerEarth: los ? m.earUp[h] === 1 : null });
    updateSteps(3);
  }
  /* Three steps, one at a time: 1 choose a site (the ranked list), 2 when to land (the site's answer), 3 seal it. */
  function updateSteps(n) { document.querySelectorAll('#bar .seg button').forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.step === n)); }); }
  function goStep(n) {
    if (window.Seal) Seal.close();
    if (n === 1) { if (state.view === 'hero' && !state.site) setView('pole'); openPicker(); return; }
    closePicker();
    if (!state.site) { openPicker(); toast('Choose a site first'); return; }
    if (n === 2) { setView('site'); updateSteps(2); } else openSeal(state.site);
  }
  function home() { if (window.Seal) Seal.close(); closePicker(); if (state.site) closeSite(); else setView('hero'); updateSteps(0); }

  function openPicker() {
    var groups = {};
    SITES.forEach(function (s) { (groups[s.group] = groups[s.group] || []).push(s); });
    var rk = rankSites();
    var html = '<div class="grp">Step 1 · Choose a landing site</div>' +
      '<div class="rank-note">Ranked on power, water and radio, each counting the same. <b class="sun">Sunlight</b> and <b class="earth">Earth in view</b>: share of every hour in 2026 and 2027, from NASA JPL Horizons and LRO LOLA terrain. ' +
      '<b class="ice">Ice</b>: where water ice can last, from LRO Diviner: under the site, or the distance to the nearest cold trap.</div>' +
      '<div class="rank-h"><span>#</span><span>Site</span><span class="sun">Sunlight</span><span class="ice">Ice</span><span class="earth">Earth</span></div>' +
      rk.map(function (r, i) {
        var ice = r.water == null ? '–' : r.under ? 'under it' : r.water.toFixed(1) + ' km';
        return '<button class="rank-row" data-id="' + r.s.id + '" title="' + esc(r.s.name) + (r.under ? ': ice can last ' + r.iceDepth.toFixed(2) + ' m below the surface' : '') + '">' +
          '<span class="rk">' + (i + 1) + '</span><span class="nm">' + esc(r.s.name.replace(/\s*\(.*\)$/, '')) + '</span>' +
          '<span class="v">' + Math.round(r.sun) + '%</span><span class="v">' + ice + '</span><span class="v">' + Math.round(r.earth) + '%</span></button>';
      }).join('') +
      '<div class="grp">All sites</div>';
    Object.keys(groups).forEach(function (g) {
      html += '<div class="grp">' + esc(g) + '</div>';
      groups[g].forEach(function (s) {
        html += '<button class="site-row" data-id="' + s.id + '"><div><div class="nm">' + esc(s.name) + '</div><div class="co">' + latlon(s) + '</div></div><span class="badge">' + (s.terrain ? 'LOLA terrain' : 'sphere') + '</span></button>';
      });
    });
    html += '<div class="grp">Your own coordinates</div><div class="custom"><input id="cLat" inputmode="decimal" placeholder="Lat (−89.5)" aria-label="Latitude"><input id="cLon" inputmode="decimal" placeholder="Lon E (222.7)" aria-label="Longitude east"><button class="btn" id="cGo">Go</button></div>' +
      '<div class="hint">Or tap anywhere on the Moon. Inside 75°S the skyline is ray-cast from LOLA terrain in your browser.</div>';
    $('#pickerBody').innerHTML = html;
    $('#picker').hidden = false; updateSteps(1);
    $('#pickerBody').onclick = function (e) {
      var b = e.target.closest('.site-row, .rank-row'); if (b) selectSite(SITES.find(function (x) { return x.id === b.dataset.id; }));
    };
    $('#cGo').onclick = function () {
      var la = parseFloat($('#cLat').value.replace('−', '-')), lo = parseFloat($('#cLon').value.replace('−', '-'));
      if (!(la >= -90 && la <= 90) || !(isFinite(lo))) { toast('Latitude −90…90, longitude in degrees east'); return; }
      closePicker(); dropPin(la, ((lo % 360) + 360) % 360);
    };
  }
  function closePicker() { $('#picker').hidden = true; updateSteps(state.site ? 2 : 0); }

  /* ---------------------------------------------------------------- about */
  function openAbout() {
    $('#aboutBody').innerHTML =
      '<h2 id="aboutTitle">How moonseal works</h2><p>moonseal finds the right day to land at the Moon’s south pole: the days a lander will have sunlight for power and a clear line to Earth for radio. When you find one, it seals it: your finding, signed with a post-quantum signature and recorded in public on Solana. Everything you see is computed from public NASA data; nothing is hand-drawn or AI-generated.</p>' +
      '<h4>Sun and Earth positions</h4><p>JPL Horizons (DE441) gives the sub-solar and sub-Earth points on the Moon, hourly, 2026–2027, in the same Moon-fixed frame as the LOLA terrain. Your browser turns them into azimuth and elevation for any site, including Earth’s parallax and the Moon’s libration. Checked against direct Horizons queries at 4 sites, every hour of 2026 (8,761 h each): elevation error at most <b>0.0007°</b>; Earth azimuth at most 0.006°.</p>' +
      '<h4>The skyline</h4><p>LOLA <code>LDEM_75S_240M</code> (240 m/pixel). For each site the horizon is ray-cast over 360° (three rays per degree through the continuous surface, plus every DEM pixel binned by azimuth) with the Moon’s curvature, so a high ridge sees past the edge of the sphere: its horizon dips below 0°. There is no atmosphere, so no refraction. A body is “up” when its centre clears the skyline.</p>' +
      '<h4>Checks we ran</h4><ul>' +
        '<li>The planner in your browser reproduces the Python engine (<code>core/</code>, direct Horizons queries) exactly for 2026 at 5 sites: sunlight %, Earth %, longest night and longest blackout.</li>' +
        '<li>A dropped pin’s skyline is ray-cast in your browser; at the curated sites it lands within 0.06°–0.8° RMS of the engine.</li>' +
        '<li>The engine has tests (<code>core/tests</code>), including one that caught a skyline too low on steep slopes; that bug is fixed.</li></ul>' +
      '<h4>The picture</h4><p>Global color: LRO LROC WAC mosaic (NASA SVS CGI Moon Kit, 8K). Global relief: LOLA <code>ldem_16</code>. The south-pole cap is real LOLA geometry; its shadows are ray-marched toward the real Sun on the selected date, with a penumbra the width of the true solar disk (0.53°). The Sun + Earth map runs the same horizon test for every pixel. In “Stand here”, Earth (NASA Blue Marble) and the Sun are drawn at their true size and position; Earth’s phase is real, but which continents face the Moon comes from a low-precision formula and is only illustrative.</p>' +
      '<h4>What this is not</h4><ul><li>Not a NASA product, and not flight-qualified. 240 m terrain misses boulders and local slopes; site results are for the point given.</li><li>“Up” means line of sight, not a closed link budget: antenna masks, DSN scheduling and relays are out of scope.</li><li>Malapert’s near-continuous Earth view rests on a thin margin (+0.10° at its worst hour in 2026).</li></ul>' +
      '<h4>Sealing what you found</h4><p>Press <b>Seal this site on Solana</b> on a site: moonseal signs the finding (the site, the good time to land, the stay, what the planner measured, the NASA data) with <b>ML-DSA-65</b> (FIPS 204), the NIST signature standard built to resist future quantum computers, using a key kept in your browser (@noble/post-quantum 0.7.1). Change one character and the signature no longer matches. A Solana program verifies ML-DSA-65 <b>on chain</b>: a key and signature do not fit one transaction and one verification costs about 3.4M compute units, so, like our Vineland STARK verifier, the data is written into a buffer account in chunks and verified in stages, each transaction under 1.4M units (11–12 transactions in total). Tested in the Solana VM, on a local validator and live on Solana devnet (<a href="https://explorer.solana.com/address/3ieMTX6qafSSwMgdeu8QGCRox1bK84emdwEuD6RShbd7?cluster=devnet" target="_blank" rel="noopener">program on Explorer</a>); tampered signatures are rejected. The seal id is sha256(key, signature, finding), computed by the program and by the page.</p>' +
      '<h4>MoonDAO</h4><p>Moon Base Zero, MoonDAO’s open-source base on the Shackleton–de Gerlache connecting ridge, is included as a site at its exact centre. Their scene runs the Sun on phases without dates; moonseal maps the real Sun and Earth onto it for any hour of 2026–2027. Not affiliated with or endorsed by MoonDAO.</p>' +
      '<h4>Open source</h4><p>MIT license. The pipeline (<code>core/</code>) rebuilds every number and texture from the NASA sources; the on-chain verifier is in <code>tools/mldsa-onchain</code>. <a href="index.html" style="color:var(--earth)">The earlier command console</a> lives on a separate page.</p>' +
      '<button class="btn" id="aboutClose" style="margin-top:12px">Close</button>';
    $('#about').style.display = 'grid';
    $('#aboutClose').onclick = closeAbout;
  }
  function closeAbout() { $('#about').style.display = 'none'; }

  /* ---------------------------------------------------------------- layout */
  function layoutInsets() {
    var small = window.innerWidth <= 820, panelOn = !$('#panel').hidden;
    document.body.classList.toggle('site-open', panelOn);
    document.body.classList.toggle('view-hero', state.view === 'hero');
    if (!panelOn) document.body.classList.remove('sheet-full');
    var dock = $('#dock').getBoundingClientRect();
    document.documentElement.style.setProperty('--dock-h', Math.round(dock.height) + 'px');
    // phones: the bar has two rows (views below the brand), so the globe starts below its real bottom edge
    var barB = small ? Math.round($('#bar').getBoundingClientRect().bottom) : 64;
    if (small) document.documentElement.style.setProperty('--bar-b', barB + 'px');
    var bottom = small ? (panelOn ? Math.round(window.innerHeight * 0.46 + dock.height + 16) : 0) : Math.round(dock.height) + 12;   // phones: the sheet is 46vh
    Globe.setInsets({ left: !small && panelOn ? 412 : 0, bottom: bottom, top: small ? barB + 4 : 64 });
  }
  // phones: the site sheet is half height, or full when you tap or swipe up its handle (swipe down to go back)
  function setSheet(full) { document.body.classList.toggle('sheet-full', !!full); layoutInsets(); }
  (function sheetHandle() {
    var g = $('#panel .grab'), y0 = null;
    if (!g) return;
    g.addEventListener('pointerdown', function (e) { y0 = e.clientY; g.setPointerCapture(e.pointerId); });
    g.addEventListener('pointerup', function (e) {
      if (y0 == null) return;
      var dy = e.clientY - y0, full = document.body.classList.contains('sheet-full'); y0 = null;
      setSheet(dy < -24 ? true : dy > 24 ? false : !full);
    });
    g.addEventListener('pointercancel', function () { y0 = null; });
  })();

  /* ---------------------------------------------------------------- url state */
  function saveHash() {
    var p = [];
    if (state.site && state.site.id !== 'pin') p.push('site=' + state.site.id);
    // a site, or a time other than now, is worth sharing; the opening screen at the current time keeps a clean address
    if (p.length || state.tNow == null || Math.abs(state.t - state.tNow) >= 1) p.push('t=' + Math.round(state.t));
    history.replaceState(null, '', p.length ? '#' + p.join('&') : location.pathname + location.search);
  }
  function readHash() {
    var q = {}; location.hash.slice(1).split('&').forEach(function (kv) { var a = kv.split('='); if (a[0]) q[a[0]] = decodeURIComponent(a[1] || ''); });
    return q;
  }

  /* ---------------------------------------------------------------- wiring */
  function wire() {
    document.querySelectorAll('#bar .seg button').forEach(function (b) { b.onclick = function () { goStep(+b.dataset.step); }; });
    $('#homeBtn').onclick = home;
    document.addEventListener('moonseal:sealclose', function () { updateSteps(state.site ? 2 : 0); });
    $('#sitesBtn').onclick = function () { $('#picker').hidden ? openPicker() : closePicker(); };
    $('#aboutBtn').onclick = openAbout;
    $('#about').onclick = function (e) { if (e.target.id === 'about') closeAbout(); };
    $('#mapBtn').onclick = function () {
      state.overlay = state.overlay ? 0 : 1;
      Globe.setOverlay(state.overlay);
      $('#mapBtn').setAttribute('aria-pressed', String(!!state.overlay));
      $('#maplegend').style.display = state.overlay ? 'block' : 'none';
      if (state.overlay && state.view === 'hero') setView('pole');
      toast(state.overlay ? 'Map: where the Sun and Earth are above the horizon right now' : 'Map off');
    };
    $('#whenBtn').onclick = function () {
      var inp = $('#whenInput'), d = LunarEphem.dateAt(state.t);
      inp.value = d.toISOString().slice(0, 16);
      inp.min = '2026-01-01T00:00'; inp.max = '2027-12-31T23:00';
      if (inp.showPicker) { try { inp.showPicker(); return; } catch (e) { /* fall through */ } }
      inp.focus();
    };
    $('#whenInput').onchange = function () {
      var v = $('#whenInput').value; if (!v) return;
      animateTime(LunarEphem.hoursSinceT0(new Date(v + ':00Z')));
    };
    $('#playBtn').onclick = function () { state.playing ? stopPlay() : startPlay(); };
    document.querySelectorAll('.speed button').forEach(function (b) {
      b.onclick = function () { state.speed = +b.dataset.speed; document.querySelectorAll('.speed button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); };
    });
    Globe.on('tap', function (p) {
      if (!p.hit) return;
      var near = pins.find(function (q) {
        if (q.el.style.display === 'none') return false;
        var r = q.el.querySelector('.d').getBoundingClientRect();
        return Math.hypot(r.left + 6 - p.x, r.top + 6 - p.y) < 18;
      });
      if (near) return selectSite(near.site);
      dropPin(p.lat, p.lon);
    });
    window.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ') { e.preventDefault(); state.playing ? stopPlay() : startPlay(); }
      else if (e.key === 'ArrowRight') { stopPlay(); setTime(state.t + (e.shiftKey ? 24 : 1)); }
      else if (e.key === 'ArrowLeft') { stopPlay(); setTime(state.t - (e.shiftKey ? 24 : 1)); }
      else if (e.key === 'Escape') { closePicker(); closeAbout(); }
    });
    window.addEventListener('resize', layoutInsets);
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    hero(); wire(); initTimeline(); makePins();
    var q = readHash();
    var now = LunarEphem.hoursSinceT0(new Date());
    state.tNow = clampT(now);
    state.t = clampT(q.t != null && q.t !== '' ? +q.t : now);
    Globe.init($('#moon'), { preserve: /[?&]shot\b/.test(location.search) }).then(function (r) {
      Globe.setTime(state.t);
      var hp = Globe.preset('hero');      // the Moon arrives: from far away, turning into place
      Globe.view(Object.assign({}, hp, { dist: hp.dist * 2.4, lon: hp.lon - 35, lat: hp.lat + 12 }), { instant: true });
      requestAnimationFrame(function () { Globe.view('hero'); });
      var site = q.site && SITES.find(function (s) { return s.id === q.site; });
      if (site) selectSite(site); else showHero(true);
      layoutInsets(); scheduleLive();
      var L = $('#loader'); L.style.opacity = 0; setTimeout(function () { L.remove(); }, 700);
      window.__ready = true;
      r.cap.then(function () { window.__capReady = true; Globe.invalidate(); });
    }).catch(function (e) {
      $('#loader').querySelector('.in').textContent = 'This page needs WebGL 2 and must be served over HTTP. ' + e.message;
      console.error(e);
    });
    requestAnimationFrame(loop);
  }
  boot();
  window.__ui = { state: state, selectSite: selectSite, setTime: setTime, setView: setView, dropPin: dropPin, SITES: SITES };
})();
