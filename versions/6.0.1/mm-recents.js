/* Android 6.0.1 Overview (SystemUI.apk RecentsActivity, TaskStackView), the screen 'recents'.
   - recents.xml over the wallpaper (the activity shows it): recents_status_gradient (40 dp) under the status bar and
     recents_lower_gradient (78 dp) over the navigation bar; the search bar space (recents_search_bar_space_height
     64 dp) at the top with the search widget; recents_empty.xml ("Your recent screens appear here", 16 sp on #80000000)
     without tasks.
   - TaskStackViewLayoutAlgorithm, in pixels at 420 dpi on the 1080 x 1920 window: the stack under the search bar to the
     navigation bar, inset 3.333 % at the sides and recents_stack_top_padding 16 dp; square task rects as wide as the
     stack; the visible rect to the window's bottom; the log curve (1 - 3000^(1 - 1.75x) / 3000) sampled in 250 steps
     maps progress to screen y; scale 0.8 + 0.2 p; a task is half a task height of progress after the one before; the
     front-most task starts at 0.825.
   - TaskView: recents_task_view_header.xml (56 dp in the task's colour, the 48 dp app icon with 8 dp padding, the label
     16 sp sans-serif-medium in light #eeeeee or dark #cc000000 text by contrast, recents_dismiss_light / dark), the
     thumbnail (the screen the app was left on) under it, 2 dp corners, dimmed with depth (recents_max_task_stack_view_dim
     96); a swipe sideways or the X dismisses it, a tap returns to it, the icon opens its App info.
   - Back or Overview returns to the front-most task, Home goes home. */
