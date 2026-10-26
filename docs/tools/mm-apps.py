"""Android 6.0.1: the launcher's apps and default workspace from the Nexus 5X image, for versions/6.0.1/mm-apps.js.

    python docs/tools/mm-apps.py

- Every activity / activity-alias with a MAIN + LAUNCHER intent filter in the image's APKs, its android:enabled resolved
  in the configuration the 5X loads (a bool's highest -vNN up to 23, no television / watch variants), the application's
  too, then the filters of the image's launcher: GelAppFilter (Velvet's com.google.android.apps.gsa.search.shared.c.a.b)
  hides the com.google.android.launcher package and Velvet's VoiceSearchActivity; LatinIME's SystemBroadcastReceiver
  turns its SetupActivity's icon off on a system install (toggleAppIcon).
- The label (the activity's, else the application's) in en, hu, de, fr, es from the APK; a language it lacks shows the
  English, and is listed in the row's untranslated.
- The version (versionName), the code size (the APK and its oat files, PackageStats.codeSize) and the runtime
  permission groups it requests (its uses-permission of the framework's dangerous permissions) and its targetSdkVersion
  (below 23 every requested permission is granted at install) for Settings' Apps.
- The colour: the theme's colorPrimary (Overview's task header); Theme.DeviceDefault's #212121 without a theme.
- The icon: the activity's or the application's, at the density Launcher3 asks for: InvariantDeviceProfile.
  getLauncherIconDensity picks the smallest density whose 48 dp icon is at least iconBitmapSize (63.9 dp at 420 dpi =
  168 px), xxxhdpi here, else the nearest below; copied byte for byte to versions/6.0.1/assets/app-<id>.png.
- BullheadLayout.apk's res/xml/partner_default_layout.xml (Launcher3 reads the partner's layout first): the hotseat
  (container -101, screen = position), the folders with their titles from that APK, the shortcuts with their cells.
Each app gets the simulator's screen id (docs below); an app without one keeps its package name.
7.1.2 (ERA=ng, docs/tools/era.py): the Nexus 6P N2G48C image, configurations up to API 25, AnglerLayout.apk, NG.appsData
in versions/7.1.2/ng-apps.js; Launcher3 asks for xxxhdpi icons there too (63.9 dp at 560 dpi = 224 px).
    ERA=ng python docs/tools/mm-apps.py"""
import json, os, re, sys, glob, zipfile, subprocess
from loguru import logger; logger.remove()
from androguard.core.apk import APK
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from apk_theme import Themes
from era import ERA, DEVICE, VERSION, BUILD, PHONE, JS

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + f'_aosp/{DEVICE}/system/'
OUT = ROOT + f'versions/{VERSION}/'
API = 25 if ERA == 'ng' else 23
LAYOUT = 'AnglerLayout' if ERA == 'ng' else 'BullheadLayout'
NS = '{http://schemas.android.com/apk/res/android}'
LANGS = ['en', 'hu', 'de', 'fr', 'es']
DENSITIES = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi', 'nodpi', '']
# The simulator's screen ids (mm-core.js SCREENS) by package / activity.
IDS = {
    'com.google.android.dialer': 'phone', 'com.google.android.contacts': 'contacts', 'com.google.android.apps.messaging': 'messenger',
    'com.android.chrome': 'chrome', 'com.google.android.gm': 'gmail', 'com.google.android.calendar': 'calendar',
    'com.google.android.GoogleCamera': 'camera', 'com.google.android.apps.photos': 'photos', 'com.google.android.deskclock': 'clock',
    'com.google.android.calculator': 'calculator', 'com.google.android.apps.maps': 'maps', 'com.google.android.youtube': 'youtube',
    'com.google.android.talk': 'hangouts', 'com.google.android.apps.docs': 'drive', 'com.android.vending': 'play-store',
    'com.google.android.music': 'play-music', 'com.google.android.videos': 'play-movies', 'com.google.android.play.games': 'play-games',
    'com.google.android.apps.walletnfcrel': 'android-pay', 'com.google.android.apps.tycho': 'project-fi',
    'com.android.providers.downloads.ui': 'downloads', 'com.android.documentsui': 'documents', 'com.google.android.gms': 'google-settings',
    'com.android.settings': 'settings', 'com.google.android.googlequicksearchbox': 'search', 'com.google.android.apps.enterprise.dmagent': 'device-policy',
    # The apps the 5.1.1 image has but these images do not, installed from Play (docs/reports/simulator-limits-2026-10-23.md T50–T57).
    'com.google.earth': 'earth', 'com.google.android.keep': 'keep', 'com.google.android.apps.docs.editors.docs': 'docs',
    'com.google.android.apps.docs.editors.sheets': 'sheets', 'com.google.android.apps.docs.editors.slides': 'slides',
    'com.google.android.apps.fitness': 'fit', 'com.google.android.apps.books': 'play-books', 'com.google.android.apps.genie.geniewidget': 'news-weather',
    'com.google.android.apps.plus': 'google-plus', 'com.google.android.apps.magazines': 'newsstand'}
