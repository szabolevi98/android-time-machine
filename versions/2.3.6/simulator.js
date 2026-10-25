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
      { id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com' }
    ],
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
    calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1, phoneTab: 'dialpad',
    play: ICSPlayStore.initial(), playHistory: [],
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Nexus S is ready. Explore Android 2.3, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  const tracks = ICSMusic.tracks;
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
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
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
    if (GBApps.has(ui.view)) { GBApps.get(ui.view).keep?.(gappContext()); const items = GBApps.get(ui.view).menu?.(gappContext()) || []; if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'people' && GBContactsIO.has(ui.sub)) { const items = GBContactsIO.menu(ui.sub, gbctContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if ((ui.view === 'phone' && (!ui.activeCall || ui.gbCallBackground) && ui.sub !== 'call-detail') || (ui.view === 'people' && (!ui.sub || ui.sub === 'detail'))) { const items = GBPhone.menu(gbPhoneContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view || ui.view === 'calendar' && ui.gbCalSel || ui.view === 'email' && ui.gbEmSetup) return;
    if (ui.view === 'downloads') { ui.gbMenuItems = GBDownloads.menu(gbDlContext()); ui.overlay = 'gb-menu-settings'; renderOverlay(); return; }
    if (ui.view === 'search') { const items = GBSearch.menu(gbSearchContext()); if (items.length) { ui.qsb.selecting = false; ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); render(); } return; }
    if (ui.view === 'play-store') { const items = GBMarket.menu(gbMarketContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'settings' && GBSettingsPages.has(ui.sub)) { const items = GBSettingsPages.menu(ui.sub, gbPagesContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'camera') { const items = GBCamera.menu(gbCameraContext()); if (!items.length) return; ui.gbcamPopup = ''; ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; render(); renderOverlay(); return; }
    if (ui.view === 'email') { gbEmSync(); const items = GBEmail.menu(gbEmailContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'calendar') { gbCalSyncDraft(); const items = GBCalendar.menu(gbCalContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'browser') { if (ui.gbBrEdit) return; const items = GBBrowser.menu(gbBrowserContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'music') {
      const party = {action: 'music-party', title: musicText(ui.music.party ? 'party_shuffle_off' : 'party_shuffle'), icon: 'gb-mu-ic_menu_party_shuffle.png'};
      ui.gbMenuItems = ui.sub === 'player' ? [{action: 'music-library', title: musicText('goto_start'), icon: 'ic_menu_music_library'}, party, {action: 'music-track-menu-add', title: musicText('add_to_playlist'), icon: 'ic_menu_add'}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: musicText('ringtone_menu'), icon: 'ic_menu_set_as_ringtone'}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: musicText('delete_item'), icon: 'ic_menu_delete'}] : [party, {action: 'music-shuffle-all', title: musicText('shuffle_all'), icon: 'ic_menu_shuffle'}];
      ui.overlay = 'gb-menu-settings'; renderOverlay(); return;
    }
    if (ui.view === 'clock') { const items = GBDeskClock.menu(gbClockContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'calculator') { ui.gbMenuItems = [{action: 'calc-clear', title: calcText('clear_history'), icon: 'gb-calc-clear_history.png'}, ui.calcPanel ? {action: 'calc-panel', id: 0, title: calcText('basic'), icon: 'gb-calc-simple.png'} : {action: 'calc-panel', id: 1, title: calcText('advanced'), icon: 'gb-calc-advanced.png'}]; ui.overlay = 'gb-menu-settings'; renderOverlay(); return; }
    // The slideshow player and Sound Recorder have no menu.
    if (ui.view === 'messaging') { const items = GBMms.menu(gbMmsContext()); if (!items.length) return; ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); return; }
    if (ui.view === 'settings' && GBNetwork.has(ui.sub)) { const items = GBNetwork.menu(ui.sub, gbNetContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
    if (ui.view === 'settings' && GBSettings.has(ui.sub || 'main')) { const items = GBSettings.menu(ui.sub, gbSettingsContext()); if (items.length) { ui.gbMenuItems = items; ui.overlay = 'gb-menu-settings'; renderOverlay(); } return; }
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
  function gbSearchContext() {
    const q = ui.qsb ||= {corpus: '', query: '', selecting: false, page: ''};
    const ctx = {lang: i18n.language, corpus: q.corpus, query: q.query, selecting: q.selecting, page: q.page, corpora: data.qsbCorpora, webSuggest: data.qsbWebSuggest, shortcuts: data.qsbShortcuts || [],
      apps: apps.map(app => [app[0], i18n.t(app[1])]), contacts: data.contacts, tracks: ICSMusic.tracks, history: data.browserHistory || [], titleOf: gbBrowserTitle,
      messages: data.messages.map(m => ({...m, from: contact(m.contact)?.name || ''}))};
    ctx.items = ui.qsbItems = GBSearch.suggest(ctx);
    return ctx;
  }
  function gbSearchRefresh() {
    const ctx = gbSearchContext(), list = viewport.querySelector('.gbqs-list'), form = viewport.querySelector('.gbqs-plate');
    if (list) list.innerHTML = GBSearch.list(ctx.items);
    form?.classList.toggle('empty', !ctx.query);
  }
  function gbSearchLaunch(item) {
    if (!item) return;
    if (!item.shortcut) data.qsbShortcuts = [{kind: item.kind, corpus: item.corpus, id: item.id, text1: item.text1, text2: item.text2 || '', icon: item.icon}, ...(data.qsbShortcuts || []).filter(s => !(s.kind === item.kind && s.id === item.id))].slice(0, 12);
    save(); ui.qsb = null;
    if (item.kind === 'web') { openApp('browser'); navigateBrowser('search:' + item.id); }
    else if (item.kind === 'url') { openApp('browser'); navigateBrowser(item.id); }
    else if (item.kind === 'app') openApp(item.id);
    else if (item.kind === 'contact') { openApp('people'); ui.selectedContact = Number(item.id); ui.sub = 'detail'; render(); }
    else if (item.kind === 'message') openMessageThread(Number(item.id));
    else if (item.kind === 'track') { openApp('music'); ui.music.queue = ICSMusic.tracks.map((_, i) => i); ui.music.track = Number(item.id); ui.music.position = 0; ui.music.playing = true; saveMusic(); ui.sub = 'player'; render(); }
  }
  // Application preference screens (GBPrefs): Browser, Calendar and Email settings, stored in data.appPrefs.
  function gbPrefsContext(app = ui.gbPrefs?.app) {
    data.appPrefs ||= {}; data.appPrefs[app] ||= {};
    return {app, lang: i18n.language, values: data.appPrefs[app], settings: data.settings, homepage: 'http://www.google.com/', account: ICSEmail.account, name: 'Nexus S', multi: ui.gbMulti, t: key => i18n.t(key), mapsCache: !!data.mapsCache, gmailAccount: GBGmail.ACCOUNT, gmailSync: data.appPrefs['gmail-sync'] || {}, servers: data.appPrefs['email-servers'] || {}};
  }
  function gbPrefSet(key, value) { const ctx = gbPrefsContext(); ctx.values[key] = value; save(); }
  // PreferenceActivity keeps its list position while a preference changes.
  function gbPrefRender() { const y = viewport.querySelector('.gbset-list')?.scrollTop || 0; render(); const list = viewport.querySelector('.gbset-list'); if (list) list.scrollTop = y; }
  // DownloadList: data.downloads (seeded on first use), the sort order and the selection live in ui.gbdl.
  function gbDlContext() {
    data.downloads ||= GBDownloads.seed(Date.now());
    const d = ui.gbdl ||= {selected: [], bySize: false, expanded: null};
    return {lang: i18n.language, locale: i18n.locale(), now: Date.now(), hour24: !!data.settings.hour24, downloads: data.downloads, selected: d.selected, bySize: d.bySize, expanded: d.expanded};
  }
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
    if (ui.view === 'messaging') window.GBMmsAttach?.mounted(gbMmsContext());
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
    if (ui.view === 'browser' && !ui.sub && ui.browserFind) highlightBrowserText();
    if(ui.view==='calendar' && viewport.querySelector('.gbcal-scroll')){const box=viewport.querySelector('.gbcal-scroll');box.scrollTop=box.clientHeight*.8;}
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
    if (ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view) return GBPrefs.render(gbPrefsContext());
    if (ui.view === 'email' && ui.gbEmSetup) return GBEmail.setup({lang: i18n.language, ...ui.gbEmSetup});
    if (ui.view === 'calendar' && ui.gbCalSel) return GBCalendar.selectCalendars({lang: i18n.language, account: ICSEmail.account, accountType: GBEmail.text ? GBEmail.text(i18n.language, 'exchange_name') : 'Corporate', ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel'), ...ui.gbCalSel});
    if (GBApps.has(ui.view)) return GBApps.get(ui.view).render(gappContext());
    switch (ui.view) {
      case 'play-store': return GBMarket.render(gbMarketContext());
      case 'search': return GBSearch.render(gbSearchContext());
      case 'downloads': return GBDownloads.render(gbDlContext());
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': { const selected = Number.isInteger(ui.wpChoice) ? ui.wpChoice : Math.max(0, data.wallpaper); return `<div class="app-view gbwp"><div class="gbwp-preview"><img src="assets/gb-wallpaper_${wallpaperFiles[selected]}.jpg" alt=""></div><div class="gbwp-gallery" role="listbox" aria-label="${safe(i18n.t('Wallpapers'))}">${wallpaperFiles.map((name, index) => `<button class="gbwp-item${index === selected ? ' selected' : ''}" role="option" aria-selected="${index === selected}" data-action="gb-wp-pick" data-id="${index}" aria-label="${safe(name.replace(/_/g, ' '))}"><img src="assets/gb-wallpaper_${name}_small.jpg" alt=""></button>`).join('')}</div><button class="gbwp-set" data-action="wallpaper" data-id="${selected}">${safe(i18n.t('Set wallpaper'))}</button></div>`; }
      case 'settings': return renderSettings();
      case 'browser': return renderBrowser();
      case 'phone': return renderPhone();
      case 'people': return renderPeople();
      case 'messaging': return renderMessaging();
      case 'gallery': return renderGallery();
      case 'camera': return renderCamera();
      case 'calendar': return renderCalendar();
      case 'clock': return renderClock();
      case 'calculator': return renderCalculator();
      case 'music': return renderMusic();
      case 'email': return renderEmail();
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if(ui.locked)return;
    if (!appNames[app]) return;
    // A capture for Messaging lasts while the Camera is open; Messaging opens on its compose screen, not over it.
    if (!resume) { ui.gbmaCapture = null; ui.gbceCapture = null; if (app === 'messaging') ui.gbmaScreen = null; }
    captureRecentView();
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; }
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; if (!resume) { ui.gbPrefs = null; ui.gbCalSel = null; ui.gbEmSetup = null; } ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    if (GBApps.has(app)) GBApps.get(app).open?.(gappContext(), resume);
    if (app === 'phone' && ui.activeCall && !resume) { ui.gbCallBackground = true; ui.gbAddCall = false; ui.phoneTab = 'dialpad'; }
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
    if (ui.view === 'messaging' && !ui.overlay && window.GBMmsAttach?.back(gbMmsContext())) { render(); return; }
    if (ui.view === 'settings' && !ui.overlay && GBNetwork.back(gbNetContext())) return;
    if (ui.view === 'people' && !ui.overlay && GBContactsIO.back(gbctContext())) return;
    if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();if(ui.gbSettingsStack?.length)ui.gbSettingsStack.pop();return;}
    if(ui.view==='settings'&&ui.gbSettingsStack)while(ui.gbSettingsStack.length&&ui.gbSettingsStack.at(-1)===ui.sub)ui.gbSettingsStack.pop();
    if(ui.view==='settings'&&ui.sub&&ui.gbSettingsStack?.length&&!ui.overlay){ui.sub=ui.gbSettingsStack.pop();render();return;}
    if(ui.view==='lock'&&ui.gbPasswordEntry&&data.settings.screenLock!=='pattern'){ui.gbPasswordEntry=false;lockControls.lock();render();return;}
    if (ui.gbPrefs && (ui.gbPrefs.view || ui.gbPrefs.app) === ui.view && !ui.overlay) { ui.gbPrefs = ui.gbPrefs.parent || null; render(); return; }
    if (ui.view === 'calendar' && ui.gbCalSel && !ui.overlay) { ui.gbCalSel = null; render(); return; }
    if (ui.view === 'email' && ui.gbEmSetup && !ui.overlay) { ui.gbEmSetup = null; render(); return; }
    if (ui.view === 'search' && !ui.overlay && ui.qsb?.selecting) { ui.qsb.selecting = false; render(); return; }
    if (ui.view === 'search' && !ui.overlay && ui.qsb?.page) { ui.qsb.page = ui.qsb.page === 'settings' ? '' : 'settings'; render(); return; }
    if (GBApps.has(ui.view) && !ui.overlay && GBApps.get(ui.view).back?.(gappContext())) return;
    if (ui.overlay === 'shade') { closeShade(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return; } render(); return; }
    if (ui.view === 'lock') return;
    if(ui.view==='phone' && ui.activeCall && ui.gbAddCall){ui.gbAddCall=false;ui.gbCallBackground=false;render();return;}
    if(ui.view==='phone' && ui.activeCall && !ui.gbCallBackground){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
    if (ui.view === 'people' && (ui.sub === 'edit' || ui.sub === 'new') && viewport.querySelector('.gbce')) { viewport.querySelector('.gbce').requestSubmit(); return; }
    if (ui.view === 'camera' && ui.gbcamPopup) { ui.gbcamPopup = ''; render(); return; }
    // Back in a capture request cancels it (RESULT_CANCELED), a recording included.
    if (ui.view === 'camera' && gbCapture()) { gbcamStopRecording(false); ui.gbcamPopup = ''; if (ui.gbmaCapture) gbmaCancel(); else gbceReturn(null); return; }
    if (ui.view === 'camera' && ui.gbcamRec) { gbcamStopRecording(); render(); return; }
    if (ui.view === 'gallery' && ui.gbgPick && !ui.sub && ui.gbgmPick) { ui.gbgPick = false; ui.gbgmPick = false; ui.view = 'gmail'; render(); return; }
    if (ui.view === 'gallery' && ui.gbgPick && !ui.sub && ui.gbcePick) { ui.gbgPick = false; ui.view = 'people'; ui.sub = ui.gbcePick.sub; ui.gbcePick = null; render(); return; }
    if (ui.view === 'gallery' && ui.gbgPick && !ui.sub) { ui.gbgPick = false; cancelPhotoWidget(); home(false); return; }
    if (ui.view === 'gallery' && ui.gbgCrop) { ui.gbgCrop = null; render(); return; }
    if (ui.view === 'gallery' && ui.gbgPopup) { ui.gbgPopup = ''; render(); return; }
    if (ui.view === 'gallery' && ui.gbgSelect) { gbgEndSelection(); render(); return; }
    if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return; }
    if (ui.view === 'gallery' && ui.sub === 'photo') { ui.sub='album';ui.galleryZoom=false;render();return; }
    if (ui.view === 'email' && ui.sub === 'compose') { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item && [item.to, item.subject, item.body].some(v => String(v || '').trim())) { item.folder = 'Drafts'; gbEmLeaveCompose('message_saved_toast'); } else { data.mailbox = data.mailbox.filter(m => m.id !== ui.emailId); gbEmLeaveCompose(''); } return; }
    if (ui.view === 'calendar' && !ui.sub && ui.gbCalBack) { ui.calendarMode = ui.gbCalBack; ui.gbCalBack = ''; calendarRender(); return; }
    if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return; }
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return; }
    if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const box = viewport.querySelector('.gbmk-scroll'); if (box) box.scrollTop = prev.scroll || 0; return; }
    if (ui.view === 'play-store' && ui.playHistory.length) {
      ui.play = ui.playHistory.pop(); render();
      viewport.querySelector('.play-content').scrollTop = ui.play.scrollTop || 0;
      return;
    }
    if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (ui.view === 'browser' && ui.gbBrEdit) { ui.gbBrEdit = false; render(); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
    if (ui.view === 'settings' && ['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'beam'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return; }
    if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return; }
    if (ui.view === 'messaging' && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return; }
    if (ui.view === 'clock' && ui.sub === 'alarm-edit') { document.querySelector('[data-action="alarm-save"]')?.click(); return; }
    if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return; }
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
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
    // Browser.sharePage: Intent.createChooser(ACTION_SEND text/plain, "Share via"); the AOSP build offers Email and Messaging.
    if (ui.overlay === 'gb-dialog-share') return {title: GBBrowser.text(i18n.language, 'choosertitle_sharevia'), items: [['email', 'Email'], ['messaging', 'Messaging']].map(([id, name]) => ({action: 'gbbr-share-to', id, title: i18n.t(name), icon: `${id}.png`}))};
    if (ui.overlay === 'gb-dialog-emsetup') return GBEmail.setupDialog(ui.gbEmSetupDialog, i18n.language);
    if (ui.overlay === 'gb-dialog-pref') return GBPrefs.dialog(gbPrefsContext(), ui.gbPrefDialog) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-dl') return GBDownloads.dialog(data.downloads?.find(d => d.id === ui.gbdlDialog), i18n.language) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-qsb-clear') return GBSearch.clearDialog(i18n.language);
    if (ui.overlay === 'gb-dialog-gbmk') return GBMarket.dialog(ui.gbmkDialog, gbMarketContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-clearlog') return {title: GBPhone.text(i18n.language, 'clearCallLogConfirmation_title'), icon: 'ic_dialog_alert', message: GBPhone.text(i18n.language, 'clearCallLogConfirmation'), buttons: [{action: 'gbp-clear-log-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
    // Its texts come localized from the images' strings and profile names are the user's: no interface translation.
    if (ui.overlay === 'gb-dialog-gbct') return {...(GBContactsIO.dialog(ui.gbctDialog, gbctContext()) || {title: '', items: []}), noTranslate: true};
    if (ui.overlay === 'gb-dialog-net') return {...(GBNetwork.dialog(ui.gbNetDialog, gbNetContext()) || {title: '', items: []}), noTranslate: true};
    if (ui.overlay === 'gb-dialog-sp') return GBSettingsPages.dialog(ui.gbspDialog, gbPagesContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-ce') return GBContactEditor.dialog(ui.gbceDialog, gbceContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-camera') return {title: GBCamera.text(i18n.language, 'confirm_restore_title'), icon: 'ic_dialog_alert', message: GBCamera.text(i18n.language, 'confirm_restore_message'), buttons: [{action: 'gbcam-restore-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
    if (ui.overlay === 'gb-dialog-gallery') return GBGallery.details(gbGalleryContext()) || {title: '', items: []};
    // CropImage.onSaveClicked: Util.startBackgroundJob's ProgressDialog with no title and saving_image.
    if (ui.overlay === 'gb-dialog-crop-saving') return {custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${safe(GBGallery.text(i18n.language, 'saving_image'))}</span></div>`, cancel: 'noop'};
    if (ui.overlay === 'gb-dialog-email') return GBEmail.dialog(ui.gbEmDialog, gbEmailContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-hotpot') return GBGoogleWidgets.placeDialog(gappContext());
    if (ui.overlay === 'gb-dialog-gapp') return GBApps.get(ui.view)?.dialog?.(ui.gappDialog, gappContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-cal') return GBCalendar.dialog(ui.gbCalDialog, gbCalContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-br') return GBBrowser.dialog(ui.gbBrDialog, gbBrowserContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-music') {
      const track = ICSMusic.tracks[ui.musicSelected], inPlaylist = ui.sub === 'music-group' && String(ui.musicGroup).startsWith('playlist|');
      if (ui.gbMusicDialog === 'add') return {title: musicText('add_to_playlist'), items: [{action: 'music-add-queue', title: musicText('queue')}, {action: 'music-new-playlist', id: 'add', title: musicText('new_playlist')}, ...ui.music.playlists.map(p => ({action: 'music-add-confirm', id: p.id, title: p.name}))]};
      if (ui.gbMusicDialog === 'new') return {title: musicText('new_playlist'), custom: `<form data-form="music-playlist"><input name="name" maxlength="60" required aria-label="${safe(i18n.t('Playlist name'))}" value="${safe(AndroidStrings.format(musicText('new_playlist_name_template'), String(ui.music.playlists.length + 1)))}"></form>`, buttons: [{action: 'music-playlist-save', title: musicText('create_playlist_create_text')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
      return {title: track?.title || '', items: [{action: 'music-play-selected', title: musicText('play_selection')}, {action: 'music-add-to-playlist', title: musicText('add_to_playlist')}, ...(inPlaylist ? [{action: 'music-remove-from-playlist', title: musicText('remove_from_playlist')}] : []), {action: 'gbset-toast', id: 'Unavailable in this simulator', title: musicText('ringtone_menu')}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: musicText('delete_item')}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: musicText('search_title')}]};
    }
    if (ui.overlay === 'gb-dialog-mms') return GBMms.dialog(ui.gbMmsDialog, gbMmsContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-set') return GBSettings.dialog(ui.gbSetDialog, gbSettingsContext()) || {title: '', items: []};
    if (ui.overlay === 'gb-dialog-lw-mapmode') { const modes = ['normal', 'satellite', 'terrain']; return {title: lwText('maps_map_mode'), items: modes.map(id => ({action: 'lw-mapmode-pick', id, title: lwText(`maps_mode_${id}`)})), choice: 'single', selected: modes.indexOf(data.lwPrefs?.maps?.mode || 'satellite'), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
    if (ui.overlay === 'gb-dialog-lw-palette') { const current = data.lwPrefs?.polar?.palette || ''; return {title: lwText('palette'), items: LiveWallpapers.PALETTE_ORDER.map(id => ({action: 'lw-palette-pick', id, title: lwText(id)})), choice: 'single', selected: LiveWallpapers.PALETTE_ORDER.indexOf(current), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
    if (ui.overlay === 'gb-dialog-list') return GBSettings.listDialog(ui.gbListKey, gbSettingsContext()) || {title: '', items: []};
    // BrightnessPreference (preference_dialog_brightness.xml): "Automatic brightness" above the seek bar; OK / Cancel.
    if (ui.overlay === 'gb-dialog-brightness') return {title: GBSettings.text(i18n.language, 'brightness'), custom: `<div class="gbbright"><label><input type="checkbox" ${GBSettings.value(data.settings, 'autoBrightness') ? 'checked' : ''}> ${safe(t('Automatic brightness'))}</label><input type="range" min="10" max="100" value="${ui.brightnessDraft ?? data.settings.brightness}" aria-label="${safe(GBSettings.text(i18n.language, 'brightness'))}"></div>`, buttons: [{action: 'gbset-brightness-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
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
      overlayRoot.innerHTML = GBDeskClock.alert({...gbClockContext(), wallpaper: ui.locked ? screen.style.background : ''});
    } else if (ui.overlay.startsWith('clock-')) {
      const dialog = GBDeskClock.dialog(ui.overlay.slice(6), gbClockContext());
      overlayRoot.innerHTML = dialog ? GBUI.dialog({...dialog, t: key => i18n.t(key)}) : '';
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('music-')) {
      overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = peopleOverlay();
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay === 'play-menu') {
      overlayRoot.innerHTML = '<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="play-my-apps">My apps</button><button data-action="market">Shop</button></div>';
    } else if (ui.overlay === 'calc-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
    } else if (ui.overlay === 'phone-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
    } else if (ui.overlay === 'connectivity-menu') {
      const wifi = ui.connectivityMenu === 'wifi';
      const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-add" ${enabled ? '' : 'disabled'}>Add network</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
    } else if (ui.overlay === 'wifi-add') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-pair') {
      const paired = data.settings.pairedDevice === ui.bluetoothTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
    } else if (ui.overlay === 'bluetooth-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Galaxy Nexus')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-files') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
    } else if (ui.overlay === 'wifi-dialog') {
      const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
      const connected = data.settings.wifiNetwork === ui.wifiTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
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

  const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
  // ZoneList rows and the Date & time summary: timezones.xml's names with their current "GMT+01:00" offsets.
  function gbOffset(zone) { const p = new Intl.DateTimeFormat('en-US', {timeZone: zone, timeZoneName: 'longOffset'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || 'GMT'; const m = p.match(/([+-])(\d+):?(\d*)/); const minutes = m ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] || 0)) : 0; return {minutes, text: `GMT${minutes < 0 ? '-' : '+'}${String(Math.floor(Math.abs(minutes) / 60)).padStart(2, '0')}:${String(Math.abs(minutes) % 60).padStart(2, '0')}`}; }
  function gbZones() { const col = {en: 1, hu: 2, de: 3, fr: 4, es: 5}[i18n.language] || 1; const list = (window.GBTimeZones || []).map(z => ({id: z[0], name: z[col], ...gbOffset(z[0])})).map(z => ({...z, offset: z.text})); return ui.gbZoneSort === 'name' ? list.sort((a, b) => a.name.localeCompare(b.name, i18n.locale())) : list.sort((a, b) => a.minutes - b.minutes); }
  function gbZoneText() { const id = ICSSystemSettings.zone(data), z = (window.GBTimeZones || []).find(row => row[0] === id), col = {en: 1, hu: 2, de: 3, fr: 4, es: 5}[i18n.language] || 1; return `${gbOffset(id).text}, ${z ? z[col] : new Intl.DateTimeFormat(i18n.locale(), {timeZone: id, timeZoneName: 'long'}).formatToParts(new Date()).find(x => x.type === 'timeZoneName')?.value || id}`; }
  // gb-network.js: the hotspot, VPN, APN, network operator and credential storage screens and their dialogs.
  function gbNetContext() {
    return {data, ui, lang: i18n.language, t: key => i18n.t(key), save, render, renderOverlay, renderStatus, toast, overlayRoot,
      go: sub => { (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = sub; render(); },
      pop: () => { ui.sub = (ui.gbSettingsStack || []).pop() ?? ''; render(); },
      openBrowser: url => { openApp('browser'); navigateBrowser(url); },
      openSettings: sub => { ui.overlay = ''; renderOverlay(); ui.view = 'settings'; ui.sub = sub; ui.gbSettingsStack = sub === 'vpn' ? ['', 'wireless'] : ['', 'wireless']; render(); }};
  }
  function gbSettingsContext() {
    const now = deviceDate(), lang = i18n.language;
    const formats = [now.toLocaleDateString(i18n.locale()), `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`, `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`, `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`];
    const up = Math.floor(performance.now() / 1000) + 9240;
    return {settings: data.settings, lang, t: key => i18n.t(key), carrier: carrierName(), cred: GBNetwork.credentialRows({data}), hotspot: GBNetwork.hotspotText(data, ui, lang), hotspotBusy: !!ui.gbApTurning, date: formats[GBSettings.value(data.settings, 'dateFormat')] || formats[0], time: gbClock() + (data.settings.hour24 ? '' : now.getHours() < 12 ? ' AM' : ' PM'), zone: gbZoneText(), zones: gbZones(), zoneSort: ui.gbZoneSort || 'offset', draft: ui.gbDtDraft, locale: i18n.locale(), dateFormats: [AndroidStrings.format(GBSettings.text(lang, 'normal_date_format'), formats[0]), ...formats.slice(1)],
      languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[lang] || 'English',
      // WifiSettings sorts the connected network first, then by signal; the paired device and the last scan's results.
      networks: allWifiNetworks().slice().sort((a, b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name)),
      btDevices: [...(data.settings.pairedDevice ? [{name: data.settings.pairedDevice, paired: true, connected: true, kind: 'headset_hfp'}] : []), ...(ui.btFound || []).filter(device => device.name !== data.settings.pairedDevice)],
      uptime: `${Math.floor(up / 3600)}:${String(Math.floor(up / 60) % 60).padStart(2, '0')}:${String(up % 60).padStart(2, '0')}`,
      about: {model: 'Nexus S', version: '2.3.6', baseband: 'I9020XXKD1', kernel: '2.6.35.7-gf5f63ef\nandroid-build@apa28 #1\nTue Aug 2 13:57:05 PDT 2011', build: 'GRK39F'}};
  }
  // Data for the 2.3.6 application, battery and reset pages; the simulator's apps are the system image.
  function gbPagesContext() {
    const list = apps.filter(app => app[0] !== 'play-store' || true).map(app => ({id: app[0], name: i18n.t(appNames[app[0]]), icon: appIcon(app[0])}));
    const named = id => list.find(a => a.id === id);
    const running = [...new Set(['phone', 'messaging', ...ui.recent])].map(named).filter(Boolean).map((a, i) => ({...a, ram: 3200000 + i * 1450000, uptime: `${String(12 + i * 7).padStart(2, '0')}:${String(30 - i * 3).padStart(2, '0')}`}));
    const sysIcon = name => `<span class="app-icon"><img src="assets/gb-st-${name}.png" alt=""></span>`;
    const usage = [
      {id: 'screen', name: GBSettingsPages.text(i18n.language, 'power_screen'), icon: sysIcon('ic_settings_display'), percent: 41, details: [['usage_type_on_time', '1h 2m 14s']], action: 'settings-sub', actionLabel: 'battery_action_display', actionId: 'display'},
      {id: 'cell', name: GBSettingsPages.text(i18n.language, 'power_cell'), icon: sysIcon('ic_settings_cell_standby'), percent: 19, details: [['usage_type_on_time', '3h 12m 5s'], ['usage_type_no_coverage', '0%']]},
      {id: 'idle', name: GBSettingsPages.text(i18n.language, 'power_idle'), icon: sysIcon('ic_settings_phone_idle'), percent: 12, details: [['usage_type_on_time', '2h 9m 51s']]},
      {id: 'wifi', name: GBSettingsPages.text(i18n.language, 'power_wifi'), icon: sysIcon('ic_settings_wifi'), percent: 8, details: [['usage_type_on_time', '3h 12m 5s'], ['usage_type_cpu', '41s']], action: 'settings-sub', actionLabel: 'battery_action_wifi', actionId: 'wifi'},
      {id: 'system', name: 'Android System', icon: appIcon('settings'), percent: 7, details: [['usage_type_cpu', '3m 2s'], ['usage_type_cpu_foreground', '1m 18s'], ['usage_type_wake_lock', '6m 40s']]},
      {id: 'kernel', name: GBSettingsPages.text(i18n.language, 'process_kernel_label'), icon: appIcon('settings'), percent: 6, details: [['usage_type_cpu', '2m 37s']]},
      ...running.slice(0, 3).map((a, i) => ({id: 'app:' + a.id, app: a.id, name: a.name, icon: a.icon, percent: 3 - i, details: [['usage_type_cpu', `${40 - i * 9}s`], ['usage_type_cpu_foreground', `${22 - i * 5}s`]]}))
    ];
    const permissions = {phone: [['Your personal information', 'read contact data, write contact data'], ['Services that cost you money', 'directly call phone numbers']], messaging: [['Your messages', 'read SMS or MMS, receive SMS'], ['Services that cost you money', 'send SMS messages']], browser: [['Network communication', 'full Internet access']], email: [['Network communication', 'full Internet access']], camera: [['Hardware controls', 'take pictures and videos']]};
    const lastSync = new Date(data.gbLastSync || Date.now() - 3600000).toLocaleString(i18n.locale(), {month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24});
    return {settings: {...GBSettings.DEFAULTS, ...data.settings}, account: ICSEmail.account, accountRemoved: !!data.gbAccountRemoved, syncing: !!ui.gbSyncing, lastSync, lang: i18n.language, locale: i18n.locale(), tab: ui.gbAppsTab || 'downloaded', sortBySize: !!ui.gbAppsSize, apps: list, running, app: named(ui.settingsApp), isRunning: running.some(a => a.id === ui.settingsApp), cleared: (data.gbClearedApps || []).includes(ui.settingsApp), permissions: permissions[ui.settingsApp] || [], usage, item: ui.batteryDetail, onBattery: '3h 12m 5s', eraseExternal: !!ui.gbspErase, usedText: '312MB', freeText: '1.67GB'};
  }
  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    if (!s) ui.gbSettingsStack = [];
    if (GBNetwork.has(s)) return GBNetwork.render(s, gbNetContext()).html;
    if (GBSettings.has(s || 'main')) return GBSettings.render(s || 'main', gbSettingsContext()).html;
    if (GBSettingsPages.has(s)) { const page = GBSettingsPages.render(s, gbPagesContext()); if (page) return page; }
    // PlatLogoActivity (Theme.NoTitleBar.Fullscreen): platlogo FIT_CENTER on black; every touch shows the credit toast.
    if (s === 'easter') return `<button class="gb-platlogo" data-action="gb-platlogo" aria-label="Gingerbread"><img src="assets/gb-platlogo.jpg" alt=""></button>`;
    return GBSettings.render('main', gbSettingsContext()).html;
  }

  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:')) return value;
    if (value.includes(' ') || !value.includes('.')) return `search:${value}`;
    return value.toLowerCase();
  }
  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }
  function saveBrowserState() { syncBrowserState(); data.browserSession = clone(ui.browserSession); save(); }
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; ui.gbBrEdit = false; browserLoading(); saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); browserLoading(); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; browserLoading(); saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2011 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.7537 * var(--dp));color:#888;margin-top:calc(27.8261 * var(--dp))">Offline demo pages · 2011</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 2.3', 'Gingerbread brings a faster, simpler interface, a new keyboard and NFC.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 2.3</h3><p>The fastest version of Android yet: a simpler interface, a new keyboard, one-touch word selection and copy/paste, and Near Field Communication.</p><div style="background:#23343c;color:white;padding:calc(28.9856 * var(--dp));text-align:center;font-size:calc(44.058 * var(--dp))">🤖<br><small style="font-size:calc(19.7102 * var(--dp))">Gingerbread</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 2.3, known as Gingerbread, refined the user interface and added support for NFC and internet calling.</p><h3>Versions</h3><p>Cupcake · Donut · Eclair · Froyo · Gingerbread · Honeycomb</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/galaxy-nexus' || url === 'retro.example/holo') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with Nexus S':'A closer look at Gingerbread'}</h2><time>September 2, 2011 · Demo archive</time><p>The phone has a curved glass screen, four touch keys and a green-accented interface. Open the app drawer to discover the classic Android experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/holo','Explore the Gingerbread interface')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Friday, September 2, 2011</p><hr><h3>The Nexus S experience</h3><p>Android 2.3 makes typing, copy and paste and managing apps easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/galaxy-nexus','Read the Nexus S story')}${browserLink('retro.example','Visit the 2011 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2011 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/holo','Explore the Gingerbread interface')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(266.6667 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(20.8696 * var(--dp)),#c7dfd7 calc(20.8696 * var(--dp)),#c7dfd7 calc(27.8261 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  // The page address as the 2.3 title bar shows it while loading (searches go to the Google results page).
  const browserAddress = url => url.startsWith('search:') ? `www.google.com/search?q=${encodeURIComponent(url.slice(7))}` : url;
  function gbBrowserContext() {
    const t = key => i18n.t(key);
    return {lang: i18n.language, t, sub: ui.sub === 'saved' ? 'bookmarks' : ui.sub, url: browserAddress(ui.browserUrl), title: gbBrowserTitle(ui.browserUrl), loading: Date.now() < (ui.gbBrLoadingUntil || 0), editing: !!ui.gbBrEdit, editValue: ui.gbBrEditValue ?? '', find: ui.browserFind, bookmarks: data.bookmarks, history: data.browserHistory, titleOf: gbBrowserTitle, thumbnail: url => renderWebsite(url), tabs: ui.browserTabs, active: ui.browserTab, canForward: ui.browserIndex < ui.browserHistory.length - 1, listView: !!ui.gbBrList, target: ui.gbBrTarget, ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel')};
  }
  const gbBrowserTitle = url => data.bookmarkTitles?.[url] || browserTitle(url);
  function renderBrowser() { return GBBrowser.render(gbBrowserContext(), renderWebsite(ui.browserUrl)); }
  // Tab.onPageStarted / onPageFinished: the progress bar and the stop button for a moment after each load.
  function browserLoading() {
    ui.gbBrLoadingUntil = Date.now() + 800;
    clearTimeout(ui.gbBrLoadTimer);
    ui.gbBrLoadTimer = setTimeout(() => { if (ui.view === 'browser' && !ui.sub && !ui.gbBrEdit) render(); }, 820);
  }
  function highlightBrowserText() {
    const root=viewport.querySelector('.browser-page'), query=ui.browserFind.toLocaleLowerCase();
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT), nodes=[]; let node;
    while((node=walker.nextNode())) nodes.push(node);
    let count=0;
    for(const text of nodes) {
      let value=text.nodeValue, offset=0, index=value.toLocaleLowerCase().indexOf(query); if(index<0)continue;
      const fragment=document.createDocumentFragment();
      while(index>=0) { fragment.append(document.createTextNode(value.slice(offset,index)));const mark=document.createElement('mark');mark.textContent=value.slice(index,index+query.length);fragment.append(mark);count++;offset=index+query.length;index=value.toLocaleLowerCase().indexOf(query,offset); }
      fragment.append(document.createTextNode(value.slice(offset)));text.replaceWith(fragment);
    }
    viewport.querySelector('.web-find-count').textContent=`${count} ${i18n.t('matches')}`;
    root.querySelector('mark')?.scrollIntoView({block:'nearest'});
  }

  // Android Market 3.x state: page, section, tab, selected item, query; the downloads run on a timer.
  function gbMarketContext() {
    const m = ui.market || {page: 'home'};
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), ...m, installed: data.marketInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: data.marketPlus || [], autoUpdate: data.marketAuto || [], prefs: {notify: true, pin: false, ...(data.marketPrefs || {})}, rated: data.marketRated || {}, rateDraft: ui.marketRateDraft, filterDraft: ui.marketFilterDraft, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: data.marketSearches || []};
  }
  function gbMarketGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.gbmk-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
  function gbMarketDownload(id) {
    const item = GBMarket.find(id); if (!item) return;
    clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
    data.notifications = data.notifications.filter(n => n.kind !== 'market-dl');
    data.notifications.unshift({id: Date.now(), title: item.name, detail: GBMarket.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
    save(); render(); renderStatus();
    ui.marketTimer = setInterval(() => {
      const d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
      if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: GBMarket.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store') { const bar = viewport.querySelector('.gbmk-progress b'); if (bar && ui.marketDownload?.phase === 'downloading') bar.style.width = `${Math.round(ui.marketDownload.progress * 100)}%`; else render(); }
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function renderPhone() {
    if(ui.activeCall&&!ui.gbCallBackground)return GBPhone.inCall(ui.activeCall,{lang:i18n.language,t:key=>i18n.t(key),person:contactByPhone(ui.activeCall.number),bluetoothAvailable:!!(data.settings.bluetooth&&data.settings.pairedDevice)});
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return GBPhone.callDetail(call,contactByPhone(call.number),{lang:i18n.language,locale:i18n.locale()});}
    return GBPhone.render(gbPhoneContext());
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(number) {
    if(!number)return;
    // Add call: the simulator keeps one line, so the call in progress ends and the new one is dialed.
    if(ui.activeCall&&ui.gbAddCall&&!ui.activeCall.endedAt){data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();}
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    ui.gbCallBackground=false;ui.gbAddCall=false;
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,8);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  // Dialtacts context: the Contacts launcher icon opens the same activity on its Contacts tab.
  function gbPhoneContext() {
    const person = ui.view === 'people' && ui.sub === 'detail' ? contact(ui.selectedContact) : null;
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), now: Date.now(), tab: ui.view === 'people' ? 'contacts' : ui.phoneTab || 'dialpad', dial: ui.dial || '', callActive: !!ui.activeCall, addCall: !!ui.gbAddCall, calls: data.callHistory || [], contactOf: number => contactByPhone(number), people: data.contacts, detail: person, io: GBContactsIO.view(data, i18n.language)};
  }
  function gbceContext() { return {lang: i18n.language, draft: ui.peopleDraft, isNew: ui.sub === 'new', moreName: !!ui.gbceMoreName, secondary: !!ui.gbceSecondary, familyFirst: false}; }
  // The editor's fields are kept on the draft whenever a button changes the form.
  window.GBContactPhoto = person => { const photo = person?.photo && (data.photos.find(p => p.id === person.photo) || (data.contactPhotos || []).find(p => p.id === person.photo)); return photo ? ICSMedia.image(photo) : ''; };
  function gbceSync() {
    const form = viewport.querySelector('.gbce'); if (!form || !ui.peopleDraft) return;
    for (const key of ['given', 'family', 'prefix', 'middle', 'suffix', 'phone', 'email', 'company', 'notes']) if (form.elements[key]) ui.peopleDraft[key] = form.elements[key].value;
  }
  // Contacts' Display options, Import/Export and SIM import (gb-contacts-io.js).
  function gbctContext() {
    return {data, ui, lang: i18n.language, save, render, renderOverlay, toast, account: ICSEmail.account, appName: id => appNames[id] || id,
      openAccounts: () => { ui.view = 'settings'; ui.sub = 'sync'; ui.gbSettingsStack = ['']; render(); },
      unsupported: () => toast('This feature is not part of the simulator.'),
      // Gmail takes the vCard as the compose screen's attachment.
      shareVcard: attachment => { openApp('gmail'); ui.gmDraft = {source: '', body: '', mode: '', attachment}; ui.gmCc = false; ui.gmView = 'compose'; render(); }};
  }
  function renderPeople() { if (GBContactsIO.has(ui.sub)) return GBContactsIO.render(ui.sub, gbctContext()); if (ui.sub === 'edit' || ui.sub === 'new') return GBContactEditor.render(gbceContext()); if (ui.sub === 'detail' && !contact(ui.selectedContact)) ui.sub = ''; return GBPhone.render(gbPhoneContext()); }
  function editPerson(isNew = false) {
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    // EntityModifier.ensureKindExists: the editor always offers a phone and an email row.
    ui.peopleDraft = {...person,phone:person.phone??'',email:person.email??'',groups:data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id)};
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  // ContactDeletionInteraction 2.3: deleteConfirmation_title with ic_dialog_alert, deleteConfirmation, OK / Cancel.
  function peopleOverlay() {
    if (ui.overlay !== 'people-delete') return '';
    const T = key => GBPhone.text(i18n.language, key);
    return GBUI.dialog({t: key => i18n.t(key), title: T('deleteConfirmation_title'), icon: 'ic_dialog_alert', message: T('deleteConfirmation'), buttons: [{action: 'people-confirm-delete', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]});
  }
  function renderMessaging() { return GBMms.render(gbMmsContext()); }
  function gbMmsContext() {
    const composing = ui.sub === 'thread' || ui.sub === 'new';
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), hour24: data.settings.hour24, now: Date.now(), sub: ui.sub, thread: ui.thread, query: ui.mmsSearch, data, draft: composing ? data.messageDrafts?.[ICSMessaging.draftKey(ui)] : null, subjectVisible: composing && !!ui.gbMmsSubject, message: data.messages.find(m => String(m.id) === String(ui.mmsMessage)), ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel'),
      // gb-mms-attach.js: the draft, the shell, the Camera's capture and Back.
      ui, root: viewport, draftOf: messageDraft, save, render, renderOverlay, toast, dialog: gbMmsDialog, capture: gbmaCapture, back};
  }
  // Capture picture / video (IMAGE_CAPTURE, VIDEO_CAPTURE): the Camera, then back to the message with what it took.
  function gbmaCapture(type, target) {
    ui.gbmaCapture = {type, target, ret: {sub: ui.sub, thread: ui.thread, screen: ui.gbmaScreen, slide: ui.gbmaSlide}};
    const capture = ui.gbmaCapture; openApp('camera'); ui.gbmaCapture = capture; ui.gbcamMode = type === 'video' ? 'video' : 'photo'; render();
  }
  // A capture request open in the Camera: Messaging's (gbmaCapture) or the contact editor's Take photo (gbceCapture).
  const gbCapture = () => ui.gbmaCapture || ui.gbceCapture || null;
  function gbmaCancel() {
    const c = ui.gbmaCapture; ui.gbmaCapture = null; if (!c) return;
    openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, gbmaScreen: c.ret.screen, gbmaSlide: c.ret.slide}); render(); scrollMessages();
  }
  // EditContactActivity's camera request returns the picture as the contact's photo (kept with the contacts, not in the
  // Gallery); Cancel or Back leaves the editor as it was.
  function gbceReturn(photo) {
    const c = ui.gbceCapture; ui.gbceCapture = null; if (!c) return;
    captureRecentView(); ui.view = 'people'; ui.sub = c.ret.sub;
    if (photo && ui.peopleDraft) { data.contactPhotos = [...(data.contactPhotos || []), photo]; ui.peopleDraft.photo = photo.id; save(); }
    render();
  }
  function gbmaReturn(part) {
    const c = ui.gbmaCapture; ui.gbmaCapture = null; if (!c) return;
    openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, gbmaScreen: c.ret.screen, gbmaSlide: c.ret.slide});
    GBMmsAttach.apply(gbMmsContext(), c.target, part); render(); scrollMessages();
  }
  function gbMmsDialog(kind) { ui.gbMmsDialog = kind; ui.overlay = 'gb-dialog-mms'; renderOverlay(); }
  function messageDraft() {
    data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function openMessageThread(key) {
    if (ui.view !== 'messaging') openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  function renderGallery() { return GBGallery.render(gbGalleryContext()); }
  function gbGalleryContext() {
    return {pick: !!ui.gbgPick, lang: i18n.language, locale: i18n.locale(), now: deviceDate(), data, sub: ui.sub || '', album: ui.galleryAlbum || 'camera', photo: data.photos.find(p => p.id === ui.selectedPhoto), crop: ui.gbgCrop || null, selecting: !!ui.gbgSelect, selected: ui.gbgSelected || [], popup: ui.gbgPopup || '', caption: !!ui.gbgCaption, zoom: !!ui.galleryZoom, slideshow: !!ui.gallerySlideshow, hudHidden: !!ui.gbgHudHidden, stackMode: !!ui.gbgStack, width: viewport.clientWidth || 276, height: viewport.clientHeight || 438, timebar: 48 * GBGallery.DP()};
  }
  // The photos a selection stands for: whole albums on the album screen, single photos elsewhere.
  function gbgSelectedPhotos() {
    const ids = ui.gbgSelected || [];
    return ui.sub ? data.photos.filter(p => ids.includes(String(p.id))) : data.photos.filter(p => ids.includes(ICSMedia.album(p)));
  }
  function gbgEndSelection() { ui.gbgSelect = false; ui.gbgSelected = []; ui.gbgPopup = ''; }
  function renderCamera() { return GBCamera.render(gbCameraContext()); }
  function gbCameraContext() {
    const saved = data.cameraSettings || {}, s = GBCamera.settings(saved);
    return {lang: i18n.language, saved: {...saved, ...s}, mode: ui.gbcamMode || 'photo', popup: ui.gbcamPopup || '', focus: ui.gbcamFocus || '', recording: !!ui.gbcamRec, recordTime: gbcamClock(), last: ICSMedia.photos(data, 'camera')[0], effectFilter: GBCamera.EFFECTS[s.effect] || 'none', capture: gbCapture() && {video: gbCapture().type === 'video', taken: gbCapture().taken}};
  }
  const gbcamClock = () => { if (!ui.gbcamRec) return '00:00'; const t = Math.floor((Date.now() - ui.gbcamRec) / 1000); return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };
  function gbcamSet(changes) { const s = {...GBCamera.settings(data.cameraSettings || {}), ...changes}; data.cameraSettings = {...s, front: s.facing === 'front', exposure: Number(s.exposure)}; save(); }
  // FocusRectangle: focusing, then focused (or failed), cleared after a moment.
  function gbcamFocus(done) {
    clearTimeout(ui.gbcamFocusTimer); ui.gbcamFocus = 'focusing'; render();
    ui.gbcamFocusTimer = setTimeout(() => { if (ui.view !== 'camera') return; ui.gbcamFocus = 'focused'; render(); done?.(); ui.gbcamFocusTimer = setTimeout(() => { ui.gbcamFocus = ''; if (ui.view === 'camera') render(); }, 1200); }, 600);
  }
  function gbcamStopRecording(keep = true) {
    if (!ui.gbcamRec) return;
    clearInterval(ui.gbcamRecTimer); const started = ui.gbcamRec; ui.gbcamRec = 0;
    if (keep) { const stamp = new Date(started).toISOString().replace(/[-:T]/g, '').slice(0, 14), cap = gbCapture(), item = {...ICSMedia.scene(data), ...(GBCamera.settings(data.cameraSettings || {}).gps === 'on' ? {location: {fx: GBMaps.ME.fx, fy: GBMaps.ME.fy}} : {}), id: Date.now(), name: `VID_${stamp.slice(0, 8)}_${stamp.slice(8)}`, album: 'camera', created: Date.now(), video: true, duration: Math.round((Date.now() - started) / 1000)}; if (cap) cap.taken = item; else { data.photos.unshift(item); save(); } }
  }
  function galleryStep(direction) {
    const items=ICSMedia.photos(data,ui.galleryAlbum); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }

  function renderCalendar() { return GBCalendar.render(gbCalContext()); }
  function gbCalContext() {
    const event = data.events.find(item => item.id === ui.selectedEvent);
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), now: deviceDate(), hour24: !!data.settings.hour24, sub: ui.sub, mode: ui.calendarMode || 'Month', selected: ui.selectedDate, first: i18n.locale() === 'en-US' ? 0 : 1, events: data.calendarState ? [] : data.events, event, instance: ui.selectedInstance, draft: ui.eventDraft, temp: ui.gbCalTemp, extra: !!ui.gbCalExtra, error: ui.calendarError ? i18n.t(ui.calendarError) : '', account: 'demo@example.com', target: ui.gbCalTarget, ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel'), setLabel: GBDeskClock.text(i18n.language, 'date_time_set')};
  }
  function gbCalDialog(kind) { ui.gbCalDialog = kind; ui.overlay = 'gb-dialog-cal'; renderOverlay(); }
  // The edit form's text fields live in the draft so the pickers and spinners can re-render it.
  function gbCalSyncDraft() {
    const form = viewport.querySelector('.gbcal-edit'); if (!form || !ui.eventDraft) return;
    for (const name of ['title', 'location', 'description']) ui.eventDraft[name] = form.elements[name]?.value ?? ui.eventDraft[name];
  }
  function calendarRender() {
    render();
    const timeline=viewport.querySelector('.gbcal-scroll');
    if(timeline)timeline.scrollTop=timeline.clientHeight*.8;
  }
  function calendarMove(direction) {
    const mode=ui.calendarMode || 'Month';
    if(mode==='Month') {const date=ICSCalendar.parse(ui.selectedDate);date.setDate(1);date.setMonth(date.getMonth()+direction);ui.selectedDate=ICSCalendar.iso(date);}
    else ui.selectedDate=ICSCalendar.plus(ui.selectedDate,direction*(mode==='Week'?7:1));
    calendarRender();
  }
  function deleteEventScope(scope) {
    const series=data.events.find(item=>item.id===ui.selectedEvent);if(!series)return;
    const item=ICSCalendar.instance(series,ui.selectedInstance);
    if(scope==='this')series.exdates=[...new Set([...(series.exdates||[]),item.date])];
    else if(scope==='future'&&item.date!==item.seriesStart)series.until=ICSCalendar.plus(item.date,-1);
    else data.events=data.events.filter(event=>event.id!==series.id);
    save();ui.overlay='';ui.sub='';calendarRender();
  }
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
  function calendarEdit(item) {
    // A new event gets preferences_default_reminder_default (10 minutes), as EditEvent adds it.
    ui.eventDraft=ICSCalendar.normalize(item || {date:ui.selectedDate,time:'12:00',title:'',reminder:10});ui.gbCalExtra=false;
    ui.calendarError='';ui.overlay='';ui.sub='event-edit';render();
  }
  function renderClock() { return GBDeskClock.render(gbClockContext()); }
  function gbClockContext() {
    const now = deviceDate();
    // The weather DeskClock reads from News & Weather: today's forecast for its city, in its units (Use metric).
    const today = window.GBGoogleApps?.FORECAST?.[0], metric = window.NewsPrefs ? NewsPrefs.metric(data, i18n.language) : i18n.language !== 'en', deg = f => metric ? Math.round((f - 32) * 5 / 9) : f;
    const weather = today && {icon: today[1], temp: deg(72), high: deg(today[2]), low: deg(today[3]), location: window.NewsPrefs ? NewsPrefs.city(data, 'Mountain View, CA') : 'Mountain View, CA'};
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), hour24: !!data.settings.hour24, now, sub: ui.sub, weather, dim: !!ui.clockDim, alarms: data.alarms.map(alarm => ICSDeskClock.normalize(alarm)), next: data.alarms.map(alarm => ICSDeskClock.nextOccurrence(alarm, now)).filter(Boolean).sort((a, b) => a - b)[0], draft: ui.alarmDraft ? ICSDeskClock.normalize(ui.alarmDraft) : null, temp: ui.dcTemp, contextAlarm: data.alarms.find(alarm => alarm.id === ui.dcContext), ringing: ui.ringingAlarm ? ICSDeskClock.normalize(ui.ringingAlarm) : null, ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel')};
  }
  // Alarms.formatToast after an enabled alarm is saved or switched on.
  function alarmSetToast(alarm) { const now = deviceDate(), next = ICSDeskClock.nextOccurrence(alarm, now); if (next) toast(GBDeskClock.setToast(next, now, i18n.language)); }
  function editAlarm(id) {
    ui.alarmDraft=ICSDeskClock.normalize(data.alarms.find(alarm=>alarm.id===Number(id)));
    ui.sub='alarm-edit'; ui.overlay=''; render();
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

  /* Calculator 2.3.6 (layout-port/main.xml, Theme.Black.NoTitleBar): the CalculatorDisplay (weight 1) over the
     PanelSwitcher (weight 4). The simple pad has an empty gradient cell and CLEAR (tap deletes, long press clears), then
     digit rows on blue_button and operators on button; the advanced pad has sin cos tan / ln log ! / pi e ^ / ( ) sqrt.
     ColorButton draws white text and the "magic flame" outline. */
  const calcText = key => AndroidStrings.resources(() => window.GBStrings?.calculator).t(key, i18n.language);
  function renderCalculator() {
    const key = (id, cls = '') => `<button class="gbcalc-key${cls}" data-action="calc-key" data-id="${id}">${safe(id)}</button>`;
    const row = keys => `<div class="gbcalc-row">${keys.map(([id, cls]) => key(id, cls)).join('')}</div>`;
    const simple = `<div class="gbcalc-pad gbcalc-simple" aria-label="${safe(calcText('basic'))}" ${ui.calcPanel ? 'inert' : ''}><div class="gbcalc-row gbcalc-top"><span class="gbcalc-blank"></span><button class="gbcalc-key gbcalc-del" data-action="calc-key" data-id="⌫" aria-label="${safe(calcText('del'))}">${safe(calcText('clear'))}</button></div>${row([['7', ' digit'], ['8', ' digit'], ['9', ' digit'], ['÷']])}${row([['4', ' digit'], ['5', ' digit'], ['6', ' digit'], ['×']])}${row([['1', ' digit'], ['2', ' digit'], ['3', ' digit'], ['−']])}${row([['.', ' digit'], ['0', ' digit'], ['='], ['+']])}</div>`;
    const advanced = `<div class="gbcalc-pad gbcalc-advanced" aria-label="${safe(calcText('advanced'))}" ${ui.calcPanel ? '' : 'inert'}>${row([['sin', ' small'], ['cos', ' small'], ['tan', ' small']])}${row([['ln', ' small'], ['log', ' small'], ['!']])}${row([['π'], ['e'], ['^']])}${row([['('], [')'], ['√']])}</div>`;
    const shown = ui.calc === 'Error' ? calcText('error') : ui.calc;
    return `<div class="app-view gbcalc" data-no-translate><div class="gbcalc-display"><output aria-label="${safe(calcText('app_name'))}">${safe(shown)}</output><i class="gbcalc-caret"></i></div><div class="calc-pager gbcalc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)">${simple}${advanced}</div></div></div>`;
  }
  function setCalculatorPanel(index) {
    ui.calcPanel = index;
    const track = viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(-${index * 50}%)`; snapResting(track);
    track.querySelectorAll('.ics-calc-grid,.gbcalc-pad').forEach((panel, i) => { panel.inert = i !== index; });
  }
  const MUSIC = AndroidStrings.resources(() => window.GBStrings?.music), musicText = key => MUSIC.t(key, i18n.language);
  // Music's plurals (Nalbums, Nsongs, Nsongscomp): the one / other text of the image, %d and %n$d / %n$s filled in.
  // The quantity the language's plural rules pick (CLDR, as Android's Resources.getQuantityString).
  const musicPlural = (key, n, ...rest) => MUSIC.plural(key, n, i18n.language, n, ...rest);
  function renderMusic() {
    return ICSMusic.render(ui.music,ui,key=>i18n.t(key),musicText,musicPlural);
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
  function renderEmail() { return GBEmail.render(gbEmailContext()); }
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
  function gbEmailContext() {
    return {lang: i18n.language, locale: i18n.locale(), hour24: !!data.settings.hour24, now: deviceDate(), sub: ui.sub, folder: ui.emailFolder || 'Inbox', mail: data.mailbox, item: data.mailbox.find(item => item.id === ui.emailId), selected: ui.emailSelected || [], query: ui.emailQuery, cc: !!ui.emailCc, error: '', photos: data.photos, target: data.mailbox.find(item => item.id === ui.gbEmTarget)};
  }
  const emailText = key => GBEmail.text(i18n.language, key);
  function gbEmDialog(kind) { ui.gbEmDialog = kind; ui.overlay = 'gb-dialog-email'; renderOverlay(); }
  // The compose form's fields are kept on the draft before menus, attachments or leaving the screen.
  function gbEmSync() {
    const form = viewport.querySelector('.gbem-compose'), item = data.mailbox.find(m => m.id === ui.emailId); if (!form || !item) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (form.elements[key]) item[key] = String(form.elements[key].value);
  }
  function gbEmLeaveCompose(message) { ui.sub = ''; ui.overlay = ''; ui.emailCc = false; save(); render(); if (message) toast(emailText(message)); }
  function composeEmail(source=null,forward=false,to='',all=false) {
    const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
    // MessageCompose keeps the original below the "Quoted text" bar; reply all adds the other recipients as Cc.
    if(source){draft.quoted=GBEmail.quote(source,forward,i18n.language);draft.body='';if(all&&!forward)draft.cc=ICSEmail.recipients([source.to,source.cc].join(',')).filter(address=>address!==ICSEmail.account&&address!==draft.to).join(', ');}
    data.mailbox.unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
  }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    if(id==='music'){ui.music=ICSMusic.restore();saveMusic();}
    if(id==='email'){data.mailbox=ICSEmail.restore(null,emailData,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];}
    if(id==='clock')data.alarms=clone(defaultData.alarms);
    if(id==='calendar')data.events=clone(defaultData.events);
    if(id==='people'){data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;}
    if(id==='messaging'){data.messages=clone(defaultData.messages);data.messageDrafts={};}
    if(id==='gallery'){data.photos=clone(defaultData.photos);}
    if(id==='camera')delete data.cameraSettings;
    if(id==='phone'){data.callHistory=[];ui.activeCall=null;}
    if(id==='calculator'){ui.calc='';ui.calcHistoryIndex=-1;data.calcHistory=[];}
    if(id==='play-store')delete data.playRatings;
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function operateCalculator(key) {
    if (key === 'C') { ui.calc = ''; ui.calcFresh = false; return; }
    // Logic.onDelete: on a result or an error DELETE clears the display.
    if (key === '⌫') { ui.calc = ui.calc === 'Error' || ui.calcFresh ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
    if (key === '=') {
      if (!ui.calc || ui.calc === 'Error') return;
      try { const expression = ui.calc; ui.calc = ICSCalculator.evaluate(expression); data.calcHistory = [...(data.calcHistory || []), {expression, result:ui.calc}].slice(-50); ui.calcHistoryIndex = -1; save(); } catch { ui.calc = 'Error'; }
      ui.calcFresh = true; return;
    }
    if (ui.calc.length > 150) return;
    const operator = ['÷','×','−','+','^','!'].includes(key);
    if (ui.calc === 'Error' || ui.calcFresh && !operator) ui.calc = '';
    ui.calcFresh = false;
    const token = key === '√' ? '√(' : /^(sin|cos|tan|ln|log)$/.test(key) ? `${key}(` : key;
    if (operator && key !== '!' && /[÷×−+^]$/.test(ui.calc) && key !== '−') ui.calc = ui.calc.slice(0,-1);
    ui.calc += token;
  }
  function blinkTips(times) {
    let delay = 0;
    for (const [icon, wait] of GBLauncher.blinkFrames(times)) { setTimeout(() => { ui.tipsIcon = icon; if (ui.view === 'home') { const img = viewport.querySelector('.gbtips-droid img'); if (img) img.src = `assets/gb-tips-${icon}.png`; } }, delay); delay += wait; }
  }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    const subject = String(data.messageDrafts?.[ICSMessaging.draftKey(ui)]?.subject || '').trim();
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}), ...(subject ? {subject} : {}) });
    ui.gbMmsSubject = false;
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
  }

  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button) && !navRoot.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
    if (action.startsWith('gbnet-') && GBNetwork.handle(action, id, gbNetContext(), button)) return;
    if (action.startsWith('gbct-') && GBContactsIO.handle(action, id, gbctContext())) return;
    if (ui.view === 'messaging' && action.startsWith('gbma-') && window.GBMmsAttach?.handle(action, id, gbMmsContext())) return;
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
      case 'market': openApp('play-store'); break;
      case 'play-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
      case 'gbmk-section': gbMarketGo({page: 'section', section: id}); break;
      case 'gbmk-category': gbMarketGo({page: 'category', category: id, tab: 'Top paid'}); break;
      case 'gbmk-home': ui.marketHistory = []; ui.market = {page: 'home', carousel: ui.market?.carousel || 0}; ui.overlay = ''; ui.marketSearching = false; renderOverlay(); render(); break;
      case 'gbmk-carousel': ui.market.carousel = Number(id) || 0; render(); break;
      case 'gbmk-uninstall-page': gbMarketGo({page: 'uninstall', selected: id, reason: 4}); break;
      case 'gbmk-reason': ui.market.reason = Number(id); render(); break;
      case 'gbmk-rate': ui.marketRateDraft = undefined; ui.gbmkDialog = 'rate'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); break;
      case 'gbmk-rate-pick': ui.marketRateDraft = Number(id); renderOverlay(); break;
      case 'gbmk-rate-ok': data.marketRated = {...(data.marketRated || {}), [id]: ui.marketRateDraft ?? (data.marketRated || {})[id] ?? 0}; save(); ui.overlay = ''; renderOverlay(); render(); break;
      case 'gbmk-clear-review': { const sel = ui.market?.selected; if (sel && data.marketRated) { delete data.marketRated[sel]; save(); } ui.overlay = ''; renderOverlay(); render(); break; }
      case 'gbmk-security': ui.gbmkDialog = 'security'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); break;
      case 'gbmk-notify': ui.gbmkDialog = 'notify'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); break;
      case 'gbmk-notify-pick': data.marketPrefs = {notify: true, pin: false, ...(data.marketPrefs || {}), notify: id === 'on'}; save(); ui.overlay = ''; renderOverlay(); render(); break;
      // A PIN guards the filter: Enter PIN first, then the filter or Change PIN (GBMarket.dialog).
      case 'gbmk-filter': ui.marketFilterDraft = undefined; ui.gbmkPinNext = 'filter'; ui.gbmkDialog = data.marketPrefs?.pinCode ? 'pin-enter' : 'filter'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); break;
      case 'gbmk-pin': ui.gbmkPinNext = 'change'; ui.gbmkDialog = data.marketPrefs?.pinCode ? 'pin-enter' : 'pin-set'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); overlayRoot.querySelector('[data-gbmk-pin]')?.focus(); break;
      case 'gbmk-pin-ok': {
        const field = overlayRoot.querySelector('[data-gbmk-pin]'), value = String(field?.value || '').trim(), prefs = {notify: true, ...(data.marketPrefs || {})};
        if (value && !/^\d+$/.test(value)) { field.value = ''; field.focus(); break; }
        if (id === 'pin-enter') {
          if (value !== prefs.pinCode) { field.value = ''; field.focus(); break; }
          ui.gbmkDialog = ui.gbmkPinNext === 'filter' ? 'filter' : 'pin-change'; renderOverlay(); overlayRoot.querySelector('[data-gbmk-pin]')?.focus(); break;
        }
        if (id === 'pin-set' && !value) { field.focus(); break; }
        if (value) prefs.pinCode = value; else delete prefs.pinCode;
        prefs.pin = !!prefs.pinCode; data.marketPrefs = prefs; save(); ui.overlay = ''; renderOverlay(); render(); break;
      }
      case 'gbmk-dev-apps': { const item = GBMarket.find(id); if (item) gbMarketGo({page: 'search', query: item.developer}); break; }
      case 'gbmk-dev-email': { const item = GBMarket.find(id); if (!item) break; openApp('email'); composeEmail(null, false, GBMarket.developerEmail(item)); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) d.subject = item.name; save(); render(); break; }
      case 'gbmk-share': ui.gbmkDialog = 'share'; ui.overlay = 'gb-dialog-gbmk'; renderOverlay(); break;
      case 'gbmk-share-to': {
        const [app, itemId] = String(id).split('|'), item = GBMarket.find(itemId); ui.overlay = ''; if (!item) break;
        const link = `http://market.android.com/details?id=${GBMarket.packageName(item)}`;
        if (app === 'email') { openApp('email'); composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) { d.subject = item.name; d.body = link; } save(); render(); }
        else { openApp('messaging'); ui.sub = 'new'; data.messageDrafts ||= {}; data.messageDrafts.new = {...(data.messageDrafts.new || {}), body: link, updated: Date.now()}; save(); render(); }
        break;
      }
      case 'gbmk-filter-pick': { const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], cur = ui.marketFilterDraft || gbMarketContext().prefs.filter || levels; let next = cur.includes(id) ? cur.filter(x => x !== id && (id !== 'Show all apps' ? x !== 'Show all apps' : true)) : [...cur, id]; if (id === 'Show all apps') next = cur.includes(id) ? [] : levels; else if (levels.slice(0, 4).every(l => next.includes(l))) next = levels; ui.marketFilterDraft = next; renderOverlay(); break; }
      case 'gbmk-filter-ok': data.marketPrefs = {notify: true, pin: false, ...(data.marketPrefs || {}), filter: ui.marketFilterDraft || gbMarketContext().prefs.filter}; save(); ui.overlay = ''; renderOverlay(); break;
      case 'gbmk-unavailable': toast(GBMarket.text(i18n.language, 'Unavailable')); break;
      case 'gbmk-noop': break;
      case 'gbmk-tab': if (id) { ui.market.tab = id; render(); } break;
      case 'gbmk-detail': gbMarketGo({page: 'detail', selected: id}); break;
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
      case 'gbmk-buy': { const item = GBMarket.find(id); if (item && item.price !== 'FREE') { toast(GBMarket.text(i18n.language, 'Unavailable')); break; } gbMarketGo({page: 'permissions', selected: id}); break; }
      case 'gbmk-accept': ui.market = ui.marketHistory.pop() || {page: 'detail', selected: id}; gbMarketDownload(id); break;
      case 'gbmk-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); save(); render(); renderStatus(); break;
      case 'gbmk-open': { const item = GBMarket.find(id); if (item?.app) openApp(item.app); else toast(GBMarket.text(i18n.language, 'Unavailable')); break; }
      case 'gbmk-uninstall': data.marketInstalled = (data.marketInstalled || []).filter(x => x !== id); save(); if (ui.market?.page === 'uninstall') ui.market = ui.marketHistory.pop() || {page: 'home'}; render(); break;
      case 'gbmk-my-apps': gbMarketGo({page: 'my-apps'}); break;
      case 'gbmk-settings': gbMarketGo({page: 'settings'}); break;
      case 'gbmk-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.gbbr-search input')?.focus(); break;
      case 'gbmk-search-cancel': ui.marketSearching = false; render(); break;
      case 'gbmk-search-run': data.marketSearches = [id, ...(data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); gbMarketGo({page: 'search', query: id}); break;
      case 'play-my-apps': navigatePlay({page:'my-apps',category:'',query:''}); break;
      case 'play-search': navigatePlay({page:'search',category:'',query:''}); viewport.querySelector('.play-search input')?.focus(); break;
      case 'play-tab': ui.play = {...ICSPlayStore.initial(),tab:id}; ui.playHistory = []; render(); break;
      case 'play-category': navigatePlay({page:'list',category:id,query:''}); break;
      case 'play-detail': navigatePlay({page:'detail',selected:id,preview:0}); break;
      case 'play-preview': navigatePlay({page:'preview',selected:id,preview:Number(button.dataset.preview || 0)}); break;
      case 'play-preview-step': ui.play.preview = (ui.play.preview + Number(id) + 3) % 3; render(); break;
      case 'play-open': { const entry = ICSPlayStore.catalog.find(item => item.id === id); if (entry?.app) openApp(entry.app); break; }
      case 'play-rate': { const top = viewport.querySelector('.play-content').scrollTop; data.playRatings ||= {}; data.playRatings[ui.play.selected] = Number(id); save(); render(); viewport.querySelector('.play-content').scrollTop = top; break; }
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
      // VoiceSearchPreferences: Personalized recognition asks before it changes.
      case 'gbvs-personal': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = data.settings.vsPersonal ? 'vs-off' : 'vs-on'; renderOverlay(); break;
      case 'gbvs-personal-on': case 'gbvs-personal-off': data.settings.vsPersonal = action === 'gbvs-personal-on'; ui.overlay = ''; save(); renderOverlay(); render(); break;
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
      case 'gbset-go': if (id === 'brightness') { ui.overlay = 'gb-dialog-brightness'; ui.brightnessDraft = data.settings.brightness; renderOverlay(); break; } (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = id; render(); break;
      case 'gbset-check': if (id === 'usbDebug' && !data.settings.usbDebug) { ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = 'adb'; renderOverlay(); break; } { const current = data.settings[id] ?? GBSettings.DEFAULTS[id] ?? (id === 'patternVisible'); data.settings[id] = !current;
        // DateTimeSettings 2.3: one Automatic box covers the network time and zone; turning it off keeps the current zone.
        if (id === 'autoTime') { data.settings.timeOffset = 0; data.settings.autoZone = !!data.settings.autoTime; if (!data.settings.autoTime) data.settings.timeZone = ICSSystemSettings.zone({settings: {...data.settings, autoZone: true}}); }
        if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.portableHotspot = false; GBNetwork.airplane(gbNetContext()); }
        if (id === 'wifi' && data.settings.wifi) { data.settings.portableHotspot = false; data.settings.gbWifiSaved = false; }
        if (id === 'silent') data.settings.silentMode = data.settings.silent ? (GBSettings.value(data.settings, 'vibrateMode') === 1 || GBSettings.value(data.settings, 'vibrateMode') === 3 ? 'mute' : 'vibrate') : 'off';
        save(); render(); break; }
      case 'gbset-list': ui.overlay = 'gb-dialog-list'; ui.gbListKey = id; renderOverlay(); break;
      case 'gbset-list-pick': { const [key, index] = id.split(':'); data.settings[key] = Number(index); ui.overlay = ''; save(); render(); break; }
      case 'gbset-toast': toast(id); break;
      // Select text arms the page (Browser / Google Mail): the next touch there selects (gb-browser.js).
      case 'gb-select-text': ui.overlay = ''; ui.gbMenuItems = null; renderOverlay(); ui.gbSelecting = ui.view; break;
      case 'gbset-dialog': if (id === 'date' || id === 'time') { const now = deviceDate(); ui.gbDtDraft = {y: now.getFullYear(), m: now.getMonth(), d: now.getDate(), h: now.getHours(), mi: now.getMinutes()}; } ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = id; renderOverlay(); break;
      // The pickers wrap like NumberPicker; Set moves the device clock by the difference (data.settings.timeOffset).
      case 'gbset-dt-step': { const [field, delta] = id.split(':'), d = ui.gbDtDraft, step = Number(delta); const range = {m: 12, h: 24, mi: 60}[field]; if (field === 'y') d.y = Math.min(2037, Math.max(1970, d.y + step)); else if (field === 'd') { const days = new Date(d.y, d.m + 1, 0).getDate(); d.d = (d.d - 1 + step + days) % days + 1; } else d[field] = (d[field] + step + range) % range; d.d = Math.min(d.d, new Date(d.y, d.m + 1, 0).getDate()); renderOverlay(); break; }
      case 'gbset-dt-ampm': ui.gbDtDraft.h = (ui.gbDtDraft.h + 12) % 24; renderOverlay(); break;
      case 'gbset-dt-set': { const d = ui.gbDtDraft, now = deviceDate(), target = new Date(d.y, d.m, d.d, d.h, d.mi, ui.gbSetDialog === 'time' ? 0 : now.getSeconds()); data.settings.timeOffset = (Number(data.settings.timeOffset) || 0) + (target - now); ui.overlay = ''; save(); render(); break; }
      case 'gbset-zone': data.settings.timeZone = id; data.settings.autoZone = false; ui.sub = (ui.gbSettingsStack || []).pop() || 'date'; save(); render(); break;
      case 'gbset-zone-sort': ui.gbZoneSort = id; ui.overlay = ''; renderOverlay(); render(); break;
      case 'gbset-ap': ui.overlay = 'gb-dialog-set'; ui.gbSetDialog = `ap:${id}`; renderOverlay(); break;
      case 'gbset-wifi-connect': { const network = allWifiNetworks().find(item => item.name === id), password = overlayRoot.querySelector('[data-wifi-password]')?.value || ''; if (network && network.security !== 'Open' && password.length < 8) { toast('Password must have at least 8 characters'); break; } data.settings.wifiNetwork = id; ui.overlay = ''; save(); render(); break; }
      case 'gbset-wifi-forget': data.settings.wifiNetwork = ''; ui.overlay = ''; save(); render(); break;
      case 'gbset-wifi-save': { const ssid = overlayRoot.querySelector('[data-wifi-ssid]')?.value.trim(); if (ssid && !allWifiNetworks().some(item => item.name === ssid)) data.savedWifiNetworks = [...(data.savedWifiNetworks || []), {name: ssid.slice(0, 32), security: 'Open', strength: 2}]; ui.overlay = ''; save(); render(); break; }
      case 'gbset-wifi-scan': ui.overlay = ''; render(); toast('Scanning…'); break;
      case 'gbset-bt-scan': ui.btScanning = true; render(); setTimeout(() => { ui.btScanning = false; ui.btFound = [{name: 'Headset', kind: 'headset_hfp'}, {name: 'Car kit', kind: 'headphones_a2dp'}, {name: "Sam's laptop", kind: 'laptop'}]; if (ui.view === 'settings') render(); }, 1500); break;
      case 'gbset-bt-device': if (data.settings.pairedDevice === id) { toast('Connected'); break; } data.settings.pairedDevice = id; save(); render(); break;
      case 'gbset-bt-name-ok': { const name = overlayRoot.querySelector('[data-bt-name]')?.value.trim(); if (name) data.settings.bluetoothName = name.slice(0, 40); ui.overlay = ''; save(); render(); break; }
      case 'gbset-volume-ok': overlayRoot.querySelectorAll('[data-vol]').forEach(input => { data.settings[input.dataset.vol] = Number(input.value); }); { const same = overlayRoot.querySelector('[data-vol-same]'); if (same) data.settings.notificationSameAsRing = same.checked; } ui.overlay = ''; save(); render(); break;
      case 'gbset-sound-pick': { const [kind, name] = id.split(':'); data.settings[kind] = name; save(); renderOverlay(); render(); break; }
      case 'gbset-locale': i18n.setLanguage(id); location.reload(); break;
      case 'gbset-adb-ok': data.settings.usbDebug = true; ui.overlay = ''; save(); render(); break;
      case 'gbset-brightness-ok': { const input = overlayRoot.querySelector('.gbbright input[type=range]'); if (input) data.settings.brightness = Number(input.value); const auto = overlayRoot.querySelector('.gbbright input[type=checkbox]'); if (auto) data.settings.autoBrightness = auto.checked; ui.overlay = ''; save(); render(); break; }
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
      case 'settings-sub': if (ui.view === 'settings') (ui.gbSettingsStack ||= []).push(ui.sub); ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
      case 'gbsp-tab': ui.gbAppsTab = id; render(); break;
      case 'gbacc-background': if ((data.settings.backgroundData ?? true)) { ui.gbspDialog = 'background'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); } else { data.settings.backgroundData = true; save(); render(); } break;
      case 'gbacc-background-off': data.settings.backgroundData = false; save(); ui.overlay = ''; render(); break;
      case 'gbacc-remove': ui.gbspDialog = 'remove'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
      case 'gbacc-remove-ok': data.gbAccountRemoved = true; save(); ui.overlay = ''; ui.sub = 'sync'; ui.gbSettingsStack = (ui.gbSettingsStack || []).filter(page => page !== 'sync'); render(); break;
      case 'gbacc-sync': ui.overlay = ''; ui.gbSyncing = true; render(); clearTimeout(ui.gbSyncTimer); ui.gbSyncTimer = setTimeout(() => { ui.gbSyncing = false; data.gbLastSync = Date.now(); save(); if (ui.view === 'settings') render(); }, 2500); break;
      case 'gbacc-cancel': ui.overlay = ''; ui.gbSyncing = false; clearTimeout(ui.gbSyncTimer); render(); break;
      case 'gbsp-sort': ui.gbAppsSize = id === 'size'; ui.overlay = ''; render(); break;
      case 'gbsp-app': if (!apps.some(app => app[0] === id)) break; (ui.gbSettingsStack ||= []).push(ui.sub); ui.settingsApp = id; ui.sub = 'app-info'; ui.overlay = ''; render(); break;
      case 'gbsp-battery-item': (ui.gbSettingsStack ||= []).push(ui.sub); ui.batteryDetail = id; ui.sub = 'battery-detail'; render(); break;
      case 'gbsp-force-stop': ui.settingsApp = id; ui.gbspDialog = 'force-stop'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
      case 'gbsp-force-stop-ok': ui.recent = ui.recent.filter(app => app !== ui.settingsApp); delete ui.recentState?.[ui.settingsApp]; ui.overlay = ''; render(); break;
      case 'gbsp-clear-data': ui.gbspDialog = 'clear-data'; ui.overlay = 'gb-dialog-sp'; renderOverlay(); break;
      case 'gbsp-clear-data-ok': clearAppData(ui.settingsApp); data.gbClearedApps = [...new Set([...(data.gbClearedApps || []), ui.settingsApp])]; save(); ui.overlay = ''; render(); break;
      case 'gbsp-clear-cache': data.gbClearedApps = [...new Set([...(data.gbClearedApps || []), ui.settingsApp])]; save(); render(); break;
      case 'gbsp-reset-initiate': (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = 'gb-reset-final'; render(); break;
      case 'factory-reset-confirmed': ui.gbSettingsStack = []; resetSimulator(); break;
      case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
      case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
      case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
      case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
      case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
      case 'bluetooth-confirm': data.settings.pairedDevice = data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
      case 'wifi-connect': {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
        data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true;
        save(); ui.overlay = ''; render(); break;
      }
      case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
      case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
      case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
      case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'about-tap':
        ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
        if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { (ui.gbSettingsStack ||= []).push(ui.sub); ui.sub = 'easter'; ui.aboutTapTimes = []; render(); }
        break;
      case 'gb-platlogo': toast('Zombie art by Jack Larson'); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'browser-search': openSearch(''); break;
      case 'gbqs-corpora': ui.qsb.selecting = !ui.qsb.selecting; render(); break;
      case 'gbpref-open': ui.overlay = ''; ui.gbPrefs = {app: id, view: ui.view}; render(); break;
      case 'gbem-add-account': ui.overlay = ''; ui.gbEmSetup = {email: '', def: false}; render(); viewport.querySelector('.gbem-setup [name=email]')?.focus(); break;
      case 'gbem-setup-manual': toast('Unavailable in this simulator'); break;
      case 'gbem-setup-cancel': clearTimeout(ui.gbEmSetupTimer); ui.overlay = ''; renderOverlay(); break;
      case 'gbce-photo': gbceSync(); ui.gbceDialog = ui.peopleDraft?.photo ? 'photo-edit' : 'photo'; ui.overlay = 'gb-dialog-ce'; renderOverlay(); break;
      case 'gbce-photo-take': { gbceSync(); ui.overlay = ''; renderOverlay(); const ret = {sub: ui.sub}; openApp('camera'); ui.gbceCapture = {type: 'image', ret, taken: null}; ui.gbcamMode = 'photo'; render(); break; }
      case 'gbcam-cap-ok': { const cap = gbCapture(); if (!cap?.taken) break; if (ui.gbmaCapture) gbmaReturn(cap.type === 'video' ? {video: clone(cap.taken)} : {image: clone(cap.taken)}); else gbceReturn(cap.taken); break; }
      case 'gbcam-cap-retake': { const cap = gbCapture(); if (cap) cap.taken = null; render(); break; }
      case 'gbcam-cap-cancel': gbcamStopRecording(false); if (ui.gbmaCapture) gbmaCancel(); else gbceReturn(null); break;
      case 'gbcam-cap-play': toast('This feature is not part of the simulator.'); break;
      // Gallery's GET_CONTENT pick returns to the editor with the picture (Back returns without one).
      case 'gbce-photo-pick': { ui.overlay = ''; const sub = ui.sub; captureRecentView(); ui.gbcePick = {sub}; ui.view = 'gallery'; ui.sub = ''; ui.gbgPick = true; render(); break; }
      case 'gbce-photo-remove': if (ui.peopleDraft) ui.peopleDraft.photo = null; ui.overlay = ''; render(); break;
      case 'gbbr-share': ui.overlay = 'gb-dialog-share'; renderOverlay(); break;
      // EXTRA_TEXT carries the address and EXTRA_SUBJECT the page title.
      case 'gbbr-share-to': { const url = ICSBrowserSession.url(ui.browserSession) || '', address = browserAddress(String(url)), title = gbBrowserTitle(url); ui.overlay = '';
        if (id === 'email') { openApp('email'); composeEmail(); const draft = data.mailbox.find(m => m.id === ui.emailId); if (draft) { draft.subject = title; draft.body = 'http://' + address; save(); render(); } }
        else { openApp('messaging'); ui.sub = 'new'; data.messageDrafts ||= {}; data.messageDrafts.new = {...(data.messageDrafts.new || {}), body: 'http://' + address, updated: Date.now()}; save(); render(); }
        break; }
      // SelectCalendarsActivity edits a draft; OK writes it back (a calendar that is not visible hides its events).
      case 'gbcal-select': ui.overlay = ''; ui.gbCalSel = {state: data.calendarState || 0, expanded: true}; render(); break;
      case 'gbcal-select-cycle': ui.gbCalSel.state = (ui.gbCalSel.state + 1) % 3; render(); break;
      case 'gbcal-select-group': ui.gbCalSel.expanded = !ui.gbCalSel.expanded; render(); break;
      case 'gbcal-select-ok': data.calendarState = ui.gbCalSel.state; ui.gbCalSel = null; save(); render(); break;
      case 'gbpref-check': { const [app, key] = String(id).split(':'), ctx = gbPrefsContext(app), item = GBPrefs.find(ctx, key); if (item) gbPrefSet(key, !GBPrefs.get(item, ctx.values)); gbPrefRender(); break; }
      case 'gbpref-list': case 'gbpref-action': { const [app, key] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key); if (!item) break;
        if (item.toast) { toast('Unavailable in this simulator'); break; }
        if (item.open) { ui.gbPrefs = {app: item.open, view: ui.gbPrefs.view || ui.view, parent: ui.gbPrefs}; render(); break; }
        // Google Mail's Clear search history / Clear "Show pictures" act at once.
        if (item.done) { if (key === 'clear-search-history') data.gmailSearches = []; if (key === 'clear-display-images-whitelist') data.gmailShowPictures = []; if (key === 'pref_gtalk_clear_history_key' && data.talk23) data.talk23.searches = []; if (key === 'clear_history' && data.youtube23) data.youtube23.searches = []; if (key === 'cache_settings_clear_cache') data.mapsCache = false; save(); gbPrefRender(); break; }
        ui.gbMulti = null;
        ui.gbPrefDialog = key; ui.overlay = 'gb-dialog-pref'; renderOverlay(); break; }
      case 'gbpref-pick': { const [app, key, ...rest] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key), value = rest.join(':'); if (item) gbPrefSet(key, item.kind === 'list' ? Number(value) : value); ui.overlay = ''; gbPrefRender(); break; }
      case 'gbpref-edit-ok': { const [app, key] = String(id).split(':'), input = overlayRoot.querySelector('[data-pref-edit]'), item = GBPrefs.find(gbPrefsContext(app), key);
        // A number field (Amount of mail to sync) keeps only 1-999.
        if (input && !(item?.edit?.number && !(Number(input.value) >= 1 && Number(input.value) <= 999))) gbPrefSet(key, item?.edit?.number ? Math.round(Number(input.value)) : input.value.trim()); ui.overlay = ''; gbPrefRender(); break; }
      // MultiListPreference: the boxes toggle a draft, OK stores it.
      case 'gbpref-multi': { const [app, key, i] = String(id).split(':'), item = GBPrefs.find(gbPrefsContext(app), key); if (!item) break; const draft = ui.gbMulti ?? [...GBPrefs.get(item, gbPrefsContext(app).values)]; ui.gbMulti = draft.includes(Number(i)) ? draft.filter(x => x !== Number(i)) : [...draft, Number(i)].sort(); renderOverlay(); break; }
      case 'gbpref-multi-ok': { const [, key] = String(id).split(':'); if (ui.gbMulti) gbPrefSet(key, ui.gbMulti); ui.gbMulti = null; ui.overlay = ''; gbPrefRender(); break; }
      // BrowserYesNoPreference: the clears act on the simulated data; Reset to default drops the stored Browser settings.
      case 'gbpref-confirm': { const [app, key] = String(id).split(':');
        if (key === 'privacy_clear_history') { data.browserHistory = []; data.qsbShortcuts = (data.qsbShortcuts || []).filter(s => s.kind !== 'url'); }
        if (key === 'reset_default_preferences') data.appPrefs[app] = {};
        save(); ui.overlay = ''; gbPrefRender(); break; }
      // DownloadList.handleItemClick: open a finished file with its app, explain a failed or queued one.
      case 'gbdl-open': { const d = data.downloads?.find(x => x.id === Number(id)); if (!d) break;
        if (d.status === 'failed' || d.status === 'queued') { ui.gbdlDialog = d.id; ui.overlay = 'gb-dialog-dl'; renderOverlay(); break; }
        if (d.status !== 'success') break;
        const app = GBDownloads.KINDS[d.kind]?.app; if (app) openApp(app); else toast(GBDownloads.text(i18n.language, 'download_no_application_title')); break; }
      case 'gbdl-select': { const sel = gbDlContext().selected, n = Number(id); ui.gbdl.selected = sel.includes(n) ? sel.filter(x => x !== n) : [...sel, n]; render(); break; }
      case 'gbdl-deselect': ui.gbdl.selected = []; render(); break;
      case 'gbdl-delete': data.downloads = data.downloads.filter(d => !ui.gbdl.selected.includes(d.id)); ui.gbdl.selected = []; save(); render(); break;
      case 'gbdl-group': { const ctx = gbDlContext(), edges = GBDownloads.bins(ctx.now), present = [...new Set(ctx.downloads.map(d => GBDownloads.binOf(d.time, edges)))].sort(), open = ui.gbdl.expanded || present.slice(0, 1), bin = Number(id); ui.gbdl.expanded = open.includes(bin) ? open.filter(b => b !== bin) : [...open, bin]; render(); break; }
      case 'gbdl-sort': ui.overlay = ''; ui.gbdl.bySize = id === 'size'; render(); break;
      case 'gbdl-remove': data.downloads = data.downloads.filter(d => d.id !== Number(id)); ui.gbdl.selected = ui.gbdl.selected.filter(x => x !== Number(id)); save(); ui.overlay = ''; render(); break;
      // Retry restarts the download: In progress, then Complete.
      case 'gbdl-retry': { const d = data.downloads.find(x => x.id === Number(id)); ui.overlay = ''; if (d) { d.status = 'running'; d.time = Date.now(); save(); setTimeout(() => { d.status = 'success'; save(); if (ui.view === 'downloads') render(); }, 3000); } render(); break; }
      case 'gbqs-corpora-close': ui.qsb.selecting = false; render(); break;
      case 'gbqs-corpus': Object.assign(ui.qsb, {corpus: id || '', selecting: false}); render(); viewport.querySelector('.gbqs-field input')?.focus(); break;
      case 'gbqs-pick': gbSearchLaunch(ui.qsbItems?.[Number(id)]); break;
      // SearchSettings: id '' is the main page; Searchable items and Google search are its sub-pages.
      case 'gbqs-settings': ui.overlay = ''; Object.assign(ui.qsb ||= {corpus: '', query: ''}, {selecting: false, page: id || 'settings'}); render(); break;
      case 'gbqs-toggle-corpus': { const on = GBSearch.enabled(data.qsbCorpora); data.qsbCorpora = on.includes(id) ? on.filter(c => c !== id) : [...on, id]; if (ui.qsb?.corpus === id) ui.qsb.corpus = ''; save(); render(); break; }
      case 'gbqs-toggle-web': data.qsbWebSuggest = data.qsbWebSuggest === false; save(); render(); break;
      case 'gbqs-clear': ui.overlay = 'gb-dialog-qsb-clear'; renderOverlay(); break;
      case 'gbqs-clear-ok': data.qsbShortcuts = []; save(); ui.overlay = ''; render(); break;
      case 'browser-link': navigateBrowser(url); break;
      case 'browser-forward': browserForward(); break;
      case 'browser-tabs': ui.sub = 'tabs'; ui.overlay = ''; render(); break;
      case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
      case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
      case 'browser-bookmark': navigateBrowser(id); break;
      case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
      case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
      case 'browser-close-tab': ICSBrowserSession.close(ui.browserSession,Number(id)); saveBrowserState(); render(); break;
      case 'browser-refresh': ui.overlay=''; browserLoading(); render(); break;
      case 'gbbr-stop': ui.gbBrLoadingUntil = 0; ui.overlay = ''; render(); break;
      case 'gbbr-edit': ui.gbBrEdit = true; ui.gbBrEditValue = browserAddress(ui.browserUrl); ui.overlay = ''; render(); { const input = viewport.querySelector('.gbbr-search input'); input?.focus(); input?.select(); } break;
      case 'gbbr-edit-cancel': ui.gbBrEdit = false; render(); break;
      case 'gbbr-library': ui.sub = id; render(); break;
      case 'gbbr-switch-view': ui.gbBrList = !ui.gbBrList; ui.overlay = ''; render(); break;
      case 'gbbr-add-bookmark': ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = 'add'; renderOverlay(); break;
      case 'gbbr-add-bookmark-ok': { const name = overlayRoot.querySelector('[data-gbbr-name]')?.value.trim(), location = normalizeAddress(overlayRoot.querySelector('[data-gbbr-location]')?.value || ''); if (!name) { toast(GBBrowser.text(i18n.language, 'bookmark_needs_title')); break; } if (!location) break; if (!data.bookmarks.includes(location)) data.bookmarks.push(location); data.bookmarkTitles = {...(data.bookmarkTitles || {}), [location]: name}; ui.overlay = ''; save(); render(); toast(GBBrowser.text(i18n.language, 'added_to_bookmarks')); break; }
      case 'gbbr-page-info': ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = 'info'; renderOverlay(); break;
      case 'gbbr-star': { const on = data.bookmarks.includes(id); data.bookmarks = on ? data.bookmarks.filter(url => url !== id) : [...data.bookmarks, id]; ui.overlay = ''; save(); render(); toast(GBBrowser.text(i18n.language, on ? 'removed_from_bookmarks' : 'added_to_bookmarks')); break; }
      case 'gbbr-clear-history': data.browserHistory = []; ui.overlay = ''; save(); render(); break;
      case 'gbbr-open-new': ui.overlay = ''; if (!ICSBrowserSession.add(ui.browserSession)) break; navigateBrowser(id); break;
      case 'gbbr-copy-url': try { navigator.clipboard?.writeText(id); } catch {} ui.overlay = ''; renderOverlay(); break;
      case 'gbbr-remove-bookmark': data.bookmarks = data.bookmarks.filter(url => url !== id); ui.overlay = ''; save(); render(); break;
      case 'gbbr-remove-history': data.browserHistory = data.browserHistory.filter(url => url !== id); ui.overlay = ''; save(); render(); break;
      case 'gbbr-homepage': data.browserHome = id; ui.overlay = ''; save(); renderOverlay(); break;
      case 'gbbr-find-step': { const marks = [...viewport.querySelectorAll('.browser-page mark')]; if (!marks.length) break; ui.gbBrMark = ((ui.gbBrMark ?? -1) + Number(id) + marks.length) % marks.length; marks.forEach((m, k) => m.classList.toggle('current', k === ui.gbBrMark)); marks[ui.gbBrMark].scrollIntoView({block: 'nearest'}); break; }
      case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.gbbr-find input')?.focus(); break;
      case 'browser-close-find': ui.browserFind=undefined; render(); break;
      case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-new-tab': if (!ICSBrowserSession.add(ui.browserSession)) break; browserLoading(); ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; if (id === 'contacts') { ui.view = 'people'; ui.sub = ''; } else if (ui.view === 'people') { ui.view = 'phone'; ui.sub = ''; } render(); break;
      case 'gbp-contact': ui.selectedContact = Number(id); ui.view = 'people'; ui.sub = 'detail'; render(); break;
      case 'gbp-voicemail': toast('Voicemail number not set'); break;
      case 'gbp-new-contact': ui.overlay = ''; openApp('people'); editPerson(true); break;
      case 'gbp-email': ui.overlay = ''; openApp('email'); break;
      case 'gbp-clear-log': ui.overlay = 'gb-dialog-clearlog'; renderOverlay(); break;
      case 'gbp-clear-log-ok': data.callHistory = []; ui.overlay = ''; save(); render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phone=ui.dial; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; if (ui.dial.endsWith('*#*#8477#*#*')) { ui.dial = ''; data.protips = {index: 0, set: 1 - (data.protips?.set || 0)}; save(); home(false); setTimeout(() => blinkTips(3), 300); break; } render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': { const call=ui.activeCall; if(!call||call.endedAt)break; call.endedAt=Date.now(); call.keypad=false; render(); setTimeout(()=>{if(ui.activeCall===call&&ui.view==='phone')render();},GBPhone.HANGING_UP); setTimeout(()=>{if(ui.activeCall!==call)return; data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(call,call.endedAt)].slice(-50); ui.activeCall=null; ui.gbCallBackground=false; ui.gbAddCall=false; save(); if(ui.view==='phone'){ui.sub='';ui.dial='';render();} else renderStatus();},GBPhone.HANGING_UP+GBPhone.ENDED); break; }
      case 'gbp-add-call': if(!ui.activeCall)break; ui.gbCallBackground=true; ui.gbAddCall=true; ui.phoneTab='dialpad'; ui.view='phone'; ui.sub=''; ui.dial=''; render(); break;
      case 'gbp-dtmf': if(!ui.activeCall)break; ui.gbCallBackground=false; ui.gbAddCall=false; ui.activeCall.keypad=GBPhone.callState(ui.activeCall)==='active'; ui.view='phone'; render(); break;
      case 'gbp-return-call': if(!ui.activeCall)break; ui.overlay=''; ui.gbCallBackground=false; ui.gbAddCall=false; captureRecentView(); ui.view='phone'; ui.sub='calling'; ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,8); render(); break;
      case 'incall-toggle': if(ui.activeCall&&!ui.activeCall.endedAt){ui.activeCall[id]=!ui.activeCall[id];if(id==='hold')ui.activeCall.keypad=false;}render();renderStatus();break;
      case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
      case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
      case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
      case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
      case 'people-edit': ui.gbceMoreName = false; ui.gbceSecondary = false; editPerson(); break;
      case 'gbce-type': gbceSync(); ui.gbceDialog = id; ui.overlay = 'gb-dialog-ce'; renderOverlay(); break;
      case 'gbce-set-type': { const [kind, type] = id.split(':'); ui.peopleDraft[`${kind}Type`] = type; ui.overlay = ''; render(); break; }
      case 'gbce-remove': gbceSync(); ui.peopleDraft[id] = null; render(); break;
      case 'gbce-add': gbceSync(); ui.peopleDraft[id] = ''; render(); viewport.querySelector(`.gbce [name="${id}"]`)?.focus(); break;
      case 'gbce-more-name': gbceSync(); ui.gbceMoreName = !ui.gbceMoreName; render(); break;
      case 'gbce-secondary': gbceSync(); ui.gbceSecondary = !ui.gbceSecondary; render(); break;
      case 'gbce-revert': ui.sub = ui.sub === 'edit' && contact(ui.selectedContact) ? 'detail' : ''; ui.peopleDraft = null; render(); break;
      case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
      case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
      case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
      case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'thread': openMessageThread(id); break;
      case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
      case 'mms-attach': gbMmsDialog('attach'); break;
      case 'mms-smiley': gbMmsDialog('smiley'); break;
      case 'gbmms-pictures': gbMmsDialog('pictures'); break;
      case 'gbmms-delete-all': gbMmsDialog('delete-all'); break;
      case 'gbmms-delete-all-ok': data.messages = []; data.messageDrafts = data.messageDrafts?.new ? {new: data.messageDrafts.new} : {}; data.notifications = data.notifications.filter(n => n.id !== 2); ui.overlay = ''; save(); render(); break;
      case 'gbmms-view-contact': ui.overlay = ''; openApp('people'); ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'gbmms-add-contact': { const target = ui.sub === 'new' ? ICSMessaging.recipient(messageDraft().recipient || '', data.contacts) : ICSMessaging.identity(ui.thread, data.contacts); ui.overlay = ''; openApp('people'); editPerson(true); ui.peopleDraft.phone = target?.phone || ''; render(); break; }
      case 'gbmms-subject': ui.gbMmsSubject = true; ui.overlay = ''; render(); viewport.querySelector('[name=subject]')?.focus(); break;
      case 'gbmms-send': ui.overlay = ''; renderOverlay(); viewport.querySelector('.mms-compose')?.requestSubmit(); break;
      case 'gbmms-all-threads': ui.overlay = ''; ui.sub = ''; ui.gbMmsSubject = false; render(); break;
      case 'gbmms-copy': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); try { navigator.clipboard?.writeText(message?.body || ''); } catch {} ui.overlay = ''; renderOverlay(); break; }
      case 'gbmms-lock': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (message) message.locked = !message.locked; ui.overlay = ''; save(); render(); break; }
      case 'gbmms-thread-menu': ui.thread = id; gbMmsDialog('thread'); break;
      case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
      case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
      case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
      case 'mms-remove-attachment': { const draft = messageDraft(); delete draft.attachment; if (!draft.subject) toast(GBMms.text(i18n.language, 'converting_to_text_message')); save(); render(); scrollMessages(); break; }
      case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; ui.gbMmsSubject = false; save(); ui.overlay = ''; if (ui.sub === 'new') ui.sub = ''; render(); scrollMessages(); break;
      case 'mms-message': ui.mmsMessage = id; gbMmsDialog('message'); break;
      case 'mms-details': gbMmsDialog('details'); break;
      case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
      case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; gbMmsDialog(`delete-${ui.mmsDelete}`); break;
      case 'mms-confirm-delete': {
        data.messages = data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
        if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; }
        save(); ui.overlay = ''; render(); break;
      }
      case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
      case 'gallery-camera': openApp('camera'); break;
      case 'gallery-album': ui.galleryAlbum=id; ui.sub='album';ui.gallerySlideshow=false;ui.gbgStack=false;render();break;
      case 'gbg-home': gbgEndSelection(); ui.sub = ''; ui.gallerySlideshow = false; render(); break;
      case 'gbg-up': gbgEndSelection(); ui.sub = 'album'; ui.gallerySlideshow = false; render(); break;
      case 'gbg-caption': ui.gbgCaption = !ui.gbgCaption; render(); break;
      case 'gbg-mode': ui.gbgStack = !ui.gbgStack; render(); break;
      case 'gbg-hud': if (ui.gallerySlideshow) { ui.gallerySlideshow = false; render(); break; } ui.gbgHudHidden = !ui.gbgHudHidden; render(); break;
      case 'gbg-zoom': ui.galleryZoom = Number(id) > 0; render(); break;
      case 'gbg-toggle': { const list = ui.gbgSelected || []; ui.gbgSelected = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; ui.gbgPopup = ''; if (!ui.gbgSelected.length && ui.sub !== 'photo') gbgEndSelection(); render(); break; }
      case 'gbg-select-all': ui.gbgSelected = ui.sub ? ICSMedia.photos(data, ui.galleryAlbum).map(p => String(p.id)) : GBGallery.ALBUMS.filter(key => ICSMedia.photos(data, key).length); ui.gbgPopup = ''; render(); break;
      case 'gbg-deselect': gbgEndSelection(); render(); break;
      case 'gbg-select-current': ui.gbgSelect = true; ui.gbgSelected = [String(ui.selectedPhoto)]; ui.gbgPopup = ''; render(); break;
      case 'gbg-share': case 'gbg-delete': case 'gbg-more': { const kind = action.slice(4); if (!(ui.gbgSelected || []).length) break; ui.gbgPopup = ui.gbgPopup === kind ? '' : kind; render(); break; }
      case 'gbg-popup-close': ui.gbgPopup = ''; render(); break;
      case 'gbg-confirm-delete': {
        const gone = gbgSelectedPhotos().map(p => p.id); data.photos = data.photos.filter(p => !gone.includes(p.id)); save(); gbgEndSelection();
        if (ui.sub === 'photo') { const rest = ICSMedia.photos(data, ui.galleryAlbum); if (rest.length) ui.selectedPhoto = rest[0].id; else ui.sub = 'album'; }
        if (ui.sub === 'album' && !ICSMedia.photos(data, ui.galleryAlbum).length) ui.sub = '';
        render(); break;
      }
      case 'gbg-rotate': gbgSelectedPhotos().forEach(p => p.rotation = ((p.rotation || 0) + Number(id) + 360) % 360); save(); ui.gbgPopup = ''; if (ui.sub === 'photo') gbgEndSelection(); render(); break;
      // MenuBar's Crop starts CropImage on the picture; Save writes <name>-<n>.jpg beside it with the original title and
      // date (CropImage.saveOutput), so the copy sits next to the original, and Discard / Back just leave.
      case 'gbg-crop': { const photo = gbgSelectedPhotos()[0]; gbgEndSelection(); if (photo && !photo.video) { ui.selectedPhoto = photo.id; ui.galleryZoom = false; ui.gbgCrop = GBGallery.cropDefault(photo); } render(); break; }
      case 'gbg-crop-discard': ui.gbgCrop = null; render(); break;
      case 'gbg-crop-save': {
        const photo = data.photos.find(p => p.id === ui.selectedPhoto), c = ui.gbgCrop;
        if (!photo || !c) { ui.gbgCrop = null; render(); break; }
        ui.overlay = 'gb-dialog-crop-saving'; renderOverlay();
        setTimeout(() => {
          const copy = {...clone(photo), id: Date.now(), album: ICSMedia.album(photo), source: clone(photo), crop: {x: c.x, y: c.y, w: c.w, h: c.h}, rotation: 0, zoom: 1};
          data.photos.splice(Math.max(0, data.photos.indexOf(photo)), 0, copy); save();
          ui.gbgCrop = null; if (ui.overlay === 'gb-dialog-crop-saving') ui.overlay = ''; render(); renderOverlay();
        }, 600);
        break;
      }
      case 'gbg-wallpaper': { const photo = gbgSelectedPhotos()[0]; gbgEndSelection(); if (photo) { data.wallpaper = 99; delete data.liveWallpaper; data.customWallpaper = photo.colors; data.customWallpaperPhoto = clone(photo); save(); toast('Wallpaper set'); } render(); break; }
      case 'gbg-share-email': { const photo = gbgSelectedPhotos()[0]; gbgEndSelection(); if (!photo) break; openApp('email'); composeEmail(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item) item.attachment = clone(photo); save(); render(); break; }
      case 'photo': if (ui.view === 'gallery' && ui.gbgPick && ui.gbgmPick) { ui.gbgPick = false; ui.gbgmPick = false; ui.view = 'gmail'; GBGmail.attach(gappContext(), data.photos.find(p => p.id === Number(id))); render(); break; }
        if (ui.view === 'gallery' && ui.gbgPick && ui.gbcePick) { ui.gbgPick = false; if (ui.peopleDraft) ui.peopleDraft.photo = Number(id); ui.view = 'people'; ui.sub = ui.gbcePick.sub; ui.gbcePick = null; render(); break; }
        if (ui.view === 'gallery' && ui.gbgPick) { ui.gbgPick = false; const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; const widget = setup && data.homeWidgets[setup.page]?.find(w => w.id === setup.id); if (widget) Object.assign(widget, {source: 'photo', photo: Number(id)}); save(); ui.page = setup?.page ?? ui.page; ui.view = 'home'; ui.sub = ''; render(); break; }
        if (ui.view === 'home') { openApp('gallery'); }
        ui.selectedPhoto=Number(id);ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});ui.sub='photo';ui.galleryZoom=false;render();break;
      // Show on map: Util.openMaps with the item's location, the nearest address as the marker's text.
      case 'gbg-show-map': { const photo = gbgSelectedPhotos()[0]; ui.gbgPopup = ''; if (!photo?.location) { render(); break; } const p = GBMaps.place(photo.location.fx, photo.location.fy); gbgEndSelection(); GBMaps.showPoint(ui, {name: p.address, address: '', fx: photo.location.fx, fy: photo.location.fy}); openApp('maps'); break; }
      case 'gallery-details': { const photo = gbgSelectedPhotos()[0] || data.photos.find(p => p.id === ui.selectedPhoto); if (photo) ui.selectedPhoto = photo.id; ui.gbgPopup = ''; ui.overlay = 'gb-dialog-gallery'; render(); renderOverlay(); break; }
      case 'gallery-share': ui.overlay=action;renderOverlay();break;
      case 'gallery-slideshow': {const items=ICSMedia.photos(data,ui.galleryAlbum);if(!items.length)break;if(ui.sub!=='photo')ui.selectedPhoto=items[0].id;ui.sub='photo';ui.overlay='';ui.gallerySlideshow=true;ui.gallerySlideAt=Date.now();render();break;}
      case 'gallery-share-message': {const photo=gbgSelectedPhotos()[0]||data.photos.find(p=>p.id===ui.selectedPhoto);gbgEndSelection();if(!photo)break;openApp('messaging');ui.sub='new';messageDraft().attachment=clone(photo);save();render();break;}
      case 'gbcam-popup': ui.gbcamPopup = ui.gbcamPopup === id ? '' : id; render(); break;
      case 'gbcam-popup-close': ui.gbcamPopup = ''; render(); break;
      case 'gbcam-set': { const [key, value] = id.split(':'); gbcamSet({[key]: value}); if (ui.gbcamPopup !== 'settings') ui.gbcamPopup = ''; render(); break; }
      case 'gbcam-restore': ui.gbcamPopup = ''; ui.overlay = 'gb-dialog-camera'; render(); renderOverlay(); break;
      case 'gbcam-restore-ok': data.cameraSettings = {...GBCamera.DEFAULTS, front: false, exposure: 0}; save(); ui.overlay = ''; render(); break;
      case 'gbcam-focus': if (ui.gbcamPopup) { ui.gbcamPopup = ''; render(); break; } gbcamFocus(); break;
      case 'gbcam-switch-camera': gbcamSet({facing: GBCamera.settings(data.cameraSettings || {}).facing === 'front' ? 'back' : 'front'}); ui.overlay = ''; render(); break;
      case 'gbcam-mode': gbcamStopRecording(); ui.gbcamMode = ui.gbcamMode === 'video' ? 'photo' : 'video'; ui.gbcamPopup = ''; ui.overlay = ''; render(); break;
      case 'gbcam-shutter':
        ui.gbcamPopup = '';
        if (ui.gbcamMode === 'video') {
          if (ui.gbcamRec) { gbcamStopRecording(); render(); break; }
          ui.gbcamRec = Date.now(); render(); ui.gbcamRecTimer = setInterval(() => { const label = viewport.querySelector('.gbcam-rec span'); if (label) label.textContent = gbcamClock(); else clearInterval(ui.gbcamRecTimer); }, 500); break;
        }
        // ShutterButton: autofocus, then the capture; the new picture slides into the review thumbnail.
        gbcamFocus(() => { const photo = {...ICSMedia.scene(data), ...(GBCamera.settings(data.cameraSettings || {}).gps === 'on' ? {location: {fx: GBMaps.ME.fx, fy: GBMaps.ME.fy}} : {}), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 8)}_${new Date().toISOString().replace(/[-:T]/g, '').slice(8, 14)}`, album: 'camera', created: Date.now()}; const cap = gbCapture(); if (cap) { cap.taken = photo; render(); return; } data.photos.unshift(photo); save(); render(); viewport.querySelector('.gbcam-preview')?.animate([{opacity: 1}, {opacity: .15}, {opacity: 1}], {duration: 260}); viewport.querySelector('.gbcam-thumb img')?.animate([{transform: 'scale(1.6)', opacity: .3}, {transform: 'none', opacity: 1}], {duration: 380}); });
        break;
      case 'camera-review': {gbcamStopRecording();const photo=ICSMedia.photos(data,'camera')[0];openApp('gallery');if(photo){ui.galleryAlbum='camera';ui.selectedPhoto=photo.id;ui.sub='photo';render();}break;}
      case 'calendar-prev': calendarMove(-1); break;
      case 'calendar-next': calendarMove(1); break;
      case 'calendar-day': if ((ui.calendarMode || 'Month') !== 'Day') ui.gbCalBack = ui.calendarMode || 'Month'; ui.selectedDate=id;ui.calendarMode='Day';ui.overlay='';calendarRender();break;
      case 'calendar-today': ui.selectedDate=today();ui.overlay='';calendarRender();break;
      case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
      case 'calendar-mode': ui.gbCalBack='';ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender();break;
      case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input').focus();break;
      case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit({date,time,title:''});break;}
      case 'event-new': calendarEdit();break;
      case 'gbcal-new-on': ui.selectedDate = id; calendarEdit(); break;
      case 'gbcal-agenda-from': ui.selectedDate = id; ui.gbCalBack = ui.calendarMode || 'Month'; ui.calendarMode = 'Agenda'; ui.overlay = ''; calendarRender(); break;
      case 'gbcal-agenda-step': ui.selectedDate = ICSCalendar.plus(ui.selectedDate, Number(id) * 30); render(); break;
      case 'gbcal-extra': gbCalSyncDraft(); ui.gbCalExtra = !ui.gbCalExtra; ui.overlay = ''; render(); break;
      case 'gbcal-dialog': gbCalSyncDraft(); ui.gbCalTemp = {field: id, value: ['date', 'endDate', 'time', 'endTime'].includes(id) ? ui.eventDraft?.[id] : ''}; gbCalDialog(id); break;
      case 'gbcal-date-step': { const [field, delta] = id.split(':'); ui.gbCalTemp.value = GBCalendar.step('date', ui.gbCalTemp.value, field, Number(delta)); renderOverlay(); break; }
      case 'gbcal-time-step': { const [field, delta] = id.split(':'); ui.gbCalTemp.value = GBCalendar.step('time', ui.gbCalTemp.value, field, Number(delta)); renderOverlay(); break; }
      case 'gbcal-ampm': ui.gbCalTemp.value = GBCalendar.step('time', ui.gbCalTemp.value, 'ampm', 0); renderOverlay(); break;
      case 'gbcal-picker-set': {
        // EditEvent: moving the start keeps the duration; an end before the start is pulled up to it.
        const d = ui.eventDraft, field = ui.gbCalTemp.field, value = ui.gbCalTemp.value, stamp = (date, time) => new Date(`${date}T${time}:00`).getTime();
        const span = stamp(d.endDate, d.endTime) - stamp(d.date, d.time);
        d[field] = value;
        if (field === 'date' || field === 'time') { const end = new Date(stamp(d.date, d.time) + span); d.endDate = ICSCalendar.iso(end); d.endTime = `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`; }
        else if (stamp(d.endDate, d.endTime) < stamp(d.date, d.time)) { d.endDate = d.date; d.endTime = d.time; }
        ui.calendarError = ''; ui.overlay = ''; render(); break;
      }
      case 'gbcal-choose': {
        const [field, value] = id.split(':');
        if (field === 'info-reminder') { const series = data.events.find(item => item.id === ui.selectedEvent); if (series) { series.reminder = Number(value); save(); } }
        else if (ui.eventDraft) ui.eventDraft[field] = field === 'repeat' ? value : Number(value);
        ui.overlay = ''; render(); break;
      }
      case 'gbcal-reminder': gbCalSyncDraft(); ui.eventDraft.reminder = Number(id) > 0 ? 10 : -1; render(); break;
      case 'gbcal-info-reminder': { const series = data.events.find(item => item.id === ui.selectedEvent); if (series) { series.reminder = Number(id) > 0 ? 10 : -1; save(); } render(); break; }
      case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
      case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none')gbCalDialog('edit-scope'); else calendarEdit(series); break; }
      case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit({...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
      case 'event-delete-scope': deleteEventScope(id); break;
      case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
      case 'event-delete': if(ui.sub==='event-edit'&&!ui.eventDraft?.id)break;gbCalDialog(ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'delete-scope':'delete');break;
      case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender();break;
      case 'clock-alarms': ui.sub='alarms'; render(); break;
      case 'clock-dim': ui.clockDim=!ui.clockDim; render(); break;
      case 'alarm-new': editAlarm(); ui.alarmDraft.enabled = true; ui.alarmDraft.isNew = true; ui.dcTemp = {time: ui.alarmDraft.time}; ui.overlay = 'clock-time'; renderOverlay(); break;
      case 'alarm-edit': editAlarm(id); break;
      case 'alarm-cancel': ui.alarmDraft=null; ui.sub='alarms'; render(); break;
      case 'alarm-draft-toggle': ui.alarmDraft[id]=!ui.alarmDraft[id]; render(); break;
      case 'alarm-field': ui.dcTemp = {time: ui.alarmDraft.time, days: [...(ui.alarmDraft.days || [])], tone: ICSDeskClock.normalize(ui.alarmDraft).tone}; ui.overlay='clock-'+id; renderOverlay(); break;
      case 'dc-time-step': { const [field, step] = id.split(':'); let [h, m] = ui.dcTemp.time.split(':').map(Number); if (field === 'hour') h = (h + Number(step) + 24) % 24; else m = (m + Number(step) + 60) % 60; ui.dcTemp.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; renderOverlay(); break; }
      case 'dc-ampm': { const [h, m] = ui.dcTemp.time.split(':').map(Number); ui.dcTemp.time = `${String((h + 12) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`; renderOverlay(); break; }
      case 'dc-time-set': ui.alarmDraft.time = ui.dcTemp.time; ui.alarmDraft.enabled = true; ui.overlay = ''; render(); break;
      case 'dc-day': { const day = Number(id), days = ui.dcTemp.days; ui.dcTemp.days = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort(); renderOverlay(); break; }
      case 'dc-days-ok': ui.alarmDraft.days = ui.dcTemp.days; ui.overlay = ''; render(); break;
      case 'dc-tone': ui.dcTemp.tone = id; renderOverlay(); break;
      case 'dc-tone-ok': ui.alarmDraft.tone = ui.dcTemp.tone; ui.overlay = ''; render(); break;
      case 'dc-label-ok': ui.alarmDraft.label = String(overlayRoot.querySelector('[data-dc-label]')?.value || '').trim().slice(0, 60); ui.overlay = ''; render(); break;
      case 'dc-delete-from-list': ui.alarmDraft = ICSDeskClock.normalize(data.alarms.find(alarm => alarm.id === Number(id))); ui.overlay = 'clock-delete'; renderOverlay(); break;
      case 'alarm-save': {
        const alarm=ICSDeskClock.normalize(ui.alarmDraft); delete alarm.snoozedUntil; delete alarm.lastFiredMinute;
        const index=data.alarms.findIndex(item=>item.id===alarm.id);
        if(index<0){alarm.id=Date.now();data.alarms.push(alarm);}else data.alarms[index]=alarm;
        delete alarm.isNew; save(); ui.alarmDraft=null; ui.sub='alarms'; render(); if (alarm.enabled) alarmSetToast(alarm); break;
      }
      case 'alarm-delete': ui.overlay='clock-delete'; renderOverlay(); break;
      case 'alarm-confirm-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==ui.alarmDraft.id); save(); ui.alarmDraft=null; ui.overlay=''; ui.sub='alarms'; render(); break;
      case 'alarm-snooze': {
        const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
        // Snooze duration from the Clock settings (snooze_duration: 5, 10, ... 30 minutes).
        const minutes=5*((data.appPrefs?.clock?.snooze_duration??1)+1);
        if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+minutes*60000;save();}
        ui.overlay='';render();toast(AndroidStrings.format(GBDeskClock.text(i18n.language,'alarm_alert_snooze_set'), String(minutes)));break;
      }
      case 'alarm-dismiss': ui.overlay=''; render(); break;
      case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } ui.overlay = ''; save(); render(); if (alarm?.enabled) alarmSetToast(alarm); break; }
      case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
      case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
      case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
      case 'calc-key': operateCalculator(id); render(); viewport.querySelector(`.gbcalc-key[data-id="${CSS.escape(id)}"]`)?.classList.add('gbcalc-flame'); break;
      case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
      case 'music-tab': ui.musicTab=id;ui.sub='';render();break;
      case 'music-library': ui.sub='';render();break;
      case 'music-player': ui.sub='player';render();break;
      case 'music-queue': ui.sub='queue';render();break;
      case 'music-group': ui.musicGroup=id;ui.sub='music-group';render();break;
      case 'music-expand': {const open=new Set(ui.musicExpanded||[]);if(open.has(id))open.delete(id);else open.add(id);ui.musicExpanded=[...open];render();break;}
      case 'music-select': ui.music.queue=[...ICSMusic.listing(ui.music,ui)];ui.music.track=Number(id);ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
      case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;if(!ui.music.shuffle)ui.music.party=false;saveMusic();render();toast(musicText(ui.music.shuffle?'shuffle_on_notif':'shuffle_off_notif'));break;
      case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();toast(musicText({all:'repeat_all_notif',one:'repeat_current_notif',off:'repeat_off_notif'}[ui.music.repeat]));break;
      case 'music-track-menu': ui.musicSelected=Number(id);ui.overlay='gb-dialog-music';ui.gbMusicDialog='track';renderOverlay();break;
      case 'music-track-menu-add': ui.musicSelected=ui.music.track;ui.overlay='gb-dialog-music';ui.gbMusicDialog='add';renderOverlay();break;
      case 'music-party': ui.music.party=!ui.music.party;ui.music.shuffle=ui.music.party;if(ui.music.party)ui.music.playing=true;ui.overlay='';saveMusic();render();break;
      case 'music-shuffle-all': ui.music.queue=ICSMusic.tracks.map((_,i)=>i);ui.music.shuffle=true;ui.music.track=Math.floor(Math.random()*ICSMusic.tracks.length);ui.music.position=0;ui.music.playing=true;ui.overlay='';saveMusic();ui.sub='player';render();break;
      case 'music-play-selected': ui.overlay='';{const button=document.createElement('button');button.dataset.action='music-select';button.dataset.id=String(ui.musicSelected);viewport.append(button);button.click();button.remove();}break;
      case 'music-playlist-save': overlayRoot.querySelector('form[data-form="music-playlist"]')?.requestSubmit();break;
      case 'music-add-to-playlist': ui.overlay='gb-dialog-music';ui.gbMusicDialog='add';renderOverlay();break;
      case 'music-add-queue': if(!ui.music.queue.includes(ui.musicSelected))ui.music.queue.push(ui.musicSelected);saveMusic();ui.overlay='';render();break;
      case 'music-new-playlist': ui.musicAddPending=id==='add';ui.overlay='gb-dialog-music';ui.gbMusicDialog='new';renderOverlay();overlayRoot.querySelector('[name=name]')?.focus();break;
      case 'music-add-confirm': {const playlist=ui.music.playlists.find(p=>String(p.id)===id);if(playlist&&!playlist.tracks.includes(ui.musicSelected))playlist.tracks.push(ui.musicSelected);saveMusic();ui.overlay='';render();toast('Added to playlist');break;}
      case 'music-remove-from-playlist': {const playlist=ui.music.playlists.find(p=>`playlist|${p.id}`===ui.musicGroup);if(playlist)playlist.tracks=playlist.tracks.filter(track=>track!==ui.musicSelected);saveMusic();ui.overlay='';render();break;}
      case 'email-read': {const item=data.mailbox.find(item=>item.id===id);if(!item)break;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
      case 'email-compose': composeEmail();break;
      case 'gbem-mailboxes': ui.sub = 'mailboxes'; ui.overlay = ''; render(); break;
      case 'gbem-accounts': ui.sub = 'accounts'; ui.overlay = ''; render(); break;
      case 'gbem-reply-all': composeEmail(data.mailbox.find(item => item.id === ui.emailId), false, '', true); break;
      case 'gbem-selected-star': { const items = data.mailbox.filter(item => (ui.emailSelected || []).includes(item.id)), on = !items.every(item => item.starred); items.forEach(item => item.starred = on); save(); render(); break; }
      case 'gbem-save-draft': { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item) item.folder = 'Drafts'; gbEmLeaveCompose('message_saved_toast'); break; }
      case 'gbem-discard': data.mailbox = data.mailbox.filter(item => item.id !== ui.emailId); gbEmLeaveCompose('message_discarded_toast'); break;
      case 'gbem-send': ui.overlay = ''; renderOverlay(); viewport.querySelector('.gbem-compose')?.requestSubmit(); break;
      case 'gbem-drop-quoted': { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item) delete item.quoted; render(); break; }
      case 'gbem-context-delete': { const item = data.mailbox.find(m => m.id === id); if (!item) break; if (item.folder === 'Drafts' || item.folder === 'Trash') data.mailbox = data.mailbox.filter(m => m.id !== id); else ICSEmail.trash(data.mailbox, [id]); ui.overlay = ''; save(); render(); toast(emailText(item.folder === 'Drafts' ? 'message_discarded_toast' : 'message_deleted_toast_one')); break; }
      case 'gbem-context-reply': case 'gbem-context-reply-all': case 'gbem-context-forward': ui.overlay = ''; composeEmail(data.mailbox.find(m => m.id === id), action === 'gbem-context-forward', '', action === 'gbem-context-reply-all'); break;
      case 'gbem-context-read': { const item = data.mailbox.find(m => m.id === id); if (item) item.read = !item.read; ui.overlay = ''; save(); render(); break; }
      case 'email-reply': case 'email-forward': composeEmail(data.mailbox.find(item=>item.id===ui.emailId),action==='email-forward');break;
      case 'email-folder': ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
      case 'email-star': {const item=data.mailbox.find(item=>item.id===id);if(item)item.starred=!item.starred;save();render();break;}
      case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
      case 'email-clear-selection': ui.emailSelected=[];render();break;
      case 'email-trash': case 'email-selected-trash': {const ids=action==='email-trash'?[ui.emailId]:ui.emailSelected||[];ICSEmail.trash(data.mailbox,ids);ui.sub='';ui.overlay='';ui.emailSelected=[];save();render();toast(emailText(ids.length>1?'message_deleted_toast_other':'message_deleted_toast_one'));break;}
      case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];data.mailbox.filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-selected-read': data.mailbox.filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
      case 'email-unread': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
      case 'email-search': ui.emailQuery='';render();viewport.querySelector('[data-form="email-search"] input')?.focus();break;
      case 'email-refresh': toast('Local mailbox is up to date');break;
      case 'email-cc': gbEmSync();ui.emailCc=true;ui.overlay='';render();break;
      case 'email-attach': gbEmSync();gbEmDialog('attach');break;
      case 'email-attach-photo': {const item=data.mailbox.find(item=>item.id===ui.emailId),photo=data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
      case 'email-remove-attachment': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (GBApps.has(ui.view) && GBApps.get(ui.view).submit?.(form.dataset.form, values, gappContext())) return;
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    // Email's server settings: Next keeps valid fields and returns to the account's settings.
    if (form.dataset.form === 'gbem-server') { data.appPrefs ||= {}; if (GBPrefs.serverSave(form, data.appPrefs['email-servers'] ||= {})) { save(); ui.gbPrefs = ui.gbPrefs?.parent || null; render(); } return; }
    if (form.dataset.form === 'play-search') { ui.play.query = String(values.get('query') || '').trim(); render(); return; }
    if (form.dataset.form === 'phone-search') { ui.phoneSearch = String(values.get('query') || '').trim(); render(); return; }
    if (form.dataset.form === 'wifi-add') {
      const name = String(values.get('ssid') || '').trim();
      const security = values.get('security');
      if (!name) return;
      if (security !== 'Open' && String(values.get('password') || '').length < 8) { toast('Password must have at least 8 characters'); return; }
      data.savedWifiNetworks ||= [];
      if (!allWifiNetworks().some(network => network.name === name)) data.savedWifiNetworks.push({name, security, strength:4});
      data.settings.wifiNetwork = name;
      save(); ui.overlay = ''; render(); return;
    }
    if (form.dataset.form === 'bluetooth-rename') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      data.settings.bluetoothName = name;
      save(); ui.overlay = ''; render(); return;
    }
    switch (form.dataset.form) {
      case 'browser-find': ui.browserFind=String(values.get('query')||'').trim(); render(); break;
      case 'people-search': ui.peopleQuery=String(values.get('query')||'').trim(); render(); break;
      case 'people-save': {
        // ContactEditorActivity: the structured name is joined into the display name; an empty contact is not saved.
        const name=values.has('given')?GBContactEditor.join([values.get('prefix'),values.get('given'),values.get('middle')].filter(Boolean).join(' '),[values.get('family'),values.get('suffix')].filter(Boolean).join(' ')):String(values.get('name')||'').trim(); if(!name){ui.sub=ui.sub==='edit'&&contact(ui.selectedContact)?'detail':'';ui.peopleDraft=null;render();break;}
        const id=ui.sub==='edit'?ui.selectedContact:Date.now();
        const person=contact(id)||{id};
        person.name=name;for(const key of ['phone','email','company','notes'])person[key]=String(values.get(key)||'').trim();
        if(ui.peopleDraft&&'photo' in ui.peopleDraft){if(ui.peopleDraft.photo)person.photo=ui.peopleDraft.photo;else delete person.photo;}
        if(ui.peopleDraft?.phoneType)person.phoneType=ui.peopleDraft.phoneType;if(ui.peopleDraft?.emailType)person.emailType=ui.peopleDraft.emailType;
        if(!contact(id))data.contacts.push(person);
        if(!values.has('given')){const groups=values.getAll('groups');data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});}
        save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast(GBContactEditor.text(i18n.language,'contactSavedToast'));break;
      }
      case 'address': navigateBrowser(values.get('address')); break;
      // AccountSetupCheckSettings: the simulator is offline, so the incoming server check fails like a phone without a connection.
      case 'gbem-setup': { if (!GBEmail.validAddress(values.get('email')) || !values.get('password')) break; ui.gbEmSetup = {email: String(values.get('email')).trim(), def: values.has('def')}; ui.gbEmSetupDialog = 'checking'; ui.overlay = 'gb-dialog-emsetup'; renderOverlay();
        clearTimeout(ui.gbEmSetupTimer); ui.gbEmSetupTimer = setTimeout(() => { if (ui.overlay !== 'gb-dialog-emsetup') return; ui.gbEmSetupDialog = 'failed'; renderOverlay(); }, 2500); break; }
      case 'gbqs-search': { const q = String(values.get('q') || '').trim(); if (!q) break; ui.qsb.query = q; const ctx = gbSearchContext(); if (!ui.qsb.corpus || ui.qsb.corpus === 'web') gbSearchLaunch({kind: !normalizeAddress(q).startsWith('search:') ? 'url' : 'web', corpus: 'web', id: q, text1: q, icon: !normalizeAddress(q).startsWith('search:') ? 'gb-qsb-globe.png' : 'gb-qsb-magnifying_glass.png'}); else gbSearchLaunch(ctx.items.find(item => !item.shortcut) || ctx.items[0]); break; }
      case 'gbmk-search': { const q = String(values.get('query') || '').trim(); if (!q) break; data.marketSearches = [q, ...(data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); gbMarketGo({page: 'search', query: q}); break; }
      case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
      case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
      case 'mms-send': {
        const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),data.contacts);
        if (!target) { toast('Enter a contact name or valid phone number'); return; }
        sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
      }
      case 'contact': {
        const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
        if (!name || !phone) return;
        const id = Date.now(); data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
      }
      case 'event': {
        const event={...ui.eventDraft,id:ui.eventDraft?.id || Date.now(),title:String(values.get('title')||'').trim(),date:String(values.get('date')),time:String(values.get('time')),endDate:String(values.get('endDate')),endTime:String(values.get('endTime')),allDay:values.has('allDay'),location:String(values.get('location')||'').trim(),description:String(values.get('description')||'').trim()};
        ui.eventDraft=event;
        if(!ICSCalendar.valid(event)){ui.calendarError='End must be after start';render();return;}
        event.repeat=String(values.get('repeat')||'none');event.reminder=Number(values.get('reminder')??-1);
        const {scope,instance,seriesStart}=event;delete event.scope;delete event.instance;delete event.seriesStart;
        const existing=data.events.findIndex(item=>item.id===event.id);
        if(scope&&existing>=0){
          const series=data.events[existing];
          if(scope==='this'){series.exdates=[...new Set([...(series.exdates||[]),instance])];event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else if(scope==='future'&&instance!==seriesStart){series.until=ICSCalendar.plus(instance,-1);event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else {const shift=Math.round((ICSCalendar.parse(event.date)-ICSCalendar.parse(instance))/864e5),span=Math.round((ICSCalendar.parse(event.endDate)-ICSCalendar.parse(event.date))/864e5);event.date=ICSCalendar.plus(seriesStart,shift);event.endDate=ICSCalendar.plus(event.date,span);data.events[existing]=event;}
        } else if(existing<0)data.events.push(event);else data.events[existing]=event;
        const edited=existing>=0;save();ui.selectedDate=event.date;ui.selectedEvent=event.id;ui.selectedInstance=scope&&scope!=='all'?event.date:instance||'';ui.eventDraft=null;ui.sub=edited?'event':'';render();toast(GBCalendar.text(i18n.language,edited?'saving_event':'creating_event'));break;
      }
      case 'calendar-search': ui.calendarSearch=String(values.get('query')||'').trim();render();break;
      case 'music-playlist': {const name=String(values.get('name')||'').trim();if(!name)return;ui.music.playlists.push({id:Date.now(),name,tracks:ui.musicAddPending?[ui.musicSelected]:[]});saveMusic();ui.overlay='';render();break;}
      case 'email': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.recipients(item.to).length){save();toast(emailText('message_compose_error_no_recipients'));break;}if(item.quoted){item.body=[item.body,item.quoted].filter(Boolean).join('\n\n');delete item.quoted;}if(!ICSEmail.send(item)){save();toast(emailText('message_compose_error_invalid_email'));break;}ui.emailCc=false;ui.sub='';ui.emailError='';save();render();break;}
      case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
      default: break;
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
    if (event.target.matches('[data-bk-bright]')) { data.booksPrefs = {...GBGoogleApps.bookPrefs(data), brightness: Number(event.target.value)}; delete data.booksNight; save(); viewport.querySelector('.bk-prefs')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return; }
    if (event.target.closest('.gbqs-field') && ui.qsb) { ui.qsb.query = event.target.value; gbSearchRefresh(); return; }
    // AccountSetupBasics.validateFields: Next and Manual setup follow the address and password (the password is never stored).
    if (event.target.closest('[data-form="gbem-server"]')) { GBPrefs.serverInput(event.target.closest('form'), event.target); return; }
    if (event.target.closest('.gbem-setup') && ui.gbEmSetup) { const form = event.target.closest('form'), ok = GBEmail.validAddress(form.elements.email.value) && !!form.elements.password.value; ui.gbEmSetup.email = form.elements.email.value; ui.gbEmSetup.def = form.elements.def.checked; form.querySelectorAll('.gbem-setup-bar button').forEach(b => { b.disabled = !ok; }); return; }
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
    if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return;}
    if(event.target.closest('.email-compose')&&event.target.name){const item=data.mailbox.find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return;}
    if(event.target.closest('.cal-editor') && event.target.name) {
      ui.eventDraft[event.target.name]=event.target.type==='checkbox'?event.target.checked:event.target.value;
      return;
    }
    if(event.target.matches('.camera-zoom input')) {
      data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.zoom=Number(event.target.value);save();
      viewport.querySelector('.camera-focus-area .media-photo').src=ICSMedia.image(ICSMedia.scene(data));
      viewport.querySelector('.camera-zoom output').textContent=Number(event.target.value).toFixed(1)+'×';return;
    }
    if(event.target.closest('#people-editor')) {
      if(event.target.name==='groups')ui.peopleDraft.groups=[...viewport.querySelectorAll('[name=groups]:checked')].map(input=>input.value);
      else ui.peopleDraft[event.target.name]=event.target.value;
      return;
    }
    if (event.target.matches('[data-gbmk-auto]')) { const id = event.target.dataset.gbmkAuto, list = data.marketAuto || []; data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return; }
    if (event.target.matches('[data-gbsp-erase]')) { ui.gbspErase = event.target.checked; return; }
    if (event.target.matches('[data-gbcam-zoom]')) { gbcamSet({zoom: GBCamera.ZOOMS[Number(event.target.value)] || 1}); const out = event.target.nextElementSibling; if (out) out.textContent = GBCamera.zoomText(GBCamera.ZOOMS[Number(event.target.value)] || 1); const ind = viewport.querySelector('.gbcam-ind[data-id="zoom"] b'); if (ind) ind.textContent = out.textContent; viewport.querySelector('.gbcam-scene img')?.style.setProperty('transform', `scale(${GBCamera.ZOOMS[Number(event.target.value)] || 1})`); return; }
    if (event.target.closest('.gbcal-edit') && ui.eventDraft) { if (event.target.name === 'allDay') { gbCalSyncDraft(); ui.eventDraft.allDay = event.target.checked; render(); } else if (['title', 'location', 'description'].includes(event.target.name)) ui.eventDraft[event.target.name] = event.target.value; return; }
    if (ui.view === 'play-store' && event.target.closest('.gbbr-search')) { ui.marketEdit = event.target.value; const pos = event.target.selectionStart; render(); const input = viewport.querySelector('.gbbr-search input'); input?.focus(); input?.setSelectionRange(pos, pos); return; }
    if (event.target.closest('.gbbr-search')) { ui.gbBrEditValue = event.target.value; const box = viewport.querySelector('.gbbr-suggest'); if (box) box.innerHTML = GBBrowser.suggestions(gbBrowserContext()); return; }
    if (event.target.closest('.gbbr-find')) { ui.browserFind = event.target.value; ui.gbBrMark = -1; const page = viewport.querySelector('.browser-page'); page.innerHTML = renderWebsite(ui.browserUrl); if (ui.browserFind) highlightBrowserText(); else viewport.querySelector('.web-find-count').textContent = ''; return; }
    if (event.target.closest('.mms-compose')) {
      const draft = messageDraft();
      if (event.target.name === 'body') draft.body = event.target.value;
      if (event.target.name === 'subject') draft.subject = event.target.value;
      if (event.target.name === 'recipient') {
        draft.recipient = event.target.value;
        const query = draft.recipient.trim().toLocaleLowerCase();
        viewport.querySelector('.mms-suggestions').innerHTML = query ? data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
      }
      draft.updated = Date.now(); save();
      const count = ICSMessaging.counter(draft.body || '');
      viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining <= 10 ? `${count.remaining} / ${count.count}` : '';
      viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
      if (event.target.name === 'body') { event.target.style.height = 'calc(48 * var(--dp))'; event.target.style.height = `${Math.min(dp(93.913),event.target.scrollHeight)}px`; }
      return;
    }
    if (event.target.dataset.field === 'brightness') {
      data.settings.brightness = Number(event.target.value); save();
      const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
      screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    }
    if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);}
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
  let homeLongPressTimer = null, calculatorClearTimer = null, messageHoldTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; gbMmsDialog('message'); }
    const thread = event.target.closest('.gbmms-thread[data-action="thread"]');
    if (thread && !ui.overlay) { ui.thread = thread.dataset.id; gbMmsDialog('thread'); }
    const link = event.target.closest('[data-gbbr-item]');
    if (link && !ui.overlay) { ui.gbBrTarget = link.dataset.id; ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = link.dataset.gbbrItem; renderOverlay(); }
    const song = event.target.closest('.stock-music [data-action="music-select"]');
    if (song && !ui.overlay) { ui.musicSelected = Number(song.dataset.id); ui.overlay = 'gb-dialog-music'; ui.gbMusicDialog = 'track'; renderOverlay(); }
    const ct = event.target.closest('[data-gbct-hold]');
    if (ct && !ui.overlay) GBContactsIO.hold(ct.dataset.gbctHold, gbctContext());
    const net = event.target.closest('[data-gbnet-hold]');
    if (net && !ui.overlay) GBNetwork.hold(net.dataset.gbnetHold, gbNetContext());
    const alarm = event.target.closest('.gbdc-alarm-body');
    if (alarm && !ui.overlay) { ui.dcContext = Number(alarm.dataset.id); ui.overlay = 'clock-context'; renderOverlay(); }
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
  // CropImage's HighlightView owns its drags: they never reach the screen's swipe and long-press handling.
  screen.addEventListener('pointerdown', event => {
    if (ui.view !== 'gallery' || !ui.gbgCrop || ui.overlay || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const view = event.target.closest('.gbg-crop'), frame = view?.querySelector('[data-crop-frame]'), photo = data.photos.find(p => p.id === ui.selectedPhoto);
    if (!frame || !photo || event.target.closest('button')) return;
    if (GBGallery.cropDrag(event, frame, ui.gbgCrop, photo, () => {})) { event.stopPropagation(); event.preventDefault(); }
  }, true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.gbdc-alarms,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !ui.locked && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.gbsh-close'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; suppressReleaseClick(); }, 550);
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; suppressReleaseClick(); gbMmsDialog('message'); }, 550);
    const heldGallery = event.target.closest('[data-gbg-hold]');
    if (heldGallery && !ui.overlay && !ui.gbgSelect) messageHoldTimer = setTimeout(() => { ui.gbgSelect = true; ui.gbgSelected = [heldGallery.dataset.gbgHold]; ui.gbgPopup = ''; suppressReleaseClick(); render(); }, 550);
    const heldMail = event.target.closest('[data-gbem-item]');
    if (heldMail && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.gbEmTarget = heldMail.dataset.gbemItem; suppressReleaseClick(); gbEmDialog('context'); }, 550);
    const heldDay = event.target.closest('[data-gbcal-day]');
    if (heldDay && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.gbCalTarget = heldDay.dataset.gbcalDay; suppressReleaseClick(); gbCalDialog('day-context'); }, 550);
    const heldLink = event.target.closest('[data-gbbr-item]');
    if (heldLink && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.gbBrTarget = heldLink.dataset.id; suppressReleaseClick(); ui.overlay = 'gb-dialog-br'; ui.gbBrDialog = heldLink.dataset.gbbrItem; renderOverlay(); }, 550);
    const heldSong = event.target.closest('.stock-music [data-action="music-select"]');
    if (heldSong && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.musicSelected = Number(heldSong.dataset.id); suppressReleaseClick(); ui.overlay = 'gb-dialog-music'; ui.gbMusicDialog = 'track'; renderOverlay(); }, 550);
    const heldAlarm = event.target.closest('.gbdc-alarm-body');
    if (heldAlarm && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.dcContext = Number(heldAlarm.dataset.id); suppressReleaseClick(); ui.overlay = 'clock-context'; renderOverlay(); }, 550);
    const heldCt = event.target.closest('[data-gbct-hold]');
    if (heldCt && !ui.overlay) messageHoldTimer = setTimeout(() => { suppressReleaseClick(); GBContactsIO.hold(heldCt.dataset.gbctHold, gbctContext()); }, 550);
    const heldNet = event.target.closest('[data-gbnet-hold]');
    if (heldNet && !ui.overlay) messageHoldTimer = setTimeout(() => { suppressReleaseClick(); GBNetwork.hold(heldNet.dataset.gbnetHold, gbNetContext()); }, 550);
    const heldThread = event.target.closest('.gbmms-thread[data-action="thread"]');
    if (heldThread && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.thread = heldThread.dataset.id; suppressReleaseClick(); gbMmsDialog('thread'); }, 550);
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) pointerStart.calculatorSwipe = true;
    if (event.target.closest('.ics-calc-delete button,.gbcalc-del')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); suppressClickUntil = Date.now() + 350; render(); }, 600);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), 440);
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > 8) { clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); }
    if (pointerStart.calculatorSwipe && (pointerStart.calculatorSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.calculatorSwiping = true; suppressClickUntil = Date.now() + 350; event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const track = viewport.querySelector('.calc-panels');
      if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-screen.clientWidth, Math.min(0, -ui.calcPanel * screen.clientWidth + dx))}px)`; }
      return;
    }
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
    if(ui.view==='calendar' && !ui.sub && !ui.overlay && pointerStart.target.closest('[data-gbcal-swipe]') && Math.abs(dy)>dp(14) && Math.abs(dy)>Math.abs(dx)) {
      pointerStart.gbCalSwiping=true;clearTimeout(messageHoldTimer);suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      viewport.querySelector('[data-gbcal-swipe]').style.transform=`translateY(${dy}px)`;return;
    }
    if(ui.view==='calendar' && !ui.sub && !ui.overlay && !pointerStart.scrolling && pointerStart.target.closest('[data-calendar-swipe]') && Math.abs(dx)>dp(14) && Math.abs(dx)>Math.abs(dy)*1.2) {
      pointerStart.calendarSwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const surface=viewport.querySelector('[data-calendar-swipe]');surface.style.transform=`translateX(${dx}px)`;return;
    }
    if (ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && pointerStart.target.closest('[data-gallery-swipe]') && Math.abs(dx)>dp(12) && Math.abs(dx)>Math.abs(dy)) {
      pointerStart.gallerySwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const picture=viewport.querySelector('.gallery-image');if(picture)picture.style.transform=`translateX(${dx}px)`;return;
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
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (ui.view === 'play-store' && ui.market?.page === 'section' && !ui.overlay && pointerStart.target.closest('.gbmk-scroll,.gbmk-tabs') && Math.abs(dx) > dp(70) && Math.abs(dx) > Math.abs(dy) * 1.5) { const next = viewport.querySelector(`.gbmk-tabs button:${dx < 0 ? 'last' : 'first'}-child`); if (next && !next.disabled) { ui.market.tab = next.dataset.id; render(); } suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if(pointerStart.gbCalSwiping){if(Math.abs(dy)>dp(58))calendarMove(dy<0?1:-1);else viewport.querySelector('[data-gbcal-swipe]').style.transform='';suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    if(pointerStart.calendarSwiping){if(Math.abs(dx)>dp(52))calendarMove(dx<0?1:-1);else viewport.querySelector('[data-calendar-swipe]').style.transform='';suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.gallerySwiping) { if(Math.abs(dx)>dp(52))galleryStep(dx<0?1:-1);else render();suppressClickUntil=Date.now()+350;pointerStart=null;return; }
    if (pointerStart.calculatorSwiping) { setCalculatorPanel(Math.abs(dx) > dp(58) ? (dx < 0 ? 1 : 0) : ui.calcPanel); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
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
  window.addEventListener('pointercancel', () => { clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; snapResting(calcTrack); } clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  window.addEventListener('pointercancel',()=>{const surface=viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform='';});
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if(ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryStep(event.key==='ArrowLeft'?-1:1);return;}
    if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (ui.view === 'calculator' && !ui.overlay && ['ArrowUp','ArrowDown'].includes(event.key) && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) {
      event.preventDefault(); const history = data.calcHistory || []; if (!history.length) return;
      ui.calcHistoryIndex = event.key === 'ArrowUp' ? (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.max(0,ui.calcHistoryIndex - 1)) : (ui.calcHistoryIndex < 0 ? history.length - 1 : Math.min(history.length - 1,ui.calcHistoryIndex + 1));
      ui.calc = history[ui.calcHistoryIndex].expression; ui.calcFresh = false; render(); return;
    }
    if (ui.view === 'calculator' && !ui.overlay && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName) && (/^[0-9.+\-*/=()!^]$/.test(event.key) || ['Enter','Backspace','Delete'].includes(event.key))) {
      event.preventDefault(); const map = {'*':'×','/':'÷','-':'−','Enter':'=','Backspace':'⌫','Delete':'C'}; operateCalculator(map[event.key] || event.key); render(); return;
    }
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
    ui.power = 'boot'; renderPower();
    // The animation calls finish when it ends; a skipped cold boot calls it at once and stops the animation.
    let finished = false, stop = () => {};
    const finish = () => { if (finished) return; finished = true; stop(); ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); lastActivity = Date.now(); };
    stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
    return finish;
  }
  /* A new tab switches the phone on (audit step 7): the image's boot animation, then the lock screen, as after the power
     key. The system counts as booted once the page and its fonts have loaded (at most 12 s), at the end of a loop of the
     animation. A reload in the same tab or a reduced-motion preference starts at once as before; a touch or a key skips it. */
  function coldBoot() {
    try { if (sessionStorage.getItem('android-sim-booted-2.3.6') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; sessionStorage.setItem('android-sim-booted-2.3.6', '1'); } catch { return; }
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once: true}));
    const booted = Promise.race([Promise.all([loaded, document.fonts?.ready]), new Promise(resolve => setTimeout(resolve, 12000))]);
    const finish = bootUp(booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); suppressClickUntil = Date.now() + 350; finish(); };
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
    if(ui.activeCall){
      const screen=viewport.querySelector('.gbic'),state=GBPhone.callState(ui.activeCall);
      if(screen&&screen.dataset.state!==state)render();
      else if(screen&&state==='active'){const elapsed=screen.querySelector('.gbic-elapsed');if(elapsed)elapsed.textContent=GBPhone.elapsedText(ui.activeCall);}
    }
    checkAlarms(now);
    checkReminders(now);
    if(ui.view==='gallery' && ui.sub==='photo' && ui.gallerySlideshow && !ui.overlay && Date.now()-ui.gallerySlideAt>=3000){ui.gallerySlideAt=Date.now();galleryStep(1);}
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
