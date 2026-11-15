/* Render budget for the Moon view (globe.js). The terrain shader ray-marches shadows for every pixel, so its
   cost follows the GPU: on a laptop's integrated graphics (Intel HD 620) a still frame took 123-159 ms and,
   with the Sun/Earth map on, 512 ms; playback ran at 15.7 fps, and at 6.5 fps with the map. globe.js feeds
   every rendered frame's cost here and reads back two levels, each 0 (full quality) to 3 (lightest):
     lq  frames while something moves (drag, fly-to, playback): resolution and shadow steps
     hq  the still frame drawn once motion stops: supersampling and shadow steps
   Moving frames are judged by the median of 9, so one slow frame (a texture upload) changes nothing. Too slow
   steps one level down; three fast windows in a row step one level back up, never above the starting level.
   A still frame steps down after two slow ones in a row and never climbs back: a sharper still is not worth a
   visible stall on a GPU that has already shown it cannot afford it. Costs are GPU milliseconds from a timer
   query where the browser has one; otherwise the interval between moving frames (wall clock), which steps
   down at 25 fps and never climbs, because a frame interval cannot tell a fast GPU from vsync. */
(function (root) {
  var MAX = 3, LQ_GPU_MS = 25, LQ_WALL_MS = 40, HQ_MS = 100, WIN = 9, CLIMB = 0.35;
  root.RenderBudget = function (o) {
    o = o || {};
    var b = { hq: o.hq || 0, lq: o.lq || 0, lqMin: o.lqMin || 0, forced: !!o.forced, last: null };
    var win = [], fast = 0, slowStill = 0;
    b.sample = function (ms, still, wall) {
      b.last = ms;
      if (b.forced) return;
      if (still) {
        if (wall) return;
        if (ms > HQ_MS) { if (++slowStill >= 2) { slowStill = 0; if (b.hq < MAX) b.hq++; } }
        else slowStill = 0;
        return;
      }
      win.push(ms);
      if (win.length < WIN) return;
      var lim = wall ? LQ_WALL_MS : LQ_GPU_MS;
      var med = win.slice().sort(function (x, y) { return x - y; })[WIN >> 1];
      win.length = 0;
      if (med > lim) { fast = 0; if (b.lq < MAX) b.lq++; }
      else if (!wall && med < lim * CLIMB) { if (++fast >= 3) { fast = 0; if (b.lq > b.lqMin) b.lq--; } }
      else fast = 0;
    };
    return b;
  };
})(window);
