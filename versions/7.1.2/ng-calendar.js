/* Android 7.1.2 Calendar (Google Calendar 5.7, app/CalendarGooglePrebuilt of N2G48C), the app 'calendar', on the
   phone's demo Google account (NG.account). The logic is 6.0.1's (its calendar module); the events are the simulator's
   own sample data (docs/demo-data.md); the look is the image's:
   - First run (oobe_page.xml): four pages from oobe_headers / oobe_main_texts / oobe_disclaimers with the
     oobe_resources pictures (icon, richness, quickcreate, smartmail) over the texts, 40 dp in, the page indicator and
     GOT IT on the last (oobe_done_button.xml: 200 × 50 dp, done_button in accent_blue #4285f4, 14 sp white caps, 28 dp
     from the bottom).
   - all_in_one.xml (CalendarTheme.AllInOneActivity: the white action bar, colorAccent #4285f4, the status bar black):
     action_bar_custom_view_all_in_one.xml's month (20 sp #333333) with ic_arrow_down, Today (ic_today) and the
     overflow. The drawer (300 dp): drawer_logo_lockup.xml (56 dp: googlelogo_standard_color_74x24 16 dp in, "Calendar"
     22 dp #767676 8 dp after, ic_settings at the end), drawer_list_item.xml rows (TextAppearance.Tile.ListItem: 14 sp
     bold, the icon 32 dp before the text, 12 dp above and below) for Schedule, Day, Week, Month; the account
     (drawer_group_header_item.xml: 56 dp, the 40 dp avatar, 14 sp #757575 at 72 dp) and its calendars
     (drawer_calendar_item.xml: 48 dp, the 24 dp colour box 16 dp in, 14 sp bold #333333 at 72 dp); Help & feedback.
   - The Schedule view: each month opens with its picture (bkg_01_jan … bkg_12_dec under month_header_filter_color)
     and its name; each week its header; a day with events (and today) the day header (weekday, day number; past grey,
     today accent_blue) and its chips (2 dp corners, the event's colour, Peacock #039be5 for the account's calendar,
     Reminders #4285f4) on #fafafa.
   - The create button (speed_dial_frame.xml: a FloatingActionButton in google_red #db4437 with quantum_ic_add_white_24,
     rotating as it opens): the speed dial over speed_dial_fade_color (#f2f2f2 at 90 %): Goal and Reminder
     (speed_dial_*_view.xml: the 52 dp mini buttons fab_small_blue with quantum_ic_flag / quantum_ic_reminders_alt, 18 dp
     from the end, their titles 14 sp bold #757575 on a white label) and Event over the main button. Event and Reminder
     open the editor; Goal opens the goal wizard (ng-calendar-goals.js).
   - An event (event_info.xml): event_info_headline.xml's 96 dp headline in the event's colour (the title 24 dp white,
     72 dp in, 18 dp from the bottom), the When, Where, note and calendar segments (24 dp icons 16 dp in, 72 dp text),
     edit (ic_edit_white) and delete. The editor (edit_fragment.xml): the header in the event's colour with
     ic_cancel_white and SAVE over the title (Enter title / Remind me to…), All-day, the start and end, the place and
     the note; unsaved changes ask discard_dialog_body_*.
   - Day, Week, Month (the drawer's views) and the title's mini month; search from the overflow. */
