/* Google Search 3.3.11's settings pages (Velvet.apk of KTU84P), behind stock-apps.js's searchSettings header list
   (preferences_headers.xml: Google Now's switch, then under "Search & Now Cards" Phone search, Voice, Accounts &
   privacy, Notifications and Help & feedback, Google's page), from the APK's res/xml on Holo Light rows (mps- styles):
   - Phone search (preferences_searchable_items.xml): the icing corpora Apps and Contacts and the image's searchables
     with includeInGlobalSearch, on as default_source_suggest_uris has them (Drive starts off).
   - Voice (voicesearch_preferences.xml without the debug rows): Language, Hotword detection (hotword_settings.xml: the
     switch and Listen on home screen), Speech output (On / Hands-free only / Off), Block offensive words, Personalized
     recognition, Bluetooth headset; offline languages and the dashboard are Google's.
   - Accounts & privacy (privacy_and_account_preferences.xml without the debug rows): Google Account, Location services
     (Google Settings' Location), Web History, Personal results, Search on google.com, SafeSearch filter, Contact
     recognition, Legal; Commute sharing, App Search Stats, the histories and storage are Google's or need the server.
   - Notifications (notifications_settings.xml): Show updates from Google Now (Standard / Low priority / Off), the Urgent
     updates category with Ringtone, Vibrate and notifications_settings_message.xml's description.
   Strings: stock-strings.js group velvet. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const V = (ctx, key) => { const row = window.StockStrings?.velvet?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const store = data => data.gsearch ||= {};
  const pref = (data, key, def) => store(data).prefs?.[key] ?? def;
  const setPref = (data, key, value) => { (store(data).prefs ||= {})[key] = value; };
  const SOURCES = [['apps', 'Apps', 'Names of installed apps', 'apps.png', true], ['play-books', 'Play Books', 'Books in your library', 'play-books.png', true],
    ['chrome', 'Chrome', 'Bookmarks and web history', 'chrome.png', true], ['contacts', 'Contacts', 'All your contact data', 'people.png', true],
    ['drive', 'Drive', 'Google Drive', 'drive.png', false], ['play-music', 'Play Music', 'Artists, albums, and tracks', 'play-music.png', true],
    ['play-movies', 'Play Movies', 'Movies in your library', 'play-movies.png', true]];
  const VOICE_LANGS = ['en-US', 'en-GB', 'hu-HU', 'de-DE', 'fr-FR', 'es-ES'];
  const TTS = [['always', 'On'], ['handsFreeOnly', 'Hands-free only'], ['never', 'Off tts']];
  const LEVELS = [['2', 'Standard'], ['1', 'Low priority'], ['0', 'Off']];
  const DEFAULTS = {profanityFilter: true, hotwordDetector: true, vibrate: true, personalizedResults: false, bluetoothHeadset: false, use_google_com: false, safe_search: false, contact_upload: false, homescreen_hotword: false};
  const TITLES = {phone: 'Phone search', voice: 'Voice', hotword: 'Hotword detection', privacy: 'Accounts & privacy', notifications: 'Notifications', legal: 'Legal'};
  const langName = (ctx, code) => { try { return new Intl.DisplayNames([ctx.locale || 'en'], {type: 'language'}).of(code); } catch { return code; } };
  const check = on => `<i class="mps-check${on ? ' on' : ''}"></i>`;
  const sw = (ctx, key, title, summary) => { const on = pref(ctx.data, key, true); return `<button class="mps-row" data-action="ksp-check" data-id="${key}" role="switch" aria-checked="${on}"><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span><i class="sa-switch${on ? ' on' : ''}">${e(ctx.t(on ? 'ON' : 'OFF'))}</i></button>`; };
  const row = (action, id, title, summary = '', extra = '', disabled = false) => `<button class="mps-row${disabled ? ' disabled' : ''}" data-action="${disabled ? '' : action}" data-id="${e(id)}"${disabled ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const flag = (ctx, key, title, summary = '') => row('ksp-check', key, title, summary, check(pref(ctx.data, key, DEFAULTS[key])));
  function page(ctx) {
    const {ui, data} = ctx, v = key => V(ctx, key), p = ui.ksPage;
    if (p === 'phone') return `<p class="ksp-note">${e(v('Choose what to search on the phone'))}</p>` + SOURCES.map(([id, title, sum, icon, def]) => `<button class="mps-row ksp-source" data-action="ksp-check" data-id="source:${id}"><img src="assets/${icon}" alt=""><span><b>${e(v(title))}</b><small>${e(v(sum))}</small></span>${check(pref(data, `source:${id}`, def))}</button>`).join('');
    if (p === 'voice') return row('ksp-list', 'language', v('Language'), langName(ctx, pref(data, 'language', 'en-US'))) + row('ksp-page', 'hotword', v('Hotword detection'))
      + row('ksp-list', 'ttsMode', v('Speech output'), v(TTS.find(x => x[0] === pref(data, 'ttsMode', 'always'))[1])) + flag(ctx, 'profanityFilter', v('Block offensive words'), v('Hide recognized offensive voice results'))
      + row('ksp-web', 'downloadLanguagePacks', v('Offline speech recognition'), v('Manage downloaded languages')) + flag(ctx, 'personalizedResults', v('Personalized recognition'), v('Improve speech recognition accuracy'))
      + row('ksp-web', 'managePersonalization', v('Google Account dashboard'), v('Manage your collected data')) + flag(ctx, 'bluetoothHeadset', v('Bluetooth headset'), v('Records audio through Bluetooth headset if available.'));
    if (p === 'hotword') return sw(ctx, 'hotwordDetector', v('Hotword detection switch'), AndroidStrings.format(v('Say %1$s to launch voice search'), '"Ok Google"')) + row('ksp-check', 'homescreen_hotword', v('Listen on home screen'), '', check(pref(data, 'homescreen_hotword', false)), !pref(data, 'hotwordDetector', true));
    if (p === 'privacy') return row('ksp-account', 'account', v('Google Account'), AndroidStrings.format(v('Using %1$s for Google Search and for showing Google Now cards'), ctx.account))
      + row('ksp-web', 'commute_sharing', v('Commute sharing')) + row('ksp-web', 'manage_location_history', v('Manage Location History'), AndroidStrings.format(v('Sign in as %1$s on Google Maps and open location settings to manage history and reporting'), ctx.account))
      + row('ksp-location', 'location', v('Location services')) + sw(ctx, 'cloud_search_history', v('Web History'), v('Web history summary')) + row('', 'manage_search_history', v('Manage Web History'), '', '', true)
      + sw(ctx, 'personalized_search_bool', v('Personal results'), v('Personal results summary')) + row('ksp-web', 'app_history', v('App Search Stats'))
      + flag(ctx, 'use_google_com', v('Search on google.com')) + flag(ctx, 'safe_search', v('SafeSearch filter')) + flag(ctx, 'contact_upload', v('Contact recognition'), v('Contact recognition summary'))
      + row('ksp-web', 'icing_manage_storage', v('Search engine storage'), v('Search engine storage summary')) + row('ksp-page', 'legal', v('Legal'));
    if (p === 'notifications') return row('ksp-list', 'notificationOverride', v('Show updates from Google Now'), v(LEVELS.find(l => l[0] === pref(data, 'notificationOverride', '2'))[1]))
      + `<h4 class="ksp-category">${e(v('Urgent updates'))}</h4>` + row('ksp-ring', 'ring', v('Ringtone'), window.SystemSounds?.SOUNDS?.notifications?.[pref(data, 'ring', '')]?.[0] || '')
      + flag(ctx, 'vibrate', v('Vibrate')) + `<p class="ksp-note">${e(v('Urgent updates description'))}</p>`;
    if (p === 'legal') return ['Terms of service', 'Location terms of service', 'Privacy policy', 'Legal notices', 'Open source licenses'].map(t => row('ksp-web', t, v(t))).join('');
    return '';
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.ksDialog; if (!d) return '';
    const v = key => V(ctx, key), cancel = `<button type="button" data-action="ksp-cancel">${e(ctx.t('Cancel'))}</button>`;
    const shell = (title, body) => `<button type="button" class="mps-scrim" data-action="ksp-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="mps-buttons">${cancel}</div></div>`;
    const radios = (items, current) => `<div class="mps-choices">${items.map(([value, label]) => `<button type="button" data-action="ksp-pick" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(label)}</span><i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`;
    if (d.kind === 'list') {
      const lists = {language: [VOICE_LANGS.map(c => [c, langName(ctx, c)]), 'en-US', 'Language'], ttsMode: [TTS.map(([a, b]) => [a, v(b)]), 'always', 'Speech output'], notificationOverride: [LEVELS.map(([a, b]) => [a, v(b)]), '2', 'Show updates from Google Now']};
      const [items, def, title] = lists[d.key]; return shell(v(title), radios(items, String(pref(data, d.key, def))));
    }
    if (d.kind === 'ring') return shell(v('Ringtone'), radios(Object.entries(window.SystemSounds?.SOUNDS?.notifications || {}).map(([file, [title]]) => [file, title]), pref(data, 'ring', '')));
    if (d.kind === 'account') return shell(v('Google Account'), radios([[ctx.account, ctx.account]], ctx.account));
    return '';
  }
  // Phone search keeps the header list's own title (the string index holds the tablet variant of search_sources).
  function render(ctx, bar) { return `<div class="app-view sa-app sa-settings mps ksp">${bar(ctx.ui.ksPage === 'phone' ? ctx.t('Phone search') : V(ctx, TITLES[ctx.ui.ksPage]))}<div class="sa-scroll mps-list">${page(ctx)}</div>${dialog(ctx)}</div>`; }
  // ctx: {ui, data, t, locale, account, save, render, unsupported, openLocation}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, done = () => { ctx.save(); ctx.render(); return true; };
    switch (action) {
      case 'ksp-open': ui.ksStack = []; ui.ksPage = id; ui.ksDialog = null; ctx.render(); return true;
      case 'ksp-page': (ui.ksStack ||= []).push(ui.ksPage); ui.ksPage = id; ctx.render(); return true;
      case 'ksp-check': { const def = id.startsWith('source:') ? SOURCES.find(x => `source:${x[0]}` === id)[4] : id in DEFAULTS ? DEFAULTS[id] : true; setPref(data, id, !pref(data, id, def)); return done(); }
      case 'ksp-list': ui.ksDialog = {kind: 'list', key: id}; ctx.render(); return true;
      case 'ksp-ring': ui.ksDialog = {kind: 'ring'}; ctx.render(); return true;
      case 'ksp-account': ui.ksDialog = {kind: 'account'}; ctx.render(); return true;
      case 'ksp-pick':
        if (ui.ksDialog?.kind === 'ring') { setPref(data, 'ring', id); window.SystemSounds?.play('notifications', id); }
        else if (ui.ksDialog?.kind === 'list') setPref(data, ui.ksDialog.key, id);
        ui.ksDialog = null; return done();
      case 'ksp-location': ctx.openLocation(); return true;
      case 'ksp-web': ctx.unsupported(); return true;
      case 'ksp-cancel': window.SystemSounds?.stop(); ui.ksDialog = null; ctx.render(); return true;
    }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.ksDialog) { window.SystemSounds?.stop(); ui.ksDialog = null; ctx.render(); return true; }
    if (!ui.ksPage) return false;
    ui.ksPage = (ui.ksStack || []).pop() || ''; ctx.render(); return true;
  }
  window.KKSearchPrefs = {render, handle, back};
})();
