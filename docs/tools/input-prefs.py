"""4.3, 4.4.4 and 5.1.1: the preference screens behind Settings > Language & input, read from the factory image.
    python docs/tools/input-prefs.py mako         -> versions/4.3/jb-input-data.js
    python docs/tools/input-prefs.py hammerhead   -> versions/4.4.4/kk-input-data.js
    python docs/tools/input-prefs.py shamu        -> versions/5.1.1/lp-input-data.js
Each screen is a res/xml PreferenceScreen of the APK that draws it (Google Keyboard's prefs — on 5.1.1 split into
prefs_screen_* —, its spell checker settings, Google voice typing's ime_preferences, Settings' tts_settings and Google
Text-to-speech Engine's general_settings) as nodes {t, key, title, summary, entries, entryValues, defaultValue,
dependency, c: [children]} whose texts are "Apk/name" keys of the strings table; booleans and integers are resolved to
their values, string arrays to the keys of their items. The table also holds the texts the screens' code and Settings'
Language & input page show (TEXTS), each as {en, hu, de, fr, es} in the image's own translations. Do not edit the output."""
import json, os, re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
DEVICES = {'mako': ('4.3', 'jb', 'Nexus 4 (JWR66Y)'), 'hammerhead': ('4.4.4', 'kk', 'Nexus 5 (KTU84P)'), 'shamu': ('5.1.1', 'lp', 'Nexus 6 (LMY48Y)')}
device = sys.argv[1]
version, prefix, phone = DEVICES[device]
SYSTEM = f'{ROOT}_aosp/{device}/system/'
NS = '{http://schemas.android.com/apk/res/android}'
LANGS = ('hu', 'de', 'fr', 'es')
LATIN = ['prefs'] + (['prefs_screen_preferences', 'prefs_screen_appearance', 'prefs_screen_multilingual', 'prefs_screen_gesture',
                      'prefs_screen_correction', 'prefs_screen_advanced'] if device == 'shamu' else [])
SCREENS = [(f'latin:{x}', 'LatinImeGoogle', x) for x in LATIN] + [
    ('spell', 'LatinImeGoogle', 'spell_checker_settings'), ('voiceime', 'Velvet', 'ime_preferences'),
    ('tts', 'Settings', 'tts_settings'), ('ttsengine', 'GoogleTTS', 'general_settings')]
# The texts of Language & input (language_settings.xml and InputMethodAndLanguageSettings), the input method picker,
# TextToSpeechSettings, the apps' names and titles; '?' marks one an image may not have.
TEXTS = ['Settings/language_keyboard_settings_title', 'Settings/phone_language', 'Settings/spellcheckers_settings_title',
         '?Settings/user_dict_settings_title', '?Settings/user_dict_single_settings_title', 'Settings/keyboard_settings_category',
         'Settings/current_input_method', 'Settings/voice_category', '?Settings/recognizer_settings_title', '?Settings/voice_input_settings_title',
         'Settings/tts_settings_title', 'Settings/pointer_settings_category', 'Settings/pointer_speed', '?Settings/tts_status_title',
         '?Settings/tts_status_ok', 'Settings/tts_engine_preference_section_title', 'Settings/tts_engine_settings_button',
         'framework/select_input_method', 'framework/configure_input_methods', 'framework/ok', 'framework/cancel',
         'LatinImeGoogle/english_ime_name', 'LatinImeGoogle/english_ime_settings', 'LatinImeGoogle/spell_checker_service_name',
         'LatinImeGoogle/android_spell_checker_settings', 'LatinImeGoogle/select_language', 'LatinImeGoogle/subtype_en_US',
         'Velvet/ime_service_label', 'Velvet/imePreferences', 'Velvet/voice_ime_language_auto', '?Velvet/recognizer_service_label',
         'GoogleTTS/app_name', 'GoogleTTS/general_settings', '?Settings/use_system_language_to_select_input_method_subtypes',
         '?Settings/user_dict_settings_empty_text', '?Settings/user_dict_settings_add_menu_title',
         'LatinImeGoogle/abbreviation_unit_milliseconds', 'LatinImeGoogle/key_preview_popup_dismiss_no_delay',
         'LatinImeGoogle/key_preview_popup_dismiss_default_delay', '?LatinImeGoogle/settings_system_default', 'LatinImeGoogle/button_default',
         'LatinImeGoogle/menu_about_preferences', 'LatinImeGoogle/version_text', '?LatinImeGoogle/send_feedback',
         'Velvet/prefTitle_downloadLanguagePacks', 'framework/dialog_alert_title', '?Settings/tts_default_sample_string',
         'Settings/user_dict_settings_add_dialog_title', 'Settings/user_dict_settings_edit_dialog_title', 'Settings/user_dict_settings_add_word_option_name',
         'Settings/user_dict_settings_add_shortcut_option_name', 'Settings/user_dict_settings_add_locale_option_name', 'Settings/user_dict_settings_add_word_hint',
         'Settings/user_dict_settings_add_shortcut_hint', 'Settings/user_dict_settings_all_languages', 'Settings/delete',
         '?Settings/switch_on_text', '?Settings/switch_off_text', '?Settings/voice_interactor_preference_summary', '?Settings/voice_recognizer_preference_summary',
         '?Settings/voice_interaction_security_warning', '?Velvet/full_voice_interaction_service_label', '?Settings/voice_service_preference_section_title',
         '?Settings/tts_default_rate_title']


