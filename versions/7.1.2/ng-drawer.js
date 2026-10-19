/* Android 7.1.2 apps drawer: Launcher3's AllAppsContainerView in Velvet 6.5 (all_apps.xml), the screen 'drawer'. The
   logic is 6.0.1's (mm-drawer.js); the look is N2G48C's:
   - BaseContainerView: the panel (quantum_panel_shape: #f5f5f5, 2 dp corners) inset container_min_margin 8 dp at the
     sides and container_bounds_inset 8 dp under the status bar and above the navigation bar; at its top the 60 dp search
     container (all_apps_search_bg: the panel's colour, top corners, a 1 dp #1e000000 line at its foot) with the
     "Search Apps…" field (16 sp #4c4c4c, hint #9c9c9c), 9 dp in, padded to line up with the first column's icon.
   - AllAppsContainerView.onMeasure: (width less the 9 dp fast scroller at both sides + all_apps_icon_width_gap 24 dp)
     / (the 224 px icon + 24 dp) = 4 columns; the list padded by the scroller's width at the sides and
     all_apps_list_top_bottom_padding 8 dp; no section margin on a phone, so FullMergeAlgorithm: one grid sorted by
     label (AlphabeticalAppsList, the locale's collator).
   - all_apps_icon.xml: BubbleTextView (Icon.AllApps: #666666, no shadow, 4 dp at the sides) 8 dp above and below; the
     predicted apps (all_apps_prediction_bar_icon.xml: 8 dp above, 18 dp below) are the ones opened most recently, a 1 dp
     #1e000000 line under them (GridItemDecoration).
   - BaseRecyclerViewFastScrollBar: the 72 dp thumb, 5 dp wide (9 dp while held) in #009688 over its track (black at
     30 / 255), at the panel's end; held, the list follows it.
   - The search: DefaultAppSearchAlgorithm, a label word starting with the query; none: all_apps_no_search_results and
     all_apps_search_market_message.
   - LauncherStateTransitionAnimation: the panel comes out of the all apps button (config_overlayRevealTime 220 ms,
     LogDecelerateInterpolator 100: the circle from allAppsButtonVisualSize / 2, the panel moving from the button to its
     place), the contents fading in (AccelerateInterpolator 1.5) after config_overlayItemsAlphaStagger 60 ms; Back or
     Home closes it back into the button (ng-core.js 'unreveal'). */
