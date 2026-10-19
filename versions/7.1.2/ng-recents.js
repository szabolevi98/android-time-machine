/* Android 7.1.2 Overview (SystemUI.apk RecentsActivity, RecentsView, TaskStackView, TaskStackLayoutAlgorithm of
   N2G48C; the android-7.1.2_r1 sources the classes match), the screen 'recents'. The touch logic is 6.0.1's
   (mm-recents.js); the layout and the look are Nougat's:
   - RecentsView over the wallpaper with its DEFAULT_SCRIM_ALPHA 0.33 black scrim; recents_lower_gradient (78 dp) as
     nav_bar_scrim; recents_empty.xml ("No recent items", 16 sp, the recents_empty drawing 25 dp above) without tasks.
   - TaskStackLayoutAlgorithm in pixels on the 1440 x 2560 display: the stack bounds the window less the status bar,
     recents_layout_side_margin_phone 16 dp in at the sides; the stack rect recents_layout_top_margin_phone 16 dp lower;
     the task rect as wide as the stack and as high as it less recents_layout_initial_top_offset_phone_port 128 dp and
     the bottom offset (the navigation bar + recents_layout_bottom_margin 16 dp).
   - The unfocused curve (a cubic from (0, 1) through (0.4, 0.975) to (0.5, 1 - top peek 48 dp), on through the line's
     continuation at x 0.65 to (1, 0)) maps each task's place in the unfocused range (-2 .. 2.5 tasks about the scroll)
     to its y; the dim curve (MAX_DIM 0.25 at the back, none at the initial offset, MED_DIM 0.15 at the front) its dim;
     z from recents_layout_z_min 3 dp to z_max 24 dp. Dragging moves the scroll by the pixels over the stack height times
     the curve's arc length; past the ends it overscrolls along OVERSCROLL_INTERP and springs back.
   - TaskView: recents_task_view_header.xml (56 dp in the task's colour with the 1 dp highlight a lighter shade, the app
     icon in its 56 dp box padded 8 / 8 / 16 / 12 dp, the label 16 sp sans-serif-medium in #eeeeee or #cc000000 by
     contrast, the 56 dp dismiss button recents_dismiss_light / dark), the thumbnail (the screen the app was left on)
     from just under the header, 2 dp corners; dimmed by the dim curve (the title's alpha 1 - dim).
   - The stack action button "Clear all" (recents_stack_action_button.xml: 14 sp medium caps, white with its #99000000
     shadow 2 dp down 5 dp blurred, 14 / 12 dp padding) at the stack's top end while the stack is scrolled within 0.3 of
     its start; it dismisses every task (DISMISS_ALL_TASKS_DURATION 200 ms off to the side) and goes home.
   - From the home screen the tasks rise from a stack's height below (ENTER_FROM_HOME_TRANSLATION_DURATION 300 ms linear
     out slow in, fading in over 100 ms, 33 ms offsets for the five front tasks); from an app its card takes the
     window's place (ng-core.js 'to-recents'). Home sends them down (EXIT_TO_HOME 200 ms, (0.4, 0, 0.6, 1)).
   - A swipe sideways or the X dismisses a task (DISMISS_TASK_DURATION 175 ms), a tap returns to it, the icon opens its
     App info. Back or Overview returns to the front-most task. */
