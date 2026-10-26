"""Copies drawables of an app installed from Play (6.0.1 / 7.1.2: _aosp/<device>/playapps/<Apk>.apk) into the version's
assets as <prefix>-<name>.png, at the density the phone loads (the best one up to the phone's, else the nearest above).

    python docs/tools/playapp-assets.py <version> <Apk> <prefix> name [name ...]
e.g. python docs/tools/playapp-assets.py 7.1.2 GoogleEarth ea9 pegman ic_compass googlelogo_white_color

The Nexus 5X (6.0.1) is 420 dpi (xxhdpi), the Nexus 6P (7.1.2) 560 dpi (xxxhdpi). PNG files are copied byte for byte;
a name that is only an XML drawable is reported and skipped."""
import sys, zipfile, re
from loguru import logger; logger.remove()
from androguard.core.apk import APK

ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
DEVICES = {'6.0.1': ('bullhead', 'xxhdpi'), '7.1.2': ('angler', 'xxxhdpi')}
ORDER = ['mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi']

version, apk, prefix, *names = sys.argv[1:]
device, want = DEVICES[version]
path = f'{ROOT}_aosp/{device}/playapps/{apk}.apk'
a = APK(path); r = a.get_android_resources(); pkg = a.get_package()
z = zipfile.ZipFile(path)
for name in names:
    rid = r.get_res_id_by_key(pkg, 'drawable', name) or r.get_res_id_by_key(pkg, 'mipmap', name)
    if rid is None: print('no drawable', name); continue
    files = {}
    for cfg, v in r.get_resolved_res_configs(rid):
        q = cfg.get_qualifier() or ''
        # Only the plain configurations: a density and an API level (no -ldrtl mirror, no -w600dp tablet one).
        if any(p not in ORDER and p != 'nodpi' and not re.fullmatch(r'v\d+', p) for p in q.split('-') if p): continue
        d = next((p for p in q.split('-') if p in ORDER or p == 'nodpi'), '')
        if isinstance(v, str) and v.endswith('.png'): files[d] = v
    if not files: print('not a PNG drawable', name); continue
    w = ORDER.index(want)
    pick = next((files[d] for d in reversed(ORDER[:w + 1]) if d in files), None) or next((files[d] for d in ORDER[w + 1:] if d in files), None) or files.get('nodpi') or files.get('')
    open(f'{ROOT}versions/{version}/assets/{prefix}-{name}.png', 'wb').write(z.read(pick))
    print(f'{prefix}-{name}.png <- {pick}')
