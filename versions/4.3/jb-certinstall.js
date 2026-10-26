/* Advanced Wi-Fi › Install certificates on the JWR66Y image: CertInstaller's CertInstallerMain (Credentials.INSTALL_ACTION
   with the Wi-Fi uid) over the demo USB storage's root, which holds one CA certificate and one damaged file:
   - more than one file: CertFileList, "Choose a certificate" (pick_file_pref.xml); none: "No certificate file found in
     USB storage.";
   - a file that does not parse: "The certificate is invalid.";
   - a good one: name_credential_dialog.xml, "Name the certificate" with Certificate name (the file's name), Credential
     use (VPN and apps / Wi-Fi; Wi-Fi when Wi-Fi asks) and "The package contains: one CA certificate"; an empty name or
     one with other than letters and numbers shows its red error line;
   - credential storage needs a PIN or password screen lock first (Settings' credentials_configure_lock_screen_hint);
   - then "%s is installed." and the certificate joins the demo credential storage (data.userCredentials).
   Only the simulator's own storage and credential store are touched. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.certinstall?.[key]; return row ? AndroidStrings.pick(row, ctx.language, row.en || key) : key; };
  // The demo USB storage's root: what CertInstallerMain finds (*.crt, *.cer, *.p12, *.pfx).
  const STORAGE = [{name: 'OfficeWiFi.crt', valid: true}, {name: 'router-backup.cer', valid: false}];
  const base = file => file.replace(/\.[^.]+$/, '');
  const secure = data => window.ICSLockscreen?.secure ? ICSLockscreen.secure(data) : ['pattern', 'pin', 'password'].includes(data.settings?.screenLock);
  function start(ctx, wifi = true) {
    const {ui} = ctx;
    ui.certFlow = {wifi};
    if (!STORAGE.length) { ctx.toast(S(ctx, 'No certificate file found in USB storage.')); return; }
    if (STORAGE.length > 1) { ui.certFlow.step = 'pick'; ctx.open(); return; }
    pick(ctx, STORAGE[0].name);
  }
  function pick(ctx, name) {
    const {ui} = ctx, file = STORAGE.find(f => f.name === name);
    if (!file || !file.valid) { ui.certFlow = null; ctx.close(); ctx.toast(S(ctx, 'The certificate is invalid.')); return; }
    Object.assign(ui.certFlow, {step: 'name', file: file.name, usage: ui.certFlow.wifi ? 1 : 0, error: ''});
    ctx.open();
  }
  function overlay(ctx) {
    const f = ctx.ui.certFlow; if (!f) return '';
    const box = (title, body, buttons = '') => `<div class="settings-dialog-scrim" data-action="cert-cancel"></div><div class="settings-dialog cert-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}${buttons ? `<div class="settings-dialog-actions">${buttons}</div>` : ''}</div>`;
    const cancel = `<button data-action="cert-cancel">${e(S(ctx, 'Cancel'))}</button>`;
    if (f.step === 'pick') return box(S(ctx, 'Choose a certificate'), `<div class="cert-files">${STORAGE.map(file => `<button class="settings-row" data-action="cert-pick" data-id="${e(file.name)}"><span class="row-copy">${e(file.name)}</span></button>`).join('')}</div>`, cancel);
    if (f.step === 'lock') return box(S(ctx, 'Attention'), `<p>${e(S(ctx, 'You need to set a lock screen PIN or password before you can use credential storage.'))}</p>`, cancel + `<button data-action="cert-lock">${e(S(ctx, 'OK'))}</button>`);
    if (f.step === 'name') {
      const usage = [0, 1].map(i => `<option value="${i}"${i === f.usage ? ' selected' : ''}>${e(S(ctx, `usage.${i}`))}</option>`).join('');
      return box(S(ctx, 'Name the certificate'), `<div class="cert-form">${f.error ? `<p class="cert-error">${e(S(ctx, f.error))}</p>` : ''}<label>${e(S(ctx, 'Certificate name:'))}<input data-cert-name value="${e(f.draft ?? base(f.file))}" maxlength="64" autocomplete="off"></label><label>${e(S(ctx, 'Credential use:'))}<select data-cert-usage>${usage}</select></label><p class="cert-info">${e(S(ctx, 'The package contains:'))}<br>${e(S(ctx, 'one CA certificate'))}</p></div>`, cancel + `<button data-action="cert-ok">${e(S(ctx, 'OK'))}</button>`);
    }
    return '';
  }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, f = ui.certFlow;
    switch (action) {
      case 'cert-install': start(ctx, true); return true;
      case 'cert-pick': pick(ctx, id); return true;
      case 'cert-cancel': ui.certFlow = null; ctx.close(); return true;
      case 'cert-lock': ui.certFlow = null; ctx.close(); ctx.lockSettings(); return true;
      case 'cert-ok': {
        if (!f) return true;
        const name = String(ctx.root.querySelector('[data-cert-name]')?.value || '').trim(), usage = Number(ctx.root.querySelector('[data-cert-usage]')?.value || 0);
        f.draft = name; f.usage = usage;
        if (!name) { f.error = 'Type a name.'; ctx.open(); return true; }
        if (!/^[\p{L}\p{N}]+$/u.test(name)) { f.error = 'Type a name that contains only letters and numbers.'; ctx.open(); return true; }
        if (!secure(data)) { f.step = 'lock'; ctx.open(); return true; }
        data.userCredentials = [...(data.userCredentials || []).filter(c => c.name !== name), {name, file: f.file, usage: usage === 1 ? 'wifi' : 'vpn', kind: 'ca', installed: Date.now()}];
        ctx.save(); ui.certFlow = null; ctx.close(); ctx.toast(AndroidStrings.format(S(ctx, '%s is installed.'), name)); return true;
      }
      default: return false;
    }
  }
  window.CertInstall = {STORAGE, start, overlay, handle};
})();
