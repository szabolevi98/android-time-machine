/* Live Wallpapers (LivePicker) on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the empty list (the image has no WallpaperService) and Back */
'use strict';
LP.define('live-wallpapers', ({
  home, i18n, render, safe, ui
}, lp) => {
  /* LivePicker's LiveWallpaperActivity (LivePickerTheme: Theme.Holo without a title): the LMY48Y image declares no
     WallpaperService at all, so the list shows its empty view, live_wallpaper_empty in textAppearanceMedium. */
  function renderLiveWallpapers() {
    return `<div class="app-view lp-lw-empty"><p>${safe(i18n.t('No live wallpapers.'))}</p></div>`;
  }
  return {
    back() {
      if (ui.view === 'live-wallpapers') { home(false); return true; }
      return false;
    },
    render() {
      return renderLiveWallpapers();
    },
    click(action, button, event) {
            switch (action) {
        case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
        default: return false;
      }
      return true;
    }
  };
});
