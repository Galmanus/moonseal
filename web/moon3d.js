/* Interactive 3D terrain globe of the lunar south pole.
   Real LOLA cap (window.MOON_DEM_*), three.js vendored locally (window.THREE).
   Orbit/zoom/pan like a map. Sun light + shadows and the Earth marker come from
   the real Horizons az/el in windows_data.js, at the page's scrub time.
   Public API: Moon3D.init(mountEl), Moon3D.setSite(i), Moon3D.setTime(h),
               Moon3D.onPick(cb). */
(function () {
  const T = window.THREE;
  let renderer, scene, camera, controls, terrain, sun, sunMesh, earthMesh, pins = [];
  let META, G, raycaster, pointer, mountEl, pickCb = null, capCenter = null, curSite = 0;
  const DEG = Math.PI / 180;

  function b64ToFloat32(b64) {
    const bin = atob(b64), len = bin.length, bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return new Float32Array(bytes.buffer);
  }

  // local ENU (az east-of-north, el) -> planetocentric unit vec -> scene frame (z-flip)
  function dirScene(latDeg, lonDeg, azDeg, elDeg) {
    const la = latDeg * DEG, lo = lonDeg * DEG, A = azDeg * DEG, E = elDeg * DEG;
    const e = Math.cos(E) * Math.sin(A), n = Math.cos(E) * Math.cos(A), u = Math.sin(E);
    const sl = Math.sin(lo), cl = Math.cos(lo), sf = Math.sin(la), cf = Math.cos(la);
    const x = -sl * e - sf * cl * n + cf * cl * u;
    const y =  cl * e - sf * sl * n + cf * sl * u;
    const z =            cf * n      + sf * u;
    return new T.Vector3(x, y, -z).normalize();   // z-flip matches the DEM transform
  }

  function buildTerrain(buf) {
    G = META.grid;
    const nNodes = G * G;
    const pos = buf.subarray(0, nNodes * 3);
    const elev = buf.subarray(nNodes * 3, nNodes * 4);
    const eMin = META.elev_min_km, eMax = META.elev_max_km, span = (eMax - eMin) || 1;

    const geo = new T.BufferGeometry();
    const vert = new Float32Array(nNodes * 3);
    const col = new Float32Array(nNodes * 3);
    for (let k = 0; k < nNodes; k++) {
      vert[k * 3] = pos[k * 3]; vert[k * 3 + 1] = pos[k * 3 + 1]; vert[k * 3 + 2] = pos[k * 3 + 2];
      const valid = isFinite(elev[k]);
      const t = valid ? Math.max(0, Math.min(1, (elev[k] - eMin) / span)) : 0;
      // hypsometric: deep shadowed lows cool, high rims warm, mostly regolith grey
      const g = 0.32 + 0.52 * t;
      col[k * 3] = g * (0.9 + 0.25 * t);
      col[k * 3 + 1] = g * (0.92 + 0.08 * t);
      col[k * 3 + 2] = g * (1.02 - 0.12 * t);
    }
    geo.setAttribute('position', new T.BufferAttribute(vert, 3));
    geo.setAttribute('color', new T.BufferAttribute(col, 3));

    const idx = [];
    const ok = k => isFinite(elev[k]);   // elev NaN marks out-of-disc nodes
    for (let r = 0; r < G - 1; r++) for (let c = 0; c < G - 1; c++) {
      const a = r * G + c, b = a + 1, d = a + G, e = d + 1;
      if (ok(a) && ok(b) && ok(d) && ok(e)) { idx.push(a, d, b, b, d, e); }
    }
    geo.setIndex(idx);
    geo.computeVertexNormals();

    const mat = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.98, metalness: 0.0, flatShading: false });
    terrain = new T.Mesh(geo, mat);
    terrain.castShadow = true; terrain.receiveShadow = true;
    scene.add(terrain);
    geo.computeBoundingSphere();
    return geo.boundingSphere;
  }

  function nodePos(buf, u, v) {
    const k = Math.round(v) * G + Math.round(u);
    return new T.Vector3(buf[k * 3], buf[k * 3 + 1], buf[k * 3 + 2]);
  }

  function addPins(buf) {
    const D = window.LUNAR_DATA;
    META.sites.forEach((s, i) => {
      const p = nodePos(buf, s.u, s.v);
      if (!isFinite(p.x)) return;
      const up = p.clone().normalize();
      const stem = 22, head = 10;
      const grp = new T.Group();
      const pole = new T.Mesh(new T.CylinderGeometry(1.2, 1.2, stem, 8),
        new T.MeshStandardMaterial({ color: 0x8b7dff, emissive: 0x2a2250 }));
      pole.position.copy(up.clone().multiplyScalar(stem / 2));
      pole.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), up);
      const ball = new T.Mesh(new T.SphereGeometry(head, 16, 16),
        new T.MeshStandardMaterial({ color: 0x00d6c2, emissive: 0x006b61 }));
      ball.position.copy(up.clone().multiplyScalar(stem + head * 0.4));
      grp.add(pole); grp.add(ball);
      grp.position.copy(p);
      grp.userData = { i, ball };
      scene.add(grp); pins.push(grp);
    });
  }

  function highlightPin(i) {
    pins.forEach(g => {
      const on = g.userData.i === i;
      g.userData.ball.material.color.set(on ? 0xffffff : 0x00d6c2);
      g.userData.ball.material.emissive.set(on ? 0x8b7dff : 0x006b61);
      g.userData.ball.scale.setScalar(on ? 1.6 : 1.0);
    });
  }

  function init(el) {
    mountEl = el;
    META = window.MOON_DEM_META;
    const buf = b64ToFloat32(window.MOON_DEM_B64);
    const W = el.clientWidth, H = el.clientHeight || 460;

    renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFShadowMap;
    el.appendChild(renderer.domElement);

    scene = new T.Scene();
    scene.background = new T.Color(0x05070d);

    camera = new T.PerspectiveCamera(42, W / H, 1, 20000);

    const bs = buildTerrain(buf);
    addPins(buf);

    capCenter = nodePos(buf, (G - 1) / 2, (G - 1) / 2);   // the pole node, true cap center
    const c = capCenter, R = bs.radius;
    controls = new window.OrbitControls(camera, renderer.domElement);
    controls.target.copy(c);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = R * 0.25; controls.maxDistance = R * 4;
    controls.maxPolarAngle = Math.PI * 0.98;
    camera.position.copy(c.clone().add(new T.Vector3(R * 0.15, -R * 1.05, R * 1.9)));
    controls.update();

    sun = new T.DirectionalLight(0xfff4e0, 2.6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera; sc.near = 1; sc.far = R * 8;
    sc.left = -R * 1.3; sc.right = R * 1.3; sc.top = R * 1.3; sc.bottom = -R * 1.3;
    scene.add(sun); scene.add(sun.target);
    sun.target.position.copy(c);
    scene.add(new T.AmbientLight(0x2a3550, 0.85));
    scene.add(new T.HemisphereLight(0x2b3a5c, 0x0a0a12, 0.55));

    sunMesh = new T.Mesh(new T.SphereGeometry(R * 0.07, 16, 16),
      new T.MeshBasicMaterial({ color: 0xffd27a }));
    scene.add(sunMesh);
    earthMesh = new T.Mesh(new T.SphereGeometry(R * 0.05, 24, 24),
      new T.MeshBasicMaterial({ color: 0x4da3ff }));
    scene.add(earthMesh);

    raycaster = new T.Raycaster(); pointer = new T.Vector2();
    renderer.domElement.addEventListener('pointerdown', onPick);
    window.addEventListener('resize', onResize);

    animate();
    return { center: c, radius: R };
  }

  function onResize() {
    if (!renderer) return;
    const W = mountEl.clientWidth, H = mountEl.clientHeight || 460;
    camera.aspect = W / H; camera.updateProjectionMatrix(); renderer.setSize(W, H);
  }

  function onPick(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pins, true);
    if (hits.length) {
      let g = hits[0].object; while (g && g.userData.i === undefined) g = g.parent;
      if (g && pickCb) pickCb(g.userData.i);
    }
  }

  // sun/earth directions at scrub time h, from the current site's real az/el
  function setTime(h) {
    const D = window.LUNAR_DATA; if (!D || !terrain) return;
    const s = D.sites[curSite], n = s.t_h.length;
    const i = Math.max(0, Math.min(n - 1, Math.round(h / (s.t_h[n - 1] / (n - 1)))));
    const R = terrain.geometry.boundingSphere.radius, c = capCenter;
    const sd = dirScene(s.lat, s.lon, s.sun_az[i], s.sun_el[i]);
    const ed = dirScene(s.lat, s.lon, s.earth_az[i], s.earth_el[i]);
    sun.position.copy(c.clone().add(sd.clone().multiplyScalar(R * 5)));
    sunMesh.position.copy(c.clone().add(sd.clone().multiplyScalar(R * 2.6)));
    sunMesh.visible = s.sun_el[i] > -3;
    earthMesh.position.copy(c.clone().add(ed.clone().multiplyScalar(R * 2.3)));
    earthMesh.material.color.set(s.earth_el[i] > s.earth_horizon[i] ? 0x4da3ff : 0x314a6a);
  }

  function setSite(i) {
    curSite = i; highlightPin(i);
    // gently frame the chosen pin without yanking the camera
    const g = pins.find(p => p.userData.i === i);
    if (g && controls) { controls.target.lerp(g.position, 0.5); controls.update(); }
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  window.Moon3D = { init, setSite, setTime, onPick: cb => (pickCb = cb) };
})();
