"""A compiled XML resource of an image's APK (a layout, a drawable, an xml/ file) as aapt2 dumps it, with the resource ids
in it replaced by their names and first value, for reading a screen's structure from the image.

    python docs/tools/layout-xml.py <apk> <res path> ...
    python docs/tools/layout-xml.py _aosp/angler/system/priv-app/SystemUI/SystemUI.apk res/layout/qs_panel.xml

An app id (0x7f……) is looked up in the APK, a framework id (0x01……) in the same image's framework-res.apk. aapt2's
resource dumps are cached in _aosp/<device>/rescache."""
import json, os, re, subprocess, sys

AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'


def table(apk):
    """{id: [name, first value]} of an APK's resources."""
    device = re.search(r'_aosp/([^/]+)/', apk.replace('\\', '/')).group(1)
    cache = f'{ROOT}_aosp/{device}/rescache/'
    os.makedirs(cache, exist_ok=True)
    key = cache + os.path.basename(apk) + '.json'
    if os.path.exists(key) and os.path.getmtime(key) > os.path.getmtime(apk): return json.load(open(key, encoding='utf-8'))
    out = subprocess.run([AAPT, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    ids, cur = {}, None
    for line in out.splitlines():
        m = re.match(r'\s*resource (0x[0-9a-f]+) (\S+)', line)
        if m: cur = m.group(1); ids[cur] = [m.group(2), None]; continue
        m = re.match(r'\s*\((\S*)\) (.*)', line)
        if m and cur and ids[cur][1] is None: ids[cur][1] = m.group(2)[:80]
    json.dump(ids, open(key, 'w', encoding='utf-8'))
    return ids


def main():
    apk, *paths = sys.argv[1:]
    apk = apk.replace('\\', '/')
    fw = re.sub(r'/system/.*', '/system/framework/framework-res.apk', apk)
    ids = {**table(fw), **table(apk)}

    def name(m):
        hit = ids.get(m.group(1).lower())
        return f'@{hit[0]}' + (f' [{hit[1]}]' if hit[1] and not hit[0].startswith(('layout/', 'id/')) else '') if hit else m.group(0)
    for path in paths:
        out = subprocess.run([AAPT, 'dump', 'xmltree', '--file', path, apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
        print(f'== {path}')
        for line in out.splitlines():
            line = re.sub(r'http://schemas\.android\.com/apk/res/android:(\w+)\(0x[0-9a-f]+\)', r'android:\1', line)
            line = re.sub(r'http://schemas\.android\.com/apk/res-auto:(\w+)\(0x[0-9a-f]+\)', r'app:\1', line)
            line = re.sub(r' \(Raw: "[^"]*"\)', '', line)
            print(re.sub(r'@\??(0x[0-9a-fA-F]{8})', name, line))


main()
