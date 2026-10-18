/* Android 6.0.1 touch feedback: RippleDrawable as android-6.0.1_r81 draws it (RippleForeground, RippleBackground).
   - The colour is the theme's colorControlHighlight: #1f000000 on light surfaces, #33ffffff on dark ones.
   - Pressed, the background highlight fades in over 600 ms (linear, from its current opacity); released, it finishes
     that in at most 120 ms and fades out in 480 ms.
   - A bounded ripple (a row or a button: ?attr/selectableItemBackground has a mask layer) has no enter wave: on release
     a circle of MAX_BOUNDED_RADIUS 350 px (x 0.9-1.0, random) grows from the touch over 800 ms with the
     LogDecelerateInterpolator (400, 1.4), its centre moving 30 % towards the middle over 300 ms, fading out in 400 ms;
     the ripple is clipped to the control.
   - A borderless ripple (an icon button: selectableItemBackgroundBorderless) grows while pressed: 80 ms after the
     touch, to the corners of the control in sqrt(r / 1024 x density) s, its opacity up in 120 ms; released it finishes
     at 1024 + 3400 px/s^2 and fades in 1000 x opacity / 3 ms.
   Launcher icons and widgets, the keyguard, the navigation keys (KeyButtonRipple, mm-statusbar.js), Overview's cards,
   sliders and text fields have their own feedback. A control that already darkens itself when pressed (:active) only
   gets the wave. */
