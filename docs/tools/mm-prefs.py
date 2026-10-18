"""Android 6.0.1: the Settings app's preference screens from the Nexus 5X image (Settings.apk res/xml, MTC20K).

    python docs/tools/mm-prefs.py

Writes
  versions/6.0.1/mm-settings-data.js   MM.settingsXml = {<xml name>: node}; a node is {t: tag, key, title, summary, …,
                                       c: [children]} with every resource reference by name ("string/wifi_settings",
                                       "array/…"), entryValues as their values; an icon is {icon, tint?} naming its asset;
                                       MM.settingsLabels = {activity: its android:label}; MM.settingsTheme = the colours
                                       of Theme.Settings (docs/tools/apk_theme.py); MM.settingsRingtones = the
                                       system sounds' titles and defaults
  versions/6.0.1/mm-strings-settings.js  the strings and arrays those screens name (docs/tools/mm-strings.py)
  docs/data/mm-assets-settings.tsv, docs/data/mm-vectors-settings.tsv  the drawables they name: a bitmap drawable of an
                                       *_alpha PNG tinted by an attribute (the dashboard's icons) is the PNG and the
                                       resolved tint, a vector goes to mm-vectors.py, a PNG to mm-assets.py
The configuration is the 5X's: res/xml (no other variant applies to a phone). Do not edit the outputs."""
import importlib.util, json, os, re, subprocess, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apk_theme import Themes

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + '_aosp/bullhead/system/'
APKPATH = 'priv-app/Settings/Settings.apk'
AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
ST = APK(SYSTEM + APKPATH)
RS, RF = ST.get_android_resources(), APK(SYSTEM + 'framework/framework-res.apk').get_android_resources()
THEMES = Themes(SYSTEM)
NS = '{http://schemas.android.com/apk/res/android}'
APP_THEME = ST.get_android_manifest_xml().find('application').get(NS + 'theme')
ATTRS = ['key', 'title', 'summary', 'summaryOn', 'summaryOff', 'entries', 'entryValues', 'dependency', 'defaultValue', 'icon',
         'dialogTitle', 'dialogMessage', 'order', 'disableDependentsState', 'persistent', 'enabled', 'selectable', 'layout',
         'widgetLayout', 'fragment', 'switchTextOn', 'switchTextOff', 'max', 'id', 'positiveButtonText', 'negativeButtonText',
         'ringtoneType', 'showDefault', 'showSilent', 'singleLine', 'inputType', 'password']
