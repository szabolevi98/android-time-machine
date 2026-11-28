/* Android 4.0.4's core, as it grows out of simulator.js (docs/plans/engine-migration.md, progress in
   docs/plans/engine-migration-4.0.4.md). Every screen moves into a module that registers itself, as 2.1's (EC), 6.0.1's
   (MM) and 7.1.2's (NG) do:
     ICS.register(id, {render(c), mount(c, root), action(name, el, c), back(c), key(event, c), clearData(c), ...})
   For now simulator.js hosts the modules through store-apps/legacy-host.js and gives them its context `c`
   (storeContext). */
window.ICS = window.StoreHost;
