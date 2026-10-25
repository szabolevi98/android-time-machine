/* Google Camera 2.4 on the Nexus 6 (com.android.camera2 / GoogleCamera, LMY48Y). The preview fills the screen; the
   bottom bar (#191919 at 30 %) holds the 72 dp shutter disc in the mode colour (camera_mode_color #4285F4 with
   ic_capture_camera, video_mode_color #DB4437 with ic_capture_video, a white stop square while recording). The
   options button at the top right unfolds the mode options on #4C000000 in mode_options.xml's order: manual exposure
   (when Settings › Advanced turns it on; it opens the -2..+2 RadioOptions with the 48 dp camera_mode_color disc),
   countdown, grid lines, HDR+, flash and the camera switch.
   A swipe in from the left edge (or a touch on its handle) opens the mode list: Photo Sphere #AB47BC, Panorama
   #FF9E00, Lens Blur #0F9D58, Camera and Video on 56 dp discs (#4C000000) with white labels, settings at the foot.
   Touching the preview focuses (the white ring); swiping to the left opens the last picture. The preview is a local
   illustration; nothing is captured from a real camera.
   Settings is CameraSettingsActivity (Theme.CameraSettings: Holo Light with the #00acc1 Settings.ActionBar, full
   screen): camera_preferences.xml with additional_preferences.xml moved into Resolution & quality. The picture sizes
   are ResolutionUtil's (aspect ratio and "##0.0" megapixels); the camera HAL builds its JPEG sizes from the sensor at
   run time, so only the sizes on record are listed: back (4:3) 4160 x 3120 and (16:9) 4160 x 2340 (Digital Citizen's
   Nexus 6 review), front 1920 x 1080 (the imx132 mode in /vendor/lib/libmmcamera_imx132.so). Video qualities follow
   SettingsUtil.getSelectedVideoQualities over the image's /etc/media_profiles.xml (back 2160p / 1080p / 720p, front
   1080p / 720p / 480p). A 4:3 picture size gives a 4:3 preview at the top.
   Panorama: the orange shutter with ic_capture_pano starts and stops the capture. LightCycle draws its capture view
   natively, so that part is an approximation built from the APK's pieces: the dimmed preview with the stitched band
   growing in the middle, pano_target_default (63 dp) turning into pano_target_activated as each next frame's dot
   reaches it; then "Processing panorama …" over ic_pano_blanket with bottom_progress_bar (3 dp, white over 30 %
   white) before the PANO_ picture joins the camera roll. The sweep is a demonstration at a steady pace.
   Photo Sphere is lp-sphere.js (its overlay, Done on the shutter, Discard beside it), Lens Blur lp-refocus.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const icon = name => `assets/gcam-${name}.png`;
  const MODES = [['photosphere', 'Photo Sphere', '#ab47bc', 'ic_photosphere_normal'], ['panorama', 'Panorama', '#ff9e00', 'ic_panorama_normal'], ['refocus', 'Lens Blur', '#0f9d58', 'ic_refocus_normal'], ['photo', 'Camera', '#4285f4', 'ic_camera_normal'], ['video', 'Video', '#db4437', 'ic_video_normal']];
  const FLASH = ['auto', 'on', 'off'], TIMER = [0, 3, 10], EV = [-2, -1, 0, 1, 2];
  const PANO = {sweep: 160, speed: 28, frame: 20, process: 2200};
  const SIZES = {back: ['4160x3120', '4160x2340'], front: ['1920x1080']};
  const VIDEO = {back: ['2160p', '1080p', '720p'], front: ['1080p', '720p', '480p']}, VIDEO_NAME = {'2160p': 'UHD 4K', '1080p': 'HD 1080p', '720p': 'HD 720p', '480p': 'SD 480p'};
  const QUALITY = {max: 'High', hq: 'Normal', lq: 'Low (fastest)'};
  // pref_category_advanced: the framework's "Advanced" comes first in lp-strings.js, so the camera's own text is here.
  const ADVANCED = {res: 'GoogleCamera:pref_category_advanced', hu: 'Haladó', de: 'Erweitert', fr: 'Avancé', es: 'Avanzado'};
  function settings(media, data) { return {flash: 'auto', hdr: false, grid: false, timer: 0, front: false, pictureBack: SIZES.back[0], pictureFront: SIZES.front[0], videoBack: 'large', videoFront: 'large', location: false, exposure: false, ev: 0, lightcycle: 'hq', refocus: 'hq', ...data.cameraSettings}; }
  // getSizeSummaryString: the aspect ratio snapped to 16:9 / 4:3 (fuzzAspectRatio, 0.05) or reduced, megapixels "##0.0".
  function sizeLabel(value, t, locale) {
    const [w, h] = value.split('x').map(Number), ratio = w / h, gcd = (a, b) => b ? gcd(b, a % b) : a;
    const [n, d] = Math.abs(ratio - 16 / 9) < .05 ? [16, 9] : Math.abs(ratio - 4 / 3) < .05 ? [4, 3] : [w / gcd(w, h), h / gcd(w, h)];
    const mp = (w * h / 1e6).toLocaleString(locale, {minimumFractionDigits: 1, maximumFractionDigits: 1});
    return AndroidStrings.format(t('(%1$d:%2$d) %3$s megapixels'), n, d, mp);
  }
  // The preference lists: [title, entries [value, label]].
  function lists(t, locale) {
    const video = side => ['large', 'medium', 'small'].map((value, i) => [value, VIDEO_NAME[VIDEO[side][i]]]);
    return {
      pictureBack: ['Back camera photo', SIZES.back.map(v => [v, sizeLabel(v, t, locale)])],
      pictureFront: ['Front camera photo', SIZES.front.map(v => [v, sizeLabel(v, t, locale)])],
      videoBack: ['Back camera video', video('back')], videoFront: ['Front camera video', video('front')],
      lightcycle: ['Panorama resolution', ['max', 'hq', 'lq'].map(v => [v, QUALITY[v]])],
      refocus: ['Image quality', ['hq', 'lq'].map(v => [v, QUALITY[v]])]};
  }
  function renderSettings(data, ui, t, locale, lang) {
    const s = settings(null, data), L = lists(t, locale), page = ui.gcsPage;
    const label = (key, value) => { const hit = L[key][1].find(([v]) => v === value) || L[key][1][0]; return key.startsWith('picture') ? hit[1] : t(hit[1]); };
    const cat = title => `<h4 class="gcs-cat">${e(title)}</h4>`;
    const row = (attrs, title, summary = '', widget = '') => `<button type="button" class="gcs-row" ${attrs}><span class="gcs-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${widget}</button>`;
    const sw = key => `<span class="gcs-switch${s[key] ? ' on' : ''}" aria-hidden="true"><i>${e(t(s[key] ? 'ON' : 'OFF'))}</i></span>`;
    const list = key => row(`data-gcs-list="${key}"`, t(L[key][0]), label(key, s[key]));
    const toggle = (key, title) => row(`data-gcs-switch="${key}" role="switch" aria-checked="${!!s[key]}"`, t(title), '', sw(key));
    const body = page === 'resolution'
      ? cat(t('Camera')) + list('pictureBack') + list('pictureFront') + cat(t('Video')) + list('videoBack') + list('videoFront') + cat(t('Photo sphere and panorama')) + list('lightcycle') + cat(t('Lens Blur')) + list('refocus')
      : page === 'advanced' ? toggle('exposure', 'Manual exposure')
      : row('data-gcs-open="resolution"', t('Resolution & quality')) + toggle('location', 'Save location') + row('data-gcs-open="advanced"', AndroidStrings.pick(ADVANCED, lang, 'Advanced')) + row('data-gcs-help', t('Help & feedback'));
    const key = ui.gcsDialog, dialog = key && L[key] ? `<div class="gcs-scrim" data-gcs-cancel></div><div class="gcs-dialog" role="dialog" aria-label="${e(t(L[key][0]))}"><h3>${e(t(L[key][0]))}</h3><div class="gcs-choices">${L[key][1].map(([value, text]) => `<button type="button" class="gcs-choice${value === s[key] ? ' on' : ''}" data-gcs-pick="${e(value)}" role="radio" aria-checked="${value === s[key]}"><span>${e(key.startsWith('picture') ? text : t(text))}</span><i></i></button>`).join('')}</div><div class="gcs-buttons"><button type="button" data-gcs-cancel>${e(t('Cancel'))}</button></div></div>` : '';
    return `<div class="app-view camera-app gcs" data-gcam data-gcs data-no-translate><header class="gcs-bar"><button type="button" class="gcs-up" data-gcs-up aria-label="${e(t('Navigate up'))}"><img class="gcs-caret" src="assets/gcs-ic_ab_back_holo_dark_am.png" alt=""><img class="gcs-icon" src="assets/camera.png" alt=""></button><b>${e(t('Settings'))}</b></header><div class="gcs-list">${body}</div>${dialog}</div>`;
  }
  function render(data, ui, t, media, locale = 'en', lang = 'en') {
    if (ui.gcsPage) return renderSettings(data, ui, t, locale, lang);
    // A capture request (IMAGE_CAPTURE: Hangouts' Take photo) stays in the photo module without the mode list; after the
    // shutter BottomBar.transitionToIntentReviewLayout shows intent_review_imageview over the preview and
    // retake_done_cancel_layout's bottombar_intent_review on #191919: Retake (ic_back), Done (ic_confirm on the
    // shutter's place) and Cancel (ic_cancel).
    const intent = ui.camIntent || null, taken = intent?.taken;
    const s = settings(media, data), mode = intent ? 'photo' : MODES.some(m => m[0] === ui.jbcamModule) ? ui.jbcamModule : 'photo', recording = !!ui.jbcamRecording;
    const [pw, ph] = (s.front ? s.pictureFront : s.pictureBack).split('x').map(Number);
    const [, , color] = MODES.find(m => m[0] === mode);
    const shutterIcon = mode === 'video' ? (recording ? '' : 'ic_capture_video') : mode === 'panorama' ? 'ic_capture_pano' : mode === 'photosphere' ? window.LPSphere.shutterIcon(ui) : mode === 'refocus' ? window.LPRefocus.shutterIcon(ui) : 'ic_capture_camera_normal';
    const pano = mode === 'panorama' && ui.lpPano?.state !== 'idle' ? ui.lpPano : null, panoArt = pano ? media.image({...media.scene(data), pano: true}) : '';
    const options = [...(s.exposure ? [['exposure', 'ic_exposure_normal', 'Manual Exposure Compensation']] : []), ['timer', `ic_timer_${s.timer ? s.timer + 's' : 'off'}_normal`, s.timer ? `Countdown timer duration is set to ${s.timer} seconds` : 'Countdown timer is off'], ['grid', s.grid ? 'ic_grid_on_normal' : 'ic_grid_off_normal', s.grid ? 'Grid lines on' : 'Grid lines off'], ['hdr', s.hdr ? 'ic_hdr_plus_on_normal' : 'ic_hdr_plus_off_normal', s.hdr ? 'HDR Plus on' : 'HDR Plus off'], ['flash', `ic_flash_${s.flash}_normal`, `Flash ${s.flash}`], ['front', s.front ? 'ic_switch_camera_front_normal' : 'ic_switch_camera_back_normal', s.front ? 'Front camera' : 'Back camera']];
    const evName = v => v < 0 ? `n${-v}` : v > 0 ? `p${v}` : '0', exposure = ui.gcamExposure && s.exposure;
    const optionButtons = exposure
      ? EV.map(v => `<button type="button" class="gcam-ev${v === s.ev ? ' on' : ''}" data-gcam-ev="${v}" aria-label="${e(t(`Exposure Compensation ${v > 0 ? '+' : ''}${v}`))}" aria-pressed="${v === s.ev}"><img src="${icon('ic_exposure_' + evName(v))}" alt=""></button>`).join('')
      : options.map(([key, file, label]) => `<button type="button" data-gcam-option="${key}" aria-label="${e(t(label))}"><img src="${icon(file)}" alt=""></button>`).join('');
    return `<div class="app-view camera-app gcam${ui.gcamModes ? ' modes-open' : ''}" data-gcam data-module="${mode}" style="--mode:${color}" data-no-translate>
      <div class="gcam-preview${s.front ? ' front' : ''}${Math.abs(pw / ph - 4 / 3) < .05 ? ' r43' : ''}" data-gcam-preview style="--ev:${s.ev}">${media.art(media.scene(data))}${s.grid ? '<div class="gcam-grid" aria-hidden="true"></div>' : ''}</div>
      ${mode === 'photosphere' ? window.LPSphere.render(data, ui, t, media) : ''}${mode === 'refocus' ? window.LPRefocus.render(data, ui, t) : ''}
      ${pano?.state === 'capture' ? `<div class="gpano" data-gpano="capture"><div class="gpano-band"><img class="gpano-strip" data-gpano-strip src="${panoArt}" alt=""></div><img class="gpano-target" data-gpano-target src="${icon('pano_target_default')}" alt=""><i class="gpano-dot" data-gpano-dot></i></div>` : ''}
      ${pano?.state === 'process' ? `<div class="gpano" data-gpano="process"><div class="gpano-card"><img src="${icon('ic_pano_blanket')}" alt=""><span>${e(t('Processing panorama …'))}</span><span class="gpano-progress"><i data-gpano-progress></i></span></div></div>` : ''}
      <div class="gcam-focus" data-gcam-focus hidden></div><div class="gcam-flash" data-gcam-flash></div>
      <div class="gcam-countdown" data-gcam-countdown hidden></div>
      <div class="gcam-rec" data-gcam-rec ${recording ? '' : 'hidden'}><i></i><span>00:00</span></div>
      <div class="gcam-options${ui.gcamOptions ? ' open' : ''}">${ui.gcamOptions ? optionButtons : ''}<button type="button" class="gcam-options-toggle" data-gcam-options aria-label="${e(t('Options'))}" aria-expanded="${!!ui.gcamOptions}"><i></i><i></i><i></i></button></div>
      ${taken ? `<div class="gcam-intent-review">${media.art(taken)}</div><div class="gcam-bar intent-review"><button type="button" data-action="cam-review-retake" aria-label="${e(t('Retake'))}"><img src="${icon('ic_back_normal')}" alt=""></button><button type="button" class="gcam-done" data-action="cam-review-done" aria-label="${e(t('Done'))}"><img src="${icon('ic_confirm_normal')}" alt=""></button><button type="button" data-action="cam-review-cancel" aria-label="${e(t('Cancel'))}"><img src="${icon('ic_cancel_normal')}" alt=""></button></div>` : ''}
      <div class="gcam-bar"${taken ? ' hidden' : ''}>${mode === 'photosphere' ? window.LPSphere.cancelButton(ui, t) : '<span></span>'}<button type="button" class="gcam-shutter${recording ? ' recording' : ''}" data-gcam-shutter aria-label="${e(t(mode === 'video' ? (recording ? 'Stop recording' : 'Start recording') : mode === 'photosphere' && window.LPSphere.capturing(ui) ? 'Done' : mode === 'refocus' && window.LPRefocus.capturing(ui) ? 'Cancel' : 'Shutter'))}">${shutterIcon ? `<img src="${icon(shutterIcon)}" alt="">` : '<i></i>'}</button><span></span></div>
      ${intent ? '' : `<button type="button" class="gcam-edge" data-gcam-modes aria-label="${e(t('Toggle mode list'))}"></button>`}
      <div class="gcam-modes-scrim" data-gcam-modes-close></div>
      <nav class="gcam-modes" aria-label="${e(t('Toggle mode list'))}">${MODES.map(([id, label, c, file]) => `<button type="button" data-gcam-mode="${id}" ${id === mode ? 'aria-current="true"' : ''}><span class="gcam-mode-icon" style="--c:${c}"><img src="${icon(file)}" alt=""></span><span>${e(t(label))}</span></button>`).join('')}<button type="button" class="gcam-settings" data-gcam-settings aria-label="${e(t('Settings'))}"><img src="${icon('ic_settings_normal')}" alt=""></button></nav>
    </div>`;
  }
  // Back / Up in the settings: the dialog, then the sub screen, then the camera.
  function back(ui) {
    if (!ui.gcsPage && ui.jbcamModule === 'photosphere' && window.LPSphere.back(ui)) return true;
    if (!ui.gcsPage && ui.jbcamModule === 'refocus' && window.LPRefocus.back(ui)) return true;
    if (ui.gcsDialog) ui.gcsDialog = ''; else if (ui.gcsPage && ui.gcsPage !== 'root') ui.gcsPage = 'root'; else if (ui.gcsPage) ui.gcsPage = ''; else return false;
    return true;
  }
  function attach(root, {data, ui, t, media, save, render: rerender, shoot, gallery, toast, reduced}) {
    const backStep = () => { if (back(ui)) rerender(); };
    // Panorama: the sweep, then the processing; both run on from ui.lpPano's times after a redraw.
    let panoFrame = 0;
    const p = ui.lpPano ||= {state: 'idle', angle: 0};
    const panoPaint = () => {
      const k = Math.min(1, p.angle / PANO.sweep), strip = root.querySelector('[data-gpano-strip]'), dot = root.querySelector('[data-gpano-dot]'), target = root.querySelector('[data-gpano-target]');
      if (strip) { strip.style.clipPath = `inset(0 ${(1 - k) * 100}% 0 0)`; strip.style.transform = `translateX(${-k * Math.max(0, strip.offsetWidth - strip.parentNode.offsetWidth)}px)`; }
      const phase = (p.angle % PANO.frame) / PANO.frame;
      if (dot) dot.style.transform = `translate(${(1 - phase) * 120}px, 0)`;
      if (target) target.src = icon(phase > .8 ? 'pano_target_activated' : 'pano_target_default');
    };
    const panoTick = now => {
      if (destroyed || p.state !== 'capture' || ui.jbcamModule !== 'panorama') return;
      p.angle = Math.min(PANO.sweep, p.angle + (now - p.last) / 1000 * PANO.speed); p.last = now; panoPaint();
      if (p.angle >= PANO.sweep) { panoStop(); return; }
      panoFrame = requestAnimationFrame(panoTick);
    };
    const panoStop = () => { p.state = 'process'; p.at = performance.now(); rerender(); };
    const panoProcess = now => {
      if (destroyed || p.state !== 'process') return;
      const k = Math.min(1, (now - p.at) / PANO.process), bar = root.querySelector('[data-gpano-progress]');
      if (bar) bar.style.width = `${k * 100}%`;
      if (k < 1) { panoFrame = requestAnimationFrame(panoProcess); return; }
      ui.lpPano = {state: 'idle', angle: 0}; shoot({pano: true}); rerender();
    };
    const panoToggle = () => {
      if (p.state === 'idle') { p.state = 'capture'; p.angle = 0; p.last = performance.now(); rerender(); }
      else if (p.state === 'capture') { cancelAnimationFrame(panoFrame); panoStop(); }
    };
    if (p.state === 'capture') { p.last = performance.now(); panoPaint(); panoFrame = requestAnimationFrame(panoTick); }
    if (p.state === 'process') panoFrame = requestAnimationFrame(panoProcess);
    // Photo Sphere (lp-sphere.js): Done on the shutter.
    const sphere = ui.jbcamModule === 'photosphere' && root.querySelector('[data-lps]') ? window.LPSphere.attach(root, {ui, rerender, shoot}) : null;
    // Lens Blur (lp-refocus.js): the shutter starts the sweep, then cancels it.
    const refocus = ui.jbcamModule === 'refocus' ? window.LPRefocus.attach(root, {ui, rerender, shoot}) : null;
    let destroyed = false, start = null, countdown = 0, recTimer = 0;
    const update = patch => { data.cameraSettings = {...settings(media, data), ...patch}; save(); rerender(); };
    const focusRing = (x, y) => {
      const ring = root.querySelector('[data-gcam-focus]'); if (!ring) return;
      ring.hidden = false; ring.style.left = `${x}px`; ring.style.top = `${y}px`;
      ring.classList.remove('run'); void ring.offsetWidth; ring.classList.add('run');
    };
    const capture = () => {
      const flash = root.querySelector('[data-gcam-flash]');
      if (flash && !reduced) { flash.classList.remove('run'); void flash.offsetWidth; flash.classList.add('run'); }
      shoot();
      // A capture request shows the picture for review.
      if (ui.camIntent) rerender();
    };
    const fire = () => {
      const mode = ui.jbcamModule || 'photo';
      if (mode === 'video') {
        if (ui.jbcamRecording) { const duration = Date.now() - ui.jbcamRecording; ui.jbcamRecording = null; shoot({duration}); rerender(); }
        else { ui.jbcamRecording = Date.now(); rerender(); }
        return;
      }
      if (mode === 'panorama') { panoToggle(); return; }
      if (mode === 'photosphere') { sphere?.shutter(); return; }
      if (mode === 'refocus') { refocus?.shutter(); return; }
      if (mode !== 'photo') { toast(t('This feature is not part of the simulator.')); return; }
      const s = settings(media, data);
      if (!s.timer) { capture(); return; }
      if (countdown) return;
      const node = root.querySelector('[data-gcam-countdown]'); let left = s.timer; node.hidden = false; node.textContent = left;
      countdown = setInterval(() => { if (destroyed) return clearInterval(countdown); left--; if (left <= 0) { clearInterval(countdown); countdown = 0; node.hidden = true; capture(); } else node.textContent = left; }, 1000);
    };
    const click = event => {
      const el = event.target;
      // CameraSettingsActivity: sub screens, switches, the list dialogs; Up goes back a screen.
      if (root.matches('[data-gcs]')) {
        const s = settings(media, data), open = el.closest('[data-gcs-open]')?.dataset.gcsOpen, list = el.closest('[data-gcs-list]')?.dataset.gcsList;
        const flip = el.closest('[data-gcs-switch]')?.dataset.gcsSwitch, pick = el.closest('[data-gcs-pick]')?.dataset.gcsPick;
        if (open) { ui.gcsPage = open; rerender(); }
        else if (list) { ui.gcsDialog = list; rerender(); }
        else if (pick !== undefined && ui.gcsDialog) { const key = ui.gcsDialog; ui.gcsDialog = ''; update({[key]: pick}); }
        else if (el.closest('[data-gcs-cancel]')) { ui.gcsDialog = ''; rerender(); }
        else if (flip) update({[flip]: !s[flip], ...(flip === 'exposure' ? {ev: 0} : {})});
        else if (el.closest('[data-gcs-up]')) backStep();
        else if (el.closest('[data-gcs-help]')) toast(t('This feature is not part of the simulator.'));
        return;
      }
      if (el.closest('[data-gcam-shutter]')) { fire(); return; }
      if (el.closest('[data-gcam-options]')) { ui.gcamOptions = !ui.gcamOptions; ui.gcamExposure = false; rerender(); return; }
      const ev = el.closest('[data-gcam-ev]')?.dataset.gcamEv;
      if (ev !== undefined) { update({ev: Number(ev)}); return; }
      const option = el.closest('[data-gcam-option]')?.dataset.gcamOption;
      if (option) {
        const s = settings(media, data);
        if (option === 'exposure') { ui.gcamExposure = true; rerender(); return; }
        if (option === 'front') { update({front: !s.front}); toast(t(!s.front ? 'Front camera' : 'Back camera')); }
        if (option === 'grid') update({grid: !s.grid});
        if (option === 'timer') update({timer: TIMER[(TIMER.indexOf(s.timer) + 1) % TIMER.length]});
        if (option === 'flash') update({flash: FLASH[(FLASH.indexOf(s.flash) + 1) % FLASH.length]});
        if (option === 'hdr') update({hdr: !s.hdr});
        return;
      }
      if (el.closest('[data-gcam-modes]')) { ui.gcamModes = true; root.classList.add('modes-open'); return; }
      if (el.closest('[data-gcam-modes-close]')) { ui.gcamModes = false; root.classList.remove('modes-open'); return; }
      const chosen = el.closest('[data-gcam-mode]')?.dataset.gcamMode;
      if (chosen) { ui.gcamModes = false; ui.gcamOptions = false; if (chosen !== ui.jbcamModule) { ui.jbcamModule = chosen; ui.jbcamRecording = null; ui.lpPano = null; ui.lpSphere = null; ui.lpRefocus = null; } rerender(); return; }
      if (el.closest('[data-gcam-settings]')) { ui.gcamModes = false; ui.gcamOptions = false; ui.gcamExposure = false; ui.gcsPage = 'root'; rerender(); return; }
    };
    const down = event => {
      if (root.matches('[data-gcs]') || event.target.closest('button, .gcam-modes')) return;
      const r = root.getBoundingClientRect(), k = r.width / root.clientWidth || 1;
      start = {x: (event.clientX - r.left) / k, y: (event.clientY - r.top) / k, id: event.pointerId};
    };
    const up = event => {
      if (!start || event.pointerId !== start.id) return;
      const r = root.getBoundingClientRect(), k = r.width / root.clientWidth || 1;
      const x = (event.clientX - r.left) / k, y = (event.clientY - r.top) / k, dx = x - start.x, dy = y - start.y;
      const from = start; start = null;
      if (from.x < 24 && dx > 40) { ui.gcamModes = true; root.classList.add('modes-open'); return; }
      if (dx < -60 && Math.abs(dy) < 60) { gallery(); return; }
      if (Math.hypot(dx, dy) < 10 && event.target.closest('[data-gcam-preview]')) { if (ui.gcamOptions) { ui.gcamOptions = false; ui.gcamExposure = false; rerender(); } else focusRing(x, y); }
    };
    root.addEventListener('click', click);
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointerup', up);
    if (ui.jbcamRecording) {
      const label = root.querySelector('[data-gcam-rec] span');
      const tick = () => { if (!ui.jbcamRecording || destroyed) return; const sec = Math.floor((Date.now() - ui.jbcamRecording) / 1000); label.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; };
      tick(); recTimer = setInterval(tick, 500);
    }
    return {root, destroy() { destroyed = true; cancelAnimationFrame(panoFrame); sphere?.destroy(); refocus?.destroy(); clearInterval(countdown); clearInterval(recTimer); root.removeEventListener('click', click); root.removeEventListener('pointerdown', down); root.removeEventListener('pointerup', up); }};
  }
  window.LPCamera = {MODES, SIZES, settings, sizeLabel, render, attach, back};
})();
