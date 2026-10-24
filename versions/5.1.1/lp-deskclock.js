/* Android 5.1 DeskClock 3.0.4 (DeskClockGoogle, LMY48Y): Alarm | Clock | Timer | Stopwatch pages over the hour colour,
   desk_clock.xml's footer (left button, the 56 dp hot_pink fab, right button), world clock and alarm cards. */
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

  // now is the simulated wall clock for the Clock page; timers and the stopwatch run on real elapsed time.
  // Utils.BACKGROUND_SPECTRUM: the app's background follows the hour of the day.
  const SPECTRUM = ['#212121', '#27232e', '#2d253a', '#332847', '#382a53', '#3e2c5f', '#442e6c', '#393a7a', '#2e4687', '#235395', '#185fa2', '#0d6baf', '#0277bd', '#0d6cb1', '#1861a6', '#23569b', '#2d4a8f', '#383f84', '#433478', '#3d3169', '#382e5b', '#322b4d', '#2c273e', '#272430'];
  /* World clock (DeskClock 3.0.4): the cities of cities.xml (dc-cities.js, in this image's languages). The Clock page
     lists the chosen cities one to a row (world_clock_item: the 14 sp medium name and "/ day" in white_69p at the start,
     the thin 56 sp "h:mm a" time at the end); CitiesActivity shows "Selected Cities" (20 sp) first, then every city as
     city_list_item: the 56 dp index column with the first letter of each group, the check box, the 14 sp medium name
     and the time in white_69p. Its menu is Search, the sort item, Settings and Help. */
  const CITY_WORDS = {"Cities": {"en": "Cities", "hu": "Városok", "de": "Städte", "fr": "Villes", "es": "Ciudades"}, "Sort by time": {"en": "Sort by time", "hu": "Rendezés idő szerint", "de": "Zeitlich sortieren", "fr": "Trier par heure", "es": "Ordenar por hora"}, "Sort by name": {"en": "Sort by name", "hu": "Rendezés név szerint", "de": "Nach Namen sortieren", "fr": "Trier par nom", "es": "Ordenar por nombre"}, "Selected Cities": {"en": "Selected Cities", "hu": "Kiválasztott városok", "de": "Ausgewählte Städte", "fr": "Villes sélectionnées", "es": "Ciudades seleccionadas"}};
  const cityWord = (key, locale) => (CITY_WORDS[key] || {})[String(locale).slice(0, 2)] || key;
  const LANG_COL = {en: 2, hu: 3, de: 4, fr: 5, es: 6};
  const city = id => (window.DeskClockCities || []).find(row => row[0] === id);
  const cityName = (row, locale) => row[LANG_COL[String(locale).slice(0, 2)] || 2];
  // An id the time zone database does not know falls back to GMT, as TimeZone does.
  const zone = tz => { try { new Intl.DateTimeFormat('en-US', {timeZone: tz}); return tz; } catch { return 'UTC'; } };
  function cityTime(tz, now, hour24, locale) {
    tz = zone(tz);
    const parts = Object.fromEntries(new Intl.DateTimeFormat(locale, {timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: !hour24}).formatToParts(now).map(p => [p.type, p.value]));
    const day = d => new Intl.DateTimeFormat('en-US', {timeZone: d, weekday: 'short'}).format(now);
    const local = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(now).find(x => x.type === 'timeZoneName')?.value || 'GMT', m = p.match(/([+-])(\d+):?(\d*)/);
    return {hours: hour24 ? String(parts.hour).padStart(2, '0') : parts.hour, minutes: parts.minute, ampm: hour24 ? '' : parts.dayPeriod || '',
      day: day(tz) === day(local) ? '' : new Intl.DateTimeFormat(locale, {timeZone: tz, weekday: 'short'}).format(now), offset: m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0};
  }
  const stamp = c => `${c.hours}:${c.minutes}${c.ampm ? ' ' + c.ampm : ''}`;
  function worldClocks(state, now, {locale, hour24}) {
    // The Home clock (clock-prefs) leads the list while the phone is away from the home time zone.
    const rows = [...(state.home ? [['home', state.home.zone, ...Array(8).fill(state.home.label)]] : []), ...(state.cities || []).map(city).filter(Boolean)];
    return rows.length ? `<div class="lpdc-world">${rows.map(row => { const c = cityTime(row[1], now, hour24, locale); return `<div class="lpdc-city"><span class="lpdc-city-label"><b>${e(cityName(row, locale))}</b>${c.day ? `<em>/ ${e(c.day)}</em>` : ''}</span><span class="lpdc-city-time">${e(stamp(c))}</span></div>`; }).join('')}</div>` : '';
  }
  function cities(state, t, {locale, now, hour24}) {
    const chosen = new Set(state.cities || []), all = (window.DeskClockCities || []).map(row => ({row, name: cityName(row, locale), time: cityTime(row[1], now, hour24, locale)}));
    const byName = (a, b) => a.name.localeCompare(b.name, locale);
    const sorted = all.sort(state.citySort === 'time' ? (a, b) => a.time.offset - b.time.offset || byName(a, b) : byName);
    let letter = '';
    const item = (c, index) => `<button type="button" class="lpdc-city-item" data-action="jbclock-city" data-id="${e(c.row[0])}" role="checkbox" aria-checked="${chosen.has(c.row[0])}"><span class="lpdc-city-index">${e(index)}</span><i class="lpdc-check${chosen.has(c.row[0]) ? ' on' : ''}"></i><b>${e(c.name)}</b><small>${e(stamp(c.time))}</small></button>`;
    // CitiesActivity's filter: names that start with the SearchView's text; the selected cities only while it is empty.
    const query = String(state.cityQuery || '').trim().toLocaleUpperCase(locale), shown = query ? sorted.filter(c => c.name.toLocaleUpperCase(locale).startsWith(query)) : sorted;
    const selected = query ? [] : sorted.filter(c => chosen.has(c.row[0]));
    const list = (selected.length ? `<h4 class="lpdc-city-header">${e(cityWord('Selected Cities', locale))}</h4>${selected.map(c => item(c, '')).join('')}` : '')
      + shown.map(c => { const first = state.citySort === 'time' ? '' : c.name.charAt(0).toLocaleUpperCase(locale); const show = first !== letter; letter = first; return item(c, show ? first : ''); }).join('');
    return `<div class="app-view jbclock-app lpdc lpdc-cities" style="--dc:${SPECTRUM[now.getHours()]}"><header class="lpdc-ab"><button type="button" class="lpdc-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button>${state.cityQuery !== undefined ? `<input class="lpdc-city-search" type="search" data-city-search value="${e(state.cityQuery)}" aria-label="${e(t('Search'))}" autocomplete="off">` : `<h2>${e(cityWord('Cities', locale))}</h2><button type="button" class="lpdc-ab-btn" data-action="jbclock-city-search" aria-label="${e(t('Search'))}"><img src="assets/dc5-ic_menu_search.png" alt=""></button>`}<button type="button" class="lpdc-ab-btn" data-action="jbclock-cities-menu" aria-label="${e(t('More options'))}"><img src="assets/dc5-ic_overflow.png" alt=""></button></header><div class="jbclock-city-list lpdc-city-list">${list}</div></div>`;
  }
  function render(state, t, {locale, now, hour24, alarm, date}) {
    const tab = TABS.includes(state.tab) ? state.tab : 'clock', index = TABS.indexOf(tab);
    const btn = (action, label, body, extra = '') => `<button type="button" data-action="${action}" aria-label="${e(t(label))}" ${extra}>${body}</button>`;
    // DeskClock 3.0.4's own drawables (dc5-*): ic_delete, ic_lap, ic_reset, ic_share and ic_plusone have no _normal state.
    const icon = name => `<img src="assets/dc5-${({ic_delete_normal: 'ic_delete', ic_lap_normal: 'ic_lap', ic_reset_normal: 'ic_reset', ic_share_normal: 'ic_share', ic_plusone_normal: 'ic_plusone'})[name] || name}.png" alt="">`;
    // DeskClock 5.1: the ic_tab_* icons in the action bar over the hour colour, the overflow at its end.
    const tabs = `<header class="jbclock-tabs" role="tablist">${TABS.map(name => `<button role="tab" data-action="jbclock-tab" data-id="${name}" aria-selected="${name === tab}" aria-label="${e(t(name === 'alarm' ? 'Alarm' : name === 'timer' ? 'Timer' : name === 'clock' ? 'Clock' : 'Stopwatch'))}" class="${name === tab ? 'active' : ''}"><img src="assets/dc5-ic_tab_${name}_${name === tab ? 'activated' : 'normal'}.png" alt=""></button>`).join('')}<button class="lpdc-overflow" data-action="jbclock-menu" aria-label="${e(t('More options'))}"><img src="assets/dc5-ic_overflow.png" alt=""></button></header>`;
    // Timer page: setup keypad when there are no timers or a new one is being added.
    const timers = state.timers || [];
    let timerPage;
    if (!timers.length || state.timerSetup) {
      const time = setupTime(state.timerDigits || ''), active = (state.timerDigits || '').length;
      const digit = (value, on) => `<span class="${on ? 'on' : ''}">${value}</span>`;
      const [uh, um, us] = units(locale);
      timerPage = `<div class="jbclock-setup"><div class="jbclock-setup-display" aria-live="polite" data-no-translate>${digit(time.h, active >= 5)}<small>${e(uh)}</small>${digit(pad(time.m)[0], active >= 4)}${digit(pad(time.m)[1], active >= 3)}<small>${e(um)}</small>${digit(pad(time.s)[0], active >= 2)}${digit(pad(time.s)[1], active >= 1)}<small>${e(us)}</small>${btn('jbclock-key', 'Delete', icon(active ? 'ic_backspace_normal' : 'ic_backspace_disabled'), `data-id="back" class="jbclock-backspace" ${active ? '' : 'disabled'}`)}</div><div class="jbclock-keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map(key => key ? btn('jbclock-key', key, key, `data-id="${key}"`) : '<span></span>').join('')}</div><footer class="jbclock-footer">${timers.length ? btn('jbclock-setup-cancel', 'Cancel', e(t('Cancel'))) : ''}${btn('jbclock-setup-start', 'Start', e(t('Start')), time.ms ? '' : 'disabled')}</footer></div>`;
    } else {
      timerPage = `<div class="jbclock-timers">${timers.map(timer => { const left = remaining(timer, Date.now()); return `<div class="jbclock-timer${timer.state === 'done' ? ' done' : ''}" data-timer="${e(timer.id)}"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="timer:${e(timer.id)}"></canvas><div class="jbclock-count" data-count="timer:${e(timer.id)}">${e(timer.state === 'done' ? t("Time's up") : formatTimer(left))}</div><div class="jbclock-label">${icon('ic_label_normal')}${e(timer.label || '')}</div>${btn('jbclock-timer-delete', 'Delete', icon('ic_delete_normal'), `data-id="${e(timer.id)}" class="jbclock-corner left"`)}${btn('jbclock-timer-toggle', timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start', e(t(timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start')), `data-id="${e(timer.id)}" class="jbclock-center"`)}${timer.state === 'stopped' && left === timer.length ? '' : btn('jbclock-timer-plus', 'Add 1 Minute', icon('ic_plusone_normal'), `data-id="${e(timer.id)}" class="jbclock-corner right"`)}</div></div>`; }).join('')}<footer class="kdc-footer">${btn('jbclock-timer-add', 'Add Timer', '<img src="assets/dc5-ic_add_timer.png" alt="">', 'class="kdc-add"')}</footer></div>`;
    }
    const time = now.toLocaleTimeString(locale, {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}), [hours, rest = ''] = time.split(/[:.]/), minutes = rest.replace(/\s?[^\d].*$/, ''), ampm = hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM';
    const world = worldClocks(state, now, {locale, hour24});
    const clockPage = `<div class="jbclock-clock${world ? ' has-cities' : ''}">${state.analog || `<div class="jbclock-time"><span class="jbclock-hours" data-clock-hours>${e(hours)}</span><span class="jbclock-minutes" data-clock-minutes>:${e(minutes)}</span>${ampm ? `<small data-clock-ampm>${ampm}</small>` : ''}</div>`}<div class="jbclock-date"><span data-clock-date>${e(date)}</span>${alarm ? `<span class="jbclock-next">${icon('ic_alarm_small')}${e(alarm)}</span>` : ''}</div>${world}<footer class="jbclock-footer clock-buttons kdc-clock-footer"><span></span>${btn('jbclock-cities', 'Cities', '<img src="assets/dc5-ic_globe.png" alt="">', 'class="kdc-round"')}${btn('jbclock-menu', 'More options', '<img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt="">')}</footer></div>`;
    const watch = state.stopwatch || {}, laps = watch.laps || [], running = watch.started != null, total = elapsed(watch, Date.now());
    const lapRows = laps.map((lapTotal, i) => ({n: i + 1, lap: lapTotal - (laps[i - 1] || 0), total: lapTotal})).reverse();
    const watchPage = `<div class="jbclock-stopwatch"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="stopwatch"></canvas><div class="jbclock-count stopwatch" data-count="stopwatch">${e(formatStopwatch(total))}</div>${running ? btn('jbclock-sw', 'Lap', icon('ic_lap_normal'), 'data-id="lap" class="jbclock-corner left"') : total ? btn('jbclock-sw', 'Reset', icon('ic_reset_normal'), 'data-id="reset" class="jbclock-corner left"') : ''}${btn('jbclock-sw', running ? 'Stop' : 'Start', e(t(running ? 'Stop' : 'Start')), 'data-id="toggle" class="jbclock-center"')}${total ? btn('jbclock-sw', 'Share', icon('ic_share_normal'), 'data-id="share" class="jbclock-corner right"') : ''}</div><ol class="jbclock-laps">${lapRows.map(row => `<li><span># ${row.n}</span><span>${e(formatStopwatch(row.lap))}</span><span>${e(formatStopwatch(row.total))}</span></li>`).join('')}</ol></div>`;
    // The DeskClock 5.1 footer: the 56 dp hot pink (#FF4081) FAB in the middle with the page's action, borderless
    // buttons on either side (timer: delete and add; stopwatch: reset and lap or share).
    const fab = (action, label, name, id = '', disabled = false) => `<button class="lpdc-fab" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(t(label))}"${disabled ? ' disabled' : ''}><img src="assets/dc5-ic_fab_${name}.png" alt=""></button>`;
    const side = (action, label, img, id = '') => `<button class="lpdc-side" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(t(label))}"><img src="assets/dc5-${img}.png" alt=""></button>`;
    const firstTimer = timers[0], setupMode = !timers.length || state.timerSetup;
    const footer = tab === 'alarm' ? ['', fab('kdc-add', 'Add alarm', 'plus'), '']
      : tab === 'clock' ? ['', `<button class="lpdc-fab" data-action="jbclock-cities" aria-label="${e(t('Cities'))}"><img src="assets/dc5-ic_globe.png" alt=""></button>`, '']
      : tab === 'timer' ? (setupMode ? [timers.length ? side('jbclock-setup-cancel', 'Cancel', 'ic_delete') : '', fab('jbclock-setup-start', 'Start', 'play', '', !setupTime(state.timerDigits || '').ms), ''] : [side('jbclock-timer-delete', 'Delete', 'ic_delete', firstTimer.id), fab('jbclock-timer-toggle', firstTimer.state === 'running' ? 'Stop' : firstTimer.state === 'done' ? 'Stop' : 'Start', firstTimer.state === 'running' ? 'pause' : firstTimer.state === 'done' ? 'stop' : 'play', firstTimer.id), side('jbclock-timer-add', 'Add Timer', 'ic_add_timer')])
      : [!running && total ? side('jbclock-sw', 'Reset', 'ic_reset', 'reset') : '', fab('jbclock-sw', running ? 'Stop' : 'Start', running ? 'pause' : 'play', 'toggle'), running ? side('jbclock-sw', 'Lap', 'ic_lap', 'lap') : total ? side('jbclock-sw', 'Share', 'ic_share', 'share') : ''];
    return `<div class="app-view jbclock-app lpdc" style="--dc:${SPECTRUM[now.getHours()]}">${tabs}<div class="jbclock-pager" data-jbclock-swipe><div class="jbclock-track" style="transform:translateX(${-index * 100}%)"><section class="jbclock-page" aria-hidden="${tab !== 'alarm'}" ${tab !== 'alarm' ? 'inert' : ''}>${state.alarmPage || ''}</section><section class="jbclock-page" aria-hidden="${tab !== 'clock'}" ${tab !== 'clock' ? 'inert' : ''}>${clockPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'timer'}" ${tab !== 'timer' ? 'inert' : ''}>${timerPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'stopwatch'}" ${tab !== 'stopwatch' ? 'inert' : ''}>${watchPage}</section></div></div><footer class="lpdc-footer"><span>${footer[0]}</span><span>${footer[1]}</span><span>${footer[2]}</span></footer></div>`;
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
  window.JBDeskClock = {SPECTRUM, TABS, setupDigits, setupTime, remaining, timerAction, formatTimer, formatStopwatch, elapsed, stopwatchAction, drawCircle, render, tick, cities, cityTime, cityWord};
})();

