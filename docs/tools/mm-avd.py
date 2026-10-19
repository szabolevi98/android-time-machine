"""Android 6.0.1: converts SystemUI's Quick Settings AnimatedVectorDrawables into SVG with SMIL and writes
versions/6.0.1/mm-qs-icons.js. The source XML (android-6.0.1_r81, the same as the image's compiled files) comes from
docs/tools/fetch-sui-avd.py; run from the repository root:
    python docs/tools/mm-avd.py
7.1.2 (ERA=ng, docs/tools/era.py) reads the angler image's own compiled XML, written back as plain XML by
docs/tools/res-xml.py into _aosp/angler/refs/sui-xml, and writes versions/7.1.2/ng-qs-icons.js:
    ERA=ng python docs/tools/mm-avd.py
VectorDrawable 6.0 semantics (as 5.1): a group is translate(tx + px, ty + py) rotate(r) scale(sx, sy) translate(-px, -py); a
clip-path clips the siblings after it; only the root (VPathRenderer) has alpha, so group alpha animators do nothing;
sequential sets add their children's durations. Every interpolator here is one cubic, which SMIL keySplines reproduce."""
import json, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from era import ERA, VERSION, JS, out as era_out
import xml.etree.ElementTree as ET

RES = os.environ.get('AVD_RES') or ('_aosp/angler/refs/sui-xml' if ERA == 'ng' else '_aosp/bullhead/refs/sui-avd-res')
A = '{http://schemas.android.com/apk/res/android}'
ICONS = ['ic_signal_airplane', 'ic_signal_flashlight', 'ic_signal_location', 'ic_hotspot']
NAMES = [f'{base}_{kind}_animation' for base in ICONS for kind in ('enable', 'disable')]
NAMES += [f'ic_portrait_{d}_auto_rotate_animation' for d in ('from', 'to')] + ['ic_dnd_disable_animation', 'ic_dnd_total_silence_disable_animation']
# Nougat: QuickStatusBarHeader's ExpandableIndicator turns with ic_volume_expand_animation / ic_volume_collapse_animation.
if ERA == 'ng': NAMES += ['ic_volume_expand_animation', 'ic_volume_collapse_animation']
# The animated properties this tool draws; any other stops it rather than being left out silently.
DONE = {'pathData', 'fillAlpha', 'strokeAlpha', 'strokeWidth', 'rotation', 'scaleX', 'scaleY', 'alpha'}
BUILTIN = {'fast_out_slow_in': (.4, 0, .2, 1), 'linear_out_slow_in': (0, 0, .2, 1), 'fast_out_linear_in': (.4, 0, 1, 1), 'linear': None}

def xml(kind, name): return ET.parse(os.path.join(RES, kind, name + '.xml')).getroot()
def ref(value): return value.split('/')[-1]
def num(value, default=0.0): return float(value) if value is not None else default
def color(value):
    v = value.lstrip('#')
    if len(v) == 8: return '#' + v[2:], int(v[:2], 16) / 255
    if len(v) == 6: return '#' + v, 1.0
    return '#' + ''.join(c * 2 for c in v[-3:]), 1.0

def spline(interp):
    name = ref(interp)
    if name in BUILTIN: return BUILTIN[name]
    d = xml('interpolator', name).get(A + 'pathData')
    x1, y1, x2, y2 = [float(n) for n in re.findall(r'-?[\d.]+', d)[2:6]]
    return (x1, y1, x2, y2)

