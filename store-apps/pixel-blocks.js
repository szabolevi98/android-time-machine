/* Pixel Blocks (Pocket Pixels): one of the store's made-up apps (docs/plans/play-apps.md), a game. Its rules, texts and
   its own art live here, shared by every version (a game draws itself on its canvas); only the wiring is per version.
   A board of coloured blocks: tap a group of two or more touching blocks of one colour to clear it. The bigger the
   group, the more it scores (n × (n − 1)); the blocks above fall, and an empty column closes up from the right. The
   game ends when no group is left; a cleared board scores a bonus. The best score is kept in data.storeApps.blocks. */
(() => {
  'use strict';
  const T = {
    'Pixel Blocks': {own: true, hu: 'Pixel Blocks', de: 'Pixel Blocks', fr: 'Pixel Blocks', es: 'Pixel Blocks'},
    'Tap a group of two or more blocks of one colour.': {own: true, hu: 'Koppints legalább két egyforma színű, összeérő blokkra.', de: 'Tippe auf eine Gruppe aus zwei oder mehr gleichfarbigen Blöcken.', fr: 'Touchez un groupe d’au moins deux blocs de même couleur.', es: 'Toca un grupo de dos o más bloques del mismo color.'},
    'Score: %d': {own: true, hu: 'Pontszám: %d', de: 'Punkte: %d', fr: 'Score : %d', es: 'Puntos: %d'},
    'Best: %d': {own: true, hu: 'Legjobb: %d', de: 'Rekord: %d', fr: 'Record : %d', es: 'Récord: %d'},
    'No moves left': {own: true, hu: 'Nincs több lépés', de: 'Keine Züge mehr', fr: 'Plus aucun coup', es: 'No quedan movimientos'},
    'Board cleared! +%d': {own: true, hu: 'Üres tábla! +%d', de: 'Brett geleert! +%d', fr: 'Plateau vidé ! +%d', es: '¡Tablero vacío! +%d'},
    'New best!': {own: true, hu: 'Új rekord!', de: 'Neuer Rekord!', fr: 'Nouveau record !', es: '¡Nuevo récord!'},
    'Tap to play again': {own: true, hu: 'Koppints az újrakezdéshez', de: 'Zum erneuten Spielen tippen', fr: 'Touchez pour rejouer', es: 'Toca para jugar otra vez'},
    'New game': {own: true, hu: 'Új játék', de: 'Neues Spiel', fr: 'Nouvelle partie', es: 'Nueva partida'}
  };
  const text = AndroidStrings.table('store-pixel-blocks', T);
  const t = (k, l) => text.t(k, l), fmt = (k, l, ...a) => text.fmt(k, l, ...a);
  const COLS = 8, ROWS = 10, KINDS = 4, BONUS = 500;
  const COLORS = [['#ff5a4e', '#c0392b'], ['#ffc533', '#c99400'], ['#4ec2ff', '#1f86c2'], ['#6ddc5a', '#3a9e2c']];
  const rng = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  function state(data) { const s = (data.storeApps ||= {}).blocks ||= {best: 0}; s.best ||= 0; return s; }
  // The board is columns of cells from the bottom up: board[x][y], null when empty.
  function start(seed = Date.now()) {
    const r = rng(seed);
    return {board: Array.from({length: COLS}, () => Array.from({length: ROWS}, () => Math.floor(r() * KINDS))), score: 0, phase: 'play', last: 0};
  }
  // The group the cell belongs to: the touching cells of its colour.
  function group(g, x, y) {
    const k = g.board[x]?.[y]; if (k == null) return [];
    const seen = new Set([`${x},${y}`]), out = [[x, y]];
    for (let i = 0; i < out.length; i++) {
      const [cx, cy] = out[i];
      for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) {
        const key = `${nx},${ny}`;
        if (!seen.has(key) && g.board[nx]?.[ny] === k) { seen.add(key); out.push([nx, ny]); }
      }
    }
    return out;
  }
  const hasMoves = g => g.board.some((col, x) => col.some((k, y) => k != null && (g.board[x][y + 1] === k || g.board[x + 1]?.[y] === k)));
  // A tap: clears the group (two or more), lets the blocks fall and the columns close up; returns the points.
  function tap(g, x, y) {
    if (g.phase !== 'play') return 0;
    const cells = group(g, x, y); if (cells.length < 2) return 0;
    for (const [cx, cy] of cells) g.board[cx][cy] = null;
    g.board = g.board.map(col => { const kept = col.filter(k => k != null); return [...kept, ...Array(ROWS - kept.length).fill(null)]; });
    const full = g.board.filter(col => col[0] != null);
    g.board = [...full, ...Array.from({length: COLS - full.length}, () => Array(ROWS).fill(null))];
    const points = cells.length * (cells.length - 1);
    g.score += points; g.last = points;
    if (!hasMoves(g)) { if (g.board.every(col => col[0] == null)) { g.score += BONUS; g.cleared = true; } g.phase = 'over'; }
    return points;
  }

  function mount(canvas, ctx) {
    const data = ctx.data, s = state(data), keep = ctx.ui.blocks ||= {};
    let g = keep.game ||= start();
    const c2 = canvas.getContext('2d');
    const fit = () => { const r = canvas.getBoundingClientRect(), k = Math.min(3, window.devicePixelRatio || 1); canvas.width = Math.max(1, Math.round(r.width * k)); canvas.height = Math.max(1, Math.round(r.height * k)); };
    fit();
    // The board's cell size and place: as large as fits under the score line, in the middle of the space left.
    const layout = () => { const dp = canvas.width / (canvas.getBoundingClientRect().width || canvas.width), top = 70 * dp, cell = Math.floor(Math.min((canvas.width - 16 * dp) / COLS, (canvas.height - top - 16 * dp) / ROWS)); return {dp, cell, x0: Math.round((canvas.width - cell * COLS) / 2), y0: Math.round(top + (canvas.height - top - cell * ROWS) / 2)}; };
    function restart() { g = keep.game = start(); }
    keep.restart = restart;
    function over() { g.newBest = g.score > s.best; if (g.newBest) { s.best = g.score; ctx.save(); } }
    canvas.addEventListener('pointerdown', ev => {
      if (g.phase === 'over') { restart(); return; }
      const r = canvas.getBoundingClientRect(), {cell, x0, y0} = layout(), px = (ev.clientX - r.left) * canvas.width / r.width, py = (ev.clientY - r.top) * canvas.height / r.height;
      const x = Math.floor((px - x0) / cell), y = ROWS - 1 - Math.floor((py - y0) / cell);
      if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return;
      if (tap(g, x, y) && g.phase === 'over') over();
    });
    function draw() {
      const {dp, cell, x0, y0} = layout(), w = canvas.width, h = canvas.height, l = ctx.lang;
      c2.fillStyle = '#1c1c24'; c2.fillRect(0, 0, w, h);
      c2.fillStyle = '#14141a'; c2.fillRect(x0 - 4 * dp, y0 - 4 * dp, cell * COLS + 8 * dp, cell * ROWS + 8 * dp);
      g.board.forEach((col, x) => col.forEach((k, y) => {
        if (k == null) return;
        const px = x0 + x * cell, py = y0 + (ROWS - 1 - y) * cell, pad = Math.max(1, cell * .06);
        c2.fillStyle = COLORS[k][1]; c2.fillRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2);
        c2.fillStyle = COLORS[k][0]; c2.fillRect(px + pad, py + pad, cell - pad * 2, cell - pad * 2 - cell * .14);
        c2.fillStyle = '#ffffff55'; c2.fillRect(px + pad * 2, py + pad * 2, cell * .28, cell * .14);
      }));
      c2.fillStyle = '#fff'; c2.textBaseline = 'top'; c2.font = `500 ${15 * dp}px Roboto, sans-serif`;
      c2.fillText(fmt('Score: %d', l, g.score), 12 * dp, 12 * dp); c2.fillText(fmt('Best: %d', l, s.best), 12 * dp, 33 * dp);
      const center = (lines, y) => { c2.textAlign = 'center'; lines.forEach(([txt, size, color], i) => { c2.font = `${size * dp}px Roboto, sans-serif`; c2.fillStyle = color; c2.fillText(txt, w / 2, y + i * 34 * dp, w - 24 * dp); }); c2.textAlign = 'left'; };
      if (g.phase === 'play' && g.score === 0) { c2.fillStyle = '#ffffffcc'; c2.font = `${13 * dp}px Roboto, sans-serif`; c2.textAlign = 'center'; c2.fillText(t('Tap a group of two or more blocks of one colour.', l), w / 2, 54 * dp, w - 24 * dp); c2.textAlign = 'left'; }
      if (g.phase === 'over') {
        c2.fillStyle = '#000000aa'; c2.fillRect(0, h * .28, w, 170 * dp);
        center([[g.cleared ? fmt('Board cleared! +%d', l, BONUS) : t('No moves left', l), 26, '#ffffff'], [fmt('Score: %d', l, g.score), 18, '#ffffff'], [g.newBest ? t('New best!', l) : fmt('Best: %d', l, s.best), 16, '#ffd34d'], [t('Tap to play again', l), 16, '#ffffffcc']], h * .28 + 16 * dp);
      }
    }
    function frame() {
      if (!canvas.isConnected) return;
      if (canvas.width !== Math.round(canvas.getBoundingClientRect().width * Math.min(3, window.devicePixelRatio || 1))) fit();
      draw(); requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    return {restart};
  }
  const STORE = {id: 'blocks', name: 'Pixel Blocks', developer: 'Pocket Pixels', category: 'Brain & Puzzle', color: '#2b2b2b', dark: '#14141a',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#4ec2ff"/><rect x="18" y="16" width="10" height="10" fill="#6ddc5a"/></g></svg>'};
  const restart = ui => ui.blocks?.restart?.();
  (globalThis.StoreApps ||= {}).blocks = {T: text, t, fmt, keys: Object.keys(T), COLS, ROWS, BONUS, start, group, tap, hasMoves, state, mount, restart, STORE};
})();
