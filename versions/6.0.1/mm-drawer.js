/* Android 6.0.1 apps drawer: Launcher3's AllAppsContainerView with GEL's search plate (Velvet.apk), the screen 'drawer'.
   - BaseContainerView with the workspace search bar's bounds fixed: GEL's search_plate_proxy.xml (search_bg, a 48 dp
     ExtendedEditText "Search apps…" 16 sp #212121, hint #bdbdbd) sits where the home search bar is (its background's
     padding outside those bounds); under it the panel: quantum_panel_shape (#f5f5f5, 2 dp corners) from the bar's left to
     its right, down to container_bounds_inset 8 dp above the navigation bar.
   - AllAppsContainerView.onMeasure: (width - all_apps_grid_view_start_margin 0) / (all_apps_icon_width_gap 24 dp + the
     icon 168 px) = 4 columns; the RecyclerView padded by the fast scroller's 9 dp at both sides and
     all_apps_list_top_bottom_padding 8 dp; with no section margin on a phone the FullMergeAlgorithm puts every app in
     one grid, sorted by label (AlphabeticalAppsList, the locale's collator).
   - all_apps_icon.xml: BubbleTextView (Icon.AllApps: #666666, no shadow) 8 dp above and below; the predicted apps
     (all_apps_prediction_bar_icon.xml: 8 dp above, 18 dp below) are the ones opened most recently, a divider under them.
   - The search: DefaultAppSearchAlgorithm, a label word starting with the query; none: all_apps_no_search_results and
     all_apps_search_market_message.
   - It opens with a circular reveal from the all apps button; Back or Home closes it back into the button (mm-core.js
     'unreveal'). */
(() => {
  'use strict';
  const T = () => MM.text('launcher');
  const PX = 2.625;
  const dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;

  function apps(c) {
    const collator = new Intl.Collator(c.locale(), {sensitivity: 'base'});
    return Object.keys(MM.appsData || {}).filter(id => !MM.appDisabled(c, id)).sort((a, b) => collator.compare(MM.appLabel(c, a), MM.appLabel(c, b)));
  }
  function matches(c, id, q) {
    if (!q) return true;
    const words = MM.appLabel(c, id).toLocaleLowerCase(c.locale()).split(/[\s\-_]+/);
    return words.some(w => w.startsWith(q.toLocaleLowerCase(c.locale())));
  }
  const item = (c, id, cls = '') => `<button type="button" class="mmd-app${cls}" data-action="mmd-app" data-app="${id}"><img src="${MM.appsData[id].icon}" alt=""><span>${c.safe(MM.appLabel(c, id))}</span></button>`;

  function grid(c) {
    const st = c.ui.drawer, t = T(), q = st.query.trim();
    const list = apps(c).filter(id => matches(c, id, q));
    const recent = (c.data.recentApps || []).filter(id => MM.appsData[id]).slice(0, 4);
    const predictions = !q && recent.length && c.data.launcherPredictions !== false ? `<div class="mmd-row mmd-predicted">${recent.map(id => item(c, id)).join('')}</div><i class="mmd-divider"></i>` : '';
    if (!list.length) return `<div class="mmd-empty">${c.safe(t.fmt('all_apps_no_search_results', null, q))}</div><button type="button" class="mmd-market" data-action="mmd-market">${c.safe(t.fmt('all_apps_search_market_message', null, MM.appLabel(c, 'play-store')))}</button>`;
    return `${predictions}<div class="mmd-grid">${list.map(id => item(c, id)).join('')}</div>`;
  }

  function render(c) {
    const st = c.ui.drawer || (c.ui.drawer = {query: ''});
    // Opened from the home screen it reveals itself (a new search each time); back from an app it is just there.
    const fresh = c.ui.prevView === 'home';
    if (fresh) st.query = '';
    const t = T(), G = MM.launcherGrid;
    const origin = `--rx:${dp(G.edge * 2 + 2.5 * (G.W - G.edge * 4) / 5)};--ry:calc(100% - ${dp(G.hotseatH / 2)})`;
    return `<div class="mmd${fresh ? ' reveal' : ''}" style="${origin}">
      <div class="mmd-search np-gel-search_bg"><input type="text" class="mmd-input" placeholder="${c.safe(t.t('search_apps_hint'))}" value="${c.safe(st.query)}" spellcheck="false" autocomplete="off"></div>
      <div class="mmd-panel"><div class="mmd-scroll">${grid(c)}</div></div></div>`;
  }

  function mount(c, root) {
    const st = c.ui.drawer;
    // An app held in the drawer is picked up onto the workspace (AllAppsContainerView.onLongClick: beginDragShared).
    root.querySelector('.mmd-scroll')?.addEventListener('pointerdown', e => {
      const app = e.target.closest('.mmd-app'); if (!app || e.button) return;
      const x0 = e.clientX, y0 = e.clientY;
      const cancel = () => { clearTimeout(timer); document.removeEventListener('pointermove', mv); document.removeEventListener('pointerup', cancel); };
      const mv = ev => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) cancel(); };
      const timer = setTimeout(() => { cancel(); MM.launcherDragFromDrawer?.(c, app.dataset.app, x0, y0); }, 500);
      document.addEventListener('pointermove', mv); document.addEventListener('pointerup', cancel);
    });
    const input = root.querySelector('.mmd-input'), scroll = root.querySelector('.mmd-scroll');
    input?.addEventListener('input', () => { st.query = input.value; scroll.innerHTML = grid(c); scroll.scrollTop = 0; });
  }

  MM.register('drawer', {
    app: false,
    render, mount,
    statusColor: () => 'transparent',
    reset(c) { c.ui.drawer = null; },
    back(c) { c.ui.drawer = null; return false; },
    action(name, el, event, c) {
      // Launching keeps the drawer: Back from the app returns to it (the launcher stays in its apps state).
      if (name === 'mmd-app') { c.open(el.dataset.app, '', {from: el.querySelector('img')}); return true; }
      if (name === 'mmd-market') { c.open('play-store', `search:${c.ui.drawer.query}`); return true; }
      return false;
    }
  });
})();
