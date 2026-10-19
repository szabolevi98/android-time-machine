"""Device frames as original SVG drawings. Only the outline geometry is measured from reference renders (alpha mask);
all shading is drawn here. Output coordinates are CSS px, scaled so the display matches the simulator screen."""
from PIL import Image
import math, json, os

def outline(path, body_x, body_y, scale, origin, cut_side_buttons=True, thr=110, mirror=False):
    im = Image.open(path).convert('RGBA'); W, H = im.size; px = im.load()
    x0, x1 = body_x; y0, y1 = body_y
    left, right = {}, {}
    for y in range(y0, y1 + 1):
        xs = [x for x in range(W) if px[x, y][3] > thr]
        if not xs: continue
        l, r = xs[0], xs[-1]
        if cut_side_buttons: l, r = max(l, x0), min(r, x1)
        left[y], right[y] = l, r
    # A symmetric front whose render is slightly skewed (Nexus S): take the left edge as the mirror of the right one,
    # so the side buttons and the render's shading cannot make it wavy...
    if mirror:
        for y in right: left[y] = x0 + x1 - right[y]
    # top / bottom profile per column for the curved edges
    top, bot = {}, {}
    for x in range(x0, x1 + 1):
        ys = [y for y in range(y0, y1 + 1) if px[x, y][3] > thr]
        if ys: top[x], bot[x] = ys[0], ys[-1]
    if mirror:
        # ...and the left half of the top and bottom edges (the rounded corners) as the mirror of the right half.
        for x in list(top):
            if x < (x0 + x1) / 2 and (x0 + x1 - x) in top: top[x], bot[x] = top[x0 + x1 - x], bot[x0 + x1 - x]
    ox, oy = origin
    pts = []
    # walk: top edge left->right, right side top->bottom, bottom edge right->left, left side bottom->top
    for x in range(x0, x1 + 1, 4):
        if x in top: pts.append((x, top[x]))
    for y in range(min(right), max(right) + 1, 6): pts.append((right[y], y))
    for x in range(x1, x0 - 1, -4):
        if x in bot: pts.append((x, bot[x]))
    for y in range(max(left), min(left) - 1, -6): pts.append((left[y], y))
    # keep only the outer hull ordering: drop points that fall inside (corners are covered by both walks)
    sc = [((x - ox) * scale, (y - oy) * scale) for x, y in pts]
    return sc

def soften(pts, k):
    # circular moving average over k points: removes the pixel stairs of a traced edge without moving the corners much
    if k <= 1: return pts
    n = len(pts); h = k // 2
    return [(sum(pts[(i + j) % n][0] for j in range(-h, h + 1)) / (2 * h + 1), sum(pts[(i + j) % n][1] for j in range(-h, h + 1)) / (2 * h + 1)) for i in range(n)]

def smooth_path(pts):
    # Catmull-Rom to cubic Bezier, closed.
    n = len(pts); d = f'M{pts[0][0]:.2f} {pts[0][1]:.2f}'
    for i in range(n):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f'C{c1[0]:.2f} {c1[1]:.2f} {c2[0]:.2f} {c2[1]:.2f} {p2[0]:.2f} {p2[1]:.2f}'
    return d + 'Z'

