/* Android 4.2/4.3 DeskClock: Timer | Clock | Stopwatch pages (DeskClock, TimerFragment, StopwatchFragment). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // DeskClock 4.4: ALARM_TAB_INDEX 0, CLOCK 1, TIMER 2, STOPWATCH 3.
  const TABS = ['alarm', 'clock', 'timer', 'stopwatch'];
  const pad = (n, size = 2) => String(Math.floor(n)).padStart(size, '0');
  // hours_label / minutes_label / seconds_label per language (DeskClock values-*/strings.xml).
  const units = locale => ({hu: ['ó', 'p', 'mp'], de: ['h', 'm', 's'], fr: ['h', 'min', 's'], es: ['h', 'm', 's']}[String(locale).slice(0, 2)] || ['h', 'm', 's']);

  // TimerSetupView: digits fill from the right into H MM SS (five digits).
  const setupDigits = (digits, key) => key === 'back' ? digits.slice(0, -1) : digits.length >= 5 || (!digits && key === '0') ? digits : digits + key;
  function setupTime(digits) {
    const d = digits.padStart(5, '0');
    return {h: Number(d[0]), m: Number(d.slice(1, 3)), s: Number(d.slice(3, 5)), ms: (Number(d[0]) * 3600 + Number(d.slice(1, 3)) * 60 + Number(d.slice(3, 5))) * 1000};
  }
  // TimerObj: time left while running is measured from the start timestamp.
  const remaining = (timer, now) => timer.state === 'running' ? timer.left - (now - timer.started) : timer.left;
  function timerAction(timer, action, now) {
    if (action === 'toggle') {
      if (timer.state === 'running') return {...timer, left: remaining(timer, now), started: null, state: 'stopped'};
      if (timer.state === 'done') return {...timer, left: timer.length, started: null, state: 'stopped'};
      return {...timer, started: now, state: 'running'};
    }
    if (action === 'plus') {
      const left = Math.max(0, remaining(timer, now)) + 60000;
      return {...timer, left: timer.state === 'running' ? left + (now - timer.started) : left, length: Math.max(timer.length, left), state: timer.state === 'done' ? 'running' : timer.state, started: timer.state === 'done' ? now : timer.started};
    }
    return timer;
  }
  // CountingTimerView: timers show [H:]MM:SS (rounded up while counting down); the stopwatch adds hundredths.
  function formatTimer(ms) {
    const over = ms < 0, total = Math.ceil(Math.abs(ms) / 1000), h = Math.floor(total / 3600), m = Math.floor(total % 3600 / 60), s = total % 60;
    return `${over ? '-' : ''}${h ? `${h}:${pad(m)}` : pad(m)}:${pad(s)}`;
  }
  function formatStopwatch(ms) {
    const h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000), s = Math.floor(ms % 60000 / 1000), hundredths = Math.floor(ms % 1000 / 10);
    return `${h ? `${h}:${pad(m)}` : pad(m)}:${pad(s)}.${pad(hundredths)}`;
  }
  const elapsed = (watch, now) => (watch.accumulated || 0) + (watch.started != null ? now - watch.started : 0);
  function stopwatchAction(watch, action, now) {
    const time = elapsed(watch, now);
    if (action === 'toggle') return watch.started != null ? {...watch, accumulated: time, started: null} : {...watch, started: now};
    if (action === 'lap' && watch.started != null) return {...watch, laps: [...(watch.laps || []), time]};
    if (action === 'reset' && watch.started == null) return {accumulated: 0, started: null, laps: []};
    return watch;
  }

  /* CircleTimerView: a 4dp white circle; timers draw red counter-clockwise from 12 o'clock for the elapsed share,
     the stopwatch draws red clockwise for the current lap relative to the previous lap, with a marker at that lap. */
  function drawCircle(canvas, {mode, interval, current, marker = -1, running}) {
    const dpr = window.devicePixelRatio || 1, w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
    const ctx = canvas.getContext('2d'), stroke = 4 * .9, diamond = 12 * .9, cx = w / 2, cy = h / 2, r = Math.min(cx, cy) - diamond;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h); ctx.lineWidth = stroke;
    const top = -Math.PI / 2, timer = mode === 'timer';
    if (!interval || current < 0 || (!running && !current)) {
      ctx.strokeStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      if (timer) drawDiamond(ctx, cx, cy, r, 0, true, diamond);
      return;
    }
    let red = current / interval; if (timer) red = Math.min(1, red);
    const white = 1 - Math.min(1, red);
    ctx.strokeStyle = '#ff4444'; ctx.beginPath();
    if (timer) ctx.arc(cx, cy, r, top, top - red * Math.PI * 2, true); else ctx.arc(cx, cy, r, top, top + red * Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.beginPath();
    if (timer) ctx.arc(cx, cy, r, top, top + white * Math.PI * 2); else ctx.arc(cx, cy, r, top + (1 - white) * Math.PI * 2, top + Math.PI * 2);
    ctx.stroke();
    if (marker >= 0) { const angle = top + (marker % interval) / interval * Math.PI * 2; ctx.lineWidth = 16 * .9; ctx.beginPath(); ctx.arc(cx, cy, r, angle, angle + 2 / r); ctx.stroke(); }
    drawDiamond(ctx, cx, cy, r, red, timer, diamond);
  }
  function drawDiamond(ctx, cx, cy, r, fraction, timer, size) {
    const angle = (timer ? 270 - fraction * 360 : 270 + fraction * 360) * Math.PI / 180;
    ctx.save(); ctx.translate(cx + r * Math.cos(angle), cy + r * Math.sin(angle)); ctx.rotate(Math.PI / 4);
    ctx.fillStyle = '#ff4444'; ctx.fillRect(-size / 2, -size / 2, size, size); ctx.restore();
  }

  /* World clock (DeskClock 3.0.0): the cities of cities.xml (dc-cities.js, in this image's languages). The Clock page
     lists the chosen cities under the main clock two to a row (world_clock_list_item: desk_clock_time_small with the
     60 dp bold hours and light minutes, the 14 sp bold condensed city name and, when the date differs, "/ day" in
     clock_gray); CitiesActivity lists every city with the "Selected Cities" first, then under first-letter headers (city_list_header) as
     city_list_item rows: the 24 sp bold condensed name over the 18 sp time in clock_gray and a check box. */
  // selected_cities_label and cities_menu's sort items in this DeskClock's words.
  const CITY_WORDS = {"Sort by time": {"en": "Sort by time", "hu": "Rendezés idő szerint", "de": "Zeitlich sortieren", "fr": "Trier par heure", "es": "Ordenar por hora"}, "Sort by name": {"en": "Sort by name", "hu": "Rendezés név szerint", "de": "Nach Namen sortieren", "fr": "Trier par nom", "es": "Ordenar por nombre"}, "Selected Cities": {"en": "Selected Cities", "hu": "Kiválasztott városok", "de": "Ausgewählte Städte", "fr": "Villes sélectionnées", "es": "Ciudades seleccionadas"}};
  const cityWord = (key, locale) => (CITY_WORDS[key] || {})[String(locale).slice(0, 2)] || key;
  const LANG_COL = {en: 2, hu: 3, de: 4, fr: 5, es: 6};
  const city = id => (window.DeskClockCities || []).find(row => row[0] === id);
  const cityName = (row, locale) => row[LANG_COL[String(locale).slice(0, 2)] || 2];
  // An id the time zone database does not know (cities.xml's own "America/Chihuaha") falls back to GMT, as TimeZone does.
  const zone = tz => { try { new Intl.DateTimeFormat('en-US', {timeZone: tz}); return tz; } catch { return 'UTC'; } };
  function cityTime(tz, now, hour24, locale) {
    tz = zone(tz);
    const parts = Object.fromEntries(new Intl.DateTimeFormat(locale, {timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: !hour24}).formatToParts(now).map(p => [p.type, p.value]));
    const day = d => new Intl.DateTimeFormat('en-US', {timeZone: d, weekday: 'short'}).format(now);
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return {hours: hour24 ? String(parts.hour).padStart(2, '0') : parts.hour, minutes: parts.minute, ampm: hour24 ? '' : parts.dayPeriod || '',
      day: day(tz) === day(local) ? '' : new Intl.DateTimeFormat(locale, {timeZone: tz, weekday: 'short'}).format(now),
      offset: (() => { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(now).find(x => x.type === 'timeZoneName')?.value || 'GMT'; const m = p.match(/([+-])(\d+):?(\d*)/); return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0; })()};
  }
  function worldClocks(state, now, {locale, hour24}) {
    // The Home clock (clock-prefs) leads the list while the phone is away from the home time zone.
    const rows = [...(state.home ? [['home', state.home.zone, ...Array(8).fill(state.home.label)]] : []), ...(state.cities || []).map(city).filter(Boolean)];
    if (!rows.length) return '';
    const cell = row => { const c = cityTime(row[1], now, hour24, locale); return `<div class="jbclock-city"><div class="jbclock-city-time"><b>${e(c.hours)}</b><span>:${e(c.minutes)}</span>${c.ampm ? `<small>${e(c.ampm)}</small>` : ''}</div><div class="jbclock-city-label"><span>${e(cityName(row, locale))}</span>${c.day ? `<em>/ ${e(c.day)}</em>` : ''}</div></div>`; };
    const pairs = [];
    for (let i = 0; i < rows.length; i += 2) pairs.push(`<div class="jbclock-city-row">${cell(rows[i])}${rows[i + 1] ? cell(rows[i + 1]) : '<div class="jbclock-city"></div>'}</div>`);
    return `<div class="jbclock-world">${pairs.join('')}</div>`;
  }
  function cities(state, t, {locale, now, hour24, words}) {
    const chosen = new Set(state.cities || []), all = (window.DeskClockCities || []).map(row => ({row, name: cityName(row, locale), time: cityTime(row[1], now, hour24, locale)}));
    const byName = (a, b) => a.name.localeCompare(b.name, locale);
    const sorted = all.sort(state.citySort === 'time' ? (a, b) => a.time.offset - b.time.offset || byName(a, b) : byName);
    const item = c => `<button type="button" class="jbclock-city-item" data-action="jbclock-city" data-id="${e(c.row[0])}" role="checkbox" aria-checked="${chosen.has(c.row[0])}"><span><b>${e(c.name)}</b><small>${e(`${c.time.hours}:${c.time.minutes}${c.time.ampm ? ' ' + c.time.ampm : ''}`)}</small></span><img src="assets/btn_check_${chosen.has(c.row[0]) ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    let letter = '', list = '';
    // CitiesActivity's filter: names that start with the SearchView's text; the selected cities only while it is empty.
    const query = String(state.cityQuery || '').trim().toLocaleUpperCase(locale), shown = query ? sorted.filter(c => c.name.toLocaleUpperCase(locale).startsWith(query)) : sorted;
    if (chosen.size && !query) { list += `<h4 class="jbclock-city-header">${e(words.selected)}</h4>`; for (const c of sorted.filter(c => chosen.has(c.row[0]))) list += item(c); }
    for (const c of shown) { const first = c.name.charAt(0).toLocaleUpperCase(locale); if (first !== letter) { letter = first; list += `<h4 class="jbclock-city-header">${e(first)}</h4>`; } list += item(c); }
    return `<div class="app-view jbclock-app jbclock-cities"><header class="jbclock-ab"><button type="button" class="jbclock-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/clock.png" alt=""></button>${state.cityQuery !== undefined ? `<input class="jbclock-city-search" type="search" data-city-search value="${e(state.cityQuery)}" aria-label="${e(t('Search'))}" autocomplete="off">` : `<h2>${e(words.title)}</h2><button type="button" class="jbclock-ab-menu" data-action="jbclock-city-search" aria-label="${e(t('Search'))}"><img src="assets/jbclock-ic_menu_search_holo_dark.png" alt=""></button>`}<button type="button" class="jbclock-ab-menu" data-action="jbclock-cities-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="jbclock-city-list">${list}</div></div>`;
  }
  // now is the simulated wall clock for the Clock page; timers and the stopwatch run on real elapsed time.
  function render(state, t, {locale, now, hour24, alarm, date}) {
    const tab = TABS.includes(state.tab) ? state.tab : 'clock', index = TABS.indexOf(tab);
    const btn = (action, label, body, extra = '') => `<button type="button" data-action="${action}" aria-label="${e(t(label))}" ${extra}>${body}</button>`;
    const icon = name => `<img src="assets/jbclock-${name}.png" alt="">`;
    const tabs = `<header class="jbclock-tabs" role="tablist">${TABS.map(name => `<button role="tab" data-action="jbclock-tab" data-id="${name}" aria-selected="${name === tab}" aria-label="${e(t(name === 'alarm' ? 'Alarm' : name === 'timer' ? 'Timer' : name === 'clock' ? 'Clock' : 'Stopwatch'))}" class="${name === tab ? 'active' : ''}"><img src="assets/${name === 'alarm' ? `kdc-ic_alarm${name === tab ? '' : '_normal'}` : `kdc-ic_tab_${name}_${name === tab ? 'activated' : 'normal'}`}.png" alt=""></button>`).join('')}</header>`;
    // Timer page: setup keypad when there are no timers or a new one is being added.
    const timers = state.timers || [];
    let timerPage;
    if (!timers.length || state.timerSetup) {
      const time = setupTime(state.timerDigits || ''), active = (state.timerDigits || '').length;
      const digit = (value, on) => `<span class="${on ? 'on' : ''}">${value}</span>`;
      const [uh, um, us] = units(locale);
      timerPage = `<div class="jbclock-setup"><div class="jbclock-setup-display" aria-live="polite" data-no-translate>${digit(time.h, active >= 5)}<small>${e(uh)}</small>${digit(pad(time.m)[0], active >= 4)}${digit(pad(time.m)[1], active >= 3)}<small>${e(um)}</small>${digit(pad(time.s)[0], active >= 2)}${digit(pad(time.s)[1], active >= 1)}<small>${e(us)}</small>${btn('jbclock-key', 'Delete', icon(active ? 'ic_backspace_normal' : 'ic_backspace_disabled'), `data-id="back" class="jbclock-backspace" ${active ? '' : 'disabled'}`)}</div><div class="jbclock-keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map(key => key ? btn('jbclock-key', key, key, `data-id="${key}"`) : '<span></span>').join('')}</div><footer class="jbclock-footer">${timers.length ? btn('jbclock-setup-cancel', 'Cancel', e(t('Cancel'))) : ''}${btn('jbclock-setup-start', 'Start', e(t('Start')), time.ms ? '' : 'disabled')}</footer></div>`;
    } else {
      timerPage = `<div class="jbclock-timers">${timers.map(timer => { const left = remaining(timer, Date.now()); return `<div class="jbclock-timer${timer.state === 'done' ? ' done' : ''}" data-timer="${e(timer.id)}"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="timer:${e(timer.id)}"></canvas><div class="jbclock-count" data-count="timer:${e(timer.id)}">${e(timer.state === 'done' ? t("Time's up") : formatTimer(left))}</div><div class="jbclock-label">${icon('ic_label_normal')}${e(timer.label || '')}</div>${btn('jbclock-timer-delete', 'Delete', icon('ic_delete_normal'), `data-id="${e(timer.id)}" class="jbclock-corner left"`)}${btn('jbclock-timer-toggle', timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start', e(t(timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start')), `data-id="${e(timer.id)}" class="jbclock-center"`)}${timer.state === 'stopped' && left === timer.length ? '' : btn('jbclock-timer-plus', 'Add 1 Minute', icon('ic_plusone_normal'), `data-id="${e(timer.id)}" class="jbclock-corner right"`)}</div></div>`; }).join('')}<footer class="kdc-footer">${btn('jbclock-timer-add', 'Add Timer', '<img src="assets/kdc-ic_add.png" alt="">', 'class="kdc-add"')}</footer></div>`;
    }
    const time = now.toLocaleTimeString(locale, {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}), [hours, rest = ''] = time.split(/[:.]/), minutes = rest.replace(/\s?[^\d].*$/, ''), ampm = hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM';
    const world = worldClocks(state, now, {locale, hour24});
    const clockPage = `<div class="jbclock-clock${world ? ' has-cities' : ''}">${state.analog || `<div class="jbclock-time"><span class="jbclock-hours" data-clock-hours>${e(hours)}</span><span class="jbclock-minutes" data-clock-minutes>:${e(minutes)}</span>${ampm ? `<small data-clock-ampm>${ampm}</small>` : ''}</div>`}<div class="jbclock-date"><span data-clock-date>${e(date)}</span>${alarm ? `<span class="jbclock-next">${icon('ic_alarm_small')}${e(alarm)}</span>` : ''}</div>${world}<footer class="jbclock-footer clock-buttons kdc-clock-footer"><span></span>${btn('jbclock-cities', 'Cities', '<img src="assets/kdc-ic_globe.png" alt="">', 'class="kdc-round"')}${btn('jbclock-menu', 'More options', '<img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt="">')}</footer></div>`;
    const watch = state.stopwatch || {}, laps = watch.laps || [], running = watch.started != null, total = elapsed(watch, Date.now());
    const lapRows = laps.map((lapTotal, i) => ({n: i + 1, lap: lapTotal - (laps[i - 1] || 0), total: lapTotal})).reverse();
    const watchPage = `<div class="jbclock-stopwatch"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="stopwatch"></canvas><div class="jbclock-count stopwatch" data-count="stopwatch">${e(formatStopwatch(total))}</div>${running ? btn('jbclock-sw', 'Lap', icon('ic_lap_normal'), 'data-id="lap" class="jbclock-corner left"') : total ? btn('jbclock-sw', 'Reset', icon('ic_reset_normal'), 'data-id="reset" class="jbclock-corner left"') : ''}${btn('jbclock-sw', running ? 'Stop' : 'Start', e(t(running ? 'Stop' : 'Start')), 'data-id="toggle" class="jbclock-center"')}${total ? btn('jbclock-sw', 'Share', icon('ic_share_normal'), 'data-id="share" class="jbclock-corner right"') : ''}</div><ol class="jbclock-laps">${lapRows.map(row => `<li><span># ${row.n}</span><span>${e(formatStopwatch(row.lap))}</span><span>${e(formatStopwatch(row.total))}</span></li>`).join('')}</ol></div>`;
    return `<div class="app-view jbclock-app">${tabs}<div class="jbclock-pager" data-jbclock-swipe><div class="jbclock-track" style="transform:translateX(${-index * 100}%)"><section class="jbclock-page" aria-hidden="${tab !== 'alarm'}" ${tab !== 'alarm' ? 'inert' : ''}>${state.alarmPage || ''}</section><section class="jbclock-page" aria-hidden="${tab !== 'clock'}" ${tab !== 'clock' ? 'inert' : ''}>${clockPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'timer'}" ${tab !== 'timer' ? 'inert' : ''}>${timerPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'stopwatch'}" ${tab !== 'stopwatch' ? 'inert' : ''}>${watchPage}</section></div></div></div>`;
  }
  // Called every frame while the app is visible: updates counters and circles without re-rendering.
  function tick(root, state, now, t) {
    for (const timer of state.timers || []) {
      const left = remaining(timer, now), count = root.querySelector(`[data-count="timer:${CSS.escape(timer.id)}"]`);
      if (count && timer.state !== 'done') count.textContent = formatTimer(left);
      const canvas = root.querySelector(`[data-circle="timer:${CSS.escape(timer.id)}"]`);
      if (canvas) drawCircle(canvas, {mode: 'timer', interval: timer.length, current: timer.length - Math.max(0, left), running: timer.state !== 'stopped' || left !== timer.length});
    }
    const watch = state.stopwatch || {}, total = elapsed(watch, now), laps = watch.laps || [];
    const count = root.querySelector('[data-count="stopwatch"]'); if (count) count.textContent = formatStopwatch(total);
    const canvas = root.querySelector('[data-circle="stopwatch"]');
    if (canvas) { const first = laps[0] || 0, last = laps.at(-1) || 0; drawCircle(canvas, {mode: 'stopwatch', interval: first, current: laps.length ? total - last : 0, marker: laps.length > 1 ? laps.at(-1) - laps.at(-2) : -1, running: watch.started != null}); }
  }
  window.JBDeskClock = {TABS, setupDigits, setupTime, remaining, timerAction, formatTimer, formatStopwatch, elapsed, stopwatchAction, drawCircle, render, tick, cities, cityTime, cityWord};
})();

