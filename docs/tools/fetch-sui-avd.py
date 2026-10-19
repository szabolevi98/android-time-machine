"""Fetches the source XML of SystemUI's Quick Settings AnimatedVectorDrawables at android-6.0.1_r81 (the drawable,
its vector, its animators and their interpolators, following the references) into _aosp/bullhead/refs/sui-avd-res/,
for docs/tools/mm-avd.py:
    python docs/tools/fetch-sui-avd.py"""
import base64, os, re, time, urllib.error, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) + '/'
OUT = ROOT + '_aosp/bullhead/refs/sui-avd-res/'
BASE = 'https://android.googlesource.com/platform/frameworks/base/+/refs/tags/android-6.0.1_r81/packages/SystemUI/res/'
START = ['ic_signal_airplane', 'ic_signal_flashlight', 'ic_signal_location', 'ic_hotspot']
NAMES = [f'drawable/{b}_{k}_animation' for b in START for k in ('enable', 'disable')]
NAMES += [f'drawable/ic_portrait_{d}_auto_rotate_animation' for d in ('from', 'to')]
NAMES += ['drawable/ic_dnd_disable_animation', 'drawable/ic_dnd_total_silence_disable_animation']
seen = set()
while NAMES:
    ref = NAMES.pop()
    if ref in seen: continue
    seen.add(ref)
    path = OUT + ref + '.xml'
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        for attempt in range(8):
            try: data = base64.b64decode(urllib.request.urlopen(BASE + ref + '.xml?format=TEXT').read()); break
            except urllib.error.HTTPError as e:
                if e.code != 429: raise
                time.sleep(5 * (attempt + 1))
        time.sleep(1.5)
        open(path, 'wb').write(data)
    text = open(path, encoding='utf-8').read()
    for kind, name in re.findall(r'"@(drawable|anim|interpolator)/([\w]+)"', text):
        NAMES.append(f'{kind}/{name}')
print(len(seen), 'files in', OUT)
