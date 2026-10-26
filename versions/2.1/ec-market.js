/* Android 2.1 Android Market 1.71 (Vending.apk, ERE27; Theme.Light) with the simulator's own storefront (the catalog
   the other versions sell: the phone's apps by "Android Demo" and a few made-up games and tools), offline.
   - AssetBrowserActivity (home.xml): title.xml on title_bar_med_market (ic_market_bag, market_android_logo over the
     42 dp "market", btn_square with ic_search_square_button), nav_3buttons.xml (Apps | Games | Downloads on btn_strip
     with btn_strip_divider, bold textColorSecondary), then the list under title_bar_shadow: the promoted category
     (promoted_category.xml: PromotedCategoryView 274 x 94 dp, 30 dp down, three apps in promo_frame_left / middle /
     right on bg_promotion_main, the category in 18 dp white at its right edge, the subcategory under it), "Featured"
     (featured_list_header.xml on market_header) and asset_list_snippet.xml rows (the 48 dp icon 7 dp in, the title in
     bold textAppearanceMedium, the author, the price or state in bold and the small rating at the right).
   - Apps / Games (CategoriesWithAppsListActivity, categories_with_apps.xml): title_category.xml (36 dp "apps" /
     "games"), the PromotedAppViewSwitcher (bg_promotion_app, a 92 x 75 dp promo_frame with the app, its description)
     and categories_with_apps_list_item.xml rows (the category in bold, its apps under it). A category opens
     TabbedAppBrowser (title_subcategory.xml: "apps" 21 dp over the category 18 dp; the TabWidget of tab_indicator.xml:
     btn_strip with btn_strip_mark_on / _off and Top paid / Top free / Just in).
   - AssetInfoActivity (asset_info.xml): asset_snippet.xml (65 dp on title_bar_med_market: icon, white bold title with a
     #cc222222 shadow, author, price and rating), the sections (the download progress, My review "Rate it!", the
     description with "Version 1.2   2.4 MB", the downloads / ratings header, Comments, About the developer, Market
     content: Flag as inappropriate) and info_buttons_bar on bottombar_portrait_565 (Install, Buy, Open, Uninstall,
     Cancel download, two thirds wide between spacers). Install asks AssetPermissionsSubActivity first
     (confirm_permissions.xml: "This application has access to the following:", OK / Cancel), then "Starting
     download…", "Downloading…" with "^1%   ^2/^3", "Installing…" and the notification "Successfully installed".
   - MyDownloadsActivity (title_my_downloads.xml "downloads"), search ("Search Android Market"; no results:
     search_no_results.xml), menu (res/menu/base.xml: Search, Downloads, Help, Home; Security, Cancel download, Clear my
     review on the details).
   Paid items cannot be bought here (no Google Checkout account): "This feature is not part of the simulator.". */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const M = () => EC.text('market');
  const t = k => M().t(k);
  const F = () => EC.text('framework');
  // The storefront (the same items as the other versions' Market / Play Store).
  const NET = ['permgrouplab_network', 'permlab_createNetworkSockets'], SD = ['permgrouplab_storage', 'permlab_sdcardWrite'], CAL = ['permgrouplab_personalInfo', 'permlab_readCalendar'];
  const CATALOG = [
    {id: 'camera', app: 'camera', kind: 'apps', category: 'Multimedia', developer: 'Android Demo', rating: 4.6, size: '2.4 MB', description: 'Capture a little piece of your day.'},
    {id: 'orbit', kind: 'games', category: 'Arcade & Action', name: 'Orbit Hopper', developer: 'Moonlight Studio', rating: 4.8, size: '12 MB', price: '', description: 'A small adventure among the stars.', art: 'orbit', perms: [NET, SD]},
    {id: 'browser', app: 'browser', kind: 'apps', category: 'Communication', developer: 'Android Demo', rating: 4.3, size: '3.1 MB', description: 'Explore a small world of offline sample pages.'},
    {id: 'blocks', kind: 'games', category: 'Brain & Puzzle', name: 'Pixel Blocks', developer: 'Pocket Pixels', rating: 4.5, size: '8.6 MB', price: '', description: 'Bright blocks, simple shapes, endless possibilities.', art: 'blocks', perms: [NET]},
    {id: 'music', app: 'music', kind: 'apps', category: 'Multimedia', developer: 'Android Demo', rating: 4.4, size: '4.2 MB', description: 'Your soundtrack for a quiet afternoon.'},
    {id: 'calendar', app: 'calendar', kind: 'apps', category: 'Productivity', developer: 'Android Demo', rating: 4.2, size: '1.8 MB', description: 'Make room for the things that matter.'},
    {id: 'clock', app: 'clock', kind: 'apps', category: 'Tools', developer: 'Android Demo', rating: 4.1, size: '1.2 MB', description: 'A familiar clock and alarms for your day.'},
    {id: 'calculator', app: 'calculator', kind: 'apps', category: 'Tools', developer: 'Android Demo', rating: 4.7, size: '0.8 MB', description: 'Everyday sums and scientific discoveries.'},
    {id: 'lunar-golf', kind: 'games', category: 'Arcade & Action', name: 'Lunar Golf', developer: 'Crater Games', rating: 4.4, price: '$0.99', size: '9.8 MB', description: 'Eighteen holes in low gravity.', art: 'golf', perms: [NET]},
    {id: 'pocket-planner', kind: 'apps', category: 'Productivity', name: 'Pocket Planner', developer: 'Quiet Tools', rating: 4.3, price: '$1.99', size: '1.6 MB', description: 'Plan your week on one simple page.', art: 'planner', perms: [CAL]}
  ].map((x, i) => ({downloads: ['250,000 - 1,000,000', '50,000 - 250,000', '10,000 - 50,000', '5,000 - 10,000'][i % 4], votes: 120 + i * 47, version: `1.${i}.${(i * 3) % 7}`, ...x}));
  // The server's categories of the time (Market sends them; not part of the APK).
  const CATEGORIES = {
    apps: ['Comics', 'Communication', 'Entertainment', 'Finance', 'Health', 'Lifestyle', 'Multimedia', 'News & Weather', 'Productivity', 'Reference', 'Shopping', 'Social', 'Sports', 'Themes', 'Tools', 'Travel'],
    games: ['Arcade & Action', 'Brain & Puzzle', 'Cards & Casino', 'Casual']
  };
  const ICONS = {
    orbit: '<svg viewBox="0 0 48 48"><defs><radialGradient id="mko" cx=".35" cy=".3"><stop offset="0" stop-color="#ffd27a"/><stop offset="1" stop-color="#d0631e"/></radialGradient></defs><rect x="2" y="2" width="44" height="44" rx="9" fill="#152049"/><circle cx="24" cy="24" r="9" fill="url(#mko)"/><ellipse cx="24" cy="24" rx="17" ry="6" fill="none" stroke="#9fb4ff" stroke-width="2" transform="rotate(-20 24 24)"/></svg>',
    blocks: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2b2b2b"/><g stroke="#0006"><rect x="8" y="26" width="10" height="10" fill="#ff5a4e"/><rect x="18" y="26" width="10" height="10" fill="#ffc533"/><rect x="28" y="26" width="10" height="10" fill="#4ec2ff"/><rect x="18" y="16" width="10" height="10" fill="#6ddc5a"/></g></svg>',
    golf: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#0c1022"/><circle cx="24" cy="40" r="20" fill="#b9bfd0"/><path d="M28 30V10l9 4-9 4" fill="#e04848" stroke="#ddd" stroke-width="1.2"/><circle cx="16" cy="24" r="2.4" fill="#fff"/></svg>',
    planner: '<svg viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="9" fill="#2a6fbd"/><rect x="10" y="12" width="28" height="26" rx="2" fill="#fff"/><rect x="10" y="12" width="28" height="7" rx="2" fill="#e8453c"/><path d="M17 29l4 4 9-9" fill="none" stroke="#2a6fbd" stroke-width="3"/></svg>'
  };
  const nameOf = x => x.app ? EC.apps.label(x.app) : x.name;
  const icon = (x, cls = '') => x.app ? `<img class="${cls}" src="assets/app-${x.app}.png" alt="">` : `<span class="${cls} ecmk-svg">${ICONS[x.art]}</span>`;
  const find = id => CATALOG.find(x => x.id === id);
  const st = c => c.data.market ||= {installed: [], ratings: {}, notify: true, flagged: []};
  let job = null;   // the download in progress: {id, phase: 'pending' | 'downloading' | 'installing', pct}
  const stateOf = (c, x) => job?.id === x.id ? job.phase : x.app || st(c).installed.includes(x.id) ? 'installed' : '';
  const priceText = (c, x) => { const s = stateOf(c, x); return s === 'installed' ? t('installed') : s ? t(s === 'installing' ? 'installing' : 'downloading') : x.price || t('asset_free_label'); };
  // RatingBar (ratingBarStyleSmall: rate_star_small_on / _half / _off, 0.5 steps).
  const stars = (rating, size = 'small') => `<span class="ecmk-stars ${size}">${[1, 2, 3, 4, 5].map(n => `<img src="assets/fw-rate_star_${size}_${rating >= n ? 'on' : rating >= n - .5 ? 'half' : 'off'}.png" alt="">`).join('')}</span>`;
  const search = c => c.searchDialog({icon: 'app-market.png', hint: t('search_hint'), value: '', onGo: q => { if (q.trim()) { c.ui.mkStack.push({page: 'search', query: q.trim()}); c.render(); } }});
  const searchButton = () => '<button type="button" class="ecmk-search" data-action="ecmk-search"><img class="bg" src="assets/mk-btn_square_normal.png" alt=""><img class="bgp" src="assets/mk-btn_square_pressed.png" alt=""><img class="ic" src="assets/mk-ic_search_square_button.png" alt=""></button>';
  const bag = '<img class="ecmk-bag" src="assets/mk-ic_market_bag_normal.png" alt="">';
  const top = c => c.ui.mkStack.at(-1);
  const push = (c, page) => { c.ui.mkStack.push(page); c.render(); c.el.viewport.querySelector('.ecmk-list')?.scrollTo(0, 0); };

  // asset_list_snippet.xml
  const row = (c, x) => `<button type="button" class="ecmk-row" data-action="ecmk-open" data-id="${x.id}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>
    ${icon(x, 'ecmk-thumb')}<span class="ecmk-rtext"><span class="ecmk-rtitle">${esc(nameOf(x))}</span><span class="ecmk-rauthor">${esc(x.developer)}</span></span>
    <span class="ecmk-rright"><span class="ecmk-rprice">${esc(priceText(c, x))}</span>${stars(x.rating)}</span></button><i class="ecmk-div"></i>`;
  // PromotedCategoryView: three of the category's apps framed on bg_promotion_main.
  function promotedCategory(c) {
    const cat = 'Arcade & Action', items = CATALOG.filter(x => x.kind === 'games').slice(0, 3);
    return `<button type="button" class="ecmk-pcat" data-action="ecmk-category" data-kind="games" data-cat="${esc(cat)}"><span class="ecmk-pcat-frames">${items.map((x, i) => `<span class="ecmk-pframe np-mk-promo_frame_${['left', 'middle', 'right'][i]}_normal">${icon(x)}</span>`).join('')}</span>
      <span class="ecmk-pcat-name">${esc(t('games'))}</span><span class="ecmk-pcat-sub">${esc(cat)}</span></button>`;
  }
  function header(c, size, text, sub) {
    return `<div class="ecmk-title npp-mk-title_bar_med_market ${size}"><i class="ec-bg np-mk-title_bar_med_market"></i>${bag}${size === 'home' ? '<img class="ecmk-logo" src="assets/mk-market_android_logo.png" alt="">' : ''}
      <span class="ecmk-ttext">${esc(text)}</span>${sub ? `<span class="ecmk-tsub">${esc(sub)}</span>` : ''}${searchButton()}</div>`;
  }
  function renderHome(c) {
    const nav = [['apps', t('apps')], ['games', t('games')], ['downloads', t('my_downloads_short_title')]].map(([id, label], i) => `${i ? '<img class="ecmk-ndiv" src="assets/mk-btn_strip_divider.9.png" alt="">' : ''}<button type="button" class="ecmk-nav" data-action="ecmk-nav" data-id="${id}"><i class="ec-bg np-mk-btn_strip_normal"></i><i class="ec-bg ec-pressed np-mk-btn_strip_pressed"></i><span>${esc(label)}</span></button>`).join('');
    const featured = CATALOG.filter((x, i) => i % 2 === 0 || x.kind === 'games');
    return `<div class="ecmk">${header(c, 'home', t('market_title_lowercase'))}<div class="ecmk-navbar">${nav}</div>
      <div class="ecmk-frame"><div class="ecmk-list">${promotedCategory(c)}<div class="ecmk-fhead npp-mk-market_header"><i class="ec-bg np-mk-market_header"></i><span>${esc(t('featured_str'))}</span></div>${featured.map(x => row(c, x)).join('')}</div><img class="ecmk-shadow" src="assets/mk-title_bar_shadow.9.png" alt=""></div></div>`;
  }
  // CategoriesWithAppsListActivity
  function renderKind(c, kind) {
    const promo = CATALOG.filter(x => x.kind === kind)[c.ui.mkPromo % CATALOG.filter(x => x.kind === kind).length || 0];
    const rows = CATEGORIES[kind].map(cat => {
      const apps = CATALOG.filter(x => x.kind === kind && x.category === cat).map(nameOf).join(', ');
      return `<button type="button" class="ecmk-cat" data-action="ecmk-category" data-kind="${kind}" data-cat="${esc(cat)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span class="ecmk-clabel">${esc(cat)}</span><span class="ecmk-capps">${esc(apps)}</span></button><i class="ecmk-div"></i>`;
    }).join('');
    return `<div class="ecmk">${header(c, 'category', t(`${kind}_lowercase`))}<div class="ecmk-frame"><div class="ecmk-list">
      <button type="button" class="ecmk-papp" data-action="ecmk-open" data-id="${promo.id}"><span class="ecmk-pframe np-mk-promo_frame_normal">${icon(promo)}</span><span class="ecmk-pdesc">${esc(promo.description)}</span></button>${rows}</div><img class="ecmk-shadow" src="assets/mk-title_bar_shadow.9.png" alt=""></div></div>`;
  }
  // TabbedAppBrowser
  function renderCategory(c, page) {
    const tabs = [['paid', 'top_paid'], ['free', 'top_free'], ['new', 'whats_new']], tab = page.tab || 'free';
    let items = CATALOG.filter(x => x.kind === page.kind && x.category === page.cat);
    if (tab === 'paid') items = items.filter(x => x.price); else if (tab === 'free') items = items.filter(x => !x.price).sort((a, b) => b.rating - a.rating); else items = [...items].reverse();
    const tabBar = tabs.map(([id, key]) => `<button type="button" class="ecmk-tab${id === tab ? ' on' : ''}" data-action="ecmk-tab" data-id="${id}"><i class="ec-bg np-mk-btn_strip_normal"></i><i class="ec-bg ec-pressed np-mk-btn_strip_pressed"></i><img src="assets/mk-btn_strip_mark_${id === tab ? 'on' : 'off'}.png" alt=""><span>${esc(t(key))}</span></button>`).join('');
    const body = items.length ? items.map(x => row(c, x)).join('') : `<div class="ecmk-empty">${esc(t('asset_list_no_items'))}</div>`;
    return `<div class="ecmk">${header(c, 'sub', t(`${page.kind}_lowercase`), page.cat)}<div class="ecmk-tabs">${tabBar}</div><div class="ecmk-frame"><div class="ecmk-list">${body}</div><img class="ecmk-shadow tabbed" src="assets/mk-title_bar_shadow.9.png" alt=""></div></div>`;
  }
  // asset_snippet.xml
  const snippet = (c, x) => `<div class="ecmk-snippet npp-mk-title_bar_med_market"><i class="ec-bg np-mk-title_bar_med_market"></i>${icon(x, 'ecmk-sthumb')}<span class="ecmk-stext"><span class="ecmk-stitle">${esc(nameOf(x))}</span><span class="ecmk-sauthor">${esc(x.developer)}</span></span>
    <span class="ecmk-sright"><span class="ecmk-sprice">${esc(stateOf(c, x) === 'installed' ? '' : x.price || t('asset_free_label'))}</span>${stars(x.rating)}</span></div>`;
  const section = text => `<div class="ecmk-shead npp-mk-market_header"><i class="ec-bg np-mk-market_header"></i><span>${esc(text)}</span></div>`;
  const simple = (action, text) => `<button type="button" class="ecmk-simple" data-action="${action}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><span>${esc(text)}</span></button><i class="ecmk-div"></i>`;
  function renderDetails(c, page) {
    const x = find(page.id), s = stateOf(c, x), mine = st(c).ratings[x.id];
    const progress = job?.id === x.id ? `<div class="ecmk-progress">${progressBar()}</div>` : '';
    const review = s === 'installed' && !x.app ? `<button type="button" class="ecmk-review" data-action="ecmk-rate"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i>${mine ? stars(mine, 'med') : ''}<span>${esc(mine ? t('info_my_review') : t('info_rate_it'))}</span></button><i class="ecmk-div"></i>` : '';
    const ratings = M().plural('info_ratercount_label', x.votes, c.lang, String(x.votes));
    const body = `${progress}${review}<div class="ecmk-desc"><div class="ecmk-dtext">${esc(x.description)}</div><div class="ecmk-dver">${esc(M().fmt('info_version_size', c.lang, x.version, x.size))}</div></div>
      <div class="ecmk-dlhead npp-mk-market_header"><i class="ec-bg np-mk-market_header"></i><span>${esc(M().fmt('info_downloadcount_label', c.lang, x.downloads))}</span><span>${esc(ratings)}</span></div>
      ${section(t('info_comments_label'))}<div class="ecmk-nocomments">${esc(t('nocomments'))}</div>
      ${section(t('developer_label'))}${simple('ecmk-dev-apps', t('view_applications_label'))}${simple('ecmk-dev-web', t('view_website_label'))}${simple('ecmk-dev-mail', t('send_email_label'))}
      ${section(t('market_content_label'))}${simple('ecmk-flag', t('flagging_title'))}`;
    // AssetInfoActivity.setUpButtons
    const buttons = s === 'installed' ? [['ecmk-launch', 'launch'], ...(x.app ? [] : [['ecmk-uninstall', 'uninstall']])]
      : s ? [['ecmk-cancel', 'cancel_download']] : [[x.price ? 'ecmk-buy' : 'ecmk-install', x.price ? 'buy' : 'install']];
    return `<div class="ecmk">${snippet(c, x)}<div class="ecmk-frame"><div class="ecmk-list">${body}</div><img class="ecmk-shadow detail" src="assets/mk-title_bar_shadow.9.png" alt=""></div>
      <div class="ecmk-bbar">${buttons.map(([a, k]) => `<button type="button" class="ecui-button" data-action="${a}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t(k))}</span></button>`).join('')}</div></div>`;
  }
  // download_progress.xml: the horizontal bar (indeterminate while starting) and "^1%   ^2/^3".
  function progressBar() {
    if (!job) return '';
    const x = find(job.id), total = parseFloat(x.size) * (x.size.includes('MB') ? 1024 : 1), done = Math.round(total * job.pct / 100);
    const kb = n => n >= 1024 ? `${(n / 1024).toFixed(1)}MB` : `${n}KB`;
    const status = job.phase === 'pending' ? t('download_pending') : job.phase === 'installing' ? t('installing')
      : M().t('download_progress_size').replace('^1', job.pct).replace('^2', kb(done)).replace('^3', kb(total)).replace(/<\/?b>/g, '');
    return `<span class="ecmk-bar${job.phase === 'downloading' ? '' : ' indeterminate'}"><i style="width:${job.pct}%"></i></span><span class="ecmk-bstatus">${esc(status)}</span>`;
  }
  // AssetPermissionsSubActivity (confirm_permissions.xml)
  function renderPermissions(c, page) {
    const x = find(page.id), perms = x.perms || [];
    const list = perms.length ? perms.map(([g, p]) => `<div class="ecmk-perm"><b>${esc(t(g))}</b><span>${esc(t(p))}</span></div>`).join('') : `<div class="ecmk-perm"><span>${esc(t('no_permissions'))}</span></div>`;
    return `<div class="ecmk">${snippet(c, x)}<div class="ecmk-frame"><div class="ecmk-list"><div class="ecmk-pdescr">${esc(t('security_settings_desc'))}</div>${list}</div></div>
      <div class="ecmk-bbar">${[['ecmk-perm-ok', 'ok'], ['ecmk-perm-cancel', 'cancel']].map(([a, k]) => `<button type="button" class="ecui-button" data-action="${a}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(t(k))}</span></button>`).join('')}</div></div>`;
  }
  // MyDownloadsActivity
  function renderDownloads(c) {
    const s = st(c), mine = CATALOG.filter(x => s.installed.includes(x.id) && job?.id !== x.id), now = job ? [find(job.id)] : [];
    const body = !mine.length && !now.length ? `<div class="ecmk-empty">${esc(t('empty_downloads'))}</div>`
      : `${now.length ? section(t('downloading_section')) + now.map(x => row(c, x)).join('') : ''}${mine.length ? section(t('my_downloads_section')) + mine.map(x => row(c, x)).join('') : ''}`;
    return `<div class="ecmk">${header(c, 'downloads', t('my_downloads_title_lowercase'))}<div class="ecmk-list">${body}</div><img class="ecmk-shadow" src="assets/mk-title_bar_shadow.9.png" alt=""></div></div>`;
  }
  function renderSearch(c, page) {
    const q = page.query.toLocaleLowerCase(), items = CATALOG.filter(x => `${nameOf(x)} ${x.developer} ${x.category}`.toLocaleLowerCase().includes(q));
    const body = items.length ? items.map(x => row(c, x)).join('')
      : `<div class="ecmk-noresults"><div class="ecmk-nrtitle">${esc(t('search_no_assets').replace('^1', page.query).replace(/<\/?b>/g, ''))}</div><b>${esc(t('search_suggestions_title'))}</b>${[1, 2, 3].map(n => `<div class="ecmk-nrs">• ${esc(t(`search_suggestion${n}`))}</div>`).join('')}</div>`;
    return `<div class="ecmk">${header(c, 'sub', t('search_label'), M().plural('search_complete_title', items.length, c.lang, items.length, page.query))}<div class="ecmk-frame"><div class="ecmk-list">${body}</div><img class="ecmk-shadow tabbed" src="assets/mk-title_bar_shadow.9.png" alt=""></div></div>`;
  }

  // ---- the download (Market's downloader, then the package installer) ----
  let jobTimer = 0;
  function startDownload(c, x) {
    job = {id: x.id, phase: 'pending', pct: 0};
    c.toast(t('asset_browser_download_initiated'));
    const tick = () => {
      if (!job) return;
      if (job.phase === 'pending') job.phase = 'downloading';
      else if (job.phase === 'downloading') { job.pct = Math.min(100, job.pct + 17); if (job.pct >= 100) job.phase = 'installing'; }
      else if (job.phase === 'installing') {
        st(c).installed.push(job.id); c.save();
        c.notify?.({icon: 'mk-stat_sys_install_complete.png', title: nameOf(x), text: t('notification_installation_success_message'), ticker: M().fmt('notification_installation_success_status', c.lang, nameOf(x)), view: 'market', sub: `details:${x.id}`});
        job = null;
      }
      if (c.ui.view === 'market') c.render();
      if (job) jobTimer = setTimeout(tick, job.phase === 'installing' ? 1500 : 700);
    };
    jobTimer = setTimeout(tick, 1000);
    c.render();
  }
  function rateDialog(c, x) {
    const s = st(c), names = ['unrated', 'poor', 'below_average', 'average', 'above_average', 'excellent'];
    let v = s.ratings[x.id] || 0;
    const html = () => `<div class="ecmk-rate"><span class="ecmk-rstars">${[1, 2, 3, 4, 5].map(n => `<button type="button" data-action="ecmk-star" data-n="${n}"><img src="assets/fw-rate_star_big_${v >= n ? 'on' : 'off'}.png" alt=""></button>`).join('')}</span><span class="ecmk-rname">${esc(t(names[v]))}</span></div>`;
    c.dialog({title: t('rate_it'), icon: 'mk-ic_dialog_rate.png', html: html(),
      action(name, el, event, c2) { if (name !== 'ecmk-star') return false; v = Number(el.dataset.n); el.closest('.ecui-custom-inner').innerHTML = html(); return true; },
      buttons: [{label: t('ok'), action: () => { if (v) s.ratings[x.id] = v; c.save(); c.render(); }}, {label: t('cancel')}]});
  }

  EC.register('market', {
    title: 'Market',
    render(c) {
      const p = top(c);
      if (!p) return renderHome(c);
      switch (p.page) {
        case 'kind': return renderKind(c, p.kind);
        case 'category': return renderCategory(c, p);
        case 'details': return renderDetails(c, p);
        case 'permissions': return renderPermissions(c, p);
        case 'downloads': return renderDownloads(c);
        case 'search': return renderSearch(c, p);
      }
      return renderHome(c);
    },
    action(name, el, event, c) {
      const p = top(c), x = p?.id && find(p.id);
      switch (name) {
        case 'ecmk-search': search(c); return true;
        case 'ecmk-nav': push(c, el.dataset.id === 'downloads' ? {page: 'downloads'} : {page: 'kind', kind: el.dataset.id}); return true;
        case 'ecmk-category': push(c, {page: 'category', kind: el.dataset.kind, cat: el.dataset.cat, tab: 'free'}); return true;
        case 'ecmk-tab': p.tab = el.dataset.id; c.render(); return true;
        case 'ecmk-open': push(c, {page: 'details', id: el.dataset.id}); return true;
        case 'ecmk-install': push(c, {page: 'permissions', id: x.id}); return true;
        case 'ecmk-perm-ok': c.ui.mkStack.pop(); startDownload(c, x); return true;
        case 'ecmk-perm-cancel': c.ui.mkStack.pop(); c.render(); return true;
        case 'ecmk-buy': c.toast(c.t('This feature is not part of the simulator.')); return true;
        case 'ecmk-cancel': clearTimeout(jobTimer); job = null; c.render(); return true;
        case 'ecmk-launch':
          if (x.app) { c.open(x.app); return true; }
          c.dialog({title: t('notlaunched_title'), icon: 'fw-ic_dialog_alert.png', message: M().fmt('notlaunched', c.lang, nameOf(x)), buttons: [{label: t('ok')}]});
          return true;
        case 'ecmk-uninstall':
          c.dialog({title: t('uninstall_application'), icon: null, message: M().fmt('uninstall_application_text_non_refund', c.lang, nameOf(x)),
            buttons: [{label: t('ok'), action: () => { const s = st(c); s.installed = s.installed.filter(id => id !== x.id); delete s.ratings[x.id]; c.save(); c.render(); c.toast(t('uninstalling')); }}, {label: t('cancel')}]});
          return true;
        case 'ecmk-rate': rateDialog(c, x); return true;
        case 'ecmk-dev-apps': push(c, {page: 'search', query: x.developer}); return true;
        case 'ecmk-dev-web': c.ui.browserGo = `http://www.google.com/search?q=${encodeURIComponent(x.developer)}`; c.open('browser'); return true;
        // An email to the developer (mailto:) opens Gmail's compose.
        case 'ecmk-dev-mail': c.open('gmail'); c.ui.gmDraft = {to: '', subject: nameOf(x), body: '', cc: false, quoted: ''}; c.ui.gmScreen = 'compose'; c.render(); return true;
        case 'ecmk-flag': {
          const reasons = ['flag_sexual_content', 'flag_graphic_violence', 'flag_hateful_content', 'flag_harmful_to_device', 'flag_other_objection'];
          c.dialog({title: t('flagging_title'), icon: null, items: reasons.map(t), choice: 'single', checked: -1,
            buttons: [{label: t('submit'), action: () => c.toast(t('content_flagged'))}, {label: t('cancel')}]});
          return true;
        }
      }
      return false;
    },
    menu(c) {
      const p = top(c), x = p?.page === 'details' && find(p.id);
      const items = [{label: t('search'), icon: 'fw-ic_menu_search.png', action: () => search(c)},
        {label: t('my_stuff'), icon: 'mk-ic_menu_my_downloads.png', action: () => push(c, {page: 'downloads'})},
        {label: t('help_and_info'), icon: 'fw-ic_menu_help.png', action: () => { c.ui.browserGo = 'http://www.google.com/support/android/'; c.open('browser'); }},
        ...(p ? [{label: t('home'), icon: 'mk-ic_menu_home.png', action: () => { c.ui.mkStack = []; c.render(); }}] : [])];
      if (x) {
        if (x.perms) items.push({label: t('security_settings_menu'), icon: 'mk-ic_menu_security_setting.png', action: () => push(c, {page: 'permissions', id: x.id, view: true})});
        if (job?.id === x.id) items.push({label: t('cancel_download'), icon: 'mk-ic_menu_stop.png', action: () => { clearTimeout(jobTimer); job = null; c.render(); }});
        if (st(c).ratings[x.id]) items.push({label: t('clear_my_review'), icon: 'mk-ic_menu_clear_rating.png', action: () => { delete st(c).ratings[x.id]; c.save(); c.render(); }});
      }
      c.menu(items);
      return true;
    },
    search(c) { search(c); return true; },
    back(c) {
      if (c.ui.mkStack?.length) { c.ui.mkStack.pop(); c.render(); return true; }
      return false;
    }
  });
  // The promoted app cycles (PromotedAppViewSwitcher.getPromoRefreshPeriodMs).
  setInterval(() => { const c = EC.context; if (c?.ui.view === 'market' && top(c)?.page === 'kind') { c.ui.mkPromo = (c.ui.mkPromo || 0) + 1; c.render(); } }, 6000);
  document.addEventListener('DOMContentLoaded', () => {
    const c = EC.context, open = c.open;
    c.ui.mkStack = []; c.ui.mkPromo = 0;
    c.open = (view, sub, opts) => {
      const fresh = c.ui.view !== 'market' && view === 'market';
      if (fresh) c.ui.mkStack = sub?.startsWith('details:') ? [{page: 'details', id: sub.slice(8)}] : [];
      return open(view, fresh ? '' : sub, opts);
    };
  });
})();
