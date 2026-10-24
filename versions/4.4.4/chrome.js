/* Chrome 32.0.1700.99 as the stock Nexus 5 browser (Chrome.apk of KTU84P), rebuilt from the APK:
   - toolbar.xml / location_bar.xml: the 48 dp toolbar drawable (#e1e1e1 over a #898989 line; toolbar_incognito
     #4b5771), the textbox omnibox 5 dp from the top and 6 dp from the bottom with ic_suggestion_globe (or the lock),
     the 15 sp URL and btn_omnibox_reload_normal in 32 dp slots; the tab switcher button (cardstack_normal with the tab
     count in bold, 13 dip for one digit, 10 dip for two, ":)" beyond, as updateTabCountVisuals sets it) and menu_btn_bg;
   - the New Tab page: Chrome 32 opens chrome://newtab (the native NTP only behind a field trial, NewTabPage
     .isNativeNTPEnabled), the ntp_android page from resources.pak: Most visited as 108 x 72 dp thumbnails with a 1 px
     #999999 border in two columns (updateMostVisitedStylePhone), the bookmarks as 80 dp favicon cells under a 44 dp
     breadcrumb, Other devices' sync text and the incognito box; under it NewTabPageToolbar on new_tab_logo with the
     most_visited_icon / bookmarks_icon / open_tabs_icon buttons (ntp_button_incognito in incognito), the selected
     one under ntp_toolbar_button_background_selected;
   - the overview: toolbar_switcher (#111111), "New tab" with new_tab_light, cardstack_light and menu_btn_bg_light;
   - main_menu.xml as Main.prepareMenu shows it: menu_icon_row.xml (back / forward / star) and PAGE_MENU (Share and
     Add to homescreen not on chrome:// pages, Request desktop site not on the New Tab page, Find in page wherever
     there is web content, Other devices for Recent tabs without the native NTP, Print on KitKat),
     PHONE_OVERVIEW_MODE_MENU in the tab switcher; 18 sp items 9 dp in.
   Texts are the APK's (stock-strings.js, group chrome) and resources.pak's (chrome-pak.js). Pages come from the
   simulator's offline demo web shared with the AOSP Browser. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const NTP = 'chrome://newtab', HISTORY = 'chrome://history';
  const internal = url => String(url).startsWith('chrome://');
  const img = (name, alt = '') => `<img src="assets/c32-${name}.png" alt="${e(alt)}">`;
  // The image's words: the APK's strings (stock-strings.js, group chrome), resources.pak's (chrome-pak.js).
  const CS = (ctx, key) => { const row = window.StockStrings?.chrome?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en'), key) : ctx.t(key); };
  const PAK = (ctx, key) => AndroidStrings.pick(window.ChromePak?.[key], String(ctx.locale || 'en'), key);
  // ToolbarPhone.updateTabCountVisuals: the count, ":)" past two digits.
  const tabsButton = (ctx, count, light = false) => { const text = count > 99 ? ':)' : String(count); return `<button type="button" class="chr-btn chr-tabs-btn${light ? ' light' : ''}" data-action="browser-tabs" aria-label="${e(AndroidStrings.format(CS(ctx, '%1$d open tabs button.'), count))}"><span class="${text.length > 1 ? 'two' : ''}">${e(text)}</span></button>`; };
  const menuButton = (ctx, light = false) => `<button type="button" class="chr-btn chr-menu-btn" data-action="browser-menu" aria-label="${e(CS(ctx, 'More options'))}">${img(light ? 'menu_btn_bg_light' : 'menu_btn_bg')}</button>`;
  const display = url => internal(url) ? '' : url.startsWith('search:') ? url.slice(7) : url;
  function toolbar(ctx) {
    const {url, tabs, incognito} = ctx, secure = String(url).startsWith('https:');
    return `<div class="chr-toolbar${incognito ? ' incognito' : ''}"><form class="chr-omnibox" data-form="address"><span class="chr-site-icon">${secure ? img('omnibox_https_valid') : img('ic_suggestion_globe')}</span><input name="address" autocomplete="off" spellcheck="false" aria-label="${e(ctx.t('Search or type URL'))}" placeholder="${e(ctx.t('Search or type URL'))}" value="${e(display(url))}"><button type="button" class="chr-reload" data-action="browser-refresh" aria-label="${e(CS(ctx, 'Refresh page'))}">${img('btn_omnibox_reload_normal')}</button></form>${tabsButton(ctx, tabs.length)}${menuButton(ctx)}</div>`;
  }
  function thumb(ctx, url) {
    return `<div class="browser-page" inert aria-hidden="true">${ctx.page(url)}</div>`;
  }
  function mostVisited(ctx) {
    const seen = [];
    for (const url of [...ctx.data.browserHistory].reverse().concat(ctx.data.bookmarks || [])) if (!internal(url) && !url.startsWith('search:') && !seen.some(item => item.toLowerCase() === url.toLowerCase())) seen.push(url);
    return seen.slice(0, 6);
  }
  function newTabPage(ctx) {
    const {ui, incognito} = ctx;
    const section = incognito ? ui.chromeNtpIncognito || 'incognito' : ui.chromeNtp || 'most';
    let body;
    if (section === 'incognito') body = `<div class="chr-otr">${img('ntp-incognito')}<span>${PAK(ctx, 'otr').replace(/<a [^>]*>(.*?)<\/a>/, '$1')}</span></div>`;
    else if (section === 'bookmarks') body = `<div class="chr-bm-title"><span>${e(PAK(ctx, 'mobile'))}</span></div><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button type="button" class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-fav-box"><i class="chr-strip" style="background:${stripColor(url)}"></i><span class="chr-fav">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span></span><span class="chr-bm-name">${e(ctx.title(url))}</span></button>`).join('')}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${PAK(ctx, 'sync')}</div>`;
    else body = `<div class="chr-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><div class="chr-tile-thumb">${thumb(ctx, url)}<i></i></div><span class="chr-tile-title">${e(ctx.title(url))}</span></div>`).join('')}</div>`;
    const button = (id, label, icon) => `<button type="button" class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${id}" aria-label="${e(CS(ctx, label))}">${img(icon)}</button>`;
    const bar = `<nav class="chr-ntp-bar"><span class="chr-ntp-logo"></span>${incognito ? button('incognito', 'Incognito', 'ntp_button_incognito') : ''}${incognito ? '' : button('most', 'Most visited', 'most_visited_icon')}${button('bookmarks', 'Bookmarks', 'bookmarks_icon')}${incognito ? '' : button('devices', 'Other devices', 'open_tabs_icon')}</nav>`;
    return `<div class="chr-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  // The document favicon's colour strip: a dominant colour per site (FaviconWebUIHandler); the demo sites have none, so a
  // stable colour from the address stands in.
  const STRIPS = ['#4c8bf5', '#de5246', '#f4b400', '#1da462', '#9c27b0', '#ff7043'];
  const stripColor = url => STRIPS[[...String(url)].reduce((sum, c) => (sum * 31 + c.charCodeAt(0)) >>> 0, 7) % STRIPS.length];
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-clear-open">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${img('globe_favicon')}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
  }
  function find(ctx) {
    if (ctx.ui.browserFind === undefined) return '';
    return `<form class="web-find chr-find" data-form="browser-find"><input name="query" aria-label="${e(ctx.t('Find in page'))}" placeholder="${e(ctx.t('Find in page'))}" value="${e(ctx.ui.browserFind)}"><button type="submit">${e(ctx.t('Search'))}</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`;
  }
  function switcher(ctx) {
    const {tabs, active} = ctx;
    const cards = tabs.map((tab, i) => `<article class="chr-card${i === active ? ' current' : ''}${tab.incognito ? ' incognito' : ''}" style="--i:${i}"><div class="chr-card-page" role="button" tabindex="0" data-action="browser-tab" data-id="${i}" aria-label="${e(ctx.title(tab.url))}">${tab.url === NTP ? `<div class="chr-card-ntp"></div>` : thumb(ctx, tab.url)}</div><div class="chr-card-tab">${img(tab.incognito ? 'globe_incognito_favicon' : 'globe_favicon')}<button type="button" data-action="browser-tab" data-id="${i}">${e(tab.url === NTP ? CS(ctx, 'New tab') : ctx.title(tab.url))}</button><button type="button" class="chr-card-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(ctx.t('Close tab'))}">${img(tab.incognito ? 'close_tab_incognito' : 'close_tab')}</button></div></article>`).join('');
    return `<div class="app-view ics-browser chr-app chr-switcher-view"><div class="chr-switcher-bar"><button type="button" class="chr-new-tab" data-action="browser-new-tab">${img('new_tab_light')}<span>${e(CS(ctx, 'New tab'))}</span></button>${tabsButton(ctx, tabs.length, true)}${menuButton(ctx, true)}</div><div class="chr-stack">${cards}</div></div>`;
  }
  const CLEAR_ITEMS = [['history', 'Clear browsing history', true], ['cache', 'Clear the cache', true], ['cookies', 'Clear cookies, site data', true], ['passwords', 'Clear saved passwords', false], ['formdata', 'Clear autofill data', false]];
  const prefValue = (ctx, key, fallback) => (ctx.data.chromePrefs || {})[key] ?? fallback;
  function clearDialog(ctx) {
    const c = ctx.ui.chromeClear, s = key => CS(ctx, key);
    if (!c) return '';
    if (c.busy) return `<div class="chr-dlg-scrim"></div><div class="chr-dlg chr-dlg-progress" role="alertdialog"><h3>${e(s('Clearing browsing data'))}</h3><div class="chr-dlg-busy"><i class="chr-spinner"></i><p>${e(s('Please wait…'))}</p></div></div>`;
    const rows = CLEAR_ITEMS.map(([key, label]) => `<button type="button" class="chr-dlg-check${c[key] ? ' on' : ''}" data-action="chrome-clear-toggle" data-id="${key}" role="checkbox" aria-checked="${!!c[key]}"><span>${e(s(label))}</span><i></i></button>`).join('');
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-clear-cancel" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg" role="dialog"><h3>${e(s('Clear browsing data'))}</h3><div class="chr-dlg-list">${rows}</div><div class="chr-dlg-buttons"><button type="button" data-action="chrome-clear-cancel">${e(s('Cancel'))}</button><button type="button" data-action="chrome-clear-run"${CLEAR_ITEMS.some(([key]) => c[key]) ? '' : ' disabled'}>${e(s('Clear'))}</button></div></div>`;
  }
  /* Settings, Chrome 32.0.1700.99: preference_headers_phone.xml in Theme.Holo.Light (the #f2f2f2 bar, holo blue),
     with ChromePreferences' summaries (the search engine as "%1$s (%2$s)") and without Homepage, as
     HomepageManager.shouldShowHomepageSetting() is false on an image without a partner home page provider. The pages:
     - SearchEnginePreference: TemplateUrlService's engines for the device's country, the current one with
       current_search_engine; the omnibox then searches there.
     - DoNotTrackPreference, ProtectedContentPreferences, TranslatePreferences and BandwidthReductionPreferences put a
       Holo Switch in the action bar (addSwitchToActionBar) over their TextMessagePreferenceCategory texts; Learn more,
       Reset device credentials, Reset translate settings and Help come from preferences_menu.xml (Help opens the
       article). Reduce data usage, when on, shows the Data savings category with nothing compressed (the simulator
       has no Google proxy to send pages through).
     - AccessibilityPreferences: FontSizePreview (13 dp x the factor), the Text scaling SeekBarPreference (0.5–2.0 in
       0.05 steps, percent) and Force enable zoom, which follows the slider across 1.3; the factor scales web page text.
     - ContentPreferences (content_preferences.xml): Accept cookies, Enable JavaScript, Block pop-ups, Voice and video
       calling, Protected content and Google Translate (On / Off), the location row that
       GoogleLocationSettingsUtil makes "Location settings" on KitKat (it opens the system Location page instead of
       Enable location), and Website settings with its empty list (no_saved_website_settings).
     - BandwidthPreferences: Preload webpages (bandwidth_entries) and Reduce data usage ("%1$s data savings" / Off).
     privacy_preferences.xml keeps its check boxes, Usage and crash reports and 'Do Not Track'; CLEAR BROWSING DATA in
     the bar opens the dialog. About Chrome lists the version and the operating system. Texts are the image's Chrome
     strings (stock-strings.js, group chrome). */
  const PREFS = {version: '32.0.1700.99', os: 'Android 4.4.4; Nexus 5 Build/KTU84P', material: false,
    headers: [['cat', 'Basics'], ['search_engine', 'Search engine'], ['autofill', 'Autofill forms'], ['passwords', 'Save passwords'], ['cat', 'Advanced'], ['privacy', 'Privacy'], ['accessibility', 'Accessibility'], ['content', 'Content settings'], ['bandwidth', 'Bandwidth management'], ['about', 'About Chrome']],
    privacy: [['check', 'navigation_error', 'Navigation error suggestions', 'Navigation error summary'], ['check', 'search_suggestions', 'Search and URL suggestions', 'Search suggestions summary'], ['check', 'network_predictions', 'Network action predictions', 'Network predictions summary'], ['list', 'crash', 'Usage and crash reports', ['Always send', 'Only send on Wi-Fi', 'Never send'], 2], ['screen', 'dnt', "'Do Not Track'"]],
    topMenu: [['chrome-unsupported', 'Help']], clearInBar: true};
  // TemplateUrlService's prepopulated engines by country (Chromium 32.0.1700.99 template_url_prepopulate_data.cc and
  // prepopulated_engines.json): the name, the keyword and the results page the omnibox opens (none: Google's own).
  const ENGINES = {
    US: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?setmkt=en-US&q='], ['Yahoo!', 'yahoo.com', 'search.yahoo.com/search?ei=UTF-8&fr=crmas&p='], ['AOL', 'aol.com', 'search.aol.com/aol/search?query='], ['Ask', 'ask.com', 'www.ask.com/web?q=']],
    HU: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?q='], ['Yahoo!', 'yahoo.com', 'search.yahoo.com/search?ei=UTF-8&fr=crmas&p=']],
    DE: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?setmkt=de-DE&q='], ['Yahoo! Deutschland', 'de.yahoo.com', 'de.search.yahoo.com/search?ei=UTF-8&fr=crmas&p=']],
    FR: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?setmkt=fr-FR&q='], ['Yahoo! France', 'fr.yahoo.com', 'fr.search.yahoo.com/search?ei=UTF-8&fr=crmas&p=']],
    ES: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?setmkt=es-ES&q='], ['Yahoo! España', 'es.yahoo.com', 'es.search.yahoo.com/search?ei=UTF-8&fr=crmas&p=']]};
  const COUNTRY = {en: 'US', hu: 'HU', de: 'DE', fr: 'FR', es: 'ES'};
  const lang = ctx => String(ctx.locale || 'en').slice(0, 2);
  const engines = ctx => ENGINES[COUNTRY[lang(ctx)]] || ENGINES.US;
  const engine = ctx => engines(ctx)[prefValue(ctx, 'search_engine', 0)] || engines(ctx)[0];
  // The omnibox's search: Google's own results stay the simulator's search: page, another engine gets its results URL.
  function searchUrl(term, ctx) { const [, , url] = engine(ctx); return url ? url + encodeURIComponent(term).split('%20').join('+') : `search:${term}`; }
  function searchResult(url) {
    for (const list of Object.values(ENGINES)) for (const [name, , base] of list) if (base && url.startsWith(base)) return {name, term: decodeURIComponent(url.slice(base.length).replace(/\+/g, ' '))};
    return null;
  }
  const DEFAULTS = {dnt: false, protected_content: true, translate: true, reduce_data: false, force_enable_zoom: false, accept_cookies: true, enable_javascript: true, block_popups: false, voice_and_video_calling: true, text_scale: 1};
  const prefDefault = key => key in DEFAULTS ? DEFAULTS[key] : true;
  const pref = (ctx, key) => prefValue(ctx, key, prefDefault(key));
  const textScale = ctx => Number(pref(ctx, 'text_scale')) || 1;
  const LEARN = {dnt: 'https://support.google.com/chrome/?p=settings_do_not_track', protected: 'https://support.google.com/chrome/?p=mobile_protected_content', bandwidth: 'https://support.google.com/chrome/?p=mobile_bandwidth', translate: 'https://support.google.com/chrome/?p=mobile_translate'};
  function pages(ctx) {
    const on = key => pref(ctx, key), onOff = key => on(key) ? 'On' : 'Off';
    return {
      search_engine: {title: 'Search engine', rows: engines(ctx).map((item, i) => ['engine', i])},
      privacy: {title: 'Privacy', rows: PREFS.privacy},
      dnt: {title: "'Do Not Track'", sw: 'dnt', rows: [['text', 'Do Not Track description']], menu: [['chrome-pref-link', 'Learn more', LEARN.dnt]]},
      accessibility: {title: 'Accessibility', rows: [['preview'], ['seek'], ['check', 'force_enable_zoom', 'Force enable zoom', 'Force enable zoom summary']]},
      content: {title: 'Content settings', rows: [['check', 'accept_cookies', 'Accept cookies', 'Allow sites to save and read cookie data'], ['check', 'enable_javascript', 'Enable JavaScript', 'Allow sites to run JavaScript'], ['check', 'block_popups', 'Block pop-ups', 'Block pop-ups from all sites'], ['check', 'voice_and_video_calling', 'Voice and video calling', 'Allow sites to access microphone and camera'], ['screen', 'protected', 'Protected content', onOff('protected_content')], ['screen', 'translate', 'Google Translate', onOff('translate')], ['external', 'location', 'Location settings', 'Allow sites to request access to your location'], ['screen', 'sites:all', 'Website settings', 'Advanced settings for individual websites']]},
      'sites:all': {title: 'Website settings', rows: [['sites']]},
      protected: {title: 'Protected content', sw: 'protected_content', rows: [['text', 'Protected content description'], ['link', 'Learn more', LEARN.protected]], menu: [['chrome-pref-reset', 'Reset device credentials', 'protected']]},
      translate: {title: 'Google Translate', sw: 'translate', rows: [['text', 'Translate description']], menu: [['chrome-pref-reset', 'Reset translate settings', 'translate'], ['chrome-pref-link', 'Help', LEARN.translate]]},
      bandwidth: {title: 'Bandwidth management', rows: [['list', 'prefetch_bandwidth', 'Preload webpages', ['Always', 'Only on Wi-Fi', 'Never'], 1], ['screen', 'reduce', 'Reduce data usage']]},
      reduce: {title: 'Reduce data usage', sw: 'reduce_data', rows: on('reduce_data') ? [['stats']] : [['text', 'Reduce data usage description'], ['text', 'Safe Browsing description'], ['text', 'Data reduction caveats']], menu: [['chrome-pref-link', 'Learn more', LEARN.bandwidth]]},
      about: {title: 'About Chrome', rows: [['info', 'Application version', `Chrome ${PREFS.version}`], ['info', 'Operating system', PREFS.os], ['screen-limit', 'legal', 'Legal information']]}
    };
  }
  // The summaries ChromePreferences, ContentPreferences, BandwidthPreferences and PrivacyPreferences set.
  function summary(ctx, id) {
    const s = key => CS(ctx, key), onOff = value => s(value ? 'On' : 'Off');
    if (id === 'search_engine') { const [name, keyword] = engine(ctx); return AndroidStrings.format(s('%1$s (%2$s)'), name, keyword); }
    if (id === 'reduce') return pref(ctx, 'reduce_data') ? AndroidStrings.format(s('%1$s data savings'), `${(0).toLocaleString(ctx.locale)}%`) : onOff(false);
    if (id === 'dnt') return onOff(pref(ctx, 'dnt'));
    return '';
  }
  function listRow(ctx, key) { for (const page of Object.values(pages(ctx))) for (const row of page.rows) if (row[0] === 'list' && row[1] === key) return row; return null; }
  function listDialog(ctx) {
    const open = ctx.ui.chromeList, s = key => CS(ctx, key), item = open && listRow(ctx, open);
    if (!item) return '';
    const value = prefValue(ctx, item[1], item[4]);
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-list-close" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg" role="dialog"><h3>${e(s(item[2]))}</h3><div class="chr-dlg-list">${item[3].map((label, i) => `<button type="button" class="chr-dlg-radio${value === i ? ' on' : ''}" data-action="chrome-list-pick" data-id="${item[1]}:${i}" role="radio" aria-checked="${value === i}"><span>${e(s(label))}</span><i></i></button>`).join('')}</div><div class="chr-dlg-buttons"><button type="button" data-action="chrome-list-close">${e(s('Cancel'))}</button></div></div>`;
  }
  // DocumentModeEnabler's confirmation and the Reset device credentials confirmation.
  function confirmDialog(ctx) {
    const c = ctx.ui.chromeConfirm, s = key => CS(ctx, key);
    if (!c) return '';
    const [title, message] = c === 'document_mode' ? (pref(ctx, 'document_mode') ? ['Separate tabs and apps', 'Tabs will move to a tab switcher inside Chrome.'] : ['Merge tabs and apps', 'Tabs will live together with recent apps.']) : ['Confirm device credential deletion', 'Protected content reset message'];
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-confirm" data-id="cancel" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg chr-dlg-message" role="alertdialog"><h3>${e(s(title))}</h3><p>${e(s(message))}</p><div class="chr-dlg-buttons"><button type="button" data-action="chrome-confirm" data-id="cancel">${e(s('Cancel'))}</button><button type="button" data-action="chrome-confirm" data-id="ok">${e(s('OK'))}</button></div></div>`;
  }
  const check = on => `<i class="chr-pref-check${on ? ' on' : ''}" role="checkbox" aria-checked="${on}"></i>`;
  // Theme.Holo.Light's Switch: the thumb carries ON / OFF (framework capital_on / capital_off).
  const toggle = (on, cls = '', label = '') => `<i class="chr-pref-switch holo${cls}${on ? ' on' : ''}" role="switch" aria-checked="${on}"><i>${e(label)}</i></i>`;
  function settings(ctx) {
    const {ui} = ctx, s = key => CS(ctx, key), stack = ui.chromePrefStack || [], id = stack[stack.length - 1] || '', all = pages(ctx), page = all[id];
    const row = (action, rowId, label, small = '', extra = '', icon = '') => `<button type="button" class="chr-pref${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(rowId)}">${icon ? `<img class="chr-pref-icon" src="assets/${icon}.png" alt="">` : ''}<span class="chr-pref-text"><b>${e(label)}</b>${small ? `<small>${e(small)}</small>` : ''}</span>${extra}</button>`;
    const percent = value => Math.round(value * 100).toLocaleString(ctx.locale) + '%';
    const draw = item => {
      const [kind, key, label] = item;
      if (kind === 'cat') return `<h4 class="chr-pref-cat">${e(s(key))}</h4>`;
      if (kind === 'check') { const value = pref(ctx, key); return row('chrome-pref-toggle', key, s(label), s(item[3]), check(value), item[4]); }
      if (kind === 'list') return row('chrome-list-open', key, s(label), s(item[3][prefValue(ctx, key, item[4])]));
      if (kind === 'screen') return row(all[key] ? 'chrome-pref' : 'chrome-unsupported', key, s(label), item[3] ? s(item[3]) : summary(ctx, key), '', item[4]);
      if (kind === 'screen-limit') return row('chrome-unsupported', key, s(label));
      if (kind === 'external') return row('chrome-pref-ext', key, s(label), s(item[3]));
      if (kind === 'info') return row('chrome-noop', key, s(key), label);
      if (kind === 'text') return `<p class="chr-pref-note">${e(s(key))}</p>`;
      if (kind === 'link') return row('chrome-pref-link', item[2], s(key));
      if (kind === 'engine') { const [name, keyword] = engines(ctx)[key], current = engines(ctx).indexOf(engine(ctx)) === key; return row('chrome-engine', key, AndroidStrings.format(s('%1$s (%2$s)'), name, keyword), current ? s('Currently selected search engine') : ''); }
      if (kind === 'toggle') { const value = pref(ctx, key); return row('chrome-pref-toggle', key, s(label), s(value ? item[3] : item[4]), toggle(value, '', s(value ? 'ON' : 'OFF'))); }
      if (kind === 'sites') return `<p class="chr-pref-empty">${e(s('You have no saved website settings.'))}</p>`;
      if (kind === 'preview') return `<div class="chr-pref-preview"><b>${e(s('Preview'))}</b><p style="font-size:calc(${13 * textScale(ctx)} * var(--dp))">${e(s('Font size preview text'))}</p></div>`;
      if (kind === 'seek') return `<div class="chr-pref-seek"><b>${e(s('Text scaling'))}</b><label><span data-chr-scale>${e(percent(textScale(ctx)))}</span><input type="range" min="50" max="200" step="5" value="${Math.round(textScale(ctx) * 100)}" data-chr-seek aria-label="${e(s('Text scaling'))}"></label></div>`;
      if (kind === 'stats') return `<h4 class="chr-pref-cat">${e(s('Data savings'))}</h4><div class="chr-pref-stats"><b>${e(`${(0).toLocaleString(ctx.locale)}%`)}</b><span>${e(AndroidStrings.format(s('%1$s original size'), '0 KB'))}</span><span>${e(AndroidStrings.format(s('%1$s after compression'), '0 KB'))}</span></div>`;
      return '';
    };
    let body;
    if (page) body = page.rows.map(draw).join('');
    else body = PREFS.headers.map(([hid, label]) => hid === 'cat' ? `<h4 class="chr-pref-cat">${e(s(label))}</h4>` : row(all[hid] ? 'chrome-pref' : 'chrome-unsupported', hid, s(label), summary(ctx, hid))).join('');
    const title = page ? s(page.title) : s('Settings');
    const menuItems = id === 'privacy' ? [...(PREFS.clearInBar ? [] : [['chrome-clear-open', 'Clear browsing data']]), ['chrome-unsupported', 'Help']] : page ? page.menu || [] : PREFS.topMenu;
    const clearButton = id === 'privacy' && PREFS.clearInBar ? `<button type="button" class="chr-pref-action" data-action="chrome-clear-open">${e(s('Clear browsing data'))}</button>` : '';
    const sw = page?.sw ? `<button type="button" class="chr-pref-barswitch" data-action="chrome-pref-switch" data-id="${page.sw}" role="switch" aria-checked="${!!pref(ctx, page.sw)}" aria-label="${e(title)}">${toggle(pref(ctx, page.sw), ' bar', s(pref(ctx, page.sw) ? 'ON' : 'OFF'))}</button>` : '';
    const overflow = menuItems.length ? `<button type="button" class="chr-pref-more" data-action="chrome-pref-menu" aria-label="${e(ctx.t('More options'))}"><i></i><i></i><i></i></button>` : '';
    const popup = ui.chromePrefMenu && menuItems.length ? `<button type="button" class="chr-pref-popup-scrim" data-action="chrome-pref-menu" aria-label="${e(ctx.t('Close'))}"></button><div class="chr-pref-popup" role="menu">${menuItems.map(([action, label, mid]) => `<button type="button" role="menuitem" data-action="${action}"${mid ? ` data-id="${e(mid)}"` : ''}>${e(s(label))}</button>`).join('')}</div>` : '';
    return `<div class="app-view chr-prefs${PREFS.material ? ' material' : ''}" data-chr-page="${e(id)}"><header class="chr-pref-bar"><button type="button" class="chr-pref-up" data-action="back" aria-label="${e(ctx.t('Navigate up'))}">${PREFS.material ? '<i></i>' : '<img class="chr-pref-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="chr-pref-icon" src="assets/chrome.png" alt="">'}</button><b>${e(title)}</b>${sw}${clearButton}${overflow}</header><div class="chr-pref-scroll">${body}</div>${popup}${listDialog(ctx)}${confirmDialog(ctx)}${clearDialog(ctx)}</div>`;
  }
  /* Actions of the settings pages; returns true when it handled one. A switch with a confirmation (Merge tabs and apps)
     waits for OK; the Text scaling slider saves as it moves and Force enable zoom follows it across 130 %. */
  function prefAction(action, id, ctx) {
    const {ui, data} = ctx, prefs = data.chromePrefs ||= {};
    if (action === 'chrome-pref') { ui.chromePrefStack = [...(ui.chromePrefStack || []), id]; ui.chromePrefMenu = false; return 'render'; }
    if (action === 'chrome-pref-toggle') { prefs[id] = !pref(ctx, id); return 'save'; }
    if (action === 'chrome-pref-switch') { if (id === 'document_mode') { ui.chromeConfirm = id; return 'render'; } prefs[id] = !pref(ctx, id); return 'save'; }
    if (action === 'chrome-confirm') { const c = ui.chromeConfirm; ui.chromeConfirm = ''; if (id === 'ok' && c === 'document_mode') prefs.document_mode = !pref(ctx, 'document_mode'); return id === 'ok' ? 'save' : 'render'; }
    if (action === 'chrome-engine') { prefs.search_engine = Number(id); return 'save'; }
    if (action === 'chrome-pref-reset') { ui.chromePrefMenu = false; if (id === 'protected') { ui.chromeConfirm = 'protected'; return 'render'; } return {toast: CS(ctx, 'Your translate settings have been reset.')}; }
    if (action === 'chrome-pref-link') { ui.chromePrefMenu = false; return {open: id}; }
    if (action === 'chrome-pref-ext') return {external: id};
    return '';
  }
  function prefSeek(value, ctx) {
    const prefs = ctx.data.chromePrefs ||= {}, before = textScale(ctx), scale = Math.round(Number(value)) / 100;
    prefs.text_scale = scale;
    if (before < 1.3 && scale >= 1.3) prefs.force_enable_zoom = true; else if (before >= 1.3 && scale < 1.3) prefs.force_enable_zoom = false;
  }
  // While the slider moves, only its percentage, the preview and Force enable zoom change (a redraw would end the drag).
  function seekPaint(root, ctx) {
    const scale = textScale(ctx), label = root.querySelector('[data-chr-scale]'), preview = root.querySelector('.chr-pref-preview p'), zoom = root.querySelector('.chr-pref[data-id="force_enable_zoom"] .chr-pref-check');
    if (label) label.textContent = Math.round(scale * 100).toLocaleString(ctx.locale) + '%';
    if (preview) preview.style.fontSize = `calc(${13 * scale} * var(--dp))`;
    if (zoom) { const on = !!pref(ctx, 'force_enable_zoom'); zoom.classList.toggle('on', on); zoom.setAttribute('aria-checked', String(on)); }
  }
  function prefBack(ui) {
    if (ui.chromeConfirm) { ui.chromeConfirm = ''; return true; }
    if (ui.chromePrefStack?.length) { ui.chromePrefStack = ui.chromePrefStack.slice(0, -1); return true; }
    return false;
  }
  function render(ctx) {
    if (ctx.ui.sub === 'chrome-settings') return settings(ctx);
    if (ctx.ui.sub === 'tabs') return switcher(ctx);
    const content = ctx.url === NTP ? newTabPage(ctx) : ctx.url === HISTORY ? historyPage(ctx) : `<div class="browser-page"${textScale(ctx) !== 1 ? ` style="font-size:${Math.round(textScale(ctx) * 100)}%"` : ''}>${ctx.page(ctx.url)}</div>`;
    return `<div class="app-view ics-browser chr-app${ctx.incognito ? ' chr-incognito' : ''}">${toolbar(ctx)}${find(ctx)}${content}${clearDialog(ctx)}</div>`;
  }
  // main_menu.xml through Main.prepareMenu: the icon row and PAGE_MENU on a page, PHONE_OVERVIEW_MODE_MENU in the tab
  // switcher (Close all tabs, or Close incognito tabs when the incognito stack is shown).
  function menu(ctx) {
    const {ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url), page = !internal(ctx.url);
    const item = (action, label, extra = '') => `<button type="button" data-action="${action}" role="menuitem"><span>${e(CS(ctx, label))}</span>${extra}</button>`;
    if (ui.sub === 'tabs') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${[item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), ctx.incognito ? item('chrome-close-all', 'Close incognito tabs') : item('chrome-close-all', 'Close all tabs'), item('chrome-settings', 'Settings')].join('')}</div>`;
    const top = `<div class="chr-menu-icons"><button type="button" data-action="browser-back-menu" aria-label="${e(CS(ctx, 'Go back'))}" ${ui.browserIndex > 0 ? '' : 'disabled'}>${img(ui.browserIndex > 0 ? 'back' : 'back_disabled')}</button><i></i><button type="button" data-action="browser-forward" aria-label="${e(CS(ctx, 'Go forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}>${img(ui.browserIndex < ui.browserHistory.length - 1 ? 'forward' : 'forward_disabled')}</button><i></i><button type="button" data-action="browser-save" aria-label="${e(CS(ctx, bookmarked ? 'Edit bookmark page' : 'Bookmark page'))}" ${page ? '' : 'disabled'}>${img(bookmarked ? 'star_lit' : 'star')}</button></div>`;
    const items = [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), ctx.incognito ? '' : item('chrome-devices', 'Other devices'), item('chrome-history', 'History'), page ? item('chrome-share', 'Share…') : '', item('chrome-unsupported', 'Print…'), item('browser-find', 'Find in page'), page && !ctx.incognito ? item('chrome-unsupported', 'Add to homescreen') : '', ctx.url !== NTP ? item('chrome-desktop', 'Request desktop site', `<img class="chr-check" src="assets/btn_check_${ui.chromeDesktop ? 'on' : 'off'}_holo_light.png" alt="">`) : '', item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal, CLEAR_ITEMS, searchUrl, searchResult, prefAction, prefSeek, seekPaint, prefBack, prefDefault, DEFAULTS};
})();
