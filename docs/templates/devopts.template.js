__HEADER__
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // [kind, title, summary, setting key, depends on USB debugging, ...]; kind: check (CheckBoxPreference), switch
  // (SwitchPreference), choice (ListPreference: + entries, summaries or null, default index, dialog title), list (a row
  // with its summary that opens a page or dialog: + its preference key, USB debugging, the summary once set), info (a
  // preferenceInformationStyle row), scale (the animation scale dialog).
  const SECTIONS = __SECTIONS__;
  // English -> {res, hu, de, fr, es} (strings.js) as the image's Settings.apk (or framework-res) translates it.
  const STRINGS = {
    __STRINGS__
  };
  const ICS = __ICS__;
  // The demo phone's VerifierDeviceIdentity (VerifierDeviceIdentity.toString: 13 base32 characters in fours).
  const DEVICE_ID = 'HQ4V-7KZM-2WRD-F';
  // IMM76I's SetFullBackupPassword shows hard-coded English toasts; later images have the local_backup_password_toast_* texts.
  const BACKUP_TOASTS = ICS ? {mismatch: "!!! New password and confirmation don't match !!!", success: '!!! New backup password set !!!', failure: '!!! Failure setting backup password !!!'}
    : {mismatch: "New password and confirmation don't match", success: 'New backup password set', failure: 'Failure setting backup password'};
  // The image's text where it has one, else the caller's t (the shared rows).
  const STR = AndroidStrings.table('', STRINGS), reader = (lang, t) => text => STR.has(text) ? STR.t(text, lang) : t(text);
  const DEFAULTS = {developerEnabled: true, verifyUsb: true, animatorScale: 1};
  const keys = () => SECTIONS.flatMap(([, rows]) => rows.map(row => row[3]).filter(Boolean));
  // PreferenceCategory titles: Holo's list separators are all caps, Material's preference_category_material is not.
  const CATEGORY_CAPS = __CATEGORY_CAPS__;

  function render(settings, t, scaleLabel, lang = 'en') {
    const on = settings.developerEnabled !== false, T = reader(lang, t);
    return SECTIONS.map(([category, rows]) => `${category ? `<div class="section-label">${e(CATEGORY_CAPS ? T(category).toLocaleUpperCase() : T(category))}</div>` : ''}${rows.map(([kind, title, summary, key, dependent, changed]) => {
      const disabled = !on || (dependent && !settings.usbDebug) || (key === 'waitDebugger');
      const attrs = disabled ? 'disabled aria-disabled="true"' : '';
      const copy = `<span class="row-copy">${e(T(title))}${summary ? `<small>${e(T(summary))}</small>` : ''}</span>`;
      if (kind === 'check') return `<button class="settings-row wireless-row jb-dev-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${!!settings[key]}" ${attrs}>${copy}<img class="holo-checkbox" src="assets/btn_check_${settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      if (kind === 'switch') return `<button class="settings-row lp-switch-row jb-dev-row" data-action="toggle-setting" data-id="${key}" role="switch" aria-checked="${!!settings[key]}" ${attrs}>${copy}<span class="lp-mswitch${settings[key] ? ' on' : ''}" aria-hidden="true"></span></button>`;
      if (kind === 'choice') { const [, , , , , entries, summaries, fallback] = SECTIONS.flatMap(([, list]) => list).find(row => row[3] === key); const index = settings[key] ?? fallback; return `<button class="settings-row jb-dev-row" data-action="dev-list" data-id="${key}" ${attrs}><span class="row-copy">${e(T(title))}<small>${e(T((summaries || entries)[index] ?? entries[0]))}</small></span></button>`; }
      if (kind === 'info') return `<button class="settings-row jb-dev-row" data-action="noop" ${attrs}><span class="row-copy">${e(T(title))}<small>${e(DEVICE_ID)}</small></span></button>`;
      if (kind === 'list') return `<button class="settings-row jb-dev-row" data-action="dev-pref" data-id="${key}" ${attrs}><span class="row-copy">${e(T(title))}${summary ? `<small>${e(T(key === 'local_backup_password' && settings.backupPassword ? changed : summary))}</small>` : ''}</span></button>`;
      if (kind === 'scale') return `<button class="settings-row jb-dev-row" data-action="sd-dialog" data-id="${key}" ${attrs}><span class="row-copy">${e(T(title))}<small>${e(t(scaleLabel(settings[key] ?? 1)))}</small></span></button>`;
      return `<button class="settings-row jb-dev-row" data-action="dev-info" data-id="${e(title)}" ${attrs}>${copy}</button>`;
    }).join('')}`).join('');
  }

  // ListPreference's dialog: the title, the entries as single-choice rows, Cancel; a tap picks and closes.
  function dialog(key, settings, t, lang = 'en') {
    const T = reader(lang, t), radio = on => CATEGORY_CAPS ? `<img class="holo-radio" src="assets/btn_radio_${on ? 'on' : 'off'}_holo_dark.png" alt="">` : `<span class="lp-radio${on ? ' on' : ''}" aria-hidden="true"></span>`;
    const alert = (title, message, ok, okAction) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(title || message)}">${title ? `<h3>${e(title)}</h3>` : ''}<p class="dev-dialog-message">${e(message)}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${e(T('Cancel'))}</button><button data-action="${okAction}">${e(ok)}</button></div></div>`;
    // BugreportPreference: its title, bugreport_message and Report; the adb keys dialog: the message, OK and Cancel.
    if (key === 'bugreport') return alert(T('Take bug report'), T('This will collect information about your current device state, to send as an e-mail message. It will take a little time from starting the bug report until it is ready to be sent; please be patient.'), T('Report'), 'dev-bugreport');
    if (key === 'clear_adb_keys') return alert('', T("Revoke access to USB debugging from all computers you've previously authorized?"), T('OK'), 'dev-adb-revoke');
    // AppPicker (Theme.Holo.Dialog / Theme.Material.Light.Dialog): "Nothing", then the debuggable apps, none on a user build.
    if (key === 'debug_app') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog dev-app-picker" role="dialog" aria-label="${e(T('Select application'))}"><h3>${e(T('Select application'))}</h3><button class="settings-row wireless-row" data-action="dev-debug-pick" data-id=""><span class="row-copy">${e(T('Nothing'))}</span></button></div>`;
    const row = SECTIONS.flatMap(([, rows]) => rows).find(item => item[0] === 'choice' && item[3] === key);
    if (!row) return '';
    const [, , , , , entries, , fallback, title] = row, current = settings[key] ?? fallback;
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(T(title))}"><h3>${e(T(title))}</h3>${entries.map((entry, n) => `<button class="settings-row wireless-row" data-action="dev-list-pick" data-id="${key}:${n}" role="radio" aria-checked="${n === current}"><span class="row-copy">${e(T(entry))}</span>${CATEGORY_CAPS ? `<img class="holo-radio" src="assets/btn_radio_${n === current ? 'on' : 'off'}_holo_dark.png" alt="">` : `<span class="lp-radio${n === current ? ' on' : ''}" aria-hidden="true"></span>`}</button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Cancel'))}</button></div></div>`;
  }

  // SetFullBackupPassword (set_backup_pw.xml): the three prompts and password fields, Cancel and Set backup password;
  // the activity has no label of its own, so the title is the app's.
  function page(sub, t, lang = 'en') {
    if (sub !== 'dev-backup-pw') return null;
    const T = reader(lang, t), field = (prompt, name) => `<label class="dev-backup-field"><span>${e(T(prompt))}</span><input type="password" name="${name}" autocomplete="off"></label>`;
    return {title: T('Settings'), body: `<form class="dev-backup-pw" data-form="dev-backup-pw">${field('Type your current full backup password here', 'current')}${field('Type a new password for full backups here', 'new')}${field('Retype your new full backup password here', 'confirm')}<div class="dev-backup-buttons"><button type="button" data-action="dev-backup-cancel">${e(T('Cancel'))}</button><button type="button" data-action="dev-backup-set">${e(T('Set backup password'))}</button></div></form>`};
  }
  // BackupManagerService keeps a PBKDF2 hash of the password; the simulator keeps a SHA-256 one (with a salt) in
  // settings.backupPassword. With none saved, the current password has to be empty; an empty new one removes it.
  async function digest(salt, text) {
    const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + text)));
    return [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  }
  async function setBackupPassword(settings, current, next) {
    const saved = settings.backupPassword;
    if (saved ? await digest(saved.salt, current) !== saved.digest : current !== '') return false;
    if (!next) { delete settings.backupPassword; return true; }
    const salt = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
    settings.backupPassword = {salt, digest: await digest(salt, next)};
    return true;
  }
  // The rows' actions; ctx: {data, ui, root, save, render, renderOverlay, toast(text), t, language}. True when handled.
  function handle(action, id, ctx) {
    const {data, ui} = ctx, T = reader(ctx.language, ctx.t), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'dev-pref':
        if (id === 'local_backup_password') { ui.sub = 'dev-backup-pw'; ctx.render(); ctx.root.querySelector('.dev-backup-pw input')?.focus(); return true; }
        if (id === 'proc_stats') { ui.sub = 'dev-procstats'; ctx.render(); return true; }
        ui.devList = id; ui.overlay = 'dev-list'; ctx.renderOverlay(); return true;
      // Report starts the bugreport service, which posts its notification minutes later; Revoke clears the adb keys
      // (the simulator has no USB host); Nothing leaves no debug app set.
      case 'dev-bugreport': case 'dev-adb-revoke': case 'dev-debug-pick': close(); return true;
      case 'dev-backup-cancel': ui.sub = 'development'; ctx.render(); return true;
      case 'dev-backup-set': {
        const form = ctx.root.querySelector('.dev-backup-pw'); if (!form) return true;
        const [current, next, confirm] = ['current', 'new', 'confirm'].map(name => form.elements[name].value);
        if (next !== confirm) { ctx.toast(T(BACKUP_TOASTS.mismatch)); return true; }
        setBackupPassword(data.settings, current, next).then(ok => {
          ctx.toast(T(ok ? BACKUP_TOASTS.success : BACKUP_TOASTS.failure));
          if (ok) { ctx.save(); if (ui.sub === 'dev-backup-pw') { ui.sub = 'development'; ctx.render(); } }
        });
        return true;
      }
    }
    return false;
  }

  /* Overlays: layout bounds (red clip bounds and blue corner marks), PointerLocationView's top bar, and the
     LoadAverageService panel at the top right. */
  function apply(screen, settings) {
    const on = settings.developerEnabled !== false;
    screen.classList.toggle('dev-layout-bounds', on && !!settings.layoutBounds);
    let pointer = screen.querySelector('.dev-pointer-bar'), cpu = screen.querySelector('.dev-cpu');
    if (on && settings.pointerLocation && !pointer) { pointer = document.createElement('div'); pointer.className = 'dev-pointer-bar'; pointer.setAttribute('aria-hidden', 'true'); pointer.textContent = 'P: 0 / 0   X: 0.0   Y: 0.0   Xv: 0.000   Yv: 0.000   Prs: 0.00   Size: 0.00'; screen.append(pointer); }
    if (!(on && settings.pointerLocation) && pointer) pointer.remove();
    if (on && settings.showCpu && !cpu) { cpu = document.createElement('div'); cpu.className = 'dev-cpu'; cpu.setAttribute('aria-hidden', 'true'); screen.append(cpu); updateCpu(cpu); }
    if (!(on && settings.showCpu) && cpu) cpu.remove();
  }
  function updateCpu(cpu) {
    const t = Date.now() / 1000, load = [0.48 + .12 * Math.sin(t / 7), 0.42 + .06 * Math.sin(t / 19), 0.39];
    const procs = [['system_server', 4 + 3 * Math.abs(Math.sin(t / 3))], ['com.android.systemui', 2 + 2 * Math.abs(Math.sin(t / 5))], ['surfaceflinger', 1.5 + Math.abs(Math.sin(t / 2))], ['com.android.launcher', 1 + Math.abs(Math.sin(t / 4))]];
    cpu.innerHTML = `<b>${load.map(v => v.toFixed(2)).join(' / ')}</b>${procs.map(([name, value]) => `<span><i style="width:calc(${(value * 6 / __DP__).toFixed(4)} * var(--dp))"></i>${name}</span>`).join('')}`;
  }
  function pointerMove(screen, event, down, count) {
    const bar = screen.querySelector('.dev-pointer-bar'); if (!bar) return;
    const box = screen.getBoundingClientRect(), k = box.width / screen.offsetWidth || 1, x = (event.clientX - box.left) / k * 2, y = (event.clientY - box.top) / k * 2;
    bar.textContent = `P: ${down ? 1 : 0} / ${count}   X: ${x.toFixed(1)}   Y: ${y.toFixed(1)}   Xv: 0.000   Yv: 0.000   Prs: ${down ? '1.00' : '0.00'}   Size: ${down ? '0.20' : '0.00'}`;
  }
  window.JBDeveloperOptions = {SECTIONS, STRINGS, DEFAULTS, keys, render, dialog, page, handle, apply, updateCpu, pointerMove};
})();
