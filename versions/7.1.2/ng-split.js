/* Android 7.1.2 split screen (the docked stack), read from android-7.1.2_r1 (kept in _aosp/aosp712/divider and
   recents): on a portrait phone a task docks at the top (DockRegion.PHONE_PORTRAIT) and another runs below it.
   - Entering: Overview held in an app (PhoneStatusBar.toggleSplitScreenMode → Recents.dockTopTask) docks that app and
     opens Overview below; an app that is not dockable says "App doesn't support split screen" instead (Camera:
     resizeableActivity false), the home screen does nothing. In Overview a task held and dragged into the top 12.5 %
     docks too (ng-recents.js). A forced-resizable app (target SDK below 24: Play Games, Android Pay) shows
     ForcedResizableInfoActivity's "App may not work with split-screen." when it starts in a split.
   - DividerView (docked_stack_divider.xml): a 48 dp window with docked_stack_divider_insets 19 dp, so a 10 dp
     #ff000000 bar and the DividerHandleView (a 16 x 2 dp white rounded bar that becomes a 6 dp circle while touched,
     TOUCH_ANIMATION_DURATION 150 ms; the bar grows 1.4 times and lifts 4 dp). DividerSnapAlgorithm with
     config_dockedStackDividerSnapMode 0 (SNAP_MODE_16_9) on the 1440 x 2560 display: the targets at -35 (dismiss),
     894 (16:9 at the top), 1221 (the middle), 1547 (16:9 at the bottom) and 2392 px (dismiss); a fling of 400 dp/s
     picks the next split target its way, 600 dp/s past the outer ones dismisses, else the nearest wins (the dismiss
     targets' distance divided by 0.35). Settling: 250 ms fast out slow in. Dragged to the top the docked app goes
     (dismissDockedStack), to the bottom it takes the screen (maximizeDockedStack).
   - Home minimizes the docked stack (setMinimizedDockStack): the divider and handle go, a docked_stack_minimize_thickness
     8 dp strip of the app stays under the status bar with the MinimizedDockShadow (#60000000 to clear) below it, the
     launcher fills the rest; opening an app from it restores the split.
   - Overview held while docked undocks: the divider runs to the bottom dismiss target (336 ms after 100 ms) and the
     docked app takes the screen. The navigation bar's Overview key shows ic_sysbar_docked while a stack is docked.
   The simulator keeps one side live (c.ui.view) and shows the other as it was last drawn (c.ui.split.shots); a tap on
   it makes it the live side. */
