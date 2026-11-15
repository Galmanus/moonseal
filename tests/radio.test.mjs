// Unit tests for web/app/radio.js (signal to Earth). Run: node --test tests/radio.test.mjs
// RADIO_SRC=<file> runs the same tests against another copy.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(process.env.RADIO_SRC || new URL('../web/app/radio.js', import.meta.url), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(src, ctx);
const Radio = ctx.window.Radio;
const H = JSON.parse(readFileSync(new URL('./fixtures/horizons_moon_dsn.json', import.meta.url), 'utf8'));
const XML = readFileSync(new URL('./fixtures/dsn_now_sample.xml', import.meta.url), 'utf8');

test('the DSN complexes are the ones the Horizons fixture was computed for', () => {
  assert.equal(Radio.DSN.length, 3);
  for (const st of Radio.DSN) {
    assert.ok(H.stations[st.key], st.key);
    assert.equal(st.lat, H.stations[st.key].lat);
    assert.equal(st.lon, H.stations[st.key].lon);
  }
});

test('Moon elevation at each DSN complex matches JPL Horizons within 0.5 degrees (2026-2027)', () => {
  let worst = 0, n = 0;
  for (const row of H.rows) {
    const ms = Date.parse(row.utc);
    for (const st of Radio.DSN) {
      const d = Math.abs(Radio.moonEl(st, ms) - row[st.key]);
      if (d > worst) worst = d;
      n++;
    }
  }
  assert.equal(n, 405);
  assert.ok(worst < 0.5, 'worst difference ' + worst.toFixed(3) + ' deg');
});

test('"a dish has the Moon" agrees with Horizons except within 0.5 degrees of the 10 degree mask', () => {
  let disagree = 0;
  for (const row of H.rows) {
    const ref = Math.max(...Radio.DSN.map(st => row[st.key]));
    const ours = Radio.bestDish(Date.parse(row.utc)).up;
    if (ours !== (ref >= Radio.MIN_EL) && Math.abs(ref - Radio.MIN_EL) > 0.5) disagree++;
  }
  assert.equal(disagree, 0);
});

test('link budget: free-space loss, dish gain, and distance', () => {
  const b = Radio.budget(384400);
  // independent form of the free-space loss: 92.45 + 20 log10(d km) + 20 log10(f GHz)
  const fspl = 92.448 + 20 * Math.log10(384400) + 20 * Math.log10(8.4);
  assert.ok(Math.abs(b.fsplDb - fspl) < 0.01, b.fsplDb + ' vs ' + fspl);
  assert.ok(b.rxGainDbi > 67.5 && b.rxGainDbi < 68.5, 'dish gain ' + b.rxGainDbi);
  const near = Radio.budget(356000), far = Radio.budget(406000);
  assert.ok(Math.abs((near.prDbm - far.prDbm) - 20 * Math.log10(406000 / 356000)) < 1e-9);
  assert.ok(near.maxBps > far.maxBps);
});

test('DSN Now feed: keeps Moon spacecraft only, with dish, complex and time', () => {
  const r = Radio.parseFeed(XML);
  assert.equal(r.time, 1794782269000);
  const codes = r.moon.map(x => x.code);
  assert.ok(codes.includes('KPLO'), codes.join(','));
  for (const c of ['SPP', 'JWST', 'JNO', 'DSN']) assert.ok(!codes.includes(c), c);
  const k = r.moon.find(x => x.code === 'KPLO');
  assert.equal(k.complex, 'Goldstone');
  assert.equal(k.dish, 'DSS23');
  assert.equal(k.rangeKm, null);          // -1 in the feed: no range reported
});

test('DSN Now feed: each Moon spacecraft carries its complex code and a short name', () => {
  const k = Radio.parseFeed(XML).moon.find(x => x.code === 'KPLO');
  assert.equal(k.station, 'gdscc');
  assert.equal(k.short, 'Danuri (Korea)');
});

test('cross-check against real NASA data: when a Goldstone dish was pointed at Danuri, our Moon is in Goldstone\'s sky', () => {
  const r = Radio.parseFeed(XML), k = r.moon.find(x => x.code === 'KPLO');
  const c = Radio.crossCheck(k, r.time);
  assert.equal(c.station.key, 'goldstone');
  assert.equal(c.agree, true, 'Moon at ' + c.el.toFixed(2) + ' deg');
});

test('cross-check says "disagrees" when the Moon is below that complex (JPL Horizons truth)', () => {
  const row = H.rows[0];                                   // 2026-01-01 00:00 UTC
  const ms = Date.parse(row.utc);
  assert.ok(row.goldstone > 0 && row.canberra < 0);        // the fixture's own truth at that minute
  const up = Radio.crossCheck({ station: 'gdscc' }, ms), down = Radio.crossCheck({ station: 'cdscc' }, ms);
  assert.equal(up.agree, true);
  assert.ok(Math.abs(up.el - row.goldstone) < 0.5);
  assert.equal(down.agree, false);
  assert.equal(Radio.crossCheck({ station: 'nowhere' }, ms), null);
});

test('DSN Now feed: an active downlink comes out with band, power and data rate', () => {
  const xml = '<dsn><station name="cdscc" friendlyName="Canberra" timeUTC="1" timeZoneOffset="0"/>' +
    '<dish name="DSS34" azimuthAngle="120" elevationAngle="41" windSpeed="5" isMSPA="false" isArray="false" isDDOR="false" activity="Spacecraft Telemetry, Tracking, and Command">' +
    '<upSignal active="false" signalType="none" dataRate="0" frequency="0" band="S" power="0" spacecraft="LRO" spacecraftID="-85"/>' +
    '<downSignal active="true" signalType="data" dataRate="2048000" frequency="8450000000" band="X" power="-121.5" spacecraft="LRO" spacecraftID="-85"/>' +
    '<target name="LRO" id="85" uplegRange="384500" downlegRange="384500" rtlt="2.56"/></dish><timestamp>2</timestamp></dsn>';
  const r = Radio.parseFeed(xml);
  assert.equal(r.moon.length, 1);
  const x = r.moon[0];
  assert.equal(x.code, 'LRO');
  assert.equal(x.complex, 'Canberra');
  assert.equal(x.dishEl, 41);
  assert.equal(x.rangeKm, 384500);
  assert.deepEqual({ ...x.down }, { band: 'X', dBm: -121.5, bps: 2048000 });
  assert.equal(x.up, false);
});
