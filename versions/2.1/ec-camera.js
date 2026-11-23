/* Android 2.1 Camera (Camera.apk, ERE27): landscape only (screenOrientation 0, full screen), so with the phone held
   upright its layout is turned 90 degrees clockwise.
   - camera.xml on camera_background (bg_camera_pattern tiled): the PreviewFrameLayout (the preview kept at 4:3 in
     border_view_finder, btn_gripper at its left edge, the indicator bar 10 dp in: flash / white balance / focus icons
     from flash_icons, whitebalance_icons, focusmode_icons) and camera_control.xml's 76 dp control bar (margins 13 / 10
     dp): the 52 dp review thumbnail (border_last_picture) at the top, the camera / video Switcher (btn_mode_switch_bg,
     btn_mode_switch_knob, 70 dp) in the middle, the shutter (btn_shutter with btn_ic_camera_shutter, or
     btn_ic_video_record / _stop) at the bottom.
   - Pressing the shutter focuses (FocusRectangle: focus_focusing, then focus_focused) and takes the picture; the
     thumbnail takes it. In video mode the shutter starts / stops recording with the red indicator and the time.
   - The gripper or Menu › Settings opens OnScreenSettings (on_screen_menu.xml, on camera_background, gripper_handle):
     "Camera settings" over camera_preferences.xml's rows that the Nexus One's camera offers (Flash mode, White
     balance, Color effect, Store location, Picture size, Picture quality, Focus mode; no Scene mode), each opening its
     entries with radio buttons. Menu: Gallery, Settings.
   - IMAGE_CAPTURE / VIDEO_CAPTURE (EC.cameraCapture, e.g. Messaging's Capture picture / video): attach_camera_control.xml
     instead of the control bar: CANCEL at the top, the shutter at the bottom; once taken the picture stays on the
     preview, RETAKE (and PLAY for a video) join CANCEL and OK takes the shutter's place (ReviewControlIcon:
     btn_camera_review with the icon, ReviewControlText 12 sp under it). A captured picture goes back to the caller
     only (Mms gives an EXTRA_OUTPUT); a video is saved like any other.
   What the camera sees is the simulator's drawn scene (ec-media.js). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const C = () => EC.text('camera');
  // key, title, entries array, values, icons (indicator), default
  const PREFS = [
    ['flash', 'pref_camera_flashmode_title', 'pref_camera_flashmode_entries', ['auto', 'on', 'off'], ['ic_viewfinder_flash_auto', 'ic_viewfinder_flash_on', 'ic_viewfinder_flash_off'], 'auto'],
    ['wb', 'pref_camera_whitebalance_title', 'pref_camera_whitebalance_entries', ['auto', 'incandescent', 'daylight', 'fluorescent', 'cloudy-daylight'], [null, 'ic_viewfinder_wb_incandescent', 'ic_viewfinder_wb_daylight', 'ic_viewfinder_wb_fluorescent', 'ic_viewfinder_wb_cloudy'], 'auto'],
    ['effect', 'pref_camera_coloreffect_title', 'pref_camera_coloreffect_entries', ['none', 'mono', 'sepia', 'negative', 'solarize', 'posterize', 'aqua', 'pastel', 'mosaic', 'red-tint', 'blue-tint', 'green-tint'], null, 'none'],
    ['location', 'pref_camera_recordlocation_title', 'pref_camera_recordlocation_entries', ['off', 'on'], null, 'off'],
    ['size', 'pref_camera_picturesize_title', 'pref_camera_picturesize_entries', ['2592x1936', '2048x1536', '1600x1200', '1024x768'], null, '2592x1936'],
    ['quality', 'pref_camera_jpegquality_title', 'pref_camera_jpegquality_entries', ['superfine', 'fine', 'normal'], null, 'superfine'],
    ['focus', 'pref_camera_focusmode_title', 'pref_camera_focusmode_entries', ['auto', 'infinity', 'macro'], [null, 'ic_viewfinder_focus_infinity', 'ic_viewfinder_focus_macro'], 'auto']
  ];
  // The used phone's four pictures (docs/demo-data.md, item 8): the camera's own drawn scene (ec-media.js), taken over
  // the last days with the default settings. A save made before 2026-11-23 with no pictures gets them once.
  EC.defaults.photos = [61, 137, 214, 389].map((seed, i) => ({id: i + 1, seed, effect: 'none', wb: 'auto', size: '2592x1936', when: Date.now() - (9 - i * 2.5) * 86400000}));
  EC.defaults.demoPhotos = 1;
  EC.upgrades.push(['demo photos', (result, saved) => {
    if (saved.demoPhotos) return;
    if (!Array.isArray(saved.photos) || !saved.photos.length) result.photos = JSON.parse(JSON.stringify(EC.defaults.photos));
    result.demoPhotos = 1;
  }]);
  const prefs = c => ({...Object.fromEntries(PREFS.map(p => [p[0], p[5]])), ...(c.data.cameraPrefs || {})});
  // The entries array for size has the 2592x1944 / 2592x1936 pair; the phone offers one of them.
  const entries = (p, c) => { const list = C().t(p[2]); return p[0] === 'size' ? [list[0], ...list.slice(2)] : list; };
  let frame = 0, focus = '', recording = null, video = false;

  // Capture mode: c.ui.capture = {video, onDone(item), taken}.
  const review = (action, icon, label) => `<button type="button" class="eccm-review" data-action="${action}"><span class="eccm-review-icon"><i class="ec-bg np-cm-btn_camera_review_normal"></i><i class="ec-bg ec-pressed np-cm-btn_camera_review_pressed"></i><img src="assets/cm-${icon}.png" alt=""></span><span>${esc(C().t(label))}</span></button>`;
  function captureControl(c) {
    const cap = c.ui.capture, taken = cap.taken;
    return `<div class="eccm-control eccm-attach"><div class="eccm-review-top">${review('eccm-cap-cancel', 'btn_ic_review_cancel', 'review_cancel')}
        ${taken ? review('eccm-cap-retake', cap.video ? 'btn_ic_review_retake_video' : 'btn_ic_review_retake_photo', 'review_retake') : ''}${taken && cap.video ? review('eccm-cap-play', 'btn_ic_review_play', 'review_play') : ''}</div>
      ${taken ? review('eccm-cap-ok', 'btn_ic_review_done', 'review_ok') : `<button type="button" class="eccm-shutter" data-action="eccm-shutter"><img class="bg" src="assets/cm-btn_shutter_normal.png" alt=""><img class="bg pressed" src="assets/cm-btn_shutter_pressed.png" alt=""><img class="ic" src="assets/cm-${video ? (recording ? 'btn_ic_video_record_stop' : 'btn_ic_video_record') : 'btn_ic_camera_shutter'}.png" alt=""></button>`}</div>`;
  }
  EC.cameraCapture = (c, {video: v = false, onDone}) => { c.ui.capture = {video: v, onDone, taken: null}; video = v; c.ui.cameraMenu = null; c.open('camera'); };
  function render(c) {
    const s = prefs(c), last = (c.data.photos || []).at(-1);
    const icons = PREFS.filter(p => p[4]).map(p => p[4][p[3].indexOf(s[p[0]])]).filter(Boolean);
    const menu = c.ui.cameraMenu ? settingsPanel(c, s) : '';
    return `<div class="eccm"><div class="eccm-land">
      <div class="eccm-frame-layout"><img class="eccm-gripper" src="assets/cm-btn_gripper.png" alt="" data-action="eccm-menu">
        <div class="eccm-frame npp-cm-border_view_finder"><i class="ec-bg np-cm-border_view_finder"></i><canvas class="eccm-preview"></canvas>
          <div class="eccm-indicators">${icons.map(i => `<img src="assets/cm-${i}.png" alt="">`).join('')}</div>
          ${focus ? `<i class="eccm-focus np-cm-${focus}"></i>` : ''}
          ${recording ? `<div class="eccm-rec"><img src="assets/cm-ic_recording_indicator.png" alt=""><span>${esc(clock(Date.now() - recording))}</span></div>` : ''}</div></div>
      ${c.ui.capture ? captureControl(c) : `<div class="eccm-control">
        <button type="button" class="eccm-thumb npp-cm-border_last_picture_normal" data-action="eccm-review"${last ? '' : ' disabled'}><i class="ec-bg np-cm-border_last_picture_normal"></i><i class="ec-bg ec-pressed np-cm-border_last_picture_pressed"></i>${last ? `<img src="${EC.media.url(last, 120)}" alt="">` : ''}</button>
        <div class="eccm-switch-set"><img src="assets/cm-btn_ic_mode_switch_video.png" alt=""><button type="button" class="eccm-switch" data-action="eccm-switch"><i class="ec-bg np-cm-btn_mode_switch_bg"></i><img class="eccm-knob${video ? ' up' : ''}" src="assets/cm-btn_mode_switch_knob_normal.png" alt=""></button><img src="assets/cm-btn_ic_mode_switch_camera.png" alt=""></div>
        <button type="button" class="eccm-shutter" data-action="eccm-shutter"><img class="bg" src="assets/cm-btn_shutter_normal.png" alt=""><img class="bg pressed" src="assets/cm-btn_shutter_pressed.png" alt=""><img class="ic" src="assets/cm-${video ? (recording ? 'btn_ic_video_record_stop' : 'btn_ic_video_record') : 'btn_ic_camera_shutter'}.png" alt=""></button></div>`}
      ${menu}</div></div>`;
  }
  const clock = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  function settingsPanel(c, s) {
    const open = c.ui.cameraMenu;
    let list;
    if (open === true) {
      list = `<div class="eccm-mhead">${esc(C().t(video ? 'pref_camcorder_settings_category' : 'pref_camera_settings_category'))}</div>${PREFS.map(p => `<button type="button" class="eccm-mrow" data-action="eccm-pref" data-key="${p[0]}"><span class="t1">${esc(C().t(p[1]))}</span><span class="t2">${esc(entries(p, c)[p[3].indexOf(s[p[0]])] || '')}</span></button>`).join('')}`;
    } else {
      const p = PREFS.find(x => x[0] === open);
      list = `<div class="eccm-mhead">${esc(C().t(p[1]))}</div>${p[3].map((v, i) => `<button type="button" class="eccm-mrow sub" data-action="eccm-pick" data-key="${p[0]}" data-value="${v}">${p[4]?.[i] ? `<img src="assets/cm-${p[4][i]}.png" alt="">` : ''}<span class="t1">${esc(entries(p, c)[i])}</span><img class="radio" src="assets/fw-btn_radio_${s[p[0]] === v ? 'on' : 'off'}.png" alt=""></button>`).join('')}`;
    }
    return `<div class="eccm-menu"><div class="eccm-mlist">${list}</div><i class="eccm-handle np-cm-gripper_handle" data-action="eccm-menu"></i></div>`;
  }
  function loop(c) {
    cancelAnimationFrame(frame);
    const cv = c.el.viewport.querySelector('.eccm-preview');
    if (!cv) return;
    const s = prefs(c), taken = c.ui.capture?.taken;
    // A taken picture stays on the preview.
    if (taken) { EC.media.draw(cv, {seed: taken.seed, effect: taken.effect, wb: taken.wb, t: 0}); return; }
    const step = t => {
      if (!cv.isConnected) return;
      EC.media.draw(cv, {seed: c.ui.cameraSeed, effect: s.effect, wb: s.wb, t});
      frame = requestAnimationFrame(step);
    };
    step(performance.now());
  }
  function shoot(c) {
    if (video) {
      if (recording) {
        const item = {id: Date.now(), seed: c.ui.cameraSeed, effect: prefs(c).effect, wb: prefs(c).wb, video: Math.round((Date.now() - recording) / 1000), when: Date.now()};
        c.data.photos = [...(c.data.photos || []), item]; recording = null; c.save();
        if (c.ui.capture) c.ui.capture.taken = item;
      }
      else recording = Date.now();
      c.render(); return;
    }
    if (focus) return;
    focus = 'focus_focusing'; c.render();
    setTimeout(() => {
      focus = 'focus_focused'; c.render();
      setTimeout(() => {
        const s = prefs(c), item = {id: Date.now(), seed: c.ui.cameraSeed, effect: s.effect, wb: s.wb, size: s.size, when: Date.now()};
        if (c.ui.capture) c.ui.capture.taken = item; else c.data.photos = [...(c.data.photos || []), item];
        c.ui.cameraSeed = (c.ui.cameraSeed * 7 + 13) % 99991 + 1;   // the next view
        focus = ''; c.save(); c.render();
      }, 350);
    }, 600);
  }
  EC.register('camera', {
    title: 'Camera',
    noStatus: () => true,
    render(c) { if (!c.ui.cameraSeed) c.ui.cameraSeed = 1 + Math.floor(Math.random() * 99990); return render(c); },
    mount(c, root) {
      const cv = root.querySelector('.eccm-preview');
      if (cv) { const r = cv.getBoundingClientRect(), ratio = window.devicePixelRatio || 1; cv.width = Math.round(Math.max(r.width, r.height) * ratio / 2); cv.height = Math.round(cv.width * 3 / 4); }
      loop(c);
      if (recording) setTimeout(() => { if (recording && c.ui.view === 'camera') c.render(); }, 1000);
    },
    action(name, el, event, c) {
      switch (name) {
        case 'eccm-shutter': shoot(c); return true;
        case 'eccm-cap-cancel': c.back(); return true;
        case 'eccm-cap-retake': c.ui.capture.taken = null; c.render(); return true;
        case 'eccm-cap-play': { const i = (c.data.photos || []).indexOf(c.ui.capture.taken); if (i >= 0) { c.ui.galleryOpen = i; c.ui.galleryMenu = false; c.open('gallery', 'photo'); } return true; }
        case 'eccm-cap-ok': { const {onDone, taken} = c.ui.capture; c.back(); onDone?.(taken); return true; }
        case 'eccm-switch': if (!recording) { video = !video; c.render(); } return true;
        case 'eccm-review': c.ui.galleryOpen = (c.data.photos || []).length - 1; c.ui.galleryMenu = false; c.open('gallery', 'photo'); return true;
        case 'eccm-menu': c.ui.cameraMenu = c.ui.cameraMenu ? null : true; c.render(); return true;
        case 'eccm-pref': c.ui.cameraMenu = el.dataset.key; c.render(); return true;
        case 'eccm-pick': c.data.cameraPrefs = {...(c.data.cameraPrefs || {}), [el.dataset.key]: el.dataset.value}; c.ui.cameraMenu = true; c.save(); c.render(); return true;
      }
      return false;
    },
    menu(c) {
      c.menu([{label: C().t('camera_gallery_photos_text'), icon: 'cm-ic_menu_camera_video_view.png', action: () => c.open('gallery')},
        {label: C().t('settings'), icon: 'fw-ic_menu_preferences.png', action: () => { c.ui.cameraMenu = true; c.render(); }}]);
      return true;
    },
    back(c) {
      if (c.ui.cameraMenu) { c.ui.cameraMenu = c.ui.cameraMenu === true ? null : true; c.render(); return true; }
      cancelAnimationFrame(frame); recording = null; focus = '';
      if (c.ui.capture) { c.ui.capture = null; video = false; }
      return false;
    }
  });
})();
