/* Android 7.1.2 power menu, shutdown, restart and boot (services.jar GlobalActions and ShutdownThread of N2G48C, the
   image's bootanimation.zip), the overlay 'power'. The logic is 6.0.1's (mm-power.js):
   - GlobalActions.createDialog reads config_globalActionsList: power, restart, bugreport, users. bugreport shows only
     with bugreport_in_power_menu (developer options), users only with fw.power_user_switcher, so the menu has
     PowerAction and RestartAction (global_action_restart is sim_restart_button "Restart"): global_actions_item.xml
     (listPreferredItemHeight 64 dp, 6 dp padding above and below, 8 dp at the start, 16 dp at the end; the 56 dp icon
     view with ic_lock_power_off / ic_restart, 24 dp vectors tinted colorControlNormal #8a000000, centred, 8 dp before
     the message in textAppearanceLarge 22 sp #de000000) in alertDialogTheme (ng-dialog.js), not cancelable by a
     touch outside.
   - Power off and Restart: PowerAction.onPress shuts down, RestartAction.onPress reboots, neither asking:
     ShutdownThread's ProgressDialog (power_off, shutdown_progress, the same for a plain reboot) and the screen goes
     dark; a reboot boots again. Held, either asks to reboot into safe mode (reboot_safemode_title / _confirm, Cancel /
     OK), which shows the safe_mode overlay (textAppearanceLarge in #80ffffff on #60000000, 3 dp padding, at the bottom
     start) until the next reboot.
   - Off, the power key boots: BootAnimation::movie() over black, desc.txt's parts ("c 1 0 part0", "c 0 0 part1",
     "c 1 70 part2", "c 1 15 part3" at 60 fps): part0 once, part1 again and again until the system is up, part2 once and
     70 frames of pause, part3 once and 15 frames; then the home screen (the keyguard with a secure lock). */
