/* Android 7.1.2 Chrome (Chrome 55.0.2883.91, app/Chrome of N2G48C), the app 'chrome'. Pages come from the offline web
   (ng-web.js). The logic is 6.0.1's (its chrome module) with Chrome 55's tabbed mode; the look and the behaviour are
   the image's layouts and the Chromium 55.0.2883.91 sources (ToolbarPhone, LocationBarLayout, OmniboxUrlEmphasizer,
   NewTabPageView / NewTabPageAdapter, AppMenuPropertiesDelegate, AppMenu, TabSwitcherDrawable, StackLayout, the first
   run's FirstRunActivity / AccountSigninView):
   - First run: fre_tosanduma.xml ("Welcome to Chrome" 24 sp #161616, fre_product_logo 120 dp, the terms with their two
     links, the usage statistics check box, the blue "Accept & continue"), then AccountFirstRunFragment (the device has
     a Google account): account_signin_view.xml's "Sign in to Chrome" on white over #fafafa, the account, NO THANKS /
     SIGN IN in the 52 dp button bar; signing in shows the confirmation ("Hi, <name>", Chrome Sync, Personalize Google
     services) with OK, GOT IT.
   - control_container.xml / toolbar.xml (ToolbarPhone): 56 dp in default_primary_color #f2f2f2 (incognito_primary_color
     #505050, the tab switcher's #14181c, transparent on the New Tab page) with toolbar_shadow under it; the location bar
     (textbox nine-patch, 8 dp in from the start and 8 dp from the top and bottom): omnibox_https_valid on a secure page
     and nothing on an http one (getSecurityIconResource on a phone), the 16 sp URL as OmniboxUrlEmphasizer colours it
     (https in google_green_700, the host #333333, the rest #80333333; http:// trimmed), ic_omnibox_magnifier,
     btn_delete_url and btn_mic while it is edited; the tab switcher button (btn_tabswitcher with TabSwitcherDrawable's
     count: sans-serif-condensed bold 12 dp, 10 dp from 10 tabs on, ":D" past 99, ";)" for incognito) and btn_menu
     (42 dp); the 2 dp ToolbarProgressBar in #4285f4 over #3d4386f7 while a page loads. The status bar stays black.
   - The New Tab page (NTPSnippets is on by default in 55, so NewTabPageView takes the cards UI and drops the bottom
     toolbar): new_tab_page_recycler_view.xml on #f2f2f2; above the fold new_tab_page_layout.xml: google_logo (116 dp, 26
     dp above, 23 dp under), the 48 dp search box (bg_ntp_search_box: white, 1 px #b26d6d6d, 1.5 dp corners, 12 dp in;
     the 16 sp #969696 hint, btn_mic), MostVisitedLayout (4 columns, 2 rows, most_visited_item.xml: 80 dp tiles, the
     48 dp icon — RoundedIconGenerator's letter on #787878, 4 dp corners, 20 dp text — and the 12 sp #6f6f6f two-line
     title) or most_visited_placeholder.xml; then the sections: "Articles for you" with new_tab_page_snippets_card.xml
     cards (ntp_card_single, 16 dp: the 16 sp #333333 headline, the 14 sp #646464 snippet, the 12 sp publisher and age,
     the 72 dp thumbnail) and "Recent bookmarks" (the bookmarks visited lately, or the status card: "Done for now",
     ntp_status_card_no_bookmarks), then new_tab_page_footer.xml ("Learn more about suggested content", 12 sp italic).
   - The app menu (main_menu.xml as AppMenuPropertiesDelegate.prepareMenu shows it on a phone; edge_menu_bg, 258 dp,
     48 dp rows, over the menu button): the icon row (Go forward — disabled without a page to go to —, Bookmark this
     page / btn_star_filled, View site information, Refresh / Stop), New tab, New incognito tab, Bookmarks, Recent tabs
     (not in incognito), History, Share… (not on chrome pages), Find in page (not on native pages), Add to Home screen
     (not on chrome pages nor in incognito), Request desktop site (checkable; not on chrome pages but the NTP),
     Settings, Help & feedback. Downloads and Download page stay hidden (DownloadsUi is off by default in 55). In the tab
     switcher the menu is OVERVIEW_MODE_MENU: New tab, New incognito tab, Close all tabs / Close incognito tabs, Settings.
   - The tab switcher (StackLayout on a phone): the cards on #14181c, each the page in tabswitcher_border_frame with its
     title bar (the favicon 16 dp, 13 sp title, btn_tab_close), at least min_spacing 120 dp or 26 % of the screen apart,
     the newest at the bottom; a card swiped sideways or its X closes the tab. The toolbar shows btn_new_tab_white and,
     with incognito tabs open, the btn_incognito_tabs / btn_normal_tabs toggle between the two stacks.
   - New incognito tab: new_tab_page_incognito.xml (incognito_splash, "You’ve gone incognito." 24 sp light #d2d2d2,
     the 14 sp #bdbdbd message, LEARN MORE in #03a9f4) on #222222; nothing visited there is remembered.
   - Native pages: Bookmarks (BookmarkActivity: the action bar in #f2f2f2 with the folder's name, bookmark_row_content
     rows: the 64 dp favicon column, the 16 sp #333333 title, btn_menu for Edit / Delete; the Mobile bookmarks folder),
     Recent tabs (recent_tabs_page.xml: the Recently closed group with recent_recently_closed and its 16 sp list items
     56 dp in, Show full history; the Other devices promo), History (chrome://history, the native pack's texts: Search
     history, Clear browsing data…, the visits by day, Remove from history).
   - An address the offline web does not have shows the network error page (the native pack's texts: "This site can’t
     be reached", the host's DNS address, Try: Checking the connection, DNS_PROBE_FINISHED_NXDOMAIN, RELOAD, DETAILS).
   - Find in page (find_in_page.xml), Add to Home screen (add_to_homescreen_dialog.xml; the shortcut's icon the letter
     tile), View site information (website_settings.xml: the URL, page_info_connection_*, Site Settings), Share
     (share_link_chooser_title). Settings: main_preferences (ng-appprefs.js). */
