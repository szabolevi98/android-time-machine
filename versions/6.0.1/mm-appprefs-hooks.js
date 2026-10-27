/* Android 6.0.1: what each app's code does to its preference screens (mm-appprefs.js) on the 5X of the simulator:
   rows its code removes for this phone (no CDMA, no SD card, no Wear device, no IMS video calling), entries it fills
   in (Camera's photo and video sizes for the 5X's IMX377 rear and 5 MP front cameras: 4032 x 3024 and 2592 x 1944),
   the empty PreferenceScreens it fills from another file, and rows that open other screens. */
(() => {
  'use strict';
  const P = () => MM.text('appprefs');
  const H = MM.appPrefsHooks;
  const set = (c, id, key, v) => { ((c.data.appPrefs ||= {})[id] ||= {})[key] = v; c.save(); c.render(); };

  // GoogleCamera 3.1: the sizes CameraSettingsActivity lists (large = the sensor's full 4:3, medium = 16:9 of it, small
  // = 4:3 at about a quarter), formatted with setting_summary_aspect_ratio_and_megapixels; the video qualities the
  // camera's CamcorderProfile has (UHD 4K on the rear only).
  const G = 'GoogleCamera/';
  const SIZES = {back: [[4, 3, 12.2], [16, 9, 9.2], [4, 3, 3.0]], front: [[4, 3, 5.0], [16, 9, 3.7], [4, 3, 1.2]]};
  const VIDEO = {back: ['2160p', '1080p', '720p'], front: ['1080p', '720p', '480p']};
  const sizeLabel = ([w, h, mp]) => P().fmt(G + 'setting_summary_aspect_ratio_and_megapixels', null, w, h, mp.toFixed(1));
  const camList = key => key.includes('picturesize') ? SIZES[key.includes('front') ? 'front' : 'back'].map(sizeLabel) : VIDEO[key.includes('front') ? 'front' : 'back'].map(q => P().t(`${G}pref_video_quality_entry_${q}`));
  H.camera = {
    hidden: ['pref_category_smartburst'],
    summary(c, key) { if (/picturesize|video_quality/.test(key)) { const v = MM.appPref(c, 'camera', key, 'large'); return camList(key)[['large', 'medium', 'small'].indexOf(v)] || camList(key)[0]; } },
    click(c, key, n) {
      if (/picturesize|video_quality/.test(key)) {
        const cur = ['large', 'medium', 'small'].indexOf(MM.appPref(c, 'camera', key, 'large'));
        c.dialog({title: MM.appPrefStr(n.title), items: camList(key).map((l, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${i === cur ? ' on' : ''}"></i><span>${c.safe(l)}</span></span>`})), onItem: i => set(c, 'camera', key, ['large', 'medium', 'small'][i])});
        return true;
      }
      if (key === 'pref_launch_help') { c.open('help', 'camera'); return true; }
      return false;
    }
  };

  // Gmail: General settings, then the account (gmail_account_preferences): Inbox categories, Inbox sound & vibrate
  // and the label settings are fragments of their own.
  H.gmail = {
    // MailPreferenceActivity adds the account's header after General settings.
    after: (c, xml) => xml === 'preference_headers' ? `<button type="button" class="mmst-pref" data-action="mmpf-goto" data-xml="gmail_account_preferences" data-title="${c.safe(MM.account.email)}"><span class="mmst-texts"><span class="mmst-title">${c.safe(MM.account.email)}</span></span></button>` : '',
    fragments: {GeneralPrefsFragment: 'general_preferences', InboxSectionsPreferenceFragment: 'inbox_section_preferences'},
    screens: {'inbox-settings': 'label_preferences'},
    hidden: ['vacation-responder', 'manage-labels', 'number-picker'],
    summary(c, key) { if (key === 'signature') return MM.appPref(c, 'gmail', key, '') || P().t('PrebuiltGmail/preferences_signature_summary_not_set'); }
  };

  // Messenger (Bugle 1.5): the default SMS row it shows when it is the default app; per-subscription settings under
  // Advanced; the debug category only in debug builds.
  H.messenger = {
    hidden: ['sms_disabled', 'debug_category', 'buglesub_wireless_alerts_key', 'sms_apns_key'],
    screens: {advanced_prefs: 'preferences_per_subscription'},
    summary(c, key) {
      if (key === 'sms_enabled') return MM.appLabel(c, 'messenger');
      if (key === 'notification_sound') { const v = MM.appPref(c, 'messenger', key); return v === '' ? MM.text('framework').t('ringtone_silent') : v || MM.settingsRingtones?.notification.default || ''; }
      if (key === 'buglesub_mms_phone_number') return '';
    },
    click(c, key) {
      if (key === 'sms_enabled') { c.open('settings', 'xml:default_apps'); return true; }
      if (key === 'notification_sound') { MM.ringtonePicker?.(c, {kind: 'notification', current: MM.appPref(c, 'messenger', key) ?? MM.settingsRingtones?.notification.default, onPick: (c, v) => set(c, 'messenger', key, v)}); return true; }
      return false;
    }
  };

  // Contacts and the Phone app's display options: Sort by First name / Last name, Name format First name first / Last
  // name first (ContactsPreferences, the entries the preference classes set).
  const order = id => { const A = id === 'dialer' ? 'GoogleDialer/' : 'GoogleContacts/'; return {
    get(c, key) { if (key === 'sortOrder' || key === 'displayOrder') return MM.appPref(c, id, key, '1'); },
    summary(c, key) {
      const t = P();
      if (key === 'sortOrder') return t.t(A + (MM.appPref(c, id, key, '1') === '1' ? 'display_options_sort_by_given_name' : 'display_options_sort_by_family_name'));
      if (key === 'displayOrder') return t.t(A + (MM.appPref(c, id, key, '1') === '1' ? 'display_options_view_given_name_first' : 'display_options_view_family_name_first'));
    },
    click(c, key, n) {
      if (key !== 'sortOrder' && key !== 'displayOrder') return false;
      const t = P(), keys = (key === 'sortOrder' ? ['display_options_sort_by_given_name', 'display_options_sort_by_family_name'] : ['display_options_view_given_name_first', 'display_options_view_family_name_first']).map(k => A + k);
      const cur = MM.appPref(c, id, key, '1');
      c.dialog({title: MM.appPrefStr(n.title), items: keys.map((k, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${String(i + 1) === cur ? ' on' : ''}"></i><span>${c.safe(t.t(k))}</span></span>`})), onItem: i => set(c, id, key, String(i + 1))});
      return true;
    }
  }; };
  /* The Phone app's settings (DialerSettingsActivity.onBuildHeaders, no preference-headers file): Display options,
     Sounds and vibration, Quick responses (Telecom's RespondViaSmsSettings), Calls (TeleService's call settings),
     Nearby places; Accessibility only with a TTY-capable phone. */
  if (MM.appPrefsXml?.dialer) MM.appPrefsXml.dialer.xml.dialer_settings = {t: 'preference-headers', c: [
    {t: 'header', key: 'display', title: 'string/GoogleDialer/display_options_title', fragment: 'display_options_settings'},
    {t: 'header', key: 'sounds', title: 'string/GoogleDialer/sounds_and_vibration_title', fragment: 'sound_settings'},
    {t: 'header', key: 'quick', title: 'string/GoogleDialer/respond_via_sms_setting_title'},
    {t: 'header', key: 'calls', title: 'string/GoogleDialer/call_settings_label'},
    {t: 'header', key: 'nearby', title: 'string/GoogleDialer/local_search_setting_title', fragment: 'nearby_places_settings'}]};
  H.quickresponses = {color: ['#0288d1', '#0277bd']};
  H.contacts = {fragments: {DisplayOptionsPreferenceFragment: 'preference_display_options'}, ...order('contacts')};
  H.dialer = {...order('dialer'),
    fragment: (c, name) => name,
    hidden: ['personalization_google_account', 'location_permission_key', 'instruction_text_key', 'use_personalization'],
    summary(c, key) {
      if (key === 'button_ringtone_key') { const s = c.data.settings.tones?.ringtone; return s === '' ? MM.text('framework').t('ringtone_silent') : s || MM.settingsRingtones?.ringtone.default || ''; }
      return order('dialer').summary(c, key);
    },
    get(c, key) { if (key === 'button_vibrate_on_ring') return !!c.data.settings.vibrateWhenRinging; return order('dialer').get(c, key); },
    set(c, key, v) { if (key === 'button_vibrate_on_ring') { c.data.settings.vibrateWhenRinging = v; return true; } return false; },
    click(c, key, n) {
      if (key === 'quick') { MM.openPrefs(c, 'quickresponses', 'respond_via_sms_settings'); return true; }
      if (key === 'calls') { MM.openPrefs(c, 'calls', 'call_feature_setting'); return true; }
      if (key === 'location_settings_key') { c.open('settings', 'xml:location_settings'); return true; }
      if (key === 'button_ringtone_key') { MM.ringtonePicker?.(c, {kind: 'ringtone', current: c.data.settings.tones?.ringtone ?? MM.settingsRingtones?.ringtone.default, onPick: (c, v) => { c.data.settings.tones = {...(c.data.settings.tones || {}), ringtone: v}; c.save(); c.render(); }}); return true; }
      return order('dialer').click(c, key, n);
    }
  };

  // TeleService's call settings for a GSM phone with one SIM and no IMS: Voicemail, Fixed Dialing Numbers, GSM call
  // settings (Call forwarding, Additional settings); the CDMA, Wi-Fi calling, video calling and SIP rows go.
  const T = 'TeleService/';
  H.calls = {
    color: ['#0288d1', '#0277bd'],
    hidden: ['button_cdma_more_expand_key', 'button_wifi_calling_settings_key', 'button_enable_video_calling', 'phone_account_settings_preference_screen', 'button_auto_retry_key', 'voicemail_visual_voicemail_key', 'fdn_list_pref_screen_key'],
    screens: {button_voicemail_category_key: 'voicemail_settings', button_fdn_key: 'fdn_setting', button_gsm_more_expand_key: 'gsm_umts_call_options', call_forwarding_key: 'callforward_options', additional_gsm_call_settings_key: 'gsm_umts_additional_options'},
    summary(c, key) {
      const m = /^button_(cfu|cfb|cfnry|cfnrc)_key$/.exec(key); if (m) return P().t(`${T}sum_${m[1]}_disabled`);
      if (key === 'button_fdn_enable_key') return P().t(T + 'fdn_disabled');
      if (key === 'button_voicemail_provider_key') return MM.text('shade').t('carrier');
    },
    get(c, key) { if (key === 'button_cw_key') return MM.appPref(c, 'calls', key, true); }
  };
  const NETWORKS = ['Telekom', 'Telenor', 'Vodafone'];   // the radio's network scan around the simulated phone (data, not texts)
  H.network = {
    color: ['#0288d1', '#0277bd'],
    hidden: ['cdma_lte_data_service_key', 'preferred_network_mode_key', 'carrier_settings_key'],
    append: {network_setting: ['gsm_umts_options']},
    screens: {button_carrier_sel_key: 'carrier_select'},
    get(c, key) { if (key === 'enabled_networks_key') return MM.appPref(c, 'network', key, '10'); if (key === 'button_auto_select_key') return true; },
    // MobileNetworkSettings.UpdateEnabledNetworksValueAndSummary: the chosen entry as the summary.
    summary(c, key, n) {
      if (key === 'enabled_networks_key') { const v = MM.appPref(c, 'network', key, '10'); return MM.appPrefArr(n.entries)[MM.appPrefArr(n.entryValues).indexOf(v)] || ''; }
      if (key === 'button_auto_select_key' && MM.appPref(c, 'network', 'manual')) return MM.appPref(c, 'network', 'manual');
    },
    click(c, key, n) {
      // NetworkSetting (carrier_select.xml): Search networks waits on load_networks_progress, then lists what the
      // radio found; a pick or Choose automatically registers (register_automatically) and says registration_done.
      const register = (c, manual) => { set(c, 'network', 'manual', manual); c.dialog({progress: P().t(T + 'register_automatically'), buttons: [], cancelable: false});
        setTimeout(() => { if (c.ui.overlay === 'dialog') c.closeOverlay(); c.toast(P().t(T + 'registration_done')); c.render(); }, 1200); };
      if (key === 'button_srch_netwrks_key') {
        c.dialog({progress: P().t(T + 'load_networks_progress'), buttons: [], cancelable: false});
        setTimeout(() => {
          if (c.ui.overlay === 'dialog') c.closeOverlay();
          const cur = MM.appPref(c, 'network', 'manual');
          c.dialog({title: MM.appPrefStr(n.title), items: NETWORKS.map(x => ({html: `<span class="mmst-choice"><i class="mmw-radio${x === cur ? ' on' : ''}"></i><span>${c.safe(x)}</span></span>`})),
            buttons: [{label: MM.text('framework').t('cancel')}], onItem: i => register(c, NETWORKS[i])});
        }, 1500);
        return true;
      }
      if (key === 'button_auto_select_key') { register(c, undefined); return true; }
      if (key === 'button_apn_key') { c.open('settings', 'xml:apn_settings'); return true; }
      if (key === 'button_roaming_key' && !MM.appPref(c, 'network', key, false)) { c.dialog({title: P().t(T + 'roaming_alert_title'), message: P().t(T + 'roaming_warning'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => set(c, 'network', key, true)}]}); return true; }
      return false;
    }
  };
  H.cellbroadcast = {hidden: ['category_etws_settings', 'category_brazil_settings', 'category_dev_settings']};

  // Google Keyboard: its settings' fragments; Theme and Custom input styles are the keyboard's own pickers.
  H.keyboard = {
    hidden: ['screen_debug', 'pref_show_setup_wizard_icon', 'custom_input_styles', 'screen_theme', 'pref_enable_metrics_logging', 'pref_key_preview_popup_dismiss_delay', 'pref_vibration_duration_settings', 'pref_keypress_sound_volume', 'pref_key_longpress_timeout'],
    fragments: {PreferencesSettingsFragment: 'prefs_screen_preferences', AccountsSettingsFragment: 'prefs_screen_accounts', AppearanceSettingsFragment: 'prefs_screen_appearance', GestureSettingsFragment: 'prefs_screen_gesture', CorrectionSettingsFragment: 'prefs_screen_correction', AdvancedSettingsFragment: 'prefs_screen_advanced', ThemeSettingsFragment: 'prefs_screen_theme'},
    summary(c, key) { if (key === 'account_switcher') return MM.account.email; },
    click(c, key) {
      if (key === 'edit_personal_dictionary') { c.open('settings', 'user-dictionary'); return true; }
      return false;
    }
  };

  // The Google app's Voice settings and its other pages (Accounts & privacy, Now cards, About).
  H.voice = {
    // No trained voice model and no always-on hotword hardware path on this image's setup; the Now stream toggle has no
    // title (a dogfood row).
    hidden: ['npStreamPreference', 'speaker_id_retrain_voice_model', 'speaker_id_delete_voice_model', 'pref_category_voice_model', 'hotword_from_lock_screen', 'hotword_from_lock_screen_2', 'alwaysOnHotword'],
    fragments: {HotwordSettingsFragment: 'hotword_settings', HandsFreeSettingsFragment: 'hands_free_settings', LegalFragment: 'legal_settings', TrafficCardSettingsFragment: 'traffic_card_settings'},
    /* SearchableItemsFragment fills preferences_searchable_items with a check box per corpus: the Google app's own (Apps,
       Contacts) and the installed apps' searchables with includeInGlobalSearch (Chrome, Drive, Play Movies, Play Music),
       each with its searchSettingsDescription. */
    top(c, xml) {
      if (xml !== 'preferences_searchable_items') return '';
      const p = P(), V = 'Velvet/', on = k => MM.appPref(c, 'voice', `corpus_${k}`, true);
      const rows = [['apps', p.t(V + 'icing_apps_corpus_label'), p.t(V + 'icing_apps_corpus_description')], ['chrome', MM.appLabel(c, 'chrome'), p.t('Chrome/content_provider_search_description')],
        ['contacts', p.t(V + 'icing_contacts_corpus_label'), p.t('GoogleContacts/search_settings_description')], ['drive', MM.appLabel(c, 'drive'), p.t('Drive/search_description')],
        ['movies', MM.appLabel(c, 'play-movies'), p.t('Videos/global_search_settings_description')], ['music', MM.appLabel(c, 'play-music'), p.t('Music2/search_settings_description')]];
      return rows.map(([k, title, sum]) => `<button type="button" class="mmst-pref" data-action="mmvc-corpus" data-k="${k}"><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span><span class="mmst-summary">${c.safe(sum)}</span></span><span class="mmst-widget"><i class="mmst-check${on(k) ? ' on' : ''}"></i></span></button>`).join('');
    },
    click(c, key, n) {
      if (key === 'relationships') { c.open('voice-nicknames'); return true; }
      if (key === 'downloadLanguagePacks') { c.open('voice-langpacks'); return true; }
      if (key === 'google_account_history') { c.open('chrome', 'url:https://myaccount.google.com/privacy#history'); return true; }
      // NowCardsSettingsFragment: the card history page, https://%2$s/history/now (the Google domain).
      if (key === 'manageCardHistoryPreference') { c.open('chrome', 'url:https://www.google.com/history/now'); return true; }
      // LanguagePreference: the voice locales (array languageCodes) in a single choice list, named in the device's language.
      if (key === 'language') {
        const codes = MM.velvetLanguageCodes || [], cur = MM.appPref(c, 'voice', 'language', '') || codes.find(x => x.toLowerCase() === c.locale().toLowerCase()) || 'en-US';
        const name = code => { try { return new Intl.DisplayNames([c.locale()], {type: 'language'}).of(code); } catch { return code; } };
        c.dialog({title: MM.appPrefStr(n.title), items: codes.map(code => ({html: `<span class="mmst-choice"><i class="mmw-radio${code === cur ? ' on' : ''}"></i><span>${c.safe(name(code))}</span></span>`})), buttons: [{label: MM.text('framework').t('cancel')}], onItem: i => set(c, 'voice', 'language', codes[i])});
        return true;
      }
      if (key === 'deleteCardPreferencesPreference') { const p = P(); c.dialog({title: p.t('Velvet/delete_card_preferences'), message: p.t('Velvet/delete_card_preferences_summary'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok')}]}); return true; }
      if (key === 'notificationOverride') { set(c, 'voice', key, !MM.appPref(c, 'voice', key, true)); return true; }
      if (key === 'notificationSoundPreference') { MM.ringtonePicker?.(c, {kind: 'notification', current: MM.appPref(c, 'voice', key, '') || 'default', onPick: (c, v) => set(c, 'voice', key, v === 'default' ? '' : v)}); return true; }
      if (key === 'google_account') { c.dialog({title: P().t('Velvet/select_google_account'), items: [{html: `<span class="mmst-choice"><i class="mmw-radio on"></i><span>${c.safe(MM.account.email)}</span></span>`}]}); return true; }
      return false;
    },
    enabled: (c, key) => key === 'manageCardHistoryPreference' ? true : undefined,
    summary(c, key) {
      if (key === 'language') { const code = MM.appPref(c, 'voice', 'language', ''); return new Intl.DisplayNames([c.locale()], {type: 'language'}).of(code || c.locale()) || c.locale(); }
      if (key === 'notificationOverride') return MM.text('settings').t(MM.appPref(c, 'voice', key, true) ? 'switch_on_text' : 'switch_off_text');
      if (key === 'notificationSoundPreference') return MM.appPref(c, 'voice', key, '') || MM.settingsRingtones?.notification.default || '';
      if (key === 'google_account') return MM.account.email;
      if (key === 'google_account_history') return P().t('Velvet/google_account_history_summary');
      // NowCardsSettingsFragment.updateState: with an account, manage_card_history_summary names it and the row is enabled.
      if (key === 'manageCardHistoryPreference') return AndroidStrings.format(P().t('Velvet/manage_card_history_summary'), MM.account.email);
      if (key === 'about_app_version') return MM.appsData?.search?.version || '';
    },
    get(c, key) { if (key === 'enableScreenAssistPreference') return !!c.data.nowOnTap; if (key === 'showCardsPreference') return c.data.now === 'on'; },
    set(c, key, v) { if (key === 'enableScreenAssistPreference') { c.data.nowOnTap = v; return true; } if (key === 'showCardsPreference') { c.data.now = v ? 'on' : 'off'; return true; } return false; }
  };

  // Play Music, Play Movies & TV, YouTube, Maps, Play Store, Chrome: their settings as the 5X shows them signed in to
  // the demo account (no Wear device, no SD card, no developer rows of release builds).
  H.music = {hidden: ['account_type_settings_key', 'manage_nautilus_settings_key', 'gift_subscription_setting_key', 'settings_catergory_wear_key', 'settings_catergory_developer_key', 'download_location_key', 'equalizer_settings_key'],
    summary(c, key) { if (key === 'account_settings_key') return MM.account.email; }};
  H.movies = {hidden: ['download_storage', 'connected_accounts_category', 'dma_unlink_account', 'gservices_id', 'device_summary', 'surround_sound_category', 'enable_surround_sound', 'surround_sound_demo', 'captioning_settings'],
    summary(c, key) { if (key === 'version') return MM.appsData?.['play-movies']?.version || ''; },
    click(c, key) { if (key === 'captioning_system_settings') { c.open('settings', 'xml:captioning_settings'); return true; } return false; }};
  H.youtube = {fragments: {'SettingsActivity$GeneralPrefsFragment': 'general_prefs', 'SettingsActivity$PrivacyPrefsFragment': 'privacy_prefs', 'SettingsActivity$OfflinePrefsFragment': 'offline_prefs', 'SettingsActivity$SubtitlesPrefsFragment': 'subtitles_prefs', 'SettingsActivity$AboutPrefsFragment': 'about_prefs'},
    hide: (c, key, n) => n.t === 'header' && (!n.title || /SendToTv|Developer|Dogfood|Notification/.test(n.fragment || '')),
    hidden: ['offline_insert_sd_card', 'offline_use_sd_card', 'offline_category_sdcard_storage', 'offline_category_primary_storage', 'nerd_stats_enabled', 'country', 'offline_quality'],
    summary(c, key) { if (key === 'version') return MM.appsData?.youtube?.version || ''; },
    click(c, key) { if (key === 'help') { c.open('help', 'youtube'); return true; } if (key === 'feedback') { c.open('feedback', 'youtube'); return true; } return false; }};
  H.maps = {color: ['#ffffff', '#757575'], hidden: ['sign_in_out', 'shake_to_send_feedback_default_off', 'edit_home_work', 'maps_history', 'notifications', 'navigation_settings', 'improve_location'],
    click(c, key) { if (key === 'location_reporting') { c.open('settings', 'xml:location_settings'); return true; } return false; }};
  H.play = {hidden: ['fingerprint-auth', 'receive-emails'],
    summary(c, key) { if (key === 'build-version') return MM.appsData?.['play-store']?.version || ''; }};
  H.chrome = {color: ['#4285f4', '#3367d6'],
    fragments: {PrivacyPreferences: 'privacy_preferences', AccessibilityPreferences: 'accessibility_preferences', ContentPreferences: 'content_preferences', AutofillPreferences: 'autofill_preferences', BandwidthReductionPreferences: 'bandwidth_reduction_preferences_off', AboutChromePreferences: 'about_chrome_preferences', DocumentModePreference: 'document_mode_preferences', TranslatePreferences: 'translate_preferences', DoNotTrackPreference: 'do_not_track_preferences', UsageAndCrashReportsPreferenceFragment: 'usage_and_crash_reports_preferences', ContextualSearchPreferenceFragment: 'contextual_search_preferences'},
    hidden: ['sign_in', 'saved_passwords', 'homepage', 'network_predictions_no_cellular', 'crash_dump_upload_no_cellular', 'crash_dump_upload', 'data_reduction_experiment_text', 'data_reduction_experiment_link', 'contextual_search', 'autofill_profiles', 'autofill_credit_cards',
      'website_settings', 'cookies', 'device_location', 'camera', 'microphone', 'push_notifications', 'images', 'javascript', 'popups', 'fullscreen', 'protected_content', 'use_storage', 'clear_browsing_data', 'text_scale']};
  H.drive = {color: ['#4285f4', '#3367d6']};
  // Smart Lock (GoogleTrustAgentPersonalUnlockingSettings): in Settings' colours; nothing trusted yet; Trusted voice
  // follows the Google app's "Ok Google" detection (off), On-body detection is off.
  H.smartlock = {color: ['#263238', '#21272b'],
    screens: {auth_trust_agent_pref_trusted_devices_key: 'trusted_devices_preferences', auth_trust_agent_pref_trusted_places_key: 'trusted_places_preferences', auth_trust_agent_pref_activity_recognition_unlock_key: 'on_body_detection_preferences'},
    hidden: ['auth_trust_agent_pref_trusted_places_add_trusted_place_key', 'auth_trust_agent_pref_face_unlock_key', 'auth_trust_agent_pref_voice_unlock_key']};
})();
