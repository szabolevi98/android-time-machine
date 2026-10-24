/* Android 4.4.4 Contacts (KTU84P): The people list's Import/export (ImportExportDialogFragment, "Import/export contacts"):
   - Import from SIM card: the Phone app's SimContacts ("Select contacts to import"); the demo SIM holds no contacts, so
     it shows simContacts_empty (simContacts_airplaneMode in Airplane mode).
   - Import from storage: ImportVCardActivity scans the storage for .vcf files ("Searching for vCard data in storage…");
     none gives import_failure_no_vcard_file, one is imported at once, more ask "Choose vCard file" (Import one /
     multiple / all vCard files) and then for the file(s). The import toasts vcard_import_will_start_message and posts
     importing_vcard_finished_title; an imported card whose name matches a contact joins it (the provider's
     aggregation), so a card read back does not duplicate it.
   - Export to storage: ExportVCardActivity's "Export contacts?" names the next free %05d.vcf in /storage/emulated/0, then
     vcard_export_will_start_message and the exporting_vcard_finished_title notification.
   - Share visible contacts stays a limit of the simulator (the share chooser is later work).
   The cards are VCardComposer's default vCard 2.1 (N, FN, TEL, EMAIL, ADR, ORG, TITLE, URL, NOTE, the IM X- types,
   X-SIP, the nickname as X-ANDROID-CUSTOM; non-ASCII text in CHARSET=UTF-8 quoted-printable) kept in data.vcards.
   The contact's Set ringtone opens RingtonePickerActivity and keeps the choice on the contact. */
