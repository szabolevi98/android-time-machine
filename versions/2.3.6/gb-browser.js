/* Android 2.3.6 Browser (packages/apps/Browser): the TitleBar (title_bar.xml on search_plate_browser with the
   progress bar, favicon, title and the bookmarks / stop button), the framework SearchDialog used to type an address,
   browser_find.xml, CombinedBookmarkHistoryActivity (Bookmarks thumbnails, Most visited, History), ActiveTabsPage
   ("Windows") and the options / context menus. hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-browser.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.browser), text = (lang, key) => R.t(key, lang);
  const FAVICON = 'assets/gb-br-app_web_browser_sm.png';
  const favicon = () => `<span class="gbbr-fav"><img src="${FAVICON}" alt=""></span>`;
  // TabControl.MAX_TABS in 2.3.
  const MAX_TABS = 8;

  function titleBar(ctx) {
    const loading = ctx.loading;
    const right = loading ? `<button class="gbbr-stop" data-action="gbbr-stop" aria-label="${e(text(ctx.lang, 'stop'))}"><img src="assets/gb-br-ic_btn_stop_v2.png" alt=""></button>` : `<button class="gbbr-rt" data-action="browser-bookmarks" aria-label="${e(text(ctx.lang, 'bookmarks'))}"><img src="assets/gb-br-ic_btn_bookmarks.png" alt=""></button>`;
    return `<div class="gbbr-titlebar${loading ? ' gbbr-loading' : ''}"><div class="gbbr-progress"${loading ? '' : ' hidden'}><i></i></div><div class="gbbr-row"><button class="gbbr-title" data-action="gbbr-edit">${favicon()}<span>${e(loading ? ctx.url : ctx.title)}</span></button>${right}</div></div>`;
  }
  // SearchDialog (search_bar.xml): search_plate_global, the app icon, textfield_search, the go and voice buttons and the
  // suggestions from bookmarks and history.
  function searchDialog(ctx) {
    const T = key => text(ctx.lang, key);
    return `<div class="gbbr-search-scrim" data-action="gbbr-edit-cancel"></div><form class="gbbr-search" data-form="address"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/gb-br-ic_launcher_browser.png" alt=""><input name="address" autocomplete="off" aria-label="${e(T('search_hint'))}" placeholder="${e(T('search_hint'))}" value="${e(ctx.editValue)}"><button class="gbbr-go" type="submit" aria-label="${e(T('goto_dot'))}"><img src="assets/gb-ic_btn_search_go.png" alt=""></button><button class="gbbr-voice" type="button" data-action="gbset-toast" data-id="This feature is not part of the simulator." aria-label="Voice search"><img src="assets/gb-ic_btn_speak_now.png" alt=""></button></div><div class="gbbr-suggest">${suggestions(ctx)}</div></form>`;
  }
  function suggestions(ctx) {
    const q = String(ctx.editValue || '').trim().toLowerCase();
    if (!q || q === String(ctx.url).toLowerCase()) return '';
    const seen = new Set(), rows = [];
    for (const [url, icon] of [...ctx.bookmarks.map(u => [u, 'bookmark']), ...[...ctx.history].reverse().map(u => [u, 'history'])]) {
      if (seen.has(url) || !(url.toLowerCase().includes(q) || ctx.titleOf(url).toLowerCase().includes(q))) continue;
      seen.add(url); rows.push(`<button type="button" class="gbbr-suggestion" data-action="browser-bookmark" data-id="${e(url)}"><img src="assets/gb-br-ic_search_category_${icon}.png" alt=""><span><b>${e(ctx.titleOf(url))}</b><small>${e(url)}</small></span></button>`);
      if (rows.length >= 4) break;
    }
    return rows.join('');
  }
  function findBar(ctx) {
    const T = key => text(ctx.lang, key);
    return `<form class="gbbr-find" data-form="browser-find"><button type="button" data-action="gbbr-find-step" data-id="-1" aria-label="Previous"><img src="assets/gb-br-ic_btn_find_prev.png" alt=""></button><button type="button" data-action="gbbr-find-step" data-id="1" aria-label="Next"><img src="assets/gb-br-ic_btn_find_next.png" alt=""></button><input name="query" aria-label="${e(T('find_dot'))}" placeholder="${e(T('find_dot'))}" value="${e(ctx.find)}"><span class="web-find-count gbbr-matches" aria-live="polite"></span><button type="button" data-action="browser-close-find" aria-label="Close"><img src="assets/gb-br-ic_btn_close_panel.png" alt=""></button></form>`;
  }
  function page(ctx, content) {
    return `<div class="app-view gbbr" data-no-translate>${titleBar(ctx)}<div class="browser-page gbbr-page">${content}</div>${ctx.find !== undefined ? findBar(ctx) : ''}${ctx.editing ? searchDialog(ctx) : ''}</div>`;
  }

  // CombinedBookmarkHistoryActivity (grid cells are divs: the page thumbnail holds forms and buttons): framework tab indicators, then BrowserBookmarksPage (grid of bookmark_thumbnail with
  // the "Add" holder over the current page first), MostVisited and BrowserHistoryPage (history_item rows with stars).
  function library(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.sub;
    const tabs = [['bookmarks', 'tab_bookmarks', 'bookmarks'], ['mostvisited', 'tab_most_visited', 'most_visited'], ['history', 'tab_history', 'history']];
    const head = `<div class="gbp-tabs gbbr-tabs" role="tablist">${tabs.map(([id, label, icon]) => `<button class="gbp-tab${tab === id ? ' selected' : ''}" role="tab" aria-selected="${tab === id}" data-action="gbbr-library" data-id="${id}"><img src="assets/gb-br-ic_tab_${icon}_${tab === id ? 'selected' : 'unselected'}.png" alt=""><span>${e(T(label))}</span></button>`).join('')}</div>`;
    let body;
    if (tab === 'bookmarks' && !ctx.listView) {
      const thumb = (url, extra = '') => `<span class="gbbr-thumb"><span class="gbbr-thumb-page" aria-hidden="true" inert>${ctx.thumbnail(url)}</span>${extra}</span>`;
      body = `<div class="gbbr-grid">${[`<div class="gbbr-bm" role="button" tabindex="0" data-action="gbbr-add-bookmark">${thumb(ctx.url, `<span class="gbbr-holder"><img src="assets/gb-br-ic_list_bookmark.png" alt=""><b>${e(T('add_bookmark_short'))}</b></span>`)}<span class="gbbr-label">${e(ctx.title)}</span></div>`, ...ctx.bookmarks.map(url => `<div class="gbbr-bm" role="button" tabindex="0" data-action="browser-bookmark" data-id="${e(url)}" data-gbbr-item="bookmark">${thumb(url)}<span class="gbbr-label">${e(ctx.titleOf(url))}</span></div>`)].join('')}</div>`;
    } else {
      const urls = tab === 'history' ? [...new Set([...ctx.history].reverse())] : tab === 'mostvisited' ? Object.entries(ctx.history.reduce((m, u) => (m[u] = (m[u] || 0) + 1, m), {})).sort((a, b) => b[1] - a[1]).map(([u]) => u) : ctx.bookmarks;
      const row = url => `<div class="gbbr-item"><button class="gbbr-item-main" data-action="browser-bookmark" data-id="${e(url)}" data-gbbr-item="${tab === 'bookmarks' ? 'bookmark' : 'history'}">${favicon()}<span><b>${e(ctx.titleOf(url))}</b><small>${e(url)}</small></span></button>${tab === 'bookmarks' ? '' : `<button class="gbbr-star" data-action="gbbr-star" data-id="${e(url)}" role="checkbox" aria-checked="${ctx.bookmarks.includes(url)}" aria-label="${e(T('save_to_bookmarks'))}"><img src="assets/gb-btn_star_big_${ctx.bookmarks.includes(url) ? 'on' : 'off'}.png" alt=""></button>`}</div>`;
      body = urls.length ? `<div class="gbbr-list">${tab === 'history' ? `<div class="gbbr-group">${e(ctx.t('Today'))}</div>` : ''}${urls.map(row).join('')}</div>` : `<p class="gbbr-empty">${e(T('empty_history'))}</p>`;
    }
    return `<div class="app-view gbbr gbbr-library" data-no-translate>${head}<div class="web-library gbbr-library-body">${body}</div></div>`;
  }
  // ActiveTabsPage: "Windows" window title, "New window" (ic_list_new_window) and a tab_view per window with the close
  // button behind a 1 dip #313431 divider.
  function windows(ctx) {
    const T = key => text(ctx.lang, key);
    return `<div class="app-view gbbr gbbr-windows" data-no-translate><div class="gb-titlebar">${e(T('active_tabs'))}</div><div class="web-tabs gbbr-wlist">${ctx.tabs.length < MAX_TABS ? `<button class="gbbr-wnew" data-action="browser-new-tab"><img src="assets/gb-br-ic_list_new_window.png" alt=""><span>${e(T('new_tab'))}</span></button>` : ''}${ctx.tabs.map((url, i) => `<div class="gbbr-window${i === ctx.active ? ' current' : ''}"><button class="gbbr-window-main" data-action="browser-tab" data-id="${i}">${favicon()}<span><b>${e(ctx.titleOf(url))}</b><small>${e(url)}</small></span></button><i class="gbbr-wdiv"></i><button class="gbbr-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(T('tab_picker_remove_tab'))}"><img src="assets/gb-br-btn_close_window.png" alt=""></button></div>`).join('')}</div></div>`;
  }
  function render(ctx, content) {
    if (ctx.sub === 'tabs') return windows(ctx);
    if (['bookmarks', 'mostvisited', 'history'].includes(ctx.sub)) return library(ctx);
    return page(ctx, content);
  }

  // menu/browser.xml (MAIN_MENU): five items and More; the bookmarks and history pages have their own menus.
  function menu(ctx) {
    const T = key => text(ctx.lang, key), na = 'This feature is not part of the simulator.';
    if (ctx.sub === 'bookmarks') return [{action: 'gbbr-add-bookmark', title: T('bookmark_page'), icon: 'gb-br-ic_menu_add_bookmark.png'}, {action: 'gbbr-switch-view', title: T(ctx.listView ? 'switch_to_thumbnails' : 'switch_to_list'), icon: ctx.listView ? 'gb-br-ic_menu_thumbnail.png' : 'gb-br-ic_menu_list.png'}];
    if (ctx.sub === 'history') return ctx.history.length ? [{action: 'gbbr-clear-history', title: T('clear_history'), icon: 'ic_menu_close_clear_cancel'}] : [];
    if (ctx.sub) return [];
    return [
      {action: 'browser-new-tab', title: T('new_tab'), icon: 'gb-br-ic_menu_new_window.png', disabled: ctx.tabs.length >= MAX_TABS},
      {action: 'browser-bookmarks', title: T('bookmarks'), icon: 'gb-br-ic_menu_bookmarks.png'},
      {action: 'browser-tabs', title: T('active_tabs'), icon: 'gb-br-ic_menu_windows.png'},
      ctx.loading ? {action: 'gbbr-stop', title: T('stop'), icon: 'ic_menu_stop'} : {action: 'browser-refresh', title: T('reload'), icon: 'ic_menu_refresh'},
      {action: 'browser-forward', title: T('forward'), icon: 'ic_menu_forward', disabled: !ctx.canForward},
      {action: 'gbbr-add-bookmark', title: T('save_to_bookmarks'), icon: 'gb-br-ic_menu_add_bookmark.png'},
      {action: 'browser-find', title: T('find_dot')},
      {action: 'gb-select-text', title: T('select_dot')},
      {action: 'gbbr-page-info', title: T('page_info')},
      {action: 'gbbr-share', title: T('share_page')},
      {action: 'open-app', id: 'downloads', title: T('menu_view_download')},
      {action: 'gbpref-open', id: 'browser', title: T('menu_preferences')}
    ];
  }
  // AddBookmarkPage, the page info dialog and the bookmark / history context menus.
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key);
    if (kind === 'add') return {title: T('save_to_bookmarks'), icon: 'gb-br-ic_list_bookmark.png', custom: `<label class="gbbr-field"><span>${e(T('name'))}</span><input data-gbbr-name maxlength="80" value="${e(ctx.title)}"></label><label class="gbbr-field"><span>${e(T('location'))}</span><input data-gbbr-location maxlength="200" value="${e(ctx.url)}"></label>`, buttons: [{action: 'gbbr-add-bookmark-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'info') return {title: T('page_info'), custom: `<div class="gbbr-info"><b>${e(ctx.title)}</b><span>${e(T('page_info_address'))}</span><span>${e(ctx.url)}</span></div>`, buttons: [{action: 'close-overlay', title: ctx.ok}]};
    if (kind === 'bookmark') return {title: ctx.titleOf(ctx.target), items: [{action: 'browser-bookmark', id: ctx.target, title: T('open_bookmark')}, {action: 'gbbr-open-new', id: ctx.target, title: T('open_in_new_window')}, {action: 'gbbr-copy-url', id: ctx.target, title: T('contextmenu_copylink')}, {action: 'gbbr-remove-bookmark', id: ctx.target, title: T('remove_bookmark')}, {action: 'gbbr-homepage', id: ctx.target, title: T('set_as_homepage')}]};
    if (kind === 'history') return {title: ctx.titleOf(ctx.target), items: [{action: 'browser-bookmark', id: ctx.target, title: T('contextmenu_openlink')}, {action: 'gbbr-open-new', id: ctx.target, title: T('contextmenu_openlink_newwindow')}, ...(ctx.bookmarks.includes(ctx.target) ? [] : [{action: 'gbbr-star', id: ctx.target, title: T('save_to_bookmarks')}]), {action: 'gbbr-copy-url', id: ctx.target, title: T('contextmenu_copylink')}, {action: 'gbbr-remove-history', id: ctx.target, title: T('remove_history_item')}, {action: 'gbbr-homepage', id: ctx.target, title: T('set_as_homepage')}]};
    return null;
  }

  /* Select text (Browser's select_dot, Google Mail's "Select text"): WebView.emulateShiftHeld. The next touch on the page
     drags a selection (drawSelectionRegion's 0x40ff33cc); lifting the finger copies it (commitCopy: the framework's
     "Text copied to clipboard.") and ends the mode; a touch that selects nothing just ends it. */
  function selectDrag(pageEl, event, copied) {
    const caret = e => document.caretRangeFromPoint?.(e.clientX, e.clientY);
    const start = caret(event);
    if (!start) return false;
    event.preventDefault();
    const sel = window.getSelection();
    pageEl.classList.add('gb-selecting');
    const move = e => {
      const end = caret(e);
      if (!end || !pageEl.contains(end.startContainer)) return;
      const r = document.createRange(), forward = start.compareBoundaryPoints(Range.START_TO_START, end) <= 0, [a, b] = forward ? [start, end] : [end, start];
      r.setStart(a.startContainer, a.startOffset); r.setEnd(b.startContainer, b.startOffset);
      sel.removeAllRanges(); sel.addRange(r);
    };
    const up = () => {
      document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', up);
      const text = sel.toString(); sel.removeAllRanges(); pageEl.classList.remove('gb-selecting');
      copied(text);
    };
    document.addEventListener('pointermove', move); document.addEventListener('pointerup', up);
    return true;
  }
  window.GBBrowser = {MAX_TABS, text, render, menu, dialog, suggestions, selectDrag};
})();

