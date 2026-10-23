/* Google Calendar's settings and "Calendars to display" on Jelly Bean 4.3 (CalendarGoogle 201306090 of the mako image): the overflow's Settings opens CalendarSettingsActivity, whose headers
   (calendar_settings_headers.xml) are General settings and About Calendar with the account's header between them
   (its calendars to sync), and Calendars to display opens SelectVisibleCalendarsActivity. General settings is
   general_preferences.xml: Calendar view setting (Hide declined events, Show week number, Week starts on, Use home time
   zone, Home time zone, Clear search history) and Notifications & reminders (Notifications, Sound, Vibrate, Pop-up
   notification, Default reminder time, Quick responses with QuickResponseSettings' quick_response_defaults); About
   Calendar is about_preferences.xml (Build version). The texts are the APK's (stock-strings.js, group calendar, cp.*).
   What they change here: the hidden calendar's events leave every view, the week starts on the chosen day, the week
   numbers show in Month, a new event gets the default reminder and Notifications off stops the reminders. The demo
   account has its one calendar; Add account stays a service limit. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = key => { const row = window.StockStrings?.calendar?.[`cp.${key}`]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, row.en || key) : key; };
  // preferences_week_start_day_values (-1, Saturday, Sunday, Monday) and preferences_default_reminder_values.
  const WEEK = [-1, 6, 0, 1], REMINDERS = [-1, 0, 1, 5, 10, 15, 20, 25, 30, 45, 60, 120, 180, 720, 1440, 2880, 10080];
  // About Calendar › Build version: the APK's versionName.
  const BUILD = '201306090';
  const defaults = () => ({hideDeclined: false, weekNum: false, weekStart: 0, homeTzOn: false, homeTz: 'America/Los_Angeles', alerts: true, vibrate: false, popup: false, reminder: 10, hidden: [], unsynced: []});
  const prefs = data => ({...defaults(), ...(data.calendarPrefs || {})});
  const quick = data => Array.isArray(data.calendarPrefs?.quick) ? data.calendarPrefs.quick : [0, 1, 2, 3].map(i => S(`quick.${i}`));
  // The demo account's calendars: its own, named after the account as Google Calendar shows it.
  const calendars = account => [{id: 'primary', name: account, color: '#9fc6e7'}];
  const visible = data => !prefs(data).hidden.includes('primary') && !prefs(data).unsynced.includes('primary');
  // The events the views draw: none from a hidden or unsynced calendar.
  const events = data => visible(data) ? data.events : [];
  // The first day of the week for the views (Locale default: Sunday in the US, Monday elsewhere).
  const firstDay = (data, locale) => { const v = WEEK[prefs(data).weekStart]; return v < 0 ? (locale === 'en-US' ? 0 : 1) : v; };
  const tone = data => { const p = data.calendarPrefs || {}; if ('tone' in p) return p.tone; const key = window.SystemSounds?.DEFAULTS?.notifications; return window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || ''; };
  function render(data, ui, t, account, version) {
    const p = prefs(data), page = ui.calPref || '';
    const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="cpf-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="cpf-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const check = on => `<i class="cpf-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
    const cat = title => `<h4 class="cpf-cat">${e(title)}</h4>`;
    let title = S('Settings'), body = '';
    if (!page) body = row('calpref-page', 'general', S('General settings')) + row('calpref-page', 'account', account) + row('calpref-page', 'about', S('About Calendar'));
    if (page === 'general') {
      title = S('General settings');
      const zone = window.TimeZonePicker ? window.TimeZonePicker.label(p.homeTz, Date.now(), window.AndroidI18n?.language).replace(/<[^>]+>/g, '') : p.homeTz;
      body = cat(S('Calendar view setting')) + row('calpref-toggle', 'hideDeclined', S('Hide declined events'), '', check(p.hideDeclined)) + row('calpref-toggle', 'weekNum', S('Show week number'), '', check(p.weekNum))
        + row('calpref-list', 'weekStart', S('Week starts on'), S(`week.${p.weekStart}`)) + row('calpref-toggle', 'homeTzOn', S('Use home time zone'), S('Use home time zone summary'), check(p.homeTzOn))
        + row('calpref-tz', 'homeTz', S('Home time zone'), zone, '', !p.homeTzOn) + row('calpref-clear', 'search', S('Clear search history'), S('Clear search history summary'))
        + cat(S('Notifications & reminders')) + row('calpref-toggle', 'alerts', S('Notifications'), '', check(p.alerts)) + row('calpref-list', 'tone', S('Sound'), tone(data) || t('Silent'), '', !p.alerts)
        + row('calpref-toggle', 'vibrate', S('Vibrate'), '', check(p.vibrate), !p.alerts) + row('calpref-toggle', 'popup', S('Pop-up notification'), '', check(p.popup), !p.alerts)
        + row('calpref-list', 'reminder', S('Default reminder time'), S(`rem.${Math.max(0, REMINDERS.indexOf(p.reminder))}`)) + row('calpref-page', 'quick', S('Quick responses'), S('Quick responses summary'));
    }
    if (page === 'quick') { title = S('Edit quick responses'); body = quick(data).map((text, i) => row('calpref-quick', i, text)).join(''); }
    if (page === 'about') { title = S('About Calendar'); body = cat(S('About')) + `<div class="cpf-row cpf-static"><span class="cpf-text"><b>${e(S('Build version'))}</b><small>${e(BUILD)}</small></span></div>`; }
    if (page === 'account') { title = account; body = cat(S('Calendars to sync')) + calendars(account).map(c => { const on = !p.unsynced.includes(c.id); return row('calpref-sync', c.id, c.name, S(on ? 'synced' : 'not synced'), check(on)); }).join(''); }
    if (page === 'visible') { title = S('Calendars to display'); body = cat(account) + calendars(account).map(c => { const on = !p.hidden.includes(c.id); return `<button type="button" class="cpf-row cpf-cal" data-action="calpref-visible" data-id="${c.id}"><i class="cpf-chip" style="background:${c.color}"></i><span class="cpf-text"><b>${e(c.name)}</b></span>${check(on)}</button>`; }).join(''); }
    const dialog = renderDialog(data, ui, t, p);
    return `<div class="app-view cal-app cpf-app"><header class="cal-bar"><button type="button" data-action="back" aria-label="${e(t('Navigate up'))}"><img class="cal-up" src="assets/ic_ab_back_holo_light.png" alt=""><img class="cpf-icon" src="assets/calendar.png" alt=""></button><strong data-no-translate>${e(title)}</strong></header><div class="cpf-scroll" data-no-translate>${body}</div>${dialog}</div>`;
  }
  function renderDialog(data, ui, t, p) {
    const d = ui.calPrefDialog; if (!d) return '';
    const scrim = `<button type="button" class="cpf-scrim" data-action="calpref-close" aria-label="${e(t('Cancel'))}"></button>`;
    const choice = (i, label, on, action = 'calpref-pick') => `<button type="button" class="cpf-choice${on ? ' on' : ''}" data-action="${action}" data-id="${i}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i></i></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="cpf-dialog" role="dialog"><h3>${e(title)}</h3>${inner}<div class="cpf-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="calpref-close">${e(t('Cancel'))}</button>`;
    if (d === 'weekStart') return box(S('Week starts on dialog'), [0, 1, 2, 3].map(i => choice(i, S(`week.${i}`), p.weekStart === i)).join(''), cancel);
    if (d === 'reminder') return box(S('Default reminder dialog'), `<div class="cpf-list">${REMINDERS.map((m, i) => choice(i, S(`rem.${i}`), p.reminder === m)).join('')}</div>`, cancel);
    if (d === 'tone') { const names = toneNames(), current = ui.calPrefTone ?? Math.max(0, names.indexOf(tone(data))); return box(S('Sound'), `<div class="cpf-list">${names.map((name, i) => choice(i, i ? name : t('Silent'), current === i, 'calpref-tone')).join('')}</div>`, cancel + `<button type="button" data-action="calpref-tone-ok">${e(t('OK'))}</button>`); }
    if (d.startsWith('quick:')) { const i = Number(d.slice(6)); return box(S('Quick response'), `<textarea class="cpf-edit" data-calpref-edit data-no-translate rows="3">${e(quick(data)[i] || '')}</textarea>`, cancel + `<button type="button" data-action="calpref-quick-save" data-id="${i}">${e(t('OK'))}</button>`); }
    return '';
  }
  const toneNames = () => ['', ...Object.values(window.SystemSounds?.SOUNDS?.notifications || {}).map(([title]) => title)];
  function handle(action, id, ctx) {
    const {data, ui} = ctx, set = (key, value) => { data.calendarPrefs = {...(data.calendarPrefs || {}), [key]: value}; ctx.save(); };
    const p = prefs(data);
    switch (action) {
      case 'calpref-page': ui.calPref = id; ctx.render(); return true;
      case 'calpref-toggle': set(id, !p[id]); ctx.render(); return true;
      case 'calpref-list': ui.calPrefDialog = id; ui.calPrefTone = undefined; ctx.render(); return true;
      case 'calpref-pick': {
        const i = Number(id) || 0;
        if (ui.calPrefDialog === 'weekStart') set('weekStart', i);
        if (ui.calPrefDialog === 'reminder') set('reminder', REMINDERS[i]);
        ui.calPrefDialog = ''; ctx.render(); return true;
      }
      case 'calpref-tone': ui.calPrefTone = Number(id) || 0; if (ui.calPrefTone) window.SystemSounds?.play('notifications', toneNames()[ui.calPrefTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      case 'calpref-tone-ok': if (ui.calPrefTone !== undefined) set('tone', toneNames()[ui.calPrefTone] || ''); window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; ctx.render(); return true;
      case 'calpref-close': window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; ctx.render(); return true;
      case 'calpref-clear': data.calendarSearches = []; ctx.save(); ctx.toast(S('Search history cleared')); return true;
      case 'calpref-tz': if (p.homeTzOn) ctx.pickZone(p.homeTz); return true;
      case 'calpref-quick': ui.calPrefDialog = `quick:${id}`; ctx.render(); ctx.root.querySelector('[data-calpref-edit]')?.focus(); return true;
      case 'calpref-quick-save': { const text = ctx.root.querySelector('[data-calpref-edit]')?.value.trim(); if (text) { const list = [...quick(data)]; list[Number(id)] = text; set('quick', list); } ui.calPrefDialog = ''; ctx.render(); return true; }
      case 'calpref-sync': set('unsynced', p.unsynced.includes(id) ? p.unsynced.filter(x => x !== id) : [...p.unsynced, id]); ctx.render(); return true;
      case 'calpref-visible': set('hidden', p.hidden.includes(id) ? p.hidden.filter(x => x !== id) : [...p.hidden, id]); ctx.render(); return true;
      default: return false;
    }
  }
  // Back: a dialog, then Quick responses to General settings, a settings page to the headers, the headers (and
  // Calendars to display) to the calendar.
  function back(ui) {
    if (ui.calPrefDialog) { window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; return 'stay'; }
    if (ui.calPref === 'quick') { ui.calPref = 'general'; return 'stay'; }
    if (ui.calPref && ui.calPref !== 'visible') { ui.calPref = ''; return 'stay'; }
    return 'leave';
  }
  window.CalendarPrefs = {render, handle, back, prefs, events, firstDay, defaults, REMINDERS};
})();
