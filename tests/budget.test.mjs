// Unit tests for web/app/budget.js (the render-budget governor). Run: node --test tests/budget.test.mjs
// BUDGET_SRC=<file> runs the same tests against another copy (used to check that they catch a broken governor).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const src = readFileSync(process.env.BUDGET_SRC || new URL('../web/app/budget.js', import.meta.url), 'utf8');
function load() { const ctx = { window: {} }; vm.runInNewContext(src, ctx); return ctx.window.RenderBudget; }
const RB = load();
const feed = (b, ms, n, kind = 'gpu') => { for (let i = 0; i < n; i++) b.sample(ms, false, kind === 'wall'); };

test('starts at the given levels', () => {
  const b = RB({ hq: 0, lq: 0 });
  assert.deepEqual([b.hq, b.lq], [0, 0]);
  const p = RB({ hq: 2, lq: 1, hqMin: 2, lqMin: 1 });
  assert.deepEqual([p.hq, p.lq], [2, 1]);
});

test('moving frames over budget step the moving level down, one level per window', () => {
  const b = RB({ hq: 0, lq: 0 });
  feed(b, 43, 9);                    // Intel HD 620, site playback at level 0: 42.8 ms median
  assert.equal(b.lq, 1);
  feed(b, 43, 9);
  assert.equal(b.lq, 2);
  feed(b, 43, 27);
  assert.equal(b.lq, 3, 'never below the lowest level');
});

test('one slow frame (a texture upload) does not change the level', () => {
  const b = RB({ hq: 0, lq: 0 });
  b.sample(600, false); feed(b, 10, 8);
  assert.equal(b.lq, 0);
});

test('a GPU with headroom climbs back one level after three fast windows, never above its start', () => {
  const b = RB({ hq: 0, lq: 2 });
  feed(b, 5, 18);
  assert.equal(b.lq, 2, 'two fast windows are not enough');
  feed(b, 5, 9);
  assert.equal(b.lq, 1);
  const p = RB({ hq: 2, lq: 1, hqMin: 2, lqMin: 1 });
  feed(p, 2, 90);
  assert.equal(p.lq, 1, 'a phone never climbs above its own start');
});

test('a mixed window resets the climb', () => {
  const b = RB({ hq: 0, lq: 2 });
  feed(b, 5, 18); feed(b, 15, 9); feed(b, 5, 9);
  assert.equal(b.lq, 2);
});

test('still frames step down only after two slow ones in a row, and never back up', () => {
  const b = RB({ hq: 0, lq: 0 });
  b.sample(123, true);
  assert.equal(b.hq, 0, 'one slow still frame is not enough');
  b.sample(123, true);
  assert.equal(b.hq, 1);
  b.sample(130, true); b.sample(40, true); b.sample(130, true);
  assert.equal(b.hq, 1, 'a fast frame in between resets the count');
  for (let i = 0; i < 20; i++) b.sample(5, true);
  assert.equal(b.hq, 1, 'still quality never climbs back');
  for (let i = 0; i < 20; i++) b.sample(500, true);
  assert.equal(b.hq, 3, 'never below the lowest level');
});

test('wall-clock samples (no GPU timer) use the wall budget and never climb', () => {
  const b = RB({ hq: 0, lq: 1 });
  feed(b, 33, 9, 'wall');            // 30 fps: fine without a GPU timer
  assert.equal(b.lq, 1);
  feed(b, 60, 9, 'wall');            // 17 fps: too slow
  assert.equal(b.lq, 2);
  feed(b, 16.7, 45, 'wall');
  assert.equal(b.lq, 2);
});

test('forced levels (?q=) never change', () => {
  const b = RB({ hq: 1, lq: 1, forced: true });
  feed(b, 500, 30); b.sample(900, true); b.sample(900, true);
  assert.deepEqual([b.hq, b.lq], [1, 1]);
});
