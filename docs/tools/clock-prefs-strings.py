"""Generates versions/<version>/<prefix>-clock-strings.js: the texts and lists DeskClock's Settings, menus, Night mode and
Cities search draw (clock-prefs in each version), in English, Hungarian, German, French and Spanish, from the
DeskClockGoogle APK of the version's factory image. Run from the repository root:
    python docs/tools/clock-prefs-strings.py mako 4.3 jb "Nexus 4 JWR66Y, DeskClockGoogle 2.0.3"
    python docs/tools/clock-prefs-strings.py hammerhead 4.4.4 kk "Nexus 5 KTU84P, DeskClockGoogle 3.0.0"
    python docs/tools/clock-prefs-strings.py shamu 5.1.1 lp "Nexus 6 LMY48Y, DeskClockGoogle 3.0.4"
Strings, plurals (key 'plurals:name:quantity') and string arrays are read from aapt2's dump of the APK's resources; an
array item that refers to a string resource takes that string's text in the same language. A language the APK does
not translate falls back to English, as Android does."""
import glob, json, re, subprocess, sys
AAPT2 = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
LANGS = ['en', 'hu', 'de', 'fr', 'es']
STRINGS = {
    'Settings': 'settings', 'Night mode': 'menu_item_night_mode', 'Help': 'menu_item_help', 'Menu settings': 'menu_item_settings',
    'Clock': 'clock_settings', 'Style': 'clock_style', 'Automatic home clock': 'automatic_home_clock',
    'Automatic home clock summary': 'automatic_home_clock_summary', 'Home time zone': 'home_time_zone',
    'Alarms': 'alarm_settings', 'Silence after': 'auto_silence_title', 'Silence after summary': 'auto_silence_summary',
    'Never': 'auto_silence_never', 'Snooze length': 'snooze_duration_title', 'Alarm volume': 'alarm_volume_title',
    'Volume buttons': 'volume_button_setting_title', 'Button effect': 'volume_button_dialog_title', 'Home': 'home_label',
    'Cities': 'cities_activity_title', 'Sort by time': 'menu_item_sort_by_gmt_offset', 'Sort by name': 'menu_item_sort_by_name',
    'Done': 'done'}
PLURALS = {'Snooze minutes': ('snooze_duration', 'other'), 'Snooze minute': ('snooze_duration', 'one'),
           'Picker minutes': ('snooze_picker_label', 'other'), 'Picker minute': ('snooze_picker_label', 'one'),
           'Snoozing minutes': ('alarm_alert_snooze_set', 'other'), 'Snoozing minute': ('alarm_alert_snooze_set', 'one')}
ARRAYS = ['clock_style_entries', 'auto_silence_entries', 'volume_button_setting_entries', 'timezone_labels']
VALUES = ['clock_style_values', 'auto_silence_values', 'volume_button_setting_values', 'timezone_values']


def unquote(text):
    # aapt2 prints the text between quotes without escaping inner quotes.
    return text[1:-1] if len(text) > 1 and text.startswith('"') and text.endswith('"') else text


def parse(dump):
    """{(type, name): {config: value}} where value is a string, a list (arrays) or a {quantity: text} dict (plurals)."""
    res, key, config, buffer = {}, None, None, None
    for line in dump.splitlines():
        m = re.match(r'\s+resource 0x[0-9a-f]+ (\w+)/(\S+)', line)
        if m: key = (m.group(1), m.group(2)); res[key] = {}; buffer = None; continue
        if not key: continue
        m = re.match(r'\s+\(([^)]*)\) (.*)$', line)
        if m and not line.strip().startswith('['):
            config, rest = m.group(1) or 'en', m.group(2)
            if key[0] == 'string' and rest.startswith('"'): res[key][config] = unquote(rest)
            elif rest.startswith('(array)'): buffer = ''; res[key][config] = []
            elif rest.startswith('(plurals)'): res[key][config] = {}
            continue
        if key[0] == 'array' and buffer is not None and config in res[key]:
            buffer += line.strip()
            if buffer.endswith(']'):
                items = re.findall(r'"((?:[^"\\]|\\.)*)"|(@\w+/\w+)', buffer[1:-1])
                res[key][config] = [json.loads(f'"{q}"') if q else ref for q, ref in items]
                buffer = ''
        elif key[0] == 'plurals':
            m = re.match(r'\s+(\w+)=(".*")$', line)
            if m and config in res[key]: res[key][config][m.group(1)] = unquote(m.group(2))
    return res


def main(device, version, prefix, build):
    apk = (glob.glob(f'_aosp/{device}/system/app/DeskClockGoogle.apk') + glob.glob(f'_aosp/{device}/system/app/DeskClockGoogle/DeskClockGoogle.apk'))[0]
    res = parse(subprocess.run([AAPT2, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8').stdout)
    def lang(values, code): return values.get(code, values.get('en'))
    def string(name, code):
        values = res.get(('string', name))
        return None if not values else lang(values, code)
    strings, arrays, values = {}, {}, {}
    for key, name in STRINGS.items():
        if ('string', name) not in res: print('missing string', name, file=sys.stderr); continue
        row = {'res': f'DeskClockGoogle:{name}', **{c: string(name, c) for c in LANGS[1:]}}
        if string(name, 'en') != key: row['en'] = string(name, 'en')
        strings[key] = row
    for key, (name, quantity) in PLURALS.items():
        values_ = res.get(('plurals', name))
        if not values_: print('missing plurals', name, file=sys.stderr); continue
        pick = lambda c: (lang(values_, c) or {}).get(quantity) or (lang(values_, c) or {}).get('other')
        strings[key] = {'res': f'DeskClockGoogle:@plurals/{name}:{quantity}', **{c: pick(c) for c in LANGS[1:]}, 'en': pick('en')}
    for name in ARRAYS:
        items = res.get(('array', name))
        if not items: print('missing array', name, file=sys.stderr); continue
        arrays[name] = {c: [string(i.split('/')[1], c) if i.startswith('@string/') else i for i in lang(items, c)] for c in LANGS}
    for name in VALUES:
        items = res.get(('array', name))
        if items: values[name] = items.get('en')
    text = (f'/* Generated by docs/tools/clock-prefs-strings.py from {build} (DeskClock Settings, menus and Cities: strings,\n'
            f'   plurals and string arrays in en, hu, de, fr, es). Do not edit. */\n'
            f'window.ClockPrefStrings = {json.dumps({"strings": strings, "arrays": arrays, "values": values}, ensure_ascii=False, indent=1)};\n')
    open(f'versions/{version}/{prefix}-clock-strings.js', 'w', encoding='utf-8', newline='\n').write(text)
    print(version, len(strings), 'strings', {k: len(v['en']) for k, v in arrays.items()})


if __name__ == '__main__':
    main(*sys.argv[1:5])
