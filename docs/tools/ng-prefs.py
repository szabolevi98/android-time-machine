"""Android 7.1.2: the Settings app's preference screens and dashboard from the Nexus 6P image (SettingsGoogle.apk, N2G48C).

    python -E docs/tools/ng-prefs.py

Writes
  versions/7.1.2/ng-settings-data.js   NG.settingsXml = {<xml name>: node}; a node is {t: tag, key, title, summary, …,
                                       c: [children]} with every resource reference by name ("string/wifi_settings",
                                       "array/…"), entryValues as their values; an icon is {icon, tint?} naming its asset;
                                       NG.settingsLabels = {activity: its android:label}; NG.settingsTheme = the colours of
                                       Theme.Settings (docs/tools/apk_theme.py); NG.settingsRingtones = the system sounds'
                                       titles and defaults;
                                       NG.settingsDashboard = {categories, tiles}: TileUtils.getCategories over the image's
                                       manifests (the com.android.settings.action.SETTINGS activities of Settings, the
                                       EXTRA_SETTINGS ones of the other system apps, each with its category meta-data and
                                       intent-filter priority; the categories are the activities answering the category
                                       key, ordered by their priority);
                                       NG.settingsSuggestions = SuggestionParser's tiles: suggestion_ordering.xml's steps
                                       with the activities of the image in their category (MAIN + the category), their
                                       title / summary meta-data, priority, dismiss control and requirements
  versions/7.1.2/ng-strings-settings.js  the strings and arrays those name (docs/tools/mm-strings.py, ERA=ng) and the ones
                                       docs/data/ng-settings-extra.txt lists for the code of the screens
  docs/data/ng-assets-settings.tsv, docs/data/ng-vectors-settings.tsv  the drawables they name: a vector goes to
                                       mm-vectors.py with its tint resolved in the theme, a PNG to mm-assets.py
The configuration is the 6P's: res/xml (no other variant applies to a phone). Nothing of 6.0.1's lists is read. Do not
edit the outputs."""
import glob, importlib.util, json, os, re, subprocess, sys, zipfile
os.environ['ERA'] = 'ng'
from loguru import logger; logger.remove()
from androguard.core.apk import APK
from androguard.core.axml import AXMLPrinter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apk_theme import Themes

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + '_aosp/angler/system/'
APKPATH = 'priv-app/SettingsGoogle/SettingsGoogle.apk'
AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
ST = APK(SYSTEM + APKPATH)
RS, RF = ST.get_android_resources(), APK(SYSTEM + 'framework/framework-res.apk').get_android_resources()
THEMES = Themes(SYSTEM)
NS = '{http://schemas.android.com/apk/res/android}'
APP_THEME = ST.get_android_manifest_xml().find('application').get(NS + 'theme')
ATTRS = ['key', 'title', 'summary', 'summaryOn', 'summaryOff', 'entries', 'entryValues', 'dependency', 'defaultValue', 'icon',
         'dialogTitle', 'dialogMessage', 'order', 'disableDependentsState', 'persistent', 'enabled', 'selectable', 'layout',
         'widgetLayout', 'fragment', 'switchTextOn', 'switchTextOff', 'max', 'id', 'positiveButtonText', 'negativeButtonText',
         'ringtoneType', 'showDefault', 'showSilent', 'singleLine', 'inputType', 'password', 'keywords']
SKIP = {'appwidget_info', 'file_paths', 'suggestion_ordering'}
# The texts the code of the screens uses (docs/data/ng-settings-extra.txt: names as mm-strings.py takes them, '#' starts
# a comment).
EXTRA = [w for line in open(ROOT + 'docs/data/ng-settings-extra.txt', encoding='utf-8') for w in line.split('#', 1)[0].split()]
# Drawables the code of the screens sets itself ("drawable:<APK under system/>:<asset prefix>:<name>") go to the asset
# lists, not to the text table.
DRAWABLES = [w.split(':')[1:] for w in EXTRA if w.startswith('drawable:')]
EXTRA = [w for w in EXTRA if not w.startswith('drawable:')]
strings, arrays, drawables = set(), set(), {}
# The other APKs whose resources the dashboard names: {package: (path, table name for mm-strings.py, asset prefix)}.
APPS = {}