def find_apk(name):
    if name == 'framework': return SYSTEM + 'framework/framework-res.apk'
    for d in ('app', 'priv-app'):
        for p in (f'{d}/{name}.apk', f'{d}/{name}/{name}.apk'):
            if os.path.exists(SYSTEM + p): return SYSTEM + p
    raise SystemExit(f'no {name}.apk')


idx = json.load(open(f'{ROOT}_aosp/{device}/strings-index.json', encoding='utf-8'))
BY = {}
for en, hits in idx.items():
    for a, n, tr in hits: BY.setdefault((a, n), (en, tr))
APKS = {}
def load(name):
    if name not in APKS:
        a = APK(find_apk(name)); r = a.get_android_resources()
        APKS[name] = (a, r, 'android' if name == 'framework' else ([p for p in r.get_packages_names() if p != 'android'] or ['android'])[-1])
    return APKS[name]
STRINGS = {}
def clean(text): return text.replace("\\'", "'").replace('\\"', '"').replace('\\n', '\n')
def string(apk, name):
    key = f'{apk}/{name}'
    if key not in STRINGS:
        en, tr = BY[(apk, name)]
        STRINGS[key] = {'en': clean(en), **{l: clean(tr.get(l, en)) for l in LANGS}}
    return key
def array(apk, name):
    """The items of a string-array as text keys ("Apk/name#i"), each in the image's languages."""
    a, r, pkg = load(apk); rid = r.get_res_id_by_key(pkg, 'array', name); configs = {}
    for config, entry in r.get_res_configs(rid):
        lang = config.get_language() if config.get_country() in ('', '\x00\x00') or not config.get_country().strip('\x00') else None
        q = config.get_qualifier() or ''
        if q == '' or (lang in LANGS and q == lang):
            items = []
            for _, v in entry.item.items:
                if v.data_type == 3: items.append(r.stringpool_main.getString(v.data))
                elif v.data_type == 1:
                    ref = r.get_resource_xml_name(v.data, pkg).split('/')[-1]
                    items.append(('@', ref))
                else: items.append(str(v.data))
            configs[q or 'en'] = items
    keys = []
    for i, item in enumerate(configs['en']):
        if isinstance(item, tuple): keys.append(string(apk, item[1])); continue
        key = f'{apk}/{name}#{i}'
        STRINGS[key] = {'en': clean(item), **{l: clean(configs[l][i]) if l in configs and not isinstance(configs[l][i], tuple) else clean(item) for l in LANGS}}
        keys.append(key)
    return keys
