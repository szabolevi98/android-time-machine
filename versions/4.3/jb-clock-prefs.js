/* Android 4.3 DeskClock 2.0.3 (DeskClockGoogle, JWR66Y): its menus, Settings, Night mode, analog style and home clock.
   - More options: desk_clock_menu.xml's Night mode, Settings and Help (DeskClock.showMenu pops all three from each page); Settings and Help in the Cities
     overflow (cities_menu.xml) and Help in Settings' own (settings_menu.xml). Help opens the help article in the browser.
   - SettingsActivity (settings.xml): Clock — Style (clock_style_entries), Automatic home clock, Home time zone
     (getAllTimezones: timezone_values / timezone_labels as "(GMT+H:MM) label", sorted by offset, enabled while the
     automatic home clock is on); Alarms — Silence after (auto_silence_entries; the summary "%d minutes" or Never),
     Snooze length (SnoozeLengthDialog, 1–30 with snooze_picker_label), Alarm volume (VolumePreference on the alarm
     stream, 0–7) and Volume buttons (volume_button_setting_entries). The values are kept in data.jbClock.prefs.
   - The clock page draws AnalogClock (clock_analog_dial / hour / minute / second) when the style is Analog; with the
     automatic home clock on, a Home clock (home_label) leads the world clocks while the phone's time zone differs
     from the home time zone; the alarm's Snooze waits the snooze length, an alarm left ringing stops after Silence
     after, and the volume keys snooze or dismiss it as Volume buttons says.
   - Night mode (ScreensaverActivity): the clock in its style, dimmed on black with the date; a tap or Back ends it. */
