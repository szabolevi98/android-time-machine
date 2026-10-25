/* Android 2.3.6 application preference screens on the GB preference rows (gbset-*): Browser's BrowserPreferencesPage
   (browser_preferences.xml), Calendar's CalendarPreferenceActivity (preferences.xml), Clock's SettingsActivity (settings.xml) and Email's AccountSettings
   (account_settings_preferences.xml). Values live in data.appPrefs[app][key]; a list stores the entry index. Summaries
   follow the activities: Browser shows the text size, zoom and encoding entries and the home page, Calendar the home
   time zone and the version, Email the description, name, signature and check frequency.
   Google Mail 2.3.5.1's Settings: preferences_root.xml (General preferences, the account, Add account), the account's
   preferences.xml, LabelsSynchronizationSettings (Amount of mail to sync and each label's Sync all / Sync last N days /
   Sync none) and LabelsNotificationSettings (each synced label's notifications); an item with `open` shows another
   screen, a `multi` item is a MultiListPreference (Confirm actions).
   Email's Incoming / Outgoing settings are AccountSetupIncoming / AccountSetupOutgoing in edit mode
   (account_setup_incoming.xml / account_setup_outgoing.xml for the IMAP account): the fields, the Security type
   spinner, IMAP path prefix and Require sign-in, Next on the bottom bar. Next is enabled by validateFields (the user
   name and password, a server name, a port) and a new security type sets its port (updatePortFromSecurityType). The
   image then checks the server (AccountSetupCheckSettings); offline nothing is checked and the settings are kept on
   the phone, without the password, which is never stored (a set password shows as a mask).
   Google Maps 5.4: Navigation's Settings (da_preferences.xml: RmiPreference, a CheckBoxPreference, "1-click report a
   problem"), Cache settings (cache_settings_preference.xml: the check box cache_settings_prefetch_over_mobile_networks
   and cache_settings_clear_cache, which empties the cache at once and has nothing to clear until the map is shown again)
   and Labs (list_item_lab_action.xml: the lab's picture, lab_*, 7 dip from the text, with its check). The Labs list and
   the cache rows' texts came from Google's server and the downloaded language pack, so they are the simulator's own; the
   labs are the ones the image has pictures for and the simulator draws: Scale Bar, Measure and Bubble Buttons.
   Car Home 2.2.1.2's Settings (CarHomeGoogle.apk res/xml/settings.xml): Always show disclaimer, Hide Status bar,
   Colorize icons, Wallpaper, Bluetooth starts Car Home (bt_launch_settings.xml: the system's Bluetooth, the disconnect
   Timeout, and no paired device: bt_launch_settings_hint), Reset to defaults and Android settings; rows with an `act`
   are Car Home's own dialogs (gb-extra-apps.js). The Clock's Dock settings is Settings' DockSettings (dock_settings.xml):
   Audio with "Phone not docked" (no dock event: a touch gives "Dock not found") and Dock insertion sound. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (set, lang, key) => AndroidStrings.resources(() => window.GBStrings?.[set]).t(key, lang);
  const A = (set, lang, key) => AndroidStrings.resources(() => window.GBStrings?.[set]).array(key, lang);
  const cat = title => ({kind: 'category', title});
  const check = (key, title, summary, def = true, extra = {}) => ({kind: 'check', key, title, summary, def, ...extra});
  const list = (key, title, options, def, extra = {}) => ({kind: 'list', key, title, options, def, ...extra});
  const action = (key, title, summary, extra = {}) => ({kind: 'action', key, title, summary, ...extra});
  const multi = (key, title, summary, options, extra = {}) => ({kind: 'multi', key, title, summary, options, def: [], ...extra});
  const SEARCH_ENGINES = ['Google', 'Yahoo!', 'Bing'];
  // Google Mail's labels (gb-gmail.js) and their default sync: All Mail, Chats, Spam and Trash are not synced.
  const GMAIL_LABELS = ['Priority Inbox', 'Inbox', 'Starred', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All Mail', 'Spam', 'Trash', 'Friends', 'Travel', 'Work'];
  const gmailSyncDefault = label => ['All Mail', 'Chats', 'Spam', 'Trash'].includes(label) ? 2 : 1;
  const gmailLabel = (lang, label) => window.GBGmail?.labelName?.(lang, label) || label;
  const TZ_DEFAULT = 'America/Los_Angeles';
  const SCREENS = {
    browser(ctx) {
      const T = key => S('browser', ctx.lang, key), v = ctx.values, size = A('browser', ctx.lang, 'pref_text_size_choices'), zoom = A('browser', ctx.lang, 'pref_default_zoom_choices'), enc = A('browser', ctx.lang, 'pref_default_text_encoding_choices');
      const yesno = (key, base) => action(key, T(base), T(base + '_summary'), {confirm: {title: T('clear'), message: T(base + '_dlg')}});
      return {set: 'browser', title: T('menu_preferences'), items: [
        cat(T('pref_content_title')),
        list('text_size', T('pref_text_size'), size, 2, {dialogTitle: T('pref_text_size_dialogtitle'), showValue: true}),
        list('default_zoom', T('pref_default_zoom'), zoom, 1, {dialogTitle: T('pref_default_zoom_dialogtitle'), showValue: true}),
        check('load_page', T('pref_content_load_page'), T('pref_content_load_page_summary')),
        list('default_text_encoding', T('pref_default_text_encoding'), enc, 0, {dialogTitle: T('pref_default_text_encoding_dialogtitle'), showValue: true}),
        check('block_popup_windows', T('pref_content_block_popups')),
        check('load_images', T('pref_content_load_images'), T('pref_content_load_images_summary')),
        check('autofit_pages', T('pref_content_autofit'), T('pref_content_autofit_summary')),
        check('landscape_only', T('pref_content_landscape_only'), T('pref_content_landscape_only_summary'), false),
        check('enable_javascript', T('pref_content_javascript')),
        list('plugin_state', T('pref_content_plugins'), A('browser', ctx.lang, 'pref_content_plugins_choices'), 0, {dialogTitle: T('pref_content_plugins')}),
        check('open_in_background', T('pref_content_open_in_background'), T('pref_content_open_in_background_summary'), false),
        action('homepage', T('pref_content_homepage'), v.homepage ?? ctx.homepage, {edit: {title: T('pref_content_homepage'), value: v.homepage ?? ctx.homepage}}),
        cat(T('pref_privacy_title')),
        yesno('privacy_clear_cache', 'pref_privacy_clear_cache'),
        yesno('privacy_clear_history', 'pref_privacy_clear_history'),
        check('accept_cookies', T('pref_security_accept_cookies'), T('pref_security_accept_cookies_summary')),
        yesno('privacy_clear_cookies', 'pref_privacy_clear_cookies'),
        check('save_formdata', T('pref_security_save_form_data'), T('pref_security_save_form_data_summary')),
        yesno('privacy_clear_form_data', 'pref_privacy_clear_form_data'),
        check('enable_geolocation', T('pref_privacy_enable_geolocation'), T('pref_privacy_enable_geolocation_summary')),
        {...yesno('privacy_clear_geolocation_access', 'pref_privacy_clear_geolocation_access'), dependency: 'enable_geolocation'},
        cat(T('pref_security_title')),
        check('remember_passwords', T('pref_security_remember_passwords'), T('pref_security_remember_passwords_summary')),
        yesno('privacy_clear_passwords', 'pref_privacy_clear_passwords'),
        check('show_security_warnings', T('pref_security_show_security_warning'), T('pref_security_show_security_warning_summary')),
        cat(T('pref_extras_title')),
        list('search_engine', T('pref_content_search_engine'), SEARCH_ENGINES, 0, {dialogTitle: T('pref_content_search_engine'), summary: T('pref_content_search_engine_summary')}),
        // BrowserPreferencesPage disables Website settings while no site has stored data.
        action('website_settings', T('pref_extras_website_settings'), T('pref_extras_website_settings_summary'), {disabled: true}),
        action('reset_default_preferences', T('pref_extras_reset_default'), T('pref_extras_reset_default_summary'), {confirm: {title: T('pref_extras_reset_default_dlg_title'), message: T('pref_extras_reset_default_dlg')}})
      ]};
    },
    calendar(ctx) {
      const T = key => S('calendar', ctx.lang, key), v = ctx.values, labels = A('calendar', ctx.lang, 'timezone_labels'), values = A('calendar', ctx.lang, 'timezone_values');
      return {set: 'calendar', title: T('preferences_title'), items: [
        cat(T('preferences_general_title')),
        check('preferences_hide_declined', T('preferences_hide_declined_title'), '', false),
        check('preferences_home_tz_enabled', T('preferences_use_home_tz_title'), T('preferences_use_home_tz_descrip'), false),
        list('preferences_home_tz', T('preferences_home_tz_title'), labels, Math.max(0, values.indexOf(TZ_DEFAULT)), {dialogTitle: T('preferences_home_tz_title'), showValue: true, dependency: 'preferences_home_tz_enabled'}),
        cat(T('preferences_alerts_title')),
        list('preferences_alerts_type', T('preferences_alerts_type_title'), A('calendar', ctx.lang, 'preferences_alert_type_labels'), 1, {dialogTitle: T('preferences_alerts_type_dialog')}),
        action('preferences_alerts_ringtone', T('preferences_alerts_ringtone_title'), '', {ringtone: true}),
        list('preferences_alerts_vibrateWhen', T('preferences_alerts_vibrateWhen_title'), A('calendar', ctx.lang, 'prefEntries_alerts_vibrateWhen'), 2, {dialogTitle: T('prefDialogTitle_vibrateWhen'), summary: T('preferences_alerts_vibrateWhen_summary')}),
        list('preferences_default_reminder', T('preferences_default_reminder_title'), A('calendar', ctx.lang, 'preferences_default_reminder_labels'), 3, {dialogTitle: T('preferences_default_reminder_dialog')}),
        cat(T('preferences_about_title')),
        action('build_version', T('preferences_build_version'), '2.3.6', {info: true})
      ]};
    },
    // Clock's SettingsActivity (settings.xml): Alarm in silent mode, the alarm VolumePreference, Snooze duration (its
    // entry as the summary) and the side volume buttons during an alarm (None / Snooze / Dismiss, Dismiss by default).
    clock(ctx) {
      const T = key => S('deskclock', ctx.lang, key);
      return {set: 'deskclock', title: T('settings'), items: [
        check('alarm_in_silent_mode', T('alarm_in_silent_mode_title'), T('alarm_in_silent_mode_summary')),
        action('alarm_volume', T('alarm_volume_title'), T('alarm_volume_summary'), {volume: {key: 'alarmVolume', fallback: 80}}),
        list('snooze_duration', T('snooze_duration_title'), A('deskclock', ctx.lang, 'snooze_duration_entries'), 1, {dialogTitle: T('snooze_duration_title'), showValue: true}),
        list('volume_button_setting', T('volume_button_setting_title'), A('deskclock', ctx.lang, 'volume_button_setting_entries'), 2, {dialogTitle: T('volume_button_dialog_title'), summary: T('volume_button_setting_summary')})
      ]};
    },
    gmail(ctx) {
      const T = key => S('gmail', ctx.lang, key);
      return {set: 'gmail', title: T('activity_preferences'), items: [
        action('general', T('global_preferences_title'), '', {open: 'gmail-general'}),
        cat(T('activity_account_preferences')),
        action('account', ctx.gmailAccount, '', {open: 'gmail-account'}),
        action('add-account', T('add_account'), '', {toast: true})
      ]};
    },
    'gmail-general'(ctx) {
      const T = key => S('gmail', ctx.lang, key);
      return {set: 'gmail', title: T('global_preferences_title'), items: [
        list('snap-headers', T('preferences_disable_snap_headers_title'), A('gmail', ctx.lang, 'prefEntries_snapHeader'), 2, {dialogTitle: T('preferences_disable_snap_headers_title'), showValue: true}),
        action('clear-search-history', T('clear_history_title'), T('clear_history_summary'), {done: true}),
        action('clear-display-images-whitelist', T('clear_display_images_whitelist_title'), T('clear_display_images_whitelist_summary'), {done: true})
      ]};
    },
    'gmail-account'(ctx) {
      const T = key => S('gmail', ctx.lang, key), v = ctx.values;
      return {set: 'gmail', title: ctx.gmailAccount, items: [
        cat(T('preferences_title')),
        check('priority-inbox', T('preferences_priority_inbox'), T('preferences_priority_inbox_summary'), false),
        action('signature', T('preferences_signature_title'), v.signature || T('preferences_signature_summary'), {edit: {title: T('preferences_signature_dialog_title'), value: v.signature || ''}}),
        multi('confirm-actions', T('preferences_confirm_actions_title'), T('preferences_confirm_actions_summary'), A('gmail', ctx.lang, 'prefEntries_confirmActions'), {dialogTitle: T('prefDialogTitle_confirmActions')}),
        check('action-strip-action-reply-all', T('preferences_actionStrip_action_title'), T('preferences_actionStrip_action_summary'), false),
        list('auto-advance', T('preferences_auto_advance_title'), A('gmail', ctx.lang, 'prefEntries_autoAdvance'), 2, {dialogTitle: T('preferences_auto_advance_title'), summary: T('preferences_auto_advance_summary')}),
        list('message-text', T('preferences_message_text_size_title'), A('gmail', ctx.lang, 'prefEntries_messageTextSize'), 2, {dialogTitle: T('preferences_message_text_size_title'), showValue: true}),
        check('allow-batch', T('preferences_allow_batch_title'), T('preferences_allow_batch_summary')),
        action('labels-sync', T('preferences_synchronization_title'), T('preferences_synchronization_summary'), {open: 'gmail-sync'}),
        cat(T('preferences_notifications')),
        check('enable-notifications', T('preferences_notifications_enable'), T('preferences_notifications_summary')),
        {...action('labels-notification', T('preferences_label_notification_title'), T('preferences_label_notification_summary'), {open: 'gmail-notify'}), dependency: 'enable-notifications'}
      ]};
    },
    // LabelsSynchronizationSettings: the days for "Sync last N days", then every label's choice.
    'gmail-sync'(ctx) {
      const T = key => S('gmail', ctx.lang, key), days = Number(ctx.values.days) || 30, recent = AndroidStrings.format(T(AndroidStrings.quantity(days, ctx.lang) === 'one' ? 'sync_recent_one' : 'sync_recent_other'), days);
      const choices = [T('sync_all'), recent, T('sync_none')];
      return {set: 'gmail', title: T('preferences_synchronization_settings'), items: [
        cat(T('preferences_synchronization')),
        action('days', T('set_number_of_days'), recent, {edit: {title: T('set_number_of_days'), value: String(days), number: true}}),
        cat(T('labels')),
        ...GMAIL_LABELS.map(label => { const i = ctx.values[`sync|${label}`] ?? gmailSyncDefault(label); return list(`sync|${label}`, gmailLabel(ctx.lang, label), choices, gmailSyncDefault(label), {dialogTitle: gmailLabel(ctx.lang, label), summary: i === 2 ? T('not_synchronized') : choices[i]}); })
      ]};
    },
    // LabelsNotificationSettings: the synced labels, each with its own notification screen.
    'gmail-notify'(ctx) {
      const T = key => S('gmail', ctx.lang, key), sync = ctx.gmailSync || {};
      return {set: 'gmail', title: T('preferences_label_notification_title'), items: [
        cat(T('preferences_label_notification_summary')),
        ...GMAIL_LABELS.filter(label => (sync[`sync|${label}`] ?? gmailSyncDefault(label)) !== 2).map(label => action(`label|${label}`, gmailLabel(ctx.lang, label), '', {open: `gmail-label|${label}`}))
      ]};
    },
    'gmail-label'(ctx) {
      const T = key => S('gmail', ctx.lang, key), label = ctx.app.slice('gmail-label|'.length);
      return {set: 'gmail', title: gmailLabel(ctx.lang, label), items: [
        check('notify', T('preferences_notifications_enable'), T('preferences_notifications_summary'), label === 'Inbox'),
        {...check('ring', T('preferences_ring_enable'), T('preferences_ring_summary')), dependency: 'notify'},
        {...action('ringtone', T('preferences_ringtone'), '', {ringtone: true}), dependency: 'ring'},
        {...list('vibrate', T('preferences_vibrateWhen'), A('gmail', ctx.lang, 'prefEntries_vibrateWhen'), 2, {dialogTitle: T('prefDialogTitle_vibrateWhen'), showValue: true}), dependency: 'notify'},
        {...check('unobtrusive', T('preferences_unobtrusive_enable'), T('preferences_unobtrusive_summary')), dependency: 'notify'}
      ]};
    },
    email(ctx) {
      const T = key => S('email', ctx.lang, key), v = ctx.values, freq = A('email', ctx.lang, 'account_settings_check_frequency_entries');
      const text = (key, label, fallback, hint) => action(key, T(label), (v[key] ?? fallback) || (hint ? T(hint) : ''), {edit: {title: T(label), value: v[key] ?? fallback}});
      return {set: 'email', title: T('account_settings_action'), items: [
        cat(T('account_settings_title_fmt')),
        text('account_description', 'account_settings_description_label', ctx.account),
        text('account_name', 'account_settings_name_label', ctx.name),
        text('account_signature', 'account_settings_signature_label', '', 'account_settings_signature_hint'),
        list('account_check_frequency', T('account_settings_mail_check_frequency_label'), freq, 3, {dialogTitle: T('account_settings_mail_check_frequency_label'), showValue: true}),
        check('account_default', T('account_settings_default_label'), T('account_settings_default_summary'), true),
        cat(T('account_settings_notifications')),
        check('account_notify', T('account_settings_notify_label'), T('account_settings_notify_summary')),
        {...action('account_ringtone', T('account_settings_ringtone'), '', {ringtone: true}), dependency: 'account_notify'},
        list('account_settings_vibrate_when', T('account_settings_vibrate_when_label'), A('email', ctx.lang, 'account_settings_vibrate_when_entries'), 2, {dialogTitle: T('account_settings_vibrate_when_dlg_title'), summary: T('account_settings_vibrate_when_summary'), dependency: 'account_notify'}),
        cat(T('account_settings_servers')),
        action('incoming', T('account_settings_incoming_label'), '', {open: 'email-incoming'}),
        action('outgoing', T('account_settings_outgoing_label'), '', {open: 'email-outgoing'})
      ]};
    },
    'maps-navigation'(ctx) { return {set: 'maps', title: GBMaps.T(ctx.lang, 'Settings'), items: [check('OneButtonRmi', GBMaps.T(ctx.lang, '1-click report a problem'), '', false)]}; },
    'maps-cache'(ctx) {
      return {set: 'maps', title: ctx.t('Cache settings'), items: [
        check('cache_settings_prefetch_over_mobile_networks', ctx.t('Prefetch over mobile networks'), '', false),
        action('cache_settings_clear_cache', ctx.t('Clear cache'), '', {done: true, disabled: !ctx.mapsCache})
      ]};
    },
    'maps-labs'(ctx) {
      const lab = (key, img, title, summary) => check(key, ctx.t(title), ctx.t(summary), false, {image: `assets/mp-${img}.png`});
      return {set: 'maps', title: ctx.t('Labs'), items: [
        lab('scale', 'lab_scale', 'Scale Bar', 'Shows the map scale in the lower left corner.'),
        lab('measure', 'lab_measure', 'Measure', 'Tap two or more points on the map to measure the distance between them.'),
        lab('bubble', 'lab_bubble_buttons', 'Bubble Buttons', 'Call or navigate to a place right from its bubble.')
      ]};
    },
    'car-settings'(ctx) {
      const C = key => window.GBExtraApps.T(ctx.lang, key), act = (key, title, summary, a, extra = {}) => action(key, C(title), summary ? C(summary) : '', {act: a, ...extra});
      return {set: 'car', title: C('Settings'), items: [
        check('settings.always_show_disclaimer', C('Always show disclaimer'), '', true),
        check('settings.hide_statusbar', C('Hide Status bar'), '', false),
        act('settings.tint_color', 'Colorize icons', '', 'ch-tint'),
        act('settings.wallpaper', 'Wallpaper', '', 'ch-wallpaper'),
        action('settings.bt_launch', C('Bluetooth starts Car Home'), C('Select paired device to automatically start Car Home when in range.'), {open: 'car-bt'}),
        act('settings.reset_screens', 'Reset to defaults', '', 'ch-reset'),
        act('android', 'Android settings', '', 'ch-android-settings')
      ]};
    },
    'car-bt'(ctx) {
      const C = key => window.GBExtraApps.T(ctx.lang, key);
      return {set: 'car', title: C('Bluetooth starts Car Home'), items: [
        check('toggle_bluetooth', C('Bluetooth'), '', false, {value: !!ctx.settings?.bluetooth, act: 'ch-bluetooth'}),
        cat(C('Stop Car Home on disconnect')),
        list('disconnect', C('Timeout'), ['Never', 'Immediately', 'After 5 seconds', 'After 10 seconds', 'After 30 seconds'].map(C), -1, {dialogTitle: C('Timeout')}),
        cat(C('Start Car Home on connect with:')),
        action('bt_hint', '', C('Before a device can be used here, it needs to be paired and Bluetooth has to be enabled.'), {info: true})
      ]};
    },
    // Google Talk's Settings (Talk2.apk res/xml/gtalk_preferences.xml): Notifications are DependentListPreferences whose
    // rows below go grey on "Off"; Terms & privacy is Google's page.
    talk(ctx) {
      const K = key => window.GBTalk.T(ctx.lang, key), vibrate = ['Always', 'Only when silent', 'Never'].map(K);
      return {set: 'talk', title: K('Settings'), items: [
        cat(K('General settings')),
        check('gtalk-auto-login', K('Sign in automatically'), K('Sign into Talk when you turn on this Android device')),
        check('gtalk-mobile-indicator', K('Mobile indicator'), K('Show mobile indicator to friends')),
        check('gtalk-show-away-on-idle', K('Automatic away status'), K('Set status to away when the screen is turned off')),
        action('pref_gtalk_clear_history_key', K('Clear search history'), K('Clear previous Google Talk chat searches from showing up in the Search box'), {done: true}),
        check('gtalk-show-friend-notifications', K('Invitation notifications'), K('Notify in Status bar when friend invitations are received')),
        cat(K('Text chat settings')),
        list('gtalk-enable-notifications', K('Notifications'), ['Pop-up alert', 'Status bar notification', 'Off'].map(K), 1, {showValue: true, off: 2}),
        {...action('gtalk-text-ringtone', K('Ringtone'), '', {ringtone: true}), dependency: 'gtalk-enable-notifications'},
        list('gtalk-vibrate-when', K('Vibrate'), vibrate, 2, {summary: K('Also vibrate with notification'), dependency: 'gtalk-enable-notifications'}),
        cat(K('Voice & video chat settings')),
        list('gtalk-video-enable-notifications', K('Notifications'), ['Pop-up alert', 'Status bar notification'].map(K), 0, {showValue: true}),
        {...action('gtalk-video-ringtone', K('Ringtone'), '', {ringtone: true}), dependency: 'gtalk-video-enable-notifications'},
        list('gtalk-video-vibrate-when', K('Vibrate'), vibrate, 2, {summary: K('Also vibrate with notification'), dependency: 'gtalk-video-enable-notifications'}),
        cat(K('About')),
        action('gtalk-terms-key', K('Terms & privacy'), '', {toast: true})
      ]};
    },
    // YouTube 2.1.6's Settings (YouTube.apk res/xml/youtube_preferences.xml): Caption font size (subtitles_size_*, 18 by
    // default), Clear search history, SafeSearch filtering (safe_search_levels in the "SafeSearch" dialog); Help,
    // Feedback and the terms are Google's pages; Application version is the APK's.
    youtube(ctx) {
      const Y = key => window.GBYouTube.T(ctx.lang, key), web = (key, title, summary) => action(key, Y(title), Y(summary), {toast: true});
      return {set: 'youtube', title: Y('Settings'), items: [
        cat(Y('General settings')),
        check('default_hq', Y('High quality on mobile'), Y('Start videos in high quality when connected to a mobile network.'), false),
        list('subtitles_size', Y('Caption font size'), ['Small', 'Medium', 'Large', 'Extra Large'].map(Y), 1, {summary: Y('Sets the font size to use for captions')}),
        cat(Y('Search settings')),
        action('clear_history', Y('Clear search history'), Y('Clear previous YouTube searches from showing up in the Search box'), {done: true}),
        list('safe_search', Y('SafeSearch filtering'), ["Don't filter", 'Moderate', 'Strict'].map(Y), 1, {summary: Y('Block videos containing restricted content from appearing in search results'), dialogTitle: Y('SafeSearch')}),
        cat(Y('About')),
        web('help', 'Help', 'Find answers to your YouTube questions here'), web('feedback', 'Feedback', 'Help us make YouTube better'),
        web('mobile_terms', 'Google Mobile Terms of Service', 'Read Google Mobile Terms of Service'), web('youtube_terms', 'YouTube Terms of Service', "Read YouTube's Terms of Service"),
        web('mobile_privacy', 'Google Mobile Privacy Policy', 'Read Google Mobile Privacy Policy'), web('youtube_privacy', 'YouTube Privacy Policy', "Read YouTube's Privacy Policy"),
        action('version', Y('Application version'), '2.1.6', {info: true})
      ]};
    },
    dock(ctx) {
      const D = key => S('settings2', ctx.lang, key), on = !!ctx.values.dock_sounds;
      return {set: 'dock', title: D('dock_settings_title'), items: [
        action('dock_audio', D('dock_audio_settings_title'), D('dock_audio_summary_none'), {alert: {title: D('dock_not_found_title'), message: D('dock_not_found_text')}}),
        check('dock_sounds', D('dock_sounds_enable_title'), D(on ? 'dock_sounds_enable_summary_on' : 'dock_sounds_enable_summary_off'), false)
      ]};
    },
    'email-incoming'(ctx) { return {set: 'email', title: S('email', ctx.lang, 'account_setup_incoming_title'), form: serverForm(ctx, 'incoming')}; },
    'email-outgoing'(ctx) { return {set: 'email', title: S('email', ctx.lang, 'account_setup_outgoing_title'), form: serverForm(ctx, 'outgoing')}; }
  };
  // The IMAP account's server settings: IMAP_PORTS / SMTP_PORTS by security type (None, SSL, SSL (Accept all
  // certificates), TLS, TLS (Accept all certificates)).
  const PORTS = {incoming: [143, 993, 993, 143, 143], outgoing: [587, 465, 465, 587, 587]}, MASK = '\u2022'.repeat(8);
  const SECURITY = ['none', 'ssl', 'ssl_trust_certificates', 'tls', 'tls_trust_certificates'];
  function server(ctx, page) {
    const domain = String(ctx.account).split('@')[1] || 'example.com', saved = ctx.servers?.[page] || {};
    const base = page === 'incoming' ? {user: ctx.account, passwordSet: true, server: `imap.${domain}`, port: '993', security: 1, prefix: ''} : {server: `smtp.${domain}`, port: '465', security: 1, login: true, user: ctx.account, passwordSet: true};
    return {...base, ...saved};
  }
  const hostOk = v => /^[^\s\/:?#@\\]+$/.test(String(v).trim()), portOk = v => /^\d{1,5}$/.test(String(v).trim()) && Number(v) > 0 && Number(v) < 65536;
  function serverValid(page, f) {
    if (!hostOk(f.server || '') || !portOk(f.port || '')) return false;
    return page === 'outgoing' && !f.login ? true : !!String(f.user || '').trim() && !!f.password;
  }
  function serverForm(ctx, page) {
    const T = key => S('email', ctx.lang, key), v = server(ctx, page), pre = page === 'incoming' ? 'account_setup_incoming_' : 'account_setup_outgoing_';
    const label = key => `<span class="gbem-label">${e(T(key))}</span>`;
    const input = (name, type, extra = '') => `<input class="gbem-field" name="${name}" type="${type}" value="${e(name === 'password' ? (v.passwordSet ? MASK : '') : v[name])}" autocomplete="${type === 'password' ? 'new-password' : 'off'}" spellcheck="false"${extra}>`;
    const security = `<select class="gbem-spinner" name="security">${SECURITY.map((key, i) => `<option value="${i}"${Number(v.security) === i ? ' selected' : ''}>${e(T(`account_setup_incoming_security_${key}_label`))}</option>`).join('')}</select>`;
    const login = `${label(pre + 'username_label')}${input('user', 'email')}${label(pre + 'password_label')}${input('password', 'password')}`;
    const fields = page === 'incoming'
      ? `${login}${label('account_setup_incoming_imap_server_label')}${input('server', 'text')}${label('account_setup_incoming_port_label')}${input('port', 'text', ' inputmode="numeric"')}${label('account_setup_incoming_security_label')}${security}${label('account_setup_incoming_imap_path_prefix_label')}${input('prefix', 'text', ` placeholder="${e(T('account_setup_incoming_imap_path_prefix_hint'))}"`)}`
      : `${label('account_setup_outgoing_smtp_server_label')}${input('server', 'text')}${label('account_setup_outgoing_port_label')}${input('port', 'text', ' inputmode="numeric"')}${label('account_setup_outgoing_security_label')}${security}<label class="gbem-setup-default gbem-login"><input type="checkbox" name="login"${v.login ? ' checked' : ''}><span></span>${e(T('account_setup_outgoing_require_login_label'))}</label><div class="gbem-login-fields">${login}</div>`;
    const ok = serverValid(page, {...v, password: v.passwordSet ? MASK : ''});
    return `<form class="app-view gbem gbem-setup gbem-server" data-form="gbem-server" data-page="${page}" data-no-translate><div class="gb-titlebar">${e(page === 'incoming' ? T('account_setup_incoming_title') : T('account_setup_outgoing_title'))}</div><div class="gbem-setup-body gbem-server-body">${fields}</div><div class="gbem-setup-bar"><span></span><button type="submit" class="next"${ok ? '' : ' disabled'}>${e(T('next_action'))}<img src="assets/gb-em-button_indicator_next.png" alt=""></button></div></form>`;
  }
  // The form's values: the password only says whether one is set.
  function serverValues(form) {
    const f = form.elements;
    return {user: f.user?.value.trim() ?? '', password: f.password?.value ?? '', server: f.server.value.trim(), port: f.port.value.trim(), security: Number(f.security.value), ...(f.prefix ? {prefix: f.prefix.value.trim()} : {}), ...(f.login ? {login: f.login.checked} : {})};
  }
  // validateFields on every change; a new security type first sets its port.
  function serverInput(form, target) {
    const page = form.dataset.page;
    if (target?.name === 'security') form.elements.port.value = PORTS[page][Number(target.value)];
    const ok = serverValid(page, serverValues(form));
    form.querySelector('.gbem-setup-bar .next').disabled = !ok;
    return ok;
  }
  function serverSave(form, servers) {
    const page = form.dataset.page, {password, ...values} = serverValues(form);
    if (!serverValid(page, {...values, password})) return false;
    servers[page] = {...values, passwordSet: !!password};
    return true;
  }
  const screen = ctx => (SCREENS[ctx.app] || (String(ctx.app).startsWith('gmail-label|') ? SCREENS['gmail-label'] : null))?.(ctx);
  const get = (item, values) => item.value ?? values[item.key] ?? item.def;
  const enabled = (item, s, values) => { if (item.disabled) return false; if (!item.dependency) return true; const dep = s.items.find(i => i.key === item.dependency), v = get(dep, values); return dep.off !== undefined ? v !== dep.off : dep.kind === 'list' ? v != null : !!v; };
  function row(item, s, ctx) {
    if (item.kind === 'category') return `<div class="gbset-cat">${e(item.title)}</div>`;
    const on = enabled(item, s, ctx.values), dis = on ? '' : ' disabled aria-disabled="true"', id = `${ctx.app}:${item.key}`;
    const body = summary => `${item.image ? `<img class="gbset-img" src="${e(item.image)}" alt="">` : ''}<span class="gbset-text"><span class="gbset-title">${e(item.title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span>`;
    if (item.kind === 'check') { const value = !!get(item, ctx.values); return `<button class="gbset-row" data-action="${item.act || 'gbpref-check'}" data-id="${e(id)}" role="checkbox" aria-checked="${value}"${dis}>${body(item.summary)}<img class="gbset-check" src="assets/gb-btn_check_${value ? 'on' : 'off'}${on ? '' : '_disable'}.png" alt=""></button>`; }
    if (item.kind === 'multi') return `<button class="gbset-row" data-action="gbpref-list" data-id="${e(id)}"${dis}>${body(item.summary)}</button>`;
    if (item.kind === 'list') return `<button class="gbset-row" data-action="gbpref-list" data-id="${e(id)}"${dis}>${body(item.showValue ? item.options[get(item, ctx.values)] : item.summary)}</button>`;
    if (item.info) return `<div class="gbset-row gbset-info">${body(item.summary)}</div>`;
    // A row whose action is the app's own (Car Home's color, wallpaper and reset dialogs).
    if (item.act) return `<button class="gbset-row" data-action="${e(item.act)}" data-id="${e(id)}"${dis}>${body(item.summary)}</button>`;
    return `<button class="gbset-row" data-action="gbpref-action" data-id="${e(id)}"${dis}>${body(item.summary)}</button>`;
  }
  function render(ctx) {
    const s = screen(ctx); if (!s) return '';
    if (s.form) return s.form;
    return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${e(s.title)}</div><div class="gbset-list">${s.items.map(item => row(item, s, ctx)).join('')}</div></div>`;
  }
  const find = (ctx, key) => screen(ctx)?.items.find(item => item.key === key);
  const fw = (lang, key) => S('framework', lang, key);
  // ListPreference, DialogPreference (Browser's yes / no), EditTextPreference and RingtonePreference dialogs.
  function dialog(ctx, key) {
    const item = find(ctx, key); if (!item) return null;
    const id = `${ctx.app}:${key}`, ok = fw(ctx.lang, 'ok'), cancel = fw(ctx.lang, 'cancel');
    // MultiListPreference: check boxes, OK keeps the choice (ctx.multi is the open dialog's draft).
    if (item.kind === 'multi') { const draft = ctx.multi ?? get(item, ctx.values); return {title: item.dialogTitle || item.title, items: item.options.map((label, i) => ({action: 'gbpref-multi', id: `${id}:${i}`, title: label, checked: draft.includes(i)})), choice: 'multi', buttons: [{action: 'gbpref-multi-ok', id, title: ok}, {action: 'close-overlay', title: cancel}]}; }
    if (item.kind === 'list') return {title: item.dialogTitle || item.title, items: item.options.map((label, i) => ({action: 'gbpref-pick', id: `${id}:${i}`, title: label})), choice: 'single', selected: get(item, ctx.values), buttons: [{action: 'close-overlay', title: cancel}]};
    // VolumePreference: the stream's seek bar with OK / Cancel.
    if (item.volume) return {title: item.title, custom: `<div class="gbvols"><label class="gbvol"><input type="range" min="0" max="100" data-vol="${item.volume.key}" value="${Number(ctx.settings?.[item.volume.key] ?? item.volume.fallback)}" aria-label="${e(item.title)}"></label></div>`, buttons: [{action: 'gbset-volume-ok', title: ok}, {action: 'close-overlay', title: cancel}]};
    // An AlertDialog with OK alone (DockSettings' DIALOG_NOT_DOCKED).
    if (item.alert) return {title: item.alert.title, icon: 'ic_dialog_alert', message: item.alert.message, buttons: [{action: 'close-overlay', title: ok}]};
    if (item.confirm) return {title: item.confirm.title, icon: 'ic_dialog_alert', message: item.confirm.message, buttons: [{action: 'gbpref-confirm', id, title: ok}, {action: 'close-overlay', title: cancel}]};
    if (item.edit) return {title: item.edit.title, custom: `<label class="gbdlg-field"><input data-pref-edit maxlength="200"${item.edit.number ? ' type="number" inputmode="numeric" min="1" max="999"' : ''} value="${e(item.edit.value || '')}"></label>`, buttons: [{action: 'gbpref-edit-ok', id, title: ok}, {action: 'close-overlay', title: cancel}]};
    if (item.ringtone) {
      const sounds = ['default', '', ...(window.GBSettings?.NOTIFICATIONS || [])], current = ctx.values[key] ?? 'default';
      const name = n => n === 'default' ? fw(ctx.lang, 'ringtone_default') : n ? window.GBSettings.soundTitle(n) : fw(ctx.lang, 'ringtone_silent');
      return {title: fw(ctx.lang, 'ringtone_picker_title'), items: sounds.map(n => ({action: 'gbpref-pick', id: `${id}:${n}`, title: name(n)})), choice: 'single', selected: Math.max(0, sounds.indexOf(current)), buttons: [{action: 'close-overlay', title: ok}, {action: 'close-overlay', title: cancel}]};
    }
    return null;
  }
  window.GBPrefs = {SCREENS, render, dialog, find, get, server, serverValid, serverInput, serverSave, PORTS};
})();
