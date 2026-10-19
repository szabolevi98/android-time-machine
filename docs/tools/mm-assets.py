"""Android 6.0.1 (and 7.1.2 with ERA=ng, docs/tools/era.py): copies the image's drawables into versions/<version>/assets
and writes versions/<version>/<era>-ninepatch.css.

    python docs/tools/mm-assets.py           ERA=ng python docs/tools/mm-assets.py

docs/data/mm-assets.tsv (and every docs/data/mm-assets-*.tsv a tool writes, e.g. mm-prefs.py's) lists one file per line: <output name> <TAB> <APK under _aosp/bullhead/system> <TAB> <resource>,
e.g. "sui-ic_sysbar_back.png	priv-app/SystemUI/SystemUI.apk	drawable/ic_sysbar_back"; a source that is not an APK is a
system file copied byte for byte, and a resource "assets/…" the APK's own asset file. The Nexus 5X is 420 dpi and takes xxhdpi resources (480 dpi, scaled down by 420/480),
so a resource is taken in the first density the APK has of xxhdpi, nodpi, xhdpi, xxxhdpi, hdpi, mdpi or none (with or
without the -v4 / -v21 / -v23 suffix aapt adds) and copied byte for byte. VectorDrawables are not copied: they become
SVG through docs/tools/mm-vectors.py.

Every nine-patch gets a class in mm-ninepatch.css: .np-<output name without .9.png> draws it as a CSS border image from
its npTc chunk (stretch areas and padding), border widths in dp (xxhdpi 3 px per dp, xhdpi 2, xxxhdpi 4, hdpi 1.5,
nodpi 3 like the density Android loads it at, mdpi 1), written as calc(n * var(--dp)); .npp-<name> is the whole padding
of the nine-patch, for a view whose background it is. Run it again after changing the list; do not edit the CSS."""
import glob, os, re, struct, sys, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from era import ERA, DEVICE, VERSION, PHONE, data as era_data, out as era_out

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
SYSTEM = ROOT + f'_aosp/{DEVICE}/system/'
OUT = ROOT + f'versions/{VERSION}/assets/'
CSS = ROOT + era_out('ninepatch.css')
# The Nexus 5X (420 dpi) loads xxhdpi first; the Nexus 6P (560 dpi) the nearer higher density, xxxhdpi, where the APK has it.
DENSITIES = ['xxxhdpi', 'xxhdpi', 'nodpi', 'xhdpi', 'hdpi', 'mdpi', ''] if ERA == 'ng' else ['xxhdpi', 'nodpi', 'xhdpi', 'xxxhdpi', 'hdpi', 'mdpi', '']
PER_DP = {'xxhdpi': 3.0, 'nodpi': 3.0, 'xhdpi': 2.0, 'xxxhdpi': 4.0, 'hdpi': 1.5, 'mdpi': 1.0, '': 1.0}


def find(z, resource):
    """The APK path of drawable/name in the best density for the 5X (folders like res/drawable-xxhdpi-v4); of the same
    density the highest -vNN the phone (API 23) takes wins, as the resource system picks it."""
    kind, name = resource.split('/', 1)
    best, ver = {}, {}
    for path in z.namelist():
        m = re.match(rf'res/{kind}(?:-([a-z]+))?(?:-v(\d+))?/{re.escape(name)}(\.9\.png|\.png|\.jpg|\.webp|\.gif)$', path)
        if not m or (m.group(1) or '') not in DENSITIES: continue
        d, v = m.group(1) or '', int(m.group(2) or 0)
        if v <= 23 and v >= ver.get(d, -1): best[d], ver[d] = path, v
    for d in DENSITIES:
        if d in best: return best[d], d
    raise KeyError(f'{resource} (no bitmap; a vector goes through mm-vectors.py)')


def nptc(data):
    pos = 8
    while pos < len(data):
        length = struct.unpack_from('>I', data, pos)[0]
        if data[pos + 4:pos + 8] == b'npTc':
            chunk = data[pos + 8:pos + 8 + length]
            nx, ny = chunk[1], chunk[2]
            pad = struct.unpack_from('>4i', chunk, 12)  # left, right, top, bottom
            xs = struct.unpack_from(f'>{nx}i', chunk, 32)
            ys = struct.unpack_from(f'>{ny}i', chunk, 32 + 4 * nx)
            return pad, xs, ys
        pos += length + 12
    return None


def size(data):
    return struct.unpack_from('>II', data, 16)


def dp(px, per):
    return '0' if not px else f'calc({px / per:g} * var(--dp))'


def main():
    rows = [line.rstrip('\n').split('\t') for f in sorted(glob.glob(ROOT + era_data("assets") + "*.tsv")) for line in open(f, encoding='utf-8')
            if line.strip() and not line.startswith('#')]
    zips, css = {}, []
    os.makedirs(OUT, exist_ok=True)
    for out, apk, resource in rows:
        if not apk.endswith('.apk'):
            open(OUT + out, 'wb').write(open(SYSTEM + apk, 'rb').read())
            continue
        z = zips.setdefault(apk, zipfile.ZipFile(SYSTEM + apk))
        # A file of the APK's assets/ folder or res/raw (a video) is copied as it is.
        if resource.startswith(('assets/', 'res/raw/')):
            open(OUT + out, 'wb').write(z.read(resource))
            continue
        path, density = find(z, resource)
        data = z.read(path)
        open(OUT + out, 'wb').write(data)
        if out.endswith('.9.png'):
            info = nptc(data)
            if not info: raise SystemExit(f'{out}: no npTc chunk')
            (pl, pr, pt, pb), xs, ys = info
            if len(xs) > 2 or len(ys) > 2:
                print(f'note: {out} has {len(xs) // 2} x {len(ys) // 2} stretch areas; its class stretches only between the outer ones')
            w, h = size(data)
            left, right = (xs[0], w - xs[-1]) if xs else (0, 0)
            top, bottom = (ys[0], h - ys[-1]) if ys else (0, 0)
            cls, k = out[:-len('.9.png')], PER_DP[density]
            css.append(f'.np-{cls}{{box-sizing:border-box;border-style:solid;border-color:transparent;'
                       f'border-width:{dp(top, k)} {dp(right, k)} {dp(bottom, k)} {dp(left, k)};'
                       f"border-image:url('assets/{out}') {top} {right} {bottom} {left} fill / "
                       f'{dp(top, k)} {dp(right, k)} {dp(bottom, k)} {dp(left, k)} stretch;'
                       f'padding:{dp(max(0, pt - top), k)} {dp(max(0, pr - right), k)} {dp(max(0, pb - bottom), k)} {dp(max(0, pl - left), k)}}}'
                       f'  /* {path} {w}x{h} */')
            css.append(f'.npp-{cls}{{padding:{dp(pt, k)} {dp(pr, k)} {dp(pb, k)} {dp(pl, k)}}}')
    head = (f'/* Generated by docs/tools/mm-assets.py from {era_data("assets")}.tsv: the {PHONE} image\'s nine-patches as CSS border\n'
            '   images (stretch areas and padding from each PNG\'s npTc chunk, xxhdpi pixels / 3 = dp). Do not edit by hand. */\n')
    open(CSS, 'w', encoding='utf-8', newline='\n').write(head + '\n'.join(css) + '\n')
    print(len(rows), 'files,', len(css) // 2, 'nine-patches')


if __name__ == '__main__':
    main()