// ---- DeskClock alarms over the pages above ----
/* DeskClock alarms (AOSP DeskClock android-5.1.1_r26 / Google DeskClock 3.0.4): AlarmClockFragment is the first tab.
   alarm_time.xml on the hour colour: the 56 sp thin time with the Material switch, the summary (label, days) and the
   expand arrow; expanded, the Repeat checkbox and seven round day toggles, ringtone, Vibrate, label and delete. The
   hot pink FAB adds an alarm. The time picker is the framework Material TimePickerDialog in the app's accent. */
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
  // DeskClock 5.1: Material checkboxes and switches in the hot pink accent (lp-deskclock.css).
  const check = on => `<span class="lp-check kdc-check${on ? ' on' : ''}" aria-hidden="true"></span>`;
  function card(alarm, {expanded, t, locale, hour24}) {
    const time = timeParts(alarm.time, hour24), days = daysText(alarm, t, locale);
    const repeat = alarm.days.length > 0 || alarm.repeatOpen;
    const dayButtons = ORDER.map(day => `<button class="kdc-day${alarm.days.includes(day) ? ' on' : ''}" data-action="kdc-day" data-id="${alarm.id}:${day}" aria-pressed="${alarm.days.includes(day)}" aria-label="${e(weekday(day, locale, 'long'))}">${e(weekday(day, locale, 'narrow'))}</button>`).join('');
    const expandArea = expanded ? `<div class="kdc-expand"><button class="kdc-label${alarm.label ? ' set' : ''}" data-action="kdc-label" data-id="${alarm.id}">${e(alarm.label || t('Label'))}</button><button class="kdc-checkrow${repeat ? ' on' : ''}" data-action="kdc-repeat" data-id="${alarm.id}" role="checkbox" aria-checked="${repeat}">${check(repeat)}<span>${e(t('Repeat'))}</span></button>${repeat ? `<div class="kdc-days">${dayButtons}</div>` : ''}<div class="kdc-tone-row"><button class="kdc-tone" data-action="kdc-tone" data-id="${alarm.id}"><img src="assets/dc5-ic_ringtone.png" alt=""><span>${e(t(alarm.tone === 'Silent' ? 'Silent' : alarm.tone))}</span></button><button class="kdc-checkrow kdc-vibrate${alarm.vibrate ? ' on' : ''}" data-action="kdc-vibrate" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.vibrate}">${check(alarm.vibrate)}<span>${e(t('Vibrate'))}</span></button></div></div>` : '';
    return `<div class="kdc-alarm${expanded ? ' expanded' : ''}${alarm.enabled ? '' : ' off'}" data-alarm="${alarm.id}"><div class="kdc-top"><button class="kdc-time" data-action="kdc-time" data-id="${alarm.id}" aria-label="${e(time.text + (time.ampm ? ' ' + time.ampm : ''))}">${e(time.text)}${time.ampm ? `<b>${time.ampm}</b>` : ''}</button><button class="lp-mswitch kdc-switch${alarm.enabled ? ' on' : ''}" data-action="alarm-toggle" data-id="${alarm.id}" role="switch" aria-checked="${alarm.enabled}" aria-label="${e(t('Turn alarm on'))}"></button></div><div class="kdc-body">${expanded ? `<button class="kdc-delete" data-action="kdc-delete" data-id="${alarm.id}" aria-label="${e(t('Delete alarm'))}"><img src="assets/dc5-ic_delete.png" alt=""></button>` : ''}${expandArea}<button class="kdc-strip" data-action="kdc-expand" data-id="${alarm.id}" aria-label="${e(t(expanded ? 'Collapse alarm' : 'Expand alarm'))}" aria-expanded="${expanded}"><img class="kdc-arrow${expanded ? ' up' : ''}" src="assets/dc5-ic_expand_down.png" alt="">${expanded ? '' : `<span class="kdc-summary"><span class="kdc-summary-label">${e(alarm.label)}</span><span class="kdc-summary-days">${e(days)}</span></span>`}</button></div></div>`;
  }
  function page(alarms, {expandedId, t, locale, hour24, normalize}) {
    const list = alarms.map(normalize).sort((a, b) => a.time.localeCompare(b.time));
    const body = list.length ? list.map(alarm => card(alarm, {expanded: alarm.id === expandedId, t, locale, hour24})).join('') : `<div class="kdc-empty"><img src="assets/dc5-ic_noalarms.png" alt=""><span>${e(t('No Alarms'))}</span></div>`;
    return `<div class="kdc-page"><div class="kdc-list">${body}</div><footer class="kdc-footer"><button class="kdc-add" data-action="kdc-add" aria-label="${e(t('Add alarm'))}"><img src="assets/dc5-ic_fab_plus.png" alt=""></button><button class="kdc-menu" data-action="jbclock-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></footer></div>`;
  }
  /* RadialPickerLayout: hours on the outer ring (1-12; in 24 h mode 00 and 13-23 outside, 1-12 inside), then minutes in steps of 5;
     a tap or drag picks, and picking the hour moves on to the minutes. */
  // `accent` is the calling app's colorAccent (DeskClock #FF4081; Settings #009688 for Downtime's times).
  function picker(state, {t, hour24, accent = '#ff4081'}) {
    const {hour, minute, mode} = state;
    const showHour = hour24 ? pad(hour) : String(hour % 12 || 12);
    const R = 270 * (globalThis.document?.querySelector?.('#screen')?.clientWidth ? globalThis.document.querySelector('#screen').clientWidth / 411.43 : .906) / 2, numbersR = R * 0.82, innerR = R * 0.55;
    const values = mode === 'hour' ? (hour24 ? [...Array(12)].map((_, i) => ({v: i === 0 ? 0 : i + 12, label: i === 0 ? '00' : String(i + 12), r: numbersR})).concat([...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: innerR}))) : [...Array(12)].map((_, i) => ({v: i === 0 ? 12 : i, label: String(i === 0 ? 12 : i), r: numbersR}))) : [...Array(12)].map((_, i) => ({v: i * 5, label: pad(i * 5), r: numbersR}));
    const current = mode === 'hour' ? (hour24 ? hour : hour % 12 || 12) : minute;
    const angleOf = v => mode === 'hour' ? ((v % 12) / 12) * 360 : (v / 60) * 360;
    const selR = mode === 'hour' && hour24 && hour >= 1 && hour <= 12 ? innerR : numbersR;
    const a = (angleOf(current) - 90) * Math.PI / 180;
    const sx = R + selR * Math.cos(a), sy = R + selR * Math.sin(a);
    const nums = values.map(item => { const ang = (angleOf(item.v) - 90) * Math.PI / 180; return `<span class="kdc-num${item.v === current ? ' sel' : ''}${item.r === innerR ? ' inner' : ''}" style="left:${(R + item.r * Math.cos(ang)).toFixed(2)}px;top:${(R + item.r * Math.sin(ang)).toFixed(2)}px">${item.label}</span>`; }).join('');
    return `<div class="settings-dialog-scrim" data-action="kdc-picker-cancel"></div><div class="kdc-picker" style="--kdc-accent:${accent}" role="dialog" aria-label="${e(t('Time'))}"><div class="kdc-picker-header"><button class="${mode === 'hour' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="hour">${showHour}</button><span>:</span><button class="${mode === 'minute' ? 'sel' : ''}" data-action="kdc-picker-mode" data-id="minute">${pad(minute)}</button>${hour24 ? '' : `<button class="kdc-picker-ampm" data-action="kdc-picker-ampm">${hour < 12 ? 'AM' : 'PM'}</button>`}</div><div class="kdc-dial" data-kdc-dial style="width:${2 * R}px;height:${2 * R}px"><svg class="kdc-hand" viewBox="0 0 ${2 * R} ${2 * R}" aria-hidden="true"><circle cx="${R}" cy="${R}" r="2.7" fill="${accent}"/><line x1="${R}" y1="${R}" x2="${sx.toFixed(2)}" y2="${sy.toFixed(2)}" stroke="${accent}" stroke-width="1.8"/><circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="15.4" fill="${accent}" fill-opacity=".4"/></svg>${nums}${hour24 ? '' : `<button class="kdc-dial-ampm left${hour < 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="am">AM</button><button class="kdc-dial-ampm right${hour >= 12 ? ' sel' : ''}" data-action="kdc-picker-ampm" data-id="pm">PM</button>`}</div><div class="settings-dialog-actions"><button data-action="kdc-picker-cancel">${e(t('Cancel'))}</button><button class="kdc-picker-done" data-action="kdc-picker-done">${e(t('OK'))}</button></div></div>`;
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
