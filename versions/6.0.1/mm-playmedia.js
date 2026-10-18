/* Android 6.0.1 Play Music 6.0 (app/Music2), Play Movies & TV 3.8 (app/Videos) and Play Games 3.2 (app/PlayGames) of
   MTC20K, the apps 'play-music', 'play-movies' and 'play-games', on the demo account that has bought nothing yet.
   They share one shape (each with its own APK's resources): the toolbar in the app's primary colour (play_music_primary
   #ef6c00, play_movies_primary #ed3b3b, play_games_theme_primary #689f38) with the drawer and search (ic_search_white),
   the drawer with the account banner and the app's own ic_drawer_* rows (the current one in its _selected icon), and
   the library pages, empty for a new account with the app's own empty texts (Play Music's ic_empty_state, "Your music
   library is empty."; Movies' "No movies" / "No TV shows"); Play Games lists the games installed from the Play Store
   (games_edu_mygames when there are none). Shop / Explore open the Play Store.
   - The drawer's foot: Settings (Play Music's music_settings and Movies' preferences through mm-appprefs.js; Play Games'
     are Google Play services' Play Games settings, mm-gms.js) and Help (Google's help for the app).
   - Search: the Play search plate over the toolbar (the back arrow, the app's search hint, the clear button); the
     library is empty, so Play Music answers empty_screen_search (empty_search_screen_helper_text before typing),
     Movies no_results, and Play Games the installed games that match or games_search_games_no_results. */