SKIP = {'appwidget_info', 'file_paths'}
EXTRA = ['settings_label_launcher', 'search_menu', 'framework/cancel', 'framework/ok',
         'switch_on_text', 'switch_off_text', 'status_unavailable',
         # DisplaySettings
         'display_auto_rotate_rotate', 'display_auto_rotate_stay_in_portrait', 'screensaver_settings_summary_off',
         # WifiSettings, AccessPoint, WifiConfigController, SavedAccessPointsWifiSettings
         'wifi_settings', 'wifi_empty_list_wifi_off', 'wifi_starting', 'wifi_stopping', 'wifi_empty_list_wifi_on', 'wifi_add_network',
         'wifi_saved_access_points_label', 'wifi_saved_access_points_titlebar', 'menu_stats_refresh', 'wifi_menu_advanced',
         'wifi_advanced_titlebar', 'wifi_menu_connect', 'wifi_menu_forget', 'wifi_menu_modify', 'wifi_remembered', 'wifi_not_in_range',
         'wifi_status', 'wifi_signal', 'wifi_speed', 'link_speed+args1', 'wifi_frequency', 'wifi_band_24ghz', 'wifi_band_5ghz',
         'wifi_security', 'wifi_security_none', 'wifi_security_wpa2', 'wifi_password', 'wifi_show_password', 'wifi_show_advanced',
         'wifi_connect', 'wifi_forget', 'wifi_cancel', 'wifi_save', 'wifi_ssid', 'wifi_ssid_hint', 'wifi_ip_settings',
         'proxy_settings_title', 'array:wifi_status', 'array:wifi_signal', 'array:wifi_security', 'array:wifi_ip_settings',
         'array:wifi_proxy_settings',
         # BluetoothSettings, BluetoothDevicePreference, CachedBluetoothDevice, BluetoothPairingDialog, DeviceProfilesSettings,
         # BluetoothNameDialogFragment
         'bluetooth_settings', 'bluetooth_empty_list_bluetooth_off', 'bluetooth_turning_on', 'bluetooth_preference_paired_devices',
         'bluetooth_preference_found_devices', 'bluetooth_is_visible_message+args1', 'bluetooth_search_for_devices',
         'bluetooth_searching_for_devices', 'bluetooth_rename_device', 'bluetooth_show_received_files', 'bluetooth_no_devices_found',
         'bluetooth_pairing', 'bluetooth_connected', 'bluetooth_connecting', 'bluetooth_device_details', 'bluetooth_disconnect_title',
         'bluetooth_disconnect_all_profiles+args1', 'bluetooth_pairing_request+args1', 'bluetooth_pairing_accept',
         'bluetooth_pairing_decline', 'bluetooth_pairing_key_msg', 'bluetooth_pairing_shares_phonebook+args1', 'bluetooth_rename_button',
         'progress_scanning', 'bluetooth_preference_paired_dialog_name_label', 'bluetooth_device_advanced_profile_header_title',
         'bluetooth_profile_headset', 'bluetooth_profile_a2dp', 'bluetooth_profile_pbap', 'forget', 'okay', 'cancel',
         # DeviceInfoSettings, Status, SimStatus, ImeiInformation, RegulatoryInfoDisplayActivity, Utils.getBatteryStatus
         'plurals:show_dev_countdown', 'show_dev_on', 'show_dev_already', 'battery_info_status_discharging',
         'battery_info_status_charging', 'battery_info_status_full', 'sim_signal_strength+args2', 'device_info_default',
         'radioInfo_service_in', 'radioInfo_service_off', 'radioInfo_roaming_not', 'radioInfo_data_connected',
         'radioInfo_data_disconnected', 'regulatory_information',
         # NotificationSettings, OtherSoundSettings
         'lock_screen_notifications_summary_show', 'lock_screen_notifications_summary_hide', 'lock_screen_notifications_summary_disable',
         'manage_notification_access_summary_zero', 'muted_by+args1',
         # ZenModeSettings, ZenModePrioritySettings, ZenModeAutomationSettings (the default rules' names are the framework's)
         'join_many_items_middle+args2', 'zen_mode_alarms', 'zen_mode_reminders', 'zen_mode_events', 'zen_mode_selected_callers',
         'zen_mode_selected_messages', 'zen_mode_from_anyone', 'zen_mode_from_contacts', 'zen_mode_from_starred', 'zen_mode_from_none',
         'zen_mode_repeat_callers_summary+args1', 'zen_mode_add_rule', 'zen_mode_automation_settings_title',
         'framework/zen_mode_default_weeknights_name', 'framework/zen_mode_default_weekends_name',
         'framework/zen_mode_default_events_name',
         # ManageApplications, InstalledAppDetails, AppStorageSettings, the permission summary (PackageInstaller's group labels
         # are the framework's permgrouplab_*)
         'applications_settings', 'application_info_label', 'filter_all_apps', 'filter_enabled_apps', 'filter_apps_disabled',
         'advanced_apps', 'menu_show_system', 'menu_hide_system', 'reset_app_preferences', 'reset_app_preferences_title',
         'reset_app_preferences_desc', 'reset_app_preferences_button', 'no_applications', 'disabled', 'version_text+args1',
         'uninstall_text', 'disable_text', 'enable_text', 'force_stop', 'force_stop_dlg_title', 'force_stop_dlg_text', 'dlg_ok',
         'dlg_cancel', 'app_disable_dlg_text', 'app_disable_dlg_positive', 'storage_summary_format+args2', 'storage_type_internal',
         'no_data_usage', 'runtime_permissions_summary_no_permissions_granted', 'runtime_permissions_summary_no_permissions_requested',
         'notifications_enabled', 'launch_defaults_none', 'no_battery_summary', 'no_memory_use_summary', 'computing_size',
         'framework/permgrouplab_calendar', 'framework/permgrouplab_camera', 'framework/permgrouplab_contacts',
         'framework/permgrouplab_location', 'framework/permgrouplab_microphone', 'framework/permgrouplab_phone',
         'framework/permgrouplab_sensors', 'framework/permgrouplab_sms', 'framework/permgrouplab_storage',
         # SecuritySettings, ChooseLockGeneric / Password / Pattern, ConfirmLockPassword / Pattern, EncryptionInterstitial,
         # RedactionInterstitial, OwnerInfoSettings, GMS Core's Smart Lock trust agent
         'lock_after_timeout_summary+args1', 'disabled_because_no_backup_security', 'security_settings_fingerprint_preference_title',
         'security_settings_fingerprint_preference_summary_none', 'credential_storage_type_hardware', 'PrebuiltGmsCore/auth_google_trust_agent_title',
         'owner_info_settings_title', 'save', 'current_screen_lock', 'unlock_set_unlock_mode_off', 'unlock_set_unlock_mode_none',
         'unlock_set_unlock_mode_pattern', 'unlock_set_unlock_mode_pin', 'unlock_set_unlock_mode_password',
         'lockpassword_choose_your_password_header', 'lockpassword_choose_your_pin_header', 'lockpassword_choose_your_pattern_header',
         'lockpassword_confirm_your_password_header', 'lockpassword_confirm_your_pin_header', 'lockpassword_confirm_your_pattern_header',
         'lockpassword_confirm_passwords_dont_match', 'lockpassword_confirm_pins_dont_match', 'lockpassword_continue_label',
         'lockpassword_cancel_label', 'lockpassword_ok_label', 'lockpassword_press_continue', 'lockpassword_password_too_short+args1',
         'lockpassword_pin_too_short+args1', 'lockpassword_password_too_long+args1', 'lockpassword_pin_too_long+args1',
         'lockpassword_pin_contains_non_digits', 'lockpassword_password_requires_alpha', 'lockpassword_illegal_character',
         'lockpattern_recording_intro_header', 'lockpattern_recording_inprogress', 'lockpattern_recording_incorrect_too_short+args1',
         'lockpattern_pattern_entered_header', 'lockpattern_need_to_confirm', 'lockpattern_need_to_unlock_wrong',
         'lockpattern_pattern_confirmed_header', 'lockpattern_retry_button_text', 'lockpattern_continue_button_text',
         'lockpattern_confirm_button_text', 'lockpattern_tutorial_cancel_label', 'lockpassword_confirm_your_password_generic',
         'lockpassword_confirm_your_pin_generic', 'lockpassword_confirm_your_pattern_generic', 'lockpassword_invalid_password',
         'lockpassword_invalid_pin', 'encryption_interstitial_header', 'encryption_interstitial_message_pin',
         'encryption_interstitial_message_pattern', 'encryption_interstitial_message_password', 'encrypt_require_pin',
         'encrypt_require_pattern', 'encrypt_require_password', 'encrypt_dont_require_pin', 'encrypt_dont_require_pattern',
         'encrypt_dont_require_password', 'encryption_continue_button', 'lock_screen_notifications_interstitial_title',
         'lock_screen_notifications_interstitial_message', 'unlock_disable_frp_warning_title', 'unlock_disable_frp_warning_content_pin',
         'unlock_disable_frp_warning_content_pattern', 'unlock_disable_frp_warning_content_password', 'unlock_disable_frp_warning_ok',
         'lock_after_timeout_summary_with_exception+args2', 'lock_immediately_summary_with_exception+args1',
         'lockpattern_settings_power_button_instantly_locks_summary+args1', 'install_all_warning',
         # PrivacySettings, LocationSettings / LocationMode / RecentLocationApps (GMS Core's injected Location History),
         # InputMethodAndLanguageSettings (LatinImeGoogle's and Velvet's input methods), UserSettings
         'accessibility_feature_state_on', 'accessibility_feature_state_off', 'backup_configure_account_default_summary',
         'location_mode_high_accuracy_title', 'location_mode_battery_saving_title', 'location_mode_sensors_only_title',
         'location_mode_location_off_title', 'location_mode_screen_title', 'location_no_recent_apps', 'location_menu_scanning',
         'location_scanning_screen_title', 'location_high_battery_use', 'location_low_battery_use',
         'PrebuiltGmsCore/location_ulr_setting_label', 'LatinImeGoogle/english_ime_name', 'LatinImeGoogle/spell_checker_service_name',
         'LatinImeGoogle/subtype_en_US', 'Velvet/ime_service_label', 'Velvet/voice_ime_language_auto', 'user_you+args1', 'user_owner',
         'user_guest', 'user_add_user_menu', 'user_add_user_title', 'user_add_user_message_long', 'user_setup_dialog_title',
         'user_setup_dialog_message', 'user_setup_button_setup_now', 'user_setup_button_setup_later', 'user_new_user_name',
         'user_summary_not_set_up', 'user_add_on_lockscreen_menu', 'ok',
         # AccessibilitySettings (the image's services: talkback.apk's TalkBack and Switch Access), PrintSettingsFragment
         # (CloudPrint2's Cloud Print)
         'accessibility_global_gesture_preference_summary_off', 'accessibility_global_gesture_preference_summary_on',
         'talkback/talkback_title', 'talkback/switch_service_name', 'CloudPrint2/app_name', 'print_feature_state_on',
         'print_feature_state_off', 'mock_location_app_not_set', 'debug_app_not_set', 'adb_warning_title', 'adb_warning_message',
         'dev_settings_warning_title', 'dev_settings_warning_message', 'android_beam_on_summary', 'android_beam_off_summary',
         # PrivateVolumeSettings
         'storage_detail_apps', 'storage_detail_images', 'storage_detail_videos', 'storage_detail_audio', 'storage_detail_other',
         'storage_detail_cached', 'storage_menu_explore', 'storage_volume_used+args1', 'storage_size_large', 'framework/storage_internal',
         'memory_clear_cache_title', 'memory_clear_cache_message', 'storage_detail_dialog_other',
         # PowerUsageSummary, BatteryEntry, BatterySaverSettings, Utils.formatPercentage
         'power_usage_summary_title', 'power_discharging_duration+args2', 'power_charging+args2', 'power_screen', 'power_cell', 'power_idle',
         'power_wifi', 'process_kernel_label', 'framework/android_system_label', 'PrebuiltGmsCore/common_app_name', 'battery_saver',
         'high_power_apps', 'battery_saver_turn_on_automatically_never', 'battery_saver_turn_on_automatically_pct+args1',
         # ProcessStatsBase / ProcessStatsSummary
         'memory_settings_title', 'app_list_memory_use', 'menu_duration_3h', 'menu_duration_6h', 'menu_duration_12h', 'menu_duration_1d',
         'array:ram_states', 'plurals:memory_usage_apps_summary',
         # DataUsageSummary
         'data_usage_summary_title', 'data_usage_enable_mobile', 'data_usage_disable_mobile_limit', 'data_usage_sweep_warning', 'data_usage_disclaimer',
         'data_usage_menu_restrict_background', 'data_usage_menu_show_wifi', 'data_usage_menu_cellular_networks', 'data_usage_tab_wifi',
         'data_usage_restrict_background_title', 'data_usage_restrict_background', 'data_usage_disable_mobile', 'data_usage_limit_dialog_title',
         'data_usage_limit_dialog_mobile', 'data_usage_app_summary_title', 'data_usage_cycle_editor_title',
         # AccountSettings, ChooseAccountActivity (the authenticators of GMS Core and Gmail)
         'add_account_label', 'header_add_an_account', 'data_usage_menu_auto_sync', 'data_usage_auto_sync_on_dialog_title',
         'data_usage_auto_sync_on_dialog', 'data_usage_auto_sync_off_dialog_title', 'data_usage_auto_sync_off_dialog',
         'PrebuiltGmsCore/auth_gls_label', 'PrebuiltGmail/exchange_eas_name', 'PrebuiltGmail/imap_name', 'PrebuiltGmail/pop3_name',
         # PaymentSettings
         'nfc_payment_settings_title', 'nfc_payment_default', 'nfc_payment_default_not_set', 'nfc_payment_use_default', 'nfc_payment_favor_default',
         'nfc_payment_favor_open', 'nfc_payment_pay_with',
         # DreamSettings, WallpaperTypeSettings (the image's dreams and SET_WALLPAPER activities)
         'screensaver_settings_title', 'screensaver_settings_dream_start', 'screensaver_settings_when_to_dream', 'screensaver_settings_summary_dock',
         'screensaver_settings_summary_sleep', 'screensaver_settings_summary_either_short', 'screensaver_settings_disabled_prompt',
         'BasicDreams/color_dream_name', 'LiveWallpapersPicker/live_wallpaper_picker_label', 'Photos/photos_setwallpaper_app_name',
         'Velvet/pick_wallpaper', 'wallpaper_settings_fragment_title', 'Photos/photos_theme_google_photos',
         # GooglePackageInstaller's AppPermissionsFragment, ManagePermissionsFragment, PermissionAppsFragment
         'GooglePackageInstaller/app_permissions', 'GooglePackageInstaller/app_permissions_group_summary+args2',
         'GooglePackageInstaller/system_warning', 'GooglePackageInstaller/grant_dialog_button_deny', 'GooglePackageInstaller/cancel',
         'GooglePackageInstaller/permission_title+args1', 'GooglePackageInstaller/menu_show_system', 'app_permissions',
         # HighPowerApps, HighPowerDetail
         'high_power_on', 'high_power_off', 'high_power_filter_on', 'high_power_system', 'ignore_optimizations_on', 'ignore_optimizations_on_desc',
         'ignore_optimizations_off', 'ignore_optimizations_off_desc', 'done']
