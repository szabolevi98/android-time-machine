"""Raises the ?v= cache-busting number of files in a version's index.html by one.

    python docs/tools/bump-version.py <version> <file>...      e.g. 5.1.1 lp-camera.js lp-camera.css

A new file is added to index.html by hand with ?v=1. The shared ../../i18n.js is raised with sed across every
versions/*/index.html instead."""
import re, sys

v, files = sys.argv[1], sys.argv[2:]
p = f'versions/{v}/index.html'
s = open(p, encoding='utf-8').read()
for f in files:
    pat = re.compile(r'((?:src|href)="' + re.escape(f) + r'\?v=)(\d+)(")')
    m = pat.search(s)
    if not m: print('not found', v, f); continue
    s = pat.sub(lambda m: f'{m.group(1)}{int(m.group(2)) + 1}{m.group(3)}', s, count=1)
    print(v, f, int(m.group(2)), '->', int(m.group(2)) + 1)
open(p, 'w', encoding='utf-8', newline='').write(s)