def animators(node, start=0):
    """(property, from, to, begin ms, duration ms, spline) for an animator set, and the set's end time."""
    out = []
    if node.tag == 'objectAnimator':
        begin = start + num(node.get(A + 'startOffset'))
        dur = num(node.get(A + 'duration'), 300)
        # A move along a path (Nougat's chevrons: propertyXName translateX, propertyYName translateY): PathKeyframes
        # follows the path by its length, so a straight path is a plain move from its first point to its last.
        if node.get(A + 'propertyXName'):
            nums = [float(n) for n in re.findall(r'-?[\d.]+', node.get(A + 'pathData'))]
            x0, y0, dx, dy = nums[0], nums[1], nums[-2], nums[-1]
            assert re.fullmatch(r'M[\d.,\s-]+c[\d.,\s-]+', node.get(A + 'pathData')) and all(abs(nums[2 + 2 * i] * dy - nums[3 + 2 * i] * dx) < 1e-3 for i in range(3)), 'a curved motion path'
            sp = spline(node.get(A + 'interpolator') or 'linear')
            return [('translate', f'{x0:g} {y0:g}', f'{x0 + dx:g} {y0 + dy:g}', begin, dur, sp)], begin + dur
        if node.get(A + 'propertyName') not in DONE: raise SystemExit(f"{node.get(A + 'propertyName')}: not drawn by this tool")
        out.append((node.get(A + 'propertyName'), node.get(A + 'valueFrom'), node.get(A + 'valueTo'), begin, dur, spline(node.get(A + 'interpolator') or 'linear')))
        return out, begin + dur
    sequential = node.get(A + 'ordering') == 'sequentially'
    t, end = start, start
    for child in node:
        items, child_end = animators(child, t if sequential else start)
        out += items; end = max(end, child_end)
        if sequential: t = child_end
    return out, end

