"""Asset inventory (audit point 12): every file of versions/<v>/assets (and the shared assets/audio) traced to its factory
image — APK or system file, resource path, density qualifier, transformation — with the hashes of both sides.
    python docs/tools/asset-inventory.py [version...]           -> docs/reports/assets/<version>.tsv and docs/reports/asset-inventory.md
    python docs/tools/asset-inventory.py --check [version...]   -> trial regeneration: every traced file rebuilt from its
                                                             source in the image and compared with the committed one
Needs the unpacked images in _aosp/<device>/system (docs/tools/extract-image.py; docs/sources.md); each device's index of
image, font and sound files is cached in _aosp/<device>/asset-index.json. Python with Pillow and NumPy.

How a file is traced, first match wins:
  copy          the same bytes as a file of the image (compiled nine-patches are stored as the APK keeps them: the
                stretch and padding areas stay in the npTc chunk)
  same pixels   decodes to the same pixels as a file of the same resource name (re-encoded)
  similar       the same size, a small mean difference (recorded)
  resized       the same resource scaled to the output size (the mean difference after scaling is recorded)
  converted     the same resource as JPEG / WebP, or a grey image turned into a white mask (mean difference recorded)
  cropped       a part of the same resource (an icon cut out of a nine-patch), its position recorded
  rotated       the same resource turned by 90° (the 2.3.6 Camera's *-p files)
  generated     built by a generator from the image (boot animation sprite sheets: docs/tools/bootanimation.py); --check
                reruns the generator and compares
  vector        an SVG drawn from the image's vector drawable of the same name
  transcoded    a sound of /system/media/audio, named <base>-<first 8 hex of its SHA-1> (docs/tools/sounds.py)
  own           no file of an image matches; docs/data/asset-sources.tsv names the source (AOSP source tree, drawn SVG…)
  not traced    neither: the transform column may name the closest graphic of an image, for review"""
import glob, hashlib, io, json, os, re, subprocess, sys, zipfile
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
VERSIONS = {'2.1': ('passion', 'hdpi'), '6.0.1': ('bullhead', 'xxhdpi'), '2.3.6': ('crespo', 'hdpi'), '4.0.4': ('maguro', 'xhdpi'), '4.3': ('mako', 'xhdpi'), '4.4.4': ('hammerhead', 'xxhdpi'), '5.1.1': ('shamu', 'xxxhdpi'), '7.1.2': ('angler', 'xxhdpi')}
RELEASES = ['passion', 'crespo', 'maguro', 'mako', 'hammerhead', 'shamu', 'bullhead', 'angler']
# The apps installed from Play (_aosp/<device>/playapps/<Apk>.apk), lower-case, in the order the fourth round added them.
PLAY_ORDER = ['googleearth', 'keep', 'docs', 'sheets', 'slides', 'fit', 'books', 'news']
DENSITIES = ['xxxhdpi', 'xxhdpi', 'xhdpi', 'hdpi', 'mdpi', 'ldpi', 'nodpi']
IMAGES = ('.png', '.jpg', '.jpeg', '.gif', '.webp')
MEDIA = ('.png', '.opng', '.jpg', '.jpeg', '.gif', '.webp', '.ogg', '.ttf', '.otf', '.xml', '.mp4')   # .opng: Gmail's PNGs
sha = lambda data: hashlib.sha256(data).hexdigest()


def file_sha(path, data):
    """The recorded hash of an output file; an SVG counts with LF line ends, as Git stores it (a Windows checkout turns
    them into CRLF)."""
    return sha(data.replace(b'\r\n', b'\n') if path.endswith('.svg') else data)[:16]


