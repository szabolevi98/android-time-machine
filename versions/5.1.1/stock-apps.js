/* The other Google apps of the Nexus 6 factory image (LMY48Y): Maps 9.3, Drive 2.1, Keep 3.0, YouTube 10.03,
   Google+ 4.9, Earth, News & Weather, the Google app and Google Settings. Each has a simple screen: Google opens Google
   Now, Voice Search listens, Maps shows a drawn map with the floating search box, Drive lists My Drive, Keep keeps
   notes, YouTube has What to Watch and a player, Google+ a Home stream, Earth a turning globe, News & Weather its tabs,
   and Google Settings / Search settings their lists. All content is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ICON = {
    search: '<svg viewBox="0 0 24 24"><path d="M10 3a7 7 0 0 1 5.6 11.2l5.6 5.6-1.4 1.4-5.6-5.6A7 7 0 1 1 10 3zm0 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10z" fill="currentColor"/></svg>',
    overflow: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    mic: '<svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    locate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="currentColor"/><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 1v3.5M12 19.5V23M1 12h3.5M19.5 12H23" stroke="currentColor" stroke-width="1.8"/></svg>',
    directions: '<svg viewBox="0 0 24 24"><path d="M12 2 22 12 12 22 2 12zm1 7V7l-4 4v4h2v-3h2v2l3-3z" fill="currentColor"/></svg>',
    add: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M4 6h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8zm-4 5h2v2H4zm4 0h12v2H8z" fill="currentColor"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4zm3 13a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z" fill="currentColor"/></svg>',
    trash: '<svg viewBox="0 0 24 24"><path d="M9 3h6l1 2h4v2H4V5h4zM6 8h12l-1 13H7z" fill="currentColor"/></svg>',
    folder: '<svg viewBox="0 0 24 24"><path d="M3 5h7l2 2h9v12H3z" fill="currentColor"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l12.5-7.5z" fill="currentColor"/></svg>',
    like: '<svg viewBox="0 0 24 24"><path d="M2 10h4v11H2zm6 11V10l5-8 1.2.6c.6.4.9 1.1.7 1.8L14 9h6a2 2 0 0 1 2 2.3l-1.4 8A2 2 0 0 1 18.6 21z" fill="currentColor"/></svg>',
    share: '<svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3" fill="currentColor"/><circle cx="6" cy="12" r="3" fill="currentColor"/><circle cx="18" cy="19" r="3" fill="currentColor"/><path d="m6 12 12-7M6 12l12 7" stroke="currentColor" stroke-width="1.6"/></svg>',
    chevron: '<svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>'
  };
  const btn = (action, label, icon, id = '') => `<button class="sa-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}">${ICON[icon]}</button>`;
  // Action buttons with the apps' own drawables (assets/<prefix>-*.png).
  const S = (ctx, app, key) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const img = (action, label, src, cls = '') => `<button class="sa-btn${cls ? ' ' + cls : ''}" data-action="${action}" aria-label="${e(label)}"><img src="assets/${src}" alt=""></button>`;
  function bar(ctx, {title, subtitle = '', up = false, icon, actions = '', cls = ''}) {
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}">${up ? `<img class="sa-caret" src="assets/${/dark/.test(cls) ? 'lp-fw-ic_ab_back_material-dark.svg' : 'lp-fw-ic_ab_back_material.svg'}" alt="">` : ''}<img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
  }
  const thumb = (seed, label = '') => {
    const p = [['#2b5876', '#f4d06f'], ['#6d2e46', '#f6a5c0'], ['#1e5128', '#d8e9a8'], ['#22313f', '#ff8c42'], ['#4a3b8f', '#9bd1f2'], ['#7a1f1f', '#ffd166']][seed % 6];
    return `<svg class="sa-thumb" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="90" fill="${p[0]}"/><circle cx="${40 + seed * 17 % 80}" cy="38" r="22" fill="${p[1]}" opacity=".85"/><path d="M0 70 Q40 ${44 + seed % 3 * 6} 80 66 T160 60 V90 H0Z" fill="${p[1]}" opacity=".45"/>${label ? `<text x="8" y="82" font-family="Arial" font-size="11" fill="#fff">${e(label)}</text>` : ''}</svg>`;
  };
  const avatar = (name, seed) => `<span class="sa-avatar" style="background:${['#d65f4e', '#4d8fe0', '#5fae5a', '#e3a33b', '#8a63c9'][seed % 5]}">${e(name.charAt(0))}</span>`;

  // ---- Google (Google Now) and Voice Search ----
  function google(ctx) { return `<div class="app-view sa-app sa-google">${window.GELNow.render({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now, ui: ctx.ui})}</div>`; }
  // Voice Search on 5.1.1 is Google Search 4.1.29's search plate in voice mode: the white plate (search_bg) grows to
  // voice_search_plate_height (336 dp on the Nexus 6) over #eeeeee; main_text (24 dp sans-serif-light #de000000) reads
  // "Speak now" at the top left; the 90 dp RecognizerView sits 3 dp from the top and 5 dp from the right with
  // ic_mic_listening_shadow while listening and ic_mic_idle afterwards, when the text turns to "Didn't catch that. Try
  // speaking again."
  function voice(ctx) {
    const listening = ctx.ui.voiceState !== 'retry', v = key => S(ctx, 'google', key);
    return `<div class="app-view sa-app sa-voice sa-voice4"><div class="vs4-plate"><p>${e(v(listening ? 'Speak now' : "Didn't catch that. Try speaking again."))}</p><button class="vs4-mic${listening ? ' on' : ''}" data-action="voice-listen" aria-label="${e(v('Tap to speak'))}"><img src="assets/vn4-${listening ? 'ic_mic_listening_shadow' : 'ic_mic_idle'}.png" alt=""></button></div></div>`;
  }

  // Google Search settings (the overview "Settings" button) and the Google Settings app.
  // Google Search 4.1.29's settings: the header list and its pages are lp-search-prefs.js's.
  function searchSettings(ctx) {
    return window.LPSearchPrefs.render(ctx, title => bar(ctx, {title, up: true, icon: 'google-search.png'}));
  }
  // Google Settings (Google Play services 6.7.79, LMY48Y): common.Theme.GoogleSettings is AppCompat Light with a dark
  // action bar in blue grey 900 (#263238) and a teal 500 (#009688) accent. GoogleSettingsActivity builds two categories
  // (common_settings_category.xml: Body2 in the accent): Account with Google+ and Account History (the UDC flag defaults
  // on), and Services with Ads, Connected apps, Google Fit, Play Games, Data management, Search & Now and Security;
  // Location joins Services once the reporting service connects. Maps 9.3 no longer offers Maps & Latitude. Rows are
  // common_settings_item.xml: Subhead (16 sp, 87% black), 48 dp minimum, 16 dp padding.
  function googleSettings(ctx) {
    const g = key => S(ctx, 'gsettings', key);
    const cat = key => `<h4 class="gs6-cat">${e(g(key))}</h4>`;
    const row = (key, action = 'sa-unsupported', id = '') => `<button class="gs6-row" data-action="${action}" data-id="${id}">${e(g(key))}</button>`;
    // The pages GMS draws itself (gms-settings.js); Google+, Account History, Google Fit, Play Games and Data
    // management are other screens, not drawn here.
    if (String(ctx.ui.sub || '').startsWith('gms-')) return window.GMSSettings.render(ctx, g);
    return `<div class="app-view sa-app sa-gsettings6"><header class="gs6-bar"><b>${e(g('Google Settings'))}</b></header><div class="sa-scroll">${cat('Account')}${row('Google+')}${row('Account History')}${cat('Services')}${row('Ads', 'gms-open', 'ads')}${row('Connected apps', 'gms-open', 'apps')}${row('Google Fit') + row('Play Games', 'gs-play-games') + row('Data management')}${row('Search & Now', 'gel-overview-settings')}${row('Security', 'gms-open', 'security')}${row('Location', 'gms-open', 'location')}</div></div>`;
  }


  // ---- Maps: a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 9.3.0 (LMY48Y): base_main_internal.xml (v17). The search box is built in code on omnibox.9 (ic_qu_menu_grabber,
  // "Search", ic_qu_mic); the my-location button and the directions FAB (ic_qu_fab_circle in Google blue 500 #4285f4
  // with ic_qu_directions and ic_qu_fab_shadow) sit at the bottom right, the "Google" watermark at the bottom left. The
  // grabber opens layers_menu_container.xml from the left (white, the account switcher, then layers_menu_internal.xml):
  // Your places; Traffic, Public transit, Bicycling, Satellite, Terrain (48 dp, 16 sp, #33b5e5 when on); Google Earth;
  // Settings, Help and Send feedback (72 dp) between menu dividers.
  function maps(ctx) {
    // Settings (and My Places / Your places): maps-prefs.js.
    if (window.MapsPrefs?.active(ctx.ui)) return MapsPrefs.render({...ctx, account: 'nexus6.demo@gmail.com', bar: title => bar(ctx, {title, up: true, icon: 'maps.png'})});
    // Directions and navigation (maps-route.js); the route page and the drive take over the screen.
    if (ctx.ui.navRun && window.MapsRoute) return MapsRoute.nav({...ctx, mapSvg: mapSvg({...ctx, ui: {...ctx.ui, mapsQuery: ''}}).replace(/^<svg[^>]*>|<\/svg>$/g, '')});
    if (window.MapsRoute?.has(ctx.ui)) return MapsRoute.render({...ctx, mapSvg: mapSvg({...ctx, ui: {...ctx.ui, mapsQuery: ''}}).replace(/^<svg[^>]*>|<\/svg>$/g, '')});
    const q = ctx.ui.mapsQuery || '', mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const toggle = (id, key, icon) => `<button class="mp9-layer${layer === id ? ' on' : ''}" data-action="maps-layer" data-id="${id}"><img src="assets/mp9-ic_layers_${icon}.png" alt="">${e(mp(key))}</button>`;
    const panel = ctx.ui.mapsPanel ? `<button class="mp9-scrim" data-action="maps-panel" aria-label="${e(mp('Menu'))}"></button><nav class="mp9-menu"><div class="mp9-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><button class="mp9-layer mp9-places" data-action="mps-settings" data-id="places"><img src="assets/mp9-ic_layers_places.png" alt="">${e(mp('Your places'))}</button><hr><i class="mp9-gap"></i>${toggle('traffic', 'Traffic', 'traffic')}${toggle('transit', 'Public transit', 'transit')}${toggle('bicycling', 'Bicycling', 'bicycling')}${toggle('satellite', 'Satellite', 'satellite')}${toggle('terrain', 'Terrain', 'terrain')}<button class="mp9-layer" data-action="open-app" data-app="earth"><img src="assets/mp9-ic_layers_google_earth.png" alt="">${e(mp('Google Earth'))}<img class="mp9-shortcut" src="assets/mp9-ic_layers_google_earth_shortcut.png" alt=""></button><hr>${['Settings', 'Help', 'Send feedback'].map(key => `<button class="mp9-item" data-action="${key === 'Settings' ? 'mps-settings" data-id="settings' : 'sa-unsupported'}">${e(mp(key))}</button><hr>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-maps sa-maps9"><div class="mp9-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}</div><form class="mp9-search" data-form="maps-search"><button type="button" data-action="maps-panel" aria-label="${e(mp('Menu'))}"><img src="assets/mp9-ic_qu_menu_grabber.png" alt=""></button><input name="query" autocomplete="off" placeholder="${e(mp('Search'))}" aria-label="${e(mp('Search'))}" value="${e(q)}"><button type="button" data-action="sa-unsupported" aria-label="${e(mp('Search'))}"><img src="assets/mp9-ic_qu_mic.png" alt=""></button></form><img class="mp9-watermark" src="assets/mp9-watermark_dark.png" alt="Google"><button class="mp9-locate" data-action="maps-locate" aria-label="${e(mp('Move to your location'))}"><img src="assets/mp9-ic_qu_direction_mylocation.png" alt=""></button><button class="mp9-fab" data-action="mr-open" data-id="${e(q)}" aria-label="${e(mp('Directions'))}"><img class="mp9-shadow" src="assets/mp9-ic_qu_fab_shadow.png" alt=""><i></i><img class="mp9-dir" src="assets/mp9-ic_qu_directions.png" alt=""></button>${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small></div>` : ''}${panel}</div>`;
  }


  // ---- Drive: My Drive ----
  // Drive's files; data.driveFiles holds them once an app has created, renamed or removed one.
  const FILES0 = [
    {id: 'f0', name: 'Photos', kind: 'folder', date: 'Oct 28', age: 9}, {id: 'f1', name: 'Trip plan 2015', kind: 'doc', date: 'Nov 2', age: 0, text: 'Day 1 — arrive in Lisbon, tram 28 to Alfama.\nDay 2 — Belém, pastéis de nata.\nDay 3 — Sintra by train.'},
    {id: 'f2', name: 'Budget', kind: 'sheet', date: 'Oct 30', age: 1, text: 'Rent 850\nGroceries 240\nTransport 60\nFun 120'}, {id: 'f3', name: 'Nexus 6 guide', kind: 'pdf', date: 'Oct 31', age: 3, text: 'Welcome to Nexus 5. Swipe left from the Home screen to see Google Now.'},
    {id: 'f4', name: 'Meetup slides', kind: 'slides', date: 'Sep 12', age: 60, text: 'What’s new in Lollipop\n• Material design\n• Heads-up notifications\n• Smart Lock\n• Overview'}
  ];
  const kindColor = {folder: '#8f8f8f', doc: '#4285f4', sheet: '#0f9d58', pdf: '#db4437', slides: '#f4b400'};
  // Drive 2.1.495 (LMY48Y): CakemixTheme's ActionBar on action_bar_background (#e0e0e0 over a 1 dp #bdbdbd line, #4c4c4c
  // text) with the navigation toggle. menu_doclist_activity.xml under AppCompat's three slots: Search and View as Grid
  // (ifRoom|collapse) take the two free slots; Create, Refresh, Filter by and Sort by go to the overflow. Files are
  // doc_entry_row_onecolumn.xml rows (72 dp, the 40 dp ic_type_* icon 16 dp in, the title and "Modified: …" 72 dp in)
  // under Drive's time range titles (doc_entry_group_title_onecolumn.xml on #eeeeee, 24 dp in). The navigation panel lists
  // the jx enum's entries (My Drive, Shared with me, Starred, Recent, On device, Uploads) and the storage footer.
  function drive(ctx) {
    const d = key => S(ctx, 'drive', key), K = window.LPDrive;
    if (ctx.ui.sub === 'file') {
      const FILES = K ? K.files(ctx.data) : FILES0, file = FILES.find(f => f.id === ctx.ui.driveFile) || FILES[1];
      // The opened item: Send file and the held item's menu in its overflow (lp-drive.js).
      return `<div class="app-view sa-app sa-drive">${bar(ctx, {title: file.name, up: true, icon: 'drive.png', actions: btn('drv-send', d('Send file'), 'share', file.id) + btn('drv-file-menu', ctx.t('More options'), 'overflow', file.id)})}<div class="sa-scroll sa-doc"><div class="sa-page">${e(file.text || '').split('\n').map(line => `<p>${line}</p>`).join('')}</div></div>${K ? K.dialog(ctx) : ''}</div>`;
    }
    const searching = ctx.ui.sub === 'search', results = ctx.ui.sub === 'results';
    const parts = K ? K.list(ctx) : {title: d('My Drive'), rows: '', empty: true, extra: ''};
    const active = ctx.ui.driveNavItem || 'my';
    const panel = ctx.ui.driveNav ? `<button class="dr2-scrim" data-action="drive-nav" aria-label="${e(ctx.t('Close'))}"></button><nav class="dr2-nav"><div class="dr2-account">nexus6.demo@gmail.com</div>${(K ? K.NAV : []).map(([key, ic, id]) => `<button class="${id === active && !ctx.ui.driveFilter ? 'on' : ''}" data-action="drv-nav" data-id="${id}"><img src="assets/dr2-ic_drive_${ic}.png" alt="">${e(d(key))}</button>`).join('')}<div class="dr2-storage"><img src="assets/dr2-ic_storage_usage.png" alt=""><span><b>0.4 GB / 15 GB</b><small>3%</small></span></div></nav>` : '';
    const spinner = ctx.ui.driveRefreshing ? `<i class="drv2-spinner" role="progressbar" aria-label="${e(d('Refresh'))}"></i>` : '';
    return `<div class="app-view sa-app sa-drive sa-drive21"><header class="dr2-bar">${searching ? `<button class="dr2-back" data-action="back" aria-label="${e(d('Cancel search'))}"><img src="assets/dr2-ic_back_arrow_alpha.png" alt=""></button><form class="dr2-sv" data-form="drive-search"><input name="query" placeholder="${e(d('Search'))}" aria-label="${e(d('Search'))}" autocomplete="off" spellcheck="false" enterkeyhint="search"></form>` : `${results ? `<button class="dr2-back" data-action="back" aria-label="${e(ctx.t('Back'))}"><img src="assets/dr2-ic_back_arrow_alpha.png" alt=""></button>` : `<button class="dr2-toggle" data-action="drive-nav" aria-label="${e(d('Open navigation drawer'))}"><i></i><i></i><i></i></button>`}<b>${e(parts.title)}</b>${spinner}${results ? img('drive-search-clear', d('Clear search'), 'dr2-ic_menu_clear_alpha.png') : img('drive-search-open', d('Search'), 'dr2-ic_menu_search_alpha.png')}${img('sa-unsupported', d('View as Grid'), 'dr2-ic_grid_toggle.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/dr2-action_bar_overflow_white.png" alt=""></button>`}</header><div class="sa-scroll dr2-list">${searching ? '' : parts.empty ? `<p class="sa-empty">${e(d('No Items'))}</p>` : parts.rows}</div>${panel}${searching ? '' : parts.extra}</div>`;
  }



  // ---- Keep: the quick note bar and coloured cards; notes are kept in data.keepNotes ----
  const KEEP_COLORS = ['#fff', '#f7f0a3', '#c6e5f5', '#c9f0b9', '#f8c8c0'];
  // Keep 3.0.03 (LMY48Y). KeepAppTheme: colorPrimary #ffcc3f, colorPrimaryDark #e59900, window #e6e6e6. The browse
  // Toolbar has the drawer toggle and Search (always; ic_material_search_light), the overflow holds the column switch and
  // Refresh. quick_edit.xml is a floating toolbar right under the bar ("Add quick note", then add_items_bar.xml's New
  // note / New list / New recording / New photo note); notes are browse_index_text_note.xml on note_shadow. DrawerFragment
  // (dex): Notes, Reminders, Archive and Trash (56 dp, black icons, 14 sp #de000000 32 dp after them), then the
  // Help & feedback link (44 dp, bold). editor_menu.xml: Share, Change color, Add picture and Archive are "always", Delete
  // note and the rest go to the overflow.
  /* List and picture notes (Keep 3.0.03). A list note keeps .list = [{text, checked}], a picture note .photo = the id of
     a Gallery photo. Browse cards (browse_index_list_note.xml): the photo across the top, then up to six unchecked-first
     index_list_text_item.xml rows (20 dp ic_material_box_*_dark, 16 sp #99000000, #4d000000 and struck through when
     checked) and "…". The editor: editor_photo_layout.xml (ic_delete_photo, "Delete image?"), list_text_note.xml rows
     (the drag handle, the AppCompat check box in the #333333 accent, the 16 sp text, ic_material_delete_dark while
     editing), editor_add_list_item.xml's ic_add_item "List item" row, then editor_graveyard_header.xml: a divider, the
     chevron and "Checked", over the checked items (GraveyardHeaderView starts expanded; the chevron collapses them).
     Add picture and "New photo note" offer Take photo / Choose image; Show / Hide checkboxes converts the note. */
  const KEEP_INDEX_MAX = 6;
  const keepPhoto = (ctx, id) => { const p = (ctx.data.photos || []).find(x => x.id === id); return p && window.ICSMedia ? window.ICSMedia.image(p) : ''; };
  const keepOrder = list => true ? [...list.filter(i => !i.checked), ...list.filter(i => i.checked)] : list;
  function keepCard(ctx, n) {
    const photo = n.photo ? keepPhoto(ctx, n.photo) : '', items = n.list ? keepOrder(n.list).filter(i => i.text.trim()) : [];
    const rows = items.slice(0, KEEP_INDEX_MAX).map(i => `<span class="kp-li${i.checked ? ' on' : ''}"><img src="assets/${i.checked ? 'kp3-ic_material_box_checked_dark.png' : 'kp3-ic_material_box_unchecked_dark.png'}" alt=""><span>${e(i.text)}</span></span>`).join('') + (items.length > KEEP_INDEX_MAX ? '<span class="kp-ellipse">…</span>' : '');
    return `<button class="sa-note${photo ? ' kp-with-photo' : ''}" data-no-translate data-action="keep-open" data-id="${e(n.id)}" style="--note:${KEEP_COLORS[n.color || 0]}">${photo ? `<img class="kp-photo" src="${e(photo)}" alt="">` : ''}${window.KeepMore?.badge(ctx,n)||''}${n.list ? rows : n.text ? `<span class="kp-text">${e(n.text)}</span>` : ''}</button>`;
  }
  function keepEditor(ctx, note, k) {
    const photo = note.photo ? keepPhoto(ctx, note.photo) : '';
    const pic = photo ? `<div class="kp-ed-photo"><img src="${e(photo)}" alt=""><button type="button" class="kp-ed-photo-del" data-action="keep-photo-remove" aria-label="${e(k('Remove photo?'))}"><img src="assets/kp3-ic_delete_photo.png" alt=""></button></div>` : '';
    if (!note.list) return `${pic}${window.KeepMore?.audio(ctx,note)||''}<textarea class="keep-text" maxlength="2000" aria-label="${e(k('New note'))}">${e(note.text)}</textarea>`;
    const row = i => { const item = note.list[i]; return `<div class="kp-ed-li${item.checked ? ' on' : ''}"><img class="kp-ed-grab" src="assets/kp3-ic_material_drag_handle_dark.png" alt=""><button type="button" class="kp-ed-check" data-action="keep-li-check" data-id="${i}" role="checkbox" aria-checked="${!!item.checked}" aria-label="${e(item.text)}"></button><input class="kp-ed-text" data-keep-li="${i}" value="${e(item.text)}" maxlength="1000" autocomplete="off" aria-label="${e(k('List item'))}"><button type="button" class="kp-ed-del" data-action="keep-li-delete" data-id="${i}" aria-label="${e(k('Delete'))}"><img src="assets/kp3-ic_material_delete_dark.png" alt=""></button></div>`; };
    const add = `<form class="kp-ed-add" data-form="keep-li-add"><img class="kp-ed-check" src="assets/kp3-ic_add_item.png" alt=""><input name="text" maxlength="1000" autocomplete="off" placeholder="${e(k('List item'))}" aria-label="${e(k('List item'))}"></form>`;
    const index = note.list.map((_, i) => i);
    const open = index.filter(i => !note.list[i].checked), done = index.filter(i => note.list[i].checked), closed = !!ctx.ui.keepGraveClosed;
    const grave = done.length ? `<div class="kp-grave"><i></i><button type="button" class="kp-grave-head" data-action="keep-grave" aria-label="${e(k(closed ? 'Expand Checked Items' : 'Collapse Checked Items'))}"><img src="assets/kp3-ic_material_chevron_${closed ? 'down' : 'up'}_dark.png" alt=""><span>${e(k('Checked'))}</span></button></div>${closed ? '' : done.map(row).join('')}` : '';
    return `${pic}${window.KeepMore?.audio(ctx,note)||''}<div class="kp-ed-list" data-no-translate>${open.map(row).join('')}${add}${grave}</div>`;
  }
  function keepDialog(ctx, k) {
    const kind = ctx.ui.keepDialog;
    if (!kind) return '';
    const buttons = list => `<div class="kp-dlg-buttons">${list.map(([action, label]) => `<button type="button" data-action="${action}">${e(label)}</button>`).join('')}</div>`;
    const body = kind === 'picture' ? `<h3>${e(k('Add picture'))}</h3>${[['keep-photo-take', 'Take photo', 'kp3-ic_material_camera_dark.png'], ['keep-photo-choose', 'Choose photo', 'kp3-ic_material_image_dark.png']].map(([action, key, icon]) => `<button type="button" class="kp-dlg-item" data-action="${action}"><img src="assets/${icon}" alt="">${e(k(key))}</button>`).join('')}`
      : kind === 'remove-photo' ? `<p>${e(k('Remove photo?'))}</p>${buttons([['keep-dialog-close', k('Cancel')], ['keep-photo-delete', k('Delete')]])}`
      : `<h3>${e(k('Delete checked items?'))}</h3>${buttons([['keep-hide-keep', k('Keep (button)')], ['keep-hide-delete', k('Delete (button)')]])}`;
    return `<button type="button" class="kp-dlg-scrim" data-action="keep-dialog-close" aria-label="${e(ctx.t('Close'))}"></button><div class="kp-dlg" role="dialog">${body}</div>`;
  }
  function keep(ctx) {
    if(ctx.ui.kpScreen==='record')return voice(ctx).replace(/voice-listen/g,'kp-record-done');
    if(ctx.ui.kpScreen)return window.KeepMore.screen(ctx);
    const notes = ctx.data.keepNotes || [], k = key => S(ctx, 'keep', key), view = ctx.ui.keepView || 'notes';
    const bar3 = (title, actions, up) => `<header class="kp3-bar">${up ? `<button class="kp3-up" data-action="back" aria-label="${e(ctx.t('Back'))}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11H7.8l5.6-5.6L12 4l-8 8 8 8 1.4-1.4L7.8 13H20z" fill="#fff"/></svg></button>` : `<button class="kp3-toggle" data-action="keep-drawer" aria-label="${e(k('Open navigation drawer'))}"><i></i><i></i><i></i></button>`}<b>${e(title)}</b>${actions}</header>`;
    const more = `<button class="sa-btn kp3-more" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><i></i><i></i><i></i></button>`;
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep sa-keep3">${bar3('', img('sa-unsupported', k('Share'), 'kp3-ic_material_sharing_addperson_light.png') + img('keep-color', k('Change color'), 'kp3-ic_material_color_light.png') + img('keep-picture', k('Add picture'), 'kp3-ic_material_camera_light.png') + img('keep-archive', k(note.archived ? 'Unarchive' : 'Archive'), note.archived ? 'kp3-ic_material_unarchive_light.png' : 'kp3-ic_material_archive_light.png') + more, true)}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}">${keepEditor(ctx, note, k)}</div>${keepDialog(ctx, k)}</div>`;
    }
    if (ctx.ui.sub === 'search') {
      // Search (audit step 5): search_filter_view.xml, then the matching notes or "No matching notes".
      const q = String(ctx.ui.keepQuery || ''), found = q.trim() ? notes.filter(n => [n.text, ...(n.list || []).map(i => i.text)].join('\n').toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())) : [];
      const filter = (icon, key) => `<button class="kp3-filter" data-action="sa-unsupported" aria-label="${e(k(key))}"><img src="assets/kp3-ic_material_${icon}_dark.png" alt=""></button>`;
      const bar = `<div class="kp3-search"><div class="kp3-search-row"><button class="kp3-search-back" data-action="back" aria-label="${e(k('Navigate up'))}"><img src="assets/kp3-ic_material_arrow_left_dark.png" alt=""></button><input data-keep-search value="${e(q)}" placeholder="${e(k('Search notes'))}" aria-label="${e(k('Search notes'))}" autocomplete="off" spellcheck="false">${q ? `<button class="kp3-search-clear" data-action="keep-search-clear" aria-label="${e(k('Clear query'))}"><img src="assets/kp3-ic_cancel_dark.png" alt=""></button>` : ''}</div><div class="kp3-filters">${filter('list', 'Filter by lists')}${filter('mic', 'Filter by notes with audio')}${filter('camera', 'Filter by notes with images')}${filter('reminder_finger', 'Filter by notes with reminders')}${filter('sharing_person', 'Filter by shared notes')}${filter('color', 'Filter by note color')}</div></div>`;
      return `<div class="app-view sa-app sa-keep sa-keep3 kp3-searching">${bar}<div class="sa-scroll"><div class="sa-notes${ctx.data.keepSingle ? ' single' : ''}">${found.map(n => keepCard(ctx, n)).join('')}</div>${q.trim() && !found.length ? `<p class="kp3-nomatch">${e(k('No matching notes'))}</p>` : ''}</div></div>`;
    }
    const shown = view === 'reminders' || view === 'trash' ? [] : notes.filter(n => !!n.archived === (view === 'archive')), single = ctx.data.keepSingle;
    const add = (action, key, src) => `<button type="button" class="kp3-new" data-action="${action}" aria-label="${e(k(key))}"><img src="assets/kp3-${src}.png" alt=""></button>`;
    const quick = view === 'notes' ? `<form class="kp3-quick" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(k('Add quick note'))}" aria-label="${e(k('Add quick note'))}"><i></i><div class="kp3-items">${add('keep-new', 'New note', 'ic_material_note_dark')}${add('keep-new-list', 'New list', 'ic_material_list_dark')}${add('kp-record', 'New recording', 'ic_material_mic_dark')}${add('keep-picture', 'New photo note', 'ic_material_camera_dark')}</div></form>` : '';
    const items = [['notes', 'Notes', 'lightbulb'], ['reminders', 'Reminders', 'reminder_finger'], ['archive', 'Archive', 'archive'], ['trash', 'Trash', 'trash']];
    const title = view === 'notes' ? k('Keep') : k(items.find(([id]) => id === view)[1]);
    const empty = {notes: 'Add quick note', reminders: 'Notes with upcoming reminders appear here', archive: 'Your archived notes appear here', trash: 'No notes in Trash'}[view];
    const drawer = ctx.ui.keepDrawer ? `<button class="kp3-scrim" data-action="keep-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="kp3-drawer"><div class="kp3-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${items.map(([id, key, icon]) => `<button class="${view === id ? 'on' : ''}" data-action="keep-landing" data-id="${id}"><img src="assets/kp3-ic_material_${icon}_black.png" alt="">${e(k(key))}</button>`).join('')}<button class="kp3-help" data-action="sa-unsupported"><img src="assets/kp3-ic_material_feedback_black.png" alt="">${e(k('Help & feedback'))}</button></nav>` : '';
    return `<div class="app-view sa-app sa-keep sa-keep3">${bar3(title, img('keep-search-open', k('Search'), 'kp3-ic_material_search_light.png') + more)}<div class="sa-scroll">${quick}<div class="sa-notes${single ? ' single' : ''}">${shown.map(n => keepCard(ctx, n)).join('') || (view === 'notes' ? '' : `<p class="kp3-empty">${e(k(empty))}</p>`)}</div></div>${drawer}${keepDialog(ctx, k)}</div>`;
  }


  // ---- YouTube: What to Watch and a player ----
  const VIDEOS = [
    {id: 'v1', title: 'Nexus 6 — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42', likes: 9120},
    {id: 'v2', title: 'Lollipop: 10 tips for Android 5.1', channel: 'Droid Corner', views: '486,020', len: '6:15', likes: 4310},
    {id: 'v3', title: 'Timelapse: one day in the city', channel: 'Slow Motion Club', views: '92,437', len: '3:01', likes: 1876},
    {id: 'v4', title: 'How to make dessert-themed cupcakes', channel: 'Kitchen Science', views: '311,908', len: '11:20', likes: 2650}
  ];
  // YouTube 10.03.5 (LMY48Y). Theme.YouTube.Home: the Toolbar in theme_main_color_primary #e62117 (status bar #c31c13)
  // with the white title and the guide toggle, the window #fefefe; menu.xml: Search (always), Settings and Help & feedback
  // in the overflow (Play on only with cast devices). The guide is white (guide_entry.xml: 48 dp, 24 dp icons 16 dp in,
  // 14 sp titles 72 dp in; guide_section.xml: 14 sp #999 over a #dddddd line). Home and My Subscriptions come from the
  // server (their labels are not in the APK); the local entries follow the bhx enum (Watch later, Favorites, Uploads,
  // History), then Offline. q_video_feed_entry.xml: 16 dp sides, the 16:9 thumbnail with the duration, the 16 sp #333
  // title, 14 sp #999 details and the menu anchor, a 1 dp #e1e1e1 separator. The watch page keeps the player, the info
  // card with likes and the suggestions.
  // Search (audit step 5): see the header of the version's YouTube; the simulator matches titles and channels.
  function ytSearch(ctx, y) {
    const q = String(ctx.ui.ytQuery || ''), found = VIDEOS.filter(v => (v.title + ' ' + v.channel).toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()));
    const field = `<form class="yt-sv" data-form="yt-search"><input name="query" value="${e(q)}" placeholder="${e(y('Search YouTube'))}" aria-label="${e(y('Search YouTube'))}" autocomplete="off" spellcheck="false" enterkeyhint="search">${q ? `<button type="button" class="yt-sv-clear" data-action="yt-search-clear" aria-label="${e(y('Clear query'))}"></button>` : ''}</form>`;
    const clear = `<button type="button" class="yt-sv-clear" data-action="yt-search-clear" aria-label="${e(y('Clear'))}"></button>`;
    const head = `<header class="yt10-bar yt10-search"><button class="yt10-back" data-action="back" aria-label="${e(ctx.t('Back'))}"></button>${ctx.ui.sub === 'search' ? field : `<button class="yt10-query" data-action="yt-search-open" data-id="keep">${e(q)}</button>${clear}`}</header>`;
    if (ctx.ui.sub === 'search') return `<div class="app-view sa-app sa-youtube sa-yt10 yt-searching">${head}<div class="sa-scroll yt10-feed"></div></div>`;
    return `<div class="app-view sa-app sa-youtube sa-yt10">${head}<div class="sa-scroll yt10-feed">${found.map(v => `<button class="yt10-compact" data-action="yt-video" data-id="${v.id}"><span class="yt10-cthumb">${thumb(VIDEOS.indexOf(v))}<em>${e(v.len)}</em></span><span class="yt10-ccopy"><b>${e(v.title)}</b><small>${e(v.channel)}</small><small>${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</small></span></button>`).join('') || `<p class="sa-empty">${e(y('No videos found'))}</p>`}</div></div>`;
  }
  function youtube(ctx) {
    const y = key => S(ctx, 'youtube', key);
    if (ctx.ui.sub === 'settings') return LPYouTube.settings(ctx);
    if (ctx.ui.sub === 'search' || ctx.ui.sub === 'results') return ytSearch(ctx, y);
    if (ctx.ui.sub === 'video') {
      const v = VIDEOS.find(item => item.id === ctx.ui.ytVideo) || VIDEOS[0], i = VIDEOS.indexOf(v), liked = (ctx.data.ytLikes || []).includes(v.id);
      const rows = VIDEOS.filter(item => item !== v).slice(0, 3);
      return `<div class="app-view sa-app sa-youtube sa-yt10 sa-yt-watch"><div class="sa-yt-player${ctx.ui.ytPaused ? '' : ' playing'}" data-action="yt-toggle">${thumb(i)}<span class="sa-yt-state">${ctx.ui.ytPaused ? ICON.play : ''}</span><i class="sa-yt-progress"></i></div><div class="sa-scroll"><section class="yt10-info"><h3>${e(v.title)}</h3><p>${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</p><div class="yt10-likes"><button class="${liked ? 'on' : ''}" data-action="yt-like" data-id="${v.id}"><img src="assets/yt10-ic_like.png" alt="">${(v.likes + (liked ? 1 : 0)).toLocaleString(ctx.locale)}</button><button data-action="sa-unsupported"><img src="assets/yt10-ic_dislike.png" alt="">${Math.round(v.likes / 40).toLocaleString(ctx.locale)}</button></div></section>${rows.map(r => `<button class="yt10-row" data-action="yt-video" data-id="${r.id}"><span class="yt10-thumb">${thumb(VIDEOS.indexOf(r))}<em>${e(r.len)}</em></span><span class="yt10-meta"><b>${e(r.title)}</b><small>${e(r.channel)}</small><small>${e(AndroidStrings.format(ctx.t('%s views'), r.views))}</small></span></button>`).join('')}</div></div>`;
    }
    const entry = (label, icon, action = 'sa-unsupported', on = false) => `<button class="yt10-entry${on ? ' on' : ''}" data-action="${action}"><img src="assets/yt10-ic_drawer_${icon}.png" alt=""><span>${e(label)}</span></button>`;
    const guide = ctx.ui.ytGuide ? `<button class="yt10-scrim" data-action="yt-guide" aria-label="${e(ctx.t('Close'))}"></button><nav class="yt10-guide"><div class="yt10-account"><img src="assets/yt10-missing_avatar.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${entry(ctx.t('What to Watch'), 'what_to_watch', 'yt-guide', true)}${entry(ctx.t('My Subscriptions'), 'subscriptions')}<hr>${entry(y('Watch later'), 'watch_later')}${entry(y('Favorites'), 'favorites')}${entry(y('Uploads'), 'uploads')}${entry(y('History'), 'watch_history')}${entry(y('Offline'), 'offline')}</nav>` : '';
    return `<div class="app-view sa-app sa-youtube sa-yt10"><header class="yt10-bar"><button class="yt10-toggle" data-action="yt-guide" aria-label="${e(y('Open guide'))}"><i></i><i></i><i></i></button><b>${e(ctx.t('What to Watch'))}</b>${img('yt-search-open', y('Search'), 'yt10-ic_menu_search.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/yt10-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button></header><div class="sa-scroll yt10-feed">${VIDEOS.map((v, i) => `<button class="yt10-item" data-action="yt-video" data-id="${v.id}"><span class="yt10-thumb">${thumb(i)}<em>${e(v.len)}</em></span><span class="yt10-copy"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</small><img src="assets/yt10-contextual_menu_anchor_normal.png" alt=""></span></button>`).join('')}</div>${guide}</div>`;
  }


  // ---- Google+: the Home stream ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'Finally got the Nexus 6. That screen is huge — and the camera is great!', photo: 1, plus: 12},
    {id: 'p2', name: 'Android', time: '5h', text: 'Android 5.1, Lollipop: Material design, heads-up notifications and more.', photo: 4, plus: 2381},
    {id: 'p3', name: 'Taylor Lee', time: 'Yesterday', text: 'Slides from the meetup are up on Drive. Thanks everyone for coming!', photo: null, plus: 7}
  ];
  // Google+ 4.9 (LMY48Y): home_activity.xml's Toolbar in quantum googred 500 (#db4437; status bar 700 #c53929) with the
  // drawer toggle, "Home" (stream_circles), the notifications button (quantum_ic_notifications_none_white_24) and the
  // overflow (Refresh, Feedback, Settings, Help, Sign out); stream.xml's cards and newposts_and_fab_row.xml's 56 dp compose
  // FAB (quantum_ic_create_white_24). The drawer's entries are registered by separate modules with their own order, which
  // the image does not pin down, so the toggle is not simulated.
  function gplus(ctx) {
    const plused = ctx.data.gplusPlus || [], g = key => S(ctx, 'gplus', key);
    // New post (sharekit) and Settings (settings_headers.xml) are plus-post.js's.
    const pp = window.PlusPost?.render({...ctx.plusCtx, bar: ({title, up, action}) => bar(ctx, {title, up: true, icon: 'google-plus.png', actions: action || ''})});
    if (pp) return pp;
    return `<div class="app-view sa-app sa-gplus sa-gplus49"><header class="gp49-bar"><button class="gp49-toggle" data-action="sa-unsupported" aria-label="Menu"><i></i><i></i><i></i></button><b>${e(g('Home'))}</b>${img('sa-unsupported', 'Notifications', 'gp49-quantum_ic_notifications_none_white_24.png')}${btn('sa-menu', ctx.t('More options'), 'overflow')}</header><div class="sa-scroll sa-stream">${[...window.PlusPost.posts(ctx.plusCtx), ...POSTS].map((p, i) => `<article class="sa-post">${avatar(p.name, i)}<div class="sa-post-head"><b>${e(p.name)}</b><small>${e(ctx.t(p.time))}</small></div><p>${e(p.text)}</p>${window.PlusPost.place(ctx.plusCtx, p)}${p.photo !== null ? `<div class="sa-post-photo">${thumb(p.photo)}</div>` : ''}<footer><button class="sa-plus${plused.includes(p.id) ? ' on' : ''}" data-action="gplus-plus" data-id="${p.id}">+1 <span>${p.plus + (plused.includes(p.id) ? 1 : 0)}</span></button><button data-action="sa-unsupported">${ICON.share}</button>${window.PlusPost.del(ctx.plusCtx, p)}</footer></article>`).join('')}</div><button class="gp49-fab" data-action="gpp-new" aria-label="${e(ctx.t('Share'))}"><img src="assets/gp49-quantum_ic_create_white_24.png" alt=""></button>${window.PlusPost.overlay(ctx.plusCtx)}</div>`;
  }


  // ---- Earth: the globe in space under a translucent search bar ----
  // Earth 8.0.1 (LMY48Y): common.xml puts an AppCompat Toolbar on actionbar_gradient (#cc000000 fading to transparent)
  // over the globe, with the drawer toggle and the app name. menu/main.xml: Search (always, Earth's SearchView with
  // "Example: Pizza"), Clear map (ifRoom|withText, only once there is something to clear), My location and Share
  // (ifRoom); with AppCompat's three slots at 411 dp all three visible items fit, and after a search Clear map takes the
  // free slot and My location / Share move to the overflow. The compass (button_compass, ic_compass) sits under the bar
  // on the right, Pegman 4 dp from the left below it. main.xml's drawer (300 dp, white): the account switcher (147 dp; the cover photo comes from the account, so only the black
  // scrim and avatar_placeholder are drawn), then fm's adapters,
  // Maps Gallery and Google+ Photos, Layers, then Settings, Feedback, Help and Tutorial.
  function earth(ctx) {
    if (window.EarthApp.active(ctx.ui)) return window.EarthApp.render({...ctx.earthCtx, bar: title => bar(ctx, {title, up: true, icon: 'earth.png', cls: ''})});
    const ea = key => S(ctx, 'earth', key), q = ctx.ui.earthQuery;
    const search = ctx.ui.earthSearching ? `<form class="ea8-field" data-form="earth-search"><input name="query" autocomplete="off" placeholder="${e(ea('Example: Pizza'))}" aria-label="${e(ea('Search'))}"></form>` : img('earth-search-open', ea('Search'), 'ea8-ic_menu_search.png');
    const actions = q ? img('earth-clear', ea('Clear map'), 'ea8-ic_menu_clear_map.png', 'wide') + btn('sa-menu', ctx.t('More options'), 'overflow') : img('earth-myloc', ea('My location'), 'ea8-ic_menu_mylocation.png') + img('earth-share', ea('Share'), 'ea8-ic_share_alt_white_24dp.png');
    const drawer = ctx.ui.earthDrawer ? `<button class="ea8-scrim" data-action="earth-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="ea8-drawer"><div class="ea8-account"><img src="assets/ea8-avatar_placeholder.png" alt=""><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${[['Maps Gallery'], ['Google+ Photos'], ['Layers', 'earth-layers']].map(([key, action = 'sa-unsupported']) => `<button data-action="${action}">${e(ea(key))}</button>`).join('')}<hr>${[['Settings', 'earth-settings'], ['Feedback'], ['Help'], ['Tutorial']].map(([key, action = 'sa-unsupported']) => `<button data-action="${action}">${e(ea(key))}</button>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-earth sa-earth8"><div class="sa-stars"></div>${window.EarthApp.canvas()}<header class="ea8-bar"><button class="ea8-toggle" data-action="earth-drawer" aria-label="${e(ea('Layers'))}"><i></i><i></i><i></i></button><b>${ctx.ui.earthSearching ? '' : e(q || ea('Earth'))}</b>${search}${actions}</header><button class="ea8-compass" data-action="earth-north" aria-label="${e(ea('Reset to north'))}"><img src="assets/ea8-button_compass.png" alt=""><img src="assets/ea8-ic_compass.png" alt=""></button><img class="ea8-pegman" src="assets/ea8-pegman.png" alt="${e(ea('Street View'))}">${drawer}${window.EarthApp.overlay(ctx.earthCtx)}</div>`;
  }


  // ---- News & Weather (Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 5.1.1 security update rolls out to Nexus devices', 'Tech Daily', '2 hours ago', 'https://tech-daily.example/nexus-security-update'], ['City marathon draws record crowd', 'Metro News', '4 hours ago', 'https://metro-news.example/city-marathon'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago', 'https://science-today.example/ocean-floor']],
    'Technology': [['Material design comes to more of your apps', 'Gadget Weekly', '1 hour ago', 'https://gadget-weekly.example/material-apps'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago', 'https://droid-corner.example/smart-watches']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago', 'https://sports-desk.example/cup-final']]
  };
  const newsRows=(data,id)=>window.NewsSections?NewsSections.rows(data,STORIES,id):(id==='Headlines'?STORIES['Top Stories']:STORIES[id])||[];
  const newsArticle=(data,key)=>{const [id,index]=String(key).split(':'),row=newsRows(data,id)[Number(index)];return row&&{title:row[0],source:row[1],time:row[2],url:row[3]};};
  // Open in browser: the browser's offline page for a stored article URL (the address arrives without its scheme).
  const newsPage=url=>{const row=Object.values(STORIES).flat().find(r=>r[3].replace(/^https?:\/\//,'')===url);return row?`<article class="web-offline-article"><h2>${e(row[0])}</h2><time>${e(row[1])} · Demo archive</time></article>`:'';};
  // News & Weather 2.2 (LMY48Y). AppThemeLight: the Toolbar takes colorPrimary = the window background #f5f5f5 with
  // 4 dp elevation, status bar #9e9e9e, accent #3367d6, text #de000000 / #8d000000. news_activity.xml's menu: Search and
  // Add section (ifRoom) beside the overflow (Refresh, Edit weather display, Change editions, Manage sections, Switch to
  // dark theme). Each section is a card (card_background_*_light): item_section_header.xml (24 sp secondary, the
  // ic_more_horiz button) over item_story_collapsed.xml rows (80 dp photo, 16 sp title, 14 sp source) and the "More stories
  // from …" footer. Headlines starts with item_weather.xml: the condition picture (loaded from the web, so a stand-in),
  // the temperature, and the Temp. / Precip. / Wind / Humidity tabs. The drawer (300 dp) lists the sections, then "Add
  // and remove sections…" and "Help & feedback".
  // The app's own settings: featured weather (hide / auto-detect / another location), temperature units (C° / F°),
  // wind speed units (mph / km/h / m/s) and the theme (menu_switch_theme_dark / _light).
  const NEWS2 = {weather: 'auto', place: '', unit: 'C', wind: 'kmh', dark: false};
  const news2 = data => ({...NEWS2, ...(data.news2 || {})});
  const WIND = {mph: [v => Math.round(v / 1.609), 'mph'], kmh: [v => v, 'km/h'], ms: [v => Math.round(v / 3.6), 'm/s']};
  // A story's text: the title, then a line for the offline copy (the stories are the simulator's own).
  const snippet = (title, source) => `${title}. ${source} reports the story; the full article opens below.`;
  // The dialogs of menu/weather.xml and news_activity.xml (dialog_content_default_location / _temperature / _wind_speed).
  function newsDialog(ctx, n, o) {
    const kind = ctx.ui.newsDialog;
    if (!kind) return '';
    const radio = (value, label, on) => `<button class="nw2-radio${on ? ' on' : ''}" data-action="news2-pick" data-id="${value}"><i></i><span>${e(label)}</span></button>`;
    const pick = ctx.ui.newsPick ?? (kind === 'weather' ? o.weather : kind === 'unit' ? o.unit : o.wind);
    const [title, body] = kind === 'weather' ? [n('Featured weather'), radio('hide', n('Hide'), pick === 'hide') + radio('auto', n('Auto-detect my location'), pick === 'auto') + radio('custom', n('Use another location'), pick === 'custom') + `<input class="nw2-place" data-news2-place placeholder="${e(n('Choose a location…'))}" value="${e(o.place)}"${pick === 'custom' ? '' : ' disabled'}>`]
      : kind === 'unit' ? [n('Temperature units'), radio('C', n('C°'), pick === 'C') + radio('F', n('F°'), pick === 'F')]
      : [n('Wind speed units'), radio('mph', n('mph'), pick === 'mph') + radio('kmh', n('km/h'), pick === 'kmh') + radio('ms', n('m/s'), pick === 'ms')];
    return `<button class="nw2-dialog-scrim" data-action="news2-cancel" aria-label="${e(ctx.t('Cancel'))}"></button><div class="nw2-dialog" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3>${body}<div class="nw2-dialog-buttons"><button data-action="news2-cancel">${e(ctx.t('Cancel'))}</button><button data-action="news2-ok">${e(ctx.t('OK'))}</button></div></div>`;
  }
  // WebContentActivity (web_content_activity.xml): the article in a WebView under the toolbar with menu/web_content_activity.xml.
  function newsWeb(ctx, n) {
    const [sec, j] = String(ctx.ui.newsWeb).split(':'), story = newsRows(ctx.data,sec)[Number(j)];
    if (!story) return '';
    return `<div class="app-view sa-app sa-news2 nw2-web${news2(ctx.data).dark ? ' nw2-dark' : ''}"><header class="nw2-bar"><button class="nw2-back" data-action="back" aria-label="${e(ctx.t('Navigate up'))}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button><b>${e(story[1])}</b><button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/nw2-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button></header><div class="sa-scroll nw2-article"><h2>${e(story[0])}</h2><small>${e(story[1])} · ${e(ctx.t(story[2]))}</small><span class="nw2-article-photo">${thumb(Number(j) + 2)}</span><p>${e(snippet(story[0], story[1]))}</p></div></div>`;
  }
  function news(ctx) {
    if(ctx.ui.newsManage&&window.NewsSections)return NewsSections.page(ctx);
    const n = key => S(ctx, 'news', key), sections = window.NewsSections?NewsSections.sections(ctx.data):['Headlines', 'Technology', 'Sports'], sec = sections.includes(ctx.ui.newsTab) ? ctx.ui.newsTab : 'Headlines';
    if (ctx.ui.newsWeb) return newsWeb(ctx, n);
    const o = news2(ctx.data), deg = c => o.unit === 'F' ? Math.round(c * 9 / 5 + 32) : c;
    const label = id => id === 'Headlines' ? n('Headlines') : ctx.t(id);
    const stories = id => newsRows(ctx.data,id);
    const chart = ctx.ui.newsChart || 'Temp.', temps = [17, 19, 21, 22, 21, 19, 17, 15].map(deg);
    const bars = chart === 'Temp.' ? temps : chart === 'Precip.' ? [0, 0, 10, 20, 10, 0, 0, 0] : chart === 'Wind' ? [8, 10, 13, 15, 14, 11, 9, 8].map(WIND[o.wind][0]) : [72, 66, 60, 55, 54, 58, 64, 70];
    const weather = sec === 'Headlines' && o.weather !== 'hide' ? `<section class="nw2-card nw2-weather"><div class="nw2-now"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="9" r="4" fill="#fbc02d"/><path d="M7 19h11a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.4 1.6A3.3 3.3 0 0 0 7 19z" fill="#cfd8dc"/></svg><b>${deg(21)}°</b><span>${o.weather === 'custom' && o.place ? `<strong>${e(o.place)}</strong>` : ''}<em>${e(n('Partly Cloudy'))}</em><small>${e(AndroidStrings.format(n('Precipitation: %1$s%%'), 10))}</small><small>${e(AndroidStrings.format(n('Humidity: %1$s%%'), 60))}</small></span></div><nav class="nw2-tabs">${['Temp.', 'Precip.', 'Wind', 'Humidity'].map(t => `<button class="${t === chart ? 'on' : ''}" data-action="news-chart" data-id="${t}">${e(n(t))}</button>`).join('')}</nav><div class="nw2-chart">${bars.map((v, j) => `<i style="height:${Math.max(4, Math.round(v / Math.max(...bars) * 100))}%"><b>${chart === 'Precip.' || chart === 'Humidity' ? v + '%' : v + (chart === 'Wind' ? '' : '°')}</b></i>`).join('')}</div></section>` : '';
    const card = `<section class="nw2-card"><header class="nw2-head"><h3>${e(label(sec))}</h3><button data-action="${sec === 'Headlines' ? 'news2-weather-menu' : 'sa-unsupported'}" aria-label="${e(n('Section header menu button'))}"><img src="assets/nw2-ic_more_horiz_white_18dp.png" alt=""></button></header>${stories(sec).map(([title, source, time], j) => ctx.ui.newsExpanded === `${sec}:${j}` ? `<div class="nw2-expanded"><div class="nw2-exp-top"><span class="nw2-photo big">${thumb(j + 2)}</span><span><b>${e(title)}</b><small>${e(source)} · ${e(ctx.t(time))}</small></span><button class="nw2-icon" data-action="news2-expand" data-id="" aria-label="${e(n('Show less'))}"><img src="assets/nw2-ic_expand_less_white_24dp.png" alt=""></button></div><button class="nw2-snippet" data-action="news2-open" data-id="${sec}:${j}">${e(snippet(title, source))}</button><button class="nw2-article-row" data-action="news2-open" data-id="${sec}:${j}">${e(source)} · ${e(title)}</button><footer><button class="nw2-icon" data-action="news2-share" data-id="${sec}:${j}" aria-label="${e(n('Share article'))}"><img src="assets/nw2-ic_share_white_18dp.png" alt=""></button><button class="nw2-less" data-action="news2-expand" data-id="">${e(n('Show less'))}<img src="assets/nw2-ic_expand_less_white_24dp.png" alt=""></button></footer></div>` : `<button class="nw2-story" data-action="news2-expand" data-id="${sec}:${j}"><span class="nw2-photo">${thumb(j + 2)}</span><span><b>${e(title)}</b><small>${e(source)} · ${e(ctx.t(time))}</small></span></button>`).join('')}<button class="nw2-more" data-action="sa-unsupported">${e(AndroidStrings.format(n('More stories from %1$s'), label(sec)))}</button></section>`;
    const drawer = ctx.ui.newsDrawer ? `<button class="nw2-scrim" data-action="news-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="nw2-drawer"><div class="nw2-account"><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${sections.map(id => `<button class="${id === sec ? 'on' : ''}" data-action="news-tab" data-id="${id}">${e(label(id))}</button>`).join('')}<hr><button data-action="nwsec-manage">${e(n('Add and remove sections…'))}</button><button data-action="sa-unsupported">${e(n('Help & feedback'))}</button></nav>` : '';
    return `<div class="app-view sa-app sa-news2${o.dark ? ' nw2-dark' : ''}"><header class="nw2-bar"><button class="nw2-toggle" data-action="news-drawer" aria-label="${e(n('Open navigation drawer'))}"><i></i><i></i><i></i></button><b>${e(label(sec))}</b>${img('sa-unsupported', n('Search'), 'nw2-abc_ic_search_api_mtrl_alpha.png')}${img('sa-unsupported', n('Add section'), 'nw2-ic_add_white_24dp.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/nw2-abc_ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button></header><div class="sa-scroll nw2-page">${ctx.ui.newsRefreshing ? `<p class="nw2-loading"><i></i>${e(n('Gathering your news…'))}</p>` : weather + card}</div>${drawer}${newsDialog(ctx, n, o)}${window.NewsSections?.dialog(ctx)||''}</div>`;
  }


  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : ctx.ui.sub === 'reminders' ? window.GELNow.reminders({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now, ui: ctx.ui}) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'drive', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, lollipops', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  // The overflow of the screen on show. News & Weather 2.2 (LMY48Y) res/menu/news_activity.xml: Search (abc_ic_search_api_mtrl_alpha) and Add section (ic_add_white_24dp) if room; Refresh, Edit weather display…, Remove this section and Migrate settings in the overflow.
  function menu(view, ctx) {
    if (view === 'google-plus') { const g = key => S(ctx, 'gplus', key); return ctx.ui?.gppDraft || ctx.ui?.gppPrefs ? [] : ['Refresh', 'Feedback', 'Settings', 'Help', 'Sign out'].map(key => ({action: key === 'Refresh' ? 'gplus-refresh' : key === 'Settings' ? 'gpp-settings' : 'sa-unsupported', title: g(key)})); }
    if (view === 'youtube' && ctx.ui?.sub !== 'video') { const y = key => S(ctx, 'youtube', key); return [{action: 'yt10-settings', title: y('Settings')}, {action: 'sa-unsupported', title: y('Help & feedback')}]; }
    if (view === 'drive' && ctx.ui?.sub !== 'file') { if (window.LPDrive) return window.LPDrive.menu(ctx); const d = key => S(ctx, 'drive', key); return ['Create', 'Refresh', 'Filter by', 'Sort by'].map(key => ({action: 'sa-unsupported', title: d(key)})); }
    if (view === 'keep' && ctx.ui?.sub !== 'note') { const k = key => S(ctx, 'keep', key); return [{action: 'keep-columns', title: k(ctx.data?.keepSingle ? 'Multi-column view' : 'Single-column view')}, {action: 'keep-refresh', title: k('Refresh')}]; }
    if (view === 'keep') { const k = key => S(ctx, 'keep', key), note = (ctx.data?.keepNotes || []).find(n => n.id === ctx.ui.keepNote); return [{action: 'keep-delete', title: k('Delete note')}, {action: 'kp-copy', title: k('Make a copy')}, {action: 'kp-share', title: k('Send')}, {action: 'keep-checkboxes', title: k(note?.list ? 'Hide checkboxes' : 'Show checkboxes')}]; }
    if (view === 'news-weather') {
      const n = key => S(ctx, 'news', key), dark = news2(ctx.data || {}).dark;
      if (ctx.ui?.newsWeb) return [{action: 'nwsec-browser', title: n('Open in browser')}, {action: 'news2-share', id: ctx.ui.newsWeb, title: n('Share article')}];
      if (ctx.ui?.newsMenu === 'weather') return [['weather', 'Edit weather display…'], ['unit', 'Temperature units…'], ['wind', 'Wind speed units…']].map(([id, key]) => ({action: 'news2-dialog', id, title: n(key)}));
      return [{action: 'sa-news-refresh', title: n('Refresh')}, {action: 'news2-dialog', id: 'weather', title: n('Edit weather display…')}, {action: 'nwsec-editions', title: n('Change editions…')}, {action: 'nwsec-manage', title: n('Manage sections…')}, {action: 'news2-theme', title: n(dark ? 'Switch to light theme' : 'Switch to dark theme')}];
    }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return [['My location', 'earth-myloc'], ['Share', 'earth-share']].map(([key, action]) => ({action, title: ea(key)})); }
    return [];
  }
  window.StockApps = {thumb, newsArticle,newsPage,FILES: FILES0, news2, APPS: SIMPLE, VIDEOS, POSTS, DEFAULT_NOTES, render, menu};
})();
