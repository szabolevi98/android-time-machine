/* The Play media apps' own operations on the LMY48Y image (play-apps.js draws the screens). From the APKs' odex code:
   - Play Music 5.8.1809R: search's "%d MORE" opens the cluster's full list; DocumentMenuHandler.addMenuEntries for an
     album (Start instant mix, Shuffle, Play next, Add to queue, Add to playlist, Download / Remove download, Go to
     artist, Shop this artist) and an artist (Start instant mix, Shop this artist, Shuffle artist) with a Play Music
     account without All Access; ScreenMenuHandler's now playing menu (Start instant mix, Add to playlist, Go to artist,
     Go to album, Clear queue, Save queue); the add-to-playlist selector and the new playlist dialog; MusicSettingsActivity
     on music_settings.xml without All Access, Wear or debug logs (GENERAL, DOWNLOADING, STREAMING, DEVELOPER), in its
     theme's #EF6C00 on #EEEEEE.
   - Play Movies & TV 3.6.16: the card's watch_details_menu (Download / Remove download) and the pin; Settings is
     preferences.xml (General, Language and captions, Streaming on mobile networks, Downloads, About; surround sound
     needs 5.1 output and Disney Movies Anywhere a linked account, neither of which the Nexus 6 has) in the settings
     theme's #A52714 with the #ED3B3B accent; Manage downloads lists what is downloaded.
   - Play Books 3.3.15: the card menu (Download / Remove download, Delete from library, About this book), Sort (Recent,
     Title, Author), AppSettingsActivity's items, fragment_reader.xml's overflow (About this book, Share, Add / Remove
     bookmark, Read aloud, Settings, Help & feedback); bookmarks show in Contents.
   - Play Games 2.2.09: games_destination_game_context_menu (View in Play Store), the player tile menu (View Google+
     profile, Dismiss), the player detail page (VIEW PROFILE, Recently played) and Settings, which is Google Play
     services 6.7's GamesSettingsActivity (#263238 with the #009688 accent).
   What stays a limit: Equalizer, My devices, Cast, buying, Help and feedback, Read aloud, system caption settings and
   the open source licence pages. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[`x.${key}`] || window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  const ACCOUNT = 'nexus6.demo@gmail.com', MUSIC_VERSION = '5.8.1809R.1710816', MOVIES_VERSION = '3.6.16', GMS_VERSION = '6.7.79 (1845116-438)', DEVICE_ID = '3f9a20c7d1b84e65';
  const P = () => window.PlayApps;
  const art = (...args) => P().art(...args);
  const seedOf = id => [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  // Local state: downloaded albums, the apps' preferences, downloaded movies, books kept / removed, bookmarks.
  const store = (data, key, init) => (data[key] ||= init);
  const prefs = (data, app, defaults) => ({...defaults, ...(data.playPrefs?.[app] || {})});
  const setPref = (data, app, patch) => { data.playPrefs = {...(data.playPrefs || {}), [app]: {...(data.playPrefs?.[app] || {}), ...patch}}; };
  // The preference defaults of music_settings.xml, preferences.xml, AppSettingsActivity and GamesSettingsActivity.
  const MUSIC_PREFS = {contentFilter: false, cacheStreamed: true, autoCache: false, downloadWifi: true, streamWifi: false, quality: 'normal'};
  const MOVIE_PREFS = {cards: true, audio: 0, warning: true, restrict: false, network: 0, quality: 0};
  const BOOK_PREFS = {rotation: 0, wifiOnly: true, volumeKeys: false, pageTurn3d: true, pdf: false, autoRead: false};
  const GAME_PREFS = {profile: 'public', multiplayer: true, requests: true, quests: true, levelUp: true};
  const SUBS = ['search-more', 'artist', 'music-settings', 'download-queue', 'movies-settings', 'manage-downloads', 'books-settings', 'book-about', 'player', 'games-settings', 'muted-games'];
  // Material preferences: the category in the accent, 16 sp titles, 14 sp summaries, the accent checkbox.
  const check = on => `<i class="lpx-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="lpx-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const info = (title, summary) => `<div class="lpx-row lpx-info"><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></div>`;
  const cat = title => `<h4 class="lpx-cat">${e(title)}</h4>`;
  const APP_CLASS = {'play-music': 'pa-music', 'play-movies': 'pa-movies', 'play-books': 'pa-books', 'play-games': 'pa-games'};
  const page = (ctx, title, body, cls = '') => `<div class="app-view pa-app lpx-page ${APP_CLASS[ctx.app]} ${cls}"><header class="lpa-bar"><button class="lpa-nav up" data-action="back" aria-label="${e(ctx.t('Back'))}"><span></span></button><b>${e(title)}</b></header><div class="pa-scroll">${body}</div></div>`;

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
      return page(ctx, m({artists: 'Artists', albums: 'Albums', songs: 'Songs'}[which]), body);
    }
    if (ui.sub === 'artist') return page(ctx, ui.paArtist, `<div class="pa-grid">${list.filter(a => a.artist === ui.paArtist).map(albumCard).join('')}</div>`);
    if (ui.sub === 'music-settings') {
      const p = prefs(data, 'music', MUSIC_PREFS), q = {low: 'Low', normal: 'Normal', high: 'High'}[p.quality];
      return page(ctx, m('Music settings'), cat(m('GENERAL')) + row('px-limit', 'account', m('Google account'), fmt(m('Connect using %s'), ACCOUNT)) + row('px-refresh', '', m('Refresh'), m('Refresh summary')) + row('px-limit', 'devices', m('My devices'))
        + row('px-limit', 'eq', m('Equalizer'), m('Equalizer summary')) + row('px-toggle', 'music:contentFilter', m('Block explicit'), '', check(p.contentFilter))
        + cat(m('DOWNLOADING')) + row('px-toggle', 'music:cacheStreamed', m('Cache during playback'), m('Cache summary'), check(p.cacheStreamed)) + row('px-toggle', 'music:autoCache', m('Automatically cache'), m('Autocache summary'), check(p.autoCache && p.cacheStreamed), !p.cacheStreamed)
        + row('px-dialog', 'clear-cache', m('Clear Cache'), m('Clear Cache summary')) + row('px-toggle', 'music:downloadWifi', m('Download via Wi-Fi only'), m('Download wifi summary'), check(p.downloadWifi))
        + row('px-page', 'download-queue', m('View download queue'), m('Download queue summary')) + row('px-dialog', 'location', m('Storage location'), m('Internal'))
        + cat(m('STREAMING')) + row('px-toggle', 'music:streamWifi', m('Stream via Wi-Fi only'), m('Stream wifi summary'), check(p.streamWifi)) + row('px-dialog', 'quality', m('Stream quality'), m(q), '', p.streamWifi)
        + cat(m('DEVELOPER')) + row('px-limit', 'licenses', m('About')) + info(m('Music version'), MUSIC_VERSION), 'lpx-settings lpx-music');
    }
    if (ui.sub === 'download-queue') return page(ctx, m('View download queue'), `<p class="lpx-empty">${e(m('Download queue summary'))}</p>`, 'lpx-settings lpx-music');
    return '';
  }
  // DocumentMenuHandler's entries for a card, ScreenMenuHandler's for now playing.
  function musicMenu(ctx, doc) {
    const m = key => S(ctx, 'music', key), [kind, id] = doc.split(/:(.*)/);
    if (kind === 'artist') return [['px-mix', doc, m('Start instant mix')], ['pa-shop', '', m('Shop this artist')], ['px-shuffle', doc, m('Shuffle artist')]];
    if (kind === 'album') { const on = kept(ctx.data).includes(id); return [['px-mix', doc, m('Start instant mix')], ['px-shuffle', doc, m('Shuffle')], ['px-play-next', id, m('Play next')], ['px-add-queue', id, m('Add to queue')], ['px-dialog', `playlist:album:${id}`, m('Add to playlist')], ['px-keep', id, m(on ? 'Remove download' : 'Download')], ['px-artist', albumsOf(ctx).find(a => a.album === id)?.artist || '', m('Go to artist')], ['pa-shop', '', m('Shop this artist')]]; }
    if (kind === 'np') { const t = ctx.tracks[ctx.music.track]; return [['px-mix', `artist:${t.artist}`, m('Start instant mix')], ['px-dialog', `playlist:track:${ctx.music.track}`, m('Add to playlist')], ['px-artist', t.artist, m('Go to artist')], ['pa-album', t.album, m('Go to album')], ['px-clear-queue', '', m('Clear queue')], ['px-dialog', 'save-queue', m('Save queue')]]; }
    return [];
  }
  // ---- Play Movies & TV ----
  const onDevice = data => store(data, 'playMoviesDevice', []);
  function moviesPage(ctx) {
    const {ui, data} = ctx, v = key => S(ctx, 'movies', key);
    if (ui.sub === 'manage-downloads') {
      const list = onDevice(data), card = item => P().card({action: 'pa-movie', id: item.id, doc: `movie:${item.id}`, artHtml: art('poster', seedOf(item.id), item.title), title: item.title, sub: item.year ? String(item.year) : fmt(ctx.t('%d episodes'), item.episodes), pin: true, pinned: true});
      const movies = P().MOVIES.filter(m => list.includes(m.id)), shows = P().SHOWS.filter(s => list.includes(s.id));
      return page(ctx, v('Manage downloads'), list.length ? `${movies.length ? `<div class="pa-section"><h3>${e(v('My Movies'))}</h3></div><div class="pa-grid">${movies.map(card).join('')}</div>` : ''}${shows.length ? `<div class="pa-section"><h3>${e(v('My TV Shows'))}</h3></div><div class="pa-grid">${shows.map(card).join('')}</div>` : ''}` : `<p class="lpx-empty">${e(v('No downloads'))}</p>`);
    }
    if (ui.sub !== 'movies-settings') return '';
    const p = prefs(data, 'movies', MOVIE_PREFS);
    return page(ctx, v('Settings'), cat(v('General')) + row('px-toggle', 'movies:cards', v('Enable Info Cards'), v('Cards summary'), check(p.cards))
      + cat(v('Language and captions')) + row('px-dialog', 'audio', v('Audio language'), audioLabel(ctx, p.audio)) + row('px-limit', 'captions', v('System caption settings'), v('System caption summary'))
      + cat(v('Streaming on mobile networks')) + row('px-toggle', 'movies:warning', v('Show warning'), v('Warning summary'), check(p.warning)) + row('px-toggle', 'movies:restrict', v('Restrict quality'), v('Restrict summary'), check(p.restrict))
      + cat(v('Downloads')) + row('px-page', 'manage-downloads', v('Manage downloads'), v('Manage downloads summary')) + row('px-dialog', 'network', v('Network'), v(`net.${p.network}`)) + row('px-dialog', 'mquality', v('Quality'), v(`quality.${p.quality}`)) + row('px-dialog', 'storage', v('Storage'), v('Storage summary'))
      + cat(v('About')) + row('px-limit', 'licenses', v('Open source licenses'), v('Licenses summary')) + info(v('Device ID'), DEVICE_ID) + info(v('App version'), MOVIES_VERSION) + info(v('Device'), 'motorola Nexus 6 (shamu)'), 'lpx-settings lpx-movies');
  }
  // audio_language_selector_titles: the original language, or the device's language where the video has it.
  const audioLabel = (ctx, i) => i ? fmt(S(ctx, 'movies', 'audio.1'), langName(ctx)) : S(ctx, 'movies', 'audio.0');
  const langName = ctx => { const code = String(ctx.locale || 'en').slice(0, 2); try { return new Intl.DisplayNames([code], {type: 'language'}).of(code); } catch { return code; } };
  // ---- Play Books ----
  const SORTS = [['recent', 'Recent'], ['title', 'Title'], ['author', 'Author']];
  const booksState = data => store(data, 'playBooksState', {notKept: [], removed: [], sort: 'recent'});
  const bookmarks = data => store(data, 'playBookmarks', {});
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
      return page(ctx, b('Settings'), row('px-dialog', 'rotation', b('Auto-rotate screen'), b(rot)) + row('px-toggle', 'books:wifiOnly', b('Download over Wi-Fi only'), b('Wi-Fi summary'), check(p.wifiOnly))
        + row('px-toggle', 'books:volumeKeys', b('Use volume key'), '', check(p.volumeKeys)) + row('px-toggle', 'books:pageTurn3d', b('3D page turn'), '', check(p.pageTurn3d)) + row('px-toggle', 'books:pdf', b('Enable PDF uploading'), b('PDF summary'), check(p.pdf))
        + row('px-toggle', 'books:autoRead', b('Automatically read aloud'), b('Read aloud summary'), check(p.autoRead)), 'lpx-settings lpx-books');
    }
    if (ui.sub === 'book-about') {
      const book = P().BOOKS.find(x => x.id === ui.paItem) || P().BOOKS[0];
      return page(ctx, b('About this book'), `<div class="lpx-about"><button class="lpx-about-cover" data-action="pa-book" data-id="${e(book.id)}" aria-label="${e(book.title)}">${art('book', seedOf(book.id), book.title, book.author)}</button><div><h2>${e(book.title)}</h2><p>${e(book.author)}</p></div></div><p class="lpx-about-text">${e(book.pages.find(text => !book.starts.includes(book.pages.indexOf(text))) || '')}</p>`);
    }
    return '';
  }
  function bookMenu(ctx, id) {
    const b = key => S(ctx, 'books', key), keptBook = !booksState(ctx.data).notKept.includes(id);
    return [['px-book-keep', id, b(keptBook ? 'Remove download' : 'Download')], ['px-dialog', `remove-book:${id}`, b('Delete from library')], ['px-book-about', id, b('About this book')]];
  }
  function readerMenu(ctx) {
    const b = key => S(ctx, 'books', key), id = ctx.ui.paItem, at = Math.min(ctx.data.playBooks?.[id] || 0, P().bookPages(id) - 1), marked = (bookmarks(ctx.data)[id] || []).includes(at);
    return [['px-book-about', id, b('About this book')], ['px-dialog', `share-book:${id}`, b('Share')], ['px-bookmark', id, b(marked ? 'Remove bookmark' : 'Add bookmark')], ['px-limit', 'read-aloud', b('Read aloud')], ['px-page', 'books-settings', b('Settings')], ['px-limit', 'help', b('Help & feedback')]];
  }
  // ---- Play Games ----
  const dismissed = data => store(data, 'playGamesDismissed', []);
  function gamesPage(ctx) {
    const {ui, data} = ctx, g = key => S(ctx, 'games', key);
    if (ui.sub === 'player') {
      const pl = P().PLAYERS.find(x => x.name === ui.paPlayer) || P().PLAYERS[0], game = P().GAMES.find(x => x.title === pl.game);
      return page(ctx, pl.name, `<div class="lpx-player">${art('icon', seedOf(pl.name), pl.name)}<div><h2>${e(pl.name)}</h2><p>${e(fmt(g('Last played %1$s'), pl.game))}</p><button class="pa-chip" data-action="px-gplus">${e(g('VIEW PROFILE'))}</button></div></div><div class="pa-section"><h3>${e(g('Recently played'))}</h3></div>${game ? `<div class="pg-list"><div class="pg-row" role="button" tabindex="0" data-action="pa-game" data-id="${game.id}"><span class="pg-icon">${art('icon', seedOf(game.id), game.title)}</span><span class="pg-copy"><b>${e(game.title)}</b><small>${e(game.dev)}</small></span></div></div>` : `<p class="lpx-empty">${e(g('No games played yet'))}</p>`}`);
    }
    if (ui.sub === 'games-settings') {
      const p = prefs(data, 'games', GAME_PREFS);
      return page(ctx, g('Settings'), row('px-dialog', 'profile', g('Game Profile'), g(p.profile === 'public' ? 'Public' : 'Hidden'))
        + row('px-toggle', 'games:multiplayer', g('Multiplayer notifications'), g('Multiplayer summary'), check(p.multiplayer)) + row('px-toggle', 'games:requests', g('Requests notifications'), g('Requests summary'), check(p.requests))
        + row('px-toggle', 'games:quests', g('Quests notifications'), g('Quests summary'), check(p.quests)) + row('px-toggle', 'games:levelUp', g('Level up notifications'), g('Level up summary'), check(p.levelUp))
        + row('px-limit', 'learn', g('Learn about game notifications')) + row('px-page', 'muted-games', g('Muted games')) + cat(g('About')) + info(fmt(g('Build version'), S(ctx, 'games', 'Play Games')), GMS_VERSION), 'lpx-settings lpx-games');
    }
    if (ui.sub === 'muted-games') return page(ctx, g('Muted games'), `<p class="lpx-empty">${e(g('No games muted yet'))}</p>`, 'lpx-settings lpx-games');
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
  // The popup menus and the Material dialogs (the pa-more overlay).
  function overlay(ctx) {
    const {ui, data} = ctx, d = ui.paMore || '';
    const items = list => `<div class="menu-scrim" data-action="close-overlay"></div><div class="lpa-menu lpx-menu">${list.map(([action, id, label]) => `<button data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</div>`;
    const box = (title, inner, buttons = '') => `<div class="settings-dialog-scrim lpx-scrim" data-action="close-overlay"></div><div class="lpx-dialog ${APP_CLASS[ctx.app]}" role="dialog">${title ? `<h3>${e(title)}</h3>` : ''}${inner}${buttons ? `<div class="lpx-buttons">${buttons}</div>` : ''}</div>`;
    const choice = (action, id, label, on) => `<button class="lpx-choice${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}"><i></i><span>${e(label)}</span></button>`;
    const m = key => S(ctx, 'music', key), v = key => S(ctx, 'movies', key), b = key => S(ctx, 'books', key), g = key => S(ctx, 'games', key);
    const cancel = (label = m('Cancel')) => `<button data-action="close-overlay">${e(label)}</button>`;
    if (d.startsWith('doc:')) {
      const doc = d.slice(4), [kind, id] = doc.split(/:(.*)/);
      if (kind === 'book') return items(bookMenu(ctx, id));
      if (kind === 'movie') return items([['px-movie-pin', id, v(onDevice(data).includes(id) ? 'Remove download' : 'Download')]]);
      if (kind === 'game') return items([['pa-shop', '', g('View in Play Store')]]);
      if (kind === 'player') return items([['px-gplus', id, g('View Google+ profile')], ['px-dismiss', id, g('Dismiss')]]);
      return items(musicMenu(ctx, doc));
    }
    if (d === 'np') return items(musicMenu(ctx, 'np:'));
    if (d === 'reader') return items(readerMenu(ctx));
    if (d.startsWith('playlist:')) {
      const target = d.slice(9);
      return box(m('Add to playlist title'), `<div class="lpx-list"><button class="lpx-choice new" data-action="px-new-playlist" data-id="${e(target)}"><span>${e(m('New playlist'))}</span></button>${ctx.music.playlists.map((p, i) => `<button class="lpx-choice plain" data-action="px-to-playlist" data-id="${i}|${e(target)}"><span>${e(p.name)}</span></button>`).join('')}</div>`, cancel());
    }
    if (d.startsWith('new-playlist:') || d === 'save-queue') return box(m('New playlist'), `<input class="lpx-edit" data-lpx-edit maxlength="80" placeholder="${e(m('Name'))}" aria-label="${e(m('Name'))}">`, cancel() + `<button data-action="px-create-playlist" data-id="${e(d)}">${e(m('Create playlist'))}</button>`);
    if (d === 'clear-cache') return box(m('Clear Cache'), `<p class="lpx-msg">${e(m('Clear Cache summary'))}</p>`, cancel() + `<button data-action="close-overlay">${e(ctx.t('OK'))}</button>`);
    if (d === 'location') return box(m('Storage location'), choice('close-overlay', '', m('Internal'), true), cancel());
    if (d === 'quality') { const q = prefs(data, 'music', MUSIC_PREFS).quality; return box(m('Stream quality'), ['low', 'normal', 'high'].map(k => choice('px-set', `music:quality:${k}`, m({low: 'Low', normal: 'Normal', high: 'High'}[k]), q === k)).join(''), cancel()); }
    if (d === 'audio') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Play videos in'), [0, 1].map(i => choice('px-set', `movies:audio:${i}`, audioLabel(ctx, i), p.audio === i)).join(''), cancel(ctx.t('Cancel'))); }
    if (d === 'network') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Choose download network'), [0, 1].map(i => choice('px-set', `movies:network:${i}`, v(`net.${i}`), p.network === i)).join(''), cancel(ctx.t('Cancel'))); }
    if (d === 'mquality') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Choose download quality'), [0, 1].map(i => choice('px-set', `movies:quality:${i}`, v(`quality.${i}`), p.quality === i)).join(''), cancel(ctx.t('Cancel'))); }
    if (d === 'storage') return box(v('Choose download storage'), choice('close-overlay', '', ctx.t('Internal storage'), true), cancel(ctx.t('Cancel')));
    if (d === 'rotation') { const p = prefs(data, 'books', BOOK_PREFS); return box(b('Auto-rotate screen'), ['Use system setting', 'Lock in portrait', 'Lock in landscape'].map((k, i) => choice('px-set', `books:rotation:${i}`, b(k), p.rotation === i)).join(''), cancel(ctx.t('Cancel'))); }
    if (d === 'sort') { const s = booksState(data).sort; return box(b('Sort by'), SORTS.map(([id, k]) => choice('px-sort', id, b(k), s === id)).join('')); }
    if (d === 'profile') { const p = prefs(data, 'games', GAME_PREFS); return box(g('Game Profile'), ['public', 'hidden'].map(k => choice('px-set', `games:profile:${k}`, g(k === 'public' ? 'Public' : 'Hidden'), p.profile === k)).join(''), cancel(ctx.t('Cancel'))); }
    if (d.startsWith('remove-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(12)); return box(b('Delete from library'), `<p class="lpx-msg">${e(book?.title || '')}</p>`, cancel(ctx.t('Cancel')) + `<button data-action="px-remove-book" data-id="${e(book?.id || '')}">${e(b('Delete from library'))}</button>`); }
    if (d.startsWith('share-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(11)); return box(fmt(b('Share "%1$s" via'), book?.title || ''), [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']].map(([app, name]) => `<button class="lpx-choice app" data-action="px-share-book" data-id="${app}|${e(book?.id || '')}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join('')); }
    return '';
  }
  // The overflow menus (games_default_menu, fragment_home's Refresh) and the drawers' Settings.
  function menu(ctx) {
    if (ctx.app === 'play-games') return [{action: 'px-page', id: 'games-settings', title: S(ctx, 'games', 'Settings')}];
    if (ctx.app === 'play-books') return [{action: 'pa-refresh', title: S(ctx, 'books', 'Refresh')}];
    return [];
  }
  const SETTINGS = {'play-music': 'music-settings', 'play-movies': 'movies-settings', 'play-books': 'books-settings', 'play-games': 'games-settings'};
  function handle(action, id, ctx) {
    const {ui, data} = ctx, music = ctx.music, tracks = ctx.tracks;
    const albumTracks = name => tracks.map((t, i) => t.album === name ? i : -1).filter(i => i >= 0);
    const open = sub => { (ui.paStack ||= []).push(ui.sub); ui.sub = sub; ui.overlay = ''; ui.paMore = ''; ctx.renderOverlay(); ctx.render(); };
    const done = () => { ui.overlay = ''; ui.paMore = ''; ctx.renderOverlay(); };
    const play = queue => { music.queue = queue; music.track = queue[0]; music.position = 0; music.playing = true; ctx.saveMusic(); done(); if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub; ui.sub = 'player'; ctx.render(); };
    const shuffled = list => { const out = [...list]; for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; } return out; };
    switch (action) {
      case 'px-doc': ui.paMore = `doc:${id}`; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-np': ui.paMore = 'np'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-reader-menu': ui.paMore = 'reader'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-dialog': ui.paMore = id; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-more': ui.paCluster = id; open('search-more'); return true;
      case 'px-artist': ui.paArtist = id; open('artist'); return true;
      case 'px-page': open(id); return true;
      case 'px-settings': open(SETTINGS[ctx.app]); return true;
      case 'px-limit': done(); ctx.toast('This feature is not part of the simulator.'); return true;
      case 'px-refresh': ctx.render(); return true;
      case 'px-toggle': { const [app, key] = id.split(':'), defaults = {music: MUSIC_PREFS, movies: MOVIE_PREFS, books: BOOK_PREFS, games: GAME_PREFS}[app]; setPref(data, app, {[key]: !prefs(data, app, defaults)[key]}); ctx.save(); ctx.render(); return true; }
      case 'px-set': { const [app, key, value] = id.split(':'); setPref(data, app, {[key]: /^\d+$/.test(value) ? Number(value) : value}); ctx.save(); done(); ctx.render(); return true; }
      case 'px-mix': case 'px-shuffle': {
        const [kind, name] = id.split(/:(.*)/), artist = kind === 'artist' ? name : albumsOf(ctx).find(a => a.album === name)?.artist;
        if (action === 'px-shuffle') { play(shuffled(kind === 'artist' ? tracks.map((t, i) => t.artist === artist ? i : -1).filter(i => i >= 0) : albumTracks(name))); return true; }
        const first = tracks.map((t, i) => t.artist === artist ? i : -1).filter(i => i >= 0), rest = tracks.map((_, i) => i).filter(i => !first.includes(i));
        play([...first, ...rest]); return true;
      }
      case 'px-play-next': case 'px-add-queue': {
        const ids = albumTracks(id), queue = music.queue.filter(i => !ids.includes(i) || i === music.track), rest = ids.filter(i => i !== music.track);
        if (action === 'px-play-next') queue.splice(queue.indexOf(music.track) + 1, 0, ...rest); else queue.push(...rest);
        music.queue = queue; ctx.saveMusic(); done(); ctx.render(); return true;
      }
      case 'px-keep': { const list = kept(data); data.playMusicKept = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-new-playlist': ui.paMore = `new-playlist:${id}`; ctx.renderOverlay(); ctx.root.ownerDocument.querySelector('[data-lpx-edit]')?.focus(); return true;
      case 'px-to-playlist': case 'px-create-playlist': {
        const target = (action === 'px-create-playlist' ? id : id.slice(id.indexOf('|') + 1)).replace(/^new-playlist:/, '');
        const ids = target === 'save-queue' ? [...music.queue] : target.startsWith('album:') ? albumTracks(target.slice(6)) : [Number(target.split(':')[1])];
        if (action === 'px-create-playlist') {
          const name = ctx.root.ownerDocument.querySelector('[data-lpx-edit]')?.value.trim(); if (!name) return true;
          music.playlists = [...music.playlists, {name, tracks: ids}]; ctx.saveMusic(); done(); ctx.render(); ctx.toast(fmt(S(ctx, 'music', 'Playlist "%s" created.'), name)); return true;
        }
        const p = music.playlists[Number(id.split('|')[0])]; if (p) p.tracks = [...new Set([...p.tracks, ...ids])];
        ctx.saveMusic(); done(); ctx.render(); return true;
      }
      case 'px-clear-queue': music.queue = [music.track]; music.playing = false; ctx.saveMusic(); done(); ui.sub = ui.paReturn || ''; ctx.render(); return true;
      case 'px-movie-pin': { const list = onDevice(data); data.playMoviesDevice = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-book-keep': { const st = booksState(data); st.notKept = st.notKept.includes(id) ? st.notKept.filter(x => x !== id) : [...st.notKept, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-remove-book': { const st = booksState(data); st.removed = [...new Set([...st.removed, id])]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-sort': booksState(data).sort = id; ctx.save(); done(); ctx.render(); return true;
      case 'px-book-about': ui.paItem = id || ui.paItem; open('book-about'); return true;
      case 'px-bookmark': {
        const all = bookmarks(data), at = Math.min(data.playBooks?.[id] || 0, P().bookPages(id) - 1), list = all[id] || [], had = list.includes(at);
        all[id] = had ? list.filter(x => x !== at) : [...list, at].sort((a, b) => a - b); ctx.save(); done(); ctx.render(); ctx.toast(S(ctx, 'books', had ? 'Removed bookmark.' : 'Added bookmark.')); return true;
      }
      case 'px-share-book': { const [app, bid] = id.split('|'), book = P().BOOKS.find(x => x.id === bid); done(); if (book) ctx.shareText(app, `${book.title} — ${book.author}\nhttps://play.google.com/store/books/details?id=${book.id}`, S(ctx, 'books', 'Shared a book')); return true; }
      case 'px-player': ui.paPlayer = id; open('player'); return true;
      case 'px-gplus': done(); ctx.openApp('google-plus'); return true;
      case 'px-dismiss': { data.playGamesDismissed = [...new Set([...dismissed(data), id])]; ctx.save(); done(); ctx.render(); ctx.toast(fmt(S(ctx, 'games', 'Dismissed %1$s'), id)); return true; }
      default: return false;
    }
  }
  // Back from this file's pages to the screen they were opened from.
  function back(ui) {
    if (!SUBS.includes(ui.sub)) return false;
    ui.sub = ui.paStack?.pop() ?? ''; return true;
  }
  window.PlayMore = {render, overlay, menu, handle, back, kept, onDevice, booksState, bookmarks, libraryBooks, players, MUSIC_PREFS};
})();
