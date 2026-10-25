/* Google Play Store 4.5.10 (com.android.vending), the Phonesky.apk of the Nexus 5's KTU84P image, rebuilt from that APK
   as the 4.3 store is (docs/templates/jb-play.template.js): texts in five languages from its resources (docs/tools/apk-strings.py),
   drawables from its xxhdpi / xhdpi set (assets/ps4510-*), colours and sizes from its values and layouts, menus and the
   drawer from res/menu and the code (classes.dex). What 4.5.10 changed against 4.2.3:
   - main.xml puts the content in a PlayDrawerLayout: the 288 dp side drawer (MainActivity.calculateSideDrawerWidth:
     min(4/5 of the width, 320 dp)) with drawer_profile_info (64 dp: avatar, bold 15 sp name, 13 sp account) over the
     #F5F5F5 destinations (SideDrawerDestinationsAdapter.createContent: Store home, My apps, My wishlist, Redeem; 21 sp
     Roboto Light rows of 64 dp, the current one bold). The overflow (menu/base.xml) keeps only Settings and Help.
   - Cluster and section headers lose the italics; the Newsstand corpus replaces Magazines (action_bar_bg_newss,
     magazines_primary #3F5CA9).
   - Owned apps get rate_review_section: "Rate this app" (14 sp #777777) centred over the 32 dp corpus stars
     (play_ratingbar_*: btn_rating_star_*), which open the Rate it! dialog.
   - The empty wishlist centres its #AAAAAA text under ic_empty_wish.
   Settings (res/xml/settings.xml) are the same as 4.2.3's. The catalog, cluster titles and list names are the
   simulator's own storefront; 1 dp = 0.906 CSS px on the Nexus 5 screen. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({"Google Play": "app_name", "My apps": "my_downloads_menu", "My wishlist": "menu_my_wishlist", "Redeem": "redeem_gift_card_menu",
    "Accounts": "menu_switch_accounts", "Store home": "menu_home", "Rate this app": "rate_this_app", "Open navigation drawer": "side_drawer_open", "Settings": "settings", "Help": "help_and_info", "Search Google Play": "search_hint", "Search": "content_description_search",
    "Share": "content_description_share", "Include in wishlist": "content_description_wishlist_add", "Remove from wishlist": "content_description_wishlist_remove",
    "Add to wishlist": "wishlist_add", "Remove from wishlist ": "wishlist_remove", "%1$s added to wishlist": "wishlist_add_success", "%1$s removed from wishlist": "wishlist_remove_success",
    "Go up": "content_description_main_icon", "Options": "content_description_options", "see more": "more_results_no_count", "%1$d more": "more_results",
    "Categories": "category_tab_title", "Genres": "genres_tab_title", "Install": "install", "Uninstall": "uninstall", "Open": "open", "Update": "update",
    "Buy %1$s": "buy", "Installed": "installed_list_state", "Up to date": "installed_section", "Updates": "updates_available_section",
    "Downloading…": "downloading_section", "Update all": "update_all", "Installed ": "my_apps_tab_installed", "All": "my_apps_tab_library",
    "Remove": "archive_label", "Remove \"%1$s\" from my apps?": "archiving_no_uninstall_confirmation",
    "Apps and games installed from Google Play Store will appear here.": "empty_myapps_description_installed",
    "Apps and games owned by this account will appear here.": "empty_myapps_description_all", "Browse apps": "empty_myapps_browse_apps", "Browse games": "empty_myapps_browse_games",
    "There are no items in your wishlist. To add items, tap the bookmark whenever you see it in the menu above.": "my_wishlist_empty",
    "No results found.": "no_results", "No results found for \"%1$s\".": "no_results_for_query", "Description": "details_description", "What's new": "details_whats_new",
    "Reviews": "details_reviews", "Average": "average_rating", "ALL REVIEWS": "all_reviews", "Rate & review": "review", "Your review": "my_review",
    "%s downloads": "downloads_count", "Cancel this download": "content_description_cancel_download", "Starting download…": "download_pending",
    "Installing…": "installing", "Uninstalling…": "uninstalling", "Rate it!": "review_dialog_title", "Unrated": "review_dialog_unrated", "Poor": "review_dialog_poor",
    "Below average": "review_dialog_below_average", "Average ": "review_dialog_average", "Above average": "review_dialog_above_average", "Excellent": "review_dialog_excellent",
    "Summary": "review_dialog_subject_hint", "Comment": "review_dialog_body_hint", "OK": "ok", "Cancel": "cancel", "Do you want to uninstall this app?": "uninstall_app_msg",
    "App permissions": "permissions_title", "%1$s needs access to:": "needs_permissions", "%1$s does not require any special permissions.": "no_dangerous_permissions",
    "Accept": "accept", "Screenshot": "content_description_screenshot", "Flag as inappropriate": "flagging_title", "Developer": "details_developer_links",
    "Visit webpage": "link_website", "Send email": "link_email", "Share \"%1$s\" via": "share_dialog_title", "Check out \"%1$s\"": "share_subject", "Privacy policy": "privacy_policy", "General": "settings_general_section_header",
    "Notifications": "notifications", "Notify me about updates to apps or games that I downloaded": "notification_description", "Auto-update apps": "auto_update_label",
    "Do not auto-update apps": "auto_update_value_disabled", "Auto-update apps at any time. Data charges may apply.": "auto_update_value_enabled",
    "Auto-update apps over Wi-Fi only": "auto_update_value_wifi_only", "Auto-add shortcuts": "auto_add_shortcuts_label",
    "Automatically add Home screen shortcuts for new apps": "auto_add_shortcuts_description", "Clear search history": "clear_history_title",
    "Remove all the searches you have performed": "clear_history_summary", "User controls": "settings_user_controls_section_header",
    "Content filtering": "content_filtering_label", "Set the content filtering level to restrict apps that can be downloaded": "content_filtering_description",
    "Password": "change_password_restrict_label", "Use password to restrict purchases": "change_password_restrict_summary", "About": "settings_about_header",
    "Open source licenses": "os_licenses_label", "License details for open source software": "os_licenses_summary", "Build version": "settings_build_version",
    "Version: %1$s": "market_version", "Allow apps rated for": "content_filter_title", "Everyone": "content_filter_everyone", "Low maturity": "content_filter_low_maturity",
    "Medium maturity": "content_filter_medium_maturity", "High maturity": "content_filter_high_maturity", "Show all apps": "content_filter_show_all_apps",
    "Set the content filtering level to restrict apps that can be downloaded to this device.": "info_about_content_filter", "Auto-update": "allow_auto_updating",
    "Successfully installed.": "notification_installation_success_message", "Successfully installed \"%1$s\"": "notification_installation_success_status",
    "Choose Google Account": "select_account", "Did you mean:": "suggestion_question", "Network communication": "framework:permgrouplab_network",
    "full network access": "framework:permlab_createNetworkSockets", "view network connections": "framework:permlab_accessNetworkState",
    "Storage": "framework:permgrouplab_storage", "modify or delete the contents of your USB storage": "framework:permlab_sdcardWrite",
    "Affects Battery": "framework:permgrouplab_affectsBattery", "control vibration": "framework:permlab_vibrate", "prevent phone from sleeping": "framework:permlab_wakeLock"});
  // The storefront itself (corpus and list names, cluster titles, promo texts) came from Google's servers; these are the
  // simulator's own, and "Unavailable" is the simulator's note for what it does not do.
  const OWN = {
    'Apps': {own: true, hu: 'Alkalmazások', de: 'Apps', fr: 'Applications', es: 'Aplicaciones'},
    'Games': {own: true, hu: 'Játékok', de: 'Spiele', fr: 'Jeux', es: 'Juegos'},
    'Music': {own: true, hu: 'Zene', de: 'Musik', fr: 'Musique', es: 'Música'},
    'Books': {own: true, hu: 'Könyvek', de: 'Bücher', fr: 'Livres', es: 'Libros'},
    'Movies & TV': {own: true, hu: 'Filmek és TV', de: 'Filme & Serien', fr: 'Films et séries', es: 'Películas y TV'},
    'Newsstand': {own: true, hu: 'Újságos', de: 'Kiosk', fr: 'Kiosque', es: 'Kiosco'},
    'Featured': {own: true, hu: 'Kiemelt', de: 'Empfohlen', fr: 'Sélection', es: 'Destacado'},
    'Top Paid': {own: true, hu: 'Legnépszerűbb fizetős', de: 'Top-Kauf', fr: 'Top payants', es: 'Más vendido'},
    'Top Free': {own: true, hu: 'Legnépszerűbb ingyenes', de: 'Top-Gratis', fr: 'Top gratuits', es: 'Gratis más populares'},
    'Top Grossing': {own: true, hu: 'Legnagyobb bevétel', de: 'Umsatzstärkste', fr: 'Meilleures ventes', es: 'Más rentables'},
    'Top New Paid': {own: true, hu: 'Új fizetős', de: 'Neu & kostenpflichtig', fr: 'Nouveautés payantes', es: 'Novedades de pago'},
    'Top New Free': {own: true, hu: 'Új ingyenes', de: 'Neu & gratis', fr: 'Nouveautés gratuites', es: 'Novedades gratuitas'},
    'Trending': {own: true, hu: 'Felkapott', de: 'Im Trend', fr: 'Tendances', es: 'Tendencias'},
    'Top Albums': {own: true, hu: 'Legnépszerűbb albumok', de: 'Top-Alben', fr: 'Top albums', es: 'Álbumes más populares'},
    'Top Songs': {own: true, hu: 'Legnépszerűbb dalok', de: 'Top-Songs', fr: 'Top titres', es: 'Canciones más populares'},
    'New Releases': {own: true, hu: 'Újdonságok', de: 'Neuerscheinungen', fr: 'Nouveautés', es: 'Novedades'},
    'Top Selling': {own: true, hu: 'Legkelendőbb', de: 'Bestseller', fr: 'Meilleures ventes', es: 'Más vendidos'},
    'Free': {own: true, hu: 'Ingyenes', de: 'Kostenlos', fr: 'Gratuit', es: 'Gratis'},
    'Recommended for You': {own: true, hu: 'Önnek ajánljuk', de: 'Empfehlungen für Sie', fr: 'Recommandations pour vous', es: 'Recomendado para ti'},
    'Staff Picks': {own: true, hu: 'A szerkesztők választása', de: 'Tipps der Redaktion', fr: 'Choix de l\'équipe', es: 'Selección del equipo'},
    'Our favourite apps this week': {own: true, hu: 'A hét kedvenc alkalmazásai', de: 'Unsere Lieblings-Apps der Woche', fr: 'Nos applis préférées de la semaine', es: 'Nuestras aplicaciones favoritas de la semana'},
    'Albums from $3.99': {own: true, hu: 'Albumok $3.99-tól', de: 'Alben ab 3,99 $', fr: 'Albums à partir de 3,99 $', es: 'Álbumes desde 3,99 $'},
    'Summer Demo Tapes': {own: true, hu: 'Nyári demófelvételek', de: 'Sommer-Demoaufnahmen', fr: 'Démos de l\'été', es: 'Maquetas de verano'},
    'Free classics': {own: true, hu: 'Ingyenes klasszikusok', de: 'Kostenlose Klassiker', fr: 'Classiques gratuits', es: 'Clásicos gratis'},
    'Timeless books, free': {own: true, hu: 'Időtálló könyvek ingyen', de: 'Zeitlose Bücher, kostenlos', fr: 'Des livres intemporels, gratuits', es: 'Libros eternos, gratis'},
    'Get Unlimited Music': {own: true, hu: 'Korlátlan zene', de: 'Unbegrenzte Musik', fr: 'Musique illimitée', es: 'Música ilimitada'},
    'Try All Access for Free': {own: true, hu: 'Próbálja ki ingyen az All Accesst', de: 'All Access kostenlos testen', fr: 'Essayez All Access gratuitement', es: 'Prueba All Access gratis'},
    'Phone Highlights': {own: true, hu: 'Kiemelt telefonos tartalmak', de: 'Highlights für Smartphones', fr: 'À la une sur mobile', es: 'Destacados para móviles'},
    'Unavailable': {own: true, hu: 'Ebben a szimulátorban nem érhető el', de: 'In diesem Simulator nicht verfügbar', fr: 'Non disponible dans ce simulateur', es: 'No disponible en este simulador'}
  };
  // The APK's text (STRINGS) before the simulator's own (OWN), in the named form strings.js reads.
  const STR = AndroidStrings.table('', {...OWN, ...STRINGS}, key => key.trim());
  const text = (lang, key) => STR.t(key, lang);
  // Android's %1$s / %1$d and the ^1 TextUtils.expandTemplate placeholders.
  const fmt = (s, ...args) => AndroidStrings.format(s, ...args);
  const VERSION = '4.5.10';
  // Corpus colours (values/colors.xml: *_primary, *_secondary) and the action bars (action_bar_bg_*.9.png: the fill and
  // its 2 dp bottom edge).
  const SECTIONS = [
    ['apps', 'Apps', '#B2CB39', '#96AA39', '#96AA39', '#819231'], ['games', 'Games', '#B2CB39', '#96AA39', '#96AA39', '#819231'],
    ['movies', 'Movies & TV', '#C74B46', '#943C39', '#C74B46', '#AB403C'], ['music', 'Music', '#F4842D', '#D77428', '#F4842D', '#D27127'],
    ['books', 'Books', '#3F9FE0', '#3687BF', '#3F9FE0', '#3689C0'], ['magazines', 'Newsstand', '#3F5CA9', '#364E8F', '#3F5CA9', '#364F91']
  ];
  const HOME_BAR = ['#666666', '#585858'], MULTI = '#585858';
  const TABS = {
    apps: ['Categories', 'Featured', 'Top Paid', 'Top Free', 'Top Grossing', 'Top New Paid', 'Top New Free', 'Trending'],
    games: ['Categories', 'Featured', 'Top Paid', 'Top Free', 'Top Grossing', 'Top New Paid', 'Top New Free', 'Trending'],
    music: ['Genres', 'Featured', 'Top Albums', 'Top Songs', 'New Releases'],
    books: ['Categories', 'Featured', 'Top Selling', 'New Releases', 'Top Free'],
    movies: ['Categories', 'Featured', 'Top Selling', 'New Releases'],
    magazines: ['Categories', 'Featured', 'Top Selling']
  };
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8MB', description: 'Eighteen holes in low gravity.', whatsnew: 'New night course.'},
    {id: 'pocket-planner', kind: 'apps', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6MB', description: 'Plan your week on one simple page.', whatsnew: 'Now with a KitKat widget.'},
    {id: 'album-first-light', kind: 'music', name: 'First Light', developer: 'The Demo Tapes', rating: 4.6, price: '$5.99', colors: ['#2c3e57', '#f1b45d'], description: '12 songs. Includes "Blue Horizon" and "Afterglow".'},
    {id: 'album-after-hours', kind: 'music', name: 'After Hours', developer: 'The Demo Tapes', rating: 4.4, price: '$6.99', colors: ['#1c1530', '#b65fd8'], description: '10 songs. Includes "Night Drive".'},
    {id: 'album-small-worlds', kind: 'music', name: 'Small Worlds', developer: 'Paper Satellites', rating: 4.5, price: '$3.99', colors: ['#14403a', '#7fd6b4'], description: '9 songs. Includes "City Lights".'},
    {id: 'book-pride', kind: 'books', name: 'Pride and Prejudice', developer: 'Jane Austen', rating: 4.6, price: 'FREE', colors: ['#5d4a3a', '#c9b48a']},
    {id: 'book-holmes', kind: 'books', name: 'The Adventures of Sherlock Holmes', developer: 'Arthur Conan Doyle', rating: 4.7, price: 'FREE', colors: ['#28323c', '#a7b4bd']},
    {id: 'book-alice', kind: 'books', name: 'Alice\'s Adventures in Wonderland', developer: 'Lewis Carroll', rating: 4.5, price: 'FREE', colors: ['#3a5f8a', '#f0d48a']},
    {id: 'movie-orbit', kind: 'movies', name: 'Orbit Hopper: The Movie', developer: 'Animation', rating: 4.1, price: '$3.99', colors: ['#141c3a', '#8f7fff']},
    {id: 'movie-quiet', kind: 'movies', name: 'A Quiet Afternoon', developer: 'Drama', rating: 3.9, price: '$2.99', colors: ['#3a2a1c', '#e0a868']},
    {id: 'mag-pocket-tech', kind: 'magazines', name: 'Pocket Tech Monthly', developer: 'July 2014', rating: 4.2, price: '$2.99', colors: ['#1d2b45', '#5fb3e8'], description: 'Phones, tablets and the apps that matter. Single issue.'},
    {id: 'mag-trail', kind: 'magazines', name: 'Trail & Summit', developer: 'August 2014', rating: 4.4, price: '$3.99', colors: ['#2d3a1f', '#c9a85a'], description: 'Hiking routes, gear and mountain stories.'},
    {id: 'mag-kitchen', kind: 'magazines', name: 'Weekend Kitchen', developer: 'Summer 2014', rating: 4.0, price: '$1.99', colors: ['#5a2018', '#f2b35e'], description: 'Fifty easy recipes for long summer evenings.'}
  ];
  const DATES = ['July 18, 2014', 'July 2, 2014', 'June 14, 2014', 'May 30, 2014'];
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', price: 'FREE', downloads: ['10,000,000+', '1,000,000+', '500,000+', '100,000+'][i % 4], votes: 12000 + i * 4173, updated: DATES[i % 4], plus: 120 + i * 37, size: String(item.size || '').replace(' ', ''), whatsnew: 'Bug fixes and performance improvements.'}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '50,000+', votes: 812, plus: 46, updated: item.kind === 'magazines' ? 'July 9, 2014' : 'June 3, 2014', size: item.kind === 'books' ? '1.2MB' : item.kind === 'magazines' ? '24MB' : item.kind === 'music' ? '96MB' : item.kind === 'movies' ? '820MB' : item.size, description: item.kind === 'books' ? 'A classic, free from Google Play Books.' : item.kind === 'movies' ? 'A feature film from the simulator\'s small demo shelf.' : item.description, ...item}))];
  const find = id => all().find(item => item.id === id);
  // The details page's Share: ACTION_SEND text/plain with share_subject and the item's play.google.com link in the
  // system chooser (share_dialog_title), offering the image's mail and chat apps; the package and the developer's address
  // are the storefront's own.
  const SHARE_TARGETS = [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']];
  const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const packageName = item => item.app ? `com.android.${slug(item.app)}` : `com.${slug(item.developer)}.${slug(item.name)}`;
  const shareLink = item => `https://play.google.com/store/${item.kind === 'apps' || item.kind === 'games' || !item.kind ? 'apps' : item.kind}/details?id=${packageName(item)}`;
  const developerEmail = item => `${slug(item.developer)}@example.com`;
  const isApp = item => item.kind === 'apps' || item.kind === 'games';
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  const sec = kind => SECTIONS.find(s => s[0] === kind) || SECTIONS[0];
  // PlayRatingBarSmall (14 dp ic_rate_star_market_*) and PlayRatingBarRateIndicator (24 dp btn_rating_star_*).
  const stars = (rating, cls = '') => `<span class="jbp-stars ${cls}" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="jp" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="12" cy="12" r="1" fill="#fff"/><circle cx="37" cy="9" r="1.2" fill="#fff"/><circle cx="38" cy="36" r=".9" fill="#fff"/><circle cx="24" cy="24" r="10" fill="url(#jp)"/><ellipse cx="24" cy="24" rx="17" ry="5.5" fill="none" stroke="#9fd3ff" stroke-width="2.2" transform="rotate(-20 24 24)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b36cff"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><circle cx="17" cy="33" r="3" fill="#8e95aa"/><circle cx="31" cy="36" r="2" fill="#8e95aa"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><g fill="#9aa7b5"><rect x="14" y="23" width="5" height="4"/><rect x="21" y="23" width="5" height="4"/><rect x="28" y="23" width="5" height="4"/><rect x="14" y="30" width="5" height="4"/><rect x="21" y="30" width="5" height="4"/></g><path d="M27 33l3 3 6-7" fill="none" stroke="#2fa84f" stroke-width="2.4"/></svg>'
  };
  const art = (item, cls = 'jbp-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">`
    : ICONS[item.art] ? `<i class="${cls} jbp-svg" aria-hidden="true">${ICONS[item.art]}</i>`
    : `<i class="${cls} jbp-cover ${item.kind || ''}" style="--a:${(item.colors || ['#2f4f6f', '#8fc0e8'])[0]};--b:${(item.colors || ['#2f4f6f', '#8fc0e8'])[1]}" aria-hidden="true"><b>${e((item.name || '?').slice(0, 1))}</b></i>`;
  // PlayCardPriceLabel: 11 sp, upper case (use_all_caps_in_label_mode), the corpus colour; owned items say INSTALLED.
  const price = (item, ctx) => item.price === 'FREE' ? text(ctx.lang, 'Free') : item.price;
  const T = ctx => key => text(ctx.lang, key);

  // The action bar. Menu items with showAsAction ifRoom fill the two slots left next to the overflow.
  function header(ctx, title, opts = {}) {
    const [fill, edge] = opts.bar || HOME_BAR, t = T(ctx);
    // ActionBarDrawerToggle: ic_drawer_white on the drawer's top-level pages, the up caret elsewhere.
    const up = opts.drawer ? `<button class="jbp-up" data-action="kkp-drawer" aria-label="${e(t('Open navigation drawer'))}"><i class="jbp-caret drawer"></i><i class="jbp-logo"></i></button>` : `<button class="jbp-up" data-action="back" aria-label="${e(t('Go up'))}"><i class="jbp-caret"></i><i class="jbp-logo"></i></button>`;
    const actions = (opts.actions || ['search']).slice(0, 2).map(a => a === 'search'
      ? `<button class="jbp-ab search" data-action="jbp-search" aria-label="${e(t('Search Google Play'))}"></button>`
      : a === 'wish' ? `<button class="jbp-ab wish${opts.wished ? ' on' : ''}" data-action="jbp-wish" data-id="${e(opts.id)}" aria-label="${e(t(opts.wished ? 'Remove from wishlist' : 'Include in wishlist'))}"></button>`
      : `<button class="jbp-ab share" data-action="jbp-share" aria-label="${e(t('Share'))}"></button>`).join('');
    if (ctx.searching) return `<form class="jbp-bar searching" style="--bar:${fill};--edge:${edge}" data-form="jbp-search">${up}<input name="query" autocomplete="off" aria-label="${e(t('Search Google Play'))}" placeholder="${e(t('Search Google Play'))}" value="${e(ctx.editValue || '')}"><button class="jbp-ab search" type="submit" aria-label="${e(t('Search'))}"></button></form>`;
    return `<div class="jbp-bar" style="--bar:${fill};--edge:${edge}">${up}<b>${e(title)}</b>${opts.noMenu ? '' : `${actions}<button class="jbp-ab overflow" data-action="jbp-menu" aria-label="More options"></button>`}</div>`;
  }
  function suggestions(ctx) {
    if (!ctx.searching) return '';
    const q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const list = q ? all().filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 5).map(item => ({id: item.id, name: item.name})) : ctx.history.slice(0, 5).map(name => ({id: '', name}));
    return list.length ? `<div class="jbp-suggest">${list.map(s => `<button type="button" data-action="${s.id ? 'jbp-detail' : 'jbp-search-run'}" data-id="${e(s.id || s.name)}"><i class="${s.id ? 'item' : 'recent'}"></i><span>${e(s.name)}</span></button>`).join('')}</div>` : '';
  }
  const view = (ctx, cls, head, body, fixed = '') => `<div class="app-view jbp ${cls}" data-no-translate>${head}${fixed}<div class="jbp-scroll">${body}</div>${suggestions(ctx)}</div>`;

  // play_card_small: the thumbnail (apps inset by app_thumbnail_padding 10 dp), the Light 16 sp title, the creator in
  // 13 sp #AAAAAA, the rating bar or the price label, the card overflow (play_overflow_menu).
  function card(item, ctx) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const foot = state === 'installed' ? `<em class="ok" style="color:${color}">${e(text(ctx.lang, 'Installed'))}</em>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="jbp-card ${item.kind}"><button class="jbp-card-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'jbp-card-art')}<span class="jbp-card-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small><span class="jbp-card-foot">${isApp(item) && state !== 'installed' ? stars(item.rating) : '<span></span>'}${foot}</span></span></button><button class="jbp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="${e(text(ctx.lang, 'Options'))}"></button></div>`;
  }
  // play_card_cluster_header: title, subtitle and the more box; a tap on the header opens the list.
  function cluster(title, sub, kind, items, ctx, target) {
    const [, , color] = sec(kind), t = T(ctx), rest = items.length - 3;
    const more = rest > 0 && rest <= 99 ? fmt(t('%1$d more'), rest) : t('see more');
    return `<section class="jbp-cluster"><button class="jbp-cluster-head" data-action="jbp-section" data-id="${e(target || kind)}"><span><h3>${e(title)}</h3><small>${e(sub)}</small></span><em style="background:${color}">${e(more.toLocaleUpperCase(ctx.locale))}</em></button><div class="jbp-cards">${items.filter(Boolean).slice(0, 3).map(item => card(item, ctx)).join('')}</div></section>`;
  }
  function home(ctx) {
    const t = T(ctx), items = all();
    const links = SECTIONS.map(([id, label, color]) => `<button class="jbp-cat ${id}" style="--c:${color}" data-action="jbp-section" data-id="${id}"><i class="jbp-cat-icon ${id}"></i><b>${e(t(label))}</b></button>`).join('');
    const apps = items.filter(isApp);
    return view(ctx, 'jbp-home', header(ctx, t('Google Play'), {drawer: true}),
      `<div class="jbp-cats">${links}</div>${cluster(t('Albums from $3.99'), t('Summer Demo Tapes'), 'music', items.filter(i => i.kind === 'music'), ctx)}<button class="jbp-banner" data-action="jbp-section" data-id="music"><span class="jbp-banner-art">${items.filter(i => i.kind === 'music' || i.kind === 'movies').slice(0, 6).map(i => art(i, 'jbp-banner-tile')).join('')}</span><span class="jbp-banner-copy"><b>${e(t('Get Unlimited Music'))}</b><small>${e(t('Try All Access for Free'))}</small></span></button>${cluster(t('Recommended for You'), t('Our favourite apps this week'), 'apps', apps, ctx, 'apps')}${cluster(t('Free classics'), t('Timeless books, free'), 'books', items.filter(i => i.kind === 'books'), ctx)}${cluster(t('Staff Picks'), t('Games'), 'games', items.filter(i => i.kind === 'games'), ctx)}`);
  }
  // A corpus page: the corpus action bar, the tab strip, then Featured (clusters), Categories (category_item) or a list.
  function section(ctx) {
    const t = T(ctx), [id, label, color, , fill, edge] = sec(ctx.section);
    const tabs = TABS[id], tab = tabs.includes(ctx.tab) ? ctx.tab : 'Featured';
    const strip = `<div class="jbp-tabs" style="--c:${color}" data-jbp-swipe>${tabs.map(name => `<button class="${name === tab ? 'on' : ''}" data-action="jbp-tab" data-id="${e(name)}">${e(t(name).toLocaleUpperCase(ctx.locale))}</button>`).join('')}</div>`;
    const items = all().filter(item => item.kind === id);
    let body;
    if (tab === 'Categories' || tab === 'Genres') {
      const cats = {games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual', 'Live Wallpaper', 'Racing', 'Sports Games', 'Widgets'], apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Education', 'Entertainment', 'Finance', 'Health & Fitness', 'Libraries & Demo', 'Lifestyle', 'Media & Video', 'Medical', 'Music & Audio', 'News & Magazines', 'Personalization', 'Photography', 'Productivity', 'Shopping', 'Social', 'Sports', 'Tools', 'Transportation', 'Travel & Local', 'Weather'], music: ['Alternative', 'Blues', 'Classical', 'Country', 'Electronica', 'Folk', 'Jazz', 'Pop', 'Rock', 'Soundtracks'], books: ['Biographies & Memoirs', 'Business & Investing', 'Children\'s Books', 'Fiction & Literature', 'History', 'Mystery & Thrillers', 'Science Fiction & Fantasy'], movies: ['Action & Adventure', 'Animation', 'Comedy', 'Documentary', 'Drama', 'Family', 'Horror'], magazines: ['Business & News', 'Food & Cooking', 'Outdoors', 'Technology']}[id];
      body = `<div class="jbp-catlist">${cats.map(c => `<button data-action="jbp-tab" data-id="${e(tabs[2])}">${e(c)}</button>`).join('')}</div>`;
    } else if (tab === 'Featured') {
      const top = [...items].sort((a, b) => b.rating - a.rating);
      body = `${cluster(t('Phone Highlights'), t('Our favourite apps this week'), id, top, ctx, id)}${top.length > 3 ? cluster(t('Staff Picks'), t(label), id, top.slice(3), ctx, id) : ''}`;
    } else {
      const sorted = [...items].sort((a, b) => tab === 'Trending' || tab === 'New Releases' ? a.name.localeCompare(b.name) : b.rating - a.rating).filter(item => tab.includes('Paid') || tab === 'Top Selling' ? item.price !== 'FREE' : tab.includes('Free') ? item.price === 'FREE' : true);
      body = sorted.length ? `<div class="jbp-list">${sorted.map(item => row(item, ctx)).join('')}</div>` : `<p class="jbp-empty">${e(t('No results found.'))}</p>`;
    }
    return view(ctx, `jbp-section ${id}`, header(ctx, t(label), {bar: [fill, edge]}) + strip, body);
  }
  // play_card_listing (88 dp): the thumbnail, the 16 sp title, the creator, the rating badge, the price at the bottom
  // right and the overflow at the top right.
  function row(item, ctx) {
    const state = installedState(item, ctx), [, , color] = sec(item.kind);
    const status = state === 'installed' ? `<em class="ok" style="color:${color}">${e(text(ctx.lang, 'Installed'))}</em>` : `<em style="color:${color}">${e(price(item, ctx))}</em>`;
    return `<div class="jbp-row"><button class="jbp-row-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'jbp-row-art')}<span class="jbp-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span>${status}</button><button class="jbp-dots" data-action="jbp-card-menu" data-id="${e(item.id)}" aria-label="${e(text(ctx.lang, 'Options'))}"></button></div>`;
  }
  const REVIEWS = [
    {author: 'Joseph', date: 'July 21, 2014', stars: 5, title: 'Love it', text: 'Exactly what I was looking for. Works great on my Nexus 5.'},
    {author: 'James', date: 'July 12, 2014', stars: 4, title: 'Faster', text: 'Faster than the last version. Love the new widget.'},
    {author: 'Maria', date: 'June 30, 2014', stars: 4, title: 'Simple', text: 'Simple and pretty. Does what it says.'}
  ];
  // details_reviews: the section header, HistogramView (the "Average" box on #585858 over the #E5E5E5 value, stars and
  // count; the bars of HistogramBar with their 14 sp labels), sample reviews (reviews_list_item) and ALL REVIEWS.
  function reviews(item, ctx) {
    const t = T(ctx), total = item.votes, shares = [.62, .2, .09, .04, .05].map((s, i) => Math.round(total * (s + (item.rating - 4.4) * (i ? -.04 : .16))));
    const max = Math.max(...shares), colors = ['#8fc04f', '#b1d06b', '#ffcf4a', '#ffad54', '#ff8d6b'];
    return `<div class="jbp-section-head"><h4>${e(t('Reviews'))}</h4></div><div class="jbp-hist"><div class="jbp-avg"><span>${e(t('Average'))}</span><div><b>${item.rating.toLocaleString(ctx.locale, {minimumFractionDigits: 1})}</b>${stars(item.rating)}<small>${total.toLocaleString(ctx.locale)}</small></div></div><div class="jbp-bars">${shares.map((n, i) => `<span><small>${5 - i}</small><i style="width:${Math.max(2, Math.round(n / max * 100))}%;background:${colors[i]}"></i><small>${n.toLocaleString(ctx.locale)}</small></span>`).join('')}</div></div>${REVIEWS.map(r => `<div class="jbp-review"><i class="jbp-avatar"></i><div><b>${e(r.title)}</b><span class="jbp-review-by">${stars(r.stars)}<strong>${e(r.author)}</strong></span><small>${e(r.date)}</small><p>${e(r.text)}</p></div><i class="jbp-review-rate"></i></div>`).join('')}<div class="jbp-all-reviews"><em style="background:${sec(item.kind)[2]}">${e(t('ALL REVIEWS'))}</em></div>`;
  }
  // details_text: the Light Italic 18 sp header and the 14 sp #777777 text.
  const textPanel = (title, body) => body ? `<div class="jbp-text"><h4>${e(title)}</h4><p>${e(body)}</p></div>` : '';
  function detail(ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx), owned = state === 'installed', [, label, color, , fill, edge] = sec(item.kind);
    let buttons;
    if (owned) buttons = `<span class="jbp-btns"><button class="jbp-btn" data-action="jbp-open" data-id="${e(item.id)}">${e(t('Open').toLocaleUpperCase(ctx.locale))}</button><button class="jbp-btn" data-action="jbp-uninstall-ask" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(t('Uninstall').toLocaleUpperCase(ctx.locale))}</button></span>`;
    else if (state === 'downloading' || state === 'installing') {
      const mb = parseFloat(item.size) || 1, done = state === 'installing' ? mb : mb * ctx.progress;
      buttons = `<span class="jbp-dl"><span class="jbp-dl-text"><small>${e(state === 'installing' ? t('Installing…') : fmt('^1/^2', done.toFixed(1) + 'MB', mb.toFixed(1) + 'MB'))}</small><small>${state === 'installing' ? '' : e(fmt('^1%', Math.round(ctx.progress * 100)))}</small></span><i class="jbp-progress${state === 'installing' ? ' busy' : ''}"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i><button class="jbp-dl-cancel" data-action="jbp-cancel" aria-label="${e(t('Cancel this download'))}"></button></span>`;
    } else buttons = `<span class="jbp-btns"><button class="jbp-btn buy" style="--c:${color}" data-action="jbp-buy" data-id="${e(item.id)}">${e((item.price === 'FREE' ? t('Install') : fmt(t('Buy %1$s'), item.price)).toLocaleUpperCase(ctx.locale))}</button></span>`;
    const summary = `<div class="jbp-summary">${art(item, 'jbp-head-art')}<span class="jbp-head-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${buttons}</span></div><i class="jbp-trailing" style="background:${color}"></i>`;
    const shots = isApp(item) ? `<div class="jbp-shots">${[0, 1, 2].map(n => `<span class="jbp-shot n${n}" role="img" aria-label="${e(t('Screenshot'))}" style="--a:${(item.colors || ['#2a3a4a', '#9fc33b'])[0]};--b:${(item.colors || ['#2a3a4a', '#9fc33b'])[1]}">${art(item, 'jbp-shot-art')}</span>`).join('')}</div>` : '';
    const byline = `<div class="jbp-byline"><span>${stars(item.rating)}<small>${item.votes.toLocaleString(ctx.locale)}</small></span><span class="r">${e(item.updated)}</span><span>${e(fmt(t('%s downloads'), item.downloads))}</span><span class="r">${e(item.size || '')}</span></div>`;
    const plussed = ctx.plussed.includes(item.id);
    const plus = `<button class="jbp-plus" data-action="jbp-plus" data-id="${e(item.id)}"><i class="${plussed ? 'on' : ''}"></i><span>${e(String(item.plus + (plussed ? 1 : 0)))}</span></button>`;
    const rated = ctx.rated?.[item.id] || 0;
    const rate = owned ? `<div class="jbp-rate kkp-rate"><small>${e(t(rated ? 'Your review' : 'Rate this app'))}</small><span class="kkp-rate-bar ${item.kind}">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= rated ? 'on' : ''}" data-action="jbp-rate-dialog" data-id="${e(item.id)}" data-stars="${n}" aria-label="${n}"></button>`).join('')}</span></div>` : '';
    const panels = owned ? [textPanel(t("What's new"), item.whatsnew), textPanel(t('Description'), item.description)] : [textPanel(t('Description'), item.description), textPanel(t("What's new"), item.whatsnew)];
    const footer = `<div class="jbp-footer"><button data-action="jbp-unavailable">${e(t('Flag as inappropriate'))}</button></div>`;
    const actions = owned ? ['search', 'share'] : ['search', 'wish'];
    return view(ctx, 'jbp-detail', header(ctx, t(label), {bar: [fill, edge], actions, id: item.id, wished: (ctx.wishlist || []).includes(item.id)}),
      `${shots}${byline}${plus}${rate}${panels.join('')}${reviews(item, ctx)}${footer}`, summary);
  }
  // My apps: INSTALLED / ALL; my_apps_section_header ("Up to date" and its count) over play_card_myapps rows, whose
  // ic_play_lists_close removes an app that is not installed from the ALL list.
  function myApps(ctx) {
    const t = T(ctx), tab = ctx.tab === 'ALL' ? 'ALL' : 'INSTALLED', [, , color, , fill, edge] = sec('apps');
    const installed = all().filter(item => installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const strip = `<div class="jbp-tabs few" style="--c:${color}" data-jbp-swipe>${[['INSTALLED', 'Installed '], ['ALL', 'All']].map(([id, name]) => `<button class="${id === tab ? 'on' : ''}" data-action="jbp-tab" data-id="${id}">${e(t(name).toLocaleUpperCase(ctx.locale))}</button>`).join('')}</div>`;
    const mine = item => `<div class="jbp-row mine"><button class="jbp-row-main" data-action="jbp-detail" data-id="${e(item.id)}">${art(item, 'jbp-row-art')}<span class="jbp-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small>${stars(item.rating)}</span>${installedState(item, ctx) === 'installed' ? `<em class="ok" style="color:${color}">${e(t('Installed'))}</em>` : ''}</button>${tab === 'ALL' && installedState(item, ctx) !== 'installed' ? `<button class="jbp-archive" data-action="jbp-archive" data-id="${e(item.id)}" aria-label="${e(t('Remove'))}"></button>` : ''}</div>`;
    const library = all().filter(isApp).filter(item => installedState(item, ctx) === 'installed' || ctx.everInstalled.includes(item.id)).sort((a, b) => a.name.localeCompare(b.name));
    const empty = key => `<div class="jbp-myapps-empty"><p>${e(t(key))}</p><button data-action="jbp-section" data-id="apps">${e(t('Browse apps'))}</button><button data-action="jbp-section" data-id="games">${e(t('Browse games'))}</button></div>`;
    const body = tab === 'ALL'
      ? library.length ? `<div class="jbp-list">${library.map(mine).join('')}</div>` : empty('Apps and games owned by this account will appear here.')
      : installed.length ? `<div class="jbp-group"><span>${e(t('Up to date'))}</span><b>${installed.length}</b></div><div class="jbp-list">${installed.map(mine).join('')}</div>` : empty('Apps and games installed from Google Play Store will appear here.');
    return view(ctx, 'jbp-myapps', header(ctx, t('My apps'), {bar: [fill, edge], drawer: true}) + strip, body);
  }
  function wishlist(ctx) {
    const t = T(ctx), items = (ctx.wishlist || []).map(find).filter(Boolean);
    return view(ctx, 'jbp-wishlist', header(ctx, t('My wishlist'), {drawer: true}), items.length ? `<div class="jbp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<div class="jbp-wish-empty kkp"><i></i><p>${e(t('There are no items in your wishlist. To add items, tap the bookmark whenever you see it in the menu above.'))}</p></div>`);
  }
  function search(ctx) {
    const q = String(ctx.query || '').trim(), lq = q.toLocaleLowerCase(ctx.locale), items = q ? all().filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(lq)) : [];
    return view(ctx, 'jbp-results', header(ctx, q), items.length ? `<div class="jbp-list">${items.map(item => row(item, ctx)).join('')}</div>` : `<p class="jbp-empty">${e(fmt(text(ctx.lang, 'No results found for "%1$s".'), q))}</p>`);
  }
  // res/xml/settings.xml on Holo Light preference rows: General, User controls, About.
  function settings(ctx) {
    const t = T(ctx), s = ctx.prefs;
    const cat = title => `<h3 class="jbp-pref-cat">${e(t(title))}</h3>`;
    const chk = (key, title, summary) => `<button class="jbp-pref" data-action="jbp-pref" data-id="${key}" role="checkbox" aria-checked="${!!s[key]}"><span><b>${e(t(title))}</b><small>${e(t(summary))}</small></span><img src="assets/ps4510-btn_check_${s[key] ? 'on' : 'off'}_holo_light.png" alt=""></button>`;
    const plain = (action, title, summary) => `<button class="jbp-pref" data-action="${action}"><span><b>${e(t(title))}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
    const auto = {never: 'Do not auto-update apps', any: 'Auto-update apps at any time. Data charges may apply.', wifi: 'Auto-update apps over Wi-Fi only'}[s.autoMode || 'wifi'];
    return `<div class="app-view jbp jbp-settings" data-no-translate>${header({...ctx, searching: false}, t('Settings'), {noMenu: true})}<div class="jbp-scroll">${cat('General')}${chk('notify', 'Notifications', 'Notify me about updates to apps or games that I downloaded')}${plain('jbp-auto-update', 'Auto-update apps', t(auto))}${chk('shortcuts', 'Auto-add shortcuts', 'Automatically add Home screen shortcuts for new apps')}${plain('jbp-clear-history', 'Clear search history', t('Remove all the searches you have performed'))}${cat('User controls')}${plain('jbp-content-filter', 'Content filtering', t('Set the content filtering level to restrict apps that can be downloaded'))}${chk('password', 'Password', 'Use password to restrict purchases')}${cat('About')}${plain('jbp-unavailable', 'Open source licenses', t('License details for open source software'))}${plain('jbp-noop', 'Build version', fmt(t('Version: %1$s'), VERSION))}</div></div>`;
  }
  // AppsPermissionsActivity (light_purchase_app_permissions): the title, "<b>app</b> needs access to:", the
  // AppSecurityPermissions rows (the framework's group label over its permission labels) and ACCEPT.
  function permissions(item, ctx) {
    const t = T(ctx), [, , color] = sec(item.kind);
    const groups = item.kind === 'games' ? [['Network communication', ['full network access', 'view network connections']], ['Affects Battery', ['control vibration', 'prevent phone from sleeping']]] : [['Network communication', ['full network access']], ['Storage', ['modify or delete the contents of your USB storage']]];
    return `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="jbp-dlg perms" role="dialog" aria-label="${e(t('App permissions'))}"><h3>${e(t('App permissions'))}</h3><div class="jbp-perm-list"><p>${fmt(e(t('%1$s needs access to:')).replace(/&lt;(\/?)b&gt;/g, '<$1b>'), e(item.name))}</p>${groups.map(([g, list]) => `<div class="jbp-perm"><b>${e(t(g))}</b><small>${e(list.map(p => t(p)).join(', '))}</small></div>`).join('')}</div><div class="jbp-dlg-bar"><button class="jbp-btn buy" style="--c:${color}" data-action="jbp-accept" data-id="${e(item.id)}">${e(t('Accept').toLocaleUpperCase(ctx.locale))}</button></div></div>`;
  }
  function render(ctx) {
    if (ctx.page === 'section') return section(ctx);
    if (ctx.page === 'detail') return detail(ctx);
    if (ctx.page === 'my-apps') return myApps(ctx);
    if (ctx.page === 'wishlist') return wishlist(ctx);
    if (ctx.page === 'search') return search(ctx);
    if (ctx.page === 'settings') return settings(ctx);
    return home(ctx);
  }
  // The overflow (menu/base.xml): Settings and Help; on details Share joins it when the wishlist bookmark takes the second
  // action slot.
  function menu(ctx) {
    const item = ctx.page === 'detail' ? find(ctx.selected) : null, owned = item && installedState(item, ctx) === 'installed';
    return [...(item && !owned ? [['jbp-share', 'Share']] : []), ['jbp-settings', 'Settings'], ['jbp-unavailable', 'Help']].map(([action, title]) => ({action, title: text(ctx.lang, title)}));
  }
  // The side drawer: drawer_profile_info and the destinations, the current one bold (SideDrawerSelectedText).
  function drawer(ctx) {
    const t = T(ctx), cur = ctx.page === 'my-apps' ? 'my-apps' : ctx.page === 'wishlist' ? 'wishlist' : ctx.page === 'home' ? 'home' : '';
    const row = (id, action, label) => `<button class="kkp-nav-item${cur === id ? ' on' : ''}" data-action="${action}">${e(t(label))}</button>`;
    return `<div class="kkp-drawer-scrim" data-action="close-overlay"></div><nav class="kkp-drawer" aria-label="${e(t('Google Play'))}"><div class="kkp-profile"><i class="kkp-avatar"></i><span><b>${e(ctx.userName || 'Android Demo')}</b><small>${e(ctx.account || 'demo@android.local')}</small></span></div><div class="kkp-nav-list">${row('home', 'kkp-home', 'Store home')}${row('my-apps', 'jbp-my-apps', 'My apps')}${row('wishlist', 'jbp-wishlist', 'My wishlist')}${row('', 'jbp-unavailable', 'Redeem')}</div></nav>`;
  }
  const dialogBox = (cls, label, body, buttons) => `<div class="jbp-dlg-scrim" data-action="close-overlay"></div><div class="jbp-dlg holo ${cls}" role="dialog" aria-label="${e(label)}"><h3>${e(label)}</h3>${body}${buttons ? `<div class="jbp-dlg-buttons">${buttons}</div>` : ''}</div>`;
  // Popups and dialogs: the card overflow (popup_selector), the permissions, the auto-update list, the review dialog,
  // the uninstall question, content filtering and the account chooser.
  function dialog(kind, ctx) {
    const t = T(ctx), item = find(ctx.target || ctx.selected);
    if (kind === 'drawer') return drawer(ctx);
    if (kind === 'card' && item) {
      const wished = (ctx.wishlist || []).includes(item.id), state = installedState(item, ctx);
      const buy = state === 'installed' ? '' : `<button data-action="jbp-buy" data-id="${e(item.id)}">${e(item.price === 'FREE' ? t('Install') : fmt(t('Buy %1$s'), item.price))}</button>`;
      return `<div class="jbp-pop-scrim" data-action="close-overlay"></div><div class="jbp-pop" style="top:${ctx.popTop || 120}px" role="menu"><button data-action="jbp-wish" data-id="${e(item.id)}">${e(t(wished ? 'Remove from wishlist ' : 'Add to wishlist'))}</button>${buy}</div>`;
    }
    if (kind === 'perms' && item) return permissions(item, ctx);
    if (kind === 'auto') {
      const mode = ctx.prefs.autoMode || 'wifi';
      return dialogBox('list', t('Auto-update apps'), [['never', 'Do not auto-update apps'], ['any', 'Auto-update apps at any time. Data charges may apply.'], ['wifi', 'Auto-update apps over Wi-Fi only']].map(([id, label]) => `<button class="jbp-dlg-row" data-action="jbp-auto-pick" data-id="${id}" role="radio" aria-checked="${mode === id}"><span>${e(t(label))}</span><img src="assets/ps4510-btn_radio_${mode === id ? 'on' : 'off'}_holo_light.png" alt=""></button>`).join(''), `<button data-action="close-overlay">${e(t('Cancel'))}</button>`);
    }
    if (kind === 'rate' && item) {
      // review_dialog: FinskyRatingBarLarge, the rating's name, Summary and Comment.
      const r = ctx.rateDraft ?? ctx.rated?.[item.id] ?? 0, names = ['Unrated', 'Poor', 'Below average', 'Average ', 'Above average', 'Excellent'];
      return dialogBox('rate', t('Rate it!'), `<div class="jbp-rate-set">${[1, 2, 3, 4, 5].map(n => `<button class="${n <= r ? 'on' : ''}" data-action="jbp-rate-pick" data-id="${n}" aria-label="${n}"></button>`).join('')}</div><p class="jbp-rate-name">${e(t(names[r]))}</p><input class="jbp-field" placeholder="${e(t('Summary'))}" aria-label="${e(t('Summary'))}"><textarea class="jbp-field" rows="5" maxlength="512" placeholder="${e(t('Comment'))}" aria-label="${e(t('Comment'))}"></textarea>`, `<button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="jbp-rate-ok" data-id="${e(item.id)}"${r ? '' : ' disabled'}>${e(t('OK'))}</button>`);
    }
    if (kind === 'uninstall' && item) return dialogBox('ask', item.name, `<p>${e(t('Do you want to uninstall this app?'))}</p>`, `<button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="jbp-uninstall" data-id="${e(item.id)}">${e(t('OK'))}</button>`);
    if (kind === 'share' && item) return dialogBox('list', fmt(t('Share "%1$s" via'), item.name), SHARE_TARGETS.map(([app, name]) => `<button class="jbp-dlg-row" data-action="jbp-share-to" data-id="${app}|${e(item.id)}"><img class="jbp-share-icon" src="assets/${app}.png" alt=""><span>${e(ctx.t?.(name) || name)}</span></button>`).join(''));
    if (kind === 'filter') {
      // ContentFilterActivity: a check box per level; Show all apps ticks them all.
      const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], f = ctx.filterDraft || ctx.prefs.filter || levels;
      return dialogBox('filter', t('Allow apps rated for'), `${levels.map(level => `<button class="jbp-dlg-row" data-action="jbp-filter-pick" data-id="${e(level)}" role="checkbox" aria-checked="${f.includes(level)}"><span>${e(t(level))}</span><img src="assets/ps4510-btn_check_${f.includes(level) ? 'on' : 'off'}_holo_light.png" alt=""></button>`).join('')}<p class="jbp-dlg-note">${e(t('Set the content filtering level to restrict apps that can be downloaded to this device.'))}</p>`, `<button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="jbp-filter-ok">${e(t('OK'))}</button>`);
    }
    if (kind === 'accounts') return dialogBox('list', t('Choose Google Account'), `<button class="jbp-dlg-row" data-action="close-overlay" role="radio" aria-checked="true"><span>${e(ctx.account || 'android.demo@gmail.com')}</span><img src="assets/ps4510-btn_radio_on_holo_light.png" alt=""></button>`, `<button data-action="close-overlay">${e(t('Cancel'))}</button>`);
    return '';
  }
  window.JBPlay = {drawer, SECTIONS, TABS, EXTRA, VERSION, text, fmt, all, find, packageName, shareLink, developerEmail, installedState, render, menu, dialog, art};
})();
