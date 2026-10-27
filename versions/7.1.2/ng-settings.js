/* Android 7.1.2 Settings (SettingsGoogle.apk, N2G48C), the screen 'settings'. The logic is 6.0.1's (mm-settings.js:
   the preference engine, dialogs, the screen stack); the look and the dashboard are read from SettingsGoogle:
   - SettingsDrawerActivity (settings_with_drawer.xml): the Toolbar in colorPrimary #263238 (actionbar_size 56 dp, the
     title TextAppearance.Material.Widget.ActionBar.Title 20 sp sans-serif-medium white at actionbar_contentInsetStart
     16 dp, 72 dp after a navigation button), colorPrimaryDark #21272b behind the status bar, the window #fafafa; the
     navigation button is settingslib's ic_menu on a top level screen (showMenuIcon: a dashboard tile's activity), the
     Up arrow on a SubSettings page (Theme.SubSettings), nothing on the dashboard or on a screen opened by itself.
   - The drawer (DrawerLayout, left_drawer 300 dp in colorBackground, the scrim #99000000, opened by the menu button or
     by a drag from the start edge): SettingsDrawerAdapter's 32 dp spacer, "Settings Home" with settingslib's home icon,
     then each category (drawer_category.xml: a 1 dp listDivider, the title in textAppearanceSmall 16 dp in, 48 dp) and
     its tiles (drawer_item.xml: the 24 dp icon 16 dp in tinted colorAccent, 32 dp after it the title in
     textAppearanceMedium colorControlNormal, 48 dp). A tile opens over the dashboard; from a tile's screen it replaces
     it (onTileClicked → openTile + finish).
   - DashboardContainerFragment: SupportFeatureProvider exists in SettingsGoogle, so the dashboard is a ViewPager of
     All (DashboardSummary) and Support (SupportFragment) under SlidingTabLayout (dashboard_container_header in
     colorPrimary: sliding_tab_title_view 16 dp padding, sans-serif-medium all caps, white selected and #b3ffffff not;
     the 3 dp indicator in the accent of ThemeOverlay.DeviceDefault.Accent sliding under the selected title).
   - DashboardSummary / DashboardAdapter: the conditions (condition_card.xml: the 56 dp row on colorAccent with the
     icon 16 dp in, 32 dp before the 18 sp title in textColorPrimaryInverse and the expand arrow; expanded, the summary at
     0.7, a 0.25 dp white divider and the action buttons at 0.8; ConditionManager orders them by their last change, a
     swipe silences one), the 8 dp dashboard_spacer #eeeeee, the suggestions (suggestion_header.xml 48 dp on
     card_background_grey #eeeeee with ic_expand_more / less, "Suggestions" and "+n" in 14 sp medium accent; two shown
     until expanded, DEFAULT_SUGGESTION_COUNT; suggestion_tile.xml 72 dp with the overflow's Remove), then each category
     (dashboard_category.xml: 48 dp, TextAppearance.CategoryTitle Body2 in textColorSecondary 16 dp in, 8 dp padding
     below) and its tiles (dashboard_tile.xml: 72 dp, the 24 dp icon 16 dp in and 32 dp before the 16 sp title, the
     summary from the tile's SummaryProvider in 14 sp textColorSecondary). DashboardDecorator draws listDivider (1 dp
     #1f000000) above a category that follows a tile and above a condition card. Tiles of other apps are tinted colorAccent.
   - SettingsActivity.doUpdateTilesList: Wi-Fi, Bluetooth, Data usage, Battery, Users, Print, Tap & pay shown (the 6P has
     them); SIM cards hidden (one slot), Developer options until turned on; config_backup_settings_intent is empty in this
     image, so Backup & reset (PrivacySettings) shows and BackupSettingsActivity does not; System UI tuner is disabled.
   - A preference screen: the image's res/xml (ng-settings-data.js) through the support-v14 PreferenceFragment
     (PreferenceTheme): preference_material.xml (layout-v21: 48 dp at least, 16 dp at the sides, the icon frame 60 dp with
     12 dp after it, the 16 sp title over the 14 sp summary in textColorSecondary, 16 dp padding above and below, the
     widget frame 16 dp after the texts), preference_category_material.xml (Body2 in colorAccent, 16 dp above and below);
     DividerDecoration's preference_list_divider_material (1 dp #1f000000) between two selectable rows. SwitchPreference /
     CheckBoxPreference keep their value, a ListPreference opens a single choice dialog, an EditTextPreference a text one.
   - SwitchBar (switch_bar.xml): 56 dp on #37474f (?colorSecondary), "On" / "Off" in TextAppearance.Switch white 72 dp in
     (switchbar_subsettings_margin_start), the Switch 16 dp from the end.
   Screens with code of their own register in NG.settingsScreens ({title, render, bar, actions, mount, action, back});
   res/xml hooks in NG.settingsHooks; a fragment no screen draws shows the not-built-yet card. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const A = name => `assets/${name}`;
  const str = ref => !ref ? '' : typeof ref !== 'string' ? '' : ref.startsWith('string/') ? T().t(ref.slice(7)) : ref.startsWith('@') ? '' : T().t(ref);
  const arr = ref => typeof ref === 'string' && ref.startsWith('array/') ? T().t(ref.slice(6)) : ref || [];
  const X = () => NG.settingsXml;
  NG.settingsScreens = NG.settingsScreens || {};
  NG.settingsHooks = NG.settingsHooks || {};
  NG.settingsSummaries = NG.settingsSummaries || {};
  NG.settingsStr = str; NG.settingsArr = arr;
  Object.assign(NG.defaults.settings, {prefs: {}, suggest: {}, conditions: {}, devOptions: false});

  // The fragment of a tile or preference, and the screen that draws it.
  const FRAGMENTS = {
    'com.android.settings.wifi.WifiSettings': 'wifi', 'com.android.settings.bluetooth.BluetoothSettings': 'bluetooth',
    'com.android.settings.datausage.DataUsageSummary': 'data-usage', 'com.android.settings.WirelessSettings': 'xml:wireless_settings',
    'com.android.settings.DisplaySettings': 'xml:display_settings', 'com.android.settings.applications.NotificationApps': 'notification-apps',
    'com.android.settings.notification.SoundSettings': 'xml:sound_settings', 'com.android.settings.applications.ManageApplications': 'apps',
    'com.android.settings.deviceinfo.StorageSettings': 'storage', 'com.android.settings.fuelgauge.PowerUsageSummary': 'battery',
    'com.android.settings.applications.ProcessStatsSummary': 'memory', 'com.android.settings.users.UserSettings': 'xml:user_settings',
    'com.android.settings.nfc.PaymentSettings': 'nfc-payment', 'com.android.settings.gestures.GestureSettings': 'xml:gesture_settings',
    'com.android.settings.location.LocationSettings': 'xml:location_settings', 'com.android.settings.SecuritySettings': 'security',
    'com.android.settings.accounts.AccountSettings': 'accounts', 'com.android.settings.inputmethod.InputMethodAndLanguageSettings': 'xml:language_settings',
    'com.android.settings.PrivacySettings': 'xml:privacy_settings', 'com.android.settings.DateTimeSettings': 'xml:date_time_prefs',
    'com.android.settings.accessibility.AccessibilitySettings': 'xml:accessibility_settings', 'com.android.settings.print.PrintSettingsFragment': 'xml:print_settings',
    'com.android.settings.DevelopmentSettings': 'xml:development_prefs', 'com.android.settings.DeviceInfoSettings': 'xml:device_info_settings'
  };
  NG.settingsFragments = FRAGMENTS;
  // Other preference fragments whose screen is a res/xml of the image (screens with code of their own add theirs).
  const XML_FRAGMENTS = NG.settingsXmlFragments = Object.assign(NG.settingsXmlFragments || {}, {
    'com.android.settings.notification.ZenModeSettings': 'zen_mode_settings', 'com.android.settings.notification.ZenModePrioritySettings': 'zen_mode_priority_settings',
    'com.android.settings.notification.ZenModeVisualInterruptionSettings': 'zen_mode_visual_interruptions_settings',
    'com.android.settings.notification.OtherSoundSettings': 'other_sound_settings', 'com.android.settings.deviceinfo.Status': 'device_info_status',
    'com.android.settings.deviceinfo.SimStatus': 'device_info_sim_status', 'com.android.settings.Settings$SimStatusActivity': 'device_info_sim_status',
    'com.android.settings.Settings$IccLockSettingsActivity': 'sim_lock_settings', 'com.android.settings.datausage.DataUsageMeteredSettings': 'data_usage_metered_prefs', 'com.android.settings.LegalSettings': 'about_legal',
    'com.android.settings.TetherSettings': 'tether_prefs', 'com.android.settings.vpn2.VpnSettings': 'vpn_settings2',
    'com.android.settings.wifi.AdvancedWifiSettings': 'wifi_advanced_settings', 'com.android.settings.wifi.ConfigureWifiSettings': 'wifi_configure_settings',
    'com.android.settings.location.ScanningSettings': 'location_scanning', 'com.android.settings.location.LocationMode': 'location_mode',
    'com.android.settings.accessibility.CaptionPropertiesFragment': 'captioning_settings', 'com.android.settings.accessibility.ToggleDaltonizerPreferenceFragment': 'accessibility_daltonizer_settings',
    'com.android.settings.tts.TextToSpeechSettings': 'tts_settings', 'com.android.settings.applications.AdvancedAppSettings': 'advanced_apps',
    'com.android.settings.ApnSettings': 'apn_settings', 'com.android.settings.ScreenPinningSettings': 'screen_pinning_settings',
    'com.android.settings.TrustAgentSettings': 'trust_agent_settings', 'com.android.settings.fuelgauge.BatterySaverSettings': 'battery_saver_settings',
    'com.android.settings.wfd.WifiDisplaySettings': 'wifi_display_settings', 'com.android.settings.notification.ConfigureNotificationSettings': 'configure_notification_settings',
    'com.android.settings.deviceinfo.ImeiInformation': 'device_info_phone_status', 'com.android.settings.Settings$ImeiInformationActivity': 'device_info_phone_status', 'com.android.settings.notification.ZenModeAutomationSettings': 'zen_mode_automation_settings',
    'com.android.settings.datausage.DataSaverSummary': 'data_saver', 'com.android.settings.applications.SpecialAccessSettings': 'special_access',
    'com.android.settings.accessibility.AccessibilitySettingsForSetupWizard': 'accessibility_settings_for_setup_wizard', 'com.android.settings.wifi.WifiCallingSettings': 'wifi_calling_settings',
    'com.android.settings.WifiCallingSettings': 'wifi_calling_settings', 'com.android.settings.inputmethod.VirtualKeyboardFragment': 'virtual_keyboard_settings',
    'com.android.settings.inputmethod.PhysicalKeyboardFragment': 'physical_keyboard_settings', 'com.android.settings.applications.ManageAssist': 'manage_assist'
  });
  // The screens other parts of the system open by a short name (Quick settings, the shade, the launcher).
  const ALIASES = {zen: 'xml:zen_mode_settings', 'zen-priority': 'xml:zen_mode_priority_settings', display: 'xml:display_settings', sound: 'xml:sound_settings',
    wireless: 'xml:wireless_settings', location: 'xml:location_settings', accessibility: 'xml:accessibility_settings', 'data-saver': 'xml:data_saver',
    cast: 'xml:wifi_display_settings', tether: 'xml:tether_prefs', users: 'xml:user_settings'};
  const screenOf = fragment => !fragment ? null : FRAGMENTS[fragment] || (XML_FRAGMENTS[fragment] ? `xml:${XML_FRAGMENTS[fragment]}` : `missing:${fragment}`);
  NG.settingsScreenOf = screenOf;

  // -- the dashboard's tiles (TileUtils.getCategories filtered by SettingsActivity.doUpdateTilesList) -------------------
  const HIDDEN = new Set(['Settings$SimSettingsActivity', 'BackupSettingsActivity']);
  function categories(c) {
    const D = NG.settingsDashboard, s = c.data.settings;
    const shown = t => !t.disabled && !HIDDEN.has(t.cls) && (t.cls !== 'Settings$DevelopmentSettingsActivity' || s.devOptions);
    return D.categories.map(cat => ({...cat, tiles: D.tiles.filter(t => t.category === cat.key && shown(t))})).filter(cat => cat.tiles.length);
  }
  const tileScreen = t => t.pkg === 'com.google.android.gms' ? 'app:google-settings' : screenOf(t.fragment) || `missing:${t.cls}`;
  // A screen a dashboard tile opens is a top level screen (SettingsDrawerActivity.isTopLevelTile: the menu button).
  const topLevel = screen => NG.settingsDashboard.tiles.some(t => tileScreen(t) === screen);

  function icon(ic, cls = 'ngst-ic', tint = '') {
    if (!ic?.icon) return `<i class="${cls}"></i>`;
    const color = tint || ic.tint;
    return color ? `<i class="${cls} masked" style="background:${color};-webkit-mask-image:url('${A(ic.icon)}');mask-image:url('${A(ic.icon)}')"></i>` : `<img class="${cls}" src="${A(ic.icon)}" alt="">`;
  }
  NG.settingsIcon = icon;
  const ACCENT = () => NG.settingsTheme?.colorAccent || '#009688';
  const tileIcon = t => icon(t.icon, 'ngst-ic', t.pkg === 'com.android.settings' ? '' : ACCENT());

  // Formatter.formatFileSize (N: 1024-based units, two decimals under 100, the next unit above 900).
  NG.fileSize = (c, bytes, shorter = false) => {
    const t = T(); let result = bytes, unit = 'framework/byteShort';
    for (const u of ['framework/kilobyteShort', 'framework/megabyteShort', 'framework/gigabyteShort', 'framework/terabyteShort', 'framework/petabyteShort']) {
      if (result <= 900) break; result /= 1024; unit = u;
    }
    const digits = result < 1 ? 2 : result < 10 ? (shorter ? 1 : 2) : result < 100 ? (shorter ? 0 : 2) : 0;
    const value = new Intl.NumberFormat(c.locale(), {minimumFractionDigits: digits, maximumFractionDigits: digits}).format(result);
    return t.fmt('framework/fileSizeSuffix', null, value, t.t(unit));
  };
  // Formatter.formatShortElapsedTime.
  NG.shortElapsed = (c, ms) => {
    const t = T(); let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60); s -= m * 60;
    if (d >= 2) return t.fmt('framework/durationDays', null, d + Math.floor((h + 12) / 24));
    if (d > 0) return t.fmt(h === 1 ? 'framework/durationDayHour' : 'framework/durationDayHours', null, d, h);
    if (h >= 2) return t.fmt('framework/durationHours', null, h + Math.floor((m + 30) / 60));
    if (h > 0) return t.fmt(m === 1 ? 'framework/durationHourMinute' : 'framework/durationHourMinutes', null, h, m);
    if (m >= 2) return t.fmt('framework/durationMinutes', null, m + Math.floor((s + 30) / 60));
    if (m > 0) return t.fmt(s === 1 ? 'framework/durationMinuteSecond' : 'framework/durationMinuteSeconds', null, m, s);
    return t.fmt(s === 1 ? 'framework/durationSecond' : 'framework/durationSeconds', null, s);
  };
  const percent = (c, x) => new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(x);

  // The tiles' summaries: each top level fragment's SummaryProvider (SummaryLoader), else the tile's summary meta-data.
  Object.assign(NG.settingsSummaries, {
    'Settings$WifiSettingsActivity': c => { const st = NG.system.wifiState(c); return st === 'connected' ? c.data.settings.wifiSsid : T().t(st === 'off' ? 'wifi_disabled_generic' : 'disconnected'); },
    'Settings$BluetoothSettingsActivity': c => !c.data.settings.bluetooth ? T().t('bluetooth_disabled') : T().t((c.data.settings.btConnected || []).length ? 'bluetooth_connected' : 'bluetooth_disconnected'),
    'Settings$DataUsageSummaryActivity': c => T().fmt('data_usage_summary_format', null, NG.fileSize(c, NG.system.dataUsage(c).usage)),
    'Settings$DisplaySettingsActivity': c => T().t(c.data.settings.brightnessAuto ? 'display_summary_on' : 'display_summary_off'),
    'Settings$NotificationAppListActivity': c => { const n = (c.data.settings.notifBlocked || []).length; return n ? T().plural('notification_summary', n) : T().t('notification_summary_none'); },
    'Settings$SoundSettingsActivity': c => {
      const s = c.data.settings;
      if (s.ringerMode === 'silent') return T().t('sound_settings_summary_silent');
      if (s.ringerMode === 'vibrate') return T().t('sound_settings_summary_vibrate');
      return T().fmt('sound_settings_summary', null, percent(c, (s.volume?.ring ?? 5) / 7));
    },
    'Settings$ManageApplicationsActivity': c => T().fmt('apps_summary', null, NG.settingsAppCount?.(c) ?? new Set(Object.values(NG.appsData || {}).map(a => a.pkg)).size),
    'Settings$StorageSettingsActivity': c => { const st = NG.settingsStorage?.(c); return st ? T().fmt('storage_summary', null, NG.fileSize(c, st.used), NG.fileSize(c, st.total)) : ''; },
    'Settings$PowerUsageSummaryActivity': c => {
      const b = NG.battery(), pct = percent(c, b.level / 100);
      if (b.plugged) return pct;
      return T().fmt('power_discharging_duration', null, pct, NG.shortElapsed(c, b.level * 240000));
    },
    'Settings$MemorySettingsActivity': c => { const m = NG.settingsMemory?.(c); return m ? T().fmt('memory_summary', null, NG.fileSize(c, m.used, true), NG.fileSize(c, m.total, true)) : ''; },
    'Settings$UserSettingsActivity': c => T().fmt('user_summary', null, NG.settingsOwnerName?.(c) || T().t('user_owner')),
    'Settings$LocationSettingsActivity': c => {
      const s = c.data.settings;
      if (!s.location) return T().t('location_off_summary');
      const mode = {3: 'location_mode_high_accuracy_title', 2: 'location_mode_battery_saving_title', 1: 'location_mode_sensors_only_title'}[s.locationMode ?? 3];
      return T().fmt('location_on_summary', null, T().t(mode));
    },
    'Settings$InputMethodAndLanguageSettingsActivity': c => NG.settingsLocaleNames?.(c) || '',
    'Settings$DateTimeSettingsActivity': c => NG.settingsZoneSummary?.(c) || '',
    'Settings$PrintSettingsActivity': c => { const n = (c.data.settings.printJobs || []).length; return T().plural('plurals:print_settings_title', n); },
    'Settings$DeviceInfoSettingsActivity': () => T().fmt('about_summary', null, '7.1.2'),
    'Settings$PaymentSettingsActivity': c => c.data.settings.paymentDefault ? T().fmt('payment_summary', null, c.data.settings.paymentDefault) : ''
  });
  const tileSummary = (c, t) => { const f = NG.settingsSummaries[t.cls]; if (f) { try { return f(c) || ''; } catch { return ''; } } return t.summary ? T().t(t.summary) : ''; };

  // -- conditions (ConditionManager): shown while their state holds, until a swipe silences them ---------------------
  const CONDITIONS = [
    {id: 'airplane', icon: 'st-ic_airplane.svg', show: c => c.data.settings.airplane, title: 'condition_airplane_title', summary: () => T().t('condition_airplane_summary'),
      action: 'condition_turn_off', act: c => NG.system.setAirplane(c, false), open: 'xml:wireless_settings'},
    {id: 'hotspot', icon: 'st-ic_hotspot.svg', show: c => c.data.settings.hotspot, title: 'condition_hotspot_title',
      summary: c => T().fmt('condition_hotspot_summary', null, c.data.settings.hotspotSsid || T().t('framework/wifi_tether_configure_ssid_default')),
      action: 'condition_turn_off', act: c => NG.system.setHotspot(c, false), open: 'xml:tether_prefs'},
    {id: 'dnd', icon: 'st-ic_zen.svg', show: c => !!c.data.settings.zen, title: c => T().fmt('condition_zen_title', null, T().t({1: 'zen_mode_option_important_interruptions', 2: 'zen_mode_option_no_interruptions', 3: 'zen_mode_option_alarms'}[c.data.settings.zen])),
      summary: c => c.data.settings.zenUntil ? NG.zenUntilText?.(c) || T().t('framework/zen_mode_forever_dnd') : T().t('framework/zen_mode_forever_dnd'),
      action: 'condition_turn_off', act: c => NG.system.setZen(c, 0), open: 'shade-dnd'},
    {id: 'battery', icon: 'st-ic_settings_battery.svg', show: c => c.data.settings.powerSave && !NG.battery().plugged, title: 'condition_battery_title', summary: () => T().t('condition_battery_summary'),
      action: 'condition_turn_off', act: c => NG.system.setPowerSave(c, false), open: 'xml:battery_saver_settings'},
    {id: 'cellular', icon: 'st-ic_cellular_off.svg', show: c => !c.data.settings.mobileData && !c.data.settings.airplane, title: 'condition_cellular_title', summary: () => T().t('condition_cellular_summary'),
      action: 'condition_turn_on', act: c => NG.system.setMobileData(c, true), open: 'data-usage'},
    {id: 'bgdata', icon: 'st-ic_data_saver.svg', show: c => c.data.settings.dataSaver, title: 'condition_bg_data_title', summary: () => T().t('condition_bg_data_summary'),
      action: 'condition_turn_off', act: c => NG.system.setDataSaver(c, false), open: 'data-usage'}
  ];
  // Condition.silence: hidden until its state changes; the time of the last change orders the cards (oldest first).
  function conditions(c) {
    const saved = c.data.settings.conditions || (c.data.settings.conditions = {});
    const out = [];
    for (const cond of CONDITIONS) {
      const on = !!cond.show(c), st = saved[cond.id] || (saved[cond.id] = {on: false, since: 0, silenced: false});
      if (on !== st.on) { st.on = on; st.since = Date.now(); st.silenced = false; }
      if (on && !st.silenced) out.push({...cond, since: st.since});
    }
    return out.sort((a, b) => a.since - b.since);
  }

  // -- suggestions (SuggestionParser over suggestion_ordering.xml, SuggestionsChecks) ----------------------------------
  const DAY = 86400000;
  const LANG_LOCALE = {en: 'en', hu: 'hu', de: 'de-rDE', fr: 'fr-rFR', es: 'es-rES'};
  function complete(c, t) {
    const s = c.data.settings, secure = ['pin', 'password', 'pattern'].includes(s.lock?.type), prints = (s.fingerprints || []).length;
    switch (t.cls) {
      case 'Settings$ScreenLockSuggestionActivity': return secure;
      case 'Settings$FingerprintEnrollSuggestionActivity': return secure;
      case 'Settings$FingerprintSuggestionActivity': return prints !== 1;
      case 'Settings$ZenModeAutomationSuggestionActivity': return (s.zenRules || []).some(r => r.on);
      case 'WallpaperSuggestionActivity': return !!s.wallpaperSet;
      case 'Settings$WifiCallingSuggestionActivity': return true;
      // SuggestionFeatureProviderGoogleImpl: the Gservices flag settingsgoogle:should_show_backup_suggestion is off.
      case 'BackupSuggestionActivity': return true;
      default: return false;
    }
  }
  function suggestions(c) {
    const s = c.data.settings, st = s.suggest || (s.suggest = {}), lang = LANG_LOCALE[c.lang] || 'en', now = Date.now(), out = [];
    for (const step of NG.settingsSuggestions) {
      if ((s.suggestDone || []).includes(step.category)) continue;
      const found = [];
      for (const t of step.tiles) {
        if (t.disabled || (st[t.cls]?.disabled)) continue;
        if (t.require_feature && t.require_feature !== 'android.hardware.fingerprint') continue;
        if (t.supported && !t.supported.includes(lang) && !t.supported.includes(lang.split('-')[0])) continue;
        // isDismissed: the dismiss control's days from the first time the suggestion was looked at.
        if (t.dismiss) {
          const days = t.dismiss.split(',').map(Number), rec = st[t.cls] || (st[t.cls] = {setup: now, index: 0, dismissed: true});
          if (rec.dismissed) {
            if (now >= rec.setup + days[Math.min(rec.index, days.length - 1)] * DAY) { rec.dismissed = false; rec.index++; }
            else continue;
          }
        }
        if (complete(c, t)) continue;
        found.push(t);
      }
      if (!step.multiple && found.length > 1) out.push(found.reduce((a, b) => b.priority > a.priority ? b : a));
      else out.push(...found);
    }
    return out;
  }
  function dismissSuggestion(c, t) {
    const s = c.data.settings, st = s.suggest || (s.suggest = {}), rec = st[t.cls] || (st[t.cls] = {setup: Date.now(), index: 0, dismissed: false});
    const days = t.dismiss ? t.dismiss.split(',') : null;
    if (!days || days.length === rec.index) {
      rec.disabled = true;
      const step = NG.settingsSuggestions.find(x => x.tiles.includes(t));
      if (step) s.suggestDone = [...new Set([...(s.suggestDone || []), step.category])];
    } else rec.dismissed = true;
    c.save();
  }

  // -- navigation ---------------------------------------------------------------------------------------------------
  // A stack of {screen, title, nav}: nav 'menu' (a top level tile's activity), 'up' (SubSettings) or '' (opened by
  // itself); 'dashboard' as a screen is the Settings Home the drawer opens over a tile.
  const state = c => c.ui.settings || (c.ui.settings = {stack: [], tab: 0});
  const current = c => {
    const s = state(c).stack.at(-1);
    if (!s || s.screen === 'dashboard') return null;
    const ref = s.screen.startsWith('xml:') ? s.screen.slice(4) : null;
    return {...s, xml: ref ? ref.split('#')[0] : null, nested: ref?.split('#')[1] || null};
  };
  const nodeOf = cur => cur.nested ? findKey(X()[cur.xml], cur.nested) : X()[cur.xml];
  function linkTitle(screen) {
    const tile = NG.settingsDashboard.tiles.find(t => tileScreen(t) === screen);
    if (tile) return T().t(tile.title);
    const seek = n => { if (n?.fragment && screenOf(n.fragment) === screen && n.title) return str(n.title); for (const k of n?.c || []) { const t = seek(k); if (t) return t; } return ''; };
    for (const n of Object.values(X())) { const t = seek(n); if (t) return t; }
    return '';
  }
  // Opening a sub page (a SubSettings activity over the current one).
  function go(c, screen, title, nav = 'up') {
    if (screen === 'app:google-settings') screen = 'gms';
    const st = state(c); st.stack.push({screen, title: title || '', nav}); if (st.scroll) delete st.scroll[screen]; st.drawer = false; c.render();
  }
  NG.settingsGo = go;
  NG.settingsBack = c => NG.module('settings').back(c);
  function openTile(c, t, fromDashboard) {
    const screen = tileScreen(t), st = state(c);
    const entry = {screen: screen === 'app:google-settings' ? 'gms' : screen, title: T().t(t.title), nav: 'menu'};
    if (fromDashboard || !st.stack.length || st.stack.at(-1).screen === 'dashboard') st.stack.push(entry);
    else st.stack[st.stack.length - 1] = entry;
    st.drawer = false; if (st.scroll) delete st.scroll[screen];
    c.render();
  }

  // -- the dashboard ----------------------------------------------------------------------------------------------
  function conditionCard(c, cond, expanded) {
    const title = typeof cond.title === 'function' ? cond.title(c) : T().t(cond.title);
    return `<div class="ngst-cond${expanded ? ' open' : ''}" data-cond="${cond.id}"><div class="ngst-cond-row" data-action="ngst-cond" data-cond="${cond.id}" role="button">
      <i class="ngst-cond-ic" style="-webkit-mask-image:url('${A(cond.icon)}');mask-image:url('${A(cond.icon)}')"></i><span class="ngst-cond-title">${c.safe(title)}</span>
      <i class="ngst-cond-exp" style="-webkit-mask-image:url('${A(expanded ? 'st-ic_expand_less.svg' : 'st-ic_expand_more.svg')}');mask-image:url('${A(expanded ? 'st-ic_expand_less.svg' : 'st-ic_expand_more.svg')}')" data-action="ngst-cond-exp" data-cond="${cond.id}"></i></div>
      ${expanded ? `<div class="ngst-cond-detail"><div class="ngst-cond-sum">${c.safe(cond.summary(c))}</div><i class="ngst-cond-div"></i><div class="ngst-cond-btns"><button type="button" data-action="ngst-cond-act" data-cond="${cond.id}">${c.safe(T().t(cond.action))}</button></div></div>` : ''}</div>`;
  }
  function summaryPage(c) {
    const st = state(c), conds = conditions(c), sugg = suggestions(c), items = [];
    const expandedCond = conds.find(x => x.id === st.cond)?.id;
    for (const cond of conds) items.push({type: 'cond', html: conditionCard(c, cond, cond.id === expandedCond)});
    if (sugg.length) {
      if (conds.length) items.push({type: 'spacer', html: '<i class="ngst-spacer"></i>'});
      const mode = st.suggMode || 0, shown = mode === 0 ? Math.min(2, sugg.length) : mode === 2 ? sugg.length : 0;
      const more = mode === 1 || (mode === 0 && sugg.length > 2), hidden = sugg.length - shown;
      items.push({type: 'shead', html: `<button type="button" class="ngst-shead" data-action="ngst-sugg-toggle"><i class="ngst-shead-ic" style="-webkit-mask-image:url('${A(more ? 'st-ic_expand_more.svg' : 'st-ic_expand_less.svg')}');mask-image:url('${A(more ? 'st-ic_expand_more.svg' : 'st-ic_expand_less.svg')}')"></i><span>${c.safe(T().fmt('suggestions_title', null, sugg.length))}</span><span class="ngst-shead-sum">${hidden ? c.safe(T().fmt('suggestions_summary', null, hidden)) : ''}</span></button>`});
      sugg.slice(0, shown).forEach(t => items.push({type: 'stile', html: `<div class="ngst-stile" role="button" data-action="ngst-sugg" data-cls="${c.safe(t.cls)}">${icon(t.icon, 'ngst-ic', t.icon?.icon && t.pkg !== 'com.android.settings' ? ACCENT() : '')}<span class="ngst-texts"><span class="ngst-title">${c.safe(T().t(t.title))}</span>${t.summary ? `<span class="ngst-summary">${c.safe(T().t(t.summary))}</span>` : ''}</span>${NG.menu.button(c, 'ngst-sugg-more" data-cls="' + c.safe(t.cls))}</div>`}));
    }
    for (const cat of categories(c)) {
      items.push({type: 'cat', html: `<div class="ngst-dcat">${c.safe(T().t(cat.title))}</div>`});
      for (const t of cat.tiles) {
        const sum = tileSummary(c, t);
        items.push({type: 'tile', html: `<button type="button" class="ngst-tile" data-action="ngst-tile" data-cls="${c.safe(t.cls)}">${tileIcon(t)}<span class="ngst-texts"><span class="ngst-title">${c.safe(T().t(t.title))}</span>${sum ? `<span class="ngst-summary">${c.safe(sum)}</span>` : ''}</span></button>`});
      }
    }
    // DashboardDecorator: listDivider above a category after a tile and above a condition card (not the first item).
    return items.map((it, i) => (i > 0 && ((it.type === 'cat' && items[i - 1].type === 'tile') || it.type === 'cond') ? '<i class="ngst-ddiv"></i>' : '') + it.html).join('');
  }
  // SupportFragment: signed in with the Google account and online, the escalation card (phone and chat around the
  // clock), then "Search help & send feedback" and "Explore tips & tricks".
  function supportPage(c) {
    const t = T();
    return `<div class="ngst-support"><div class="ngst-esc"><div class="ngst-esc-title">${c.safe(t.t('support_escalation_24_7_title'))}</div><div class="ngst-esc-sum">${c.safe(t.t('support_escalation_24_7_summary'))}</div>
      <div class="ngst-esc-btns"><button type="button" data-action="ngst-support" data-kind="phone">${c.safe(t.t('support_escalation_by_phone'))}</button><button type="button" data-action="ngst-support" data-kind="chat">${c.safe(t.t('support_escalation_by_chat'))}</button></div></div>
      <i class="ngst-spacer"></i>
      <button type="button" class="ngst-tile" data-action="ngst-support" data-kind="help">${icon({icon: 'st-ic_help_24dp.svg'})}<span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('support_help_feedback_title'))}</span></span></button>
      <button type="button" class="ngst-tile" data-action="ngst-support" data-kind="tips">${icon({icon: 'st-ic_lightbulb_outline_24.svg'})}<span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('support_tips_and_tricks_title'))}</span></span></button></div>`;
  }
  function dashboard(c) {
    const st = state(c), tab = st.tab || 0;
    return `<div class="ngst-tabs"><div class="ngst-tabtitles"><button type="button" class="${tab === 0 ? 'on' : ''}" data-action="ngst-tab" data-tab="0">${c.safe(T().t('page_tab_title_summary'))}</button><button type="button" class="${tab === 1 ? 'on' : ''}" data-action="ngst-tab" data-tab="1">${c.safe(T().t('page_tab_title_support'))}</button></div><i class="ngst-tabind" style="transform:translateX(${tab * 100}%)"></i></div>
      <div class="ngst-pager" style="--tab:${tab}"><div class="ngst-page ngst-content ngst-dash" data-page="0">${summaryPage(c)}</div><div class="ngst-page ngst-content ngst-supportpage" data-page="1">${supportPage(c)}</div></div>`;
  }

  // -- the drawer -----------------------------------------------------------------------------------------------------
  function drawer(c) {
    const rows = [`<i class="ngst-dspacer"></i><button type="button" class="ngst-ditem" data-action="ngst-dhome">${icon({icon: 'st-home.svg'})}<span>${c.safe(T().t('home'))}</span></button>`];
    for (const cat of categories(c)) {
      rows.push(`<div class="ngst-dcat2"><i></i><span>${c.safe(T().t(cat.title))}</span></div>`);
      for (const t of cat.tiles) rows.push(`<button type="button" class="ngst-ditem" data-action="ngst-dtile" data-cls="${c.safe(t.cls)}">${icon(t.icon, 'ngst-ic', ACCENT())}<span>${c.safe(T().t(t.title))}</span></button>`);
    }
    return `<div class="ngst-drawer${state(c).drawer ? ' open' : ''}"><div class="ngst-scrim" data-action="ngst-dclose"></div><div class="ngst-dpanel ngst-content">${rows.join('')}</div></div>`;
  }

  // -- a preference screen from its XML ----------------------------------------------------------------------------
  const prefs = c => c.data.settings.prefs || (c.data.settings.prefs = {});
  const isList = n => /ListPreference$|DropDownPreference$/.test(n.t);
  const isSwitch = n => /SwitchPreference$/.test(n.t) && !/MasterSwitchPreference/.test(n.t);
  const isCheck = n => /CheckBoxPreference$/.test(n.t);
  function value(c, node) {
    const hook = NG.settingsHooks[current(c)?.xml]?.get?.(c, node.key, node);
    if (hook !== undefined) return hook;
    const p = prefs(c);
    if (node.key in p) return p[node.key];
    if (isSwitch(node) || isCheck(node)) return String(node.defaultValue) === 'true';
    return node.defaultValue ?? null;
  }
  function setValue(c, node, v) {
    if (NG.settingsHooks[current(c)?.xml]?.set?.(c, node.key, v, node) === true) { c.save(); return; }
    prefs(c)[node.key] = v; c.save();
  }
  NG.settingsValue = value; NG.settingsSetValue = setValue;
  // The rows of a group, each {html, sel}: sel says whether DividerDecoration may draw next to it.
  function rowItems(c, node, xml) {
    const hook = NG.settingsHooks[xml] || {};
    const out = [];
    for (const n of node.c || []) {
      if (hook.hide?.(c, n.key, n) || (n.key && hook.hidden?.includes(n.key))) continue;
      if (n.t === 'PreferenceCategory' || /Category$/.test(n.t)) {
        const inner = rowItems(c, n, xml);
        if (!inner.length) continue;
        const title = hook.title?.(c, n.key, n) ?? str(n.title);
        if (title) out.push({html: `<div class="ngst-cat">${c.safe(title)}</div>`, sel: false});
        out.push(...inner);
        continue;
      }
      const own = hook.row?.(c, n.key, n);
      if (own) { out.push({html: own, sel: !/ngst-nosel/.test(own)}); continue; }
      const selectable = hook.selectable?.(c, n.key, n) !== false && String(n.selectable) !== 'false';
      // DividerPreference (allowDividerAbove / allowDividerBelow) decides its own dividers.
      out.push({html: pref(c, n, xml, selectable), sel: selectable, above: n.allowDividerAbove ? n.allowDividerAbove === 'true' : undefined, below: n.allowDividerBelow ? n.allowDividerBelow === 'true' : undefined});
    }
    return out;
  }
  // DividerDecoration: a divider below a row that allows one below (a selectable one) when the next allows one above.
  const joinRows = items => items.map((it, i) => { const next = items[i + 1]; return it.html + ((it.below ?? it.sel) && next && (next.above ?? next.sel) ? '<i class="ngst-pdiv"></i>' : ''); }).join('');
  NG.settingsJoinRows = joinRows;
  function rows(c, node, xml) { return joinRows(rowItems(c, node, xml)); }
  function summaryOf(c, n, xml) {
    const hook = NG.settingsHooks[xml]?.summary?.(c, n.key, n);
    if (hook !== undefined) return hook;
    const v = value(c, n);
    if (isSwitch(n) || isCheck(n)) {
      if (v && n.summaryOn) return str(n.summaryOn);
      if (!v && n.summaryOff) return str(n.summaryOff);
    }
    if (isList(n) && n.entries && n.entryValues) {
      const i = n.entryValues.indexOf(String(v)), entry = i >= 0 ? arr(n.entries)[i] : '';
      const sum = str(n.summary);
      return sum ? AndroidStrings.format(sum, entry) : n.t.endsWith('DropDownPreference') || n.t.endsWith('ListPreference') ? entry : '';
    }
    if (n.t === 'EditTextPreference' && !n.summary) return v || '';
    return str(n.summary);
  }
  function switchHtml(on, disabled) { return `<i class="ngw-switch ngst-switch${on ? ' on' : ''}${disabled ? ' disabled' : ''}"><i class="ngw-thumb"></i></i>`; }
  NG.settingsSwitch = switchHtml;
  function pref(c, n, xml, selectable = true) {
    const hook = NG.settingsHooks[xml] || {};
    const title = hook.title?.(c, n.key, n) ?? str(n.title), summary = summaryOf(c, n, xml);
    // hook.enabled lists the rows the code turns on (setEnabled(true)) over the XML's enabled="false".
    const v = value(c, n), disabled = hook.disabled?.(c, n.key, n) || (String(n.enabled) === 'false' && !hook.enabled?.includes(n.key)) || (n.dependency && dependentsOff(c, findKey(X()[xml], n.dependency)));
    let widget = '';
    if (isSwitch(n) || hook.switch?.includes(n.key)) widget = switchHtml(!!v, disabled);
    if (isCheck(n)) widget = `<i class="ngst-check${v ? ' on' : ''}"></i>`;
    if (hook.widget) widget = hook.widget(c, n.key, n) ?? widget;
    const ic = n.icon?.icon ? `<span class="ngst-iconframe">${icon(n.icon)}</span>` : '';
    // A row with a button of its own in its widget frame (GearPreference) cannot be a button itself.
    const tag = selectable && !/<button/.test(widget) ? 'button' : 'div', role = tag === 'div' && selectable ? ' role="button"' : '';
    // shouldDisableView="false": a disabled row that does not look disabled.
    // Android preferences need no key when they only open an activity. Keep their XML position so two keyless
    // siblings (Testing's Usage statistics / Wi-Fi information, for example) still resolve to their own intents.
    const path = nodePath(X()[xml], n);
    return `<${tag}${role} ${tag === 'button' ? 'type="button" ' : ''}class="ngst-pref${disabled && n.shouldDisableView !== 'false' ? ' disabled' : ''}" data-action="ngst-pref" data-key="${c.safe(n.key || '')}"${path !== null ? ` data-node="${path}"` : ''} ${disabled ? 'disabled' : ''}>${ic}<span class="ngst-texts"><span class="ngst-title">${c.safe(title)}</span>${summary ? `<span class="ngst-summary">${c.safe(summary)}</span>` : ''}</span>${widget ? `<span class="ngst-widget">${widget}</span>` : ''}</${tag}>`;
  }
  NG.settingsPref = pref;
  // A plain preference row for screens that build their own lists: {key, title, summary, icon, widget, disabled, action}.
  NG.settingsRow = (c, r) => `<${r.div ? 'div' : 'button type="button"'} class="ngst-pref${r.disabled ? ' disabled' : ''}${r.cls ? ' ' + r.cls : ''}" data-action="${r.action || 'ngst-pref'}" data-key="${c.safe(r.key || '')}"${r.data || ''}${r.disabled ? ' disabled' : ''}>${r.icon ? `<span class="ngst-iconframe">${r.icon}</span>` : ''}<span class="ngst-texts"><span class="ngst-title">${c.safe(r.title)}</span>${r.summary ? `<span class="ngst-summary">${c.safe(r.summary)}</span>` : ''}</span>${r.widget ? `<span class="ngst-widget">${r.widget}</span>` : ''}</${r.div ? 'div' : 'button'}>`;
  NG.settingsCat = (c, title) => `<div class="ngst-cat">${c.safe(title)}</div>`;
  function dependentsOff(c, dep) {
    if (!dep) return false;
    const v = value(c, dep);
    return String(dep.disableDependentsState) === 'true' ? !!v : !v;
  }
  function findKey(node, key) {
    if (!node) return null;
    if (node.key === key) return node;
    for (const ch of node.c || []) { const f = findKey(ch, key); if (f) return f; }
    return null;
  }
  NG.settingsFind = findKey;
  function nodePath(node, target, path = '') {
    if (!node) return null;
    if (node === target) return path;
    for (let i = 0; i < (node.c || []).length; i++) {
      const found = nodePath(node.c[i], target, path ? `${path}.${i}` : String(i));
      if (found !== null) return found;
    }
    return null;
  }
  const nodeAt = (node, path) => path === '' ? node : path.split('.').reduce((n, i) => n?.c?.[+i], node);
  // The switch bar above a screen's list.
  NG.settingsSwitchBar = (c, on, action, disabled = false) => `<div class="ngst-switchbar${disabled ? ' disabled' : ''}" data-action="${action}" role="button"><span>${c.safe(T().t(on ? 'switch_on_text' : 'switch_off_text'))}</span>${switchHtml(on, disabled)}</div>`;

  // -- dialogs --------------------------------------------------------------------------------------------------------
  function listDialog(c, n, xml) {
    const entries = arr(n.entries), values = n.entryValues || [], cur = String(value(c, n));
    c.dialog({title: str(n.dialogTitle) || str(n.title), keepOpen: false,
      items: entries.map((e, i) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${values[i] === cur ? ' on' : ''}"></i><span>${c.safe(e)}</span></span>`})),
      buttons: [{label: T().t('framework/cancel')}],
      onItem: i => { setValue(c, n, values[i]); NG.settingsHooks[xml]?.changed?.(c, n.key, values[i], n); c.render(); }});
  }
  function textDialog(c, n, xml) {
    const v = value(c, n) || '';
    c.dialog({title: str(n.dialogTitle) || str(n.title), html: `<div class="ngst-edit"><input type="text" value="${c.safe(v)}" class="ngst-input"></div>`,
      buttons: [{label: T().t('framework/cancel')}, {label: T().t('framework/ok'), action: c => { const val = c.el.overlay.querySelector('.ngst-input')?.value ?? v; setValue(c, n, val); NG.settingsHooks[xml]?.changed?.(c, n.key, val, n); c.render(); }}]});
    setTimeout(() => c.el.overlay.querySelector('.ngst-input')?.focus(), 50);
  }
  NG.settingsListDialog = listDialog;

  // -- the activity ---------------------------------------------------------------------------------------------------
  const custom = cur => cur && (NG.settingsScreens[cur.screen.split(':')[0]] || NG.settingsScreens[cur.screen]);
  function render(c) {
    const st = state(c);
    if (c.ui.sub && c.ui.sub !== st.opened) {
      st.opened = c.ui.sub;
      const screen = ALIASES[c.ui.sub] || c.ui.sub;
      st.stack = [{screen, title: '', nav: topLevel(screen) ? 'menu' : ''}]; st.drawer = false;
    }
    if (!c.ui.sub && st.opened) { st.opened = ''; st.stack = []; }
    const cur = current(c);
    let title = T().t('dashboard_title'), body, bar = '', actions = '', nav = '';
    if (!cur) {
      body = dashboard(c);
      actions = `<button type="button" class="ngst-ab-btn" data-action="ngst-search" aria-label="${c.safe(T().t('search_menu'))}"><i style="-webkit-mask-image:url('${A('fw-ic_search_api_material.svg')}');mask-image:url('${A('fw-ic_search_api_material.svg')}')"></i></button>`;
    } else {
      nav = cur.nav;
      const scr = custom(cur);
      bar = scr?.bar?.(c, cur) || (cur.xml ? NG.settingsHooks[cur.xml]?.bar?.(c, cur) || '' : '');
      if (scr?.full) return `<div class="ngst ngst-full">${scr.render(c, cur)}${drawer(c)}</div>`;
      if (scr?.render) { title = scr.title?.(c, cur) || cur.title || linkTitle(cur.screen) || title; body = `<div class="ngst-content${scr.grey ? ' grey' : ''}">${scr.render(c, cur)}</div>`; }
      else if (cur.xml && X()[cur.xml]) {
        const hook = NG.settingsHooks[cur.xml] || {};
        title = hook.screenTitle?.(c, cur) || cur.title || str(nodeOf(cur).title) || linkTitle(cur.screen) || title;
        body = `<div class="ngst-content ngst-list">${cur.nested ? '' : hook.top?.(c) || ''}${rows(c, nodeOf(cur), cur.xml)}${cur.nested ? '' : hook.bottom?.(c) || ''}</div>`;
      } else { title = cur.title || linkTitle(cur.screen) || title; body = `<div class="ngst-content ngst-missing">${c.missing('settings', `<small>${c.safe(cur.screen.replace(/^missing:/, ''))}</small>`)}</div>`; }
      actions = scr?.actions?.(c, cur) || (cur.xml ? NG.settingsHooks[cur.xml]?.actions?.(c, cur) || '' : '');
    }
    const navBtn = nav === 'menu' ? `<button type="button" class="ngst-nav" data-action="ngst-menu" aria-label="${c.safe(T().t('content_description_menu_button'))}"><i style="-webkit-mask-image:url('${A('st-ic_menu.svg')}');mask-image:url('${A('st-ic_menu.svg')}')"></i></button>`
      : nav === 'up' ? `<button type="button" class="ngst-nav" data-action="ngst-up" aria-label="${c.safe(T().t('framework/action_bar_up_description'))}"><i style="-webkit-mask-image:url('${A('fw-ic_ab_back_material.svg')}');mask-image:url('${A('fw-ic_ab_back_material.svg')}')"></i></button>` : '';
    return `<div class="ngst${cur ? '' : ' dash'}"><div class="ngst-ab">${navBtn}<span class="ngst-abtitle${navBtn ? ' nav' : ''}">${c.safe(title)}</span><span class="ngst-actions">${actions}</span></div>${bar}${body}${drawer(c)}<i class="ngst-edge" aria-hidden="true"></i></div>`;
  }

  // The drawer follows a drag from the start edge (DrawerLayout's 20 dp edge) and settles open or shut.
  function mountDrawer(c, root) {
    const host = root.querySelector('.ngst'), dr = root.querySelector('.ngst-drawer'), panel = root.querySelector('.ngst-dpanel'), scrim = root.querySelector('.ngst-scrim');
    if (!host || !dr || !panel) return;
    const dp = () => c.el.screen.clientWidth / 411.43;
    const set = (x, animate) => {
      const w = panel.offsetWidth, k = Math.max(0, Math.min(1, x / w));
      panel.style.transition = scrim.style.transition = animate ? 'transform .25s cubic-bezier(.4,0,.2,1), opacity .25s' : 'none';
      panel.style.transform = `translateX(${(k - 1) * 100}%)`; scrim.style.opacity = String(k);
      dr.classList.toggle('dragging', k > 0);
    };
    let drag = null;
    const start = (event, open) => {
      drag = {x0: event.clientX, base: open ? panel.offsetWidth : 0, id: event.pointerId, moved: false};
      dr.classList.add('dragging');
    };
    host.querySelector('.ngst-edge')?.addEventListener('pointerdown', event => { if (!state(c).drawer) start(event, false); });
    panel.addEventListener('pointerdown', event => { if (state(c).drawer) { drag = {x0: event.clientX, base: panel.offsetWidth, id: event.pointerId, moved: false, panel: true}; } });
    const move = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x0;
      if (!drag.moved && Math.abs(dx) < 8 * dp()) return;
      if (drag.panel && !drag.moved && dx > 0) { drag = null; return; }
      drag.moved = true; event.preventDefault();
      set(drag.base + dx, false);
    };
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.moved) { if (!d.panel) set(0, true); return; }
      const x = d.base + (event.clientX - d.x0), open = x > panel.offsetWidth / 2;
      set(open ? panel.offsetWidth : 0, true);
      const st = state(c);
      if (st.drawer !== open) { st.drawer = open; setTimeout(() => dr.classList.toggle('open', open), 250); }
      // A drag ends without a click on what is under the pointer.
      window.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); }, {capture: true, once: true});
      setTimeout(() => { if (!state(c).drawer) dr.classList.remove('dragging'); }, 260);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    host._cleanup = () => { window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', end, true); window.removeEventListener('pointercancel', end, true); };
  }
  let cleanup = null;
  function mount(c, root) {
    cleanup?.(); cleanup = null;
    const cur = current(c), st = state(c), key = cur?.screen || `dashboard:${st.tab || 0}`;
    for (const content of root.querySelectorAll('.ngst-content')) {
      if (content.classList.contains('ngst-dpanel')) continue;
      const k = content.dataset.page ? `dashboard:${content.dataset.page}` : key;
      content.scrollTop = st.scroll?.[k] || 0;
      content.addEventListener('scroll', () => { (st.scroll ||= {})[k] = content.scrollTop; }, {passive: true});
    }
    mountDrawer(c, root);
    cleanup = root.querySelector('.ngst')?._cleanup || null;
    if (st.drawerAnim) { st.drawerAnim = false; const p = root.querySelector('.ngst-dpanel'), s = root.querySelector('.ngst-scrim'); p?.animate([{transform: 'translateX(-100%)'}, {transform: 'none'}], {duration: 250, easing: 'cubic-bezier(.4,0,.2,1)'}); s?.animate([{opacity: 0}, {opacity: 1}], {duration: 250}); }
    if (!cur) mountPager(c, root);
    custom(cur)?.mount?.(c, root, cur);
    if (cur?.xml) NG.settingsHooks[cur.xml]?.mount?.(c, root, cur);
  }
  // The ViewPager: a horizontal drag moves between All and Support.
  function mountPager(c, root) {
    const pager = root.querySelector('.ngst-pager'), ind = root.querySelector('.ngst-tabind');
    if (!pager) return;
    let drag = null;
    pager.addEventListener('pointerdown', event => { if (event.button > 0) return; drag = {x: event.clientX, y: event.clientY, id: event.pointerId, active: false}; });
    pager.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x, dy = event.clientY - drag.y, w = pager.clientWidth, tab = state(c).tab || 0;
      if (!drag.active) { if (Math.abs(dx) < 8 * w / 411 || Math.abs(dx) < Math.abs(dy)) return; drag.active = true; pager.setPointerCapture?.(event.pointerId); }
      const off = Math.max(-1, Math.min(0, -tab + dx / w));
      pager.style.transition = 'none'; pager.style.transform = `translateX(${off * 100}%)`;
      if (ind) { ind.style.transition = 'none'; ind.style.transform = `translateX(${-off * 100}%)`; }
    });
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const d = drag; drag = null;
      if (!d.active) return;
      const dx = event.clientX - d.x, st = state(c), tab = st.tab || 0, w = pager.clientWidth;
      const next = Math.abs(dx) > w / 4 ? Math.max(0, Math.min(1, tab + (dx < 0 ? 1 : -1))) : tab;
      pager.style.transition = ''; pager.style.transform = ''; if (ind) { ind.style.transition = ''; ind.style.transform = ''; }
      window.addEventListener('click', e => { e.stopPropagation(); e.preventDefault(); }, {capture: true, once: true});
      if (next !== tab) { st.tab = next; c.render(); }
    };
    pager.addEventListener('pointerup', end); pager.addEventListener('pointercancel', end);
  }

  NG.register('settings', {
    title: 'Settings',
    // The status bar behind the window: colorPrimaryDark, or what a page of its own theme puts there (the GLIF pages).
    statusColor: c => custom(current(c))?.statusColor?.(c) || NG.settingsTheme?.colorPrimaryDark || '#21272b',
    // A page laid out under the status bar (SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN, e.g. FaceLock's setup).
    underStatus: c => !!custom(current(c))?.underStatus?.(c),
    render, mount,
    page(c) {
      const st = state(c), stack = c.ui.sub && c.ui.sub !== st.opened ? [{screen: ALIASES[c.ui.sub] || c.ui.sub}] : st.stack;
      return NG.page('settings', ...stack.map(x => String(x.screen)));
    },
    reset(c) { c.ui.settings = null; },
    back(c) {
      const st = state(c), cur = current(c);
      if (st.drawer) { st.drawer = false; c.transition('none'); c.render(); return true; }
      if (st.searching) { st.searching = false; c.render(); return true; }
      if (custom(cur)?.back?.(c, cur)) return true;
      if (st.stack.length > (st.opened ? 1 : 0)) { st.stack.pop(); c.render(); return true; }
      c.ui.settings = null; return false;
    },
    action(name, el, event, c) {
      const st = state(c), cur = current(c), scr = custom(cur);
      if (scr?.action?.(c, name, el, cur)) return true;
      if (cur?.xml && NG.settingsHooks[cur.xml]?.action?.(c, name, el, cur)) return true;
      if (name === 'ngst-up') { if (!this.back(c)) c.back(); return true; }
      if (name === 'ngst-menu') { st.drawer = true; st.drawerAnim = true; c.transition('none'); c.render(); return true; }
      if (name === 'ngst-dclose') { st.drawer = false; c.transition('none'); c.render(); return true; }
      if (name === 'ngst-dhome') {
        st.drawer = false;
        if (st.stack.length && st.stack.at(-1).screen !== 'dashboard') st.stack.push({screen: 'dashboard', title: '', nav: ''});
        c.render(); return true;
      }
      if (name === 'ngst-dtile' || name === 'ngst-tile') {
        const t = NG.settingsDashboard.tiles.find(x => x.cls === el.dataset.cls);
        if (t) openTile(c, t, name === 'ngst-tile' || !st.stack.length || st.stack.at(-1).screen === 'dashboard');
        return true;
      }
      if (name === 'ngst-tab') { st.tab = +el.dataset.tab; c.transition('none'); c.render(); return true; }
      if (name === 'ngst-cond-exp') { st.cond = st.cond === el.dataset.cond ? '' : el.dataset.cond; c.transition('none'); c.render(); return true; }
      if (name === 'ngst-cond') {
        const cond = CONDITIONS.find(x => x.id === el.dataset.cond);
        if (st.cond !== cond.id) { st.cond = cond.id; c.transition('none'); c.render(); return true; }
        // onPrimaryClick: the condition's settings (Do not disturb: the quick settings panel's detail).
        if (cond.open === 'shade-dnd') { NG.shadeOpenDetail ? NG.shadeOpenDetail(c, 'dnd') : c.open('settings', 'zen'); return true; }
        go(c, cond.open, '', topLevel(cond.open) ? 'menu' : 'up'); return true;
      }
      if (name === 'ngst-cond-act') { const cond = CONDITIONS.find(x => x.id === el.dataset.cond); cond.act(c); st.cond = ''; c.transition('none'); c.render(); return true; }
      if (name === 'ngst-sugg-toggle') {
        const n = suggestions(c).length, mode = st.suggMode || 0;
        st.suggMode = mode === 1 || (mode === 0 && n > 2) ? 2 : 1; c.transition('none'); c.render(); return true;
      }
      if (name === 'ng-menu' && el.classList.contains('ngst-sugg-more')) {
        const t = suggestions(c).find(x => x.cls === el.dataset.cls);
        c.menu([{label: T().t('suggestion_remove'), action: c => { dismissSuggestion(c, t); c.render(); }}], el);
        return true;
      }
      if (name === 'ngst-sugg') {
        const t = suggestions(c).find(x => x.cls === el.dataset.cls);
        if (!t) return true;
        const target = t.FRAGMENT_CLASS ? screenOf(t.FRAGMENT_CLASS) : {
          'Settings$FingerprintEnrollSuggestionActivity': 'fingerprint-enroll', 'Settings$ScreenLockSuggestionActivity': 'lock-chooser',
          'Settings$FingerprintSuggestionActivity': 'fingerprint-enroll', 'WallpaperSuggestionActivity': 'app:wallpapers'}[t.cls];
        if (target === 'app:wallpapers') { c.open('wallpapers'); return true; }
        if (t.pkg === 'com.google.android.gm') { c.open('gmail', 'add-account'); return true; }
        if (t.pkg === 'com.google.android.googlequicksearchbox') { c.open('search', 'hotword'); return true; }
        go(c, target || `missing:${t.cls}`, T().t(t.title), 'up'); return true;
      }
      if (name === 'ngst-support') {
        const kind = el.dataset.kind;
        // SupportFeatureProviderImpl: "Search help & send feedback" starts GoogleHelp with the settings help context.
        if (kind === 'help') { c.open('help', 'settings'); return true; }
        // SupportFeatureProviderImpl.getTipsAndTricksIntent: settingsgoogle:tips_and_tricks_url, by default www.android.com, in a new tab.
        if (kind === 'tips') { c.open('chrome', 'url:https://www.android.com/'); return true; }
        NG.settingsSupportEscalation ? NG.settingsSupportEscalation(c, kind) : go(c, `support:${kind}`, ''); return true;
      }
      if (name === 'ngst-search') { NG.settingsSearch ? NG.settingsSearch(c) : go(c, 'search', T().t('search_menu'), 'up'); return true; }
      if (name === 'ngst-pref' && cur?.xml) {
        const n = (el.dataset.node !== undefined ? nodeAt(X()[cur.xml], el.dataset.node) : findKey(X()[cur.xml], el.dataset.key)) || {};
        const hook = NG.settingsHooks[cur.xml] || {};
        if (hook.click?.(c, n.key ?? el.dataset.key, n) === true) return true;
        if (isSwitch(n) || isCheck(n) || hook.switch?.includes(n.key)) { const v = !value(c, n); setValue(c, n, v); hook.changed?.(c, n.key, v, n); c.transition('none'); c.render(); return true; }
        if (isList(n)) { listDialog(c, n, cur.xml); return true; }
        if (n.t === 'EditTextPreference') { textDialog(c, n, cur.xml); return true; }
        if (n.fragment) { go(c, screenOf(n.fragment), str(n.title)); return true; }
        if (n.intent?.action === 'android.settings.SYSTEM_UPDATE_SETTINGS') { go(c, 'system-update', ''); return true; }
        if (n.t === 'PreferenceScreen' && n.c && !n.fragment) { go(c, `xml:${cur.xml}#${n.key}`, str(n.title)); return true; }
        if (n.intent) { const target = screenOf(n.intent.targetClass); go(c, target && !target.startsWith('missing:') ? target : `missing:${n.intent.targetClass || n.intent.action || ''}`, str(n.title)); return true; }
        return true;
      }
      return false;
    }
  });
})();
