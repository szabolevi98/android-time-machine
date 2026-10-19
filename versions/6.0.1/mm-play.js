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
     download_in_progress, then installing, then the notification_installation_success_message toast.
   - The quick links open the store's corpora (each in its colour: apps and games with the fictional apps, Movies & TV,
     Music, Books and Newsstand with the simulator's own fictional titles and their prices); MORE lists a cluster whole.
     A film, an album, a book or a magazine has Buy / Rent (buy, rent with the price): with no payment method on the
     account, it offers add_payment_method, which opens My account.
   - The drawer's rows: My wishlist (menu_my_wishlist: the bookmarked items, or my_wishlist_empty; a details page's
     overflow adds and removes, wishlist_add / wishlist_remove), People (the server's social page: no_results for the
     new account), My account (payment_methods with add_payment_method, the order history: no_order_history), Redeem
     (redeem_screen_title with gift_card_code_hint and redeem_gift_card_button; any code is invalid_entry), Settings
     (the app's settings XML) and Help & feedback. A search with no match says no_results_for_query.
   - An installed fictional app opens its own simple screen (the simulator's). */
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
  // The simulator's own fictional media for the other corpora (2016), with a price in the device's currency style.
  const MEDIA = {
    2: [['Northern Lights', 'Drama', '#37474f', '▶', 3.99], ['The Last Summit', 'Adventure', '#5d4037', '▶', 4.99], ['City of Glass', 'Thriller', '#283593', '▶', 3.99], ['Paper Kites', 'Family', '#00897b', '▶', 2.99], ['Midnight Diner', 'Comedy', '#6a1b9a', '▶', 3.99], ['Ocean Deep', 'Documentary', '#0277bd', '▶', 1.99]],
    3: [['Quiet Hours', 'The Lanterns', '#ef6c00', '♫', 9.99], ['Neon Rivers', 'Polar Cities', '#ad1457', '♫', 8.99], ['Wild Fields', 'Maple & Oak', '#558b2f', '♫', 7.99], ['Echo Park', 'Sunday Drive', '#4527a0', '♫', 9.49], ['Low Tide', 'Harbor Lights', '#00838f', '♫', 6.99], ['Ten Rooms', 'Static Bloom', '#c62828', '♫', 8.49]],
    4: [['The Lighthouse Keeper', 'A. M. Rowan', '#039be5', '❦', 7.99], ['Small Gardens', 'Lena Hart', '#43a047', '❦', 5.99], ['A Map of Rain', 'Owen Pike', '#5e35b1', '❦', 6.99], ['Winter Trains', 'Ida Brook', '#546e7a', '❦', 4.99], ['The Clockmaker', 'Sam Ellery', '#8d6e63', '❦', 8.99], ['Field Notes', 'June Ashby', '#00897b', '❦', 3.99]],
    5: [['Outdoor Life', 'Monthly', '#9c27b0', '✎', 2.99], ['Tech Today', 'Weekly', '#3949ab', '✎', 1.99], ['Kitchen Table', 'Monthly', '#f4511e', '✎', 2.49], ['Pocket Science', 'Monthly', '#00897b', '✎', 2.99], ['City Arts', 'Quarterly', '#6d4c41', '✎', 4.99], ['Travel Light', 'Monthly', '#0288d1', '✎', 2.99]]
  };
  for (const [k, list] of Object.entries(MEDIA)) list.forEach(([name, dev, color, glyph, price], i) => FICTION.push({id: `m${k}-${i}`, media: +k, name, dev, cat: dev, rating: 4.1 + (i % 5) / 10, size: '', dl: '', color, glyph, price, desc: '', news: ''}));
  const priceLabel = (c, it) => new Intl.NumberFormat(c.locale(), {style: 'currency', currency: 'USD'}).format(it.price);
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
    return `<button type="button" class="mmps-card" data-action="mmps-item" data-id="${it.id}"><span class="mmps-thumb">${icon(it)}</span><span class="mmps-ctitle">${esc(c, it.name)}</span><span class="mmps-csub">${esc(c, it.dev)}</span><span class="mmps-cfoot">${stars(it.rating)}<small>${esc(c, it.media ? priceLabel(c, it) : isInstalled(c, it) ? t.t('installed_list_state') : T().t('price_free'))}</small></span></button>`;
  }
  function cluster(c, title, sub, list, color = GREEN) {
    const ids = list.map(it => it.id).join(',');
    return `<div class="mmps-cluster"><div class="mmps-chead"><span><b>${esc(c, title)}</b>${sub ? `<small>${esc(c, sub)}</small>` : ''}</span><button type="button" class="mmps-more" style="background:${color}" data-action="mmps-moreclick" data-ids="${ids}" data-title="${esc(c, title)}">${esc(c, T().t('more'))}</button></div><div class="mmps-cards">${list.map(it => card(c, it)).join('')}</div></div>`;
  }
  // A corpus page: the store's corpus in its colour with its clusters.
  function corpus(c, i) {
    const t = T(), [key, col] = CORPORA[i], title = t.t(key);
    if (i === 0) { const apps = FICTION.filter(x => !x.game && !x.media); return cluster(c, t.t('cluster_recommended'), t.t('cluster_recommended_sub'), apps, col) + cluster(c, t.t('cluster_top_free'), '', [...apps].sort((a, b) => b.rating - a.rating), col); }
    if (i === 1) { const games = FICTION.filter(x => x.game); return cluster(c, t.t('cluster_games'), '', games, col) + cluster(c, t.t('cluster_top_free'), '', [...games].sort((a, b) => b.rating - a.rating), col); }
    const list = FICTION.filter(x => x.media === i);
    return cluster(c, title, '', list, col) + cluster(c, t.t('cluster_recommended'), '', [...list].reverse(), col);
  }
  const corpusOf = it => it.media || (it.game ? 1 : 0);
  const wish = c => st(c).wishlist || (st(c).wishlist = []);
  function drawerPage(c, page) {
    const t = T();
    if (page === 'wishlist') { const list = wish(c).map(id => item(c, id)).filter(Boolean); return list.length ? `<div class="mmps-cards wrap">${list.map(it => card(c, it)).join('')}</div>` : `<div class="mmps-empty">${esc(c, t.t('my_wishlist_empty'))}</div>`; }
    if (page === 'people') return `<div class="mmps-empty">${esc(c, t.t('no_results'))}</div>`;
    if (page === 'account') return `<div class="mmps-acard"><b>${esc(c, t.t('payment_methods'))}</b><button type="button" class="mmps-arow" data-action="mmps-addpay">${esc(c, t.t('add_payment_method'))}</button></div><div class="mmps-acard"><p>${esc(c, t.t('no_order_history'))}</p></div>`;
    return '';
  }
  function home(c) {
    const apps = FICTION.filter(x => !x.game && !x.media), games = FICTION.filter(x => x.game);
    const quick = `<div class="mmps-quick">${CORPORA.map(([n, col], i) => `<button type="button" class="mmps-ql" style="background:${col}" data-action="${i < 2 ? 'mmps-corpus' : 'mmps-othercorpus'}" data-i="${i}">${esc(c, T().t(n).toLocaleUpperCase(c.locale()))}</button>`).join('')}</div>`;
    return `${quick}${cluster(c, T().t('cluster_recommended'), T().t('cluster_recommended_sub'), apps.slice(0, 6))}${cluster(c, T().t('cluster_games'), '', games)}${cluster(c, T().t('cluster_top_free'), '', [...apps].sort((a, b) => b.rating - a.rating))}${cluster(c, T().t('cluster_google'), T().t('cluster_google_sub'), SYSTEM.map(id => item(c, id)).filter(Boolean).slice(0, 8))}`;
  }
  function details(c, it) {
    const t = T(), u = ui(c), installed = isInstalled(c, it), dl = u.dl?.id === it.id ? u.dl : null;
    const buttons = it.media ? `<div class="mmps-btns">${it.media === 2 ? `<button type="button" class="mmps-btn light" style="color:${CORPORA[2][1]}" data-action="mmps-buy" data-id="${it.id}">${esc(c, AndroidStrings.format(t.t('rent'), priceLabel(c, {price: it.price - 1})))}</button>` : ''}<button type="button" class="mmps-btn" style="background:${CORPORA[it.media][1]}" data-action="mmps-buy" data-id="${it.id}">${esc(c, AndroidStrings.format(t.t('buy'), priceLabel(c, it)))}</button></div>` : dl ? `<div class="mmps-dl"><div class="mmps-dlbar"><i style="width:${dl.p}%"></i></div><small>${esc(c, dl.p < 100 ? `${t.t('download_in_progress')} ${dl.p}%` : t.t('installing'))}</small></div>`
      : installed ? `<div class="mmps-btns">${it.system ? '' : `<button type="button" class="mmps-btn light" data-action="mmps-uninstall" data-id="${it.id}">${esc(c, t.t('uninstall'))}</button>`}<button type="button" class="mmps-btn" data-action="mmps-open" data-id="${it.id}">${esc(c, t.t('open'))}</button></div>`
      : `<div class="mmps-btns"><button type="button" class="mmps-btn" data-action="mmps-install" data-id="${it.id}">${esc(c, t.t('install'))}</button></div>`;
    const shots = it.icon ? '' : `<div class="mmps-shots">${[1, 2, 3].map(k => `<span class="mmps-shot" style="background:linear-gradient(160deg,${it.color},#fff 140%)">${icon(it, 'big')}</span>`).join('')}</div>`;
    const desc = it.desc ? `<div class="mmps-sec"><p class="mmps-desc${u.more ? ' open' : ''}">${esc(c, it.desc)}</p><button type="button" class="mmps-readmore" data-action="mmps-readmore">${esc(c, t.t('read_more'))}</button></div>` : '';
    const hist = [70, 18, 6, 3, 3];
    const reviews = `<div class="mmps-sec"><h3>${esc(c, t.t('details_reviews'))}</h3><div class="mmps-hist"><div class="mmps-avg"><b>${it.rating.toFixed(1)}</b>${stars(it.rating)}<small>${(12873 + it.name.length * 911).toLocaleString(lang(c))}</small></div><div class="mmps-bars">${hist.map((v, i) => `<div><span>${5 - i}</span><i style="width:${v}%"></i></div>`).join('')}</div></div>
      ${REVIEWS.map(([who, s, text]) => `<div class="mmps-rev"><span class="mmpp-tile round mmps-rava" style="background:${MM.people.COLORS[who.length % 14]}"><b>${who[0]}</b></span><div><b>${esc(c, who)}</b>${stars(s)}<p>${esc(c, text)}</p></div></div>`).join('')}</div>`;
    return `<div class="mmps-hero" style="background:${it.color}"></div><div class="mmps-title">${icon(it, 'mid')}<div class="mmps-tinfo"><h1>${esc(c, it.name)}</h1><span class="mmps-creator">${esc(c, it.dev)}</span><span class="mmps-meta">${esc(c, it.size)}</span></div></div>${buttons}
      ${it.media ? '' : `<div class="mmps-badges"><span><b>${esc(c, it.dl.replace(/,000,000,000\+/, ' B').replace(/,000,000\+/, ' M').replace(/,000\+/, ' K'))}</b><small>${esc(c, t.t('app_downloads'))}</small></span><span><b>${it.rating.toFixed(1)} ★</b><small>${(12873 + it.name.length * 911).toLocaleString(lang(c))}</small></span><span><b>◆</b><small>${esc(c, it.cat)}</small></span></div>`}
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
    const found = all.filter(it => `${it.name} ${it.dev} ${it.cat}`.toLowerCase().includes(q));
    return found.length ? `<div class="mmps-cards wrap">${found.map(it => card(c, it)).join('')}</div>` : `<div class="mmps-empty">${esc(c, AndroidStrings.format(T().t('no_results_for_query'), ui(c).search.trim()))}</div>`;
  }
  // The Play Store widget's flipper (MarketWidgetProvider, the Apps corpus): the store's apps, each opening its page.
  MM.playWidgetItems = () => FICTION.filter(it => !it.media).map(it => ({id: it.id, name: it.name, dev: it.dev, icon: icon(it, 'mmwg-ps-ic')}));
  function render(c) {
    if ((c.ui.sub || '').startsWith('details:')) { const u0 = ui(c); u0.history = u0.history || []; u0.history.push({page: u0.page, item: u0.item}); u0.page = 'details'; u0.item = c.ui.sub.slice(8); u0.search = null; u0.drawer = false; c.ui.sub = ''; }
    const t = T(), u = ui(c), it = u.page === 'details' ? item(c, u.item) : null;
    const searching = u.search !== null;
    const corp = u.page === 'corpus' ? +u.item : it ? corpusOf(it) : 0;
    const titles = {myapps: t.t('my_downloads_menu'), wishlist: t.t('menu_my_wishlist'), people: t.t('side_drawer_social_home'), account: t.t('side_drawer_my_account'), corpus: u.page === 'corpus' ? (x => x.charAt(0) + x.slice(1).toLocaleLowerCase(c.locale()))(t.t(CORPORA[corp][0])) : '', list: u.listTitle || ''};
    const bar = searching
      ? `<div class="mmps-bar search"><button type="button" class="mmps-hb" data-action="mmps-sback"><img src="assets/gm-ic_arrow_back_24dp.png" alt=""></button><input class="mmps-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off"><img class="mmps-mic" src="${A('ic_mic_dark')}" alt=""></div>`
      : `<div class="mmps-bar${u.page === 'details' ? ' over' : ''}" style="background:${u.page === 'details' ? 'transparent' : CORPORA[u.page === 'corpus' ? +u.item : 0][1]}">${['details', 'corpus', 'list'].includes(u.page) ? `<button type="button" class="mmps-hb" data-action="mmps-back"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button>` : `<button type="button" class="mmps-hb" data-action="mmps-drawer"><i></i><i></i><i></i></button>`}<span class="mmps-btitle">${esc(c, titles[u.page] ?? (u.page === 'details' ? '' : t.t('app_name')))}</span><button type="button" class="mmps-hb" data-action="mmps-search"><img src="${A('ic_search_white')}" alt=""></button>${u.page === 'details' ? '<button type="button" class="mmps-hb" data-action="mmps-dmenu"><img src="assets/fw-ic_menu_moreoverflow_material.svg" alt=""></button>' : ''}</div>`;
    const body = searching ? searchPage(c) : it ? details(c, it) : u.page === 'myapps' ? myApps(c) : u.page === 'corpus' ? corpus(c, corp) : u.page === 'list' ? `<div class="mmps-cards wrap">${u.item.split(',').map(id => item(c, id)).filter(Boolean).map(x => card(c, x)).join('')}</div>` : ['wishlist', 'people', 'account'].includes(u.page) ? drawerPage(c, u.page) : home(c);
    const row = (ic, key, action, on) => `<button type="button" class="mmps-di${on ? ' on' : ''}" data-action="${action}"><img src="${A(on ? `${ic}_selected` : ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`;
    const drawer = u.drawer ? `<div class="mmps-scrim" data-action="mmps-drawer"></div><div class="mmps-drawer"><div class="mmps-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${row('ic_drawer_home', 'menu_home', 'mmps-home', u.page === 'home')}${row('ic_drawer_myapps', 'my_downloads_menu', 'mmps-myapps', u.page === 'myapps')}<i class="mmps-ddiv"></i>
      ${['ic_drawer_wishlist:menu_my_wishlist:wishlist', 'ic_drawer_people:side_drawer_social_home:people', 'ic_drawer_myaccount:side_drawer_my_account:account', 'ic_drawer_redeem:redeem_gift_card_menu:redeem', 'ic_drawer_settings:settings:settings'].map(x => { const [ic, key, k] = x.split(':'); return `<button type="button" class="mmps-di${u.page === k ? ' on' : ''}" data-action="mmps-dpage" data-k="${k}"><img src="${A(u.page === k ? `${ic}_selected` : ic)}" alt=""><span>${esc(c, t.t(key))}</span></button>`; }).join('')}
      <i class="mmps-ddiv"></i><button type="button" class="mmps-di sec" data-action="mmps-dpage" data-k="help"><span>${esc(c, t.t('help_and_feedback'))}</span></button></div>` : '';
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
  /* An installed fictional app (the simulator's own): its colour, its mark and its line, nothing more. */
  MM.register('fiction-app', {
    statusColor: c => item(c, c.ui.sub)?.color || '#000',
    render(c) { const it = item(c, c.ui.sub); if (!it) return ''; return `<div class="mmps-fapp" style="--fc:${it.color}"><div class="mmps-fbar">${esc(c, it.name)}</div><div class="mmps-fbody">${icon(it, 'big')}<p>${esc(c, it.desc)}</p></div></div>`; }
  });
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
        case 'mmps-open': { const id = el.dataset.id; if (MM.appsData?.[id]) c.open(id); else c.open('fiction-app', id); return true; }
        case 'mmps-corpus': case 'mmps-othercorpus': go('corpus', el.dataset.i); return true;
        case 'mmps-moreclick': u.listTitle = el.dataset.title; go('list', el.dataset.ids); return true;
        case 'mmps-dpage': {
          const k = el.dataset.k; u.drawer = false;
          if (k === 'settings') { c.render(); MM.openPrefs(c, 'play', 'settings', t.t('settings')); return true; }
          if (k === 'help') { c.render(); c.open('help', 'play-store'); return true; }
          if (k === 'redeem') {
            c.render();
            c.dialog({title: t.t('redeem_screen_title'), html: `<div class="mmpf-edit"><input type="text" class="mmps-code" placeholder="${esc(c, t.t('gift_card_code_hint'))}" autocomplete="off"></div>`,
              buttons: [{label: MM.text('framework').t('cancel')}, {label: t.t('redeem_gift_card_button'), action: c => { if (c.el.overlay.querySelector('.mmps-code')?.value.trim()) c.toast(t.t('invalid_entry')); }}]});
            setTimeout(() => c.el.overlay.querySelector('.mmps-code')?.focus(), 50);
            return true;
          }
          u.history = []; u.page = k; u.item = ''; c.render(); return true;
        }
        case 'mmps-buy': c.dialog({title: item(c, el.dataset.id)?.name, items: [{html: `<span class="mmps-payrow">${esc(c, t.t('add_payment_method'))}</span>`}], onItem: () => go('account')}); return true;
        case 'mmps-addpay': c.open('android-pay', 'add-card'); return true;
        case 'mmps-dmenu': {
          const id = u.item, on = wish(c).includes(id);
          c.menu([{label: t.t(on ? 'wishlist_remove' : 'wishlist_add'), action: c => { st(c).wishlist = on ? wish(c).filter(x => x !== id) : [...wish(c), id]; c.save(); }}]);
          return true;
        }
      }
      return false;
    }
  });
})();
