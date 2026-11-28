/* The keys of the simulated Nexus 4, moved out of simulator.js (docs/plans/engine-migration.md): the computer's
   keyboard (Escape and Backspace are Back, Home is Home; a screen's module gets its keys first, as Calculator's), and the
   phone's power and volume keys beside the screen (jb-power.js, jb-volume.js). */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, back, bindVolumeKey, home, messageDraft, powerHold, powerKey, removeRecipientChip, stepPhotoStack, storeContext, ui, viewport;
  const $bind = c => { $c = c; ({back, bindVolumeKey, home, messageDraft, powerHold, powerKey, removeRecipientChip, stepPhotoStack, storeContext, ui, viewport} = c); };
  const spec = {
    // Once: the listeners of the keyboard and of the phone's keys.
    init(make, c) {
      $bind(c);
      document.addEventListener('keydown', event => {
        $bind(make());
        if (event.key === 'Backspace' && event.target.name === 'recipient' && !event.target.value && event.target.closest('.mms-compose') && messageDraft().chip) { event.preventDefault(); removeRecipientChip(); return; }
        const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
        if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
        if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
        if (!ui.view.startsWith('store-') && StoreHost.has(ui.view) && StoreHost.key(event, storeContext())) return;
        if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
        else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

      });
      for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
      bindVolumeKey(document.querySelector('#volume-down'), -1);
      bindVolumeKey(document.querySelector('#volume-up'), 1);
      bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
    }
  };
  JB.register('keys', spec);
})();
