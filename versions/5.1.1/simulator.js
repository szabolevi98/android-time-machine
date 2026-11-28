/* Android 5.1.1 Lollipop browser simulation (Nexus 6, LMY48Y). No network or Android runtime required. */
(() => {
  'use strict';
  // The migrated screens' shared names (lp-core.js): what they add, and the core's bindings they use (lp:kernel below).
  const lp = LP.live;

  // Each user of lp-users.js keeps a phone of its own: the owner's key, or the key with "-<id>" (sessionStorage lp-user).
  const STORE = 'android-time-machine-lp-v1' + (() => { try { const u = sessionStorage.getItem('lp-user'); return u && u !== 'owner' ? `-${u}` : ''; } catch { return ''; } })();
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // The Google Now Launcher shows its long-press cling on the first run.
    clings: LauncherClings.fresh(),
    wallpaper: 0,
    /* Stock Nexus 6 (Google Now Launcher 1.1, the Large Phone profile's 5 x 5 grid): default_workspace_5x5 puts the
       Google folder, the Create folder and the Play folder on the bottom row with Play Store in the corner
       (dw_phone_google_folder, dw_create_folder, dw_phone_play_folder); the hotseat (dw_phone_hotseat) holds Phone,
       Messenger (the default SMS app), all apps, Chrome and Camera. The DeskClock digital clock across the top
       stays from the earlier versions (owner request: a clock on the home screen by default). */
    layoutRevision: 1,
    homePages: [Array.from({length: 25}, (_, slot) => ({20: 'folder-google', 21: 'folder-create', 23: 'folder-play', 24: 'play-store'})[slot] || null)],
    homeWidgets: [[{id: 'default-digital', type: 'digitalclock', x: 0, y: 0, width: 5, height: 2}]],
    folders: {
      'folder-google': {name: 'Google', nameKey: true, items: ['google-search', 'maps', 'gmail', 'google-plus', 'calendar', 'photos', 'youtube', 'news-weather', 'hangouts']},
      'folder-create': {name: 'Create', nameKey: true, items: ['docs', 'sheets', 'slides', 'drive', 'keep']},
      'folder-play': {name: 'Play', nameKey: true, items: ['play-music', 'play-movies', 'play-games', 'play-books', 'newsstand']}
    },
    keepNotes: StockApps.DEFAULT_NOTES.map(note => ({...note})),
    dock: ['phone', 'messaging', 'apps', 'chrome', 'camera'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false, locationAccess: true, pulse: true, doze: true, dialTones: true, screenLockSounds: true, touchSounds: true, haptic: true, vibrateRing: false, zenMode: 'all', zenEvents: true, zenCalls: false, zenMessages: false, patternVisible: true, autoBrightness: false },
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
    contactGroups: [{id:'friends',name:'Friends',members:[1,2,3]},{id:'family',name:'Family',members:[4]}],
    messages: [
      { id: 1, contact: 1, body: 'Hey! Are we still on for coffee tomorrow?', mine: false, time: '10:42' },
      { id: 2, contact: 1, body: 'Absolutely. See you at 11!', mine: true, time: '10:45' },
      { id: 3, contact: 4, body: 'Don’t forget to call this weekend ☺', mine: false, time: 'Yesterday' },
      // Hangouts chats (channel 'hangouts'); SMS stays in Messenger.
      { id: 4, contact: 2, body: 'The photos from the hike are up!', mine: false, time: 'Yesterday', channel: 'hangouts' },
      { id: 5, contact: 2, body: 'They look amazing 😀', mine: true, time: 'Yesterday', channel: 'hangouts' }
    ],
    // The Downloads root (DocumentsUI): what the demo phone downloaded, as 4.0.4 / 4.3 show it; a picture opens in
    // Photos, a PDF in the PDF chooser. A save made before 2026-11-23 whose Downloads is empty gets them once.
    downloads: [
      { name: 'beach-panorama.jpg', size: 1384448, time: Date.now() - 40 * 60000, photoId: 3 },
      { name: 'Nexus-6-guide.pdf', size: 3227648, time: Date.now() - 5 * 3600000, pdf: { name: 'Nexus-6-guide', title: 'Nexus 6 guide', lines: ['Welcome to Nexus 6.', 'Swipe left from the Home screen to see Google Now.', 'Say "OK Google" on the Home screen to search by voice.'], image: '' } },
      { name: 'Meetup-slides.pdf', size: 2480000, time: Date.now() - 3 * 86400000, pdf: { name: 'Meetup-slides', title: 'Meetup slides', lines: ['What’s new in Lollipop', '• Material design', '• Notifications on the lock screen', '• Battery saver'], image: '' } }
    ],
    demoDownloads: 1,
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
      { id: 1, title: 'Welcome to Android 5.1', detail: 'Your Nexus 6 is ready to explore.' },
      { id: 2, title: 'New message from Alex', detail: 'See you at 11!' }
    ]
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  // state.js reads the save: unreadable JSON is kept aside, a field of the wrong kind takes its default alone, and an
  // error in one of the upgrade steps below is reported by name while the others still run.
  function load() {
    return AndroidState.load(STORE, defaultData, saved => ({ ...clone(defaultData), ...saved, settings: { ...defaultData.settings, ...saved.settings } }), [
      ['demo downloads', (result, saved) => {
        if (saved.demoDownloads) return;
        if (!Array.isArray(saved.downloads) || !saved.downloads.length) result.downloads = clone(defaultData.downloads);
        result.demoDownloads = 1;
      }],
      ['clings of an older save', (result, saved) => {
        if (!saved.clings) result.clings = LauncherClings.dismissedAll();
      }],
      ['missing widget pages', (result, saved) => {
        if (!Array.isArray(saved.homeWidgets)) result.homeWidgets = clone(defaultData.homeWidgets);
      }],
      ['widget page for every page', (result, saved) => {
        while (result.homeWidgets.length < result.homePages.length) result.homeWidgets.push([]);
      }],
      ['no widget page without a page', (result, saved) => {
        result.homeWidgets.length = result.homePages.length;
      }],
      // Earlier photo frames were 2 × 2 and showed the first picture; keep their footprint.
      ['old photo frame size', (result, saved) => {
        result.homeWidgets.flat().forEach(widget => { if (widget?.type === 'photo' && !('source' in widget) && !widget.width) { widget.width = 2; widget.height = 2; } });
      }],
      // A reload during Gallery widget configuration leaves no completed choice.
      ['unfinished photo frame', (result, saved) => {
        result.homeWidgets = result.homeWidgets.map(page => Array.isArray(page) ? page.filter(widget => widget && !(widget.type === 'photo' && widget.source === null)) : []);
      }],
      ['custom wallpaper slot', (result, saved) => {
        if (result.wallpaper === 4 && result.customWallpaper) result.wallpaper = 11;
      }],
      // The AOSP Browser, Gallery and Music (and Gallery's photo widget) left the drawer: drop their shortcuts and widgets.
      ['apps no longer on the image', (result, saved) => {
        const gone = ['browser', 'gallery', 'music'], keep = id => !gone.includes(id);
        result.homePages = result.homePages.map(page => page.map(id => keep(id) ? id : null));
        result.dock = (result.dock || []).map(id => keep(id) ? id : null);
        Object.values(result.folders || {}).forEach(folder => { if (Array.isArray(folder.items)) folder.items = folder.items.filter(keep); });
        result.homeWidgets = result.homeWidgets.map(page => page.filter(widget => widget?.type !== 'photo'));
      }],
      // Live wallpapers were offered before the picker followed the LMY48Y image, which has none.
      ['live wallpapers of the image', (result, saved) => {
        delete result.liveWallpaper; delete result.lwPrefs;
      }]
    ]);
  }
  let data = load();
  AndroidState.onProblem(problem => setTimeout(() => toast(i18n.t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...JBDeveloperOptions.DEFAULTS,spellChecker:true,imeLatin:true,...data.settings};
  if(!data.sleepNever){data.sleepNever=true;if(data.settings.sleep===30)data.settings.sleep=-1;}
  ICSLockscreen.initialize(data);
  function pruneOfficeShortcuts(){
    const valid=new Set((data.driveFiles||window.StockApps?.FILES||[]).filter(f=>!f.trashed).map(f=>'office:'+f.id)),invalid=k=>typeof k==='string'&&k.startsWith('office:')&&!valid.has(k);
    for(const list of [...(data.homePages||[]),data.dock||[]])for(let i=0;i<list.length;i++)if(invalid(list[i]))list[i]=null;
    for(const [id,f] of Object.entries(data.folders||{})){if(!Array.isArray(f?.items))continue;for(let i=f.items.length-1;i>=0;i--)if(invalid(f.items[i]))ICSLauncherFolders.remove(data,{type:'folder',folderId:id,slot:i});}
  }
  function save() { pruneOfficeShortcuts();AndroidState.save(STORE, data); }
  const ui = {
    view: 'home', sub: '', page: 0, drawerTab: 'apps', drawerPage: 0, overlay: '', overview: false,
    selectedContact: 1, thread: 1, selectedPhoto: 1,
    dial: '', callNumber: '', aboutTaps: 0, buildTaps: 0, easterNyan: false, settingsRootScroll: 0,
    browserUrl: data.browserHistory.at(-1) || 'www.google.com', browserHistory: [...data.browserHistory], browserIndex: data.browserHistory.length - 1, browserTabs: [data.browserHistory.at(-1) || 'www.google.com'], browserTab: 0,
    calendarMode: ['Agenda','Day','Week','Month'].includes(data.calendarMode)?data.calendarMode:'Agenda', selectedDate: localDate(ICSSystemSettings.wallDate(data)),
    phoneTab: 'dialpad',
    play: ICSPlayStore.initial(), playHistory: [],
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Nexus 6 is ready. Explore Android 5.1 Lollipop, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  const tracks = ICSMusic.tracks;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  data.gmailbox=GmailApp.restore(data.gmailbox);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  // Chrome and the AOSP Browser keep separate tabs; ui.browserSession is the one of the browser in front.
  ui.browserOwner = 'browser'; ui.browserSessions = {};
  syncBrowserState();
  /* The Nexus 6 LMY48Y app drawer: every launcher activity of the factory image that is enabled after setup (no AOSP
     Browser, Gallery or Music: Chrome, Photos and Play Music stand in; Cloud Print's launcher alias is enabled by
     @bool/launcher_enabled, false from v19 on). Labels are the launcher labels. */
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'Contacts', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messenger', '✉', '#84cf62', '#428c43'], ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Play Store', '▶', '#b5d26d', '#53732f'], ['downloads', 'Downloads', '⬇', '#8bc34a', '#33691e'],
    ['hangouts', 'Hangouts', '❝', '#8bc34a', '#33691e'], ['chrome', 'Chrome', '◎', '#4285f4', '#db4437'], ['gmail', 'Gmail', '✉', '#ffffff', '#db4437'],
    ['photos', 'Photos', '✿', '#fbbc05', '#34a853'], ['play-books', 'Play Books', '▤', '#4285f4', '#1a73e8'], ['play-games', 'Play Games', '✚', '#8bc34a', '#558b2f'],
    ['play-movies', 'Play Movies & TV', '▶', '#e53935', '#b71c1c'], ['play-music', 'Play Music', '♫', '#ff9800', '#e65100'], ['google-settings', 'Google Settings', 'g', '#757575', '#424242'],
    ['google-plus', 'Google+', 'g+', '#dd4b39', '#b03a2e'], ['maps', 'Maps', '⌖', '#cfe6b8', '#4285f4'], ['keep', 'Keep', '✎', '#f7c600', '#d9a800'],
    ['drive', 'Drive', '△', '#0da960', '#4688f4'], ['youtube', 'YouTube', '▶', '#e62117', '#b31217'], ['earth', 'Earth', '◍', '#1f6fd1', '#0b2f73'],
    ['google-search', 'Google', 'g', '#4285f4', '#3367d6'], ['news-weather', 'News & Weather', '☼', '#4285f4', '#9e9e9e'], ['voice-search', 'Voice Search', '🎤', '#eeeeee', '#5f6368'],
    ['docs', 'Docs', '▤', '#4285f4', '#3367d6'], ['sheets', 'Sheets', '▦', '#0f9d58', '#0b8043'], ['slides', 'Slides', '▭', '#f4b400', '#f09300'],
    ['fit', 'Fit', '♥', '#db4437', '#c53929'], ['newsstand', 'Play Newsstand', '▥', '#3f51b5', '#303f9f'], ['wallet', 'Wallet', '▣', '#4285f4', '#3367d6']
  ];
  /* colorPrimaryDark of each app's Material theme, painted behind the status bar (Window.setStatusBarColor). */
  const LP_STATUS_COLORS = {
    settings: '#21272b', phone: '#0277bd', people: '#0277bd', messaging: '#026da7', chrome: '#757575', gmail: '#b93221', email: '#d06d0c',
    hangouts: '#0b8043', calendar: '#3367d6', 'play-store': '#558b2f', 'play-music': '#e65100', 'play-movies': '#d23f31', 'play-books': '#0277bd',
    'play-games': '#4e802b', keep: '#e59900', youtube: '#c31c13', drive: '#9e9e9e', photos: '#000', downloads: '#263238', calculator: '#00838f',
    clock: '#0277bd', camera: '#000', gallery: '#000', browser: '#000', music: '#000', maps: '#9e9e9e', 'google-search': '#3367d6', 'voice-search': '#3367d6',
    'google-plus': '#c53929', earth: '#000', 'news-weather': '#9e9e9e', 'google-settings': '#21272b'
  };
  // colorPrimary of the same themes: the Overview card headers (TaskViewHeader takes the task's primary color).
  const LP_PRIMARY = {
    settings: '#263238', phone: '#0288d1', people: '#0288d1', messaging: '#0288d1', chrome: '#f2f2f2', gmail: '#da4336', email: '#e7790d',
    hangouts: '#0f9d58', calendar: '#4285f4', 'play-store': '#689f38', 'play-music': '#ef6c00', 'play-movies': '#ed3b3b', 'play-books': '#039be5',
    'play-games': '#689f38', keep: '#ffcc3f', youtube: '#e62117', drive: '#e0e0e0', photos: '#f5f5f5', downloads: '#37474f', calculator: '#00bcd4',
    clock: '#0288d1', camera: '#212121', gallery: '#212121', browser: '#e6e6e6', music: '#212121', maps: '#f5f5f5', 'google-search': '#4285f4', 'voice-search': '#4285f4',
    'google-plus': '#db4437', earth: '#212121', 'news-weather': '#f5f5f5', 'google-settings': '#263238'
  };
  const GEL_ALIASES = {};
  // Folder and grid size of the Large Phone profile.
  const GRID = 5;
  const GEL_UNSIMULATED = [];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  /* Index 0 is the framework default_wallpaper; 1-10 are the Google Now Launcher's bundled wallpapers in the order of
     GoogleHome.apk's R.array.wallpapers (LMY48Y, drawable-nodpi, stored at half size); 11 is a picked photo. */
  const wallpaperFiles = ['', 'wp_paper_001', 'wp_arc_001', 'wp_arc_003', 'wp_arc_004', 'wp_geo_1243', 'wp_geo_1557', 'wp_geo_2102', 'wp_geo_2167', 'wp_geo_2170', 'wp_geo_2278'];
  const wallpaperUrl = index => index === 0 || !wallpaperFiles[index] ? 'assets/lp-default_wallpaper.jpg' : `assets/gh-${wallpaperFiles[index]}.jpg`;
  const homePageCount = () => data.homePages.length - (ui.extraScreen ? 1 : 0);
  /* Workspace.wallpaperOffsetForCurrentScroll: a still wallpaper spans at least MIN_PARALLAX_PAGE_SPAN (3) page
     gaps; the extra empty screen added while dragging does not count. */
  function wallpaperOffset(page) {
    const pages = homePageCount(), span = Math.max(3, pages - 1);
    return span > 0 ? Math.max(0, Math.min(pages - 1, page)) / span : 0;
  }
  function setWallpaperPan(page, animate = true) {
    if (data.wallpaper === 11) return;
    screen.style.transition = animate ? 'background-position .35s cubic-bezier(.215,.61,.355,1)' : 'none';
    screen.style.backgroundPosition = `${(wallpaperOffset(page) * 100).toFixed(3)}% center`;
  }
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3, resize: {minWidth: 2, minHeight: 2} },
    { type: 'digitalclock', name: 'Digital clock', app: 'clock', width: 3, height: 2, resize: {minWidth: 2, minHeight: 1} },
    // LMY48Y has no Gallery (so no Photo Gallery widget); the music widget is Play Music's.
    { type: 'music', name: 'Google Play Music', app: 'play-music', width: 4, height: 1 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const iconAssets = new Set(['phone', 'people', 'messaging', 'camera', 'settings', 'clock', 'calendar', 'calculator', 'email', 'play-store', 'downloads', 'hangouts', 'chrome', 'gmail', 'photos', 'play-books', 'play-games', 'play-movies', 'play-music', 'google-settings', 'google-plus', 'maps', 'earth', 'google-search', 'keep', 'drive', 'youtube', 'news-weather', 'voice-search', 'docs', 'sheets', 'slides', 'fit', 'newsstand', 'wallet']);
  const i18n = window.AndroidI18n;
  const appNames = Object.fromEntries(apps.map(app => [app[0], app[1]]));
  appNames.google = 'Google';
  /* The store apps that work (docs/plans/play-apps.md, store-apps/legacy-host.js): the store's installed ones join the
     launcher's apps (icon assets/<id>.png) while installed, open as StoreHost modules, and leave with their icons and
     data when uninstalled. */
  function storeAppsSync() {
    const want = (data.marketInstalled || []).map(id => StoreHost.runtime(id)).filter(Boolean);
    for (const id of want) if (!apps.some(a => a[0] === id)) { const m = StoreHost.module(id); apps.push([id, m.title, '', m.color || '#888', m.dark || '#444']); appNames[id] = m.title; iconAssets.add(id); LP_STATUS_COLORS[id] = m.dark; LP_PRIMARY[id] = m.color; }
    for (let i = apps.length - 1; i >= 0; i--) if (String(apps[i][0]).startsWith('store-') && !want.includes(apps[i][0])) { delete appNames[apps[i][0]]; apps.splice(i, 1); }
  }
  storeAppsSync();
  function storeContext() { return StoreHost.context(Object.create(lp, Object.getOwnPropertyDescriptors({data, ui, save, render, renderOverlay, toast, openApp, screen, notify: (title, text) => addNotification(title, text), menuClass: 'lp-popup-menu', lang: i18n.language, locale: i18n.locale(), safe, t: key => i18n.t(key)}))); }
  StoreHost.provide(storeContext);
  ICSLauncherFolders.initialize(data,apps.map(app=>app[0]).concat((data.driveFiles||StockApps.FILES).map(f=>'office:'+f.id)));
  const screen = document.querySelector('#screen');
  // dp → CSS px now: the display is 411.43 dp wide (the desktop frame's width, the whole width on a phone).
  const dp = n => n * screen.clientWidth / 411.43;
  LPRipple.attach(screen);
  // EdgeEffect takes the theme's colorEdgeEffect, which Theme.Material sets to colorPrimary.
  LPScroll.attach(screen, {color: () => LP_PRIMARY[ui.view] || '#666666'});
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const deviceDate = () => ICSSystemSettings.wallDate(data);
  const today = () => localDate(deviceDate());
  const clock = () => deviceDate().toLocaleTimeString(i18n.locale(), { hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24 });
  const fullDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'long', month: 'long', day: 'numeric' });
  const shadeDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'short', month: 'short', day: 'numeric' });
  const contact = id => data.contacts.find(item => item.id === Number(id));
  const officeShortcut=id=>String(id).startsWith('office:')?(data.driveFiles||StockApps.FILES).find(f=>f.id===String(id).slice(7)&&!f.trashed):null;
  const webShortcut = id => String(id).startsWith('web:') ? (data.webShortcuts || []).find(w => String(w.id) === String(id).slice(4)) || {title: ''} : null;
  const appIcon = id => {
    const office=officeShortcut(id);if(office)return `<span class="app-icon"><img src="assets/${{doc:'docs',sheet:'sheets',slides:'slides'}[office.kind]}.png" alt=""></span>`;
    if (webShortcut(id)) return '<span class="app-icon"><img src="assets/chr40-app_shortcut_icon.png" alt=""></span>';
    const person = contactShortcut(id);
    if (person) return `<span class="app-icon contact-shortcut-icon">${window.LPDialer ? LPDialer.letterTile(person, 'contact-shortcut-tile') : ''}</span>`;
    if (id === 'apps') return '<span class="app-icon"><img src="assets/gnl-ic_allapps.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(data,id);
    if(folder)return `<span class="app-icon launcher-folder-icon">${folder.items.slice(0,3).map(app=>`<span class="folder-preview-item">${appIcon(app)}</span>`).join('')}</span>`;
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  // The default folders keep their name as a string key until renamed, so they follow the language (google_folder_name…).
  const folderName=id=>{const folder=ICSLauncherFolders.folder(data,id);return folder?.name?(folder.nameKey?i18n.t(folder.name):folder.name):i18n.t('Unnamed folder');};
  /* Contacts' Place on Home screen: an INSTALL_SHORTCUT whose shortcut opens the contact (QuickContact), its photo or
     the image's contact picture as the icon, the name as the label. Launcher3's InstallShortcutReceiver adds it on the first free cell from the second screen on (startSearchPageIndex), a new screen when all are full; the toast names it (shortcut_installed). */
  const contactShortcut = id => String(id).startsWith('contact:') ? data.contacts.find(p => p.id === Number(String(id).slice(8))) || {name: ''} : null;
  const VCARD = key => { const row = window.StockStrings?.vcard?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
  function placeShortcut(key, label) {
    const free = page => (data.homePages[page] || []).findIndex((id, index) => !id && !(data.homeWidgets[page] || []).some(w => { const s = widgetSize(w); return index % 4 >= w.x && index % 4 < w.x + s.width && Math.floor(index / 4) >= w.y && Math.floor(index / 4) < w.y + s.height; }));
    const count = homePageCount ? homePageCount() : data.homePages.length;
    const order = Array.from({length: Math.max(0, count - 1)}, (_, i) => i + 1);
    let page = order.find(i => free(i) >= 0);
    if (page === undefined) { data.homePages.splice(count, 0, Array(16).fill(null)); data.homeWidgets.splice(count, 0, []); page = count; }
    data.homePages[page][free(page)] = key; save();
    toast(AndroidStrings.format(VCARD('Shortcut "%s" created.'), label));
  }
  const launcherIcon = id => officeShortcut(id)?`<button class="launcher-icon" data-action="open-office-shortcut" data-id="${safe(String(id).slice(7))}" aria-label="${safe(officeShortcut(id).name)}" data-no-translate>${appIcon(id)}<span>${safe(officeShortcut(id).name)}</span></button>`:webShortcut(id) ? `<button class="launcher-icon" data-action="open-web-shortcut" data-id="${safe(String(id).slice(4))}" aria-label="${safe(webShortcut(id).title)}" data-no-translate>${appIcon(id)}<span>${safe(webShortcut(id).title)}</span></button>` : contactShortcut(id) ? `<button class="launcher-icon contact-shortcut" data-action="open-contact" data-id="${safe(String(id).slice(8))}" aria-label="${safe(contactShortcut(id).name)}" data-no-translate>${appIcon(id)}<span>${safe(contactShortcut(id).name)}</span></button>` : ICSLauncherFolders.folder(data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  // Touch & hold delay: Settings' long_press_timeout_selector values (500 / 1000 / 1500 ms); the simulator's own
  // long-press timers stretch by the same amount.
  const HOLD = [500, 1000, 1500], HOLD_NAMES = ['Short', 'Medium', 'Long'];
  const holdDelay = ms => ms + (HOLD[data.settings.longPressTimeout || 0] - 500);
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;const pending=ui.kgPending;ui.kgPending=null;ui.kgBouncing=false;ui.kgUp=true;home(false);if(pending)afterKeyguardDismiss(pending);},
    // Android 4.3 security views (KeyguardPatternView/PINView/PasswordView) inside the SlidingChallengeLayout.
    // Lollipop security views: the kg_* instructions, the kg_wrong_* errors and the countdown.
    look:{wrong:kind=>({pattern:'Wrong Pattern',pin:'Wrong PIN',password:'Wrong Password'})[kind],clearMs:2000,message:({state,remaining})=>remaining?AndroidStrings.format(i18n.t('Try again in %d seconds.'), remaining):state.error&&Date.now()-state.errorAt<5000?i18n.t(state.error):i18n.t({pattern:'Draw your pattern',pin:'Enter PIN',password:'Enter Password'}[state.kind]||''),renderLock:api=>renderSecureKeyguard(api)}});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
  // BatteryMeterView (5.1): 9.5 x 14.5 dp; the button is 25 %-75 % wide and 12 % tall; frame #66FFFFFF, level white,
  // battery_saver_mode_color (#F4511E) at 15 % or less.
  const kkBattery = level => `<svg class="kk-battery" viewBox="0 0 9.5 14.5" aria-label="Battery ${level}%"><path d="M2.375 0h4.75v1.74h-4.75zM0 1.74h9.5V14.5H0z" fill="#fff" fill-opacity=".4"/><rect x="0" y="${(1.74 + 12.76 * (1 - level / 100)).toFixed(2)}" width="9.5" height="${(12.76 * level / 100).toFixed(2)}" fill="${level <= 15 ? '#f4511e' : '#fff'}"/></svg>`;
  const statusBarHeight = () => statusRoot.offsetHeight || 22.65;
  // Launcher3 and the keyguard draw under translucent system bars; apps get opaque ones.
  function updateBarMode() {
    screen.classList.toggle('kk-translucent', ['home', 'lock', 'drawer'].includes(ui.view) && !ui.sleeping);
    screen.classList.toggle('lp-on-keyguard', ui.view === 'lock' && !ui.sleeping);
    // RecentsTheme: transparent system bars over the wallpaper.
    screen.classList.toggle('lp-recents-open', ui.overlay === 'recent');
    // Window.setStatusBarColor: the app's colorPrimaryDark (LP_STATUS_COLORS), black where the theme sets none.
    screen.style.setProperty('--lp-sb', ui.view === 'youtube' && ['search', 'results'].includes(ui.sub) ? '#d9d9d9' : ui.sub === 'chrome-settings' && ['chrome', 'browser'].includes(ui.view) ? '#161e21' : ui.view === 'wallet' ? LPExtraApps.walletStatus(ui) : ui.view === 'play-store' && window.JBPlay?.statusColor ? JBPlay.statusColor(lp.jbPlayContext()) : LP_STATUS_COLORS[ui.view] || LPExtraApps.COLORS[ui.view]?.[1] || '#000');
    // QuickContactActivity tints the status bar with the darker shade of the contact's colour.
    if (ui.view === 'people' && ui.sub === 'detail') { const person = contact(ui.selectedContact); if (person) screen.style.setProperty('--lp-sb', LPDialer.tileColorDark(person.name)); }
    // Google+'s VideoViewActivity: VideoViewTheme's colorPrimaryDark (Theme.EmeraldSea, quantum_googred700).
    if (ui.view === 'photos' && ui.sub === 'video') screen.style.setProperty('--lp-sb', '#c53929');
    // DeskClock's translucent status bar (#26000000) over the hour colour.
    if (ui.view === 'clock') screen.style.setProperty('--lp-sb', `color-mix(in srgb, ${JBDeskClock.SPECTRUM[deviceDate().getHours()]}, #000 15%)`);
    // Messenger colours a conversation's bars with the participant's tile colour.
    if (ui.view === 'messaging' && ui.sub === 'thread') screen.style.setProperty('--lp-sb', LPDialer.tileColorDark(ICSMessaging.identity(ui.thread, data.contacts).name));
    // PlatLogoActivity is fullscreen; the Dessert Case hides both bars (immersive sticky).
    const egg = ui.view === 'settings' && ui.sub === 'easter';
    if (ui.view === 'settings' && ui.sub === 'lland') screen.style.setProperty('--lp-sb', '#757575');
    // Theme.WallpaperPicker is fullscreen as well.
    screen.classList.toggle('kk-hide-status', egg || ui.view === 'wallpaper-picker');
    screen.classList.toggle('kk-immersive', false);
    if (!egg) screen.classList.remove('kk-bars-peek');
  }
  /* PhoneStatusBarPolicy icons (Bluetooth, the 5.0 interruptions/vibrate icon, alarm), then SignalClusterView (Wi-Fi,
     the mobile signal with its data type in the corner, or the airplane), BatteryMeterView and the clock. */
  const sysui = name => `assets/lp-sysui-${name}.svg`;
  const statusIndicators = () => {
    const wifi = data.settings.wifi && data.settings.wifiNetwork, zen = data.settings.zenMode && data.settings.zenMode !== 'all';
    const mobile = data.settings.airplane ? `<img src="${sysui('stat_sys_airplane_mode')}" alt="">` : (!wifi && data.settings.dataEnabled !== false ? `<span class="lp-mobile lp-mobile-wide"><img src="${sysui('stat_sys_signal_4_fully')}" alt=""><img class="lp-mobile-type" src="${sysui('stat_sys_data_fully_connected_lte')}" alt=""></span>` : `<span class="lp-mobile"><img src="${sysui('stat_sys_signal_4_fully')}" alt=""></span>`);
    return `<span class="status-right">${data.settings.bluetooth ? `<img class="status-bluetooth" src="${sysui('stat_sys_data_bluetooth')}" alt="">` : ''}${zen ? `<img src="${sysui(data.settings.zenMode === 'none' ? 'stat_sys_zen_none' : 'stat_sys_zen_important')}" alt="">` : ''}${data.settings.silent && data.settings.silentMode === 'vibrate' ? `<img src="${sysui('stat_sys_ringer_vibrate')}" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? `<img src="${sysui('stat_sys_alarm')}" alt="">` : ''}<span class="status-cluster${wifi && data.settings.airplane ? ' lp-wifi-airplane' : ''}">${wifi ? `<img class="status-wifi" src="${sysui('stat_sys_wifi_signal_4_fully')}" alt="">` : ''}${mobile}</span>${kkBattery(71)}<span class="status-clock">${clock()}</span></span>`;
  };

  function renderStatus() {
    updateBarMode();
    const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_hangouts.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    // navigation_bar.xml: the side padding and the keys (values-sw400dp: 50 dp, 80 dp) spread by weighted spacers; Back turns down for the IME.
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/lp-ic_sysbar_back${ui.imeShown ? '_ime' : ''}.png" alt=""></button><span class="nav-spacer"></span><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/lp-ic_sysbar_home.png" alt=""></button><span class="nav-spacer"></span><button class="nav-key nav-recent" data-action="recent" aria-label="Overview"><img src="assets/lp-ic_sysbar_recent.png" alt=""></button>`;
    // Over the keyguard the navigation bar is empty (StatusBarManager.DISABLE_HOME | _RECENT | _BACK); the bouncer brings Back.
    if(ui.view==='lock'&&!ui.sleeping)navRoot.querySelectorAll(ui.kgBouncing?'.nav-home,.nav-recent':'.nav-key').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');button.classList.add('nav-hidden');});
  }
  // Window transitions: the outgoing view is kept in a temporary layer while both animate.
  let lastScene = null, pendingNav = '', activeTransition = null, launchFrom = null;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const animationScale = name => { const value = Number(data.settings[name === 'unlock' ? 'windowScale' : 'transitionScale']); return name.startsWith('drawer-') ? 1 : Number.isFinite(value) ? value : 1; };
  function endTransition() {
    if (!activeTransition) return;
    clearTimeout(activeTransition.timer);
    activeTransition.layers.forEach(layer => layer.remove());
    activeTransition.animations.forEach(animation => animation.cancel());
    screen.classList.remove('transitioning');
    activeTransition = null;
  }
  function startTransition(name, outgoing, incoming, override = null) {
    endTransition();
    const spec = override || ICSTransitions.specs[name], factor = animationScale(name);
    if (!spec || !factor || reducedMotion?.matches || document.hidden) return;
    const box = {top: viewport.offsetTop, left: viewport.offsetLeft, width: viewport.offsetWidth, height: viewport.offsetHeight};
    const layer = (className, child) => { const node = document.createElement('div'); node.className = `transition-layer ${className}`; node.setAttribute('aria-hidden', 'true'); node.inert = true; Object.assign(node.style, {top: `${box.top}px`, left: `${box.left}px`, width: `${box.width}px`, height: `${box.height}px`}); if (child) node.append(child); screen.insertBefore(node, overlayRoot); return node; };
    const layers = [];
    if (spec.black) layers.push(layer('transition-backdrop'));
    if (outgoing) layers.push(layer(spec.exit.top ? 'transition-over' : 'transition-under', outgoing));
    screen.classList.add('transitioning');
    const animations = [...ICSTransitions.play(outgoing, spec.exit, factor), ...ICSTransitions.play(incoming, spec.enter, factor), ...(spec.custom ? spec.custom(outgoing, incoming, factor) : [])];
    activeTransition = {name, spec, factor, start: performance.now(), layers, animations, timer: setTimeout(endTransition, ICSTransitions.length(spec) * factor + 40)};
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
    LP.module('google-search').beforeRender();
    if(ui.kpSyncReturn&&(ui.view!=='settings'||ui.sub!=='sync-google'))ui.kpSyncReturn=false;
    updateBarMode();
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${ui.view === 'wallpaper-picker' ? ' lp-wallpaper-picker' : ''}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('${wallpaperUrl(data.wallpaper)}') ${(wallpaperOffset(['home', 'drawer'].includes(ui.view) ? ui.page : 0, false) * 100).toFixed(3)}% center / auto 100% no-repeat`;
    screen.style.transition = 'none';
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav();
    document.querySelector('.notification-led')?.classList.toggle('on', !!ui.sleeping && !ui.power && data.settings.pulse !== false && data.notifications.length > 0);
    JBDeveloperOptions.apply(screen, data.settings);
    if (ui.view !== 'lock' && ui.kgPad) { ui.kgPad.destroy(); ui.kgPad = null; }
    if (ui.view !== 'lock' && ui.kgChallenge) { ui.kgChallenge.destroy(); ui.kgChallenge = null; }
    if (ui.view === 'lock') { viewport.innerHTML = renderLock(); attachKeyguard(); }
    else if (ui.view === 'home') { viewport.innerHTML = renderHome(); restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    snapResting(viewport);
    renderOverlay();
    i18n.translateDOM(screen);
    if (StoreHost.has(ui.view)) StoreHost.mount(ui.view, storeContext(), viewport);
    const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
    lastScene = scene;
    // Launcher icons, folders and the drawer start apps with a scale-up from the tapped icon.
    const launch = launchFrom && (transit === 'wallpaper-close' || launchFrom.recents) ? ICSTransitions.scaleUp(launchFrom, viewport.offsetWidth, viewport.offsetHeight) : null;
    const transitName = transit || (launch ? 'task-open' : '');
    launchFrom = null;
    if (transitName) startTransition(transitName, launch ? null : outgoing, viewport.firstElementChild, launch);
    else if (activeTransition) {
      // A same-screen re-render during a transition continues the incoming animation.
      const elapsed = performance.now() - activeTransition.start;
      ICSTransitions.play(viewport.firstElementChild, activeTransition.spec.enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
    }
    LP.module('google-search').afterRenderNews();
    LP.module('docs').afterRenderFit();
    LP.module('camera').afterRender();
    // PlatLogoActivity; after five taps a long press records Settings.System.EGG_MODE and starts LLand.
    if (ui.lpEgg && !viewport.querySelector('[data-lp-platlogo]')?.isSameNode(ui.lpEgg.root)) { ui.lpEgg.destroy(); ui.lpEgg = null; }
    const eggRoot = viewport.querySelector('[data-lp-platlogo]');
    if (eggRoot && !ui.lpEgg) ui.lpEgg = LPEgg.platLogo(eggRoot, {reduced: !!reducedMotion?.matches, onLand: () => { data.settings.eggMode = data.settings.eggMode || Date.now(); save(); suppressReleaseClick(); ui.sub = 'lland'; render(); }});
    if (ui.lland && !viewport.querySelector('[data-lp-lland]')?.isSameNode(ui.lland.root)) { ui.lland.stop(); ui.lland = null; }
    const landRoot = viewport.querySelector('[data-lp-lland]');
    if (landRoot && !ui.lland) requestAnimationFrame(() => { if (landRoot.isConnected && !ui.lland) { ui.lland = LPEgg.land(landRoot, {vibrate: ms => navigator.vibrate?.(ms)}); landRoot.focus({preventScroll: true}); } });
    LP.module('clock').afterRender();
    LP.module('chrome').afterRender();
    LP.module('photos').afterRender();
    LP.module('messaging').afterRender();
    LP.module('calendar').afterRender();
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  const mixVelocity = (old, value, k) => old === undefined ? value : old + (value - old) * k;
  /* SearchPanelView: an upward swipe of navbar_search_up_threshhold (40dp) from the navigation bar shows the ring;
     releasing on the assist target starts search (the Google Search app on Google builds, Browser here). */
  // PointerLocationView: the bar at the top follows the primary pointer while the option is on.
  let pointerDownCount = 0;
  screen.addEventListener('pointerdown', event => { pointerDownCount++; if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, true, 1); }, true);
  screen.addEventListener('pointermove', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, event.buttons > 0, 1); }, true);
  window.addEventListener('pointerup', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, false, 1); }, true);
  let searchSwipe = null;
  navRoot.addEventListener('pointerdown', event => { if (ui.locked || ui.view === 'lock' || event.button > 0) return; searchSwipe = {id: event.pointerId, x: event.clientX, y: event.clientY, panel: null}; }, true);
  window.addEventListener('pointermove', event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const box = overlayRoot.getBoundingClientRect(), k = box.width / overlayRoot.offsetWidth || 1;
    if (!searchSwipe.panel) {
      if ((searchSwipe.y - event.clientY) / k < JBSearchPanel.S.up) return;
      const home = navRoot.querySelector('.nav-home').getBoundingClientRect();
      ui.overlay = 'search'; overlayRoot.innerHTML = ''; renderOverlay();
      searchSwipe.panel = JBSearchPanel.attach(overlayRoot.querySelector('[data-jb-search]'), {homeX: (home.left + home.width / 2 - box.left) / k, haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches,
        onLaunch: () => { ui.overlay = ''; renderOverlay(); openApp('google-search'); },
        onClose: () => { if (ui.overlay === 'search') { ui.overlay = ''; renderOverlay(); } }});
      suppressClickUntil = Infinity;
    }
    const panel = overlayRoot.querySelector('[data-jb-search]').getBoundingClientRect();
    searchSwipe.panel.move((event.clientX - panel.left) / k, (event.clientY - panel.top) / k);
  }, true);
  const endSearchSwipe = event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const panel = searchSwipe.panel; searchSwipe = null;
    if (!panel) return;
    suppressClickUntil = Date.now() + 350;
    event.type === 'pointercancel' ? panel.cancel() : panel.release();
  };
  window.addEventListener('pointerup', endSearchSwipe, true); window.addEventListener('pointercancel', endSearchSwipe, true);
  function lockScreen(){captureRecentView();lockControls.lock();ui.kgUp=true;ui.kgBouncing=false;ui.kgPending=null;ui.kgRelock=false;ui.locked=ICSLockscreen.secure(data);ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
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
  function renderLock() {
    if(ui.locked)return lockControls.renderLock();
    return LPKeyguard.render(lpKeyguardParts(false));
  }
  function renderSecureKeyguard(api) {
    const parts = lpKeyguardParts(true);
    return LPKeyguard.render({...parts, bouncer: ui.kgBouncing ? LPKeyguard.bouncer(api, parts) : ''});
  }
  // What the Lollipop lock screen shows: clock, date and alarm, owner info, the notification cards and the hint.
  function lpKeyguardParts(secure) {
    const now = deviceDate(), hour24 = !!data.settings.hour24;
    return {t: key => i18n.t(key), locale: i18n.locale(), secure, height: screen.clientHeight || 662.67,
      clock: now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''),
      date: now.toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'}), shortDate: shadeDate(), alarm: nextAlarmLabel(),
      owner: data.settings.showOwner ? data.settings.ownerInfo : '', carrier: lp.carrierName(), statusIcons: statusIndicators(),
      notifications: data.notifications.map(decorateNotification), activated: ui.kgActivated || '', hint: ui.kgHint || ''};
  }
  function kgHint(text) {
    ui.kgHint = i18n.t(text); clearTimeout(ui.kgHintTimer);
    const line = viewport.querySelector('.lp-kg-indication'); if (line) { line.textContent = ui.kgHint; line.classList.add('visible'); }
    LPKeyguard.bounce(viewport.querySelector('[data-lp-kg]'), !!reducedMotion?.matches);
    ui.kgHintTimer = setTimeout(() => { ui.kgHint = ''; ui.kgActivated = ''; viewport.querySelector('.lp-kg-indication')?.classList.remove('visible'); viewport.querySelectorAll('.lp-kg-note.activated').forEach(node => node.classList.remove('activated')); }, 3500);
  }
  function keyguardParts() {
    // TransportControlView covers the clock rows while the Music service is active.
    const track = tracks[ui.music.track], transport = musicActive() ? `<div class="lock-transport" data-no-translate><div class="lock-transport-art"></div><div class="lock-transport-bar"><p><span>${safe(track.title)}</span> - ${safe(track.artist)} - ${safe(track.album)}</p><div><button data-action="lock-media" data-id="previous" aria-label="${safe(i18n.t('Previous track'))}"><img src="assets/music-ic_media_previous.png" alt=""></button><button data-action="lock-media" data-id="play" aria-label="${safe(i18n.t(ui.music.playing ? 'Pause' : 'Play'))}"><img src="assets/music-ic_media_${ui.music.playing ? 'pause' : 'play'}.png" alt=""></button><button data-action="lock-media" data-id="next" aria-label="${safe(i18n.t('Next track'))}"><img src="assets/music-ic_media_next.png" alt=""></button></div></div></div>` : '';
    const kgPages = JBKeyguard.pages(data.keyguardWidgets || [], {music: musicActive()});
    if (!Number.isInteger(ui.kgPage) || ui.kgPage >= kgPages.length || kgPages[ui.kgPage]?.type === 'camera') ui.kgPage = JBKeyguard.defaultPage(kgPages);
    const now = deviceDate(), hour24 = !!data.settings.hour24;
    return {list: kgPages, parts: {
      t: key => i18n.t(key), carrier: data.settings.airplane ? i18n.t('No service.') : data.settings.networkOperator || 'Telekom', owner: data.settings.showOwner ? data.settings.ownerInfo : '', alarm: nextAlarmLabel(),
      clock: now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''),
      ampm: hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM', date: now.toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).toLocaleUpperCase(i18n.locale()),
      transport: transport.replace('class="lock-transport"', 'class="lock-transport jbk-transport-view"'), widget: keyguardWidget
    }};
    return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${lp.carrierName()}</div></div>`;
  }
  // Keyguard-capable widgets: the Calendar list and the 4.2 DeskClock digital clock.
  function keyguardWidget(widget) {
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, key => i18n.t(key), i18n.locale(), deviceDate(), !!data.settings.hour24);
    return digitalClockWidget('div');
  }
  function requestBouncer(pending) {
    ui.kgPending = pending; ui.kgBouncing = true; ui.kgHint = ''; render();
  }
  // OnDismissAction: what the widget asked for once the security check passes.
  function afterKeyguardDismiss(pending) {
    if (pending.type === 'add') { ui.kgRelock = true; ui.overlay = 'kg-widget-picker'; renderOverlay(); return; }
    if (pending.type === 'camera' || pending.type === 'phone') { openApp(pending.type); return; }
    if (pending.type === 'note') { const button = document.createElement('button'); button.dataset.action = 'notification-open'; button.dataset.id = pending.id; screen.append(button); button.click(); button.remove(); return; }
    const event = pending.id && data.events.find(item => String(item.id) === pending.id);
    if (!event) { ui.selectedDate = today(); openApp('calendar'); return; }
    const date = pending.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render();
  }
  function attachKeyguard() {
    ui.kgPad?.destroy(); ui.kgPad = null; ui.kgChallenge?.destroy(); ui.kgChallenge = null;
    const root = viewport.querySelector('[data-lp-kg]');
    if (!root) return;
    ui.kgPad = LPKeyguard.attach(root, {
      suppressClick: () => { suppressClickUntil = Date.now() + 350; },
      onTap: kind => kgHint(kind === 'camera' ? 'Swipe left for camera' : kind === 'phone' ? 'Swipe right for phone' : 'Swipe up to unlock'),
      onUnlock: () => { if (ui.locked) requestBouncer(null); else { suppressClickUntil = Date.now() + 350; home(); } },
      onAffordance: kind => { if (ui.locked) requestBouncer({type: kind}); else { ui.kgHint = ''; openApp(kind); } }
    });
  }
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type, preview = false) {
    if (type === 'analog') return preview ? '<img class="widget-preview-image" src="assets/dc5-appwidget_analog_clock_preview.png" alt="">' : analogClock();
    if (type === 'digitalclock') return '<img class="widget-preview-image" src="assets/dc5-appwidget_digital_clock_preview.png" alt="">';
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return '<img class="widget-preview-image" src="assets/gc5-calendar_widget_preview.png" alt="">';
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    // Launcher3 shows the provider's previewImage (Music2's) in the widget tray.
    if (type === 'music') return '<img class="widget-preview-image" src="assets/pm-music_widget_preview.png" alt="">';
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'calendar') return ICSWidgets.calendarLP(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
    if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
    if (widget.type === 'digitalclock') return digitalClockWidget();
    return null;
  }
  /* DeskClock 5.1 digital_appwidget / digital_widget_time: the whole time in widget_big_thin (sans-serif-thin 75sp,
     "h:mm" or "kk:mm", bottom_text_spacing_digital -8dp), then the 14sp date (EEEMMMMd, "Sat, October 3") and the next
     alarm in #B3FFFFFF with ic_alarm_small, 8dp after the date. */
  function digitalClockWidget(tag = 'button') {
    const now = deviceDate(), alarm = nextAlarmLabel(), hour24 = !!data.settings.hour24;
    const time = `${hour24 ? String(now.getHours()).padStart(2, '0') : now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
    const attrs = tag === 'button' ? ' data-action="open-app" data-app="clock"' : '';
    return `<${tag} class="jbw-digital lpw-digital"${attrs} aria-label="${safe(clock())}"><span class="jbw-digital-time" aria-hidden="true">${safe(time)}</span><span class="jbw-digital-date"><span>${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'long', day: 'numeric'}))}</span>${alarm ? `<span class="jbw-digital-alarm"><img src="assets/dc5-ic_alarm_small.png" alt="">${safe(alarm)}</span>` : ''}</span></${tag}>`;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    const frame = ui.resizeWidget === widget.id && spec.resize ? `<div class="jb-resize-frame" data-resize-frame>${['left', 'top', 'right', 'bottom'].map(edge => `<button class="jb-resize-handle jb-resize-${edge}" data-resize-edge="${edge}" aria-label="${safe(i18n.t('Resize'))}"><img src="assets/jb-widget_resize_handle_${edge}.png" alt=""></button>`).join('')}</div>` : '';
    return `<div class="home-widget widget-${widget.type}${frame ? ' resizing' : ''}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}${frame}</div>`;
  };
  const pageMarker = (active, add = false) => `<img class="kk-pi-off" src="assets/gnl-ic_pageindicator_${add ? 'add' : 'default'}.png" alt=""><img class="kk-pi-on" src="assets/gnl-ic_pageindicator_current.png" alt="">`;
  const homeGrid = (page, index) => `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" ${index !== ui.page && !ui.overview ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % GRID + 1};grid-row:${Math.floor(slot / GRID) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${(data.homeWidgets[index] || []).map(homeWidget).join('')}</div>`;
  function renderHome() {
    const pages = data.homePages.length;
    const nowPane = `<div class="gel-now-layer" ${ui.page === -1 ? '' : 'inert aria-hidden="true"'}>${GELNow.render({data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), ui})}</div>`;
    return `<div class="home-view kk-home gel-home lp-home${ui.overview ? ' kk-overview' : ''}${ui.page === -1 ? ' gel-now-open' : ''}" style="--gnow:${ui.page === -1 ? 1 : 0}">${nowPane}<div class="home-search"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="lp-qsb-logo" src="assets/gnl-ic_searchbox_google.png" alt="Google"></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice Search'))}"><img class="lp-qsb-mic" src="assets/gnl-ic_mic_none.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map(homeGrid).join('')}</div></div><div class="page-indicators"><button class="gel-now-marker ${ui.page === -1 ? 'active' : ''}" data-action="page" data-id="-1" aria-label="Google Now">${pageMarker(ui.page === -1)}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}">${pageMarker(i === ui.page, ui.extraScreen && i === pages - 1)}</button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/gnl-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/gnl-ic_launcher_clear_active_holo.png" alt=""><span>${safe(i18n.t('Remove'))}</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/gnl-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/gnl-ic_launcher_info_active_holo.png" alt=""><span>${safe(i18n.t('App info'))}</span></div></div><div class="kk-overview-panel" ${ui.overview ? '' : 'inert'}><button data-action="open-wallpapers" style="--pressed:url('assets/gnl-ic_wallpaper_pressed.png')"><img src="assets/gnl-ic_wallpaper.png" alt="">${safe(i18n.t('Wallpapers'))}</button><button data-action="kk-overview-widgets" style="--pressed:url('assets/gnl-ic_widget_pressed.png')"><img src="assets/gnl-ic_widget.png" alt="">${safe(i18n.t('Widgets'))}</button><button data-action="gel-overview-settings" style="--pressed:url('assets/gnl-ic_setting_pressed.png')"><img src="assets/gnl-ic_setting.png" alt="">${safe(i18n.t('Settings'))}</button></div></div>`;
  }
  // All apps: 5 x 6 apps per quantum_panel page, then the widget pages of 2 x 3 previews.
  const DRAWER_APPS = 30, DRAWER_WIDGETS = 6;
  const drawerAppPages = () => Math.ceil(apps.length / DRAWER_APPS);
  const drawerPageCount = () => drawerAppPages() + Math.ceil(widgetTypes.length / DRAWER_WIDGETS);
  const drawerRange = () => ui.drawerWidgets ? [drawerAppPages(), drawerPageCount() - 1] : [0, drawerAppPages() - 1];
  function renderDrawer() {
    const appPages = drawerAppPages(), pages = drawerPageCount();
    const [first, last] = drawerRange();
    const current = Math.max(first, Math.min(ui.drawerPage, last));
    const isApps = current < appPages;
    ui.drawerTab = isApps ? 'apps' : 'widgets';
    const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    const widgetPage = current - appPages;
    const items = isApps ? sortedApps.slice(current * DRAWER_APPS, current * DRAWER_APPS + DRAWER_APPS).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(widgetPage * DRAWER_WIDGETS, widgetPage * DRAWER_WIDGETS + DRAWER_WIDGETS).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(i18n.t(widget.name))}"><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type, true)}</span><span class="drawer-widget-title"><span>${safe(i18n.t(widget.name))}</span><small>${widget.width} × ${widget.height}</small></span></button>`).join('');
    return `<div class="drawer-view kk-drawer lp-drawer${isApps ? '' : ' drawer-widgets-open'}${ui.drawerReveal ? ' lp-revealing' : ''}"${ui.drawerReveal ? ` style="--dx:${ui.drawerReveal.dx}px;--dy:${ui.drawerReveal.dy}px"` : ''}><div class="lp-drawer-panel"></div><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>i < first || i > last ? '' : `<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}">${pageMarker(i === current)}</button>`).join('')}</div></div>`;
  }

  function widgetFits(page, x, y, type, ignoredId = '') {
    const {width, height} = widgetSize(type);
    if (x < 0 || y < 0 || x + width > GRID || y + height > GRID) return false;
    for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) {
      if (data.homePages[page][row * GRID + column]) return false;
    }
    return !data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + widgetSize(widget).width && x + width > widget.x && y < widget.y + widgetSize(widget).height && y + height > widget.y);
  }
  function addWidget(type, x = null, y = null) {
    const spots = x === null ? Array.from({length: GRID * GRID}, (_, i) => [i % GRID, Math.floor(i / GRID)]) : [[x,y]];
    const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row, type));
    if (!spot) return false;
    const widget = {id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]};
    // Gallery2 declares a configure activity; the widget stays empty until it finishes.
    if (type === 'photo') { widget.source = null; ui.photoWidgetSetup = {page: ui.page, id: widget.id}; ui.overlay = 'widget-photo-type'; }
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
  function configurePhotoWidget(options) {
    const widget = pendingPhotoWidget();
    if (widget) Object.assign(widget, options);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render(); toast('Widget added');
  }
  // Leaving WidgetConfigure without a choice removes the pending widget, as on Android.
  function cancelPhotoWidget() {
    const setup = ui.photoWidgetSetup;
    if (setup) data.homeWidgets[setup.page] = data.homeWidgets[setup.page].filter(widget => widget.id !== setup.id);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render();
  }
  function renderApp() {
    if (StoreHost.module(ui.view)?.render) return StoreHost.render(ui.view, storeContext());
    switch (ui.view) {
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    LP.module('docs').opening(app, resume);
    LP.module('google-search').openingApps(app, resume);
    // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
    if (!resume) { ui.camIntent = null; ui.mapsPrefs = null; ui.mpsDialog = null; ui.yt10Dialog = null; ui.lsPage = ''; ui.lsStack = []; ui.lsDialog = null; ui.driveFolder = ''; ui.driveFilter = ''; ui.driveNavItem = 'my'; ui.driveStack = []; ui.driveDialog = ''; ui.hgPage = ''; ui.hgStack = []; ui.hgDialog = ''; ui.lpmPage = ''; ui.mpoDialog = ''; ui.paStack = []; ui.paMore = ''; }
    if(ui.locked)return;
    if (app === 'news-weather' && !resume) { ui.newsWeb = ''; ui.newsDialog = ''; ui.newsExpanded = ''; ui.newsSearch = false; ui.newsQuery = ''; ui.newsAdd = ''; ui.newsRemove = false; }
    if (GEL_ALIASES[app]) app = GEL_ALIASES[app];
    if (!appNames[app]) return;
    LP.module('chrome').opening(app);
    LP.module('email').opening(app);
    LP.module('google-search').openingVoice(app);
    if (app === 'keep' && !Array.isArray(data.keepNotes)) data.keepNotes = clone(defaultData.keepNotes);
    captureRecentView();
    // Wallet's warm welcome: the intro splash, then the pager (WarmWelcomeActivity.startIntroAnimation).
    LP.module('docs').openingWallet(app, resume);
    LP.module('camera').opening(app, resume);
    LP.module('play-store').opening(app, resume);
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(app === 'play-store' ? '.jbp-scroll' : ['messaging', 'hangouts'].includes(app) ? '.mms-scroll' : ['email', 'gmail'].includes(app) ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : app === 'chrome' ? '.chr-ntp-scroll,.chr-history,.chr-stack,.browser-page' : app === 'photos' ? '.ph-scroll' : StockApps.APPS.includes(app) ? '.sa-scroll,.gnow-scroll' : lp.PLAY_APPS.includes(app) ? '.pa-scroll,.pm-queue' : '.app-view') || viewport.firstElementChild;
  }
  function captureRecentView() {
    if (appNames[ui.view] && viewport.firstElementChild) {
      ui.recentSnapshots[ui.view] = viewport.innerHTML;
      ui.recentState ||= {};
      ui.recentState[ui.view] = {sub: ui.sub, scrollTop: appScrollContainer(ui.view).scrollTop};
    }
  }
  function home(resetPage = true) { if(ui.locked)return;if(ui.photoWidgetSetup){const setup=ui.photoWidgetSetup;data.homeWidgets[setup.page]=data.homeWidgets[setup.page].filter(widget=>widget.id!==setup.id);ui.photoWidgetSetup=null;save();}if(ui.sub==='lock-setup')lockControls.lock();captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; ui.overview = false; if (resetPage) ui.page = 0; render(); }
  function back() { pendingNav = 'back'; try { navigateBack(); } finally { pendingNav = ''; } }

  const chromeText = key => AndroidStrings.pick(window.StockStrings?.chrome?.[key], i18n.locale(), key);
  function navigateBack() {
    if ((ui.overlay === 'store-host' || !ui.overlay && ui.view.startsWith('store-')) && StoreHost.back(storeContext())) return;
    if (LP.module('settings').backPrint()) return;
    if (LP.module('settings').backLang()) return;
    if (ui.view === 'google-search' && ui.voiceFromSettings && ui.sub === 'settings' && !ui.overlay && !(ui.lsStack || []).length) { ui.voiceFromSettings = false; openApp('settings'); ui.sub = 'language'; render(); return; }
    if (LP.module('settings').backDev()) return;
    // Back in a capture request cancels it (RESULT_CANCELED).
    if (LP.module('camera').backIntent()) return;
    if (LP.module('people').backIo()) return;
    if (LP.module('google-search').backEarth()) return;
    if (LP.module('docs').backNews()) return;
    if (LP.module('google-search').backMaps()) return;
    if (LP.module('phone').backPrefs()) return;
    if (LP.module('clock').back()) return;
    if (LP.module('google-search').backGms()) return;
    // A pinned app keeps its first screen: Back stops there.
    if (LP.module('recent').backPinned()) return;
    if (LP.module('google-search').backRoute()) return;
    // News & Weather: a dialog, then the article page, then an expanded story.
    if (LP.module('google-search').backNews()) return;
    if (LP.module('docs').backFit()) return;
    if (ui.view === 'news-weather' && !ui.overlay && (ui.newsDialog || ui.newsWeb || ui.newsSearch)) { if (ui.newsDialog) { ui.newsDialog = ''; ui.newsPick = undefined; } else if (ui.newsWeb) ui.newsWeb = ''; else { ui.newsSearch = false; ui.newsQuery = ''; } render(); return; }
    if (LP.module('settings').backA11y()) return;
    if (LP.module('calendar').back()) return;
    if (LP.module('email').backEmailPrefs()) return;
    if (LP.module('settings').backLock()) return;
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (LP.module('camera').back()) return;
    if (LP.module('live-wallpapers').back()) return;
    if (ui.view === 'lock' && ui.kgBouncing) { ui.kgBouncing = false; ui.kgPending = null; lockControls.lock(); render(); return; }
    if (ui.view === 'lock') return;
    if (LP.module('phone').back()) return;
    if (LP.module('docs').backDocs()) return;
    if (ui.view === 'drive' && ui.sub === 'file' && ui.driveFrom === 'results') { ui.sub = 'results'; ui.driveFrom = ''; render(); return; }
    if (LP.module('google-search').backYt()) return;
    if (ui.view === 'youtube' && ui.sub === 'video' && ui.ytFrom === 'results') { ui.sub = 'results'; ui.ytFrom = ''; render(); return; }
    if (LP.module('google-search').backNow()) return;
    if (LP.module('settings').backSync()) return;
    if (LP.module('docs').backDrawer()) return;
    if (ui.view === 'keep' && ui.keepDialog) { ui.keepDialog = ''; render(); return; }
    if (LP.module('google-search').backApps()) return;
    // Play Books' reader: a dropdown, then the Display options popup, then Contents close before the reader does.
    if (LP.module('play-music').back()) return;
    if (LP.module('photos').back()) return;
    if (LP.module('calendar').backEdit()) return;
    if (LP.module('settings').backPages()) return;
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (LP.module('play-store').back()) return;
    if (ui.view === 'calculator' && StoreHost.back(storeContext())) return;
    if (ui.view === 'drawer' && ui.drawerWidgets) { ui.drawerWidgets = false; ui.drawerPage = 0; home(false); ui.overview = true; render(); return; }
    if (ui.view === 'home' && ui.overview) { ui.overview = false; render(); return; }
    if (LP.module('wallpaper-picker').back()) return;
    if (LP.module('kk-doc-picker').back()) return;
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    // Chrome settings: dialogs first, then the page, then back to the browser.
    // Gmail settings: the dialogs, then the pages, then back to the mail.
    if (LP.module('email').back()) return;
    if (LP.module('chrome').back()) return;
    if (LP.module('settings').back()) return;
    // Hangouts' and Messenger's own pages (hangouts-prefs.js) step back through what opened them.
    if (LP.module('messaging').backPages()) return;
    // Drive's dialogs, folders and filters (lp-drive.js).
    if (LP.module('google-search').backDrive()) return;
    if (LP.module('messaging').back()) return;
    if (LP.module('clock').backCities()) return;
    if (LP.module('people').back()) return;
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
    home(false);
  }
  // PlatLogoActivity's custom toast: "Android 4.3" in Roboto Light over a bold "JELLY BEAN".
  function platLogoToast() {
    document.querySelector('.toast, .jb-toast')?.remove();
    const element = document.createElement('div'); element.className = 'jb-toast'; element.innerHTML = '<span>Android 4.3</span><strong>JELLY BEAN</strong>';
    // Toast.LENGTH_LONG (3.5 s), then the toast_exit fade (config_longAnimTime, accelerate_quad); toasts outlive the activity.
    screen.append(element); setTimeout(() => { element.animate?.([{opacity: 1}, {opacity: 0}], {duration: 500, easing: 'cubic-bezier(.55,.085,.68,.53)', fill: 'forwards'}); setTimeout(() => element.remove(), 500); }, 3500);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    const still = reducedMotion?.matches;
    if (!still) element.animate([{opacity: 0}, {opacity: 1}], {duration: 500, easing: 'cubic-bezier(.25,.46,.45,.94)'});
    clearTimeout(ui.toastTimer);
    ui.toastTimer = setTimeout(() => { if (still) { element.remove(); return; } element.animate([{opacity: 1}, {opacity: 0}], {duration: 500, easing: 'cubic-bezier(.55,.085,.68,.53)', fill: 'forwards'}).finished.then(() => element.remove(), () => element.remove()); }, 2500);
  }
  let openFolderId = '';
  let closingVelocity = 0, shownOverlay = '';
  function startPeek() {
    if (ui.overlay || ui.locked || ui.view === 'lock') return;
    ui.shadePeek = true; ui.peekDone = false; ui.peekCollapse = false; ui.overlay = 'shade'; renderOverlay();
    const shade = overlayRoot.querySelector('.notification-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
    if (!shade) return;
    LPShade.peek(shade, scrim, () => { ui.peekDone = true; if (ui.peekCollapse) closePeek(); });
  }
  function closePeek() { if (!ui.shadePeek) return; ui.shadePeek = false; ui.peekCollapse = false; if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }
  // Animation.Material.Dialog / .Popup (popup_enter_material, popup_exit_material): dialogs, menus and their dim fade in
  // and out with decelerate_cubic in config_activityShortDur (150 ms), without the Holo zoom.
  const FADING = '.settings-dialog, .settings-dialog-scrim, .holo-menu, .menu-scrim, .lp-popup-menu';
  function fadeOverlay(previous) {
    if (previous === ui.overlay || reducedMotion?.matches) return;
    const leaving = previous ? [...overlayRoot.querySelectorAll(FADING)].filter(node => !node.classList.contains('lp-fading')) : [];
    leaving.forEach(node => node.remove());
    queueMicrotask(() => {
      if (ui.overlay) overlayRoot.querySelectorAll(FADING).forEach(node => { if (!node.classList.contains('lp-fading')) node.animate([{opacity: 0}, {opacity: 1}], {duration: 150, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'backwards'}); });
      for (const node of leaving) {
        node.classList.add('lp-fading'); node.removeAttribute('data-action'); node.style.pointerEvents = 'none'; node.inert = true; overlayRoot.append(node);
        node.animate([{opacity: getComputedStyle(node).opacity}, {opacity: 0}], {duration: 150, easing: 'cubic-bezier(.215,.61,.355,1)', fill: 'forwards'}).finished.then(() => node.remove(), () => node.remove());
      }
    });
  }
  function renderOverlay() {
    fadeOverlay(shownOverlay); shownOverlay = ui.overlay;
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    // NotificationPanelView.collapse: the open panel folds up into the status bar and the scrim fades, whatever closed it
    // (Back, Home, the scrim, a swipe up or an action); the old nodes are put back after this render for the animation.
    const closingShade = ui.overlay !== 'shade' && overlayRoot.querySelector('.lp-shade:not(.lp-closing)');
    if (closingShade?._lpAnim) cancelAnimationFrame(closingShade._lpAnim);
    if (closingShade) {
      const scrim = overlayRoot.querySelector('.lp-shade-scrim'), height = closingShade.offsetHeight, opacity = scrim ? getComputedStyle(scrim).opacity : '1';
      closingShade.remove(); scrim?.remove();
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) queueMicrotask(() => {
        for (const node of [scrim, closingShade]) if (node) { node.classList.add('lp-closing'); node.style.pointerEvents = 'none'; node.style.animation = 'none'; node.removeAttribute('data-action'); overlayRoot.append(node); }
        if (scrim) scrim.style.opacity = opacity;
        LPShade.animate(closingShade, Math.min(height, LPShade.maxHeight(closingShade)), 0, {velocity: closingVelocity, scrim, done: () => { closingShade.remove(); scrim?.remove(); }});
        closingVelocity = 0;
      });
    }
    // Collapsing the panel also collapses Quick Settings and closes a tile detail.
    if (ui.overlay !== 'shade') { ui.shadeAnimated = false; ui.shadeSettings = false; ui.qsDetail = ''; }
    if (ui.overlay === 'shade') {
      const call = ui.activeCall ? `<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(lp.contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>` : '';
      const scroll = overlayRoot.querySelector('.lp-shade-scroll')?.scrollTop || 0;
      overlayRoot.innerHTML = '<div class="lp-shade-scrim" data-action="close-overlay"></div>' + LPShade.render({...data, notifications: data.notifications.map(decorateNotification)}, ui, key => i18n.t(key), {locale: i18n.locale(), clock: clock(), date: fullDate(), shortDate: shadeDate(), carrier: lp.carrierName(), alarm: nextAlarmLabel(), statusIcons: statusIndicators(), networks: lp.allWifiNetworks(), extra: call});
      const body = overlayRoot.querySelector('.lp-shade-scroll'); if (body) body.scrollTop = scroll;
      LPShade.playIcons(overlayRoot, reducedMotion?.matches ? null : ui.qsIconAnim);
      const opening = !ui.shadeAnimated;
      overlayRoot.querySelectorAll('.lp-shade,.lp-shade-scrim').forEach(node => { node.style.animation = 'none'; });
      ui.shadeAnimated = true;
      if (opening && !pointerStart?.shadeDragging && !ui.shadePeek && !reducedMotion?.matches) {
        const shade = overlayRoot.querySelector('.lp-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
        LPShade.animate(shade, 0, LPShade.maxHeight(shade), {scrim, done: () => LPShade.settle(shade, scrim)});
      }
    } else if (LP.drawOverlay(ui.overlay, overlayRoot)) {
      // A screen's own menu or dialog (lp-*.js modules).
    } else if (ui.overlay === 'store-host') {
      overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
    } else if (ui.overlay === 'kg-widget-picker') {
      const choices = [['calendar', 'Calendar', 'calendar.png'], ['clock', 'Digital clock', 'clock.png']];
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jbk-picker" role="dialog" aria-label="${safe(i18n.t('Choose widget'))}"><h3>${safe(i18n.t('Choose widget'))}</h3>${choices.map(([type, label, icon]) => `<button data-action="kg-pick-widget" data-id="${type}"><img src="assets/${icon}" alt=""><span>${safe(i18n.t(label))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'lp-brightness') {
      const auto = !!data.settings.autoBrightness;
      overlayRoot.innerHTML = `<div class="lp-bright-scrim" data-action="close-overlay"></div><div class="lp-bright-dlg" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><button type="button" class="lp-bright-auto${auto ? ' on' : ''}" data-action="lp-brightness-auto" aria-pressed="${auto}" aria-label="${safe(i18n.t('AUTO'))}"><img src="assets/lp-sysui-ic_qs_brightness_auto_${auto ? 'on' : 'off'}_alpha.png" alt=""></button><div class="lp-qs-brightness lp-bright-slider"><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" style="--v:${(data.settings.brightness - 10) / .9}%"></div></div>`;
    } else if (ui.overlay === 'qs-brightness') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jb-brightness" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><h3>${safe(i18n.t('Brightness'))}</h3><div class="jb-brightness-row"><img src="assets/jb-ic_qs_brightness_auto_off.png" alt=""><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" ${data.settings.autoBrightness ? 'disabled' : ''}><label><input type="checkbox" data-field="auto-brightness" ${data.settings.autoBrightness ? 'checked' : ''}><span>${safe(i18n.t('AUTO'))}</span></label></div></div>`;
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if (ui.overlay === 'search') {
      if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
    } else if (ui.overlay === 'folder') {
      overlayRoot.innerHTML = renderFolder();
      positionFolder();
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
    // Folder.animateOpen/animateClosed run only when the folder actually opens or closes, not on content updates.
    const folderPanel = ui.overlay === 'folder' ? overlayRoot.querySelector('.launcher-folder') : null;
    if (folderPanel && openFolderId !== ui.folderId) {
      ui.folderSettled = '';
      if (!reducedMotion?.matches) folderPanel.classList.add('lp-folder-opening');
      const animations = ICSTransitions.play(folderPanel, ICSTransitions.specs['folder-open'].enter);
      animations.forEach(animation => animation.finished.then(() => animation.cancel(), () => {}));
      const folderId = ui.folderId;
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => { if (ui.overlay === 'folder' && ui.folderId === folderId) { ui.folderSettled = folderId; syncClings(); } });
    }
    if (!folderPanel && openFolderId && clingLayerRoot().querySelector('[data-cling="folder"]') && data.clings) { data.clings.folder = true; save(); }
    else if (!folderPanel && closingFolder && openFolderId) {
      closingFolder.inert = true; closingFolder.classList.add('launcher-folder-closing'); overlayRoot.append(closingFolder);
      const animations = ICSTransitions.play(closingFolder, ICSTransitions.specs['folder-close'].exit);
      Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => closingFolder.remove());
      if (!animations.length) closingFolder.remove();
    }
    openFolderId = folderPanel ? ui.folderId : '';
    if (!folderPanel) ui.folderSettled = '';
    syncClings();
  }
  // Created on first use: the first render runs before this point of the script.
  function clingLayerRoot() { let node = screen.querySelector('#cling-layer'); if (!node) { node = document.createElement('div'); node.id = 'cling-layer'; screen.append(node); } return node; }
  function clingTarget(kind) {
    const base = clingLayerRoot().getBoundingClientRect();
    // Cling.getWorkspaceCutOutBounds: the screen centre, 30 dp higher.
    if (kind === 'workspace') return {circle: [base.width / 2, base.height / 2 - LauncherClings.RING.lift], radius: LauncherClings.RING.outer};
    if (kind !== 'folder') return {};
    const folder = overlayRoot.querySelector('.launcher-folder')?.getBoundingClientRect();
    return folder ? {rect: {left: folder.left - base.left, top: folder.top - base.top, right: folder.right - base.left, bottom: folder.bottom - base.top}} : {};
  }
  function placeCling(root, kind) { LauncherClings.cut(root, clingTarget(kind)); }
  function syncClings() {
    let kind = ui.power || ui.locked || ui.sleeping ? '' : LauncherClings.wanted(ui, data.clings);
    if (kind === 'folder' && ui.folderSettled !== ui.folderId) kind = '';
    const current = clingLayerRoot().querySelector('.cling:not(.cling-leaving)');
    if (current?.dataset.cling === kind) { placeCling(current, kind); return; }
    current?.remove();
    if (!kind) return;
    clingLayerRoot().insertAdjacentHTML('beforeend', LauncherClings.markup(kind, key => i18n.t(key)));
    const root = clingLayerRoot().lastElementChild;
    placeCling(root, kind);
    // showLongPressCling(true): the first cling, with the welcome title, is not animated in.
    setTimeout(() => { if (root.isConnected) placeCling(root, kind); }, 450);
  }

  window.addEventListener('resize', () => syncClings());

  function renderFolder() {
    const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const {columns,rows}=ICSLauncherFolders.dimensions(folder.items.length);
    return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder lp-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:calc(${((columns*74+24)/.906).toFixed(4)} * var(--dp));--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="${safe(i18n.t('Unnamed Folder'))}" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
  }
  function positionFolder() {
    const panel=overlayRoot.querySelector('.launcher-folder');if(!panel)return;
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

  const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  setInterval(() => { if (ui.overlay === 'wifi-wps') renderOverlay(); }, 1000);



  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }



  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);data.gmailbox=GmailApp.restore(null);ui.mailApp='';ui.mailStates={};ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Agenda';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]).concat((data.driveFiles||StockApps.FILES).map(f=>'office:'+f.id)));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);ui.browserOwner='browser';ui.browserSessions={};syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(window.StoreHost?.has(id)){StoreHost.module(id).clearData?.(storeContext(), id);save();}
    if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    if(id==='music'){ui.music=ICSMusic.restore();lp.saveMusic();}
    if(id==='gallery'){data.photos=clone(defaultData.photos);}
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  // QS tile clicks (QSTile.handleClick): Wi-Fi, Bluetooth, airplane, rotation, flashlight, location, invert and hotspot
  // toggle in place; Cellular opens data usage and Cast its settings, as their details point there.
  function lpQsToggle(id) {
    const s = data.settings;
    if (id === 'wifi') { s.wifi = !s.wifi; if (s.wifi) { s.airplane = false; s.portableHotspot = false; } }
    else if (id === 'bluetooth') s.bluetooth = !s.bluetooth;
    else if (id === 'airplane') { s.airplane = !s.airplane; if (s.airplane) { s.wifi = false; s.bluetooth = false; } }
    else if (id === 'rotation') s.rotate = s.rotate === false;
    else if (id === 'flashlight') s.flashlight = !s.flashlight;
    else if (id === 'location') s.locationAccess = !(s.locationAccess !== false && (s.gps || s.networkLocation)) ? true : false, s.locationAccess && !s.gps && !s.networkLocation && (s.networkLocation = true);
    else if (id === 'inversion') s.inversion = !s.inversion;
    else if (id === 'hotspot') { s.portableHotspot = !s.portableHotspot; if (s.portableHotspot) s.wifi = false; }
    else if (id === 'cell') { ui.overlay = ''; openApp('settings'); ui.sub = 'data'; render(); return; }
    else if (id === 'cast') { ui.overlay = ''; openApp('settings'); ui.sub = 'wifi-display'; render(); return; }
    if (['airplane', 'rotation', 'flashlight', 'location', 'inversion', 'hotspot'].includes(id)) ui.qsIconAnim = {...ui.qsIconAnim, [id]: performance.now()};
    save(); renderStatus(); renderOverlay(); JBDeveloperOptions.apply(screen, data.settings);
  }
  /* Each notification's Material look: the app's small icon on its accent colour (Notification.color) in the 40 dp
     circle, or the large icon (a contact photo) with the small icon badged on the colour. */
  function decorateNotification(note) {
    if (note.id === 2) return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-messenger.png', color: '#0277bd', big: 'Hey! Are we still on for coffee tomorrow?\nSee you at 11!', actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'message' && note.channel === 'hangouts') return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-hangouts.png', color: '#0f9d58', big: note.detail, actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'message') return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-messenger.png', color: '#0277bd', big: note.detail, actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'calendar') return {...note, smallIcon: 'lpn-calendar.png', color: '#4285f4', big: note.detail, actions: [{id: 'snooze', label: 'Snooze'}]};
    if (note.kind === 'timer') return {...note, smallIcon: 'lpn-timer.png', color: '#00796b'};
    if (note.kind === 'market-dl') return {...note, smallIcon: 'lpn-download.png', color: '#607d8b'};
    if (note.kind === 'market-done') return {...note, smallIcon: 'lpn-play-installed.png', color: '#607d8b'};
    return {...note, smallIcon: 'lp-sysui-android.svg', color: '#9e9e9e'};
  }
  // AlarmManager.getNextAlarmClock: the next enabled alarm, in ms of device time (0 without one).
  function nextAlarmTime() { const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0]; return next ? next.getTime() : 0; }
  // Settings.System.NEXT_ALARM_FORMATTED, shown by the temporary alarm tile.
  function nextAlarmLabel() {
    const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    return next ? next.toLocaleString(i18n.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
  }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
  /* A simulated answer shows Lollipop's heads-up notification: a few seconds after a text to one of the demo contacts
     they write back once (per contact and session). */
  const REPLIES = {1: 'Sounds good, see you then!', 2: 'Got it, thanks!', 3: 'Haha, nice 😄', 4: 'Love you! Talk soon ♥'};
  /* HeadsUpNotificationView (5.1): a high-priority notification drops in at the top over the running app, 8 dp in from
     the sides, and leaves after heads_up_notification_decay (10 s) or when swiped away; tapping it opens it. */
  let headsUpTimer = 0;
  // OvershootInterpolator (tension 2), DecelerateInterpolator / AccelerateInterpolator (factor 1), sampled.
  function headsUpFrames(enter) {
    const overshoot = t => { t -= 1; return t * t * (3 * t + 2) + 1; };
    return Array.from({length: 13}, (_, i) => {
      const t = i / 12, y = enter ? -50 * (1 - overshoot(t)) : -50 * overshoot(t), alpha = enter ? 1 - (1 - t) * (1 - t) : 1 - t * t;
      return {offset: t, transform: `translateY(${y.toFixed(2)}%)`, opacity: alpha.toFixed(3)};
    });
  }
  function headsUp(note) {
    if (ui.locked || ui.view === 'lock' || ui.sleeping || ui.overlay === 'shade') return;
    let layer = screen.querySelector('#lp-headsup');
    if (!layer) { layer = document.createElement('div'); layer.id = 'lp-headsup'; screen.insertBefore(layer, overlayRoot); }
    layer.innerHTML = LPShade.row(decorateNotification(note), key => i18n.t(key), i18n.locale(), true).replace('class="notification jb-note lp-note', 'class="notification lp-note lp-headsup-card');
    i18n.translateDOM(layer);
    const card = layer.firstElementChild;
    // Swiping the heads-up card up or sideways dismisses it into the shade (HeadsUpNotificationView.EdgeSwipeHelper).
    card.addEventListener('pointerdown', down => {
      const start = {x: down.clientX, y: down.clientY};
      const move = event => { const dx = event.clientX - start.x, dy = event.clientY - start.y; card.style.transform = Math.abs(dx) > Math.abs(dy) ? `translateX(${dx}px)` : `translateY(${Math.min(0, dy)}px)`; card.style.opacity = String(1 - Math.min(.7, Math.abs(dx) / 400)); };
      const up = event => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); const dx = event.clientX - start.x, dy = event.clientY - start.y; if (dy < -dp(26) || Math.abs(dx) > dp(99)) { suppressClickUntil = Date.now() + 300; card.style.transform = ''; card.style.opacity = ''; releaseHeadsUp(dy < -dp(26) && Math.abs(dy) > Math.abs(dx) ? 'up' : dx < 0 ? 'left' : 'right'); } else { card.style.transform = ''; card.style.opacity = ''; } };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    // Animation.StatusBar.HeadsUp (heads_up_enter): from -50 % with the overshoot interpolator, fading in with
    // decelerate_quad, config_shortAnimTime (200 ms).
    if (!reducedMotion?.matches) card.animate(headsUpFrames(true), {duration: 200, fill: 'backwards'});
    clearTimeout(headsUpTimer); headsUpTimer = setTimeout(() => releaseHeadsUp(), 10000);
  }
  function releaseHeadsUp(direction = 'up') {
    clearTimeout(headsUpTimer);
    const card = screen.querySelector('#lp-headsup .lp-headsup-card'); if (!card) return;
    const done = () => card.remove();
    if (reducedMotion?.matches || !card.animate) { done(); return; }
    // heads_up_exit: up to -50 % (overshoot) fading with accelerate_quad in 200 ms; a sideways swipe flies out.
    if (direction === 'up') { card.animate(headsUpFrames(false), {duration: 200, fill: 'forwards'}).finished.then(done, done); return; }
    card.animate([{transform: 'none', opacity: 1}, {transform: `translateX(${direction === 'left' ? '-' : ''}110%)`, opacity: 0}], {duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}).finished.then(done, done);
  }

  let suppressClickUntil = 0;
  // PanelView.onEmptySpaceClick: in the shade, a tap on the panel where no card, header or tile is collapses it.
  overlayRoot.addEventListener('click', event => {
    if (ui.overlay !== 'shade' || Date.now() < suppressClickUntil) return;
    const shade = event.target.closest('.lp-shade');
    if (!shade || event.target.closest('.lp-note, .lp-header, .lp-qs, .lp-dismiss button, button, input, a, [data-action], .phone-resume-call')) return;
    event.stopPropagation(); ui.overlay = ''; renderOverlay();
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    // Gmail's label settings, Days of mail to sync and the vacation responder (gmail.js).
    // A choice in a Play app's menu closes it before its action runs (lp-play-more.js handles its own).
    if (LP.module('play-music').preClick(action, id, button)) return;
    // Email's Quick responses, ringtone and server screens (email-prefs.js).
    if (ui.view === 'gallery' && ui.galleryPopup && action !== 'gallery-menu') ui.galleryPopup = '';
    // A tap outside the Recents popup menu only dismisses it.
    if (LP.module('recent').preClick(action)) return;
    if(ui.locked){
      // KeyguardHostView: launching from a widget or adding one needs the bouncer first.
      const pending={'kg-add-widget':{type:'add'},'widget-calendar-open':{type:'calendar'},'widget-calendar-event':{type:'calendar',id,date:button.dataset.date}}[action];
      if(pending&&ui.view==='lock'){requestBouncer(pending);return;}
      if(!['back','alarm-dismiss','alarm-snooze','lock-media'].includes(action))return;
    }
    // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
    if ((action.startsWith('sth-') || StoreHost.has(ui.view)) && StoreHost.action(action, button, storeContext())) return;
    // The Phone app's Settings (lp-dialer-prefs.js).
    // The screens' own buttons (lp-*.js modules).
    if (LP.click(action, button, event)) return;
    switch (action) {
      case 'open-app': if (GEL_UNSIMULATED.includes(app)) { toast(i18n.t('This app is not part of the simulator.')); break; } {
        const icon = button.closest('.launcher-icon, .drawer-app, .dock-app') || button;
        // Launcher icons start apps with makeScaleUpAnimation; Recents uses makeThumbnailScaleUpAnimation from the thumbnail.
        const source = button.closest('.recent-item') ? button.closest('.recent-item').querySelector('.recent-thumbnail') : ['home', 'drawer'].includes(ui.view) ? icon : null;
        if (source) { const box = source.getBoundingClientRect(), frame = viewport.getBoundingClientRect(), k = frame.width / viewport.offsetWidth || 1; launchFrom = {left: (box.left - frame.left) / k, top: (box.top - frame.top) / k, width: box.width / k, height: box.height / k, recents: !!button.closest('.recent-item')}; }
        openApp(app || id, !!button.closest('.recent-item')); break;
      }
      // Screen pinning: Home and Overview only remind how to unpin; ScreenPinningRequest confirms the pin.
      case 'home': if (ui.pinned && ui.view !== 'lock') { lp.pinnedToast(); break; } if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'drawer': {
        // The reveal starts on the all apps button: its centre's offset from the panel centre, in screen px.
        const box = button.getBoundingClientRect(), frame = screen.getBoundingClientRect(), k = frame.width / screen.clientWidth;
        const panelCenterY = (statusBarHeight() + (screen.clientHeight - navRoot.offsetHeight - 23.2)) / 2;
        ui.drawerReveal = reducedMotion?.matches ? null : {dx: Math.round((box.left + box.width / 2 - frame.left) / k - screen.clientWidth / 2), dy: Math.round((box.top + box.height / 2 - frame.top) / k - panelCenterY)};
        ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; ui.overview = false; ui.drawerWidgets = false; if (ui.drawerPage >= drawerAppPages()) ui.drawerPage = 0; render();
        ui.drawerReveal = null; setTimeout(() => viewport.querySelector('.lp-drawer')?.classList.remove('lp-revealing'), 320); break;
      }
      case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`), () => syncClings()); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      // Overview mode: Widgets opens all apps on the first widget page; a tap on a page returns to it.
      case 'kk-overview-widgets': ui.overview = false; ui.view = 'drawer'; ui.drawerWidgets = true; ui.drawerPage = drawerAppPages(); render(); break;
      case 'kk-overview-page': if (ui.overview) { ui.overview = false; ui.page = Number(id); render(); } break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': openApp('play-music'); break;
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
      case 'widget-music-prev': ICSMusic.step(ui.music, -1); ui.musicActive = true; ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
      case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
      case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
      case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
      case 'widget-photo-cancel': cancelPhotoWidget(); break;
      case 'page': setHomePage(Number(id)); break;
      case 'power-toggle':
        if (id === 'brightness') data.settings.brightness = data.settings.brightness < 30 ? 55 : data.settings.brightness < 80 ? 100 : 20;
        else data.settings[id] = !data.settings[id];
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        save(); render(); break;
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;lp.saveMusic();render();break;
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': if (ui.pinned) break; ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'close-overlay': if (ui.overlay === 'recent') { lp.closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
      case 'clear-notifications': {
        const rows = [...overlayRoot.querySelectorAll('.jb-note')], delays = LPShade.clearDelays(rows.length);
        if (reducedMotion?.matches || !rows.length) { data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break; }
        overlayRoot.querySelector('.jb-shade-clear')?.setAttribute('hidden', '');
        rows.forEach((row, index) => row.animate([{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${row.offsetWidth}px)`, opacity: 0}], {duration: 125, delay: delays[index], easing: 'linear', fill: 'forwards'}));
        setTimeout(() => { data.notifications = []; save(); renderStatus(); if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }, (delays.at(-1) || 0) + 125 + 225);
        break;
      }
      case 'kg-add-widget': ui.overlay = 'kg-widget-picker'; renderOverlay(); break;
      case 'kg-pick-widget': { const widgets = data.keyguardWidgets ||= []; if (widgets.length < JBKeyguard.MAX_WIDGETS) { widgets.push({id: `kg-${Date.now()}`, type: id}); save(); ui.kgPage = widgets.length; } ui.overlay = ''; if (ui.kgRelock) { ui.kgRelock = false; const page = ui.kgPage; lockScreen(); ui.kgPage = page; render(); } else render(); break; }
      // Lollipop Quick Settings: the icon toggles, the dual label opens the tile's detail.
      case 'lp-qs-expand': ui.shadeSettings = !ui.shadeSettings; ui.qsDetail = ''; renderOverlay(); break;
      case 'lp-qs-user': toast('Only the owner can be signed in on this simulator.'); break;
      case 'lp-qs-toggle': lpQsToggle(id); break;
      case 'lp-qs-detail': ui.qsDetail = id; renderOverlay(); break;
      case 'lp-qsd-done': ui.qsDetail = ''; renderOverlay(); break;
      case 'lp-qsd-more': ui.qsDetail = ''; ui.overlay = ''; openApp('settings'); ui.sub = id === 'wifi' ? 'wifi' : 'bluetooth'; render(); break;
      case 'lp-qsd-switch': lpQsToggle(id); break;
      case 'lp-qsd-item': if (id === 'wifi') { data.settings.wifiNetwork = button.dataset.key; save(); renderStatus(); renderOverlay(); } break;
      case 'lp-qsd-disconnect': if (id === 'wifi') data.settings.wifiNetwork = ''; else data.settings.pairedDevice = ''; save(); renderStatus(); renderOverlay(); break;
      case 'qs-brightness': ui.overlay = 'qs-brightness'; renderOverlay(); break;
      case 'lp-brightness': ui.overlay = 'lp-brightness'; renderOverlay(); break;
      case 'lp-brightness-auto': data.settings.autoBrightness = !data.settings.autoBrightness; save(); renderOverlay(); break;
      case 'qs-settings': ui.overlay = ''; openApp('settings'); break;
      case 'qs-alarm': ui.overlay = ''; openApp('clock'); break;
      case 'notification-action': if (button.dataset.noteAction === 'reply') { const note = data.notifications.find(item => String(item.id) === id); releaseHeadsUp(); data.notifications = data.notifications.filter(item => item !== note); save(); renderStatus(); ui.overlay = ''; openApp(note?.channel === 'hangouts' ? 'hangouts' : 'messaging'); lp.openMessageThread(note?.contact || 1); break; } { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar' && button.dataset.noteAction === 'snooze') { data.notifications = data.notifications.filter(item => item !== note); (data.calendarSnoozes ||= []).push({eventId: note.eventId, date: note.date, title: note.title, detail: note.detail, at: deviceDate().getTime() + 5 * 60000}); save(); renderStatus(); if (!data.notifications.length) ui.overlay = ''; renderOverlay(); toast('Snoozed'); } break; }
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; }
        releaseHeadsUp();
        if (note?.kind === 'message') { data.notifications = data.notifications.filter(item => item !== note); save(); renderStatus(); ui.overlay = ''; openApp(note.channel === 'hangouts' ? 'hangouts' : 'messaging'); lp.openMessageThread(note.contact); break; }
        ui.overlay = ''; if (Number(id) === 2) lp.openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break; }
      case 'unlock': ui.view = 'home'; render(); break;
      // ActivatableNotificationView: the first touch activates the card ("Touch again to open"), the second opens it.
      case 'lp-kg-note': if (ui.kgActivated !== id) { ui.kgActivated = id; viewport.querySelectorAll('.lp-kg-note').forEach(node => node.classList.toggle('activated', node.dataset.id === id)); kgHint('Touch again to open'); break; }
        ui.kgActivated = ''; if (ui.locked) { requestBouncer({type: 'note', id}); break; } { const opener = document.createElement('button'); opener.dataset.action = 'notification-open'; opener.dataset.id = id; screen.append(opener); home(false); opener.click(); opener.remove(); } break;
      case 'unlock-camera': openApp('camera'); break;
      case 'toast': toast(id); break;
      case 'noop': break;

      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (ui.view === 'news-weather' && NewsSections.submit(form.dataset.form, values, lp.newsSectionsContext())) return;
    if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, lp.mrContext()); return; }
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    // The screens' own forms (lp-*.js modules).
    if (LP.submit(form.dataset.form, values, event, form)) return;
    switch (form.dataset.form) {
      default: break;
    }
  });
  document.addEventListener('input', event => {
    // The screens' own fields (lp-*.js modules).
    if (LP.input(event)) return;
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);delete folder.nameKey;save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
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
    addExtraEmptyScreen();
    suppressClickUntil = Date.now() + 500;
  }
  function addExtraEmptyScreen() {
    if (ui.extraScreen) return;
    ui.extraScreen = true;
    data.homePages.push(Array(GRID * GRID).fill(null)); data.homeWidgets.push([]);
    const index = data.homePages.length - 1;
    viewport.querySelector('.home-pages')?.insertAdjacentHTML('beforeend', `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" inert>${Array.from({length: GRID * GRID}, (_, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % GRID + 1};grid-row:${Math.floor(slot / GRID) + 1}"></div>`).join('')}</div>`);
    viewport.querySelector('.page-indicators')?.insertAdjacentHTML('beforeend', `<button data-action="page" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}">${pageMarker(false, true)}</button>`);
  }
  // Returns the new index of each old page.
  function stripEmptyScreens() {
    ui.extraScreen = false;
    const empty = page => data.homePages[page].every(id => !id) && !(data.homeWidgets[page] || []).length;
    const keep = data.homePages.map((_, page) => page).filter(page => !empty(page));
    if (!keep.length) keep.push(0);
    const map = new Map(keep.map((page, index) => [page, index]));
    data.homePages = keep.map(page => data.homePages[page]); data.homeWidgets = keep.map(page => data.homeWidgets[page] || []);
    const current = keep.findIndex(page => page >= ui.page);
    ui.page = current < 0 ? keep.length - 1 : keep[current] === ui.page ? current : Math.max(0, current - 1);
    return map;
  }
  function remapDestination(destination, map) { if (destination?.type === 'home' && map.has(destination.page)) destination.page = map.get(destination.page); return destination; }
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
    const direction = ui.overlay ? 0 : x - rect.left < dp(20) ? -1 : rect.right - x < dp(20) ? 1 : 0;
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
  /* Jelly Bean reorder: after hovering an occupied area for REORDER_TIMEOUT the items there slide away
     (REORDER_DURATION); the solution is committed on drop and undone when the drag moves on. */
  const gridMetrics = () => { const grid = viewport.querySelector(`.home-grid[data-home-page="${ui.page}"]`); if (!grid) return null; const rect = grid.getBoundingClientRect(), k = rect.width / grid.offsetWidth || 1; return {grid, cellW: (rect.width - 12) / 4 / k, cellH: (rect.height - 5) / 4 / k}; };
  function reorderElement(key) {
    const grid = viewport.querySelector(`.home-grid[data-home-page="${ui.page}"]`);
    return key[0] === 's' ? grid?.querySelector(`[data-home-slot="${key.slice(1)}"] .launcher-icon`) : grid?.querySelector(`.home-widget[data-widget-id="${CSS.escape(key.slice(1))}"]`);
  }
  function showReorder(solution) {
    const metrics = gridMetrics();
    viewport.querySelectorAll('.jb-displaced').forEach(node => { node.classList.remove('jb-displaced'); node.style.transform = ''; });
    if (!solution || !metrics) return;
    const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
    for (const [key, to] of Object.entries(solution.moves)) {
      const item = list.find(entry => entry.key === key), node = reorderElement(key);
      if (!item || !node) continue;
      node.classList.add('jb-displaced');
      node.style.transform = `translate(${(to.x - item.x) * metrics.cellW}px,${(to.y - item.y) * metrics.cellH}px)`;
    }
  }
  function requestReorder(key, moving) {
    const source = dragState;
    if (source.wsReorder?.key === key) return source.wsReorder.solution;
    if (source.wsPending === key) return null;
    clearTimeout(source.wsReorderTimer); source.wsPending = key;
    if (source.wsReorder) { source.wsReorder = null; showReorder(null); }
    source.wsReorderTimer = setTimeout(() => {
      if (dragState !== source || source.wsPending !== key) return;
      const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
      const solution = JBLauncher.solve(list, moving, source.wsDirection || [0, 0]);
      source.wsReorder = {key, solution, moving}; source.wsPending = '';
      showReorder(solution);
      if (source.lastPointer) updateDragOutline(...source.lastPointer);
    }, JBLauncher.REORDER_TIMEOUT);
    return null;
  }
  function clearReorder() { const source = dragState; if (!source) return; clearTimeout(source.wsReorderTimer); source.wsPending = ''; if (source.wsReorder) { source.wsReorder = null; showReorder(null); } }
  function dragOutlineTarget(x, y) {
    const source = dragState;
    if (!source || ui.overlay) return null;
    source.wsCandidate = null;
    if (source.lastPointer) source.wsDirection = [Math.sign(x - source.lastPointer[0]), Math.sign(y - source.lastPointer[1])];
    source.lastPointer = [x, y];
    const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
    if (source.widgetType) {
      if (!grid) return null;
      const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      const column = Math.round((x - rect.left - source.grabOffset.x) / (rect.width / GRID)), row = Math.round((y - rect.top - source.grabOffset.y) / (rect.height / GRID));
      const size = widgetSize(oldWidget || source.widgetType), outline = {key: `w:${ui.page}:${column}:${row}`, container: grid, style: `grid-column:${column + 1}/span ${size.width};grid-row:${row + 1}/span ${size.height}`};
      if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) { clearReorder(); return outline; }
      const movingKey = oldWidget && source.page === ui.page ? `w${oldWidget.id}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: column, y: row, w: size.width, h: size.height}};
      return requestReorder(outline.key, source.wsCandidate.moving) ? outline : null;
    }
    const slot = target?.closest('[data-home-slot],[data-dock-slot]');
    const occupant = slot?.querySelector('.launcher-icon:not(.drag-source-icon)');
    if (slot?.hasAttribute('data-home-slot')) {
      const index = Number(slot.dataset.homeSlot), outline = {key: `h:${ui.page}:${index}`, container: slot};
      const covered = data.homeWidgets[ui.page].some(widget => index % GRID >= widget.x && index % GRID < widget.x + widgetSize(widget).width && Math.floor(index / GRID) >= widget.y && Math.floor(index / GRID) < widget.y + widgetSize(widget).height);
      if (!occupant && !covered) { clearReorder(); return outline; }
      // Near an icon's centre the drop makes or fills a folder; elsewhere the occupant moves aside.
      if (occupant) { const box = occupant.querySelector('.app-icon')?.getBoundingClientRect(); if (box && JBLauncher.folderZone({x, y}, {x: box.left + box.width / 2, y: box.top + box.height / 2}, box.width)) { clearReorder(); return null; } }
      if (ICSLauncherFolders.folder(data, source.id) && occupant?.dataset.folderId) return null;
      const movingKey = source.type === 'home' && source.page === ui.page ? `s${source.slot}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: index % GRID, y: Math.floor(index / GRID), w: 1, h: 1}};
      return requestReorder(outline.key, source.wsCandidate.moving) ? outline : null;
    }
    if (!slot || occupant) return null;
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
    const box=icon?.querySelector('.app-icon')?.getBoundingClientRect(),inZone=!!box&&JBLauncher.folderZone({x,y},{x:box.left+box.width/2,y:box.top+box.height/2},box.width);
    if(icon&&inZone&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
    const hoverId=!sourceIsFolder&&!sameSlot&&inZone?folderId:null;
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
    if (target?.closest('[data-resize-frame]')) homeSlot = target.closest('.home-grid')?.querySelector('[data-home-slot]');
    const grid = target?.closest('.home-grid');
    if (!homeSlot && grid) {
      const rect = grid.getBoundingClientRect();
      const column = Math.min(GRID - 1, Math.max(0, Math.floor((x - rect.left) / rect.width * GRID)));
      const row = Math.min(GRID - 1, Math.max(0, Math.floor((y - rect.top) / rect.height * GRID)));
      homeSlot = grid.querySelector(`[data-home-slot="${row * GRID + column}"]`);
    }
    const dockSlot = target?.closest('[data-dock-slot]');
    const pageButton = target?.closest('.page-indicators button');
    const remove = target?.closest('[data-drop-remove]');
    const trashRect = remove?.getBoundingClientRect();
    if (source.type === 'drawer' && target?.closest('[data-drop-info]')) {
      clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer'); stripEmptyScreens(); save();
      openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); suppressClickUntil = Date.now() + 350;
      return true;
    }
    let destination = null;
    // Commit a reorder solution if the drop lands where it was computed.
    let committed = null;
    if (!ui.overlay && source.lastPointer) {
      updateDragOutline(x, y);
      const candidate = source.wsCandidate;
      if (candidate) {
        const solution = source.wsReorder?.key === candidate.key ? source.wsReorder.solution : JBLauncher.solve(JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize), candidate.moving, source.wsDirection || [0, 0]);
        if (solution) committed = {key: candidate.key, solution, moving: candidate.moving};
      }
    }
    if (committed) {
      const page = data.homePages[ui.page], sameIcon = !source.widgetType && source.type === 'home' && source.page === ui.page;
      if (sameIcon) page[source.slot] = null;
      data.homePages[ui.page] = JBLauncher.apply(page, data.homeWidgets[ui.page], committed.solution.moves);
      showReorder(null);
      if (sameIcon) { const slot = committed.moving.y * GRID + committed.moving.x; data.homePages[ui.page][slot] = source.id; homeSlot = null; destination = {type: 'home', page: ui.page, slot}; source.reorderHandled = true; }
    }
    if (source.reorderHandled) { /* placed above */ }
    else if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (oldWidget) destination = {widget: oldWidget.id, page: source.page};
      if (remove && oldWidget) { data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id); destination = {trash: true}; }
      else if (homeSlot) {
        const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
        const column = Math.round((x - rect.left - source.grabOffset.x) / (rect.width / GRID));
        const row = Math.round((y - rect.top - source.grabOffset.y) / (rect.height / GRID));
        if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
          if (oldWidget) {
            data.homeWidgets[source.page] = data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
            oldWidget.x = column; oldWidget.y = row;
            data.homeWidgets[ui.page].push(oldWidget);
            destination = {widget: oldWidget.id, page: ui.page};
            // Launcher2 shows the resize frame after dropping a resizable widget.
            if (widgetSize(oldWidget).resize) ui.resizeWidget = oldWidget.id;
          }
          else { const added = addWidget(source.widgetType, column, row); if (added) { destination = {widget: added.id, page: ui.page}; if (widgetSize(added).resize) ui.resizeWidget = added.id; } }
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
        const covered=data.homeWidgets[ui.page].some(widget=>slot%GRID>=widget.x&&slot%GRID<widget.x+widgetSize(widget).width&&Math.floor(slot/GRID)>=widget.y&&Math.floor(slot/GRID)<widget.y+widgetSize(widget).height);
        if(!covered)result=dropAt({type:'home',page:ui.page,slot});
      }else if(dockSlot)result=dropAt({type:'dock',slot:Number(dockSlot.dataset.dockSlot)});
      else if(pageButton){
        const nextPage=Number(pageButton.dataset.id);
        const slot=data.homePages[nextPage].findIndex((id,index)=>id===null&&!data.homeWidgets[nextPage].some(widget=>index%GRID>=widget.x&&index%GRID<widget.x+widgetSize(widget).width&&Math.floor(index/GRID)>=widget.y&&Math.floor(index/GRID)<widget.y+widgetSize(widget).height));
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
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearTimeout(source.wsReorderTimer);clearFolderDragFeedback();
    clearTimeout(source.edgeTimer); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
    const pageMap = stripEmptyScreens(); remapDestination(destination, pageMap);
    save(); render(); suppressClickUntil = Date.now() + 350;
    landGhost(source.ghost, destination, trashRect);
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(dragState || ui.overview ? 0 : -1, Math.min(data.homePages.length - 1, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    const home = viewport.querySelector('.kk-home');
    if (home) { home.style.removeProperty('--gnow-instant'); home.style.setProperty('--gnow', ui.page === -1 ? 1 : 0); home.classList.toggle('gel-now-open', ui.page === -1); home.querySelector('.gel-now-layer').inert = ui.page !== -1; }
    track.style.transition = '';
    track.style.transform = `translateX(${-Math.max(0, ui.page) * 100}%)`; snapResting(track);
    setWallpaperPan(ui.page);
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page && !ui.overview; grid.style.setProperty('--rel', index - ui.page); });
    viewport.querySelectorAll('.page-indicators button').forEach(button => button.classList.toggle('active', Number(button.dataset.id) === ui.page));
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-pages');
    if (!content) return;
    const home = viewport.querySelector('.kk-home'), width = screen.clientWidth;
    // Scrolling into Google Now: the pane follows the finger and the workspace, dock and indicator slide away.
    if (home && (ui.page === -1 || (ui.page === 0 && dx > 0)) && !ui.overview) {
      const progress = ui.page === -1 ? Math.max(0, Math.min(1, 1 + dx / width)) : Math.max(0, Math.min(1, dx / width));
      home.style.setProperty('--gnow-instant', '1'); home.style.setProperty('--gnow', progress.toFixed(4));
      return;
    }
    const distance = Math.max(-(data.homePages.length - 1 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
    setWallpaperPan(ui.page - distance / screen.clientWidth, false);
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(ui.overview ? 0 : -1, Math.min(data.homePages.length - 1, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    suppressClickUntil = Date.now() + 350;
    setHomePage(Math.abs(dx) > dp(50) ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const [first, last] = drawerRange();
    const nextPage = Math.max(first,Math.min(last,ui.drawerPage + (dx < 0 ? 1 : -1)));
    suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > dp(50) && nextPage !== ui.drawerPage) {
      ui.drawerPage = nextPage; render();
      viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
    } else {
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
    }
  }
  let lastWheelPage = 0;
  /* Jelly Bean notifications expand with a two-finger swipe down or a pinch out (trackpad pinches arrive as
     Ctrl+wheel), and collapse with the opposite gesture. */
  function setNoteExpanded(id, expanded) {
    ui.noteExpanded = {...ui.noteExpanded, [id]: expanded};
    renderOverlay();
  }
  screen.addEventListener('wheel', event => {
    const note = ui.overlay === 'shade' && event.ctrlKey ? event.target.closest('.jb-note') : null;
    if (!note) return;
    event.preventDefault(); event.stopImmediatePropagation();
    setNoteExpanded(note.dataset.id, event.deltaY < 0);
  }, {passive: false, capture: true});
  let noteGesture = null;
  screen.addEventListener('touchstart', event => {
    const note = ui.overlay === 'shade' && event.touches.length === 2 ? event.target.closest('.jb-note') : null;
    noteGesture = note ? {id: note.dataset.id, y: (event.touches[0].clientY + event.touches[1].clientY) / 2} : null;
  }, {passive: true});
  screen.addEventListener('touchmove', event => {
    if (!noteGesture || event.touches.length !== 2) return;
    const y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    if (Math.abs(y - noteGesture.y) > 30) { const {id} = noteGesture, down = y > noteGesture.y; noteGesture = null; setNoteExpanded(id, down); }
  }, {passive: true});
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
  let barsPeekTimer = 0;
  screen.addEventListener('pointerdown', event => {
    if (!screen.classList.contains('kk-immersive')) return;
    const rect = screen.getBoundingClientRect(), y = event.clientY - rect.top;
    if (y > 24 && y < rect.height - 24) return;
    screen.classList.add('kk-bars-peek'); clearTimeout(barsPeekTimer);
    barsPeekTimer = setTimeout(() => screen.classList.remove('kk-bars-peek'), 3000);
  }, true);
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    LP.module('messaging').contextmenu(event);
    LP.module('google-search').contextmenu(event);
    if (!dragState && ui.view === 'home' && !ui.overlay && !ui.overview && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overview = true; render(); }
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
  // Magnification gestures (Settings > Accessibility): a triple tap (taps within the 300 ms double-tap timeout) zooms
  // everything but the navigation bar to ScreenMagnifier's default 2x around the tap, inside magnified_region_frame;
  // another triple tap zooms out. Two-finger drags (a trackpad scroll or the mouse wheel) pan, a pinch (ctrl + wheel)
  // changes the scale between 1 and 5.
  let magnifyTaps = [];
  function applyMagnification() {
    const m = ui.magnify;
    screen.classList.toggle('magnified', !!m);
    for (const child of screen.children) {
      if (child.id === 'nav-bar' || child.tagName.toLowerCase() === 'svg' || child.classList.contains('magnify-frame')) continue;
      child.style.transformOrigin = m ? '0 0' : '';
      child.style.transform = m ? `translate(${m.tx + (m.s - 1) * child.offsetLeft}px, ${m.ty + (m.s - 1) * child.offsetTop}px) scale(${m.s})` : '';
    }
    if (m && !screen.querySelector('.magnify-frame')) screen.insertAdjacentHTML('beforeend', '<i class="magnify-frame" aria-hidden="true"></i>');
    if (!m) screen.querySelector('.magnify-frame')?.remove();
  }
  const magnifyClamp = m => { const w = screen.clientWidth, h = screen.clientHeight; m.tx = Math.min(0, Math.max(w * (1 - m.s), m.tx)); m.ty = Math.min(0, Math.max(h * (1 - m.s), m.ty)); return m; };
  screen.addEventListener('pointerdown', event => {
    if (!data.settings.magnification || event.button) { magnifyTaps = []; return; }
    const r = screen.getBoundingClientRect(), k = screen.clientWidth / r.width, x = (event.clientX - r.left) * k, y = (event.clientY - r.top) * k, now = performance.now();
    const last = magnifyTaps[magnifyTaps.length - 1];
    if (last && (now - last.time > 300 || Math.hypot(last.x - x, last.y - y) > dp(44))) magnifyTaps = [];
    magnifyTaps.push({time: now, x, y});
    if (magnifyTaps.length < 3) return;
    magnifyTaps = [];
    ui.magnify = ui.magnify ? null : magnifyClamp({s: 2, tx: -x, ty: -y});
    applyMagnification(); event.stopPropagation(); event.preventDefault(); suppressReleaseClick();
  }, true);
  screen.addEventListener('wheel', event => {
    if (!ui.magnify) return;
    event.preventDefault();
    const m = ui.magnify, r = screen.getBoundingClientRect(), k = screen.clientWidth / r.width;
    if (event.ctrlKey) { const x = (event.clientX - r.left) * k, y = (event.clientY - r.top) * k, s = Math.min(5, Math.max(1, m.s * Math.exp(-event.deltaY * 0.01))); m.tx = x - (x - m.tx) * s / m.s; m.ty = y - (y - m.ty) * s / m.s; m.s = s; }
    else { m.tx -= event.deltaX * k; m.ty -= event.deltaY * k; }
    magnifyClamp(m); applyMagnification();
  }, {passive: false});
  function suppressReleaseClick() {
    suppressClickUntil = Infinity;
    window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
    window.addEventListener('pointercancel', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
  }
  /* AppWidgetResizeFrame: handles grow or shrink the span in whole cells (66% threshold) between the provider's
     minimum resize span and the grid; neighbours move aside with the reorder solver and the result persists. */
  let resizeState = null;
  screen.addEventListener('pointerdown', event => {
    const handle = event.target.closest('[data-resize-edge]');
    if (!handle) {
      if (ui.resizeWidget && ui.view === 'home' && !event.target.closest('[data-resize-frame]')) { ui.resizeWidget = null; viewport.querySelectorAll('.home-widget.resizing').forEach(node => { node.classList.remove('resizing'); node.querySelector('[data-resize-frame]')?.remove(); }); }
      return;
    }
    event.preventDefault(); event.stopPropagation();
    const widget = data.homeWidgets[ui.page].find(item => item.id === ui.resizeWidget), metrics = gridMetrics();
    if (!widget || !metrics) return;
    const span = widgetSize(widget);
    resizeState = {pointerId: event.pointerId, edge: handle.dataset.resizeEdge, x: event.clientX, y: event.clientY, widget, metrics, start: {x: widget.x, y: widget.y, w: span.width, h: span.height}, min: span.resize, rect: null, solution: null};
    try { screen.setPointerCapture(event.pointerId); } catch {}
  }, true);
  window.addEventListener('pointermove', event => {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    event.preventDefault();
    const r = resizeState, k = screen.getBoundingClientRect().width / screen.clientWidth || 1, dx = (event.clientX - r.x) / k, dy = (event.clientY - r.y) / k, start = r.start;
    let {x, y, w, h} = start;
    if (r.edge === 'right') w = JBLauncher.resizeSpan(start.w, dx, r.metrics.cellW, r.min.minWidth, 4 - start.x);
    if (r.edge === 'left') { w = JBLauncher.resizeSpan(start.w, -dx, r.metrics.cellW, r.min.minWidth, start.x + start.w); x = start.x + start.w - w; }
    if (r.edge === 'bottom') h = JBLauncher.resizeSpan(start.h, dy, r.metrics.cellH, r.min.minHeight, 4 - start.y);
    if (r.edge === 'top') { h = JBLauncher.resizeSpan(start.h, -dy, r.metrics.cellH, r.min.minHeight, start.y + start.h); y = start.y + start.h - h; }
    if (r.rect && r.rect.x === x && r.rect.y === y && r.rect.w === w && r.rect.h === h) return;
    // Shortcut cells under the new area must be able to move away, as in CellLayout.createAreaForResize.
    const list = JBLauncher.items(data.homePages[ui.page], data.homeWidgets[ui.page], widgetSize);
    const solution = JBLauncher.solve(list, {key: `w${r.widget.id}`, x, y, w, h}, [Math.sign(dx), Math.sign(dy)]);
    if (!solution) return;
    r.rect = {x, y, w, h}; r.solution = solution;
    const node = reorderElement(`w${r.widget.id}`);
    if (node) node.style.gridArea = `${y + 1} / ${x + 1} / span ${h} / span ${w}`;
    showReorder(solution);
  });
  const endResize = event => {
    if (!resizeState || event.pointerId !== resizeState.pointerId) return;
    const r = resizeState; resizeState = null;
    if (r.rect && r.solution) {
      data.homePages[ui.page] = JBLauncher.apply(data.homePages[ui.page], data.homeWidgets[ui.page], r.solution.moves);
      Object.assign(r.widget, {x: r.rect.x, y: r.rect.y, width: r.rect.w, height: r.rect.h}); save();
    }
    suppressClickUntil = Date.now() + 350; render();
  };
  window.addEventListener('pointerup', endResize); window.addEventListener('pointercancel', endResize);
  const activeTouches = new Set();
  window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') activeTouches.add(event.pointerId); }, true);
  for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => activeTouches.delete(event.pointerId), true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    // Lists scroll by mouse drag in lp-scroll.js (OverScroller fling, EdgeEffect); only the widget picker keeps this one.
    const scrollTarget = widgetList || null;
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), qsPullEligible: ui.overlay === 'shade' && !ui.shadeSettings && !!event.target.closest('.lp-shade') && !event.target.closest('.lp-note,input') && !(overlayRoot.querySelector('.lp-shade-scroll')?.scrollTop > 0), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    // PanelView.schedulePeek: a finger resting on the status bar for ViewConfiguration.TAP_TIMEOUT (100 ms) peeks the panel.
    if (pointerStart.shadeDragEligible && !reducedMotion?.matches) pointerStart.peekTimer = setTimeout(() => startPeek(), 100);
    const qsToggle = ui.overlay === 'shade' ? event.target.closest('[data-qs-toggle]') : null;
    if (qsToggle) homeLongPressTimer = setTimeout(() => { const key = qsToggle.dataset.qsToggle; data.settings[key] = !data.settings[key]; if (data.settings[key]) data.settings.airplane = false; if (key === 'wifi' && data.settings.wifi) data.settings.portableHotspot = false; save(); renderStatus(); renderOverlay(); pointerStart = null; suppressReleaseClick(); }, holdDelay(500));
    if (ui.view === 'home' && event.target.closest('.lp-cling .cling-shade')) homeLongPressTimer = setTimeout(() => { data.clings.workspace = true; save(); LauncherClings.dismiss(clingLayerRoot().querySelector('[data-cling="workspace"]'), () => { ui.overview = true; render(); }); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    if (ui.view === 'home' && !ui.overlay && !ui.overview && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overview = true; render(); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    LP.module('messaging').pointerdown(event);
    if (LP.module('wallpaper-picker').pointerdown(event)) return;
    LP.module('google-search').pointerdown(event);
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    LP.module('calculator').pointerdown(event);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), holdDelay(440));
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > dp(9)) { clearTimeout(homeLongPressTimer); LP.module('calculator').cancelHold(); clearTimeout(messageHoldTimer); }
    // The wallpaper strip scrolls sideways under a mouse drag as it would under a finger.
    if (LP.module('wallpaper-picker').pointermove(event, dx)) return;
    if (LP.module('calculator').pointermove(event, dx, dy)) return;
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > dp(13) && Math.abs(dx) > Math.abs(dy) * 1.1)) {
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
      if (recentCard.classList.contains('lp-task')) {
        /* Recents' SwipeHelper (TaskStackViewTouchHandler): only translationX follows the finger, on top of the card's
           stack transform, and setMinAlpha(1f) keeps the card opaque. The velocity feeds the fling test on release. */
        const now = performance.now(), last = pointerStart.swipe;
        if (last && now > last.t) { const k = Math.min(1, (now - last.t) / 50); pointerStart.swipeV = mixVelocity(pointerStart.swipeV, (dx - last.dx) / (now - last.t) * 1000, k); pointerStart.swipeVy = mixVelocity(pointerStart.swipeVy, (dy - last.dy) / (now - last.t) * 1000, k); }
        pointerStart.swipe = {dx, dy, t: now};
        recentCard.style.transition = 'none';
        recentCard.style.translate = `${dx}px 0`;
        return;
      }
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
    }
    if (LP.module('clock').pointermove(event, dx, dy)) return;
    if (LP.module('calendar').pointermove(event, dx, dy)) return;
    if (LP.module('photos').pointermove(event, dx, dy)) return;
    if (pointerStart.lockDrag) { event.preventDefault(); pointerStart.lockActive = lockMove(dx, dy); return; }
    // NotificationPanelView: pulling down again on the open panel expands Quick Settings.
    if (pointerStart.qsPullEligible && !ui.shadeSettings && dy > dp(40) && dy > Math.abs(dx)) { ui.shadeSettings = true; ui.qsDetail = ''; renderOverlay(); suppressClickUntil = Date.now() + 350; pointerStart.qsPullEligible = false; pointerStart.qsPulled = true; return; }
    if (pointerStart.qsPulled) return;
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && dy < -dp(9) && -dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) {
        clearTimeout(pointerStart.peekTimer); pointerStart.shadeDragging = true;
        if (ui.shadePeek) {
          // The finger moved during the peek: tracking continues from the height the peek reached.
          const peeking = overlayRoot.querySelector('.notification-shade'); ui.shadePeek = false; ui.peekCollapse = false;
          if (peeking) { if (peeking._lpAnim) cancelAnimationFrame(peeking._lpAnim); pointerStart.shadeFrom = peeking.offsetHeight - dy; }
        } else { if (ui.overlay !== 'shade') ui.shadeSettings = activeTouches.size >= 2; ui.overlay = 'shade'; renderOverlay(); }
        try { screen.setPointerCapture(event.pointerId); } catch {}
      }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) {
        // PanelView.setExpandedHeight follows the finger (an open panel starts from its full height); the fling on
        // release is handled below.
        const now = performance.now(), max = screen.clientHeight - shade.offsetTop - navRoot.offsetHeight;
        if (pointerStart.shadeLast) { const dt = now - pointerStart.shadeLast.t; if (dt > 0) pointerStart.shadeVelocity = (event.clientY - pointerStart.shadeLast.y) / dt * 1000; }
        pointerStart.shadeLast = {t: now, y: event.clientY};
        if (pointerStart.shadeFrom === undefined) pointerStart.shadeFrom = pointerStart.shadeCloseEligible ? shade.offsetHeight && LPShade.maxHeight(shade) : 0;
        LPShade.expand(shade, Math.max(0, Math.min(max, pointerStart.shadeFrom + dy)), overlayRoot.querySelector('.lp-shade-scrim'));
      }
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
    // A sideways drag in the drawer turns its page however slowly it starts, also from an icon (PagedView takes the
    // gesture past the touch slop, before the long press); the mouse's quick drag to the home screen is a vertical one.
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal) && !(pointerStart.drawerSwipeEligible && horizontal)) startDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    clearTimeout(pointerStart.peekTimer);
    // A tap on the status bar (PanelView.collapse during a peek): the panel peeks, then collapses (mCollapseAfterPeek).
    if (pointerStart.shadeDragEligible && !pointerStart.shadeDragging && !reducedMotion?.matches) {
      if (!ui.shadePeek) startPeek();
      if (ui.shadePeek) { ui.peekCollapse = true; if (ui.peekDone) closePeek(); }
      suppressClickUntil = Date.now() + 350; pointerStart = null; return;
    }
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); LP.module('calculator').cancelHold(); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (LP.module('wallpaper-picker').pointerup()) return;
    if (LP.module('clock').pointerup(event, dx)) return;
    if (LP.module('play-store').pointerup(event, dx, dy)) return;
    if (LP.module('calendar').pointerup(event, dx)) return;
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(33)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (LP.module('photos').pointerup(event, dx)) return;
    if (LP.module('calculator').pointerup(dx)) return;
    if (pointerStart.drawerSwiping) { finishDrawerPage(dx); pointerStart = null; return; }
    if (pointerStart.recentSwiping) {
      const card = pointerStart.target.closest('.recent-item, .notification');
      if (card?.classList.contains('lp-task')) {
        /* SwipeHelper.endSwipe: dismiss when dragged past 0.6 of the display width or flung faster than 100 dp/s along the
           drag; dismissChild flies linearly to the display width (75 ms, or the fling's time up to 150 ms), snapChild
           returns in 250 ms with linear_out_slow_in. */
        const width = screen.clientWidth, recent = pointerStart.swipe && performance.now() - pointerStart.swipe.t < 100;
        const v = recent ? pointerStart.swipeV || 0 : 0, vy = recent ? pointerStart.swipeVy || 0 : 0;
        const fast = Math.abs(v) > 100 * LPRecents.DP() && Math.abs(v) > Math.abs(vy) && (v > 0) === (dx > 0), far = Math.abs(dx) > .6 * width;
        if (fast || far) {
          const velocity = fast ? v : 0, target = velocity < 0 || (!velocity && dx < 0) ? -width : width;
          const duration = velocity ? Math.min(150, Math.abs(target - dx) * 1000 / Math.abs(velocity)) : 75;
          card.style.transition = `translate ${duration.toFixed(0)}ms linear`; card.style.translate = `${target}px 0`;
          const id = card.dataset.app;
          setTimeout(() => lp.removeRecentTask(id), duration);
        } else {
          card.style.transition = 'translate .25s cubic-bezier(0,0,.2,1)'; card.style.translate = '';
        }
        suppressClickUntil = Date.now() + 350;
        pointerStart = null; return;
      }
      if (card) {
        card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
        if (Math.abs(dx) > dp(61)) {
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
    if (pointerStart.qsPulled) { pointerStart = null; return; }
    if (pointerStart.shadeDragging) {
      suppressClickUntil = Date.now() + 350;
      // PanelView.onTrackingStopped: a fling decides by its direction, a slow release by the half-way point.
      const shade = overlayRoot.querySelector('.notification-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
      const velocity = pointerStart.shadeVelocity || 0, height = shade ? shade.offsetHeight : 0, full = shade ? LPShade.maxHeight(shade) : 0;
      const close = Math.abs(velocity) > 400 * LPShade.DP() ? velocity < 0 : height < full / 2;
      if (close) { closingVelocity = Math.abs(velocity); ui.overlay = ''; renderOverlay(); }
      else if (shade) LPShade.animate(shade, height, full, {velocity: Math.max(0, velocity), scrim, done: () => LPShade.settle(shade, scrim)});
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      const active = lockMove(dx, dy);
      if (!active && Math.hypot(dx, dy) > dp(7)) suppressClickUntil = Date.now() + 350;
      lockRelease(active);
      pointerStart = null; return;
    }
    if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.swiping || pointerStart.pageSwipeEligible && !dragState && Math.abs(dx) > dp(50) && Math.abs(dx) > Math.abs(dy) && (!pointerStart.source || pointerStart.source.type === 'home' && performance.now() - pointerStart.downTime < 260)) {
      finishHomePage(dx); pointerStart = null; return;
    }
    if (!dragState && pointerStart?.source && !['drawer', 'drawer-widget'].includes(pointerStart.source.type) && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > dp(10)) startDrag(event.clientX, event.clientY);
    if (finishDrag(event.clientX, event.clientY)) { pointerStart = null; return; }
    if (!pointerStart) return;
    if (ui.overlay === 'shade' && pointerStart.target.closest('.notification') && Math.abs(dx) > dp(61)) { const id = Number(pointerStart.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); pointerStart = null; return; }
    if (!ui.overlay && pointerStart.target.closest('#status-bar') && dy > dp(50)) { ui.overlay = 'shade'; renderOverlay(); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { LP.module('calculator').pointercancel(); clearTimeout(messageHoldTimer); clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); if (ui.extraScreen) { stripEmptyScreens(); save(); if (ui.view === 'home') render(); } setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if (LP.module('photos').keydown(event)) return;
    if (event.target.matches?.('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (ui.view === 'calculator' && StoreHost.key(event, storeContext())) return;
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });
  /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
     Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
  function coldBoot() {
    if (!AndroidBoot.shouldBoot('5.1.1')) return;
    const booted = AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
    const finish = lp.bootUp(false, booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); suppressClickUntil = Date.now() + 350; booted.then(finish); };
    const off = () => { lp.powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    lp.powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
  }
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
    if (!confirm(i18n.t('Reset all local Lollipop simulator data?'))) return;
    resetSimulator();
  });
  let lastWidgetMinute = '';
  setInterval(() => {
    const cpu = screen.querySelector('.dev-cpu'); if (cpu) JBDeveloperOptions.updateCpu(cpu);
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && data.settings.sleep>0&&Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lockScreen();lastActivity=Date.now();}
    if(ui.activeCall){
      const dialing=Date.now()<ui.activeCall.connected;
      const elapsed=viewport.querySelector('.incall-elapsed'),state=viewport.querySelector('.incall-state');
      if(elapsed)elapsed.textContent=dialing?'':ICSPhoneCall.duration(ICSPhoneCall.elapsed(ui.activeCall));
      if(state)state.textContent=i18n.t(ICSPhoneCall.stateLabel(ui.activeCall))||'';
    }
    lp.checkAlarms(now);
    lp.checkTimers();
    // Interruptions: the end of a countdown, alarm or downtime condition, and Downtime's autotrigger.
    if (LPZen.tick(data.settings, now.getTime(), nextAlarmTime())) { save(); renderStatus(); if (ui.view === 'settings' && ui.sub === 'zen' && !ui.overlay) render(); }
    LP.module('dream').clockTick();
    lp.checkReminders(now);
    LP.module('photos').clockTick();
    const deskTime=document.querySelector('.desk-time');
    if(deskTime) {
      deskTime.textContent=now.toLocaleTimeString(i18n.locale(),{hour:'2-digit',minute:'2-digit',hour12:!data.settings.hour24});
      document.querySelector('.desk-date').textContent=now.toLocaleDateString(i18n.locale(),{weekday:'long',month:'long',day:'numeric'});
    }
    document.querySelectorAll('.analog-clock').forEach(node => {
      node.setAttribute('aria-label', clock());
      node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
      node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
    });
    const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    const kgClock = viewport.querySelector('.jbk-clock'); if (kgClock && !pointerStart) { const hour24 = !!data.settings.hour24; kgClock.firstChild.textContent = now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''); }
    lp.tickMusic();
    const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
    if (minute(now) !== lastWidgetMinute) {
      lastWidgetMinute = minute(now);
      if (ui.view === 'home' && !ui.overlay && !pointerStart && !dragState && viewport.querySelector('.calw')) render();
    }
  }, 1000);

  // lp:kernel (the core's bindings the lp-*.js modules use, live; written by the migration's move tool)
  LP.kernel({
    get addNotification() { return addNotification; }, get appIcon() { return appIcon; },
    get applyMagnification() { return applyMagnification; }, get appNames() { return appNames; },
    get apps() { return apps; }, get captureRecentView() { return captureRecentView; },
    get chromeText() { return chromeText; }, get clearAppData() { return clearAppData; },
    get clock() { return clock; }, get clone() { return clone; }, get contact() { return contact; },
    get data() { return data; }, set data(v) { data = v; }, get defaultData() { return defaultData; },
    get deviceDate() { return deviceDate; }, get dp() { return dp; }, get emailData() { return emailData; },
    get headsUp() { return headsUp; }, get HOLD_NAMES() { return HOLD_NAMES; },
    get holdDelay() { return holdDelay; }, get home() { return home; },
    get homeLongPressTimer() { return homeLongPressTimer; }, set homeLongPressTimer(v) { homeLongPressTimer = v; },
    get i18n() { return i18n; },
    get lastActivity() { return lastActivity; }, set lastActivity(v) { lastActivity = v; },
    get lockControls() { return lockControls; }, get lockScreen() { return lockScreen; },
    get LP_PRIMARY() { return LP_PRIMARY; }, get LP_STATUS_COLORS() { return LP_STATUS_COLORS; },
    get messageHoldTimer() { return messageHoldTimer; }, set messageHoldTimer(v) { messageHoldTimer = v; },
    get navRoot() { return navRoot; }, get nextAlarmLabel() { return nextAlarmLabel; },
    get nextAlarmTime() { return nextAlarmTime; }, get openApp() { return openApp; },
    get overlayRoot() { return overlayRoot; }, get placeShortcut() { return placeShortcut; },
    get pointerStart() { return pointerStart; }, set pointerStart(v) { pointerStart = v; },
    get reducedMotion() { return reducedMotion; }, get render() { return render; },
    get renderOverlay() { return renderOverlay; }, get renderStatus() { return renderStatus; },
    get REPLIES() { return REPLIES; }, get resetSimulator() { return resetSimulator; }, get safe() { return safe; },
    get save() { return save; }, get screen() { return screen; }, get snapResting() { return snapResting; },
    get storeAppsSync() { return storeAppsSync; }, get storeContext() { return storeContext; },
    get suppressClickUntil() { return suppressClickUntil; }, set suppressClickUntil(v) { suppressClickUntil = v; },
    get suppressReleaseClick() { return suppressReleaseClick; }, get syncBrowserState() { return syncBrowserState; },
    get toast() { return toast; }, get today() { return today; }, get tracks() { return tracks; },
    get ui() { return ui; }, get updateBarMode() { return updateBarMode; }, get viewport() { return viewport; },
    get wallpaperFiles() { return wallpaperFiles; }, get wifiNetworks() { return wifiNetworks; }
  });
  // lp:kernel-end
  LP.start();

  i18n.translateDOM(document.body);
  render();
  coldBoot();
})();