HIDDEN = {('com.google.android.googlequicksearchbox', 'com.google.android.googlequicksearchbox.VoiceSearchActivity'),
          ('com.google.android.inputmethod.latin', 'com.android.inputmethod.latin.setup.SetupActivity')}


def config_score(q):
    """The 5X's pick among a bool's configurations: plain or -vNN up to 23 (higher wins); others do not apply."""
    if q in ('', None): return 0
    m = re.fullmatch(r'v(\d+)', q)
    return int(m.group(1)) if m and int(m.group(1)) <= API else None


_framework = []
def resolve_bool(r, value):
    if value is None: return True
    if not value.startswith('@'): return value.lower() == 'true'
    if value.startswith('@android:'):   # a framework bool (config_voice_capable …)
        if not _framework: _framework.append(APK(SYSTEM + 'framework/framework-res.apk').get_android_resources())
        r, value = _framework[0], '@' + value.split(':')[1]
    rid = int(value[1:], 16); best = None
    for cfg, v in r.get_resolved_res_configs(rid):
        s = config_score(cfg.get_qualifier())
        if s is not None and (best is None or s >= best[0]): best = (s, v)
    return str(best[1]).lower() in ('true', '1') if best else True


def texts(r, pkg, value):
    if not value: return {}
    if not value.startswith('@'): return {'en': value}
    rid = int(value[1:], 16); out = {}
    for cfg, v in r.get_resolved_res_configs(rid):
        q = cfg.get_qualifier() or ''
        if q == '': out['en'] = v
        elif q in LANGS[1:]: out[q] = v
    return out


def icon_path(z, r, value):
    """The icon's file in the best density: the resource table's configurations (their files may be renamed, as Drive's
    are), the density from the qualifier (other qualifiers such as -ldrtl or -v21 aside)."""
    rid = int(value[1:], 16)
    best = {}
    for cfg, v in r.get_resolved_res_configs(rid):
        parts = (cfg.get_qualifier() or '').split('-')
        if any(p not in DENSITIES and not re.fullmatch(r'v\d+', p) and p != '' for p in parts): continue
        d = next((p for p in parts if p in DENSITIES), '')
        if isinstance(v, str) and v.endswith('.png'): best.setdefault(d, v)
    for d in DENSITIES:
        if d in best: return best[d], d
    raise KeyError(r.get_resource_xml_name(rid))


THEMES = Themes(SYSTEM)


def dangerous_groups():
    """The framework manifest's dangerous permissions and their groups (android.permission-group.CAMERA -> camera)."""
    x = APK(SYSTEM + 'framework/framework-res.apk').get_android_manifest_xml(); out = {}
    for p in x.iter('permission'):
        level, group = p.get(NS + 'protectionLevel'), p.get(NS + 'permissionGroup')
        if group and level is not None and (int(level, 16) if level.startswith('0x') else int(level)) & 0xf == 1:
            out[p.get(NS + 'name')] = group.split('.')[-1].lower()
    return out


