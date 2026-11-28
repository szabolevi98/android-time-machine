/* Android 5.1.1's core, as it grows out of simulator.js (docs/plans/engine-migration.md). Every screen moves into a
   module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do. LP is the module host
   (store-apps/legacy-host.js): LP.register(id, {render(c), mount(c, root), action(name, el, c), back(c), menu(c),
   key(event, c), open(c, resume), clearData(c), tick(c)}), with the context `c` of simulator.js's storeContext().
   The screens that leave simulator.js keep their code as it was: a module is defined with
     LP.define(id, ({ui, data, render, ...}, lp) => { ...the screen's code...; return {render, click, ...}; })
   and is started once simulator.js has given its bindings (LP.kernel, live getters): the first argument holds them,
   lp (LP.live) reads the ones that change (pointerStart, suppressClickUntil...) and the functions other modules or
   the core share (a module adds its own with Object.assign(lp, {...})). A module's click(action, button, event) takes
   the clicks of its former switch cases (true when it took one), wherever the button is; submit(name, values, event,
   form) its forms, input(event) its fields, overlays[name](root) the overlays it draws. */
window.LP = window.StoreHost;
(() => {
  'use strict';
  // LP is the host itself: what is added here must not replace one of its own methods (overlay, action, ...).
  const add = (name, value) => { if (name in LP) throw new Error(`LP.${name} is the host's`); LP[name] = value; };
  const live = {}, defined = [];
  add('live', live);
  add('define', (id, factory) => { defined.push([id, factory]); });
  add('kernel', getters => { Object.defineProperties(live, Object.getOwnPropertyDescriptors(getters)); });
  // A screen shared by several views (the Play apps) is defined once under all of their ids.
  add('start', () => { for (const [id, factory] of defined) { const spec = factory(live, live); for (const one of [id].flat()) LP.register(one, spec); } });
  // The version's own screens (the store apps answer the host's view-scoped hooks instead).
  const specs = () => [...new Set(LP.ids().filter(id => !id.startsWith('store-')).map(id => LP.module(id)))];
  // A screen's own overlay (ui.overlay names it): true when a module drew it into root.
  add('drawOverlay', (name, root) => {
    for (const m of specs()) { const draw = m.overlays?.[name]; if (draw) { draw(root); return true; } }
    // a module that names its overlays itself: overlay(name, root), true when it drew one
    for (const m of specs()) if (m.overlay?.(name, root)) return true;
    return false;
  });
  add('dispatchClick', (action, button, event) => {
    for (const m of specs()) if (m.click?.(action, button, event)) return true;
    return false;
  });
  // A form's submit (data-form names it) and a field's input: true when a module took it.
  add('dispatchSubmit', (name, values, event, form) => {
    for (const m of specs()) if (m.submit?.(name, values, event, form)) return true;
    return false;
  });
  add('dispatchInput', event => {
    for (const m of specs()) if (m.input?.(event)) return true;
    return false;
  });
})();
