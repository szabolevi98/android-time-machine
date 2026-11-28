/* Daydream of the 4.4.4 shell (docs/plans/engine-migration.md): the dream that shows (clock, colors, photo frame or
   the Dessert Case) and the touch that ends it, moved out of simulator.js. Settings › Display › Daydream is
   kk-settings.js's. */
(() => {
  'use strict';
  function scope(c) {
    const {overlayRoot, reducedMotion, renderDream, renderOverlay, ui} = c;
    return {
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'dream-exit': ui.overlay = ''; renderOverlay(); break;
          default: return false;
        }
        return true;
      },
      overlay() {
        if (ui.overlay === 'dream') {
          overlayRoot.innerHTML = renderDream();
          const dessertDream = overlayRoot.querySelector('[data-kk-dream-dessert]');
          if (dessertDream) requestAnimationFrame(() => { if (dessertDream.isConnected) KKEgg.dessertCase(dessertDream, {reduced: !!reducedMotion?.matches}); });
        } else return false;
        return true;
      }
    };
  }
  const spec = {
    action: (name, el, event, c) => scope(c).action(name, el, event),
    overlay: c => scope(c).overlay()
  };
  for (const id of ['dream']) KK.register(id, spec);
})();
