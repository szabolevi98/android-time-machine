/* The power menu of the 4.4.4 shell (docs/plans/engine-migration.md): GlobalActions (global-actions.js) with
   airplane mode, the ringer, bug report and the safe-mode hold, the confirmation and the progress dialog, moved out of
   simulator.js. The power key itself is the shell's. */
(() => {
  'use strict';
  function scope(c) {
    const {addNotification, data, i18n, overlayRoot, powerOff, render, renderOverlay, renderStatus, save, ui} = c;
    // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
    function powerConfirm(kind) {
      if (kind === 'bugreport') { ui.overlay = ''; render(); setTimeout(() => addNotification('Bug report captured', 'Touch to share your bug report'), 6000); return; }
      ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
      setTimeout(() => powerOff(kind === 'safemode'), GlobalActions.SHUTDOWN_MS);
    }
    return {
      action(action, button, event) {
        const {id, app, url} = button.dataset;
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
      overlay() {
        if (ui.overlay === 'power-menu') {
          overlayRoot.innerHTML = GlobalActions.menu({airplane: data.settings.airplane, ringer: GlobalActions.ringerOf(data.settings), bugreport: data.settings.bugreportPower}, key => i18n.t(key));
          // 4.1+: a long press on Power off offers the safe-mode reboot.
          GlobalActions.hold(overlayRoot.querySelector('[data-action="ga-power"]'), () => { ui.overlay = 'power-confirm'; ui.powerKind = 'safemode'; renderOverlay(); });
        } else if (ui.overlay === 'power-confirm') {
          overlayRoot.innerHTML = GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
        } else if (ui.overlay === 'power-progress') {
          overlayRoot.innerHTML = GlobalActions.progress(key => i18n.t(key));
        } else return false;
        return true;
      }
    };
  }
  const spec = {
    action: (name, el, event, c) => scope(c).action(name, el, event),
    overlay: c => scope(c).overlay()
  };
  for (const id of ['power']) KK.register(id, spec);
})();
