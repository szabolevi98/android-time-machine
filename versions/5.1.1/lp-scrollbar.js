/* Lollipop's scrollbar (View.onDrawScrollBars with the framework's scrollbar_handle_material, android-5.1.1_r26 and
   the shamu image): while a view scrolls, a 4 dp bar of #84ffffff tinted with the theme's colorControlNormal (54 %
   black on light screens, 70 % white on dark ones) runs down its right edge, as long as the shown part of the content
   (at least twice its width); it stays 300 ms after the last move (ViewConfiguration.SCROLL_BAR_DEFAULT_DELAY) and fades
   out in 250 ms (SCROLL_BAR_FADE_DURATION). The page's own scrollbars are hidden (lp-scrollbar.css). Sizes are CSS px:
   1 dp is the screen's width / 411.43. */
(() => {
  'use strict';
  const DP = screen => (screen.clientWidth || 373) / 411.43;
  function darkBehind(el, screen) {
    for (let node = el; node && node !== screen; node = node.parentElement) {
      const m = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
      if (m && (m[3] === undefined || +m[3] > .5)) return .299 * m[0] + .587 * m[1] + .114 * m[2] < 128;
    }
    return true;
  }
  function attach(screen) {
    const layer = document.createElement('div');
    layer.className = 'lp-scrollbars'; layer.setAttribute('aria-hidden', 'true');
    screen.append(layer);
    const bars = new WeakMap();
    screen.addEventListener('scroll', event => {
      const el = event.target;
      if (!(el instanceof Element) || !screen.contains(el) || el.scrollHeight <= el.clientHeight + 1) return;
      if (!layer.isConnected) screen.append(layer);
      let bar = bars.get(el);
      if (!bar || !bar.isConnected) { bar = document.createElement('i'); bar.className = 'lp-scrollbar'; layer.append(bar); bars.set(el, bar); }
      const box = screen.getBoundingClientRect(), r = el.getBoundingClientRect(), w = 4 * DP(screen);
      const len = Math.max(2 * w, r.height * el.clientHeight / el.scrollHeight), top = (r.height - len) * el.scrollTop / (el.scrollHeight - el.clientHeight);
      Object.assign(bar.style, {left: `${r.right - box.left - w}px`, top: `${r.top - box.top + top}px`, width: `${w}px`, height: `${len}px`, background: darkBehind(el, screen) ? 'rgba(255,255,255,.364)' : 'rgba(0,0,0,.284)'});
      bar.classList.add('on');
      clearTimeout(bar.timer);
      bar.timer = setTimeout(() => { bar.classList.remove('on'); setTimeout(() => { if (!bar.classList.contains('on')) { bar.remove(); bars.delete(el); } }, 300); }, 300);
    }, true);
  }
  const start = () => { const screen = document.querySelector('#screen'); if (screen) attach(screen); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
