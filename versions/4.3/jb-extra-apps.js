/* The remaining launcher apps of the Nexus 4 image (JWR66Y) as simple Holo screens, like the KitKat simulator's extras:
   Messenger (Google+ 4.0's group chat: the conversation list and "New conversation"), Navigation (Maps 6.14's
   DestinationActivity: Speak destination, Type destination, Contacts, Starred places), Local (Maps' Places: the category
   list and the search), Currents 2.1 (the editions library with Featured, Saved and "Add edition"), Play Magazines 2.0 (Read Now / My
   Library), Wallet 1.6 (US only, English everywhere: the dashboard's four buttons) and Movie Studio (AOSP VideoEditor:
   the projects grid with "Create new project"). Texts come from the image's APKs; content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['messenger', 'navigation', 'local', 'currents', 'play-magazines', 'wallet', 'movie-studio'];
  // [hu, de, fr, es] from the image's Maps, Magazines, Google+, Currents and VideoEditor APKs.
  const STRINGS = {
    "My Library": {"res": "Magazines:magazines_navigation_my_library", "hu": "Saját könyvtár", "de": "Meine Bibliothek", "fr": "Ma bibliothèque", "es": "Mi biblioteca"},
    "Read Now": {"res": "Magazines:magazines_navigation_reading_list", "hu": "Olvasson most", "de": "Jetzt lesen", "fr": "Lire maintenant", "es": "Leer ahora"},
    "Contacts": {"res": "Maps:da_picker_contacts", "hu": "Kapcsolatok", "de": "Kontakte", "fr": "Contacts", "es": "Contactos"},
    "Saved": {"res": "Currents:save_for_later_name", "hu": "Mentett", "de": "Gespeichert", "fr": "Enregistré", "es": "Guardado"},
    "Add edition": {"res": "Currents:add_edition", "hu": "Kiadás hozzáadása", "de": "Ausgabe hinzufügen", "fr": "Ajouter l'édition", "es": "Añadir edición"},
    "Featured": {"res": "Currents:category_featured", "hu": "Kiemelt", "de": "Angesagt", "fr": "Sélection", "es": "Destacado"},
    "Attractions": {"res": "Maps:da_layer_name_attractions", "hu": "Látnivalók", "de": "Sehenswürdigkeiten", "fr": "Attractions", "es": "Atracciones"},
    "Gas stations": {"res": "Maps:da_layer_name_gas_stations", "hu": "Benzinkutak", "de": "Tankstellen", "fr": "Stations-service", "es": "Gasolineras"},
    "Restaurants": {"res": "Maps:da_layer_name_restaurants", "hu": "Éttermek", "de": "Restaurants", "fr": "Restaurants", "es": "Restaurantes"},
    "Type destination": {"res": "Maps:da_picker_type_destination", "hu": "Cél begépelése", "de": "Ziel eintippen", "fr": "Saisir destination", "es": "Escribe el destino"},
    "Speak destination": {"res": "Maps:da_picker_speak_destination", "hu": "Cél kimondása", "de": "Ziel einsprechen", "fr": "Énoncer destination", "es": "Di el destino"},
    "Starred places": {"res": "Maps:da_picker_starred_items", "hu": "Csillaggal megjelölt helyek", "de": "Markierte Orte", "fr": "Adresses enregistrées", "es": "Sitios destacados"},
    "New conversation": {"res": "PlusOne:menu_new_conversation", "hu": "Új beszélgetés", "de": "Neue Unterhaltung", "fr": "Nouvelle conversation", "es": "Nueva conversación"},
    "Create new project": {"res": "VideoEditorGoogle:projects_new_project", "hu": "Új projekt létrehoz.", "de": "Neues Projekt erstellen", "fr": "Créer un projet", "es": "Crear nuevo proyecto"}
  };
  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Texts the stock-strings index resolves from the image's APKs (docs/data/stock-strings.json).
  const S = (app, key, t) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, key) : t(key); };
  const STR = AndroidStrings.table('', STRINGS), local = (key, t) => STR.has(key) ? STR.t(key) : t(key);
  const svg = {
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    keyboard: '<svg viewBox="0 0 24 24"><path d="M2 6h20v12H2zm2 2v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm3 0v2h2V8zm3 0v2h2V8zM4 11v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zm3 0v2h2v-2zM7 14v2h10v-2z" fill="currentColor"/></svg>',
    person: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" fill="currentColor"/><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 2 3 6.6 7 .7-5.3 4.8 1.6 7L12 17.5 5.7 21l1.6-7L2 9.3l7-.7z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 3v2h14V8zm0 5v4h14v-4z" fill="currentColor"/></svg>'
  };
  /* Navigation's Contacts and Starred places pickers (da_picker_contacts / da_picker_starred_items): the contacts'
     addresses and the places starred in Maps, each a row that drives there (maps-route.js); their empty texts are
     da_picker_no_contacts and da_picker_no_starred_items. Local's search and categories look through the places Maps
     keeps (the starred ones and the searches) by the category's words; a find opens on the map. As in 4.0.4. */
  const CATEGORY_WORDS = {Restaurants: ['restaurant', 'diner', 'pizza', 'sushi', 'grill', 'bistro'], Coffee: ['coffee', 'cafe', 'café', 'espresso'],
    Bars: ['bar', 'pub', 'tavern'], Hotels: ['hotel', 'inn', 'motel', 'hostel'], Attractions: ['museum', 'park', 'zoo', 'gallery', 'tower', 'bridge'],
    ATMs: ['atm', 'bank'], 'Gas stations': ['gas', 'fuel', 'petrol', 'station']};
  const storedPlaces = data => [...new Set([...(data.mapsStarred || []), ...(data.mapsHistory || [])])].filter(Boolean);
  const placeHits = (data, words) => storedPlaces(data).filter(p => words.some(w => String(p).toLocaleLowerCase().includes(w)));
  function picker(ui, t, data, contacts) {
    const n = key => S('navigation', key, t), starred = ui.navPick === 'starred';
    const rows = starred ? (data.mapsStarred || []).map(p => ['', p]) : contacts.flatMap(c => (c.postals || []).filter(a => a?.value).map(a => [c.name, a.value]));
    const body = rows.length ? rows.map(([name, where]) => `<button class="nav-pick-row" data-action="xa-nav-go" data-id="${e(where)}">${name ? `<b>${e(name)}</b><small>${e(where)}</small>` : `<b>${e(where)}</b>`}</button>`).join('')
      : `<p class="nav-pick-empty">${e(n(starred ? 'No starred places' : 'No contacts with addresses'))}</p>`;
    return `<div class="app-view kkx-app nav614"><header class="nav-bar"><img src="assets/navigation.png" alt=""><b>${e(n(starred ? 'Starred places' : 'Contacts'))}</b></header><div class="nav-pick">${body}</div></div>`;
  }
  // Places' bar (the feature switcher, the title or the search field, Search) over the location bar.
  const locBar = (title, ui, t) => `<header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/loc-switcher_dropdown_triangle.png" alt=""></span><i></i>${ui.locSearching ? `<form class="loc-sv" data-form="xa-loc-search"><input name="query" placeholder="${e(S('navigation', 'Search Maps', t))}" autocomplete="off" spellcheck="false"></form>` : `<b>${e(title)}</b><i></i>`}<button data-action="xa-loc-search" aria-label="${e(t('Search'))}"><img src="assets/loc-actionbar_search.png" alt=""></button></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div>`;
  function results(ui, t, data) {
    const r = ui.locResults, words = r.category ? CATEGORY_WORDS[r.category] : [r.query.toLocaleLowerCase()], hits = placeHits(data, words);
    return `<div class="app-view kkx-app loc614 loc-found">${locBar(r.category ? local(r.category, t) : r.query, ui, t)}<div class="loc-results">${hits.map(p => `<button class="loc-hit" data-action="xa-loc-open" data-id="${e(p)}"><b>${e(p)}</b></button>`).join('')}</div></div>`;
  }
  const bar = (app, title, actions = '', cls = '') => `<header class="kkx-bar ${cls}"><button class="kkx-home" data-action="home" aria-label="${e(title)}"><img src="assets/${app}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const action = (icon, label) => `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(label)}">${svg[icon]}</button>`;
  const row = (icon, label, sub = '', color = '#33b5e5') => `<button class="kkx-file" data-action="kkx-unavailable"><span class="kkx-file-icon" style="color:${color}">${svg[icon]}</span><span class="kkx-file-copy"><strong>${e(label)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</span></button>`;
  const tiles = (items, cls = '') => `<div class="jbx-grid ${cls}">${items.map(([title, color, sub = '']) => `<button class="jbx-tile" data-action="kkx-unavailable" style="--tile:${color}"><span class="jbx-tile-art">${e(title.charAt(0))}</span><strong>${e(title)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</button>`).join('')}</div>`;
  function render(app, {studio, ui, t, chats = [], contacts = [], data = {}, messenger, news}) {
    if (app === 'messenger') {
      // Google+ 4.0's HostedMessengerFragment: onPrepareActionBar shows the title and the New conversation button; a
      // conversation, New conversation and the settings (plus-messenger.js) keep the bar with Up.
      const m = key => S('gplus', key, t);
      const bar = ({title, up}) => `<header class="sa-bar"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(title)}">${up ? '<img class="sa-caret" src="assets/ic_ab_back_holo_light.png" alt="">' : ''}<img src="assets/messenger.png" alt=""></button><span class="sa-title"><b>${e(title)}</b></span>${up ? '' : `<button class="msg-act" data-action="gpm-new-open" aria-label="${e(m('New conversation'))}"><img src="assets/msg-ic_menu_start_new_huddle.png" alt=""></button>`}<button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header>`;
      const list = rows => `<div class="app-view kkx-app msg40">${bar({title: m('Messenger')})}<div class="msg-list">${rows ? rows.map(r => `<button class="msg-row" data-action="gpm-open" data-id="${e(r.id)}"><img src="assets/msg-ic_avatar.png" alt=""><span><b>${e(r.title)}</b><small>${e(r.snippet)}</small></span><time>${e(r.time)}</time></button>`).join('') : `<p class="gpm-empty">${e(m('Start a conversation'))}</p>`}</div></div>`;
      return window.PlusMessenger.render({...messenger, bar, list});
    }
    if (app === 'navigation' && ui.navPick) return picker(ui, t, data, contacts);
    if (app === 'local' && ui.locResults) return results(ui, t, data);
    if (app === 'navigation') {
      // Maps 6.14's DestinationActivity on a phone (da_destination_activity_redesign): the shortcut tiles of class aa.
      const n = key => S('navigation', key, t);
      // Type destination asks for a place and drives there (maps-route.js), Contacts and Starred places pick one;
      // Speak destination needs the network's recognizer.
      const tile = (key, icon) => `<button class="nav-tile" data-action="${{'Type destination': 'mr-type-dest', Contacts: 'xa-nav-pick', 'Starred places': 'xa-nav-pick'}[key] || 'kkx-unavailable'}" data-id="${key === 'Contacts' ? 'contacts' : key === 'Starred places' ? 'starred' : ''}"><img class="${icon}" src="assets/nav-${icon}.png" alt=""><span>${e(n(key))}</span></button>`;
      return `<div class="app-view kkx-app nav614"><header class="nav-bar"><img src="assets/navigation.png" alt=""><b>${e(n('Navigation'))}</b></header><div class="nav-strip"><b>${e(n('SHORTCUTS'))}</b><span>${e(n('STARRED'))}</span></div><div class="nav-tiles">${tile('Speak destination', 'da_picker_speak_destination')}${tile('Type destination', 'da_picker_type_destination')}${tile('Contacts', 'da_picker_contacts')}${tile('Starred places', 'da_picker_starred_items')}</div></div>`;
    }
    if (app === 'local') {
      // Maps 6.14's Places (placesv2.xml); the categories are the ones Places offers by default, with the APK's icons;
      // Search opens a field in the bar.
      const cats = [['Restaurants', 'restaurants'], ['Coffee', 'cafe'], ['Bars', 'bars'], ['Hotels', 'hotels'], ['Attractions', 'attractions'], ['ATMs', 'atm'], ['Gas stations', 'gas']];
      return `<div class="app-view kkx-app loc614">${locBar(S('navigation', 'Local', t), ui, t)}<div class="loc-cats">${cats.map(([key, icon]) => `<button data-action="xa-loc-cat" data-id="${key}"><img src="assets/loc-places_cat_icon_${icon}.png" alt=""><span>${e(local(key, t))}</span></button>`).join('')}</div></div>`;
    }
    // The reader, search, Saved, an issue and the settings (news-reader.js) under an Up bar.
    if (news && (app === 'currents' || app === 'play-magazines')) {
      const icon = app === 'currents' ? 'currents.png' : 'mag-ic_corpora_tile_magazines.png', dark = app === 'play-magazines';
      const nr = window.NewsReader?.render({...news, bar: ({title, actions = ''}) => `<header class="sa-bar${dark ? ' dark' : ''} nr-bar"><button class="sa-up" data-action="back" aria-label="${e(t('Back'))}"><img class="sa-caret" src="assets/ic_ab_back_holo_${dark ? 'dark' : 'light'}.png" alt=""><img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b></span>${actions}</header>`});
      if (nr) return nr;
    }
    if (app === 'currents') {
      // Currents 2.1's home: the story pager of the selected category over the category menu (the home button slides
      // the panel aside). Breaking stories mixes the editions; an edition of the menu shows its own stories. The
      // categories, Customize and Add editions are currents-customize.js.
      const c = key => S('currents', key, t), CZ = window.CurrentsCustomize;
      if (CZ && ui.currentsCustomize) return CZ.page({ui, data, t, S: c});
      const editions = CZ ? CZ.editions(data) : [];
      const blurbs = {c1: 'A look at the season’s new hardware and what changed under the glass.', c2: 'Shaded routes, quiet lakes and where to park before nine.', c3: 'Roast once on Sunday and cook the week with what is left.'};
      const edition = editions.some(([name]) => name === ui.currentsEdition) ? ui.currentsEdition : '', A = window.NewsReader?.ARTICLES || {};
      const stories = (edition ? ['c1', 'c2', 'c3', 't1', 'k1'].filter(id => A[id]?.source === edition) : ['c1', 'c2', 'c3'].filter(id => CZ?.inBreaking(data, A[id]?.source))).filter(id => A[id]).map(id => [id, A[id].source, A[id].title, blurbs[id] || A[id].body[0]]);
      const menu = `<nav class="cur-menu">${[[c('Breaking stories'), !edition, 'currents-edition', ''], [c('Saved'), false, 'nr-section', 'saved']].map(([label, on, action, id]) => `<button class="cur-cat${on ? ' on' : ''}" data-action="${action}" data-id="${id}">${e(label)}</button>`).join('')}${CZ ? CZ.menu(data, c, edition) : ''}</nav>`;
      return `<div class="app-view kkx-app cur21${ui.currentsMenu ? ' menu-open' : ''}">${menu}<div class="cur-panel"><header class="cur-bar"><button class="cur-home" data-action="currents-menu" aria-label="${e(c('Currents'))}"><img src="assets/currents.png" alt=""></button><b>${e(edition || c('Breaking stories'))}</b><button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header><div class="cur-stories">${stories.length ? '' : `<p class="cur-empty">${e(c('This section has no content.'))}</p>`}${stories.map(([id, ed, title, body]) => `<button class="cur-tile" data-action="nr-open" data-id="${id}"><b>${e(title)}</b><small>${e(ed)}</small><span>${e(body)}</span></button>`).join('')}</div></div></div>`;
    }
    if (app === 'play-magazines') {
      const page = ui.jbxMagazines || 'read', g = key => S('magazines', key, t);
      // The issues (news-reader.js ISSUES); On device only leaves none, as nothing is downloaded.
      const issues = (news && window.NewsReader?.onDevice(news) ? [] : page === 'read' ? ['mag1', 'mag2', 'mag3'] : ['mag1', 'mag4']).map(id => [id, window.NewsReader?.ISSUES[id] || {}]);
      const cards = issues.length ? issues.map(([id, {title, issue, color}]) => `<button class="mag-card" data-action="nr-issue" data-id="${id}"><span class="mag-cover" style="background:${color}"><b>${e(title)}</b></span><img class="mag-more" src="assets/mag-ic_menu_moreoverflow_card_dark_normal.png" alt=""><strong>${e(title)}</strong><small>${e(issue)}</small></button>`).join('') : `<p class="nr-empty">${e(g('No magazines on this device'))}</p>`;
      const drawer = ui.magDrawer ? `<button class="mag-scrim" data-action="mag-drawer" aria-label="${e(t('Close'))}"></button><nav class="mag-drawer">${[['read', 'Read Now'], ['library', 'My Library']].map(([id, key]) => `<button class="${id === page ? 'on' : ''}" data-action="jbx-tab" data-id="${id}">${e(g(key))}</button>`).join('')}<button data-action="play-store-open">${e(g('Shop'))}</button></nav>` : '';
      return `<div class="app-view kkx-app mag20"><header class="mag-bar"><button class="mag-home" data-action="mag-drawer" aria-label="${e(g('Google Play Magazines'))}"><img src="assets/bk28-ic_drawer_white.png" alt=""><img src="assets/mag-ic_corpora_tile_magazines.png" alt=""></button><b>${e(g(page === 'read' ? 'Read Now' : 'My Library'))}</b><button class="msg-act" data-action="nr-search" aria-label="${e(g('Search magazines'))}"><img src="assets/bk28-ic_menu_search_dark.png" alt=""></button><button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="mag-grid">${cards}</div>${drawer}</div>`;
    }
    if (app === 'wallet') {
      // Wallet 1.6's dashboard_activity (dashboard_button_* captions).
      const button = ([label, icon]) => `<button class="wal-btn" data-action="kkx-unavailable"><img src="assets/wal-ic_btn_dashboard_${icon}_normal.png" alt=""><span>${e(label)}</span></button>`;
      return `<div class="app-view kkx-app wal16"><header class="sa-bar"><button class="sa-up" data-action="home" aria-label="Wallet"><img src="assets/wallet.png" alt=""></button><span class="sa-title"><b>Wallet</b></span></header><div class="wal-dash"><i class="wal-space"></i><div class="wal-row">${[['Payment cards', 'payment'], ['Rewards cards', 'loyalty']].map(button).join('')}</div><i class="wal-space"></i><div class="wal-row">${[['Offers', 'offers'], ['Transactions', 'transactions']].map(button).join('')}</div><i class="wal-space wide"></i></div></div>`;
    }
    if (app === 'movie-studio') {
      // AOSP VideoEditor: the projects grid and the editor (movie-studio.js) under the ms-bar.
      const bar = ({title, actions = ''}) => `<header class="ms-bar">${title ? `<button class="ms-up" data-action="back" aria-label="${e(t('Back'))}"><img src="assets/movie-studio.png" alt=""></button><b>${e(title)}</b>${actions}<button class="ms-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>` : '<img src="assets/movie-studio.png" alt="">'}</header>`;
      return window.MovieStudio.render({...studio, bar});
    }
    return '';
  }
  // ctx: {ui, data, go(destination), openMap(query), render, focus(selector)}.
  function handle(action, id, ctx) {
    const {ui} = ctx;
    switch (action) {
      case 'xa-nav-pick': ui.navPick = id; ctx.render(); return true;
      case 'xa-nav-go': ui.navPick = ''; ctx.go(id); return true;
      case 'xa-loc-cat': ui.locResults = {category: id}; ctx.render(); return true;
      case 'xa-loc-search': ui.locSearching = !ui.locSearching; ctx.render(); if (ui.locSearching) ctx.focus('.loc-sv input'); return true;
      case 'xa-loc-open': ctx.openMap(id); return true;
    }
    return false;
  }
  function submit(form, values, ctx) {
    if (form !== 'xa-loc-search') return false;
    const q = String(values.get('query') || '').trim(); if (q) { ctx.ui.locSearching = false; ctx.ui.locResults = {query: q}; ctx.render(); }
    return true;
  }
  // Back: a picker, the search field or the results return to their app's first screen.
  function back(ui) {
    if (ui.view === 'navigation' && ui.navPick) { ui.navPick = ''; return true; }
    if (ui.view === 'local' && (ui.locResults || ui.locSearching)) { ui.locResults = null; ui.locSearching = false; return true; }
    return false;
  }
  window.JBExtraApps = {APPS, render, handle, submit, back, text: (app, key) => S(app, key, k => k)};
})();
/* The rest of the Nexus 4 image's launcher (Messenger, Navigation, Local, Currents, Play Magazines, Wallet, Movie
   Studio), moved out of simulator.js (docs/plans/engine-migration.md): their screens (JBExtraApps above), Navigation's
   drive and Maps 6 directions (maps-route.js), Currents' reader and Customize, Movie Studio's projects, Messenger's
   conversations; their actions, forms, typing, dialogs, Back and opening. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, cczContext, data, i18n, messageDraft, messengerContext, movieContext, openApp, overlayRoot, render, renderOverlay, row, safe, save, toast, ui, viewport;
  const $bind = c => { $c = c; ({cczContext, data, i18n, messageDraft, messengerContext, movieContext, openApp, overlayRoot, render, renderOverlay, row, safe, save, toast, ui, viewport} = c); };
  function extraContext() {
    return {ui, data, render, focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      go(to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); },
      openMap(query) { openApp('maps'); ui.mapsQuery = query; render(); }};
  }
  // Maps 6 directions and Navigation's drive (maps-route.js).
  function mrContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), root: viewport, save, render,
      focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.')),
      mapSvg: StockApps.mapSvg({ui: {...ui, mapsRoute: null, mapsQuery: ''}, data, t: key => i18n.t(key), locale: i18n.locale()}).replace(/^<svg[^>]*>|<\/svg>$/g, ''),
      navigate: run => { ui.mapsRoute = ui.mapsRoute ? {...ui.mapsRoute, screen: 'map'} : null; openApp('navigation'); MapsRoute.startNav(mrContext(), run); render(); }};
  }
  // Currents / Magazines / Newsstand reading and settings (news-reader.js).
  const newsContext = () => ({app: ui.view, profile: ui.view === 'currents' ? 'currents' : 'magazines', ui, data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.[ui.view === 'currents' ? 'currents' : 'magazines']?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, account: 'jellybean.demo@gmail.com', save, render, toast: message => toast(message), unavailable: 'kkx-unavailable', emptyFor: {}, share: (text, subject) => { ui.overlay = ''; renderOverlay(); openApp('messaging'); ui.sub = 'new'; Object.assign(messageDraft(), {body: text, updated: Date.now()}); save(); render(); }});
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'messenger': case 'navigation': case 'local': case 'currents': case 'play-magazines': case 'wallet': case 'movie-studio': if (ui.view === 'navigation' && ui.navRun) return MapsRoute.nav(mrContext()); return JBExtraApps.render(ui.view, {studio: ui.view === 'movie-studio' ? movieContext() : null, news: ['currents', 'play-magazines'].includes(ui.view) ? newsContext() : null, messenger: ui.view === 'messenger' ? messengerContext() : null, ui, t: key => i18n.t(key), contacts: data.contacts, data});
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (ui.view === 'messenger' && action.startsWith('gpm-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusMessenger.handle(action, id, messengerContext())) return true; }
      if (['currents', 'play-magazines'].includes(ui.view) && action.startsWith('nr-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } ui.kkxDrawer = false; ui.lpxDrawer = false; ui.magDrawer = false; ui.currentsMenu = false; if (NewsReader.handle(action, id, newsContext())) return true; }
      if (ui.view === 'movie-studio' && action.startsWith('mst-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (MovieStudio.handle(action, id, movieContext())) return true; }
      switch (action) {
        case 'currents-menu': ui.currentsMenu = !ui.currentsMenu; render(); break;
        case 'currents-edition': ui.currentsEdition = id || ''; ui.currentsMenu = false; render(); break;
        case 'kkx-unavailable': toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'jbx-tab': ui.jbxMagazines = id; ui.magDrawer = false; render(); break;
        case 'mag-drawer': ui.magDrawer = !ui.magDrawer; render(); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      if (['currents', 'play-magazines'].includes(ui.view) && NewsReader.submit(form.dataset.form, values, newsContext())) return true;
      if (PlusMessenger.submit(form.dataset.form, values, messengerContext())) return true;
      if (JBExtraApps.submit(form.dataset.form, values, extraContext())) return true;
      if (form.dataset.form === 'mr-type') { overlayRoot.querySelector('[data-action="mr-type-ok"]')?.click(); return true; }
      if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, mrContext()); return true; }
      return false;
    },
    input(event, c) {
      $bind(c);
      if (['currents', 'play-magazines'].includes(ui.view) && NewsReader.input(event.target, newsContext())) return true;
      if (ui.view === 'currents' && CurrentsCustomize.change(event.target, cczContext())) return true;
      if (PlusMessenger.input(event.target, messengerContext())) return true;
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'messenger' && !ui.overlay && PlusMessenger.back(ui)) { render(); return true; }
      if (['currents', 'play-magazines'].includes(ui.view) && !ui.overlay && NewsReader.back(ui)) { render(); return true; }
      if (ui.view === 'currents' && !ui.overlay && CurrentsCustomize.back(ui)) { render(); return true; }
      if (ui.view === 'currents' && !ui.overlay && (ui.currentsMenu || ui.currentsEdition)) { if (ui.currentsMenu) ui.currentsMenu = false; else ui.currentsEdition = ''; render(); return true; }
      if (ui.view === 'movie-studio' && !ui.overlay && MovieStudio.back(ui)) { render(); return true; }
      if (ui.view === 'navigation' && !ui.overlay && ui.navRun) { ui.overlay = 'mr-exit'; renderOverlay(); return true; }
      if (['navigation', 'local'].includes(ui.view) && !ui.overlay && JBExtraApps.back(ui)) { render(); return true; }
      return false;
    },
    // Clicks taken before the keyguard's filter (the core's click handler).
    actionEarly(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return true;
      // Navigation's Contacts / Starred places pickers and Local's search and categories (jb-extra-apps.js).
      if (action.startsWith('xa-') && JBExtraApps.handle(action, id, extraContext())) return true;
      if (action.startsWith('ccz-') && CurrentsCustomize.handle(action, id, cczContext())) return true;
      if (action === 'mr-type-dest') { ui.overlay = 'mr-type'; renderOverlay(); overlayRoot.querySelector('input')?.focus(); return true; }
      if (action === 'mr-type-ok') { const to = overlayRoot.querySelector('input')?.value.trim(); ui.overlay = ''; renderOverlay(); if (to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); } return true; }
      if (action === 'mr-exit-ok') { ui.overlay = ''; renderOverlay(); MapsRoute.stopNav(mrContext()); render(); return true; }
      return false;
    },
    open(c, resume, app) {
      $bind(c);
      if (app === 'movie-studio' && !resume) MovieStudio.open(ui);
      if (['currents', 'play-magazines'].includes(app) && !resume) { NewsReader.open(ui); ui.currentsEdition = ''; ui.currentsCustomize = ''; ui.currentsLibrary = false; }
      if (app === 'messenger' && !resume) PlusMessenger.open(ui);
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'mr-type') {
        // Navigation's Type destination: the address field with OK / Cancel.
        const S = key => MapsRoute.S(mrContext(), key), title = JBExtraApps.text ? JBExtraApps.text('navigation', 'Type destination') : 'Type destination';
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="mr-type" role="dialog" aria-label="${safe(title)}" data-no-translate><h3>${safe(title)}</h3><input class="settings-dialog-input" name="to" autocomplete="off" spellcheck="false" style="display:block;width:calc(100% - calc(28.1823 * var(--dp)));margin:calc(4.6971 * var(--dp)) calc(14.0912 * var(--dp)) calc(14.0912 * var(--dp));padding:calc(7.0456 * var(--dp));font:inherit"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${safe(S('Cancel'))}</button><button type="button" data-action="mr-type-ok">${safe(S('OK'))}</button></div></form>`;
      } else if (ui.overlay === 'mr-exit') {
        const S = key => MapsRoute.S(mrContext(), key);
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(S('Exit navigation?'))}" data-no-translate><h3>${safe(S('Exit navigation?'))}</h3><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(S('Cancel'))}</button><button data-action="mr-exit-ok">${safe(S('OK'))}</button></div></div>`;
      }
      else return;
      return true;
    },
    exports: {
      mrContext: (c, ...args) => { $bind(c); return mrContext(...args); }
    }
  };
  JB.register('messenger', spec);
  JB.register('navigation', spec);
  JB.register('local', spec);
  JB.register('currents', spec);
  JB.register('play-magazines', spec);
  JB.register('wallet', spec);
  JB.register('movie-studio', spec);
})();
