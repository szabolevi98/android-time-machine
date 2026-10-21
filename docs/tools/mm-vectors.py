"""Android 6.0.1: draws the image's VectorDrawables as SVG files for versions/6.0.1/assets (status bar signal and Wi-Fi
levels, quick settings icons …). docs/data/mm-vectors.tsv (and docs/data/mm-vectors-*.tsv) lists them: <output file> TAB <APK under system/> TAB <drawable>
TAB <theme style or -> (the style that resolves ?attr colours, e.g. SystemUI's DualToneLightTheme for the status bar),
or tint=<colour> for a drawable the code draws through a SRC_IN colour filter (a colour may be @android:color/name), or
start for an AnimatedVectorDrawable shown without being started (its base vector instead of the end state).
    python docs/tools/mm-vectors.py
Reads the compiled XML with aapt2 (xmltree) and the colours and styles with aapt2 (dump resources); framework colours
(@0x01…) come from framework-res.apk. VectorDrawable 6.0 semantics: a group is translate(tx + px, ty + py) rotate(r)
scale(sx, sy) translate(-px, -py); a clip-path clips the siblings drawn after it in its group; fillAlpha / strokeAlpha
multiply the colour's own alpha; the root alpha applies to the whole drawing."""
import os, re, subprocess, sys, zipfile
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from era import DEVICE, VERSION, API, data

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))).replace(os.sep, '/') + '/'
SYSTEM = ROOT + f'_aosp/{DEVICE}/system/'
AAPT = 'D:/android_sdk/build-tools/36.0.0/aapt2.exe'
OUT = ROOT + f'versions/{VERSION}/assets/'
FRAMEWORK = 'framework/framework-res.apk'
_tables = {}

def table(apk):
    """Colours {id: value} and styles {id: {attr id: value}} of an APK, from aapt2 dump resources."""
    if apk in _tables: return _tables[apk]
    text = subprocess.run([AAPT, 'dump', 'resources', SYSTEM + apk], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
    colors, styles, names, parents, current = {}, {}, {}, {}, None
    for line in text.splitlines():
        m = re.match(r'\s+resource (0x[0-9a-f]{8}) (\w+)/(\S+)', line)
        if m:
            current = (m.group(1), m.group(2)); names[m.group(2) + '/' + m.group(3)] = m.group(1)
            if current[1] == 'style': styles[current[0]] = {}
            continue
        if not current: continue
        if current[1] == 'dimen':
            v = re.match(r'\s+\(\) ([\d.]+)(dp|dip|px)', line)
            if v and current[0] not in colors: colors[current[0]] = v.group(1) + v.group(2)
        if current[1] == 'color':
            v = re.match(r'\s+\(\) (#[0-9a-f]+|@\S+)', line) or re.match(r'\s+\(\) \(file\) (res/color\S*\.xml) type=XML', line)
            if v and current[0] not in colors: colors[current[0]] = v.group(1) if not v.group(1).startswith('res/') else f'file:{v.group(1)}'
        elif current[1] == 'style':
            p = re.match(r'\s+\(\) \(style\) size=\d+ parent=(?:\S+ \()?(0x[0-9a-f]{8})', line)
            if p and current[0] not in parents: parents[current[0]] = p.group(1)
            v = re.match(r'\s+(\w+)?\((0x[0-9a-f]{8})\)=(\S+)', line) or re.match(r'\s+(0x[0-9a-f]{8})=(\S+)', line)
            if v and len(v.groups()) == 3: styles[current[0]][v.group(2)] = v.group(3)
    _tables[apk] = (colors, styles, names)
    _parents[apk] = parents
    return _tables[apk]

_parents = {}

def theme_attr(apk, theme, attr):
    """A theme attribute's value: the style's own, else its parent's (a framework style for an app theme such as
    SystemUI's systemui_theme, Theme.DeviceDefault.Settings.Dark on 7.1.2)."""
    colors, styles, names = table(apk)
    sid, src = names['style/' + theme], apk
    for _ in range(16):
        own = table(src)[1].get(sid, {})
        # A framework style's @color/name is the framework's.
        if attr in own: return own[attr].replace('@', '@android:', 1) if src == FRAMEWORK and own[attr].startswith('@') and not own[attr].startswith(('@android:', '@0x')) else own[attr]
        sid = _parents[src].get(sid)
        if not sid: break
        src = FRAMEWORK if sid.startswith('0x01') else apk
    raise KeyError(f'{theme}: {attr}')

def color(value, apk, theme):
    """#aarrggbb (or a reference to one) -> (#rrggbb, alpha). A theme "tint=<colour>" is a SRC_IN colour filter: every
    colour becomes the tint, keeping its own alpha times the tint's (UserIcons.getDefaultUserIcon's setColorFilter)."""
    if theme and theme.startswith('tint='):
        # A theme attribute's own colour is not looked up under a tint: it is taken as opaque.
        (c, a), (tc, ta) = color(value, apk, None) if not value.startswith('?') else (None, 1), color(theme[5:], apk, None)
        return tc, a * ta
    src = apk
    for _ in range(8):
        if value.startswith('?'):
            value = theme_attr(apk, theme, value[1:])
            continue
        if value.startswith('@'):
            ref = value[1:]
            # A framework colour's own references (@color/primary_material_settings) stay in the framework.
            src = FRAMEWORK if ref.startswith('0x01') or ref.startswith('android:') or src == FRAMEWORK else apk
            colors, styles, names = table(src)
            rid = ref if ref.startswith('0x') else names.get(ref.split(':')[-1])
            value = colors[rid]
            continue
        if value.startswith('file:'):
            # A ColorStateList: its default item (the last, without states), its colour times its android:alpha.
            text = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + src, '--file', value[5:]], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
            item = text.split('E: item')[-1]
            ref = re.search(r'android:color\(0x[0-9a-f]+\)=(\S+)', item).group(1)
            alpha = re.search(r'android:alpha\(0x[0-9a-f]+\)=([\d.e+-]+)', item)
            c, a = color(ref if not ref.startswith('@0x01') else ref, src, theme)
            return c, a * (float(alpha.group(1)) if alpha else 1)
        break
    v = value.lstrip('#')
    if len(v) == 8: return '#' + v[2:], int(v[:2], 16) / 255
    if len(v) == 6: return '#' + v, 1.0
    if len(v) == 4: return '#' + ''.join(ch * 2 for ch in v[1:]), int(v[0] * 2, 16) / 255
    return '#' + ''.join(ch * 2 for ch in v), 1.0

