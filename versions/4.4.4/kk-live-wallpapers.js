/* Live Wallpapers (LivePicker) in the 4.4.4 shell (docs/plans/engine-migration.md): the list, the preview with Set
   wallpaper, and Back to the picker it came from, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, home, i18n, render, safe, save, ui} = c;
    // LivePicker: the list (LiveWallpaperActivity) and the preview with its button bar.
    function renderLiveWallpapers() {
      const sub = String(ui.sub || '');
      if (sub.startsWith('preview:')) {
        const spec = LiveWallpapers.find(sub.slice(8));
        return `<div class="app-view lw-preview"><div class="lw-preview-bar"><button data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(i18n.t('Set wallpaper'))}</button></div></div>`;
      }
      return `<div class="app-view lw-picker" data-no-translate>${LiveWallpapers.sorted(key => i18n.t(key), i18n.locale()).map(spec => `<button class="lw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span>${safe(i18n.t(spec.label))}</span></button>`).join('')}</div>`;
    }
    return {
      render() {
        return renderLiveWallpapers();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
          case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
          // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
          case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; ui.lwFromPicker = false; home(false); break;
          default: return false;
        }
        return true;
      },
      back() {
        if (ui.view === 'live-wallpapers' && ui.lwFromPicker && String(ui.sub || '').startsWith('preview:')) { ui.lwFromPicker = false; ui.view = 'wallpaper-picker'; ui.sub = ''; render(); return true; }
        if (ui.view === 'live-wallpapers') { if (ui.sub) ui.sub = ''; else { home(false); return true; } render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    back: c => scope(c).back()
  };
  for (const id of ['live-wallpapers']) KK.register(id, spec);
})();