// ---- Android 4.4 DeskClock alarms over the pages above ----
/* Android 4.4 DeskClock alarms (packages/apps/DeskClock android-4.4.4_r1): AlarmClockFragment is the first tab.
   alarm_time.xml cards: the time in 48 sp sans-serif-light ("h:mm" + condensed bold am/pm, or "kk:mm"), an on/off
   Switch, and a collapse/expand strip (ic_expand_down / ic_expand_up, the label in grey and the days in bold white).
   Expanded: label (hint "Label"), Repeat checkbox and seven day toggles (Sunday first, short weekday names, the
   toggle_underline: 2 dp, 8 dp in from the sides, blue when on), ringtone (ic_ringtone) and Vibrate; the trash can
   sits top right. Red holo checkboxes. Footer: a 56 dp #606060 round add button and the overflow.
   AlarmUtils.showTimeEditDialog: the datetimepicker RadialTimePicker in its dark theme (#363636 header, #404040
   circle, #ff3333 selection, 60 sp time, Done). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  // Sunday-first display order; stored days use 0 = Monday ... 6 = Sunday (desk-clock.js).
  const ORDER = [6, 0, 1, 2, 3, 4, 5];
  const weekday = (index, locale, style) => new Date(2024, 0, 1 + index).toLocaleDateString(locale, {weekday: style}); // 2024-01-01 was a Monday
  function timeParts(time, hour24) {
    const [h, m] = time.split(':').map(Number);
    if (hour24) return {text: `${pad(h)}:${pad(m)}`, ampm: ''};
    return {text: `${h % 12 || 12}:${pad(m)}`, ampm: h < 12 ? 'AM' : 'PM'};
  }
  function daysText(alarm, t, locale) {
    if (!alarm.days.length) return '';
    if (alarm.days.length === 7) return t('Every day');
    return ORDER.filter(day => alarm.days.includes(day)).map(day => weekday(day, locale, 'short')).join(', ');
  }
  const check = on => `<img class="kdc-check" src="assets/kdc-btn_check_${on ? 'on' : 'off'}_holo_dark_red.png" alt="">`;
  function card(alarm, {expanded, t, locale, hour24}) {
    const time = timeParts(alarm.time, hour24), days = daysText(alarm, t, locale);
    const repeat = alarm.days.length > 0 || alarm.repeatOpen;
    const dayButtons = ORDER.map(day => `<button class="kdc-day${alarm.days.includes(day) ? ' on' : ''}" data-action="kdc-day" data-id="${alarm.id}:${day}" aria-pressed="${alarm.days.includes(day)}" aria-label="${e(weekday(day, locale, 'long'))}">${e(weekday(day, locale, 'short'))}</button>`).join('');
    const expandArea = expanded ? `<div class="kdc-expand"><button class="kdc-label${alarm.label ? ' set' : ''}" data-action="kdc-label" data-id="${alarm.id}">${e(alarm.label || t('Label'))}</button><button class="kdc-checkrow${repeat ? ' on' : ''}" data-action="kdc-repeat" data-id="${alarm.id}" role="checkbox" aria-checked="${repeat}">${check(repeat)}<span>${e(t('Repeat'))}</span></button>${repeat ? `<div class="kdc-days">${dayButtons}</div>` : ''}<div class="kdc-tone-row"><button class="kdc-tone" data-action="kdc-tone" data-id="${alarm.id}"><img src="assets/kdc-ic_ringtone.png" alt=""><span>${e(t(alarm.tone === 'Silent' ? 'Silent' : alarm.tone))}</span></button><button class="kdc-checkrow kdc-vibrate${alarm.vibrate ? ' on' : ''}" data-action="kdc-vibrate" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.vibrate}">${check(alarm.vibrate)}<span>${e(t('Vibrate'))}</span></button></div></div>` : '';
    return `<div class="kdc-alarm${expanded ? ' expanded' : ''}${alarm.enabled ? '' : ' off'}" data-alarm="${alarm.id}"><div class="kdc-top"><button class="kdc-time" data-action="kdc-time" data-id="${alarm.id}" aria-label="${e(time.text + (time.ampm ? ' ' + time.ampm : ''))}">${e(time.text)}${time.ampm ? `<b>${time.ampm}</b>` : ''}</button><button class="holo-switch kdc-switch ${alarm.enabled ? 'on' : ''}" data-action="alarm-toggle" data-id="${alarm.id}" role="switch" aria-checked="${alarm.enabled}" aria-label="${e(t('Turn alarm on'))}"><span class="switch-label" aria-hidden="true">${alarm.enabled ? 'ON' : 'OFF'}</span></button></div><div class="kdc-body">${expanded ? `<button class="kdc-delete" data-action="kdc-delete" data-id="${alarm.id}" aria-label="${e(t('Delete alarm'))}"><img src="assets/kdc-ic_delete_normal.png" alt=""></button>` : ''}${expandArea}<button class="kdc-strip" data-action="kdc-expand" data-id="${alarm.id}" aria-label="${e(t(expanded ? 'Collapse alarm' : 'Expand alarm'))}" aria-expanded="${expanded}"><img src="assets/kdc-ic_expand_${expanded ? 'up' : 'down'}.png" alt="">${expanded ? '' : `<span class="kdc-summary"><span class="kdc-summary-label">${e(alarm.label)}</span><span class="kdc-summary-days">${e(days)}</span></span>`}</button></div></div>`;
  }
  function page(alarms, {expandedId, t, locale, hour24, normalize}) {
    const list = alarms.map(normalize).sort((a, b) => a.time.localeCompare(b.time));
    const body = list.length ? list.map(alarm => card(alarm, {expanded: alarm.id === expandedId, t, locale, hour24})).join('') : `<div class="kdc-empty"><img src="assets/kdc-ic_noalarms.png" alt=""><span>${e(t('No Alarms'))}</span></div>`;
    return `<div class="kdc-page"><div class="kdc-list">${body}</div><footer class="kdc-footer"><button class="kdc-add" data-action="kdc-add" aria-label="${e(t('Add alarm'))}"><img src="assets/kdc-ic_add.png" alt=""></button><button class="kdc-menu" data-action="jbclock-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></footer></div>`;
  }
  /* RadialPickerLayout: hours on the outer ring (1-12; in 24 h mode 00 and 13-23 outside, 1-12 inside), then minutes in steps of 5;
     a tap or drag picks, and picking the hour moves on to the minutes. */
  function picker(state, {t, hour24}) {
    const {hour, minute, mode} = state;
    const showHour = hour24 ? pad(hour) : String(hour % 12 || 12);
    const R = 270 * ((globalThis.document?.querySelector?.('#screen')?.clientWidth || 326.16) / 360) / 2, numbersR = R * 0.82, innerR = R * 0.55;
    const values = mode === 'hour' ? (hour24 ? [...Array(12)].map((_, i) => ({v: i === 0 ? 0 : i + 12, label: i === 0 ? '00' : String(i + 12), r: numbersR})).concat([...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: innerR}))) : [...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: numbersR}))) : [...Array(12)].map((_, i) => ({v: i * 5, label: pad(i * 5), r: numbersR}));
    const current = mode === 'hour' ? (hour24 ? hour : hour % 12 || 12) : minute;
    const angleOf = v => mode === 'hour' ? ((v % 12) / 12) * 360 : (v / 60) * 360;
    const selR = mode === 'hour' && hour24 && hour >= 1 && hour <= 12 ? innerR : numbersR;
    const a = (angleOf(current) - 90) * Math.PI / 180;
    const sx = R + selR * Math.cos(a), sy = R + selR * Math.sin(a);
    const nums = values.map(item => { const ang = (angleOf(item.v) - 90) * Math.PI / 180; return `<span class="kdc-num${item.v === current ? ' sel' : ''}${item.r === innerR ? ' inner' : ''}" style="left:${(R + item.r * Math.cos(ang)).toFixed(2)}px;top:${(R + item.r * Math.sin(ang)).toFixed(2)}px">${item.label}</span>`; }).join('');
    return `<div class="settings-dialog-scrim" data-action="kdc-picker-cancel"></div><div class="kdc-picker" role="dialog" aria-label="${e(t('Time'))}"><div class="kdc-picker-header"><button class="${mode === 'hour' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="hour">${showHour}</button><span>:</span><button class="${mode === 'minute' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="minute">${pad(minute)}</button>${hour24 ? '' : `<button class="kdc-picker-ampm" data-action="kdc-picker-ampm">${hour < 12 ? 'AM' : 'PM'}</button>`}</div><div class="kdc-dial" data-kdc-dial style="width:${2 * R}px;height:${2 * R}px"><svg class="kdc-hand" viewBox="0 0 ${2 * R} ${2 * R}" aria-hidden="true"><circle cx="${R}" cy="${R}" r="2.7" fill="#ff3333"/><line x1="${R}" y1="${R}" x2="${sx.toFixed(2)}" y2="${sy.toFixed(2)}" stroke="#ff3333" stroke-width="1.8"/><circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="15.4" fill="#ff3333" fill-opacity=".4"/></svg>${nums}${hour24 ? '' : `<button class="kdc-dial-ampm left${hour < 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="am">AM</button><button class="kdc-dial-ampm right${hour >= 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="pm">PM</button>`}</div><button class="kdc-picker-done" data-action="kdc-picker-done">${e(t('Done'))}</button></div>`;
  }
  // Maps a point on the dial to a value, the way RadialPickerLayout.getDegreesFromCoords does.
  function pick(state, x, y, size, hour24) {
    const R = size / 2, dx = x - R, dy = y - R, dist = Math.hypot(dx, dy);
    let deg = Math.atan2(dx, -dy) * 180 / Math.PI; if (deg < 0) deg += 360;
    if (state.mode === 'hour') {
      let h = Math.round(deg / 30) % 12;
      if (hour24) { const inner = dist < R * 0.685; h = inner ? (h === 0 ? 12 : h) : (h === 0 ? 0 : h + 12); }
      else { const pm = state.hour >= 12; h = (h === 0 ? 12 : h) % 12 + (pm ? 12 : 0); }
      return {...state, hour: h};
    }
    return {...state, minute: Math.round(deg / 6) % 60};
  }
  window.KKDeskClock = {ORDER, timeParts, daysText, card, page, picker, pick};
})();
/* Clock (DeskClock 3.0 of KTU84P) in the 4.4.4 shell (docs/plans/engine-migration.md): the clock, alarm, timer and
   stopwatch pages and their swipe, the alarm cards and the time picker's dial (kk-deskclock.js), world cities, the
   settings and night mode (kk-clock-prefs.js), the alarms and timers that go off, the ringing alarm's snooze and
   dismiss, and Back, moved out of simulator.js. */
