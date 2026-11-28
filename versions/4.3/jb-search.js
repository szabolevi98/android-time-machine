/* Android 4.3 navigation bar search panel (SystemUI SearchPanelView + GlowPadView, status_bar_search_panel.xml):
   swipe up from the navigation bar to show the ring, drag to the assist target at its top to launch Google Now (config_search_panel_view_vibration_duration 7 ms). */
(() => {
  'use strict';
  const DP = .9;
  // navbar_search_* dimens and the framework glowpadview values.
  const S = {up: 40 * DP, ring: 170 * DP, inner: 15 * DP, glow: 75 * DP, snap: 40 * DP, target: 108 * DP, show: 200, hide: 200};

  function markup(t) {
    return `<div class="jb-search" data-jb-search role="dialog" aria-label="${t('Search')}"><canvas class="jb-search-points" aria-hidden="true"></canvas><div class="jb-search-ring"></div><img class="jb-search-target" src="assets/jb-ic_action_assist_generic_normal.png" alt=""><img class="jb-search-target active" src="assets/jb-ic_action_assist_generic_activated.png" alt=""><button type="button" class="jb-search-target-button" data-jb-search-launch aria-label="${t('Search')}"></button></div>`;
  }
  // The ring is centred on the home key; the single target sits on the ring straight above it.
  function geometry(width, height, homeX) {
    const cx = homeX ?? width / 2, cy = height;
    return {cx, cy, target: {x: cx, y: cy - S.ring}};
  }
  // GlowPadView.handleMove: the target activates once the finger is within the snap margin of it.
  const snapped = (geo, x, y) => Math.hypot(x - geo.target.x, y - geo.target.y) < S.snap + S.target / 4;

  function attach(root, {homeX, onLaunch, onClose, haptic, reduced}) {
    const canvas = root.querySelector('canvas'), ctx = canvas.getContext('2d'), dot = new Image();
    dot.src = 'assets/jb-ic_lockscreen_glowdot.png';
    const points = window.JBKeyguard ? JBKeyguard.pointCloud(S.inner, S.ring) : [];
    const glow = {x: 0, y: 0, radius: S.glow, alpha: 0}, wave = {radius: 0, width: 100 * DP, alpha: 0};
    let geo = geometry(root.clientWidth, root.clientHeight, homeX), active = false, frame = 0, done = false, start = performance.now();
    root.style.setProperty('--cx', `${geo.cx}px`); root.style.setProperty('--ring', `${S.ring}px`);
    const draw = now => {
      if (done) return;
      const dpr = window.devicePixelRatio || 1, w = root.clientWidth, h = root.clientHeight;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      // GlowPadView.ping on show: a wave travels out over the point cloud.
      const k = Math.min(1, (now - start) / 1350); wave.radius = 2 * S.ring * (1 - (1 - k) * (1 - k)); wave.alpha = k < 1 ? 1 : 0;
      for (const point of points) {
        const alpha = window.JBKeyguard ? JBKeyguard.pointAlpha(point, glow, wave) : 0;
        if (alpha <= 0 || point.y > 0) continue;
        ctx.globalAlpha = alpha;
        const size = (4 + (2 - 4) * point.r / S.ring) / 4 * 12 / 1.5 * DP;
        if (dot.complete && dot.naturalWidth) ctx.drawImage(dot, geo.cx + point.x - size / 2, geo.cy + point.y - size / 2, size, size);
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    root.classList.add('showing');
    const move = (x, y) => {
      glow.x = x - geo.cx; glow.y = y - geo.cy; glow.alpha = 1;
      const now = snapped(geo, x, y);
      if (now !== active) { active = now; root.classList.toggle('snapped', active); if (active && haptic()) navigator.vibrate?.(7); }
    };
    const finish = launch => {
      if (done) return; done = true; cancelAnimationFrame(frame);
      root.classList.remove('showing'); root.classList.add('hiding');
      const end = () => { launch ? onLaunch() : onClose(); };
      if (reduced) end(); else setTimeout(end, S.hide);
    };
    root.querySelector('[data-jb-search-launch]').addEventListener('click', () => finish(true));
    root.addEventListener('pointerdown', event => { if (!event.target.closest('[data-jb-search-launch]')) finish(false); });
    return {move, release: () => finish(active), cancel: () => finish(false), state: () => ({active, geo})};
  }
  window.JBSearchPanel = {S, markup, geometry, snapped, attach};
})();
/* The swipe up from the navigation bar to Google of Android 4.3 (SearchPanelView), moved out of simulator.js
   (docs/plans/engine-migration.md): the panel follows the finger from the bar, a release on the Google ring opens
   Google Search, anywhere else it closes (JBSearchPanel above). */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, data, home, i18n, navRoot, openApp, overlayRoot, reducedMotion, renderOverlay, ui;
  const $bind = c => { $c = c; ({data, home, i18n, navRoot, openApp, overlayRoot, reducedMotion, renderOverlay, ui} = c); };
  const spec = {
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'search') {
        if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
      }
      else return;
      return true;
    },
    // Once: the navigation bar's press starts the swipe; the window follows the move and the release.
    init(make, c) {
      $bind(c);
      let searchSwipe = null;
      navRoot.addEventListener('pointerdown', event => { $bind(make()); if (ui.locked || ui.view === 'lock' || event.button > 0) return; searchSwipe = {id: event.pointerId, x: event.clientX, y: event.clientY, panel: null}; }, true);
      window.addEventListener('pointermove', event => {
        if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
        $bind(make());
        const box = overlayRoot.getBoundingClientRect(), k = box.width / overlayRoot.offsetWidth || 1;
        if (!searchSwipe.panel) {
          if ((searchSwipe.y - event.clientY) / k < JBSearchPanel.S.up) return;
          const home = navRoot.querySelector('.nav-home').getBoundingClientRect();
          ui.overlay = 'search'; overlayRoot.innerHTML = ''; renderOverlay();
          searchSwipe.panel = JBSearchPanel.attach(overlayRoot.querySelector('[data-jb-search]'), {homeX: (home.left + home.width / 2 - box.left) / k, haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches,
            onLaunch: () => { ui.overlay = ''; renderOverlay(); openApp('google-search'); },
            onClose: () => { if (ui.overlay === 'search') { ui.overlay = ''; renderOverlay(); } }});
          $c.suppressClickUntil = Infinity;
        }
        const panel = overlayRoot.querySelector('[data-jb-search]').getBoundingClientRect();
        searchSwipe.panel.move((event.clientX - panel.left) / k, (event.clientY - panel.top) / k);
      }, true);
      const endSearchSwipe = event => {
        if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
        $bind(make());
        const panel = searchSwipe.panel; searchSwipe = null;
        if (!panel) return;
        $c.suppressClickUntil = Date.now() + 350;
        event.type === 'pointercancel' ? panel.cancel() : panel.release();
      };
      window.addEventListener('pointerup', endSearchSwipe, true); window.addEventListener('pointercancel', endSearchSwipe, true);
    }
  };
  JB.register('search', spec);
})();
