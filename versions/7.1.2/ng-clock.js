/* Android 7.1.2 Clock (PrebuiltDeskClockGoogle 4.6.1 of N2G48C), the app 'clock'. The logic is 6.0.1's (its clock:
   the alarms, the world clock, the timer and the stopwatch); the APK's layouts and resources decide the look:
   - desk_clock.xml: the actionBarSize Toolbar holding a fixed TabLayout without an indicator (ic_tab_alarm_static,
     _clock_, _timer_, _stopwatch_static, 20 dp of tab padding; the selected one white, the others dimmed), the pager,
     the footer: the left ImageButton, the 56 dp FloatingActionButton in color_accent #da4336 (8 dp elevation), the right
     ImageButton. The window behind follows the hour (Utils.BACKGROUND_SPECTRUM's 24 colours), the status bar #66000000
     over it; Clock opens first.
   - Clock (main_clock_frame.xml, 4 % gutters): the TextClock 64 sp sans-serif-thin white, date_and_next_alarm_time.xml
     (the date and the next alarm in 12 sp caps, PrimaryLabelTextAppearance white sans-serif-medium, between them the
     clock font's "A" alarm glyph at 20 sp), the 1 dp #28ffffff hairline 24 dp under; then world_clock_item.xml per city
     (the city in 14 sp white medium, the day difference in 63 % white, the time 56 sp thin at the end); the FAB
     (ic_public) opens CitySelectionActivity.
   - Alarm (alarm_clock.xml, alarm_time_collapsed / _expanded): the default alarms (8:30 on weekdays, 9:00 at weekends,
     off) and the simulator's 7:00 alarm; alarm_time_summary's 48 sp thin time and the SwitchCompat in the accent; the
     collapsed row's label (clock_gray #b3ffffff) and days (bold white) with ic_expand_more; expanded: Repeat and the
     day_button circles, the ringtone (ic_ringtone), Vibrate, the label (hint Label, 44 dp in), ic_delete_small and the
     collapse arrow. Turning one on toasts alarm_set; the FAB (ic_add_white_24dp) sets a new one in the time picker.
     No alarms: no_alarms 16 sp in 63 % white.
   - Timer (time_setup_view.xml: "00h 00m 00s", the digits 56 sp thin, the labels 16 sp, ic_backspace, the 1 dp
     #28ffffff line, three_keys_view rows of the 36 sp thin dialpad); start runs it in the circle; +1 min (ic_plusone)
     while it runs; reset (ic_reset_white_24dp) at the left.
   - Stopwatch (stopwatch_fragment.xml: the circle 60 % of the width, CountingTimerView's time with the hundredths
     smaller; lap_view rows: #n in 63 % white, the lap and the total in white medium); the FAB starts / pauses, reset
     (ic_reset) at the left while paused, lap (ic_lap) at the right while running, share while paused.
   - The overflow: Night mode (the Clock tab's dimmed screen), Settings, Help; on the Clock tab Settings and Help.
   - SettingsActivity (settings.xml): Style, Automatic home clock, Home time zone, Change date & time; Silence after,
     Snooze length, Alarm volume, Gradually increase volume, Volume buttons, Start week on; Timer ringtone, Gradually
     increase volume, Timer vibrate. */