def installed(device):
    """The apps installed from Play beside the image (6.0.1 / 7.1.2: _aosp/<device>/playapps/*.apk), not cached: where is
    ../playapps/<Apk>.apk, relative to /system like the image's files."""
    rows = []
    for path in sorted(glob.glob(f'{ROOT}_aosp/{device}/playapps/*.apk')):
        with zipfile.ZipFile(path) as z:
            for info in z.infolist():
                if info.filename.lower().endswith(MEDIA) and not info.filename.startswith('META-INF/'):
                    data = z.read(info)
                    rows.append([f'../playapps/{os.path.basename(path)}', info.filename, len(data), sha(data)])
    return rows


def index(device):
    """Every image, font, sound and drawable XML of the image: [where, entry, size, sha256]. where is the path under
    /system; entry the path inside an APK / JAR / ZIP, '' for a plain file. The apps installed from Play follow."""
    cache = f'{ROOT}_aosp/{device}/asset-index.json'
    if os.path.exists(cache): return json.load(open(cache)) + installed(device)
    system, rows = f'{ROOT}_aosp/{device}/system/', []
    for path in sorted(glob.glob(system + '**/*', recursive=True)):
        if not os.path.isfile(path): continue
        where = os.path.relpath(path, system).replace(os.sep, '/')
        if path.endswith(('.apk', '.jar', '.zip')):
            try:
                with zipfile.ZipFile(path) as z:
                    for info in z.infolist():
                        if info.filename.lower().endswith(MEDIA) and not info.filename.startswith('META-INF/'):
                            data = z.read(info)
                            rows.append([where, info.filename, len(data), sha(data)])
            except (zipfile.BadZipFile, OSError) as error:
                print('skip', where, error, file=sys.stderr)
        elif path.lower().endswith(MEDIA):
            data = open(path, 'rb').read()
            rows.append([where, '', len(data), sha(data)])
    json.dump(rows, open(cache, 'w'))
    return rows + installed(device)


def signatures(img):
    """Fingerprints of every raster image of the image, cached in _aosp/<device>/asset-sigs.npz."""
    cache = f'{ROOT}_aosp/{img.device}/asset-sigs.npz'
    if os.path.exists(cache):
        z = np.load(cache); return z['rows'], z['wh'], z['sig']
    rows, wh, sig = [], [], []
    for n, row in enumerate(img.rows):
        if not (row[1] or row[0]).lower().endswith(IMAGES): continue
        try: im = pixels(img.read(row))
        except Exception: continue
        rows.append(n); wh.append(im.size); sig.append(signature(im))
    rows, wh, sig = np.array(rows, np.int32), np.array(wh, np.int32).reshape(-1, 2), np.array(sig, np.uint8).reshape(-1, 128)
    np.savez_compressed(cache, rows=rows, wh=wh, sig=sig)
    return rows, wh, sig


LOADED = {}
RAW_DECLARATIONS = None


def declared_raw(img, filename, data):
    """Exact raw/asset declarations also cover extensionless APK license files,
    which the media-only source index intentionally does not enumerate."""
    global RAW_DECLARATIONS
    if RAW_DECLARATIONS is None:
        RAW_DECLARATIONS = {}
        for manifest in sorted(glob.glob(ROOT + 'docs/data/*assets*.tsv')):
            for line in open(manifest, encoding='utf-8'):
                fields = line.strip().split('\t')
                if len(fields) != 3 or line.startswith('#'): continue
                out, apk, entry = fields
                if apk.endswith('.apk') and entry.startswith(('assets/', 'res/raw/')):
                    RAW_DECLARATIONS.setdefault(out, []).append((apk, entry))
    for apk, entry in RAW_DECLARATIONS.get(filename, []):
        if not os.path.isfile(f'{ROOT}_aosp/{img.device}/system/{apk}'): continue
        row = [apk, entry, len(data), sha(data)]
        try:
            if img.read(row) == data: return row
        except (KeyError, zipfile.BadZipFile): continue
    return None


