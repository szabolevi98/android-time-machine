/* Downloads (IMM76I DownloadProviderUi.apk, the holo-downloads template: ics-downloads.js), moved out of simulator.js
   (docs/plans/engine-migration.md): its list, sort order, selection and dialogs; data.downloads is seeded on first use,
   the sort order and the selection live in ui.hdl. */
(() => {
  'use strict';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    // Downloads: data.downloads (seeded on first use); the sort order and the selection live in ui.hdl.
    function dlContext() {
      return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), hour24: !!data.settings.hour24, t: key => i18n.t(key),
        save, render, renderOverlay, toast, openApp};
    }

    return {dlContext};
  }

  ICS.register('downloads', {
    render(c) { return HoloDownloads.render(api(c).dlContext()); },
    // Its dialogs are drawn as they are (not translated, no launcher clings).
    ownOverlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {dlContext} = api(c);
      if (ui.view === 'downloads' && ui.overlay.startsWith('hdl-')) return HoloDownloads.overlay(dlContext()) || '';
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {dlContext} = api(c), {id} = button.dataset;
      if (ui.view === 'downloads' && action.startsWith('hdl-') && HoloDownloads.handle(action, id, dlContext())) return true;
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {dlContext} = api(c);
      if (ui.view === 'downloads' && HoloDownloads.back(dlContext())) return true;
      return false;
    },
  });
})();
