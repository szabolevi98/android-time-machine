/* Photo Sphere in Google Camera 2.4 (LightCycle, Nexus 6 LMY48Y) and the Photos viewer's photo sphere view.
   LightCycle draws its capture view natively, so the view is an approximation built from the APK's pieces: the dimmed
   scene with the frames already taken bright over it, a white circle in the middle and the next pano_target dot (63 dp,
   pano_target_activated while it is inside the circle), pano_alignhint_up / down when the dot is off the screen, "To
   start, keep dot inside circle" until the first frame and "Too fast" when the camera turns too quickly. Once capturing,
   the shutter disc shows ic_done_normal (ic_done_disabled until two frames are in) and ic_cancel_normal ("Discard photo
   sphere") sits beside it; Back discards as well. "Processing photo sphere …" over ic_photosphere_blanket with the
   bottom progress bar follows Done, then the PANO_ picture joins the camera roll.
   Without sensors the camera turns by dragging the preview (the 7.1 simulator's capture model): the targets are three
   rings of eight 45 degrees apart around the horizon; a target held in the circle for 350 ms is taken; a full set ends
   the capture by itself.
   The picture is an equirectangular 2:1 image of the scene where frames were taken, grey elsewhere. In Photos a touch
   on it opens the photo sphere view ("Loading photo sphere…" first, PlusOne's loading_panorama), where dragging looks
   around. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (t, key) => { const row = window.StockStrings?.sphere?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language || 'en', key) : t(key); };
  const icon = name => `assets/gcam-${name}.png`;
  // One step is 45 degrees; the screen width spans SPAN units.
  const STEP = .34, COLS = 8, ROWS = [0, -STEP, STEP], TURN = COLS * STEP, SPAN = .8, HOLD = 350, PROCESS = 2200;
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
    if (g.state !== 'capture' || !aligned(g)) { g.alignedSince = null; return false; }
    if (g.alignedSince === null) g.alignedSince = now;
    if (now - g.alignedSince < HOLD) return false;
    const t = target(g); g.frames.push({col: t.col, row: t.row}); g.index++; g.alignedSince = null; return true;
  }
  const canSave = g => g.frames.length >= 2;
  const complete = g => g.index >= targets().length;
  const capturing = ui => !!ui.lpSphere?.frames?.length && ui.lpSphere.state === 'capture';
  // The shutter disc's icon and the cancel button for lp-camera.js's bottom bar.
  const shutterIcon = ui => capturing(ui) ? (canSave(ui.lpSphere) ? 'ic_done_normal' : 'ic_done_disabled') : 'ic_capture_pano';
  const cancelButton = (ui, t) => capturing(ui) ? `<button type="button" class="lps-cancel" data-lps-cancel aria-label="${e(S(t, 'Discard photo sphere'))}"><img src="${icon('ic_cancel_normal')}" alt=""></button>` : '<span></span>';

  function render(data, ui, t, media) {
    const g = ui.lpSphere ||= start(), scene = media.scene(data);
    if (g.state === 'process') return `<div class="gpano lps-process" data-gpano="process" data-lps data-state="process"><div class="gpano-card"><img src="${icon('ic_photosphere_blanket')}" alt=""><span>${e(S(t, 'Processing photo sphere …'))}</span><span class="gpano-progress"><i class="lps-progress"></i></span></div></div>`;
    const world = media.image({...scene, sphere: true, frames: 'all'}), shot = g.frames.length ? media.sphereImage({...scene, frames: g.frames}, true) : '';
    return `<div class="lps" data-lps data-state="capture" data-frames="${g.frames.length}">
      <div class="lps-world" data-lps-layer style="background-image:url('${world}')"></div>${shot ? `<div class="lps-shot" data-lps-layer style="background-image:url('${shot}')"></div>` : ''}
      <i class="lps-circle" data-lps-circle></i>
      <img class="lps-target" data-lps-target src="${icon('pano_target_default')}" alt="">
      <img class="lps-hint" data-lps-hint src="${icon('pano_alignhint_up')}" alt="" hidden>
      <p class="lps-msg" data-lps-msg data-align="${e(S(t, 'To start, keep dot inside circle'))}" data-fast="${e(S(t, 'Too fast'))}">${g.frames.length ? '' : e(S(t, 'To start, keep dot inside circle'))}</p>
    </div>`;
  }
  // The capture: drags turn the camera, a frame loop takes the targets; the processing runs on from ui.lpSphere.at.
  function attach(root, {ui, rerender, shoot}) {
    const g = ui.lpSphere, el = root.querySelector('[data-lps]');
    if (!g || !el) return {shutter() {}, destroy() {}};
    let destroyed = false, frame = 0, drag = null;
    const node = sel => el.querySelector(sel);
    const finish = () => { g.state = 'process'; g.at = performance.now(); cancelAnimationFrame(frame); rerender(); };
    const discard = () => { ui.lpSphere = start(); rerender(); };
    if (g.state === 'process') {
      const process = now => {
        if (destroyed || g.state !== 'process') return;
        const k = Math.min(1, (now - g.at) / PROCESS), bar = el.querySelector('.lps-progress');
        if (bar) bar.style.width = `${k * 100}%`;
        if (k < 1) { frame = requestAnimationFrame(process); return; }
        const frames = g.frames; ui.lpSphere = start(); shoot({sphere: frames}); rerender();
      };
      frame = requestAnimationFrame(process);
      return {shutter() {}, destroy() { destroyed = true; cancelAnimationFrame(frame); }};
    }
    function paint(now = performance.now()) {
      const w = el.clientWidth, h = el.clientHeight, px = w / SPAN, bandW = TURN * px, bandH = bandW / 2;
      const position = `${w / 2 - g.x * px}px ${h / 2 - bandH / 2 - g.y * px}px`;
      el.querySelectorAll('[data-lps-layer]').forEach(layer => { layer.style.backgroundSize = `${bandW}px ${bandH}px`; layer.style.backgroundPosition = position; });
      const o = offset(g), on = aligned(g), dot = node('[data-lps-target]'), hint = node('[data-lps-hint]');
      if (o) { const x = w / 2 + o.dx * px, y = h / 2 + o.dy * px; dot.hidden = false; dot.src = icon(on ? 'pano_target_activated' : 'pano_target_default'); dot.style.left = `${x}px`; dot.style.top = `${y}px`; hint.hidden = y > 0 && y < h; hint.src = icon(y <= 0 ? 'pano_alignhint_up' : 'pano_alignhint_down'); hint.classList.toggle('down', y >= h); }
      else { dot.hidden = true; hint.hidden = true; }
      const msg = node('[data-lps-msg]');
      msg.textContent = g.tooFast > now ? msg.dataset.fast : g.frames.length ? '' : msg.dataset.align;
      el.dataset.aligned = String(on);
    }
    function loop(now) {
      if (destroyed) return;
      if (tick(g, now)) { if (complete(g)) { finish(); return; } rerender(); return; }
      paint(now); frame = requestAnimationFrame(loop);
    }
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
    const cancel = event => { if (event.target.closest('[data-lps-cancel]')) { event.stopPropagation(); discard(); } };
    root.addEventListener('click', cancel, true);
    paint(); frame = requestAnimationFrame(loop);
    return {shutter() { if (canSave(g)) finish(); }, destroy() { destroyed = true; cancelAnimationFrame(frame); root.removeEventListener('click', cancel, true); }};
  }
  // Back while capturing throws the sphere away.
  function back(ui) { if (!capturing(ui)) return false; ui.lpSphere = start(); return true; }
  // The photo sphere view: "Loading photo sphere…" first, then the picture as a band 1.3 screens high.
  function viewer(photo, media, t) {
    return `<div class="app-view lps-viewer" data-sph-viewer><div class="lps-band" data-sph-band role="img" aria-label="${e(photo.name)}" style="background-image:url('${media.image(photo)}')"></div><p class="lps-loading" data-lps-loading>${e(S(t, 'Loading photo sphere…'))}</p></div>`;
  }
  function attachViewer(root) {
    const band = root.querySelector('[data-sph-band]');
    if (!band || band.dataset.bound) return;
    band.dataset.bound = '1';
    // The first frame (yaw 0, the picture's left edge) faces the viewer.
    let yaw = band.clientWidth / 2, pitch = -band.clientHeight * .15, drag = null;
    const paint = () => { const h = band.clientHeight * 1.3, w = h * 2; pitch = Math.max(band.clientHeight - h, Math.min(0, pitch)); band.style.backgroundSize = `${w}px ${h}px`; band.style.backgroundPosition = `${yaw}px ${pitch}px`; };
    band.addEventListener('pointerdown', event => { drag = {id: event.pointerId, x: event.clientX, y: event.clientY, yaw, pitch}; try { band.setPointerCapture(event.pointerId); } catch {} });
    band.addEventListener('pointermove', event => { if (!drag || event.pointerId !== drag.id) return; const k = band.getBoundingClientRect().width / band.clientWidth || 1; yaw = drag.yaw + (event.clientX - drag.x) / k; pitch = drag.pitch + (event.clientY - drag.y) / k; paint(); });
    const up = () => { drag = null; };
    band.addEventListener('pointerup', up); band.addEventListener('pointercancel', up);
    paint();
  }
  window.LPSphere = {STEP, COLS, SPAN, HOLD, targets, start, target, offset, aligned, move, tick, canSave, complete, capturing, shutterIcon, cancelButton, render, attach, back, viewer, attachViewer};
})();
