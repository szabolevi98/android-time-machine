/* Messaging › Settings of the Galaxy Nexus (4.0.4, IMM76I) and Nexus 4 (4.3, JWR66Y) images: Mms.apk's
   MessagingPreferenceActivity on res/xml/preferences.xml, drawn on the version's Holo Light mps- rows under Messaging's
   own action bar. Texts are the APKs' (mms-strings.js, keys "pref.*").
   - Storage settings: Delete old messages (off), then the Text / Multimedia message limits (dependent on it). Each opens
     Mms's NumberPickerDialog ("Set number of messages to save" over a NumberPicker, Set / Cancel) and shows
     "%1$s messages per conversation". mms_config.xml of both images: 500 and 50, 10 to 5000.
   - Text (SMS) messages: Delivery reports (off), Manage SIM card messages (ManageSimMessages: the SIM holds none, so
     sim_empty).
   - Multimedia (MMS) messages: 4.3 starts with Group messaging (on); Delivery reports and Read reports (off; MmsConfig
     enables both in the two images, read from their dex), Auto-retrieve (on), Roaming auto-retrieve (off, dependent).
   - Notification settings: Notifications (on), Select ringtone (the notification sounds), and Vibrate: 4.0.4's
     ListPreference (Always / Only when silent / Never, default never), 4.3's check box (off); both dependent.
   - The menu's Restore default settings (restoreDefaultPreferences) drops the stored values.
   Values live in data.mmsPrefs; the screens in ui.mmsPrefs ('root' / 'sim'), the dialog in ui.mmsDialog. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const LIMITS = {sms_limit: 500, mms_limit: 50}, MIN = 10, MAX = 5000;
  const VIBRATE = ['always', 'silent', 'never'];
  const values = ctx => ctx.data.mmsPrefs ||= {};
  const get = (ctx, key, def) => values(ctx)[key] ?? def;
  // The rows in preferences.xml's order for the version.
  function rows(ctx) {
    const M = ctx.M, jb = ctx.version === '4.3';
    const limit = key => ({key, kind: 'limit', title: M(`pref.${key}`), summary: AndroidStrings.format(M('pref.limit_sum'), get(ctx, key, LIMITS[key])), dep: 'auto_delete'});
    return [
      {kind: 'cat', title: M('pref.storage')},
      {key: 'auto_delete', kind: 'check', title: M('pref.auto_delete'), summary: M('pref.auto_delete_sum'), def: false},
      limit('sms_limit'), limit('mms_limit'),
      {kind: 'cat', title: M('pref.sms')},
      {key: 'sms_reports', kind: 'check', title: M('pref.sms_reports'), summary: M('pref.sms_reports_sum'), def: false},
      {key: 'sim', kind: 'open', title: M('pref.sim'), summary: M('pref.sim_sum')},
      {kind: 'cat', title: M('pref.mms')},
      ...(jb ? [{key: 'group', kind: 'check', title: M('pref.group'), summary: M('pref.group_sum'), def: true}] : []),
      {key: 'mms_reports', kind: 'check', title: M('pref.mms_reports'), summary: M('pref.mms_reports_sum'), def: false},
      {key: 'read', kind: 'check', title: M('pref.read'), summary: M('pref.read_sum'), def: false},
      {key: 'retrieve', kind: 'check', title: M('pref.retrieve'), summary: M('pref.retrieve_sum'), def: true},
      {key: 'roaming', kind: 'check', title: M('pref.roaming'), summary: M('pref.roaming_sum'), def: false, dep: 'retrieve'},
      {kind: 'cat', title: M('pref.notifications')},
      {key: 'notify', kind: 'check', title: M('pref.notify'), summary: jb ? '' : M('pref.notify_sum'), def: true},
      {key: 'ringtone', kind: 'tone', title: M('pref.ringtone'), dep: 'notify'},
      jb ? {key: 'vibrate', kind: 'check', title: M('pref.vibrate_when'), def: false, dep: 'notify'}
        : {key: 'vibrate_when', kind: 'list', title: M('pref.vibrate_when'), summary: M('pref.vibrate_when_sum'), def: 2, dep: 'notify'}
    ];
  }
  const find = (ctx, key) => rows(ctx).find(r => r.key === key);
  const enabled = (ctx, r) => !r.dep || !!get(ctx, r.dep, find(ctx, r.dep).def);
  const sounds = () => Object.keys(window.SystemSounds?.SOUNDS?.notifications || {});
  const soundName = key => window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || key;
  function dialog(ctx) {
    const d = ctx.ui.mmsDialog, M = ctx.M; if (!d) return '';
    const shell = (title, body, buttons) => `<button class="mps-scrim" data-action="mmsp-cancel" aria-label="${e(M('Cancel'))}"></button><div class="mps-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="mps-buttons">${buttons}</div></div>`;
    const cancel = `<button data-action="mmsp-cancel">${e(M('Cancel'))}</button>`;
    if (d in LIMITS) {
      // NumberPicker: the values around the chosen one step it; the ends hold.
      const v = ctx.ui.mmsPick ?? get(ctx, d, LIMITS[d]);
      const cell = (n, step) => n < MIN || n > MAX ? '<span class="mmsp-np-cell"></span>' : `<button class="mmsp-np-cell" data-action="mmsp-step" data-id="${step}">${n}</button>`;
      return shell(M(`pref.${d}`), `<p class="mmsp-np-label">${e(M('pref.to_save'))}</p><div class="mmsp-np" role="spinbutton" aria-valuenow="${v}" aria-valuemin="${MIN}" aria-valuemax="${MAX}">${cell(v - 1, -1)}<output class="mmsp-np-value">${v}</output>${cell(v + 1, 1)}</div>`,
        `${cancel}<button data-action="mmsp-set" data-id="${d}">${e(M('pref.set'))}</button>`);
    }
    if (d === 'vibrate_when') {
      const cur = get(ctx, 'vibrate_when', 2), label = ['pref.vibrate_always', 'pref.vibrate_silent', 'pref.vibrate_never'];
      return shell(M('pref.vibrate_dialog'), `<div class="mps-choices">${label.map((key, i) => `<button data-action="mmsp-pick" data-id="${i}" role="radio" aria-checked="${cur === i}"><span>${e(M(key))}</span><i class="mps-radio${cur === i ? ' on' : ''}"></i></button>`).join('')}</div>`, cancel);
    }
    if (d === 'ringtone') {
      const cur = get(ctx, 'ringtone', window.SystemSounds?.DEFAULTS?.notifications || '');
      return shell(M('pref.ringtone'), `<div class="mps-choices">${['', ...sounds()].map(k => `<button data-action="mmsp-tone" data-id="${e(k)}" role="radio" aria-checked="${cur === k}"><span>${e(k ? soundName(k) : ctx.t('Silent'))}</span><i class="mps-radio${cur === k ? ' on' : ''}"></i></button>`).join('')}</div>`, cancel);
    }
    return '';
  }
  function render(ctx) {
    const {ui, M} = ctx;
    if (ui.mmsPrefs === 'sim') return `<div class="app-view sa-app mps mmsp">${ctx.bar(M('pref.sim_title'))}<div class="sa-scroll mps-list"><p class="mps-empty">${e(M('pref.sim_empty'))}</p></div></div>`;
    const row = r => {
      if (r.kind === 'cat') return `<div class="mps-cat">${e(r.title)}</div>`;
      const on = enabled(ctx, r), value = r.kind === 'check' && !!get(ctx, r.key, r.def);
      return `<button class="mps-row${on ? '' : ' disabled'}" data-action="mmsp-row" data-id="${r.key}"${on ? '' : ' disabled'}${r.kind === 'check' ? ` role="checkbox" aria-checked="${value}"` : ''}><span><b>${e(r.title)}</b>${r.summary ? `<small>${e(r.summary)}</small>` : ''}</span>${r.kind === 'check' ? `<i class="mps-check${value ? ' on' : ''}" role="presentation"></i>` : ''}</button>`;
    };
    return `<div class="app-view sa-app mps mmsp">${ctx.bar(M('Settings'), true)}<div class="sa-scroll mps-list">${rows(ctx).map(row).join('')}</div>${dialog(ctx)}</div>`;
  }
  function handle(action, id, ctx) {
    if (!action.startsWith('mmsp-')) return false;
    const {ui} = ctx, v = values(ctx);
    switch (action) {
      case 'mmsp-open': ui.mmsPrefs = 'root'; ui.mmsDialog = ''; break;
      case 'mmsp-row': {
        const r = find(ctx, id); if (!r || !enabled(ctx, r)) return true;
        if (r.kind === 'check') { v[id] = !get(ctx, id, r.def); ctx.save(); }
        else if (r.kind === 'open') ui.mmsPrefs = 'sim';
        else { ui.mmsDialog = r.kind === 'tone' ? 'ringtone' : id; ui.mmsPick = undefined; }
        break;
      }
      case 'mmsp-step': ui.mmsPick = Math.min(MAX, Math.max(MIN, (ui.mmsPick ?? get(ctx, ui.mmsDialog, LIMITS[ui.mmsDialog])) + Number(id))); break;
      case 'mmsp-set': if (ui.mmsPick !== undefined) { v[id] = ui.mmsPick; ctx.save(); } ui.mmsDialog = ''; ui.mmsPick = undefined; break;
      case 'mmsp-pick': v.vibrate_when = Number(id); ctx.save(); ui.mmsDialog = ''; break;
      case 'mmsp-tone': v.ringtone = id; ctx.save(); ui.mmsDialog = ''; if (id) window.SystemSounds?.play?.('notifications', id); break;
      case 'mmsp-cancel': ui.mmsDialog = ''; ui.mmsPick = undefined; break;
      case 'mmsp-restore': ctx.data.mmsPrefs = {}; ctx.save(); break;
      default: return false;
    }
    ctx.render();
    return true;
  }
  // The overflow on the settings: Restore default settings.
  const menu = ctx => ctx.ui.mmsPrefs === 'root' ? [{action: 'mmsp-restore', title: ctx.M('pref.restore')}] : [];
  // Back: a dialog, the SIM messages, then Settings itself.
  function back(ui) {
    if (ui.mmsDialog) { ui.mmsDialog = ''; ui.mmsPick = undefined; return true; }
    if (ui.mmsPrefs === 'sim') { ui.mmsPrefs = 'root'; return true; }
    if (ui.mmsPrefs) { ui.mmsPrefs = ''; return true; }
    return false;
  }
  window.MmsPrefs = {render, handle, menu, back, rows, LIMITS};
})();
