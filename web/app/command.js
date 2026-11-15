/* Command the lander: post-quantum, end to end, gated by the planner's line of sight.
 *
 *   operator  --ML-DSA-65 sign-->  encrypt to the lander (ML-KEM-768 + AES-256-GCM)
 *     --> untrusted ground station on Solana (sees ciphertext only; anchors a hash)
 *     --> lander: decrypt -> verify signature -> fresh counter -> Earth above the skyline (planner)
 *
 * Real crypto in the browser: @noble/post-quantum 0.7.1 (vendored, app/pq-bundle.js). Interop was checked
 * against BouncyCastle 1.81 (the Android app's library) in both directions. Inside the Android app
 * (window.LunarBridge) the operator signature is made natively on the phone instead. */
window.Command = (function () {
  'use strict';
  var PQ = window.PQ, D = PQ && PQ.ml_dsa65, K = PQ && PQ.ml_kem768;
  var BRIDGE = window.LunarBridge || null;
  var te = new TextEncoder(), td = new TextDecoder();
  var $ = function (s) { return document.querySelector(s); };
  var st = { op: null, attacker: null, lander: null, counter: 0, lastAccepted: 0, lastPacket: null, mode: 'honest', busy: false };
  var COMMANDS = [
    ['POINT_HGA_EARTH', 'Point the high-gain antenna at Earth'],
    ['HEATERS_ON', 'Turn survival heaters on'],
    ['DRILL_START', 'Start the drill, 30 cm'],
    ['SAFE_MODE', 'Enter safe mode']
  ];
  var MODES = [
    ['honest', 'Real command'],
    ['tamper', 'Changed on the way'],
    ['forged', 'Forged by an attacker'],
    ['replay', 'Replay an old command'],
    ['blackout', 'Send while Earth is hidden']
  ];

  function hex(b, n) { var s = ''; for (var i = 0; i < Math.min(b.length, n || b.length); i++) s += b[i].toString(16).padStart(2, '0'); return s; }
  function b64d(s) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  function cat() { var n = 0, i; for (i = 0; i < arguments.length; i++) n += arguments[i].length; var o = new Uint8Array(n), p = 0; for (i = 0; i < arguments.length; i++) { o.set(arguments[i], p); p += arguments[i].length; } return o; }
  function ms(t0) { return (performance.now() - t0).toFixed(1) + ' ms'; }
  function fmtB(n) { return n.toLocaleString('en') + ' B'; }
  function sleep(t) { return new Promise(function (r) { setTimeout(r, Spring.reduced() ? 0 : t); }); }

  // Demo operator key: derived from a PUBLIC seed (onchain-config.js) so every visitor can command the demo
  // base; its sha256 sits in the base's registry on Solana. A real operator key stays with the operator, never public.
  function demoSeed() {
    var h = (window.MOONSEAL_ONCHAIN || {}).demoOperatorSeedHex;
    return h ? Uint8Array.from(h.match(/../g).map(function (x) { return parseInt(x, 16); })) : undefined;
  }
  // The uplink ticket (101 B); byte layout mirrored in tools/mldsa-onchain/src/lib.rs (AUTHORIZE parses it):
  // "MSUT" | 1 | registry pubkey (32) | counter u64 LE | planned hour i64 LE | sha256(packet) (32) | site id (16, ASCII)
  function uplinkTicket(counter, hour, packetSha, siteId) {
    var t = new Uint8Array(101), v = new DataView(t.buffer);
    t.set(te.encode('MSUT'), 0); t[4] = 1; t.set(registryBytes(), 5);
    v.setBigUint64(37, BigInt(counter), true); v.setBigInt64(45, BigInt(hour), true);
    t.set(packetSha, 53); t.set(te.encode(siteId).subarray(0, 16), 85);
    return t;
  }
  function registryBytes() {   // base58 address of the base's registry -> 32 bytes
    var s = (window.MOONSEAL_ONCHAIN || {}).registry || '', A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz', n = 0n, out = new Uint8Array(32);
    for (var i = 0; i < s.length; i++) { var k = A.indexOf(s[i]); if (k < 0) return new Uint8Array(32); n = n * 58n + BigInt(k); }
    for (var j = 31; j >= 0; j--) { out[j] = Number(n & 255n); n >>= 8n; }
    return out;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function keys() {
    if (st.op) return;
    var t0 = performance.now();
    if (BRIDGE && BRIDGE.publicKeyB64) { st.op = { publicKey: b64d(BRIDGE.publicKeyB64()), native: true }; st.demoOp = D.keygen(demoSeed()); }
    else st.op = st.demoOp = D.keygen(demoSeed());
    st.opMs = ms(t0);
    st.attacker = D.keygen();
    t0 = performance.now(); st.lander = K.keygen(); st.kemMs = ms(t0);
  }

  function siteAndTime() {
    var ui = window.__ui, s = ui.state.site;
    if (!s || !s.terrain) s = ui.SITES.find(function (x) { return x.id === 'connecting_ridge'; });
    return { site: s, t: ui.state.t };
  }

  function lineOfSight(site, t) {
    var m = Model.compute(site), up = Model.at(m.earM, t) > 0, cd = Model.countdown(m.earM, t);
    var a = LunarEphem.azel(site.lat, site.lon, t, site.elev_m || 0);
    return { up: up, margin: Model.at(m.earM, t), earthEl: a.earthEl, next: cd };
  }

  /* ---------------------------------------------------------------- the pipeline */
  async function send() {
    if (st.busy) return; st.busy = true;
    keys();
    var mode = st.mode, ctx = siteAndTime(), site = ctx.site, t = ctx.t, note = '';
    if (mode === 'blackout') {
      var los0 = lineOfSight(site, t);
      if (los0.up && los0.next.inH != null) t = t + los0.next.inH + 0.5;
      else if (los0.up) note = 'Earth never sets at ' + site.name + ' before 2028, so there is no blackout to send into here. Pick Connecting Ridge.';
    }
    reset();
    var cmd = $('#cmdSel').value, packet, sig, payload, kemCt, iv, ct, signMs, encMs, counter;
    if (mode === 'replay' && st.lastPacket) {
      packet = st.lastPacket.packet; payload = st.lastPacket.payload; counter = st.lastPacket.counter;
      stage('s1', 'Recorded earlier', 'The attacker replays a packet captured from a past uplink, byte for byte.', [['counter', String(counter)]]);
    } else {
      if (mode === 'replay') note = 'Nothing recorded yet: this uplink goes up honestly and gets recorded. Press again to replay it.';
      counter = ++st.counter;
      payload = te.encode(JSON.stringify({ v: 1, site: site.id, cmd: cmd, counter: counter, hour: Math.round(t) }));
      var t0 = performance.now();
      if (mode === 'forged') sig = D.sign(payload, st.attacker.secretKey);
      else if (st.op.native) sig = b64d(await BRIDGE.signMLDSA(td.decode(payload)));
      else sig = D.sign(payload, st.op.secretKey);
      signMs = ms(t0);
      stage('s1', mode === 'forged' ? 'Attacker signs' : (st.op.native ? 'Signed on this phone (native)' : 'Signed by the lander’s team (this browser)'),
        mode === 'forged' ? 'The attacker knows the lander’s public key and the format, but not the operator’s private key, so it signs with its own.'
                          : 'The signature covers the command, a counter and the planned hour. ML-DSA-65 (FIPS 204).',
        [['signature', fmtB(sig.length)], ['sign time', signMs], ['counter', String(counter)]]);
      await sleep(380);
      t0 = performance.now();
      var enc = K.encapsulate(st.lander.publicKey);
      kemCt = enc.cipherText;
      var key = await crypto.subtle.importKey('raw', enc.sharedSecret, 'AES-GCM', false, ['encrypt']);
      iv = crypto.getRandomValues(new Uint8Array(12));
      var len = new Uint8Array([payload.length >> 8, payload.length & 255]);
      ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, cat(len, payload, sig)));
      encMs = ms(t0);
      packet = cat(kemCt, iv, ct);
      stage('s2', 'Sealed for the lander', 'Only the lander can open it. ML-KEM-768 (FIPS 203) agrees a fresh key; AES-256-GCM seals the command and its signature.',
        [['KEM ciphertext', fmtB(kemCt.length)], ['uplink packet', fmtB(packet.length)], ['telecommand frames', '≈ ' + Math.ceil(packet.length / 1024) + ' × 1,024 B'], ['encrypt time', encMs]]);
    }
    await sleep(380);
    // uplink ticket: a PUBLIC statement the operator signs (ML-DSA-65). On Solana the moonseal program verifies the
    // signature AND applies the base's registry: only a registered key, a ticket naming this base and a fresh
    // counter make the uplink AUTHORIZED. The command itself stays encrypted.
    var hpk = new Uint8Array(await crypto.subtle.digest('SHA-256', packet));
    var forgedTicket = mode === 'forged';
    if (mode === 'replay' && st.lastAuthorized) {
      st.ticket = st.lastAuthorized;                        // the captured ticket + signature, byte for byte
    } else {
      var ticket = uplinkTicket(Date.now(), Math.round(t), hpk, site.id);
      // (the Android app's bridge signs text only, so tickets are signed with the demo operator key there too)
      var tkey = forgedTicket ? st.attacker : st.demoOp;
      st.ticket = { msg: ticket, sig: D.sign(ticket, tkey.secretKey), pk: tkey.publicKey, forged: forgedTicket };
    }
    var relayed = packet.slice();
    if (mode === 'tamper') relayed[1200] ^= 0x01;           // a single bit flipped inside the sealed body
    var h = new Uint8Array(await crypto.subtle.digest('SHA-256', relayed));
    st.relayedSha = hex(h);
    stage('s3', 'Relayed by an untrusted station', mode === 'tamper' ? 'A compromised station flips one bit before uplinking. It cannot read or re-sign the packet.'
      : 'The ground station can’t read it. It relays only what the base’s list on Solana has authorized.',
      [['packet SHA-256', hex(h, 8) + '…'], ['uplink ticket', 'ML-DSA-65 · ' + fmtB(st.ticket.sig.length)]]);
    $('#s3 .st-f').insertAdjacentHTML('beforeend', '<button class="btn chain-btn" id="chainBtn"><span class="sol-dot"></span>Check it on Solana</button><div class="chain-log num" id="chainLog"></div>');
    $('#chainBtn').onclick = function () {
      onChain().catch(function (e) {
        var busy = /\b429\b|too many requests/i.test(e.message);
        var lost = /fetch|network|timeout|refused/i.test(e.message);
        chainLog((busy ? 'The public Solana devnet endpoint is rate-limiting this network right now (HTTP 429). Wait half a minute and press again. '
          : lost ? 'Lost the connection to the Solana network mid-run (is the local validator still running?). ' : 'On-chain run failed: ' + e.message + '. ') +
          (e.closeSig ? 'The partly written buffer was closed and its rent refunded. ' : '') + MEASURED, true);
        var b = $('#chainBtn'); if (b) b.disabled = false;
        console.error(e);
      });
    };
    await sleep(380);

    /* ---- the lander ---- */
    var gates = [], ok = true, los = lineOfSight(site, t), body = null, rsig = null, rpayload = null;
    gates.push(['Earth in view', los.up, los.up ? 'Earth ' + los.margin.toFixed(2) + '° above the skyline at ' + site.name
      : 'Earth is below the skyline: the uplink never reaches the lander' + (los.next.inH != null ? '. Next window opens in ' + dur(los.next.inH) : ''), 'Earth was hidden']);
    ok = los.up;
    if (ok) {
      try {
        var rk = relayed.subarray(0, 1088), riv = relayed.subarray(1088, 1100), rct = relayed.subarray(1100);
        var ss = K.decapsulate(rk, st.lander.secretKey);
        var key2 = await crypto.subtle.importKey('raw', ss, 'AES-GCM', false, ['decrypt']);
        body = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: riv }, key2, rct));
        gates.push(['Seal intact', true, 'Only the lander’s key opens it (ML-KEM-768 + AES-GCM); any change on the way breaks it', 'the seal was broken']);
      } catch (e) { gates.push(['Seal intact', false, 'Seal broken: the packet was changed on the way', 'the seal was broken']); ok = false; }
    }
    if (ok && st.attest) {                    // hybrid seal: the key that must have signed was attested by the wallet
      var attested = st.attest.ok && st.attest.keyHash === await sha256hex(st.op.publicKey);
      gates.push(['Key vouched for by the wallet', attested, attested
        ? st.attest.wallet + ' vouched for this ML-DSA-65 key'
        : 'No valid wallet attestation for this key', 'the wallet did not vouch for this key']);
      ok = attested;
    }
    if (ok) {
      var L = (body[0] << 8) | body[1]; rpayload = body.subarray(2, 2 + L); rsig = body.subarray(2 + L);
      var t0v = performance.now(), good = D.verify(rsig, rpayload, st.op.publicKey), vMs = ms(t0v);
      gates.push(['Signed by its own team', good, good ? 'ML-DSA-65 signature from the team’s key · verified in ' + vMs : 'Not signed with the team’s key · refused in ' + vMs, 'not signed by its own team']);
      ok = good;
    }
    if (ok) {
      var c = JSON.parse(td.decode(rpayload)).counter, fresh = c > st.lastAccepted;
      gates.push(['Not a replay', fresh, fresh ? 'Counter ' + c + ' is new' : 'Counter ' + c + ' was already used', 'a replayed command']);
      ok = fresh;
      if (ok) { st.lastAccepted = c; st.lastPacket = { packet: packet, payload: rpayload, counter: c }; }
    }
    showLander(site, gates, ok, cmd);
    if (note) toastNote(note);
    st.busy = false;
  }

  /* ---------------------------------------------------------------- hybrid seal: the Solana wallet attests the PQ key */
  function walletLine(html, bad) { var el = $('#walletLine'); el.innerHTML = html; el.classList.toggle('bad', !!bad); }
  async function sha256hex(b) { return hex(new Uint8Array(await crypto.subtle.digest('SHA-256', b))); }
  async function connectWallet() {
    var btn = $('#walletBtn'); btn.disabled = true;
    walletLine('Loading the wallet connector…');
    await loadScript('app/wallet-bundle.js', 'MoonsealWallet');
    MoonsealWallet.setup();                                // registers Mobile Wallet Adapter on Android
    var ws = MoonsealWallet.getWallets().get().filter(function (w) { return w.features['standard:connect'] && w.features['solana:signMessage']; });
    var w = ws.find(function (x) { return /Mobile Wallet Adapter/.test(x.name); }) || ws[0];
    if (!w) {
      walletLine('No Solana wallet found in this browser. On a laptop: Phantom or Solflare. On Android: open this page in the phone’s browser with a Solana wallet app installed (Mobile Wallet Adapter).');
      btn.disabled = false; return;
    }
    keys();
    walletLine('Connecting to ' + w.name + '…');
    var r = await w.features['standard:connect'].connect();
    var acct = (r && r.accounts && r.accounts[0]) || w.accounts[0];
    var keyHash = await sha256hex(st.op.publicKey);
    var text = 'moonseal operator attestation\nThis post-quantum key may command landers on my behalf.\nML-DSA-65 key sha256: ' + keyHash + '\nIssued: ' + new Date().toISOString();
    walletLine('Approve the attestation in ' + w.name + '…');
    var out = await w.features['solana:signMessage'].signMessage({ account: acct, message: te.encode(text) });
    var res = Array.isArray(out) ? out[0] : out;
    var signed = res.signedMessage || te.encode(text);
    var ok = MoonsealWallet.ed25519.verify(res.signature, signed, acct.publicKey) && td.decode(signed).indexOf(keyHash) >= 0;
    st.attest = { wallet: w.name, address: acct.address, ok: ok, keyHash: keyHash };
    walletLine((ok ? '<b class="okc">Hybrid seal ready</b>: ' : '<b class="badc">Attestation did not verify</b>: ') +
      w.name + ' account ' + acct.address.slice(0, 4) + '…' + acct.address.slice(-4) +
      ' signed (ed25519) that ML-DSA-65 key ' + keyHash.slice(0, 10) + '… commands for it.', !ok);
    btn.textContent = 'Wallet connected'; btn.disabled = true;
  }

  /* ---------------------------------------------------------------- on-chain ML-DSA-65 (Solana) */
  var MEASURED = 'Measured in the Solana SBF VM (LiteSVM 0.6.1), on a local validator and live on Solana devnet: 11-12 transactions, at most 1,076,302 compute units and 1,155 bytes each; browser and BouncyCastle (Java) signatures VERIFIED, tampered ones REJECTED.';
  function chainLog(html, bad) { var el = $('#chainLog'); if (el) { el.innerHTML = html; el.classList.toggle('bad', !!bad); } }
  function loadScript(src, globalName) {
    globalName = globalName || 'MoonsealSolana';
    return new Promise(function (res, rej) { if (window[globalName]) return res(); var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { rej(new Error('could not load ' + src)); }; document.head.appendChild(s); });
  }
  async function pickNetwork() {
    var cfg = window.MOONSEAL_ONCHAIN || { networks: [] };
    for (var i = 0; i < cfg.networks.length; i++) {
      var n = cfg.networks[i];
      if (!n.programId) continue;
      try {
        var conn = new MoonsealSolana.Connection(n.rpc, 'confirmed');
        var ctl = new AbortController(); var to = setTimeout(function () { ctl.abort(); }, n.airdrop ? 2500 : 15000);   // local: fail fast; a public RPC's first browser connection can take ~6 s
        var info = await Promise.race([conn.getAccountInfo(new MoonsealSolana.PublicKey(n.programId)), new Promise(function (_, r) { ctl.signal.addEventListener('abort', function () { r(new Error('timeout')); }); })]);
        clearTimeout(to);
        if (info && info.executable) return { net: n, conn: conn };
      } catch (e) {
        // HTTP 429 = reachable but busy (the public devnet RPC rate-limits per IP); the run itself backs off
        if (!n.airdrop && /\b429\b|too many requests/i.test(String(e && e.message))) return { net: n, conn: conn };
        /* otherwise try the next network */
      }
    }
    return null;
  }
  async function payerFor(p) {
    var K = MoonsealSolana.Keypair;
    if (p.net.airdrop) {                     // local validator: a throwaway key, funded on the spot
      var kp = K.generate();
      var s = await p.conn.requestAirdrop(kp.publicKey, 2e9);
      // a real timer: the animation sleep() returns at once under reduced motion, and the airdrop would not land in time
      for (var i = 0; i < 40; i++) { var v = (await p.conn.getSignatureStatuses([s])).value[0]; if (v && (v.confirmationStatus === 'confirmed' || v.confirmationStatus === 'finalized')) break; await new Promise(function (r) { setTimeout(r, 400); }); }
      if (!(await p.conn.getBalance(kp.publicKey, 'confirmed'))) throw new Error('the local validator did not fund the demo payer');
      return kp;
    }
    var demo = window.LUNAR_SOLANA_DEMO;      // devnet: the disposable demo key (devnet SOL only)
    if (!demo || !demo.secretKey) throw new Error('no devnet payer is configured in web/solana-demo-config.js (see web/solana-demo-config.example.js), or start a local validator');
    return K.fromSecretKey(Uint8Array.from(demo.secretKey));
  }
  async function onChain() {
    if (!st.ticket) return;
    var btn = $('#chainBtn'); btn.disabled = true;
    chainLog('Loading the Solana client…');
    await loadScript('app/moonseal-solana.js');
    chainLog('Looking for a network with the moonseal verifier…');
    var p = await pickNetwork();
    if (!p) { chainLog('No Solana network with the verifier is reachable from this page right now. ' + MEASURED); btn.disabled = false; return; }
    var payer = await payerFor(p);
    var explorer = function (sig) { return p.net.explorer ? '<a href="' + p.net.explorer.replace('{sig}', sig) + '" target="_blank" rel="noopener">' + sig.slice(0, 8) + '…</a>' : sig.slice(0, 8) + '…'; };
    var txLink = function (sig, text) { return sig && p.net.explorer ? '<a class="chain-tx" href="' + p.net.explorer.replace('{sig}', sig) + '" target="_blank" rel="noopener">' + text + ' ↗</a>' : ''; };
    // the base's registry (its policy: which keys may command it), if this network has one
    var registry = p.net.registry || (window.MOONSEAL_ONCHAIN || {}).registry || null;
    if (registry) { try { if (!(await p.conn.getAccountInfo(new MoonsealSolana.PublicKey(registry)))) registry = null; } catch (e) { registry = null; } }
    var lines = [];
    var t0 = performance.now();
    var r = await MoonsealSolana.verifyOnChain({ rpc: p.net.rpc, programId: p.net.programId, payer: payer, pk: st.ticket.pk, sig: st.ticket.sig, msg: st.ticket.msg, registry: registry,
      onStep: function (s) { lines.push(s.i + '/' + s.n + ' ' + s.label + ' · ' + explorer(s.sig)); chainLog('<b>' + p.net.name + '</b> · program ' + p.net.programId.slice(0, 6) + '…<br>' + lines.slice(-4).join('<br>')); } });
    if (r.authorized && st.ticket !== st.lastAuthorized) st.lastAuthorized = st.ticket;   // what a replay re-submits
    var auth = r.authorized === undefined ? '<br><small>This network has no base registry yet: signature check only.</small>'
      : r.authorized ? '<br><b class="ok">Uplink AUTHORIZED by the base’s registry</b> · registered key, this base, fresh counter'
      : '<br><b class="badtxt">Uplink DENIED by the base’s registry: ' + esc(r.authReason || 'refused') + '</b>';
    var station = !(r.authorized && r.registryState) ? ''
      : r.registryState.packet === st.relayedSha ? '<br>Stations relay it: the packet they hold is the one the base authorized.'
      : '<br><b class="badtxt">Stations refuse it: the packet they hold is not the one the base authorized.</b>';
    var good = r.verified && r.authorized !== false && !(r.authorized && station.indexOf('refuse') >= 0);
    chainLog('<b class="' + (r.verified ? 'ok' : 'badtxt') + '">' + (r.verified ? 'Signature VERIFIED on chain' : 'Signature REJECTED on chain') + '</b>' + auth + station +
      '<br>' + r.sigs.length + ' transactions on ' + p.net.name + ' in ' + ((performance.now() - t0) / 1000).toFixed(1) + ' s · buffer ' + (r.closeSig ? 'closed, rent refunded' : 'left open') +
      [txLink(r.verifySig, 'Verifying transaction'), txLink(r.authSig, r.authorized ? 'Authorizing transaction' : 'The refusal, on chain')]
        .filter(Boolean).map(function (x, i) { return (i ? ' · ' : '<br>') + x; }).join(''), !good);
    btn.disabled = false;
  }

  function dur(h) { if (h < 48) return Math.floor(h) + ' h ' + Math.round((h % 1) * 60) + ' min'; return Math.floor(h / 24) + ' d ' + Math.round(h % 24) + ' h'; }
  function toastNote(msg) { var el = $('#toast'); el.textContent = msg; el.style.opacity = 1; setTimeout(function () { el.style.opacity = 0; }, 4200); }

  /* ---------------------------------------------------------------- rendering */
  function stage(id, title, text, facts) {
    var el = $('#' + id); el.classList.add('on');
    el.querySelector('.st-t').textContent = title;
    el.querySelector('.st-x').textContent = text;
    el.querySelector('.st-f').innerHTML = facts.map(function (f) { return '<div><span>' + f[0] + '</span><b class="num">' + f[1] + '</b></div>'; }).join('');
  }
  function reset() {
    ['s1', 's2', 's3', 's4'].forEach(function (id) { var el = $('#' + id); el.classList.remove('on', 'ok', 'bad'); });
    $('#s4 .st-f').innerHTML = ''; $('#cmdVerdict').className = 'cmd-verdict'; $('#cmdVerdict').textContent = '';
  }
  function showLander(site, gates, ok, cmd) {
    var el = $('#s4'); el.classList.add('on', ok ? 'ok' : 'bad');
    el.querySelector('.st-t').textContent = 'Lander at ' + site.name;
    el.querySelector('.st-x').textContent = 'Executes only if every check passes.';
    el.querySelector('.st-f').innerHTML = gates.map(function (g) {
      return '<div class="gate ' + (g[1] ? 'pass' : 'fail') + '"><i></i><span><b>' + g[0] + '</b><br><small>' + g[2] + '</small></span></div>';
    }).join('');
    var v = $('#cmdVerdict');
    v.className = 'cmd-verdict ' + (ok ? 'ok' : 'bad');
    var label = COMMANDS.find(function (c) { return c[0] === cmd; });
    v.textContent = ok ? 'EXECUTED · ' + (label ? label[1] : cmd) : 'REFUSED · ' + gates.filter(function (g) { return !g[1]; }).map(function (g) { return g[3] || g[0]; })[0];
  }

  function open() {
    if (!D || !K) { toastNote('Post-quantum module failed to load.'); return; }
    var ctx = siteAndTime(), los = lineOfSight(ctx.site, ctx.t);
    $('#cmdCtx').textContent = 'Target: ' + ctx.site.name + ' · ' + LunarEphem.dateAt(ctx.t).toISOString().slice(0, 16).replace('T', ' ') + ' UTC · Earth ' +
      (los.up ? 'in view (' + los.margin.toFixed(2) + '° above the skyline)' : 'hidden behind the skyline');
    var jb = $('#cmdJump');                  // the planner -> command link, made visible
    if (!los.up && los.next.inH != null) {
      jb.hidden = false;
      jb.textContent = 'Earth is below the skyline now: an uplink cannot reach ' + ctx.site.name + '. Jump to the next contact window (in ' + dur(los.next.inH) + ')';
      jb.onclick = function () { window.__ui.setTime(ctx.t + los.next.inH + 2); reset(); open(); };   // 2 h after Earthrise: a usable margin
    } else jb.hidden = true;
    $('#cmd').style.display = 'grid';
    setTimeout(function () { keys(); $('#cmdKeys').textContent = 'Keys ready: ' + (st.op.native ? 'operator ML-DSA-65 (native, on this phone)' : 'operator ML-DSA-65 (demo key in the base’s registry) generated in ' + st.opMs) +
      ' · lander ML-KEM-768 generated in ' + st.kemMs + ' · public keys ' + fmtB(st.op.publicKey.length) + ' / ' + fmtB(st.lander.publicKey.length); }, 30);
  }
  function close() { $('#cmd').style.display = 'none'; }

  function build() {
    var host = document.createElement('div');
    host.id = 'cmd'; host.setAttribute('role', 'dialog'); host.setAttribute('aria-modal', 'true');
    host.innerHTML =
      '<div class="cmd-sheet glass glass-strong">' +
      '<div class="cmd-head"><div><div class="eyebrow">Keep control of your lander</div><h2>Command the lander</h2>' +
      '<p class="cmd-sub">Commands from the lander’s own team go through. A command <b>changed on the way</b>, <b>forged</b> by an attacker or <b>replayed</b> from the past is refused, by the lander and in public on Solana. Each command is signed with NIST’s new signature standard, built to resist even future quantum computers, and sealed so only the lander can read it. Real cryptography, running in this browser.</p>' +
      '<div class="cmd-ctx num" id="cmdCtx"></div><div class="cmd-keys num" id="cmdKeys">Generating keys…</div>' +
      '<button class="btn cmd-jump" id="cmdJump" hidden></button>' +
      '<div class="cmd-wallet"><button class="btn wallet-btn" id="walletBtn"><span class="sol-dot"></span>Connect your Solana wallet</button><span class="wallet-line" id="walletLine">Optional: let your Solana wallet vouch for the signing key, as a second lock.</span></div></div>' +
      '<button class="icon-btn" id="cmdClose" aria-label="Close">✕</button></div>' +
      '<div class="cmd-ctrl"><select id="cmdSel" aria-label="Command">' + COMMANDS.map(function (c) { return '<option value="' + c[0] + '">' + c[1] + '</option>'; }).join('') + '</select>' +
      '<div class="seg cmd-modes" role="group" aria-label="Scenario">' + MODES.map(function (m, i) { return '<button data-mode="' + m[0] + '" aria-pressed="' + (i === 0) + '">' + m[1] + '</button>'; }).join('') + '</div>' +
      '<button class="btn light" id="cmdSend">Sign &amp; send</button></div>' +
      '<div class="cmd-pipe">' +
      ['s1|1 · You sign', 's2|2 · Sealed', 's3|3 · Relayed, checked on Solana', 's4|4 · On the Moon'].map(function (p) {
        var a = p.split('|'); return '<div class="st" id="' + a[0] + '"><div class="st-k">' + a[1] + '</div><div class="st-t">Waiting</div><div class="st-x"></div><div class="st-f"></div></div>';
      }).join('') + '</div>' +
      '<div class="cmd-verdict" id="cmdVerdict"></div>' +
      '<div class="cmd-why">' +
      '<div><h4>Why no one can forge it</h4><p>A lander works for years on keys set before launch. A shared secret key cannot be handed to many operators and relay stations without letting them make commands too. A signature can: anyone checks it, only the team can make it. ML-DSA is NIST’s signature standard designed to stay unforgeable even when quantum computers arrive.</p></div>' +
      '<div><h4>Why no one else can read it</h4><p>Anyone can record the radio uplink today and try to break it years from now. ML-KEM, NIST’s key-exchange standard designed against quantum computers, keeps the recording unreadable.</p></div>' +
      '<div><h4>What Solana does</h4><p>Solana keeps the base’s list of who may command it, and a public record of every command it authorized or refused. Ground stations never see the command and can’t forge one. Solana’s own keys are not the root of trust; the team’s ML-DSA key is.</p></div>' +
      '</div>' +
      '<div class="cmd-foot">Interop checked: ML-DSA-65 signatures made by this page verify in BouncyCastle 1.81 (Java), and BouncyCastle signatures verify here. ' +
      'Uplink packet = KEM ciphertext + nonce + sealed (command + signature). <a href="solana-demo.html" target="_blank" rel="noopener">Anchor a relay proof on Solana devnet →</a></div>' +
      '</div>';
    document.body.appendChild(host);
    $('#cmdClose').onclick = close;
    host.addEventListener('click', function (e) { if (e.target === host) close(); });
    host.querySelectorAll('.cmd-modes button').forEach(function (b) {
      b.onclick = function () { st.mode = b.dataset.mode; host.querySelectorAll('.cmd-modes button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); };
    });
    $('#cmdSend').onclick = function () { send().catch(function (e) { st.busy = false; toastNote('Error: ' + e.message); console.error(e); }); };
    $('#walletBtn').onclick = function () { connectWallet().catch(function (e) { walletLine('Wallet: ' + (e && e.message ? e.message : e), true); $('#walletBtn').disabled = false; console.error(e); }); };
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  build();
  return { open: open, close: close, send: send, state: st, chain: { loadScript: loadScript, pickNetwork: pickNetwork, payerFor: payerFor } };
})();