# The texts the code of the other screens uses (docs/data/mm-settings-extra.txt: names as above, '#' starts a comment).
EXTRA += [w for line in open(ROOT + 'docs/data/mm-settings-extra.txt', encoding='utf-8') for w in line.split('#', 1)[0].split()]
strings, arrays, drawables = set(), set(), {}


def name_of(value):
    if not isinstance(value, str) or not re.fullmatch(r'@(android:)?[0-9A-Fa-f]{8}', value): return None
    rid = int(value[-8:], 16)
    res = RF if rid >> 24 == 1 else RS
    n = res.get_resource_xml_name(rid)
    return (('framework' if rid >> 24 == 1 else 'Settings'), n.split(':', 1)[-1].lstrip('@')) if n else None


def drawable(apk, key):
    """The asset for a drawable: {icon: file, tint?: colour}."""
    if (apk, key) in drawables: return drawables[(apk, key)]
    path = APKPATH if apk == 'Settings' else 'framework/framework-res.apk'
    out = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + path, '--file', f'res/drawable/{key}.xml'], capture_output=True, text=True).stdout
    prefix = 'st-' if apk == 'Settings' else 'fw-'
    if out.strip():
        root = re.search(r'E: ([\w.-]+)', out).group(1)
        if root == 'bitmap':
            src = re.search(r'src\(0x01010119\)=@(0x[0-9a-f]{8})', out).group(1)
            tint = re.search(r'tint\(0x01010121\)=\?(0x[0-9a-f]{8})', out)
            res = RF if src.startswith('0x01') else RS
            png = res.get_resource_xml_name(int(src, 16)).split('/')[-1]
            color = THEMES.attr(APKPATH, APP_THEME, tint.group(1)) if tint else None
            info = {'icon': f'{prefix}{png}.png', 'kind': 'png', 'res': png, 'path': path}
            if color: info['tint'] = '#' + color[-6:]
        elif root == 'vector':
            info = {'icon': f'{prefix}{key}.svg', 'kind': 'vector', 'res': key, 'path': path}
            # A vector tinted by a theme attribute (the framework's ic_audio_* in ?colorControlNormal): SRC_IN in its colour.
            # A path filled with a theme attribute (ic_schedule's ?colorControlNormal) the same way.
            tint = re.search(r'tint\(0x01010121\)=\?(0x[0-9a-f]{8})', out) or re.search(r'fillColor\(0x01010404\)=\?(0x[0-9a-f]{8})', out)
            if tint: info['theme'] = 'tint=' + THEMES.attr(APKPATH, APP_THEME, tint.group(1))
        else:
            info = {'icon': None, 'kind': root}
    else:
        info = {'icon': f'{prefix}{key}.png', 'kind': 'png', 'res': key, 'path': path}
    drawables[(apk, key)] = info
    return info


