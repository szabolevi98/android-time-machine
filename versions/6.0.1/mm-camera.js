/* Android 6.0.1 Camera (Google Camera 3.1.024, app/GoogleCamera of MTC20K), the app 'camera'. The viewfinder shows
   the simulator's own drawn scene (mm-media.js); pictures go to MM.media's photos for Photos.
   - Full screen (no status bar). The 4:3 preview at the top, the bottom bar below in camera_gray_background #1b1b1b
     (shutter_button_background_still): bottom_bar_side_controls.xml's CameraSwitchButton (ic_switch_camera_back /
     _front, 48 dp, 36 dp in), the shutter in the mode's theme colour (camera_mode_theme_color: camera #4285f4, video
     #db4437, Lens Blur #0f9d58, Photo Sphere #ab47bc, Panorama #ff9e00) with its camera_mode_shutter_icon, and the
     RoundedThumbnailView (54 dp, 25 dp from the edge) of the last picture.
   - mode_options.xml at the top right (56 dp): the exposure, countdown (ic_timer_off / 3s / 10s), HDR+ (ic_hdr_plus_off /
     on / auto) and flash (ic_flash_off / auto / on) toggles, cycling through their arrays (the default flash auto,
     HDR+ auto); HamburgerMenu at the top left opens the mode list (camera_modes_in_nav_drawer: Photo Sphere, Panorama,
     Lens Blur, then Camera, Video and Settings; mode_selector items 60 dp with the 56 dp icon block, 16 sp white).
   - Taking a picture flashes the preview, a countdown runs first when set; Video records with the elapsed time and saves
     a clip when stopped. */