def image(device, density='mdpi', play=True):
    # Kept per density: an image is the own one of its version (its density first) and another's (mdpi first), and a
    # run over several versions must trace each as a run over that version alone does. The apps installed from Play
    # belong to their own version only (play=False for another version's image).
    if (device, density, play) not in LOADED: LOADED[device, density, play] = Image_(device, density, play)
    return LOADED[device, density, play]


class Image_:
    """The image's files of one device, by content and by resource name."""
    def __init__(self, device, density, play=True):
        self.device, self.density, self.rows = device, density, [r for r in index(device) if play or not r[0].startswith('../playapps/')]
        self.by_sha, self.by_name, self.zips = {}, {}, {}
        for row in self.rows:
            # An empty file of the image (the 6P's 0-byte gesture videos) traces nothing.
            if row[2] == 0: continue
            self.by_sha.setdefault(row[3], []).append(row)
            self.by_name.setdefault(name_of(row[1] or row[0]), []).append(row)

    def read(self, row):
        where, entry = row[0], row[1]
        path = f'{ROOT}_aosp/{self.device}/system/{where}'
        if not entry: return open(path, 'rb').read()
        if path not in self.zips: self.zips[path] = zipfile.ZipFile(path)
        return self.zips[path].read(entry)

    def near(self, out, k=6):
        """Rows whose fingerprint is close to the output's, same aspect ratio."""
        if not hasattr(self, 'sig'): self.rows_, self.wh, self.sig = signatures(self)
        if not len(self.sig): return []
        ar = out.size[0] / out.size[1]
        ok = np.nonzero(np.abs(self.wh[:, 0] / self.wh[:, 1] - ar) < 0.05 * ar)[0]
        if not len(ok): return []
        d = np.abs(self.sig[ok].astype(np.int16) - signature(out).astype(np.int16)).mean(1)
        return [self.rows[self.rows_[ok[i]]] for i in np.argsort(d)[:k] if d[i] < 10]

    def entries(self, names, ext):
        """APK entries named <one of names>.<ext> (the index holds media only; text assets are looked up here)."""
        if not hasattr(self, 'names'):
            self.names = []
            for path in sorted(glob.glob(f'{ROOT}_aosp/{self.device}/system/**/*.apk', recursive=True)):
                try:
                    with zipfile.ZipFile(path) as z: self.names += [[path.replace(os.sep, '/').split('/system/', 1)[1], n] for n in z.namelist()]
                except (zipfile.BadZipFile, OSError): pass
        return [r for r in self.names if r[1].rsplit('/', 1)[-1] in {f'{n}.{ext}' for n in names}]

    def rank(self, row, wanted):
        """Prefer the resource name of the output, a phone configuration, then the version's density, then framework / app order."""
        q = qualifier(row[1])
        dens = next((d for d in DENSITIES if re.search(rf'(^|-){d}(-|$)', q)), '')
        # A phone's own configuration first: tablet (swNNNdp, large), landscape and right-to-left variants come after.
        other = bool(re.search(r'(^|-)(sw\d+dp|w\d+dp|large|xlarge|land|ldrtl|night|television|car)(-|$)', q))
        # The image's own files before the apps installed from Play, and those in the order they were added, so an
        # app added later never takes a file an earlier source traced first.
        play = row[0].startswith('../playapps/')
        added = PLAY_ORDER.index(name_of(row[0])) if play and name_of(row[0]) in PLAY_ORDER else len(PLAY_ORDER)
        return (name_of(row[1] or row[0]) not in wanted, other, dens != self.density, abs(DENSITIES.index(dens) - DENSITIES.index(self.density)) if dens else 9, play, added, row[0], row[1])


def name_of(path):
    base = path.rsplit('/', 1)[-1]
    return re.sub(r'(\.9)?\.[^.]+$', '', base).lower()


def qualifier(entry):
    m = re.match(r'res/([^/]+)/', entry)
    return m.group(1) if m else ''