(() => {
  'use strict';
  const ERA = 'kk', ROOT = '/storage/emulated/0', FULL = true;
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, key) => { const row = window.StockStrings?.vcard?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  // Quoted-printable over UTF-8 for vCard 2.1 values that are not plain ASCII.
  function qpEncode(text) {
    return [...new TextEncoder().encode(text)].map(b => (b >= 33 && b <= 126 && b !== 61) || b === 32 ? String.fromCharCode(b) : '=' + b.toString(16).toUpperCase().padStart(2, '0')).join('');
  }
  function qpDecode(text) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      if (text[i] === '=' && /^[0-9A-Fa-f]{2}$/.test(text.slice(i + 1, i + 3))) { bytes.push(parseInt(text.slice(i + 1, i + 3), 16)); i += 2; } else bytes.push(text.charCodeAt(i));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  }
  const escape = value => String(value).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\r?\n/g, '\\n');
  // One property line: parameters, then the value, quoted-printable when it needs to be.
  function line(name, params, values) {
    const text = (Array.isArray(values) ? values : [values]).map(escape).join(';');
    const plain = /^[\x20-\x7e]*$/.test(text);
    return `${name}${params.map(p => ';' + p).join('')}${plain ? '' : ';CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE'}:${plain ? text : qpEncode(text)}`;
  }
  const TEL = {mobile: ['CELL'], home: ['HOME'], work: ['WORK'], faxwork: ['WORK', 'FAX'], faxhome: ['HOME', 'FAX'], pager: ['PAGER'], other: ['VOICE']};
  const EMAIL = {home: ['HOME'], work: ['WORK'], mobile: ['CELL'], other: []};
  const ADR = {home: ['HOME'], work: ['WORK'], other: []};
  const IM = {aim: 'X-AIM', msn: 'X-MSN', yahoo: 'X-YAHOO', skype: 'X-SKYPE-USERNAME', qq: 'X-QQ', gtalk: 'X-GOOGLE-TALK', icq: 'X-ICQ', jabber: 'X-JABBER'};
  const typed = (map, item) => item.type === 'custom' ? [`X-${String(item.label || 'Custom').replace(/[^A-Za-z0-9-]/g, '')}`] : map[item.type] || [];
  function split(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
    return {given: parts.length > 1 ? parts.slice(0, -1).join(' ') : parts[0] || '', family: parts.length > 1 ? parts.at(-1) : ''};
  }
  // VCardComposer: one card per contact.
  function card(p) {
    const n = FULL && p.given !== undefined ? p : {...split(p.name), middle: '', prefix: '', suffix: ''};
    const out = ['BEGIN:VCARD', 'VERSION:2.1', line('N', [], [n.family || '', n.given || '', n.middle || '', n.prefix || '', n.suffix || '']), line('FN', [], p.name || '')];
    if (p.nickname) out.push(line('X-ANDROID-CUSTOM', [], ['vnd.android.cursor.item/nickname', p.nickname, '1', '', '', '', '', '', '', '', '', '', '', '', '', '']));
    const phones = p.phones?.length ? p.phones : p.phone ? [{type: 'mobile', value: p.phone}] : [];
    const emails = p.emails?.length ? p.emails : p.email ? [{type: 'home', value: p.email}] : [];
    for (const t of phones) out.push(line('TEL', typed(TEL, t), t.value));
    for (const m of emails) out.push(line('EMAIL', typed(EMAIL, m), m.value));
    for (const a of p.postals || []) out.push(line('ADR', typed(ADR, a), ['', '', a.value, '', '', '', '']));
    if (p.company || p.title) { if (p.company) out.push(line('ORG', [], p.company)); if (p.title) out.push(line('TITLE', [], p.title)); }
    for (const w of p.websites || []) out.push(line('URL', [], w.value));
    for (const i of p.ims || []) out.push(line(IM[i.type] || 'X-JABBER', [], i.value));
    if (p.sip) out.push(line('X-SIP', [], p.sip));
    if (p.notes) out.push(line('NOTE', [], p.notes));
    if (p.photo != null && p.photo !== '') out.push(line('X-SIMULATOR-PHOTO', [], String(p.photo)));
    out.push('END:VCARD');
    return out.join('\r\n');
  }
  const compose = contacts => contacts.map(card).join('\r\n') + '\r\n';
  // VCardParser_V21 / V30: the cards back to the simulator's contact shape.
  function parse(text) {
    const lines = [];
    for (const raw of String(text).split(/\r?\n/)) {
      if (/^[ \t]/.test(raw) && lines.length) lines[lines.length - 1] += raw.slice(1);
      else if (lines.length && /QUOTED-PRINTABLE/i.test(lines[lines.length - 1].split(':')[0]) && lines[lines.length - 1].endsWith('=')) lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1) + raw;
      else lines.push(raw);
    }
    const people = []; let p = null;
    const unescape = v => v.replace(/\\n/gi, '\n').replace(/\\([;,\\])/g, '$1');
    const fields = v => v.split(/(?<!\\);/).map(unescape);
    const typeOf = (params, map) => {
      const up = params.map(x => x.toUpperCase().replace(/^TYPE=/, '')).filter(x => !/^(CHARSET|ENCODING)=/.test(x) && x !== 'PREF');
      for (const [type, keys] of Object.entries(map)) if (keys.length === up.length && keys.every(k => up.includes(k))) return {type};
      const custom = params.find(x => /^X-/i.test(x));
      return custom ? {type: 'custom', label: custom.slice(2)} : {type: 'other'};
    };
    for (const l of lines) {
      const at = l.indexOf(':'); if (at < 0) continue;
      const [name, ...params] = l.slice(0, at).split(';'), upper = name.toUpperCase();
      let value = l.slice(at + 1);
      if (params.some(x => /ENCODING=QUOTED-PRINTABLE/i.test(x))) value = qpDecode(value);
      if (upper === 'BEGIN') { p = {phones: [], emails: [], postals: [], ims: [], websites: []}; continue; }
      if (!p) continue;
      if (upper === 'END') { people.push(p); p = null; continue; }
      if (upper === 'N') { const [family = '', given = '', middle = '', prefix = '', suffix = ''] = fields(value); Object.assign(p, {family, given, middle, prefix, suffix}); }
      else if (upper === 'FN') p.fn = unescape(value);
      else if (upper === 'TEL') p.phones.push({...typeOf(params, TEL), value: unescape(value)});
      else if (upper === 'EMAIL') p.emails.push({...typeOf(params, EMAIL), value: unescape(value)});
      else if (upper === 'ADR') p.postals.push({...typeOf(params, ADR), value: fields(value).filter(Boolean).join('\n')});
      else if (upper === 'ORG') p.company = fields(value)[0];
      else if (upper === 'TITLE') p.title = unescape(value);
      else if (upper === 'URL') p.websites.push({type: 'other', value: unescape(value)});
      else if (upper === 'NOTE') p.notes = unescape(value);
      else if (upper === 'X-SIP') p.sip = unescape(value);
      else if (upper === 'X-SIMULATOR-PHOTO') p.photo = /^\d+$/.test(value) ? Number(value) : value;
      else if (upper === 'X-ANDROID-CUSTOM') { const f = fields(value); if (f[0] === 'vnd.android.cursor.item/nickname') p.nickname = f[1]; }
      else { const im = Object.entries(IM).find(([, key]) => key === upper); if (im) p.ims.push({type: im[0], value: unescape(value)}); }
    }
    return people.map(shape);
  }
  // The parsed card in this version's contact shape, without the fields it does not have.
  const compact = o => Object.fromEntries(Object.entries(o).filter(([k, v]) => k === 'name' || !(v === '' || v == null || (Array.isArray(v) && !v.length))));
  function shape(c) {
    const name = [c.prefix, c.given, c.middle, c.family, c.suffix].filter(Boolean).join(' ') || c.fn || c.phones[0]?.value || c.emails[0]?.value || '';
    if (!FULL) return compact({name, phone: c.phones[0]?.value || '', email: c.emails[0]?.value || '', company: c.company || '', notes: c.notes || '', ...(c.photo != null ? {photo: c.photo} : {})});
    const out = {prefix: c.prefix || '', given: c.given || '', middle: c.middle || '', family: c.family || '', suffix: c.suffix || '', name, phones: c.phones, emails: c.emails, postals: c.postals, ims: c.ims, websites: c.websites,
      company: c.company || '', title: c.title || '', notes: c.notes || '', nickname: c.nickname || '', sip: c.sip || '', photo: c.photo ?? null};
    out.phone = out.phones[0]?.value || ''; out.email = out.emails[0]?.value || '';
    return compact(out);
  }
  // The provider's aggregation: a card with a contact's name joins that contact; its new numbers and addresses are added.
  function merge(data, people, now = Date.now()) {
    let added = 0;
    const listOf = (c, key) => c[key]?.length ? c[key] : key === 'phones' && c.phone ? [{type: 'mobile', value: c.phone}] : key === 'emails' && c.email ? [{type: 'home', value: c.email}] : [];
    people.forEach((person, i) => {
      const same = data.contacts.find(c => c.name === person.name);
      if (!same) { data.contacts.push({...person, id: now + i}); added++; return; }
      if (FULL) for (const key of ['phones', 'emails', 'postals', 'ims', 'websites']) {
        const have = listOf(same, key), fresh = (person[key] || []).filter(item => !have.some(x => x.value === item.value));
        if (fresh.length) { same[key] = [...have, ...fresh]; if (key === 'phones') same.phone = same[key][0].value; if (key === 'emails') same.email = same[key][0].value; }
      } else { if (person.phone && !same.phone) same.phone = person.phone; if (person.email && !same.email) same.email = person.email; }
      for (const key of ['company', 'title', 'notes', 'nickname', 'sip', 'photo']) if (person[key] != null && person[key] !== '' && (same[key] == null || same[key] === '')) same[key] = person[key];
    });
    return added;
  }

  // ExportVCardActivity: the first free %05d.vcf.
  function nextName(data) { const used = new Set((data.vcards || []).map(f => f.name)); for (let i = 1; i < 100000; i++) { const name = `${String(i).padStart(5, '0')}.vcf`; if (!used.has(name)) return name; } return ''; }
  const fileLine = (ctx, f) => `${f.name}\n${new Date(f.time).toLocaleString(ctx.locale, {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'})}`;
  function overlay(ctx) {
    const {ui, data} = ctx, v = ui.vcard || {}, files = data.vcards || [];
    const item = (action, id, label, mark = '') => `<button type="button" class="vcf-item" data-action="${action}" data-id="${e(id)}"><span class="vcf-text">${e(label).replace(/\n/g, '<small>') + (label.includes('\n') ? '</small>' : '')}</span>${mark}</button>`;
    const radio = on => `<img src="assets/btn_radio_${on ? 'on' : 'off'}_holo_light.png" alt="">`;
    const check = on => `<img src="assets/btn_check_${on ? 'on' : 'off'}_holo_light.png" alt="">`;
    const box = (title, body, buttons = '') => `<div class="settings-dialog-scrim" data-action="vcf-cancel"></div><div class="people-alert vcf-dialog" role="dialog" aria-label="${e(title)}" data-no-translate>${title ? `<h3>${e(title)}</h3>` : ''}${body}${buttons ? `<div class="people-alert-buttons">${buttons}</div>` : ''}</div>`;
    const button = (action, label) => `<button type="button" data-action="${action}">${e(label)}</button>`;
    if (v.step === 'menu') return box(S(ctx, 'Import/export contacts'), `<div class="vcf-list">${item('vcf-sim', '', S(ctx, 'Import from SIM card'))}${item('vcf-import', '', S(ctx, 'Import from storage'))}${item('vcf-export', '', S(ctx, 'Export to storage'))}${item('toast', 'This feature is not part of the simulator.', S(ctx, 'Share visible contacts'))}</div>`);
    if (v.step === 'export') return box(S(ctx, 'Export contacts?'), `<p>${e(AndroidStrings.format(S(ctx, 'Export message'), `${ROOT}/${nextName(data)}`))}</p>`, button('vcf-cancel', S(ctx, 'Cancel')) + button('vcf-export-ok', S(ctx, 'OK')));
    if (v.step === 'none') return box('', `<p>${e(S(ctx, 'No vCard file found in storage.'))}</p>`, button('vcf-cancel', S(ctx, 'OK')));
    if (v.step === 'choose') return box(S(ctx, 'Choose vCard file'), `<div class="vcf-list">${[['one', 'Import one vCard file'], ['many', 'Import multiple vCard files'], ['all', 'Import all vCard files']].map(([id, label]) => item('vcf-mode', id, S(ctx, label), radio(v.mode === id))).join('')}</div>`, button('vcf-cancel', S(ctx, 'Cancel')) + button('vcf-mode-ok', S(ctx, 'OK')));
    if (v.step === 'one') return box(S(ctx, 'Choose vCard file'), `<div class="vcf-list">${files.map(f => item('vcf-pick', f.name, fileLine(ctx, f), radio(v.pick === f.name))).join('')}</div>`, button('vcf-cancel', S(ctx, 'Cancel')) + button('vcf-one-ok', S(ctx, 'OK')));
    if (v.step === 'many') return box(S(ctx, 'Choose vCard file'), `<div class="vcf-list">${files.map(f => item('vcf-toggle', f.name, fileLine(ctx, f), check((v.picked || []).includes(f.name)))).join('')}</div>`, button('vcf-cancel', S(ctx, 'Cancel')) + button('vcf-many-ok', S(ctx, 'OK')));
    return '';
  }
  // SimContacts: the activity over the people list.
  function sim(ctx) {
    const airplane = !!ctx.data.settings?.airplane;
    return `<div class="app-view vcf-sim" data-no-translate><header class="vcf-sim-bar"><button type="button" class="vcf-sim-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""></button><h2>${e(S(ctx, 'Select contacts to import'))}</h2></header><p class="vcf-sim-empty">${e(S(ctx, airplane ? 'SIM airplane mode' : 'No contacts on your SIM card.'))}</p></div>`;
  }
  // The actions; the simulator applies {toast, notify, render, save}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, v = ui.vcard ||= {}, files = data.vcards || [];
    const read = names => {
      const picked = files.filter(f => names.includes(f.name));
      for (const f of picked) merge(data, parse(f.text));
      ui.overlay = ''; ui.vcard = null;
      return {save: true, toast: picked.length === 1 ? AndroidStrings.format(S(ctx, 'Import starts'), picked[0].name) : S(ctx, 'The file will be imported shortly.'), notify: picked.map(f => AndroidStrings.format(S(ctx, 'Imported'), f.name))};
    };
    if (action === 'vcf-open') { ui.vcard = {step: 'menu'}; ui.overlay = 'people-vcard'; return {render: true}; }
    if (action === 'vcf-cancel') { ui.overlay = ''; ui.vcard = null; return {render: true}; }
    if (action === 'vcf-sim') { ui.overlay = ''; ui.vcard = null; ui.peopleBack = ui.sub || ''; ui.sub = 'sim-import'; return {render: true}; }
    if (action === 'vcf-export') { v.step = 'export'; return {render: true}; }
    if (action === 'vcf-export-ok') {
      const name = nextName(data);
      (data.vcards ||= []).push({name, time: Date.now(), text: compose(data.contacts)});
      ui.overlay = ''; ui.vcard = null;
      return {save: true, toast: AndroidStrings.format(S(ctx, 'Export starts'), name), notify: [AndroidStrings.format(S(ctx, 'Exported'), name)]};
    }
    if (action === 'vcf-import') {
      if (!files.length) { v.step = 'none'; return {render: true}; }
      if (files.length === 1) return read([files[0].name]);
      v.step = 'choose'; v.mode = 'one'; return {render: true};
    }
    if (action === 'vcf-mode') { v.mode = id; return {render: true}; }
    if (action === 'vcf-mode-ok') { if (v.mode === 'all') return read(files.map(f => f.name)); v.step = v.mode; v.pick = files.at(-1)?.name; v.picked = []; return {render: true}; }
    if (action === 'vcf-pick') { v.pick = id; return {render: true}; }
    if (action === 'vcf-one-ok') return read([v.pick]);
    if (action === 'vcf-toggle') { v.picked = (v.picked || []).includes(id) ? v.picked.filter(x => x !== id) : [...(v.picked || []), id]; return {render: true}; }
    if (action === 'vcf-many-ok') return (v.picked || []).length ? read(v.picked) : {render: true};
    return null;
  }
  // Set ringtone: RingtonePickerActivity (ringtone_picker_title) with Default ringtone and Silent before the image's
  // ringtones, the touched one playing (sounds.js on data-sound); OK keeps it as the contact's CUSTOM_RINGTONE.
  function ringtone(ctx, person) {
    const list = window.ICSSettingsDetail?.RINGTONES || [], value = person?.ringtone || 'default';
    const choices = [['default', S(ctx, 'Default ringtone')], ['Silent', S(ctx, 'Silent')], ...list.map(name => [name, name])];
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog sd-dialog vcf-ringtone" role="dialog" aria-label="${e(S(ctx, 'Ringtones'))}" data-form="people-ringtone" data-sound="ringtone" data-no-translate><h3>${e(S(ctx, 'Ringtones'))}</h3><div class="sd-choice-list">${choices.map(([id, name]) => `<label><span>${e(name)}</span><input type="radio" name="choice" value="${e(id)}" ${id === value ? 'checked' : ''}></label>`).join('')}</div><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${e(S(ctx, 'Cancel'))}</button><button type="submit">${e(S(ctx, 'OK'))}</button></div></form>`;
  }
  window.PeopleIO = {card, compose, parse, merge, nextName, overlay, sim, handle, ringtone};
})();
