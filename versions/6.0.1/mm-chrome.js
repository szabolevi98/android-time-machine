/* Android 6.0.1 Chrome (Chrome 44, app/Chrome of MTC20K), the app 'chrome'. Pages come from the offline web
   (mm-web.js).
   - Document mode: FeatureUtilities.isDocumentMode is true on a phone from Lollipop on unless the user opted out
     (DocumentModeManager's opt_out_state), so the toolbar has no tab switcher (ToolbarPhone hides tab_switcher_button)
     and the menu button sits in the omnibox (LocationBarPhone.showMenuButtonInOmnibox). The status bar stays black.
   - control_container.xml / toolbar.xml: the 56 dp toolbar in default_primary_color #f2f2f2 with toolbar_shadow under
     it; the location bar on inset_textbox (the textbox nine-patch inset 5 dp): the 36 dp navigation icon
     (ic_omnibox_page, omnibox_https_valid on a secure page, ic_omnibox_magnifier while editing), url_container.xml's
     17 sp URL (the host in #333333, the rest in #80333333), btn_delete_url while editing and btn_menu; the 2 dp
     ToolbarProgressBar while a page loads.
   - new_tab_page.xml on white: the 56 dp toolbar space, LogoView (116 dp, google_logo; 26 dp above, 30 dp below), the
     48 dp search box (bg_ntp_search_box: white, 1 px #b26d6d6d, 1.5 dp corners; 12 dp in; the 17 sp hint and btn_mic),
     MostVisitedLayout's most_visited_item.xml tiles (156 × 130 dp: the 12 sp #333333 title over the page's thumbnail on
     #f2f2f2, 2 dp corners) or most_visited_placeholder.xml (ic_most_visited_placeholder, 16 sp / 12 sp #c8c8c8), and
     NewTabPageToolbar's 48 dp Bookmarks (btn_star) / Recent tabs (btn_recents) in 12 sp #5a5a5a.
   - The app menu (main_menu.xml as ChromeAppMenuPropertiesDelegate.prepareMenu shows it): the icon row (Go forward,
     enabled when there is a page to go forward to; Bookmark this page / btn_star_filled; View site information;
     Refresh page), New tab, New incognito tab, Bookmarks, Recent tabs, History, Share… (not on chrome pages), Print…
     and Find in page (not on native pages), Add to Home screen (not on chrome pages), Request desktop site (checkable),
     Settings, Help & feedback.
   - First run (fre_tosanduma.xml): "Welcome to Chrome" (24 sp #161616), fre_product_logo (130 dp), the terms text, the
     usage statistics check box and ACCEPT & CONTINUE (14 sp #4285f4) above a divider.
   - An address the offline web does not have shows the network error page (the APK's .pak texts: "This webpage is not
     available", ERR_NAME_NOT_RESOLVED, Reload, Details).
   - Native pages: Bookmarks (chrome-native://bookmarks/: the Mobile bookmarks folder, the starred pages; long press
     or ⋮ deletes; bookmarks_folder_empty), Recent tabs (chrome-native://recent-tabs/: Recently closed with Show full
     history, Other devices' sync promo), History (chrome://history/, the .pak's WebUI texts: Search history, Clear
     browsing data…, the visits by day, Remove from history).
   - New incognito tab: new_tab_incognito_header / _message on the dark incognito page, the toolbar in
     incognito_primary_color #505050; nothing visited there is remembered; Close incognito tabs in the menu leaves.
   - Find in page (find_toolbar.xml): the field "Find in page", find_in_page_count, previous / next and close; the
     matches highlighted (the current one orange).
   - Add to Home screen: the title (add_to_homescreen_title) and Add; the page's shortcut lands on the home screen with
     added_to_homescreen. View site information: the host, page_info_connection_https / _http / _internal_page, Copy
     URL and Site Settings. Settings: main_preferences (mm-appprefs.js). */
