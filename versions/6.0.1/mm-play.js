/* Android 6.0.1 Play Store (Google Play Store 5.12.7, priv-app/Phonesky of MTC20K), the app 'play-store', on the demo
   account. The storefront — cluster titles, the fictional apps, their art and reviews — is the simulator's own (on the
   device it came from the server); the Google apps of the image are listed as installed with their own icons.
   - FinskyTheme on play_main_background #eeeeee; the 56 dp toolbar in the corpus colour (home and apps play_apps_primary
     #689f38, the status bar status_bar_apps #558b2f) with ActionBarDrawerToggle's bars, "Google Play" and ic_search_white.
   - FinskyDrawerLayout (getHomePrimaryAction without the v2 experiment): Store home, My apps, then My wishlist, People,
     My account, Redeem, Settings and Help & Feedback; the play_drawer profile header with the account; the current row
     bold on #eeeeee with its _selected icon, play_multi_secondary #455a64.
   - Home: quick_links_row.xml's corpus links (48 dp PlayCardViewGroup chips, 13 sp bold white caps in the corpus
     colours), play_card_cluster_header.xml (48 dp, 12 dp padding: the 18 sp title, the 16 sp #616161 subtitle, MORE in
     12 sp bold on the corpus colour) over PlayCardViewSmall cards (#fafafa, 2 dp corners, 2 dp elevation, 4 dp inset:
     the thumbnail with 10 dp padding, the two-line title, the subtitle, the stars and the price label).
   - Details: the hero band, title_module.xml (PlayDetailTitle, the creator in Play_DetailsPage_Subtitle, the rating and
     size line, INSTALL / OPEN / UNINSTALL in the corpus colour, the download progress), discovery_bar.xml's badges
     (downloads, rating, category, similar; 16 dp above and below), the description with READ MORE, screenshots, the
     reviews summary and What's new.
   - My apps (play_card_myapps.xml: 96 dp listing cards) with the installed section; installing shows
     download_in_progress, then installing, then the notification_installation_success_message toast. */
