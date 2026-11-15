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
  var st = { key: null, finding: null, bytes: null, sig: null, keyId: null, busy: false };
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

  function open(f) {
    if (!D) { toast('The post-quantum module failed to load.'); return; }
    if (!f) { toast('Pick a landing site first.'); return; }
    st.finding = f; st.sig = null; st.bytes = te.encode(JSON.stringify(f));
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
  function close() { $('#seal').style.display = 'none'; }

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
      '<details class="seal-raw"><summary>The exact text that is signed</summary><pre id="sealRaw"></pre></details>' +
      '<div class="cmd-foot">Solana devnet, the test network. The program is moonseal’s ML-DSA-65 verifier (tools/mldsa-onchain): the key, the signature and the finding go on chain in pieces and the signature is checked in stages; the temporary account is then closed and its rent refunded. The seal id is sha256(key, signature, finding), computed by the program and by this page.</div>' +
      '</div>';
    document.body.appendChild(host);
    $('#sealClose').onclick = close;
    host.addEventListener('click', function (e) { if (e.target === host) close(); });
    $('#sealBtn').onclick = seal;
    $('#sealTamper').onclick = tamper;
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape' && host.style.display === 'grid') close(); });
  }

  build();
  return { open: open, close: close, seal: seal, tamper: tamper, state: st };
})();
