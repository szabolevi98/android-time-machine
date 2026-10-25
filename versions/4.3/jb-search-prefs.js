/* Google Search 2.5.9's settings pages (Velvet.apk of JWR66Y), behind the header list of stock-apps.js's searchSettings,
   from the APK's res/xml (Theme.Holo.Light.DarkActionBar rows: the vs-header and mps- styles, Holo switches):
   - Google Now (predictive_cards_preferences.xml): the Cards category of PartialSwitchPreferences; Weather and Next
     appointment hide or show their cards on the Google page.
   - Notifications (notifications_settings.xml): a NotificationGroupPreference per group (Standard / Low priority / Off,
     notification_standard_entries), Ringtone (the notification sounds) and Vibrate.
   - My stuff (my_stuff_settings.xml): Places (Home and Work, each set in a "Set place" field), Reminders (the Upcoming
     and Past tabs of RemindersListFragment), Sports ("Add team…") and Stocks ("Add stock"), kept in data.gsearch.
   - Voice (voicesearch_preferences.xml without the [Debug] rows): Language, Speech output, Block offensive words,
     Hotword detection, Personalized recognition, Bluetooth headset; the language packs and the dashboard are Google's.
   - Phone search (preferences_searchable_items.xml): the image's searchables with includeInGlobalSearch, all on as
     default_source_suggest_uris has them.
   - Privacy & accounts (privacy_and_account_preferences.xml without [DEBUG]): Google Account, Location services (Google
     Settings' Location), Web history, Personal results, Clear on-device search history with its prompt, Search on
     google.com, SafeSearch filters, Legal; managing histories and the documents are Google's pages.
   Strings: stock-strings.js group velvet; the header list's own texts stay in stock-apps.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const lang = ctx => String(ctx.locale || 'en').slice(0, 2);
  const V = (ctx, key) => { const row = window.StockStrings?.velvet?.[key]; return row ? AndroidStrings.pick(row, lang(ctx), key) : ctx.t(key); };
  const store = data => data.gsearch ||= {};
  const pref = (data, key, def) => store(data).prefs?.[key] ?? def;
  const setPref = (data, key, value) => { (store(data).prefs ||= {})[key] = value; };
  const CARDS = [['weather', 'Weather', 'At current location, home, work…'], ['traffic', 'Traffic'], ['nextMeeting', 'Next appointment'],
    ['travel', 'Travel tools', 'Currency exchange, language…'], ['flight', 'Flights'], ['transit', 'Public transit', 'Train stations, bus stops'],
    ['places', 'Places card', 'Restaurants, bars, museums…'], ['sports', 'Sports'], ['publicAlerts', 'Public alerts'], ['movies', 'Movies'],
    ['books', 'New books'], ['albums', 'New albums'], ['tvEpisodes', 'New TV episodes'], ['videoGames', 'New video games'], ['stockQuotes', 'Stocks'], ['news', 'News update']];
  const card = (data, id) => store(data).cards?.[id] !== false;
  const GROUPS = [['publicAlerts', 'Public alerts notifications'], ['tickets', 'Tickets'], ['heavyTraffic', 'Heavy traffic for commute'], ['travelTime', 'Travel time for appointment'], ['default', 'Weather, sports, & others'], ['reminders', 'Reminders']];
  const LEVELS = [['2', 'Standard'], ['1', 'Low priority'], ['0', 'Off']];
  const SOURCES = [['apps', 'Apps', 'Names of installed applications', 'apps.png'], ['play-books', 'Play Books', 'Books in your library', 'play-books.png'],
    ['chrome', 'Chrome', 'Bookmarks and web history', 'chrome.png'], ['people', 'People', 'Names of your contacts', 'people.png'],
    ['play-music', 'Play Music', 'Artists, albums, and tracks', 'play-music.png'], ['play-movies', 'Play Movies', 'Movies in your library', 'play-movies.png']];
  const VOICE_LANGS = ['en-US', 'en-GB', 'hu-HU', 'de-DE', 'fr-FR', 'es-ES'];
  const TTS = [['always', 'Always'], ['informativeOnly', 'Informative only'], ['handsFreeOnly', 'Hands-free only']];
  const SAFE = [['active', 'Strict'], ['images', 'Moderate'], ['off', 'No filtering']];
  const TITLES = {now: 'Google Now', notifications: 'Notifications', mystuff: 'My stuff', voice: 'Voice', phone: 'Phone search', privacy: 'Privacy & accounts',
    places: 'Places', reminders: 'Reminders', sports: 'Sports', stocks: 'Stocks', legal: 'Legal'};
  const langName = (ctx, code) => { try { return new Intl.DisplayNames([ctx.locale || 'en'], {type: 'language'}).of(code); } catch { return code; } };
  const sw = (on, action, id, label) => `<button class="gms-switch${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}" role="switch" aria-checked="${on}" aria-label="${e(label)}"><i>${e(on ? 'ON' : 'OFF')}</i></button>`;
  const row = (action, id, title, summary = '', extra = '', disabled = false) => `<button class="sa-row vs-header gsp-row${disabled ? ' disabled' : ''}" data-action="${disabled ? '' : action}" data-id="${e(id)}"${disabled ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const check = (on) => `<i class="mps-check${on ? ' on' : ''}"></i>`;
  function page(ctx) {
    const {ui, data} = ctx, p = ui.gsPage, s = store(data), v = key => V(ctx, key);
    if (p === 'now') return `<h4 class="gsp-category">${e(v('Cards'))}</h4>` + CARDS.map(([id, title, sum]) => `<div class="sa-row vs-header vs-now gsp-row"><button data-action="gsp-card" data-id="${id}"><span><b>${e(v(title))}</b>${sum ? `<small>${e(v(sum))}</small>` : ''}</span></button>${sw(card(data, id), 'gsp-card', id, v(title))}</div>`).join('');
    if (p === 'notifications') return GROUPS.map(([id, title]) => row('gsp-list', `notif:${id}`, v(title), v(LEVELS.find(l => l[0] === pref(data, `notif:${id}`, '2'))[1]))).join('')
      + row('gsp-ring', 'ring', v('Ringtone'), window.SystemSounds?.SOUNDS?.notifications?.[pref(data, 'ring', '')]?.[0] || '') + row('gsp-check', 'vibrate', v('Vibrate'), '', check(pref(data, 'vibrate', true)));
    if (p === 'mystuff') return row('gsp-page', 'places', v('Places'), v('Home, work…')) + row('gsp-page', 'reminders', v('Reminders')) + row('gsp-page', 'sports', v('Sports'), (s.teams || []).join(', ') || v('No teams selected')) + row('gsp-page', 'stocks', v('Stocks'), (s.stocks || []).join(', ') || v('No stocks selected'));
    if (p === 'places') return [['home', 'Home'], ['work', 'Work']].map(([id, title]) => row('gsp-edit', id, v(title), s.places?.[id] || v('Set place'))).join('');
    if (p === 'reminders') { const tab = ui.gsTab || 'upcoming'; return `<nav class="gsp-tabs">${[['upcoming', 'Upcoming'], ['past', 'Past']].map(([id, label]) => `<button class="${id === tab ? 'on' : ''}" data-action="gsp-tab" data-id="${id}">${e(v(label))}</button>`).join('')}</nav><p class="gsp-empty">${e(v(tab === 'past' ? 'No past reminders' : 'No upcoming reminders'))}</p>`; }
    if (p === 'sports' || p === 'stocks') { const list = s[p === 'sports' ? 'teams' : 'stocks'] || []; return list.map((name, i) => `<div class="mps-row mps-item gsp-item"><span class="mps-main"><span><b>${e(name)}</b></span></span><button class="mps-del" data-action="gsp-remove" data-id="${i}" aria-label="×">×</button></div>`).join('') + row('gsp-edit', p, v(p === 'sports' ? 'Add team…' : 'Add stock')); }
    if (p === 'voice') return row('gsp-list', 'language', v('Language'), langName(ctx, pref(data, 'language', 'en-US'))) + row('gsp-list', 'ttsMode', v('Speech output'), v(TTS.find(x => x[0] === pref(data, 'ttsMode', 'informativeOnly'))[1]))
      + [['profanityFilter', 'Block offensive words', 'Hide recognized offensive voice results', true], ['hotwordDetector', 'Hotword detection', 'Say Google to launch voice search.', true]].map(([id, t, sum, def]) => row('gsp-check', id, v(t), v(sum), check(pref(data, id, def)))).join('')
      + row('gsp-web', 'downloadLanguagePacks', v('Download offline speech recognition'), v('Enables voice input while offline'))
      + row('gsp-check', 'personalizedResults', v('Personalized recognition'), v('Improve speech recognition accuracy'), check(pref(data, 'personalizedResults', false)))
      + row('gsp-web', 'managePersonalization', v('Google Account dashboard'), v('Manage your collected data'))
      + row('gsp-check', 'bluetoothHeadset', v('Bluetooth headset'), v('Records audio through Bluetooth headset if available.'), check(pref(data, 'bluetoothHeadset', false)));
    if (p === 'phone') return `<p class="gsp-note">${e(v('Choose what to search on the phone'))}</p>` + SOURCES.map(([id, title, sum, icon]) => { const on = pref(data, `source:${id}`, true); return `<button class="sa-row vs-header gsp-row gsp-source" data-action="gsp-check" data-id="source:${id}"><img src="assets/${icon}" alt=""><span><b>${e(v(title))}</b><small>${e(v(sum))}</small></span>${check(on)}</button>`; }).join('');
    if (p === 'privacy') return row('gsp-account', 'account', v('Google Account'), AndroidStrings.format(v('Using %1$s for Google Search and for showing Google Now cards'), ctx.account))
      + row('gsp-web', 'manage_location_history', v('Manage location history'), AndroidStrings.format(v('Sign in as %1$s on Google Maps and open location settings to manage history and reporting'), ctx.account))
      + row('gsp-location', 'location', v('Location services'))
      + `<div class="sa-row vs-header vs-now gsp-row"><button data-action="gsp-switch" data-id="cloud_search_history"><span><b>${e(v('Web history'))}</b><small>${e(v('Web history summary'))}</small></span></button>${sw(pref(data, 'cloud_search_history', true), 'gsp-switch', 'cloud_search_history', v('Web history'))}</div>`
      + row('', 'manage_search_history', v('Manage Web History'), '', '', true)
      + `<div class="sa-row vs-header vs-now gsp-row"><button data-action="gsp-switch" data-id="personalized_search_bool"><span><b>${e(v('Personal results'))}</b><small>${e(v('Personal results summary'))}</small></span></button>${sw(pref(data, 'personalized_search_bool', true), 'gsp-switch', 'personalized_search_bool', v('Personal results'))}</div>`
      + row('gsp-clear', 'clear_shortcuts', v('Clear on-device search history'))
      + row('gsp-check', 'use_google_com', v('Search on google.com'), '', check(pref(data, 'use_google_com', false)))
      + row('gsp-list', 'safe_search_settings', v('SafeSearch filters'), v(SAFE.find(x => x[0] === pref(data, 'safe_search_settings', 'images'))[1]))
      + row('gsp-page', 'legal', v('Legal'));
    if (p === 'legal') return ['Terms of Service', 'Location Terms of Service', 'Privacy Policy', 'Legal Notices', 'Open source licenses'].map(t => row('gsp-web', t, v(t))).join('');
    return '';
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.gsDialog; if (!d) return '';
    const v = key => V(ctx, key), cancel = `<button type="button" data-action="gsp-cancel">${e(v('Cancel'))}</button>`;
    const shell = (title, body, buttons) => `<button type="button" class="mps-scrim" data-action="gsp-cancel" aria-label="${e(v('Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}${buttons ? `<div class="mps-buttons">${buttons}</div>` : ''}</div>`;
    const radios = (items, current) => `<div class="mps-choices">${items.map(([value, label]) => `<button type="button" data-action="gsp-pick" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(label)}</span><i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`;
    if (d.kind === 'list') {
      const k = d.key, lists = {language: [VOICE_LANGS.map(c => [c, langName(ctx, c)]), 'en-US', 'Language'], ttsMode: [TTS.map(([a, b]) => [a, v(b)]), 'informativeOnly', 'Speech output'], safe_search_settings: [SAFE.map(([a, b]) => [a, v(b)]), 'images', 'SafeSearch filters']};
      const [items, def, title] = k.startsWith('notif:') ? [LEVELS.map(([a, b]) => [a, v(b)]), '2', GROUPS.find(g => `notif:${g[0]}` === k)[1]] : lists[k];
      return shell(v(title), radios(items, String(pref(data, k, def))), cancel);
    }
    if (d.kind === 'ring') { const sounds = Object.entries(window.SystemSounds?.SOUNDS?.notifications || {}); return shell(v('Ringtone'), radios(sounds.map(([file, [title]]) => [file, title]), pref(data, 'ring', '')), cancel); }
    if (d.kind === 'account') return shell(v('Google Account'), radios([[ctx.account, ctx.account]], ctx.account), cancel);
    if (d.kind === 'clear') return shell(v('Clear on-device search history'), `<p>${e(v('Clear on-device search history prompt'))}</p>`, `${cancel}<button type="button" data-action="gsp-clear-ok">${e(v('Clear'))}</button>`);
    if (d.kind === 'edit') {
      const title = {home: 'Edit home location', work: 'Edit work location', sports: 'Add team', stocks: 'Add stock hint'}[d.key], hint = {home: 'Set place', work: 'Set place', sports: 'Add team', stocks: 'Add stock hint'}[d.key];
      return shell(v(title), `<input data-gsp-input value="${e(store(data).places?.[d.key] || '')}" placeholder="${e(v(hint))}" autocomplete="off" maxlength="80">`, `${cancel}<button type="button" data-action="gsp-edit-ok">${e(ctx.t('OK'))}</button>`);
    }
    return '';
  }
  // The page under the header list; the header list itself stays stock-apps.js's.
  function render(ctx, bar) {
    const {ui} = ctx;
    return `<div class="app-view sa-app sa-settings gsp">${bar(V(ctx, TITLES[ui.gsPage]))}<div class="sa-scroll">${page(ctx)}</div>${dialog(ctx)}</div>`;
  }
  // ctx: {ui, data, t, locale, account, save, render, unsupported, openLocation}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, s = store(data), done = () => { ctx.save(); ctx.render(); return true; };
    switch (action) {
      case 'gsp-open': (ui.gsStack ||= []).push(ui.gsPage || ''); ui.gsPage = id; ui.gsDialog = null; ui.gsTab = ''; ctx.render(); return true;
      case 'gsp-page': (ui.gsStack ||= []).push(ui.gsPage); ui.gsPage = id; ui.gsTab = ''; ctx.render(); return true;
      case 'gsp-tab': ui.gsTab = id; ctx.render(); return true;
      case 'gsp-card': (s.cards ||= {})[id] = !card(data, id); return done();
      case 'gsp-check': { const defs = {vibrate: true, profanityFilter: true, hotwordDetector: true}; setPref(data, id, !pref(data, id, id.startsWith('source:') ? true : defs[id] ?? false)); return done(); }
      case 'gsp-switch': setPref(data, id, !pref(data, id, true)); return done();
      case 'gsp-list': ui.gsDialog = {kind: 'list', key: id}; ctx.render(); return true;
      case 'gsp-ring': ui.gsDialog = {kind: 'ring'}; ctx.render(); return true;
      case 'gsp-account': ui.gsDialog = {kind: 'account'}; ctx.render(); return true;
      case 'gsp-pick':
        if (ui.gsDialog?.kind === 'ring') { setPref(data, 'ring', id); window.SystemSounds?.play('notifications', id); }
        else if (ui.gsDialog?.kind === 'list') setPref(data, ui.gsDialog.key, id);
        ui.gsDialog = null; return done();
      case 'gsp-clear': ui.gsDialog = {kind: 'clear'}; ctx.render(); return true;
      case 'gsp-clear-ok': s.searches = []; ui.gsDialog = null; return done();
      case 'gsp-edit': ui.gsDialog = {kind: 'edit', key: id}; ctx.render(); requestAnimationFrame(() => document.querySelector('#viewport [data-gsp-input]')?.focus()); return true;
      case 'gsp-edit-ok': {
        const value = document.querySelector('#viewport [data-gsp-input]')?.value.trim() || '', key = ui.gsDialog?.key; ui.gsDialog = null;
        if (key === 'home' || key === 'work') { (s.places ||= {})[key] = value; if (!value) delete s.places[key]; }
        else if (value) (s[key === 'sports' ? 'teams' : 'stocks'] ||= []).push(key === 'stocks' ? value.toUpperCase() : value);
        return done();
      }
      case 'gsp-remove': { const list = s[ui.gsPage === 'sports' ? 'teams' : 'stocks'] || []; list.splice(Number(id), 1); return done(); }
      case 'gsp-location': ctx.openLocation(); return true;
      case 'gsp-web': ctx.unsupported(); return true;
      case 'gsp-cancel': window.SystemSounds?.stop(); ui.gsDialog = null; ctx.render(); return true;
    }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.gsDialog) { window.SystemSounds?.stop(); ui.gsDialog = null; ctx.render(); return true; }
    if (!ui.gsPage) return false;
    ui.gsPage = (ui.gsStack || []).pop() || ''; ui.gsTab = ''; ctx.render(); return true;
  }
  window.JBSearchPrefs = {render, handle, back, card};
})();