(() => {
  'use strict';
  let clockFrame = 0, clockSilenceTimer = 0;
  let kdcDialDrag = false;
  function scope(c) {
    const {clone, data, deviceDate, dp, i18n, messageDraft, navigateBrowser, nextAlarmLabel, openApp, overlayRoot, render, renderOverlay, renderStatus, safe, save, screen, toast, ui, viewport} = c;
    // 4.2 DeskClock pages; the alarm list and editor keep the ICS AlarmClock/SetAlarm screens.
    const jbClockState = () => { data.jbClock ||= {tab: 'clock', timers: [], stopwatch: {accumulated: 0, started: null, laps: []}}; return {...data.jbClock, timerDigits: ui.timerDigits || '', timerSetup: !!ui.timerSetup}; };
    // DeskClock's settings (clock-prefs): the analog style and the Home clock reach the clock page through its state.
    const clockExtras = state => ({...state, home: ClockPrefs.home(data, Date.now(), i18n.locale()), analog: ClockPrefs.prefs(data).style === 'analog' ? ClockPrefs.analog(deviceDate()) : ''});
    function renderClock() {
      if (ui.sub === 'clock-settings') return ClockPrefs.settings({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      if (ui.sub === 'night') return ClockPrefs.night({data, ui, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'})});
      if (ui.sub === 'cities') return JBDeskClock.cities({...jbClockState(), cityQuery: ui.cityQuery}, key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, words: {title: i18n.t('Cities'), selected: JBDeskClock.cityWord?.('Selected Cities', i18n.locale()) || i18n.t('Selected Cities')}});
      const clockState = {...jbClockState(), alarmPage: KKDeskClock.page(data.alarms, {expandedId: ui.kdcExpanded, t: key => i18n.t(key), locale: i18n.locale(), hour24: !!data.settings.hour24, normalize: ICSDeskClock.normalize})};
      return JBDeskClock.render(clockExtras(clockState), key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, alarm: nextAlarmLabel(), date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale())});
    }
    function clockTicker() {
      cancelAnimationFrame(clockFrame);
      const step = () => {
        const root = viewport.querySelector('.jbclock-app');
        if (!root || ui.view !== 'clock') return;
        JBDeskClock.tick(root, data.jbClock, Date.now(), key => i18n.t(key));
        clockFrame = requestAnimationFrame(step);
      };
      clockFrame = requestAnimationFrame(step);
    }
    // TimerReceiver: a finished timer posts "Time's up" and shows its alert in the Timer page.
    function checkTimers() {
      const now = Date.now();
      for (const timer of data.jbClock?.timers || []) {
        if (timer.state !== 'running' || JBDeskClock.remaining(timer, now) > 0) continue;
        Object.assign(timer, {state: 'done', left: 0, started: null});
        data.notifications.unshift({id: now + data.notifications.length, title: i18n.t("Time's up"), detail: i18n.t('Timer'), kind: 'timer'}); save();
        renderStatus(); if (ui.overlay === 'shade') renderOverlay();
        if (ui.view === 'clock') { data.jbClock.tab = 'timer'; render(); }
        toast("Time's up");
      }
    }
    // Label and ringtone edits from a 4.4 alarm card go straight into that alarm.
    function kdcCommit() {
      if (!ui.kdcEditing) return;
      const alarm = data.alarms.find(item => item.id === ui.kdcEditing);
      if (alarm) { alarm.label = ui.alarmDraft.label; alarm.tone = ui.alarmDraft.tone; save(); }
      ui.kdcEditing = null; ui.alarmDraft = null;
    }
    function checkAlarms(now) {
      if(ui.overlay==='clock-ringing')return;
      const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
      if(!alarm)return;
      alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
      delete alarm.snoozedUntil;
      if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
      ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
      // Silence after: an alarm left ringing stops by itself.
      clearTimeout(clockSilenceTimer); { const after = Number(ClockPrefs.prefs(data).silence), ringing = ui.ringingAlarm; if (after > 0) clockSilenceTimer = setTimeout(() => { if (ui.overlay === 'clock-ringing' && ui.ringingAlarm === ringing) { ui.overlay = ''; render(); } }, after * 60000); }
    }
    const kdcDialPick = event => { const dial = overlayRoot.querySelector('[data-kdc-dial]'); if (!dial || !ui.kdcPicker) return; const r = dial.getBoundingClientRect(); ui.kdcPicker = KKDeskClock.pick(ui.kdcPicker, (event.clientX - r.left) * dial.offsetWidth / r.width, (event.clientY - r.top) * dial.offsetHeight / r.height, dial.offsetWidth, !!data.settings.hour24); renderOverlay(); };
    return {
      render() {
        return renderClock();
      },
      mount(root) {
        if (ui.view === 'clock' && viewport.querySelector('.jbclock-app')) clockTicker();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (action.startsWith('cpref-') && ui.view === 'clock') {
          const result = ClockPrefs.handle(action, id, {data, ui});
          if (['cpref-main', 'jbclock-cities-menu'].includes(ui.overlay)) { ui.overlay = ''; renderOverlay(); }
          if (result === 'save') save();
          if (result?.open) { openApp('chrome'); navigateBrowser(result.open); return; }
          if (result) { render(); return; }
        }
        switch (action) {
          case 'clock-alarms': jbClockState(); data.jbClock.tab='alarm'; save(); ui.sub=''; render(); break;
          case 'kdc-add': { const now=deviceDate(); ui.kdcPicker={id:null,hour:now.getHours(),minute:now.getMinutes(),mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
          case 'kdc-time': { const alarm=ICSDeskClock.normalize(data.alarms.find(item=>item.id===Number(id))); const [h,m]=alarm.time.split(':').map(Number); ui.kdcPicker={id:alarm.id,hour:h,minute:m,mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
          case 'kdc-picker-mode': ui.kdcPicker.mode=id; renderOverlay(); break;
          case 'kdc-picker-ampm': { const p=ui.kdcPicker; const pm=id?id==='pm':p.hour<12; p.hour=p.hour%12+(pm?12:0); renderOverlay(); break; }
          case 'kdc-picker-cancel': ui.kdcPicker=null; ui.overlay=''; renderOverlay(); break;
          case 'kdc-picker-done': {
            // AlarmClockFragment.onTimeSet: an edited alarm is switched on; a new one is added, enabled and expanded.
            const p=ui.kdcPicker, time=`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}`;
            if(p.id){const alarm=data.alarms.find(item=>item.id===p.id); if(alarm){alarm.time=time;alarm.enabled=true;delete alarm.snoozedUntil;}}
            else{const alarm=ICSDeskClock.normalize({time,enabled:true});alarm.id=Date.now();data.alarms.push(alarm);ui.kdcExpanded=alarm.id;}
            save(); ui.kdcPicker=null; ui.overlay=''; render(); toast('Alarm set'); break;
          }
          case 'kdc-expand': ui.kdcExpanded=ui.kdcExpanded===Number(id)?null:Number(id); render(); break;
          case 'kdc-repeat': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; const days=ICSDeskClock.normalize(alarm).days; alarm.days=days.length?[]:[0,1,2,3,4,5,6]; save(); render(); break; }
          case 'kdc-day': { const [alarmId,day]=id.split(':').map(Number); const alarm=data.alarms.find(item=>item.id===alarmId); if(!alarm)break; const days=new Set(ICSDeskClock.normalize(alarm).days); days.has(day)?days.delete(day):days.add(day); alarm.days=[...days].sort(); save(); render(); break; }
          case 'kdc-vibrate': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; alarm.vibrate=!ICSDeskClock.normalize(alarm).vibrate; save(); render(); break; }
          case 'kdc-label': case 'kdc-tone': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; ui.alarmDraft=ICSDeskClock.normalize(alarm); ui.kdcEditing=alarm.id; ui.overlay=action==='kdc-label'?'clock-label':'clock-tone'; renderOverlay(); break; }
          case 'kdc-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==Number(id)); if(ui.kdcExpanded===Number(id))ui.kdcExpanded=null; save(); render(); toast('Alarm deleted'); break;
          case 'jbclock-tab': jbClockState(); data.jbClock.tab = id; save(); render(); break;
          case 'jbclock-key': ui.timerDigits = JBDeskClock.setupDigits(ui.timerDigits || '', id); render(); break;
          case 'jbclock-setup-cancel': ui.timerSetup = false; ui.timerDigits = ''; render(); break;
          case 'jbclock-setup-start': { const time = JBDeskClock.setupTime(ui.timerDigits || ''); if (!time.ms) break; jbClockState(); data.jbClock.timers.push({id: `t${Date.now()}`, length: time.ms, left: time.ms, started: Date.now(), state: 'running', label: ''}); ui.timerSetup = false; ui.timerDigits = ''; save(); render(); break; }
          case 'jbclock-timer-add': ui.timerSetup = true; ui.timerDigits = ''; render(); break;
          case 'jbclock-timer-toggle': case 'jbclock-timer-plus': { const timers = jbClockState() && data.jbClock.timers, index = timers.findIndex(timer => timer.id === id); if (index < 0) break; timers[index] = JBDeskClock.timerAction(timers[index], action === 'jbclock-timer-plus' ? 'plus' : 'toggle', Date.now()); save(); render(); break; }
          case 'jbclock-timer-delete': jbClockState(); data.jbClock.timers = data.jbClock.timers.filter(timer => timer.id !== id); save(); render(); break;
          case 'jbclock-sw': {
            jbClockState();
            if (id === 'share') {
              const watch = data.jbClock.stopwatch, laps = watch.laps || [], total = JBDeskClock.elapsed(watch, Date.now());
              const text = [`${i18n.t('Stopwatch')}: ${JBDeskClock.formatStopwatch(total)}`, ...laps.map((lap, i) => `# ${i + 1}  ${JBDeskClock.formatStopwatch(lap - (laps[i - 1] || 0))}`)].join('\n');
              openApp('hangouts'); ui.sub = 'new'; messageDraft().body = text; save(); render(); break;
            }
            data.jbClock.stopwatch = JBDeskClock.stopwatchAction(data.jbClock.stopwatch, id, Date.now()); save(); render(); break;
          }
          case 'jbclock-menu': ui.overlay = 'cpref-main'; renderOverlay(); break;
          // CitiesActivity: the chosen cities are kept in the clock state; the list keeps its place while ticking them.
          case 'jbclock-cities': ui.cityQuery = undefined; ui.sub = 'cities'; ui.overlay = ''; render(); break;
          case 'jbclock-city': { const list = viewport.querySelector('.jbclock-city-list'), top = list?.scrollTop || 0; jbClockState(); const chosen = data.jbClock.cities ||= []; const at = chosen.indexOf(id); if (at >= 0) chosen.splice(at, 1); else chosen.push(id); save(); render(); const after = viewport.querySelector('.jbclock-city-list'); if (after) after.scrollTop = top; break; }
          case 'jbclock-city-search': ui.cityQuery = ''; render(); viewport.querySelector('[data-city-search]')?.focus(); break;
          case 'jbclock-cities-menu': ui.overlay = 'jbclock-cities-menu'; renderOverlay(); break;
          case 'jbclock-city-sort': jbClockState(); data.jbClock.citySort = data.jbClock.citySort === 'time' ? 'name' : 'time'; save(); ui.overlay = ''; renderOverlay(); render(); break;

          case 'alarm-snooze': {
            const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
            if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+ClockPrefs.prefs(data).snooze*60000;save();}
            ui.overlay='';render();{const message=ICSDeskClock.snoozeMessage(new Date(alarm?.snoozedUntil||deviceDate().getTime()+ClockPrefs.prefs(data).snooze*60000),{hour24:!!data.settings.hour24,locale:i18n.locale()});if(message)toast(message);}break;
          }
          case 'alarm-dismiss': ui.overlay=''; render(); break;
          case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        switch (form.dataset.form) {
          case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';kdcCommit();render();break;
          case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';kdcCommit();render();break;
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.matches?.('[data-city-search]')) { ui.cityQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-city-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return true; }
        if (event.target.matches?.('[data-cpref-volume]')) { ui.clockDraft = Number(event.target.value); return true; }
        return false;
      },
      overlay() {
        if (ui.overlay === 'kdc-picker' && ui.kdcPicker) {
          overlayRoot.innerHTML = KKDeskClock.picker(ui.kdcPicker, {t: key => i18n.t(key), hour24: !!data.settings.hour24});
        } else if (ui.overlay === 'jbclock-cities-menu' || ui.overlay === 'cpref-main') {
          const items = ClockPrefs.menu(ui.overlay === 'cpref-main' ? 'main' : 'cities', {data, t: key => i18n.t(key), locale: i18n.locale(), tab: jbClockState().tab});
          overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${items.map(([action, id, label]) => `<button data-action="${action}" data-id="${id}">${safe(label)}</button>`).join('')}</div>`;
        } else if (ui.overlay.startsWith('clock-')) {
          overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key),{hour24:!!data.settings.hour24,locale:i18n.locale(),now:deviceDate()});
          if(ui.overlay==='clock-ringing')ICSDeskClock.bindRinging?.(overlayRoot);
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'clock' && !ui.overlay && ClockPrefs.back(ui)) { render(); return true; }
        if (ui.view === 'clock' && ui.sub === 'cities' && ui.cityQuery !== undefined && !ui.overlay) { ui.cityQuery = undefined; render(); return true; }
        if (ui.view === 'clock' && ui.sub === 'cities') { ui.sub = ''; render(); return true; }
        return false;
      },
      listener0: event => { if (!event.target.closest('[data-kdc-dial]') || event.target.closest('button')) return; kdcDialDrag = true; event.preventDefault(); kdcDialPick(event); },
      listener1: event => { if (kdcDialDrag) kdcDialPick(event); },
      listener2: () => { if (!kdcDialDrag) return; kdcDialDrag = false; if (ui.kdcPicker?.mode === 'hour') { ui.kdcPicker.mode = 'minute'; setTimeout(renderOverlay, 120); } },
      init() {
        overlayRoot.addEventListener('pointerdown', (...args) => scope(c).listener0(...args));
        window.addEventListener('pointermove', (...args) => scope(c).listener1(...args));
        window.addEventListener('pointerup', (...args) => scope(c).listener2(...args));
      },
      gestureMove(event, dx, dy) {
        if((c.pointerStart.clockSwiping || ui.view==='clock' && !ui.sub && !ui.overlay && c.pointerStart.target.closest('[data-jbclock-swipe]') && Math.abs(dx)>dp(13) && Math.abs(dx)>Math.abs(dy)*1.2)) {
          c.pointerStart.clockSwiping=true;c.suppressClickUntil=Date.now()+350;event.preventDefault();
          try{screen.setPointerCapture(event.pointerId);}catch{}
          const track=viewport.querySelector('.jbclock-track'),index=JBDeskClock.TABS.indexOf(data.jbClock?.tab||'clock');
          if(track){track.style.transition='none';track.style.transform=`translateX(calc(${-index*100}% + ${dx}px))`;}return true;
        }
        return false;
      },
      gestureUp(event, dx, dy) {
        if(c.pointerStart.clockSwiping){const tabs=JBDeskClock.TABS,index=tabs.indexOf(data.jbClock?.tab||'clock'),next=Math.max(0,Math.min(tabs.length-1,index+(Math.abs(dx)>dp(50)?(dx<0?1:-1):0)));data.jbClock.tab=tabs[next];save();render();c.suppressClickUntil=Date.now()+350;c.pointerStart=null;return true;}
        return false;
      },
      second(now) {
        checkAlarms(now);
        checkTimers();
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    mount: (c, root) => scope(c).mount(root),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back(),
    init: c => scope(c).init(),
    gestureMove: (event, dx, dy, c) => scope(c).gestureMove(event, dx, dy),
    gestureUp: (event, dx, dy, c) => scope(c).gestureUp(event, dx, dy),
    second: (now, c) => scope(c).second(now)
  };
  if (window.KK) for (const id of ['clock']) KK.register(id, spec);
})();