def raw(apk, rid):
    """The default value of a referenced string / integer resource."""
    a, r, pkg = load('framework' if rid >> 24 == 1 else apk)
    for config, entry in r.get_res_configs(rid):
        if (config.get_qualifier() or '') == '' and hasattr(entry, 'key'):
            d = entry.key
            return r.stringpool_main.getString(d.data) if d.data_type == 3 else raw(apk, d.data) if d.data_type == 1 else str(d.data)
    return str(rid)
def values(apk, rid):
    a, r, pkg = load(apk)
    for config, entry in r.get_res_configs(rid):
        if (config.get_qualifier() or '') == '':
            return [r.stringpool_main.getString(i.data) if i.data_type == 3 else raw(apk, i.data) if i.data_type == 1 else str(i.data) for _, i in entry.item.items]
    return []
def resolve(apk, value, as_text=True):
    m = re.fullmatch(r'@(android:)?([0-9A-Fa-f]{8})', value or '')
    if not m: return value
    rid = int(m.group(2), 16); source = 'framework' if rid >> 24 == 1 else apk
    a, r, pkg = load(source)
    kind, name = r.get_resource_xml_name(rid, pkg).split(':')[-1].lstrip('@').split('/', 1)
    if kind == 'string':
        if as_text: return string(source, name)
        for config, entry in r.get_res_configs(rid):
            if (config.get_qualifier() or '') == '': return r.stringpool_main.getString(entry.key.data)
    if kind == 'array': return array(source, name) if as_text else values(source, rid)
    if kind in ('bool', 'integer'):
        for config, entry in r.get_res_configs(rid):
            if (config.get_qualifier() or '') == '': return (bool(entry.key.data) if kind == 'bool' else entry.key.data)
    return f'{kind}/{name}'
def node(apk, e):
    out = {'t': e.tag.split('.')[-1]}
    for k, v in e.attrib.items():
        name = k.split('}')[-1]
        if name in ('title', 'summary', 'summaryOn', 'summaryOff', 'dialogTitle', 'dialogMessage', 'entries'): out[name] = resolve(apk, v)
        elif name in ('key', 'defaultValue', 'dependency', 'entryValues'): out[name] = resolve(apk, v, False)
        elif name in ('fragment', 'enabled', 'selectable', 'persistent'): out[name] = v
    kids = []
    for ch in e:
        if ch.tag == 'intent': out['intent'] = {k.split('}')[-1]: v for k, v in ch.attrib.items()}
        elif ch.tag != 'extra': kids.append(node(apk, ch))
    if kids: out['c'] = kids
    return out
screens = {}
for sid, apk, xml in SCREENS:
    a, r, pkg = load(apk)
    screens[sid] = node(apk, AXMLPrinter(a.get_file(f'res/xml/{xml}.xml')).get_xml_obj())
for t in TEXTS:
    optional = t.startswith('?'); apk, name = t.lstrip('?').split('/', 1)
    if (apk, name) in BY: string(apk, name)
    elif not optional: raise SystemExit(f'{device}: no {t}')
# Speech rate (TextToSpeechSettings' tts_rate_entries / values) and the voice typing language rows.
a, r, pkg = load('Settings')
rate = {'entries': array('Settings', 'tts_rate_entries'), 'values': values('Settings', r.get_res_id_by_key(pkg, 'array', 'tts_rate_values'))}
# TextToSpeechSettings.getDefaultSampleString: tts_demo_strings by the engine language's ISO 639-2 code.
demo = dict(zip(values('Settings', r.get_res_id_by_key(pkg, 'array', 'tts_demo_string_langs')), values('Settings', r.get_res_id_by_key(pkg, 'array', 'tts_demo_strings'))))
# Google Keyboard's input languages (res/xml/method.xml, the variant for the image's API level): [locale, label key].
API = {'mako': 18, 'hammerhead': 19, 'shamu': 22}[device]
la, lr, lpkg = load('LatinImeGoogle')
files = set(la.get_files())
found = [(int(m.group(1) or 0), f) for f in files for m in [re.fullmatch(r'res/xml(?:-v(\d+))?/method\.xml', f)] if m]
method = AXMLPrinter(la.get_file(max(x for x in found if x[0] <= API)[1])).get_xml_obj()
subtypes = []
for st in method.iter('subtype'):
    loc = st.get(NS + 'imeSubtypeLocale'); label = resolve('LatinImeGoogle', st.get(NS + 'label'))
    if st.get(NS + 'isAuxiliary') == 'true': continue
    subtypes.append([loc, label])
