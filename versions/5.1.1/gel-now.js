/* Google Now on the Nexus 6: the Google Now Launcher's left-most pane and the Google app, both Google Search 4.1.29
   (Velvet.apk of the LMY48Y image). now_client_cards_view.xml: GelNavigationDrawerLayout around GelNowCardsView on
   activity_background #eeeeee; the time-of-day picture (context_header_bg_*, a 2562 x 500 strip, cropped to the
   96 dp header) under the translucent status bar; the search plate (search_bg) with ic_hamburger, ic_google_small_dark and
   ic_mic_dark; the cards 24 dp below on card_background with Velvet's styles (unchanged from 3.3); load_more_card.xml
   ("More", italic qp_h2 on card_bg_training). There is no in_app_footer any more: Reminders and Customize moved into
   navigation_menu.xml (Reminders, Customize, a #1f000000 divider, Settings, Help & feedback; 48 dp rows, icons 16 dp in,
   14 sp sans-serif-medium text 72 dp in). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // Velvet's own texts from stock-strings.js, else i18n.
  const S = (t, locale, key) => { const row = window.StockStrings?.google?.[key]; return row ? AndroidStrings.pick(row, String(locale || 'en').slice(0, 2), key) : t(key); };
  // The weather pictures come from the web in Google Now; these stand in for them.
  const SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="#fbc02d"/><g stroke="#fbc02d" stroke-width="2" stroke-linecap="round"><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1"/></g></svg>';
  const CLOUD = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg>';
  const period = hour => hour >= 5 && hour < 8 ? 'dawn' : hour >= 8 && hour < 17 ? 'daylight' : hour >= 17 && hour < 20 ? 'dusk' : 'twilight';
  const menu = (s, action = 'sa-unsupported', id = '') => `<button class="gnow-card-menu" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(s('Card menu'))}"><img src="assets/vn4-ic_more_horz.png" alt=""></button>`;
  // weather_card.xml: the title, the 96 dp picture with the 90 dp temperature beside it, the description, wind and
  // precipitation under the picture, then weather_forecast_column.xml's label, icon, bold high and light low.
  function weather(now, t, locale, s, data = {}, ui = {}) {
    if (ui.gnowBack === 'weather') return weatherBack(data, s);
    const temps = [[21, 13], [23, 14], [19, 12], [20, 11]];
    const days = temps.map((_, i) => new Date(now.getTime() + i * 864e5).toLocaleDateString(locale, {weekday: 'short'}));
    return `<section class="gnow-card gnow-weather"><h3>Mountain View</h3>${menu(s, 'gnow-card-back', 'weather')}<div class="gnow-weather-now"><span class="gnow-weather-icon">${CLOUD}</span><b>${deg(data, temps[0][0])}°</b></div><div class="gnow-weather-cond"><p>${e(t('Partly cloudy'))}</p><p><img src="assets/vn4-ic_weather_wind.png" alt="">${Number(data.nowUnits) === 1 ? '8 mph' : '13 km/h'}</p><p><img src="assets/vn4-ic_weather_umbrella.png" alt="">10%</p></div><div class="gnow-week">${temps.map(([hi, lo], i) => `<div><span>${e(days[i])}</span>${i % 2 ? SUN : CLOUD}<b>${deg(data, hi)}°</b><small>${deg(data, lo)}°</small></div>`).join('')}</div></section>`;
  }
  /* Reminders (Velvet 4.1.29). The drawer's Reminders opens RemindersListActivity (Theme.Gsa.ActionBar.Drawer: the
     qp_blue #4285f4 bar with ic_arrow_back and the white title) with reminders_list_content.xml: the reminders as
     reminder_card.xml cards on #eeeeee under Upcoming / Past, or no_upcoming_reminders, and the 56 dp qp_fab (ic_plus,
     16 dp from the corner) to add one. The editor is edit_reminder_layout.xml under edit_reminder_action_bar.xml
     (ic_reminder_cancel Cancel | ic_reminder_set Set): "Add a title", When / Where, the edit_reminder_day spinner (Today,
     Tomorrow, Occasionally, Set date…), edit_reminder_time (Morning, Afternoon, Evening, Night: Velvet's symbolic 9:00,
     13:00, 17:00 and 20:00; All day; Set time…) and One-time. Upcoming reminders are reminder cards on the Now stream;
     their card menu asks "Delete this reminder?". Card settings: the weather card's menu opens card_settings.xml in its
     place (the ic_close_grey600_24dp exit, "Hide card settings") with training_question_radio_group.xml's weather_units
     question: 48 dp training_question_radio_option.xml rows, Celsius / Fahrenheit in qp_h5; the temperatures follow. */
  const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const SLOT_HOURS = [9, 13, 17, 20];
  const deg = (data, c) => Number(data.nowUnits) === 1 ? Math.round(c * 9 / 5 + 32) : c;
  const at = r => new Date(`${r.date}T${r.time || '23:59'}`);
  const dayLabel = (date, locale) => new Date(`${date}T00:00`).toLocaleDateString(locale, {weekday: 'short', month: 'short', day: 'numeric'});
  const timeLabel = (time, locale) => new Date(`2000-01-01T${time}`).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
  function reminderWhen(r, now, locale, s) {
    const time = r.time ? timeLabel(r.time, locale) : '', tomorrow = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    if (r.date === ymd(now)) return time ? AndroidStrings.format(s('Today, %1$s'), time) : s('Day 0');
    if (r.date === tomorrow) return time ? AndroidStrings.format(s('Tomorrow, %1$s'), time) : s('Day 1');
    return time ? `${dayLabel(r.date, locale)}, ${time}` : dayLabel(r.date, locale);
  }
  const upcoming = (data, now) => (data.nowReminders || []).filter(r => at(r) >= now).sort((a, b) => at(a) - at(b));
  const reminderCard = (r, now, locale, s, open) => `<section class="gnow-card gnow-reminder"${open ? ` data-action="gnow-reminder-edit" data-id="${e(r.id)}" role="button"` : ''}><h3 data-no-translate>${e(r.title)}</h3>${open ? '' : menu(s, 'gnow-reminder-menu', r.id)}<p class="gnow-reminder-when"><img src="assets/vn4-ic_reminder_small.png" alt="">${e(reminderWhen(r, now, locale, s))}</p></section>`;
  // The editor's draft: the spinners' positions (-1 keeps a date or time set some other way).
  function draftFrom(r, now) {
    const tomorrow = ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
    if (!r) { const slot = SLOT_HOURS.findIndex(h => h > now.getHours()); return slot < 0 ? {title: '', day: 1, slot: 0} : {title: '', day: 0, slot}; }
    const day = r.date === ymd(now) ? 0 : r.date === tomorrow ? 1 : -1, slot = !r.time ? 4 : SLOT_HOURS.findIndex(h => `${String(h).padStart(2, '0')}:00` === r.time);
    return {id: r.id, title: r.title, day, slot, date: r.date, time: r.time};
  }
  // {date, time} for a draft, or null for the choices this demo leaves out (Set date…, Set time…, Occasionally).
  function draftReminder(d, now) {
    const plus = n => ymd(new Date(now.getFullYear(), now.getMonth(), now.getDate() + n));
    const date = d.day === 0 ? plus(0) : d.day === 1 ? plus(1) : d.day === 2 ? null : d.day === -1 ? d.date : null;
    const time = d.slot >= 0 && d.slot < 4 ? `${String(SLOT_HOURS[d.slot]).padStart(2, '0')}:00` : d.slot === 4 ? '' : d.slot === -1 ? d.time : null;
    return date === null || time === null ? null : {date, time};
  }
  function editor(d, locale, s, open) {
    const label = kind => kind === 'day' ? (d.day >= 0 ? s(`Day ${d.day}`) : dayLabel(d.date, locale)) : (d.slot >= 0 ? s(`Time ${d.slot}`) : timeLabel(d.time, locale));
    const drop = (kind, count) => open === kind ? `<div class="gnr-drop" role="listbox">${Array.from({length: count}, (_, i) => `<button type="button" role="option" data-action="gnow-reminder-pick" data-id="${kind}:${i}" aria-selected="${(kind === 'day' ? d.day : d.slot) === i}">${e(s(`${kind === 'day' ? 'Day' : 'Time'} ${i}`))}</button>`).join('')}</div>` : '';
    const spin = (kind, count) => `<div class="gnr-spin-wrap"><button type="button" class="gnr-spin" data-action="gnow-reminder-spin" data-id="${kind}">${e(label(kind))}</button>${drop(kind, count)}</div>`;
    return `<button type="button" class="gnr-scrim" data-action="gnow-reminder-cancel" aria-label="${e(s('Cancel'))}"></button><div class="gnr-edit" role="dialog" aria-label="${e(s(d.id ? 'Edit reminder' : 'Reminders'))}"><div class="gnr-edit-bar"><button type="button" data-action="gnow-reminder-cancel"><img src="assets/vn4-ic_reminder_cancel_normal.png" alt="">${e(s('Cancel'))}</button><i></i><button type="button" data-action="gnow-reminder-set"><img src="assets/vn4-ic_reminder_set_normal.png" alt="">${e(s('Set'))}</button></div><input class="gnr-label" data-gnr-title data-no-translate value="${e(d.title)}" placeholder="${e(s('Add a title'))}" maxlength="200" autocomplete="off" aria-label="${e(s('Add a title'))}"><div class="gnr-trigger"><button type="button" class="on" aria-pressed="true"><img src="assets/vn4-ic_reminders_time_selected.png" alt="">${e(s('When'))}</button><button type="button" data-action="sa-unsupported"><img src="assets/vn4-ic_reminders_place_normal.png" alt="">${e(s('Where'))}</button></div><hr>${spin('day', 4)}${spin('time', 6)}<button type="button" class="gnr-spin gnr-repeat" data-action="sa-unsupported">${e(s('One-time'))}</button></div>`;
  }
  const confirm = (ui, s) => ui.gnowDialog ? `<button type="button" class="gnr-scrim" data-action="gnow-dialog-close" aria-label="${e(s('Cancel'))}"></button><div class="gnr-alert" role="alertdialog"><p>${e(s('Delete this reminder?'))}</p><div class="gnr-alert-buttons"><button type="button" data-action="gnow-dialog-close">${e(s('Cancel'))}</button><button type="button" data-action="gnow-reminder-delete" data-id="${e(ui.gnowDialog)}">${e(s('Delete'))}</button></div></div>` : '';
  function reminders({data, t, locale, now, ui = {}}) {
    const s = key => S(t, locale, key), all = data.nowReminders || [];
    const up = upcoming(data, now), past = all.filter(r => at(r) < now).sort((a, b) => at(b) - at(a));
    const list = `${up.length ? `<h4 class="gnr-head">${e(s('Upcoming'))}</h4>${up.map(r => reminderCard(r, now, locale, s, true)).join('')}` : `<p class="gnr-empty">${e(s('No upcoming reminders'))}</p>`}${past.length ? `<h4 class="gnr-head">${e(s('Past'))}</h4>${past.map(r => reminderCard(r, now, locale, s, true)).join('')}` : ''}`;
    return `<div class="app-view sa-app gnr-app"><header class="gnr-bar"><button type="button" class="gnr-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/vn4-ic_arrow_back.png" alt=""></button><b>${e(s('Reminders'))}</b></header><div class="gnr-scroll">${list}</div><button type="button" class="gnr-fab" data-action="gnow-reminder-new" aria-label="${e(s('Add a reminder…'))}"><img src="assets/vn4-ic_plus.png" alt=""></button>${ui.gnowDraft ? editor(ui.gnowDraft, locale, s, ui.gnowSpin) : ''}${confirm(ui, s)}</div>`;
  }
  function weatherBack(data, s) {
    const units = Number(data.nowUnits) || 0;
    return `<section class="gnow-card gnow-back"><button type="button" class="gnow-back-exit" data-action="gnow-card-back" data-id="weather" aria-label="${e(s('Hide card settings'))}"><img src="assets/vn4-ic_close_grey600_24dp.png" alt=""></button><p class="gnow-back-q">${e(s('Weather units'))}</p><div class="gnow-back-opts" role="radiogroup">${['Celsius', 'Fahrenheit'].map((key, i) => `<button type="button" class="gnow-back-opt${units === i ? ' on' : ''}" data-action="gnow-units" data-id="${i}" role="radio" aria-checked="${units === i}"><i></i><span>${e(s(key))}</span></button>`).join('')}</div></section>`;
  }
  // Google Search's Now cards › Show cards off (lp-search-prefs.js) leaves the stream without cards.
  function render({data, t, locale, now, ui = {}}) {
    const s = key => S(t, locale, key);
    const today = now.toISOString().slice(0, 10);
    const event = (window.CalendarPrefs ? CalendarPrefs.events(data) : data.events || []).filter(item => !item.date || item.date >= today).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')) || String(a.time || '').localeCompare(String(b.time || '')))[0];
    // next_appointment_card.xml: the title, appt_time in CardText.Large, then the View in Calendar button.
    const when = event ? `${new Date(`${event.date || today}T00:00`).toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric'})}${event.time ? ', ' + event.time : ''}` : '';
    const eventCard = event ? `<section class="gnow-card gnow-appt"><h3>${e(event.title)}</h3>${menu(s)}<p class="gnow-appt-time">${e(when)}</p>${event.location ? `<p>${e(event.location)}</p>` : ''}<button class="gnow-action" data-action="open-app" data-app="calendar">${e(s('View in Calendar'))}</button></section>` : '';
    return `<div class="gnow-page" data-gnow><div class="gnow-scroll"><div class="gnow-header" style="background-image:url('assets/vn4-context_header_bg_${period(now.getHours())}.jpg')"></div><div class="gnow-plate"><button class="gnow-plate-menu" data-action="gnow-drawer" aria-label="${e(t('Menu'))}"><img src="assets/vn4-ic_hamburger.png" alt=""></button><button class="gnow-plate-logo" data-action="browser-search" aria-label="${e(t('Search'))}"><img src="assets/vn4-ic_google_small_dark.png" alt="Google"></button><button class="gnow-plate-mic" data-action="open-app" data-app="voice-search" aria-label="${e(s('Tap to speak'))}"><img src="assets/vn4-ic_mic_dark.png" alt=""></button></div><div class="gnow-cards">${data.googleNowOn === false ? '' : weather(now, t, locale, s, data, ui) + upcoming(data, now).map(r => reminderCard(r, now, locale, s)).join('') + eventCard}<button class="gnow-more" data-action="toast" data-id="${e(t('No more cards right now'))}">${e(s('More'))}</button></div></div><div class="gnow-drawer"><button class="gnow-drawer-scrim" data-action="gnow-drawer" aria-label="${e(t('Close'))}"></button><nav>${[['Reminders', 'ic_reminder', 'gnow-reminders'], ['Customize', 'ic_customize', 'toast']].map(([key, icon, action]) => `<button data-action="${action}" data-id="${e(s(key))}"><img src="assets/vn4-${icon}.png" alt="">${e(s(key))}</button>`).join('')}<hr>${[['Settings', 'ic_settings', 'gel-overview-settings'], ['Help & feedback', 'ic_help_and_feedback', 'toast']].map(([key, icon, action]) => `<button data-action="${action}" data-id="${e(s(key))}"><img src="assets/vn4-${icon}.png" alt="">${e(s(key))}</button>`).join('')}</nav></div>${confirm(ui, s)}</div>`;
  }
  window.GELNow = {render, reminders, draftFrom, draftReminder};
})();