def app(pkg):
    """The image's APK of a package: (APK, resources, path, the mm-strings.py name, the asset prefix)."""
    if pkg not in APPS:
        for path in sorted(glob.glob(SYSTEM + '*app/*/*.apk')):
            try: raw = zipfile.ZipFile(path).read('AndroidManifest.xml')
            except Exception: continue
            if pkg.encode('utf-16-le') not in raw and pkg.encode() not in raw: continue
            a = APK(path)
            if a.get_package() == pkg:
                name = os.path.basename(path)[:-4]
                prefix = {'com.android.settings': 'st', 'com.google.android.gms': 'gms', 'com.google.android.gm': 'gm',
                          'com.android.systemui': 'sui', 'com.google.android.googlequicksearchbox': 'vel'}.get(pkg, name.lower())
                APPS[pkg] = (a, a.get_android_resources(), os.path.relpath(path, SYSTEM).replace(os.sep, '/'), name, prefix)
                break
    return APPS[pkg]


def app_theme(path):
    a = APK(SYSTEM + path)
    return a.get_android_manifest_xml().find('application').get(NS + 'theme')


def name_of(value):
    if not isinstance(value, str) or not re.fullmatch(r'@(android:)?[0-9A-Fa-f]{8}', value): return None
    rid = int(value[-8:], 16)
    res = RF if rid >> 24 == 1 else RS
    n = res.get_resource_xml_name(rid)
    return (('framework' if rid >> 24 == 1 else 'Settings'), n.split(':', 1)[-1].lstrip('@')) if n else None


def drawable(path, prefix, key, theme_apk=APKPATH, theme=APP_THEME):
    """The asset for a drawable of an APK: {icon: file, tint?: colour}; a vector keeps its tint attribute resolved in the
    theme (the dashboard's ?colorAccent)."""
    if (path, key) in drawables: return drawables[(path, key)]
    out = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + path, '--file', f'res/drawable/{key}.xml'], capture_output=True, text=True).stdout
    res = RF if path.startswith('framework/') else APK(SYSTEM + path).get_android_resources() if path != APKPATH else RS
    if out.strip():
        root = re.search(r'E: ([\w.-]+)', out).group(1)
        if root == 'bitmap':
            src = re.search(r'src\(0x01010119\)=@(0x[0-9a-f]{8})', out).group(1)
            tint = re.search(r'tint\(0x01010121\)=\?(0x[0-9a-f]{8})', out)
            png = (RF if src.startswith('0x01') else res).get_resource_xml_name(int(src, 16)).split('/')[-1]
            color = THEMES.attr(theme_apk, theme, tint.group(1)) if tint else None
            info = {'icon': f'{prefix}-{png}.png', 'kind': 'png', 'res': png, 'path': path}
            if color: info['tint'] = '#' + color[-6:]
        elif root == 'vector':
            info = {'icon': f'{prefix}-{key}.svg', 'kind': 'vector', 'res': key, 'path': path}
            tint = re.search(r'tint\(0x01010121\)=\?(0x[0-9a-f]{8})', out) or re.search(r'fillColor\(0x01010404\)=\?(0x[0-9a-f]{8})', out)
            if tint: info['theme'] = 'tint=' + THEMES.attr(theme_apk, theme, tint.group(1))
        else:
            info = {'icon': None, 'kind': root}
    else:
        info = {'icon': f'{prefix}-{key}.png', 'kind': 'png', 'res': key, 'path': path}
    drawables[(path, key)] = info
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
    if kind in ('drawable', 'mipmap'):
        d = drawable(APKPATH if apk == 'Settings' else 'framework/framework-res.apk', 'st' if apk == 'Settings' else 'fw', key)
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


def app_ref(pkg, value, kind):
    """A manifest value of another package's APK as a table key ("PrebuiltGmsCore/common_google_platform_settings") or an
    icon; a literal stays as it is."""
    if not (isinstance(value, str) and value.startswith('@')): return value
    a, res, path, name, prefix = app(pkg)
    rid = int(value[-8:], 16)
    if rid >> 24 == 1: res, path, name, prefix = RF, 'framework/framework-res.apk', 'framework', 'fw'
    rname = (res.get_resource_xml_name(rid) or '').split(':', 1)[-1].lstrip('@')
    rk, key = rname.split('/', 1)
    if kind == 'string':
        if pkg == 'com.android.settings' and name != 'framework': strings.add((key, 'Settings')); return key
        extra = f'{name}/{key}'
        if extra not in EXTRA: EXTRA.append(extra)
        return extra
    theme_apk = path if path != 'framework/framework-res.apk' else APKPATH
    d = drawable(path, prefix, key, APKPATH if pkg == 'com.android.settings' else theme_apk,
                 APP_THEME if pkg == 'com.android.settings' else a.get_android_manifest_xml().find('application').get(NS + 'theme'))
    return {k: v for k, v in d.items() if k in ('icon', 'tint')}


