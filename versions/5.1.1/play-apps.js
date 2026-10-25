/* The Google Play media apps of the Nexus 6 factory image (LMY48Y). Audit step 4 rebuilds each from its APK (the code
   from the odex files in the system image): Play Music 5.8.1809R, Play Movies & TV 3.6.16, Play Books 3.3.15 and
   Play Games 2.2.09. They share one look: a coloured action bar in the app's colorPrimary (lp-play.css: Music #EF6C00,
   Movies #ED3B3B, Books #039BE5, Games #4CAF50) with the drawer mark and a white glyph, a white navigation drawer,
   #EEEEEE pages with section titles and coloured "SEE ALL" / "SEE MORE" / "SHOP" chips, and white cards (title, grey
   subtitle, overflow dots). Covers, posters
   and game art are the simulator's own drawings; book pages are short public-domain excerpts. */
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
    'play-movies': {key: 'movies', title: 'Play Movies & TV', pages: [['watch', 'Watch Now'], ['library', 'My Library'], ['wishlist', 'My Wishlist']]},
    'play-books': {key: 'books', title: 'Play Books', pages: [['read', 'Read Now'], ['library', 'My Library']]},
    'play-games': {key: 'games', title: 'Play Games', pages: [['now', 'Play Now'], ['mine', 'My Games'], ['inbox', 'Inbox'], ['players', 'Players'], ['explore', 'Explore']]}
  };
  const DEFAULT = {'play-music': 'listen', 'play-movies': 'library', 'play-books': 'read', 'play-games': 'now'};
  const MOVIES = [
    {id: 'm1', title: 'The Last Lighthouse', year: 2014, mins: 104, progress: .42},
    {id: 'm2', title: 'Paper Planes', year: 2015, mins: 96, progress: 0},
    {id: 'm3', title: 'Northern Line', year: 2013, mins: 118, progress: .8},
    {id: 'm4', title: 'Orbit Nine', year: 2014, mins: 121, progress: 0}
  ];
  const SHOWS = [{id: 's1', title: 'Kitchen Science', seasons: 2, episodes: 12}, {id: 's2', title: 'Robots of Tomorrow', seasons: 1, episodes: 8}];
  const RECOMMENDED = [{id: 'r1', title: 'Summer in Lisbon', year: 2015, price: '$3.99'}, {id: 'r2', title: 'The Clockmaker', year: 2014, price: '$2.99'}];
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

  // The LP Play apps' Toolbar in colorPrimary (lp-play.css): the AppCompat DrawerArrowToggle (three 18 dp white bars, 3 dp
  // apart) or the material up arrow, the 20 sp title, the action icons; PlayHeaderListLayout's tabs sit in the same colour.
  const LPA = new Set(['play-music', 'play-movies', 'play-books', 'play-games']);
  function bar(ctx, {title, subtitle = '', up = false, actions = '', tabs = ''}) {
    const app = APPS[ctx.app];
    if (LPA.has(ctx.app)) return `<header class="lpa-bar"><button class="lpa-nav${up ? ' up' : ''}" data-action="${up ? 'back' : 'pa-drawer'}" aria-label="${e(up ? ctx.t('Back') : S(ctx, app.key, 'Open navigation drawer'))}">${up ? '<span></span>' : '<i></i><i></i><i></i>'}</button><b>${e(title)}</b>${actions}</header>${tabs}`;
    return '';
  }
  // The Play common library's PlayDrawer: play_drawer_profile_info (148 dp: the default cover under #38000000, the 64 dp
  // avatar, name and address in 14 sp white), the primary actions (48 dp, 14 sp sans-serif-medium #212121, the 24 dp icon
  // 32 dp from the text; the current one on #eeeeee with its _selected icon), the 16 dp separator, the secondary actions.
  function playDrawer(label, prefix, primary, secondary, page, profile = prefix) {
    return `<div class="pa-drawer-scrim lpa-scrim" data-action="close-overlay"></div><nav class="lpa-drawer" aria-label="${e(label)}"><div class="lpa-profile"><img class="lpa-cover" src="assets/${profile}bg_default_profile_art.png" alt=""><img class="lpa-avatar" src="assets/${profile}ic_profile_none.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><div class="lpa-primary">${primary.map(([id, text, icon, action]) => `<button class="${id === page ? 'on' : ''}" data-action="${action || 'pa-page'}" data-id="${id}"><img src="assets/${prefix}${icon}${id === page ? '_selected' : ''}.png" alt="">${e(text)}</button>`).join('')}</div><hr>${secondary.map(([text, action]) => `<button data-action="${action || 'pa-unsupported'}">${e(text)}</button>`).join('')}</nav>`;
  }
  const lpTabs = (tabs, current, action) => `<nav class="lpa-tabs">${tabs.map(([id, text]) => `<button class="${id === current ? 'on' : ''}" data-action="${action}" data-id="${id}">${e(text)}</button>`).join('')}</nav>`;
  // Music 5.8's menu/home_activity.xml has only Search (always) and the media route button (with a cast device); there is
  // no overflow: Settings, Help and Send feedback are drawer actions.
  const musicActions = ctx => `<button class="pa-btn" data-action="pa-search" aria-label="${e(S(ctx, 'music', 'Search'))}"><img class="lpa-icon" src="assets/pm58-ic_search_white.png" alt=""></button>`;
  const btn = (action, label, icon, id = '') => `<button class="pa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${glyph[icon]}</button>`;
  const section = (title, chip = '', chipAction = '', chipId = '') => `<div class="pa-section"><h3>${e(title)}</h3>${chip ? `<button class="pa-chip" data-action="${chipAction}"${chipId ? ` data-id="${e(chipId)}"` : ''}>${e(chip)}</button>` : ''}</div>`;
  // The card's overflow opens its own menu (doc: "album:…", "movie:…", "book:…"; lp-play-more.js); a store card's opens
  // the store. The pin is Play Movies' download; kept marks a downloaded album or book.
  const card = ({action, id, artHtml, title, sub, note = '', pin = false, pinned = false, kept = false, doc = '', cls = ''}) => `<div class="pa-card${cls}" role="button" tabindex="0" data-action="${action}" data-id="${e(id)}" aria-label="${e(title)}"><div class="pa-card-art">${artHtml}${kept ? `<span class="pa-kept">${glyph.pin}</span>` : ''}</div><div class="pa-card-copy"><b>${e(title)}</b><small>${e(sub)}</small>${note ? `<i>${e(note)}</i>` : ''}<button class="pa-dots" data-action="${doc ? 'px-doc' : action === 'pa-shop' ? 'pa-shop' : 'pa-unsupported'}"${doc ? ` data-id="${e(doc)}"` : ''} aria-label="More options">${glyph.overflow}</button>${pin ? `<button class="pa-pin${pinned ? ' on' : ''}" data-action="${doc ? 'px-movie-pin' : 'pa-unsupported'}" data-id="${e(id)}" aria-label="${pinned ? 'Remove download' : 'Download'}">${glyph.pin}</button>` : ''}</div></div>`;
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
      if (!artists.length && !found.length && !songs.length) body = `<div class="pm-search-empty"><img src="assets/pm58-ic_empty_state_search.png" alt=""><p>${e(m('No results found.'))}</p></div>`;
      else body = (artists.length ? section(m('Artists'), more(artists.length, 4), 'px-more', 'artists') + `<div class="pa-grid">${artists.slice(0, 4).map(artist => card({action: 'px-artist', id: artist, doc: `artist:${artist}`, artHtml: art('cover', seedOf(artist), artist), title: artist, sub: ''})).join('')}</div>` : '')
        + (found.length ? section(m('Albums'), more(found.length, 4), 'px-more', 'albums') + `<div class="pa-grid">${found.slice(0, 4).map(album => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, kept: keptAlbum(ctx, album.album), artHtml: art('cover', seedOf(album.album), album.album, album.artist), title: album.album, sub: album.artist})).join('')}</div>` : '')
        + (songs.length ? section(m('Songs'), more(songs.length, 5), 'px-more', 'songs') + `<div class="pm-songs">${songs.slice(0, 5).map(({track, id}) => `<button class="pm-song${id === state.track ? ' on' : ''}" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(track.album), track.album)}</span><span><b>${e(track.title)}</b><small>${e(track.artist)}</small></span></button>`).join('')}</div>` : '');
    }
    return `<div class="app-view pa-app pa-music pm-search"><header class="lpa-bar pm-searchbar"><button class="lpa-nav up" data-action="back" aria-label="${e(ctx.t('Back'))}"><span></span></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(m('Search music'))}" aria-label="${e(m('Search music'))}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(m('Clear query'))}"></button>` : ''}</label></header><div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
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
    let body = '', title = m('Listen Now'), subtitle = '', tabBar = '';
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
      // MyLibraryFragment's tabs in the PlayHeaderListLayout (14 sp sans-serif-medium, #99ffffff, white when selected with
      // a 2 dp white underline).
      tabBar = lpTabs(tabs.map(([id, label]) => [id, m(label)]), tab, 'pa-libtab');
      body = content;
    } else if (page === 'mixes') {
      // InstantMixesFragment: My mixes, Recommended (the simulator recommends a mix per album).
      title = m('Instant Mixes');
      const tab = ui.paMixTab || 'recommended';
      tabBar = lpTabs([['mine', m('My mixes')], ['recommended', m('Recommended')]], tab, 'pa-mixtab');
      body = tab === 'recommended' ? `<div class="pa-grid">${list.map(album => card({action: 'pa-album', id: album.album, doc: `album:${album.album}`, artHtml: art('cover', seedOf(album.album) + 3, album.album), title: album.album, sub: album.artist})).join('')}</div>` : '';
    } else {
      title = m('Playlists');
      const auto = [['Thumbs up', Object.values(ctx.data.playMusicThumbs || {}).filter(v => v === 1).length], ['Last added', tracks.length]];
      body = `${section(t('Auto playlists'))}<div class="pm-songs">${auto.map(([name, n], i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 5, name)}</span><span><b>${e(m(name))}</b><small>${e(AndroidStrings.format(t('%d songs'), n))}</small></span></button>`).join('')}</div>${state.playlists.length ? section(t('Playlists')) + `<div class="pm-songs">${state.playlists.map((p, i) => `<button class="pm-song" data-action="pa-libtab-songs"><span class="pm-qart">${art('cover', i + 2, p.name)}</span><span><b>${e(p.name)}</b><small>${e(AndroidStrings.format(t('%d songs'), p.tracks.length))}</small></span></button>`).join('')}</div>` : ''}`;
    }
    return `<div class="app-view pa-app pa-music">${bar(ctx, {title, subtitle, actions: musicActions(ctx), tabs: tabBar})}<div class="pa-scroll">${body}</div>${miniPlayer(ctx)}</div>`;
  }

  // ---- Play Movies & TV ----
  // Search in Play Movies & TV and Play Books (audit step 5): the expanded SearchView with the app's hint, then the
  // suggestions the app's provider gives for the library while typing (Videos: search_dropdown_item_icons_2line with
  // the thumbnail and title; Books: list_item_suggest_volume and the list_item_suggest_market row).
  function storeSearch(ctx) {
    const {ui} = ctx, movies = ctx.app === 'play-movies', key = movies ? 'movies' : 'books', s = k => S(ctx, key, k), q = String(ui.paQuery || '').trim().toLocaleLowerCase();
    const hint = s(movies ? 'Search for movies & shows' : 'Search Google Play'), clear = s('Clear query');
    const has = text => String(text).toLocaleLowerCase().includes(q);
    let rows = '';
    if (q && movies) rows = [...MOVIES, ...SHOWS].filter(item => has(item.title)).map(item => `<button class="pa-suggest-row" data-action="pa-movie" data-id="${e(item.id)}"><span class="pa-suggest-art">${art('poster', seedOf(item.id), item.title)}</span><span><b>${e(item.title)}</b></span></button>`).join('');
    if (q && !movies) rows = BOOKS.filter(book => has(book.title) || has(book.author)).map(book => `<button class="pa-suggest-row" data-action="pa-book" data-id="${e(book.id)}"><span class="pa-suggest-art">${art('book', seedOf(book.id), book.title)}</span><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span></button>`).join('') + `<button class="pa-suggest-row market" data-action="pa-unsupported"><span><b>${e(s('Search Google Play'))}</b></span></button>`;
    return `<div class="app-view pa-app ${movies ? 'pa-movies' : 'pa-books'} pm-search"><header class="lpa-bar pm-searchbar"><button class="lpa-nav up" data-action="back" aria-label="${e(ctx.t('Back'))}"><span></span></button><label class="pm-sv"><input data-pa-search value="${e(ui.paQuery || '')}" placeholder="${e(hint)}" aria-label="${e(hint)}" autocomplete="off" spellcheck="false">${ui.paQuery ? `<button class="pm-sv-clear" data-action="pa-search-clear" aria-label="${e(clear)}"></button>` : ''}</label></header>${rows ? `<div class="pa-suggest ${movies ? 'movies' : 'books'}">${rows}</div>` : ''}</div>`;
  }
  function movies(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t} = ctx, page = ui.paPage?.['play-movies'] || 'library', v = key => S(ctx, 'movies', key);
    if (ui.sub === 'movie') {
      const movie = MOVIES.find(m => m.id === ui.paItem) || SHOWS.find(s => s.id === ui.paItem) || MOVIES[0];
      const playing = ui.paPlaying !== false, total = (movie.mins || 24) * 60, pos = Math.floor(total * (movie.progress || 0)) + (ui.paSeconds || 0);
      const clock = s => `${Math.floor(s / 3600)}:${String(Math.floor(s / 60) % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
      return `<div class="app-view pa-app pm-video${ui.paBars === false ? ' bare' : ''}" data-action="pa-video-bars"><div class="pm-video-frame${playing ? ' playing' : ''}">${art('poster', seedOf(movie.id), movie.title)}</div><header class="pm-video-top"><button class="lpa-nav up" data-action="back" aria-label="${e(t('Back'))}"><span></span></button><b>${e(movie.title)}</b>${btn('pa-unsupported', t('Cast screen'), 'cast')}</header><button class="pm-video-play" data-action="pa-video-toggle" aria-label="${e(t(playing ? 'Pause' : 'Play'))}">${playing ? glyph.pause : glyph.play}</button><footer class="pm-video-bottom"><span>${clock(pos)}</span><i style="--p:${Math.min(100, pos / total * 100).toFixed(1)}%"></i><span>${clock(total)}</span></footer></div>`;
    }
    // search_menu: Search (always) and the media route button (only with a cast device); no overflow.
    const actions = `<button class="pa-btn" data-action="pa-search" aria-label="${e(v('Search'))}"><img class="lpa-icon" src="assets/mv36-abc_ic_search_api_mtrl_alpha.png" alt=""></button>`;
    const device = window.PlayMore ? window.PlayMore.onDevice(ctx.data) : [];
    const movieCard = m => card({action: 'pa-movie', id: m.id, doc: `movie:${m.id}`, artHtml: art('poster', seedOf(m.id), m.title), title: m.title, sub: `${m.year}, ${AndroidStrings.format(t('%d mins.'), m.mins)}`, pin: true, pinned: device.includes(m.id)});
    const shopCard = m => card({action: 'pa-shop', id: m.id, artHtml: art('poster', seedOf(m.id), m.title), title: m.title, sub: `${m.year} · ${m.price}`});
    let body, tabBar = '';
    if (page === 'watch') body = `<div class="pa-grid">${MOVIES.filter(m => m.progress).map(m => card({action: 'pa-movie', id: m.id, artHtml: art('poster', seedOf(m.id), m.title) + `<i class="pm-progress-strip" style="--p:${m.progress * 100}%"></i>`, title: m.title, sub: AndroidStrings.format(t('%d% watched'), Math.round(m.progress * 100))})).join('')}</div>${section(v('Recommended for You'), v('Shop'), 'pa-shop')}<div class="pa-grid">${RECOMMENDED.map(shopCard).join('')}</div>`;
    else if (page === 'wishlist') body = `${section(v('Movies'))}<div class="pa-grid">${RECOMMENDED.map(shopCard).join('')}</div>`;
    else {
      // MyLibraryFragment pages the movies and shows verticals (VerticalsHelper's titles) under PlayHeaderListLayout tabs.
      const tab = ui.paMovieTab || 'movies';
      tabBar = lpTabs([['movies', v('My Movies')], ['shows', v('My TV Shows')]], tab, 'pa-movietab');
      body = tab === 'shows' ? `<div class="pa-grid">${SHOWS.map(show => card({action: 'pa-movie', id: show.id, doc: `movie:${show.id}`, artHtml: art('poster', seedOf(show.id), show.title), title: show.title, sub: AndroidStrings.format(t('%d episodes'), show.episodes), pin: true, pinned: device.includes(show.id)})).join('')}</div>` : `<div class="pa-grid">${MOVIES.map(movieCard).join('')}</div>`;
    }
    const title = v(APPS['play-movies'].pages.find(p => p[0] === page)[1]);
    return `<div class="app-view pa-app pa-movies">${bar(ctx, {title, actions, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
  }

  // ---- Play Books ----
  // The reader's settings (LocalPreferences' defaults): themes 0 Day / 1 Night / 2 Sepia, typeface2, justification2, the
  // window brightness (-1 follows the system), textZoom (ReaderUtils' default 1, steps of 1/8) and lineHeight2 (1.5 shown
  // as 100%, steps of 0.1875, at least 1.125).
  const THEME_KEYS = ['day', 'night', 'sepia'];
  const BOOK_PREFS = {theme: '0', typeface: 'default', justification: 'default', brightness: -1, textZoom: 1, lineHeight: 1.5};
  const bookPrefs = data => ({...BOOK_PREFS, ...(data.bookPrefs || {})});
  const ZOOM_STEP = .125, LINE_STEP = .1875, LINE_MIN = 1.125;
  const PREF_SPINNERS = {
    typeface: [['Default', 'Sans', 'Serif', 'Merriweather', 'Sorts Mill Goudy', 'Vollkorn'], ['default', 'sans', 'serif', 'Merriweather', 'OFLGoudyStMTT', 'Vollkorn']],
    justification: [['Default', 'Left', 'Justify'], ['default', 'left', 'justify']]
  };
  // TextZoomPreference / LineHeightPreference.stepValue: one increment up or down, rounded to the increment.
  function stepPref(pr, key, dir) {
    if (key === 'textZoom') { const next = Math.max(1, Math.round((pr.textZoom + dir * ZOOM_STEP) / ZOOM_STEP)) * ZOOM_STEP; return dir < 0 && pr.textZoom <= 1.98 * ZOOM_STEP ? pr.textZoom : next; }
    if (dir < 0 && pr.lineHeight <= LINE_MIN) return pr.lineHeight;
    return Math.max(LINE_MIN, Math.round((pr.lineHeight + dir * LINE_STEP) / LINE_STEP) * LINE_STEP);
  }
  // Play Books 3.3.15's ReaderSettingsController.createFlowingTextModeSettingsView: display_options_popup.xml (300 dp on
  // card_background_default_light, top right) with 48 dp pref_item.xml rows and no headings, in addTheme, addBrightness,
  // addTypeFace, addJustification, addTextSize, addLineHeight order. pref_theme.xml's three "A" buttons (white, black
  // with #cccccc, books_sepia with books_chocolate; the chosen one ringed 3 dp in books_corpora_accent), pref_brightness.xml's
  // auto button and seek bar, the "T" / alignment labels before the spinners, and the pref_button_light buttons.
  function displayOptions(ctx, pr) {
    const b = key => S(ctx, 'books', key), open = ctx.ui.bkSpin;
    const spinner = key => {
      const [entries, values] = PREF_SPINNERS[key], at = Math.max(0, values.indexOf(String(pr[key])));
      return `<div class="bk33-pspin-wrap"><button class="bk33-pspin" data-action="bk-pref-spin" data-id="${key}" aria-label="${e(b(key === 'typeface' ? 'Typeface' : 'Text alignment'))}">${e(b(entries[at]))}</button>${open === key ? `<div class="bk33-pdrop">${entries.map((entry, n) => `<button data-action="bk-pref" data-id="${key}:${values[n]}">${e(b(entry))}</button>`).join('')}</div>` : ''}</div>`;
    };
    const themes = [['0', 'Day'], ['1', 'Night'], ['2', 'Sepia']].map(([value, key]) => `<button class="bk33-theme ${THEME_KEYS[value]}${pr.theme === value ? ' on' : ''}" data-action="bk-pref" data-id="theme:${value}" aria-label="${e(b(key))}">A</button>`).join('');
    const auto = pr.brightness < 0;
    const bright = `<button class="bk33-auto" data-action="bk-pref-auto" aria-pressed="${auto}" aria-label="${e(b('Automatic brightness'))}"><img src="assets/bk33-ic_settings_brightness_auto_${auto ? 'on' : 'off'}_holo_light.png" alt=""></button><input type="range" min="5" max="100" value="${auto ? 100 : pr.brightness}" data-bk-bright aria-label="${e(b('Brightness'))}"${auto ? ' disabled' : ''}>`;
    const canSmallerText = pr.textZoom > 1.98 * ZOOM_STEP, canSmallerLine = pr.lineHeight > LINE_MIN;
    const size = `<button class="bk33-btn bk33-letter small" data-action="bk-pref-step" data-id="textZoom:-1" aria-label="${e(b('Decrease font size'))}"${canSmallerText ? '' : ' disabled'}>T</button><span class="bk33-num">${Math.round(pr.textZoom * 100)}%</span><button class="bk33-btn bk33-letter large" data-action="bk-pref-step" data-id="textZoom:1" aria-label="${e(b('Increase font size'))}">T</button>`;
    const line = `<button class="bk33-btn" data-action="bk-pref-step" data-id="lineHeight:-1" aria-label="${e(b('Decrease line height'))}"${canSmallerLine ? '' : ' disabled'}><img src="assets/bk33-ic_settings_lineheight_smaller_${canSmallerLine ? 'on' : 'off'}_holo_light.png" alt=""></button><span class="bk33-num">${Math.round(pr.lineHeight / 1.5 * 100)}%</span><button class="bk33-btn" data-action="bk-pref-step" data-id="lineHeight:1" aria-label="${e(b('Increase line height'))}"><img src="assets/bk33-ic_settings_lineheight_larger_on_holo_light.png" alt=""></button>`;
    const row = (cls, label, body) => `<div class="bk33-pref ${cls}" aria-label="${e(b(label))}">${body}</div>`;
    return `<div class="bk33-options-scrim" data-action="bk-options"></div><div class="bk33-options" role="dialog" aria-label="${e(b('Display options'))}">${row('themes', 'Viewing theme', themes)}${row('bright', 'Brightness', bright)}${row('spin', 'Typeface', `<span class="bk33-label">T</span>${spinner('typeface')}`)}${row('spin', 'Text alignment', `<img class="bk33-label" src="assets/bk33-ic_settings_alignment_${pr.justification === 'justify' ? 'justify' : 'left'}_holo_light.png" alt="">${spinner('justification')}`)}${row('plus', 'Font size', size)}${row('plus', 'Line height', line)}</div>`;
  }
  // ContentsView (3.3.15): a PlayHeaderListLayout in books_corpora_primary with the close button (ic_close_wht_24dp), the
  // book's title and the Chapters / Bookmarks / Notes tab strip, then the ExpandableListView of top_level_chapter.xml rows
  // (16 dp gutter, the 14 sp title and the start page in 16 sp serif italic). Bookmarks and Notes show their empty views.
  function bookContents(ctx, book, index) {
    const b = key => S(ctx, 'books', key), tab = ctx.ui.bkTocTab || 'chapters';
    const current = book.starts.filter(start => start <= index).length - 1;
    const tabs = [['chapters', 'Chapters'], ['bookmarks', 'Bookmarks'], ['notes', 'Notes']].map(([id, key]) => `<button class="${tab === id ? 'on' : ''}" data-action="bk-toc-tab" data-id="${id}">${e(b(key))}</button>`).join('');
    const marks = window.PlayMore ? window.PlayMore.bookmarks(ctx.data)[book.id] || [] : [];
    const body = tab === 'bookmarks' && marks.length ? `<div class="bk33-toc-list">${marks.map(at => `<button data-action="bk-chapter" data-id="${at}"><span>${e(book.pages[at].replace(/\n/g, ' '))}</span><em>${at + 1}</em></button>`).join('')}</div>`
      : tab === 'chapters' ? `<div class="bk33-toc-list">${book.starts.map((start, n) => `<button class="${n === current ? 'current' : ''}" data-action="bk-chapter" data-id="${start}"><span>${e(book.pages[start].replace(/\n/g, ' '))}</span><em>${start + 1}</em></button>`).join('')}</div>`
      : `<div class="bk33-toc-empty">${tab === 'bookmarks' ? `<p>${e(b('To add a bookmark, touch the top corner of the page'))}</p>` : ''}</div>`;
    return `<div class="app-view pa-app bk33-toc"><header class="bk33-toc-head"><div class="bk33-toc-bar"><button data-action="bk-toc" aria-label="${e(b('Close table of contents'))}"><img src="assets/bk33-ic_close_wht_24dp.png" alt=""></button><b>${e(book.title)}</b></div><nav class="bk33-toc-tabs">${tabs}</nav></header>${body}</div>`;
  }
  function books(ctx) {
    if (ctx.ui.sub === 'search') return storeSearch(ctx);
    const {ui, t, data} = ctx, page = ui.paPage?.['play-books'] || 'read', progress = data.playBooks || {}, b = key => S(ctx, 'books', key);
    if (ui.sub === 'reader') {
      const book = BOOKS.find(b => b.id === ui.paItem) || BOOKS[0], index = Math.min(progress[book.id] || 0, book.pages.length - 1);
      if (ui.bkToc) return bookContents(ctx, book, index);
      const heading = book.starts.includes(index), pr = bookPrefs(data), night = pr.theme === '1', b = key => S(ctx, 'books', key);
      const text = book.pages[index].split('\n').filter(Boolean).map((p, i) => heading ? `<h2${i ? ' class="sub"' : ''}>${e(p)}</h2>` : `<p>${e(p)}</p>`).join('');
      const style = `--bk-zoom:${pr.textZoom};--bk-lh:${(pr.lineHeight / 1.5).toFixed(4)};--bk-dim:${pr.brightness < 0 ? 0 : ((100 - pr.brightness) / 100 * .7).toFixed(3)}`;
      return `<div class="app-view pa-app pb-reader bk33-theme-${THEME_KEYS[pr.theme] || 'day'} bk33-face-${e(pr.typeface)} bk33-just-${e(pr.justification)}${ui.paBars === false && !ui.bkOptions ? ' bare' : ''}" style="${style}"><header class="pb-top${night ? ' bk33-dark' : ''}"><button class="lpa-nav up dark" data-action="back" aria-label="${e(t('Back'))}"><span></span></button><span><b>${e(book.title)}</b><small>${e(book.author)}</small></span><button class="pa-btn bk33-action" data-action="bk-toc" aria-label="${e(b('Contents'))}"><img src="assets/bk33-ic_toc_24dp.png" alt=""></button><button class="pa-btn bk33-action${ui.bkOptions ? ' on' : ''}" data-action="bk-options" aria-label="${e(b('Display options'))}"><img src="assets/bk33-ic_text_format_24dp.png" alt=""></button>${btn('px-reader-menu', t('More options'), 'overflow')}</header><div class="pb-page" data-action="pa-reader-tap">${text}</div><footer class="pb-bottom"><i style="--p:${(index / Math.max(1, book.pages.length - 1) * 100).toFixed(1)}%"></i><span>${index + 1} / ${book.pages.length}</span></footer><div class="bk33-dim"></div>${ui.bkOptions ? displayOptions(ctx, pr) : ''}</div>`;
    }
    const cover = b => art('book', seedOf(b.id), b.title, b.author);
    // menu/fragment_home.xml: Search (always) and Sort (ifRoom, My Library only) as icons, Refresh in the overflow.
    const icon = (action, label, src, id = '') => `<button class="pa-btn" data-action="${action}"${id ? ` data-id="${id}"` : ''} aria-label="${e(label)}"><img class="lpa-icon" src="assets/${src}.png" alt=""></button>`;
    const actions = icon('pa-search', b('Search'), 'bk33-ic_search_wht_24dp') + (page === 'library' ? icon('px-dialog', b('Sort'), 'bk33-ic_sort_wht_24dp', 'sort') : '') + icon('pa-menu', t('More options'), 'bk33-abc_ic_menu_moreoverflow_mtrl_alpha');
    // My Library pages LibraryFilter's non-empty filters (books_view_pager) as PlayHeaderListLayout tabs.
    const tabBar = page === 'library' ? lpTabs([['all', b('All books')], ['purchases', b('Purchases')]], ui.bkFilterTab || 'all', 'pa-bookstab') : '';
    // The library in the Sort order without what was deleted; a book not downloaded loses its pin.
    const library = window.PlayMore ? window.PlayMore.libraryBooks(ctx) : BOOKS, notKept = window.PlayMore ? window.PlayMore.booksState(data).notKept : [];
    const body = page === 'read'
      ? `${section(b('Recent'), b('SEE ALL'), 'pa-see-all')}<div class="pa-grid pb-covers">${library.map(b => `<div class="pb-cover" role="button" tabindex="0" data-action="pa-book" data-id="${b.id}" aria-label="${e(b.title)}">${cover(b)}${notKept.includes(b.id) ? '' : `<span class="pb-pinned">${glyph.pin}</span>`}</div>`).join('')}</div>`
      : `<div class="pa-grid">${library.map(b => card({action: 'pa-book', id: b.id, doc: `book:${b.id}`, kept: !notKept.includes(b.id), artHtml: cover(b), title: b.title, sub: b.author, note: progress[b.id] ? AndroidStrings.format(t('%d% read'), Math.round(progress[b.id] / (b.pages.length - 1) * 100)) : ''})).join('')}</div>`;
    return `<div class="app-view pa-app pa-books">${bar(ctx, {title: b(page === 'read' ? 'Read Now' : 'My Library'), actions, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
  }

  // ---- Play Games ----
  // Play Games 2.2: Play Now's sections (Continue playing, Discover new games, Add players you know), My Games, Inbox
  // (games_inbox_null_state_*), Players and Explore (FEATURED, POPULAR, POPULAR MULTIPLAYER tabs); the overflow is
  // games_default_menu (Settings).
  function games(ctx) {
    const {ui, t} = ctx, page = ui.paPage?.['play-games'] || 'now', p = key => S(ctx, 'games', key);
    const icon = g => art('icon', seedOf(g.id), g.title);
    const overflow = `<button class="pa-btn" data-action="pa-menu" aria-label="${e(t('More options'))}"><img class="lpa-icon" src="assets/pg22-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button>`;
    const gameCard = g => card({action: 'pa-game', id: g.id, doc: `game:${g.id}`, artHtml: icon(g), title: g.title, sub: g.dev, note: `${g.got}/${g.achievements}`, cls: ' pg-game'});
    const players = window.PlayMore ? window.PlayMore.players(ctx.data) : PLAYERS;
    const playerCard = (pl, i) => card({action: 'px-player', id: pl.name, doc: `player:${pl.name}`, artHtml: art('icon', i + 4, pl.name), title: pl.name, sub: pl.game});
    const listRow = g => `<div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${g.id}"><span class="pg-icon">${icon(g)}</span><span class="pg-copy"><b>${e(g.title)}</b><small>${e(g.dev)}</small></span>${g.state === 'PURCHASED' ? `<em>${e(p('PURCHASED'))}</em>` : ''}</div>`;
    if (ui.sub === 'game') {
      const g = GAMES.find(item => item.id === ui.paItem) || GAMES[0];
      return `<div class="app-view pa-app pa-games">${bar(ctx, {title: g.title, up: true, actions: overflow})}<div class="pa-scroll"><div class="pg-hero">${art('poster', seedOf(g.id) + 1, '')}<span class="pg-hero-icon">${icon(g)}</span></div><div class="pg-detail"><b>${e(g.title)}</b><small>${e(g.dev)}</small><button class="pa-chip big" data-action="pa-game-play">${e(p('PLAY'))}</button></div>${section(p('Achievements'))}<div class="pg-achievements">${Array.from({length: Math.min(6, g.achievements)}, (_, i) => `<div class="pg-ach${i < g.got ? ' got' : ''}"><span>${glyph.trophy}</span><b>${e(AndroidStrings.format(t('Achievement %d'), i + 1))}</b><small>${e(t(i < g.got ? 'Unlocked' : 'Locked'))}</small></div>`).join('')}</div></div></div>`;
    }
    let body, tabBar = '';
    if (page === 'now') body = `${section(p('Continue playing'))}<div class="pa-grid">${GAMES.slice(0, 2).map(gameCard).join('')}</div>${section(p('Discover new games'))}<div class="pg-list">${GAMES.slice(2).map(listRow).join('')}</div>${section(p('Add players you know'))}<div class="pa-grid">${players.map(playerCard).join('')}</div>`;
    else if (page === 'mine') body = `<div class="pa-grid">${GAMES.map(gameCard).join('')}</div>`;
    else if (page === 'inbox') body = `<div class="pg-null"><p>${e(p('Game on! See invitations and matches in progress here.'))}</p><button class="pa-chip big" data-action="pa-page" data-id="explore">${e(p('FIND MULTIPLAYER GAMES'))}</button></div>`;
    else if (page === 'players') body = `<div class="pa-grid">${players.map(playerCard).join('')}</div>`;
    else {
      const tab = ui.paGamesTab || 'featured';
      tabBar = lpTabs([['featured', p('FEATURED')], ['popular', p('POPULAR')], ['multiplayer', p('POPULAR MULTIPLAYER')]], tab, 'pa-gtab');
      body = `<div class="pg-list">${(tab === 'featured' ? GAMES.slice(1) : tab === 'multiplayer' ? GAMES.slice(2) : GAMES).map(listRow).join('')}</div>`;
    }
    const title = p(APPS['play-games'].pages.find(item => item[0] === page)[1]);
    return `<div class="app-view pa-app pa-games">${bar(ctx, {title, actions: overflow, tabs: tabBar})}<div class="pa-scroll">${body}</div></div>`;
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
    // Music: HomeMenuScreens' free list (Listen Now, My Library, Playlists, Instant Mixes, Shop) with HomeActivity$Screen's
    // ic_drawer_* icons, then Settings, Help and Send feedback.
    // Movies: VideosDrawerHelper's verticals 4, 16, 8 (Watch Now, My Library, My Wishlist) with their ic_drawer_* icons,
    // Shop, then the secondary Settings and Help & feedback.
    // Books: HomeSideDrawer.populateDrawerActions: Read Now, My Library, Shop, then Settings and Help & feedback.
    // Games: the destination drawer's list (Play Now, My Games, Inbox, Players, Explore with games_ic_drawer_* icons), then
    // Settings and Help & Feedback.
    if (ctx.app === 'play-games') { const p = key => S(ctx, 'games', key); return playDrawer(p('Play Games'), 'pg22-', [['now', p('Play Now'), 'games_ic_drawer_playnow'], ['mine', p('My Games'), 'games_ic_drawer_mygames'], ['inbox', p('Inbox'), 'games_ic_drawer_inbox'], ['players', p('Players'), 'games_ic_drawer_players'], ['explore', p('Explore'), 'games_ic_drawer_explore']], [[p('Settings'), 'px-settings'], [p('Help & Feedback')]], page, 'pm58-'); }
    if (ctx.app === 'play-books') { const b = key => S(ctx, 'books', key); return playDrawer(b('Play Books'), 'bk33-', [['read', b('Read Now'), 'ic_drawer_readnow'], ['library', b('My Library'), 'ic_drawer_mylibrary'], ['shop', b('Shop'), 'ic_drawer_shop', 'pa-shop']], [[b('Settings'), 'px-settings'], [b('Help & feedback')]], page, 'mv36-'); }
    if (ctx.app === 'play-movies') { const v = key => S(ctx, 'movies', key); return playDrawer(v('Google Play'), 'mv36-', [['watch', v('Watch Now'), 'ic_drawer_watchnow'], ['library', v('My Library'), 'ic_drawer_mymovielibrary'], ['wishlist', v('My Wishlist'), 'ic_drawer_wishlist'], ['shop', v('Shop'), 'ic_drawer_shop', 'pa-shop']], [[v('Settings'), 'px-settings'], [v('Help & feedback')]], page); }
    if (ctx.app === 'play-music') { const m = key => S(ctx, 'music', key); return playDrawer(m('Play Music'), 'pm58-', [['listen', m('Listen Now'), 'ic_drawer_listennow'], ['library', m('My Library'), 'ic_drawer_mymusiclibrary'], ['playlists', m('Playlists'), 'ic_drawer_playlists'], ['mixes', m('Instant Mixes'), 'ic_drawer_radio'], ['shop', m('Shop'), 'ic_drawer_shop', 'pa-shop']], [[m('Settings'), 'px-settings'], [m('Help')], [m('Send feedback')]], page); }
    return `<div class="pa-drawer-scrim" data-action="close-overlay"></div><nav class="pa-drawer pa-${app.key}" aria-label="${e(ctx.t(app.title))}">${app.pages.map(([id, label]) => `<button class="${id === page ? 'on' : ''}" data-action="pa-page" data-id="${id}">${e(ctx.t(label))}</button>`).join('')}</nav>`;
  }
  // Action bar overflow menus (the pa-menu overlay).
  // fragment_home's Refresh, games_default_menu's Settings (lp-play-more.js).
  function menu(ctx) {
    return window.PlayMore ? window.PlayMore.menu(ctx) : [];
  }
  const bookPages = id => (BOOKS.find(b => b.id === id) || BOOKS[0]).pages.length;
  const music3 = tracks => albums(tracks);
  window.PlayApps = {DEFAULT, APPS, MOVIES, SHOWS, BOOKS, GAMES, PLAYERS, BOOK_PREFS, art, card, render, drawer, menu, bookPages, bookPrefs, stepPref, albums: music3};
})();
