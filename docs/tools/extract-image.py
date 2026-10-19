"""Unpacks a Nexus factory image into _aosp/<device> for the generators (docs/tools/image-index.py, docs/tools/apk-strings.py,
docs/tools/texts.mjs …): factory .tgz or .zip -> image-*.zip -> system.img (Android sparse or raw ext4) -> system.raw.img, and
from it /system/app, /system/priv-app (4.4+), /system/framework (APKs and JARs), /system/media and /system/fonts (every
file) and build.prop under _aosp/<device>/system. _aosp/ stays out of Git; this script, its inputs and its outputs are
described in docs/sources.md.
    python docs/tools/extract-image.py _aosp/<device> <factory .tgz or .zip>
e.g. python docs/tools/extract-image.py _aosp/mako _aosp/mako/occam-jwr66y-factory-74b1deab.tgz
Needs the Python package ext4 (pip install ext4). An existing system.raw.img is reused."""
import io, os, struct, sys, tarfile, zipfile
import ext4
from ext4.inode import Directory, SymbolicLink

ROOT, FACTORY = sys.argv[1].rstrip('/'), sys.argv[2]
RAW, OUT = f'{ROOT}/system.raw.img', f'{ROOT}/system'

def unsparse(src, dst):
    # Android sparse image: 28-byte header, then chunks (RAW 0xCAC1, FILL 0xCAC2, DONT_CARE 0xCAC3, CRC32 0xCAC4).
    magic, major, minor, fhdr, chdr, blk, blocks, chunks, _ = struct.unpack('<IHHHHIIII', src.read(28))
    assert magic == 0xED26FF3A, hex(magic)
    src.read(fhdr - 28)
    for _ in range(chunks):
        ctype, _, size, total = struct.unpack('<HHII', src.read(12))
        src.read(chdr - 12)
        if ctype == 0xCAC1:
            left = size * blk
            while left:
                part = src.read(min(left, 1 << 24)); dst.write(part); left -= len(part)
        elif ctype == 0xCAC2:
            fill = src.read(4) * (blk // 4)
            for _ in range(size): dst.write(fill)
        elif ctype == 0xCAC3:
            dst.seek(size * blk, 1)
        elif ctype == 0xCAC4:
            src.read(4)
    dst.truncate(blocks * blk)

def image_zip():
    """The factory package's inner image-*.zip, from a .tgz (up to 4.4) or a .zip (5.x) package, or that zip itself."""
    if FACTORY.endswith(('.tgz', '.tar.gz')):
        with tarfile.open(FACTORY) as tar:
            inner = next(m for m in tar.getmembers() if os.path.basename(m.name).startswith('image-') and m.name.endswith('.zip'))
            print('inner', inner.name)
            return io.BytesIO(tar.extractfile(inner).read())
    with zipfile.ZipFile(FACTORY) as package:
        if 'system.img' in package.namelist(): return FACTORY
        inner = next(n for n in package.namelist() if os.path.basename(n).startswith('image-') and n.endswith('.zip'))
        print('inner', inner)
        with package.open(inner) as fh: return io.BytesIO(fh.read())

if not os.path.exists(RAW):
    data = image_zip()
    with zipfile.ZipFile(data) as image, image.open('system.img') as src:
        head = src.read(4)
    with zipfile.ZipFile(data) as image, image.open('system.img') as src, open(RAW, 'wb') as dst:
        if struct.unpack('<I', head)[0] == 0xED26FF3A:
            unsparse(src, dst)
        else:  # older factory images ship a raw ext4 system.img
            while chunk := src.read(1 << 24): dst.write(chunk)
    print('raw image', os.path.getsize(RAW))

with open(RAW, 'rb') as fh:
    volume = ext4.Volume(fh)
    count = 0
    def walk(inode, path, everything=False):
        global count
        for dirent, _ in inode.opendir():
            name = dirent.name_bytes.decode('utf-8', 'replace')
            if name in ('.', '..'): continue
            child = volume.inodes[dirent.inode]
            full = f'{path}/{name}'
            if isinstance(child, Directory): walk(child, full, everything); continue
            if isinstance(child, SymbolicLink):
                # e.g. fonts/DroidSans.ttf -> Roboto-Regular.ttf from 4.1 on: the link's file, under the link's name.
                target = child.readlink().decode('utf-8', 'replace')
                try: child = volume.inode_at(target if target.startswith('/') else f'{path}/{target}')
                except OSError: continue  # missing, or through a link that is not a directory here (7.x)
                if isinstance(child, Directory): continue
            if everything or name.endswith(('.apk', '.jar', '.odex', '.oat')):
                target = OUT + full
                os.makedirs(os.path.dirname(target), exist_ok=True)
                with open(target, 'wb') as out: out.write(child.open().read())
                count += 1
    # The system fonts too: the stylesheets name each image's own Roboto / Droid files (audit point 12).
    # 6.0.1 keeps the framework's code in framework/<abi>/boot*.oat and each app's in app/X/oat/<abi>/X.odex
    # (docs/tools/oat2dex.py); /system/etc holds the permission and default-app lists.
    for top, everything in (('app', False), ('priv-app', False), ('framework', False), ('media', True), ('fonts', True), ('etc', True)):
        try: node = volume.inode_at('/' + top)
        except FileNotFoundError: continue
        walk(node, '/' + top, everything)
    os.makedirs(OUT, exist_ok=True)
    with open(f'{OUT}/build.prop', 'wb') as out: out.write(volume.inode_at('/build.prop').open().read())
    print(count, 'files')
