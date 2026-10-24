"""Writes versions/<v>/email-prefs.js: the AOSP Email app's settings screens of each factory image, read from its
EmailGoogle APK: the general preferences and the account's account_settings_preferences.xml as a list of rows
(category, check box, list, edit text or a screen) with their texts, list entries and defaults in English, Hungarian,
German, French and Spanish. The screens it draws itself: Quick responses (account_settings_edit_quick_responses_fragment.xml:
the list, "No quick responses", Create new; the Edit quick response dialog with Cancel / Delete / Save), the ringtone
(RingtonePickerActivity: Silent and the image's notification sounds, played when touched, Cancel / OK) and the server
settings (account_setup_incoming_fragment.xml / account_setup_outgoing_fragment.xml in
account_settings_incoming_fragment.xml: the IMAP fields, the security spinner, Require sign-in, Cancel / Done). They are
kept on the phone; nothing connects to a server. Remove account stays a service limit.
    python docs/tools/email-prefs.py
Rows an IMAP account does not show are dropped as AccountSettingsFragment drops them (contacts and calendar sync,
Exchange policies, the system folder pickers)."""
import glob, json, re
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
LANGS = ['', 'hu', 'de', 'fr', 'es']
VERSIONS = {
    '4.0.4': ('maguro', 'EmailGoogle', 'header_label_general_preferences'),
    '4.3': ('mako', 'EmailGoogle', 'header_label_general_preferences'),
    '4.4.4': ('hammerhead', 'EmailGoogle', 'header_label_general_preferences'),
    '5.1.1': ('shamu', 'PrebuiltEmailGoogle', 'general_preferences_title'),
}
# Defaults the code sets rather than the XML: normal text size, back to the list after a delete, a 15-minute check.
CODE_DEFAULTS = {'text_zoom': 2, 'auto_advance': 2, 'account_check_frequency': 3}
DROP = {'account_sync_contacts', 'account_sync_calendar', 'account_policies', 'system_folders', 'clear_trusted_senders'}
# The screens: Settings (General and the account), the two preference lists, single-choice and edit-text dialogs.
RENDERER = r'''(() => {
  'use strict';
  const D = window.EmailPrefData, e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const L = (row, lang) => row ? AndroidStrings.pick(row, lang, '') || row.en : '';
  const rowsOf = page => page === 'general' ? D.general : page === 'account' ? D.account : [];
  const find = key => [...D.general, ...D.account].find(row => row.key === key);
  const SERVERS = ['incoming', 'outgoing'], TONES = ['account_ringtone', 'notification-ringtone'];
  function value(data, key, account) {
    const prefs = data.emailPrefs || {}, row = find(key);
    if (key in prefs) return prefs[key];
    if (key === 'account_description') return account;
    if (key === 'account_name') return account.split('@')[0];
    if (TONES.includes(key)) return defaultTone();
    return row && 'default' in row ? row.default : '';
  }
  // The signature as the new message's body (MessageCompose / UnifiedEmail's R.string.signature).
  const signatureBody = data => { const sig = value(data, 'account_signature', ''); return sig ? AndroidStrings.format(D.signature, sig) : ''; };
  function render(data, ui, lang, t, account) {
    const page = ui.emPref || '', T = row => L(row, lang); tr = t;
    const item = (action, id, label, summary = '', extra = '') => `<button type="button" class="emp-row" data-action="${action}" data-id="${e(id)}"><span class="emp-text"><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    let body;
    if (!page) body = item('emailpref-page', 'general', T(D.words.general)) + item('emailpref-page', 'account', value(data, 'account_description', account));
    else body = rowsOf(page).map(row => {
      if (row.kind === 'cat') return row.title ? `<h4 class="emp-cat">${e(T(row.title))}</h4>` : '';
      if (row.kind === 'check') { const on = !!value(data, row.key, account); return item('emailpref-toggle', row.key, T(row.title), T(row.summary), `<i class="emp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${on}"></i>`); }
      if (row.kind === 'list') return item('emailpref-list', row.key, T(row.title), T(row.entries[value(data, row.key, account)]) || T(row.summary));
      if (row.kind === 'edit') { const current = value(data, row.key, account); return item('emailpref-edit', row.key, T(row.title), current || (row.key === 'account_signature' && D.words.notSet ? T(D.words.notSet) : T(row.summary))); }
      if (row.key === 'account_quick_responses' || SERVERS.includes(row.key)) return item('emailpref-page', row.key, T(row.title), T(row.summary));
      if (TONES.includes(row.key)) { const tone = value(data, row.key, account); return item('emailpref-list', row.key, T(row.title), tone === '' ? t('Silent') : tone); }
      return item('emailpref-unsupported', row.key, T(row.title), T(row.summary));
    }).join('');
    if (page === 'account_quick_responses') body = quickPage(data, T);
    if (SERVERS.includes(page)) body = serverPage(data, page, T, account);
    const title = !page ? T(D.words.settings) : page === 'general' ? T(D.words.general) : page === 'account' ? T(D.words.account) : T(find(page)?.title);
    const list = ui.emPrefList && find(ui.emPrefList), edit = ui.emPrefEdit && find(ui.emPrefEdit);
    const scrim = `<button type="button" class="emp-scrim" data-action="emailpref-close" aria-label="${e(t('Cancel'))}"></button>`;
    const tones = list && TONES.includes(list.key);
    const quick = ui.emPrefEdit === 'quick' ? `${scrim}<div class="emp-dialog" role="dialog"><h3>${e(W(T, 'editQuick', 'Edit quick response'))}</h3><textarea class="emp-edit" data-email-pref-edit data-no-translate rows="3">${e(ui.emPrefEditValue ?? (quickList(data)[ui.emPrefQuick] || ''))}</textarea><div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(W(T, 'cancel', tr('Cancel')))}</button>${ui.emPrefQuick >= 0 ? `<button type="button" data-action="empx-quick-delete">${e(W(T, 'delete', tr('Delete')))}</button>` : ''}<button type="button" data-action="empx-quick-save">${e(W(T, 'save', tr('Save')))}</button></div></div>` : '';
    const dialog = quick || (tones ? `${scrim}<div class="emp-dialog emp-tones" role="dialog"><h3>${e(T(list.title))}</h3><div class="emp-tone-list">${toneNames().map((name, i) => { const on = (ui.emPrefTone ?? toneIndex(value(data, list.key, account))) === i; return `<button type="button" class="emp-choice${on ? ' on' : ''}" data-action="empx-tone" data-id="${i}" role="radio" aria-checked="${on}"><span>${e(i ? name : t('Silent'))}</span><i></i></button>`; }).join('')}</div><div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(t('Cancel'))}</button><button type="button" data-action="empx-tone-ok">${e(t('OK'))}</button></div></div>` : '') || (list ? `${scrim}<div class="emp-dialog" role="dialog"><h3>${e(T(list.title))}</h3>${list.entries.map((entry, i) => `<button type="button" class="emp-choice${value(data, list.key, account) === i ? ' on' : ''}" data-action="emailpref-pick" data-id="${e(list.key)}:${i}" role="radio" aria-checked="${value(data, list.key, account) === i}"><span>${e(T(entry))}</span><i></i></button>`).join('')}<div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(t('Cancel'))}</button></div></div>`
      : edit ? `${scrim}<div class="emp-dialog" role="dialog"><h3>${e(T(edit.dialog || edit.title))}</h3><textarea class="emp-edit" data-email-pref-edit data-no-translate rows="${edit.key === 'account_signature' ? 3 : 1}">${e(ui.emPrefEditValue ?? value(data, edit.key, account))}</textarea><div class="emp-buttons"><button type="button" data-action="emailpref-close">${e(t('Cancel'))}</button><button type="button" data-action="emailpref-save">${e(t('OK'))}</button></div></div>` : '');
    return `<div class="app-view emp-app${D.material ? ' material' : ''}"><header class="emp-bar"><button type="button" class="emp-up" data-action="back" aria-label="${e(t('Navigate up'))}">${D.material ? '<i></i>' : '<img class="emp-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="emp-icon" src="assets/email.png" alt="">'}</button><b data-no-translate>${e(title)}</b></header><div class="emp-scroll" data-no-translate>${body}</div>${dialog}</div>`;
  }
  // Quick responses: the account's own list (none until one is created).
  const quickList = data => Array.isArray(data.emailPrefs?.quickResponses) ? data.emailPrefs.quickResponses : [];
  const W = (T, key, fallback) => D.words[key] ? T(D.words[key]) : fallback;
  let tr = key => key;
  function quickPage(data, T) {
    const list = quickList(data);
    const rows = list.map((text, i) => `<button type="button" class="emp-quick" data-action="empx-quick" data-id="${i}"><span>${e(text)}</span></button>`).join('');
    return `${rows || `<p class="emp-empty">${e(W(T, 'noQuick', 'No quick responses'))}</p>`}<div class="emp-actions"><button type="button" class="emp-button" data-action="empx-quick" data-id="-1">${e(W(T, 'create', 'Create new'))}</button></div>`;
  }
  // The server screens of an IMAP account: its own fields, kept on the phone.
  // The account's password is never kept: the field shows a mask while one is set, as the existing account has.
  const MASK = '\u2022'.repeat(8);
  function server(data, page, account) {
    const domain = account.split('@')[1] || 'example.com', {password, ...saved} = data.emailPrefs?.[page] || {};
    const base = page === 'incoming' ? {user: account, passwordSet: true, server: `imap.${domain}`, port: '993', security: 1, prefix: ''} : {server: `smtp.${domain}`, port: '465', security: 1, login: true, user: account, passwordSet: true};
    return {...base, ...(password !== undefined ? {passwordSet: !!password} : {}), ...saved};
  }
  /* AccountSetupIncomingFragment / AccountSetupOutgoingFragment.validateFields: Done follows the user name and password
     (outgoing only with Require sign-in), Utility.isServerNameValid (a host a URI takes) and isPortFieldValid (1 to
     65535). updatePortFromSecurityType: a new security type sets its port (IMAP 993 / 143, SMTP 465 / 587). */
  const PORTS = {incoming: [143, 993], outgoing: [587, 465]}, ssl = i => i === 1 || i === 2;
  const hostOk = v => /^[^\s\/:?#@\\]+$/.test(String(v).trim()), portOk = v => /^\d{1,5}$/.test(String(v).trim()) && Number(v) > 0 && Number(v) < 65536;
  function valid(page, f) {
    if (!hostOk(f.server || '') || !portOk(f.port || '')) return false;
    return page === 'outgoing' && !f.login ? true : !!String(f.user || '').trim() && !!f.password;
  }
  const fieldsOf = form => { const out = {}; form.querySelectorAll('[data-emp-field]').forEach(field => { out[field.dataset.empField] = field.type === 'checkbox' ? field.checked : field.dataset.empField === 'security' ? Number(field.value) : field.dataset.empField === 'password' ? field.value : field.value.trim(); }); return out; };
  if (!window.__emailPrefsInput && typeof document !== 'undefined') {
    window.__emailPrefsInput = true;
    document.addEventListener('input', event => {
      const form = event.target.closest?.('[data-emp-form]'); if (!form) return;
      const page = form.dataset.empForm;
      if (event.target.dataset.empField === 'security') { const port = form.querySelector('[data-emp-field="port"]'); if (port) port.value = PORTS[page][ssl(Number(event.target.value)) ? 1 : 0]; }
      const done = form.parentNode.querySelector('[data-action="empx-server-save"]'); if (done) done.disabled = !valid(page, fieldsOf(form));
    });
  }
  function serverPage(data, page, T, account) {
    const v = server(data, page, account), f = D.form || {};
    const label = key => `<span class="emp-label">${e(f[key] ? T(f[key]) : key)}</span>`;
    const input = (key, type, extra = '') => `<input class="emp-input" data-emp-field="${key}" type="${type}" value="${e(key === 'password' ? (v.passwordSet ? MASK : '') : v[key])}" autocomplete="${type === 'password' ? 'new-password' : 'off'}" spellcheck="false"${extra}>`;
    const security = `<select class="emp-spinner" data-emp-field="security">${(D.security || []).map((row, i) => `<option value="${i}"${Number(v.security) === i ? ' selected' : ''}>${e(T(row))}</option>`).join('')}</select>`;
    const fields = page === 'incoming'
      ? `${label('username')}${input('user', 'email')}${label('password')}${input('password', 'password')}${label('imapServer')}${input('server', 'text')}${label('port')}${input('port', 'text', ' inputmode="numeric"')}${label('security')}${security}${label('prefix')}${input('prefix', 'text', f.prefixHint ? ` placeholder="${e(T(f.prefixHint))}"` : '')}`
      : `${label('smtpServer')}${input('server', 'text')}${label('port')}${input('port', 'text', ' inputmode="numeric"')}${label('security')}${security}<label class="emp-checkrow"><input type="checkbox" data-emp-field="login"${v.login ? ' checked' : ''}><span>${e(f.login ? T(f.login) : 'Require sign-in.')}</span></label><div class="emp-login">${label('username')}${input('user', 'email')}${label('password')}${input('password', 'password')}</div>`;
    const ok = valid(page, {...v, password: v.passwordSet ? MASK : ''});
    return `<form class="emp-form" data-emp-form="${page}">${fields}</form><div class="emp-actions"><button type="button" class="emp-button" data-action="empx-server-cancel">${e(W(T, 'cancel', tr('Cancel')))}</button><button type="button" class="emp-button" data-action="empx-server-save" data-id="${page}"${ok ? '' : ' disabled'}>${e(W(T, 'done', tr('Done')))}</button></div>`;
  }
  // The image's notification sounds (sounds.js), Silent first; the default is ro.config.notification_sound.
  const toneNames = () => ['', ...Object.values(window.SystemSounds?.SOUNDS?.notifications || {}).map(([title]) => title)];
  const toneIndex = name => { const i = toneNames().indexOf(name); return i < 0 ? 0 : i; };
  function defaultTone() { const key = window.SystemSounds?.DEFAULTS?.notifications; return window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || ''; }
  // Back from Quick responses and the server screens returns to the account's settings.
  const parent = page => page === 'account_quick_responses' || SERVERS.includes(page) ? 'account' : '';
  function handle(action, id, ctx) {
    const {data, ui, root} = ctx, prefs = () => (data.emailPrefs ||= {});
    switch (action) {
      case 'empx-tone': ui.emPrefTone = Number(id) || 0; if (ui.emPrefTone) window.SystemSounds?.play('notifications', toneNames()[ui.emPrefTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      case 'empx-tone-ok': { const key = ui.emPrefList; if (key) prefs()[key] = toneNames()[ui.emPrefTone ?? toneIndex(value(data, key, ctx.account))] || ''; ui.emPrefList = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); ctx.save(); ctx.render(); return true; }
      case 'empx-quick': ui.emPrefEdit = 'quick'; ui.emPrefQuick = Number(id); ui.emPrefEditValue = undefined; ctx.render(); root.querySelector('[data-email-pref-edit]')?.focus(); return true;
      case 'empx-quick-save': {
        const text = root.querySelector('[data-email-pref-edit]')?.value.trim() || '', list = [...quickList(data)];
        if (text) { if (ui.emPrefQuick >= 0) list[ui.emPrefQuick] = text; else list.push(text); prefs().quickResponses = list; ctx.save(); }
        ui.emPrefEdit = ''; ctx.render(); return true;
      }
      case 'empx-quick-delete': { const list = [...quickList(data)]; list.splice(ui.emPrefQuick, 1); prefs().quickResponses = list; ui.emPrefEdit = ''; ctx.save(); ctx.render(); return true; }
      case 'empx-server-save': {
        const form = root.querySelector('[data-emp-form]'); if (!form) return true;
        const {password, ...out} = fieldsOf(form);
        if (!valid(id, {...out, password})) return true;
        const {password: old, ...kept} = data.emailPrefs?.[id] || {};
        prefs()[id] = {...server(data, id, ctx.account), ...kept, ...out, passwordSet: !!password}; ui.emPref = 'account'; ctx.save(); ctx.render(); return true;
      }
      case 'empx-server-cancel': ui.emPref = 'account'; ctx.render(); return true;
      default: return false;
    }
  }
  window.EmailPrefs = {render, value, signatureBody, find, handle, parent, server, valid, version: D.version};
})();
'''
for v, (device, apk_name, general_title) in VERSIONS.items():
    path = glob.glob(f'{ROOT}_aosp/{device}/system/app/**/{apk_name}.apk', recursive=True)[0]
    apk = APK(path); res = apk.get_android_resources(); pkg = res.get_packages_names()[0]
    def by_lang(rid):
        out = {}
        for config, entry in res.get_res_configs(rid, None):
            lang, region = config.get_language(), config.get_country()
            if region and '\x00' not in region: continue
            if any(q in (config.get_qualifier() or '') for q in ('sw600', 'sw720', 'land', 'large')): continue
            out.setdefault('' if '\x00' in lang else lang, entry)
        return out
    def string(rid):
        """The five languages of a string (following references), English where a language is missing."""
        # The named form strings.js reads: {res, en, hu, de, fr, es}.
        entries = by_lang(rid); out = {'res': f"{apk_name}:{res.get_resource_xml_name(rid).split('/')[-1]}"}
        for lang in LANGS:
            entry = entries.get(lang) or entries.get('')
            key = entry.key
            out[lang or 'en'] = string(key.data)[lang or 'en'] if key.data_type == 1 else entry.get_key_data()
        return out
    def array(rid):
        entries = by_lang(rid); items = entries[''].item.items; out = []
        for i in range(len(items)):
            row = {'res': f"{apk_name}:@array/{res.get_resource_xml_name(rid).split('/')[-1]}:{i}"}
            for lang in LANGS:
                value = (entries.get(lang) or entries['']).item.items[i][1]
                row[lang or 'en'] = string(value.data)[lang or 'en'] if value.data_type == 1 else value.format_value()
            out.append(row)
        return out
    def plain(rid):
        entry = by_lang(rid)['']; key = entry.key if hasattr(entry, 'key') else None
        if key is not None and key.data_type == 1: return plain(key.data)
        if hasattr(entry, 'item') and hasattr(entry.item, 'items'): return [v.format_value() for _, v in entry.item.items]
        return entry.get_key_data()
    def named(kind, name):
        rid = res.get_res_id_by_key(pkg, kind, name)
        return rid if rid and res.get_resource_xml_name(rid) else None
    def screen(xml_name):
        xml = AXMLPrinter(apk.get_file(f'res/xml/{xml_name}')).get_xml().decode()
        rows, skipping = [], False
        for tag, attrs, close in re.findall(r'<(/?[\w.]+)([^>]*?)(/?)>', xml):
            if tag.startswith('/') or tag == 'PreferenceScreen' and not attrs.strip(): continue
            a = dict(re.findall(r'(?:android:)?(\w+)="([^"]*)"', attrs))
            ref = lambda key: int(a[key][1:], 16) if a.get(key, '').startswith('@') and a[key][1:] and a[key][1:] != '0' and re.fullmatch(r'[0-9A-Fa-f]{8}', a[key][1:]) else None
            key = a.get('key', '')
            if tag == 'PreferenceCategory': skipping = key in DROP
            if skipping or key in DROP or tag == 'PreferenceScreen' and not key: continue
            kind = 'cat' if tag == 'PreferenceCategory' else 'check' if tag.endswith('CheckBoxPreference') else 'list' if tag.endswith('ListPreference') and 'Policy' not in tag else 'edit' if tag.endswith('EditTextPreference') else 'screen'
            row = {'kind': kind, 'key': key}
            if ref('title'): row['title'] = string(ref('title'))
            if ref('summary'): row['summary'] = string(ref('summary'))
            if kind == 'list':
                row['entries'] = array(ref('entries'))
                values = plain(ref('entryValues')) if ref('entryValues') else [str(i) for i in range(len(row['entries']))]
                default = plain(ref('defaultValue')) if ref('defaultValue') else a.get('defaultValue', values[0])
                row['default'] = CODE_DEFAULTS.get(key, values.index(default) if default in values else 0)
            if kind == 'check':
                d = a.get('defaultValue', 'false')
                row['default'] = (plain(ref('defaultValue')) == 'true' if ref('defaultValue') else d == 'true') if d else False
                if isinstance(row['default'], str): row['default'] = row['default'] == 'true'
            if kind == 'edit' and ref('dialogTitle'): row['dialog'] = string(ref('dialogTitle'))
            rows.append(row)
        return rows
    general = screen('general_preferences.xml')
    account = screen('account_settings_preferences.xml')
    settings_title = 'settings_activity_title' if named('string', 'settings_activity_title') else 'activity_preferences'
    words = {'general': string(named('string', general_title)), 'account': string(named('string', 'account_settings_action')), 'settings': string(named('string', settings_title))}
    if named('string', 'preferences_signature_summary_not_set'): words['notSet'] = string(named('string', 'preferences_signature_summary_not_set'))
    # The extra screens' texts, where the image's APK has them.
    for key, name in {'cancel': 'cancel_action', 'done': 'done_action', 'save': 'save_action', 'delete': 'delete_quick_response_action', 'create': 'create_action', 'noQuick': 'quick_responses_empty_view', 'editQuick': 'edit_quick_response_dialog'}.items():
        if named('string', name): words[key] = string(named('string', name))
    form = {key: string(named('string', name)) for key, name in {'username': 'account_setup_incoming_username_label', 'password': 'account_setup_incoming_password_label', 'imapServer': 'account_setup_incoming_imap_server_label' if named('string', 'account_setup_incoming_imap_server_label') else 'account_setup_incoming_server_label', 'port': 'account_setup_incoming_port_label', 'security': 'account_setup_incoming_security_label', 'prefix': 'account_setup_incoming_imap_path_prefix_label', 'prefixHint': 'account_setup_incoming_imap_path_prefix_hint', 'smtpServer': 'account_setup_outgoing_smtp_server_label', 'login': 'account_setup_outgoing_require_login_label'}.items() if named('string', name)}
    # AccountSetupIncomingFragment's security spinner: None, SSL/TLS, SSL/TLS (accept all), STARTTLS, STARTTLS (accept all).
    security = [string(named('string', name)) for name in ('account_setup_incoming_security_none_label', 'account_setup_incoming_security_ssl_label', 'account_setup_incoming_security_ssl_trust_certificates_label', 'account_setup_incoming_security_tls_label', 'account_setup_incoming_security_tls_trust_certificates_label') if named('string', name)]
    # MessageCompose (Email 4.1) puts the signature on a new line; UnifiedEmail's compose uses R.string.signature.
    signature = '\n%s' if v in ('4.0.4', '4.3') else plain(named('string', 'signature'))
    data = {'version': apk.get_androidversion_name(), 'material': v == '5.1.1', 'signature': signature, 'general': general, 'account': account, 'words': words, 'form': form, 'security': security}
    js = (f'/* Generated by docs/tools/email-prefs.py from {apk_name}.apk ({apk.get_androidversion_name()}) of the {device} image. Do not edit. */\n'
          f'window.EmailPrefData = {json.dumps(data, ensure_ascii=False, separators=(",", ":"))};\n' + RENDERER)
    open(f'{ROOT}versions/{v}/email-prefs.js', 'w', encoding='utf-8', newline='\n').write(js)
    print(v, len(general), len(account), [r['key'] for r in account])
