/* YouTube 5.2.27's SettingsActivity on the Nexus 5 image (KTU84P), from the APK's xml-v11 preferences and its code
   (docs/tools/dex-decompile.py): preference_headers.xml's General, Connected TVs, Search and About (onBuildHeaders drops
   Preloading on a phone without prefetch and Developer outside a dev build). General (general_prefs.xml without Auto
   Uploads and Background audio, which GeneralPrefsFragment removes when they are not offered): High quality on mobile,
   Caption font size, Uploads, Content localization (GDataRequestFactory's 38 countries by name), Improve YouTube, New
   video notifications. Connected TVs needs a TV (Google's pairing flow). Search: Clear search history behind "Clear search
   history?", Never remember history, SafeSearch filtering (safety_mode: the "SafeSearch" single choice of Don't filter /
   Strict). About: Google's pages, LicensesActivity's licenses.html, the APK's 5.2.27. Strings come from stock-strings.js
   (group youtube); the rows and dialogs are the Holo Light mps- styles. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const Y = (ctx, key) => { const row = window.StockStrings?.youtube?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const pref = (data, key, def) => data.yt5Prefs?.[key] ?? def;
  const COUNTRIES = ['AR', 'AU', 'BE', 'BR', 'CA', 'CL', 'CO', 'CZ', 'EG', 'FR', 'DE', 'GB', 'HK', 'HU', 'IN', 'IE', 'IL', 'IT', 'JP', 'JO', 'MY', 'MX', 'MA', 'NL', 'NZ', 'PE', 'PH', 'PL', 'RU', 'SA', 'SG', 'ZA', 'KR', 'ES', 'SE', 'TW', 'AE', 'US'];
  function countries(ctx) {
    let names; try { names = new Intl.DisplayNames([ctx.locale || 'en'], {type: 'region'}); } catch { names = null; }
    const collator = new Intl.Collator(ctx.locale || 'en');
    return COUNTRIES.map(code => [code, names?.of(code) || code]).sort((a, b) => collator.compare(a[1], b[1]));
  }
  const homeCountry = ctx => { const region = String(ctx.locale || '').split('-')[1]; return COUNTRIES.includes(region) ? region : 'US'; };
  // [kind, key, title, summary, default, entries, entries are names, dialog title]
  const PAGES = {
    general: ctx => [['check', 'default_hq', 'High quality on mobile', 'Start videos in high quality when connected to a mobile network. Startup may take longer.', false],
      ['list', 'subtitles_size', 'Caption font size', 'Sets the font size to use for captions', '2', [['1', 'Small'], ['2', 'Medium'], ['3', 'Large'], ['4', 'Huge']]],
      ['list', 'upload_policy', 'Uploads setting', 'Specify network preferences for uploads', 'wifi', [['wifi', 'Only when on Wi-Fi'], ['any', 'On any network']]],
      ['list', 'country', 'Content localization', 'Prioritize channels and videos from a specific country or region', homeCountry(ctx), countries(ctx), true],
      ['check', 'dev_retention_enabled', 'Improve YouTube', 'Help improve YouTube by sending anonymous usage data', true],
      ['check', 'video_notifications_enabled', 'New video notifications', 'Receive notifications of new videos which match your interests', true]],
    tv: () => [['web', 'pair_with_youtube_tv', 'Add a TV', 'Pair this device with your TV'], ['web', 'edit_tvs', 'Edit TVs', 'You can rename or remove your paired TVs at any time']],
    search: () => [['clear', 'clear_history', 'Clear search history', 'Clear previous YouTube searches from showing in the Search box'],
      ['check', 'no_search_history', 'Never remember history', 'Never store YouTube search history', false],
      ['list', 'safety_mode', 'SafeSearch filtering', 'Block videos containing restricted content from showing in search results', '0', [['0', "Don't filter"], ['1', 'Strict']], false, 'SafeSearch']],
    about: () => [['web', 'help', 'Help pref', 'Find answers to your YouTube questions here'], ['web', 'feedback', 'Feedback pref', 'Help us make YouTube better'],
      ['web', 'mobile_terms', 'Google Mobile Terms of Service', 'Read Google Mobile Terms of Service'], ['web', 'youtube_terms', 'YouTube Terms of Service', "Read YouTube's Terms of Service"],
      ['web', 'mobile_privacy', 'Google Mobile Privacy Policy', 'Read Google Mobile Privacy Policy'], ['web', 'youtube_privacy', 'YouTube Privacy Policy', "Read YouTube's Privacy Policy"],
      ['licenses', 'open_source_licenses', 'Open source licenses', 'License details for open source software'], ['info', 'version', 'App version', '5.2.27']]
  };
  const HEADERS = [['general', 'General'], ['tv', 'Connected TVs'], ['search', 'Search header'], ['about', 'About']];
  const row = (ctx, page, key) => PAGES[page](ctx).find(r => r[1] === key);
  // The light action bar with the up caret, the logo and the title (SettingsActivity adds showHomeAsUp | showTitle).
  const bar = (ctx, title) => `<header class="sa-bar yt5-bar"><button class="sa-up" data-action="back" aria-label="YouTube"><img class="sa-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="yt5-logo" src="assets/yt5-action_bar_logo.png" alt="YouTube"></button><span class="sa-title"><b>${e(title)}</b></span></header>`;
  function settings(ctx) {
    const {ui, data} = ctx, page = ui.yt5Page || '';
    if (page === 'licenses') return `<div class="app-view sa-app sa-youtube sa-yt5 yt5-licenses">${bar(ctx, Y(ctx, 'Open source licenses'))}<iframe src="assets/yt5-licenses.html" title="${e(Y(ctx, 'Open source licenses'))}"></iframe></div>`;
    const rows = page ? PAGES[page](ctx).map(([kind, key, title, summary, def]) => {
      const info = kind === 'info', box = kind === 'check' ? `<i class="mps-check${pref(data, key, def) ? ' on' : ''}"></i>` : '';
      return `<button class="mps-row${info ? ' mps-info disabled' : ''}" data-action="${info ? '' : `yt5-pref-${kind}`}" data-id="${key}"${info ? ' disabled' : ''}${kind === 'check' ? ` role="checkbox" aria-checked="${!!pref(data, key, def)}"` : ''}><span><b>${e(Y(ctx, title))}</b><small>${e(info ? summary : Y(ctx, summary))}</small></span>${box}</button>`;
    }) : HEADERS.map(([id, title]) => `<button class="mps-row yt5-header" data-action="yt5-page" data-id="${id}"><span><b>${e(Y(ctx, title))}</b></span></button>`);
    return `<div class="app-view sa-app sa-youtube sa-yt5 mps yt5-prefs">${bar(ctx, page ? Y(ctx, HEADERS.find(h => h[0] === page)[1]) : Y(ctx, 'Settings'))}<div class="sa-scroll mps-list">${rows.join('')}</div>${dialog(ctx)}</div>`;
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.yt5Dialog; if (!d) return '';
    const shell = (title, body, buttons) => `<button type="button" class="mps-scrim" data-action="yt5-cancel" aria-label="${e(Y(ctx, 'Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}${buttons ? `<div class="mps-buttons">${buttons}</div>` : ''}</div>`;
    const cancel = `<button type="button" data-action="yt5-cancel">${e(Y(ctx, 'Cancel'))}</button>`;
    if (d.kind === 'clear') return shell('', `<p>${e(Y(ctx, 'Clear search history?'))}</p>`, `${cancel}<button type="button" data-action="yt5-clear-ok">${e(Y(ctx, 'OK'))}</button>`);
    if (d.kind === 'list') {
      const [, key, title, , def, entries, raw, dialogTitle] = row(ctx, d.page, d.key), current = String(pref(data, key, def));
      return shell(Y(ctx, dialogTitle || title), `<div class="mps-choices">${entries.map(([value, label]) => `<button type="button" data-action="yt5-pref-pick" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(raw ? label : Y(ctx, label))}</span><i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`, dialogTitle ? '' : cancel);
    }
    return '';
  }
  // ctx: {ui, data, t, locale, save, render, closeOverlay, unsupported}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx;
    switch (action) {
      case 'yt5-settings': ctx.closeOverlay(); ui.yt5Back = ui.sub; ui.sub = 'settings'; ui.yt5Page = ''; ui.yt5Dialog = null; ctx.render(); return true;
      case 'yt5-page': ui.yt5Page = id; ctx.render(); return true;
      case 'yt5-pref-check': { const r = row(ctx, ui.yt5Page, id); (data.yt5Prefs ||= {})[id] = !pref(data, id, r[4]); ctx.save(); ctx.render(); return true; }
      case 'yt5-pref-list': ui.yt5Dialog = {kind: 'list', page: ui.yt5Page, key: id}; ctx.render(); return true;
      case 'yt5-pref-pick': (data.yt5Prefs ||= {})[ui.yt5Dialog.key] = id; ui.yt5Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt5-pref-clear': ui.yt5Dialog = {kind: 'clear'}; ctx.render(); return true;
      case 'yt5-clear-ok': data.yt5Searches = []; ui.yt5Dialog = null; ctx.save(); ctx.render(); return true;
      case 'yt5-pref-licenses': ui.yt5Page = 'licenses'; ctx.render(); return true;
      case 'yt5-pref-web': ctx.unsupported(); return true;
      case 'yt5-cancel': ui.yt5Dialog = null; ctx.render(); return true;
    }
    return false;
  }
  // Back: a dialog, then a page to the headers, then out of Settings.
  function back(ctx) {
    const {ui} = ctx;
    if (ui.yt5Dialog) { ui.yt5Dialog = null; ctx.render(); return true; }
    if (ui.sub !== 'settings') return false;
    if (ui.yt5Page) ui.yt5Page = ui.yt5Page === 'licenses' ? 'about' : ''; else { ui.sub = ui.yt5Back || ''; ui.yt5Back = ''; }
    ctx.render(); return true;
  }
  // A search is kept for the Search box's suggestions unless Never remember history is on.
  function searched(query, data) { if (pref(data, 'no_search_history', false)) return; data.yt5Searches = [query, ...(data.yt5Searches || []).filter(x => x !== query)].slice(0, 20); }
  window.KKYouTube = {settings, handle, back, searched};
})();