_xml_paths = {}
_tree_sources = {}
def tree(apk, name, folder='drawable'):
    """The drawable's (or animator's) XML as nested [tag, {attr: value}, children]."""
    text = ''
    # The folder as given, else its -v21 / -anydpi-v21 / -nodpi-v4 variants (GMS Core's ic_google_settings is
    # drawable-anydpi-v21, the Marshmallow egg's pictures drawable-nodpi-v4).
    if apk not in _xml_paths: _xml_paths[apk] = zipfile.ZipFile(SYSTEM + apk).namelist()
    candidates = []
    for path in _xml_paths[apk]:
        hit = re.fullmatch(rf'res/{re.escape(folder)}(?:-(anydpi|nodpi))?(?:-v(\d+))?/{re.escape(name)}\.xml', path)
        if hit and int(hit[2] or 0) <= API: candidates.append((int(hit[2] or 0), hit[1] == 'anydpi', path))
    for _, _, path in sorted(candidates, reverse=True):
        text = subprocess.run([AAPT, 'dump', 'xmltree', SYSTEM + apk, '--file', path], capture_output=True, text=True, encoding='utf-8', errors='replace').stdout
        if text.strip(): _tree_sources[(apk,name,folder)] = path; break
    root, stack = None, []
    for line in text.splitlines():
        indent = len(line) - len(line.lstrip())
        s = line.strip()
        if s.startswith('E: '):
            node = [s[3:].split(' ')[0], {}, [], indent]
            while stack and stack[-1][3] >= indent: stack.pop()
            if stack: stack[-1][2].append(node)
            else: root = node
            stack.append(node)
        elif s.startswith('A: ') and stack:
            m = re.match(r'A: (?:[\w:/.]+:)?(\w+)\(0x[0-9a-f]+\)=(.*)', s)
            if not m: continue
            key, value = m.group(1), m.group(2)
            q = re.match(r'"(.*)" \(Raw: ', value)
            if q: value = q.group(1)
            stack[-1][1][key] = value
    return root

