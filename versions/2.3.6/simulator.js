/* Android 2.3.6 (Nexus S) inspired browser simulation. No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-gb-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // Gingerbread's Launcher2 has no first-run clings (Cling.java came with 4.0).
    wallpaper: 0,
    // The Nexus S image's Launcher2 res/xml/default_workspace.xml (GRK39F): News & Weather; YouTube; the search bar and
    // the home screen tips; Market; Power control. Revision 3 moves older saved desktops onto it once.
    layoutRevision: 3,
    homePages: Array.from({length: 5}, () => Array(16).fill(null)),
    homeWidgets: [
      [{ id: 'default-news', type: 'news-weather', x: 0, y: 0 }],
      [{ id: 'default-youtube', type: 'youtube', x: 0, y: 0 }],
      [{ id: 'default-search', type: 'search', x: 0, y: 0 }, { id: 'default-protips', type: 'protips', x: 0, y: 3 }],
      [{ id: 'default-market', type: 'market', x: 1, y: 1 }],
      [{ id: 'default-power', type: 'power', x: 0, y: 0 }]
    ],
    liveWallpaper: { id: 'nexus' },
    protips: { index: 0, set: 0 },
    dock: ['phone', 'people', 'apps', 'messaging', 'browser'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false },
    contacts: [
      { id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com' },
      { id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com' },
      { id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com' },
      { id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com', favorite: true }
    ],
    // A used phone's call log: yesterday's call with Mom, then a missed call from Alex and the call back.
    callHistory: [
      { number: '202-555-0107', time: Date.now() - 26 * 3600000, duration: 754, connected: true, type: 'incoming' },
      { number: '202-555-0148', time: Date.now() - 3 * 3600000, duration: 0, connected: false, type: 'missed' },
      { number: '202-555-0148', time: Date.now() - 2.6 * 3600000, duration: 132, connected: true, type: 'outgoing' }
    ],
    demoCalls: 1,
    contactGroups: [{id:'friends',name:'Friends',members:[1,2,3]},{id:'family',name:'Family',members:[4]}],
    messages: [
      { id: 1, contact: 1, body: 'Hey! Are we still on for coffee tomorrow?', mine: false, time: '10:42' },
      { id: 2, contact: 1, body: 'Absolutely. See you at 11!', mine: true, time: '10:45' },
      { id: 3, contact: 4, body: 'Don’t forget to call this weekend ☺', mine: false, time: 'Yesterday' }
    ],
    photos: [
      { id: 1, name: 'Mountain afternoon', colors: ['#96c8d0', '#e8ad7a', '#364e59'] },
      { id: 2, name: 'City lights', colors: ['#223850', '#ce6979', '#101d32'] },
      { id: 3, name: 'By the sea', colors: ['#67aab6', '#f3d3a0', '#21617a'] },
      { id: 4, name: 'Sunset', colors: ['#d97475', '#f0bf74', '#4e486b'] }
    ],
    events: [{ id: 1, date: localDate(), title: 'Coffee with Alex', time: '11:00' }],
    alarms: [{ id: 1, time: '07:00', enabled: true }, { id: 2, time: '08:30', enabled: false }],
    bookmarks: ['www.google.com', 'www.android.com', 'en.wikipedia.org/wiki/Android'],
    browserHistory: ['www.google.com'],
    sentEmails: [],
    notifications: [
      { id: 1, title: 'Welcome to Android 2.3.6', detail: 'Your phone is ready to explore.' },
      { id: 2, title: 'New message from Alex', detail: 'See you at 11!' }
    ]
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  // state.js reads the save: unreadable JSON is kept aside, a field of the wrong kind takes its default alone, and an
  // error in one of the upgrade steps below is reported by name while the others still run.
  function load() {
    return AndroidState.load(STORE, defaultData, saved => ({ ...clone(defaultData), ...saved, settings: { ...defaultData.settings, ...saved.settings } }), [
      // The demo's call log and starred Mom came on 2026-11-23: a save made before gets them once (a log the visitor
      // already has and a contact they starred or unstarred stay as they are).
      ['demo call log and starred Mom', (result, saved) => {
        if (saved.demoCalls) return;
        if (!Array.isArray(saved.callHistory) || !saved.callHistory.length) result.callHistory = clone(defaultData.callHistory);
        const mom = result.contacts?.find(person => person.id === 4 && person.phone === '202-555-0107');
        if (mom && !result.contacts.some(person => person.favorite)) mom.favorite = true;
        result.demoCalls = 1;
      }],
      ['old third page shortcuts', (result, saved) => {
        if (JSON.stringify(result.homePages?.[2]) === JSON.stringify([null,null,null,null,null,null,null,null,'calendar','gallery','settings','music'])) result.homePages[2] = clone(defaultData.homePages[2]);
      }],
      ['pages of 12 cells to 16', (result, saved) => {
        result.homePages = result.homePages.map(page => page.length === 12 ? [null, null, null, null, ...page] : page);
      }],
      ['missing widget pages', (result, saved) => {
        if (!Array.isArray(saved.homeWidgets)) result.homeWidgets = clone(defaultData.homeWidgets);
      }],
      // Replace only the untouched old demo layout; preserve customized desktops.
      ['layout revision 2', (result, saved) => {
        if (!saved.layoutRevision) {
          const oldShortcuts = [['calendar','music',null,null],['camera','gallery','email',null],['camera',null,null,'google'],['email','camera','clock',null],['calculator','settings',null,null]].map(items => [...Array(12).fill(null), ...items]);
          const oldWidgets = ['digital','weather','analog','music','calendar'].map((type, i) => [{id: ['default-clock','default-weather','default-analog','default-music','default-calendar'][i], type, x: 1, y: 0}]);
          if (JSON.stringify(result.homePages) === JSON.stringify(oldShortcuts) && JSON.stringify(result.homeWidgets) === JSON.stringify(oldWidgets)) {
            result.homePages = clone(defaultData.homePages);
            result.homeWidgets = clone(defaultData.homeWidgets);
          } else result.homeWidgets.flat().forEach(widget => { widget.width = 2; widget.height = 2; });
          result.layoutRevision = 2;
        }
      }],
      ['layout revision 3', (result, saved) => {
        if ((saved.layoutRevision || 0) < 3) { result.homePages = clone(defaultData.homePages); result.homeWidgets = clone(defaultData.homeWidgets); result.layoutRevision = 3; }
      }],
      // Earlier photo frames were 2 × 2 and showed the first picture; keep their footprint.
      ['old photo frame size', (result, saved) => {
        result.homeWidgets.flat().forEach(widget => { if (widget?.type === 'photo' && !('source' in widget) && !widget.width) { widget.width = 2; widget.height = 2; } });
      }],
      // Picture frames hold one picture. (The inherited ICS calendar widgets went with the revision 3 reset; 'calendar' is
      // now CalendarProvider's agenda widget.)
      ['photo frame size', (result, saved) => {
        result.homeWidgets = result.homeWidgets.map(page => Array.isArray(page) ? page.map(widget => widget?.type === 'photo' ? {...widget, width: 2, height: 2} : widget) : page);
      }],
      // A reload during Gallery widget configuration leaves no completed choice.
      ['unfinished photo frame', (result, saved) => {
        result.homeWidgets = result.homeWidgets.map(page => Array.isArray(page) ? page.filter(widget => widget && !(widget.type === 'photo' && widget.source === null)) : []);
      }],
      ['custom wallpaper slot', (result, saved) => {
        if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 99;
      }]
    ]);
  }
  let data = load();
  AndroidState.onProblem(problem => setTimeout(() => toast(i18n.t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
  data.settings={...ICSSystemSettings.defaults,...data.settings};
  ICSLockscreen.initialize(data);
  function save() { AndroidState.save(STORE, data); }
  const ui = {
    view: 'home', sub: '', page: 2, drawerTab: 'apps', drawerPage: 0, overlay: '',
    selectedContact: 1, thread: 1, selectedPhoto: 1,
    dial: '', callNumber: '', aboutTaps: 0, buildTaps: 0, settingsRootScroll: 0,
    browserUrl: data.browserHistory.at(-1) || 'www.google.com', browserHistory: [...data.browserHistory], browserIndex: data.browserHistory.length - 1, browserTabs: [data.browserHistory.at(-1) || 'www.google.com'], browserTab: 0,
    calendarMode: ['Day','Week','Month','Agenda'].includes(data.calendarMode)?data.calendarMode:'Month', selectedDate: localDate(ICSSystemSettings.wallDate(data)),
    phoneTab: 'dialpad',
    play: ICSPlayStore.initial(), playHistory: [],
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const tracks = ICSMusic.tracks;
  // Email's demo mailbox (gb-email.js).
  const emailData = GB.module('email').demo;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  syncBrowserState();
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'Contacts', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Market', '▶', '#b5d26d', '#53732f'], ['search', 'Google Search', '⌕', '#9ad0f0', '#3a7fb0'],
    ['downloads', 'Downloads', '⇩', '#9fd36a', '#4f8a2a'],
    // The Nexus S image's Google apps (gb-apps.js registers their screens).
    ['gmail', 'Gmail', '✉', '#e8e8e8', '#c33'], ['maps', 'Maps', '⌖', '#cde5b4', '#4a77a8'], ['navigation', 'Navigation', '▲', '#4a77a8', '#1c3f9a'],
    ['places', 'Places', '⌖', '#db4437', '#a32'], ['latitude', 'Latitude', '☺', '#4a77a8', '#1c3f9a'], ['talk', 'Talk', '✆', '#5b9bd5', '#2f6ea8'], ['youtube', 'YouTube', '▶', '#e62117', '#b31217'],
    ['news-weather', 'News & Weather', '☀', '#f5b041', '#2a6fdb'], ['books', 'Books', '▤', '#4285f4', '#1a73e8'], ['earth', 'Earth', '◍', '#1c5fb8', '#05173d'], ['voice-search', 'Voice Search', '🎤', '#eee', '#999'],
    ['car-home', 'Car Home', '◉', '#333', '#000'], ['google-voice', 'Voice', '✆', '#3c78d8', '#1c4587'], ['tags', 'Tags', '▭', '#ddd', '#888'], ['voice-dialer', 'Voice Dialer', '🎤', '#3dc484', '#217258']
  ];
  // crespo overlay packages/apps/Launcher2 res/values-hdpi/wallpapers.xml, in its order; 960 x 800 images span two screens.
  const wallpaperFiles = ['street_lights','stream','phasebeam','pulse','nexusrain','stars','canyon','grass','zanzibar','cloud','monumentvalley','mountains','sunset','goldengate','shuttle'];
  // The 2.3.6 widget providers (AppWidgetPickActivity, sorted by label): the AOSP and Market ones, then the Google apps'
  // (Calendar's comes from CalendarProvider, Latitude and Traffic from Maps, the two Voice ones from Google Voice).
  const widgetTypes = [...GBWidgets.PROVIDERS, ...GBGoogleWidgets.PROVIDERS].sort((a, b) => a.label.localeCompare(b.label, 'en')).map(p => ({type: p.type, name: p.label, app: p.app, width: p.width, height: p.height}));
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const iconAssets = new Set(['car-home', 'google-voice', 'tags', 'voice-dialer', 'gmail', 'maps', 'navigation', 'places', 'latitude', 'talk', 'youtube', 'news-weather', 'books', 'earth', 'voice-search', 'phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps', 'search', 'downloads']);
  const i18n = window.AndroidI18n;
  const appNames = Object.fromEntries(apps.map(app => [app[0], app[1]]));
  appNames.google = 'Google';
  /* The store apps that work (docs/plans/play-apps.md, store-apps/legacy-host.js): the store's installed ones join the
     launcher's apps (icon assets/<id>.png) while installed, open as StoreHost modules, and leave with their icons and
     data when uninstalled. */
  function storeAppsSync() {
    const want = (data.marketInstalled || []).map(id => StoreHost.runtime(id)).filter(Boolean);
    for (const id of want) if (!apps.some(a => a[0] === id)) { const m = StoreHost.module(id); apps.push([id, m.title, '', m.color || '#888', m.dark || '#444']); appNames[id] = m.title; iconAssets.add(id); }
    for (let i = apps.length - 1; i >= 0; i--) if (String(apps[i][0]).startsWith('store-') && !want.includes(apps[i][0])) { delete appNames[apps[i][0]]; apps.splice(i, 1); }
  }
  storeAppsSync();
  // Gingerbread's own AlertDialog (GBUI.dialog) and the Menu key's IconMenu (GBUI.menu) for the store apps.
  function storeContext() {
    return StoreHost.context({data, ui, save, render, renderOverlay, toast, openApp, screen, viewport, dp, snapResting, suppressClick: ms => { suppressClickUntil = Date.now() + ms; },
      // 2.3.6's own AlertDialog (a spec the module's dialog(kind, c) returns) and the Menu key's IconMenu items.
      saveMusic, deviceDate, today, home, cancelPhotoWidget, composeEmail, messageDraft, gapp: () => gappContext(), gbCapture, gbmaCancel, gbmaReturn, gbceReturn, back, contact, contactByPhone, captureRecentView, appName: id => appNames[id] || id, startPhoneCall, editPerson, clock, blinkTips, renderStatus, apps, appNames, appIcon, carrierName, gbClock, lockControls, navigateBrowser, clearAppData, resetSimulator, storeUninstall, storeInstalled, storeAppsSync, defaults: defaultData, clone, overlayRoot, suppressRelease: () => suppressReleaseClick(),
      appList: () => apps.map(app => [app[0], i18n.t(app[1])]), browserTitle: gbBrowserTitle, contactName: id => contact(id)?.name, normalizeAddress,
      intent: {browse(url) { openApp('browser'); navigateBrowser(url); }, contact(id) { openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; render(); }, thread: id => openMessageThread(id),
        track(i) { openApp('music'); ui.music.queue = ICSMusic.tracks.map((_, n) => n); ui.music.track = i; ui.music.position = 0; ui.music.playing = true; saveMusic(); ui.sub = 'player'; render(); }},
      gbDialog(kind) { ui.gbModuleDialog = kind; ui.overlay = 'gb-dialog-module'; renderOverlay(); }, gbMenu(items) { if (!items?.length) return; ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); }, notify: (title, text) => addNotification(title, text), lang: i18n.language, locale: i18n.locale(), safe, t: key => i18n.t(key),
      dialogMarkup: d => GBUI.dialog({title: d.title, message: d.message, custom: d.html, items: d.items?.map((title, i) => ({title, action: 'sth-item', id: i})), buttons: (d.buttons || []).map((b, i) => ({title: b.label, action: 'sth-btn', id: i})), cancel: 'sth-cancel', noTranslate: true, t: key => i18n.t(key)}),
      menu: items => { ui.gbMenuItems = items.map((it, i) => ({action: 'sth-mi', id: i, title: it.label, icon: it.icon, disabled: it.disabled})); ui.overlay = 'gb-menu-settings'; renderOverlay(); },
      closeMenu: () => closeGBMenu()});
  }
  StoreHost.provide(storeContext);
  // The view's module is in front, unless the app's settings screen (GBPrefs, Menu › Settings) is open over it.
  const prefsOpen = () => !!ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view;
  const moduleView = () => StoreHost.has(ui.view) && !prefsOpen();
  // Installed from the store: the app joins the launcher and, with the store's shortcut setting on, the home screen.
  function storeInstalled(id) { const r = StoreHost.runtime(id); if (!r) return; storeAppsSync(); if (false) placeShortcut(r, appNames[r]); }
  // Uninstalled (the store or Settings › Apps): the app, its icons and its data go.
  function storeUninstall(id) {
    data.marketInstalled = (data.marketInstalled || []).filter(x => x !== id);
    const r = StoreHost.runtime(id); if (!r) return;
    StoreHost.module(r).clearData?.(storeContext());
    data.homePages = data.homePages.map(page => page.map(x => x === r ? null : x));
    if (Array.isArray(data.dock)) data.dock = data.dock.map(x => x === r ? null : x);
    for (const f of Object.values(data.folders || {})) if (Array.isArray(f.items)) f.items = f.items.filter(x => x !== r);
    ui.recent = (ui.recent || []).filter(x => x !== r);
    if (ui.view === r) { ui.view = 'home'; ui.sub = ''; }
    storeAppsSync();
  }
  ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
  const screen = document.querySelector('#screen');
  // dp → CSS px now: the display is 320 dp wide (276 px in the desktop frame, the whole width on a phone).
  const dp = n => n * screen.clientWidth / 320;
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  // The wallpaper window: a live wallpaper draws here, behind the status bar, the launcher and the keyguard.
  const liveLayer = document.createElement('div'); liveLayer.id = 'live-wallpaper'; liveLayer.hidden = true; screen.prepend(liveLayer);
  let liveWallpaper = null, liveOffsetTween = 0;
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const deviceDate = () => ICSSystemSettings.wallDate(data);
  const today = () => localDate(deviceDate());
  const clock = () => deviceDate().toLocaleTimeString(i18n.locale(), { hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24 });
  const fullDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'long', month: 'long', day: 'numeric' });
  const shadeDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'short', month: 'short', day: 'numeric' });
  const contact = id => data.contacts.find(item => item.id === Number(id));
  const appIcon = id => {
    if (id === 'play-store') return '<span class="app-icon"><img src="assets/gbm234-ic_launcher_androidmarket.png" alt=""></span>';
    if (id === 'apps') return '<span class="app-icon"><img src="assets/apps.png" alt=""></span>';
    if (id === 'search') return '<span class="app-icon"><img src="assets/google-search.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(data,id);
    // FolderIcon: ic_launcher_folder, or ic_launcher_folder_open while the folder is open; live folders use the provider's icon.
    if(folder)return `<span class="app-icon"><img src="assets/gb-${folder.live?`ic_launcher_folder_live_contacts${folder.live==='all'?'':folder.live==='phone'?'_phone':'_starred'}`:`l2-ic_launcher_folder${ui.overlay==='folder'&&ui.folderId===id?'_open':''}`}.png" alt=""></span>`;
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const liveNames={all:'All contacts',starred:'Starred contacts',phone:'Contacts with phone numbers'};
  const folderName=id=>{const folder=ICSLauncherFolders.folder(data,id);return folder?.name||i18n.t(folder?.live?liveNames[folder.live]:'Folder');};
  const launcherIcon = id => ICSLauncherFolders.folder(data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;ui.gbPasswordEntry=false;home(false);},gb:()=>({...GBKeyguard.time(deviceDate(),!!data.settings.hour24),date:gbLockDate()})});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/stat_sys_alarm.png" alt="">' : ''}${data.settings.wifi && data.settings.wifiNetwork ? '<img src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;

  // Gingerbread status bar: one 25 dp icon per notification on the left, config_statusBarIcons on the right.
  const noteIcon = n => n.id === 2 ? 'gb-app-mms-stat_notify_sms.png' : n.kind === 'calendar' ? 'gb-app-calendar-stat_notify_calendar.png' : n.kind === 'alarm' ? 'gb-app-deskclock-stat_notify_alarm.png' : n.kind === 'market-dl' ? 'gb-stat_sys_download_anim0.png' : n.kind === 'market' ? 'gb-stat_sys_download_anim5.png' : 'gb-stat_sys_adb.png';
  // Clock.java: twelve_hour_time_format h:mm a with AM_PM_STYLE_GONE, or H:mm.
  const gbClock = () => { const now = deviceDate(), h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'); return `${data.settings.hour24 ? h : h % 12 || 12}:${m}`; };
  let seenNotes = null, stopTicker = null;
  function renderStatus() {
    const icons = data.notifications.map(noteIcon);
    icons.unshift(...GBNetwork.statusIcons(gbNetContext()));
    if (ui.activeCall) icons.unshift(ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png');
    GBStatusBar.bar(statusRoot, {
      label: i18n.t('Open notifications'), notifications: icons, clock: gbClock(), expanded: ui.overlay === 'shade',
      date: deviceDate().toLocaleDateString(i18n.locale(), {year: 'numeric', month: 'long', day: 'numeric'}),
      state: {bluetooth: data.settings.bluetooth, ringer: data.settings.silent ? (data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent') : '', airplane: data.settings.airplane, wifi: data.settings.wifi && !!data.settings.wifiNetwork, data: data.settings.mobileData === false || data.settings.dataEnabled === false ? '' : '3g', battery: 78, alarm: data.alarms.some(alarm => alarm.enabled)}
    });
    // Ticker: newly posted notifications scroll through the bar once (tickerText = the notification title).
    const ids = new Set(data.notifications.map(n => n.id));
    const fresh = seenNotes ? data.notifications.filter(n => !seenNotes.has(n.id)) : [];
    seenNotes = ids;
    if (fresh.length && !ui.sleeping) { stopTicker?.(); stopTicker = GBStatusBar.ticker(statusRoot, fresh.reverse().map(n => ({icon: noteIcon(n), text: n.title})), () => { stopTicker = null; }); }
  }
  // Nexus S capacitive keys under the glass (Back, Menu, Search, Home). Long-pressing Home shows the recent apps.
  const touchGlyphs = {
    back: '<path d="M8.5 5.5 5 9l3.5 3.5M5.5 9H15a4.5 4.5 0 0 1 0 9H8"/>',
    menu: '<path d="M9 6h11M4 10h16M4 14h16M4 18h16"/>',
    search: '<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5.5 5.5"/>',
    home: '<path d="M2.5 12.5 12 4.5l9.5 8M6 10.5V19h12v-8.5"/>'
  };
  function renderNav() {
    const keys = [['back', 'back', 'Back'], ['menu', 'menu-key', 'Menu'], ['search', 'search-key', 'Search'], ['home', 'home', 'Home']];
    navRoot.innerHTML = keys.map(([glyph, action, label]) => `<button class="touch-key touch-${glyph}" data-action="${action}" aria-label="${safe(i18n.t(label))}"><svg viewBox="0 0 24 24" aria-hidden="true">${touchGlyphs[glyph]}</svg></button>`).join('');
    if (ui.locked) navRoot.querySelectorAll('.touch-home,.touch-search').forEach(button => { button.disabled = true; button.setAttribute('aria-hidden', 'true'); });
  }
  // PowerManagerService: user activity turns the button backlight on; it goes off LONG_KEYLIGHT_DELAY (6 s) later.
  let keylightTimer = 0;
  function pokeKeylight() {
    if (ui.sleeping) return;
    navRoot.classList.add('lit'); clearTimeout(keylightTimer);
    keylightTimer = setTimeout(() => navRoot.classList.remove('lit'), 6000);
  }
  // The Menu key toggles the current screen's options panel; screens without a menu ignore it.
  function menuKey() {
    if (ui.overlay.startsWith('gb-menu') || overlayRoot.querySelector('.gbmenu')) { closeGBMenu(); return; }
    if (ui.overlay === 'shade') return;
    if (ui.view === 'home' && !ui.overlay) { ui.overlay = 'gb-menu-home'; renderOverlay(); return; }
    if (ui.view === 'drawer') return;
    if (moduleView()) { StoreHost.menuKey(storeContext()); return; }
    if (GBApps.has(ui.view)) { GBApps.get(ui.view).keep?.(gappContext()); const items = GBApps.get(ui.view).menu?.(gappContext()) || []; if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view) { const items = GBPrefs.menu(gbPrefsContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    const button = [...viewport.querySelectorAll('[data-action$="-menu"]')].find(node => !node.disabled);
    button?.click();
  }
  function closeGBMenu() {
    const panel = overlayRoot.querySelector('.gbmenu');
    if (!panel || reducedMotion?.matches) { ui.overlay = ''; renderOverlay(); return; }
    panel.classList.add('closing');
    setTimeout(() => { if (overlayRoot.contains(panel)) { ui.overlay = ''; renderOverlay(); } }, 150);
  }
  // Launcher.onCreateOptionsMenu: Add, Manage apps, Wallpaper / Search, Notifications, Settings.
  const launcherMenu = () => [
    {action: 'gb-add', title: i18n.t('Add'), icon: 'ic_menu_add'},
    {action: 'settings-open', id: 'apps', title: i18n.t('Manage apps'), icon: 'ic_menu_manage'},
    {action: 'gb-wallpaper', title: i18n.t('Wallpaper'), icon: 'ic_menu_gallery'},
    {action: 'browser-search', title: i18n.t('Search'), icon: 'ic_search_category_default'},
    {action: 'gb-notifications', title: i18n.t('Notifications'), icon: 'ic_menu_notifications'},
    {action: 'open-app', app: 'settings', title: i18n.t('Settings'), icon: 'ic_menu_preferences'}
  ];
  // Holo options menus inherited from ICS become Gingerbread icon menus; known commands get their 2.3 menu icons.
  const menuIcons = {Refresh: 'ic_menu_refresh', Forward: 'ic_menu_forward', 'New tab': 'ic_menu_new_window', 'New window': 'ic_menu_new_window', Bookmark: 'ic_menu_add_bookmark', Bookmarks: 'ic_menu_bookmarks', Windows: 'ic_menu_windows', Settings: 'ic_menu_preferences', Share: 'ic_menu_share', Delete: 'ic_menu_delete', Search: 'ic_menu_search', Help: 'ic_menu_help', Edit: 'ic_menu_edit', 'Find on page': 'ic_menu_search', 'Saved pages': 'ic_menu_archive', 'Save for offline reading': 'ic_menu_save', 'New message': 'ic_menu_compose', Compose: 'ic_menu_compose', 'Add contact': 'ic_menu_add', 'New contact': 'ic_menu_add', 'Clear': 'ic_menu_close_clear_cancel', 'Add alarm': 'ic_menu_add', 'Advanced panel': 'ic_menu_more', 'Clear history': 'ic_menu_close_clear_cancel', Accounts: 'ic_menu_account_list', Import: 'ic_menu_upload', Export: 'ic_menu_save', 'Display options': 'ic_menu_view', Groups: 'ic_menu_allfriends', Today: 'ic_menu_today', 'New event': 'ic_menu_add', 'Day': 'ic_menu_day', 'Week': 'ic_menu_week', 'Month': 'ic_menu_month', 'Agenda': 'ic_menu_agenda', Refresh2: 'ic_menu_refresh', 'Party shuffle': 'ic_menu_shuffle', 'Shuffle all': 'ic_menu_shuffle', Library: 'ic_menu_music_library', 'Add to playlist': 'ic_menu_add', 'Set as ringtone': 'ic_menu_set_as_ringtone', 'Slideshow': 'ic_menu_slideshow', Rotate: 'ic_menu_rotate', Crop: 'ic_menu_crop', Details: 'ic_menu_info_details', 'Show on map': 'ic_menu_mapmode', 'Call log': 'ic_menu_recent_history', Contacts: 'ic_menu_allfriends'};
  function gingerbreadMenu() {
    const holo = overlayRoot.querySelector('.holo-menu:not(.gb-keep)');
    if (!holo) return;
    const items = [...holo.querySelectorAll('button')].map(button => ({action: button.dataset.action, id: button.dataset.id, app: button.dataset.app, title: button.textContent.trim(), icon: menuIcons[button.textContent.trim()], disabled: button.disabled}));
    if (!items.length) return;
    ui.gbMenuItems = items;
    overlayRoot.innerHTML = GBUI.menu(items, key => i18n.t(key));
  }
  // Browser.onSearchRequested: the search dialog with the current address; elsewhere it opens on an empty query.
  function searchKey() {
    if (ui.view === 'lock' || ui.locked) return;
    if (ui.view === 'play-store') { ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.gbbr-search input')?.focus(); return; }
    if (ui.view === 'search') { viewport.querySelector('.gbqs-field input')?.focus(); return; }
    if (ui.view !== 'browser') { openSearch({people: 'contacts', messaging: 'messaging', music: 'music'}[ui.view] || ''); return; }
    ui.sub = ''; document.querySelector('.gbbr-title')?.click();
  }
  /* QuickSearchBox SearchActivity: ui.qsb holds the corpus, the query, the selector and the settings page; picked
     suggestions become shortcuts (data.qsbShortcuts) shown for an empty query. */
  function openSearch(corpus = '') {
    openApp('search'); ui.qsb = {corpus, query: '', selecting: false, page: ''}; render();
    viewport.querySelector('.gbqs-field input')?.focus();
  }
  // Application preference screens (GBPrefs): Browser, Calendar and Email settings, stored in data.appPrefs.
  function gbPrefsContext(app = ui.gbPrefs?.app) {
    data.appPrefs ||= {}; data.appPrefs[app] ||= {};
    return {app, lang: i18n.language, values: data.appPrefs[app], pick: ui.gbPick, settings: data.settings, homepage: 'http://www.google.com/', account: ICSEmail.account, name: 'Nexus S', multi: ui.gbMulti, t: key => i18n.t(key), mapsCache: !!data.mapsCache, gmailAccount: GBGmail.ACCOUNT, gmailSync: data.appPrefs['gmail-sync'] || {}, servers: data.appPrefs['email-servers'] || {}};
  }
  function gbPrefSet(key, value) { const ctx = gbPrefsContext(); ctx.values[key] = value; save(); }
  // PreferenceActivity keeps its list position while a preference changes.
  function gbPrefRender() { const y = viewport.querySelector('.gbset-list')?.scrollTop || 0; render(); const list = viewport.querySelector('.gbset-list'); if (list) list.scrollTop = y; }
  // Window transitions: the outgoing view is kept in a temporary layer while both animate.
  let lastScene = null, pendingNav = '', activeTransition = null;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  // Settings > Display > Animation (animations_values "00", "01", "11": window then transition scale).
  // Settings > Display > Screen timeout: Settings.apk's screen_timeout_values (ms).
  const SCREEN_TIMEOUT = [15000, 30000, 60000, 120000, 600000, 1800000];
  const animationScale = name => { const level = data.settings.animationLevel ?? GBSettings.DEFAULTS.animationLevel; return name.startsWith('drawer-') ? 1 : name === 'unlock' ? Number(level === 2) : Number(level >= 1); };
  function endTransition() {
    if (!activeTransition) return;
    clearTimeout(activeTransition.timer);
    activeTransition.layers.forEach(layer => layer.remove());
    activeTransition.animations.forEach(animation => animation.cancel());
    screen.classList.remove('transitioning');
    activeTransition = null;
  }
  function startTransition(name, outgoing, incoming) {
    endTransition();
    const spec = ICSTransitions.specs[name], factor = animationScale(name);
    if (!spec || !factor || reducedMotion?.matches || document.hidden) return;
    const box = {top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.offsetWidth, height: viewport.offsetHeight};
    const layer = (className, child) => { const node = document.createElement('div'); node.className = `transition-layer ${className}`; node.setAttribute('aria-hidden', 'true'); node.inert = true; Object.assign(node.style, {top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`}); if (child) node.append(child); screen.insertBefore(node, overlayRoot); return node; };
    const layers = [];
    if (spec.black) layers.push(layer('transition-backdrop'));
    if (outgoing) layers.push(layer(spec.exit.top ? 'transition-over' : 'transition-under', outgoing));
    screen.classList.add('transitioning');
    const animations = [...ICSTransitions.play(outgoing, spec.exit, factor), ...ICSTransitions.play(incoming, spec.enter, factor)];
    activeTransition = {name, factor, start: performance.now(), layers, animations, timer: setTimeout(endTransition, ICSTransitions.length(spec) * factor + 40)};
  }
  /* A nine-patch (border-image) under a transform that is not a whole number of device pixels draws with hairline
     seams at its slice edges, so the resting home page and calculator panel tracks get their percentage offsets rounded
     to device pixels (the percentage stays, so a resize keeps them in place; the px correction is under one pixel). */
  function snapResting(root) {
    const d = window.devicePixelRatio || 1, sel = '.home-pages, .calc-panels';
    for (const el of root.matches?.(sel) ? [root] : root.querySelectorAll(sel)) {
      const m = /^translateX\((?:calc\()?(-?[\d.]+)%(?: ([+-]) ([\d.]+)px\))?\)$/.exec(el.style.transform);
      if (!m) continue;
      const percent = +m[1], px = m[2] === '-' ? -m[3] : +(m[3] || 0), x = el.getBoundingClientRect().width * percent / 100 + px;
      el.style.transform = `translateX(calc(${percent}% + ${(px + Math.round(x * d) / d - x).toFixed(4)}px))`;
    }
  }
  function render() {
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}${(ui.view==='camera'||ui.view==='settings'&&ui.sub==='easter'||ui.view==='car-home'&&!ui.gbPrefs&&data.appPrefs?.['car-settings']?.['settings.hide_statusbar'])&&!ui.locked?' gb-fullscreen':''}`;
    screen.style.background = data.wallpaper === 99 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 99 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#000 url('assets/gb-wallpaper_${wallpaperFiles[data.wallpaper] || 'street_lights'}.jpg') ${ui.page * 25}% center / auto 100% no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav(); syncLiveWallpaper();
    if (ui.view === 'lock') { viewport.innerHTML = renderLock(); attachGBLock(); }
    else if (ui.view === 'home') { viewport.innerHTML = renderHome(); restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    if (GBApps.has(ui.view)) GBApps.get(ui.view).mounted?.(gappContext());
    if (moduleView()) StoreHost.mount(ui.view, storeContext(), viewport);
    snapResting(viewport);
    renderOverlay();
    i18n.translateDOM(screen);
    const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
    lastScene = scene;
    if (transit) startTransition(transit, outgoing, viewport.firstElementChild);
    else if (activeTransition) {
      // A same-screen re-render during a transition continues the incoming animation.
      const elapsed = performance.now() - activeTransition.start;
      ICSTransitions.play(viewport.firstElementChild, ICSTransitions.specs[activeTransition.name].enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
    }
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  function lockScreen(){captureRecentView();lockControls.lock();ui.locked=ICSLockscreen.secure(data);ui.gbPasswordEntry=false;ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
  /* MultiWaveView (keyguard_screen_tab_unlock): targets sit on the ring (radius 135dp), the handle follows the
     finger inside it and snaps to a target within the 60dp hit radius. Release elsewhere returns the handle in
     300 ms (Quart ease-out), fades the targets after 200 ms over 1200 ms, then pings the right chevrons
     (three, 160 ms apart, 850 ms Quad ease-out, scale 0.5 -> 2, alpha 1 -> 0). */
  const lockWave = {radius: 112, hit: 54};
  function lockPing() {
    const chevrons = [...viewport.querySelectorAll('.lock-chevron')];
    if (!chevrons.length || reducedMotion?.matches) return;
    chevrons.forEach((chevron, index) => {
      chevron.getAnimations().forEach(animation => animation.cancel());
      chevron.animate([{transform: 'translateX(39px) scale(.5)', opacity: 1}, {transform: `translateX(${lockWave.radius * .9}px) scale(2)`, opacity: 0}], {duration: 850, delay: index * 160, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'backwards'});
    });
  }
  function lockMove(dx, dy) {
    const handle = viewport.querySelector('.lock-handle');
    if (!handle) return null;
    const distance = Math.hypot(dx, dy), scale = distance > lockWave.radius ? lockWave.radius / distance : 1;
    let x = dx * scale, y = dy * scale, active = null;
    for (const [name, tx] of [['unlock', lockWave.radius], ['camera', -lockWave.radius]]) if (Math.hypot(x - tx, y) < lockWave.hit) { active = name; x = tx; y = 0; }
    handle.style.setProperty('--lock-x', `${x}px`); handle.style.setProperty('--lock-y', `${y}px`);
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.toggle('active', target.classList.contains(`lock-target-${active}`)));
    handle.classList.toggle('over-target', !!active);
    if (active && active !== pointerStart?.lockActive && data.settings.haptic !== false) navigator.vibrate?.(20);
    return active;
  }
  function lockRelease(active) {
    const handle = viewport.querySelector('.lock-handle');
    screen.classList.remove('lock-dragging');
    if (active) {
      viewport.querySelectorAll(`.lock-target:not(.lock-target-${active})`).forEach(target => target.classList.add('dismissed'));
      viewport.querySelector('.lock-outer-ring')?.classList.add('dismissed');
      suppressClickUntil = Date.now() + 350;
      if (active === 'unlock') home(); else openApp('camera');
      return;
    }
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.remove('active'));
    if (!handle) return;
    handle.classList.remove('over-target');
    screen.classList.add('lock-releasing');
    handle.style.setProperty('--lock-x', '0px'); handle.style.setProperty('--lock-y', '0px');
    clearTimeout(ui.lockReleaseTimer);
    ui.lockReleaseTimer = setTimeout(() => { screen.classList.remove('lock-releasing'); lockPing(); }, 300);
  }
  // Next alarm as NEXT_ALARM_FORMATTED ("EEE h:mm aa" or "EEE k:mm") and the lock screen date (full_wday_month_day_no_year).
  function nextAlarmLabel() {
    const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    if (!next) return '';
    const day = next.toLocaleDateString(i18n.locale(), {weekday: 'short'}), h = next.getHours(), m = String(next.getMinutes()).padStart(2, '0');
    return data.settings.hour24 ? `${day} ${h}:${m}` : `${day} ${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
  }
  const gbLockDate = () => deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'});
  /* LockPatternKeyguardView.getInitialMode: a pattern lock opens straight on the pattern screen; PIN and password locks
     show the SlidingTab lock screen first and its unlock tab leads to the password screen. */
  function renderLock() {
    if (ui.locked && (data.settings.screenLock === 'pattern' || ui.gbPasswordEntry)) return lockControls.renderLock();
    return GBKeyguard.slideScreen({t: key => i18n.t(key), carrier: data.settings.airplane ? i18n.t('No service.') : data.settings.networkOperator || 'Telekom', ...GBKeyguard.time(deviceDate(), !!data.settings.hour24), date: gbLockDate(), alarm: nextAlarmLabel(), silent: !!data.settings.silent, vibrate: data.settings.silentMode === 'vibrate', toast: ui.gbLockToast});
  }
  let gbTabs = null;
  function attachGBLock() {
    gbTabs?.destroy(); gbTabs = null;
    const root = viewport.querySelector('.gbkg-tab-screen'); if (!root) return;
    gbTabs = GBKeyguard.slidingTab(root, {haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches, onTrigger: side => {
      if (ui.view !== 'lock') return;
      suppressClickUntil = Date.now() + 350;
      if (side === 'left') { if (ui.locked) { ui.gbPasswordEntry = true; render(); } else home(); return; }
      // LockScreen.onTrigger(RIGHT_HANDLE): toggle silent mode (vibrate when "vibrate in silent" is on) and toast it for 3.5 s.
      const silent = !data.settings.silent;
      data.settings.silent = silent;
      if (silent) data.settings.silentMode = data.settings.vibrateSilent === false ? 'silent' : 'vibrate';
      save(); renderStatus();
      ui.gbLockToast = silent ? {text: i18n.t('Sound is OFF'), color: '#ffffff', icon: 'gb-ic_lock_ringer_off.png'} : {text: i18n.t('Sound is ON'), color: '#e69310', icon: 'gb-ic_lock_ringer_on.png'};
      clearTimeout(ui.gbLockToastTimer); ui.gbLockToastTimer = setTimeout(() => { ui.gbLockToast = null; if (ui.view === 'lock') render(); }, 3500);
      render();
    }});
  }

  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  // Calendar, Latitude, Traffic and the Google Voice widgets render the same live content in the picker and on the home screen.
  function googleWidget(type) {
    const ctx = {...gappContext(), events: data.calendarState ? [] : data.events};
    return {calendar: GBGoogleWidgets.calendar, latitude: GBGoogleWidgets.latitude, traffic: GBGoogleWidgets.traffic, 'gvoice-inbox': GBGoogleWidgets.voiceInbox, 'gvoice-settings': GBGoogleWidgets.voiceSettings, 'rate-places': GBGoogleWidgets.ratePlaces}[type]?.(ctx) ?? null;
  }
  function widgetArt(type) {
    const google = googleWidget(type);
    if (google) return google;
    if (type === 'analog') return GBWidgets.analog(deviceDate());
    if (type === 'photo') return GBWidgets.pictureFrame(data.photos[0], ICSMedia.image);
    if (type === 'bookmarks') return GBWidgets.bookmarks(data.bookmarks || [], 0, gbBrowserTitle, renderWebsite);
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return GBLauncher.music(ui.music, tracks[ui.music.track], false, key => i18n.t(key));
    if (type === 'power') return GBWidgets.power({...GBSettings.DEFAULTS, ...data.settings});
    if (type === 'news-weather') return GBWidgets.newsWeather(i18n.language);
    if (type === 'youtube') return GBWidgets.youtube(i18n.language);
    if (type === 'market') return GBWidgets.market(GBMarket.all().filter(item => !item.app).slice(0, 4));
    if (type === 'power-ics') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'search') return GBLauncher.search(t);
    if (widget.type === 'protips') return GBLauncher.protips({...(data.protips || {index: 0, set: 0}), icon: ui.tipsIcon}, i18n.language);
    if (widget.type === 'analog') return GBWidgets.analog(deviceDate());
    if (widget.type === 'power') return GBWidgets.power({...GBSettings.DEFAULTS, ...data.settings}, t);
    if (widget.type === 'bookmarks') return GBWidgets.bookmarks(data.bookmarks || [], ui.bookmarkWidget?.[widget.id] || 0, gbBrowserTitle, renderWebsite);
    if (widget.type === 'music') return GBLauncher.music(ui.music, tracks[ui.music.track], musicActive(), t);
    if (widget.type === 'news-weather') return GBWidgets.newsWeather(i18n.language);
    if (widget.type === 'youtube') return GBWidgets.youtube(i18n.language);
    const google = googleWidget(widget.type);
    if (google) return google;
    if (widget.type === 'market') return GBWidgets.market(GBMarket.all().filter(item => !item.app && ['apps', 'games'].includes(item.kind || 'apps')).slice(0, 4));
    if (widget.type === 'photo') { const photo = data.photos.find(p => p.id === widget.photo) || (widget.source === 'album' ? ICSMedia.photos(data, widget.album)[0] : widget.source === 'shuffle' ? data.photos[0] : null); return GBWidgets.pictureFrame(photo, ICSMedia.image); }
    return null;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
  };
  function renderHome() {
    const t = key => i18n.t(key);
    return `<div class="home-view gbl"><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div>${GBLauncher.arrows(ui.page, 5, t)}${GBLauncher.dock(t)}<div class="drop-target-bar gbl-delete"><div class="drop-target" data-drop-remove="true" aria-label="${safe(t('Remove'))}"><img src="assets/gb-l2-trashcan.png" alt=""><img class="drop-target-active" src="assets/gb-l2-trashcan_hover.png" alt=""></div></div></div>`;
  }
  // AllApps2D: a black 4-column GridView of application_boxed items (alphabetical) above the home button.
  function renderDrawer() {
    const sortedApps = [...apps].sort((a, b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    return `<div class="drawer-view gbl-allapps-view"><div class="drawer-page drawer-apps gbl-allapps-grid">${sortedApps.map(app => launcherIcon(app[0])).join('')}</div><button class="gbl-allapps-home" data-action="home" aria-label="${safe(i18n.t('Home'))}"></button></div>`;
  }
  function widgetFits(page, x, y, type, ignoredId = '') {
    const {width, height} = widgetSize(type);
    if (x < 0 || y < 0 || x + width > 4 || y + height > 4) return false;
    for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) {
      if (data.homePages[page][row * 4 + column]) return false;
    }
    return !data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + widgetSize(widget).width && x + width > widget.x && y < widget.y + widgetSize(widget).height && y + height > widget.y);
  }
  function addWidget(type, x = null, y = null) {
    const spots = x === null ? Array.from({length:16}, (_, i) => [i % 4, Math.floor(i / 4)]) : [[x,y]];
    const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row, type));
    if (!spot) return false;
    const widget = {id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]};
    // Gallery2 declares a configure activity; the widget stays empty until it finishes.
    if (type === 'photo') { widget.source = null; ui.photoWidgetSetup = {page: ui.page, id: widget.id}; ui.gbgPickPending = true; }
    data.homeWidgets[ui.page].push(widget);
    save(); return widget;
  }
  function stepPhotoStack(id, direction) {
    const widget = data.homeWidgets.flat().find(item => item.id === id);
    if (!widget) return;
    const count = ICSWidgets.photoItems(data, widget).length;
    if (count < 2) { render(); return; }
    ui.photoStacks = ui.photoStacks || {};
    ui.photoStacks[id] = ICSWidgets.wrap((ui.photoStacks[id] || 0) + direction, count);
    render();
    const stack = viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"]`);
    if (stack) stack.classList.add(direction > 0 ? 'stack-next' : 'stack-previous');
  }
  const pendingPhotoWidget = () => ui.photoWidgetSetup && data.homeWidgets[ui.photoWidgetSetup.page]?.find(widget => widget.id === ui.photoWidgetSetup.id);
  // Leaving WidgetConfigure without a choice removes the pending widget, as on Android.
  function cancelPhotoWidget() {
    const setup = ui.photoWidgetSetup;
    if (setup) data.homeWidgets[setup.page] = data.homeWidgets[setup.page].filter(widget => widget.id !== setup.id);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render();
  }
  /* LivePicker 2.3.6: LiveWallpaperListActivity (Theme.NoTitleBar; live_wallpaper_entry rows with the 75 dip thumbnail,
     the label and the Html description), LiveWallpaperPreview (two 160 dip buttons at the bottom; Settings… only with a
     settings activity), MagicSmokeSelector ("Tap to change", OK) and PolarClockSettings (Theme, two checkboxes and a list). */
  const lwText = key => AndroidStrings.resources(() => window.GBStrings?.wallpapers).t(key, i18n.language);
  const lwLabel = spec => lwText(spec.gb?.[0] || spec.label);
  function renderLiveWallpapers() {
    const sub = String(ui.sub || ''), T = lwText;
    if (sub.startsWith('preview:')) {
      const spec = LiveWallpapers.find(sub.slice(8));
      return `<div class="app-view lw-preview gblw-preview" data-no-translate><div class="gblw-buttons"><button class="gblw-btn" data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(T('wallpaper_instructions'))}</button>${spec?.settings ? `<button class="gblw-btn" data-action="lw-settings" data-id="${spec.id}">${safe(T('configure_wallpaper'))}</button>` : ''}</div></div>`;
    }
    if (sub === 'settings:magicsmoke') return `<div class="app-view lw-preview gblw-smoke" data-action="lw-smoke-tap" data-no-translate><div class="gblw-smoke-hint">${safe(T('taptochange'))}</div><button class="gblw-btn" data-action="lw-smoke-ok">${safe(T('ok'))}</button></div>`;
    // Maps 5.4.0's MapWallpaperSettingsActivity (wallpaper_prefs.xml): Show traffic (off by default) and Map mode.
    if (sub === 'settings:maps') {
      const traffic = data.lwPrefs?.maps?.traffic === true;
      return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${safe(T('maps_settings'))}</div><div class="gbset-list"><button class="gbset-row" data-action="lw-flag" data-id="maps:traffic" role="checkbox" aria-checked="${traffic}"><span class="gbset-text"><span class="gbset-title">${safe(T('maps_show_traffic'))}</span></span><img class="gbset-check" src="assets/gb-btn_check_${traffic ? 'on' : 'off'}.png" alt=""></button><button class="gbset-row" data-action="lw-mapmode"><span class="gbset-text"><span class="gbset-title">${safe(T('maps_map_mode'))}</span><span class="gbset-sum">${safe(T('maps_map_mode_summary'))}</span></span></button></div></div>`;
    }
    if (sub.startsWith('settings:')) {
      const p = data.lwPrefs?.polar || {};
      const check = (key, title) => `<button class="gbset-row" data-action="lw-toggle" data-id="polar:${key}" role="checkbox" aria-checked="${p[key] !== false}"><span class="gbset-text"><span class="gbset-title">${safe(T(title))}</span></span><img class="gbset-check" src="assets/gb-btn_check_${p[key] !== false ? 'on' : 'off'}.png" alt=""></button>`;
      return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${safe(T('clock_settings'))}</div><div class="gbset-list">${check('showSeconds', 'show_seconds')}${check('variableWidth', 'variable_line_width')}<button class="gbset-row" data-action="lw-palette"><span class="gbset-text"><span class="gbset-title">${safe(T('palette'))}</span></span></button></div></div>`;
    }
    const collator = new Intl.Collator(i18n.locale());
    const list = [...LiveWallpapers.LIST].sort((a, b) => collator.compare(lwLabel(a), lwLabel(b)));
    return `<div class="app-view lw-picker gblw" data-no-translate>${list.map(spec => `<button class="gblw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span class="gblw-copy"><span class="gblw-title">${safe(lwLabel(spec))}</span><span class="gblw-desc">${safe(T(spec.gb[1])).replace(/\s*&lt;br&gt;\s*/g, '<br>')}</span></span></button>`).join('')}</div>`;
  }
  viewport.addEventListener('click', event => {
    if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
    const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
  });
  function renderApp() {
    if (prefsOpen()) return GBPrefs.render(gbPrefsContext());
    if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
    if (GBApps.has(ui.view)) return GBApps.get(ui.view).render(gappContext());
    switch (ui.view) {
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': { const selected = Number.isInteger(ui.wpChoice) ? ui.wpChoice : Math.max(0, data.wallpaper); return `<div class="app-view gbwp"><div class="gbwp-preview"><img src="assets/gb-wallpaper_${wallpaperFiles[selected]}.jpg" alt=""></div><div class="gbwp-gallery" role="listbox" aria-label="${safe(i18n.t('Wallpapers'))}">${wallpaperFiles.map((name, index) => `<button class="gbwp-item${index === selected ? ' selected' : ''}" role="option" aria-selected="${index === selected}" data-action="gb-wp-pick" data-id="${index}" aria-label="${safe(name.replace(/_/g, ' '))}"><img src="assets/gb-wallpaper_${name}_small.jpg" alt=""></button>`).join('')}</div><button class="gbwp-set" data-action="wallpaper" data-id="${selected}">${safe(i18n.t('Set wallpaper'))}</button></div>`; }
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if(ui.locked)return;
    if (!appNames[app]) return;
    // A capture for Messaging lasts while the Camera is open; Messaging opens on its compose screen, not over it.
    if (!resume) { ui.gbmaCapture = null; ui.gbceCapture = null; if (app === 'messaging') ui.gbmaScreen = null; }
    captureRecentView();
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; if (!resume) { ui.gbPrefs = null; ui.gbCalSel = null; ui.gbEmSetup = null; } ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    if (GBApps.has(app)) GBApps.get(app).open?.(gappContext(), resume);
    StoreHost.open(app, storeContext(), resume);
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 8);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    if (GBApps.has(app)) return viewport.querySelector(GBApps.get(app).scroll || '[class*="-scroll"]') || viewport;
    return viewport.querySelector(app === 'play-store' ? '.play-content' : app === 'messaging' ? '.mms-scroll' : app === 'email' ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'clock' ? '.gbdc-alarms' : app === 'gallery' ? '.gallery-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : '.app-view') || viewport.firstElementChild;
  }
  function captureRecentView() {
    if (appNames[ui.view] && viewport.firstElementChild) {
      ui.recentSnapshots[ui.view] = viewport.innerHTML;
      ui.recentState ||= {};
      ui.recentState[ui.view] = {sub: ui.sub, scrollTop: appScrollContainer(ui.view).scrollTop};
    }
  }
  function home(resetPage = true) { if(ui.locked)return;if(ui.photoWidgetSetup){const setup=ui.photoWidgetSetup;data.homeWidgets[setup.page]=data.homeWidgets[setup.page].filter(widget=>widget.id!==setup.id);ui.photoWidgetSetup=null;save();}if(ui.sub==='lock-setup')lockControls.lock();captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; if (resetPage) ui.page = 2; render(); }
  function back() { pendingNav = 'back'; try { navigateBack(); } finally { pendingNav = ''; } }
  function navigateBack() {
    if ((ui.overlay === 'store-host' || !ui.overlay && moduleView()) && StoreHost.back(storeContext())) return;
    if(ui.view==='lock'&&ui.gbPasswordEntry&&data.settings.screenLock!=='pattern'){ui.gbPasswordEntry=false;lockControls.lock();render();return;}
    if (ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view && !ui.overlay) { ui.gbPrefs = ui.gbPrefs.parent || null; render(); return; }
    if (GBApps.has(ui.view) && !ui.overlay && GBApps.get(ui.view).back?.(gappContext())) return;
    if (ui.overlay === 'shade') { closeShade(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return; } render(); return; }
    if (ui.view === 'lock') return;
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (ui.sub) { ui.sub = ''; render(); return; }
    home(false);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
  }
  // Shade motion (StatusBarService): the panel's bottom edge follows the finger and flings with +-2000 px/s^2.
  let shadeTracking = null, stopShade = null;
  const shadeBottom = () => screen.clientHeight;
  function shadeFling(from, velocity, expand) {
    const panel = overlayRoot.querySelector('.gbsh-panel'); if (!panel) return;
    stopShade?.();
    stopShade = GBStatusBar.slide(panel, {from, velocity, accel: (expand ? 1 : -1) * GBStatusBar.ACCEL(), top: statusRoot.offsetHeight, bottom: shadeBottom(), reduced: !!reducedMotion?.matches}, opened => {
      stopShade = null;
      if (!opened && ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); }
    });
  }
  function closeShade() {
    const panel = overlayRoot.querySelector('.gbsh-panel');
    if (!panel || ui.overlay !== 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); return; }
    const y = new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom();
    shadeFling(Math.min(shadeBottom() - 1, y), -2000 * GBStatusBar.PX(), false);
  }
  // Launcher AddAdapter ("Add to Home screen"), the shortcut and widget pickers and "Select wallpaper from".
  function gbDialogSpec() {
    const t = key => i18n.t(key);
    if (ui.overlay === 'gb-dialog-add') return {title: t('Add to Home screen'), items: [
      {action: 'gb-add-shortcuts', title: t('Shortcuts'), icon: 'l2-ic_launcher_shortcut'},
      {action: 'gb-add-widgets', title: t('Widgets'), icon: 'l2-ic_launcher_appwidget'},
      {action: 'gb-add-folders', title: t('Folders'), icon: 'l2-ic_launcher_folder'},
      {action: 'gb-wallpaper', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
    if (ui.overlay === 'gb-dialog-shortcuts') return {title: t('Select shortcut'), items: [...apps].sort((a, b) => t(a[1]).localeCompare(t(b[1]), i18n.locale())).map(app => ({action: 'gb-add-app', id: app[0], title: t(app[1]), icon: `${app[0]}.png`}))};
    if (ui.overlay === 'gb-dialog-widgets') return {title: t('Choose widget'), items: [...widgetTypes].sort((a, b) => t(a.name).localeCompare(t(b.name), i18n.locale())).map(widget => ({action: 'add-widget-gb', id: widget.type, title: t(widget.name), icon: `${widget.app || 'settings'}.png`}))};
    if (ui.overlay === 'gb-dialog-folders') return {title: t('Select folder'), items: [
      {action: 'gb-new-folder', title: t('New folder'), icon: 'l2-ic_launcher_folder'},
      {action: 'gb-new-folder', id: 'all', title: t('All contacts'), icon: 'ic_launcher_folder_live_contacts'},
      {action: 'gb-new-folder', id: 'phone', title: t('Contacts with phone numbers'), icon: 'ic_launcher_folder_live_contacts_phone'},
      {action: 'gb-new-folder', id: 'starred', title: t('Starred contacts'), icon: 'ic_launcher_folder_live_contacts_starred'}]};
    if (ui.overlay === 'gb-dialog-emsetup') return GB.module('email').dialog('setup:' + ui.gbEmSetupDialog, storeContext());
    if (ui.overlay === 'gb-dialog-pref') return GBPrefs.dialog(gbPrefsContext(), ui.gbPrefDialog) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-module') return StoreHost.module(ui.view)?.dialog?.(ui.gbModuleDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-gbmk') return GB.module('play-store').dialog(ui.gbmkDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-clearlog' || ui.overlay === 'gb-dialog-gbct' || ui.overlay === 'gb-dialog-ce') return GB.module('people').dialog(ui.overlay.slice(10), storeContext()) || {title: '', items: []};
    if (['gb-dialog-net', 'gb-dialog-sp', 'gb-dialog-set', 'gb-dialog-list', 'gb-dialog-brightness'].includes(ui.overlay)) return GB.module('settings').dialog(ui.overlay.slice(10), storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-camera') return GB.module('camera').dialog('restore', storeContext());
    if (ui.overlay === 'gb-dialog-gallery' || ui.overlay === 'gb-dialog-crop-saving') return GB.module('gallery').dialog(ui.overlay.slice(10), storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-email') return GB.module('email').dialog(ui.gbEmDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-hotpot') return GBGoogleWidgets.placeDialog(gappContext());
    if (ui.overlay === 'gb-dialog-gapp') return GBApps.get(ui.view)?.dialog?.(ui.gappDialog, gappContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-cal') return GB.module('calendar').dialog(ui.gbCalDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-br' || ui.overlay === 'gb-dialog-share') return GB.module('browser').dialog(ui.overlay === 'gb-dialog-share' ? 'share' : ui.gbBrDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-music') return GB.module('music').dialog(ui.gbMusicDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-mms') return GB.module('messaging').dialog(ui.gbMmsDialog, storeContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-lw-mapmode') { const modes = ['normal', 'satellite', 'terrain']; return {title: lwText('maps_map_mode'), items: modes.map(id => ({action: 'lw-mapmode-pick', id, title: lwText(`maps_mode_${id}`)})), choice: 'single', selected: modes.indexOf(data.lwPrefs?.maps?.mode || 'satellite'), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
    if (ui.overlay === 'gb-dialog-lw-palette') { const current = data.lwPrefs?.polar?.palette || ''; return {title: lwText('palette'), items: LiveWallpapers.PALETTE_ORDER.map(id => ({action: 'lw-palette-pick', id, title: lwText(id)})), choice: 'single', selected: LiveWallpapers.PALETTE_ORDER.indexOf(current), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
    if (ui.overlay === 'gb-dialog-rename') return {title: t('Rename folder'), custom: `<label class="gbdlg-field"><span>${safe(t('Folder name'))}</span><input maxlength="40" value="${safe(ICSLauncherFolders.folder(data, ui.folderId)?.name || t('Folder'))}"></label>`, buttons: [{action: 'gb-rename-folder', title: t('OK')}, {action: 'gb-rename-cancel', title: t('Cancel')}], cancel: 'gb-rename-cancel'};
    if (ui.overlay === 'gb-dialog-wallpaper') return {title: t('Select wallpaper from'), items: [
      {action: 'open-app', app: 'gallery', title: t('Gallery'), icon: 'gallery.png'},
      {action: 'open-live-wallpapers', title: t('Live wallpapers'), icon: 'gb-l2-ic_launcher_wallpaper.png'},
      {action: 'open-wallpapers', title: t('Wallpapers'), icon: 'l2-ic_launcher_wallpaper'}]};
    return {title: '', items: []};
  }
  /* Launcher.showPreviews: each CellLayout is drawn at the scale that fits all five screens across the CellLayout width
     (minus the preview_background padding), without the wallpaper, in a PopupWindow next to the anchor. */
  function fillPreviews() {
    const popup = overlayRoot.querySelector('.gbprev'); if (!popup) return;
    const grids = [...viewport.querySelectorAll('.home-grid')];
    const width = screen.clientWidth, cellsHeight = viewport.clientHeight - dp(8) - dp(78.0058), thumbWidth = (width - 5 * dp(6.6667)) / 5, scale = thumbWidth / width;
    popup.querySelectorAll('.gbprev-thumb').forEach((thumb, index) => {
      thumb.style.width = `${thumbWidth}px`; thumb.style.height = `${cellsHeight * scale}px`;
      const clone = grids[index]?.cloneNode(true); if (!clone) return;
      clone.removeAttribute('inert'); clone.inert = true; clone.classList.add('gbprev-grid');
      Object.assign(clone.style, {width: `${width}px`, height: `${viewport.clientHeight}px`, transform: `scale(${scale}) translateY(-${dp(8)}px)`});
      thumb.append(clone);
    });
    const anchor = viewport.querySelector(ui.gbPreviewAnchor === 'next' ? '.gbl-arrow-right' : ui.gbPreviewAnchor === 'apps' ? '.gbl-allapps' : '.gbl-arrow-left');
    const screenRect = screen.getBoundingClientRect(), ratio = screen.clientWidth / screenRect.width, rect = anchor?.getBoundingClientRect();
    const left = rect ? Math.max(0, Math.min(width - popup.offsetWidth, (rect.left - screenRect.left) * ratio)) : 0;
    popup.style.left = `${left}px`;
  }
  let openFolderId = '';
  function renderOverlay() { renderOverlayBase(); gingerbreadMenu(); if (ui.overlay === 'gb-dialog-net') GBNetwork.wire(overlayRoot, gbNetContext()); }
  function renderOverlayBase() {
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    if (ui.overlay === 'gb-previews') {
      overlayRoot.innerHTML = `<div class="gbprev-scrim" data-action="close-overlay"></div><div class="gbprev" role="listbox" aria-label="${safe(i18n.t('Home screen'))}">${data.homePages.map((_, index) => `<button class="gbprev-item${index === ui.page ? ' current' : ''}" role="option" aria-selected="${index === ui.page}" data-action="gb-preview-go" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}"><span class="gbprev-thumb"></span></button>`).join('')}</div>`;
      fillPreviews();
    } else if (ui.overlay === 'store-host') {
      overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
    } else if (ui.overlay === 'gb-menu-home') {
      ui.gbMenuItems = launcherMenu();
      overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems, key => i18n.t(key));
    } else if (ui.overlay === 'gb-menu-settings') {
      overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems || [], key => i18n.t(key));
    } else if (ui.overlay === 'gb-menu-more') {
      overlayRoot.innerHTML = GBUI.expanded(ui.gbMenuItems || [], key => i18n.t(key));
    } else if (ui.overlay.startsWith('gb-dialog')) {
      overlayRoot.innerHTML = GBUI.dialog({...gbDialogSpec(), t: key => i18n.t(key)});
    } else if (ui.overlay === 'shade') {
      const time = n => n.id > 1e12 ? new Date(n.id).toLocaleTimeString(i18n.locale(), {hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
      const ongoing = ui.activeCall ? [{id: 'call', action: 'gbp-return-call', icon: ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png', title: ui.activeCall.hold ? GBPhone.phoneText(i18n.language, 'notification_on_hold') : AndroidStrings.format(GBPhone.phoneText(i18n.language, 'notification_ongoing_call_format'), GBPhone.elapsedText(ui.activeCall)), text: contactByPhone(ui.activeCall.number)?.name || ui.activeCall.number}] : [];
      ongoing.push(...GBNetwork.ongoing(gbNetContext()));
      const latest = data.notifications.map(n => ({id: n.id, icon: noteIcon(n), title: n.title, text: n.detail, time: time(n)}));
      const open = overlayRoot.querySelector('.gbsh');
      overlayRoot.innerHTML = GBStatusBar.shade({t: key => i18n.t(key), carrier: carrierName(), ongoing, latest, clearable: latest.length > 0});
      const panel = overlayRoot.querySelector('.gbsh-panel');
      if (open || shadeTracking) GBStatusBar.place(panel, shadeTracking ? shadeTracking.y : screen.clientHeight, shadeBottom());
      else shadeFling(statusRoot.offsetHeight, 2000 * GBStatusBar.PX(), true);
      renderStatus();
    } else if (ui.overlay === 'recent') {
      // RecentApplicationsDialog (recent_apps_dialog.xml): "Recent", up to eight 80 dip icon buttons in rows of four, newest first,
      // or "No recent applications."; recent_dialog_background behind it, fading in and out.
      const fw = key => AndroidStrings.resources(() => window.GBStrings?.framework).t(key, i18n.language);
      const items = ui.recent.filter(id => appNames[id]).slice(0, 8);
      const rows = items.length ? [items.slice(0, 4), items.slice(4, 8)].filter(row => row.length).map(row => `<div class="gbrecent-row">${row.map(id => `<button class="gbrecent-item" data-action="open-app" data-app="${id}">${appIcon(id)}<span>${safe(appNames[id])}</span></button>`).join('')}</div>`).join('') : `<div class="gbrecent-empty">${safe(fw('no_recent_tasks'))}</div>`;
      overlayRoot.innerHTML = `<div class="gbrecent-scrim" data-action="close-overlay"></div><div class="gbrecent" role="dialog" aria-label="${safe(fw('recent_tasks_title'))}"><div class="gbrecent-title">${safe(fw('recent_tasks_title'))}</div>${rows}<div class="gbrecent-spacer"></div></div>`;
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale());
    } else if (ui.overlay === 'clock-ringing' && ui.ringingAlarm) {
      overlayRoot.innerHTML = GBDeskClock.alert({...GB.module('clock').context(storeContext()), wallpaper: ui.locked ? screen.style.background : ''});
    } else if (ui.overlay.startsWith('clock-')) {
      const dialog = GBDeskClock.dialog(ui.overlay.slice(6), GB.module('clock').context(storeContext()));
      overlayRoot.innerHTML = dialog ? GBUI.dialog({...dialog, t: key => i18n.t(key)}) : '';
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('music-')) {
      overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = GB.module('people').overlay(storeContext());
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay === 'play-menu') {
      overlayRoot.innerHTML = GB.module('play-store').overlay(storeContext());
    } else if (ui.overlay === 'phone-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
    } else if (['connectivity-menu', 'wifi-add', 'bluetooth-pair', 'bluetooth-rename', 'bluetooth-files', 'wifi-dialog'].includes(ui.overlay)) {
      overlayRoot.innerHTML = GB.module('settings').overlay(storeContext());
    } else if (ui.overlay === 'wallpaper-source') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3>${[['gallery-wallpaper', 'Gallery'], ['open-live-wallpapers', 'Live Wallpapers'], ['open-wallpapers', 'Wallpapers']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1]))).map(([action, label]) => `<button data-action="${action}" data-no-translate>${safe(i18n.t(label))}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'power-menu') {
      // GlobalActions (2.3.6): "Phone options" over a bright list - Silent mode and Airplane mode toggles with their status
      // line (global_actions_item.xml), then Power off.
      const t = key => i18n.t(key), silent = !!data.settings.silent, vibrate = data.settings.silentMode === 'vibrate';
      overlayRoot.innerHTML = GBUI.dialog({t, title: t('Phone options'), items: [
        {action: 'gb-ga-silent', title: t('Silent mode'), summary: t(silent ? 'Sound is OFF' : 'Sound is ON'), icon: silent ? (vibrate ? 'ic_lock_silent_mode_vibrate' : 'ic_lock_silent_mode') : 'ic_lock_silent_mode_off'},
        {action: 'ga-airplane', title: t('Airplane mode'), summary: t(data.settings.airplane ? 'Airplane mode is ON' : 'Airplane mode is OFF'), icon: data.settings.airplane ? 'ic_lock_airplane_mode' : 'ic_lock_airplane_mode_off'},
        {action: 'ga-power', title: t('Power off'), icon: 'ic_lock_power_off'}]});
    } else if (ui.overlay === 'power-confirm') {
      // ShutdownThread.shutdown(confirm): ic_dialog_alert, "Power off", shutdown_confirm, OK / Cancel.
      overlayRoot.innerHTML = GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), icon: 'ic_dialog_alert', message: i18n.t('Your phone will shut down.'), buttons: [{action: 'ga-confirm', id: 'shutdown', title: i18n.t('OK')}, {action: 'close-overlay', title: i18n.t('Cancel')}]});
    } else if (ui.overlay === 'power-progress') {
      // ProgressDialog: spinner_white_48 (12 frames, 100 ms) beside "Shutting down…"; not cancelable.
      overlayRoot.innerHTML = GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${safe(i18n.t('Shutting down…'))}</span></div>`, cancel: 'noop'});
    } else if (ui.overlay === 'folder') {
      overlayRoot.innerHTML = renderFolder();
      positionFolder();
      syncFolderIcons();
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
    // Folder.animateOpen/animateClosed run only when the folder actually opens or closes, not on content updates.
    const folderPanel = ui.overlay === 'folder' ? overlayRoot.querySelector('.launcher-folder') : null;
    if (folderPanel && openFolderId !== ui.folderId) {
      ui.folderSettled = '';
      const animations = ICSTransitions.play(folderPanel, ICSTransitions.specs['folder-open'].enter);
      animations.forEach(animation => animation.finished.then(() => animation.cancel(), () => {}));
      const folderId = ui.folderId;
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => { if (ui.overlay === 'folder' && ui.folderId === folderId) { ui.folderSettled = folderId; } });
    }
    if (!folderPanel && closingFolder && openFolderId) {
      closingFolder.inert = true; closingFolder.classList.add('launcher-folder-closing'); overlayRoot.append(closingFolder);
      const animations = ICSTransitions.play(closingFolder, ICSTransitions.specs['folder-close'].exit);
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => closingFolder.remove());
      if (!animations.length) closingFolder.remove();
    }
    if (!folderPanel && openFolderId) syncFolderIcons();
    openFolderId = folderPanel ? ui.folderId : '';
    if (!folderPanel) ui.folderSettled = '';
  }

  /* UserFolder (user_folder.xml): Launcher.openFolder adds it over the whole CellLayout - a box_launcher_top title button
     (14 sp bold #404040; touch closes, touch & hold renames) above box_launcher_bottom with a 4-column grid of
     application_boxed items. Live folders list their contacts (live_folder_list). */
  function syncFolderIcons() {
    viewport.querySelectorAll('[data-folder-id]').forEach(button => { const icon = button.querySelector('.app-icon'); if (icon) icon.outerHTML = appIcon(button.dataset.folderId); });
  }
  function renderFolder() {
    const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const people=folder.live?data.contacts.filter(person=>folder.live==='all'||folder.live==='phone'&&person.phone||folder.live==='starred'&&person.favorite).sort((a,b)=>a.name.localeCompare(b.name,i18n.locale())):null;
    const grid=people?`<div class="gbfolder-live">${people.map(person=>`<button class="gbfolder-person" data-action="gb-live-contact" data-id="${person.id}"><span class="avatar">${safe(person.name[0])}</span><span>${safe(person.name)}</span></button>`).join('')||`<p class="gbfolder-empty">${safe(i18n.t('No contacts.'))}</p>`}</div>`
      :`<div class="launcher-folder-grid gbfolder-grid">${Array.from({length:folder.items.length+1},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div>`;
    return `<div class="launcher-folder gbfolder${folder.live?' gbfolder-livebox':''}" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}"><button class="gbfolder-title" data-action="close-overlay" data-gb-folder-title>${safe(folderName(ui.folderId))}</button><div class="gbfolder-body">${grid}</div></div>`;
  }
  function positionFolder() {
    const panel=overlayRoot.querySelector('.launcher-folder');if(!panel||panel.classList.contains('gbfolder'))return;
    const icon=[...viewport.querySelectorAll('[data-folder-id]')].find(button=>button.dataset.folderId===ui.folderId&&!button.closest('[inert]'));
    const screenRect=screen.getBoundingClientRect(),rect=icon?.getBoundingClientRect();
    const scale=screenRect.width/screen.clientWidth;
    const x=rect?(rect.left+rect.width/2-screenRect.left)/scale:screen.clientWidth/2;
    const y=rect?(rect.top+rect.height/2-screenRect.top)/scale:screen.clientHeight/2;
    const left=Math.max(8,Math.min(screen.clientWidth-panel.offsetWidth-8,x-panel.offsetWidth/2));
    const top=Math.max(30,Math.min(screen.clientHeight-55-panel.offsetHeight,y-panel.offsetHeight/2));
    panel.style.left=left+'px';panel.style.top=top+'px';panel.style.setProperty('--folder-origin',`${x-left}px ${y-top}px`);
  }
  window.addEventListener('resize',()=>{if(ui.overlay==='folder')positionFolder();});


  // Settings (gb-settings.js): the network screens' context, which the status bar and the shade read too.
  const gbNetContext = () => GB.module('settings').net(storeContext());

  // Market (gb-market.js): the home screen widget opens an item's page.
  function gbMarketGo(next) { GB.module('play-store').go(storeContext(), next); }

  // Browser (gb-browser.js): a page opens, the tabs' state, a page's title and its offline content.
  const normalizeAddress = raw => GB.module('browser').normalize(raw);
  function syncBrowserState() { GB.module('browser').sync(ui); }
  function navigateBrowser(url) { GB.module('browser').navigate(storeContext(), url); }
  const gbBrowserTitle = url => GB.module('browser').title(data, url);
  const renderWebsite = url => GB.module('browser').website(url);

  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  // A contact's photo as the people screens draw it: a Gallery picture or one the Camera took for the contact.
  window.GBContactPhoto = person => { const photo = person?.photo && (data.photos.find(p => p.id === person.photo) || (data.contactPhotos || []).find(p => p.id === person.photo)); return photo ? ICSMedia.image(photo) : ''; };
  // Phone and Contacts (gb-phone.js): a call starts, the contact editor opens.
  function startPhoneCall(number) { GB.module('phone').call(storeContext(), number); }
  function editPerson(isNew = false) { GB.module('people').edit(storeContext(), isNew); }
  // A capture request open in the Camera: Messaging's (gbmaCapture) or the contact editor's Take photo (gbceCapture).
  const gbCapture = () => ui.gbmaCapture || ui.gbceCapture || null;
  // EditContactActivity's camera request returns the picture as the contact's photo (kept with the contacts, not in the
  // Gallery); Cancel or Back leaves the editor as it was.
  function gbceReturn(photo) {
    const c = ui.gbceCapture; ui.gbceCapture = null; if (!c) return;
    captureRecentView(); ui.view = 'people'; ui.sub = c.ret.sub;
    if (photo && ui.peopleDraft) { data.contactPhotos = [...(data.contactPhotos || []), photo]; ui.peopleDraft.photo = photo.id; save(); }
    render();
  }
  // Messaging (gb-mms.js): a thread opens, the draft being written, a capture returns to the message.
  function openMessageThread(key) { GB.module('messaging').openThread(storeContext(), key); }
  function messageDraft() { return GB.module('messaging').draft(storeContext()); }
  function gbmaCancel() { GB.module('messaging').captureCancel(storeContext()); }
  function gbmaReturn(part) { GB.module('messaging').captureReturn(storeContext(), part); }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }

  // Calendar AlertService: a status-bar notification at the reminder time while the page is running.
  function checkReminders(now) {
    data.calendarFired=Array.isArray(data.calendarFired)?data.calendarFired.slice(-60):[];
    for(const {key,event} of ICSCalendar.dueReminders(data.events,now,data.calendarFired)) {
      data.calendarFired.push(key);
      const when=event.allDay?i18n.t('All day'):`${event.time} – ${event.endTime}`;
      data.notifications.unshift({id:Date.now()+data.notifications.length,title:event.title,detail:[when,event.location].filter(Boolean).join(' · '),kind:'calendar',eventId:event.id,date:event.date});
      save();renderStatus();if(ui.overlay==='shade')renderOverlay();
    }
  }
  function checkAlarms(now) {
    if(ui.overlay==='clock-ringing')return;
    const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
  }

  function saveMusic() {
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;ui.musicPosition=ui.music.position;
    data.music=clone(ui.music);delete data.music.playing;save();
  }
  function tickMusic() {
    if(!ui.music.playing)return;
    const previous=ui.music.track;ICSMusic.tick(ui.music);
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;
    if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='home'||ui.view==='lock'&&!pointerStart)render();}
    else if(Math.floor(ui.music.position)%10===0)saveMusic();
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  // What the image's Google apps (gb-apps.js) render and act with.
  function gappContext() {
    return {data, ui, view: ui.view, root: viewport, account: window.GBGmail?.ACCOUNT || '', appName: id => appNames[id] || id, lang: i18n.language, locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24,
      ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel'), t: key => i18n.t(key),
      save, render, renderOverlay, toast, openApp, home: () => home(false), photos: data.photos, contacts: data.contacts,
      dialog(kind) { ui.gappDialog = kind; ui.overlay = 'gb-dialog-gapp'; renderOverlay(); },
      // Gmail's Attach: the Gallery in its picker mode, which returns to Gmail with the picture.
      pickPicture() { captureRecentView(); ui.gbgmPick = true; ui.view = 'gallery'; ui.sub = ''; ui.gbgPick = true; render(); },
      focus(selector) { requestAnimationFrame(() => viewport.querySelector(selector)?.focus()); },
      submit(selector) { viewport.querySelector(selector)?.requestSubmit(); },
      browse(url) { openApp('browser'); navigateBrowser(url); }, call(number) { startPhoneCall(number); }};
  }
  // MessageCompose with a new draft (a reply, a forward, an address): Email's (gb-email.js).
  function composeEmail(...args) { GB.module('email').compose(storeContext(), ...args); }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    StoreHost.clearData(id, storeContext());
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function blinkTips(times) {
    let delay = 0;
    for (const [icon, wait] of GBLauncher.blinkFrames(times)) { setTimeout(() => { ui.tipsIcon = icon; if (ui.view === 'home') { const img = viewport.querySelector('.gbtips-droid img'); if (img) img.src = `assets/gb-tips-${icon}.png`; } }, delay); delay += wait; }
  }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }

  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button) && !navRoot.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
    // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
    if ((action.startsWith('sth-') || moduleView()) && StoreHost.action(action, button, storeContext())) return;
    if (GBApps.has(ui.view) && !['back', 'home', 'menu-key', 'search-key', 'open-app'].includes(action) && GBApps.get(ui.view).handle?.(action, id, gappContext(), button)) return;
    switch (action) {
      case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'menu-key': menuKey(); break;
      case 'search-key': searchKey(); break;
      case 'gb-ga-silent': { const silent = !data.settings.silent; data.settings.silent = silent; data.settings.silentMode = silent ? (data.settings.vibrateSilent === false ? 'mute' : 'vibrate') : 'off'; ui.overlay = ''; save(); render(); break; }
      case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
      case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
      case 'ga-confirm': powerConfirm(); break;
      case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': { const active = musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
      case 'open-wallpapers': ui.overlay = ''; ui.wpChoice = null; ui.view = 'wallpaper-picker'; render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest'}); break;
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
      case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
      case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
      case 'lw-palette': ui.overlay = 'gb-dialog-lw-palette'; renderOverlay(); break;
      // MagicSmokeSelector.onTouchEvent: every touch steps back one preset; OK finishes the selector.
      case 'lw-smoke-tap': { data.lwPrefs ||= {}; data.lwPrefs.magicsmoke ||= {}; const n = LiveWallpapers.SMOKE_PRESETS.length, cur = Number(data.lwPrefs.magicsmoke.preset ?? LiveWallpapers.SMOKE_DEFAULT); data.lwPrefs.magicsmoke.preset = cur <= 0 || cur >= n ? n - 1 : cur - 1; save(); break; }
      case 'lw-smoke-ok': ui.sub = 'preview:magicsmoke'; render(); break;
      case 'lw-flag': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] !== true; save(); render(); break; }
      case 'lw-mapmode': ui.overlay = 'gb-dialog-lw-mapmode'; renderOverlay(); break;
      case 'lw-mapmode-pick': data.lwPrefs ||= {}; data.lwPrefs.maps ||= {}; data.lwPrefs.maps.mode = id; save(); ui.overlay = ''; render(); break;
      case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
      case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
      // The Google apps' home screen widgets open their story, video or app.
      case 'gbw-news': openApp('news-weather'); if (id !== 'weather') { ui.nwTab = 'Top Stories'; ui.nwStory = id; } render(); break;
      case 'gbw-youtube': openApp('youtube'); Object.assign(ui, {ytWatch: id, ytTab: 'info', ytPos: 0, ytPlaying: true}); render(); break;
      case 'gbw-youtube-search': openApp('youtube'); ui.ytSearching = true; render(); viewport.querySelector('.yt-search input')?.focus(); break;
      case 'gbw-market': openApp('play-store'); gbMarketGo({page: 'detail', selected: id}); break;
      case 'gbw-latitude':
        if (id === 'checkin') { data.latitudeCheckin = 'Riverside Park'; save(); toast(`${i18n.t('Check in')}: Riverside Park`); render(); }
        else if (id === 'refresh') { data.latitudeUpdated = deviceDate().getTime(); save(); render(); }
        else openApp('latitude');
        break;
      case 'gbw-traffic': openApp('maps'); break;
      // Rate Places: the rate panel slides in over the place; a star rates the place and slides it back.
      case 'gbw-hotpot':
        if (id === 'places') { ui.overlay = 'gb-dialog-hotpot'; renderOverlay(); break; }
        ui.gbwHotpot = id === 'rate' ? 'rate' : ''; ui.gbwHotpotSlide = true; render(); ui.gbwHotpotSlide = false; break;
      case 'gbw-hotpot-star': { const [place, stars] = id.split(':'); const hp = data.hotpot ||= {}; (hp.ratings ||= {})[place] = Number(stars); ui.gbwHotpot = ''; ui.gbwHotpotSlide = true; save(); render(); ui.gbwHotpotSlide = false; break; }
      case 'gbw-hotpot-more': ui.gbwHotpot = ''; openApp('places'); if (ui.mp) { ui.mp.page = id; render(); } break;
      case 'gbw-hotpot-pick': data.hotpot = {...data.hotpot, place: id, updated: deviceDate().getTime()}; ui.overlay = ''; renderOverlay(); save(); render(); break;
      case 'gbw-voice-step': ui.gbwVoice = (ui.gbwVoice || 0) + Number(id); render(); break;
      case 'gbw-voice-open': openApp('google-voice'); if (id) { const c = GBExtraApps.gvStore(data).find(x => x.id === id); if (c) { c.read = true; ui.gvOpen = id; save(); } } render(); break;
      case 'gbw-voice-compose': openApp('google-voice'); render(); gappContext().dialog('gv-compose'); break;
      case 'gbw-voice-dnd': data.gvoiceDnd = !data.gvoiceDnd; save(); toast(GBGoogleWidgets.T(i18n.language, data.gvoiceDnd ? 'Do not disturb on' : 'Do not disturb off')); render(); break;
      case 'page': setHomePage(Number(id)); break;
      case 'power-toggle':
        if (id === 'brightness') { const auto = data.settings.autoBrightness ?? GBSettings.DEFAULTS.autoBrightness; if (auto) { data.settings.autoBrightness = false; data.settings.brightness = 20; } else if ((data.settings.brightness ?? 60) < 30) data.settings.brightness = 55; else if (data.settings.brightness < 80) data.settings.brightness = 100; else data.settings.autoBrightness = true; }
        else data.settings[id] = !data.settings[id];
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        save(); render(); break;
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      // The search box and widget microphones start Voice Search's recognition dialog (gb-google-apps.js).
      case 'voice-search': openApp('voice-search'); break;
      case 'gb-add': ui.overlay = 'gb-dialog-add'; renderOverlay(); break;
      case 'gb-add-shortcuts': ui.overlay = 'gb-dialog-shortcuts'; renderOverlay(); break;
      case 'gb-add-widgets': ui.overlay = 'gb-dialog-widgets'; renderOverlay(); break;
      case 'gb-add-folders': ui.overlay = 'gb-dialog-folders'; renderOverlay(); break;
      case 'gb-new-folder': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => item === null && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } ICSLauncherFolders.create(data, ui.page, slot, id ? {live: id} : {}); save(); render(); break; }
      case 'gb-live-contact': ui.overlay = ''; openApp('people'); ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'gb-rename-folder': { const input = overlayRoot.querySelector('.gbdlg input'); const folder = ICSLauncherFolders.folder(data, ui.folderId); if (folder && input) { folder.name = input.value.trim().slice(0, 40); save(); } ui.overlay = 'folder'; render(); renderOverlay(); break; }
      case 'gb-rename-cancel': ui.overlay = 'folder'; renderOverlay(); break;
      case 'gb-wallpaper': ui.overlay = 'gb-dialog-wallpaper'; renderOverlay(); break;
      case 'gb-notifications': ui.overlay = 'shade'; renderOverlay(); break;
      case 'gb-menu-more': ui.overlay = 'gb-menu-more'; renderOverlay(); break;
      case 'settings-open': ui.overlay = ''; ui.view = 'settings'; ui.sub = id; ui.gbSettingsStack = id ? [''] : []; render(); break;
      // Select text arms the page (Browser / Google Mail): the next touch there selects (gb-browser.js).
      case 'gb-select-text': ui.overlay = ''; ui.gbMenuItems = null; renderOverlay(); ui.gbSelecting = ui.view; break;
      case 'gb-add-app': { ui.overlay = ''; const slot = data.homePages[ui.page].findIndex((item, index) => !item && widgetFits(ui.page, index % 4, Math.floor(index / 4), {type: 'x', width: 1, height: 1})); if (slot < 0) { renderOverlay(); toast('No more room on this Home screen.'); break; } data.homePages[ui.page][slot] = id; save(); render(); break; }
      case 'add-widget-gb': { ui.overlay = ''; const added = addWidget(id); if (!added) { renderOverlay(); toast('No more room on this Home screen.'); break; } if (ui.gbgPickPending) { ui.gbgPickPending = false; save(); const setup = ui.photoWidgetSetup; openApp('gallery'); ui.photoWidgetSetup = setup; ui.gbgPick = true; ui.sub = ''; render(); break; } if (ui.overlay) renderOverlay(); render(); break; }
      case 'widget-bookmark-step': { const host = button.closest('.home-widget'); if (!host) break; (ui.bookmarkWidget ||= {})[host.dataset.widgetId] = (ui.bookmarkWidget[host.dataset.widgetId] || 0) + Number(id); render(); break; }
      case 'widget-bookmark-open': openApp('browser'); navigateBrowser(id); break;
      case 'gb-wp-pick': ui.wpChoice = Number(id); render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest', behavior: reducedMotion?.matches ? 'auto' : 'smooth'}); break;
      case 'gb-preview-go': ui.overlay = ''; renderOverlay(); setHomePage(Number(id)); break;
      case 'gb-tip-next': data.protips = {...(data.protips || {set: 0}), index: ((data.protips?.index ?? -1) + 1) % GBLauncher.tips(i18n.language, data.protips?.set).length}; save(); render(); break;
      case 'gb-tip-poke': blinkTips(1); break;
      case 'shade': if (ui.overlay === 'shade') { closeShade(); break; } if (ui.locked) break; ui.overlay = 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': if (ui.overlay === 'shade') { closeShade(); break; } ui.overlay = ''; renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; save(); renderStatus(); renderOverlay(); closeShade(); break;
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
        ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'browser-search': openSearch(''); break;
      case 'gbpref-open': ui.overlay = ''; ui.gbPrefs = {app: id, view: ui.view}; render(); break;
      case 'gbpref-check': { const [app, key] = String(id).split(':'), ctx = gbPrefsContext(app), item = GBPrefs.find(ctx, key); if (item) gbPrefSet(key, !GBPrefs.get(item, ctx.values)); gbPrefRender(); break; }
      case 'gbpref-list': case 'gbpref-action': { const [app, key] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key); if (!item) break;
        if (item.toast) { toast('This feature is not part of the simulator.'); break; }
        if (item.open) { ui.gbPrefs = {app: item.open, view: ui.gbPrefs.view || ui.view, parent: ui.gbPrefs}; render(); break; }
        // Google Mail's Clear search history / Clear "Show pictures" act at once.
        if (item.done) { if (key === 'clear-search-history') data.gmailSearches = []; if (key === 'clear-display-images-whitelist') data.gmailShowPictures = []; if (key === 'pref_gtalk_clear_history_key' && data.talk23) data.talk23.searches = []; if (key === 'clear_history' && data.youtube23) data.youtube23.searches = []; if (key === 'cache_settings_clear_cache') data.mapsCache = false; save(); gbPrefRender(); break; }
        ui.gbMulti = null; ui.gbPick = undefined;
        ui.gbPrefDialog = key; ui.overlay = 'gb-dialog-pref'; renderOverlay(); break; }
      case 'gbpref-pick': { const [app, key, ...rest] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key), value = rest.join(':'); if (item) gbPrefSet(key, item.kind === 'list' ? Number(value) : value); ui.overlay = ''; gbPrefRender(); break; }
      case 'gbpref-edit-ok': { const [app, key] = String(id).split(':'), input = overlayRoot.querySelector('[data-pref-edit]'), item = GBPrefs.find(gbPrefsContext(app), key);
        // A number field (Amount of mail to sync) keeps only 1-999.
        if (input && !(item?.edit?.number && !(Number(input.value) >= 1 && Number(input.value) <= 999))) gbPrefSet(key, item?.edit?.number ? Math.round(Number(input.value)) : input.value.trim()); ui.overlay = ''; gbPrefRender(); break; }
      // NumberPickerDialog: the arrows step the draft within the picker's range (holding the value at its ends), Set stores it.
      case 'gbpref-step': { const [app, key, delta] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key); if (!item?.picker) break; const p = item.picker; ui.gbPick = Math.min(p.max, Math.max(p.min, (ui.gbPick ?? p.value) + Number(delta))); renderOverlay(); break; }
      case 'gbpref-picker-ok': { const [, key] = String(id).split(':'); if (ui.gbPick !== undefined) gbPrefSet(key, ui.gbPick); ui.gbPick = undefined; ui.overlay = ''; gbPrefRender(); break; }
      // Restore default settings: the screen's stored values go.
      case 'gbpref-restore': ui.overlay = ''; ui.gbMenuItems = null; data.appPrefs[id] = {}; save(); gbPrefRender(); break;
      // MultiListPreference: the boxes toggle a draft, OK stores it.
      case 'gbpref-multi': { const [app, key, i] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key); if (!item) break; const draft = ui.gbMulti ?? [...GBPrefs.get(item, gbPrefsContext(app).values)]; ui.gbMulti = draft.includes(Number(i)) ? draft.filter(x => x !== Number(i)) : [...draft, Number(i)].sort(); renderOverlay(); break; }
      case 'gbpref-multi-ok': { const [, key] = String(id).split(':'); if (ui.gbMulti) gbPrefSet(key, ui.gbMulti); ui.gbMulti = null; ui.overlay = ''; gbPrefRender(); break; }
      // BrowserYesNoPreference: the clears act on the simulated data; Reset to default drops the stored Browser settings.
      case 'gbpref-confirm': { const [app, key] = String(id).split(':');
        if (key === 'privacy_clear_history') { data.browserHistory = []; data.qsbShortcuts = (data.qsbShortcuts || []).filter(s => s.kind !== 'url'); }
        if (key === 'reset_default_preferences') data.appPrefs[app] = {};
        save(); ui.overlay = ''; gbPrefRender(); break; }
      case 'alarm-snooze': {
        const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
        // Snooze duration from the Clock settings (snooze_duration: 5, 10, ... 30 minutes).
        const minutes=5*((data.appPrefs?.clock?.snooze_duration??1)+1);
        if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+minutes*60000;save();}
        ui.overlay='';render();toast(AndroidStrings.format(GBDeskClock.text(i18n.language,'alarm_alert_snooze_set'), String(minutes)));break;
      }
      case 'alarm-dismiss': ui.overlay=''; render(); break;
      default: StoreHost.ids().some(other => other !== ui.view && !other.startsWith('store-') && StoreHost.module(other).action?.(action, button, storeContext())); break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (GBApps.has(ui.view) && GBApps.get(ui.view).submit?.(form.dataset.form, values, gappContext())) return;
    if (moduleView() && StoreHost.submit(form.dataset.form, values, storeContext())) return;
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    // Email's server settings: Next keeps valid fields and returns to the account's settings.
    if (form.dataset.form === 'gbem-server') { data.appPrefs ||= {}; if (GBPrefs.serverSave(form, data.appPrefs['email-servers'] ||= {})) { save(); ui.gbPrefs = ui.gbPrefs?.parent || null; render(); } return; }
    switch (form.dataset.form) {
      default: StoreHost.ids().some(other => other !== ui.view && !other.startsWith('store-') && StoreHost.module(other).submit?.(form.dataset.form, values, storeContext())); break;
    }
  });
  // Select text: a touch on the Browser page or the Google Mail message while the mode is armed.
  document.addEventListener('pointerdown', event => {
    if (!ui.gbSelecting) return;
    const page = event.target.closest('#viewport .gbbr-page, #viewport .gm-body');
    if (!page || ui.gbSelecting !== ui.view) { ui.gbSelecting = null; return; }
    ui.gbSelecting = null;
    GBBrowser.selectDrag(page, event, text => { if (!text) return; ui.clipboard = text; navigator.clipboard?.writeText(text).catch(() => {}); toast(AndroidStrings.resources(() => window.GBStrings?.framework).t('text_copied', i18n.language)); });
  }, true);
  document.addEventListener('input', event => {
    if (moduleView() && StoreHost.input(event, storeContext())) return;
    if (event.target.matches('[data-bk-bright]')) { data.booksPrefs = {...GBGoogleApps.bookPrefs(data), brightness: Number(event.target.value)}; delete data.booksNight; save(); viewport.querySelector('.bk-prefs')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return; }
    // AccountSetupBasics.validateFields: Next and Manual setup follow the address and password (the password is never stored).
    if (event.target.closest('[data-form="gbem-server"]')) { GBPrefs.serverInput(event.target.closest('form'), event.target); return; }
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
  });

  let pointerStart = null, eggTimer = null, dragTimer = null, dragState = null;
  function dragSource(target) {
    const homeWidget = target.closest('.home-widget[data-widget-id]');
    if (homeWidget) {
      const widget = data.homeWidgets[ui.page].find(item => item.id === homeWidget.dataset.widgetId);
      return widget ? { type: 'widget', id: widget.id, widgetType: widget.type, page: ui.page } : null;
    }
    const drawerWidget = target.closest('.drawer-widget[data-widget-type]');
    if (drawerWidget) return { type: 'drawer-widget', widgetType: drawerWidget.dataset.widgetType };
    const icon = target.closest('.launcher-icon');
    if (!icon) return null;
    const folderSlot=icon.closest('[data-folder-slot]');
    if(folderSlot&&ui.overlay==='folder')return {type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot),id:icon.dataset.app};
    const homeSlot = icon.closest('[data-home-slot]');
    if (homeSlot) return { type: 'home', slot: Number(homeSlot.dataset.homeSlot), page: ui.page, id: data.homePages[ui.page][Number(homeSlot.dataset.homeSlot)] };
    const dockSlot = icon.closest('[data-dock-slot]');
    if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) return { type: 'dock', slot: Number(dockSlot.dataset.dockSlot), id: data.dock[Number(dockSlot.dataset.dockSlot)] };
    if (icon.closest('.drawer-apps')) return { type: 'drawer', id: icon.dataset.app };
    return null;
  }
  function startDrag(x, y) {
    if (!pointerStart?.source || dragState) return;
    // Keep touch delivery on the stable screen when a drawer item replaces its view.
    try { screen.setPointerCapture(pointerStart.pointerId); } catch {}
    dragState = pointerStart.source;
    // Workspace.startDrag hides the original view (GONE) while its DragView moves.
    pointerStart.target.closest('.launcher-icon')?.classList.add('drag-source-icon');
    if (dragState.type === 'widget') pointerStart.target.closest('.home-widget')?.classList.add('drag-source-widget');
    if (dragState.type === 'widget') {
      const rect = pointerStart.target.closest('.home-widget').getBoundingClientRect();
      dragState.grabOffset = {x: pointerStart.x - rect.left, y: pointerStart.y - rect.top};
    }
    if (dragState.type === 'drawer' || dragState.type === 'drawer-widget') { ui.view = 'home'; ui.overlay = ''; render(); }
    if (dragState.type === 'drawer-widget') {
      const rect = viewport.querySelector('.home-grid:not([inert])').getBoundingClientRect();
      const size = widgetSize(dragState.widgetType);
      dragState.grabOffset = {x: (rect.width - 12) / 4 * size.width / 2, y: (rect.height - 5) / 4 * size.height / 2};
    }
    const ghost = document.createElement('div'); ghost.className = `drag-ghost${dragState.widgetType ? ' widget-ghost' : ''}`; ghost.innerHTML = dragState.widgetType ? widgetArt(dragState.widgetType) : appIcon(dragState.id); screen.append(ghost);
    // Launcher2 drags a widget at its real span: a live copy when moving, the preview image when adding.
    if (dragState.widgetType && dragState.grabOffset) {
      const source = dragState.type === 'widget' ? pointerStart.target.closest('.home-widget') : null;
      const grid = viewport.querySelector('.home-grid:not([inert])')?.getBoundingClientRect(), size = widgetSize(dragState.widgetType);
      const box = source ? source.getBoundingClientRect() : grid && {width: (grid.width - 12) / 4 * size.width, height: (grid.height - 5) / 4 * size.height};
      if (box) { ghost.classList.add('widget-span-ghost', `widget-${dragState.widgetType}`); ghost.style.width = `${box.width}px`; ghost.style.height = `${box.height}px`; }
      if (source) { ghost.innerHTML = source.innerHTML; ghost.querySelectorAll('button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1')); }
    }
    dragState.ghost = ghost;
    if (!dragState.widgetType && !reducedMotion?.matches) ICSTransitions.play(ghost, ICSTransitions.specs['drag-lift'].enter);
    moveGhost(x, y);
    screen.classList.add('dragging');
    screen.classList.toggle('dragging-from-drawer', dragState.type === 'drawer');
    suppressClickUntil = Date.now() + 500;
  }
  function moveGhost(x, y) {
    if (!dragState) return;
    const rect = screen.getBoundingClientRect();
    const offset = dragState.widgetType ? 65 : 27, grab = dragState.ghost.classList.contains('widget-span-ghost') ? dragState.grabOffset : null;
    dragState.ghost.style.left = `${x - rect.left - (grab ? grab.x : offset)}px`;
    dragState.ghost.style.top = `${y - rect.top - (grab ? grab.y : offset)}px`;
    updateFolderDrag(x,y);
    updateDragOutline(x, y);
    const dropTarget = document.elementFromPoint(x, y)?.closest('[data-drop-remove],[data-drop-info]');
    const removeHover = !!dropTarget?.hasAttribute('data-drop-remove'), infoHover = !!dropTarget?.hasAttribute('data-drop-info') && dragState.type === 'drawer';
    screen.querySelectorAll('.drop-target').forEach(node => node.classList.toggle('drop-hover', node === dropTarget && (removeHover || infoHover)));
    dragState.ghost.classList.toggle('tint-delete', removeHover);
    dragState.ghost.classList.toggle('tint-info', infoHover);
    const direction = ui.overlay ? 0 : x - rect.left < dp(21) ? -1 : rect.right - x < dp(21) ? 1 : 0;
    if (direction !== dragState.edgeDirection) {
      clearTimeout(dragState.edgeTimer);
      dragState.edgeDirection = direction;
      if (direction && y > rect.top + 85 && y < rect.bottom - 120) dragState.edgeTimer = setTimeout(() => {
        if (dragState) { setHomePage(ui.page + direction); dragState.edgeDirection = 0; }
      }, 550);
    }
  }
  /* CellLayout drag outlines: a holo-blue outline marks the cell where the item would land.
     Each outline fades in and out over config_dragOutlineFadeTime (900 ms) to 128/255 alpha, leaving a short trail. */
  function dragOutlineTarget(x, y) {
    const source = dragState;
    if (!source || ui.overlay) return null;
    const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
    if (source.widgetType) {
      if (!grid) return null;
      const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4)), row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
      if (!widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) return null;
      const size = widgetSize(oldWidget || source.widgetType);
      return {key: `w:${ui.page}:${column}:${row}`, container: grid, style: `grid-column:${column + 1}/span ${size.width};grid-row:${row + 1}/span ${size.height}`};
    }
    const slot = target?.closest('[data-home-slot],[data-dock-slot]');
    if (!slot || slot.querySelector('.launcher-icon:not(.drag-source-icon)')) return null;
    if (slot.hasAttribute('data-home-slot')) {
      const index = Number(slot.dataset.homeSlot);
      if (data.homeWidgets[ui.page].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height)) return null;
      return {key: `h:${ui.page}:${index}`, container: slot};
    }
    return {key: `d:${slot.dataset.dockSlot}`, container: slot};
  }
  function updateDragOutline(x, y) {
    const target = dragOutlineTarget(x, y), source = dragState;
    if ((target?.key || '') === (source.outlineKey || '')) return;
    source.outlineKey = target?.key || '';
    screen.querySelectorAll('.drag-outline:not(.outline-fading)').forEach(node => { node.classList.add('outline-fading'); setTimeout(() => node.remove(), 900); });
    if (!target) return;
    const outline = document.createElement(source.widgetType ? 'div' : 'span');
    outline.className = source.widgetType ? 'drag-outline widget-outline' : 'drag-outline icon-outline';
    outline.setAttribute('aria-hidden', 'true');
    if (source.widgetType) outline.style.cssText = target.style; else outline.innerHTML = `${appIcon(source.id)}<span class="outline-label">&nbsp;</span>`;
    target.container.append(outline);
    requestAnimationFrame(() => outline.classList.add('outline-visible'));
  }
  const clearDragOutlines = () => screen.querySelectorAll('.drag-outline').forEach(node => node.remove());
  /* DragLayer.animateView: the drag view settles into its final cell (or back to its origin);
     DeleteDropTarget shrinks it into Remove; FolderIcon draws it into the folder preview. */
  function landGhost(ghost, destination, trashRect) {
    const finish = () => ghost.remove();
    if (!destination || reducedMotion?.matches || document.hidden) return finish();
    const screenRect = screen.getBoundingClientRect(), k = screenRect.width / screen.clientWidth || 1;
    const local = rect => ({left: (rect.left - screenRect.left) / k, top: (rect.top - screenRect.top) / k, width: rect.width / k, height: rect.height / k});
    const from = local(ghost.getBoundingClientRect());
    ghost.getAnimations().forEach(animation => animation.cancel());
    Object.assign(ghost.style, {transform: 'none', translate: 'none', transformOrigin: '0 0'});
    const base = local(ghost.getBoundingClientRect());
    let target, options, hidden = null;
    if (destination.trash) {
      if (!trashRect) return finish();
      const bin = local(trashRect), width = from.width * .1, height = from.height * .1;
      target = {left: bin.left + bin.width / 2 - width / 2, top: bin.top + bin.height / 2 - height / 2, width, height};
      options = {duration: 250, motion: 'decelerate2', fade: {to: .1, curve: 'decelerateCubic'}};
    } else {
      const element = dragDestination(destination);
      if (!element) return finish();
      const box = destination.widget ? element : element.querySelector('.app-icon') || element;
      target = local(box.getBoundingClientRect());
      if (!destination.widget && box.classList.contains('launcher-folder-icon') && !ghost.querySelector('.launcher-folder-icon')) {
        const size = target.width * .63;
        target = {left: target.left + target.width / 2 - size / 2, top: target.top + target.height / 2 - size / 2, width: size, height: size};
        options = {duration: 400, motion: 'decelerate2', fade: {to: .5, curve: 'accelerate2'}};
      } else {
        options = {duration: ICSTransitions.dropDuration(Math.hypot(target.left - from.left, target.top - from.top))};
        hidden = element; element.style.visibility = 'hidden';
      }
    }
    const animation = ICSTransitions.fly(ghost, base, from, target, options);
    if (!animation) { finish(); if (hidden) hidden.style.visibility = ''; return; }
    animation.finished.catch(() => {}).then(() => { finish(); if (hidden) hidden.style.visibility = ''; });
  }
  function dragDestination(destination) {
    const grid = page => page === ui.page ? viewport.querySelector(`.home-grid[data-home-page="${page}"]`) : null;
    if (destination.widget) return grid(destination.page)?.querySelector(`.home-widget[data-widget-id="${CSS.escape(destination.widget)}"]`) || null;
    if (destination.type === 'home') return grid(destination.page)?.querySelector(`[data-home-slot="${destination.slot}"] .launcher-icon`) || null;
    if (destination.type === 'dock') return viewport.querySelector(`[data-dock-slot="${destination.slot}"] .launcher-icon`);
    if (destination.type === 'folder') {
      const panel = ui.overlay === 'folder' && ui.folderId === destination.folderId ? overlayRoot.querySelector('.launcher-folder') : null;
      const count = ICSLauncherFolders.folder(data, destination.folderId)?.items.length || 0;
      if (panel) return panel.querySelector(`[data-folder-slot="${Math.min(destination.slot, count - 1)}"] .launcher-icon`);
      return [...viewport.querySelectorAll('[data-folder-id]')].find(button => button.dataset.folderId === destination.folderId && !button.closest('[inert]')) || null;
    }
    return null;
  }
  /* Folder.realTimeReorder: after hovering a cell for 150 ms, icons between the empty cell and the
     target slide over in 230 ms, each starting 30 ms later than the previous (decaying by 0.9). */
  function folderReorder(x, y, panel) {
    const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
    if (!folder) return;
    const fromHere = source.type === 'folder' && source.folderId === ui.folderId;
    if (!fromHere && folder.items.length >= ICSLauncherFolders.capacity) return;
    const cells = [...panel.querySelectorAll('[data-folder-slot]')];
    const count = Math.min(cells.length, fromHere ? folder.items.length : folder.items.length + 1);
    if (source.reorderPanel !== panel) { source.reorderPanel = panel; source.folderGap = Math.min(fromHere ? source.slot : folder.items.length, count - 1); source.folderGapTarget = source.folderGap; }
    let nearest = 0, distance = Infinity;
    cells.slice(0, count).forEach((cell, index) => { const rect = cell.getBoundingClientRect(), d = Math.hypot(x - rect.left - rect.width / 2, y - rect.top - rect.height / 2); if (d < distance) { distance = d; nearest = index; } });
    if (nearest === source.folderGapTarget) return;
    source.folderGapTarget = nearest;
    clearTimeout(source.reorderTimer);
    source.reorderTimer = setTimeout(() => applyFolderGap(panel, nearest), 150);
  }
  function applyFolderGap(panel, gap) {
    const source = dragState, folder = ICSLauncherFolders.folder(data, ui.folderId);
    if (!source || !folder || source.reorderPanel !== panel || !panel.isConnected) return;
    const fromHere = source.type === 'folder' && source.folderId === ui.folderId, previous = source.folderGap;
    const cells = [...panel.querySelectorAll('[data-folder-slot]')], rects = cells.map(cell => cell.getBoundingClientRect());
    const k = screen.getBoundingClientRect().width / screen.clientWidth || 1;
    const remaining = folder.items.map((_, slot) => slot).filter(slot => !(fromHere && slot === source.slot));
    const moves = remaining.map((slot, order) => ({slot, from: order >= previous ? order + 1 : order, to: order >= gap ? order + 1 : order})).filter(move => move.from !== move.to && rects[move.to]);
    moves.sort((a, b) => Math.abs(a.from - previous) - Math.abs(b.from - previous));
    let delay = 0, step = 30;
    for (const move of moves) {
      const icon = cells[move.slot]?.querySelector('.launcher-icon');
      if (!icon) continue;
      const dx = (rects[move.to].left - rects[move.slot].left) / k, dy = (rects[move.to].top - rects[move.slot].top) / k;
      icon.style.transition = reducedMotion?.matches ? 'none' : `transform 230ms cubic-bezier(.37,0,.63,1) ${Math.round(delay)}ms`;
      icon.style.transform = dx || dy ? `translate(${dx}px,${dy}px)` : '';
      delay += step; step *= .9;
    }
    source.folderGap = gap;
  }
  function clearFolderDragFeedback(){screen.querySelectorAll('.folder-drop-target,.folder-reorder-target,.drag-source-icon,.drag-source-widget').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target','drag-source-icon','drag-source-widget'));}
  function updateFolderDrag(x,y) {
    const source=dragState;if(!source||source.widgetType)return;
    screen.querySelectorAll('.folder-drop-target,.folder-reorder-target').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target'));
    const target=document.elementFromPoint(x,y),panel=overlayRoot.querySelector('.launcher-folder');
    if(panel){
      const rect=panel.getBoundingClientRect(),inside=x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
      if(!inside&&!source.folderExitTimer)source.folderExitTimer=setTimeout(()=>{if(dragState===source){ui.overlay='';renderOverlay();source.folderExitTimer=null;source.hoverFolder=null;}},800);
      else if(inside){clearTimeout(source.folderExitTimer);source.folderExitTimer=null;folderReorder(x,y,panel);}
      return;
    }
    const slot=target?.closest('[data-home-slot],[data-dock-slot]'),icon=slot?.querySelector('.launcher-icon');
    const sourceIsFolder=!!ICSLauncherFolders.folder(data,source.id);
    const sameSlot=slot&&(slot.hasAttribute('data-home-slot')?source.type==='home'&&source.page===ui.page&&source.slot===Number(slot.dataset.homeSlot):source.type==='dock'&&source.slot===Number(slot.dataset.dockSlot));
    const folderId=icon?.dataset.folderId;
    if(icon&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
    const hoverId=!sourceIsFolder&&!sameSlot?folderId:null;
    if(hoverId!==source.hoverFolder){
      clearTimeout(source.folderHoverTimer);source.hoverFolder=hoverId;
      if(hoverId)source.folderHoverTimer=setTimeout(()=>{if(dragState===source&&ICSLauncherFolders.folder(data,hoverId)?.items.length<ICSLauncherFolders.capacity){ui.folderId=hoverId;ui.overlay='folder';renderOverlay();}},700);
    }
  }
  function finishDrag(x, y) {
    if (!dragState) return false;
    const source = dragState;
    let target = document.elementFromPoint(x, y);
    if(ui.overlay==='folder'&&!target?.closest('.launcher-folder')){ui.overlay='';renderOverlay();target=document.elementFromPoint(x,y);}
    const folderSlot=target?.closest('[data-folder-slot]');
    let homeSlot = target?.closest('[data-home-slot]');
    const grid = target?.closest('.home-grid');
    if (!homeSlot && grid) {
      const rect = grid.getBoundingClientRect();
      const column = Math.min(3, Math.max(0, Math.floor((x - rect.left) / rect.width * 4)));
      const row = Math.min(3, Math.max(0, Math.floor((y - rect.top) / rect.height * 4)));
      homeSlot = grid.querySelector(`[data-home-slot="${row * 4 + column}"]`);
    }
    const dockSlot = target?.closest('[data-dock-slot]');
    const pageButton = target?.closest('.page-indicators button');
    const remove = target?.closest('[data-drop-remove]');
    const trashRect = remove?.getBoundingClientRect();
    if (source.type === 'drawer' && target?.closest('[data-drop-info]')) {
      clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
      openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); suppressClickUntil = Date.now() + 350;
      return true;
    }
    let destination = null;
    if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (oldWidget) destination = {widget: oldWidget.id, page: source.page};
      if (remove && oldWidget) { data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id); destination = {trash: true}; }
      else if (homeSlot) {
        const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
        const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4));
        const row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
        if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
          if (oldWidget) {
            data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
            oldWidget.x = column; oldWidget.y = row;
            data.homeWidgets[ui.page].push(oldWidget);
            destination = {widget: oldWidget.id, page: ui.page};
          }
          else { const added = addWidget(source.widgetType, column, row); if (added) destination = {widget: added.id, page: ui.page}; }
        } else toast('This home screen is full');
      }
    } else {
      let result=null,attempt=null;
      const dropAt=location=>{attempt=location;return ICSLauncherFolders.drop(data,source,location);};
      if(remove)result={ok:ICSLauncherFolders.remove(data,source)};
      else if((folderSlot||target?.closest('.launcher-folder-grid'))&&source.reorderPanel&&source.reorderPanel===overlayRoot.querySelector('.launcher-folder'))result=dropAt({type:'folder',folderId:ui.folderId,slot:source.folderGap});
      else if(folderSlot)result=dropAt({type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot)});
      else if(target?.closest('.launcher-folder-grid'))result=dropAt({type:'folder',folderId:ui.folderId,slot:ICSLauncherFolders.folder(data,ui.folderId).items.length});
      else if(homeSlot){
        const slot=Number(homeSlot.dataset.homeSlot);
        const covered=data.homeWidgets[ui.page].some(widget=>slot%4>=widget.x&&slot%4<widget.x+widgetSize(widget).width&&Math.floor(slot/4)>=widget.y&&Math.floor(slot/4)<widget.y+widgetSize(widget).height);
        const occupant=data.homePages[ui.page][slot],folderTarget=occupant&&ICSLauncherFolders.folder(data,occupant);
        const own=source.type==='home'&&source.page===ui.page&&source.slot===slot;
        if(folderTarget&&!own)result=dropAt({type:'folder',folderId:occupant,slot:folderTarget.items.length});
        else if(!covered&&(!occupant||own))result=dropAt({type:'home',page:ui.page,slot});
        else{
          const vacant=index=>(data.homePages[ui.page][index]===null||source.type==='home'&&source.page===ui.page&&source.slot===index)&&!data.homeWidgets[ui.page].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height);
          const nearest=Array.from({length:16},(_,index)=>index).filter(vacant).sort((a,b)=>Math.hypot(a%4-slot%4,Math.floor(a/4)-Math.floor(slot/4))-Math.hypot(b%4-slot%4,Math.floor(b/4)-Math.floor(slot/4)))[0];
          result=nearest===undefined?{ok:false,error:'No more room on this Home screen.'}:dropAt({type:'home',page:ui.page,slot:nearest});
        }
      }else if(dockSlot)result=dropAt({type:'dock',slot:Number(dockSlot.dataset.dockSlot)});
      else if(pageButton){
        const nextPage=Number(pageButton.dataset.id);
        const slot=data.homePages[nextPage].findIndex((id,index)=>id===null&&!data.homeWidgets[nextPage].some(widget=>index%4>=widget.x&&index%4<widget.x+widgetSize(widget).width&&Math.floor(index/4)>=widget.y&&Math.floor(index/4)<widget.y+widgetSize(widget).height));
        if(slot>=0){result=dropAt({type:'home',page:nextPage,slot});if(result.ok)ui.page=nextPage;}
        else result={ok:false,error:'This home screen is full'};
      }
      if(result?.error)toast(result.error);
      if(ui.overlay==='folder'&&!ICSLauncherFolders.folder(data,ui.folderId))ui.overlay='';
      // A folder that received the item may now sit where the target icon was.
      if(remove&&result?.ok)destination={trash:true};
      else if(result?.ok&&attempt)destination=attempt;
      else if(['home','dock','folder'].includes(source.type))destination=source;
    }
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearFolderDragFeedback();
    clearTimeout(source.edgeTimer); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
    save(); render(); suppressClickUntil = Date.now() + 350;
    landGhost(source.ghost, destination, trashRect);
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(0, Math.min(4, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(${-ui.page * 100}%)`; snapResting(track);
    tweenWallpaperOffset(ui.page / 4);
    if (data.wallpaper !== 99) { screen.style.transition = 'background-position .35s cubic-bezier(.16,1,.3,1)'; screen.style.backgroundPositionX = `${ui.page * 25}%`; }
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
    // Launcher.updateArrows: the previous/next buttons show one dot per screen on that side.
    const home = viewport.querySelector('.home-view.gbl');
    if (home) { home.querySelectorAll('.gbl-arrow').forEach(node => node.remove()); home.querySelector('.gbl-cluster')?.insertAdjacentHTML('beforebegin', GBLauncher.arrows(ui.page, 5, key => i18n.t(key))); }
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  /* WallpaperService visibility: the engine draws only while its window shows (home and keyguard, or the picker's
     preview), and the launcher feeds it the workspace scroll as an x offset across the five pages. */
  function syncLiveWallpaper() {
    const lwSub = ui.view === 'live-wallpapers' ? String(ui.sub || '') : '';
    const preview = lwSub.startsWith('preview:') || lwSub === 'settings:magicsmoke';
    const id = lwSub.startsWith('preview:') ? lwSub.slice(8) : preview ? 'magicsmoke' : data.liveWallpaper?.id || '';
    const visible = !!id && (preview || ['home', 'lock'].includes(ui.view) || ui.view === 'clock' && !ui.sub) && !ui.sleeping && !ui.power;
    const key = id ? `${id}:${preview}` : '';
    if (liveWallpaper && liveWallpaper.key !== key) { liveWallpaper.destroy(); liveWallpaper = null; }
    if (key && !liveWallpaper) {
      liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : ui.page / 4, audio: () => !!ui.music?.playing, deviceWidth: 480});
      if (liveWallpaper) liveWallpaper.key = key;
    }
    liveLayer.hidden = !visible; liveWallpaper?.pause(!visible);
    if (liveWallpaper && !preview && ui.view === 'home') liveWallpaper.setOffset(ui.page / 4);
    screen.classList.toggle('live-wallpaper', !!data.liveWallpaper?.id || preview);
  }
  function tweenWallpaperOffset(target) {
    if (!liveWallpaper) return;
    cancelAnimationFrame(liveOffsetTween);
    const from = liveWallpaper.offset ?? target, start = performance.now();
    const step = now => { const t = Math.min(1, (now - start) / 350), value = from + (target - from) * (1 - Math.pow(1 - t, 3)); liveWallpaper?.setOffset(value); if (liveWallpaper) liveWallpaper.offset = value; if (t < 1) liveOffsetTween = requestAnimationFrame(step); };
    liveOffsetTween = requestAnimationFrame(step);
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-pages');
    if (!content) return;
    const distance = Math.max(-(4 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
    if (liveWallpaper) { const value = (ui.page - distance / screen.clientWidth) / 4; liveWallpaper.setOffset(value); liveWallpaper.offset = value; }
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(0, Math.min(4, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    suppressClickUntil = Date.now() + 350;
    setHomePage(Math.abs(dx) > dp(52) ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const pageCount = ui.drawerTab === 'apps' ? Math.ceil(apps.length / 20) : Math.ceil(widgetTypes.length / 4);
    const nextPage = Math.max(0,Math.min(pageCount - 1,ui.drawerPage + (dx < 0 ? 1 : -1)));
    suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > dp(52) && nextPage !== ui.drawerPage) {
      ui.drawerPage = nextPage; render();
      viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
    } else {
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
    }
  }
  let lastWheelPage = 0;
  screen.addEventListener('wheel', event => {
    if (ui.view !== 'home' || ui.overlay || dragState || !event.target.closest('.home-content')) return;
    const widgetList = event.target.closest('.calw-list');
    if (widgetList && Math.abs(event.deltaY) > Math.abs(event.deltaX) && widgetList.scrollHeight > widgetList.clientHeight) return;
    event.preventDefault();
    const stack = event.target.closest('[data-photo-stack]');
    if (stack && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      if (Math.abs(event.deltaY) >= 8 && performance.now() - lastWheelPage >= 300) { lastWheelPage = performance.now(); stepPhotoStack(stack.dataset.photoStack, event.deltaY > 0 ? 1 : -1); }
      return;
    }
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (Math.abs(delta) < 8 || performance.now() - lastWheelPage < 300) return;
    lastWheelPage = performance.now();
    setHomePage(ui.page + Math.sign(delta));
  }, {passive:false});
  screen.addEventListener('dragstart', event => event.preventDefault());
  let homeLongPressTimer = null, messageHoldTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    if (!dragState && ui.view === 'home' && !ui.overlay && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overlay = 'wallpaper-source'; renderOverlay(); }
  });
  // Older WebKit versions may still start page rubber-banding during a custom
  // gesture. Cancel only gestures owned by the simulator; lists scroll natively.
  screen.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || !pointerStart || event.target.closest('input, textarea, select')) return;
    if (pointerStart.source || pointerStart.target.closest('#status-bar, #nav-bar, .home-view, .drawer-view, .lock-view, .shade-top, .shade-handle, .calc-pager, .easter-robot')) {
      if (event.cancelable) event.preventDefault();
    }
  }, { passive: false });
  // A long press opens a dialog under the finger; the release must not activate it (Android ignores it too).
  function suppressReleaseClick() {
    suppressClickUntil = Infinity;
    window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
    window.addEventListener('pointercancel', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
  }
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.gbdc-alarms,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !ui.locked && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.gbsh-close'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; suppressReleaseClick(); }, 550);
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), 440);
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > 8) { clearTimeout(homeLongPressTimer); clearTimeout(messageHoldTimer); }
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy) * 1.1 && performance.now() - pointerStart.downTime < 260)) {
      pointerStart.drawerSwiping = true;
      clearTimeout(dragTimer);
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
      return;
    }
    const recentCard = ui.overlay === 'recent' ? pointerStart.target.closest('.recent-item') : ui.overlay === 'shade' ? pointerStart.target.closest('.notification') : null;
    if (recentCard && (pointerStart.recentSwiping || Math.abs(dx) > dp(10) && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.recentSwiping = true;
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
    }
    if (pointerStart.lockDrag) { event.preventDefault(); pointerStart.lockActive = lockMove(dx, dy); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && Math.abs(dy) > dp(5)) {
      const rect = screen.getBoundingClientRect(), scale = screen.clientHeight / rect.height;
      if (!pointerStart.shadeDragging) {
        pointerStart.shadeDragging = true; stopShade?.(); stopShade = null;
        const panel = overlayRoot.querySelector('.gbsh-panel');
        const start = panel ? new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom() : statusRoot.offsetHeight;
        shadeTracking = {expanded: ui.overlay === 'shade', offset: pointerStart.shadeCloseEligible ? start - (pointerStart.y - rect.top) * scale : 0, y: start, samples: []};
        if (ui.overlay !== 'shade') { ui.overlay = 'shade'; renderOverlay(); }
        try { screen.setPointerCapture(event.pointerId); } catch {}
      }
      event.preventDefault();
      const y = Math.max(statusRoot.offsetHeight, Math.min(shadeBottom(), (event.clientY - rect.top) * scale + shadeTracking.offset));
      shadeTracking.y = y; shadeTracking.samples.push([performance.now(), y]); if (shadeTracking.samples.length > 6) shadeTracking.samples.shift();
      const panel = overlayRoot.querySelector('.gbsh-panel'); if (panel) GBStatusBar.place(panel, y, shadeBottom());
      return;
    }
    // StackView: a vertical fling on the front picture moves through the stack.
    if (pointerStart.photoStack && (pointerStart.photoSwiping || Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx) * 1.2)) {
      if (!pointerStart.photoSwiping) { pointerStart.photoSwiping = true; clearTimeout(dragTimer); suppressClickUntil = Date.now() + 350; try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const front = viewport.querySelector(`[data-photo-stack="${CSS.escape(pointerStart.photoStack)}"] .phw-front`);
      if (front) { front.style.transition = 'none'; front.style.transform = `translateY(${Math.max(-60, Math.min(90, dy))}px) rotate(${Math.max(-6, Math.min(6, dy / 15))}deg)`; front.style.opacity = String(Math.max(.35, 1 - Math.abs(dy) / 160)); }
      return;
    }
    if (pointerStart.scrolling) { event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return; }
    if (pointerStart.scrollTarget && Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx)) {
      clearTimeout(dragTimer);
      pointerStart.scrolling = true; screen.classList.add('settings-scrolling');
      try { screen.setPointerCapture(event.pointerId); } catch {}
      suppressClickUntil = Date.now() + 350;
      event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return;
    }
    if (pointerStart.swiping) { event.preventDefault(); moveHomePage(dx); return; }
    const distance = Math.hypot(dx, dy);
    if (distance > 9) clearTimeout(dragTimer);
    const horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
    const quickHomeIcon = ['home','widget'].includes(pointerStart.source?.type) && performance.now() - pointerStart.downTime < 260;
    if (pointerStart.pageSwipeEligible && horizontal && Math.abs(dx) > (pointerStart.source ? 28 : 10) && (!pointerStart.source || quickHomeIcon)) {
      pointerStart.swiping = true;
      screen.classList.add('page-swiping');
      try { screen.setPointerCapture(event.pointerId); } catch {}
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      moveHomePage(dx);
      return;
    }
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal)) startDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.drawerSwiping) { finishDrawerPage(dx); pointerStart = null; return; }
    if (pointerStart.recentSwiping) {
      const card = pointerStart.target.closest('.recent-item, .notification');
      if (card) {
        card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
        if (Math.abs(dx) > dp(64)) {
          const id = card.dataset.app;
          card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
          card.style.opacity = '0';
          setTimeout(() => {
            if (card.classList.contains('notification')) {
              data.notifications = data.notifications.filter(item => item.id !== Number(card.dataset.id));
              save(); renderStatus();
              if (ui.overlay === 'shade') { if (!data.notifications.length) ui.overlay = ''; renderOverlay(); }
              return;
            }
            ui.recent = ui.recent.filter(item => item !== id);
            if (ui.overlay !== 'recent') return;
            if (!ui.recent.length) ui.overlay = '';
            renderOverlay();
          }, 160);
        } else { card.style.transform = ''; card.style.opacity = ''; }
      }
      suppressClickUntil = Date.now() + 350;
      pointerStart = null; return;
    }
    if (pointerStart.shadeDragging) {
      suppressClickUntil = Date.now() + 350;
      const track = shadeTracking; shadeTracking = null;
      const [first, last] = [track.samples[0], track.samples.at(-1)];
      let velocity = first && last && last[0] > first[0] ? (last[1] - first[1]) / ((last[0] - first[0]) / 1000) : 0;
      const expand = GBStatusBar.flingDirection(track.expanded, track.y, velocity, screen.clientHeight);
      if (expand ? velocity < 0 : velocity > 0) velocity = 0;
      shadeFling(track.y, velocity, expand);
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      const active = lockMove(dx, dy);
      if (!active && Math.hypot(dx, dy) > 6) suppressClickUntil = Date.now() + 350;
      lockRelease(active);
      pointerStart = null; return;
    }
    if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.swiping || pointerStart.pageSwipeEligible && !dragState && Math.abs(dx) > dp(52) && Math.abs(dx) > Math.abs(dy) && (!pointerStart.source || pointerStart.source.type === 'home' && performance.now() - pointerStart.downTime < 260)) {
      finishHomePage(dx); pointerStart = null; return;
    }
    if (!dragState && pointerStart?.source && !['drawer', 'drawer-widget'].includes(pointerStart.source.type) && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > 9) startDrag(event.clientX, event.clientY);
    if (finishDrag(event.clientX, event.clientY)) { pointerStart = null; return; }
    if (!pointerStart) return;
    if (ui.overlay === 'shade' && pointerStart.target.closest('.notification') && Math.abs(dx) > dp(64)) { const id = Number(pointerStart.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); pointerStart = null; return; }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { clearTimeout(messageHoldTimer); clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (moduleView() && StoreHost.key(event, storeContext())) return;
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });
  function powerKey() { if (ui.power === 'off') { bootUp(); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
  // Touch keys: any touch on the device lights them; holding Home for the 500 ms long-press timeout opens the recent apps.
  document.querySelector('#device').addEventListener('pointerdown', pokeKeylight, true);
  document.addEventListener('keydown', pokeKeylight, true);
  // Live dialog controls: "Show password." and "Use incoming call volume for notifications".
  overlayRoot.addEventListener('change', event => {
    if (event.target.matches('[data-wifi-show]')) { const input = overlayRoot.querySelector('[data-wifi-password]'); if (input) input.type = event.target.checked ? 'text' : 'password'; }
    if (event.target.matches('[data-vol-same]')) overlayRoot.querySelector('[data-vol-notification]')?.toggleAttribute('hidden', event.target.checked);
  });
  let previewHold = 0;
  viewport.addEventListener('pointerdown', event => {
    const anchor = event.target.closest('.gbl-arrow,.gbl-allapps'); if (!anchor || event.button || ui.view !== 'home') return;
    clearTimeout(previewHold);
    previewHold = setTimeout(() => {
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (data.settings.haptic !== false) navigator.vibrate?.(30);
      ui.gbPreviewAnchor = anchor.classList.contains('gbl-allapps') ? 'apps' : anchor.classList.contains('gbl-arrow-right') ? 'next' : 'previous';
      ui.overlay = 'gb-previews'; renderOverlay();
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) viewport.addEventListener(type, () => clearTimeout(previewHold));
  let folderTitleHold = 0;
  overlayRoot.addEventListener('pointerdown', event => {
    if (!event.target.closest('[data-gb-folder-title]') || event.button) return;
    clearTimeout(folderTitleHold);
    folderTitleHold = setTimeout(() => {
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (ICSLauncherFolders.folder(data, ui.folderId)?.live) return;
      ui.overlay = 'gb-dialog-rename'; renderOverlay(); overlayRoot.querySelector('.gbdlg input')?.select();
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) overlayRoot.addEventListener(type, () => clearTimeout(folderTitleHold));
  let homeHold = 0;
  navRoot.addEventListener('pointerdown', event => {
    const key = event.target.closest('.touch-home'); if (!key || key.disabled || event.button) return;
    clearTimeout(homeHold);
    homeHold = setTimeout(() => {
      homeHold = 0;
      const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
      window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
      if (ui.view !== 'lock' && ui.overlay !== 'recent') { captureRecentView(); ui.overlay = 'recent'; renderOverlay(); }
    }, 500);
  });
  for (const type of ['pointerup', 'pointercancel', 'pointerleave']) navRoot.addEventListener(type, () => { clearTimeout(homeHold); homeHold = 0; });
  for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
  // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
  function powerConfirm() {
    ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
    setTimeout(powerOff, GlobalActions.SHUTDOWN_MS);
  }
  function powerOff() {
    if (ui.activeCall) ui.activeCall = null;
    if (ui.music) ui.music.playing = false;
    ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.power = 'off';
    render(); renderPower();
  }
  function bootUp(booted) {
    booted ||= AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
    ui.power = 'boot'; renderPower();
    // Finish after the native movie, or after a requested skip once startup resources are ready.
    let finished = false, stop = () => {};
    const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('2.3.6'); ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); lastActivity = Date.now(); };
    stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
    return finish;
  }
  /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
     Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
  function coldBoot() {
    if (!AndroidBoot.shouldBoot('2.3.6')) return;
    const booted = AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
    const finish = bootUp(booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); suppressClickUntil = Date.now() + 350; booted.then(finish); };
    const off = () => { powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
  }
  // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
  const volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; screen.append(volumeLayer);
  let volumeTimer = 0, volumePrevious = 0;
  const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
  function volumeKey(direction) {
    if (ui.power) return;
    // AlarmAlert: the side buttons do what Clock's volume_button_setting says (None / Snooze / Dismiss).
    if (ui.overlay === 'clock-ringing') { const how = data.appPrefs?.clock?.volume_button_setting ?? 2; if (how) { const key = document.createElement('button'); key.dataset.action = how === 1 ? 'alarm-snooze' : 'alarm-dismiss'; overlayRoot.append(key); key.click(); key.remove(); return; } }
    const stream = volumeStream();
    // With the screen off the keys only reach music that is playing, and no panel is shown.
    if (ui.sleeping && stream !== 'music') return;
    const result = VolumePanel.adjust(data.settings, stream, direction, volumePrevious); volumePrevious = direction;
    save(); renderStatus();
    if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
    if (!ui.sleeping) showVolume(stream);
  }
  function showVolume(stream) {
    volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key), i18n.language);
    VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
    resetVolumeTimeout();
  }
  function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
  function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
  // The volume toast stays for its LENGTH_SHORT whatever is touched.
  // Held keys repeat after config_keyRepeatTimeout (500 ms) every 50 ms, as key repeats do.
  function bindVolumeKey(element, direction) {
    let delay = 0, repeat = 0;
    const stop = () => { clearTimeout(delay); clearInterval(repeat); };
    element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); const dir = typeof direction === 'function' ? direction(event) : direction; volumeKey(dir); stop(); delay = setTimeout(() => { repeat = setInterval(() => volumeKey(dir), 50); }, 500); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, stop));
    element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
  }
  bindVolumeKey(document.querySelector('#volume-down'), -1);
  bindVolumeKey(document.querySelector('#volume-up'), 1);
  bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
  const powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; screen.append(powerLayer);
  function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ''; }
  screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;suppressClickUntil=Date.now()+350;if(ui.locked)render();else home(false);}},true);
  // Full screen (Fullscreen API): hides the browser chrome on phones and keeps portrait where the browser allows it.
  const fullscreenButton = document.querySelector('#fullscreen-button');
  const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
  if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fullscreenButton.hidden = true;
  fullscreenButton.addEventListener('click', () => {
    if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else { const root = document.documentElement, request = root.requestFullscreen || root.webkitRequestFullscreen; Promise.resolve(request.call(root, {navigationUI: 'hide'})).then(() => screen.orientation?.lock?.('portrait')).catch(() => {}); }
  });
  const syncFullscreen = () => {
    const active = !!fullscreenElement(), label = i18n.t(active ? 'Exit full screen' : 'Full screen');
    document.documentElement.classList.toggle('is-fullscreen', active);
    fullscreenButton.title = label; fullscreenButton.setAttribute('aria-label', label);
  };
  document.addEventListener('fullscreenchange', syncFullscreen); document.addEventListener('webkitfullscreenchange', syncFullscreen);
  // The handle slides the header in; it hides again 4 s after the last touch on it.
  let peekTimer = 0;
  const peek = () => { document.documentElement.classList.add('header-peek'); clearTimeout(peekTimer); peekTimer = setTimeout(() => document.documentElement.classList.remove('header-peek'), 4000); };
  document.querySelector('#header-handle').addEventListener('click', peek);
  document.querySelector('.site-header').addEventListener('pointerdown', () => { if (document.documentElement.classList.contains('header-peek')) peek(); });
  document.addEventListener('fullscreenchange', () => { if (!fullscreenElement()) { clearTimeout(peekTimer); document.documentElement.classList.remove('header-peek'); } });
  const languageSelect = document.querySelector('#language-select');
  languageSelect.value = i18n.language;
  languageSelect.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
  document.querySelector('#reset-button').addEventListener('click', () => {
    if (!confirm(i18n.t('Reset all local Gingerbread simulator data?'))) return;
    resetSimulator();
  });
  let lastWidgetMinute = '';
  setInterval(() => {
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && SCREEN_TIMEOUT[data.settings.screenTimeout ?? GBSettings.DEFAULTS.screenTimeout]!==undefined&&Date.now()-lastActivity>=SCREEN_TIMEOUT[data.settings.screenTimeout ?? GBSettings.DEFAULTS.screenTimeout]){captureRecentView();lockScreen();lastActivity=Date.now();}
    checkAlarms(now);
    checkReminders(now);
    document.querySelectorAll('.analog-clock').forEach(node => {
      node.setAttribute('aria-label', clock());
      node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
      node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
    });
    const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    tickMusic();
    const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
    if (minute(now) !== lastWidgetMinute) {
      lastWidgetMinute = minute(now);
      if (ui.view === 'home' && !ui.overlay && !pointerStart && !dragState && viewport.querySelector('.calw')) render();
    }
  }, 1000);

  i18n.translateDOM(document.body);
  render();
  coldBoot();
})();
