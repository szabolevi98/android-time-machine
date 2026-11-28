/* Android 2.3.6's core, as it grows out of simulator.js (docs/plans/engine-migration.md). Every screen moves into a
   module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do:
     GB.register(id, {render(c), mount(c, root), action(name, el, c), back(c), menu(c), key(event, c), open(c, resume),
                      clearData(c), tick(c)})
   For now simulator.js hosts the modules through store-apps/legacy-host.js and gives them its context `c`
   (storeContext): {data, ui, save, render, renderOverlay, toast, openApp, safe, lang, locale, t, viewport, screen,
   dp(n), suppressClick(ms), snapResting(el)}, plus c.dialog(spec) and c.menu(items) (GBUI's AlertDialog and the Menu
   key's IconMenu). */
window.GB = window.StoreHost;
