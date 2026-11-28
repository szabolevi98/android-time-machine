/* Android 2.3.6 Settings: the preference hierarchies of packages/apps/Settings res/xml (settings.xml, wireless_settings,
   sound_settings, display_settings, security_settings*, application_settings, privacy_settings, device_info_memory,
   language_settings, accessibility_settings, date_time_prefs, device_info_settings, device_info_status, tether_prefs)
   rendered as the Gingerbread preference list: window title bar, listSeparator categories, 64 dip rows with a 22 sp title
   and a 14 sp summary, btn_check widgets and ListPreference radio dialogs. Strings come from gb-settings-strings.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBSettingsStrings), text = (lang, key) => R.t(key, lang), entries = (lang, name) => R.array(name, lang);

  // SettingsProvider defaults.xml and the 2.3.6 AudioService / PackageManager defaults.
  const DEFAULTS = {vsLanguage: 0, vsSafeSearch: 1, vsProfanity: true, backgroundData: true, autoSync: true, syncContacts: true, syncCalendar: true, syncEmail: true, vibrateMode: 2, screenTimeout: 6, animationLevel: 2, emergencyTone: 0, installLocation: 2, notificationPulse: true, dtmfTone: true, soundEffects: false, lockSounds: false, autoBrightness: true, haptic: true, assistedGps: true, tactileFeedback: true, autoTime: true, powerButtonEndsCall: false, accessibility: false, dateFormat: 0};
  const value = (settings, key) => settings[key] ?? DEFAULTS[key];

  const cat = title => ({kind: 'category', title});
  const go = (title, summary, target, extra = {}) => ({kind: 'screen', title, summary, target, ...extra});
  const check = (key, title, summary, extra = {}) => ({kind: 'check', key, title, summary, ...extra});
  const list = (key, title, summary, array, extra = {}) => ({kind: 'list', key, title, summary, array, ...extra});
  const info = (title, valueText) => ({kind: 'info', title, value: valueText});

  // Settings arrays wifi_status (index 5: Connected) and wifi_status_with_ssid ("Connected to %1$s").
  function wifiSummary(ctx) {
    const s = ctx.settings;
    if (s.airplane) return 'wifi_in_airplane_mode';
    if (s.wifi && s.wifiNetwork) return {raw: AndroidStrings.format((entries(ctx.lang, 'wifi_status_with_ssid')[5] || 'Connected to %1$s'), s.wifiNetwork)};
    return 'wifi_quick_toggle_summary';
  }
  /* The Nexus S GRK39F image's /system/media/audio: file name and Vorbis TITLE, in MediaStore title order. build.prop sets
     ro.config.ringtone=Sceptrum.ogg and ro.config.notification_sound=Castor.ogg (a later OnTheHunt.ogg line cannot override a
     ro. property, and the image has no such file). Settings keep the file name. */
  const RINGTONE_TITLES = [['ANDROMEDA', 'Andromeda'], ['Aquila', 'Aquila'], ['ArgoNavis', 'Argo Navis'], ['BOOTES', 'Boötes'], ['CANISMAJOR', 'Canis Major'], ['Carina', 'Carina'], ['CASSIOPEIA', 'Cassiopeia'], ['Centaurus', 'Centaurus'], ['Cygnus', 'Cygnus'], ['Draco', 'Draco'], ['Eridani', 'Eridani'], ['hydra', 'Hydra'], ['Lyra', 'Lyra'], ['Machina', 'Machina'], ['Orion', 'Orion'], ['Pegasus', 'Pegasus'], ['PERSEUS', 'Perseus'], ['Pyxis', 'Pyxis'], ['Radiation', 'Radiation by Spagnola'], ['RadiationOrchestration', 'Radiation Orchestration'], ['Rigel', 'Rigel'], ['RobotsforEveryone', 'Robots for Everyone'], ['Scarabaeus', 'Scarabaeus'], ['Sceptrum', 'Sceptrum'], ['Solarium', 'Solarium'], ['Testudo', 'Testudo'], ['URSAMINOR', 'Ursa Minor'], ['Vespa', 'Vespa']];
  const NOTIFICATION_TITLES = [['Aldebaran', 'Aldebaran'], ['Altair', 'Altair'], ['Antares', 'Antares'], ['arcturus', 'Arcturus'], ['Betelgeuse', 'Betelgeuse'], ['Canopus', 'Canopus'], ['Capella', 'Capella'], ['Castor', 'Castor'], ['CetiAlpha', 'Ceti Alpha'], ['Deneb', 'Deneb'], ['Electra', 'Electra'], ['Fomalhaut', 'Fomalhaut'], ['Merope', 'Merope'], ['Polaris', 'Polaris'], ['Pollux', 'Pollux'], ['Procyon', 'Procyon'], ['regulus', 'Regulus'], ['sirius', 'Sirius'], ['Sirrah', 'Sirrah'], ['vega', 'Vega']];
  const TITLES = Object.fromEntries([...RINGTONE_TITLES, ...NOTIFICATION_TITLES]);
  const RINGTONES = RINGTONE_TITLES.map(([file]) => file), NOTIFICATIONS = NOTIFICATION_TITLES.map(([file]) => file);
  const SOUND_DEFAULTS = {ringtone: 'Sceptrum', notificationSound: 'Castor'};
  // A saved sound the image lacks (the earlier AOSP OriginalAudio set) reads as the image's default.
  // Music's "Use as phone ringtone" saves music:<song>; RingtoneManager lists the songs flagged IS_RINGTONE after the
  // system's own tones.
  const songRingtones = () => (window.ICSMusic?.ringtones() || []).map(n => `music:${n}`);
  const soundOf = (s, kind) => { const name = s[kind] ?? SOUND_DEFAULTS[kind]; return name === '' || (kind === 'ringtone' ? [...RINGTONES, ...songRingtones()] : NOTIFICATIONS).includes(name) ? name : SOUND_DEFAULTS[kind]; };
  const soundTitle = name => name?.startsWith?.('music:') ? window.ICSMusic?.tracks[Number(name.slice(6))]?.title || '' : name ? TITLES[name] || name.replace(/_/g, ' ').replace(/([a-z])([A-Z0-9])/g, '$1 $2').replace(/\s+/g, ' ').trim() : '';
  const LOCALES = [['en', 'English'], ['hu', 'Magyar'], ['de', 'Deutsch'], ['fr', 'Français'], ['es', 'Español']];
  /* Screens; "ics:x" targets reuse the version's existing page (lock setup, accounts, applications, battery). */
  // Voice Search 2.1.3's settings data (gb-voice-settings.js) and its language entries.
  const V = window.GBVoiceSettings;
  const VS_LOCALE = {en: 'en-US', hu: 'hu-HU', de: 'de-DE', fr: 'fr-FR', es: 'es-ES'};
  function vsLanguages(lang) {
    const own = V.languages.find(([code]) => code === VS_LOCALE[lang]) || V.languages.find(([code]) => code === 'en-US');
    return [AndroidStrings.format(V.text(lang, 'prefDefaultTitlePrefix_language'), own[1]), ...V.languages.map(([, name]) => name)];
  }
  function screens(ctx) {
    const s = ctx.settings, lockSecure = ['pattern', 'pin', 'password'].includes(s.screenLock), cred = ctx.cred || {};
    // Strings of gb-network.js: Settings' tethering / network rows and Phone's network settings.
    const NET = key => ({raw: window.GBNetwork ? window.GBNetwork.text(ctx.lang, key) : key}), PH = key => ({raw: window.GBNetwork ? window.GBNetwork.phoneText(ctx.lang, key) : key});
    return {
      main: {title: 'settings_label', items: [
        go('radio_controls_title', '', 'wireless', {icon: 'wireless'}), go('call_settings_title', '', 'call', {icon: 'call'}),
        go('sound_settings_title', '', 'sound', {icon: 'sound'}), go('display_settings_title', '', 'display', {icon: 'display'}),
        go('security_settings_title', '', 'security', {icon: 'security'}), go('applications_settings', '', 'applications', {icon: 'applications'}),
        go('sync_settings', '', 'sync', {icon: 'sync'}), go('privacy_settings', '', 'privacy', {icon: 'privacy'}),
        go('storage_settings', '', 'storage', {icon: 'storage'}), go('language_settings', '', 'language', {icon: 'language'}),
        go('voice_input_output_settings', '', 'voice', {icon: 'speech'}), go('accessibility_settings', '', 'accessibility', {icon: 'accessibility'}),
        go('date_and_time_settings_title', '', 'date', {icon: 'date_time'}), go('about_settings', '', 'about', {icon: 'about'})]},
      wireless: {title: 'radio_controls_title', items: [
        check('airplane', 'airplane_mode', 'airplane_mode_summary'),
        check('wifi', 'wifi_quick_toggle_title', wifiSummary(ctx), {disabled: s.airplane}),
        go('wifi_settings', 'wifi_settings_summary', 'wifi'),
        check('bluetooth', 'bluetooth_quick_toggle_title', 'bluetooth_quick_toggle_summary', {disabled: s.airplane}),
        go('bluetooth_settings', 'bluetooth_settings_summary', 'bluetooth'),
        go('tether_settings_title_both', 'tether_settings_summary_both', 'tether'),
        go('vpn_settings_title', 'vpn_settings_summary', 'vpn'),
        check('nfc', 'nfc_quick_toggle_title', 'nfc_quick_toggle_summary'),
        go('network_settings_title', 'network_settings_summary', 'mobile', {disabled: s.airplane})]},
      tether: {title: 'tether_settings_title_both', items: [
        // TetherSettings (tether_prefs.xml): no USB cable, the hotspot (WifiApEnabler), its settings screen and the help.
        check('usbTether', 'usb_tethering_button_text', NET('usb_tethering_unavailable_subtext'), {disabled: true}),
        check('portableHotspot', 'wifi_tether_checkbox_text', {raw: ctx.hotspot || ''}, {disabled: s.airplane || ctx.hotspotBusy, act: 'gbnet-hotspot'}),
        go(NET('wifi_tether_settings_text'), NET('wifi_tether_settings_subtext'), 'wifi-ap'),
        go('tethering_help_button_text', '', 'dialog:help', {net: true})]},
      sound: {title: 'sound_settings', items: [
        cat('sound_category_sound_title'),
        check('silent', 'silent_mode_title', 'silent_mode_summary'),
        list('vibrateMode', 'vibrate_title', 'vibrate_summary', 'vibrate_entries'),
        go('all_volume_title', '', 'dialog:volume', {disabled: !!s.silent}),
        cat('sound_category_calls_title'), go('ringtone_title', {raw: soundTitle(soundOf(s, 'ringtone'))}, 'dialog:ringtone'),
        cat('sound_category_notification_title'), go('notification_sound_title', {raw: soundTitle(soundOf(s, 'notificationSound'))}, 'dialog:notificationSound'),
        check('notificationPulse', 'notification_pulse_title', 'notification_pulse_summary'),
        cat('sound_category_feedback_title'),
        check('dtmfTone', 'dtmf_tone_enable_title', 'dtmf_tone_enable_summary_on'),
        check('soundEffects', 'sound_effects_enable_title', 'sound_effects_enable_summary_on'),
        check('lockSounds', 'lock_sounds_enable_title', 'lock_sounds_enable_summary_on'),
        check('haptic', 'haptic_feedback_enable_title', 'haptic_feedback_enable_summary_on'),
        list('emergencyTone', 'emergency_tone_title', 'emergency_tone_summary', 'emergency_tone_entries')]},
      display: {title: 'display_settings', items: [
        go('brightness', '', 'brightness'),
        check('rotate', 'accelerometer_title', ''),
        list('animationLevel', 'animations_title', null, 'animations_entries'),
        // The simulator's rule (every version): Sleep starts at Never, an entry after the image's own (framework save_password_never).
        list('screenTimeout', 'screen_timeout', 'screen_timeout_summary', 'screen_timeout_entries', {options: [...entries(ctx.lang, 'screen_timeout_entries'), text(ctx.lang, 'fw_save_password_never')]})]},
      security: {title: 'security_settings_title', items: [
        cat('location_title'),
        check('networkLocation', 'location_network_based', s.networkLocation ? 'location_neighborhood_level' : 'location_networks_disabled'),
        check('gps', 'location_gps', s.gps ? 'location_street_level' : 'location_gps_disabled'),
        check('assistedGps', 'assisted_gps', value(s, 'assistedGps') ? 'assisted_gps_enabled' : 'assisted_gps_disabled', {disabled: !s.gps}),
        cat('lock_settings_title'),
        lockSecure ? go('unlock_set_unlock_launch_picker_change_title', 'unlock_set_unlock_launch_picker_change_summary', 'lock:open') : go('unlock_set_unlock_launch_picker_title', 'unlock_set_unlock_launch_picker_summary', 'lock:open'),
        ...(s.screenLock === 'pattern' ? [check('patternVisible', 'lockpattern_settings_enable_visible_pattern_title', '', {fallback: true})] : []),
        ...(lockSecure ? [check('tactileFeedback', 'lockpattern_settings_enable_tactile_feedback_title', '')] : []),
        cat('security_passwords_title'), check('visiblePasswords', 'show_password', 'show_password_summary'),
        cat('device_admin_title'), go('manage_device_admin', 'manage_device_admin_summary', 'toast:No device administrators'),
        cat('credentials_category'),
        // CredentialStorage.updatePreferences: access and reset need an initialized storage (gb-network.js runs the dialogs).
        check('credentialAccess', 'credentials_access', 'credentials_access_summary', {disabled: !cred.state || cred.state === 'uninit', act: 'gbnet-cred-access', on: !!cred.access}),
        go('credentials_install_certificates', 'credentials_install_certificates_summary', 'toast:No certificate found on the SD card'),
        go('credentials_set_password', 'credentials_set_password_summary', 'gbnet-cred-password', {action: true}),
        go('credentials_reset', 'credentials_reset_summary', 'gbnet-cred-reset', {action: true, disabled: !cred.state || cred.state === 'uninit'})]},
      applications: {title: 'applications_settings_header', items: [
        check('unknownSources', 'install_applications', 'install_unknown_applications'),
        list('installLocation', 'app_install_location_title', 'app_install_location_summary', 'app_install_location_entries'),
        go('manageapplications_settings_title', 'manageapplications_settings_summary', 'ics:apps'),
        go('runningservices_settings_title', 'runningservices_settings_summary', 'ics:running'),
        go('storageuse_settings_title', 'storageuse_settings_summary', 'storage'),
        go('power_usage_summary_title', 'power_usage_summary', 'ics:battery'),
        go('development_settings_title', 'development_settings_summary', 'development')]},
      privacy: {title: 'privacy_settings', items: [
        cat('backup_section_title'),
        check('backup', 'backup_data_title', 'backup_data_summary'),
        check('autoRestore', 'auto_restore_title', 'auto_restore_summary', {disabled: !s.backup}),
        cat('personal_data_section_title'),
        go('master_clear_title', 'master_clear_summary', 'ics:reset-info')]},
      storage: {title: 'storage_settings', items: [
        cat('sd_memory'), info('memory_size', '14.84GB'), info('memory_available', '13.92GB'),
        go('sd_eject', 'sd_eject_summary', 'toast:SD card will be unmounted'), go('sd_format', 'sd_format_summary', 'toast:This feature is not part of the simulator.'),
        cat('internal_memory'), info('memory_available', '869MB')]},
      language: {title: 'language_settings', items: [
        cat('language_settings_category'), go('phone_language', {raw: ctx.languageName}, 'locale'),
        go('user_dict_settings_titlebar', '', 'toast:No words in user dictionary'),
        cat('keyboard_settings_category'), go('Android keyboard', {raw: ctx.t('Android keyboard settings')}, 'toast:Android keyboard')]},
      // voice_input_output_settings.xml with the one recognizer (VoiceSearch's GoogleRecognitionService, "Google"):
      // VoiceInputOutputSettings drops the recognizer list and links its settings.
      voice: {title: 'voice_input_output_settings', items: [
        ...(V ? [cat('voice_input_category'), go('recognizer_settings_title', {raw: AndroidStrings.format(text(ctx.lang, 'recognizer_settings_summary'), V.text(ctx.lang, 'serviceLabel'))}, 'voice-recognizer')] : []),
        cat('voice_output_category'), go('tts_settings', '', 'toast:Pico TTS')]},
      // VoiceSearchPreferences (preferences.xml): the language ("Default - <the phone's language>" first), SafeSearch with
      // its level text and suffix, Block offensive words, Personalized recognition (opt-in / opt-out dialogs), the
      // Google Account dashboard link.
      'voice-recognizer': V && {title: {raw: V.text(ctx.lang, 'voiceSearchPreferences')}, items: [
        list('vsLanguage', {raw: V.text(ctx.lang, 'prefTitle_language')}, null, null, {options: vsLanguages(ctx.lang)}),
        list('vsSafeSearch', {raw: V.text(ctx.lang, 'prefTitle_safeSearch')}, {raw: `${V.text(ctx.lang, ['prefSummary_safeSearchOff', 'prefSummary_safeSearchModerate', 'prefSummary_safeSearchStrict'][value(s, 'vsSafeSearch')])}\n${V.text(ctx.lang, 'prefSummary_safeSearchSuffix')}`}, null, {options: V.safeSearch(ctx.lang)}),
        check('vsProfanity', {raw: V.text(ctx.lang, 'prefTitle_profanityFilter')}, {raw: V.text(ctx.lang, 'prefSummary_profanityFilter')}),
        check('vsPersonal', {raw: V.text(ctx.lang, 'personalization_header')}, {raw: V.text(ctx.lang, 'personalization_settings_message')}, {act: 'gbvs-personal'}),
        go({raw: V.text(ctx.lang, 'manage_personalization')}, {raw: V.text(ctx.lang, 'manage_personalization_message')}, `toast:${ctx.t('This feature is not part of the simulator.')}`)]},
      accessibility: {title: 'accessibility_settings', items: [
        check('accessibility', 'accessibility_settings', {raw: ''}, {disabled: true}),
        cat('accessibility_services_category'), info('accessibility_service_no_apps_title', ''),
        cat('accessibility_power_button_category'),
        check('powerButtonEndsCall', 'accessibility_power_button_ends_call', 'accessibility_power_button_ends_call_summary')]},
      date: {title: 'date_and_time', items: [
        check('autoTime', 'date_time_auto', 'date_time_auto_summaryOn'),
        go('date_time_set_date', {raw: ctx.date}, 'dialog:date', {disabled: value(s, 'autoTime')}),
        go('date_time_set_timezone', {raw: ctx.zone}, 'zones', {disabled: value(s, 'autoTime')}),
        go('date_time_set_time', {raw: ctx.time}, 'dialog:time', {disabled: value(s, 'autoTime')}),
        check('hour24', 'date_time_24hour', {raw: s.hour24 ? '13:00' : '1:00 pm'}),
        list('dateFormat', 'date_time_date_format', null, null, {options: ctx.dateFormats})]},
      // ZoneList: timezones.xml's zones as simple_list_item_2 rows (the name over its GMT offset), sorted by offset or by
      // name from the menu (zone_list_menu_sort_alphabetically / _by_timezone).
      zones: {title: 'date_time_set_timezone', menu: [ctx.zoneSort === 'name' ? {action: 'gbset-zone-sort', id: 'offset', title: 'zone_list_menu_sort_by_timezone', icon: 'gb-set-ic_menu_3d_globe.png'} : {action: 'gbset-zone-sort', id: 'name', title: 'zone_list_menu_sort_alphabetically', icon: 'gb-set-ic_menu_sort_alphabetically.png'}],
        items: (ctx.zones || []).map(z => ({kind: 'zone', id: z.id, name: z.name, offset: z.offset}))},
      about: {title: 'about_settings', items: [
        go('system_update_settings_list_item_title', '', 'toast:Your system is currently up to date.'),
        go('device_status', 'device_status_summary', 'status'),
        go('power_usage_summary_title', 'power_usage_summary', 'ics:battery'),
        go('legal_information', '', 'ics:about-legal'),
        go('system_tutorial_list_item_title', {raw: ctx.t('Learn how to use your phone')}, 'toast:System tutorial'),
        info('model_number', ctx.about.model), {...info('firmware_version', ctx.about.version), action: 'about-tap'},
        info('baseband_version', ctx.about.baseband), info('kernel_version', ctx.about.kernel), info('build_number', ctx.about.build)]},
      status: {title: 'device_status', items: [
        info('battery_status_title', ctx.t('Discharging')), info('battery_level_title', '78%'), info('status_number', ctx.t('Unknown')),
        info('status_operator', ctx.carrier), info('status_signal_strength', s.airplane ? '0 dBm   0 asu' : '-81 dBm   16 asu'),
        info('status_network_type', s.airplane ? 'status_unavailable' : 'HSDPA'), info('status_service_state', ctx.t(s.airplane ? 'Radio off' : 'In service')),
        info('status_roaming', ctx.t('Not roaming')), info('status_data_state', ctx.t(s.airplane ? 'Disconnected' : 'Connected')),
        info('status_imei', '354957034053382'), info('status_imei_sv', '16'),
        info('status_wifi_mac_address', '38:AA:3C:A1:5E:42'), info('status_bt_address', s.bluetooth ? '38:AA:3C:A1:5E:41' : 'status_unavailable'),
        info('status_up_time', ctx.uptime)]},
      call: {title: 'call_settings_title', items: [
        go('Fixed Dialing Numbers', {raw: ctx.t('Manage fixed dialing numbers')}, 'toast:FDN is disabled'),
        go('Voicemail service', {raw: ctx.t('My carrier')}, 'toast:Voicemail service: My carrier'),
        go('Voicemail settings', {raw: ctx.t('Voicemail number not set')}, 'toast:Voicemail number not set'),
        go('Call forwarding', {raw: ctx.t('Forward incoming calls')}, 'toast:Call forwarding settings are offline'),
        go('Additional settings', {raw: ctx.t('Additional GSM only call settings')}, 'toast:Call settings error')]},
      // Phone's Settings (network_setting.xml + gsm_umts_options.xml; Data usage leaves without a throttle policy).
      mobile: {title: PH('settings_label'), items: [
        check('dataEnabled', PH('data_enabled'), PH('data_enable_summary'), {act: 'gbnet-data', fallback: true}),
        check('dataRoaming', PH('roaming'), PH(s.dataRoaming ? 'roaming_enable' : 'roaming_disable'), {act: 'gbnet-roaming'}),
        go(PH('apn_settings'), '', 'apn'), check('only2g', PH('prefer_2g'), PH('prefer_2g_summary')),
        go(PH('networks'), PH('sum_carrier_select'), 'operators')]},
      // WifiSettings (wifi_settings.xml): the toggle, network notification, the access points and "Add Wi-Fi network".
      wifi: {title: 'wifi_settings_category', menu: [{action: 'gbset-wifi-scan', title: 'wifi_menu_scan', icon: 'ic_menu_refresh'}, {action: 'gbset-go', id: 'wifi-advanced', title: 'wifi_menu_advanced', icon: 'ic_menu_manage'}], items: [
        check('wifi', 'wifi_quick_toggle_title', wifiSummary(ctx), {disabled: s.airplane}),
        check('wifiNotify', 'wifi_notify_open_networks', 'wifi_notify_open_networks_summary', {disabled: !s.wifi}),
        cat('wifi_access_points'),
        ...(s.wifi ? (ctx.networks || []).map(network => ({kind: 'ap', network})) : []),
        go('wifi_add_network', '', 'dialog:wifi-add', {disabled: !s.wifi})]},
      'wifi-advanced': {title: 'wifi_advanced_titlebar', items: [
        list('wifiSleepPolicy', 'wifi_setting_sleep_policy_title', 'wifi_setting_sleep_policy_summary', 'wifi_sleep_policy_entries'),
        info('wifi_advanced_mac_address_title', '38:AA:3C:A1:5E:42'),
        info('wifi_advanced_ip_address_title', s.wifi && s.wifiNetwork ? '192.168.1.104' : 'status_unavailable')]},
      // BluetoothSettings (bluetooth_settings.xml).
      bluetooth: {title: 'bluetooth_settings', items: [
        check('bluetooth', 'bluetooth', 'bluetooth_quick_toggle_summary', {disabled: s.airplane}),
        go('bluetooth_device_name', {raw: s.bluetoothName || 'Nexus S'}, 'dialog:bt-name', {disabled: !s.bluetooth}),
        check('bluetoothVisible', 'bluetooth_visibility', {raw: s.bluetoothVisible ? AndroidStrings.format(text(ctx.lang, 'bluetooth_is_discoverable'), '120') : text(ctx.lang, 'bluetooth_not_discoverable')}, {disabled: !s.bluetooth}),
        list('btTimeout', 'bluetooth_visibility_timeout', 'bluetooth_visibility_timeout_summary', 'bluetooth_visibility_timeout_entries', {disabled: !s.bluetooth}),
        go('bluetooth_preference_scan_title', '', 'gbset-bt-scan', {disabled: !s.bluetooth, action: true}),
        cat('bluetooth_devices'),
        ...(s.bluetooth ? (ctx.btDevices || []).map(device => ({kind: 'bt', device})) : [])]},
      // DevelopmentSettings (development_prefs.xml).
      development: {title: 'development_settings_title', items: [
        check('usbDebug', 'enable_adb', 'enable_adb_summary'),
        check('stayAwake', 'keep_screen_on', 'keep_screen_on_summary'),
        check('mockLocations', 'allow_mock_location', 'allow_mock_location_summary')]},
      // LocalePicker: the supported locales as a plain list.
      locale: {title: 'phone_language', items: LOCALES.map(([code, name]) => ({kind: 'locale', code, name}))},
      brightness: null
    };
  }

  const resolve = (lang, t, item) => typeof item === 'object' && item ? (item.raw ?? '') : item ? (R.has(item) ? text(lang, item) : t(item)) : '';
  function row(item, ctx) {
    const label = resolve(ctx.lang, ctx.t, item.title);
    if (item.kind === 'category') return `<div class="gbset-cat">${e(label)}</div>`;
    const disabled = item.disabled ? ' disabled aria-disabled="true"' : '';
    let summary = resolve(ctx.lang, ctx.t, item.summary), widget = '', action = '', id = '';
    if (item.kind === 'check') {
      const on = item.on ?? !!(ctx.settings[item.key] ?? DEFAULTS[item.key] ?? (item.fallback ? true : false));
      widget = `<img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}${item.disabled ? '_disable' : ''}.png" alt="">`;
      action = item.act || 'gbset-check'; id = item.act ? '' : item.key;
      return `<button class="gbset-row" data-action="${action}" data-id="${e(id)}" role="checkbox" aria-checked="${on}"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>${widget}</button>`;
    }
    if (item.kind === 'list') {
      const options = item.options || entries(ctx.lang, item.array);
      if (item.summary === null) summary = options[value(ctx.settings, item.key)] ?? '';
      return `<button class="gbset-row" data-action="gbset-list" data-id="${e(item.key)}"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary).replace(/\n/g, '<br>')}</span>` : ''}</span></button>`;
    }
    if (item.kind === 'ap') {
      // AccessPoint: SSID, "Connected" or "Secured with WPA2" / "Remembered", and the (lock) signal icon.
      const n = item.network, connected = ctx.settings.wifiNetwork === n.name, secured = n.security !== 'Open';
      const status = connected ? entries(ctx.lang, 'wifi_status')[5] : secured ? AndroidStrings.format(text(ctx.lang, 'wifi_secured'), n.security) : '';
      return `<button class="gbset-row" data-action="gbset-ap" data-id="${e(n.name)}"><span class="gbset-text"><span class="gbset-title">${e(n.name)}</span>${status ? `<span class="gbset-sum">${e(status)}</span>` : ''}</span><img class="gbset-signal" src="assets/gb-set-ic_wifi_${secured ? 'lock_' : ''}signal_${Math.max(1, Math.min(4, n.strength))}.png" alt=""></button>`;
    }
    if (item.kind === 'bt') {
      const d = item.device;
      return `<button class="gbset-row with-icon" data-action="gbset-bt-device" data-id="${e(d.name)}"><img class="gbset-icon gbset-bt-icon" src="assets/gb-set-ic_bt_${d.kind || 'headset_hfp'}.png" alt=""><span class="gbset-text"><span class="gbset-title">${e(d.name)}</span><span class="gbset-sum">${e(text(ctx.lang, d.paired ? (d.connected ? 'bluetooth_connected' : 'bluetooth_paired') : 'bluetooth_not_connected'))}</span></span></button>`;
    }
    if (item.kind === 'zone') return `<button class="gbset-row gbset-zone" data-action="gbset-zone" data-id="${e(item.id)}"><span class="gbset-text"><span class="gbset-title">${e(item.name)}</span><span class="gbset-sum">${e(item.offset)}</span></span></button>`;
    if (item.kind === 'locale') return `<button class="gbset-row gbset-locale" data-action="gbset-locale" data-id="${e(item.code)}"><span class="gbset-text"><span class="gbset-title">${e(item.name)}</span></span></button>`;
    if (item.kind === 'info') {
      const shown = R.has(item.value) ? text(ctx.lang, item.value) : item.value;
      return `<div class="gbset-row gbset-info"${item.action ? ` data-action="${e(item.action)}" role="button" tabindex="0"` : ''}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${shown ? `<span class="gbset-sum">${e(shown).replace(/\n/g, '<br>')}</span>` : ''}</span></div>`;
    }
    const icon = item.icon ? `<img class="gbset-icon" src="assets/gb-ic_settings_${item.icon}.png" alt="">` : '';
    const target = item.target || '';
    action = item.action ? target : target.startsWith('ics:') ? 'settings-sub' : target.startsWith('toast:') ? 'gbset-toast' : target.startsWith('dialog:') ? (item.net ? 'gbnet-dialog' : 'gbset-dialog') : target ? 'gbset-go' : 'noop';
    id = item.action ? '' : target.replace(/^(ics|toast|dialog):/, '');
    // The screen-lock rows hand over to the credential controller (ChooseLockGeneric).
    if (target === 'lock:open') return `<button class="gbset-row" data-lock-action="open"${disabled}><span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span></button>`;
    return `<button class="gbset-row${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(id)}"${disabled}>${icon}<span class="gbset-text"><span class="gbset-title">${e(label)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span></button>`;
  }
  function render(id, ctx) {
    const all = screens(ctx), screen = all[id || 'main'];
    if (!screen) return null;
    const title = resolve(ctx.lang, ctx.t, screen.title);
    return {title, html: `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="gbset-list">${screen.items.map(item => row(item, ctx)).join('')}</div></div>`};
  }
  function listDialog(key, ctx) {
    const items = Object.values(screens(ctx)).filter(Boolean).flatMap(screen => screen.items).find(item => item.kind === 'list' && item.key === key);
    if (!items) return null;
    const options = items.options || entries(ctx.lang, items.array);
    return {title: resolve(ctx.lang, ctx.t, items.title), items: options.map((label, index) => ({action: 'gbset-list-pick', id: `${key}:${index}`, title: label})), choice: 'single', selected: value(ctx.settings, key), buttons: [{action: 'close-overlay', title: text(ctx.lang, 'fw_cancel')}]};
  }
  const has = id => !!screens({settings: {}, t: k => k, about: {}, lang: 'en'})[id || 'main'];
  const menu = (id, ctx) => (screens(ctx)[id || 'main']?.menu || []).map(item => ({...item, title: text(ctx.lang, item.title)}));
  /* Dialogs: RingerVolumePreference (ringtone, media, alarm sliders and the notification checkbox/slider),
     RingtonePickerActivity (Silent + the sounds, OK / Cancel), the WifiDialog and the Bluetooth name EditTextPreference. */
  function dialog(kind, ctx) {
    const s = ctx.settings, T = key => text(ctx.lang, key), ok = T('fw_ok'), cancel = T('fw_cancel');
    const slider = (key, label, fallback) => `<label class="gbvol"><span>${e(label)}</span><input type="range" min="0" max="100" data-vol="${key}" value="${Number(s[key] ?? fallback)}"></label>`;
    // DatePickerDialog / TimePickerDialog: the framework NumberPickers (month, day, year in the locale's order; hour,
    // minute and the AM / PM button), titled with the full date or the time, Set / Cancel.
    if (kind === 'date' || kind === 'time') {
      const d = ctx.draft || {}, at = new Date(d.y, d.m, d.d, d.h, d.mi), set = T('fw_date_time_set');
      const picker = (field, value) => `<div class="gbtp-picker gbtp-${field}"><button type="button" class="gbtp-up" data-action="gbset-dt-step" data-id="${field}:1" aria-label="+"></button><output class="gbtp-input">${e(value)}</output><button type="button" class="gbtp-down" data-action="gbset-dt-step" data-id="${field}:-1" aria-label="-"></button></div>`;
      if (kind === 'date') {
        const month = picker('m', at.toLocaleDateString(ctx.locale, {month: 'short'})), day = picker('d', String(d.d)), year = picker('y', String(d.y));
        const order = new Intl.DateTimeFormat(ctx.locale, {year: 'numeric', month: 'short', day: 'numeric'}).formatToParts(at).filter(p => ['year', 'month', 'day'].includes(p.type)).map(p => ({year, month, day})[p.type]).join('');
        return {title: at.toLocaleDateString(ctx.locale, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'}), icon: 'gb-ic_dialog_time.png', custom: `<div class="gbtp gbtp-date">${order}</div>`, buttons: [{action: 'gbset-dt-set', title: set}, {action: 'close-overlay', title: cancel}]};
      }
      const h24 = !!s.hour24, hour = h24 ? String(d.h).padStart(2, '0') : String(d.h % 12 || 12), ampm = d.h < 12 ? 'AM' : 'PM';
      return {title: `${hour}:${String(d.mi).padStart(2, '0')}${h24 ? '' : ' ' + ampm}`, icon: 'gb-ic_dialog_time.png', custom: `<div class="gbtp">${picker('h', hour)}${picker('mi', String(d.mi).padStart(2, '0'))}${h24 ? '' : `<button type="button" class="gbtp-ampm" data-action="gbset-dt-ampm">${e(ampm)}</button>`}</div>`, buttons: [{action: 'gbset-dt-set', title: set}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'volume') {
      const same = s.notificationSameAsRing !== false;
      return {title: T('all_volume_title'), custom: `<div class="gbvols">${slider('ringVolume', T('incoming_call_volume_title'), 70)}<label class="gbvol-check"><input type="checkbox" data-vol-same ${same ? 'checked' : ''}> ${e(T('checkbox_notification_same_as_incoming_call'))}</label>${slider('notificationVolume', T('notification_volume_title'), 70).replace('<label class="gbvol"', `<label class="gbvol" data-vol-notification${same ? ' hidden' : ''}`)}${slider('mediaVolume', T('media_volume_title'), 60)}${slider('alarmVolume', T('alarm_volume_title'), 80)}</div>`, buttons: [{action: 'gbset-volume-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'ringtone' || kind === 'notificationSound') {
      const names = kind === 'ringtone' ? [...RINGTONES, ...songRingtones()] : NOTIFICATIONS, current = soundOf(s, kind);
      const options = ['', ...names];
      return {title: T(kind === 'ringtone' ? 'ringtone_title' : 'notification_sound_title'), items: options.map(name => ({action: 'gbset-sound-pick', id: `${kind}:${name}`, title: name ? soundTitle(name) : ctx.t('Silent')})), choice: 'single', selected: Math.max(0, options.indexOf(current)), buttons: [{action: 'close-overlay', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    if (kind === 'bt-name') return {title: T('bluetooth_device_name'), custom: `<label class="gbdlg-field"><input data-bt-name maxlength="40" value="${e(s.bluetoothName || 'Nexus S')}"></label>`, buttons: [{action: 'gbset-bt-name-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    if (kind.startsWith('ap:')) {
      const n = (ctx.networks || []).find(item => item.name === kind.slice(3)); if (!n) return null;
      const connected = s.wifiNetwork === n.name, secured = n.security !== 'Open';
      const signal = entries(ctx.lang, 'wifi_signal')[[0, 0, 1, 2, 3][n.strength] ?? 2];
      const rows = connected ? [[T('wifi_status'), entries(ctx.lang, 'wifi_status')[5]], [T('wifi_signal'), signal], [T('wifi_speed'), '54Mbps'], [T('wifi_security'), secured ? n.security : ctx.t('None')], [T('wifi_ip_address'), '192.168.1.104']]
        : [[T('wifi_security'), secured ? n.security : ctx.t('None')], [T('wifi_signal'), signal]];
      const body = `<dl class="gbwifi">${rows.map(([k, v]) => `<dt>${e(k)}</dt><dd>${e(v)}</dd>`).join('')}</dl>${!connected && secured ? `<label class="gbdlg-field"><span>${e(T('wifi_password'))}</span><input type="password" data-wifi-password maxlength="63"></label><label class="gbvol-check"><input type="checkbox" data-wifi-show> ${e(T('wifi_show_password'))}</label>` : ''}`;
      return {title: n.name, custom: body, buttons: connected ? [{action: 'gbset-wifi-forget', id: n.name, title: T('wifi_forget')}, {action: 'close-overlay', title: T('wifi_cancel')}] : [{action: 'gbset-wifi-connect', id: n.name, title: T('wifi_connect')}, {action: 'close-overlay', title: T('wifi_cancel')}]};
    }
    if (kind === 'wifi-add') return {title: T('wifi_add_network'), custom: `<label class="gbdlg-field"><span>${e(T('wifi_ssid'))}</span><input data-wifi-ssid maxlength="32"></label>`, buttons: [{action: 'gbset-wifi-save', title: T('wifi_save')}, {action: 'close-overlay', title: T('wifi_cancel')}]};
    // PersonalizationOptInActivity: turning personalized recognition on, or off.
    if (kind === 'vs-on' || kind === 'vs-off') { const VT = key => V.text(ctx.lang, key); return {title: VT('personalization_header'), message: kind === 'vs-on' ? `${VT('personalization_popup_first_time_header')}\n\n${VT('personalization_popup_message')}` : VT('personalization_popup_disable_message'), buttons: [{action: kind === 'vs-on' ? 'gbvs-personal-on' : 'gbvs-personal-off', title: VT('ok')}, {action: 'close-overlay', title: VT('cancel')}]}; }
    if (kind === 'adb') return {title: T('adb_warning_title'), icon: 'ic_dialog_alert', message: ctx.t('USB debugging is intended for development purposes only. It can be used to copy data between your computer and your device, install applications on your device without notification, and read log data.'), buttons: [{action: 'gbset-adb-ok', title: T('fw_yes')}, {action: 'close-overlay', title: T('fw_no')}]};
    return null;
  }

  window.GBSettings = {DEFAULTS, value, text, entries, screens, render, listDialog, has, menu, dialog, soundTitle, soundOf, RINGTONES, NOTIFICATIONS};
})();

/* Settings on Android 2.3.6 (Settings.apk of GRK39F) as a module (docs/plans/engine-migration.md): the preference
   screens (gb-settings.js), the application, battery, storage, accounts and reset pages (gb-settings-pages.js), the
   hotspot, VPN, APN, network operator and credential storage screens (gb-network.js), the screen lock setup, the
   date, time and zone pickers, Wi-Fi and Bluetooth, the zombie art, the Menu key, the dialogs, the forms and Back.
   The status bar and the shade read the network screens' state through net(c). */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  // The shell's bindings the screens' code uses, and their helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderOverlay, renderStatus, toast, overlayRoot, viewport, openApp, deviceDate, apps, appNames, appIcon, carrierName, gbClock, lockControls, navigateBrowser} = c;
    const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
    // ZoneList rows and the Date & time summary: timezones.xml's names with their current "GMT+01:00" offsets.
    function gbOffset(zone) { const p = new Intl.DateTimeFormat('en-US', {timeZone: zone, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || 'GMT'; const m = p.match(/([+-])(\d+):?(\d*)/); const minutes = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0; return {minutes, text: `GMT${minutes < 0 ? '-' : '+'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`}; }
    function gbZones() { const col = {en: 1, hu: 2, de: 3, fr: 4, es: 5}[i18n.language] || 1; const list = (window.GBTimeZones || []).map(z => ({id: z[0], name: z[col], ...gbOffset(z[0])})).map(z => ({...z, offset: z.text})); return ui.gbZoneSort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name, i18n.locale())) : list.sort((a, b) => a.minutes - b.minutes); }
    function gbZoneText() { const id = ICSSystemSettings.zone(data), z = (window.GBTimeZones || []).find(row => row[0] === id), col = {en: 1, hu: 2, de: 3, fr: 4, es: 5}[i18n.language] || 1; return `${gbOffset(id).text}, ${z ? z[col] : new Intl.DateTimeFormat(i18n.locale(), {timeZone: id, timeZoneName: 'long'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || id}`; }
    // gb-network.js: the hotspot, VPN, APN, network operator and credential storage screens and their dialogs.
    function gbNetContext() {
      return {data, ui, lang: i18n.language, t: key => i18n.t(key), save, render, renderOverlay, renderStatus, toast, overlayRoot,
        go: sub => { (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = sub; render(); },
        pop: () => { ui.sub = (ui.gbSettingsStack || []).pop() ?? ''; render(); },
        openBrowser: url => { openApp('browser'); navigateBrowser(url); },
        openSettings: sub => { ui.overlay = ''; renderOverlay(); ui.view = 'settings'; ui.sub = sub; ui.gbSettingsStack = sub === 'vpn' ? ['', 'wireless'] : ['', 'wireless']; render(); }};
    }
    function gbSettingsContext() {
      const now = deviceDate(), lang = i18n.language;
      const formats = [now.toLocaleDateString(i18n.locale()), `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`, `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`, `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`];
      const up = Math.floor(performance.now() / 1000) + 9240;
      return {settings: data.settings, lang, t: key => i18n.t(key), carrier: carrierName(), cred: GBNetwork.credentialRows({data}), hotspot: GBNetwork.hotspotText(data, ui, lang), hotspotBusy: !!ui.gbApTurning, date: formats[GBSettings.value(data.settings, 'dateFormat')] || formats[0], time: gbClock() + (data.settings.hour24 ? '' : now.getHours() < 12 ? ' AM' : ' PM'), zone: gbZoneText(), zones: gbZones(), zoneSort: ui.gbZoneSort || 'offset', draft: ui.gbDtDraft, locale: i18n.locale(), dateFormats: [AndroidStrings.format(GBSettings.text(lang, 'normal_date_format'), formats[0]), ...formats.slice(1)],
        languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[lang] || 'English',
        // WifiSettings sorts the connected network first, then by signal; the paired device and the last scan's results.
        networks: allWifiNetworks().slice().sort((a, b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name)),
        btDevices: [...(data.settings.pairedDevice ? [{name: data.settings.pairedDevice, paired: true, connected: true, kind: 'headset_hfp'}] : []), ...(ui.btFound || []).filter(device => device.name !== data.settings.pairedDevice)],
        uptime: `${Math.floor(up / 3600)}:${String(Math.floor(up / 60) % 60).padStart(2, '0')}:${String(up % 60).padStart(2, '0')}`,
        about: {model: 'Nexus S', version: '2.3.6', baseband: 'I9020XXKD1', kernel: '2.6.35.7-gf5f63ef\nandroid-build@apa28 #1\nTue Aug 2 13:57:05 PDT 2011', build: 'GRK39F'}};
    }
    // Data for the 2.3.6 application, battery and reset pages; the simulator's apps are the system image.
    function gbPagesContext() {
      const list = apps.filter(app => app[0] !== 'play-store' || true).map(app => ({id: app[0], name: i18n.t(appNames[app[0]]), icon: appIcon(app[0])}));
      const named = id => list.find(a => a.id === id);
      const running = [...new Set(['phone', 'messaging', ...ui.recent])].map(named).filter(Boolean).map((a, i) => ({...a, ram: 3200000 + i * 1450000, uptime: `${String(12 + i * 7).padStart(2, '0')}:${String(30 - i * 3).padStart(2, '0')}`}));
      const sysIcon = name => `<span class="app-icon"><img src="assets/gb-st-${name}.png" alt=""></span>`;
      const usage = [
        {id: 'screen', name: GBSettingsPages.text(i18n.language, 'power_screen'), icon: sysIcon('ic_settings_display'), percent: 41, details: [['usage_type_on_time', '1h 2m 14s']], action: 'settings-sub', actionLabel: 'battery_action_display', actionId: 'display'},
        {id: 'cell', name: GBSettingsPages.text(i18n.language, 'power_cell'), icon: sysIcon('ic_settings_cell_standby'), percent: 19, details: [['usage_type_on_time', '3h 12m 5s'], ['usage_type_no_coverage', '0%']]},
        {id: 'idle', name: GBSettingsPages.text(i18n.language, 'power_idle'), icon: sysIcon('ic_settings_phone_idle'), percent: 12, details: [['usage_type_on_time', '2h 9m 51s']]},
        {id: 'wifi', name: GBSettingsPages.text(i18n.language, 'power_wifi'), icon: sysIcon('ic_settings_wifi'), percent: 8, details: [['usage_type_on_time', '3h 12m 5s'], ['usage_type_cpu', '41s']], action: 'settings-sub', actionLabel: 'battery_action_wifi', actionId: 'wifi'},
        {id: 'system', name: 'Android System', icon: appIcon('settings'), percent: 7, details: [['usage_type_cpu', '3m 2s'], ['usage_type_cpu_foreground', '1m 18s'], ['usage_type_wake_lock', '6m 40s']]},
        {id: 'kernel', name: GBSettingsPages.text(i18n.language, 'process_kernel_label'), icon: appIcon('settings'), percent: 6, details: [['usage_type_cpu', '2m 37s']]},
        ...running.slice(0, 3).map((a, i) => ({id: 'app:' + a.id, app: a.id, name: a.name, icon: a.icon, percent: 3 - i, details: [['usage_type_cpu', `${40 - i * 9}s`], ['usage_type_cpu_foreground', `${22 - i * 5}s`]]}))
      ];
      const permissions = {phone: [['Your personal information', 'read contact data, write contact data'], ['Services that cost you money', 'directly call phone numbers']], messaging: [['Your messages', 'read SMS or MMS, receive SMS'], ['Services that cost you money', 'send SMS messages']], browser: [['Network communication', 'full Internet access']], email: [['Network communication', 'full Internet access']], camera: [['Hardware controls', 'take pictures and videos']]};
      const lastSync = new Date(data.gbLastSync || Date.now() - 3600000).toLocaleString(i18n.locale(), {month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24});
      return {settings: {...GBSettings.DEFAULTS, ...data.settings}, account: ICSEmail.account, accountRemoved: !!data.gbAccountRemoved, syncing: !!ui.gbSyncing, lastSync, lang: i18n.language, locale: i18n.locale(), tab: ui.gbAppsTab || 'downloaded', sortBySize: !!ui.gbAppsSize, apps: list, running, app: named(ui.settingsApp), isRunning: running.some(a => a.id === ui.settingsApp), cleared: (data.gbClearedApps || []).includes(ui.settingsApp), permissions: permissions[ui.settingsApp] || [], usage, item: ui.batteryDetail, onBattery: '3h 12m 5s', eraseExternal: !!ui.gbspErase, usedText: '312MB', freeText: '1.67GB'};
    }
    function renderSettings() {
      const s = ui.sub;
      if(s==='lock-setup')return lockControls.renderSetup();
      if (!s) ui.gbSettingsStack = [];
      if (GBNetwork.has(s)) return GBNetwork.render(s, gbNetContext()).html;
      if (GBSettings.has(s || 'main')) return GBSettings.render(s || 'main', gbSettingsContext()).html;
      if (GBSettingsPages.has(s)) { const page = GBSettingsPages.render(s, gbPagesContext()); if (page) return page; }
      // PlatLogoActivity (Theme.NoTitleBar.Fullscreen): platlogo FIT_CENTER on black; every touch shows the credit toast.
      if (s === 'easter') return `<button class="gb-platlogo" data-action="gb-platlogo" aria-label="Gingerbread"><img src="assets/gb-platlogo.jpg" alt=""></button>`;
      return GBSettings.render('main', gbSettingsContext()).html;
    }
    return {data, ui, save, render, renderOverlay, renderStatus, toast, overlayRoot, viewport, screen: c.screen, safe: c.safe, deviceDate, apps, lockControls, clearAppData: c.clearAppData, resetSimulator: c.resetSimulator, storeUninstall: c.storeUninstall, allWifiNetworks, gbNetContext, gbSettingsContext, gbPagesContext, renderSettings};
  }
  window.GB?.register('settings', {
    net: c => shell(c).gbNetContext(),
    render: c => shell(c).renderSettings(),
    // A long press (or a right click) on a VPN or an APN opens its menu.
    mount(c, root) { GB.hold(c, root, '[data-gbnet-hold]', held => GBNetwork.hold(held.dataset.gbnetHold, shell(c).gbNetContext())); },
    menu(c) {
      const {ui, gbPagesContext, gbNetContext, gbSettingsContext} = shell(c);
      if (GBSettingsPages.has(ui.sub)) { c.gbMenu(GBSettingsPages.menu(ui.sub, gbPagesContext())); return; }
      if (GBNetwork.has(ui.sub)) { c.gbMenu(GBNetwork.menu(ui.sub, gbNetContext())); return; }
      if (GBSettings.has(ui.sub || 'main')) { c.gbMenu(GBSettings.menu(ui.sub, gbSettingsContext())); return; }
    },
    // The network screens' dialogs (their texts come localized from the image's strings and profile names are the
    // user's: no interface translation), the pages', the preferences' and their lists, and BrightnessPreference
    // (preference_dialog_brightness.xml): "Automatic brightness" above the seek bar; OK / Cancel.
    dialog(kind, c) {
      const {data, ui, safe, gbNetContext, gbPagesContext, gbSettingsContext} = shell(c), t = key => i18n.t(key);
      if (kind === 'net') return {...(GBNetwork.dialog(ui.gbNetDialog, gbNetContext()) || {title: '', items: []}), noTranslate: true};
      if (kind === 'sp') return GBSettingsPages.dialog(ui.gbspDialog, gbPagesContext());
      if (kind === 'set') return GBSettings.dialog(ui.gbSetDialog, gbSettingsContext());
      if (kind === 'list') return GBSettings.listDialog(ui.gbListKey, gbSettingsContext());
      return {title: GBSettings.text(i18n.language, 'brightness'), custom: `<div class="gbbright"><label><input type="checkbox" ${GBSettings.value(data.settings, 'autoBrightness') ? 'checked' : ''}> ${safe(t('Automatic brightness'))}</label><input type="range" min="10" max="100" value="${ui.brightnessDraft ?? data.settings.brightness}" aria-label="${safe(GBSettings.text(i18n.language, 'brightness'))}"></div>`, buttons: [{action: 'gbset-brightness-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
    },
    // The inherited ICS connectivity menu and Wi-Fi / Bluetooth dialogs.
    overlay(c) {
      const {data, ui, safe, allWifiNetworks} = shell(c);
      let html = '';
      if (ui.overlay === 'connectivity-menu') {
        const wifi = ui.connectivityMenu === 'wifi';
        const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
        html = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-add" ${enabled ? '' : 'disabled'}>Add network</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
      } else if (ui.overlay === 'wifi-add') {
        html = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
      } else if (ui.overlay === 'bluetooth-pair') {
        const paired = data.settings.pairedDevice === ui.bluetoothTarget;
        html = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
      } else if (ui.overlay === 'bluetooth-rename') {
        html = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Galaxy Nexus')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
      } else if (ui.overlay === 'bluetooth-files') {
        html = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
      } else if (ui.overlay === 'wifi-dialog') {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        const connected = data.settings.wifiNetwork === ui.wifiTarget;
        html = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
      }
      return html;
    },
    // The network screens, the lock setup, then the screen the user came from (the settings stack), the pages' own
    // parents, and the main list at its scroll position.
    back(c) {
      const {ui, render, viewport, lockControls, gbNetContext} = shell(c);
      if (GBNetwork.back(gbNetContext())) return true;
      if(ui.sub==='lock-setup'){lockControls.cancel();if(ui.gbSettingsStack?.length)ui.gbSettingsStack.pop();return true;}
      if(ui.gbSettingsStack)while(ui.gbSettingsStack.length&&ui.gbSettingsStack.at(-1)===ui.sub)ui.gbSettingsStack.pop();
      if(ui.sub&&ui.gbSettingsStack?.length){ui.sub=ui.gbSettingsStack.pop();render();return true;}
      if(['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return true;}
      if (['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; render(); return true; }
      if (['vpn', 'beam'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return true; }
      if (ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return true; }
      if (ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return true; }
      if (ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return true; }
      if (['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return true; }
      if (['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return true; }
      if (ui.sub) { ui.sub = ''; render(); viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return true; }
      return false;
    },
    action(name, el, c) {
      const id = el.dataset.id, action = name, {data, ui, save, render, renderOverlay, renderStatus, toast, overlayRoot, viewport, deviceDate, apps, clearAppData, resetSimulator, storeUninstall, allWifiNetworks, gbNetContext} = shell(c);
      if (action.startsWith('gbnet-') && GBNetwork.handle(action, id, gbNetContext(), button)) return true;
      switch (name) {
        // VoiceSearchPreferences: Personalized recognition asks before it changes.
        case 'gbvs-personal': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = data.settings.vsPersonal ? 'vs-off' : 'vs-on'; renderOverlay(); break;
        case 'gbvs-personal-on': case 'gbvs-personal-off': data.settings.vsPersonal = action === 'gbvs-personal-on'; ui.overlay = ''; save(); renderOverlay(); render(); break;
        case 'gbset-go': if (id === 'brightness') { ui.overlay = 'gb-dialog-brightness'; ui.brightnessDraft = data.settings.brightness; renderOverlay(); break; } (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = id; render(); break;
        case 'gbset-check': if (id === 'usbDebug' && !data.settings.usbDebug) { ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = 'adb'; renderOverlay(); break; } { const current = data.settings[id] ?? GBSettings.DEFAULTS[id] ?? (id === 'patternVisible'); data.settings[id] = !current;
          // DateTimeSettings 2.3: one Automatic box covers the network time and zone; turning it off keeps the current zone.
          if (id === 'autoTime') { data.settings.timeOffset = 0; data.settings.autoZone = !!data.settings.autoTime; if (!data.settings.autoTime) data.settings.timeZone = ICSSystemSettings.zone({settings: {...data.settings, autoZone: true}}); }
          if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.portableHotspot = false; GBNetwork.airplane(gbNetContext()); }
          if (id === 'wifi' && data.settings.wifi) { data.settings.portableHotspot = false; data.settings.gbWifiSaved = false; }
          if (id === 'silent') data.settings.silentMode = data.settings.silent ? (GBSettings.value(data.settings, 'vibrateMode') === 1 || GBSettings.value(data.settings, 'vibrateMode') === 3 ? 'mute' : 'vibrate') : 'off';
          save(); render(); break; }
        case 'gbset-list': ui.overlay = 'gb-dialog-list'; ui.gbListKey = id; renderOverlay(); break;
        case 'gbset-list-pick': { const [key, index] = id.split(':'); data.settings[key] = Number(index); ui.overlay = ''; save(); render(); break; }
        case 'gbset-toast': toast(id); break;
        case 'gbset-dialog': if (id === 'date' || id === 'time') { const now = deviceDate(); ui.gbDtDraft = {y: now.getFullYear(), m: now.getMonth(), d: now.getDate(), h: now.getHours(), mi: now.getMinutes()}; } ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = id; renderOverlay(); break;
        // The pickers wrap like NumberPicker; Set moves the device clock by the difference (data.settings.timeOffset).
        case 'gbset-dt-step': { const [field, delta] = id.split(':'), d = ui.gbDtDraft, step = Number(delta); const range = {m: 12, h: 24, mi: 60}[field]; if (field === 'y') d.y = Math.min(2037, Math.max(1970, d.y + step)); else if (field === 'd') { const days = new Date(d.y, d.m + 1, 0).getDate(); d.d = (d.d - 1 + step + days) % days + 1; } else d[field] = (d[field] + step + range) % range; d.d = Math.min(d.d, new Date(d.y, d.m + 1, 0).getDate()); renderOverlay(); break; }
        case 'gbset-dt-ampm': ui.gbDtDraft.h = (ui.gbDtDraft.h + 12) % 24; renderOverlay(); break;
        case 'gbset-dt-set': { const d = ui.gbDtDraft, now = deviceDate(), target = new Date(d.y, d.m, d.d, d.h, d.mi, ui.gbSetDialog === 'time' ? 0 : now.getSeconds()); data.settings.timeOffset = (Number(data.settings.timeOffset) || 0) + (target - now); ui.overlay = ''; save(); render(); break; }
        case 'gbset-zone': data.settings.timeZone = id; data.settings.autoZone = false; ui.sub = (ui.gbSettingsStack || []).pop() || 'date'; save(); render(); break;
        case 'gbset-zone-sort': ui.gbZoneSort = id; ui.overlay = ''; renderOverlay(); render(); break;
        case 'gbset-ap': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = `ap:${id}`; renderOverlay(); break;
        case 'gbset-wifi-connect': { const network = allWifiNetworks().find(item => item.name === id), password = overlayRoot.querySelector('[data-wifi-password]')?.value || ''; if (network && network.security !== 'Open' && password.length < 8) { toast('Password must have at least 8 characters'); break; } data.settings.wifiNetwork = id; ui.overlay = ''; save(); render(); break; }
        case 'gbset-wifi-forget': data.settings.wifiNetwork = ''; ui.overlay = ''; save(); render(); break;
        case 'gbset-wifi-save': { const ssid = overlayRoot.querySelector('[data-wifi-ssid]')?.value.trim(); if (ssid && !allWifiNetworks().some(item => item.name === ssid)) data.savedWifiNetworks = [...(data.savedWifiNetworks || []), {name: ssid.slice(0, 32), security: 'Open', strength: 2}]; ui.overlay = ''; save(); render(); break; }
        case 'gbset-wifi-scan': ui.overlay = ''; render(); toast('Scanning…'); break;
        case 'gbset-bt-scan': ui.btScanning = true; render(); setTimeout(() => { ui.btScanning = false; ui.btFound = [{name: 'Headset', kind: 'headset_hfp'}, {name: 'Car kit', kind: 'headphones_a2dp'}, {name: "Sam's laptop", kind: 'laptop'}]; if (ui.view === 'settings') render(); }, 1500); break;
        case 'gbset-bt-device': if (data.settings.pairedDevice === id) { toast('Connected'); break; } data.settings.pairedDevice = id; save(); render(); break;
        case 'gbset-bt-name-ok': { const name = overlayRoot.querySelector('[data-bt-name]')?.value.trim(); if (name) data.settings.bluetoothName = name.slice(0, 40); ui.overlay = ''; save(); render(); break; }
        case 'gbset-volume-ok': overlayRoot.querySelectorAll('[data-vol]').forEach(input => { data.settings[input.dataset.vol] = Number(input.value); }); { const same = overlayRoot.querySelector('[data-vol-same]'); if (same) data.settings.notificationSameAsRing = same.checked; } ui.overlay = ''; save(); render(); break;
        case 'gbset-sound-pick': { const at = id.indexOf(':'), kind = id.slice(0, at), name = id.slice(at + 1); data.settings[kind] = name; save(); renderOverlay(); render(); break; }
        case 'gbset-locale': i18n.setLanguage(id); location.reload(); break;
        case 'gbset-adb-ok': data.settings.usbDebug = true; ui.overlay = ''; save(); render(); break;
        case 'gbset-brightness-ok': { const input = overlayRoot.querySelector('.gbbright input[type=range]'); if (input) data.settings.brightness = Number(input.value); const auto = overlayRoot.querySelector('.gbbright input[type=checkbox]'); if (auto) data.settings.autoBrightness = auto.checked; ui.overlay = ''; save(); render(); break; }
        case 'settings-sub': if (ui.view === 'settings') (ui.gbSettingsStack ||= []).push(ui.sub); ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
        case 'gbsp-tab': ui.gbAppsTab = id; render(); break;
        case 'gbacc-background': if ((data.settings.backgroundData ?? true)) { ui.gbspDialog = 'background'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); } else { data.settings.backgroundData = true; save(); render(); } break;
        case 'gbacc-background-off': data.settings.backgroundData = false; save(); ui.overlay = ''; render(); break;
        case 'gbacc-remove': ui.gbspDialog = 'remove'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
        case 'gbacc-remove-ok': data.gbAccountRemoved = true; save(); ui.overlay = ''; ui.sub = 'sync'; ui.gbSettingsStack = (ui.gbSettingsStack || []).filter(page => page !== 'sync'); render(); break;
        case 'gbacc-sync': ui.overlay = ''; ui.gbSyncing = true; render(); clearTimeout(ui.gbSyncTimer); ui.gbSyncTimer = setTimeout(() => { ui.gbSyncing = false; data.gbLastSync = Date.now(); save(); if (ui.view === 'settings') render(); }, 2500); break;
        case 'gbacc-cancel': ui.overlay = ''; ui.gbSyncing = false; clearTimeout(ui.gbSyncTimer); render(); break;
        case 'gbsp-sort': ui.gbAppsSize = id === 'size'; ui.overlay = ''; render(); break;
        // Uninstall on a store app's Application info: UninstallerActivity ("Uninstall application?"), then the list.
        case 'gbsp-uninstall': { const m = StoreHost.module(id); if (!m) break; const T = key => GBSettingsPages.text(i18n.language, key); c.dialog({title: m.title, message: `${T('uninstall_application_question')} ${T('uninstall_application_text')}`, buttons: [{label: T('dlg_ok'), action: () => { storeUninstall(id.slice(6)); save(); ui.sub = (ui.gbSettingsStack || []).pop() || 'apps'; render(); toast(T('uninstall_done')); }}, {label: T('dlg_cancel')}]}); break; }
        case 'gbsp-app': if (!apps.some(app => app[0] === id)) break; (ui.gbSettingsStack ||= []).push(ui.sub); ui.settingsApp = id; ui.sub = 'app-info'; ui.overlay = ''; render(); break;
        case 'gbsp-battery-item': (ui.gbSettingsStack ||= []).push(ui.sub); ui.batteryDetail = id; ui.sub = 'battery-detail'; render(); break;
        case 'gbsp-force-stop': ui.settingsApp = id; ui.gbspDialog = 'force-stop'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
        case 'gbsp-force-stop-ok': ui.recent = ui.recent.filter(app => app !== ui.settingsApp); delete ui.recentState?.[ui.settingsApp]; ui.overlay = ''; render(); break;
        case 'gbsp-clear-data': ui.gbspDialog = 'clear-data'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
        case 'gbsp-clear-data-ok': clearAppData(ui.settingsApp); data.gbClearedApps = [...new Set([...(data.gbClearedApps || []), ui.settingsApp])]; save(); ui.overlay = ''; render(); break;
        case 'gbsp-clear-cache': data.gbClearedApps = [...new Set([...(data.gbClearedApps || []), ui.settingsApp])]; save(); render(); break;
        case 'gbsp-reset-initiate': (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = 'gb-reset-final'; render(); break;
        case 'factory-reset-confirmed': ui.gbSettingsStack = []; resetSimulator(); break;
        case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
        case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
        case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
        case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
        case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
        case 'bluetooth-confirm': data.settings.pairedDevice = data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
        case 'wifi-connect': {
          const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
          if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
          data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true;
          save(); ui.overlay = ''; render(); break;
        }
        case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
        case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
        case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
        case 'about-tap':
          ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
          if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = 'easter'; ui.aboutTapTimes = []; render(); }
          break;
        case 'gb-platlogo': toast('Zombie art by Jack Larson'); break;
        default: return false;
      }
      return true;
    },
    // Add network and Rename phone (the inherited ICS forms).
    submit(form, values, c) {
      const {data, ui, save, render, toast, allWifiNetworks} = shell(c);
      if (form === 'wifi-add') {
        const name = String(values.get('ssid') || '').trim();
        const security = values.get('security');
        if (!name) return true;
        if (security !== 'Open' && String(values.get('password') || '').length < 8) { toast('Password must have at least 8 characters'); return true; }
        data.savedWifiNetworks ||= [];
        if (!allWifiNetworks().some(network => network.name === name)) data.savedWifiNetworks.push({name, security, strength:4});
        data.settings.wifiNetwork = name;
        save(); ui.overlay = ''; render(); return true;
      }
      if (form === 'bluetooth-rename') {
        const name = String(values.get('name') || '').trim();
        if (!name) return true;
        data.settings.bluetoothName = name;
        save(); ui.overlay = ''; render(); return true;
      }
      return false;
    },
    // The inherited data usage cycle and brightness fields, and Factory data reset's "Erase USB storage".
    input(event, c) {
      const {data, ui, save, render, screen} = shell(c);
      if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return true;}
      if (event.target.matches('[data-gbsp-erase]')) { ui.gbspErase = event.target.checked; return true; }
      if (event.target.dataset.field === 'brightness') {
        data.settings.brightness = Number(event.target.value); save();
        const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
        screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
        return true;
      }
      return false;
    }
  });
})();
