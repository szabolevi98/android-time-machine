/* Google Play Store 3.4.7 (com.android.vending), the Phonesky.apk of the Galaxy Nexus's IMM76I image, rebuilt from that
   APK on the structure of the earlier 3.x rebuild (which followed 3.5 / 3.8 captures): texts in five languages from its
   resources (docs/tools/apk-strings.py), drawables from its hdpi set (assets/ps347-*), colours and sizes from its values and
   layouts, menus and settings from res/menu and res/layout/settings.xml.
   - LegacyActionBar on #3D3D3D (title_background) with ic_ab_back, the Play icon, 18 sp white title,
     ic_menu_market_search; the overflow (MainActivity: consumption, actions, base): My apps, Accounts, Settings, Help.
   - corpora_home: the promo, the corpus cells (corpus_cell: the 21 dp corpus strip, the 20 sp bold white name, the
     ic_market_home_nav_* watermark of CorpusResourceUtils.getCorpusWatermarkIconBig, "see more" with
     ic_more_arrow_righthome) for the TOC's Apps, Music, Movies and Books, the Games tile and the featured column.
   - tabbed_browse_lists: the 35 dp PagerTitleStrip on market_tab_bg in the corpus foreground colour.
   - Details (details_section_order_*): details_summary_apps (#3D3D3D, the 48 dp thumbnail, 22 sp bold title, 16 sp
     #999999 creator, the Buy / price button, the Install / Open / Uninstall row), screenshots, the byline (stars and
     count | Updated on, downloads | Size), +1 (ic_plusone_tall_*, "You +1'd this."), Description, What's new, Reviews
     (HistogramView: "Average" on #404040, "5 stars" … "1 star") and the owned panel (Allow automatic updating).
     3.4.7 has no review sorting or filters yet.
   - The purchase page (purchase: "Permissions", the framework's permission groups, "Accept & download"), My apps
     (my_downloads: one list under my_downloads_section_header "Installed" / "Not installed") and the settings.
   The catalog, promos and list names are the simulator's own storefront (on the device they came from the server). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({"Google Play": "app_name", "My apps": "my_downloads_menu", "Accounts": "menu_switch_accounts", "Settings": "settings", "Help": "help_and_info", "Search Google Play": "search_hint", "Installed": "installed_list_state", "Up to date": "installed_section", "Not installed": "installs_available_section", "Open": "open", "Uninstall": "uninstall", "Install": "install", "Buy": "buy", "Accept & download": "accept_download", "Downloading…": "downloading_section", "Installing…": "installing", "Starting download…": "download_pending", "Cancel": "cancel", "OK": "ok", "DESCRIPTION": "details_description", "What's new": "details_whats_new", "REVIEWS": "details_reviews", "Average": "average_rating", "5 stars": "five_star", "4 stars": "four_star", "3 stars": "three_star", "2 stars": "two_star", "1 star": "one_star", "See all": "see_all", "see more": "corpus_see_more", "%s downloads": "downloads_count", "Size: %1$s": "size", "Updated on %1$s": "updated_on", "Allow automatic updating": "info_allow_auto_updates", "Permissions": "permissions_title", "This app requires no special permissions to run.": "no_dangerous_permissions", "No results": "no_results", "General": "settings_general_section_header", "Notifications": "notifications", "Notifications summary": "notification_description", "Auto-update apps": "auto_update_by_default_label", "Auto-update summary": "auto_update_by_default_description", "Update over Wi-Fi only": "auto_update_over_wifi_only_label", "Wi-Fi summary": "auto_update_over_wifi_only_description", "Auto-add widgets": "auto_add_shortcuts_label", "Widgets summary": "auto_add_shortcuts_description", "Clear search history": "clear_history_title", "Clear search history summary": "clear_history_summary", "User controls": "settings_user_controls_section_header", "Unlock settings": "unlock_settings_label", "Type your PIN": "pin_entry_title", "Remove PIN": "pin_entry_remove_label", "Type a new PIN or remove existing PIN:": "pin_entry_prompt_edit", "Create a PIN to control and lock settings:": "pin_entry_prompt_create", "Re-type to confirm your new PIN:": "pin_entry_prompt_confirm", "Type your PIN to change settings:": "pin_entry_prompt_settings", "Type PIN": "pin_entry_hint_enter_passcode", "Incorrect PIN": "pin_entry_hint_wrong_passcode", "Allow apps rated for": "content_filter_title", "Everyone": "content_filter_everyone", "Low maturity": "content_filter_low_maturity", "Medium maturity": "content_filter_medium_maturity", "High maturity": "content_filter_high_maturity", "Show all apps": "content_filter_show_all_apps", "Content filtering": "content_filtering_label", "Content filtering summary": "content_filtering_description", "Use PIN for purchases": "purchase_lock_label", "Use PIN summary": "purchase_lock_description", "Set or change PIN": "change_passcode_label", "Set PIN summary": "change_passcode_summary", "Other": "settings_other_section_header", "Google AdMob Ads": "settings_ad_prefs_title", "AdMob summary": "settings_ad_prefs_user_selection", "AdMob info": "settings_ad_prefs_summary", "About": "settings_about_header", "Open source licenses": "os_licenses_label", "Licenses summary": "os_licenses_summary", "Build version": "settings_build_version", "Version": "market_version", "Successfully installed.": "notification_installation_success_message", "You +1'd this.": "plus_one_you", "Uninstall app": "uninstall_app_title", "Do you want to uninstall this app?": "uninstall_app_msg", "Network communication": "framework:permgrouplab_network", "full Internet access": "framework:permlab_createNetworkSockets", "Hardware controls": "framework:permgrouplab_hardwareControls", "control vibrator": "framework:permlab_vibrate", "Storage": "framework:permgrouplab_storage", "modify/delete USB storage contents": "framework:permlab_sdcardWrite"});
  // The storefront itself (corpus and list names, prices, promo lines) came from Google's servers; these are the
  // simulator's own, and "Unavailable" is the simulator's note for what it does not do.
  const OWN = {
    'Apps': {own: true, hu: 'Alkalmazások', de: 'Apps', fr: 'Applications', es: 'Aplicaciones'},
    'Games': {own: true, hu: 'Játékok', de: 'Spiele', fr: 'Jeux', es: 'Juegos'},
    'Music': {own: true, hu: 'Zene', de: 'Musik', fr: 'Musique', es: 'Música'},
    'Books': {own: true, hu: 'Könyvek', de: 'Bücher', fr: 'Livres', es: 'Libros'},
    'Movies': {own: true, hu: 'Filmek', de: 'Filme', fr: 'Films', es: 'Películas'},
    'CATEGORIES': {own: true, hu: 'KATEGÓRIÁK', de: 'KATEGORIEN', fr: 'CATÉGORIES', es: 'CATEGORÍAS'},
    'GENRES': {own: true, hu: 'MŰFAJOK', de: 'GENRES', fr: 'GENRES', es: 'GÉNEROS'},
    'FEATURED': {own: true, hu: 'KIEMELT', de: 'EMPFOHLEN', fr: 'SÉLECTION', es: 'DESTACADO'},
    'TOP PAID': {own: true, hu: 'LEGNÉPSZERŰBB FIZETŐS', de: 'TOP-KAUF', fr: 'TOP PAYANTS', es: 'MÁS VENDIDO'},
    'TOP FREE': {own: true, hu: 'LEGNÉPSZERŰBB INGYENES', de: 'TOP-GRATIS', fr: 'TOP GRATUITS', es: 'GRATIS MÁS POPULARES'},
    'TOP GROSSING': {own: true, hu: 'LEGNAGYOBB BEVÉTEL', de: 'UMSATZSTÄRKSTE', fr: 'MEILLEURES VENTES', es: 'MÁS RENTABLES'},
    'TOP NEW PAID': {own: true, hu: 'ÚJ FIZETŐS', de: 'NEU & KOSTENPFLICHTIG', fr: 'NOUVEAUTÉS PAYANTES', es: 'NOVEDADES DE PAGO'},
    'TOP NEW FREE': {own: true, hu: 'ÚJ INGYENES', de: 'NEU & GRATIS', fr: 'NOUVEAUTÉS GRATUITES', es: 'NOVEDADES GRATUITAS'},
    'TRENDING': {own: true, hu: 'FELKAPOTT', de: 'IM TREND', fr: 'TENDANCES', es: 'TENDENCIAS'},
    'TOP ALBUMS': {own: true, hu: 'LEGNÉPSZERŰBB ALBUMOK', de: 'TOP-ALBEN', fr: 'TOP ALBUMS', es: 'ÁLBUMES MÁS POPULARES'},
    'TOP SONGS': {own: true, hu: 'LEGNÉPSZERŰBB DALOK', de: 'TOP-SONGS', fr: 'TOP TITRES', es: 'CANCIONES MÁS POPULARES'},
    'NEW RELEASES': {own: true, hu: 'ÚJDONSÁGOK', de: 'NEUERSCHEINUNGEN', fr: 'NOUVEAUTÉS', es: 'NOVEDADES'},
    'TOP SELLING': {own: true, hu: 'LEGKELENDŐBB', de: 'BESTSELLER', fr: 'MEILLEURES VENTES', es: 'MÁS VENDIDOS'},
    'FREE': {own: true, hu: 'INGYENES', de: 'KOSTENLOS', fr: 'GRATUIT', es: 'GRATIS'},
    'Free': {own: true, hu: 'Ingyenes', de: 'Kostenlos', fr: 'Gratuit', es: 'Gratis'},
    'Free classics': {own: true, hu: 'Ingyenes klasszikusok', de: 'Kostenlose Klassiker', fr: 'Classiques gratuits', es: 'Clásicos gratis'},
    'Unavailable': {own: true, hu: 'Ebben a szimulátorban nem érhető el', de: 'In diesem Simulator nicht verfügbar', fr: 'Non disponible dans ce simulateur', es: 'No disponible en este simulador'}
  };
  // The APK's text (STRINGS) before the simulator's own (OWN), in the named form strings.js reads.
  const STR = AndroidStrings.table('', {...OWN, ...STRINGS});
  const text = (lang, key) => STR.t(key, lang);
  const fmt = (s, ...args) => AndroidStrings.format(s, ...args);
  const stripTags = s => String(s).replace(/<[^>]*>/g, '');
  const VERSION = '3.4.7';
  // Corpus colours (values/colors.xml: *_background, the strips; *_foreground, the tab titles) in the TOC's order.
  const SECTIONS = [['apps', 'Apps', '#96AA39', '#96AA39'], ['music', 'Music', '#F4842D', '#C96D25'], ['movies', 'Movies', '#C74B46', '#BC4742'], ['books', 'Books', '#3F9FE0', '#3C95D3'], ['games', 'Games', '#96AA39', '#96AA39']];
  const TABS = {
    apps: ['CATEGORIES', 'FEATURED', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    games: ['CATEGORIES', 'FEATURED', 'TOP PAID', 'TOP FREE', 'TOP GROSSING', 'TOP NEW PAID', 'TOP NEW FREE', 'TRENDING'],
    music: ['GENRES', 'FEATURED', 'TOP ALBUMS', 'TOP SONGS', 'NEW RELEASES'],
    books: ['CATEGORIES', 'FEATURED', 'TOP SELLING', 'NEW RELEASES', 'TOP FREE'],
    movies: ['CATEGORIES', 'FEATURED', 'TOP SELLING', 'NEW RELEASES']
  };
  // Paid apps, albums, books and films for the sections: public-domain classics, the simulator's own demo albums, fictional films.
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.'},
    {id: 'album-first-light', kind: 'music', name: 'First Light', developer: 'The Demo Tapes', rating: 4.6, price: '$7.99', colors: ['#2c3e57', '#f1b45d'], description: '12 songs. Includes "Blue Horizon" and "Afterglow".'},
    {id: 'album-after-hours', kind: 'music', name: 'After Hours', developer: 'The Demo Tapes', rating: 4.4, price: '$6.99', colors: ['#1c1530', '#b65fd8'], description: '10 songs. Includes "Night Drive".'},
    {id: 'album-small-worlds', kind: 'music', name: 'Small Worlds', developer: 'Paper Satellites', rating: 4.5, price: 'FREE', colors: ['#14403a', '#7fd6b4'], description: 'A free album of the week.'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']},
  ];
  const DATES = ['March 21, 2012', 'March 2, 2012', 'February 14, 2012', 'January 30, 2012'];
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: DATES[i % 4], plus: 120 + i * 37, size: String(item.size || '').replace(' ', ''), whatsnew: 'Bug fixes and performance improvements.'}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: item.kind === 'magazines' ? 'August 9, 2012' : 'February 1, 2012', size: item.kind === 'books' ? '1.2MB' : item.kind === 'magazines' ? '24MB' : item.kind === 'music' ? '96MB' : item.kind === 'movies' ? '820MB' : item.size, description: item.kind === 'books' ? 'A classic, free from Google Play Books.' : item.kind === 'movies' ? 'Rent and watch within 30 days.' : '', ...item}))];
  const find = id => all().find(item => item.id === id);
  // Each item's content rating (the storefront's own; the image's apps are rated Everyone) and ContentFilterActivity's
  // choice: the ticked ratings; Show all apps lifts the filter.
  const MATURITY = {orbit: 'Medium maturity', 'lunar-golf': 'Low maturity'};
  const LEVELS = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'];
  const maturity = item => MATURITY[item.id] || 'Everyone';
  const shown = ctx => { const f = ctx.prefs?.filter; return all().filter(item => !f || f.includes('Show all apps') || f.includes(maturity(item))); };
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const stars = rating => `<span class="icsp-stars" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="ip" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="25" r="10" fill="url(#ip)"/><ellipse cx="24" cy="25" rx="18" ry="5" fill="none" stroke="#9fd8ff" stroke-width="2.2" transform="rotate(-18 24 25)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b77bff"/><rect x="28" y="6" width="10" height="10" fill="#ff8bc4"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M28 31l3 3 6-7" fill="none" stroke="#3da543" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'icsp-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} icsp-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} icsp-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  const price = (item, ctx, word = false) => item.price === 'FREE' ? text(ctx.lang, word ? 'Free' : 'FREE') : item.price;
  // The action bar (LegacyActionBar on ICS: the Holo bar): ic_ab_back and the 32 dp Play icon (only the icon at the top
  // level), the title, ic_menu_market_search and the Holo overflow button.
  function header(ctx, title, back = true) {
    const up = back ? '<button class="icsp-up" data-action="back" aria-label="Back"><i class="icsp-caret"></i><img src="assets/ps347-ic_launcher_play_store.png" alt=""></button>' : '<span class="icsp-up root"><img src="assets/ps347-ic_launcher_play_store.png" alt=""></span>';
    if (ctx.searching) return `<form class="icsp-bar searching" data-form="icsp-search">${up}<input name="query" autocomplete="off" aria-label="${e(text(ctx.lang, 'Search Google Play'))}" placeholder="${e(text(ctx.lang, 'Search Google Play'))}" value="${e(ctx.editValue || '')}"><button class="icsp-search" type="submit" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button></form>`;
    return `<div class="icsp-bar">${up}<b>${e(title)}</b>${ctx.noMenu ? '' : `<button class="icsp-search" data-action="icsp-search" aria-label="${e(text(ctx.lang, 'Search Google Play'))}"></button>`}${ctx.noMenu ? '' : '<button class="icsp-overflow" data-action="icsp-menu" aria-label="More options"></button>'}</div>`;
  }
  // SearchView suggestions: catalog matches, or the recent queries.
  function suggestions(ctx) {
    if (!ctx.searching) return '';
    const q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const list = q ? shown(ctx).filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 5).map(item => ({id: item.id, name: item.name})) : ctx.history.slice(0, 5).map(name => ({id: '', name}));
    return list.length ? `<div class="icsp-suggest">${list.map(s => `<button type="button" data-action="${s.id ? 'icsp-detail' : 'icsp-search-run'}" data-id="${e(s.id || s.name)}"><i class="${s.id ? 'item' : 'recent'}"></i><span>${e(s.name)}</span></button>`).join('')}</div>` : '';
  }
  const view = (ctx, cls, head, body) => `<div class="app-view icsp ${cls}" data-no-translate>${head}<div class="icsp-scroll">${body}</div>${suggestions(ctx)}</div>`;

  function home(ctx) {
    const T = key => text(ctx.lang, key), items = shown(ctx), promo = find('orbit') || items[0];
    // CorpusGridItem.bindCorpusTile: corpus_cell with the strip, the name, the watermark and "see more".
    const tiles = SECTIONS.slice(0, 4).map(([id, label, color]) => `<button class="icsp-tile ${id}" style="--c:${color}" data-action="icsp-section" data-id="${id}"><b>${e(T(label))}</b><i class="icsp-mark ${id}"></i><small>${e(T('see more'))}</small></button>`).join('');
    const stripe = kind => (SECTIONS.find(s => s[0] === kind) || SECTIONS[0])[2];
    const feature = item => `<button class="icsp-feature" style="--a:${(item.colors || ['#222'])[0]};--b:${(item.colors || ['#222', '#555'])[1]}" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-feature-art')}<span><b>${e(item.name)}</b><small>${e(item.developer)}</small></span><span class="icsp-feature-foot">${stars(item.rating)}<em>${e(price(item, ctx))}</em></span></button>`;
    const banner = (item, title, line, cls) => `<button class="icsp-promo ${cls}" style="--c:${stripe(item.kind)}" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-promo-art')}<span><b>${e(title)}</b><small>${e(line)}</small></span></button>`;
    return view(ctx, 'icsp-home', header(ctx, T('Google Play'), false),
      `${banner(promo, promo.name, promo.description || '', 'space')}<div class="icsp-columns"><div class="icsp-tiles">${tiles}</div><div class="icsp-right"><button class="icsp-games" data-action="icsp-section" data-id="games"><b>${e(T('Games'))}</b><i></i></button>${feature(find('album-first-light'))}${feature(find('book-holmes'))}</div></div>${banner(find('movie-quiet'), 'A Quiet Afternoon', `$2.99 · ${T('Movies')}`, 'film')}${banner(find('book-alice'), 'Free classics', 'Alice\'s Adventures in Wonderland', 'classics')}`);
  }
  // A section: the ViewPager title strip (the current tab centred in the section colour, its neighbours at the edges).
  function section(ctx) {
    const T = key => text(ctx.lang, key), [id, label, color] = SECTIONS.find(s => s[0] === ctx.section) || SECTIONS[0];
    const tabs = TABS[id], tab = tabs.includes(ctx.tab) ? ctx.tab : 'FEATURED', i = tabs.indexOf(tab);
    const strip = `<div class="icsp-tabs" style="--c:${color}" data-icsp-swipe><button data-action="icsp-tab" data-id="${e(tabs[i - 1] || '')}"${i ? '' : ' disabled'}>${i ? e(T(tabs[i - 1])) : ''}</button><b>${e(T(tab))}</b><button data-action="icsp-tab" data-id="${e(tabs[i + 1] || '')}"${i < tabs.length - 1 ? '' : ' disabled'}>${i < tabs.length - 1 ? e(T(tabs[i + 1])) : ''}</button></div>`;
    const items = shown(ctx).filter(item => item.kind === id);
    let body;
    if (tab === 'CATEGORIES' || tab === 'GENRES') {
      const cats = {games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual', 'Live Wallpaper', 'Racing', 'Sports Games', 'Widgets'], apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Education', 'Entertainment', 'Finance', 'Health & Fitness', 'Music & Audio', 'Photography', 'Productivity', 'Tools'], music: ['Alternative', 'Classical', 'Electronica', 'Pop', 'Rock', 'Soundtracks'], books: ['Fiction', 'Classics', 'Mystery', 'Children\'s'], movies: ['Action & Adventure', 'Animation', 'Comedy', 'Drama', 'Family']}[id];
      body = `<div class="icsp-list">${cats.map(c => `<button class="icsp-cat" data-action="icsp-tab" data-id="${e(tabs[2])}">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'FEATURED') {
      const lead = items[0], rest = items.slice(1, 5);
      body = lead ? `<div class="icsp-featured"><button class="icsp-banner" data-action="icsp-detail" data-id="${e(lead.id)}" style="--a:${(lead.colors || ['#13301a'])[0]};--b:${color}">${art(lead, 'icsp-banner-art')}<b>${e(lead.name)}</b></button><div class="icsp-grid">${rest.map(item => `<button class="icsp-gridtile" data-action="icsp-detail" data-id="${e(item.id)}">${art(item, 'icsp-tile-art')}<span><b>${e(item.name)}</b>${stars(item.rating)}</span></button>`).join('')}<button class="icsp-gridtile pick" style="--c:${color}" data-action="icsp-tab" data-id="${e(tabs[2])}"><b>${e(T(tabs[2]))}</b><i class="icsp-mark ${id}"></i></button></div></div>` : '';
    } else {
      const sorted = [...items].sort((a, b) => tab === 'TRENDING' || tab === 'NEW RELEASES' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('PAID') || tab === 'TOP SELLING' ? item.price !== 'FREE' : tab.includes('FREE') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="icsp-list">${sorted.map(item => row(item, ctx)).join('')}</div>` : `<p class="icsp-empty">${e(T('No results'))}</p>`;
    }
    return view(ctx, `icsp-section ${id}`, header(ctx, T(label)) + strip, body);
  }
  // Light list rows (3.5): icon, bold title, developer, stars and the price or green "Installed".
  function row(item, ctx) {
    const state = installedState(item, ctx);
    return `<button class="icsp-row" data-action="icsp-detail" data-id="${e(item.id)}">${art(item)}<span class="icsp-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span><em class="${state === 'installed' || item.price === 'FREE' ? 'green' : ''}">${e(state === 'installed' ? text(ctx.lang, 'Installed') : price(item, ctx, true))}</em></button>`;
  }
  // details_reviews: HistogramView ("Average" over the value, the stars and the count; "5 stars" … "1 star") and
  // reviews_list_item rows (the bold title, stars, author in #999999, date, text). 3.4.7 has no sorting or filters.
  const REVIEWS = [
    {title: 'Love it!', author: 'Joseph', date: '3/23/12', device: 'Samsung Galaxy Nexus', stars: 5, text: 'Exactly what I was looking for. Works great on Ice Cream Sandwich.', newest: 2},
    {title: 'Great update', author: 'James', date: '3/25/12', device: 'Nexus S', stars: 4, text: 'Faster than the last version. Would love a widget.', newest: 1},
    {title: 'Nice', author: 'Maria', date: '3/27/12', device: 'Samsung Galaxy Nexus', stars: 4, text: 'Simple and pretty. Does what it says.', newest: 0}
  ];
  function reviews(item, ctx) {
    const T = key => text(ctx.lang, key), total = item.votes, shares = [.62, .2, .09, .04, .05].map((s, i) => Math.round(total * (s + (item.rating - 4.4) * (i ? -.04 : .16))));
    const max = Math.max(...shares), label = n => T(AndroidStrings.quantity(n) === 'one' ? '1 star' : `${n} stars`);
    return `<div class="icsp-reviews"><h4>${e(T('REVIEWS'))}</h4><div class="icsp-hist"><div class="icsp-avg"><small>${e(T('Average'))}</small><b>${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b>${stars(item.rating)}<small>${total.toLocaleString(ctx.locale)}</small></div><div class="icsp-bars">${shares.map((n, i) => `<span><small>${e(label(5 - i))}</small><i style="width:${Math.max(2, Math.round(n / max * 100))}%"></i><em>${Math.max(0, n).toLocaleString(ctx.locale)}</em></span>`).join('')}</div></div>${REVIEWS.map(r => `<div class="icsp-review"><b>${e(r.title)}</b><span>${stars(r.stars)} <strong>${e(r.author)}</strong> ${e(r.date)}</span><p>${e(r.text)}</p></div>`).join('')}</div>`;
  }
  function detail(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx);
    let actions = '';
    if (state === 'installed') actions = `<div class="icsp-actions"><button data-action="icsp-open" data-id="${e(item.id)}">${e(T('Open'))}</button><button data-action="icsp-uninstall-ask" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(T('Uninstall'))}</button></div>`;
    else if (state === 'downloading' || state === 'installing') actions = `<div class="icsp-actions progress"><div><span>${e(T(state === 'installing' ? 'Installing…' : 'Downloading…'))}</span><i class="icsp-progress"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i></div><button data-action="icsp-cancel">${e(T('Cancel'))}</button></div>`;
    const priceButton = state ? '' : `<button class="icsp-price" data-action="icsp-buy" data-id="${e(item.id)}">${e(price(item, ctx))}</button>`;
    const shots = item.kind === 'music' || item.kind === 'books' || item.kind === 'movies' ? '' : `<div class="icsp-shots">${[0, 1, 2].map(n => `<span class="icsp-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', '#9fc33b'])[0]};--b:${(item.colors || ['#2a3a4a', '#9fc33b'])[1]}">${art(item, 'icsp-shot-art')}</span>`).join('')}</div>`;
    return view(ctx, 'icsp-detail', header(ctx, item.name), `<div class="icsp-head">${art(item, 'icsp-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span>${priceButton}</div>${actions ? `<i class="icsp-rule"></i>${actions}<i class="icsp-rule"></i>` : '<i class="icsp-rule"></i>'}${shots}
      <div class="icsp-info"><div class="icsp-info-row"><span>${stars(item.rating)} <small>${item.votes.toLocaleString(ctx.locale)}</small></span><span>${e(item.updated)}</span></div><div class="icsp-info-row"><span>${e(fmt(T('%s downloads'), item.downloads))}</span><span>${e(fmt(T('Size: %1$s'), item.size || ''))}</span></div>
      <div class="icsp-plus"><button data-action="icsp-plus" data-id="${e(item.id)}" class="${ctx.plussed.includes(item.id) ? 'on' : ''}" aria-label="+1"><i></i><em>${item.plus + (ctx.plussed.includes(item.id) ? 1 : 0)}</em></button><span>${ctx.plussed.includes(item.id) ? e(T("You +1'd this.")) : ''}</span></div>
      ${state === 'installed' && !item.app ? `<label class="icsp-auto"><input type="checkbox" data-icsp-auto="${e(item.id)}"${ctx.autoUpdate.includes(item.id) ? ' checked' : ''}><span>${e(T('Allow automatic updating'))}</span></label>` : ''}
      ${(state === 'installed' ? [["What's new", item.whatsnew], ['DESCRIPTION', item.description]] : [['DESCRIPTION', item.description], ["What's new", item.whatsnew]]).filter(([, body]) => body).map(([title, body]) => `<div class="icsp-desc"><h4>${e(T(title))}</h4><p>${e(body)}</p></div>`).join('')}${reviews(item, ctx)}</div>`);
  }
  function permissions(ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.selected);
    const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete USB storage contents']];
    return `<div class="app-view icsp icsp-perms" data-no-translate>${header(ctx, item.name)}<div class="icsp-head">${art(item, 'icsp-head-art')}<span><b>${e(item.name)}</b><small>${e(item.developer.toUpperCase())}</small></span></div><i class="icsp-rule"></i><div class="icsp-scroll"><p class="icsp-perm-intro">${e(T('Permissions'))}</p>${groups.map(([g, d]) => `<div class="icsp-perm"><i></i><span><b>${e(T(g))}</b><small>${e(T(d))}</small></span></div>`).join('')}</div><div class="icsp-accept"><button data-action="icsp-accept" data-id="${e(item.id)}">${e(T('Accept & download'))}</button></div></div>`;
  }
  // My apps (3.5.15): INSTALLED and ALL pages; Installed groups its apps under "Up to date" with the count.
  // My apps (my_downloads): one list under my_downloads_section_header, "Installed" and "Not installed" with their counts.
  function myApps(ctx) {
    const T = key => text(ctx.lang, key);
    const installed = all().filter(item => installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const removed = all().filter(item => (item.kind === 'apps' || item.kind === 'games') && installedState(item, ctx) !== 'installed' && ctx.everInstalled.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name));
    const group = (title, items) => items.length ? `<div class="icsp-group"><span>${e(T(title))}</span><b>${items.length}</b></div><div class="icsp-list">${items.map(item => row(item, ctx)).join('')}</div>` : '';
    return view(ctx, 'icsp-myapps', header(ctx, T('My apps')), group('Up to date', installed) + group('Not installed', removed));
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim().toLocaleLowerCase(ctx.locale), items = q ? shown(ctx).filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(q)) : [];
    return view(ctx, 'icsp-results', header(ctx, ctx.query || ''), items.length ? `<div class="icsp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="icsp-empty">${e(text(ctx.lang, 'No results'))}</p>`);
  }
  // Settings (3.8.15 / 3.8.17 captures; Holo rows and upper-case headers on ICS).
  function settings(ctx) {
    const T = key => text(ctx.lang, key), s = ctx.prefs;
    const cat = title => `<h3 class="icsp-pref-cat">${e(T(title))}</h3>`;
    const chk = (key, title, summary, disabled) => `<button class="icsp-pref" data-action="icsp-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"${disabled ? ' disabled' : ''}><span><b>${e(T(title))}</b><small>${e(T(summary))}</small></span><img src="assets/btn_check_${s[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    // With a PIN the user controls stay locked until Unlock settings takes it (SettingsActivity).
    const locked = !!s.pinCode && !ctx.unlocked;
    const plain = (action, title, summary, raw, disabled) => `<button class="icsp-pref" data-action="${action}"${disabled ? ' disabled' : ''}><span><b>${e(T(title))}</b><small>${raw ? e(summary) : e(T(summary))}</small></span></button>`;
    return `<div class="app-view icsp icsp-settings" data-no-translate>${header({...ctx, noMenu: true}, T('Settings'))}<div class="icsp-scroll">${cat('General')}${chk('notify', 'Notifications', 'Notifications summary')}${chk('autoUpdate', 'Auto-update apps', 'Auto-update summary')}${chk('wifiOnly', 'Update over Wi-Fi only', 'Wi-Fi summary')}${chk('widgets', 'Auto-add widgets', 'Widgets summary')}${plain('icsp-clear-history', 'Clear search history', 'Clear search history summary')}${cat('User controls')}<button class="icsp-pref" data-action="icsp-unlock"${locked ? '' : ' disabled'}><span><b>${e(T('Unlock settings'))}</b></span></button>${plain('icsp-filter', 'Content filtering', 'Content filtering summary', false, locked)}${chk('pin', 'Use PIN for purchases', 'Use PIN summary', !s.pinCode || locked)}${plain('icsp-pin', 'Set or change PIN', 'Set PIN summary', false, locked)}${cat('Other')}${chk('admob', 'Google AdMob Ads', 'AdMob summary')}<p class="icsp-pref-note">${e(AndroidStrings.format(stripTags(T('AdMob info')), ''))}</p>${cat('About')}${plain('icsp-unavailable', 'Open source licenses', 'Licenses summary')}<div class="icsp-pref info"><span><b>${e(T('Build version'))}</b><small>${e(fmt(T('Version'), VERSION))}</small></span></div></div></div>`;
  }
  function render(ctx) {
    if (ctx.page === 'section') return section(ctx);
    if (ctx.page === 'detail') return detail(ctx);
    if (ctx.page === 'permissions') return permissions(ctx);
    if (ctx.page === 'my-apps') return myApps(ctx);
    if (ctx.page === 'search') return search(ctx);
    if (ctx.page === 'settings') return settings(ctx);
    return home(ctx);
  }
  // The overflow menu: My apps, Accounts, Settings, Help.
  const menu = ctx => [['icsp-my-apps', 'My apps'], ['icsp-unavailable', 'Accounts'], ['icsp-settings', 'Settings'], ['icsp-unavailable', 'Help']].map(([action, title]) => ({action, title: text(ctx.lang, title)}));
  // Holo dialogs: Sort reviews (single choice) and Options (two checkboxes with OK).
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), item = find(ctx.target || ctx.selected);
    const box = (title, body, buttons) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog icsp-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="settings-dialog-actions">${buttons}</div></div>`;
    const cancel = `<button data-action="close-overlay">${e(T('Cancel'))}</button>`;
    // ContentFilterActivity: "Allow apps rated for" with a check box per rating.
    if (kind === 'filter') {
      const f = ctx.filterDraft || ctx.prefs.filter || LEVELS;
      return box(T('Allow apps rated for'), `<div class="icsp-dlg-list">${LEVELS.map(level => `<button class="icsp-dlg-row" data-action="icsp-filter-pick" data-id="${e(level)}" role="checkbox" aria-checked="${f.includes(level)}"><span>${e(T(level))}</span><img src="assets/btn_check_${f.includes(level) ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}</div>`, cancel + `<button data-action="icsp-filter-ok">${e(T('OK'))}</button>`);
    }
    // PinEntryDialog: the prompt for the step, the PIN field with its hint ("Incorrect PIN" after a wrong one), and
    // Remove PIN beside OK when an existing PIN is being edited.
    if (kind === 'pin') {
      const step = ctx.pinStep || 'create', prompt = {create: 'Create a PIN to control and lock settings:', confirm: 'Re-type to confirm your new PIN:', settings: 'Type your PIN to change settings:', edit: 'Type a new PIN or remove existing PIN:'}[step];
      return box(T('Type your PIN'), `<p class="icsp-dlg-text">${e(T(prompt))}</p><input class="icsp-pin" data-icsp-pin type="password" inputmode="numeric" maxlength="16" autocomplete="off" placeholder="${e(T(ctx.pinWrong ? 'Incorrect PIN' : 'Type PIN'))}" aria-label="${e(T('Type your PIN'))}">`,
        cancel + (step === 'edit' ? `<button data-action="icsp-pin-remove">${e(T('Remove PIN'))}</button>` : '') + `<button data-action="icsp-pin-ok">${e(T('OK'))}</button>`);
    }
    if (kind === 'uninstall' && item) return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog icsp-dialog" role="dialog" aria-label="${e(T('Uninstall app'))}"><h3>${e(T('Uninstall app'))}</h3><p class="icsp-dlg-text">${e(T('Do you want to uninstall this app?'))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${e(T('Cancel'))}</button><button data-action="icsp-uninstall" data-id="${e(item.id)}">${e(T('OK'))}</button></div></div>`;
    return '';
  }
  window.ICSPlay = {SECTIONS, TABS, EXTRA, VERSION, LEVELS, text, fmt, all, shown, maturity, find, installedState, render, menu, dialog};
})();