def hull_filter(pts, cx, cy, points=180):
    # order by angle around the centre and keep the farthest point per angular bin -> clean silhouette
    bins = {}
    for x, y in pts:
        a = round(math.degrees(math.atan2(y - cy, x - cx)) * 2) / 2
        r = math.hypot(x - cx, y - cy)
        if a not in bins or r > bins[a][2]: bins[a] = (x, y, r)
    out = [(x, y) for a, (x, y, r) in sorted(bins.items())]
    # thin to ~180 points (more for a strongly curved top such as the Nexus One's)
    step = max(1, len(out) // points)
    return out[::step]

# Nexus S capacitive key glyphs in a 24-unit box: Back, Menu, Search, Home (left to right on the glass).
TOUCHKEYS = {
    'back': '<path d="M8.5 5.5 5 9l3.5 3.5M5.5 9H15a4.5 4.5 0 0 1 0 9H8"/>',
    'menu': '<path d="M9 6h11M4 10h16M4 14h16M4 18h16"/>',
    'search': '<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5.5 5.5"/>',
    'home': '<path d="M2.5 12.5 12 4.5l9.5 8M6 10.5V19h12v-8.5"/>',
}

def superellipse_body(x0, y0, x1, y1, a, b, n, steps=48):
    # A body measured rather than traced pixel by pixel (Nexus 5X): straight sides and edges, the four corners the
    # superellipse ((x - cx) / a)^n + ((y - cy) / b)^n = 1 fitted to the reference's corner, in reference coordinates.
    pts = []
    for cx, cy, sx, sy in ((x1 - a, y0 + b, 1, -1), (x1 - a, y1 - b, 1, 1), (x0 + a, y1 - b, -1, 1), (x0 + a, y0 + b, -1, -1)):
        # clockwise from the top edge: top-right, bottom-right, bottom-left, top-left
        rng = range(steps + 1) if sx * sy > 0 else range(steps, -1, -1)
        for i in rng:
            t = i / steps * math.pi / 2
            c, s = math.cos(t), math.sin(t)
            pts.append((cx + sx * a * c ** (2 / n), cy + sy * b * s ** (2 / n)))
    return pts

def frame(name, ref, body_x, body_y, screen, css_screen, features, buttons, palette, thr=110, mirror=False, widen=1.0, glass=None, points=180, soft=1, band=None, contour=None):
    sx0, sy0, sx1, sy1 = screen
    scale = css_screen[0] / (sx1 - sx0)
    origin = (body_x[0], body_y[0])
    w = (body_x[1] - body_x[0]) * scale; h = (body_y[1] - body_y[0]) * scale
    if contour:
        # an outline given as reference points (superellipse_body): used as it is, a closed polyline dense enough to be smooth
        pts = [((x - origin[0]) * scale, (y - origin[1]) * scale) for x, y in contour]
    else:
        pts = outline(ref, body_x, body_y, scale, origin, thr=thr, mirror=mirror)
    # widen: a render narrower than the real phone (Nexus S) is stretched about its centre line to the real width;
    # the display window and the features keep their size and move with the centre (dx).
    dx = w * (widen - 1) / 2
    if widen != 1.0:
        pts = [((x - w / 2) * widen + w * widen / 2, y) for x, y in pts]
        w *= widen
    if contour:
        d = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in pts) + 'Z'
    else:
        pts = soften(hull_filter(pts, w / 2, h / 2, points), soft)
        d = smooth_path(pts)
    pad = {'left': (sx0 - body_x[0]) * scale + dx, 'top': (sy0 - body_y[0]) * scale, 'right': (body_x[1] - sx1) * scale + dx, 'bottom': (body_y[1] - sy1) * scale}
    m = 6  # margin for side buttons and the rim stroke
    W, H = w + 2 * m, h + 2 * m
    S = lambda v: v * scale
    feat = []
    for f in features:
        kind = f[0]
        if kind == 'frontcam':
            # Nexus 5X front camera: a dark lens (radius r) in a faintly lighter ring (radius ring) on the glass, with the
            # small warm reflection low on the right that the press image shows.
            _, cx, cy, ring, r = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(ring):.2f}" fill="#ffffff" fill-opacity=".045"/>'
                        f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(r):.2f}" fill="url(#lens)" stroke="#121315" stroke-width=".5"/>'
                        f'<circle cx="{x + S(r) * .42:.2f}" cy="{y + S(r) * .42:.2f}" r="{S(r) * .26:.2f}" fill="#d9a3a0" fill-opacity=".55"/>')
            continue
        if kind == 'meshslot':
            # Nexus 5X earpiece / loudspeaker: a dark rounded slot with a fine grid of holes and a faint lit lower lip.
            _, cx, cy, fw, fh = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m; ww, hh = S(fw), S(fh)
            r = f'x="{x - ww / 2:.2f}" y="{y - hh / 2:.2f}" width="{ww:.2f}" height="{hh:.2f}" rx="{hh / 2:.2f}"'
            feat.append(f'<rect {r} fill="#17181a"/><rect {r} fill="url(#holes)"/>'
                        f'<rect {r} fill="none" stroke="#08090a" stroke-width=".6"/>'
                        f'<path d="M{x - ww / 2 + hh / 2:.2f} {y + hh / 2 + .45:.2f}H{x + ww / 2 - hh / 2:.2f}" stroke="#ffffff" stroke-opacity=".08" stroke-width=".6"/>')
            continue
        if kind == 'slot':
            _, cx, cy, fw, fh = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m; ww, hh = S(fw), S(fh)
            feat.append(f'<rect x="{x - ww / 2:.2f}" y="{y - hh / 2:.2f}" width="{ww:.2f}" height="{hh:.2f}" rx="{hh / 2:.2f}" fill="url(#grille)" stroke="#3b3f42" stroke-width=".7"/>')
            dots = int(ww / 2.1)
            feat.append(''.join(f'<circle cx="{x - ww / 2 + hh / 2 + i * (ww - hh) / max(1, dots - 1):.2f}" cy="{y:.2f}" r=".45" fill="#2a2e31"/>' for i in range(dots)))
        elif kind == 'arcslot':
            # Nexus One earpiece: a grille slot bent along the curved top edge; its centre line sinks by sag at both ends.
            _, cx, cy, fw, fh, sag = f; x0_, ww, hh = S(cx - origin[0]) + m + dx, S(fw), S(fh)
            yc = lambda t: S(cy - origin[1]) + m + S(sag) * t * t  # t = -1 … 1 along the slot
            n = 24; r = hh / 2; half = ww / 2 - r
            top = [(x0_ + half * (2 * i / n - 1), yc(2 * i / n - 1) - r) for i in range(n + 1)]
            bot = [(x0_ + half * (1 - 2 * i / n), yc(1 - 2 * i / n) + r) for i in range(n + 1)]
            ad = 'M' + ' L'.join(f'{a:.2f} {b:.2f}' for a, b in top)
            ad += f' A{r:.2f} {r:.2f} 0 0 1 {bot[0][0]:.2f} {bot[0][1]:.2f} L' + ' L'.join(f'{a:.2f} {b:.2f}' for a, b in bot[1:])
            ad += f' A{r:.2f} {r:.2f} 0 0 1 {top[0][0]:.2f} {top[0][1]:.2f}Z'
            # a fine grey metal mesh, as on the phone (the mockup's grille averages about #343434)
            feat.append(f'<path d="{ad}" fill="#2b2b2b"/><path d="{ad}" fill="url(#mesh)"/>'
                        f'<path d="{ad}" fill="none" stroke="#1d1a19" stroke-width=".7"/>')
        elif kind == 'notch':
            _, cx, y0, w0, w1, depth = f; x = S(cx - origin[0]) + m + dx; top = S(y0 - origin[1]) + m
            a, b, dd = S(w0) / 2, S(w1) / 2, S(depth)
            feat.append(f'<path d="M{x - a:.2f} {top:.2f}L{x - b:.2f} {top + dd:.2f}H{x + b:.2f}L{x + a:.2f} {top:.2f}Z" fill="#060707" stroke="#30353a" stroke-width=".5"/>')
            feat.append(f'<rect x="{x - b + 1:.2f}" y="{top + dd - 1.8:.2f}" width="{2 * b - 2:.2f}" height="1.2" rx=".6" fill="url(#grille)"/>')
        elif kind == 'lens':
            _, cx, cy, r = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(r):.2f}" fill="url(#lens)" stroke="#2c3236" stroke-width=".8"/>')
        elif kind == 'touchkey':
            _, glyph, cx, cy, size = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m; k = S(size) / 24
            feat.append(f'<g transform="translate({x - 12 * k:.2f} {y - 12 * k:.2f}) scale({k:.4f})" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">{TOUCHKEYS[glyph]}</g>')
        elif kind == 'roundgrille':
            # Nexus 5 earpiece: a round grille of small holes in a dark ring.
            _, cx, cy, r = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m; rr = S(r)
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rr:.2f}" fill="#0b0c0d" stroke="#3a3d40" stroke-width=".6"/>')
            holes = []
            for ring, count in ((0, 1), (.33, 6), (.62, 12)):
                for i in range(count):
                    a = 2 * math.pi * i / count
                    holes.append(f'<circle cx="{x + math.cos(a) * rr * ring:.2f}" cy="{y + math.sin(a) * rr * ring:.2f}" r="{rr * .1:.2f}" fill="#262a2d"/>')
            feat.append(''.join(holes))
        elif kind == 'trackball':
            # Nexus One: an optical trackball (ball radius r) in a black ring (outer radius ring) with a faint bevel round it
            # on the metal chin; it lights up for notifications.
            _, cx, cy, r, ring = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m; rr = S(r)
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(ring) + .5:.2f}" fill="#655b58"/>')
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(ring):.2f}" fill="#070707"/>')
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{rr:.2f}" fill="url(#ball)"/>')
        elif kind == 'led':
            _, cx, cy, r = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m
            feat.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{S(r):.2f}" fill="#141617" stroke="#25292c" stroke-width=".4"/>')
        elif kind == 'sensor':
            _, cx, cy, rx, ry = f; x, y = S(cx - origin[0]) + m + dx, S(cy - origin[1]) + m
            feat.append(f'<ellipse cx="{x:.2f}" cy="{y:.2f}" rx="{S(rx):.2f}" ry="{S(ry):.2f}" fill="#16191b" stroke="#25292c" stroke-width=".5"/>')
    btn = []
    for side, y0, y1, out, *edge in buttons:
        yy0, yy1 = S(y0 - origin[1]) + m, S(y1 - origin[1]) + m; o = S(out) + 1.2
        if side == 'top':
            # a key on the top edge: y0 / y1 are its x range and edge[0] the y of the outline there, on the reference
            xx0, xx1 = S(y0 - origin[0]) + m + dx, S(y1 - origin[0]) + m + dx; ye = S(edge[0] - origin[1]) + m
            btn.append(f'<rect x="{xx0:.2f}" y="{ye - o:.2f}" width="{xx1 - xx0:.2f}" height="{o + .8:.2f}" rx="1.2" fill="url(#keyTop)"/>')
            continue
        x = m - o if side == 'left' else m + w - .5
        btn.append(f'<rect x="{x:.2f}" y="{yy0:.2f}" width="{o + .5:.2f}" height="{yy1 - yy0:.2f}" rx="1.2" fill="url(#key)"/>')
    p = palette
    # Optional glass panel edge (Nexus S): the curved glass sits inside the plastic bezel and catches a thin highlight.
    # Optional glass front on a metal body (Nexus One): the black glass is its own traced outline (a mask image of the
    # reference), drawn over the metal, with the chin below it left in metal.
    front = ''
    if glass:
        gpts = outline(glass['mask'], body_x, body_y, scale, origin, thr=128)
        gpts = [((x - w / 2 / widen) * widen + w / 2, y) if widen != 1.0 else (x, y) for x, y in gpts]
        gx = sum(x for x, y in gpts) / len(gpts); gy = sum(y for x, y in gpts) / len(gpts)
        gd = smooth_path(soften(hull_filter(gpts, gx, gy, points), soft))
        front = (f'<path d="{gd}" transform="translate({m} {m})" fill="url(#front)" stroke="{glass["edge"]}" stroke-width=".9"/>'
                 f'<path d="{gd}" transform="translate({m} {m})" fill="url(#glare)"/>')
    # Optional dark band along the bottom (Nexus One): the body curving away under the chin. band is the top edge of the
    # band as reference points; the shape runs from that edge down past the body and is masked to the outline including
    # the rim stroke, so the light rim does not show round the bottom corners.
    under = ''
    if band:
        bp = [(S(x - origin[0]) + m + dx, S(y - origin[1]) + m) for x, y in band]
        bp = [(x, sum(q[1] for q in bp[max(0, i - 3):i + 4]) / len(bp[max(0, i - 3):i + 4])) for i, (x, y) in enumerate(bp)]  # open, not circular
        edge = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in bp)
        under = (f'<path d="{edge} L{bp[-1][0]:.2f} {H:.2f} L{bp[0][0]:.2f} {H:.2f}Z" fill="url(#band)"/>'
                 f'<path d="{edge}" fill="none" stroke="#120f0e" stroke-width="1"/>')
    gi = p.get('glassInset', 0)
    glass = f'<path d="{d}" transform="translate({m + gi} {m + gi}) scale({(w - 2 * gi) / w:.4f} {(h - 2 * gi) / h:.4f})" fill="none" stroke="url(#glassEdge)" stroke-width="1.1"/>' if gi else ''
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.2f} {H:.2f}" width="{W:.2f}" height="{H:.2f}">
<defs>
<linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{p['body'][0]}"/><stop offset=".45" stop-color="{p['body'][1]}"/><stop offset="1" stop-color="{p['body'][2]}"/></linearGradient>
<linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{p['rim'][0]}"/><stop offset=".5" stop-color="{p['rim'][1]}"/><stop offset="1" stop-color="{p['rim'][2]}"/></linearGradient>
<linearGradient id="glare" x1="0" y1="0" x2="1" y2=".55"><stop offset="0" stop-color="#fff" stop-opacity=".12"/><stop offset=".38" stop-color="#fff" stop-opacity=".045"/><stop offset=".385" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="chin" x1="0" y1="0" x2="0" y2="1"><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset=".975" stop-color="#fff" stop-opacity="{p['chin']}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="grille" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020303"/><stop offset=".55" stop-color="#15181a"/><stop offset="1" stop-color="#050606"/></linearGradient>
<radialGradient id="lens" cx=".42" cy=".38" r=".6"><stop offset="0" stop-color="#25384a"/><stop offset=".45" stop-color="#0b1219"/><stop offset="1" stop-color="#040608"/></radialGradient>
<linearGradient id="key" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#121416"/><stop offset=".55" stop-color="#55595c"/><stop offset="1" stop-color="#1b1e20"/></linearGradient>
<linearGradient id="keyTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121416"/><stop offset=".55" stop-color="#55595c"/><stop offset="1" stop-color="#1b1e20"/></linearGradient>
<linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#151617"/><stop offset=".5" stop-color="#050506"/><stop offset="1" stop-color="#0c0d0e"/></linearGradient>
<pattern id="holes" width="1.25" height="1.25" patternUnits="userSpaceOnUse"><circle cx=".62" cy=".62" r=".36" fill="#050506"/></pattern>
<pattern id="mesh" width="1.1" height="1.1" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="1.1" height="1.1" fill="#3c3c3c"/><rect width=".55" height=".55" fill="#232323"/></pattern>
<linearGradient id="band" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#3a3230"/><stop offset=".45" stop-color="#211c1b"/><stop offset="1" stop-color="#0b0909"/></linearGradient>
<radialGradient id="ball" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#c2c2c2"/><stop offset=".66" stop-color="#c2c2c2"/><stop offset=".84" stop-color="#acacac"/><stop offset="1" stop-color="#c4c4c4"/></radialGradient>
<linearGradient id="glassEdge" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".34"/><stop offset=".45" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient>
<clipPath id="clip"><path d="{d}" transform="translate({m} {m})"/></clipPath>
</defs>
{''.join(btn)}
<path d="{d}" transform="translate({m} {m})" fill="url(#body)" stroke="url(#rim)" stroke-width="{p['rimWidth']}"/>
{f'<mask id="bodyMask" maskUnits="userSpaceOnUse" x="0" y="0" width="{W:.2f}" height="{H:.2f}"><path d="{d}" transform="translate({m} {m})" fill="#fff" stroke="#fff" stroke-width="{p["rimWidth"]}"/></mask><g mask="url(#bodyMask)">{under}</g>' if under else ''}
<g clip-path="url(#clip)"><path d="{d}" transform="translate({m} {m}) scale({(w - 3) / w:.4f} {(h - 3) / h:.4f}) translate(1.5 1.5)" fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="1.2"/>
{glass}{'' if front else f'<rect x="0" y="0" width="{W:.2f}" height="{H:.2f}" fill="url(#glare)"/>'}<rect x="0" y="0" width="{W:.2f}" height="{H:.2f}" fill="url(#chin)"/></g>
{front}
{''.join(feat)}
</svg>'''
    return svg, {'width': round(W, 2), 'height': round(H, 2), 'margin': m, 'pad': {k: round(v + m, 2) for k, v in pad.items()}, 'scale': scale,
                 'buttons': [{'side': s, 'left': round(S(a - origin[0]) + m + dx, 1), 'width': round(S(b - a), 1)} if s == 'top' else
                             {'side': s, 'top': round(S(a - origin[1]) + m, 1), 'height': round(S(b - a), 1)} for s, a, b, o, *e in buttons]}

out = {}
if os.path.exists('gn-render.png'):
  svg, info = frame('galaxy-nexus', 'gn-render.png', (23, 861), (22, 1691), (80, 231, 800, 1511), (306, 545),
    [('slot', 442, 105, 195, 17), ('sensor', 572, 105, 15, 9), ('sensor', 616, 105, 10, 10), ('lens', 708, 112, 14)],
    [('right', 395, 522, 5), ('left', 552, 815, 8)],
    {'body': ['#191b1d', '#050606', '#0c0d0e'], 'rim': ['#c3c8cb', '#6c7073', '#b2b7ba'], 'rimWidth': 4.6, 'chin': .16})
  open('device-galaxy-nexus.svg', 'w').write(svg); out['gn'] = info
if os.path.exists('n4-ref.png'):
  svg, info = frame('nexus-4', 'n4-ref.png', (47, 899), (38, 1706), (89, 225, 857, 1505), (327, 545),
    [('notch', 473, 58, 190, 160, 20), ('sensor', 145, 112, 9, 9), ('sensor', 172, 112, 9, 9), ('lens', 778, 116, 13)],
    [('right', 300, 400, 5), ('left', 330, 560, 5)],
    {'body': ['#18191b', '#060707', '#0d0e0f'], 'rim': ['#8e9396', '#3f4346', '#83888b'], 'rimWidth': 3.0, 'chin': .05}, thr=235)
  open('device-nexus-4.svg', 'w').write(svg); out['n4'] = info
# Nexus S (Samsung GT-I9020, crespo): glossy black Contour Display, no metal rim, four capacitive keys under the glass.
# The display window is 480 x 800 at 0.575 (276 x 460), sized to the 4.0" panel next to the 4.65" Galaxy Nexus.
if os.path.exists('ns-render.png'):
  svg, info = frame('nexus-s', 'ns-render.png', (40, 1012), (26, 2016), (112, 330, 940, 1710), (276, 460),
    [('slot', 521, 165, 238, 30), ('lens', 740, 155, 19),
     ('touchkey', 'back', 226, 1828, 84), ('touchkey', 'menu', 430, 1828, 84), ('touchkey', 'search', 621, 1828, 84), ('touchkey', 'home', 813, 1828, 84)],
    [('right', 396, 563, 7), ('left', 571, 873, 7)],
    {'body': ['#121314', '#020203', '#09090a'], 'rim': ['#3c4043', '#0a0b0c', '#34383b'], 'rimWidth': 2.2, 'chin': .1, 'glassInset': 4.5}, mirror=True, widen=0.5085 / (972 / 1990))
  open('device-nexus-s.svg', 'w').write(svg); out['ns'] = info
# Nexus 5 (LG-D821, hammerhead): matte black body with a thin grey rim, front camera left, the round earpiece grille in the
# middle, proximity / light sensors right. Traced from Google's front render (Wikimedia Commons "Nexus 5 Front View.png",
# CC BY 2.5, Google Android), whose display is exactly 1080 x 1920 at (304, 436). The render has a soft drop shadow under the
# bottom edge, so the alpha threshold is 235 (as for the Nexus 4) to keep it out of the outline. The 4.95" panel next to the 4.65" Galaxy
# Nexus (545 px tall) is 580 px tall, so the window is 326.25 x 580 (1 dp = 0.906 px).
if os.path.exists('n5-render.png'):
  svg, info = frame('nexus-5', 'n5-render.png', (251, 1438), (243, 2614), (304, 436, 1384, 2356), (326.25, 580),
    [('lens', 447, 362, 14), ('roundgrille', 843, 358, 28), ('sensor', 1220, 357, 10, 10), ('sensor', 1262, 357, 6, 6)],
    [('right', 548, 696, 9), ('left', 704, 1076, 9)],
    {'body': ['#1d1d1e', '#0d0d0e', '#151516'], 'rim': ['#6a6b6d', '#2e2f30', '#5c5d5f'], 'rimWidth': 3.2, 'chin': .06}, thr=235)
  open('device-nexus-5.svg', 'w').write(svg); out['n5'] = info
# Nexus 6 (Motorola XT1100, shamu): dark body with a thin brushed-metal rim, curved top and bottom, the pill-shaped earpiece
# and loudspeaker grilles centred above and below the display, the front camera right of the earpiece, the power key above
# the volume rocker on the right. Traced from Google's device art (Wikimedia Commons "Nexus 6.png", CC BY 2.5, from the
# Android Device Art Generator), whose 16:9 display is 1306 x 2320 at (296, 378). The 5.96" panel at 1 dp = 0.906 px is
# 372.75 x 662.68 (411.43 x 731.43 dp). The render has a soft drop shadow under the bottom edge, so the threshold is 235.
# The keys bulge the right edge of the render, so the outline is traced from a horizontally flipped copy with mirror=True:
# both sides then follow the clean left edge (the body box is symmetric in the 1896 px wide image).
if os.path.exists('n6-render.png'):
  if not os.path.exists('n6-render-flipped.png'):
    from PIL import Image, ImageOps
    ImageOps.mirror(Image.open('n6-render.png').convert('RGBA')).save('n6-render-flipped.png')
  svg, info = frame('nexus-6', 'n6-render-flipped.png', (228, 1668), (163, 2900), (296, 378, 1602, 2698), (372.75, 662.68),
    [('slot', 949, 242, 413, 45), ('lens', 1338, 248, 22), ('slot', 949, 2785, 413, 45)],
    [('right', 1080, 1220, 8), ('right', 1320, 1620, 7)],
    {'body': ['#262728', '#0b0b0c', '#18191a'], 'rim': ['#a3a5a7', '#3d3f41', '#86888a'], 'rimWidth': 3.0, 'chin': .06, 'glassInset': 7}, thr=235, mirror=True)
  open('device-nexus-6.svg', 'w').write(svg); out['n6'] = info
# Nexus One (HTC PB99100, passion): a brown-grey metal body ("Teflon" coated) with a black glass front, the four capacitive
# keys (Back, Menu, Home, Search) on the glass and the trackball on the metal chin below it. Traced from the front mockup on
# Wikimedia Commons ("Nexus One.png" by Zach Vega, CC BY-SA 3.0), whose display is 376 x 625 at (38, 100) and whose body
# (454 x 903) has the real 59.8 x 119 mm proportions. The glass is traced from a mask of the mockup's black front (flood
# fill from the display). The 3.7" panel at the Nexus S scale (0.575 px per pixel for 4.0") is 255.3 x 425.5 (0.532).
# Keys: the short power key at the left end of the top edge (owner's photo, 2026-10-13), the 3.5 mm jack at the other end, the
# long thin volume rocker on the left edge (GSMArena, Engadget, Android Central reviews); the small charge LED sits right of
# the earpiece (Commons "Docked Nexus One"). The earpiece slot bends with the top edge (its centre line 3.4 px lower at the
# ends than in the middle, measured on the mockup). The dark band under the chin is where the body curves away, traced per column.
if os.path.exists('n1-render.png'):
  from PIL import Image, ImageDraw
  if not os.path.exists('n1-glass.png'):
    src = Image.open('n1-render.png').convert('RGBA'); dark = Image.new('L', src.size, 0); sp = src.load(); dp = dark.load()
    for yy in range(src.size[1]):
      for xx in range(src.size[0]):
        r_, g_, b_, a_ = sp[xx, yy]
        if a_ > 200 and max(r_, g_, b_) < 48: dp[xx, yy] = 1
    ImageDraw.floodfill(dark, (227, 400), 255)
    mask = Image.new('RGBA', src.size, (0, 0, 0, 0)); mask.putalpha(dark.point(lambda v: 255 if v == 255 else 0)); mask.save('n1-glass.png')
  ref = Image.open('n1-render.png').convert('RGBA')
  n1_top = min(y for y in range(60) if ref.getpixel((85, y))[3] > 110)
  # Bottom band: per column, where the metal chin gets markedly darker (a relative drop, since the metal is lighter near the
  # sides), median-filtered; the trackball columns are bridged.
  lum = lambda x, y: sum(ref.getpixel((x, y))[:3]) / 3
  raw = []
  for x in range(4, 450, 2):
    if 196 <= x <= 258: continue
    ys = [y for y in range(790, 903) if ref.getpixel((x, y))[3] > 110]
    metal = next((y for y in ys if lum(x, y) > 50), None)
    if metal is None: continue
    for y in ys:
      if y > metal + 4 and lum(x, y) < 0.6 * sorted(lum(x, k) for k in range(y - 6, y - 1))[2]:
        raw.append((x, y)); break
  n1_band = [(x, sorted(r[1] for r in raw[max(0, i - 4):i + 5])[len(raw[max(0, i - 4):i + 5]) // 2]) for i, (x, _) in enumerate(raw)]
  # at both ends the band runs up the curved sides to the outline (y 801 at the very edge on the reference)
  n1_band = [(0, 801)] + n1_band + [(453, 801)]
  svg, info = frame('nexus-one', 'n1-render.png', (0, 453), (0, 902), (38, 100, 414, 725), (255.3, 425.5),
    [('arcslot', 227, 32, 182, 10, 3.4), ('led', 392, 33, 3.5),
     ('touchkey', 'back', 86, 753, 32), ('touchkey', 'menu', 181, 753, 32), ('touchkey', 'home', 272, 753, 32), ('touchkey', 'search', 366, 753, 32),
     ('trackball', 226, 832, 19.5, 24)],
    [('top', 72, 98, 4, n1_top), ('left', 150, 300, 4)],
    {'body': ['#6f6462', '#463e3c', '#5d5351'], 'rim': ['#a0928f', '#2f2928', '#7c706d'], 'rimWidth': 2.0, 'chin': .08},
    mirror=True, glass={'mask': 'n1-glass.png', 'edge': '#2a2524'}, points=720, soft=11, band=n1_band)
  open('device-nexus-one.svg', 'w').write(svg); out['n1'] = info
# Nexus 5X (LG-H791, bullhead), Carbon front: black glass in a dark charcoal body with a thin grey rim, straight sides and
# straight top and bottom edges joined by large rounded corners, the perforated earpiece slot in the top bezel with the front
# camera far left of it, the same slot (loudspeaker and notification LED) under the display, the power key above the volume
# rocker on the right edge. Measured on LG's press image (Wikimedia Commons "Nexus 5X (White).jpg", LG Electronics on
# Flickr, CC BY 2.0; 1160 x 1372, kept as _aosp/bullhead/refs/lg-nexus-5x-white.jpg). The phone there is turned by about
# 0.1 degrees and its bottom edge shows below the front, so the outline is not traced pixel by pixel but built from
# measurements (sub-pixel edges where the brightness crosses 160): sides at x 14.2 and 671.0 (656.8 wide), the top edge at
# y 23.2 and the bottom one 1353.1 (the real 147 x 72.6 mm proportion), and four equal corners, the superellipse
# a 104, b 100, n 2.5 fitted to both top corners at once (0.26 px rms). Also measured there: the display 599 x 1058 at
# (43, 155) (the 16:9 window is centred in it, 3.5 px taller at both ends), slots 240 x 20 centred at x 342 (y 78 and
# 1304), the camera's dark lens 12 px across in a faintly lighter ring 22 px across at (136.5, 78.5), the power key
# y 372-460 and the volume rocker 553-749, both 6 px proud. The 5.2" panel at 1 dp = 0.833 px is 342.73 x 609.3
# (411.43 x 731.43 dp), the Nexus 5's 4.95" at 326.25 px wide scaled by 5.2 / 4.95.
n5x_box = (14.2, 23.2, 671.0, 1353.1)
svg, info = frame('nexus-5x', None, (n5x_box[0], n5x_box[2]), (n5x_box[1], n5x_box[3]), (43, 151.56, 642, 1216.44), (342.73, 609.3),
  [('meshslot', 342.6, 78, 240, 20), ('frontcam', 136.5, 78.5, 11, 6), ('meshslot', 342.6, 1304, 240, 20)],
  [('right', 372, 461, 6), ('right', 553, 750, 6)],
  {'body': ['#29292b', '#202021', '#18181a'], 'rim': ['#6a6b6d', '#3b3c3d', '#5e5f61'], 'rimWidth': 2.4, 'chin': .05, 'glassInset': 2.2},
  contour=superellipse_body(*n5x_box, 104, 100, 2.5))
open('device-nexus-5x.svg', 'w').write(svg); out['n5x'] = info
# Nexus 6P (Huawei H1511, angler), Graphite / Aluminium front: black glass in a dark body with a bright aluminium rim,
# straight sides and edges joined by rounded corners, the two front loudspeaker slots above and below the display, the
# front camera far left of the top one, the power key above the volume rocker on the right edge. Measured on a front
# view (Wikimedia Commons "Nexus 6P 模型.png", April.Kai, CC BY-SA 4.0; 482 x 944 with a transparent background, kept as
# _aosp/angler/refs/nexus-6p-model.png): the outline where the alpha crosses .5, sides at x 10.47 and 466.18, top 1.22
# and bottom 934.71 (2.048, the real 159.3 x 77.8 mm), four corners the superellipse a 60, b 60, n 2.25 (0.22 px rms on
# both top corners); the display 419 px wide at x 28.5, centred at y 473.5 (its 16:9 window 744.9 tall); the slots
# 165 x 14 centred at x 238 (y 46.5 and 896), the camera at (105, 48) (drawn a little larger than measured, the lens 8.4 px across in a 12 px ring, as large as the 5X's on the page, so it reads at the page's size), the power key y 310-366 and the volume rocker
# 404-519, about 1.5 px proud. The phone is as tall as the Nexus 6 (159.3 mm), so it is drawn to the Nexus 6 frame's
# height (781.2 px): the 5.7" panel at 1 dp = 0.8523 px is 350.67 x 623.41 (411.43 x 731.43 dp).
n6p_box = (10.47, 1.22, 466.18, 934.71)
svg, info = frame('nexus-6p', None, (n6p_box[0], n6p_box[2]), (n6p_box[1], n6p_box[3]), (28.5, 101.05, 447.5, 845.95), (350.67, 623.41),
  [('meshslot', 238.3, 46.5, 165, 14), ('frontcam', 105, 48, 6, 4.2), ('meshslot', 238.3, 896, 165, 14)],
  [('right', 310, 366, 2), ('right', 404, 519, 2)],
  {'body': ['#28292b', '#141415', '#1d1d1f'], 'rim': ['#e4e5e7', '#8f9193', '#c9cbcd'], 'rimWidth': 2.2, 'chin': .05, 'glassInset': 2.0},
  contour=superellipse_body(*n6p_box, 60, 60, 2.25))
open('device-nexus-6p.svg', 'w').write(svg); out['n6p'] = info
print(json.dumps(out, indent=1))