/* Browser on Android 2.3.6 (Browser.apk of GRK39F) as a module (docs/plans/engine-migration.md): the title bar and
   the address search, the offline pages, the tabs (windows), the bookmarks, most visited and history with their long
   presses, find on page, page info, sharing, the Menu key, the dialogs, the forms and Clear data. A page opens from any
   app through navigate(c, url) (the shell's navigateBrowser); the widgets read title(data, url) and website(url). */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:')) return value;
    if (value.includes(' ') || !value.includes('.')) return `search:${value}`;
    return value.toLowerCase();
  }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2011 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.7537 * var(--dp));color:#888;margin-top:calc(27.8261 * var(--dp))">Offline demo pages · 2011</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 2.3', 'Gingerbread brings a faster, simpler interface, a new keyboard and NFC.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    // Google Books' About the book page (Books' reader › About) for the demo library's books.
    if (url.startsWith('books.google.com/books?id=')) { const book = (window.GBGoogleApps?.BOOKS || []).find(b => b.id === url.split('id=')[1]); if (book) return `<div class="web-book"><h2>${safe(book.title)}</h2><p><small>${safe(book.author)}</small></p><hr><p>${safe(book.pages.find(p => p.length > 80) || book.pages[1] || '')}</p><p><small>${book.pages.length} pages · public domain</small></p></div>`; }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 2.3</h3><p>The fastest version of Android yet: a simpler interface, a new keyboard, one-touch word selection and copy/paste, and Near Field Communication.</p><div style="background:#23343c;color:white;padding:calc(28.9856 * var(--dp));text-align:center;font-size:calc(44.058 * var(--dp))">🤖<br><small style="font-size:calc(19.7102 * var(--dp))">Gingerbread</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 2.3, known as Gingerbread, refined the user interface and added support for NFC and internet calling.</p><h3>Versions</h3><p>Cupcake · Donut · Eclair · Froyo · Gingerbread · Honeycomb</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/galaxy-nexus' || url === 'retro.example/holo') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with Nexus S':'A closer look at Gingerbread'}</h2><time>September 2, 2011 · Demo archive</time><p>The phone has a curved glass screen, four touch keys and a green-accented interface. Open the app drawer to discover the classic Android experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/holo','Explore the Gingerbread interface')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Friday, September 2, 2011</p><hr><h3>The Nexus S experience</h3><p>Android 2.3 makes typing, copy and paste and managing apps easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/galaxy-nexus','Read the Nexus S story')}${browserLink('retro.example','Visit the 2011 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2011 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/holo','Explore the Gingerbread interface')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(266.6667 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(20.8696 * var(--dp)),#c7dfd7 calc(20.8696 * var(--dp)),#c7dfd7 calc(27.8261 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  // The page address as the 2.3 title bar shows it while loading (searches go to the Google results page).
  const browserAddress = url => url.startsWith('search:') ? `www.google.com/search?q=${encodeURIComponent(url.slice(7))}` : url;
  // The shell's bindings the screen's code uses, and its helpers on them.
  function shell(c) {
    const {data, ui, save, render, viewport} = c, clone = c.clone;
    function syncBrowserState() {
      const tab = ICSBrowserSession.current(ui.browserSession);
      ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
      ui.browserHistory = tab.history; ui.browserIndex = tab.index;
      ui.browserTab = ui.browserSession.active;
      ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
    }
    function saveBrowserState() { syncBrowserState(); data.browserSession = clone(ui.browserSession); save(); }
    function navigateBrowser(url) {
      const normalized = normalizeAddress(url);
      ICSBrowserSession.navigate(ui.browserSession,normalized);
      data.browserHistory = [...data.browserHistory,normalized].slice(-50);
      ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; ui.gbBrEdit = false; browserLoading(); saveBrowserState(); render();
    }
    function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); browserLoading(); saveBrowserState(); render(); }
    function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; browserLoading(); saveBrowserState(); render(); }
    function gbBrowserContext() {
      const t = key => i18n.t(key);
      return {lang: i18n.language, t, sub: ui.sub === 'saved' ? 'bookmarks' : ui.sub, url: browserAddress(ui.browserUrl), title: gbBrowserTitle(ui.browserUrl), loading: Date.now() < (ui.gbBrLoadingUntil || 0), editing: !!ui.gbBrEdit, editValue: ui.gbBrEditValue ?? '', find: ui.browserFind, bookmarks: data.bookmarks, history: data.browserHistory, titleOf: gbBrowserTitle, thumbnail: url => renderWebsite(url), tabs: ui.browserTabs, active: ui.browserTab, canForward: ui.browserIndex < ui.browserHistory.length - 1, listView: !!ui.gbBrList, target: ui.gbBrTarget, ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel')};
    }
    const gbBrowserTitle = url => data.bookmarkTitles?.[url] || browserTitle(url);
    function renderBrowser() { return GBBrowser.render(gbBrowserContext(), renderWebsite(ui.browserUrl)); }
    // Tab.onPageStarted / onPageFinished: the progress bar and the stop button for a moment after each load.
    function browserLoading() {
      ui.gbBrLoadingUntil = Date.now() + 800;
      clearTimeout(ui.gbBrLoadTimer);
      ui.gbBrLoadTimer = setTimeout(() => { if (ui.view === 'browser' && !ui.sub && !ui.gbBrEdit) render(); }, 820);
    }
    function highlightBrowserText() {
      const root=viewport.querySelector('.browser-page'), query=ui.browserFind.toLocaleLowerCase();
      const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), nodes=[]; let node;
      while((node=walker.nextNode())) nodes.push(node);
      let count=0;
      for(const text of nodes) {
        let value=text.nodeValue, offset=0, index=value.toLocaleLowerCase().indexOf(query); if(index<0)continue;
        const fragment=document.createDocumentFragment();
        while(index>=0) { fragment.append(document.createTextNode(value.slice(offset,index)));const mark=document.createElement('mark');mark.textContent=value.slice(index,index+query.length);fragment.append(mark);count++;offset=index+query.length;index=value.toLocaleLowerCase().indexOf(query,offset); }
        fragment.append(document.createTextNode(value.slice(offset)));text.replaceWith(fragment);
      }
      viewport.querySelector('.web-find-count').textContent=`${count} ${i18n.t('matches')}`;
      root.querySelector('mark')?.scrollIntoView({block:'nearest'});
    }
    return {data, ui, save, render, renderOverlay: c.renderOverlay, toast: c.toast, viewport, overlayRoot: c.overlayRoot, clone, openApp: c.openApp, composeEmail: c.composeEmail, syncBrowserState, saveBrowserState, navigateBrowser, browserBack, browserForward, gbBrowserContext, gbBrowserTitle, browserLoading, highlightBrowserText};
  }
  window.GB?.register('browser', {
    normalize: normalizeAddress,
    sync: ui => shell({ui}).syncBrowserState(),
    navigate: (c, url) => shell(c).navigateBrowser(url),
    title: (data, url) => shell({data}).gbBrowserTitle(url),
    website: renderWebsite,
    render(c) { const {ui, gbBrowserContext} = shell(c); return GBBrowser.render(gbBrowserContext(), renderWebsite(ui.browserUrl)); },
    // Find on page marks its matches; a long press (or a right click) on a bookmark, a history item or a tab opens its menu.
    mount(c, root) {
      const {ui, highlightBrowserText} = shell(c);
      if (!ui.sub && ui.browserFind) highlightBrowserText();
      GB.hold(c, root, '[data-gbbr-item]', link => { ui.gbBrTarget = link.dataset.id; ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = link.dataset.gbbrItem; c.renderOverlay(); });
    },
    // None while the address is being edited.
    menu(c) { const {ui, gbBrowserContext} = shell(c); if (ui.gbBrEdit) return; c.gbMenu(GBBrowser.menu(gbBrowserContext())); },
    // Browser.sharePage: Intent.createChooser(ACTION_SEND text/plain, "Share via"); the AOSP build offers Email and
    // Messaging. Then the bookmark, page info and item dialogs.
    dialog(kind, c) {
      if (kind === 'share') return {title: GBBrowser.text(i18n.language, 'choosertitle_sharevia'), items: [['email', 'Email'], ['messaging', 'Messaging']].map(([id, name]) => ({action: 'gbbr-share-to', id, title: i18n.t(name), icon: `${id}.png`}))};
      return GBBrowser.dialog(kind, shell(c).gbBrowserContext());
    },
    // The address edit closes, then find on page, then the page goes back in its tab.
    back(c) {
      const {ui, render, browserBack} = shell(c);
      if (ui.gbBrEdit) { ui.gbBrEdit = false; render(); return true; }
      if (!ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return true; }
      if (!ui.sub && ui.browserIndex > 0) { browserBack(); return true; }
      return false;
    },
    action(name, el, c) {
      const id = el.dataset.id, url = el.dataset.url, {data, ui, save, render, renderOverlay, toast, viewport, overlayRoot, openApp, composeEmail, saveBrowserState, navigateBrowser, browserForward, gbBrowserTitle, browserLoading} = shell(c);
      switch (name) {
        case 'gbbr-share': ui.overlay = 'gb-dialog-share'; renderOverlay(); break;
        // EXTRA_TEXT carries the address and EXTRA_SUBJECT the page title.
        case 'gbbr-share-to': { const url = ICSBrowserSession.url(ui.browserSession) || '', address = browserAddress(String(url)), title = gbBrowserTitle(url); ui.overlay = '';
          if (id === 'email') { openApp('email'); composeEmail(); const draft = data.mailbox.find(m => m.id === ui.emailId); if (draft) { draft.subject = title; draft.body = 'http://' + address; save(); render(); } }
          else { openApp('messaging'); ui.sub = 'new'; data.messageDrafts ||= {}; data.messageDrafts.new = {...(data.messageDrafts.new || {}), body: 'http://' + address, updated: Date.now()}; save(); render(); }
          break; }
        case 'browser-link': navigateBrowser(url); break;
        case 'browser-forward': browserForward(); break;
        case 'browser-tabs': ui.sub = 'tabs'; ui.overlay = ''; render(); break;
        case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
        case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
        case 'browser-bookmark': navigateBrowser(id); break;
        case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
        case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
        case 'browser-close-tab': ICSBrowserSession.close(ui.browserSession,Number(id)); saveBrowserState(); render(); break;
        case 'browser-refresh': ui.overlay=''; browserLoading(); render(); break;
        case 'gbbr-stop': ui.gbBrLoadingUntil = 0; ui.overlay = ''; render(); break;
        case 'gbbr-edit': ui.gbBrEdit = true; ui.gbBrEditValue = browserAddress(ui.browserUrl); ui.overlay = ''; render(); { const input = viewport.querySelector('.gbbr-search input'); input?.focus(); input?.select(); } break;
        case 'gbbr-edit-cancel': ui.gbBrEdit = false; render(); break;
        case 'gbbr-library': ui.sub = id; render(); break;
        case 'gbbr-switch-view': ui.gbBrList = !ui.gbBrList; ui.overlay = ''; render(); break;
        case 'gbbr-add-bookmark': ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = 'add'; renderOverlay(); break;
        case 'gbbr-add-bookmark-ok': { const name = overlayRoot.querySelector('[data-gbbr-name]')?.value.trim(), location = normalizeAddress(overlayRoot.querySelector('[data-gbbr-location]')?.value || ''); if (!name) { toast(GBBrowser.text(i18n.language, 'bookmark_needs_title')); break; } if (!location) break; if (!data.bookmarks.includes(location)) data.bookmarks.push(location); data.bookmarkTitles = {...(data.bookmarkTitles || {}), [location]: name}; ui.overlay = ''; save(); render(); toast(GBBrowser.text(i18n.language, 'added_to_bookmarks')); break; }
        case 'gbbr-page-info': ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = 'info'; renderOverlay(); break;
        case 'gbbr-star': { const on = data.bookmarks.includes(id); data.bookmarks = on ? data.bookmarks.filter(url => url !== id) : [...data.bookmarks, id]; ui.overlay = ''; save(); render(); toast(GBBrowser.text(i18n.language, on ? 'removed_from_bookmarks' : 'added_to_bookmarks')); break; }
        case 'gbbr-clear-history': data.browserHistory = []; ui.overlay = ''; save(); render(); break;
        case 'gbbr-open-new': ui.overlay = ''; if (!ICSBrowserSession.add(ui.browserSession)) break; navigateBrowser(id); break;
        case 'gbbr-copy-url': try { navigator.clipboard?.writeText(id)?.catch(() => {}); } catch {} ui.overlay = ''; renderOverlay(); break;
        case 'gbbr-remove-bookmark': data.bookmarks = data.bookmarks.filter(url => url !== id); ui.overlay = ''; save(); render(); break;
        case 'gbbr-remove-history': data.browserHistory = data.browserHistory.filter(url => url !== id); ui.overlay = ''; save(); render(); break;
        case 'gbbr-homepage': data.browserHome = id; ui.overlay = ''; save(); renderOverlay(); break;
        case 'gbbr-find-step': { const marks = [...viewport.querySelectorAll('.browser-page mark')]; if (!marks.length) break; ui.gbBrMark = ((ui.gbBrMark ?? -1) + Number(id) + marks.length) % marks.length; marks.forEach((m, k) => m.classList.toggle('current', k === ui.gbBrMark)); marks[ui.gbBrMark].scrollIntoView({block: 'nearest'}); break; }
        case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.gbbr-find input')?.focus(); break;
        case 'browser-close-find': ui.browserFind=undefined; render(); break;
        case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'browser-new-tab': if (!ICSBrowserSession.add(ui.browserSession)) break; browserLoading(); ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
        case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      const {ui, render, navigateBrowser} = shell(c);
      switch (name) {
        case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
        case 'address': navigateBrowser(values.get('address')); break;
        case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
        default: return false;
      }
      return true;
    },
    // The address search's suggestions and find on page's matches.
    input(event, c) {
      const {ui, viewport, gbBrowserContext, highlightBrowserText} = shell(c);
      if (event.target.closest('.gbbr-search')) { ui.gbBrEditValue = event.target.value; const box = viewport.querySelector('.gbbr-suggest'); if (box) box.innerHTML = GBBrowser.suggestions(gbBrowserContext()); return true; }
      if (event.target.closest('.gbbr-find')) { ui.browserFind = event.target.value; ui.gbBrMark = -1; const page = viewport.querySelector('.browser-page'); page.innerHTML = renderWebsite(ui.browserUrl); if (ui.browserFind) highlightBrowserText(); else viewport.querySelector('.web-find-count').textContent = ''; return true; }
      return false;
    },
    clearData(c) { const {data, ui} = c, clone = c.clone, defaultData = c.defaults, {syncBrowserState} = shell(c); delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState(); }
  });
})();