(() => {
  'use strict';
  const T = () => NG.text('chrome'), K = () => NG.text('chromepak');
  const A = n => `assets/cr-${n}.png`;
  const NTP = 'chrome-native://newtab/', BOOKMARKS = 'chrome-native://bookmarks/', RECENT = 'chrome-native://recent-tabs/', HISTORY = 'chrome://history/';
  // The simulator's demo bookmarks, as every version's browser: Google, Android and the Wikipedia article.
  const DEMO_BOOKMARKS = () => [NG.web.GOOGLE, NG.web.ANDROID, NG.web.WIKI];
  const H = 36e5, D = 864e5;
  const S = c => {
    const s = c.data.chrome || (c.data.chrome = {fre: 0, tabs: [{id: 1, history: [NTP], index: 0}], incTabs: [], cur: 1, curInc: 0, incognito: false, bookmarks: DEMO_BOOKMARKS(), visits: {}, log: [], closed: [], report: true, nextId: 2});
    return s;
  };
  const ui = c => c.ui.chrome || (c.ui.chrome = {editing: false, text: '', loading: 0, details: false, switcher: false, find: null, hq: ''});
  const esc = (c, s) => c.safe(s);
  const list = (c, inc = S(c).incognito) => inc ? S(c).incTabs : S(c).tabs;
  const tab = c => { const s = S(c), l = list(c); return l.find(x => x.id === (s.incognito ? s.curInc : s.cur)) || l.at(-1) || null; };
  const url = c => { const t = tab(c); return t ? t.history[t.index] : NTP; };
  const native = u => u.startsWith('chrome-native://') || u.startsWith('chrome://');
  const host = u => { const m = /^(\w+:\/\/)([^/]+)(.*)$/.exec(u); return m ? m : [u, '', u, '']; };
  const titleOf = (c, u) => u === NTP ? T().t(S(c).incognito ? 'accessibility_new_incognito_tab_page' : 'accessibility_new_tab_page') : u === BOOKMARKS ? T().t('bookmarks') : u === RECENT ? T().t('recent_tabs') : u === HISTORY ? K().t('history_title') : NG.web.page(u)?.title || host(u)[2];

  // ---- tabs --------------------------------------------------------------------------------------------------------
  function newTab(c, target = NTP, inc = S(c).incognito) {
    const s = S(c), t = {id: s.nextId++, history: [target], index: 0};
    (inc ? s.incTabs : s.tabs).push(t);
    s.incognito = inc; if (inc) s.curInc = t.id; else s.cur = t.id;
    record(c, target);
    return t;
  }
  function closeTab(c, id, inc) {
    const s = S(c), l = list(c, inc), i = l.findIndex(x => x.id === id); if (i < 0) return;
    const [t] = l.splice(i, 1);
    if (!inc && t.history[t.index] !== NTP) s.closed = [{url: t.history[t.index], title: titleOf(c, t.history[t.index]), time: Date.now()}, ...s.closed].slice(0, 5);
    const cur = inc ? s.curInc : s.cur;
    if (cur === id) { const next = l[Math.max(0, i - 1)]; if (inc) s.curInc = next?.id || 0; else s.cur = next?.id || 0; }
    // The last incognito tab gone, the switcher shows the normal stack.
    if (inc && !l.length) s.incognito = false;
  }
  function record(c, target) {
    const s = S(c), p = native(target) ? null : NG.web.page(target);
    if (!p || s.incognito) return;
    s.visits[p.url] = (s.visits[p.url] || 0) + 1;
    s.log = [...s.log, {url: p.url, title: p.title, time: Date.now()}].slice(-200);
  }
  function go(c, target, {replace = false} = {}) {
    const u = ui(c);
    if (!target) return;
    let t = tab(c);
    if (!t) t = newTab(c, NTP);
    const p = native(target) ? null : NG.web.page(target), real = p ? p.url : target;
    if (replace) t.history[t.index] = real; else { t.history = t.history.slice(0, t.index + 1); t.history.push(real); t.history = t.history.slice(-50); t.index = t.history.length - 1; }
    record(c, real);
    u.editing = false; u.details = false; u.find = null; u.loading = native(real) ? 0 : Date.now();
    c.save(); c.render();
    if (u.loading) setTimeout(() => { u.loading = 0; if (c.ui.view === 'chrome') c.render(); }, 700);
  }
  const mostVisited = c => { const v = S(c).visits; return Object.keys(v).sort((a, b) => v[b] - v[a]).slice(0, 8); };

  // ---- pieces --------------------------------------------------------------------------------------------------------
  const icon = (n, cls = '') => `<img class="ngcr-ic ${cls}" src="${A(n)}" alt="">`;
  // RoundedIconGenerator: the host's first letter on default_favicon_background_color, 4 dp corners, 20 dp text.
  const letter = u => (host(u)[2].replace(/^www\./, '')[0] || '?').toUpperCase();
  const tile = (c, u, cls = 'ngcr-mvicon') => `<span class="${cls}" aria-hidden="true">${esc(c, letter(u))}</span>`;
  const favicon = (c, u) => native(u) ? icon('default_favicon', 'ngcr-fav') : `<span class="ngcr-fav ngcr-favl" aria-hidden="true">${esc(c, letter(u))}</span>`;
  function tabCount(c, n) {
    const s = S(c), text = n <= 0 ? '' : n > 99 ? (s.incognito ? ';)' : ':D') : String(n);
    return `<span class="ngcr-count${n > 9 ? ' two' : ''}">${esc(c, text)}</span>`;
  }
  function buttons(c, light) {
    const t = T(), n = list(c).length;
    return `<span class="ngcr-tbtns"><button type="button" class="ngcr-tbtn ngcr-tabsw${light ? ' light' : ''}" data-action="ngcr-switcher" aria-label="${esc(c, t.t('accessibility_toolbar_btn_tabswitcher_toggle_default'))}"><i></i>${tabCount(c, n)}</button><button type="button" class="ngcr-tbtn ngcr-menubtn${light ? ' light' : ''}" data-action="ngcr-menu" aria-label="${esc(c, t.t('accessibility_toolbar_btn_menu'))}"><i></i></button></span>`;
  }
  // OmniboxUrlEmphasizer: https in google_green_700, the host emphasized, the rest not; http:// trimmed.
  function emphasized(c, u, light) {
    // A native page shows its chrome:// address.
    if (native(u)) return `<span class="ngcr-host">${esc(c, u.replace(/^chrome-native:/, 'chrome:').replace(/\/$/, ''))}</span>`;
    const [, scheme, h, rest] = host(u), secure = scheme === 'https://';
    const tail = rest === '/' ? '' : rest;
    return `${secure ? `<span class="ngcr-scheme">https</span><span class="ngcr-dim">://</span>` : ''}<span class="ngcr-host">${esc(c, h)}</span><span class="ngcr-dim">${esc(c, tail)}</span>`;
  }

  // ---- toolbar -----------------------------------------------------------------------------------------------------
  function toolbar(c) {
    const t = T(), u = ui(c), s = S(c), cur = url(c), inc = s.incognito;
    if (u.find) {
      return `<div class="ngcr-toolbar find"><input class="ngcr-findin" value="${esc(c, u.find.q)}" placeholder="${esc(c, t.t('hint_find_in_page'))}" autocomplete="off" spellcheck="false"><span class="ngcr-findcount">${u.find.q ? esc(c, u.find.n ? t.fmt('find_in_page_count', null, u.find.i + 1, u.find.n) : t.fmt('find_in_page_count', null, 0, 0)) : ''}</span><i class="ngcr-findsep"></i>
        <button type="button" class="ngcr-tbtn" data-action="ngcr-findprev" aria-label="${esc(c, t.t('accessibility_find_toolbar_btn_prev'))}"${u.find.n ? '' : ' disabled'}>${icon('ic_collapsed')}</button><button type="button" class="ngcr-tbtn" data-action="ngcr-findnext" aria-label="${esc(c, t.t('accessibility_find_toolbar_btn_next'))}"${u.find.n ? '' : ' disabled'}>${icon('ic_expanded')}</button><button type="button" class="ngcr-tbtn" data-action="ngcr-findclose" aria-label="${esc(c, t.t('close'))}">${icon('btn_close')}</button></div><i class="ngcr-shadow"></i>`;
    }
    if (u.switcher) {
      const toggle = s.incTabs.length ? `<button type="button" class="ngcr-tbtn" data-action="ngcr-model" aria-label="${esc(c, t.t(inc ? 'accessibility_tab_switcher_standard_stack' : 'accessibility_tab_switcher_incognito_stack'))}">${icon(inc ? 'btn_normal_tabs' : 'btn_incognito_tabs')}</button>` : '';
      return `<div class="ngcr-toolbar switcher"><button type="button" class="ngcr-tbtn ngcr-newtab" data-action="ngcr-newtab" aria-label="${esc(c, t.t(inc ? 'accessibility_toolbar_btn_new_incognito_tab' : 'accessibility_toolbar_btn_new_tab'))}">${icon('btn_new_tab_white_normal')}</button><span class="ngcr-fill"></span>${toggle}${buttons(c, true)}</div>`;
    }
    const isNtp = cur === NTP && !inc && !u.editing;
    let field;
    // LocationBarLayout.updateNavigationButton: a phone shows no navigation icon while the omnibox is edited.
    if (u.editing) field = `<form class="ngcr-form" data-form="ngcr-omnibox"><input class="ngcr-input" enterkeyhint="go" name="q" value="${esc(c, u.text)}" placeholder="${esc(c, t.t('search_or_type_url'))}" autocomplete="off" spellcheck="false" inputmode="url"></form>${u.text ? `<button type="button" class="ngcr-tbtn ngcr-del" data-action="ngcr-clear" aria-label="${esc(c, t.t('accessibility_toolbar_btn_delete_url'))}">${icon('btn_delete_url')}</button>` : `<button type="button" class="ngcr-tbtn ngcr-del" data-action="ngcr-voice" aria-label="${esc(c, t.t('accessibility_toolbar_btn_mic'))}">${icon('btn_mic')}</button>`}`;
    else if (cur === NTP) field = `<button type="button" class="ngcr-url empty" data-action="ngcr-edit">${esc(c, t.t('search_or_type_url'))}</button>`;
    else {
      const secure = /^https:/.test(cur) && !!NG.web.page(cur);
      field = `${secure ? `<button type="button" class="ngcr-tbtn ngcr-sec" data-action="ngcr-info" aria-label="${esc(c, t.t('accessibility_toolbar_btn_site_info'))}">${icon('omnibox_https_valid')}</button>` : ''}<button type="button" class="ngcr-url${secure ? '' : ' nosec'}" data-action="ngcr-edit"><span>${emphasized(c, cur)}</span></button>`;
    }
    const progress = u.loading ? '<i class="ngcr-progress"><i></i></i>' : '';
    return `<div class="ngcr-toolbar${inc ? ' incognito' : ''}${isNtp ? ' ntp' : ''}${u.editing ? ' editing' : ''}">${inc && !u.editing ? icon('ic_omnibox_incognito_badge', 'ngcr-badge') : ''}<div class="ngcr-loc np-cr-textbox">${field}</div>${u.editing ? '' : buttons(c, inc)}${progress}</div>${isNtp ? '' : '<i class="ngcr-shadow"></i>'}`;
  }
  // The omnibox's suggestions: what was typed (a search or the address), then the history's matches.
  function suggestions(c) {
    const u = ui(c), q = u.text.trim(), low = q.toLowerCase();
    if (!q) return '';
    const target = NG.web.normalize(q), isUrl = !/google\.com\/search/.test(target);
    const rows = [{icon: isUrl ? 'ic_omnibox_page' : 'ic_suggestion_magnifier', text: q, sub: '', url: target}];
    const seen = new Set([target]);
    for (const e of [...S(c).log].reverse()) { if (seen.has(e.url) || rows.length > 5) continue; if (`${e.title} ${e.url}`.toLowerCase().includes(low)) { seen.add(e.url); rows.push({icon: 'ic_suggestion_history', text: e.title, sub: e.url.replace(/^https?:\/\//, ''), url: e.url}); } }
    // SuggestionView: the type's icon, the text, the refine arrow that copies it into the omnibox.
    return `<div class="ngcr-suggest">${rows.map(r => `<div class="ngcr-srow"><button type="button" class="ngcr-sgo" data-action="ngcr-go" data-url="${esc(c, r.url)}">${icon(r.icon)}<span><b>${esc(c, r.text)}</b>${r.sub ? `<small>${esc(c, r.sub)}</small>` : ''}</span></button><button type="button" class="ngcr-refine" data-action="ngcr-refine" data-text="${esc(c, r.sub ? r.url : r.text)}" aria-hidden="true">${icon('btn_suggestion_refine')}</button></div>`).join('')}</div>`;
  }

  // ---- New Tab page ------------------------------------------------------------------------------------------------
  const ago = (c, time) => { const d = Date.now() - time, rtf = new Intl.RelativeTimeFormat(c.locale(), {numeric: 'auto'}); return d < H ? rtf.format(-Math.max(1, Math.round(d / 6e4)), 'minute') : d < D ? rtf.format(-Math.round(d / H), 'hour') : rtf.format(-Math.round(d / D), 'day'); };
  function ntp(c) {
    const t = T(), k = K(), mv = mostVisited(c);
    const tiles = mv.length ? `<div class="ngcr-mv">${mv.map(u => `<button type="button" class="ngcr-mvtile" data-action="ngcr-go" data-url="${esc(c, u)}">${tile(c, u)}<span class="ngcr-mvtitle">${esc(c, titleOf(c, u))}</span></button>`).join('')}</div>`
      : `<div class="ngcr-mvph"><img src="${A('default_favicon')}" alt="" hidden><b>${esc(c, t.t('most_visited_placeholder_title'))}</b><span>${esc(c, t.t('most_visited_placeholder_summary'))}</span></div>`;
    const card = a => `<button type="button" class="ngcr-card np-cr-ntp_card_single ngcr-snippet" data-action="ngcr-go" data-url="${esc(c, a.url)}"><span class="ngcr-stext"><b>${esc(c, a.title)}</b><span class="ngcr-ssnip">${esc(c, a.snippet || '')}</span><small>${esc(c, a.publisher)} - ${esc(c, ago(c, a.time))}</small></span>${a.hue != null ? NG.web.picture(a.hue, 'ngcr-thumb') : `<span class="ngcr-thumb">${tile(c, a.url, 'ngcr-bmicon')}</span>`}</button>`;
    // Recent bookmarks: the bookmarks visited lately (BookmarkSuggestionsProvider), newest first.
    const s = S(c), lastVisit = u => Math.max(0, ...s.log.filter(e => e.url === u).map(e => e.time));
    const recentBm = s.bookmarks.filter(u => lastVisit(u) > Date.now() - 7 * D).sort((a, b) => lastVisit(b) - lastVisit(a)).slice(0, 3).map(u => ({url: u, title: titleOf(c, u), publisher: host(u)[2], time: lastVisit(u)}));
    const status = body => `<div class="ngcr-card np-cr-ntp_card_single ngcr-status"><b>${esc(c, t.t('ntp_status_card_title_no_suggestions'))}</b><span>${esc(c, body)}</span></div>`;
    const learn = esc(c, t.t('ntp_learn_more_about_suggested_content')).replace(/&lt;link&gt;(.*?)&lt;\/link&gt;/, '<a>$1</a>');
    return `<div class="ngcr-ntp"><div class="ngcr-fold"><img class="ngcr-logo" src="${A('google_logo')}" alt="Google">
      <div class="ngcr-fakebox"><button type="button" class="ngcr-fakeinput" data-action="ngcr-edit">${esc(c, t.t('search_or_type_url'))}</button><button type="button" class="ngcr-mic" data-action="ngcr-voice" aria-label="${esc(c, t.t('accessibility_toolbar_btn_mic'))}">${icon('btn_mic')}</button></div>${tiles}</div>
      <div class="ngcr-shead">${esc(c, k.t('ntp_articles'))}</div>${NG.web.articles().map(card).join('')}
      <div class="ngcr-shead">${esc(c, k.t('ntp_bookmarks'))}</div>${recentBm.length ? recentBm.map(card).join('') : status(t.t('ntp_status_card_no_bookmarks'))}
      <div class="ngcr-foot">${learn}</div></div>`;
  }
  function incognitoPage(c) {
    const t = T();
    return `<div class="ngcr-incog"><img src="${A('incognito_splash')}" alt=""><h1>${esc(c, t.t('new_tab_incognito_header'))}</h1><p>${esc(c, t.t('new_tab_incognito_message'))}</p><button type="button" class="ngcr-learn" data-action="ngcr-help">${esc(c, t.t('learn_more'))}</button></div>`;
  }

  // ---- native pages ---------------------------------------------------------------------------------------------
  function bookmarksPage(c) {
    const t = T(), s = S(c), u = ui(c);
    const rows = s.bookmarks.map(b => `<div class="ngcr-bmrow"><button type="button" class="ngcr-bmlink" data-action="ngcr-go" data-url="${esc(c, b)}"><span class="ngcr-bmimg">${favicon(c, b)}</span><span class="ngcr-bmtitle">${esc(c, titleOf(c, b))}</span></button><button type="button" class="ngcr-tbtn ngcr-bmmore" data-action="ngcr-bmmore" data-url="${esc(c, b)}" aria-label="${esc(c, t.t('accessibility_toolbar_btn_menu'))}"><i></i></button></div>`).join('');
    return `<div class="ngcr-bmscreen"><div class="ngcr-bmbar"><button type="button" class="ngcr-tbtn" data-action="ngcr-bmclose" aria-label="${esc(c, t.t('bookmark_action_bar_close'))}">${icon('btn_close')}</button><span>${esc(c, K().t('mobile_bookmarks'))}</span></div><i class="ngcr-shadow static"></i>
      <div class="ngcr-bmlist">${rows || `<div class="ngcr-bmempty"><img src="${A('bookmark_logo_large')}" alt=""><span>${esc(c, t.t('bookmarks_folder_empty'))}</span></div>`}</div></div>`;
  }
  function recentPage(c) {
    const t = T(), s = S(c), u = ui(c), open = u.recentOpen ?? true;
    return `<div class="ngcr-page ngcr-native"><button type="button" class="ngcr-rgroup" data-action="ngcr-rtoggle">${icon('recent_recently_closed', 'ngcr-rdev')}<span><b>${esc(c, t.t('recently_closed'))}</b></span>${icon(open ? 'ic_expanded' : 'ic_collapsed', 'ngcr-rexp')}</button>
      ${open ? `${s.closed.map(e => `<button type="button" class="ngcr-ritem" data-action="ngcr-go" data-url="${esc(c, e.url)}">${favicon(c, e.url)}<span>${esc(c, e.title)}</span></button>`).join('')}<button type="button" class="ngcr-ritem more" data-action="ngcr-history">${esc(c, t.t('show_full_history'))}</button>` : ''}
      <div class="ngcr-rgroup static"><span><b>${esc(c, t.t('ntp_recent_tabs_sync_promo_title'))}</b></span></div><p class="ngcr-promo">${esc(c, t.t('ntp_recent_tabs_sync_promo_instructions'))}</p></div>`;
  }
  function historyPage(c) {
    const k = K(), s = S(c), u = ui(c), q = (u.hq || '').trim().toLowerCase();
    const log = [...s.log].reverse().filter(e => !q || `${e.title} ${e.url}`.toLowerCase().includes(q));
    const dayFmt = new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}), timeFmt = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'});
    let day = '', rows = '';
    for (const e of log) {
      const d = new Date(e.time), key = d.toDateString();
      if (key !== day) { day = key; rows += `<div class="ngcr-hday">${esc(c, key === new Date().toDateString() ? `${k.t('history_today')} - ${dayFmt.format(d)}` : dayFmt.format(d))}</div>`; }
      rows += `<div class="ngcr-hrow"><span class="ngcr-htime">${esc(c, timeFmt.format(d))}</span><button type="button" class="ngcr-hlink" data-action="ngcr-go" data-url="${esc(c, e.url)}">${favicon(c, e.url)}<span><b>${esc(c, e.title || e.url)}</b><small>${esc(c, host(e.url)[2])}</small></span></button><button type="button" class="ngcr-hdel" data-action="ngcr-hdel" data-time="${e.time}" aria-label="${esc(c, k.t('history_remove'))}">✕</button></div>`;
    }
    const device = esc(c, k.t('history_this_device').replace(/<a [^>]*>/, '\u0001').replace('</a>', '\u0002')).replace('\u0001', '<a>').replace('\u0002', '</a>');
    return `<div class="ngcr-page ngcr-native ngcr-hist"><div class="ngcr-hsearch"><input class="ngcr-hq" value="${esc(c, u.hq || '')}" placeholder="${esc(c, k.t('history_search'))}" autocomplete="off"></div>
      <div class="ngcr-hinfo">${device}</div><button type="button" class="ngcr-hclear" data-action="ngcr-hclear">${esc(c, k.t('history_clear'))}</button>${rows || `<div class="ngcr-hempty">${esc(c, k.t(q ? 'history_no_results' : 'history_none'))}</div>`}</div>`;
  }
  function errorPage(c, target) {
    const k = K(), u = ui(c), [, , h] = host(target);
    const dns = esc(c, k.t('neterror_dns').replace(/<[^>]+>/g, '\u0001')).split('\u0001').filter(Boolean);
    return `<div class="ngcr-page"><div class="ngcr-error"><img class="ngcr-eicon" src="${NG.chromePakImages?.generic || ''}" alt=""><h1>${esc(c, k.t('neterror_title'))}</h1><p><b>${esc(c, h)}</b>${dns.join('')}</p>
      ${u.details ? `<p>${esc(c, k.t('neterror_try'))}</p><ul><li>${esc(c, k.t('neterror_check_connection'))}</li></ul>` : ''}<p class="ngcr-ecode">DNS_PROBE_FINISHED_NXDOMAIN</p>
      <div class="ngcr-ebtns"><button type="button" class="ngcr-ereload" data-action="ngcr-reload">${esc(c, k.t('neterror_reload'))}</button><button type="button" class="ngcr-edetails" data-action="ngcr-details">${esc(c, k.t(u.details ? 'neterror_hide_details' : 'neterror_details'))}</button></div></div></div>`;
  }

  // ---- first run ---------------------------------------------------------------------------------------------------
  function fre(c) {
    const t = T(), s = S(c), acct = NG.account || {name: '', email: ''};
    if (s.fre === 0) {
      const tos = esc(c, t.t('fre_tos_and_privacy')).replace(/&lt;LINK1&gt;(.*?)&lt;\/LINK1&gt;/, '<a>$1</a>').replace(/&lt;LINK2&gt;(.*?)&lt;\/LINK2&gt;/, '<a>$1</a>');
      return `<div class="ngcr ngcr-fre"><div class="ngcr-frescroll"><h1>${esc(c, t.t('fre_welcome'))}</h1><img src="${A('fre_product_logo')}" alt=""><p>${tos}</p>
        <button type="button" class="ngcr-check" data-action="ngcr-report" role="checkbox" aria-checked="${s.report}"><i class="${s.report ? 'on' : ''}"></i><span>${esc(c, t.t('fre_send_report_check'))}</span></button></div>
        <div class="ngcr-frebar"><button type="button" class="ngcr-accept" data-action="ngcr-accept">${esc(c, t.t('fre_accept_continue'))}</button></div></div>`;
    }
    const avatar = `<span class="ngcr-acct" aria-hidden="true">${esc(c, (acct.name || acct.email || '?')[0].toUpperCase())}</span>`;
    if (s.fre === 1) return `<div class="ngcr ngcr-signin"><div class="ngcr-sscroll"><h1>${esc(c, t.t('sign_in_to_chrome'))}</h1><i class="ngcr-rule"></i><p>${esc(c, t.t('signin_account_choice_description'))}</p>
        <div class="ngcr-arow">${avatar}<span><b>${esc(c, acct.name)}</b><small>${esc(c, acct.email)}</small></span><i class="ngcr-radio on"></i></div></div>
        <div class="ngcr-sbar"><button type="button" class="ngcr-flat" data-action="ngcr-nothanks">${esc(c, t.t('fre_skip_text'))}</button><span class="ngcr-fill"></span><button type="button" class="ngcr-raised" data-action="ngcr-signin">${esc(c, t.t('choose_account_sign_in'))}</button></div></div>`;
    const settings = esc(c, t.t('signin_signed_in_settings_description')).replace(/&lt;LINK1&gt;(.*?)&lt;\/LINK1&gt;/, '<a>$1</a>');
    return `<div class="ngcr ngcr-signin"><div class="ngcr-sscroll"><div class="ngcr-chead">${avatar.replace('ngcr-acct', 'ngcr-acct big')}<h1>${esc(c, t.fmt('signin_hi_name', null, acct.name))}</h1><small>${esc(c, acct.email)}</small></div><i class="ngcr-rule"></i>
        <div class="ngcr-sitem">${icon('chrome_sync_logo')}<div><b>${esc(c, t.t('sync_confirmation_chrome_sync_title'))}</b><p>${esc(c, t.t('sync_confirmation_chrome_sync_message'))}</p></div></div><i class="ngcr-rule in"></i>
        <div class="ngcr-sitem">${icon('googleg')}<div><b>${esc(c, t.t('sync_confirmation_personalize_services_title'))}</b><p>${esc(c, t.t('sync_confirmation_personalize_services_body'))}</p></div></div><p class="ngcr-ssettings">${settings}</p></div>
        <div class="ngcr-sbar"><span class="ngcr-fill"></span><button type="button" class="ngcr-raised" data-action="ngcr-freok">${esc(c, t.t('signin_accept'))}</button></div></div>`;
  }

  // ---- the tab switcher ------------------------------------------------------------------------------------------
  function pageHtml(c, u, inc) {
    if (u === NTP) return inc ? incognitoPage(c) : ntp(c);
    if (u === RECENT) return recentPage(c);
    if (u === HISTORY) return historyPage(c);
    if (u === BOOKMARKS) return '';
    const p = NG.web.page(u);
    return p ? `<div class="ngcr-page"><div class="ngwb">${p.html}</div></div>` : errorPage(c, u);
  }
  function switcher(c) {
    const s = S(c), l = list(c), t = T();
    const cards = l.map((x, i) => { const u = x.history[x.index]; return `<div class="ngcr-tcard np-cr-tabswitcher_border_frame${s.incognito ? ' inc' : ''}" data-id="${x.id}" style="--i:${i}"><button type="button" class="ngcr-ttitle" data-action="ngcr-pick" data-id="${x.id}">${favicon(c, u)}<span>${esc(c, titleOf(c, u))}</span></button><button type="button" class="ngcr-tclose" data-action="ngcr-tclose" data-id="${x.id}" aria-label="${esc(c, t.t('accessibility_tabstrip_btn_close_tab'))}"><i></i></button>
      <button type="button" class="ngcr-tthumb" data-action="ngcr-pick" data-id="${x.id}" tabindex="-1"><span class="ngcr-tpage${s.incognito && u === NTP ? ' inc' : ''}">${pageHtml(c, u, s.incognito)}</span></button></div>`; }).join('');
    return `<div class="ngcr-stack" style="--n:${l.length}">${cards}</div>`;
  }

  function render(c) {
    consume(c);
    const s = S(c), u = ui(c);
    if (s.fre !== 2) return fre(c);
    if (u.switcher || !tab(c)) { u.switcher = true; return `<div class="ngcr switcher">${toolbar(c)}${switcher(c)}</div>`; }
    const cur = url(c), inc = s.incognito ? ' incognito' : '';
    if (cur === BOOKMARKS && !u.editing) return `<div class="ngcr">${bookmarksPage(c)}</div>`;
    if (u.editing) return `<div class="ngcr${inc}">${toolbar(c)}${suggestions(c)}</div>`;
    return `<div class="ngcr${inc}${cur === NTP && !s.incognito ? ' onntp' : ''}">${toolbar(c)}${pageHtml(c, cur, s.incognito)}</div>`;
  }

  // ---- the app menu -------------------------------------------------------------------------------------------------
  function menuMarkup(c) {
    const t = T(), s = S(c), u = ui(c), cur = url(c), tb = tab(c), chromePage = native(cur), nativePage = native(cur) || !NG.web.page(cur);
    const row = (action, key, extra = '', disabled = false) => `<button type="button" class="ngcr-mi" data-action="${action}"${disabled ? ' disabled' : ''}><span>${esc(c, t.t(key))}</span>${extra}</button>`;
    let items;
    if (u.switcher) {
      items = [row('ngcr-m-newtab', 'menu_new_tab'), row('ngcr-m-incognito', 'menu_new_incognito_tab'),
        s.incognito ? row('ngcr-m-closeinc', 'menu_close_all_incognito_tabs') : row('ngcr-m-closeall', 'menu_close_all_tabs', '', !s.tabs.length && !s.incTabs.length), row('ngcr-m-settings', 'menu_preferences')];
      return `<div class="ngcr-menuwrap"><div class="ngcr-menuout" data-action="ngcr-m-close"></div><div class="ngcr-pop np-cr-edge_menu_bg" role="menu">${items.join('')}</div></div>`;
    }
    const starred = s.bookmarks.includes(cur);
    const ic = (img, action, label, disabled = false) => `<button type="button" data-action="${action}" aria-label="${esc(c, label)}"${disabled ? ' disabled' : ''}>${icon(img)}</button>`;
    items = [row('ngcr-m-newtab', 'menu_new_tab'), row('ngcr-m-incognito', 'menu_new_incognito_tab'), row('ngcr-m-bookmarks', 'menu_bookmarks')];
    if (!s.incognito) items.push(row('ngcr-m-recent', 'menu_recent_tabs'));
    items.push(row('ngcr-m-history', 'menu_history'));
    if (!chromePage) items.push(row('ngcr-m-share', 'menu_share_page'));
    if (!nativePage) items.push(row('ngcr-m-find', 'menu_find_in_page'));
    if (!chromePage && !s.incognito) items.push(row('ngcr-m-homescreen', 'menu_add_to_homescreen'));
    if (!chromePage || cur === NTP) items.push(row('ngcr-m-desktop', 'menu_request_desktop_site', `<i class="ngcr-cb${tb?.desktop ? ' on' : ''}"></i>`));
    items.push(row('ngcr-m-settings', 'menu_preferences'), row('ngcr-m-help', 'menu_help'));
    return `<div class="ngcr-menuwrap"><div class="ngcr-menuout" data-action="ngcr-m-close"></div><div class="ngcr-pop np-cr-edge_menu_bg" role="menu"><div class="ngcr-icons">${ic('btn_right', 'ngcr-m-forward', t.t('accessibility_menu_forward'), !tb || tb.index >= tb.history.length - 1)}${ic(starred ? 'btn_star_filled' : 'btn_star', 'ngcr-m-star', t.t('accessibility_menu_bookmark'))}${ic('btn_info', 'ngcr-m-info', t.t('accessibility_menu_info'))}${ic(ui(c).loading ? 'btn_close' : 'btn_toolbar_reload', 'ngcr-m-reload', t.t(ui(c).loading ? 'accessibility_btn_stop_loading' : 'accessibility_btn_refresh'))}</div>${items.join('')}</div></div>`;
  }
  // WebsiteSettingsPopup: the URL, the connection, Site Settings.
  function siteInfo(c) {
    const t = T(), cur = url(c), key = native(cur) ? 'page_info_connection_internal_page' : /^https:/.test(cur) && NG.web.page(cur) ? 'page_info_connection_https' : 'page_info_connection_http';
    c.dialog({html: `<div class="ngcr-info"><div class="ngcr-iurl">${emphasized(c, cur)}</div><p>${esc(c, t.t(key))}</p></div>`,
      buttons: [{label: t.t('page_info_site_settings_button'), action: c => NG.openPrefs?.(c, 'chrome', 'site_settings_preferences', t.t('page_info_site_settings_button'))}]});
  }
  // AddToHomescreenDialog: the title to give the shortcut, then Add; the icon RoundedIconGenerator's letter tile.
  function homescreen(c) {
    const t = T(), cur = url(c), p = NG.web.page(cur); let title = p?.title || host(cur)[2];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="2" y="2" width="44" height="44" rx="4" fill="#787878"/><text x="24" y="24" dy=".35em" text-anchor="middle" font-family="Roboto,sans-serif" font-size="20" fill="#fff">${letter(cur)}</text></svg>`, iconUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    c.dialog({title: t.t('menu_add_to_homescreen'), html: `<div class="ngcr-hsrow"><img src="${iconUrl}" alt=""><input type="text" class="ngcr-hstitle" value="${esc(c, title)}" spellcheck="false"></div>`,
      mount(c, win) { const i = win.querySelector('.ngcr-hstitle'); i.addEventListener('input', () => { title = i.value.trim(); }); setTimeout(() => i.focus(), 50); },
      buttons: [{label: t.t('cancel')}, {label: t.t('add'), action: c => { const name = title || p?.title || cur; NG.launcherInstall?.(c, {type: 'shortcut', label: name, icon: iconUrl, target: {view: 'chrome', sub: `url:${cur}`}}); c.toast(t.fmt('added_to_homescreen', null, name)); }}]});
  }
  NG.register('chrome-menu', {
    app: false, render: menuMarkup,
    action(name, el, event, c) {
      const s = S(c), cur = url(c), u = ui(c), tb = tab(c);
      const close = () => c.closeOverlay();
      switch (name) {
        case 'ngcr-m-close': close(); return true;
        case 'ngcr-m-forward': close(); if (tb && tb.index < tb.history.length - 1) { tb.index++; c.save(); c.render(); } return true;
        case 'ngcr-m-star': close(); { const on = !s.bookmarks.includes(cur); s.bookmarks = on ? [...s.bookmarks, cur] : s.bookmarks.filter(x => x !== cur); c.save(); if (on) NG.snackbar?.(c, T().t('bookmark_page_saved')); } return true;
        case 'ngcr-m-info': close(); siteInfo(c); return true;
        case 'ngcr-m-reload': close(); if (u.loading) { u.loading = 0; c.render(); } else go(c, cur, {replace: true}); return true;
        case 'ngcr-m-newtab': close(); u.switcher = false; s.incognito = false; newTab(c, NTP, false); c.save(); c.render(); return true;
        case 'ngcr-m-incognito': close(); u.switcher = false; newTab(c, NTP, true); c.save(); c.render(); return true;
        case 'ngcr-m-closeall': close(); for (const x of [...s.tabs]) closeTab(c, x.id, false); s.incTabs = []; s.incognito = false; c.save(); c.render(); return true;
        case 'ngcr-m-closeinc': close(); s.incTabs = []; s.incognito = false; c.save(); c.render(); return true;
        case 'ngcr-m-bookmarks': close(); go(c, BOOKMARKS); return true;
        case 'ngcr-m-recent': close(); go(c, RECENT); return true;
        case 'ngcr-m-history': close(); go(c, HISTORY); return true;
        case 'ngcr-m-share': { close(); const p = NG.web.page(cur); NG.share?.(c, {title: T().t('share_link_chooser_title'), kind: 'text', subject: p?.title || '', text: cur}); return true; }
        case 'ngcr-m-find': close(); u.find = {q: '', i: 0, n: 0}; c.render(); return true;
        case 'ngcr-m-homescreen': close(); homescreen(c); return true;
        case 'ngcr-m-desktop': close(); if (tb) { tb.desktop = !tb.desktop; c.save(); } go(c, cur, {replace: true}); return true;
        case 'ngcr-m-settings': close(); NG.openPrefs?.(c, 'chrome', 'main_preferences', T().t('menu_preferences')); return true;
        case 'ngcr-m-help': close(); c.open('help', 'chrome'); return true;
      }
      return false;
    }
  });

  function consume(c) {
    const sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = '';
    // An address from another app (a shortcut, a link): a new tab in the normal model, past the first run.
    if (sub.startsWith('url:')) { const s = S(c), target = NG.web.normalize(sub.slice(4)), p = NG.web.page(target); s.fre = 2; ui(c).switcher = false; s.incognito = false; newTab(c, p ? p.url : target, false); c.save(); }
  }

  // A card of the switcher swiped sideways closes its tab (Stack's discard: 40 % of the width or a fling).
  function bindCards(c, root) {
    const s = S(c), dp = c.el.screen.clientWidth / (1440 / 3.5);
    for (const card of root.querySelectorAll('.ngcr-tcard')) {
      card.addEventListener('pointerdown', e => {
        if (e.button) return;
        const x0 = e.clientX, y0 = e.clientY, w = card.offsetWidth; let mode = '', last = [performance.now(), x0];
        const move = ev => {
          const dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!mode) { if (Math.hypot(dx, dy) < 8 * dp) return; mode = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; }
          if (mode !== 'x') return;
          ev.preventDefault(); last = [performance.now(), ev.clientX];
          card.style.translate = `${dx}px 0`; card.style.opacity = String(1 - Math.min(1, Math.abs(dx) / w) * .7);
        };
        const end = ev => {
          window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', end, true); window.removeEventListener('pointercancel', end, true);
          if (mode !== 'x') return;
          card.dataset.swiped = '1';
          const dx = ev.clientX - x0, v = (ev.clientX - last[1]) / Math.max(1, performance.now() - last[0]) * 1000 / dp;
          if (Math.abs(dx) > w * .4 || Math.abs(v) > 600) { closeTab(c, +card.dataset.id, s.incognito); c.save(); c.render(); }
          else { card.style.translate = ''; card.style.opacity = ''; setTimeout(() => delete card.dataset.swiped, 0); }
        };
        window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
      });
    }
  }


  // Chrome's Settings (Preferences: main_preferences and the fragments it opens). Saved passwords has no title until
  // the password manager has run; sign-in shows when the first run did not sign in. The site settings categories take
  // their titles and default states (getCategorySummary: Allowed, Blocked, Ask first) from ContentSettingsResources.
  const SITE = {cookies: ['cookies_title', 'website_settings_category_allowed'], device_location: ['website_settings_device_location', 'website_settings_category_ask'],
    camera: ['website_settings_use_camera', 'website_settings_category_ask'], microphone: ['website_settings_use_mic', 'website_settings_category_ask'],
    notifications: ['push_notifications_permission_title', 'website_settings_category_ask'], javascript: ['javascript_permission_title', 'website_settings_category_allowed'],
    popups: ['popup_permission_title', 'website_settings_category_blocked'], background_sync: ['background_sync_permission_title', 'website_settings_category_allowed'],
    fullscreen: ['website_settings_fullscreen', 'website_settings_category_allowed'], protected_content: ['protected_content', 'website_settings_category_ask'],
    autoplay: ['autoplay_title', 'website_settings_category_allowed']};
  if (NG.appPrefsHooks) NG.appPrefsHooks.chrome = {
    fragments: {'PrivacyPreferences': 'privacy_preferences', 'AccessibilityPreferences': 'accessibility_preferences',
      'SiteSettingsPreferences': 'site_settings_preferences', 'AutofillPreferences': 'autofill_preferences',
      'DataReductionPreferences': 'data_reduction_preferences_off', 'AboutChromePreferences': 'about_chrome_preferences',
      'HomepagePreferences': 'homepage_preferences', 'TranslatePreferences': 'translate_preferences',
      'DoNotTrackPreference': 'do_not_track_preferences', 'UsageAndCrashReportsPreferenceFragment': 'usage_and_crash_reports_preferences',
      'ContextualSearchPreferenceFragment': 'contextual_search_preferences'},
    hide: (c, key) => key === 'saved_passwords' || (key === 'sign_in' && S(c).signedIn) || key === 'all_sites' || key === 'use_storage' || key === 'usb',
    title: (c, key) => SITE[key] ? NG.text('appprefs').t(`Chrome/${SITE[key][0]}`) : undefined,
    summary(c, key) {
      const a = NG.text('appprefs');
      if (SITE[key]) return a.t(`Chrome/${SITE[key][1]}`);
      if (key === 'search_engine') return 'Google';
      if (key === 'data_reduction') return a.t('Chrome/text_off');
      if (key === 'homepage') return a.t('Chrome/text_off');
      return undefined;
    },
    click(c, key) { if (key === 'sign_in') { c.open('chrome'); S(c).fre = 1; return true; } return false; }
  };

  NG.register('chrome', {
    // ChromeActivity leaves the status bar black on the default theme.
    statusColor: () => '#000',
    page: c => NG.page('chrome', S(c).fre !== 2 ? `fre${S(c).fre}` : ui(c).switcher ? 'switcher' : url(c) === BOOKMARKS ? 'bookmarks' : ''),
    render,
    mount(c, root) {
      const u = ui(c);
      const input = root.querySelector('.ngcr-input');
      if (input) {
        input.addEventListener('input', () => { u.text = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.ngcr-input'); i2?.focus(); i2?.setSelectionRange(pos, pos); });
        if (document.activeElement !== input) { input.focus(); if (!u.typed) input.select(); }
        u.typed = true;
      } else u.typed = false;
      const page = root.querySelector('.ngcr-page, .ngcr-ntp'); if (page && !u.loading && !u.find) page.scrollTop = 0;
      // NewTabPageView.updateSearchBoxOnScroll: once the search box reaches the toolbar, the toolbar shows its own.
      const ntpEl = root.querySelector('.ngcr > .ngcr-ntp'), bar = root.querySelector('.ngcr-toolbar.ntp'), box = root.querySelector('.ngcr-fakebox');
      if (ntpEl && bar && box) ntpEl.addEventListener('scroll', () => bar.classList.toggle('scrolled', ntpEl.scrollTop > box.offsetTop - bar.offsetHeight), {passive: true});
      const hq = root.querySelector('.ngcr-hq');
      if (hq) hq.addEventListener('input', () => { const p = hq.selectionStart; u.hq = hq.value; c.render(); const g = c.el.viewport.querySelector('.ngcr-hq'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
      if (root.querySelector('.ngcr-stack')) {
        bindCards(c, root);
        // The stack opens scrolled to the current tab.
        const st = root.querySelector('.ngcr-stack'), curCard = st.querySelector(`.ngcr-tcard[data-id="${S(c).incognito ? S(c).curInc : S(c).cur}"]`);
        if (curCard) st.scrollTop = Math.max(0, curCard.offsetTop - st.clientHeight * .2);
      }
      // Find in page: the matches in the page's text marked, the current one scrolled to.
      const fin = root.querySelector('.ngcr-findin');
      if (fin && u.find) {
        fin.addEventListener('input', () => { const p = fin.selectionStart; u.find.q = fin.value; u.find.i = 0; c.render(); const g = c.el.viewport.querySelector('.ngcr-findin'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
        fin.addEventListener('keydown', e => { if (e.key === 'Enter' && u.find.n) { e.preventDefault(); u.find.i = (u.find.i + 1) % u.find.n; c.render(); c.el.viewport.querySelector('.ngcr-findin')?.focus(); } });
        if (document.activeElement !== fin) setTimeout(() => fin.focus(), 40);
        const doc = root.querySelector('.ngcr-page .ngwb'), q = u.find.q.toLowerCase(), hits = [];
        if (doc && q) {
          const walk = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT), nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
          for (const n of nodes) {
            const text = n.nodeValue, low = text.toLowerCase(); let at = low.indexOf(q); if (at < 0) continue;
            const frag = document.createDocumentFragment(); let lastI = 0;
            while (at >= 0) { frag.append(text.slice(lastI, at)); const m = document.createElement('mark'); m.className = 'ngcr-hit'; m.textContent = text.slice(at, at + q.length); frag.append(m); hits.push(m); lastI = at + q.length; at = low.indexOf(q, lastI); }
            frag.append(text.slice(lastI)); n.replaceWith(frag);
          }
        }
        if (u.find.n !== hits.length) {
          u.find.n = hits.length; if (u.find.i >= hits.length) u.find.i = 0;
          const cnt = root.querySelector('.ngcr-findcount'); if (cnt) cnt.textContent = q ? T().fmt('find_in_page_count', null, hits.length ? u.find.i + 1 : 0, hits.length) : '';
          root.querySelectorAll('[data-action="ngcr-findprev"],[data-action="ngcr-findnext"]').forEach(b => { b.disabled = !hits.length; });
        }
        const curHit = hits[u.find.i]; if (curHit) { curHit.classList.add('cur'); curHit.scrollIntoView({block: 'center'}); }
      }
    },
    submit(form, event, c) {
      const name = form.dataset.form;
      if (name === 'ngcr-omnibox') { go(c, NG.web.normalize(form.elements.q.value)); return true; }
      if (name === 'ngcr-search') { const q = form.elements.q.value.trim(); if (q) go(c, `${NG.web.GOOGLE}search?q=${encodeURIComponent(q).split('%20').join('+')}`); return true; }
      return false;
    },
    back(c) {
      const u = ui(c), s = S(c), tb = tab(c);
      if (s.fre === 1) { s.fre = 0; c.render(); return true; }
      if (s.fre !== 2) return false;
      if (u.editing) { u.editing = false; c.render(); return true; }
      if (u.find) { u.find = null; c.render(); return true; }
      if (u.switcher) { if (tab(c)) { u.switcher = false; c.render(); return true; } return false; }
      if (tb && tb.index > 0) { tb.index--; u.loading = 0; c.save(); c.render(); return true; }
      // At the start of its history a tab opened from another app closes; an incognito tab closes too.
      if (tb && s.incognito) { closeTab(c, tb.id, true); c.save(); c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), s = S(c);
      switch (name) {
        case 'ngcr-accept': s.fre = NG.account ? 1 : 2; c.save(); c.render(); return true;
        case 'ngcr-report': s.report = !s.report; c.save(); c.render(); return true;
        case 'ngcr-nothanks': case 'ngcr-freok': s.fre = 2; c.save(); c.render(); return true;
        case 'ngcr-signin': s.fre = 3; s.signedIn = true; c.save(); c.render(); return true;
        case 'ngcr-edit': u.editing = true; u.typed = false; u.text = url(c) === NTP || native(url(c)) ? '' : url(c); c.render(); return true;
        case 'ngcr-refine': u.text = el.dataset.text; c.render(); { const i = c.el.viewport.querySelector('.ngcr-input'); i?.focus(); i?.setSelectionRange(i.value.length, i.value.length); } return true;
        case 'ngcr-clear': u.text = ''; c.render(); c.el.viewport.querySelector('.ngcr-input')?.focus(); return true;
        case 'ngcr-go': go(c, el.dataset.url); return true;
        case 'ngcr-menu': c.overlay('chrome-menu'); return true;
        case 'ngcr-voice': c.open('google', 'voice'); return true;
        case 'ngcr-info': siteInfo(c); return true;
        case 'ngcr-help': c.open('help', 'chrome'); return true;
        case 'ngcr-switcher': u.switcher = !u.switcher; u.editing = false; u.find = null; if (!u.switcher && !tab(c)) u.switcher = true; c.render(); return true;
        case 'ngcr-newtab': u.switcher = false; newTab(c, NTP, s.incognito); c.save(); c.render(); return true;
        case 'ngcr-model': s.incognito = !s.incognito; c.save(); c.render(); return true;
        case 'ngcr-pick': if (el.closest('.ngcr-tcard')?.dataset.swiped) return true; if (s.incognito) s.curInc = +el.dataset.id; else s.cur = +el.dataset.id; u.switcher = false; c.save(); c.render(); return true;
        case 'ngcr-tclose': closeTab(c, +el.dataset.id, s.incognito); c.save(); c.render(); return true;
        case 'ngcr-bmclose': if (!this.back(c)) c.back(); return true;
        case 'ngcr-bmmore': {
          const target = el.dataset.url, t = T();
          c.menu([{label: t.t('bookmark_item_delete'), action: c => { s.bookmarks = s.bookmarks.filter(x => x !== target); c.save(); c.render(); }}], el);
          return true;
        }
        case 'ngcr-rtoggle': u.recentOpen = !(u.recentOpen ?? true); c.render(); return true;
        case 'ngcr-history': go(c, HISTORY); return true;
        case 'ngcr-hdel': s.log = s.log.filter(e => e.time !== +el.dataset.time); c.save(); c.render(); return true;
        case 'ngcr-hclear': NG.openPrefs?.(c, 'chrome', 'privacy_preferences', T().t('menu_preferences')); return true;
        case 'ngcr-findclose': u.find = null; c.render(); return true;
        case 'ngcr-findnext': case 'ngcr-findprev': if (u.find?.n) { u.find.i = (u.find.i + (name === 'ngcr-findnext' ? 1 : -1) + u.find.n) % u.find.n; c.render(); } return true;
        case 'ngcr-reload': go(c, url(c), {replace: true}); return true;
        case 'ngcr-details': u.details = !u.details; c.render(); return true;
      }
      return false;
    }
  });
})();
