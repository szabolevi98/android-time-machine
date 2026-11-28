/* TODO */
'use strict';
LP.define('live-wallpapers', ({
  home, i18n, render, safe, ui
}, lp) => {
  /* LivePicker's LiveWallpaperActivity (LivePickerTheme: Theme.Holo without a title): the LMY48Y image declares no
     WallpaperService at all, so the list shows its empty view, live_wallpaper_empty in textAppearanceMedium. */
  function renderLiveWallpapers() {
    return `<div class="app-view lp-lw-empty"><p>${safe(i18n.t('No live wallpapers.'))}</p></div>`;
  }
  // lp:code
  return {
    // lp:hooks
    back() {
      if (ui.view === 'live-wallpapers') { home(false); return true; }
      // lp:back
      return false;
    },
    render() {
      return renderLiveWallpapers();
      // lp:render
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
