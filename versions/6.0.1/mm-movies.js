/* Android 6.0.1 Play Movies & TV 3.8 (app/Videos of MTC20K): the two films the demo account owns, in the app
   mm-playmedia.js draws. They are the Play Store's own invented titles (mm-play.js: Northern Lights and Paper Kites,
   which 7.1.2's demo account owns too), as the earlier versions' libraries hold films:
   - Watch now and My library list them under My Movies as cards (the poster in the title's colour, the name, the year
     and movie_duration); My library keeps no_shows for TV shows.
   - A poster plays the film on a clock (no video is shipped): the drawn frame under the title bar with Up, and the
     controller with play / pause (the APK's ic_media_play / ic_media_pause), the time, the seek bar and the length.
   The player lives in ui.playmedia['play-movies'].player. */
(() => {
  'use strict';
  // [name, genre, colour, glyph, catalogue index] of mm-play.js's films; year and length as 7.1.2's store metadata.
  const OWNED = [['Northern Lights', 'Drama', '#37474f', '▶', 0], ['Paper Kites', 'Family', '#00897b', '▶', 3]]
    .map(([name, genre, color, glyph, i]) => ({id: `m2-${i}`, name, genre, color, glyph, year: 2016 + i % 2, mins: 92 + i * 9}));
  const find = id => OWNED.find(it => it.id === id);
  const time = ms => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60; return `${h ? `${h}:${String(m).padStart(2, '0')}` : m}:${String(s % 60).padStart(2, '0')}`; };
  function cards(c, t) {
    return `<h3 class="mmmv-head">${c.safe(t.t('tab_movies'))}</h3><div class="mmmv-cards">${OWNED.map(it => `<div class="mmmv-card"><button type="button" class="mmmv-poster" data-action="mmmv-play" data-id="${it.id}" style="background:${it.color}" aria-label="${c.safe(t.t('accessibility_play'))}"><span>${it.glyph}</span></button><b>${c.safe(it.name)}</b><small>${it.year} · ${c.safe(AndroidStrings.format(t.t('movie_duration'), it.mins))}</small></div>`).join('')}</div>`;
  }
  // The page body of Watch now (0) and My library (1); null leaves the page to mm-playmedia.js.
  function body(c, t, u) {
    if (u.page === 0) return cards(c, t);
    if (u.page === 1) return `${cards(c, t)}<div class="mmpm-empty"><b>${c.safe(t.t('no_shows'))}</b></div>`;
    return null;
  }
  const advance = (p, now = Date.now()) => { if (p.playing) { p.position = Math.min(p.duration, p.position + now - p.last); if (p.position >= p.duration) p.playing = false; } p.last = now; };
  function player(c, t, u) {
    const p = u.player, it = find(p.id); if (!it) return '';
    const shift = (p.position / 1000 * 7) % 360;
    return `<div class="mmpm mmmv-watch"><svg class="mmmv-frame" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="mmmv-g" gradientTransform="rotate(${shift.toFixed(1)} .5 .5)"><stop offset="0" stop-color="${it.color}"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="160" height="90" fill="url(#mmmv-g)"/><text x="80" y="58" text-anchor="middle" font-size="36" fill="#fff" fill-opacity=".35">${it.glyph}</text></svg>
      <div class="mmmv-bar"><button type="button" class="mmpm-btn" data-action="mmmv-close"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><span>${c.safe(it.name)}</span></div>
      <div class="mmmv-controls"><button type="button" class="mmmv-toggle" data-action="mmmv-toggle" aria-label="${c.safe(t.t(p.playing ? 'accessibility_pause' : 'accessibility_play'))}"><img src="assets/pv-ic_media_${p.playing ? 'pause' : 'play'}.png" alt=""></button><time class="mmmv-pos">${time(p.position)}</time><input class="mmmv-seek" type="range" min="0" max="${p.duration}" value="${p.position}" aria-label="${c.safe(it.name)}"><time>${time(p.duration)}</time></div></div>`;
  }
  function action(name, el, c, u) {
    if (name === 'mmmv-play') { const it = find(el.dataset.id); if (!it) return true; u.player = {id: it.id, position: 0, duration: it.mins * 60000, playing: true, last: Date.now()}; }
    else if (name === 'mmmv-toggle') { const p = u.player; if (!p) return true; advance(p); if (p.position >= p.duration) p.position = 0; p.playing = !p.playing; }
    else if (name === 'mmmv-close') u.player = null;
    else return false;
    c.render();
    return true;
  }
  // The clock moves the film on; only the time and the seek bar change each second.
  function tick(c, u) {
    const p = u.player; if (!p?.playing) return;
    advance(p);
    const root = c.el.viewport, seek = root.querySelector('.mmmv-seek');
    if (!p.playing || !seek) { c.render(); return; }
    seek.value = p.position; root.querySelector('.mmmv-pos').textContent = time(p.position);
  }
  function mount(c, root, u) {
    root.querySelector('.mmmv-seek')?.addEventListener('input', e => { const p = u.player; advance(p); p.position = +e.target.value; root.querySelector('.mmmv-pos').textContent = time(p.position); });
  }
  MM.movies = {OWNED, body, player, action, tick, mount, stop: u => { if (u.player) { advance(u.player); u.player.playing = false; } }};
})();
