/* Google Earth 7.1.3 in the 4.4.4 shell (docs/plans/engine-migration.md): the globe (stock-apps.js, earth-app.js), search, its menus and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {earthContext, render, renderOverlay, renderStockApp, ui, viewport} = c;
    return {
      render() {
        return renderStockApp();
      },
      mount(root) {
        if (ui.view === 'earth') EarthApp.mount(viewport, earthContext());
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return; }
        switch (action) {
          case 'earth-search-open': ui.earthSearching = true; render(); viewport.querySelector('.sa-earth-field input')?.focus(); break;
          case 'earth-search-close': ui.earthSearching = false; render(); break;
          case 'earth-clear': ui.overlay = ''; renderOverlay(); ui.earthQuery = ''; render(); break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        switch (form.dataset.form) {
          case 'earth-search': ui.earthSearching = false; EarthApp.search(values.get('query'), earthContext()); render(); break;
          default: return false;
        }
        return true;
      },
      back() {
        if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    mount: (c, root) => scope(c).mount(root),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    back: c => scope(c).back()
  };
  for (const id of ['earth']) KK.register(id, spec);
})();