(() => {
  'use strict';
  const esc = (c, s) => c.safe(s);
  const APPS = {
    'play-music': {table: 'playmusic', color: '#ef6c00', status: '#e65100', prefix: 'pm', title: 'launcher_name',
      pages: [['top_menu_mainstage', 'ic_drawer_listennow'], ['top_menu_my_library', 'ic_drawer_mymusiclibrary'], ['playlists_title', 'ic_drawer_playlists'], ['top_menu_instant_mixes', 'ic_drawer_radio'], ['top_menu_shop', 'ic_drawer_shop', 'shop']],
      footer: ['settings', 'help_title'], prefs: ['music', 'music_settings'], hint: 'search', none: 'empty_screen_search', before: 'empty_search_screen_helper_text',
      body: (c, t, page) => page === 2 ? empty(c, 'pm-ic_empty_state', t.t('empty_screen_playlists')) : page === 1 ? empty(c, 'pm-ic_empty_state', t.t('empty_screen_my_library_all_music')) : empty(c, 'pm-ic_empty_state', t.t('no_music_heading'), t.t('no_music_setup_uploader_body'))},
    'play-movies': {table: 'playmovies', color: '#ed3b3b', status: '#c62828', prefix: 'pv', title: 'application_name_with_tv',
      pages: [['tab_watch_now', 'ic_drawer_watchnow'], ['tab_my_library', 'ic_drawer_mymovielibrary'], ['menu_shop', 'ic_drawer_shop', 'shop']],
      footer: ['menu_settings', 'menu_help_and_feedback'], prefs: ['movies', 'preferences'], hint: 'menu_search', none: 'no_results',
      body: (c, t, page) => page === 1 ? `${empty(c, '', t.t('no_movies'))}${empty(c, '', t.t('no_shows'))}` : empty(c, '', t.t('no_movies'))},
    'play-games': {table: 'playgames', color: '#689f38', status: '#4e802b', prefix: 'pg', title: 'games_app_launcher_name',
      pages: [['games_dest_nav_drawer_home', 'games_ic_drawer_playnow'], ['games_dest_nav_drawer_my_games', 'games_ic_drawer_mygames'], ['games_dest_nav_drawer_inbox', 'games_ic_drawer_inbox'], ['games_dest_nav_drawer_players', 'games_ic_drawer_players'], ['games_dest_nav_drawer_recommended_games', 'games_ic_drawer_explore', 'shop']],
      footer: ['games_dest_nav_drawer_settings', 'games_dest_nav_drawer_help'], hint: 'games_menu_search', none: 'games_search_games_no_results', games: true,
      body: (c, t, page) => {
        const games = (c.data.play?.installed || []).filter(id => ['robot-rally', 'bean-bounce', 'word-garden', 'star-courier'].includes(id));
        if (page > 1 || !games.length) return `<div class="mmpm-empty edu"><img src="assets/pg-games_edu_mygames.png" alt=""></div>`;
        return `<div class="mmpm-games">${games.map(id => `<div class="mmpm-game"><b>${esc(c, id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' '))}</b></div>`).join('')}</div>`;
      }}
  };
  const GAMES = ['robot-rally', 'bean-bounce', 'word-garden', 'star-courier'];
  const gameName = id => id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
  function search(c, app, t, u) {
    const q = u.search.trim().toLowerCase();
    const found = app.games && q ? (c.data.play?.installed || []).filter(id => GAMES.includes(id) && gameName(id).toLowerCase().includes(q)) : [];
    const body = !q ? (app.before ? empty(c, '', '', t.t(app.before)) : '') : found.length ? `<div class="mmpm-games">${found.map(id => `<div class="mmpm-game"><b>${esc(c, gameName(id))}</b></div>`).join('')}</div>` : empty(c, '', t.t(app.none));
    return `<div class="mmpm"><div class="mmpm-bar" style="background:${app.color}"><div class="mmpm-plate"><button type="button" class="mmpm-btn" data-action="mmpm-sback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><input class="mmpm-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t(app.hint))}" autocomplete="off" spellcheck="false">${u.search ? `<button type="button" class="mmpm-btn" data-action="mmpm-sclear"><img src="assets/yt-ic_search_clear.png" alt=""></button>` : ''}</div></div><div class="mmpm-page">${body}</div></div>`;
  }
  function empty(c, img, title, sub = '') {
    return `<div class="mmpm-empty">${img ? `<img src="assets/${img}.png" alt="">` : ''}${title ? `<b>${esc(c, title)}</b>` : ''}${sub ? `<span>${esc(c, sub)}</span>` : ''}</div>`;
  }
  for (const [id, app] of Object.entries(APPS)) {
    const T = () => MM.text(app.table);
    const ui = c => (c.ui.playmedia ||= {})[id] || (c.ui.playmedia[id] = {page: 0, drawer: false});
    MM.register(id, {
      statusColor: () => app.status,
      render(c) {
        const t = T(), u = ui(c), A = n => `assets/${app.prefix}-${n}.png`;
        if (u.search != null) return search(c, app, t, u);
        const drawer = u.drawer ? `<div class="mmpm-scrim" data-action="mmpm-drawer"></div><div class="mmpm-drawer"><div class="mmpm-dhead" style="background:${app.color}"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
          ${app.pages.map(([key, ic, kind], i) => `<button type="button" class="mmpm-di${u.page === i ? ' on' : ''}" style="${u.page === i ? `color:${app.color}` : ''}" data-action="mmpm-page" data-i="${i}" data-kind="${kind || ''}"><img src="${A(u.page === i ? `${ic}_selected` : ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`).join('')}<i class="mmpm-div"></i>
          ${app.footer.map((k, i) => `<button type="button" class="mmpm-di text" data-action="mmpm-foot" data-i="${i}">${esc(c, t.t(k))}</button>`).join('')}</div>` : '';
        return `<div class="mmpm"><div class="mmpm-bar" style="background:${app.color}"><button type="button" class="mmpm-hb" data-action="mmpm-drawer"><i></i><i></i><i></i></button><span class="mmpm-title">${esc(c, t.t(app.pages[u.page][0]))}</span><button type="button" class="mmpm-btn" data-action="mmpm-search"><img src="assets/pm-ic_search_white.png" alt=""></button></div>
          <div class="mmpm-page">${app.body(c, t, u.page)}</div>${drawer}</div>`;
      },
      page: c => MM.page(id, ui(c).search != null && 'search'),
      mount(c, root) {
        const f = root.querySelector('.mmpm-sinput'); if (!f) return;
        f.addEventListener('input', () => { ui(c).search = f.value; const pos = f.selectionStart; c.render(); const g = c.el.viewport.querySelector('.mmpm-sinput'); g?.focus(); g?.setSelectionRange(pos, pos); });
        setTimeout(() => f.focus(), 30);
      },
      back(c) { const u = ui(c); if (u.search != null) { u.search = null; c.render(); return true; } if (u.drawer) { u.drawer = false; c.render(); return true; } if (u.page) { u.page = 0; c.render(); return true; } return false; },
      action(name, el, event, c) {
        const u = ui(c);
        if (name === 'mmpm-drawer') { u.drawer = !u.drawer; c.render(); return true; }
        if (name === 'mmpm-page') { u.drawer = false; if (el.dataset.kind === 'shop') { c.open('play-store'); return true; } u.page = +el.dataset.i; c.render(); return true; }
        if (name === 'mmpm-search') { u.search = ''; c.render(); return true; }
        if (name === 'mmpm-sback') { c.back(); return true; }
        if (name === 'mmpm-sclear') { u.search = ''; c.render(); return true; }
        if (name === 'mmpm-foot') {
          u.drawer = false; c.render();
          if (+el.dataset.i === 1) { c.open('help', id); return true; }
          if (app.prefs) MM.openPrefs(c, app.prefs[0], app.prefs[1], T().t(app.footer[0])); else c.open('gms-page', 'games');
          return true;
        }
        return false;
      }
    });
  }
})();
