/* Google Calendar 5.0.1 (CalendarGooglePrebuilt of LMY48Y) › Settings: CalendarSettingsActivity's HeaderAdapter lists
   General and Events from Gmail (calendar_settings_headers.xml), then the account (preference_group_header_item) with
   its calendars: Events (primary_calendar_display_name), Birthdays and Holidays (the drawer's names). General
   (GeneralPreferences' aspects in their order): Start of the week, Use device time zone and Time zone, Show declined
   events, Show more events, Default event duration (default_event_duration_values: No end time, 15-120 minutes),
   Notifications (Notify on this device, Tone, Vibrate and the disclaimer) and Quick responses (quick_response_defaults).
   Events from Gmail: Add events from Gmail with its on / off dialogs. A calendar: Sync. The texts are the APK's
   (stock-strings.js, group calendar, cp.*). What they change here: an unsynced calendar's events leave the views, the
   week starts on the chosen day, a new event lasts the default duration, Notify off stops the reminders. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = key => { const row = window.StockStrings?.calendar?.[`cp.${key}`]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, row.en || key) : key; };
  const WEEK = [6, 0, 1], DURATIONS = [-1, 15, 30, 60, 90, 120];
  const CALENDARS = [['primary', 'Events', '#4285f4'], ['birthdays', 'Birthdays', '#f4b400'], ['holidays', 'Holidays', '#0f9d58']];
  const defaults = () => ({weekStart: -1, deviceTz: true, homeTz: 'America/Los_Angeles', declined: true, moreEvents: false, duration: 60, alerts: true, vibrate: true, gmail: true, unsynced: []});
  const prefs = data => ({...defaults(), ...(data.calendarPrefs || {})});
  const quick = data => Array.isArray(data.calendarPrefs?.quick) ? data.calendarPrefs.quick : [0, 1, 2, 3].map(i => S(`quick.${i}`));
  const events = data => prefs(data).unsynced.includes('primary') ? [] : data.events;
  const firstDay = (data, locale) => { const v = prefs(data).weekStart; return v < 0 ? (locale === 'en-US' ? 0 : 1) : WEEK[v]; };
  const tone = data => { const p = data.calendarPrefs || {}; if ('tone' in p) return p.tone; const key = window.SystemSounds?.DEFAULTS?.notifications; return window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || ''; };
  const toneNames = () => ['', ...Object.values(window.SystemSounds?.SOUNDS?.notifications || {}).map(([title]) => title)];
  const durationLabel = minutes => minutes < 0 ? S('No end time') : AndroidStrings.format(S('%d minutes'), minutes);
  const weekLabel = (p, locale) => p.weekStart < 0 ? new Date(2024, 0, 7 + (locale === 'en-US' ? 0 : 1)).toLocaleDateString(locale, {weekday: 'long'}) : S(`week.${p.weekStart}`);
  function render(data, ui, t, account, locale) {
    const p = prefs(data), page = ui.calPref || '';
    const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="cpf-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span class="cpf-text"><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const sw = on => `<i class="cpf-switch${on ? ' on' : ''}" role="switch" aria-checked="${!!on}"></i>`;
    const head = text => `<h4 class="cpf-head">${e(text)}</h4>`;
    let title = S('Settings'), body = '';
    if (!page) body = row('calpref-page', 'general', S('General')) + row('calpref-page', 'gmail', S('Events from Gmail')) + `<h4 class="cpf-group">${e(account)}</h4>` + CALENDARS.map(([id, name, color]) => `<button type="button" class="cpf-row cpf-cal" data-action="calpref-page" data-id="cal:${id}"><i class="cpf-dot" style="background:${color}"></i><span class="cpf-text"><b>${e(S(name))}</b></span></button>`).join('');
    if (page === 'general') {
      title = S('General');
      const zone = window.TimeZonePicker ? window.TimeZonePicker.label(p.homeTz, Date.now(), window.AndroidI18n?.language).replace(/<[^>]+>/g, '') : p.homeTz;
      body = head(S('Start of the week')) + row('calpref-list', 'weekStart', weekLabel(p, locale))
        + row('calpref-toggle', 'deviceTz', S('Use device time zone'), '', sw(p.deviceTz)) + row('calpref-tz', 'homeTz', S('Time zone'), zone, '', p.deviceTz)
        + row('calpref-toggle', 'declined', S('Show declined events'), '', sw(p.declined)) + row('calpref-toggle', 'moreEvents', S('Show more events'), S('Show more events summary'), sw(p.moreEvents))
        + head(S('Default event duration')) + row('calpref-list', 'duration', durationLabel(p.duration))
        + head(S('Notifications')) + row('calpref-toggle', 'alerts', S('Notify on this device'), '', sw(p.alerts)) + row('calpref-list', 'tone', S('Tone'), tone(data) || S('None'), '', !p.alerts)
        + row('calpref-toggle', 'vibrate', S('Vibrate'), '', sw(p.vibrate), !p.alerts) + `<p class="cpf-note">${e(S('Notifications disclaimer'))}</p>`
        + row('calpref-page', 'quick', S('Quick responses'), S('Quick responses summary'));
    }
    if (page === 'gmail') { title = S('Events from Gmail'); body = `<h4 class="cpf-group">${e(account)}</h4>` + row('calpref-gmail', 'gmail', S('Add events from Gmail'), '', sw(p.gmail)); }
    if (page === 'quick') { title = S('Edit quick responses'); body = quick(data).map((text, i) => row('calpref-quick', i, text)).join(''); }
    if (page.startsWith('cal:')) { const [, name] = CALENDARS.find(([id]) => id === page.slice(4)) || CALENDARS[0]; title = S(name); body = `<h4 class="cpf-group">${e(account)}</h4>` + row('calpref-sync', page.slice(4), S('Sync'), '', sw(!p.unsynced.includes(page.slice(4)))); }
    return `<div class="app-view gc-app cpf-app"><header class="gc-bar cpf-bar"><button type="button" class="cpf-up" data-action="back" aria-label="${e(t('Navigate up'))}"><i></i></button><strong data-no-translate>${e(title)}</strong></header><div class="cpf-scroll" data-no-translate>${body}</div>${dialog(data, ui, t, p, locale)}</div>`;
  }
  function dialog(data, ui, t, p, locale) {
    const d = ui.calPrefDialog; if (!d) return '';
    const scrim = `<button type="button" class="cpf-scrim" data-action="calpref-close" aria-label="${e(t('Cancel'))}"></button>`;
    const choice = (i, label, on, action = 'calpref-pick') => `<button type="button" class="cpf-choice${on ? ' on' : ''}" data-action="${action}" data-id="${i}" role="radio" aria-checked="${on}"><i></i><span>${e(label)}</span></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="cpf-dialog" role="dialog">${title ? `<h3>${e(title)}</h3>` : ''}${inner}<div class="cpf-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="calpref-close">${e(t('Cancel'))}</button>`;
    if (d === 'weekStart') return box(S('Start of the week'), [0, 1, 2].map(i => choice(i, S(`week.${i}`), p.weekStart === i)).join(''), cancel);
    if (d === 'duration') return box(S('Default event duration'), DURATIONS.map((m, i) => choice(i, durationLabel(m), p.duration === m)).join(''), cancel);
    if (d === 'tone') { const names = toneNames(), current = ui.calPrefTone ?? Math.max(0, names.indexOf(tone(data))); return box(S('Tone'), `<div class="cpf-list">${names.map((name, i) => choice(i, i ? name : S('None'), current === i, 'calpref-tone')).join('')}</div>`, cancel + `<button type="button" data-action="calpref-tone-ok">${e(t('OK'))}</button>`); }
    if (d === 'gmail') return box('', `<p class="cpf-msg">${e(S(p.gmail ? 'Gmail off' : 'Gmail on'))}</p>`, cancel + `<button type="button" data-action="calpref-gmail-ok">${e(S(p.gmail ? 'Continue' : 'Enable'))}</button>`);
    if (d.startsWith('quick:')) { const i = Number(d.slice(6)); return box(S('Quick response'), `<textarea class="cpf-edit" data-calpref-edit data-no-translate rows="3">${e(quick(data)[i] || '')}</textarea>`, cancel + `<button type="button" data-action="calpref-quick-save" data-id="${i}">${e(t('OK'))}</button>`); }
    return '';
  }
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
        if (ui.calPrefDialog === 'duration') set('duration', DURATIONS[i]);
        ui.calPrefDialog = ''; ctx.render(); return true;
      }
      case 'calpref-tone': ui.calPrefTone = Number(id) || 0; if (ui.calPrefTone) window.SystemSounds?.play('notifications', toneNames()[ui.calPrefTone]); else window.SystemSounds?.stop(); ctx.render(); return true;
      case 'calpref-tone-ok': if (ui.calPrefTone !== undefined) set('tone', toneNames()[ui.calPrefTone] || ''); window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; ctx.render(); return true;
      case 'calpref-close': window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; ctx.render(); return true;
      case 'calpref-tz': if (!p.deviceTz) ctx.pickZone(p.homeTz); return true;
      case 'calpref-gmail': ui.calPrefDialog = 'gmail'; ctx.render(); return true;
      case 'calpref-gmail-ok': set('gmail', !p.gmail); ui.calPrefDialog = ''; ctx.render(); return true;
      case 'calpref-quick': ui.calPrefDialog = `quick:${id}`; ctx.render(); ctx.root.querySelector('[data-calpref-edit]')?.focus(); return true;
      case 'calpref-quick-save': { const text = ctx.root.querySelector('[data-calpref-edit]')?.value.trim(); if (text) { const list = [...quick(data)]; list[Number(id)] = text; set('quick', list); } ui.calPrefDialog = ''; ctx.render(); return true; }
      case 'calpref-sync': set('unsynced', p.unsynced.includes(id) ? p.unsynced.filter(x => x !== id) : [...p.unsynced, id]); ctx.render(); return true;
      default: return false;
    }
  }
  // Back: a dialog, Quick responses to General, a page to the headers, the headers to the calendar.
  function back(ui) {
    if (ui.calPrefDialog) { window.SystemSounds?.stop(); ui.calPrefDialog = ''; ui.calPrefTone = undefined; return 'stay'; }
    if (ui.calPref === 'quick') { ui.calPref = 'general'; return 'stay'; }
    if (ui.calPref) { ui.calPref = ''; return 'stay'; }
    return 'leave';
  }
  window.CalendarPrefs = {render, handle, back, prefs, events, firstDay, defaults};
})();
