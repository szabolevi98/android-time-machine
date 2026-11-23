"""Fills an app module's text table from a factory image's APK: the template holds
    const STRINGS = __STRINGS__({"English text": "resource_name", ...});
and the output gets {"English text": {res, hu, de, fr, es, en?}} (the named form strings.js reads) as that APK in the
image translates the resource (English where it has no translation); res names the resource, en carries the image's
English when it differs from the key. A value "Apk:resource_name" reads another APK of the same image, "?name" may be
missing from the image; "@plurals/name:one" (or "Apk:@plurals/name:other") reads a quantity of a plurals resource, and
"@array/name:2" (or "Apk:@array/name:2") an item of a string array (both with androguard). "Telephony:name" reads Phone.apk where the image has it and
TeleService.apk from 4.4 on; "name_a|name_b" takes the first the image has. __DEVICE__ in the template becomes the device name. The image's string index comes from
docs/tools/image-index.py.
    python docs/tools/apk-strings.py <device> <apk> <template> <output>
e.g. python docs/tools/apk-strings.py maguro Music2 docs/templates/ics-play-music.template.js versions/4.0.4/ics-play-music.js"""
import json, re, sys
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
device, apk, template, output = sys.argv[1:5]
idx = json.load(open(f'{ROOT}_aosp/{device}/strings-index.json', encoding='utf-8'))
by = {}
for en, hits in idx.items():
    for a, name, tr in hits:
        by.setdefault((a, name), (en, tr))