def resource(apk, ref):
    """@0x7f05003f -> (APK, 'anim', 'ic_…'): the type and name of a resource id."""
    rid = ref.lstrip('@')
    src = FRAMEWORK if rid.startswith('0x01') else apk
    names = {v: k for k, v in table(src)[2].items()}
    kind, name = names[rid].split('/', 1)
    return src, kind, name

def end_values(apk, ref):
    """{property: value} an animator leaves behind: for each property the valueTo of the objectAnimator (or its
    propertyValuesHolder) that ends last, a <set> running its children together or one after another (ordering 1)."""
    src, kind, name = resource(apk, ref)
    finals = {}
    def walk(node, start):
        tag, attrs, kids, _ = node
        if tag == 'objectAnimator':
            end = start + num(attrs.get('startOffset')) + num(attrs.get('duration'), 300)
            holders = [k[1] for k in kids if k[0] == 'propertyValuesHolder'] or [attrs]
            for h in holders:
                if h.get('propertyName') and 'valueTo' in h and end >= finals.get(h['propertyName'], (-1,))[0]:
                    finals[h['propertyName']] = (end, h['valueTo'])
            return end
        if tag == 'set':
            t = last = start + num(attrs.get('startOffset'))
            for k in kids:
                e = walk(k, last if attrs.get('ordering') == '1' else t)
                last = e if attrs.get('ordering') == '1' else max(last, e)
            return last
        return start
    walk(tree(src, name, kind), 0)
    return {p: v for p, (_, v) in finals.items()}

def apply(node, overrides):
    tag, attrs, kids, _ = node
    attrs.update(overrides.get(attrs.get('name'), {}))
    for k in kids: apply(k, overrides)

num = lambda v, d=0.0: float(re.sub(r'(dp|dip|px)$', '', v)) if v is not None else d
fmt = lambda x: ('%.4f' % (x + 0.0)).rstrip('0').rstrip('.')

def paint(attrs, apk, theme):
    out = []
    if 'fillColor' in attrs:
        c, a = color(attrs['fillColor'], apk, theme); a *= num(attrs.get('fillAlpha'), 1)
        out.append(f'fill="{c}"' + (f' fill-opacity="{fmt(a)}"' if a < 1 else ''))
    else: out.append('fill="none"')
    if 'strokeColor' in attrs:
        c, a = color(attrs['strokeColor'], apk, theme); a *= num(attrs.get('strokeAlpha'), 1)
        out.append(f'stroke="{c}" stroke-width="{fmt(num(attrs.get("strokeWidth"), 0))}"' + (f' stroke-opacity="{fmt(a)}"' if a < 1 else ''))
        cap = {'0': 'butt', '1': 'round', '2': 'square'}.get(attrs.get('strokeLineCap'))
        if cap: out.append(f'stroke-linecap="{cap}"')
        join = {'0': 'miter', '1': 'round', '2': 'bevel'}.get(attrs.get('strokeLineJoin'))
        if join: out.append(f'stroke-linejoin="{join}"')
    return ' '.join(out)

def body(children, apk, theme, ids):
    # A clip-path clips what follows it in its group, in the group's own coordinates: the siblings after it go into a
    # <g> without a transform that carries the clip (on a transformed child the clip would move with the child).
    parts, clip = [], None
    for tag, attrs, kids, _ in children:
        wrap = ''
        if tag == 'clip-path':
            ids[0] += 1
            if clip: parts.append('</g>')
            clip = f'c{ids[0]}'
            parts.append(f'<clipPath id="{clip}"><path d="{attrs.get("pathData", "")}"/></clipPath><g clip-path="url(#{clip})">')
        elif tag == 'path':
            # Trimming (an animation's end state): nothing left draws nothing; a part of a stroke is a dash of the
            # path's length.
            ts, te, to = num(attrs.get('trimPathStart')), num(attrs.get('trimPathEnd'), 1), num(attrs.get('trimPathOffset'))
            if te - ts <= 0: continue
            dash = ''
            if (ts, te) != (0, 1):
                assert 'fillColor' not in attrs or color(attrs['fillColor'], apk, theme)[1] == 0, f'{attrs.get("name")}: trimmed fill'
                dash = f' pathLength="1" stroke-dasharray="{fmt(te - ts)} 1" stroke-dashoffset="{fmt(-(ts + to))}"'
            parts.append(f'<path d="{attrs.get("pathData", "")}" {paint(attrs, apk, theme)}{dash}{wrap}/>')
        elif tag == 'group':
            px, py = num(attrs.get('pivotX')), num(attrs.get('pivotY'))
            tx, ty = num(attrs.get('translateX')), num(attrs.get('translateY'))
            r, sx, sy = num(attrs.get('rotation')), num(attrs.get('scaleX'), 1), num(attrs.get('scaleY'), 1)
            t = f'translate({fmt(tx + px)} {fmt(ty + py)}) rotate({fmt(r)}) scale({fmt(sx)} {fmt(sy)}) translate({fmt(-px)} {fmt(-py)})'
            parts.append(f'<g transform="{t}"{wrap}>{body(kids, apk, theme, ids)}</g>')
    if clip: parts.append('</g>')
    return ''.join(parts)

