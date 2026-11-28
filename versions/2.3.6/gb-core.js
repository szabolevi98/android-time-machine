/* Android 2.3.6's core, as it grows out of simulator.js (docs/plans/engine-migration.md). Every screen moves into a
   module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do:
     GB.register(id, {render(c), mount(c, root), action(name, el, c), back(c), menu(c), key(event, c), open(c, resume),
                      submit(name, values, c), input(event, c), dialog(kind, c), clearData(c), tick(c)})
   For now simulator.js hosts the modules through store-apps/legacy-host.js and gives them its context `c`
   (storeContext): {data, ui, save, render, renderOverlay, toast, openApp, safe, lang, locale, t, viewport, screen,
   overlayRoot, dp(n), deviceDate(), defaults, clone, suppressClick(ms), suppressRelease(), snapResting(el), intent},
   plus c.dialog(spec) and c.menu(items) (the host's), c.gbDialog(kind) (2.3.6's AlertDialog from the module's
   dialog(kind, c)) and c.gbMenu(items) (the Menu key's IconMenu). */
window.GB = window.StoreHost;

// A long press (550 ms, ViewConfiguration's long-press timeout) or a right click on an element of the screen opens
// its context menu: open(el) runs and the release does not also tap the element. The listeners go on the screen's own
// element (root's first child, drawn anew by every render), so they leave with it.
GB.hold = (c, root, selector, open) => {
  root = root.firstElementChild || root;
  let timer = null, start = null;
  root.addEventListener('pointerdown', event => {
    const el = event.target.closest(selector); if (!el || c.ui.overlay) return;
    start = {x: event.clientX, y: event.clientY};
    timer = setTimeout(() => { c.suppressRelease(); open(el); }, 550);
  });
  root.addEventListener('pointermove', event => { if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) clearTimeout(timer); });
  for (const name of ['pointerup', 'pointercancel']) root.addEventListener(name, () => { clearTimeout(timer); start = null; });
  root.addEventListener('contextmenu', event => { const el = event.target.closest(selector); if (el && !c.ui.overlay) open(el); });
};