(() => {
  'use strict';
  const T = () => MM.text('chrome');
  const A = n => `assets/cr-${n}.png`;
  const NTP = 'chrome-native://newtab/', BOOKMARKS = 'chrome-native://bookmarks/', RECENT = 'chrome-native://recent-tabs/', HISTORY = 'chrome://history/';
  // The simulator's demo bookmarks, as every version's browser: Google, Android and the Wikipedia article of the offline web.
  const DEMO_BOOKMARKS = ['https://www.google.com/', 'https://www.android.com/', 'https://en.m.wikipedia.org/wiki/Android_(operating_system)'];
  const S = c => c.data.chrome || (c.data.chrome = {fre: false, history: [NTP], index: 0, bookmarks: [...DEMO_BOOKMARKS], visits: {}, desktop: false, report: true});
  // Chrome's bookmarks widget (mm-widgets.js) shows the bookmarks made with the star.
  MM.chromeBookmarks = c => S(c).bookmarks;
  const ui = c => c.ui.chrome || (c.ui.chrome = {editing: false, text: '', loading: 0, details: false});
  const esc = (c, s) => c.safe(s);
  const url = c => S(c).history[S(c).index];
  const native = u => u.startsWith('chrome-native://') || u.startsWith('chrome://');

  function go(c, target, {replace = false} = {}) {
    const s = S(c), u = ui(c);
    if (!target) return;
    if (replace) s.history[s.index] = target; else { s.history = s.history.slice(0, s.index + 1); s.history.push(target); s.history = s.history.slice(-50); s.index = s.history.length - 1; }
    const p = native(target) ? null : MM.web.page(target);
    if (p) { s.history[s.index] = p.url; if (!s.incognito) { s.visits[p.url] = (s.visits[p.url] || 0) + 1; s.log = [...(s.log || []), {url: p.url, title: p.title, time: Date.now()}].slice(-200); } }
    u.editing = false; u.details = false; u.loading = native(target) ? 0 : Date.now();
    c.save(); c.render();
    if (u.loading) setTimeout(() => { u.loading = 0; if (c.ui.view === 'chrome') c.render(); }, 600);
  }
  function mostVisited(c) {
    const v = S(c).visits;
    return Object.keys(v).sort((a, b) => v[b] - v[a]).slice(0, 6);
  }
  function host(u) { const m = /^(\w+:\/\/)([^/]+)(.*)$/.exec(u); return m ? m : [u, '', u, '']; }

  // ---- toolbar -----------------------------------------------------------------------------------------------------
  function toolbar(c) {
    const t = T(), u = ui(c), cur = url(c), p = native(cur) ? null : MM.web.page(cur), inc = S(c).incognito ? ' incognito' : '';
    const menu = `<button type="button" class="mmcr-menu" data-action="mmcr-menu" aria-label="${esc(c, t.t('accessibility_toolbar_btn_menu'))}"><img src="${A('btn_menu')}" alt=""></button>`;
    if (u.find) return `<div class="mmcr-toolbar find"><input class="mmcr-findin" value="${esc(c, u.find.q)}" placeholder="${esc(c, t.t('hint_find_in_page'))}" autocomplete="off" spellcheck="false"><span class="mmcr-findcount">${u.find.q ? esc(c, u.find.n ? AndroidStrings.format(t.t('find_in_page_count'), u.find.i + 1, u.find.n) : '0/0') : ''}</span>
      <button type="button" class="mmcr-fbtn" data-action="mmcr-findprev"${u.find.n ? '' : ' disabled'}>▲</button><button type="button" class="mmcr-fbtn" data-action="mmcr-findnext"${u.find.n ? '' : ' disabled'}>▼</button><button type="button" class="mmcr-fbtn" data-action="mmcr-findclose" aria-label="${esc(c, t.t('close'))}">✕</button></div><i class="mmcr-shadow"></i>`;
    if (cur === NTP && !u.editing) return `<div class="mmcr-toolbar ntp${inc}">${menu}</div>`;
    let field;
    if (u.editing) field = `<img class="mmcr-nav" src="${A('ic_omnibox_magnifier')}" alt=""><form class="mmcr-form" data-form="mmcr-omnibox"><input class="mmcr-input" enterkeyhint="go" name="q" value="${esc(c, u.text)}" placeholder="${esc(c, t.t('search_or_type_url'))}" autocomplete="off" spellcheck="false" inputmode="url"></form>${u.text ? `<button type="button" class="mmcr-del" data-action="mmcr-clear"><img src="${A('btn_delete_url')}" alt=""></button>` : ''}`;
    else {
      const [, scheme, h, rest] = host(cur), secure = /^https:/.test(cur);
      const shown = p ? `<b>${esc(c, secure ? 'https://' : '')}${esc(c, h)}</b>${esc(c, rest === '/' ? '' : rest)}` : `${esc(c, h)}${esc(c, rest === '/' ? '' : rest)}`;
      field = `<img class="mmcr-nav" src="${A(secure ? 'omnibox_https_valid' : 'ic_omnibox_page')}" alt=""><button type="button" class="mmcr-url${secure ? ' secure' : ''}" data-action="mmcr-edit"><span>${shown}</span></button>`;
    }
    const progress = u.loading ? '<i class="mmcr-progress"></i>' : '';
    return `<div class="mmcr-toolbar${inc}"><div class="mmcr-loc np-cr-textbox">${field}${u.editing ? '' : menu}</div>${progress}</div><i class="mmcr-shadow"></i>`;
  }

  // ---- pages -------------------------------------------------------------------------------------------------------
  function thumb(c, target) {
    const p = MM.web.page(target);
    return `<div class="mmcr-thumb" aria-hidden="true"><div class="mmcr-thumbpage mmwb">${p ? p.html : ''}</div></div>`;
  }
  function ntp(c) {
    const t = T(), mv = mostVisited(c);
    const tiles = mv.length ? `<div class="mmcr-mv">${mv.map(u => { const p = MM.web.page(u); return `<button type="button" class="mmcr-tile" data-action="mmcr-go" data-url="${esc(c, u)}"><span>${esc(c, p?.title || u)}</span>${thumb(c, u)}</button>`; }).join('')}</div>`
      : `<div class="mmcr-mvph"><img src="${A('ic_most_visited_placeholder')}" alt=""><b>${esc(c, t.t('most_visited_placeholder_title'))}</b><span>${esc(c, t.t('most_visited_placeholder_summary'))}</span></div>`;
    return `<div class="mmcr-ntp"><div class="mmcr-ntpscroll"><img class="mmcr-logo" src="${A('google_logo')}" alt="Google">
      <div class="mmcr-fakebox"><button type="button" class="mmcr-fakeinput" data-action="mmcr-edit">${esc(c, t.t('search_or_type_url'))}</button><button type="button" class="mmcr-mic" data-action="mmcr-voice" aria-label="${esc(c, t.t('accessibility_toolbar_btn_mic'))}"><img src="${A('btn_mic')}" alt=""></button></div>${tiles}</div>
      <div class="mmcr-ntpbar"><button type="button" data-action="mmcr-bookmarks"><img src="${A('btn_star')}" alt=""><span>${esc(c, t.t('ntp_bookmarks'))}</span></button><button type="button" data-action="mmcr-recent"><img src="${A('btn_recents')}" alt=""><span>${esc(c, t.t('recent_tabs'))}</span></button></div></div>`;
  }
  // ---- native pages ---------------------------------------------------------------------------------------------
  const favicon = (c, u) => { const [, , h] = host(u); return `<i class="mmcr-fav">${esc(c, (h.replace(/^www\./, '')[0] || '?').toUpperCase())}</i>`; };
  function bookmarksPage(c) {
    const t = T(), s = S(c);
    return `<div class="mmcr-page mmcr-native"><div class="mmcr-nhead">${esc(c, t.t('mobile_bookmarks'))}</div>${s.bookmarks.length ? s.bookmarks.map(u => { const p = MM.web.page(u); return `<div class="mmcr-nrow"><button type="button" class="mmcr-nlink" data-action="mmcr-go" data-url="${esc(c, u)}">${favicon(c, u)}<span><b>${esc(c, p?.title || u)}</b><small>${esc(c, u)}</small></span></button><button type="button" class="mmcr-nmore" data-action="mmcr-bmdel" data-url="${esc(c, u)}" aria-label="${esc(c, t.t('contextmenu_delete_bookmark'))}">✕</button></div>`; }).join('') : `<div class="mmcr-nempty">${esc(c, t.t('bookmarks_folder_empty'))}</div>`}</div>`;
  }
  function recentPage(c) {
    const t = T(), s = S(c), seen = new Set([url(c)]), closed = [];
    for (const e of [...(s.log || [])].reverse()) { if (seen.has(e.url)) continue; seen.add(e.url); closed.push(e); if (closed.length === 5) break; }
    return `<div class="mmcr-page mmcr-native"><div class="mmcr-group"><b>${esc(c, t.t('recently_closed'))}</b></div>${closed.map(e => `<button type="button" class="mmcr-nlink" data-action="mmcr-go" data-url="${esc(c, e.url)}">${favicon(c, e.url)}<span><b>${esc(c, e.title || e.url)}</b></span></button>`).join('')}
      <button type="button" class="mmcr-nmorelink" data-action="mmcr-history">${esc(c, t.t('show_full_history'))}</button>
      <div class="mmcr-group"><b>${esc(c, t.t('ntp_recent_tabs_sync_promo_title'))}</b></div><p class="mmcr-promo">${esc(c, t.t('ntp_recent_tabs_sync_promo_instructions'))}</p></div>`;
  }
  function historyPage(c) {
    const t = T(), s = S(c), u = ui(c), q = (u.hq || '').trim().toLowerCase();
    const log = [...(s.log || [])].reverse().filter(e => !q || `${e.title} ${e.url}`.toLowerCase().includes(q));
    let day = '', rows = '';
    for (const e of log) {
      const d = new Date(e.time), k = d.toDateString();
      if (k !== day) { day = k; rows += `<div class="mmcr-hday">${esc(c, k === new Date().toDateString() ? `${t.t('history_today')} - ${new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}).format(d)}` : new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}).format(d))}</div>`; }
      rows += `<div class="mmcr-hrow"><span class="mmcr-htime">${esc(c, new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(d))}</span><button type="button" class="mmcr-nlink" data-action="mmcr-go" data-url="${esc(c, e.url)}">${favicon(c, e.url)}<span><b>${esc(c, e.title || e.url)}</b><small>${esc(c, host(e.url)[2])}</small></span></button><button type="button" class="mmcr-nmore" data-action="mmcr-hdel" data-time="${e.time}" aria-label="${esc(c, t.t('history_remove'))}">✕</button></div>`;
    }
    return `<div class="mmcr-page mmcr-native mmcr-hist"><h1>${esc(c, t.t('history_title'))}</h1><div class="mmcr-hsearch"><input class="mmcr-hq" value="${esc(c, u.hq || '')}" placeholder="${esc(c, t.t('history_search'))}" autocomplete="off"></div>
      <button type="button" class="mmcr-hclear" data-action="mmcr-hclear">${esc(c, t.t('history_clear'))}</button>${rows || `<div class="mmcr-nempty">${esc(c, t.t(q ? 'history_no_results' : 'history_none'))}</div>`}</div>`;
  }
  function incognitoPage(c) {
    const t = T();
    return `<div class="mmcr-incog"><img src="${A('account_management_incognito')}" alt=""><h1>${esc(c, t.t('new_tab_incognito_header'))}</h1><p>${esc(c, t.t('new_tab_incognito_message'))}</p></div>`;
  }
  function errorPage(c, target) {
    const t = T(), u = ui(c), [, , h] = host(target);
    return `<div class="mmcr-page"><div class="mmcr-error"><h1>${esc(c, t.t('neterror_title'))}</h1><p class="mmcr-code">ERR_NAME_NOT_RESOLVED</p>
      ${u.details ? `<p class="mmcr-detail">${esc(c, t.t('neterror_dns'))}</p><p class="mmcr-detail">${esc(c, h)}</p>` : ''}
      <div class="mmcr-ebtns"><button type="button" class="mmcr-reload" data-action="mmcr-reload">${esc(c, t.t('neterror_reload'))}</button><button type="button" class="mmcr-details" data-action="mmcr-details">${esc(c, t.t(u.details ? 'neterror_hide_details' : 'neterror_details'))}</button></div></div></div>`;
  }
  function fre(c) {
    const t = T(), s = S(c);
    const tos = esc(c, t.t('fre_tos_and_privacy')).replace(/&lt;LINK1&gt;(.*?)&lt;\/LINK1&gt;/, '<a>$1</a>').replace(/&lt;LINK2&gt;(.*?)&lt;\/LINK2&gt;/, '<a>$1</a>');
    return `<div class="mmcr mmcr-fre"><div class="mmcr-frescroll"><h1>${esc(c, t.t('fre_welcome'))}</h1><img src="${A('fre_product_logo')}" alt=""><p>${tos}</p>
      <button type="button" class="mmcr-check" data-action="mmcr-report" role="checkbox" aria-checked="${s.report}"><i class="${s.report ? 'on' : ''}"></i><span>${esc(c, t.t('fre_send_report_check'))}</span></button></div>
      <i class="mmcr-frediv"></i><button type="button" class="mmcr-accept" data-action="mmcr-accept">${esc(c, t.t('fre_accept_continue'))}</button></div>`;
  }
  function render(c) {
    consume(c);
    if (!S(c).fre) return fre(c);
    const cur = url(c), u = ui(c);
    if (u.editing) return `<div class="mmcr">${toolbar(c)}<div class="mmcr-suggest"></div></div>`;
    const inc = S(c).incognito ? ' incognito' : '';
    if (cur === NTP) return `<div class="mmcr${inc}">${toolbar(c)}${inc ? incognitoPage(c) : ntp(c)}</div>`;
    if (cur === BOOKMARKS) return `<div class="mmcr">${toolbar(c)}${bookmarksPage(c)}</div>`;
    if (cur === RECENT) return `<div class="mmcr">${toolbar(c)}${recentPage(c)}</div>`;
    if (cur === HISTORY) return `<div class="mmcr">${toolbar(c)}${historyPage(c)}</div>`;
    const p = MM.web.page(cur);
    return `<div class="mmcr">${toolbar(c)}${p ? `<div class="mmcr-page"><div class="mmwb">${p.html}</div></div>` : errorPage(c, cur)}</div>`;
  }

  // ---- the app menu -------------------------------------------------------------------------------------------------
  function menuMarkup(c) {
    const t = T(), s = S(c), cur = url(c), chromePage = native(cur), nativePage = chromePage || !MM.web.page(cur);
    const starred = s.bookmarks.includes(cur);
    const icon = (img, action, label, disabled = false) => `<button type="button" data-action="${action}" aria-label="${esc(c, label)}"${disabled ? ' disabled' : ''}><img src="${A(img)}" alt=""></button>`;
    const row = (action, key, extra = '') => `<button type="button" class="mmcr-mi" data-action="${action}"><span>${esc(c, t.t(key))}</span>${extra}</button>`;
    const items = [row('mmcr-newtab', 'menu_new_tab'), row('mmcr-incognito', 'menu_new_incognito_tab'), row('mmcr-bookmarks', 'menu_bookmarks'), row('mmcr-recent', 'menu_recent_tabs'), row('mmcr-history', 'menu_history')];
    if (!chromePage) items.push(row('mmcr-share', 'menu_share_page'));
    if (!nativePage) items.push(row('mmcr-print', 'menu_print'), row('mmcr-find', 'menu_find_in_page'));
    if (!chromePage) items.push(row('mmcr-homescreen', 'menu_add_to_homescreen'));
    if (s.incognito) items.push(row('mmcr-closeinc', 'menu_close_all_incognito_tabs'));
    items.push(row('mmcr-desktop', 'menu_request_desktop_site', `<i class="mmcr-cb${s.desktop ? ' on' : ''}"></i>`), row('mmcr-settings', 'menu_preferences'), row('mmcr-help', 'menu_help'));
    return `<div class="mmcr-menuwrap"><div class="mmcr-menuout" data-action="mmcr-menuclose"></div><div class="mmcr-pop" role="menu"><div class="mmcr-icons">${icon('btn_right', 'mmcr-forward', t.t('accessibility_menu_forward'), s.index >= s.history.length - 1)}${icon(starred ? 'btn_star_filled' : 'btn_star', 'mmcr-star', t.t('accessibility_menu_bookmark'))}${icon('btn_info', 'mmcr-info', t.t('accessibility_menu_info'))}${icon('btn_toolbar_reload', 'mmcr-reload', t.t('accessibility_btn_refresh'))}</div>${items.join('')}</div></div>`;
  }
  MM.register('chrome-menu', {
    app: false, render: menuMarkup,
    action(name, el, event, c) {
      const s = S(c), cur = url(c);
      const close = () => c.closeOverlay();
      switch (name) {
        case 'mmcr-menuclose': close(); return true;
        case 'mmcr-forward': close(); if (s.index < s.history.length - 1) { s.index++; c.save(); c.render(); } return true;
        case 'mmcr-star': close(); s.bookmarks = s.bookmarks.includes(cur) ? s.bookmarks.filter(x => x !== cur) : [...s.bookmarks, cur]; c.save(); return true;
        // WebsiteSettingsPopup: the host, the connection, Copy URL and Site Settings.
        case 'mmcr-info': {
          close(); const t = T(), [, , h] = host(cur), key = native(cur) ? 'page_info_connection_internal_page' : /^https:/.test(cur) ? 'page_info_connection_https' : 'page_info_connection_http';
          c.dialog({html: `<div class="mmcr-info"><b>${esc(c, native(cur) ? cur : h)}</b><p class="${key.endsWith('http') ? 'warn' : ''}">${esc(c, t.t(key))}</p></div>`,
            buttons: [{label: t.t('page_info_copy_url_button'), action: c => { try { navigator.clipboard?.writeText(cur); } catch {} }}, {label: t.t('page_info_site_settings_button'), action: c => MM.openPrefs(c, 'chrome', 'content_preferences', t.t('page_info_site_settings_button'))}]});
          return true;
        }
        case 'mmcr-incognito': close(); s.incognito = true; c.save(); go(c, NTP); return true;
        case 'mmcr-closeinc': close(); s.incognito = false; c.save(); go(c, NTP); return true;
        case 'mmcr-bookmarks': close(); go(c, BOOKMARKS); return true;
        case 'mmcr-recent': close(); go(c, RECENT); return true;
        case 'mmcr-history': close(); go(c, HISTORY); return true;
        case 'mmcr-find': close(); ui(c).find = {q: '', i: 0, n: 0}; c.render(); return true;
        case 'mmcr-settings': close(); MM.openPrefs(c, 'chrome', 'main_preferences', T().t('menu_preferences')); return true;
        case 'mmcr-help': close(); c.open('help', 'chrome'); return true;
        // AddToHomescreenDialog: the title to give the shortcut, then Add.
        case 'mmcr-homescreen': {
          close(); const t = T(), p = MM.web.page(cur); let title = p?.title || host(cur)[2];
          c.dialog({title: t.t('menu_add_to_homescreen'), html: `<div class="mmst-edit"><label class="mmcr-hslabel">${esc(c, t.t('add_to_homescreen_title'))}</label><input type="text" class="mmst-input mmcr-hstitle" value="${esc(c, title)}" spellcheck="false"></div>`,
            mount(c, win) { const i = win.querySelector('.mmcr-hstitle'); i.addEventListener('input', () => { title = i.value.trim(); }); },
            buttons: [{label: t.t('cancel')}, {label: t.t('add'), action: c => { const name = title || p?.title || cur; MM.launcherInstall?.(c, {type: 'shortcut', label: name, icon: 'assets/wg-sc-bookmark.png', open: {view: 'chrome', sub: `url:${cur}`}}); c.toast(AndroidStrings.format(t.t('added_to_homescreen'), name), false); }}]});
          return true;
        }
        // ShareHelper: the page's URL as text with its title as the subject, through share_link_chooser_title.
        // Chrome prints the page through the framework's print dialog, the job named after the page's title.
        case 'mmcr-print': {
          close(); const p = MM.web.page(cur); if (!p) return true;
          const div = document.createElement('div'); div.innerHTML = p.html;
          const lines = [...div.querySelectorAll('h1, h2, h3, p, li')].map(e => e.textContent.trim()).filter(Boolean);
          MM.print(c, {name: p.title, title: p.title, lines: lines.length ? lines : [div.textContent.trim()]}); return true;
        }
        case 'mmcr-share': { close(); const p = MM.web.page(cur); MM.share(c, {title: T().t('share_link_chooser_title'), subject: p?.title || '', text: cur}); return true; }
        case 'mmcr-reload': close(); go(c, cur, {replace: true}); return true;
        case 'mmcr-newtab': close(); go(c, NTP); return true;
        case 'mmcr-desktop': close(); s.desktop = !s.desktop; c.save(); go(c, cur, {replace: true}); return true;
      }
      return false;
    }
  });

  function consume(c) {
    const sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = '';
    if (sub.startsWith('url:')) { const s = S(c); s.fre = true; const target = MM.chromeAddress(c, sub.slice(4)); s.history = s.history.slice(0, s.index + 1); s.history.push(target); s.index = s.history.length - 1; const p = MM.web.page(target); if (p) { s.history[s.index] = p.url; if (!s.incognito) { s.visits[p.url] = (s.visits[p.url] || 0) + 1; s.log = [...(s.log || []), {url: p.url, title: p.title, time: Date.now()}].slice(-200); } } }
  }

  MM.register('chrome', {
    statusColor: () => '#000',
    render,
    mount(c, root) {
      const input = root.querySelector('.mmcr-input');
      if (input) { input.addEventListener('input', () => { ui(c).text = input.value; const del = root.querySelector('.mmcr-del'); if (!!input.value !== !!del) { const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.mmcr-input'); i2?.focus(); i2?.setSelectionRange(pos, pos); } }); input.focus(); input.select(); }
      const page = root.querySelector('.mmcr-page'); if (page && !ui(c).loading && !ui(c).find) page.scrollTop = 0;
      const u = ui(c), hq = root.querySelector('.mmcr-hq');
      if (hq) hq.addEventListener('input', () => { const p = hq.selectionStart; u.hq = hq.value; c.render(); const g = c.el.viewport.querySelector('.mmcr-hq'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
      // Find in page: the matches in the page's text marked, the current one scrolled to.
      const fin = root.querySelector('.mmcr-findin');
      if (fin && u.find) {
        fin.addEventListener('input', () => { const p = fin.selectionStart; u.find.q = fin.value; u.find.i = 0; c.render(); const g = c.el.viewport.querySelector('.mmcr-findin'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
        fin.addEventListener('keydown', e => { if (e.key === 'Enter' && u.find.n) { e.preventDefault(); u.find.i = (u.find.i + 1) % u.find.n; c.render(); c.el.viewport.querySelector('.mmcr-findin')?.focus(); } });
        if (document.activeElement !== fin) setTimeout(() => fin.focus(), 40);
        const doc = root.querySelector('.mmcr-page .mmwb'), q = u.find.q.toLowerCase(), hits = [];
        if (doc && q) {
          const walk = document.createTreeWalker(doc, NodeFilter.SHOW_TEXT), nodes = []; while (walk.nextNode()) nodes.push(walk.currentNode);
          for (const n of nodes) {
            const text = n.nodeValue, low = text.toLowerCase(); let at = low.indexOf(q); if (at < 0) continue;
            const frag = document.createDocumentFragment(); let last = 0;
            while (at >= 0) { frag.append(text.slice(last, at)); const m = document.createElement('mark'); m.className = 'mmcr-hit'; m.textContent = text.slice(at, at + q.length); frag.append(m); hits.push(m); last = at + q.length; at = low.indexOf(q, last); }
            frag.append(text.slice(last)); n.replaceWith(frag);
          }
        }
        if (u.find.n !== hits.length) { u.find.n = hits.length; if (u.find.i >= hits.length) u.find.i = 0; const cnt = root.querySelector('.mmcr-findcount'); if (cnt) cnt.textContent = q ? (hits.length ? AndroidStrings.format(T().t('find_in_page_count'), u.find.i + 1, hits.length) : '0/0') : ''; root.querySelectorAll('.mmcr-fbtn[data-action^="mmcr-find"]:not([data-action="mmcr-findclose"])').forEach(b => { b.disabled = !hits.length; }); }
        const curHit = hits[u.find.i]; if (curHit) { curHit.classList.add('cur'); curHit.scrollIntoView({block: 'center'}); }
      }
    },
    submit(form, event, c) {
      const name = form.dataset.form;
      if (name === 'mmcr-omnibox') { go(c, MM.chromeAddress(c, form.elements.q.value)); return true; }
      if (name === 'mmcr-search') { const q = form.elements.q.value.trim(); if (q) go(c, `${MM.web.GOOGLE}search?q=${encodeURIComponent(q).split('%20').join('+')}`); return true; }
      return false;
    },
    back(c) {
      const u = ui(c), s = S(c);
      if (u.editing) { u.editing = false; c.render(); return true; }
      if (u.find) { u.find = null; c.render(); return true; }
      if (s.fre && s.index > 0) { s.index--; u.loading = 0; c.save(); c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), s = S(c);
      switch (name) {
        case 'mmcr-accept': s.fre = true; c.save(); c.render(); return true;
        case 'mmcr-report': s.report = !s.report; c.save(); c.render(); return true;
        case 'mmcr-edit': u.editing = true; u.text = url(c) === NTP ? '' : url(c); c.render(); return true;
        case 'mmcr-clear': u.text = ''; c.render(); return true;
        case 'mmcr-go': go(c, el.dataset.url); return true;
        case 'mmcr-menu': c.overlay('chrome-menu'); return true;
        case 'mmcr-voice': MM.googleOpen(c, true); return true;
        case 'mmcr-bookmarks': go(c, BOOKMARKS); return true;
        case 'mmcr-recent': go(c, RECENT); return true;
        case 'mmcr-history': go(c, HISTORY); return true;
        case 'mmcr-bmdel': s.bookmarks = s.bookmarks.filter(x => x !== el.dataset.url); c.save(); c.render(); return true;
        case 'mmcr-hdel': s.log = (s.log || []).filter(e => e.time !== +el.dataset.time); c.save(); c.render(); return true;
        case 'mmcr-hclear': MM.chromeClearDialog(c); return true;
        case 'mmcr-findclose': u.find = null; c.render(); return true;
        case 'mmcr-findnext': case 'mmcr-findprev': if (u.find?.n) { u.find.i = (u.find.i + (name === 'mmcr-findnext' ? 1 : -1) + u.find.n) % u.find.n; c.render(); } return true;
        case 'mmcr-reload': go(c, url(c), {replace: true}); return true;
        case 'mmcr-details': u.details = !u.details; c.render(); return true;
      }
      return false;
    }
  });
})();
