/* Android 6.0.1 Calendar (Google Calendar 5.2.3, app/CalendarGooglePrebuilt of MTC20K), the app 'calendar', on the
   phone's demo Google account (MM.account). The events are the simulator's own sample data.
   - First run (oobe_page.xml): four pages from oobe_headers / oobe_main_texts / oobe_disclaimers with the
     oobe_resources pictures (icon, richness, quickcreate, smartmail) over the texts (24 sp #de000000, 16 sp #8a000000,
     12 sp disclaimer), GOT IT on the last page (done_button: google_blue #4285f4, 2 dp corners, 14 sp white caps).
   - all_in_one.xml (CalendarTheme.AllInOneActivity: the white action bar, colorAccent accent_blue #4285f4, the status bar
     black): action_bar_custom_view_all_in_one.xml's month title (20 sp #333333) with ic_arrow_down, Today (ic_today) and
     the overflow; the 300 dp drawer (drawer_list_item.xml: 14 sp bold #212121 rows with 32 dp from the icon: Schedule,
     Day, Week, Month; drawer_group_header_item.xml's account row (40 dp avatar, 14 sp #757575); drawer_calendar_item.xml's
     calendars with their colour boxes (Events, Reminders, Birthdays, Holidays); Settings, Help & feedback).
   - The Schedule view (timely): each month opens with its picture (bkg_01_jan … bkg_12_dec, 180 dp, under
     month_header_filter_color #27000000) and its name (21 sp white, 72 dp in, 36 dp down); each week has its header
     (48 dp, 14 sp #757575, 84 dp in); a day with events (and today) has the 60 dp day header (14 sp weekday, 28 sp day,
     #999999 past, #333333 future, accent_blue today) and its chips (2 dp corners, 10 dp padding, 14 sp white; 32 dp, or
     52 dp with the time; 10 dp apart), on #fafafa. The add_event FAB (btn_create, 91 dp) adds an event.
   - An event (event_info.xml): the 128 dp headline in the event's colour with the title, the when and calendar rows
     (ic_date, ic_calendar), edit (ic_edit_white) and delete. The editor (edit_fragment.xml): edit_fragment_header.xml
     (56 dp, ic_cancel_white, SAVE) over the title ("Enter title"), WhenEditSegment (ic_date, All-day, start and end),
     where (ic_location) and the note (ic_notes); leaving unsaved changes asks discard_dialog_body_*.
   - The drawer's Day, Week and Month: the day and week grids (the hours down the side, the day headers with the weekday
     and the date, today in accent_blue, the events as Peacock blocks at their times, all-day ones above, the current
     time's red line), the month grid (the weekday initials, each day's number and its events' titles). Swiping moves a
     period; the title shows the month of the date shown. Touching a free hour starts a new event there.
   - The title's arrow drops the mini month (the month's grid, today circled; swiping turns the month): a day jumps there.
   - Search (the overflow): the query field in the action bar, the events whose title, place or note match, by day;
     no_results_found when none do. Settings: calendar_settings_headers (mm-appprefs.js). */