def ref(value):
    hit = name_of(value)
    if not hit: return value
    apk, name = hit
    kind, key = name.split('/', 1)
    # A framework resource keeps its table key's prefix ("string/framework/bugreport_title").
    pre = 'framework/' if apk == 'framework' else ''
    if kind == 'string': strings.add((key, apk)); return f'string/{pre}{key}'
    if kind == 'array': arrays.add((key, apk)); return f'array/{pre}{key}'
    if kind == 'drawable' or kind == 'mipmap':
        d = drawable(apk, key)
        return {k: v for k, v in d.items() if k in ('icon', 'tint')}
    return name


def values(value):
    rid = int(value[1:], 16)
    res = RF if rid >> 24 == 1 else RS
    for config, entry in res.get_res_configs(rid):
        if (config.get_qualifier() or '') == '':
            return [res.stringpool_main.getString(i.data) if i.data_type == 3 else str(i.data) for _, i in entry.item.items]
    return []


def node(e):
    out = {'t': e.tag.split('.')[-1]}
    for k, v in e.attrib.items():
        name = k.split('}')[-1]
        if name == 'entryValues' and isinstance(v, str) and v.startswith('@'): out[name] = values(v)
        elif name in ATTRS: out[name] = ref(v)
    kids = []
    for ch in e:
        if ch.tag == 'intent': out['intent'] = {k.split('}')[-1]: v for k, v in ch.attrib.items()}
        elif ch.tag == 'extra': out.setdefault('extras', {})[ch.get(NS + 'name')] = ch.get(NS + 'value')
        else: kids.append(node(ch))
    if kids: out['c'] = kids
    return out


