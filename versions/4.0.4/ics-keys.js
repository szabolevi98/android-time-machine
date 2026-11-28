/* The navigation bar (IMM76I SystemUI's NavigationBarView) and the computer's keys, moved out of simulator.js
   (docs/plans/engine-migration.md): Back, Home and Recent apps, and the legacy menu key for an app without an action bar
   (AOSP Music, News & Weather); on a secure keyguard only Back works. Escape or Backspace is Back, Home is Home, once
   the open screen did not take the key. Loaded last, so every other module is asked first. */
(() => {
  'use strict';
  ICS.register('navbar', {
    touch: '#nav-bar',
    render(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      return `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>${c.legacyMenu()&&!ui.locked?'<button class="nav-key nav-menu" data-action="legacy-menu" aria-label="Menu"><img src="assets/ic_sysbar_menu.png" alt=""></button>':''}`;
    },
    mount(c, root) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if(ui.locked)root.querySelectorAll('.nav-home,.nav-recent').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');});
    },
    key(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); c.back(); return true; }
      if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); return true; }
    },
  });
})();
