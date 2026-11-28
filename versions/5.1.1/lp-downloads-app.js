/* Downloads on Android 5.1.1 (DocumentsUI's Downloads root, lp-downloads.js draws it), moved out of simulator.js
   (docs/plans/engine-migration.md): the screen, its Sort by and overflow menus, and opening a downloaded PDF or photo. */
'use strict';
LP.define('downloads', ({
  i18n, openApp, overlayRoot, photosContext, printContext, render, renderOverlay, toast, ui
}, lp) => {
  // lp:code
  return {
    // lp:hooks
    render() {
      return LPDownloads.render(lp.data.downloads || [], ui, key => i18n.t(key), i18n.locale());
      // lp:render
    },
    overlays: {
      ...Object.fromEntries(['ldu-sort', 'ldu-overflow'].map(name => [name, () => {
        overlayRoot.innerHTML = LPDownloads.menu(ui.overlay.slice(4), ui, key => i18n.t(key));
      }])),
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'ldu-menu': ui.overlay = `ldu-${id}`; renderOverlay(); break;
        case 'ldu-sort': ui.dlSort = id; ui.overlay = ''; render(); break;
        case 'ldu-view': ui.dlGrid = id === 'grid'; ui.overlay = ''; render(); break;
        case 'ldu-search': toast('No items'); break;
        case 'dl-open-pdf': { const doc = (lp.data.downloads || []).find(d => String(d.time) === id); if (doc) PrintSpooler.openPdf(printContext(), doc); break; }
        case 'dl-open-photo': { const photo = lp.data.photos.find(p => p.id === Number(id)); if (!photo) break; openApp('photos'); ui.photosList = 'all'; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(p => p.id === photo.id)); ui.selectedPhoto = photo.id; ui.sub = 'photo'; render(); break; }
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
