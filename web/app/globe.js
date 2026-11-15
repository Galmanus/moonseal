/* The Moon, from NASA data, lit by the real Sun for the chosen date.
 *
 * World frame = Moon-fixed (MOON_ME = LOLA frame): +x -> 0N 0E, +y -> 0N 90E, +z -> north pole. km.
 *  - Global sphere: LRO LROC WAC color (8K) + LOLA ldem_16 relief as tangent-space normals.
 *  - South-pole cap (lat <= 75 S): LOLA LDEM_75S_240M heights (480 m whole cap + 240 m inner tile),
 *    real geometry, per-pixel normals, and terrain-cast shadows ray-marched toward the real Sun;
 *    the penumbra width is the true solar disk (0.267 deg radius). The optional "Sun + Earth"
 *    overlay marches toward Earth too (0.95 deg disk): every pixel runs the same
 *    "is it above my horizon?" test the planner runs for a landing site.
 *  - Shading: Lommel-Seeliger (the lunar regolith law) blended with Lambert, earthshine on the
 *    night side scaled by Earth's real phase as seen from the Moon, ACES tone map.
 *
 * Public API (window.Globe):
 *   init(canvas) -> Promise            setTime(hours since LUNAR_EPHEM.t0)
 *   view(name | spec, {instant})       names: 'hero' 'earth' 'pole' + spec {lat, lon, dist, tilt, heading}
 *   setOverlay(0|1)                    setInsets({left, bottom})   (px of UI covering the canvas)
 *   pick(clientX, clientY) -> {lat, lon} | null
 *   project(lat, lon, hKm) -> {x, y, front}
 *   on('tap'|'frame'|'ready', cb)      info() -> {moonIllum, earthIllum, sun, earth}
 *   quality() -> {hq, lq, ms, timer}   render-budget levels (budget.js) and the last measured frame cost
 *   on('budget', cb)                   the levels changed: {hq, lq, low}
 */