src = open(ROOT + template, encoding='utf-8').read().replace('__DEVICE__', device)
TELEPHONY = 'TeleService' if any(a == 'TeleService' for a, _ in by) else 'Phone'
m = re.search(r'__STRINGS__\((\{.*?\})\)', src, re.S)
mapping = json.loads(m.group(1))
PLURALS = {}
def plural(source, name, quantity):
    """'@plurals/NAME:one' reads a quantity of a plurals resource with androguard (no Android SDK needed); a language
    without that quantity takes its 'other' form, as the earlier aapt2 reading did."""
    import os
    if source not in PLURALS:
        from loguru import logger; logger.remove()
        from androguard.core.apk import APK
        path = next(p for p in [f'{ROOT}_aosp/{device}/system/framework/framework-res.apk'] * (source == 'framework') + [f'{ROOT}_aosp/{device}/system/{d}/{source}.apk' for d in ('app', 'priv-app')] + [f'{ROOT}_aosp/{device}/system/{d}/{source}/{source}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
        apk_file = APK(path)
        PLURALS[source] = (apk_file.get_android_resources(), 'android' if source == 'framework' else apk_file.get_package(), {})
    r, pkg, cache = PLURALS[source]
    if name not in cache:
        # The quantity attribute ids of a plurals bag (ResTable_map: ^other, ^zero, ^one, ^two, ^few, ^many).
        ids = {0x01000004: 'other', 0x01000005: 'zero', 0x01000006: 'one', 0x01000007: 'two', 0x01000008: 'few', 0x01000009: 'many'}
        configs = {}
        # The resource table's package can differ from the manifest's (EmailGoogle keeps com.android.email's).
        rid = next(i for i in [r.get_res_id_by_key(p, 'plurals', name) for p in [pkg, *r.get_packages_names()]] if i is not None)
        for config, entry in r.get_res_configs(rid):
            lang = config.get_qualifier() or ''
            configs.setdefault(lang, {ids[k]: r.stringpool_main.getString(v.data) for k, v in entry.item.items if k in ids})
        cache[name] = configs
    configs = cache[name]
    en = configs[''][quantity]
    return en, {lang: (configs.get(lang) or {}).get(quantity, (configs.get(lang) or {}).get('other', en)) for lang in ('hu', 'de', 'fr', 'es')}
ARRAYS = {}
def array_item(source, name, index):
    """'@array/NAME:3' (or 'Apk:@array/NAME:3') reads an item of a string array (aapt2 dump resources, or androguard when
    the Android SDK is not installed); items that name a string resource resolve through the image's string index,
    literal items are taken per configuration."""
    import glob, os, subprocess
    path = next(p for p in [f'{ROOT}_aosp/{device}/system/framework/framework-res.apk'] * (source == 'framework') + [f'{ROOT}_aosp/{device}/system/{d}/{source}.apk' for d in ('app', 'priv-app')] + [f'{ROOT}_aosp/{device}/system/{d}/{source}/{source}.apk' for d in ('app', 'priv-app')] if os.path.exists(p))
    tools = sorted(glob.glob(os.path.expandvars(r'%LOCALAPPDATA%/Android/Sdk/build-tools/*/aapt2*')))
    if source not in ARRAYS and tools:
        out = subprocess.run([tools[-1], 'dump', 'resources', path], capture_output=True, text=True, encoding='utf-8').stdout
        res, cur, config, buf = {}, None, None, ''
        def flush():
            if cur is not None and config is not None and buf:
                cur[config] = re.findall(r'@string/[\w.]+|"(?:[^"\]|\.)*"', buf)
        for line in out.splitlines():
            m = re.match(r'\s+resource 0x\w+ array/(\S+)', line)
            if m or re.match(r'\s+resource ', line):
                flush(); cur = res.setdefault(m.group(1), {}) if m else None; config, buf = None, ''; continue
            m = re.match(r'\s+\(([^)]*)\) \(array\)', line)
            if m and cur is not None: flush(); config, buf = m.group(1), ''; continue
            if cur is not None and config is not None: buf += line
        flush()
        ARRAYS[source] = res
    elif name not in ARRAYS.get(source, {}) and not tools:
        from loguru import logger; logger.remove()
        from androguard.core.apk import APK
        apk_file = APK(path); r = apk_file.get_android_resources()
        # Old APKs carry an empty 'android' package first: look the array up in the APK's own package.
        pkg = 'android' if source == 'framework' else apk_file.get_package()
        configs = {}
        for config, entry in r.get_res_configs(r.get_res_id_by_key(pkg, 'array', name)):
            lang = (config.get_qualifier() or '').split('-')[0]
            if lang and lang not in ('hu', 'de', 'fr', 'es'): continue
            items = []
            for _, value in entry.item.items:
                if value.data_type == 1: items.append('@string/' + r.get_resource_xml_name(value.data).split('/')[-1])
                else: items.append('"' + value.format_value().replace('"', '\\"') + '"')
            configs.setdefault(lang, items)
        ARRAYS.setdefault(source, {})[name] = configs
    return _array_text(source, ARRAYS[source][name], index)
def _array_text(source, configs, index):
    def text(item, lang):
        if item.startswith('@string/'):
            en, tr = by[(source, item[8:])]
            return en if lang == '' else tr.get(lang, en)
        return item[1:-1].replace('\\"', '"').replace("\\'", "'")
    en = text(configs[''][index], '')
    return en, {lang: text((configs.get(lang) or configs[''])[index], lang if lang in configs or configs[''][index].startswith('@string/') else '') for lang in ('hu', 'de', 'fr', 'es')}
table = {}
LANGS = ('hu', 'de', 'fr', 'es')
# The named form every text table shares (strings.js): {res, hu, de, fr, es, en?}. res is the resource the row was read
# from ("Vending:install", "Settings:@array/wifi_signal:2", "Gmail:@plurals/unread:other"); en is this image's English
# wording when it differs from the key.
def entry(res, tr, en=None):
    row = {'res': res, **{lang: tr[lang] for lang in LANGS}}
    if en is not None: row['en'] = en
    return row
for key, value in mapping.items():
    if '@array/' in value:
        # "?@array/name:i": an array this image may not have (left out when it is missing).
        optional = value.startswith('?'); value = value.lstrip('?')
        source, _, rest = value.rpartition(':@array/') if ':@array/' in value else ('', '', value[len('@array/'):])
        name, _, index = rest.partition(':')
        app = {'Telephony': TELEPHONY}.get(source, source) or apk
        try: en, tr = array_item(app, name, int(index or 0))
        except ValueError:
            if optional: print(f'note: {app} has no array {name}; left out', file=sys.stderr); continue
            raise
        table[key] = entry(f'{app}:@array/{name}:{int(index or 0)}', tr, en if en != key else None)
        if en != key: print(f'note: {name}:{index} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
        continue
    if '@plurals/' in value:
        source, _, rest = value.rpartition(':@plurals/') if ':@plurals/' in value else ('', '', value[len('@plurals/'):])
        name, _, quantity = rest.partition(':')
        en, tr = plural(source or apk, name, quantity or 'other')
        # A quantity keeps the key as its English: the key names the form the code fills in.
        if en != key: print(f'note: {name}:{quantity} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
        table[key] = entry(f'{source or apk}:@plurals/{name}:{quantity or "other"}', tr)
        continue
    optional = value.startswith('?'); value = value.lstrip('?')
    # "name_a|name_b": the first of these resources the image has (a string renamed between releases).
    if '|' in value:
        value = next((v for v in value.split('|') if (v.rpartition(':')[0] or apk, v.rpartition(':')[2]) in by), value.split('|')[0])
    source, _, name = value.rpartition(':')
    if source == 'Telephony': source = TELEPHONY
    if (source or apk, name) not in by:
        if optional: print(f'note: {source or apk} has no {name}; left out', file=sys.stderr); continue
        sys.exit(f'{source or apk} has no {name}')
    en, tr = by[(source or apk, name)]
    table[key] = entry(f'{source or apk}:{name}', {lang: tr.get(lang, en) for lang in LANGS}, en if en != key else None)
    if en != key: print(f'note: {name} is "{en}" in English, keyed as "{key}"', file=sys.stderr)
# One entry per line, in the mapping's order.
body = '{\n' + ',\n'.join(f'    {json.dumps(key, ensure_ascii=False)}: {json.dumps(row, ensure_ascii=False)}' for key, row in table.items()) + '\n  }'
out = src[:m.start()] + body + src[m.end():]
open(ROOT + output, 'w', encoding='utf-8', newline='\n').write(out)
print(len(table), 'strings ->', output)
