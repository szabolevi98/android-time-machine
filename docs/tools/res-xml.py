"""Writes compiled XML resources of an image's APK back as plain XML files (android: attributes, @type/name references),
so the tools written for AOSP source XML (docs/tools/mm-avd.py) can read the image's own drawables, animators and
interpolators instead of a source tree.

    python docs/tools/res-xml.py <apk> <out dir> <res path or glob> ...
    python docs/tools/res-xml.py _aosp/angler/system/priv-app/SystemUI/SystemUI.apk _aosp/angler/refs/sui-xml "res/drawable/ic_*_animation.xml"

A file res/<folder>/<name>.xml is written to <out dir>/<folder without its -vNN qualifier>/<name>.xml. References
(@0x7f……, framework @0x01……) become @type/name and @android:type/name; ?attr references ?android:attr/name. Numbers
keep aapt2's form (4.000000dp, 300, #ff000000)."""
import fnmatch, json, os, re, subprocess, sys
from xml.sax.saxutils import quoteattr

AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'


def names(apk):
    """{id: type/name} of an APK, from aapt2 dump resources."""
    out = subprocess.run([AAPT, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    return {m.group(1): m.group(2) for m in re.finditer(r'^\s*resource (0x[0-9a-f]{8}) (\S+)', out, re.M)}


def files(apk):
    out = subprocess.run([AAPT, 'dump', 'resources', apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    return sorted(set(re.findall(r'\(file\) (res/\S+\.xml) type=XML', out)))


def convert(apk, path, ids):
    text = subprocess.run([AAPT, 'dump', 'xmltree', '--file', path, apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    root, stack = None, []
    for line in text.splitlines():
        indent = len(line) - len(line.lstrip())
        s = line.strip()
        if s.startswith('E: '):
            node = [s[3:].split(' (line=')[0], [], []]
            while stack and stack[-1][0] >= indent: stack.pop()
            if stack: stack[-1][1][2].append(node)
            else: root = node
            stack.append((indent, node))
        elif s.startswith('A: ') and stack:
            m = re.match(r'A: (?:http://schemas\.android\.com/apk/res/android:(\w+)\(0x[0-9a-f]+\)|http://schemas\.android\.com/apk/res-auto:(\w+)\(0x[0-9a-f]+\)|(\w+))=(.*)', s)
            if not m: continue
            name = f'android:{m.group(1)}' if m.group(1) else f'app:{m.group(2)}' if m.group(2) else m.group(3)
            value = re.sub(r' \(Raw: .*\)$', '', m.group(4))
            if value.startswith('"') and value.endswith('"'): value = value[1:-1]

            def ref(r):
                kind, rid = r.group(1), r.group(2).lower()
                hit = ids.get(rid)
                if not hit: return r.group(0)
                return f'{kind}{"android:" if rid.startswith("0x01") else ""}{"attr/" if kind == "?" and not hit.startswith("attr/") else ""}{hit}'
            value = re.sub(r'([@?])(0x[0-9a-fA-F]{8})', ref, value)
            stack[-1][1][1].append((name, value))
    lines = []

    def emit(node, depth):
        tag, attrs, children = node
        head = f'{"  " * depth}<{tag}' + ('' if depth else ' xmlns:android="http://schemas.android.com/apk/res/android" xmlns:app="http://schemas.android.com/apk/res-auto"')
        head += ''.join(f'\n{"  " * depth}    {k}={quoteattr(v)}' for k, v in attrs)
        if not children: lines.append(head + ' />'); return
        lines.append(head + '>')
        for child in children: emit(child, depth + 1)
        lines.append(f'{"  " * depth}</{tag}>')
    if root: emit(root, 0)
    return '\n'.join(lines) + '\n'


def main():
    apk, out, *patterns = sys.argv[1:]
    apk = apk.replace('\\', '/')
    fw = re.sub(r'/system/.*', '/system/framework/framework-res.apk', apk)
    ids = {**names(fw), **names(apk)}
    all_files = files(apk)
    done = 0
    for pattern in patterns:
        for path in [p for p in all_files if fnmatch.fnmatch(p, pattern)]:
            folder, name = path.split('/')[1], path.split('/')[2]
            folder = re.sub(r'-v\d+$', '', folder)
            os.makedirs(f'{out}/{folder}', exist_ok=True)
            open(f'{out}/{folder}/{name}', 'w', encoding='utf-8', newline='\n').write(convert(apk, path, ids))
            done += 1
    print(done, 'files')


main()
