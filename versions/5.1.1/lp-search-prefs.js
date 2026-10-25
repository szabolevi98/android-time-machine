/* Google Search 4.1.29's SettingsActivity (Velvet.apk of LMY48Y), from the APK's res/xml on Material Light rows (the
   mps- styles with lp-mswitch switches). preferences_headers.xml: under "Search & Now", Accounts & privacy, Search
   language, Voice, Phone search and Now cards (the Dogfood headers go on a release build).
   - Accounts & privacy (privacy_and_account_preferences.xml): Google Account, SafeSearch filter, Search on google.com,
     Accessibility (high contrast text), Help improve Google, Legal; Google Account History and Commute sharing are
     Google's pages.
   - Search language (preferences_search_language.xml): the chosen language over the list of languages.
   - Voice (voicesearch_preferences.xml): Language, "Ok Google" detection (hotword_settings.xml: From the Google app, From
     any screen, Personal results over the voice model, whose training is the recognizer's), Hands-free
     (hands_free_settings.xml's switches), Speech output (On / Hands-free only), Block offensive words, Bluetooth headset;
     offline languages are Google's downloads.
   - Phone search: the icing corpora Apps and Contacts and the image's searchables with includeInGlobalSearch, on as
     default_source_suggest_uris has them (Drive starts off).
   - Now cards (now_cards_settings.xml): Show cards (turning it off empties the Google page's cards), Delete card
     preferences? (which turns them off), Show notifications for card updates, the Urgent updates category.
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
  const LANGS = ['en-US', 'en-GB', 'hu-HU', 'de-DE', 'fr-FR', 'es-ES'];
  const TTS = [['always', 'On'], ['handsFreeOnly', 'Hands-free only']];
  const LEVELS = [['2', 'Standard'], ['1', 'Low priority'], ['0', 'Off']];
  const DEFAULTS = {safe_search: false, use_google_com: false, high_contrast_mode_enabled: false, gel_usage_stats: false, hotwordDetector: true, voiceEverywhereEnabled: false,
    hotword_from_lock_screen: false, profanityFilter: true, bluetoothHeadset: false, hands_free_read_notifications_enabled: false, headset_notifications_enabled: false,
    lockscreen_search_bluetooth: true, lockscreen_search_headset: false, vibrate: true};
  const HEADERS = [['privacy', 'Accounts & privacy'], ['language', 'Search language'], ['voice', 'Voice'], ['phone', 'Phone search'], ['cards', 'Now cards']];
  const TITLES = {hotword: 'Ok Google detection', handsfree: 'Hands-free', legal: 'Legal'};
  const langName = (ctx, code, own = false) => { try { return new Intl.DisplayNames([own ? code : ctx.locale || 'en'], {type: 'language'}).of(code); } catch { return code; } };
  const flag = key => DEFAULTS[key];
  const sw = (ctx, key, title, summary = '', disabled = false) => { const on = !!pref(ctx.data, key, flag(key)); return `<button class="mps-row${disabled ? ' disabled' : ''}" data-action="${disabled ? '' : 'lsp-toggle'}" data-id="${key}" role="switch" aria-checked="${on}"${disabled ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span><i class="lp-mswitch${on ? ' on' : ''}"></i></button>`; };
  const row = (action, id, title, summary = '', disabled = false, extra = '') => `<button class="mps-row${disabled ? ' disabled' : ''}" data-action="${disabled ? '' : action}" data-id="${e(id)}"${disabled ? ' disabled' : ''}><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
  const cat = (ctx, key) => `<h4 class="lsp-category">${e(V(ctx, key))}</h4>`;
  function page(ctx) {
    const {ui, data} = ctx, v = key => V(ctx, key), p = ui.lsPage || '';
    if (!p) return cat(ctx, 'Search & Now') + HEADERS.map(([id, title]) => row('lsp-page', id, id === 'phone' ? ctx.t('Phone search') : v(title))).join('');
    if (p === 'privacy') return row('lsp-account', 'account', v('Google Account'), AndroidStrings.format(v('Using %1$s for Google Search and for showing Google Now cards'), ctx.account))
      + row('lsp-web', 'google_account_history', v('Google Account History'), v('View and manage your settings and information')) + sw(ctx, 'safe_search', v('SafeSearch filter'))
      + row('lsp-web', 'commute_sharing', v('Commute sharing')) + sw(ctx, 'use_google_com', v('Search on google.com')) + sw(ctx, 'high_contrast_mode_enabled', v('Accessibility'), v('High contrast text'))
      + sw(ctx, 'gel_usage_stats', v('Help improve Google'), v('Send Google statistics about your interactions with Google Now Launcher')) + row('lsp-page', 'legal', v('Legal'));
    if (p === 'language') { const cur = pref(data, 'search_language', 'en-US'); return cat(ctx, 'Language') + LANGS.map(code => `<button class="mps-row lsp-radio" data-action="lsp-set" data-id="search_language:${code}" role="radio" aria-checked="${code === cur}"><i class="mps-radio${code === cur ? ' on' : ''}"></i><span><b>${e(langName(ctx, code, true))}</b></span></button>`).join(''); }
    if (p === 'voice') return row('lsp-list', 'language', v('Voice language'), langName(ctx, pref(data, 'language', 'en-US'))) + row('lsp-page', 'hotword', v('Ok Google detection'))
      + row('lsp-page', 'handsfree', v('Hands-free'), v('Voice search and spoken notifications')) + row('lsp-list', 'ttsMode', v('Speech output'), v(TTS.find(x => x[0] === pref(data, 'ttsMode', 'always'))[1]))
      + row('lsp-web', 'downloadLanguagePacks', v('Offline speech recognition'), v('Manage downloaded languages'))
      + sw(ctx, 'profanityFilter', v('Block offensive words'), v('Hide recognized offensive voice results')) + sw(ctx, 'bluetoothHeadset', v('Bluetooth headset'), v('Records audio through Bluetooth headset if available.'));
    if (p === 'hotword') { const any = !!pref(data, 'voiceEverywhereEnabled', false); return sw(ctx, 'hotwordDetector', v('From the Google app')) + sw(ctx, 'voiceEverywhereEnabled', v('From any screen')) + sw(ctx, 'hotword_from_lock_screen', v('Personal results'), '', !any)
      + cat(ctx, 'Ok Google Voice Model') + row('lsp-web', 'retrain', v('Retrain voice model'), '', !any) + row('lsp-web', 'delete', v('Delete voice model'), '', !any); }
    if (p === 'handsfree') return cat(ctx, 'Read notifications aloud when') + sw(ctx, 'hands_free_read_notifications_enabled', v('Hands-free is active')) + sw(ctx, 'headset_notifications_enabled', v('Using Bluetooth or headsets'), v('While Bluetooth devices or wired headsets are connected'))
      + cat(ctx, 'Allow requests with device locked') + sw(ctx, 'lockscreen_search_bluetooth', v('For Bluetooth devices')) + sw(ctx, 'lockscreen_search_headset', v('For wired headsets'));
    if (p === 'phone') return `<p class="lsp-note">${e(v('Choose what to search on the phone'))}</p>` + SOURCES.map(([id, title, sum, icon, def]) => { const on = !!pref(data, `source:${id}`, def); return `<button class="mps-row lsp-source" data-action="lsp-source" data-id="${id}" role="checkbox" aria-checked="${on}"><img src="assets/${icon}" alt=""><span><b>${e(v(title))}</b><small>${e(v(sum))}</small></span><i class="mps-check${on ? ' on' : ''}"></i></button>`; }).join('');
    if (p === 'cards') { const on = data.googleNowOn !== false; return `<button class="mps-row" data-action="lsp-cards" role="switch" aria-checked="${on}"><span><b>${e(v('Show cards'))}</b></span><i class="lp-mswitch${on ? ' on' : ''}"></i></button>`
      + row('', 'manageCardHistory', v('Manage card history'), '', true) + row('lsp-delete', 'deleteCardPreferences', v('Delete card preferences?'), v('Delete card preferences summary'))
      + row('lsp-list', 'notificationOverride', v('Show notifications for card updates'), v(LEVELS.find(l => l[0] === pref(data, 'notificationOverride', '2'))[1]), !on)
      + cat(ctx, 'Urgent updates') + row('lsp-ring', 'ring', v('Ringtone'), window.SystemSounds?.SOUNDS?.notifications?.[pref(data, 'ring', '')]?.[0] || '', !on) + sw(ctx, 'vibrate', v('Vibrate'), '', !on)
      + `<p class="lsp-note">${e(v('Urgent updates description'))}</p>`; }
    if (p === 'legal') return ['Terms of service', 'Location terms of service', 'Privacy policy', 'Legal notices', 'Open source licenses'].map(t => row('lsp-web', t, v(t))).join('');
    return '';
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.lsDialog; if (!d) return '';
    const v = key => V(ctx, key), cancel = `<button type="button" data-action="lsp-cancel">${e(ctx.t('Cancel'))}</button>`;
    const shell = (title, body, buttons = cancel) => `<button type="button" class="mps-scrim" data-action="lsp-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="mps-dialog" role="dialog"${title ? ` aria-label="${e(title)}"` : ''}>${title ? `<h3>${e(title)}</h3>` : ''}${body}<div class="mps-buttons">${buttons}</div></div>`;
    const radios = (items, current) => `<div class="mps-choices">${items.map(([value, label]) => `<button type="button" data-action="lsp-pick" data-id="${e(value)}" role="radio" aria-checked="${value === current}"><span>${e(label)}</span><i class="mps-radio${value === current ? ' on' : ''}"></i></button>`).join('')}</div>`;
    if (d.kind === 'list') {
      const lists = {language: [LANGS.map(c => [c, langName(ctx, c)]), 'en-US', 'Voice language'], ttsMode: [TTS.map(([a, b]) => [a, v(b)]), 'always', 'Speech output'], notificationOverride: [LEVELS.map(([a, b]) => [a, v(b)]), '2', 'Show notifications for card updates']};
      const [items, def, title] = lists[d.key]; return shell(v(title), radios(items, String(pref(data, d.key, def))));
    }
    if (d.kind === 'ring') return shell(v('Ringtone'), radios(Object.entries(window.SystemSounds?.SOUNDS?.notifications || {}).map(([file, [title]]) => [file, title]), pref(data, 'ring', '')));
    if (d.kind === 'account') return shell(v('Google Account'), radios([[ctx.account, ctx.account]], ctx.account));
    if (d.kind === 'delete') return shell('', `<p>${e(v('Delete card preferences summary'))}</p>`, `${cancel}<button type="button" data-action="lsp-delete-ok">${e(ctx.t('OK'))}</button>`);
    return '';
  }
  function render(ctx, bar) {
    const {ui} = ctx, p = ui.lsPage || '', header = HEADERS.find(h => h[0] === p);
    const title = !p ? ctx.t('Settings') : p === 'phone' ? ctx.t('Phone search') : V(ctx, header ? header[1] : TITLES[p]);
    return `<div class="app-view sa-app sa-settings mps lsp">${bar(title)}<div class="sa-scroll mps-list">${page(ctx)}</div>${dialog(ctx)}</div>`;
  }
  // ctx: {ui, data, t, locale, account, save, render, unsupported}.
  function handle(action, id, ctx) {
    const {ui, data} = ctx, done = () => { ctx.save(); ctx.render(); return true; };
    switch (action) {
      case 'lsp-page': (ui.lsStack ||= []).push(ui.lsPage || ''); ui.lsPage = id; ui.lsDialog = null; ctx.render(); return true;
      case 'lsp-toggle': setPref(data, id, !pref(data, id, flag(id))); return done();
      case 'lsp-source': { const def = SOURCES.find(x => x[0] === id)[4]; setPref(data, `source:${id}`, !pref(data, `source:${id}`, def)); return done(); }
      case 'lsp-set': { const [key, value] = id.split(':'); setPref(data, key, value); return done(); }
      case 'lsp-cards': data.googleNowOn = data.googleNowOn === false; return done();
      case 'lsp-list': ui.lsDialog = {kind: 'list', key: id}; ctx.render(); return true;
      case 'lsp-ring': ui.lsDialog = {kind: 'ring'}; ctx.render(); return true;
      case 'lsp-account': ui.lsDialog = {kind: 'account'}; ctx.render(); return true;
      case 'lsp-delete': ui.lsDialog = {kind: 'delete'}; ctx.render(); return true;
      case 'lsp-delete-ok': data.googleNowOn = false; ['notificationOverride', 'ring', 'vibrate'].forEach(k => delete store(data).prefs?.[k]); ui.lsDialog = null; return done();
      case 'lsp-pick':
        if (ui.lsDialog?.kind === 'ring') { setPref(data, 'ring', id); window.SystemSounds?.play('notifications', id); }
        else if (ui.lsDialog?.kind === 'list') setPref(data, ui.lsDialog.key, id);
        ui.lsDialog = null; return done();
      case 'lsp-web': ctx.unsupported(); return true;
      case 'lsp-cancel': window.SystemSounds?.stop(); ui.lsDialog = null; ctx.render(); return true;
    }
    return false;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.lsDialog) { window.SystemSounds?.stop(); ui.lsDialog = null; ctx.render(); return true; }
    if (!ui.lsPage) return false;
    ui.lsPage = (ui.lsStack || []).pop() || ''; ctx.render(); return true;
  }
  window.LPSearchPrefs = {render, handle, back};
})();
