/* Lunar Golf (Crater Games): one of the store's made-up apps (docs/plans/play-apps.md), a game. Its rules, physics,
   texts and its own art live here, shared by every version: a game draws itself on its canvas, as games did in every
   era, so only the version's wiring (the module, Back, the Menu key's New game) is per version.
   Nine holes on the Moon, seen from the side: drag back from the ball to aim (the farther, the harder, with the first
   stretch of the path shown), let go to hit. Gravity is the Moon's, so the ball flies far and lands softly; it bounces
   off the slopes, rolls, and drops into the cup when it comes in slowly enough. Off the course costs a stroke and the
   ball goes back to where it was hit from. Strokes per hole against its par; the best round is kept.
   Saved in data.storeApps.golf: {hole, strokes: [per hole], best}. */
(() => {
  'use strict';
  const T = {
    'Lunar Golf': {own: true, hu: 'Lunar Golf', de: 'Lunar Golf', fr: 'Lunar Golf', es: 'Lunar Golf'},
    'Hole %1$d of %2$d': {own: true, hu: '%1$d. lyuk / %2$d', de: 'Loch %1$d von %2$d', fr: 'Trou %1$d sur %2$d', es: 'Hoyo %1$d de %2$d'},
    'Par %d': {own: true, hu: 'Par %d', de: 'Par %d', fr: 'Par %d', es: 'Par %d'},
    'Strokes: %d': {own: true, hu: 'Ütések: %d', de: 'Schläge: %d', fr: 'Coups : %d', es: 'Golpes: %d'},
    'Drag back from the ball to aim, then let go.': {own: true, hu: 'Húzd hátra a labdától a célzáshoz, majd engedd el.', de: 'Vom Ball zurückziehen, um zu zielen, dann loslassen.', fr: 'Tirez depuis la balle pour viser, puis relâchez.', es: 'Arrastra hacia atrás desde la bola para apuntar y suelta.'},
    'Hole in one!': {own: true, hu: 'Hole in one!', de: 'Hole-in-One!', fr: 'Trou en un !', es: '¡Hoyo en uno!'},
    'Birdie!': {own: true, hu: 'Birdie!', de: 'Birdie!', fr: 'Birdie !', es: '¡Birdie!'},
    'Eagle!': {own: true, hu: 'Eagle!', de: 'Eagle!', fr: 'Eagle !', es: '¡Eagle!'},
    'Par': {own: true, hu: 'Par', de: 'Par', fr: 'Par', es: 'Par'},
    'Bogey': {own: true, hu: 'Bogey', de: 'Bogey', fr: 'Bogey', es: 'Bogey'},
    '%d over par': {own: true, hu: '%d ütéssel a par felett', de: '%d über Par', fr: '%d au-dessus du par', es: '%d sobre par'},
    'Tap for the next hole': {own: true, hu: 'Koppints a következő lyukhoz', de: 'Für das nächste Loch tippen', fr: 'Touchez pour le trou suivant', es: 'Toca para el siguiente hoyo'},
    'Round complete': {own: true, hu: 'A kör véget ért', de: 'Runde beendet', fr: 'Parcours terminé', es: 'Recorrido completado'},
    'Total: %1$d (par %2$d)': {own: true, hu: 'Összesen: %1$d (par %2$d)', de: 'Gesamt: %1$d (Par %2$d)', fr: 'Total : %1$d (par %2$d)', es: 'Total: %1$d (par %2$d)'},
    'Best round: %d': {own: true, hu: 'Legjobb kör: %d', de: 'Beste Runde: %d', fr: 'Meilleur parcours : %d', es: 'Mejor recorrido: %d'},
    'New best round!': {own: true, hu: 'Új legjobb kör!', de: 'Neue beste Runde!', fr: 'Nouveau record !', es: '¡Nuevo mejor recorrido!'},
    'Tap to play again': {own: true, hu: 'Koppints az újrakezdéshez', de: 'Zum erneuten Spielen tippen', fr: 'Touchez pour rejouer', es: 'Toca para jugar otra vez'},
    'Out of bounds: one stroke penalty': {own: true, hu: 'Pályán kívül: egy büntetőütés', de: 'Aus: ein Strafschlag', fr: 'Hors limites : un coup de pénalité', es: 'Fuera de límites: un golpe de penalización'},
    'New game': {own: true, hu: 'Új játék', de: 'Neues Spiel', fr: 'Nouvelle partie', es: 'Nueva partida'}
  };
  const text = AndroidStrings.table('store-lunar-golf', T);
  const t = (k, l) => text.t(k, l), fmt = (k, l, ...a) => text.fmt(k, l, ...a);

  // The course: the world is 600 wide and 900 tall (y down). Each hole is the ground's line from left to right, the
  // tee, the cup (centre x, width 26, depth 18) and its par.
  const W = 600, H = 900, CUP_W = 26, CUP_D = 18, BALL = 6;
  const HOLES = [
    {par: 2, tee: 70, cup: 500, ground: [[0, 700], [160, 700], [260, 660], [360, 690], [600, 690]]},
    {par: 3, tee: 60, cup: 520, ground: [[0, 720], [140, 720], [200, 640], [280, 620], [330, 700], [420, 700], [600, 650]]},
    {par: 3, tee: 80, cup: 470, ground: [[0, 650], [150, 650], [210, 720], [300, 740], [360, 600], [520, 600], [600, 560]]},
    {par: 3, tee: 60, cup: 540, ground: [[0, 760], [120, 760], [180, 700], [230, 520], [290, 520], [340, 720], [600, 720]]},
    {par: 4, tee: 70, cup: 300, ground: [[0, 600], [140, 600], [200, 700], [300, 760], [400, 700], [470, 560], [600, 520]]},
    {par: 3, tee: 520, cup: 90, ground: [[0, 680], [180, 680], [240, 620], [300, 640], [360, 600], [460, 720], [600, 720]]},
    {par: 4, tee: 60, cup: 545, ground: [[0, 780], [100, 780], [170, 600], [230, 600], [290, 760], [360, 760], [430, 560], [600, 560]]},
    {par: 3, tee: 80, cup: 420, ground: [[0, 640], [150, 640], [250, 760], [320, 780], [380, 740], [480, 740], [600, 660]]},
    {par: 4, tee: 60, cup: 530, ground: [[0, 700], [120, 700], [180, 520], [240, 520], [300, 700], [380, 740], [440, 600], [600, 600]]}
  ];
  const PAR = HOLES.reduce((a, h) => a + h.par, 0);
  // The ground's height at x (without the cup).
  function heightAt(pts, x) {
    for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0 || 1); }
    return pts.at(-1)[1];
  }
  // The hole's ground as one line with the cup cut into it.
  function course(n) {
    const h = HOLES[n], a = h.cup - CUP_W / 2, b = h.cup + CUP_W / 2, ya = heightAt(h.ground, a), yb = heightAt(h.ground, b);
    const line = [...h.ground.filter(p => p[0] < a), [a, ya], [a, ya + CUP_D], [b, yb + CUP_D], [b, yb], ...h.ground.filter(p => p[0] > b)];
    return {...h, line, rim: Math.min(ya, yb), floor: Math.max(ya, yb) + CUP_D};
  }

  function state(data) {
    const s = (data.storeApps ||= {}).golf ||= {hole: 0, strokes: [], best: 0};
    s.strokes ||= []; s.hole ||= 0; s.best ||= 0;
    return s;
  }
  // A fresh game state for the hole the save is on: the ball on the tee.
  function start(data) {
    const s = state(data), hole = Math.min(s.hole, HOLES.length - 1), c = course(hole);
    const x = c.tee, y = heightAt(c.ground, x) - BALL;
    return {hole, c, ball: {x, y, vx: 0, vy: 0}, from: {x, y}, moving: false, phase: s.hole >= HOLES.length ? 'done' : 'aim', message: '', aim: null, t: 0};
  }
  // Moon-like in the course's units: a full shot at 45° flies about 4 s, a straight-up one tops out inside the sky.
  const GRAVITY = 120, MAX_SPEED = 330, RESTITUTION = 0.42, FRICTION = 0.85, ROLL = 0.985;
  // The velocity a pull of (dx, dy) gives: the opposite way, up to MAX_SPEED.
  function launch(dx, dy) {
    const len = Math.hypot(dx, dy), power = Math.min(1, len / 160);
    return len < 6 ? null : {vx: -dx / len * MAX_SPEED * power, vy: -dy / len * MAX_SPEED * power};
  }
  // One physics step of dt seconds: gravity, the ground's segments, rolling and the cup.
  function step(g, dt) {
    const b = g.ball, line = g.c.line;
    b.vy += GRAVITY * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    let touched = false;
    for (let i = 1; i < line.length; i++) {
      const [x0, y0] = line[i - 1], [x1, y1] = line[i], ex = x1 - x0, ey = y1 - y0, len = Math.hypot(ex, ey);
      if (!len) continue;
      const u = Math.max(0, Math.min(1, ((b.x - x0) * ex + (b.y - y0) * ey) / (len * len)));
      const px = x0 + ex * u, py = y0 + ey * u, dx = b.x - px, dy = b.y - py, d = Math.hypot(dx, dy);
      // The ground's normal points up (the side the sky is on); a ball inside a segment is pushed back out.
      let nx = ey / len, ny = -ex / len;
      if (ny > 0) { nx = -nx; ny = -ny; }
      const side = dx * nx + dy * ny;
      if (d < BALL || side < 0 && u > 0 && u < 1 && -side < BALL * 3) {
        const push = side < 0 ? BALL - side : BALL - d;
        b.x += nx * push; b.y += ny * push;
        const vn = b.vx * nx + b.vy * ny;
        // A landing bounces (and loses some speed to the dust); resting contact only stops the ball sinking in.
        if (vn < -20) {
          b.vx -= (1 + RESTITUTION) * vn * nx; b.vy -= (1 + RESTITUTION) * vn * ny;
          b.vx *= FRICTION; b.vy *= FRICTION;
        } else if (vn < 0) { b.vx -= vn * nx; b.vy -= vn * ny; }
        touched = true;
      }
    }
    if (touched) { b.vx *= Math.pow(ROLL, dt * 60); }
    return touched;
  }
  const inCup = g => Math.abs(g.ball.x - g.c.cup) < CUP_W / 2 && g.ball.y > g.c.rim + 2;
  const outOfBounds = g => g.ball.x < -BALL || g.ball.x > W + BALL || g.ball.y > H + 40;
  // Runs the ball for dt; returns 'sunk', 'out', 'rest' or ''.
  function advance(g, dt) {
    let touched = false;
    for (let left = dt; left > 0; left -= 1 / 240) touched = step(g, Math.min(1 / 240, left)) || touched;
    const speed = Math.hypot(g.ball.vx, g.ball.vy);
    if (inCup(g) && speed < 90) return 'sunk';
    if (outOfBounds(g)) return 'out';
    if (touched && speed < 6) { g.ball.vx = 0; g.ball.vy = 0; return 'rest'; }
    return '';
  }
  // The first part of the shot's path, for the aim line.
  function preview(g, v) {
    const ghost = {c: g.c, ball: {...g.ball, vx: v.vx, vy: v.vy}}, out = [];
    for (let i = 0; i < 40; i++) { for (let k = 0; k < 4; k++) step(ghost, 1 / 240); out.push([ghost.ball.x, ghost.ball.y]); }
    return out;
  }
  const verdict = (strokes, par, l) => strokes === 1 ? t('Hole in one!', l) : strokes - par <= -2 ? t('Eagle!', l) : strokes - par === -1 ? t('Birdie!', l) : strokes === par ? t('Par', l) : strokes - par === 1 ? t('Bogey', l) : fmt('%d over par', l, strokes - par);

  // The game on a canvas: draws, takes the pointer and keeps running until the canvas leaves the page.
  function mount(canvas, ctx) {
    const data = ctx.data, s = state(data), keep = ctx.ui.golf ||= {};
    let g = keep.game && keep.game.hole === Math.min(s.hole, HOLES.length - 1) ? keep.game : (keep.game = start(data));
    const c2 = canvas.getContext('2d'), stars = Array.from({length: 90}, (_, i) => [(i * 137.5) % W, (i * 71.3) % 520, (i % 3) + 1]);
    let last = performance.now(), drag = null;
    const fit = () => { const r = canvas.getBoundingClientRect(), k = Math.min(3, window.devicePixelRatio || 1); canvas.width = Math.max(1, Math.round(r.width * k)); canvas.height = Math.max(1, Math.round(r.height * k)); };
    fit();
    // World to canvas: the course's width fills the canvas, its bottom at the canvas' bottom.
    const view = () => { const k = canvas.width / W; return {k, oy: canvas.height - H * k}; };
    const toWorld = ev => { const r = canvas.getBoundingClientRect(), {k, oy} = view(), px = (ev.clientX - r.left) * canvas.width / r.width, py = (ev.clientY - r.top) * canvas.height / r.height; return {x: px / k, y: (py - oy) / k}; };
    const strokes = () => s.strokes[g.hole] || 0;
    function hit(v) { s.strokes[g.hole] = strokes() + 1; g.from = {x: g.ball.x, y: g.ball.y}; g.ball.vx = v.vx; g.ball.vy = v.vy; g.phase = 'fly'; g.message = ''; ctx.save(); }
    function nextHole() {
      if (s.hole < HOLES.length - 1) { s.hole++; ctx.save(); g = keep.game = start(data); return; }
      const total = s.strokes.reduce((a, b) => a + (b || 0), 0), newBest = !s.best || total < s.best;
      if (newBest) s.best = total;
      s.hole = HOLES.length; g.phase = 'done'; g.total = total; g.newBest = newBest; ctx.save();
    }
    function restart() { s.hole = 0; s.strokes = []; ctx.save(); g = keep.game = start(data); }
    keep.restart = restart;
    canvas.addEventListener('pointerdown', ev => {
      if (g.phase === 'holed') { nextHole(); return; }
      if (g.phase === 'done') { restart(); return; }
      if (g.phase !== 'aim') return;
      const p = toWorld(ev);
      if (Math.hypot(p.x - g.ball.x, p.y - g.ball.y) > 70) return;
      drag = p; canvas.setPointerCapture?.(ev.pointerId); g.aim = null;
    });
    canvas.addEventListener('pointermove', ev => { if (!drag || g.phase !== 'aim') return; const p = toWorld(ev); g.aim = launch(p.x - g.ball.x, p.y - g.ball.y); });
    const release = ev => { if (!drag) return; const p = toWorld(ev), v = launch(p.x - g.ball.x, p.y - g.ball.y); drag = null; g.aim = null; if (v && g.phase === 'aim') hit(v); };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', () => { drag = null; g.aim = null; });

    function draw() {
      // Text is in the screen's dp (the canvas' CSS pixels), not the course's units.
      const {k, oy} = view(), w = canvas.width, h = canvas.height, l = ctx.lang, dp = canvas.width / (canvas.getBoundingClientRect().width || canvas.width);
      const X = x => x * k, Y = y => oy + y * k;
      c2.fillStyle = '#05070f'; c2.fillRect(0, 0, w, h);
      for (const [x, y, r] of stars) { c2.fillStyle = r === 3 ? '#ffffffcc' : '#ffffff66'; c2.fillRect(X(x), Y(y), r * k * .6, r * k * .6); }
      // The Earth over the horizon.
      const ex = X(470), ey = Y(170), er = 46 * k, eg = c2.createRadialGradient(ex - er * .4, ey - er * .4, er * .2, ex, ey, er);
      eg.addColorStop(0, '#7fc4ff'); eg.addColorStop(1, '#1d4f9c'); c2.fillStyle = eg; c2.beginPath(); c2.arc(ex, ey, er, 0, Math.PI * 2); c2.fill();
      c2.fillStyle = '#ffffffaa'; c2.beginPath(); c2.ellipse(ex - er * .2, ey - er * .1, er * .5, er * .16, -.4, 0, Math.PI * 2); c2.fill();
      // The ground and its craters.
      const gr = c2.createLinearGradient(0, Y(500), 0, h); gr.addColorStop(0, '#b9bfd0'); gr.addColorStop(1, '#5d6273');
      c2.fillStyle = gr; c2.beginPath(); c2.moveTo(X(0), h); for (const [x, y] of g.c.line) c2.lineTo(X(x), Y(y)); c2.lineTo(X(W), h); c2.closePath(); c2.fill();
      c2.strokeStyle = '#e3e6ee'; c2.lineWidth = 2 * k; c2.beginPath(); g.c.line.forEach(([x, y], i) => i ? c2.lineTo(X(x), Y(y)) : c2.moveTo(X(x), Y(y))); c2.stroke();
      for (let i = 0; i < 7; i++) { const x = 40 + i * 83, y = heightAt(g.c.ground, x) + 40 + (i % 3) * 30; c2.fillStyle = '#4c5161aa'; c2.beginPath(); c2.ellipse(X(x), Y(y), 18 * k, 6 * k, 0, 0, Math.PI * 2); c2.fill(); }
      // The cup's flag.
      const fx = X(g.c.cup), fy = Y(g.c.rim);
      c2.strokeStyle = '#dddddd'; c2.lineWidth = 2 * k; c2.beginPath(); c2.moveTo(fx, fy); c2.lineTo(fx, fy - 56 * k); c2.stroke();
      c2.fillStyle = '#e04848'; c2.beginPath(); c2.moveTo(fx, fy - 56 * k); c2.lineTo(fx + 26 * k, fy - 48 * k); c2.lineTo(fx, fy - 40 * k); c2.fill();
      // The aim: the first stretch of the path.
      if (g.aim && g.phase === 'aim') { c2.fillStyle = '#ffffffb0'; preview(g, g.aim).forEach(([x, y], i) => { if (i % 2) return; c2.beginPath(); c2.arc(X(x), Y(y), 2.2 * k, 0, Math.PI * 2); c2.fill(); }); }
      // The ball.
      if (g.phase !== 'holed' && g.phase !== 'done') { c2.fillStyle = '#ffffff'; c2.beginPath(); c2.arc(X(g.ball.x), Y(g.ball.y), BALL * k, 0, Math.PI * 2); c2.fill(); }
      // The score line and the messages.
      const pad = 12 * dp; c2.fillStyle = '#ffffff'; c2.textBaseline = 'top'; c2.font = `500 ${15 * dp}px Roboto, sans-serif`;
      if (g.phase !== 'done') {
        c2.fillText(`${fmt('Hole %1$d of %2$d', l, g.hole + 1, HOLES.length)} · ${fmt('Par %d', l, HOLES[g.hole].par)}`, pad, pad);
        c2.fillText(fmt('Strokes: %d', l, strokes()), pad, pad + 21 * dp);
      }
      const center = (lines, y) => { c2.textAlign = 'center'; lines.forEach(([txt, size, color], i) => { c2.font = `${size * dp}px Roboto, sans-serif`; c2.fillStyle = color; c2.fillText(txt, w / 2, y + i * 34 * dp, w - 24 * dp); }); c2.textAlign = 'left'; };
      if (g.phase === 'aim' && strokes() === 0 && g.hole === 0) center([[t('Drag back from the ball to aim, then let go.', l), 15, '#ffffffcc']], Y(300));
      if (g.message) center([[g.message, 16, '#ffcc66']], Y(340));
      if (g.phase === 'holed') center([[verdict(strokes(), HOLES[g.hole].par, l), 30, '#ffffff'], [t('Tap for the next hole', l), 16, '#ffffffcc']], Y(260));
      if (g.phase === 'done') center([[t('Round complete', l), 30, '#ffffff'], [fmt('Total: %1$d (par %2$d)', l, g.total ?? s.strokes.reduce((a, b) => a + (b || 0), 0), PAR), 18, '#ffffff'], [g.newBest ? t('New best round!', l) : fmt('Best round: %d', l, s.best), 16, '#ffcc66'], [t('Tap to play again', l), 16, '#ffffffcc']], Y(240));
    }
    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (canvas.width !== Math.round(canvas.getBoundingClientRect().width * Math.min(3, window.devicePixelRatio || 1))) fit();
      if (g.phase === 'fly') {
        const r = advance(g, dt);
        if (r === 'sunk') { g.phase = 'holed'; ctx.save(); }
        else if (r === 'out') { s.strokes[g.hole] = strokes() + 1; g.ball = {x: g.from.x, y: g.from.y, vx: 0, vy: 0}; g.phase = 'aim'; g.message = t('Out of bounds: one stroke penalty', ctx.lang); ctx.save(); }
        else if (r === 'rest') g.phase = 'aim';
      }
      draw();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {restart};
  }
  const STORE = {id: 'lunar-golf', name: 'Lunar Golf', developer: 'Crater Games', category: 'Arcade & Action', color: '#0c1022', dark: '#05070f',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>'};
  // The game's own restart (a version's Menu key or overflow offers New game).
  const restart = ui => ui.golf?.restart?.();
  (globalThis.StoreApps ||= {}).golf = {T: text, t, fmt, keys: Object.keys(T), HOLES, PAR, W, H, BALL, CUP_W, heightAt, course, state, start, launch, step, advance, preview, verdict, mount, restart, STORE};
})();