(() => {
  'use strict';
  const DP = () => { const s = document.querySelector('#screen'); return s?.clientWidth ? s.clientWidth / 411.43 : .833; };
  const DENSITY = 2.625, PX = () => DP() / DENSITY;   // CSS px per device px
  const TARGETS = 'button, [role="button"], a[href], [data-action], label';
  const SKIP = '.mmh-fscrim, .mmh-cling, .mmh-icon, .mmh-widget, .mmh-wcell, .mmh-qsb, .mmd-app, .mmwg-cell, .mmlk, .mmbo-key, #status-bar, #nav-bar, .mmrc-task, .mmrc, .mmqs-slider, .mmime, .mmh-fname, .mmsh-scrim, .mmmenu-out, .mmdlg-dim, .no-ripple, [disabled], [aria-disabled="true"], .mm-leaving, .mm-overlay-ghost, input, textarea, select';
  const log = t => (1 - Math.pow(400, -t / 1.4)) / (1 - Math.pow(400, -1 / 1.4));
  let layer = null, active = null;
  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  function host(screen) {
    if (layer?.isConnected) return layer;
    layer = document.createElement('div'); layer.className = 'mmrp-layer'; layer.setAttribute('aria-hidden', 'true');
    screen.append(layer); return layer;
  }
  function luminance(color) {
    const m = color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?/);
    if (!m || (m[4] !== undefined && Number(m[4]) < .5)) return null;
    return (.2126 * m[1] + .7152 * m[2] + .0722 * m[3]) / 255;
  }
  function onDark(el, screen) {
    for (let node = el; node && node !== screen.parentNode; node = node.parentElement) {
      const style = getComputedStyle(node), value = luminance(style.backgroundColor);
      if (value !== null) return value < .5;
      if (style.backgroundImage !== 'none' && node !== el) return true;
    }
    return true;
  }
  function borderless(el, rect) {
    if (rect.width > 64 * DP() || rect.height > 64 * DP()) return false;
    if (el.textContent.trim()) return false;
    return luminance(getComputedStyle(el).backgroundColor) === null;
  }
  // The stylesheets' :active rules that set a background, as selectors without :active (read once).
  let activeSels = null;
  function ownPressed(el) {
    if (!activeSels) {
      activeSels = [];
      for (const sheet of document.styleSheets) {
        let rules; try { rules = sheet.cssRules; } catch { continue; }
        for (const r of rules || []) if (r.selectorText?.includes(':active') && /background/.test(r.style?.cssText || '')) activeSels.push(...r.selectorText.split(',').filter(x => x.includes(':active')).map(x => x.replace(/:active/g, '').trim() || '*'));
      }
    }
    return activeSels.some(sel => { try { return el.matches(sel); } catch { return false; } });
  }
  function press(el, event, screen) {
    const box = screen.getBoundingClientRect(), rect = el.getBoundingClientRect();
    if (rect.width < 4 || rect.height < 4) return null;
    // Scrims and other screen-sized touch areas (a folder's, a dialog's outside) have no ripple.
    if (rect.width >= box.width * .9 && rect.height >= box.height * .5) return null;
    const free = borderless(el, rect), dark = onDark(el, screen), node = document.createElement('div');
    const w = rect.width, h = rect.height;
    node.className = `mmrp${free ? ' free' : ''}${dark ? ' dark' : ''}`;
    Object.assign(node.style, {left: `${rect.left - box.left}px`, top: `${rect.top - box.top}px`, width: `${w}px`, height: `${h}px`, borderRadius: free ? '0' : getComputedStyle(el).borderRadius});
    const bg = document.createElement('b'), wave = document.createElement('i');
    node.append(bg, wave); host(screen).append(node);
    const x0 = Math.max(0, Math.min(w, event.clientX - rect.left)), y0 = Math.max(0, Math.min(h, event.clientY - rect.top));
    const start = performance.now();
    // A control with its own pressed background keeps it; only the wave is drawn over it.
    if (ownPressed(el)) bg.remove();
    if (free) Object.assign(bg.style, {inset: 'auto', width: `${Math.hypot(w, h)}px`, height: `${Math.hypot(w, h)}px`, left: `${w / 2 - Math.hypot(w, h) / 2}px`, top: `${h / 2 - Math.hypot(w, h) / 2}px`, borderRadius: '50%'});
    const background = bg.animate([{opacity: 0}, {opacity: 1}], {duration: 600, easing: 'linear', fill: 'forwards'});
    const R = free ? Math.hypot(w, h) / 2 : 350 * (.9 + Math.random() * .1) * PX();
    Object.assign(wave.style, {width: `${2 * R}px`, height: `${2 * R}px`, left: `${-R}px`, top: `${-R}px`});
    const place = (cx, cy, r) => `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px) scale(${(r / R).toFixed(4)})`;
    let enter = null;
    if (free) {
      const grow = 1000 * Math.sqrt(R / PX() / 1024 * DENSITY);
      enter = wave.animate([{transform: place(x0, y0, 0)}, {transform: place(w / 2, h / 2, R)}], {duration: grow, delay: 80, easing: 'linear', fill: 'forwards'});
      wave.animate([{opacity: 0}, {opacity: 1}], {duration: 120, easing: 'linear', fill: 'forwards'});
    }
    return {node, release() {
      const elapsed = performance.now() - start, op = Math.min(1, elapsed / 600);
      background.cancel();
      const fast = Math.round((1 - op) * 120);
      bg.animate([{opacity: op}, {opacity: 1, offset: fast / (fast + 480) || 0}, {opacity: 0}], {duration: fast + 480, easing: 'linear', fill: 'forwards'});
      let done;
      if (free) {
        const p = enter ? Math.max(0, Math.min(1, (elapsed - 80) / (enter.effect.getTiming().duration || 1))) : 0;
        enter?.cancel();
        const cx = x0 + (w / 2 - x0) * p, cy = y0 + (h / 2 - y0) * p, r = R * p;
        const remaining = (R - r) / PX(), finish = Math.max(1, 1000 * Math.sqrt(remaining / (3400 + 1024) * DENSITY));
        const opacity = Math.min(1, elapsed / 120);
        wave.getAnimations().forEach(a => a.cancel());
        const steps = Array.from({length: 11}, (_, i) => { const k = log(i / 10); return {transform: place(cx + (w / 2 - cx) * k, cy + (h / 2 - cy) * k, r + (R - r) * k), offset: i / 10}; });
        wave.animate(steps, {duration: finish, fill: 'forwards'});
        done = wave.animate([{opacity}, {opacity: 0}], {duration: Math.max(1, 1000 * opacity / 3), easing: 'linear', fill: 'forwards'});
      } else {
        // Bounded: the wave plays on release, its centre going 30 % of the way to the middle.
        const tx = x0 + (w / 2 - x0) * .3, ty = y0 + (h / 2 - y0) * .3;
        const steps = Array.from({length: 21}, (_, i) => { const k = log(i / 20), o = log(Math.min(1, i / 20 * 800 / 300)); return {transform: place(x0 + (tx - x0) * o, y0 + (ty - y0) * o, R * k), offset: i / 20}; });
        wave.animate(steps, {duration: 800, fill: 'forwards'});
        done = wave.animate([{opacity: 1}, {opacity: 0}], {duration: 400, easing: 'linear', fill: 'forwards'});
      }
      done.finished.then(() => setTimeout(() => node.remove(), Math.max(0, fast + 480 - 333)), () => node.remove());
    }};
  }
  function release() { if (active) { const ripple = active; active = null; ripple.release(); } }
  function attach(screen) {
    screen.addEventListener('pointerdown', event => {
      release();
      if (event.button > 0 || reduced()) return;
      const el = event.target.closest?.(TARGETS);
      if (!el || !screen.contains(el) || el.closest(SKIP)) return;
      const ripple = press(el, event, screen);
      if (ripple) active = {...ripple, x: event.clientX, y: event.clientY, id: event.pointerId};
    }, true);
    window.addEventListener('pointermove', event => { if (active && event.pointerId === active.id && Math.hypot(event.clientX - active.x, event.clientY - active.y) > 8 * DP()) { const r = active; active = null; r.node.remove(); } }, true);
    for (const type of ['pointerup', 'pointercancel', 'blur']) window.addEventListener(type, release, true);
  }
  MM.register('ripple', {app: false, init(c) { attach(c.el.screen); }, render: () => ''});
})();