(() => {
  'use strict';
  const T = () => MM.text('recents');
  const PX = 2.625, dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;
  const W = 1080, H = 1920, STATUS = 63, NAV = 126, SEARCH = 168;
  // TaskStackViewLayoutAlgorithm.initializeCurve.
  const px = new Array(251).fill(0), xp = new Array(251).fill(0);
  (() => {
    const log = x => 1 - Math.pow(3000, -x * 1.75 + 1) / 3000;
    const fx = [], d = [0]; let total = 0;
    for (let i = 0, x = 0; i <= 250; i++, x += 0.004) fx[i] = log(x);
    for (let i = 1; i < 250; i++) { d[i] = Math.sqrt((fx[i] - fx[i - 1]) ** 2 + 0.004 ** 2); total += d[i]; }
    d[250] = 0; let acc = 0; px[0] = 0;
    for (let i = 1; i <= 250; i++) { acc += Math.abs(d[i] / total); px[i] = acc; }
    px[250] = 1;
    let j = 0, step = 0; xp[0] = 0; xp[250] = 1;
    for (let i = 0; i < 250; i++) {
      while (j < 250 && px[j] <= step) j++;
      xp[i] = j === 0 ? 0 : ((j - 1) + (step - px[j - 1]) / (px[j] - px[j - 1])) * 0.004;
      step += 0.004;
    }
  })();
  // computeRects for the 5X in portrait.
  const visible = {top: STATUS + SEARCH, bottom: H};
  visible.height = visible.bottom - visible.top;
  const stackBottom = H - NAV, padX = Math.trunc(0.03333 * W), padTop = 42;
  const stack = {left: padX, right: W - padX, top: visible.top + padTop, bottom: stackBottom - padTop};
  const task = {left: stack.left, top: stack.top, size: stack.right - stack.left};
  const lerp = (table, p) => { const v = p * 250, lo = Math.floor(v), hi = Math.ceil(v); return table[lo] + (lo < 250 && hi !== lo ? (table[hi] - table[lo]) * (v - lo) / (hi - lo) : 0); };
  const toY = p => p >= 0 && p <= 1 ? visible.top + Math.trunc(visible.height * lerp(xp, p)) : visible.top + Math.trunc(visible.height * p);
  const toP = y => { const v = (y - visible.top) / visible.height; return v >= 0 && v <= 1 ? lerp(px, v) : v; };
  const scaleOf = p => p < 0 ? .8 : p > 1 ? 1 : .8 + .2 * p;
  const between = toP(visible.bottom) - toP(visible.bottom - Math.trunc(task.size * .5));
  const taskPeek = toP(visible.bottom) - toP(visible.bottom - task.size);
  const bottomGap = toP(visible.bottom) - toP(visible.bottom - (visible.bottom - stack.bottom));

  // getStackTransform.
  function transform(p) {
    const b = Math.max(0, Math.min(p, 1)), s = scaleOf(b);
    if (p > 1) return null;
    const ty = toY(b) - visible.top - Math.trunc((1 - s) * task.size / 2);
    return {y: task.top + ty, s, z: 20 + 60 * b, p};
  }

  const tasks = c => c.ui.recent.filter(id => MM.appsData?.[id] || c.screens[id]).slice().reverse();
  function progressList(list) {
    const out = []; let p = .5;
    list.forEach((id, i) => { out.push(p); if (i < list.length - 1) p += between; });
    const max = p - ((1 - taskPeek) - bottomGap);
    return {out, max, min: list.length === 1 ? Math.max(max, 0) : 0, initial: Math.min(max, Math.max(0, p - .825))};
  }

  // Utilities.computeContrastBetweenColors: light text on a colour that contrasts more than 3:1 with white.
  function lum(hex) {
    const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
    return .2126 * r + .7152 * g + .0722 * b;
  }
  const lightText = hex => 1.05 / (lum(hex) + .05) > 3;

  function card(c, id, tr, i) {
    const app = MM.appsData?.[id], color = app?.color || '#e6e6e6', light = lightText(color);
    const label = app ? MM.appLabel(c, id) : c.t(c.screens[id]?.[0] || id);
    const dim = Math.max(0, 1 - tr.p) ** 2 * 96 / 255;
    const thumb = c.ui.thumbs?.[id];
    return `<div class="mmrc-task" data-task="${id}" style="left:${dp(task.left)};top:${dp(tr.y)};width:${dp(task.size)};height:${dp(task.size)};transform:scale(${tr.s.toFixed(4)});z-index:${i + 1};--z:${dp(tr.z)};--dim:${dim.toFixed(3)}">
      <div class="mmrc-thumb"><div class="mmrc-shot" style="--k:${(task.size / W).toFixed(4)}"><i class="mmrc-sb" style="background:${c.safe(thumb?.status || color)}"></i><div class="mmrc-vp">${thumb?.html || ''}</div></div></div>
      <div class="mmrc-head${light ? ' light' : ''}" style="background:${color}"><button type="button" class="mmrc-icon" data-action="mmrc-info" aria-label="${c.safe(T().t('recents_app_info_button_label'))}">${app ? `<img src="${app.icon}" alt="">` : ''}</button><span class="mmrc-label">${c.safe(label)}</span>
        <button type="button" class="mmrc-dismiss" data-action="mmrc-dismiss" aria-label="${c.safe(T().fmt('accessibility_recents_item_will_be_dismissed', null, label))}"><img src="assets/sui-recents_dismiss_${light ? 'light' : 'dark'}.svg" alt=""></button></div></div>`;
  }

  function cards(c) {
    const list = tasks(c), st = c.ui.recentsState;
    if (!list.length) return `<div class="mmrc-empty">${c.safe(T().t('recents_empty_message'))}</div>`;
    const {out} = progressList(list);
    return list.map((id, i) => { const tr = transform(out[i] - st.scroll); return tr ? card(c, id, tr, i) : ''; }).join('');
  }

  function render(c) {
    const list = tasks(c);
    if (!c.ui.recentsState) c.ui.recentsState = {scroll: progressList(list).initial};
    return `<div class="mmrc"><div class="mmrc-search np-gel-search_bg"><button type="button" class="mmrc-plate" data-action="mmrc-search"><img src="assets/gel-ic_searchbox_google.png" alt="Google"></button><span class="mmrc-mic"></span></div>
      <div class="mmrc-stack">${cards(c)}</div><i class="mmrc-top np-sui-recents_status_gradient"></i><i class="mmrc-bottom np-sui-recents_lower_gradient"></i></div>`;
  }

  function redraw(c) { const el = c.el.viewport.querySelector('.mmrc-stack'); if (el) el.innerHTML = cards(c); }

  function mount(c, root) {
    const el = root.querySelector('.mmrc'); if (!el) return;
    const k = () => c.el.screen.clientWidth / W;   // css px per window px
    let drag = null;
    // The pointer is captured, so a drag that leaves the stack (or ends over the bars) still ends; pictures are not
    // dragged by the browser.
    el.addEventListener('dragstart', e => e.preventDefault());
    el.addEventListener('pointerdown', e => {
      if (e.button || drag) return;
      const t = e.target.closest('.mmrc-task');
      drag = {id: e.pointerId, x: e.clientX, y: e.clientY, task: t, mode: '', scroll: c.ui.recentsState.scroll, samples: [[performance.now(), e.clientX]]};
      try { el.setPointerCapture(e.pointerId); } catch {}
    });
    el.addEventListener('pointermove', e => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!drag.mode && Math.hypot(dx, dy) > 10) drag.mode = drag.task && Math.abs(dx) > Math.abs(dy) ? 'swipe' : 'scroll';
      if (drag.mode === 'swipe') {
        drag.samples.push([performance.now(), e.clientX]); if (drag.samples.length > 6) drag.samples.shift();
        drag.task.style.transition = 'none'; drag.task.style.translate = `${dx}px 0`; drag.task.style.opacity = String(1 - Math.min(1, Math.abs(dx) / (el.clientWidth * .6)));
      } else if (drag.mode === 'scroll') {
        const list = tasks(c), {max, min} = progressList(list);
        const dP = toP(visible.top + visible.height / 2) - toP(visible.top + visible.height / 2 - dy / k());
        c.ui.recentsState.scroll = Math.max(min - .0875, Math.min(max + .0875, drag.scroll - dP));
        redraw(c);
      }
    });
    const end = e => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (d.mode) { c.ui.recentsState.suppress = true; setTimeout(() => { c.ui.recentsState && (c.ui.recentsState.suppress = false); }); }
      if (d.mode === 'swipe') {
        // SwipeHelper: past 40 % of the width, or flung sideways faster than the escape velocity (500 dp/s), it goes.
        const dx = e.clientX - d.x, [t0, x0] = d.samples[0], [t1, x1] = d.samples[d.samples.length - 1];
        const v = t1 > t0 ? (x1 - x0) / (t1 - t0) * 1000 / (k() * W / 411.43) : 0;
        const fling = Math.abs(v) > 500 && Math.sign(v) === Math.sign(dx);
        if (e.type === 'pointerup' && (Math.abs(dx) > el.clientWidth * .4 || fling)) dismiss(c, d.task.dataset.task, Math.sign(dx) || 1);
        else {
          // Snapping back: SwipeHelper.snapChild, 150 ms.
          d.task.animate([{translate: `${dx}px 0`, opacity: d.task.style.opacity}, {translate: '0 0', opacity: 1}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'});
          d.task.style.translate = ''; d.task.style.opacity = ''; d.task.style.transition = '';
        }
      } else if (d.mode === 'scroll') {
        const {max, min} = progressList(tasks(c));
        c.ui.recentsState.scroll = Math.max(min, Math.min(max, c.ui.recentsState.scroll));
        redraw(c);
      } else if (d.task && e.type === 'pointerup' && !e.target.closest('button')) open(c, d.task.dataset.task);
    };
    el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end); el.addEventListener('lostpointercapture', end);
  }

  /* Dismissing a task: it slides off to the side it was swiped to (SwipeHelper.dismissChild: 150 ms, fading), the X
     sends it to the right; then the rest of the stack moves into its new places (TaskStackView.onStackTaskRemoved,
     200 ms fast_out_slow_in). With no task left Overview goes home. */
  function dismiss(c, id, side = 1) {
    const stack = c.el.viewport.querySelector('.mmrc-stack'), card = stack?.querySelector(`.mmrc-task[data-task="${CSS.escape(id)}"]`);
    const finish = () => {
      const before = new Map([...(stack?.querySelectorAll('.mmrc-task') || [])].map(t => [t.dataset.task, t.getBoundingClientRect().top]));
      c.ui.recent = c.ui.recent.filter(x => x !== id);
      if (c.ui.thumbs) delete c.ui.thumbs[id];
      if (!tasks(c).length) { c.home(); return; }
      const {max, min} = progressList(tasks(c));
      c.ui.recentsState.scroll = Math.max(min, Math.min(max, c.ui.recentsState.scroll));
      redraw(c);
      for (const t of c.el.viewport.querySelectorAll('.mmrc-task')) {
        const was = before.get(t.dataset.task), now = t.getBoundingClientRect().top;
        if (was !== undefined && Math.abs(was - now) > .5) t.animate([{transform: `translateY(${was - now}px)`}, {transform: 'none'}], {duration: 200, easing: 'cubic-bezier(.4,0,.2,1)', composite: 'add'});
      }
    };
    if (!card || !card.animate) { finish(); return; }
    const from = card.style.translate || '0px 0';
    card.style.pointerEvents = 'none';
    card.animate([{translate: from, opacity: card.style.opacity || 1}, {translate: `${side * (c.el.viewport.clientWidth + 20)}px 0`, opacity: 0}], {duration: 150, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}).finished.then(finish, finish);
  }
  function open(c, id) { c.ui.recentsState = null; c.open(id, c.ui.thumbs?.[id]?.sub || '', {replace: true}); }
  function front(c) { const list = tasks(c); if (list.length) open(c, list[list.length - 1]); else c.home(); }

  MM.register('recents', {
    app: false,
    noStatus: () => false,
    statusColor: () => 'transparent',
    render, mount,
    reset(c) { c.ui.recentsState = null; },
    back(c) { front(c); return true; },
    recentsKey(c) { front(c); },
    action(name, el, event, c) {
      if (c.ui.recentsState?.suppress) return true;
      const id = el.closest('.mmrc-task')?.dataset.task;
      if (name === 'mmrc-dismiss' && id) { dismiss(c, id); return true; }
      if (name === 'mmrc-info' && id) { c.ui.recentsState = null; c.open('settings', `app:${id}`, {replace: true}); return true; }
      if (name === 'mmrc-search') { c.ui.recentsState = null; c.open('search', '', {replace: true}); return true; }
      return false;
    }
  });
})();