def svg(apk, name, theme):
    tag, attrs, kids, _ = node = tree(apk, name)
    base, started = None, theme != 'start'
    # An <animated-vector> (QSTile.AnimationIcon): drawn as its animations leave it, the state the tile shows at rest
    # (AnimationIcon.getDrawable starts the drawable and stops it at once, which jumps to the end).
    if tag == 'animated-vector':
        overrides = {}
        # theme "start": the drawable as set and never started (VolumeDialog's expand button), its plain vector.
        if theme == 'start': theme = None
        else:
            for t in kids:
                if t[0] == 'target': overrides.setdefault(t[1]['name'], {}).update(end_values(apk, t[1]['animation']))
        _, _, base = resource(apk, attrs['drawable'])
        tag, attrs, kids, _ = node = tree(apk, base)
        apply(node, overrides)
    # An <inset> around an inline vector (stat_sys_alarm): the insets (dp) widen the box in viewport units.
    inset = {k: 0.0 for k in ('Left', 'Top', 'Right', 'Bottom')}
    if tag == 'inset':
        inset = {k: num(attrs.get('inset' + k)) for k in inset}
        assert kids and kids[0][0] == 'vector', f'{name}: inset without an inline vector'
        tag, attrs, kids, _ = kids[0]
    assert tag == 'vector', f'{name} is a {tag}'
    vw, vh = num(attrs.get('viewportWidth')), num(attrs.get('viewportHeight'))
    # A size given as a dimen (DeskClock's ic_tab_*_static: @dimen/tab_icon_size) is that dimen's default value.
    dim = lambda v: v if v is None or not v.startswith('@') else table(apk)[0].get(v[1:], v)
    w, h = num(dim(attrs.get('width'))), num(dim(attrs.get('height')))
    ux, uy = vw / w, vh / h
    x0, y0 = -inset['Left'] * ux, -inset['Top'] * uy
    vw += (inset['Left'] + inset['Right']) * ux; vh += (inset['Top'] + inset['Bottom']) * uy
    w += inset['Left'] + inset['Right']; h += inset['Top'] + inset['Bottom']
    alpha = num(attrs.get('alpha'), 1)
    inner = body(kids, apk, theme, [0])
    if alpha < 1: inner = f'<g opacity="{fmt(alpha)}">{inner}</g>'
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{fmt(w)}" height="{fmt(h)}" viewBox="{fmt(x0)} {fmt(y0)} {fmt(vw)} {fmt(vh)}">'
            f'<!-- {apk} {_tree_sources.get((apk,name,"drawable"),"res/drawable/"+name+".xml")} ({("AnimatedVectorDrawable, not started" if started is False else "AnimatedVectorDrawable, the end state") if base else "VectorDrawable"}), drawn by docs/tools/mm-vectors.py -->{inner}</svg>\n')

if __name__ == '__main__':
    import glob
    rows = [l.rstrip('\n').split('\t') for f in sorted(glob.glob(ROOT + data('vectors') + '*.tsv')) for l in open(f, encoding='utf-8') if l.strip() and not l.startswith('#')]
    missing = []
    for out, apk, name, theme in rows:
        # A drawable the image does not have is named, not drawn (a list taken over from another version may hold one).
        if tree(apk, name) is None: missing.append(f'{apk} {name}'); continue
        drawing = svg(apk, name, None if theme == '-' else theme)   # drawn first, so a failure leaves the old file whole
        open(OUT + out, 'w', encoding='utf-8', newline='\n').write(drawing)
    print(len(rows) - len(missing), 'vectors')
    if missing: raise SystemExit('not in the image: ' + ', '.join(missing))
