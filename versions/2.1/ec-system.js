/* Android 2.1 system windows (framework-res / android.policy.jar / framework.jar, ERE27):
   - 'power': GlobalActions (power key held): an AlertDialog titled global_actions with forced inverse (bright) list of
     global_actions_item.xml rows (icon, 22 sp message, 14 sp status on a 26 dp line; padding 11 / 6 dp; 64 dp): Silent
     mode, Airplane mode, Power off, in that order. config_sf_slowBlur is false on the Nexus One, so the window blurs what
     is behind it (FLAG_BLUR_BEHIND).
   - Power off: ShutdownThread's confirmation (power_off, ic_dialog_alert, shutdown_confirm, Yes / No), then a progress
     dialog (shutdown_progress, spinner_white_48 turned in 12 steps of 100 ms), then off; the power key boots it again.
   - 'recent': RecentApplicationsDialog (Home held): recent_apps_dialog.xml, two rows of three 87 x 88 dp buttons (13 dp
     label under the icon, btn_application_selector), or no_recent_tasks; panel_background, blurred behind.
   - Volume keys: VolumePanel in a Toast at the top (LENGTH_SHORT): volume_adjust.xml on panel_background, the stream's
     text, the ringer icon (ic_volume / ic_volume_off) or the small one (ic_volume_small / ic_volume_off_small), a 200 dp
     progress_horizontal bar (radius 5 dp, grey track, yellow level); the ringer goes to vibrate below 1 (VIBRATE_DURATION
     300 ms). AudioService defaults: ring 5 / 7, music 11 / 15, alarm 6 / 7, notification 5 / 7, in-call 4 / 5.
   - Boot: the image's bootanimation.zip (ec-boot-animation.js) as BootAnimation::movie() plays it: part0 once, part1 in a
     loop until the system has started, then the lock screen. A new tab starts with it (once per tab). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const T = () => EC.text('system');
  const F = () => EC.text('framework');
  Object.assign(EC.defaults.settings, {volume: {ring: 5, music: 11, alarm: 6, notification: 5, call: 4}});
  const MAX = {ring: 7, music: 15, alarm: 7, notification: 7, call: 5};

  // GlobalActions ----------------------------------------------------------------------------------------------------------
  function powerRows(c) {
    const s = c.data.settings, silent = !!s.ringer, air = !!s.airplane;
    return [
      {icon: silent ? 'fw-ic_lock_silent_mode.png' : 'fw-ic_lock_silent_mode_off.png', label: T().t('global_action_toggle_silent_mode'), status: T().t(silent ? 'global_action_silent_mode_on_status' : 'global_action_silent_mode_off_status')},
      {icon: air ? 'fw-ic_lock_airplane_mode.png' : 'fw-ic_lock_airplane_mode_off.png', label: T().t('global_actions_toggle_airplane_mode'), status: T().t(air ? 'global_actions_airplane_mode_on_status' : 'global_actions_airplane_mode_off_status')},
      {icon: 'fw-ic_lock_power_off.png', label: T().t('global_action_power_off')}
    ];
  }
  function showPower(c) {
    c.dialog({title: T().t('global_actions'), icon: null, blur: true, rows: 'global', items: powerRows(c), onItem(i, c) {
      const s = c.data.settings;
      if (i === 0) { s.ringer = s.ringer ? '' : 'vibrate'; c.save(); c.render(); }
      else if (i === 1) { s.airplane = !s.airplane; c.save(); c.render(); }
      else confirmShutdown(c);
    }});
  }
  function confirmShutdown(c) {
    c.dialog({title: T().t('power_off'), icon: 'fw-ic_dialog_alert.png', message: T().t('shutdown_confirm'),
      buttons: [{label: F().t('yes'), action: c => shutdown(c)}, {label: F().t('no')}]});
  }
  function shutdown(c) {
    c.dialog({title: T().t('power_off'), icon: null, cancelable: false, html: `<div class="ecsys-progress"><img class="ecsys-spinner" src="assets/fw-spinner_white_48.png" alt=""><span>${esc(T().t('shutdown_progress'))}</span></div>`});
    navigator.vibrate?.(500);
    setTimeout(() => { c.closeDialog(); c.ui.power = 'off'; c.ui.overlay = ''; c.ui.recent = []; c.render(); renderPower(c); }, 4000);
  }

  // Boot animation -----------------------------------------------------------------------------------------------------------
  let powerLayer = null;
  function renderPower(c) {
    if (!powerLayer) { powerLayer = document.createElement('div'); powerLayer.className = 'ecsys-power'; c.el.screen.append(powerLayer); }
    powerLayer.hidden = !c.ui.power;
    if (c.ui.power === 'off' || !c.ui.power) powerLayer.innerHTML = '';
  }
  function boot(c, booted = AndroidBoot.prepare({images: EC.apps.list.map(app => 'assets/' + app.icon)})) {
    const data = window.BootAnimationData;
    c.ui.power = 'boot'; c.ui.overlay = ''; renderPower(c);
    powerLayer.innerHTML = '<div class="ecsys-boot"><div class="ecsys-boot-frame"></div></div>';
    const frame = powerLayer.querySelector('.ecsys-boot-frame');
    const [bx, by, bw, bh] = data.box;
    Object.assign(frame.style, {left: `${bx * 100}%`, top: `${by * 100}%`, width: `${bw * 100}%`, height: `${bh * 100}%`});
    let done = false, part = 0, index = 0, timer = 0, ready = false;
    booted.then(() => { ready = true; });
    const show = () => {
      const p = data.parts[part], col = index % p.cols, row = Math.floor(index / p.cols);
      frame.style.backgroundImage = `url('${p.sheet}')`;
      frame.style.backgroundSize = `${p.cols * 100}% ${p.rows * 100}%`;
      frame.style.backgroundPosition = `${p.cols > 1 ? col / (p.cols - 1) * 100 : 0}% ${p.rows > 1 ? row / (p.rows - 1) * 100 : 0}%`;
    };
    const finish = () => {
      if (done) return; done = true; clearTimeout(timer);
      AndroidBoot.complete('2.1'); c.ui.power = ''; renderPower(c); c.lock(); c.wake();
    };
    // BootAnimation::movie(): a part with a count plays that often, count 0 loops until exitPending.
    const step = () => {
      const p = data.parts[part];
      show();
      index++;
      if (index >= p.frames) {
        index = 0;
        const loops = (p.played = (p.played || 0) + 1);
        if (p.count && loops >= p.count) { part++; if (part >= data.parts.length) { finish(); return; } }
        else if (!p.count && ready) { finish(); return; }
      }
      timer = setTimeout(step, 1000 / data.fps);
    };
    data.parts.forEach(p => { p.played = 0; });
    AndroidBoot.sprites(data).then(() => { if (!done) step(); });
    return finish;
  }

  // Recent applications ----------------------------------------------------------------------------------------------------
  function renderRecent(c) {
    const apps = c.ui.recent.map(id => EC.apps.get(id)).filter(Boolean).slice(0, 6);
    const body = apps.length ? [apps.slice(0, 3), apps.slice(3, 6)].filter(r => r.length).map(row => `<div class="ecsys-recent-row">${row.map(app => `<button type="button" class="ecsys-recent-item" data-action="ecsys-recent" data-app="${esc(app.id)}"><img class="ecsys-recent-bg" src="assets/fw-pressed_application_background_static.png" alt=""><img class="ecsys-recent-icon" src="assets/${esc(app.icon)}" alt=""><span>${esc(EC.apps.label(app.id))}</span></button>`).join('')}</div>`).join('')
      : `<div class="ecsys-recent-none">${esc(T().t('no_recent_tasks'))}</div>`;
    return `<div class="ecui-dim blur" data-action="ec-close"></div><div class="ecsys-recent npp-fw-panel_background"><i class="ec-bg np-fw-panel_background"></i><div class="ecsys-recent-body">${body}</div></div>`;
  }

  // Volume -----------------------------------------------------------------------------------------------------------------
  let volumeTimer = 0;
  function volumeKey(c, dir) {
    const s = c.data.settings, v = s.volume || (s.volume = {ring: 5, music: 11, alarm: 6, notification: 5, call: 4});
    const stream = c.ui.musicPlaying ? 'music' : c.ui.inCall ? 'call' : 'ring';
    const before = v[stream];
    v[stream] = Math.max(0, Math.min(MAX[stream], v[stream] + dir));
    if (stream === 'ring') {
      if (v.ring === 0 && before > 0) { s.ringer = 'vibrate'; navigator.vibrate?.(300); }
      else if (v.ring > 0 && s.ringer) s.ringer = '';
    }
    c.save(); c.render();
    const text = T().t({ring: 'volume_ringtone', music: 'volume_music', call: 'volume_call', alarm: 'volume_alarm', notification: 'volume_notification'}[stream]);
    const large = stream === 'ring' ? `<img class="ecsys-vol-large" src="assets/${v.ring === 0 || s.ringer ? 'fw-ic_volume_off.png' : 'fw-ic_volume.png'}" alt="">` : '';
    const small = stream !== 'ring' ? `<img src="assets/${v[stream] === 0 ? 'fw-ic_volume_off_small.png' : 'fw-ic_volume_small.png'}" alt="">` : '';
    let layer = c.el.screen.querySelector('.ecsys-vol-layer');
    if (!layer) { layer = document.createElement('div'); layer.className = 'ecsys-vol-layer'; c.el.screen.append(layer); }
    layer.innerHTML = `<div class="ecsys-vol npp-fw-panel_background"><i class="ec-bg np-fw-panel_background"></i><div class="ecsys-vol-msg">${small}<span>${esc(text)}</span></div>${large}<div class="ecsys-vol-bar"><i style="width:${v[stream] / MAX[stream] * 100}%"></i></div></div>`;
    clearTimeout(volumeTimer);
    volumeTimer = setTimeout(() => { layer.innerHTML = ''; }, 2000);
  }

  EC.register('recent', {
    app: false,
    render: renderRecent,
    action(name, el, event, c) {
      if (name === 'ecsys-recent') { c.ui.overlay = ''; c.open(el.dataset.app); return true; }
      return false;
    }
  });
  EC.register('system', {
    app: false,
    init(c) {
      c.showPower = () => showPower(c);
      c.boot = booted => boot(c, booted);
    },
    render: () => '',
    volume(c, dir) { volumeKey(c, dir); }
  });
  EC.register('volume', {app: false, render: () => '', key(c, dir) { if (!c.ui.power) volumeKey(c, dir); }});
  // A fresh tab always boots; the movie covers decoded launcher/keyguard resources, including in private mode.
  EC.register('boot', {
    app: false, render: () => '',
    cold(c) {
      if (!AndroidBoot.shouldBoot('2.1')) return;
      const booted = AndroidBoot.prepare({images: EC.apps.list.map(app => 'assets/' + app.icon)});
      const finish = boot(c, booted);
      const skip = event => { off(); if (c.ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); booted.then(finish); };
      const off = () => { c.el.screen.removeEventListener('pointerdown', skip, true); window.removeEventListener('keydown', skip, true); };
      c.el.screen.addEventListener('pointerdown', skip, true); window.addEventListener('keydown', skip, true);
    }
  });
})();
