"""Builds a version's Developer options module from its factory image: the rows of Settings.apk's
res/xml/development_prefs.xml in order (categories, CheckBoxPreference / SwitchPreference, ListPreference,
PreferenceScreen, Preference), the summaries DevelopmentSettings shows by default (the summary attribute, or the default
entry of the list's array), and every text in Hungarian, German, French and Spanish as that image translates it.
    python docs/tools/devopts.py mako       -> versions/4.3/jb-devopts.js
    python docs/tools/devopts.py hammerhead -> versions/4.4.4/kk-devopts.js
    python docs/tools/devopts.py shamu      -> versions/5.1.1/lp-devopts.js
The behaviour lives in docs/templates/devopts.template.js."""
import glob, json, os, re, subprocess, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
DEVICES = {'maguro': ('4.0.4', 'ics', 'android-4.0.4_r2.1', 'Galaxy Nexus (IMM76I)'), 'mako': ('4.3', 'jb', 'android-4.3_r1.1', 'Nexus 4 (JWR66Y)'), 'hammerhead': ('4.4.4', 'kk', 'android-4.4.4_r1', 'Nexus 5 (KTU84P)'),
           'shamu': ('5.1.1', 'lp', 'android-5.1.1_r9', 'Nexus 6 (LMY48Y)')}
