/* The Play media apps' own operations on the KTU84P image (play-apps.js draws the screens). From the APKs:
   - Play Music 5.2.1301L: search's "%d MORE" opens the cluster's full list (SearchClustersFragment's ARTISTS / ALBUMS /
     SONGS); DocumentMenuHandler.addMenuEntries for an album (Start instant mix, Play next, Add to queue, Keep on device,
     Add to playlist, Go to artist, Shop this artist) and an artist (Start instant mix, Shop this artist) with a Play Music
     account without All Access; ScreenMenuHandler's now playing menu (Start instant mix, Add to playlist, Go to artist,
     Go to album, Clear queue, Save as playlist); MusicSettingsActivity on music_settings.xml as it shows without All
     Access (the content filter titled for mixes, no debug logs): GENERAL, DOWNLOADING, STREAMING, DEVELOPER.
   - Play Movies 3.0.27: the pin's Download / Remove download (watch_details_menu.xml), On Device lists what is kept,
     a show found by search opens like the library's; Settings is preferences.xml (General, Streaming on mobile
     networks, Downloads, About; the surround category needs 5.1 output, which the Nexus 5 lacks).
   - Play Books 3.1.33: BooksCardsHomeView.populateBookMenu for an owned book (Keep on device / Don't keep, Delete from
     library, About this book), SortFragment (Recently read, Title, Author), AppSettingsActivity's items (Account,
     Auto-rotate screen, Download over Wi-Fi only, Use volume key to turn pages, Use 3D effect for page turning, Enable
     PDF uploading, Automatically read aloud), fragment_reader.xml's About this book, Share and Settings.
   - Play Games 1.1.04: games_destination_game_context_menu.xml (View in Play Store), the player context menu (View
     Google+ profile, Dismiss), the player detail page (games_destination_player_detail_*: VIEW PROFILE, Recently
     played) and Settings, which is Google Play services' GamesSettingsActivity (Google Account, Multiplayer
     notifications, Requests notifications, Muted games).
   What stays a limit: Equalizer (Music effects), Cast, buying, Help and feedback, Read aloud and account pickers. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[`x.${key}`] || window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  const ACCOUNT = 'kitkat.demo@gmail.com', MUSIC_VERSION = 'v5.2.1301L.891271', MOVIES_VERSION = '3.0.27', DEVICE_ID = '3a7c51f0b2e94d18';
  const P = () => window.PlayApps;
  const art = (...args) => P().art(...args);
  const seedOf = id => [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  // Local state: kept albums, the apps' preferences, downloaded movies, books kept / removed and the library order.
  const store = (data, key, init) => (data[key] ||= init);
  const prefs = (data, app, defaults) => ({...defaults, ...(data.playPrefs?.[app] || {})});
  const setPref = (data, app, patch) => { data.playPrefs = {...(data.playPrefs || {}), [app]: {...(data.playPrefs?.[app] || {}), ...patch}}; };
  const MUSIC_PREFS = {account: true, contentFilter: false, cacheStreamed: true, autoCache: false, downloadWifi: true, streamWifi: false, quality: 'normal'};
  const MOVIE_PREFS = {cards: true, captionSize: 1, warning: true, restrict: true, network: 0, quality: 0};
  const BOOK_PREFS = {rotation: 0, wifiOnly: true, volumeKeys: false, pageTurn3d: true, pdf: false, autoRead: false};
  const GAME_PREFS = {multiplayer: true, requests: true};
  const check = on => `<i class="pmx-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="pmx-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const cat = title => `<h4 class="pmx-cat">${e(title)}</h4>`;
  const backBar = (ctx, title, logo) => `<header class="pm5-bar ${{'play-movies': 'mv3-bar', 'play-books': 'bk3-bar', 'play-games': 'pg1-bar'}[ctx.app] || ''}"><button class="pm5-home" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="pm5-toggle" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="pm5-logo" src="assets/${logo}" alt=""></button><span class="pm5-title"><b>${e(title)}</b></span></header>`;
  const LOGO = {'play-music': 'pm52-ic_corpora_music_white.png', 'play-movies': 'mv3-ic_movie.png', 'play-books': 'bk3-ic_corpora_books.png', 'play-games': 'pg1-ic_ab_play_games.png'};
  const APP_CLASS = {'play-music': 'pa-music', 'play-movies': 'pa-movies', 'play-books': 'pa-books', 'play-games': 'pa-games'};
  const page = (ctx, title, body, cls = '') => `<div class="app-view pa-app pmx-page ${APP_CLASS[ctx.app]} ${cls}">${backBar(ctx, title, LOGO[ctx.app])}<div class="pa-scroll">${body}</div></div>`;

  // ---- Play Music ----
  const albumsOf = ctx => P().albums(ctx.tracks);
  const kept = data => store(data, 'playMusicKept', []);
  function musicPage(ctx) {
    const {ui, tracks, data} = ctx, m = key => S(ctx, 'music', key), list = albumsOf(ctx), cover = a => art('cover', seedOf(a.album), a.album, a.artist);
    const songRow = id => `<button class="pm-song" data-action="pa-song" data-id="${id}" data-queue="all"><span class="pm-qart">${art('cover', seedOf(tracks[id].album), tracks[id].album)}</span><span><b>${e(tracks[id].title)}</b><small>${e(tracks[id].artist)}</small></span></button>`;
    const albumCard = a => P().card({action: 'pa-album', id: a.album, doc: `album:${a.album}`, artHtml: cover(a), title: a.album, sub: a.artist, kept: kept(data).includes(a.album)});
    if (ui.sub === 'search-more') {
      const q = String(ui.paQuery || '').trim().toLocaleLowerCase(), has = text => String(text).toLocaleLowerCase().includes(q), which = ui.paCluster;
      const body = which === 'artists' ? `<div class="pa-grid">${[...new Set(tracks.map(t => t.artist))].filter(has).map(artist => P().card({action: 'px-artist', id: artist, doc: `artist:${artist}`, artHtml: art('cover', seedOf(artist), artist), title: artist, sub: ''})).join('')}</div>`
        : which === 'albums' ? `<div class="pa-grid">${list.filter(a => has(a.album)).map(albumCard).join('')}</div>`
        : `<div class="pm-songs">${tracks.map((t, id) => ({t, id})).filter(({t}) => has(t.title)).map(({id}) => songRow(id)).join('')}</div>`;
      return page(ctx, m({artists: 'Artists', albums: 'Albums', songs: 'Songs'}[which]), body, 'pa-music');
    }
    if (ui.sub === 'artist') {
      const artist = ui.paArtist;
      return page(ctx, artist, `<div class="pa-grid">${list.filter(a => a.artist === artist).map(albumCard).join('')}</div>`, 'pa-music');
    }
    if (ui.sub === 'music-settings') {
      const p = prefs(data, 'music', MUSIC_PREFS), q = {low: 'Low', normal: 'Normal', high: 'High'}[p.quality];
      return page(ctx, m('Music settings'), cat(m('GENERAL')) + row('px-limit', 'account', m('Google account'), fmt(m('Connect using %s'), ACCOUNT)) + row('px-limit', 'eq', m('Equalizer'), m('Equalizer summary')) + row('px-toggle', 'music:contentFilter', m('Block explicit'), '', check(p.contentFilter))
        + cat(m('DOWNLOADING')) + row('px-toggle', 'music:cacheStreamed', m('Cache during playback'), m('Cache summary'), check(p.cacheStreamed)) + row('px-toggle', 'music:autoCache', m('Automatically cache'), m('Autocache summary'), check(p.autoCache))
        + row('px-dialog', 'clear-cache', m('Clear Cache'), m('Clear Cache summary')) + row('px-toggle', 'music:downloadWifi', m('Download via Wi-Fi only'), m('Download wifi summary'), check(p.downloadWifi))
        + row('px-page', 'download-queue', m('View download queue'), m('Download queue summary')) + row('px-dialog', 'location', m('Download storage location'), m('Device Storage'))
        + cat(m('STREAMING')) + row('px-toggle', 'music:streamWifi', m('Stream via Wi-Fi only'), m('Stream wifi summary'), check(p.streamWifi)) + row('px-dialog', 'quality', m('Stream quality'), m(q))
        + cat(m('DEVELOPER')) + row('px-limit', 'licenses', m('Open source licenses')) + `<div class="pmx-row pmx-info"><span><b>${e(m('Music version'))}</b><small>${e(MUSIC_VERSION)}</small></span></div>`, 'pmx-settings');
    }
    if (ui.sub === 'download-queue') return page(ctx, m('View download queue'), `<p class="pmx-empty">${e(m('No downloads'))}</p>`);
    return '';
  }
  // DocumentMenuHandler's entries for a card, ScreenMenuHandler's for now playing.
  function musicMenu(ctx, doc) {
    const m = key => S(ctx, 'music', key), [kind, id] = doc.split(/:(.*)/);
    if (kind === 'artist') return [['px-mix', doc, m('Start instant mix')], ['pa-shop', '', m('Shop this artist')]];
    if (kind === 'album') return [['px-mix', doc, m('Start instant mix')], ['px-play-next', id, m('Play next')], ['px-add-queue', id, m('Add to queue')], ['px-keep', id, m('Keep on device'), kept(ctx.data).includes(id)], ['px-dialog', `playlist:album:${id}`, m('Add to playlist')], ['px-artist', albumsOf(ctx).find(a => a.album === id)?.artist || '', m('Go to artist')], ['pa-shop', '', m('Shop this artist')]];
    if (kind === 'np') { const t = ctx.tracks[ctx.music.track]; return [['px-mix', `artist:${t.artist}`, m('Start instant mix')], ['px-dialog', `playlist:track:${ctx.music.track}`, m('Add to playlist')], ['px-artist', t.artist, m('Go to artist')], ['pa-album', t.album, m('Go to album')], ['px-clear-queue', '', m('Clear queue')], ['px-dialog', 'save-queue', m('Save as playlist')]]; }
    return [];
  }
  // ---- Play Movies ----
  const onDevice = data => store(data, 'playMoviesDevice', []);
  function moviesPage(ctx) {
    const {ui, data} = ctx, v = key => S(ctx, 'movies', key);
    if (ui.sub !== 'movies-settings') return '';
    const p = prefs(data, 'movies', MOVIE_PREFS);
    return page(ctx, v('Settings'), cat(v('General')) + row('px-limit', 'accounts', v('Accounts'), ACCOUNT) + row('px-toggle', 'movies:cards', v('Show cards on pause'), v('Cards summary'), check(p.cards))
      + row('px-dialog', 'caption', v('Caption font size'), v(`size.${p.captionSize}`)) + row('px-limit', 'captions', v('Caption settings'), v('Caption settings summary'))
      + cat(v('Streaming on mobile networks')) + row('px-toggle', 'movies:warning', v('Show warning'), v('Warning summary'), check(p.warning)) + row('px-toggle', 'movies:restrict', v('Restrict quality'), v('Restrict summary'), check(p.restrict))
      + cat(v('Downloads')) + row('px-dialog', 'network', v('Network'), v(`net.${p.network}`)) + row('px-dialog', 'mquality', v('Quality'), v(`quality.${p.quality}`)) + row('px-dialog', 'storage', v('Storage'), v('Storage summary'))
      + cat(v('About')) + `<div class="pmx-row pmx-info"><span><b>${e(v('Device ID'))}</b><small>${e(DEVICE_ID)}</small></span></div><div class="pmx-row pmx-info"><span><b>${e(v('App version'))}</b><small>${e(MOVIES_VERSION)}</small></span></div>`, 'pmx-settings');
  }
  // ---- Play Books ----
  const SORTS = [['recent', 'Recently read'], ['title', 'Title'], ['author', 'Author']];
  const booksState = data => store(data, 'playBooksState', {notKept: [], removed: [], sort: 'recent'});
  function libraryBooks(ctx) {
    const st = booksState(ctx.data), progress = ctx.data.playBooks || {}, books = P().BOOKS.filter(b => !st.removed.includes(b.id));
    if (st.sort === 'title') return [...books].sort((a, b) => a.title.localeCompare(b.title, ctx.locale));
    if (st.sort === 'author') return [...books].sort((a, b) => a.author.localeCompare(b.author, ctx.locale));
    return [...books].sort((a, b) => (ctx.data.playBooksOpened?.[b.id] || 0) - (ctx.data.playBooksOpened?.[a.id] || 0) || (progress[b.id] || 0) - (progress[a.id] || 0));
  }
  function booksPage(ctx) {
    const {ui, data} = ctx, b = key => S(ctx, 'books', key);
    if (ui.sub === 'books-settings') {
      const p = prefs(data, 'books', BOOK_PREFS), rot = ['Use system setting', 'Lock in portrait', 'Lock in landscape'][p.rotation];
      return page(ctx, b('Settings'), row('px-limit', 'account', b('Account'), ACCOUNT) + row('px-dialog', 'rotation', b('Auto-rotate screen'), b(rot)) + row('px-toggle', 'books:wifiOnly', b('Download over Wi-Fi only'), b('Wi-Fi summary'), check(p.wifiOnly))
        + row('px-toggle', 'books:volumeKeys', b('Use volume key'), '', check(p.volumeKeys)) + row('px-toggle', 'books:pageTurn3d', b('3D page turn'), '', check(p.pageTurn3d)) + row('px-toggle', 'books:pdf', b('Enable PDF uploading'), b('PDF summary'), check(p.pdf))
        + row('px-toggle', 'books:autoRead', b('Automatically read aloud'), b('Read aloud summary'), check(p.autoRead)), 'pmx-settings bk3-settings');
    }
    if (ui.sub === 'book-about') {
      const book = P().BOOKS.find(x => x.id === ui.paItem) || P().BOOKS[0];
      return page(ctx, b('About this book'), `<div class="pmx-about">${art('book', seedOf(book.id), book.title, book.author)}<div><h2>${e(book.title)}</h2><p>${e(book.author)}</p><p class="pmx-about-meta">${e(fmt(ctx.t('%d pages'), book.pages.length))}</p><button class="pa-chip" data-action="pa-book" data-id="${e(book.id)}">${e(S(ctx, 'books', 'Read'))}</button></div></div><p class="pmx-about-text">${e(book.pages[0].split('\n').filter(Boolean).slice(0, 2).join(' '))}</p>`);
    }
    return '';
  }
  function bookMenu(ctx, id) {
    const b = key => S(ctx, 'books', key), keptBook = !booksState(ctx.data).notKept.includes(id);
    return [['px-book-keep', id, b(keptBook ? "Don't keep" : 'Keep on device')], ['px-dialog', `remove-book:${id}`, b('Delete from library')], ['px-book-about', id, b('About this book')]];
  }
  const readerMenu = ctx => { const b = key => S(ctx, 'books', key); return [['bk-options', '', b('Display options')], ['px-book-about', ctx.ui.paItem, b('About this book')], ['px-dialog', `share-book:${ctx.ui.paItem}`, b('Share')], ['px-page', 'books-settings', b('Settings')], ['px-limit', 'help', b('Help & feedback')]]; };
  // ---- Play Games ----
  const dismissed = data => store(data, 'playGamesDismissed', []);
  function gamesPage(ctx) {
    const {ui, data} = ctx, g = key => S(ctx, 'games', key);
    if (ui.sub === 'player') {
      const pl = P().PLAYERS.find(x => x.name === ui.paPlayer) || P().PLAYERS[0], game = P().GAMES.find(x => x.title === pl.game);
      return page(ctx, pl.name, `<div class="pmx-player">${art('icon', seedOf(pl.name), pl.name)}<div><h2>${e(pl.name)}</h2><p>${e(fmt(g('Last played %1$s'), pl.game))}</p><button class="pa-chip" data-action="px-gplus">${e(g('VIEW PROFILE'))}</button></div></div><div class="pa-section"><h3>${e(g('Recently played'))}</h3></div>${game ? `<div class="pg-list"><div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${game.id}"><span class="pg-icon">${art('icon', seedOf(game.id), game.title)}</span><span class="pg-copy"><b>${e(game.title)}</b><small>${e(game.dev)}</small></span></div></div>` : `<p class="pmx-empty">${e(g('No games played recently'))}</p>`}`, 'pa-games');
    }
    if (ui.sub === 'games-settings') {
      const p = prefs(data, 'games', GAME_PREFS);
      return page(ctx, g('Settings'), row('px-limit', 'account', g('Google Account'), fmt(g('Using %1$s'), ACCOUNT)) + row('px-toggle', 'games:multiplayer', g('Multiplayer notifications'), g('Multiplayer summary'), check(p.multiplayer)) + row('px-toggle', 'games:requests', g('Requests notifications'), g('Requests summary'), check(p.requests)) + row('px-page', 'muted-games', g('Muted games')), 'pmx-settings');
    }
    if (ui.sub === 'muted-games') return page(ctx, g('Muted games'), `<p class="pmx-empty">${e(g('No games muted yet'))}</p>`);
    return '';
  }
  const players = data => P().PLAYERS.filter(p => !dismissed(data).includes(p.name));
  // The sub-pages this file draws, or '' for play-apps.js's own.
  function render(ctx) {
    if (ctx.app === 'play-music') return musicPage(ctx);
    if (ctx.app === 'play-movies') return moviesPage(ctx);
    if (ctx.app === 'play-books') return booksPage(ctx);
    return gamesPage(ctx);
  }
  // The popup menus and dialogs (the pa-more overlay).
  function overlay(ctx) {
    const {ui, data} = ctx, d = ui.paMore || '';
    const items = list => `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu holo-menu-light pmx-menu">${list.map(([action, id, label, on]) => `<button data-action="${action}" data-id="${e(id)}">${e(label)}${on === undefined ? '' : check(on)}</button>`).join('')}</div>`;
    const box = (title, inner, buttons = '') => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="pmx-dialog" role="dialog"><h3>${e(title)}</h3>${inner}${buttons ? `<div class="pmx-buttons">${buttons}</div>` : ''}</div>`;
    const choice = (action, id, label, on) => `<button class="pmx-choice${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}"><span>${e(label)}</span><i></i></button>`;
    if (d.startsWith('doc:')) {
      const doc = d.slice(4), [kind, id] = doc.split(/:(.*)/);
      if (kind === 'book') return items(bookMenu(ctx, id));
      if (kind === 'movie') { const on = onDevice(data).includes(id), v = key => S(ctx, 'movies', key); return items([on ? ['px-movie-pin', id, v('Remove download')] : ['px-movie-pin', id, v('Download')]]); }
      if (kind === 'game') return items([['pa-shop', '', S(ctx, 'games', 'View in Play Store')]]);
      if (kind === 'player') return items([['px-gplus', id, S(ctx, 'games', 'View Google+ profile')], ['px-dismiss', id, S(ctx, 'games', 'Dismiss')]]);
      return items(musicMenu(ctx, doc));
    }
    if (d === 'np') return items(musicMenu(ctx, 'np:'));
    if (d === 'reader') return items(readerMenu(ctx));
    const m = key => S(ctx, 'music', key), v = key => S(ctx, 'movies', key), b = key => S(ctx, 'books', key);
    const cancel = `<button data-action="close-overlay">${e(m('Cancel'))}</button>`;
    if (d.startsWith('playlist:')) {
      const target = d.slice(9);
      return box(m('Add to playlist title'), `<div class="pmx-list"><button class="pmx-choice new" data-action="px-new-playlist" data-id="${e(target)}"><span>${e(m('New playlist'))}</span></button>${ctx.music.playlists.map((p, i) => `<button class="pmx-choice" data-action="px-to-playlist" data-id="${i}|${e(target)}"><span>${e(p.name)}</span></button>`).join('')}</div>`, cancel);
    }
    if (d.startsWith('new-playlist:') || d === 'save-queue') return box(m('New playlist'), `<input class="pmx-edit" data-pmx-edit maxlength="80" value="${e(fmt(m('Playlist %d'), ctx.music.playlists.length + 1))}">`, cancel + `<button data-action="px-create-playlist" data-id="${e(d)}">${e(m('OK'))}</button>`);
    if (d === 'clear-cache') return box(m('Clear Cache'), `<p class="pmx-msg">${e(m('Clear Cache summary'))}</p>`, cancel + `<button data-action="close-overlay">${e(m('OK'))}</button>`);
    if (d === 'location') return box(m('Download storage location'), choice('close-overlay', '', m('Device Storage'), true));
    if (d === 'quality') { const q = prefs(data, 'music', MUSIC_PREFS).quality; return box(m('Stream quality'), ['low', 'normal', 'high'].map(k => choice('px-set', `music:quality:${k}`, m({low: 'Low', normal: 'Normal', high: 'High'}[k]), q === k)).join(''), cancel); }
    if (d === 'caption') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Caption font size'), [0, 1, 2, 3].map(i => choice('px-set', `movies:captionSize:${i}`, v(`size.${i}`), p.captionSize === i)).join(''), cancel); }
    if (d === 'network') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Network'), [0, 1].map(i => choice('px-set', `movies:network:${i}`, v(`net.${i}`), p.network === i)).join(''), cancel); }
    if (d === 'mquality') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Quality'), [0, 1].map(i => choice('px-set', `movies:quality:${i}`, v(`quality.${i}`), p.quality === i)).join(''), cancel); }
    if (d === 'storage') return box(v('Storage'), choice('close-overlay', '', m('Device Storage'), true));
    if (d === 'rotation') { const p = prefs(data, 'books', BOOK_PREFS); return box(b('Auto-rotate screen'), ['Use system setting', 'Lock in portrait', 'Lock in landscape'].map((k, i) => choice('px-set', `books:rotation:${i}`, b(k), p.rotation === i)).join(''), cancel); }
    if (d === 'sort') { const s = booksState(data).sort; return box(b('Sort by'), SORTS.map(([id, k]) => choice('px-sort', id, b(k), s === id)).join('')); }
    if (d.startsWith('remove-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(12)); return box(b('Delete from library'), `<p class="pmx-msg">${e(book?.title || '')}</p>`, cancel + `<button data-action="px-remove-book" data-id="${e(book?.id || '')}">${e(b('Delete from library'))}</button>`); }
    if (d.startsWith('share-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(11)); return box(fmt(b('Share "%1$s" via'), book?.title || ''), [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']].map(([app, name]) => `<button class="pmx-choice app" data-action="px-share-book" data-id="${app}|${e(book?.id || '')}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join('')); }
    return '';
  }
  function menu(ctx) {
    const m = key => S(ctx, 'music', key), v = key => S(ctx, 'movies', key), b = key => S(ctx, 'books', key), g = key => S(ctx, 'games', key);
    if (ctx.app === 'play-music') return [['pa-refresh', 'Refresh'], ['px-page', 'Settings', 'music-settings'], ['px-limit', 'Help'], ['px-limit', 'Send feedback']].map(([action, key, id]) => ({action, id, title: S(ctx, 'music', key)}));
    if (ctx.app === 'play-games') return [['px-limit', 'Accounts'], ['px-page', 'Settings', 'games-settings'], ['px-limit', 'Help']].map(([action, key, id]) => ({action, id, title: g(key)}));
    if (ctx.app === 'play-books') return [...((ctx.ui.paPage?.['play-books'] || 'read') === 'library' ? [{action: 'px-more-dialog', id: 'sort', title: b('Sort')}] : []), {action: 'pa-refresh', title: b('Refresh')}];
    if (ctx.app === 'play-movies') return [['px-page', 'Settings', 'movies-settings'], ['px-limit', 'Help'], ['px-limit', 'Contact us'], ['px-limit', 'Send feedback'], ['pa-refresh', 'Refresh'], ['px-limit', 'Personal videos']].map(([action, key, id]) => ({action, id, title: v(key)}));
    return [];
  }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, music = ctx.music, tracks = ctx.tracks;
    const albumTracks = name => tracks.map((t, i) => t.album === name ? i : -1).filter(i => i >= 0);
    const open = (sub, patch = {}) => { Object.assign(ui, patch); if (!['search-more', 'artist', 'music-settings', 'download-queue', 'movies-settings', 'books-settings', 'book-about', 'player', 'games-settings', 'muted-games'].includes(ui.sub)) ui.paFrom = ui.sub; (ui.paStack ||= []).push(ui.sub); ui.sub = sub; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); };
    const done = () => { ui.overlay = ''; ui.paMore = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'px-doc': ui.paMore = `doc:${id}`; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-np': ui.paMore = 'np'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-reader-menu': ui.paMore = 'reader'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-dialog': case 'px-more-dialog': ui.paMore = id; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-more': open('search-more', {paCluster: id}); return true;
      case 'px-artist': done(); open('artist', {paArtist: id}); return true;
      case 'px-page': done(); open(id); return true;
      case 'px-limit': done(); ctx.toast('This feature is not part of the simulator.'); return true;
      case 'px-toggle': { const [app, key] = id.split(':'), defaults = {music: MUSIC_PREFS, movies: MOVIE_PREFS, books: BOOK_PREFS, games: GAME_PREFS}[app]; setPref(data, app, {[key]: !prefs(data, app, defaults)[key]}); ctx.save(); ctx.render(); return true; }
      case 'px-set': { const [app, key, value] = id.split(':'); setPref(data, app, {[key]: /^\d+$/.test(value) ? Number(value) : value}); ctx.save(); done(); ctx.render(); return true; }
      case 'px-mix': {
        const [kind, name] = id.split(/:(.*)/), artist = kind === 'artist' ? name : albumsOf(ctx).find(a => a.album === name)?.artist;
        const first = tracks.map((t, i) => t.artist === artist ? i : -1).filter(i => i >= 0), rest = tracks.map((_, i) => i).filter(i => !first.includes(i));
        music.queue = [...first, ...rest]; music.track = music.queue[0]; music.position = 0; music.playing = true; ctx.saveMusic(); done();
        if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub; ui.sub = 'player'; ctx.render(); return true;
      }
      case 'px-play-next': case 'px-add-queue': {
        const ids = albumTracks(id), at = Math.max(0, music.queue.indexOf(music.track));
        const queue = music.queue.filter(i => !ids.includes(i) || i === music.track);
        if (action === 'px-play-next') queue.splice(queue.indexOf(music.track) + 1 || at + 1, 0, ...ids.filter(i => i !== music.track)); else queue.push(...ids.filter(i => i !== music.track));
        music.queue = queue; ctx.saveMusic(); done(); ctx.render(); return true;
      }
      case 'px-keep': { const list = kept(data); data.playMusicKept = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-new-playlist': ui.paMore = `new-playlist:${id}`; ctx.renderOverlay(); ctx.root.ownerDocument.querySelector('[data-pmx-edit]')?.select(); return true;
      case 'px-to-playlist': case 'px-create-playlist': {
        const target = action === 'px-create-playlist' ? id : id.slice(id.indexOf('|') + 1);
        const ids = target === 'save-queue' ? [...music.queue] : target.replace(/^new-playlist:/, '').startsWith('album:') ? albumTracks(target.replace(/^new-playlist:album:/, '').replace(/^album:/, '')) : [Number(target.replace(/^new-playlist:/, '').split(':')[1])];
        if (action === 'px-create-playlist') { const name = ctx.root.ownerDocument.querySelector('[data-pmx-edit]')?.value.trim(); if (!name) return true; music.playlists = [...music.playlists, {name, tracks: ids}]; }
        else { const p = music.playlists[Number(id.split('|')[0])]; if (p) p.tracks = [...new Set([...p.tracks, ...ids])]; }
        ctx.saveMusic(); done(); ctx.render(); return true;
      }
      case 'px-clear-queue': music.queue = [music.track]; music.playing = false; ctx.saveMusic(); done(); ui.sub = ui.paReturn || ''; ctx.render(); return true;
      case 'px-pin': case 'px-movie-pin': { const list = onDevice(data); data.playMoviesDevice = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-book-keep': { const st = booksState(data); st.notKept = st.notKept.includes(id) ? st.notKept.filter(x => x !== id) : [...st.notKept, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-remove-book': { const st = booksState(data); st.removed = [...new Set([...st.removed, id])]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-sort': booksState(data).sort = id; ctx.save(); done(); ctx.render(); return true;
      case 'px-book-about': done(); open('book-about', {paItem: id || ui.paItem}); return true;
      case 'px-share-book': { const [app, bid] = id.split('|'), book = P().BOOKS.find(x => x.id === bid), b = key => S(ctx, 'books', key); done(); if (book) ctx.shareText(app, `${book.title} — ${book.author}\nhttps://play.google.com/store/books/details?id=${book.id}`, fmt(b('Check out "%1$s"'), book.title)); return true; }
      case 'px-player': open('player', {paPlayer: id}); return true;
      case 'px-gplus': done(); ctx.openApp('google-plus'); return true;
      case 'px-dismiss': { data.playGamesDismissed = [...new Set([...dismissed(data), id])]; ctx.save(); done(); ctx.render(); ctx.toast(fmt(S(ctx, 'games', 'Dismissed %1$s'), id)); return true; }
      default: return false;
    }
  }
  // Back from this file's pages to the screen they were opened from.
  function back(ui) {
    if (!['search-more', 'artist', 'music-settings', 'download-queue', 'movies-settings', 'books-settings', 'book-about', 'player', 'games-settings', 'muted-games'].includes(ui.sub)) return false;
    ui.sub = ui.paStack?.pop() ?? ''; return true;
  }
  window.PlayMore = {render, overlay, menu, handle, back, kept, onDevice, booksState, libraryBooks, players, MUSIC_PREFS};
})();
