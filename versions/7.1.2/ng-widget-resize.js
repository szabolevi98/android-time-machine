/* Launcher3 AppWidgetResizeFrame (android-7.1.2_r1): the image's widget_resize_shadow/frame and four handles,
   24 dp background padding, 13 dp handle margin, 48 dp edge touch regions, 0.66-cell threshold and 150 ms snap.
   AppWidgetServiceImpl supplies minWidth/minHeight when resize minima are absent; ProviderInfo.initSpans adds
   the host's 8 dp padding on each side. Preview positions stay outside the saved layout until commit. */
(() => {
  'use strict';
  const dp = px => `calc(${px / 3.5} * var(--dp))`;
  const rect = it => ({x: it.x, y: it.y, spanX: it.spanX || 1, spanY: it.spanY || 1});
  const overlap = (a, b) => a.x < b.x + b.spanX && b.x < a.x + a.spanX && a.y < b.y + b.spanY && b.y < a.y + a.spanY;
  const inside = r => r.x >= 0 && r.y >= 0 && r.x + r.spanX <= 5 && r.y + r.spanY <= 5;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  function limits(info) {
    return {mode: Number(info?.resize || 0), minX: clamp(Math.ceil(((info?.minResizeW ?? info?.minW ?? 0) + 16) / 80.686), 1, 5),
      minY: clamp(Math.ceil(((info?.minResizeH ?? info?.minH ?? 0) + 16) / 96.686), 1, 5)};
  }
  // CellLayout's resize/reorder transaction: keep non-overlapping cells and find a vacant span for displaced items.
  // No item moves if the complete transaction cannot fit. Widgets keep their own spans when displaced.
  function plan(items, widget, next, direction = {x: 0, y: 0}) {
    if (!inside(next) || next.spanX < 1 || next.spanY < 1) return null;
    const others = items.filter(it => it !== widget).map(item => ({item, ...rect(item)}));
    const fixed = others.filter(r => !overlap(r, next)), moving = others.filter(r => overlap(r, next));
    const placed = [{item: widget, ...next}, ...fixed];
    moving.sort((a, b) => b.spanX * b.spanY - a.spanX * a.spanY);
    for (const entry of moving) {
      const candidates = [];
      for (let y = 0; y <= 5 - entry.spanY; y++) for (let x = 0; x <= 5 - entry.spanX; x++) {
        const r = {...entry, x, y};
        if (!placed.some(p => overlap(p, r))) candidates.push({...r, distance: Math.abs(x - entry.x) + Math.abs(y - entry.y),
          forward: (x - entry.x) * direction.x + (y - entry.y) * direction.y});
      }
      candidates.sort((a, b) => a.distance - b.distance || b.forward - a.forward || a.y - b.y || a.x - b.x);
      if (!candidates.length) return null;
      const {distance, forward, ...chosen} = candidates[0]; placed.push(chosen);
    }
    return placed;
  }
  function proposal(items, widget, edges, dx, dy, info) {
    const l = limits(info), r = rect(widget), steps = n => Math.abs(n) > .66 ? Math.round(n) : 0;
    dx = steps(dx); dy = steps(dy);
    if (l.mode & 1) {
      if (edges.left) { const x = clamp(r.x + dx, 0, r.x + r.spanX - l.minX); r.spanX += r.x - x; r.x = x; }
      else if (edges.right) r.spanX = clamp(r.spanX + dx, l.minX, 5 - r.x);
    }
    if (l.mode & 2) {
      if (edges.top) { const y = clamp(r.y + dy, 0, r.y + r.spanY - l.minY); r.spanY += r.y - y; r.y = y; }
      else if (edges.bottom) r.spanY = clamp(r.spanY + dy, l.minY, 5 - r.y);
    }
    return plan(items, widget, r, {x: edges.left ? -1 : edges.right ? 1 : 0, y: edges.top ? -1 : edges.bottom ? 1 : 0});
  }
  function dismiss(c, redraw = false) {
    const s = c.ui.widgetResize;
    if (!s) return false;
    s?.listeners?.abort(); c.ui.widgetResize = null;
    c.el.viewport.querySelector('.ngwr-frame')?.remove();
    if (redraw) c.render();
    return !!s;
  }
  function show(c, item) {
    if (!limits(NG.widgets?.info(item.w)).mode) return false;
    const page = c.data.home.pages.findIndex(p => p.includes(item));
    if (page < 0) return false;
    c.ui.widgetResize = {item, page: page + 1};
    c.ui.home.page = page + 1; c.render(); return true;
  }
  function mount(c, root) {
    const s = c.ui.widgetResize;
    if (!s) return;
    s.listeners?.abort();
    const items = c.data.home?.pages[s.page - 1], item = s.item, info = NG.widgets?.info(item.w), l = limits(info);
    if (!items?.includes(item) || c.ui.home.page !== s.page || !l.mode) { dismiss(c); return; }
    const G = NG.launcherGrid, scale = root.clientWidth / G.W, pad = 16 * 3.5;
    const controller = s.listeners = new AbortController(), {signal} = controller;
    const frame = document.createElement('div'); frame.className = 'ngwr-frame';
    const label = r => NG.text('launcher').fmt('widget_resized', null, r.spanX, r.spanY);
    frame.innerHTML = `<i class="ngwr-shadow np-gel-widget_resize_shadow"></i><i class="ngwr-border np-gel-widget_resize_frame"></i>${['left', 'right', 'top', 'bottom'].filter(edge => l.mode & (edge === 'left' || edge === 'right' ? 1 : 2)).map(edge => `<button type="button" class="ngwr-handle ${edge}" data-edge="${edge}" role="slider" aria-label="${c.safe(info.label?.[c.lang] || info.label?.en || info.id)}" aria-valuemin="${edge === 'left' || edge === 'right' ? l.minX : l.minY}" aria-valuemax="5" aria-valuenow="${edge === 'left' || edge === 'right' ? item.spanX : item.spanY}"><img src="assets/gel-ic_widget_resize_handle.png" alt=""></button>`).join('')}<span class="ngwr-announcement" aria-live="polite"></span>`;
    root.append(frame);
    const cells = new Map(items.map((it, i) => [it, root.querySelector(`.ngh-page[data-page="${s.page}"] > .ngh-cell[data-index="${i}"]`)]));
    const frameRect = r => ({left: G.ws.left + r.x * G.cellW - pad, top: G.ws.top + r.y * G.cellH - pad,
      width: r.spanX * G.cellW + pad * 2, height: r.spanY * G.cellH + pad * 2});
    const positionFrame = r => { for (const [key, value] of Object.entries(r)) frame.style[key] = dp(value); };
    positionFrame(frameRect(rect(item)));
    function paint(positions) {
      for (const r of positions) {
        const cell = cells.get(r.item); if (!cell) continue;
        Object.assign(cell.style, {left: dp(r.x * G.cellW), top: dp(r.y * G.cellH), width: dp(r.spanX * G.cellW), height: dp(r.spanY * G.cellH)});
        if (r.item === item) {
          const content = cell.querySelector('.ngh-widget');
          content.innerHTML = NG.widgets.home(c, {...item, ...rect(r)}); NG.widgets.mount?.(c, cell);
        }
      }
      const r = positions.find(r => r.item === item);
      frame.querySelector('.ngwr-announcement').textContent = label(r);
      for (const handle of frame.querySelectorAll('.ngwr-handle')) handle.setAttribute('aria-valuenow', handle.dataset.edge === 'left' || handle.dataset.edge === 'right' ? r.spanX : r.spanY);
    }
    function commit(positions, cancel = false) {
      const before = frame.getBoundingClientRect();
      if (!cancel) { for (const r of positions) Object.assign(r.item, rect(r)); c.save(); }
      c.ui.home.suppressClick = true; setTimeout(() => { if (c.ui.home) c.ui.home.suppressClick = false; }, 60);
      c.render();
      const after = c.el.viewport.querySelector('.ngwr-frame'), box = after?.getBoundingClientRect();
      if (box) { after.style.transformOrigin = '0 0'; after.animate([{transform: `translate(${before.left - box.left}px,${before.top - box.top}px) scale(${before.width / box.width},${before.height / box.height})`}, {transform: 'none'}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'}); }
    }
    let drag = null;
    root.addEventListener('pointerdown', e => {
      if (e.button || !c.ui.widgetResize) return;
      const r = frame.getBoundingClientRect(), x = (e.clientX - r.left) / scale, y = (e.clientY - r.top) / scale, touch = 48 * 3.5;
      const inFrame = x >= 0 && y >= 0 && x <= r.width / scale && y <= r.height / scale;
      const edges = {left: inFrame && !!(l.mode & 1) && x < touch, right: inFrame && !!(l.mode & 1) && x > r.width / scale - touch,
        top: inFrame && !!(l.mode & 2) && y < touch, bottom: inFrame && !!(l.mode & 2) && y > r.height / scale - touch};
      if (!Object.values(edges).some(Boolean)) { dismiss(c); return; }
      e.preventDefault(); e.stopImmediatePropagation();
      drag = {x: e.clientX, y: e.clientY, pointer: e.pointerId, edges, base: frameRect(rect(item)), plan: items.map(item => ({item, ...rect(item)}))};
      c.ui.home.suppressClick = true;
      for (const h of frame.querySelectorAll('.ngwr-handle')) h.style.opacity = edges[h.dataset.edge] ? '1' : '0';
    }, {capture: true, signal});
    window.addEventListener('pointermove', e => {
      if (!drag || drag.pointer !== e.pointerId) return;
      e.preventDefault();
      const dx = (e.clientX - drag.x) / scale, dy = (e.clientY - drag.y) / scale, edges = drag.edges;
      const positions = proposal(items, item, edges, dx / G.cellW, dy / G.cellH, info);
      if (positions) { drag.plan = positions; paint(positions); }
      const r = {...drag.base}, min = 96 * 3.5;
      if (edges.left) { const d = clamp(dx, -r.left, r.width - min); r.left += d; r.width -= d; }
      else if (edges.right) r.width = clamp(r.width + dx, min, G.W - r.left);
      if (edges.top) { const d = clamp(dy, -r.top, r.height - min); r.top += d; r.height -= d; }
      else if (edges.bottom) r.height = clamp(r.height + dy, min, G.H - r.top);
      positionFrame(r);
    }, {signal, passive: false});
    const end = e => { if (!drag || drag.pointer !== e.pointerId) return; const d = drag; drag = null; e.preventDefault(); e.stopImmediatePropagation(); commit(d.plan, e.type === 'pointercancel'); };
    window.addEventListener('pointerup', end, {capture: true, signal});
    window.addEventListener('pointercancel', end, {capture: true, signal});
    frame.addEventListener('keydown', e => {
      const edge = e.target.dataset.edge;
      if (!edge || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation();
      const p = proposal(items, item, {[edge]: true}, e.key === 'ArrowLeft' ? -1 : e.key === 'ArrowRight' ? 1 : 0, e.key === 'ArrowUp' ? -1 : e.key === 'ArrowDown' ? 1 : 0, info);
      if (p) { commit(p); c.el.viewport.querySelector(`.ngwr-handle[data-edge="${edge}"]`)?.focus(); }
    }, {signal});
  }
  NG.widgetResize = {limits, plan, proposal, show, mount, dismiss};
})();
