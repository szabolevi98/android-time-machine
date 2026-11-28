/* Google Now on the stock Nexus 5: the Google Now Launcher's left-most pane and the Google app, both Google Search
   3.3.11 (Velvet.apk of the KTU84P image). now_client_cards_view.xml: activity_background #eeeeee; the context header
   picture for the time of day (context_header_bg_dawn / _daylight / _dusk / _twilight) full width under the translucent
   status bar; velvet_search_plate.xml on search_bg (12 dp of shadow margin) with ic_google_small_dark and ic_mic_dark;
   the cards 12 dp below the picture on card_background, 10 dp apart (CardTitle 25 sp sans-serif-light #707070 with the
   card menu's ic_training_dots_normal, CardText 14 sp #8d8d8d, CardGridText 14 sp sans-serif-condensed, action buttons
   16 sp #4285f4 over card_action_button_bg_normal); load_more_card.xml ("More", italic #777 on
   card_background_tutorial); in_app_footer.xml: Reminders, Train Google Now and Menu, 56 dp each, spread by spaces.
   GSMArena's Nexus 5 review (shot 013 of the UI page) shows the same pane. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Velvet's own texts from stock-strings.js, else i18n.
  const S = (t, locale, key) => { const row = window.StockStrings?.google?.[key]; return row ? AndroidStrings.pick(row, String(locale || 'en').slice(0, 2), key) : t(key); };
  // The weather pictures come from the web in Google Now; these stand in for them.
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
  const CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
  const period = hour => hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'daylight' : hour >= 17 && hour < 20 ? 'dusk' : 'twilight';
  const menu = (s, action = 'sa-unsupported', id = '') => `<button class="gnow-card-menu" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(s('Card menu'))}"><img src="assets/vn3-ic_training_dots_normal.png" alt=""></button>`;
  // weather_card.xml: the title, the 96 dp picture with the 90 dp temperature beside it, the description, wind and
  // precipitation under the picture, then weather_forecast_column.xml's label, icon, bold high and light low.
  function weather(now, t, locale, s, data = {}, ui = {}) {
    if (ui.gnowBack === 'weather') return weatherBack(data, s);
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const days = temps.map((_, i) => new Date(now.getTime() + i * 864e5).toLocaleDateString(locale, {weekday: 'short'}));
    return `<section class="gnow-card gnow-weather"><h3>Mountain View</h3>${menu(s, 'gnow-card-back', 'weather')}<div class="gnow-weather-now"><span class="gnow-weather-icon">${CLOUD}</span><b>${deg(data, temps[0][0])}°</b></div><div class="gnow-weather-cond"><p>${e(t('Partly cloudy'))}</p><p><img src="assets/vn3-ic_weather_wind.png" alt="">${Number(data.nowUnits) === 1 ? '8 mph' : '13 km/h'}</p><p><img src="assets/vn3-ic_weather_umbrella.png" alt="">10%</p></div><div class="gnow-week">${temps.map(([hi, lo], i) => `<div><span>${e(days[i])}</span>${i % 2 ? SUN : CLOUD}<b>${deg(data, hi)}°</b><small>${deg(data, lo)}°</small></div>`).join('')}</div></section>`;
  }
  /* Reminders (Velvet 3.3.11). The footer's Reminders opens RemindersListActivity (Theme.Closet: the #eeeeee
     configuration_list_background bar, ic_menu_add_normal to add): reminders_list_header.xml's Upcoming / Past
     (textAppearanceLarge on listSeparatorTextViewStyle, 18 dp above and below) over reminder_list_item.xml rows (the
     18 sp title, the 14 sp time in textColorSecondary), or no_upcoming_reminders. The editor is edit_reminder_layout.xml
     under edit_reminder_action_bar.xml (ic_reminder_cancel Cancel | ic_reminder_set Set, 12 sp caps): the "Add a title"
     field, the When / Where triggers (16 sp #707070 caps), then the edit_reminder_day spinner (Today, Tomorrow, Weekend,
     Set date…) and edit_reminder_time (Morning, Afternoon, Evening, Night: Velvet's symbolic 9:00, 13:00, 17:00 and
     20:00; All day; Set time…) and the One-time recurrence button. Upcoming reminders are reminder_card.xml cards on the
     Now stream (the title in CardText.Large, ic_reminder_small beside the time); their card menu asks "Delete this
     reminder?". Card settings: the weather card's menu turns it round to card_back_training.xml with the weather_units
     question (Celsius / Fahrenheit, TrainingModeTextButtonWithIcon: 14 sp sans-serif-condensed #868686, the chosen one
     #4285f4), which the card's temperatures follow. */
  /* Where (edit_reminder_layout.xml's location_trigger_radio_button): the When spinners and the recurrence give way to
     the location spinner (edit_reminder_location_spinner.xml rows): Home and Work with their addresses — the Google
     account's, which Maps' settings keep (data.mapsHome / mapsWork) — or Set home / work location, then Set location.
     Its place search is local: the demo's places around Mountain View, "No matching places found" otherwise. The
     reminder only shows its place; the simulator sets no geofence and never fires it. */
  const PLACES = [['Googleplex', '1600 Amphitheatre Pkwy, Mountain View, CA'], ['Shoreline Amphitheatre', '1 Amphitheatre Pkwy, Mountain View, CA'],
    ['Computer History Museum', '1401 N Shoreline Blvd, Mountain View, CA'], ['Mountain View Station', '600 W Evelyn Ave, Mountain View, CA'],
    ['Castro Street', 'Castro St, Mountain View, CA'], ['Mountain View Public Library', '585 Franklin St, Mountain View, CA'],
    ['Safeway', '645 San Antonio Rd, Mountain View, CA'], ['Rengstorff Park', '201 S Rengstorff Ave, Mountain View, CA']];
  const placeMatches = q => { const k = String(q || '').trim().toLowerCase(); return PLACES.filter(([name, address]) => !k || `${name} ${address}`.toLowerCase().includes(k)); };
  const placeLine = (place, s) => place.label ? AndroidStrings.format(s('%1$s, %2$s'), s(place.label === 'home' ? 'Home' : 'Work'), place.address) : place.name ? AndroidStrings.format(s('%1$s, %2$s'), place.name, place.address) : place.address;
  function placeDialog(p, s) {
    const title = p.kind === 'home' ? 'Set home location' : p.kind === 'work' ? 'Set work location' : 'Set location', list = placeMatches(p.q);
    return `<button type="button" class="gnr-scrim gnr-scrim-top" data-action="gnow-place-close" aria-label="${e(s('Cancel'))}"></button><div class="gnr-alert gnr-place" role="dialog" aria-label="${e(s(title))}"><h4>${e(s(title))}</h4>${p.kind === 'custom' ? '' : `<p>${e(s('You can edit this location anytime from your Google Now settings'))}</p>`}<input class="gnr-label" data-gnp-q value="${e(p.q || '')}" placeholder="${e(s('Set place'))}" autocomplete="off" aria-label="${e(s('Set place'))}"><div class="gnr-place-list">${placeList(list, s)}</div><div class="gnr-alert-buttons"><button type="button" data-action="gnow-place-close">${e(s('Cancel'))}</button></div></div>`;
  }
  const placeList = (list, s) => list.length ? list.map(([name, address], i) => `<button type="button" class="gnr-place-item" data-action="gnow-place-pick" data-id="${e(name)}"><b>${e(name)}</b><small>${e(address)}</small></button>`).join('') : `<p class="gnr-empty">${e(s('No matching places found'))}</p>`;
  /* Repeat: Velvet's RecurrencePickerDialog (recurrencepicker.xml): the freqSpinner (REPEAT DAILY … YEARLY) beside the
     repeat_switch, then "Every n days / weeks / months / years", the seven WeekButtons for weekly, the monthGroup radios
     (on the same day each month / on every <nth> <weekday>) and the endSpinner (Forever, Until a date,
     For a number of events) with its date or count, and Done. The button then names the rule as EventRecurrenceFormatter
     does (Daily / Every n days, Weekly on …, Monthly, Yearly, "; until …", "; for n times"). */
  const DOW = ['sun', 'mon', 'tues', 'wed', 'thurs', 'fri', 'sat'];
  const plural = (s, key, n) => s(`${key}.${n === 1 ? 'one' : 'other'}`) === `${key}.other` ? s(`${key}.one`) : s(`${key}.${n === 1 ? 'one' : 'other'}`);
  const nthOf = date => { const d = new Date(`${date}T00:00`); return Math.ceil(d.getDate() / 7) - 1; };
  const weekdayNames = (days, locale, long) => days.map(i => new Date(2017, 0, 1 + i).toLocaleDateString(locale, {weekday: long ? 'long' : 'short'}));
  function ruleLabel(rule, date, locale, s) {
    if (!rule) return s('One-time');
    const n = rule.interval || 1;
    let text = rule.freq === 0 ? AndroidStrings.format(plural(s, 'daily', n), n)
      : rule.freq === 1 ? AndroidStrings.format(plural(s, 'weekly', n), n, weekdayNames(rule.days, locale, rule.days.length === 1).join(', '))
      : rule.freq === 2 ? AndroidStrings.format(plural(s, 'monthly', n), n) : AndroidStrings.format(plural(s, 'yearly', n), n);
    if (rule.end === 1 && rule.until) text += AndroidStrings.format(s('; until %s'), new Date(`${rule.until}T00:00`).toLocaleDateString(locale, {month: 'short', day: 'numeric', year: 'numeric'}));
    if (rule.end === 2) text += AndroidStrings.format(plural(s, 'endByCount', rule.count), rule.count);
    return text;
  }
  const ruleFrom = (date, prev) => prev ? {...prev, days: [...prev.days]} : {on: true, freq: 1, interval: 1, days: [new Date(`${date}T00:00`).getDay()], monthly: 'day', end: 0, until: '', count: 5};
  function recurrenceDialog(r, date, locale, s) {
    const dis = r.on ? '' : ' disabled', unit = ['idaily', 'iweekly', 'imonthly', 'iyearly'][r.freq], pre = plural(s, unit, r.interval).split('%d');
    const freq = `<select class="gnr-rfreq" data-gnr-rule="freq"${dis} aria-label="${e(s('Repeated reminders'))}">${[0, 1, 2, 3].map(i => `<option value="${i}"${i === r.freq ? ' selected' : ''}>${e(s(`rfreq.${i}`))}</option>`).join('')}</select>`;
    const week = r.freq === 1 ? `<div class="gnr-week">${[0, 1, 2, 3, 4, 5, 6].map(i => `<button type="button" class="gnr-day${r.days.includes(i) ? ' on' : ''}" data-action="gnow-rule-day" data-id="${i}" aria-pressed="${r.days.includes(i)}"${dis}>${e(weekdayNames([i], locale)[0])}</button>`).join('')}</div>` : '';
    const dow = new Date(`${date}T00:00`).getDay(), nth = nthOf(date);
    const month = r.freq === 2 ? `<div class="gnr-month">${[['day', s('on the same day each month')], ['nth', s(`nth.${DOW[dow]}.${Math.min(nth, 3)}`)], ...(false && new Date(`${date}T00:00`).getDate() === new Date(new Date(`${date}T00:00`).getFullYear(), new Date(`${date}T00:00`).getMonth() + 1, 0).getDate() ? [['last', s('on the last day of the month')]] : [])].map(([id, label]) => `<button type="button" class="gnr-radio${r.monthly === id ? ' on' : ''}" data-action="gnow-rule-month" data-id="${id}" role="radio" aria-checked="${r.monthly === id}"${dis}>${e(label)}</button>`).join('')}</div>` : '';
    const end = `<div class="gnr-end"><select data-gnr-rule="end"${dis}>${['Forever', 'Until a date', 'For a number of events'].map((key, i) => `<option value="${i}"${i === r.end ? ' selected' : ''}>${e(s(key))}</option>`).join('')}</select>${r.end === 1 ? `<input type="date" data-gnr-rule="until" value="${e(r.until)}"${dis}>` : ''}${r.end === 2 ? `<input type="number" min="1" max="730" data-gnr-rule="count" value="${r.count}"${dis}>` : ''}</div>`;
    const head = false ? `<h4>${e(s(r.on ? 'Repeat' : 'Never repeats'))}</h4>` : '';
    return `<button type="button" class="gnr-scrim gnr-scrim-top" data-action="gnow-rule-cancel" aria-label="${e(s('Cancel'))}"></button><div class="gnr-alert gnr-rule" role="dialog" aria-label="${e(s('Repeated reminders'))}">${head}<div class="gnr-rule-top">${freq}<button type="button" class="gnr-switch${r.on ? ' on' : ''}" data-action="gnow-rule-switch" role="switch" aria-checked="${r.on}" aria-label="${e(s('Repeated reminders'))}"><i></i></button></div><div class="gnr-rule-options${r.on ? '' : ' off'}"><label class="gnr-interval">${e(pre[0])}<input type="number" min="1" max="99" data-gnr-rule="interval" value="${r.interval}"${dis}>${e(pre[1] || '')}</label>${week}${month}${end}</div><div class="gnr-alert-buttons"><button type="button" data-action="gnow-rule-done">${e(s('Done'))}</button></div></div>`;
  }
  // The next time a repeating reminder is due, from its date on (the end, the interval and the week days counted).
  function nextDue(r, now) {
    const start = new Date(`${r.date}T${r.time || '23:59'}`), rule = r.rule;
    if (!rule) return start;
    const limit = rule.end === 1 && rule.until ? new Date(`${rule.until}T23:59`) : null;
    let count = 0;
    for (let i = 0; i < 3700; i++) {
      const d = new Date(start); const step = rule.interval || 1;
      if (rule.freq === 0) d.setDate(d.getDate() + i * step);
      else if (rule.freq === 1) { const week = Math.floor(i / 7), day = i % 7; d.setDate(d.getDate() - d.getDay() + week * 7 * step + day); if (!rule.days.includes(day) || d < start) continue; }
      else if (rule.freq === 2) { d.setDate(1); d.setMonth(d.getMonth() + i * step); if (rule.monthly === 'nth') { const target = start.getDay(), n = nthOf(r.date); d.setDate(1 + ((target - d.getDay() + 7) % 7) + n * 7); } else if (rule.monthly === 'last') d.setDate(new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()); else d.setDate(Math.min(start.getDate(), new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); }
      else d.setFullYear(d.getFullYear() + i * step);
      count++;
      if ((limit && d > limit) || (rule.end === 2 && count > rule.count)) return start;
      if (d >= now) return d;
    }
    return start;
  }
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const SLOT_HOURS = [9, 13, 17, 20];
  const deg = (data, c) => Number(data.nowUnits) === 1 ? Math.round(c * 9 / 5 + 32) : c;
  const at = (r, now = new Date()) => r.trigger === 'place' ? new Date(8.64e15) : r.rule ? nextDue(r, now) : new Date(`${r.date}T${r.time || '23:59'}`);
  const dayLabel = (date, locale) => new Date(`${date}T00:00`).toLocaleDateString(locale, {weekday: 'short', month: 'short', day: 'numeric'});
  const timeLabel = (time, locale) => new Date(`2000-01-01T${time}`).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
  function reminderWhen(r, now, locale, s) {
    if (r.trigger === 'place' && r.place) return placeLine(r.place, s);
    if (r.rule) { const d = nextDue(r, now); r = {...r, date: ymd(d)}; }
    const time = r.time ? timeLabel(r.time, locale) : '', tomorrow = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    if (r.date === ymd(now)) return time ? AndroidStrings.format(s('Today, %1$s'), time) : s('Day 0');
    if (r.date === tomorrow) return time ? AndroidStrings.format(s('Tomorrow, %1$s'), time) : s('Day 1');
    return time ? `${dayLabel(r.date, locale)}, ${time}` : dayLabel(r.date, locale);
  }
  const upcoming = (data, now) => (data.nowReminders || []).filter(r => at(r, now) >= now).sort((a, b) => at(a, now) - at(b, now));
  const reminderCard = (r, now, locale, s, open) => `<section class="gnow-card gnow-reminder"${open ? ` data-action="gnow-reminder-edit" data-id="${e(r.id)}" role="button"` : ''}><h3 data-no-translate>${e(r.title)}</h3>${open ? '' : menu(s, 'gnow-reminder-menu', r.id)}<p class="gnow-reminder-when"><img src="assets/vn3-ic_reminder_small.png" alt="">${e(reminderWhen(r, now, locale, s))}${r.rule ? ` · ${e(ruleLabel(r.rule, r.date, locale, s))}` : ''}</p></section>`;
  // The editor's draft: the spinners' positions (-1 keeps a date or time set some other way).
  function draftFrom(r, now) {
    const tomorrow = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    if (!r) { const slot = SLOT_HOURS.findIndex(h => h > now.getHours()); return slot < 0 ? {title: '', day: 1, slot: 0} : {title: '', day: 0, slot}; }
    const day = r.date === ymd(now) ? 0 : r.date === tomorrow ? 1 : -1, slot = !r.time ? 4 : SLOT_HOURS.findIndex(h => `${String(h).padStart(2, '0')}:00` === r.time);
    return {id: r.id, title: r.title, day, slot, date: r.date, time: r.time, trigger: r.trigger || 'time', place: r.place || null, rule: r.rule || null};
  }
  // {date, time} for a draft, or null for the choices this demo leaves out (Set date…, Set time…).
  function draftReminder(d, now) {
    const plus = n => ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n));
    const date = d.day === 0 ? plus(0) : d.day === 1 ? plus(1) : d.day === 2 ? (now.getDay() === 6 ? plus(0) : plus(6 - now.getDay())) : d.day === -1 ? d.date : null;
    const time = d.slot >= 0 && d.slot < 4 ? `${String(SLOT_HOURS[d.slot]).padStart(2, '0')}:00` : d.slot === 4 ? '' : d.slot === -1 ? d.time : null;
    return date === null || time === null ? null : {date, time};
  }
  const draftDate = d => d.date || ymd(new Date());
  function editor(d, locale, s, open) {
    const label = kind => kind === 'day' ? (d.day >= 0 ? s(`Day ${d.day}`) : dayLabel(d.date, locale)) : (d.slot >= 0 ? s(`Time ${d.slot}`) : timeLabel(d.time, locale));
    const drop = (kind, count) => open === kind ? `<div class="gnr-drop" role="listbox">${Array.from({length: count}, (_, i) => `<button type="button" role="option" data-action="gnow-reminder-pick" data-id="${kind}:${i}" aria-selected="${(kind === 'day' ? d.day : d.slot) === i}">${e(s(`${kind === 'day' ? 'Day' : 'Time'} ${i}`))}</button>`).join('')}</div>` : '';
    const place = d.trigger === 'place';
    // edit_reminder_location_spinner.xml: the chosen place (its name over the address), then Home, Work and Set location.
    const placeRow = (id, title, sub) => `<button type="button" role="option" data-action="gnow-place-option" data-id="${id}"><b>${e(title)}</b>${sub ? `<small>${e(sub)}</small>` : ''}</button>`;
    const placeDrop = open === 'place' ? `<div class="gnr-drop gnr-place-drop" role="listbox">${placeRow('home', d.home ? s('Home') : s('Set home location'), d.home)}${placeRow('work', d.work ? s('Work') : s('Set work location'), d.work)}${placeRow('custom', s('Set location'), '')}</div>` : '';
    const placeSpin = `<div class="gnr-spin-wrap"><button type="button" class="gnr-spin gnr-place-spin" data-action="gnow-reminder-spin" data-id="place">${e(d.place ? placeLine(d.place, s) : s('Set location'))}</button>${placeDrop}</div>`;
    const spin = (kind, count) => `<div class="gnr-spin-wrap"><button type="button" class="gnr-spin" data-action="gnow-reminder-spin" data-id="${kind}">${e(label(kind))}</button>${drop(kind, count)}</div>`;
    return `<button type="button" class="gnr-scrim" data-action="gnow-reminder-cancel" aria-label="${e(s('Cancel'))}"></button><div class="gnr-edit" role="dialog" aria-label="${e(s(d.id ? 'Edit reminder' : 'Reminders'))}"><div class="gnr-edit-bar"><button type="button" data-action="gnow-reminder-cancel"><img src="assets/vn3-ic_reminder_cancel_normal.png" alt="">${e(s('Cancel'))}</button><i></i><button type="button" data-action="gnow-reminder-set"><img src="assets/vn3-ic_reminder_set_normal.png" alt="">${e(s('Set'))}</button></div><input class="gnr-label" data-gnr-title data-no-translate value="${e(d.title)}" placeholder="${e(s('Add a title'))}" maxlength="200" autocomplete="off" aria-label="${e(s('Add a title'))}"><div class="gnr-trigger"><button type="button" class="${place ? '' : 'on'}" data-action="gnow-trigger" data-id="time" aria-pressed="${!place}"><img src="assets/vn3-ic_reminders_time_${place ? 'normal' : 'selected'}.png" alt="">${e(s('When'))}</button><button type="button" class="${place ? 'on' : ''}" data-action="gnow-trigger" data-id="place" aria-pressed="${place}"><img src="assets/vn3-ic_reminders_place_${place ? 'selected' : 'normal'}.png" alt="">${e(s('Where'))}</button></div><hr>${place ? placeSpin : `${spin('day', 4)}${spin('time', 6)}<button type="button" class="gnr-spin gnr-repeat" data-action="gnow-rule-open">${e(ruleLabel(d.rule, draftDate(d), locale, s))}</button>`}</div>${d.placeDialog ? placeDialog(d.placeDialog, s) : ''}${d.ruleDialog ? recurrenceDialog(d.ruleDialog, draftDate(d), locale, s) : ''}`;
  }
  const confirm = (ui, s) => ui.gnowDialog ? `<button type="button" class="gnr-scrim" data-action="gnow-dialog-close" aria-label="${e(s('Cancel'))}"></button><div class="gnr-alert" role="alertdialog"><p>${e(s('Delete this reminder?'))}</p><div class="gnr-alert-buttons"><button type="button" data-action="gnow-dialog-close">${e(s('Cancel'))}</button><button type="button" data-action="gnow-reminder-delete" data-id="${e(ui.gnowDialog)}">${e(s('Delete'))}</button></div></div>` : '';
  function reminders({data, t, locale, now, ui = {}}) {
    const s = key => S(t, locale, key), all = data.nowReminders || [];
    const up = upcoming(data, now), past = all.filter(r => at(r, now) < now).sort((a, b) => at(b, now) - at(a, now));
    const item = r => `<button type="button" class="gnr-item" data-action="gnow-reminder-edit" data-id="${e(r.id)}"><b data-no-translate>${e(r.title)}</b><small>${e(reminderWhen(r, now, locale, s))}${r.rule ? ` · ${e(ruleLabel(r.rule, r.date, locale, s))}` : ''}</small></button>`;
    const list = `${up.length ? `<h4 class="gnr-head">${e(s('Upcoming'))}</h4>${up.map(item).join('')}` : `<p class="gnr-empty">${e(s('No upcoming reminders'))}</p>`}${past.length ? `<h4 class="gnr-head">${e(s('Past'))}</h4>${past.map(item).join('')}` : ''}`;
    return `<div class="app-view sa-app gnr-app"><header class="gnr-bar"><button type="button" class="gnr-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/ic_ab_back_holo_light.png" alt=""></button><b>${e(s('Reminders'))}</b><button type="button" class="gnr-add" data-action="gnow-reminder-new" aria-label="${e(s('Add a title'))}"><img src="assets/vn3-ic_menu_add_normal.png" alt=""></button></header><div class="gnr-scroll">${list}</div>${ui.gnowDraft ? editor(ui.gnowDraft, locale, s, ui.gnowSpin) : ''}${confirm(ui, s)}</div>`;
  }
  function weatherBack(data, s) {
    const units = Number(data.nowUnits) || 0;
    return `<section class="gnow-card gnow-back">${menu(s, 'gnow-card-back', 'weather')}<p class="gnow-back-q">${e(s('Weather units'))}</p><div class="gnow-back-opts">${['Celsius', 'Fahrenheit'].map((key, i) => `<button type="button" class="${units === i ? 'on' : ''}" data-action="gnow-units" data-id="${i}" aria-pressed="${units === i}">${e(s(key))}</button>`).join('')}</div></section>`;
  }
  function render({data, t, locale, now, ui = {}}) {
    const s = key => S(t, locale, key);
    const today = now.toISOString().slice(0, 10);
    const event = (window.CalendarPrefs ? CalendarPrefs.events(data) : data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    // next_appointment_card.xml: the title, appt_time in CardText.Large, then the View in Calendar button.
    const when = event ? `${new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'})}${event.time ? ', ' + event.time : ''}` : '';
    const dismissed = data.nowDismissed || [], eventKey = event ? `event:${event.id}:${event.date}` : '';
    const eventCard = !event || dismissed.includes(eventKey) ? '' : ui.gnowBack === 'event' ? `<section class="gnow-card gnow-back gnow-appt-back">${menu(s, 'gnow-card-back', 'event')}<div class="gnow-back-opts gnow-back-links"><button type="button" data-action="gnow-event-edit" data-id="${e(event.id)}">${e(s('Edit time in Calendar'))}</button><button type="button" data-action="gnow-event-edit" data-id="${e(event.id)}">${e(s('Edit location in Calendar'))}</button></div></section>` : `<section class="gnow-card gnow-appt" data-gnow-swipe="${e(eventKey)}"><h3>${e(event.title)}</h3>${menu(s, 'gnow-card-back', 'event')}<p class="gnow-appt-time">${e(when)}</p>${event.location ? `<p>${e(event.location)}</p>` : ''}<button class="gnow-action" data-action="open-app" data-app="calendar">${e(s('View in Calendar'))}</button></section>`;
    const foot = (action, key, src, id = '') => `<button data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(s(key))}"><img src="assets/vn3-${src}.png" alt=""></button>`;
    return `<div class="gnow-page" data-gnow><div class="gnow-scroll"><div class="gnow-header" style="background-image:url('assets/vn3-context_header_bg_${period(now.getHours())}.jpg')"></div><div class="gnow-plate"><button class="gnow-plate-logo" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/vn3-ic_google_small_dark.png" alt="Google"></button><button class="gnow-plate-mic" data-action="open-app" data-app="voice-search" aria-label="${e(s('Tap to speak'))}"><img src="assets/vn3-ic_mic_dark.png" alt=""></button></div><div class="gnow-cards">${weather(now, t, locale, s, data, ui)}${upcoming(data, now).map(r => reminderCard(r, now, locale, s)).join('')}${eventCard}<button class="gnow-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(s('More'))}</button></div><div class="gnow-bar">${foot('gnow-reminders', 'Reminders', 'ic_endoflist_reminders_normal')}<i></i>${foot('toast', 'Train Google Now', 'ic_magic_wand_normal', s('Train Google Now'))}<i></i>${foot('gel-overview-settings', 'Menu', 'ic_menu_moreoverflow_normal')}</div></div>${ui.gnowUndo ? `<div class="gnow-undo" role="status"><span>${e(s('Done for now'))}</span><button type="button" data-action="gnow-undo">${e(s('Undo'))}</button></div>` : ''}${confirm(ui, s)}</div>`;
  }
  window.GELNow = {render, reminders, draftFrom, draftReminder, ruleFrom, placeMatches, placeList, PLACES, nextDue};
})();
/* Google Now on the Google Now Launcher's left page, in the 4.4.4 shell (docs/plans/engine-migration.md): its cards
   and their swipe away, reminders with their place, time and repeat dialogs, units and undo, moved out of
   simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {calendarEdit, data, deviceDate, i18n, openApp, render, renderOverlay, save, toast, ui, viewport} = c;
    return {
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          // The Google Now Launcher's third overview button opens the Google Search settings (not simulated).
          // Google Now reminders and card settings (gel-now.js).
          case 'gnow-reminders': ui.gnowDraft = null; ui.gnowDialog = ''; openApp('google-search'); ui.sub = 'reminders'; render(); break;
          case 'gnow-reminder-new': ui.gnowDraft = {...GELNow.draftFrom(null, deviceDate()), home: data.mapsHome || '', work: data.mapsWork || ''}; ui.gnowSpin = ''; render(); viewport.querySelector('[data-gnr-title]')?.focus(); break;
          case 'gnow-reminder-edit': { const item = (data.nowReminders || []).find(r => r.id === id); if (item) { ui.gnowDraft = {...GELNow.draftFrom(item, deviceDate()), home: data.mapsHome || '', work: data.mapsWork || ''}; ui.gnowSpin = ''; render(); } break; }
          case 'gnow-reminder-spin': ui.gnowSpin = ui.gnowSpin === id ? '' : id; render(); break;
          case 'gnow-reminder-pick': if (id === 'day:3' || id === 'time:5') { const d = ui.gnowDraft; ui.gnowSpin = ''; render(); ui.dtp = DateTimePicker.fromValue(id === 'day:3' ? 'date' : 'time', id === 'day:3' ? (d.date || ICSCalendar.iso(deviceDate())) : (d.time || '09:00'), {field: 'gnow', setAction: 'gnow-dtp-set', hour24: !!data.settings.hour24}); ui.overlay = 'dtp'; renderOverlay(); break; } {
            const [kind, value] = id.split(':'), next = {...ui.gnowDraft, [kind === 'day' ? 'day' : 'slot']: Number(value)}; ui.gnowSpin = ''; if (GELNow.draftReminder({...next, day: kind === 'day' ? next.day : 0, slot: kind === 'time' ? next.slot : 0}, deviceDate())) ui.gnowDraft = next; else toast('Not available in this demo'); render(); break; }
          case 'gnow-dtp-set': { const p = ui.dtp, d = ui.gnowDraft; ui.overlay = ''; renderOverlay(); if (!p || !d) break; if (p.kind === 'date') Object.assign(d, {day: -1, date: DateTimePicker.iso(p)}); else Object.assign(d, {slot: -1, time: DateTimePicker.hhmm(p)}); render(); break; }
          // Where: the location spinner's Home / Work (set once through the place search) and Set location.
          case 'gnow-trigger': if (ui.gnowDraft) { ui.gnowDraft.trigger = id; ui.gnowSpin = ''; render(); } break;
          case 'gnow-place-option': { const d = ui.gnowDraft; if (!d) break; ui.gnowSpin = ''; if (id !== 'custom' && d[id]) d.place = {label: id, address: d[id]}; else d.placeDialog = {kind: id, q: ''}; render(); viewport.querySelector('[data-gnp-q]')?.focus(); break; }
          case 'gnow-place-pick': { const d = ui.gnowDraft, hit = GELNow.PLACES.find(([name]) => name === id); if (!d || !hit) break; const [name, address] = hit, kind = d.placeDialog?.kind;
            if (kind === 'home' || kind === 'work') { data[kind === 'home' ? 'mapsHome' : 'mapsWork'] = address; d[kind] = address; d.place = {label: kind, address}; save(); } else d.place = {name, address};
            d.placeDialog = null; render(); break; }
          case 'gnow-place-close': if (ui.gnowDraft) { ui.gnowDraft.placeDialog = null; render(); } break;
          // Repeat: the recurrence dialog's switch, week days, month pattern and Done.
          case 'gnow-rule-open': { const d = ui.gnowDraft; if (!d) break; const date = GELNow.draftReminder(d, deviceDate())?.date || ICSCalendar.iso(deviceDate()); d.ruleDialog = {...GELNow.ruleFrom(date, d.rule), on: !!d.rule}; render(); break; }
          case 'gnow-rule-switch': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.on = !ui.gnowDraft.ruleDialog.on; render(); } break;
          case 'gnow-rule-day': { const r = ui.gnowDraft?.ruleDialog; if (!r) break; const day = Number(id); r.days = r.days.includes(day) ? (r.days.length > 1 ? r.days.filter(x => x !== day) : r.days) : [...r.days, day].sort(); render(); break; }
          case 'gnow-rule-month': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.monthly = id; render(); } break;
          case 'gnow-rule-cancel': if (ui.gnowDraft) { ui.gnowDraft.ruleDialog = null; render(); } break;
          case 'gnow-rule-done': { const d = ui.gnowDraft, r = d?.ruleDialog; if (!r) break; d.rule = r.on ? {freq: r.freq, interval: r.interval, days: r.days, monthly: r.monthly, end: r.end, until: r.until, count: r.count} : null; d.ruleDialog = null; render(); break; }
          // The appointment card's back: its event in Calendar's editor.
          case 'gnow-event-edit': { const event = (data.events || []).find(item => String(item.id) === String(id)); ui.gnowBack = ''; if (!event) break; openApp('calendar'); ui.selectedEvent = event.id; calendarEdit(event); break; }
          case 'gnow-undo': data.nowDismissed = (data.nowDismissed || []).filter(key => key !== ui.gnowUndo); ui.gnowUndo = ''; save(); render(); break;
          case 'gnow-reminder-cancel': ui.gnowDraft = null; ui.gnowSpin = ''; render(); break;
          case 'gnow-reminder-set': { const draft = ui.gnowDraft, when = draft && GELNow.draftReminder(draft, deviceDate()), title = String(draft?.title || '').trim(); if (!when || !title || (draft.trigger === 'place' && !draft.place)) break; const extra = {occasionally: !!when.occasionally, trigger: draft.trigger || 'time', place: draft.trigger === 'place' ? draft.place : null, rule: draft.trigger === 'place' ? null : draft.rule || null}; const list = data.nowReminders ||= []; const item = list.find(r => r.id === draft.id); if (item) Object.assign(item, {title, ...when, ...extra}); else list.push({id: 'r' + Date.now(), title, ...when, ...extra}); ui.gnowDraft = null; ui.gnowSpin = ''; save(); render(); toast(AndroidStrings.pick(window.StockStrings?.google?.['Reminder saved'], i18n.locale(), 'Reminder saved')); break; }
          case 'gnow-reminder-menu': ui.gnowDialog = id; render(); break;
          case 'gnow-reminder-delete': data.nowReminders = (data.nowReminders || []).filter(r => r.id !== id); ui.gnowDialog = ''; ui.gnowDraft = null; save(); render(); break;
          case 'gnow-dialog-close': ui.gnowDialog = ''; render(); break;
          case 'gnow-card-back': ui.gnowBack = ui.gnowBack === id ? '' : id; render(); break;
          case 'gnow-units': data.nowUnits = Number(id); save(); render(); break;
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.matches('[data-gnp-q]') && ui.gnowDraft?.placeDialog) { ui.gnowDraft.placeDialog.q = event.target.value; const at = event.target.selectionStart; render(); const field = viewport.querySelector('[data-gnp-q]'); field?.focus(); field?.setSelectionRange(at, at); return true; }
        if (event.target.matches('[data-gnr-rule]') && ui.gnowDraft?.ruleDialog) { const r = ui.gnowDraft.ruleDialog, key = event.target.dataset.gnrRule, value = event.target.value;
          if (key === 'interval' || key === 'count') { r[key] = Math.max(1, Math.min(key === 'count' ? 730 : 99, Number(value) || 1)); const label = event.target.closest('.gnr-interval'); if (label && key === 'interval') { const keep = event.target.selectionStart; render(); const f = viewport.querySelector('[data-gnr-rule="interval"]'); f?.focus(); try { f?.setSelectionRange(keep, keep); } catch (error) { /* number input */ } } return true; }
          if (key === 'until') { r.until = value; return true; }
          r[key] = Number(value); if (key === 'end' && r.end === 1 && !r.until) r.until = ICSCalendar.iso(new Date(deviceDate().getTime() + 30 * 864e5)); render(); return true; }
        if (event.target.matches('[data-gnr-title]')) { if (ui.gnowDraft) ui.gnowDraft.title = event.target.value; return true; }
        return false;
      },
      listener0: event => {
      const card = event.target.closest?.('[data-gnow-swipe]');
      if (!card || event.target.closest('button')) return;
      event.stopPropagation();
      const x = event.clientX, y = event.clientY, key = card.dataset.gnowSwipe;
      let dx = 0, moved = false;
      const move = ev => { dx = ev.clientX - x; if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(ev.clientY - y)) moved = true; if (moved) { card.style.translate = `${dx}px 0`; card.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / card.clientWidth)); } };
      const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
        if (moved && Math.abs(dx) > card.clientWidth * .4) { (data.nowDismissed ||= []).push(key); ui.gnowUndo = key; save(); render(); setTimeout(() => { if (ui.gnowUndo === key) { ui.gnowUndo = ''; render(); } }, 6000); }
        else { card.style.translate = ''; card.style.opacity = ''; } };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
      },
      init() {
        document.addEventListener('pointerdown', (...args) => scope(c).listener0(...args), true);
      }
    };
  }
  const spec = {
    action: (name, el, event, c) => scope(c).action(name, el, event),
    input: (event, c) => scope(c).input(event),
    init: c => scope(c).init()
  };
  if (window.KK) for (const id of ['google-now']) KK.register(id, spec);
})();
