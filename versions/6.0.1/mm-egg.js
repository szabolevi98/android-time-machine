/* The Android 6.0 easter egg: the framework's PlatLogoActivity (the screen 'platlogo', from Settings › About phone's
   Android version tapped three times) and SystemUI's Marshmallow Land (com.android.systemui.egg.MLand, the screen
   'mland'), as the image's code has them. The game loop (fixed 60 steps a second, the tweens, the hull test) is the
   simulator's logic from its Lollipop Land; the rules, sizes, colours and pictures are MLand's.
   - PlatLogoActivity (Theme.Wallpaper.NoTitleBar.Fullscreen): over the wallpaper a disc min(width, height, 600 dp)
     less 100 dp wide in a random hue at saturation 0.4, its lower-left half at 0.5 (drawArc from 135° for 180°), with
     platlogo_m on it, scaling from 0.5 and fading in after 800 ms (500 ms, PathInterpolator(0, 0, 0.5, 1)), lifted
     20 dp; the first tap fades the marshmallow (platlogo) over it in 300 ms; after five taps a long press sets
     egg_mode and opens Marshmallow Land.
   - MLand (mland.xml): the sky of one of four times of day (SKIES), a mirrored world half the time, the sun or the
     moon, twenty pieces of scenery (stars at night, clouds, and buildings, cacti or mountains by the scene) moving at
     their depth's speed; up to six players (the android tinted #db4437, #3b78e7, #f4b400, #0f9d58, #7b1880, #9e9e9e)
     each holding its own column of the screen; touch to boost (scale 1.25), let go to fall (G 30, MAX_V 1000, BOOST_DV
     550 dp/s); each pair of stems passed scores one, a player that hits a stem, a marshmallow (a hit circle of a
     third of its width) or the floor stops and drifts away; when none is left the game stops. Obstacles every 380 dp
     at 100 dp/s: stems 8 dp (#bcaaa4 → #a1887f, one in a hundred white with red stripes), the 130 dp marshmallows
     (mm_head with antennae, half of them with eyes and a fifth of those with a mouth), the gap 140 dp.
   - The splash (#a0000000) with the 72 dp play button (ripplebg, the play icon), the player row at the top (minus,
     the score cards: scorecard tinted with the player's colour, 22 sp bold, white or black by the colour's luma,
     plus), the 3, 2, 1 countdown at 500 ms. */
