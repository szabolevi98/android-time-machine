/* Android 2.3.6 Calendar (packages/apps/Calendar): MonthActivity (month_activity.xml with the window title, the 23 dip
   #dedede day names and the MonthView grid: 20 dip day numbers, #888888 today, #ececec other months, 6 dip busy bits),
   DayActivity / WeekActivity (CalendarView: #dedede hour column, ten hours per screen, rounded event boxes), AgendaActivity,
   EventInfoActivity (bg_cal_card on the calendar colour) and EditEvent (edit_event.xml with the Done / Revert / Delete
   bottom bar), MenuHelper's options menu and the DatePicker / TimePicker dialogs. Data and recurrence come from calendar.js
   (ICSCalendar); strings from gb-strings-calendar.js. hdpi px x 0.575, 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const C = () => window.ICSCalendar;
  const R = AndroidStrings.resources(() => window.GBStrings?.calendar), text = (lang, key) => R.t(key, lang), array = (lang, key) => R.array(key, lang);
  // The phone's local calendar colour (Calendars.COLOR) used for event boxes and the event info card.
  const COLOR = '#2952a3';
  const minutes = time => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
  const at = (date, time) => new Date(`${date}T${time}:00`);
  const fmt = (date, locale, options) => C().parse(date).toLocaleDateString(locale, options);
  const clockText = (date, time, ctx) => at(date, time).toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
  // reminder_minutes_values / labels (no "at the time of the event" in 2.3).
  const reminderValues = lang => array(lang, 'reminder_minutes_values').map(Number);
  const reminderText = (value, lang) => { const values = reminderValues(lang), i = values.indexOf(value); return i >= 0 ? array(lang, 'reminder_minutes_labels')[i] : array(lang, 'reminder_minutes_labels')[2] || ''; };
  // EditEvent repeat spinner order matches ICSCalendar.repeats: one-time, daily, weekdays, weekly, monthly by weekday, monthly by day, yearly.
  function repeatText(repeat, date, ctx) {
    const T = key => text(ctx.lang, key), d = C().parse(date), weekday = d.toLocaleDateString(ctx.locale, {weekday: 'long'});
    if (repeat === 'daily') return T('daily');
    if (repeat === 'weekdays') return T('every_weekday');
    if (repeat === 'weekly') return AndroidStrings.format(T('weekly'), weekday);
    if (repeat === 'monthly-weekday') {
      const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(), n = d.getDate() + 7 > last && d.getDate() > 28 ? 4 : Math.ceil(d.getDate() / 7) - 1;
      return AndroidStrings.format(T('monthly_on_day_count'), array(ctx.lang, 'ordinal_labels')[n] || '', weekday);
    }
    if (repeat === 'monthly-day') return AndroidStrings.format(T('monthly_on_day'), d.getDate());
    if (repeat === 'yearly') return AndroidStrings.format(T('yearly'), d.toLocaleDateString(ctx.locale, {month: 'long', day: 'numeric'}));
    return T('does_not_repeat');
  }
  const title = (body, extra = '') => `<div class="gb-titlebar gbcal-title${extra}">${body}</div>`;

  /* MonthView */
  function monthView(ctx) {
    const {selected, now} = ctx, today = C().iso(now), days = C().month(selected, ctx.first), weekNames = C().week(selected, ctx.first);
    const bits = date => C().onDay(ctx.events, date).map(item => {
      const start = item.allDay || item.date < date ? 0 : minutes(item.time), end = item.allDay || item.endDate > date ? 1440 : minutes(item.endTime);
      return `<b style="top:${(start / 1440 * 100).toFixed(2)}%;height:${(Math.max(end - start, 24) / 1440 * 100).toFixed(2)}%"></b>`;
    });
    const cells = days.map(date => {
      const other = date.slice(0, 7) !== selected.slice(0, 7), b = bits(date);
      return `<button class="gbcal-cell${other ? ' other' : ''}${date === today && !other ? ' today' : ''}${b.length && !other ? ' busy' : ''}" data-action="calendar-day" data-id="${date}" data-gbcal-day="${date}" aria-label="${e(fmt(date, ctx.locale, {weekday: 'long', month: 'long', day: 'numeric'}))}"><span>${C().parse(date).getDate()}</span><i class="gbcal-bb">${other ? '' : b.join('')}</i></button>`;
    }).join('');
    return `<div class="app-view gbcal gbcal-month" data-no-translate>${title(e(fmt(selected, ctx.locale, {month: 'long', year: 'numeric'})), ' center')}<div class="gbcal-daynames">${weekNames.map(date => `<span>${e(fmt(date, ctx.locale, {weekday: 'short'}))}</span>`).join('')}</div><div class="gbcal-grid" data-gbcal-swipe>${cells}</div></div>`;
  }

  /* CalendarView (Day and Week) */
  function daysView(ctx) {
    const week = ctx.mode === 'Week', dates = week ? C().week(ctx.selected, ctx.first) : [ctx.selected], today = C().iso(ctx.now);
    const head = week
      ? e(new Intl.DateTimeFormat(ctx.locale, {month: 'short', day: 'numeric', year: 'numeric'}).formatRange(C().parse(dates[0]), C().parse(dates[6])))
      : e(fmt(ctx.selected, ctx.locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}));
    // Day header: weekday_day "%1$s %2$s" with a two-digit day; seven columns on the phone are narrower than the medium
    // names, so drawDayHeaderLoop uses the two-letter ones (mDayStrs2Letter).
    const banner = week ? `<div class="gbcal-banner"><span class="gbcal-corner"></span>${dates.map(date => `<button class="gbcal-dayhead${C().parse(date).getDay() % 6 === 0 ? ' weekend' : ''}" data-action="calendar-day" data-id="${date}">${e(fmt(date, ctx.locale, {weekday: 'short'}).replace(/\.$/, '').slice(0, 2))} ${String(C().parse(date).getDate()).padStart(2, '0')}</button>`).join('')}</div>` : '';
    const allDay = dates.map(date => C().onDay(ctx.events, date).filter(item => item.allDay));
    const allDayRow = allDay.some(list => list.length) ? `<div class="gbcal-allday"><span class="gbcal-corner"></span>${allDay.map(list => `<div>${list.map(item => `<button class="gbcal-ev" style="--c:${COLOR}" data-action="event-open" data-id="${item.id}" data-date="${item.instance || item.date}">${e(item.title || text(ctx.lang, 'no_title_label'))}</button>`).join('')}</div>`).join('')}</div>` : '';
    const hours = Array.from({length: 24}, (_, h) => `<span class="gbcal-hour">${ctx.hour24 ? String(h).padStart(2, '0') : h % 12 || 12}${!ctx.hour24 && h % 12 === 0 ? `<small>${h ? 'pm' : 'am'}</small>` : ''}</span>`).join('');
    const nowMin = ctx.now.getHours() * 60 + ctx.now.getMinutes();
    const columns = dates.map(date => {
      const boxes = C().lanes(ctx.events, date).map(({event, start, end, lane, columns}) => `<button class="gbcal-ev" style="--c:${COLOR};top:${(start / 60 * 10).toFixed(3)}cqh;height:${(Math.max(end - start, 15) / 60 * 10).toFixed(3)}cqh;left:${(lane / columns * 100).toFixed(2)}%;width:${(100 / columns).toFixed(2)}%" data-action="event-open" data-id="${event.id}" data-date="${event.instance || event.date}">${e(event.title || text(ctx.lang, 'no_title_label'))}${event.location ? `<small>${e(event.location)}</small>` : ''}</button>`).join('');
      const slots = Array.from({length: 24}, (_, h) => `<button class="gbcal-slot" data-action="calendar-slot" data-id="${date}|${String(h).padStart(2, '0')}:00" aria-label="${h}:00"></button>`).join('');
      return `<div class="gbcal-col">${slots}${boxes}${date === today ? `<i class="gbcal-now" style="top:${(nowMin / 60 * 10).toFixed(3)}cqh"></i>` : ''}</div>`;
    }).join('');
    return `<div class="app-view gbcal gbcal-days${week ? ' week' : ''}" data-no-translate>${title(head, ' center')}${banner}${allDayRow}<div class="gbcal-scroll" data-calendar-swipe><div class="gbcal-hours" style="--days:${dates.length}"><div class="gbcal-hourcol">${hours}</div>${columns}</div></div></div>`;
  }

  /* AgendaActivity: agenda_header_footer rows, agenda_day bars, agenda_item rows with the calendar colour strip. */
  function agendaView(ctx) {
    const T = key => text(ctx.lang, key), from = ctx.selected, to = C().plus(from, 30), today = C().iso(ctx.now);
    const items = C().expand(ctx.events, from, to).filter(item => item.date >= from).sort((a, b) => (a.date + (a.allDay ? '' : a.time)).localeCompare(b.date + (b.allDay ? '' : b.time)));
    const long = date => fmt(date, ctx.locale, {weekday: 'long', month: 'long', day: 'numeric'});
    let previous = '', rows = '';
    for (const item of items) {
      if (item.date !== previous) { rows += `<div class="gbcal-agenda-day">${e(item.date === today ? AndroidStrings.format(T('agenda_today'), long(item.date)) : long(item.date))}</div>`; previous = item.date; }
      const when = item.allDay ? fmt(item.date, ctx.locale, {month: 'short', day: 'numeric'}) : `${clockText(item.date, item.time, ctx)} – ${clockText(item.endDate, item.endTime, ctx)}`;
      rows += `<button class="gbcal-agenda-item" style="--c:${COLOR}" data-action="event-open" data-id="${item.id}" data-date="${item.instance || item.date}"><b>${e(item.title || T('no_title_label'))}</b><span class="when">${e(when)}</span>${item.location ? `<span>${e(item.location)}</span>` : ''}</button>`;
    }
    const short = date => fmt(date, ctx.locale, {month: 'short', day: 'numeric', year: 'numeric'});
    return `<div class="app-view gbcal gbcal-agenda" data-no-translate>${title(e(T('agenda_view')))}<div class="gbcal-agenda-list"><button class="gbcal-agenda-more" data-action="gbcal-agenda-step" data-id="-1">${e(AndroidStrings.format(T('show_older_events'), short(from)))}</button>${rows}<button class="gbcal-agenda-more" data-action="gbcal-agenda-step" data-id="1">${e(AndroidStrings.format(T('show_newer_events'), short(to)))}</button></div></div>`;
  }

  /* EventInfoActivity */
  function whenText(item, ctx) {
    const day = date => fmt(date, ctx.locale, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'});
    if (item.allDay) return item.endDate > C().plus(item.date, 1) ? `${day(item.date)} – ${day(C().plus(item.endDate, -1))}` : day(item.date);
    if (item.endDate !== item.date) return `${day(item.date)}, ${clockText(item.date, item.time, ctx)} – ${day(item.endDate)}, ${clockText(item.endDate, item.endTime, ctx)}`;
    return `${day(item.date)}, ${clockText(item.date, item.time, ctx)} – ${clockText(item.endDate, item.endTime, ctx)}`;
  }
  function infoView(ctx) {
    const T = key => text(ctx.lang, key), item = C().instance(ctx.event, ctx.instance);
    const reminder = item.reminder >= 0 ? `<div class="gbcal-rem"><button class="gbcal-spinner" data-action="gbcal-dialog" data-id="info-reminder">${e(reminderText(item.reminder, ctx.lang))}</button><button class="gbcal-round minus" data-action="gbcal-info-reminder" data-id="-1" aria-label="Remove reminder"></button></div>` : '';
    return `<div class="app-view gbcal gbcal-info" data-no-translate>${title(e(T('event_info_title')))}<div class="gbcal-scrollarea"><div class="gbcal-info-top"><div class="gbcal-card-bg" style="--c:${COLOR}"><div class="gbcal-card">
      <div class="gbcal-info-title">${e(item.title || T('no_title_label'))}</div>
      <div class="gbcal-small">${e(T('view_event_calendar_label'))} ${e(ctx.account)}</div>
      <i class="gbcal-divider"></i>
      <div class="gbcal-small gbcal-when">${e(whenText(item, ctx))}</div>
      ${item.repeat !== 'none' ? `<div class="gbcal-small gbcal-repeat"><img src="assets/gb-cal-ic_repeat_dark.png" alt="">${e(repeatText(item.repeat, item.seriesStart || item.date, ctx))}</div>` : ''}
      ${item.location ? `<div class="gbcal-small gbcal-pad">${e(item.location)}</div>` : ''}
      ${item.description ? `<div class="gbcal-small gbcal-pad">${e(item.description)}</div>` : ''}
    </div></div></div>
    <div class="gbcal-reminders"><div class="gbcal-label">${e(T('reminders_label'))}</div>${reminder}${item.reminder >= 0 ? '' : `<div class="gbcal-adder"><span>${e(T('add_new_reminder'))}</span><button class="gbcal-round plus" data-action="gbcal-info-reminder" data-id="1" aria-label="${e(T('add_new_reminder'))}"></button></div>`}</div></div></div>`;
  }

  /* EditEvent: labels in bold textColorSecondaryInverse, EditTexts, date / time buttons, Spinners and the bottom bar. */
  function editView(ctx) {
    const T = key => text(ctx.lang, key), d = C().normalize(ctx.draft || {date: ctx.selected, title: ''});
    const label = key => `<div class="gbcal-label">${e(T(key))}</div>`;
    const dateBtn = (field, value) => `<button type="button" class="gbcal-btn date" data-action="gbcal-dialog" data-id="${field}">${e(fmt(value, ctx.locale, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}))}</button>`;
    const timeBtn = (field, date, value) => `<button type="button" class="gbcal-btn time" data-action="gbcal-dialog" data-id="${field}"${d.allDay ? ' hidden' : ''}>${e(clockText(date, value, ctx))}</button>`;
    const reminder = d.reminder >= 0 ? `<div class="gbcal-rem"><button type="button" class="gbcal-spinner" data-action="gbcal-dialog" data-id="reminder">${e(reminderText(d.reminder, ctx.lang))}</button><button type="button" class="gbcal-round minus" data-action="gbcal-reminder" data-id="-1" aria-label="Remove reminder"></button></div>` : '';
    const availability = array(ctx.lang, 'availability'), visibility = array(ctx.lang, 'visibility');
    return `<form class="app-view gbcal gbcal-edit" data-form="event" data-no-translate>${title(e(T('event_edit_title')))}<div class="gbcal-scrollarea">
      <div class="gbcal-sec">${label('what_label')}<input class="gbcal-field" name="title" maxlength="120" placeholder="${e(T('hint_what'))}" value="${e(d.title)}"></div>
      <div class="gbcal-sec">${label('edit_event_from_label')}<div class="gbcal-pair">${dateBtn('date', d.date)}${timeBtn('time', d.date, d.time)}</div>${label('edit_event_to_label')}<div class="gbcal-pair">${dateBtn('endDate', d.endDate)}${timeBtn('endTime', d.endDate, d.endTime)}</div>
        <div class="gbcal-allday-row"><span>${e(T('edit_event_all_day_label'))}</span><input type="checkbox" class="gbcal-check" name="allDay" data-gbcal-allday${d.allDay ? ' checked' : ''} aria-label="${e(T('edit_event_all_day_label'))}"></div>
        ${ctx.error ? `<div class="gbcal-error">${e(ctx.error)}</div>` : ''}</div>
      <i class="gbcal-bright"></i>
      <div class="gbcal-sec">${label('where_label')}<input class="gbcal-field" name="location" maxlength="120" placeholder="${e(T('hint_where'))}" value="${e(d.location)}"></div>
      <div class="gbcal-sec">${label('description_label')}<input class="gbcal-field" name="description" maxlength="500" placeholder="${e(T('hint_description'))}" value="${e(d.description)}"></div>
      <div class="gbcal-sec"><i class="gbcal-dark"></i>${label('edit_event_calendar_label')}<div class="gbcal-spinner static">${e(ctx.account)}</div></div>
      <div class="gbcal-sec">${label('repeats_label')}<button type="button" class="gbcal-spinner" data-action="gbcal-dialog" data-id="repeat">${e(repeatText(d.repeat, d.date, ctx))}</button></div>
      ${ctx.extra ? `<div class="gbcal-sec">${label('presence_label')}<button type="button" class="gbcal-spinner" data-action="gbcal-dialog" data-id="availability">${e(availability[d.availability ?? 0] || '')}</button></div><div class="gbcal-sec">${label('privacy_label')}<button type="button" class="gbcal-spinner" data-action="gbcal-dialog" data-id="visibility">${e(visibility[d.visibility ?? 0] || '')}</button></div>` : ''}
      <i class="gbcal-dark"></i>
      <div class="gbcal-sec">${label('reminders_label')}${reminder}</div>
      ${d.reminder >= 0 ? '' : `<div class="gbcal-adder"><span>${e(T('add_new_reminder'))}</span><button type="button" class="gbcal-round plus" data-action="gbcal-reminder" data-id="1" aria-label="${e(T('add_new_reminder'))}"></button></div>`}
      <input type="hidden" name="date" value="${d.date}"><input type="hidden" name="time" value="${d.time}"><input type="hidden" name="endDate" value="${d.endDate}"><input type="hidden" name="endTime" value="${d.endTime}"><input type="hidden" name="repeat" value="${d.repeat}"><input type="hidden" name="reminder" value="${d.reminder}">
    </div><div class="gbcal-bottombar"><button type="submit">${e(T('save_label'))}</button><button type="button" data-action="event-cancel">${e(T('discard_label'))}</button>${d.id ? `<button type="button" data-action="event-delete">${e(T('delete_label'))}</button>` : ''}</div></form>`;
  }

  function render(ctx) {
    if (ctx.sub === 'event-edit') return editView(ctx);
    if (ctx.sub === 'event' && ctx.event) return infoView(ctx);
    if (ctx.mode === 'Agenda') return agendaView(ctx);
    if (ctx.mode === 'Day' || ctx.mode === 'Week') return daysView(ctx);
    return monthView(ctx);
  }

  // MenuHelper.onCreateOptionsMenu: the current view's own item is disabled; EventInfo and EditEvent have their own menus.
  function menu(ctx) {
    const T = key => text(ctx.lang, key);
    if (ctx.sub === 'event') return [{action: 'event-edit', title: T('event_edit'), icon: 'ic_menu_edit'}, {action: 'event-delete', title: T('event_delete'), icon: 'ic_menu_delete'}];
    if (ctx.sub === 'event-edit') return [{action: 'gbcal-extra', title: T(ctx.extra ? 'edit_event_hide_extra_options' : 'edit_event_show_extra_options'), icon: 'ic_menu_preferences'}, ...(ctx.draft?.id ? [{action: 'event-delete', title: T('delete_label'), icon: 'ic_menu_delete'}] : [])];
    const na = 'This feature is not part of the simulator.';
    return [
      {action: 'calendar-mode', id: 'Day', title: T('day_view'), icon: 'ic_menu_day', disabled: ctx.mode === 'Day'},
      {action: 'calendar-mode', id: 'Week', title: T('week_view'), icon: 'ic_menu_week', disabled: ctx.mode === 'Week'},
      {action: 'calendar-mode', id: 'Month', title: T('month_view'), icon: 'ic_menu_month', disabled: ctx.mode === 'Month'},
      {action: 'calendar-mode', id: 'Agenda', title: T('agenda_view'), icon: 'ic_menu_agenda', disabled: ctx.mode === 'Agenda'},
      {action: 'calendar-today', title: T('goto_today'), icon: 'ic_menu_today'},
      {action: 'event-new', title: T('event_create'), icon: 'ic_menu_add'},
      {action: 'gbcal-select', title: T('menu_select_calendars'), icon: 'ic_menu_manage'},
      {action: 'gbpref-open', id: 'calendar', title: T('menu_preferences'), icon: 'ic_menu_preferences'}
    ];
  }

  // Dialogs: DatePickerDialog / TimePickerDialog (ic_dialog_time, NumberPickers 80 / 80 / 95 dip and 70 dip, Set / Cancel),
  // the Spinner choice lists, the month context menu, the delete confirmations and the recurring scope lists.
  function picker(field, value, step, width) {
    return `<div class="gbtp-picker"${width ? ` style="width:calc(${width} * var(--dp))"` : ''}><button type="button" class="gbtp-up" data-action="${step}" data-id="${field}:1" aria-label="+"></button><output class="gbtp-input">${e(value)}</output><button type="button" class="gbtp-down" data-action="${step}" data-id="${field}:-1" aria-label="-"></button></div>`;
  }
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), temp = ctx.temp || {}, d = C().normalize(ctx.draft || {date: ctx.selected, title: ''});
    if (kind === 'date' || kind === 'endDate') {
      const date = C().parse(temp.value || d[kind]);
      const pickers = [picker('month', date.toLocaleDateString(ctx.locale, {month: 'short'}), 'gbcal-date-step', 80), picker('day', date.getDate(), 'gbcal-date-step', 80), picker('year', date.getFullYear(), 'gbcal-date-step', 95)];
      const order = ctx.locale.startsWith('en') ? [0, 1, 2] : ctx.lang === 'hu' ? [2, 0, 1] : [1, 0, 2];
      return {title: fmt(temp.value || d[kind], ctx.locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}), icon: 'gb-ic_dialog_time.png', custom: `<div class="gbtp gbcal-dp">${order.map(i => pickers[i]).join('')}</div>`, buttons: [{action: 'gbcal-picker-set', title: ctx.setLabel}, {action: 'close-overlay', title: ctx.cancel}]};
    }
    if (kind === 'time' || kind === 'endTime') {
      const value = temp.value || d[kind], [h, m] = value.split(':').map(Number), ampm = h < 12 ? 'AM' : 'PM';
      return {title: clockText(d.date, value, ctx), icon: 'gb-ic_dialog_time.png', custom: `<div class="gbtp">${picker('hour', ctx.hour24 ? String(h).padStart(2, '0') : String(h % 12 || 12), 'gbcal-time-step')}${picker('minute', String(m).padStart(2, '0'), 'gbcal-time-step')}${ctx.hour24 ? '' : `<button type="button" class="gbtp-ampm" data-action="gbcal-ampm">${ampm}</button>`}</div>`, buttons: [{action: 'gbcal-picker-set', title: ctx.setLabel}, {action: 'close-overlay', title: ctx.cancel}]};
    }
    if (kind === 'repeat') return {title: T('repeats_label'), choice: 'single', selected: Math.max(0, C().repeats.indexOf(d.repeat)), items: C().repeats.map(r => ({action: 'gbcal-choose', id: `repeat:${r}`, title: repeatText(r, d.date, ctx)}))};
    if (kind === 'reminder' || kind === 'info-reminder') {
      const current = kind === 'reminder' ? d.reminder : C().normalize(ctx.event || {}).reminder;
      return {title: T('reminders_label'), choice: 'single', selected: Math.max(0, reminderValues(ctx.lang).indexOf(current)), items: reminderValues(ctx.lang).map((v, i) => ({action: 'gbcal-choose', id: `${kind}:${v}`, title: array(ctx.lang, 'reminder_minutes_labels')[i]}))};
    }
    if (kind === 'availability' || kind === 'visibility') return {title: T(kind === 'availability' ? 'presence_label' : 'privacy_label'), choice: 'single', selected: d[kind] ?? 0, items: array(ctx.lang, kind).map((label, i) => ({action: 'gbcal-choose', id: `${kind}:${i}`, title: label}))};
    if (kind === 'day-context') return {title: fmt(ctx.target, ctx.locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}), items: [{action: 'calendar-day', id: ctx.target, title: T('show_day_view')}, {action: 'gbcal-agenda-from', id: ctx.target, title: T('show_agenda_view')}, {action: 'gbcal-new-on', id: ctx.target, title: T('event_create')}]};
    if (kind === 'delete') return {title: T('delete_title'), icon: 'ic_dialog_alert', message: T('delete_this_event_title'), buttons: [{action: 'event-confirm-delete', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'delete-scope') return {title: T('delete_title'), choice: 'single', selected: -1, items: array(ctx.lang, 'delete_repeating_labels').map((label, i) => ({action: 'event-delete-scope', id: ['this', 'future', 'all'][i], title: label})), buttons: [{action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'edit-scope') return {title: T('event_edit'), items: [['this', 'modify_event'], ['all', 'modify_all'], ['future', 'modify_all_following']].map(([id, key]) => ({action: 'event-edit-scope', id, title: T(key)}))};
    return null;
  }
  // DatePicker / TimePicker steps on an ISO date or HH:MM value.
  function step(kind, value, field, delta) {
    if (kind === 'date') {
      const d = C().parse(value);
      if (field === 'day') d.setDate(d.getDate() + delta);
      else { const day = d.getDate(); d.setDate(1); if (field === 'month') d.setMonth(d.getMonth() + delta); else d.setFullYear(Math.max(1970, Math.min(2036, d.getFullYear() + delta))); d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate())); }
      return C().iso(d);
    }
    let [h, m] = value.split(':').map(Number);
    if (field === 'hour') h = (h + delta + 24) % 24; else if (field === 'minute') m = (m + delta + 60) % 60; else h = (h + 12) % 24;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  /* SelectCalendarsActivity (calendars_activity.xml): the ExpandableListView of accounts (account_item: textAppearanceLarge
     account, small account type) with calendar_item children (10 x 58 dip colour bar, the name, the status and the
     MultiStateButton - widget_show / widget_sync / widget_off), then the ButtonBar with OK and Cancel. A click cycles
     synced & visible -> synced, not visible -> not synced -> synced & visible. */
  const SELECT_STATES = [['synced_visible', 'widget_show'], ['synced_not_visible', 'widget_sync'], ['not_synced_not_visible', 'widget_off']];
  function selectCalendars(ctx) {
    const T = key => text(ctx.lang, key), [status, icon] = SELECT_STATES[ctx.state] || SELECT_STATES[0];
    const child = ctx.expanded ? `<button type="button" class="gbcal-sel-cal" data-action="gbcal-select-cycle"><i style="background:${COLOR}"></i><span class="gbcal-sel-name">${e(ctx.account)}</span><span class="gbcal-sel-status">${e(T(status))}</span><img src="assets/gb-cal-${icon}.png" alt=""></button>` : '';
    return `<div class="app-view gbcal gbcal-sel" data-no-translate><div class="gb-titlebar">${e(T('calendars_title'))}</div><div class="gbcal-sel-list"><button type="button" class="gbcal-sel-acct" data-action="gbcal-select-group" aria-expanded="${ctx.expanded}"><img src="assets/gb-expander_ic_${ctx.expanded ? 'maximized' : 'minimized'}.png" alt=""><span><b>${e(ctx.account)}</b><small>${e(ctx.accountType)}</small></span></button>${child}</div><div class="gbcal-bottombar"><button type="button" data-action="gbcal-select-ok">${e(ctx.ok)}</button><button type="button" data-action="back">${e(ctx.cancel)}</button></div></div>`;
  }
  window.GBCalendar = {COLOR, text, array, repeatText, reminderText, whenText, render, menu, dialog, step, selectCalendars};
})();