(() => {
  'use strict';
  const T = () => MM.text('calendar');
  const V = n => `assets/ca-${n}.svg`, A = n => `assets/ca-${n}.png`;
  const PEACOCK = '#039be5'; // "Peacock" of the app's color_names, the default colour of the account's calendar.
  const MONTHS = ['01_jan', '02_feb', '03_mar', '04_apr', '05_may', '06_jun', '07_jul', '08_aug', '09_sep', '10_oct', '11_nov', '12_dec'];
  const day0 = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nextDow = (dow, base = day0()) => { const d = new Date(base); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7)); return d; };
  MM.defaults.events = (() => {
    const today = day0(), plus = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
    return [{id: 1, title: 'Coffee with Alex', date: iso(today), start: '11:00', end: '12:00', allDay: false, where: '', note: ''},
      {id: 2, title: 'Sunday lunch at Mom’s', date: iso(nextDow(0)), start: '12:30', end: '14:00', allDay: false, where: '', note: 'Bring dessert'},
      {id: 3, title: 'Hike with Alex', date: iso(nextDow(6)), start: '08:00', end: '13:00', allDay: false, where: 'Ridge trail', note: ''},
      {id: 4, title: 'Meetup slides due', date: iso(plus(9)), allDay: true, where: '', note: ''}];
  })();
  const records = c => c.data.events || (c.data.events = JSON.parse(JSON.stringify(MM.defaults.events)));
  const events = c => MM.calendarPreferences.visible(c,records(c));
  // The Calendar widget (mm-widgets.js) lists the same events.
  MM.calendarEvents = events;
  const ui = c => c.ui.calendar || (c.ui.calendar = {screen: '', drawer: false, oobe: 0, draft: null});
  const esc = (c, s) => c.safe(s);
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmt = (c, d, o) => new Intl.DateTimeFormat(c.locale(), o).format(d);
  const time = (c, hm) => { const [h, m] = hm.split(':').map(Number); return fmt(c, new Date(2000, 0, 1, h, m), {hour: 'numeric', minute: '2-digit'}); };
  const ic = (src, cls = '') => `<img class="mmcl-ic ${cls}" src="${src}" alt="">`;

  // ---- first run --------------------------------------------------------------------------------------------------
  function oobe(c) {
    const t = T(), u = ui(c), i = u.oobe, imgs = ['icon', 'richness', 'quickcreate', 'smartmail'];
    const disc = t.t('oobe_disclaimers')[i];
    return `<div class="mmcl mmcl-oobe"><div class="mmcl-oimg${i ? '' : ' logo'}"><img src="${A(imgs[i])}" alt=""></div><div class="mmcl-otext"><h1>${esc(c, t.t('oobe_headers')[i])}</h1><p>${esc(c, t.t('oobe_main_texts')[i])}</p>${disc ? `<small>${esc(c, disc)}</small>` : ''}</div>
      <div class="mmcl-obar"><span class="mmcl-dots">${imgs.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span>${i === 3 ? `<button type="button" class="mmcl-done" data-action="mmcl-oobedone">${esc(c, t.t('oobe_done'))}</button>` : `<button type="button" class="mmcl-onext" data-action="mmcl-oobenext" aria-label="next"></button>`}</div></div>`;
  }

  // ---- the Schedule view --------------------------------------------------------------------------------------------
  function schedule(c) {
    const t = T(), today = day0(), byDay = new Map();
    for (const e of events(c)) { const k = e.date; if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); }
    for (const list of byDay.values()) list.sort((a, b) => (a.allDay ? -1 : b.allDay ? 1 : a.start.localeCompare(b.start)));
    const first = new Date(today.getFullYear(), today.getMonth(), 1), last = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    const startDow = firstDow(c);
    let out = '', month = -1;
    const d = new Date(first); d.setDate(d.getDate() - ((d.getDay() - startDow % 7 + 7) % 7));
    while (d <= last) {
      const weekStart = new Date(d), weekEnd = new Date(d); weekEnd.setDate(weekEnd.getDate() + 6);
      // A week holding the first of a month opens with that month's picture.
      for (let k = 0; k < 7; k++) {
        const day = new Date(weekStart); day.setDate(day.getDate() + k);
        if (day.getDate() === 1 && day >= first && day <= last && day.getMonth() !== month) {
          month = day.getMonth();
          out += `<div class="mmcl-month" style="background-image:url('assets/ca-bkg_${MONTHS[month]}.jpg')"><i></i><span>${esc(c, fmt(c, day, {month: 'long', ...(day.getFullYear() !== today.getFullYear() ? {year: 'numeric'} : {})}))}</span></div>`;
        }
      }
      out += week(c, weekStart, weekEnd);
      for (let k = 0; k < 7; k++) {
        const day = new Date(weekStart); day.setDate(day.getDate() + k);
        const key = iso(day), list = byDay.get(key) || [], isToday = +day === +today;
        if ((list.length || isToday) && day >= first && day <= last) {
          const cls = isToday ? 'today' : day < today ? 'past' : '';
          out += `<div class="mmcl-day ${cls}" ${isToday ? 'id="mmcl-today"' : ''}><div class="mmcl-dhead"><small>${esc(c, fmt(c, day, {weekday: 'short'}))}</small><b>${day.getDate()}</b></div><div class="mmcl-chips">${list.map(e => `<button type="button" class="mmcl-chip${e.allDay ? '' : ' two'}" style="background:${PEACOCK}" data-action="mmcl-event" data-id="${e.id}"><b>${esc(c, e.title)}</b>${e.allDay ? '' : `<span>${esc(c, e.noEnd ? time(c,e.start) : `${time(c, e.start)} – ${time(c, e.end)}`)}${e.where ? `, ${esc(c, e.where)}` : ''}</span>`}</button>`).join('') || `<span class="mmcl-none">${esc(c, t.t('no_events'))}</span>`}</div></div>`;
        }
      }
      d.setDate(d.getDate() + 7);
    }
    return out;
  }
  function week(c, a, b) {
    const same = a.getMonth() === b.getMonth();
    return `<div class="mmcl-week">${esc(c, same ? `${fmt(c, a, {month: 'short', day: 'numeric'})} – ${b.getDate()}` : `${fmt(c, a, {month: 'short', day: 'numeric'})} – ${fmt(c, b, {month: 'short', day: 'numeric'})}`)}</div>`;
  }
  function main(c) {
    const t = T(), u = ui(c), view = u.view || 'schedule', d = cur(c);
    const body = view === 'day' ? grid(c, [d]) : view === 'week' ? grid(c, Array.from({length: 7}, (_, i) => add(weekStart(c, d), i))) : view === 'month' ? `<div class="mmcl-mview mmcl-swipe">${monthGrid(c, d, false)}</div>` : '';
    const title = fmt(c, view === 'schedule' && !u.date ? new Date() : d, {month: 'long', ...(d.getFullYear() !== new Date().getFullYear() ? {year: 'numeric'} : {})});
    const picker = u.picker ? `<div class="mmcl-mini mmcl-mswipe">${monthGrid(c, u.pickerMonth ? parse(u.pickerMonth) : d, true)}</div>` : '';
    return `<div class="mmcl"><div class="mmcl-bar"><button type="button" class="mmcl-btn" data-action="mmcl-drawer">${ic(V('ic_menu'))}</button><button type="button" class="mmcl-month-title${u.picker ? ' open' : ''}" data-action="mmcl-picker"><span>${esc(c, u.picker && u.pickerMonth ? fmt(c, parse(u.pickerMonth), {month: 'long'}) : title)}</span><img src="${A('ic_arrow_down')}" alt=""></button><i class="mmcl-flex"></i>
      <button type="button" class="mmcl-btn" data-action="mmcl-today" aria-label="${esc(c, t.t('today'))}">${ic(V('ic_today'))}</button>${MM.menu.button(c, 'mmcl-over')}</div>
      ${picker}${body ? `<div class="mmcl-page mmcl-views">${body}</div>` : `<div class="mmcl-page mmcl-sched">${schedule(c)}</div>`}<button type="button" class="mmcl-fab" data-action="mmcl-new" aria-label="${esc(c, t.t('event'))}"><img src="${A('btn_create')}" alt=""></button>${u.drawer ? drawer(c) : ''}</div>`;
  }
  function drawer(c) {
    const t = T(), view = ui(c).view || 'schedule';
    const item = (icon, key, action, on = false) => `<button type="button" class="mmcl-ditem${on ? ' on' : ''}" data-action="${action}">${ic(icon)}<span>${esc(c, t.t(key))}</span></button>`;
    const cal = (key, color) => `<div class="mmcl-dcal"><i style="background:${color}"></i><span>${esc(c, t.t(key))}</span></div>`;
    return `<div class="mmcl-scrim" data-action="mmcl-drawer"></div><div class="mmcl-drawer"><div class="mmcl-dlist">${item(V('ic_agenda'), 'agenda_view_label', 'mmcl-schedview', view === 'schedule')}${item(A('ic_hourview'), 'hourly_view_label', 'mmcl-dayview', view === 'day')}${item(V('ic_week'), 'week_view_label', 'mmcl-weekview')}${item(A('ic_monthview'), 'month_view_label', 'mmcl-monthview')}
      <i class="mmcl-ddiv"></i><div class="mmcl-dacct"><img src="assets/gm-avatar_placeholder.png" alt=""><span>${esc(c, MM.account.email)}</span></div>${cal('my_events', PEACOCK)}${cal('reminders_calendar_name', '#4285f4')}${cal('drawer_birthdays_text', '#9e69af')}${cal('drawer_holidays_text', '#0b8043')}
      <i class="mmcl-ddiv"></i>${item(V('ic_settings'), 'drawer_settings', 'mmcl-settings')}${item(V('ic_help'), 'drawer_help_feedback', 'mmcl-help')}</div></div>`;
  }

  // ---- Day, Week, Month, the mini month, search ---------------------------------------------------------------------
  const HOUR = 48;
  const firstDow = c => MM.calendarPreferences.firstDay(c);
  const cur = c => { const u = ui(c); return u.date ? parse(u.date) : day0(); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const weekStart = (c, d) => add(d, -((d.getDay() - firstDow(c) + 7) % 7));
  const minutes = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const dayEvents = (c, d) => events(c).filter(e => e.date === iso(d));
  function grid(c, days) {
    const t = T(), today = day0(), now = new Date(), multi = days.length > 1;
    const heads = days.map(d => `<div class="mmcl-gday${+d === +today ? ' today' : ''}"><small>${esc(c, fmt(c, d, {weekday: 'short'}))}</small><b>${d.getDate()}</b></div>`).join('');
    const allDay = days.map(d => `<div class="mmcl-gall">${dayEvents(c, d).filter(e => e.allDay).map(e => `<button type="button" class="mmcl-gchip" data-action="mmcl-event" data-id="${e.id}" style="background:${PEACOCK}">${esc(c, e.title)}</button>`).join('')}</div>`).join('');
    const hours = Array.from({length: 24}, (_, h) => `<div class="mmcl-ghour"><span>${h ? esc(c, fmt(c, new Date(2000, 0, 1, h), {hour: 'numeric'})) : ''}</span></div>`).join('');
    const cols = days.map(d => {
      const blocks = dayEvents(c, d).filter(e => !e.allDay).map(e => { const s = minutes(e.start), en = Math.max(s + 30, minutes(e.end || e.start)); return `<button type="button" class="mmcl-gev" data-action="mmcl-event" data-id="${e.id}" style="top:calc(${s / 60 * HOUR} * var(--dp));height:calc(${(en - s) / 60 * HOUR - 2} * var(--dp));background:${PEACOCK}"><b>${esc(c, e.title)}</b>${multi ? '' : `<small>${esc(c, e.noEnd ? time(c,e.start) : `${time(c, e.start)} – ${time(c, e.end)}`)}${e.where ? `, ${esc(c, e.where)}` : ''}</small>`}</button>`; }).join('');
      const line = +d === +today ? `<i class="mmcl-now" style="top:calc(${(now.getHours() * 60 + now.getMinutes()) / 60 * HOUR} * var(--dp))"></i>` : '';
      return `<div class="mmcl-gcol" data-date="${iso(d)}">${Array.from({length: 24}, (_, h) => `<button type="button" class="mmcl-gslot" data-action="mmcl-slot" data-date="${iso(d)}" data-h="${h}"></button>`).join('')}${blocks}${line}</div>`;
    }).join('');
    return `<div class="mmcl-grid${multi ? ' week' : ''}"><div class="mmcl-ghead"><i class="mmcl-gcorner"></i>${heads}</div><div class="mmcl-gallrow"><i class="mmcl-gcorner"></i>${allDay}</div>
      <div class="mmcl-gscroll mmcl-swipe"><div class="mmcl-gbody"><div class="mmcl-ghours">${hours}</div>${cols}</div></div></div>`;
  }
  function monthGrid(c, d, mini) {
    const weekNumbers = !mini && MM.calendarPreferences.prefs(c).weekNumbers;
    const today = day0(), first = new Date(d.getFullYear(), d.getMonth(), 1), start = weekStart(c, first);
    const initials = Array.from({length: 7}, (_, i) => esc(c, fmt(c, add(start, i), {weekday: 'narrow'}))).map(s => `<i>${s}</i>`).join('');
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const x = add(start, i), out = x.getMonth() !== d.getMonth();
      if (i >= 35 && out && x > first) break;
      const evs = mini ? [] : dayEvents(c, x);
      if(weekNumbers&&i%7===0)cells+=`<i class="mmcl-weeknum">${MM.calendarPreferences.week(x)}</i>`;
      cells += `<button type="button" class="mmcl-mcell${out ? ' out' : ''}${+x === +today ? ' today' : ''}" data-action="${mini ? 'mmcl-jump' : 'mmcl-mday'}" data-date="${iso(x)}"><b>${x.getDate()}</b>${evs.slice(0, 3).map(e => `<span style="background:${PEACOCK}">${esc(c, e.title)}</span>`).join('')}</button>`;
    }
    return `<div class="mmcl-mgrid${weekNumbers?' weeks':''}${mini ? ' mini' : ''}"><div class="mmcl-mdow">${weekNumbers?'<i></i>':''}${initials}</div><div class="mmcl-mcells">${cells}</div></div>`;
  }
  function searchView(c) {
    const t = T(), u = ui(c), q = (u.search || '').trim().toLowerCase();
    const hits = q ? events(c).filter(e => [e.title, e.where, e.note].some(x => (x || '').toLowerCase().includes(q))).sort((a, b) => a.date.localeCompare(b.date) || (a.start || '').localeCompare(b.start || '')) : [];
    const rows = hits.map(e => { const d = parse(e.date); return `<div class="mmcl-day"><div class="mmcl-dhead"><small>${esc(c, fmt(c, d, {weekday: 'short'}))}</small><b>${d.getDate()}</b></div><div class="mmcl-chips"><button type="button" class="mmcl-chip${e.allDay ? '' : ' timed'}" data-action="mmcl-event" data-id="${e.id}" style="background:${PEACOCK}"><b>${esc(c, e.title)}</b>${e.allDay ? '' : `<small>${esc(c, e.noEnd ? time(c,e.start) : `${time(c, e.start)} – ${time(c, e.end)}`)}</small>`}</button></div></div>`; }).join('');
    return `<div class="mmcl"><div class="mmcl-bar"><button type="button" class="mmcl-btn" data-action="mmcl-sback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><input class="mmcl-q" value="${esc(c, u.search || '')}" placeholder="${esc(c, t.t('search'))}" autocomplete="off">${u.search ? `<button type="button" class="mmcl-btn" data-action="mmcl-sclear" aria-label="${esc(c, t.t('accessibility_clear_search'))}"><img src="assets/gm-abc_ic_clear_mtrl_alpha.png" alt=""></button>` : ''}</div>
      <div class="mmcl-page mmcl-sched">${rows || (q ? `<div class="mmcl-none">${esc(c, t.t('no_results_found'))}</div>` : '')}</div></div>`;
  }

  // ---- an event and the editor --------------------------------------------------------------------------------------
  function when(c, e) {
    const d = parse(e.date), day = fmt(c, d, {weekday: 'long', month: 'long', day: 'numeric'});
    if(e.noEnd&&!e.allDay)return `${day}\n${time(c,e.start)}`;
    return e.allDay ? day : `${day}\n${time(c, e.start)} – ${time(c, e.end)}`;
  }
  function info(c, e) {
    const t = T();
    return `<div class="mmcl mmcl-info"><div class="mmcl-head" style="background:${PEACOCK}"><div class="mmcl-hbar"><button type="button" class="mmcl-btn" data-action="mmcl-up"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button><i class="mmcl-flex"></i><button type="button" class="mmcl-btn" data-action="mmcl-delete" aria-label="${esc(c, t.t('edit_event_delete'))}"><img src="assets/gm-ic_delete_wht_24dp.png" alt=""></button></div><h1>${esc(c, e.title)}</h1></div>
      <button type="button" class="mmcl-efab" data-action="mmcl-edit" aria-label="${esc(c, t.t('edit_label'))}">${ic(V('ic_edit_white'))}</button>
      <div class="mmcl-page"><div class="mmcl-row">${ic(V('ic_date'))}<span>${esc(c, when(c, e))}</span></div>${e.where ? `<div class="mmcl-row">${ic(V('ic_location'))}<span>${esc(c, e.where)}</span></div>` : ''}${e.note ? `<div class="mmcl-row">${ic(V('ic_notes'))}<span>${esc(c, e.note)}</span></div>` : ''}<div class="mmcl-row">${ic(V('ic_calendar'))}<span>${esc(c, t.t('my_events'))}<small>${esc(c, MM.account.email)}</small></span></div></div></div>`;
  }
  function editor(c) {
    const t = T(), d = ui(c).draft;
    const date = s => esc(c, fmt(c, parse(s), {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}));
    return `<div class="mmcl mmcl-edit"><div class="mmcl-ehead" style="background:${PEACOCK}"><button type="button" class="mmcl-btn" data-action="mmcl-cancel"><img src="${A('ic_cancel_white')}" alt=""></button><i class="mmcl-flex"></i><button type="button" class="mmcl-save" data-action="mmcl-save">${esc(c, t.t('edit_event_save'))}</button></div>
      <div class="mmcl-etitle" style="background:${PEACOCK}"><input data-f="title" value="${esc(c, d.title)}" placeholder="${esc(c, t.t('edit_title_hint'))}" autocomplete="off"></div>
      <div class="mmcl-page"><div class="mmcl-seg">${ic(V('ic_date'))}<div class="mmcl-when"><label class="mmcl-allday"><span>${esc(c, t.t('edit_label_all_day'))}</span><button type="button" class="mmcl-sw" data-action="mmcl-allday" role="switch" aria-checked="${d.allDay}"><i class="mmw-switch${d.allDay ? ' on' : ''}"><i class="mmw-thumb"></i></i></button></label>
        <div class="mmcl-wrow"><input type="date" data-f="date" value="${d.date}"><span class="mmcl-wshow">${date(d.date)}</span>${d.allDay ? '' : `<span class="mmcl-tpick"><span>${esc(c, time(c, d.start))}</span><input type="time" data-f="start" value="${d.start}"></span>`}</div>
        ${d.allDay || d.noEnd ? '' : `<div class="mmcl-wrow"><span class="mmcl-wshow">${date(d.endDate || d.date)}</span><span class="mmcl-tpick"><span>${esc(c, time(c, d.end))}</span><input type="time" data-f="end" value="${d.end}"></span></div>`}<span class="mmcl-more">${esc(c, t.t('more_options'))}</span></div></div>
        <div class="mmcl-seg">${ic(V('ic_location'))}<input class="mmcl-sin" data-f="where" value="${esc(c, d.where)}" placeholder="${esc(c, t.t('edit_location_hint'))}"></div>
        <div class="mmcl-seg">${ic(V('ic_notes'))}<input class="mmcl-sin" data-f="note" value="${esc(c, d.note)}" placeholder="${esc(c, t.t('edit_description_hint'))}"></div></div></div>`;
  }
  function closeEditor(c, ask) {
    const u = ui(c), d = u.draft, t = T();
    const changed = JSON.stringify({...d, orig: 0}) !== d.orig;
    if (ask && changed) return c.dialog({message: t.t(d.id ? 'discard_dialog_body_existing_event' : 'discard_dialog_body_new_event'), buttons: [{label: t.t('discard_dialog_keep_editing')}, {label: t.t('discard_dialog_discard'), action: c => closeEditor(c, false)}]});
    u.screen = d.id ? `event:${d.id}` : ''; u.draft = null; c.render();
  }
  function startEdit(c, e) {
    const now = new Date(), h = (now.getHours() + 1) % 24;
    const d = e ? {...e} : {id: 0, title: '', date: iso(day0()), start: `${String(h).padStart(2, '0')}:00`, end: `${String((h + 1) % 24).padStart(2, '0')}:00`, allDay: false, where: '', note: ''};
    if(!e)MM.calendarPreferences.applyDuration(c,d);
    d.orig = JSON.stringify({...d, orig: 0});
    ui(c).draft = d; ui(c).screen = 'edit';
  }

  function render(c) {
    if (!c.data.calendarOobe) return oobe(c);
    const u = ui(c);
    if (u.screen === 'edit' && u.draft) return editor(c);
    if (u.screen.startsWith('event:')) { const e = events(c).find(x => x.id === +u.screen.slice(6)); if (e) return info(c, e); u.screen = ''; }
    if (u.search !== undefined && u.search !== null) return searchView(c);
    return main(c);
  }
  MM.register('calendar', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('calendar', c.ui.calendar?.screen),
    statusColor: () => '#000',
    render,
    mount(c, root) {
      const sched = root.querySelector('.mmcl-sched'), today = root.querySelector('#mmcl-today');
      if (sched && today && !ui(c).scrolled) { sched.scrollTop = Math.max(0, today.offsetTop - 120); ui(c).scrolled = true; }
      root.querySelectorAll('.mmcl-edit [data-f]').forEach(i => i.addEventListener('input', () => { const d=ui(c).draft;if(i.dataset.f==='date'&&d.endDate){const end=parse(d.endDate),days=Math.round((parse(i.value)-parse(d.date))/86400000);end.setDate(end.getDate()+days);d.endDate=iso(end);}d[i.dataset.f]=i.value; if (i.type === 'date' || i.type === 'time') c.render(); }));
      const u = ui(c), gs = root.querySelector('.mmcl-gscroll');
      if (gs) { gs.scrollTop = u.gridScroll ?? Math.max(0, (new Date().getHours() - 2) * HOUR * (gs.clientWidth / 360 || 1)); gs.addEventListener('scroll', () => { u.gridScroll = gs.scrollTop; }, {passive: true}); }
      // A horizontal swipe turns the period (the views) or the month (the mini month).
      const swipe = (el, turn) => { if (!el) return; let x0 = null, y0 = 0; el.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; }); el.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { u.swiped = Date.now(); turn(dx < 0 ? 1 : -1); } }); };
      swipe(root.querySelector('.mmcl-swipe'), dir => { const d = cur(c), v = u.view; u.date = iso(v === 'month' ? new Date(d.getFullYear(), d.getMonth() + dir, 1) : add(d, v === 'week' ? 7 * dir : dir)); c.render(); });
      swipe(root.querySelector('.mmcl-mswipe'), dir => { const m = u.pickerMonth ? parse(u.pickerMonth) : cur(c); u.pickerMonth = iso(new Date(m.getFullYear(), m.getMonth() + dir, 1)); c.render(); });
      const q = root.querySelector('.mmcl-q');
      if (q) { q.addEventListener('input', () => { const p = q.selectionStart; u.search = q.value; c.render(); const g = c.el.viewport.querySelector('.mmcl-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } }); if (document.activeElement !== q) setTimeout(() => q.focus(), 40); }
    },
    back(c) {
      const u = ui(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.picker) { u.picker = false; u.pickerMonth = ''; c.render(); return true; }
      if (u.screen === 'edit') { closeEditor(c, true); return true; }
      if (!u.screen && u.search !== undefined && u.search !== null) { u.search = null; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), e = records(c).find(x => x.id === +(el.dataset.id || u.screen.slice(6)));
      switch (name) {
        case 'mmcl-oobenext': u.oobe++; c.render(); return true;
        case 'mmcl-oobedone': c.data.calendarOobe = true; c.save(); c.render(); return true;
        case 'mmcl-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmcl-today': if ((u.view || 'schedule') !== 'schedule' || u.date) { u.date = ''; u.gridScroll = null; c.render(); return true; } { const s = c.el.viewport.querySelector('.mmcl-sched'), d = c.el.viewport.querySelector('#mmcl-today'); if (s && d) s.scrollTo({top: Math.max(0, d.offsetTop - 120), behavior: 'smooth'}); return true; }
        case 'mmcl-picker': u.picker = !u.picker; u.pickerMonth = ''; c.render(); return true;
        case 'mmcl-jump': if (Date.now() - (u.swiped || 0) < 300) return true; u.date = el.dataset.date; u.picker = false; u.pickerMonth = ''; u.gridScroll = null; if ((u.view || 'schedule') === 'schedule') u.view = 'day'; c.render(); return true;
        case 'mmcl-mday': if (Date.now() - (u.swiped || 0) < 300) return true; u.date = el.dataset.date; u.view = 'day'; c.render(); return true;
        case 'mmcl-slot': { if (Date.now() - (u.swiped || 0) < 300) return true; startEdit(c, null); const h = +el.dataset.h; Object.assign(u.draft, {date: el.dataset.date, start: `${String(h).padStart(2, '0')}:00`, end: `${String((h + 1) % 24).padStart(2, '0')}:00`}); MM.calendarPreferences.applyDuration(c,u.draft);u.draft.orig = JSON.stringify({...u.draft, orig: 0}); c.render(); return true; }
        case 'mmcl-schedview': case 'mmcl-dayview': case 'mmcl-weekview': case 'mmcl-monthview': u.view = {schedview: 'schedule', dayview: 'day', weekview: 'week', monthview: 'month'}[name.slice(5)]; u.drawer = false; u.gridScroll = null; c.render(); return true;
        case 'mmcl-settings': u.drawer = false; MM.openPrefs(c, 'calendar', 'calendar_settings_headers', t.t('drawer_settings')); return true;
        case 'mmcl-sback': u.search = null; c.render(); return true;
        case 'mmcl-sclear': u.search = ''; c.render(); return true;
        case 'mmcl-help': c.open('help', 'calendar'); return true;
        case 'mmcl-event': u.screen = `event:${e.id}`; c.render(); return true;
        case 'mmcl-up': u.screen = ''; c.render(); return true;
        case 'mmcl-new': startEdit(c, null); c.render(); return true;
        case 'mmcl-edit': startEdit(c, e); c.render(); return true;
        case 'mmcl-cancel': closeEditor(c, true); return true;
        case 'mmcl-allday': u.draft.allDay = !u.draft.allDay; c.render(); return true;
        case 'mmcl-save': {
          const d = u.draft, list = records(c); delete d.orig;
          if (!d.title.trim()) d.title = t.t('event');
          if (d.id) Object.assign(list.find(x => x.id === d.id), d); else { d.id = Math.max(0, ...list.map(x => x.id)) + 1; list.push(d); }
          c.save(); u.draft = null; u.screen = `event:${d.id}`; c.render(); return true;
        }
        case 'mmcl-delete': c.dialog({message: t.t('delete_this_event_title'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { c.data.events = records(c).filter(x => x !== e); c.save(); u.screen = ''; c.render(); }}]}); return true;
        case 'mm-menu': c.menu([{label: t.t('search'), action: c => { u.search = ''; c.render(); }}, {label: t.t('calendar_refresh'), action: c => c.render()}]); return true;
      }
      return false;
    }
  });
})();
