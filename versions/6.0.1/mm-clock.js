/* Android 6.0.1 Clock (PrebuiltDeskClockGoogle 4.2.1, the AOSP DeskClock of MTC20K), the app 'clock'.
   - desk_clock.xml: the actionBarSize Toolbar holding a fixed TabLayout without its indicator (Alarm, Clock, Timer,
     Stopwatch: ic_tab_*_activated / _normal), the pager, and the footer (left button, the FloatingActionButton in the
     theme's accent #da4336 with 8 dp elevation, right button). The window background follows the hour
     (Utils.getCurrentHourColor's 24 colours, read from the app's code), the status bar #66000000 over it; Clock opens
     first.
   - Clock (main_clock_frame.xml, default_clock_style digital): the TextClock in big_thin (70 sp sans-serif-thin, the
     AM/PM of main_clock_12_hours_format at 16 sp), the date (abbrev_wday_month_day_no_year, 14 sp medium) and the next
     alarm (ic_alarm_small, 69 % white), the 1 dp #28ffffff hairline 24 dp under; the FAB (ic_language_white_24dp) opens
     the cities.
   - Alarm (alarm_clock.xml, alarm_time_collapsed / _expanded.xml): ClockDatabaseHelper's default alarms (8:30 on
     weekdays, 9:00 at weekends, both off, vibrate on); each row the 64 sp thin time with a 24 sp AM/PM, the switch, the
     label in clock_gray and the days in bold white, the expand arrow; expanded: Repeat with the day buttons, the
     ringtone (ic_ringtone, the default alarm sound Oxygen), Vibrate, the label and the delete button. Turning one on
     toasts alarm_set; the FAB (ic_add_white_24dp) opens the time picker for a new alarm.
   - Timer (TimerSetupView): "00h 00m 00s" in 56 sp thin, the dialpad (36 sp thin) and delete; start runs it down in the
     280 dp circle.
   - Stopwatch (stopwatch_fragment.xml): the 280 dp CircleButtonsLayout with CountingTimerView's time (hundredths
     smaller), the FAB start / pause (ic_start_white_24dp / ic_pause_white_24dp), reset (ic_reset_white_24dp) on the left
     while paused, lap (ic_lap_white_24dp) on the right while running, the laps below. */
