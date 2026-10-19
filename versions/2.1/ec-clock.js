/* Android 2.1 Clock (DeskClock.apk, ERE27): the desk clock, the alarm list, Set alarm, the alarm settings and the alert.
   - DeskClock (Theme.Wallpaper.NoTitleBar, desk_clock.xml): over the wallpaper dimmed by DIM_BEHIND_AMOUNT_NORMAL 0.4;
     margins 22 / 18 / 18 / 14 dp; the next alarm (Settings NEXT_ALARM_FORMATTED, ic_lock_idle_alarm, 18 sp) with the
     round Dim button (RoundTouchButton: incall_round_button, ic_round_brightness); the time (106 sp, white, shadow) with
     AM / PM (18 sp bold) and the date (full_wday_month_day_no_year); the battery level ("%d%%", ic_lock_idle_charging)
     while plugged in; the strip of Alarms / Gallery / Music / Launcher (btn_strip_trans_left / middle / right).
     Dim (doDim): full screen, DIM_BEHIND_AMOUNT_DIMMED 0.7 and window_tint #cc000000 fading in over 500 ms (anim/dim);
     touching the clock again undims. Menu (desk_clock_menu): Alarms, Add alarm, Dock settings. Weather (from the News
     and Weather provider) is not shown.
   - AlarmClock (alarm_clock.xml): "Add alarm" (add_alarm in the 68 dp left column, 22 sp), then alarm_time rows: the
     68 dp indicator (clock_selector; ic_clock_alarm_on / _selected with ic_indicator_on / _off) toggles the alarm, then
     divider_vertical_dark and the time (28 sp) + AM / PM + label (14 sp bold, tertiary, right) over the days (14 sp
     secondary); the bottom strip: the desk clock button and a DigitalClock (48 sp). Long press: Turn alarm on / off,
     Edit alarm, Delete alarm (delete_alarm_confirm). Menu (alarm_list_menu): Desk clock, Add alarm, Settings.
     AlarmProvider's two alarms: 8:30 Monday–Friday and 9:00 Saturday–Sunday, off, vibrating.
   - SetAlarm (alarm_prefs.xml + save_cancel_alarm.xml Done / Revert / Delete): Turn alarm on, Time (TimePickerDialog;
     setting a time turns the alarm on), Repeat (RepeatPreference: the weekdays in a multi-choice list), Ringtone
     (AlarmPreference: alarm sounds, Silent, no default), Vibrate, Label (EditTextPreference). Turning on shows the
     alarm_set toast (Alarms.formatToast); Back saves like Done. A new alarm is the provider's empty row: 0:00, off,
     vibrating, the default alert.
   - SettingsActivity (settings.xml): Alarm in silent mode, Alarm volume, Snooze duration (10), Side button behavior
     (Dismiss).
   - AlarmAlert (alarm_alert.xml on dialog.9.png): the label or "Alarm", the time (64 sp), Snooze / Dismiss; the alert
     loops (ALARM_TIMEOUT 10 minutes, then silenced) and vibrates; Snooze shows "Snoozing for %d minutes." and the
     "<label> (snoozed)" notification. Days: Alarm.DaysOfWeek (bit 0 Monday); "every day", "Never", short weekday names
     joined by day_concat. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const K = () => EC.text('clock'), F = () => EC.text('framework');
  // AlarmProvider's two alarms, then the simulator's demo alarm of every version (docs/demo-data.md): 7:00 on weekdays, on.
  EC.defaults.alarms = [
    {id: 3, time: '7:00', days: [0, 1, 2, 3, 4], enabled: true, vibrate: true, label: '', alert: null},
    {id: 1, time: '8:30', days: [0, 1, 2, 3, 4], enabled: false, vibrate: true, label: '', alert: null},
    {id: 2, time: '9:00', days: [5, 6], enabled: false, vibrate: true, label: '', alert: null}
  ];
  const hm = a => String(a.time).split(':').map(Number);
  // A day in DaysOfWeek order (0 = Monday) as a Date of this week, for its names.
  const dayDate = d => new Date(2024, 0, 1 + d);   // 1 Jan 2024 was a Monday
  function daysText(c, days, showNever) {
    if (!days?.length) return showNever ? K().t('never') : '';
    if (days.length === 7) return K().t('every_day');
    return [...days].sort().map(d => dayDate(d).toLocaleDateString(c.locale(), {weekday: 'short'})).join(K().t('day_concat'));
  }
  // Alarms.calculateAlarm: the next time it rings (the device clock), or null when off.
  function nextTime(c, a) {
    if (!a.enabled) return null;
    if (a.snooze && a.snooze > c.now().getTime()) return new Date(a.snooze);
    const now = c.now(), [h, m] = hm(a);
    for (let add = 0; add < 8; add++) {
      const d = new Date(now); d.setDate(now.getDate() + add); d.setHours(h, m, 0, 0);
      if (d <= now) continue;
      if (a.days?.length && !a.days.includes((d.getDay() + 6) % 7)) continue;
      return d;
    }
    return null;
  }
  function nextAlarm(c) {
    let best = null;
    for (const a of c.data.alarms || []) { const t = nextTime(c, a); if (t && (!best || t < best)) best = t; }
    return best;
  }
  const timeParts = (c, h, m) => c.is24() ? {time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, ampm: ''}
    : {time: `${h % 12 || 12}:${String(m).padStart(2, '0')}`, ampm: c.javaAmPm(h)};
  // Alarms.formatToast: the time until it rings in days, hours and minutes, alarm_set[days | hours << 1 | minutes << 2].
  function toastSet(c, a) {
    const t = nextTime(c, {...a, snooze: 0});
    if (!t) return;
    const delta = t - c.now(), hours = Math.floor(delta / 3600000), minutes = Math.floor(delta / 60000) % 60, days = Math.floor(hours / 24), h = hours % 24;
    const seq = (n, one, many) => n === 0 ? '' : n === 1 ? K().t(one) : K().fmt(many, c.lang, String(n));
    const index = (days > 0 ? 1 : 0) | (h > 0 ? 2 : 0) | (minutes > 0 ? 4 : 0);
    c.toast(formatSet(c, index, [seq(days, 'day', 'days'), seq(h, 'hour', 'hours'), seq(minutes, 'minute', 'minutes')]), true);
  }
  function formatSet(c, index, args) {
    const text = K().t('alarm_set')[index] || '';
    return AndroidStrings.format(text, ...args);
  }
  const save = c => { c.save(); c.render(); };

  // Desk clock ------------------------------------------------------------------------------------------------------------
  function deskClock(c) {
    const now = c.now(), t = timeParts(c, now.getHours(), now.getMinutes()), next = nextAlarm(c), s = c.data.settings;
    const nextText = next ? c.dateFormat(c.is24() ? 'E k:mm' : 'E h:mm aa', next) : '';
    const strip = [['alarms', 'ic_clock_strip_alarm', 'left'], ['gallery', 'ic_clock_strip_gallery', 'middle'], ['music', 'ic_clock_strip_music', 'middle'], ['home', 'ic_clock_strip_home', 'right']];
    return `<div class="ecdc${c.ui.clockDim ? ' dim' : ''}" data-action="ecdc-undim"><i class="ecdc-behind"></i><i class="ecdc-tint"></i>
      <div class="ecdc-body">
        <div class="ecdc-top"><div class="ecdc-next">${next ? `<img src="assets/dc-ic_lock_idle_alarm.png" alt=""><span>${esc(nextText)}</span>` : ''}</div>
          <button type="button" class="ecdc-round" data-action="ecdc-dim" aria-label="${esc(K().t('nightmode_button_description'))}"><img src="assets/dc-ic_round_brightness.png" alt=""></button></div>
        <div class="ecdc-timedate"><div class="ecdc-time"><span class="ecdc-clock">${esc(t.time)}</span>${t.ampm ? `<span class="ecdc-ampm">${esc(t.ampm)}</span>` : ''}</div>
          <div class="ecdc-date">${esc(c.dateFormat(K().t('framework/full_wday_month_day_no_year'), now))}</div></div>
        <div class="ecdc-battery">${s.charging ? `<span>${esc(K().fmt('battery_charging_level', c.lang, s.battery))}</span><img src="assets/fw-ic_lock_idle_charging.png" alt="">` : ''}</div>
      </div>
      <div class="ecdc-strip">${strip.map(([id, icon, pos]) => `<button type="button" class="ecdc-sbtn" data-action="ecdc-${id}"><i class="ec-bg np-dc-btn_strip_trans_${pos}_normal"></i><i class="ec-bg ec-pressed np-dc-btn_strip_trans_${pos}_pressed"></i><img src="assets/dc-${icon}.png" alt=""></button>`).join('')}</div></div>`;
  }

  // Alarm list ------------------------------------------------------------------------------------------------------------
  function alarmList(c) {
    const now = c.now(), t = timeParts(c, now.getHours(), now.getMinutes());
    const rows = (c.data.alarms || []).slice().sort((a, b) => { const [ah, am] = hm(a), [bh, bm] = hm(b); return ah * 60 + am - (bh * 60 + bm); }).map(a => {
      const [h, m] = hm(a), p = timeParts(c, h, m);
      return `<div class="ecac-row" data-id="${a.id}"><button type="button" class="ecac-ind" data-action="ecac-toggle" data-id="${a.id}"><img class="ecac-clock" src="assets/dc-ic_clock_alarm_on.png" alt=""><img class="ecac-bar" src="assets/dc-ic_indicator_${a.enabled ? 'on' : 'off'}.png" alt=""></button>
        <i class="ecac-vdiv"></i><button type="button" class="ecac-main" data-action="ecac-edit" data-id="${a.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
          <span class="ecac-line"><span class="ecac-time">${esc(p.time)}</span>${p.ampm ? `<span class="ecac-ampm">${esc(p.ampm)}</span>` : ''}<span class="ecac-label">${esc(a.label)}</span></span>
          <span class="ecac-days">${esc(daysText(c, a.days, false))}</span></button></div><i class="ecpf-divider"></i>`;
    }).join('');
    return `<div class="ecac"><button type="button" class="ecac-add" data-action="ecac-add"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecac-addicon"><img src="assets/dc-ic_clock_add_alarm.png" alt=""></span><span>${esc(K().t('add_alarm'))}</span></button>
      <i class="ecpf-divider"></i><div class="ecac-list">${rows}</div>
      <div class="ecac-strip"><button type="button" class="ecdc-sbtn ecac-deskbtn" data-action="ecac-desk"><i class="ec-bg np-dc-btn_strip_trans_left_normal"></i><i class="ec-bg ec-pressed np-dc-btn_strip_trans_left_pressed"></i><img src="assets/dc-ic_clock_strip_desk_clock.png" alt=""></button>
        <div class="ecac-clockbox"><i class="ec-bg np-dc-btn_strip_trans_right_normal"></i><span class="ecac-bigtime">${esc(t.time)}</span>${t.ampm ? `<span class="ecac-bigampm">${esc(t.ampm)}</span>` : ''}</div></div></div>`;
  }

  // Set alarm ------------------------------------------------------------------------------------------------------------
  const pref = (key, title, summary, check) => `<button type="button" class="ecpf-row" data-action="ecsa-pref" data-key="${key}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecpf-text"><span class="ecpf-title">${esc(title)}</span>${summary ? `<span class="ecpf-summary">${esc(summary)}</span>` : ''}</span>${check === undefined ? '' : `<img class="ecpf-check" src="assets/fw-btn_check_${check ? 'on' : 'off'}.png" alt="">`}</button><i class="ecpf-divider"></i>`;
  const alertTitle = (c, a) => a.alert === '' ? K().t('silent_alarm_summary') : (EC.sounds?.list.alarms[a.alert ?? EC.sounds?.defaults.alarms] || [''])[0];
  function setAlarm(c) {
    const a = c.ui.clockEdit;
    const [h, m] = hm(a), p = timeParts(c, h, m);
    return c.window(K().t('set_alarm'), `<div class="ecsa"><div class="ecsa-list">
      ${pref('enabled', K().t('enable_alarm'), '', a.enabled)}
      ${pref('time', K().t('time'), p.time + (p.ampm ? ` ${p.ampm}` : ''))}
      ${pref('repeat', K().t('alarm_repeat'), daysText(c, a.days, true))}
      ${pref('alert', K().t('alert'), alertTitle(c, a))}
      ${pref('vibrate', K().t('alarm_vibrate'), '', a.vibrate)}
      ${pref('label', K().t('label'), a.label)}</div>
      <div class="ecsa-bar">${['done', 'revert', 'delete'].map(b => `<button type="button" class="ecui-button" data-action="ecsa-${b}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(K().t(b))}</span></button>`).join('')}</div></div>`);
  }
  function saveEdit(c) {
    const a = c.ui.clockEdit, list = c.data.alarms || [], at = list.findIndex(x => x.id === a.id);
    const was = at >= 0 ? list[at] : null;
    if (at >= 0) list[at] = {...a}; else list.push({...a});
    c.data.alarms = list;
    if (a.enabled && (!was || !was.enabled || was.time !== a.time || String(was.days) !== String(a.days))) toastSet(c, a);
    c.ui.clockEdit = null; c.ui.sub = 'alarms'; save(c);
  }
  function editPref(c, key) {
    const a = c.ui.clockEdit;
    if (key === 'enabled') { a.enabled = !a.enabled; c.render(); return; }
    if (key === 'vibrate') { a.vibrate = !a.vibrate; c.render(); return; }
    if (key === 'time') { const [h, m] = hm(a); c.timePicker({hour: h, minute: m, onSet: (hh, mm) => { a.time = `${hh}:${String(mm).padStart(2, '0')}`; a.enabled = true; toastSet(c, a); c.render(); }}); return; }
    if (key === 'alert') { EC.ringtonePicker(c, {cat: 'alarms', title: K().t('alert'), current: a.alert ?? EC.sounds?.defaults.alarms, onPick: f => { a.alert = f; }}); return; }
    if (key === 'repeat') {
      const names = [0, 1, 2, 3, 4, 5, 6].map(d => dayDate(d).toLocaleDateString(c.locale(), {weekday: 'long'}));
      let picked = [...(a.days || [])];
      c.dialog({title: K().t('alarm_repeat'), icon: null, items: names, choice: 'multi', checked: picked,
        onItem: (i, c2, d) => { picked = [...d.checked]; },
        buttons: [{label: F().t('ok'), action: () => { a.days = picked.sort(); c.render(); }}, {label: F().t('cancel')}]});
      return;
    }
    if (key === 'label') {
      let root = null;
      c.dialog({title: K().t('label'), icon: null, html: `<div class="ecsa-edit"><span class="ecwf-edit"><i class="ec-bg np-fw-textfield_default"></i><i class="ec-bg ecwf-focus np-fw-textfield_selected"></i><input class="ecwf-input" data-field="label" value="${esc(a.label)}" spellcheck="false" autocomplete="off"></span></div>`,
        mount: r => { root = r; setTimeout(() => r.querySelector('input')?.focus(), 50); },
        buttons: [{label: F().t('ok'), action: () => { a.label = root?.querySelector('input').value || ''; c.render(); }}, {label: F().t('cancel')}]});
    }
  }

  // Alarm settings (settings.xml) -------------------------------------------------------------------------------------------
  function settingsScreen(c) {
    const p = c.data.prefs || {}, snooze = String(p.snooze_duration ?? '10'), side = String(p.volume_button_setting ?? '2');
    const snoozeEntries = K().t('snooze_duration_entries'), sideEntries = K().t('volume_button_setting_entries');
    return c.window(K().t('settings'), `<div class="ecpf-list">
      ${pref('silent', K().t('alarm_in_silent_mode_title'), K().t('alarm_in_silent_mode_summary'), p.alarm_in_silent_mode !== false)}
      ${pref('volume', K().t('alarm_volume_title'), K().t('alarm_volume_summary'))}
      ${pref('snooze', K().t('snooze_duration_title'), snoozeEntries[['5', '10', '15', '20', '25', '30'].indexOf(snooze)])}
      ${pref('side', K().t('volume_button_setting_title'), K().t('volume_button_setting_summary'))}</div>`.replaceAll('data-action="ecsa-pref"', 'data-action="ecas-pref"'));
  }
  function settingsPref(c, key) {
    const p = (c.data.prefs ||= {});
    if (key === 'silent') { p.alarm_in_silent_mode = p.alarm_in_silent_mode === false; save(c); return; }
    if (key === 'volume') {
      const v = c.data.settings.volume?.alarm ?? 6;
      c.dialog({title: K().t('alarm_volume_title'), icon: null, html: `<div class="ecpf-dlg">${c.seekbar('alarm', v, 7)}</div>`, mount: root => c.bindSeek(root),
        buttons: [{label: F().t('ok'), action: (c2, d, root) => { c.data.settings.volume = {...c.data.settings.volume, alarm: Number(root.querySelector('[data-seek="alarm"]').dataset.value)}; c.save(); }}, {label: F().t('cancel')}]});
      return;
    }
    const [field, values, entries, title] = key === 'snooze' ? ['snooze_duration', ['5', '10', '15', '20', '25', '30'], K().t('snooze_duration_entries'), 'snooze_duration_title'] : ['volume_button_setting', ['0', '1', '2'], K().t('volume_button_setting_entries'), 'volume_button_setting_title'];
    const cur = String(p[field] ?? (key === 'snooze' ? '10' : '2'));
    c.dialog({title: K().t(title), icon: null, items: entries, choice: 'single', checked: values.indexOf(cur), closeOnChoice: true,
      buttons: [{label: F().t('cancel')}], onItem: i => { p[field] = values[i]; save(c); }});
  }

  // Alarm alert (overlay) -------------------------------------------------------------------------------------------------
  let ringing = null, sound = null, buzz = 0, timeout = 0;
  function ring(c, a) {
    ringing = a;
    const name = a.alert === '' ? null : (EC.sounds?.list.alarms[a.alert ?? EC.sounds?.defaults.alarms] || [])[1];
    if (name) { sound = new Audio(`../../assets/audio/${name}.webm`); sound.loop = true; sound.play().catch(() => {}); }
    if (a.vibrate) { navigator.vibrate?.([500, 500]); buzz = setInterval(() => navigator.vibrate?.([500, 500]), 1000); }
    clearTimeout(timeout); timeout = setTimeout(() => stop(c, true), 10 * 60000);
    // AlarmReceiver: the ongoing notification while it rings (FLAG_SHOW_LIGHTS, ledARGB 0xff00ff00, 500 / 500 ms), which
    // opens AlarmAlert again.
    c.notify({icon: 'dc-stat_notify_alarm.png', title: a.label || K().t('default_label'), text: K().t('alarm_notify_text'), ongoing: true, alarmId: a.id, overlay: 'alarm-alert',
      lights: {color: '#00ff00', on: 500, off: 500}});
    if (c.ui.sleeping) c.wake();
    c.overlay('alarm-alert');
  }
  function stop(c, silenced) {
    if (sound) { sound.pause(); sound = null; }
    clearInterval(buzz); clearTimeout(timeout); navigator.vibrate?.(0);
    const a = ringing; ringing = null;
    if (c.ui.overlay === 'alarm-alert') c.closeOverlay();
    // ALARM_KILLED: updateNotification puts the silenced one (FLAG_AUTO_CANCEL, no lights) in its place.
    if (a) for (const n of (c.data.notifications || []).filter(n => n.alarmId === a.id && n.lights)) c.cancelNotification(n.id);
    if (silenced && a) c.notify({icon: 'dc-stat_notify_alarm.png', title: a.label || K().t('default_label'), text: K().fmt('alarm_alert_alert_silenced', c.lang, 10), view: 'clock', sub: 'alarms'});
  }
  function finishAlarm(c, a, snooze) {
    const list = c.data.alarms || [], x = list.find(y => y.id === a.id);
    for (const n of (c.data.notifications || []).filter(n => n.alarmId === a.id)) c.cancelNotification(n.id);
    if (x) {
      x.snooze = 0;
      if (snooze) {
        const minutes = Number(c.data.prefs?.snooze_duration ?? 10), at = c.now().getTime() + minutes * 60000;
        x.snooze = at;
        c.toast(K().fmt('alarm_alert_snooze_set', c.lang, minutes), true);
        c.notify({icon: 'dc-stat_notify_alarm.png', title: K().fmt('alarm_notify_snooze_label', c.lang, x.label || K().t('default_label')), text: K().fmt('alarm_notify_snooze_text', c.lang, c.timeText(new Date(at))), ongoing: true, alarmId: x.id, view: 'clock', sub: 'alarms'});
      } else if (!x.days?.length) x.enabled = false;   // a one-time alarm turns itself off
    }
    stop(c); c.save(); c.render();
  }
  let lastMinute = '';
  function tick(c, now) {
    const minute = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}`;
    if (minute === lastMinute) { if (c.ui.view === 'clock' && !c.ui.sub && !c.ui.sleeping) updateClock(c); return; }
    lastMinute = minute;
    if (!ringing) {
      for (const a of c.data.alarms || []) {
        if (!a.enabled) continue;
        const [h, m] = hm(a), today = (now.getDay() + 6) % 7;
        const due = a.snooze ? Math.abs(a.snooze - now.getTime()) < 60000 && now.getTime() >= a.snooze
          : now.getHours() === h && now.getMinutes() === m && (!a.days?.length || a.days.includes(today));
        if (due) { ring(c, a); break; }
      }
    }
    if (['clock', 'lock', 'home'].includes(c.ui.view) && !c.ui.sleeping && !c.ui.overlay) c.render();
  }
  function updateClock(c) {
    const el = c.el.viewport.querySelector('.ecdc-clock');
    if (!el) return;
    const now = c.now(), t = timeParts(c, now.getHours(), now.getMinutes());
    if (el.textContent !== t.time) c.render();
  }

  EC.register('clock', {
    title: 'Clock',
    init(c) { c.nextAlarm = () => nextAlarm(c); },
    render(c) {
      const sub = c.ui.sub || '';
      if (sub === 'alarms') return c.window(K().t('alarm_list_title'), alarmList(c));
      if (sub === 'set' && c.ui.clockEdit) return setAlarm(c);
      if (sub === 'settings') return settingsScreen(c);
      return deskClock(c);
    },
    // Theme.Wallpaper: the desk clock sits on the wallpaper; dimmed it is full screen.
    wallpaper: c => !c.ui.sub,
    noStatus: c => !c.ui.sub && !!c.ui.clockDim,
    mount(c, root) {
      const add = root.querySelector('.ecac-add img');
      root.querySelector('.ecac-add')?.addEventListener('pointerdown', () => { if (add) add.src = 'assets/dc-ic_clock_add_alarm_selected.png'; });
      root.querySelector('.ecac-add')?.addEventListener('pointerup', () => { if (add) add.src = 'assets/dc-ic_clock_add_alarm.png'; });
      // A long press on an alarm row: its context menu (title: the time).
      for (const row of root.querySelectorAll('.ecac-main')) {
        let timer = 0;
        row.addEventListener('pointerdown', () => { timer = setTimeout(() => { c.suppressClick = Date.now() + 400; context(c, Number(row.dataset.id)); }, 500); });
        for (const t of ['pointerup', 'pointerleave', 'pointercancel']) row.addEventListener(t, () => clearTimeout(timer));
      }
      for (const ind of root.querySelectorAll('.ecac-ind')) {
        const img = ind.querySelector('.ecac-clock');
        ind.addEventListener('pointerdown', () => { img.src = 'assets/dc-ic_clock_alarm_selected.png'; });
        for (const t of ['pointerup', 'pointerleave']) ind.addEventListener(t, () => { img.src = 'assets/dc-ic_clock_alarm_on.png'; });
      }
    },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now() && name.startsWith('ecac-')) return true;
      const id = Number(el.dataset.id), alarm = (c.data.alarms || []).find(a => a.id === id);
      switch (name) {
        case 'ecdc-dim': event.stopPropagation(); c.ui.clockDim = !c.ui.clockDim; c.render(); return true;
        case 'ecdc-undim': if (c.ui.clockDim && !event.target.closest('button')) { c.ui.clockDim = false; c.render(); } return true;
        case 'ecdc-alarms': c.ui.clockDim = false; c.open('clock', 'alarms'); return true;
        case 'ecdc-gallery': c.open('gallery'); return true;
        case 'ecdc-music': c.open('music'); return true;
        case 'ecdc-home': c.home(); return true;
        case 'ecac-desk': c.open('clock', ''); return true;
        case 'ecac-add': {
          const next = Math.max(0, ...(c.data.alarms || []).map(a => a.id)) + 1;
          const a = {id: next, time: '0:00', days: [], enabled: false, vibrate: true, label: '', alert: null};
          c.data.alarms = [...(c.data.alarms || []), a]; c.save();
          c.ui.clockEdit = {...a}; c.open('clock', 'set'); return true;
        }
        case 'ecac-toggle': if (alarm) { alarm.enabled = !alarm.enabled; alarm.snooze = 0; if (alarm.enabled) toastSet(c, alarm); save(c); } return true;
        case 'ecac-edit': if (alarm) { c.ui.clockEdit = {...alarm, days: [...(alarm.days || [])]}; c.open('clock', 'set'); } return true;
        case 'ecsa-pref': editPref(c, el.dataset.key); return true;
        case 'ecsa-done': saveEdit(c); return true;
        case 'ecsa-revert': c.ui.clockEdit = null; c.ui.sub = 'alarms'; c.render(); return true;
        case 'ecsa-delete': confirmDelete(c, c.ui.clockEdit.id, () => { c.ui.clockEdit = null; c.ui.sub = 'alarms'; }); return true;
        case 'ecas-pref': settingsPref(c, el.dataset.key); return true;
      }
      return false;
    },
    menu(c) {
      const sub = c.ui.sub || '';
      if (sub === 'set' || sub === 'settings') return true;
      const addAlarm = {label: K().t('add_alarm'), icon: 'dc-ic_menu_add.png', action: () => c.el.viewport.querySelector('[data-action="ecac-add"]') ? c.el.viewport.querySelector('[data-action="ecac-add"]').click() : EC.module('clock').action('ecac-add', document.createElement('i'), new Event('click'), c)};
      if (sub === 'alarms') c.menu([{label: K().t('menu_desk_clock'), icon: 'dc-ic_menu_desk_clock.png', action: () => c.open('clock', '')}, addAlarm,
        {label: K().t('settings'), icon: 'fw-ic_menu_preferences.png', action: () => c.open('clock', 'settings')}]);
      else c.menu([{label: K().t('alarm_list_title'), icon: 'dc-ic_menu_alarms.png', action: () => c.open('clock', 'alarms')}, addAlarm,
        {label: K().t('menu_item_dock_settings'), icon: 'fw-ic_menu_preferences.png', action: () => { c.open('settings'); c.ui.settingsStack = ['settings', 'sound_and_display_settings']; c.render(); }}]);
      return true;
    },
    back(c) {
      if (c.ui.sub === 'set') { saveEdit(c); return true; }   // SetAlarm.onBackPressed saves
      if (c.ui.sub === 'settings') { c.ui.sub = 'alarms'; c.render(); return true; }
      if (c.ui.clockDim) { c.ui.clockDim = false; c.render(); return true; }
      return false;
    },
    tick
  });
  function context(c, id) {
    const a = (c.data.alarms || []).find(x => x.id === id);
    if (!a) return;
    const [h, m] = hm(a), p = timeParts(c, h, m);
    c.dialog({title: p.time + (p.ampm ? ` ${p.ampm}` : ''), icon: null, items: [K().t(a.enabled ? 'disable_alarm' : 'enable_alarm'), K().t('menu_edit_alarm'), K().t('delete_alarm')],
      onItem: i => {
        if (i === 0) { a.enabled = !a.enabled; a.snooze = 0; if (a.enabled) toastSet(c, a); save(c); }
        else if (i === 1) { c.ui.clockEdit = {...a, days: [...(a.days || [])]}; c.open('clock', 'set'); }
        else confirmDelete(c, id);
      }});
  }
  function confirmDelete(c, id, after) {
    c.dialog({title: K().t('delete_alarm'), icon: 'fw-ic_dialog_alert.png', message: K().t('delete_alarm_confirm'),
      buttons: [{label: F().t('ok'), action: () => { c.data.alarms = (c.data.alarms || []).filter(a => a.id !== id); after?.(); save(c); }}, {label: F().t('cancel')}]});
  }

  EC.register('alarm-alert', {
    app: false,
    render(c) {
      const a = ringing;
      if (!a) return '';
      const [h, m] = hm(a), p = timeParts(c, h, m);
      return `<div class="ecaa-dim"></div><div class="ecaa"><div class="ecaa-box npp-dc-dialog"><i class="ec-bg np-dc-dialog"></i>
        <div class="ecaa-title">${esc(a.label || K().t('default_label'))}</div><i class="ecaa-divider np-fw-dialog_divider_horizontal_light"></i>
        <div class="ecaa-time"><span>${esc(p.time)}</span>${p.ampm ? `<b>${esc(p.ampm)}</b>` : ''}</div>
        <div class="ecaa-bar"><button type="button" class="ecui-button" data-action="ecaa-snooze"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(K().t('alarm_alert_snooze_text'))}</span></button><i class="ecaa-gap"></i><button type="button" class="ecui-button" data-action="ecaa-dismiss"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(K().t('alarm_alert_dismiss_text'))}</span></button></div></div></div>`;
    },
    action(name, el, event, c) {
      if (name === 'ecaa-snooze') { finishAlarm(c, ringing, true); return true; }
      if (name === 'ecaa-dismiss') { finishAlarm(c, ringing, false); return true; }
      return false;
    },
    back: () => true   // AlarmAlert ignores Back
  });
  EC.alarmTest = c => ring(c, (c.data.alarms || [])[0] || EC.defaults.alarms[0]);
})();
