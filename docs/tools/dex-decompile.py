"""Android 6.0.1: decompiles classes of a dex file cut out of the image's OAT files (docs/tools/oat2dex.py) to Java with
androguard's DAD decompiler, the resource ids in it replaced by their names and first value.

    python docs/tools/dex-decompile.py <classes.dex> <out dir> <apk or -> <class name part> ...

e.g. python docs/tools/dex-decompile.py $TMP/sui/classes.dex $TMP/java _aosp/bullhead/system/priv-app/SystemUI/SystemUI.apk
systemui/qs/ StatusBarHeaderView. An app id (0x7f……, decimal 213…/214…) is looked up in the APK, a framework id (0x01……,
decimal 16…/17…) in the image's framework-res.apk ('-': framework only); aapt2 dumps are cached in a rescache folder next
to the output. In an obfuscated app whose code reads the ids from R classes renamed to short names (Hangouts' m.sV),
those classes' static int fields are read from the dex and "m.sV" is written as the resource too. Floats and doubles stay as their int / long bits (1065353216 is 1.0f). Output is for reading only."""
import sys, os, re, subprocess, json
from loguru import logger; logger.remove()
from androguard.core.dex import DEX
from androguard.core.analysis.analysis import Analysis
from androguard.decompiler.decompile import DvClass

AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
FW = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/_aosp/bullhead/system/framework/framework-res.apk'
CACHE = None

def table(apk):
    key = os.path.join(CACHE, re.sub(r'[^\w]', '_', os.path.abspath(apk))[-80:] + '.json')
    if os.path.exists(key): return json.load(open(key, encoding='utf-8'))
    out = subprocess.run([AAPT, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    ids, cur = {}, None
    for line in out.splitlines():
        m = re.match(r'\s*resource (0x[0-9a-f]+) (\S+)', line)
        if m: cur = int(m.group(1), 16); ids[cur] = [m.group(2), None]; continue
        m = re.match(r'\s*\((\S*)\) (.*)', line)
        if m and cur is not None and ids[cur][1] is None: ids[cur][1] = m.group(2)[:60]
    ids = {str(k): v for k, v in ids.items()}
    json.dump(ids, open(key, 'w', encoding='utf-8'))
    return ids

dex_path, out, apk, *pats = sys.argv[1:]
CACHE = os.path.join(out, 'rescache'); os.makedirs(CACHE, exist_ok=True)
ids = {**table(FW), **(table(apk) if apk != '-' else {})}
os.makedirs(out, exist_ok=True)
d = DEX(open(dex_path, 'rb').read())
dx = Analysis(d)
dx.create_xref()
# Obfuscated R classes: any class whose static fields are mostly app resource ids (0x7f……).
rfields = {}
for cls in d.get_classes():
    fs = cls.get_fields()
    vals = []
    for f in fs:
        iv = f.get_init_value()
        v = iv.get_value() if iv else None
        if isinstance(v, int) and 0x7f000000 <= v <= 0x7fffffff: vals.append((f.get_name(), v))
    if len(vals) >= 20 and len(vals) >= len(fs) * .9:
        short = cls.get_name()[1:-1].split('/')[-1].replace('$', '.')
        for fname, v in vals: rfields[f'{short}.{fname}'] = str(v)
def rname(m):
    v = rfields.get(m.group(0))
    return name(re.match(r'.*', v)) if v and v in ids else m.group(0)
def name(m):
    v = ids.get(m.group(0))
    if not v: return m.group(0)
    val = v[1] or ''
    if val.startswith('(file)'): val = ''
    return f'R.{v[0]}' + (f'{{{val}}}' if val else '')
for cls in d.get_classes():
    cname = cls.get_name()
    if not any(p in cname for p in pats):
        continue
    fn = os.path.join(out, cname[1:-1].replace('/', '.') + '.java')
    try:
        dv = DvClass(cls, dx)
        dv.process()
        src = dv.get_source()
    except Exception as e:
        src = f'// decompile failed: {e}\n'
    src = re.sub(r'\b(?:21[34]\d{7}|1[67]\d{6})\b', name, src)
    if rfields: src = re.sub(r'\b[A-Za-z_$][\w$]{0,3}\.[A-Za-z_$][\w$]{0,3}\b', rname, src)
    open(fn, 'w', encoding='utf-8').write(src)
    print(fn)
