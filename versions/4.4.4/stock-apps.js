/* The other Google apps of the stock Nexus 5 (GSMArena's Google folder: Gmail, Google+, Photos, Maps, People,
   Calendar, Keep, Drive, YouTube, Play Music, Play Games; a 2013 unboxing video's drawer: Drive, Earth, Google,
   Google Settings, Google+, Keep, Maps, News & Weather). Each has a simple screen in its 2013 look: Google opens Google
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
    return `<header class="sa-bar${cls}"><button class="sa-up" data-action="${up ? 'back' : 'home'}" aria-label="${e(ctx.t(up ? 'Back' : 'Home'))}">${up ? `<img class="sa-caret" src="assets/${/dark/.test(cls) ? 'ic_ab_back_holo_dark.png' : 'ic_ab_back_holo_light.png'}" alt="">` : ''}<img src="assets/${icon}" alt=""></button><span class="sa-title"><b>${e(title)}</b>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</span>${actions}</header>`;
  }
  const thumb = (seed, label = '') => {
    const p = [['#2b5876', '#f4d06f'], ['#6d2e46', '#f6a5c0'], ['#1e5128', '#d8e9a8'], ['#22313f', '#ff8c42'], ['#4a3b8f', '#9bd1f2'], ['#7a1f1f', '#ffd166']][seed % 6];
    return `<svg class="sa-thumb" viewBox="0 0 160 90" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="160" height="90" fill="${p[0]}"/><circle cx="${40 + seed * 17 % 80}" cy="38" r="22" fill="${p[1]}" opacity=".85"/><path d="M0 70 Q40 ${44 + seed % 3 * 6} 80 66 T160 60 V90 H0Z" fill="${p[1]}" opacity=".45"/>${label ? `<text x="8" y="82" font-family="Arial" font-size="11" fill="#fff">${e(label)}</text>` : ''}</svg>`;
  };
  const avatar = (name, seed) => `<span class="sa-avatar" style="background:${['#d65f4e', '#4d8fe0', '#5fae5a', '#e3a33b', '#8a63c9'][seed % 5]}">${e(name.charAt(0))}</span>`;

  // ---- Google (Google Now) and Voice Search ----
  function google(ctx) { return `<div class="app-view sa-app sa-google">${window.GELNow.render({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now, ui: ctx.ui})}</div>`; }
  // Voice Search on 4.4.4 is Google Search 3.3.11's search plate in voice mode (velvet_search_plate.xml,
  // search_plate.xml): the 20 dp #eeeeee strong shield, then search_bg with a 260 dp speech area: ic_google_medium_dark at
  // 30 / 28 dp, the 68 dp recognizer 8 dp from the right (vs_micbtn_rec while listening, vs_micbtn_on after) over
  // SoundLevels (152 dp, #dbdbdb level circle from 34 to 100 dp round the mic, a 1 dp guide), and main_text (20 sp
  // sans-serif-light #777, 32 dp margins) at the bottom: "Speak now", then "Didn't catch that. Try speaking again."
  function voice(ctx) {
    const listening = ctx.ui.voiceState !== 'retry', v = key => S(ctx, 'google', key);
    return `<div class="app-view sa-app sa-voice"><div class="vs-panel"><div class="vs-speech"><img class="vs-logo" src="assets/vn3-ic_google_medium_dark.png" alt="Google"><div class="vs-levels${listening ? ' on' : ''}"><i></i><b></b></div><button class="vs-mic" data-action="voice-listen" aria-label="${e(v('Tap to speak'))}"><img src="assets/vn3-vs_micbtn_${listening ? 'rec' : 'on'}.png" alt=""></button><p>${e(v(listening ? 'Speak now' : "Didn't catch that. Try speaking again."))}</p></div></div></div>`;
  }

  // Google Search settings (the overview "Settings" button) and the Google Settings app.
  function searchSettings(ctx) {
    // Each header opens its page (kk-search-prefs.js); Help & feedback is Google's page.
    if (ctx.ui.ksPage) return window.KKSearchPrefs.render(ctx, title => bar(ctx, {title, up: true, icon: 'google-search.png'}));
    const page = {'Phone search': 'phone', Voice: 'voice', 'Accounts & privacy': 'privacy', Notifications: 'notifications'};
    const row = (icon, label) => `<button class="sa-row" data-action="${page[label] ? 'ksp-open' : 'sa-unsupported'}" data-id="${page[label] || ''}"><i>${ICON[icon] || ''}</i><span>${e(ctx.t(label))}</span></button>`;
    return `<div class="app-view sa-app sa-settings">${bar(ctx, {title: ctx.t('Settings'), up: true, icon: 'google-search.png'})}<div class="sa-scroll"><div class="sa-switch-row"><span>${e(ctx.t('Google Now'))}</span><button class="sa-switch${ctx.data.googleNowOn === false ? '' : ' on'}" data-action="google-now-toggle">${e(ctx.t(ctx.data.googleNowOn === false ? 'OFF' : 'ON'))}</button></div><h4>${e(ctx.t('SEARCH & NOW CARDS'))}</h4>${row('search', 'Phone search')}${row('mic', 'Voice')}${row('locate', 'Accounts & privacy')}${row('list', 'Notifications')}${row('', 'Help & feedback')}</div></div>`;
  }
  // Google Settings (Google Play services 4.3.23, PrebuiltGmsCore.apk of KTU84P): common_settings.xml's 48 dp bar on
  // common_settings_bg and one container with 16 dp side margins and list dividers, no section headers.
  // GoogleSettingsActivity.onCreate adds simple_list_item_1 rows in this order when their intents resolve on the image:
  // Apps with Google+ Sign-In, Google+, Play Games, Location (Maps 7.5 no longer offers Maps & Latitude), Search & Now
  // (API 14 and up), Ads, Verify apps, Android Device Manager and Drive apps.
  function googleSettings(ctx) {
    const g = key => S(ctx, 'gsettings', key);
    // The pages GMS draws itself (gms-settings.js); Google+ and Play Games open other screens, not drawn here.
    if (String(ctx.ui.sub || '').startsWith('gms-')) return window.GMSSettings.render(ctx, g);
    const rows = [['Apps with Google+ Sign-In', 'gms-open', 'apps'], ['Google+'], ['Play Games', 'gs-play-games'], ['Location', 'gms-open', 'location'], ['Search & Now', 'gel-overview-settings'], ['Ads', 'gms-open', 'ads'], ['Verify apps', 'gms-open', 'verify'], ['Android Device Manager', 'gms-open', 'mdm'], ['Drive apps', 'gms-open', 'drive']];
    return `<div class="app-view sa-app sa-gsettings"><header class="gs-bar"><button class="gs-up" data-action="home" aria-label="${e(g('Google Settings'))}"><i></i><img src="assets/google-settings.png" alt=""></button><b>${e(g('Google Settings'))}</b></header><div class="sa-scroll"><div class="gs-list">${rows.map(([key, action, id]) => `<button data-action="${action || 'sa-unsupported'}" data-id="${id || ''}">${e(g(key))}</button>`).join('')}</div></div></div>`;
  }


  // ---- Maps (Google Maps 7, 2013): a full-screen map, the floating search card, my location ----
  function mapSvg(ctx) {
    const pin = ctx.ui.mapsQuery ? '<g transform="translate(222 190)"><path d="M0-34a14 14 0 0 0-14 14c0 11 14 26 14 26s14-15 14-26A14 14 0 0 0 0-34z" fill="#db4437"/><circle cy="-20" r="5" fill="#fff"/></g>' : '';
    return `<svg class="sa-map" viewBox="0 0 360 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="600" fill="#ece8df"/><path d="M-10 430c80-20 120 10 200-10s140-60 180-50v240H-10z" fill="#a9cdee"/><rect x="30" y="80" width="110" height="90" fill="#cde5b4"/><rect x="230" y="300" width="90" height="70" fill="#cde5b4"/><g stroke="#fff" stroke-width="7" fill="none"><path d="M-10 200H370M-10 330H370M90 -10V620M260 -10V620"/></g><g stroke="#f7d36b" stroke-width="10" fill="none"><path d="M-10 260C80 250 140 280 200 240S320 200 370 210"/><path d="M180 -10C170 120 200 200 190 300S160 460 170 620"/></g><g stroke="#fff" stroke-width="3" fill="none"><path d="M-10 120H370M-10 380H370M40 -10V620M150 -10V620M320 -10V620"/></g><text x="50" y="130" font-family="Arial" font-size="12" fill="#5b8a46">${e(ctx.t('City Park'))}</text><text x="210" y="470" font-family="Arial" font-size="12" fill="#4a77a8" font-style="italic">${e(ctx.t('Bay'))}</text>${pin}<circle cx="180" cy="300" r="22" fill="#4285f4" opacity=".18"/><circle cx="180" cy="300" r="8" fill="#4285f4" stroke="#fff" stroke-width="3"/></svg>`;
  }
  // Maps 7.5.0 (KTU84P): base_main_internal.xml. The omnibox (base_floatingbar_internal.xml on omnibox.9, 44 dp, 10 dp
  // from the sides) with "Search" in 17 sp sans-serif-light #222 and, after a 1 x 24 dp #dedede divider, the directions
  // button; the "Google" watermark 9 dp from the bottom left; the my-location button (ic_location on the button
  // 9-patch) at the bottom right; the side tab (views_entry_point_flipped) on the right edge. It opens
  // layers_menu_content.xml from the right (LayersContent: 300 dp, layers_background tiled): Traffic, Public transit,
  // Bicycling and Satellite toggles (45 dp, 16 sp), Google Earth, then Settings, Help and Send feedback (56 dp, 18 sp
  // bold) between menu dividers.
  function maps(ctx) {
    // Settings (and My Places / Your places): maps-prefs.js.
    if (window.MapsPrefs?.active(ctx.ui)) return MapsPrefs.render({...ctx, account: 'kitkat.demo@gmail.com', bar: title => bar(ctx, {title, up: true, icon: 'maps.png'})});
    // Directions and navigation (maps-route.js); the route page and the drive take over the screen.
    if (ctx.ui.navRun && window.MapsRoute) return MapsRoute.nav({...ctx, mapSvg: mapSvg({...ctx, ui: {...ctx.ui, mapsQuery: ''}}).replace(/^<svg[^>]*>|<\/svg>$/g, '')});
    if (window.MapsRoute?.has(ctx.ui)) return MapsRoute.render({...ctx, mapSvg: mapSvg({...ctx, ui: {...ctx.ui, mapsQuery: ''}}).replace(/^<svg[^>]*>|<\/svg>$/g, '')});
    const q = ctx.ui.mapsQuery || '', mp = key => S(ctx, 'maps', key), layer = ctx.data.mapsLayer || '';
    const toggle = (id, key, icon) => `<button class="mp7-layer${layer === id ? ' on' : ''}" data-action="maps-layer" data-id="${id}"><img src="assets/mp7-ic_layers_${icon}${layer === id ? '_selected' : ''}.png" alt="">${e(mp(key))}</button>`;
    const panel = ctx.ui.mapsPanel ? `<button class="mp7-scrim" data-action="maps-panel" aria-label="${e(mp('Menu'))}"></button><nav class="mp7-panel"><i class="mp7-spacer"></i>${toggle('traffic', 'Traffic', 'traffic')}${toggle('transit', 'Public transit', 'transit')}${toggle('bicycling', 'Bicycling', 'bicycling')}${toggle('satellite', 'Satellite', 'satellite')}<button class="mp7-layer mp7-earth" data-action="open-app" data-app="earth"><img src="assets/mp7-ic_layers_google_earth.png" alt="">${e(mp('Google Earth'))}<img class="mp7-shortcut" src="assets/mp7-ic_layers_google_earth_shortcut.png" alt=""></button><hr>${['Settings', 'Help', 'Send feedback'].map(key => `<button class="mp7-menu" data-action="${key === 'Settings' ? 'mps-settings" data-id="settings' : 'sa-unsupported'}">${e(mp(key))}</button><hr>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-maps sa-maps7"><div class="mp7-map${layer ? ' layer-' + layer : ''}">${mapSvg(ctx)}</div><form class="mp7-omnibox" data-form="maps-search"><input name="query" autocomplete="off" placeholder="${e(mp('Search'))}" aria-label="${e(mp('Search'))}" value="${e(q)}"><i></i><button type="button" data-action="mr-open" data-id="${e(q)}" aria-label="${e(mp('Directions'))}"><img src="assets/mp7-ic_omni_box_directions.png" alt=""></button></form><img class="mp7-watermark" src="assets/mp7-watermark_dark.png" alt="Google"><button class="mp7-tab" data-action="maps-panel" aria-label="${e(mp('Menu'))}"><img src="assets/mp7-views_entry_point_flipped.png" alt=""></button><button class="mp7-locate" data-action="maps-locate" aria-label="${e(mp('Move to my location'))}"><img src="assets/mp7-ic_location.png" alt=""></button>${q ? `<div class="sa-maps-card"><b>${e(q)}</b><small>${e(ctx.t('0.8 mi · 4 min drive'))}</small></div>` : ''}${panel}</div>`;
  }


  // ---- Drive (2013): My Drive ----
  // Drive's files; data.driveFiles holds them once an app has created, renamed or removed one.
  const FILES0 = [
    {id: 'f0', name: 'Photos', kind: 'folder', date: 'Oct 28', age: 9}, {id: 'f1', name: 'Trip plan 2014', kind: 'doc', date: 'Nov 2', age: 0, text: 'Day 1 — arrive in Lisbon, tram 28 to Alfama.\nDay 2 — Belém, pastéis de nata.\nDay 3 — Sintra by train.'},
    {id: 'f2', name: 'Budget', kind: 'sheet', date: 'Oct 30', age: 1, text: 'Rent 850\nGroceries 240\nTransport 60\nFun 120'}, {id: 'f3', name: 'Nexus 5 manual', kind: 'pdf', date: 'Oct 31', age: 3, text: 'Welcome to Nexus 5. Swipe left from the Home screen to see Google Now.'},
    {id: 'f4', name: 'Meetup slides', kind: 'slides', date: 'Sep 12', age: 60, text: 'What’s new in KitKat\n• Immersive mode\n• Printing\n• Host card emulation'}
  ];
  const kindColor = {folder: '#8f8f8f', doc: '#4285f4', sheet: '#0f9d58', pdf: '#db4437', slides: '#f4b400'};
  // Drive 1.2.484 (KTU84P): CakemixTheme's ActionBar on action_bar_background (#dddddd over a 3 dp #d6d6d6 / #c3c3c3
  // base, #333 text) with the navigation toggle (ic_drawer). menu_doclist_activity.xml under ActionMenuPresenter's three
  // slots: Search and View as Grid in the bar; Add new, Refresh, Filter by, Sort by, Settings and Product Tour in the
  // overflow. navigation_sliding_panel.xml (300 dp, #eeeeee): the account, then the entries of the iM enum - My Drive,
  // Shared with me, Starred, Recent, Offline, Uploads - as navigation_list_item.xml rows (49 dp, 22 dp icons, 16 sp).
  // doc_entry_row.xml: 60 dp, the type icon centred on #f0f0f0, the 16 sp title, "Modified: …" in 13 sp #aaaaaa, the info
  // button; sorted by Last modified under Drive's time range titles (12 sp).
  function drive(ctx) {
    const d = key => S(ctx, 'drive', key);
    if (ctx.ui.sub === 'file') {
      const FILES = ctx.data.driveFiles || FILES0, file = FILES.find(f => f.id === ctx.ui.driveFile) || FILES[1];
      return `<div class="app-view sa-app sa-drive">${bar(ctx, {title: file.name, up: true, icon: 'drive.png', actions: btn('sa-unsupported', ctx.t('Share'), 'share') + btn('sa-unsupported', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-doc"><div class="sa-page">${e(file.text || '').split('\n').map(line => `<p>${line}</p>`).join('')}</div></div></div>`;
    }
    const icon = {folder: 'ic_type_folder', doc: 'ic_type_doc', sheet: 'ic_type_sheet', pdf: 'ic_type_pdf', slides: 'ic_type_presentation'};
    const range = age => age === 0 ? 'Today' : age === 1 ? 'Yesterday' : age < 7 ? 'Earlier this Week' : age < 31 ? 'Earlier this Month' : 'Older';
    const when = age => new Date(ctx.now.getTime() - age * 864e5).toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'});
    let last = '';
    const q = String(ctx.ui.driveQuery || ''), searching = ctx.ui.sub === 'search', results = ctx.ui.sub === 'results';
    const FILES = ctx.data.driveFiles || FILES0, list = results ? FILES.filter(f => f.name.toLocaleLowerCase().includes(q.trim().toLocaleLowerCase())) : FILES;
    const rows = [...list].sort((a, b) => a.age - b.age).map(f => { const r = range(f.age), head = r !== last ? `<h4 class="dr-group">${e(d(r))}</h4>` : ''; last = r; return `${head}<div class="dr-row"><button class="dr-main" data-action="${f.kind === 'folder' ? 'sa-unsupported' : 'drive-open'}" data-id="${f.id}"><span class="dr-icon"><img src="assets/dr-${icon[f.kind]}.png" alt=""></span><span class="dr-text"><b>${e(f.name)}</b><small>${e(AndroidStrings.format(d('Modified: %s'), when(f.age)))}</small></span></button><button class="dr-info" data-action="sa-unsupported" aria-label="${e(d('Show item properties'))}"><img src="assets/dr-ic_information_gray_small.png" alt=""></button></div>`; }).join('');
    const nav = [['My Drive', 'my_drive'], ['Shared with me', 'shared_with_me'], ['Starred', 'starred'], ['Recent', 'recently_opened'], ['Offline', 'offline'], ['Uploads', 'upload']];
    const panel = ctx.ui.driveNav ? `<button class="dr-scrim" data-action="drive-nav" aria-label="${e(ctx.t('Close'))}"></button><nav class="dr-nav"><div class="dr-account">kitkat.demo@gmail.com</div>${nav.map(([key, ic], n) => `<button class="${n ? '' : 'on'}" data-action="${n ? 'sa-unsupported' : 'drive-nav'}"><img src="assets/dr-ic_drive_${ic}_inactive.png" alt="">${e(d(key))}</button>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-drive sa-drive12"><header class="sa-bar dr-bar">${searching || results ? `<button class="sa-up" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="dr-toggle" src="assets/ic_ab_back_holo_light.png" alt=""><img src="assets/drive.png" alt=""></button>` : `<button class="sa-up" data-action="drive-nav" aria-label="${e(d('Open navigation drawer'))}"><img class="dr-toggle" src="assets/dr-ic_drawer.png" alt=""><img src="assets/drive.png" alt=""></button>`}${searching ? `<form class="yt-sv" data-form="drive-search"><input name="query" placeholder="${e(d('Search'))}" aria-label="${e(d('Search'))}" autocomplete="off" spellcheck="false" enterkeyhint="search"></form>` : `<span class="sa-title"><b>${e(results ? AndroidStrings.format(d('Search: "%s"'), q) : d('My Drive'))}</b></span>${img('drive-search-open', d('Search'), 'dr-action_search.png')}`}${searching ? '' : img('sa-unsupported', d('View as Grid'), 'dr-ic_grid_toggle.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/dr-ic_actionbar_overflow.png" alt=""></button></header><div class="sa-scroll dr-list">${searching ? '' : rows || `<p class="sa-empty">${e(d('No Items'))}</p>`}</div>${panel}</div>`;
  }


  // ---- Keep (2013): the quick note bar and coloured cards; notes are kept in data.keepNotes ----
  const KEEP_COLORS = ['#fff', '#f7f0a3', '#c6e5f5', '#c9f0b9', '#f8c8c0'];
  // Keep 2.0.51 (KTU84P): MemoryAppTheme overlays the action bar (ab_solid: #dce1e3 at 90%) on #dce1e3 with the drawer
  // toggle (ic_drawer); browse_activity.xml's DrawerLayout opens drawer_fragment.xml (300 dp, #f5f5f5, the account
  // spinner, then DrawerFragment's Notes, Archive and Reminders with their icons, blue and #cc33b5e5 when active, 18 sp
  // #58585b otherwise). quick_edit.xml and add_items_bar.xml as in 1.0; browse_fragment_menu.xml keeps the column switch,
  // Refresh, Settings, Send feedback and Help in the overflow; editor_menu.xml puts Note color and Add picture in the bar.
  /* List and picture notes (Keep 2.0.51). A list note keeps .list = [{text, checked}], a picture note .photo = the id of
     a Gallery photo. Browse cards (index_list_layout.xml): browse_image_layout.xml's photo across the top, then up to
     four index_list_text_item.xml rows (8 dp tops, ic_checked_dark / ic_unchecked_dark, 16 sp #99000000, #4d000000 and
     struck through when checked) and the "…" ellipse. The editor: editor_photo_layout.xml (the 32 dp ic_delete_light
     button, "Remove this photo?"), list_text_note.xml rows (the check box 28 dp in, the item text, ic_delete_dark while
     editing) and editor_list_footer.xml's disabled box with "List item". Add picture and the bar's New photo ask "Take
     photo" (a Camera album shot, as Contacts does) or "Choose photo" (DocumentsUI's GET_CONTENT picker) in a
     dialog_list_item_with_icon.xml list; Show / Hide checkboxes converts, asking "Delete checked items?" when needed. */
  const KEEP_INDEX_MAX = 4;
  const keepPhoto = (ctx, id) => { const p = (ctx.data.photos || []).find(x => x.id === id); return p && window.ICSMedia ? window.ICSMedia.image(p) : ''; };
  const keepOrder = list => false ? [...list.filter(i => !i.checked), ...list.filter(i => i.checked)] : list;
  function keepCard(ctx, n) {
    const photo = n.photo ? keepPhoto(ctx, n.photo) : '', items = n.list ? keepOrder(n.list).filter(i => i.text.trim()) : [];
    const rows = items.slice(0, KEEP_INDEX_MAX).map(i => `<span class="kp-li${i.checked ? ' on' : ''}"><img src="assets/${i.checked ? 'kp2-ic_checked_dark.png' : 'kp2-ic_unchecked_dark.png'}" alt=""><span>${e(i.text)}</span></span>`).join('') + (items.length > KEEP_INDEX_MAX ? '<span class="kp-ellipse">…</span>' : '');
    return `<button class="sa-note${photo ? ' kp-with-photo' : ''}" data-no-translate data-action="keep-open" data-id="${e(n.id)}" style="--note:${KEEP_COLORS[n.color || 0]}">${photo ? `<img class="kp-photo" src="${e(photo)}" alt="">` : ''}${n.list ? rows : n.text ? `<span class="kp-text">${e(n.text)}</span>` : ''}</button>`;
  }
  function keepEditor(ctx, note, k) {
    const photo = note.photo ? keepPhoto(ctx, note.photo) : '';
    const pic = photo ? `<div class="kp-ed-photo"><img src="${e(photo)}" alt=""><button type="button" class="kp-ed-photo-del" data-action="keep-photo-remove" aria-label="${e(k('Remove photo?'))}"><img src="assets/kp2-ic_delete_light.png" alt=""></button></div>` : '';
    if (!note.list) return `${pic}<textarea class="keep-text" maxlength="2000" aria-label="${e(k('New note'))}">${e(note.text)}</textarea>`;
    const row = i => { const item = note.list[i]; return `<div class="kp-ed-li${item.checked ? ' on' : ''}"><button type="button" class="kp-ed-check" data-action="keep-li-check" data-id="${i}" role="checkbox" aria-checked="${!!item.checked}" aria-label="${e(item.text)}"></button><input class="kp-ed-text" data-keep-li="${i}" value="${e(item.text)}" maxlength="1000" autocomplete="off" aria-label="${e(k('List item'))}"><button type="button" class="kp-ed-del" data-action="keep-li-delete" data-id="${i}" aria-label="${e(k('Delete'))}"><img src="assets/kp2-ic_delete_dark.png" alt=""></button></div>`; };
    const add = `<form class="kp-ed-add" data-form="keep-li-add"><i class="kp-ed-check" aria-hidden="true"></i><input name="text" maxlength="1000" autocomplete="off" placeholder="${e(k('List item'))}" aria-label="${e(k('List item'))}"></form>`;
    const index = note.list.map((_, i) => i);
    return `${pic}<div class="kp-ed-list" data-no-translate>${index.map(row).join('')}${add}</div>`;
  }
  function keepDialog(ctx, k) {
    const kind = ctx.ui.keepDialog;
    if (!kind) return '';
    const buttons = list => `<div class="kp-dlg-buttons">${list.map(([action, label]) => `<button type="button" data-action="${action}">${e(label)}</button>`).join('')}</div>`;
    const body = kind === 'picture' ? `<h3>${e(k('Add picture'))}</h3>${[['keep-photo-take', 'Take photo', 'kp2-ic_camera_dark.png'], ['keep-photo-choose', 'Choose photo', 'kp2-ic_photo_dark.png']].map(([action, key, icon]) => `<button type="button" class="kp-dlg-item" data-action="${action}"><img src="assets/${icon}" alt="">${e(k(key))}</button>`).join('')}`
      : kind === 'remove-photo' ? `<p>${e(k('Remove photo?'))}</p>${buttons([['keep-dialog-close', k('Cancel')], ['keep-photo-delete', k('Delete')]])}`
      : `<h3>${e(k('Delete checked items?'))}</h3>${buttons([['keep-hide-keep', k('Keep (button)')], ['keep-hide-delete', k('Delete (button)')]])}`;
    return `<button type="button" class="kp-dlg-scrim" data-action="keep-dialog-close" aria-label="${e(ctx.t('Close'))}"></button><div class="kp-dlg" role="dialog">${body}</div>`;
  }
  function keep(ctx) {
    const notes = ctx.data.keepNotes || [], k = key => S(ctx, 'keep', key), view = ctx.ui.keepView || 'notes';
    const head = (title, actions, up) => `<header class="sa-bar kp2-bar">${up ? `<button class="sa-up" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="sa-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img src="assets/keep.png" alt=""></button>` : `<button class="sa-up kp2-toggle" data-action="keep-drawer" aria-label="${e(k('Open navigation drawer'))}"><img class="kp2-drawer-icon" src="assets/kp2-ic_drawer.png" alt=""><img src="assets/keep.png" alt=""></button>`}<span class="sa-title"><b>${e(title)}</b></span>${actions}</header>`;
    if (ctx.ui.sub === 'note') {
      const note = notes.find(n => n.id === ctx.ui.keepNote);
      if (note) return `<div class="app-view sa-app sa-keep sa-keep2">${head(k('Keep'), img('keep-color', k('Note color…'), 'kp2-ic_colorpicker_dark.png') + img('keep-picture', k('Add picture'), 'kp2-ic_camera_dark.png') + btn('sa-menu', ctx.t('More options'), 'overflow'), true)}<div class="sa-keep-edit" style="background:${KEEP_COLORS[note.color || 0]}">${keepEditor(ctx, note, k)}</div>${keepDialog(ctx, k)}</div>`;
    }
    const shown = view === 'reminders' ? [] : notes.filter(n => !!n.archived === (view === 'archive')), single = ctx.data.keepSingle;
    const add = (action, key, src) => `<button type="button" class="sa-keep-new" data-action="${action}" aria-label="${e(k(key))}"><img src="assets/kp2-${src}.png" alt=""></button>`;
    const quick = view === 'notes' ? `<form class="sa-keep-add" data-form="keep-add"><input name="text" maxlength="500" autocomplete="off" placeholder="${e(k('Add quick note'))}" aria-label="${e(k('Add quick note'))}"><i></i><div class="sa-keep-items">${add('keep-new', 'New note', 'ic_note_dark')}${add('keep-new-list', 'New list', 'ic_list_dark')}${add('sa-unsupported', 'New recording', 'ic_mic_dark')}${add('keep-picture', 'New photo', 'ic_camera_dark')}</div></form>` : '';
    const empty = view === 'reminders' ? 'Create a reminder' : view === 'archive' ? 'There are no archived notes' : 'Take a note';
    const title = view === 'archive' ? k('Archive (drawer)') : view === 'reminders' ? k('Reminders') : k('Keep');
    const items = [['notes', 'Notes', 'lightbulb'], ['archive', 'Archive (drawer)', 'archive'], ['reminders', 'Reminders', 'reminder']];
    const drawer = ctx.ui.keepDrawer ? `<button class="kp2-scrim" data-action="keep-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="kp2-drawer"><div class="kp2-account">${e('kitkat.demo@gmail.com')}</div>${items.map(([id, key, icon]) => `<button class="${view === id ? 'on' : ''}" data-action="keep-landing" data-id="${id}"><img src="assets/kp2-ic_${icon}_${view === id ? 'blue' : 'dark'}.png" alt="">${e(k(key))}</button>`).join('')}</nav>` : '';
    return `<div class="app-view sa-app sa-keep sa-keep2">${head(title, btn('sa-menu', ctx.t('More options'), 'overflow'))}<div class="sa-scroll">${quick}<div class="sa-notes${single ? ' single' : ''}">${shown.map(n => keepCard(ctx, n)).join('') || `<p class="sa-empty">${e(k(empty))}</p>`}</div></div>${drawer}${keepDialog(ctx, k)}</div>`;
  }


  // ---- YouTube (2013): What to Watch and a player ----
  const VIDEOS = [
    {id: 'v1', title: 'Nexus 5 — hands-on and first impressions', channel: 'Gadget Weekly', views: '1,204,311', len: '8:42', likes: 9120},
    {id: 'v2', title: 'KitKat: 10 tips for Android 4.4', channel: 'Droid Corner', views: '486,020', len: '6:15', likes: 4310},
    {id: 'v3', title: 'Timelapse: one day in the city', channel: 'Slow Motion Club', views: '92,437', len: '3:01', likes: 1876},
    {id: 'v4', title: 'How to make dessert-themed cupcakes', channel: 'Kitchen Science', views: '311,908', len: '11:20', likes: 2650}
  ];
  // YouTube 5.2.27 (KTU84P). Theme.Home: #ededed, the ActionBar style on action_bar_background (#f3f3f3 to #e0dfdf, a
  // 2 px #cac9c9 base) with action_bar_logo and no title, the guide toggle (ic_action_bar_drawer); menu.xml: Search in
  // the bar, Settings / Feedback / Help in the overflow. GuideFragment (dex order): the account, Uploads, History,
  // Favorites, Playlists, Watch later, the Subscriptions label with What to watch and My subscriptions, Browse channels,
  // the From YouTube label with Recommended and Trending (guide_entry.xml: 48 dp, 32 dp icons, 16 sp #f2f2f2 on #434343,
  // #444 separators; guide_section.xml: 12 sp #999 over a 2 dp #646464 line). video_feed_item.xml on card_frame: the 16:9
  // thumbnail with the duration (12 sp on #cc000000, i.e. 80% black), 18 sp #333 title, 14 sp #999 channel and views, the menu anchor.
  // The watch page: the player, watch_info_card.xml (title, views, like_dislike_panel.xml) and watch_suggested_card.xml
  // (detailed_video_item_body.xml rows 3:2, "More" in #1b7fcc).
  // Search (audit step 5): see the header of the version's YouTube; the simulator matches titles and channels.
  function ytSearch(ctx, y) {
    const q = String(ctx.ui.ytQuery || ''), found = VIDEOS.filter(v => (v.title + ' ' + v.channel).toLocaleLowerCase().includes(q.trim().toLocaleLowerCase()));
    const field = `<form class="yt-sv" data-form="yt-search"><input name="query" value="${e(q)}" placeholder="${e(y('Search YouTube'))}" aria-label="${e(y('Search YouTube'))}" autocomplete="off" spellcheck="false" enterkeyhint="search">${q ? `<button type="button" class="yt-sv-clear" data-action="yt-search-clear" aria-label="${e(y('Clear query'))}"><img src="assets/yt5-ic_clear_search_api_holo_light.png" alt=""></button>` : ''}</form>`;
    const head = `<header class="sa-bar yt5-bar"><button class="sa-up" data-action="back" aria-label="${e(ctx.t('Back'))}"><img class="yt5-toggle" src="assets/ic_ab_back_holo_light.png" alt=""><img class="yt5-logo" src="assets/yt5-action_bar_logo.png" alt="YouTube"></button>${ctx.ui.sub === 'search' ? field : `<span class="sa-title"></span>${img('yt-search-open', y('Search'), 'yt5-ic_menu_search.png')}`}</header>`;
    if (ctx.ui.sub === 'search') return `<div class="app-view sa-app sa-youtube sa-yt5 yt-searching">${head}<div class="sa-scroll yt5-feed"></div></div>`;
    const filters = `<div class="yt-filters"><span>${e(y('Videos'))}</span><span>${e(y('All time'))}</span></div>`;
    return `<div class="app-view sa-app sa-youtube sa-yt5">${head}${filters}<div class="sa-scroll yt5-feed">${found.map(v => `<button class="yt5-card" data-action="yt-video" data-id="${v.id}"><span class="yt5-thumb">${thumb(VIDEOS.indexOf(v))}<em>${e(v.len)}</em></span><span class="yt5-copy"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</small><img class="yt5-anchor" src="assets/yt5-contextual_menu_anchor_normal.png" alt=""></span></button>`).join('') || `<p class="sa-empty">${e(y('No videos found'))}</p>`}</div></div>`;
  }
  function youtube(ctx) {
    const y = key => S(ctx, 'youtube', key);
    if (ctx.ui.sub === 'settings') return KKYouTube.settings(ctx);
    if (ctx.ui.sub === 'search' || ctx.ui.sub === 'results') return ytSearch(ctx, y);
    if (ctx.ui.sub === 'video') {
      const v = VIDEOS.find(item => item.id === ctx.ui.ytVideo) || VIDEOS[0], i = VIDEOS.indexOf(v), liked = (ctx.data.ytLikes || []).includes(v.id);
      const rows = VIDEOS.filter(item => item !== v).slice(0, 3);
      return `<div class="app-view sa-app sa-youtube sa-yt5 sa-yt-watch"><div class="sa-yt-player${ctx.ui.ytPaused ? '' : ' playing'}" data-action="yt-toggle">${thumb(i)}<span class="sa-yt-state">${ctx.ui.ytPaused ? ICON.play : ''}</span><i class="sa-yt-progress"></i></div><div class="sa-scroll"><section class="yt5-info"><img class="yt5-expand" src="assets/yt5-arrow_down.png" alt=""><h3>${e(v.title)}</h3><p>${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</p><div class="yt5-likes"><button class="${liked ? 'on' : ''}" data-action="yt-like" data-id="${v.id}" aria-label="${e(y('Like'))}"><img src="assets/yt5-ic_like.png" alt="">${(v.likes + (liked ? 1 : 0)).toLocaleString(ctx.locale)}</button><button data-action="sa-unsupported" aria-label="${e(y('Dislike'))}"><img src="assets/yt5-ic_dislike.png" alt="">${Math.round(v.likes / 40).toLocaleString(ctx.locale)}</button></div></section><section class="yt5-suggested">${rows.map((r, n) => `<button class="yt5-row${n ? '' : ' first'}" data-action="yt-video" data-id="${r.id}"><span class="yt5-row-thumb">${thumb(VIDEOS.indexOf(r))}<em>${e(r.len)}</em></span><span class="yt5-row-meta"><b>${e(r.title)}</b><small>${e(r.channel)}</small><small>${e(AndroidStrings.format(ctx.t('%s views'), r.views))}</small></span></button>`).join('')}<button class="yt5-more" data-action="sa-unsupported">${e(y('More'))}</button></section></div></div>`;
    }
    const entry = (key, icon, action = 'sa-unsupported', on = false) => `<button class="yt5-entry${on ? ' on' : ''}" data-action="${action}">${icon ? `<img src="assets/yt5-${icon}.png" alt="">` : '<i></i>'}<span>${e(y(key))}</span></button>`;
    const section = key => `<h4 class="yt5-section">${e(y(key))}</h4>`;
    const guide = ctx.ui.ytGuide ? `<button class="yt5-scrim" data-action="yt-guide" aria-label="${e(ctx.t('Close'))}"></button><nav class="yt5-guide"><div class="yt5-account"><img src="assets/yt5-missing_avatar.png" alt=""><span><small>KitKat Demo</small><small>kitkat.demo@gmail.com</small></span></div>${entry('Uploads', 'ic_drawer_upload')}${entry('History', 'ic_drawer_history')}${entry('Favorites', 'ic_drawer_fav')}${entry('Playlists', 'ic_drawer_playlist')}${entry('Watch later', 'ic_drawer_watchlater')}${section('Subscriptions')}${entry('What to watch', '', 'yt-guide', true)}${entry('My subscriptions', '')}${entry('Browse channels', 'ic_drawer_addchannels')}${section('From YouTube')}${entry('Recommended', 'ic_drawer_yt_recommended')}${entry('Trending', 'ic_drawer_yt_trending')}</nav>` : '';
    return `<div class="app-view sa-app sa-youtube sa-yt5"><header class="sa-bar yt5-bar"><button class="sa-up" data-action="yt-guide" aria-label="${e(y('Open guide'))}"><img class="yt5-toggle" src="assets/yt5-ic_action_bar_drawer.png" alt=""><img class="yt5-logo" src="assets/yt5-action_bar_logo.png" alt="YouTube"></button><span class="sa-title"></span>${img('yt-search-open', y('Search'), 'yt5-ic_menu_search.png')}<button class="sa-btn" data-action="sa-menu" aria-label="${e(ctx.t('More options'))}"><img src="assets/yt5-abc_ic_menu_moreoverflow_normal_holo_light.png" alt=""></button></header><div class="sa-scroll yt5-feed">${VIDEOS.map((v, i) => `<button class="yt5-card" data-action="yt-video" data-id="${v.id}"><span class="yt5-thumb">${thumb(i)}<em>${e(v.len)}</em></span><span class="yt5-copy"><b>${e(v.title)}</b><small>${e(v.channel)} · ${e(AndroidStrings.format(ctx.t('%s views'), v.views))}</small><img class="yt5-anchor" src="assets/yt5-contextual_menu_anchor_normal.png" alt=""></span></button>`).join('')}</div>${guide}</div>`;
  }


  // ---- Google+ (2013): the Home stream ----
  const POSTS = [
    {id: 'p1', name: 'Alex Morgan', time: '2h', text: 'Finally got the Nexus 5. The camera is way better than my old phone!', photo: 1, plus: 12},
    {id: 'p2', name: 'Android', time: '5h', text: 'Meet Android 4.4, KitKat: smart, simple and truly yours.', photo: 4, plus: 2381},
    {id: 'p3', name: 'Taylor Lee', time: 'Yesterday', text: 'Slides from the meetup are up on Drive. Thanks everyone for coming!', photo: null, plus: 7}
  ];
  function gplus(ctx) {
    const plused = ctx.data.gplusPlus || [];
    // Google+ 4.2.3 (KTU84P): host_action_bar.xml on ab_solid_light_holo with ic_gplus_red_32 and the stream spinner, the
    // bell notifications button (ic_notifications_20 with notification_count_background: #dd4b39, a 1 dp #dddddd stroke,
    // 3 sp corners, 11 dp white) and the overflow; compose_bar.xml at the bottom shows Photo, Location and Write in
    // #427fed / #b23424 / #3e802f (Hangout and Mood start hidden).
    const g = key => S(ctx, 'gplus', key);
    const compose = [['Photo', 'ic_camera_active', '#427fed'], ['Location', 'ic_location_active', '#b23424'], ['Write', 'ic_text_active', '#3e802f']].map(([key, icon, color]) => `<button data-action="sa-unsupported" style="color:${color}"><img src="assets/gp42-${icon}.png" alt="">${e(g(key))}</button>`).join('');
    return `<div class="app-view sa-app sa-gplus">${bar(ctx, {title: g('Home'), subtitle: ctx.t('All'), icon: 'gp42-ic_gplus_red_32.png', actions: '<button class="sa-gp-bell" data-action="sa-unsupported" aria-label="Notifications"><img src="assets/gp42-ic_notifications_20.png" alt=""><b>2</b></button>' + btn('sa-menu', ctx.t('More options'), 'overflow')})}<div class="sa-scroll sa-stream">${POSTS.map((p, i) => `<article class="sa-post">${avatar(p.name, i)}<div class="sa-post-head"><b>${e(p.name)}</b><small>${e(ctx.t(p.time))}</small></div><p>${e(p.text)}</p>${p.photo !== null ? `<div class="sa-post-photo">${thumb(p.photo)}</div>` : ''}<footer><button class="sa-plus${plused.includes(p.id) ? ' on' : ''}" data-action="gplus-plus" data-id="${p.id}">+1 <span>${p.plus + (plused.includes(p.id) ? 1 : 0)}</span></button><button data-action="sa-unsupported" aria-label="Reshare"><img src="assets/gp42-ic_reshare_16.png" alt=""></button></footer></article>`).join('')}</div><nav class="sa-gp-compose">${compose}</nav></div>`;
  }

  // Earth 7.1.3 (KTU84P): Theme.Earth (Holo, overlay action bar on header_bar_bg_80_percent_black, #cc000000) with
  // res/menu-v11/main.xml. On phones EarthActivity.onCreateOptionsMenu shows every item but the sensors button and Fly
  // to, and Clear map only when there is something to clear. ActionMenuPresenter allows three buttons at 360 dp and up
  // and keeps one for the overflow: Search (always, expands to "Example: Pizza") and Reset to north (ifRoom) are in the
  // bar; Clear map, My location, Share, Settings, Feedback, Help and Tutorial are in the overflow.
  function earthBar(ctx) {
    const ea = key => S(ctx, 'earth', key);
    const search = ctx.ui.earthSearching ? `<form class="sa-earth-field" data-form="earth-search"><input name="query" autocomplete="off" placeholder="${e(ea('Example: Pizza'))}" aria-label="${e(ea('Search'))}"></form>` : img('earth-search-open', ea('Search'), 'ea7-ic_menu_search_holo_dark.png');
    return `<header class="sa-bar dark sa-earth-bar"><button class="sa-up" data-action="${ctx.ui.earthSearching ? 'earth-search-close' : 'home'}" aria-label="${e(ea('Earth'))}"><img src="assets/earth.png" alt=""></button><span class="sa-title"><b>${ctx.ui.earthSearching ? '' : e(ctx.ui.earthQuery || ea('Earth'))}</b></span>${search}${img('sa-unsupported', ea('Reset to north'), 'ea7-ic_menu_northup.png', 'tall')}${btn('sa-menu', ctx.t('More options'), 'overflow')}</header>`;
  }
  function earth(ctx) {
    return `<div class="app-view sa-app sa-earth"><div class="sa-stars"></div><div class="sa-globe">${'<svg viewBox="0 0 200 200" aria-hidden="true"><defs><radialGradient id="sa-gl" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#6fb4ff"/><stop offset=".55" stop-color="#1c5fb8"/><stop offset="1" stop-color="#05173d"/></radialGradient><clipPath id="sa-gc"><circle cx="100" cy="100" r="92"/></clipPath></defs><circle cx="100" cy="100" r="96" fill="#6fb4ff" opacity=".18"/><circle cx="100" cy="100" r="92" fill="url(#sa-gl)"/><g clip-path="url(#sa-gc)"><g class="sa-land" fill="#4f8f3e"><path d="M10 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M90 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M80 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/><path d="M210 60c20-14 44-10 52 4s-8 26-2 40-20 30-36 22-26-48-14-66z"/><path d="M290 96c16-6 38 2 44 22s-8 40-26 46-24-12-18-30-16-30 0-38z"/><path d="M280 24c12-4 28 2 30 12s-16 10-24 6-18-16-6-18z"/></g><g fill="#fff" opacity=".55"><ellipse cx="60" cy="140" rx="30" ry="6"/><ellipse cx="140" cy="60" rx="24" ry="5"/></g></g><circle cx="100" cy="100" r="92" fill="none" stroke="#9cd0ff" stroke-opacity=".5" stroke-width="2"/></svg>'}</div>${earthBar(ctx)}</div>`;
  }

  // ---- News & Weather (2013, Holo dark): Weather, Top Stories and topics ----
  const STORIES = {
    'Top Stories': [['Android 4.4.4 rolls out to Nexus devices', 'Tech Daily', '2 hours ago'], ['City marathon draws record crowd', 'Metro News', '4 hours ago'], ['Researchers map the ocean floor in 3D', 'Science Today', '6 hours ago']],
    'Technology': [['KitKat runs on phones with 512 MB of RAM', 'Gadget Weekly', '1 hour ago'], ['Smart watches: the next big thing?', 'Droid Corner', '3 hours ago']],
    'Sports': [['Underdogs win the cup final', 'Sports Desk', '5 hours ago']]
  };
  // News & Weather 1.3.11 (GenieWidget.apk, KTU84P): the ActionBar style (#222222, ic_launcher_news_weather) with
  // main_menu.xml (Refresh in the bar, Settings in the overflow); tab_view_container_layout.xml's 52 dp tabs (12 sp,
  // 35 dp padding, #222222, a 6 dp #33b5e5 bottom when selected, 1 dp #505050 otherwise, 1 dp #505050 separators);
  // news_item_layout.xml rows (80 dp, 16 sp bold white title, 14 sp #bfbfbf snippet, the 70 dp picture on the right)
  // on #1a1a1a; weather_current_view.xml in bg_weather_panel_app: the city (30 sp) with the info button, today's
  // ic_weather_*_xl (90 dp) and temperature (80 sp), high / low (21 sp), conditions, humidity and wind (12 sp), The
  // Weather Channel's logo, then weather_forecast_layout.xml's days (15 sp, 30 dp icons).
  function news(ctx) {
    const n = key => S(ctx, 'news', key), NP = window.NewsPrefs, standard = ['Top Stories', 'Technology', 'Sports'];
    const newsBar = title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark', actions: btn('sa-menu', ctx.t('More options'), 'overflow')});
    if (ctx.ui.newsSub === 'settings') return NP.render({data: ctx.data, ui: ctx.ui, lang: ctx.lang, locale: ctx.locale, N: n, t: ctx.t, standard, topic: name => ctx.t(name), version: '1.3.11', bar: title => bar(ctx, {title, up: true, icon: 'news-weather.png', cls: ' dark'})});
    const [storyTab, storyIndex] = String(ctx.ui.newsStory || '').split(':'), story = ctx.ui.newsSub === 'story' && STORIES[storyTab]?.[Number(storyIndex)];
    if (story) return `<div class="app-view sa-app sa-news nw-story-view">${newsBar(story[0])}<div class="sa-scroll">${NP.story({title: story[0], source: story[1], time: ctx.t(story[2]), picture: Number(storyIndex) === 0 ? `<span class="nwp-picture">${thumb(2)}</span>` : ''})}</div></div>`;
    const metric = NP.metric(ctx.data, ctx.lang), deg = c => `${metric ? c : Math.round(c * 9 / 5 + 32)}°`;
    const tabs = ['Weather', ...NP.topics(ctx.data, standard)], tab = tabs.includes(ctx.ui.newsTab) ? ctx.ui.newsTab : tabs[1] || 'Weather';
    const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], forecast = [[21, 13, 'partly_cloudy'], [23, 14, 'sunny'], [19, 12, 'cloudy'], [20, 11, 'chance_of_rain']];
    const body = tab === 'Weather'
      ? `<div class="nw-weather"><div class="nw-city"><b>${e(NP.city(ctx.data, 'Mountain View'))}</b><button data-action="sa-unsupported" aria-label="Info"><img src="assets/nw-weather_info_btn.png" alt=""></button></div><i class="nw-divider"></i><div class="nw-today"><img class="nw-twc" src="assets/nw-ic_weather_weather_channel.png" alt="The Weather Channel"><div class="nw-now"><img src="assets/nw-ic_weather_partly_cloudy_xl.png" alt=""><b>${deg(21)}</b></div><div class="nw-range"><span>${deg(21)}</span><span class="lo">${deg(13)}</span><p>${e(ctx.t('Partly cloudy'))}</p><small>${e(AndroidStrings.format(n('Humidity: %s%%'), 60))}</small><small>${e(AndroidStrings.format(n('Wind: %1$s %2$s'), metric ? '13' : '8', n(metric ? 'km/h' : 'mph')))}</small></div></div><i class="nw-divider"></i><div class="nw-forecast">${forecast.map(([hi, lo, icon], i) => `<div><span>${e(n(DAYS[new Date(ctx.now.getTime() + i * 864e5).getDay()]))}</span><img src="assets/nw-ic_weather_${icon}_s.png" alt=""><b>${deg(hi)}</b><small>${deg(lo)}</small></div>`).join('')}</div></div>`
      : STORIES[tab] ? `<div class="nw-list">${STORIES[tab].map(([title, source, time], i) => `<button class="nw-item${i === 0 ? ' pic' : ''}" data-action="news-story" data-id="${e(tab)}:${i}"><span><b>${e(title)}</b><small>${e(source)} - ${e(ctx.t(time))}</small></span>${i === 0 ? `<span class="nw-pic">${thumb(i + 2)}</span>` : ''}</button>`).join('')}</div>` : `<p class="nw-unavailable">${e(n("News isn't available right now."))}</p>`;
    return `<div class="app-view sa-app sa-news">${bar(ctx, {title: n('News & Weather'), icon: 'news-weather.png', cls: ' dark', actions: img('sa-news-refresh', n('Refresh'), 'nw-navigation_refresh.png') + btn('sa-menu', ctx.t('More options'), 'overflow')})}<nav class="nw-tabs">${tabs.map(id => `<button class="${id === tab ? 'on' : ''}" data-action="news-tab" data-id="${e(id)}"${id === 'Weather' || standard.includes(id) ? '' : ' data-no-translate'}>${e(id === 'Weather' ? n('Weather') : standard.includes(id) ? ctx.t(id) : id)}</button>`).join('')}</nav><div class="sa-scroll">${body}</div></div>`;
  }

  const APPS = {'google-search': (ctx) => ctx.ui.sub === 'settings' ? searchSettings(ctx) : ctx.ui.sub === 'reminders' ? window.GELNow.reminders({data: ctx.data, t: ctx.t, locale: ctx.locale, now: ctx.now, ui: ctx.ui}) : google(ctx), 'voice-search': voice, maps, drive, keep, youtube, 'google-plus': gplus, earth, 'news-weather': news, 'google-settings': googleSettings, 'google-search-settings': searchSettings};
  function render(app, ctx) { return (APPS[app] || google)(ctx); }
  const SIMPLE = ['google-search', 'voice-search', 'maps', 'drive', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'];
  const DEFAULT_NOTES = [{id: 'k1', text: 'Buy concert tickets', color: 0}, {id: 'k2', text: 'Groceries: milk, eggs, KitKat', color: 1}, {id: 'k3', text: 'Call Mom on Sunday', color: 2}];
  // The overflow of the screen on show. GenieWidget 1.3.11 (KTU84P) res/menu/main_menu.xml: Refresh (navigation_refresh) always in the bar, Settings in the overflow.
  function menu(view, ctx) {
    // Google+ 4.2: the stream enables Refresh; the host adds Send feedback, Settings, Help and Sign out (dex).
    if (view === 'google-plus') { const g = key => S(ctx, 'gplus', key); return ['Refresh', 'Send feedback', 'Settings', 'Help', 'Sign out'].map(key => ({action: key === 'Refresh' ? 'gplus-refresh' : 'sa-unsupported', title: g(key)})); }
    if (view === 'drive' && ctx.ui?.sub !== 'file') { const d = key => S(ctx, 'drive', key); return ['Add new', 'Refresh', 'Filter by', 'Sort by', 'Settings', 'Product Tour'].map(key => ({action: 'sa-unsupported', title: d(key)})); }
    if (view === 'youtube' && ctx.ui?.sub !== 'video') { const y = key => S(ctx, 'youtube', key); return [{action: 'yt5-settings', title: y('Settings')}, {action: 'sa-unsupported', title: y('Feedback')}, {action: 'sa-unsupported', title: y('Help')}]; }
    if (view === 'keep' && ctx.ui?.sub !== 'note') { const k = key => S(ctx, 'keep', key); return [{action: 'keep-columns', title: k(ctx.data?.keepSingle ? 'Multi-column view' : 'Single-column view')}, {action: 'keep-refresh', title: k('Refresh')}, {action: 'sa-unsupported', title: k('Settings')}, {action: 'sa-unsupported', title: k('Send feedback')}, {action: 'sa-unsupported', title: k('Help')}]; }
    if (view === 'keep') { const k = key => S(ctx, 'keep', key), note = (ctx.data?.keepNotes || []).find(n => n.id === ctx.ui.keepNote); return [{action: 'keep-archive', title: k(note?.archived ? 'Unarchive' : 'Archive')}, {action: 'keep-delete', title: k('Delete')}, {action: 'keep-checkboxes', title: k(note?.list ? 'Hide checkboxes' : 'Show checkboxes')}, {action: 'sa-unsupported', title: k('Share…')}, {action: 'sa-unsupported', title: k('Settings')}, {action: 'sa-unsupported', title: k('Send feedback')}, {action: 'sa-unsupported', title: k('Help')}]; }
    if (view === 'earth') { const ea = key => S(ctx, 'earth', key); return (ctx.ui?.earthQuery ? [{action: 'earth-clear', title: ea('Clear map')}] : []).concat(['My location', 'Share', 'Settings', 'Feedback', 'Help', 'Tutorial'].map(key => ({action: 'sa-unsupported', title: ea(key)}))); }
    // webview_menu.xml on a story (Share story); main_menu.xml's Settings otherwise, none on the settings themselves.
    if (view === 'news-weather') return ctx.ui?.newsSub === 'settings' ? [] : ctx.ui?.newsSub === 'story' ? [{action: 'news-share', title: S(ctx, 'news', 'Share story')}] : [{action: 'news-settings', title: S(ctx, 'news', 'Settings')}];
    return [];
  }
  window.StockApps = {FILES: FILES0, APPS: SIMPLE, VIDEOS, POSTS, DEFAULT_NOTES, render, menu};
})();
