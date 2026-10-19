/* Eclair's scrollbar (View.onDrawScrollBars and ScrollBarDrawable, ERE27, the passion image): while a view scrolls,
   the theme's scrollbarThumbVertical (scrollbar_handle_vertical, a grey nine-patch on every theme) runs down its right edge, scrollbarSize (10 dp) wide and as long as the shown
   part of the content (at least twice its width); it stays 300 ms after the last move (scrollbarDefaultDelayBeforeFade)
   and fades out in 250 ms (scrollbarFadeDuration). The page's own scrollbars are hidden (ec-scrollbar.css). */
(() => {
  'use strict';
  function attach(screen) {
    const layer = document.createElement('div');
    layer.className = 'ec-scrollbars'; layer.setAttribute('aria-hidden', 'true');
    screen.append(layer);
    const bars = new WeakMap();
    screen.addEventListener('scroll', event => {
      const el = event.target;
      if (!(el instanceof Element) || !screen.contains(el) || el.scrollHeight <= el.clientHeight + 1) return;
      if (!layer.isConnected) screen.append(layer);
      let bar = bars.get(el);
      if (!bar || !bar.isConnected) { bar = document.createElement('i'); bar.className = 'ec-scrollbar'; layer.append(bar); bars.set(el, bar); }
      const box = screen.getBoundingClientRect(), r = el.getBoundingClientRect(), w = bar.offsetWidth;
      const len = Math.max(2 * w, r.height * el.clientHeight / el.scrollHeight), top = (r.height - len) * el.scrollTop / (el.scrollHeight - el.clientHeight);
      Object.assign(bar.style, {left: `${r.right - box.left - w}px`, top: `${r.top - box.top + top}px`, height: `${len}px`});
      bar.classList.add('on');
      clearTimeout(bar.timer);
      bar.timer = setTimeout(() => { bar.classList.remove('on'); setTimeout(() => { if (!bar.classList.contains('on')) { bar.remove(); bars.delete(el); } }, 300); }, 300);
    }, true);
  }
  const start = () => { const screen = document.querySelector('#screen'); if (screen) attach(screen); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
