/* Chrome 40.0.2214.89 on the Nexus 6 (Chrome.apk of LMY48Y): the Material #F2F2F2 toolbar (#505050 incognito) with the
   white omnibox (magnifier or page icon, "Search or type URL"), the tab switcher with the count and the menu; pages come
   from the simulator's offline demo web shared with the AOSP Browser. From the APK:
   - main_menu.xml as ChromeAppMenuPropertiesDelegate.prepareMenu shows it: three_button_menu_item.xml's Forward,
     Bookmark this page and Refresh, then New tab, New incognito tab, Bookmarks, Recent tabs (not in incognito),
     History, Share… (not on chrome:// pages), Print…, Find in page and Request desktop site (not on native pages such
     as the New Tab page), Add to homescreen, Settings, Help & feedback; OVERVIEW_MODE_MENU in the tab switcher;
   - the native New Tab page (new_tab_page.xml; Chrome 40 has no chrome://newtab web page any more): the Google logo,
     the 48 dp search box, MostVisitedLayout's 156 x 130 dp most_visited_item.xml tiles (the 12 sp title above the
     148 x 94 dp thumbnail on #f2f2f2 with 2 dp corners, 16 dp apart) and NewTabPageToolbar's Bookmarks / Recent tabs;
   - new_tab_page_incognito.xml: #222222, incognito_splash, the 24 sp light #d2d2d2 header, the 14 sp #bdbdbd message
     and LEARN MORE in #03a9f4.
   Texts are the APK's (stock-strings.js, group chrome). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const NTP = 'chrome://newtab', HISTORY = 'chrome://history';
  const internal = url => String(url).startsWith('chrome://');
  // Chrome 40's own drawables (chr40-*).
  const img = (name, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="assets/chr40-${name}.png" alt="">`;
  const tabsButton = count => `<button type="button" class="chr-btn chr-tabs-btn" data-action="browser-tabs" aria-label="Tabs"><span>${count > 99 ? ':D' : count}</span></button>`;
  const menuButton = '<button type="button" class="chr-btn" data-action="browser-menu" aria-label="More options">' + img('btn_menu') + '</button>';
  const display = url => internal(url) ? '' : url.startsWith('search:') ? url.slice(7) : url;
  function toolbar(ctx) {
    const {url, t, tabs, incognito} = ctx;
    const lead = url === NTP || internal(url) ? 'ic_omnibox_magnifier' : 'ic_omnibox_page';
    return `<div class="chr-toolbar chr40-toolbar${incognito ? ' incognito' : ''}"><form class="chr-omnibox chr40-omnibox" data-form="address"><img class="chr40-lead" src="assets/chr40-${lead}.png" alt=""><input name="address" autocomplete="off" spellcheck="false" aria-label="${e(t('Search or type URL'))}" placeholder="${e(t('Search or type URL'))}" value="${e(url === NTP ? '' : display(url))}"></form>${tabsButton(tabs.length)}${menuButton}</div>`;
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
    const {t, ui, incognito} = ctx;
    if (incognito) return `<div class="chr-ntp chr40-ntp incognito"><div class="chr-ntp-scroll"><div class="chr40-otr"><img src="assets/chr40-incognito_splash.png" alt=""><h3>${e(CS(ctx, "You've gone incognito."))}</h3><p>${e(CS(ctx, 'Incognito message'))}</p><button type="button" class="chr40-learn" data-action="chrome-unsupported">${e(CS(ctx, 'Learn more'))}</button></div></div></div>`;
    const section = ui.chromeNtp || 'most';
    let body;
    if (section === 'bookmarks') body = `<h3 class="chr-ntp-title">${e(t('Mobile bookmarks'))}</h3><div class="chr-bookmarks">${(ctx.data.bookmarks || []).map(url => `<button class="chr-bookmark" data-action="browser-bookmark" data-id="${e(url)}"><span class="chr-favicon">${e(ctx.title(url).slice(0, 1).toUpperCase())}</span><span>${e(ctx.title(url))}</span></button>`).join('') || `<p class="chr-empty">${e(t('No bookmarks'))}</p>`}</div>`;
    else if (section === 'devices') body = `<div class="chr-devices">${img('recent_laptop')}<p>${e(t('Tabs that you have open in Chrome on your other devices will appear here.'))}</p><p>${e(t('Sign in to Chrome to see them.'))}</p></div>`;
    else body = `<div class="chr40-logo"><img src="assets/chr40-google_logo.png" alt="Google"></div><form class="chr40-fakebox" data-form="address"><input name="address" autocomplete="off" aria-label="${e(CS(ctx, 'Search or type URL'))}" placeholder="${e(CS(ctx, 'Search or type URL'))}"><button type="button" data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/chr40-btn_omnibox_mic_normal.png" alt=""></button></form><div class="chr-most chr40-most">${mostVisited(ctx).map(url => `<div class="chr-tile" role="button" tabindex="0" data-action="browser-link" data-url="${e(url)}" aria-label="${e(ctx.title(url))}"><span class="chr-tile-title">${e(ctx.title(url))}</span><div class="chr-tile-thumb">${thumb(ctx, url)}</div></div>`).join('')}</div>`;
    const tab = (id, label, img) => `<button class="${section === id ? 'active' : ''}" data-action="chrome-ntp" data-id="${section === id && id !== 'most' ? 'most' : id}"><img src="assets/chr40-${img}.png" alt=""><span>${e(CS(ctx, label))}</span></button>`;
    const bar = `<nav class="chr-ntp-bar chr40-ntp-bar">${tab('bookmarks', 'Bookmarks', 'eb_star')}${tab('devices', 'Recent tabs', 'btn_recents')}</nav>`;
    return `<div class="chr-ntp chr40-ntp chr-ntp-${section}"><div class="chr-ntp-scroll">${body}</div>${bar}</div>`;
  }
  function historyPage(ctx) {
    const {t, data, locale} = ctx;
    const query = String(ctx.ui.chromeHistoryQuery || '').toLocaleLowerCase();
    const rows = [...new Set([...data.browserHistory].reverse())].filter(url => !internal(url) && (!query || `${ctx.title(url)} ${url}`.toLocaleLowerCase().includes(query))).slice(0, 40);
    return `<div class="chr-history"><form class="chr-history-search" data-form="chrome-history-search"><input name="query" aria-label="${e(t('Search history'))}" placeholder="${e(t('Search history'))}" value="${e(ctx.ui.chromeHistoryQuery || '')}"><button type="submit">${e(t('Search history'))}</button></form><button class="chr-clear" data-action="chrome-clear-open">${e(t('Clear browsing data…'))}</button><h3>${e(new Date().toLocaleDateString(locale, {weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'}))}</h3>${rows.map(url => `<button class="chr-history-row" data-action="browser-link" data-url="${e(url)}"><span class="chr-globe">${img('ic_suggestion_page')}</span><span><strong>${e(ctx.title(url))}</strong><small>${e(display(url))}</small></span></button>`).join('') || `<p class="chr-empty">${e(t('No history'))}</p>`}</div>`;
  }
  function find(ctx) {
    if (ctx.ui.browserFind === undefined) return '';
    return `<form class="web-find chr-find" data-form="browser-find"><input name="query" aria-label="${e(ctx.t('Find in page'))}" placeholder="${e(ctx.t('Find in page'))}" value="${e(ctx.ui.browserFind)}"><button type="submit">${e(ctx.t('Search'))}</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`;
  }
  function switcher(ctx) {
    const {t, tabs, active} = ctx;
    const cards = tabs.map((tab, i) => `<article class="chr-card${i === active ? ' current' : ''}${tab.incognito ? ' incognito' : ''}" style="--i:${i}"><div class="chr-card-page" role="button" tabindex="0" data-action="browser-tab" data-id="${i}" aria-label="${e(ctx.title(tab.url))}">${tab.url === NTP ? `<div class="chr-card-ntp">${tab.incognito ? img('incognito_splash', 'chr40-card-incognito') : '<img src="assets/chrome.png" alt="">'}</div>` : thumb(ctx, tab.url)}</div><div class="chr-card-tab"><span class="chr-globe">${img('ic_suggestion_page')}</span><button data-action="browser-tab" data-id="${i}">${e(tab.url === NTP ? t('New tab') : ctx.title(tab.url))}</button><button class="chr-card-close" data-action="browser-close-tab" data-id="${i}" aria-label="${e(t('Close tab'))}">${img('btn_tab_close_normal')}</button></div></article>`).join('');
    return `<div class="app-view ics-browser chr-app chr-switcher-view"><div class="chr-switcher-bar"><button class="chr-new-tab" data-action="browser-new-tab">${img('btn_new_tab_white_normal')}<span>${e(t('New tab'))}</span></button>${tabsButton(tabs.length)}${menuButton}</div><div class="chr-stack">${cards}</div></div>`;
  }
  const CS = (ctx, key) => { const row = window.StockStrings?.chrome?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const CLEAR_ITEMS = [['history', 'Clear browsing history', true], ['cache', 'Clear the cache', true], ['cookies', 'Clear cookies, site data', true], ['passwords', 'Clear saved passwords', false], ['formdata', 'Clear autofill data', false]];
  const prefValue = (ctx, key, fallback) => (ctx.data.chromePrefs || {})[key] ?? fallback;
  function clearDialog(ctx) {
    const c = ctx.ui.chromeClear, s = key => CS(ctx, key);
    if (!c) return '';
    if (c.busy) return `<div class="chr-dlg-scrim"></div><div class="chr-dlg chr-dlg-progress" role="alertdialog"><h3>${e(s('Clearing browsing data'))}</h3><div class="chr-dlg-busy"><i class="chr-spinner"></i><p>${e(s('Please wait…'))}</p></div></div>`;
    const rows = CLEAR_ITEMS.map(([key, label]) => `<button type="button" class="chr-dlg-check${c[key] ? ' on' : ''}" data-action="chrome-clear-toggle" data-id="${key}" role="checkbox" aria-checked="${!!c[key]}"><span>${e(s(label))}</span><i></i></button>`).join('');
    return `<button type="button" class="chr-dlg-scrim" data-action="chrome-clear-cancel" aria-label="${e(s('Cancel'))}"></button><div class="chr-dlg" role="dialog"><h3>${e(s('Clear browsing data'))}</h3><div class="chr-dlg-list">${rows}</div><div class="chr-dlg-buttons"><button type="button" data-action="chrome-clear-cancel">${e(s('Cancel'))}</button><button type="button" data-action="chrome-clear-run"${CLEAR_ITEMS.some(([key]) => c[key]) ? '' : ' disabled'}>${e(s('Clear'))}</button></div></div>`;
  }
  /* Settings, Chrome 40.0.2214.89: main_preferences.xml in PreferencesTheme (Material Light, the #263238 bar, accent
     #03a9f4). MainPreferences fills the summaries (the search engine as "%1$s (%2$s)", On / Off, Reduce data usage
     "%1$s data savings" or Off) and drops Home page, as HomepageManager.shouldShowHomepageSetting() is false on an image
     without a partner home page provider. The pages:
     - SearchEnginePreference: TemplateUrlService's engines for the device's country, the current one with
       current_search_engine; the omnibox then searches there.
     - DocumentModePreference ("Merge tabs and apps"), DoNotTrackPreference, ContextualSearchPreferenceFragment ("Touch
       to Search"), ProtectedContentPreferences, TranslatePreferences and BandwidthReductionPreferences put their switch
       in the action bar (addSwitchToActionBar) over their TextMessagePreference texts; DocumentModeEnabler confirms
       with tabs_and_apps_turn_on/off_title; Learn more, Reset device credentials and Reset translate settings come from
       preferences_menu.xml. Reduce data usage, when on, shows data_reduction_statistics_layout with nothing compressed
       (the simulator has no Google proxy to send pages through).
     - AccessibilityPreferences: FontSizePreview (13 dp x the factor on font_preview_background), the Text scaling
       SeekBarPreference (0.5–2.0 in 0.05 steps, NumberFormat percent) and Force enable zoom, which follows the slider
       across 1.3; the factor scales the text of web pages.
     - ContentPreferences ("Site settings", content_preferences.xml for SDK 21): All sites, Cookies, Location, Camera or
       microphone, JavaScript, Pop-ups, Protected content, Google Translate and Storage with their icons; the category
       rows show Website.PermissionDataEntry's Ask first / Allowed / Blocked and open WebsitePreferences with the
       read_write_toggle and the site list (no_saved_website_settings while empty).
     privacy_preferences.xml keeps its check boxes and lists; Clear browsing data opens the dialog. About Chrome lists
     the version and the operating system. Texts are the image's Chrome strings (stock-strings.js, group chrome). */
  const PREFS = {version: '40.0.2214.89', os: 'Android 5.1.1; Nexus 6 Build/LMY48Y', material: true,
    headers: [['signin', 'Sign in to Chrome'], ['cat', 'Basics'], ['search_engine', 'Search engine'], ['tabs_apps', 'Merge tabs and apps'], ['autofill', 'Autofill forms'], ['passwords', 'Save passwords'], ['cat', 'Advanced'], ['privacy', 'Privacy'], ['accessibility', 'Accessibility'], ['content', 'Content settings'], ['bandwidth', 'Reduce data usage'], ['about', 'About Chrome']],
    privacy: [['check', 'navigation_error', 'Navigation error suggestions', 'Navigation error summary'], ['check', 'search_suggestions', 'Search and URL suggestions', 'Search suggestions summary'], ['screen', 'contextual', 'Touch to Search'], ['list', 'network_predictions', 'Network action predictions', ['Always', 'Only on Wi-Fi', 'Never'], 1], ['list', 'crash', 'Usage and crash reports', ['Always send', 'Only send on Wi-Fi', 'Never send'], 2], ['screen', 'dnt', "'Do Not Track'"]],
    topMenu: [['chrome-unsupported', 'Help']], clearInBar: false};
  // TemplateUrlService's prepopulated engines by country (Chromium 40.0.2214.89 template_url_prepopulate_data.cc and
  // prepopulated_engines.json): the name, the keyword and the results page the omnibox opens (none: Google's own).
  const ENGINES = {
    US: [['Google', 'google.com'], ['Bing', 'bing.com', 'www.bing.com/search?setmkt=en-US&q='], ['Yahoo!', 'yahoo.com', 'search.yahoo.com/search?ei=UTF-8&fr=crmas&p='], ['AOL', 'aol.com', 'search.aol.com/aol/search?q='], ['Ask', 'ask.com', 'www.ask.com/web?q=']],
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
  const DEFAULTS = {document_mode: true, contextual_search: true, dnt: false, protected_content: true, translate: true, reduce_data: false, force_enable_zoom: false, accept_cookies: true, enable_javascript: true, site_location: true, site_media: true, site_popups: false, text_scale: 1};
  const prefDefault = key => key in DEFAULTS ? DEFAULTS[key] : true;
  const pref = (ctx, key) => prefValue(ctx, key, prefDefault(key));
  const textScale = ctx => Number(pref(ctx, 'text_scale')) || 1;
  const LEARN = {dnt: 'https://support.google.com/chrome/?p=settings_do_not_track', contextual: 'https://support.google.com/chrome/answer/95440#android', protected: 'https://support.google.com/chrome/?p=mobile_protected_content', bandwidth: 'https://support.google.com/chrome/?p=mobile_bandwidth'};
  // Website.PermissionDataEntry: the toggle key, title, icon and the values the switch means.
  const SITES = {location: ['site_location', 'Location', 'permission_location', 'Ask first', 'Blocked'], media: ['site_media', 'Camera or microphone', 'permission_media', 'Ask first', 'Blocked'], popups: ['site_popups', 'Pop-ups', 'permission_popups', 'Allowed', 'Blocked']};
  function pages(ctx) {
    const on = key => pref(ctx, key);
    const site = id => { const [key, title, icon, yes, no] = SITES[id]; return ['screen', `site:${id}`, title, on(key) ? yes : no, icon]; };
    const all = {
      search_engine: {title: 'Search engine', rows: engines(ctx).map((item, i) => ['engine', i])},
      tabs_apps: {title: 'Merge tabs and apps', sw: 'document_mode', rows: [['text', 'Tabs live together with recent apps.']]},
      privacy: {title: 'Privacy', rows: PREFS.privacy},
      dnt: {title: "'Do Not Track'", sw: 'dnt', rows: [['text', 'Do Not Track description']], menu: [['chrome-pref-link', 'Learn more', LEARN.dnt]]},
      contextual: {title: 'Touch to Search', sw: 'contextual_search', rows: [['text', 'Touch to Search description']], menu: [['chrome-pref-link', 'Learn more', LEARN.contextual]]},
      accessibility: {title: 'Accessibility', rows: [['preview'], ['seek'], ['check', 'force_enable_zoom', 'Force enable zoom', 'Force enable zoom summary']]},
      content: {title: 'Content settings', rows: [['screen', 'sites:all', 'All sites', '', 'settings_all_sites'], ['check', 'accept_cookies', 'Cookies', 'Allow sites to save and read cookie data', 'permission_cookie'], site('location'), site('media'), ['check', 'enable_javascript', 'JavaScript', 'Allow sites to run JavaScript', 'permission_javascript'], site('popups'), ['screen', 'protected', 'Protected content', on('protected_content') ? 'Ask first' : 'Blocked', 'permission_protected_media'], ['screen', 'translate', 'Google Translate', on('translate') ? 'Ask first' : 'Blocked', 'settings_translate'], ['screen', 'sites:storage', 'Storage', '', 'settings_storage']]},
      'sites:all': {title: 'All sites', rows: [['sites']]},
      'sites:storage': {title: 'Storage', rows: [['sites']]},
      protected: {title: 'Protected content', sw: 'protected_content', rows: [['text', 'Protected content description'], ['link', 'Learn more', LEARN.protected]], menu: [['chrome-pref-reset', 'Reset device credentials', 'protected']]},
      translate: {title: 'Google Translate', sw: 'translate', rows: [['text', 'Translate description']], menu: [['chrome-pref-reset', 'Reset translate settings', 'translate'], ['chrome-unsupported', 'Help']]},
      bandwidth: {title: 'Reduce data usage', sw: 'reduce_data', rows: on('reduce_data') ? [['stats']] : [['text', 'Reduce data usage description'], ['text', 'Safe Browsing description'], ['text', 'Data reduction caveats'], ['link', 'Learn more', LEARN.bandwidth]]},
      about: {title: 'About Chrome', rows: [['info', 'Application version', `Chrome ${PREFS.version}`], ['info', 'Operating system', PREFS.os], ['screen-limit', 'legal', 'Legal information']]}
    };
    for (const id of Object.keys(SITES)) { const [key, title, , yes, no] = SITES[id]; all[`site:${id}`] = {title, rows: [['toggle', key, title, yes, no], ['sites']]}; }
    return all;
  }
  // The summaries MainPreferences and PrivacyPreferences put under the rows that open a page.
  function summary(ctx, id) {
    const s = key => CS(ctx, key), onOff = value => s(value ? 'On' : 'Off');
    if (id === 'search_engine') { const [name, keyword] = engine(ctx); return AndroidStrings.format(s('%1$s (%2$s)'), name, keyword); }
    if (id === 'tabs_apps') return onOff(pref(ctx, 'document_mode'));
    if (id === 'autofill' || id === 'passwords') return onOff(true);
    if (id === 'bandwidth') return pref(ctx, 'reduce_data') ? AndroidStrings.format(s('%1$s data savings'), `${(0).toLocaleString(ctx.locale)}%`) : onOff(false);
    if (id === 'dnt') return onOff(pref(ctx, 'dnt'));
    if (id === 'contextual') return onOff(pref(ctx, 'contextual_search'));
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
  const toggle = (on, cls = '') => `<i class="chr-pref-switch${cls}${on ? ' on' : ''}" role="switch" aria-checked="${on}"><i></i></i>`;
  function settings(ctx) {
    const {ui} = ctx, s = key => CS(ctx, key), stack = ui.chromePrefStack || [], id = stack[stack.length - 1] || '', all = pages(ctx), page = all[id];
    const row = (action, rowId, label, small = '', extra = '', icon = '') => `<button type="button" class="chr-pref${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(rowId)}">${icon ? `<img class="chr-pref-icon" src="assets/chr40-${icon}.png" alt="">` : ''}<span class="chr-pref-text"><b>${e(label)}</b>${small ? `<small>${e(small)}</small>` : ''}</span>${extra}</button>`;
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
      if (kind === 'toggle') { const value = pref(ctx, key); return row('chrome-pref-toggle', key, s(label), s(value ? item[3] : item[4]), toggle(value)); }
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
    const sw = page?.sw ? `<button type="button" class="chr-pref-barswitch" data-action="chrome-pref-switch" data-id="${page.sw}" role="switch" aria-checked="${!!pref(ctx, page.sw)}" aria-label="${e(title)}">${toggle(pref(ctx, page.sw), ' bar')}</button>` : '';
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
  // The overflow menu: Back, Forward and Bookmark icons, then the Chrome 31 items (GSMArena), scrolling on small screens.
  function menu(ctx) {
    const {ui, data} = ctx;
    const bookmarked = (data.bookmarks || []).includes(ctx.url), page = !internal(ctx.url), native = ctx.url === NTP;
    const item = (action, label, extra = '') => `<button type="button" data-action="${action}" role="menuitem"><span>${e(CS(ctx, label))}</span>${extra}</button>`;
    if (ui.sub === 'tabs') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${[item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), ctx.incognito ? item('chrome-close-all', 'Close incognito tabs') : item('chrome-close-all', 'Close all tabs'), item('chrome-settings', 'Settings')].join('')}</div>`;
    const top = `<div class="chr-menu-icons chr40-menu-icons"><button type="button" data-action="browser-forward" aria-label="${e(CS(ctx, 'Go forward'))}" ${ui.browserIndex < ui.browserHistory.length - 1 ? '' : 'disabled'}><img src="assets/chr40-btn_forward.png" alt=""></button><button type="button" data-action="browser-save" aria-label="${e(CS(ctx, bookmarked ? 'Edit bookmark' : 'Bookmark this page'))}" ${page ? '' : 'disabled'}><img src="assets/chr40-${bookmarked ? 'btn_star_filled' : 'btn_star'}.png" alt=""></button><button type="button" data-action="browser-refresh" aria-label="${e(CS(ctx, 'Refresh page'))}"><img src="assets/chr40-btn_toolbar_reload.png" alt=""></button></div>`;
    const items = [item('browser-new-tab', 'New tab'), item('chrome-incognito', 'New incognito tab'), item('chrome-bookmarks', 'Bookmarks'), ctx.incognito ? '' : item('chrome-devices', 'Recent tabs'), item('chrome-history', 'History'), page ? item('chrome-share', 'Share…') : '', native ? '' : item('chrome-print', 'Print…'), native ? '' : item('browser-find', 'Find in page'), page ? item('chrome-a2hs', 'Add to homescreen') : '', native ? '' : item('chrome-desktop', 'Request desktop site', `<i class="lp-check${ui.chromeDesktop ? ' on' : ''}"></i>`), item('chrome-settings', 'Settings'), item('chrome-unsupported', 'Help & feedback')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="chr-menu" role="menu">${top}${items.join('')}</div>`;
  }
  window.ChromeApp = {render, menu, NTP, HISTORY, internal, CLEAR_ITEMS, searchUrl, searchResult, prefAction, prefSeek, seekPaint, prefBack, prefDefault, DEFAULTS};
})();
