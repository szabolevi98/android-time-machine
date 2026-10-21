/* Android 7.1.2 Camera (Google Camera 4.3.016, app/GoogleCamera of N2G48C), the app 'camera'. The viewfinder shows the
   simulator's own drawn scene (ng-media.js); pictures go to NG.media's photos for Photos. The logic is 6.0.1's (its
   camera module); the look and the behaviour are the image's (decompiled from GoogleCamera.odex):
   - Theme.Camera: no status bar, navigationBarColor default_system_ui_background (transparent), so the window reaches
     under the navigation bar. CaptureLayoutHelper places the preview and the bottom bar: the bottom bar is
     max(bottom_bar_height_min 142 dp, height − width × 4/3); a 4:3 preview (photo, Lens Blur, panoramas) fills the
     rest from the top, a 16:9 one (video, slow motion) the whole window with the bottom bar over it.
   - bottom_bar_layout.xml (BottomBar: bottom_bar_background_color #32000000, 20 dp side padding, the content 12 dp
     higher): three 96 dp places. The CameraSwitchButton (front_back_switch_button, 56 dp, white) or, recording, the
     PauseResumeButton (a white 48 dp circle with ic_pause_resume / ic_resume_pause) or, in slow motion, the HfrButton
     (a 56 dp #4c000000 circle: 120 / 240 and FPS); the ShutterButton; the RoundedThumbnailView (48 dp round, 2 dp
     inner stroke from #4dffffff to #14ffffff; a ring from 40 to 96 dp ripples out of it as a picture lands).
   - ShutterButton.onDraw: a white 72 dp circle; photo: a 56 dp circle in camera_mode_idle_color #cfd8dc, pressed
     camera_mode_color #4285f4; video: a 16 dp video_mode_color #db4437 dot which grows over the whole button as
     recording starts (350 ms), a white 24 dp stop square on it.
   - The options bar (optionsbar_closed_layout.xml, 72 dp, 16 dp from the top): 48 × 56 dp buttons at the end with
     the 32 dp icons; OptionsBarController shows timer and HDR+ in photo, grid lines everywhere but the panoramas,
     white balance and flash but in Lens Blur and the panoramas (video: flash on / off only). Tapping one opens its
     ExpandedOptions over optionsbar_background_opened #bc000000 (the icon and a 12 sp label, the chosen at full
     alpha, the others at half). Panorama shows its four types instead.
   - The hamburger (ShadowDrawerArrowDrawable: three 18 × 2 dp bars, a #57000000 shadow 1.17 dp down) opens the
     toybox drawer: no scrim of its own, the preview_scrim black at 60 %, toybox_menu_item.xml rows (64 dp: the 24 dp
     icon in a 56 dp block, 16 sp sans-serif-medium white) from ToyboxMenuItemAdapter: Slow Motion (the 6P's HFR),
     Panorama, Photo Sphere, Lens Blur, Settings. In those modes ic_close takes the hamburger's place.
   - Photo and video by a swipe across the preview (PhotoVideoModeSwitchView: black with the mode's 48 dp icon), or
     the PhotoVideoPaginator's dots (72 × 38 dp, 5 dp dots 8 dp apart, #ffffff / #66ffffff) over the bottom bar;
     video_swipe_hint.xml ("Swipe left for video" over #8a000000 → transparent) until video was opened once.
   - The countdown, the recording counter (onVideoRecordingCounter: 14 sp on #99000000, 3 dp corners), grid lines
     (GridLinesUi: 1 px white at thirds, quarters or the golden ratio 0.382 / 0.618), the front camera's flash
     (main_layout_selfie_flash_color #ffe8cf). */