(() => {
  'use strict';
  const T = () => NG.text('recents');
  const D = 3.5, dp = px => `calc(${(px / D).toFixed(3)} * var(--dp))`;
  const SW = 1440, SH = 2560, STATUS = 84, NAV = 168;

  // Path.approximate's polyline (0.002 precision) of FreePathInterpolator.
  function freePath(segs) {
    const pts = [[segs[0][0], segs[0][1]]];
    for (const s of segs.slice(1)) {
      const [x0, y0] = pts[pts.length - 1];
      if (s.length === 2) { pts.push(s); continue; }
      const [x1, y1, x2, y2, x3, y3] = s;
      for (let i = 1; i <= 200; i++) { const t = i / 200, u = 1 - t; pts.push([u ** 3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t ** 3 * x3, u ** 3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t ** 3 * y3]); }
    }
    let arc = 0;
    for (let i = 1; i < pts.length; i++) arc += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const X = pts.map(p => p[0]), Y = pts.map(p => p[1]);
    const interp = t => {
      if (t <= 0) return Y[0]; if (t >= 1) return Y[Y.length - 1];
      let a = 0, b = X.length - 1;
      while (b - a > 1) { const m = (a + b) >> 1; if (t < X[m]) b = m; else a = m; }
      const r = X[b] - X[a]; return r ? Y[a] + (t - X[a]) / r * (Y[b] - Y[a]) : Y[a];
    };
    const getX = y => {
      if (y <= 0) return X[X.length - 1]; if (y >= 1) return X[0];
      let a = 0, b = Y.length - 1;
      while (b - a > 1) { const m = (a + b) >> 1; if (y < Y[m]) a = m; else b = m; }
      const r = Y[b] - Y[a]; return r ? X[a] + (y - Y[a]) / r * (X[b] - X[a]) : X[a];
    };
    return {interp, getX, arc};
  }
  // Range.
  const range = (rmin, rmax) => ({rmin, rmax, origin: 0, offset(x) { this.origin = x; }, norm(x) { return x < this.origin ? .5 + .5 * (x - this.origin) / -this.rmin : .5 + .5 * (x - this.origin) / this.rmax; }, abs(n) { return n < .5 ? (n - .5) / .5 * -this.rmin : (n - .5) / .5 * this.rmax; }});

  // TaskStackLayoutAlgorithm.initialize for the 6P in portrait.
  const L = (() => {
    const side = 56, topMargin = 56, minMargin = 56, peekTop = 168, initialTop = 448, bottomOffset = NAV + 56;
    const stack = {left: side, right: SW - side, top: STATUS + topMargin, bottom: SH};
    stack.height = stack.bottom - stack.top;
    const task = {left: stack.left, top: stack.top, width: stack.right - stack.left, height: stack.height - initialTop - bottomOffset};
    const unfocused = range(-2, 2.5);
    const top = peekTop / stack.height, slope = ((1 - top) - .975) / (.5 - .4), b = 1 - slope * .4, c2y = slope * .65 + b;
    const curve = freePath([[0, 1], [0, 1, .4, .975, .5, 1 - top], [.5, 1 - top, .65, c2y, 1, 0]]);
    const normFromTop = y => curve.getX((stack.height - y) / stack.height);
    const focusX = normFromTop(initialTop), c2x = focusX + (1 - focusX) / 2;
    const dim = freePath([[0, .25], [focusX * .5, .25, focusX * .75, .25 * .75, focusX, 0], [c2x, 0, c2x, .15, 1, .15]]);
    return {stack, task, unfocused, curve, dim, initialTop, bottomOffset, peekTop, topMargin, zMin: 10.5, zMax: 84};
  })();
  const tasks = c => c.ui.recent.filter(id => NG.appsData?.[id] || c.screens[id]).slice().reverse();
  // TaskStackLayoutAlgorithm.update: the scroll bounds and where it starts.
  // From the home screen it scrolls to the front task; from an app the task behind it shows at the initial offset.
  function bounds(n, fromHome = false) {
    if (n <= 1) return {min: 0, max: 0, initial: 0};
    L.unfocused.offset(0);
    const maxBottomNormX = L.curve.getX((L.bottomOffset + L.task.height) / L.stack.height);
    const max = Math.max(0, (n - 1) - Math.max(0, L.unfocused.abs(maxBottomNormX)));
    const initialTopNormX = L.curve.getX((L.stack.height - L.initialTop) / L.stack.height);
    const initial = fromHome ? Math.min(max, n - 1) : Math.max(0, Math.min(max, n - 2) - Math.max(0, L.unfocused.abs(initialTopNormX)));
    return {min: 0, max, initial};
  }
  // getStackTransform (unfocused, no freeform).
  function transform(p, scroll, n, b) {
    if (n === 1) {
      const y = (L.stack.top - L.task.top) + (L.stack.height - NAV - L.task.height) / 2 + Math.trunc(-((b.min - scroll) / n) * L.stack.height / L.curve.arc);
      return {y: L.task.top + y, z: L.zMax, dim: 0};
    }
    L.unfocused.offset(scroll);
    const x = L.unfocused.norm(p);
    if (!(p >= Math.floor(scroll + L.unfocused.rmin) && p <= Math.ceil(scroll + L.unfocused.rmax))) return null;
    const bs = Math.max(b.min, Math.min(b.max, scroll));
    L.unfocused.offset(bs); const bx = L.unfocused.norm(p);
    L.unfocused.offset(Math.min(scroll, b.max)); const lx = L.unfocused.norm(p);
    let dim = L.dim.interp(lx);
    if (n <= 2 && p === 0) { if (bx >= .5) dim = 0; else { const o = L.dim.interp(.5); dim = (dim - o) * .25 / (.25 - o); } }
    const y = Math.trunc((1 - L.curve.interp(x)) * L.stack.height);
    return {y: L.stack.top + y, z: L.zMin + (L.zMax - L.zMin) * Math.min(1, Math.max(0, bx)), dim: Math.max(0, dim)};
  }

  // Utilities.computeContrastBetweenColors: light text on a colour that contrasts more than 3:1 with white.
  function lum(hex) {
    const [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * bl;
  }
  const lightText = hex => 1.05 / (lum(hex) + .05) > 3;
  // HighlightColorDrawable: the highlight 0.075 lighter in HSL.
  function lighter(hex) {
    let [r, g, bl] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    const mx = Math.max(r, g, bl), mn = Math.min(r, g, bl); let h = 0, s = 0, l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - bl) / d + (g < bl ? 6 : 0) : mx === g ? (bl - r) / d + 2 : (r - g) / d + 4; h /= 6; }
    return `hsl(${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(Math.min(1, l + .075) * 100).toFixed(1)}%)`;
  }

  function card(c, id, tr, i) {
    const app = NG.appsData?.[id], color = app?.color || '#e6e6e6', light = lightText(color);
    const label = app ? NG.appLabel(c, id) : c.t(c.screens[id]?.[0] || id);
    const thumb = c.ui.thumbs?.[id];
    return `<div class="ngrc-task" data-task="${id}" style="left:${dp(L.task.left)};top:${dp(tr.y - STATUS)};width:${dp(L.task.width)};height:${dp(L.task.height)};z-index:${i + 1};--z:${dp(tr.z)};--dim:${tr.dim.toFixed(3)};--hl:${lighter(color)}">
      <div class="ngrc-thumb"><div class="ngrc-shot" style="--k:${(L.task.width / SW).toFixed(4)}"><div class="ngrc-vp">${thumb?.html || ''}</div></div><i class="ngrc-dim"></i></div>
      <div class="ngrc-head${light ? ' light' : ''}" style="background:${color}"><button type="button" class="ngrc-icon" data-action="ngrc-info" aria-label="${c.safe(T().t('recents_app_info_button_label'))}">${app ? `<img src="${app.icon}" alt="">` : ''}</button><span class="ngrc-label">${c.safe(label)}</span>
        <button type="button" class="ngrc-dismiss" data-action="ngrc-dismiss" aria-label="${c.safe(T().fmt('accessibility_recents_item_will_be_dismissed', null, label))}"><img src="assets/sui-recents_dismiss_${light ? 'light' : 'dark'}.svg" alt=""></button></div></div>`;
  }
  function cards(c) {
    const list = tasks(c), st = c.ui.recentsState;
    if (!list.length) return `<div class="ngrc-empty"><img src="assets/sui-recents_empty.svg" alt="">${c.safe(T().t('recents_empty_message'))}</div>`;
    const b = bounds(list.length);
    return list.map((id, i) => { const tr = transform(i, st.scroll, list.length, b); return tr ? card(c, id, tr, i) : ''; }).join('');
  }
  // The stack action button: mStackActionButtonRect's end, centred in (the stack's top less the top margin .. plus the
  // top peek); shown below the 0.3 scroll threshold.
  const clearAll = c => `<button type="button" class="ngrc-clear${(c.ui.recentsState.scroll < .3 && tasks(c).length) ? ' shown' : ''}" style="top:${dp(L.stack.top - L.topMargin - STATUS + (L.topMargin + L.peekTop) / 2)};right:${dp(SW - L.stack.right)}" data-action="ngrc-clear">${c.safe(T().t('recents_stack_action_button_label'))}</button>`;

  function render(c) {
    const list = tasks(c);
    if (!c.ui.recentsState) c.ui.recentsState = {scroll: bounds(list.length, c.ui.prevView === 'home').initial, fresh: true};
    return `<div class="ngrc"><i class="ngrc-scrim"></i><div class="ngrc-stack">${cards(c)}</div>${clearAll(c)}<i class="ngrc-bottom"></i></div>`;
  }
  function redraw(c) {
    const el = c.el.viewport.querySelector('.ngrc-stack'); if (el) el.innerHTML = cards(c);
    c.el.viewport.querySelector('.ngrc-clear')?.classList.toggle('shown', c.ui.recentsState.scroll < .3 && tasks(c).length > 0);
  }

  // TaskStackViewTouchHandler's overscroll: past the ends the scroll follows OVERSCROLL_INTERP up to 0.7.
  const over = freePath([[0, 0], [.2, .175, .25, .3, 1, .3]]);
  const MAX_OVER = .7 / .3;
  function mount(c, root) {
    const el = root.querySelector('.ngrc'); if (!el) return;
    const st = c.ui.recentsState;
    if (c.ui.prevView === 'home' && st.fresh && el.animate) {
      const list = [...el.querySelectorAll('.ngrc-task')], k = c.el.screen.clientWidth / SW, off = L.stack.height * k;
      list.forEach((card, i) => {
        const front = list.length - i - 1, d = Math.min(5, front) * 33;
        card.animate([{translate: `0 ${off}px`}, {translate: '0 0'}], {duration: 300, delay: -d, easing: 'cubic-bezier(0,0,.2,1)', fill: 'backwards'});
        card.animate([{opacity: 0}, {opacity: 1}], {duration: 100, delay: Math.min(5, front) * 16, fill: 'backwards'});
      });
    }
    st.fresh = false;
    const k = () => c.el.screen.clientWidth / SW;
    let drag = null;
    el.addEventListener('dragstart', e => e.preventDefault());
    el.addEventListener('pointerdown', e => {
      if (e.button || drag || e.target.closest('.ngrc-clear')) return;
      const t = e.target.closest('.ngrc-task');
      drag = {id: e.pointerId, x: e.clientX, y: e.clientY, task: t, mode: '', scroll: st.scroll, samples: [[performance.now(), e.clientX, e.clientY]]};
      try { el.setPointerCapture(e.pointerId); } catch {}
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag.samples.push([performance.now(), e.clientX, e.clientY]); if (drag.samples.length > 6) drag.samples.shift();
      if (!drag.mode && Math.hypot(dx, dy) > 10) drag.mode = drag.task && Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'scroll';
      if (drag.mode === 'swipe') {
        drag.task.style.transition = 'none'; drag.task.style.translate = `${dx}px 0`; drag.task.style.opacity = String(1 - Math.min(1, Math.abs(dx) / (el.clientWidth * .6)));
      } else if (drag.mode === 'scroll') {
        const b = bounds(tasks(c).length);
        // getDeltaPForY: pixels over the stack's height times the curve's arc length.
        let s = drag.scroll - dy / k() / L.stack.height * L.curve.arc;
        const out = s < b.min ? s - b.min : s > b.max ? s - b.max : 0;
        if (out) s = (out < 0 ? b.min : b.max) + Math.sign(out) * over.interp(Math.abs(out) / MAX_OVER) * MAX_OVER;
        st.scroll = s; redraw(c);
      }
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (d.mode) { st.suppress = true; setTimeout(() => { st.suppress = false; }); }
      const [t0, x0, y0] = d.samples[0], [t1, x1, y1] = d.samples[d.samples.length - 1];
      if (d.mode === 'swipe') {
        // SwipeHelper: past 40 % of the width, or flung sideways the way it moved, it goes.
        const dx = e.clientX - d.x, v = t1 > t0 ? (x1 - x0) / (t1 - t0) * 1000 / (k() * SW / 411.43) : 0;
        if (e.type === 'pointerup' && (Math.abs(dx) > el.clientWidth * .4 || (Math.abs(v) > 100 && Math.sign(v) === Math.sign(dx)))) dismiss(c, d.task.dataset.task, Math.sign(dx) || 1);
        else {
          d.task.animate([{translate: `${dx}px 0`, opacity: d.task.style.opacity}, {translate: '0 0', opacity: 1}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'});
          d.task.style.translate = ''; d.task.style.opacity = ''; d.task.style.transition = '';
        }
      } else if (d.mode === 'scroll') {
        // A fling goes on with the velocity, then the scroll settles inside its bounds (TaskStackViewScroller,
        // DEFAULT_SYNC_STACK_DURATION 200 ms fast out slow in).
        const b = bounds(tasks(c).length), v = t1 > t0 ? (y1 - y0) / (t1 - t0) : 0;
        const target = Math.max(b.min, Math.min(b.max, st.scroll - v * 250 / k() / L.stack.height * L.curve.arc));
        settle(c, target);
      } else if (d.task && e.type === 'pointerup' && !e.target.closest('button')) open(c, d.task.dataset.task);
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  }
  let anim = 0;
  function settle(c, to) {
    const st = c.ui.recentsState, from = st.scroll, start = performance.now(), id = ++anim, ms = Math.abs(to - from) > .5 ? 250 : 200;
    const f = x => { let lo = 0, hi = 1; const g = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (g(.4, .2, m) < x) lo = m; else hi = m; } return g(0, 1, (lo + hi) / 2); };
    const step = now => {
      if (id !== anim || !c.ui.recentsState) return;
      const t = Math.min(1, (now - start) / ms); st.scroll = from + (to - from) * f(t); redraw(c);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Dismissing a task: off to the side it was swiped to (175 ms), the X sends it right; then the stack takes its new
     places (TaskStackView.onStackTaskRemoved, 200 ms fast out slow in). With none left Overview goes home. */
  function dismiss(c, id, side = 1) {
    const stack = c.el.viewport.querySelector('.ngrc-stack'), cardEl = stack?.querySelector(`.ngrc-task[data-task="${CSS.escape(id)}"]`);
    const finish = () => {
      const before = new Map([...(stack?.querySelectorAll('.ngrc-task') || [])].map(t => [t.dataset.task, t.getBoundingClientRect().top]));
      c.ui.recent = c.ui.recent.filter(x => x !== id);
      if (c.ui.thumbs) delete c.ui.thumbs[id];
      if (!tasks(c).length) { c.home(); return; }
      const b = bounds(tasks(c).length);
      c.ui.recentsState.scroll = Math.max(b.min, Math.min(b.max, c.ui.recentsState.scroll));
      redraw(c);
      for (const t of c.el.viewport.querySelectorAll('.ngrc-task')) {
        const was = before.get(t.dataset.task), now = t.getBoundingClientRect().top;
        if (was !== undefined && Math.abs(was - now) > .5) t.animate([{transform: `translateY(${was - now}px)`}, {transform: 'none'}], {duration: 200, easing: 'cubic-bezier(.4,0,.2,1)', composite: 'add'});
      }
    };
    if (!cardEl || !cardEl.animate) { finish(); return; }
    cardEl.style.pointerEvents = 'none';
    cardEl.animate([{translate: cardEl.style.translate || '0px 0', opacity: cardEl.style.opacity || 1}, {translate: `${side * (c.el.viewport.clientWidth + 20)}px 0`, opacity: 0}], {duration: 175, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}).finished.then(finish, finish);
  }
  // Clear all: every task off to the side (DISMISS_ALL_TASKS_DURATION 200 ms, (0.4, 0, 1, 1)), then home.
  function clear(c) {
    const cardsEls = [...c.el.viewport.querySelectorAll('.ngrc-task')];
    const done = () => { c.ui.recent = []; c.ui.thumbs = {}; c.home(); };
    if (!cardsEls.length || !cardsEls[0].animate) { done(); return; }
    cardsEls.forEach(t => t.animate([{translate: '0 0'}, {translate: `${c.el.viewport.clientWidth + 20}px 0`}], {duration: 200, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}));
    c.el.viewport.querySelector('.ngrc-clear')?.classList.remove('shown');
    setTimeout(done, 210);
  }
  // A task opens out of its card (ng-core.js 'zoom').
  function open(c, id) {
    const cardEl = c.el.viewport.querySelector(`.ngrc-task[data-task="${CSS.escape(id)}"]`);
    c.ui.recentsState = null; c.open(id, c.ui.thumbs?.[id]?.sub || '', {replace: true, from: cardEl, zoom: !!cardEl});
  }
  function front(c) { const list = tasks(c); if (list.length) open(c, list[list.length - 1]); else c.home(); }

  NG.register('recents', {
    app: false,
    // The scrim lies under the see-through bars too.
    statusColor: () => '#00000054',
    render, mount,
    reset(c) { c.ui.recentsState = null; },
    back(c) { front(c); return true; },
    recentsKey(c) { front(c); },
    action(name, el, event, c) {
      if (c.ui.recentsState?.suppress) return true;
      const id = el.closest('.ngrc-task')?.dataset.task;
      if (name === 'ngrc-dismiss' && id) { dismiss(c, id); return true; }
      if (name === 'ngrc-info' && id) { c.ui.recentsState = null; c.open('settings', `app:${id}`, {replace: true}); return true; }
      if (name === 'ngrc-clear') { clear(c); return true; }
      return false;
    }
  });
})();
