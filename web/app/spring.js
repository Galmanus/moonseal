/* Springs in Apple's terms (damping ratio + response, WWDC "Designing Fluid Interfaces").
   Closed-form integration, so any frame time is exact; every animation starts from the
   current value AND velocity, which makes it interruptible and re-targetable mid-flight. */
window.Spring = (function () {
  'use strict';
  function S(x, opt) {
    opt = opt || {};
    this.x = x; this.v = 0; this.target = x;
    this.damping = opt.damping == null ? 1.0 : opt.damping;
    this.response = opt.response || 0.4;
    this.eps = opt.eps || 1e-4;
    this.active = false;
  }
  S.prototype.to = function (target, opt) {
    if (opt) {
      if (opt.damping != null) this.damping = opt.damping;
      if (opt.response != null) this.response = opt.response;
      if (opt.velocity != null) this.v = opt.velocity;
    }
    this.target = target; this.active = true; return this;
  };
  S.prototype.set = function (x) { this.x = this.target = x; this.v = 0; this.active = false; return this; };
  S.prototype.step = function (dt) {
    if (!this.active) return false;
    var w0 = 2 * Math.PI / this.response, z = this.damping;
    var x0 = this.x - this.target, v0 = this.v, x, v;
    if (z >= 1) {
      var c1 = x0, c2 = v0 + w0 * x0, e = Math.exp(-w0 * dt);
      x = (c1 + c2 * dt) * e;
      v = (c2 - w0 * (c1 + c2 * dt)) * e;
    } else {
      var wd = w0 * Math.sqrt(1 - z * z), e2 = Math.exp(-z * w0 * dt);
      var A = x0, B = (v0 + z * w0 * x0) / wd, c = Math.cos(wd * dt), s = Math.sin(wd * dt);
      x = e2 * (A * c + B * s);
      v = e2 * ((B * wd - z * w0 * A) * c - (A * wd + z * w0 * B) * s);
    }
    this.x = this.target + x; this.v = v;
    var scale = Math.max(1, Math.abs(this.target));
    if (Math.abs(x) < this.eps * scale && Math.abs(v) < this.eps * scale * 10) {
      this.x = this.target; this.v = 0; this.active = false;
    }
    return true;
  };
  function create(x, opt) { return new S(x, opt); }

  /* reduced motion: callers ask Spring.reduced() and jump/cross-fade instead of travelling */
  var mq = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var shot = /[?&]shot\b/.test(location.search);       // headless screenshots: no travel time
  function reduced() { return shot || !!(mq && mq.matches); }

  /* Apple's momentum projection (exponential decay), for flicks */
  function project(v, rate) { rate = rate || 0.998; return (v / 1000) * rate / (1 - rate); }

  return { create: create, reduced: reduced, project: project };
})();
