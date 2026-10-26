/* Android Market 2.3.4 (com.android.vending), the Vending.apk of the Nexus S's GRK39F image, rebuilt from that APK: texts
   in five languages from its resources (docs/tools/apk-strings.py), drawables from its hdpi set (assets/gbm234-*), colours and
   sizes from its values and layouts, the menu from res/menu/base.xml and the details sections from the code
   (Vending.odex: AssetInfoActivity.setupContentArea).
   - TallTitleBarTheme is Theme.Light.NoTitleBar: white lists under the "velvet" headers. The green arcs are drawn by
     velvet.ArcPaintingUtils: LinearGradients of header_background_dark1 #465D00, medium3 #80A600, medium2 #709000,
     medium1 #90B000 and light1 #99C000 with lighter swooshes, the highlight band (highlight1 #9FC000, highlight2
     #A5D300) along the curved edge.
   - Home (carousel_home_header, 260 dp): slim_title (ic_market_logo, the title, menu_divider, ic_market_search), the
     carousel of featured promos (promo_frame), the carousel snippet (title, rating, price), the ArcBottomLayout with
     Apps / Games / My apps (HomeNavButton: ic_market_* over white bold labels), then "Featured" (featured_list_header
     on #D0D0D0) and asset_list_snippet rows (48 dp icon, bold title, author, price or state and the rating).
   - Apps / Games: carousel_categories_with_apps (168 dp arc) over the categories with their featured apps; a category
     opens carousel_tabbed_app_browser (the 74 dp arc with the Top paid / Top free / Just in radio tabs).
   - Details (asset_info_page): asset_fat_header (240 dp: the 144 x 96 dp promo in asset_thumbnail_frame, title, author,
     the dark FatHeaderButtons Install / Open / Uninstall and the rating), then the download progress, Rate it!,
     Allow automatic updating, Description (with More, version and size, downloads, screenshots), the permissions
     (on #EDEDED with More), Reviews, Related, the developer, sharing and Flag as inappropriate.
   - confirm_permissions ("Allow this application to access:", OK / Cancel on bottombar_portrait_565), My apps
     (my_downloads_activity: "Currently downloading" / "Downloads" sections, Update all), the settings activity
     (Content filtering with "Allow apps rated", Notifications with Notify me / Do not notify me) and search.
   The catalog and promo lines are the simulator's own storefront; 1 dp = 0.8625 CSS px on the Nexus S screen. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = __STRINGS__({"Market": "application_name", "Android Market": "search_label", "Search Android Market": "search_hint", "Apps": "apps", "Games": "games",
    "My apps": "my_downloads_title", "Featured": "featured_str", "Top paid": "top_paid", "Top free": "top_free", "Just in": "whats_new", "FREE": "asset_free_label",
    "Install": "install", "Uninstall": "uninstall", "Open": "launch", "Buy": "buy", "Update": "update", "Installed": "installed", "Downloading": "downloading",
    "Installing…": "installing", "Uninstalling…": "uninstalling", "Starting download…": "download_pending", "Downloading…": "download_downloading",
    "Cancel download": "cancel_download", "OK": "ok", "Cancel": "cancel", "Accept permissions": "accept_permissions",
    "Allow this application to access:": "security_settings_desc", "No permissions required.": "no_permissions", "Description": "info_description_label",
    "More": "info_more", "Less": "info_less", "Version %1$s": "info_version", "%1$s downloads": "info_downloadcount_label", "Rate it!": "info_rate_it",
    "My review": "info_my_review_label", "Let others know what you think of this application.": "info_my_review_description",
    "Unrated": "unrated", "Poor": "poor", "Below average": "below_average", "Average": "average", "Above average": "above_average", "Excellent!": "excellent",
    "Allow automatic updating": "info_allow_auto_updates", "Reviews": "info_comments_label",
    "The most recent reviews are shown here, touch More below to read all reviews.": "info_comments_description", "Related": "asset_similar",
    "The most relevant applications are shown here. Touch More below to see all related applications.": "info_similar_assets_description",
    "Developer Info": "info_developer_label", "Learn more about the creator and designer.": "info_developer_description", "Sharing": "share_app_label",
    "Let your friends know about this application.": "share_app_description", "Market content": "info_market_content_label",
    "A chance to give us some feedback.": "info_market_content_description", "Flag as inappropriate": "flagging_title",
    "View more applications": "view_applications_label", "Send email to developer": "send_email_label", "Visit the developer's web page": "view_website_label",
    "Share via": "share_app_via", "Set PIN": "set_pin", "Set a numeric password (PIN) code to control changes to content filtering": "set_pin_description",
    "Change PIN": "change_pin", "Change PIN that controls content filtering": "change_pin_description", "Enter PIN": "enter_pin",
    "Enter PIN to change content filtering": "enter_pin_description", "Content rating: %1$s": "info_content_rating_format",
    "Currently downloading": "downloading_section", "Downloads": "my_downloads_section", "No downloads from Android Market.": "empty_downloads",
    "Update all": "update_all", "Search": "search", "Settings": "settings", "settings": "settings_title", "Help": "help_and_info", "Home": "home",
    "Security": "security_settings_menu", "Clear my review": "clear_my_review", "Content filtering": "content_filtering_label",
    "Set the content filtering level to restrict applications that can be downloaded.": "content_filtering_description", "Allow apps rated": "select_filtering_level",
    "Show all apps": "no_filtering_all_apps", "High maturity": "no_filtering", "Medium maturity": "teen_filtering", "Low maturity": "pg_filtering", "Everyone": "safe_filtering",
    "Notifications": "notifications", "Choose whether to be notified if there are updates to apps or games that you have downloaded": "notification_description",
    "Notify me": "enable_notifications_option", "Do not notify me": "disable_notifications_option", "No matching content in Android Market.": "asset_list_no_items",
    "No search results": "search_no_assets_title", "There are no matches in Android Market for the search: ^1": "search_no_assets", "Suggestions:": "search_suggestions_title",
    "Make sure all words are spelled correctly.": "search_suggestion1", "Try different search words.": "search_suggestion2", "Try more general search words.": "search_suggestion3",
    "Uninstall application": "uninstall_application", "%1$s will be removed from this phone.": "uninstall_application_text_non_refund",
    "Please tell us why you removed this item:": "uninstall_reason_prompt", "I don't use or want it.": "uninstall_reason_not_use",
    "I need more space on my phone.": "uninstall_reason_storage", "It's defective.": "uninstall_reason_defective", "It's malicious.": "uninstall_reason_malicious",
    "I'd rather not say.": "uninstall_reason_not_say", "Successfully installed.": "notification_installation_success_message",
    "Network communication": "framework:permgrouplab_network", "full Internet access": "framework:permlab_createNetworkSockets",
    "Hardware controls": "framework:permgrouplab_hardwareControls", "control vibrator": "framework:permlab_vibrate", "Storage": "framework:permgrouplab_storage",
    "modify/delete SD card contents": "framework:permlab_sdcardWrite"});
  // The storefront itself (promo lines, category names) came from the server; "Unavailable" is the simulator's note.
  const OWN = {
    'Unavailable': {own: true, hu: 'Ebben a szimulátorban nem érhető el', de: 'In diesem Simulator nicht verfügbar', fr: 'Non disponible dans ce simulateur', es: 'No disponible en este simulador'}
  };
  // The APK's text (STRINGS) before the simulator's own (OWN), in the named form strings.js reads.
  const STR = AndroidStrings.table('', {...OWN, ...STRINGS});
  const text = (lang, key) => STR.t(key, lang);
  const fmt = (s, ...args) => AndroidStrings.format(s, ...args);
  const VERSION = '2.3.4';
  const SECTIONS = [['apps', 'Apps'], ['games', 'Games']];
  const TABS = ['Top paid', 'Top free', 'Just in'];
  const CATEGORIES = {
    apps: ['Books & Reference', 'Business', 'Comics', 'Communication', 'Entertainment', 'Finance', 'Health', 'Lifestyle', 'Multimedia', 'News & Weather', 'Productivity', 'Reference', 'Shopping', 'Social', 'Sports', 'Themes', 'Tools', 'Travel'],
    games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual']
  };
  const EXTRA = [
    {id: 'lunar-golf', kind: 'games', category: 'Arcade & Action', art: 'golf', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8 MB', description: 'Eighteen holes in low gravity.', colors: ['#0c1022', '#b9bfd0']},
    {id: 'pocket-planner', kind: 'apps', category: 'Productivity', art: 'planner', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6 MB', description: 'Plan your week on one simple page.', colors: ['#2a6fbd', '#e8453c']}
  ];
  const CATEGORY = {Games: 'Arcade & Action', Photography: 'Multimedia', Communication: 'Communication', 'Music & audio': 'Multimedia', Productivity: 'Productivity', Tools: 'Tools'};
  const catalog = () => (window.ICSPlayStore?.catalog || []).map((item, i) => ({...item, kind: item.category === 'Games' ? 'games' : 'apps', category: CATEGORY[item.category] || 'Tools', price: 'FREE', downloads: ['1,000,000 - 5,000,000', '100,000 - 500,000', '50,000 - 100,000', '10,000 - 50,000'][i % 4], votes: 1200 + i * 417, version: `1.${i}.${(i * 3) % 7}`, updated: ['Aug 2, 2011', 'Jul 21, 2011', 'Jun 14, 2011', 'May 30, 2011'][i % 4]}));
  const all = () => [...catalog(), ...EXTRA.map(item => ({downloads: '5,000 - 10,000', votes: 81, version: '1.0', updated: 'Jul 9, 2011', ...item}))];
  const find = id => all().find(item => item.id === id);
  // The content rating each item carries (the storefront's own; the image's apps are rated Everyone) and the filter of
  // the settings activity: the ticked ratings; "Show all apps" lifts the filter.
  const MATURITY = {orbit: 'Medium maturity', 'lunar-golf': 'Low maturity'};
  const maturity = item => MATURITY[item.id] || 'Everyone';
  const shown = ctx => { const f = ctx.prefs?.filter; return all().filter(item => !f || f.includes('Show all apps') || f.includes(maturity(item))); };
  // The developer's address for Send email to developer and the package the share link names (the storefront's own).
  const slug = text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const developerEmail = item => `${slug(item.developer)}@example.com`;
  const packageName = item => item.app ? `com.android.${slug(item.app)}` : `com.${slug(item.developer)}.${slug(item.name)}`;
  const installedState = (item, ctx) => item.app ? 'installed' : ctx.installed.includes(item.id) ? 'installed' : ctx.downloading === item.id ? ctx.phase : '';
  // MarketRatingBarSmall: 14 dp stars (ic_market_star_*).
  const stars = rating => `<span class="gbmk-stars" aria-label="${rating}">${[1, 2, 3, 4, 5].map(n => `<i class="${rating >= n - .25 ? 'on' : rating >= n - .75 ? 'half' : ''}"></i>`).join('')}</span>`;
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="gm" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="24" cy="24" r="10" fill="url(#gm)"/><ellipse cx="24" cy="24" rx="17" ry="5.5" fill="none" stroke="#9fd3ff" stroke-width="2.2" transform="rotate(-20 24 24)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006" stroke-width="1"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#45c1ff"/><rect x="18" y="16" width="10" height="10" fill="#7bd448"/><rect x="28" y="16" width="10" height="10" fill="#b36cff"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><path d="M27 33l3 3 6-7" fill="none" stroke="#2fa84f" stroke-width="2.4"/></svg>'
  };
  const icon = (item, cls = 'gbmk-icon') => item.app ? `<img class="${cls}" src="assets/${item.app}.png" alt="">` : ICONS[item.art] ? `<i class="${cls} gbmk-svg" aria-hidden="true">${ICONS[item.art]}</i>` : `<i class="${cls}" aria-hidden="true"></i>`;
  // A promo graphic (the server's 180 x 120 promo): the icon on its colours.
  const promo = (item, cls = 'gbmk-promo') => `<span class="${cls}" style="--a:${(item.colors || ['#38511a', '#9fc33b'])[0]};--b:${(item.colors || ['#38511a', '#9fc33b'])[1]}">${icon(item, 'gbmk-promo-icon')}</span>`;
  const price = (item, ctx) => item.price === 'FREE' ? text(ctx.lang, 'FREE') : item.price;
  const T = ctx => key => text(ctx.lang, key);
  // The state shown by asset_common_info: Installed, Downloading, Installing… or the price.
  const stateLabel = (item, ctx) => { const s = installedState(item, ctx), t = T(ctx); return s === 'installed' ? t('Installed') : s === 'downloading' ? t('Downloading') : s === 'installing' ? t('Installing…') : price(item, ctx); };

  // velvet: the arc background (ArcPaintingUtils), slim_title on top. kind: 'home' (260 dp), 'fat' (240 dp),
  // 'list' (168 dp), 'tabs' (74 dp) or 'flat' (SlimFlatView).
  function arc(ctx, kind, title, inner = '', noTitle = false) {
    const t = T(ctx), k = kind.replace(/\s+/g, '-');
    const head = `<div class="gbmk-slim"><button class="gbmk-logo" data-action="gbmk-home" aria-label="${e(t('Market'))}"></button><b>${e(title)}</b><i class="gbmk-divider"></i><button class="gbmk-search-btn" data-action="gbmk-search" aria-label="${e(t('Search'))}"></button></div>`;
    return `<div class="gbmk-arc ${kind}"><svg class="gbmk-arc-bg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gbmk-g1-${k}" x1="0" y1="1" x2="1" y2=".5"><stop offset="0" stop-color="#465D00"/><stop offset=".3" stop-color="#80A600"/><stop offset=".7" stop-color="#80A600"/><stop offset="1" stop-color="#709000"/></linearGradient><linearGradient id="gbmk-g2-${k}" x1="0" y1="0" x2=".65" y2=".75"><stop offset="0" stop-color="#709000"/><stop offset="1" stop-color="#90B000"/></linearGradient><linearGradient id="gbmk-g3-${k}" x1="0" y1="0" x2=".25" y2=".3"><stop offset="0" stop-color="#709000"/><stop offset="1" stop-color="#99C000"/></linearGradient><linearGradient id="gbmk-h-${k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A5D300"/><stop offset="1" stop-color="#9FC000"/></linearGradient></defs><rect width="100" height="100" fill="url(#gbmk-g1-${k})"/><path d="M0 50C35 75 65 75 100 60V0H0z" fill="url(#gbmk-g2-${k})" opacity=".55"/><path d="M0 25C25 5 50 5 100 30V0H0z" fill="url(#gbmk-g3-${k})" opacity=".5"/>${kind === 'flat' ? '' : `<path d="M0 ${kind === 'tabs' ? 100 : 92}Q50 ${kind === 'tabs' ? 100 : 78} 100 ${kind === 'tabs' ? 100 : 92}" stroke="url(#gbmk-h-${k})" stroke-width="2.5" fill="none"/>`}</svg>${noTitle ? '' : head}${inner}</div>`;
  }
  const view = (cls, body) => `<div class="app-view gbmk ${cls}" data-no-translate>${body}</div>`;
  // asset_list_snippet: the 48 dp icon, bold title, author, the price or state and the rating on the right.
  const row = (item, ctx) => `<button class="gbmk-row" data-action="gbmk-detail" data-id="${e(item.id)}">${icon(item)}<span class="gbmk-row-copy"><b>${e(item.name)}</b><small>${e(item.developer)}</small></span><span class="gbmk-row-side"><em>${e(stateLabel(item, ctx))}</em>${stars(item.rating)}</span></button>`;

  function home(ctx) {
    const t = T(ctx), items = shown(ctx).filter(item => !item.app), featured = shown(ctx).filter(item => item.kind === 'apps' || item.kind === 'games');
    const index = Math.max(0, Math.min(items.length - 1, ctx.carousel || 0)), cur = items[index];
    const tiles = items.map((item, i) => { const d = i - index; return Math.abs(d) > 2 ? '' : `<button class="gbmk-car-tile d${d < 0 ? 'm' : 'p'}${Math.abs(d)}" data-action="${d ? 'gbmk-carousel' : 'gbmk-detail'}" data-id="${d ? i : e(item.id)}">${promo(item)}</button>`; }).join('');
    const nav = [['gbmk-section', 'apps', 'apps', 'Apps'], ['gbmk-section', 'games', 'games', 'Games'], ['gbmk-my-apps', '', 'downloads', 'My apps']];
    const inner = `<div class="gbmk-carousel">${tiles}</div><div class="gbmk-car-snippet"><b>${e(cur?.name || '')}</b>${stars(cur?.rating || 0)}<em>${e(cur ? stateLabel(cur, ctx) : '')}</em></div><div class="gbmk-nav">${nav.map(([action, id, ic, label]) => `<button data-action="${action}"${id ? ` data-id="${id}"` : ''}><i class="${ic}"></i><span>${e(t(label))}</span></button>`).join('')}</div>`;
    return view('gbmk-home', `<div class="gbmk-scroll">${arc(ctx, 'home', t('Android Market'), inner)}<h3 class="gbmk-featured">${e(t('Featured'))}</h3><div class="gbmk-list">${featured.map(item => row(item, ctx)).join('')}</div></div>`);
  }
  // CategoriesWithAppsListActivity: the 168 dp arc with the carousel snippet, the categories with their featured apps.
  function section(ctx) {
    const t = T(ctx), id = ctx.section === 'games' ? 'games' : 'apps', label = id === 'games' ? 'Games' : 'Apps', items = shown(ctx).filter(item => item.kind === id);
    const lead = items.find(item => !item.app) || items[0];
    const inner = lead ? `<button class="gbmk-car-snippet small" data-action="gbmk-detail" data-id="${e(lead.id)}"><b>${e(lead.name)}</b>${stars(lead.rating)}<em>${e(stateLabel(lead, ctx))}</em></button>` : '';
    const cats = CATEGORIES[id].map(name => { const apps = items.filter(item => item.category === name); return `<button class="gbmk-cat" data-action="gbmk-category" data-id="${e(id + ':' + name)}"><b>${e(name)}</b><small>${e(apps.map(item => item.name).join(', '))}</small></button>`; }).join('');
    return view('gbmk-section', `<div class="gbmk-scroll">${arc(ctx, 'list', t(label), inner)}<div class="gbmk-list">${cats}</div></div>`);
  }
  // carousel_tabbed_app_browser: the 74 dp arc with the radio tabs, the list of the chosen tab.
  function category(ctx) {
    const t = T(ctx), [kind, name] = String(ctx.category || 'apps:').split(':'), tab = TABS.includes(ctx.tab) ? ctx.tab : 'Top paid';
    let items = shown(ctx).filter(item => item.kind === kind && (!name || item.category === name));
    items = tab === 'Top paid' ? items.filter(item => item.price !== 'FREE') : tab === 'Top free' ? items.filter(item => item.price === 'FREE') : [...items].reverse();
    const tabs = `<div class="gbmk-tabs">${TABS.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="gbmk-tab" data-id="${e(id)}">${e(t(id))}</button>`).join('')}</div>`;
    return view('gbmk-category', `${arc(ctx, 'tabs', name || t(kind === 'games' ? 'Games' : 'Apps'), tabs)}<div class="gbmk-scroll"><div class="gbmk-list">${items.length ? items.map(item => row(item, ctx)).join('') : `<p class="gbmk-empty">${e(t('No matching content in Android Market.'))}</p>`}</div></div>`);
  }
  const REVIEWS = [
    {author: 'Joseph', date: 'August 4, 2011', stars: 5, text: 'Exactly what I was looking for. Works great on my Nexus S.'},
    {author: 'Maria', date: 'July 23, 2011', stars: 4, text: 'Simple and pretty. Does what it says.'}
  ];
  // asset_info_section_header (details_header_gradient): the bold label and its line.
  const sectionHead = (title, line, action, id) => `<button class="gbmk-sec" data-action="${action || 'gbmk-noop'}"${id ? ` data-id="${e(id)}"` : ''}><b>${e(title)}</b>${line ? `<small>${e(line)}</small>` : ''}</button>`;
  function detail(ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (!item) return home(ctx);
    const state = installedState(item, ctx);
    let buttons;
    if (state === 'installed') buttons = `<button class="gbmk-fat-btn" data-action="gbmk-open" data-id="${e(item.id)}">${e(t('Open'))}</button><i></i><button class="gbmk-fat-btn" data-action="gbmk-uninstall-page" data-id="${e(item.id)}"${item.app ? ' disabled' : ''}>${e(t('Uninstall'))}</button>`;
    else if (state === 'downloading' || state === 'installing') buttons = `<span class="gbmk-fat-label">${e(t(state === 'installing' ? 'Installing…' : 'Downloading'))}</span><button class="gbmk-fat-btn" data-action="gbmk-cancel">${e(t('Cancel'))}</button>`;
    else buttons = `<button class="gbmk-fat-btn" data-action="gbmk-buy" data-id="${e(item.id)}">${e(item.price === 'FREE' ? t('Install') : `${t('Buy')} ${item.price}`)}</button>`;
    const fat = `<div class="gbmk-fat">${promo(item, 'gbmk-fat-promo')}<b class="gbmk-fat-title">${e(item.name)}</b><small class="gbmk-fat-author">${e(item.developer)}</small><div class="gbmk-fat-side">${buttons}<i></i>${stars(item.rating)}</div></div>`;
    const progress = state === 'downloading' || state === 'installing' ? `<div class="gbmk-progress-sec"><i class="gbmk-progress"><b style="width:${state === 'installing' ? 100 : Math.round(ctx.progress * 100)}%"></b></i><small>${e(state === 'installing' ? t('Installing…') : fmt(t('Downloading…')))}</small></div>` : '';
    const rated = ctx.rated?.[item.id] || 0;
    const review = state === 'installed' && !item.app ? `<button class="gbmk-myreview" data-action="gbmk-rate"><span class="gbmk-stars big">${[1, 2, 3, 4, 5].map(n => `<i class="${n <= rated ? 'on' : ''}"></i>`).join('')}</span><small>${e(t('Rate it!'))}</small></button>` : '';
    const auto = state === 'installed' && !item.app ? `<label class="gbmk-auto"><span>${e(t('Allow automatic updating'))}</span><input type="checkbox" data-gbmk-auto="${e(item.id)}"${ctx.autoUpdate.includes(item.id) ? ' checked' : ''}><img src="assets/gb-btn_check_${ctx.autoUpdate.includes(item.id) ? 'on' : 'off'}.png" alt=""></label>` : '';
    const desc = `<div class="gbmk-desc"><div class="gbmk-desc-head"><b>${e(t('Description'))}</b><p>${e(item.description || '')}</p></div><div class="gbmk-more"><i></i><button data-action="gbmk-noop">${e(t('More'))}</button></div><p class="gbmk-meta">${e(fmt(t('Version %1$s'), item.version || '1.0'))} · ${e(item.size || '')}</p><p class="gbmk-meta">${e(fmt(t('%1$s downloads'), item.downloads))}</p><p class="gbmk-meta">${e(fmt(t('Content rating: %1$s').replace(/<[^>]*>/g, ''), t(maturity(item))))}</p><div class="gbmk-shots">${[0, 1].map(n => `<span class="gbmk-shot n${n}" style="--a:${(item.colors || ['#2a3a4a', '#9fc33b'])[0]};--b:${(item.colors || ['#2a3a4a', '#9fc33b'])[1]}">${icon(item, 'gbmk-shot-icon')}</span>`).join('')}</div></div>`;
    const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete SD card contents']];
    const perms = `<div class="gbmk-perms"><p>${e(t('Allow this application to access:'))}</p><p>${groups.map(([g, p]) => `${e(t(g))} – ${e(t(p))}`).join('<br>')}</p><div class="gbmk-more light"><i></i><button data-action="gbmk-noop">${e(t('More'))}</button></div></div>`;
    const comments = `${sectionHead(t('Reviews'), t('The most recent reviews are shown here, touch More below to read all reviews.'))}${REVIEWS.map(r => `<div class="gbmk-comment"><div><b>${e(r.author)}</b><small>${e(r.date)}</small>${stars(r.stars)}</div><p>${e(r.text)}</p></div>`).join('')}`;
    const related = shown(ctx).filter(x => x.kind === item.kind && x.id !== item.id).slice(0, 2);
    const similar = `${sectionHead(t('Related'), t('The most relevant applications are shown here. Touch More below to see all related applications.'))}<div class="gbmk-list">${related.map(x => row(x, ctx)).join('')}</div>`;
    // AboutDeveloperSection (asset_info_simple_2_medium, then asset_info_simple_1_medium rows: View more applications,
    // Send email to developer, Visit the developer's web page; the storefront has no developer phone), ShareSection
    // (AssetInfoActivityController.handleShare: ACTION_SEND text/plain in a "Share via" chooser) and Market content
    // (Flag as inappropriate, a report to the server).
    const devRow = (action, label) => `<button class="gbmk-devrow" data-action="${action}" data-id="${e(item.id)}">${e(t(label))}</button>`;
    const more = `${sectionHead(t('Developer Info'), t('Learn more about the creator and designer.'))}${devRow('gbmk-dev-apps', 'View more applications')}${devRow('gbmk-dev-email', 'Send email to developer')}${devRow('gbmk-unavailable', "Visit the developer's web page")}${sectionHead(t('Sharing'), t('Let your friends know about this application.'), 'gbmk-share', item.id)}${sectionHead(t('Market content'), t('A chance to give us some feedback.'), 'gbmk-unavailable')}`;
    return view('gbmk-detail', `<div class="gbmk-scroll">${arc(ctx, 'fat', t('Market'), fat)}${progress}${review}${auto}${desc}${perms}${comments}${similar}${more}</div>`);
  }
  // confirm_permissions: the asset snippet (SlimFlatView), "Allow this application to access:" and the groups with the
  // ic_bullet_key_permission bullet, OK / Cancel on bottombar_portrait_565.
  const snippet = (item, ctx) => arc(ctx, 'flat snippet', '', `<div class="gbmk-snippet">${icon(item, 'gbmk-snip-icon')}<span><b>${e(item.name)}</b><small>${e(item.developer)}</small></span><span class="gbmk-snip-side"><em>${e(stateLabel(item, ctx))}</em>${stars(item.rating)}</span></div>`, true);
  function permissions(ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (!item) return home(ctx);
    const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete SD card contents']];
    return view('gbmk-perms-page', `${snippet(item, ctx)}<div class="gbmk-scroll gbmk-shadow"><p class="gbmk-perm-intro">${e(t('Allow this application to access:'))}</p>${groups.map(([g, p]) => `<div class="gbmk-perm"><i></i><span><b>${e(t(g))}</b><small>${e(t(p))}</small></span></div>`).join('')}</div><div class="gbmk-bottombar"><button data-action="gbmk-accept" data-id="${e(item.id)}">${e(t('OK'))}</button><button data-action="back">${e(t('Cancel'))}</button></div>`);
  }
  // UninstallActivity: the snippet, the reasons (uninstall_reason_*) and the button on bottombar_portrait_565.
  function uninstallPage(ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (!item) return home(ctx);
    const reasons = ["I don't use or want it.", 'I need more space on my phone.', "It's defective.", "It's malicious.", "I'd rather not say."];
    const pick = ctx.reason ?? 4;
    return view('gbmk-uninstall', `${snippet(item, ctx)}<div class="gbmk-scroll gbmk-shadow"><p class="gbmk-perm-intro">${e(t('Please tell us why you removed this item:'))}</p>${reasons.map((r, i) => `<button class="gbmk-reason" data-action="gbmk-reason" data-id="${i}" role="radio" aria-checked="${i === pick}"><img src="assets/gb-btn_radio_${i === pick ? 'on' : 'off'}.png" alt=""><span>${e(t(r))}</span></button>`).join('')}</div><div class="gbmk-bottombar"><button data-action="gbmk-uninstall" data-id="${e(item.id)}">${e(t('OK'))}</button></div>`);
  }
  // my_downloads_activity: SlimFlatView, "Currently downloading" and "Downloads" (section headers on #D0D0D0), Update all.
  function myApps(ctx) {
    const t = T(ctx), items = all().filter(item => !item.app && installedState(item, ctx) === 'installed').sort((a, b) => a.name.localeCompare(b.name));
    const dl = ctx.downloading ? find(ctx.downloading) : null;
    const body = (dl ? `<h3 class="gbmk-head">${e(t('Currently downloading'))}</h3><div class="gbmk-list">${row(dl, ctx)}</div>` : '') + (items.length ? `<h3 class="gbmk-head">${e(t('Downloads'))}</h3><div class="gbmk-list">${items.map(item => row(item, ctx)).join('')}</div>` : '');
    return view('gbmk-myapps', `${arc(ctx, 'flat', t('My apps'))}<div class="gbmk-scroll gbmk-shadow">${body || `<p class="gbmk-empty">${e(t('No downloads from Android Market.'))}</p>`}</div>`);
  }
  function search(ctx) {
    const t = T(ctx), q = String(ctx.query || '').trim(), lq = q.toLocaleLowerCase(ctx.locale), items = q ? shown(ctx).filter(item => `${item.name} ${item.developer}`.toLocaleLowerCase(ctx.locale).includes(lq)) : [];
    const none = `<div class="gbmk-noresults"><p>${e(fmt(t('There are no matches in Android Market for the search: ^1'), q).replace(/<[^>]*>/g, ''))}</p><b>${e(t('Suggestions:'))}</b>${['Make sure all words are spelled correctly.', 'Try different search words.', 'Try more general search words.'].map(s => `<p>${e(t(s))}</p>`).join('')}</div>`;
    return view('gbmk-results', `${arc(ctx, 'flat', q)}<div class="gbmk-scroll gbmk-shadow">${items.length ? `<div class="gbmk-list">${items.map(item => row(item, ctx)).join('')}</div>` : none}</div>`);
  }
  // settings_activity: Content filtering (the lock button and "Allow apps rated"), Notifications with its spinner.
  function settings(ctx) {
    const t = T(ctx), s = ctx.prefs;
    return view('gbmk-settings', `${arc(ctx, 'flat', t('settings'))}<div class="gbmk-scroll gbmk-shadow"><h3 class="gbmk-head">${e(t('Content filtering'))}</h3><p class="gbmk-set-text">${e(t('Set the content filtering level to restrict applications that can be downloaded.'))}</p><div class="gbmk-filter"><button class="gbmk-lock${s.pinCode ? '' : ' open'}" data-action="gbmk-pin" aria-label="${e(t(s.pinCode ? 'Change PIN' : 'Set PIN'))}"></button><button class="gbmk-spinner" data-action="gbmk-filter">${e(t('Allow apps rated'))}</button></div><h3 class="gbmk-head">${e(t('Notifications'))}</h3><p class="gbmk-set-text">${e(t('Choose whether to be notified if there are updates to apps or games that you have downloaded'))}</p><button class="gbmk-spinner wide" data-action="gbmk-notify">${e(t(s.notify === false ? 'Do not notify me' : 'Notify me'))}</button></div>`);
  }
  function searchDialog(ctx) {
    const t = T(ctx), q = String(ctx.editValue || '').trim().toLocaleLowerCase(ctx.locale);
    const sugg = q ? shown(ctx).filter(item => item.name.toLocaleLowerCase(ctx.locale).includes(q)).slice(0, 4) : ctx.history.slice(0, 4).map(h => ({id: '', name: h}));
    return `<div class="gbbr-search-scrim" data-action="gbmk-search-cancel"></div><form class="gbbr-search" data-form="gbmk-search"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/gbm234-ic_launcher_androidmarket.png" alt=""><input name="query" autocomplete="off" aria-label="${e(t('Search Android Market'))}" placeholder="${e(t('Search Android Market'))}" value="${e(ctx.editValue || '')}"><button class="gbbr-go" type="submit" aria-label="${e(t('Search'))}"><img src="assets/gb-ic_btn_search_go.png" alt=""></button></div>${sugg.length ? `<div class="gbbr-search-list">${sugg.map(s => `<button type="button" data-action="${s.id ? 'gbmk-detail' : 'gbmk-search-run'}" data-id="${e(s.id || s.name)}"><span>${e(s.name)}</span></button>`).join('')}</div>` : ''}</form>`;
  }
  function render(ctx) {
    let html;
    if (ctx.page === 'section') html = section(ctx);
    else if (ctx.page === 'category') html = category(ctx);
    else if (ctx.page === 'detail') html = detail(ctx);
    else if (ctx.page === 'permissions') html = permissions(ctx);
    else if (ctx.page === 'uninstall') html = uninstallPage(ctx);
    else if (ctx.page === 'my-apps') html = myApps(ctx);
    else if (ctx.page === 'search') html = search(ctx);
    else if (ctx.page === 'settings') html = settings(ctx);
    else html = home(ctx);
    return ctx.searching ? html.replace(/<\/div>$/, `${searchDialog(ctx)}</div>`) : html;
  }
  // res/menu/base.xml: Search, My apps, Settings, Help, Home (the details group adds Security / Clear my review).
  function menu(ctx) {
    const t = T(ctx);
    if (['permissions', 'uninstall', 'settings'].includes(ctx.page)) return [];
    const item = ctx.page === 'detail' ? find(ctx.selected) : null, owned = item && installedState(item, ctx) === 'installed';
    return [{action: 'gbmk-search', title: t('Search'), icon: 'ic_menu_search'}, {action: 'gbmk-my-apps', title: t('My apps'), icon: 'gbm234-ic_menu_my_downloads.png'}, {action: 'gbmk-settings', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'gbset-toast', id: 'This feature is not part of the simulator.', title: t('Help'), icon: 'ic_menu_help'},
      ...(ctx.page === 'home' ? [] : [{action: 'gbmk-home', title: t('Home'), icon: 'gbm234-ic_menu_home.png'}]),
      ...(item ? [{action: 'gbmk-security', title: t('Security'), icon: 'gbm234-ic_menu_security_setting.png'}] : []), ...(owned && ctx.rated?.[item.id] ? [{action: 'gbmk-clear-review', title: t('Clear my review'), icon: 'gbm234-ic_menu_clear_rating.png'}] : [])];
  }
  // GB AlertDialogs: the rating (set_rating: the stars and Unrated … Excellent!), Notifications and content filtering.
  function dialog(kind, ctx) {
    const t = T(ctx), item = find(ctx.selected);
    if (kind === 'rate' && item) {
      const r = ctx.rateDraft ?? ctx.rated?.[item.id] ?? 0, names = ['Unrated', 'Poor', 'Below average', 'Average', 'Above average', 'Excellent!'];
      return {title: t('Rate it!'), icon: 'gbm234-ic_dialog_rate.png', custom: `<div class="gbmk-setrating"><span>${[1, 2, 3, 4, 5].map(n => `<button class="${n <= r ? 'on' : ''}" data-action="gbmk-rate-pick" data-id="${n}" aria-label="${n}"></button>`).join('')}</span><p>${e(t(names[r]))}</p></div>`, buttons: [{action: 'gbmk-rate-ok', id: item.id, title: t('OK')}, {action: 'close-overlay', title: t('Cancel')}]};
    }
    if (kind === 'notify') return {title: t('Notifications'), choice: 'single', selected: ctx.prefs.notify === false ? 1 : 0, items: [{action: 'gbmk-notify-pick', id: 'on', title: t('Notify me')}, {action: 'gbmk-notify-pick', id: 'off', title: t('Do not notify me')}]};
    if (kind === 'filter') {
      const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], f = ctx.filterDraft || ctx.prefs.filter || levels;
      return {title: t('Allow apps rated'), choice: 'multi', items: levels.map(level => ({action: 'gbmk-filter-pick', id: level, title: t(level), checked: f.includes(level)})), buttons: [{action: 'gbmk-filter-ok', title: t('OK')}, {action: 'close-overlay', title: t('Cancel')}]};
    }
    // SettingsActivity.PinCodeAccessor's PinCodeDialog: Set PIN without one, Enter PIN before the filter or a new PIN
    // changes, then Change PIN; an empty Change PIN removes it.
    if (kind === 'pin-set' || kind === 'pin-enter' || kind === 'pin-change') {
      const [title, line] = {'pin-set': ['Set PIN', 'Set a numeric password (PIN) code to control changes to content filtering'], 'pin-enter': ['Enter PIN', 'Enter PIN to change content filtering'], 'pin-change': ['Change PIN', 'Change PIN that controls content filtering']}[kind];
      return {title: t(title), custom: `<p class="gbmk-pin-text">${e(t(line))}</p><input class="gbmk-pin" data-gbmk-pin type="password" inputmode="numeric" maxlength="8" autocomplete="off" aria-label="${e(t(title))}">`, buttons: [{action: 'gbmk-pin-ok', id: kind, title: t('OK')}, {action: 'close-overlay', title: t('Cancel')}]};
    }
    if (kind === 'share' && item) return {title: t('Share via'), items: [['email', 'Email'], ['messaging', 'Messaging']].map(([id, name]) => ({action: 'gbmk-share-to', id: `${id}|${item.id}`, title: ctx.t?.(name) || name, icon: `${id}.png`}))};
    if (kind === 'security' && item) {
      const groups = item.kind === 'games' ? [['Network communication', 'full Internet access'], ['Hardware controls', 'control vibrator']] : [['Network communication', 'full Internet access'], ['Storage', 'modify/delete SD card contents']];
      return {title: t('Security'), message: `${t('Allow this application to access:')}\n${groups.map(([g, p]) => `${t(g)} – ${t(p)}`).join('\n')}`, buttons: [{action: 'close-overlay', title: t('OK')}]};
    }
    return null;
  }
  window.GBMarket = {SECTIONS, TABS, EXTRA, VERSION, text, fmt, all, shown, maturity, developerEmail, packageName, find, installedState, render, menu, dialog};
})();
