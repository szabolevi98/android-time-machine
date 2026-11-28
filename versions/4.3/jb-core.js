/* Android 4.3's core, as it grows out of simulator.js (docs/plans/engine-migration.md, docs/plans/engine-migration-4.3.md).
   Every screen moves into a module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do:
     JB.register(id, {render(c), mount(c, root), action(name, el, c), back(c), menu(c), key(event, c), open(c, resume),
                      clearData(c), tick(c), overlay(c)})
   overlay(c) draws the module's own overlays (its ui.overlay names; anything else: undefined).
   For now simulator.js hosts the modules through store-apps/legacy-host.js and gives them its context `c`
   (storeContext): {data, ui, save, render, renderOverlay, toast, openApp, safe, lang, locale, t, viewport, screen,
   dp(n), suppressClick(ms), snapResting(el), holdDelay(ms)}, plus c.dialog(spec) and c.menu(items) from the host. */
window.JB = window.StoreHost;
