/* The Market's made-up games on Android 2.1 (docs/plans/play-apps.md): Lunar Golf, Orbit Hopper and Pixel Blocks. A game draws itself
   on its canvas (its rules and art are shared: store-apps/lunar-golf.js, orbit-hopper.js, pixel-blocks.js); this file
   registers each as the launcher entry the Market installs (ec-market.js: 'store-<id>'), full screen as the games of
   the time were (Theme.NoTitleBar), with New game in the options menu of the Menu key (ic_menu_refresh). */
(() => {
  'use strict';
  const GAMES = [['lunar-golf', () => StoreApps.golf, 'golf'], ['orbit', () => StoreApps.orbit, 'orbit'], ['blocks', () => StoreApps.blocks, 'blocks']];
  for (const [id, G, key] of GAMES) {
    EC.register('store-' + id, {
      render: c => G() ? '<div class="ecgame" data-no-translate><canvas class="ecgame-canvas"></canvas></div>' : '',
      mount(c, root) { const canvas = root.querySelector('.ecgame-canvas'); if (canvas) G().mount(canvas, {data: c.data, ui: c.ui, save: () => c.save(), get lang() { return c.lang; }}); },
      menu(c) { c.menu([{label: G().t('New game', c.lang), icon: 'fw-ic_menu_refresh.png', action: () => G().restart(c.ui)}]); return true; },
      // Uninstalling and Settings' Clear data take the game's scores with them.
      clearData(c) { if (c.data.storeApps) delete c.data.storeApps[key]; delete c.ui[key]; }
    });
  }
})();
