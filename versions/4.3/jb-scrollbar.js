/* Jelly Bean's scrollbar (View.onDrawScrollBars and ScrollBarDrawable, android-4.3_r1.1, the mako image): while a view scrolls,
   the theme's scrollbarThumbVertical (scrollbar_handle_holo_dark on Theme.Holo, scrollbar_handle_holo_light on Theme.Holo.Light), runs down its right edge, scrollbarSize (10 dp) wide and as long as the shown
   part of the content (at least twice its width); it stays 300 ms after the last move (scrollbarDefaultDelayBeforeFade)
   and fades out in 250 ms (scrollbarFadeDuration). The page's own scrollbars are hidden (jb-scrollbar.css). */
(() => {
  'use strict';
  // Theme.Holo's handle on dark screens, Theme.Holo.Light's on light ones: the colour behind the scrolling view decides.
  function darkBehind(el, screen) {
    for (let node = el; node && node !== screen; node = node.parentElement) {
      const m = getComputedStyle(node).backgroundColor.match(/[\d.]+/g);
      if (m && (m[3] === undefined || +m[3] > .5)) return .299 * m[0] + .587 * m[1] + .114 * m[2] < 128;
    }
    return true;
  }
  function attach(screen) {
    const layer = document.createElement('div');
    layer.className = 'jb-scrollbars'; layer.setAttribute('aria-hidden', 'true');
    screen.append(layer);
    const bars = new WeakMap();
    screen.addEventListener('scroll', event => {
      const el = event.target;
      if (!(el instanceof Element) || !screen.contains(el) || el.scrollHeight <= el.clientHeight + 1) return;
      if (!layer.isConnected) screen.append(layer);
      let bar = bars.get(el);
      if (!bar || !bar.isConnected) { bar = document.createElement('i'); bar.className = 'jb-scrollbar'; layer.append(bar); bars.set(el, bar); }
      const box = screen.getBoundingClientRect(), r = el.getBoundingClientRect(), w = bar.offsetWidth;
      const len = Math.max(2 * w, r.height * el.clientHeight / el.scrollHeight), top = (r.height - len) * el.scrollTop / (el.scrollHeight - el.clientHeight);
      Object.assign(bar.style, {left: `${r.right - box.left - w}px`, top: `${r.top - box.top + top}px`, height: `${len}px`});
      bar.classList.toggle('jb-light', !darkBehind(el, screen));
      bar.classList.add('on');
      clearTimeout(bar.timer);
      bar.timer = setTimeout(() => { bar.classList.remove('on'); setTimeout(() => { if (!bar.classList.contains('on')) { bar.remove(); bars.delete(el); } }, 300); }, 300);
    }, true);
  }
  const start = () => { const screen = document.querySelector('#screen'); if (screen) attach(screen); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
