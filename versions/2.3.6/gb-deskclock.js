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

/* Clock on Android 2.3.6 (DeskClock.apk of GRK39F) as a module (docs/plans/engine-migration.md): the desk clock with
   the weather, the alarm list, the alarm editor and its pickers. The ringing alarm (AlarmAlert) is the system's: the
   shell (simulator.js) shows it over any screen and reads this module's context. */
(() => {
  'use strict';
  function context(c) {
    const {data, ui} = c, i18n = window.AndroidI18n, deviceDate = c.deviceDate;
    const now = deviceDate();
    // The weather DeskClock reads from News & Weather: today's forecast for its city, in its units (Use metric).
    const today = window.GBGoogleApps?.FORECAST?.[0], metric = window.NewsPrefs ? NewsPrefs.metric(data, i18n.language) : i18n.language !== 'en', deg = f => metric ? Math.round((f - 32) * 5 / 9) : f;
    const weather = today && {icon: today[1], temp: deg(72), high: deg(today[2]), low: deg(today[3]), location: window.NewsPrefs ? NewsPrefs.city(data, 'Mountain View, CA') : 'Mountain View, CA'};
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), hour24: !!data.settings.hour24, now, sub: ui.sub, weather, dim: !!ui.clockDim, alarms: data.alarms.map(alarm => ICSDeskClock.normalize(alarm)), next: data.alarms.map(alarm => ICSDeskClock.nextOccurrence(alarm, now)).filter(Boolean).sort((a, b) => a - b)[0], draft: ui.alarmDraft ? ICSDeskClock.normalize(ui.alarmDraft) : null, temp: ui.dcTemp, contextAlarm: data.alarms.find(alarm => alarm.id === ui.dcContext), ringing: ui.ringingAlarm ? ICSDeskClock.normalize(ui.ringingAlarm) : null, ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel')};
  }
  // Alarms.formatToast after an enabled alarm is saved or switched on.
  function alarmSetToast(c, alarm) { const now = c.deviceDate(), next = ICSDeskClock.nextOccurrence(alarm, now); if (next) c.toast(GBDeskClock.setToast(next, now, c.lang)); }
  function editAlarm(c, id) {
    const {data, ui} = c, render = c.render;
    ui.alarmDraft=ICSDeskClock.normalize(data.alarms.find(alarm=>alarm.id===Number(id)));
    ui.sub='alarm-edit'; ui.overlay=''; render();
  }
  // AlarmClock: a long press (or a right click) on an alarm opens its context menu.
  function mount(c, root) { GB.hold(c, root, '.gbdc-alarm-body', alarm => { c.ui.dcContext = Number(alarm.dataset.id); c.ui.overlay = 'clock-context'; c.renderOverlay(); }); }
  window.GB?.register('clock', {
    context,
    render: c => GBDeskClock.render(context(c)),
    mount,
    menu(c) { c.gbMenu(GBDeskClock.menu(context(c))); },
    // Back in the editor saves the alarm, as AlarmClock's SetAlarm does.
    back(c) { if (c.ui.sub !== 'alarm-edit') return false; c.viewport.querySelector('[data-action="alarm-save"]')?.click(); return true; },
    action(name, el, c) {
      const id = el.dataset.id, {data, ui, save, render, renderOverlay} = c, overlayRoot = c.overlayRoot;
      switch (name) {
        case 'clock-alarms': ui.sub='alarms'; render(); break;
        case 'clock-dim': ui.clockDim=!ui.clockDim; render(); break;
        case 'alarm-new': editAlarm(c, ); ui.alarmDraft.enabled = true; ui.alarmDraft.isNew = true; ui.dcTemp = {time: ui.alarmDraft.time}; ui.overlay = 'clock-time'; renderOverlay(); break;
        case 'alarm-edit': editAlarm(c, id); break;
        case 'alarm-cancel': ui.alarmDraft=null; ui.sub='alarms'; render(); break;
        case 'alarm-draft-toggle': ui.alarmDraft[id]=!ui.alarmDraft[id]; render(); break;
        case 'alarm-field': ui.dcTemp = {time: ui.alarmDraft.time, days: [...(ui.alarmDraft.days || [])], tone: ICSDeskClock.normalize(ui.alarmDraft).tone}; ui.overlay='clock-'+id; renderOverlay(); break;
        case 'dc-time-step': { const [field, step] = id.split(':'); let [h, m] = ui.dcTemp.time.split(':').map(Number); if (field === 'hour') h = (h + Number(step) + 24) % 24; else m = (m + Number(step) + 60) % 60; ui.dcTemp.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; renderOverlay(); break; }
        case 'dc-ampm': { const [h, m] = ui.dcTemp.time.split(':').map(Number); ui.dcTemp.time = `${String((h + 12) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`; renderOverlay(); break; }
        case 'dc-time-set': ui.alarmDraft.time = ui.dcTemp.time; ui.alarmDraft.enabled = true; ui.overlay = ''; render(); break;
        case 'dc-day': { const day = Number(id), days = ui.dcTemp.days; ui.dcTemp.days = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort(); renderOverlay(); break; }
        case 'dc-days-ok': ui.alarmDraft.days = ui.dcTemp.days; ui.overlay = ''; render(); break;
        case 'dc-tone': ui.dcTemp.tone = id; renderOverlay(); break;
        case 'dc-tone-ok': ui.alarmDraft.tone = ui.dcTemp.tone; ui.overlay = ''; render(); break;
        case 'dc-label-ok': ui.alarmDraft.label = String(overlayRoot.querySelector('[data-dc-label]')?.value || '').trim().slice(0, 60); ui.overlay = ''; render(); break;
        case 'dc-delete-from-list': ui.alarmDraft = ICSDeskClock.normalize(data.alarms.find(alarm => alarm.id === Number(id))); ui.overlay = 'clock-delete'; renderOverlay(); break;
        case 'alarm-save': {
          const alarm=ICSDeskClock.normalize(ui.alarmDraft); delete alarm.snoozedUntil; delete alarm.lastFiredMinute;
          const index=data.alarms.findIndex(item=>item.id===alarm.id);
          if(index<0){alarm.id=Date.now();data.alarms.push(alarm);}else data.alarms[index]=alarm;
          delete alarm.isNew; save(); ui.alarmDraft=null; ui.sub='alarms'; render(); if (alarm.enabled) alarmSetToast(c, alarm); break;
        }
        case 'alarm-delete': ui.overlay='clock-delete'; renderOverlay(); break;
        case 'alarm-confirm-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==ui.alarmDraft.id); save(); ui.alarmDraft=null; ui.overlay=''; ui.sub='alarms'; render(); break;
        case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } ui.overlay = ''; save(); render(); if (alarm?.enabled) alarmSetToast(c, alarm); break; }
        default: return false;
      }
      return true;
    },
    clearData(c) { c.data.alarms = c.clone(c.defaults.alarms); }
  });
})();

