/* The Google Play media apps of the Nexus 4's JWR66Y image, each from its APK (audit step 4): Play Music 5.0.1042J
   (Music2.apk; its code from Music2.odex in the system image), Play Movies 2.5.4 (Videos.apk) and Play Books 2.8.91
   (Books.apk). Covers, posters and the sample library are the simulator's own drawings; book pages are short
   public-domain excerpts. The Play Games code below is the KitKat module's and is not used on 4.3. */
(() => {
  'use strict';
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const glyph = {
    music: '<svg viewBox="0 0 24 24"><path d="M12 3a8.5 8.5 0 0 0-8.5 8.5V19a2 2 0 0 0 2 2H8v-7H5.5v-2.5a6.5 6.5 0 0 1 13 0V14H16v7h2.5a2 2 0 0 0 2-2v-7.5A8.5 8.5 0 0 0 12 3z" fill="#fff"/></svg>',
    movies: '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v2h2V6zm0 4v4h14v-4zm0 6v2h2v-2zm12-10v2h2V6zm0 10v2h2v-2zM9 6v2h6V6zm0 10v2h6v-2z" fill="#fff" fill-rule="evenodd"/></svg>',
    books: '<svg viewBox="0 0 24 24"><path d="M3 5.5C5.5 4.3 8.5 4 11 5.5V20c-2.5-1.5-5.5-1.2-8 0zM13 5.5c2.5-1.5 5.5-1.2 8 0V20c-2.5-1.2-5.5-1.5-8 0z" fill="#fff"/></svg>',
    games: '<svg viewBox="0 0 24 24"><path d="M7 7h10a5 5 0 0 1 4.7 6.6l-1 3a2.6 2.6 0 0 1-4.5.8L14.5 15h-5l-1.7 2.4a2.6 2.6 0 0 1-4.5-.8l-1-3A5 5 0 0 1 7 7zm0 2.5v1.5H5.5v1.5H7V14h1.5v-1.5H10V11H8.5V9.5zm9.2.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" fill="#fff" fill-rule="evenodd"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    cast: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14h-6v-2h4V7H5v3H3zm0 7a7 7 0 0 1 7 7H8a5 5 0 0 0-5-5zm0 4a3 3 0 0 1 3 3H3z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M14 3l7 7-2 1-3 3 .5 4.5-1.5 1.5-4-4L6 21H4.5v-1.5L9 15l-4-4L6.5 9.5 11 10l3-3z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24"><path d="M6.5 4.5h4v15h-4zm7 0h4v15h-4z" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24"><path d="M5 5h2.5v14H5zm3.5 7L19 5v14z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M16.5 5H19v14h-2.5zM5 5l10.5 7L5 19z" fill="currentColor"/></svg>',
    repeat: '<svg viewBox="0 0 24 24"><path d="M7 7h10V4l4 4-4 4V9H9v3H7zm10 10H7v3l-4-4 4-4v3h8v-3h2z" fill="currentColor"/></svg>',
    shuffle: '<svg viewBox="0 0 24 24"><path d="M14.5 4H20v5.5l-2-2-12.6 12.6L4 18.7 16.6 6.1zM4 5.4 5.4 4l5.2 5.2-1.4 1.4zm9.8 9.8 1.4-1.4 2.8 2.8 2-2V20h-5.5l2-2z" fill="currentColor"/></svg>',
    queue: '<svg viewBox="0 0 24 24"><path d="M3 5h13v2H3zm0 4h13v2H3zm0 4h9v2H3zm12 0 6 3.5-6 3.5z" fill="currentColor"/></svg>',
    thumbUp: '<svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zm6 11V10l5-8 1.2.6c.6.4.9 1.1.7 1.8L14 9h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    thumbDown: '<svg viewBox="0 0 24 24"><path d="M22 14h-4V3h4zm-6-11v11l-5 8-1.2-.6c-.6-.4-.9-1.1-.7-1.8L10 15H4a2 2 0 0 1-2-2.3l1.4-8A2 2 0 0 1 5.4 3z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    trophy: '<svg viewBox="0 0 24 24"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V18h3v3H8v-3h3v-3.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3zm-1 4v1a2 2 0 0 0 1 1.7V7zm11 0v2.7A2 2 0 0 0 18 8V7z" fill="currentColor"/></svg>',
    toc: '<svg viewBox="0 0 24 24"><path d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zm-4 6h2v2H3zm4 0h14v2H7z" fill="currentColor"/></svg>'
  };
  // Covers, posters and game icons: a two-colour field, simple shapes and the title, all drawn here.
  function art(kind, seed, title, sub = '') {
    const palettes = [['#1f3b5a', '#e8a33d'], ['#5b2c4f', '#f2c14e'], ['#0f5c58', '#f7f3e3'], ['#2f2f2f', '#e85d3f'], ['#3b4fa0', '#9fd3f2'], ['#7a1f1f', '#f0d9a7'], ['#204020', '#c8e06a'], ['#40305a', '#f28ab2']];
    const [a, b] = palettes[seed % palettes.length], w = kind === 'poster' ? 200 : 200, h = kind === 'poster' ? 290 : kind === 'book' ? 300 : 200;
    const shapes = [`<circle cx="${w * .7}" cy="${h * .32}" r="${w * .22}" fill="${b}" opacity=".85"/>`, `<path d="M0 ${h * .75} L${w * .5} ${h * .38} L${w} ${h * .7} V${h} H0Z" fill="${b}" opacity=".55"/>`, `<rect x="${w * .12}" y="${h * .14}" width="${w * .76}" height="${h * .42}" fill="none" stroke="${b}" stroke-width="6"/>`, `<path d="M0 ${h * .2} Q${w * .5} ${h * .65} ${w} ${h * .25}" fill="none" stroke="${b}" stroke-width="10" opacity=".8"/>`][seed % 4];
    const words = String(title).split(' '), lines = [];
    for (const word of words) { const last = lines.at(-1); if (last && (last + ' ' + word).length <= 12) lines[lines.length - 1] = last + ' ' + word; else lines.push(word); }
    const size = kind === 'icon' ? 22 : 24, y0 = kind === 'book' ? h * .5 : h * .68;
    const text = kind === 'icon' ? '' : lines.slice(0, kind === 'book' ? 4 : 3).map((line, i) => `<text x="${w / 2}" y="${y0 + i * (size + 4)}" text-anchor="middle" font-family="Georgia,serif" font-size="${size}" font-weight="700" fill="#fff">${e(line)}</text>`).join('') + (sub ? `<text x="${w / 2}" y="${h - 14}" text-anchor="middle" font-family="Arial,sans-serif" font-size="13" fill="${b}">${e(sub)}</text>` : '');
    return `<svg class="pa-art" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="${w}" height="${h}" fill="${a}"/>${shapes}${text}</svg>`;
  }
  const APPS = {
    'play-music': {key: 'music', title: 'Play Music', pages: [['listen', 'Listen Now'], ['library', 'My Library'], ['playlists', 'Playlists'], ['mixes', 'Instant Mixes']]},
    'play-movies': {key: 'movies', title: 'Play Movies & TV', pages: [['watch', 'Watch Now'], ['movies', 'My Movies'], ['shows', 'My TV Shows']]},
    'play-books': {key: 'books', title: 'Play Books', pages: [['read', 'Read Now'], ['library', 'My Library']]},
    'play-games': {key: 'games', title: 'Play Games', pages: [['now', 'Play Now'], ['mine', 'My Games'], ['activity', 'My Activity'], ['players', 'Players'], ['recommended', 'Recommended Games'], ['shop', 'Shop']]}
  };
  const DEFAULT = {'play-music': 'listen', 'play-movies': 'movies', 'play-books': 'read', 'play-games': 'now'};
  const MOVIES = [
    {id: 'm1', title: 'The Last Lighthouse', year: 2012, mins: 104, progress: .42},
    {id: 'm2', title: 'Paper Planes', year: 2013, mins: 96, progress: 0},
    {id: 'm3', title: 'Northern Line', year: 2011, mins: 118, progress: .8},
    {id: 'm4', title: 'Orbit Nine', year: 2013, mins: 121, progress: 0}
  ];
  const SHOWS = [{id: 's1', title: 'Kitchen Science', seasons: 2, episodes: 12}, {id: 's2', title: 'Robots of Tomorrow', seasons: 1, episodes: 8}];
  const RECOMMENDED = [{id: 'r1', title: 'Summer in Lisbon', year: 2013, price: '$3.99'}, {id: 'r2', title: 'The Clockmaker', year: 2012, price: '$2.99'}];
  // Public-domain openings (Carroll 1865, Austen 1813, Dumas 1844 in the 1846 English translation, Doyle 1892).
  const BOOKS = [
    {id: 'b1', title: 'Alice’s Adventures in Wonderland', author: 'Lewis Carroll', pages: [
      'CHAPTER I.\nDown the Rabbit-Hole',
      'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice “without pictures or conversations?”',
      'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid), whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.',
      'There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself, “Oh dear! Oh dear! I shall be late!”',
      'CHAPTER II.\nThe Pool of Tears',
      '“Curiouser and curiouser!” cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); “now I’m opening out like the largest telescope that ever was! Good-bye, feet!”',
      'CHAPTER III.\nA Caucus-Race and a Long Tale',
      'They were indeed a queer-looking party that assembled on the bank—the birds with draggled feathers, the animals with their fur clinging close to them, and all dripping wet, cross, and uncomfortable.']},
    {id: 'b2', title: 'Pride and Prejudice', author: 'Jane Austen', pages: [
      'Chapter 1',
      'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.',
      'However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.',
      '“My dear Mr. Bennet,” said his lady to him one day, “have you heard that Netherfield Park is let at last?”\n\nMr. Bennet replied that he had not.',
      'Chapter 2',
      'Mr. Bennet was among the earliest of those who waited on Mr. Bingley. He had always intended to visit him, though to the last always assuring his wife that he should not go; and till the evening after the visit was paid she had no knowledge of it.']},
    {id: 'b3', title: 'The Three Musketeers', author: 'Alexandre Dumas', pages: [
      '1. The Three Presents of D’Artagnan the Elder',
      'On the first Monday of the month of April, 1625, the market town of Meung, in which the author of Romance of the Rose was born, appeared to be in as perfect a state of revolution as if the Huguenots had just made a second La Rochelle of it.',
      'Many citizens, seeing the women flying toward the High Street, leaving their children crying at the open doors, hastened to don the cuirass, and supporting their somewhat uncertain courage with a musket or a partisan, directed their steps toward the hostelry of the Jolly Miller.',
      '2. The Antechamber of M. de Tréville',
      'M. de Troisville, as his family was still called in Gascony, or M. de Tréville, as he has ended by styling himself in Paris, had really commenced life as d’Artagnan now did; that is to say, without a sou in his pocket, but with a fund of audacity, shrewdness, and intelligence.']},
    {id: 'b4', title: 'The Adventures of Sherlock Holmes', author: 'Arthur Conan Doyle', pages: [
      'I. A Scandal in Bohemia',
      'To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.',
      'It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind.',
      'II. The Red-Headed League',
      'I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced, elderly gentleman with fiery red hair.']}
  ];
  // Each chapter opens on its heading page; the reader's Contents lists them (ContentsView.ChaptersAdapter).
  BOOKS.forEach(book => { book.starts = book.pages.map((page, i) => /^(CHAPTER [IVX]+\.|Chapter \d+|\d+\. |[IVX]+\. )/.test(page) ? i : -1).filter(i => i >= 0); });
  const GAMES = [
    {id: 'g1', title: 'Bean Bounce', dev: 'Android Demo', achievements: 18, got: 3, state: 'PURCHASED'},
    {id: 'g2', title: 'Dessert Dash', dev: 'Sweet Pixel', achievements: 12, got: 0, state: 'FREE'},
    {id: 'g3', title: 'Robot Rally', dev: 'Gearbox Kids', achievements: 25, got: 7, state: 'FREE'},
    {id: 'g4', title: 'Paper Pilots', dev: 'Fold Studio', achievements: 10, got: 0, state: 'FREE'}
  ];
  const PLAYERS = [{name: 'Alex Morgan', game: 'Robot Rally'}, {name: 'Sam Rivera', game: 'Bean Bounce'}];
  const seedOf = id => [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);

  // Play Music 5.0's action bar (MusicActionBar): action_bar_bg_music (#f4842d over a 2 dp #d27127 line), the drawer
  // toggle's ic_drawer_white (the theme's ic_ab_back_holo_dark when going up) beside ic_corpora_music_white, the title and
  // home_action_bar_spinner_item's 10 sp bold #b3ffffff subtitle. Only Play Music uses it on 4.3.
  function bar(ctx, {title, subtitle = '', up = false, actions = ''}) {
    return `<header class="pm5-bar"><button class="pm5-home" data-action="${up ? 'back' : 'pa-drawer'}" aria-label="${e(up ? ctx.t('Back') : ctx.t(APPS[ctx.app].title))}"><img class="pm5-toggle" src="assets/${up ? 'ic_ab_back_holo_dark' : 'bk28-ic_drawer_white'}.png" alt=""><img class="pm5-logo" src="assets/pm5-ic_corpora_music_white.png" alt=""></button><span class="pm5-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
  }
  // menu/home_activity.xml: Search (always) in the bar, Refresh, Settings and Help in the overflow.
  const musicActions = ctx => `<button class="pa-btn" data-action="pa-search" aria-label="${e(S(ctx, 'music', 'Search'))}"><img class="pm5-icon" src="assets/pm5-ic_search_white.png" alt=""></button><button class="pa-btn" data-action="pa-menu" aria-label="${e(ctx.t('More options'))}"><img class="pm5-icon" src="assets/pm5-ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  const btn = (action, label, icon, id = '') => `<button class="pa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${glyph[icon]}</button>`;
  const section = (title, chip = '', chipAction = '', chipId = '') => `<div class="pa-section"><h3>${e(title)}</h3>${chip ? `<button class="pa-chip" data-action="${chipAction}"${chipId ? ` data-id="${e(chipId)}"` : ''}>${e(chip)}</button>` : ''}</div>`;
  // The card's overflow opens its own menu (doc: "album:…", "artist:…"; jb-play-more.js); kept marks an album kept on
  // the device.
  const card = ({action, id, artHtml, title, sub, note = '', pin = false, kept = false, doc = '', cls = ''}) => `<div class="pa-card${cls}" role="button" tabindex="0" data-action="${action}" data-id="${e(id)}" aria-label="${e(title)}"><div class="pa-card-art">${artHtml}${kept ? `<span class="pa-kept">${glyph.pin}</span>` : ''}</div><div class="pa-card-copy"><b>${e(title)}</b><small>${e(sub)}</small>${note ? `<i>${e(note)}</i>` : ''}<button class="pa-dots" data-action="${doc ? 'px-doc' : 'pa-unsupported'}"${doc ? ` data-id="${e(doc)}"` : ''} aria-label="More options">${glyph.overflow}</button>${pin ? `<button class="pa-pin" data-action="pa-unsupported" aria-label="Keep on device">${glyph.pin}</button>` : ''}</div></div>`;
  const keptAlbum = (ctx, album) => !!window.PlayMore?.kept(ctx.data).includes(album);

  // ---- Play Music ----
  function albums(tracks) {
    const map = new Map();
    tracks.forEach((track, i) => { if (!map.has(track.album)) map.set(track.album, {album: track.album, artist: track.artist, tracks: []}); map.get(track.album).tracks.push(i); });
    return [...map.values()];
  }
  function miniPlayer(ctx) {
    const {music, tracks} = ctx, track = tracks[music.track];
    if (!track) return '';
    return `<div class="pm-mini"><button class="pm-mini-open" data-action="pa-player"><span class="pm-mini-art">${art('cover', seedOf(track.album), track.album)}</span><span class="pm-mini-copy"><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button><button class="pm-mini-play" data-action="music-play" aria-label="${e(ctx.t(music.playing ? 'Pause' : 'Play'))}">${music.playing ? glyph.pause : glyph.play}</button></div>`;
  }
  // Search (audit step 5): SearchActivity's expanded SearchView and the clusters of SearchMusicClustersFragment: Artists
  // and Albums as 2 x 2 cards, Songs as up to 5 rows, "%d MORE" when a cluster holds more; ic_empty_state_search and
  // "No results found." when nothing matches. Artist, album and song names are matched on their own.
  function musicSearch(ctx) {
    const {ui, tracks, music: state} = ctx, m = key => S(ctx, 'music', key), q = String(ui.paQuery || '').trim().toLocaleLowerCase();
    const list = albums(tracks), has = text => String(text).toLocaleLowerCase().includes(q), more = (n, max) => n > max ? AndroidStrings.format(m('%d MORE'), n - max) : '';
    let body = '';
    if (q) {
      const artists = [...new Set(tracks.map(track => track.artist))].filter(has), found = list.filter(album => has(album.album)), songs = tracks.map((track, id) => ({track, id})).filter(({track}) => has(track.title));
      if (!artists.length && !found.length && !songs.length) body = `<div class="pm-search-empty"><img src="assets/pm5-ic_empty_state_search.png" alt=""><p>${e(m('No results found.'))}</p></div>`;
      else body = (artists.length ? section(m('Artists'), more(artists.length, 4), 'px-more', 'artists') + `<div class="pa-grid">${artists.slice(0, 4).map(artist => card({action: 'px-artist', id: artist, doc: `artist:${artist}`, artHtml: art('cover', seedOf(artist), artist), title: artist, sub: ''})).join('')}</div>` : '')
        + (found.length ? section(m('Albums'), more(found.length, 4), 'px-more', 'albums') + `<div class="pa-grid">${found.slice(0, 4).map(album => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, kept: keptAlbum(ctx, album.album), artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist})).join('')}</div>` : '')
        + (songs.length ? section(m('Songs'), more(songs.length, 5), 'px-more', 'songs') + `<div class="pm-songs">${songs.slice(0, 5).map(({track, id}) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(track.album), track.album)}</span><span><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button>`).join('')}</div>` : '');
    }
    return `<div class="app-view pa-app pa-music pm-search"><header class="pm5-bar pm-searchbar"><button class="pm5-home" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="pm5-toggle" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="pm5-logo" src="assets/pm5-ic_corpora_music_white.png" alt=""></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(m('Search music'))}" aria-label="${e(m('Search music'))}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(m('Clear query'))}"><img src="assets/pm5-ic_clear_normal.png" alt=""></button>` : ''}</label></header><div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
  }
  function music(ctx) {
    if (ctx.ui.sub === 'search') return musicSearch(ctx);
    const {ui, t, tracks, music: state} = ctx, page = ui.paPage?.['play-music'] || 'listen', m = key => S(ctx, 'music', key);
    const time = ctx.time;
    if (ui.sub === 'player' || ui.sub === 'queue') {
      const track = tracks[state.track], thumbs = ctx.data.playMusicThumbs || {};
      const head = `<header class="pm-np-head"><button class="pm-np-back" data-action="back" aria-label="${e(t('Back'))}"><span class="pm-np-art">${art('cover', seedOf(track.album), track.album)}</span><span class="pm-np-copy"><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button>${btn('pa-queue', t('Queue'), 'queue')}${btn('px-np', t('More options'), 'overflow')}</header>`;
      const body = ui.sub === 'queue'
        ? `<div class="pm-queue"><h4>${e(t('QUEUE'))}</h4>${state.queue.map(id => `<button class="pm-queue-row${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="keep"><i class="pm-grip"></i><span class="pm-qart">${art('cover', seedOf(tracks[id].album), tracks[id].album)}</span><span><b>${e(tracks[id].title)}</b><small>${e(tracks[id].artist)}</small></span>${id === state.track ? '<em class="pm-eq"><i></i><i></i><i></i></em>' : ''}</button>`).join('')}</div>`
        : `<div class="pm-np-art-big">${art('cover', seedOf(track.album), track.album, track.artist)}<button class="pm-thumb up${thumbs[state.track] === 1 ? ' on' : ''}" data-action="pa-thumb" data-id="1" aria-label="${e(t('Thumbs up'))}">${glyph.thumbUp}</button><button class="pm-thumb down${thumbs[state.track] === -1 ? ' on' : ''}" data-action="pa-thumb" data-id="-1" aria-label="${e(t('Thumbs down'))}">${glyph.thumbDown}</button><span class="pm-time music-elapsed">${time(state.position)}</span><span class="pm-time end">${time(track.duration)}</span></div>`;
      return `<div class="app-view pa-app pa-music pm-now">${head}${body}<input class="music-progress pm-progress" data-field="music-position" type="range" min="0" max="${track.duration}" value="${Math.floor(state.position)}" aria-label="${e(t('Position'))}" style="--p:${(state.position / track.duration * 100).toFixed(2)}%"><div class="pm-controls"><button class="${state.repeat !== 'off' ? 'on' : ''}" data-action="music-repeat" aria-label="${e(t('Repeat'))}">${glyph.repeat}${state.repeat === 'one' ? '<sup>1</sup>' : ''}</button><button data-action="music-prev" aria-label="${e(t('Previous'))}">${glyph.prev}</button><button class="pm-play" data-action="music-play" aria-label="${e(t(state.playing ? 'Pause' : 'Play'))}">${state.playing ? glyph.pause : glyph.play}</button><button data-action="music-next" aria-label="${e(t('Next'))}">${glyph.next}</button><button class="${state.shuffle ? 'on' : ''}" data-action="music-shuffle" aria-label="${e(t('Shuffle'))}">${glyph.shuffle}</button></div></div>`;
    }
    const list = albums(tracks);
    if (ui.sub === 'album') {
      const album = list.find(item => item.album === ui.paAlbum) || list[0];
      return `<div class="app-view pa-app pa-music">${bar(ctx, {title: album.album, subtitle: album.artist, up: true, actions: musicActions(ctx)})}<div class="pa-scroll"><div class="pm-album-head">${art('cover', seedOf(album.album), album.album, album.artist)}</div><div class="pm-songs">${album.tracks.map((id, n) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="${e(album.album)}"><em>${n + 1}</em><span><b>${e(tracks[id].title)}</b><small>${e(tracks[id].artist)}</small></span><time>${time(tracks[id].duration)}</time></button>`).join('')}</div></div>${miniPlayer(ctx)}</div>`;
    }
    let body = '', title = m('Listen Now'), subtitle = m('All music');
    if (page === 'listen') {
      const reasons = ['Recently played', 'Recently added to My Library', 'Recently played'].map(m);
      body = `<div class="pa-grid">${list.map((album, i) => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, kept: keptAlbum(ctx, album.album), artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist, note: reasons[i % reasons.length]})).join('')}</div>`;
    } else if (page === 'library') {
      title = m('My Library');
      const tab = ui.paMusicTab || 'albums';
      const tabs = [['genres', 'Genres'], ['artists', 'Artists'], ['albums', 'Albums'], ['songs', 'Songs']];
      const content = tab === 'albums' ? `<div class="pa-grid">${list.map(album => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, kept: keptAlbum(ctx, album.album), artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist})).join('')}</div>`
        : tab === 'songs' ? `<div class="pm-songs">${tracks.map((track, id) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(track.album), track.album)}</span><span><b>${e(track.title)}</b><small>${e(track.artist)}</small></span><time>${time(track.duration)}</time></button>`).join('')}</div>`
        : tab === 'artists' ? `<div class="pm-songs">${[...new Set(tracks.map(track => track.artist))].map(artist => `<button class="pm-song" data-action="pa-album" data-id="${e(list.find(album => album.artist === artist).album)}"><span class="pm-qart">${art('cover', seedOf(artist), artist)}</span><span><b>${e(artist)}</b><small>${e(AndroidStrings.format(t('%d albums'), list.filter(album => album.artist === artist).length))}</small></span></button>`).join('')}</div>`
        : `<div class="pm-songs"><button class="pm-song" data-action="pa-libtab" data-id="albums"><span class="pm-qart">${art('cover', 3, 'Pop')}</span><span><b>${e(t('Pop'))}</b><small>${e(AndroidStrings.format(t('%d albums'), list.length))}</small></span></button></div>`;
      body = `<nav class="pa-tabs pm5-tabs">${tabs.map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="pa-libtab" data-id="${id}">${e(m(label))}</button>`).join('')}</nav>${content}`;
    } else if (page === 'mixes') {
      // InstantMixesFragment: My mixes, Recommended (the simulator recommends a mix per album).
      title = m('Instant Mixes'); subtitle = '';
      const tab = ui.paMixTab || 'recommended';
      body = `<nav class="pa-tabs pm5-tabs">${[['mine', 'My mixes'], ['recommended', 'Recommended']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="pa-mixtab" data-id="${id}">${e(m(label))}</button>`).join('')}</nav>${tab === 'recommended' ? `<div class="pa-grid">${list.map(album => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, artHtml: art('cover', seedOf(album.album) + 3, album.album), title: album.album, sub: album.artist})).join('')}</div>` : ''}`;
    } else {
      title = m('Playlists'); subtitle = '';
      const auto = [['Thumbs up', Object.values(ctx.data.playMusicThumbs || {}).filter(v => v === 1).length], ['Last added', tracks.length]];
      body = `${section(t('Auto playlists'))}<div class="pm-songs">${auto.map(([name, n], i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 5, name)}</span><span><b>${e(m(name))}</b><small>${e(AndroidStrings.format(t('%d songs'), n))}</small></span></button>`).join('')}</div>${state.playlists.length ? section(t('Playlists')) + `<div class="pm-songs">${state.playlists.map((p, i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 2, p.name)}</span><span><b>${e(p.name)}</b><small>${e(AndroidStrings.format(t('%d songs'), p.tracks.length))}</small></span></button>`).join('')}</div>` : ''}`;
    }
    return `<div class="app-view pa-app pa-music">${bar(ctx, {title, subtitle, actions: musicActions(ctx)})}<div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
  }

  // ---- Play Movies & TV ----
  // Play Movies 2.5.4 (JWR66Y, Videos.apk), a Holo dark app on striped_background_red. HomeActivityCompat$V11 shows
  // "Google Play" in the black ActionBar (the app icon as the home icon) and, on a phone in portrait, the ViewPager's
  // verticals as action bar tabs on #4d1d1d (actionbar_tab_background, 6 dp #c74b46 under the selected one; white and
  // #989898 text): Movies, TV shows, Personal videos. Menus as HomeActivity.onCreateOptionsMenu adds them: common_menu
  // (Settings, Help, Contact us, Send feedback), home_menu (Refresh, Accounts), then Search (always) and Shop (ifRoom)
  // on the store verticals. Movies is MoviesOutlineHelper's outline: panel headings (21 dp sans-serif-light white) over
  // PurchasedMovieItemView rows (a 120 dp poster at 0.694 for a 368 dp wide row, the 21 dp title, "year, %1$s mins." in
  // #cccccc, the download pin on #331313b2), then Suggestions and suggestions_footer.
  const MOVIE_TABS = [['movies', 'Movies'], ['shows', 'TV shows'], ['personal', 'Personal videos']];
  // Search in Play Movies & TV and Play Books (audit step 5): the expanded SearchView with the app's hint, then the
  // suggestions the app's provider gives for the library while typing (Videos: search_dropdown_item_icons_2line with
  // the thumbnail and title; Books: list_item_suggest_volume and the list_item_suggest_market row).
  function storeSearch(ctx) {
    const {ui} = ctx, movies = ctx.app === 'play-movies', key = movies ? 'movies' : 'books', s = k => S(ctx, key, k), q = String(ui.paQuery || '').trim().toLocaleLowerCase();
    const hint = s(movies ? 'Search for movies' : 'Search for books'), clear = s('Clear query');
    const bars = {'play-movies': ["mv25-bar", "mv25-ic_launcher_videos.png"], 'play-books': ["bk28-bar", "bk28-ic_corpora_books.png"]}[ctx.app];
    const has = text => String(text).toLocaleLowerCase().includes(q);
    let rows = '';
    if (q && movies) rows = MOVIES.filter(item => has(item.title)).map(item => `<button class="pa-suggest-row" data-action="${MOVIES.includes(item) ? 'pa-movie' : 'pa-unsupported'}" data-id="${e(item.id)}"><span class="pa-suggest-art">${art('poster', seedOf(item.id), item.title)}</span><span><b>${e(item.title)}</b></span></button>`).join('');
    if (q && !movies) rows = BOOKS.filter(book => has(book.title) || has(book.author)).map(book => `<button class="pa-suggest-row" data-action="pa-book" data-id="${e(book.id)}"><span class="pa-suggest-art">${art('book', seedOf(book.id), book.title)}</span><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span></button>`).join('') + `<button class="pa-suggest-row market" data-action="pa-unsupported"><span><b>${e(s('Search online'))}</b></span></button>`;
    return `<div class="app-view pa-app ${movies ? 'pa-movies' : 'pa-books'} pm-search"><header class="${bars[0]} pm-searchbar"><button class="pm5-home" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="pm5-toggle" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="pm5-logo" src="assets/${bars[1]}" alt=""></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(hint)}" aria-label="${e(hint)}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(clear)}"><img src="assets/pm5-ic_clear_normal.png" alt=""></button>` : ''}</label></header>${rows ? `<div class="pa-suggest ${movies ? 'movies' : 'books'}">${rows}</div>` : ''}</div>`;
  }
  function movies(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t} = ctx, page = MOVIE_TABS.some(([id]) => id === ui.paPage?.['play-movies']) ? ui.paPage['play-movies'] : 'movies', v = key => S(ctx, 'movies', key);
    if (ui.sub === 'movie') {
      const movie = MOVIES.find(m => m.id === ui.paItem) || SHOWS.find(s => s.id === ui.paItem) || MOVIES[0];
      const playing = ui.paPlaying !== false, total = (movie.mins || 24) * 60, pos = Math.floor(total * (movie.progress || 0)) + (ui.paSeconds || 0);
      const clock = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      return `<div class="app-view pa-app pm-video${ui.paBars === false ? ' bare' : ''}" data-action="pa-video-bars"><div class="pm-video-frame${playing ? ' playing' : ''}">${art('poster', seedOf(movie.id), movie.title)}</div><header class="pm-video-top"><button class="mv25-up" data-action="back" aria-label="${e(t('Back'))}"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/mv25-ic_launcher_videos.png" alt=""></button><b>${e(movie.title)}</b>${btn('pa-unsupported', t('Cast screen'), 'cast')}</header><button class="pm-video-play" data-action="pa-video-toggle" aria-label="${e(t(playing ? 'Pause' : 'Play'))}">${playing ? glyph.pause : glyph.play}</button><footer class="pm-video-bottom"><span>${clock(pos)}</span><i style="--p:${Math.min(100, pos / total * 100).toFixed(1)}%"></i><span>${clock(total)}</span></footer></div>`;
    }
    // item_pin_panel: ic_download over ic_download_background, ic_download_complete once the video is on the device;
    // a downloaded video's pin offers movie_context_menu (jb-play-more.js).
    const device = window.PlayMore ? window.PlayMore.onDevice(ctx.data) : [];
    const pin = id => { const on = device.includes(id); return `<span class="mv25-pin${on ? ' on' : ''}"><button data-action="${on ? 'px-doc' : 'px-movie-pin'}" data-id="${on ? `movie:${e(id)}` : e(id)}" aria-label="${e(v(on ? 'Remove download' : 'Download'))}"><img src="assets/mv25-ic_download_background.png" alt=""><img src="assets/mv25-ic_download${on ? '_complete' : ''}.png" alt=""></button></span>`; };
    const row = (action, id, title, line) => `<div class="mv25-item" role="button" tabindex="0" data-action="${action}" data-id="${e(id)}" aria-label="${e(title)}"><span class="mv25-poster">${art('poster', seedOf(id), title)}</span><span class="mv25-details"><b>${e(title)}</b><small>${e(line)}</small>${action === 'pa-movie' ? pin(id) : ''}</span></div>`;
    const heading = key => `<h3 class="mv25-heading">${e(v(key))}</h3>`;
    const yearDuration = m => `${m.year}, ${AndroidStrings.format(v('%1$s mins.'), m.mins)}`;
    let body;
    if (page === 'movies') body = heading('My movies') + MOVIES.map(m => row('pa-movie', m.id, m.title, yearDuration(m))).join('') + heading('Suggestions') + RECOMMENDED.map(m => row('pa-shop', m.id, m.title, String(m.year))).join('') + `<button class="mv25-footer" data-action="pa-shop"><img src="assets/mv25-ic_menu_shop_holo_dark.png" alt=""><span>${e(v('See more from Google Play'))}</span><img src="assets/mv25-ic_chevron_right.png" alt=""></button>`;
    else if (page === 'shows') body = heading('My shows') + SHOWS.map(show => row('pa-movie', show.id, show.title, AndroidStrings.format(v('Season %1$s'), show.seasons))).join('');
    else body = `<p class="mv25-status">${e(v('NO VIDEOS FOUND'))}</p>`;
    const store = page !== 'personal' ? `<button class="pa-btn" data-action="pa-search" aria-label="${e(t('Search'))}"><img class="mv25-icon" src="assets/mv25-ic_menu_search.png" alt=""></button><button class="pa-btn" data-action="pa-shop" aria-label="${e(v('Shop'))}"><img class="mv25-icon" src="assets/mv25-ic_menu_shop_holo_dark.png" alt=""></button>` : '';
    return `<div class="app-view pa-app mv25"><header class="mv25-bar"><img class="mv25-logo" src="assets/mv25-ic_launcher_videos.png" alt=""><b>${e(v('Google Play'))}</b>${store}<button class="pa-btn" data-action="pa-menu" aria-label="${e(t('More options'))}"><img class="mv25-icon" src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><nav class="mv25-tabs">${MOVIE_TABS.map(([id, key]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(v(key))}</button>`).join('')}</nav><div class="mv25-list">${body}</div></div>`;
  }

  // ---- Play Books ----
  // Play Books 2.8.91 (JWR66Y). BooksActivity's action bar (StyleUtils.configureFlatBlueActionBar): action_bar_bg_books
  // (#3f9fe0 over a 2 dp #3689c0 line), the ActionBarDrawerToggle's ic_drawer_white, ic_corpora_books and the view's
  // title; menu/home.xml: Search (always), then Sort (My Library only), Refresh, Settings and Help in the overflow.
  // Read Now: read_now_header ("Recent", 21 sp light italic #505050) over books_card_small cards on #e5e5e5. My Library:
  // my_library_header's filter Spinner (LibraryFilter: All books, Purchases; Uploads and Samples stay hidden while empty)
  // over a 2 dp play_app_color divider. The reader's bar is ReadingActivityDay's ab_solid_light_holo with
  // ic_ab_back_holo_light and ic_corpora_books_color.
  const BOOK_FILTERS = ['All books', 'Purchases'];
  // The reader's settings (LocalPreferences' defaults): themes 0 Day / 1 Night / 2 Sepia, typeface2, justification2, the
  // window brightness (-1 follows the system), textZoom (ReaderUtils' default 1, steps of 1/8, at least 2 steps) and
  // lineHeight2 (1.5 shown as 100%, steps of 0.1875, at least 1.125).
  const THEME_KEYS = ['day', 'night', 'sepia'];
  const BOOK_PREFS = {theme: '0', typeface: 'default', justification: 'default', brightness: -1, textZoom: 1, lineHeight: 1.5};
  const bookPrefs = data => ({...BOOK_PREFS, ...(data.bookPrefs || {})});
  const ZOOM_STEP = .125, LINE_STEP = .1875, LINE_MIN = 1.125;
  const PREF_SPINNERS = {
    theme: [['Day', 'Night', 'Sepia'], ['0', '1', '2']],
    typeface: [['Default', 'Sans', 'Serif', 'Merriweather', 'Sorts Mill Goudy', 'Vollkorn'], ['default', 'sans', 'serif', 'Merriweather', 'OFLGoudyStMTT', 'Vollkorn']],
    justification: [['Default', 'Left', 'Justify'], ['default', 'left', 'justify']]
  };
  // TextZoomPreference / LineHeightPreference.stepValue: one increment up or down, rounded to the increment.
  function stepPref(pr, key, dir) {
    if (key === 'textZoom') { const next = Math.max(1, Math.round((pr.textZoom + dir * ZOOM_STEP) / ZOOM_STEP)) * ZOOM_STEP; return dir < 0 && pr.textZoom <= 1.98 * ZOOM_STEP ? pr.textZoom : next; }
    if (dir < 0 && pr.lineHeight <= LINE_MIN) return pr.lineHeight;
    return Math.max(LINE_MIN, Math.round((pr.lineHeight + dir * LINE_STEP) / LINE_STEP) * LINE_STEP);
  }
  // ReaderSettingsController.createFlowingTextModeSettingsView: display_options_popup.xml (300 dp on
  // menu_dropdown_panel_holo_light, top right) with pref_item.xml rows in addTheme, addTypeFace, addJustification,
  // addBrightness, addTextSize, addLineHeight order; the spinners drop down (Preference.Spinner, spinnerMode dropdown).
  function displayOptions(ctx, pr) {
    const b = key => S(ctx, 'books', key), open = ctx.ui.bkSpin;
    const item = (title, body) => `<div class="bk28-pref"><b>${e(b(title))}</b>${body}</div>`;
    const spinner = key => {
      const [entries, values] = PREF_SPINNERS[key], at = Math.max(0, values.indexOf(String(pr[key])));
      return `<div class="bk28-pspin-wrap"><button class="bk28-pspin" data-action="bk-pref-spin" data-id="${key}">${e(b(entries[at]))}</button>${open === key ? `<div class="bk28-pdrop">${entries.map((entry, n) => `<button data-action="bk-pref" data-id="${key}:${values[n]}">${e(b(entry))}</button>`).join('')}</div>` : ''}</div>`;
    };
    const plus = (key, label, smaller, larger, kind, canSmaller) => `<div class="bk28-plus"><button data-action="bk-pref-step" data-id="${key}:-1" aria-label="${e(b(smaller))}"${canSmaller ? '' : ' disabled'}><img src="assets/bk28-ic_settings_${kind}_smaller_${canSmaller ? 'on' : 'off'}_holo_light.png" alt=""></button><span>${label}</span><button data-action="bk-pref-step" data-id="${key}:1" aria-label="${e(b(larger))}"><img src="assets/bk28-ic_settings_${kind}_larger_on_holo_light.png" alt=""></button></div>`;
    const auto = pr.brightness < 0;
    const bright = `<div class="bk28-bright"><label><input type="checkbox" data-action="bk-pref-auto"${auto ? ' checked' : ''}><span>${e(b('AUTO'))}</span></label><input type="range" min="5" max="100" value="${auto ? 100 : pr.brightness}" data-bk-bright aria-label="${e(b('BRIGHTNESS'))}"${auto ? ' disabled' : ''}></div>`;
    return `<div class="bk28-options-scrim" data-action="bk-options"></div><div class="bk28-options" role="dialog" aria-label="${e(b('Display options'))}">${item('THEME', spinner('theme'))}${item('TYPEFACE', spinner('typeface'))}${item('TEXT ALIGNMENT', spinner('justification'))}${item('BRIGHTNESS', bright)}${item('FONT SIZE', plus('textZoom', `${Math.round(pr.textZoom * 100)}%`, 'Decrease font size', 'Increase font size', 'fontsize', pr.textZoom > 1.98 * ZOOM_STEP))}${item('LINE HEIGHT', plus('lineHeight', `${Math.round(pr.lineHeight / 1.5 * 100)}%`, 'Decrease line height', 'Increase line height', 'lineheight', pr.lineHeight > LINE_MIN))}</div>`;
  }
  // TableOfContentsActivityLight (phones): the "Contents" action bar over popup_background_color_light, toc_popup.xml's
  // TabRow (Chapters, Bookmarks, Notes on toc_tab with titlebar_divider) and the chapters in list_item_navigation.xml rows:
  // the title and the start page, both bold for the current chapter. Bookmarks and Notes show their empty views.
  function bookContents(ctx, book, index) {
    const b = key => S(ctx, 'books', key), tab = ctx.ui.bkTocTab || 'chapters';
    const current = book.starts.filter(start => start <= index).length - 1, marks = window.PlayMore ? window.PlayMore.bookmarks(ctx.data)[book.id] || [] : [];
    const tabs = [['chapters', 'Chapters'], ['bookmarks', 'Bookmarks'], ['notes', 'Notes']].map(([id, key]) => `<button class="${tab === id ? 'on' : ''}" data-action="bk-toc-tab" data-id="${id}">${e(b(key))}</button>`).join('<i></i>');
    const body = tab === 'chapters' ? `<div class="bk28-toc-list">${book.starts.map((start, n) => `<button class="${n === current ? 'current' : ''}" data-action="bk-chapter" data-id="${start}"><span>${e(book.pages[start].replace(/\n/g, ' '))}</span><em>${start + 1}</em></button>`).join('')}</div>`
      : tab === 'bookmarks' && marks.length ? `<div class="bk28-toc-list">${marks.map(at => `<button data-action="bk-chapter" data-id="${at}"><span>${e(book.pages[at].replace(/\n/g, ' '))}</span><em>${at + 1}</em></button>`).join('')}</div>`
      : tab === 'bookmarks' ? `<div class="bk28-toc-empty"><p>${e(b('Any pages you bookmark will be listed here.'))}</p><img src="assets/bk28-bookmark_sample_half.png" alt=""></div>` : '<div class="bk28-toc-empty"></div>';
    return `<div class="app-view pa-app bk28-toc"><header class="pb-top bk28-reader-bar"><button class="bk28-reader-up" data-action="bk-toc" aria-label="${e(ctx.t('Back'))}"><img src="assets/bk28-ic_ab_back_holo_light.png" alt=""><img src="assets/bk28-ic_corpora_books_color.png" alt=""></button><span><b class="bk28-toc-title">${e(b('Contents'))}</b></span></header><nav class="bk28-toc-tabs">${tabs}</nav>${body}</div>`;
  }
  function books(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t, data} = ctx, page = ui.paPage?.['play-books'] || 'read', progress = data.playBooks || {}, b = key => S(ctx, 'books', key);
    if (ui.sub === 'reader') {
      const book = BOOKS.find(item => item.id === ui.paItem) || BOOKS[0], index = Math.min(progress[book.id] || 0, book.pages.length - 1);
      if (ui.bkToc) return bookContents(ctx, book, index);
      const heading = book.starts.includes(index), pr = bookPrefs(data), night = pr.theme === '1', tone = night ? 'dark' : 'light';
      const text = book.pages[index].split('\n').filter(Boolean).map((p, i) => heading ? `<h2${i ? ' class="sub"' : ''}>${e(p)}</h2>` : `<p>${e(p)}</p>`).join('');
      const style = `--bk-zoom:${pr.textZoom};--bk-lh:${(pr.lineHeight / 1.5).toFixed(4)};--bk-dim:${pr.brightness < 0 ? 0 : ((100 - pr.brightness) / 100 * .7).toFixed(3)}`;
      return `<div class="app-view pa-app pb-reader bk28-theme-${THEME_KEYS[pr.theme] || 'day'} bk28-face-${e(pr.typeface)} bk28-just-${e(pr.justification)}${ui.paBars === false && !ui.bkOptions ? ' bare' : ''}" style="${style}"><header class="pb-top bk28-reader-bar${night ? ' dark' : ''}"><button class="bk28-reader-up" data-action="back" aria-label="${e(t('Back'))}"><img src="assets/${night ? 'ic_ab_back_holo_dark' : 'bk28-ic_ab_back_holo_light'}.png" alt=""><img src="assets/bk28-ic_corpora_books_color.png" alt=""></button><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span><button class="pa-btn bk28-action" data-action="bk-toc" aria-label="${e(S(ctx, 'books', 'Contents'))}"><img src="assets/bk28-ic_menu_toc_${tone}.png" alt=""></button><button class="pa-btn bk28-action${ui.bkOptions ? ' on' : ''}" data-action="bk-options" aria-label="${e(S(ctx, 'books', 'Display options'))}"><img src="assets/bk28-ic_menu_settings_${tone}.png" alt=""></button><button class="pa-btn" data-action="px-reader-menu" aria-label="${e(t('More options'))}"><img class="bk28-icon" src="assets/ic_menu_moreoverflow_normal_holo_${tone}.png" alt=""></button></header><div class="pb-page" data-action="pa-reader-tap">${text}</div><footer class="pb-bottom"><i style="--p:${(index / Math.max(1, book.pages.length - 1) * 100).toFixed(1)}%"></i><span>${index + 1} / ${book.pages.length}</span></footer><div class="bk28-dim"></div>${ui.bkOptions ? displayOptions(ctx, pr) : ''}</div>`;
    }
    const card = book => `<div class="bk28-card" role="button" tabindex="0" data-action="pa-book" data-id="${book.id}" aria-label="${e(book.title)}"><div class="bk28-thumb">${art('book', seedOf(book.id), book.title, book.author)}</div><div class="bk28-info"><b>${e(book.title)}</b><small>${e(book.author)}</small><button class="bk28-overflow" data-action="px-doc" data-id="book:${book.id}" aria-label="${e(t('More options'))}"><img src="assets/bk28-ic_menu_moreoverflow_card_dark_normal.png" alt=""></button></div></div>`;
    const filter = ui.bkFilter || 0;
    const head = page === 'read' ? `<h3 class="bk28-header">${e(b('Recent'))}</h3>`
      : `<div class="bk28-filter"><button class="bk28-spinner" data-action="pa-books-filter">${e(b(BOOK_FILTERS[filter]))}</button>${ui.bkFilterOpen ? `<div class="bk28-dropdown">${BOOK_FILTERS.map((key, n) => `<button class="${n === filter ? 'on' : ''}" data-action="pa-books-filter-set" data-id="${n}">${e(b(key))}</button>`).join('')}</div>` : ''}</div><hr class="bk28-divider">`;
    return `<div class="app-view pa-app pa-books bk28"><header class="bk28-bar"><button class="bk28-home" data-action="pa-drawer" aria-label="${e(b('Play Books'))}"><img class="bk28-toggle" src="assets/bk28-ic_drawer_white.png" alt=""><img class="bk28-logo" src="assets/bk28-ic_corpora_books.png" alt=""></button><b>${e(b(page === 'read' ? 'Read Now' : 'My Library'))}</b><button class="pa-btn" data-action="pa-search" aria-label="${e(b('Search'))}"><img class="bk28-icon" src="assets/bk28-ic_menu_search_dark.png" alt=""></button><button class="pa-btn" data-action="pa-menu" aria-label="${e(t('More options'))}"><img class="bk28-icon" src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="bk28-scroll">${head}<div class="bk28-grid">${(window.PlayMore ? window.PlayMore.libraryBooks(ctx) : BOOKS).map(card).join('')}</div></div></div>`;
  }
  // The action bar overflows with their local actions (jb-play-more.js).
  function menu(ctx) {
    return window.PlayMore ? window.PlayMore.menu(ctx) : [];
  }

  // ---- Play Games ----
  function games(ctx) {
    const {ui, t} = ctx, page = ui.paPage?.['play-games'] || 'now';
    const icon = g => art('icon', seedOf(g.id), g.title);
    const gameCard = g => card({action: 'pa-game', id: g.id, artHtml: icon(g), title: g.title, sub: g.dev, note: `${g.got} / ${g.achievements}`, cls: ' pg-game'});
    const listRow = g => `<div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${g.id}"><span class="pg-icon">${icon(g)}</span><span class="pg-copy"><b>${e(g.title)}</b><small>${e(g.dev)}</small></span><button class="pa-dots" data-action="pa-unsupported" aria-label="More options">${glyph.overflow}</button><em>${e(t(g.state))}</em></div>`;
    if (ui.sub === 'game') {
      const g = GAMES.find(item => item.id === ui.paItem) || GAMES[0];
      return `<div class="app-view pa-app pa-games">${bar(ctx, {title: g.title, up: true, actions: btn('pa-unsupported', t('More options'), 'overflow')})}<div class="pa-scroll"><div class="pg-hero">${art('poster', seedOf(g.id) + 1, '')}<span class="pg-hero-icon">${icon(g)}</span></div><div class="pg-detail"><b>${e(g.title)}</b><small>${e(g.dev)}</small><button class="pa-chip big" data-action="pa-game-play">${e(t('PLAY'))}</button></div>${section(t('Achievements'))}<div class="pg-achievements">${Array.from({length: Math.min(6, g.achievements)}, (_, i) => `<div class="pg-ach${i < g.got ? ' got' : ''}"><span>${glyph.trophy}</span><b>${e(AndroidStrings.format(t('Achievement %d'), i + 1))}</b><small>${e(t(i < g.got ? 'Unlocked' : 'Locked'))}</small></div>`).join('')}</div></div></div>`;
    }
    let body;
    if (page === 'now') body = `<div class="pg-welcome"><div><h2>${e(t('Welcome!'))}</h2><p>${e(t('Discover new games by seeing what your friends are playing on Google Play Games.'))}</p></div></div>${section(t('My games'), t('SEE MORE'), 'pa-games-mine')}<div class="pa-grid">${GAMES.slice(0, 2).map(gameCard).join('')}</div>${section(t('Players'), t('SEE MORE'), 'pa-games-players')}<p class="pa-note">${e(t('Most recently played'))}</p><div class="pa-grid">${PLAYERS.map((p, i) => card({action: 'pa-unsupported', id: p.name, artHtml: art('icon', i + 4, p.name), title: p.name, sub: p.game})).join('')}</div>`;
    else if (page === 'mine') body = `${section(t('My Games'))}<div class="pa-grid">${GAMES.map(gameCard).join('')}</div>`;
    else if (page === 'players') body = `${section(t('Players'))}<div class="pa-grid">${PLAYERS.map((p, i) => card({action: 'pa-unsupported', id: p.name, artHtml: art('icon', i + 4, p.name), title: p.name, sub: p.game})).join('')}</div>`;
    else if (page === 'activity') body = `${section(t('My Activity'))}<div class="pg-list">${GAMES.filter(g => g.got).map(g => `<div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${g.id}"><span class="pg-icon">${icon(g)}</span><span class="pg-copy"><b>${e(t('Achievement unlocked'))}</b><small>${e(g.title)}</small></span></div>`).join('')}</div>`;
    else {
      const tab = ui.paGamesTab || 'popular';
      body = `<nav class="pa-tabs">${[['featured', 'FEATURED'], ['popular', 'POPULAR'], ['multiplayer', 'POPULAR MULTIPLAYER']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="pa-gtab" data-id="${id}">${e(t(label))}</button>`).join('')}</nav><div class="pg-list">${(tab === 'featured' ? GAMES.slice(1) : tab === 'multiplayer' ? GAMES.slice(2) : GAMES).map(listRow).join('')}</div>`;
    }
    const title = t(APPS['play-games'].pages.find(p => p[0] === page)[1]);
    return `<div class="app-view pa-app pa-games">${bar(ctx, {title: page === 'now' ? t('Play Games') : title, actions: btn('pa-unsupported', t('More options'), 'overflow')})}<div class="pa-scroll">${body}</div></div>`;
  }

  function render(ctx) {
    const more = window.PlayMore?.render(ctx);
    if (more) return more;
    if (ctx.app === 'play-music') return music(ctx);
    if (ctx.app === 'play-movies') return movies(ctx);
    if (ctx.app === 'play-books') return books(ctx);
    return games(ctx);
  }
  // The navigation drawer: the app's pages, the current one highlighted.
  function drawer(ctx) {
    const app = APPS[ctx.app], page = ctx.ui.paPage?.[ctx.app] || DEFAULT[ctx.app];
    // Books: HomeFragment.createSideDrawerItems (Read Now, My Library, Shop) in side_menu_list_item rows (64 dp, 21 sp
    // sans-serif-light #505050) on #fafafa, the current one on library_side_drawer_item_selected_color (#25000000).
    // Music: HomeMenu.FREE_ITEM_SCREENS (Listen Now, My Library, Playlists, Instant Mixes, Shop) in the same
    // side_panel_list / side_menu_list_item rows, under the action bar, with #23000000 dividers.
    if (ctx.app === 'play-music') { const m = key => S(ctx, 'music', key); return `<div class="pa-drawer-scrim" data-action="close-overlay"></div><nav class="bk28-drawer pm5-drawer" aria-label="${e(m('Play Music'))}">${[['listen', 'Listen Now'], ['library', 'My Library'], ['playlists', 'Playlists'], ['mixes', 'Instant Mixes']].map(([id, key]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(m(key))}</button>`).join('')}<button data-action="pa-shop">${e(m('Shop'))}</button></nav>`; }
    if (ctx.app === 'play-books') { const b = key => S(ctx, 'books', key); return `<div class="pa-drawer-scrim" data-action="close-overlay"></div><nav class="bk28-drawer" aria-label="${e(b('Play Books'))}">${[['read', 'Read Now'], ['library', 'My Library']].map(([id, key]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(b(key))}</button>`).join('')}<button data-action="pa-shop">${e(b('Shop'))}</button></nav>`; }
    return `<div class="pa-drawer-scrim" data-action="close-overlay"></div><nav class="pa-drawer pa-${app.key}" aria-label="${e(ctx.t(app.title))}">${app.pages.map(([id, label]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(ctx.t(label))}</button>`).join('')}</nav>`;
  }
  const bookPages = id => (BOOKS.find(b => b.id === id) || BOOKS[0]).pages.length;
  const music3 = tracks => albums(tracks);
  window.PlayApps = {DEFAULT, APPS, MOVIES, SHOWS, BOOKS, GAMES, BOOK_PREFS, art, card, render, drawer, menu, bookPages, bookPrefs, stepPref, albums: music3};
})();