(() => {
  'use strict';
  const ERA = 'jb', ASSET = 'jbclock-';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const T = () => window.ClockPrefStrings || {strings: {}, arrays: {}, values: {}};
  const lang = ctx => String(ctx.locale || 'en').slice(0, 2);
  const S = (ctx, key) => { const row = T().strings[key]; return row ? AndroidStrings.pick(row, lang(ctx), key) : ctx.t(key); };
  const A = (ctx, name) => { const list = T().arrays[name] || {}; return list[lang(ctx)] || list.en || []; };
  const V = name => T().values[name] || [];
  // desk_clock_help_url.
  const HELP = 'http://support.google.com/mobile/?p=clock_main';
  const deviceZone = data => data.settings?.autoZone === false && data.settings?.timeZone ? data.settings.timeZone : Intl.DateTimeFormat().resolvedOptions().timeZone;
  function prefs(data) {
    const p = (data.jbClock ||= {}).prefs || {};
    return {style: p.style || 'digital', autoHome: p.autoHome !== false, homeZone: p.homeZone || '', silence: p.silence ?? '10', snooze: Number(p.snooze ?? 10), volume: Number(p.volume ?? 6), buttons: p.buttons ?? '0'};
  }
  const set = (data, key, value) => { ((data.jbClock ||= {}).prefs ||= {})[key] = value; };
  // TimeZone.getOffset in minutes at the moment.
  function offset(zone, now = Date.now()) {
    try {
      const name = new Intl.DateTimeFormat('en-US', {timeZone: zone, timeZoneName: 'longOffset'}).formatToParts(now).find(x => x.type === 'timeZoneName')?.value || 'GMT';
      const m = name.match(/([+-])(\d+):?(\d*)/);
      return m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0;
    } catch { return 0; }
  }
  // SettingsActivity.getAllTimezones: TimeZoneRow's "(GMT+H:MM) label", sorted by offset.
  function zones(ctx) {
    const ids = V('timezone_values'), labels = A(ctx, 'timezone_labels');
    return ids.map((id, i) => {
      const min = offset(id), sign = min < 0 ? '-' : '+', abs = Math.abs(min);
      return {id, offset: min, label: `(GMT${sign}${Math.floor(abs / 60)}:${String(abs % 60).padStart(2, '0')}) ${labels[i] || id}`};
    }).sort((a, b) => a.offset - b.offset);
  }
  // Utils / WorldClockAdapter: the Home clock while the phone is away from the home time zone.
  function home(data, now = Date.now(), locale = 'en') {
    const p = prefs(data);
    if (!p.autoHome || !p.homeZone) return null;
    return offset(p.homeZone, now) === offset(deviceZone(data), now) ? null : {zone: p.homeZone, label: S({locale, t: key => key}, 'Home')};
  }
  const minutes = (ctx, n, key) => AndroidStrings.format(S(ctx, n === 1 ? `${key} minute` : `${key} minutes`), n);
  function summary(ctx, key) {
    const p = prefs(ctx.data);
    if (key === 'style') return A(ctx, 'clock_style_entries')[V('clock_style_values').indexOf(p.style)] || '';
    if (key === 'zone') return (zones(ctx).find(z => z.id === p.homeZone) || {}).label || '';
    if (key === 'silence') return p.silence === '-1' ? S(ctx, 'Never') : AndroidStrings.format(S(ctx, 'Silence after summary'), Number(p.silence));
    if (key === 'snooze') return minutes(ctx, p.snooze, 'Snooze');
    if (key === 'buttons') return A(ctx, 'volume_button_setting_entries')[V('volume_button_setting_values').indexOf(p.buttons)] || '';
    return '';
  }
  // The overflow menus as [action, id, label].
  function menu(kind, ctx) {
    const help = ['cpref-help', '', S(ctx, 'Help')], settings = ['cpref-open', '', S(ctx, 'Menu settings')];
    if (kind === 'settings') return [help];
    if (kind === 'cities') return [['jbclock-city-sort', '', S(ctx, ctx.data.jbClock?.citySort === 'time' ? 'Sort by name' : 'Sort by time')], settings, help].filter(item => ERA !== 'jb' || item[0] !== 'jbclock-city-sort');
    return [...(true ? [['cpref-night', '', S(ctx, 'Night mode')]] : []), settings, help];
  }
  function dialog(ctx) {
    const {ui} = ctx, d = ui.clockDialog, p = prefs(ctx.data);
    if (!d) return '';
    const shell = (title, body, buttons) => `<div class="cpref-scrim" data-action="cpref-dialog" data-id=""></div><div class="cpref-dlg" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="cpref-dlg-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="cpref-dialog" data-id="">${e(ctx.t('Cancel'))}</button>`;
    if (['style', 'zone', 'silence', 'buttons'].includes(d)) {
      const [title, items, value] = d === 'style' ? [S(ctx, 'Style'), A(ctx, 'clock_style_entries').map((label, i) => [V('clock_style_values')[i], label]), p.style]
        : d === 'zone' ? [S(ctx, 'Home time zone'), zones(ctx).map(z => [z.id, z.label]), p.homeZone]
        : d === 'silence' ? [S(ctx, 'Silence after'), A(ctx, 'auto_silence_entries').map((label, i) => [V('auto_silence_values')[i], label]), p.silence]
        : [S(ctx, 'Button effect'), A(ctx, 'volume_button_setting_entries').map((label, i) => [V('volume_button_setting_values')[i], label]), p.buttons];
      const rows = items.map(([id, label]) => `<button type="button" class="cpref-radio${id === value ? ' on' : ''}" data-action="cpref-pick" data-id="${e(id)}" role="radio" aria-checked="${id === value}"><span>${e(label)}</span><i></i></button>`).join('');
      return shell(title, `<div class="cpref-dlg-list">${rows}</div>`, cancel);
    }
    if (d === 'snooze') {
      const n = ui.clockDraft ?? p.snooze, label = S(ctx, n === 1 ? 'Picker minute' : 'Picker minutes');
      return shell(S(ctx, 'Snooze length'), `<div class="cpref-picker"><div class="cpref-np"><button type="button" data-action="cpref-step" data-id="1" aria-label="+">${e(String(n === 30 ? 1 : n + 1))}</button><b data-cpref-value>${e(String(n))}</b><button type="button" data-action="cpref-step" data-id="-1" aria-label="-">${e(String(n === 1 ? 30 : n - 1))}</button></div><span>${e(label)}</span></div>`, `${cancel}<button type="button" data-action="cpref-save" data-id="snooze">${e(S(ctx, 'Done'))}</button>`);
    }
    if (d === 'volume') {
      const n = ui.clockDraft ?? p.volume;
      return shell(S(ctx, 'Alarm volume'), `<div class="cpref-volume"><input type="range" min="0" max="7" step="1" value="${n}" data-cpref-volume aria-label="${e(S(ctx, 'Alarm volume'))}"></div>`, `${cancel}<button type="button" data-action="cpref-save" data-id="volume">${e(ctx.t('OK'))}</button>`);
    }
    return '';
  }
  function settings(ctx) {
    const {data, ui} = ctx, p = prefs(data);
    const row = (action, id, title, small = '', extra = '', disabled = false) => `<button type="button" class="cpref-row" data-action="${action}" data-id="${id}"${disabled ? ' disabled' : ''}><span class="cpref-copy"><b>${e(title)}</b>${small ? `<small>${e(small)}</small>` : ''}</span>${extra}</button>`;
    const cat = title => `<h4 class="cpref-cat">${e(title.toLocaleUpperCase(ctx.locale))}</h4>`;
    const box = on => `<i class="cpref-check${on ? ' on' : ''}" role="checkbox" aria-checked="${on}"></i>`;
    const body = cat(S(ctx, 'Clock')) + row('cpref-dialog', 'style', S(ctx, 'Style'), summary(ctx, 'style'))
      + row('cpref-toggle', 'autoHome', S(ctx, 'Automatic home clock'), S(ctx, 'Automatic home clock summary'), box(p.autoHome))
      + row('cpref-dialog', 'zone', S(ctx, 'Home time zone'), summary(ctx, 'zone'), '', !p.autoHome)
      + cat(S(ctx, 'Alarms')) + row('cpref-dialog', 'silence', S(ctx, 'Silence after'), summary(ctx, 'silence'))
      + row('cpref-dialog', 'snooze', S(ctx, 'Snooze length'), summary(ctx, 'snooze'))
      + row('cpref-dialog', 'volume', S(ctx, 'Alarm volume'))
      + row('cpref-dialog', 'buttons', S(ctx, 'Volume buttons'), summary(ctx, 'buttons'));
    const popup = ui.clockMenu === 'settings' ? `<div class="cpref-scrim clear" data-action="cpref-menu" data-id=""></div><div class="cpref-menu" role="menu">${menu('settings', ctx).map(([action, id, label]) => `<button type="button" role="menuitem" data-action="${action}" data-id="${id}">${e(label)}</button>`).join('')}</div>` : '';
    return `<div class="app-view jbclock-app cpref-app cpref-${ERA}"${ctx.color ? ` style="--dc:${ctx.color}"` : ''}><header class="jbclock-ab"><button type="button" class="jbclock-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/clock.png" alt=""></button><h2>${e(S(ctx, 'Settings'))}</h2><button type="button" class="jbclock-ab-menu" data-action="cpref-menu" data-id="settings" aria-label="${e(ctx.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="cpref-list">${body}</div>${popup}${dialog(ctx)}</div>`;
  }
  // AnalogClock: the dial with the hour, minute and (sweeping) second hands for the given wall time.
  function analog(now, cls = '') {
    const h = now.getHours() % 12 + now.getMinutes() / 60, m = now.getMinutes() + now.getSeconds() / 60, s = now.getSeconds();
    const hand = (name, deg, extra = '') => `<img class="cpref-hand ${name}" src="assets/${ASSET}clock_analog_${name}.png" alt="" style="transform:rotate(${deg}deg)${extra}">`;
    return `<div class="cpref-analog ${cls}" data-cpref-analog role="img" aria-label="${e(now.toLocaleTimeString())}"><img class="cpref-dial" src="assets/${ASSET}clock_analog_dial.png" alt="">${hand('hour', h * 30)}${hand('minute', m * 6)}<img class="cpref-hand second" src="assets/${ASSET}clock_analog_second.png" alt="" style="animation-delay:-${s}s"></div>`;
  }
  // ScreensaverActivity: the clock in the chosen style, dimmed on black, the date under it.
  function night(ctx) {
    const {now, hour24, locale, date} = ctx, p = prefs(ctx.data);
    const time = now.toLocaleTimeString(locale, {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AP]M$/i, '');
    const clock = p.style === 'analog' ? analog(now, 'night') : `<div class="cpref-night-time">${e(time)}</div>`;
    return `<button type="button" class="app-view cpref-night" data-action="cpref-night-end" aria-label="${e(S(ctx, 'Night mode'))}"><span class="cpref-night-clock">${clock}<span class="cpref-night-date">${e(date)}</span></span></button>`;
  }
  // The Cities list filtered by the action bar's SearchView (CitiesActivity's filter on the name).
  const matches = (name, query, locale) => !query || String(name).toLocaleLowerCase(locale).includes(String(query).toLocaleLowerCase(locale));
  /* An action of the clock's menus, Settings and Night mode; returns what the simulator should do next. */
  function handle(action, id, ctx) {
    const {data, ui} = ctx, p = prefs(data);
    if (action === 'cpref-menu') { ui.clockMenu = id; return 'render'; }
    if (action === 'cpref-open') { ui.clockMenu = ''; if (!p.homeZone) set(data, 'homeZone', deviceZone(data)); ui.clockBack = ui.sub || ''; ui.sub = 'clock-settings'; return 'save'; }
    if (action === 'cpref-help') { ui.clockMenu = ''; return {open: HELP}; }
    if (action === 'cpref-night') { ui.clockMenu = ''; ui.clockBack = ui.sub || ''; ui.sub = 'night'; return 'render'; }
    if (action === 'cpref-night-end') { ui.sub = ui.clockBack || ''; return 'render'; }
    if (action === 'cpref-toggle') { set(data, id, !p[id]); return 'save'; }
    if (action === 'cpref-dialog') { ui.clockDialog = id; ui.clockDraft = undefined; return 'render'; }
    if (action === 'cpref-pick') { set(data, {style: 'style', zone: 'homeZone', silence: 'silence', buttons: 'buttons'}[ui.clockDialog], id); ui.clockDialog = ''; return 'save'; }
    if (action === 'cpref-step') { const n = (ui.clockDraft ?? p.snooze) + Number(id); ui.clockDraft = n > 30 ? 1 : n < 1 ? 30 : n; return 'render'; }
    if (action === 'cpref-save') { if (ui.clockDraft !== undefined) set(data, id, ui.clockDraft); ui.clockDialog = ''; ui.clockDraft = undefined; return 'save'; }
    return '';
  }
  function back(ui) {
    if (ui.clockDialog) { ui.clockDialog = ''; ui.clockDraft = undefined; return true; }
    if (ui.clockMenu) { ui.clockMenu = ''; return true; }
    if (ui.sub === 'clock-settings' || ui.sub === 'night') { ui.sub = ui.clockBack || ''; return true; }
    return false;
  }
  window.ClockPrefs = {prefs, home, zones, summary, menu, settings, dialog, analog, night, handle, back, matches, offset, deviceZone};
})();
