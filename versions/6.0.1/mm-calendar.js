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
     where (ic_location) and the note (ic_notes); leaving unsaved changes asks discard_dialog_body_*. */
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
  const events = c => c.data.events || (c.data.events = JSON.parse(JSON.stringify(MM.defaults.events)));
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
    const startDow = new Intl.Locale(c.locale()).weekInfo?.firstDay ?? (c.locale().startsWith('en') ? 7 : 1);
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
          out += `<div class="mmcl-day ${cls}" ${isToday ? 'id="mmcl-today"' : ''}><div class="mmcl-dhead"><small>${esc(c, fmt(c, day, {weekday: 'short'}))}</small><b>${day.getDate()}</b></div><div class="mmcl-chips">${list.map(e => `<button type="button" class="mmcl-chip${e.allDay ? '' : ' two'}" style="background:${PEACOCK}" data-action="mmcl-event" data-id="${e.id}"><b>${esc(c, e.title)}</b>${e.allDay ? '' : `<span>${esc(c, `${time(c, e.start)} – ${time(c, e.end)}`)}${e.where ? `, ${esc(c, e.where)}` : ''}</span>`}</button>`).join('') || `<span class="mmcl-none">${esc(c, t.t('no_events'))}</span>`}</div></div>`;
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
    const t = T(), u = ui(c);
    return `<div class="mmcl"><div class="mmcl-bar"><button type="button" class="mmcl-btn" data-action="mmcl-drawer">${ic(V('ic_menu'))}</button><button type="button" class="mmcl-month-title" data-action="mmcl-picker"><span>${esc(c, fmt(c, new Date(), {month: 'long'}))}</span><img src="${A('ic_arrow_down')}" alt=""></button><i class="mmcl-flex"></i>
      <button type="button" class="mmcl-btn" data-action="mmcl-today" aria-label="${esc(c, t.t('today'))}">${ic(V('ic_today'))}</button>${MM.menu.button(c, 'mmcl-over')}</div>
      <div class="mmcl-page mmcl-sched">${schedule(c)}</div><button type="button" class="mmcl-fab" data-action="mmcl-new" aria-label="${esc(c, t.t('event'))}"><img src="${A('btn_create')}" alt=""></button>${u.drawer ? drawer(c) : ''}</div>`;
  }
  function drawer(c) {
    const t = T();
    const item = (icon, key, action, on = false) => `<button type="button" class="mmcl-ditem${on ? ' on' : ''}" data-action="${action}">${ic(icon)}<span>${esc(c, t.t(key))}</span></button>`;
    const cal = (key, color) => `<div class="mmcl-dcal"><i style="background:${color}"></i><span>${esc(c, t.t(key))}</span></div>`;
    return `<div class="mmcl-scrim" data-action="mmcl-drawer"></div><div class="mmcl-drawer"><div class="mmcl-dlist">${item(V('ic_agenda'), 'agenda_view_label', 'mmcl-drawer', true)}${item(A('ic_hourview'), 'hourly_view_label', 'mmcl-dayview')}${item(V('ic_week'), 'week_view_label', 'mmcl-weekview')}${item(A('ic_monthview'), 'month_view_label', 'mmcl-monthview')}
      <i class="mmcl-ddiv"></i><div class="mmcl-dacct"><img src="assets/gm-avatar_placeholder.png" alt=""><span>${esc(c, MM.account.email)}</span></div>${cal('my_events', PEACOCK)}${cal('reminders_calendar_name', '#4285f4')}${cal('drawer_birthdays_text', '#9e69af')}${cal('drawer_holidays_text', '#0b8043')}
      <i class="mmcl-ddiv"></i>${item(V('ic_settings'), 'drawer_settings', 'mmcl-settings')}${item(V('ic_help'), 'drawer_help_feedback', 'mmcl-help')}</div></div>`;
  }

  // ---- an event and the editor --------------------------------------------------------------------------------------
  function when(c, e) {
    const d = parse(e.date), day = fmt(c, d, {weekday: 'long', month: 'long', day: 'numeric'});
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
        ${d.allDay ? '' : `<div class="mmcl-wrow"><span class="mmcl-wshow">${date(d.date)}</span><span class="mmcl-tpick"><span>${esc(c, time(c, d.end))}</span><input type="time" data-f="end" value="${d.end}"></span></div>`}<span class="mmcl-more">${esc(c, t.t('more_options'))}</span></div></div>
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
    d.orig = JSON.stringify({...d, orig: 0});
    ui(c).draft = d; ui(c).screen = 'edit';
  }

  function render(c) {
    if (!c.data.calendarOobe) return oobe(c);
    const u = ui(c);
    if (u.screen === 'edit' && u.draft) return editor(c);
    if (u.screen.startsWith('event:')) { const e = events(c).find(x => x.id === +u.screen.slice(6)); if (e) return info(c, e); u.screen = ''; }
    return main(c);
  }
  MM.register('calendar', {
    statusColor: () => '#000',
    render,
    mount(c, root) {
      const sched = root.querySelector('.mmcl-sched'), today = root.querySelector('#mmcl-today');
      if (sched && today && !ui(c).scrolled) { sched.scrollTop = Math.max(0, today.offsetTop - 120); ui(c).scrolled = true; }
      root.querySelectorAll('.mmcl-edit [data-f]').forEach(i => i.addEventListener('input', () => { ui(c).draft[i.dataset.f] = i.value; if (i.type === 'date' || i.type === 'time') c.render(); }));
    },
    back(c) {
      const u = ui(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.screen === 'edit') { closeEditor(c, true); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), e = events(c).find(x => x.id === +(el.dataset.id || u.screen.slice(6)));
      switch (name) {
        case 'mmcl-oobenext': u.oobe++; c.render(); return true;
        case 'mmcl-oobedone': c.data.calendarOobe = true; c.save(); c.render(); return true;
        case 'mmcl-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmcl-today': { const s = c.el.viewport.querySelector('.mmcl-sched'), d = c.el.viewport.querySelector('#mmcl-today'); if (s && d) s.scrollTo({top: Math.max(0, d.offsetTop - 120), behavior: 'smooth'}); return true; }
        case 'mmcl-picker': c.open('missing-calendar-month-picker'); return true;
        case 'mmcl-dayview': case 'mmcl-weekview': case 'mmcl-monthview': c.open(`missing-calendar-${name.slice(5)}`); return true;
        case 'mmcl-settings': c.open('missing-calendar-settings'); return true;
        case 'mmcl-help': c.open('missing-help'); return true;
        case 'mmcl-event': u.screen = `event:${e.id}`; c.render(); return true;
        case 'mmcl-up': u.screen = ''; c.render(); return true;
        case 'mmcl-new': startEdit(c, null); c.render(); return true;
        case 'mmcl-edit': startEdit(c, e); c.render(); return true;
        case 'mmcl-cancel': closeEditor(c, true); return true;
        case 'mmcl-allday': u.draft.allDay = !u.draft.allDay; c.render(); return true;
        case 'mmcl-save': {
          const d = u.draft, list = events(c); delete d.orig;
          if (!d.title.trim()) d.title = t.t('event');
          if (d.id) Object.assign(list.find(x => x.id === d.id), d); else { d.id = Math.max(0, ...list.map(x => x.id)) + 1; list.push(d); }
          c.save(); u.draft = null; u.screen = `event:${d.id}`; c.render(); return true;
        }
        case 'mmcl-delete': c.dialog({message: t.t('delete_this_event_title'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { c.data.events = events(c).filter(x => x !== e); c.save(); u.screen = ''; c.render(); }}]}); return true;
        case 'mm-menu': c.menu([{label: t.t('search'), action: c => c.open('missing-calendar-search')}, {label: t.t('calendar_refresh'), action: c => c.render()}]); return true;
      }
      return false;
    }
  });
})();
