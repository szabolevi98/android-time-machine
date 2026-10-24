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
    return `<div class="gbbr-search-scrim" data-action="gbbr-edit-cancel"></div><form class="gbbr-search" data-form="address"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/gb-br-ic_launcher_browser.png" alt=""><input name="address" autocomplete="off" aria-label="${e(T('search_hint'))}" placeholder="${e(T('search_hint'))}" value="${e(ctx.editValue)}"><button class="gbbr-go" type="submit" aria-label="${e(T('goto_dot'))}"><img src="assets/gb-ic_btn_search_go.png" alt=""></button><button class="gbbr-voice" type="button" data-action="gbset-toast" data-id="Unavailable in this simulator" aria-label="Voice search"><img src="assets/gb-ic_btn_speak_now.png" alt=""></button></div><div class="gbbr-suggest">${suggestions(ctx)}</div></form>`;
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
    const T = key => text(ctx.lang, key), na = 'Unavailable in this simulator';
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
