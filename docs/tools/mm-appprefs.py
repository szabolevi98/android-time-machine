"""Android 6.0.1 (and 7.1.2 with ERA=ng, docs/tools/era.py): the preference screens of the image's apps (their res/xml
PreferenceScreens), for the apps' own Settings screens, as mm-prefs.py does for the Settings app.

    python docs/tools/mm-appprefs.py           ERA=ng python docs/tools/mm-appprefs.py

docs/data/mm-appprefs.txt (ng-appprefs.txt) lists them: "[id] Apk Activity" starts an app (Apk as in the image, the activity whose theme
gives the colours, '-' for the application's), then the res/xml names to read and "+name" for a text the app's code
shows beyond them (as Apk/name keys; "+framework/name" for the framework's, "+array:name" for a string array).
Writes
  versions/6.0.1/mm-appprefs-data.js     MM.appPrefsXml = {id: {apk, theme: {colorPrimary, colorPrimaryDark, colorAccent},
                                         xml: {name: node}}}; a node is {t, key, title, summary, …, c: [children]} with
                                         its texts as "Apk/name" keys of the table appprefs, entryValues as values
  versions/6.0.1/mm-strings-appprefs.js  those texts (docs/tools/mm-strings.py); with ERA=ng versions/7.1.2/ng-appprefs-data.js
                                         (NG.appPrefsXml) and ng-strings-appprefs.js
Do not edit the outputs."""
import importlib.util, json, os, re, sys
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apk_theme import Themes
from era import ERA, DEVICE, VERSION, BUILD, PHONE, JS, data as era_data, out as era_out

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + f'_aosp/{DEVICE}/system/'
NS = '{http://schemas.android.com/apk/res/android}'
THEMES = Themes(SYSTEM)
RF = APK(SYSTEM + 'framework/framework-res.apk').get_android_resources()
ATTRS = ['key', 'title', 'summary', 'summaryOn', 'summaryOff', 'entries', 'entryValues', 'dependency', 'defaultValue', 'dialogTitle',
         'dialogMessage', 'order', 'disableDependentsState', 'persistent', 'enabled', 'selectable', 'fragment', 'positiveButtonText',
         'negativeButtonText', 'ringtoneType', 'showDefault', 'showSilent', 'singleLine', 'inputType', 'max', 'min', 'layout', 'widgetLayout']


def find_apk(name):
    for d in ('app', 'priv-app'):
        for p in (f'{d}/{name}.apk', f'{d}/{name}/{name}.apk'):
            if os.path.exists(SYSTEM + p): return p
    raise SystemExit(f'no {name}.apk')


def config():
    apps, cur = [], None
    for line in open(ROOT + era_data('appprefs.txt'), encoding='utf-8'):
        line = line.split('#', 1)[0].strip()
        if not line: continue
        if line.startswith('['):
            id, apk, act = line[1:].replace(']', ' ').split()
            cur = {'id': id, 'apk': apk, 'activity': act, 'xml': [], 'extra': []}; apps.append(cur)
        else:
            for w in line.split(): (cur['extra'] if w.startswith('+') else cur['xml']).append(w.lstrip('+'))
    return apps