def ringtones():
    """The sounds MediaScanner finds in system/media/audio (their Vorbis TITLE), in MediaStore's title order, and the
    defaults build.prop names (ro.config.ringtone, notification_sound, alarm_alert)."""
    out, props = {}, dict(l.split('=', 1) for l in open(SYSTEM + 'build.prop', encoding='utf-8').read().splitlines() if '=' in l and not l.startswith('#'))
    for kind, folder, prop in (('ringtone', 'ringtones', 'ro.config.ringtone'), ('notification', 'notifications', 'ro.config.notification_sound'),
                               ('alarm', 'alarms', 'ro.config.alarm_alert')):
        titles = {}
        for f in sorted(os.listdir(SYSTEM + 'media/audio/' + folder)):
            m = re.search(rb'TITLE=([^\x00-\x1f]*)', open(SYSTEM + 'media/audio/' + folder + '/' + f, 'rb').read(20000), re.I)
            titles[f] = m.group(1).decode('utf-8') if m else os.path.splitext(f)[0]
        out[kind] = {'titles': sorted(titles.values(), key=str.lower), 'default': titles.get(props.get(prop, ''), '')}
    return out


def main():
    data = {}
    for path in sorted(p for p in ST.get_files() if re.fullmatch(r'res/xml/\w+\.xml', p)):
        name = path[8:-4]
        if name in SKIP: continue
        data[name] = node(AXMLPrinter(ST.get_file(path)).get_xml_obj())
    labels = {}
    for act in ST.get_android_manifest_xml().iter('activity'):
        lab = act.get(NS + 'label')
        if lab: labels[act.get(NS + 'name').split('.')[-1]] = ref(lab)
    theme = {a: (THEMES.attr(APKPATH, APP_THEME, a) or '')[-6:] for a in ('colorAccent', 'colorPrimary', 'colorPrimaryDark', 'windowBackground')}
    head = ('/* Generated by docs/tools/mm-prefs.py from the Nexus 5X MTC20K image\'s Settings.apk res/xml: every preference screen\n'
            '   with its resources by name (the texts are in mm-strings-settings.js). Do not edit. */\n')
    open(ROOT + 'versions/6.0.1/mm-settings-data.js', 'w', encoding='utf-8', newline='\n').write(
        head + 'MM.settingsXml = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
        + 'MM.settingsLabels = ' + json.dumps(labels, ensure_ascii=False, separators=(',', ':')) + ';\n'
        + 'MM.settingsTheme = ' + json.dumps({k: '#' + v for k, v in theme.items()}) + ';\n'
        + 'MM.settingsRingtones = ' + json.dumps(ringtones(), ensure_ascii=False, separators=(',', ':')) + ';\n')
    spec = importlib.util.spec_from_file_location('mm_strings', ROOT + 'docs/tools/mm-strings.py')
    ms = importlib.util.module_from_spec(spec); spec.loader.exec_module(ms)
    keys = [n if apk == 'Settings' else f'framework/{n}' for n, apk in sorted(strings)]
    # The dashboard's external tile: GMS Core's GoogleSettingsLink (category personal, its label and settings icon).
    keys.append('PrebuiltGmsCore/common_google_platform_settings')
    # Texts the Settings code shows itself (titles, dialog buttons, summaries it formats), kept with the screens'.
    for extra in EXTRA:
        if extra not in keys: keys.append(extra)
    keys += [f'array:{n}' if apk == 'Settings' else f'array:framework/{n}' for n, apk in sorted(arrays)]
    ms.build('settings', {'apks': ['Settings', 'framework'], 'keys': keys}, {})
    png = ['# Settings drawables named by its preference screens (written by docs/tools/mm-prefs.py)']
    vec = ['# Settings vector drawables named by its preference screens (written by docs/tools/mm-prefs.py)',
           'gms-ic_google_settings.svg	priv-app/PrebuiltGmsCore/PrebuiltGmsCore.apk	ic_google_settings	-']
    # Drawables the Settings code sets itself: AccessPointPreference's wifi_signal (a level list of ic_wifi_signal_1..4
    # with ic_wifi_signal_lock layered over a secured network), every path in ?wifi_signal_color (#009688).
    for name in ['ic_wifi_signal_1', 'ic_wifi_signal_2', 'ic_wifi_signal_3', 'ic_wifi_signal_4', 'ic_wifi_signal_lock']:
        vec.append(f'st-{name}.svg	{APKPATH}	{name}	tint=#ff' + THEMES.attr(APKPATH, APP_THEME, 'wifi_signal_color')[-6:])
    # wifi_advanced_toggle's ic_expand: ic_expand_more, checked ic_expand_less, in the dialog's colorControlNormal.
    for name in ['ic_expand_more', 'ic_expand_less']:
        vec.append(f'st-{name}.svg	{APKPATH}	{name}	tint=#8a000000')
    # Bitmaps the Settings code sets itself: BluetoothDevicePreference's class icons and preference_bluetooth's gear.
    # Location's injected setting: GMS Core's Google Location History with its ic_google icon.
    png.append('gms-ic_google.png\tpriv-app/PrebuiltGmsCore/PrebuiltGmsCore.apk\tdrawable/ic_google')
    # ChooseAccountActivity's Google account type (GMS Core's authenticator icon).
    png.append('gms-auth_gls_ic_google_selected.png	priv-app/PrebuiltGmsCore/PrebuiltGmsCore.apk	drawable/auth_gls_ic_google_selected')
    # DreamSettings' Colors (BasicDreams) and WallpaperTypeSettings' Live Wallpapers and Wallpapers (the activities' icons).
    png.append('bd-colors_icon.png	app/BasicDreams/BasicDreams.apk	mipmap/colors_icon')
    png.append('lw-ic_launcher_live_wallpaper.png	app/LiveWallpapersPicker/LiveWallpapersPicker.apk	mipmap/ic_launcher_live_wallpaper')
    png.append('gel-ic_launcher_wallpaper.png	priv-app/Velvet/Velvet.apk	mipmap/ic_launcher_wallpaper')
    # DataUsageSummary's chart: ChartGridView's border and the warning sweep.
    for name in ['data_grid_border', 'data_sweep_warning_activated']:
        png.append(f'st-{name}.9.png	{APKPATH}	drawable/{name}')
    # RegulatoryInfoDisplayActivity's image for the SKU (ro.boot.hardware.sku; the simulator is the US LG-H790).
    png.append(f'st-regulatory_info_lgh790.png	{APKPATH}	drawable/regulatory_info_lgh790')
    for name in ['ic_bt_headset_hfp', 'ic_bt_headphones_a2dp', 'ic_bt_config']:
        png.append(f'st-{name}.png	{APKPATH}	drawable/{name}')
    # VolumeSeekBarPreference's mute icons and NotificationSettings.updateRingOrNotificationPreference's vibrate icon.
    for key in ['ic_audio_media_mute', 'ic_audio_alarm_mute', 'ic_audio_ring_notif_mute', 'ic_audio_ring_notif_vibrate']:
        drawable('framework', key)
    # PackageInstaller's permission screens: the framework's group icons in colorControlNormal (Utils.applyTint), the
    # header's info button in white.
    for g in ['calendar', 'camera', 'contacts', 'location', 'microphone', 'phone_calls', 'sensors', 'sms', 'storage']:
        vec.append(f'fw-perm_group_{g}.svg\tframework/framework-res.apk\tperm_group_{g}\ttint=#8a000000')
    vec.append('pi-ic_info.svg\tpriv-app/GooglePackageInstaller/GooglePackageInstaller.apk\tic_info\ttint=#ffffffff')
    # ManageApplications' action bar gear (ic_settings_24dp in the action bar's white).
    vec.append(f'st-ic_settings_24dp.svg\t{APKPATH}\tic_settings_24dp\ttint=#ffffffff')
    # BatteryEntry's icons for the system's own drains.
    for key in ['ic_settings_display', 'ic_power_system', 'ic_settings_cell_standby', 'ic_settings_phone_idle', 'ic_settings_wireless']:
        drawable('Settings', key)
    # ZenModeAutomationSettings' rule icons and Add rule.
    for key in ['ic_schedule', 'ic_event', 'ic_label', 'ic_add', 'ic_menu_add']:
        drawable('Settings', key)
    for (apk, key), d in sorted(drawables.items()):
        if d['kind'] == 'png': png.append(f"{d['icon']}\t{d['path']}\tdrawable/{d['res']}")
        elif d['kind'] == 'vector': vec.append(f"{d['icon']}\t{d['path']}\t{d['res']}\t{d.get('theme', '-')}")
    open(ROOT + 'docs/data/mm-assets-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(png) + '\n')
    open(ROOT + 'docs/data/mm-vectors-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(vec) + '\n')
    print(len(data), 'screens,', len(strings), 'strings,', len(arrays), 'arrays,', len(drawables), 'drawables')


if __name__ == '__main__':
    main()
