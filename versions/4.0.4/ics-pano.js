/* The Ice Cream Sandwich camera's panorama (PanoramaActivity of CameraGoogle 4.0.4, Galaxy Nexus IMM76I), held upright.
   pano_capture.xml: a PanoViewHorizontalBar on each side of the mosaic preview (weights 1 : 1.67 : 1; upright, one above
   and one below), the PanoProgressBar over ic_pan_progression (the lens-shaped window) in the first bar with the
   ic_pan_left / right_indicator arrows beside it while capturing (pano_progress_empty #2E2E2E, pano_progress_done #33525E,
   the pano_progress_indication #0099CC mark), "Capturing panorama" (pano_capture_indication) in the other bar, and
   camera_control.xml's shutter turned into btn_pan_shutter_holo (btn_pan_shutter_recording_holo while capturing). The
   shutter or the full sweep stops; pano_review.xml then shows "Saving…" (pano_review_saving_indication_str) over its
   progress bar, the result in the 240 dp mosaic area and the 12 sp CANCEL (review_cancel); the saved PANO_yyyyMMdd_HHmmss
   picture joins the Camera album, a cancelled one is dropped. The sweep is a demonstration: the preview pans across a
   panorama of the scene at a steady pace. Texts: stock-strings.js, group camera. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SWEEP = 160, DEGREES_PER_SECOND = 28, SAVE = 2200;
  const icon = name => `assets/camera-${name}.png`;
  const bar = kind => `<span class="icp-progress" data-icp-${kind}><span class="icp-done"></span><span class="icp-mark"></span><img src="${icon('ic_pan_progression')}" alt=""></span>`;
  function render(data, ui, S, media) {
    const p = ui.icsPano || {state: 'idle'}, pano = media.image({...media.scene(data), pano: true});
    if (p.state === 'review') return `<div class="icp icp-review" data-icp data-state="review">
      <div class="icp-saving"><span>${e(S('pano_review_saving_indication_str'))}</span>${bar('saving')}</div>
      <div class="icp-mosaic"><img src="${pano}" alt=""></div>
      <button type="button" class="icp-cancel" data-icp-cancel>${e(S('review_cancel'))}</button>
    </div>`;
    const capturing = p.state === 'capture';
    return `<div class="icp" data-icp data-state="${p.state}">
      <div class="icp-bar"><span class="icp-pan"${capturing ? '' : ' hidden'}><img src="${icon('ic_pan_left_indicator')}" alt="">${bar('pan')}<img src="${icon('ic_pan_right_indicator')}" alt=""></span></div>
      <div class="icp-area"><img class="icp-strip" data-icp-strip src="${pano}" alt=""></div>
      <div class="icp-bar"><span class="icp-capturing"${capturing ? '' : ' hidden'}><img src="${icon('ic_pan_recording_indicator')}" alt="">${e(S('pano_capture_indication'))}</span></div>
    </div>`;
  }
  // PanoramaActivity: the shutter starts and stops the sweep; saving runs on from the time kept in ui.icsPano, so a
  // redraw of the camera carries on where it was.
  function attach(root, {ui, rerender, shoot}) {
    let destroyed = false, frame = 0, last = 0;
    const p = ui.icsPano ||= {state: 'idle', angle: 0};
    const node = sel => root.querySelector(sel);
    const fill = (el, k) => { if (el) { el.querySelector('.icp-done').style.width = `${k * 100}%`; el.querySelector('.icp-mark').style.left = `${k * 100}%`; } };
    const paint = () => {
      const k = Math.min(1, p.angle / SWEEP), strip = node('[data-icp-strip]');
      fill(node('[data-icp-pan]'), k);
      if (strip) strip.style.transform = `translateX(${-k * Math.max(0, strip.offsetWidth - strip.parentNode.offsetWidth)}px)`;
    };
    const finish = () => { p.state = 'review'; p.reviewAt = performance.now(); rerender(); };
    const tick = now => {
      if (destroyed || p.state !== 'capture') return;
      p.angle = Math.min(SWEEP, p.angle + (now - last) / 1000 * DEGREES_PER_SECOND); last = now; paint();
      if (p.angle >= SWEEP) { finish(); return; }
      frame = requestAnimationFrame(tick);
    };
    const saving = now => {
      if (destroyed || p.state !== 'review') return;
      const k = Math.max(0, Math.min(1, (now - p.reviewAt) / SAVE));
      fill(node('[data-icp-saving]'), k);
      if (k < 1) { frame = requestAnimationFrame(saving); return; }
      ui.icsPano = {state: 'idle', angle: 0}; shoot({pano: true}); rerender();
    };
    const toggle = () => {
      if (p.state === 'idle') { p.state = 'capture'; p.angle = 0; rerender(); return; }
      if (p.state === 'capture') { cancelAnimationFrame(frame); finish(); }
    };
    root.addEventListener('click', event => { if (event.target.closest('[data-icp-cancel]')) { event.stopPropagation(); destroyed = true; cancelAnimationFrame(frame); ui.icsPano = {state: 'idle', angle: 0}; rerender(); } });
    paint();
    if (p.state === 'capture') { last = performance.now(); frame = requestAnimationFrame(tick); }
    if (p.state === 'review') frame = requestAnimationFrame(saving);
    return {toggle, destroy() { destroyed = true; cancelAnimationFrame(frame); }};
  }
  window.ICSPano = {render, attach, SWEEP};
})();
