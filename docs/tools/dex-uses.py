"""Android 6.0.1: lists the classes of a dex (docs/tools/oat2dex.py) whose code uses given resources, to find what to
decompile (docs/tools/dex-decompile.py) in an obfuscated app.

    python -E docs/tools/dex-uses.py <classes.dex> <apk> <type/name> ...      e.g. plurals/dnd_hours string/menu_invites

A resource counts as used where its id is a constant or where the code reads the static field of an obfuscated R class
holding it."""
import re, subprocess, sys
from loguru import logger; logger.remove()
from androguard.core.dex import DEX

AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
dex_path, apk, *wanted = sys.argv[1:]
out = subprocess.run([AAPT, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
by_name = {m.group(2): int(m.group(1), 16) for m in re.finditer(r'resource (0x[0-9a-f]+) (\S+)', out)}
ids = {by_name[w]: w for w in wanted if w in by_name}
missing = [w for w in wanted if w not in by_name]
if missing: print('not in the APK:', ' '.join(missing))
d = DEX(open(dex_path, 'rb').read())
fields = {}
for cls in d.get_classes():
    for f in cls.get_fields():
        iv = f.get_init_value()
        v = iv.get_value() if iv else None
        if v in ids: fields[f'{cls.get_name()}->{f.get_name()}'] = ids[v]
hits = {}
for cls in d.get_classes():
    for m in cls.get_methods():
        code = m.get_code()
        if not code: continue
        for ins in code.get_bc().get_instructions():
            op = ins.get_name()
            if op.startswith('const'):
                try: v = ins.get_literals()[0]
                except Exception: continue
                if v in ids: hits.setdefault(cls.get_name(), set()).add(ids[v])
            elif op.startswith('sget'):
                ref = ins.get_output().split(', ')[-1].split(' ')[0]
                if ref in fields: hits.setdefault(cls.get_name(), set()).add(fields[ref])
for name, res in sorted(hits.items()): print(name, ' '.join(sorted(res)))
