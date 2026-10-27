/* SystemUI Nyandroid and the PlatLogoActivity zoom from Android 4.0.4 (Nyandroid.java, PlatLogoActivity.java). */
(() => {
  'use strict';
  const NUM_CATS = 20, NUM_STARS = 20, VMIN = 100, VMAX = 1000;
  // drawable-nodpi bitmaps are device pixels on the xhdpi Galaxy Nexus; CSS pixels are roughly half of that.
  const DEVICE = .5, CAT = 320 * DEVICE, STAR = 70 * DEVICE;
  const lerp = (a, b, f) => (b - a) * f + a, range = (random, a, b) => lerp(a, b, random());
  // PlatLogoActivity.mSuperLongPress: 2 x long-press timeout, then every timeout, scale 1 + 0.25 n^2; the fourth step launches.
  const LONG_PRESS = 500, zoomScale = count => 1 + .25 * count * count;
  const droidFrame = ms => Math.floor(Math.max(0, ms) / 80) % 12;
  const starFrame = ms => Math.floor(Math.max(0, ms) / 200) % 6;
  // Keep resource names explicit: asset audits must see every frame, including ones not initially on screen.
  const DROID_IMAGES = [
    'assets/nyandroid00.png', 'assets/nyandroid01.png', 'assets/nyandroid02.png', 'assets/nyandroid03.png',
    'assets/nyandroid04.png', 'assets/nyandroid05.png', 'assets/nyandroid06.png', 'assets/nyandroid07.png',
    'assets/nyandroid08.png', 'assets/nyandroid09.png', 'assets/nyandroid10.png', 'assets/nyandroid11.png'
  ];
  const STAR_IMAGES = ['assets/star0.png', 'assets/star1.png', 'assets/star2.png', 'assets/star3.png', 'assets/star4.png', 'assets/star5.png'];
  let pictures;
  const preload = () => pictures ||= Promise.all([...DROID_IMAGES, ...STAR_IMAGES].map(async source => {
    const image = new Image(); image.src = source; await image.decode().catch(() => {}); return image;
  }));

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
    // The scene's AnimationDrawables are content, not window transitions: both keep playing with reduced motion.
    // Nyandroid.java starts each drawable after a random 0-1000 ms delay; the XMLs use 80/200 ms per frame.
    const starDelays = Array.from({length: NUM_STARS}, () => range(random, 0, 1000));
    const droidDelays = cats.map(() => range(random, 0, 1000));
    const stars = starDelays.map(() => `<span class="nyan-star" style="transform:translate(${range(random, 0, board.width)}px,${range(random, 0, board.height)}px) scale(${range(random, .1, 1)})"></span>`).join('');
    root.innerHTML = stars + cats.map(() => '<span class="nyan-cat"></span>').join('');
    const nodes = [...root.querySelectorAll('.nyan-cat')];
    const starNodes = [...root.querySelectorAll('.nyan-star')];
    let began = 0, last = 0, frame = 0, running = true;
    const bitmap = (node, images, f) => { if (node.dataset.frame !== String(f)) { node.dataset.frame = f; node.style.backgroundImage = `url('${images[f]}')`; } };
    const position = () => cats.forEach((item, i) => { nodes[i].style.transform = `translate(${item.x}px,${item.y}px) scale(${item.scale})`; });
    const paint = now => {
      position();
      nodes.forEach((node, i) => bitmap(node, DROID_IMAGES, droidFrame(now - began - droidDelays[i])));
      starNodes.forEach((node, i) => bitmap(node, STAR_IMAGES, starFrame(now - began - starDelays[i])));
    };
    const tick = now => {
      if (!running) return;
      board.width = root.clientWidth || board.width; board.height = root.clientHeight || board.height;
      step(cats, board, Math.min(.1, Math.max(0, (now - last) / 1000)), random); last = now; paint(now);
      frame = requestAnimationFrame(tick);
    };
    position();
    const ready = preload().then(() => { if (!running) return; began = last = performance.now(); paint(began); frame = requestAnimationFrame(tick); });
    return {cats, ready, stop() { running = false; cancelAnimationFrame(frame); }};
  }
  window.ICSNyandroid = {NUM_CATS, NUM_STARS, CAT, STAR, LONG_PRESS, zoomScale, droidFrame, starFrame, cat, reset, step, start};
})();
