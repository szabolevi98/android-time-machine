"""Restore the owner-approved saved pre-OTA Nexus 6P wallpaper, or verify its exact bytes.

python docs/tools/ng-retained-wallpaper.py <MDB08K framework-res.apk>
python docs/tools/ng-retained-wallpaper.py --check

Source: Google's angler-mdb08k-factory-46550886.zip; see docs/sources.md.
This is intentionally separate from the N2G48C native asset extraction lists.
"""
import hashlib
from pathlib import Path
import sys
import zipfile

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'versions/7.1.2/assets/saved-nexus-6p-marshmallow.jpg'
ENTRY = 'res/drawable-nodpi-v4/default_wallpaper.jpg'
APK_SHA = 'c0e3a915d5b92c07b15d8d47e19507f22ed0ade2d1a7bc3148c551616b5a55f2'
IMAGE_SHA = '8e8782b9e47ea0c14a966b32296d27172c4a5ec1c85dc5293be5aee5c2928f15'

def verified(data, expected, name):
    if hashlib.sha256(data).hexdigest() != expected:
        raise SystemExit(f'{name}: SHA-256 differs from MDB08K')
    return data

if sys.argv[1:] == ['--check']:
    verified(OUT.read_bytes(), IMAGE_SHA, OUT.name)
    print('Retained Nexus 6P wallpaper: exact MDB08K bytes')
elif len(sys.argv) == 2:
    source = Path(sys.argv[1])
    verified(source.read_bytes(), APK_SHA, source.name)
    with zipfile.ZipFile(source) as apk:
        data = verified(apk.read(ENTRY), IMAGE_SHA, ENTRY)
    OUT.write_bytes(data)
    print(f'Wrote {OUT.name}: {len(data)} unmodified bytes')
else:
    raise SystemExit(__doc__)
