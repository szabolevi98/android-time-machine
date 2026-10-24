/* Photo Sphere in the KitKat camera (LightCycle in GoogleCamera 2.0.002, Nexus 5 KTU84P) and its viewer from the Gallery.
   pano_module.xml: the preview, camera_controls (the shutter ends the capture) and undo_button (ic_menu_revert_holo_dark,
   bottom|right like the menu button) over LightCycle's GL view. LightCycle draws the capture natively, so the view is an
   approximation built from the APK's pieces: pano_reticule_default (80 dp) in the middle turning into
   pano_reticule_activated while the next pano_target dot (28 dp) is inside it, pano_alignhint_up / down when the dot is
   off the screen above or below, "Align to start" until the first frame, "Too fast" when the camera turns too quickly;
   the frames already taken show bright over the dimmed scene. "Rendering photo sphere" follows the shutter, then the
   PANO_ picture joins the Camera album.
   Without sensors the camera turns by dragging the preview (the 7.1 simulator's capture model): the targets are three
   rings of eight 45 degrees apart around the horizon; a target held in the reticle for 350 ms is taken; the shutter
   ends the capture once two frames are in, a full set ends it by itself; Undo takes back the last frame (not the
   first); switching to another module throws the sphere away.
   The picture is an equirectangular 2:1 image of the scene where frames were taken, grey elsewhere. The Gallery's
   photopage_bottom_control_panorama (ic_view_photosphere, 70 dp, bottom centre) opens it in the viewer, where dragging
   looks around. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (t, key) => { const row = window.StockStrings?.sphere?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language || 'en', key) : t(key); };
  const icon = name => `assets/jbcam-${name}.png`;
  // One step is 45 degrees; the screen width spans SPAN units.
  const STEP = .34, COLS = 8, ROWS = [0, -STEP, STEP], TURN = COLS * STEP, SPAN = .8, HOLD = 350, RENDER = 1600;
  // The horizon first, then the ring above and the ring below.
  const targets = () => ROWS.flatMap((y, row) => Array.from({length: COLS}, (_, col) => ({x: col * STEP, y, col, row})));
  const wrap = x => ((x % TURN) + TURN) % TURN;
  const start = () => ({state: 'capture', x: 0, y: .12, index: 0, frames: [], alignedSince: null, last: 0, tooFast: 0});
  const target = g => targets()[g.index] || null;
  function offset(g) {
    const t = target(g); if (!t) return null;
    let dx = wrap(t.x) - wrap(g.x);
    if (dx > TURN / 2) dx -= TURN; if (dx < -TURN / 2) dx += TURN;
    return {dx, dy: t.y - g.y};
  }
  const aligned = g => { const o = offset(g); return !!o && Math.hypot(o.dx, o.dy) < .055; };
  // dx, dy in units; faster than .004 units per millisecond is "Too fast".
  function move(g, dx, dy, now) {
    const dt = Math.max(16, now - (g.last || now - 16)); g.last = now;
    if (Math.hypot(dx, dy) / dt > .004) g.tooFast = now + 700;
    g.x = wrap(g.x + dx); g.y = Math.max(-.45, Math.min(.45, g.y + dy));
    if (!aligned(g)) g.alignedSince = null;
  }
  // True when a frame was taken.
  function tick(g, now) {
    if (g.state !== 'capture' || !aligned(g)) { g.alignedSince = null; g.held = false; return false; }
    // After Undo the dot has to leave the reticle before it is taken again.
    if (g.held) return false;
    if (g.alignedSince === null) g.alignedSince = now;
    if (now - g.alignedSince < HOLD) return false;
    const t = target(g); g.frames.push({col: t.col, row: t.row}); g.index++; g.alignedSince = null; return true;
  }
  function undo(g) { if (g.frames.length > 1) { g.frames.pop(); g.index--; g.alignedSince = null; g.held = aligned(g); } }
  const canSave = g => g.frames.length >= 2;
  const complete = g => g.index >= targets().length;

  function render(data, ui, t, media) {
    const g = ui.kkSphere ||= start(), scene = media.scene(data);
    if (g.state === 'render') return `<div class="kks kks-render" data-kks data-state="render"><p>${e(S(t, 'Rendering photo sphere'))}</p><span class="kks-progress"><i></i></span></div>`;
    const world = media.image({...scene, sphere: true, frames: 'all'}), shot = g.frames.length ? media.sphereImage({...scene, frames: g.frames}, true) : '';
    return `<div class="kks" data-kks data-state="capture" data-frames="${g.frames.length}">
      <div class="kks-world" data-kks-layer style="background-image:url('${world}')"></div>${shot ? `<div class="kks-shot" data-kks-layer style="background-image:url('${shot}')"></div>` : ''}
      <img class="kks-reticule" data-kks-reticule src="${icon('pano_reticule_default')}" alt="">
      <img class="kks-target" data-kks-target src="${icon('pano_target_default')}" alt="">
      <img class="kks-hint" data-kks-hint src="${icon('pano_alignhint_up')}" alt="" hidden>
      <p class="kks-msg" data-kks-msg data-align="${e(S(t, 'Align to start'))}" data-fast="${e(S(t, 'Too fast'))}">${g.frames.length ? '' : e(S(t, 'Align to start'))}</p>
      <button type="button" class="kks-undo" data-kks-undo aria-label="${e(t('Undo'))}" ${g.frames.length > 1 ? '' : 'hidden'}><img src="${icon('ic_menu_revert_holo_dark')}" alt=""></button>
    </div>`;
  }
  // The capture: drags turn the camera, a frame loop takes the targets; the rendering runs on from ui.kkSphere.at.
  function attach(root, {ui, rerender, shoot}) {
    const g = ui.kkSphere, el = root.querySelector('[data-kks]');
    if (!g || !el) return {shutter() {}, destroy() {}};
    let destroyed = false, frame = 0, drag = null;
    const node = sel => el.querySelector(sel);
    function paint(now = performance.now()) {
      const w = el.clientWidth, h = el.clientHeight, px = w / SPAN, bandW = TURN * px, bandH = bandW / 2;
      const position = `${w / 2 - g.x * px}px ${h / 2 - bandH / 2 - g.y * px}px`;
      el.querySelectorAll('[data-kks-layer]').forEach(layer => { layer.style.backgroundSize = `${bandW}px ${bandH}px`; layer.style.backgroundPosition = position; });
      const o = offset(g), on = aligned(g), dot = node('[data-kks-target]'), hint = node('[data-kks-hint]');
      node('[data-kks-reticule]').src = icon(on ? 'pano_reticule_activated' : 'pano_reticule_default');
      if (o) { const x = w / 2 + o.dx * px, y = h / 2 + o.dy * px; dot.hidden = false; dot.src = icon(on ? 'pano_target_activated' : 'pano_target_default'); dot.style.left = `${x}px`; dot.style.top = `${y}px`; hint.hidden = y > 0 && y < h; hint.src = icon(y <= 0 ? 'pano_alignhint_up' : 'pano_alignhint_down'); hint.classList.toggle('down', y >= h); }
      else { dot.hidden = true; hint.hidden = true; }
      const msg = node('[data-kks-msg]'), fast = g.tooFast > now;
      msg.textContent = fast ? msg.dataset.fast : g.frames.length ? '' : msg.dataset.align;
      el.dataset.aligned = String(on);
    }
    const finish = () => { g.state = 'render'; g.at = performance.now(); cancelAnimationFrame(frame); rerender(); };
    function loop(now) {
      if (destroyed) return;
      if (tick(g, now)) { if (complete(g)) { finish(); return; } rerender(); return; }
      paint(now); frame = requestAnimationFrame(loop);
    }
    function rendering(now) {
      if (destroyed || g.state !== 'render') return;
      if (now - g.at < RENDER) { frame = requestAnimationFrame(rendering); return; }
      const frames = g.frames; ui.kkSphere = start(); shoot({sphere: frames}); rerender();
    }
    if (g.state === 'render') { frame = requestAnimationFrame(rendering); return {shutter() {}, destroy() { destroyed = true; cancelAnimationFrame(frame); }}; }
    const down = event => {
      if (event.button > 0 || event.target.closest('button')) return;
      event.stopPropagation(); drag = {id: event.pointerId, x: event.clientX, y: event.clientY};
      try { el.setPointerCapture(event.pointerId); } catch {}
    };
    const moveEv = event => {
      if (!drag || event.pointerId !== drag.id) return;
      event.stopPropagation();
      const k = el.getBoundingClientRect().width / el.clientWidth || 1, px = el.clientWidth / SPAN * k;
      // The scene follows the finger, so the camera turns the other way.
      move(g, -(event.clientX - drag.x) / px, -(event.clientY - drag.y) / px, performance.now());
      drag.x = event.clientX; drag.y = event.clientY;
    };
    const up = event => { if (drag && event.pointerId === drag.id) { event.stopPropagation(); drag = null; } };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', moveEv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', event => { if (event.target.closest('[data-kks-undo]')) { event.stopPropagation(); undo(g); rerender(); } });
    paint(); frame = requestAnimationFrame(loop);
    return {shutter() { if (canSave(g)) finish(); }, destroy() { destroyed = true; cancelAnimationFrame(frame); }};
  }
  // The viewer: the picture as a band 1.3 screens high, dragged to look around.
  function viewer(photo, media, t) {
    return `<div class="app-view kks-viewer" data-sph-viewer><div class="kks-band" data-sph-band role="img" aria-label="${e(photo.name)}" style="background-image:url('${media.image(photo)}')"></div></div>`;
  }
  function attachViewer(root) {
    const band = root.querySelector('[data-sph-band]');
    if (!band || band.dataset.bound) return;
    band.dataset.bound = '1';
    let yaw = 0, pitch = 0, drag = null;
    const paint = () => { const h = band.clientHeight * 1.3, w = h * 2; pitch = Math.max(band.clientHeight - h, Math.min(0, pitch)); band.style.backgroundSize = `${w}px ${h}px`; band.style.backgroundPosition = `${yaw}px ${pitch}px`; };
    // The first frame (yaw 0, the picture's left edge) faces the viewer.
    yaw = band.clientWidth / 2; pitch = -band.clientHeight * .15;
    band.addEventListener('pointerdown', event => { drag = {id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch}; try { band.setPointerCapture(event.pointerId); } catch {} });
    band.addEventListener('pointermove', event => { if (!drag || event.pointerId !== drag.id) return; const k = band.getBoundingClientRect().width / band.clientWidth || 1; yaw = drag.yaw + (event.clientX - drag.x) / k; pitch = drag.pitch + (event.clientY - drag.y) / k; paint(); });
    const up = () => { drag = null; };
    band.addEventListener('pointerup', up); band.addEventListener('pointercancel', up);
    paint();
  }
  window.KKSphere = {STEP, COLS, SPAN, HOLD, targets, start, target, offset, aligned, move, tick, undo, canSave, complete, render, attach, viewer, attachViewer};
})();
