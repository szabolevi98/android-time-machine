/* Android 4.4.4 navigation bar search panel (SystemUI SearchPanelView + GlowPadView, status_bar_search_panel.xml of
   KTU84P, the same layout and glowpad values as 4.3; config_search_panel_view_vibration_duration is 10 ms):
   swipe up from the navigation bar to show the ring, drag to the assist target at its top to launch Google Now. */
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
      if (now !== active) { active = now; root.classList.toggle('snapped', active); if (active && haptic()) navigator.vibrate?.(10); }
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
/* The navigation bar's search panel (SearchPanelView) in the 4.4.4 shell (docs/plans/engine-migration.md): its
   overlay, moved out of simulator.js. The swipe up from the navigation bar stays with the shell. */
(() => {
  'use strict';
  function scope(c) {
    const {i18n, overlayRoot, ui} = c;
    return {
      overlay() {
        if (ui.overlay === 'search') {
          if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
        } else return false;
        return true;
      }
    };
  }
  const spec = {
    overlay: c => scope(c).overlay()
  };
  if (window.KK) for (const id of ['search-panel']) KK.register(id, spec);
})();