(() => {
  'use strict';
  const T = () => MM.text('camera');
  const A = n => `assets/cm-${n}.png`;
  const MODES = {camera: ['mode_camera', '#4285f4', 'ic_camera_normal', 'ic_capture_camera_normal'], video: ['mode_video', '#db4437', 'ic_video_normal', 'ic_capture_video'],
    refocus: ['mode_refocus', '#0f9d58', 'ic_refocus_normal', 'ic_capture_refocus'], photosphere: ['mode_photosphere', '#ab47bc', 'ic_photosphere_normal', 'ic_capture_camera_normal'],
    panorama: ['mode_panorama', '#ff9e00', 'ic_panorama_normal', 'ic_capture_pano']};
  const FLASH = ['ic_flash_off_normal', 'ic_flash_auto_normal', 'ic_flash_on_normal'], HDR = ['ic_hdr_plus_off_normal', 'ic_hdr_plus_on_normal', 'ic_hdr_plus_auto_normal'], TIMER = ['ic_timer_off_normal', 'ic_timer_3s_normal', 'ic_timer_10s_normal'];
  const S = c => c.data.camera || (c.data.camera = {flash: 1, hdr: 2, timer: 0, front: false, mode: 'camera'});
  const ui = c => c.ui.camera || (c.ui.camera = {modes: false, rec: 0, count: 0, seed: Math.floor(Math.random() * 1000)});
  const esc = (c, s) => c.safe(s);
  const elapsed = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };

  function render(c) {
    const t = T(), s = S(c), u = ui(c), [, color, , shutterIcon] = MODES[s.mode], last = MM.media.photos(c).at(-1);
    const ev = s.exposure || 0, EV = ['n2', 'n1', '0', 'p1', 'p2'];
    const preview = MM.media.svg({id: 'vf', seed: u.seed, time: Date.now(), front: s.front}, 'mmcm-scene').replace('<svg ', `<svg style="filter:brightness(${(1 + ev * 0.22).toFixed(2)})" `);
    // The exposure button opens the compensation row in the options' place (-2 … +2, exposure_compensation_desc_*);
    // a value other than 0 shows on the button and brightens or darkens the preview.
    const opts = s.mode === 'video' ? '' : u.exposure ? `<div class="mmcm-opts ev">${EV.map((k, i) => `<button type="button" class="${i - 2 === ev ? 'on' : ''}" data-action="mmcm-ev" data-ev="${i - 2}" aria-label="${esc(c, t.t(`exposure_compensation_desc_${k}`))}"><img src="${A(`ic_exposure_${k}`)}" alt=""></button>`).join('')}</div>` : `<div class="mmcm-opts" aria-label="${esc(c, t.t('accessibility_mode_options'))}">
      <button type="button" data-action="mmcm-exposure" aria-label="${esc(c, t.t('manual_exposure_compensation_desc'))}"><img src="${A(ev ? `ic_exposure_${EV[ev + 2]}` : 'ic_exposure_normal')}" alt=""></button>
      <button type="button" data-action="mmcm-timer" aria-label="${esc(c, t.t('countdown_duration_descriptions')[s.timer])}"><img src="${A(TIMER[s.timer])}" alt=""></button>
      <button type="button" data-action="mmcm-hdr" aria-label="${esc(c, t.t('hdr_plus_descriptions')[s.hdr])}"><img class="hdr" src="${A(HDR[s.hdr])}" alt=""></button>
      <button type="button" data-action="mmcm-flash" aria-label="${esc(c, t.t('camera_flash_descriptions')[s.flash])}"><img src="${A(FLASH[s.flash])}" alt=""></button></div>`;
    const modes = u.modes ? `<div class="mmcm-mscrim" data-action="mmcm-modes"></div><div class="mmcm-modes">${['photosphere', 'panorama', 'refocus', 'camera', 'video'].map(m => `<button type="button" class="mmcm-mode${s.mode === m ? ' on' : ''}" data-action="mmcm-mode" data-m="${m}"><i style="${s.mode === m ? `background:${MODES[m][1]}` : ''}"><img src="${A(MODES[m][2])}" alt=""></i><span>${esc(c, t.t(MODES[m][0]))}</span></button>`).join('')}
      <button type="button" class="mmcm-mode" data-action="mmcm-settings"><i><img src="${A('ic_settings_normal_nopadding')}" alt=""></i><span>${esc(c, t.t('mode_settings'))}</span></button></div>` : '';
    return `<div class="mmcm"><div class="mmcm-preview">${preview}<i class="mmcm-flashfx"></i>${u.count ? `<b class="mmcm-count">${u.count}</b>` : ''}${u.rec ? `<span class="mmcm-rec"><i></i>${elapsed(Date.now() - u.rec)}</span>` : ''}
      <button type="button" class="mmcm-burger" data-action="mmcm-modes" aria-label="${esc(c, t.t('mode_settings'))}"><i></i><i></i><i></i></button>${opts}</div>
      <div class="mmcm-bottom"><button type="button" class="mmcm-switch" data-action="mmcm-switch"><img src="assets/cm-ic_switch_camera_${s.front ? 'front' : 'back'}.svg" alt=""></button>
        <button type="button" class="mmcm-shutter${u.rec ? ' rec' : ''}" aria-live="polite" title="${u.rec ? esc(c, t.t('video_recording_started')) : ''}" style="background:${color}" data-action="mmcm-shutter" aria-label="${esc(c, t.t('accessibility_shutter_button'))}"><img src="${A(shutterIcon)}" alt=""></button>
        <button type="button" class="mmcm-thumb" data-action="mmcm-thumb">${last ? MM.media.svg(last, 'mmcm-tsvg', 1) : ''}</button></div>${modes}</div>`;
  }
  function flash(c) { c.el.viewport.querySelector('.mmcm-flashfx')?.animate([{opacity: 1}, {opacity: 0}], {duration: 300}); }
  function capture(c) {
    const s = S(c), u = ui(c);
    if (s.mode === 'video') {
      if (!u.rec) { u.rec = Date.now(); tick(c); c.render(); return; }
      MM.media.add(c, {seed: u.seed, time: Date.now(), front: s.front, kind: 'video', duration: Date.now() - u.rec}); u.rec = 0; c.render(); return;
    }
    const shoot = () => { u.count = 0; MM.media.add(c, {seed: u.seed, time: Date.now(), front: s.front, kind: s.mode === 'panorama' ? 'pano' : 'photo'}); c.render(); flash(c); c.el.viewport.querySelector('.mmcm-thumb')?.animate([{transform: 'scale(.6)'}, {transform: 'scale(1)'}], {duration: 250}); };
    const secs = [0, 3, 10][s.timer];
    if (!secs) return shoot();
    u.count = secs; c.render();
    const iv = setInterval(() => { if (c.ui.view !== 'camera') { clearInterval(iv); u.count = 0; return; } u.count--; if (u.count <= 0) { clearInterval(iv); shoot(); } else c.render(); }, 1000);
  }
  let timer = 0;
  function tick(c) { clearInterval(timer); timer = setInterval(() => { const u = ui(c); if (!u.rec || c.ui.view !== 'camera') { clearInterval(timer); return; } const el = c.el.viewport.querySelector('.mmcm-rec'); if (el) el.lastChild.textContent = elapsed(Date.now() - u.rec); }, 500); }

  MM.register('camera', {
    noStatus: () => true,
    statusColor: () => '#000',
    render,
    back(c) { const u = ui(c); if (u.modes) { u.modes = false; c.render(); return true; } if (u.rec) { capture(c); return true; } return false; },
    action(name, el, event, c) {
      const s = S(c), u = ui(c);
      switch (name) {
        case 'mmcm-shutter': capture(c); return true;
        case 'mmcm-switch': s.front = !s.front; c.save(); c.render(); return true;
        case 'mmcm-flash': s.flash = (s.flash + 1) % 3; c.save(); c.render(); return true;
        case 'mmcm-hdr': s.hdr = (s.hdr + 1) % 3; c.save(); c.render(); return true;
        case 'mmcm-timer': s.timer = (s.timer + 1) % 3; c.save(); c.render(); return true;
        case 'mmcm-exposure': ui(c).exposure = true; c.render(); return true;
        case 'mmcm-ev': S(c).exposure = +el.dataset.ev; ui(c).exposure = false; c.save(); c.render(); return true;
        case 'mmcm-modes': u.modes = !u.modes; c.render(); return true;
        case 'mmcm-mode': s.mode = el.dataset.m; u.modes = false; c.save(); c.render(); return true;
        case 'mmcm-settings': u.modes = false; MM.openPrefs(c, 'camera', 'camera_preferences'); return true;
        case 'mmcm-thumb': { const last = MM.media.photos(c).at(-1); if (last) c.open('photos', `photo:${last.id}`); return true; }
      }
      return false;
    }
  });
})();