(() => {
  'use strict';
  const T = () => NG.text('power');
  let layer = null;

  const item = (c, icon, label) => `<span class="ngpw-item"><i class="ngpw-icon" style="-webkit-mask-image:url('assets/${icon}');mask-image:url('assets/${icon}')"></i><span>${c.safe(label)}</span></span>`;
  function spec(c) {
    const t = T();
    return {items: [{html: item(c, 'fw-ic_lock_power_off.svg', t.t('global_action_power_off'))}, {html: item(c, 'fw-ic_restart.svg', t.t('sim_restart_button'))}], cancelable: false,
      onItem: i => shutdown(c, {reboot: i === 1}), onLongItem: () => { safeModeAsk(c); return true; }};
  }
  function safeModeAsk(c) {
    c.closeOverlay();
    c.dialog({title: T().t('reboot_safemode_title'), message: T().t('reboot_safemode_confirm'),
      buttons: [{label: T().t('cancel')}, {label: T().t('yes'), action: c => shutdown(c, {safe: true, reboot: true})}]});
  }

  function ensureLayer(c) {
    if (!layer) { layer = document.createElement('div'); layer.className = 'ngpw-layer'; c.el.screen.append(layer); }
    return layer;
  }
  function shutdown(c, {safe = false, reboot = false} = {}) {
    c.ui.overlay = '';
    c.dialog({title: T().t('power_off'), progress: T().t('shutdown_progress'), cancelable: false});
    c.ui.power = 'shutdown';
    navigator.vibrate?.(500);
    setTimeout(() => {
      c.closeDialog();
      c.ui.power = 'off'; c.ui.recent = []; c.ui.history = []; c.ui.thumbs = {}; c.ui.nextSafeMode = safe;
      c.ui.shade = null;
      ensureLayer(c).innerHTML = ''; layer.hidden = false;
      c.render();
      if (reboot) setTimeout(() => boot(c), 1500);
    }, 3500);
  }

  // BootAnimation::movie() for the image's desc.txt (ng-boot-animation.js).
  function boot(c) {
    const data = window.BootAnimationData;
    c.ui.power = 'boot'; c.ui.overlay = '';
    if (NG.system) NG.system.live.bootAt = Date.now();   // SystemClock.elapsedRealtime starts again
    ensureLayer(c).hidden = false;
    layer.innerHTML = '<div class="ngpw-boot"><div class="ngpw-frame"></div></div>';
    if (!data) { setTimeout(() => finish(), 500); }
    const frame = layer.querySelector('.ngpw-frame');
    const started = Date.now(), upAfter = 6000;
    let part = 0, index = 0, plays = 0, pause = 0, timer = 0;
    if (data) { const [bx, by, bw, bh] = data.box; Object.assign(frame.style, {left: `${bx * 100}%`, top: `${by * 100}%`, width: `${bw * 100}%`, height: `${bh * 100}%`}); }
    const show = () => {
      const p = data.parts[part], col = index % p.cols, row = Math.floor(index / p.cols);
      frame.style.backgroundImage = `url('${p.sheet}')`;
      frame.style.backgroundSize = `${p.cols * 100}% ${p.rows * 100}%`;
      frame.style.backgroundPosition = `${p.cols > 1 ? col / (p.cols - 1) * 100 : 0}% ${p.rows > 1 ? row / (p.rows - 1) * 100 : 0}%`;
    };
    function finish() {
      clearTimeout(timer); off();
      if (c.ui.power !== 'boot') return;
      c.ui.power = ''; layer.hidden = true; layer.innerHTML = '';
      c.ui.safeMode = !!c.ui.nextSafeMode; c.ui.nextSafeMode = false;
      watermark(c);
      // As in the other versions: the keyguard after a boot only with a secure lock, else the home screen.
      if (['pin', 'password', 'pattern'].includes(c.data.settings.lock?.type)) { c.lock(); c.wake(); }
      else { c.ui.sleeping = false; c.home(); }
    }
    const step = () => {
      const p = data.parts[part];
      if (pause > 0) { pause--; timer = setTimeout(step, 1000 / data.fps); return; }
      show();
      index++;
      if (index >= p.frames) {
        index = 0; plays++;
        pause = p.pause;
        const up = Date.now() - started >= upAfter;
        if ((p.count && plays >= p.count) || (!p.count && up)) {
          part++; plays = 0;
          if (part >= data.parts.length) { timer = setTimeout(finish, (pause + 1) * 1000 / data.fps); return; }
        }
      }
      timer = setTimeout(step, 1000 / data.fps);
    };
    // A touch or a key skips the animation, as in the other versions.
    const skip = e => { e.preventDefault(); e.stopPropagation(); finish(); };
    const off = () => { layer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    layer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
    if (data) step();
  }

  // ActivityManagerService.showSafeModeOverlay: safe_mode.xml at the bottom start.
  function watermark(c) {
    let el = c.el.screen.querySelector('.ngpw-safe');
    if (!c.ui.safeMode) { el?.remove(); return; }
    if (!el) { el = document.createElement('div'); el.className = 'ngpw-safe'; c.el.screen.append(el); }
    el.textContent = T().t('safeMode');
  }

  // A new tab starts with the boot animation once, as the other versions do (sessionStorage android-sim-booted-7.1.2).
  NG.register('boot', {
    app: false,
    render: () => '',
    cold(c) {
      try { if (sessionStorage.getItem('android-sim-booted-7.1.2') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; sessionStorage.setItem('android-sim-booted-7.1.2', '1'); } catch { return; }
      boot(c);
    }
  });

  NG.register('power', {
    app: false,
    init(c) { c.boot = () => boot(c); },
    render: c => NG.dialog.markup(c, spec(c)),
    mount(c, root) { NG.dialog.mountLong(c, root, spec(c), () => c.closeOverlay()); },
    action(name, el, event, c) { return NG.dialog.action(c, name, el, spec(c), () => c.closeOverlay()); }
  });
})();
