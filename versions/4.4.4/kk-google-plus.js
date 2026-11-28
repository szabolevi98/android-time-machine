/* Google+ 4.2.3 in the 4.4.4 shell (docs/plans/engine-migration.md): the stream (stock-apps.js), +1, refresh, New post and Settings (plus-post.js) and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, plusContext, render, renderOverlay, renderStockApp, save, ui} = c;
    return {
      render() {
        return renderStockApp();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (ui.view === 'google-plus' && action.startsWith('gpp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusPost.handle(action, id, plusContext())) return; }
        switch (action) {
          case 'gplus-plus': { const plus = data.gplusPlus || []; data.gplusPlus = plus.includes(id) ? plus.filter(x => x !== id) : [...plus, id]; save(); render(); break; }
          case 'gplus-refresh': ui.overlay = ''; renderOverlay(); render(); break;
          default: return false;
        }
        return true;
      },
      input(event) {
        if (PlusPost.input(event.target)) return true;
        return false;
      },
      back() {
        if (ui.view === 'google-plus' && !ui.overlay && PlusPost.back(ui)) { render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    input: (event, c) => scope(c).input(event),
    back: c => scope(c).back()
  };
  for (const id of ['google-plus']) KK.register(id, spec);
})();