def convert(name):
    avd = xml('drawable', name)
    vector = xml('drawable', ref(avd.get(A + 'drawable')))
    targets, total = {}, 0
    for target in avd:
        items, end = animators(xml('anim', ref(target.get(A + 'animation'))))
        targets[target.get(A + 'name')] = items; total = max(total, end)
    ids = {'n': 0}
    def anim(attr, items, fmt=lambda v: v):
        out = []
        for prop, a, b, begin, dur, sp in items:
            calc = f' calcMode="spline" keyTimes="0;1" keySplines="{" ".join(f"{v:g}" for v in sp)}"' if sp else ''
            out.append(f'<animate attributeName="{attr}" values="{fmt(a)};{fmt(b)}" begin="{begin / 1000:g}s" dur="{max(dur, 1) / 1000:g}s" fill="freeze"{calc}/>')
        return ''.join(out)
    def transform(kind, items, values):
        out = []
        for prop, a, b, begin, dur, sp in items:
            calc = f' calcMode="spline" keyTimes="0;1" keySplines="{" ".join(f"{v:g}" for v in sp)}"' if sp else ''
            out.append(f'<animateTransform attributeName="transform" type="{kind}" values="{values(a)};{values(b)}" begin="{begin / 1000:g}s" dur="{max(dur, 1) / 1000:g}s" fill="freeze"{calc}/>')
        return ''.join(out)
    def path_el(node):
        n = node.get(A + 'name'); items = targets.get(n, [])
        d = node.get(A + 'pathData')
        attrs = [f'd="{d}"']
        if node.get(A + 'fillColor'):
            c, a = color(node.get(A + 'fillColor')); a *= num(node.get(A + 'fillAlpha'), 1)
            attrs.append(f'fill="{c}" fill-opacity="{a:g}"')  # even at 0: fillAlpha may animate it in
        else: attrs.append('fill="none"')
        if node.get(A + 'strokeColor'):
            c, a = color(node.get(A + 'strokeColor')); a *= num(node.get(A + 'strokeAlpha'), 1)
            attrs.append(f'stroke="{c}" stroke-opacity="{a:g}" stroke-width="{num(node.get(A + "strokeWidth"), 0):g}"')
            cap = node.get(A + 'strokeLineCap'); join = node.get(A + 'strokeLineJoin')
            if cap: attrs.append(f'stroke-linecap="{cap}"')
            if join: attrs.append(f'stroke-linejoin="{join}"')
        inner = anim('d', [i for i in items if i[0] == 'pathData'])
        inner += anim('fill-opacity', [i for i in items if i[0] == 'fillAlpha'])
        inner += anim('stroke-opacity', [i for i in items if i[0] == 'strokeAlpha'])
        inner += anim('stroke-width', [i for i in items if i[0] == 'strokeWidth'])
        return f'<path {" ".join(attrs)}>{inner}</path>'
    def children(node):
        out, clip = [], None
        for child in node:
            if child.tag == 'clip-path':
                ids['n'] += 1; cid = f'{name}-c{ids["n"]}'
                items = [i for i in targets.get(child.get(A + 'name'), []) if i[0] == 'pathData']
                defs = f'<clipPath id="{cid}"><path d="{child.get(A + "pathData")}">{anim("d", items)}</path></clipPath>'
                out.append(defs); clip = cid; out.append(f'<g clip-path="url(#{cid})">')
            elif child.tag == 'group': out.append(group(child))
            elif child.tag == 'path': out.append(path_el(child))
        if clip: out.append('</g>')
        return ''.join(out)
    def group(node):
        n = node.get(A + 'name'); items = targets.get(n, [])
        tx, ty = num(node.get(A + 'translateX')), num(node.get(A + 'translateY'))
        px, py = num(node.get(A + 'pivotX')), num(node.get(A + 'pivotY'))
        r = num(node.get(A + 'rotation')); sx, sy = num(node.get(A + 'scaleX'), 1), num(node.get(A + 'scaleY'), 1)
        rot = transform('rotate', [i for i in items if i[0] == 'rotation'], lambda v: f'{float(v):g}')
        sxi = [i for i in items if i[0] == 'scaleX']; syi = [i for i in items if i[0] == 'scaleY']
        # scaleX and scaleY animate together in these icons (same timing); pair them into one scale transform.
        assert len(sxi) == len(syi) and all(a[3:5] == b[3:5] for a, b in zip(sxi, syi)), name
        sc = ''
        for x, y in zip(sxi, syi):
            calc = f' calcMode="spline" keyTimes="0;1" keySplines="{" ".join(f"{v:g}" for v in x[5])}"' if x[5] else ''
            sc += (f'<animateTransform attributeName="transform" type="scale" values="{float(x[1]):g} {float(y[1]):g};{float(x[2]):g} {float(y[2]):g}" '
                   f'begin="{x[3] / 1000:g}s" dur="{max(x[4], 1) / 1000:g}s" fill="freeze"{calc}/>')
        body = children(node)
        moves = [i for i in items if i[0] == 'translate']
        if moves:
            # The group's translation animates: its own translate, then the pivot's.
            return (f'<g transform="translate({tx:g} {ty:g})">{transform("translate", moves, lambda v: v)}<g transform="translate({px:g} {py:g})">'
                    f'<g transform="rotate({r:g})">{rot}<g transform="scale({sx:g} {sy:g})">{sc}<g transform="translate({-px:g} {-py:g})">{body}</g></g></g></g></g>')
        return (f'<g transform="translate({tx + px:g} {ty + py:g})"><g transform="rotate({r:g})">{rot}<g transform="scale({sx:g} {sy:g})">{sc}'
                f'<g transform="translate({-px:g} {-py:g})">{body}</g></g></g></g>')
    w, h = vector.get(A + 'viewportWidth'), vector.get(A + 'viewportHeight')
    root_items = [i for i in targets.get(vector.get(A + 'name'), []) if i[0] == 'alpha']
    alpha = num(vector.get(A + 'alpha'), 1)
    svg = (f'<svg class="{ERA}-avd" viewBox="0 0 {w} {h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
           f'<g opacity="{alpha:g}">{anim("opacity", root_items)}{children(vector)}</g></svg>')
    return svg, total

out = {}
for name in NAMES:
    svg, total = convert(name)
    out[name] = {'svg': svg, 'duration': round(total)}
js = (f'/* Generated by docs/tools/mm-avd.py from SystemUI {VERSION} (Quick Settings AnimatedVectorDrawables). Do not edit. */\n'
      f'{JS}.qsIcons = ' + json.dumps(out, separators=(',', ':')) + ';\n')
open(era_out('qs-icons.js'), 'w', encoding='utf-8', newline='\n').write(js)
print(len(out), 'icons', len(js), 'bytes', {k: v['duration'] for k, v in out.items()})
