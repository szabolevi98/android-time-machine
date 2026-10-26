"""Downloads one release of a Play app from APKMirror into _aosp/<device>/playapps/<Apk>.apk (6.0.1: bullhead,
7.1.2: angler) and checks it against the SHA-256 on the variant's page.

    python docs/tools/apkmirror-get.py <device> <Apk> <release page URL> [variant number]

The variant: the given number (the -N of ...-N-android-apk-download), else the first nodpi one listed, else the
first. Only resources matter to the simulator (layouts, strings, drawables, settings XML), so the architecture does not.
Prints the variant's page, its details and the checksum for docs/sources.md. Pages are fetched one at a time with a
browser user agent (APKMirror blocks fast or bot-like clients); a block is reported, never worked around."""
import re, sys, time, hashlib, subprocess, os

ROOT = __file__.replace('\\', '/').rsplit('/docs/', 1)[0] + '/'
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
BASE = 'https://www.apkmirror.com'


def get(url, out=None, referer=BASE + '/'):
    args = ['curl', '-sSL', '-A', UA, '-e', referer, '-w', '%{http_code}', url]
    if out: args[1:1] = ['-o', out]
    r = subprocess.run(args, capture_output=True)
    text = r.stdout.decode('utf-8', 'replace')
    code = text[-3:]
    time.sleep(2)
    if code != '200': raise SystemExit(f'HTTP {code} for {url} (APKMirror may be blocking; try again later)')
    return text[:-3]


device, apk, release = sys.argv[1:4]
pick = sys.argv[4] if len(sys.argv) > 4 else None
page = get(release)
links = list(dict.fromkeys(re.findall(r'href="(/apk/[^"]+-android-apk-download/)"', page)))
cells = [re.sub(r'<[^>]+>', '', c).strip() for c in re.findall(r'<div class="table-cell rowheight addseparator expand pad dowrap">(.*?)</div>', page)]
rows = [cells[i:i + 3] for i in range(0, len(cells), 3)]
for link, row in zip(links, rows): print(' ', link.rsplit('/', 2)[-2], row)
if pick: link = next(l for l in links if l.rstrip('/').endswith(f'-{pick}-android-apk-download') or (pick == '0' and re.search(r'\d-android-apk-download/$', l) is None))
else: link = next((l for l, r in zip(links, rows) if 'nodpi' in r), links[0])
variant = get(BASE + link, referer=release)
sha_page = (re.findall(r'SHA-256:\s*<span[^>]*>\s*([0-9a-f]{64})', variant) or [''])[0]
key = re.search(r'href="([^"]*download/\?key=[^"]*)"', variant).group(1)
keypage = get(BASE + key.replace('&amp;', '&'), referer=BASE + link)
final = re.search(r'href="([^"]*download\.php[^"]*)"', keypage).group(1).replace('&amp;', '&')
os.makedirs(f'{ROOT}_aosp/{device}/playapps', exist_ok=True)
out = f'{ROOT}_aosp/{device}/playapps/{apk}.apk'
get(BASE + final, out=out)
digest = hashlib.sha256(open(out, 'rb').read()).hexdigest()
print('variant', BASE + link)
print('sha256', digest, 'matches the page' if digest == sha_page else f'DOES NOT match the page ({sha_page})')
if digest != sha_page: os.remove(out); raise SystemExit('checksum mismatch, file removed')
