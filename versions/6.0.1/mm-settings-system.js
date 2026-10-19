/* Android 6.0.1 Settings: Date & time, Location, Backup & reset, Language & input and Users (Settings.apk MTC20K), as
   MM.settingsHooks.
   - date_time_prefs (DateTimeSettings): Automatic date & time and time zone on (def_auto_time, def_auto_time_zone),
     Set date / Set time disabled while automatic; the summaries as updateTimeAndDateDisplay sets them: the long date,
     the time, ZoneGetter's "GMT+hh:mm <zone name>", and 24-hour format showing 13:00 or 1:00 PM of a dummy date.
   - location_settings (LocationSettings with its switch bar): Mode (LocationMode: High accuracy, Battery saving, Device
     only, the RadioButtonPreference rows), no work profile, Recent location requests (location_no_recent_apps), the
     location services SettingsInjector finds (GMS Core's Google Location History; its sharing and proximity services
     are disabled in the manifest); Scanning in the overflow (location_scanning: Wi-Fi and Bluetooth scanning, off as
     def_wifi_scan_always_available 0 and ble_scan_always_enabled 0 leave them).
   - privacy_settings (PrivacySettings.getNonVisibleKeys / updateToggles): GSF's com.google.settings provider and an
     active backup service hide "Backup service is inactive"; Back up my data On / Off, the backup account
     (backup_configure_account_default_summary without one), Automatic restore enabled with backup.
   - language_settings (InputMethodAndLanguageSettings): Language with the locale's name, the spell checker LatinImeGoogle's
     Google Spell Checker, Current Keyboard as getImeAndSubtypeDisplayName ("English (US) - Google Keyboard"), the
     enabled input methods (Google Keyboard with its implicit subtype, Google voice typing with Automatic), no hardware
     keyboard and no game controller with a vibrator (both categories go), Pointer speed.
   - user_settings (UserSettings on a phone): You (Owner), Guest, Add user ("Add new user?", then "Set up user now?":
     Not now leaves a "New user" that is "Not set up"). As the image's UserSettings.onPreferenceClick: the own row opens
     Profile info (EditUserInfoController, the row's title in the field; in the guest session it reads Remove guest and
     asks Remove guest?), another user's row switches to that user (one never set up asks Set up user now? first), the
     guest's row switches to the guest; on a voice capable phone the owner's other rows carry the manage button
     (preference_user_delete_widget: divider_horizontal_dark, ic_sysbar_quicksettings) that opens UserDetailsSettings. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks;
  const S = c => c.data.settings;
  const radioRow = (c, n, on) => `<button type="button" class="mmst-pref mmst-radiopref" data-action="mmst-pref" data-key="${n.key}"><i class="mmw-radio${on ? ' on' : ''}"></i><span class="mmst-texts"><span class="mmst-title">${c.safe(MM.settingsStr(n.title))}</span>${n.summary ? `<span class="mmst-summary">${c.safe(MM.settingsStr(n.summary))}</span>` : ''}</span></button>`;

  // -- Date & time ---------------------------------------------------------------------------------------------------
  const h24 = c => S(c).time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  // The zone picked in ZonePicker once Automatic time zone is off, else the phone's own.
  function zoneText(c, now) {
    const tz = S(c).autoZone === false && S(c).timeZone ? S(c).timeZone : undefined;
    let off = -now.getTimezoneOffset();
    if (tz) { try { const p = new Intl.DateTimeFormat('en-US', {timeZone: tz, timeZoneName: 'longOffset'}).formatToParts(now).find(x => x.type === 'timeZoneName').value; const m = /GMT([+-])(\d+)(?::(\d+))?/.exec(p); off = m ? (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +(m[3] || 0)) : 0; } catch {} }
    const sign = off < 0 ? '-' : '+', a = Math.abs(off);
    const gmt = `GMT${sign}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
    let name = '';
    try { name = new Intl.DateTimeFormat(c.locale(), {timeZoneName: 'long', ...(tz ? {timeZone: tz} : {})}).formatToParts(now).find(p => p.type === 'timeZoneName')?.value || ''; } catch {}
    return `${gmt} ${name}`.trim();
  }
  H.date_time_prefs = {
    get(c, key) {
      const s = S(c);
      if (key === 'auto_time') return s.autoTime ?? true;
      if (key === 'auto_zone') return s.autoZone ?? true;
      if (key === '24 hour') return h24(c);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_time') { s.autoTime = v; return true; }
      if (key === 'auto_zone') { s.autoZone = v; return true; }
      if (key === '24 hour') { s.time24 = v; MM.system?.changed(c); return true; }
      return false;
    },
    disabled(c, key) {
      const s = S(c);
      if (key === 'date' || key === 'time') return s.autoTime ?? true;
      if (key === 'timezone') return s.autoZone ?? true;
      return false;
    },
    summary(c, key) {
      const now = new Date(), loc = c.locale();
      if (key === 'date') return new Intl.DateTimeFormat(loc, {year: 'numeric', month: 'long', day: 'numeric'}).format(now);
      if (key === 'time') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(now);
      if (key === 'timezone') return zoneText(c, now);
      if (key === '24 hour') return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: !h24(c)}).format(new Date(now.getFullYear(), 11, 31, 13, 0));
      return undefined;
    },
    click(c, key) {
      // Set date / Set time: the framework's pickers; the moment chosen is kept as an offset from the real clock.
      const now = new Date(Date.now() + (S(c).timeOffset || 0)), apply = d => { S(c).timeOffset = d - Date.now(); c.save(); c.render(); };
      if (key === 'date') { MM.datePicker(c, now, (c, d) => apply(new Date(d.getFullYear(), d.getMonth(), d.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()))); return true; }
      if (key === 'time') { MM.timePicker(c, now.getHours(), now.getMinutes(), (h, m) => apply(new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m)), 'settings'); return true; }
      if (key === 'timezone') { MM.settingsGo(c, 'timezone', T().t('date_time_set_timezone')); return true; }
      return false;
    }
  };

  // -- Location ------------------------------------------------------------------------------------------------------
  const MODES = {high_accuracy: 'location_mode_high_accuracy_title', battery_saving: 'location_mode_battery_saving_title', sensors_only: 'location_mode_sensors_only_title'};
  const mode = c => S(c).locationMode || 'high_accuracy';
  H.location_settings = {
    hidden: ['managed_profile_location_category'],
    disabled: (c, key) => key === 'location_mode' && !S(c).location,
    summary(c, key) {
      if (key === 'location_mode') return T().t(S(c).location ? MODES[mode(c)] : 'location_mode_location_off_title');
      return undefined;
    }
  };
  // The two categories the code fills: no recent request, the injected Location History.
  (() => {
    const base = MM.settingsXml.location_settings; if (!base) return;
    const recent = base.c.find(n => n.key === 'recent_location_requests'), services = base.c.find(n => n.key === 'location_services');
    if (recent && !recent.c) recent.c = [{t: 'Preference', key: 'no_recent_apps', title: 'string/location_no_recent_apps', selectable: 'false'}];
    if (services && !services.c) services.c = [{t: 'Preference', key: 'location_history', title: 'string/PrebuiltGmsCore/location_ulr_setting_label', icon: {icon: 'gms-ic_google.png'}}];
  })();
  H.location_settings.selectable = (c, key) => key !== 'no_recent_apps';
  H.location_settings.click = (c, key) => {
    if (key === 'location_history') { MM.settingsGo(c, 'location-history', T().t('PrebuiltGmsCore/location_ulr_setting_label')); return true; }
    if (key === 'location_mode') { MM.settingsGo(c, 'xml:location_mode', T().t('location_mode_screen_title')); return true; }
    return false;
  };
  H.location_mode = {
    row: (c, key, n) => MODES[key] ? radioRow(c, n, mode(c) === key) : null,
    click(c, key) { if (!MODES[key]) return false; S(c).locationMode = key; c.save(); c.render(); return true; }
  };
  H.location_scanning = {
    get: (c, key) => key === 'wifi_always_scanning' ? !!S(c).wifiScanAlways : key === 'bluetooth_always_scanning' ? !!S(c).bleScanAlways : undefined,
    set(c, key, v) { if (key === 'wifi_always_scanning') S(c).wifiScanAlways = v; else if (key === 'bluetooth_always_scanning') S(c).bleScanAlways = v; else return false; return true; }
  };
  MM.settingsScreens['xml:location_settings'] = {
    bar(c) {
      const on = !!S(c).location, t = T();
      return `<button type="button" class="mmst-switchbar" data-action="mmlo-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
    },
    actions: c => MM.menu.button(c),
    action(c, name) {
      if (name === 'mmlo-toggle') { S(c).location = !S(c).location; c.save(); MM.system?.changed(c); c.render(); return true; }
      if (name === 'mm-menu') { c.menu([{label: T().t('location_menu_scanning'), action: c => MM.settingsGo(c, 'xml:location_scanning', T().t('location_scanning_screen_title'))}]); return true; }
      return false;
    }
  };

  // -- Backup & reset ------------------------------------------------------------------------------------------------
  H.privacy_settings = {
    hidden: ['backup_inactive'],
    get: (c, key) => key === 'auto_restore' ? S(c).autoRestore ?? true : undefined,
    set(c, key, v) { if (key !== 'auto_restore') return false; S(c).autoRestore = v; return true; },
    disabled: (c, key) => (key === 'auto_restore' || key === 'configure_account') && !S(c).backup,
    summary(c, key) {
      const t = T();
      if (key === 'backup_data') return t.t(S(c).backup ? 'accessibility_feature_state_on' : 'accessibility_feature_state_off');
      if (key === 'configure_account') return t.t('backup_configure_account_default_summary');
      return undefined;
    }
  };

  // -- Language & input ----------------------------------------------------------------------------------------------
  // LatinIME's subtype for the system locale: English (US) by name, the others subtype_generic ("%s") of the locale's
  // own display name.
  function subtype(c) {
    const lang = c.lang || 'en';
    if (lang === 'en') return T().t('LatinImeGoogle/subtype_en_US');
    try { const n = new Intl.DisplayNames([c.locale()], {type: 'language'}).of(lang); return n.charAt(0).toLocaleUpperCase(c.locale()) + n.slice(1); } catch { return lang; }
  }
  const languageName = c => { try { const n = new Intl.DisplayNames([c.locale()], {type: 'language'}).of(c.locale()); return n.charAt(0).toLocaleUpperCase(c.locale()) + n.slice(1); } catch { return c.locale(); } };
  H.language_settings = {
    hidden: ['hard_keyboard', 'game_controller_settings_category'],
    summary(c, key) {
      const t = T();
      // InputMethodAndLanguageSettings: the system locale's name in itself, as LocalePicker lists it ("English (United States)").
      if (key === 'phone_language') return MM.systemLocaleName ? MM.systemLocaleName(c) : languageName(c);
      if (key === 'spellcheckers_settings') return t.t('LatinImeGoogle/spell_checker_service_name');
      if (key === 'current_input_method') return `${subtype(c)} - ${t.t('LatinImeGoogle/english_ime_name')}`;
      if (key === 'ime_latin') return subtype(c);
      if (key === 'ime_voice') return t.t('Velvet/voice_ime_language_auto');
      return undefined;
    },
    click(c, key) {
      const t = T();
      if (key === 'phone_language') { MM.settingsGo(c, 'locale', t.t('phone_language')); return true; }
      // The input methods' own settings activities: Google Keyboard's and the Google app's voice typing.
      if (key === 'ime_latin') { MM.openPrefs(c, 'keyboard', 'prefs', MM.text('appprefs').t('LatinImeGoogle/english_ime_settings') || ''); return true; }
      if (key === 'ime_voice') { MM.openPrefs(c, 'voice', 'voicesearch_preferences'); return true; }
      if (key === 'spellcheckers_settings') { MM.settingsGo(c, 'spellcheck', t.t('spellcheckers_settings_title')); return true; }
      if (key === 'key_user_dictionary_settings') { MM.settingsGo(c, 'user-dictionary', t.t('user_dict_settings_title')); return true; }
      if (key === 'current_input_method') { MM.imePicker(c); return true; }
      // PointerSpeedPreference: the SeekBar (max 14, the speed + 7); OK sets it, Cancel leaves the old one.
      if (key === 'pointer_speed') {
        let v = (S(c).pointerSpeed ?? 0) + 7;
        c.dialog({title: t.t('pointer_speed'), html: `<div class="mmsx-seekdlg"><div class="mmst-seek" role="slider" aria-valuemin="0" aria-valuemax="14" aria-valuenow="${v}" style="--v:${(v / 14).toFixed(4)}"><i class="mmst-seek-track"></i><i class="mmst-seek-progress"></i><i class="mmst-seek-thumb"></i></div></div>`,
          buttons: [{label: t.t('cancel')}, {label: t.t('ok'), action: c => { S(c).pointerSpeed = v - 7; c.save(); }}],
          mount(c, win) {
            const bar = win.querySelector('.mmst-seek');
            bar.addEventListener('pointerdown', e => {
              e.preventDefault(); try { bar.setPointerCapture(e.pointerId); } catch {}
              const move = ev => { const r = bar.getBoundingClientRect(), pad = 16 * c.el.screen.clientWidth / 411.4286; v = Math.round(Math.min(1, Math.max(0, (ev.clientX - r.left - pad) / (r.width - 2 * pad))) * 14); bar.style.setProperty('--v', (v / 14).toFixed(4)); bar.setAttribute('aria-valuenow', v); };
              move(e); bar.addEventListener('pointermove', move);
              bar.addEventListener('pointerup', () => bar.removeEventListener('pointermove', move), {once: true});
            });
          }});
        return true;
      }
      return false;
    }
  };
  (() => {
    const cat = MM.settingsXml.language_settings?.c.find(n => n.key === 'keyboard_settings_category');
    if (cat && !cat.c.some(n => n.key === 'ime_latin'))
      cat.c.push({t: 'Preference', key: 'ime_latin', title: 'string/LatinImeGoogle/english_ime_name'}, {t: 'Preference', key: 'ime_voice', title: 'string/Velvet/ime_service_label'});
  })();

  // -- Users ---------------------------------------------------------------------------------------------------------
  // The guest's icon: UserIcons.getDefaultUserIcon(USER_NULL) in user_icon_default_gray #9e9e9e.
  const userRow = (c, key, icon, title, summary, manage) => `<button type="button" class="mmst-pref" data-action="mmst-pref" data-key="${key}"><span class="mmst-iconframe">${icon === 'gray' ? `<i class="mmst-ic" style="background:#9e9e9e;-webkit-mask-image:url('assets/fw-ic_account_circle-guest.svg');mask-image:url('assets/fw-ic_account_circle-guest.svg')"></i>` : `<img class="mmst-ic" src="assets/${icon}" alt="">`}</span><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span>${manage ? `<span class="mmst-widget mmsx-usermanage"><i class="mmsx-userdiv np-fw-divider_horizontal_dark"></i><span class="mmsx-usergear" role="button" data-action="mmst-pref" data-key="manage_${key.slice(5)}" aria-label="${c.safe(MM.text('users').t('Settings/settings_label'))}"><img src="assets/st-ic_sysbar_quicksettings.png" alt=""></span></span>` : ''}</button>`;
  const setUp = id => { try { return id === 'owner' || localStorage.getItem(`android-time-machine-mm-v1-${id}`) !== null; } catch { return true; } };
  H.user_settings = {
    title(c, key) { return key === 'user_add' ? T().t('user_add_user_menu') : undefined; },
    // The users of mm-users.js in serial order: the owner, the users added, then the guest (not listed in the guest
    // session); the own row first as user_me.
    top(c) {
      const t = T(), u = MM.text('users'), U = MM.users, me = U.current(c), owner = me === 'owner';
      const own = me === 'guest' ? u.t('Settings/user_exit_guest_title') : u.fmt('Settings/user_you', null, U.name(me));
      const row = id => id === me ? userRow(c, 'user_me', me === 'guest' ? 'gray' : U.icon(me), own, owner ? u.t('Settings/user_owner') : '')
        : userRow(c, `user_${id}`, U.icon(id), U.name(id), id === 'owner' ? u.t('Settings/user_owner') : setUp(id) ? '' : t.t('user_summary_not_set_up'), owner);
      // On a phone (no restricted profiles) updateUserList puts the rows on the screen itself, with no category.
      return `${['owner', ...U.list().map(x => x.id)].map(row).join('')}
        ${me === 'guest' ? row('guest') : userRow(c, 'user_guest', 'gray', u.t('Settings/user_guest'), '', owner)}`;
    },
    hidden: ['user_list'],
    // Add user is the owner's (UserCapabilities.mCanAddUser); greyed out once canAddMoreUsers() is false (the guest not
    // counted, config_multiuserMaximumUsers 4), with user_add_max_count naming getMaxRealUsers() (4 + 1).
    hide: (c, key) => key === 'user_add' && MM.users.current(c) !== 'owner',
    disabled: (c, key) => key === 'user_add' && 1 + MM.users.list().length >= 4,
    summary: (c, key) => key === 'user_add' && 1 + MM.users.list().length >= 4 ? T().fmt('user_add_max_count', null, 5) : undefined,
    click(c, key) {
      const t = T(), u = MM.text('users'), U = MM.users, me = U.current(c);
      if (key === 'user_add') {
        c.dialog({title: t.t('user_add_user_title'), message: t.t('user_add_user_message_long'), buttons: [{label: t.t('cancel')}, {label: t.t('ok'), action: c => {
          c.dialog({title: t.t('user_setup_dialog_title'), message: t.t('user_setup_dialog_message'), buttons: [
            {label: t.t('user_setup_button_setup_later'), action: c => { U.addUser(c); c.render(); }},
            {label: t.t('user_setup_button_setup_now'), action: c => U.switchTo(c, U.addUser(c))}]});
        }}]});
        return true;
      }
      if (key === 'user_me') {
        if (me === 'guest') {
          c.dialog({title: u.t('Settings/user_exit_guest_confirm_title'), message: u.t('Settings/user_exit_guest_confirm_message'), buttons: [{label: t.t('cancel')}, {label: u.t('Settings/user_exit_guest_dialog_remove'), action: c => U.removeGuest(c)}]});
          return true;
        }
        // EditUserInfoController.createDialog gets the row's title ("You (Owner)") as the name; OK keeps a changed one.
        const shown = u.fmt('Settings/user_you', null, U.name(me)); let name = shown;
        c.dialog({title: u.t('Settings/profile_info_settings_title'), html: `<div class="mmsx-userinfo"><img src="assets/${U.icon(me)}" alt=""><input class="mmst-input" value="${c.safe(name)}" spellcheck="false"></div>`,
          mount: (c, win) => { const i = win.querySelector('input'); i.addEventListener('input', () => { name = i.value; }); setTimeout(() => i.focus(), 50); },
          buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { if (name.trim() && name !== shown) { U.rename(me, name.trim()); c.render(); } }}]});
        return true;
      }
      if (key?.startsWith('manage_')) { const id = key.slice(7); MM.settingsGo(c, `user-detail:${id}`, id === 'guest' ? u.t('Settings/user_guest') : U.name(id)); return true; }
      if (key === 'user_guest') { U.guest(c); return true; }
      if (key?.startsWith('user_')) {
        const id = key.slice(5);
        if (setUp(id)) U.switchTo(c, id);
        else c.dialog({title: t.t('user_setup_dialog_title'), message: t.t('user_setup_dialog_message'), buttons: [{label: t.t('user_setup_button_setup_later')}, {label: t.t('user_setup_button_setup_now'), action: c => U.switchTo(c, id)}]});
        return true;
      }
      return false;
    }
  };

  /* accessibility_settings (AccessibilitySettings): the services the image installs (talkback.apk's TalkBack, whose
     service has no label of its own so the application's, and Switch Access, enabled from -v21), Off; Captions,
     Magnification gestures and Color correction On / Off (updateFeatureSummary); Power button ends call stays (a power
     key on a voice capable phone), Auto-rotate screen (rotation supported) is the rotation lock's opposite,
     Accessibility shortcut stays (config_longPressOnPowerBehavior 1) with its On / Off; Touch & hold delay the entry of
     long_press_timeout (500, Short). */
  const SERVICES = [['a11y_talkback', 'talkback/talkback_title'], ['a11y_switch', 'talkback/switch_service_name']];
  (() => {
    const cat = MM.settingsXml.accessibility_settings?.c.find(n => n.key === 'services_category');
    if (cat && !cat.c) cat.c = SERVICES.map(([key, title]) => ({t: 'Preference', key, title: `string/${title}`}));
    const pc = MM.settingsXml.print_settings?.c.find(n => n.key === 'print_services_category');
    if (pc && !pc.c) pc.c = [{t: 'Preference', key: 'print_cloud', title: 'string/CloudPrint2/app_name'}];
  })();
  const SWITCHES = {toggle_large_text_preference: 'largeText', toggle_high_text_contrast_preference: 'highContrast', toggle_power_button_ends_call_preference: 'powerEndsCall',
    toggle_speak_password_preference: 'speakPasswords', toggle_inversion_preference: 'inversion'};
  H.accessibility_settings = {
    get(c, key) {
      const a = S(c).a11y || {};
      if (key === 'toggle_lock_screen_rotation_preference') return !S(c).rotationLocked;
      if (key === 'select_long_press_timeout_preference') return String(a.longPress ?? 500);
      return SWITCHES[key] ? !!a[SWITCHES[key]] : undefined;
    },
    set(c, key, v) {
      const s = S(c), a = s.a11y || (s.a11y = {});
      if (key === 'toggle_lock_screen_rotation_preference') { s.rotationLocked = !v; MM.system?.changed(c); return true; }
      if (key === 'select_long_press_timeout_preference') { a.longPress = +v; return true; }
      if (SWITCHES[key]) { a[SWITCHES[key]] = v; return true; }
      return false;
    },
    summary(c, key) {
      const t = T(), a = S(c).a11y || {};
      if (SERVICES.some(([k]) => k === key) || key === 'captioning_preference_screen' || key === 'screen_magnification_preference_screen' || key === 'daltonizer_preference_screen')
        return t.t(a[key] ? 'accessibility_feature_state_on' : 'accessibility_feature_state_off');
      if (key === 'enable_global_gesture_preference_screen') return t.t(a.shortcut ? 'accessibility_global_gesture_preference_summary_on' : 'accessibility_global_gesture_preference_summary_off');
      return undefined;
    },
    click(c, key, n) {
      if (SERVICES.some(([k]) => k === key) || key === 'screen_magnification_preference_screen' || key === 'enable_global_gesture_preference_screen') { MM.settingsGo(c, `a11y:${key}`, MM.settingsStr(n?.title) || T().t(SERVICES.find(([k]) => k === key)?.[1] || '')); return true; }
      return false;
    }
  };
  // print_settings (PrintSettingsFragment): no print jobs (the category goes), the installed services with On / Off
  // (ENABLED_PRINT_SERVICES starts empty).
  H.print_settings = {
    hidden: ['print_jobs_category'],
    summary: (c, key) => key === 'print_cloud' ? T().t(S(c).cloudPrint ? 'print_feature_state_on' : 'print_feature_state_off') : undefined,
    click(c, key) { if (key !== 'print_cloud') return false; MM.settingsGo(c, 'cloudprint', T().t('CloudPrint2/app_name')); return true; }
  };

  /* development_prefs (DevelopmentSettings.onCreate on the user build): Clear USB debugging authorizations stays
     (ro.adb.secure), the terminal goes (no com.android.terminal), OEM unlocking stays (the 5X's persistent data block),
     Verify apps over USB stays (package_verifier_enable), multi-window and HDCP checking go (removed on a "user" build),
     Picture color mode goes (fewer than two colour transforms), Color temperature stays (Settings'
     config_enableColorTemperature; English only in the image). The list rows show their entry (updateXxxOptions), mock
     location and the debug app their "not set" texts. The switch bar turns the whole screen on and off (Allow development
     settings? before on); USB debugging asks Allow USB debugging?. */
  const DEV_DEFAULTS = {select_logd_size: '262144', select_usb_configuration: 'mtp', window_animation_scale: '1', transition_animation_scale: '1',
    animator_duration_scale: '1', overlay_display_devices: '', debug_hw_overdraw: 'false', show_non_rect_clip: 'hide', simulate_color_space: '-1',
    track_frame_time: 'false', enable_opengl_traces: '0', app_process_limit: '-1', verify_apps_over_usb: true};
  const dev = c => S(c).dev || (S(c).dev = {on: true});
  H.development_prefs = {
    hidden: ['enable_terminal', 'enable_multi_window', 'hdcp_checking', 'color_mode'],
    get(c, key) { const d = dev(c); return key in d ? d[key] : key in DEV_DEFAULTS ? DEV_DEFAULTS[key] : undefined; },
    set(c, key, v) { dev(c)[key] = v; return true; },
    disabled: c => !dev(c).on,
    summary(c, key, n) {
      const t = T();
      if (key === 'mock_location_app') return t.t('mock_location_app_not_set');
      if (key === 'debug_app') return t.t('debug_app_not_set');
      if (n.t === 'ListPreference' && n.entryValues) { const v = String(dev(c)[key] ?? DEV_DEFAULTS[key] ?? ''); const i = n.entryValues.indexOf(v); return i >= 0 ? MM.settingsArr(n.entries)[i] : ''; }
      return undefined;
    },
    click(c, key) {
      const t = T(), d = dev(c);
      if (key === 'enable_adb' && !d.enable_adb) {
        c.dialog({title: t.t('adb_warning_title'), message: t.t('adb_warning_message'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { d.enable_adb = true; c.save(); c.render(); }}]});
        return true;
      }
      if (MM.devClick?.(c, key)) return true;
      return false;
    }
  };
  MM.settingsScreens['xml:development_prefs'] = {
    bar(c) {
      const on = dev(c).on, t = T();
      return `<button type="button" class="mmst-switchbar" data-action="mmdv-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
    },
    action(c, name) {
      if (name !== 'mmdv-toggle') return false;
      const t = T(), d = dev(c);
      if (d.on) { d.on = false; c.save(); c.render(); }
      else c.dialog({title: t.t('dev_settings_warning_title'), message: t.t('dev_settings_warning_message'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { d.on = true; c.save(); c.render(); }}]});
      return true;
    }
  };

  /* wireless_settings (WirelessSettings, "More"): network service discovery, WiMAX (config_wimaxEnabled false), the
     proxy, Manage mobile plan (config_show_mobile_plan false) and Wi-Fi calling (the carrier does not enable WFC) go;
     airplane mode is the system's; NFC (NfcNci, on) and Android Beam (On / Off, off with NFC off) stay without depending
     on airplane mode (airplane_mode_toggleable_radios lists nfc and wifi); Tethering & portable hotspot, VPN, Cellular
     networks and Emergency broadcasts (CellBroadcastReceiver, config_cellBroadcastAppLinks) stay. */
  H.wireless_settings = {
    hidden: ['toggle_nsd', 'wimax_settings', 'proxy_settings', 'manage_mobile_plan', 'wifi_calling_settings'],
    get(c, key) {
      const s = S(c);
      if (key === 'toggle_airplane') return !!s.airplane;
      if (key === 'toggle_nfc') return s.nfc ?? true;
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'toggle_airplane') { MM.system.setAirplane(c, v); return true; }
      if (key === 'toggle_nfc') { s.nfc = v; return true; }
      return false;
    },
    disabled: (c, key) => key === 'android_beam_settings' && !(S(c).nfc ?? true),
    summary(c, key) {
      if (key === 'android_beam_settings') return T().t((S(c).nfc ?? true) && (S(c).beam ?? true) ? 'android_beam_on_summary' : 'android_beam_off_summary');
      return undefined;
    },
    click(c, key, n) {
      // TeleService's MobileNetworkSettings and CellBroadcastReceiver's settings, apps of their own.
      if (key === 'mobile_network_settings') { MM.openPrefs(c, 'network', 'network_setting'); return true; }
      if (key === 'cell_broadcast_settings') { MM.openPrefs(c, 'cellbroadcast', 'preferences', MM.settingsStr(n.title)); return true; }
      return false;
    }
  };

  /* Tethering & portable hotspot (TetherSettings, WifiApEnabler, WifiApDialog): USB tethering is greyed out with
     "USB not connected"; Portable Wi-Fi hotspot reads "Turning hotspot on…" / "…off…" for a moment, then "Portable
     hotspot AndroidAP active" (greyed out in airplane mode); Set up Wi-Fi hotspot shows the access point
     (wifi_tether_configure_subtext: its name and security) and opens WifiApDialog: Network name, Security (None / WPA2
     PSK), the password with "The password must have at least 8 characters." and Show password, AP Band (the 5X is dual
     band: 2.4 GHz / 5 GHz); Save is enabled while the name is set and a WPA2 password has 8 characters. Bluetooth
     tethering turns Bluetooth on first, and is unchecked while Bluetooth is off. */
  const apName = c => MM.system.hotspotConfig(c).ssid || T().t('wifi_tether_configure_ssid_default');
  function apDialog(c) {
    const t = T(), cfg = MM.system.hotspotConfig(c), opts = (arr, sel) => arr.map((o, i) => `<option${i === sel ? ' selected' : ''}>${c.safe(o)}</option>`).join('');
    const html = `<div class="mmwf-dialog"><div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_ssid'))}</span><input class="mmwf-edit mmwf-ssid" type="text" maxlength="32" value="${c.safe(apName(c))}" placeholder="${c.safe(t.t('wifi_ssid_hint'))}" autocomplete="off" spellcheck="false"></div>
      <div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_security'))}</span><select class="mmwf-spinner mmwf-sec">${opts(t.t('wifi_ap_security'), cfg.security)}</select></div>
      <div class="mmwf-secfields"${cfg.security ? '' : ' hidden'}><div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_password'))}</span><input class="mmwf-edit mmwf-pw" type="password" maxlength="63" value="${c.safe(cfg.password)}" autocomplete="off" spellcheck="false"></div>
      <div class="mmwf-item"><span class="mmwf-label mmwf-note">${c.safe(t.t('credentials_password_too_short'))}</span><label class="mmwf-check"><input type="checkbox" class="mmwf-show"><i class="mmst-check"></i><span>${c.safe(t.t('wifi_show_password'))}</span></label></div></div>
      <div class="mmwf-item"><span class="mmwf-label">${c.safe(t.t('wifi_ap_band_config'))}</span><select class="mmwf-spinner mmwf-band">${opts(t.t('wifi_ap_band_config_full'), cfg.band)}</select></div></div>`;
    let form = null;
    c.dialog({title: t.t('wifi_tether_configure_ap_text'), html, buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), action: c => {
      if (!form) return;
      // TetherSettings.onClick: the new configuration; a running hotspot restarts with it.
      Object.assign(MM.system.hotspotConfig(c), form); c.save();
      if (S(c).hotspot) { MM.system.setHotspot(c, false); setTimeout(() => MM.system.setHotspot(c, true), 1300); }
      c.render();
    }}], mount(c, win) {
      const ssid = win.querySelector('.mmwf-ssid'), sec = win.querySelector('.mmwf-sec'), pw = win.querySelector('.mmwf-pw'), band = win.querySelector('.mmwf-band');
      const save = [...win.querySelectorAll('.mmdlg-button')].at(-1);
      // WifiApDialog.validate: no name, or WPA2 PSK with fewer than 8 characters, disables Save.
      const sync = () => {
        win.querySelector('.mmwf-secfields').hidden = sec.selectedIndex === 0;
        form = {ssid: ssid.value, security: sec.selectedIndex, password: pw.value, band: band.selectedIndex};
        if (save) save.disabled = !ssid.value || (sec.selectedIndex === 1 && pw.value.length < 8);
      };
      win.addEventListener('input', sync); win.addEventListener('change', sync);
      win.querySelector('.mmwf-show').addEventListener('change', e => { pw.type = e.target.checked ? 'text' : 'password'; });
      sync(); setTimeout(() => ssid.focus(), 50);
    }});
  }
  H.tether_prefs = {
    get(c, key) {
      const s = S(c);
      if (key === 'usb_tether_settings') return false;
      if (key === 'enable_wifi_ap') return !!s.hotspot;
      if (key === 'enable_bluetooth_tethering') return !!(s.btTether && s.bluetooth);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'enable_wifi_ap') { MM.system.setHotspot(c, v); return true; }
      if (key === 'enable_bluetooth_tethering') { s.btTether = v; if (v && !s.bluetooth) { MM.system.setBluetooth(c, true); setTimeout(() => c.render(), 1100); } return true; }
      return key === 'usb_tether_settings';
    },
    disabled(c, key) {
      const st = MM.system.hotspotState(c);
      if (key === 'usb_tether_settings') return true;
      if (key === 'enable_wifi_ap') return !!S(c).airplane || st === 'enabling' || st === 'disabling';
      if (key === 'enable_bluetooth_tethering') return MM.system.live.btTurningOn > Date.now();
      return false;
    },
    summary(c, key) {
      const t = T(), s = S(c), st = MM.system.hotspotState(c);
      if (key === 'usb_tether_settings') return t.t('usb_tethering_unavailable_subtext');
      if (key === 'enable_wifi_ap') return st === 'enabling' ? t.t('wifi_tether_starting') : st === 'disabling' ? t.t('wifi_tether_stopping') : st === 'on' ? t.fmt('wifi_tether_enabled_subtext', null, apName(c)) : '';
      if (key === 'wifi_ap_ssid_and_security') return t.fmt('wifi_tether_configure_subtext', null, apName(c), t.t('wifi_ap_security')[MM.system.hotspotConfig(c).security]);
      if (key === 'enable_bluetooth_tethering') return MM.system.live.btTurningOn > Date.now() ? t.t('bluetooth_turning_on') : t.t(s.btTether && s.bluetooth ? 'bluetooth_tethering_available_subtext' : 'bluetooth_tethering_off_subtext');
      return undefined;
    },
    click(c, key) {
      if (key === 'wifi_ap_ssid_and_security') { apDialog(c); return true; }
      return false;
    }
  };

  /* Text-to-speech output (TextToSpeechSettings, tts_settings.xml): Preferred engine lists the image's one engine,
     GoogleTTS ("Google Text-to-speech Engine": TtsEnginePreference's radio, a divider and its settings button, which
     opens the engine's settingsActivity, EngineSettings); Speech rate; Listen to an example speaks the engine's sample
     for the default language (GoogleTTS's tts_demo_strings, by tts_demo_string_langs; here the browser's speech
     synthesis says it); Default language status is tts_status_ok for a language the engine has, else
     tts_status_not_supported, which also greys out the rate and the example (updateWidgetState(false)). */
  const TTS_DEMO = {en: 'This is an example of speech synthesis in English.', fr: 'Voici un échantillon de synthèse vocale en français.',
    de: 'Dies ist ein Beispiel für Sprachsynthese in Deutsch.', it: 'Questo è un esempio di sintesi vocale in italiano.', es: 'Este es un ejemplo de síntesis de voz en español.',
    ko: '이것은 한국어 음성 합성의 예입니다.', pt: 'Isto é um exemplo de síntese de voz em português.', nl: 'Dit is een voorbeeld van spraaksynthese in het Nederlands.',
    pl: 'To jest przykład syntezy mowy w języku polskim.', ru: 'Вы слушаете синтез речи на русском языке.', ja: 'こちらが日本語音声合成のサンプルです。',
    hi: 'यह हिन्दी में भाषण संश्लेषण का एक उदाहरण है।', in: 'ini adalah contoh sintesis suara dalam bahasa Indonesia.'};
  const ttsLocale = c => (S(c).locale || {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'}[c.lang] || 'en-US');
  const ttsOk = c => !!TTS_DEMO[ttsLocale(c).split('-')[0]];
  // Locale.getDisplayName(): the language, then the country in brackets, in the phone's language.
  const displayName = (c, tag) => { try { const [l, r] = tag.split('-'); const n = new Intl.DisplayNames([c.locale()], {type: 'language'}).of(l.replace('in', 'id').replace('iw', 'he')), rn = r ? new Intl.DisplayNames([c.locale()], {type: 'region'}).of(r) : ''; return rn ? `${n} (${rn})` : n; } catch { return tag; } };
  H.tts_settings = {
    top(c) {
      const t = T(), gear = `<span class="mmst-widget mmsx-usermanage"><i class="mmsx-userdiv np-fw-divider_horizontal_dark"></i><span class="mmsx-usergear" role="button" data-action="mmst-pref" data-key="tts_engine_settings" aria-label="${c.safe(t.t('settings_label'))}"><img src="assets/st-ic_sysbar_quicksettings.png" alt=""></span></span>`;
      return `<div class="mmst-cat">${c.safe(t.t('tts_engine_preference_section_title'))}</div><button type="button" class="mmst-pref" data-action="mmst-pref" data-key="tts_engine"><span class="mmst-iconframe"><i class="mmw-radio on"></i></span><span class="mmst-texts"><span class="mmst-title">${c.safe(MM.text('appprefs').t('GoogleTTS/app_name'))}</span></span>${gear}</button>`;
    },
    disabled: (c, key) => (key === 'tts_default_rate' || key === 'tts_play_example') && !ttsOk(c),
    summary(c, key) {
      if (key === 'tts_status') return T().fmt(ttsOk(c) ? 'tts_status_ok' : 'tts_status_not_supported', null, displayName(c, ttsLocale(c)));
      return undefined;
    },
    click(c, key) {
      if (key === 'tts_engine') return true;
      if (key === 'tts_engine_settings') { MM.openPrefs(c, 'tts', 'general_settings', MM.text('appprefs').t('GoogleTTS/app_name')); return true; }
      if (key === 'tts_status') return true;
      if (key === 'tts_play_example') {
        const lang = ttsLocale(c).split('-')[0], text = TTS_DEMO[lang];
        try { const u = new SpeechSynthesisUtterance(text); u.lang = ttsLocale(c); u.rate = (+(S(c).prefs || {}).tts_default_rate || 100) / 100; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch {}
        return true;
      }
      return false;
    }
  };

  /* Tap & pay (PaymentSettings, the 5X has NFC and host card emulation): NfcPaymentPreference (Payment default, the
     default payment service's app: Android Pay, the image's only one, which CardEmulationManager makes the default)
     and NfcForegroundPreference (Use default: Always / Except when another payment app is open); the default's
     dialog asks nfc_payment_pay_with over the payment apps. */
  MM.settingsScreens['nfc-payment'] = {
    title: () => T().t('nfc_payment_settings_title'),
    render(c) {
      const t = T(), s = S(c), app = MM.appLabel(c, 'android-pay');
      const row = (key, title, summary) => `<button type="button" class="mmst-pref" data-action="mmpy-pref" data-key="${key}"><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span><span class="mmst-summary">${c.safe(summary)}</span></span></button>`;
      return `<div class="mmst-list">${row('default', t.t('nfc_payment_default'), s.paymentDefault === false ? t.t('nfc_payment_default_not_set') : app)}${row('foreground', t.t('nfc_payment_use_default'), t.t(s.paymentForeground ? 'nfc_payment_favor_open' : 'nfc_payment_favor_default'))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmpy-pref') return false;
      const t = T(), s = S(c);
      const radio = (on, label) => ({html: `<span class="mmst-choice"><i class="mmw-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
      if (el.dataset.key === 'default') c.dialog({title: t.t('nfc_payment_pay_with'), items: [radio(s.paymentDefault !== false, MM.appLabel(c, 'android-pay'))], onItem: () => { s.paymentDefault = true; c.save(); c.render(); }});
      else c.dialog({title: t.t('nfc_payment_use_default'), items: [radio(!s.paymentForeground, t.t('nfc_payment_favor_default')), radio(!!s.paymentForeground, t.t('nfc_payment_favor_open'))], onItem: i => { s.paymentForeground = i === 1; c.save(); c.render(); }});
      return true;
    }
  };

  /* Daydream (DreamSettings): its switch bar (screensaver_enabled, config_dreamsEnabledByDefault true), the dreams
     DreamBackend finds in the image sorted by caption (DeskClock's Clock and Google Photos' Photos with their settings
     button, BasicDreams' Colors; SystemUI's DessertCaseDream is disabled), dream_info_row.xml: the 40 dp icon, the
     Medium caption, the radio, the nav_divider and ic_bt_config; the overflow's Start now and When to daydream (While
     docked by default: config_dreamsActivatedOnDockByDefault true, OnSleep false). Off, the list gives way to
     screensaver_settings_disabled_prompt. */
  const DREAMS = [['clock', () => MM.appLabel(core, 'clock'), 'assets/app-clock.png', true], ['colors', () => T().t('BasicDreams/color_dream_name'), 'assets/bd-colors_icon.png', false],
    ['photos', () => T().t('Photos/photos_theme_google_photos'), 'assets/app-photos.png', true]];
  let core = null;
  MM.register('settings-dreams', {app: false, init(c) { core = c; }, render: () => ''});
  const WHEN = [['dock', 'screensaver_settings_summary_dock'], ['sleep', 'screensaver_settings_summary_sleep'], ['either', 'screensaver_settings_summary_either_short']];
  MM.settingsScreens.dream = {
    title: () => T().t('screensaver_settings_title'),
    bar(c) {
      const on = S(c).dreams !== false, t = T();
      return `<button type="button" class="mmst-switchbar" data-action="mmdr-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;
    },
    actions: c => MM.menu.button(c),
    render(c) {
      const s = S(c), cur = s.dream || 'clock', collator = new Intl.Collator(c.locale());
      if (s.dreams === false) return `<div class="mmst-empty center"><span>${c.safe(T().t('screensaver_settings_disabled_prompt'))}</span></div>`;
      const list = DREAMS.map(([id, label, icon, settings]) => ({id, label: label(), icon, settings})).sort((a, b) => collator.compare(a.label, b.label));
      return `<div class="mmst-list">${list.map(d => `<div class="mmdr-row"><button type="button" class="mmdr-main" data-action="mmdr-pick" data-id="${d.id}"><img src="${d.icon}" alt=""><span>${c.safe(d.label)}</span><i class="mmw-radio${d.id === cur ? ' on' : ''}"></i></button>${d.settings ? `<i class="mmdr-div"></i><button type="button" class="mmbt-config" data-action="mmdr-settings" data-id="${d.id}"><img src="assets/st-ic_bt_config.png" alt=""></button>` : ''}</div>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mmdr-toggle') { s.dreams = s.dreams === false; c.save(); c.render(); return true; }
      if (name === 'mmdr-pick') { s.dream = el.dataset.id; c.save(); c.render(); return true; }
      // The dreams' settings activities: DeskClock's ScreensaverSettingsActivity (dream_settings.xml) and Photos' own.
      if (name === 'mmdr-settings') { if (el.dataset.id === 'clock') MM.openPrefs(c, 'clock', 'dream_settings'); else MM.settingsGo(c, 'photos-dream', ''); return true; }
      if (name === 'mm-menu') {
        const on = s.dreams !== false, when = s.dreamWhen || 'dock';
        c.menu([{label: t.t('screensaver_settings_dream_start'), disabled: !on, action: c => c.open('daydream', s.dream || 'clock')},
          {label: t.t('screensaver_settings_when_to_dream'), disabled: !on, action: c => c.dialog({title: t.t('screensaver_settings_when_to_dream'),
            items: WHEN.map(([v, label]) => ({html: `<span class="mmst-choice"><i class="mmw-radio${v === when ? ' on' : ''}"></i><span>${c.safe(t.t(label))}</span></span>`})),
            onItem: i => { s.dreamWhen = WHEN[i][0]; c.save(); }})}]);
        return true;
      }
      return false;
    }
  };
  // WallpaperTypeSettings: the activities that handle SET_WALLPAPER, each with its label and icon.
  MM.settingsScreens['wallpaper-type'] = {
    title: () => T().t('wallpaper_settings_fragment_title'),
    render(c) {
      const t = T(), items = [['live', t.t('LiveWallpapersPicker/live_wallpaper_picker_label'), 'assets/lw-ic_launcher_live_wallpaper.png'], ['photos', t.t('Photos/photos_setwallpaper_app_name'), 'assets/app-photos.png'], ['wallpapers', t.t('Velvet/pick_wallpaper'), 'assets/gel-ic_launcher_wallpaper.png']];
      return `<div class="mmst-list">${items.map(([id, label, icon]) => `<button type="button" class="mmst-pref" data-action="mmwp-pick" data-id="${id}"><span class="mmst-iconframe"><img class="mmst-ic big" src="${icon}" alt=""></span><span class="mmst-texts"><span class="mmst-title">${c.safe(label)}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmwp-pick') return false;
      const id = el.dataset.id;
      c.open({wallpapers: 'wallpapers', live: 'live-wallpapers', photos: 'photos'}[id], id === 'photos' ? 'pick:wallpaper' : '');
      return true;
    }
  };
})();