class Reader:
    def __init__(self, app):
        self.app, self.name = app, app['apk']
        self.path = find_apk(self.name)
        self.apk = APK(SYSTEM + self.path)
        self.res = self.apk.get_android_resources()
        self.strings, self.arrays = set(), set()

    def name_of(self, value):
        if not isinstance(value, str) or not re.fullmatch(r'@(android:)?[0-9A-Fa-f]{8}', value): return None
        rid = int(value[-8:], 16)
        fw = rid >> 24 == 1
        n = (RF if fw else self.res).get_resource_xml_name(rid)
        return ('framework' if fw else self.name, n.split(':', 1)[-1].lstrip('@')) if n else None

    def ref(self, value):
        hit = self.name_of(value)
        if not hit: return value
        apk, name = hit
        kind, key = name.split('/', 1)
        if kind == 'string': self.strings.add(f'{apk}/{key}'); return f'string/{apk}/{key}'
        if kind == 'array': self.arrays.add(f'{apk}/{key}'); return f'array/{apk}/{key}'
        if kind in ('bool', 'integer'):
            res = RF if apk == 'framework' else self.res
            for config, entry in res.get_res_configs(int(value[-8:], 16)):
                if (config.get_qualifier() or '') == '': return str(bool(entry.key.data)).lower() if kind == 'bool' else str(entry.key.data)
        return name

    def raw(self, value):
        rid = int(value[-8:], 16)
        res = RF if rid >> 24 == 1 else self.res
        for config, entry in res.get_res_configs(rid):
            if (config.get_qualifier() or '') == '':
                d = entry.key
                if d.data_type == 3: return res.stringpool_main.getString(d.data)
                if d.data_type == 18: return 'true' if d.data else 'false'
                return str(d.data)
        return self.ref(value)

    def values(self, value):
        rid = int(value[-8:], 16)
        res = RF if rid >> 24 == 1 else self.res
        for config, entry in res.get_res_configs(rid):
            if (config.get_qualifier() or '') == '':
                return [res.stringpool_main.getString(i.data) if i.data_type == 3 else self.raw('@%08x' % i.data) if i.data_type == 1 else str(i.data) for _, i in entry.item.items]
        return []

    def node(self, e):
        out = {'t': e.tag.split('.')[-1]}
        for k, v in e.attrib.items():
            name = k.split('}')[-1]
            if name == 'entryValues' and isinstance(v, str) and v.startswith('@'): out[name] = self.values(v)
            # Keys, defaults and dependencies are values, not texts: the string's own (default) value.
            # (An edit text's default is a text the user sees, kept translatable.)
            elif name in ('key', 'defaultValue', 'dependency') and not (name == 'defaultValue' and 'EditText' in e.tag) and isinstance(v, str) and re.fullmatch(r'@(android:)?[0-9A-Fa-f]{8}', v): out[name] = self.raw(v)
            elif name in ATTRS: out[name] = self.ref(v)
        kids = []
        for ch in e:
            if ch.tag == 'intent': out['intent'] = {k.split('}')[-1]: v for k, v in ch.attrib.items()}
            elif ch.tag == 'extra': out.setdefault('extras', {})[ch.get(NS + 'name')] = ch.get(NS + 'value')
            else: kids.append(self.node(ch))
        if kids: out['c'] = kids
        return out

    def theme(self):
        man = self.apk.get_android_manifest_xml()
        ref = man.find('application').get(NS + 'theme')
        if self.app['activity'] != '-':
            for act in list(man.iter('activity')) + list(man.iter('activity-alias')):
                if act.get(NS + 'name', '').endswith(self.app['activity']) and act.get(NS + 'theme'): ref = act.get(NS + 'theme'); break
        if not ref: return {}
        out = {}
        for a in ('colorPrimary', 'colorPrimaryDark', 'colorAccent', 'windowBackground', 'textColorPrimary'):
            try: v = THEMES.attr(self.path, ref, a)
            except Exception: v = None
            if v and re.fullmatch(r'#[0-9a-fA-F]{6,8}', v): out[a] = '#' + v[-6:]
        return out

    def read(self):
        xml = {}
        files = set(self.apk.get_files())
        for name in self.app['xml']:
            path = next((p for p in (f'res/xml/{name}.xml', f'res/xml-v21/{name}.xml', f'res/xml-v14/{name}.xml') if p in files), None)
            if not path: raise SystemExit(f'{self.name}: no res/xml/{name}.xml')
            xml[name] = self.node(AXMLPrinter(self.apk.get_file(path)).get_xml_obj())
        return {'apk': self.name, 'theme': self.theme(), 'xml': xml}


def main():
    data, keys, apks = {}, [], []
    for app in config():
        r = Reader(app)
        data[app['id']] = r.read()
        apks.append(r.name)
        for s in sorted(r.strings): keys.append(s)
        for e in app['extra']:
            if e.startswith(('array:', 'plurals:')):
                kind, n = e.split(':', 1)
                keys.append(e if '/' in n else f'{kind}:{r.name}/{n}')
            else: keys.append(e if '/' in e.split('+')[0] else f'{r.name}/{e}')
        for a in sorted(r.arrays): keys.append(f'array:{a}')
    seen, uniq = set(), []
    for k in keys:
        if k not in seen: seen.add(k); uniq.append(k)
    head = (f'/* Generated by docs/tools/mm-appprefs.py from the {PHONE} {BUILD} image: the apps\' own preference screens (res/xml)\n'
            f'   with their texts by name ({ERA}-strings-appprefs.js). Do not edit. */\n')
    open(ROOT + era_out('appprefs-data.js'), 'w', encoding='utf-8', newline='\n').write(head + f'{JS}.appPrefsXml = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    spec = importlib.util.spec_from_file_location('mm_strings', ROOT + 'docs/tools/mm-strings.py')
    ms = importlib.util.module_from_spec(spec); spec.loader.exec_module(ms)
    ms.build('appprefs', {'apks': sorted(set(apks)) + ['framework'], 'keys': uniq}, ms.own_rows())
    print(len(data), 'apps,', sum(len(d['xml']) for d in data.values()), 'screens')


if __name__ == '__main__':
    main()