def apps():
    rows = []
    groups = dangerous_groups()
    # The image's apps, then the apps installed from Play on this phone (_aosp/<device>/playapps/, the version of the
    # image's month: docs/reports/simulator-limits-2026-10-23.md, Negyedik kör), which Settings lists as downloaded.
    installed = sorted(glob.glob(SYSTEM + '../playapps/*.apk'))
    for path in sorted(glob.glob(SYSTEM + 'app/*/*.apk') + glob.glob(SYSTEM + 'priv-app/*/*.apk')) + installed:
        a = APK(path); x = a.get_android_manifest_xml(); r = a.get_android_resources()
        pkg = x.get('package'); app = x.find('application')
        if not resolve_bool(r, app.get(NS + 'enabled')): continue
        for tag in ('activity', 'activity-alias'):
            for e in app.iter(tag):
                launcher = any(f.find(f"category[@{NS}name='android.intent.category.LAUNCHER']") is not None and f.find(f"action[@{NS}name='android.intent.action.MAIN']") is not None for f in e.iter('intent-filter'))
                if not launcher or not resolve_bool(r, e.get(NS + 'enabled')): continue
                cls = e.get(NS + 'name')
                if cls.startswith('.'): cls = pkg + cls
                elif '.' not in cls: cls = pkg + '.' + cls
                if pkg == 'com.google.android.launcher' or (pkg, cls) in HIDDEN: continue
                label = texts(r, pkg, e.get(NS + 'label') or app.get(NS + 'label'))
                icon = e.get(NS + 'icon') or app.get(NS + 'icon')
                if tag == 'activity-alias' and not e.get(NS + 'icon'):
                    target = next((t for t in app.iter('activity') if t.get(NS + 'name') in (e.get(NS + 'targetActivity'),)), None)
                    if target is not None and target.get(NS + 'icon'): icon = target.get(NS + 'icon')
                # The task's colour in Overview: Activity.onCreate gives the TaskDescription the theme's colorPrimary
                # (the activity's theme, an alias's target's, else the application's; none: Theme.DeviceDefault).
                theme = e.get(NS + 'theme')
                if tag == 'activity-alias':
                    target = next((t for t in app.iter('activity') if t.get(NS + 'name') == e.get(NS + 'targetActivity')), None)
                    if target is not None: theme = target.get(NS + 'theme') or theme
                theme = theme or app.get(NS + 'theme')
                rel = path[len(SYSTEM):].replace(os.sep, '/')
                try: color = THEMES.attr(rel, theme, 'colorPrimary') if theme else None
                except Exception: color = None
                # PackageStats' code size: the APK and its pre-optimised oat files in the app's folder; the versionName.
                folder = os.path.dirname(path)
                size = os.path.getsize(path) if path in installed else sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(folder) for f in fs)
                # The runtime permission groups it asks for (uses-permission of a dangerous permission).
                asked = sorted({groups[u.get(NS + 'name')] for u in x.iter('uses-permission') if u.get(NS + 'name') in groups})
                rows.append({'installed': path in installed, 'apk': path[len(SYSTEM):], 'pkg': pkg, 'cls': cls, 'label': label, 'iconRes': icon, 'r': r, 'color': color or '#ff212121',
                             'version': a.get_androidversion_name(), 'size': size, 'perms': asked, 'target': int(a.get_target_sdk_version() or 0)})
    return rows


