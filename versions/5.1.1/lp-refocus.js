/* Lens Blur in Google Camera 2.4 (com.google.android.apps.refocus, Nexus 6 LMY48Y) and its viewer.
   refocus_module.xml: over the preview the 22 sp white refocus_instructions ("Slowly raise your device. Keep subject
   centered.") 28 dp from the top, RefocusProgressView (100 x 150 dp) in the middle and refocus_successful (200 dp) when
   the sweep is complete. The shutter (ic_capture_refocus on the mode's #0F9D58) starts it; while capturing, the bottom
   bar's shutter_cancel_button (ic_cancel on shutter_button_background_refocus) takes the shutter's place and stops it
   without saving, as Back does. RefocusProgressView is drawn natively: here the refocus_arrow_bottom dot, a white line
   growing upwards with the sweep and refocus_arrow_top at its head. Then the camera processes over ic_refocus_blanket
   with the bottom progress bar and the picture joins the camera roll.
   Without sensors raising the phone is a drag upwards on the preview (the 7.1 simulator's capture model): a sideways
   or too fast drag does not count.
   The viewer is RefocusActivity's viewer_activity.xml: the done_button (ic_done_normal, 48 dp, and "Done") at the
   top, the picture (RGBZView: a touch sets the focus, RGBZFocusControls' ring), RefocusBokehControlBar (48 dp: the
   blur, its 20 dp white refocus_bokeh_control_bar_dot). Done keeps the new focus and blur; Back leaves them. In the
   image it opens from the camera's filmstrip; here from the picture in Photos (the camera's review opens Photos). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (t, key) => { const row = window.StockStrings?.refocus?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language || 'en', key) : t(key); };
  const icon = name => `assets/gcam-${name}.png`;
  const SUCCESS = 700, PROCESS = 1800;
  const idle = () => ({state: 'idle', travel: 0});
  const capturing = ui => ui.lpRefocus?.state === 'capture';
  // A drag of dy (screen px, upwards negative) over dt ms; distance is the sweep a full capture needs.
  function move(g, dx, dy, dt, distance) {
    if (g.state !== 'capture') return false;
    if (Math.hypot(dx, dy) / Math.max(16, dt) > 1.6 || Math.abs(dx) > Math.abs(dy) * 1.2 + 8) return false;
    g.travel = Math.max(0, Math.min(distance, g.travel - dy));
    if (g.travel >= distance) { g.state = 'success'; return true; }
    return false;
  }
  const shutterIcon = ui => capturing(ui) ? 'ic_cancel_normal' : 'ic_capture_refocus';
  function render(data, ui, t) {
    const g = ui.lpRefocus ||= idle();
    if (g.state === 'capture') return `<div class="lpr" data-lpr data-state="capture"><p class="lpr-msg">${e(S(t, 'Slowly raise your device.\nKeep subject centered.')).replace(/\n/g, '<br>')}</p><div class="lpr-progress"><i class="lpr-line" data-lpr-line></i><img class="lpr-head" data-lpr-head src="${icon('refocus_arrow_top')}" alt=""><img class="lpr-tail" src="${icon('refocus_arrow_bottom')}" alt=""></div></div>`;
    if (g.state === 'success') return `<div class="lpr" data-lpr data-state="success"><img class="lpr-success" src="${icon('refocus_successful')}" alt=""></div>`;
    if (g.state === 'process') return `<div class="gpano lpr-process" data-gpano="process" data-lpr data-state="process"><div class="gpano-card"><img src="${icon('ic_refocus_blanket')}" alt=""><span class="gpano-progress"><i class="lpr-bar"></i></span></div></div>`;
    return '';
  }
  // The capture: drags raise the "camera"; success and processing run on from ui.lpRefocus.at after a redraw.
  function attach(root, {ui, rerender, shoot}) {
    const g = ui.lpRefocus, el = root.querySelector('[data-lpr]');
    let destroyed = false, frame = 0, timer = 0, drag = null;
    const stop = () => { destroyed = true; cancelAnimationFrame(frame); clearTimeout(timer); };
    if (!g || !el) return {shutter() { if (ui.lpRefocus?.state === 'idle' || !ui.lpRefocus) { ui.lpRefocus = {state: 'capture', travel: 0}; rerender(); } }, destroy: stop};
    if (g.state === 'success') { timer = setTimeout(() => { if (!destroyed) { g.state = 'process'; g.at = performance.now(); rerender(); } }, SUCCESS); return {shutter() {}, destroy: stop}; }
    if (g.state === 'process') {
      const tick = now => {
        if (destroyed) return;
        const k = Math.min(1, (now - g.at) / PROCESS), bar = el.querySelector('.lpr-bar');
        if (bar) bar.style.width = `${k * 100}%`;
        if (k < 1) { frame = requestAnimationFrame(tick); return; }
        ui.lpRefocus = idle(); shoot({refocus: true}); rerender();
      };
      frame = requestAnimationFrame(tick);
      return {shutter() {}, destroy: stop};
    }
    const distance = () => el.clientHeight * .25;
    const paint = () => { const k = Math.min(1, g.travel / distance()), line = el.querySelector('[data-lpr-line]'), head = el.querySelector('[data-lpr-head]'); line.style.height = `${k * 100}%`; head.style.bottom = `${k * 100}%`; el.dataset.progress = k.toFixed(2); };
    const down = event => { if (event.button > 0) return; event.stopPropagation(); drag = {id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now()}; try { el.setPointerCapture(event.pointerId); } catch {} };
    const moveEv = event => {
      if (!drag || event.pointerId !== drag.id) return;
      event.stopPropagation();
      const k = el.getBoundingClientRect().height / el.clientHeight || 1, now = performance.now();
      const done = move(g, (event.clientX - drag.x) / k, (event.clientY - drag.y) / k, now - drag.at, distance());
      drag = {...drag, x: event.clientX, y: event.clientY, at: now};
      if (done) { drag = null; rerender(); return; }
      paint();
    };
    const up = event => { if (drag && event.pointerId === drag.id) { event.stopPropagation(); drag = null; } };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', moveEv); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    paint();
    // The shutter's place holds Cancel while capturing.
    return {shutter() { ui.lpRefocus = idle(); rerender(); }, destroy: stop};
  }
  // Back while capturing stops it without saving.
  function back(ui) { if (!capturing(ui)) return false; ui.lpRefocus = idle(); return true; }

  // The viewer, editing ui.refocusEdit ({focus: [x, y], strength}) of the photo.
  function viewer(photo, media, t, edit) {
    const shown = {...photo, refocus: edit};
    return `<div class="app-view lpr-viewer" data-lpr-viewer><button type="button" class="lpr-done" data-action="photos-refocus-done"><img src="${icon('ic_done_normal')}" alt=""><span>${e(S(t, 'Done'))}</span></button><div class="lpr-picture" data-lpr-picture><img src="${media.image(shown)}" alt="${e(photo.name)}" draggable="false"></div><div class="lpr-bokeh"><input type="range" min="0" max="1" step="0.01" value="${edit.strength}" data-lpr-strength aria-label="${e(S(t, 'To adjust blur, drag slider'))}"></div></div>`;
  }
  // A touch on the picture moves the focus there (the ring shows it); the bar sets the blur. The picture redraws in place.
  function attachViewer(root, {photo, edit, media}) {
    const area = root.querySelector('[data-lpr-picture]'), img = area?.querySelector('img'), range = root.querySelector('[data-lpr-strength]');
    if (!area || area.dataset.bound) return;
    area.dataset.bound = '1';
    const redraw = () => { img.src = media.image({...photo, refocus: edit}); };
    range.addEventListener('input', () => { edit.strength = Number(range.value); redraw(); });
    area.addEventListener('click', event => {
      const r = img.getBoundingClientRect(), w = img.naturalWidth || 4, h = img.naturalHeight || 3, k = Math.min(r.width / w, r.height / h);
      const cw = w * k, ch = h * k, left = r.left + (r.width - cw) / 2, top = r.top + (r.height - ch) / 2;
      const x = (event.clientX - left) / cw, y = (event.clientY - top) / ch;
      if (x < 0 || x > 1 || y < 0 || y > 1) return;
      edit.focus = [Math.round(x * 1000) / 1000, Math.round(y * 1000) / 1000]; redraw();
      const box = area.getBoundingClientRect(), s = box.width / area.clientWidth || 1, ring = document.createElement('i');
      ring.className = 'lpr-ring'; ring.style.left = `${(event.clientX - box.left) / s}px`; ring.style.top = `${(event.clientY - box.top) / s}px`;
      area.append(ring); setTimeout(() => ring.remove(), 700);
    });
  }
  window.LPRefocus = {SUCCESS, PROCESS, idle, capturing, move, shutterIcon, render, attach, back, viewer, attachViewer};
})();
