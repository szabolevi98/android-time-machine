/* Android 7.1.2 framework LockPatternView (com.android.internal.widget in boot-framework.oat of N2G48C; the logic is
   6.0.1's, the sizes are the same in N2G48C's framework-res), shared by Settings' ChooseLockPattern /
   ConfirmLockPattern and the keyguard's pattern bouncer.
   - A square of 3 x 3 cells; each dot lock_pattern_dot_size 12 dp, growing to dot_size_activated 28 dp and back when the
     finger reaches it; the path lock_pattern_dot_line_width 3 dp with round joins and caps from centre to centre and on
     to the finger.
   - A cell is hit within mHitFactor 0.6 of its square; passing over the middle of two cells adds the one between
     (checkForNewHit's fill-in).
   - The colours come from the theme (regularColor, successColor, errorColor): drawing and the dots are the regular
     colour; DisplayMode.Correct shows the path in the success colour, Wrong in the error colour.
   Use: NG.pattern.markup(cls) for the view, NG.pattern.bind(el, {onStart, onCell, onDone(cells)}) to drive it, then
   NG.pattern.show(el, cells, 'correct' | 'wrong' | 'regular') and NG.pattern.clear(el). Cells are 0..8, row by row. */
(() => {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const dots = () => Array.from({length: 9}, (_, i) => `<circle class="ngpt-dot" data-i="${i}" cx="${(i % 3) * 100 + 50}" cy="${Math.floor(i / 3) * 100 + 50}" r="${12 / 2}"/>`).join('');
  const markup = (cls = '') => `<div class="ngpt ${cls}"><svg viewBox="0 0 300 300" aria-hidden="true"><path class="ngpt-path" d=""/>${dots()}</svg></div>`;
  const centre = i => [(i % 3) * 100 + 50, Math.floor(i / 3) * 100 + 50];

  // View units (the 300 wide viewBox) per dp, from the view's size on the screen.
  const unit = el => { const w = el.getBoundingClientRect().width, screen = document.querySelector('.screen'); return w && screen ? 300 / (w / (screen.clientWidth / 411.43)) : 1; };
  function draw(el, cells, tail, mode) {
    const svg = el.querySelector('svg'), path = svg.querySelector('.ngpt-path'), u = unit(el);
    path.setAttribute('stroke-width', (3 * u).toFixed(2));
    for (const d of svg.querySelectorAll('.ngpt-dot')) d.setAttribute('r', (6 * u).toFixed(2));
    const pts = cells.map(centre);
    if (tail) pts.push(tail);
    path.setAttribute('d', pts.length > 1 ? pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('') : '');
    el.dataset.mode = mode || 'regular';
    for (const d of svg.querySelectorAll('.ngpt-dot')) d.classList.toggle('on', cells.includes(+d.dataset.i));
  }
  // The dot grows to the activated size and settles back (LockPatternView.startCellActivatedAnimation).
  function pulse(el, i) {
    const d = el.querySelector(`.ngpt-dot[data-i="${i}"]`);
    if (!d?.animate) return;
    const u = unit(el);
    try { d.animate([{r: `${6 * u}px`}, {r: `${14 * u}px`, offset: .5}, {r: `${6 * u}px`}], {duration: 192, easing: 'cubic-bezier(.4,0,.2,1)'}); } catch {}
  }

  function bind(el, {onStart, onCell, onDone, enabled = () => true} = {}) {
    let cells = [], active = false;
    const at = e => { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * 300, (e.clientY - r.top) / r.height * 300]; };
    // A hit: within 0.6 of a cell's square around its centre.
    const hit = ([x, y]) => {
      const col = Math.floor(x / 100), row = Math.floor(y / 100);
      if (col < 0 || col > 2 || row < 0 || row > 2) return -1;
      const [cx, cy] = centre(row * 3 + col);
      return Math.abs(x - cx) <= 30 && Math.abs(y - cy) <= 30 ? row * 3 + col : -1;
    };
    const add = i => {
      if (i < 0 || cells.includes(i)) return;
      const last = cells.at(-1);
      if (last != null) {
        const mid = (last + i) / 2, lr = Math.floor(last / 3), ir = Math.floor(i / 3);
        if (Number.isInteger(mid) && (lr + ir) % 2 === 0 && (last % 3 + i % 3) % 2 === 0 && !cells.includes(mid)) { cells.push(mid); pulse(el, mid); onCell?.(mid); }
      }
      cells.push(i); pulse(el, i); onCell?.(i);
    };
    el.addEventListener('pointerdown', e => {
      if (!enabled()) return;
      e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch {}
      cells = []; active = true; onStart?.();
      const p = at(e); add(hit(p)); draw(el, cells, cells.length ? p : null);
    });
    el.addEventListener('pointermove', e => {
      if (!active) return;
      const p = at(e); add(hit(p)); draw(el, cells, cells.length ? p : null);
    });
    const end = () => { if (!active) return; active = false; draw(el, cells, null); if (cells.length) onDone?.(cells.slice()); };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
  }

  NG.pattern = {markup, bind, init: el => draw(el, [], null), show: (el, cells, mode) => draw(el, cells, null, mode), clear: el => draw(el, [], null)};
})();