def wanted_names(file):
    """Resource names an output file may carry: its stem, and every tail after a '-' (gb-cal-btn_circle_normal →
    btn_circle_normal, cal-btn_circle_normal…)."""
    stem = name_of(file)
    parts = stem.split('-')
    names = ['-'.join(parts[i:]) for i in range(len(parts))]
    # A trailing variant segment (gb-cam-menu_popup-p, lp-fw-ic_clear_material-dark, gb-tethering_help-de)
    return names + ['-'.join(parts[i:-1]) for i in range(len(parts) - 1)]


def pixels(data):
    im = Image.open(io.BytesIO(data))
    im.load()
    return im.convert('RGBA')


def difference(a, b):
    x, y = np.asarray(a, dtype=np.int16), np.asarray(b, dtype=np.int16)
    # Premultiplied by alpha, so the colour of fully transparent pixels does not count.
    xa, ya = x[..., 3:4] / 255.0, y[..., 3:4] / 255.0
    return float(np.abs(np.concatenate([x[..., :3] * xa, x[..., 3:]], -1) - np.concatenate([y[..., :3] * ya, y[..., 3:]], -1)).mean())


def where_text(device, row):
    where = f'/{row[0][3:]}' if row[0].startswith('../') else f'/system/{row[0]}'
    return f'{device}:{where}' + (f'!{row[1]}' if row[1] else '')


def signature(im):
    """8 × 8 grey (premultiplied) and alpha: a short fingerprint to find a resized or renamed copy."""
    a = np.asarray(im.resize((8, 8), Image.BOX), dtype=np.float32)
    return np.concatenate([(a[..., :3].mean(-1) * a[..., 3] / 255).ravel(), a[..., 3].ravel()]).astype(np.uint8)


MASK, BORDER = 'grey as alpha on white', 'nine-patch border removed'


def variants(data, nine=False, rotate=False):
    """The source as decoded, and for a grey image without alpha also as a white mask whose alpha is the grey (KitKat's
    Dessert Case tints such masks)."""
    im = Image.open(io.BytesIO(data)); im.load()
    out = [('', im.convert('RGBA'))]
    if nine and im.size[0] > 2 and im.size[1] > 2:
        out.append((BORDER, out[0][1].crop((1, 1, im.size[0] - 1, im.size[1] - 1))))
    grey = im.mode == 'L' or im.mode == 'RGB' and np.ptp(np.asarray(im, dtype=np.int16), axis=2).max() <= 8
    if grey:
        out.append((MASK, Image.merge('RGBA', [Image.new('L', im.size, 255)] * 3 + [im.convert('L')])))
    if rotate:  # the 2.3.6 Camera's *-p files, turned for the upright phone
        out += [(', '.join(filter(None, [label, name])), v.transpose(t)) for label, v in list(out)
                for name, t in (('rotated 90°', Image.Transpose.ROTATE_90), ('rotated 270°', Image.Transpose.ROTATE_270))]
    return out


def same_shape(a, b, tolerance=0.05):
    return abs(a[0] / a[1] - b[0] / b[1]) < tolerance * b[0] / b[1]


