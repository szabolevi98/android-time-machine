/* Android 6.0.1: dragging a list with the mouse as a finger scrolls it, as on the other versions (the logic is the
   simulator's own from the 5.1.1 page's drag scrolling; the framework classes behave the same on 6.0): ScrollView / AbsListView follow the pointer past
   the 8 dp touch slop, a release faster than 50 dp/s flings with OverScroller's spline (SplineOverScroller: friction
   0.015, DECELERATION_RATE ln 0.78 / ln 0.9, INFLEXION 0.35, physical coefficient g x 39.37 x 424 ppi x 0.84), a touch
   stops a running fling, and the edges glow with EdgeEffect: a 30 degree cap of a circle 1.5 x the list width in the
   theme's colorEdgeEffect (colorPrimary) at up to 50 % alpha. Pulling past an edge grows it (onPull, 167 ms steps,
   then a 2 s decay), releasing recedes it in 600 ms, and a fling that hits an edge is absorbed into it (onAbsorb).
   Velocities are in device pixels like the framework's: CSS px x 2.625 / (1 dp in CSS px) on the Nexus 5X (424 ppi). */
(() => {
  'use strict';
  // DP(): 1 dp in CSS px now (the 5X display is 411.43 dp across: 0.833 px in the desktop frame, more on a phone).
  const DP = () => { const s = globalThis.document?.querySelector?.('#screen'); return s?.clientWidth ? s.clientWidth / 411.43 : .833; };
  const DEVICE = () => 2.625 / DP(), SLOP = () => 8 * DP();
  const MIN_FLING = 50 * 2.625, MAX_FLING = 8000 * 2.625;
  const FRICTION = 0.015, DECELERATION_RATE = Math.log(0.78) / Math.log(0.9), INFLEXION = 0.35;
  const PHYSICAL = 9.80665 * 39.37 * 424 * 0.84;
  // SplineOverScroller's static table: position along the spline for 100 time samples.
  const SAMPLES = 100, SPLINE = new Float64Array(SAMPLES + 1);
  (() => {
    const P1 = 0.5 * INFLEXION, P2 = 1 - 1 * (1 - INFLEXION);
    let xMin = 0;
    for (let i = 0; i < SAMPLES; i++) {
      const alpha = i / SAMPLES; let xMax = 1, x, coef, tx;
      for (;;) { x = xMin + (xMax - xMin) / 2; coef = 3 * x * (1 - x); tx = coef * ((1 - x) * P1 + x * P2) + x * x * x; if (Math.abs(tx - alpha) < 1e-5) break; if (tx > alpha) xMax = x; else xMin = x; }
      SPLINE[i] = coef * ((1 - x) * 0.5 + x) + x * x * x;
    }
    SPLINE[SAMPLES] = 1;
  })();
  const splineAt = t => { const index = Math.min(SAMPLES - 1, Math.floor(SAMPLES * t)), t0 = index / SAMPLES, d = SPLINE[index + 1] - SPLINE[index]; return { distance: SPLINE[index] + (t - t0) * SAMPLES * d, velocity: d * SAMPLES }; };
  const deceleration = v => Math.log(INFLEXION * Math.abs(v) / (FRICTION * PHYSICAL));
  const flingDuration = v => 1000 * Math.exp(deceleration(v) / (DECELERATION_RATE - 1));
  const flingDistance = v => FRICTION * PHYSICAL * Math.exp(DECELERATION_RATE / (DECELERATION_RATE - 1) * deceleration(v));

  // EdgeEffect, one per edge of the list being dragged.
  const SIN = Math.sin(Math.PI / 6), COS = Math.cos(Math.PI / 6);
  class Edge {
    constructor(layer, bottom) { this.node = document.createElement('div'); this.node.className = `mmscr-edge${bottom ? ' bottom' : ''}`; this.cap = document.createElement('i'); this.node.append(this.cap); layer.append(this.node); this.state = 'idle'; this.alpha = 0; this.scale = 0; this.pull = 0; this.displacement = .5; this.target = .5; }
    size(rect, color, bottom) {
      const r = rect.width * .75 / SIN, h = r - COS * r, or = rect.height * .75 / SIN, oh = or - COS * or;
      this.base = h > 0 ? Math.min(oh / h, 1) : 1; this.height = Math.min(rect.height, h); this.radius = r; this.width = rect.width;
      Object.assign(this.node.style, {left: `${rect.left}px`, top: `${bottom ? rect.top + rect.height - this.height : rect.top}px`, width: `${rect.width}px`, height: `${this.height}px`});
      // The bottom glow is the top glow turned over: the cap of a circle below the edge, growing upwards.
      Object.assign(this.cap.style, {width: `${2 * r}px`, height: `${2 * r}px`, left: `${rect.width / 2 - r}px`, top: `${bottom ? 0 : this.height - 2 * r}px`, background: color});
    }
    begin(state, duration, alphaTo, scaleTo) { Object.assign(this, {state, start: performance.now(), duration, alpha0: this.alpha, scale0: this.scale, alpha1: alphaTo, scale1: scaleTo}); }
    onPull(delta, displacement) {
      this.target = displacement;
      if (this.state === 'decay' && performance.now() - this.start < this.duration) return;
      this.pull += delta;
      const alpha = Math.min(.5, this.alpha + Math.abs(delta) * .8);
      const scale = this.pull === 0 ? 0 : Math.max(0, 1 - 1 / Math.sqrt(Math.abs(this.pull) * this.height) - .3) / .7;
      this.alpha = alpha; this.scale = scale; this.begin('pull', 167, alpha, scale);
    }
    onRelease() { this.pull = 0; if (this.state === 'pull' || this.state === 'decay') this.begin('recede', 600, 0, 0); }
    onAbsorb(velocity) {
      const v = Math.min(Math.max(100, Math.abs(velocity)), 10000);
      this.begin('absorb', 0.15 + v * 0.02, .3, Math.min(0.025 + (v * Math.floor(v / 100) * 0.00015) / 2, 1));
      this.alpha0 = .3; this.scale0 = Math.max(this.scale, 0);
      this.alpha1 = Math.max(.3, Math.min(v * 6 * .00001, .5)); this.target = .5;
    }
    // EdgeEffect.update + draw: DecelerateInterpolator(1) between the state's start and finish.
    frame(now) {
      if (this.state === 'idle') { this.node.style.opacity = '0'; return false; }
      const t = Math.min((now - this.start) / this.duration, 1), k = 1 - (1 - t) * (1 - t);
      this.alpha = this.alpha0 + (this.alpha1 - this.alpha0) * k; this.scale = this.scale0 + (this.scale1 - this.scale0) * k;
      this.displacement = (this.displacement + this.target) / 2;
      if (t >= 1 - 1e-3) {
        if (this.state === 'absorb' || this.state === 'pull') this.begin(this.state === 'pull' ? 'decay' : 'recede', this.state === 'pull' ? 2000 : 600, 0, 0);
        else if (this.state === 'decay') this.state = 'recede';
        else if (this.state === 'recede') this.state = 'idle';
      }
      const shift = this.width * (Math.max(0, Math.min(this.displacement, 1)) - .5) / 2;
      this.node.style.opacity = String(this.alpha);
      this.cap.style.transform = `translateX(${shift.toFixed(1)}px)`;
      this.node.style.transform = `scaleY(${(Math.min(this.scale, 1) * this.base).toFixed(4)})`;
      return true;
    }
  }

  const SKIP = '.mmsh, .mmrc, .mmh, .mmlk, .mmeg, .mmime, .mmbo, input, textarea, select, [contenteditable], .no-drag-scroll';
  function scrollable(target, root) {
    for (let node = target; node && node !== root; node = node.parentElement) {
      if (node.scrollHeight > node.clientHeight + 1) { const y = getComputedStyle(node).overflowY; if (y === 'auto' || y === 'scroll') return node; }
    }
    return null;
  }
  function attach(screen, {color = () => '#666666', onScroll} = {}) {
    const layer = document.createElement('div'); layer.className = 'mmscr-edges'; layer.setAttribute('aria-hidden', 'true'); screen.append(layer);
    const edges = {top: new Edge(layer, false), bottom: new Edge(layer, true)};
    let drag = null, fling = null, raf = 0, suppressClick = false;
    const tick = now => { raf = 0; let busy = false; for (const edge of Object.values(edges)) busy = edge.frame(now) || busy; if (fling) busy = stepFling(now) || busy; if (busy) raf = requestAnimationFrame(tick); };
    const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
    // The glow starts where the list does: below a toolbar that stays pinned at the top of the scrolling view.
    const pinned = el => [...el.children].filter(child => getComputedStyle(child).position === 'sticky' && child.offsetTop - el.scrollTop <= 1).reduce((sum, child) => sum + child.offsetHeight, 0);
    const place = el => { const box = screen.getBoundingClientRect(), r = el.getBoundingClientRect(), skip = pinned(el); const rect = {left: r.left - box.left, top: r.top - box.top + skip, width: r.width, height: r.height - skip}; const c = color(el); edges.top.size(rect, c, false); edges.bottom.size(rect, c, true); };
    function stepFling(now) {
      const {el, start, distance, duration, min, max, sign} = fling;
      const t = Math.min(1, (now - fling.t0) / duration), {distance: d, velocity: v} = splineAt(t);
      let top = start + sign * distance * d;
      const current = sign * v * distance / duration * 1000 * DEVICE(); // device px/s
      if (top <= min || top >= max) {
        el.scrollTop = top <= min ? min : max;
        (top <= min ? edges.top : edges.bottom).onAbsorb(Math.abs(current)); fling = null; onScroll?.(el); return true;
      }
      el.scrollTop = top; onScroll?.(el);
      if (t >= 1) { fling = null; return false; }
      return true;
    }
    screen.addEventListener('pointerdown', event => {
      if (fling) { fling = null; }
      if (event.pointerType !== 'mouse' || event.button > 0 || event.target.closest(SKIP)) return;
      const el = scrollable(event.target, screen);
      if (!el) return;
      drag = {el, id: event.pointerId, x: event.clientX, y: event.clientY, top: el.scrollTop, active: false, samples: [[performance.now(), event.clientY]]};
    }, true);
    window.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const dy = event.clientY - drag.y, dx = event.clientX - drag.x, now = performance.now();
      if (!drag.active) {
        if (Math.abs(dy) <= SLOP() || Math.abs(dy) < Math.abs(dx)) return;
        drag.active = true; drag.y = event.clientY; drag.top = drag.el.scrollTop; place(drag.el); screen.classList.add('mmscr-dragging');
      }
      event.preventDefault(); event.stopImmediatePropagation();
      drag.samples.push([now, event.clientY]); while (drag.samples.length > 2 && now - drag.samples[0][0] > 100) drag.samples.shift();
      const el = drag.el, max = el.scrollHeight - el.clientHeight, want = drag.top - (event.clientY - drag.y);
      el.scrollTop = Math.max(0, Math.min(max, want)); onScroll?.(el);
      const rect = el.getBoundingClientRect(), x = (event.clientX - rect.left) / rect.width;
      // Pulling past an edge: the overscroll since the last move, as a fraction of the list height.
      const over = want < 0 ? want : want > max ? want - max : 0, last = drag.over || 0;
      if (over < 0) edges.top.onPull((last - over) / rect.height, x); else if (over > 0) edges.bottom.onPull((over - last) / rect.height, x);
      else if (last) { edges.top.onRelease(); edges.bottom.onRelease(); }
      drag.over = over; wake();
    }, true);
    const end = event => {
      if (!drag || event.pointerId !== drag.id) return;
      const {el, active, samples} = drag; drag = null;
      if (!active) return;
      screen.classList.remove('mmscr-dragging'); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0);
      edges.top.onRelease(); edges.bottom.onRelease();
      const [t0, y0] = samples[0], [t1, y1] = samples[samples.length - 1];
      const velocity = t1 > t0 ? -(y1 - y0) / (t1 - t0) * 1000 * DEVICE() : 0; // device px/s, positive scrolls down
      const v = Math.sign(velocity) * Math.min(MAX_FLING, Math.abs(velocity)), max = el.scrollHeight - el.clientHeight;
      if (Math.abs(v) >= MIN_FLING && event.type === 'pointerup' && !(el.scrollTop <= 0 && v < 0) && !(el.scrollTop >= max && v > 0)) {
        fling = {el, start: el.scrollTop, t0: performance.now(), duration: flingDuration(v), distance: flingDistance(v) / DEVICE(), sign: Math.sign(v), min: 0, max};
      }
      wake();
    };
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    // The release after a drag is not a tap on whatever lies under the pointer.
    window.addEventListener('click', event => { if (suppressClick) { suppressClick = false; event.preventDefault(); event.stopImmediatePropagation(); } }, true);
    return {stop() { fling = null; }};
  }
  // colorEdgeEffect is the theme's colorPrimary: the colour of the bar above the list where there is one.
  function primary(el) {
    for (let node = el; node && node.id !== 'viewport'; node = node.parentElement) {
      for (const sib of node.parentElement ? [...node.parentElement.children] : []) {
        if (sib === node || sib.offsetTop > node.offsetTop) continue;
        const bg = getComputedStyle(sib).backgroundColor, m = bg.match(/\d+(\.\d+)?/g);
        if (m && (m[3] === undefined || +m[3] > .5) && !(+m[0] > 240 && +m[1] > 240 && +m[2] > 240)) return bg;
      }
    }
    return '#666666';
  }
  MM.register('scroll', {app: false, init(c) { attach(c.el.screen, {color: primary}); }, render: () => ''});
})();