window.Globe = (function () {
  'use strict';
  var T = window.THREE, R = 1737.4, D2R = Math.PI / 180;
  var CAP = 457.44;
  var renderer, scene, camera, canvas, sphereMat, capMat, sphere, cap;
  var listeners = { tap: [], frame: [], ready: [] };
  var dirty = true, lastT = 0, interacting = false, hqPending = false;
  var insets = { left: 0, bottom: 0, top: 0 };
  var timeH = 0, sunDir = new T.Vector3(1, 0, 0), earthVec = new T.Vector3(384400, 0, 0);
  var moonIllum = 0.5, earthIllum = 0.5, trackEarth = false;
  var demFull = null;            // Float32Array km, 1906^2, for JS picking / custom horizons
  var demInner = null;           // Float32Array km, 2048^2
  /* Phones and tablets get a lighter render budget: pixel ratio, shadow steps, texture sizes, load order.
     The test is a touch-first device with no fine pointer (or very little memory), so a desktop, even in a
     narrow window, keeps its settings. ?lite=1 / ?lite=0 forces either path. */
  var LITE = (function () {
    try {
      var q = /[?&]lite=([01])/.exec(location.search);
      if (q) return q[1] === '1';
      var touchOnly = matchMedia('(pointer: coarse)').matches && !matchMedia('(any-pointer: fine)').matches;
      return touchOnly || (navigator.deviceMemory != null && navigator.deviceMemory <= 2);
    } catch (e) { return false; }
  })();
  var dpr = Math.min(window.devicePixelRatio || 1, LITE ? 1.5 : 2);
  /* Render budget (budget.js): measured frame costs step resolution and shadow steps down on a GPU that cannot
     keep up. Desktops start at the full settings, phones at their lighter ones. ?q=0..3 pins both levels;
     ?shot (frame capture for the videos, software rendering) pins the starting levels so captures stay sharp. */
  var B = (function () {
    var f = /[?&]q=([0-3])/.exec(location.search), hq = LITE ? 2 : 0, lq = LITE ? 1 : 0;
    if (f) return RenderBudget({ hq: +f[1], lq: +f[1], forced: true });
    return RenderBudget({ hq: hq, lq: lq, lqMin: lq, forced: /[?&]shot\b/.test(location.search) });
  })();
  var HQ0 = B.hq, LQ0 = B.lq;

  /* ------------------------------------------------------------------ shaders */
  var COMMON = [
    'const float R = 1737.4;',
    'const float PI = 3.14159265358979;',
    'uniform sampler2D uDemFull;',
    'uniform sampler2D uDemInner;',
    'uniform float uHasDem;',
    'uniform float uHasInner;',
    'vec3 planeToDir(vec2 p){ float s = dot(p,p)/(4.0*R*R); float k = 1.0/(s+1.0);',
    '  return vec3(p.y/R*k, p.x/R*k, (s-1.0)*k); }',
    'vec2 dirToPlane(vec3 d){ float den = max(1.0 - d.z, 1e-6); return vec2(2.0*R*d.y/den, 2.0*R*d.x/den); }',
    'float hFull(vec2 p, float lod){ return textureLod(uDemFull, vec2(0.5 + p.x/914.88, 0.5 - p.y/914.88), lod).r; }',
    'float hInner(vec2 p, float lod){ return textureLod(uDemInner, vec2(0.5 + p.x/491.52, 0.5 - p.y/491.52), lod).r; }',
    /* third level: a NASA PGDA LOLA 5 m/px site tile (resampled ~8-10 m), rect in plane km (x0, y0, x1, y1) */
    'uniform sampler2D uDemSite; uniform float uHasSite; uniform vec4 uSiteRect; uniform float uSiteTexel;',
    'float siteW(vec2 p){',
    '  if (uHasSite < 0.5) return 0.0;',
    '  vec2 a = p - uSiteRect.xy; vec2 b = uSiteRect.zw - p;',
    '  return smoothstep(0.0, 0.4, min(min(a.x, a.y), min(b.x, b.y)));',
    '}',
    'float hSite(vec2 p){ return textureLod(uDemSite, vec2((p.x - uSiteRect.x)/(uSiteRect.z - uSiteRect.x), (uSiteRect.w - p.y)/(uSiteRect.w - uSiteRect.y)), 0.0).r; }',
    'float heightCoarse(vec2 p){',
    '  float m = max(abs(p.x), abs(p.y));',
    '  if (uHasDem < 0.5 || m > 457.0) return 0.0;',
    '  float hf = hFull(p, 0.0);',
    '  if (uHasInner < 0.5 || m > 244.0) return hf;',
    '  return mix(hInner(p, 0.0), hf, smoothstep(232.0, 244.0, m));',
    '}',
    'float heightKm(vec2 p){',
    '  float h = heightCoarse(p); float w = siteW(p);',
    '  return w > 0.0 ? mix(h, hSite(p), w) : h;',
    '}',
    /* the cap surface as drawn: real heights, meeting the sphere at 75 S then tucked 50 m under it.
       Normals must use this too, or the DEM edge (X or Y = 457 km) shows up as a cliff line. */
    'float capHeight(vec2 p){ return mix(heightKm(p), -0.05, smoothstep(438.0, 457.0, length(p))); }',
    /* for shading normals: the real DEM everywhere, clamped at the data edge (no taper, no cliff) */
    'float heightNrm(vec2 p){',
    '  if (uHasDem < 0.5) return 0.0;',
    '  vec2 q = clamp(p, vec2(-457.0), vec2(457.0)); float m = max(abs(q.x), abs(q.y));',
    '  float hf = hFull(q, 0.0);',
    '  float h = (uHasInner < 0.5 || m > 244.0) ? hf : mix(hInner(q, 0.0), hf, smoothstep(232.0, 244.0, m));',
    '  float w = siteW(q);',
    '  return w > 0.0 ? mix(h, hSite(q), w) : h;',
    '}',
    'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }',
    'uniform float uExposure;',
    'vec3 outColor(vec3 c){ return pow(aces(c*uExposure), vec3(1.0/2.2)); }',
    /* Lommel-Seeliger (regolith) blended with Lambert so relief stays legible; equal at normal incidence */
    'float lunar(float mu0, float mu){ float ls = mu0 / max(mu0 + mu, 1e-4); return mix(2.0*ls, mu0, 0.35); }',
    'uniform vec3 uSun; uniform vec3 uEarth; uniform float uEarthPhase; uniform float uSunI; uniform float uEarthI;',
    'const vec3 EARTHLIGHT = vec3(0.62, 0.76, 1.0);'
  ].join('\n');

  var SPHERE_VS = [
    'varying vec3 vPos; varying vec2 vUv;',
    'void main(){ vPos = position; vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }'
  ].join('\n');

  var SPHERE_FS = [
    COMMON,
    'uniform sampler2D uColor; uniform sampler2D uNormal; uniform float uNormalScale;',
    'uniform sampler2D uGlobH; uniform float uHasGlobH; uniform int uSteps2; uniform float uGrow2;',
    'varying vec3 vPos; varying vec2 vUv;',
    /* global LOLA heights (km), equirectangular, row 0 = 90 N */
    'float hGlob(vec3 d){ float lat = asin(clamp(d.z, -1.0, 1.0)); float lon = atan(d.y, d.x);',
    '  return textureLod(uGlobH, vec2(lon/(2.0*PI) + 0.5, 0.5 - lat/PI), 0.0).r; }',
    /* terminator shadows: march toward the Sun over the global height field; penumbra = solar disk */
    'float globMarch(vec3 P, vec3 L, float ang){',
    '  float t = 1.5, minA = 1.0;',
    '  for (int i = 0; i < 96; i++){',
    '    if (i >= uSteps2) break;',
    '    vec3 Q = P + L * t; float r = length(Q); float alt = r - R;',
    '    if (alt > 10.8) break;                        // above the highest lunar terrain and rising',
    '    minA = min(minA, (alt - hGlob(Q / r) + 0.03) / t);',
    '    if (minA < -ang) return 0.0;',
    '    t = t * uGrow2 + 0.5;',
    '  }',
    '  return smoothstep(-ang, ang, minA);',
    '}',
    'void main(){',
    '  vec3 up = normalize(vPos);',
    '  if (uHasDem > 0.5 && up.z < -0.96593) discard;          // the LOLA cap owns lat <= 75 S',
    '  vec3 east = vec3(-up.y, up.x, 0.0); float el = length(east);',
    '  east = el > 1e-5 ? east / el : vec3(0.0, 1.0, 0.0);',
    '  vec3 north = cross(up, east);',
    '  vec3 tn = texture(uNormal, vUv).xyz * 2.0 - 1.0; tn.xy *= uNormalScale;',
    '  vec3 n = normalize(tn.x*east + tn.y*north + tn.z*up);',
    '  vec3 V = normalize(cameraPosition - vPos);',
    '  vec3 alb = pow(texture(uColor, vUv).rgb, vec3(2.2));',
    '  float mu0 = max(dot(n, uSun), 0.0), mu = max(dot(n, V), 0.0);',
    '  float sunUp = dot(up, uSun);',
    '  float term = smoothstep(-0.012, 0.018, sunUp);',
    '  if (uHasGlobH > 0.5 && mu0 > 0.0 && sunUp > -0.06 && sunUp < 0.36) {',
    '    float h0 = hGlob(up);',
    '    float shadow = globMarch(up * (R + h0 + 0.02), uSun, 0.004660);',
    '    term = min(term, mix(shadow, 1.0, smoothstep(0.26, 0.36, sunUp)));  // fade out where shadows are short',
    '    term = max(term, 0.0) * step(-0.06, sunUp);',
    '  }',
    '  vec3 E = normalize(uEarth - vPos);',
    '  float es = uEarthPhase * max(dot(n, E), 0.0);',
    '  vec3 col = alb * (lunar(mu0, mu) * term * uSunI + es * uEarthI * EARTHLIGHT);',
    '  gl_FragColor = vec4(outColor(col), 1.0);',
    '}'
  ].join('\n');

  var CAP_VS = [
    COMMON,
    'attribute vec2 aPlane;',
    'varying vec2 vPlane; varying vec3 vPos;',
    'void main(){',
    '  vec2 p = aPlane; float rho = length(p);',
    '  float h = capHeight(p);',
    '  vec3 pos = (R + h) * planeToDir(p);',
    '  vPlane = p; vPos = pos;',
    '  gl_Position = projectionMatrix * viewMatrix * vec4(pos, 1.0);',
    '}'
  ].join('\n');

  var CAP_FS = [
    COMMON,
    'uniform sampler2D uColor;',
    'uniform int uSteps; uniform float uGrow; uniform float uOverlay;',
    'varying vec2 vPlane; varying vec3 vPos;',
    /* fraction of a disk of angular radius ang, toward unit L, that clears the terrain */
    'float uFoot = 0.0;                                  // km per pixel, set in main()',
    'float uTex = 0.24;                                  // km per data texel at this fragment, set in main()',
    'float march(vec3 P, vec3 L, float ang){',
    '  float t = max(2.3 * uTex, uFoot * 1.5), minA = 1.0, bias = 0.05 * uTex + uFoot * 0.012;',
    '  for (int i = 0; i < 220; i++){',
    '    if (i >= uSteps) break;',
    '    vec3 Q = P + L * t; float r = length(Q); float alt = r - R;',
    '    if (alt > 7.25) break;                       // above the highest LOLA terrain and rising',
    '    float hk = heightKm(dirToPlane(Q / r));',
    '    minA = min(minA, (alt - hk + bias) / t);',
    '    if (minA < -ang) return 0.0;',
    '    t = t * uGrow + 0.04;',
    '  }',
    '  return smoothstep(-ang, ang, minA);',
    '}',
    'void main(){',
    '  vec2 p = vPlane; float rho = length(p);',
    '  if (rho > 461.5) discard;',
    '  vec3 up = normalize(vPos);',
    '  vec2 fw = fwidth(p); float foot = max(max(fw.x, fw.y), 0.0005); uFoot = foot;',
    '  // gradient step follows the data resolution continuously (a hard switch draws a line at the tile edge)',
    '  float texel = uHasInner > 0.5 ? mix(0.24, 0.48, smoothstep(226.0, 242.0, max(abs(p.x), abs(p.y)))) : 0.48;',
    '  texel = mix(texel, uSiteTexel, siteW(p));',
    '  uTex = texel;',
    '  float dd = max(foot * 1.25, texel);',
    '  float hx = (heightNrm(p + vec2(dd, 0.0)) - heightNrm(p - vec2(dd, 0.0))) / (2.0*dd);',
    '  float hy = (heightNrm(p + vec2(0.0, dd)) - heightNrm(p - vec2(0.0, dd))) / (2.0*dd);',
    '  float k = 1.0 + dot(p,p)/(4.0*R*R);                 // plane km per ground km (stereographic)',
    '  vec3 dX = normalize(planeToDir(p + vec2(0.5, 0.0)) - planeToDir(p - vec2(0.5, 0.0)));',
    '  vec3 dY = normalize(planeToDir(p + vec2(0.0, 0.5)) - planeToDir(p - vec2(0.0, 0.5)));',
    '  vec3 n = normalize(up - k*hx*dX - k*hy*dY);',
    '  float lat = asin(clamp(up.z, -1.0, 1.0)), lon = atan(up.y, up.x);',
    '  vec3 alb = pow(textureLod(uColor, vec2(lon/(2.0*PI) + 0.5, lat/PI + 0.5), 4.0).rgb, vec3(2.2));',
    '  vec3 V = normalize(cameraPosition - vPos);',
    '  float edge = 1.0 - smoothstep(400.0, 452.0, rho);    // cast shadows fade at the data edge',
    '  float mu0 = dot(n, uSun), mu = max(dot(n, V), 0.0);',
    '  vec3 P = vPos + up*0.01;                             // a 10 m mast: is the body above the horizon?',
    '  // with the map on, the Sun march from the mast also shades the ground: one march fewer per pixel',
    '  float sUp = uOverlay > 0.5 && dot(up, uSun) > -0.095 ? march(P, uSun, 0.004660) : 0.0;',
    '  float sunV = 0.0;',
    '  if (mu0 > 0.0 && dot(up, uSun) > -0.095) sunV = mix(1.0, uOverlay > 0.5 ? sUp : march(vPos + n*0.015, uSun, 0.004660), edge);',
    '  sunV *= smoothstep(-0.095, -0.06, dot(up, uSun));',
    '  vec3 Ev = uEarth - vPos; float eD = length(Ev); vec3 Ed = Ev / eD;',
    '  float es = uEarthPhase * max(dot(n, Ed), 0.0);',
    '  vec3 col = alb * (lunar(max(mu0, 0.0), mu) * sunV * uSunI + es * uEarthI * EARTHLIGHT);',
    '  vec3 shaded = outColor(col);',
    '  if (uOverlay > 0.5){',
    '    float eUp = dot(up, Ed) > -0.095 ? march(P, Ed, 6371.0/eD) : 0.0;',
    '    vec3 NONE = vec3(0.035, 0.04, 0.06), SUNC = vec3(1.0, 0.60, 0.16), EARC = vec3(0.20, 0.52, 1.0), BOTH = vec3(0.42, 1.0, 0.62);',
    '    vec3 oc = mix(mix(NONE, EARC, eUp), mix(SUNC, BOTH, eUp), sUp);',
    '    float l = dot(shaded, vec3(0.299, 0.587, 0.114));',
    '    shaded = mix(shaded, oc * (0.45 + 0.75*l), 0.78 * edge);',
    '  }',
    '  gl_FragColor = vec4(shaded, 1.0);',
    '}'
  ].join('\n');

  /* ------------------------------------------------------------------ geometry */
  function sphereGeometry(nLon, nLat) {
    var nv = (nLon + 1) * (nLat + 1), pos = new Float32Array(nv * 3), uv = new Float32Array(nv * 2);
    var k = 0, q = 0, i, j;
    for (i = 0; i <= nLat; i++) {
      var la = (90 - 180 * i / nLat) * D2R, cl = Math.cos(la), sl = Math.sin(la);
      for (j = 0; j <= nLon; j++) {
        var lo = (-180 + 360 * j / nLon) * D2R;
        pos[k++] = R * cl * Math.cos(lo); pos[k++] = R * cl * Math.sin(lo); pos[k++] = R * sl;
        uv[q++] = j / nLon; uv[q++] = 1 - i / nLat;
      }
    }
    var idx = new Uint32Array(nLat * nLon * 6), m = 0;
    for (i = 0; i < nLat; i++) for (j = 0; j < nLon; j++) {
      var a = i * (nLon + 1) + j, b = a + nLon + 1;
      idx[m++] = a; idx[m++] = b; idx[m++] = a + 1;
      idx[m++] = b; idx[m++] = b + 1; idx[m++] = a + 1;
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('uv', new T.BufferAttribute(uv, 2));
    g.setIndex(new T.BufferAttribute(idx, 1));
    g.boundingSphere = new T.Sphere(new T.Vector3(), R * 1.01);
    return g;
  }

  /* square grid over the stereographic plane, denser toward the pole (sinh warp) */
  function capGeometry(G) {
    // the mesh reaches past the 75 S circle (CAP) on every side, so the sunken overlap ring is continuous
    var a = 1.6, sa = Math.sinh(a), W = 463.0, plane = new Float32Array(G * G * 2), pos = new Float32Array(G * G * 3);
    var k = 0, i, j;
    for (i = 0; i < G; i++) {
      var y = W * Math.sinh(a * (1 - 2 * i / (G - 1))) / sa;
      for (j = 0; j < G; j++) {
        var x = W * Math.sinh(a * (2 * j / (G - 1) - 1)) / sa;
        plane[k * 2] = x; plane[k * 2 + 1] = y;
        pos[k * 3] = y; pos[k * 3 + 1] = x; pos[k * 3 + 2] = -R;   // rough, culling is off
        k++;
      }
    }
    var idx = new Uint32Array((G - 1) * (G - 1) * 6), m = 0;
    for (i = 0; i < G - 1; i++) for (j = 0; j < G - 1; j++) {
      var p0 = i * G + j, p1 = p0 + G;
      idx[m++] = p0; idx[m++] = p1; idx[m++] = p0 + 1;
      idx[m++] = p1; idx[m++] = p1 + 1; idx[m++] = p0 + 1;
    }
    var g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('aPlane', new T.BufferAttribute(plane, 2));
    g.setIndex(new T.BufferAttribute(idx, 1));
    return g;
  }

  /* ------------------------------------------------------------------ helpers */
  function unit(lat, lon) {
    var la = lat * D2R, lo = lon * D2R, c = Math.cos(la);
    return new T.Vector3(c * Math.cos(lo), c * Math.sin(lo), Math.sin(la));
  }
  function latLonOf(v) {
    var n = v.clone().normalize();
    return { lat: Math.asin(Math.max(-1, Math.min(1, n.z))) / D2R, lon: ((Math.atan2(n.y, n.x) / D2R) + 360) % 360 };
  }
  function bilin(D, size, fx, fy) {
    var x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0;
    if (x0 < 0 || y0 < 0 || x0 >= size - 1 || y0 >= size - 1) return null;
    var i = y0 * size + x0;
    return (D[i] * (1 - tx) + D[i + 1] * tx) * (1 - ty) + (D[i + size] * (1 - tx) + D[i + size + 1] * tx) * ty;
  }
  /* the selected site's NASA PGDA 5 m/px tile (third level of detail), loaded on demand */
  var siteTile = null, tileCache = {}, capReadyP = null;
  function setSiteTile(id) {
    var cfg = window.MOONSEAL_TILES && id ? window.MOONSEAL_TILES[id] : null;
    // phones: the same tile box-averaged to 1024^2 (2 MB instead of 8), so each texel covers twice the ground
    if (cfg && LITE) cfg = Object.assign({}, cfg, { file: cfg.file.replace(/\.i16$/, '_1k.i16'), n: cfg.n / 2, texel_km: cfg.texel_km * 2 });
    return (capReadyP || Promise.resolve()).then(function () {
      if (!cfg || !capMat) {
        siteTile = null;
        [capMat, sphereMat].forEach(function (m) { if (m) m.uniforms.uHasSite.value = 0; });
        dirty = true; hqPending = true; return false;
      }
      var p = tileCache[cfg.file] || (tileCache[cfg.file] = loadDem('app/tex/' + cfg.file, cfg.n, cfg.n, 0.0005));
      return p.then(function (d) {
        siteTile = { cfg: cfg, data: d.data };
        [capMat, sphereMat].forEach(function (m) {
          m.uniforms.uDemSite.value = d.tex; m.uniforms.uHasSite.value = 1; m.uniforms.uSiteTexel.value = cfg.texel_km;
          m.uniforms.uSiteRect.value.set(cfg.rect[0], cfg.rect[1], cfg.rect[2], cfg.rect[3]);
        });
        if (LITE) Object.keys(tileCache).forEach(function (k) {   // phones keep one tile in memory
          if (k === cfg.file) return;
          var old = tileCache[k]; delete tileCache[k];
          old.then(function (o) { o.tex.dispose(); }).catch(function () {});
        });
        dirty = true; hqPending = true; window.__siteTile = cfg.file; return true;
      });
    });
  }
  function demHeightKm(lat, lon) {         // JS twin of the shader's heightKm: site tile, 240 m tile, 480 m cap
    if (!demFull || lat > -68) return 0;
    var d = unit(lat, lon), den = Math.max(1 - d.z, 1e-9);
    var X = 2 * R * d.y / den, Y = 2 * R * d.x / den, h = null;
    if (siteTile) {
      var rc = siteTile.cfg.rect, n = siteTile.cfg.n;
      if (X > rc[0] && X < rc[2] && Y > rc[1] && Y < rc[3]) {
        h = bilin(siteTile.data, n, (X - rc[0]) / (rc[2] - rc[0]) * n - 0.5, (rc[3] - Y) / (rc[3] - rc[1]) * n - 0.5);
        if (h != null) return h;
      }
    }
    if (demInner) h = bilin(demInner, 2048, 1023.5 + X / 0.24, 1023.5 - Y / 0.24);
    if (h == null) h = bilin(demFull, 1906, 952.5 + X / 0.48, 952.5 - Y / 0.48);
    return h == null ? 0 : h;
  }

  /* ------------------------------------------------------------------ camera rig */
  var S = window.Spring;
  var CAM = { response: 1.05, damping: 1.0 };
  var rig = {
    f: [S.create(0, CAM), S.create(-0.6, CAM), S.create(-0.55, CAM)],    // focus direction
    ref: [S.create(0, CAM), S.create(0, CAM), S.create(1, CAM)],          // screen-up reference
    logD: S.create(Math.log(3700), CAM),
    H: S.create(0, CAM), tau: S.create(0, CAM),
    h: S.create(0, CAM),                                                  // height of the focus point (km)
    shx: S.create(0, CAM), shy: S.create(0, CAM),
    exp: S.create(1, { response: 0.8 })
  };
  var allSprings = [].concat(rig.f, rig.ref, [rig.logD, rig.H, rig.tau, rig.h, rig.shx, rig.shy, rig.exp]);
  var viewShift = { x: 0, y: 0 };  // composition shift (fraction of width/height) for the current view

  function vecOf(arr) { return new T.Vector3(arr[0].x, arr[1].x, arr[2].x); }
  function setVec(arr, v, instant) {
    for (var i = 0; i < 3; i++) { if (instant) arr[i].set(v.getComponent(i)); else arr[i].to(v.getComponent(i)); }
  }

  function frameAt(f, ref) {
    var north = ref.clone().addScaledVector(f, -ref.dot(f));
    if (north.lengthSq() < 1e-8) north = new T.Vector3(1, 0, 0).addScaledVector(f, -f.x);
    north.normalize();
    var east = new T.Vector3().crossVectors(north, f).normalize();
    return { north: north, east: east };
  }

  function applyCamera() {
    var f = vecOf(rig.f); if (f.lengthSq() < 1e-8) f.set(0, 0, -1); f.normalize();
    var ref = vecOf(rig.ref).normalize();
    var fr = frameAt(f, ref), H = rig.H.x, tau = rig.tau.x;
    var h = fr.north.clone().multiplyScalar(Math.cos(H)).addScaledVector(fr.east, Math.sin(H));
    var surf = f.clone().multiplyScalar(R + rig.h.x);
    var D = Math.exp(rig.logD.x);
    var back = f.clone().multiplyScalar(Math.cos(tau)).addScaledVector(h, -Math.sin(tau));
    camera.position.copy(surf).addScaledVector(back, D);
    camera.up.copy(f).multiplyScalar(Math.sin(tau)).addScaledVector(h, Math.cos(tau));
    camera.lookAt(surf);
    var w = canvas.clientWidth, hgt = canvas.clientHeight;
    var ox = -(rig.shx.x + insets.left / 2), oy = -(rig.shy.x - insets.bottom / 2 + insets.top / 2);
    camera.setViewOffset(w, hgt, ox, oy, w, hgt);
    camera.near = Math.max(0.02, D * 0.02); camera.far = D + R * 4 + 10;
    camera.updateProjectionMatrix();
  }

  /* ------------------------------------------------------------------ views */
  function distForDiameter(frac) {          // camera distance so the disk spans frac x viewport height
    var half = Math.tan(camera.fov * D2R / 2) * frac;
    var ang = Math.atan(half);
    return R / Math.sin(ang) - R;
  }
  function view(spec, opt) {
    opt = opt || {};
    var instant = !!opt.instant || S.reduced();
    var w = canvas.clientWidth, h = canvas.clientHeight;
    var s = typeof spec === 'string' ? presets(spec) : spec;
    trackEarth = s.name === 'earth';
    var f = s.f || unit(s.lat, s.lon);
    setVec(rig.f, f, instant);
    setVec(rig.ref, s.ref || new T.Vector3(0, 0, 1), instant);
    var tgt = [[rig.logD, Math.log(s.dist)], [rig.H, s.heading || 0], [rig.tau, s.tilt || 0], [rig.h, s.h || 0],
               [rig.shx, (s.shiftX || 0) * w], [rig.shy, (s.shiftY || 0) * h], [rig.exp, s.exposure || 1]];
    tgt.forEach(function (p) { if (instant) p[0].set(p[1]); else p[0].to(p[1]); });
    if (rig.H.x - (s.heading || 0) > Math.PI) rig.H.x -= 2 * Math.PI;
    if ((s.heading || 0) - rig.H.x > Math.PI) rig.H.x += 2 * Math.PI;
    momentum = null; dirty = true;
  }
  function presets(name) {
    var sp = window.LunarEphem && LunarEphem.subpoints(timeH);
    var sunLon = sp ? sp.sunLon : 0;
    if (name === 'hero') {
      var wide = canvas.clientWidth > canvas.clientHeight * 1.2;
      return { name: name, lat: -47, lon: sunLon - 78, dist: distForDiameter(wide ? 1.04 : 0.6),
        shiftX: wide ? 0.19 : 0, shiftY: wide ? -0.03 : -0.25, exposure: 1.05 };
    }
    if (name === 'earth') {            // fit the disk inside the part of the screen the UI leaves free
      var H = canvas.clientHeight, free = Math.max(0.3, (H - insets.top - insets.bottom) / H);
      return { name: name, f: earthVec.clone().normalize(), dist: distForDiameter(0.9 * free), exposure: 1.0 };
    }
    if (name === 'pole') return { name: name, lat: -90, lon: 0, ref: new T.Vector3(1, 0, 0), dist: 1550,
      tilt: 18 * D2R, heading: Math.PI, exposure: 1.3 };
    return { name: name, lat: -34, lon: 0, dist: 3700 };
  }
  function viewSite(lat, lon, opt) {
    opt = opt || {};
    var a = window.LunarEphem && LunarEphem.azel(lat, lon, timeH, 0);
    var heading = a ? a.earthAz * D2R : 0;
    var nearPole = lat < -87.5;
    if (opt.firstPerson) {             // stand at the site, eye 100 m up, level, facing Earth; skyline low in frame
      var hk = demHeightKm(lat, lon);
      return view({ name: 'ground', lat: lat, lon: lon, h: hk + 0.1, dist: 0.25, tilt: 89.9 * D2R, heading: heading,
                    ref: new T.Vector3(0, 0, 1), shiftY: 0.05, exposure: 1.0 }, opt);
    }
    view({ name: 'site', lat: lat, lon: lon, dist: opt.dist || (lat < -70 ? 150 : 420), tilt: (opt.tilt || 52) * D2R,
           heading: heading, ref: nearPole ? new T.Vector3(1, 0, 0) : new T.Vector3(0, 0, 1),
           exposure: opt.exposure || (lat < -70 ? (opt.dist && opt.dist < 80 ? 0.72 : 1.0) : 1.0) }, opt);
  }

  /* ------------------------------------------------------------------ Earth + Sun in the sky (ground views) */
  var earthMesh = null, sunSprite = null, glowSprite = null;
  var EARTH_VS = [
    'varying vec3 vN; varying vec2 vUv; varying vec3 vW;',
    'void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * position); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz;',
    '  gl_Position = projectionMatrix * viewMatrix * w; }'
  ].join('\n');
  var EARTH_FS = [
    'uniform sampler2D uTex; uniform vec3 uSun; uniform float uExposure;',
    'varying vec3 vN; varying vec2 vUv; varying vec3 vW;',
    'vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14), 0.0, 1.0); }',
    'void main(){',
    '  vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW);',
    '  float d = dot(n, uSun);',
    '  vec3 day = pow(texture(uTex, vUv).rgb, vec3(2.2));',
    '  float rim = pow(1.0 - max(dot(n, V), 0.0), 3.0);',
    '  vec3 col = day * max(d, 0.0) * 3.2 + vec3(0.25, 0.5, 1.0) * rim * smoothstep(-0.2, 0.4, d) * 1.6;',
    '  gl_FragColor = vec4(pow(aces(col * uExposure), vec3(1.0/2.2)), 1.0);',
    '}'
  ].join('\n');
  /* sub-lunar point on Earth (deg): Meeus low-precision Moon RA/Dec + Greenwich sidereal time.
     Only orients the Blue Marble texture (illustrative); all planning math uses JPL Horizons. */
  function subLunar(date) {
    var JD = date.getTime() / 86400000 + 2440587.5, Tc = (JD - 2451545.0) / 36525, s = function (x) { return Math.sin(x * D2R); };
    var Lp = 218.3164477 + 481267.88123421 * Tc, Dm = 297.8501921 + 445267.1114034 * Tc, M = 357.5291092 + 35999.0502909 * Tc;
    var Mp = 134.9633964 + 477198.8675055 * Tc, F = 93.2720950 + 483202.0175233 * Tc;
    var lam = (Lp + 6.289 * s(Mp) + 1.274 * s(2 * Dm - Mp) + 0.658 * s(2 * Dm) + 0.214 * s(2 * Mp) - 0.186 * s(M) - 0.114 * s(2 * F)) * D2R;
    var bet = (5.128 * s(F) + 0.281 * s(Mp + F) + 0.278 * s(Mp - F) + 0.173 * s(2 * Dm - F)) * D2R, eps = 23.439 * D2R;
    var ra = Math.atan2(Math.sin(lam) * Math.cos(eps) - Math.tan(bet) * Math.sin(eps), Math.cos(lam));
    var dec = Math.asin(Math.sin(bet) * Math.cos(eps) + Math.cos(bet) * Math.sin(eps) * Math.sin(lam));
    var gmst = (280.46061837 + 360.98564736629 * (JD - 2451545.0)) % 360;
    var lon = ((ra / D2R - gmst) % 360 + 540) % 360 - 180;
    return { lat: dec / D2R, lon: lon };
  }
  function makeSky() {
    earthMesh = new T.Mesh(sphereGeometry(96, 48), new T.ShaderMaterial({ vertexShader: EARTH_VS, fragmentShader: EARTH_FS,
      uniforms: { uTex: { value: null }, uSun: { value: sunDir }, uExposure: { value: 1 } } }));
    earthMesh.matrixAutoUpdate = false; earthMesh.frustumCulled = false; earthMesh.visible = false;
    scene.add(earthMesh);
    loadTex('app/tex/earth_bluemarble_2k.jpg').then(function (t) { earthMesh.material.uniforms.uTex.value = t; dirty = true; });
    function radial(stops, size) {
      var c = document.createElement('canvas'); c.width = c.height = size; var g = c.getContext('2d');
      var gr = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      stops.forEach(function (st) { gr.addColorStop(st[0], st[1]); }); g.fillStyle = gr; g.fillRect(0, 0, size, size);
      var tx = new T.CanvasTexture(c); return tx;
    }
    var add = { blending: T.AdditiveBlending, depthWrite: false, transparent: true };
    sunSprite = new T.Sprite(new T.SpriteMaterial(Object.assign({ map: radial([[0, '#fff'], [0.42, '#fff8ea'], [0.5, 'rgba(255,240,210,0)']], 128) }, add)));
    glowSprite = new T.Sprite(new T.SpriteMaterial(Object.assign({ map: radial([[0, 'rgba(255,236,200,.55)'], [0.12, 'rgba(255,220,170,.22)'], [1, 'rgba(255,200,140,0)']], 256) }, add)));
    [sunSprite, glowSprite].forEach(function (sp) { sp.visible = false; sp.frustumCulled = false; scene.add(sp); });
  }
  function updateSky() {
    if (!earthMesh) return;
    var D = Math.exp(rig.logD.x), ground = D < 60;
    earthMesh.visible = sunSprite.visible = glowSprite.visible = ground;
    if (!ground) return;
    var cam = camera.position, L = 900;
    var toE = earthVec.clone().sub(cam), dE = toE.length(); toE.divideScalar(dE);
    var rad = L * Math.tan(Math.asin(6371 / dE));
    var F = toE.clone().negate();                                    // Earth -> Moon
    var N = new T.Vector3(0, 0, 1); var n1 = N.clone().addScaledVector(F, -N.dot(F)).normalize(), n2 = new T.Vector3().crossVectors(F, n1);
    var sl = subLunar(LunarEphem.dateAt(timeH));
    var la = sl.lat * D2R, lo = sl.lon * D2R;
    var sb = new T.Vector3(Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la));
    var e1 = new T.Vector3(0, 0, 1).addScaledVector(sb, -sb.z).normalize(), e2 = new T.Vector3().crossVectors(sb, e1);
    var W = new T.Matrix4().makeBasis(F, n1, n2), B = new T.Matrix4().makeBasis(sb, e1, e2).transpose();
    var M = new T.Matrix4().multiplyMatrices(W, B);                  // body -> world: sub-lunar point faces the Moon
    M.premultiply(new T.Matrix4().makeScale(1, 1, 1));
    var pos = cam.clone().addScaledVector(toE, L);
    earthMesh.matrix.copy(new T.Matrix4().makeTranslation(pos.x, pos.y, pos.z).multiply(M).multiply(new T.Matrix4().makeScale(rad / R, rad / R, rad / R)));
    earthMesh.matrixWorldNeedsUpdate = true;
    earthMesh.material.uniforms.uExposure.value = rig.exp.x;
    var sp = cam.clone().addScaledVector(sunDir, L);
    sunSprite.position.copy(sp); glowSprite.position.copy(sp);
    var sr = L * Math.tan(0.267 * D2R) * 2.0;                      // true solar diameter at distance L
    sunSprite.scale.set(sr / 0.46, sr / 0.46, 1); glowSprite.scale.set(sr * 26, sr * 26, 1);
  }
  function keepAboveGround() {          // ground views: never let the eye sink into a hill behind the site
    if (Math.exp(rig.logD.x) > 60 || !demFull) return;
    var ll = latLonOf(camera.position), floor = R + demHeightKm(ll.lat, ll.lon) + 0.06;
    var r = camera.position.length();
    if (r < floor) { camera.position.multiplyScalar(floor / r); camera.updateMatrixWorld(); }
  }

  /* ------------------------------------------------------------------ time */
  function setTime(h) {
    timeH = h;
    var sp = window.LunarEphem && LunarEphem.subpoints(h);
    if (!sp) return;
    sunDir.copy(unit(sp.sunLat, sp.sunLon));
    earthVec.copy(unit(sp.earthLat, sp.earthLon)).multiplyScalar(sp.earthDistKm);
    var cosT = sunDir.dot(earthVec.clone().normalize());   // angle Sun-Moon-Earth
    moonIllum = (1 + cosT) / 2;       // as seen from Earth
    earthIllum = (1 - cosT) / 2;      // as seen from the Moon (drives earthshine)
    [sphereMat, capMat].forEach(function (m) {
      if (!m) return;
      m.uniforms.uSun.value.copy(sunDir);
      m.uniforms.uEarth.value.copy(earthVec);
      m.uniforms.uEarthPhase.value = earthIllum;
    });
    if (trackEarth) setVec(rig.f, earthVec.clone().normalize(), true);
    dirty = true;
  }

  /* ------------------------------------------------------------------ input */
  var pointers = new Map(), grab = null, momentum = null, hist = [], tapStart = null, pinch = null;

  function rayFrom(clientX, clientY) {
    var r = canvas.getBoundingClientRect();
    var nd = new T.Vector2(((clientX - r.left) / r.width) * 2 - 1, -((clientY - r.top) / r.height) * 2 + 1);
    var rc = new T.Raycaster(); rc.setFromCamera(nd, camera); return rc.ray;
  }
  function hitSphere(ray, rad) {
    var o = ray.origin, d = ray.direction, b = o.dot(d), c = o.dot(o) - rad * rad, disc = b * b - c;
    if (disc < 0) return null;
    var t = -b - Math.sqrt(disc); if (t < 0) return null;
    return o.clone().addScaledVector(d, t);
  }
  function pick(clientX, clientY) {
    applyCamera();
    var ray = rayFrom(clientX, clientY), p = hitSphere(ray, R);
    if (!p) return null;
    var ll = latLonOf(p);
    for (var i = 0; i < 2; i++) {          // refine on real heights inside the polar cap
      var hk = demHeightKm(ll.lat, ll.lon); if (!hk) break;
      var p2 = hitSphere(ray, R + hk); if (!p2) break; ll = latLonOf(p2);
    }
    return ll;
  }
  function dirUnder(clientX, clientY) {
    var p = hitSphere(rayFrom(clientX, clientY), R);
    return p ? p.normalize() : null;
  }
  function stopSprings(list) { list.forEach(function (s) { s.target = s.x; s.v = 0; s.active = false; }); }

  function onDown(e) {
    canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.classList.add('grabbing');
    momentum = null; trackEarth = false;
    stopSprings(rig.f.concat([rig.H, rig.tau]));       // grab it mid-flight: start from where it is
    if (pointers.size === 1) {
      applyCamera();
      var tilt = e.button === 2 || e.shiftKey || e.altKey;
      grab = { mode: tilt ? 'tilt' : 'rotate', x: e.clientX, y: e.clientY, dir: tilt ? null : dirUnder(e.clientX, e.clientY) };
      tapStart = { x: e.clientX, y: e.clientY, t: performance.now() };
      hist = [{ t: performance.now(), f: vecOf(rig.f).normalize() }];
    } else if (pointers.size === 2) {
      var pts = Array.from(pointers.values());
      pinch = { d: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y), logD: rig.logD.x, my: (pts[0].y + pts[1].y) / 2, tau: rig.tau.x };
      grab = null; tapStart = null;
    }
    interacting = true; dirty = true;
  }
  function onMove(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size >= 2) {
      var pts = Array.from(pointers.values());
      var d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      rig.logD.set(clampLogD(pinch.logD - Math.log(d / pinch.d)));
      var my = (pts[0].y + pts[1].y) / 2;
      rig.tau.set(Math.max(0, Math.min(1.35, pinch.tau + (my - pinch.my) * 0.004)));
      dirty = true; return;
    }
    if (!grab) return;
    if (tapStart && Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y) > 6) tapStart = null;
    if (grab.mode === 'tilt') {
      rig.H.set(rig.H.x - (e.clientX - grab.x) * 0.005);
      rig.tau.set(Math.max(0, Math.min(1.35, rig.tau.x + (e.clientY - grab.y) * 0.004)));
      grab.x = e.clientX; grab.y = e.clientY; dirty = true; return;
    }
    applyCamera();
    var now = dirUnder(e.clientX, e.clientY);
    var f = vecOf(rig.f).normalize();
    if (grab.dir && now) {                      // 1:1: the grabbed ground stays under the finger
      var q = new T.Quaternion().setFromUnitVectors(now, grab.dir);
      f.applyQuaternion(q);
    } else {                                    // off the limb: angular drag
      var dx = e.clientX - grab.x, dy = e.clientY - grab.y, k = 0.0035 * Math.exp(rig.logD.x) / 3700;
      var right = new T.Vector3().crossVectors(camera.up, f).normalize();
      f.applyAxisAngle(camera.up, -dx * Math.min(k, 0.004)).applyAxisAngle(right, -dy * Math.min(k, 0.004)).normalize();
    }
    setVec(rig.f, f, true);
    grab.x = e.clientX; grab.y = e.clientY;
    var tnow = performance.now();
    hist.push({ t: tnow, f: f.clone() }); while (hist.length > 2 && tnow - hist[0].t > 90) hist.shift();
    dirty = true;
  }
  function onUp(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (pointers.size > 0) return;
    canvas.classList.remove('grabbing');
    if (tapStart && performance.now() - tapStart.t < 450) {
      var ll = pick(e.clientX, e.clientY);
      emit('tap', { lat: ll && ll.lat, lon: ll && ll.lon, x: e.clientX, y: e.clientY, hit: !!ll });
    } else if (grab && grab.mode === 'rotate' && hist.length > 1) {   // velocity handoff -> momentum
      var a = hist[0], b = hist[hist.length - 1], dt = (b.t - a.t) / 1000;
      if (dt > 0.008 && performance.now() - b.t < 60) {
        var ang = a.f.angleTo(b.f), axis = new T.Vector3().crossVectors(a.f, b.f);
        if (ang > 1e-5 && axis.lengthSq() > 1e-12) momentum = { axis: axis.normalize(), rate: ang / dt };
      }
    }
    grab = null; tapStart = null; interacting = false; hqPending = true; dirty = true;
  }
  function clampLogD(v) { return Math.max(Math.log(4), Math.min(Math.log(9000), v)); }
  function onWheel(e) {
    e.preventDefault();
    momentum = null; trackEarth = false;
    var dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    var step = dy * (e.ctrlKey ? 0.01 : 0.0016);
    var before = rig.logD.target, after = clampLogD(before + step);
    rig.logD.to(after, { response: 0.32 });
    if (after < before) {                      // zoom toward the cursor
      applyCamera();
      var c = dirUnder(e.clientX, e.clientY), f = vecOf(rig.f).normalize();
      if (c) {
        var frac = Math.min(0.5, 1 - Math.exp(after - before));
        var nf = f.clone().lerp(c, frac).normalize();
        setVec(rig.f, nf, true);
      }
    }
    hqPending = true; dirty = true;
  }

  /* ------------------------------------------------------------------ loading */
  function loadTex(url) {
    return new Promise(function (res, rej) {
      new T.TextureLoader().load(url, function (t) {
        t.colorSpace = T.NoColorSpace; t.wrapS = T.RepeatWrapping; t.wrapT = T.ClampToEdgeWrapping;
        t.anisotropy = renderer.capabilities.getMaxAnisotropy();
        t.minFilter = T.LinearMipmapLinearFilter; t.generateMipmaps = true; res(t);
      }, undefined, rej);
    });
  }
  /* int16 height grid -> float texture in km. scale: km per DN (0.0005 for LOLA polar DN, 0.001 for metres) */
  function loadDem(url, size, height, scale, wrapLon) {
    height = height || size; scale = scale || 0.0005;
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(url + ' ' + r.status); return r.arrayBuffer(); })
      .then(function (buf) {
        var i16 = new Int16Array(buf), n = size * height, f32 = new Float32Array(n);
        for (var i = 0; i < n; i++) f32[i] = i16[i] * scale;
        var floatLinear = renderer.extensions.has('OES_texture_float_linear');
        var tex;
        if (floatLinear) tex = new T.DataTexture(f32, size, height, T.RedFormat, T.FloatType);
        else {
          var h16 = new Uint16Array(n);
          for (var j = 0; j < n; j++) h16[j] = T.DataUtils.toHalfFloat(f32[j]);
          tex = new T.DataTexture(h16, size, height, T.RedFormat, T.HalfFloatType);
        }
        tex.minFilter = T.LinearFilter; tex.magFilter = T.LinearFilter; tex.generateMipmaps = false;
        tex.wrapS = wrapLon ? T.RepeatWrapping : T.ClampToEdgeWrapping; tex.wrapT = T.ClampToEdgeWrapping;
        tex.flipY = false; tex.unpackAlignment = 1;
        tex.needsUpdate = true;
        return { tex: tex, data: f32 };
      });
  }

  function emit(evt, d) { (listeners[evt] || []).forEach(function (cb) { cb(d); }); }

  /* ------------------------------------------------------------------ loop */
  function quality(hq) {
    // Still frames (hq), by budget level: 0 supersamples (>= 1.6x even on 1x screens, capped at 2x) for crisper
    // shadow edges and crater detail; 1 renders at the screen's own ratio; 2 also takes fewer, longer shadow
    // steps that reach about as far; 3 renders at 1x. Moving frames (lq): 0 is <= 1.25x; 1 is 1x with the
    // longer steps; 2 and 3 render at 0.75x and 0.5x and let the browser scale up. A desktop at 0/0 and a
    // phone at 2/1 get exactly the settings each had before the budget existed.
    var l = hq ? B.hq : B.lq, pr, full;
    if (hq) { pr = l === 0 ? Math.min(2, Math.max(dpr, 1.6)) : l === 1 ? Math.min(dpr, 2) : l === 2 ? Math.min(dpr, 1.5) : Math.min(dpr, 1); full = l < 2; }
    else { pr = l === 0 ? Math.min(dpr, 1.25) : Math.min(dpr, 1) * (l === 1 ? 1 : l === 2 ? 0.75 : 0.5); full = l === 0; }
    if (renderer.getPixelRatio() !== pr) { renderer.setPixelRatio(pr); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); }
    if (capMat) { capMat.uniforms.uSteps.value = hq ? (full ? 190 : 110) : (full ? 64 : 48); capMat.uniforms.uGrow.value = hq ? (full ? 1.045 : 1.08) : (full ? 1.095 : 1.14); }
    sphereMat.uniforms.uSteps2.value = hq ? (full ? 64 : 40) : (full ? 26 : 18); sphereMat.uniforms.uGrow2.value = hq ? (full ? 1.08 : 1.13) : (full ? 1.2 : 1.32);
  }
  /* GPU time of each frame, from EXT_disjoint_timer_query_webgl2 (results arrive a frame or two later), fed to
     the budget. gq: null until the first frame, false when the browser has no GPU timer. */
  var gq = null, lastMotion = false, lastChange = 0, lastTickDirty = false, seenQ = '';
  function gpuBegin() {
    if (gq === null) { var ext = renderer.getContext().getExtension('EXT_disjoint_timer_query_webgl2'); gq = ext ? { ext: ext, pend: [] } : false; }
    if (!gq || gq.pend.length > 8) return null;            // results not coming back: stop asking
    var gl = renderer.getContext(), q = gl.createQuery();
    gl.beginQuery(gq.ext.TIME_ELAPSED_EXT, q);
    return q;
  }
  function gpuEnd(q, hq) {
    if (!q) return;
    renderer.getContext().endQuery(gq.ext.TIME_ELAPSED_EXT);
    gq.pend.push({ q: q, hq: hq });
  }
  function gpuPoll() {
    if (!gq || !gq.pend.length) return;
    var gl = renderer.getContext(), disjoint = gl.getParameter(gq.ext.GPU_DISJOINT_EXT);   // reading it also clears it
    while (gq.pend.length && gl.getQueryParameter(gq.pend[0].q, gl.QUERY_RESULT_AVAILABLE)) {
      var p = gq.pend.shift();
      if (!disjoint) B.sample(gl.getQueryParameter(p.q, gl.QUERY_RESULT) / 1e6, p.hq);
      gl.deleteQuery(p.q);
    }
  }
  function frame(now) {
    requestAnimationFrame(frame);
    var gap = now - (lastT || now), dt = Math.min(0.05, gap / 1000); lastT = now;
    gpuPoll();
    if (seenQ !== B.hq + '/' + B.lq) {
      seenQ = B.hq + '/' + B.lq;
      // low: the budget stepped down to the lighter levels (moving frames below 1x, or still frames off full steps)
      emit('budget', { hq: B.hq, lq: B.lq, low: (B.lq >= 2 && B.lq > LQ0) || (B.hq >= 2 && B.hq > HQ0) });
    }
    var moving = false;
    allSprings.forEach(function (s) { if (s.step(dt)) moving = true; });
    if (momentum) {
      var f = vecOf(rig.f).normalize().applyAxisAngle(momentum.axis, momentum.rate * dt);
      setVec(rig.f, f, true);
      momentum.rate *= Math.pow(0.9965, dt * 1000);
      if (momentum.rate < 0.004) { momentum = null; hqPending = true; }
      moving = true;
    }
    if (moving) dirty = true;
    var motion = interacting || moving || Globe.playing;
    // a change on consecutive frames or within 200 ms of the previous one (scrubbing the timeline, a held arrow
    // key) is drawn light, like motion, and the full-quality frame waits until changes have stopped for 200 ms.
    // "Consecutive" matters on a slow GPU: there every frame is 200 ms apart and would never count as rapid.
    var rapid = dirty && (lastTickDirty || now - lastChange < 200);
    lastTickDirty = dirty;
    if (dirty) { lastChange = now; if (rapid) hqPending = true; }
    var busy = motion || rapid;
    if (!dirty && !(hqPending && !busy && now - lastChange >= 200)) { lastMotion = false; return; }
    var hq = !busy;
    if (gq === false && motion && lastMotion) B.sample(gap, false, true);   // no GPU timer: the frame interval
    lastMotion = motion;
    quality(hq);
    if (hq) hqPending = false;
    applyCamera(); keepAboveGround(); updateSky();
    var e = rig.exp.x;
    sphereMat.uniforms.uExposure.value = e; if (capMat) capMat.uniforms.uExposure.value = e;
    var q = gpuBegin();
    renderer.render(scene, camera);
    gpuEnd(q, hq);
    dirty = false;
    emit('frame', { hq: hq });
  }

  function resize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    dirty = true; hqPending = true;
  }

  /* ------------------------------------------------------------------ init */
  function init(cv, opt) {
    opt = opt || {};
    canvas = cv;
    renderer = new T.WebGLRenderer({ canvas: canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opt.preserve });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 1);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    scene = new T.Scene();
    camera = new T.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 1, 1e6);
    var shared = {
      uSun: { value: sunDir.clone() }, uEarth: { value: earthVec.clone() }, uEarthPhase: { value: 0.5 },
      uSunI: { value: 2.35 }, uEarthI: { value: 0.05 }, uExposure: { value: 1 },
      uDemFull: { value: null }, uDemInner: { value: null }, uHasDem: { value: 0 }, uHasInner: { value: 0 },
      uDemSite: { value: null }, uHasSite: { value: 0 }, uSiteRect: { value: new T.Vector4(0, 0, 1, 1) }, uSiteTexel: { value: 0.01 }
    };
    function uni(extra) {
      var u = {}; Object.keys(shared).forEach(function (k) { u[k] = { value: shared[k].value && shared[k].value.clone ? shared[k].value.clone() : shared[k].value }; });
      Object.keys(extra).forEach(function (k) { u[k] = extra[k]; }); return u;
    }
    sphereMat = new T.ShaderMaterial({ vertexShader: SPHERE_VS, fragmentShader: SPHERE_FS,
      uniforms: uni({ uColor: { value: null }, uNormal: { value: null }, uNormalScale: { value: 1.6 },
                      uGlobH: { value: null }, uHasGlobH: { value: 0 }, uSteps2: { value: 48 }, uGrow2: { value: 1.10 } }) });
    sphere = new T.Mesh(sphereGeometry(512, 256), sphereMat);
    sphere.visible = false;
    scene.add(sphere);
    makeSky();
    window.addEventListener('resize', resize);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });

    // phones: 4K color (not 8K: about 45 MB of GPU memory instead of 180), 2K normal and global heights, and the
    // 15 MB of polar DEMs only after the first frame, so the first paint does not share the connection
    var big = !LITE && renderer.capabilities.maxTextureSize >= 8192 && !opt.lowres;
    var fourK = opt.fourK || LITE;
    var first = Promise.all([loadTex('app/tex/moon_color_2k.jpg'), loadTex(LITE ? 'app/tex/moon_normal_2k.webp' : 'app/tex/moon_normal_4k.webp')])
      .then(function (t) {
        sphereMat.uniforms.uColor.value = t[0]; sphereMat.uniforms.uNormal.value = t[1];
        sphere.visible = true; dirty = true; hqPending = true;
      });
    var capReady = capReadyP = (LITE ? first : Promise.resolve()).then(function () {
      return loadDem('app/tex/pole_full_1906.i16', 1906);
    }).then(function (d) {
      demFull = d.data;
      capMat = new T.ShaderMaterial({ vertexShader: CAP_VS, fragmentShader: CAP_FS, side: T.DoubleSide,
        uniforms: uni({ uColor: { value: sphereMat.uniforms.uColor.value }, uSteps: { value: 190 }, uGrow: { value: 1.045 }, uOverlay: { value: overlay } }) });
      capMat.uniforms.uDemFull.value = d.tex; capMat.uniforms.uHasDem.value = 1;
      sphereMat.uniforms.uDemFull.value = d.tex; sphereMat.uniforms.uHasDem.value = 1;
      cap = new T.Mesh(capGeometry(opt.capGrid || (LITE ? 448 : 640)), capMat); cap.frustumCulled = false;
      scene.add(cap);
      setTime(timeH); dirty = true; hqPending = true;
      return loadDem('app/tex/pole_inner_2048.i16', 2048);
    }).then(function (d) {
      demInner = d.data;
      capMat.uniforms.uDemInner.value = d.tex; capMat.uniforms.uHasInner.value = 1;
      sphereMat.uniforms.uDemInner.value = d.tex;
      dirty = true; hqPending = true;
    });
    first.then(function () {
      if (!big && !fourK) return;
      return loadTex(big ? 'app/tex/moon_color_8k.jpg' : 'app/tex/moon_color_4k.jpg').then(function (t) {
        var old = sphereMat.uniforms.uColor.value;
        sphereMat.uniforms.uColor.value = t; if (capMat) capMat.uniforms.uColor.value = t;
        if (old) old.dispose(); dirty = true; hqPending = true;
      });
    }).catch(function (e) { console.warn('hi-res color', e); })
      .then(function () { return LITE ? capReady.catch(function () {}) : null; })   // phones: the pole first
      .then(function () {                     // terminator shadows on the whole globe (LOLA ldem_16, metres)
        return (LITE ? loadDem('app/tex/moon_height_2k.i16', 2048, 1024, 0.001, true)
                     : loadDem('app/tex/moon_height_4k.i16', 4096, 2048, 0.001, true)).then(function (d) {
          sphereMat.uniforms.uGlobH.value = d.tex; sphereMat.uniforms.uHasGlobH.value = 1;
          dirty = true; hqPending = true; window.__globShadows = true;
        });
      }).catch(function (e) { console.warn('global heights', e); });
    applyCamera();
    requestAnimationFrame(frame);
    return first.then(function () { emit('ready'); return { cap: capReady }; });
  }

  var overlay = 0;
  function setOverlay(n) { overlay = n; if (capMat) capMat.uniforms.uOverlay.value = n; dirty = true; hqPending = true; }
  function setInsets(o) { insets = Object.assign(insets, o); dirty = true; hqPending = true; }
  function project(lat, lon, hKm) {
    var p = unit(lat, lon).multiplyScalar(R + (hKm || 0));
    var toCam = camera.position.clone().sub(p);
    var front = toCam.dot(p) > 0;
    var v = p.clone().project(camera);
    var r = canvas.getBoundingClientRect();
    return { x: (v.x + 1) / 2 * r.width + r.left, y: (1 - v.y) / 2 * r.height + r.top, front: front && v.z < 1 };
  }
  function on(evt, cb) { (listeners[evt] = listeners[evt] || []).push(cb); }
  function info() { return { moonIllum: moonIllum, earthIllum: earthIllum, sun: sunDir.clone(), earth: earthVec.clone() }; }

  return {
    init: init, setTime: setTime, view: view, viewSite: viewSite, setOverlay: setOverlay, setInsets: setInsets, preset: presets,
    setSiteTile: setSiteTile,
    pick: pick, project: project, on: on, info: info, demHeightKm: demHeightKm,
    dem: function () { return { full: demFull, inner: demInner }; },
    invalidate: function () { dirty = true; hqPending = true; },
    quality: function () { return { hq: B.hq, lq: B.lq, ms: B.last, timer: gq ? 'gpu' : gq === false ? 'wall' : 'pending' }; },
    lite: LITE,
    playing: false
  };
})();
