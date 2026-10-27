/* SystemUI Nyandroid and the PlatLogoActivity zoom from Android 4.0.4 (Nyandroid.java, PlatLogoActivity.java). */
(() => {
  'use strict';
  const NUM_CATS = 20, NUM_STARS = 20, VMIN = 100, VMAX = 1000;
  // drawable-nodpi bitmaps are device pixels on the xhdpi Galaxy Nexus; CSS pixels are roughly half of that.
  const DEVICE = .5, CAT = 320 * DEVICE, STAR = 70 * DEVICE;
  const lerp = (a, b, f) => (b - a) * f + a, range = (random, a, b) => lerp(a, b, random());
  // PlatLogoActivity.mSuperLongPress: 2 x long-press timeout, then every timeout, scale 1 + 0.25 n^2; the fourth step launches.
  const LONG_PRESS = 500, zoomScale = count => 1 + .25 * count * count;

  function cat(index, board, random) {
    const z = (index / NUM_CATS) ** 2, item = {z};
    reset(item, board, random);
    item.x = range(random, 0, board.width);
    return item;
  }
  // FlyingCat.reset: scale 0.1-2 and speed 100-1000 px/s by depth, entering at the left edge at a random height.
  function reset(item, board, random) {
    item.scale = lerp(.1, 2, item.z);
    item.x = -item.scale * CAT + 1;
    item.y = range(random, 0, board.height - item.scale * CAT);
    item.v = lerp(VMIN, VMAX, item.z) * DEVICE;
  }
  function step(items, board, dt, random) {
    for (const item of items) {
      item.x += item.v * dt;
      const size = CAT * item.scale;
      if (item.x + size < -2 || item.x > board.width + 2 || item.y + size < -2 || item.y > board.height + 2) reset(item, board, random);
    }
  }

  function start(root, random = Math.random) {
    const board = {width: root.clientWidth, height: root.clientHeight};
    const cats = Array.from({length: NUM_CATS}, (_, i) => cat(i, board, random));
    // star_anim's six 200 ms frames. Drive these with the scene, so disabling CSS window animations cannot
    // leave every particle on transparent star0. Reduced motion retains the visible middle frame.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const phases = Array.from({length: NUM_STARS}, () => range(random, 0, 1200));
    const stars = phases.map(() => `<span class="nyan-star" style="transform:translate(${range(random, 0, board.width)}px,${range(random, 0, board.height)}px) scale(${range(random, .1, 1)})"></span>`).join('');
    root.innerHTML = stars + cats.map(() => `<span class="nyan-cat" style="animation-delay:${Math.round(range(random, 0, 1000))}ms"></span>`).join('');
    const nodes = [...root.querySelectorAll('.nyan-cat')];
    const starNodes = [...root.querySelectorAll('.nyan-star')], began = performance.now();
    let last = performance.now(), frame = 0, running = true;
    const paint = (now = began) => {
      cats.forEach((item, i) => { nodes[i].style.transform = `translate(${item.x}px,${item.y}px) scale(${item.scale})`; });
      starNodes.forEach((node, i) => { const f = reduced ? 3 : Math.floor((now - began + phases[i]) / 200) % 6; if (node.dataset.frame !== String(f)) { node.dataset.frame = f; node.style.backgroundImage = `url('assets/star${f}.png')`; } });
    };
    const tick = now => {
      if (!running) return;
      board.width = root.clientWidth || board.width; board.height = root.clientHeight || board.height;
      step(cats, board, Math.min(.1, Math.max(0, (now - last) / 1000)), random); last = now; paint(now);
      frame = requestAnimationFrame(tick);
    };
    paint(); frame = requestAnimationFrame(tick);
    return {cats, stop() { running = false; cancelAnimationFrame(frame); }};
  }
  window.ICSNyandroid = {NUM_CATS, NUM_STARS, CAT, STAR, LONG_PRESS, zoomScale, cat, reset, step, start};
})();
