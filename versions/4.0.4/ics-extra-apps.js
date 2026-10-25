/* Four launcher apps of the Galaxy Nexus image (IMM76I) as Holo screens, with the APKs' texts (docs/tools/apk-strings.py):
   Messenger (Google+ 2.4's ConversationListActivity: the conversation list, "New conversation"), Navigation (Maps
   6.4's da_destination_activity: Speak destination, Type destination, Contacts, Starred places; Type destination
   drives there with maps-route.js), Places (Maps 6.4's placesv2 categories) and Movie Studio (AOSP VideoEditor
   android-4.0.4_r2.1: the projects grid with "Create new project"). Content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['messenger', 'navigation', 'local', 'movie-studio'];
  // Places' categories [hu, de, fr, es] from the image's Maps APK.
  const STRINGS = {
    "Attractions": {"res": "Maps:da_layer_name_attractions", "hu": "Látnivalók", "de": "Sehenswürdigkeiten", "fr": "Attractions", "es": "Atracciones"},
    "Gas stations": {"res": "Maps:da_layer_name_gas_stations", "hu": "Benzinkutak", "de": "Tankstellen", "fr": "Stations-service", "es": "Gasolineras"},
    "Restaurants": {"res": "Maps:da_layer_name_restaurants", "hu": "Éttermek", "de": "Restaurants", "fr": "Restaurants", "es": "Restaurantes"}
  };  const LANGS = ['hu', 'de', 'fr', 'es'];
  // Texts the stock-strings index resolves from the image's APKs (docs/data/stock-strings.json).
  const S = (app, key, t) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, key) : t(key); };
  const STR = AndroidStrings.table('', STRINGS), local = (key, t) => STR.has(key) ? STR.t(key) : t(key);
  /* Navigation's Contacts and Starred places pickers (da_picker_contacts / da_picker_starred_items): the contacts'
     addresses and the places starred in Maps, each a row that drives there (maps-route.js); their empty texts are
     da_picker_no_contacts and da_picker_no_starred_items. Places' search and categories look through the places Maps
     keeps (the starred ones and the searches) by the category's words; a find opens on the map. */
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
    return `<div class="app-view kkx-app nav64"><header class="nav-head"><span class="nav-switch"><img src="assets/nav-ic_feature_navigation.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(n(starred ? 'Starred places' : 'Contacts'))}</b></header><div class="nav-pick">${body}</div></div>`;
  }
  function results(ui, t, data) {
    const r = ui.locResults, words = r.category ? CATEGORY_WORDS[r.category] : [r.query.toLocaleLowerCase()], hits = placeHits(data, words);
    return `<div class="app-view kkx-app loc64"><header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(r.category ? local(r.category, t) : r.query)}</b></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div><div class="loc-results">${hits.map(p => `<button class="loc-hit" data-action="xa-loc-open" data-id="${e(p)}"><b>${e(p)}</b></button>`).join('')}</div></div>`;
  }
  function render(app, {ui, t, chats = [], contacts = [], data = {}}) {
    if (app === 'messenger') {
      // Google+ 2.4's ConversationListActivity: the EsActionBar with home as up and conversation_list_item_view rows.
      const m = key => S('gplus', key, t), people = contacts.slice(0, 3);
      const rows = people.map((p, i) => `<button class="msg24-row" data-action="kkx-unavailable"><img src="assets/msg-default_avatar.png" alt=""><span><b>${e(p.name)}</b><small>${e(['Saturday’s hike: who’s driving?', 'Photos from the meetup', 'See you at 11!'][i])}</small></span><time>${['10:24', '9:02', 'Mon'][i]}</time></button>`).join('');
      return `<div class="app-view kkx-app msg24"><header class="msg24-bar"><button data-action="home" aria-label="${e(m('Messenger'))}"><img class="up" src="assets/ga-fw-ic_ab_back_holo_dark.png" alt=""><img src="assets/messenger.png" alt=""></button><b>${e(m('Messenger'))}</b><button class="msg24-act" data-action="kkx-unavailable" aria-label="${e(m('New conversation'))}"><img src="assets/msg-ic_menu_start_new_huddle_action_bar.png" alt=""></button><button class="msg24-act" data-action="jbx-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="msg24-list">${rows}</div></div>`;
    }
    if (app === 'navigation' && ui.navPick) return picker(ui, t, data, contacts);
    if (app === 'local' && ui.locResults) return results(ui, t, data);
    if (app === 'navigation') {
      // Maps 6.4's da_destination_activity: the da_actionBar (feature switcher, "Navigation", the Map button) over the
      // ListView whose header holds class aa's tiles.
      const n = key => S('navigation', key, t);
      // Type destination asks for a place and drives there (maps-route.js), Contacts and Starred places pick one;
      // Speak destination needs the network's recognizer.
      const tile = (key, icon) => `<button class="nav-tile" data-action="${{'Type destination': 'mr-type-dest', Contacts: 'xa-nav-pick', 'Starred places': 'xa-nav-pick'}[key] || 'kkx-unavailable'}" data-id="${key === 'Contacts' ? 'contacts' : key === 'Starred places' ? 'starred' : ''}"><img src="assets/nav-${icon}.png" alt=""><span>${e(n(key))}</span></button>`;
      return `<div class="app-view kkx-app nav64"><header class="nav-head"><span class="nav-switch"><img src="assets/nav-ic_feature_navigation.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(n('Navigation'))}</b><i></i><button data-action="open-app" data-app="maps"><img src="assets/nav-da_btn_show_map.png" alt="">${e(n('Map'))}</button></header><div class="nav-tiles">${tile('Speak destination', 'da_picker_speak_destination')}${tile('Type destination', 'da_picker_type_destination')}${tile('Contacts', 'da_picker_contacts')}${tile('Starred places', 'da_picker_starred_items')}</div></div>`;
    }
    if (app === 'local') {
      // Maps 6.4's Places (placesv2.xml): the categories Places offers by default, with the APK's icons; Search opens a
      // field in the bar.
      const cats = [['Restaurants', 'restaurants'], ['Coffee', 'cafe'], ['Bars', 'bars'], ['Hotels', 'hotels'], ['Attractions', 'attractions'], ['ATMs', 'atm'], ['Gas stations', 'gas']];
      return `<div class="app-view kkx-app loc64"><header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/nav-switcher_dropdown_triangle.png" alt=""></span><i></i>${ui.locSearching ? `<form class="loc-sv" data-form="xa-loc-search"><input name="query" placeholder="${e(S('navigation', 'Search Maps', t))}" autocomplete="off" spellcheck="false"></form>` : `<b>${e(S('navigation', 'Places', t))}</b><i></i>`}<button data-action="xa-loc-search" aria-label="${e(t('Search'))}"><img src="assets/loc-actionbar_search.png" alt=""></button></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div><div class="loc-cats">${cats.map(([key, icon]) => `<button data-action="xa-loc-cat" data-id="${key}"><img src="assets/loc-places_cat_icon_${icon}.png" alt=""><span>${e(local(key, t))}</span></button>`).join('')}</div></div>`;
    }
    if (app === 'movie-studio') {
      // AOSP VideoEditor (android-4.0.4_r2.1): ProjectsActivity's project picker with the new-project bitmap.
      const title = S('studio', 'Create new project', t);
      return `<div class="app-view kkx-app ms43"><header class="ms-bar"><img src="assets/movie-studio.png" alt=""></header><div class="ms-grid"><button class="ms-item" data-action="kkx-unavailable" aria-label="${e(title)}"><span class="ms-thumb"><img src="assets/ms-add_video_project_big.png" alt=""><b>${e(title)}</b></span></button></div></div>`;
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
  // Back: a picker or the results return to their app's first screen.
  function back(ui) {
    if (ui.view === 'navigation' && ui.navPick) { ui.navPick = ''; return true; }
    if (ui.view === 'local' && (ui.locResults || ui.locSearching)) { ui.locResults = null; ui.locSearching = false; return true; }
    return false;
  }
  // The action bar overflow (the jbx-menu overlay).
  function menu(app, t) {
    if (app === 'messenger') return ['Settings', 'Send feedback', 'Help'].map(key => ({action: 'kkx-unavailable', title: S('gplus', key, t)}));
    return [];
  }
  window.JBExtraApps = {APPS, render, menu, handle, submit, back, text: (app, key) => S(app, key, k => k)};
})();
