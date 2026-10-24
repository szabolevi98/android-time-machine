/* Android 4.4.4 Camera (GoogleCamera 2.0.002 of KTU84P, built from Camera2 android-4.4.4_r1: PhotoUI, PieRenderer,
   PhotoMenu, ModuleSwitcher, ZoomRenderer, AnimationManager). Its camera_controls, pie and switcher resources are the
   4.3 Gallery2 camera's (dimens and colours compared between the two APKs; only pie_progress_* and the filmstrip gap
   are new). The preview is a local illustration; nothing is captured from a real camera. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DP = .9, CENTER = Math.PI / 2, RAD24 = 24 * Math.PI / 180;
  // PieRenderer dimensions (dimens.xml) and timings.
  const P = {arc: 214 * DP, inc: 48 * DP, arcOffset: 48 * DP, slice: 370 * DP, dead: 36 * DP, angleZone: 92 * DP, touchOffset: 32 * DP,
    sweepArc: .23, sweepSlice: .14, fadeIn: 200, fadeOut: 600, xfade: 200, sliceMove: 80, openSub: 400, holdPie: 200,
    focusCircle: (80 - 8) * DP, focusInner: 24 * DP, focusOuterStroke: 3 * DP, focusInnerStroke: 2 * DP, focusUp: 600, focusDown: 100, focusHide: 200,
    zoomMin: 48 * DP, arcStroke: 10 / 2 * DP};
  const SIZES = [['5mp', '5M pixels'], ['3mp', '3M pixels'], ['2mp', '2M pixels'], ['1_3mp', '1.3M pixels'], ['1mp', '1M pixels'], ['vga', 'VGA'], ['qvga', 'QVGA']];
  const DURATIONS = [0, 1, 2, 3, 4, 5, 10, 15, 20, 30, 60];
  // ModuleSwitcher 4.4.4: photo, video, wide-angle panorama and, as GoogleCamera has LightCycle, Photo Sphere (the GCam
  // index is never listed; HDR+ is the pie's switch). Panorama is camera-pano.js, Photo Sphere kk-sphere.js.
  const MODULES = [['photo', 'ic_switch_camera', 'Switch to photo'], ['video', 'ic_switch_video', 'Switch to video'], ['panorama', 'ic_switch_pan', 'Switch to panorama'], ['photosphere', 'ic_switch_photosphere', 'Switch to Photo Sphere']];
  const sweeping = module => module === 'panorama' || module === 'photosphere';
  const icon = name => `assets/jbcam-${name}.png`;

  function settings(media, data) {
    return {scene: 'auto', hdr: false, timer: 0, beep: true, location: false, size: '5mp', ...media.settings(data), ...data.cameraSettings};
  }
  // PhotoMenu.initialize (4.4.4): HDR+ (see below), exposure, more, flash and the camera
  // switch, left to right; More holds the rest.
  function tree(s, module = 'photo') {
    const list = (key, label, single, values) => ({key, label, icon: single || values.find(v => v[0] === s[key])?.[1] || values[0][1],
      children: values.map(([value, file, text, suffix = '']) => ({icon: file, label: text, suffix, set: {[key]: value}}))});
    const exposure = list('exposure', 'EXPOSURE', 'ic_exposure_holo_light', [-3, -2, -1, 0, 1, 2, 3].map(v => [v, `ic_exposure_${v < 0 ? 'n' + -v : v > 0 ? 'p' + v : '0'}`, 'EXPOSURE', ` ${v > 0 ? '+' : ''}${v}`]));
    const flash = list('flash', 'FLASH MODE', '', [['off', 'ic_flash_off_holo_light', 'FLASH OFF'], ['auto', 'ic_flash_auto_holo_light', 'FLASH AUTO'], ['on', 'ic_flash_on_holo_light', 'FLASH ON']]);
    const balance = list('balance', 'WHITE BALANCE', '', [['incandescent', 'ic_wb_incandescent', 'INCANDESCENT'], ['fluorescent', 'ic_wb_fluorescent', 'FLUORESCENT'], ['auto', 'ic_wb_auto', 'AUTO'], ['daylight', 'ic_wb_sunlight', 'DAYLIGHT'], ['cloudy', 'ic_wb_cloudy', 'CLOUDY']]);
    const scene = list('scene', 'SCENE MODE', 'ic_sce', [['action', 'ic_sce_action', 'ACTION'], ['night', 'ic_sce_night', 'NIGHT'], ['auto', 'ic_sce_off', 'NONE'], ['sunset', 'ic_sce_sunset', 'SUNSET'], ['party', 'ic_sce_party', 'PARTY']]);
    // Switch items show the value they switch away from ("FRONT CAMERA" while the back camera is active).
    const camera = {label: s.front ? 'BACK CAMERA' : 'FRONT CAMERA', icon: s.front ? 'ic_switch_front' : 'ic_switch_back', set: {front: !s.front}};
    const location = {label: 'LOCATION', icon: s.location ? 'ic_location' : 'ic_location_off', set: {location: !s.location}};
    const timer = {label: 'COUNTDOWN TIMER', icon: 'ic_timer', popup: 'timer'}, size = {label: 'PICTURE SIZE', icon: 'ic_imagesize', popup: 'size'};
    // GoogleCamera 2.0.002 on the Nexus 5 (KTU84P): PhotoMenu shows HDR+ (pref_camera_hdr_plus_key) and drops HDR, as the
    // msm8974 camera HAL never lists the hdr scene mode. Its labels name the state it switches to (pref_camera_hdr_plus_labels).
    const hdr = {label: s.hdr ? 'HDR+ OFF' : 'HDR+ ON', icon: s.hdr ? 'ic_hdr_plus_normal' : 'ic_hdr_plus_disabled', set: {hdr: !s.hdr}};
    const more = {label: 'MORE OPTIONS', icon: 'ic_settings_holo_light', children: module === 'photo' ? [location, timer, size, balance, scene] : [location, balance]};
    return module === 'photo' ? [hdr, exposure, more, flash, camera] : [more, flash, camera];
  }
  // OnScreenIndicators behind the menu button.
  function indicators(s) {
    const wb = {auto: 'off', incandescent: 'tungsten', fluorescent: 'fluorescent', daylight: 'daylight', cloudy: 'cloudy'}[s.balance] || 'off';
    const ev = s.exposure < 0 ? `n${-s.exposure}` : s.exposure > 0 ? `p${s.exposure}` : '0';
    return [['scene', s.hdr ? 'ic_indicator_hdr_plus_on' : `ic_indicator_sce_${s.scene === 'auto' ? 'off' : 'on'}`, 'left top'], ['timer', `ic_indicator_timer_${s.timer ? 'on' : 'off'}`, 'center top'], ['flash', `ic_indicator_flash_${s.flash}`, 'right top'],
      ['exposure', `ic_indicator_ev_${ev}`, 'left bottom'], ['location', `ic_indicator_loc_${s.location ? 'on' : 'off'}`, 'center bottom'], ['wb', `ic_indicator_wb_${wb}`, 'right bottom']];
  }

  /* Pie geometry. The menu is an arc of items above the finger: the arc circle (214dp) is centred 166dp below
     the touch point, items sit 2/3 of a ring further out, 0.23 rad apart, and each level moves one ring up. */
  function centerAngle(x, width) {
    if (x < P.dead + P.angleZone) return CENTER - (P.angleZone - x + P.dead) * RAD24 / P.angleZone;
    if (x > width - P.dead - P.angleZone) return CENTER + (x - (width - P.dead - P.angleZone)) * RAD24 / P.angleZone;
    return CENTER;
  }
  function frame(cx, cy, width) { return {cx, cy, arcCY: cy - P.arcOffset + P.arc, sliceCY: cy + P.slice - P.arcOffset, center: centerAngle(cx, width)}; }
  const itemAngle = (f, pos, count) => f.center + (count - 1) * P.sweepArc / 2 - pos * P.sweepArc;
  function itemPoint(f, level, pos, count) {
    const a = itemAngle(f, pos, count), r = P.arc + P.inc * 2 / 3;
    return {x: f.cx + r * Math.cos(a), y: f.arcCY - level * P.inc - r * Math.sin(a), angle: a};
  }
  function labelPoint(f, level) { return {x: f.cx - Math.sin(f.center - CENTER) * (P.arc + (level + 2) * P.inc), y: f.arcCY - P.arc - (level + 2) * P.inc}; }
  // getPolar: angle measured around the slice centre, radius around the arc centre (+32dp while swiping).
  function polar(f, level, x, y, offset) {
    const dx = x - f.cx, y1 = f.sliceCY - level * P.inc - y, y2 = f.arcCY - level * P.inc - y;
    let angle = CENTER;
    if (dx !== 0) { angle = Math.atan2(y1, dx); if (angle < 0) angle += 2 * Math.PI; }
    return {angle, radius: Math.hypot(dx, y2) + (offset ? P.touchOffset : 0)};
  }
  function findItem(f, level, count, point, tapMode) {
    const sliceCenter = (f.center - CENTER) * .5 + CENTER;
    for (let pos = 0; pos < count; pos++) {
      const start = sliceCenter + (count - 1) * P.sweepSlice / 2 - pos * P.sweepSlice - P.sweepSlice / 2;
      if (P.arc < point.radius && start < point.angle && point.angle < start + P.sweepSlice && (!tapMode || point.radius < P.arc + P.inc)) return pos;
    }
    return -1;
  }
  const pulledToCenter = point => point.radius < P.arc - P.inc;
  // Annular sector for the selected item: 1 degree inset on each side, from the arc out to 1.25 rings.
  function slicePath(f, level, angle) {
    const cy = f.arcCY - level * P.inc, inner = P.arc, outer = P.arc + P.inc + P.inc / 4, inset = Math.PI / 180;
    const a0 = angle - P.sweepArc / 2 + inset, a1 = angle + P.sweepArc / 2 - inset;
    const pt = (r, a) => `${(f.cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`;
    return `M${pt(outer, a0)}A${outer} ${outer} 0 0 0 ${pt(outer, a1)}L${pt(inner, a1)}A${inner} ${inner} 0 0 1 ${pt(inner, a0)}Z`;
  }
  function arcPath(f, level, count) {
    const cy = f.arcCY - level * P.inc, r = P.arc, a0 = f.center - count * P.sweepArc / 2, a1 = f.center + count * P.sweepArc / 2;
    const pt = a => `${(f.cx + r * Math.cos(a)).toFixed(1)} ${(cy - r * Math.sin(a)).toFixed(1)}`;
    return `M${pt(a0)}A${r} ${r} 0 0 0 ${pt(a1)}`;
  }
  // Focus ring: dial ticks at the dial angle, +45, +180 and +225 degrees, 45-degree arcs at the dial angle and opposite.
  function focusMarkup(x, y, dial, color = '#fff') {
    const R = P.focusCircle, r = R - P.focusInner, rad = d => d * Math.PI / 180;
    const tick = d => `<line x1="${x + r * Math.cos(rad(d))}" y1="${y + r * Math.sin(rad(d))}" x2="${x + (r + P.focusInner / 3) * Math.cos(rad(d))}" y2="${y + (r + P.focusInner / 3) * Math.sin(rad(d))}"/>`;
    const arc = d => `<path d="M${x + r * Math.cos(rad(d))} ${y + r * Math.sin(rad(d))}A${r} ${r} 0 0 1 ${x + r * Math.cos(rad(d + 45))} ${y + r * Math.sin(rad(d + 45))}"/>`;
    return `<g class="jbcam-focus" fill="none"><circle cx="${x}" cy="${y}" r="${R}" stroke="#fff" stroke-width="${P.focusOuterStroke}"/><g stroke="${color}" stroke-width="${P.focusInnerStroke}">${[0, 45, 180, 225].map(d => tick(dial + d)).join('')}${arc(dial)}${arc(dial + 180)}</g></g>`;
  }
  // ZoomRenderer: min and max rings, a guide line, the current ring and "x.yx".
  function zoomMarkup(width, height, zoom, maxZoom = 4) {
    const cx = width / 2, cy = height / 2, max = (Math.min(width, height) - P.zoomMin) / 2, r = P.zoomMin + (zoom - 1) / (maxZoom - 1) * (max - P.zoomMin);
    return `<g class="jbcam-zoom" fill="none" stroke="#fff"><circle cx="${cx}" cy="${cy}" r="${P.zoomMin}" stroke-width="${P.focusInnerStroke}"/><circle cx="${cx}" cy="${cy}" r="${max}" stroke-width="${P.focusInnerStroke}"/><line x1="${cx - P.zoomMin}" y1="${cy}" x2="${cx - max - 4}" y2="${cy}" stroke-width="${P.focusInnerStroke}"/><circle cx="${cx}" cy="${cy}" r="${r}" stroke-width="${P.focusOuterStroke}"/><text x="${cx}" y="${cy}" fill="#fff" fill-opacity=".75" stroke="none" text-anchor="middle" dominant-baseline="central">${zoom.toFixed(1)}x</text></g>`;
  }
  // Camera2 4.4.4 AnimationManager: the flash overlay fades 0.3 -> 0 over FLASH_DURATION 300 ms while the picture
  // shrinks from the whole preview into preview_thumb (48 dp, top right) over SHRINK_DURATION 400 ms, holds for
  // HOLD_DURATION 2500 ms and slides off to the right over SLIDE_DURATION 1100 ms (ObjectAnimator's default
  // accelerate-decelerate). The ImageView has no frame (4.3's CaptureAnimManager drew one).
  function captureFrame(t, box) {
    const size = 48 * DP, margin = 16 * DP, holdX = box.w - margin - size, holdY = margin;
    const ease = k => (Math.cos((k + 1) * Math.PI) / 2) + .5, lerp = (a, b, k) => a + (b - a) * k;
    const flash = t < 300 ? .3 - .3 * t / 300 : 0;
    if (t < 400) { const k = ease(t / 400); return {x: lerp(0, holdX, k), y: lerp(0, holdY, k), w: lerp(box.w, size, k), h: lerp(box.h, size, k), flash, border: false}; }
    if (t < 2900) return {x: holdX, y: holdY, w: size, h: size, flash: 0, border: false, live: true};
    if (t < 4000) return {x: holdX + (box.w - holdX) * ease((t - 2900) / 1100), y: holdY, w: size, h: size, flash: 0, border: false, live: true};
    return null;
  }

  function render(data, ui, t, media) {
    const s = settings(media, data), module = ui.jbcamModule || 'photo', recording = ui.jbcamRecording;
    const shutter = module === 'video' ? (recording ? 'btn_shutter_video_recording' : 'btn_shutter_video_default') : 'btn_shutter_default';
    const current = MODULES.find(m => m[0] === module) || MODULES[0];
    return `<div class="app-view camera-app jbcam" data-jbcam data-module="${module}" data-no-translate>
      <div class="jbcam-preview" data-jbcam-preview>${media.art(media.scene(data))}</div>${module === 'panorama' ? window.JBPano.render(data, ui, t, media) : ''}${module === 'photosphere' ? window.KKSphere.render(data, ui, t, media) : ''}
      <svg class="jbcam-overlay" data-jbcam-overlay aria-hidden="true"></svg><div class="jbcam-icons" data-jbcam-icons></div><div class="jbcam-label" data-jbcam-label aria-live="polite"></div>
      <div class="jbcam-countdown" data-jbcam-countdown hidden><span class="jbcam-count-title">${e(t('Counting down to take a photo'))}</span><span class="jbcam-count-n"></span></div>
      <div class="jbcam-rec" data-jbcam-rec ${recording ? '' : 'hidden'}><img src="${icon('ic_recording_indicator')}" alt=""><span>00:00</span></div>
      <div class="jbcam-hint" data-jbcam-hint hidden></div>
      <div class="jbcam-controls"><div class="jbcam-blocker"></div>
        ${module === 'photo' ? `<div class="jbcam-indicators" aria-hidden="true">${indicators(s).map(([key, file, pos]) => `<img class="jbcam-ind ${pos}" data-ind="${key}" src="${icon(file)}" alt="">`).join('')}</div>` : ''}
        ${sweeping(module) ? '' : `<button type="button" class="jbcam-menu" data-jbcam-menu aria-label="${e(t('Menu button'))}"></button>`}
        <button type="button" class="jbcam-switcher" data-jbcam-switcher aria-label="${e(t('Camera, video, or panorama selector'))}" aria-expanded="false"><img src="${icon(current[1])}" alt=""><img class="jbcam-switcher-mark" src="${icon('ic_switcher_menu_indicator')}" alt=""></button>
        <button type="button" class="jbcam-shutter" data-jbcam-shutter aria-label="${e(t('Shutter button'))}"><img src="${icon(shutter)}" alt=""></button>
      </div>
      <button type="button" class="jbcam-thumb" data-jbcam-thumb hidden aria-label="${e(t('Gallery'))}"></button>
      <div class="jbcam-switcher-popup" data-jbcam-popup hidden>${[...MODULES].reverse().map(([id, file, label]) => `<button type="button" data-jbcam-module="${id}" aria-label="${e(t(label))}" ${id === module ? 'aria-current="true"' : ''}><img src="${icon(file)}" alt=""></button>`).join('')}</div>
      <div class="jbcam-dialog-root" data-jbcam-dialog></div>
    </div>`;
  }

  /* Controller: PreviewGestures (tap to focus, hold 200 ms for the pie, swipe left for the gallery, pinch or wheel
     to zoom), the PieRenderer state machine, the module switcher, countdown and capture animation. */
  function attach(root, {data, ui, t, media, save, render: rerender, shoot, gallery, toast, reduced}) {
    const overlay = root.querySelector('[data-jbcam-overlay]'), iconsLayer = root.querySelector('[data-jbcam-icons]'), labelNode = root.querySelector('[data-jbcam-label]');
    const preview = root.querySelector('[data-jbcam-preview]'), dialogRoot = root.querySelector('[data-jbcam-dialog]');
    let s = settings(media, data), module = ui.jbcamModule || 'photo', destroyed = false;
    // The panorama module (camera-pano.js).
    const pano = module === 'panorama' && root.querySelector('[data-pnm]') ? window.JBPano.attach(root, {ui, rerender, shoot}) : null;
    // Photo Sphere (kk-sphere.js): the shutter ends the capture.
    const sphere = module === 'photosphere' && root.querySelector('[data-kks]') ? window.KKSphere.attach(root, {ui, rerender, shoot}) : null;
    const timers = new Set(), later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); if (!destroyed) fn(); }, ms); timers.add(id); return id; };
    const cancel = id => { clearTimeout(id); timers.delete(id); };
    const box = () => ({w: root.clientWidth, h: root.clientHeight});
    const local = event => { const r = root.getBoundingClientRect(), k = r.width / root.clientWidth || 1; return {x: (event.clientX - r.left) / k, y: (event.clientY - r.top) / k}; };
    const update = patch => { if (patch.hdr) patch = {...patch, scene: 'auto'}; else if (patch.scene && patch.scene !== 'auto') patch = {...patch, hdr: false}; data.cameraSettings = {...settings(media, data), ...patch}; s = settings(media, data); save(); };
    // Pie state.
    const pie = {open: false, tap: false, f: null, stack: [], current: -1, alpha: 1, sliceAngle: null, xfade: null, fading: null, subTimer: 0, opening: false, frame: 0};
    let focus = null, zoomShown = false, zoomTimer = 0;
    const level = () => pie.stack.length;
    const listAt = depth => depth === 0 ? tree(s, module) : pie.stack[depth - 1].node.children;
    const currentList = () => listAt(level());
    function draw() {
      const parts = [];
      if (focus) parts.push(focusMarkup(focus.x, focus.y, focus.dial, focus.color));
      if (zoomShown) { const b = box(); parts.push(zoomMarkup(b.w, b.h, s.zoom)); }
      let icons = '';
      if (pie.open) {
        const f = pie.f, scale = pie.fadeIn != null ? .9 + pie.fadeIn * .1 : 1;
        const g = (depth, alpha) => {
          const items = listAt(depth);
          let out = `<path d="${arcPath(f, depth, items.length)}" fill="none" stroke="#fff" stroke-opacity="${(140 / 255).toFixed(3)}" stroke-width="${P.arcStroke}" opacity="${alpha}"/>`;
          const selected = depth === level() && pie.current >= 0 ? pie.current : -1;
          if (selected >= 0) out += `<path d="${slicePath(f, depth, pie.sliceAngle ?? itemAngle(f, selected, items.length))}" fill="#33b5e5" opacity="${pie.fading != null ? pie.fading : alpha}"/>`;
          items.forEach((item, pos) => { const p = itemPoint(f, depth, pos, items.length); icons += `<img src="${icon(item.icon)}" alt="" style="left:${p.x}px;top:${p.y}px;opacity:${(pie.fading != null ? pie.fading : alpha) * (item.disabled ? .3 : 1)};transform:translate(-50%,-50%) scale(${scale})">`; });
          return out;
        };
        const base = pie.fadeIn != null ? pie.fadeIn : pie.fading != null ? 1 : 1;
        let svg = '';
        if (!level() || pie.xfade != null) svg += g(Math.max(0, level() - 1), pie.xfade != null ? pie.xfade : base);
        if (level()) svg += g(level(), pie.xfade != null ? 1 - .5 * pie.xfade : base);
        parts.push(`<g transform="translate(${f.cx} ${f.cy}) scale(${scale}) translate(${-f.cx} ${-f.cy})">${svg}</g>`);
        const lp = labelPoint(f, level());
        labelNode.style.left = `${lp.x}px`; labelNode.style.top = `${lp.y}px`; labelNode.style.opacity = String(pie.fading != null ? pie.fading : 1);
      }
      overlay.innerHTML = parts.join(''); iconsLayer.innerHTML = icons;
      labelNode.hidden = !pie.open || !labelNode.textContent;
    }
    const animate = (duration, step, done) => {
      if (reduced || !duration) { step(1); done?.(); return; }
      const start = performance.now();
      const tick = now => { if (destroyed) return; const k = Math.min(1, (now - start) / duration); step(k); draw(); if (k < 1) requestAnimationFrame(tick); else { done?.(); draw(); } };
      requestAnimationFrame(tick);
    };
    function showPie(cx, cy, tap) {
      const b = box();
      Object.assign(pie, {open: true, tap, f: frame(cx, cy, b.w), stack: [], current: -1, sliceAngle: null, xfade: null, fading: null, opening: false, fadeIn: 0});
      labelNode.textContent = '';
      focus = null; root.classList.add('jbcam-pie-open');
      animate(P.fadeIn, k => { pie.fadeIn = k; }, () => { pie.fadeIn = null; });
    }
    function hidePie() { cancel(pie.subTimer); Object.assign(pie, {open: false, tap: false, stack: [], current: -1, fading: null, xfade: null}); labelNode.textContent = ''; root.classList.remove('jbcam-pie-open'); draw(); }
    function select(pos) {
      const items = currentList();
      if (pos === pie.current) return;
      const from = pie.current >= 0 ? itemAngle(pie.f, pie.current, items.length) : null;
      pie.current = pos;
      if (pos < 0 || items[pos].disabled) { pie.current = -1; labelNode.textContent = ''; draw(); return; }
      labelNode.textContent = t(items[pos].label) + (items[pos].suffix || '');
      const to = itemAngle(pie.f, pos, items.length);
      if (from == null) { pie.sliceAngle = null; draw(); return; }
      animate(P.sliceMove, k => { pie.sliceAngle = from + (to - from) * k; }, () => { pie.sliceAngle = null; });
    }
    function openSub() {
      const items = currentList(), node = items[pie.current];
      if (!node?.children) return;
      pie.stack.push({node, pos: pie.current}); pie.current = -1; pie.opening = true; labelNode.textContent = '';
      animate(P.xfade, k => { pie.xfade = 1 - k; }, () => { pie.xfade = null; pie.opening = false; });
    }
    function closeSub() { if (!level()) { select(-1); return; } pie.stack.pop(); pie.current = -1; labelNode.textContent = ''; draw(); }
    function perform(node) {
      if (node.popup) { dialog(node.popup); return; }
      if (node.set) {
        const flipped = 'front' in node.set;
        update(node.set);
        if (flipped) toast(t(s.front ? 'Front camera' : 'Back camera'));
        rerender();
      }
    }
    function release() {
      const node = currentList()[pie.current];
      if (!node) { hidePie(); return; }
      if (node.children) { pie.tap = true; if (!pie.opening && level() === 0) openSub(); return; }
      // startFadeOut: 600 ms, then the item's action.
      cancel(pie.subTimer);
      animate(P.fadeOut, k => { pie.fading = 1 - k; }, () => { hidePie(); perform(node); });
    }
    // Popups (CountdownTimerPopup, ListPrefSettingPopup): #282828 with a holo blue title and 2dp rule.
    function dialog(kind) {
      const body = kind === 'timer'
        ? `<div class="jbcam-dialog-sub">${e(t('Set duration in seconds'))}</div><div class="jbcam-picker" data-jbcam-picker><button type="button" data-step="-1" aria-label="−">−</button><output>${s.timer ? s.timer : e(t('Off'))}</output><button type="button" data-step="1" aria-label="+">+</button></div><label class="jbcam-check"><span>${e(t('Beep during countdown'))}</span><input type="checkbox" data-jbcam-beep ${s.beep ? 'checked' : ''}></label><div class="jbcam-dialog-actions"><button type="button" data-jbcam-ok>${e(t('OK'))}</button></div>`
        : SIZES.map(([id, label]) => `<button type="button" class="jbcam-radio" data-jbcam-size="${id}" role="radio" aria-checked="${s.size === id}"><span>${e(t(label))}</span><img src="assets/btn_radio_${s.size === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('');
      dialogRoot.innerHTML = `<div class="jbcam-dialog-scrim" data-jbcam-close></div><div class="jbcam-dialog" role="dialog" aria-label="${e(t(kind === 'timer' ? 'Countdown timer' : 'Picture size'))}"><h3>${e(t(kind === 'timer' ? 'Countdown timer' : 'Picture size'))}</h3>${body}</div>`;
      let value = s.timer;
      dialogRoot.onclick = event => {
        const target = event.target;
        if (target.closest('[data-jbcam-close]')) { dialogRoot.innerHTML = ''; return; }
        const step = target.closest('[data-step]');
        if (step) { const i = Math.max(0, Math.min(DURATIONS.length - 1, DURATIONS.indexOf(value) + Number(step.dataset.step))); value = DURATIONS[i]; dialogRoot.querySelector('output').textContent = value ? value : t('Off'); return; }
        if (target.closest('[data-jbcam-ok]')) { update({timer: value, beep: dialogRoot.querySelector('[data-jbcam-beep]').checked}); dialogRoot.innerHTML = ''; rerender(); return; }
        const size = target.closest('[data-jbcam-size]');
        if (size) { update({size: size.dataset.jbcamSize}); dialogRoot.innerHTML = ''; rerender(); }
      };
    }
    // Focus: the dial turns from 67 degrees by a random +-60 over 600 ms, snaps back in 100 ms when focused, then hides.
    function startFocus(x, y) {
      const from = 67, to = 67 + (-60 + 120 * Math.random());
      focus = {x, y, dial: from, color: '#fff'};
      const token = focus;
      animate(P.focusUp, k => { if (focus === token) focus.dial = from + (to - from) * (.5 - Math.cos(k * Math.PI) / 2); }, () => {
        if (focus !== token) return;
        const back = focus.dial;
        focus.color = '#0f0';
        animate(P.focusDown, k => { if (focus === token) focus.dial = back + (from - back) * k; }, () => later(() => { if (focus === token) { focus = null; draw(); } }, P.focusHide));
      });
    }
    function showZoom(next) {
      update({zoom: Math.round(Math.max(1, Math.min(4, next)) * 10) / 10});
      const img = preview.querySelector('img'); if (img) img.src = media.image(media.scene(data));
      zoomShown = true; draw(); cancel(zoomTimer); zoomTimer = later(() => { zoomShown = false; draw(); }, 600);
    }
    // Capture: countdown first when a timer is set, then the CaptureAnimManager flash-and-slide.
    let countdown = null;
    function capture() {
      if (module === 'video') {
        if (ui.jbcamRecording) { const duration = Date.now() - ui.jbcamRecording; ui.jbcamRecording = null; shoot({duration}); rerender(); }
        else { ui.jbcamRecording = Date.now(); rerender(); }
        return;
      }
      if (module === 'panorama') { pano?.toggle(); return; }
      if (module === 'photosphere') { sphere?.shutter(); return; }
      if (countdown) { cancel(countdown.timer); countdown = null; root.querySelector('[data-jbcam-countdown]').hidden = true; return; }
      if (s.timer) {
        const node = root.querySelector('[data-jbcam-countdown]'), number = node.querySelector('.jbcam-count-n');
        countdown = {left: s.timer};
        const tick = () => { if (!countdown) return; if (countdown.left <= 0) { countdown = null; node.hidden = true; take(); return; } number.textContent = countdown.left; node.hidden = false; countdown.left--; countdown.timer = later(tick, 1000); };
        tick(); return;
      }
      take();
    }
    function take() {
      const photo = shoot(), thumb = root.querySelector('[data-jbcam-thumb]'), b = box();
      if (!photo || reduced) return;
      thumb.innerHTML = media.art(photo); thumb.hidden = false; thumb.dataset.photo = photo.id;
      const start = performance.now();
      const tick = now => {
        if (destroyed) return;
        const step = captureFrame(now - start, b);
        if (!step) { thumb.hidden = true; return; }
        Object.assign(thumb.style, {left: `${step.x}px`, top: `${step.y}px`, width: `${step.w}px`, height: `${step.h}px`, '--flash': step.flash});
        thumb.classList.toggle('jbcam-thumb-border', step.border); thumb.classList.toggle('jbcam-thumb-live', !!step.live);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    // Switcher popup: scales up from the button (0.3 -> 1, 200 ms) while the button fades out.
    const switcher = root.querySelector('[data-jbcam-switcher]'), popup = root.querySelector('[data-jbcam-popup]');
    function toggleSwitcher(show) { popup.hidden = !show; root.classList.toggle('jbcam-switching', show); switcher.setAttribute('aria-expanded', String(show)); }

    // Preview gestures.
    let down = null;
    const SLOP = 8;
    root.addEventListener('pointerdown', event => {
      if (event.button > 0 || destroyed) return;
      if (event.target.closest('[data-jbcam-dialog] .jbcam-dialog, [data-jbcam-dialog] .jbcam-dialog-scrim')) return;
      if (!popup.hidden && !event.target.closest('[data-jbcam-popup]')) { toggleSwitcher(false); event.preventDefault(); return; }
      if (event.target.closest('button, .jbcam-blocker')) return;
      const p = local(event);
      if (pie.open && pie.tap) {
        // Tap mode: a down on an item selects it and opens its submenu straight away.
        event.preventDefault();
        if (p.x < P.dead || p.x > box().w - P.dead) return;
        const pos = findItem(pie.f, level(), currentList().length, polar(pie.f, level(), p.x, p.y, false), true);
        down = {id: event.pointerId, x: p.x, y: p.y, pie: true, tap: true};
        if (pos >= 0 && pos !== pie.current) { select(pos); if (currentList()[pos].children) openSub(); }
        try { root.setPointerCapture(event.pointerId); } catch {}
        return;
      }
      if (pie.open) hidePie();
      event.preventDefault();
      down = {id: event.pointerId, x: p.x, y: p.y, time: performance.now(), pie: false, moved: false};
      if (!sweeping(module) && p.x >= P.dead && p.x <= box().w - P.dead) down.timer = later(() => { if (down && !down.moved) { down.pie = true; showPie(down.x, down.y, false); } }, P.holdPie);
      try { root.setPointerCapture(event.pointerId); } catch {}
    });
    root.addEventListener('pointermove', event => {
      if (!down || event.pointerId !== down.id) return;
      const p = local(event);
      if (down.pie && pie.open && !pie.tap) {
        const point = polar(pie.f, level(), p.x, p.y, true);
        if (pulledToCenter(point)) { cancel(pie.subTimer); closeSub(); labelNode.textContent = ''; return; }
        const pos = findItem(pie.f, level(), currentList().length, point, false);
        if (pos >= 0 && pos !== pie.current && !pie.opening) {
          cancel(pie.subTimer); select(pos);
          if (currentList()[pos]?.children) pie.subTimer = later(openSub, P.openSub);
        }
        return;
      }
      if (!down.pie && (Math.abs(p.x - down.x) > SLOP || Math.abs(p.y - down.y) > SLOP)) {
        down.moved = true; cancel(down.timer);
        if (p.x - down.x < -SLOP * 6 && Math.abs(p.x - down.x) > Math.abs(p.y - down.y)) { down.swipe = true; }
      }
    });
    const up = event => {
      if (!down || event.pointerId !== down.id) return;
      const was = down; down = null; cancel(was.timer);
      if (event.type === 'pointercancel') { if (pie.open && !pie.tap) hidePie(); return; }
      const p = local(event);
      if (was.tap) {
        if (pie.opening) return;
        const pos = findItem(pie.f, level(), currentList().length, polar(pie.f, level(), p.x, p.y, false), true);
        if (pos < 0) { hidePie(); return; }
        if (pos !== pie.current) select(pos);
        release(); return;
      }
      if (was.pie) { release(); return; }
      if (was.swipe) { gallery(); return; }
      if (!was.moved && !sweeping(module)) startFocus(was.x, was.y), draw();
    };
    root.addEventListener('pointerup', up); root.addEventListener('pointercancel', up);
    root.addEventListener('wheel', event => { if (destroyed || sweeping(module)) return; event.preventDefault(); showZoom(s.zoom + (event.deltaY < 0 ? .1 : -.1)); }, {passive: false});
    // Two-finger pinch on touch screens.
    const touches = new Map(); let pinch = null;
    root.addEventListener('pointerdown', event => { if (event.pointerType !== 'touch') return; touches.set(event.pointerId, local(event)); if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = {d: Math.hypot(a.x - b.x, a.y - b.y), zoom: s.zoom}; if (down) { cancel(down.timer); down = null; } if (pie.open) hidePie(); } }, true);
    root.addEventListener('pointermove', event => { if (!touches.has(event.pointerId)) return; touches.set(event.pointerId, local(event)); if (pinch && touches.size === 2) { const [a, b] = [...touches.values()], d = Math.hypot(a.x - b.x, a.y - b.y); showZoom(pinch.zoom * (d / pinch.d) ** 2); } }, true);
    const lift = event => { touches.delete(event.pointerId); if (touches.size < 2) pinch = null; };
    root.addEventListener('pointerup', lift, true); root.addEventListener('pointercancel', lift, true);

    root.addEventListener('click', event => {
      const target = event.target;
      if (target.closest('[data-jbcam-shutter]')) { event.preventDefault(); if (pie.open) hidePie(); capture(); return; }
      if (target.closest('[data-jbcam-menu]')) { event.preventDefault(); if (pie.open && pie.tap) { hidePie(); return; } const b = box(); showPie(b.w / 2, b.h - 2.5 * P.dead, true); return; }
      if (target.closest('[data-jbcam-switcher]')) { event.preventDefault(); toggleSwitcher(popup.hidden); return; }
      const choice = target.closest('[data-jbcam-module]');
      if (choice) { event.preventDefault(); toggleSwitcher(false); if (choice.dataset.jbcamModule !== module) { ui.jbcamModule = choice.dataset.jbcamModule; ui.jbcamRecording = null; ui.jbPano = null; ui.kkSphere = null; rerender(); } return; }
      const thumb = target.closest('[data-jbcam-thumb]');
      if (thumb) { event.preventDefault(); gallery(Number(thumb.dataset.photo)); }
    });
    if (ui.jbcamRecording) {
      const label = root.querySelector('[data-jbcam-rec] span');
      const tick = () => { if (!ui.jbcamRecording || destroyed) return; const sec = Math.floor((Date.now() - ui.jbcamRecording) / 1000); label.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`; later(tick, 500); };
      tick();
    }
    draw();
    return {destroy() { destroyed = true; pano?.destroy(); sphere?.destroy(); timers.forEach(clearTimeout); timers.clear(); }, pie: () => ({open: pie.open, tap: pie.tap, level: level(), current: pie.current, label: labelNode.textContent}), focus: () => focus && {...focus}};
  }
  window.JBCamera = {P, SIZES, DURATIONS, MODULES, settings, tree, indicators, centerAngle, frame, itemAngle, itemPoint, labelPoint, polar, findItem, pulledToCenter, slicePath, arcPath, captureFrame, render, attach};
})();