(() => {
  'use strict';
  const T = () => NG.text('clock');
  const A = n => `assets/dc-${n}`;
  const HOUR_COLORS = ['#212121', '#20222a', '#202233', '#1f2242', '#1e224f', '#1d225c', '#1b236b', '#1a237e', '#1d2783', '#232e8b', '#283593', '#2c3998',
    '#303f9f', '#2c3998', '#283593', '#232e8b', '#1d2783', '#1a237e', '#1b236b', '#1d225c', '#1e224f', '#1f2242', '#202233', '#20222a'];
  const TABS = [['alarm', 'menu_alarm'], ['clock', 'menu_clock'], ['timer', 'menu_timer'], ['stopwatch', 'menu_stopwatch']];
  const S = c => c.data.clock || (c.data.clock = JSON.parse(JSON.stringify(NG.defaults.clock)));
  const ui = c => c.ui.clock || (c.ui.clock = {tab: 'clock', expanded: null, timerDigits: '', sw: {start: 0, acc: 0, running: false, laps: []}, timer: null, night: false});
  const h24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const prefs = c => S(c).prefs || (S(c).prefs = {});
  const mask = (file, cls = '') => { const src = file.startsWith('fw-') ? `assets/${file}` : A(file); return `<i class="ngck-ic${cls}" style="-webkit-mask-image:url('${src}');mask-image:url('${src}')"></i>`; };

  // TextTime / TextClock: "h:mm" with a smaller AM / PM, or "kk:mm".
  function timeHtml(c, h, m, ampmClass) {
    if (h24(c)) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const parts = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: true}).formatToParts(new Date(2000, 0, 1, h, m));
    const day = parts.find(p => p.type === 'dayPeriod')?.value || '';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')}<span class="${ampmClass}">${c.safe(day)}</span>`;
  }
  // The first day of the week: Start week on, else the locale's.
  const firstDay = c => { const p = prefs(c).week_start; if (p != null && p !== '') return +p; try { const l = new Intl.Locale(c.locale()), w = l.getWeekInfo?.() || l.weekInfo; return Number.isInteger(w?.firstDay) ? w.firstDay % 7 : 1; } catch { return 1; } };
  function daysText(c, days) {
    if (days.length === 7) return T().t('every_day');
    const first = firstDay(c), order = [0, 1, 2, 3, 4, 5, 6].map(i => (i + first) % 7).filter(d => days.includes(d));
    const fmt = new Intl.DateTimeFormat(c.locale(), {weekday: 'short'});
    return order.map(d => fmt.format(new Date(2017, 0, 1 + d))).join(', ');
  }
  const nextFire = NG.clock.nextFire;
  function setToast(c, a) {
    const t = T(), at = nextFire(a); if (!at) return;
    let mins = Math.ceil((at - Date.now()) / 60000);
    const days = Math.floor(mins / 1440); mins -= days * 1440; const hours = Math.floor(mins / 60); mins -= hours * 60;
    const idx = (days ? 1 : 0) | (hours ? 2 : 0) | (mins ? 4 : 0);
    const s = (key, n) => n ? t.plural(key, n, null, n) : '';
    c.toast(AndroidStrings.format(t.t('alarm_set')[idx], s('days', days), s('hours', hours), s('minutes', mins)), true);
  }
  function nextAlarm(c) {
    const at = NG.clock.nextAlarm(c);
    return at ? new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(at) : '';
  }

  // -- the pages -----------------------------------------------------------------------------------------------------
  const cityRow = id => (NG.deskClockCities || []).find(r => r[0] === id);
  const LANG_COL = {en: 2, hu: 3, de: 4, fr: 5, es: 6};
  const cityName = (c, r) => r[0] === 'home' ? r[2] : String(r[LANG_COL[c.lang] ?? 2] || r[2]).split('=').pop();
  const zoneTime = (c, tz, opts = {}) => { try { return new Intl.DateTimeFormat(c.locale(), {timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: !h24(c), ...opts}).format(new Date(NG.deviceEpoch(c))); } catch { return ''; } };
  const zoneDay = tz => { try { const p = new Intl.DateTimeFormat('en-CA', {timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date()); return Date.parse(p); } catch { return 0; } };
  // world_clock_item: the city, its day when it is not today's, the time.
  // Automatic home clock (WorldClockAdapter): with it on and Home time zone away from the phone's zone now, a city
  // named home_label in that zone comes first.
  const offsetOf = tz => { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p); return m ? (m[1] === '-' ? -1 : 1) * ((+m[2]) * 60 + (+(m[3] || 0))) : 0; } catch { return 0; } };
  function homeCity(c) {
    if (prefs(c).automatic_home_clock === false) return null;
    const tz = prefs(c).home_time_zone; if (!tz) return null;
    return offsetOf(tz) === -new Date().getTimezoneOffset() ? null : ['home', tz, T().t('home_label')];
  }
  function worldClocks(c) {
    const home = homeCity(c), rows = [...(home ? [home] : []), ...(S(c).cities || []).map(cityRow).filter(Boolean)], today = zoneDay(Intl.DateTimeFormat().resolvedOptions().timeZone);
    return rows.map(r => {
      const d = zoneDay(r[1]), day = d !== today ? new Intl.DateTimeFormat(c.locale(), {timeZone: r[1], weekday: 'short'}).format(new Date()) : '';
      return `<div class="ngck-wc"><div class="ngck-wcname"><span>${c.safe(cityName(c, r))}</span>${day ? `<small>${c.safe(day)}</small>` : ''}</div><div class="ngck-wctime">${c.safe(zoneTime(c, r[1]))}</div></div>`;
    }).join('');
  }
  // Style (clock_style): AnalogClock with clock_analog_dial and the hour, minute and second hands turned to the time.
  const style = c => prefs(c).clock_style || 'digital';
  function analog(now) {
    const sec = now.getSeconds(), m = now.getMinutes() + sec / 60, h = (now.getHours() % 12) + m / 60;
    const hand = (n, deg) => `<img class="ngck-hand" src="${A(`clock_analog_${n}.svg`)}" alt="" style="transform:rotate(${deg.toFixed(2)}deg)">`;
    return `<div class="ngck-analog"><img src="${A('clock_analog_dial.svg')}" alt="">${hand('hour', h * 30)}${hand('minute', m * 6)}${hand('second', sec * 6)}</div>`;
  }
  function clockPage(c) {
    const now = NG.deviceDate(c), next = nextAlarm(c);
    const date = new Intl.DateTimeFormat(c.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).format(now);
    return `<div class="ngck-clock">${style(c) === 'analog' ? analog(now) : `<div class="ngck-big">${timeHtml(c, now.getHours(), now.getMinutes(), 'ngck-ampm')}</div>`}
      <div class="ngck-labels"><span>${c.safe(date)}</span>${next ? `<b class="ngck-glyph">A</b><span>${c.safe(next)}</span>` : ''}</div><i class="ngck-hair"></i></div>${worldClocks(c)}`;
  }
  function alarmPage(c) {
    const t = T(), u = ui(c), list = S(c).alarms;
    if (!list.length) return `<div class="ngck-empty">${c.safe(t.t('no_alarms'))}</div>`;
    return `<div class="ngck-alarms">${list.map(a => {
      const open = u.expanded === a.id;
      const head = `<div class="ngck-sum"><button type="button" class="ngck-time" data-action="ngck-time" data-id="${a.id}">${timeHtml(c, a.h, a.m, 'ngck-aampm')}</button><i></i><button type="button" class="ngck-switch" data-action="ngck-onoff" data-id="${a.id}" aria-label=""><i class="ngw-switch ngck-sw${a.on ? ' on' : ''}"><i class="ngw-thumb"></i></i></button></div>`;
      if (!open) return `<div class="ngck-alarm" data-action="ngck-expand" data-id="${a.id}">${head}<div class="ngck-line"><span class="ngck-label">${c.safe(a.label)}</span><span class="ngck-days">${c.safe(a.days.length ? daysText(c, a.days) : '')}</span><button type="button" class="ngck-arrow" data-action="ngck-expand" data-id="${a.id}" aria-label="${c.safe(t.t('expand_alarm'))}">${mask('ic_expand_more.svg')}</button></div><i class="ngck-hair"></i></div>`;
      const fmt = new Intl.DateTimeFormat(c.locale(), {weekday: 'narrow'}), first = firstDay(c);
      const dayBtns = [0, 1, 2, 3, 4, 5, 6].map(i => (i + first) % 7).map(d => `<button type="button" class="ngck-day${a.days.includes(d) ? ' on' : ''}" data-action="ngck-day" data-id="${a.id}" data-d="${d}">${c.safe(fmt.format(new Date(2017, 0, 1 + d)))}</button>`).join('');
      const check = (action, on, label) => `<button type="button" class="ngck-check" data-action="${action}" data-id="${a.id}"><i class="ngck-box${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></button>`;
      return `<div class="ngck-alarm open">${head}
        ${check('ngck-repeat', a.days.length > 0, t.t('alarm_repeat'))}
        ${a.days.length ? `<div class="ngck-dayrow">${dayBtns}</div>` : ''}
        <div class="ngck-opts"><button type="button" class="ngck-ring" data-action="ngck-ring" data-id="${a.id}">${mask('ic_ringtone.svg')}<span>${c.safe(a.ringtone ?? NG.settingsRingtones?.alarm?.default ?? '')}</span></button>${check('ngck-vibrate', a.vibrate, t.t('alarm_vibrate'))}</div>
        <button type="button" class="ngck-labelbtn${a.label ? '' : ' hint'}" data-action="ngck-label" data-id="${a.id}">${c.safe(a.label || t.t('label'))}</button><i class="ngck-hair inset"></i>
        <div class="ngck-foot"><button type="button" class="ngck-del" data-action="ngck-delete" data-id="${a.id}" aria-label="${c.safe(t.t('delete'))}">${mask('ic_delete_small.svg')}</button><button type="button" class="ngck-arrow up" data-action="ngck-expand" data-id="${a.id}" aria-label="${c.safe(t.t('collapse_alarm'))}">${mask('ic_expand_more.svg')}</button></div></div>`;
    }).join('')}</div>`;
  }
  const pad2 = n => String(n).padStart(2, '0');
  function timerPage(c) {
    const t = T(), u = ui(c);
    if (S(c).timer) {
      const left = Math.max(0, S(c).timer.end ? S(c).timer.end - Date.now() : S(c).timer.left), total = S(c).timer.total;
      const s = Math.ceil(left / 1000), text = s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}:${pad2(s % 60)}` : `${Math.floor(s / 60)}:${pad2(s % 60)}`;
      return `<div class="ngck-circlewrap"><div class="ngck-circle" style="--p:${(1 - left / total).toFixed(4)}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="ngck-ctime">${c.safe(text)}</span></div></div>`;
    }
    const d = u.timerDigits.padStart(6, '0'), on = u.timerDigits.length;
    // TimerView: the digits typed so far white, the rest grey.
    const dig = (i, ch) => `<span class="${6 - i <= on ? 'set' : ''}">${ch}</span>`;
    const unit = k => `<small>${c.safe(t.t(k))}</small>`;
    const keys = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '']];
    return `<div class="ngck-setup"><div class="ngck-digits">${dig(0, d[0])}${dig(1, d[1])}${unit('hours_label')}${dig(2, d[2])}${dig(3, d[3])}${unit('minutes_label')}${dig(4, d[4])}${dig(5, d[5])}${unit('seconds_label')}<button type="button" class="ngck-back" data-action="ngck-tdel"${on ? '' : ' disabled'} aria-label="${c.safe(t.t('timer_delete'))}">${mask('ic_backspace.svg')}</button></div><i class="ngck-padline"></i>
      <div class="ngck-pad">${keys.map(r => `<div>${r.map(k => k ? `<button type="button" data-action="ngck-tkey" data-k="${k}">${k}</button>` : '<i></i>').join('')}</div>`).join('')}</div></div>`;
  }
  const swElapsed = u => u.sw.acc + (u.sw.running ? Date.now() - u.sw.start : 0);
  function swText(ms) {
    const cs = Math.floor(ms / 10) % 100, s = Math.floor(ms / 1000) % 60, m = Math.floor(ms / 60000) % 60, h = Math.floor(ms / 3600000);
    return `${h ? `${h}:${pad2(m)}` : pad2(m)}:${pad2(s)}<small>.${pad2(cs)}</small>`;
  }
  function stopwatchPage(c) {
    const u = ui(c), ms = swElapsed(u), lap = u.sw.laps.length ? ms - u.sw.laps.reduce((a, b) => a + b, 0) : ms;
    const p = u.sw.laps.length ? Math.min(1, lap / u.sw.laps[0]) : (ms % 60000) / 60000;
    return `<div class="ngck-circlewrap sw"><div class="ngck-circle" style="--p:${p.toFixed(4)}"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="ngck-ctime sw">${swText(ms)}</span></div></div>
      <div class="ngck-laps">${u.sw.laps.map((l, i, all) => `<div><span>#${all.length - i}</span><span>${swText(l)}</span><span>${swText(all.slice(i).reduce((a, b) => a + b, 0))}</span></div>`).join('')}</div>`;
  }
  function footer(c) {
    const t = T(), u = ui(c);
    const fab = (icon, label) => `<button type="button" class="ngck-fab" data-action="ngck-fab" aria-label="${c.safe(label)}">${icon.endsWith('.png') ? `<img src="${A(icon)}" alt="">` : mask(icon, ' white')}</button>`;
    const side = (action, icon, label) => action ? `<button type="button" class="ngck-side" data-action="${action}" aria-label="${c.safe(label)}">${icon.endsWith('.png') ? `<img src="${A(icon)}" alt="">` : mask(icon, ' white')}</button>` : '<span></span>';
    if (u.tab === 'clock') return `<div class="ngck-footer"><span></span>${fab('ic_public.svg', t.t('button_cities'))}<span></span></div>`;
    if (u.tab === 'alarm') return `<div class="ngck-footer"><span></span>${fab('ic_add_white_24dp.png', t.t('button_alarms'))}<span></span></div>`;
    if (u.tab === 'timer') {
      if (!S(c).timer) return `<div class="ngck-footer"><span></span>${u.timerDigits ? fab('ic_start_white_24dp.png', t.t('timer_start')) : '<i class="ngck-fabspace"></i>'}<span></span></div>`;
      return `<div class="ngck-footer">${side('ngck-treset', 'ic_reset_white_24dp.png', t.t('timer_reset'))}${fab(S(c).timer.end ? 'ic_pause_white_24dp.png' : 'ic_start_white_24dp.png', t.t('timer_start'))}${S(c).timer.end ? side('ngck-tplus', 'ic_plusone.svg', t.t('timer_plus_one')) : side('ngck-tadd', 'ic_add_timer.svg', t.t('timer_add_timer'))}</div>`;
    }
    const s = u.sw;
    return `<div class="ngck-footer">${!s.running && s.acc ? side('ngck-swreset', 'ic_reset.svg', t.t('sw_reset_button')) : '<span></span>'}${fab(s.running ? 'ic_pause_white_24dp.png' : 'ic_start_white_24dp.png', t.t('sw_start_button'))}${s.running ? side('ngck-swlap', 'ic_lap.svg', t.t('sw_lap_button')) : s.acc ? side('ngck-swshare', 'ic_share.svg', t.t('sw_share_button')) : '<span></span>'}</div>`;
  }
  function render(c) {
    const t = T(), u = ui(c), color = HOUR_COLORS[NG.deviceDate(c).getHours()];
    if (u.night) return `<div class="ngck ngck-night" data-action="ngck-nightoff">${clockPage(c)}</div>`;
    const page = {alarm: alarmPage, clock: clockPage, timer: timerPage, stopwatch: stopwatchPage}[u.tab](c);
    return `<div class="ngck" style="background:${color}"><div class="ngck-tabs">${TABS.map(([id, label]) => `<button type="button" class="${u.tab === id ? 'on' : ''}" data-action="ngck-tab" data-tab="${id}" aria-label="${c.safe(t.t(label))}">${mask(`ic_tab_${id}_static.svg`)}</button>`).join('')}${NG.menu.button(c)}</div>
      <div class="ngck-page ngck-p-${u.tab}">${page}</div>${footer(c)}</div>`;
  }

  // The running stopwatch and timer redraw the page.
  let ticker = 0;
  function tickLoop(c) {
    clearInterval(ticker);
    ticker = setInterval(() => {
      if (c.ui.view !== 'clock' || c.ui.overlay) return;
      const u = ui(c), root = c.el.viewport;
      if (u.tab === 'stopwatch' && u.sw.running) {
        const el = root.querySelector('.ngck-ctime'); if (el) el.innerHTML = swText(swElapsed(u));
        const circ = root.querySelector('.ngck-circle'), lap = u.sw.laps.length ? swElapsed(u) - u.sw.laps.reduce((a, b) => a + b, 0) : swElapsed(u);
        circ?.style.setProperty('--p', (u.sw.laps.length ? Math.min(1, lap / u.sw.laps[0]) : (swElapsed(u) % 60000) / 60000).toFixed(4));
      } else if (u.tab === 'timer' && S(c).timer?.end) c.render();   // ng-alarm.js fires the timer when it runs out
    }, 50);
  }

  NG.clock24 = h24; NG.clockNextAlarmText = nextAlarm;
  // For the alarm and timer alerts (ng-alarm.js): the hour's colour and the time markup.
  NG.clockHourColor = c => HOUR_COLORS[NG.deviceDate(c).getHours()]; NG.clockTimeHtml = timeHtml;
  NG.register('clock', {
    statusColor: c => HOUR_COLORS[NG.deviceDate(c).getHours()],
    render,
    mount(c) { tickLoop(c); },
    tick(c, now) { const u = ui(c); if (c.ui.view === 'clock' && !c.ui.overlay && (u.tab === 'clock' || u.tab === 'alarm' || u.night) && (now.getSeconds() === 0 || (u.tab === 'clock' && !u.night && style(c) === 'analog'))) { c.transition('none'); c.render(); } },
    back(c) { const u = ui(c); if (u.night) { u.night = false; c.render(); return true; } if (u.expanded) { u.expanded = null; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const t = T(), u = ui(c), s = S(c), a = s.alarms.find(x => x.id === +el.dataset.id);
      const save = () => { c.save(); c.render(); };
      switch (name) {
        case 'ngck-tab': u.tab = el.dataset.tab; c.render(); return true;
        case 'ngck-nightoff': u.night = false; c.render(); return true;
        case 'ngck-expand': if (event?.target?.closest('.ngck-switch,.ngck-time') && el.classList.contains('ngck-alarm')) return false; u.expanded = u.expanded === a.id ? null : a.id; c.render(); return true;
        case 'ngck-onoff': a.on = !a.on; save(); if (a.on) setToast(c, a); NG.system?.changed(c); return true;
        case 'ngck-time': NG.timePicker(c, a.h, a.m, (h, m) => { a.h = h; a.m = m; a.on = true; save(); setToast(c, a); NG.system?.changed(c); }, {bg: '#ffffff', header: '#da4336', dial: '#eceff1', numbers: '#000000de', accent: '#da4336', dim: '#ffffff99', on: '#ffffff'}); return true;
        case 'ngck-day': { const d = +el.dataset.d; a.days = a.days.includes(d) ? a.days.filter(x => x !== d) : [...a.days, d]; save(); return true; }
        case 'ngck-repeat': a.days = a.days.length ? [] : [0, 1, 2, 3, 4, 5, 6]; save(); return true;
        case 'ngck-vibrate': a.vibrate = !a.vibrate; save(); return true;
        case 'ngck-ring': NG.ringtonePicker ? NG.ringtonePicker(c, {kind: 'alarm', current: a.ringtone, onPick: (c, v) => { a.ringtone = v; save(); }}) : null; return true;
        case 'ngck-label': {
          let v = a.label;
          c.dialog({title: t.t('label'), html: `<div class="ngst-edit"><input type="text" class="ngst-input ngck-labelin" value="${c.safe(a.label)}"></div>`, buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: () => { a.label = v; save(); }}],
            mount(c, win) { const i = win.querySelector('.ngck-labelin'); i.addEventListener('input', () => { v = i.value; }); setTimeout(() => i.focus(), 50); }});
          return true;
        }
        case 'ngck-delete': s.alarms = s.alarms.filter(x => x !== a); u.expanded = null; save(); c.toast(t.t('alarm_deleted'), false); NG.system?.changed(c); return true;
        case 'ngck-tkey': if (u.timerDigits.length < 6 && !(u.timerDigits === '' && el.dataset.k === '0')) u.timerDigits += el.dataset.k; c.render(); return true;
        case 'ngck-tdel': u.timerDigits = u.timerDigits.slice(0, -1); c.render(); return true;
        case 'ngck-treset': S(c).timer = null; c.save(); c.render(); return true;
        case 'ngck-tadd': S(c).timer = null; u.timerDigits = ''; c.save(); c.render(); return true;
        case 'ngck-tplus': if (S(c).timer?.end) { S(c).timer.end += 60000; S(c).timer.total += 60000; } c.save(); c.render(); return true;
        case 'ngck-swreset': u.sw = {start: 0, acc: 0, running: false, laps: []}; c.render(); return true;
        case 'ngck-swlap': { const totalMs = swElapsed(u), done = u.sw.laps.reduce((x, y) => x + y, 0); u.sw.laps.unshift(totalMs - done); c.render(); return true; }
        case 'ngck-swshare': {
          const plain = ms => swText(ms).replace(/<\/?small>/g, ''), lines = t.t('sw_share_strings');
          const laps = u.sw.laps.length ? `${t.t('sw_share_laps')}\n${[...u.sw.laps].reverse().map((l, i) => `#${i + 1}  ${plain(l)}`).join('\n')}\n` : '';
          NG.share ? NG.share(c, {title: t.t('sw_share_button'), subject: lines[Math.floor(Math.random() * lines.length)], text: `${AndroidStrings.format(t.t('sw_share_main'), plain(swElapsed(u)))}\n${laps}`}) : c.toast(t.t('sw_share_button'));
          return true;
        }
        case 'ng-menu': {
          const items = [];
          if (u.tab === 'clock') items.push({label: t.t('menu_item_night_mode'), action: c => { u.night = true; c.render(); }});
          items.push({label: t.t('menu_item_settings'), action: c => c.open('clock-settings')}, {label: t.t('menu_item_help'), action: c => c.open('help', 'clock')});
          c.menu(items, el); return true;
        }
        case 'ngck-fab':
          if (u.tab === 'clock') { c.open('clock-cities'); return true; }
          if (u.tab === 'alarm') {
            NG.timePicker(c, new Date().getHours(), new Date().getMinutes(), (h, m) => { const id = Math.max(0, ...s.alarms.map(x => x.id)) + 1; const n = {id, h, m, days: [], on: true, vibrate: true, label: ''}; s.alarms.push(n); s.alarms.sort((x, y) => x.h * 60 + x.m - (y.h * 60 + y.m)); u.expanded = id; save(); setToast(c, n); NG.system?.changed(c); },
              {bg: '#ffffff', header: '#da4336', dial: '#eceff1', numbers: '#000000de', accent: '#da4336', dim: '#ffffff99', on: '#ffffff'});
            return true;
          }
          if (u.tab === 'timer') {
            if (!S(c).timer) { const d = u.timerDigits.padStart(6, '0'); const ms = ((+d.slice(0, 2)) * 3600 + (+d.slice(2, 4)) * 60 + (+d.slice(4))) * 1000; if (!ms) return true; S(c).timer = {total: ms, left: ms, end: Date.now() + ms}; u.timerDigits = ''; }
            else if (S(c).timer.end) { S(c).timer.left = S(c).timer.end - Date.now(); S(c).timer.end = 0; }
            else S(c).timer.end = Date.now() + S(c).timer.left;
            c.save(); c.render(); return true;
          }
          if (u.sw.running) { u.sw.acc += Date.now() - u.sw.start; u.sw.running = false; } else { u.sw.start = Date.now(); u.sw.running = true; }
          c.render(); return true;
      }
      return false;
    }
  });

  /* CitySelectionActivity (cities_activity.xml over the clock's background): the action bar with Cities, search and the
     overflow's Sort by time / Sort by name; city_list_header's Selected Cities, then every city of the APK's city_ids
     (ng-cities.js) in city_list_item.xml (56 dp: the 74 dp index column, 14 sp bold, with the first letter of a new
     group, the check box, the name, the time there in 63 % white). A check adds the city to the world clock. */
  NG.register('clock-cities', {
    app: false,
    statusColor: c => HOUR_COLORS[NG.deviceDate(c).getHours()],
    render(c) {
      const t = T(), u = c.ui.clockCities || (c.ui.clockCities = {q: '', byTime: false, search: false}), picked = S(c).cities || [];
      const all = (NG.deskClockCities || []).map(r => { const raw = String(r[LANG_COL[c.lang] ?? 2] || r[2]), name = raw.split('=').pop(); return {id: r[0], name, key: raw.split('=')[0] || name.charAt(0).toLocaleUpperCase(c.locale()), tz: r[1]}; });
      const q = u.q.trim().toLocaleLowerCase(c.locale());
      const offset = tz => { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p); return m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0; } catch { return 0; } };
      const col = new Intl.Collator(c.locale());
      const list = all.filter(x => !q || x.name.toLocaleLowerCase(c.locale()).includes(q)).sort((a, b) => u.byTime ? offset(a.tz) - offset(b.tz) || col.compare(a.name, b.name) : col.compare(a.key, b.key) || col.compare(a.name, b.name));
      const row = (x, index) => `<button type="button" class="ngck-city" data-action="ngck-city" data-id="${x.id}"><span class="ngck-cindex">${c.safe(index)}</span><i class="ngck-box${picked.includes(x.id) ? ' on' : ''}"></i><span class="ngck-cname">${c.safe(x.name)}</span><span class="ngck-ctimes">${c.safe(zoneTime(c, x.tz))}</span></button>`;
      let last = '';
      const rows = list.map(x => { const k = u.byTime ? '' : x.key; const show = k !== last ? k : ''; last = k; return row(x, show); }).join('');
      const sel = all.filter(x => picked.includes(x.id) && !q);
      const back = `<button type="button" class="ngck-cbtn" data-action="${u.search ? 'ngck-csearchoff' : 'ngck-cup'}">${mask('fw-ic_ab_back_material.svg')}</button>`;
      const bar = u.search ? `<div class="ngck-cbar">${back}<input class="ngck-cq" value="${c.safe(u.q)}" placeholder="${c.safe(t.t('framework/search_go'))}" autocomplete="off"></div>`
        : `<div class="ngck-cbar">${back}<span>${c.safe(t.t('cities_activity_title'))}</span><button type="button" class="ngck-cbtn" data-action="ngck-csearch" aria-label="${c.safe(t.t('framework/search_go'))}">${mask('fw-ic_search_api_material.svg')}</button>${NG.menu.button(c)}</div>`;
      return `<div class="ngck ngck-cities" style="background:${HOUR_COLORS[NG.deviceDate(c).getHours()]}">${bar}<div class="ngck-clist">${sel.length ? `<div class="ngck-chead">${c.safe(t.t('selected_cities_label'))}</div>${sel.map(x => row(x, '')).join('')}<i class="ngck-hair"></i>` : ''}${rows}</div></div>`;
    },
    mount(c, root) {
      const f = root.querySelector('.ngck-cq'); if (!f) return;
      f.addEventListener('input', () => { const pos = f.selectionStart; c.ui.clockCities.q = f.value; c.render(); const g = c.el.viewport.querySelector('.ngck-cq'); if (g) { g.focus(); g.setSelectionRange(pos, pos); } });
      if (document.activeElement !== f) setTimeout(() => f.focus(), 30);
    },
    back(c) { const u = c.ui.clockCities; if (u?.search) { u.search = false; u.q = ''; c.render(); return true; } c.ui.clockCities = null; return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.clockCities, s = S(c);
      if (name === 'ngck-cup') { c.ui.clockCities = null; c.back(); return true; }
      if (name === 'ngck-csearch') { u.search = true; c.render(); return true; }
      if (name === 'ngck-csearchoff') { u.search = false; u.q = ''; c.render(); return true; }
      if (name === 'ngck-city') { const id = el.dataset.id, list = s.cities || []; s.cities = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; c.save(); c.render(); return true; }
      if (name === 'ng-menu') { c.menu([{label: t.t(u.byTime ? 'menu_item_sort_by_name' : 'menu_item_sort_by_gmt_offset'), action: c => { u.byTime = !u.byTime; c.render(); }}], el); return true; }
      return false;
    }
  });

  // SettingsActivity (settings.xml; the support library's preference rows on the clock's background).
  const ARR = n => T().t(n);
  const ROWS = [
    {cat: 'clock_settings'},
    {key: 'clock_style', title: 'clock_style', list: 'clock_style_entries', values: ['analog', 'digital'], def: 'digital'},
    {key: 'automatic_home_clock', title: 'automatic_home_clock', summary: 'automatic_home_clock_summary', sw: true, def: true},
    {key: 'home_time_zone', title: 'home_time_zone', tz: true},
    {key: 'date_time', title: 'open_date_settings'},
    {cat: 'alarm_settings'},
    {key: 'auto_silence', title: 'auto_silence_title', list: 'auto_silence_entries', values: ['1', '5', '10', '15', '20', '25', '-1'], def: '10'},
    {key: 'snooze_duration', title: 'snooze_duration_title', num: [1, 30], def: 10, plural: 'snooze_duration'},
    {key: 'volume_setting', title: 'alarm_volume_title'},
    {key: 'alarm_crescendo_duration', title: 'crescendo_duration_title', crescendo: true},
    {key: 'volume_button_setting', title: 'volume_button_setting_title', list: 'volume_button_setting_entries', values: ['0', '1', '2'], def: '0'},
    {key: 'week_start', title: 'week_start_title', list: 'week_start_entries', values: ['7', '2', '1'], def: null},
    {cat: 'timer_settings'},
    {key: 'timer_ringtone', title: 'timer_ringtone_title'},
    {key: 'timer_crescendo_duration', title: 'crescendo_duration_title', crescendo: true},
    {key: 'timer_vibrate', title: 'timer_vibrate_title', sw: true, def: false}];
  const val = (c, r) => prefs(c)[r.key] ?? r.def;
  function rowSummary(c, r) {
    const t = T(), v = val(c, r);
    if (r.list) { const vals = r.values, i = vals.indexOf(String(v ?? (r.key === 'week_start' ? String(firstDay(c) === 1 ? 2 : firstDay(c) === 0 ? 1 : 7) : ''))); return ARR(r.list)[i] ?? ''; }
    if (r.num) return t.plural(r.plural, +v);
    if (r.crescendo) { const n = +(v ?? 0); return n ? t.fmt('crescendo_duration', null, n) : t.t('no_crescendo_duration'); }
    if (r.tz) return Intl.DateTimeFormat().resolvedOptions().timeZone.split('/').pop().replace(/_/g, ' ');
    if (r.key === 'timer_ringtone') return v || t.t('default_timer_ringtone_title');
    return r.summary ? t.t(r.summary) : '';
  }
  NG.register('clock-settings', {
    app: false,
    statusColor: c => HOUR_COLORS[NG.deviceDate(c).getHours()],
    render(c) {
      const t = T();
      const rows = ROWS.map(r => r.cat ? `<div class="ngck-scat">${c.safe(t.t(r.cat))}</div>` : `<button type="button" class="ngck-srow" data-action="ngck-srow" data-key="${r.key}"><span class="ngck-stexts"><span>${c.safe(t.t(r.title))}</span>${rowSummary(c, r) ? `<small>${c.safe(rowSummary(c, r))}</small>` : ''}</span>${r.sw ? `<i class="ngw-switch ngck-sw${val(c, r) ? ' on' : ''}"><i class="ngw-thumb"></i></i>` : ''}</button>`).join('');
      return `<div class="ngck ngck-settings" style="background:${HOUR_COLORS[NG.deviceDate(c).getHours()]}"><div class="ngck-cbar"><button type="button" class="ngck-cbtn" data-action="ngck-sup">${mask('fw-ic_ab_back_material.svg')}</button><span>${c.safe(t.t('settings'))}</span></div><div class="ngck-slist">${rows}</div></div>`;
    },
    action(name, el, event, c) {
      const t = T();
      if (name === 'ngck-sup') { c.back(); return true; }
      if (name !== 'ngck-srow') return false;
      const r = ROWS.find(x => x.key === el.dataset.key), p = prefs(c), set = v => { p[r.key] = v; c.save(); c.render(); };
      const radioList = (labels, cur, onPick) => c.dialog({title: t.t(r.title), items: labels.map((l, i) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${i === cur ? ' on' : ''}"></i><span>${c.safe(l)}</span></span>`})), buttons: [{label: t.t('framework/cancel')}], onItem: onPick});
      if (r.sw) { set(!val(c, r)); return true; }
      if (r.key === 'date_time') { c.open('settings', 'xml:date_time_prefs'); return true; }
      if (r.key === 'volume_setting') { c.open('settings', 'sound'); return true; }
      if (r.list) { const cur = r.values.indexOf(String(val(c, r))); radioList(ARR(r.list), cur, i => set(r.values[i])); return true; }
      if (r.num) { const vals = Array.from({length: r.num[1] - r.num[0] + 1}, (_, i) => i + r.num[0]); radioList(vals.map(n => t.plural(r.plural, n)), vals.indexOf(+val(c, r)), i => set(vals[i])); return true; }
      if (r.crescendo) { const vals = Array.from({length: 13}, (_, i) => i * 5); radioList(vals.map(n => n ? t.fmt('crescendo_duration', null, n) : t.t('no_crescendo_duration')), vals.indexOf(+(val(c, r) ?? 0)), i => set(vals[i])); return true; }
      if (r.key === 'timer_ringtone') { NG.ringtonePicker?.(c, {kind: 'alarm', current: val(c, r), onPick: (c, v) => set(v)}); return true; }
      return true;
    }
  });
})();
