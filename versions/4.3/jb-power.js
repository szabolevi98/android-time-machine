/* The power key of Android 4.3, moved out of simulator.js (docs/plans/engine-migration.md): a press locks or wakes,
   holding it opens GlobalActions (Power off, Bug report, Airplane mode, the ringer row), the shutdown confirmation and
   progress, the phone switched off, booting (the boot movie, safe mode) and the cold boot of a fresh tab. The key
   elements and the power layer are the core's. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, addNotification, appIcon, apps, data, home, i18n, lockControls, lockScreen, overlayRoot, powerLayer, render, renderOverlay, renderStatus, save, ui;
  const $bind = c => { $c = c; ({addNotification, appIcon, apps, data, home, i18n, lockControls, lockScreen, overlayRoot, powerLayer, render, renderOverlay, renderStatus, save, ui} = c); };
  function powerKey() { if (ui.power === 'off') { bootUp(false); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
  // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
  function powerConfirm(kind) {
    if (kind === 'bugreport') { ui.overlay = ''; render(); setTimeout(() => addNotification('Bug report captured', 'Touch to share your bug report'), 6000); return; }
    ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
    setTimeout(() => powerOff(kind === 'safemode'), GlobalActions.SHUTDOWN_MS);
  }
  function powerOff(reboot) {
    if (ui.activeCall) ui.activeCall = null;
    if (ui.music) ui.music.playing = false;
    ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.safeMode = false; ui.power = 'off';
    render(); renderPower();
    if (reboot) setTimeout(() => bootUp(true), 900);
  }
  function bootUp(safeMode, booted) {
    booted ||= AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
    ui.power = 'boot'; ui.safeMode = safeMode; renderPower();
    // Finish after the native movie, or after a requested skip once startup resources are ready.
    let finished = false, stop = () => {};
    const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('4.3'); ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); $c.lastActivity = Date.now(); };
    stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
    return finish;
  }
  /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
     Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
  function coldBoot() {
    if (!AndroidBoot.shouldBoot('4.3')) return;
    const booted = AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
    const finish = bootUp(false, booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); $c.suppressClickUntil = Date.now() + 350; booted.then(finish); };
    const off = () => { powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
  }
  function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ui.safeMode ? GlobalActions.safeMode(key => i18n.t(key)) : ''; }
  const spec = {
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
        case 'ga-bugreport': ui.overlay = 'power-confirm'; ui.powerKind = 'bugreport'; renderOverlay(); break;
        case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
        case 'ga-ringer': GlobalActions.setRinger(data.settings, id); save(); renderStatus(); renderOverlay(); setTimeout(() => { if (ui.overlay === 'power-menu') { ui.overlay = ''; render(); } }, GlobalActions.DISMISS_DELAY); break;
        case 'ga-confirm': powerConfirm(id); break;
        default: return false;
      }
      return true;
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'power-menu') {
        overlayRoot.innerHTML = GlobalActions.menu({airplane: data.settings.airplane, ringer: GlobalActions.ringerOf(data.settings), bugreport: data.settings.bugreportPower}, key => i18n.t(key));
        // 4.1+: a long press on Power off offers the safe-mode reboot.
        GlobalActions.hold(overlayRoot.querySelector('[data-action="ga-power"]'), () => { ui.overlay = 'power-confirm'; ui.powerKind = 'safemode'; renderOverlay(); });
      } else if (ui.overlay === 'power-confirm') {
        overlayRoot.innerHTML = GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
      } else if (ui.overlay === 'power-progress') {
        overlayRoot.innerHTML = GlobalActions.progress(key => i18n.t(key));
      }
      else return;
      return true;
    },
    exports: {
      powerKey: (c, ...args) => { $bind(c); return powerKey(...args); },
      powerHold: (c, ...args) => { $bind(c); return powerHold(...args); },
      coldBoot: (c, ...args) => { $bind(c); return coldBoot(...args); }
    }
  };
  JB.register('power', spec);
})();