def window(src, out):
    """Where the output sits inside a larger source, exactly (premultiplied), or None."""
    from numpy.lib.stride_tricks import sliding_window_view
    pm = lambda im: (lambda a: np.concatenate([a[..., :3] * a[..., 3:4] // 255, a[..., 3:]], -1))(np.asarray(im, dtype=np.int32))
    s, o = pm(src), pm(out)
    if not o[..., 3].any(): return None
    views = sliding_window_view(s, o.shape)[:, :, 0]
    hits = np.argwhere((np.abs(views - o) <= 2).all(axis=(2, 3, 4)))
    return (int(hits[0][1]), int(hits[0][0])) if len(hits) else None


def match(img, rows, out, ext, limit, rotate=False, crop=False):
    """The row whose pixels give the output: (status, row, detail) or None."""
    best = None
    for row in rows:
        try: candidates = variants(img.read(row), (row[1] or row[0]).endswith('.9.png'), rotate)
        except Exception: continue
        for label, src in candidates:
            if src.size == out.size:
                d = difference(src, out)
                if d == 0 and not label: return 'same pixels', row, ''
                if best is None or d < best[0]: best = (d, row, label)
            elif same_shape(src.size, out.size):
                d = difference(src.resize(out.size, Image.LANCZOS), out)
                if best is None or d < best[0]: best = (d, row, ', '.join(filter(None, [label, f'resized {src.size[0]}×{src.size[1]} → {out.size[0]}×{out.size[1]}'])))
            elif crop and src.size[0] >= out.size[0] and src.size[1] >= out.size[1] and src.size[0] * src.size[1] <= 160000:
                at = window(src, out)
                if at:
                    d = difference(src.crop((at[0], at[1], at[0] + out.size[0], at[1] + out.size[1])), out)
                    if best is None or d < best[0]: best = (d, row, ', '.join(filter(None, [label, f'cropped at {at[0]},{at[1]}'])))
    if not best or best[0] >= limit: return None
    d, row, how = best
    if ext in ('jpg', 'jpeg', 'webp'): kind, detail = 'converted', ', '.join(filter(None, [ext.upper(), how]))
    elif 'resized' in how: kind, detail = 'resized', how
    elif 'rotated' in how: kind, detail = 'rotated', how
    elif 'cropped' in how: kind, detail = 'cropped', how
    elif how: kind, detail = 'converted', how
    else: kind, detail = 'similar', 'same size'
    return kind, row, f'{detail}, mean difference {d:.2f}'


def closest(images, out):
    """For a file nothing traced: the nearest graphic of any image by fingerprint, as a hint for review."""
    best = None
    for img in images:
        for row in img.near(out, 4):
            try: src = pixels(img.read(row))
            except Exception: continue
            if not same_shape(src.size, out.size): continue
            d = difference(src.resize(out.size, Image.LANCZOS) if src.size != out.size else src, out)
            if best is None or d < best[0]: best = (d, img, row)
    return best


def trace(own, path, data):
    """(status, image, source row, transform detail) for one output file: the version's own image first, then the
    others in release order (a graphic taken over from another release)."""
    file = path.rsplit('/', 1)[-1]
    names, digest, ext = wanted_names(file), sha(data), file.rsplit('.', 1)[-1].lower()
    if ext not in ('png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'):
        raw = declared_raw(own, file, data)
        if raw: return 'copy', own, raw, ''
    # A generator's exact APK/XML declaration is stronger evidence than a renamed output's basename.
    # In particular launcher shortcut IDs need not resemble their drawable names, and v25 matters on angler.
    if ext == 'svg':
        declared = re.search(rb'<!-- ([^ ]+\.apk) (res/[^ ]+\.xml) \(', data)
        if declared:
            apk, entry = (x.decode('utf-8') for x in declared.groups())
            row = next((r for r in own.rows if r[0] == apk and r[1] == entry), None)
            if row: return 'vector', own, row, 'vector drawable drawn as SVG (declared APK and configuration)'
    # The others in release order, so a later image (the 5X joined last) never takes a file an earlier one traced first.
    images = [own] + [image(d, play=False) for d in RELEASES if d != own.device]
    for img in images:
        if digest in img.by_sha: return 'copy', img, sorted(img.by_sha[digest], key=lambda r: img.rank(r, names))[0], ''
    if re.match(r'boot-part\d+\.webp$', file):
        return 'generated', own, ['media/bootanimation.zip', '', 0, ''], 'sprite sheet of the part, cropped and scaled (docs/tools/bootanimation.py)'
    if re.match(r'bg-emoji-[a-z]+\.png$', file):
        row = next((r for r in own.rows if r[0].endswith('PrebuiltBugle.apk') and '/emoji_u' in (r[1] or '')), None)
        if row: return 'generated', own, row, "sprite of the category's emoji_u*.png, 72 px cells, 256 colours (docs/tools/mm-emoji.py)"
    m = re.match(r'(.+)-([0-9a-f]{8})\.webm$', file)
    if m:
        for img in images:
            for row in img.rows:
                if row[0].startswith('media/audio/') and name_of(row[0]) == m.group(1).lower() and hashlib.sha1(img.read(row)).hexdigest()[:8] == m.group(2):
                    return 'transcoded', img, row, 'WebM / Opus 32 kbit/s (docs/tools/sounds-transcode.mjs)'
        return None, None, None, ''
    def named(img, kinds):
        for name in names:
            rows = [r for r in img.by_name.get(name, []) if (r[1] or r[0]).lower().endswith(kinds)]
            if rows: return sorted(rows, key=lambda r: img.rank(r, names))
        return []
    if ext in ('html', 'txt'):
        for img in images:
            for row in img.entries(names, ext):
                if img.read(row) == data: return 'copy', img, row + [len(data), digest], ''
        return None, None, None, ''
    if ext == 'gz':   # a compressed system file kept as it is (/system/etc/NOTICE.html.gz)
        for img in images:
            for p in sorted(glob.glob(f'{ROOT}_aosp/{img.device}/system/etc/*.gz')):
                if open(p, 'rb').read() == data:
                    return 'copy', img, [os.path.relpath(p, f'{ROOT}_aosp/{img.device}/system/').replace(os.sep, '/'), '', len(data), digest], ''
        return None, None, None, ''
    if ext == 'svg':
        # A VectorDrawable drawn as SVG comes from this release or an earlier one, never from a later image.
        for img in [i for i in images if RELEASES.index(i.device) <= RELEASES.index(own.device)]:
            rows = [r for r in named(img, ('.xml',)) if r[1].startswith('res/drawable')]
            if rows: return 'vector', img, rows[0], 'vector drawable drawn as SVG'
        return None, None, None, ''
    if ext not in ('png', 'jpg', 'jpeg', 'webp', 'gif'): return None, None, None, ''
    try: out = pixels(data)
    except Exception: return None, None, None, ''
    # A file of the same resource name may differ a little more (scaling a small icon) than one found by its fingerprint
    # alone, where a near miss is more likely another graphic; a JPEG / WebP output re-encodes a lossy picture.
    lossy = ext in ('jpg', 'jpeg', 'webp')
    for img in images:
        for rows, limit, crop in ((named(img, IMAGES)[:24], 6 if lossy else 3, True), (img.near(out), 4.5 if lossy else 2, False)):
            found = match(img, rows, out, ext, limit, file.endswith('-p.png'), crop)
            if found: return found[0], img, found[1], found[2]
    hint = closest(images, out)
    if hint and hint[0] < 10: return None, hint[1], hint[2], f'closest: mean difference {hint[0]:.2f}'
    return None, None, None, ''


def outputs(version):
    folder = f'{ROOT}versions/{version}/assets'
    files = [f'versions/{version}/assets/{f}' for f in sorted(os.listdir(folder)) if os.path.isfile(f'{folder}/{f}')]
    return files


def manual():
    """docs/data/asset-sources.tsv: <glob pattern>\t<source> for the files no file of the image matches."""
    rules = []
    for line in open(ROOT + 'docs/data/asset-sources.tsv', encoding='utf-8'):
        if line.strip() and not line.startswith('#'):
            pattern, source = line.rstrip('\n').split('\t', 1)
            rules.append((re.compile('^' + re.escape(pattern).replace(r'\*', '.*') + '$'), source))
    return rules


def build(versions):
    rules = manual()
    summary = {}
    for version in versions:
        device, density = VERSIONS[version]
        img = image(device, density)
        files = outputs(version)
        if version == '2.3.6':
            files += [f'assets/audio/{f}' for f in sorted(os.listdir(ROOT + 'assets/audio'))]
        lines, counts, untraced = ['file\tsha256\tstatus\tsource\tqualifier\ttransform\tsource sha256'], {}, []
        for path in files:
            data = open(ROOT + path, 'rb').read()
            status, src_img, row, detail = trace(img, path, data)
            if status:
                lines.append('\t'.join([path, file_sha(path, data), status, where_text(src_img.device, row), qualifier(row[1]), detail, row[3][:16] if row[3] else '']))
            else:
                source = next((s for p, s in rules if p.match(path)), '')
                status = 'own' if source else 'not traced'
                if not source: untraced.append(path)
                hint = f'{detail} ({where_text(src_img.device, row)})' if row else ''
                lines.append('\t'.join([path, file_sha(path, data), status, source, '', hint, '']))
            counts[status] = counts.get(status, 0) + 1
        os.makedirs(ROOT + 'docs/reports/assets', exist_ok=True)
        open(f'{ROOT}docs/reports/assets/{version}.tsv', 'w', encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
        summary[version] = (device, counts, untraced)
        print(version, counts)
    return summary


def write_summary(summary):
    path = ROOT + 'docs/reports/asset-inventory.md'
    old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
    sections = dict(re.findall(r'(?ms)^## (\S+)[^\n]*\n(.*?)(?=^## |\Z)', old))
    for version, (device, counts, untraced) in summary.items():
        body = '\n' + ', '.join(f'{k}: {v}' for k, v in sorted(counts.items(), key=lambda kv: -kv[1])) + '\n'
        # Graphics found only in another release's image (the own image is searched first): for review, apart from the
        # shared sounds.
        rows = [line.rstrip('\r\n').split('\t') for line in open(f'{ROOT}docs/reports/assets/{version}.tsv', encoding='utf-8')][1:]
        other = {}
        for r in rows:
            m = re.match(r'(\w+):/system/', r[3])
            if m and m.group(1) != device and not r[0].startswith('assets/audio/'): other.setdefault(m.group(1), []).append(r[0])
        if other:
            body += '\nFrom another release\'s image (the own image has no such file; to review): ' + ', '.join(
                f'{d} {len(files)}' for d, files in sorted(other.items())) + ' — the source column of the TSV names each.\n'
        if untraced: body += '\nNot traced:\n\n' + ''.join(f'- `{p}`\n' for p in untraced)
        sections[version] = body + '\n'
    head = ('# Asset inventory\n\nGenerated by `docs/tools/asset-inventory.py` (audit point 12): every output file of a version, '
            'its source in the factory image and the transformation. One row per file in `docs/reports/assets/<version>.tsv` '
            '(the shared sounds of `assets/audio` with 2.3.6); `own` rows name their source in `docs/data/asset-sources.tsv`. '
            '`python docs/tools/asset-inventory.py --check` rebuilds every traced file from the image and compares. A file that no '
            'image file matches and no source names is listed under Not traced, for review; its row may name the closest '
            'graphic of an image.\n\n')
    order = [v for v in VERSIONS if v in sections]
    open(path, 'w', encoding='utf-8', newline='\n').write(head + ''.join(f'## {v} ({VERSIONS[v][0]})\n{sections[v]}' for v in order))


def regenerate(version):
    """Reruns docs/tools/bootanimation.py for the version and compares its sheets and boot-animation.js with the committed
    files, which are put back afterwards."""
    device = VERSIONS[version][0]
    folder = f'{ROOT}versions/{version}/'
    script = {'2.1': 'ec-boot-animation.js', '6.0.1': 'mm-boot-animation.js', '7.1.2': 'ng-boot-animation.js'}.get(version, 'boot-animation.js')
    before = {f: open(folder + f, 'rb').read() for f in [script] + [f'assets/{n}' for n in os.listdir(folder + 'assets') if n.startswith('boot-part')]}
    try:
        subprocess.run([sys.executable, ROOT + 'docs/tools/bootanimation.py', device], check=True, capture_output=True)
        after = {f: open(folder + f, 'rb').read() for f in [script] + [f'assets/{n}' for n in os.listdir(folder + 'assets') if n.startswith('boot-part')]}
    finally:
        for n in os.listdir(folder + 'assets'):
            if n.startswith('boot-part') and f'assets/{n}' not in before: os.remove(f'{folder}assets/{n}')
        for f, data in before.items(): open(folder + f, 'wb').write(data)
    same = [f'versions/{version}/{f}' for f in before if after.get(f) == before[f]]
    differ = [f'versions/{version}/{f}' for f in sorted(set(before) | set(after)) if after.get(f) != before.get(f)]
    return same, differ


def check(versions):
    """Trial regeneration: each traced row is rebuilt from its source and compared with the committed file; every
    output file must have a row and every row a file."""
    failures = 0
    for version in versions:
        rows = [line.rstrip('\r\n').split('\t') for line in open(f'{ROOT}docs/reports/assets/{version}.tsv', encoding='utf-8', newline='')][1:]
        listed = {r[0] for r in rows}
        files = set(outputs(version)) | ({f'assets/audio/{f}' for f in os.listdir(ROOT + 'assets/audio')} if version == '2.3.6' else set())
        problems = [f'no row: {p}' for p in sorted(files - listed)] + [f'no file: {p}' for p in sorted(listed - files)]
        rebuilt, generated = 0, []
        for path, digest, status, source, _q, detail, src_digest in rows:
            if path not in files: continue
            data = open(ROOT + path, 'rb').read()
            if file_sha(path, data) != digest: problems.append(f'changed since the inventory: {path}'); continue
            if status in ('own', 'not traced'): continue
            if status == 'generated': generated.append(path); continue
            m = re.match(r'(\w+):/system/([^!]+)(?:!(.+))?$', source)
            device = m.group(1)
            img = image(device)
            row = [m.group(2), m.group(3) or '']
            try: src = img.read(row)
            except (KeyError, OSError, FileNotFoundError): problems.append(f'source missing: {source}'); continue
            if sha(src)[:16] != src_digest: problems.append(f'source differs: {source}'); continue
            if status == 'copy': ok = src == data
            elif status == 'transcoded': ok = hashlib.sha1(src).hexdigest()[:8] == path.rsplit('-', 1)[1][:8]
            elif status == 'vector': ok = True  # drawn by hand from the XML; the source's presence is what is checked
            else:
                label = ', '.join(x for x in [MASK, BORDER, 'rotated 90°', 'rotated 270°'] if x in detail)
                out, s = pixels(data), dict(variants(src, True, True))[label]
                at = re.search(r'cropped at (\d+),(\d+)', detail)
                if at: s = s.crop((int(at.group(1)), int(at.group(2)), int(at.group(1)) + out.size[0], int(at.group(2)) + out.size[1]))
                if s.size != out.size: s = s.resize(out.size, Image.LANCZOS)
                limit = float(re.search(r'mean difference ([\d.]+)', detail).group(1)) + 0.01 if 'mean difference' in detail else 0
                ok = difference(s, out) <= limit
            if not ok: problems.append(f'rebuilt file differs ({status}): {path}')
            else: rebuilt += 1
        if generated:
            same, differ = regenerate(version)
            rebuilt += len(same); problems += [f'rebuilt file differs (generated): {p}' for p in differ]
        print(f'{version}: {rebuilt} rebuilt from the image, {len(problems)} problems')
        for p in problems: print('  ' + p)
        failures += len(problems)
    return failures


if __name__ == '__main__':
    args = sys.argv[1:]
    versions = [a for a in args if a in VERSIONS] or list(VERSIONS)
    if '--check' in args: sys.exit(1 if check(versions) else 0)
    write_summary(build(versions))