def activities(match):
    """Every activity of the image's system apps with an intent filter match(filter) accepts: (package, activity, filter)."""
    for path in sorted(glob.glob(SYSTEM + '*app/*/*.apk')):
        try: raw = zipfile.ZipFile(path).read('AndroidManifest.xml')
        except Exception: continue
        if b'com.android.settings'.decode().encode('utf-16-le') not in raw: continue
        a = APK(path)
        for act in list(a.get_android_manifest_xml().iter('activity')) + list(a.get_android_manifest_xml().iter('activity-alias')):
            for f in act.findall('intent-filter'):
                if match(f): yield a.get_package(), act, f


def meta(act):
    return {md.get(NS + 'name'): md.get(NS + 'value') or md.get(NS + 'resource') for md in act.findall('meta-data')}


def enabled(pkg, act):
    v = act.get(NS + 'enabled')
    if v is None: return True
    if v in ('true', 'false'): return v == 'true'
    a, res, *_ = app(pkg)
    rid = int(v[-8:], 16)
    for config, entry in res.get_res_configs(rid):
        if (config.get_qualifier() or '') == '': return bool(entry.key.data)
    return True


def full(pkg, name):
    return pkg + name if name.startswith('.') else name


def dashboard():
    actions = lambda f: [x.get(NS + 'name') for x in f.findall('action')]
    tiles, cats = [], {}
    # getTilesForAction: SETTINGS_ACTION in the Settings package (with its priority), then EXTRA_SETTINGS of every system
    # app (priority 0).
    for action, own in (('com.android.settings.action.SETTINGS', True), ('com.android.settings.action.EXTRA_SETTINGS', False)):
        for pkg, act, f in activities(lambda f: action in actions(f)):
            if own != (pkg == 'com.android.settings'): continue
            m = meta(act)
            cat = m.get('com.android.settings.category')
            if not cat: continue
            cls = full(pkg, act.get(NS + 'name'))
            tile = {'cls': cls.split('.')[-1] if pkg == 'com.android.settings' else cls, 'pkg': pkg, 'category': cat.split('.')[-1],
                    'priority': int(f.get(NS + 'priority') or 0) if own else 0,
                    'title': app_ref(pkg, m.get('com.android.settings.title') or act.get(NS + 'label'), 'string'),
                    # A disabled tile (System UI tuner) is never drawn: no icon to copy.
                    'icon': app_ref(pkg, m.get('com.android.settings.icon') or act.get(NS + 'icon'), 'drawable') if enabled(pkg, act) else None}
            if m.get('com.android.settings.summary'): tile['summary'] = app_ref(pkg, m['com.android.settings.summary'], 'string')
            if m.get('com.android.settings.FRAGMENT_CLASS'): tile['fragment'] = m['com.android.settings.FRAGMENT_CLASS']
            if not enabled(pkg, act): tile['disabled'] = True
            tiles.append(tile)
    for pkg, act, f in activities(lambda f: any((a or '').startswith('com.android.settings.category.') for a in actions(f))):
        key = next(a for a in actions(f) if a.startswith('com.android.settings.category.'))
        cats[key.split('.')[-1]] = {'key': key.split('.')[-1], 'title': app_ref(pkg, act.get(NS + 'label'), 'string'),
                                    'priority': int(f.get(NS + 'priority') or 0) if pkg == 'com.android.settings' else 0}
    # TILE_COMPARATOR / CATEGORY_COMPARATOR: by priority, highest first (Collections.sort keeps the found order otherwise).
    order = sorted(cats.values(), key=lambda c: -c['priority'])
    tiles.sort(key=lambda t: -t['priority'])
    return {'categories': order, 'tiles': tiles}


