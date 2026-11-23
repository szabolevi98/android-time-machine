/* Android 6.0.1 Play Music 6.0 (app/Music2 of MTC20K): the phone's own music in the app mm-playmedia.js draws. The demo
   phone holds the six tracks the other versions' players have (The Demo Tapes, Paper Satellites; 5.1.1 music.js, 7.1.2's
   Music folder), so the pages show them:
   - Listen Now: the albums as cards (the recently added music), or the songs played last once something has played.
   - My Library: MyLibraryFragment's tabs for an account without a subscription (read from its dex: GENRES, ARTISTS,
     ALBUMS, SONGS; Playlists and Instant mixes are their own drawer pages); a genre, artist or album opens its songs,
     SONGS starts with Shuffle all.
   - Playing: a song starts the queue of the list it is in; the bar at the bottom shows it (art, title, artist, play /
     pause, next) and opens the now playing screen (the art, title and artist, the seek bar with the times, shuffle,
     previous, play / pause, next, repeat), with the APK's drawables. Playback runs on a clock (no audio is shipped).
   Search lists the matching songs. Values live in data.music6; the screen in ui.playmedia['play-music']. */
(() => {
  'use strict';
  const TRACKS = [['Blue Horizon', 'The Demo Tapes', 'First Light', 213], ['Afterglow', 'The Demo Tapes', 'First Light', 187], ['Night Drive', 'The Demo Tapes', 'After Hours', 246],
    ['City Lights', 'Paper Satellites', 'Small Worlds', 204], ['Sunday Morning', 'Paper Satellites', 'Small Worlds', 178], ['Home Again', 'Paper Satellites', 'Small Worlds', 231]]
    .map(([title, artist, album, sec], i) => ({id: `t${i + 1}`, title, artist, album, genre: 'Pop', duration: sec * 1000}));
  const TABS = [['genres', 'genres_title'], ['artists', 'artists_title'], ['albums', 'albums_title'], ['songs', 'tracks_title']];
  const find = id => TRACKS.find(it => it.id === id);
  const state = c => c.data.music6 ||= {queue: [], index: 0, position: 0, playing: false, last: 0, shuffle: false, repeat: 0, recent: []};
  const current = c => find(state(c).queue[state(c).index]);
  const time = ms => `${Math.floor(ms / 60000)}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
  // The clock: a playing song moves on by the time passed; at its end the next one (or the repeat) follows.
  function tick(c, now = Date.now()) {
    const s = state(c), it = current(c);
    if (!it) { s.playing = false; return; }
    if (!s.playing) return;
    s.position += Math.max(0, now - s.last); s.last = now;
    if (s.position >= it.duration) advance(c, 1, now, true);
  }
  function record(c) { const s = state(c), it = current(c); if (it) s.recent = [it.id, ...s.recent.filter(id => id !== it.id)].slice(0, 20); }
  function start(c, ids, id) { const s = state(c); s.queue = ids; s.index = Math.max(0, ids.indexOf(id)); s.position = 0; s.last = Date.now(); s.playing = true; record(c); }
  function advance(c, dir, now = Date.now(), ended = false) {
    const s = state(c), it = current(c); if (!it) return;
    if (dir < 0 && s.position > 3000) { s.position = 0; s.last = now; return; }
    let next = s.index + dir;
    if (ended && s.repeat === 2) next = s.index;
    else if (s.shuffle && s.queue.length > 1) next = (s.index + 1 + Math.floor(Math.random() * (s.queue.length - 1))) % s.queue.length;
    if (next >= s.queue.length) { if (s.repeat === 1) next = 0; else { s.position = it.duration; s.playing = false; return; } }
    if (next < 0) next = s.repeat === 1 ? s.queue.length - 1 : 0;
    s.index = next; s.position = 0; s.last = now; record(c);
  }
  const group = kind => it => kind === 'artists' ? it.artist : kind === 'albums' ? it.album : it.genre;
  function rows(c, list) {
    const it0 = current(c);
    return `<div class="mmmu-tracks">${list.map(it => `<button type="button" class="mmmu-track${it0?.id === it.id ? ' current' : ''}" data-action="mmmu-play" data-id="${it.id}" data-list="${list.map(x => x.id).join(',')}"><img src="assets/mu-album.png" alt=""><span><b>${c.safe(it.title)}</b><small>${c.safe(it.artist)}</small></span><time>${time(it.duration)}</time></button>`).join('')}</div>`;
  }
  function cards(c, kind) {
    const names = [...new Set(TRACKS.map(group(kind)))].sort((a, b) => a.localeCompare(b, c.locale()));
    return `<div class="mmmu-cards">${names.map(name => `<button type="button" data-action="mmmu-scope" data-kind="${kind}" data-name="${c.safe(name)}"><img src="assets/mu-album.png" alt=""><b>${c.safe(name)}</b>${kind === 'albums' ? `<small>${c.safe(TRACKS.find(it => it.album === name).artist)}</small>` : ''}</button>`).join('')}</div>`;
  }
  // The page body of Listen Now (0) and My Library (1); null leaves the page to mm-playmedia.js.
  function body(c, t, u) {
    if (u.scope) return rows(c, TRACKS.filter(it => group(u.scope.kind)(it) === u.scope.name));
    if (u.page === 0) { const recent = state(c).recent.map(find).filter(Boolean); return recent.length ? rows(c, recent) : cards(c, 'albums'); }
    if (u.page !== 1) return null;
    const tab = u.tab || 'songs';
    return `<nav class="mmmu-tabs">${TABS.map(([id, key]) => `<button type="button" class="${tab === id ? 'on' : ''}" data-action="mmmu-tab" data-id="${id}">${c.safe(t.t(key))}</button>`).join('')}</nav>${tab === 'songs' ? `<button type="button" class="mmmu-shuffle" data-action="mmmu-shuffle-all">${c.safe(t.t('shuffle_all'))}</button>${rows(c, TRACKS)}` : cards(c, tab)}`;
  }
  const icon = (c, t, action, img, key, extra = '') => `<button type="button" class="mmmu-icon" data-action="mmmu-${action}" aria-label="${c.safe(t.t(key))}"${extra}><img src="assets/${img}.png" alt=""></button>`;
  function mini(c, t) {
    const s = state(c), it = current(c); if (!it) return '';
    return `<div class="mmmu-mini"><button type="button" data-action="mmmu-player"><img src="assets/mu-album.png" alt=""><span><b>${c.safe(it.title)}</b><small>${c.safe(it.artist)}</small></span></button>${icon(c, t, 'toggle', s.playing ? 'mu-pause' : 'mu-play', s.playing ? 'accessibility_pause' : 'accessibility_play')}${icon(c, t, 'next', 'mu-ic_fwd_dark', 'accessibility_next')}</div>`;
  }
  function player(c, t) {
    const s = state(c), it = current(c); if (!it) return '';
    return `<div class="mmmu-player"><div class="mmmu-cover"><img src="assets/mu-album.png" alt=""></div><div class="mmmu-now"><b>${c.safe(it.title)}</b><small>${c.safe(it.artist)} · ${c.safe(it.album)}</small></div>
      <input class="mmmu-seek" type="range" min="0" max="${it.duration}" value="${Math.min(it.duration, s.position)}" aria-label="${c.safe(it.title)}"><div class="mmmu-time"><time>${time(s.position)}</time><time>${time(it.duration)}</time></div>
      <div class="mmmu-controls">${icon(c, t, 'shuffle', 'mu-shuffle', 'accessibility_shuffle', ` aria-pressed="${!!s.shuffle}"`)}${icon(c, t, 'prev', 'mu-ic_rew_dark', 'accessibility_prev')}${icon(c, t, 'toggle', s.playing ? 'mu-pause' : 'mu-play', s.playing ? 'accessibility_pause' : 'accessibility_play')}${icon(c, t, 'next', 'mu-ic_fwd_dark', 'accessibility_next')}${icon(c, t, 'repeat', ['mu-repeat', 'mu-repeat-on', 'mu-repeat-one'][s.repeat], 'accessibility_repeat', ` aria-pressed="${s.repeat > 0}"`)}</div></div>`;
  }
  // Search: the songs whose title, artist or album holds the query.
  function search(c, q) { const low = q.trim().toLowerCase(), hits = TRACKS.filter(it => `${it.title} ${it.artist} ${it.album}`.toLowerCase().includes(low)); return hits.length ? rows(c, hits) : null; }
  function action(name, el, c, u) {
    const s = state(c);
    switch (name) {
      case 'mmmu-tab': u.tab = el.dataset.id; break;
      case 'mmmu-scope': u.scope = {kind: el.dataset.kind, name: el.dataset.name}; break;
      case 'mmmu-play': start(c, el.dataset.list.split(','), el.dataset.id); u.player = true; break;
      case 'mmmu-shuffle-all': s.shuffle = true; start(c, TRACKS.map(it => it.id), TRACKS[Math.floor(Math.random() * TRACKS.length)].id); u.player = true; break;
      case 'mmmu-player': u.player = true; break;
      case 'mmmu-toggle': { const it = current(c); if (!it) break; tick(c); if (s.playing) s.playing = false; else { if (s.position >= it.duration) s.position = 0; s.last = Date.now(); s.playing = true; } break; }
      case 'mmmu-next': tick(c); advance(c, 1); break;
      case 'mmmu-prev': tick(c); advance(c, -1); break;
      case 'mmmu-shuffle': s.shuffle = !s.shuffle; break;
      case 'mmmu-repeat': s.repeat = (s.repeat + 1) % 3; break;
      default: return false;
    }
    c.save(); c.render();
    return true;
  }
  // The seek bar moves the song while it is dragged.
  function mount(c, root) {
    const seek = root.querySelector('.mmmu-seek'); if (!seek) return;
    seek.addEventListener('change', () => { const s = state(c); s.position = Number(seek.value); s.last = Date.now(); c.save(); c.render(); });
  }
  // Back: the player, then a genre / artist / album, before the app's own steps.
  function back(c, u) { if (u.player) { u.player = false; c.render(); return true; } if (u.scope) { u.scope = null; c.render(); return true; } return false; }
  MM.music = {TRACKS, state, current, tick, body, mini, player, search, action, mount, back};
})();