for extra in ('LatinImeGoogle/subtype_generic', 'LatinImeGoogle/subtype_no_language_qwerty'):
    a2, n2 = extra.split('/')
    if (a2, n2) in BY: string(a2, n2)
# 5.1's Google Keyboard themes (keyboard_theme_names / keyboard_theme_ids), the first being the default.
themes = []
if lr.get_res_id_by_key(lpkg, 'array', 'keyboard_theme_names'):
    themes = list(zip(array('LatinImeGoogle', 'keyboard_theme_names'), values('LatinImeGoogle', lr.get_res_id_by_key(lpkg, 'array', 'keyboard_theme_ids'))))
out = (f"/* Generated by docs/tools/input-prefs.py {device} from the {phone} image: the preference screens behind Settings >\n"
       f"   Language & input ({', '.join(x for _, _, x in SCREENS)}) and their texts in the image's languages. Do not edit. */\n"
       f"window.InputPrefsData = {json.dumps({'screens': screens, 'rate': rate, 'demo': demo, 'themes': themes, 'subtypes': subtypes, 'strings': STRINGS}, ensure_ascii=False, separators=(',', ':'))};\n")
target = f'{ROOT}versions/{version}/{prefix}-input-data.js'
open(target, 'w', encoding='utf-8', newline='\n').write(out)
print(len(screens), 'screens,', len(STRINGS), 'texts ->', target)
# The renderer: docs/templates/input-language.template.js with this image's constants.
VERSIONS = {'mako': '1.0.1800.776638', 'hammerhead': '2.0.19003.1227136a', 'shamu': '4.0.21003.2364368'}
# keypress_vibration_durations / keypress_volumes: the Nexus 4 has its own row (8 ms, 0.3), the others the last one.
SEEK = {'mako': (8, 30), 'hammerhead': (20, 20), 'shamu': (20, 20)}
tpl = open(ROOT + 'docs/templates/input-language.template.js', encoding='utf-8').read()
header = (f"/* Settings > Language & input of the {phone} image, generated by docs/tools/input-prefs.py {device} from\n"
          f"   docs/templates/input-language.template.js over {prefix}-input-data.js: language_settings.xml as\n"
          f"   InputMethodAndLanguageSettings fills it (Language, Spell checker, Personal dictionary, the current keyboard and the\n"
          f"   enabled input methods, {'Voice input' if device == 'shamu' else 'Voice Search (Google Search voice settings)'}, Text-to-speech output, Pointer speed) and the\n"
          f"   pages behind it from their APKs' res/xml. Online-only targets (add-on dictionaries, offline speech packs, feedback,\n"
          f"   licenses) say so. Choices are kept in data.inputPrefs, data.userDictionary and data.settings. */")
js = (tpl.replace('__HEADER__', header).replace('__LP__', 'true' if device == 'shamu' else 'false').replace('__KK__', 'true' if device == 'hammerhead' else 'false')
      .replace('__KEYBOARD_VERSION__', VERSIONS[device]).replace('__VIBRATION__', str(SEEK[device][0])).replace('__VOLUME__', str(SEEK[device][1])))
open(f'{ROOT}versions/{version}/{prefix}-language.js', 'w', encoding='utf-8', newline='\n').write(js)
print('->', f'versions/{version}/{prefix}-language.js')