device = sys.argv[1]
version, prefix, tag, phone = DEVICES[device]
SYSTEM = f'{ROOT}_aosp/{device}/system/'
def apk(name):
    if name == 'framework': return SYSTEM + 'framework/framework-res.apk'
    return next(p for p in [SYSTEM + f'{d}/{name}.apk' for d in ('app', 'priv-app')] + [SYSTEM + f'{d}/{name}/{name}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
# Resources are read with androguard (no Android SDK needed).
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
APKS = {}
def load(name):
    if name not in APKS:
        a = APK(apk(name)); r = a.get_android_resources()
        APKS[name] = (a, r, ([p for p in r.get_packages_names() if p != 'android'] or ['android'])[-1])
    return APKS[name]
def res_name(name, rid):
    """'array/x' of a resource id."""
    _, r, pkg = load(name); return r.get_resource_xml_name(rid, pkg)[1:]
def array_items(name, array):
    """{config: [items]} of a string-array: '@string/name' for references, '"text"' for inline strings."""
    _, r, pkg = load(name); rid = r.get_res_id_by_key(pkg, 'array', array); out = {}
    for config, entry in r.get_res_configs(rid):
        q = config.get_qualifier() or ''
        if q in out: continue
        out[q] = ['@' + res_name(name, v.data) if v.data_type == 1 else '"' + r.stringpool_main.getString(v.data) + '"' for _, v in entry.item.items]
    return out
idx = json.load(open(f'{ROOT}_aosp/{device}/strings-index.json', encoding='utf-8'))
by = {}
for en, hits in idx.items():
    for a, n, tr in hits: by.setdefault((a, n), (en, tr))
LANGS = ('hu', 'de', 'fr', 'es')
STRINGS = {}
def text(source, name):
    """English text of a string resource, its translations recorded in STRINGS."""
    en, tr = by[(source, name)]
    en = en.replace("\\'", "'").replace('\\"', '"')
    STRINGS.setdefault(en, {'res': f'{source}:{name}', **{l: tr.get(l, en).replace("\\'", "'").replace('\\"', '"') for l in LANGS}}); return en
def array_text(name, index):
    configs = array_items('Settings', name)
    def item(config):
        x = (configs.get(config) or configs[''])[index]
        if x.startswith('@string/'): return by[('Settings', x[8:])]
        return x[1:-1], {}
    en, tr = item('')
    if not by.get(('Settings', (configs[''][index] or '')[8:])):
        STRINGS.setdefault(en, {'res': f'Settings:@array/{name}:{index}', **{l: item(l)[0] if l in configs else en for l in LANGS}})
    else:
        STRINGS.setdefault(en, {'res': f'Settings:@array/{name}:{index}', **{l: tr.get(l, en) for l in LANGS}})
    return en
def ref(value):
    """'@7F0C0123' or '@android:01040013' -> (apk, name)."""
    m = re.match(r'@(?:android:)?([0-9A-Fa-f]{8})$', value)
    if m:
        rid = int(m.group(1), 16)
        source = 'framework' if rid >> 24 == 1 else 'Settings'
        return source, res_name(source, rid).split('/', 1)[1]
    raise ValueError(value)
# The simulator's setting keys for the rows it already keeps (data.settings); new switches get their own.
KEYS = {'keep_screen_on': 'stayAwake', 'enforce_read_external': 'protectStorage', 'enable_adb': 'usbDebug', 'bugreport_in_power': 'bugreportPower',
        'allow_mock_location': 'mockLocations', 'wait_for_debugger': 'waitDebugger', 'verify_apps_over_usb': 'verifyUsb', 'show_touches': 'showTouches',
        'pointer_location': 'pointerLocation', 'show_screen_updates': 'surfaceUpdates', 'debug_layout': 'layoutBounds', 'force_hw_ui': 'forceGpu',
        'show_hw_screen_udpates': 'gpuUpdates', 'show_hw_layers_udpates': 'layerUpdates', 'show_hw_overdraw': 'gpuOverdraw', 'force_msaa': 'forceMsaa',
        'disable_overlays': 'disableOverlays', 'strict_mode': 'strictMode', 'show_cpu_usage': 'showCpu', 'immediately_destroy_activities': 'dontKeep',
        'show_all_anrs': 'showAnrs', 'experimental_webview': 'experimentalWebview', 'bt_hci_snoop_log': 'btSnoopLog', 'enable_terminal': 'localTerminal',
        'wifi_display_certification': 'wifiDisplayCertification', 'force_rtl_layout_all_locales': 'forceRtl', 'oem_unlock_enable': 'oemUnlock',
        'debug_view_attributes': 'viewAttributes', 'wifi_verbose_logging': 'wifiVerboseLogging', 'wifi_aggressive_handover': 'wifiAggressiveHandover',
        'wifi_allow_scan_with_traffic': 'wifiRoamScans', 'use_awesomeplayer': 'useAwesomePlayer', 'usb_audio': 'usbAudioRouting'}
SCALES = {'window_animation_scale': 'windowScale', 'transition_animation_scale': 'transitionScale', 'animator_duration_scale': 'animatorScale'}
# DevelopmentSettings' summaries of the lists at their defaults: [array, index].
LIST_DEFAULTS = {'hdcp_checking': ('hdcp_checking_summaries', 1), 'select_runtime': ('select_runtime_summaries', 0),
                 'select_logd_size': ('select_logd_size_summaries', 1), 'overlay_display_devices': ('overlay_display_devices_entries', 0),
                 'show_non_rect_clip': ('show_non_rect_clip_entries', 0), 'debug_hw_overdraw': ('debug_hw_overdraw_entries', 0),
                 'simulate_color_space': ('simulate_color_space_entries', 0), 'track_frame_time': ('track_frame_time_entries', 0),
                 'enable_opengl_traces': ('enable_opengl_traces_entries', 0), 'app_process_limit': ('app_process_limit_entries', 0)}
import xml.etree.ElementTree as ET
ANDROID = '{http://schemas.android.com/apk/res/android}'
tree = ET.fromstring(AXMLPrinter(load('Settings')[0].get_file('res/xml/development_prefs.xml')).get_xml())
elements = [{'tag': node.tag.rsplit('.', 1)[-1], **{k.replace(ANDROID, ''): v for k, v in node.attrib.items()}} for node in tree.iter()]
sections, rows = [], None
for el in elements:
    tag = el['tag']
    if tag == 'PreferenceScreen' and 'key' not in el: continue
    if tag == 'PreferenceCategory':
        rows = []; sections.append([text(*ref(el['title'])), rows]); continue
    if tag not in ('CheckBoxPreference', 'SwitchPreference', 'ListPreference', 'PreferenceScreen', 'Preference', 'BugreportPreference'): continue
    if rows is None: rows = []; sections.append(['', rows])
    key, title = el.get('key', ''), text(*ref(el['title']))
    summary = text(*ref(el['summary'])) if el.get('summary', '').startswith('@') else ''
    if tag in ('CheckBoxPreference', 'SwitchPreference'):
        row = ['switch' if tag == 'SwitchPreference' else 'check', title, summary, KEYS[key]]
        if key in ('wait_for_debugger', 'bugreport_in_power') and not (key == 'bugreport_in_power' and device == 'maguro'): row.append(True)
    elif key in SCALES: row = ['scale', title, '', SCALES[key]]
    elif tag == 'ListPreference':
        # A ListPreference: its entries (and the summaries DevelopmentSettings shows instead for HDCP, runtime and log
        # buffer sizes), the default index, and the dialog title; the choice is kept in data.settings['dev_<key>'].
        array, default = LIST_DEFAULTS[key]
        entries_name = res_name('Settings', int(el['entries'][1:], 16)).split('/', 1)[1]
        entries = [array_text(entries_name, i) for i in range(len(array_items('Settings', entries_name)['']))]
        summaries = [array_text(array, i) for i in range(len(entries))] if array.endswith('_summaries') else None
        dialog_title = text(*ref(el['dialogTitle'])) if el.get('dialogTitle', '').startswith('@') else title
        row = ['choice', title, '', 'dev_' + key, False, entries, summaries, default, dialog_title]
    elif key == 'debug_app': row = ['list', title, text('Settings', 'debug_app_not_set'), key]
    # preferenceInformationStyle: DevelopmentSettings writes the VerifierDeviceIdentity into the summary.
    elif key == 'verifier_device_identifier': row = ['info', title, summary, key]
    # The Desktop backup password summary once BackupManager has a password; Take bug report needs USB debugging on a
    # user build (updateBugreportOptions).
    elif key == 'local_backup_password': row = ['list', title, summary, key, False, text('Settings', 'local_backup_password_summary_change')]
    elif key == 'bugreport': row = ['list', title, summary, key, True]
    else: row = ['list', title, summary, key]
    rows.append(row)
# The pages and dialogs those rows open: SetFullBackupPassword (set_backup_pw.xml and its toasts; IMM76I's are
# hard-coded English), BugreportPreference, the adb keys dialog and AppPicker.
def maybe(source, name):
    return text(source, name) if (source, name) in by else None
EXTRA = [maybe('Settings', n) for n in ('current_backup_pw_prompt', 'new_backup_pw_prompt', 'confirm_new_backup_pw_prompt', 'backup_pw_cancel_button_text',
                                     'backup_pw_set_button_text', 'local_backup_password_toast_success', 'local_backup_password_toast_confirmation_mismatch',
                                     'local_backup_password_toast_validation_failure', 'adb_keys_warning_message', 'select_application', 'no_application', 'settings_label')]
EXTRA += [maybe('framework', n) for n in ('bugreport_message', 'report', 'ok', 'cancel')]
src = open(ROOT + 'docs/templates/devopts.template.js', encoding='utf-8').read()
header = f"""/* Developer options of the {phone} image (Settings.apk res/xml/development_prefs.xml, {tag}), generated by
   docs/tools/devopts.py {device} from docs/templates/devopts.template.js: the rows in the XML's order, the default summaries
   DevelopmentSettings shows, and the image's own Hungarian, German, French and Spanish texts. */"""
out = src.replace('__HEADER__', header).replace('__SECTIONS__', json.dumps(sections, ensure_ascii=False, indent=2).replace('\n', '\n  '))
out = out.replace('__STRINGS__', ',\n    '.join(f'{json.dumps(en, ensure_ascii=False)}: {json.dumps(row, ensure_ascii=False)}' for en, row in STRINGS.items()))
out = out.replace('__CATEGORY_CAPS__', 'false' if prefix == 'lp' else 'true').replace('__ICS__', 'true' if device == 'maguro' else 'false')
# 1 dp in px in each frame: the process bars (6 px a unit there) are written in dp.
out = out.replace('__DP__', {'maguro': '.85', 'mako': '.8516', 'hammerhead': '.906', 'shamu': '.906'}[device])
target = f'{ROOT}versions/{version}/{prefix}-devopts.js'
open(target, 'w', encoding='utf-8', newline='\n').write(out)
print(sum(len(r) for _, r in sections), 'rows,', len(STRINGS), 'texts ->', target)
