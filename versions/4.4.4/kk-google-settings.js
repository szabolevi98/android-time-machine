/* Google Settings (GmsCore 4.3.23) in the 4.4.4 shell (docs/plans/engine-migration.md): the list (stock-apps.js), its pages and dialogs (gms-settings.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, render, renderStockApp, save, ui} = c;
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          // Google, Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google Settings
          // Google Settings' GMS pages (gms-settings.js).
          case 'gms-open': ui.sub = `gms-${id}`; ui.gmsDialog = ''; if (id === 'ads' && !data.gms?.adid) { data.gms = {...GMSSettings.state(data), adid: GMSSettings.newId()}; save(); } render(); break;
          case 'gms-toggle': { const s = GMSSettings.state(data); data.gms = {...s, [id]: !s[id]}; save(); render(); break; }
          case 'gms-reset': ui.gmsDialog = ''; data.gms = {...GMSSettings.state(data), adid: GMSSettings.newId()}; save(); render(); break;
          case 'gms-dialog': ui.gmsDialog = id; ui.gmsUnderstand = false; render(); break;
          case 'gms-understand': ui.gmsUnderstand = !ui.gmsUnderstand; render(); break;
          case 'gms-delete': ui.gmsDialog = ''; ui.gmsDeleting = true; render(); setTimeout(() => { ui.gmsDeleting = false; if (ui.sub === 'gms-history') render(); }, 1500); break;
          default: return false;
        }
        return true;
      },
      backAlways() {
        if (ui.view === 'google-settings' && GMSSettings.back(ui)) { render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    backAlways: c => scope(c).backAlways()
  };
  for (const id of ['google-settings']) KK.register(id, spec);
})();
