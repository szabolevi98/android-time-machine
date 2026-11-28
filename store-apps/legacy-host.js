/* The store apps that work (docs/plans/play-apps.md) on the versions built on one simulator.js each (2.3.6, 4.0.4, 4.3,
   4.4.4, 5.1.1). Logic only: it carries no look of its own. The dialog and the menu are put together from each
   version's own framework pieces: settings-dialog with its scrim and actions, the version's AlertDialog, and
   holo-menu, the version's popup menu (or the class the version names: menuClass, lp-popup-menu on 5.1.1). A version
   with framework widgets of its own passes them: dialogMarkup(spec) for its AlertDialog and menu(items) / closeMenu()
   for its options panel (2.3.6: GBUI.dialog and the Menu key's IconMenu).
   An app registers itself as the newer versions' modules do (EC / MM / NG.register):
     StoreHost.register('store-<id>', {title, statusColor, render(c), mount(c, root), action(name, el, c), menu(c),
                        back(c), key(event, c), open(c, resume), clearData(c), tick(c)})
   It is also the module host of the engine migration (docs/plans/engine-migration.md): a version's own screens move
   out of its simulator.js into modules registered here under their view id (2.3.6: GB.register('calculator', ...),
   gb-core.js), and simulator.js asks the host first.
   and the version's simulator.js hosts it: renderApp() draws StoreHost.render, the click handler offers
   StoreHost.action first, Back offers StoreHost.back, renderOverlay() draws StoreHost.overlay for the overlay
   'store-host'. The context `c` an app gets is the version's own: {data, ui, save, render, toast, lang, locale, safe,
   openApp, notify(title, text)}, plus c.dialog(spec) and c.menu(items, anchor) from here. The version gives its context
   to StoreHost.provide(fn); an app's tick(c) then runs every second, open or not (a timer that ends while closed).
     c.dialog({title, message, html, items: [label], buttons: [{label, action(c, value)}], onItem(i, c), enter: index})
       (buttons in the order the version shows them; value is the dialog's text field, if it has one)
     c.menu([{label, action(c), disabled}], anchor) */
(() => {
  'use strict';
  const mods = {};
  let provider = null;
  const e = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  let dialog = null, menu = null;
  function close(c) { dialog = null; menu = null; if (c.ui.overlay === 'store-host') { c.ui.overlay = ''; c.renderOverlay(); } }
  const H = window.StoreHost = {
    register(id, spec) { mods[id] = spec; },
    provide(fn) { provider = fn; },
    has: id => !!mods[id],
    module: id => mods[id],
    ids: () => Object.keys(mods),
    // The runtime of a store item ('pocket-planner' → 'store-pocket-planner'), when its app is here.
    runtime: storeId => mods['store-' + storeId] ? 'store-' + storeId : null,
    // The version's context with the dialog and the menu added.
    context(base) {
      const c = Object.create(base);
      c.dialog = spec => { dialog = spec; menu = null; base.ui.overlay = 'store-host'; base.renderOverlay(); };
      c.menu = (items, anchor) => {
        menu = {items}; dialog = null;
        if (base.menu) { base.menu(items, anchor); return; }
        base.ui.overlay = 'store-host'; base.renderOverlay();
      };
      c.closeOverlay = () => close(base);
      return c;
    },
    render: (id, c) => mods[id].render(c),
    mount(id, c, root) { mods[id]?.mount?.(c, root); },
    overlay(c) {
      if (dialog && c.dialogMarkup) return c.dialogMarkup(dialog);
      if (dialog) {
        const d = dialog;
        const items = d.items ? `<div class="sth-items">${d.items.map((label, i) => `<button type="button" class="settings-row sth-item" data-action="sth-item" data-index="${i}"><span class="row-copy">${e(label)}</span></button>`).join('')}</div>` : '';
        const buttons = d.buttons?.length ? `<div class="settings-dialog-actions">${d.buttons.map((b, i) => `<button type="button" data-action="sth-btn" data-index="${i}">${e(b.label)}</button>`).join('')}</div>` : '';
        return `<div class="settings-dialog-scrim" data-action="sth-cancel"></div><div class="settings-dialog sth-dialog" role="dialog" aria-label="${e(d.title || '')}">${d.title ? `<h3>${e(d.title)}</h3>` : ''}${d.message ? `<p class="sth-message">${e(d.message)}</p>` : ''}${d.html || ''}${items}${buttons}</div>`;
      }
      if (menu) return `<div class="menu-scrim" data-action="sth-cancel"></div><div class="${c.menuClass || 'holo-menu'} sth-menu" role="menu">${menu.items.map((it, i) => `<button type="button" role="menuitem" data-action="sth-mi" data-index="${i}"${it.disabled ? ' disabled' : ''}>${e(it.label)}</button>`).join('')}</div>`;
      return '';
    },
    // After renderOverlay drew it: the text field gets the focus, Enter presses the dialog's default button.
    mountOverlay(c, root) {
      const input = root.querySelector('[role="dialog"] input');
      if (!input || !dialog) return;
      setTimeout(() => { input.focus(); input.setSelectionRange?.(input.value.length, input.value.length); }, 30);
      input.addEventListener('keydown', ev => {
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        const d = dialog, b = d?.buttons?.[d.enter ?? d.buttons.length - 1], value = input.value;
        close(c); b?.action?.(c, value);
      });
    },
    action(name, el, c) {
      if (name === 'sth-cancel') { const d = dialog; close(c); d?.onCancel?.(c); return true; }
      if (name === 'sth-btn') {
        const d = dialog, b = d?.buttons?.[+(el.dataset.index ?? el.dataset.id)], value = el.closest('[role="dialog"]')?.querySelector('input')?.value;
        close(c); b?.action?.(c, value); return true;
      }
      if (name === 'sth-item') { const d = dialog; close(c); d?.onItem?.(+(el.dataset.index ?? el.dataset.id), c); return true; }
      if (name === 'sth-mi') { const it = menu?.items[+(el.dataset.index ?? el.dataset.id)]; if (it?.disabled) return true; c.closeMenu?.(); close(c); it?.action?.(c); return true; }
      if (name === 'sth-overflow') { mods[c.ui.view]?.menu?.(c, el); return true; }
      return !!mods[c.ui.view]?.action?.(name, el, c);
    },
    // Back: an open dialog or menu closes; then the app's own Back.
    back(c) {
      if (c.ui.overlay === 'store-host') { const d = dialog; close(c); d?.onCancel?.(c); return true; }
      return !!mods[c.ui.view]?.back?.(c);
    },
    // The Menu key (2.3.6, 4.0.4's apps without an action bar overflow): the app's options.
    menuKey(c) { const m = mods[c.ui.view]; if (!m?.menu) return false; m.menu(c); return true; },
    // A key typed while the screen is open (the keyboard of the computer): true when the screen took it.
    key(event, c) { return !!mods[c.ui.view]?.key?.(event, c); },
    // The screen is opened (resume: from Recents) and Settings › Apps › Clear data.
    open(id, c, resume) { mods[id]?.open?.(c, resume); },
    clearData(id, c) { mods[id]?.clearData?.(c); }
  };
  // Every second, the apps with a tick (once the version has given its context).
  setInterval(() => {
    if (!provider) return;
    let c = null;
    for (const m of Object.values(mods)) if (m.tick) { c ||= provider(); m.tick(c); }
  }, 1000);
})();
