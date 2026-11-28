/* Google Maps 7.5 in the 4.4.4 shell (docs/plans/engine-migration.md): the map (stock-apps.js), search, layers, directions and navigation (maps-route.js), Settings (maps-prefs.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, i18n, openApp, render, renderOverlay, renderStockApp, save, toast, ui, viewport} = c;
    // Maps directions and navigation (maps-route.js).
    function mrContext() {
      return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), root: viewport, save, render,
        focus: selector => selector && requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
    }
    // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
    const mapsPrefsContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return;
        if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return;
        switch (action) {
          case 'maps-locate': ui.mapsQuery = ''; render(); break;
          // Maps 7.5: the side tab opens the layers menu; a layer toggles the map's look.
          case 'maps-panel': ui.mapsPanel = !ui.mapsPanel; render(); break;
          case 'maps-layer': data.mapsLayer = data.mapsLayer === id ? '' : id; save(); render(); break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, mrContext()); return true; }
        switch (form.dataset.form) {
          case 'maps-search': ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(data, ui.mapsQuery); save(); render(); break;
          default: return false;
        }
        return true;
      },
      back() {
        if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return true; }
        if (ui.view === 'maps' && !ui.overlay && (ui.mapsRoute || ui.navRun) && MapsRoute.back(mrContext())) return true;
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    back: c => scope(c).back()
  };
  for (const id of ['maps']) KK.register(id, spec);
})();
