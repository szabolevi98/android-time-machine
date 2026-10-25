/* The Play media apps' own operations on the JWR66Y image (play-apps.js draws the screens). From the APKs:
   - Play Music 5.0.1042J (Music2.odex): search's "%d MORE" opens the cluster's full list; DocumentMenuHandler for an
     album (Start instant mix, Play next, Add to queue, Keep on device, Add to playlist, Go to artist, Shop this artist)
     and an artist (Start instant mix, Shop this artist) with a Play Music account without All Access; ScreenMenuHandler's
     now playing menu (Start instant mix, Add to playlist, Go to artist, Go to album, Clear queue, Save as playlist);
     MusicSettingsActivity on music_settings.xml without All Access or debug logs (GENERAL, DOWNLOADING, STREAMING with
     "Stream at highest quality only", DEVELOPER), Holo Light on #F3F3F3 under the orange bar.
   - Play Movies 2.5.4: the row's download pin and movie_context_menu's "Remove from this device"; Settings is
     preferences.xml (Streaming, Downloads, Caption font size, Show cards on pause, Device ID, App version; surround sound
     is removed without 5.1 output) on the app's Holo dark theme.
   - Play Books 2.8.91: BooksCardsHomeView.populateBookMenu (Keep on device / Don't keep, Delete from library, About this
     book), the library Sort (Recently read, Title, Author), AppSettingsActivity's list (Account, Auto-rotate screen,
     Download over Wi-Fi only, Use volume key to turn pages, Use 3D effect for page turning, Automatically read aloud),
     fragment_reader.xml's overflow (About this book, Share, Add / Remove bookmark, Read aloud, Settings, Help); bookmarks
     show in Contents.
   What stays a limit: Equalizer, Accounts, Help and feedback, Read aloud and the open source licence page. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[`x.${key}`] || window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  const ACCOUNT = 'jellybean.demo@gmail.com', MUSIC_VERSION = '5.0.1042J.776638', MOVIES_VERSION = '2.5.4', DEVICE_ID = '2c64e1a9f07b35d8';
  const P = () => window.PlayApps;
  const art = (...args) => P().art(...args);
  const seedOf = id => [...String(id)].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  // Local state: kept albums, the apps' preferences, downloaded movies, books kept / removed, bookmarks.
  const store = (data, key, init) => (data[key] ||= init);
  const prefs = (data, app, defaults) => ({...defaults, ...(data.playPrefs?.[app] || {})});
  const setPref = (data, app, patch) => { data.playPrefs = {...(data.playPrefs || {}), [app]: {...(data.playPrefs?.[app] || {}), ...patch}}; };
  // The defaults of music_settings.xml, preferences.xml (download_policy "wifi", subtitles_size 2) and AppSettingsActivity.
  const MUSIC_PREFS = {contentFilter: false, cacheStreamed: true, autoCache: false, downloadWifi: true, streamWifi: false, streamHq: false};
  const MOVIE_PREFS = {warning: true, policy: 0, captionSize: 2, cards: true};
  const BOOK_PREFS = {rotation: 0, wifiOnly: true, volumeKeys: false, pageTurn3d: true, autoRead: false};
  const SUBS = ['search-more', 'artist', 'music-settings', 'download-queue', 'movies-settings', 'books-settings', 'book-about'];
  const check = (on, dark = false) => `<i class="pmx-check${on ? ' on' : ''}${dark ? ' dark' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  const row = (action, id, title, summary = '', extra = '', off = false) => `<button type="button" class="pmx-row${off ? ' off' : ''}" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const info = (title, summary) => `<div class="pmx-row pmx-info"><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></div>`;
  const cat = title => `<h4 class="pmx-cat">${e(title)}</h4>`;
  // Each app's own action bar going up: Music's orange MusicActionBar, Movies' black Holo bar, Books' flat blue bar.
  const BARS = {
    'play-music': title => `<header class="pm5-bar"><button class="pm5-home" data-action="back" aria-label="Back"><img class="pm5-toggle" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="pm5-logo" src="assets/pm5-ic_corpora_music_white.png" alt=""></button><span class="pm5-title"><b>${e(title)}</b></span></header>`,
    'play-movies': title => `<header class="mv25-bar"><button class="mv25-up" data-action="back" aria-label="Back"><img src="assets/ic_ab_back_holo_dark.png" alt=""><img src="assets/mv25-ic_launcher_videos.png" alt=""></button><b>${e(title)}</b></header>`,
    'play-books': title => `<header class="bk28-bar"><button class="bk28-home" data-action="back" aria-label="Back"><img class="bk28-toggle" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="bk28-logo" src="assets/bk28-ic_corpora_books.png" alt=""></button><b>${e(title)}</b></header>`
  };
  const APP_CLASS = {'play-music': 'pa-music', 'play-movies': 'pa-movies', 'play-books': 'pa-books'};
  const page = (ctx, title, body, cls = '') => `<div class="app-view pa-app pmx-page ${APP_CLASS[ctx.app]} ${cls}">${BARS[ctx.app](title)}<div class="pa-scroll">${body}</div></div>`;

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
      const p = prefs(data, 'music', MUSIC_PREFS);
      return page(ctx, m('Music settings'), cat(m('GENERAL')) + row('px-limit', 'account', m('Google account'), fmt(m('Connect using %s'), ACCOUNT)) + row('px-refresh', '', m('Refresh music'), m('Refresh summary'))
        + row('px-limit', 'eq', m('Equalizer'), m('Equalizer summary')) + row('px-toggle', 'music:contentFilter', m('Block explicit'), '', check(p.contentFilter))
        + cat(m('DOWNLOADING')) + row('px-toggle', 'music:cacheStreamed', m('Cache during playback'), m('Cache summary'), check(p.cacheStreamed)) + row('px-toggle', 'music:autoCache', m('Automatically cache'), m('Autocache summary'), check(p.autoCache))
        + row('px-dialog', 'clear-cache', m('Clear Cache'), m('Clear Cache summary')) + row('px-toggle', 'music:downloadWifi', m('Download via Wi-Fi only'), m('Download wifi summary'), check(p.downloadWifi))
        + row('px-page', 'download-queue', m('View download queue'), m('Download queue summary'))
        + cat(m('STREAMING')) + row('px-toggle', 'music:streamWifi', m('Stream via Wi-Fi only'), m('Stream wifi summary'), check(p.streamWifi)) + row('px-toggle', 'music:streamHq', m('Stream at highest quality only'), m('Stream hq summary'), check(p.streamHq))
        + cat(m('DEVELOPER')) + row('px-limit', 'licenses', m('Open source licenses')) + info(m('Music version'), MUSIC_VERSION), 'pmx-settings');
    }
    if (ui.sub === 'download-queue') return page(ctx, m('View download queue'), `<p class="pmx-empty">${e(m('No downloads'))}</p>`, 'pmx-settings');
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
    return page(ctx, v('Settings'), row('px-toggle', 'movies:warning', v('Streaming'), v('Streaming summary'), check(p.warning, true)) + row('px-dialog', 'policy', v('Downloads'), v('Downloads summary'))
      + row('px-dialog', 'caption', v('Caption font size'), v('Caption size summary')) + row('px-toggle', 'movies:cards', v('Show cards on pause'), v('Cards summary'), check(p.cards, true))
      + info(v('Device ID'), DEVICE_ID) + info(v('App version'), MOVIES_VERSION), 'pmx-settings pmx-dark');
  }
  // ---- Play Books ----
  const SORTS = [['recent', 'Recently read'], ['title', 'Title'], ['author', 'Author']];
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
      return page(ctx, b('Settings'), row('px-limit', 'account', b('Account'), ACCOUNT) + row('px-dialog', 'rotation', b('Auto-rotate screen'), b(rot)) + row('px-toggle', 'books:wifiOnly', b('Download over Wi-Fi only'), b('Wi-Fi summary'), check(p.wifiOnly))
        + row('px-toggle', 'books:volumeKeys', b('Use volume key'), '', check(p.volumeKeys)) + row('px-toggle', 'books:pageTurn3d', b('3D page turn'), '', check(p.pageTurn3d))
        + row('px-toggle', 'books:autoRead', b('Automatically read aloud'), b('Read aloud summary'), check(p.autoRead)), 'pmx-settings');
    }
    if (ui.sub === 'book-about') {
      const book = P().BOOKS.find(x => x.id === ui.paItem) || P().BOOKS[0];
      return page(ctx, b('About this book'), `<div class="pmx-about"><button class="pmx-about-cover" data-action="pa-book" data-id="${e(book.id)}" aria-label="${e(book.title)}">${art('book', seedOf(book.id), book.title, book.author)}</button><div><h2>${e(book.title)}</h2><p>${e(book.author)}</p></div></div><p class="pmx-about-text">${e(book.pages.find((text, i) => !book.starts.includes(i)) || '')}</p>`);
    }
    return '';
  }
  function bookMenu(ctx, id) {
    const b = key => S(ctx, 'books', key), keptBook = !booksState(ctx.data).notKept.includes(id);
    return [['px-book-keep', id, b(keptBook ? "Don't keep" : 'Keep on device')], ['px-dialog', `remove-book:${id}`, b('Delete from library')], ['px-book-about', id, b('About this book')]];
  }
  function readerMenu(ctx) {
    const b = key => S(ctx, 'books', key), id = ctx.ui.paItem, at = Math.min(ctx.data.playBooks?.[id] || 0, P().bookPages(id) - 1), marked = (bookmarks(ctx.data)[id] || []).includes(at);
    return [['px-book-about', id, b('About this book')], ['px-dialog', `share-book:${id}`, b('Share')], ['px-bookmark', id, b(marked ? 'Remove bookmark' : 'Add bookmark')], ['px-limit', 'read-aloud', b('Read aloud')], ['px-page', 'books-settings', b('Settings')], ['px-limit', 'help', b('Help')]];
  }
  // The sub-pages this file draws, or '' for play-apps.js's own.
  function render(ctx) {
    if (ctx.app === 'play-music') return musicPage(ctx);
    if (ctx.app === 'play-movies') return moviesPage(ctx);
    if (ctx.app === 'play-books') return booksPage(ctx);
    return '';
  }
  // The popup menus and dialogs (the pa-more overlay).
  function overlay(ctx) {
    const {ui, data} = ctx, d = ui.paMore || '';
    const items = list => `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu holo-menu-light pmx-menu">${list.map(([action, id, label]) => `<button data-action="${action}" data-id="${e(id)}">${e(label)}</button>`).join('')}</div>`;
    const box = (title, inner, buttons = '') => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="pmx-dialog${ctx.app === 'play-movies' ? ' dark' : ''}" role="dialog"><h3>${e(title)}</h3>${inner}${buttons ? `<div class="pmx-buttons">${buttons}</div>` : ''}</div>`;
    const choice = (action, id, label, on) => `<button class="pmx-choice${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}"><span>${e(label)}</span><i></i></button>`;
    const m = key => S(ctx, 'music', key), v = key => S(ctx, 'movies', key), b = key => S(ctx, 'books', key);
    const cancel = (label = ctx.t('Cancel')) => `<button data-action="close-overlay">${e(label)}</button>`;
    if (d.startsWith('doc:')) {
      const doc = d.slice(4), [kind, id] = doc.split(/:(.*)/);
      if (kind === 'book') return items(bookMenu(ctx, id));
      if (kind === 'movie') return items([['px-movie-pin', id, v('Remove from this device')]]);
      return items(musicMenu(ctx, doc));
    }
    if (d === 'np') return items(musicMenu(ctx, 'np:'));
    if (d === 'reader') return items(readerMenu(ctx));
    if (d.startsWith('playlist:')) {
      const target = d.slice(9);
      return box(m('Add to playlist title'), `<div class="pmx-list"><button class="pmx-choice new" data-action="px-new-playlist" data-id="${e(target)}"><span>${e(m('New playlist'))}</span></button>${ctx.music.playlists.map((p, i) => `<button class="pmx-choice plain" data-action="px-to-playlist" data-id="${i}|${e(target)}"><span>${e(p.name)}</span></button>`).join('')}</div>`, cancel(m('Cancel')));
    }
    if (d.startsWith('new-playlist:') || d === 'save-queue') return box(m('New playlist'), `<input class="pmx-edit" data-pmx-edit maxlength="80" value="${e(fmt(m('Playlist %d'), ctx.music.playlists.length + 1))}" aria-label="${e(m('New playlist'))}">`, cancel(m('Cancel')) + `<button data-action="px-create-playlist" data-id="${e(d)}">${e(m('OK'))}</button>`);
    if (d === 'clear-cache') return box(m('Clear Cache'), `<p class="pmx-msg">${e(m('Clear Cache summary'))}</p>`, cancel(m('Cancel')) + `<button data-action="close-overlay">${e(m('OK'))}</button>`);
    if (d === 'policy') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Downloads'), [0, 1].map(i => choice('px-set', `movies:policy:${i}`, v(`policy.${i}`), p.policy === i)).join(''), cancel()); }
    if (d === 'caption') { const p = prefs(data, 'movies', MOVIE_PREFS); return box(v('Caption font size'), [0, 1, 2, 3].map(i => choice('px-set', `movies:captionSize:${i}`, v(`size.${i}`), p.captionSize === i)).join(''), cancel()); }
    if (d === 'rotation') { const p = prefs(data, 'books', BOOK_PREFS); return box(b('Auto-rotate screen'), ['Use system setting', 'Lock in portrait', 'Lock in landscape'].map((k, i) => choice('px-set', `books:rotation:${i}`, b(k), p.rotation === i)).join(''), cancel()); }
    if (d === 'sort') { const s = booksState(data).sort; return box(b('Sort by'), SORTS.map(([id, k]) => choice('px-sort', id, b(k), s === id)).join('')); }
    if (d.startsWith('remove-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(12)); return box(b('Delete from library'), `<p class="pmx-msg">${e(book?.title || '')}</p>`, cancel() + `<button data-action="px-remove-book" data-id="${e(book?.id || '')}">${e(b('Delete from library'))}</button>`); }
    if (d.startsWith('share-book:')) { const book = P().BOOKS.find(x => x.id === d.slice(11)); return box(fmt(b('Share "%1$s" via'), book?.title || ''), [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']].map(([app, name]) => `<button class="pmx-choice app" data-action="px-share-book" data-id="${app}|${e(book?.id || '')}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join('')); }
    return '';
  }
  // The action bar overflows with their local actions: home_activity.xml (Refresh music, Settings, Help), common_menu
  // and home_menu (Settings, Help, Contact us, Send feedback, Refresh, Accounts), home.xml (Sort in My Library, Refresh,
  // Settings, Help).
  function menu(ctx) {
    const m = key => S(ctx, 'music', key), v = key => S(ctx, 'movies', key), b = key => S(ctx, 'books', key);
    if (ctx.app === 'play-music') return [{action: 'pa-refresh', title: m('Refresh')}, {action: 'px-page', id: 'music-settings', title: m('Settings')}, {action: 'px-limit', title: m('Help')}];
    if (ctx.app === 'play-movies') return [['px-page', 'Settings', 'movies-settings'], ['px-limit', 'Help'], ['px-limit', 'Contact us'], ['px-limit', 'Send feedback'], ['pa-refresh', 'Refresh'], ['px-limit', 'Accounts']].map(([action, key, id]) => ({action, id, title: v(key)}));
    if (ctx.app === 'play-books') return [...((ctx.ui.paPage?.['play-books'] || 'read') === 'library' ? [{action: 'px-dialog', id: 'sort', title: b('Sort')}] : []), {action: 'pa-refresh', title: b('Refresh')}, {action: 'px-page', id: 'books-settings', title: b('Settings')}, {action: 'px-limit', title: b('Help')}];
    return [];
  }
  function handle(action, id, ctx) {
    const {ui, data} = ctx, music = ctx.music, tracks = ctx.tracks;
    const albumTracks = name => tracks.map((t, i) => t.album === name ? i : -1).filter(i => i >= 0);
    const open = sub => { (ui.paStack ||= []).push(ui.sub); ui.sub = sub; ui.overlay = ''; ui.paMore = ''; ctx.renderOverlay(); ctx.render(); };
    const done = () => { ui.overlay = ''; ui.paMore = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'px-doc': ui.paMore = `doc:${id}`; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-np': ui.paMore = 'np'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-reader-menu': ui.paMore = 'reader'; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-dialog': ui.paMore = id; ui.overlay = 'pa-more'; ctx.renderOverlay(); return true;
      case 'px-more': ui.paCluster = id; open('search-more'); return true;
      case 'px-artist': ui.paArtist = id; open('artist'); return true;
      case 'px-page': open(id); return true;
      case 'px-limit': done(); ctx.toast('This feature is not part of the simulator.'); return true;
      case 'px-refresh': ctx.render(); return true;
      case 'px-toggle': { const [app, key] = id.split(':'), defaults = {music: MUSIC_PREFS, movies: MOVIE_PREFS, books: BOOK_PREFS}[app]; setPref(data, app, {[key]: !prefs(data, app, defaults)[key]}); ctx.save(); ctx.render(); return true; }
      case 'px-set': { const [app, key, value] = id.split(':'); setPref(data, app, {[key]: /^\d+$/.test(value) ? Number(value) : value}); ctx.save(); done(); ctx.render(); return true; }
      case 'px-mix': {
        const [kind, name] = id.split(/:(.*)/), artist = kind === 'artist' ? name : albumsOf(ctx).find(a => a.album === name)?.artist;
        const first = tracks.map((t, i) => t.artist === artist ? i : -1).filter(i => i >= 0), rest = tracks.map((_, i) => i).filter(i => !first.includes(i));
        music.queue = [...first, ...rest]; music.track = music.queue[0]; music.position = 0; music.playing = true; ctx.saveMusic(); done();
        if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub; ui.sub = 'player'; ctx.render(); return true;
      }
      case 'px-play-next': case 'px-add-queue': {
        const ids = albumTracks(id), queue = music.queue.filter(i => !ids.includes(i) || i === music.track), rest = ids.filter(i => i !== music.track);
        if (action === 'px-play-next') queue.splice(queue.indexOf(music.track) + 1, 0, ...rest); else queue.push(...rest);
        music.queue = queue; ctx.saveMusic(); done(); ctx.render(); return true;
      }
      case 'px-keep': { const list = kept(data); data.playMusicKept = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ctx.save(); done(); ctx.render(); return true; }
      case 'px-new-playlist': ui.paMore = `new-playlist:${id}`; ctx.renderOverlay(); ctx.root.ownerDocument.querySelector('[data-pmx-edit]')?.select(); return true;
      case 'px-to-playlist': case 'px-create-playlist': {
        const target = (action === 'px-create-playlist' ? id : id.slice(id.indexOf('|') + 1)).replace(/^new-playlist:/, '');
        const ids = target === 'save-queue' ? [...music.queue] : target.startsWith('album:') ? albumTracks(target.slice(6)) : [Number(target.split(':')[1])];
        if (action === 'px-create-playlist') { const name = ctx.root.ownerDocument.querySelector('[data-pmx-edit]')?.value.trim(); if (!name) return true; music.playlists = [...music.playlists, {name, tracks: ids}]; }
        else { const p = music.playlists[Number(id.split('|')[0])]; if (p) p.tracks = [...new Set([...p.tracks, ...ids])]; }
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
        all[id] = had ? list.filter(x => x !== at) : [...list, at].sort((a, b) => a - b); ctx.save(); done(); ctx.render(); ctx.toast(S(ctx, 'books', had ? 'Bookmark removed.' : 'Bookmark added.')); return true;
      }
      case 'px-share-book': { const [app, bid] = id.split('|'), book = P().BOOKS.find(x => x.id === bid); done(); if (book) ctx.shareText(app, `${book.title} — ${book.author}\nhttps://play.google.com/store/books/details?id=${book.id}`, fmt(S(ctx, 'books', 'Check out "%1$s"'), book.title)); return true; }
      default: return false;
    }
  }
  // Back from this file's pages to the screen they were opened from.
  function back(ui) {
    if (!SUBS.includes(ui.sub)) return false;
    ui.sub = ui.paStack?.pop() ?? ''; return true;
  }
  window.PlayMore = {render, overlay, menu, handle, back, kept, onDevice, booksState, bookmarks, libraryBooks};
})();