/* AlarmAlert of Android 2.3.6 (DeskClock.apk) as a module (docs/plans/engine-migration.md): a due alarm rings over any
   screen (the keyguard's wallpaper behind it when locked); Snooze sets it again after Clock's snooze duration. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  window.GB?.register('alarm', {
    overlay(c) {
      const {ui, screen} = c;
      return GBDeskClock.alert({...GB.module('clock').context(c), wallpaper: ui.locked ? screen.style.background : ''});
    },
    tick(c) {
      const {data, ui, save, renderOverlay} = c, clone = c.clone, now = c.deviceDate();
    if(ui.overlay==='clock-ringing')return;
    const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
  
    },
    action(name, el, c) {
      const {data, ui, save, render, toast, deviceDate} = c;
      switch (name) {
        case 'alarm-snooze': {
          const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
          // Snooze duration from the Clock settings (snooze_duration: 5, 10, ... 30 minutes).
          const minutes=5*((data.appPrefs?.clock?.snooze_duration??1)+1);
          if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+minutes*60000;save();}
          ui.overlay='';render();toast(AndroidStrings.format(GBDeskClock.text(i18n.language,'alarm_alert_snooze_set'), String(minutes)));break;
        }
        case 'alarm-dismiss': ui.overlay=''; render(); break;
        default: return false;
      }
      return true;
    }
  });
})();
