/* The remaining launcher apps of the Nexus 4 image (JWR66Y) as simple Holo screens, like the KitKat simulator's extras:
   Messenger (Google+ 4.0's group chat: the conversation list and "New conversation"), Navigation (Maps 6.14's
   DestinationActivity: Speak destination, Type destination, Contacts, Starred places), Local (Maps' Places: the category
   list), Currents 2.1 (the editions library with Featured, Saved and "Add edition"), Play Magazines 2.0 (Read Now / My
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
  const bar = (app, title, actions = '', cls = '') => `<header class="kkx-bar ${cls}"><button class="kkx-home" data-action="home" aria-label="${e(title)}"><img src="assets/${app}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const action = (icon, label) => `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(label)}">${svg[icon]}</button>`;
  const row = (icon, label, sub = '', color = '#33b5e5') => `<button class="kkx-file" data-action="kkx-unavailable"><span class="kkx-file-icon" style="color:${color}">${svg[icon]}</span><span class="kkx-file-copy"><strong>${e(label)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</span></button>`;
  const tiles = (items, cls = '') => `<div class="jbx-grid ${cls}">${items.map(([title, color, sub = '']) => `<button class="jbx-tile" data-action="kkx-unavailable" style="--tile:${color}"><span class="jbx-tile-art">${e(title.charAt(0))}</span><strong>${e(title)}</strong>${sub ? `<small>${e(sub)}</small>` : ''}</button>`).join('')}</div>`;
  function render(app, {ui, t, chats = [], contacts = [], messenger}) {
    if (app === 'messenger') {
      // Google+ 4.0's HostedMessengerFragment: onPrepareActionBar shows the title and the New conversation button; a
      // conversation, New conversation and the settings (plus-messenger.js) keep the bar with Up.
      const m = key => S('gplus', key, t);
      const bar = ({title, up}) => `<header class="sa-bar"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(title)}">${up ? '<img class="sa-caret" src="assets/ic_ab_back_holo_light.png" alt="">' : ''}<img src="assets/messenger.png" alt=""></button><span class="sa-title"><b>${e(title)}</b></span>${up ? '' : `<button class="msg-act" data-action="gpm-new-open" aria-label="${e(m('New conversation'))}"><img src="assets/msg-ic_menu_start_new_huddle.png" alt=""></button>`}<button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header>`;
      const list = rows => `<div class="app-view kkx-app msg40">${bar({title: m('Messenger')})}<div class="msg-list">${rows ? rows.map(r => `<button class="msg-row" data-action="gpm-open" data-id="${e(r.id)}"><img src="assets/msg-ic_avatar.png" alt=""><span><b>${e(r.title)}</b><small>${e(r.snippet)}</small></span><time>${e(r.time)}</time></button>`).join('') : `<p class="gpm-empty">${e(m('Start a conversation'))}</p>`}</div></div>`;
      return window.PlusMessenger.render({...messenger, bar, list});
    }
    if (app === 'navigation') {
      // Maps 6.14's DestinationActivity on a phone (da_destination_activity_redesign): the shortcut tiles of class aa.
      const n = key => S('navigation', key, t);
      // Type destination asks for a place and drives there (maps-route.js); the other pickers need the network.
      const tile = (key, icon) => `<button class="nav-tile" data-action="${key === 'Type destination' ? 'mr-type-dest' : 'kkx-unavailable'}"><img class="${icon}" src="assets/nav-${icon}.png" alt=""><span>${e(n(key))}</span></button>`;
      return `<div class="app-view kkx-app nav614"><header class="nav-bar"><img src="assets/navigation.png" alt=""><b>${e(n('Navigation'))}</b></header><div class="nav-strip"><b>${e(n('SHORTCUTS'))}</b><span>${e(n('STARRED'))}</span></div><div class="nav-tiles">${tile('Speak destination', 'da_picker_speak_destination')}${tile('Type destination', 'da_picker_type_destination')}${tile('Contacts', 'da_picker_contacts')}${tile('Starred places', 'da_picker_starred_items')}</div></div>`;
    }
    if (app === 'local') {
      // Maps 6.14's Places (placesv2.xml); the categories are the ones Places offers by default, with the APK's icons.
      const cats = [['Restaurants', 'restaurants'], ['Coffee', 'cafe'], ['Bars', 'bars'], ['Hotels', 'hotels'], ['Attractions', 'attractions'], ['ATMs', 'atm'], ['Gas stations', 'gas']];
      return `<div class="app-view kkx-app loc614"><header class="loc-bar"><span class="loc-switch"><img src="assets/loc-ic_feature_local.png" alt=""><img src="assets/loc-switcher_dropdown_triangle.png" alt=""></span><i></i><b>${e(S('navigation', 'Local', t))}</b><i></i><button data-action="kkx-unavailable" aria-label="${e(t('Search'))}"><img src="assets/loc-actionbar_search.png" alt=""></button></header><div class="loc-where"><img src="assets/loc-gray_location.png" alt=""><span>Mountain View</span><img src="assets/loc-locationbar_triangle.png" alt=""></div><div class="loc-cats">${cats.map(([key, icon]) => `<button data-action="kkx-unavailable"><img src="assets/loc-places_cat_icon_${icon}.png" alt=""><span>${e(local(key, t))}</span></button>`).join('')}</div></div>`;
    }
    if (app === 'currents') {
      // Currents 2.1's home: the story pager of the selected category over the category menu (the home button slides
      // the panel aside).
      const c = key => S('currents', key, t), editions = [['Tech Daily', 'Technology', '#e53935'], ['Trail & Summit', 'Outdoors', '#43a047'], ['Weekend Kitchen', 'Food', '#fb8c00']];
      const stories = [['Tech Daily', 'Phones get thinner, batteries get smarter', 'A look at the season’s new hardware and what changed under the glass.'], ['Trail & Summit', 'Five day hikes for late summer', 'Shaded routes, quiet lakes and where to park before nine.'], ['Weekend Kitchen', 'One pan, three dinners', 'Roast once on Sunday and cook the week with what is left.']];
      const menu = `<nav class="cur-menu">${[[c('Breaking stories'), true], [c('Saved'), false]].map(([label, on]) => `<button class="cur-cat${on ? ' on' : ''}" data-action="currents-menu">${e(label)}</button>`).join('')}${editions.map(([name, , color]) => `<button class="cur-app" data-action="kkx-unavailable"><i style="background:${color}">${e(name[0])}</i>${e(name)}</button>`).join('')}<button class="cur-app cur-customize" data-action="kkx-unavailable">${e(c('Customize'))}</button></nav>`;
      return `<div class="app-view kkx-app cur21${ui.currentsMenu ? ' menu-open' : ''}">${menu}<div class="cur-panel"><header class="cur-bar"><button class="cur-home" data-action="currents-menu" aria-label="${e(c('Currents'))}"><img src="assets/currents.png" alt=""></button><b>${e(c('Breaking stories'))}</b><button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header><div class="cur-stories">${stories.map(([ed, title, body]) => `<button class="cur-tile" data-action="kkx-unavailable"><b>${e(title)}</b><small>${e(ed)}</small><span>${e(body)}</span></button>`).join('')}</div></div></div>`;
    }
    if (app === 'play-magazines') {
      const page = ui.jbxMagazines || 'read', g = key => S('magazines', key, t);
      const issues = page === 'read' ? [['Gadget Weekly', 'July 2013', '#c62828'], ['Trail & Summit', 'Summer 2013', '#2e7d32'], ['Weekend Kitchen', 'August 2013', '#ef6c00']] : [['Gadget Weekly', 'July 2013', '#c62828'], ['Gadget Weekly', 'June 2013', '#ad1457']];
      const cards = issues.map(([title, issue, color]) => `<button class="mag-card" data-action="kkx-unavailable"><span class="mag-cover" style="background:${color}"><b>${e(title)}</b></span><img class="mag-more" src="assets/mag-ic_menu_moreoverflow_card_dark_normal.png" alt=""><strong>${e(title)}</strong><small>${e(issue)}</small></button>`).join('');
      const drawer = ui.magDrawer ? `<button class="mag-scrim" data-action="mag-drawer" aria-label="${e(t('Close'))}"></button><nav class="mag-drawer">${[['read', 'Read Now'], ['library', 'My Library']].map(([id, key]) => `<button class="${id === page ? 'on' : ''}" data-action="jbx-tab" data-id="${id}">${e(g(key))}</button>`).join('')}<button data-action="play-store-open">${e(g('Shop'))}</button></nav>` : '';
      return `<div class="app-view kkx-app mag20"><header class="mag-bar"><button class="mag-home" data-action="mag-drawer" aria-label="${e(g('Google Play Magazines'))}"><img src="assets/bk28-ic_drawer_white.png" alt=""><img src="assets/mag-ic_corpora_tile_magazines.png" alt=""></button><b>${e(g(page === 'read' ? 'Read Now' : 'My Library'))}</b><button class="msg-act" data-action="kkx-unavailable" aria-label="${e(g('Search magazines'))}"><img src="assets/bk28-ic_menu_search_dark.png" alt=""></button><button class="msg-act" data-action="sa-menu" aria-label="${e(t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header><div class="mag-grid">${cards}</div>${drawer}</div>`;
    }
    if (app === 'wallet') {
      // Wallet 1.6's dashboard_activity (dashboard_button_* captions).
      const button = ([label, icon]) => `<button class="wal-btn" data-action="kkx-unavailable"><img src="assets/wal-ic_btn_dashboard_${icon}_normal.png" alt=""><span>${e(label)}</span></button>`;
      return `<div class="app-view kkx-app wal16"><header class="sa-bar"><button class="sa-up" data-action="home" aria-label="Wallet"><img src="assets/wallet.png" alt=""></button><span class="sa-title"><b>Wallet</b></span></header><div class="wal-dash"><i class="wal-space"></i><div class="wal-row">${[['Payment cards', 'payment'], ['Rewards cards', 'loyalty']].map(button).join('')}</div><i class="wal-space"></i><div class="wal-row">${[['Offers', 'offers'], ['Transactions', 'transactions']].map(button).join('')}</div><i class="wal-space wide"></i></div></div>`;
    }
    if (app === 'movie-studio') {
      const title = S('studio', 'Create new project', t);
      return `<div class="app-view kkx-app ms43"><header class="ms-bar"><img src="assets/movie-studio.png" alt=""></header><div class="ms-grid"><button class="ms-item" data-action="kkx-unavailable" aria-label="${e(title)}"><span class="ms-thumb"><img src="assets/ms-add_video_project_big.png" alt=""><b>${e(title)}</b></span></button></div></div>`;
    }
    return '';
  }
  window.JBExtraApps = {APPS, render, text: (app, key) => S(app, key, k => k)};
})();
