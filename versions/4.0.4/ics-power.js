/* The power key (IMM76I framework's PhoneWindowManager, GlobalActions and ShutdownThread), moved out of simulator.js
   (docs/plans/engine-migration.md):
   - a press turns the screen off (the keyguard) or on; held, it opens the phone options (Silent mode, Airplane mode,
     Power off) while the screen is on, and only wakes it otherwise; a touch on the dark screen wakes it too
   - Power off: the confirmation, "Shutting down…" with a 500 ms vibration, then off; the key boots the phone again
   - a fresh tab shows the image's boot movie (boot-animation.js); a tap or a key skips it once the launcher is ready. */
(() => {
  'use strict';
  let powerLayer = null;
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
    function powerKey() { if (ui.power === 'off') { bootUp(); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;c.lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else c.lockScreen(); }
    // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
    function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
    // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
    function powerConfirm() {
      ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
      setTimeout(powerOff, GlobalActions.SHUTDOWN_MS);
    }
    function powerOff() {
      if (ui.activeCall) ui.activeCall = null;
      if (ui.music) ui.music.playing = false;
      ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.power = 'off';
      render(); renderPower();
    }
    function bootUp(booted) {
      booted ||= AndroidBoot.prepare({markup: apps.map(app => c.appIcon(app[0])).join('')});
      ui.power = 'boot'; renderPower();
      // Finish after the native movie, or after a requested skip once startup resources are ready.
      let finished = false, stop = () => {};
      const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('4.0.4'); ui.power = ''; c.lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); c.poke(); };
      stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
      return finish;
    }
    /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
       Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
    function coldBoot() {
      if (!AndroidBoot.shouldBoot('4.0.4')) return;
      const booted = AndroidBoot.prepare({markup: apps.map(app => c.appIcon(app[0])).join('')});
      const finish = bootUp(booted);
      const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); c.suppressClick(350); booted.then(finish); };
      const off = () => { powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
      powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
    }
    function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ''; }
    return {powerKey, powerHold, powerConfirm, powerOff, bootUp, coldBoot, renderPower};
  }

  ICS.register('power', {
    init(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', () => api(c).powerKey()); GlobalActions.hold(key, () => api(c).powerHold()); }
      powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; screen.append(powerLayer);
      screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;c.suppressClick(350);if(ui.locked)render();else home(false);}},true);
    },
    // After the first draw: a fresh tab boots.
    start(c) { api(c).coldBoot(); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay === 'power-menu') {
        return GlobalActions.menu({airplane: data.settings.airplane, ringer: GlobalActions.ringerOf(data.settings), }, key => i18n.t(key));
      }
      if (ui.overlay === 'power-confirm') {
        return GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
      }
      if (ui.overlay === 'power-progress') {
        return GlobalActions.progress(key => i18n.t(key));
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {id} = button.dataset;
      switch (action) {
        case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
        case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
        case 'ga-ringer': GlobalActions.setRinger(data.settings, id); save(); renderStatus(); renderOverlay(); setTimeout(() => { if (ui.overlay === 'power-menu') { ui.overlay = ''; render(); } }, GlobalActions.DISMISS_DELAY); break;
        case 'ga-confirm': api(c).powerConfirm(); break;
        default: return false;
      }
      return true;
    },
  });
})();
