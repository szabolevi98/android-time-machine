/* Android 4.4 KitKat easter egg.
   PlatLogoActivity (core/java/com/android/internal/app, android-4.4.4_r1): a #C0000000 window over the wallpaper with
   the first letter of Build.ID ("K", 300 sp bold white). A tap spins it a full turn either way (700 ms, decelerate);
   six taps or a long press bring in the #ed1d24 panel (scaleX from 0.01, 500 ms delay), spin the letter away (1 s,
   accelerate), grow platlogo (0.5 -> 1, anticipate-overshoot, 1 s after 500 ms) and fade in "ANDROID 4.4.4"
   (30 sp light caps, 40 dp from the bottom). A long press on the logo opens the Dessert Case.
   DessertCaseView (SystemUI): 192 dp cells drawn at 0.25 scale fill the screen with tiles of a random hue
   (12 steps, s 1, v .85) carrying a white dessert mask (50 % rare, 20 % KitKat / Android, rarer ones below), at 1 to
   4 cells across (33 / 10 / 1 %), turned by a quarter turn; a random tile moves every 2 s after 5 s, and a tap
   moves the tile tapped. Placement animates for 500 ms (anticipate-overshoot scale, decelerate move). */
(() => {
  'use strict';
  const DP = () => (globalThis.document?.querySelector?.('#screen')?.clientWidth || 326.16) / 360;  // 1 dp in CSS px now (360 dp across)
  const PASTRIES = ['kitkat', 'android'];
  const RARE = ['cupcake', 'donut', 'eclair', 'froyo', 'gingerbread', 'honeycomb', 'ics', 'jellybean'];
  const XRARE = ['petitfour', 'donutburger', 'flan', 'keylimepie'];
  const XXRARE = ['zombiegingerbread', 'dandroid', 'jandycane'];
  const START_DELAY = 5000, DELAY = 2000, DURATION = 500;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const irand = (min, max) => Math.floor(min + Math.random() * (max - min));
  const anticipateOvershoot = 'cubic-bezier(.68,-.55,.265,1.55)';
  const decelerate = 'cubic-bezier(0,0,.2,1)', accelerate = 'cubic-bezier(.4,0,1,1)';

  function platLogo(root, {release = '4.4.4', letter = 'K', onDessert, reduced = false} = {}) {
    root.innerHTML = `<div class="kk-egg-bg"></div><div class="kk-egg-letter">${letter}</div><img draggable="false" class="kk-egg-logo" src="assets/kk-platlogo.png" alt="Android KitKat" hidden><div class="kk-egg-version" hidden>Android ${release}</div>`;
    const bg = root.querySelector('.kk-egg-bg'), k = root.querySelector('.kk-egg-letter'), logo = root.querySelector('.kk-egg-logo'), tv = root.querySelector('.kk-egg-version');
    let clicks = 0, rotation = 0, pressTimer = 0, longPressed = false, revealed = false;
    const spin = () => {
      const from = rotation, offset = from % 360;
      rotation = from + (Math.random() > .5 ? 360 : -360) - offset;
      k.getAnimations().forEach(a => a.cancel());
      k.animate([{transform: `rotate(${from}deg)`}, {transform: `rotate(${rotation}deg)`}], {duration: 700, easing: decelerate, fill: 'forwards'});
    };
    function reveal() {
      if (revealed) return false;
      revealed = true;
      // The egg's own interactions retain their native durations, including reduced-motion mode.
      bg.animate([{opacity: 0, transform: 'scaleX(.01)'}, {opacity: 1, transform: 'scaleX(1)'}], {duration: 300, delay: 500, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both'});
      k.animate([{opacity: 1, transform: `rotate(${rotation}deg) scale(1)`}, {opacity: 0, transform: `rotate(${rotation + 360}deg) scale(.5)`}], {duration: 1000, easing: accelerate, fill: 'forwards'});
      logo.hidden = false;
      logo.animate([{opacity: 0, transform: 'scale(.5)'}, {opacity: 1, transform: 'scale(1)'}], {duration: 1000, delay: 500, easing: reduced ? decelerate : anticipateOvershoot, fill: 'both'});
      tv.hidden = false;
      tv.animate([{opacity: 0}, {opacity: 1}], {duration: 1000, delay: 1000, fill: 'both'});
      return true;
    }
    const down = event => {
      longPressed = false;
      clearTimeout(pressTimer);
      const onLogo = revealed && event.target === logo;
      pressTimer = setTimeout(() => {
        longPressed = true;
        if (onLogo) onDessert?.(); else reveal();
      }, 500);
    };
    const cancel = () => clearTimeout(pressTimer);
    const click = () => {
      if (longPressed) { longPressed = false; return; }
      if (revealed) return;
      clicks++;
      if (clicks >= 6) { reveal(); return; }
      spin();
    };
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointerup', cancel); root.addEventListener('pointercancel', cancel); root.addEventListener('pointerleave', cancel);
    root.addEventListener('click', click);
    return {root, reveal, destroy() { clearTimeout(pressTimer); root.removeEventListener('pointerdown', down); root.removeEventListener('click', click); }};
  }

  function dessertCase(root, {reduced = false, random = Math.random} = {}) {
    const cell = 192 * DP() * .25;
    const width = root.clientWidth || 326.25, height = root.clientHeight || 580;
    const columns = Math.max(1, Math.floor(width / cell)), rows = Math.max(1, Math.floor(height / cell));
    const grid = document.createElement('div');
    grid.className = 'kk-dessert-grid';
    grid.style.width = `${columns * cell}px`; grid.style.height = `${rows * cell}px`;
    root.replaceChildren(grid);
    const cells = new Array(rows * columns).fill(null), free = new Set();
    let started = false, timer = 0, startTimer = 0;
    for (let j = 0; j < rows; j++) for (let i = 0; i < columns; i++) free.add(j * columns + i);
    const color = () => `hsl(${irand(0, 12) * 30} 100% 42.5%)`;
    const occupied = tile => { const out = []; for (let j = 0; j < tile.span; j++) for (let i = 0; i < tile.span; i++) out.push((tile.y + j) * columns + tile.x + i); return out; };
    function place(tile, x, y, animate) {
      const rnd = random();
      if (tile.placed) occupied(tile).forEach(index => { free.add(index); cells[index] = null; });
      let span = 1;
      if (rnd < .01) { if (!(x >= columns - 3 || y >= rows - 3)) span = 4; }
      else if (rnd < .1) { if (!(x >= columns - 2 || y >= rows - 2)) span = 3; }
      else if (rnd < .33) { if (!(x === columns - 1 || y === rows - 1)) span = 2; }
      Object.assign(tile, {x, y, span, placed: true});
      const squatters = new Set(occupied(tile).map(index => cells[index]).filter(Boolean));
      squatters.forEach(other => {
        occupied(other).forEach(index => { free.add(index); cells[index] = null; });
        if (other === tile) return;
        other.placed = false;
        if (animate && !reduced) other.node.animate([{opacity: 1, transform: other.node.style.transform}, {opacity: 0, transform: `${other.node.style.transform} scale(.5)`}], {duration: DURATION, easing: accelerate, fill: 'forwards'}).finished.then(() => other.node.remove(), () => other.node.remove());
        else other.node.remove();
      });
      occupied(tile).forEach(index => { cells[index] = tile; free.delete(index); });
      const rot = irand(0, 4) * 90;
      const transform = `translate(${x * cell + (span - 1) * cell / 2}px,${y * cell + (span - 1) * cell / 2}px) rotate(${rot}deg) scale(${span})`;
      // Tile motion is the game itself. Reduced window motion removes the overshoot, not the game animation.
      if (animate) {
        grid.append(tile.node);
        tile.node.animate([{transform: tile.node.style.transform || transform}, {transform}], {duration: DURATION, easing: reduced ? decelerate : anticipateOvershoot});
      }
      tile.node.style.transform = transform;
    }
    function fill(duration = DURATION) {
      while (free.size) {
        const index = free.values().next().value;
        free.delete(index);
        if (cells[index]) continue;
        const node = document.createElement('button');
        node.type = 'button'; node.className = 'kk-dessert-tile'; node.tabIndex = -1;
        node.style.width = node.style.height = `${cell}px`; node.style.background = color();
        const which = random();
        const name = which < .0005 ? pick(XXRARE) : which < .005 ? pick(XRARE) : which < .5 ? pick(RARE) : which < .7 ? pick(PASTRIES) : '';
        if (name) node.innerHTML = `<img src="assets/kk-dessert_${name}.png" alt="">`;
        node.dataset.dessert = name;
        const tile = {node};
        node.addEventListener('click', () => { place(tile, irand(0, columns), irand(0, rows), true); setTimeout(() => fill(), DURATION / 2); });
        grid.append(node);
        place(tile, index % columns, Math.floor(index / columns), false);
        if (duration > 0 && !reduced) node.animate([{opacity: 0, transform: `${node.style.transform} scale(.5)`}, {opacity: 1, transform: node.style.transform}], {duration, easing: 'linear'});
      }
    }
    const juggle = () => {
      if (!root.isConnected) { stop(); return; }
      const tiles = [...grid.children];
      const node = tiles[Math.floor(random() * tiles.length)];
      const tile = cells.find(item => item?.node === node);
      if (tile) place(tile, irand(0, columns), irand(0, rows), true);
      fill();
      if (started) timer = setTimeout(juggle, DELAY);
    };
    function start() { if (!started) { started = true; fill(DURATION * 4); } clearTimeout(timer); timer = setTimeout(juggle, START_DELAY); }
    function stop() { started = false; clearTimeout(timer); clearTimeout(startTimer); }
    startTimer = setTimeout(start, 1000); // DessertCase.onResume posts start() after a second
    return {root, start, stop, columns, rows, cells, tiles: () => grid.children.length};
  }

  window.KKEgg = {platLogo, dessertCase, PASTRIES, RARE, XRARE, XXRARE};
})();
