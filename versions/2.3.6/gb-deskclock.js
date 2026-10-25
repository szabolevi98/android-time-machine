/* Android 2.3.6 DeskClock (packages/apps/DeskClock): the DeskClock face (desk_clock.xml on Theme.Wallpaper with the
   window dimmed 0.4, Clockopia digits, next alarm, night mode, button strip), AlarmClock (alarm_clock.xml, alarm_time.xml),
   SetAlarm (alarm_prefs.xml with the Done / Revert / Delete ButtonBar), the framework TimePickerDialog and the AlarmAlert
   dialog. hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-deskclock.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.deskclock), text = (lang, key) => R.t(key, lang), array = (lang, key) => R.array(key, lang);
  // The Nexus S image's /system/media/audio/alarms (file, Vorbis TITLE) in title order; ro.config.alarm_alert=Alarm_Classic.ogg.
  const TONE_TITLES = [['Alarm_Beep_02', 'BeeBeep Alarm'], ['Alarm_Beep_03', 'Beep-Beep-Beep Alarm'], ['Alarm_Buzzer', 'Buzzer Alarm'], ['Alarm_Beep_01', 'Piezo Alarm'], ['Alarm_Classic', 'Ringing Alarm']];
  const TONES = TONE_TITLES.map(([file]) => file);
  const toneTitle = (tone, lang) => tone === 'Silent' ? text(lang, 'silent_alarm_summary') : Object.fromEntries(TONE_TITLES)[TONES.includes(tone) ? tone : 'Alarm_Classic'];
  // Alarms.formatTime: h:mm with a separate AM/PM, or k:mm in 24-hour mode.
  function clock(hours, minutes, ctx) {
    const pad = String(minutes).padStart(2, '0');
    if (ctx.hour24) return {time: `${hours}:${pad}`, ampm: ''};
    const parts = new Intl.DateTimeFormat(ctx.locale, {hour: 'numeric', hour12: true}).formatToParts(new Date(2000, 0, 1, hours));
    return {time: `${hours % 12 || 12}:${pad}`, ampm: parts.find(p => p.type === 'dayPeriod')?.value || (hours < 12 ? 'AM' : 'PM')};
  }
  const alarmClock = (alarm, ctx) => { const [h, m] = alarm.time.split(':').map(Number); return clock(h, m, ctx); };
  const weekday = (index, ctx, style = 'long') => new Date(2024, 0, 1 + index).toLocaleDateString(ctx.locale, {weekday: style}); // 2024-01-01 is a Monday
  // Alarm.DaysOfWeek.toString: "" for none, "every day" for all seven, else the short day names joined by ", ".
  function daysText(days, ctx, showNever = false) {
    if (!days.length) return showNever ? text(ctx.lang, 'never') : '';
    if (days.length === 7) return text(ctx.lang, 'every_day');
    return days.map(d => weekday(d, ctx, 'short')).join(text(ctx.lang, 'day_concat'));
  }
  // Alarms.formatToast: "This alarm is set for 1 day, 2 hours, and 3 minutes from now."
  function setToast(next, now, lang) {
    const delta = next - now, totalHours = Math.floor(delta / 3600000), minutes = Math.floor(delta / 60000) % 60;
    const days = Math.floor(totalHours / 24), hours = totalHours % 24;
    const part = (n, one, many) => n === 0 ? '' : n === 1 ? text(lang, one) : AndroidStrings.format(text(lang, many), n);
    const index = (days > 0 ? 1 : 0) | (hours > 0 ? 2 : 0) | (minutes > 0 ? 4 : 0);
    return AndroidStrings.format((array(lang, 'alarm_set')[index] || ''), part(days, 'day', 'days'), part(hours, 'hour', 'hours'), part(minutes, 'minute', 'minutes'));
  }

  // desk_clock_weather.xml with what News & Weather's provider (com.google.android.apps.genie.geniewidget.weather)
  // gives DeskClock: Genie's condition icon at 60 sp, the temperature in 46 sp, high (bold) over low in 14 sp, each
  // "%d°", and the location in 18 sp; a tap opens News & Weather.
  function weather(ctx) {
    const w = ctx.weather;
    if (!w) return '';
    return `<button class="gbdc-weather" data-action="open-app" data-app="news-weather"><span class="gbdc-wx"><img src="assets/nw-ic_weather_${e(w.icon)}_l.png" alt=""><span class="gbdc-wx-temp">${w.temp}°</span><span class="gbdc-wx-hl"><b>${w.high}°</b><i>${w.low}°</i></span></span><span class="gbdc-wx-loc">${e(w.location)}</span></button>`;
  }
  function face(ctx) {
    const T = key => text(ctx.lang, key), now = ctx.now, c = clock(now.getHours(), now.getMinutes(), ctx);
    // Alarms.formatDayAndTime ("E h:mm aa") for Settings.System.NEXT_ALARM_FORMATTED.
    const next = ctx.next ? (() => { const n = clock(ctx.next.getHours(), ctx.next.getMinutes(), ctx); return `${weekday((ctx.next.getDay() + 6) % 7, ctx, 'short')} ${n.time}${n.ampm ? ' ' + n.ampm : ''}`; })() : '';
    const strip = [['left', 'clock-alarms', 'alarm', 'alarm_button_description'], ['middle', 'open-app" data-app="gallery', 'gallery', 'gallery_button_description'], ['middle', 'open-app" data-app="music', 'music', 'music_button_description'], ['right', 'home', 'home', 'home_button_description']];
    return `<div class="app-view gbdc gbdc-face${ctx.dim ? ' dim' : ''}" data-no-translate><div class="gbdc-main"><div class="gbdc-top"><span class="gbdc-next"${next ? '' : ' hidden'}><img src="assets/gb-dc-ic_lock_idle_alarm.png" alt="">${e(next)}</span><button class="gbdc-round" data-action="clock-dim" aria-label="${e(T('nightmode_button_description'))}" aria-pressed="${!!ctx.dim}"><img src="assets/gb-dc-ic_round_brightness.png" alt=""></button></div><div class="gbdc-timedate"><div class="gbdc-time"><span>${e(c.time)}</span>${c.ampm ? `<b>${e(c.ampm)}</b>` : ''}</div><div class="gbdc-date">${e(now.toLocaleDateString(ctx.locale, {weekday: 'long', month: 'long', day: 'numeric'}))}</div></div>${weather(ctx)}</div><div class="gbdc-strip">${strip.map(([pos, action, icon, label]) => `<button class="gbdc-strip-btn ${pos}" data-action="${action}" aria-label="${e(T(label))}"><img src="assets/gb-dc-ic_clock_strip_${icon}.png" alt=""></button>`).join('')}</div>${ctx.dim ? '<button class="gbdc-tint" data-action="clock-dim" aria-label="Undim"></button>' : ''}</div>`;
  }
  function list(ctx) {
    const T = key => text(ctx.lang, key), c = clock(ctx.now.getHours(), ctx.now.getMinutes(), ctx);
    const rows = ctx.alarms.map(alarm => {
      const a = alarmClock(alarm, ctx);
      return `<div class="gbdc-alarm"><button class="gbdc-indicator" data-action="alarm-toggle" data-id="${alarm.id}" role="checkbox" aria-checked="${alarm.enabled}" aria-label="${e(T(alarm.enabled ? 'disable_alarm' : 'enable_alarm'))}"><img src="assets/gb-dc-ic_clock_alarm_${alarm.enabled ? 'on' : 'off'}.png" alt=""><img class="gbdc-bar" src="assets/gb-dc-ic_indicator_${alarm.enabled ? 'on' : 'off'}.png" alt=""></button><i class="gbdc-vdiv"></i><button class="gbdc-alarm-body" data-action="alarm-edit" data-id="${alarm.id}"><span class="gbdc-alarm-line"><span class="gbdc-alarm-time">${e(a.time)}</span>${a.ampm ? `<b>${e(a.ampm)}</b>` : ''}<em>${e(alarm.label)}</em></span><span class="gbdc-days">${e(daysText(alarm.days, ctx))}</span></button></div>`;
    }).join('');
    return `<div class="app-view gbdc gbdc-list" data-no-translate><div class="gb-titlebar">${e(T('alarm_list_title'))}</div><button class="gbdc-add" data-action="alarm-new"><span class="gbdc-add-icon"></span><span>${e(T('add_alarm'))}</span></button><i class="gbdc-hdiv"></i><div class="gbdc-alarms">${rows}</div><div class="gbdc-bottom"><button class="gbdc-strip-btn left" data-action="back" aria-label="${e(T('desk_clock_button_description'))}"><img src="assets/gb-dc-ic_clock_strip_desk_clock.png" alt=""></button><div class="gbdc-strip-btn right gbdc-bottom-clock"><span>${e(c.time)}</span>${c.ampm ? `<b>${e(c.ampm)}</b>` : ''}</div></div></div>`;
  }
  function setAlarm(ctx) {
    const T = key => text(ctx.lang, key), alarm = ctx.draft, a = alarmClock(alarm, ctx);
    const check = on => `<img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}.png" alt="">`;
    const row = (attrs, title, summary, checkbox) => `<button class="gbset-row" ${attrs}><span class="gbset-text"><span class="gbset-title">${e(title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>${checkbox ?? ''}</button>`;
    return `<div class="app-view gbset gbdc-set" data-no-translate><div class="gb-titlebar">${e(T('set_alarm'))}</div><div class="gbset-list">${row(`data-action="alarm-draft-toggle" data-id="enabled" role="checkbox" aria-checked="${alarm.enabled}"`, T('enable_alarm'), '', check(alarm.enabled))}${row('data-action="alarm-field" data-id="time"', T('time'), `${a.time}${a.ampm ? ' ' + a.ampm : ''}`)}${row('data-action="alarm-field" data-id="days"', T('alarm_repeat'), daysText(alarm.days, ctx, true))}${row('data-action="alarm-field" data-id="tone"', T('alert'), toneTitle(alarm.tone, ctx.lang))}${row(`data-action="alarm-draft-toggle" data-id="vibrate" role="checkbox" aria-checked="${alarm.vibrate}"`, T('alarm_vibrate'), '', check(alarm.vibrate))}${row('data-action="alarm-field" data-id="label"', T('label'), alarm.label)}</div><div class="gbchoose-bottombar"><button type="button" data-action="alarm-save">${e(T('done'))}</button><button type="button" data-action="alarm-cancel">${e(T('revert'))}</button><button type="button" data-action="alarm-delete">${e(T('delete'))}</button></div></div>`;
  }
  function render(ctx) { return ctx.sub === 'alarm-edit' ? setAlarm(ctx) : ctx.sub === 'alarms' ? list(ctx) : face(ctx); }

  // desk_clock_menu.xml and alarm_list_menu.xml.
  function menu(ctx) {
    const T = key => text(ctx.lang, key);
    if (ctx.sub === 'alarm-edit') return [];
    if (ctx.sub === 'alarms') return [{action: 'back', title: T('menu_desk_clock'), icon: 'gb-dc-ic_menu_desk_clock.png'}, {action: 'alarm-new', title: T('add_alarm'), icon: 'gb-dc-ic_menu_add.png'}, {action: 'gbpref-open', id: 'clock', title: T('settings'), icon: 'ic_menu_preferences'}];
    return [{action: 'clock-alarms', title: T('alarm_list_title'), icon: 'gb-dc-ic_menu_alarms.png'}, {action: 'alarm-new', title: T('add_alarm'), icon: 'gb-dc-ic_menu_add.png'}, {action: 'gbpref-open', id: 'dock', title: T('menu_item_dock_settings'), icon: 'ic_menu_preferences'}];
  }

  // Dialogs: TimePickerDialog (title = the picked time, ic_dialog_time, two 70 dip NumberPickers and the AM/PM button,
  // Set / Cancel), the Repeat multi-choice list, the alarm ringtone picker, the Label EditTextPreference, delete,
  // and the AlarmClock context menu.
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), temp = ctx.temp || {};
    if (kind === 'time') {
      const [h, m] = (temp.time || '07:00').split(':').map(Number), c = clock(h, m, ctx);
      const picker = (field, value) => `<div class="gbtp-picker"><button type="button" class="gbtp-up" data-action="dc-time-step" data-id="${field}:1" aria-label="+"></button><output class="gbtp-input">${e(value)}</output><button type="button" class="gbtp-down" data-action="dc-time-step" data-id="${field}:-1" aria-label="-"></button></div>`;
      return {title: `${c.time}${c.ampm ? ' ' + c.ampm : ''}`, icon: 'gb-dc-ic_dialog_time.png', custom: `<div class="gbtp">${picker('hour', ctx.hour24 ? String(h).padStart(2, '0') : String(h % 12 || 12))}${picker('minute', String(m).padStart(2, '0'))}${ctx.hour24 ? '' : `<button type="button" class="gbtp-ampm" data-action="dc-ampm">${e(c.ampm)}</button>`}</div>`, buttons: [{action: 'dc-time-set', title: T('date_time_set')}, {action: 'close-overlay', title: ctx.cancel}]};
    }
    if (kind === 'days') return {title: T('alarm_repeat'), choice: 'multi', items: [0, 1, 2, 3, 4, 5, 6].map(d => ({action: 'dc-day', id: d, title: weekday(d, ctx), checked: (temp.days || []).includes(d)})), buttons: [{action: 'dc-days-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'tone') {
      const tones = ['Silent', ...TONES];
      return {title: T('alert'), choice: 'single', selected: Math.max(0, tones.indexOf(temp.tone)), items: tones.map(tone => ({action: 'dc-tone', id: tone, title: toneTitle(tone, ctx.lang)})), buttons: [{action: 'dc-tone-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    }
    if (kind === 'label') return {title: T('label'), custom: `<input class="gbdlg-input" data-dc-label maxlength="60" value="${e(ctx.draft?.label || '')}" aria-label="${e(T('label'))}">`, buttons: [{action: 'dc-label-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'delete') return {title: T('delete_alarm'), icon: 'ic_dialog_alert', message: T('delete_alarm_confirm'), buttons: [{action: 'alarm-confirm-delete', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'context' && ctx.contextAlarm) {
      const alarm = ctx.contextAlarm, a = alarmClock(alarm, ctx);
      return {title: `${a.time}${a.ampm ? ' ' + a.ampm : ''}${alarm.label ? ' ' + alarm.label : ''}`, items: [{action: 'alarm-toggle', id: alarm.id, title: T(alarm.enabled ? 'disable_alarm' : 'enable_alarm')}, {action: 'alarm-edit', id: alarm.id, title: T('menu_edit_alarm')}, {action: 'dc-delete-from-list', id: alarm.id, title: T('delete_alarm')}]};
    }
    return null;
  }

  // AlarmAlert (alarm_alert.xml in the alarm_alert Theme.Dialog): the dialog 9-patch panel, wrap_content and centred over
  // the dimmed screen, with the label or "Alarm" (textAppearanceLarge, 5 dip padding), the 1 dip divider 10 dip in, the
  // DigitalClock (64 sp time, bold medium AM/PM, 30 dip above and below) and the ButtonBar strip with Snooze, a 2 dip view
  // and Dismiss weighted 3 / 1 / 3. Under the keyguard AlarmAlertFullScreen shows the same panel over the wallpaper
  // (Theme.Wallpaper.NoTitleBar). Neither the back key nor a touch outside closes it.
  function alert(ctx) {
    const T = key => text(ctx.lang, key), a = alarmClock(ctx.ringing, ctx), title = ctx.ringing.label || T('default_label');
    return `<div class="gbdc-ring-scrim${ctx.wallpaper ? ' full' : ''}"${ctx.wallpaper ? ` style="background:${e(ctx.wallpaper)}"` : ''}></div><div class="gbdc-ring" role="alertdialog" aria-label="${e(title)}"><div class="gbdc-ring-title">${e(title)}</div><i class="gbdc-ring-divider"></i><div class="gbdc-alert"><span>${e(a.time)}</span>${a.ampm ? `<b>${e(a.ampm)}</b>` : ''}</div><div class="gbdc-ring-bar"><button type="button" class="gbdlg-button" data-action="alarm-snooze">${e(T('alarm_alert_snooze_text'))}</button><i></i><button type="button" class="gbdlg-button" data-action="alarm-dismiss">${e(T('alarm_alert_dismiss_text'))}</button></div></div>`;
  }

  window.GBDeskClock = {TONES, text, array, clock, daysText, setToast, toneTitle, render, menu, dialog, alert};
})();