(() => {
  'use strict';
  const EASE = 'cubic-bezier(0,0,.5,1)';
  // 1 dp in CSS px now (the 5X display is 411.43 dp across).
  const DP = () => { const s = document.querySelector('#screen'); return s?.clientWidth ? s.clientWidth / 411.43 : .833; };
  const hsb = (h, s, v) => { const f = n => { const k = (n + h * 6) % 6; return v - v * s * Math.max(0, Math.min(k, 4 - k, 1)); }; return `rgb(${[f(5), f(3), f(1)].map(x => Math.round(x * 255)).join(',')})`; };

  // ---- PlatLogoActivity ----------------------------------------------------------------------------------------------
  function platLogo(c, root) {
    const W = root.clientWidth, H = root.clientHeight, size = Math.min(Math.min(W, H), 600 * DP()) - 100 * DP();
    const hue = Math.random();
    root.innerHTML = `<button type="button" class="mmeg-logo" style="width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;--bg:${hsb(hue, .4, 1)};--fg:${hsb(hue, .5, 1)}" aria-label="Android Marshmallow"><i class="arc"></i><img class="m" src="assets/egg-platlogo_m.svg" alt=""><img class="mm" src="assets/egg-platlogo.svg" alt=""><span class="ripple"></span></button>`;
    const im = root.querySelector('.mmeg-logo'), mm = im.querySelector('.mm'), ripple = im.querySelector('.ripple');
    im.animate([{transform: 'scale(.5)', opacity: 0}, {transform: 'scale(1)', opacity: 1}], {duration: 500, delay: 800, easing: EASE, fill: 'both'});
    let taps = 0, press = null;
    im.addEventListener('pointerdown', e => {
      const b = im.getBoundingClientRect();
      ripple.style.left = `${e.clientX - b.left}px`; ripple.style.top = `${e.clientY - b.top}px`; ripple.classList.remove('off'); ripple.classList.add('on');
      press = {long: false, timer: setTimeout(() => {
        if (taps < 5) return;
        press.long = true;
        if (!c.data.settings.eggMode) { c.data.settings.eggMode = Date.now(); c.save(); }
        drop('plat'); c.back(); c.open('mland');
      }, 500)};
    });
    const up = () => { ripple.classList.add('off'); ripple.classList.remove('on'); if (press) clearTimeout(press.timer); };
    im.addEventListener('pointerup', up); im.addEventListener('pointerleave', up); im.addEventListener('pointercancel', up);
    im.addEventListener('click', () => {
      if (press?.long) return;
      if (taps === 0) mm.animate([{opacity: 0}, {opacity: 1}], {duration: 300, easing: EASE, fill: 'both'});
      taps++;
    });
  }

  // ---- MLand ---------------------------------------------------------------------------------------------------------
  const PARAMS = {TRANSLATION_PER_SEC: 100, OBSTACLE_SPACING: 380, BOOST_DV: 550, PLAYER_HIT_SIZE: 40, PLAYER_SIZE: 40, OBSTACLE_WIDTH: 130, OBSTACLE_STEM_WIDTH: 8,
    OBSTACLE_GAP: 140, OBSTACLE_MIN: 48, BUILDING_WIDTH_MIN: 50, BUILDING_WIDTH_MAX: 250, BUILDING_HEIGHT_MIN: 20, CLOUD_SIZE_MIN: 10, CLOUD_SIZE_MAX: 100, SUN_SIZE: 45,
    STAR_SIZE_MIN: 3, STAR_SIZE_MAX: 5, G: 30, MAX_V: 1000};
  const SKIES = [['#c0c0ff', '#a0a0ff'], ['#000010', '#000000'], ['#000040', '#000010'], ['#a08020', '#204080']];
  const COLORS = ['#db4437', '#3b78e7', '#f4b400', '#0f9d58', '#7b1880', '#9e9e9e'];
  const HULL = [.3, 0, .7, 0, .92, .33, .92, .75, .6, 1, .4, 1, .08, .75, .08, .33];
  const lerp = (x, a, b) => (b - a) * x + a, rlerp = (v, a, b) => (v - a) / (b - a), clamp = f => f < 0 ? 0 : f > 1 ? 1 : f;
  const frand = (a, b) => a === undefined ? Math.random() : lerp(Math.random(), a, b);
  const irand = (a, b) => Math.round(frand(a, b));
  const pick = list => list[irand(0, list.length - 1)];
  const accelDecel = x => Math.cos((x + 1) * Math.PI) / 2 + .5;
  const luma = hex => { const n = parseInt(hex.slice(1), 16); return .2126 * (n >> 16 & 255) / 255 + .7152 * (n >> 8 & 255) / 255 + .0722 * (n & 255) / 255; };

  function land(c, root) {
    const P = Object.fromEntries(Object.entries(PARAMS).map(([k, v]) => [k, Math.round(v * DP())]));
    P.OBSTACLE_PERIOD = Math.trunc(P.OBSTACLE_SPACING / P.TRANSLATION_PER_SEC);
    if (P.OBSTACLE_MIN <= P.OBSTACLE_WIDTH / 2) P.OBSTACLE_MIN = Math.trunc(P.OBSTACLE_WIDTH / 2) + 1;
    root.innerHTML = `<div class="mmeg-world"></div><div class="mmeg-welcome"><button type="button" class="mmeg-play" aria-label="Play"><img src="assets/egg-play.svg" alt=""><b></b></button></div>
      <div class="mmeg-setup"><button type="button" class="mmeg-minus" aria-label="−"><img src="assets/egg-minus.svg" alt=""></button><div class="mmeg-scores"></div><button type="button" class="mmeg-plus" aria-label="+"><img src="assets/egg-plus.svg" alt=""></button></div>`;
    const world = root.querySelector('.mmeg-world'), splash = root.querySelector('.mmeg-welcome'), scores = root.querySelector('.mmeg-scores');
    const playBtn = root.querySelector('.mmeg-play'), playText = playBtn.querySelector('b'), playImg = playBtn.querySelector('img');
    const minus = root.querySelector('.mmeg-minus'), plus = root.querySelector('.mmeg-plus');
    let W = 0, H = 0, views = [], obstacles = [], players = [], t = 0, lastPipe = 0, pipeId = 0, flipped = false, nextColor = 0, countdown = 0;
    let animating = false, playing = false, frozen = false, timeOfDay = irand(0, SKIES.length - 1), scene = irand(0, 3), raf = 0, last = 0, acc = 0, clock = 0;
    const el = (cls, w, h, parent = world) => { const node = document.createElement('div'); node.className = cls; node.style.width = `${w}px`; node.style.height = `${h}px`; parent.appendChild(node); return node; };
    const view = (node, props) => ({node, tx: 0, ty: 0, sx: 1, sy: 1, rot: 0, tweens: [], ...props});
    const draw = v => { v.node.style.transform = `translate(${v.tx}px,${v.ty}px) rotate(${v.rot}deg) scale(${v.sx},${v.sy})`; };
    const animate = (v, to, delay, duration) => { v.tweens = Object.entries(to).map(([k, val]) => ({k, from: v[k], to: val, start: clock + delay, duration})); };
    const tick = v => { v.tweens = v.tweens.filter(tw => { if (clock < tw.start) return true; const x = Math.min(1, (clock - tw.start) / tw.duration); v[tw.k] = lerp(accelDecel(x), tw.from, tw.to); return x < 1; }); };

    // Players: the android in its colour and its score card.
    function makePlayer() {
      const color = COLORS[nextColor++ % COLORS.length];
      const card = document.createElement('div'); card.className = 'mmeg-card'; card.style.background = color; card.style.color = luma(color) <= .7 ? '#fff' : '#000'; card.textContent = '0';
      scores.appendChild(card);
      return {color, card, score: 0, alive: false, boosting: false, dv: 0, corners: new Array(HULL.length).fill(0), v: null};
    }
    const setScore = (p, n) => { p.score = n; p.card.textContent = String(n); };
    function setupPlayers(n) { while (players.length > n) { const p = players.pop(); p.card.remove(); p.v?.node.remove(); } while (players.length < n) players.push(makePlayer()); updateSetup(); }
    function updateSetup() { minus.style.visibility = players.length === 1 ? 'hidden' : ''; plus.style.visibility = players.length === 6 ? 'hidden' : ''; }
    function realign() { let x = (W - (players.length - 1) * P.PLAYER_SIZE) / 2; for (const p of players) { if (p.v) p.v.tx = x - P.PLAYER_SIZE / 2; x += P.PLAYER_SIZE; } }

    function reset() {
      W = root.clientWidth; H = root.clientHeight;
      world.innerHTML = ''; views = []; obstacles = []; pipeId = 0;
      root.style.background = `linear-gradient(to top,${SKIES[timeOfDay][0]},${SKIES[timeOfDay][1]})`;
      flipped = frand() > .5; world.style.transform = flipped ? 'scaleX(-1)' : '';
      const w = P.SUN_SIZE, showingSun = (timeOfDay === 0 || timeOfDay === 3) && frand() > .25;
      if (showingSun) {
        const sun = view(el('mmeg-scenery mmeg-sun', w, w), {w, v: 0});
        if (timeOfDay === 3) sun.node.classList.add('dusk');
        sun.tx = frand(w, W - w); sun.ty = timeOfDay === 0 ? frand(w, H * .66) : frand(H * .66, H - w);
        views.push(sun);
      } else {
        const dark = timeOfDay === 1 || timeOfDay === 2, ff = frand();
        if ((dark && ff < .75) || ff < .5) {
          const moon = view(el('mmeg-scenery mmeg-moon', w, w), {w, v: 0});
          moon.node.style.opacity = dark ? 1 : .5;
          moon.sx = frand() > .5 ? -1 : 1; moon.rot = moon.sx * frand(5, 30);
          moon.tx = frand(w, W - w); moon.ty = frand(w, H - w);
          views.push(moon);
        }
      }
      const mh = Math.trunc(H / 6), cloudless = frand() < .25;
      for (let i = 0; i < 20; i++) {
        const r1 = frand(); let s;
        if (r1 < .3 && timeOfDay !== 0) {
          const size = irand(P.STAR_SIZE_MIN, P.STAR_SIZE_MAX);
          s = view(el('mmeg-scenery mmeg-star', size, size), {w: size, h: size, v: 0});
          const r = frand(); s.top = Math.trunc(r * r * H);
        } else if (r1 < .6 && !cloudless) {
          const size = irand(P.CLOUD_SIZE_MIN, P.CLOUD_SIZE_MAX);
          s = view(el(`mmeg-scenery mmeg-cloud${frand() < .01 ? ' off' : ''}`, size, size), {w: size, h: size, v: frand(.15, .5)});
          const r = frand(); s.top = Math.trunc(1 - r * r * H / 2) + Math.trunc(H / 2);
        } else {
          const z = i / 20, shade = Math.trunc(z * 255);
          let bw, bh, cls;
          if (scene === 1) { bw = bh = irand(Math.trunc(P.BUILDING_WIDTH_MAX / 4), Math.trunc(P.BUILDING_WIDTH_MAX / 2)); cls = `mmeg-cactus c${irand(1, 3)}`; }
          else if (scene === 2) { bw = bh = irand(Math.trunc(P.BUILDING_WIDTH_MAX / 2), P.BUILDING_WIDTH_MAX); cls = `mmeg-mountain m${irand(1, 3)}`; }
          else { bw = irand(P.BUILDING_WIDTH_MIN, P.BUILDING_WIDTH_MAX); bh = irand(P.BUILDING_HEIGHT_MIN, mh); cls = 'mmeg-building'; }
          s = view(el(`mmeg-scenery ${cls}`, bw, bh), {w: bw, h: bh, v: .85 * z});
          // The colour filter MULTIPLY by the depth's grey: #888888 buildings, the pictures darkened.
          if (scene === 1 || scene === 2) s.node.style.filter = `brightness(${(shade / 255).toFixed(3)})`;
          else s.node.style.background = `rgb(${[0, 0, 0].map(() => Math.trunc(136 * shade / 255)).join(',')})`;
          s.top = H - bh;
        }
        s.node.style.top = `${s.top}px`;
        s.tx = frand(-s.w, W + s.w);
        views.push(s);
      }
      for (const p of players) {
        p.v = view(el('mmeg-droid', P.PLAYER_SIZE, P.PLAYER_SIZE), {player: true});
        p.v.node.style.background = p.color; p.v.node.hidden = true;
        p.v.ty = H / 2 + Math.trunc(Math.random() * P.PLAYER_SIZE) - P.PLAYER_SIZE / 2;
        setScore(p, 0); p.boosting = false; p.dv = 0;
        views.push(p.v);
      }
      realign();
      views.forEach(draw);
    }
    function corners(p) {
      const v = p.v, inset = (P.PLAYER_SIZE - P.PLAYER_HIT_SIZE) / 2, scale = P.PLAYER_HIT_SIZE, cc = P.PLAYER_SIZE / 2;
      const a = v.rot * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
      for (let i = 0; i < HULL.length / 2; i++) {
        const x = (scale * HULL[i * 2] + inset - cc) * v.sx, y = (scale * HULL[i * 2 + 1] + inset - cc) * v.sy;
        p.corners[i * 2] = x * cos - y * sin + cc + v.tx;
        p.corners[i * 2 + 1] = x * sin + y * cos + cc + v.ty;
      }
    }
    const hitRect = o => { const cx = o.tx + o.w / 2, cy = o.ty + o.h / 2, hw = Math.abs(o.w * o.sx) / 2, hh = Math.abs(o.h * o.sy) / 2; return {left: cx - hw, right: cx + hw, top: cy - hh, bottom: cy + hh}; };
    const intersects = (o, p) => {
      for (let i = 0; i < p.corners.length / 2; i++) {
        const x = Math.trunc(p.corners[i * 2]), y = Math.trunc(p.corners[i * 2 + 1]);
        if (o.pop) { if (Math.hypot(x - o.cx, y - o.cy) <= o.r) return true; }
        else if (x >= o.rect.left && x < o.rect.right && y >= o.rect.top && y < o.rect.bottom) return true;
      }
      return false;
    };
    const cleared = (o, p) => { for (let i = 0; i < p.corners.length / 2; i++) if (o.rect.right >= Math.trunc(p.corners[i * 2])) return false; return true; };
    function stem(h, shadow) {
      const w = P.OBSTACLE_STEM_WIDTH, node = el(`mmeg-stem${frand() < .01 ? ' jandy' : ''}`, w, h);
      if (shadow) node.innerHTML = `<svg width="${w}" height="${P.OBSTACLE_WIDTH * .4 + w * 1.5}"><path d="M0 0H${w}V${P.OBSTACLE_WIDTH * .4 + w * 1.5}L0 ${P.OBSTACLE_WIDTH * .4}Z" fill="#000" fill-opacity=".133"/></svg>`;
      return view(node, {w, h, stem: true, id: pipeId});
    }
    function pop() {
      const w = P.OBSTACLE_WIDTH, node = el('mmeg-pop', w, w);
      const parts = [`assets/egg-${pick(['mm_antennae', 'mm_antennae2'])}.svg`];
      if (frand() > .5) { parts.push(`assets/egg-${pick(['mm_eyes', 'mm_eyes2'])}.svg`); if (frand() > .8) parts.push(`assets/egg-${pick(['mm_mouth1', 'mm_mouth2', 'mm_mouth3', 'mm_mouth4'])}.svg`); }
      node.innerHTML = parts.map(src => `<img src="${src}" alt="">`).join('');
      return view(node, {w, h: w, pop: true});
    }
    function step(dt) {
      t += dt; clock += dt * 1000;
      for (const v of views) {
        tick(v);
        if (v.stem || v.pop) {
          v.tx -= P.TRANSLATION_PER_SEC * dt; v.rect = hitRect(v);
          if (v.pop) { v.cx = (v.rect.left + v.rect.right) / 2; v.cy = (v.rect.top + v.rect.bottom) / 2; v.r = v.w / 3; }
        } else if (!v.player) v.tx -= P.TRANSLATION_PER_SEC * dt * v.v;
      }
      for (const p of players) {
        const v = p.v; if (!v || v.node.hidden) continue;
        if (p.alive) {
          p.dv = p.boosting ? -P.BOOST_DV : p.dv + P.G;
          p.dv = Math.max(-P.MAX_V, Math.min(P.MAX_V, p.dv));
          const y = v.ty + p.dv * dt; v.ty = y < 0 ? 0 : y;
          v.rot = lerp(clamp(rlerp(p.dv, P.MAX_V, -P.MAX_V)), 90, -90) + 90;
          corners(p);
        } else v.tx -= P.TRANSLATION_PER_SEC * dt;
      }
      if (playing) {
        let alive = 0;
        players.forEach((p, i) => {
          if (p.alive) {
            if (p.corners.some((cc, j) => j % 2 && Math.trunc(cc) >= H)) { thump(); p.alive = false; }
            let best = 0;
            for (let j = obstacles.length; j-- > 0;) {
              const o = obstacles[j];
              if (intersects(o, p)) { thump(); p.alive = false; }
              else if (cleared(o, p) && o.stem) best = Math.max(best, o.id);
            }
            if (best > p.score) setScore(p, p.score + 1);
          }
          if (p.alive) alive++;
        });
        if (!alive) stop();
      }
      views = views.filter(v => {
        if (v.stem || v.pop) { if (v.tx + v.w < 0) { v.node.remove(); obstacles = obstacles.filter(o => o !== v); return false; } }
        else if (!v.player && v.tx + v.w < 0) v.tx = W;
        return true;
      });
      if (playing && t - lastPipe > P.OBSTACLE_PERIOD) {
        lastPipe = t; pipeId++;
        const obstacley = Math.trunc(frand() * (H - 2 * P.OBSTACLE_MIN - P.OBSTACLE_GAP)) + P.OBSTACLE_MIN;
        const inset = Math.trunc((P.OBSTACLE_WIDTH - P.OBSTACLE_STEM_WIDTH) / 2), yinset = Math.trunc(P.OBSTACLE_WIDTH / 2);
        const d1 = irand(0, 250), s1 = stem(obstacley - yinset, false);
        s1.tx = W + inset; s1.ty = -s1.h - yinset; animate(s1, {ty: 0}, d1, 250);
        const p1 = pop(); p1.tx = W; p1.ty = -P.OBSTACLE_WIDTH; p1.sx = .25; p1.sy = -.25;
        animate(p1, {ty: s1.h - inset, sx: 1, sy: -1}, d1, 250);
        const d2 = irand(0, 250), s2 = stem(H - obstacley - P.OBSTACLE_GAP - yinset, true);
        s2.tx = W + inset; s2.ty = H + yinset; animate(s2, {ty: H - s2.h}, d2, 400);
        const p2 = pop(); p2.tx = W; p2.ty = H; p2.sx = .25; p2.sy = .25;
        animate(p2, {ty: H - s2.h - yinset, sx: 1, sy: 1}, d2, 400);
        const first = players.find(p => p.v)?.v.node || null;
        for (const o of [s1, p1, s2, p2]) { views.push(o); world.insertBefore(o.node, first); obstacles.push(o); o.rect = hitRect(o); }
      }
    }
    const thump = () => { if (c.data.settings.ringer !== 'silent') navigator.vibrate?.(80); };
    function frame(now) {
      if (!animating) return;
      const elapsed = Math.min(250, now - (last || now)); last = now; acc += elapsed;
      while (acc >= 1000 / 60) { acc -= 1000 / 60; step(1 / 60); if (!animating) break; }
      views.forEach(draw); players.forEach(p => p.v && draw(p.v));
      if (animating) raf = requestAnimationFrame(frame);
    }
    function showSplash() {
      splash.hidden = false; splash.animate([{opacity: 0}, {opacity: 1}], {duration: 1000, fill: 'both'});
      playImg.style.opacity = 1; playText.style.opacity = 0; playBtn.disabled = false;
    }
    function hideSplash() { splash.animate([{opacity: 1}, {opacity: 0}], {duration: 300, fill: 'both'}).onfinish = () => { splash.hidden = true; }; }
    function startPlaying() {
      playing = true; t = 0; lastPipe = t - P.OBSTACLE_PERIOD;
      hideSplash(); realign();
      for (const p of players) { p.v.node.hidden = false; p.alive = true; p.boosting = false; setScore(p, 0); boost(p); unboost(p); }
    }
    function start(startPlaying_) {
      if (startPlaying_ && countdown <= 0) {
        showSplash(); playBtn.disabled = true; playImg.style.opacity = 0; playText.style.opacity = 1;
        countdown = 3;
        const run = () => {
          if (countdown !== 0) setTimeout(run, 500); else startPlaying();
          playText.textContent = String(countdown); countdown--;
        };
        run();
      }
      for (const p of players) if (p.v) p.v.node.hidden = true;
      if (!animating) { animating = true; last = 0; acc = 0; raf = requestAnimationFrame(frame); }
    }
    function stop() {
      if (!animating) return;
      cancelAnimationFrame(raf); animating = false; playing = false;
      timeOfDay = irand(0, SKIES.length - 1); scene = irand(0, 3);
      frozen = true; for (const p of players) p.alive = false;
      setTimeout(() => { frozen = false; }, 250);
    }
    function boost(p) { p.boosting = true; p.dv = -P.BOOST_DV; p.v.tweens = []; animate(p.v, {sx: 1.25, sy: 1.25}, 0, 100); p.v.sx = p.v.sy = 1.25; p.v.node.classList.add('boost'); }
    function unboost(p) { p.boosting = false; p.v.node.classList.remove('boost'); animate(p.v, {sx: 1, sy: 1}, 0, 200); }
    function poke(i) {
      if (frozen) return;
      if (!animating) reset();
      if (!playing) { start(true); return; }
      const p = players[i]; if (p?.alive) boost(p);
    }
    function unpoke(i) { if (frozen || !animating || !playing) return; const p = players[i]; if (p) unboost(p); }
    const playerAt = x => { const b = root.getBoundingClientRect(); let i = Math.trunc(players.length * ((x - b.left) / b.width)); if (flipped) i = players.length - 1 - i; return Math.max(0, Math.min(players.length - 1, i)); };
    const pointers = new Map();
    world.parentElement.addEventListener('pointerdown', e => {
      if (e.target.closest('.mmeg-setup,.mmeg-play')) return;
      if (!splash.hidden && !playing && countdown <= 0) return;
      e.preventDefault(); const i = playerAt(e.clientX); pointers.set(e.pointerId, i); poke(i);
    });
    const release = e => { if (!pointers.has(e.pointerId)) return; unpoke(pointers.get(e.pointerId)); pointers.delete(e.pointerId); };
    root.addEventListener('pointerup', release); root.addEventListener('pointercancel', release);
    playBtn.addEventListener('click', () => { minus.style.visibility = 'hidden'; plus.style.visibility = 'hidden'; start(true); });
    minus.addEventListener('click', () => { if (players.length > 1) { setupPlayers(players.length - 1); reset(); } });
    plus.addEventListener('click', () => { if (players.length < 6) { setupPlayers(players.length + 1); reset(); } });
    const key = e => { if ([' ', 'Enter', 'ArrowUp'].includes(e.key)) { e.preventDefault(); if (e.type === 'keydown') { if (!e.repeat) poke(0); } else unpoke(0); } };
    root.tabIndex = 0; root.addEventListener('keydown', key); root.addEventListener('keyup', key);
    setupPlayers(1); reset(); start(false); updateSetup(); showSplash();
    return {stop() { cancelAnimationFrame(raf); animating = false; }};
  }

  // A screen re-drawn while it is open keeps its running activity: the element moves into the new markup.
  const keep = {};
  function mountKept(name, root, make) {
    const slot = root.querySelector(`.mmeg-${name}`);
    if (keep[name]?.el) { slot.replaceWith(keep[name].el); return; }
    keep[name] = {el: slot, game: make(slot)};
  }
  function drop(name) { keep[name]?.game?.stop?.(); delete keep[name]; }
  MM.register('platlogo', {
    app: false,
    noStatus: () => true,
    statusColor: () => 'transparent',
    render: () => '<div class="mmeg mmeg-plat"></div>',
    mount(c, root) { mountKept('plat', root, slot => { platLogo(c, slot); return null; }); },
    back() { drop('plat'); return false; },
    reset() { drop('plat'); }
  });
  MM.register('mland', {
    title: 'Marshmallow Land',
    statusColor: () => '#000',
    render: () => '<div class="mmeg mmeg-land"></div>',
    mount(c, root) { mountKept('land', root, slot => land(c, slot)); keep.land.el.focus(); },
    back() { drop('land'); return false; },
    reset() { drop('land'); },
    // MLandActivity.onPause stops the game; coming back starts over at the splash (onResume).
    tick(c) { if (c.ui.view !== 'mland' && keep.land) drop('land'); if (c.ui.view !== 'platlogo' && keep.plat) drop('plat'); }
  });
})();
