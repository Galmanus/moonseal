/* Seal a landing-site finding on Solana.
 *
 *   the planner's finding (the site, the good time to land for the chosen stay, what it measured, the NASA data)
 *     --ML-DSA-65 sign, in this browser, with a key kept in this browser-->
 *     --> the moonseal program on Solana checks the signature and computes sha256(key || signature || finding)
 *
 * Same program and client as the command path (tools/mldsa-onchain, solana/client), without a registry. The WRITE
 * transactions carry the finding's bytes and the last one logs "ML-DSA-65 VERIFIED", so anyone can check, in public,
 * what was found and when. Change one character and the signature no longer matches. */
window.Seal = (function () {
  'use strict';
  var PQ = window.PQ, D = PQ && PQ.ml_dsa65;
  var te = new TextEncoder();
  var st = { key: null, finding: null, bytes: null, sig: null, keyId: null, busy: false, buffer: null, ctx: null };
  var PK_LEN = 1952, SIG_LEN = 3309;      // ML-DSA-65 public key and signature, as the program stores them
  function $(s) { return document.querySelector(s); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hex(b, n) { var s = ''; for (var i = 0; i < Math.min(b.length, n || b.length); i++) s += b[i].toString(16).padStart(2, '0'); return s; }
  async function sha256(b) { return new Uint8Array(await crypto.subtle.digest('SHA-256', b)); }
  function cat() { var n = 0, i; for (i = 0; i < arguments.length; i++) n += arguments[i].length; var o = new Uint8Array(n), k = 0; for (i = 0; i < arguments.length; i++) { o.set(arguments[i], k); k += arguments[i].length; } return o; }
  function fmtB(n) { return n.toLocaleString('en-US') + ' B'; }
  function ms(t0) { return (performance.now() - t0).toFixed(1) + ' ms'; }
  function toast(msg) { var el = $('#toast'); if (!el) return; el.textContent = msg; el.style.opacity = 1; setTimeout(function () { el.style.opacity = 0; }, 4200); }

  /* The signer: one ML-DSA-65 key per browser, from a random seed kept in localStorage (a demo; a real team keeps its
     key in its own key store). sha256 of its public key is the key id shown here. */
  function myKey() {
    if (st.key) return st.key;
    var seed = null;
    try {
      var h = localStorage.getItem('moonseal.sealSeed');
      if (h && /^[0-9a-f]{64}$/.test(h)) seed = Uint8Array.from(h.match(/../g).map(function (x) { return parseInt(x, 16); }));
    } catch (e) { /* storage blocked: a key for this visit only */ }
    if (!seed) { seed = crypto.getRandomValues(new Uint8Array(32)); try { localStorage.setItem('moonseal.sealSeed', hex(seed)); } catch (e) { /* ditto */ } }
    st.key = D.keygen(seed);
    return st.key;
  }

  function card(id, title, text, facts, cls) {
    var el = $('#' + id); el.className = 'st on' + (cls ? ' ' + cls : '');
    el.querySelector('.st-t').textContent = title;
    el.querySelector('.st-x').textContent = text;
    el.querySelector('.st-f').innerHTML = (facts || []).map(function (f) { return '<div><span>' + f[0] + '</span><b class="num">' + esc(f[1]) + '</b></div>'; }).join('');
  }
  function verdict(text, ok) { var v = $('#sealVerdict'); v.className = 'cmd-verdict ' + (ok ? 'ok' : 'bad'); v.textContent = text; }
  function log(html, bad) { var el = $('#sealLog'); el.innerHTML = html; el.classList.toggle('bad', !!bad); }

  function open(f, ctx) {
    if (!D) { toast('The post-quantum module failed to load.'); return; }
    if (!f) { toast('Pick a landing site first.'); return; }
    st.finding = f; st.sig = null; st.bytes = te.encode(JSON.stringify(f)); st.buffer = null; st.ctx = ctx || null;
    $('#sealNext').hidden = true; $('#sealNextOut').innerHTML = '';
    var good = f.verdict === 'good time to land';
    card('sl1', f.site, good ? 'Land on ' + f.land_utc.replace('T', ' ').replace('Z', ' UTC') + ' and stay ' + f.stay_days + ' days: power and radio contact hold.'
      : 'No good time to land here in 2026-2027 for a ' + f.stay_days + '-day stay.',
      [['sunlight during the stay', f.sunlight_pct + '%'], ['Earth in view', f.earth_pct + '%'], ['good times to land, 2026-2027', String(f.good_windows_2026_2027)], ['data', 'NASA JPL Horizons, LRO LOLA']], good ? 'ok' : 'bad');
    $('#sl2').className = 'st'; $('#sl2 .st-t').textContent = 'Signing…'; $('#sl2 .st-x').textContent = ''; $('#sl2 .st-f').innerHTML = '';
    $('#sl3').className = 'st'; $('#sl3 .st-t').textContent = 'Not yet';
    $('#sealVerdict').className = 'cmd-verdict'; $('#sealVerdict').textContent = '';
    $('#sealTamperOut').textContent = ''; log('');
    $('#sealRaw').textContent = JSON.stringify(f, null, 1);
    $('#sealBtn').disabled = !good;
    $('#sealBtn').title = good ? '' : 'Only a good time to land can be sealed: pick another site or a shorter stay.';
    $('#seal').style.display = 'grid';
    setTimeout(function () { sign().catch(function (e) { toast('Error: ' + e.message); }); }, 30);
  }
  function close() { var was = $('#seal').style.display === 'grid'; $('#seal').style.display = 'none'; if (was) document.dispatchEvent(new CustomEvent('moonseal:sealclose')); }

  async function sign() {
    var k = myKey(), t0 = performance.now();
    st.sig = D.sign(st.bytes, k.secretKey);
    var signMs = ms(t0);
    st.keyId = hex(await sha256(k.publicKey), 4);
    card('sl2', 'Signed with your key', 'ML-DSA-65 (NIST FIPS 204), the signature standard built to resist future quantum computers. The key stays in this browser.',
      [['key id', st.keyId], ['signature', fmtB(st.sig.length)], ['finding', fmtB(st.bytes.length)], ['sign time', signMs]]);
  }

  async function seal() {
    if (st.busy || !st.sig) return;
    st.busy = true; var btn = $('#sealBtn'); btn.disabled = true;
    try {
      var C = window.Command && Command.chain;
      if (!C) throw new Error('the Solana client is not available');
      log('Loading the Solana client…');
      await C.loadScript('app/moonseal-solana.js');
      log('Looking for a network with the moonseal verifier…');
      var p = await C.pickNetwork();
      if (!p) { log('No Solana network with the verifier is reachable from this page right now. Try again in a minute.', true); return; }
      var payer = await C.payerFor(p), k = myKey(), lines = [], t0 = performance.now();
      var link = function (sig, text) { return sig && p.net.explorer ? '<a href="' + p.net.explorer.replace('{sig}', sig) + '" target="_blank" rel="noopener">' + text + ' ↗</a>' : ''; };
      var r = await MoonsealSolana.verifyOnChain({ rpc: p.net.rpc, programId: p.net.programId, payer: payer, pk: k.publicKey, sig: st.sig, msg: st.bytes,
        onStep: function (s) { lines.push(s.i + '/' + s.n + ' ' + s.label); log('<b>' + esc(p.net.name) + '</b><br>' + lines.slice(-3).join('<br>')); } });
      var local = hex(await sha256(cat(k.publicKey, st.sig, st.bytes)));
      var at = k.publicKey.length + st.sig.length;      // the finding starts after the key and the signature
      var parts = r.sigs.filter(function (s) { var w = /^WRITE (\d+)\.\.(\d+)/.exec(s.label); return w && +w[2] > at; });
      var secs = ((performance.now() - t0) / 1000).toFixed(1);
      if (r.verified) {
        card('sl3', 'Sealed on ' + p.net.name, 'The program checked the signature on chain. The finding is in the public transactions; its seal is the fingerprint below.',
          [['seal id', r.commit.slice(0, 16) + '…'], ['matches this page', r.commit === local ? 'yes' : 'NO'], ['transactions', String(r.sigs.length)], ['time', secs + ' s']], 'ok');
        log('The finding, on chain: ' + parts.map(function (s, i) { return link(s.sig, 'part ' + (i + 1)); }).join(' · ') + '<br>' + link(r.verifySig, 'VERIFIED, on chain'));
        verdict('SEALED · ' + st.finding.site + ' · ' + st.finding.land_utc.slice(0, 10), true);
        st.buffer = r.buffer; $('#sealNext').hidden = false; $('#sealEarth').hidden = !(st.ctx && st.ctx.los);
      } else {
        card('sl3', 'Not sealed', 'The program did not verify the signature.', [['result', String(r.result)]], 'bad');
        log(link(r.verifySig, 'The rejection, on chain'), true);
        verdict('NOT SEALED · the signature did not verify', false);
      }
    } catch (e) {
      var busy = /\b429\b|too many requests/i.test(String(e && e.message));
      log((busy ? 'The public Solana devnet endpoint is rate-limiting this network (HTTP 429). Wait half a minute and press again.' : 'Error: ' + esc(e.message)) +
        (e.closeSig ? '<br>The partly written buffer was closed and its rent refunded.' : ''), true);
    } finally { st.busy = false; btn.disabled = st.finding && st.finding.verdict !== 'good time to land'; }
  }

  /* Tamper evidence, in the browser: change one character of the finding and check the same signature again. */
  function tamper() {
    if (!st.sig) return;
    var f = JSON.parse(JSON.stringify(st.finding)); f.stay_days = f.stay_days + 1;
    var ok = D.verify(st.sig, te.encode(JSON.stringify(f)), myKey().publicKey);
    $('#sealTamperOut').innerHTML = ok ? '<b class="okc">Still verifies</b>'
      : '<b class="badc">BROKEN</b> · with the stay changed from ' + st.finding.stay_days + ' to ' + f.stay_days + ' days, the signature no longer matches. A sealed finding cannot be quietly edited.';
  }

  /* The line of sight on Solana: the moonseal LOS program (tools/los-onchain) computes, inside one transaction, whether
     Earth's centre clears the skyline, from the planner's own inputs. Devnet, the network that has the program. */
  async function askEarth(q) {
    var C = window.Command && Command.chain;
    if (!C) throw new Error('the Solana client is not available');
    await C.loadScript('app/moonseal-solana.js');
    var cfg = window.MOONSEAL_ONCHAIN || { networks: [] }, net = cfg.networks.filter(function (n) { return n.losProgramId; })[0];
    if (!net) throw new Error('no network with the line-of-sight program is configured');
    var conn = new MoonsealSolana.Connection(net.rpc, 'confirmed');
    var payer = await C.payerFor({ net: net, conn: conn });
    var r = await MoonsealSolana.checkLineOfSight({ connection: conn, programId: net.losProgramId, payer: payer, query: q });
    r.link = net.explorer ? '<a href="' + net.explorer.replace('{sig}', r.sig) + '" target="_blank" rel="noopener">transaction ↗</a>' : '';
    return r;
  }

  /* A seal is only worth something if someone else can check it. The proof link names the seal's temporary account on
     Solana; every transaction of the seal touched it, so the page can read them back, rebuild the signed finding from
     the WRITE pieces, check the ML-DSA-65 signature here, and find the program's "VERIFIED" record. No moonseal server. */
  function proofLink(buffer) { return location.origin + location.pathname + '?proof=' + encodeURIComponent(buffer); }
  var B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  function b58(str) {
    var n = 0n; for (var i = 0; i < str.length; i++) { var v = B58.indexOf(str[i]); if (v < 0) throw new Error('bad base58'); n = n * 58n + BigInt(v); }
    var out = []; while (n > 0n) { out.push(Number(n & 255n)); n >>= 8n; }
    for (var j = 0; j < str.length && str[j] === '1'; j++) out.push(0);
    return Uint8Array.from(out.reverse());
  }
  async function rpc(fn) {                 // the public devnet endpoint rate-limits: back off and try again
    for (var k = 0; ; k++) {
      try { return await fn(); } catch (e) { if (k < 5 && /\b429\b|too many/i.test(String(e && e.message))) { await new Promise(function (r) { setTimeout(r, 1500 * (k + 1)); }); continue; } throw e; }
    }
  }
  async function readProof(buffer) {
    var C = window.Command && Command.chain;
    if (!C) throw new Error('the Solana client is not available');
    await C.loadScript('app/moonseal-solana.js');
    var cfg = window.MOONSEAL_ONCHAIN || { networks: [] }, net = cfg.networks.filter(function (n) { return n.programId && !n.airdrop; })[0];
    if (!net) throw new Error('no public network is configured');
    var conn = new MoonsealSolana.Connection(net.rpc, 'confirmed'), addr = new MoonsealSolana.PublicKey(buffer);
    var sigs = (await rpc(function () { return conn.getSignaturesForAddress(addr, { limit: 40 }); })).slice().reverse();
    if (!sigs.length) throw new Error('Solana has no transactions for this seal');
    var msgLen = null, chunks = [], parts = [], verified = null;
    for (var i = 0; i < sigs.length; i++) {
      var tx = await rpc(function () { return conn.getTransaction(sigs[i].signature, { commitment: 'confirmed', maxSupportedTransactionVersion: 0 }); });
      if (!tx || !tx.meta || tx.meta.err) continue;
      var m = tx.transaction.message, keys = m.staticAccountKeys || m.accountKeys;
      var ixs = m.compiledInstructions ? m.compiledInstructions.map(function (c) { return { p: c.programIdIndex, a: c.accountKeyIndexes, d: c.data }; })
        : m.instructions.map(function (c) { return { p: c.programIdIndex, a: c.accounts, d: c.data }; });
      ixs.forEach(function (ix) {
        if (keys[ix.p].toBase58() !== net.programId || !ix.a.length || keys[ix.a[0]].toBase58() !== buffer) return;
        var d = typeof ix.d === 'string' ? b58(ix.d) : Uint8Array.from(ix.d);
        if (d[0] === 0 && d.length >= 3) msgLen = d[1] | (d[2] << 8);
        if (d[0] === 1 && d.length > 3) { var off = d[1] | (d[2] << 8); chunks.push([off, d.subarray(3)]); if (off + d.length - 3 > PK_LEN + SIG_LEN) parts.push(sigs[i].signature); }
      });
      if ((tx.meta.logMessages || []).some(function (l) { return /moonseal: ML-DSA-65 VERIFIED/.test(l); })) verified = { sig: sigs[i].signature, time: sigs[i].blockTime || tx.blockTime };
    }
    if (msgLen == null || !chunks.length) throw new Error('these transactions are not a moonseal seal');
    var all = new Uint8Array(PK_LEN + SIG_LEN + msgLen);
    chunks.forEach(function (c) { if (c[0] + c[1].length <= all.length) all.set(c[1], c[0]); });
    var pk = all.subarray(0, PK_LEN), sig = all.subarray(PK_LEN, PK_LEN + SIG_LEN), msg = all.subarray(PK_LEN + SIG_LEN);
    var finding = null; try { finding = JSON.parse(new TextDecoder().decode(msg)); } catch (e) { /* not a finding */ }
    return { net: net, pk: pk, sig: sig, msg: msg, finding: finding, sigOk: D.verify(sig, msg, pk), verified: verified, parts: parts,
             keyId: hex(await sha256(pk), 4), sealId: hex(await sha256(all)) };
  }
  function proofHost() {
    var host = $('#proof');
    if (host) return host;
    host = document.createElement('div'); host.id = 'proof'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-labelledby', 'proofTitle');
    host.innerHTML = '<div class="cmd-sheet glass glass-strong proof-sheet"><div class="cmd-head"><div><div class="eyebrow">Proof on Solana</div><h2 id="proofTitle">A sealed landing site</h2>' +
      '<p class="cmd-sub">This page reads the seal back from Solana, rebuilds the signed finding, checks its post-quantum signature in your browser, and looks for the moonseal program’s VERIFIED record. Nothing comes from a moonseal server.</p></div>' +
      '<button class="icon-btn" id="proofClose" aria-label="Close">✕</button></div>' +
      '<div class="cmd-verdict" id="proofVerdict"></div><div class="proof-body" id="proofBody"></div></div>';
    document.body.appendChild(host);
    $('#proofClose').onclick = function () { host.style.display = 'none'; };
    host.addEventListener('click', function (e) { if (e.target === host) host.style.display = 'none'; });
    return host;
  }
  async function openProof(buffer) {
    var host = proofHost(); host.style.display = 'grid';
    var v = $('#proofVerdict'), body = $('#proofBody');
    v.className = 'cmd-verdict'; v.textContent = ''; body.innerHTML = '<p class="proof-wait">Reading the seal from Solana…</p>';
    try {
      var r = await readProof(buffer), f = r.finding || {};
      var good = r.sigOk && !!r.verified && !!r.finding;
      v.className = 'cmd-verdict ' + (good ? 'ok' : 'bad');
      v.textContent = good ? 'VALID · ' + (f.site || 'a landing site') + ' · ' + String(f.land_utc || '').slice(0, 10) : 'NOT VALID';
      var tx = function (sig, text) { return r.net.explorer ? '<a href="' + r.net.explorer.replace('{sig}', sig) + '" target="_blank" rel="noopener">' + text + ' ↗</a>' : text; };
      var when = r.verified && r.verified.time ? new Date(r.verified.time * 1000).toISOString().slice(0, 16).replace('T', ' ') + ' UTC' : '';
      body.innerHTML =
        '<div class="proof-checks">' +
          '<div class="' + (r.finding ? 'ok' : 'bad') + '"><i></i>The signed text is a moonseal landing-site finding</div>' +
          '<div class="' + (r.sigOk ? 'ok' : 'bad') + '"><i></i>Its ML-DSA-65 signature checks out in this browser · key ' + r.keyId + '</div>' +
          '<div class="' + (r.verified ? 'ok' : 'bad') + '"><i></i>' + (r.verified ? 'The moonseal program verified it on ' + esc(r.net.name) + (when ? ' on ' + when : '') + ' · ' + tx(r.verified.sig, 'VERIFIED') : 'No VERIFIED record found on chain') + '</div>' +
        '</div>' +
        (r.finding ? '<div class="proof-finding"><h3>' + esc(f.site) + '</h3><dl>' +
          '<dt>Land</dt><dd>' + esc(String(f.land_utc).replace('T', ' ').replace('Z', ' UTC')) + ', stay ' + esc(f.stay_days) + ' days</dd>' +
          '<dt>Answer</dt><dd>' + esc(f.verdict) + '</dd>' +
          '<dt>Sunlight</dt><dd>' + esc(f.sunlight_pct) + '% of the stay</dd><dt>Earth in view</dt><dd>' + esc(f.earth_pct) + '% of the stay</dd>' +
          '<dt>Where</dt><dd>' + esc(f.lat) + '°, ' + esc(f.lon_e) + '° E</dd><dt>Data</dt><dd>' + esc(f.data) + '</dd>' +
          '<dt>Found</dt><dd>' + esc(String(f.found_utc).replace('T', ' ').replace('Z', ' UTC')) + '</dd></dl></div>' : '') +
        '<div class="proof-foot">Seal id ' + r.sealId.slice(0, 16) + '… · the finding, on chain: ' + r.parts.map(function (sig, i) { return tx(sig, 'part ' + (i + 1)); }).join(' · ') + '</div>';
    } catch (e) {
      v.className = 'cmd-verdict bad'; v.textContent = 'NOT VALID';
      body.innerHTML = '<p class="proof-wait">' + esc(/\b429\b|too many/i.test(e.message) ? 'Solana devnet is busy for this network right now; open the link again in half a minute.' : e.message) + '</p>';
    }
  }
  async function copyLink() {
    var link = proofLink(st.buffer), out = $('#sealNextOut');
    try { await navigator.clipboard.writeText(link); out.innerHTML = 'Link copied. Anyone can open it and check the seal: <a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a>'; }
    catch (e) { out.innerHTML = 'Your proof link: <a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a>'; }
  }
  async function earthAtLanding() {
    var out = $('#sealNextOut'), q = st.ctx && st.ctx.los;
    if (!q) return;
    out.textContent = 'Asking Solana…';
    try {
      var r = await askEarth(q), same = st.ctx.plannerEarth == null ? null : (st.ctx.plannerEarth === r.inView);
      out.innerHTML = '<b class="' + (r.inView ? 'okc' : 'badc') + '">Solana: Earth ' + (r.inView ? 'in view' : 'hidden') + ' at landing</b>, ' + Math.abs(r.margin).toFixed(2) + '° ' +
        (r.margin > 0 ? 'above' : 'below') + ' the skyline' + (same == null ? '' : same ? ' · same answer as the planner' : ' · the planner disagrees') + (r.link ? ' · ' + r.link : '');
    } catch (e) { out.textContent = /\b429\b|too many/i.test(e.message) ? 'Solana devnet is busy for this network right now; try again in half a minute.' : 'Could not reach Solana: ' + e.message; }
  }

  function build() {
    var host = document.createElement('div');
    host.id = 'seal'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true'); host.setAttribute('aria-labelledby', 'sealTitle');
    host.innerHTML =
      '<div class="cmd-sheet glass glass-strong">' +
      '<div class="cmd-head"><div><div class="eyebrow">Proof on Solana</div><h2 id="sealTitle">Seal this landing site</h2>' +
      '<p class="cmd-sub">You found a good place and day to land. moonseal signs that finding with a <b>post-quantum signature</b> and records it <b>in public on Solana</b>: proof of what you found and when, that anyone can check. Change one letter and the seal breaks.</p></div>' +
      '<button class="icon-btn" id="sealClose" aria-label="Close">✕</button></div>' +
      '<div class="cmd-pipe seal-pipe">' +
      '<div class="st" id="sl1"><div class="st-k">1 · Your finding</div><div class="st-t">…</div><div class="st-x"></div><div class="st-f"></div></div>' +
      '<div class="st" id="sl2"><div class="st-k">2 · Signed, post-quantum</div><div class="st-t">Waiting</div><div class="st-x"></div><div class="st-f"></div></div>' +
      '<div class="st" id="sl3"><div class="st-k">3 · Sealed on Solana</div><div class="st-t">Not yet</div><div class="st-x">One press: the moonseal program checks the signature on Solana.</div><div class="st-f"></div>' +
      '<button class="btn chain-btn" id="sealBtn"><span class="sol-dot"></span>Seal it on Solana</button><div class="chain-log num" id="sealLog"></div></div>' +
      '</div>' +
      '<div class="cmd-verdict" id="sealVerdict"></div>' +
      '<div class="seal-try"><button class="btn" id="sealTamper">Change one letter and check again</button><span id="sealTamperOut"></span></div>' +
      '<div class="seal-next" id="sealNext" hidden><div class="sn-k">What now</div><div class="sn-row">' +
      '<button class="btn light" id="sealCopy">Copy the proof link</button><button class="btn" id="sealVerify">Verify it yourself</button>' +
      '<button class="btn" id="sealEarth">Ask Solana: Earth in view at landing?</button></div><div class="sn-out" id="sealNextOut"></div></div>' +
      '<details class="seal-raw"><summary>The exact text that is signed</summary><pre id="sealRaw"></pre></details>' +
      '<div class="cmd-foot">Solana devnet, the test network. The program is moonseal’s ML-DSA-65 verifier (tools/mldsa-onchain): the key, the signature and the finding go on chain in pieces and the signature is checked in stages; the temporary account is then closed and its rent refunded. The seal id is sha256(key, signature, finding), computed by the program and by this page.</div>' +
      '</div>';
    document.body.appendChild(host);
    $('#sealClose').onclick = close;
    host.addEventListener('click', function (e) { if (e.target === host) close(); });
    $('#sealBtn').onclick = seal;
    $('#sealTamper').onclick = tamper;
    $('#sealCopy').onclick = copyLink;
    $('#sealVerify').onclick = function () { if (st.buffer) openProof(st.buffer); };
    $('#sealEarth').onclick = earthAtLanding;
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && host.style.display === 'grid') close(); });
  }

  build();
  // a proof link opens straight onto the proof, once the page is up
  var proofParam = new URLSearchParams(location.search).get('proof');
  if (proofParam && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(proofParam)) window.addEventListener('load', function () { setTimeout(function () { openProof(proofParam); }, 900); });
  return { open: open, close: close, seal: seal, tamper: tamper, askEarth: askEarth, openProof: openProof, readProof: readProof, state: st };
})();