(() => {
  'use strict';
  const T = () => NG.text('camera');
  const A = n => `assets/cm-${n}`;
  const esc = (c, s) => c.safe(s);
  // CameraMode: title, description and icon of each mode; the toybox lists the last five.
  const MODES = {photo: ['mode_camera', 'mode_camera_desc', 'ic_camera.svg'], video: ['mode_video', 'mode_video_desc', 'ic_videocam.svg'],
    slomo: ['mode_video_slomo', 'mode_video_slomo_desc', 'ic_slow_motion_video.svg'], panorama: ['mode_panorama', 'mode_panorama_desc', 'ic_panorama_normal.svg'],
    photosphere: ['mode_photosphere', 'mode_photosphere_desc', 'ic_photosphere_normal.svg'], refocus: ['mode_refocus', 'mode_refocus_desc', 'ic_refocus.svg'],
    settings: ['mode_settings', 'settings_open_desc', 'ic_settings_normal_nopadding.svg']};
  const TOYBOX = ['slomo', 'panorama', 'photosphere', 'refocus', 'settings'];
  const isVideo = m => m === 'video' || m === 'slomo';
  // optionsbar_opened_layout.xml's expanded options: [value, label, expanded icon, collapsed icon].
  const OPTIONS = {
    timer: ['timer_options_desc', [[0, 'timer_off_desc', 'ic_timer_off', 'ic_timer_normal_off'], [3, 'timer_seconds_desc', 'ic_timer_expanded_3s', 'ic_timer_normal_3s'], [10, 'timer_seconds_desc', 'ic_timer_expanded_10s', 'ic_timer_normal_10s']]],
    hdr: ['hdr_plus_options_desc', [['off', 'hdr_off_desc', 'ic_hdr_plus_expanded_off', 'ic_hdr_plus_normal_off'], ['auto', 'hdr_auto_desc', 'ic_hdr_plus_expanded_auto', 'ic_hdr_plus_normal_auto'], ['on', 'hdr_on_desc', 'ic_hdr_plus_expanded_on', 'ic_hdr_plus_normal_on']]],
    grid: ['grid_lines_options_desc', [['off', 'grid_off_desc', 'ic_grid_off', 'ic_grid_off'], ['3x3', 'grid_3x3_desc', 'ic_grid_3x3', 'ic_grid_3x3'], ['4x4', 'grid_4x4_desc', 'ic_grid_4x4', 'ic_grid_4x4'], ['golden', 'grid_golden_ratio_desc', 'ic_grid_golden_ratio', 'ic_grid_golden_ratio']]],
    wb: ['white_balance_options_desc', [['auto', 'white_balance_auto_desc', 'ic_wb_auto', 'ic_wb_auto'], ['cloudy', 'white_balance_cloudy_desc', 'ic_wb_cloudy', 'ic_wb_cloudy'], ['sunny', 'white_balance_sunny_desc', 'ic_wb_sunny', 'ic_wb_sunny'], ['fluorescent', 'white_balance_fluorescent_desc', 'ic_wb_fluorescent', 'ic_wb_fluorescent'], ['incandescent', 'white_balance_incandescent_desc', 'ic_wb_incandescent', 'ic_wb_incandescent']]],
    flash: ['flash_options_desc', [['off', 'flash_off_desc', 'ic_flash_normal_off', 'ic_flash_normal_off'], ['auto', 'flash_auto_desc', 'ic_flash_normal_auto', 'ic_flash_normal_auto'], ['on', 'flash_on_desc', 'ic_flash_normal_on', 'ic_flash_normal_on']]]
  };
  const PANO = [['horizontal', 'panorama_horizontal_desc'], ['vertical', 'panorama_vertical_desc'], ['wide_angle', 'panorama_wide_desc'], ['fish_eye', 'panorama_fish_eye_desc']];
  const GRID = {'3x3': [1 / 3, 2 / 3], '4x4': [.25, .5, .75], golden: [.381966, .618034]};
  // The scene's tint for a white balance other than auto (the drawn scene stands in for the sensor).
  const WB = {cloudy: 'sepia(.25) saturate(1.2)', sunny: 'sepia(.12)', fluorescent: 'hue-rotate(-12deg) saturate(.9)', incandescent: 'hue-rotate(-28deg) saturate(.8) brightness(.95)'};

  const S = c => c.data.camera || (c.data.camera = {mode: 'photo', front: false, timer: 0, hdr: 'auto', grid: 'off', wb: 'auto', flash: 'auto', videoFlash: 'off', pano: 'horizontal', hfr: 240, videoSeen: false});
  const ui = c => c.ui.camera || (c.ui.camera = {menu: false, open: '', rec: 0, paused: 0, held: 0, count: 0, seed: Math.floor(Math.random() * 1000), switching: ''});
  const elapsed = ms => { const s = Math.floor(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const recTime = u => (u.paused || Date.now()) - u.rec - u.held;

  // CaptureLayoutHelper.updatePositionConfiguration for a portrait window of w × h dp and the preview's aspect ratio.
  function layout(w, h, ratio) {
    const long = Math.max(w, h), short = Math.min(w, h), bar = Math.max(142, long - short * 4 / 3), extra = long - short * ratio;
    if (extra > 0 && ratio <= 14 / 9) {
      if (extra > bar + 0.01) { const ph = ratio * short, rest = long - ph; return {preview: [0, h - rest - ph, w, ph], bar: [0, h - rest, w, rest], overlay: false}; }
      const ph = long - bar, pw = ph / ratio; return {preview: [(w - pw) / 2, 0, pw, ph], bar: [(w - pw) / 2, h - bar, pw, bar], overlay: false};
    }
    if (extra > 0) { const ph = ratio * short; return {preview: [0, h - ph, w, ph], bar: [0, h - bar, w, bar], overlay: true}; }
    const pw = long / ratio; return {preview: [(w - pw) / 2, 0, pw, long], bar: [(w - pw) / 2, h - bar, pw, bar], overlay: true};
  }
  const box = ([l, t, w, h]) => `left:calc(${l.toFixed(2)} * var(--dp));top:calc(${t.toFixed(2)} * var(--dp));width:calc(${w.toFixed(2)} * var(--dp));height:calc(${h.toFixed(2)} * var(--dp))`;
  function windowDp(c) {
    const dp = parseFloat(getComputedStyle(c.el.screen).getPropertyValue('--dp')) || 0.852327;
    return [c.el.screen.clientWidth / dp || 411.43, c.el.screen.clientHeight / dp || 731.4];
  }

  // OptionsBarController.updateOptionsAvailability for the 6P (flash and HDR+ supported, white balance on by default).
  function shown(s) {
    const m = s.mode, pano = m === 'panorama' || m === 'photosphere';
    return ['timer', 'hdr', 'grid', 'wb', 'flash'].filter(o => o === 'timer' ? m === 'photo' : o === 'hdr' ? m === 'photo' && !s.front
      : o === 'grid' ? !pano : !(pano || m === 'refocus'));
  }
  const flashKey = s => isVideo(s.mode) ? 'videoFlash' : 'flash';
  const optValue = (s, o) => o === 'flash' ? s[flashKey(s)] : s[o];
  const optList = (s, o) => o === 'flash' && isVideo(s.mode) ? OPTIONS.flash[1].filter(([v]) => v !== 'auto') : OPTIONS[o][1];

  function optionsBar(c, s, u) {
    const t = T();
    if (u.rec) return '';
    if (u.open) {
      const list = optList(s, u.open), cur = optValue(s, u.open);
      return `<div class="ngcm-obar open"><div class="ngcm-expanded">${list.map(([v, label, icon]) => `<button type="button" class="ngcm-xopt${String(v) === String(cur) ? ' on' : ''}" data-action="ngcm-pick" data-o="${u.open}" data-v="${v}" aria-label="${esc(c, t.t(label))}"><img src="${A(icon)}.png" alt=""><span>${u.open === 'timer' && v ? `${v} ` : ''}${esc(c, t.t(label))}</span></button>`).join('')}</div></div>`;
    }
    const body = s.mode === 'panorama' ? PANO.map(([k, label]) => `<button type="button" class="ngcm-opt" data-action="ngcm-pano" data-v="${k}" aria-label="${esc(c, t.t(label))}"><img src="${s.pano === k ? A(`ic_panorama_${k}_on_white_24.svg`) : A(`quantum_ic_panorama_${k}_white_24.png`)}" alt=""></button>`).join('')
      : shown(s).map(o => { const v = optValue(s, o), row = optList(s, o).find(([x]) => String(x) === String(v)) || optList(s, o)[0]; return `<button type="button" class="ngcm-opt" data-action="ngcm-option" data-o="${o}" aria-label="${esc(c, t.t(OPTIONS[o][0]))}"><img src="${A(row[3])}.png" alt=""></button>`; }).join('');
    return `<div class="ngcm-obar" aria-label="${esc(c, t.t('accessibility_mode_options'))}"><span class="ngcm-oplace"></span><span class="ngcm-opts">${body}</span></div>`;
  }

  function shutter(c, s, u) {
    const t = T(), video = isVideo(s.mode);
    const label = video ? t.t(u.rec ? 'accessibility_capture_video_stop' : 'accessibility_capture_video_start') : t.t('accessibility_capture_photo');
    return `<button type="button" class="ngcm-shutter${video ? ' video' : ''}${u.rec ? ' rec' : ''}" data-action="ngcm-shutter" aria-label="${esc(c, label)}"><i class="ngcm-sring"></i><i class="ngcm-sphoto"></i><i class="ngcm-svideo"></i><i class="ngcm-sstop"></i></button>`;
  }

  function render(c) {
    if(c.ui.sub==='shortcut:selfie'||c.ui.sub==='shortcut:video'){const selfie=c.ui.sub==='shortcut:selfie';S(c).front=selfie;S(c).mode=selfie?'photo':'video';c.ui.sub='';c.save();}
    const t = T(), s = S(c), u = ui(c), last = NG.media.photos(c).at(-1), video = isVideo(s.mode);
    const wide = video || s.mode === 'photo' && NG.appPref(c, 'camera', s.front ? 'pref_camera_picturesize_front_key' : 'pref_camera_picturesize_back_key', 'large') === 'medium';
    const [w, h] = windowDp(c), L = layout(w, h, wide ? 16 / 9 : 4 / 3);
    const scene = NG.media.svg({id: 'vf', seed: u.seed, time: Date.now(), front: s.front}, 'ngcm-scene');
    const filter = [WB[s.wb] || '', s.hdr === 'on' && s.mode === 'photo' ? 'contrast(1.06) saturate(1.08)' : ''].filter(Boolean).join(' ');
    const grid = GRID[s.grid] ? GRID[s.grid].map(f => `<i class="ngcm-gv" style="left:${(f * 100).toFixed(3)}%"></i><i class="ngcm-gh" style="top:${(f * 100).toFixed(3)}%"></i>`).join('') : '';
    const toybox = s.mode !== 'photo' && s.mode !== 'video';
    const menuBtn = u.rec ? '' : toybox && !u.menu
      ? `<button type="button" class="ngcm-close" data-action="ngcm-mode" data-m="photo" aria-label="${esc(c, t.t('accessibility_close_button'))}"><img src="${A('ic_close.png')}" alt=""></button>`
      : `<button type="button" class="ngcm-burger${u.menu ? ' arrow' : ''}" data-action="ngcm-menu" aria-label="${esc(c, t.t(u.menu ? 'hamburger_menu_close' : 'hamburger_menu_open'))}"><i></i><i></i><i></i></button>`;
    const drawer = u.menu ? `<div class="ngcm-drawer" data-action="ngcm-menu">${TOYBOX.map(m => `<button type="button" class="ngcm-ditem" data-action="ngcm-mode" data-m="${m}" aria-label="${esc(c, t.t(MODES[m][1]))}"><span><img src="${A(MODES[m][2])}" alt=""></span>${esc(c, t.t(MODES[m][0]))}</button>`).join('')}</div>` : '';
    // The left place: recording's pause / resume, slow motion's frame rate, else the camera switch (slow motion and
    // the panoramas use the back camera only).
    const left = u.rec && s.mode === 'video' ? `<button type="button" class="ngcm-pause" data-action="ngcm-pause" aria-label="${esc(c, t.t(u.paused ? 'resume_video_recording' : 'pause_video_recording'))}"><img src="${A(u.paused ? 'ic_resume_pause.svg' : 'ic_pause_resume.svg')}" alt=""></button>`
      : s.mode === 'slomo' ? (u.rec ? '' : `<button type="button" class="ngcm-hfr" data-action="ngcm-hfr" aria-label="${esc(c, t.t(`hfr_mode_${s.hfr}fps`))}"><b>${esc(c, t.t(`hfr_fps_${s.hfr}`))}</b><span>FPS</span></button>`)
      : u.rec || ['panorama', 'photosphere'].includes(s.mode) ? '' : `<button type="button" class="ngcm-switch" data-action="ngcm-switch" aria-label="${esc(c, t.t(s.front ? 'camera_id_front_desc' : 'camera_id_back_desc'))}"><img src="${A('front_back_switch_button.svg')}" alt=""></button>`;
    const right = u.rec ? '' : `<button type="button" class="ngcm-thumb${last ? '' : ' empty'}" data-action="ngcm-thumb" aria-label="${esc(c, t.t('accessibility_filmstrip_toggle'))}">${last ? NG.media.svg(last, 'ngcm-tsvg', 1) : ''}</button>`;
    const showPager = !u.rec && !u.menu && (s.mode === 'photo' || s.mode === 'video');
    const pager = showPager ? `<button type="button" class="ngcm-pager" style="left:calc(${(L.preview[0] + (L.preview[2] - 72) / 2).toFixed(2)} * var(--dp));top:calc(${(L.bar[1] - (L.overlay ? 38 : 0)).toFixed(2)} * var(--dp))" data-action="ngcm-flip" aria-label="${esc(c, t.t(s.mode === 'video' ? 'accessibility_open_photo_mode' : 'accessibility_open_video_mode'))}"><i class="${s.mode === 'photo' ? 'on' : ''}"></i><i class="${s.mode === 'video' ? 'on' : ''}"></i></button>` : '';
    const hint = s.mode === 'photo' && !s.videoSeen && !u.menu && !u.open ? `<div class="ngcm-hint" style="top:calc(${(L.bar[1] - 250).toFixed(2)} * var(--dp))"><span><img src="${A('ic_chevron_left_white_24dp.svg')}" alt="">${esc(c, t.t('video_swipe_hint'))}</span></div>` : '';
    return `<div class="ngcm${u.menu ? ' menu' : ''}">
      <div class="ngcm-preview" style="${box(L.preview)}"><div class="ngcm-scenebox"${filter ? ` style="filter:${filter}"` : ''}>${scene}</div>${grid ? `<div class="ngcm-grid">${grid}</div>` : ''}<i class="ngcm-flashfx"></i><i class="ngcm-scrim"></i>
        ${u.count ? `<b class="ngcm-count">${u.count}</b>` : ''}${u.switching ? `<div class="ngcm-mswitch"><img src="${A(MODES[u.switching][2])}" alt=""></div>` : ''}</div>
      ${hint}
      <div class="ngcm-bar${L.overlay ? ' overlay' : ''}" style="${box(L.bar)}"><span class="ngcm-place">${left}</span><span class="ngcm-place">${shutter(c, s, u)}</span><span class="ngcm-place">${right}</span></div>
      ${pager}${optionsBar(c, s, u)}${u.open ? '<div class="ngcm-oscrim" data-action="ngcm-collapse"></div>' : ''}
      ${u.rec ? `<span class="ngcm-rec" aria-live="polite" title="${esc(c, t.t('video_recording_started'))}">${elapsed(recTime(u))}</span>` : ''}
      ${drawer}${menuBtn}<i class="ngcm-selfie"></i></div>`;
  }

  const root = c => c.el.viewport.querySelector('.ngcm');
  function flash(c) {
    const s = S(c);
    if (s.front && s.flash === 'on') root(c)?.querySelector('.ngcm-selfie')?.animate([{opacity: 1}, {opacity: 1, offset: .6}, {opacity: 0}], {duration: 500});
    root(c)?.querySelector('.ngcm-flashfx')?.animate([{opacity: 1}, {opacity: 0}], {duration: 300});
  }
  function landed(c) { const th = root(c)?.querySelector('.ngcm-thumb'); if (th) { th.classList.remove('landed'); void th.offsetWidth; th.classList.add('landed'); } }
  let countdown = 0, timer = 0;
  function cancelCountdown(c) { clearInterval(countdown); countdown = 0; ui(c).count = 0; }
  function stopRecording(c) {
    const s = S(c), u = ui(c);
    if (u.rec) NG.media.add(c, {seed: u.seed, time: Date.now(), front: s.front, kind: 'video', duration: recTime(u), ...(s.mode === 'slomo' ? {fps: s.hfr} : {})});
    u.rec = 0; u.paused = 0; u.held = 0; clearInterval(timer); timer = 0;
  }
  function capture(c) {
    const s = S(c), u = ui(c);
    if (isVideo(s.mode)) {
      if (!u.rec) { u.rec = Date.now(); u.paused = 0; u.held = 0; tick(c); c.render(); return; }
      stopRecording(c); c.render(); landed(c); return;
    }
    const shoot = () => {
      u.count = 0;
      NG.media.add(c, {seed: u.seed, time: Date.now(), front: s.front, kind: s.mode === 'panorama' || s.mode === 'photosphere' ? 'pano' : 'photo'});
      c.render(); flash(c); landed(c);
    };
    const secs = s.mode === 'photo' ? s.timer : 0;
    if (!secs) return shoot();
    u.count = secs; c.render();
    countdown = setInterval(() => { if (c.ui.view !== 'camera' || c.ui.sleeping) { cancelCountdown(c); return; } u.count--; if (u.count <= 0) { cancelCountdown(c); shoot(); } else c.render(); }, 1000);
  }
  function tick(c) { clearInterval(timer); timer = setInterval(() => { const u = ui(c); if (!u.rec || c.ui.view !== 'camera') { clearInterval(timer); return; } const el = c.el.viewport.querySelector('.ngcm-rec'); if (el) el.textContent = elapsed(recTime(u)); }, 500); }
  // PhotoVideoModeSwitchView: black with the next mode's icon while the module changes.
  function switchTo(c, mode) {
    const s = S(c), u = ui(c);
    if (s.mode === mode || u.rec) return;
    if (mode === 'video') s.videoSeen = true;
    if (['slomo', 'panorama', 'photosphere'].includes(mode)) s.front = false;
    s.mode = mode; u.open = ''; u.menu = false; u.switching = mode; c.save(); c.render();
    setTimeout(() => { if (u.switching === mode) { u.switching = ''; if (c.ui.view === 'camera') c.render(); } }, 400);
  }

  // CameraSettingsActivityHelper.addAdditionalPreferences: additional_preferences.xml goes after camera_preferences,
  // and its panorama resolution is added to the Photo category too (removePreference of the screen misses it: it is a
  // category's child, not the screen's).
  const prefs = NG.appPrefsXml?.camera?.xml;
  if (prefs?.camera_preferences && prefs.additional_preferences && !prefs.camera_preferences.merged) {
    const top = prefs.camera_preferences, extra = prefs.additional_preferences;
    const find = (n, key) => n.key === key ? n : (n.c || []).map(x => find(x, key)).find(Boolean);
    const pano = find(extra, 'pref_lightcycle_quality_key'), photo = find(top, 'pref_category_resolution_camera');
    if (pano && photo) photo.c = [...(photo.c || []), pano];
    top.c = [...(top.c || []), extra]; top.merged = true;
  }
  // CameraSettingsActivity on the 6P: Smartburst on (isSmartBurstEnabled), hybrid burst off; no advice module, no
  // experimental or developer settings; video stabilization (the 6P's EIS). The resolutions are the sensors': the rear
  // IMX377 4032 × 3024 and the front 8 MP 3264 × 2448 (large = the full 4:3, medium = 16:9 of it, small = 4:3 at about
  // a quarter), formatted with setting_summary_aspect_ratio_and_megapixels; the video qualities the CamcorderProfiles.
  const G = 'GoogleCamera/', P = () => NG.text('appprefs');
  const SIZES = {back: [[4, 3, 12.2], [16, 9, 9.1], [4, 3, 3.0]], front: [[4, 3, 8.0], [16, 9, 6.0], [4, 3, 2.0]]};
  const VIDEO = {back: ['2160p', '1080p', '720p'], front: ['1080p', '720p', '480p']};
  const LEVELS = ['large', 'medium', 'small'];
  const sizeLabel = ([w, h, mp]) => P().fmt(G + 'setting_summary_aspect_ratio_and_megapixels', null, w, h, mp.toFixed(1));
  const camList = key => key.includes('picturesize') ? SIZES[key.includes('front') ? 'front' : 'back'].map(sizeLabel) : VIDEO[key.includes('front') ? 'front' : 'back'].map(q => P().t(`${G}pref_video_quality_entry_${q}`));
  if (NG.appPrefsHooks) NG.appPrefsHooks.camera = {
    hidden: ['pref_category_advanced', 'pref_category_experimental', 'pref_category_developer'],
    summary(c, key) { if (/picturesize|video_quality/.test(key)) { const v = NG.appPref(c, 'camera', key, 'large'); return camList(key)[LEVELS.indexOf(v)] || camList(key)[0]; } return undefined; },
    click(c, key, n) {
      if (/picturesize|video_quality/.test(key)) {
        NG.appPrefsChoose(c, NG.appPrefStr(n.title), camList(key), LEVELS.indexOf(NG.appPref(c, 'camera', key, 'large')), (c, i) => { NG.setAppPref(c, 'camera', key, LEVELS[i]); c.render(); }, '#4285f4');
        return true;
      }
      if (key === 'pref_launch_help') { c.open('help', 'camera'); return true; }
      if (key === 'pref_launch_feedback') { c.open('feedback', 'camera'); return true; }
      return false;
    }
  };

  NG.register('camera', {
    init(c) {
      let previous = '';
      new ResizeObserver(() => {
        const size = windowDp(c).join('/');
        if (size === previous) return;
        previous = size;
        if (c.ui.view === 'camera') c.render();
      }).observe(c.el.screen);
    },
    noStatus: () => true,
    statusColor: () => '#000',
    keepAwake: c => !!ui(c).rec,
    unmount(c) { cancelCountdown(c); stopRecording(c); const u = ui(c); u.open = ''; u.menu = false; u.switching = ''; },
    render,
    mount(c, rootEl) {
      // A sideways swipe across the preview changes between photo and video (left: video).
      const pv = rootEl.querySelector('.ngcm-preview');
      if (!pv) return;
      let x0 = null, y0 = 0;
      pv.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
      pv.addEventListener('pointercancel', () => { x0 = null; });
      pv.addEventListener('pointerup', e => {
        if (x0 === null) return;
        const dx = e.clientX - x0, dy = e.clientY - y0, s = S(c); x0 = null;
        if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5 || ui(c).menu || ui(c).rec || ui(c).count) return;
        if (dx < 0 && s.mode === 'photo') switchTo(c, 'video');
        else if (dx > 0 && s.mode === 'video') switchTo(c, 'photo');
      });
    },
    back(c) {
      const u = ui(c), s = S(c);
      if (u.count) { cancelCountdown(c); c.render(); return true; }
      if (u.open) { u.open = ''; c.render(); return true; }
      if (u.menu) { u.menu = false; c.render(); return true; }
      if (u.rec) { capture(c); return true; }
      if (s.mode !== 'photo' && s.mode !== 'video') { switchTo(c, 'photo'); return true; }
      return false;
    },
    action(name, el, event, c) {
      const s = S(c), u = ui(c);
      if (u.count) return name.startsWith('ngcm-');
      switch (name) {
        case 'ngcm-shutter': if (!u.count) capture(c); return true;
        case 'ngcm-switch': s.front = !s.front; if (s.front && s.hdr) u.open = ''; c.save(); c.render(); return true;
        case 'ngcm-option': u.open = el.dataset.o; c.render(); return true;
        case 'ngcm-collapse': u.open = ''; c.render(); return true;
        case 'ngcm-pick': { const o = el.dataset.o, v = o === 'timer' ? +el.dataset.v : el.dataset.v; s[o === 'flash' ? flashKey(s) : o] = v; u.open = ''; c.save(); c.render(); return true; }
        case 'ngcm-pano': s.pano = el.dataset.v; c.save(); c.render(); return true;
        case 'ngcm-menu': if (event?.target?.closest?.('.ngcm-ditem')) return false; u.menu = !u.menu; u.open = ''; c.render(); return true;
        case 'ngcm-mode': {
          const m = el.dataset.m;
          if (m === 'settings') { u.menu = false; c.render(); NG.openPrefs(c, 'camera', 'camera_preferences', T().t('mode_settings')); return true; }
          switchTo(c, m); u.menu = false; c.render(); return true;
        }
        case 'ngcm-flip': switchTo(c, s.mode === 'video' ? 'photo' : 'video'); return true;
        case 'ngcm-hfr': s.hfr = s.hfr === 240 ? 120 : 240; c.save(); c.render(); return true;
        case 'ngcm-pause':
          if (u.paused) { u.held += Date.now() - u.paused; u.paused = 0; } else u.paused = Date.now();
          c.render(); return true;
        case 'ngcm-thumb': { const last = NG.media.photos(c).at(-1); if (last) c.open('photos', `photo:${last.id}`); return true; }
      }
      return false;
    }
  });
})();
