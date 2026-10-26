/* The Google Earth globe of every version that has Earth (2.3.6, 4.0.4, 4.3, 4.4.4, 5.1.1): a canvas sphere textured
   with NASA's Blue Marble Next Generation (August 2004, topography and bathymetry; public domain, see docs/sources.md),
   kept in ../../assets/earth/blue-marble.jpg so it needs no network. Earth itself streamed its imagery from Google's
   servers, so the image is not in any factory APK; each version draws its own Earth chrome around this canvas.

   EarthGlobe.mount(canvas, view, options) draws view {lon, lat, zoom, heading, spin} into the canvas while it is in the
   page: dragging turns the globe, the wheel / pinch / double tap zoom (1–6), Shift-drag or a two-finger twist turns the
   heading, and the globe spins slowly until the first touch. flyTo / north / myLocation animate the same view object,
   which the version keeps so the view survives re-renders. options: {marker: {lon, lat, src}, imagery: false (the
   Imagery Visibility setting: a plain blue sphere)}. EarthGlobe.find(query) looks a place up in PLACES. */
(() => {
  'use strict';
  const TEXTURE = '../../assets/earth/blue-marble.jpg';
  const RAD = Math.PI / 180;
  // The demo phone's location (Mountain View, as in the other apps' maps).
  const HOME = {lon: -122.08, lat: 37.39};
  // Places search finds, with their names in the simulator's languages; zoom 5 is a city, 3 a country.
  const PLACES = [
    [['mountain view', 'pizza'], -122.08, 37.39, 5], [['san francisco'], -122.42, 37.77, 5], [['los angeles'], -118.24, 34.05, 5],
    [['new york', 'new york city'], -74.0, 40.71, 5], [['washington'], -77.04, 38.9, 5], [['chicago'], -87.63, 41.88, 5],
    [['toronto'], -79.38, 43.65, 5], [['mexico city', 'ciudad de méxico', 'mexikóváros', 'mexiko-stadt', 'mexico'], -99.13, 19.43, 5],
    [['rio de janeiro', 'rio'], -43.2, -22.91, 5], [['buenos aires'], -58.38, -34.6, 5], [['london', 'london', 'londres', 'londra'], -0.13, 51.51, 5],
    [['paris', 'párizs'], 2.35, 48.86, 5], [['berlin', 'berlín'], 13.4, 52.52, 5], [['madrid'], -3.7, 40.42, 5],
    [['rome', 'róma', 'rom', 'roma'], 12.5, 41.9, 5], [['vienna', 'bécs', 'wien', 'vienne', 'viena'], 16.37, 48.21, 5],
    [['budapest'], 19.04, 47.5, 5], [['prague', 'prága', 'prag', 'praga'], 14.44, 50.08, 5], [['warsaw', 'varsó', 'warschau', 'varsovie', 'varsovia'], 21.01, 52.23, 5],
    [['moscow', 'moszkva', 'moskau', 'moscou', 'moscú'], 37.62, 55.76, 5], [['istanbul', 'isztambul', 'estambul'], 28.98, 41.01, 5],
    [['cairo', 'kairó', 'kairo', 'le caire', 'el cairo'], 31.24, 30.04, 5], [['cape town', 'fokváros', 'kapstadt', 'le cap', 'ciudad del cabo'], 18.42, -33.92, 5],
    [['nairobi'], 36.82, -1.29, 5], [['dubai', 'dubaj', 'dubaï', 'dubái'], 55.27, 25.2, 5], [['mumbai', 'bombay'], 72.88, 19.08, 5],
    [['beijing', 'peking', 'pékin', 'pekín'], 116.4, 39.9, 5], [['shanghai', 'sanghaj', 'shanghái'], 121.47, 31.23, 5],
    [['tokyo', 'tokió', 'tokio'], 139.69, 35.69, 5], [['seoul', 'szöul', 'séoul', 'seúl'], 126.98, 37.57, 5],
    [['singapore', 'szingapúr', 'singapur', 'singapour'], 103.82, 1.35, 5], [['sydney', 'sídney'], 151.21, -33.87, 5],
    [['hungary', 'magyarország', 'ungarn', 'hongrie', 'hungría'], 19.5, 47.16, 3], [['germany', 'németország', 'deutschland', 'allemagne', 'alemania'], 10.45, 51.17, 3],
    [['france', 'franciaország', 'frankreich', 'francia'], 2.21, 46.23, 3], [['spain', 'spanyolország', 'spanien', 'espagne', 'españa'], -3.75, 40.46, 3],
    [['italy', 'olaszország', 'italien', 'italie', 'italia'], 12.57, 41.87, 3], [['united states', 'usa', 'egyesült államok', 'vereinigte staaten', 'états-unis', 'estados unidos'], -98.58, 39.83, 2],
    [['japan', 'japán', 'japon', 'japón'], 138.25, 36.2, 3], [['australia', 'ausztrália', 'australien', 'australie'], 133.78, -25.27, 2],
    [['brazil', 'brazília', 'brasilien', 'brésil', 'brasil'], -51.93, -14.24, 2], [['egypt', 'egyiptom', 'ägypten', 'égypte', 'egipto'], 30.8, 26.82, 3],
    [['mount everest', 'everest'], 86.93, 27.99, 5], [['grand canyon'], -112.11, 36.11, 5], [['niagara falls', 'niagara'], -79.07, 43.08, 5]
  ];
  const norm = s => String(s || '').trim().toLowerCase().normalize('NFC');
  function find(query) {
    const q = norm(query); if (!q) return null;
    const hit = PLACES.find(([names]) => names.includes(q)) || PLACES.find(([names]) => names.some(n => n.startsWith(q) || q.startsWith(n)));
    return hit ? {lon: hit[1], lat: hit[2], zoom: hit[3]} : null;
  }

  // The texture's pixels, read once and shared by every canvas.
  let tex = null, loading = null;
  function texture() {
    if (tex || loading) return tex;
    loading = new Image();
    loading.onload = () => {
      const c = document.createElement('canvas'); c.width = loading.naturalWidth; c.height = loading.naturalHeight;
      const g = c.getContext('2d', {willReadFrequently: true}); g.drawImage(loading, 0, 0);
      tex = {w: c.width, h: c.height, data: g.getImageData(0, 0, c.width, c.height).data};
      for (const m of mounts) m.dirty = true;
    };
    loading.src = TEXTURE;
    return null;
  }

  const wrap = lon => ((lon + 540) % 360) - 180;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mounts = new Set();

  // Screen point of a lon/lat for a view and radius, or null on the far side.
  function project(view, r, lon, lat) {
    const sl = Math.sin(view.lat * RAD), cl = Math.cos(view.lat * RAD), d = (lon - view.lon) * RAD, la = lat * RAD;
    const px = Math.cos(la) * Math.sin(d), py = Math.sin(la), pz = Math.cos(la) * Math.cos(d);
    const nx = px, ny = py * cl - pz * sl, nz = py * sl + pz * cl;
    if (nz <= 0) return null;
    const h = (view.heading || 0) * RAD, x = nx * Math.cos(h) - ny * Math.sin(h), y = nx * Math.sin(h) + ny * Math.cos(h);
    return {x: x * r, y: -y * r};
  }

  function draw(m) {
    const {canvas, view} = m, scale = m.moving ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * scale), h = Math.round(canvas.clientHeight * scale);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    const g = canvas.getContext('2d'), r = Math.min(w, h) * .4 * view.zoom, cx = w / 2, cy = h / 2;
    g.clearRect(0, 0, w, h);
    // The atmosphere's glow round the limb.
    if (r < Math.hypot(w, h)) {
      const glow = g.createRadialGradient(cx, cy, r * .97, cx, cy, r * 1.09);
      glow.addColorStop(0, '#8fc4ffaa'); glow.addColorStop(1, '#8fc4ff00');
      g.fillStyle = glow; g.beginPath(); g.arc(cx, cy, r * 1.09, 0, Math.PI * 2); g.fill();
    }
    const x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(w, Math.ceil(cx + r)), y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(h, Math.ceil(cy + r));
    if (x1 <= x0 || y1 <= y0) return;
    const out = g.createImageData(x1 - x0, y1 - y0), o = out.data, t = m.imagery === false ? null : texture();
    const sl = Math.sin(view.lat * RAD), cl = Math.cos(view.lat * RAD), lon0 = view.lon * RAD;
    const hd = (view.heading || 0) * RAD, ch = Math.cos(hd), sh = Math.sin(hd);
    for (let y = y0; y < y1; y++) {
      const sy = (cy - y - .5) / r;
      for (let x = x0; x < x1; x++) {
        const sx = (x + .5 - cx) / r, d2 = sx * sx + sy * sy;
        if (d2 > 1) continue;
        // Undo the heading, then the inverse of project().
        const nx = sx * ch + sy * sh, ny = -sx * sh + sy * ch, nz = Math.sqrt(1 - d2);
        const lat = Math.asin(clamp(ny * cl + nz * sl, -1, 1)), lon = lon0 + Math.atan2(nx, nz * cl - ny * sl);
        const shade = .62 + .38 * nz, k = ((y - y0) * (x1 - x0) + x - x0) * 4;
        if (t) {
          const tx = ((Math.floor((lon / Math.PI + 1) / 2 * t.w) % t.w) + t.w) % t.w, ty = clamp(Math.floor((.5 - lat / Math.PI) * t.h), 0, t.h - 1), i = (ty * t.w + tx) * 4;
          o[k] = t.data[i] * shade; o[k + 1] = t.data[i + 1] * shade; o[k + 2] = t.data[i + 2] * shade;
        } else { o[k] = 22 * shade; o[k + 1] = 62 * shade; o[k + 2] = 120 * shade; }
        o[k + 3] = 255;
      }
    }
    // putImageData would cover the glow outside the sphere, so the sphere goes through a canvas of its own.
    const sphere = m.sphere ||= document.createElement('canvas');
    sphere.width = out.width; sphere.height = out.height; sphere.getContext('2d').putImageData(out, 0, 0);
    g.drawImage(sphere, x0, y0);
    const mk = m.marker;
    if (mk) {
      const p = project(view, r, mk.lon, mk.lat);
      if (p) {
        const img = m.markerImg ||= Object.assign(new Image(), {onload: () => { m.dirty = true; }, src: mk.src}), s = (mk.size || 24) * scale;
        if (img.complete && img.naturalWidth) g.drawImage(img, cx + p.x - s / 2, cy + p.y - s / 2, s, s);
      }
    }
  }

  // An animation of the view toward {lon, lat, zoom, heading} over ms, eased; a long flight pulls out in the middle.
  function animate(view, to, ms = 1400) {
    const from = {lon: view.lon, lat: view.lat, zoom: view.zoom, heading: view.heading || 0};
    const dlon = wrap(to.lon - from.lon), dist = Math.hypot(dlon, to.lat - from.lat);
    const lift = Math.max(1, Math.min(from.zoom, to.zoom) / (1 + dist / 25));
    view.spin = false;
    view.anim = {from, to: {lon: from.lon + dlon, lat: to.lat, zoom: to.zoom ?? from.zoom, heading: to.heading ?? from.heading}, lift, start: performance.now(), ms};
    for (const m of mounts) if (m.view === view) m.dirty = true;
  }
  function step(view, now) {
    const a = view.anim; if (!a) return false;
    const p = Math.min(1, (now - a.start) / a.ms), e = p < .5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
    view.lon = wrap(a.from.lon + (a.to.lon - a.from.lon) * e);
    view.lat = a.from.lat + (a.to.lat - a.from.lat) * e;
    // Zoom along a curve through the lifted midpoint, in log space.
    const lz0 = Math.log(a.from.zoom), lz1 = Math.log(a.to.zoom), lm = Math.log(a.lift);
    view.zoom = Math.exp((1 - e) ** 2 * lz0 + 2 * (1 - e) * e * Math.min(lm, (lz0 + lz1) / 2) + e * e * lz1);
    let dh = ((a.to.heading - a.from.heading) % 360 + 540) % 360 - 180;
    view.heading = a.from.heading + dh * e;
    if (p >= 1) { view.anim = null; view.heading = ((view.heading % 360) + 360) % 360; }
    return true;
  }

  function mount(canvas, view, options = {}) {
    Object.assign(view, {lon: view.lon ?? -100, lat: view.lat ?? 25, zoom: view.zoom ?? 1, heading: view.heading ?? 0, spin: view.spin ?? true});
    // A re-render that kept the canvas only updates its options.
    const same = [...mounts].find(x => x.canvas === canvas);
    if (same) { if (same.marker?.src !== options.marker?.src) same.markerImg = null; Object.assign(same, {marker: options.marker || null, imagery: options.imagery, dirty: true}); return same; }
    for (const old of mounts) if (!old.canvas.isConnected) mounts.delete(old);
    const m = {canvas, view, marker: options.marker || null, imagery: options.imagery, dirty: true, moving: false};
    mounts.add(m);
    const pointers = new Map();
    let gesture = null;
    const radius = () => Math.min(canvas.clientWidth, canvas.clientHeight) * .4 * view.zoom;
    const begin = () => {
      const pts = [...pointers.values()];
      view.spin = false; view.anim = null;
      if (pts.length >= 2) {
        const [a, b] = pts;
        gesture = {kind: 'pinch', zoom: view.zoom, heading: view.heading, dist: Math.hypot(b.x - a.x, b.y - a.y), angle: Math.atan2(b.y - a.y, b.x - a.x)};
      } else if (pts.length === 1) gesture = {kind: pts[0].shift ? 'turn' : 'drag', x: pts[0].x, y: pts[0].y, lon: view.lon, lat: view.lat, heading: view.heading};
      else gesture = null;
    };
    canvas.addEventListener('pointerdown', ev => {
      if (ev.button > 0) return;
      canvas.setPointerCapture?.(ev.pointerId);
      pointers.set(ev.pointerId, {x: ev.clientX, y: ev.clientY, shift: ev.shiftKey});
      begin(); m.moving = true;
    });
    canvas.addEventListener('pointermove', ev => {
      if (!pointers.has(ev.pointerId) || !gesture) return;
      pointers.set(ev.pointerId, {...pointers.get(ev.pointerId), x: ev.clientX, y: ev.clientY});
      const pts = [...pointers.values()];
      if (gesture.kind === 'pinch' && pts.length >= 2) {
        const [a, b] = pts, dist = Math.hypot(b.x - a.x, b.y - a.y), angle = Math.atan2(b.y - a.y, b.x - a.x);
        view.zoom = clamp(gesture.zoom * dist / (gesture.dist || 1), 1, 6);
        view.heading = gesture.heading - (angle - gesture.angle) / RAD;
      } else if (gesture.kind === 'turn') view.heading = gesture.heading + (ev.clientX - gesture.x) * .5;
      else if (gesture.kind === 'drag') {
        // The heading turns the drag into the globe's own axes; one radius of drag is one radian.
        const k = 1 / RAD / radius(), h = view.heading * RAD, dx = ev.clientX - gesture.x, dy = ev.clientY - gesture.y;
        const ex = dx * Math.cos(h) + dy * Math.sin(h), ey = -dx * Math.sin(h) + dy * Math.cos(h);
        view.lon = wrap(gesture.lon - ex * k / Math.max(.2, Math.cos(view.lat * RAD)));
        view.lat = clamp(gesture.lat + ey * k, -85, 85);
      }
      m.dirty = true;
    });
    const end = ev => { pointers.delete(ev.pointerId); begin(); if (!pointers.size) { m.moving = false; m.dirty = true; } };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', ev => {
      ev.preventDefault();
      view.spin = false; view.anim = null;
      view.zoom = clamp(view.zoom * (ev.deltaY < 0 ? 1.25 : .8), 1, 6);
      m.dirty = true;
    }, {passive: false});
    canvas.addEventListener('dblclick', () => animate(view, {lon: view.lon, lat: view.lat, zoom: clamp(view.zoom * 2, 1, 6)}, 500));
    const tick = now => {
      if (!canvas.isConnected) { mounts.delete(m); return; }
      if (view.spin) { view.lon = wrap(view.lon - .12); m.dirty = true; }
      if (step(view, now)) { m.dirty = true; m.moving = !!view.anim; }
      if (m.dirty) { draw(m); m.dirty = false; }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return m;
  }

  const flyTo = (view, place) => animate(view, {lon: place.lon, lat: place.lat, zoom: place.zoom ?? 5});
  const north = view => animate(view, {lon: view.lon, lat: view.lat, zoom: view.zoom, heading: 0}, 600);
  const myLocation = view => animate(view, {...HOME, zoom: 5});
  // The view of the globe on screen (for the browser tests).
  const current = () => [...mounts].find(m => m.canvas.isConnected)?.view || null;
  window.EarthGlobe = {mount, flyTo, north, myLocation, find, current, HOME, PLACES};
})();
