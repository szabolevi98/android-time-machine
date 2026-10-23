/* Photos › Edit on the Nexus 6 (LMY48Y): Google+ 4.9.0 (PlusOne.apk) opens its own photo editor,
   com.google.android.apps.photoeditor's PhotoEditorActivity on the Snapseed library (libraries.snapseed / photoeditor).
   LMY48Y has no Gallery, so this is the only editor of the image. From the APK:
   - PhotoEditorActivity: FEATURE_ACTION_BAR_OVERLAY, the action bar without background, home or title; its custom view
     is action_done_button.xml (ic_action_accept, 8 dp, "Done", 20 dp in) and photo_editor.xml puts Compare in the bar
     (action_compare_button.xml: ic_action_compare, 12 dp padding) and Revert, Feedback, Help in the overflow (two TEMP:
     debug items left out). onBackPressed with changes: "Do you really want to exit?" (Exit / Continue Editing).
   - filter_selector_fragment.xml on main_background #262626: the picture (FitImageView 49 dp from the top, 20 dp in,
     8 dp above the strip) over a HorizontalScrollView (8 dp top padding) of selector_tool_item_view.xml ToolButtons
     (ParameterPanelToolbarButton: 4 dp padding, 56 dp min width, 12 dp titles in fo_item_title: white, #4285f4 active).
   - The tools and their order are cdf's table (each with its ic_fs_* tile): AUTO, CROP, ROTATE, LOOKS, TUNE IMAGE,
     SELECTIVE, DETAILS, VINTAGE, DRAMA, BLACK & WHITE, HDR SCAPE, RETROLUX, CENTER FOCUS, TILT-SHIFT, FRAMES; the
     parameters each tool fragment lists (ceq.d names them: photo_editor_param_*) and its tool buttons (ic_tb_*).
   - generic_filter_fragment.xml + filter_parameter_fragment.xml: the picture (54 dp from the top, 20 dp in, 80 dp above
     the bottom; Rotate 70 dp) over the 80 dp parameter panel (white, 10 dp clear on top): the value (24 dp) over the
     parameter's name (12 dp, #252525) 30 dp in, up to three ToolButtons on the right (#646464, #4285f4 when on), and
     ItemSelectorView (black) for the styles: 38 dp items with a 2 dp border, 10 dp apart. ParameterOverlayView: a
     vertical drag on the picture lists the parameters (16 dp text, 30 / 9 dp margins, 2 dp apart), a horizontal drag
     changes the chosen one; ParameterValueActionView shows it 50 dp from the top (14 sp white on #af1f1f1f, 4 dp
     corners).
   - LOOKS: presets_fragment.xml, FilmFilterParameter's 15 presets as 75 dp previews labelled 01-15 (cgm.a "%02d").
   The filters themselves run in the native library, which the APK does not describe: the looks here are the simulator's
   own SVG approximations of the named effects; the Vintage and Retrolux styles take their shadow, middle and highlight
   colours from the APK's own style swatches (ic_fo_vintage2_style_*, ic_fo_retrolux_*). The edit is kept with the
   picture (photo.plusEdit, non-destructive as the editor says) and media.js draws it wherever the picture shows; Revert
   brings back the original. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const A = name => `assets/gpe-${name}.png`;
  const lang = () => String(window.AndroidI18n?.language || 'en').slice(0, 2);
  const S = key => { const row = window.StockStrings?.photoeditor?.[key]; return row ? AndroidStrings.pick(row, lang(), key) : key; };
  const clone = value => JSON.parse(JSON.stringify(value ?? null));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // ceq.d: parameter id → photo_editor_param_*; FRAMES (cfg) shows its parameter as Frame Width.
  const NAME = {0: 'Brightness', 1: 'Contrast', 2: 'Saturation', 4: 'Center Size', 6: 'Vignette Strength', 9: 'Style Strength', 11: 'Warmth', 12: 'Filter Strength', 14: 'Grain', 15: 'Sharpening', 16: 'Structure', 17: 'Transition', 19: 'Blur Strength', 20: 'Shadows', 22: 'Inner Brightness', 23: 'Outer Brightness', 38: 'Straighten Angle', 221: 'Frame Width', 232: 'Light Leaks', 233: 'Scratches'};
  const BIPOLAR = new Set([0, 1, 2, 11, 20, 22, 23]);
  const range = id => id === 38 ? [-10, 10] : BIPOLAR.has(id) ? [-100, 100] : [0, 100];
  // Style swatches sampled from the APK's icons: [shadows, middle, highlights].
  const VINTAGE = [['#2e2c40', '#827c71', '#e1d2b4'], ['#603836', '#a28f7b', '#e3ccaf'], ['#4d3151', '#8e7576', '#dbcea3'], ['#236868', '#aabba5', '#f2dfc5'], ['#3b3a41', '#88a7a0', '#deeac9'], ['#1f3b56', '#88aba6', '#f5f4e1'], ['#525d76', '#93a5a9', '#edf3c9'], ['#383c5b', '#b2a5a1', '#f0edca'], ['#413946', '#68748e', '#d2d2b5'], ['#50413d', '#8da5b6', '#d8e2de'], ['#482c40', '#907c71', '#e0d2b4'], ['#242424', '#5c5c5c', '#d9d9d9']];
  const RETROLUX = [['#50414b', '#b59b81', '#ede8c2'], ['#373a44', '#989eb0', '#d3d9e7'], ['#573942', '#d0dea8', '#eef1c5'], ['#563939', '#d0dec0', '#eef1d1'], ['#4a524d', '#b4ae99', '#ddd3b5'], ['#51483a', '#d9bb83', '#f2e6a8'], ['#4e3840', '#afaf9b', '#cfd0be'], ['#514148', '#e1cfb4', '#eeead6'], ['#344755', '#cfb6ac', '#f0dfcb'], ['#30473f', '#92bedb', '#d9ecf5'], ['#3b3028', '#9dad95', '#cadfcc'], ['#353138', '#9eaea6', '#cce1d0'], ['#50433d', '#c5b592', '#e4d3ad']];
  const FRAMES = ['plain00', 'plain01', 'plain02', '0', '1', '2', '3', '4', '7', '8', '9', '11', '12'];
  // The simulator's frame drawings for FRAMES' styles: colour (w white, k black, p paper), inset, corner, rough edge, inner line.
  const FRAME_LOOK = {plain00: ['w', 1, 0], plain01: ['w', .6, 0], plain02: ['w', 1, 2], 0: ['k', 1.2, 0, 0, 0, 'film'], 1: ['k', 1, 2.4], 2: ['k', 1, 2.4, 0, '#cfcfcf'], 3: ['w', 1, 0, 1], 4: ['w', 1, 0, 0, '#3c3c3c'], 7: ['k', 1.1, 0, 1], 8: ['w', 1, 0, 1, '#4a4a4a'], 9: ['w', 1, 3.2], 11: ['p', 1.2, 0, 1], 12: ['w', 1.3, 0, 0, 0, 'soft']};
  const LENSES = [['Neutral', 'neutral', [.3, .59, .11]], ['Red', 'red', [.78, .17, .05]], ['Orange', 'orange', [.6, .33, .07]], ['Yellow', 'yellow', [.45, .45, .1]], ['Green', 'green', [.22, .68, .1]]];
  const BW_STYLES = [['BW Neutral', {}], ['BW Contrast', {1: 45}], ['BW Bright', {0: 35, 1: -10}], ['BW Dark', {0: -35, 1: 15}], ['Film', {1: 20, 14: 45}], ['Darken Sky', {1: 15, sky: 1}]];
  const DRAMA_STYLES = [['Drama 1', {12: 50, 2: -20}, 0], ['Drama 2', {12: 75, 2: -35}, 0], ['Bright 1', {12: 45, 2: 0}, .18], ['Bright 2', {12: 65, 2: 10}, .3], ['Dark 1', {12: 50, 2: -25}, -.2], ['Dark 2', {12: 75, 2: -40}, -.32]];
  const HDR_STYLES = [['Nature', 'nature', {12: 60, 0: 0, 2: 20}], ['People', 'people', {12: 35, 0: 10, 2: 0}], ['HDR Fine', 'fine', {12: 40, 0: 0, 2: 5}], ['HDR Strong', 'strong', {12: 85, 0: -5, 2: 25}]];
  const FOCUS_STYLES = [['Portrait 1', {19: 30, 23: -30, 22: 10, 4: 50}], ['Portrait 2', {19: 50, 23: -50, 22: 20, 4: 40}], ['Vignette', {19: 0, 23: -60, 22: 0, 4: 60}], ['Blur', {19: 80, 23: 0, 22: 0, 4: 45}], ['Old Lens', {19: 60, 23: -40, 22: 10, 4: 35}], ['Foggy', {19: 40, 23: 40, 22: 0, 4: 50}]];
  const TILT_STYLES = [['Linear', 'linear'], ['Elliptical', 'circular']];
  // The 15 Looks presets: the simulator's mixes of the swatches above, a contrast and a saturation.
  const LOOKS = [[VINTAGE[0], .55, 10, -10], [VINTAGE[3], .6, 15, 0], [RETROLUX[5], .55, 5, 10], [VINTAGE[5], .5, 20, -15], [RETROLUX[9], .5, 10, 0], [VINTAGE[11], .9, 30, -100], [RETROLUX[2], .6, 0, 5], [VINTAGE[1], .65, 15, -5], [RETROLUX[7], .5, -10, -20], [VINTAGE[6], .55, 25, 15], [RETROLUX[11], .6, 10, -10], [VINTAGE[8], .5, 35, -25], [RETROLUX[0], .45, 20, 20], [VINTAGE[9], .5, -5, -30], [RETROLUX[12], .7, 15, 0]];

  // cdf's table, in its order.
  const TOOLS = [
    {key: 'auto', name: 'AUTO', icon: 'ic_fs_1_autofix', params: []},
    {key: 'crop', name: 'CROP', icon: 'ic_fs_1_crop', params: []},
    {key: 'rotate', name: 'ROTATE', icon: 'ic_fs_1_rotate', params: [38]},
    {key: 'looks', name: 'LOOKS', icon: 'ic_fs_1_presets', params: []},
    {key: 'tune', name: 'TUNE IMAGE', icon: 'ic_fs_2_tuneimage', params: [0, 1, 2, 20, 11]},
    {key: 'selective', name: 'SELECTIVE', icon: 'ic_fs_2_adjust', params: [0, 2, 1, 4]},
    {key: 'details', name: 'DETAILS', icon: 'ic_fs_2_details', params: [16, 15]},
    {key: 'vintage', name: 'VINTAGE', icon: 'ic_fs_vintage', params: [0, 2, 9, 6]},
    {key: 'drama', name: 'DRAMA', icon: 'ic_fs_drama', params: [12, 2]},
    {key: 'bw', name: 'BLACK & WHITE', icon: 'ic_fs_blackandwhite', params: [0, 1, 14]},
    {key: 'hdr', name: 'HDR SCAPE', icon: 'ic_fs_hdr', params: [12, 0, 2]},
    {key: 'retrolux', name: 'RETROLUX', icon: 'ic_fs_retrolux', params: [0, 2, 1, 9, 233, 232]},
    {key: 'focus', name: 'CENTER FOCUS', icon: 'ic_fs_centerfocus', params: [19, 23, 22, 4]},
    {key: 'tilt', name: 'TILT-SHIFT', icon: 'ic_fs_tiltshift', params: [17, 19, 0, 2, 1]},
    {key: 'frames', name: 'FRAMES', icon: 'ic_fs_frames', params: [221]}
  ];
  const tool = key => TOOLS.find(item => item.key === key);
  function fresh(key, photo) {
    const v = {};
    for (const id of tool(key).params) v[id] = 0;
    switch (key) {
      case 'auto': return {t: key, s: 1, v};
      case 'crop': return {t: key, s: 1, r: {x: 0, y: 0, w: 1, h: 1}, v};
      case 'rotate': return {t: key, q: 0, v};
      case 'looks': return {t: key, s: 0, v};
      case 'selective': return {t: key, pts: [], sel: -1, v};
      case 'vintage': return {t: key, s: 0, b: false, v: {...v, 9: 75, 6: 50}};
      case 'drama': return {t: key, s: 0, v: {...v, ...DRAMA_STYLES[0][1]}};
      case 'bw': return {t: key, s: 0, c: 0, v};
      case 'hdr': return {t: key, s: 0, v: {...v, ...HDR_STYLES[0][2]}};
      case 'retrolux': return {t: key, s: 0, seed: 1, v: {...v, 9: 75, 233: 40, 232: 40}};
      case 'focus': return {t: key, s: 0, strong: false, x: .5, y: .5, v: {...v, ...FOCUS_STYLES[0][1]}};
      case 'tilt': return {t: key, s: 0, x: .5, y: .5, v: {...v, 17: 40, 19: 50}};
      case 'frames': return {t: key, s: 0, col: '', base: (photo?.colors || [])[2] || '#364e59', v: {...v, 221: 50}};
      default: return {t: key, v};
    }
  }
  // A tool step that changes nothing is not kept.
  function idle(step) {
    const zero = Object.values(step.v || {}).every(value => !value);
    if (step.t === 'auto') return step.s === 0;
    if (step.t === 'crop') return step.r.w >= .999 && step.r.h >= .999;
    if (step.t === 'rotate') return !step.q && !step.v[38];
    if (step.t === 'selective') return !step.pts.some(p => [0, 1, 2].some(id => p.v[id]));
    if (['tune', 'details'].includes(step.t)) return zero;
    return false;
  }

  /* ---- The looks: an edit as SVG around the original picture ---- */
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255);
  const n2 = x => +x.toFixed(4);
  function begin(href, w, h) { return {defs: '', id: 0, w, h, body: `<image href="${href}" width="${w}" height="${h}" preserveAspectRatio="none"/>`}; }
  const next = (st, p) => `${p}${++st.id}`;
  function filterDef(st, prims) { const id = next(st, 'f'); st.defs += `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${st.w}" height="${st.h}" color-interpolation-filters="sRGB">${prims}</filter>`; return id; }
  const wrap = (st, prims) => { if (prims) st.body = `<g filter="url(#${filterDef(st, prims)})">${st.body}</g>`; };
  const layer = st => { const id = next(st, 'l'); st.defs += `<g id="${id}">${st.body}</g>`; return id; };
  const funcs = (type, attrs) => `<feComponentTransfer>${['R', 'G', 'B'].map((c, i) => `<feFunc${c} type="${type}" ${typeof attrs === 'function' ? attrs(i) : attrs}/>`).join('')}</feComponentTransfer>`;
  const linear = (slope, intercept) => funcs('linear', `slope="${n2(slope)}" intercept="${n2(intercept)}"`);
  // Brightness as a gamma curve, contrast around the middle grey, saturation, warmth and the shadows' end of the curve.
  const bright = b => b ? funcs('gamma', `amplitude="1" exponent="${n2(b > 0 ? 1 - b * .45 : 1 - b * .9)}" offset="0"`) : '';
  const contrast = c => { if (!c) return ''; const s = 1 + c * .55; return linear(s, (1 - s) / 2); };
  const saturate = s => s ? `<feColorMatrix type="saturate" values="${n2(Math.max(0, 1 + s))}"/>` : '';
  const warmth = k => k ? `<feColorMatrix type="matrix" values="${n2(1 + k * .12)} 0 0 0 ${n2(k * .02)} 0 ${n2(1 + k * .03)} 0 0 0 0 0 ${n2(1 - k * .14)} 0 0 0 0 0 1 0"/>` : '';
  const shadows = k => k ? funcs('table', `tableValues="${n2(Math.max(0, k * .14))} ${n2(.25 + k * .1)} ${n2(.5 + k * .03)} .75 1"`) : '';
  const sharpen = k => { if (!k) return ''; const a = n2(k * .5); return `<feConvolveMatrix order="3" preserveAlpha="true" kernelMatrix="0 -${a} 0 -${a} ${n2(1 + 4 * k * .5)} -${a} 0 -${a} 0"/>`; };
  const opaque = '<feComponentTransfer><feFuncA type="table" tableValues="1 1"/></feComponentTransfer>';
  const blur = (st, amount) => amount > 0 ? `<feGaussianBlur stdDeviation="${n2(amount * Math.min(st.w, st.h) / 768 * 14)}"/>${opaque}` : '';
  // Toning: each channel through the swatch's shadow, middle and highlight value, mixed with the picture by strength.
  function tone(swatch, strength) {
    if (!swatch || strength <= 0) return '';
    const [lo, mid, hi] = swatch.map(hex);
    return `<feComponentTransfer in="SourceGraphic" result="toned">${['R', 'G', 'B'].map((c, i) => `<feFunc${c} type="table" tableValues="${n2(lo[i])} ${n2(mid[i])} ${n2(hi[i])}"/>`).join('')}</feComponentTransfer><feComposite in="toned" in2="SourceGraphic" operator="arithmetic" k1="0" k2="${n2(strength)}" k3="${n2(1 - strength)}" k4="0"/>`;
  }
  function grain(st, amount) {
    if (amount <= 0) return '';
    return `<feTurbulence type="fractalNoise" baseFrequency="${n2(.9 * 1024 / Math.max(st.w, st.h))}" numOctaves="2" seed="7" result="noise"/><feColorMatrix in="noise" type="matrix" values=".33 .33 .33 0 0 .33 .33 .33 0 0 .33 .33 .33 0 0 0 0 0 0 1" result="grey"/><feComposite in="SourceGraphic" in2="grey" operator="arithmetic" k1="0" k2="1" k3="${n2(amount * .5)}" k4="${n2(-amount * .25)}"/>`;
  }
  const grey = weights => `<feColorMatrix type="matrix" values="${[0, 1, 2].map(() => `${weights.join(' ')} 0 0`).join(' ')} 0 0 0 1 0"/>`;
  function vignette(st, amount, cx = .5, cy = .5) {
    if (amount <= 0) return;
    const id = next(st, 'v');
    st.defs += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r=".75"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${n2(Math.min(.92, amount))}"/></radialGradient>`;
    st.body += `<rect width="${st.w}" height="${st.h}" fill="url(#${id})"/>`;
  }
  // A filtered copy of the picture shown through a mask (radial: centre and radius; band: a horizontal strip).
  function masked(st, base, prims, shape, invert) {
    const id = next(st, 'm'), g = next(st, 'g'), on = invert ? '#000' : '#fff', off = invert ? '#fff' : '#000';
    if (shape.kind === 'band') {
      const half = shape.size / 2, soft = shape.soft;
      const stops = [[0, off], [Math.max(0, shape.y - half - soft), off], [Math.max(0, shape.y - half), on], [Math.min(1, shape.y + half), on], [Math.min(1, shape.y + half + soft), off], [1, off]];
      st.defs += `<linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${n2(o)}" stop-color="${c}"/>`).join('')}</linearGradient>`;
    } else {
      st.defs += `<radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${n2(shape.x * st.w)}" cy="${n2(shape.y * st.h)}" r="${n2(shape.r * Math.max(st.w, st.h))}"${shape.ry ? ` gradientTransform="translate(${n2(shape.x * st.w)} ${n2(shape.y * st.h)}) scale(1 ${n2(shape.ry)}) translate(${n2(-shape.x * st.w)} ${n2(-shape.y * st.h)})"` : ''}><stop offset="${n2(shape.inner ?? 0)}" stop-color="${on}"/><stop offset="1" stop-color="${off}"/></radialGradient>`;
    }
    st.defs += `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="${st.w}" height="${st.h}"><rect width="${st.w}" height="${st.h}" fill="url(#${g})"/></mask>`;
    st.body += `<g mask="url(#${id})"><g filter="url(#${filterDef(st, prims)})"><use href="#${base}"/></g></g>`;
  }
  // A seeded random sequence, so a Retrolux shuffle stays the same picture.
  const rand = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const LOOK = {
    auto(st, s) { const k = [0, 1, 1.8][s.s] || 0; wrap(st, k ? contrast(.1 * k) + saturate(.1 * k) + bright(.05 * k) : ''); },
    crop(st, s) {
      const r = s.r, w = st.w * r.w, h = st.h * r.h;
      st.body = `<svg width="${n2(w)}" height="${n2(h)}" viewBox="${n2(r.x * st.w)} ${n2(r.y * st.h)} ${n2(w)} ${n2(h)}">${st.body}</svg>`; st.w = w; st.h = h;
    },
    rotate(st, s) {
      const q = ((s.q || 0) % 4 + 4) % 4, a = (s.v[38] || 0) * Math.PI / 180, w = q % 2 ? st.h : st.w, h = q % 2 ? st.w : st.h;
      const c = Math.abs(Math.cos(a)), sn = Math.abs(Math.sin(a)), k = Math.max((w * c + h * sn) / w, (w * sn + h * c) / h);
      st.body = `<g transform="translate(${n2(w / 2)} ${n2(h / 2)}) rotate(${n2(q * 90 + (s.v[38] || 0))}) scale(${n2(k)}) translate(${n2(-st.w / 2)} ${n2(-st.h / 2)})">${st.body}</g>`; st.w = w; st.h = h;
    },
    looks(st, s) { const [sw, k, c, sat] = LOOKS[s.s] || LOOKS[0]; wrap(st, tone(sw, k) + contrast(c / 100) + saturate(sat / 100)); },
    tune(st, s) { const v = s.v; wrap(st, bright(v[0] / 100) + shadows(v[20] / 100) + contrast(v[1] / 100) + saturate(v[2] / 100) + warmth(v[11] / 100)); },
    selective(st, s) {
      if (!s.pts.length) return;
      const base = layer(st); st.body = `<use href="#${base}"/>`;
      for (const p of s.pts) masked(st, base, bright(p.v[0] / 100) + contrast(p.v[1] / 100) + saturate(p.v[2] / 100), {x: p.x, y: p.y, r: .08 + (p.v[4] || 0) / 100 * .3});
    },
    details(st, s) { wrap(st, contrast(s.v[16] / 100 * .35) + sharpen(s.v[15] / 100)); },
    vintage(st, s) {
      const v = s.v;
      wrap(st, tone(VINTAGE[s.s], .3 + v[9] / 100 * .7) + bright(v[0] / 100) + saturate(v[2] / 100 - .15));
      if (s.b) { const base = layer(st); st.body = `<use href="#${base}"/>`; masked(st, base, blur(st, .35), {x: .5, y: .5, r: .62, inner: .55}, true); }
      vignette(st, v[6] / 100 * .85);
    },
    drama(st, s) { const [, , b] = DRAMA_STYLES[s.s] || DRAMA_STYLES[0], k = s.v[12] / 100; wrap(st, bright(b) + contrast(.15 + k * .55) + sharpen(k * .6) + saturate(s.v[2] / 100)); },
    bw(st, s) {
      const v = s.v, style = BW_STYLES[s.s] || BW_STYLES[0], extra = style[1];
      wrap(st, grey(LENSES[s.c]?.[2] || LENSES[0][2]) + bright(v[0] / 100) + contrast(v[1] / 100) + grain(st, v[14] / 100));
      if (extra.sky) { const id = next(st, 'k'); st.defs += `<linearGradient id="${id}" x2="0" y2="1"><stop stop-color="#000" stop-opacity=".55"/><stop offset=".55" stop-color="#000" stop-opacity="0"/></linearGradient>`; st.body += `<rect width="${st.w}" height="${st.h}" fill="url(#${id})"/>`; }
    },
    hdr(st, s) { const k = s.v[12] / 100; wrap(st, shadows(k * .5) + contrast(k * .35) + sharpen(k * .8) + bright(s.v[0] / 100) + saturate(s.v[2] / 100 + k * .15)); },
    retrolux(st, s) {
      const v = s.v, rnd = rand(s.seed || 1);
      wrap(st, tone(RETROLUX[s.s], .3 + v[9] / 100 * .7) + bright(v[0] / 100) + contrast(v[1] / 100) + saturate(v[2] / 100 - .1));
      const leaks = v[232] / 100;
      if (leaks > 0) for (const [cx, cy, color] of [[rnd() < .5 ? 0 : 1, rnd(), '#ff8a3c'], [rnd(), rnd() < .5 ? 0 : 1, '#ff3c78']]) {
        const id = next(st, 'k'); st.defs += `<radialGradient id="${id}" cx="${n2(cx)}" cy="${n2(cy)}" r=".55"><stop stop-color="${color}" stop-opacity="${n2(leaks * .65)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
        st.body += `<rect width="${st.w}" height="${st.h}" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
      }
      const scratches = Math.round(v[233] / 100 * 14);
      for (let i = 0; i < scratches; i++) { const x = rnd() * st.w, y = rnd() * st.h, len = st.h * (.1 + rnd() * .5); st.body += `<path d="M${n2(x)} ${n2(y)}q${n2((rnd() - .5) * 30)} ${n2(len / 2)} ${n2((rnd() - .5) * 20)} ${n2(len)}" stroke="#fff" stroke-opacity="${n2(.2 + rnd() * .35)}" stroke-width="${n2(Math.max(st.w, st.h) / 900)}" fill="none"/>`; }
      vignette(st, .35);
    },
    focus(st, s) {
      const v = s.v, base = layer(st), size = .12 + v[4] / 100 * .5;
      st.body = `<g filter="url(#${filterDef(st, bright(v[22] / 100) || '<feOffset/>')})"><use href="#${base}"/></g>`;
      masked(st, base, blur(st, v[19] / 100 * (s.strong ? 1 : .55)) + bright(v[23] / 100) || '<feOffset/>', {x: s.x, y: s.y, r: size, inner: .35}, true);
      if (s.s === 4) wrap(st, saturate(-.25));
    },
    tilt(st, s) {
      const v = s.v, base = layer(st), soft = .05 + v[17] / 100 * .3;
      st.body = `<use href="#${base}"/>`;
      const shape = s.s === 1 ? {x: s.x, y: s.y, r: .3, inner: .3 / (.3 + soft), ry: .7} : {kind: 'band', y: s.y, size: .25, soft};
      masked(st, base, blur(st, v[19] / 100), shape, true);
      wrap(st, bright(v[0] / 100) + contrast(v[1] / 100) + saturate(v[2] / 100));
    },
    frames(st, s) {
      const [kind, inset, corner, rough, line, extra] = FRAME_LOOK[FRAMES[s.s]] || FRAME_LOOK.plain00;
      const t = Math.min(st.w, st.h) * (.015 + s.v[221] / 100 * .07) * inset, W = st.w, H = st.h;
      const color = s.col || (kind === 'k' ? '#111' : kind === 'p' ? '#e8dcbf' : '#fff'), r = corner * t;
      let edge = '';
      if (rough) { const id = next(st, 'r'); st.defs += `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency="${n2(4 / t)}" numOctaves="3" seed="3"/><feDisplacementMap in="SourceGraphic" scale="${n2(t * .9)}" xChannelSelector="R" yChannelSelector="G"/></filter>`; edge = ` filter="url(#${id})"`; }
      if (extra === 'soft') { const id = next(st, 's'); st.defs += `<filter id="${id}"><feGaussianBlur stdDeviation="${n2(t * .6)}"/></filter>`; edge = ` filter="url(#${id})"`; }
      st.body += `<path${edge} fill="${color}" fill-rule="evenodd" d="M${-t} ${-t}H${W + t}V${H + t}H${-t}Z M${n2(t + r)} ${n2(t)}H${n2(W - t - r)}${r ? `A${n2(r)} ${n2(r)} 0 0 1 ${n2(W - t)} ${n2(t + r)}` : ''}V${n2(H - t - r)}${r ? `A${n2(r)} ${n2(r)} 0 0 1 ${n2(W - t - r)} ${n2(H - t)}` : ''}H${n2(t + r)}${r ? `A${n2(r)} ${n2(r)} 0 0 1 ${n2(t)} ${n2(H - t - r)}` : ''}V${n2(t + r)}${r ? `A${n2(r)} ${n2(r)} 0 0 1 ${n2(t + r)} ${n2(t)}` : ''}Z"/>`;
      if (line) st.body += `<rect x="${n2(t * 1.15)}" y="${n2(t * 1.15)}" width="${n2(W - t * 2.3)}" height="${n2(H - t * 2.3)}" rx="${n2(r)}" fill="none" stroke="${line}" stroke-width="${n2(Math.max(1, t * .08))}"/>`;
      if (extra === 'film') st.body += `<text x="${n2(t * 2.2)}" y="${n2(t * .78)}" font-family="monospace" font-weight="700" font-size="${n2(t * .62)}" fill="#f0a020">▶ 18  F 18</text>`;
    }
  };
  // The picture with an edit drawn over it, as an SVG data URI of the edit's own size.
  function compose(href, w, h, steps) {
    const st = begin(href, w, h);
    for (const step of steps || []) LOOK[step.t]?.(st, step);
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${n2(st.w)}" height="${n2(st.h)}" viewBox="0 0 ${n2(st.w)} ${n2(st.h)}"><defs>${st.defs}</defs>${st.body}</svg>`);
  }

  /* ---- The editor screens ---- */
  const state = ui => ui.pe;
  const photoOf = ctx => (ctx.data.photos || []).find(p => p.id === state(ctx.ui)?.photo);
  const original = (ctx, photo) => ctx.media.image({...photo, plusEdit: undefined});
  const size = (ctx, photo) => photo.pano ? [3072, 768] : (((Number(photo.rotation) || 0) % 180) ? [768, 1024] : [1024, 768]);
  function preview(ctx, steps) {
    const photo = photoOf(ctx); if (!photo) return '';
    const [w, h] = size(ctx, photo);
    return steps.length ? compose(original(ctx, photo), w, h, steps) : original(ctx, photo);
  }
  // The shape of the picture after the edit's crops and quarter turns.
  function ratioOf(ctx, steps) { let [w, h] = size(ctx, photoOf(ctx)); for (const st of steps) { if (st.t === 'crop') { w *= st.r.w; h *= st.r.h; } if (st.t === 'rotate' && st.q % 2) [w, h] = [h, w]; } return n2(w / h); }
  const working = pe => pe.tool && !pe.tool.list ? [...pe.steps, pe.tool.step] : pe.steps;
  // The geometry tools show the whole picture with their handles; the result appears once applied.
  const shown = pe => pe.tool && ['crop'].includes(pe.tool.step.t) ? pe.steps : working(pe);
  const button = (action, icon, label, on, extra = '') => `<button class="pe-tb${on ? ' on' : ''}" data-action="${action}"${extra} aria-pressed="${!!on}"><img src="${A(`${icon}_${on ? 'active' : 'default'}`)}" alt=""><span>${e(S(label))}</span></button>`;
  function toolButtons(pe) {
    const s = pe.tool.step;
    switch (s.t) {
      case 'auto': return [['off', 'Off'], ['on', 'Normal'], ['high', 'High']].map(([icon, label], i) => button('pe-level', `ic_tb_autofix_${icon}`, label, s.s === i, ` data-id="${i}"`)).join('');
      case 'crop': return [['1_1', 'Square', 0], ['original', 'Original', 1], ['free_ratio', 'Free', 2]].map(([icon, label, i]) => button('pe-ratio', `ic_tb_crop_${icon}`, label, s.s === i, ` data-id="${i}"`)).join('');
      case 'rotate': return `<button class="pe-tb" data-action="pe-turn" data-id="-1"><img src="${A('ic_tb_rotate_left_default')}" alt=""><span>${e(S('Rotate Left'))}</span></button><button class="pe-tb" data-action="pe-turn" data-id="1"><img src="${A('ic_tb_rotate_right_default')}" alt=""><span>${e(S('Rotate Right'))}</span></button>`;
      case 'selective': return button('pe-cp-delete', 'ic_tb_cp_delete', 'Delete', false, s.sel < 0 ? ' disabled' : '') + button('pe-cp-add', 'ic_tb_cp_add', 'Add', pe.tool.adding);
      case 'vintage': return `<button class="pe-tb${s.b ? ' on' : ''}" data-action="pe-toggle" aria-pressed="${s.b}"><img src="${A(s.b ? 'ic_tb_status_on_blur_active' : 'ic_tb_status_off_blur_default')}" alt=""><span>${e(S(s.b ? 'Blur On' : 'Blur Off'))}</span></button>` + styleButton(pe, 'style');
      case 'drama': case 'hdr': case 'tilt': return styleButton(pe, 'style');
      case 'bw': return `<button class="pe-tb${pe.tool.list === 'color' ? ' on' : ''}" data-action="pe-list" data-id="color"><img src="${A(pe.tool.list === 'color' ? 'ic_tb_colorfilter_active' : 'ic_tb_colorfilter_default')}" alt=""><span>${e(S('Color Filter'))}</span></button>` + styleButton(pe, 'style');
      case 'retrolux': return `<button class="pe-tb" data-action="pe-shuffle"><img src="${A('ic_tb_shuffle_default')}" alt=""><span>${e(S('Shuffle'))}</span></button>` + styleButton(pe, 'style');
      case 'focus': return `<button class="pe-tb${s.strong ? ' on' : ''}" data-action="pe-toggle" aria-pressed="${s.strong}"><img src="${A(s.strong ? 'ic_tb_status_on_blur_active' : 'ic_tb_status_on_blur_default')}" alt=""><span>${e(S(s.strong ? 'Strong' : 'Weak'))}</span></button>` + styleButton(pe, 'style');
      case 'frames': return `<button class="pe-tb${s.col ? ' on' : ''}" data-action="pe-toggle" aria-pressed="${!!s.col}"><img src="${A(s.col ? 'ic_tb_colorize_active' : 'ic_tb_colorize_default')}" alt=""><span>${e(S('Colorized'))}</span></button>` + `<button class="pe-tb${pe.tool.list === 'style' ? ' on' : ''}" data-action="pe-list" data-id="style"><img src="${A(pe.tool.list === 'style' ? 'ic_tb_frames_active' : 'ic_tb_frames_default')}" alt=""><span>${e(S('Frame'))}</span></button>`;
      default: return '';
    }
  }
  const styleButton = (pe, id) => `<button class="pe-tb${pe.tool.list === id ? ' on' : ''}" data-action="pe-list" data-id="${id}"><img src="${A(pe.tool.list === id ? 'ic_tb_style_active' : 'ic_tb_style_default')}" alt=""><span>${e(S('Style'))}</span></button>`;
  // The items of ItemSelectorView: the APK's swatches where it has them, otherwise the picture with the style.
  function items(ctx, pe) {
    const s = pe.tool.step, list = pe.tool.list, photo = photoOf(ctx);
    const thumb = variant => preview(ctx, [...pe.steps, {...clone(s), ...variant}]);
    const item = (i, picked, img, label) => `<button class="pe-item${picked ? ' on' : ''}" data-action="pe-pick" data-id="${i}" aria-label="${e(label)}" aria-pressed="${picked}"><img src="${img}" alt=""></button>`;
    if (list === 'color') return LENSES.map(([label, icon], i) => item(i, s.c === i, A(`ic_fo_lens_${icon}_${s.c === i ? 'active' : 'default'}`), S(label))).join('');
    switch (s.t) {
      case 'vintage': return VINTAGE.map((_, i) => item(i, s.s === i, A(`ic_fo_vintage2_style_${i + 1}_default`), `${i + 1}`)).join('');
      case 'retrolux': return RETROLUX.map((_, i) => item(i, s.s === i, A(`ic_fo_retrolux_${i + 1}_default`), `${i + 1}`)).join('');
      case 'hdr': return HDR_STYLES.map(([label, icon], i) => item(i, s.s === i, A(`ic_fo_${icon}_${s.s === i ? 'active' : 'default'}`), S(label))).join('');
      case 'tilt': return TILT_STYLES.map(([label, icon], i) => item(i, s.s === i, A(`ic_fo_tiltshift_${icon}_${s.s === i ? 'active' : 'default'}`), S(label))).join('');
      case 'frames': return FRAMES.map((name, i) => item(i, s.s === i, A(`ic_fo_frames_${name}_default`), `${i + 1}`)).join('');
      case 'drama': return DRAMA_STYLES.map(([label, v], i) => item(i, s.s === i, photo ? thumb({s: i, v: {...s.v, ...v}}) : '', S(label))).join('');
      case 'bw': return BW_STYLES.map(([label, v], i) => item(i, s.s === i, photo ? thumb({s: i, v: {...s.v, ...Object.fromEntries(Object.entries(v).filter(([k]) => k !== 'sky'))}}) : '', S(label))).join('');
      case 'focus': return FOCUS_STYLES.map(([label, v], i) => item(i, s.s === i, photo ? thumb({s: i, v: {...s.v, ...v}}) : '', S(label))).join('');
      default: return '';
    }
  }
  const signed = (id, value) => id === 38 ? `${value > 0 ? '+' : ''}${value}°` : BIPOLAR.has(id) ? `${value > 0 ? '+' : ''}${value}` : `${value}`;
  const target = pe => { const s = pe.tool?.step; return s?.t === 'selective' ? s.pts[s.sel]?.v : s?.v; };
  function bar(ctx, pe, overflow) {
    return `<header class="pe-bar"><button class="pe-done" data-action="pe-done"><img src="${A('ic_action_accept')}" alt=""><span>${e(S('Done'))}</span></button><span class="pe-gap"></span><button class="pe-act" data-pe-compare aria-label="${e(S('Compare'))}"><img src="${A('ic_action_compare_default')}" alt=""></button>${overflow ? `<button class="pe-act" data-action="pe-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/bk33-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button>` : ''}</header>`;
  }
  function handles(pe) {
    const s = pe.tool?.step; if (!s) return '';
    if (s.t === 'crop') { const r = s.r; return `<div class="pe-crop" style="left:${r.x * 100}%;top:${r.y * 100}%;width:${r.w * 100}%;height:${r.h * 100}%" data-pe-handle="move">${['nw', 'ne', 'sw', 'se'].map(c => `<i class="pe-corner ${c}" data-pe-handle="${c}"></i>`).join('')}</div>`; }
    if (s.t === 'selective') return s.pts.map((p, i) => `<i class="pe-point${i === s.sel ? ' on' : ''}" style="left:${p.x * 100}%;top:${p.y * 100}%" data-pe-handle="pt" data-id="${i}">${i === s.sel ? e(S(NAME[pe.tool.param] || 'Brightness').slice(0, 1)) : ''}</i>`).join('');
    if (['focus', 'tilt'].includes(s.t)) return `<i class="pe-center" style="left:${s.x * 100}%;top:${s.y * 100}%" data-pe-handle="center"></i>`;
    if (s.t === 'rotate') return '<div class="pe-grid"></div>';
    return '';
  }
  function panel(ctx, pe) {
    const t = tool(pe.tool.step.t), values = target(pe), id = pe.tool.param;
    const readout = t.params.length && values ? `<b class="pe-value">${e(signed(id, Math.round(values[id] || 0)))}</b><span class="pe-name">${e(S(NAME[id]))}</span>` : `<span class="pe-name pe-title">${e(S(t.name))}</span>`;
    const selector = pe.tool.list ? `<div class="pe-selector" data-pe-strip><div>${items(ctx, pe)}</div></div>` : '';
    return `<div class="pe-panel"><div class="pe-readout" data-pe-readout>${readout}</div><div class="pe-tbs">${toolButtons(pe)}</div></div>${selector}`;
  }
  function render(ctx) {
    const pe = state(ctx.ui), photo = photoOf(ctx);
    if (!pe || !photo) return '';
    const menu = pe.menu ? `<div class="pe-scrim" data-action="pe-menu"></div><div class="pe-menu" role="menu"><button role="menuitem" data-action="pe-revert"${pe.steps.length ? '' : ' disabled'}>${e(S('Revert'))}</button><button role="menuitem" data-action="pe-unsupported">${e(S('Feedback'))}</button><button role="menuitem" data-action="pe-unsupported">${e(S('Help'))}</button></div>` : '';
    const dialog = pe.dialog === 'exit'
      ? `<div class="pe-scrim pe-dim"></div><div class="pe-dialog" role="alertdialog" aria-label="${e(S('Exit title'))}"><h3>${e(S('Exit title'))}</h3><p>${e(S('Exit message'))}</p><div><button data-action="pe-dialog" data-id="stay">${e(S('Continue Editing'))}</button><button data-action="pe-dialog" data-id="exit">${e(S('Exit'))}</button></div></div>`
      : pe.dialog === 'revert' ? `<div class="pe-scrim pe-dim"></div><div class="pe-dialog" role="alertdialog" aria-label="${e(S('Revert'))}"><p>${e(S('Revert message'))}</p><div><button data-action="pe-dialog" data-id="stay">${e(S('Cancel'))}</button><button data-action="pe-dialog" data-id="revert">${e(S('Revert'))}</button></div></div>` : '';
    if (!pe.tool) {
      const strip = TOOLS.map(t => `<button class="pe-tool" data-action="pe-tool" data-id="${t.key}"><img src="${A(t.icon)}" alt=""><span>${e(S(t.name))}</span></button>`).join('');
      return `<div class="app-view pe pe-select" data-pe-root>${bar(ctx, pe, true)}<div class="pe-stage"><div class="pe-frame" style="--ar:${ratioOf(ctx, pe.steps)}"><img class="pe-pic" data-pe-pic src="${preview(ctx, pe.steps)}" alt="${e(photo.name)}" draggable="false"></div></div><div class="pe-strip" data-pe-strip><div>${strip}</div></div>${menu}${dialog}</div>`;
    }
    if (pe.tool.step.t === 'looks') {
      const strip = LOOKS.map((_, i) => `<button class="pe-preset${pe.tool.step.s === i ? ' on' : ''}" data-action="pe-pick" data-id="${i}" aria-pressed="${pe.tool.step.s === i}"><img src="${preview(ctx, [...pe.steps, {t: 'looks', s: i, v: {}}])}" alt=""><span>${String(i + 1).padStart(2, '0')}</span></button>`).join('');
      return `<div class="app-view pe pe-looks" data-pe-root>${bar(ctx, pe, false)}<div class="pe-stage"><div class="pe-frame" style="--ar:${ratioOf(ctx, working(pe))}"><img class="pe-pic" data-pe-pic src="${preview(ctx, working(pe))}" alt="${e(photo.name)}" draggable="false"></div></div><div class="pe-strip pe-presets" data-pe-strip><div>${strip}</div></div>${dialog}</div>`;
    }
    const t = tool(pe.tool.step.t);
    const list = t.params.length && pe.tool.overlay ? `<div class="pe-params">${t.params.map(id => `<span class="${id === pe.tool.param ? 'on' : ''}">${e(S(NAME[id]))}</span>`).join('')}</div>` : '';
    return `<div class="app-view pe pe-edit pe-t-${t.key}" data-pe-root>${bar(ctx, pe, false)}<div class="pe-stage" data-pe-stage><div class="pe-frame" style="--ar:${ratioOf(ctx, shown(pe))}"><img class="pe-pic" data-pe-pic src="${preview(ctx, shown(pe))}" alt="${e(photo.name)}" draggable="false">${handles(pe)}</div></div><div class="pe-bubble" data-pe-bubble hidden></div>${list}${panel(ctx, pe)}${dialog}</div>`;
  }

  /* ---- Opening, the actions and Back ---- */
  function open(ui, photo) { ui.pe = {photo: photo.id, steps: clone(photo.plusEdit?.steps || []), saved: JSON.stringify(photo.plusEdit?.steps || []), tool: null, menu: false, dialog: ''}; }
  const dirty = pe => JSON.stringify(pe.steps) !== pe.saved;
  function leave(ctx) { ctx.ui.pe = null; ctx.ui.sub = 'photo'; ctx.render(); }
  function startTool(ctx, key) {
    const pe = state(ctx.ui), photo = photoOf(ctx), step = fresh(key, photo), t = tool(key);
    // Crop and Rotate pick up the frame already set; the colour tools start from their first style.
    if (key === 'crop') { const last = [...pe.steps].reverse().find(s => s.t === 'crop'); if (last) { step.r = clone(last.r); step.s = last.s; pe.steps = pe.steps.filter(s => s !== last); } }
    pe.tool = {step, param: t.params[0], list: '', overlay: false, adding: key === 'selective'};
    ctx.render();
  }
  function apply(ctx) {
    const pe = state(ctx.ui);
    if (pe.tool && !idle(pe.tool.step)) { const step = pe.tool.step; delete step.sel; if (step.t === 'frames' && !step.col) delete step.base; pe.steps.push(step); }
    pe.tool = null; ctx.render();
  }
  function ratio(step, which, aspect) {
    step.s = which;
    if (which === 1) step.r = {x: 0, y: 0, w: 1, h: 1};
    if (which === 0) { const side = Math.min(1, 1 / aspect); const w = aspect >= 1 ? side : 1, h = aspect >= 1 ? 1 : aspect; step.r = {x: (1 - w) / 2, y: (1 - h) / 2, w, h}; }
  }
  const aspectOf = (ctx, pe) => { const photo = photoOf(ctx), [w, h] = size(ctx, photo); let a = w / h; for (const s of pe.steps) { if (s.t === 'crop') a = a * s.r.w / s.r.h; if (s.t === 'rotate' && s.q % 2) a = 1 / a; } return a; };
  function handle(action, button, ctx) {
    const pe = state(ctx.ui); if (!pe) return false;
    const id = button?.dataset.id, s = pe.tool?.step;
    switch (action) {
      case 'pe-tool': startTool(ctx, id); return true;
      case 'pe-done': if (pe.tool) apply(ctx); else { const photo = photoOf(ctx); if (photo) { if (pe.steps.length) photo.plusEdit = {steps: clone(pe.steps)}; else delete photo.plusEdit; ctx.save(); } leave(ctx); } return true;
      case 'pe-menu': pe.menu = !pe.menu; ctx.render(); return true;
      case 'pe-revert': pe.menu = false; pe.dialog = 'revert'; ctx.render(); return true;
      case 'pe-unsupported': pe.menu = false; ctx.render(); ctx.toast('This feature is not part of the simulator.'); return true;
      case 'pe-dialog': {
        const kind = pe.dialog; pe.dialog = '';
        if (id === 'exit') { leave(ctx); return true; }
        if (id === 'revert' && kind === 'revert') pe.steps = [];
        ctx.render(); return true;
      }
      case 'pe-level': if (s) { s.s = Number(id) || 0; ctx.render(); } return true;
      case 'pe-ratio': if (s) { ratio(s, Number(id) || 0, aspectOf(ctx, pe)); ctx.render(); } return true;
      case 'pe-turn': if (s) { s.q = ((s.q || 0) + Number(id) + 4) % 4; ctx.render(); } return true;
      case 'pe-cp-add': if (s) { pe.tool.adding = !pe.tool.adding; ctx.render(); } return true;
      case 'pe-cp-delete': if (s && s.sel >= 0) { s.pts.splice(s.sel, 1); s.sel = s.pts.length - 1; ctx.render(); } return true;
      case 'pe-toggle': if (s) { if (s.t === 'vintage') s.b = !s.b; if (s.t === 'focus') s.strong = !s.strong; if (s.t === 'frames') s.col = s.col ? '' : s.base; ctx.render(); } return true;
      case 'pe-shuffle': if (s) { s.s = Math.floor(Math.random() * RETROLUX.length); s.seed = 1 + Math.floor(Math.random() * 1e6); ctx.render(); } return true;
      case 'pe-list': if (s) { pe.tool.list = pe.tool.list === id ? '' : id; ctx.render(); } return true;
      case 'pe-pick': {
        if (!s) return true;
        const i = Number(id) || 0;
        if (pe.tool.list === 'color') s.c = i;
        else {
          s.s = i;
          const preset = s.t === 'drama' ? DRAMA_STYLES[i][1] : s.t === 'hdr' ? HDR_STYLES[i][2] : s.t === 'focus' ? FOCUS_STYLES[i][1] : s.t === 'bw' ? BW_STYLES[i][1] : null;
          if (preset) Object.assign(s.v, Object.fromEntries(Object.entries(preset).filter(([k]) => k !== 'sky')));
        }
        if (s.t !== 'looks') pe.tool.list = '';
        ctx.render(); return true;
      }
      default: return false;
    }
  }
  // Back: the menu or a dialog first, then the open style list, then the tool (its change is dropped), then the editor.
  function back(ctx) {
    const pe = state(ctx.ui); if (!pe) return false;
    if (pe.dialog) pe.dialog = '';
    else if (pe.menu) pe.menu = false;
    else if (pe.tool?.list && pe.tool.step.t !== 'looks') pe.tool.list = '';
    else if (pe.tool) pe.tool = null;
    else if (dirty(pe)) pe.dialog = 'exit';
    else { leave(ctx); return true; }
    ctx.render(); return true;
  }

  /* ---- Touch: the parameter gestures, the handles, Compare and the strips ---- */
  function attach(root, ctx) {
    const pe = state(ctx.ui); if (!pe || !root || root.dataset.peBound) return;
    root.dataset.peBound = '1';
    const pic = root.querySelector('[data-pe-pic]'), dp = n => n * (root.getBoundingClientRect().width || 411) / 411.43;
    let frame = 0;
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (pic) pic.src = preview(ctx, shown(pe)); }); };
    const readout = () => {
      const t = pe.tool && tool(pe.tool.step.t), values = target(pe), id = pe.tool?.param;
      if (!t?.params.length || !values) return;
      const box = root.querySelector('[data-pe-readout]'), bubble = root.querySelector('[data-pe-bubble]'), text = signed(id, Math.round(values[id] || 0));
      if (box) box.innerHTML = `<b class="pe-value">${e(text)}</b><span class="pe-name">${e(S(NAME[id]))}</span>`;
      if (bubble) { bubble.hidden = false; bubble.textContent = `${S(NAME[id])} ${text}`; clearTimeout(bubble._t); bubble._t = setTimeout(() => { bubble.hidden = true; }, 900); }
    };
    // Compare: the picture before the edit (before the tool's change inside a tool) while held.
    const compare = root.querySelector('[data-pe-compare]');
    if (compare && pic) {
      const hold = on => { pic.src = on ? preview(ctx, pe.tool ? pe.steps : []) : preview(ctx, pe.tool?.step.t === 'looks' ? working(pe) : shown(pe)); };
      compare.addEventListener('pointerdown', event => { event.preventDefault(); compare.setPointerCapture?.(event.pointerId); hold(true); });
      for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) compare.addEventListener(type, () => hold(false));
    }
    // The strips scroll sideways with the wheel and with a mouse drag (a drag is not a tap).
    for (const strip of root.querySelectorAll('[data-pe-strip]')) {
      strip.addEventListener('wheel', event => { const d = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY; if (!d) return; strip.scrollLeft += d; event.preventDefault(); }, {passive: false});
      let drag = null;
      strip.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse') return; drag = {x: event.clientX, left: strip.scrollLeft, moved: false}; });
      strip.addEventListener('pointermove', event => { if (!drag) return; const dx = event.clientX - drag.x; if (Math.abs(dx) > 6) drag.moved = true; if (drag.moved) strip.scrollLeft = drag.left - dx; });
      strip.addEventListener('pointerup', () => { if (drag?.moved) strip.addEventListener('click', event => { event.stopPropagation(); event.preventDefault(); }, {capture: true, once: true}); drag = null; });
      strip.addEventListener('pointerleave', () => { drag = null; });
    }
    const stage = root.querySelector('[data-pe-stage]'), box = root.querySelector('.pe-frame');
    if (!stage || !box || !pe.tool) return;
    const s = pe.tool.step, t = tool(s.t);
    const at = event => { const r = box.getBoundingClientRect(); return {x: clamp((event.clientX - r.left) / r.width, 0, 1), y: clamp((event.clientY - r.top) / r.height, 0, 1), r}; };
    let g = null;
    stage.addEventListener('pointerdown', event => {
      if (event.button > 0 || pe.dialog) return;
      const handle = event.target.closest('[data-pe-handle]');
      stage.setPointerCapture?.(event.pointerId);
      g = {x: event.clientX, y: event.clientY, axis: '', handle: handle?.dataset.peHandle || '', id: Number(handle?.dataset.id), start: null};
      if (g.handle === 'pt') { s.sel = g.id; pe.tool.adding = false; g.start = {...s.pts[g.id]}; }
      else if (g.handle === 'center') g.start = {x: s.x, y: s.y};
      else if (g.handle) g.start = {...s.r};
      else if (t.params.length) { const values = target(pe); g.value = values ? values[pe.tool.param] || 0 : 0; g.index = t.params.indexOf(pe.tool.param); }
      event.preventDefault();
    });
    stage.addEventListener('pointermove', event => {
      if (!g) return;
      const dx = event.clientX - g.x, dy = event.clientY - g.y, r = box.getBoundingClientRect();
      if (!g.axis && Math.hypot(dx, dy) > dp(8)) g.axis = g.handle ? 'drag' : Math.abs(dx) > Math.abs(dy) ? 'h' : 'v';
      if (!g.axis) return;
      if (g.handle === 'pt') { const p = s.pts[g.id]; p.x = clamp(g.start.x + dx / r.width, 0, 1); p.y = clamp(g.start.y + dy / r.height, 0, 1); const el = root.querySelector(`[data-pe-handle="pt"][data-id="${g.id}"]`); if (el) { el.style.left = `${p.x * 100}%`; el.style.top = `${p.y * 100}%`; } refresh(); return; }
      if (g.handle === 'center') { s.x = clamp(g.start.x + dx / r.width, 0, 1); s.y = clamp(g.start.y + dy / r.height, 0, 1); const el = root.querySelector('[data-pe-handle="center"]'); if (el) { el.style.left = `${s.x * 100}%`; el.style.top = `${s.y * 100}%`; } refresh(); return; }
      if (g.handle) { cropDrag(s, g, dx / r.width, dy / r.height, aspectOf(ctx, pe)); const el = root.querySelector('.pe-crop'); if (el) Object.assign(el.style, {left: `${s.r.x * 100}%`, top: `${s.r.y * 100}%`, width: `${s.r.w * 100}%`, height: `${s.r.h * 100}%`}); return; }
      if (!t.params.length || (s.t === 'selective' && s.sel < 0)) return;
      if (g.axis === 'v') {
        const index = clamp(g.index + Math.round(dy / dp(34)), 0, t.params.length - 1);
        if (!pe.tool.overlay || pe.tool.param !== t.params[index]) { pe.tool.overlay = true; pe.tool.param = t.params[index]; showList(root, pe, t); readout(); }
      } else {
        const [lo, hi] = range(pe.tool.param), values = target(pe);
        values[pe.tool.param] = Math.round(clamp(g.value + dx / (r.width * .9) * (hi - lo), lo, hi));
        readout(); refresh();
      }
    });
    const end = event => {
      if (!g) return;
      const tap = !g.axis, gesture = g; g = null;
      if (pe.tool.overlay) { pe.tool.overlay = false; root.querySelector('.pe-params')?.remove(); }
      if (tap && s.t === 'selective' && pe.tool.adding && !gesture.handle && event) {
        const p = at(event), v = {}; for (const id of t.params) v[id] = 0;
        s.pts.push({x: p.x, y: p.y, v}); s.sel = s.pts.length - 1; pe.tool.adding = false; ctx.render(); return;
      }
      if (tap && gesture.handle === 'pt') { ctx.render(); return; }
      if (gesture.axis) ctx.render();
    };
    stage.addEventListener('pointerup', end);
    stage.addEventListener('pointercancel', () => end(null));
  }
  function showList(root, pe, t) {
    let list = root.querySelector('.pe-params');
    if (!list) { list = document.createElement('div'); list.className = 'pe-params'; root.querySelector('.pe-stage')?.after(list); }
    list.innerHTML = t.params.map(id => `<span class="${id === pe.tool.param ? 'on' : ''}">${e(S(NAME[id]))}</span>`).join('');
  }
  // Crop: the frame moves with the drag; a corner resizes it, keeping the shape for Square and Original.
  function cropDrag(s, g, fx, fy, aspect) {
    const o = g.start, min = .12;
    if (g.handle === 'move') { s.r.x = clamp(o.x + fx, 0, 1 - o.w); s.r.y = clamp(o.y + fy, 0, 1 - o.h); return; }
    const west = g.handle.includes('w'), north = g.handle.includes('n');
    let x0 = west ? clamp(o.x + fx, 0, o.x + o.w - min) : o.x, x1 = west ? o.x + o.w : clamp(o.x + o.w + fx, o.x + min, 1);
    let y0 = north ? clamp(o.y + fy, 0, o.y + o.h - min) : o.y, y1 = north ? o.y + o.h : clamp(o.y + o.h + fy, o.y + min, 1);
    if (s.s !== 2) {
      // Fractions of the picture: a kept shape of w/h = k in pixels is w = k·h·(H/W); Square k = 1, Original the start's.
      const k = s.s === 0 ? 1 / aspect : o.w / o.h, w = x1 - x0;
      let h = w / k; if (north) y0 = Math.max(0, y1 - h); else y1 = Math.min(1, y0 + h); h = y1 - y0;
      const fit = h * k; if (west) x0 = x1 - fit; else x1 = x0 + fit;
    }
    s.r = {x: x0, y: y0, w: x1 - x0, h: y1 - y0};
  }

  window.PlusEditor = {render, open, handle, back, attach, compose, TOOLS: TOOLS.map(t => t.key)};
})();
