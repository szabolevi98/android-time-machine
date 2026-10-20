/* Android 7.1.2: the simulator's own pictures for Messenger's gallery, Camera and Photos — drawn scenes, never device
   captures (the logic is 6.0.1's media module). A photo is {id, seed, time, front, kind: 'photo' | 'video' | 'pano',
   album}; NG.media.svg(photo) draws it: a sky in the light of the hour it was taken, the sun or moon, hills, a lake and
   trees placed by its seed (the front camera draws a room). The used phone's four pictures (docs/demo-data.md: two days
   and nine days old, the last a panorama) are saved with the phone (NG.defaults.photos). */
(() => {
  'use strict';
  const D = 864e5;
  NG.defaults.photos = [
    {id: 1, seed: 7, time: Date.now() - 2 * D - 3 * 36e5, kind: 'photo', album: 'camera'},
    {id: 2, seed: 19, time: Date.now() - 2 * D - 2 * 36e5, kind: 'photo', album: 'camera'},
    {id: 3, seed: 33, time: Date.now() - 9 * D, kind: 'photo', album: 'camera'},
    {id: 4, seed: 48, time: Date.now() - 9 * D + 6e5, kind: 'pano', album: 'camera'}
  ];
  const rand = seed => { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
  const SKIES = [[0, ['#0b1a33', '#1d3557']], [6, ['#f4a261', '#ffd6a5']], [8, ['#8ecae6', '#d8f0fb']], [17, ['#7fb3d5', '#cfe8f3']], [19, ['#e76f51', '#f4a261']], [21, ['#14213d', '#2a3d66']]];
  function sky(hour) { let pick = SKIES[0][1]; for (const [h, c] of SKIES) if (hour >= h) pick = c; return pick; }
  function landscape(p, w, h, uid) {
    const r = rand(p.seed || 1), hour = new Date(p.time || Date.now()).getHours(), [top, low] = sky(hour), night = hour < 6 || hour >= 21;
    const hill = (y, amp, col) => { let d = `M0 ${h}L0 ${y}`; for (let x = 0; x <= w; x += w / 6) d += `Q${x + w / 12} ${y - amp * (0.5 + r())} ${x + w / 6} ${y + (r() - 0.5) * amp * .4}`; return `<path d="${d}L${w} ${h}Z" fill="${col}"/>`; };
    const sunX = w * (0.2 + r() * 0.6), sunY = h * (0.18 + r() * 0.15);
    const trees = Array.from({length: 4 + Math.floor(r() * 5)}, () => { const x = r() * w, s = 18 + r() * 26, y = h * 0.72 + r() * h * 0.08; return `<path d="M${x} ${y - s * 2}L${x - s * .6} ${y}L${x + s * .6} ${y}Z" fill="${night ? '#0f2a1d' : '#2d6a4f'}"/><rect x="${x - 2}" y="${y}" width="4" height="${s * .3}" fill="#5c4033"/>`; }).join('');
    return `<defs><linearGradient id="ngmd${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${low}"/></linearGradient></defs>
      <rect width="${w}" height="${h}" fill="url(#ngmd${uid})"/><circle cx="${sunX}" cy="${sunY}" r="${night ? 14 : 22}" fill="${night ? '#f1f3f5' : '#ffe8a3'}" opacity=".95"/>
      ${hill(h * 0.55, h * 0.18, night ? '#24344d' : '#7c9cb4')}${hill(h * 0.64, h * 0.12, night ? '#1b2a3a' : '#5a8f69')}
      <rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="${night ? '#182a40' : '#4f8fbf'}"/><rect y="${h * 0.78}" width="${w}" height="${h * 0.01}" fill="#ffffff" opacity=".35"/>${trees}`;
  }
  function room(p, w, h) {
    const r = rand(p.seed || 1);
    return `<rect width="${w}" height="${h}" fill="#d9cbb8"/><rect y="${h * 0.72}" width="${w}" height="${h * 0.28}" fill="#8d6e63"/>
      <rect x="${w * (0.1 + r() * 0.3)}" y="${h * 0.15}" width="${w * 0.3}" height="${h * 0.32}" fill="#bfe3f5" stroke="#fff" stroke-width="8"/>
      <circle cx="${w * 0.75}" cy="${h * 0.3}" r="${h * 0.06}" fill="#f6e7a1"/><rect x="${w * 0.6}" y="${h * 0.5}" width="${w * 0.3}" height="${h * 0.22}" fill="#5d4037"/>`;
  }
  // Width and height in the picture's own units; the caller scales the SVG with CSS. Each drawing gets its own gradient
  // id, so the same photo can be on the screen twice (a gallery cell and a message).
  let uid = 0;
  function svg(p, cls = '', ratio) {
    const w = 400 * (p.ratio || (p.kind === 'pano' ? 3 : 4 / 3)), h = 400, ed = p.edits || {};
    const turn = ((Math.round(+ed.turn || 0) % 4) + 4) % 4, rw = turn % 2 ? h : w, rh = turn % 2 ? w : h;
    const crop = ed.crop || [0, 0, 1, 1];
    let [x, y, cw, ch] = [crop[0] * rw, crop[1] * rh, crop[2] * rw, crop[3] * rh];
    if (ratio) { if (cw / ch > ratio) { x += (cw - ch * ratio) / 2; cw = ch * ratio; } else { y += (ch - cw / ratio) / 2; ch = cw / ratio; } }
    const transform = ['', `translate(${h} 0) rotate(90)`, `translate(${w} ${h}) rotate(180)`, `translate(0 ${w}) rotate(270)`][turn];
    const val = k => Math.max(-100, Math.min(100, +ed[k] || 0));
    const filter = `brightness(${1 + val('light') / 150}) contrast(${1 + val('pop') / 150}) saturate(${1 + val('color') / 100})`;
    let scene = p.front ? room(p, w, h) : landscape(p, w, h, ++uid);
    if (p.kind === 'collage' && p.frames?.length) {
      const frames = p.frames.slice(0, 9), cols = Math.ceil(Math.sqrt(frames.length)), rows = Math.ceil(frames.length / cols);
      scene = `<rect width="${w}" height="${h}" fill="#fff"/>` + frames.map((frame, i) => `<svg x="${i % cols * w / cols + 2}" y="${Math.floor(i / cols) * h / rows + 2}" width="${w / cols - 4}" height="${h / rows - 4}">${svg(frame)}</svg>`).join('');
    }
    return `<svg class="${cls}" viewBox="${x} ${y} ${cw} ${ch}" preserveAspectRatio="xMidYMid ${cls==='ngphotos-full'?'meet':'slice'}" aria-hidden="true"><g transform="${transform}" style="filter:${filter}">${scene}</g></svg>`;
  }
  const all = c => c.data.photos || (c.data.photos = JSON.parse(JSON.stringify(NG.defaults.photos)));
  NG.media = {svg, all, photos: c => all(c).filter(p => !p.trashedAt),
    add(c, item) { const list = all(c); const p = {id: Math.max(0, ...list.map(x => x.id)) + 1, album: 'camera', ...item}; list.push(p); c.save(); return p; }};
})();