def layout():
    out = subprocess.run(['D:/android_sdk/build-tools/36.0.0/aapt2.exe', 'dump', 'xmltree', SYSTEM + f'app/{LAYOUT}/{LAYOUT}.apk', '--file', 'res/xml/partner_default_layout.xml'], capture_output=True, text=True).stdout
    items, folder = [], None
    for line in out.splitlines():
        s = line.strip()
        if s.startswith('E: '):
            tag = s[3:].split()[0]
            depth = len(line) - len(line.lstrip())
            if tag == 'folder': folder = {'type': 'folder', 'items': [], 'depth': depth}; items.append(folder)
            elif tag == 'favorite':
                node = {'type': 'app'}
                if folder and depth > folder['depth']: folder['items'].append(node)
                else: folder = None; items.append(node)
            cur = folder if tag == 'folder' else node if tag == 'favorite' else None
            continue
        m = re.match(r'A: (?:\S+:)?(\w+)(?:\(0x[0-9a-f]+\))?=(?:"([^"]*)"|(\S+))', s)
        if m and cur is not None: cur[m.group(1)] = m.group(2) if m.group(2) is not None else m.group(3)
    a = APK(SYSTEM + f'app/{LAYOUT}/{LAYOUT}.apk'); r = a.get_android_resources()
    pkg = r.get_packages_names()[0]
    for it in items:
        it.pop('depth', None)
        if it['type'] == 'folder':
            rid = int(it['title'][1:], 16)
            key = r.get_resource_xml_name(rid).split('/')[-1]
            it['title'] = {**texts(r, pkg, it['title']), 'res': f'{DEVICE}:{LAYOUT}:{key}'}
    return items


if __name__ == '__main__':
    rows, data = apps(), {}
    for row in rows:
        id = IDS.get(row['pkg'], row['pkg'])
        z = zipfile.ZipFile(SYSTEM + row['apk'])
        src, density = icon_path(z, row['r'], row['iconRes'])
        open(f'{OUT}assets/app-{id}.png', 'wb').write(z.read(src))
        label = row['label']; gaps = [l for l in LANGS[1:] if l not in label]
        label.update({l: label['en'] for l in gaps})
        data[id] = {'pkg': row['pkg'], 'cls': row['cls'], 'label': label, 'icon': f'assets/app-{id}.png', 'color': '#' + row['color'][-6:],
                    'version': row['version'], 'codeSize': row['size'], 'permGroups': row['perms'], 'targetSdk': row['target'], 'res': f"{DEVICE}:{row['apk'].replace(os.sep, '/').replace('../', '')}:{src}", **({'untranslated': gaps} if gaps else {}), **({'installed': True} if row['installed'] else {})}
        print(id, row['cls'], density, label['en'], '/', label['hu'])
    byComponent = {(v['pkg'], v['cls']): k for k, v in data.items()}
    items = layout()
    def ref(node):
        # Launcher3's AppShortcutParser takes any activity of the package by getActivityInfo, not only a launcher entry
        # (the hotseat's com.android.camera.CameraActivity is GoogleCamera's CameraLauncher target): the package's app.
        id = byComponent.get((node.get('packageName'), node.get('className'))) or next((k for k, v in data.items() if v['pkg'] == node.get('packageName')), None)
        if not id: print('layout entry without an app:', node.get('packageName'), node.get('className'))
        return id
    workspace = []
    for it in items:
        if it['type'] == 'folder':
            workspace.append({'type': 'folder', 'title': it['title'], 'screen': int(it['screen']), 'x': int(it['x']), 'y': int(it['y']), 'items': [i for i in (ref(n) for n in it['items']) if i]})
        else:
            id = ref(it)
            if id: workspace.append({'type': 'app', 'app': id, 'container': 'hotseat' if it.get('container') == '-101' else 'desktop', 'screen': int(it['screen']), 'x': int(it['x']), 'y': int(it['y'])})
    js = (f'/* Generated by docs/tools/mm-apps.py from the {PHONE} {BUILD} image: the launcher entries (enabled in the {PHONE}\'s\n'
          f'   configuration, after GelAppFilter), their labels in en, hu, de, fr, es and their icons, and {LAYOUT}\'s\n'
          '   partner_default_layout.xml. Do not edit. */\n'
          f'{JS}.appsData = {json.dumps(data, ensure_ascii=False, indent=0)};\n'
          f'{JS}.defaultWorkspace = {json.dumps(workspace, ensure_ascii=False, indent=0)};\n')
    open(OUT + f'{ERA}-apps.js', 'w', encoding='utf-8', newline='\n').write(js)
    print(len(data), 'apps,', len(workspace), 'workspace items')
