/* The store's made-up games on Android 6.0.1 (docs/plans/play-apps.md): Lunar Golf, Orbit Hopper and Pixel Blocks. A game draws
   itself on its canvas (its rules and art are shared: store-apps/lunar-golf.js, orbit-hopper.js, pixel-blocks.js); this file
   registers each as the runtime the Play Store installs (mm-play.js: 'store-<id>'), full screen under the status
   bar, with a New game button of the game's own. */
(() => {
  'use strict';
  const GAMES = [['lunar-golf', () => StoreApps.golf, 'golf'], ['orbit', () => StoreApps.orbit, 'orbit'], ['blocks', () => StoreApps.blocks, 'blocks']];
  for (const [id, G, key] of GAMES) {
    MM.register('store-' + id, {
      title: {'lunar-golf': 'Lunar Golf', orbit: 'Orbit Hopper', blocks: 'Pixel Blocks'}[id],
      statusColor: () => G()?.STORE.dark || '#000',
      render: c => G() ? `<div class="mmgame" data-no-translate><canvas class="mmgame-canvas"></canvas><button type="button" class="mmgame-new" data-action="mmgame-new" aria-label="${c.safe(G().t('New game', c.lang))}">↻</button></div>` : '',
      mount(c, root) { const canvas = root.querySelector('.mmgame-canvas'); if (canvas) G().mount(canvas, {data: c.data, ui: c.ui, save: () => c.save(), get lang() { return c.lang; }}); },
      action(name, el, event, c) { if (name !== 'mmgame-new') return false; G().restart(c.ui); return true; },
      // Uninstalling and Settings' Clear data take the game's scores with them.
      clearData(c) { if (c.data.storeApps) delete c.data.storeApps[key]; delete c.ui[key]; }
    });
  }
})();