(() => {
  'use strict';
  const T = () => NG.text('calendar');
  const A = n => `assets/ca-${n}.png`;
  const PEACOCK = '#039be5', REMINDER = '#4285f4';
  const MONTHS = ['01_jan', '02_feb', '03_mar', '04_apr', '05_may', '06_jun', '07_jul', '08_aug', '09_sep', '10_oct', '11_nov', '12_dec'];
  const day0 = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nextDow = (dow, base = day0()) => { const d = new Date(base); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7)); return d; };
  NG.defaults.events = (() => {
    const today = day0(), plus = n => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };
    return [{id: 1, title: 'Coffee with Alex', date: iso(today), start: '11:00', end: '12:00', allDay: false, where: '', note: ''},
      {id: 2, title: 'Sunday lunch at Mom’s', date: iso(nextDow(0)), start: '12:30', end: '14:00', allDay: false, where: '', note: 'Bring dessert'},
      {id: 3, title: 'Hike with Alex', date: iso(nextDow(6)), start: '08:00', end: '13:00', allDay: false, where: 'Ridge trail', note: ''},
      {id: 4, title: 'Meetup slides due', date: iso(plus(9)), allDay: true, where: '', note: ''}];
  })();
  const records = c => c.data.events || (c.data.events = JSON.parse(JSON.stringify(NG.defaults.events)));
  const events = c => NG.calendarPreferences.visible(c,records(c));
  NG.calendarEvents = events;
  NG.calendarWidgetOpen = (c, target) => { const u=ui(c);c.data.calendarOobe=true;Object.assign(u,{screen:target.id?'event:'+target.id:'',drawer:false,search:null,dial:false,picker:false,gridScroll:null});if(target.date){u.date=target.date;u.view='day';}else if(!target.id){u.date='';u.view='schedule';}c.save();c.open('calendar'); };
  const ui = c => c.ui.calendar || (c.ui.calendar = {screen: '', drawer: false, oobe: 0, draft: null, dial: false});
  const esc = (c, s) => c.safe(s);
  const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const fmt = (c, d, o) => new Intl.DateTimeFormat(c.locale(), o).format(d);
  const time = (c, hm) => { const [h, m] = hm.split(':').map(Number); return fmt(c, new Date(2000, 0, 1, h, m), {hour: 'numeric', minute: '2-digit'}); };
  const ic = (src, cls = '') => `<img class="ngcl-ic ${cls}" src="${src}" alt="">`;
  const colorOf = e => e.task ? REMINDER : PEACOCK;
  const acct = () => NG.account || {name: '', email: ''};

  // ---- first run --------------------------------------------------------------------------------------------------
  function oobe(c) {
    const t = T(), u = ui(c), i = u.oobe, imgs = ['icon', 'richness', 'quickcreate', 'smartmail'];
    const disc = t.t('oobe_disclaimers')[i];
    return `<div class="ngcl ngcl-oobe"><div class="ngcl-oimg${i ? '' : ' logo'}"><img src="${A(imgs[i])}" alt=""></div><div class="ngcl-otext"><h1>${esc(c, t.t('oobe_headers')[i])}</h1><p>${esc(c, t.t('oobe_main_texts')[i])}</p>${disc ? `<small>${esc(c, disc)}</small>` : ''}</div>
      <div class="ngcl-obar"><span class="ngcl-dots">${imgs.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</span>${i === 3 ? `<button type="button" class="ngcl-done" data-action="ngcl-oobedone">${esc(c, t.t('oobe_done'))}</button>` : `<button type="button" class="ngcl-onext" data-action="ngcl-oobenext" aria-label="next"></button>`}</div></div>`;
  }

  // ---- the Schedule view --------------------------------------------------------------------------------------------
  const firstDow = c => NG.calendarPreferences.firstDay(c);
  const chip = (c, e, cls = '') => `<button type="button" class="ngcl-chip${e.allDay ? '' : ' two'} ${cls}" style="background:${colorOf(e)}" data-action="ngcl-event" data-id="${e.id}"><b>${e.goal ? '<i class="ngcl-goalflag"></i>' : ''}${esc(c, e.title)}</b>${e.allDay ? '' : `<span>${esc(c, e.task || e.noEnd ? time(c, e.start) : `${time(c, e.start)} – ${time(c, e.end)}`)}${e.where ? `, ${esc(c, e.where)}` : ''}</span>`}</button>`;
  function schedule(c) {
    const t = T(), today = day0(), byDay = new Map();
    for (const e of events(c)) { if (!byDay.has(e.date)) byDay.set(e.date, []); byDay.get(e.date).push(e); }
    for (const l of byDay.values()) l.sort((a, b) => (a.allDay ? -1 : b.allDay ? 1 : a.start.localeCompare(b.start)));
    const first = new Date(today.getFullYear(), today.getMonth(), 1), last = new Date(today.getFullYear(), today.getMonth() + 3, 0);
    let out = '', month = -1;
    const d = new Date(first); d.setDate(d.getDate() - ((d.getDay() - firstDow(c) + 7) % 7));
    while (d <= last) {
      const weekStart = new Date(d), weekEnd = new Date(d); weekEnd.setDate(weekEnd.getDate() + 6);
      for (let k = 0; k < 7; k++) {
        const day = new Date(weekStart); day.setDate(day.getDate() + k);
        if (day.getDate() === 1 && day >= first && day <= last && day.getMonth() !== month) {
          month = day.getMonth();
          out += `<div class="ngcl-month" style="background-image:url('assets/ca-bkg_${MONTHS[month]}.jpg')"><i></i><span>${esc(c, fmt(c, day, {month: 'long', ...(day.getFullYear() !== today.getFullYear() ? {year: 'numeric'} : {})}))}</span></div>`;
        }
      }
      const same = weekStart.getMonth() === weekEnd.getMonth();
      out += `<div class="ngcl-week">${esc(c, same ? `${fmt(c, weekStart, {month: 'short', day: 'numeric'})} – ${weekEnd.getDate()}` : `${fmt(c, weekStart, {month: 'short', day: 'numeric'})} – ${fmt(c, weekEnd, {month: 'short', day: 'numeric'})}`)}</div>`;
      for (let k = 0; k < 7; k++) {
        const day = new Date(weekStart); day.setDate(day.getDate() + k);
        const l = byDay.get(iso(day)) || [], isToday = +day === +today;
        if ((l.length || isToday) && day >= first && day <= last) {
          out += `<div class="ngcl-day ${isToday ? 'today' : day < today ? 'past' : ''}" ${isToday ? 'id="ngcl-today"' : ''}><div class="ngcl-dhead"><small>${esc(c, fmt(c, day, {weekday: 'short'}))}</small><b>${day.getDate()}</b></div><div class="ngcl-chips">${l.map(e => chip(c, e)).join('') || `<span class="ngcl-none">${esc(c, t.t('no_events'))}</span>`}</div></div>`;
        }
      }
      d.setDate(d.getDate() + 7);
    }
    return out;
  }
  // The create button and its speed dial.
  function fab(c) {
    const t = T(), u = ui(c);
    const dial = u.dial ? `<div class="ngcl-fade" data-action="ngcl-dial"></div><div class="ngcl-dial">
      <button type="button" class="ngcl-dsmall" data-action="ngcl-goal" aria-label="${esc(c, t.t('accessibility_speeddial_groove'))}"><span>${esc(c, t.t('groove'))}</span><i>${ic(A('quantum_ic_flag_white_24'))}</i></button>
      <button type="button" class="ngcl-dsmall" data-action="ngcl-newtask" aria-label="${esc(c, t.t('accessibility_speeddial_reminder'))}"><span>${esc(c, t.t('reminder'))}</span><i>${ic(A('quantum_ic_reminders_alt_white_24'))}</i></button>
      <span class="ngcl-dlabel">${esc(c, t.t('event'))}</span></div>` : '';
    return `${dial}<button type="button" class="ngcl-fab${u.dial ? ' open' : ''}" data-action="${u.dial ? 'ngcl-new' : 'ngcl-dial'}" aria-label="${esc(c, t.t(u.dial ? 'accessibility_speeddial_event' : 'event'))}">${ic(A('quantum_ic_add_white_24'))}</button>`;
  }
  function main(c) {
    const t = T(), u = ui(c), view = u.view || 'schedule', d = cur(c);
    const body = view === 'day' ? grid(c, [d]) : view === 'week' ? grid(c, Array.from({length: 7}, (_, i) => add(weekStart(c, d), i))) : view === 'month' ? `<div class="ngcl-mview ngcl-swipe">${monthGrid(c, d, false)}</div>` : '';
    const title = fmt(c, view === 'schedule' && !u.date ? new Date() : d, {month: 'long', ...(d.getFullYear() !== new Date().getFullYear() ? {year: 'numeric'} : {})});
    const picker = u.picker ? `<div class="ngcl-mini ngcl-mswipe">${monthGrid(c, u.pickerMonth ? parse(u.pickerMonth) : d, true)}</div>` : '';
    return `<div class="ngcl"><div class="ngcl-bar"><button type="button" class="ngcl-btn" data-action="ngcl-drawer">${ic(A('ic_menu'))}</button><button type="button" class="ngcl-mtitle${u.picker ? ' open' : ''}" data-action="ngcl-picker"><span>${esc(c, u.picker && u.pickerMonth ? fmt(c, parse(u.pickerMonth), {month: 'long'}) : title)}</span><img src="${A('ic_arrow_down')}" alt=""></button><i class="ngcl-flex"></i>
      <button type="button" class="ngcl-btn" data-action="ngcl-today" aria-label="${esc(c, t.t('today'))}">${ic(A('ic_today'))}</button>${NG.menu.button(c, 'ngcl-over', true)}</div>
      ${picker}${body ? `<div class="ngcl-page ngcl-views">${body}</div>` : `<div class="ngcl-page ngcl-sched">${schedule(c)}</div>`}${fab(c)}${u.drawer ? drawer(c) : ''}</div>`;
  }
  function drawer(c) {
    const t = T(), view = ui(c).view || 'schedule';
    const item = (icon, key, action, on = false) => `<button type="button" class="ngcl-ditem${on ? ' on' : ''}" data-action="${action}">${ic(A(icon))}<span>${esc(c, t.t(key))}</span></button>`;
    const cal = (key, color) => `<div class="ngcl-dcal"><i style="background:${color}"></i><span>${esc(c, t.t(key))}</span></div>`;
    return `<div class="ngcl-scrim" data-action="ngcl-drawer"></div><div class="ngcl-drawer"><div class="ngcl-lockup"><img src="${A('googlelogo_standard_color_74x24')}" alt="Google"><span>${esc(c, t.t('drawer_logo_lockup_second'))}</span><i class="ngcl-flex"></i><button type="button" class="ngcl-btn" data-action="ngcl-settings" aria-label="${esc(c, t.t('drawer_settings'))}">${ic(A('ic_settings'))}</button></div>
      <i class="ngcl-ddiv"></i><div class="ngcl-dlist">${item('ic_agenda', 'agenda_view_label', 'ngcl-schedview', view === 'schedule')}${item('ic_hourview', 'hourly_view_label', 'ngcl-dayview', view === 'day')}${item('ic_week', 'week_view_label', 'ngcl-weekview', view === 'week')}${item('ic_monthview', 'month_view_label', 'ngcl-monthview', view === 'month')}
      <i class="ngcl-ddiv"></i><div class="ngcl-dacct"><img src="assets/gm-avatar_placeholder.png" alt=""><span>${esc(c, acct().email)}</span></div>${cal('my_events', PEACOCK)}${cal('reminders_calendar_name', REMINDER)}${cal('drawer_birthdays_text', '#9e69af')}${cal('drawer_holidays_text', '#0b8043')}
      <i class="ngcl-ddiv"></i>${item('ic_help', 'drawer_help_feedback', 'ngcl-help')}</div></div>`;
  }

  // ---- Day, Week, Month, the mini month, search ---------------------------------------------------------------------
  const HOUR = 48;
  const cur = c => { const u = ui(c); return u.date ? parse(u.date) : day0(); };
  const add = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const weekStart = (c, d) => add(d, -((d.getDay() - firstDow(c) + 7) % 7));
  const minutes = hm => { const [h, m] = hm.split(':').map(Number); return h * 60 + m; };
  const dayEvents = (c, d) => events(c).filter(e => e.date === iso(d));
  function grid(c, days) {
    const today = day0(), now = new Date(), multi = days.length > 1;
    const heads = days.map(d => `<div class="ngcl-gday${+d === +today ? ' today' : ''}"><small>${esc(c, fmt(c, d, {weekday: 'short'}))}</small><b>${d.getDate()}</b></div>`).join('');
    const allDay = days.map(d => `<div class="ngcl-gall">${dayEvents(c, d).filter(e => e.allDay).map(e => `<button type="button" class="ngcl-gchip" data-action="ngcl-event" data-id="${e.id}" style="background:${colorOf(e)}">${esc(c, e.title)}</button>`).join('')}</div>`).join('');
    const hours = Array.from({length: 24}, (_, h) => `<div class="ngcl-ghour"><span>${h ? esc(c, fmt(c, new Date(2000, 0, 1, h), {hour: 'numeric'})) : ''}</span></div>`).join('');
    const cols = days.map(d => {
      const blocks = dayEvents(c, d).filter(e => !e.allDay).map(e => { const s = minutes(e.start), en = Math.max(s + 30, minutes(e.end || e.start)); return `<button type="button" class="ngcl-gev" data-action="ngcl-event" data-id="${e.id}" style="top:calc(${s / 60 * HOUR} * var(--dp));height:calc(${(en - s) / 60 * HOUR - 2} * var(--dp));background:${colorOf(e)}"><b>${esc(c, e.title)}</b>${multi ? '' : `<small>${esc(c, e.noEnd ? time(c,e.start) : `${time(c, e.start)} – ${time(c, e.end)}`)}${e.where ? `, ${esc(c, e.where)}` : ''}</small>`}</button>`; }).join('');
      const line = +d === +today ? `<i class="ngcl-now" style="top:calc(${(now.getHours() * 60 + now.getMinutes()) / 60 * HOUR} * var(--dp))"></i>` : '';
      return `<div class="ngcl-gcol">${Array.from({length: 24}, (_, h) => `<button type="button" class="ngcl-gslot" data-action="ngcl-slot" data-date="${iso(d)}" data-h="${h}"></button>`).join('')}${blocks}${line}</div>`;
    }).join('');
    return `<div class="ngcl-grid${multi ? ' week' : ''}"><div class="ngcl-ghead"><i class="ngcl-gcorner"></i>${heads}</div><div class="ngcl-gallrow"><i class="ngcl-gcorner"></i>${allDay}</div>
      <div class="ngcl-gscroll ngcl-swipe"><div class="ngcl-gbody"><div class="ngcl-ghours">${hours}</div>${cols}</div></div></div>`;
  }
  function monthGrid(c, d, mini) {
    const weekNumbers = !mini && NG.calendarPreferences.prefs(c).weekNumbers;
    const today = day0(), first = new Date(d.getFullYear(), d.getMonth(), 1), start = weekStart(c, first);
    const initials = Array.from({length: 7}, (_, i) => `<i>${esc(c, fmt(c, add(start, i), {weekday: 'narrow'}))}</i>`).join('');
    let cells = '';
    for (let i = 0; i < 42; i++) {
      const x = add(start, i), out = x.getMonth() !== d.getMonth();
      if (i >= 35 && out && x > first) break;
      const evs = mini ? [] : dayEvents(c, x);
      if(weekNumbers&&i%7===0)cells+=`<i class="ngcl-weeknum">${NG.calendarPreferences.week(x)}</i>`;
      cells += `<button type="button" class="ngcl-mcell${out ? ' out' : ''}${+x === +today ? ' today' : ''}" data-action="${mini ? 'ngcl-jump' : 'ngcl-mday'}" data-date="${iso(x)}"><b>${x.getDate()}</b>${!mini&&NG.calendarPreferences.prefs(c).alternate?`<em>${esc(c,NG.calendarPreferences.alt(c,x))}</em>`:''}${evs.slice(0, 3).map(e => `<span style="background:${colorOf(e)}">${esc(c, e.title)}</span>`).join('')}</button>`;
    }
    return `<div class="ngcl-mgrid${weekNumbers?' weeks':''}${mini ? ' mini' : ''}"><div class="ngcl-mdow">${weekNumbers?'<i></i>':''}${initials}</div><div class="ngcl-mcells">${cells}</div></div>`;
  }
  function searchView(c) {
    const t = T(), u = ui(c), q = (u.search || '').trim().toLowerCase();
    const hits = q ? events(c).filter(e => [e.title, e.where, e.note].some(x => (x || '').toLowerCase().includes(q))).sort((a, b) => a.date.localeCompare(b.date) || (a.start || '').localeCompare(b.start || '')) : [];
    const rows = hits.map(e => { const d = parse(e.date); return `<div class="ngcl-day"><div class="ngcl-dhead"><small>${esc(c, fmt(c, d, {weekday: 'short'}))}</small><b>${d.getDate()}</b></div><div class="ngcl-chips">${chip(c, e)}</div></div>`; }).join('');
    return `<div class="ngcl"><div class="ngcl-bar"><button type="button" class="ngcl-btn" data-action="ngcl-sback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><input class="ngcl-q" value="${esc(c, u.search || '')}" placeholder="${esc(c, t.t('search'))}" autocomplete="off">${u.search ? `<button type="button" class="ngcl-btn" data-action="ngcl-sclear" aria-label="${esc(c, t.t('accessibility_clear_search'))}"><img src="assets/gm-abc_ic_clear_material.svg" alt=""></button>` : ''}</div>
      <div class="ngcl-page ngcl-sched">${rows || (q ? `<div class="ngcl-none pad">${esc(c, t.t('no_results_found'))}</div>` : '')}</div></div>`;
  }

  // ---- an event and the editor --------------------------------------------------------------------------------------
  function when(c, e) {
    const day = fmt(c, parse(e.date), {weekday: 'long', month: 'long', day: 'numeric'});
    if(e.noEnd&&!e.allDay)return `${day}\n${time(c,e.start)}`;
    return e.allDay ? day : e.task ? `${day}\n${time(c, e.start)}` : `${day}\n${time(c, e.start)} – ${time(c, e.end)}`;
  }
  function info(c, e) {
    const t = T(), color = colorOf(e);
    return `<div class="ngcl ngcl-info"><div class="ngcl-head" style="background:${color}"><div class="ngcl-hbar"><button type="button" class="ngcl-btn" data-action="ngcl-up"><img src="assets/gm-ic_arrow_back_wht_24dp.svg" alt=""></button><i class="ngcl-flex"></i><button type="button" class="ngcl-btn" data-action="ngcl-delete" aria-label="${esc(c, t.t('edit_event_delete'))}"><img src="assets/gm-ic_delete_wht_24dp.svg" alt=""></button></div><h1>${esc(c, e.title)}</h1></div>
      ${e.goal ? '' : `<button type="button" class="ngcl-efab" style="background:${color}" data-action="ngcl-edit" aria-label="${esc(c, t.t('edit_label'))}">${ic(A('ic_edit_white'))}</button>`}
      <div class="ngcl-page ngcl-ibody"><div class="ngcl-row">${ic(A('ic_date'))}<span>${esc(c, when(c, e))}</span></div>${e.goal ? NG.calendarGoals?.sessionInfo(c, e) || '' : ''}${e.where ? `<div class="ngcl-row">${ic(A('ic_location'))}<span>${esc(c, e.where)}</span></div>` : ''}${e.note ? `<div class="ngcl-row">${ic(A('ic_notes'))}<span>${esc(c, e.note)}</span></div>` : ''}<div class="ngcl-row">${ic(A('ic_calendar'))}<span>${esc(c, t.t(e.task ? 'reminders_calendar_name' : 'my_events'))}<small>${esc(c, acct().email)}</small></span></div></div>${e.goal ? NG.calendarGoals?.commandBar(c, e) || '' : ''}</div>`;
  }
  function editor(c) {
    const t = T(), d = ui(c).draft, color = colorOf(d);
    const date = s => esc(c, fmt(c, parse(s), {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}));
    return `<div class="ngcl ngcl-edit"><div class="ngcl-ehead" style="background:${color}"><button type="button" class="ngcl-btn" data-action="ngcl-cancel">${ic(A('ic_cancel_white'))}</button><i class="ngcl-flex"></i><button type="button" class="ngcl-save" data-action="ngcl-save">${esc(c, t.t('edit_event_save'))}</button></div>
      <div class="ngcl-etitle" style="background:${color}"><input data-f="title" value="${esc(c, d.title)}" placeholder="${esc(c, t.t(d.task ? 'edit_title_task_suggest_hint' : 'edit_title_hint'))}" autocomplete="off"></div>
      <div class="ngcl-page"><div class="ngcl-seg">${ic(A('ic_date'))}<div class="ngcl-when"><label class="ngcl-allday"><span>${esc(c, t.t('edit_label_all_day'))}</span><button type="button" class="ngcl-sw" data-action="ngcl-allday" role="switch" aria-checked="${d.allDay}"><i class="ngw-switch${d.allDay ? ' on' : ''}"><i class="ngw-thumb"></i></i></button></label>
        <div class="ngcl-wrow"><span class="ngcl-dpick"><span>${date(d.date)}</span><input type="date" data-f="date" value="${d.date}"></span>${d.allDay ? '' : `<span class="ngcl-tpick"><span>${esc(c, time(c, d.start))}</span><input type="time" data-f="start" value="${d.start}"></span>`}</div>
        ${d.allDay || d.task || d.noEnd ? '' : `<div class="ngcl-wrow"><span class="ngcl-wshow">${date(d.endDate || d.date)}</span><span class="ngcl-tpick"><span>${esc(c, time(c, d.end))}</span><input type="time" data-f="end" value="${d.end}"></span></div>`}</div></div>
        ${d.task ? '' : `<div class="ngcl-seg">${ic(A('ic_location'))}<input class="ngcl-sin" data-f="where" value="${esc(c, d.where)}" placeholder="${esc(c, t.t('edit_location_hint'))}"></div>
        <div class="ngcl-seg">${ic(A('ic_notes'))}<input class="ngcl-sin" data-f="note" value="${esc(c, d.note)}" placeholder="${esc(c, t.t('edit_description_hint'))}"></div>`}</div></div>`;
  }
  function closeEditor(c, ask) {
    const u = ui(c), d = u.draft, t = T();
    const changed = JSON.stringify({...d, orig: 0}) !== d.orig;
    const kind = d.task ? 'task' : 'event';
    if (ask && changed) return c.dialog({message: t.t(d.id ? `discard_dialog_body_existing_${kind}` : `discard_dialog_body_new_${kind}`), buttons: [{label: t.t('discard_dialog_keep_editing')}, {label: t.t('discard_dialog_discard'), action: c => closeEditor(c, false)}]});
    u.screen = d.id ? `event:${d.id}` : ''; u.draft = null; c.render();
  }
  function startEdit(c, e, task = false) {
    const h = (new Date().getHours() + 1) % 24;
    const d = e ? {...e} : {id: 0, title: '', date: iso(day0()), start: `${String(h).padStart(2, '0')}:00`, end: `${String((h + 1) % 24).padStart(2, '0')}:00`, allDay: false, where: '', note: '', ...(task ? {task: true} : {})};
    if(!e && !task)NG.calendarPreferences.applyDuration(c,d);
    d.orig = JSON.stringify({...d, orig: 0});
    ui(c).draft = d; ui(c).screen = 'edit'; ui(c).dial = false;
  }

  function render(c) {
    if(c.ui.sub==='shortcut:event'||c.ui.sub==='shortcut:reminder'){const task=c.ui.sub==='shortcut:reminder';c.ui.sub='';c.data.calendarOobe=true;startEdit(c,null,task);c.save();}
    if (!c.data.calendarOobe) return oobe(c);
    const u = ui(c);
    if (u.screen === 'edit' && u.draft) return editor(c);
    if (u.screen.startsWith('event:')) { const e = events(c).find(x => x.id === +u.screen.slice(6)); if (e) return info(c, e); u.screen = ''; }
    if (u.search !== undefined && u.search !== null) return searchView(c);
    // GroovePostCreationBottomSheet after a goal was made (ng-calendar-goals.js).
    const sheetEvent = u.goalSheet && events(c).find(x => x.id === u.goalSheet);
    return main(c) + (sheetEvent ? NG.calendarGoals?.sheet(c, sheetEvent) || '' : '');
  }
  NG.register('calendar', {
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('calendar', c.ui.calendar?.screen),
    statusColor: () => '#000',
    dialogAccent: () => '#4285f4',
    render,
    mount(c, root) {
      const u = ui(c), sched = root.querySelector('.ngcl-sched'), today = root.querySelector('#ngcl-today');
      if (sched && today && !u.scrolled) { sched.scrollTop = Math.max(0, today.offsetTop - 120); u.scrolled = true; }
      root.querySelectorAll('.ngcl-edit [data-f]').forEach(i => i.addEventListener('input', () => { const d=u.draft;if(i.dataset.f==='date'&&d.endDate){const end=parse(d.endDate),days=Math.round((parse(i.value)-parse(d.date))/86400000);end.setDate(end.getDate()+days);d.endDate=iso(end);}d[i.dataset.f]=i.value; if (i.type === 'date' || i.type === 'time') c.render(); }));
      const gs = root.querySelector('.ngcl-gscroll');
      if (gs) { gs.scrollTop = u.gridScroll ?? Math.max(0, (new Date().getHours() - 2) * HOUR * (c.el.screen.clientWidth / 411.43)); gs.addEventListener('scroll', () => { u.gridScroll = gs.scrollTop; }, {passive: true}); }
      // A horizontal swipe turns the period (the views) or the month (the mini month).
      const swipe = (el, turn) => { if (!el) return; let x0 = null, y0 = 0; el.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; }); el.addEventListener('pointerup', e => { if (x0 === null) return; const dx = e.clientX - x0, dy = e.clientY - y0; x0 = null; if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { u.swiped = Date.now(); turn(dx < 0 ? 1 : -1); } }); };
      swipe(root.querySelector('.ngcl-swipe'), dir => { const d = cur(c), v = u.view; u.date = iso(v === 'month' ? new Date(d.getFullYear(), d.getMonth() + dir, 1) : add(d, v === 'week' ? 7 * dir : dir)); c.render(); });
      swipe(root.querySelector('.ngcl-mswipe'), dir => { const m = u.pickerMonth ? parse(u.pickerMonth) : cur(c); u.pickerMonth = iso(new Date(m.getFullYear(), m.getMonth() + dir, 1)); c.render(); });
      const q = root.querySelector('.ngcl-q');
      if (q) { q.addEventListener('input', () => { const p = q.selectionStart; u.search = q.value; c.render(); const g = c.el.viewport.querySelector('.ngcl-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } }); if (document.activeElement !== q) setTimeout(() => q.focus(), 40); }
    },
    back(c) {
      const u = ui(c);
      if (u.dial) { u.dial = false; c.render(); return true; }
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
        case 'ngcl-oobenext': u.oobe++; c.render(); return true;
        case 'ngcl-oobedone': c.data.calendarOobe = true; c.save(); c.render(); return true;
        case 'ngcl-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'ngcl-dial': u.dial = !u.dial; c.render(); return true;
        case 'ngcl-goal': u.dial = false; c.ui.goal = null; c.open('calendar-goal'); return true;
        case 'ngcg-sheet-ok': u.goalSheet = null; c.render(); return true;
        case 'ngcg-sheet-adjust': u.goalSheet = null; u.screen = `event:${el.dataset.id}`; c.render(); return true;
        case 'ngcg-did': case 'ngcg-later': case 'ngcg-undone': return !!NG.calendarGoals?.sessionAction(c, name, el);
        case 'ngcl-newtask': startEdit(c, null, true); c.render(); return true;
        case 'ngcl-today': if ((u.view || 'schedule') !== 'schedule' || u.date) { u.date = ''; u.gridScroll = null; c.render(); return true; } { const s = c.el.viewport.querySelector('.ngcl-sched'), d = c.el.viewport.querySelector('#ngcl-today'); if (s && d) s.scrollTo({top: Math.max(0, d.offsetTop - 120), behavior: 'smooth'}); return true; }
        case 'ngcl-picker': u.picker = !u.picker; u.pickerMonth = ''; c.render(); return true;
        case 'ngcl-jump': if (Date.now() - (u.swiped || 0) < 300) return true; u.date = el.dataset.date; u.picker = false; u.pickerMonth = ''; u.gridScroll = null; if ((u.view || 'schedule') === 'schedule') u.view = 'day'; c.render(); return true;
        case 'ngcl-mday': if (Date.now() - (u.swiped || 0) < 300) return true; u.date = el.dataset.date; u.view = 'day'; c.render(); return true;
        case 'ngcl-slot': { if (Date.now() - (u.swiped || 0) < 300) return true; startEdit(c, null); const h = +el.dataset.h; Object.assign(u.draft, {date: el.dataset.date, start: `${String(h).padStart(2, '0')}:00`, end: `${String((h + 1) % 24).padStart(2, '0')}:00`}); NG.calendarPreferences.applyDuration(c,u.draft);u.draft.orig = JSON.stringify({...u.draft, orig: 0}); c.render(); return true; }
        case 'ngcl-schedview': case 'ngcl-dayview': case 'ngcl-weekview': case 'ngcl-monthview': u.view = {schedview: 'schedule', dayview: 'day', weekview: 'week', monthview: 'month'}[name.slice(5)]; u.drawer = false; u.gridScroll = null; c.render(); return true;
        case 'ngcl-settings': u.drawer = false; NG.openPrefs?.(c, 'calendar', 'calendar_settings_headers', t.t('drawer_settings')); return true;
        case 'ngcl-sback': u.search = null; c.render(); return true;
        case 'ngcl-sclear': u.search = ''; c.render(); return true;
        case 'ngcl-help': c.open('help', 'calendar'); return true;
        case 'ngcl-event': u.screen = `event:${e.id}`; c.render(); return true;
        case 'ngcl-up': u.screen = ''; c.render(); return true;
        case 'ngcl-new': startEdit(c, null); c.render(); return true;
        case 'ngcl-edit': startEdit(c, e); c.render(); return true;
        case 'ngcl-cancel': closeEditor(c, true); return true;
        case 'ngcl-allday': u.draft.allDay = !u.draft.allDay; c.render(); return true;
        case 'ngcl-save': {
          const d = u.draft, list = records(c); delete d.orig;
          if (!d.title.trim()) d.title = t.t(d.task ? 'reminder' : 'event');
          if (d.id) Object.assign(list.find(x => x.id === d.id), d); else { d.id = Math.max(0, ...list.map(x => x.id)) + 1; list.push(d); }
          c.save(); u.draft = null; u.screen = `event:${d.id}`; c.render(); return true;
        }
        case 'ngcl-delete': c.dialog({message: t.t(e.task ? 'delete_this_reminder_title' : 'delete_this_event_title'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { c.data.events = records(c).filter(x => x !== e); c.save(); u.screen = ''; c.render(); }}]}); return true;
        case 'ng-menu': c.menu([{label: t.t('search'), action: c => { u.search = ''; c.render(); }}, {label: t.t('calendar_refresh'), action: c => c.render()}], el); return true;
      }
      return false;
    }
  });
})();