def suggestions():
    steps = AXMLPrinter(ST.get_file('res/xml/suggestion_ordering.xml')).get_xml_obj()
    out = []
    for step in steps:
        cat = step.get('category')
        tiles = []
        for pkg, act, f in activities(lambda f: cat in [c.get(NS + 'name') for c in f.findall('category')]):
            m = meta(act)
            cls = full(pkg, act.get(NS + 'name'))
            t = {'cls': cls.split('.')[-1] if pkg == 'com.android.settings' else cls, 'pkg': pkg, 'priority': int(f.get(NS + 'priority') or 0),
                 'title': app_ref(pkg, m.get('com.android.settings.title') or act.get(NS + 'label'), 'string')}
            if act.get(NS + 'icon'): t['icon'] = app_ref(pkg, act.get(NS + 'icon'), 'drawable')
            if m.get('com.android.settings.summary'): t['summary'] = app_ref(pkg, m['com.android.settings.summary'], 'string')
            for k in ('dismiss', 'require_feature', 'require_account', 'FRAGMENT_CLASS'):
                if m.get('com.android.settings.' + k): t[k] = m['com.android.settings.' + k]
            # com.android.settings.is_supported: a bool of the app; the languages it is true in (Velvet's hotword step: en).
            sup = m.get('com.android.settings.is_supported')
            if sup:
                a, res, *_ = app(pkg)
                t['supported'] = sorted((c.get_qualifier() or 'default') for c, e in res.get_res_configs(int(sup[-8:], 16)) if e.key.data)
            if not enabled(pkg, act): t['disabled'] = True
            tiles.append(t)
        out.append({'category': cat.split('.')[-1], 'multiple': step.get('multiple') == 'true', 'tiles': tiles})
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
    dash, sugg = dashboard(), suggestions()
    head = ('/* Generated by docs/tools/ng-prefs.py from the Nexus 6P N2G48C image\'s SettingsGoogle.apk: every res/xml preference\n'
            '   screen with its resources by name (the texts are in ng-strings-settings.js), the dashboard\'s categories and tiles\n'
            '   and the suggestions as the image\'s manifests declare them. Do not edit. */\n')
    js = lambda v: json.dumps(v, ensure_ascii=False, separators=(',', ':'))
    open(ROOT + 'versions/7.1.2/ng-settings-data.js', 'w', encoding='utf-8', newline='\n').write(
        head + 'NG.settingsXml = ' + js(data) + ';\n'
        + 'NG.settingsLabels = ' + js(labels) + ';\n'
        + 'NG.settingsTheme = ' + json.dumps({k: '#' + v for k, v in theme.items()}) + ';\n'
        + 'NG.settingsRingtones = ' + js(ringtones()) + ';\n'
        + 'NG.settingsDashboard = ' + js(dash) + ';\n'
        + 'NG.settingsSuggestions = ' + js(sugg) + ';\n')
    spec = importlib.util.spec_from_file_location('mm_strings', ROOT + 'docs/tools/mm-strings.py')
    ms = importlib.util.module_from_spec(spec); spec.loader.exec_module(ms)
    keys = [n if apk == 'Settings' else f'framework/{n}' for n, apk in sorted(strings)]
    for extra in EXTRA:
        if extra not in keys: keys.append(extra)
    keys += [f'array:{n}' if apk == 'Settings' else f'array:framework/{n}' for n, apk in sorted(arrays)]
    ms.build('settings', {'apks': ['SettingsGoogle', 'framework'], 'keys': keys}, {})
    png = ['# Settings drawables named by its preference screens, dashboard and suggestions (written by docs/tools/ng-prefs.py)']
    vec = ['# Settings vector drawables named by its preference screens, dashboard and suggestions (written by docs/tools/ng-prefs.py)']
    # Drawables the Settings code sets itself (docs/data/ng-settings-extra.txt "drawable:<apk path>:<prefix>:<name>").
    for path, prefix, key in DRAWABLES:
        if path == 'framework/framework-res.apk': drawable(path, prefix, key)
        else: drawable(path, prefix, key, path, APP_THEME if path == APKPATH else app_theme(path))
    for (path, key), d in sorted(drawables.items()):
        if d['kind'] == 'png': png.append(f"{d['icon']}\t{d['path']}\tdrawable/{d['res']}")
        elif d['kind'] == 'vector': vec.append(f"{d['icon']}\t{d['path']}\t{d['res']}\t{d.get('theme', '-')}")
    open(ROOT + 'docs/data/ng-assets-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(png) + '\n')
    open(ROOT + 'docs/data/ng-vectors-settings.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(vec) + '\n')
    print(len(data), 'screens,', len(dash['tiles']), 'tiles,', sum(len(s['tiles']) for s in sugg), 'suggestions,', len(strings), 'strings,',
          len(arrays), 'arrays,', len(drawables), 'drawables')


if __name__ == '__main__':
    main()
