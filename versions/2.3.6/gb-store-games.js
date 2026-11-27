/* The Market's made-up games on Android 2.3.6 (docs/plans/play-apps.md): Lunar Golf, Orbit Hopper and Pixel Blocks. A game draws
   itself on its canvas (its rules and art are shared: store-apps/lunar-golf.js, orbit-hopper.js, pixel-blocks.js);
   store-apps/legacy-host.js hosts it in simulator.js. This file registers each as the store's runtime 'store-<id>',
   full screen under the status bar, with New game in the Menu key's options panel. */
(() => {
  'use strict';
  const GAMES = [['lunar-golf', () => StoreApps.golf, 'golf', 'Lunar Golf', 9.8], ['orbit', () => StoreApps.orbit, 'orbit', 'Orbit Hopper', 12], ['blocks', () => StoreApps.blocks, 'blocks', 'Pixel Blocks', 8.6]];
  for (const [id, G, key, title, size] of GAMES) {
    StoreHost.register('store-' + id, {
      title, color: G().STORE.color, dark: G().STORE.dark, version: '1.2', size, key,
      render: c => `<div class="app-view gbgame" data-no-translate><canvas class="gbgame-canvas"></canvas></div>`,
      mount(c, root) { const canvas = root.querySelector('.gbgame-canvas'); if (canvas) G().mount(canvas, {data: c.data, ui: c.ui, save: () => c.save(), get lang() { return c.lang; }}); },
      action(name, el, c) { if (name !== 'gbgame-new') return false; G().restart(c.ui); return true; },
      // The Menu key's options panel: New game (ic_menu_refresh).
      menu(c) { c.menu([{label: G().t('New game', c.lang), icon: 'ic_menu_refresh', action: c => G().restart(c.ui)}]); },
      // Uninstalling and Settings' Clear data take the game's scores with them.
      clearData(c) { if (c.data.storeApps) delete c.data.storeApps[key]; delete c.ui[key]; }
    });
  }
})();
