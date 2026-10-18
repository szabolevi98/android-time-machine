/* Android 6.0.1 power menu, shutdown and boot (services.jar GlobalActions and ShutdownThread, the image's
   bootanimation.zip), the overlay 'power':
   - GlobalActions.createDialog reads config_globalActionsList, which the Nexus 5X overlay sets to power, bugreport, users:
     bugreport only shows with bugreport_in_power_menu (developer options), users only with fw.power_user_switcher, so
     the menu is the single PowerAction: global_actions_item.xml (64 dp listPreferredItemHeight, 6 dp padding above and
     below, 8 dp at the start; the 56 dp icon ic_lock_power_off, a bitmap of ic_lock_power_off_alpha tinted
     colorControlNormal #8a000000, 8 dp before the message in TextAppearance.Material.Large 22 sp #de000000) in the
     system context's light alert dialog (mm-dialog.js), not cancelable by a touch outside.
   - Power off: PowerAction.onPress shuts down without asking: ShutdownThread's ProgressDialog (power_off,
     shutdown_progress) and the screen goes dark. Held: rebootSafeMode asks (reboot_safemode_title / _confirm, Cancel /
     OK) and reboots into safe mode, which shows the safeMode watermark at the bottom start until the next reboot.
   - Off, the power key boots: BootAnimation::movie() over black, the parts of desc.txt ("c 1 0 part0", "c 0 0 part1",
     "c 1 70 part2", "c 1 15 part3" at 60 fps): part0 once, part1 again and again until the system is up (each play
     finishing, every part is a "c" part), part2 once and 70 frames of pause, part3 once and 15 frames; then the lock
     screen. */
(() => {
  'use strict';
  const T = () => MM.text('power');
  let layer = null;

  function powerItem(c) {
    return `<span class="mmpw-item"><i class="mmpw-icon"></i><span>${c.safe(T().t('global_action_power_off'))}</span></span>`;
  }
  function spec(c) {
    return {items: [{html: powerItem(c)}], cancelable: false, onItem: () => shutdown(c), onLongItem: () => { safeModeAsk(c); return true; }};
  }
  function safeModeAsk(c) {
    c.closeOverlay();
    c.dialog({title: T().t('reboot_safemode_title'), message: T().t('reboot_safemode_confirm'),
      buttons: [{label: T().t('cancel')}, {label: T().t('ok'), action: c => shutdown(c, {safe: true})}]});
  }

  function ensureLayer(c) {
    if (!layer) { layer = document.createElement('div'); layer.className = 'mmpw-layer'; c.el.screen.append(layer); }
    return layer;
  }
  function shutdown(c, {safe = false} = {}) {
    c.ui.overlay = '';
    c.dialog({title: T().t('power_off'), progress: T().t('shutdown_progress'), cancelable: false});
    c.ui.power = 'shutdown';
    navigator.vibrate?.(500);
    setTimeout(() => {
      c.closeDialog();
      c.ui.power = 'off'; c.ui.recent = []; c.ui.history = []; c.ui.nextSafeMode = safe;
      MM.module('shade') && (c.ui.shade = null);
      ensureLayer(c).innerHTML = ''; layer.hidden = false;
      c.render();
      if (safe) setTimeout(() => boot(c), 1500);
    }, 3500);
  }

  // BootAnimation::movie() for the image's desc.txt.
  function boot(c) {
    const data = window.BootAnimationData;
    c.ui.power = 'boot'; c.ui.overlay = '';
    if (MM.system) MM.system.live.bootAt = Date.now();   // SystemClock.elapsedRealtime starts again
    ensureLayer(c).hidden = false;
    layer.innerHTML = '<div class="mmpw-boot"><div class="mmpw-frame"></div></div>';
    const frame = layer.querySelector('.mmpw-frame');
    const [bx, by, bw, bh] = data.box;
    Object.assign(frame.style, {left: `${bx * 100}%`, top: `${by * 100}%`, width: `${bw * 100}%`, height: `${bh * 100}%`});
    const started = Date.now(), upAfter = 6000;
    let part = 0, index = 0, plays = 0, pause = 0, timer = 0;
    const show = () => {
      const p = data.parts[part], col = index % p.cols, row = Math.floor(index / p.cols);
      frame.style.backgroundImage = `url('${p.sheet}')`;
      frame.style.backgroundSize = `${p.cols * 100}% ${p.rows * 100}%`;
      frame.style.backgroundPosition = `${p.cols > 1 ? col / (p.cols - 1) * 100 : 0}% ${p.rows > 1 ? row / (p.rows - 1) * 100 : 0}%`;
    };
    const finish = () => {
      clearTimeout(timer); off();
      if (c.ui.power !== 'boot') return;
      c.ui.power = ''; layer.hidden = true; layer.innerHTML = '';
      c.ui.safeMode = !!c.ui.nextSafeMode; c.ui.nextSafeMode = false;
      watermark(c);
      c.lock(); c.wake();
    };
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
    step();
  }

  // The safe mode watermark (WindowManagerService.showSafeModeOverlay: safeMode at the bottom start).
  function watermark(c) {
    let el = c.el.screen.querySelector('.mmpw-safe');
    if (!c.ui.safeMode) { el?.remove(); return; }
    if (!el) { el = document.createElement('div'); el.className = 'mmpw-safe'; c.el.screen.append(el); }
    el.textContent = T().t('safeMode');
  }

  // A new tab starts with the boot animation once, as the other versions do (sessionStorage android-sim-booted-6.0.1).
  MM.register('boot', {
    app: false,
    render: () => '',
    cold(c) {
      try { if (sessionStorage.getItem('android-sim-booted-6.0.1') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; sessionStorage.setItem('android-sim-booted-6.0.1', '1'); } catch { return; }
      boot(c);
    }
  });

  MM.register('power', {
    app: false,
    init(c) { c.boot = () => boot(c); },
    render: c => MM.dialog.markup(c, spec(c)),
    mount(c, root) { MM.dialog.mountLong(c, root, spec(c), () => c.closeOverlay()); },
    action(name, el, event, c) { return MM.dialog.action(c, name, el, spec(c), () => c.closeOverlay()); }
  });
})();
