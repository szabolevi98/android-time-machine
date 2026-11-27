/* Orbit Hopper (Moonlight Studio): one of the store's made-up apps (docs/plans/play-apps.md), a game. Its rules, texts and
   its own art live here, shared by every version (a game draws itself on its canvas); only the wiring is per version.
   You stand on a spinning planet; a tap sends you straight out from it, the way you face. Land on the next planet up to
   go on, collect the stars between them, and do not drift off into space. Planets further up spin faster. The best
   score is kept in data.storeApps.orbit: {best}. */
(() => {
  'use strict';
  const T = {
    'Orbit Hopper': {own: true, hu: 'Orbit Hopper', de: 'Orbit Hopper', fr: 'Orbit Hopper', es: 'Orbit Hopper'},
    'Tap to jump to the next planet': {own: true, hu: 'Koppints, hogy a következő bolygóra ugorj', de: 'Tippen, um zum nächsten Planeten zu springen', fr: 'Touchez pour sauter vers la planète suivante', es: 'Toca para saltar al siguiente planeta'},
    'Score: %d': {own: true, hu: 'Pontszám: %d', de: 'Punkte: %d', fr: 'Score : %d', es: 'Puntos: %d'},
    'Best: %d': {own: true, hu: 'Legjobb: %d', de: 'Rekord: %d', fr: 'Record : %d', es: 'Récord: %d'},
    'Lost in space!': {own: true, hu: 'Elveszett az űrben!', de: 'Im All verloren!', fr: 'Perdu dans l’espace !', es: '¡Perdido en el espacio!'},
    'New best!': {own: true, hu: 'Új rekord!', de: 'Neuer Rekord!', fr: 'Nouveau record !', es: '¡Nuevo récord!'},
    'Tap to play again': {own: true, hu: 'Koppints az újrakezdéshez', de: 'Zum erneuten Spielen tippen', fr: 'Touchez pour rejouer', es: 'Toca para jugar otra vez'},
    'New game': {own: true, hu: 'Új játék', de: 'Neues Spiel', fr: 'Nouvelle partie', es: 'Nueva partida'}
  };
  const text = AndroidStrings.table('store-orbit-hopper', T);
  const t = (k, l) => text.t(k, l), fmt = (k, l, ...a) => text.fmt(k, l, ...a);
  const W = 360, PLAYER = 6, SPEED = 250, STAR = 14;
  const COLORS = [['#ff9a3c', '#c2410c'], ['#4fd1c5', '#0f766e'], ['#f472b6', '#9d174d'], ['#a78bfa', '#5b21b6'], ['#facc15', '#a16207'], ['#60a5fa', '#1e40af']];
  // A small seeded random source, so a game can be replayed in tests.
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  function state(data) { const s = (data.storeApps ||= {}).orbit ||= {best: 0}; s.best ||= 0; return s; }
  // The next planet above the last one: higher, somewhere across, spinning one way or the other, faster further up.
  function addPlanet(g) {
    const r = g.rand, prev = g.planets.at(-1), i = g.planets.length;
    const radius = 22 + Math.round(r() * 16), x = 50 + r() * (W - 100), y = prev.y - (150 + r() * 70);
    const spin = (1.1 + Math.min(2.2, i * 0.08) + r() * 0.6) * (r() < .5 ? -1 : 1);
    g.planets.push({x, y, r: radius, spin, color: COLORS[i % COLORS.length], ring: r() < .3});
    // A star halfway, a little off the straight line.
    g.stars.push({x: (prev.x + x) / 2 + (r() - .5) * 40, y: (prev.y + y) / 2, taken: false});
  }
  function start(seed = Date.now()) {
    const g = {rand: rng(seed), planets: [{x: W / 2, y: 600, r: 34, spin: 1.2, color: COLORS[0], ring: false}], stars: [], score: 0, reached: 0, phase: 'ready', camY: 0, t: 0, trail: []};
    for (let i = 0; i < 6; i++) addPlanet(g);
    g.player = {on: 0, angle: -Math.PI / 2, x: 0, y: 0, vx: 0, vy: 0, from: 0};
    place(g);
    return g;
  }
  // The player standing on a planet: on its surface at the angle it has turned to.
  function place(g) { const p = g.player, pl = g.planets[p.on]; p.x = pl.x + Math.cos(p.angle) * (pl.r + PLAYER); p.y = pl.y + Math.sin(p.angle) * (pl.r + PLAYER); }
  // A tap: straight out from the planet, the way the player faces.
  function jump(g) {
    const p = g.player; if (p.on == null || g.phase === 'over') return false;
    p.vx = Math.cos(p.angle) * SPEED; p.vy = Math.sin(p.angle) * SPEED; p.from = p.on; p.on = null; g.phase = 'play'; g.trail = [];
    return true;
  }
  // One step of dt seconds; returns 'land', 'lost' or ''.
  function step(g, dt, viewH = 640) {
    const p = g.player;
    for (const pl of g.planets) pl.rot = (pl.rot || 0) + pl.spin * dt;
    if (p.on != null) { const pl = g.planets[p.on]; p.angle += pl.spin * dt; place(g); return ''; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    g.trail.push([p.x, p.y]); if (g.trail.length > 24) g.trail.shift();
    for (const s of g.stars) if (!s.taken && Math.hypot(s.x - p.x, s.y - p.y) < STAR) { s.taken = true; g.score++; }
    for (let i = 0; i < g.planets.length; i++) {
      if (i === p.from) continue;
      const pl = g.planets[i];
      if (Math.hypot(p.x - pl.x, p.y - pl.y) <= pl.r + PLAYER) {
        p.on = i; p.angle = Math.atan2(p.y - pl.y, p.x - pl.x); place(g);
        if (i > g.reached) { g.score += i - g.reached; g.reached = i; }
        while (g.planets.length < g.reached + 7) addPlanet(g);
        return 'land';
      }
    }
    // Off either side, or too far from the planet it left (past the next ones, or down out of the picture).
    const from = g.planets[p.from];
    if (p.x < -20 || p.x > W + 20 || p.y > from.y + Math.min(400, viewH * 0.4) || Math.hypot(p.x - from.x, p.y - from.y) > 640) return 'lost';
    return '';
  }

  function mount(canvas, ctx) {
    const data = ctx.data, s = state(data), keep = ctx.ui.orbit ||= {};
    let g = keep.game ||= start(), last = performance.now();
    const c2 = canvas.getContext('2d'), far = Array.from({length: 70}, (_, i) => [(i * 97.3) % W, (i * 53.7) % 900, (i % 3) + 1]);
    const fit = () => { const r = canvas.getBoundingClientRect(), k = Math.min(3, window.devicePixelRatio || 1); canvas.width = Math.max(1, Math.round(r.width * k)); canvas.height = Math.max(1, Math.round(r.height * k)); };
    fit();
    const viewH = () => canvas.height / (canvas.width / W);
    function restart() { g = keep.game = start(); }
    keep.restart = restart;
    canvas.addEventListener('pointerdown', () => {
      if (g.phase === 'over') { restart(); return; }
      jump(g);
    });
    function over() {
      g.phase = 'over'; g.newBest = g.score > s.best;
      if (g.newBest) { s.best = g.score; ctx.save(); }
    }
    function draw() {
      const k = canvas.width / W, w = canvas.width, h = canvas.height, l = ctx.lang, dp = canvas.width / (canvas.getBoundingClientRect().width || canvas.width);
      const X = x => x * k, Y = y => (y - g.camY) * k;
      const bg = c2.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#070b1e'); bg.addColorStop(1, '#152049');
      c2.fillStyle = bg; c2.fillRect(0, 0, w, h);
      // Far stars drift slower than the planets.
      for (const [x, y, r] of far) { const yy = ((y - g.camY * 0.3) % 900 + 900) % 900; c2.fillStyle = r === 3 ? '#ffffffbb' : '#ffffff55'; c2.fillRect(X(x), yy * k * (h / (900 * k)), r * k * .6, r * k * .6); }
      for (const st of g.stars) if (!st.taken) {
        const cx = X(st.x), cy = Y(st.y), R = 9 * k;
        c2.fillStyle = '#ffd34d'; c2.beginPath();
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? R * .45 : R; c2.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
        c2.fill();
      }
      for (const pl of g.planets) {
        const cx = X(pl.x), cy = Y(pl.y), R = pl.r * k;
        if (cy < -R * 3 || cy > h + R * 3) continue;
        const grad = c2.createRadialGradient(cx - R * .4, cy - R * .4, R * .2, cx, cy, R);
        grad.addColorStop(0, pl.color[0]); grad.addColorStop(1, pl.color[1]);
        c2.fillStyle = grad; c2.beginPath(); c2.arc(cx, cy, R, 0, Math.PI * 2); c2.fill();
        // A crater turning with the planet shows its spin.
        c2.fillStyle = '#00000033'; c2.beginPath(); c2.arc(cx + Math.cos(pl.rot || 0) * R * .55, cy + Math.sin(pl.rot || 0) * R * .55, R * .22, 0, Math.PI * 2); c2.fill();
        if (pl.ring) { c2.strokeStyle = '#ffffff88'; c2.lineWidth = 2 * k; c2.beginPath(); c2.ellipse(cx, cy, R * 1.6, R * .45, -.3, 0, Math.PI * 2); c2.stroke(); }
      }
      // The trail and the player (a little astronaut: helmet and visor, turned the way it faces).
      c2.strokeStyle = '#ffffff55'; c2.lineWidth = 2 * k; c2.beginPath(); g.trail.forEach(([x, y], i) => i ? c2.lineTo(X(x), Y(y)) : c2.moveTo(X(x), Y(y))); c2.stroke();
      if (g.phase !== 'over') {
        const p = g.player, cx = X(p.x), cy = Y(p.y), face = p.on != null ? p.angle : Math.atan2(p.vy, p.vx);
        c2.fillStyle = '#ffffff'; c2.beginPath(); c2.arc(cx, cy, PLAYER * k, 0, Math.PI * 2); c2.fill();
        c2.fillStyle = '#2b6cb0'; c2.beginPath(); c2.arc(cx + Math.cos(face) * 2.2 * k, cy + Math.sin(face) * 2.2 * k, 3.2 * k, 0, Math.PI * 2); c2.fill();
      }
      const pad = 12 * dp; c2.fillStyle = '#ffffff'; c2.textBaseline = 'top'; c2.font = `500 ${15 * dp}px Roboto, sans-serif`;
      c2.fillText(fmt('Score: %d', l, g.score), pad, pad); c2.fillText(fmt('Best: %d', l, s.best), pad, pad + 21 * dp);
      const center = (lines, y) => { c2.textAlign = 'center'; lines.forEach(([txt, size, color], i) => { c2.font = `${size * dp}px Roboto, sans-serif`; c2.fillStyle = color; c2.fillText(txt, w / 2, y + i * 34 * dp, w - 24 * dp); }); c2.textAlign = 'left'; };
      if (g.phase === 'ready') center([[t('Tap to jump to the next planet', l), 16, '#ffffffcc']], h * .2);
      if (g.phase === 'over') center([[t('Lost in space!', l), 30, '#ffffff'], [fmt('Score: %d', l, g.score), 18, '#ffffff'], [g.newBest ? t('New best!', l) : fmt('Best: %d', l, s.best), 16, '#ffd34d'], [t('Tap to play again', l), 16, '#ffffffcc']], h * .3);
    }
    function frame(now) {
      if (!canvas.isConnected) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (canvas.width !== Math.round(canvas.getBoundingClientRect().width * Math.min(3, window.devicePixelRatio || 1))) fit();
      if (g.phase !== 'over') {
        let res = '';
        for (let left = dt; left > 0 && !res; left -= 1 / 120) res = step(g, Math.min(1 / 120, left), viewH());
        if (res === 'lost') over();
        // The camera keeps the planet the player stands on in the lower part of the screen.
        const target = g.planets[g.player.on ?? g.player.from].y - viewH() * 0.68;
        g.camY += (target - g.camY) * Math.min(1, dt * 3);
      }
      draw();
      requestAnimationFrame(frame);
    }
    g.camY = g.planets[g.player.on ?? 0].y - viewH() * 0.68;
    requestAnimationFrame(frame);
    return {restart};
  }
  const STORE = {id: 'orbit', name: 'Orbit Hopper', developer: 'Moonlight Studio', category: 'Arcade & Action', color: '#152049', dark: '#070b1e',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><defs><radialGradient id="mko" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="24" cy="24" r="9" fill="url(#mko)"/><ellipse cx="24" cy="24" rx="17" ry="6" fill="none" stroke="#9fb4ff" stroke-width="2" transform="rotate(-20 24 24)"/></svg>'};
  const restart = ui => ui.orbit?.restart?.();
  (globalThis.StoreApps ||= {}).orbit = {T: text, t, fmt, keys: Object.keys(T), W, PLAYER, start, jump, step, place, addPlanet, state, mount, restart, STORE};
})();
