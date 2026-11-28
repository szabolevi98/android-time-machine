/* The power key on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - press and hold, the global actions menu and its dialogs, shutdown, reboot and safe mode, the boot
     (lp.bootUp) and the power layer, waking from sleep. The cold boot stays at the end of the core. */
'use strict';
LP.define('power', ({
  apps, home, i18n, lockControls, overlayRoot, render, renderOverlay, screen, ui
}, lp) => {
  function powerKey() { if (ui.power === 'off') { bootUp(false); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lp.lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
  for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
  // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
  function powerConfirm(kind) {
    if (kind === 'bugreport') { ui.overlay = ''; render(); setTimeout(() => lp.addNotification('Bug report captured', 'Touch to share your bug report'), 6000); return; }
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
    booted ||= AndroidBoot.prepare({markup: apps.map(app => lp.appIcon(app[0])).join('')});
    ui.power = 'boot'; ui.safeMode = safeMode; renderPower();
    // Finish after the native movie, or after a requested skip once startup resources are ready.
    let finished = false, stop = () => {};
    const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('5.1.1'); ui.power = ''; lp.lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); lp.lastActivity = Date.now(); };
    stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
    return finish;
  }
  const powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; screen.append(powerLayer);
  function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ui.safeMode ? GlobalActions.safeMode(key => i18n.t(key)) : ''; }
  screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;lp.suppressClickUntil=Date.now()+350;if(ui.locked)render();else home(false);}},true);
  Object.assign(lp, {bootUp, powerLayer});
  return {
    overlays: {
      'power-menu'() {
        overlayRoot.innerHTML = GlobalActions.menu({bugreport: lp.data.settings.bugreportPower}, key => i18n.t(key));
        // 4.1+: a long press on Power off offers the safe-mode reboot.
        GlobalActions.hold(overlayRoot.querySelector('[data-action="ga-power"]'), () => { ui.overlay = 'power-confirm'; ui.powerKind = 'safemode'; renderOverlay(); });
      },
      'power-confirm'() {
        overlayRoot.innerHTML = GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
      },
      'power-progress'() {
        overlayRoot.innerHTML = GlobalActions.progress(key => i18n.t(key));
      },
    },
    click(action, button, event) {
      const {id} = button.dataset;
      switch (action) {
        case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
        case 'ga-bugreport': ui.overlay = 'power-confirm'; ui.powerKind = 'bugreport'; renderOverlay(); break;
        case 'ga-confirm': powerConfirm(id); break;
        default: return false;
      }
      return true;
    }
  };
});