(() => {
  'use strict';
  const T = () => NG.text('launcher');
  const P = 3.5;
  const dp = px => `calc(${(px / P).toFixed(3)} * var(--dp))`;

  function apps(c) {
    const collator = new Intl.Collator(c.locale(), {sensitivity: 'base'});
    return Object.keys(NG.appsData || {}).filter(id => !NG.appDisabled(c, id)).sort((a, b) => collator.compare(NG.appLabel(c, a), NG.appLabel(c, b)));
  }
  function matches(c, id, q) {
    if (!q) return true;
    const words = NG.appLabel(c, id).toLocaleLowerCase(c.locale()).split(/[\s\-_]+/);
    return words.some(w => w.startsWith(q.toLocaleLowerCase(c.locale())));
  }
  const item = (c, id) => `<button type="button" class="ngd-app" data-action="ngd-app" data-app="${id}"><img src="${NG.appsData[id].icon}" alt=""><span>${c.safe(NG.appLabel(c, id))}</span></button>`;

  function grid(c) {
    const st = c.ui.drawer, t = T(), q = st.query.trim();
    const list = apps(c).filter(id => matches(c, id, q));
    const recent = (c.data.recentApps || []).filter(id => NG.appsData?.[id] && !NG.appDisabled(c, id)).slice(0, 4);
    const predictions = !q && recent.length && c.data.launcherPredictions !== false ? `<div class="ngd-row ngd-predicted">${recent.map(id => item(c, id)).join('')}</div><i class="ngd-divider"></i>` : '';
    if (!list.length) return `<div class="ngd-empty">${c.safe(t.fmt('all_apps_no_search_results', null, q))}</div><button type="button" class="ngd-market" data-action="ngd-market">${c.safe(t.fmt('all_apps_search_market_message', null, NG.appLabel(c, 'play-store')))}</button>`;
    return `${predictions}<div class="ngd-grid">${list.map(id => item(c, id)).join('')}</div>`;
  }

  function render(c) {
    const st = c.ui.drawer || (c.ui.drawer = {query: ''});
    // Opened from the home screen it reveals itself (a new search each time); back from an app it is just there.
    const fresh = c.ui.prevView === 'home';
    st.fresh = fresh;
    if (fresh) st.query = '';
    const t = T(), G = NG.launcherGrid;
    // The all apps button's centre (42 px + half its 196 px icon down the hotseat), where the drawer closes back to.
    const origin = `--rx:${dp(G.side + 2.5 * G.hsCellW)};--ry:calc(100% - ${dp(G.hotseatH - 42 - 98)})`;
    return `<div class="ngd" style="${origin}">
      <div class="ngd-panel">
        <div class="ngd-content">
          <div class="ngd-search"><input type="text" class="ngd-input" placeholder="${c.safe(t.t('all_apps_search_bar_hint'))}" value="${c.safe(st.query)}" spellcheck="false" autocomplete="off"></div>
          <div class="ngd-scroll">${grid(c)}</div><div class="ngd-fast"><i class="ngd-track"></i><i class="ngd-thumb"></i></div>
        </div></div></div>`;
  }

  // The panel's opening (LauncherStateTransitionAnimation.startAnimationToOverlay, material reveal).
  const logDecel = t => (1 - Math.pow(100, -t)) / (1 - 1 / 100);
  function reveal(c, root) {
    const panel = root.querySelector('.ngd-panel'), content = root.querySelector('.ngd-content');
    if (!panel?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const G = NG.launcherGrid, k = c.el.viewport.clientWidth / (1440 / P), pr = panel.getBoundingClientRect(), vr = c.el.viewport.getBoundingClientRect();
    const bx = (G.side + 2.5 * G.hsCellW) / P * k + vr.left, by = vr.bottom - (G.hotseatH / 2 + 7) / P * k;
    const dx = bx - (pr.left + pr.width / 2), dy = by - (pr.top + pr.height / 2), r0 = G.allAppsButton / 2 / P * k, r1 = Math.hypot(pr.width / 2, pr.height / 2);
    const n = 16, steps = f => Array.from({length: n + 1}, (_, i) => f(i / n));
    panel.animate(steps(t => ({offset: t, transform: `translate(${(dx * (1 - logDecel(t))).toFixed(2)}px, ${(dy * (1 - logDecel(t))).toFixed(2)}px)`, clipPath: `circle(${(r0 + (r1 - r0) * logDecel(t)).toFixed(1)}px at 50% 50%)`})), {duration: 220});
    content.animate(steps(t => ({offset: t, opacity: Math.pow(t, 3), transform: `translateY(${(dy * (1 - logDecel(t))).toFixed(2)}px)`})), {duration: 220, delay: 60, fill: 'backwards'});
  }

  // The fast scroller: the thumb shows where the list is; dragged, the list follows it.
  function bindFast(root) {
    const scroll = root.querySelector('.ngd-scroll'), fast = root.querySelector('.ngd-fast'), thumb = root.querySelector('.ngd-thumb');
    if (!scroll || !fast) return;
    const place = () => {
      const max = scroll.scrollHeight - scroll.clientHeight;
      fast.hidden = max <= 0;
      const f = max > 0 ? scroll.scrollTop / max : 0;
      thumb.style.top = `calc((100% - 72 * var(--dp)) * ${f.toFixed(4)})`;
    };
    scroll.addEventListener('scroll', place, {passive: true}); place();
    fast.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation(); fast.classList.add('held');
      try { fast.setPointerCapture(e.pointerId); } catch {}
      const move = ev => { const r = fast.getBoundingClientRect(), f = Math.min(1, Math.max(0, (ev.clientY - r.top - thumb.offsetHeight / 2) / (r.height - thumb.offsetHeight))); scroll.scrollTop = f * (scroll.scrollHeight - scroll.clientHeight); };
      move(e);
      const up = () => { fast.classList.remove('held'); fast.removeEventListener('pointermove', move); };
      fast.addEventListener('pointermove', move); fast.addEventListener('pointerup', up, {once: true}); fast.addEventListener('pointercancel', up, {once: true});
    });
  }

  function mount(c, root) {
    const st = c.ui.drawer;
    if (st.fresh) reveal(c, root);
    bindFast(root);
    // An app held in the drawer is picked up onto the workspace (AllAppsContainerView.onLongClick: beginDragShared).
    root.querySelector('.ngd-scroll')?.addEventListener('pointerdown', e => {
      const app = e.target.closest('.ngd-app'); if (!app || e.button) return;
      const x0 = e.clientX, y0 = e.clientY;
      const cancel = () => { clearTimeout(timer); document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', cancel); };
      const mv = ev => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) cancel(); };
      const timer = setTimeout(() => { cancel(); st.held = true; NG.launcherDragFromDrawer?.(c, app.dataset.app, x0, y0); }, 500);
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', cancel);
    });
    const input = root.querySelector('.ngd-input'), scroll = root.querySelector('.ngd-scroll');
    input?.addEventListener('input', () => { st.query = input.value; scroll.innerHTML = grid(c); scroll.scrollTop = 0; bindFast(root); });
  }

  NG.register('drawer', {
    app: false,
    render, mount,
    statusColor: () => 'transparent',
    // Back with a search typed clears it first (AllAppsContainerView: the search bar's back), then closes the drawer.
    back(c) { const st = c.ui.drawer; if (st?.query) { st.query = ''; c.render(); return true; } return false; },
    action(name, el, event, c) {
      if (name === 'ngd-app') { if (c.ui.drawer?.held) { c.ui.drawer.held = false; return true; } c.open(el.dataset.app, '', {from: el.querySelector('img')}); return true; }
      if (name === 'ngd-market') { c.open('play-store', `search:${c.ui.drawer.query}`); return true; }
      return false;
    }
  });
})();
