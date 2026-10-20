/* Android 7.1.2 framework AlertDialog (framework-res.apk of N2G48C, Theme.DeviceDefault.Light.Dialog.Alert, the theme
   SystemUIDialog and the system context use, and the Material light dialogs of the apps). The logic is 6.0.1's
   (mm-dialog.js); the look is drawn from N2G48C in ng-dialog.css:
   - alert_dialog_material.xml: alert_dialog_title_material (18 dp from the top, dialogPreferredPadding 24 dp at the
     sides, an optional 32 dp icon 8 dp before the title), the message (TextAppearance.Material.Subhead), a list
     (select_dialog_material, select_dialog_item_material rows) or custom content, then alert_dialog_button_bar_material
     (neutral at the start, negative and positive at the end).
   - progress_dialog_material.xml: the indeterminate spinner 24 dp before the message, 18 dp above and below.
   Use: c.dialog({title, icon, message, items: [{html}], html, buttons: [{label, action(c), neutral, disabled}], progress,
   cancelable, keepOpen, onItem(i, c), onLongItem(i, c), onCancel(c), mount(c, win)}) opens it as the overlay 'dialog';
   NG.dialog.markup / .action draw and drive the same for a module that owns its overlay (the shade, the power menu). */
(() => {
  'use strict';
  function markup(c, d) {
    // The colorAccent of the app's AlertDialog theme: the dialog's own, else the open screen's (module.dialogAccent).
    const accent = d.accent || NG.module(c.ui.view)?.dialogAccent?.(c) || '';
    const head = d.title ? `<div class="ngdlg-title">${d.icon ? `<img src="${c.safe(d.icon)}" alt="">` : ''}<span>${c.safe(d.title)}</span></div>` : '';
    const message = d.message ? `<div class="ngdlg-message${d.title ? '' : ' first'}${d.buttons?.length ? '' : ' last'}">${c.safe(d.message)}</div>` : '';
    const progress = d.progress ? `<div class="ngdlg-progress"><svg class="ngdlg-spinner" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19"/></svg><span>${c.safe(d.progress)}</span></div>` : '';
    const items = d.items ? `<div class="ngdlg-list${d.title ? '' : ' first'}${d.buttons?.length ? '' : ' last'}">${d.items.map((item, i) => `<button type="button" class="ngdlg-item" data-action="ngdlg-item" data-index="${i}">${item.html}</button>`).join('')}</div>` : '';
    const buttons = d.buttons?.length ? `<div class="ngdlg-buttons">${d.buttons.map((b, i) => `${b.neutral ? '' : i === 0 || d.buttons[i - 1]?.neutral ? '<i class="ngdlg-spacer"></i>' : ''}<button type="button" class="ngdlg-button" data-action="ngdlg-button" data-index="${i}"${b.disabled ? ' disabled' : ''}>${c.safe(b.label)}</button>`).join('')}</div>` : '';
    return `<div class="ngdlg"><div class="ngdlg-dim" data-action="ngdlg-cancel"></div><div class="ngdlg-win" role="dialog"${accent ? ` style="--ngdlg-accent:${accent}"` : ''}>${head}${message}${progress}${items}${d.html ? `<div class="ngdlg-body">${d.html}</div>` : ''}${buttons}</div></div>`;
  }
  function close(c) { if (c.ui.overlay === 'dialog') { c.ui.dialogSpec = null; c.closeOverlay(); } }
  function action(c, name, el, d, done = () => close(c)) {
    if (name === 'ngdlg-cancel') { if (d.cancelable !== false) { done(); d.onCancel?.(c); } return true; }
    if (name === 'ngdlg-button') { const b = d.buttons[+el.dataset.index]; if (b?.disabled) return true; done(); b?.action?.(c); return true; }
    if (name === 'ngdlg-item') { const i = +el.dataset.index; if (!d.keepOpen) done(); d.onItem?.(i, c); return true; }
    return false;
  }
  // A long press on a list row (GlobalActions' setOnItemLongClickListener).
  function mountLong(c, root, d, done = () => close(c)) {
    if (!d.onLongItem) return;
    for (const el of root.querySelectorAll('.ngdlg-item')) {
      let timer = 0, held = false;
      el.addEventListener('pointerdown', () => { held = false; timer = setTimeout(() => { held = true; if (d.onLongItem(+el.dataset.index, c)) done(); }, 500); });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(type, () => clearTimeout(timer));
      el.addEventListener('click', e => { if (held) { e.stopPropagation(); held = false; } }, true);
    }
  }
  NG.dialog = {markup, action, mountLong, close};

  NG.register('dialog', {
    app: false,
    init(c) { c.dialog = spec => { c.ui.dialogSpec = spec; c.overlay('dialog'); }; c.closeDialog = () => close(c); },
    render: c => c.ui.dialogSpec ? markup(c, c.ui.dialogSpec) : '',
    mount(c, root) { const d = c.ui.dialogSpec; if (d) { mountLong(c, root, d); d.mount?.(c, root.querySelector('.ngdlg-win')); } },
    back(c) { const d = c.ui.dialogSpec; if (d?.cancelable === false) return true; close(c); d?.onCancel?.(c); return true; },
    action(name, el, event, c) { return c.ui.dialogSpec ? action(c, name, el, c.ui.dialogSpec) : false; }
  });
})();
