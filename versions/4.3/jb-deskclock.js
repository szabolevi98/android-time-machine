/* Android 4.2/4.3 DeskClock: Timer | Clock | Stopwatch pages (DeskClock, TimerFragment, StopwatchFragment). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const TABS = ['timer', 'clock', 'stopwatch'];
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

  /* World clock (DeskClock 2.0.3): the cities of cities.xml (dc-cities.js, in this image's languages). The Clock page
     lists the chosen cities under the main clock two to a row (world_clock_list_item: desk_clock_time_small with the
     60 dp bold hours and light minutes, the 14 sp bold condensed city name and, when the date differs, "/ day" in
     clock_gray); CitiesActivity lists every city under first-letter headers (city_list_header) as
     city_list_item rows: the 24 sp bold condensed name over the 14 sp time in clock_gray and a check box. */
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
    const sorted = all.sort(byName);
    const item = c => `<button type="button" class="jbclock-city-item" data-action="jbclock-city" data-id="${e(c.row[0])}" role="checkbox" aria-checked="${chosen.has(c.row[0])}"><span><b>${e(c.name)}</b><small>${e(`${c.time.hours}:${c.time.minutes}${c.time.ampm ? ' ' + c.time.ampm : ''}`)}</small></span><img src="assets/btn_check_${chosen.has(c.row[0]) ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    let letter = '', list = '';
    for (const c of sorted) { const first = c.name.charAt(0).toLocaleUpperCase(locale); if (first !== letter) { letter = first; list += `<h4 class="jbclock-city-header">${e(first)}</h4>`; } list += item(c); }
    return `<div class="app-view jbclock-app jbclock-cities"><header class="jbclock-ab"><button type="button" class="jbclock-up" data-action="back" aria-label="${e(t('Navigate up'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/clock.png" alt=""></button><h2>${e(words.title)}</h2><button type="button" class="jbclock-ab-menu" data-action="jbclock-cities-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="jbclock-city-list">${list}</div></div>`;
  }
  // now is the simulated wall clock for the Clock page; timers and the stopwatch run on real elapsed time.
  function render(state, t, {locale, now, hour24, alarm, date}) {
    const tab = TABS.includes(state.tab) ? state.tab : 'clock', index = TABS.indexOf(tab);
    const btn = (action, label, body, extra = '') => `<button type="button" data-action="${action}" aria-label="${e(t(label))}" ${extra}>${body}</button>`;
    const icon = name => `<img src="assets/jbclock-${name}.png" alt="">`;
    const tabs = `<header class="jbclock-tabs" role="tablist">${TABS.map(name => `<button role="tab" data-action="jbclock-tab" data-id="${name}" aria-selected="${name === tab}" aria-label="${e(t(name === 'timer' ? 'Timer' : name === 'clock' ? 'Clock' : 'Stopwatch'))}" class="${name === tab ? 'active' : ''}">${icon(`ic_tab_${name}_${name === tab ? 'activated' : 'normal'}`)}</button>`).join('')}</header>`;
    // Timer page: setup keypad when there are no timers or a new one is being added.
    const timers = state.timers || [];
    let timerPage;
    if (!timers.length || state.timerSetup) {
      const time = setupTime(state.timerDigits || ''), active = (state.timerDigits || '').length;
      const digit = (value, on) => `<span class="${on ? 'on' : ''}">${value}</span>`;
      const [uh, um, us] = units(locale);
      timerPage = `<div class="jbclock-setup"><div class="jbclock-setup-display" aria-live="polite" data-no-translate>${digit(time.h, active >= 5)}<small>${e(uh)}</small>${digit(pad(time.m)[0], active >= 4)}${digit(pad(time.m)[1], active >= 3)}<small>${e(um)}</small>${digit(pad(time.s)[0], active >= 2)}${digit(pad(time.s)[1], active >= 1)}<small>${e(us)}</small>${btn('jbclock-key', 'Delete', icon(active ? 'ic_backspace_normal' : 'ic_backspace_disabled'), `data-id="back" class="jbclock-backspace" ${active ? '' : 'disabled'}`)}</div><div class="jbclock-keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', ''].map(key => key ? btn('jbclock-key', key, key, `data-id="${key}"`) : '<span></span>').join('')}</div><footer class="jbclock-footer">${timers.length ? btn('jbclock-setup-cancel', 'Cancel', e(t('Cancel'))) : ''}${btn('jbclock-setup-start', 'Start', e(t('Start')), time.ms ? '' : 'disabled')}</footer></div>`;
    } else {
      timerPage = `<div class="jbclock-timers">${timers.map(timer => { const left = remaining(timer, Date.now()); return `<div class="jbclock-timer${timer.state === 'done' ? ' done' : ''}" data-timer="${e(timer.id)}"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="timer:${e(timer.id)}"></canvas><div class="jbclock-count" data-count="timer:${e(timer.id)}">${e(timer.state === 'done' ? t("Time's up") : formatTimer(left))}</div><div class="jbclock-label">${icon('ic_label_normal')}${e(timer.label || '')}</div>${btn('jbclock-timer-delete', 'Delete', icon('ic_delete_normal'), `data-id="${e(timer.id)}" class="jbclock-corner left"`)}${btn('jbclock-timer-toggle', timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start', e(t(timer.state === 'running' ? 'Stop' : timer.state === 'done' ? 'Reset' : 'Start')), `data-id="${e(timer.id)}" class="jbclock-center"`)}${timer.state === 'stopped' && left === timer.length ? '' : btn('jbclock-timer-plus', 'Add 1 Minute', icon('ic_plusone_normal'), `data-id="${e(timer.id)}" class="jbclock-corner right"`)}</div></div>`; }).join('')}<footer class="jbclock-footer single">${btn('jbclock-timer-add', 'Add Timer', icon('ic_add'))}</footer></div>`;
    }
    const time = now.toLocaleTimeString(locale, {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}), [hours, rest = ''] = time.split(/[:.]/), minutes = rest.replace(/\s?[^\d].*$/, ''), ampm = hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM';
    const world = worldClocks(state, now, {locale, hour24});
    const clockPage = `<div class="jbclock-clock${world ? ' has-cities' : ''}">${state.analog || `<div class="jbclock-time"><span class="jbclock-hours" data-clock-hours>${e(hours)}</span><span class="jbclock-minutes" data-clock-minutes>:${e(minutes)}</span>${ampm ? `<small data-clock-ampm>${ampm}</small>` : ''}</div>`}<div class="jbclock-date"><span data-clock-date>${e(date)}</span>${alarm ? `<span class="jbclock-next">${icon('ic_alarm_small')}${e(alarm)}</span>` : ''}</div>${world}<footer class="jbclock-footer clock-buttons">${btn('clock-alarms', 'Alarms', icon('ic_alarm'))}${btn('jbclock-cities', 'Cities', icon('ic_location'))}${btn('jbclock-menu', 'More options', '<img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt="">')}</footer></div>`;
    const watch = state.stopwatch || {}, laps = watch.laps || [], running = watch.started != null, total = elapsed(watch, Date.now());
    const lapRows = laps.map((lapTotal, i) => ({n: i + 1, lap: lapTotal - (laps[i - 1] || 0), total: lapTotal})).reverse();
    const watchPage = `<div class="jbclock-stopwatch"><div class="jbclock-circle-frame"><canvas class="jbclock-circle" data-circle="stopwatch"></canvas><div class="jbclock-count stopwatch" data-count="stopwatch">${e(formatStopwatch(total))}</div>${running ? btn('jbclock-sw', 'Lap', icon('ic_lap_normal'), 'data-id="lap" class="jbclock-corner left"') : total ? btn('jbclock-sw', 'Reset', icon('ic_reset_normal'), 'data-id="reset" class="jbclock-corner left"') : ''}${btn('jbclock-sw', running ? 'Stop' : 'Start', e(t(running ? 'Stop' : 'Start')), 'data-id="toggle" class="jbclock-center"')}${total ? btn('jbclock-sw', 'Share', icon('ic_share_normal'), 'data-id="share" class="jbclock-corner right"') : ''}</div><ol class="jbclock-laps">${lapRows.map(row => `<li><span># ${row.n}</span><span>${e(formatStopwatch(row.lap))}</span><span>${e(formatStopwatch(row.total))}</span></li>`).join('')}</ol></div>`;
    return `<div class="app-view jbclock-app">${tabs}<div class="jbclock-pager" data-jbclock-swipe><div class="jbclock-track" style="transform:translateX(${-index * 100}%)"><section class="jbclock-page" aria-hidden="${tab !== 'timer'}" ${tab !== 'timer' ? 'inert' : ''}>${timerPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'clock'}" ${tab !== 'clock' ? 'inert' : ''}>${clockPage}</section><section class="jbclock-page" aria-hidden="${tab !== 'stopwatch'}" ${tab !== 'stopwatch' ? 'inert' : ''}>${watchPage}</section></div></div></div>`;
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
  window.JBDeskClock = {TABS, setupDigits, setupTime, remaining, timerAction, formatTimer, formatStopwatch, elapsed, stopwatchAction, drawCircle, render, tick, cities, cityTime};
})();
