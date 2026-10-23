/* Android 7.1.2 Settings: Display, Sound, Other sounds, Do not disturb and Notifications' gear (SettingsGoogle.apk
   N2G48C), as NG.settingsHooks over the image's res/xml. The logic is 6.0.1's (its Display and Sound &
   notification hooks); what differs is read from the N2G48C classes:
   - DisplaySettings.onCreate on the 6P: night_display goes (config_nightDisplayAvailable false), lift_to_wake (no wake
     gesture sensor), tap_to_wake (config_supportDoubleTapWake false) and camera_gesture
     (config_cameraLaunchGestureSensorType -1); Ambient display stays (config_dozeComponent), so do the screen saver
     (config_dreamsSupported), auto_rotate (a DropDownPreference of "Rotate the contents of the screen" / "Stay in portrait
     view", config_allowAllRotations false) and vr_display_pref (the image declares android.hardware.vr.high_performance:
     "Reduce blur (recommended)" / "Reduce flicker"). The timeout's summary is screen_timeout_summary with the largest
     entry not over the value; font size shows entries_font_size, Display size ScreenZoomPreference's entry (the 6P's
     DisplayDensityUtils: Small, Default, Large, Larger, Largest around 560 dpi; ng-settings-a11y.js); the screen saver the active dream's name
     (config_dreamsEnabledByDefault, the Clock's Screensaver) or "Off". Brightness level opens SystemUI's BrightnessDialog.
   - The simulator's rule (every version): the screen does not go off by itself unless a timeout is chosen, so Sleep
     starts at "Never", an entry after screen_timeout_entries in Settings' own Never text.
   - SoundSettings: the 6P is voice capable, so Ring volume stays and Notification volume goes; Emergency broadcasts
     stay (config_cellBroadcastAppLinks, CellBroadcastReceiver enabled). VolumeSeekBarPreference
     (preference_volume_slider.xml: listPreferredItemHeight 64 dp at least, 16 dp at the sides, 8 dp above and below,
     the Subhead title, 6 dp under it the 24 dp icon and the SeekBar 24 dp after its start) for media (0–15), alarm (0–7)
     and ring (0–7), the mute icon at 0, ic_audio_ring_notif_vibrate in vibrate mode; moving ring to 0 sets vibrate.
     The ringtones open RingtonePickerActivity (None and the system sounds' titles, Cancel / OK) and show the chosen
     title (build.prop of N2G48C).
   - OtherSoundSettings: docking sounds and dock audio go (no dock), the emergency tone too (a GSM / CDMA phone keeps it
     only on CDMA); boot sounds (ro.config.boot_sounds absent) go.
   - Do not disturb (ZenModeSettings): Priority only allows (the summary joins Alarms with what the policy allows, in
     lower case: default_zen_mode_config.xml allows calls from contacts, reminders and events, not messages; repeat
     callers off, config_zen_repeat_callers_threshold 15 minutes); Block visual disturbances (When screen is on / off,
     Off). Automatic rules: ZenModeHelper's default Weeknight, Weekend and Event rules, all off.
   - ConfigureNotificationSettings (the Notifications list's gear): Pulse notification light (config_intrusiveNotificationLed)
     and On the lock screen ("Show all notification content" / "Don't show notifications at all" without a secure lock). */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks = NG.settingsHooks || {};
  const S = c => c.data.settings;
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const appLabel = (c, id) => { const a = NG.appsData?.[id]; return a ? a.label[c.lang] || a.label.en : ''; };

  H.display_settings = {
    hidden: ['night_display', 'lift_to_wake', 'tap_to_wake', 'camera_gesture'],
    get(c, key) {
      const s = S(c);
      if (key === 'auto_brightness') return s.brightnessAuto;
      if (key === 'screen_timeout') return String(s.screenTimeout ?? -1);
      if (key === 'doze') return s.doze ?? true;
      if (key === 'auto_rotate') return s.rotationLocked ? '1' : '0';
      if (key === 'vr_display_pref') return String(s.vrDisplayMode ?? 0);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_brightness') { s.brightnessAuto = v; NG.system?.applyBrightness(c); NG.system?.changed(c); return true; }
      if (key === 'doze') { s.doze = v; return true; }
      return false;
    },
    summary(c, key, n) {
      const t = T(), s = S(c);
      if (key === 'screen_timeout') {
        const values = n.entryValues, entries = NG.settingsArr(n.entries), cur = s.screenTimeout ?? -1;
        if (cur < 0) return t.t('battery_saver_turn_on_automatically_never');
        let best = 0; values.forEach((v, i) => { if (cur >= +v) best = i; });
        return t.fmt('screen_timeout_summary', null, entries[best]);
      }
      if (key === 'auto_rotate') return t.t(s.rotationLocked ? 'display_auto_rotate_stay_in_portrait' : 'display_auto_rotate_rotate');
      if (key === 'vr_display_pref') return t.t((s.vrDisplayMode ?? 0) ? 'display_vr_pref_off' : 'display_vr_pref_low_persistence');
      if (key === 'screensaver') return s.dreams === false ? t.t('screensaver_settings_summary_off') : NG.settingsDreamName?.(c) || appLabel(c, 'clock');
      if (key === 'font_size') return NG.settingsFontSummary?.(c) ?? '';
      if (key === 'screen_zoom') return NG.settingsZoomSummary?.(c) ?? '';
      return undefined;
    },
    click(c, key, n) {
      const t = T(), s = S(c);
      if (key === 'brightness') { c.overlay('brightness'); return true; }
      if (key === 'wallpaper') { NG.settingsGo(c, 'wallpaper-type', t.t('wallpaper_settings_title')); return true; }
      if (key === 'auto_rotate') {
        const items = [t.t('display_auto_rotate_rotate'), t.t('display_auto_rotate_stay_in_portrait')];
        c.dialog({title: NG.settingsStr(n.title), items: items.map((label, i) => radio(c, label, (i === 1) === !!s.rotationLocked)), buttons: [{label: t.t('framework/cancel')}],
          onItem: i => { NG.system.setRotationLocked(c, i === 1); c.render(); }});
        return true;
      }
      if (key === 'vr_display_pref') {
        const items = [t.t('display_vr_pref_low_persistence'), t.t('display_vr_pref_off')];
        c.dialog({title: NG.settingsStr(n.title), items: items.map((label, i) => radio(c, label, i === (s.vrDisplayMode ?? 0))), buttons: [{label: t.t('framework/cancel')}],
          onItem: i => { s.vrDisplayMode = i; c.save(); c.render(); }});
        return true;
      }
      if (key === 'screen_timeout') {
        const cur = String(s.screenTimeout ?? -1);
        const values = [...n.entryValues, '-1'], labels = [...NG.settingsArr(n.entries), t.t('battery_saver_turn_on_automatically_never')];
        c.dialog({title: NG.settingsStr(n.dialogTitle) || NG.settingsStr(n.title), items: labels.map((label, i) => radio(c, label, values[i] === cur)),
          buttons: [{label: t.t('framework/cancel')}], onItem: i => { s.screenTimeout = +values[i]; c.save(); c.render(); }});
        return true;
      }
      if (key === 'font_size') { NG.settingsGo(c, 'font-size', NG.settingsStr(n.title)); return true; }
      if (key === 'screen_zoom') { NG.settingsGo(c, 'screen-zoom', NG.settingsStr(n.title)); return true; }
      return false;
    }
  };

  // -- Sound -----------------------------------------------------------------------------------------------------
  const vol = c => S(c).volume || (S(c).volume = {voice: 4, ring: 5, music: 11, alarm: 6});
  const STREAMS = {media_volume: ['music', 15, 'ic_audio_media'], alarm_volume: ['alarm', 7, 'ic_audio_alarm'], ring_volume: ['ring', 7, 'ic_audio_ring_notif']};
  const tone = (c, kind) => (S(c).tones || {})[kind] ?? NG.settingsRingtones[kind].default;
  function icon(c, key, level) {
    const [, , base] = STREAMS[key], s = S(c);
    if (key === 'ring_volume' && s.zen === 2) return `${base}_mute`;
    if (key === 'ring_volume' && s.ringerMode === 'vibrate') return 'ic_audio_ring_notif_vibrate';
    return level === 0 ? `${base}_mute` : base;
  }
  // SoundSettings.updateEffectsSuppressor / VolumeSeekBarPreference: "Muted by …" while Do not disturb silences the ringer.
  function slider(c, n) {
    const [stream, max] = STREAMS[n.key], s = S(c), level = n.key === 'ring_volume' && s.ringerMode !== 'normal' ? 0 : vol(c)[stream] ?? 0, v = level / max;
    return `<div class="ngst-volume" data-key="${n.key}"><div class="ngst-title">${c.safe(NG.settingsStr(n.title))}</div>
      <div class="ngst-volrow"><i class="ngst-volicon" style="-webkit-mask-image:url('assets/fw-${icon(c, n.key, level)}.svg');mask-image:url('assets/fw-${icon(c, n.key, level)}.svg')"></i><div class="ngst-seek" role="slider" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${level}" style="--v:${v.toFixed(4)}"><i class="ngst-seek-track"></i><i class="ngst-seek-progress"></i><i class="ngst-seek-thumb"></i></div></div></div>`;
  }
  // The SeekBar follows the pointer (Widget.Material.SeekBar: 16 dp padding at each end); the stream takes the nearest step.
  function bind(c, root) {
    for (const row of root.querySelectorAll('.ngst-volume')) {
      const key = row.dataset.key, [stream, max] = STREAMS[key], bar = row.querySelector('.ngst-seek');
      bar.addEventListener('pointerdown', e => {
        e.preventDefault(); e.stopPropagation(); try { bar.setPointerCapture(e.pointerId); } catch {}
        bar.classList.add('pressed');
        const move = ev => {
          const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.43;
          const level = Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * max);
          if (vol(c)[stream] === level && !(stream === 'ring' && S(c).ringerMode !== 'normal' && level > 0)) return;
          vol(c)[stream] = level || (stream === 'ring' ? vol(c)[stream] : 0);
          if (stream === 'ring') S(c).ringerMode = level === 0 ? 'vibrate' : 'normal';
          bar.style.setProperty('--v', (level / max).toFixed(4)); bar.setAttribute('aria-valuenow', level);
          const ic = row.querySelector('.ngst-volicon'), file = `assets/fw-${icon(c, key, level)}.svg`;
          ic.style.webkitMaskImage = ic.style.maskImage = `url('${file}')`;
        };
        move(e);
        const up = () => { bar.classList.remove('pressed'); bar.removeEventListener('pointermove', move); c.save(); NG.system?.changed(c); };
        bar.addEventListener('pointermove', move);
        bar.addEventListener('pointerup', up, {once: true}); bar.addEventListener('pointercancel', up, {once: true});
      });
    }
  }
  // RingtonePickerActivity (framework AlertDialog): None first (showSilent), then the titles; OK keeps the choice. For an
  // app (RingtoneManager.ACTION_RINGTONE_PICKER) the default sound's row comes first (EXTRA_RINGTONE_SHOW_DEFAULT).
  NG.ringtonePicker = (c, {kind, current, defaultTitle, onPick}) => {
    const t = T(), list = [...(defaultTitle ? ['default'] : []), '', ...NG.settingsRingtones[kind].titles];
    let pick = Math.max(0, list.indexOf(current ?? (defaultTitle ? 'default' : '')));
    const label = v => v === 'default' ? defaultTitle : v || t.t('framework/ringtone_silent');
    c.dialog({title: t.t('framework/ringtone_picker_title'), keepOpen: true, items: list.map((v, i) => radio(c, label(v), i === pick)),
      onItem: (i, c) => { pick = i; c.el.overlay.querySelectorAll('.ngdlg-item .ngw-radio').forEach((r, j) => r.classList.toggle('on', j === i)); },
      buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => onPick(c, list[pick])}]});
  };
  const picker = (c, kind) => NG.ringtonePicker(c, {kind, current: tone(c, kind), onPick: (c, v) => { S(c).tones = {...(S(c).tones || {}), [kind]: v}; c.save(); c.render(); }});

  H.sound_settings = {
    hidden: ['notification_volume'],
    row: (c, key, n) => STREAMS[key] ? slider(c, n) : null,
    mount: bind,
    get(c, key) { if (key === 'vibrate_when_ringing') return !!S(c).vibrateWhenRinging; return undefined; },
    set(c, key, v) { if (key === 'vibrate_when_ringing') { S(c).vibrateWhenRinging = v; return true; } return false; },
    summary(c, key) {
      const t = T();
      if (key === 'ringtone') return tone(c, 'ringtone') || t.t('framework/ringtone_silent');
      if (key === 'notification_ringtone') return tone(c, 'notification') || t.t('framework/ringtone_silent');
      if (key === 'alarm_ringtone') return tone(c, 'alarm') || t.t('framework/ringtone_silent');
      return undefined;
    },
    click(c, key) {
      if (key === 'ringtone') { picker(c, 'ringtone'); return true; }
      if (key === 'notification_ringtone') { picker(c, 'notification'); return true; }
      if (key === 'alarm_ringtone') { picker(c, 'alarm'); return true; }
      // The row's intent: CellBroadcastReceiver's CellBroadcastSettings activity (ng-cellbroadcast.js), titled with its label.
      if (key === 'cell_broadcast_settings') { NG.openPrefs(c, 'cellbroadcast', 'preferences', NG.appPrefStr('string/CellBroadcastReceiver/sms_cb_settings')); return true; }
      return false;
    }
  };
  H.other_sound_settings = {
    hidden: ['docking_sounds', 'dock_audio_media', 'emergency_tone', 'boot_sounds'],
    get(c, key) {
      const o = S(c).otherSounds || {};
      return ['dial_pad_tones', 'screen_locking_sounds', 'charging_sounds', 'touch_sounds', 'vibrate_on_touch'].includes(key) ? o[key] ?? true : undefined;
    },
    set(c, key, v) { S(c).otherSounds = {...(S(c).otherSounds || {}), [key]: v}; return true; }
  };

  // -- Do not disturb ---------------------------------------------------------------------------------------------
  const zen = c => S(c).zenConfig || (S(c).zenConfig = {calls: true, messages: false, reminders: true, events: true, repeatCallers: false, callsFrom: 1, messagesFrom: 1, screenOn: false, screenOff: false});
  NG.zenConfig = zen;
  const SOURCES = [['zen_mode_from_anyone', 0], ['zen_mode_from_contacts', 1], ['zen_mode_from_starred', 2], ['zen_mode_from_none', -1]];
  const source = (z, kind) => z[kind] ? z[kind + 'From'] : -1;
  const lower = (c, s) => s.toLocaleLowerCase(c.locale());
  H.zen_mode_settings = {
    summary(c, key) {
      const t = T(), z = zen(c), add = (out, name) => t.fmt('join_many_items_middle', null, out, lower(c, t.t(name)));
      if (key === 'priority_settings') {
        let out = t.t('zen_mode_alarms');
        if (z.reminders) out = add(out, 'zen_mode_reminders');
        if (z.events) out = add(out, 'zen_mode_events');
        if (z.messages) out = add(out, z.messagesFrom ? 'zen_mode_selected_messages' : 'zen_mode_all_messages');
        if (z.calls) out = add(out, z.callsFrom ? 'zen_mode_selected_callers' : 'zen_mode_all_callers');
        else if (z.repeatCallers) out = add(out, 'zen_mode_repeat_callers');
        return out;
      }
      if (key === 'visual_interruptions_settings') {
        if (z.screenOn && z.screenOff) return t.t('zen_mode_no_visual_interruptions');
        if (z.screenOn) return t.t('zen_mode_screen_on_visual_interruptions');
        if (z.screenOff) return t.t('zen_mode_screen_off_visual_interruptions');
        return t.t('zen_mode_all_visual_interruptions');
      }
      return undefined;
    }
  };
  H.zen_mode_priority_settings = {
    get(c, key) {
      const z = zen(c);
      if (key === 'alarms') return true;
      if (key === 'reminders' || key === 'events') return z[key];
      if (key === 'repeat_callers') return z.repeatCallers;
      return undefined;
    },
    set(c, key, v) {
      const z = zen(c);
      if (key === 'reminders' || key === 'events') { z[key] = v; return true; }
      if (key === 'repeat_callers') { z.repeatCallers = v; return true; }
      return false;
    },
    disabled: (c, key) => key === 'alarms' || (key === 'repeat_callers' && zen(c).calls && zen(c).callsFrom === 0),
    summary(c, key) {
      const t = T(), z = zen(c);
      if (key === 'messages' || key === 'calls') return t.t(SOURCES.find(([, v]) => v === source(z, key))[0]);
      if (key === 'repeat_callers') return t.fmt('zen_mode_repeat_callers_summary', null, 15);
      return undefined;
    },
    click(c, key, n) {
      if (key !== 'messages' && key !== 'calls') return false;
      const t = T(), z = zen(c), cur = source(z, key);
      c.dialog({title: NG.settingsStr(n.title), items: SOURCES.map(([label, v]) => radio(c, t.t(label), v === cur)), buttons: [{label: t.t('framework/cancel')}],
        onItem: i => { const v = SOURCES[i][1]; z[key] = v !== -1; if (v !== -1) z[key + 'From'] = v; c.save(); c.render(); }});
      return true;
    }
  };
  H.zen_mode_visual_interruptions_settings = {
    get(c, key) { const z = zen(c); return key === 'screenOn' || key === 'screenOff' ? !!z[key] : undefined; },
    set(c, key, v) { zen(c)[key] = v; return true; }
  };

  // Automatic rules (ZenModeAutomationSettings) over ZenModeConfig's automaticRules: the framework's defaults first.
  const ZEN = [['important_interruptions', 1], ['alarms', 3], ['no_interruptions', 2]];
  const REPLIES = ['zen_mode_event_rule_reply_any_except_no', 'zen_mode_event_rule_reply_yes_or_maybe', 'zen_mode_event_rule_reply_yes'];
  const DEFAULT_RULES = () => [
    {id: 1, name: 'framework/zen_mode_default_weeknights_name', kind: 'schedule', on: false, days: [0, 1, 2, 3, 4], start: [22, 0], end: [7, 0], mode: 1},
    {id: 2, name: 'framework/zen_mode_default_weekends_name', kind: 'schedule', on: false, days: [5, 6], start: [23, 30], end: [10, 0], mode: 1},
    {id: 3, name: 'framework/zen_mode_default_events_name', kind: 'event', on: false, reply: 1, mode: 1}];
  const rules = c => S(c).zenRules || (S(c).zenRules = DEFAULT_RULES());
  const ruleName = r => r.name.startsWith('framework/') ? T().t(r.name) : r.name;
  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  const hm = (c, [h, m]) => new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: !is24(c)}).format(new Date(2016, 0, 3, h, m));
  const firstDay = c => { try { return (new Intl.Locale(c.locale()).weekInfo?.firstDay ?? 1) % 7; } catch { return 1; } };
  const weekOrder = c => Array.from({length: 7}, (_, i) => (firstDay(c) + i) % 7);
  const dayName = (c, d, style = 'short') => new Intl.DateTimeFormat(c.locale(), {weekday: style}).format(new Date(2016, 0, 3 + d));
  function daysText(c, r) {
    const t = T();
    if (!r.days.length) return t.t('zen_mode_schedule_rule_days_none');
    if (r.days.length === 7) return t.t('zen_mode_schedule_rule_days_all');
    return weekOrder(c).filter(d => r.days.includes(d)).map(d => dayName(c, d)).join(', ');
  }
  // ZenModeAutomationSettings.computeRuleSummary: "Off", or "On / " and the rule's Do not disturb mode.
  function ruleSummary(c, r) {
    const t = T();
    if (!r.on) return t.t('switch_off_text');
    return t.fmt('zen_mode_rule_summary_enabled_combination', null, t.t(`zen_mode_option_${ZEN.find(z => z[1] === r.mode)[0]}`));
  }
  const ic = name => NG.settingsIcon({icon: `st-${name}.svg`});
  NG.settingsScreens['xml:zen_mode_automation_settings'] = {
    title: () => T().t('zen_mode_automation_settings_title'),
    render(c) {
      const t = T(), items = rules(c).map(r => ({html: NG.settingsRow(c, {title: ruleName(r), summary: ruleSummary(c, r), icon: ic('ic_label'), action: 'ngzr-rule', data: ` data-id="${r.id}"`}), sel: true}));
      items.push({html: NG.settingsRow(c, {title: t.t('zen_mode_add_rule'), icon: ic('ic_add'), action: 'ngzr-add'}), sel: true});
      return `<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngzr-rule') { NG.settingsGo(c, `zen-rule:${el.dataset.id}`, ''); return true; }
      if (name !== 'ngzr-add') return false;
      // ZenRuleSelectionDialog (zen_rule_type.xml rows: the providing app's icon, the 16 sp title): Event rule and Time
      // rule, both the system's, then ZenRuleNameDialog for the name.
      const appIc = `<img class="ngst-ruleic" src="${c.safe(NG.appsData?.settings?.icon || '')}" alt="">`;
      c.dialog({title: t.t('zen_mode_choose_rule_type'), items: [{html: `<span class="ngst-ruletype">${appIc}<span>${c.safe(t.t('zen_event_rule_type_name'))}</span></span>`}, {html: `<span class="ngst-ruletype">${appIc}<span>${c.safe(t.t('zen_schedule_rule_type_name'))}</span></span>`}],
        buttons: [{label: t.t('framework/cancel')}], onItem: (type, c) => {
          let value = '';
          c.dialog({title: t.t('zen_mode_add_rule'), html: `<div class="ngst-edit"><input type="text" class="ngst-input ngzr-name" placeholder="${c.safe(t.t('zen_mode_rule_name_hint'))}" spellcheck="false"></div>`,
            mount(c, win) { const i = win.querySelector('.ngzr-name'); i.addEventListener('input', () => { value = i.value.trim(); }); setTimeout(() => i.focus(), 50); },
            buttons: [{label: t.t('framework/cancel')}, {label: t.t('okay'), action: c => {
              if (!value) return;
              if (rules(c).some(r => ruleName(r) === value)) { c.toast(t.t('zen_mode_rule_name_warning')); return; }
              const list = rules(c), id = Math.max(0, ...list.map(r => r.id)) + 1, event = type === 0;
              list.push(event ? {id, name: value, kind: 'event', on: true, reply: 1, mode: 1} : {id, name: value, kind: 'schedule', on: true, days: [], start: [22, 0], end: [7, 0], mode: 1});
              c.save(); NG.settingsGo(c, `zen-rule:${id}`, ''); c.toast(t.t(event ? 'zen_event_rule_enabled_toast' : 'zen_schedule_rule_enabled_toast'));
            }}]});
        }});
      return true;
    }
  };
  const ruleOf = (c, cur) => rules(c).find(r => r.id === +cur.screen.split(':')[1]);
  NG.settingsScreens['zen-rule'] = {
    title: (c, cur) => { const r = ruleOf(c, cur); return r ? ruleName(r) : ''; },
    bar(c, cur) { const r = ruleOf(c, cur); return r ? NG.settingsSwitchBar(c, r.on, 'ngzr-on') : ''; },
    actions: c => NG.menu.button(c),
    render(c, cur) {
      const t = T(), r = ruleOf(c, cur); if (!r) return `<div class="ngst-empty">${c.safe(t.t('zen_mode_rule_not_found_text'))}</div>`;
      const row = (key, title, sum, off = !r.on) => ({html: NG.settingsRow(c, {key, title, summary: sum, action: 'ngzr-edit', disabled: off}), sel: true});
      const mode = t.t(`zen_mode_option_${ZEN.find(z => z[1] === r.mode)[0]}`);
      const items = [row('name', t.t('zen_mode_rule_name'), ruleName(r), false)];
      if (r.kind === 'event') items.push(row('calendar', t.t('zen_mode_event_rule_calendar'), t.t('zen_mode_event_rule_calendar_any')), row('reply', t.t('zen_mode_event_rule_reply'), t.t(REPLIES[r.reply])));
      else {
        const nextDay = r.end[0] * 60 + r.end[1] <= r.start[0] * 60 + r.start[1];
        items.push(row('days', t.t('zen_mode_schedule_rule_days'), daysText(c, r)), row('start', t.t('zen_mode_start_time'), hm(c, r.start)),
          row('end', t.t('zen_mode_end_time'), nextDay ? t.fmt('zen_mode_end_time_next_day_summary_format', null, hm(c, r.end)) : hm(c, r.end)));
      }
      items.push(row('mode', t.t('zen_mode_settings_title'), mode));
      return `<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), r = ruleOf(c, cur); if (!r) return false;
      const done = () => { c.save(); c.transition('none'); c.render(); };
      if (name === 'ngzr-on') { r.on = !r.on; done(); return true; }
      if (name === 'ng-menu') {
        c.menu([{label: t.t('zen_mode_delete_rule'), action: c => c.dialog({message: t.fmt('zen_mode_delete_rule_confirmation', null, ruleName(r)), buttons: [{label: t.t('framework/cancel')}, {label: t.t('zen_mode_delete_rule_button'), action: c => { S(c).zenRules = rules(c).filter(x => x !== r); c.save(); c.ui.settings.stack.pop(); c.render(); }}]})}], el);
        return true;
      }
      if (name !== 'ngzr-edit') return false;
      const key = el.dataset.key;
      if (key === 'name') {
        let v = ruleName(r);
        c.dialog({title: t.t('zen_mode_rule_name'), html: `<div class="ngst-edit"><input type="text" class="ngst-input ngzr-name" value="${c.safe(v)}" spellcheck="false"></div>`,
          mount(c, win) { const i = win.querySelector('.ngzr-name'); i.addEventListener('input', () => { v = i.value.trim(); }); setTimeout(() => i.focus(), 50); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: () => { if (v) { r.name = v; done(); } }}]});
      } else if (key === 'days') {
        let days = [...r.days];
        c.dialog({title: t.t('zen_mode_schedule_rule_days'), keepOpen: true, items: weekOrder(c).map(d => ({html: `<span class="ngst-choice"><i class="ngst-check${days.includes(d) ? ' on' : ''}"></i><span>${c.safe(dayName(c, d, 'long'))}</span></span>`})),
          onItem: (i, c) => { const d = weekOrder(c)[i]; days = days.includes(d) ? days.filter(x => x !== d) : [...days, d]; c.el.overlay.querySelectorAll('.ngdlg-item .ngst-check')[i].classList.toggle('on', days.includes(d)); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: () => { r.days = days; done(); }}]});
      } else if (key === 'start' || key === 'end') {
        if (NG.timePicker) NG.timePicker(c, r[key][0], r[key][1], (h, m) => { r[key] = [h, m]; done(); });
      } else if (key === 'mode') {
        c.dialog({title: t.t('zen_mode_settings_title'), items: ZEN.map(([k, v]) => radio(c, t.t(`zen_mode_option_${k}`), v === r.mode)), buttons: [{label: t.t('framework/cancel')}], onItem: i => { r.mode = ZEN[i][1]; done(); }});
      } else if (key === 'reply') {
        c.dialog({title: t.t('zen_mode_event_rule_reply'), items: REPLIES.map((k, i) => radio(c, t.t(k), i === r.reply)), buttons: [{label: t.t('framework/cancel')}], onItem: i => { r.reply = i; done(); }});
      } else if (key === 'calendar') {
        c.dialog({title: t.t('zen_mode_event_rule_calendar'), items: [radio(c, t.t('zen_mode_event_rule_calendar_any'), true), radio(c, NG.account?.email || 'nexus6p.demo@gmail.com', false)], buttons: [{label: t.t('framework/cancel')}], onItem: () => {}});
      }
      return true;
    }
  };

  // -- Notifications' gear: ConfigureNotificationSettings -------------------------------------------------------
  H.configure_notification_settings = {
    get(c, key) { if (key === 'notification_pulse') return !!S(c).notificationPulse; return undefined; },
    set(c, key, v) { if (key === 'notification_pulse') { S(c).notificationPulse = v; return true; } return false; },
    summary(c, key) {
      const t = T(), s = S(c), secure = ['pin', 'password', 'pattern'].includes(s.lock?.type);
      if (key !== 'lock_screen_notifications') return undefined;
      const v = s.lockNotifications ?? 'all';
      return t.t(v === 'none' ? 'lock_screen_notifications_summary_disable' : v === 'hide' && secure ? 'lock_screen_notifications_summary_hide' : 'lock_screen_notifications_summary_show');
    },
    click(c, key, n) {
      if (key !== 'lock_screen_notifications') return false;
      const t = T(), s = S(c), secure = ['pin', 'password', 'pattern'].includes(s.lock?.type);
      const items = [['lock_screen_notifications_summary_show', 'all'], ...(secure ? [['lock_screen_notifications_summary_hide', 'hide']] : []), ['lock_screen_notifications_summary_disable', 'none']], cur = s.lockNotifications ?? 'all';
      c.dialog({title: NG.settingsStr(n.title), items: items.map(([label, v]) => radio(c, t.t(label), v === cur)), buttons: [{label: t.t('framework/cancel')}], onItem: i => { s.lockNotifications = items[i][1]; c.save(); c.render(); }});
      return true;
    }
  };
})();