(() => {
  'use strict';
  const T = () => MM.text('play');
  const A = n => `assets/ps-${n}.png`;
  const GREEN = '#689f38', GREEN_DARK = '#558b2f';
  // The quick links of the store home: the apps link is server content (our own text), the others the corpora's titles.
  const CORPORA = [['quick_apps', '#689f38'], ['games_corpus_title', '#689f38'], ['corpus_title_movies', '#ed3b3b'], ['corpus_title_music', '#ef6c00'], ['corpus_title_books', '#039be5'], ['corpus_title_newsstand', '#9c27b0']];
  // The simulator's own fictional apps (2016).
  const FICTION = [
    {id: 'trail-notes', name: 'Trail Notes', dev: 'Northbound Labs', cat: 'Travel & Local', rating: 4.6, size: '8.4 MB', dl: '500,000+', color: '#2e7d32', glyph: '▲', desc: 'Keep a journal of every hike: routes, photos and notes that work offline.', news: 'Elevation charts for your saved routes.'},
    {id: 'pocket-budget', name: 'Pocket Budget', dev: 'Tidy Coin', cat: 'Finance', rating: 4.4, size: '5.1 MB', dl: '1,000,000+', color: '#00897b', glyph: '¤', desc: 'See where your money goes with simple categories and monthly goals.', news: 'Dark theme and a new widget.'},
    {id: 'snap-filters', name: 'Snap Filters', dev: 'Lumen Apps', cat: 'Photography', rating: 4.3, size: '14 MB', dl: '5,000,000+', color: '#8e24aa', glyph: '◐', desc: 'Give your photos a look in one tap, then fine-tune light and colour.', news: 'Twelve new film looks.'},
    {id: 'daily-weather', name: 'Daily Weather', dev: 'Clear Sky Co.', cat: 'Weather', rating: 4.5, size: '6.2 MB', dl: '10,000,000+', color: '#1e88e5', glyph: '☀', desc: 'Hourly forecasts, radar and gentle alerts before the rain arrives.', news: 'Faster radar maps.'},
    {id: 'recipe-box', name: 'Recipe Box', dev: 'Kitchen Table', cat: 'Food & Drink', rating: 4.7, size: '11 MB', dl: '1,000,000+', color: '#f4511e', glyph: '✿', desc: 'Save recipes from anywhere and cook step by step with your hands free.', news: 'Shopping lists you can share.'},
    {id: 'focus-timer', name: 'Focus Timer', dev: 'Calm Desk', cat: 'Productivity', rating: 4.6, size: '3.0 MB', dl: '500,000+', color: '#e53935', glyph: '◷', desc: 'Work in short focused sessions with breaks in between.', news: 'Statistics for the week.'},
    {id: 'city-transit', name: 'City Transit', dev: 'Metro Minds', cat: 'Maps & Navigation', rating: 4.2, size: '9.8 MB', dl: '1,000,000+', color: '#3949ab', glyph: '⇄', desc: 'Departures, routes and service updates for buses and trains near you.', news: 'Live arrivals for more cities.'},
    {id: 'podcast-corner', name: 'Podcast Corner', dev: 'Quiet Room', cat: 'Music & Audio', rating: 4.5, size: '7.7 MB', dl: '1,000,000+', color: '#6d4c41', glyph: '♪', desc: 'Subscribe, download and listen to your favourite shows.', news: 'Sleep timer and playback speed.'},
    {id: 'robot-rally', name: 'Robot Rally', dev: 'Tin Gear Games', cat: 'Racing', game: true, rating: 4.4, size: '48 MB', dl: '5,000,000+', color: '#ff8f00', glyph: '⚙', desc: 'Race tiny robots across rooftops, deserts and the moon.', news: 'Two new tracks.'},
    {id: 'bean-bounce', name: 'Bean Bounce', dev: 'Jelly Jar', cat: 'Arcade', game: true, rating: 4.6, size: '22 MB', dl: '10,000,000+', color: '#7cb342', glyph: '●', desc: 'Bounce from cloud to cloud and collect every bean.', news: 'Winter levels.'},
    {id: 'word-garden', name: 'Word Garden', dev: 'Leaf & Letter', cat: 'Word', game: true, rating: 4.7, size: '18 MB', dl: '1,000,000+', color: '#43a047', glyph: 'W', desc: 'Grow a garden by finding words in the letters.', news: 'Daily puzzles.'},
    {id: 'star-courier', name: 'Star Courier', dev: 'Far Orbit', cat: 'Adventure', game: true, rating: 4.3, size: '65 MB', dl: '1,000,000+', color: '#283593', glyph: '✦', desc: 'Deliver parcels between planets and meet their curious inhabitants.', news: 'Chapter 3 is here.'}
  ];
  const REVIEWS = [['Joseph', 5, 'Exactly what I was looking for. Works great on my Nexus 5X.'], ['Maria', 4, 'Simple and pretty. Does what it says.'], ['James', 4, 'Faster than the last version.']];
  const SYSTEM = ['gmail', 'chrome', 'maps', 'youtube', 'photos', 'hangouts', 'drive', 'play-music', 'play-movies', 'play-games', 'calendar', 'camera'];
  const st = c => c.data.play || (c.data.play = {installed: []});
  const ui = c => c.ui.play || (c.ui.play = {page: 'home', item: '', drawer: false, search: null, more: false, history: []});
  const esc = (c, s) => c.safe(s);
  const lang = c => c.locale();
  function item(c, id) {
    const f = FICTION.find(x => x.id === id); if (f) return f;
    const a = MM.appsData?.[id]; if (!a) return null;
    return {id, name: MM.appLabel(c, id), dev: 'Google Inc.', cat: 'Communication', rating: 4.3, size: `${(a.codeSize / 1048576).toFixed(1)} MB`, dl: '1,000,000,000+', color: a.color || '#757575', icon: a.icon, system: true, version: a.version, desc: '', news: ''};
  }
  const icon = (it, cls = '') => it.icon ? `<img class="mmps-ic ${cls}" src="${it.icon}" alt="">` : `<span class="mmps-ic mmps-gl ${cls}" style="background:${it.color}"><b>${it.glyph}</b></span>`;
  const stars = r => `<span class="mmps-stars" style="--r:${(r / 5 * 100).toFixed(0)}%">★★★★★</span>`;
  const isInstalled = (c, it) => it.system || st(c).installed.includes(it.id);
  function card(c, it) {
    const t = T();
    return `<button type="button" class="mmps-card" data-action="mmps-item" data-id="${it.id}"><span class="mmps-thumb">${icon(it)}</span><span class="mmps-ctitle">${esc(c, it.name)}</span><span class="mmps-csub">${esc(c, it.dev)}</span><span class="mmps-cfoot">${stars(it.rating)}<small>${esc(c, isInstalled(c, it) ? t.t('installed_list_state') : T().t('price_free'))}</small></span></button>`;
  }
  function cluster(c, title, sub, list) {
    return `<div class="mmps-cluster"><div class="mmps-chead"><span><b>${esc(c, title)}</b>${sub ? `<small>${esc(c, sub)}</small>` : ''}</span><button type="button" class="mmps-more" data-action="mmps-moreclick">${esc(c, T().t('more'))}</button></div><div class="mmps-cards">${list.map(it => card(c, it)).join('')}</div></div>`;
  }
  function home(c) {
    const apps = FICTION.filter(x => !x.game), games = FICTION.filter(x => x.game);
    const quick = `<div class="mmps-quick">${CORPORA.map(([n, col], i) => `<button type="button" class="mmps-ql" style="background:${col}" data-action="${i < 2 ? 'mmps-corpus' : 'mmps-othercorpus'}" data-i="${i}">${esc(c, T().t(n).toLocaleUpperCase(c.locale()))}</button>`).join('')}</div>`;
    return `${quick}${cluster(c, T().t('cluster_recommended'), T().t('cluster_recommended_sub'), apps.slice(0, 6))}${cluster(c, T().t('cluster_games'), '', games)}${cluster(c, T().t('cluster_top_free'), '', [...apps].sort((a, b) => b.rating - a.rating))}${cluster(c, T().t('cluster_google'), T().t('cluster_google_sub'), SYSTEM.map(id => item(c, id)).filter(Boolean).slice(0, 8))}`;
  }
  function details(c, it) {
    const t = T(), u = ui(c), installed = isInstalled(c, it), dl = u.dl?.id === it.id ? u.dl : null;
    const buttons = dl ? `<div class="mmps-dl"><div class="mmps-dlbar"><i style="width:${dl.p}%"></i></div><small>${esc(c, dl.p < 100 ? `${t.t('download_in_progress')} ${dl.p}%` : t.t('installing'))}</small></div>`
      : installed ? `<div class="mmps-btns">${it.system ? '' : `<button type="button" class="mmps-btn light" data-action="mmps-uninstall" data-id="${it.id}">${esc(c, t.t('uninstall'))}</button>`}<button type="button" class="mmps-btn" data-action="mmps-open" data-id="${it.id}">${esc(c, t.t('open'))}</button></div>`
      : `<div class="mmps-btns"><button type="button" class="mmps-btn" data-action="mmps-install" data-id="${it.id}">${esc(c, t.t('install'))}</button></div>`;
    const shots = it.icon ? '' : `<div class="mmps-shots">${[1, 2, 3].map(k => `<span class="mmps-shot" style="background:linear-gradient(160deg,${it.color},#fff 140%)">${icon(it, 'big')}</span>`).join('')}</div>`;
    const desc = it.desc ? `<div class="mmps-sec"><p class="mmps-desc${u.more ? ' open' : ''}">${esc(c, it.desc)}</p><button type="button" class="mmps-readmore" data-action="mmps-readmore">${esc(c, t.t('read_more'))}</button></div>` : '';
    const hist = [70, 18, 6, 3, 3];
    const reviews = `<div class="mmps-sec"><h3>${esc(c, t.t('details_reviews'))}</h3><div class="mmps-hist"><div class="mmps-avg"><b>${it.rating.toFixed(1)}</b>${stars(it.rating)}<small>${(12873 + it.name.length * 911).toLocaleString(lang(c))}</small></div><div class="mmps-bars">${hist.map((v, i) => `<div><span>${5 - i}</span><i style="width:${v}%"></i></div>`).join('')}</div></div>
      ${REVIEWS.map(([who, s, text]) => `<div class="mmps-rev"><span class="mmpp-tile round mmps-rava" style="background:${MM.people.COLORS[who.length % 14]}"><b>${who[0]}</b></span><div><b>${esc(c, who)}</b>${stars(s)}<p>${esc(c, text)}</p></div></div>`).join('')}</div>`;
    return `<div class="mmps-hero" style="background:${it.color}"></div><div class="mmps-title">${icon(it, 'mid')}<div class="mmps-tinfo"><h1>${esc(c, it.name)}</h1><span class="mmps-creator">${esc(c, it.dev)}</span><span class="mmps-meta">${esc(c, it.size)}</span></div></div>${buttons}
      <div class="mmps-badges"><span><b>${esc(c, it.dl.replace(/,000,000,000\+/, ' B').replace(/,000,000\+/, ' M').replace(/,000\+/, ' K'))}</b><small>${esc(c, t.t('app_downloads'))}</small></span><span><b>${it.rating.toFixed(1)} ★</b><small>${(12873 + it.name.length * 911).toLocaleString(lang(c))}</small></span><span><b>◆</b><small>${esc(c, it.cat)}</small></span></div>
      ${desc}${shots}${reviews}${it.news ? `<div class="mmps-sec"><h3>What's new</h3><p>${esc(c, it.news)}</p></div>` : ''}`;
  }
  function myApps(c) {
    const t = T(), list = [...st(c).installed.map(id => item(c, id)), ...SYSTEM.map(id => item(c, id))].filter(Boolean);
    return `<div class="mmps-mysec">${esc(c, t.t('my_apps_tab_installed'))}</div>${list.map(it => `<button type="button" class="mmps-row" data-action="mmps-item" data-id="${it.id}">${icon(it, 'row')}<span><b>${esc(c, it.name)}</b><small>${esc(c, it.dev)}</small><small>${esc(c, t.t('installed_list_state'))}</small></span></button>`).join('')}`;
  }
  function searchPage(c) {
    const q = (ui(c).search || '').trim().toLowerCase();
    if (!q) return '';
    const all = [...FICTION, ...SYSTEM.map(id => item(c, id)).filter(Boolean)];
    return `<div class="mmps-cards wrap">${all.filter(it => `${it.name} ${it.dev} ${it.cat}`.toLowerCase().includes(q)).map(it => card(c, it)).join('')}</div>`;
  }
  // The Play Store widget's flipper (MarketWidgetProvider, the Apps corpus): the store's apps, each opening its page.
  MM.playWidgetItems = () => FICTION.map(it => ({id: it.id, name: it.name, dev: it.dev, icon: icon(it, 'mmwg-ps-ic')}));
  function render(c) {
    if ((c.ui.sub || '').startsWith('details:')) { const u0 = ui(c); u0.history = u0.history || []; u0.history.push({page: u0.page, item: u0.item}); u0.page = 'details'; u0.item = c.ui.sub.slice(8); u0.search = null; u0.drawer = false; c.ui.sub = ''; }
    const t = T(), u = ui(c), it = u.page === 'details' ? item(c, u.item) : null;
    const searching = u.search !== null;
    const bar = searching
      ? `<div class="mmps-bar search"><button type="button" class="mmps-hb" data-action="mmps-sback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><input class="mmps-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off"><img class="mmps-mic" src="${A('ic_mic_dark')}" alt=""></div>`
      : `<div class="mmps-bar${u.page === 'details' ? ' over' : ''}" style="background:${u.page === 'details' ? 'transparent' : GREEN}">${u.page === 'details' ? `<button type="button" class="mmps-hb" data-action="mmps-back"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button>` : `<button type="button" class="mmps-hb" data-action="mmps-drawer"><i></i><i></i><i></i></button>`}<span class="mmps-btitle">${esc(c, u.page === 'myapps' ? t.t('my_downloads_menu') : u.page === 'details' ? '' : t.t('app_name'))}</span><button type="button" class="mmps-hb" data-action="mmps-search"><img src="${A('ic_search_white')}" alt=""></button></div>`;
    const body = searching ? searchPage(c) : it ? details(c, it) : u.page === 'myapps' ? myApps(c) : home(c);
    const row = (ic, key, action, on) => `<button type="button" class="mmps-di${on ? ' on' : ''}" data-action="${action}"><img src="${A(on ? `${ic}_selected` : ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    const drawer = u.drawer ? `<div class="mmps-scrim" data-action="mmps-drawer"></div><div class="mmps-drawer"><div class="mmps-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${row('ic_drawer_home', 'menu_home', 'mmps-home', u.page === 'home')}${row('ic_drawer_myapps', 'my_downloads_menu', 'mmps-myapps', u.page === 'myapps')}<i class="mmps-ddiv"></i>
      ${['ic_drawer_wishlist:menu_my_wishlist', 'ic_drawer_people:side_drawer_social_home', 'ic_drawer_myaccount:side_drawer_my_account', 'ic_drawer_redeem:redeem_gift_card_menu', 'ic_drawer_settings:settings'].map(x => { const [ic, key] = x.split(':'); return `<button type="button" class="mmps-di" data-action="mmps-missing" data-k="${key}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`; }).join('')}
      <i class="mmps-ddiv"></i><button type="button" class="mmps-di sec" data-action="mmps-missing" data-k="help_and_feedback"><span>${esc(c, t.t('help_and_feedback'))}</span></button></div>` : '';
    return `<div class="mmps">${bar}<div class="mmps-page">${body}</div>${drawer}</div>`;
  }
  function install(c, id) {
    const u = ui(c); u.dl = {id, p: 0}; c.render();
    const step = () => {
      if (!u.dl || u.dl.id !== id) return;
      u.dl.p = Math.min(100, u.dl.p + 9 + Math.floor(Math.random() * 12));
      if (u.dl.p >= 100) { setTimeout(() => { u.dl = null; st(c).installed.push(id); c.save(); MM.notify ? MM.notify(c, {app: 'play-store', icon: 'assets/ps-stat_notify_installed.png', title: item(c, id)?.name || id, text: T().t('notification_installation_success_message'), open: ['play-store', ''], heads: false}) : c.toast(T().t('notification_installation_success_message'), false); if (c.ui.view === 'play-store') c.render(); }, 900); }
      else setTimeout(step, 250);
      if (c.ui.view === 'play-store') c.render();
    };
    setTimeout(step, 300);
  }
  MM.register('play-store', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => { const u = c.ui.play; return u ? MM.page('play', ...u.history.map(h => `${h.page}:${h.item}`), `${u.page}:${u.item}`) : 'play'; },
    statusColor: c => ui(c).search !== null ? '#757575' : GREEN_DARK,
    render,
    mount(c, root) {
      const input = root.querySelector('.mmps-sinput');
      if (input) { input.addEventListener('input', () => { ui(c).search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.mmps-sinput'); i2?.focus(); i2?.setSelectionRange(pos, pos); }); if (document.activeElement !== input) input.focus(); }
    },
    back(c) {
      const u = ui(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      if (u.history.length) { Object.assign(u, u.history.pop()); u.more = false; c.render(); return true; }
      if (u.page !== 'home') { u.page = 'home'; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      const go = (page, itemId = '') => { u.history.push({page: u.page, item: u.item}); u.page = page; u.item = itemId; u.more = false; u.search = null; u.drawer = false; c.render(); c.el.viewport.querySelector('.mmps-page')?.scrollTo(0, 0); };
      switch (name) {
        case 'mmps-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmps-home': u.history = []; u.page = 'home'; u.drawer = false; c.render(); return true;
        case 'mmps-myapps': go('myapps'); return true;
        case 'mmps-item': go('details', el.dataset.id); return true;
        case 'mmps-back': this.back(c); return true;
        case 'mmps-search': u.search = ''; c.render(); return true;
        case 'mmps-sback': u.search = null; c.render(); return true;
        case 'mmps-readmore': u.more = !u.more; c.render(); return true;
        case 'mmps-install': install(c, el.dataset.id); return true;
        case 'mmps-uninstall': c.dialog({message: t.t('uninstall_app_msg'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { st(c).installed = st(c).installed.filter(x => x !== el.dataset.id); c.save(); c.render(); }}]}); return true;
        case 'mmps-open': { const id = el.dataset.id; if (MM.appsData?.[id]) c.open(id); else c.open(`missing-${id}`); return true; }
        case 'mmps-corpus': case 'mmps-moreclick': return true;
        case 'mmps-othercorpus': c.open(['play-movies', 'play-music', 'missing-play-books', 'missing-play-newsstand'][+el.dataset.i - 2]); return true;
        case 'mmps-missing': u.drawer = false; c.open(`missing-play-${el.dataset.k}`); return true;
      }
      return false;
    }
  });
})();
