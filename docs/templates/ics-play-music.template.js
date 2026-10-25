/* Google Play Music 4.1.513 on the Galaxy Nexus (IMM76I), from the image's Music2.apk: a dark Holo app under the
   transparent dark action bar (top_action_bar: the headphones home icon, Search), the scrolling tab row of 140 dp tabs in
   12 sp (tab_layout: Recent, Artists, Albums, Songs, Playlists, Genres), the Recent carousel of album covers on its
   carousel_background #1a1a4d, art walls for artists, albums, playlists and genres (wall_*_label: the name over the
   count), song rows with 64 dp album art and the blue playing indicator (played_text #33b5e5), the now-playing bar, and
   the player (nowplaying: big art, the track in white, album and artist at 75 %, the timecodes in #dddddd). It plays the
   simulator's demo library through the shared music engine (music.js), so AOSP Music and Play Music share the queue.
   Texts are Music2.apk's (docs/tools/apk-strings.py); covers are drawn. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({"Recent": "spinner_carousel", "Artists": "artists_title", "Albums": "albums_title", "Songs": "tracks_title",
    "Playlists": "playlists_title", "Genres": "genres_title", "Search music": "search_hint", "Shuffle all": "shuffle_all", "Now playing": "nowplaying_title",
    "Shuffle": "shuffle", "Make instant mix": "menu_make_instant_mix", "Add to playlist": "add_to_playlist", "New playlist": "new_playlist_title",
    "Remove from playlist": "remove_from_playlist", "All songs": "all_songs_list", "No songs": "no_tracks_title", "More by artist": "more_by_artist",
    "Current playlist": "queue", "Settings": "settings", "Help": "help_title", "Unknown artist": "unknown_artist_name",
    "ARTISTS": "search_section_header_artists", "ALBUMS": "search_section_header_albums", "SONGS": "search_section_header_songs",
    "PLAYLISTS": "search_section_header_playlists", "Cancel current search": "accessibility_search_cancel", "%s Mix": "instant_mix_default_name",
    "Adding an instant mix to playlists, based on %s.": "creating_instant_mix_with_seed", "Cancel": "cancel", "Music settings": "stream_settings",
    "Google Play account": "account_settings_title", "Connect to Google Play using %s": "account_selected_summary",
    "Hide unavailable music": "hide_when_not_connected_title", "Show only available music when offline": "hide_when_not_connected_summary",
    "Cache music": "cache_streamed_title", "Temporarily store streamed music": "cache_streamed_summary", "Stream via Wi-Fi only": "stream_only_on_wifi_title",
    "Stream music only when connected via Wi-Fi": "stream_only_on_wifi_summary", "Stream high quality": "stream_only_hq_title",
    "Always stream music at the highest quality": "stream_only_hq_summary", "Refresh": "refresh_title", "Refresh music from Google Play": "refresh_summary",
    "Download via Wi-Fi only": "offlinedl_only_on_wifi_title", "Download music for availablility offline only via Wi-Fi": "offlinedl_only_on_wifi_summary",
    "Download queue": "download_queue_title", "Show the songs currently being downloaded": "download_queue_summary", "No songs queued for download": "show_no_downloads_title",
    "Lock screen controls": "lock_screen_controls_title", "Show music controls on top of the lock screen": "lock_screen_controls_summary",
    "Open source licenses": "license_title", "Music version": "music_version_title"});
  const STR = AndroidStrings.table('', STRINGS, AndroidStrings.shared), T = (lang, key) => STR.t(key, lang);
  const TABS = ['Recent', 'Artists', 'Albums', 'Songs', 'Playlists', 'Genres'];
  const GENRE = {'The Demo Tapes': 'Electronic', 'Paper Satellites': 'Indie'};
  const PALETTE = [['#3c5a8a', '#f1b45d'], ['#5a2a5e', '#e0805c'], ['#2c6e5a', '#cfe08a'], ['#7a3a2a', '#f0c070'], ['#2a3a6a', '#8fc0f0']];
  const hash = text => [...String(text)].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  // A drawn cover: two colours, a disc and the name.
  function cover(name, size = '') {
    const [a, b] = PALETTE[hash(name) % PALETTE.length];
    return `<span class="pm4-cover ${size}" style="--a:${a};--b:${b}"><i></i><em>${e(name)}</em></span>`;
  }
  const albums = tracks => [...new Set(tracks.map(t => t.album))];
  const artists = tracks => [...new Set(tracks.map(t => t.artist))];
  const genres = tracks => [...new Set(tracks.map(t => GENRE[t.artist] || 'Pop'))];
  function members(tracks, music, kind, id) {
    const all = tracks.map((t, i) => [t, i]);
    if (kind === 'album') return all.filter(([t]) => t.album === id).map(([, i]) => i);
    if (kind === 'artist') return all.filter(([t]) => t.artist === id).map(([, i]) => i);
    if (kind === 'genre') return all.filter(([t]) => (GENRE[t.artist] || 'Pop') === id).map(([, i]) => i);
    if (kind === 'playlist') return (music.playlists.find(p => String(p.id) === String(id))?.tracks || []);
    return all.map(([, i]) => i);
  }
  function bar(ctx, {up = false, title = ''} = {}) {
    return `<header class="pm4-bar"><button class="pm4-home" data-action="${up ? 'back' : 'home'}" aria-label="Play Music">${up ? '<span class="pm4-back">‹</span>' : ''}<img src="assets/play-music.png" alt=""></button>${title ? `<b class="pm4-title">${e(title)}</b>` : '<span class="pm4-spacer"></span>'}<button class="pm4-icon" data-action="pm4-search" aria-label="${e(T(ctx.lang, 'Search music'))}"><img src="assets/pm4-ic_menu_search_holo_dark.png" alt=""></button><button class="pm4-icon" data-action="pm4-menu" aria-label="${e(T(ctx.lang, 'More options'))}"><img src="assets/pm4-ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>`;
  }
  function songRows(ctx, ids, queue) {
    const {tracks, music} = ctx;
    if (!ids.length) return `<p class="pm4-empty">${e(T(ctx.lang, 'No songs'))}</p>`;
    return ids.map(i => { const t = tracks[i]; return `<button class="pm4-song${music.track === i ? ' playing' : ''}" data-action="pm4-play" data-id="${i}" data-queue="${e(queue)}">${cover(t.album, 'small')}<span class="pm4-song-copy"><b>${e(t.title)}</b><small>${e(t.artist)}</small></span>${music.track === i && music.playing ? '<i class="pm4-indicator" aria-hidden="true"><b></b><b></b><b></b></i>' : ''}</button>`; }).join('');
  }
  const wall = (kind, items) => `<div class="pm4-wall">${items.map(([id, name, sub]) => `<button class="pm4-tile" data-action="pm4-group" data-id="${e(kind + ':' + id)}">${cover(name, 'big')}<span class="pm4-label"><b>${e(name)}</b><small>${e(sub)}</small></span></button>`).join('')}</div>`;
  function tabContent(ctx, tab) {
    const {tracks, music, lang} = ctx, count = n => `${n} ${T(lang, 'Songs').toLocaleLowerCase()}`;
    if (tab === 'Recent') {
      const list = albums(tracks), center = Math.max(0, list.indexOf(tracks[music.track]?.album));
      return `<div class="pm4-carousel">${list.map((name, i) => `<button class="pm4-carousel-item" style="--d:${i - center}" data-action="pm4-group" data-id="album:${e(name)}">${cover(name, 'big')}</button>`).join('')}<div class="pm4-carousel-caption"><b>${e(list[center] || '')}</b><small>${e(tracks.find(t => t.album === list[center])?.artist || '')}</small></div><button class="pm4-shuffle-all" data-action="pm4-shuffle-all">${e(T(lang, 'Shuffle all'))}</button></div>`;
    }
    if (tab === 'Artists') return wall('artist', artists(tracks).map(a => [a, a, count(members(tracks, music, 'artist', a).length)]));
    if (tab === 'Albums') return wall('album', albums(tracks).map(a => [a, a, tracks.find(t => t.album === a).artist]));
    if (tab === 'Genres') return wall('genre', genres(tracks).map(g => [g, g, count(members(tracks, music, 'genre', g).length)]));
    if (tab === 'Playlists') return music.playlists.length ? wall('playlist', music.playlists.map(p => [p.id, p.name, count(p.tracks.length)])) : `<p class="pm4-empty">${e(T(lang, 'No songs'))}</p>`;
    return songRows(ctx, tracks.map((_, i) => i), 'all');
  }
  function nowBar(ctx) {
    const {tracks, music} = ctx, t = tracks[music.track]; if (!t) return '';
    return `<div class="pm4-nowbar"><button class="pm4-nowbar-open" data-action="pm4-player">${cover(t.album, 'small')}<span><b>${e(t.title)}</b><small>${e(t.artist)}</small></span></button><button class="pm4-nowbar-play" data-action="music-play" aria-label="${music.playing ? 'Pause' : 'Play'}">${music.playing ? '❚❚' : '▶'}</button></div>`;
  }
  function library(ctx) {
    const {ui, lang} = ctx, tab = TABS.includes(ui.pm4Tab) ? ui.pm4Tab : 'Recent';
    return `<div class="app-view pm4-app">${bar(ctx)}<nav class="pm4-tabs" role="tablist">${TABS.map(name => `<button role="tab" aria-selected="${name === tab}" class="${name === tab ? 'on' : ''}" data-action="pm4-tab" data-id="${name}">${e(T(lang, name))}</button>`).join('')}</nav><div class="pm4-scroll${tab === 'Recent' ? ' pm4-recent' : ''}">${tabContent(ctx, tab)}</div>${nowBar(ctx)}</div>`;
  }
  function group(ctx) {
    const {ui, tracks, music, lang} = ctx, [kind, ...rest] = String(ui.pm4Group || 'album:').split(':'), id = rest.join(':');
    const name = kind === 'playlist' ? music.playlists.find(p => String(p.id) === id)?.name || '' : id;
    const ids = members(tracks, music, kind, id);
    const sub = kind === 'album' ? tracks.find(t => t.album === id)?.artist || T(lang, 'Unknown artist') : `${ids.length} ${T(lang, 'Songs').toLocaleLowerCase()}`;
    return `<div class="app-view pm4-app">${bar(ctx, {up: true})}<div class="pm4-scroll"><div class="pm4-group-head">${cover(name, 'big')}<span><b>${e(name)}</b><small>${e(sub)}</small><button data-action="pm4-play" data-id="${ids[0] ?? ''}" data-queue="${e(ui.pm4Group)}">${e(T(lang, 'Shuffle all'))}</button></span></div>${songRows(ctx, ids, ui.pm4Group)}</div>${nowBar(ctx)}</div>`;
  }
  function player(ctx) {
    const {tracks, music, lang, time} = ctx, t = tracks[music.track] || tracks[0];
    const p = Math.min(100, music.position / t.duration * 100);
    return `<div class="app-view pm4-app pm4-player">${bar(ctx, {up: true})}<div class="pm4-np-head"><span class="pm4-np-label">${e(T(lang, 'Now playing'))}</span><b>${e(t.title)}</b><small>${e(t.album)} · ${e(t.artist)}</small></div><div class="pm4-np-art">${cover(t.album, 'huge')}</div><div class="pm4-np-seek"><time class="music-elapsed">${e(time(music.position))}</time><span class="pm4-np-track"><i style="width:${p.toFixed(1)}%"></i></span><time>${e(time(t.duration))}</time></div><div class="pm4-np-controls"><button data-action="music-shuffle" class="${music.shuffle ? 'on' : ''}" aria-label="${e(T(lang, 'Shuffle'))}">⤨</button><button data-action="music-prev" aria-label="Previous">⏮</button><button class="pm4-np-play" data-action="music-play" aria-label="${music.playing ? 'Pause' : 'Play'}">${music.playing ? '❚❚' : '▶'}</button><button data-action="music-next" aria-label="Next">⏭</button><button data-action="music-repeat" class="${music.repeat !== 'off' ? 'on' : ''}" aria-label="Repeat">${music.repeat === 'one' ? '↻¹' : '↻'}</button></div></div>`;
  }
  // Search (the action bar's SearchView with search_hint): the matches in track_list_item_search sections (ARTISTS,
  // ALBUMS, SONGS, PLAYLISTS: a 32 dp header, then 64 dp rows with the art, the name and the artist).
  function search(ctx) {
    const {ui, tracks, music, lang} = ctx, q = String(ui.pm4Query || '').trim().toLocaleLowerCase(), has = text => String(text).toLocaleLowerCase().includes(q);
    const row = (action, id, name, sub, extra = '') => `<button class="pm4-song" data-action="${action}" data-id="${e(id)}"${extra}>${cover(name, 'small')}<span class="pm4-song-copy"><b>${e(name)}</b><small>${e(sub)}</small></span></button>`;
    const section = (title, rows) => rows.length ? `<h3 class="pm4-search-head">${e(T(lang, title))}</h3>${rows.join('')}` : '';
    const body = q ? section('ARTISTS', artists(tracks).filter(has).map(a => row('pm4-group', `artist:${a}`, a, `${members(tracks, music, 'artist', a).length} ${T(lang, 'Songs').toLocaleLowerCase()}`)))
      + section('ALBUMS', albums(tracks).filter(has).map(a => row('pm4-group', `album:${a}`, a, tracks.find(t => t.album === a).artist)))
      + section('SONGS', tracks.map((t, i) => [t, i]).filter(([t]) => has(t.title)).map(([t, i]) => row('pm4-play', i, t.title, t.artist, ' data-queue="all"')))
      + section('PLAYLISTS', music.playlists.filter(p => has(p.name)).map(p => row('pm4-group', `playlist:${p.id}`, p.name, `${p.tracks.length} ${T(lang, 'Songs').toLocaleLowerCase()}`))) : '';
    return `<div class="app-view pm4-app"><form class="pm4-bar pm4-searchbar" data-form="pm4-search"><button type="button" class="pm4-home" data-action="back" aria-label="Back"><span class="pm4-back">‹</span><img src="assets/play-music.png" alt=""></button><input data-pm4-query value="${e(ui.pm4Query || '')}" placeholder="${e(T(lang, 'Search music'))}" aria-label="${e(T(lang, 'Search music'))}" autocomplete="off" spellcheck="false">${ui.pm4Query ? `<button type="button" class="pm4-icon" data-action="pm4-search-clear" aria-label="${e(T(lang, 'Cancel current search'))}">✕</button>` : ''}</form><div class="pm4-scroll">${body || (q ? `<p class="pm4-empty">${e(T(lang, 'No songs'))}</p>` : '')}</div>${nowBar(ctx)}</div>`;
  }
  // MusicSettingsActivity (music_settings.xml, Holo dark): the account, then the check boxes in their order; the
  // values are kept (data.pm4Prefs) though nothing streams here.
  const PREFS = {hideUnavailable: false, cacheStreamed: true, streamWifi: false, streamHq: false, downloadWifi: true, lockControls: true};
  const prefs = data => ({...PREFS, ...(data.pm4Prefs || {})});
  function settings(ctx) {
    const {lang} = ctx, p = prefs(ctx.data), M = key => T(lang, key);
    const row = (action, title, summary = '') => `<button class="pm4-pref" data-action="${action}"><span><b>${e(M(title))}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
    const chk = (key, title, summary) => `<button class="pm4-pref" data-action="pm4-pref" data-id="${key}" role="checkbox" aria-checked="${!!p[key]}"><span><b>${e(M(title))}</b><small>${e(M(summary))}</small></span><img src="assets/btn_check_${p[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    return `<div class="app-view pm4-app pm4-settings">${bar(ctx, {up: true, title: M('Music settings')})}<div class="pm4-scroll">${row('pm4-unsupported', 'Google Play account', AndroidStrings.format(M('Connect to Google Play using %s'), ctx.account || 'icecream.demo@gmail.com'))}${chk('hideUnavailable', 'Hide unavailable music', 'Show only available music when offline')}${chk('cacheStreamed', 'Cache music', 'Temporarily store streamed music')}${chk('streamWifi', 'Stream via Wi-Fi only', 'Stream music only when connected via Wi-Fi')}${chk('streamHq', 'Stream high quality', 'Always stream music at the highest quality')}${row('pm4-refresh', 'Refresh', M('Refresh music from Google Play'))}${chk('downloadWifi', 'Download via Wi-Fi only', 'Download music for availablility offline only via Wi-Fi')}${row('pm4-download-queue', 'Download queue', M('Show the songs currently being downloaded'))}${chk('lockControls', 'Lock screen controls', 'Show music controls on top of the lock screen')}${row('pm4-unsupported', 'Open source licenses')}<div class="pm4-pref info"><span><b>${e(M('Music version'))}</b><small>4.1.513</small></span></div></div></div>`;
  }
  const downloadQueue = ctx => `<div class="app-view pm4-app pm4-settings">${bar(ctx, {up: true, title: T(ctx.lang, 'Download queue')})}<div class="pm4-scroll"><p class="pm4-empty">${e(T(ctx.lang, 'No songs queued for download'))}</p></div></div>`;
  function render(ctx) {
    if (ctx.ui.sub === 'search') return search(ctx);
    if (ctx.ui.sub === 'settings') return settings(ctx);
    if (ctx.ui.sub === 'download-queue') return downloadQueue(ctx);
    if (ctx.ui.sub === 'player') return player(ctx);
    if (ctx.ui.sub === 'group') return group(ctx);
    return library(ctx);
  }
  function overlay(ctx) {
    // create_instant_mix: the progress, "Adding an instant mix to playlists, based on %s." and Cancel.
    if (ctx.ui.overlay === 'pm4-mixing') { const t = ctx.tracks[ctx.music.track] || ctx.tracks[0]; return `<div class="settings-dialog-scrim"></div><div class="settings-dialog pm4-mixing" role="dialog"><i class="pm4-spinner" aria-hidden="true"></i><p>${e(AndroidStrings.format(T(ctx.lang, 'Adding an instant mix to playlists, based on %s.'), t.title))}</p><div class="settings-dialog-actions"><button data-action="pm4-mix-cancel">${e(T(ctx.lang, 'Cancel'))}</button></div></div>`; }
    if (ctx.ui.overlay !== 'pm4-menu') return null;
    const item = (action, label) => `<button data-action="${action}">${e(T(ctx.lang, label))}</button>`;
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu pm4-menu" role="menu">${item('pm4-shuffle-all', 'Shuffle all')}${item('pm4-mix', 'Make instant mix')}${item('pm4-settings', 'Settings')}${item('pm4-unsupported', 'Help')}</div>`;
  }
  // ctx: {tracks, music, ui, lang, time, play(ids, track), save, render, renderOverlay, toast}.
  function handle(action, id, ctx, button) {
    const {ui, tracks, music} = ctx;
    switch (action) {
      case 'pm4-tab': ui.pm4Tab = id; ui.sub = ''; ctx.render(); break;
      case 'pm4-group': ui.pm4FromSearch = ui.sub === 'search'; if (ui.pm4FromSearch) ui.pm4From = 'search'; ui.pm4Group = id; ui.sub = 'group'; ctx.render(); break;
      case 'pm4-player': ui.sub = 'player'; ctx.render(); break;
      case 'pm4-play': {
        const queue = button?.dataset.queue || 'all', [kind, ...rest] = queue.split(':');
        const ids = queue === 'all' ? tracks.map((_, i) => i) : members(tracks, music, kind, rest.join(':'));
        if (id === '' || !ids.length) break;
        ctx.play(ids, Number(id)); ui.sub = 'player'; ctx.render(); break;
      }
      case 'pm4-shuffle-all': { const ids = tracks.map((_, i) => i); music.shuffle = true; ctx.play(ids, ids[Math.floor(Math.random() * ids.length)]); ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'player'; ctx.render(); break; }
      case 'pm4-menu': ui.overlay = 'pm4-menu'; ctx.renderOverlay(); break;
      case 'pm4-search': ui.pm4Query = ''; ui.pm4From = ui.sub; ui.sub = 'search'; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); ctx.focus('[data-pm4-query]'); break;
      case 'pm4-search-clear': ui.pm4Query = ''; ctx.render(); ctx.focus('[data-pm4-query]'); break;
      case 'pm4-settings': ui.overlay = ''; ctx.renderOverlay(); ui.pm4From = ui.sub; ui.sub = 'settings'; ctx.render(); break;
      case 'pm4-download-queue': ui.sub = 'download-queue'; ctx.render(); break;
      case 'pm4-refresh': ctx.render(); break;
      case 'pm4-pref': { const p = prefs(ctx.data); ctx.data.pm4Prefs = {...p, [id]: !p[id]}; ctx.save(); ctx.render(); break; }
      // Make instant mix from the playing song: a "%s Mix" playlist of it and its genre's and artist's songs first,
      // then the rest of the collection, added to Playlists and played.
      case 'pm4-mix': {
        ui.overlay = 'pm4-mixing'; ctx.renderOverlay();
        clearTimeout(ui.pm4MixTimer);
        ui.pm4MixTimer = setTimeout(() => {
          if (ui.overlay !== 'pm4-mixing') return;
          const seed = tracks[music.track] ? music.track : 0, s = tracks[seed], genre = t => GENRE[t.artist] || 'Pop';
          const rank = t => (t.artist === s.artist ? 0 : genre(t) === genre(s) ? 1 : 2);
          const ids = [seed, ...tracks.map((t, i) => [t, i]).filter(([, i]) => i !== seed).sort((a, b) => rank(a[0]) - rank(b[0])).map(([, i]) => i)];
          const id = Date.now(); music.playlists = [...music.playlists, {id, name: AndroidStrings.format(T(ctx.lang, '%s Mix'), s.title), tracks: ids}];
          ui.overlay = ''; ctx.renderOverlay(); ctx.play(ids, seed); ui.pm4Group = `playlist:${id}`; ui.sub = 'group'; ctx.render();
        }, 1500);
        break;
      }
      case 'pm4-mix-cancel': clearTimeout(ui.pm4MixTimer); ui.overlay = ''; ctx.renderOverlay(); break;
      case 'pm4-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  // Back: search and settings go back where they opened from, the download queue to the settings.
  function back(ui) {
    if (ui.sub === 'download-queue') { ui.sub = 'settings'; return true; }
    if (ui.sub === 'search' || ui.sub === 'settings') { ui.sub = ui.pm4From && ui.pm4From !== 'search' ? ui.pm4From : ''; return true; }
    if (ui.sub === 'group' && ui.pm4From === 'search' && ui.pm4FromSearch) { ui.sub = 'search'; ui.pm4FromSearch = false; return true; }
    return false;
  }
  window.ICSPlayMusic = {TABS, PREFS, prefs, render, overlay, handle, back};
})();