(() => {
  'use strict';
  const T = () => MM.text('clock');
  const A = n => `assets/dc-${n}.png`;
  const HOUR_COLORS = ['#212121', '#20222a', '#202233', '#1f2242', '#1e224f', '#1d225c', '#1b236b', '#1a237e', '#1d2783', '#232e8b', '#283593', '#2c3998',
    '#303f9f', '#2c3998', '#283593', '#232e8b', '#1d2783', '#1a237e', '#1b236b', '#1d225c', '#1e224f', '#1f2242', '#202233', '#20222a'];
  const TABS = [['alarm', 'menu_alarm'], ['clock', 'menu_clock'], ['timer', 'menu_timer'], ['stopwatch', 'menu_stopwatch']];
  // ClockDatabaseHelper's two alarms, then the simulator's demo alarm of every version: 7:00 on weekdays, switched on.
  const S = c => c.data.clock || (c.data.clock = {alarms: [{id: 3, h: 7, m: 0, days: [1, 2, 3, 4, 5], on: true, vibrate: true, label: ''}, {id: 1, h: 8, m: 30, days: [1, 2, 3, 4, 5], on: false, vibrate: true, label: ''}, {id: 2, h: 9, m: 0, days: [6, 0], on: false, vibrate: true, label: ''}]});
  const ui = c => c.ui.clock || (c.ui.clock = {tab: 'clock', expanded: null, timerDigits: '', sw: {start: 0, acc: 0, running: false, laps: []}, timer: null});
  const h24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;

  // The time as TextTime / TextClock show it: "h:mm" with a smaller AM / PM, or "kk:mm".
  function timeHtml(c, h, m, ampmClass) {
    if (h24(c)) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const parts = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: true}).formatToParts(new Date(2000, 0, 1, h, m));
    const day = parts.find(p => p.type === 'dayPeriod')?.value || '';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}<span class="${ampmClass}">${c.safe(day)}</span>`;
  }
  // DaysOfWeek.toString: every day, or the short names from the week's first day.
  function daysText(c, days) {
    if (days.length === 7) return T().t('every_day');
    // The locale's first day of the week (DaysOfWeek follows the calendar's), Monday where it cannot be read.
    const first = (() => { try { const l = new Intl.Locale(c.locale()), w = l.getWeekInfo?.() || l.weekInfo; return Number.isInteger(w?.firstDay) ? w.firstDay % 7 : 1; } catch { return 1; } })();
    const order = [0, 1, 2, 3, 4, 5, 6].map(i => (i + first) % 7).filter(d => days.includes(d));
    const fmt = new Intl.DateTimeFormat(c.locale(), {weekday: 'short'});
    return order.map(d => fmt.format(new Date(2017, 0, 1 + d))).join(', ');
  }
  // The next time an alarm rings, and the alarm_set toast's text (days, hours, minutes from now).
  function nextFire(a, from = new Date()) {
    for (let i = 0; i < 8; i++) {
      const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, a.h, a.m);
      if (d > from && (!a.days.length || a.days.includes(d.getDay()))) return d;
    }
    return null;
  }
  function setToast(c, a) {
    const t = T(), at = nextFire(a); if (!at) return;
    let mins = Math.ceil((at - Date.now()) / 60000);
    const days = Math.floor(mins / 1440); mins -= days * 1440; const hours = Math.floor(mins / 60); mins -= hours * 60;
    const idx = (days ? 1 : 0) | (hours ? 2 : 0) | (mins ? 4 : 0);
    const s = (key, n) => n ? t.plural(key, n, null, n) : '';
    c.toast(AndroidStrings.format(t.t('alarm_set')[idx], s('days', days), s('hours', hours), s('minutes', mins)), true);
  }
  function nextAlarm(c) {
    const list = S(c).alarms.filter(a => a.on).map(a => nextFire(a)).filter(Boolean).sort((x, y) => x - y);
    if (!list.length) return '';
    return new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(list[0]);
  }

  // -- the pages -----------------------------------------------------------------------------------------------------
  // The world clock: the cities picked in CitiesActivity (mm-cities.js, DeskClock's cities.xml) two to a row
  // (world_clock_list_item.xml): world_clock_label's city name and the time there in world_clock_12_hours_format.
  const cityRow = id => (MM.deskClockCities || []).find(r => r[0] === id);
  const LANG_COL = {en: 2, hu: 3, de: 4, fr: 5, es: 6};
  const cityName = (c, r) => String(r[LANG_COL[c.lang] ?? 2] || r[2]).split('=').pop();
  const zoneTime = (c, tz, opts = {}) => { try { return new Intl.DateTimeFormat(c.locale(), {timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: !h24(c), ...opts}).format(new Date()); } catch { return ''; } };
  function worldClocks(c) {
    const rows = (S(c).cities || []).map(cityRow).filter(Boolean);
    if (!rows.length) return '';
    const cell = r => `<div class="mmck-wc"><span class="mmck-wcname">${c.safe(cityName(c, r))}</span><span class="mmck-wctime">${c.safe(zoneTime(c, r[1]))}</span></div>`;
    const out = [];
    for (let i = 0; i < rows.length; i += 2) out.push(`<div class="mmck-wcrow">${cell(rows[i])}${rows[i + 1] ? cell(rows[i + 1]) : '<div class="mmck-wc"></div>'}</div>`);
    return `<div class="mmck-world">${out.join('')}</div>`;
  }
  function clockPage(c) {
    const now = new Date(), next = nextAlarm(c);
    const date = new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'long', day: 'numeric'}).format(now);
    return `<div class="mmck-clock"><div class="mmck-big">${timeHtml(c, now.getHours(), now.getMinutes(), 'mmck-ampm')}</div>
      <div class="mmck-labels"><span class="mmck-date">${c.safe(date)}</span>${next ? `<span class="mmck-next"><img src="${A('ic_alarm_small')}" alt="">${c.safe(next)}</span>` : ''}</div><i class="mmck-hair"></i>${worldClocks(c)}</div>`;
  }
  function alarmPage(c) {
    const t = T(), u = ui(c), list = S(c).alarms;
    if (!list.length) return `<div class="mmck-empty"><img src="${A('ic_noalarms')}" alt=""><span>${c.safe(t.t('no_alarms'))}</span></div>`;
    return `<div class="mmck-alarms">${list.map(a => {
      const open = u.expanded === a.id;
      const head = `<div class="mmck-sum"><button type="button" class="mmck-time" data-action="mmck-time" data-id="${a.id}">${timeHtml(c, a.h, a.m, 'mmck-aampm')}</button><i></i><button type="button" class="mmck-switch" data-action="mmck-onoff" data-id="${a.id}"><i class="mmw-switch${a.on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button></div>`;
      if (!open) return `<div class="mmck-alarm" data-action="mmck-expand" data-id="${a.id}">${head}<div class="mmck-line"><span class="mmck-label">${c.safe(a.label)}</span><span class="mmck-days">${c.safe(a.days.length ? daysText(c, a.days) : '')}</span><img src="${A('ic_expand_down')}" alt=""></div><i class="mmck-hair"></i></div>`;
      const fmt = new Intl.DateTimeFormat(c.locale(), {weekday: 'narrow'});
      const dayBtns = [1, 2, 3, 4, 5, 6, 0].map(d => `<button type="button" class="mmck-day${a.days.includes(d) ? ' on' : ''}" data-action="mmck-day" data-id="${a.id}" data-d="${d}">${c.safe(fmt.format(new Date(2017, 0, 1 + d)))}</button>`).join('');
      return `<div class="mmck-alarm open">${head}
        <label class="mmck-check"><input type="checkbox" data-action="mmck-repeat" data-id="${a.id}"${a.days.length ? ' checked' : ''}><i></i><span>${c.safe(t.t('alarm_repeat'))}</span></label>
        ${a.days.length ? `<div class="mmck-dayrow">${dayBtns}</div>` : ''}
        <div class="mmck-opts"><span class="mmck-ring"><img src="${A('ic_ringtone')}" alt="">${c.safe(MM.settingsRingtones?.alarm?.default || 'Oxygen')}</span><label class="mmck-check"><input type="checkbox" data-action="mmck-vibrate" data-id="${a.id}"${a.vibrate ? ' checked' : ''}><i></i><span>${c.safe(t.t('alarm_vibrate'))}</span></label></div>
        <button type="button" class="mmck-labelbtn" data-action="mmck-label" data-id="${a.id}"><img src="${A('ic_label_normal')}" alt="">${a.label ? c.safe(a.label) : `<span>${c.safe(t.t('label'))}</span>`}</button><i class="mmck-hair"></i>
        <div class="mmck-foot"><button type="button" class="mmck-del" data-action="mmck-delete" data-id="${a.id}"><img src="${A('ic_delete_small')}" alt="">${c.safe(t.t('delete'))}</button><button type="button" class="mmck-collapse" data-action="mmck-expand" data-id="${a.id}"><img src="${A('ic_expand_down')}" alt=""></button></div></div>`;
    }).join('')}</div>`;
  }
  const pad2 = n => String(n).padStart(2, '0');
  function timerPage(c) {
    const t = T(), u = ui(c);
    if (u.timer) {
      const left = Math.max(0, u.timer.end ? u.timer.end - Date.now() : u.timer.left), total = u.timer.total;
      const s = Math.ceil(left / 1000), text = s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${Math.floor(s / 60)}:${pad2(s % 60)}`;
      return `<div class="mmck-circlewrap"><div class="mmck-circle" style="--p:${(1 - left / total).toFixed(4)}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="mmck-ctime">${c.safe(text)}</span></div></div>`;
    }
    const d = u.timerDigits.padStart(6, '0');
    const unit = k => `<small>${c.safe(t.t(k))}</small>`;
    const keys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '']];
    return `<div class="mmck-setup"><div class="mmck-digits${u.timerDigits ? ' set' : ''}">${d.slice(0, 2)}${unit('hours_label')} ${d.slice(2, 4)}${unit('minutes_label')} ${d.slice(4)}${unit('seconds_label')}<button type="button" class="mmck-back" data-action="mmck-tdel"><img src="${A(u.timerDigits ? 'ic_backspace_normal' : 'ic_backspace_disabled')}" alt=""></button></div>
      <div class="mmck-pad">${keys.map(r => `<div>${r.map(k => k ? `<button type="button" data-action="mmck-tkey" data-k="${k}">${k}</button>` : '<i></i>').join('')}</div>`).join('')}</div></div>`;
  }
  function swElapsed(u) { const s = u.sw; return s.acc + (s.running ? Date.now() - s.start : 0); }
  function swText(ms) {
    const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return `${h ? `${h}:${pad2(m)}` : pad2(m)}:${pad2(s)}<small>.${pad2(cs)}</small>`;
  }
  function stopwatchPage(c) {
    const u = ui(c), ms = swElapsed(u), lap = u.sw.laps.length ? ms - u.sw.laps.reduce((a, b) => a + b, 0) : ms;
    const p = u.sw.laps.length ? Math.min(1, lap / u.sw.laps[0]) : (ms % 60000) / 60000;
    return `<div class="mmck-circlewrap"><div class="mmck-circle" style="--p:${p.toFixed(4)}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="mmck-ctime sw">${swText(ms)}</span></div></div>
      <div class="mmck-laps">${u.sw.laps.map((l, i, all) => `<div><span>#${all.length - i}</span><span>${swText(l)}</span><span>${swText(all.slice(i).reduce((a, b) => a + b, 0))}</span></div>`).join('')}</div>`;
  }

  function footer(c) {
    const u = ui(c);
    const fab = icon => `<button type="button" class="mmck-fab" data-action="mmck-fab"><img src="${A(icon)}" alt=""></button>`;
    const side = (action, icon) => action ? `<button type="button" class="mmck-side" data-action="${action}"><img src="${A(icon)}" alt=""></button>` : '';
    if (u.tab === 'clock') return `<div class="mmck-footer"><span></span>${fab('ic_language_white_24dp')}<span></span></div>`;
    if (u.tab === 'alarm') return `<div class="mmck-footer"><span></span>${fab('ic_add_white_24dp')}<span></span></div>`;
    if (u.tab === 'timer') {
      if (!u.timer) return `<div class="mmck-footer"><span></span>${u.timerDigits ? fab('ic_start_white_24dp') : '<i class="mmck-fabspace"></i>'}<span></span></div>`;
      return `<div class="mmck-footer">${side('mmck-treset', 'ic_reset_white_24dp')}${fab(u.timer.end ? 'ic_pause_white_24dp' : 'ic_start_white_24dp')}${side('mmck-tadd', 'ic_add_timer')}</div>`;
    }
    const s = u.sw;
    return `<div class="mmck-footer"><span>${!s.running && s.acc ? side('mmck-swreset', 'ic_reset_white_24dp') : ''}</span>${fab(s.running ? 'ic_pause_white_24dp' : 'ic_start_white_24dp')}<span>${s.running ? side('mmck-swlap', 'ic_lap_white_24dp') : s.acc ? side('mmck-swshare', 'ic_share') : ''}</span></div>`;
  }

  function render(c) {
    const t = T(), u = ui(c), color = HOUR_COLORS[new Date().getHours()];
    const page = {alarm: alarmPage, clock: clockPage, timer: timerPage, stopwatch: stopwatchPage}[u.tab](c);
    return `<div class="mmck" style="background:${color}"><div class="mmck-tabs">${TABS.map(([id, label]) => `<button type="button" data-action="mmck-tab" data-tab="${id}" aria-label="${c.safe(t.t(label))}"><img src="${A(`ic_tab_${id}_${u.tab === id ? 'activated' : 'normal'}`)}" alt=""></button>`).join('')}${MM.menu.button(c)}</div>
      <div class="mmck-page mmck-p-${u.tab}">${page}</div>${footer(c)}</div>`;
  }

  // The running stopwatch and timer and the minute redraw the page.
  let ticker = 0;
  function tickLoop(c) {
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (c.ui.view !== 'clock' || c.ui.overlay) return;
      const u = ui(c), root = c.el.viewport;
      if (u.tab === 'stopwatch' && u.sw.running) { const el = root.querySelector('.mmck-ctime'); if (el) el.innerHTML = swText(swElapsed(u)); const circ = root.querySelector('.mmck-circle'); const lap = u.sw.laps.length ? swElapsed(u) - u.sw.laps.reduce((a, b) => a + b, 0) : swElapsed(u); circ?.style.setProperty('--p', (u.sw.laps.length ? Math.min(1, lap / u.sw.laps[0]) : (swElapsed(u) % 60000) / 60000).toFixed(4)); }
      else if (u.tab === 'timer' && u.timer?.end) { if (Date.now() >= u.timer.end) { u.timer = null; c.toast(T().t('timer_reset'), false); } c.render(); }
    }, 50);
  }

  // The clock widgets (mm-widgets.js) show the same time format and next alarm.
  MM.clock24 = h24; MM.clockNextAlarm = nextAlarm;
  MM.register('clock', {
    statusColor: c => HOUR_COLORS[new Date().getHours()],
    render,
    mount(c) { tickLoop(c); },
    tick(c, now) { if (c.ui.view === 'clock' && (ui(c).tab === 'clock' || ui(c).tab === 'alarm') && now.getSeconds() === 0) c.render(); },
    back(c) { const u = ui(c); if (u.expanded) { u.expanded = null; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const t = T(), u = ui(c), s = S(c), a = s.alarms.find(x => x.id === +el.dataset.id);
      const save = () => { c.save(); c.render(); };
      switch (name) {
        case 'mmck-tab': u.tab = el.dataset.tab; c.render(); return true;
        case 'mmck-expand': if (event?.target?.closest('.mmck-switch,.mmck-time')) return false; u.expanded = u.expanded === a.id ? null : a.id; c.render(); return true;
        case 'mmck-onoff': a.on = !a.on; save(); if (a.on) setToast(c, a); MM.system?.changed(c); return true;
        case 'mmck-time': MM.timePicker?.(c, a.h, a.m, (h, m) => { a.h = h; a.m = m; a.on = true; save(); setToast(c, a); }); return true;
        case 'mmck-day': { const d = +el.dataset.d; a.days = a.days.includes(d) ? a.days.filter(x => x !== d) : [...a.days, d]; save(); return true; }
        case 'mmck-repeat': a.days = a.days.length ? [] : [0, 1, 2, 3, 4, 5, 6]; save(); return true;
        case 'mmck-vibrate': a.vibrate = !a.vibrate; save(); return true;
        case 'mmck-label': c.dialog({title: t.t('label'), html: `<div class="mmst-edit"><input type="text" class="mmst-input mmck-labelin" value="${c.safe(a.label)}"></div>`, buttons: [{label: t.t('time_picker_cancel')}, {label: 'OK', action: c => { a.label = c.ui.clockLabel ?? a.label; save(); }}],
          mount(c, win) { const i = win.querySelector('.mmck-labelin'); c.ui.clockLabel = a.label; i.addEventListener('input', () => { c.ui.clockLabel = i.value; }); setTimeout(() => i.focus(), 50); }}); return true;
        case 'mmck-delete': s.alarms = s.alarms.filter(x => x !== a); u.expanded = null; save(); c.toast(t.t('alarm_deleted'), false); return true;
        case 'mmck-tkey': if (u.timerDigits.length < 6 && !(u.timerDigits === '' && el.dataset.k === '0')) u.timerDigits += el.dataset.k; c.render(); return true;
        case 'mmck-tdel': u.timerDigits = u.timerDigits.slice(0, -1); c.render(); return true;
        case 'mmck-treset': u.timer = null; c.render(); return true;
        case 'mmck-tadd': u.timer = null; u.timerDigits = ''; c.render(); return true;
        case 'mmck-swreset': u.sw = {start: 0, acc: 0, running: false, laps: []}; c.render(); return true;
        case 'mmck-swlap': { const total = swElapsed(u), done = u.sw.laps.reduce((x, y) => x + y, 0); u.sw.laps.unshift(total - done); c.render(); return true; }
        case 'mmck-swshare': {
          // StopwatchFragment.doShare: Stopwatches.getShareTitle (a random sw_share_strings line) and buildShareResults.
          const plain = ms => swText(ms).replace(/<\/?small>/g, ''), lines = t.t('sw_share_strings');
          const laps = u.sw.laps.length ? `${t.t('sw_share_laps')}\n${[...u.sw.laps].reverse().map((l, i) => `#${i + 1}  ${plain(l)}`).join('\n')}\n` : '';
          MM.share(c, {title: t.t('sw_share_button'), subject: lines[Math.floor(Math.random() * lines.length)], text: `${AndroidStrings.format(t.t('sw_share_main'), plain(swElapsed(u)))}\n${laps}`});
          return true;
        }
        case 'mm-menu': c.menu([{label: t.t('menu_item_settings'), action: c => MM.openPrefs(c, 'clock', 'settings')}, {label: t.t('menu_item_help'), action: c => c.open('help', 'clock')}]); return true;
        case 'mmck-fab':
          if (u.tab === 'clock') { c.open('clock-cities'); return true; }
          if (u.tab === 'alarm') {
            MM.timePicker?.(c, new Date().getHours(), new Date().getMinutes(), (h, m) => { const id = Math.max(0, ...s.alarms.map(x => x.id)) + 1; const n = {id, h, m, days: [], on: true, vibrate: true, label: ''}; s.alarms.push(n); s.alarms.sort((x, y) => x.h * 60 + x.m - (y.h * 60 + y.m)); u.expanded = id; save(); setToast(c, n); });
            return true;
          }
          if (u.tab === 'timer') {
            if (!u.timer) { const d = u.timerDigits.padStart(6, '0'); const ms = ((+d.slice(0, 2)) * 3600 + (+d.slice(2, 4)) * 60 + (+d.slice(4))) * 1000; if (!ms) return true; u.timer = {total: ms, left: ms, end: Date.now() + ms}; u.timerDigits = ''; }
            else if (u.timer.end) { u.timer.left = u.timer.end - Date.now(); u.timer.end = 0; }
            else u.timer.end = Date.now() + u.timer.left;
            c.render(); return true;
          }
          if (u.sw.running) { u.sw.acc += Date.now() - u.sw.start; u.sw.running = false; } else { u.sw.start = Date.now(); u.sw.running = true; }
          c.render(); return true;
      }
      return false;
    }
  });
  /* CitiesActivity (cities_activity.xml over the clock's background): the action bar with "Cities", search and the
     overflow's Sort by time / Sort by name; city_list_header.xml's Selected Cities, then every city of cities.xml in
     city_list_item.xml (56 dp: the 74 dp index column with the first letter of a new letter (cities_names' "X=" sort key)
     or nothing, the check box, the name, the time there). A check adds the city to the world clock. */
  MM.register('clock-cities', {
    app: false,
    statusColor: () => HOUR_COLORS[new Date().getHours()],
    render(c) {
      const t = T(), u = c.ui.clockCities || (c.ui.clockCities = {q: '', byTime: false, search: false}), picked = S(c).cities || [];
      const all = (MM.deskClockCities || []).map(r => ({r, id: r[0], name: cityName(c, r), key: String(r[LANG_COL[c.lang] ?? 2]).split('=')[0] || cityName(c, r).charAt(0).toUpperCase(), tz: r[1]}));
      const q = u.q.trim().toLowerCase();
      const offset = tz => { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-]\d+)(?::(\d+))?/.exec(p); return m ? (+m[1]) * 60 + Math.sign(+m[1] || 1) * (+(m[2] || 0)) : 0; } catch { return 0; } };
      const col = new Intl.Collator(c.locale());
      let list = all.filter(x => !q || x.name.toLowerCase().includes(q));
      list.sort((a, b) => u.byTime ? offset(a.tz) - offset(b.tz) || col.compare(a.name, b.name) : col.compare(a.key + a.name, b.key + b.name));
      const row = (x, index) => `<button type="button" class="mmck-city" data-action="mmck-city" data-id="${x.id}"><span class="mmck-cindex">${c.safe(index)}</span><i class="mmst-check${picked.includes(x.id) ? ' on' : ''}"></i><span class="mmck-cname">${c.safe(x.name)}</span><span class="mmck-ctimes">${c.safe(zoneTime(c, x.tz))}</span></button>`;
      let last = '';
      const rows = list.map(x => { const k = u.byTime ? '' : x.key; const show = k !== last ? k : ''; last = k; return row(x, show); }).join('');
      const sel = all.filter(x => picked.includes(x.id) && !q);
      const bar = u.search ? `<div class="mmck-cbar"><button type="button" class="mmck-cbtn" data-action="mmck-csearchoff"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><input class="mmck-cq" value="${c.safe(u.q)}" placeholder="${c.safe(t.t('abc_search_hint'))}" autocomplete="off"></div>`
        : `<div class="mmck-cbar"><button type="button" class="mmck-cbtn" data-action="mmck-cup"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${c.safe(t.t('cities_activity_title'))}</span><button type="button" class="mmck-cbtn" data-action="mmck-csearch" aria-label="${c.safe(t.t('abc_searchview_description_search'))}"><img src="assets/fw-ic_search_api_material.svg" alt=""></button>${MM.menu.button(c)}</div>`;
      return `<div class="mmck mmck-cities" style="background:${HOUR_COLORS[new Date().getHours()]}">${bar}<div class="mmck-clist">${sel.length ? `<div class="mmck-chead">${c.safe(t.t('selected_cities_label'))}</div>${sel.map(x => row(x, '')).join('')}<div class="mmck-chead"></div>` : ''}${rows}</div></div>`;
    },
    mount(c, root) {
      const f = root.querySelector('.mmck-cq'); if (!f) return;
      f.addEventListener('input', () => { const pos = f.selectionStart; c.ui.clockCities.q = f.value; c.render(); const g = c.el.viewport.querySelector('.mmck-cq'); if (g) { g.focus(); g.setSelectionRange(pos, pos); } });
      if (document.activeElement !== f) setTimeout(() => f.focus(), 30);
    },
    back(c) { const u = c.ui.clockCities; if (u?.search) { u.search = false; u.q = ''; c.render(); return true; } c.ui.clockCities = null; return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.clockCities, s = S(c);
      if (name === 'mmck-cup') { c.ui.clockCities = null; c.back(); return true; }
      if (name === 'mmck-csearch') { u.search = true; c.render(); return true; }
      if (name === 'mmck-csearchoff') { u.search = false; u.q = ''; c.render(); return true; }
      if (name === 'mmck-city') { const id = el.dataset.id, list = s.cities || []; s.cities = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; c.save(); c.render(); return true; }
      if (name === 'mm-menu') { c.menu([{label: t.t(u.byTime ? 'menu_item_sort_by_name' : 'menu_item_sort_by_gmt_offset'), action: c => { u.byTime = !u.byTime; c.render(); }}]); return true; }
      return false;
    }
  });

  /* Clock's settings (SettingsActivity, settings.xml) through mm-appprefs.js: Style, Automatic home clock, Home time zone
     (the phone's zone by default), Change Date & time (Settings' Date & time), Silence after (auto_silence_summary or
     Never), Snooze length and Gradually increase volume (their NumberPicker dialogs: 1–30 minutes, Off / 5–60
     seconds), Alarm volume (Settings' Sound & notification), Volume buttons, Start week on, Timer ringtone (Timer
     Expired by default, the alarm sounds to pick from). */
  const P = () => MM.text('appprefs'), D = 'PrebuiltDeskClockGoogle/';
  const localZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return 'Europe/London'; } };
  MM.appPrefsHooks.clock = {
    get(c, key) {
      if (key === 'home_time_zone') { const v = MM.appPref(c, 'clock', key); if (v) return v; const n = MM.appPrefsXml.clock.xml.settings.c[0].c[2]; const vals = MM.appPrefArr(n.entryValues); const z = localZone(); return vals.includes(z) ? z : vals.find(x => zoneTime(c, x, {timeZoneName: 'short'}).split(' ').pop() === zoneTime(c, z, {timeZoneName: 'short'}).split(' ').pop()) || vals[0]; }
      return undefined;
    },
    summary(c, key) {
      const p = P(), v = MM.appPref(c, 'clock', key);
      if (key === 'auto_silence') { const n = +(v ?? 10); return n < 0 ? p.t(D + 'auto_silence_never') : p.plural(D + 'auto_silence_summary', n); }
      if (key === 'snooze_duration') return p.plural(D + 'snooze_duration', +(v ?? 10));
      if (key === 'alarm_crescendo_duration' || key === 'timer_crescendo_duration') { const n = +(v ?? 0); return n ? p.fmt(D + 'crescendo_duration', null, n) : p.t(D + 'no_crescendo_duration'); }
      if (key === 'timer_ringtone') return v === '' ? p.t(D + 'silent_timer_ringtone_title') : v && v !== 'default' ? v : p.t(D + 'default_timer_ringtone_title');
      return undefined;
    },
    click(c, key, n) {
      const p = P(), set = v => { (c.data.appPrefs.clock ||= {})[key] = v; c.save(); c.render(); };
      if (key === 'date_time') { c.open('settings', 'xml:date_time_prefs'); return true; }
      if (key === 'volume_setting') { c.open('settings', 'sound'); return true; }
      if (key === 'snooze_duration') { MM.numberDialog(c, {title: MM.appPrefStr(n.title), values: Array.from({length: 30}, (_, i) => i + 1), value: +(MM.appPref(c, 'clock', key) ?? 10), label: x => p.plural(D + 'snooze_duration', x), onSet: (c, v) => set(v)}); return true; }
      if (key === 'alarm_crescendo_duration' || key === 'timer_crescendo_duration') { MM.numberDialog(c, {title: MM.appPrefStr(n.title), values: Array.from({length: 13}, (_, i) => i * 5), value: +(MM.appPref(c, 'clock', key) ?? 0), label: x => x ? p.fmt(D + 'crescendo_duration', null, x) : p.t(D + 'no_crescendo_duration'), onSet: (c, v) => set(v)}); return true; }
      if (key === 'timer_ringtone') { MM.ringtonePicker?.(c, {kind: 'alarm', current: MM.appPref(c, 'clock', key) ?? 'default', defaultTitle: p.t(D + 'default_timer_ringtone_title'), onPick: (c, v) => set(v)}); return true; }
      return false;
    }
  };
})();
