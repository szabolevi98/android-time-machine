/* Gmail 4.0.4's Settings (Gmail.apk of IMM76I) on the Galaxy Nexus: the overflow's Settings opens the preference
   headers (preference_headers.xml: General settings, the account, About Gmail), General settings is
   general_preferences.xml (Confirm before deleting / archiving / sending, Reply all, Auto-advance, Message text size, Hide
   checkboxes, Message actions, Clear search history, Ask to show pictures) and the account account_preferences.xml
   (Priority Inbox, Email notifications, Ringtone & vibrate, Signature, then Data usage: the sync status, Days of mail to
   sync, Manage labels, Download attachments). Ringtone & vibrate is the inbox's label settings; Manage labels lists every
   label with its sync and notification summary (manage_labels_subtitle), and a label's settings are Sync messages (None /
   Last N days / All), Email notifications, Ringtone, Vibrate (Always / Only in silent mode / Never) and Notify once. The
   list menu's Label settings opens the current label's. Texts: the APK's (stock-strings.js, gmailprefs). Values live in
   data.gmail40Prefs; a label synced for None lists no mail, Last N days only those days. About Gmail stays a limit. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (lang, key) => { const row = window.StockStrings?.gmailprefs?.[key]; return row ? AndroidStrings.pick(row, lang, row.en || key) : key; };
  const LABELS = ['Inbox', 'Priority Inbox', 'Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  const prefs = data => (data.gmail40Prefs ||= {});
  const GENERAL = {'confirm-delete': true, 'confirm-archive': true, 'confirm-send': true, 'reply-all': false, 'auto-advance': 2, 'text-size': 2, 'hide-checkboxes': false, 'snap-headers': 2};
  const ACCOUNT = {'priority-inbox': false, notifications: true, prefetch: true};
  const value = (data, key) => prefs(data)[key] ?? GENERAL[key] ?? ACCOUNT[key];
  const toneDefault = () => { const key = window.SystemSounds?.DEFAULTS?.notifications; return window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || ''; };
  const toneNames = () => ['', ...Object.values(window.SystemSounds?.SOUNDS?.notifications || {}).map(([title]) => title)];
  const labelDefault = name => ({sync: ['All mail', 'Chats', 'Spam', 'Trash'].includes(name) ? 'none' : 'recent', notify: name === 'Inbox', tone: toneDefault(), vibrate: 2, once: true});
  const label = (data, name) => ({...labelDefault(name), ...(prefs(data).labels?.[name] || {})});
  const days = data => Number(prefs(data).days) || 30;
  const recent = (data, lang) => { const n = days(data); return AndroidStrings.format(S(lang, AndroidStrings.quantity(n, lang) === 'one' ? 'sync_recent one' : 'sync_recent'), n); };
  const syncText = (data, name, lang) => { const l = label(data, name); return l.sync === 'none' ? S(lang, 'sync_none') : l.sync === 'all' ? S(lang, 'sync_all') : recent(data, lang); };
  const notifyText = (data, name, lang) => { const l = label(data, name); return value(data, 'notifications') && l.notify ? S(lang, `label_notification_summary_${l.tone ? 'ring' : 'silent_ring'}${l.vibrate !== 2 ? '_vibe' : ''}${l.once ? '_notify_once' : ''}`) : ''; };
  // The list's filter (ics-gmail.js): None empties a label, Last N days counts back from the newest mail.
  function synced(data, name, items) {
    const l = label(data, name); if (l.sync === 'all') return items; if (l.sync === 'none') return [];
    const since = Math.max(0, ...(data.gmail40 || []).map(m => m.created || 0)) - days(data) * 864e5;
    return items.filter(m => (m.created || 0) >= since);
  }
  function render(ctx) {
    const {data, ui, lang} = ctx, page = ui.g4Pref || '', T = key => S(lang, key), labelName = name => window.ICSGmail.labelName(lang, name);
    const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="g4p-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="g4p-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const check = on => `<i class="g4p-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
    const toggle = (key, title, summary = '') => row('g4p-toggle', key, T(title), summary ? T(summary) : '', check(value(data, key)));
    const cat = title => `<h4 class="g4p-cat">${e(title)}</h4>`;
    let title = T('activity_preferences'), body = '';
    if (!page) body = row('g4p-page', 'general', T('general_preferences_title')) + row('g4p-page', 'account', ctx.account) + row('g4p-about', '', T('activity_about'));
    if (page === 'general') {
      title = T('general_preferences_title');
      body = toggle('confirm-delete', 'preference_confirm_before_delete_title', 'preference_confirm_before_delete_summary') + toggle('confirm-archive', 'preference_confirm_before_archive_title', 'preference_confirm_before_archive_summary') + toggle('confirm-send', 'preference_confirm_before_send_title', 'preference_confirm_before_send_summary')
        + toggle('reply-all', 'preferences_actionStrip_action_title', 'preferences_actionStrip_action_summary') + row('g4p-list', 'auto-advance', T('preference_advance_to_title'), T(`prefEntries_autoAdvance:${value(data, 'auto-advance')}`))
        + row('g4p-list', 'text-size', T('preferences_message_text_size_title'), T(`prefEntries_messageTextSizeName:${value(data, 'text-size')}`)) + toggle('hide-checkboxes', 'preferences_hide_checkboxes_title', 'preferences_hide_checkboxes_summary')
        + row('g4p-list', 'snap-headers', T('preferences_disable_snap_headers_title'), T(`prefEntries_snapHeader:${value(data, 'snap-headers')}`)) + row('g4p-clear', 'search', T('clear_history_title'), T('clear_history_summary')) + row('g4p-clear', 'pictures', T('clear_display_images_whitelist_title'), T('clear_display_images_whitelist_summary'));
    }
    if (page === 'account') {
      title = ctx.account;
      const on = value(data, 'notifications');
      body = toggle('priority-inbox', 'preferences_priority_inbox', 'preferences_priority_inbox_summary') + toggle('notifications', 'preferences_notifications_enable', 'preferences_notifications_summary')
        + row('g4p-label', 'Inbox', T('preferences_manage_inbox_label_title'), notifyText(data, 'Inbox', lang), '', !on)
        + row('g4p-signature', '', T('preferences_signature_title'), prefs(data).signature || T('preferences_signature_summary'))
        + cat(T('account_settings_data_usage')) + `<div class="g4p-row g4p-static"><span class="g4p-text"><b>${e(AndroidStrings.format(T('preferences_sync_status'), T('preferences_sync_on')))}</b><small>${e(T('preferences_sync_summary'))}</small></span></div>`
        + row('g4p-days', '', T('settings_number_of_days'), recent(data, lang)) + row('g4p-page', 'labels', T('preferences_manage_labels_title'), T('preferences_manage_labels_summary'))
        + toggle('prefetch', 'preference_prefetch_attachments_title', 'preference_prefetch_attachments_summary');
    }
    if (page === 'labels') { title = T('preferences_manage_labels_title'); body = LABELS.map(name => row('g4p-label', name, labelName(name), [syncText(data, name, lang), notifyText(data, name, lang)].filter(Boolean).join('\n'))).join(''); }
    if (page.startsWith('label:')) {
      const name = page.slice(6), l = label(data, name), off = !value(data, 'notifications'), dim = off || !l.notify;
      title = name === 'Inbox' && ui.g4PrefFrom === 'account' ? T('preferences_manage_inbox_label_title') : labelName(name);
      body = row('g4p-dialog', 'sync', T('sync_messages_title'), syncText(data, name, lang)) + row('g4p-notify', name, T('preferences_notifications_enable'), T('preferences_notifications_summary'), check(l.notify && !off), off)
        + row('g4p-dialog', 'tone', T('preferences_ringtone_title'), l.tone || T('silent_ringtone'), '', dim) + row('g4p-dialog', 'vibrate', T('label_notification_vibrate_title'), T(['label_notification_vibrate_always', 'label_notification_vibrate_silent', 'label_notification_vibrate_never'][l.vibrate]), '', dim)
        + row('g4p-once', name, T('preferences_unobtrusive_enable'), T('preferences_unobtrusive_summary'), check(l.once), dim);
    }
    return `<div class="app-view g4p-app"><header class="g4p-bar"><button type="button" class="g4p-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img class="g4p-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="g4p-icon" src="assets/gmail.png" alt=""></button><b data-no-translate>${e(title)}</b></header><div class="g4p-scroll" data-no-translate>${body}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const {data, ui, lang} = ctx, d = ui.g4PrefDialog, T = key => S(lang, key); if (!d) return '';
    const scrim = `<button type="button" class="g4p-scrim" data-action="g4p-close" aria-label="${e(ctx.t('Cancel'))}"></button>`;
    const choice = (id, text, on, action = 'g4p-pick') => `<button type="button" class="g4p-choice${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}" role="radio" aria-checked="${on}"><span>${e(text)}</span><i></i></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="g4p-dialog" role="dialog"><h3>${e(title)}</h3>${inner}<div class="g4p-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="g4p-close">${e(ctx.t('Cancel'))}</button>`, ok = action => `<button type="button" data-action="${action}">${e(ctx.t('OK'))}</button>`;
    const name = String(ui.g4Pref || '').slice(6), l = label(data, name);
    if (d === 'auto-advance') return box(T('preference_advance_to_title'), [0, 1, 2].map(i => choice(i, T(`prefEntries_autoAdvance:${i}`), value(data, d) === i)).join(''), cancel);
    if (d === 'text-size') return box(T('preferences_message_text_size_title'), [0, 1, 2, 3, 4].map(i => choice(i, T(`prefEntries_messageTextSizeName:${i}`), value(data, d) === i)).join(''), cancel);
    if (d === 'snap-headers') return box(T('preferences_disable_snap_headers_title'), [0, 1, 2].map(i => choice(i, T(`prefEntries_snapHeader:${i}`), value(data, d) === i)).join(''), cancel);
    if (d === 'sync') return box(T('sync_messages_title'), choice('none', T('sync_none'), l.sync === 'none') + choice('recent', recent(data, lang), l.sync === 'recent') + choice('all', T('sync_all'), l.sync === 'all'), cancel);
    if (d === 'vibrate') return box(T('label_notification_vibrate_title'), ['label_notification_vibrate_always', 'label_notification_vibrate_silent', 'label_notification_vibrate_never'].map((key, i) => choice(i, T(key), l.vibrate === i)).join(''), cancel);
    if (d === 'tone') { const names = toneNames(), current = ui.g4PrefTone ?? Math.max(0, names.indexOf(l.tone)); return box(T('preferences_ringtone_title'), `<div class="g4p-list">${names.map((n, i) => choice(i, i ? n : T('silent_ringtone'), current === i, 'g4p-tone')).join('')}</div>`, cancel + ok('g4p-tone-ok')); }
    if (d === 'days') return box(T('settings_number_of_days'), `<input class="g4p-input" data-g4p-days type="number" inputmode="numeric" min="1" max="999" value="${days(data)}">`, cancel + ok('g4p-days-ok'));
    if (d === 'signature') return box(T('preferences_signature_dialog_title'), `<textarea class="g4p-input" data-g4p-signature rows="3">${e(prefs(data).signature || '')}</textarea>`, cancel + ok('g4p-signature-ok'));
    return '';
  }
  function setLabel(ctx, name, change) { const p = prefs(ctx.data); p.labels = {...(p.labels || {}), [name]: {...label(ctx.data, name), ...change}}; ctx.save(); }
  function handle(action, id, ctx) {
    const {data, ui} = ctx, p = prefs(data), name = String(ui.g4Pref || '').slice(6), close = () => { window.SystemSounds?.stop(); ui.g4PrefDialog = ''; ui.g4PrefTone = undefined; };
    switch (action) {
      case 'g4-settings': ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'g4-prefs'; ui.g4Pref = ''; ui.g4PrefDialog = ''; ui.g4PrefBack = ''; ctx.render(); return true;
      case 'g4-manage-labels': ui.overlay = ''; ctx.renderOverlay(); ui.g4PrefBack = ui.sub || 'list'; ui.sub = 'g4-prefs'; ui.g4Pref = 'labels'; ui.g4PrefFrom = ''; ui.g4PrefDialog = ''; ctx.render(); return true;
      // Label settings from the list: the current label's (the inbox sections are the inbox).
      case 'g4-label-settings': { ui.overlay = ''; ctx.renderOverlay(); const current = ui.g4Label || 'Inbox'; ui.g4PrefBack = ui.sub || 'list'; ui.sub = 'g4-prefs'; ui.g4Pref = `label:${LABELS.includes(current) ? current : 'Inbox'}`; ui.g4PrefFrom = ''; ui.g4PrefDialog = ''; ctx.render(); return true; }
      case 'g4p-page': ui.g4Pref = id; ctx.render(); return true;
      case 'g4p-label': ui.g4PrefFrom = ui.g4Pref; ui.g4Pref = `label:${id}`; ctx.render(); return true;
      case 'g4p-about': ctx.toast('This feature is not part of the simulator.'); return true;
      case 'g4p-toggle': p[id] = !value(data, id); ctx.save(); ctx.render(); return true;
      case 'g4p-list': case 'g4p-dialog': ui.g4PrefDialog = id; ctx.render(); return true;
      case 'g4p-days': ui.g4PrefDialog = 'days'; ctx.render(); ctx.root.querySelector('[data-g4p-days]')?.focus(); return true;
      case 'g4p-signature': ui.g4PrefDialog = 'signature'; ctx.render(); ctx.root.querySelector('[data-g4p-signature]')?.focus(); return true;
      case 'g4p-pick': {
        const d = ui.g4PrefDialog;
        if (['auto-advance', 'text-size', 'snap-headers'].includes(d)) { p[d] = Number(id); ctx.save(); }
        if (d === 'sync') setLabel(ctx, name, {sync: id});
        if (d === 'vibrate') setLabel(ctx, name, {vibrate: Number(id)});
        close(); ctx.render(); return true;
      }
      case 'g4p-tone': ui.g4PrefTone = Number(id) || 0; if (ui.g4PrefTone) window.SystemSounds?.play('notifications', toneNames()[ui.g4PrefTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      case 'g4p-tone-ok': if (ui.g4PrefTone !== undefined) setLabel(ctx, name, {tone: toneNames()[ui.g4PrefTone] || ''}); close(); ctx.render(); return true;
      case 'g4p-days-ok': { const n = Math.round(Number(ctx.root.querySelector('[data-g4p-days]')?.value)); if (n >= 1 && n <= 999) { p.days = n; ctx.save(); } close(); ctx.render(); return true; }
      case 'g4p-signature-ok': p.signature = String(ctx.root.querySelector('[data-g4p-signature]')?.value || '').trim(); ctx.save(); close(); ctx.render(); return true;
      case 'g4p-notify': setLabel(ctx, id, {notify: !label(data, id).notify}); ctx.render(); return true;
      case 'g4p-once': setLabel(ctx, id, {once: !label(data, id).once}); ctx.render(); return true;
      case 'g4p-clear': if (id === 'search') data.gmail40Searches = []; ctx.save(); return true;
      case 'g4p-close': close(); ctx.render(); return true;
      default: return false;
    }
  }
  // Back: a dialog, a label to where it was opened from, a page to the headers, the headers to the mail.
  function back(ui) {
    if (ui.g4PrefDialog) { window.SystemSounds?.stop(); ui.g4PrefDialog = ''; ui.g4PrefTone = undefined; return true; }
    const p = ui.g4Pref || '';
    if (p.startsWith('label:') && ui.g4PrefFrom) { ui.g4Pref = ui.g4PrefFrom; ui.g4PrefFrom = ''; return true; }
    if (p === 'labels' && !ui.g4PrefBack) { ui.g4Pref = 'account'; return true; }
    if (p && !ui.g4PrefBack) { ui.g4Pref = ''; return true; }
    // Opened from the list or the labels screen (g4PrefBack), Back returns there.
    ui.sub = ui.g4PrefBack && !['list', 'g4-prefs'].includes(ui.g4PrefBack) ? ui.g4PrefBack : ''; ui.g4Pref = ''; ui.g4PrefBack = '';
    return true;
  }
  window.ICSGmailPrefs = {render, handle, back, synced, prefs};
})();
