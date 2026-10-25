/* Android 2.3.6 Camera (packages/apps/Camera). The activity is landscape-only (Theme.Black.NoTitleBar.Fullscreen); held
   upright, its layout appears turned 90 degrees clockwise while RotateImageView / RotatePane keep the icons and popups
   upright. So camera_control.xml's 76 dp control bar runs along the bottom (shutter left, the camera / video Switcher in
   the middle, the 52 dp review thumbnail right), the HeadUpDisplay IndicatorBar lies across the bottom of the
   border_view_finder preview (settings, GPS, white balance, flash, zoom, camera id from right to left), and the
   menu_popup lists open above it. Strings come from gb-strings-camera.js. hdpi px x 0.575, 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.camera), text = (lang, key) => R.t(key, lang), array = (lang, key) => R.array(key, lang);
  // camera_preferences.xml with the crespo values; the entry arrays line up with these values.
  const PREFS = {
    flash: {title: 'pref_camera_flashmode_title', entries: 'pref_camera_flashmode_entries', values: ['auto', 'on', 'off'], icon: v => `flash_${v}`},
    balance: {title: 'pref_camera_whitebalance_title', entries: 'pref_camera_whitebalance_entries', values: ['auto', 'incandescent', 'daylight', 'fluorescent', 'cloudy'], icon: v => `wb_${v}`},
    gps: {title: 'pref_camera_recordlocation_title', entries: null, values: ['on', 'off'], icon: v => `gps_${v}`},
    facing: {title: 'pref_camera_id_title', entries: null, values: ['back', 'front'], icon: v => `camera_facing_${v}`},
    focus: {title: 'pref_camera_focusmode_title', entries: 'pref_camera_focusmode_entries', values: ['auto', 'infinity', 'macro']},
    exposure: {title: 'pref_exposure_title', entries: null, values: ['2', '1', '0', '-1', '-2']},
    scene: {title: 'pref_camera_scenemode_title', entries: 'pref_camera_scenemode_entries', values: ['auto', 'action', 'portrait', 'landscape', 'night', 'night-portrait', 'theatre', 'beach', 'snow', 'sunset', 'steadyphoto', 'fireworks', 'party', 'candlelight']},
    size: {title: 'pref_camera_picturesize_title', entries: 'pref_camera_picturesize_entries', values: ['2592x1944', '2592x1936', '2560x1920', '2048x1536', '1600x1200', '1024x768', '640x480', '320x240']},
    quality: {title: 'pref_camera_jpegquality_title', entries: 'pref_camera_jpegquality_entries', values: ['superfine', 'fine', 'normal']},
    effect: {title: 'pref_camera_coloreffect_title', entries: 'pref_camera_coloreffect_entries', values: ['none', 'mono', 'sepia', 'negative', 'solarize', 'posterize', 'aqua']}
  };
  // The Nexus S rear camera: 5 MP (2560 x 1920), zoom ratios as reported by the crespo camera HAL.
  const DEFAULTS = {flash: 'auto', balance: 'auto', gps: 'off', facing: 'back', focus: 'auto', exposure: '0', scene: 'auto', size: '2560x1920', quality: 'superfine', effect: 'none', zoom: 1};
  const ZOOMS = [1, 1.2, 1.4, 1.6, 1.8, 2, 2.2, 2.4, 2.6, 2.8, 3, 3.2, 3.4, 3.6, 3.8, 4];
  const zoomText = z => `${Math.round(z * 10) / 10}x`;
  function settings(saved = {}) {
    const s = {...DEFAULTS, ...saved};
    // media.js keeps exposure as a number and the facing as a boolean.
    if (typeof saved.front === 'boolean') s.facing = saved.front ? 'front' : 'back';
    s.exposure = String(s.exposure);
    return s;
  }
  function label(key, value, lang) {
    const p = PREFS[key], i = p.values.indexOf(value);
    if (key === 'gps') return text(lang, `pref_camera_recordlocation_entry_${value}`);
    if (key === 'facing') return text(lang, `pref_camera_id_entry_${value}`);
    if (key === 'exposure') return Number(value) > 0 ? `+${value}` : value;
    return array(lang, p.entries)[i] ?? value;
  }
  const icon = (kind, name) => `assets/gb-cam-ic_${kind}_${name}.png`;

  // GLOptionHeader (#2b2b2b, 12 dip #979797) and GLOptionItem rows (18 dip white, icon, ic_menuselect_on / off).
  function list(key, s, lang) {
    const p = PREFS[key];
    return `<div class="gbcam-head">${e(text(lang, p.title))}</div>${p.values.map(v => `<button class="gbcam-opt" data-action="gbcam-set" data-id="${key}:${e(v)}">${p.icon ? `<img src="${icon('menuselect', p.icon(v))}" alt="">` : '<i></i>'}<span>${e(label(key, v, lang))}</span><img class="gbcam-tick" src="assets/gb-cam-ic_menuselect_${s[key] === v ? 'on' : 'off'}.png" alt=""></button>`).join('')}`;
  }
  function popup(ctx, s) {
    const T = key => text(ctx.lang, key), which = ctx.popup;
    if (!which) return '';
    let body;
    if (which === 'settings') body = ['focus', 'exposure', 'scene', 'size', 'quality', 'effect'].map(key => list(key, s, ctx.lang)).join('') + `<div class="gbcam-head">${e(T('pref_restore_title'))}</div><button class="gbcam-opt" data-action="gbcam-restore"><i></i><span>${e(T('pref_restore_detail'))}</span></button>`;
    else if (which === 'zoom') body = `<div class="gbcam-head">${e(T('zoom_control_title'))}</div><div class="gbcam-zoom"><input type="range" min="0" max="${ZOOMS.length - 1}" step="1" value="${Math.max(0, ZOOMS.indexOf(s.zoom))}" data-gbcam-zoom aria-label="${e(T('zoom_control_title'))}"><span>${e(zoomText(s.zoom))}</span></div>`;
    else body = list(which, s, ctx.lang);
    // HeadUpDisplay.layoutPopupWindow: the popup sits beside its indicator (above it when held upright), with the triangle
    // pointing at the indicator's centre and the window kept inside the view.
    const index = ['settings', 'gps', 'balance', 'flash', 'zoom', 'facing'].indexOf(which), width = (which === 'settings' ? 210 : which === 'zoom' ? 190 : 165) / .8625, ax = (100 - (index + .5) * 100 / 6).toFixed(3);
    return `<div class="gbcam-scrim" data-action="gbcam-popup-close"></div><div class="gbcam-popup at-${e(which)}" style="--ax:${ax}%;--w:calc(${width.toFixed(4)} * var(--dp))"><div class="gbcam-popup-list">${body}</div></div><i class="gbcam-triangle" style="--ax:${ax}%"></i>`;
  }
  // attach_camera_control.xml, the control bar of a capture request (Contacts' Take photo, Messaging's Capture picture /
  // video): CANCEL (with RETAKE and, for a video, PLAY once something is taken) at the top of the landscape bar, the
  // shutter at the bottom until a capture, then OK. Its ImageView / TextView groups do not rotate, so held upright they
  // read turned 90 degrees like the rest of the landscape layout. ReviewControlIcon: btn_camera_review behind the 36 dp
  // icon; ReviewControlText: 12 sp under it.
  const review = (lang, action, icon, label) => `<button class="gbcam-review" data-action="${action}"><span class="gbcam-review-icon"><img src="assets/gb-cam-${icon}.png" alt=""></span><span>${e(text(lang, label))}</span></button>`;
  function captureControl(ctx, video) {
    const cap = ctx.capture, taken = cap.taken, lang = ctx.lang;
    const bottom = taken ? review(lang, 'gbcam-cap-ok', 'btn_ic_review_done', 'review_ok') : `<button class="gbcam-shutter${ctx.recording ? ' stop' : ''}" data-action="gbcam-shutter" aria-label="${e(text(lang, video ? 'video_camera_label' : 'camera_label'))}"></button>`;
    return `<div class="gbcam-control capture">${bottom}<div class="gbcam-review-set">${review(lang, 'gbcam-cap-cancel', 'btn_ic_review_cancel', 'review_cancel')}${taken ? review(lang, 'gbcam-cap-retake', video ? 'btn_ic_review_retake_video' : 'btn_ic_review_retake_photo', 'review_retake') : ''}${taken && video ? review(lang, 'gbcam-cap-play', 'btn_ic_review_play', 'review_play') : ''}</div></div>`;
  }
  function render(ctx) {
    const T = key => text(ctx.lang, key), s = settings(ctx.saved), video = ctx.capture ? ctx.capture.video : ctx.mode === 'video', taken = ctx.capture?.taken;
    const scene = window.ICSMedia.scene({cameraSettings: {...ctx.saved, front: s.facing === 'front', zoom: s.zoom, balance: s.balance, exposure: Number(s.exposure)}});
    const last = ctx.last;
    // IndicatorBar order from CameraHeadUpDisplay: other settings, GPS, white balance, flash, zoom, camera id (top to bottom).
    const indicators = [
      ['settings', `<img src="assets/gb-cam-ic_viewfinder_settings.png" alt="">`, T('pref_camera_settings_category')],
      ['gps', `<img src="${icon('viewfinder', `gps_${s.gps}`)}" alt="">`, T('pref_camera_recordlocation_title')],
      ['balance', `<img src="${icon('viewfinder', `wb_${s.balance}`)}" alt="">`, T('pref_camera_whitebalance_title')],
      ['flash', `<img src="${icon('viewfinder', `flash_${s.flash}`)}" alt="">`, T('pref_camera_flashmode_title')],
      ['zoom', `<b>${e(zoomText(s.zoom))}</b>`, T('zoom_control_title')],
      ['facing', `<img src="${icon('viewfinder', `camera_facing_${s.facing}`)}" alt="">`, T('pref_camera_id_title')]
    ];
    const bar = `<div class="gbcam-iconbar">${indicators.map(([key, inner, title]) => `<button class="gbcam-ind${ctx.popup === key ? ' active' : ''}" data-action="gbcam-popup" data-id="${key}" aria-label="${e(title)}">${inner}</button>`).reverse().join('')}</div>`;
    const focus = ctx.focus ? `<span class="gbcam-focus ${e(ctx.focus)}"></span>` : '';
    const recording = video && ctx.recording ? `<div class="gbcam-rec"><img src="assets/gb-cam-ic_recording_indicator.png" alt=""><span>${e(ctx.recordTime || '00:00')}</span></div>` : '';
    const thumb = last ? `<img src="${window.ICSMedia.image(last)}" alt="">` : '';
    return `<div class="app-view gbcam${video ? ' video' : ''}" data-no-translate>
      <div class="gbcam-frame"><div class="gbcam-preview" data-action="gbcam-focus"><div class="gbcam-scene" style="filter:${taken ? 'none' : ctx.effectFilter || 'none'}">${window.ICSMedia.art(taken || scene)}</div>${focus}${recording}</div>${bar}</div>
      ${ctx.capture ? captureControl(ctx, video) : `<div class="gbcam-control">
        <button class="gbcam-shutter${ctx.recording ? ' stop' : ''}" data-action="gbcam-shutter" aria-label="${e(T(video ? 'video_camera_label' : 'camera_label'))}"></button>
        <div class="gbcam-switch-set"><img src="assets/gb-cam-btn_ic_mode_switch_camera.png" alt=""><button class="gbcam-switch${video ? ' video' : ''}" data-action="gbcam-mode" aria-label="${e(T(video ? 'switch_to_camera_lable' : 'switch_to_video_lable'))}"><i></i></button><img src="assets/gb-cam-btn_ic_mode_switch_video.png" alt=""></div>
        <button class="gbcam-thumb" data-action="camera-review" aria-label="${e(T('camera_gallery_photos_text'))}"${last ? '' : ' disabled'}>${thumb}</button>
      </div>`}${popup(ctx, s)}</div>`;
  }
  // Camera.addBaseMenuItems: Switch to video / camera, Gallery, Switch Camera (two cameras on the Nexus S). A capture
  // request has no options menu.
  function menu(ctx) {
    if (ctx.capture) return [];
    const T = key => text(ctx.lang, key), video = ctx.mode === 'video';
    return [{action: 'gbcam-mode', title: T(video ? 'switch_to_camera_lable' : 'switch_to_video_lable'), icon: video ? 'ic_menu_camera' : 'gb-cam-ic_menu_camera_video_view.png'}, {action: 'camera-review', title: T('camera_gallery_photos_text'), icon: 'gb-cam-ic_menu_gallery.png'}, {action: 'gbcam-switch-camera', title: T('switch_camera_id'), icon: 'ic_menu_camera'}];
  }
  // Colour effects as CSS filters on the preview.
  const EFFECTS = {none: 'none', mono: 'grayscale(1)', sepia: 'sepia(1)', negative: 'invert(1)', solarize: 'contrast(1.6) saturate(1.8)', posterize: 'contrast(2) saturate(1.4)', aqua: 'hue-rotate(160deg) saturate(1.2)'};
  window.GBCamera = {PREFS, DEFAULTS, ZOOMS, EFFECTS, text, array, settings, label, zoomText, render, menu};
})();