(() => {
  'use strict';
  const T = () => NG.text('split');
  const PX = 3.5, STATUS = 84, NAV = 168, SH = 2560, DIV = 35, INSET = 66.5;
  const TARGETS = [{pos: -35, flag: 'start', mul: .35}, {pos: 894}, {pos: 1221}, {pos: 1547}, {pos: 2392, flag: 'end', mul: .35}];
  const MIDDLE = 1221, MINIMIZED = STATUS + 8 * PX;
  // Not dockable (resizeableActivity="false" on the launcher activity in the image's manifests).
  const UNRESIZEABLE = ['camera'];
  const st = c => c.ui.split;
  const dockable = id => !UNRESIZEABLE.includes(id);
  const forced = id => (NG.appsData?.[id]?.targetSdk || 25) < 24;
  const dpOf = px => px / PX;
  const scale = c => c.el.screen.clientWidth / (1440 / PX);
  const isApp = (c, id) => id && c.screens[id] && !['home', 'lock', 'recents', 'drawer', 'widgets', 'now'].includes(id) && NG.module(id)?.app !== false;
  const live = c => !!st(c) && c.ui.view !== 'lock' && !c.ui.sleeping && !c.ui.power;

  function capture(c) { const s = st(c); if (s) (s.shots ||= {})[s.focus] = c.el.viewport.innerHTML; }
  function toastFor(c, id) { if (forced(id)) setTimeout(() => c.toast(T().t('dock_forced_resizable')), 300); }

  // Docking: the task goes to the top at the middle target; Overview fills the bottom.
  function dock(c, id, sub = '', html = null) {
    if (!dockable(id)) { c.toast(T().t('recents_incompatible_app_message')); return false; }
    c.ui.split = {a: {view: id, sub}, b: {view: 'recents', sub: ''}, focus: 'b', pos: MIDDLE, shots: {a: html ?? c.ui.thumbs?.[id]?.html ?? ''}, enter: true};
    c.ui.recentsState = null; c.ui.history = [];
    c.open('recents', '', {replace: true});
    toastFor(c, id);
    return true;
  }
  // The split ends: 'a' or 'b' keeps the screen.
  function end(c, keep) {
    const s = st(c); if (!s) return;
    const side = s[keep];
    c.ui.split = null;
    if (keep === s.focus) { c.render(); return; }
    if (side.view === 'recents' || side.view === 'home') { c.home(); return; }
    c.ui.history = []; c.open(side.view, side.sub, {replace: true});
  }
  function focus(c, side) {
    const s = st(c); if (!s || s.focus === side) return;
    capture(c);
    s[s.focus] = {view: c.ui.view, sub: c.ui.sub, history: c.ui.history};
    s.focus = side;
    const to = s[side];
    c.ui.view = to.view; c.ui.sub = to.sub; c.ui.history = to.history || []; c.ui.overlay = '';
    if (to.view === 'recents') c.ui.recentsState = null;
    c.transition('none'); c.render();
  }

  /* ---- the divider ---------------------------------------------------------------------------------------------- */
  function snap(pos, v) {
    const first = TARGETS[1], last = TARGETS[3], vdp = v / PX;
    if (pos < first.pos && vdp < -600) return TARGETS[0];
    if (pos > last.pos && vdp > 600) return TARGETS[4];
    if (Math.abs(vdp) >= 400) return vdp < 0 ? first : last;
    let best = null, bd = Infinity;
    for (const t of TARGETS) { const d = Math.abs(pos - t.pos) / (t.mul || 1); if (d < bd) { bd = d; best = t; } }
    return best;
  }
  function place(c, pos, animate = 0) {
    const scr = c.el.screen;
    if (animate) scr.classList.add('split-anim'); else scr.classList.remove('split-anim');
    scr.style.setProperty('--sp-pos', `calc(${dpOf(pos).toFixed(3)} * var(--dp))`);
  }
  function bindDivider(c, el) {
    el.addEventListener('pointerdown', e => {
      if (e.button) return;
      e.preventDefault(); e.stopPropagation();
      const s = st(c), k = scale(c) / PX, y0 = e.clientY, p0 = s.pos, samples = [[performance.now(), e.clientY]];
      el.classList.add('touching');
      try { el.setPointerCapture(e.pointerId); } catch {}
      const move = ev => { samples.push([performance.now(), ev.clientY]); if (samples.length > 6) samples.shift(); s.pos = Math.max(-DIV, Math.min(2392, p0 + (ev.clientY - y0) / k)); place(c, s.pos); };
      const up = ev => {
        el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up);
        el.classList.remove('touching');
        const [t0, a] = samples[0], [t1, b] = samples[samples.length - 1], v = t1 > t0 ? (b - a) / k / ((t1 - t0) / 1000) : 0;
        const t = snap(s.pos, v);
        s.pos = t.pos; place(c, s.pos, 250);
        // DividerView.commitSnapFlags: docked at the top, the start target dismisses it and the end one maximizes it.
        if (t.flag) setTimeout(() => end(c, t.flag === 'start' ? 'b' : 'a'), 250);
      };
      el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
  }

  /* ---- drawing: called by the core after each render ------------------------------------------------------------ */
  function after(c) {
    const scr = c.el.screen, s = st(c);
    let other = scr.querySelector('#split-other'), divider = scr.querySelector('#split-divider');
    if (!live(c)) {
      scr.classList.remove('split', 'split-a', 'split-b', 'split-min', 'split-anim');
      other?.remove(); divider?.remove(); return;
    }
    s[s.focus] = {view: c.ui.view, sub: c.ui.sub, history: c.ui.history};
    // The top side cannot hold the launcher: Home there minimizes as it does below.
    const min = s.focus === 'b' && c.ui.view === 'home';
    s.minimized = min;
    if (!other) { other = document.createElement('div'); other.id = 'split-other'; other.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); focus(c, st(c).focus === 'a' ? 'b' : 'a'); }, true); scr.querySelector('#viewport').before(other); }
    if (!divider) {
      divider = document.createElement('div'); divider.id = 'split-divider'; divider.setAttribute('role', 'separator');
      divider.innerHTML = '<i class="ngsp-bar"></i><i class="ngsp-handle"></i><i class="ngsp-shadow"></i>';
      bindDivider(c, divider); scr.querySelector('#viewport').after(divider);
    }
    divider.setAttribute('aria-label', T().t('accessibility_divider'));
    const otherSide = s.focus === 'a' ? 'b' : 'a';
    const html = s.shots?.[otherSide] || '';
    if (other.dataset.side !== otherSide || other._html !== html) { other.innerHTML = `<div class="ngsp-shot">${html}</div>`; other._html = html; other.dataset.side = otherSide; }
    scr.style.setProperty('--sp-split', `calc(${dpOf(s.pos).toFixed(3)} * var(--dp))`);
    scr.classList.add('split'); scr.classList.toggle('split-a', s.focus === 'a'); scr.classList.toggle('split-b', s.focus === 'b'); scr.classList.toggle('split-min', min);
    // Entering: the app shrinks from the whole screen to the top half (long_press_dock_anim_duration 250 ms).
    if (s.enter) { s.enter = false; place(c, SH - NAV); requestAnimationFrame(() => requestAnimationFrame(() => place(c, s.pos, 250))); }
    else place(c, min ? MINIMIZED : s.pos);
  }

  NG.split = {
    after, dock, end, focus, dockable,
    active: c => !!st(c),
    docked: c => st(c)?.a.view || '',
    // The bottom window's rect in display pixels (Overview lays its stack out in it).
    window: c => live(c) && st(c).focus === 'b' && c.ui.view === 'recents' ? {top: st(c).pos + DIV, bottom: SH} : null,
    // The status bar lies over the docked app.
    statusColor: c => live(c) && st(c).focus === 'b' ? (NG.module(st(c).a.view)?.statusColor?.(c) || '#000') : null,
    // Overview held: dock the app in front, or undock (the docked app takes the screen).
    toggle(c) {
      if (c.ui.view === 'lock') return;
      if (st(c)) {
        const s = st(c); if (s.minimized) { end(c, 'a'); return; }
        place(c, 2392, 336); setTimeout(() => end(c, 'a'), 436); return;
      }
      if (!isApp(c, c.ui.view)) return;
      if (!dockable(c.ui.view)) { c.toast(T().t('recents_incompatible_app_message')); return; }
      dock(c, c.ui.view, c.ui.sub, c.el.viewport.innerHTML);
    },
    // Home with a split: the launcher below, the docked app minimized.
    home(c) {
      const s = st(c); if (!s || !live(c)) return false;
      if (s.focus === 'a') { capture(c); s.a = {view: c.ui.view, sub: c.ui.sub}; s.focus = 'b'; }
      c.ui.view = 'home'; c.ui.sub = ''; c.ui.overlay = ''; c.ui.history = [];
      NG.module('home')?.reset?.(c); c.render(); return true;
    },
    // An app opened from the minimized launcher restores the split below the docked app.
    opened(c, view) {
      const s = st(c); if (!s || !live(c)) return;
      if (s.focus === 'b' && view !== 'home' && view !== 'recents') { if (!dockable(view)) { c.toast(T().t('dock_non_resizeble_failed_to_dock_text')); c.ui.split = null; return; } toastFor(c, view); }
    },
    // Overview while the docked app is the live side: Overview opens below it.
    recents(c) {
      const s = st(c); if (!s || !live(c) || s.focus !== 'a') return false;
      capture(c); s.a = {view: c.ui.view, sub: c.ui.sub}; s.focus = 'b';
      c.ui.history = []; c.ui.recentsState = null; c.ui.view = 'recents'; c.ui.sub = ''; c.ui.overlay = ''; c.render(); return true;
    },
    // Back with nothing left on the docked side ends the split: the other side takes the screen.
    backEmpty(c) { const s = st(c); if (!s || !live(c)) return false; if (s.focus === 'a') { end(c, 'b'); return true; } if (c.ui.view !== 'home') { c.ui.history = []; NG.split.home(c); return true; } return false; }
  };
})();
