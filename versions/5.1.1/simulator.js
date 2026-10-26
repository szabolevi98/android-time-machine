/* Android 5.1.1 Lollipop browser simulation (Nexus 6, LMY48Y). No network or Android runtime required. */
(() => {
  'use strict';

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
    calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1, phoneTab: 'dialpad',
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
  // Play Music, Movies & TV, Books and Games (play-apps.js).
  const PLAY_APPS = ['play-music', 'play-movies', 'play-books', 'play-games'];
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
  function placeContactShortcut(person) { if (person) placeShortcut(`contact:${person.id}`, person.name); }
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
  /* Settings 5.1 toolbar (Widget.Material.Light.ActionBar.Solid on colorPrimary #263238): the up arrow
     (ic_ab_back_material) on sub-screens, the 20 sp title 16 dp in (72 dp after the arrow). */
  const actionbar = (title, right = '') => ui.view === 'settings'
    ? `<div class="actionbar lp-toolbar">${ui.sub ? `<button class="up" data-action="back" aria-label="${safe(i18n.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button>` : ''}<h2>${safe(title)}</h2>${right}</div>`
    : `<div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(title)}</h2>${right}</div>`;
  // Material controls in place of the Holo checkbox and radio images, for every Settings screen and dialog.
  const materialControls = html => html.replace(/class="holo-switch/g, 'class="lp-mswitch').replace(/<img class="holo-checkbox" src="assets\/btn_check_(on|off)_holo_dark\.png" alt="">/g, (_, on) => `<span class="lp-check${on === 'on' ? ' on' : ''}" aria-hidden="true"></span>`).replace(/<img class="holo-radio" src="assets\/btn_radio_(on|off)_holo_dark\.png" alt="">/g, (_, on) => `<span class="lp-radio${on === 'on' ? ' on' : ''}" aria-hidden="true"></span>`);
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const SESSION_START = Date.now();
  const appView = (title, inner, theme = '', right = '') => ui.view === 'settings'
    ? materialControls(`<div class="app-view settings-app lp-settings ${!ui.sub ? 'settings-main' : ''}">${actionbar(title, right)}${content(inner, `settings-light ${theme}`)}</div>`)
    : `<div class="app-view">${actionbar(title, right)}${content(inner, theme)}</div>`;
  /* SwitchBar (Settings 5.1): the "On" / "Off" bar under the toolbar of Wi-Fi, Bluetooth and the other master
     switches, #37474F with the white 20 sp label and a Material switch. */
  const switchBar = (key, on = !!data.settings[key]) => `<div class="lp-switchbar"><span>${safe(i18n.t(on ? 'On' : 'Off'))}</span>${connectivitySwitch(key, i18n.t(on ? 'On' : 'Off'))}</div>`;
  const overflowButton = id => `<button class="lp-ab-overflow" data-action="lp-settings-menu" data-id="${id}" aria-label="${safe(i18n.t('More options'))}"><img src="assets/lp-fw-ic_menu_moreoverflow_material.svg" alt=""></button>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development','nfc-payment','print'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const LOCATION_MODES = {high: ['High accuracy', 'Use GPS, Wi‑Fi, and mobile networks to determine location'], battery: ['Battery saving', 'Use Wi‑Fi and mobile networks to determine location'], device: ['Device only', 'Use GPS to determine your location']};
  const locationMode = () => data.settings.gps && data.settings.networkLocation ? 'high' : data.settings.gps ? 'device' : 'battery';
  // Plain 4.3 preference rows (no icon or chevron); rows without their own screen explain that in a toast.
  // Accessibility texts from the image's Settings (stock-strings.js).
  const A11Y = key => { const row = window.StockStrings?.a11y?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); };
  // Touch & hold delay: Settings' long_press_timeout_selector values (500 / 1000 / 1500 ms); the simulator's own
  // long-press timers stretch by the same amount.
  const HOLD = [500, 1000, 1500], HOLD_NAMES = ['Short', 'Medium', 'Long'];
  const holdDelay = ms => ms + (HOLD[data.settings.longPressTimeout || 0] - 500);
  const prefRow = (title, summary, action = 'dev-info', id = '') => `<button class="settings-row wireless-row" data-action="${action}" data-id="${safe(id || title)}"><span class="row-copy">${safe(i18n.t(title))}${summary ? `<small>${safe(i18n.t(summary))}</small>` : ''}</span></button>`;
  const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
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
    screen.style.setProperty('--lp-sb', ui.view === 'youtube' && ['search', 'results'].includes(ui.sub) ? '#d9d9d9' : ui.sub === 'chrome-settings' && ['chrome', 'browser'].includes(ui.view) ? '#161e21' : ui.view === 'wallet' ? LPExtraApps.walletStatus(ui) : ui.view === 'play-store' && window.JBPlay?.statusColor ? JBPlay.statusColor(jbPlayContext()) : LP_STATUS_COLORS[ui.view] || LPExtraApps.COLORS[ui.view]?.[1] || '#000');
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
    if(ui.view!=='keep')window.KeepMore?.leave(ui);
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
    const newsRoot=viewport.querySelector('[data-news-sections]');
    if(ui.newsSectionsHook&&ui.newsSectionsHook.root!==newsRoot){ui.newsSectionsHook.destroy();ui.newsSectionsHook=null;}
    if(newsRoot&&!ui.newsSectionsHook)ui.newsSectionsHook={...NewsSections.attach(newsRoot,newsSectionsContext()),root:newsRoot};
    const fitRoot=viewport.querySelector('[data-fit-more]');
    if(ui.fitMoreHook&&ui.fitMoreHook.root!==fitRoot){ui.fitMoreHook.destroy();ui.fitMoreHook=null;}
    if(fitRoot&&!ui.fitMoreHook)ui.fitMoreHook={...FitMore.attach(fitRoot,fitContext()),root:fitRoot};
    if (ui.jbcam && !viewport.querySelector('[data-gcam]')?.isSameNode(ui.jbcam.root)) { ui.jbcam.destroy(); ui.jbcam = null; }
    const camRoot = viewport.querySelector('[data-gcam]');
    if (camRoot && !ui.jbcam) ui.jbcam = {...LPCamera.attach(camRoot, {data, ui, t: key => i18n.t(key), media: ICSMedia, save, render, shoot: cameraShoot, gallery: cameraGallery, toast, reduced: !!reducedMotion?.matches}), root: camRoot};
    // PlatLogoActivity; after five taps a long press records Settings.System.EGG_MODE and starts LLand.
    if (ui.lpEgg && !viewport.querySelector('[data-lp-platlogo]')?.isSameNode(ui.lpEgg.root)) { ui.lpEgg.destroy(); ui.lpEgg = null; }
    const eggRoot = viewport.querySelector('[data-lp-platlogo]');
    if (eggRoot && !ui.lpEgg) ui.lpEgg = LPEgg.platLogo(eggRoot, {reduced: !!reducedMotion?.matches, onLand: () => { data.settings.eggMode = data.settings.eggMode || Date.now(); save(); suppressReleaseClick(); ui.sub = 'lland'; render(); }});
    if (ui.lland && !viewport.querySelector('[data-lp-lland]')?.isSameNode(ui.lland.root)) { ui.lland.stop(); ui.lland = null; }
    const landRoot = viewport.querySelector('[data-lp-lland]');
    if (landRoot && !ui.lland) requestAnimationFrame(() => { if (landRoot.isConnected && !ui.lland) { ui.lland = LPEgg.land(landRoot, {vibrate: ms => navigator.vibrate?.(ms)}); landRoot.focus({preventScroll: true}); } });
    if (ui.view === 'clock' && viewport.querySelector('.jbclock-app')) clockTicker();
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind) highlightBrowserText();
    if (ui.view === 'photos' && ui.sub === 'photo') attachPhotosSwipe();
    if (ui.view === 'hangouts' && ui.hgPage === 'add') HangoutsPrefs.mount(viewport, ui, render);
    if (ui.view === 'photos' && ui.sub === 'sphere') LPSphere.attachViewer(viewport);
    if (ui.view === 'photos' && ui.sub === 'refocus' && ui.refocusEdit) { const photo = PhotosApp.list(photosContext())[ui.photosIndex]; if (photo) LPRefocus.attachViewer(viewport, {photo, edit: ui.refocusEdit, media: ICSMedia}); }
    if (ui.view === 'photos' && ui.sub === 'edit') PlusEditor.attach(viewport.querySelector('[data-pe-root]'), peContext());
    // VideoViewActivity's player (photos-video.js).
    if (ui.gpv && !viewport.querySelector('[data-gpv-root]')?.isSameNode(ui.gpv.root)) { ui.gpv.destroy(); ui.gpv = null; }
    const gpvRoot = viewport.querySelector('[data-gpv-root]');
    if (gpvRoot && !ui.gpv) { const photo = PhotosApp.list(photosContext())[ui.photosIndex]; if (photo) ui.gpv = {...GPVideo.attach(gpvRoot, {photo, ui, rerender: render, reduced: !!reducedMotion?.matches}), root: gpvRoot}; }
    if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=dp(8*48/.906);
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  const mixVelocity = (old, value, k) => old === undefined ? value : old + (value - old) * k;
  /* TaskStackView.onStackTaskRemoved: the front-most remaining task keeps its place (the stack scroll moves by as much
     as it would fall back) and the other cards glide to their new transforms in 200 ms
     (requestSynchronizeStackViewsWithModel(200), fast_out_slow_in). With no task left, onAllTaskViewsDismissed runs
     mFinishLaunchHomeRunnable: Home starts with recents_to_launcher_enter (150 ms linear fade in) under
     recents_to_launcher_exit (Recents fades out in 150 ms, linear_out_slow_in). */
  function removeRecentTask(id) {
    if (ui.overlay !== 'recent') return;
    const panel = overlayRoot.querySelector('.lp-recents'), tasks = [...ui.recent].reverse(), index = tasks.indexOf(id);
    if (index < 0) return;
    ui.recent = ui.recent.filter(item => item !== id);
    if (!ui.recent.length) {
      ui.lpRecents?.destroy(); ui.lpRecents = null; ui.recentsScroll = undefined;
      home(false); updateBarMode();
      if (panel?.animate && !reducedMotion?.matches) {
        panel.style.pointerEvents = 'none'; overlayRoot.append(panel);
        panel.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: 'cubic-bezier(0,0,.2,1)', fill: 'forwards'}).finished.then(() => panel.remove(), () => panel.remove());
        viewport.animate([{opacity: 0}, {opacity: 1}], {duration: 150, easing: 'linear'});
      }
      return;
    }
    const old = new Map([...(panel?.querySelectorAll('.lp-task') || [])].filter(card => !card.hidden).map(card => [card.dataset.app, card.style.transform]));
    const m = LPRecents.metrics(tasks.length), between = tasks.length > 1 ? m.progress[1] - m.progress[0] : 0;
    if (ui.recentsScroll !== undefined && index !== tasks.length - 1) ui.recentsScroll -= between;
    ui.recentsFrom = null;
    renderOverlay();
    const next = overlayRoot.querySelector('.lp-recents');
    if (!next) return;
    ui.recentsScroll = LPRecents.layout(next, ui.recentsScroll);
    if (reducedMotion?.matches) return;
    next.querySelectorAll('.lp-task').forEach(card => {
      const from = old.get(card.dataset.app);
      if (from && !card.hidden && from !== card.style.transform) card.animate([{transform: from}, {transform: card.style.transform}], {duration: 200, easing: 'cubic-bezier(.4,0,.2,1)'});
    });
  }
  // recents_return_to_launcher: Recents fades out while the launcher fades back in (250 ms).
  // Leaving Overview for home: the stack drops away (recents_task_exit_to_home_duration, 225 ms) as the launcher returns.
  function closeRecents() {
    const panel = overlayRoot.querySelector('.recent-panel'); ui.recentPopup = null; ui.recentsScroll = undefined;
    const done = () => { ui.overlay = ''; ui.lpRecents?.destroy(); ui.lpRecents = null; renderOverlay(); updateBarMode(); };
    if (!panel?.animate || reducedMotion?.matches) { done(); return; }
    LPRecents.exit(panel).then(done, done);
  }
  /* SearchPanelView: an upward swipe of navbar_search_up_threshhold (40dp) from the navigation bar shows the ring;
     releasing on the assist target starts search (the Google Search app on Google builds, Browser here). */
  // PointerLocationView: the bar at the top follows the primary pointer while the option is on.
  let pointerDownCount = 0;
  screen.addEventListener('pointerdown', event => { pointerDownCount++; if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, true, 1); }, true);
  screen.addEventListener('pointermove', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, event.buttons > 0, 1); }, true);
  window.addEventListener('pointerup', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, false, 1); }, true);
  let searchSwipe = null;
  const pinHeld = new Set(); let pinTimer = 0;
  navRoot.addEventListener('pointerdown', event => {
    if (!ui.pinned) return;
    const key = event.target.closest('.nav-back') ? 'back' : event.target.closest('.nav-recent') ? 'recent' : '';
    if (!key) return;
    pinHeld.add(key); clearTimeout(pinTimer);
    if (pinHeld.has('recent')) pinTimer = setTimeout(() => { if (pinHeld.has('recent')) { suppressClickUntil = Date.now() + 400; unpin(); } }, pinHeld.has('back') ? 500 : 1000);
  });
  window.addEventListener('pointerup', event => { pinHeld.clear(); clearTimeout(pinTimer); });
  window.addEventListener('pointercancel', () => { pinHeld.clear(); clearTimeout(pinTimer); });
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
  const dreams = [['clock', 'Clock'], ['colors', 'Colors'], ['photoframe', 'Photo Frame']];
  function renderDaydreamSettings() {
    const on = !!data.settings.daydream, current = data.settings.daydreamType || 'clock', when = data.settings.daydreamWhen || 'charging';
    const whenLabel = {charging: 'While charging', docked: 'While docked', either: 'Either'}[when];
    const list = dreams;
    return appView('Daydream', `${toggleRow('Daydream', on ? whenLabel : 'Off', 'daydream')}${on ? `${list.map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}${label('')}${row('Start now', '', 'dream-start', '')}${row('When to daydream', i18n.t(whenLabel), 'dream-when', '')}` : `<div class="detail-pad"><p>${safe(i18n.t('To control what happens when the phone is docked and/or sleeping, turn Daydream on.'))}</p></div>`}`);
  }
  // Dreams: DeskClock Screensaver (dimmed clock that moves every minute), SystemUI Colors and a photo slideshow.
  function renderDream() {
    const type = data.settings.daydreamType || 'clock', now = deviceDate();
    if (type === 'colors') return '<div class="jb-dream jb-dream-colors" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"></div>';
    if (type === 'photoframe') { const photo = data.photos[Math.floor(Date.now() / 6000) % Math.max(1, data.photos.length)]; return `<div class="jb-dream jb-dream-photo" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream">${photo ? `<img src="${ICSMedia.image(photo)}" alt="">` : ''}</div>`; }
    const time = now.toLocaleTimeString(i18n.locale(), {hour: data.settings.hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !data.settings.hour24}), [hours, rest = ''] = time.split(/[:.]/);
    const spot = Math.floor(Date.now() / 60000) % 4;
    return `<div class="jb-dream jb-dream-clock" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"><div class="jb-dream-saver" style="--spot:${spot}"><div class="jbclock-time"><span class="jbclock-hours">${safe(hours)}</span><span class="jbclock-minutes">:${safe(rest.replace(/\s?[^\d].*$/, ''))}</span></div><div class="jbclock-date">${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale()))}${nextAlarmLabel() ? ` <img src="assets/dc5-ic_alarm_small.png" alt="">${safe(nextAlarmLabel())}` : ''}</div></div></div>`;
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
      owner: data.settings.showOwner ? data.settings.ownerInfo : '', carrier: carrierName(), statusIcons: statusIndicators(),
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
    return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${carrierName()}</div></div>`;
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
  /* LivePicker's LiveWallpaperActivity (LivePickerTheme: Theme.Holo without a title): the LMY48Y image declares no
     WallpaperService at all, so the list shows its empty view, live_wallpaper_empty in textAppearanceMedium. */
  function renderLiveWallpapers() {
    return `<div class="app-view lp-lw-empty"><p>${safe(i18n.t('No live wallpapers.'))}</p></div>`;
  }
  function renderApp() {
    if (ui.view === 'phone' && LPDialerPrefs.PAGES.includes(ui.sub)) return LPDialerPrefs.render({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.sub === 'sim-import' && ['people', 'phone'].includes(ui.view)) return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    // Contacts to display, Customize and Settings (people-io.js).
    if (ui.view === 'people' && PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    switch (ui.view) {
      case 'play-store': return JBPlay.render(jbPlayContext());
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': return KKWallpaperPicker.render(wallpaperPickerContext());
      case 'kk-doc-picker': return LPDocPicker.render(docContext());
      case 'settings': return renderSettings();
      case 'chrome': return renderChrome();
      case 'photos': return PhotosApp.render(photosContext());
      case 'gmail': return renderGmail();
      case 'play-music': case 'play-movies': case 'play-books': case 'play-games': return PlayApps.render(playContext(ui.view));
      case 'google-search': case 'voice-search': case 'maps': case 'drive': case 'keep': case 'youtube': case 'google-plus': case 'earth': case 'news-weather': case 'google-settings': return StockApps.render(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), account: GmailApp.account});
      case 'phone': return renderPhone();
      case 'people': return renderPeople();
      case 'messaging': return renderMessaging();
      case 'hangouts': return Hangouts.render(data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
      case 'camera': return renderCamera();
      case 'calendar': return renderCalendar();
      case 'clock': return renderClock();
      case 'calculator': return renderCalculator();
      case 'email': return renderEmail();
      case 'docs': case 'sheets': case 'slides': case 'fit': case 'newsstand': case 'wallet': return LPExtraApps.render(ui.view, {files: officeFiles(), ui, data, t: key => i18n.t(key), locale: i18n.locale()});
      case 'downloads': return LPDownloads.render(data.downloads || [], ui, key => i18n.t(key), i18n.locale());
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if(!resume&&LPExtraApps.KIND[app]){ui.editorDrawer=false;ui.editorRefreshing=false;}
    // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
    if (!resume) { ui.camIntent = null; ui.mapsPrefs = null; ui.mpsDialog = null; ui.yt10Dialog = null; ui.lsPage = ''; ui.lsStack = []; ui.lsDialog = null; ui.driveFolder = ''; ui.driveFilter = ''; ui.driveNavItem = 'my'; ui.driveStack = []; ui.driveDialog = ''; ui.hgPage = ''; ui.hgStack = []; ui.hgDialog = ''; ui.lpmPage = ''; ui.mpoDialog = ''; ui.paStack = []; ui.paMore = ''; }
    if(ui.locked)return;
    if (app === 'news-weather' && !resume) { ui.newsWeb = ''; ui.newsDialog = ''; ui.newsExpanded = ''; }
    if (GEL_ALIASES[app]) app = GEL_ALIASES[app];
    if (!appNames[app]) return;
    if (app === 'chrome') useBrowserSession(app);
    if (app === 'email' || app === 'gmail') useMailApp(app);
    if (app === 'voice-search') setTimeout(listenVoice);
    if (app === 'keep' && !Array.isArray(data.keepNotes)) data.keepNotes = clone(defaultData.keepNotes);
    captureRecentView();
    // Wallet's warm welcome: the intro splash, then the pager (WarmWelcomeActivity.startIntroAnimation).
    if (app === 'wallet' && !resume) { ui.walPage = undefined; setTimeout(() => { if (ui.view === 'wallet' && ui.walPage == null) { ui.walPage = 0; render(); } }, 2000); }
    if (app === 'camera' && !resume) { ui.gcsPage = ''; ui.gcsDialog = ''; ui.gcamExposure = false; }
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; }
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(app === 'play-store' ? '.jbp-scroll' : ['messaging', 'hangouts'].includes(app) ? '.mms-scroll' : ['email', 'gmail'].includes(app) ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : app === 'chrome' ? '.chr-ntp-scroll,.chr-history,.chr-stack,.browser-page' : app === 'photos' ? '.ph-scroll' : StockApps.APPS.includes(app) ? '.sa-scroll,.gnow-scroll' : PLAY_APPS.includes(app) ? '.pa-scroll,.pm-queue' : '.app-view') || viewport.firstElementChild;
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
  // Maps directions and navigation (maps-route.js).
  function mrContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), root: viewport, save, render,
      focus: selector => selector && requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  // Drive's files as the apps change them (the editors, Drive).
  const officeFiles = () => data.driveFiles || StockApps.FILES;
  const fitContext=()=>({data,ui,locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,toast});
  const newsSectionsContext=()=>({data,ui,locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,toast,article:key=>StockApps.newsArticle(data,key),browser:url=>{openApp('chrome');navigateBrowser(url);}});
  const editorContext=()=>({data,ui,files:officeFiles(),locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,
    openDrive(){openApp('drive');},pick(){docPick(ui.view,EditorMore.ACCEPT[ui.view]);},shareText:driveShareText,shareFile:driveShareFile,
    shortcut(file){placeShortcut('office:'+file.id,file.name);}});

  // Screen pinning: the reminder toast, and unpinning (lock_to_app_exit, then the lock screen when it asks for the lock).
  function pinnedToast() { toast(i18n.t('To unpin this screen, touch and hold Back and Overview at the same time.')); }
  function unpin() {
    if (!ui.pinned) return;
    ui.pinned = null; updateBarMode(); toast(i18n.t('Screen unpinned'));
    const secure = ['pin', 'password', 'pattern'].includes(data.settings.screenLock);
    if (data.settings.pinExitLocked ?? secure) { lockScreen(); ui.sleeping = false; render(); }
  }
  // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
  const mapsPrefsContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
  // Advanced Wi-Fi's Install certificates (*-certinstall.js) and its dialogs.
  const certContext = () => ({ui, data, language: i18n.language, root: overlayRoot, save, toast: message => toast(message),
    open: () => { ui.overlay = 'cert-install'; renderOverlay(); overlayRoot.querySelector('[data-cert-name]')?.focus(); }, close: () => { ui.overlay = ''; renderOverlay(); },
    lockSettings: () => { ui.sub = 'security'; render(); }});
  const devContext = () => ({data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});
  const procStatsContext = () => ({data, ui, save, render, renderOverlay, toast: message => toast(message), language: i18n.language, locale: i18n.locale(), appIcon: id => `<img src="assets/${id}.png" alt="">`});
  const langContext = () => ({data, ui, root: viewport, language: i18n.language, locale: i18n.locale(), languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[i18n.language],
    save, render, renderOverlay, toast: message => toast(i18n.t(message)),
    openVoice: () => { openApp('google-search'); ui.sub = 'settings'; ui.lsStack = []; ui.lsPage = 'voice'; ui.lsDialog = null; ui.voiceFromSettings = true; render(); }});
  document.addEventListener('pointerdown', event => {
    const card = event.target.closest?.('[data-gnow-swipe]');
    if (!card || event.target.closest('button')) return;
    event.stopPropagation();
    const x = event.clientX, y = event.clientY, key = card.dataset.gnowSwipe;
    let dx = 0, moved = false;
    const move = ev => { dx = ev.clientX - x; if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(ev.clientY - y)) moved = true; if (moved) { card.style.translate = `${dx}px 0`; card.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / card.clientWidth)); } };
    const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
      if (moved && Math.abs(dx) > card.clientWidth * .4) { (data.nowDismissed ||= []).push(key); ui.gnowUndo = key; save(); render(); setTimeout(() => { if (ui.gnowUndo === key) { ui.gnowUndo = ''; render(); } }, 6000); }
      else { card.style.translate = ''; card.style.opacity = ''; } };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  }, true);
  const printContext = () => ({ui, data, root: overlayRoot, language: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), save, renderOverlay, toast: message => toast(i18n.t(message)), mime: name => LPDownloads.mime(name), saved: () => { if (ui.view === 'downloads') render(); }});
  const chromeText = key => AndroidStrings.pick(window.StockStrings?.chrome?.[key], i18n.locale(), key);
  function navigateBack() {
    if (ui.overlay === 'print') { const u = ui.print; if (u?.step === 'printers') { u.step = 'config'; renderOverlay(); } else if (u?.expanded) { u.expanded = false; renderOverlay(); } else { ui.print = null; ui.overlay = ''; renderOverlay(); } return; }
    if (ui.view === 'settings' && ui.sub.startsWith('lng-') && !ui.overlay && InputLanguage.back(langContext())) return;
    if (ui.view === 'google-search' && ui.voiceFromSettings && ui.sub === 'settings' && !ui.overlay && !(ui.lsStack || []).length) { ui.voiceFromSettings = false; openApp('settings'); ui.sub = 'language'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return; }
    if (ui.view === 'settings' && ui.sub.startsWith('dev-procstats') && !ui.overlay) { ui.sub = ui.sub === 'dev-procstats' ? 'development' : 'dev-procstats'; render(); return; }
    // Back in a capture request cancels it (RESULT_CANCELED).
    if (ui.view === 'camera' && ui.camIntent && !ui.overlay) { ui.camIntent.cancel(); return; }
    if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return; }
    if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return; }
    if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return; }
    if (ui.view === 'phone' && !ui.overlay && LPDialerPrefs.back(ui)) { render(); return; }
    if (ui.view === 'clock' && !ui.overlay && ClockPrefs.back(ui)) { render(); return; }
    if (ui.view === 'clock' && ui.sub === 'cities' && ui.cityQuery !== undefined && !ui.overlay) { ui.cityQuery = undefined; render(); return; }
    if (ui.view === 'google-settings' && GMSSettings.back(ui)) { render(); return; }
    // A pinned app keeps its first screen: Back stops there.
    if (ui.pinned && ui.view === ui.pinned && !ui.overlay && !ui.sub) { pinnedToast(); return; }
    if (ui.view === 'maps' && !ui.overlay && (ui.mapsRoute || ui.navRun) && MapsRoute.back(mrContext())) return;
    // News & Weather: a dialog, then the article page, then an expanded story.
    if(ui.view==='news-weather'&&!ui.overlay&&NewsSections.back(newsSectionsContext()))return;
    if(ui.view==='fit'&&!ui.overlay&&FitMore.back(fitContext()))return;
    if (ui.view === 'news-weather' && !ui.overlay && (ui.newsDialog || ui.newsWeb)) { if (ui.newsDialog) { ui.newsDialog = ''; ui.newsPick = undefined; } else ui.newsWeb = ''; render(); return; }
    if (ui.view === 'settings' && ['a11y-magnification', 'a11y-shortcut'].includes(ui.sub) && !ui.overlay) { ui.sub = 'accessibility'; render(); return; }
    if (ui.view === 'calendar' && ui.sub === 'calendar-settings' && !ui.overlay) { if (CalendarPrefs.back(ui) === 'leave') { ui.sub = ''; ui.calPref = ''; } render(); return; }
    if (ui.view === 'email' && ui.sub === 'em-settings' && !ui.overlay) { if (ui.emPrefList || ui.emPrefEdit) { ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); } else if (ui.emPref) ui.emPref = EmailPrefs.parent(ui.emPref); else ui.sub = ''; render(); return; }
    if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();return;}
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'camera' && LPCamera.back(ui)) { render(); return; }
    if (ui.view === 'camera' && (ui.gcamModes || ui.gcamOptions)) { ui.gcamModes = false; ui.gcamOptions = false; ui.gcamExposure = false; render(); return; }
    if (ui.view === 'live-wallpapers') { home(false); return; }
    if (ui.view === 'lock' && ui.kgBouncing) { ui.kgBouncing = false; ui.kgPending = null; lockControls.lock(); render(); return; }
    if (ui.view === 'lock') return;
    if(ui.view==='phone' && !ui.activeCall && ui.kkDialpad){ui.kkDialpad=false;ui.dial='';render();return;}
    if(ui.view==='phone' && !ui.activeCall && ['kk-history','kk-all'].includes(ui.sub)){ui.sub='';render();return;}
    if(ui.view==='phone' && !ui.activeCall && ui.sub==='call-detail'){ui.sub=ui.kkLogFrom||'';render();return;}
    if(ui.view==='phone' && !ui.activeCall && (ui.lpSearchOpen || (ui.phoneSearch||'').trim())){ui.phoneSearch='';ui.lpSearchOpen=false;render();return;}
    if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
    if (['docs', 'sheets', 'slides'].includes(ui.view) && ui.sub) { ui.sub = !['search', 'results'].includes(ui.sub) && ui.edFrom === 'results' ? 'results' : ''; ui.edFrom = ''; render(); return; }
    if (ui.view === 'drive' && ui.sub === 'file' && ui.driveFrom === 'results') { ui.sub = 'results'; ui.driveFrom = ''; render(); return; }
    if (ui.view === 'youtube' && !ui.overlay && LPYouTube.back(ytContext())) return;
    if (ui.view === 'google-search' && ui.sub === 'settings' && !ui.overlay && LPSearchPrefs.back(gsContext())) return;
    if (ui.view === 'youtube' && ui.sub === 'video' && ui.ytFrom === 'results') { ui.sub = 'results'; ui.ytFrom = ''; render(); return; }
    if (ui.gnowSpin) { ui.gnowSpin = ''; render(); return; }
    if (ui.gnowDraft || ui.gnowDialog) { ui.gnowDraft = null; ui.gnowDialog = ''; render(); return; }
    if(ui.view==='keep' && KeepMore.back(keepMoreContext()))return;
    if(ui.view==='settings' && ui.kpSyncReturn && ui.sub==='sync-google'){ui.kpSyncReturn=false;openApp('keep',true);ui.kpScreen='settings';render();return;}
    if(LPExtraApps.KIND[ui.view]&&ui.editorDrawer){ui.editorDrawer=false;render();return;}
    if (ui.view === 'keep' && ui.keepDialog) { ui.keepDialog = ''; render(); return; }
    if (StockApps.APPS.includes(ui.view) && ui.sub) { if (ui.view === 'keep') saveKeepNote(true); ui.sub = ''; render(); return; }
    // Play Books' reader: a dropdown, then the Display options popup, then Contents close before the reader does.
    if (ui.view === 'play-books' && ui.sub === 'reader' && (ui.bkSpin || ui.bkOptions || ui.bkToc)) { if (ui.bkSpin) ui.bkSpin = ''; else if (ui.bkOptions) ui.bkOptions = false; else ui.bkToc = false; render(); return; }
    if (ui.view === 'play-books' && ui.sub === 'reader') { ui.bkOptions = false; ui.bkToc = false; ui.bkSpin = ''; }
    // The Play apps' own pages (lp-play-more.js) go back to where they were opened.
    if (PLAY_APPS.includes(ui.view) && PlayMore.back(ui)) { render(); return; }
    if (PLAY_APPS.includes(ui.view) && ui.sub) { ui.sub = ui.sub === 'queue' ? 'player' : ui.sub === 'player' ? ui.paReturn || '' : ui.sub === 'album' && ui.paFromSearch ? 'search' : ''; if (ui.sub !== 'album') ui.paFromSearch = ui.sub === 'search' && ui.paFromSearch; ui.paBars = true; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'edit' && PlusEditor.back(peContext())) return;
    if (ui.view === 'photos' && ui.photosSpinner) { ui.photosSpinner = false; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'video') { ui.sub = 'photo'; ui.photosVideo = null; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'sphere') { ui.sub = 'photo'; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'refocus') { ui.refocusEdit = null; ui.sub = 'photo'; render(); return; }
    if (ui.view === 'photos' && Array.isArray(ui.photosSelect)) { ui.photosSelect = null; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'settings-backup') { ui.sub = 'settings'; render(); return; }
    if (ui.view === 'photos' && ui.sub === 'photo') photosSlideshowStop();
    if (ui.view === 'photos' && ui.sub) { ui.sub = ui.sub === 'photo' ? ui.photosReturn || '' : ui.sub === 'folder' ? 'folders' : ''; ui.photosChrome = true; render(); return; }
    if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return; }
    if(ui.view==='settings' && ['apn','operators','tether-help','device-admin','wifi-direct','wifi-display','location-mode'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security','wifi-direct':'wifi','wifi-display':'display','location-mode':'location'}[ui.sub];render();return;}
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc','language-pick'].includes(ui.sub)){ui.sub={'language-pick':'language','app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return; }
    if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return; }
    if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return; }
    if (ui.view === 'drawer' && ui.drawerWidgets) { ui.drawerWidgets = false; ui.drawerPage = 0; home(false); ui.overview = true; render(); return; }
    if (ui.view === 'home' && ui.overview) { ui.overview = false; render(); return; }
    if (ui.view === 'wallpaper-picker' && ui.wp?.checked?.length) { ui.wp.checked = []; wallpaperPickerRender(); return; }
    if (ui.view === 'kk-doc-picker') { if (LPDocPicker.back(docContext()) !== 'render') docReturn(); render(); return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    // Chrome settings: dialogs first, then the page, then back to the browser.
    // Gmail settings: the dialogs, then the pages, then back to the mail.
    if (ui.view === 'gmail' && ui.sub === 'gm-settings' && GmailApp.prefBack(ui, {data, root: viewport, toast})) { render(); return; }
    if (ui.view === 'gmail' && ui.sub === 'gm-settings') { if (ui.gmPrefList || ui.gmSignature !== undefined) { ui.gmPrefList = ''; ui.gmSignature = undefined; } else if (ui.gmPref === 'categories') ui.gmPref = 'account'; else if (ui.gmPref) ui.gmPref = ''; else ui.sub = ''; render(); return; }
    if (['browser', 'chrome'].includes(ui.view) && (ui.chromeClear || ui.chromeList || ui.chromePrefMenu || ui.chromeConfirm) && !ui.chromeClear?.busy) { ui.chromeClear = null; ui.chromeList = ''; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); return; }
    if (['browser', 'chrome'].includes(ui.view) && ui.sub === 'chrome-settings') { if (!ChromeApp.prefBack(ui)) ui.sub = ''; render(); return; }
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return; }
    if (['browser', 'chrome'].includes(ui.view) && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
    if (ui.view === 'settings' && ['about-sim', 'about-imei'].includes(ui.sub)) { ui.sub = 'about-status'; render(); return; }
    if (ui.view === 'settings' && ['easter', 'lland', 'about-status', 'about-legal'].includes(ui.sub)) { ui.sub = 'about'; render(); return; }
    if (ui.view === 'settings' && ui.sub?.startsWith('user:')) { ui.sub = 'users'; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-account') { ui.sub = 'sync-google'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return; }
    if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return; }
    // Hangouts' and Messenger's own pages (hangouts-prefs.js) step back through what opened them.
    if (ui.view === 'hangouts' && ui.hgPage) { HangoutsPrefs.back(ui); render(); return; }
    if (ui.view === 'messaging' && ui.lpmPage) { MessengerOptions.back(ui); render(); return; }
    // Drive's dialogs, folders and filters (lp-drive.js).
    if (ui.view === 'drive' && window.LPDrive && LPDrive.back(ui)) { render(); return; }
    if (ui.view === 'messaging' && ui.sub === 'archived') { ui.sub = ''; render(); return; }
    if (ui.view === 'hangouts' && ui.sub === 'archived') { ui.sub = ''; render(); return; }
    if (['messaging', 'hangouts'].includes(ui.view) && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return; }
    if (ui.view === 'clock' && ui.sub === 'cities') { ui.sub = ''; render(); return; }
    if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return; }
    if (ui.view === 'people' && ui.sub === 'detail' && ui.quickContactReturn) { const back = ui.quickContactReturn; ui.quickContactReturn = null; ui.view = back.view; ui.sub = back.sub; render(); return; }
    if (ui.view === 'people' && ui.peopleSearching) { ui.peopleSearching = false; ui.peopleQuery = ''; render(); return; }
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
  // Toast.LENGTH_SHORT (NotificationManagerService.SHORT_DELAY, 2 s) inside Animation.Toast: toast_enter fades in and
  // toast_exit fades out over config_longAnimTime (500 ms) with decelerate_quad / accelerate_quad.
  // The dialer's screens read the GoogleDialer rows keyed 'Phone|…' first (lp-strings.txt contexts).
  const phoneText = key => i18n.t(key, 'Phone');
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
  // The time zone picker's context: the language, the 12 / 24 hour clock, the instant now (the set time included) and
  // the Calendar's recent zones (preferences_recent_timezones).
  const tzpContext = () => ({lang: i18n.language, locale: i18n.locale(), hour24: !!data.settings.hour24, recents: data.calRecentTimezones || [],
    now: Date.now() + (data.settings.autoTime === false ? Number(data.settings.timeOffset) || 0 : 0)});
  // Re-renders the picker keeping the search field's focus and caret.
  function renderTzPicker(focus) {
    const input = overlayRoot.querySelector('[data-tzp-search]'), at = input && document.activeElement === input ? input.selectionStart : null;
    renderOverlay();
    const next = overlayRoot.querySelector('[data-tzp-search]');
    if (next && (focus || at !== null)) { next.focus(); const end = at ?? next.value.length; next.setSelectionRange(end, end); }
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
      const call = ui.activeCall ? `<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>` : '';
      const scroll = overlayRoot.querySelector('.lp-shade-scroll')?.scrollTop || 0;
      overlayRoot.innerHTML = '<div class="lp-shade-scrim" data-action="close-overlay"></div>' + LPShade.render({...data, notifications: data.notifications.map(decorateNotification)}, ui, key => i18n.t(key), {locale: i18n.locale(), clock: clock(), date: fullDate(), shortDate: shadeDate(), carrier: carrierName(), alarm: nextAlarmLabel(), statusIcons: statusIndicators(), networks: allWifiNetworks(), extra: call});
      const body = overlayRoot.querySelector('.lp-shade-scroll'); if (body) body.scrollTop = scroll;
      LPShade.playIcons(overlayRoot, reducedMotion?.matches ? null : ui.qsIconAnim);
      const opening = !ui.shadeAnimated;
      overlayRoot.querySelectorAll('.lp-shade,.lp-shade-scrim').forEach(node => { node.style.animation = 'none'; });
      ui.shadeAnimated = true;
      if (opening && !pointerStart?.shadeDragging && !ui.shadePeek && !reducedMotion?.matches) {
        const shade = overlayRoot.querySelector('.lp-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
        LPShade.animate(shade, 0, LPShade.maxHeight(shade), {scrim, done: () => LPShade.settle(shade, scrim)});
      }
    } else if (ui.overlay === 'dream') {
      overlayRoot.innerHTML = renderDream();
    } else if (ui.overlay === 'kdc-picker' && ui.kdcPicker) {
      overlayRoot.innerHTML = KKDeskClock.picker(ui.kdcPicker, {t: key => i18n.t(key), hour24: !!data.settings.hour24, accent: ui.kdcPicker.zen ? '#009688' : undefined});
    } else if (ui.overlay === 'kk-cast-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="kk-cast-enable" role="menuitemcheckbox" aria-checked="${!!data.settings.wifiDisplay}" class="kk-check-item">${safe(i18n.t('Enable wireless display'))}<img src="assets/btn_check_${data.settings.wifiDisplay ? 'on' : 'off'}_holo_dark.png" alt=""></button></div>`;
    } else if (ui.overlay === 'ldu-sort' || ui.overlay === 'ldu-overflow') {
      overlayRoot.innerHTML = LPDownloads.menu(ui.overlay.slice(4), ui, key => i18n.t(key));
    } else if (ui.overlay.startsWith?.('ldp-') && ui.docs) {
      overlayRoot.innerHTML = LPDocPicker.menu(ui.overlay.slice(4), docContext());
    } else if (ui.overlay === 'lp-zen-drop') {
      overlayRoot.innerHTML = LPZen.dropdown(ui.zenDrop, data.settings, key => i18n.t(key));
      // overlapAnchor: the list covers the preference, from its start padding.
      const anchor = viewport.querySelector(`[data-action="lp-zen-drop"][data-id="${ui.zenDrop}"]`), list = overlayRoot.querySelector('.lp-dropdown');
      if (anchor && list) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), frame = screen.getBoundingClientRect(), scale = frame.height / screen.offsetHeight || 1; list.style.top = `${Math.max(0, Math.min((a.top - box.top) / scale, screen.offsetHeight - list.offsetHeight))}px`; }
    } else if (ui.overlay === 'lp-zen-cond' && ui.zenCond) {
      overlayRoot.innerHTML = LPZen.conditionDialog(ui.zenCond, key => i18n.t(key));
    } else if (ui.overlay === 'lp-zen-days') {
      overlayRoot.innerHTML = LPZen.daysDialog(data.settings, key => i18n.t(key), i18n.locale());
    } else if (ui.overlay === 'kk-sms-app') {
      // SmsDefaultDialog-style list preference: the SMS-capable apps (only Messaging in AOSP).
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Default SMS app'))}"><h3>${safe(i18n.t('Default SMS app'))}</h3><button class="settings-row jb-dream-row" data-action="close-overlay" role="radio" aria-checked="true"><span class="row-copy">${safe(i18n.t('Messaging'))}</span><img class="holo-radio" src="assets/btn_radio_on_holo_dark.png" alt=""></button><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'dev-list') {
      overlayRoot.innerHTML = JBDeveloperOptions.dialog(ui.devList, data.settings, key => i18n.t(key), i18n.language);
    } else if (ui.overlay === 'a11y-hold') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(A11Y('Touch & hold delay'))}"><h3>${safe(A11Y('Touch & hold delay'))}</h3>${HOLD_NAMES.map((name, i) => `<button class="settings-row wireless-row" data-action="a11y-hold-pick" data-id="${i}" role="radio" aria-checked="${(data.settings.longPressTimeout || 0) === i}"><span class="row-copy">${safe(A11Y(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.longPressTimeout || 0) === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'dream-when') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('When to daydream'))}"><h3>${safe(i18n.t('When to daydream'))}</h3>${[['docked', 'While docked'], ['charging', 'While charging'], ['either', 'Either']].map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-when-pick" data-id="${id}" role="radio" aria-checked="${(data.settings.daydreamWhen || 'charging') === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.daydreamWhen || 'charging') === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
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
    } else if (ui.overlay.startsWith('lps-')) {
      overlayRoot.innerHTML = LPSecurity.overlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      overlayRoot.querySelector('[data-lps-pin]')?.focus();
    } else if (ui.overlay.startsWith('ps-')) {
      overlayRoot.innerHTML = ProcStats.overlay(procStatsContext());
    } else if (ui.overlay === 'lng-dialog') {
      overlayRoot.innerHTML = InputLanguage.overlay(langContext());
    } else if (ui.overlay === 'print') {
      overlayRoot.innerHTML = PrintSpooler.overlay(printContext());
    } else if (ui.overlay === 'chrome-a2hs') {
      // Chrome's Add to homescreen: the page's title in the Title field, Cancel / Add.
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog chr-a2hs" role="dialog" aria-label="${safe(chromeText('Add to homescreen'))}"><h3>${safe(chromeText('Add to homescreen'))}</h3><div class="chr-a2hs-row"><img src="assets/chr40-app_shortcut_icon.png" alt=""><input data-a2hs-title value="${safe(ui.a2hs?.title || '')}" placeholder="${safe(chromeText('Title'))}" aria-label="${safe(chromeText('Title'))}"></div><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(chromeText('Cancel'))}</button><button data-action="chrome-a2hs-add">${safe(chromeText('Add'))}</button></div></div>`;
    } else if (ui.overlay === 'cert-install') {
      overlayRoot.innerHTML = CertInstall.overlay(certContext());
    } else if(ui.overlay==='sx-dialog'){
      overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'search') {
      if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
    } else if (ui.overlay === 'recent') {
      ui.lpRecents?.destroy();
      const searchCard = `<div class="lp-qsb-card"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="lp-qsb-logo" src="assets/gnl-ic_searchbox_google.png" alt="Google"></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice Search'))}"><img class="lp-qsb-mic" src="assets/gnl-ic_mic_none.png" alt=""></button></div>`;
      overlayRoot.innerHTML = LPRecents.render(ui.recent, {names: appNames, icon: appIcon, snapshots: ui.recentSnapshots, colors: LP_PRIMARY, statusColors: LP_STATUS_COLORS, t: key => i18n.t(key), pin: !!data.settings.screenPinning, search: searchCard});
      const panel = overlayRoot.querySelector('.lp-recents');
      ui.lpRecents = LPRecents.attach(panel, {scroll: ui.recentsScroll, reduced: !!reducedMotion?.matches, from: ui.recentsFrom, elapsed: performance.now() - (ui.recentsAt || 0), onScroll: (value, end) => { ui.recentsScroll = value; if (end) suppressClickUntil = Date.now() + 300; }});
      if (ui.recentsScroll === undefined) ui.recentsScroll = LPRecents.layout(panel);
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale());
    } else if (ui.overlay === 'jbclock-cities-menu' || ui.overlay === 'cpref-main') {
      const items = ClockPrefs.menu(ui.overlay === 'cpref-main' ? 'main' : 'cities', {data, t: key => i18n.t(key), locale: i18n.locale(), tab: jbClockState().tab});
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu">${items.map(([action, id, label]) => `<button data-action="${action}" data-id="${id}">${safe(label)}</button>`).join('')}</div>`;
    } else if (ui.overlay.startsWith('clock-')) {
      overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key),{hour24:!!data.settings.hour24,locale:i18n.locale(),now:deviceDate()});
      if(ui.overlay==='clock-ringing')ICSDeskClock.bindRinging?.(overlayRoot);
    } else if (ui.overlay === 'dtp') {
      // Calendar's datetimepicker dialogs (dtp.js).
      overlayRoot.innerHTML = DateTimePicker.render(ui.dtp, i18n.locale(), deviceDate());
    } else if (ui.overlay === 'tzpicker') {
      // Calendar's TimeZonePickerDialog (tzpicker.js).
      overlayRoot.innerHTML = TimeZonePicker.render(ui.tzp, tzpContext());
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('email-')) {
      overlayRoot.innerHTML = LPEmail.overlay(mailbox(),ui,data.photos,key=>i18n.t(key),i18n.language,ui.view==='gmail'?gmailOptions():{app:'email'});
    } else if (ui.overlay.startsWith('sd-')) {
      overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = peopleOverlay();
    } else if (ui.overlay === 'pa-drawer') {
      overlayRoot.innerHTML = PlayApps.drawer(playContext(ui.view));
    } else if(ui.overlay.startsWith('emore-')) {
      overlayRoot.innerHTML=EditorMore.dialog(editorContext());
    } else if (['ed-menu', 'ed-rename', 'ed-remove'].includes(ui.overlay)) {
      // #overlay-root has no height of its own (its children are placed against the screen), so the row's place and the room below come from the screen.
      overlayRoot.innerHTML = LPExtraApps.edDialog(ui.overlay.slice(3), {files: officeFiles(), ui, t: key => i18n.t(key), locale: i18n.locale()});
      if (ui.overlay === 'ed-menu') { const anchor = viewport.querySelector(`[data-action="ed-item"][data-id="${CSS.escape(ui.edFile)}"]`), menu = overlayRoot.querySelector('.ed-itemmenu'); if (anchor && menu) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), frame = screen.getBoundingClientRect(), scale = frame.height / screen.offsetHeight || 1, top = (a.top - box.top) / scale; menu.style.top = `${Math.max(8, Math.min(top, screen.offsetHeight - menu.offsetHeight - 8))}px`; } }
    } else if (ui.overlay === 'pin-request') {
      const ring = key => `<span class="pin-key ${key}"><i></i><img src="assets/lp-ic_sysbar_${key}.png" alt=""></span>`;
      overlayRoot.innerHTML = `<div class="pin-scrim"></div><div class="pin-request" role="dialog" aria-label="${safe(i18n.t('Screen is pinned'))}" data-no-translate><h3>${safe(i18n.t('Screen is pinned'))}</h3><p>${safe(i18n.t('This keeps it in view until you unpin. Touch and hold Back and Overview at the same time to unpin.'))}</p><div class="pin-buttons"><button data-action="pin-cancel">${safe(i18n.t('No thanks'))}</button><button data-action="pin-ok">${safe(i18n.t('Got it'))}</button></div><div class="pin-nav">${ring('back')}<span class="pin-key home"><img src="assets/lp-ic_sysbar_home.png" alt=""></span>${ring('recent')}</div></div>`;
    } else if (ui.overlay === 'lpx-overflow') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lpa-menu">${LPExtraApps.menu(ui.view, key => i18n.t(key), i18n.locale(),editorContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'pa-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lpa-menu">${PlayApps.menu(playContext(ui.view)).map(item => `<button data-action="${item.action}"${item.id ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'pa-more') {
      // The Play apps' card, now playing and reader menus and their dialogs (lp-play-more.js).
      overlayRoot.innerHTML = PlayMore.overlay(playContext(ui.view));
    } else if (ui.overlay === 'photos-menu') {
      overlayRoot.innerHTML = PhotosApp.menu(photosContext());
    } else if (ui.overlay === 'photos-delete-many') {
      overlayRoot.innerHTML = PhotosApp.deleteDialog(photosContext());
    } else if (ui.overlay === 'photos-pref-list') {
      overlayRoot.innerHTML = PhotosApp.prefDialog(photosContext());
    } else if (ui.overlay === 'photos-delete') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t('Delete'))}"><h3>${safe(i18n.t('Delete'))}</h3><p>${safe(i18n.t('Delete this photo?'))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button><button data-action="photos-confirm-delete">${safe(i18n.t('Delete'))}</button></div></div>`;
    } else if (ui.overlay === 'browser-menu' && ui.view === 'chrome') {
      overlayRoot.innerHTML = ChromeApp.menu({ui, data, t: key => i18n.t(key), locale: i18n.locale(), url: ui.browserUrl, incognito: !!ICSBrowserSession.current(ui.browserSession)?.incognito});
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay.startsWith('mms-')) {
      overlayRoot.innerHTML = renderMessageOverlay();
    } else if (ui.overlay === 'play-menu') {
      // The action bar overflow: a Holo Light popup below the overflow button (Play 5.2: a Material popup over it).
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="jbp-menu" role="menu">${JBPlay.menu(jbPlayContext()).map(item => `<button data-action="${item.action}"${item.checked !== undefined ? ` role="menuitemcheckbox" aria-checked="${item.checked}"` : ''}>${safe(item.title)}${item.checked !== undefined ? `<i class="lpp-check${item.checked ? ' on' : ''}"></i>` : ''}</button>`).join('')}</div>`;
    } else if (ui.overlay.startsWith('jbp-')) {
      overlayRoot.innerHTML = JBPlay.dialog(ui.overlay.slice(4), jbPlayContext());
    } else if (ui.overlay === 'sa-menu') {
      // The Google apps' action bar overflow (StockApps.menu: their menu XML's overflow items).
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${StockApps.menu(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()}).map(item => `<button data-action="${item.action}"${item.id != null ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'calc-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">Clear history</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${ui.calcPanel ? 'Basic panel' : 'Advanced panel'}</button></div>`;
    } else if (ui.overlay === 'phone-menu') {
      // The dialer's popup menus (LPDialer.menu); the dialpad's opens over its overflow button (PopupMenu, overlapAnchor).
      const items = LPDialer.menu(ui.phoneMenu, {data, t: phoneText, byPhone: contactByPhone});
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu lpd-menu${ui.phoneMenu === 'dialpad' ? ' lpd-menu-pad' : ''}" role="menu" data-no-translate>${items.map(([action, title]) => { const [act, arg] = action.split(/:(.*)/); return `<button role="menuitem" data-action="${act}"${arg ? ` data-id="${safe(arg)}"` : ''}>${safe(title)}</button>`; }).join('')}</div>`;
      const anchor = ui.phoneMenu === 'dialpad' && viewport.querySelector('.lpd-digits-menu'), list = overlayRoot.querySelector('.lpd-menu');
      if (anchor && list) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), scale = box.width / overlayRoot.offsetWidth || 1; list.style.left = `${(a.left - box.left) / scale}px`; list.style.top = `${(a.top - box.top) / scale}px`; list.style.right = 'auto'; }
    } else if (ui.overlay === 'lpd-confirm') {
      overlayRoot.innerHTML = LPDialer.confirm(ui.lpdConfirm, phoneText);
    } else if (ui.overlay === 'lp-settings-menu') {
      if (ui.lpMenu === 'accounts') { const on = data.settings.autoSync !== false; overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu"><button role="menuitemcheckbox" aria-checked="${on}" data-action="lp-auto-sync" class="lp-menu-check"><span>${safe(i18n.t('Auto-sync data'))}</span><i class="lp-check${on ? ' on' : ''}"></i></button></div>`; return; }
      const items = ui.lpMenu === 'sync-account' ? [['lp-sync-now', 'Sync now'], ['toast:This feature is not part of the simulator.', 'Remove account']] : ui.lpMenu === 'wifi' ? [['wifi-add', 'Add network'], ['settings-sub:wifi-saved', 'Saved networks'], ['wifi-scan', 'Refresh'], ['settings-sub:wifi-advanced', 'Advanced']] : [['bluetooth-scan', 'Refresh'], ['bluetooth-rename', 'Rename this device'], ['bluetooth-files', 'Show received files']];
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, title]) => { const [act, sub] = action.split(':'); return `<button role="menuitem" data-action="${act}"${sub ? ` data-id="${sub}"` : ''}>${safe(i18n.t(title))}</button>`; }).join('')}</div>`;
    } else if (ui.overlay === 'connectivity-menu') {
      const wifi = ui.connectivityMenu === 'wifi';
      const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-wps" data-id="pin" ${enabled ? '' : 'disabled'}>WPS Pin Entry</button><button data-action="settings-sub" data-id="wifi-direct" ${enabled ? '' : 'disabled'}>Wi-Fi Direct</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
    } else if (ui.overlay === 'wifi-wps') {
      overlayRoot.innerHTML = wpsDialog();
    } else if (ui.overlay === 'p2p-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="p2p-rename" ${data.settings.wifi ? '' : 'disabled'}>${safe(i18n.t('Rename device'))}</button></div>`;
    } else if (ui.overlay === 'p2p-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="p2p-rename" role="dialog" aria-label="Rename device"><h3>Rename device</h3><input name="name" aria-label="Device name" maxlength="32" required value="${safe(data.settings.p2pName || 'Android_4f3a')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div></form>`;
    } else if (ui.overlay === 'wifi-add') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-pair') {
      const paired = data.settings.pairedDevice === ui.bluetoothTarget;
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
    } else if (ui.overlay === 'bluetooth-rename') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Nexus 4')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
    } else if (ui.overlay === 'bluetooth-files') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
    } else if (ui.overlay === 'wifi-dialog') {
      const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
      const connected = data.settings.wifiNetwork === ui.wifiTarget;
      /* WifiDialog / WifiConfigController (wifi_dialog.xml): the network as the title, its info rows (status, signal
         strength from the wifi_signal array, link speed and frequency when connected, security), then for a secured
         network the password field with Show password and the Advanced options checkbox; CANCEL and CONNECT, or
         CANCEL and FORGET for the connected one. */
      const T = key => safe(i18n.t(key)), signal = ['Poor', 'Fair', 'Good', 'Excellent'][Math.max(0, Math.min(3, (network?.strength || 4) - 1))];
      const security = !network || network.security === 'Open' ? 'None' : `${network.security} PSK`;
      const info = (label, value) => `<div class="lp-wifi-row"><span>${T(label)}</span><b data-no-translate>${safe(value)}</b></div>`;
      const rows = (connected ? info('Status', i18n.t('Connected')) : '') + info('Signal strength', i18n.t(signal, 'Wi-Fi')) + (connected ? info('Link speed', '65 Mbps') + info('Frequency', '2.4 GHz') : '') + info('Security', i18n.t(security));
      const secret = !connected && network?.security !== 'Open' ? `<label class="lp-wifi-password"><span>${T('Password')}</span><input class="wifi-password" type="password" autocomplete="off"></label><label class="lp-wifi-check"><input type="checkbox" data-wifi-show-password>${T('Show password')}</label><label class="lp-wifi-check"><input type="checkbox">${T('Advanced options')}</label>` : '';
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog lp-wifi-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3 data-no-translate>${safe(ui.wifiTarget)}</h3><div class="lp-wifi-info">${rows}</div>${secret}<div class="settings-dialog-actions"><button data-action="close-overlay">${T('Cancel')}</button>${connected ? `<button data-action="wifi-forget">${T('Forget')}</button>` : `<button data-action="wifi-connect">${T('Connect')}</button>`}</div></div>`;
      overlayRoot.querySelector('[data-wifi-show-password]')?.addEventListener('change', event => { const field = overlayRoot.querySelector('.wifi-password'); if (field) field.type = event.target.checked ? 'text' : 'password'; });
    } else if (ui.overlay === 'power-menu') {
      overlayRoot.innerHTML = GlobalActions.menu({bugreport: data.settings.bugreportPower}, key => i18n.t(key));
      // 4.1+: a long press on Power off offers the safe-mode reboot.
      GlobalActions.hold(overlayRoot.querySelector('[data-action="ga-power"]'), () => { ui.overlay = 'power-confirm'; ui.powerKind = 'safemode'; renderOverlay(); });
    } else if (ui.overlay === 'power-confirm') {
      overlayRoot.innerHTML = GlobalActions.confirm(ui.powerKind, key => i18n.t(key));
    } else if (ui.overlay === 'power-progress') {
      overlayRoot.innerHTML = GlobalActions.progress(key => i18n.t(key));
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

  const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
  const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  /* WpsDialog: "Starting WPS…", then the push-button or PIN instructions with ic_wps; the timeout bar advances once a
     second up to WPS_TIMEOUT_S (120 s), after which the failure message and an OK button remain. */
  function wpsDialog() {
    const wps = ui.wps || {mode: 'pbc', start: Date.now(), pin: '30521874'}, elapsed = Math.floor((Date.now() - wps.start) / 1000), done = elapsed >= 120;
    const text = done ? i18n.t('WPS failed. Please try again in a few minutes.') : elapsed < 1 ? i18n.t('Starting WPS…') : wps.mode === 'pin' ? AndroidStrings.format(i18n.t('Enter pin %1$s on your Wi-Fi router. The setup can take up to two minutes to complete.'), wps.pin) : i18n.t('Press the Wi-Fi Protected Setup button on your router. It may be called "WPS" or contain this symbol:');
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert jb-wps" role="dialog" aria-label="${safe(i18n.t('Wi-Fi Protected Setup'))}" data-no-translate><h3 class="ga-title">${safe(i18n.t('Wi-Fi Protected Setup'))}</h3><div class="jb-wps-body"><p>${safe(text)}</p><img src="assets/jb-ic_wps.png" alt=""><span class="jb-progress-h" role="progressbar" aria-valuemin="0" aria-valuemax="120" aria-valuenow="${Math.min(120, elapsed)}"><i style="width:${Math.min(120, elapsed) / 120 * 100}%"></i></span><button type="button" class="jb-holo-button" data-action="close-overlay">${safe(i18n.t(done ? 'OK' : 'Cancel'))}</button></div></div>`;
  }
  setInterval(() => { if (ui.overlay === 'wifi-wps') renderOverlay(); }, 1000);
  // WifiP2pSettings: this device, then PEER DEVICES; Search for devices runs while the page is open.
  function renderWifiDirect() {
    const searching = data.settings.wifi && ui.p2pSearchUntil > Date.now();
    const right = `<button class="jb-ab-text" data-action="p2p-search" ${data.settings.wifi && !searching ? '' : 'disabled'}>${safe(i18n.t(searching ? 'Searching…' : 'Search for devices'))}</button><button class="connectivity-overflow" data-action="p2p-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Wi-Fi Direct', `<div class="connectivity-page">${data.settings.wifi ? `<div class="settings-row network-row jb-p2p-device" aria-disabled="true"><span class="row-copy" data-no-translate>${safe(data.settings.p2pName || 'Android_4f3a')}</span></div>${label('PEER DEVICES')}` : ''}</div>`, '', right);
  }
  function startP2pSearch() { ui.p2pSearchUntil = Date.now() + 12000; clearTimeout(ui.p2pTimer); ui.p2pTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-direct') render(); }, 12100); }
  /* WifiDisplaySettings: the feature is DISABLED while Wi-Fi is off; when ON it scans, listing AVAILABLE DEVICES with a
     progress spinner and, once the scan ends without results, "No nearby wireless displays were found." */
  function startWfdScan() { ui.wfdScanUntil = Date.now() + 10000; clearTimeout(ui.wfdTimer); ui.wfdTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-display') render(); }, 10100); }
  function renderWifiDisplay() {
    const on = !!data.settings.wifiDisplay && !!data.settings.wifi;
    const menu = `<button class="jb-ab-action" data-action="kk-cast-menu" aria-label="${safe(i18n.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Cast screen', `<div class="connectivity-page"><p class="wfd-empty">${safe(i18n.t('No nearby devices were found.'))}</p></div>`, '', menu);
  }

  /* WifiSettings 5.1: the switch bar, then the access points (connected first, then by signal) with the teal
     wifi_signal icons (lock overlay when secured); off, the ic_wifi_emptystate hint. Overflow: Add network, Saved
     networks, Refresh, Advanced. */
  function renderWifiSettings() {
    const on = !!data.settings.wifi && !data.settings.airplane;
    const list = allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale()));
    const level = n => Math.max(2, Math.min(4, n.strength || 4));
    const body = on ? list.map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : (data.savedWifiNetworks || []).some(item => item.name === network.name) ? i18n.t('Saved') : network.security === 'Open' ? '' : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/lps-ic_wifi_${network.security === 'Open' ? '' : 'lock_'}signal_${level(network)}_teal.png" alt=""></span></button>`).join('')
      : `<div class="lp-empty-state"><img src="assets/lps-ic_wifi_emptystate.png" alt=""><p>${safe(i18n.t('To see available networks, turn Wi‑Fi on.'))}</p></div>`;
    return appView('Wi‑Fi', `${switchBar('wifi', on)}<div class="connectivity-page">${body}</div>`, '', overflowButton('wifi'));
  }
  /* BluetoothSettings 5.1: the switch bar, Paired devices and Available devices, and the footer saying the phone is
     visible while the screen is open; off, the explanation. Overflow: Refresh, Rename this device, Show received files. */
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    const on = !!data.settings.bluetooth, name = data.settings.bluetoothName || 'Nexus 6';
    if (on && !ui.bluetoothScanned) { ui.bluetoothScanned = true; }
    const body = on ? `${data.settings.pairedDevice ? `${label(i18n.t('Paired devices'))}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label(i18n.t('Available devices'))}${['Wireless Headset','Car Audio'].filter(device => device !== data.settings.pairedDevice).map(device => deviceRow(device, false)).join('')}<p class="lp-bt-footer">${safe(AndroidStrings.format(i18n.t('%1$s is visible to nearby devices while Bluetooth settings is open.'), name))}</p>`
      : `<p class="lp-bt-off">${safe(i18n.t('When Bluetooth is turned on, your device can communicate with other nearby Bluetooth devices.'))}</p>`;
    return appView('Bluetooth', `${switchBar('bluetooth', on)}<div class="connectivity-page">${body}</div>`, '', overflowButton('bluetooth'));
  }

  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    // Security's sub-pages (lp-security.js), then the other Lollipop pages.
    const lp=LPSecurity.page(s,{data,ui,t:key=>i18n.t(key)})||LPSettingsPages.render(s,{data,t:key=>i18n.t(key),locale:i18n.locale()});
    if(lp)return appView(lp.title,(lp.switchKey?switchBar(lp.switchKey,lp.switchOn):'')+lp.body,'','');
    const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'wifi-display') { if (data.settings.wifiDisplay && data.settings.wifi && !ui.wfdScanUntil) startWfdScan(); return renderWifiDisplay(); }
    if (s === 'wifi-direct') { if (!ui.p2pSearchUntil) startP2pSearch(); return renderWifiDirect(); }
    if (s === 'bluetooth') return renderBluetoothSettings();
    /* WallpaperTypeSettings: "Choose wallpaper from" lists every ACTION_SET_WALLPAPER activity with its label and icon. On
       LMY48Y those are LivePicker's LiveWallpaperActivity, Photos' SetWallpaperActivityAlias ("Wallpaper", the app
       icon) and the Google Now Launcher's GelWallpaperPickerActivity ("Wallpapers", ic_launcher_wallpaper). */
    if (s === 'wallpaper') {
      const sources = [['photos-set-wallpaper', 'Wallpaper', 'photos.png'], ['open-live-wallpapers', 'Live Wallpapers', 'lp-lwp-ic_launcher_live_wallpaper.png'], ['open-wallpapers', 'Wallpapers', 'lp-gel-ic_launcher_wallpaper.png']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1])));
      return appView('Choose wallpaper from', sources.map(([action, label, icon]) => `<button class="settings-row kk-wallpaper-type" data-action="${action}"><img class="kk-wallpaper-type-icon" src="assets/${icon}" alt=""><span class="row-copy">${safe(i18n.t(label))}</span></button>`).join(''));
    }
    /* About phone's sub-screens as LMY48Y's Settings builds them. device_info_status.xml with deviceinfo.Status
       (WiMAX removed): Battery status, Battery level, SIM status, IMEI information, IP address, Wi‑Fi MAC address,
       Bluetooth address, Serial number, Up time; device_info_sim_status.xml with SimStatus (Network, Signal strength,
       Cellular network type, Service state, Roaming, Cellular network state, My phone number) and device_info_phone_status.xml
       with ImeiInformation for a GSM phone (IMEI, IMEI SV). The values are the demo device's. Legal information is
       device_info_settings.xml's container after Utils.updatePreferenceToSpecificActivityOrRemove: Copyright and
       System WebView License have no activity in the image and go, License and Terms take the titles of Settings'
       SettingsLicenseActivity ("Open source licenses") and GoogleServicesFramework's SettingsTosActivity ("Google legal"),
       Wallpapers keeps its attribution summary. */
    const info = (title, value) => `<div class="settings-row lp-info-row"><span class="row-copy">${safe(i18n.t(title))}<small>${safe(value)}</small></span></div>`;
    const na = i18n.t('Not available');
    if (s === 'about-status') {
      const up = Math.floor((Date.now() - SESSION_START) / 1000), pad = n => String(n).padStart(2, '0');
      return appView('Status', `${info('Battery status', i18n.t('Not charging'))}${info('Battery level', '78%')}${row('SIM status', '', 'settings-sub', 'about-sim', null)}${row('IMEI information', '', 'settings-sub', 'about-imei', null)}${info('IP address', data.settings.wifi ? '192.168.1.107' : na)}${info('Wi‑Fi MAC address', '02:00:00:51:01:01')}${info('Bluetooth address', data.settings.bluetooth ? '02:00:00:51:01:02' : na)}${info('Serial number', 'ZX1G42DEMO')}${info('Up time', `${Math.floor(up / 3600)}:${pad(Math.floor(up / 60) % 60)}:${pad(up % 60)}`)}`, 'about-settings');
    }
    if (s === 'about-sim') return appView('SIM status', `${info('Network', carrierName())}${info('Signal strength', data.settings.airplane ? '0 dBm   0 asu' : '-97 dBm   43 asu')}${info('Cellular network type', data.settings.airplane ? 'Unknown' : 'LTE')}${info('Service state', data.settings.airplane ? 'Unknown' : i18n.t('In service'))}${info('Roaming', i18n.t('Not roaming'))}${info('Cellular network state', i18n.t(data.settings.mobileData === false || data.settings.airplane ? 'Disconnected' : 'Connected'))}${info('My phone number', 'Unknown')}`, 'about-settings');
    if (s === 'about-imei') return appView('IMEI information', `${info('IMEI', '355458061234567')}${info('IMEI SV', '13')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', '', 'toast', 'This feature is not part of the simulator.', null)}${row('Google legal', '', 'toast', 'This feature is not part of the simulator.', null)}${info('Wallpapers', i18n.t('Satellite imagery providers:\n©2014 CNES / Astrium, DigitalGlobe, Bluesky'))}`, 'about-settings');
    if (s === 'easter') return `<div class="lp-platlogo" data-lp-platlogo aria-label="Android Lollipop"></div>`;
    if (s === 'lland') return `<div class="lp-lland" data-lp-lland role="application" aria-label="${safe(i18n.t('Android Lollipop'))}"></div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}<button class="settings-row wireless-row" data-action="kk-sms-app"><span class="row-copy">Default SMS app<small>Messaging</small></span></button>${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    /* Accounts as LMY48Y's Settings shows them: AccountSettings (the Google account type with its icon, Add account with
       ic_menu_add_dark; menu/account_settings.xml's checkable "Auto-sync data" in the overflow), ManageAccountsSettings
       (the account with ic_sync_green_holo / _grey_holo and "Sync is ON" / "OFF") and AccountSyncSettings (title.xml:
       the provider icon, the account and "Google"; a SyncStateSwitchPreference per sync adapter of the image, from
       lp-sync-adapters.js, "Last synced %1$s"; Sync now and Remove account in the overflow). */
    const GOOGLE_ACCOUNT = 'nexus6.demo@gmail.com', autoSync = data.settings.autoSync !== false;
    if (s === 'sync') return appView('Accounts', `${row('Google', '', 'settings-sub', 'sync-google', '<img class="lp-account-icon" src="assets/lp-gls-ic_google_selected.png" alt="">')}${row('Add account', '', 'toast', 'This feature is not part of the simulator.', '<img class="lp-account-icon" src="assets/lp-set-ic_menu_add_dark.png" alt="">')}`, '', overflowButton('accounts'));
    if (s === 'sync-google') return appView('Google', `${label('Accounts')}${row(GOOGLE_ACCOUNT, i18n.t(autoSync ? 'Sync is ON' : 'Sync is OFF'), 'settings-sub', 'sync-account', `<img class="lp-account-icon" src="assets/lp-set-ic_sync_${autoSync ? 'green' : 'grey'}_holo.png" alt="">`)}`);
    if (s === 'sync-account') {
      const when = new Date(SESSION_START).toLocaleString(i18n.locale(), {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'});
      const off = data.settings.syncOff || {};
      const rows = (window.LPSyncAdapters || []).map(row => ({key: row.en, name: AndroidStrings.pick(row, i18n.language, row.en)})).sort((a, b) => a.name.localeCompare(b.name, i18n.locale())).map(({key, name}) => {
        const on = autoSync && !off[key];
        return `<button class="settings-row lp-sync-row" data-action="lp-sync-toggle" data-id="${safe(key)}" role="switch" aria-checked="${on}"><span class="row-copy" data-no-translate>${safe(name)}<small>${safe(AndroidStrings.format(i18n.t('Last synced %1$s'), when))}</small></span><span class="lp-mswitch${on ? ' on' : ''}"></span></button>`;
      }).join('');
      return appView('Sync', `<div class="lp-sync-title"><img src="assets/lp-gls-ic_google_selected.png" alt=""><b data-no-translate>${GOOGLE_ACCOUNT}</b><small>Google</small></div>${rows}`, '', overflowButton('sync-account'));
    }
    if (s === 'location') {
      const on = data.settings.locationAccess !== false, mode = locationMode();
      return appView('Location', `<div class="kk-location${on ? '' : ' jb-disabled-group'}"><button class="settings-row wireless-row" data-action="settings-sub" data-id="location-mode" ${on ? '' : 'disabled'}><span class="row-copy">Mode<small>${safe(i18n.t(on ? LOCATION_MODES[mode][0] : 'Location off'))}</small></span></button></div>${label('Recent location requests')}<div class="settings-row wireless-row kk-pref-disabled" aria-disabled="true"><span class="row-copy">No apps have requested location recently</span></div>`, 'wireless-more kk-location-page', connectivitySwitch('locationAccess', 'Location', true));
    }
    if (s === 'location-mode') return appView('Location mode', Object.entries(LOCATION_MODES).map(([id, [title, summary]]) => `<button class="settings-row wireless-row" data-action="kk-location-mode" data-id="${id}" role="radio" aria-checked="${locationMode() === id}"><span class="row-copy">${safe(title)}<small>${safe(summary)}</small></span><img class="holo-radio" src="assets/btn_radio_${locationMode() === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''), 'wireless-more kk-location-page');
    // PaymentSettings with no HCE payment services, and PrintSettingsFragment with no print services.
    if (s === 'nfc-payment') return appView('Tap & pay', `<div class="kk-empty-page"><img src="assets/lps-nfc_payment_empty_state.png" alt=""><p>Pay with just a tap</p><button class="kk-link" data-action="toast" data-id="Learn more">Learn more</button></div>`, 'kk-empty', `<button class="jb-ab-action kk-ab-text" data-action="open-app" data-app="play-store">${safe(i18n.t('Find apps'))}</button>`);
    if (s === 'print') return appView('Printing', `${label('Print services')}<p class="kk-empty-text">No services installed</p>`, 'kk-print', `<button class="jb-ab-action" data-action="open-app" data-app="play-store" aria-label="${safe(i18n.t('Add service'))}"><img src="assets/jb-ic_menu_add.png" alt=""></button>`);
    if (s === 'daydream') return renderDaydreamSettings();
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${prefRow(A11Y('Magnification gestures'), A11Y(data.settings.magnification ? 'On' : 'Off'), 'settings-sub', 'a11y-magnification')}${toggleRow('Large text', '', 'largeText', 'A')}${toggleRow('Power button ends call', '', 'powerEndsCall', '⏻')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', '', 'speakPasswords', '◉')}${prefRow(A11Y('Accessibility shortcut'), A11Y(data.settings.a11yShortcut ? 'On' : 'Off'), 'settings-sub', 'a11y-shortcut')}${prefRow('Text-to-speech output', '', 'lng-open', 'tts')}${prefRow(A11Y('Touch & hold delay'), A11Y(HOLD_NAMES[data.settings.longPressTimeout || 0]), 'a11y-hold')}`);
    // ToggleScreenMagnificationPreferenceFragment / ToggleGlobalGesturePreferenceFragment: the switch in the action
    // bar over the feature's description.
    if (s === 'a11y-magnification') return appView(A11Y('Magnification gestures'), `<p class="a11y-summary">${safe(A11Y('Magnification summary'))}</p>`, '', connectivitySwitch('magnification', A11Y('Magnification gestures'), true));
    if (s === 'a11y-shortcut') return appView(A11Y('Accessibility shortcut'), `<p class="a11y-summary">${safe(A11Y('Accessibility shortcut summary'))}</p>`, '', connectivitySwitch('a11yShortcut', A11Y('Accessibility shortcut'), true));
    // Android 4.3 development_prefs.xml, with the master switch in the action bar (DevelopmentSettings).
    const lngPage = InputLanguage.render(langContext());
    if (lngPage) return appView(lngPage.title, lngPage.body, 'lng-page', lngPage.right);
    const devPage = JBDeveloperOptions.page(s, key => i18n.t(key), i18n.language);
    if (devPage) return appView(devPage.title, devPage.body, 'dev-page');
    if (s.startsWith('dev-procstats')) { const stats = ProcStats.render(procStatsContext()); if (stats) return appView(stats.title, stats.body, 'ps-page', stats.right); }
    if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value), i18n.language), '', connectivitySwitch('developerEnabled', i18n.t('Developer options'), true));
    // Settings 4.3 language_settings.xml: Language opens its own list; keyboards, speech and pointer speed follow.
    const languageNames = {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'};
    if (s === 'language-pick') return appView('Language', Object.entries(languageNames).map(([code, name]) => `<button class="settings-row wireless-row" data-action="set-language" data-id="${code}" role="radio" aria-checked="${i18n.language === code}" data-no-translate><span class="row-copy">${name}</span><img class="holo-radio" src="assets/btn_radio_${i18n.language === code ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''));
    if (s === 'volumes' || s === 'ringtone' || s === 'sleep') return appView(s === 'volumes' ? 'Volumes' : s === 'ringtone' ? 'Phone ringtone' : 'Sleep', `<div class="detail-pad"><p>${s === 'ringtone' ? 'Titania is selected.' : s === 'sleep' ? 'Screen turns off after 30 seconds.' : 'Ringtone 70% · Media 60% · Alarm 80%'}</p></div>`);
    /* Settings 5.1 dashboard (dashboard_categories.xml) as the Nexus 6 shows it: no SIM cards (one slot), no Home
       (one launcher), Developer options once unlocked. Each category is a white card with its teal 14 sp bold title;
       tiles are 72 dp with the teal 24 dp icon, 16 dp in and 32 dp before the 18 sp title. */
    const tile = (id, icon, title) => `<button class="lp-tile" data-action="settings-sub" data-id="${id}"><img src="assets/lps-${icon}.png" alt=""><span>${safe(i18n.t(title))}</span></button>`;
    const category = (title, tiles) => `<section class="lp-dash-category"><h3>${safe(i18n.t(title))}</h3>${tiles.join('')}</section>`;
    return appView('Settings', `<div class="lp-dashboard">${category('Wireless & networks', [tile('wifi', 'ic_settings_wireless', 'Wi‑Fi'), tile('bluetooth', 'ic_settings_bluetooth2', 'Bluetooth'), tile('data', 'ic_settings_data_usage', 'Data usage'), tile('wireless', 'ic_settings_more', 'More')])}${category('Device', [tile('display', 'ic_settings_display_am', 'Display'), tile('sound', 'ic_settings_notifications', 'Sound & notification'), tile('storage', 'ic_settings_storage', 'Storage'), tile('battery', 'ic_settings_battery', 'Battery'), tile('apps', 'ic_settings_applications', 'Apps'), tile('users', 'ic_settings_multiuser', 'Users'), tile('nfc-payment', 'ic_settings_nfc_payment_am', 'Tap & pay')])}${category('Personal', [tile('location', 'ic_settings_location', 'Location'), tile('security', 'ic_settings_security', 'Security'), tile('sync', 'ic_settings_accounts', 'Accounts'), tile('language', 'ic_settings_language', 'Language & input'), tile('backup', 'ic_settings_backup', 'Backup & reset')])}${category('System', [tile('date', 'ic_settings_date_time', 'Date & time'), tile('accessibility', 'ic_settings_accessibility', 'Accessibility'), tile('print', 'ic_settings_print', 'Printing'), ...(data.settings.developerUnlocked ? [tile('development', 'ic_settings_development', 'Developer options')] : []), tile('about', 'ic_settings_about', 'About phone')])}</div>`, 'lp-dash-page', `<button class="lp-ab-action" data-action="toast" data-id="Search is not available offline" aria-label="${safe(i18n.t('Search'))}"><img src="assets/lp-fw-ic_search_api_material.svg" alt=""></button>`);
  }

  function normalizeAddress(raw) {
    const value = raw.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    if (!value) return 'www.google.com';
    if (value.startsWith('search:') || value.startsWith('chrome://')) return value;
    if (value.includes(' ') || !value.includes('.')) return ui.browserOwner === 'chrome' ? ChromeApp.searchUrl(value, {data, locale: i18n.locale()}) : `search:${value}`;
    return value.toLowerCase();
  }
  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }
  function saveBrowserState() {
    syncBrowserState();
    if (ui.browserOwner === 'chrome') {
      // Incognito tabs are not stored.
      const tabs = ui.browserSession.tabs.filter(tab => !tab.incognito), current = ICSBrowserSession.current(ui.browserSession);
      data.chromeSession = clone({tabs: tabs.length ? tabs : [{history: [ChromeApp.NTP], index: 0}], active: Math.max(0, tabs.indexOf(current))});
    } else data.browserSession = clone(ui.browserSession);
    save();
  }
  const restoreChrome = () => ICSBrowserSession.restore(data.chromeSession, [ChromeApp.NTP]);
  function useBrowserSession(owner) {
    if (ui.browserOwner === owner) return;
    ui.browserSessions[ui.browserOwner] = ui.browserSession;
    ui.browserSession = ui.browserSessions[owner] || (owner === 'chrome' ? restoreChrome() : ICSBrowserSession.restore(data.browserSession, data.browserHistory));
    ui.browserOwner = owner; ui.browserFind = undefined; syncBrowserState();
  }
  function chromeTitle(url) { return url === ChromeApp.NTP ? i18n.t('New tab') : url === ChromeApp.HISTORY ? i18n.t('History') : browserTitle(url); }
  function renderChrome() {
    const session = ui.browserSession, tab = ICSBrowserSession.current(session);
    return ChromeApp.render({ui, data, t: key => i18n.t(key), locale: i18n.locale(), page: renderWebsite, title: chromeTitle, url: ui.browserUrl, incognito: !!tab.incognito, tabs: session.tabs.map(item => ({url: item.history[item.index], incognito: !!item.incognito})), active: session.active});
  }
  function chromeNewTab(incognito) {
    if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); return; }
    const tab = ICSBrowserSession.current(ui.browserSession);
    tab.history = [ChromeApp.NTP]; tab.index = 0; if (incognito) tab.incognito = true;
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; renderOverlay(); saveBrowserState(); render();
  }
  function chromeSection(id) {
    const incognito = !!ICSBrowserSession.current(ui.browserSession).incognito;
    ui[incognito ? 'chromeNtpIncognito' : 'chromeNtp'] = id; ui.overlay = ''; renderOverlay();
    if (ui.browserUrl !== ChromeApp.NTP) navigateBrowser(ChromeApp.NTP); else render();
  }
  function navigateBrowser(url) {
    const normalized = normalizeAddress(url);
    ICSBrowserSession.navigate(ui.browserSession,normalized);
    if (!normalized.startsWith('chrome://') && !(ui.browserOwner === 'chrome' && ICSBrowserSession.current(ui.browserSession).incognito)) data.browserHistory = [...data.browserHistory,normalized].slice(-50);
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2015 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.1413 * var(--dp));color:#888;margin-top:calc(26.4901 * var(--dp))">Offline demo pages · 2015</p>`;
    const engineHit = window.ChromeApp?.searchResult(url);
    if (url.startsWith('search:') || engineHit) {
      const term = engineHit ? engineHit.term : url.slice(7);
      return `${engineHit ? `<p class="web-engine">${safe(engineHit.name)}</p>` : ''}<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover Android 5.1, Lollipop', 'Lollipop brings Material design, heads-up notifications, a new Overview and Smart Lock.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Android 5.1, Lollipop</h3><p>Material design brings bold colour, responsive motion and depth to every screen. Notifications reach you on the lock screen and as heads-up alerts, Overview keeps your recent apps and tabs in a stack of cards, and Smart Lock keeps your phone unlocked near a trusted device.</p><div style="background:#00bcd4;color:white;padding:calc(27.5939 * var(--dp));text-align:center;font-size:calc(41.9427 * var(--dp))">🍭<br><small style="font-size:calc(18.7638 * var(--dp))">Lollipop</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons; versions 4.1–4.3, Jelly Bean, added Project Butter, Google Now and expandable notifications; Android 4.4, KitKat, was tuned to run on devices with 512 MB of RAM; Android 5.0, Lollipop, introduced Material design, the ART runtime and 64-bit support, and 5.1 added multiple SIM cards and Device Protection.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean · KitKat · Lollipop</p>${browserLink('www.android.com','Official Android website')}`;
    const newsPage = window.StockApps?.newsPage(url); if (newsPage) return newsPage;
    if (url === 'news.example/nexus-6' || url === 'retro.example/lollipop') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with the Nexus 6':'A closer look at Lollipop'}</h2><time>November 3, 2014 · Demo archive</time><p>The phone has a 6-inch Quad HD screen, front-facing stereo speakers and a Turbo Charger that adds six hours of use in fifteen minutes. Open the app drawer to discover the Lollipop experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/lollipop','Explore Lollipop')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Thursday, October 22, 2015</p><hr><h3>Android 5.1.1 security update arrives on the Nexus 6</h3><p>Build LMY48Y brings the November security patches to Google's Nexus devices.</p><h3>Apps in your pocket</h3><p>Material design apps are arriving on Google Play every week.</p>${browserLink('news.example/nexus-6','Read the Nexus 6 story')}${browserLink('retro.example','Visit the 2015 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2015 Web</h2><p>A little time capsule from the Material design era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/lollipop','Explore Lollipop')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(253.8632 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(19.8676 * var(--dp)),#c7dfd7 calc(19.8676 * var(--dp)),#c7dfd7 calc(26.4901 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
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

  /* Google Play Store 5.2.13: ui.market holds the page, section, tab and selection, ui.marketHistory the back stack;
     downloads run on a timer with a notification while they last and "Successfully installed." afterwards. */
  function jbPlayContext() {
    const m = ui.market || {page: 'home'};
    return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), ...m, installed: data.marketInstalled || [], everInstalled: data.marketEverInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: data.marketPlus || [], autoUpdate: data.marketAuto || [], wishlist: data.marketWishlist || [], rated: data.marketRated || {}, prefs: {notify: true, shortcuts: true, autoMode: 'wifi', auth: 'session', ...(data.marketPrefs || {})}, rateDraft: ui.marketRateDraft, filterDraft: ui.marketFilterDraft, account: 'demo@android.local', permOpen: ui.marketPermOpen || '', permView: !!ui.marketPermView, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: data.marketSearches || [], target: ui.marketTarget, popTop: ui.marketPopTop};
  }
  function jbPlayGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.jbp-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
  function jbPlayKeepScroll() { const top = viewport.querySelector('.jbp-scroll')?.scrollTop || 0; render(); const list = viewport.querySelector('.jbp-scroll'); if (list) list.scrollTop = top; }
  function jbPlayDownload(id) {
    const item = JBPlay.find(id); if (!item) return;
    clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
    data.notifications = data.notifications.filter(n => n.kind !== 'market-dl');
    data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
    save(); render(); renderStatus();
    ui.marketTimer = setInterval(() => {
      const d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
      if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; data.marketEverInstalled = [...new Set([...(data.marketEverInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: JBPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store' && !ui.marketSearching) jbPlayKeepScroll();
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function renderPhone() {
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),phoneText);
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),phoneText,i18n.locale());}
    // Google Dialer 5.1 (lp-dialer.js): speed dial, recents and contacts tabs, search, the sliding dialpad, History.
    return LPDialer.render({data, ui, t: phoneText, locale: i18n.locale(), byPhone: contactByPhone});
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(number) {
    if(!number)return;
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  function renderPeople() { return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale()); }
  function editPerson(isNew = false) {
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    ui.peopleDraft = {...person,groups:data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id)};
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  function peopleOverlay() {
    /* GoogleContacts 1.1: quickcontact's overflow (Delete, Share, Place on Home screen) and people_options' (Contacts to
       display, Import/export, Accounts, Settings, Help; Clear frequents only with frequent contacts), and
       ContactDeletionInteraction's Material alert (the message, then Cancel / OK in the #0288D1 accent), in this image's
       words (people-strings.js). */
    if (ui.overlay === 'people-share') return PeopleIO.shareOverlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-vcard') return PeopleIO.overlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    const P = key => PeopleStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    if (ui.overlay === 'people-menu') { const items = ui.sub === 'detail' ? [['people-delete', 'Delete'], ['psh-open', 'Share'], ['people-place-home', 'Place on Home screen']] : [['pfl-open', 'Contacts to display'], ['vcf-open', 'Import/export'], ['open-settings-sync', 'Accounts'], ['pst-open', 'Settings'], ['toast', 'Help']]; return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu" data-no-translate>${items.map(([action, title]) => `<button role="menuitem" data-action="${action}"${action === 'toast' ? ` data-id="${safe(unavailable)}"` : ''}>${safe(P(title))}</button>`).join('')}</div>`; }
    if (ui.overlay === 'people-delete') return `<div class="lpp-alert-scrim" data-action="close-overlay"></div><div class="lpp-alert" role="alertdialog" aria-label="${safe(P('This contact will be deleted.'))}" data-no-translate><p>${safe(P('This contact will be deleted.'))}</p><div class="lpp-alert-buttons"><button data-action="close-overlay">${safe(P('Cancel'))}</button><button data-action="people-confirm-delete">${safe(P('OK'))}</button></div></div>`;
    const group = data.contactGroups.find(g=>g.id===ui.peopleEditGroup);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog mms-dialog people-editor" role="dialog" aria-label="${group?'Edit group':'New group'}" data-form="people-group"><h3>${group?'Edit group':'New group'}</h3><label>Group name<input name="name" required maxlength="50" value="${safe(group?.name||'')}"></label>${data.contacts.map(p=>`<label class="people-membership"><input type="checkbox" name="members" value="${p.id}" ${group?.members.includes(p.id)?'checked':''}>${safe(p.name)}</label>`).join('')}<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
  }
  function renderMessaging() {
    if (ui.lpmPage === 'options') return MessengerOptions.render(data, ui, key => i18n.t(key));
    return ICSMessaging.render(data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime());
  }
  function messageDraft() {
    data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function openMessageThread(key) {
    if (!['messaging', 'hangouts'].includes(ui.view)) openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : ui.sub === 'archived' ? 'archived' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function pickHangout(key) {
    const pending = data.messageDrafts?.['hg:new'];
    if (pending && (pending.body || pending.attachment)) {
      const target = data.messageDrafts['hg:' + String(key)] ||= {body: '', recipient: ''};
      target.body = [target.body, pending.body].filter(Boolean).join(' ').slice(0, 2000);
      if (pending.attachment) target.attachment = pending.attachment;
      target.updated = Date.now();
    }
    if (data.messageDrafts) delete data.messageDrafts['hg:new'];
    ui.mmsListMode = '';
    openMessageThread(key);
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  function renderMessageOverlay() {
    const dialog = (title, content) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t(title))}"><h3>${safe(i18n.t(title))}</h3>${content}</div>`;
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(i18n.t(text))}</button>`;
    const hangouts = ui.view === 'hangouts' ? Hangouts.overlay(data, ui, key => i18n.t(key)) : null;
    if (hangouts !== null) return hangouts;
    if (ui.overlay === 'mms-attach-photos') return dialog('Attach photo', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
    if (ui.overlay === 'mms-menu' && ui.view === 'messaging') {
      // Messenger's overflow: the conversation list (Archived, Settings, Help & feedback) or a conversation.
      const items = ui.sub === 'thread' ? [['mms-smiley', 'Insert smiley'], ['mpo-open', 'People & options'], ['mms-delete-thread', 'Delete'], ['mms-discard', 'Discard draft']] : ui.sub === 'new' ? [['mms-smiley', 'Insert smiley'], ['mms-discard', 'Discard draft']] : ui.sub === 'archived' ? [['toast:This feature is not part of the simulator.', 'Settings'], ['toast:Help is not available offline.', 'Help & feedback']] : [['mms-archived', 'Archived'], ['toast:This feature is not part of the simulator.', 'Settings'], ['toast:Help is not available offline.', 'Help & feedback']];
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, title]) => { const [act, arg] = action.split(/:(.*)/); return `<button role="menuitem" data-action="${act}"${arg ? ` data-id="${safe(arg)}"` : ''}>${safe(i18n.t(title))}</button>`; }).join('')}</div>`;
    }
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread','new'].includes(ui.sub);
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}">${composing ? option('mms-smiley','Insert smiley') + option('mms-discard','Discard draft') + (ui.sub === 'thread' ? option('mms-delete-thread','Delete thread') : '') : option('new-message','New message') + option('mms-search','Search messages')}</div>`;
    }
    if (ui.overlay === 'mms-attach') return dialog('Add attachment', `<div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || '<p>No photos</p>'}</div>`);
    if (ui.overlay === 'mms-smiley') return dialog('Insert smiley', `<div class="mms-dialog-list">${[':-)',':-(', ';-)',':-D',':-P'].map(face=>option('mms-insert-smiley',face,face)).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') return dialog(ui.mmsDelete === 'thread' ? 'Delete thread' : 'Delete message', `<p>Delete this conversation or message from the simulator?</p><div class="settings-dialog-actions">${option('close-overlay','Cancel')}${option('mms-confirm-delete','Delete')}</div>`);
    const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (!message) return '';
    if (ui.overlay === 'mms-message') return dialog('Message options', `<div class="mms-dialog-list">${option('mms-forward','Forward message')}${option('mms-details','View message details')}${option('mms-delete-message','Delete message')}</div>`);
    if (ui.overlay === 'mms-details') return dialog('Message details', `<p>${message.attachment ? 'MMS' : 'SMS'} · ${safe(i18n.t(message.mine ? 'Sent' : 'Received'))}</p><p>${safe(ICSMessaging.identity(message.contact,data.contacts).phone)}</p><p>${safe(message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale()) : i18n.t(message.time))}</p><p>${safe(message.body)}</p><div class="settings-dialog-actions">${option('close-overlay','OK')}</div>`);
    return '';
  }
  // Google+ Photos (the Nexus 6's Photos) over the simulator's pictures.
  const photosContext = () => ({data, ui, t: key => i18n.t(key), locale: i18n.locale(), media: ICSMedia, groups: LPGallery.groups(data, 'album', i18n.locale())});
  // Google+'s photo editor (plus-editor.js) over the same pictures.
  const peContext = () => ({...photosContext(), save, render, toast});
  function photosCurrent() { const list = PhotosApp.list(photosContext()); return list[ui.photosIndex] || null; }
  const photosText = key => AndroidStrings.pick(window.StockStrings?.photos?.[key], i18n.locale(), key);
  /* Slideshow (PhotoOneUpFragment's slideshow runnable): full screen, the pager scrolls one page in 600 ms
     (AccelerateDecelerateInterpolator) every 5000 ms, and the last picture ends it with the bars back. A tap ends it. */
  function photosSlideshowStop() { clearTimeout(ui.photosSlideTimer); ui.photosSlideTimer = null; ui.photosSlideshow = false; }
  function photosSlideshowStep() {
    if (!ui.photosSlideshow || ui.view !== 'photos' || ui.sub !== 'photo') { photosSlideshowStop(); return; }
    const list = PhotosApp.list(photosContext());
    if (ui.photosIndex >= list.length - 1) { photosSlideshowStop(); ui.photosChrome = true; render(); return; }
    ui.photosIndex += 1; ui.selectedPhoto = list[ui.photosIndex].id; render();
    viewport.querySelector('.ph-viewer > img')?.classList.add('ph-slide-in');
    ui.photosSlideTimer = setTimeout(photosSlideshowStep, 5000);
  }
  /* Download (DownloadManager.addCompletedDownload): "Downloading image…", then a copy in the Download folder named
     after download_file_name_format ('download'_yyyyMMdd_HHmmss), listed in Downloads, and "Download complete." */
  function photosDownload(photo) {
    toast(photosText('Downloading image…'));
    setTimeout(() => {
      const now = new Date(), two = n => String(n).padStart(2, '0');
      const name = `download_${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}_${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}`;
      const copy = {...clone(photo), id: Date.now(), name, album: 'download', created: now.getTime()};
      data.photos.push(copy);
      (data.downloads ||= []).unshift({name: `${name}.jpg`, size: 1048576 + (copy.id % 900000), time: now.getTime(), photoId: copy.id});
      save(); if (ui.view === 'photos') render(); toast(photosText('Download complete.'));
    }, 1200);
  }
  function photosShare(photo) { if (!photo) return; ui.overlay = ''; renderOverlay(); openApp('messaging'); ui.sub = 'new'; messageDraft().attachment = clone(photo); save(); render(); }
  // Swipe between pictures in the viewer; a tap shows or hides the bars.
  function attachPhotosSwipe() {
    const pane = viewport.querySelector('.ph-viewer');
    if (!pane || pane.dataset.swipe) return;
    pane.dataset.swipe = '1';
    let start = null;
    pane.addEventListener('pointerdown', event => { start = {x: event.clientX, y: event.clientY}; });
    pane.addEventListener('pointerup', event => {
      if (!start) return;
      const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
      if (Math.abs(dx) < dp(44) || Math.abs(dx) < Math.abs(dy)) return;
      const list = PhotosApp.list(photosContext()), next = ui.photosIndex + (dx < 0 ? 1 : -1);
      if (next < 0 || next >= list.length) return;
      ui.photosIndex = next; ui.selectedPhoto = list[next].id; suppressReleaseClick(); render();
    });
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  const galleryItems = () => LPGallery.items(data, ui, i18n.locale());
  function galleryWallpaper(photo, quiet) { data.wallpaper = 11; data.customWallpaper = photo.colors; data.customWallpaperPhoto = clone(photo); save(); if (quiet) return; render(); toast('Wallpaper set'); }
  const wallpaperPickerContext = () => ({data, ui, t: key => i18n.t(key), image: photo => ICSMedia.image(photo), bundled: wallpaperFiles.slice(1)});
  /* DocumentsUI's GET_CONTENT picker (lp-docpicker.js) for the wallpaper picker, Keep (image/*) and Gmail / Email's
     Attach file (any type). It runs as its own screen in the asking app's task; ui.docPickFor names that app. The
     free space of Internal storage is the Storage screen's Available figure (settings-detail.js). */
  const docContext = () => ({data, ui, t: key => { const row = window.StockStrings?.docsui?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, locale: i18n.locale(), image: photo => ICSMedia.image(photo), album: ICSMedia.album, tracks: ICSMusic.tracks, now: deviceDate().getTime(), free: `${(9.93).toLocaleString(i18n.locale(), {minimumFractionDigits: 2})} GB`});
  function docPick(caller, accept) { ui.overlay = ''; renderOverlay(); LPDocPicker.start(data, ui, caller, accept, docContext()); ui.docPickFor = caller; ui.view = 'kk-doc-picker'; render(); }
  function docReturn() { const caller = ui.docPickFor; ui.docs = null; ui.docPickFor = ''; ui.view = {wallpaper: 'wallpaper-picker'}[caller] || caller || 'wallpaper-picker'; return caller; }
  // The document picked goes back to the app that asked: a picture to the wallpaper strip or a Keep note, any file to
  // the message being written.
  function docPicked(file) {
    const caller = docReturn();
    if(EditorMore.APP[LPExtraApps.KIND[caller]]){EditorMore.importFile(editorContext(),file);return;}
    if (caller === 'keep') { keepAttach(file.photo.id, ui.keepPhotoTo); return; }
    if (caller === 'wallpaper') { const wp = ui.wp ||= {selected: '', temp: [], checked: []}, pid = file.photo.id; wp.temp = [pid, ...(wp.temp || []).filter(x => x !== pid)]; wp.selected = `photo:${pid}`; render(); return; }
    const item = mailbox().find(item => item.id === ui.emailId);
    if (item) item.files = [...(item.files || []), {name: file.name, mime: file.mime, size: file.size, ...(file.photo ? {photo: clone(file.photo)} : {})}];
    save(); render();
  }
  // Re-render the picker but keep the strip where it was scrolled.
  function wallpaperPickerRender() { const left = viewport.querySelector('.kwp-scroll')?.scrollLeft || 0; render(); const strip = viewport.querySelector('.kwp-scroll'); if (strip) strip.scrollLeft = left; }
  screen.addEventListener('wheel', event => {
    if (ui.view !== 'wallpaper-picker' || ui.overlay || event.ctrlKey) return;
    const strip = event.target.closest('.kwp-scroll'); if (!strip) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    strip.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1);
    event.preventDefault();
  }, {passive: false});
  function renderCamera() { return LPCamera.render(data, ui, key => i18n.t(key), ICSMedia, i18n.locale(), i18n.language); }
  // JB Camera callbacks: a capture adds a local illustration to the Camera album; the filmstrip opens Gallery.
  // A picture, with clip = {duration} a video (VID_..., its first frame), with clip = {pano} a panorama (PANO_...),
  // with clip = {sphere: frames} a photo sphere (PANO_... too), into the Camera album.
  function cameraShoot(clip) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const photo = {...ICSMedia.scene(data), id: Date.now(), name: clip?.pano || clip?.sphere ? `PANO_${stamp.slice(0, 8)}_${stamp.slice(8)}` : clip ? `VID_${stamp.slice(0, 8)}_${stamp.slice(8)}` : `IMG_${stamp}`, album: 'camera', created: Date.now(), ...(clip?.refocus ? {refocus: {focus: [.5, .5], strength: .6}} : clip?.sphere ? {sphere: true, frames: clip.sphere} : clip?.pano ? {pano: true} : clip ? {video: true, duration: Math.max(1000, Math.round(clip.duration))} : {})};
    // An IMAGE_CAPTURE request keeps the picture for its review (lp-camera.js) and hands it to the caller, not the camera roll.
    if (ui.camIntent && !clip) { ui.camIntent.taken = photo; return photo; }
    data.photos.unshift(photo); save(); return photo;
  }
  // An IMAGE_CAPTURE request open in the Camera: Done hands the picture back, Cancel or Back returns without one, Retake
  // goes back to the shutter.
  function cameraIntent(done, cancel) {
    const intent = {type: 'image', taken: null, done: () => { const photo = intent.taken; ui.camIntent = null; done(photo); }, cancel: () => { ui.camIntent = null; cancel(); }};
    return intent;
  }
  // Hangouts' Take photo: the picture joins the conversation's draft as its attachment.
  function hangoutsTakePhoto() {
    const ret = {sub: ui.sub, thread: ui.thread};
    ui.overlay = ''; renderOverlay(); openApp('camera'); ui.jbcamModule = 'photo';
    const back = () => { openApp('hangouts'); Object.assign(ui, ret); };
    ui.camIntent = cameraIntent(photo => { back(); const d = messageDraft(); d.attachment = clone(photo); d.updated = Date.now(); save(); render(); scrollMessages(); }, () => { back(); render(); scrollMessages(); });
    render();
  }
  // Camera review: LMY48Y has no Gallery, so the picture opens in the Photos viewer.
  function cameraGallery(id) {
    const photo = data.photos.find(item => item.id === id) || ICSMedia.photos(data, 'camera')[0];
    openApp('photos'); if (!photo) return;
    const index = PhotosApp.list(photosContext()).findIndex(item => item.id === photo.id);
    if (index >= 0) { ui.photosIndex = index; ui.sub = 'photo'; render(); }
  }
  function galleryStep(direction) {
    const items=galleryItems(); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }

  function renderCalendar() {
    // Settings (calendar-prefs.js).
    if (ui.sub === 'calendar-settings') return CalendarPrefs.render(data, ui, key => i18n.t(key), 'nexus6.demo@gmail.com', i18n.locale());
    return ICSCalendar.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate());
  }
  function calendarRender() {
    render();
    const timeline=viewport.querySelector('.cal-time-scroll');
    if(timeline)timeline.scrollTop=dp(8*48/.906);
  }
  function calendarMove(direction) {
    const mode=ui.calendarMode || 'Agenda';
    if(mode==='Month'||mode==='Agenda') {const date=ICSCalendar.parse(ui.selectedDate);date.setDate(1);date.setMonth(date.getMonth()+direction);ui.selectedDate=ICSCalendar.iso(date);}
    else ui.selectedDate=ICSCalendar.plus(ui.selectedDate,direction*(mode==='Week'?7:mode==='3 day'?3:1));
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
    const snoozed=(data.calendarSnoozes||[]).filter(item=>item.at<=now.getTime());
    if(snoozed.length){data.calendarSnoozes=data.calendarSnoozes.filter(item=>!snoozed.includes(item));snoozed.forEach(item=>data.notifications.unshift({id:Date.now()+data.notifications.length,title:item.title,detail:item.detail,kind:'calendar',eventId:item.eventId,date:item.date}));save();renderStatus();if(ui.overlay==='shade')renderOverlay();}
    data.calendarFired=Array.isArray(data.calendarFired)?data.calendarFired.slice(-60):[];
    for(const {key,event} of ICSCalendar.dueReminders(CalendarPrefs.prefs(data).alerts?CalendarPrefs.events(data):[],now,data.calendarFired)) {
      data.calendarFired.push(key);
      const when=event.allDay?i18n.t('All day'):`${event.time} – ${event.endTime}`;
      data.notifications.unshift({id:Date.now()+data.notifications.length,title:event.title,detail:[when,event.location].filter(Boolean).join(' · '),kind:'calendar',eventId:event.id,date:event.date});
      save();renderStatus();if(ui.overlay==='shade')renderOverlay();headsUp(data.notifications[0]);
    }
  }
  function calendarEdit(item) {
    const length=CalendarPrefs.prefs(data).duration>0?CalendarPrefs.prefs(data).duration:60;
    ui.eventDraft=ICSCalendar.normalize(item || {date:ui.selectedDate,time:'12:00',endTime:`${String(12+Math.floor(length/60)).padStart(2,'0')}:${String(length%60).padStart(2,'0')}`,title:''});
    ui.calendarError='';ui.overlay='';ui.sub='event-edit';render();
  }
  // 4.2 DeskClock pages; the alarm list and editor keep the ICS AlarmClock/SetAlarm screens.
  const jbClockState = () => { data.jbClock ||= {tab: 'clock', timers: [], stopwatch: {accumulated: 0, started: null, laps: []}}; return {...data.jbClock, timerDigits: ui.timerDigits || '', timerSetup: !!ui.timerSetup}; };
  // DeskClock's settings (clock-prefs): the analog style and the Home clock reach the clock page through its state.
  const clockExtras = state => ({...state, home: ClockPrefs.home(data, Date.now(), i18n.locale()), analog: ClockPrefs.prefs(data).style === 'analog' ? ClockPrefs.analog(deviceDate()) : ''});
  function renderClock() {
    if (ui.sub === 'clock-settings') return ClockPrefs.settings({data, ui, t: key => i18n.t(key), locale: i18n.locale(), color: JBDeskClock.SPECTRUM[deviceDate().getHours()]});
    if (ui.sub === 'night') return ClockPrefs.night({data, ui, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'})});
    if (ui.sub === 'cities') return JBDeskClock.cities({...jbClockState(), cityQuery: ui.cityQuery}, key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, words: {title: i18n.t('Cities'), selected: i18n.t('Selected Cities')}});
    const clockState = {...jbClockState(), alarmPage: KKDeskClock.page(data.alarms, {expandedId: ui.kdcExpanded, t: key => i18n.t(key), locale: i18n.locale(), hour24: !!data.settings.hour24, normalize: ICSDeskClock.normalize})};
    return JBDeskClock.render(clockExtras(clockState), key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!data.settings.hour24, alarm: nextAlarmLabel(), date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale())});
  }
  let clockFrame = 0, clockSilenceTimer = 0;
  function clockTicker() {
    cancelAnimationFrame(clockFrame);
    const step = () => {
      const root = viewport.querySelector('.jbclock-app');
      if (!root || ui.view !== 'clock') return;
      JBDeskClock.tick(root, data.jbClock, Date.now(), key => i18n.t(key));
      clockFrame = requestAnimationFrame(step);
    };
    clockFrame = requestAnimationFrame(step);
  }
  // TimerReceiver: a finished timer posts "Time's up" and shows its alert in the Timer page.
  function checkTimers() {
    const now = Date.now();
    for (const timer of data.jbClock?.timers || []) {
      if (timer.state !== 'running' || JBDeskClock.remaining(timer, now) > 0) continue;
      Object.assign(timer, {state: 'done', left: 0, started: null});
      data.notifications.unshift({id: now + data.notifications.length, title: i18n.t("Time's up"), detail: i18n.t('Timer'), kind: 'timer'}); save();
      renderStatus(); if (ui.overlay === 'shade') renderOverlay();
      if (ui.view === 'clock') { data.jbClock.tab = 'timer'; render(); }
      toast("Time's up");
    }
  }
  // Label and ringtone edits from a 4.4 alarm card go straight into that alarm.
  function kdcCommit() {
    if (!ui.kdcEditing) return;
    const alarm = data.alarms.find(item => item.id === ui.kdcEditing);
    if (alarm) { alarm.label = ui.alarmDraft.label; alarm.tone = ui.alarmDraft.tone; save(); }
    ui.kdcEditing = null; ui.alarmDraft = null;
  }
  function checkAlarms(now) {
    if(ui.overlay==='clock-ringing')return;
    const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
    // Silence after: an alarm left ringing stops by itself.
    clearTimeout(clockSilenceTimer); { const after = Number(ClockPrefs.prefs(data).silence), ringing = ui.ringingAlarm; if (after > 0) clockSilenceTimer = setTimeout(() => { if (ui.overlay === 'clock-ringing' && ui.ringingAlarm === ringing) { ui.overlay = ''; render(); } }, after * 60000); }
  }

  /* Calculator 5.1 (packages/apps/Calculator android-5.1.1_r26, activity_calculator_port): the white display (4 dp
     elevation) with the formula (sans-serif-light, #8A000000, 64 sp shrinking in 8 sp steps to 36 sp; 48 dp above,
     24 dp below, 16 dp sides) and the live result (36 sp #6C000000); below, the #434343 numeric pad (12 dp in, 32 sp
     white keys: 7 8 9 / 4 5 6 / 1 2 3 / . 0 =) beside the #636363 operator column (DEL or CLR in 15 sp caps, ÷ × − +
     in 23 sp), and the #1DE9B6 advanced pad peeking 24 dp at the right edge (sin cos tan / ln log ! / π e ^ / ( ) √,
     20 sp #91000000), swiped or tapped in. The status bar is the #00BCD4 accent; clearing reveals it over the display. */
  const LP_CALC_PEEK = 21.74;
  function calcPreview(expression) {
    if (!expression || expression === 'Error' || !/[÷×−+^!√(]|sin|cos|tan|ln|log|π|e/.test(expression.replace(/^−/, ''))) return '';
    try { const value = ICSCalculator.evaluate(expression); return value === expression ? '' : value; } catch { return ''; }
  }
  function renderCalculator() {
    const numeric = ['7','8','9','4','5','6','1','2','3','.','0','='];
    const operators = ['÷','×','−','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'];
    const key = (k, cls = '') => `<button class="lpcalc-key ${cls}" data-action="calc-key" data-id="${k}">${k}</button>`;
    const error = ui.calc === 'Error', formula = error ? '' : ui.calc, result = error ? i18n.t('Error') : ui.calcFresh ? '' : calcPreview(ui.calc);
    const width = 343 / .906, len = Math.max(1, [...formula].length);
    const size = [64, 56, 48, 40, 36].find(sp => len * .55 * sp <= width) || 36;
    const reveal = ui.calcReveal && Date.now() - ui.calcReveal < 600 ? `<span class="lpcalc-reveal${ui.calcRevealError ? ' error' : ''}"></span>` : '';
    return `<div class="app-view lpcalc"><div class="lpcalc-display">${reveal}<output class="lpcalc-formula" aria-label="${safe(i18n.t('Calculator display'))}" style="font-size:calc(${size} * var(--dp))">${safe(formula)}</output><output class="lpcalc-result${error ? ' error' : ''}">${safe(result)}</output></div><div class="calc-pager lpcalc-pager"><div class="calc-panels lpcalc-track" style="transform:translateX(${ui.calcPanel ? `calc(-100% + ${LP_CALC_PEEK}px)` : '0'})"><div class="lpcalc-main" ${ui.calcPanel ? 'inert' : ''}><div class="lpcalc-numeric">${numeric.map(k => key(k, k === '=' ? 'eq' : 'digit')).join('')}</div><div class="lpcalc-operators">${ui.calcFresh || error ? `<button class="lpcalc-key text" data-action="calc-key" data-id="C">${safe(i18n.t('clr').toUpperCase())}</button>` : `<button class="lpcalc-key text" data-action="calc-key" data-id="⌫">${safe(i18n.t('del').toUpperCase())}</button>`}${operators.map(k => key(k, 'op')).join('')}</div></div><div class="lpcalc-advanced"${ui.calcPanel ? '' : ` data-action="calc-panel" data-id="1"`}><div class="lpcalc-advanced-grid" ${ui.calcPanel ? '' : 'inert'}>${advanced.map(k => key(k, 'adv')).join('')}</div></div></div></div></div>`;
  }
  function setCalculatorPanel(index) {
    ui.calcPanel = index;
    const track = viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = index ? `translateX(calc(-100% + ${LP_CALC_PEEK}px))` : 'translateX(0)'; snapResting(track);
    const main = track.querySelector('.lpcalc-main'), grid = track.querySelector('.lpcalc-advanced-grid'), adv = track.querySelector('.lpcalc-advanced');
    if (main) main.inert = !!index; if (grid) grid.inert = !index;
    if (adv) { if (index) { delete adv.dataset.action; delete adv.dataset.id; } else { adv.dataset.action = 'calc-panel'; adv.dataset.id = '1'; } }
  }
  function saveMusic() {
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;ui.musicPosition=ui.music.position;
    data.music=clone(ui.music);delete data.music.playing;save();
  }
  function tickMusic() {
    if(!ui.music.playing)return;
    const previous=ui.music.track;ICSMusic.tick(ui.music);
    ui.musicTrack=ui.music.track;ui.musicPlaying=ui.music.playing;
    if(previous!==ui.music.track || !ui.music.playing){saveMusic();if(ui.view==='music'||ui.view==='play-music'||ui.view==='home'||ui.view==='lock'&&!pointerStart)render();}
    else if(Math.floor(ui.music.position)%10===0)saveMusic();
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress){progress.value=ui.music.position;progress.style.setProperty('--p',`${(ui.music.position/tracks[ui.music.track].duration*100).toFixed(2)}%`);}
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  // Voice Search listens for three seconds, then asks to try again.
  let voiceTimer = null;
  function listenVoice() {
    clearTimeout(voiceTimer); ui.voiceState = 'listening'; if (ui.view === 'voice-search') render();
    voiceTimer = setTimeout(() => { ui.voiceState = 'retry'; if (ui.view === 'voice-search') render(); }, 3000);
  }
  const keepMoreContext=()=>({data,ui,t:key=>i18n.t(key),locale:i18n.locale(),account:GmailApp.account,save,render,renderOverlay,saveNote:saveKeepNote,
    sync(){ui.kpScreen='';openApp('settings');ui.kpSyncReturn=true;ui.sub='sync-google';render();},
    website(url){ui.kpScreen='';openApp('chrome');navigateBrowser(url);},
    send(app,spec){ui.kpScreen='';ui.overlay='';renderOverlay();openApp(app);composeEmail();const draft=(app==='gmail'?data.gmailbox:data.mailbox).find(m=>m.id===ui.emailId);if(draft){draft.body=spec.text;draft.subject=spec.text.split('\n')[0]||'';if(spec.audio)draft.attachment={...clone(spec.audio),kind:'audio',vcard:true};else if(spec.photo)draft.attachment=clone(data.photos.find(p=>p.id===spec.photo));}save();render();}
  });
  const keepCurrent = () => (data.keepNotes || []).find(item => item.id === ui.keepNote);
  // Keeps the editor's text; on leaving, empty list items go and a note without text, items or picture is dropped.
  function saveKeepNote(leaving) {
    const area = viewport.querySelector('.keep-text'), note = keepCurrent();
    if (!note) return;
    if (area) note.text = area.value;
    if (leaving && note.list) note.list = note.list.filter(item => item.text.trim());
    if (leaving && !String(note.text || '').trim() && !(note.list || []).length && !note.photo && !note.audio) data.keepNotes = data.keepNotes.filter(item => item !== note);
    save();
  }
  // A picture goes to the open note, or starts a new picture note from the browse bar.
  function keepAttach(photoId, noteId) {
    let note = (data.keepNotes || []).find(item => item.id === noteId);
    if (!note) { note = {id: 'k' + Date.now(), text: '', color: 0}; data.keepNotes = [note, ...(data.keepNotes || [])]; }
    note.photo = photoId; ui.keepNote = note.id; ui.sub = 'note'; ui.view = 'keep'; save(); render();
  }
  // Show / Hide checkboxes: lines become unchecked items; back to text drops the checked ones when asked to.
  function keepToText(note, dropChecked) { note.text = note.list.filter(item => !(dropChecked && item.checked)).map(item => item.text).join('\n'); delete note.list; }
  const playContext = app => ({app, ui, data, locale: i18n.locale(), t: key => i18n.t(key), music: ui.music, tracks, time: ICSMusic.time});
  // The Play Movies player counts seconds without re-rendering (the picture keeps panning).
  function tickPlayVideo() {
    if (ui.view !== 'play-movies' || ui.sub !== 'movie' || ui.paPlaying === false || ui.locked) return;
    ui.paSeconds = (ui.paSeconds || 0) + 1;
    const item = [...PlayApps.MOVIES, ...PlayApps.SHOWS].find(entry => entry.id === ui.paItem); if (!item) return;
    const total = (item.mins || 24) * 60, pos = Math.min(total, Math.floor(total * (item.progress || 0)) + ui.paSeconds);
    const clock = value => `${Math.floor(value / 3600)}:${String(Math.floor(value / 60) % 60).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
    const footer = viewport.querySelector('.pm-video-bottom'); if (!footer) return;
    footer.querySelector('span').textContent = clock(pos); footer.querySelector('i').style.setProperty('--p', `${(pos / total * 100).toFixed(1)}%`);
  }
  setInterval(tickPlayVideo, 1000);
  function renderEmail() {
    if (ui.sub === 'em-settings') return EmailPrefs.render(data, ui, i18n.language, key => i18n.t(key), ICSEmail.account);
    return LPEmail.render(data.mailbox,ui,key=>i18n.t(key),i18n.locale(),i18n.language,{app:'email',accountName:'Nexus 6'});
  }
  const mailbox = () => ui.view === 'gmail' ? data.gmailbox : data.mailbox;
  const gmailOptions = () => GmailApp.options(data, ui, i18n.language, key => KKEmail.tr(i18n.language, key, 'gmail'));
  function renderGmail() { if (ui.sub === 'gm-settings') return GmailApp.settings(data, ui, i18n.language, key => i18n.t(key)); return LPEmail.render(data.gmailbox, ui, key => i18n.t(key), i18n.locale(), i18n.language, gmailOptions()); }
  // Each mail app keeps its own folder, conversation and selection.
  function useMailApp(app) {
    if (ui.mailApp === app) return;
    ui.mailStates ||= {};
    if (ui.mailApp) ui.mailStates[ui.mailApp] = {folder: ui.emailFolder, id: ui.emailId};
    const state = ui.mailStates[app] || {folder: app === 'gmail' ? 'Primary' : 'Inbox', id: null};
    ui.emailFolder = state.folder; ui.emailId = state.id; ui.emailSelected = []; ui.emailQuery = undefined; ui.mailApp = app;
  }
  // Share contact via Email or Gmail: the app's compose with the contact card among its files.
  // Google Search's settings (lp-search-prefs.js).
  function gsContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), account: GmailApp.account, save, render,
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  // YouTube 10's Settings (lp-youtube.js).
  function ytContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), save, render,
      closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  // Drive's Send file (the item as an attachment) and Share link (its link as the text) in Gmail, Email or Hangouts.
  function driveShareFile(app, file) {
    if (!file.photo) { shareVcard(app, file); return; }
    const photo = data.photos.find(p => p.id === file.photo); ui.overlay = ''; renderOverlay(); openApp(app); composeEmail();
    const d = mailbox().find(m => m.id === ui.emailId); if (d && photo) (d.files ||= []).push({name: photo.name, mime: 'image/jpeg', size: photo.size || 1843200, photo: clone(photo)}); save(); render();
  }
  function driveShareText(app, text, subject) {
    ui.overlay = ''; renderOverlay();
    if (app === 'hangouts') { openApp('hangouts'); ui.sub = 'new'; messageDraft().body = text; save(); render(); return; }
    openApp(app); composeEmail(); const d = mailbox().find(m => m.id === ui.emailId); if (d) { d.subject = subject; d.body = text; } save(); render();
  }
  function shareVcard(app, file) { ui.overlay = ''; renderOverlay(); openApp(app); composeEmail(); const d = mailbox().find(m => m.id === ui.emailId); if (d) (d.files ||= []).push({name: file.name, mime: file.mime, size: file.size, text: file.text}); save(); render(); }
  function composeEmail(source=null,forward=false,to='') {
    const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
    if(ui.view==='gmail'){draft.from=draft.address=GmailApp.account;}
    // Gmail's signature preference (gmail.js): "\n\n%s" after what the message starts with.
    // The Email account's signature (email-prefs.js): R.string.signature, "\n\n%s", before what the message starts with.
    if(ui.view!=='gmail'&&EmailPrefs.signatureBody(data))draft.body=EmailPrefs.signatureBody(data)+(draft.body?'\n\n'+draft.body:'');
    if(ui.view==='gmail'&&data.gmailPrefs?.signature)draft.body='\n\n'+data.gmailPrefs.signature+(draft.body?'\n\n'+draft.body:'');
    mailbox().unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
  }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);data.gmailbox=GmailApp.restore(null);ui.mailApp='';ui.mailStates={};ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Agenda';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]).concat((data.driveFiles||StockApps.FILES).map(f=>'office:'+f.id)));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);ui.browserOwner='browser';ui.browserSessions={};syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(id==='chrome'){delete data.chromeSession;delete ui.browserSessions.chrome;if(ui.browserOwner==='chrome'){ui.browserSession=restoreChrome();syncBrowserState();}save();}
    if(id==='browser'){delete data.browserSession;data.browserHistory=clone(defaultData.browserHistory);data.bookmarks=clone(defaultData.bookmarks||[]);data.savedPages=[];ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();}
    if(id==='music'){ui.music=ICSMusic.restore();saveMusic();}
    if(id==='gmail'){data.gmailbox=GmailApp.restore(null);delete data.gmailWelcomeSeen;delete data.gmailTeaserDismissed;delete data.gmailSeen;if(ui.mailApp==='gmail'){ui.emailFolder='Primary';ui.emailSelected=[];}}
    if(id==='email'){data.mailbox=ICSEmail.restore(null,emailData,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];}
    if(id==='clock')data.alarms=clone(defaultData.alarms);
    if(id==='calendar')data.events=clone(defaultData.events);
    if(id==='people'){data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;}
    if(id==='messaging'||id==='hangouts'){data.messages=clone(defaultData.messages);data.messageDrafts={};}
    if(id==='gallery'){data.photos=clone(defaultData.photos);}
    if(id==='camera')delete data.cameraSettings;
    if(id==='phone'){data.callHistory=[];ui.activeCall=null;}
    if(id==='calculator'){ui.calc='';ui.calcHistoryIndex=-1;data.calcHistory=[];}
    if(id==='play-store')delete data.playRatings;
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function operateCalculator(key) {
    if (key === 'C') { ui.calcRevealError = ui.calc === 'Error'; ui.calcReveal = Date.now(); ui.calc = ''; ui.calcFresh = false; return; }
    if (key === '⌫') { ui.calc = ui.calc === 'Error' ? '' : ui.calc.replace(/(?:sin|cos|tan|log|sqrt|√|ln)\($|.$/, ''); ui.calcFresh = false; return; }
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
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    const more = data.messageDrafts?.[ICSMessaging.draftKey(ui)]?.moreAttachments || [];
    // Messenger carries SMS; Hangouts keeps its own chats (channel 'hangouts').
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(ui.view === 'hangouts' ? {channel: 'hangouts'} : {}), ...(attachment ? {attachment:clone(attachment)} : {}) });
    more.forEach((photo, i) => data.messages.push({ id: Date.now() + i + 1, contact: id, body: '', mine: true, time: clock(), timestamp: Date.now(), read: true, ...(ui.view === 'hangouts' ? {channel: 'hangouts'} : {}), attachment: clone(photo) }));
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
    scheduleReply(id, ui.view === 'hangouts' ? 'hangouts' : 'sms');
  }
  /* A simulated answer shows Lollipop's heads-up notification: a few seconds after a text to one of the demo contacts
     they write back once (per contact and session). */
  const REPLIES = {1: 'Sounds good, see you then!', 2: 'Got it, thanks!', 3: 'Haha, nice 😄', 4: 'Love you! Talk soon ♥'};
  function scheduleReply(id, channel = 'sms') {
    const key = Number(id), app = channel === 'hangouts' ? 'hangouts' : 'messaging';
    if (!REPLIES[key] || (ui.repliedTo ||= new Set()).has(`${channel}:${key}`)) return;
    // A blocked person's Hangouts messages do not arrive (realtimechat_block_user_text).
    if (channel === 'hangouts' && !HangoutsPrefs.receives(data, key)) return;
    ui.repliedTo.add(`${channel}:${key}`);
    setTimeout(() => {
      const who = contact(key); if (!who) return;
      const open = ui.view === app && ui.sub === 'thread' && Number(ui.thread) === key;
      data.messages.push({id: Date.now(), contact: key, body: i18n.t(REPLIES[key]), mine: false, time: clock(), timestamp: Date.now(), read: open, ...(channel === 'hangouts' ? {channel} : {})});
      // Notifications off for the app or the conversation, a snooze or a block keep the answer silent.
      const quiet = channel === 'hangouts' ? !HangoutsPrefs.notifies(data, key, deviceDate().getTime()) : !MessengerOptions.notifies(data, key);
      if (!open && quiet) { save(); if (['messaging', 'hangouts'].includes(ui.view) && !ui.sub) render(); }
      else if (!open) {
        const note = {id: Date.now(), title: who.name, detail: i18n.t(REPLIES[key]), kind: 'message', contact: key, time: deviceDate().getTime(), ...(channel === 'hangouts' ? {channel} : {})};
        data.notifications.unshift(note); save(); renderStatus(); headsUp(note);
      } else { save(); render(); }
      if (ui.overlay === 'shade') renderOverlay();
    }, 4500);
  }
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
    if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return;
    // Gmail's label settings, Days of mail to sync and the vacation responder (gmail.js).
    if (action.startsWith('lng-') && InputLanguage.handle(action, id, langContext())) return;
    if (action.startsWith('pr-') && PrintSpooler.handle(action, id, printContext())) return;
    if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return;
    if (action.startsWith('ps-') && ProcStats.handle(action, id, procStatsContext())) return;
    if (action.startsWith('cert-') && CertInstall.handle(action, id, certContext())) return;
    if (action.startsWith('gmx-') && GmailApp.handlePref(action, id, {data, ui, save, render, toast, root: viewport})) return;
    // A choice in a Play app's menu closes it before its action runs (lp-play-more.js handles its own).
    if (ui.overlay === 'pa-more' && !action.startsWith('px-') && action !== 'close-overlay') { ui.overlay = ''; ui.paMore = ''; renderOverlay(); }
    if (action.startsWith('px-') && PlayMore.handle(action, id, {...playContext(ui.view), save, saveMusic, render, renderOverlay, toast, root: viewport, openApp, shareText: driveShareText})) return;
    if (action.startsWith('drv-') && LPDrive.handle(action, id, {data, ui, save, render, renderOverlay, toast, root: viewport, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), shareFile: driveShareFile, shareText: driveShareText})) return;
    if (/^(hgp|mpo)-/.test(action)) {
      const ctx = {data, ui, save, render, renderOverlay, toast, root: viewport, openApp, openThread: key => openMessageThread(key)};
      if ((action.startsWith('hgp-') ? HangoutsPrefs : MessengerOptions).handle(action, id, ctx)) return;
    }
    if (action.startsWith('calpref-') && CalendarPrefs.handle(action, id, {data, ui, save, render, toast, root: viewport, pickZone: zone => { ui.tzp = TimeZonePicker.open(zone, Date.now()); ui.tzpFor = 'home'; ui.overlay = 'tzpicker'; renderTzPicker(true); }})) return;
    // Email's Quick responses, ringtone and server screens (email-prefs.js).
    if (action.startsWith('empx-') && EmailPrefs.handle(action, id, {data, ui, save, render, root: viewport, account: ICSEmail.account})) return;
    if (action.startsWith('pe-') && window.PlusEditor?.handle(action, button, peContext())) return;
    if (action.startsWith('ldp-') && ui.docs) {
      const result = LPDocPicker.act(action, id, docContext());
      if (result.save) save();
      if (result.overlay) { ui.overlay = `ldp-${result.overlay}`; renderOverlay(); return; }
      ui.overlay = ''; renderOverlay();
      if (result.pick) { docPicked(result.pick); return; }
      render(); if (result.focus) viewport.querySelector('.ldp-search input')?.focus(); return;
    }
    if (action.startsWith('lpu-') && window.LPUsers?.handle(action, button, {data, save, render, open: sub => { ui.sub = sub; render(); }, back: () => { ui.sub = 'users'; render(); }})) return;
    if (ui.view === 'gallery' && ui.galleryPopup && action !== 'gallery-menu') ui.galleryPopup = '';
    // A tap outside the Recents popup menu only dismisses it.
    if (ui.overlay === 'recent' && ui.recentPopup && !['remove-recent', 'recent-app-info'].includes(action)) { ui.recentPopup = null; renderOverlay(); return; }
    if(ui.locked){
      // KeyguardHostView: launching from a widget or adding one needs the bouncer first.
      const pending={'kg-add-widget':{type:'add'},'widget-calendar-open':{type:'calendar'},'widget-calendar-event':{type:'calendar',id,date:button.dataset.date}}[action];
      if(pending&&ui.view==='lock'){requestBouncer(pending);return;}
      if(!['back','alarm-dismiss','alarm-snooze','lock-media'].includes(action))return;
    }
    if (action.startsWith('chrome-') && ui.sub === 'chrome-settings') {
      const result = ChromeApp.prefAction(action, id, {ui, data, locale: i18n.locale(), t: key => i18n.t(key)});
      if (result) {
        if (result === 'save' || result.toast) save();
        if (result.open) { ui.sub = ''; ui.chromePrefStack = []; chromeNewTab(false); navigateBrowser(result.open); return; }
        render(); if (result.toast) toast(result.toast); return;
      }
    }
    if(action.startsWith('nwsec-')&&NewsSections.handle(action,id,newsSectionsContext()))return;
    if(action.startsWith('fitm-')&&FitMore.handle(action,id,fitContext()))return;
    if(action.startsWith('emore-')&&EditorMore.handle(action,id,editorContext()))return;
    if(action.startsWith('kp-') && KeepMore.handle(action,id,keepMoreContext()))return;
    if (action.startsWith('cpref-') && ui.view === 'clock') {
      const result = ClockPrefs.handle(action, id, {data, ui});
      if (['cpref-main', 'jbclock-cities-menu'].includes(ui.overlay)) { ui.overlay = ''; renderOverlay(); }
      if (result === 'save') save();
      if (result?.open) { openApp('chrome'); navigateBrowser(result.open); return; }
      if (result) { render(); return; }
    }
    // The Phone app's Settings (lp-dialer-prefs.js).
    if ((action.startsWith('dpr-')) && ui.view === 'phone') {
      if (action === 'dpr-settings') { ui.overlay = ''; renderOverlay(); ui.dialerBack = [ui.sub || '']; ui.sub = 'dialer-settings'; ui.dialerDialog = ''; render(); return; }
      if (action === 'dpr-ringtone') { ui.settingsField = 'ringtone'; ui.overlay = 'sd-dialog'; renderOverlay(); return; }
      // Voicemail's Sound: a notification sound of its own; Nearby places' button opens Settings › Location.
      if (action === 'dpr-vmtone') { ui.settingsField = 'vmTone'; ui.overlay = 'sd-dialog'; renderOverlay(); return; }
      if (action === 'dpr-location') { openApp('settings'); ui.sub = 'location'; render(); return; }
      const result = LPDialerPrefs.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      if (result?.vmnumber) { LPDialerPrefs.saveVoicemail(viewport.querySelector('.ldp2-edit input')?.value || '', {data, ui}); save(); render(); return; }
      if (result?.submit) { LPDialerPrefs.saveQuick(viewport.querySelector('.ldp2-edit input')?.value || '', {data, ui, t: key => i18n.t(key), locale: i18n.locale()}); save(); render(); return; }
      if (result === 'save') save();
      if (result) { render(); return; }
    }
    if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data, ui}); if (result) { if (result.share) { shareVcard(result.share.app, result.share.file); return; } if (result.save) save(); renderOverlay(); render(); return; } }
    if (action.startsWith('vcf-')) {
      const result = PeopleIO.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      if (result) { if (result.save) save(); for (const title of result.notify || []) addNotification(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return; }
    }
    if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return;
    if (ui.view === 'youtube' && action.startsWith('yt10-') && LPYouTube.handle(action, id, ytContext())) return;
    if (ui.view === 'google-search' && action.startsWith('lsp-') && LPSearchPrefs.handle(action, id, gsContext())) return;
    switch (action) {
      case 'open-app': if (GEL_UNSIMULATED.includes(app)) { toast(i18n.t('This app is not part of the simulator.')); break; } {
        const icon = button.closest('.launcher-icon, .drawer-app, .dock-app') || button;
        // Launcher icons start apps with makeScaleUpAnimation; Recents uses makeThumbnailScaleUpAnimation from the thumbnail.
        const source = button.closest('.recent-item') ? button.closest('.recent-item').querySelector('.recent-thumbnail') : ['home', 'drawer'].includes(ui.view) ? icon : null;
        if (source) { const box = source.getBoundingClientRect(), frame = viewport.getBoundingClientRect(), k = frame.width / viewport.offsetWidth || 1; launchFrom = {left: (box.left - frame.left) / k, top: (box.top - frame.top) / k, width: box.width / k, height: box.height / k, recents: !!button.closest('.recent-item')}; }
        openApp(app || id, !!button.closest('.recent-item')); break;
      }
      // Screen pinning: Home and Overview only remind how to unpin; ScreenPinningRequest confirms the pin.
      case 'home': if (ui.pinned && ui.view !== 'lock') { pinnedToast(); break; } if (ui.view !== 'lock') home(); break;
      case 'lp-pin': event.stopPropagation(); ui.recentPopup = null; ui.recentsScroll = undefined; ui.lpRecents?.destroy(); ui.lpRecents = null; openApp(app, true); ui.overlay = 'pin-request'; renderOverlay(); updateBarMode(); break;
      case 'pin-ok': ui.pinned = ui.view; ui.overlay = ''; renderOverlay(); updateBarMode(); toast(i18n.t('Screen pinned')); break;
      case 'pin-cancel': ui.overlay = ''; renderOverlay(); break;
      case 'lp-pin-lock': { const secure = ['pin', 'password', 'pattern'].includes(data.settings.screenLock), current = data.settings.pinExitLocked ?? secure;
        // Without a secure lock, turning it on asks for one first (ChooseLockGeneric).
        if (!current && !secure) { data.settings.pinExitLocked = true; save(); lockControls.open(); render(); break; }
        data.settings.pinExitLocked = !current; save(); render(); break; }
      case 'back': back(); break;
      case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
      case 'ga-bugreport': ui.overlay = 'power-confirm'; ui.powerKind = 'bugreport'; renderOverlay(); break;
      case 'ga-confirm': powerConfirm(id); break;
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
      // The Google Now Launcher's third overview button opens the Google Search settings (not simulated).
      case 'gnow-drawer': document.querySelectorAll('.gnow-page').forEach(page => page.classList.toggle('drawer-open')); break;
      // Google Now reminders and card settings (gel-now.js).
      case 'gnow-reminders': document.querySelectorAll('.gnow-page.drawer-open').forEach(page => page.classList.remove('drawer-open')); ui.gnowDraft = null; ui.gnowDialog = ''; openApp('google-search'); ui.sub = 'reminders'; render(); break;
      case 'gnow-reminder-new': ui.gnowDraft = {...GELNow.draftFrom(null, deviceDate()), home: data.mapsHome || '', work: data.mapsWork || ''}; ui.gnowSpin = ''; render(); viewport.querySelector('[data-gnr-title]')?.focus(); break;
      case 'gnow-reminder-edit': { const item = (data.nowReminders || []).find(r => r.id === id); if (item) { ui.gnowDraft = {...GELNow.draftFrom(item, deviceDate()), home: data.mapsHome || '', work: data.mapsWork || ''}; ui.gnowSpin = ''; render(); } break; }
      case 'gnow-reminder-spin': ui.gnowSpin = ui.gnowSpin === id ? '' : id; render(); break;
      case 'gnow-reminder-pick': if (id === 'day:3' || id === 'time:5') { const d = ui.gnowDraft; ui.gnowSpin = ''; render(); ui.dtp = DateTimePicker.fromValue(id === 'day:3' ? 'date' : 'time', id === 'day:3' ? (d.date || ICSCalendar.iso(deviceDate())) : (d.time || '09:00'), {field: 'gnow', setAction: 'gnow-dtp-set', hour24: !!data.settings.hour24}); ui.overlay = 'dtp'; renderOverlay(); break; } {
        const [kind, value] = id.split(':'), next = {...ui.gnowDraft, [kind === 'day' ? 'day' : 'slot']: Number(value)}; ui.gnowSpin = ''; if (GELNow.draftReminder({...next, day: kind === 'day' ? next.day : 0, slot: kind === 'time' ? next.slot : 0}, deviceDate())) ui.gnowDraft = next; else toast('Not available in this demo'); render(); break; }
      case 'gnow-dtp-set': { const p = ui.dtp, d = ui.gnowDraft; ui.overlay = ''; renderOverlay(); if (!p || !d) break; if (p.kind === 'date') Object.assign(d, {day: -1, date: DateTimePicker.iso(p)}); else Object.assign(d, {slot: -1, time: DateTimePicker.hhmm(p)}); render(); break; }
      // Where: the location spinner's Home / Work (set once through the place search) and Set location.
      case 'gnow-trigger': if (ui.gnowDraft) { ui.gnowDraft.trigger = id; ui.gnowSpin = ''; render(); } break;
      case 'gnow-place-option': { const d = ui.gnowDraft; if (!d) break; ui.gnowSpin = ''; if (id !== 'custom' && d[id]) d.place = {label: id, address: d[id]}; else d.placeDialog = {kind: id, q: ''}; render(); viewport.querySelector('[data-gnp-q]')?.focus(); break; }
      case 'gnow-place-pick': { const d = ui.gnowDraft, hit = GELNow.PLACES.find(([name]) => name === id); if (!d || !hit) break; const [name, address] = hit, kind = d.placeDialog?.kind;
        if (kind === 'home' || kind === 'work') { data[kind === 'home' ? 'mapsHome' : 'mapsWork'] = address; d[kind] = address; d.place = {label: kind, address}; save(); } else d.place = {name, address};
        d.placeDialog = null; render(); break; }
      case 'gnow-place-close': if (ui.gnowDraft) { ui.gnowDraft.placeDialog = null; render(); } break;
      // Repeat: the recurrence dialog's switch, week days, month pattern and Done.
      case 'gnow-rule-open': { const d = ui.gnowDraft; if (!d) break; const date = GELNow.draftReminder(d, deviceDate())?.date || ICSCalendar.iso(deviceDate()); d.ruleDialog = {...GELNow.ruleFrom(date, d.rule), on: !!d.rule}; render(); break; }
      case 'gnow-rule-switch': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.on = !ui.gnowDraft.ruleDialog.on; render(); } break;
      case 'gnow-rule-day': { const r = ui.gnowDraft?.ruleDialog; if (!r) break; const day = Number(id); r.days = r.days.includes(day) ? (r.days.length > 1 ? r.days.filter(x => x !== day) : r.days) : [...r.days, day].sort(); render(); break; }
      case 'gnow-rule-month': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.monthly = id; render(); } break;
      case 'gnow-rule-cancel': if (ui.gnowDraft) { ui.gnowDraft.ruleDialog = null; render(); } break;
      case 'gnow-rule-done': { const d = ui.gnowDraft, r = d?.ruleDialog; if (!r) break; d.rule = r.on ? {freq: r.freq, interval: r.interval, days: r.days, monthly: r.monthly, end: r.end, until: r.until, count: r.count} : null; d.ruleDialog = null; render(); break; }
      // The appointment card's back: its event in Calendar's editor.
      case 'gnow-event-edit': { const event = (data.events || []).find(item => String(item.id) === String(id)); ui.gnowBack = ''; if (!event) break; openApp('calendar'); ui.selectedEvent = event.id; calendarEdit(event); break; }
      case 'gnow-undo': data.nowDismissed = (data.nowDismissed || []).filter(key => key !== ui.gnowUndo); ui.gnowUndo = ''; save(); render(); break;
      case 'gnow-reminder-cancel': ui.gnowDraft = null; ui.gnowSpin = ''; render(); break;
      case 'gnow-reminder-set': { const draft = ui.gnowDraft, when = draft && GELNow.draftReminder(draft, deviceDate()), title = String(draft?.title || '').trim(); if (!when || !title || (draft.trigger === 'place' && !draft.place)) break; const extra = {occasionally: !!when.occasionally, trigger: draft.trigger || 'time', place: draft.trigger === 'place' ? draft.place : null, rule: draft.trigger === 'place' ? null : draft.rule || null}; const list = data.nowReminders ||= []; const item = list.find(r => r.id === draft.id); if (item) Object.assign(item, {title, ...when, ...extra}); else list.push({id: 'r' + Date.now(), title, ...when, ...extra}); ui.gnowDraft = null; ui.gnowSpin = ''; save(); render(); toast(AndroidStrings.pick(window.StockStrings?.google?.['Reminder saved'], i18n.locale(), 'Reminder saved')); break; }
      case 'gnow-reminder-menu': ui.gnowDialog = id; render(); break;
      case 'gnow-reminder-delete': data.nowReminders = (data.nowReminders || []).filter(r => r.id !== id); ui.gnowDialog = ''; ui.gnowDraft = null; save(); render(); break;
      case 'gnow-dialog-close': ui.gnowDialog = ''; render(); break;
      case 'gnow-card-back': ui.gnowBack = ui.gnowBack === id ? '' : id; render(); break;
      case 'gnow-units': data.nowUnits = Number(id); save(); render(); break;
      case 'gel-overview-settings': document.querySelectorAll('.gnow-page.drawer-open').forEach(page => page.classList.remove('drawer-open')); openApp('google-search'); ui.sub = 'settings'; ui.lsPage = ''; render(); break;
      // Google Settings' Play Games opens the Games app.
      case 'gs-play-games': openApp('play-games'); break;
      case 'kk-overview-page': if (ui.overview) { ui.overview = false; ui.page = Number(id); render(); } break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': openApp('play-music'); break;
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'widget-music-prev': ICSMusic.step(ui.music, -1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
      case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
      case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
      case 'widget-photo-cancel': cancelPhotoWidget(); break;
      case 'open-wallpapers': ui.overlay = ''; ui.overview = false; ui.wp = {selected: '', temp: [], checked: [], stripHidden: false}; ui.view = 'wallpaper-picker'; render(); break;
      // Launcher3 WallpaperPickerActivity: tiles preview, the action bar sets, a long press on a picked or saved image
      // starts the delete CAB, Pick image goes through DocumentsUI.
      case 'kwp-tile': {
        const wp = ui.wp ||= {selected: '', temp: [], checked: []};
        if (wp.checked?.length) { if (button.dataset.kwpLong) { wp.checked = wp.checked.includes(id) ? wp.checked.filter(k => k !== id) : [...wp.checked, id]; wallpaperPickerRender(); } break; }
        wp.selected = id; wp.stripHidden = false; wallpaperPickerRender(); break;
      }
      case 'kwp-tap': if (ui.wp) { ui.wp.stripHidden = !ui.wp.stripHidden; viewport.querySelector('.kwp-strip')?.classList.toggle('hidden', ui.wp.stripHidden); } break;
      case 'kwp-pick': docPick('wallpaper', 'image/*'); break;
      case 'kwp-cab-done': if (ui.wp) { ui.wp.checked = []; wallpaperPickerRender(); } break;
      case 'kwp-delete': { const wp = ui.wp, gone = new Set((wp?.checked || []).map(k => Number(k.slice(6)))); if (!wp) break; data.kkSavedWallpapers = (data.kkSavedWallpapers || []).filter(x => !gone.has(x)); wp.temp = (wp.temp || []).filter(x => !gone.has(x)); if (wp.checked.includes(wp.selected)) wp.selected = ''; wp.checked = []; save(); wallpaperPickerRender(); break; }
      case 'kwp-set': {
        const key = ui.wp?.selected || '';
        if (key === 'default' || key.startsWith('wp:')) { data.wallpaper = key === 'default' ? 0 : Number(key.slice(3)); delete data.customWallpaper; delete data.customWallpaperPhoto; save(); }
        else if (key.startsWith('photo:')) { const photo = data.photos.find(p => p.id === Number(key.slice(6))); if (photo) { data.kkSavedWallpapers = [photo.id, ...(data.kkSavedWallpapers || []).filter(x => x !== photo.id)]; galleryWallpaper(photo, true); } }
        ui.wp = null; home(false); break;
      }
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      case 'photos-set-wallpaper': ui.overlay = ''; openApp('photos'); break;
      case 'market': openApp('play-store'); break;
      case 'play-menu': case 'jbp-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
      case 'jbp-section': jbPlayGo({page: 'section', section: id, tab: button.dataset.tab || 'Home'}); break;
      case 'jbp-tab': if (id) { ui.market.tab = id; render(); viewport.querySelector('.jbp-tabs button.on')?.scrollIntoView({inline: 'center', block: 'nearest'}); } break;
      case 'jbp-detail': jbPlayGo({page: 'detail', selected: id, expanded: false}); break;
      case 'jbp-card-menu': { const rect = button.getBoundingClientRect(), box = screen.getBoundingClientRect(); ui.marketTarget = id; ui.marketPopTop = Math.round((rect.bottom - box.top) / (box.height / screen.offsetHeight)) - 26; ui.overlay = 'jbp-card'; renderOverlay(); break; }
      case 'jbp-wish': { const list = data.marketWishlist || [], had = list.includes(id); data.marketWishlist = had ? list.filter(x => x !== id) : [...list, id]; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break; }
      case 'jbp-buy': { const item = JBPlay.find(id); ui.overlay = ''; renderOverlay(); if (item && item.price !== 'FREE') { toast(JBPlay.text(i18n.language, 'Unavailable')); break; } ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = false; ui.overlay = 'jbp-perms'; renderOverlay(); break; }
      case 'jbp-accept': ui.overlay = ''; renderOverlay(); jbPlayDownload(id); break;
      case 'jbp-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); save(); renderStatus(); render(); break;
      case 'jbp-open': { const item = JBPlay.find(id); if (item?.app) openApp(item.app); else toast(JBPlay.text(i18n.language, 'Unavailable')); break; }
      case 'jbp-uninstall': ui.overlay = ''; renderOverlay(); data.marketInstalled = (data.marketInstalled || []).filter(x => x !== id); save(); render(); break;
      case 'jbp-uninstall-ask': ui.marketTarget = id; ui.overlay = 'jbp-uninstall'; renderOverlay(); break;
      case 'jbp-archive': data.marketEverInstalled = (data.marketEverInstalled || []).filter(x => x !== id); save(); jbPlayKeepScroll(); break;
      case 'jbp-rate-dialog': ui.marketTarget = id; ui.marketRateDraft = button.dataset.stars ? Number(button.dataset.stars) : undefined; ui.overlay = 'jbp-rate'; renderOverlay(); break;
      case 'jbp-rate-pick': ui.marketRateDraft = Number(id); renderOverlay(); break;
      case 'jbp-rate-ok': data.marketRated = {...(data.marketRated || {}), [id]: ui.marketRateDraft ?? (data.marketRated || {})[id] ?? 0}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
      case 'jbp-content-filter': ui.marketFilterDraft = undefined; ui.overlay = 'jbp-filter'; renderOverlay(); break;
      case 'jbp-filter-pick': { const levels = ['Everyone', 'Low maturity', 'Medium maturity', 'High maturity', 'Show all apps'], cur = ui.marketFilterDraft || jbPlayContext().prefs.filter || levels; let next = cur.includes(id) ? cur.filter(x => x !== id && (id !== 'Show all apps' ? x !== 'Show all apps' : true)) : [...cur, id]; if (id === 'Show all apps') next = cur.includes(id) ? [] : levels; else if (levels.slice(0, 4).every(l => next.includes(l))) next = levels; ui.marketFilterDraft = next; renderOverlay(); break; }
      case 'jbp-filter-ok': data.marketPrefs = {...jbPlayContext().prefs, filter: ui.marketFilterDraft || jbPlayContext().prefs.filter}; save(); ui.overlay = ''; renderOverlay(); break;
      case 'lpp-auth': ui.overlay = 'jbp-auth'; renderOverlay(); break;
      case 'lpp-auth-pick': data.marketPrefs = {...jbPlayContext().prefs, auth: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
      case 'lpp-auto-item': { const sel = ui.market?.selected, list = data.marketAuto || []; if (sel) data.marketAuto = list.includes(sel) ? list.filter(x => x !== sel) : [...list, sel]; save(); ui.overlay = ''; renderOverlay(); break; }
      case 'jbp-noop': break;
      case 'jbp-plus': { const list = data.marketPlus || []; data.marketPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); jbPlayKeepScroll(); break; }
      case 'jbp-my-apps': jbPlayGo({page: 'my-apps', tab: 'INSTALLED'}); break;
      case 'jbp-wishlist': jbPlayGo({page: 'wishlist'}); break;
      case 'jbp-settings': jbPlayGo({page: 'settings'}); break;
      // Share on the details page: the chooser, then the target's compose screen with the link (play-store.js).
      case 'jbp-share': ui.marketTarget = id || ui.market?.selected; ui.overlay = 'jbp-share'; renderOverlay(); break;
      case 'jbp-share-to': { const [app, itemId] = String(id).split('|'), item = JBPlay.find(itemId); ui.overlay = ''; renderOverlay(); if (item) driveShareText(app, JBPlay.shareLink(item), JBPlay.fmt(JBPlay.text(i18n.language, 'Check out "%1$s"'), item.name)); break; }
      case 'jbp-dev-email': { const item = JBPlay.find(id); if (!item) break; openApp('gmail'); composeEmail(null, false, JBPlay.developerEmail(item)); const d = mailbox().find(m => m.id === ui.emailId); if (d) d.subject = item.name; save(); render(); break; }
      case 'lpp-readmore': ui.market = {...(ui.market || {}), expanded: true}; jbPlayKeepScroll(); break;
      case 'jbp-unavailable': ui.overlay = ''; renderOverlay(); toast(JBPlay.text(i18n.language, 'Unavailable')); break;
      case 'jbp-pref': { const base = jbPlayContext().prefs; data.marketPrefs = {...base, [id]: !base[id]}; save(); jbPlayKeepScroll(); break; }
      case 'jbp-auto-update': ui.overlay = 'jbp-auto'; renderOverlay(); break;
      case 'jbp-auto-pick': data.marketPrefs = {...jbPlayContext().prefs, autoMode: id}; save(); ui.overlay = ''; renderOverlay(); jbPlayKeepScroll(); break;
      case 'jbp-clear-history': data.marketSearches = []; save(); break;
      // Play Store 4.8: the navigation drawer, the permissions note on the home page, the grouped permission rows and
      // "Permission details", and the Require password list.
      case 'kkp-drawer': ui.overlay = 'jbp-drawer'; renderOverlay(); break;
      case 'kkp-home': ui.marketHistory = []; ui.market = {page: 'home'}; ui.overlay = ''; ui.marketSearching = false; render(); break;
      case 'kkp-perm': ui.marketPermOpen = ui.marketPermOpen === id ? '' : id; renderOverlay(); break;
      case 'kkp-perm-details': ui.marketTarget = id; ui.marketPermOpen = ''; ui.marketPermView = true; ui.overlay = 'jbp-perms'; renderOverlay(); break;
      case 'jbp-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.jbp-bar input')?.focus(); break;
      case 'jbp-search-run': data.marketSearches = [id, ...(data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); jbPlayGo({page: 'search', query: id}); break;
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
        if (id === 'brightness') data.settings.brightness = data.settings.brightness < 30 ? 55 : data.settings.brightness < 80 ? 100 : 20;
        else data.settings[id] = !data.settings[id];
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        save(); render(); break;
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'voice-search': toast('Voice search unavailable offline'); break;
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': if (ui.pinned) break; ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': {
        if (ui.view === 'lock') break;
        if (ui.pinned) { pinnedToast(); break; }
        if (ui.overlay === 'recent') { closeRecents(); break; }
        captureRecentView(); ui.recentPopup = null; ui.recentsScroll = undefined;
        ui.recentsFrom = ui.view === 'home' ? 'home' : 'app'; ui.recentsAt = performance.now(); ui.overlay = 'recent'; renderOverlay(); updateBarMode();
        break;
      }
      case 'recent-app-info': ui.overlay = ''; ui.recentPopup = null; openApp('settings'); ui.settingsApp = id; ui.sub = 'app-info'; render(); break;
      case 'close-overlay': if (ui.overlay === 'recent') { closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
      case 'remove-recent': {
        // TaskView.startDeleteTaskAnimation: translationX to recents_task_view_remove_anim_translation_x (100 dp) and alpha
        // 0 over recents_animate_task_view_remove_duration (250 ms) with fast_out_slow_in, then the task goes.
        event.stopPropagation(); ui.recentPopup = null;
        const card = button.closest('.lp-task');
        if (!card || reducedMotion?.matches) { removeRecentTask(id); break; }
        card.style.transition = 'translate .25s cubic-bezier(.4,0,.2,1), opacity .25s cubic-bezier(.4,0,.2,1)';
        card.style.translate = `${(100 * LPRecents.DP()).toFixed(2)}px 0`; card.style.opacity = '0';
        setTimeout(() => removeRecentTask(id), 250); break;
      }
      case 'clear-notifications': {
        const rows = [...overlayRoot.querySelectorAll('.jb-note')], delays = LPShade.clearDelays(rows.length);
        if (reducedMotion?.matches || !rows.length) { data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break; }
        overlayRoot.querySelector('.jb-shade-clear')?.setAttribute('hidden', '');
        rows.forEach((row, index) => row.animate([{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${row.offsetWidth}px)`, opacity: 0}], {duration: 125, delay: delays[index], easing: 'linear', fill: 'forwards'}));
        setTimeout(() => { data.notifications = []; save(); renderStatus(); if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }, (delays.at(-1) || 0) + 125 + 225);
        break;
      }
      case 'dream-pick': data.settings.daydreamType = id; save(); render(); break;
      case 'dream-when': ui.overlay = 'dream-when'; renderOverlay(); break;
      case 'dream-when-pick': data.settings.daydreamWhen = id; save(); ui.overlay = ''; render(); break;
      case 'dream-start': ui.overlay = 'dream'; ui.dreamKey = ''; renderOverlay(); break;
      case 'dream-exit': ui.overlay = ''; renderOverlay(); break;
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
      case 'notification-action': if (button.dataset.noteAction === 'reply') { const note = data.notifications.find(item => String(item.id) === id); releaseHeadsUp(); data.notifications = data.notifications.filter(item => item !== note); save(); renderStatus(); ui.overlay = ''; openApp(note?.channel === 'hangouts' ? 'hangouts' : 'messaging'); openMessageThread(note?.contact || 1); break; } { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar' && button.dataset.noteAction === 'snooze') { data.notifications = data.notifications.filter(item => item !== note); (data.calendarSnoozes ||= []).push({eventId: note.eventId, date: note.date, title: note.title, detail: note.detail, at: deviceDate().getTime() + 5 * 60000}); save(); renderStatus(); if (!data.notifications.length) ui.overlay = ''; renderOverlay(); toast('Snoozed'); } break; }
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; }
        releaseHeadsUp();
        if (note?.kind === 'message') { data.notifications = data.notifications.filter(item => item !== note); save(); renderStatus(); ui.overlay = ''; openApp(note.channel === 'hangouts' ? 'hangouts' : 'messaging'); openMessageThread(note.contact); break; }
        ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break; }
      case 'unlock': ui.view = 'home'; render(); break;
      // ActivatableNotificationView: the first touch activates the card ("Touch again to open"), the second opens it.
      case 'lp-kg-note': if (ui.kgActivated !== id) { ui.kgActivated = id; viewport.querySelectorAll('.lp-kg-note').forEach(node => node.classList.toggle('activated', node.dataset.id === id)); kgHint('Touch again to open'); break; }
        ui.kgActivated = ''; if (ui.locked) { requestBouncer({type: 'note', id}); break; } { const opener = document.createElement('button'); opener.dataset.action = 'notification-open'; opener.dataset.id = id; screen.append(opener); home(false); opener.click(); opener.remove(); } break;
      case 'unlock-camera': openApp('camera'); break;
      case 'kk-location-mode': data.settings.gps = id !== 'battery'; data.settings.networkLocation = id !== 'device'; save(); render(); break;
      case 'kk-sms-app': ui.overlay = 'kk-sms-app'; renderOverlay(); break;
      case 'kk-cast-menu': ui.overlay = 'kk-cast-menu'; renderOverlay(); break;
      case 'kk-cast-enable': data.settings.wifiDisplay = !data.settings.wifiDisplay; save(); ui.overlay = ''; render(); break;
      case 'ldu-menu': ui.overlay = `ldu-${id}`; renderOverlay(); break;
      case 'ldu-sort': ui.dlSort = id; ui.overlay = ''; render(); break;
      case 'ldu-view': ui.dlGrid = id === 'grid'; ui.overlay = ''; render(); break;
      case 'ldu-search': toast('No items'); break;
      case 'settings-sub': ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
      case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
      case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
      case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
      case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
      case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id==='gallery'?'photos':'play-music');else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
      case 'sd-battery-history': ui.sub='battery-history';render();break;
      case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
      case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
      case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
      case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
      case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
      case 'wifi-wps': ui.wps = {mode: id === 'pin' ? 'pin' : 'pbc', start: Date.now(), pin: String(Math.floor(10000000 + Math.random() * 89999999))}; ui.overlay = 'wifi-wps'; renderOverlay(); break;
      case 'p2p-search': startP2pSearch(); render(); break;
      case 'p2p-menu': ui.overlay = 'p2p-menu'; renderOverlay(); break;
      case 'p2p-rename': ui.overlay = 'p2p-rename'; renderOverlay(); break;
      case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
      case 'lp-settings-menu': ui.lpMenu = id; ui.overlay = 'lp-settings-menu'; renderOverlay(); break;
      case 'lp-auto-sync': data.settings.autoSync = data.settings.autoSync === false; ui.overlay = ''; save(); renderOverlay(); render(); break;
      case 'lp-sync-toggle': { const off = data.settings.syncOff ||= {}; if (data.settings.autoSync === false) break; off[id] = !off[id]; save(); render(); break; }
      case 'lp-sync-now': ui.overlay = ''; renderOverlay(); render(); break;
      case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
      case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
      case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
      case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
      case 'bluetooth-confirm': data.settings.pairedDevice = data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
      case 'wifi-network': ui.wifiTarget = id; ui.overlay = 'wifi-dialog'; renderOverlay(); break;
      case 'wifi-connect': {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
        data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true;
        save(); ui.overlay = ''; render(); break;
      }
      case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
      case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
      case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
      case 'set-language': i18n.setLanguage(id); location.reload(); break;
      case 'sx-dialog': if(id==='screen-lock'){lockControls.open();break;}ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-new': ui.systemDraft={};ui.systemField='vpn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-open': ui.systemId=id;ui.systemField='vpn-connect';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-vpn-edit': ui.systemValues=null;ui.systemDraft=clone((data.vpnProfiles||[]).find(profile=>profile.id===ui.systemId)||{});ui.systemField='vpn-edit';renderOverlay();break;
      case 'sx-profile-delete': ui.systemDeleteKind=id;ui.systemField='profile-delete';renderOverlay();break;
      case 'sx-network-scan': ui.networkScanned=true;render();break;
      case 'sx-network-auto': data.settings.networkAuto=true;data.settings.networkOperator='Telekom';save();render();break;
      case 'sx-network-select': data.settings.networkAuto=false;data.settings.networkOperator=id;save();render();break;
      case 'sx-apn-new': ui.systemDraft={};ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-apn-open': ui.systemDraft=clone((data.apnProfiles||[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}]).find(profile=>profile.id===id)||{});ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
      case 'sx-apn-select': data.settings.apnId=id;save();render();break;
      case 'dev-info': toast(i18n.t('This feature is not part of the simulator.')); break;
      // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
      case 'dev-list': ui.devList = id; ui.overlay = 'dev-list'; renderOverlay(); break;
      case 'dev-list-pick': { const cut = id.lastIndexOf(':'); data.settings[id.slice(0, cut)] = Number(id.slice(cut + 1)); save(); ui.overlay = ''; renderOverlay(); render(); break; }
      // Interruptions (lp-zen.js): the DropDownPreference lists, the condition dialog after priority / none, Days, the times.
      case 'lp-zen-drop': ui.zenDrop = id; ui.overlay = 'lp-zen-drop'; renderOverlay(); break;
      case 'lp-zen-pick': {
        const [kind, value] = id.split(':'), s = data.settings;
        ui.overlay = '';
        if (kind === 'mode' && value !== (s.zenMode || 'all')) {
          const old = s.zenMode || 'all', oldExit = s.zenExit || null;
          s.zenMode = value;
          if (value === 'all') s.zenExit = null;
          else { const now = deviceDate().getTime(); ui.zenCond = {mode: value, old, oldExit, index: 0, list: LPZen.conditions(s, now, nextAlarmTime())}; ui.overlay = 'lp-zen-cond'; }
        }
        if (kind === 'from') s.zenFrom = value;
        if (kind === 'downtime' && s.zenSleepNone !== (value === 'none')) { s.zenSleepNone = value === 'none'; delete s.zenDowntimed; }
        save(); render(); renderOverlay(); break;
      }
      case 'lp-zen-cond': ui.zenCond.index = Number(id); renderOverlay(); break;
      case 'lp-zen-ok': LPZen.confirm(data.settings, ui.zenCond.list[ui.zenCond.index], deviceDate().getTime()); ui.zenCond = null; ui.overlay = ''; save(); render(); renderOverlay(); break;
      case 'lp-zen-cancel': data.settings.zenMode = ui.zenCond.old; data.settings.zenExit = ui.zenCond.oldExit; ui.zenCond = null; ui.overlay = ''; save(); render(); renderOverlay(); break;
      case 'lp-zen-days': ui.overlay = 'lp-zen-days'; renderOverlay(); break;
      case 'lp-zen-day': { const day = Number(id), days = new Set(data.settings.zenDays || []); if (days.has(day)) days.delete(day); else days.add(day); data.settings.zenDays = [...days].sort(); delete data.settings.zenDowntimed; save(); render(); renderOverlay(); break; }
      case 'lp-zen-time': { const [h, m] = (data.settings[id === 'start' ? 'zenStart' : 'zenEnd'] || (id === 'start' ? '22:00' : '07:00')).split(':').map(Number); ui.kdcPicker = {zen: id, hour: h, minute: m, mode: 'hour'}; ui.overlay = 'kdc-picker'; renderOverlay(); break; }
      case 'lp-lock-notif': { const order = ['show', 'hide', 'none']; data.settings.lockNotifications = order[(order.indexOf(data.settings.lockNotifications || 'show') + 1) % 3]; save(); render(); break; }
      case 'build-tap': {
        if (data.settings.developerUnlocked) { toast('No need, you are already a developer.'); break; }
        const remaining = 7 - ++ui.buildTaps;
        if (remaining <= 0) { data.settings.developerUnlocked = true; ui.buildTaps = 0; save(); toast('You are now a developer!'); }
        else if (remaining < 5) toast(AndroidStrings.format(i18n.t(AndroidStrings.quantity(remaining) === 'one' ? 'You are now %d step away from being a developer.' : 'You are now %d steps away from being a developer.'), remaining));
        break;
      }
      case 'toggle-setting': {
        if (id === 'magnification' && data.settings.magnification) { ui.magnify = null; applyMagnification(); }
        const previousScroll = viewport.querySelector('.settings-app')?.scrollTop || 0;
        data.settings[id] = !data.settings[id];
        if(id==='autoTime')data.settings.timeOffset=0;
        if(id==='autoZone'&&!data.settings.autoZone)data.settings.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.wifiDirect = false; data.settings.portableHotspot = false;data.settings.bluetoothTether=false;ui.vpnConnected=null; }
        if(id==='portableHotspot'&&data.settings.portableHotspot)data.settings.wifi=false;
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetoothTether'&&data.settings.bluetoothTether)data.settings.bluetooth=true;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        if (id === 'nfc' && !data.settings.nfc) data.settings.androidBeam = false;
        if (id === 'nfc' && data.settings.nfc) data.settings.androidBeam = true;
        save(); render(); const settingsView = viewport.querySelector('.settings-app'); if (settingsView) settingsView.scrollTop = previousScroll; break;
      }
      case 'wallpaper': data.wallpaper = Number(id); delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'factory-reset': if (confirm(i18n.t('Reset all local Lollipop simulator data?'))) resetSimulator(); break;
      case 'about-tap':
        ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
        if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.aboutTapTimes = []; render(); }
        break;
      // The Email app's settings (email-prefs.js, from the image's EmailGoogle preference XMLs).
      case 'emailpref-page': ui.emPref = id; render(); break;
      case 'emailpref-toggle': (data.emailPrefs ||= {})[id] = !EmailPrefs.value(data, id, ICSEmail.account); save(); render(); break;
      case 'emailpref-list': ui.emPrefList = id; render(); break;
      case 'emailpref-pick': { const [key, value] = id.split(':'); (data.emailPrefs ||= {})[key] = Number(value); ui.emPrefList = ''; save(); render(); break; }
      case 'emailpref-edit': ui.emPrefEdit = id; ui.emPrefEditValue = undefined; render(); viewport.querySelector('[data-email-pref-edit]')?.focus(); break;
      case 'emailpref-save': { const field = viewport.querySelector('[data-email-pref-edit]'); if (ui.emPrefEdit && field) { (data.emailPrefs ||= {})[ui.emPrefEdit] = field.value.trim(); save(); } ui.emPrefEdit = ''; render(); break; }
      case 'emailpref-close': ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); render(); break;
      case 'emailpref-unsupported': toast('This feature is not part of the simulator.'); break;
      case 'a11y-hold': ui.overlay = 'a11y-hold'; renderOverlay(); break;
      case 'a11y-hold-pick': data.settings.longPressTimeout = Number(id); ui.overlay = ''; save(); renderOverlay(); render(); break;
      case 'toast': toast(id); break;
      case 'people-place-home': ui.overlay = ''; renderOverlay(); placeContactShortcut(data.contacts.find(p => p.id === (Number(id) || ui.selectedContact))); break;
      case 'open-contact': { const person = data.contacts.find(p => p.id === Number(id)); openApp('people'); if (person) { ui.selectedContact = person.id; ui.sub = 'detail'; render(); } break; }
      // Security's sub-pages (lp-security.js).
      case 'lps-toast': toast(i18n.t(id)); break;
      case 'lps-sim': ui.lpsPin = {mode: id, step: 'pin'}; ui.overlay = 'lps-pin'; renderOverlay(); break;
      case 'lps-pin-ok': { const value = overlayRoot.querySelector('[data-lps-pin]')?.value || '', note = LPSecurity.pinOk(data, ui, value); if (note === null) { renderOverlay(); break; } save(); ui.overlay = ''; renderOverlay(); render(); if (note) toast(i18n.t(note)); break; }
      case 'lps-tab': ui.lpsTab = id; render(); break;
      case 'lps-cert': ui.lpsCert = id; ui.overlay = 'lps-cert'; renderOverlay(); break;
      case 'lps-cert-ask': ui.overlay = 'lps-confirm'; renderOverlay(); break;
      case 'lps-cert-toggle': { const off = new Set(data.settings.disabledCerts || []); if (off.has(ui.lpsCert)) off.delete(ui.lpsCert); else off.add(ui.lpsCert); data.settings.disabledCerts = [...off]; save(); ui.overlay = ''; renderOverlay(); render(); break; }
      case 'lps-agent': data.settings.smartLockAgent = data.settings.smartLockAgent === false; save(); render(); break;
      case 'noop': break;
      case 'browser-search': openApp('chrome'); document.querySelector('.chr-omnibox input')?.focus(); break;
      case 'browser-link': navigateBrowser(url); break;
      case 'browser-forward': browserForward(); break;
      case 'browser-tabs': ui.sub = 'tabs'; render(); break;
      case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
      case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
      case 'browser-bookmark': navigateBrowser(id); break;
      case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
      case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
      case 'browser-close-tab': { const last = ui.browserSession.tabs.length === 1; ICSBrowserSession.close(ui.browserSession,Number(id)); if (last && ui.browserOwner === 'chrome') ui.browserSession.tabs[0].history = [ChromeApp.NTP]; saveBrowserState(); render(); break; }
      case 'browser-refresh': ui.overlay=''; render(); break;
      case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
      case 'browser-close-find': ui.browserFind=undefined; render(); break;
      // Chrome menu and New Tab page
      case 'chrome-incognito': chromeNewTab(true); break;
      // Google, Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google Settings
      // Google Settings' GMS pages (gms-settings.js).
      case 'gms-open': ui.sub = `gms-${id}`; ui.gmsDialog = ''; if (id === 'ads' && !data.gms?.adid) { data.gms = {...GMSSettings.state(data), adid: GMSSettings.newId()}; save(); } render(); break;
      case 'gms-toggle': { const s = GMSSettings.state(data); data.gms = {...s, [id]: !s[id]}; save(); render(); break; }
      case 'gms-reset': ui.gmsDialog = ''; data.gms = {...GMSSettings.state(data), adid: GMSSettings.newId()}; save(); render(); break;
      case 'gms-dialog': ui.gmsDialog = id; ui.gmsUnderstand = false; render(); break;
      case 'gms-understand': ui.gmsUnderstand = !ui.gmsUnderstand; render(); break;
      case 'gms-delete': ui.gmsDialog = ''; ui.gmsDeleting = true; render(); setTimeout(() => { ui.gmsDeleting = false; if (ui.sub === 'gms-history') render(); }, 1500); break;
      case 'sa-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'voice-listen': listenVoice(); break;
      case 'google-now-toggle': data.googleNowOn = data.googleNowOn === false; save(); render(); break;
      case 'maps-locate': ui.mapsQuery = ''; render(); break;
      // Maps 9.3: the search box's grabber opens the side menu; a layer toggles the map's look.
      case 'maps-panel': ui.mapsPanel = !ui.mapsPanel; render(); break;
      case 'maps-layer': data.mapsLayer = data.mapsLayer === id ? '' : id; save(); render(); break;
      case 'drive-nav': ui.driveNav = !ui.driveNav; render(); break;
      case 'drive-open': ui.driveFrom = ui.sub; ui.driveFile = id; ui.sub = 'file'; render(); break;
      case 'keep-open': ui.keepNote = id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break;
      case 'keep-delete': ui.overlay = ''; renderOverlay(); data.keepNotes = (data.keepNotes || []).filter(note => note.id !== ui.keepNote); ui.sub = ''; save(); render(); break;
      case 'keep-new': { const note = {id: 'k' + Date.now(), text: '', color: 0}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break; }
      case 'keep-color': { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.color = ((note.color || 0) + 1) % 5; save(); render(); } break; }
      case 'keep-archive': { ui.overlay = ''; renderOverlay(); const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.archived = !note.archived; ui.sub = ''; save(); render(); } break; }
      case 'keep-columns': ui.overlay = ''; renderOverlay(); data.keepSingle = !data.keepSingle; save(); render(); break;
      case 'keep-refresh': ui.overlay = ''; renderOverlay(); render(); break;
      // List and picture notes (stock-apps.js keepEditor / keepDialog).
      case 'keep-new-list': { const note = {id: 'k' + Date.now(), text: '', color: 0, list: []}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
      case 'keep-li-check': { const item = keepCurrent()?.list?.[Number(id)]; if (item) { item.checked = !item.checked; save(); render(); } break; }
      case 'keep-li-delete': { const note = keepCurrent(); if (note?.list) { note.list.splice(Number(id), 1); save(); render(); } break; }
      case 'keep-grave': ui.keepGraveClosed = !ui.keepGraveClosed; render(); break;
      case 'keep-checkboxes': { ui.overlay = ''; renderOverlay(); const note = keepCurrent(); if (!note) break; saveKeepNote(); if (!note.list) { note.list = String(note.text || '').split('\n').filter(line => line.trim()).map(text => ({text, checked: false})); note.text = ''; } else if (note.list.some(item => item.checked)) ui.keepDialog = 'hide-checkboxes'; else keepToText(note, false); save(); render(); break; }
      case 'keep-hide-keep': case 'keep-hide-delete': { const note = keepCurrent(); ui.keepDialog = ''; if (note?.list) keepToText(note, action === 'keep-hide-delete'); save(); render(); break; }
      case 'keep-picture': saveKeepNote(); ui.keepDialog = 'picture'; render(); break;
      case 'keep-photo-take': { ui.keepDialog = ''; saveKeepNote(); keepAttach(cameraShoot().id, ui.sub === 'note' ? ui.keepNote : ''); break; }
      case 'keep-photo-choose': ui.keepDialog = ''; saveKeepNote(); ui.keepPhotoTo = ui.sub === 'note' ? ui.keepNote : ''; docPick('keep', 'image/*'); break;
      case 'keep-photo-remove': saveKeepNote(); ui.keepDialog = 'remove-photo'; render(); break;
      case 'keep-photo-delete': { ui.keepDialog = ''; const note = keepCurrent(); if (note) { delete note.photo; save(); } render(); break; }
      case 'keep-dialog-close': ui.keepDialog = ''; render(); break;
      case 'keep-drawer': ui.keepDrawer = !ui.keepDrawer; render(); break;
      case 'keep-landing': ui.keepView = id; ui.keepDrawer = false; render(); break;
      case 'yt-video': LPYouTube.watched(id, data); save(); ui.ytFrom = ui.sub; ui.ytVideo = id; ui.ytPaused = false; ui.sub = 'video'; render(); break;
      case 'keep-search-open': case 'keep-search-clear': ui.sub = 'search'; ui.keepQuery = ''; render(); viewport.querySelector('[data-keep-search]')?.focus(); break;
      case 'drive-search-open': ui.sub = 'search'; ui.driveQuery = ''; render(); viewport.querySelector('[data-form="drive-search"] input')?.focus(); break;
      case 'drive-search-clear': ui.sub = ''; ui.driveQuery = ''; render(); break;
      case 'yt-search-open': case 'yt-search-clear': ui.sub = 'search'; if (id !== 'keep') ui.ytQuery = ''; render(); viewport.querySelector('.yt-sv input')?.focus(); break;
      case 'yt-guide': ui.ytGuide = !ui.ytGuide; render(); break;
      case 'yt-toggle': ui.ytPaused = !ui.ytPaused; render(); break;
      case 'yt-like': { const likes = data.ytLikes || []; data.ytLikes = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]; save(); render(); break; }
      case 'gplus-plus': { const plus = data.gplusPlus || []; data.gplusPlus = plus.includes(id) ? plus.filter(x => x !== id) : [...plus, id]; save(); render(); break; }
      case 'news-tab': ui.newsTab = id; ui.newsDrawer = false; render(); break;
      case 'news-drawer': ui.newsDrawer = !ui.newsDrawer; render(); break;
      case 'news-chart': ui.newsChart = id; render(); break;
      case 'earth-search-open': ui.earthSearching = true; render(); viewport.querySelector('.ea8-field input')?.focus(); break;
      case 'earth-clear': ui.overlay = ''; renderOverlay(); ui.earthQuery = ''; render(); break;
      case 'earth-drawer': ui.earthDrawer = !ui.earthDrawer; render(); break;
      case 'gplus-refresh': ui.overlay = ''; renderOverlay(); render(); break;
      case 'sa-menu': ui.newsMenu = ''; ui.overlay = 'sa-menu'; renderOverlay(); break;
      // News & Weather 2.2: Refresh shows content_loading_placeholder while it gathers; stories expand and open
      // WebContentActivity; the weather card's menu and the app menu open its dialogs; the theme switches.
      case 'sa-news-refresh': ui.overlay = ''; renderOverlay(); ui.newsRefreshing = true; render(); setTimeout(() => { ui.newsRefreshing = false; if (ui.view === 'news-weather') render(); }, 900); break;
      case 'news2-expand': ui.newsExpanded = id; render(); break;
      case 'news2-open': ui.newsWeb = id; render(); break;
      case 'news2-share': { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector(`[data-id="${id}"]`)?.closest('.nw2-expanded')?.querySelector('b')?.textContent || viewport.querySelector('.nw2-article h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; messageDraft().body = title; save(); render(); break; }
      case 'news2-weather-menu': ui.newsMenu = 'weather'; ui.overlay = 'sa-menu'; renderOverlay(); break;
      case 'news2-dialog': ui.overlay = ''; renderOverlay(); ui.newsDialog = id; ui.newsPick = undefined; render(); break;
      case 'news2-pick': { const place = viewport.querySelector('[data-news2-place]')?.value; ui.newsPick = id; render(); const input = viewport.querySelector('[data-news2-place]'); if (input && place !== undefined) input.value = place; break; }
      case 'news2-cancel': ui.newsDialog = ''; ui.newsPick = undefined; render(); break;
      case 'news2-ok': {
        const o = StockApps.news2(data), pick = ui.newsPick ?? (ui.newsDialog === 'weather' ? o.weather : ui.newsDialog === 'unit' ? o.unit : o.wind);
        data.news2 = {...o, ...(ui.newsDialog === 'weather' ? {weather: pick, place: (viewport.querySelector('[data-news2-place]')?.value || '').trim()} : ui.newsDialog === 'unit' ? {unit: pick} : {wind: pick})};
        if (data.news2.weather === 'custom' && !data.news2.place) data.news2.weather = 'auto';
        ui.newsDialog = ''; ui.newsPick = undefined; save(); render(); break;
      }
      case 'news2-theme': ui.overlay = ''; renderOverlay(); data.news2 = {...StockApps.news2(data), dark: !StockApps.news2(data).dark}; save(); render(); break;
      // Play Music, Movies & TV, Books and Games
      case 'pa-drawer': ui.overlay = 'pa-drawer'; renderOverlay(); break;
      case 'pa-menu': ui.overlay = 'pa-menu'; renderOverlay(); break;
      case 'pa-refresh': ui.overlay = ''; renderOverlay(); render(); break;
      case 'pa-mixtab': ui.paMixTab = id; render(); break;
      case 'pa-movietab': ui.paMovieTab = id; render(); break;
      case 'pa-bookstab': ui.bkFilterTab = id; render(); break;
      case 'pa-page': ui.paPage ||= {}; ui.paPage[ui.view] = id; ui.sub = ''; ui.overlay = ''; renderOverlay(); render(); break;
      case 'pa-unsupported': case 'pa-game-play': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'pa-album': ui.paFromSearch = ui.sub === 'search'; ui.paAlbum = id; ui.sub = 'album'; render(); break;
      case 'pa-search': case 'pa-search-clear': ui.paQuery = ''; ui.sub = 'search'; ui.overlay = ''; renderOverlay(); render(); viewport.querySelector('[data-pa-search]')?.focus(); break;
      case 'pa-song': {
        const track = Number(id), queue = button.dataset.queue;
        if (queue === 'all') ui.music.queue = tracks.map((_, i) => i);
        else if (queue && queue !== 'keep') ui.music.queue = tracks.map((item, i) => item.album === queue ? i : -1).filter(i => i >= 0);
        if (!ui.music.queue.includes(track)) ui.music.queue = [...ui.music.queue, track];
        ui.music.track = track; ui.music.position = 0; ui.music.playing = true; saveMusic();
        if (ui.sub !== 'player' && ui.sub !== 'queue') ui.paReturn = ui.sub;
        ui.sub = 'player'; render(); break;
      }
      case 'pa-player': ui.paReturn = ui.sub; ui.sub = 'player'; render(); break;
      case 'pa-queue': ui.sub = ui.sub === 'queue' ? 'player' : 'queue'; render(); break;
      case 'pa-thumb': { data.playMusicThumbs ||= {}; const value = Number(id); if (data.playMusicThumbs[ui.music.track] === value) delete data.playMusicThumbs[ui.music.track]; else data.playMusicThumbs[ui.music.track] = value; save(); render(); break; }
      case 'pa-libtab': ui.paMusicTab = id; render(); break;
      case 'pa-libtab-songs': ui.paPage ||= {}; ui.paPage['play-music'] = 'library'; ui.paMusicTab = 'songs'; render(); break;
      case 'pa-movie': ui.paItem = id; ui.sub = 'movie'; ui.paPlaying = true; ui.paSeconds = 0; ui.paBars = true; render(); break;
      case 'pa-video-bars': ui.paBars = ui.paBars === false; viewport.querySelector('.pm-video')?.classList.toggle('bare', ui.paBars === false); break;
      case 'pa-video-toggle': ui.paPlaying = ui.paPlaying === false; render(); break;
      case 'pa-shop': openApp('play-store'); break;
      case 'pa-book': ui.paItem = id; ui.sub = 'reader'; ui.paBars = true; render(); break;
      case 'pa-reader-tap': {
        const box = button.getBoundingClientRect(), x = (event.clientX - box.left) / box.width;
        if (x > .3 && x < .7) { ui.paBars = ui.paBars === false; viewport.querySelector('.pb-reader')?.classList.toggle('bare', ui.paBars === false); break; }
        data.playBooks ||= {}; const pages = PlayApps.bookPages(ui.paItem), now = data.playBooks[ui.paItem] || 0;
        data.playBooks[ui.paItem] = Math.max(0, Math.min(pages - 1, now + (x >= .7 ? 1 : -1))); save(); render(); break;
      }
      // Play Books 3.3.15's reader: Contents (TableOfContentsActivity) and the Display options popup (ReaderSettingsController).
      case 'bk-toc': ui.bkToc = !ui.bkToc; ui.bkTocTab = 'chapters'; ui.bkOptions = false; ui.bkSpin = ''; render(); break;
      case 'bk-toc-tab': ui.bkTocTab = id; render(); break;
      case 'bk-chapter': data.playBooks ||= {}; data.playBooks[ui.paItem] = Number(id) || 0; ui.bkToc = false; save(); render(); break;
      case 'bk-options': ui.bkOptions = !ui.bkOptions; ui.bkSpin = ''; render(); break;
      case 'bk-pref-spin': ui.bkSpin = ui.bkSpin === id ? '' : id; render(); break;
      case 'bk-pref': case 'bk-pref-step': {
        const [key, value] = String(id).split(':'), prefs = PlayApps.bookPrefs(data);
        data.bookPrefs = {...prefs, [key]: action === 'bk-pref' ? value : PlayApps.stepPref(prefs, key, Number(value))}; ui.bkSpin = ''; save(); render(); break;
      }
      case 'bk-pref-auto': { const prefs = PlayApps.bookPrefs(data); data.bookPrefs = {...prefs, brightness: prefs.brightness < 0 ? Math.max(5, Math.round(data.settings?.brightness ?? 100)) : -1}; save(); render(); break; }
      case 'pa-see-all': ui.paPage ||= {}; ui.paPage['play-books'] = 'library'; render(); break;
      case 'pa-game': ui.paItem = id; ui.sub = 'game'; render(); break;
      case 'pa-gtab': ui.paGamesTab = id; render(); break;
      case 'pa-games-mine': case 'pa-games-players': ui.paPage ||= {}; ui.paPage['play-games'] = action === 'pa-games-mine' ? 'mine' : 'players'; render(); break;
      // Google+ Photos
      case 'photos-tab': ui.photosTab = id; render(); break;
      case 'photos-folders': ui.sub = 'folders'; render(); break;
      case 'photos-folder': ui.sub = 'folder'; ui.photosFolder = id; render(); break;
      case 'photos-open': { ui.photosList = ['folder', 'search', 'videos'].includes(button.dataset.list) ? button.dataset.list : 'all'; ui.photosReturn = ui.sub; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(photo => String(photo.id) === id)); ui.selectedPhoto = list[ui.photosIndex]?.id; ui.sub = 'photo'; ui.photosChrome = true; render(); break; }
      case 'photos-play': ui.photosVideo = null; ui.sub = 'video'; render(); break;
      case 'photos-sphere': ui.sub = 'sphere'; render(); break;
      // Lens Blur's viewer edits a copy; Done keeps it, Back drops it.
      case 'photos-refocus': { const photo = PhotosApp.list(photosContext())[ui.photosIndex]; if (photo?.refocus) { ui.refocusEdit = JSON.parse(JSON.stringify(photo.refocus)); ui.sub = 'refocus'; render(); } break; }
      case 'photos-refocus-done': { const photo = PhotosApp.list(photosContext())[ui.photosIndex]; if (photo?.refocus && ui.refocusEdit) { photo.refocus = ui.refocusEdit; save(); } ui.refocusEdit = null; ui.sub = 'photo'; render(); break; }
      case 'photos-toggle-bars': if (ui.photosSlideshow) { photosSlideshowStop(); viewport.querySelectorAll('.ph-slide-out, .ph-slide-in').forEach(el => el.classList.remove('ph-slide-out', 'ph-slide-in')); }
        ui.photosChrome = ui.photosChrome === false; viewport.querySelector('.ph-viewer-view')?.classList.toggle('ph-bare', ui.photosChrome === false); break;
      case 'photos-menu': ui.overlay = 'photos-menu'; renderOverlay(); break;
      case 'photos-share-day': photosShare(data.photos.find(photo => String(photo.id) === id)); break;
      case 'photos-wallpaper': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) galleryWallpaper(photo); break; }
      case 'photos-details': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) toast(`${photo.name}${photo.created ? ' · ' + new Date(photo.created).toLocaleString(i18n.locale()) : ''}`); break; }
      case 'photos-delete': ui.overlay = 'photos-delete'; renderOverlay(); break;
      case 'photos-confirm-delete': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (!photo) break; data.photos = data.photos.filter(item => item.id !== photo.id); save(); const list = PhotosApp.list(photosContext()); if (!list.length) ui.sub = ui.photosReturn || ''; else ui.photosIndex = Math.min(ui.photosIndex, list.length - 1); render(); break; }
      // The drawer (PhotosHomeActivity's views) and search.
      case 'photos-drawer': ui.photosSpinner = !ui.photosSpinner; render(); break;
      case 'photos-view': ui.photosView = id; ui.photosSpinner = false; render(); break;
      case 'photos-search': ui.sub = 'search'; ui.photosQuery = ''; render(); viewport.querySelector('[data-photos-search]')?.focus(); break;
      case 'photos-edit': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (!photo || photo.video) break; PlusEditor.open(ui, photo); ui.sub = 'edit'; render(); break; }
      case 'photos-slideshow': ui.overlay = ''; renderOverlay(); photosSlideshowStop(); ui.photosSlideshow = true; ui.photosChrome = false; render(); ui.photosSlideTimer = setTimeout(photosSlideshowStep, 5000); break;
      case 'photos-download': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) photosDownload(photo); break; }
      case 'photos-select': ui.overlay = ''; renderOverlay(); ui.photosSelect = []; ui.photosSpinner = false; render(); break;
      case 'photos-pick': { const n = Number(id), list = ui.photosSelect || []; ui.photosSelect = list.includes(n) ? list.filter(x => x !== n) : [...list, n]; render(); break; }
      case 'photos-select-done': ui.photosSelect = null; render(); break;
      case 'photos-select-share': { const chosen = (ui.photosSelect || []).map(n => data.photos.find(p => p.id === n)).filter(Boolean); if (!chosen.length) break; ui.photosSelect = null; photosShare(chosen[0]); if (chosen.length > 1) { messageDraft().moreAttachments = chosen.slice(1).map(clone); save(); } break; }
      case 'photos-select-delete': ui.overlay = 'photos-delete-many'; renderOverlay(); break;
      case 'photos-select-confirm': { const gone = ui.photosSelect || []; ui.overlay = ''; renderOverlay(); data.photos = data.photos.filter(p => !gone.includes(p.id)); ui.photosSelect = null; save(); render(); break; }
      case 'photos-settings': ui.overlay = ''; renderOverlay(); ui.sub = 'settings'; render(); break;
      case 'photos-settings-backup': ui.sub = 'settings-backup'; render(); break;
      case 'photos-pref': { const prefs = data.photosPrefs ||= {}; prefs[id] = !({...PhotosApp.PREFS, ...prefs})[id]; save(); render(); break; }
      case 'photos-pref-list': ui.photosPrefList = id; ui.overlay = 'photos-pref-list'; renderOverlay(); break;
      case 'photos-pref-pick': (data.photosPrefs ||= {})[ui.photosPrefList] = id; ui.overlay = ''; renderOverlay(); save(); render(); break;
      case 'photos-pref-online': toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'photos-print': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) PrintSpooler.open(printContext(), {name: photo.name, image: ICSMedia.image(photo)}); break; }
      // Chrome's Print…: the page as it is shown, its heading as the job's name.
      case 'chrome-print': { const page = viewport.querySelector('.browser-page'); ui.overlay = ''; renderOverlay(); const title = page?.querySelector('h1, h2, strong')?.textContent?.trim() || ui.browserUrl; PrintSpooler.open(printContext(), {name: title, title, lines: String(page?.innerText || ui.browserUrl).split('\n').map(x => x.trim()).filter(Boolean)}); break; }
      case 'chrome-a2hs': { const page = viewport.querySelector('.browser-page'); ui.a2hs = {url: ui.browserUrl, title: page?.querySelector('h1, h2, strong')?.textContent?.trim() || ui.browserUrl}; ui.overlay = 'chrome-a2hs'; renderOverlay(); overlayRoot.querySelector('[data-a2hs-title]')?.focus(); break; }
      case 'chrome-a2hs-add': { const title = String(overlayRoot.querySelector('[data-a2hs-title]')?.value || ui.a2hs?.title || '').trim() || ui.a2hs.url; const item = {id: Date.now(), title, url: ui.a2hs.url}; (data.webShortcuts ||= []).push(item); ui.overlay = ''; renderOverlay(); placeShortcut(`web:${item.id}`, title); break; }
      case 'open-office-shortcut': {const f=officeFiles().find(f=>f.id===id&&!f.trashed);if(f){openApp(EditorMore.APP[f.kind]);ui.sub=f.id;ui.edFrom='';render();}break;}
      case 'open-web-shortcut': { const item = (data.webShortcuts || []).find(w => String(w.id) === id); if (!item) break; openApp('chrome'); navigateBrowser(item.url); break; }
      case 'dl-open-pdf': { const doc = (data.downloads || []).find(d => String(d.time) === id); if (doc) PrintSpooler.openPdf(printContext(), doc); break; }
      case 'dl-open-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (!photo) break; openApp('photos'); ui.photosList = 'all'; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(p => p.id === photo.id)); ui.selectedPhoto = photo.id; ui.sub = 'photo'; render(); break; }
      case 'photos-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'chrome-close-all': ui.browserSession = {tabs: [{history: [ChromeApp.NTP], index: 0}], active: 0}; ui.sub = ''; ui.overlay = ''; renderOverlay(); saveBrowserState(); render(); break;
      case 'chrome-ntp': chromeSection(id); break;
      case 'chrome-bookmarks': chromeSection('bookmarks'); break;
      case 'chrome-devices': chromeSection('devices'); break;
      case 'chrome-history': ui.chromeHistoryQuery = ''; navigateBrowser(ChromeApp.HISTORY); break;
      case 'chrome-share': { const link = ui.browserUrl; ui.overlay = ''; renderOverlay(); if (ChromeApp.internal(link)) break; openApp('messaging'); ui.sub = 'new'; messageDraft().body = link.startsWith('search:') ? link.slice(7) : `http://${link}`; save(); render(); break; }
      case 'chrome-desktop': ui.chromeDesktop = !ui.chromeDesktop; ui.overlay = ''; renderOverlay(); render(); break;
      case 'chrome-settings': ui.overlay = ''; renderOverlay(); ui.sub = 'chrome-settings'; ui.chromePrefStack = []; ui.chromePrefMenu = false; ui.chromeConfirm = ''; render(); break;
      case 'chrome-pref-menu': ui.chromePrefMenu = !ui.chromePrefMenu; render(); break;
      case 'chrome-list-open': ui.chromeList = id; render(); break;
      case 'chrome-list-pick': { const [key, value] = id.split(':'); (data.chromePrefs ||= {})[key] = Number(value); ui.chromeList = ''; save(); render(); break; }
      case 'chrome-list-close': ui.chromeList = ''; render(); break;
      case 'chrome-noop': break;
      // Clear browsing data: the dialog's ticks, then a short "Please wait…" before the history goes.
      case 'chrome-clear-open': ui.chromePrefMenu = false; ui.chromeClear = Object.fromEntries(ChromeApp.CLEAR_ITEMS.map(([key, , on]) => [key, on])); render(); break;
      case 'chrome-clear-toggle': if (ui.chromeClear) { ui.chromeClear[id] = !ui.chromeClear[id]; render(); } break;
      case 'chrome-clear-cancel': ui.chromeClear = null; render(); break;
      case 'chrome-clear-run': { const picked = ui.chromeClear; if (!picked) break; ui.chromeClear = {...picked, busy: true}; render(); setTimeout(() => { if (picked.history) { data.browserHistory = []; ui.chromeHistoryQuery = ''; } ui.chromeClear = null; save(); render(); }, 900); break; }
      case 'chrome-unsupported': ui.chromePrefMenu = false; if (ui.sub === 'chrome-settings') render(); ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-new-tab': if (ui.view === 'chrome') { chromeNewTab(false); break; } if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.phoneMenu = id || ''; ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'dial-pause': case 'dial-wait': ui.dial = (ui.dial + (action === 'dial-pause' ? ',' : ';')).slice(0, 30); ui.overlay = ''; render(); break;
      case 'phone-add-contact': { const number = id || ui.dial; openApp('people'); editPerson(true); ui.peopleDraft.phone = number; render(); break; }
      case 'phone-new-contact': openApp('people'); editPerson(true); render(); break;
      case 'phone-dial-sms': ui.overlay = ''; renderOverlay(); { const recipient = ICSMessaging.recipient(ui.dial, data.contacts); if (recipient) openMessageThread(recipient.key); else toast('Enter a valid phone number'); } break;
      case 'lpd-clear-frequents': case 'lpd-clear-log': ui.lpdConfirm = action === 'lpd-clear-log' ? 'log' : 'frequents'; ui.overlay = 'lpd-confirm'; renderOverlay(); break;
      case 'lpd-clear-frequents-ok': data.frequentsClearedAt = Date.now(); save(); ui.overlay = ''; render(); break;
      case 'lpd-clear-log-ok': data.callHistory = []; ui.lpLogExpanded = null; save(); ui.overlay = ''; render(); break;
      case 'lpd-edit-before-call': { const call = (data.callHistory || []).find(c => c.time === ui.phoneCallId); ui.overlay = ''; ui.sub = ''; ui.kkDialpad = true; ui.lpSearchOpen = false; ui.phoneSearch = ''; ui.dial = (call?.number || '').slice(0, 30); render(); break; }
      case 'lpd-remove-call': data.callHistory = (data.callHistory || []).filter(c => c.time !== ui.phoneCallId); ui.lpLogExpanded = null; save(); ui.sub = ui.kkLogFrom || ''; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'smartdial-call': if (id) { ui.dial = id; startPhoneCall(id); } break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
      case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
      case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
      case 'phone-log-detail': ui.kkLogFrom=ui.sub==='kk-history'?'kk-history':'';ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
      case 'phone-log-back': ui.sub=ui.kkLogFrom||'';ui.phoneTab='history';render();break;
      case 'kk-dialer-history': ui.sub = 'kk-history'; ui.kkDialpad = false; ui.overlay = ''; render(); break;
      case 'kk-dialer-back': ui.sub = ''; render(); break;
      case 'kk-dialer-log-tab': ui.kkLogTab = id; render(); break;
      case 'kk-dialer-pad': ui.kkDialpad = true; ui.lpSearchOpen = false; ui.phoneSearch = ''; render(); break;
      case 'lpd-tab': ui.lpDialTab = id; ui.lpLogExpanded = null; render(); viewport.querySelector('.lpd-pane')?.scrollTo(0, 0); break;
      case 'lpd-search-open': ui.lpSearchOpen = true; render(); viewport.querySelector('[data-kk-dialer-search]')?.focus(); break;
      case 'lpd-search-close': ui.lpSearchOpen = false; ui.phoneSearch = ''; render(); break;
      case 'lpd-log-expand': ui.lpLogExpanded = ui.lpLogExpanded === Number(id) ? null : Number(id); render(); break;
      case 'lpd-dismiss-card': ui.kkRecentDismissed = [...(ui.kkRecentDismissed || []), Number(id)]; render(); break;
      case 'kk-dialer-clear': ui.phoneSearch = ''; render(); viewport.querySelector('[data-kk-dialer-search]')?.focus(); break;
      case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
      case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
      case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('[data-people-search]')?.focus(); break;
      case 'people-edit': editPerson(); break;
      case 'people-menu': ui.overlay='people-menu'; renderOverlay(); break;
      case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
      case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
      case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
      case 'people-group': ui.peopleGroup=id; ui.sub='group'; ui.peopleQuery=''; render(); break;
      case 'contact': {
        // From the dialer (or any other app) a contact opens Contacts' QuickContactActivity; back returns there.
        if (ui.view !== 'people') { ui.quickContactReturn = {view: ui.view, sub: ui.sub}; captureRecentView(); ui.view = 'people'; }
        ui.selectedContact = Number(id); ui.sub = 'detail'; ui.overlay = ''; render(); break;
      }
      case 'lpx-open': {const f=officeFiles().find(f=>f.id===id);if(f){data.driveFiles=officeFiles().map(f=>f.id===id?{...f,otime:Date.now()}:f);save();}} ui.edFrom = ui.sub; ui.sub = id; render(); break;
      // Docs / Sheets / Slides: Add new opens an untitled file; the actions menu renames or removes one (Drive shows the same list).
      case 'ed-new': { const kind = LPExtraApps.KIND[ui.view], E = key => AndroidStrings.pick(window.StockStrings?.editors?.[key], i18n.language, key), base = E(LPExtraApps.UNTITLED[kind]), names = new Set(officeFiles().map(f => f.name)); let name = base, n = 2; while (names.has(name)) name = `${base} (${n++})`;
        const file = {id: `e${Date.now().toString(36)}`, name, kind, date: deviceDate().toLocaleDateString(i18n.locale(), {month: 'short', day: 'numeric'}), age: 0, text: ''}; data.driveFiles = [file, ...officeFiles()]; save(); ui.edFrom = ui.sub; ui.sub = file.id; render(); break; }
      case 'ed-item': ui.edFile = id; ui.overlay = 'ed-menu'; renderOverlay(); break;
      case 'ed-rename': ui.overlay = 'ed-rename'; renderOverlay(); overlayRoot.querySelector('[data-ed-name]')?.select(); break;
      case 'ed-rename-ok': { const name = overlayRoot.querySelector('[data-ed-name]')?.value.trim(); if (name) { data.driveFiles = officeFiles().map(f => f.id === ui.edFile ? {...f, name} : f); save(); } ui.overlay = ''; renderOverlay(); render(); break; }
      case 'ed-remove': ui.overlay = 'ed-remove'; renderOverlay(); break;
      case 'ed-remove-ok': data.driveFiles = officeFiles().filter(f => f.id !== ui.edFile); save(); ui.overlay = ''; renderOverlay(); render(); break;
      case 'ed-search-open': ui.sub = 'search'; ui.edQuery = ''; render(); viewport.querySelector('[data-form="ed-search"] input')?.focus(); break;
      case 'ed-search-clear': ui.sub = ''; ui.edQuery = ''; render(); break;
      case 'lpx-unavailable': case 'lpx-menu': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'lpx-overflow': ui.overlay = 'lpx-overflow'; renderOverlay(); break;
      case 'wal-next': ui.walPage = Math.min((ui.walPage ?? 0) + 1, LPExtraApps.WAL_PAGES.length - 1); render(); break;
      case 'wal-finish': toast(i18n.t('This feature is not part of the simulator.')); break;
      case 'lpx-drawer': ui.lpxDrawer = !ui.lpxDrawer; render(); break;
      case 'vol-zen': data.settings.zenMode = id; if (id === 'all') data.settings.zenExit = null; save(); renderStatus(); showVolume(volumeStream()); break;
      case 'vol-settings': hideVolume(); openApp('settings'); ui.sub = 'sound'; render(); break;
      case 'people-search-close': ui.peopleSearching = false; ui.peopleQuery = ''; render(); break;
      case 'open-settings-sync': ui.overlay = ''; openApp('settings'); ui.sub = 'sync'; render(); break;
      case 'new-contact': editPerson(true); break;
      case 'contact-call': startPhoneCall(contact(id)?.phone||'');break;
      case 'contact-message': openMessageThread(id); break;
      case 'contact-email': {const recipient=contact(id)?.email||'';openApp('email');composeEmail(null,false,recipient);break;}
      case 'thread': openMessageThread(id); break;
      // New Hangout: a picked contact or typed number opens its conversation and takes along a shared draft.
      case 'hg-pick': pickHangout(id); break;
      case 'hg-attach-photo': ui.overlay = 'mms-attach-photos'; renderOverlay(); break;
      case 'hg-take-photo': hangoutsTakePhoto(); break;
      case 'cam-review-done': ui.camIntent?.taken && ui.camIntent.done(); break;
      case 'cam-review-retake': if (ui.camIntent) { ui.camIntent.taken = null; render(); } break;
      case 'cam-review-cancel': ui.camIntent?.cancel(); break;
      case 'hg-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
      // Hangouts 2.5: the attachment button's "Share your location" sends the demo place; conversations archive until
      // something newer arrives; the snooze dialog (1–72 hours) shows dnd_list_item.xml's banner until Resume.
      case 'hg-share-location': ui.overlay = ''; renderOverlay(); sendMessage(ui.thread, Hangouts.locationBody(key => i18n.t(key))); save(); break;
      case 'hg-archive': (data.hgArchived ||= {})[ui.thread] = Date.now(); ui.overlay = ''; ui.sub = ''; ui.mmsListMode = ''; save(); renderOverlay(); render(); toast(Hangouts.H(key => i18n.t(key), 'Hangout archived.')); break;
      case 'hg-unarchive': if (data.hgArchived) delete data.hgArchived[ui.thread]; ui.overlay = ''; if (ui.mmsListMode === 'archived') ui.mmsListMode = ''; save(); renderOverlay(); render(); break;
      case 'hg-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
      case 'mms-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
      case 'hg-dnd': ui.overlay = 'mms-hg-dnd'; renderOverlay(); break;
      case 'hg-drawer': ui.overlay = 'mms-hg-drawer'; renderOverlay(); break;
      case 'hg-dnd-set': data.hgSnooze = deviceDate().getTime() + Number(id) * 60000; ui.overlay = ''; save(); renderOverlay(); render(); break;
      case 'hg-dnd-cancel': delete data.hgSnooze; save(); render(); break;
      case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
      case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
      case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea')?.focus(); } break; }
      case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
      case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
      case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
      case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
      case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
      case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
      case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
      case 'mms-confirm-delete': {
        data.messages = data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
        if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; }
        save(); ui.overlay = ''; render(); break;
      }
      case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
      case 'photo': ui.selectedPhoto=Number(id);if(!galleryItems().some(p=>p.id===Number(id))){ui.galleryCluster='album';ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});}ui.sub='photo';ui.galleryZoom=false;ui.galleryFilm=false;ui.galleryBars=true;ui.galleryFromCamera=false;render();break;
      case 'gallery-menu': case 'gallery-share': case 'gallery-details': ui.overlay=action;renderOverlay();break;
      case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('messaging');ui.sub='new';messageDraft().attachment=clone(photo);save();render();break;}
      case 'shoot': {
        const photo={...ICSMedia.scene(data),id:Date.now(),name:`IMG_${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`,album:'camera',created:Date.now()};
        data.photos.unshift(photo);save();render();screen.animate([{opacity:1},{opacity:.4},{opacity:1}],{duration:240});toast('Photo saved to Gallery');break;
      }
      case 'calendar-prev': calendarMove(-1); break;
      case 'calendar-next': calendarMove(1); break;
      case 'calendar-day': ui.selectedDate=id;ui.calendarMode=data.calendarMode='Day';save();calendarRender();break;
      case 'calendar-today': ui.selectedDate=today();calendarRender();break;
      // Calendar's From / To buttons open the datetimepicker at the form's value; Done writes it back and, like
      // EditEventView, moves the end with the start so the event keeps its length.
      // The repeat / reminder spinners (calendar.js): the list opens under the field (a dialog on 5.1) and the pick goes
      // straight into the form's hidden input, as the date and time pickers do.
      case 'caltz': ui.tzpFor = ''; ui.tzp = TimeZonePicker.open(id, Number(button.dataset.ms) || Date.now()); ui.overlay = 'tzpicker'; renderTzPicker(true); break;
      case 'tzp-field': TimeZonePicker.focus(ui.tzp, tzpContext()); renderTzPicker(true); break;
      case 'tzp-filter': TimeZonePicker.filter(ui.tzp, id); renderTzPicker(false); break;
      case 'tzp-clear': TimeZonePicker.clear(ui.tzp); renderTzPicker(true); break;
      case 'tzp-pick': {
        // Settings › Time zone takes the zone (calendar-prefs.js).
        if (ui.tzpFor === 'home') { data.calendarPrefs = {...(data.calendarPrefs || {}), homeTz: id}; ui.tzpFor = ''; data.calRecentTimezones = TimeZonePicker.saveRecent(data.calRecentTimezones, id); save(); ui.overlay = ''; renderOverlay(); render(); break; }
        // onTimeZoneSet: the event takes the zone, the button its label; saveRecentTimezone keeps the last three.
        const form = viewport.querySelector('form[data-form="event"]'), field = form?.querySelector('[data-action="caltz"]');
        if (form) { form.elements.tz.value = id; if (ui.eventDraft) ui.eventDraft.tz = id; }
        if (field) { const ms = TimeZonePicker.millis(id, form.elements.date?.value, form.elements.time?.value); field.dataset.id = id; field.dataset.ms = ms; field.innerHTML = TimeZonePicker.label(id, ms, i18n.language); }
        data.calRecentTimezones = TimeZonePicker.saveRecent(data.calRecentTimezones, id); save();
        ui.overlay = ''; renderOverlay(); break;
      }
      case 'calspin': {
        const form=viewport.querySelector('form[data-form="event"]');if(!form)break;
        const draft={...ICSCalendar.normalize(ui.eventDraft||{}),...Object.fromEntries(new FormData(form))};
        const b=button.getBoundingClientRect(),sr=screen.getBoundingClientRect(),k=screen.clientWidth/sr.width;
        const items=ICSCalendar.spinner(id,draft,i18n.locale(),key=>i18n.t(key)),rowH=screen.clientWidth/8.3,below=(b.bottom-sr.top)*k;
        ui.calSpin={field:id,value:form.elements[id].value,items,title:button.getAttribute('aria-label')||'',left:(b.left-sr.left)*k,width:b.width*k,top:below+items.length*rowH>screen.clientHeight?Math.max(0,(b.top-sr.top)*k-items.length*rowH):below};
        ui.overlay='calendar-spinner';renderOverlay();break;
      }
      case 'calspin-pick': {
        const form=viewport.querySelector('form[data-form="event"]'),sp=ui.calSpin;
        if(form&&sp){form.elements[sp.field].value=id;const field=form.querySelector(`[data-action="calspin"][data-id="${sp.field}"]`);if(field)field.textContent=sp.items.find(item=>item.value===id)?.label||'';}
        ui.overlay='';renderOverlay();break;
      }
      case 'calpick': {
        const form=viewport.querySelector('form[data-form="event"]'),value=form?.elements[id]?.value||'';
        ui.dtp=DateTimePicker.fromValue(/date/i.test(id)?'date':'time',value||(/date/i.test(id)?ui.selectedDate:'09:00'),{field:id,setAction:'dtp-set',hour24:!!data.settings.hour24});
        ui.overlay='dtp';renderOverlay();break;
      }
      case 'dtp-view': case 'dtp-day': case 'dtp-year': case 'dtp-month': case 'dtp-mode': case 'dtp-ampm': case 'dtp-radial': if(DateTimePicker.handle(action,id,ui.dtp))renderOverlay();break;
      case 'dtp-set': {
        const form=viewport.querySelector('form[data-form="event"]'),p=ui.dtp;ui.overlay='';renderOverlay();if(!form||!p)break;
        const get=name=>form.elements[name].value,stamp=(d,t)=>new Date(`${d}T${t||'00:00'}`).getTime();
        const before=stamp(get('date'),get('time')),length=stamp(get('endDate'),get('endTime'))-before;
        form.elements[p.field].value=p.kind==='date'?DateTimePicker.iso(p):DateTimePicker.hhmm(p);
        if(p.field==='date'||p.field==='time'){const end=new Date(stamp(get('date'),get('time'))+Math.max(0,length||0));form.elements.endDate.value=ICSCalendar.iso(end);form.elements.endTime.value=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;}
        for(const name of ['date','time','endDate','endTime'])form.querySelector(`[data-action="calpick"][data-id="${name}"]`).textContent=/date/i.test(name)?ICSCalendar.dateButton(get(name),i18n.locale()):ICSCalendar.timeButton(get(name),i18n.locale(),!!data.settings.hour24);
        // A different start can cross a daylight-saving boundary; refresh the zone name and picker timestamp too.
        const zoneButton=form.querySelector('[data-action="caltz"]');
        if(zoneButton){const zone=zoneButton.dataset.id,ms=TimeZonePicker.millis(zone,get('date'),get('time'));zoneButton.dataset.ms=ms;zoneButton.innerHTML=TimeZonePicker.label(zone,ms,i18n.language);}
        break;
      }
      case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
      case 'calendar-refresh': ui.overlay='';renderOverlay();toast(i18n.t('Calendar synced'));break;
      case 'calendar-mode': ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender();break;
      case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input')?.focus();break;
      case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit({date,time,title:''});break;}
      case 'event-new': calendarEdit();break;
      case 'calendar-settings': ui.overlay=''; renderOverlay(); ui.sub='calendar-settings'; ui.calPref=''; ui.calPrefDialog=''; render(); break;
      case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
      case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none'){ui.overlay='calendar-edit-scope';renderOverlay();} else calendarEdit(series); break; }
      case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit({...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
      case 'event-delete-scope': deleteEventScope(id); break;
      case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
      case 'event-delete': ui.overlay=ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'calendar-delete-scope':'calendar-delete';renderOverlay();break;
      case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender();break;
      case 'clock-alarms': jbClockState(); data.jbClock.tab='alarm'; save(); ui.sub=''; render(); break;
      case 'kdc-add': { const now=deviceDate(); ui.kdcPicker={id:null,hour:now.getHours(),minute:now.getMinutes(),mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
      case 'kdc-time': { const alarm=ICSDeskClock.normalize(data.alarms.find(item=>item.id===Number(id))); const [h,m]=alarm.time.split(':').map(Number); ui.kdcPicker={id:alarm.id,hour:h,minute:m,mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
      case 'kdc-picker-mode': ui.kdcPicker.mode=id; renderOverlay(); break;
      case 'kdc-picker-ampm': { const p=ui.kdcPicker; const pm=id?id==='pm':p.hour<12; p.hour=p.hour%12+(pm?12:0); renderOverlay(); break; }
      case 'kdc-picker-cancel': ui.kdcPicker=null; ui.overlay=''; renderOverlay(); break;
      case 'kdc-picker-done': {
        // AlarmClockFragment.onTimeSet: an edited alarm is switched on; a new one is added, enabled and expanded.
        const p=ui.kdcPicker, time=`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}`;
        if(p.zen){data.settings[p.zen==='start'?'zenStart':'zenEnd']=time;delete data.settings.zenDowntimed;save();ui.kdcPicker=null;ui.overlay='';render();renderOverlay();break;}
        if(p.id){const alarm=data.alarms.find(item=>item.id===p.id); if(alarm){alarm.time=time;alarm.enabled=true;delete alarm.snoozedUntil;}}
        else{const alarm=ICSDeskClock.normalize({time,enabled:true});alarm.id=Date.now();data.alarms.push(alarm);ui.kdcExpanded=alarm.id;}
        save(); ui.kdcPicker=null; ui.overlay=''; render(); toast('Alarm set'); break;
      }
      case 'kdc-expand': ui.kdcExpanded=ui.kdcExpanded===Number(id)?null:Number(id); render(); break;
      case 'kdc-repeat': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; const days=ICSDeskClock.normalize(alarm).days; alarm.days=days.length?[]:[0,1,2,3,4,5,6]; save(); render(); break; }
      case 'kdc-day': { const [alarmId,day]=id.split(':').map(Number); const alarm=data.alarms.find(item=>item.id===alarmId); if(!alarm)break; const days=new Set(ICSDeskClock.normalize(alarm).days); days.has(day)?days.delete(day):days.add(day); alarm.days=[...days].sort(); save(); render(); break; }
      case 'kdc-vibrate': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; alarm.vibrate=!ICSDeskClock.normalize(alarm).vibrate; save(); render(); break; }
      case 'kdc-label': case 'kdc-tone': { const alarm=data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; ui.alarmDraft=ICSDeskClock.normalize(alarm); ui.kdcEditing=alarm.id; ui.overlay=action==='kdc-label'?'clock-label':'clock-tone'; renderOverlay(); break; }
      case 'kdc-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==Number(id)); if(ui.kdcExpanded===Number(id))ui.kdcExpanded=null; save(); render(); toast('Alarm deleted'); break;
      case 'jbclock-tab': jbClockState(); data.jbClock.tab = id; save(); render(); break;
      case 'jbclock-key': ui.timerDigits = JBDeskClock.setupDigits(ui.timerDigits || '', id); render(); break;
      case 'jbclock-setup-cancel': ui.timerSetup = false; ui.timerDigits = ''; render(); break;
      case 'jbclock-setup-start': { const time = JBDeskClock.setupTime(ui.timerDigits || ''); if (!time.ms) break; jbClockState(); data.jbClock.timers.push({id: `t${Date.now()}`, length: time.ms, left: time.ms, started: Date.now(), state: 'running', label: ''}); ui.timerSetup = false; ui.timerDigits = ''; save(); render(); break; }
      case 'jbclock-timer-add': ui.timerSetup = true; ui.timerDigits = ''; render(); break;
      case 'jbclock-timer-toggle': case 'jbclock-timer-plus': { const timers = jbClockState() && data.jbClock.timers, index = timers.findIndex(timer => timer.id === id); if (index < 0) break; timers[index] = JBDeskClock.timerAction(timers[index], action === 'jbclock-timer-plus' ? 'plus' : 'toggle', Date.now()); save(); render(); break; }
      case 'jbclock-timer-delete': jbClockState(); data.jbClock.timers = data.jbClock.timers.filter(timer => timer.id !== id); save(); render(); break;
      case 'jbclock-sw': {
        jbClockState();
        if (id === 'share') {
          const watch = data.jbClock.stopwatch, laps = watch.laps || [], total = JBDeskClock.elapsed(watch, Date.now());
          const text = [`${i18n.t('Stopwatch')}: ${JBDeskClock.formatStopwatch(total)}`, ...laps.map((lap, i) => `# ${i + 1}  ${JBDeskClock.formatStopwatch(lap - (laps[i - 1] || 0))}`)].join('\n');
          openApp('messaging'); ui.sub = 'new'; messageDraft().body = text; save(); render(); break;
        }
        data.jbClock.stopwatch = JBDeskClock.stopwatchAction(data.jbClock.stopwatch, id, Date.now()); save(); render(); break;
      }
      case 'jbclock-menu': ui.overlay = 'cpref-main'; renderOverlay(); break;
      // CitiesActivity: the chosen cities are kept in the clock state; the list keeps its place while ticking them.
      case 'jbclock-cities': ui.cityQuery = undefined; ui.sub = 'cities'; ui.overlay = ''; render(); break;
      case 'jbclock-city': { const list = viewport.querySelector('.jbclock-city-list'), top = list?.scrollTop || 0; jbClockState(); const chosen = data.jbClock.cities ||= []; const at = chosen.indexOf(id); if (at >= 0) chosen.splice(at, 1); else chosen.push(id); save(); render(); const after = viewport.querySelector('.jbclock-city-list'); if (after) after.scrollTop = top; break; }
      case 'jbclock-city-search': ui.cityQuery = ''; render(); viewport.querySelector('[data-city-search]')?.focus(); break;
      case 'jbclock-cities-menu': ui.overlay = 'jbclock-cities-menu'; renderOverlay(); break;
      case 'jbclock-city-sort': jbClockState(); data.jbClock.citySort = data.jbClock.citySort === 'time' ? 'name' : 'time'; save(); ui.overlay = ''; renderOverlay(); render(); break;

      case 'alarm-snooze': {
        const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
        if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+ClockPrefs.prefs(data).snooze*60000;save();}
        ui.overlay='';render();{const message=ICSDeskClock.snoozeMessage(new Date(alarm?.snoozedUntil||deviceDate().getTime()+ClockPrefs.prefs(data).snooze*60000),{hour24:!!data.settings.hour24,locale:i18n.locale()});if(message)toast(message);}break;
      }
      case 'alarm-dismiss': ui.overlay=''; render(); break;
      case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
      case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
      case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
      case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
      case 'calc-key': operateCalculator(id); render(); break;
      case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
      case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;saveMusic();render();break;
      case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();break;
      case 'email-read': {const item=mailbox().find(item=>item.id===id);if(!item)break;if(ui.view==='gmail')data.gmailWelcomeSeen=true;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
      case 'email-compose': composeEmail();break;
      case 'email-reply': case 'email-forward': composeEmail(mailbox().find(item=>item.id===ui.emailId),action==='email-forward');break;
      case 'email-list': ui.sub='';ui.overlay='';ui.emailSelected=[];render();break;
      case 'email-folders': case 'email-menu': ui.emailMenu=id||'list';ui.overlay=action;renderOverlay();break;
      // 4.4 Email (UnifiedEmail): the folder drawer, Save draft, Reply all, Move to and the menu entries without a screen.
      case 'email-drawer': ui.overlay='email-drawer';renderOverlay();break;
      case 'email-save': ui.sub='';ui.overlay='';ui.emailSelected=[];render();toast(KKEmail.tr(i18n.language,'Message saved as draft.',ui.view==='gmail'?'gmail':'email'));break;
      case 'email-reply-all': ui.overlay='';composeEmail(mailbox().find(item=>item.id===ui.emailId),false);break;
      case 'email-move': {const item=mailbox().find(item=>item.id===ui.emailId);if(item){if(id==='Trash')ICSEmail.trash(mailbox(),[item.id]);else{item.folder=id;delete item.previousFolder;}}ui.overlay='';ui.sub='';save();render();break;}
      case 'email-unavailable': ui.overlay='';renderOverlay();toast('This feature is not part of the simulator.');break;
      // Gmail's Print: the open message (sender, date, subject over the body) as the job.
      case 'email-print': { const m = (data.mailbox || []).find(x => x.id === ui.emailId) || (data.gmailbox || []).find(x => x.id === ui.emailId); ui.overlay=''; renderOverlay(); if (!m) break; PrintSpooler.open(printContext(), {name: m.subject || '', title: m.subject || '', lines: [m.from || '', m.time || '', ...String(m.body || '').split('\n')].filter(Boolean)}); break; }
      // Docs / Sheets / Slides' Print: the file's own text.
      case 'ed-print': { const file = officeFiles().find(f => f.id === ui.edFile); ui.overlay=''; renderOverlay(); if (!file) break; PrintSpooler.open(printContext(), {name: file.name, title: file.name, lines: String(file.text || '').split('\n')}); break; }
      case 'email-folder': if(ui.view==='gmail'){data.gmailSeen={...data.gmailSeen,[id]:Date.now()};save();}ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
      case 'email-star': {const item=mailbox().find(item=>item.id===id);if(item)item.starred=!item.starred;ui.overlay='';renderOverlay();save();render();break;}
      case 'email-empty-trash': ui.overlay='email-empty-trash';renderOverlay();break;
      case 'email-empty-trash-ok': {const box=mailbox();for(let i=box.length-1;i>=0;i--)if(box[i].folder==='Trash')box.splice(i,1);ui.overlay='';renderOverlay();save();render();break;}
      case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
      case 'email-clear-selection': ui.emailSelected=[];render();break;
      case 'email-trash': case 'email-selected-trash': ICSEmail.trash(mailbox(),action==='email-trash'?[ui.emailId]:ui.emailSelected||[]);ui.sub='';ui.emailSelected=[];save();render();break;
      case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-selected-read': mailbox().filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
      case 'email-unread': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
      case 'email-search': ui.emailQuery='';render();viewport.querySelector('[data-form="email-search"] input')?.focus();break;
      case 'email-refresh': toast('Local mailbox is up to date');break;
      case 'email-cc': ui.emailCc=true;ui.overlay='';render();break;
      case 'email-attach': ui.overlay='email-attach';renderOverlay();break;
      case 'email-attach-photo': {const item=mailbox().find(item=>item.id===ui.emailId),photo=data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
      case 'email-remove-attachment': {const item=mailbox().find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
      case 'email-attach-file': docPick(ui.view, '*/*'); break;
      case 'email-remove-file': {const item=mailbox().find(item=>item.id===ui.emailId);if(item?.files)item.files.splice(Number(id),1);save();render();break;}
      case 'email-discard': ui.overlay='email-discard';renderOverlay();break;
      case 'email-confirm-discard': ICSEmail.trash(mailbox(),[ui.emailId]);ui.sub='';ui.overlay='';save();render();break;
      // Gmail: Archive leaves the inbox (the conversation stays in All mail); tips and teaser links.
      case 'email-archive': case 'email-selected-archive': {const ids=action==='email-archive'?[ui.emailId]:ui.emailSelected||[];mailbox().filter(item=>ids.includes(item.id)&&item.folder==='Inbox').forEach(item=>{item.folder='Archive';});ui.sub='';ui.emailSelected=[];save();render();break;}
      case 'email-dismiss-teaser': if(ui.view==='gmail')data.gmailTeaserDismissed=true;else data.emailTeaserDismissed=true;save();render();break;
      // Gmail settings (gmail.js GmailApp.settings); Email's own settings are not simulated.
      case 'email-settings': ui.overlay = ''; renderOverlay(); if (ui.view === 'gmail') { ui.sub = 'gm-settings'; ui.gmPref = ''; } else { ui.sub = 'em-settings'; ui.emPref = ''; } render(); break;
      case 'gmail-categories': ui.sub = 'gm-settings'; ui.gmPref = 'categories'; render(); break;
      case 'gmail-pref': if (id.startsWith('label:')) ui.gmLabelFrom = ui.gmPref || 'account'; ui.gmPref = id; render(); break;
      case 'gmail-pref-toggle': { const prefs = data.gmailPrefs ||= {}; const fallback = id.startsWith('category-') ? !['updates', 'forums'].includes(id.slice(9)) : !['reply-all', 'starred'].concat(['confirm-delete', 'confirm-archive', 'confirm-send']).includes(id); prefs[id] = !(prefs[id] ?? fallback); save(); render(); break; }
      case 'gmail-pref-list': ui.gmPrefList = id; render(); break;
      case 'gmail-pref-pick': { const [key, value] = id.split(':'); (data.gmailPrefs ||= {})[key] = Number(value); ui.gmPrefList = ''; save(); render(); break; }
      case 'gmail-pref-close': ui.gmPrefList = ''; ui.gmSignature = undefined; render(); break;
      case 'gmail-signature': ui.gmSignature = (data.gmailPrefs || {}).signature || ''; render(); viewport.querySelector('[data-gmail-signature]')?.focus(); break;
      case 'gmail-signature-save': { const text = viewport.querySelector('[data-gmail-signature]')?.value ?? ui.gmSignature ?? ''; (data.gmailPrefs ||= {}).signature = String(text).trim(); ui.gmSignature = undefined; save(); render(); break; }
      case 'gmail-noop': break;
      case 'gmail-unavailable': toast(i18n.t('This feature is not part of the simulator.'));break;
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, mrContext()); return; }
    if (form.dataset.form === 'dpr-vmnumber') { LPDialerPrefs.saveVoicemail(values.get('text') || '', {data, ui}); save(); render(); return; }
    if (form.dataset.form === 'dpr-quick') { LPDialerPrefs.saveQuick(values.get('text') || '', {data, ui, t: key => i18n.t(key), locale: i18n.locale()}); save(); render(); return; }
    if (form.dataset.form === 'ldp-search') { LPDocPicker.search(values.get('q'), docContext()); render(); return; }
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    if(form.dataset.form==='sx-save'){ui.systemError=ICSSystemSettings.submit(data,ui,values);if(ui.systemError){ui.systemValues=Object.fromEntries(values);renderOverlay();return;}save();ui.overlay='';render();return;}
    if(form.dataset.form==='sx-vpn-connect'){ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();return;}
    if(form.dataset.form==='sx-profile-delete'){ICSSystemSettings.removeProfile(data,ui);save();ui.overlay='';render();return;}
    if (form.dataset.form === 'jbp-search') { const q = String(values.get('query') || '').trim(); if (!q) return; data.marketSearches = [q, ...(data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); jbPlayGo({page: 'search', query: q}); return; }
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
    if (form.dataset.form === 'p2p-rename') {
      const name = String(values.get('name') || '').trim();
      if (!name) return;
      data.settings.p2pName = name; save(); ui.overlay = ''; render(); return;
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
        const name=String(values.get('name')||'').trim(); if(!name)return;
        const id=ui.sub==='edit'?ui.selectedContact:Date.now();
        const person=contact(id)||{id};
        for(const key of ['name','phone','email','company','notes'])person[key]=String(values.get(key)||'').trim();
        if(!contact(id))data.contacts.push(person);
        const groups=values.getAll('groups');
        data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});
        save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast('Contact saved');break;
      }
      case 'people-group': {
        const name=String(values.get('name')||'').trim();if(!name)return;
        const group=data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
        group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
        if(!data.contactGroups.some(g=>g.id===group.id))data.contactGroups.push(group);
        save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
      }
      case 'address': navigateBrowser(values.get('address')); break;
      case 'web-search': navigateBrowser(`search:${values.get('query')}`); break;
      case 'maps-search': ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(data, ui.mapsQuery); save(); render(); break;
      case 'ed-search': { const query = String(values.get('query') || '').trim(); if (!query) return; ui.edQuery = query; ui.sub = 'results'; render(); break; }
      case 'drive-search': { const query = String(values.get('query') || '').trim(); if (!query) return; ui.driveQuery = query; ui.sub = 'results'; render(); break; }
      case 'yt-search': { const query = String(values.get('query') || '').trim(); if (!query) return; LPYouTube.searched(query, data); save(); ui.ytQuery = query; ui.sub = 'results'; render(); break; }
      case 'keep-li-add': { const text = String(values.get('text') || '').trim(), note = keepCurrent(); if (!text || !note?.list) return; note.list.push({text, checked: false}); save(); render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
      case 'keep-add': { const text = String(values.get('text') || '').trim(); if (!text) return; data.keepNotes = [{id: 'k' + Date.now(), text, color: (data.keepNotes || []).length % 5}, ...(data.keepNotes || [])]; save(); render(); break; }
      case 'earth-search': ui.earthQuery = String(values.get('query') || '').trim().slice(0, 60); ui.earthSearching = false; render(); break;
      case 'chrome-history-search': ui.chromeHistoryQuery = String(values.get('query') || '').trim(); render(); break;
      case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
      case 'hg-new': { const target = ICSMessaging.recipient(values.get('recipient'), data.contacts); if (!target) { toast('Enter a contact name or valid phone number'); return; } pickHangout(target.key); break; }
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
        // Guests, the time zone ('' is the device's) and Show me as / Privacy (5.1's Visibility holds both).
        event.guests=String(values.get('guests')||'').trim();event.tz=String(values.get('tz')||'');
        if(values.has('visibility')){const [privacy,availability]=String(values.get('visibility')).split(':').map(Number);event.privacy=privacy||0;event.availability=availability||0;}else{event.availability=Number(values.get('availability')||0);event.privacy=Number(values.get('privacy')||0);}
        const {scope,instance,seriesStart}=event;delete event.scope;delete event.instance;delete event.seriesStart;
        const existing=data.events.findIndex(item=>item.id===event.id);
        if(scope&&existing>=0){
          const series=data.events[existing];
          if(scope==='this'){series.exdates=[...new Set([...(series.exdates||[]),instance])];event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else if(scope==='future'&&instance!==seriesStart){series.until=ICSCalendar.plus(instance,-1);event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
          else {const shift=Math.round((ICSCalendar.parse(event.date)-ICSCalendar.parse(instance))/864e5),span=Math.round((ICSCalendar.parse(event.endDate)-ICSCalendar.parse(event.date))/864e5);event.date=ICSCalendar.plus(seriesStart,shift);event.endDate=ICSCalendar.plus(event.date,span);data.events[existing]=event;}
        } else if(existing<0)data.events.push(event);else data.events[existing]=event;
        save();ui.selectedDate=event.date;ui.selectedEvent=event.id;ui.selectedInstance=scope&&scope!=='all'?event.date:instance||'';ui.eventDraft=null;ui.sub='event';render();toast('Event saved');break;
      }
      case 'calendar-search': ui.calendarSearch=String(values.get('query')||'').trim();render();break;
      case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';kdcCommit();render();break;
      case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';kdcCommit();render();break;
      case 'email': {const item=mailbox().find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.send(item)){ui.emailError='Enter valid email addresses';save();render();break;}save();ui.emailFolder='Sent';ui.emailQuery=undefined;ui.sub='read';ui.emailError='';render();toast('Demo email sent');break;}
      case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
      case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale','animatorScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){data.settings.fontSize=choice;data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  // Play Store 5.2 details: the toolbar floats clear over the hero and takes the corpus colour once the hero has scrolled
  // under it (FinskyHeaderListLayout).
  document.addEventListener('scroll', event => {
    const list = event.target; if (!list?.matches?.('.lpp-detail .jbp-scroll')) return;
    const bar = list.parentElement.querySelector('.lpp-bar.overlay'), hero = list.querySelector('.lpp-hero');
    if (bar && hero) bar.classList.toggle('solid', list.scrollTop > hero.offsetHeight - bar.offsetHeight);
  }, true);
  document.addEventListener('input', event => {
    if (event.target.matches('[data-pr]') && PrintSpooler.input(event.target, printContext())) return;
    if (event.target.matches('[data-gnp-q]') && ui.gnowDraft?.placeDialog) { ui.gnowDraft.placeDialog.q = event.target.value; const at = event.target.selectionStart; render(); const field = viewport.querySelector('[data-gnp-q]'); field?.focus(); field?.setSelectionRange(at, at); return; }
    if (event.target.matches('[data-gnr-rule]') && ui.gnowDraft?.ruleDialog) { const r = ui.gnowDraft.ruleDialog, key = event.target.dataset.gnrRule, value = event.target.value;
      if (key === 'interval' || key === 'count') { r[key] = Math.max(1, Math.min(key === 'count' ? 730 : 99, Number(value) || 1)); const label = event.target.closest('.gnr-interval'); if (label && key === 'interval') { const keep = event.target.selectionStart; render(); const f = viewport.querySelector('[data-gnr-rule="interval"]'); f?.focus(); try { f?.setSelectionRange(keep, keep); } catch (error) { /* number input */ } } return; }
      if (key === 'until') { r.until = value; return; }
      r[key] = Number(value); if (key === 'end' && r.end === 1 && !r.until) r.until = ICSCalendar.iso(new Date(deviceDate().getTime() + 30 * 864e5)); render(); return; }
    if (event.target.matches('[data-lng-seek]') && InputLanguage.input(event.target, langContext())) return;
    if (event.target.matches?.('[data-city-search]')) { ui.cityQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-city-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return; }
    if (event.target.matches?.('[data-cpref-volume]')) { ui.clockDraft = Number(event.target.value); return; }
    if (event.target.matches?.('[data-chr-seek]')) { const ctx = {ui, data, locale: i18n.locale()}; ChromeApp.prefSeek(event.target.value, ctx); ChromeApp.seekPaint(viewport, ctx); save(); return; }
    if (event.target.matches('[data-tzp-search]') && ui.tzp) { TimeZonePicker.input(ui.tzp, event.target.value, tzpContext()); renderTzPicker(true); return; }
    if (event.target.matches('[data-keep-search]')) { ui.keepQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-keep-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return; }
    if (event.target.matches('[data-photos-search]')) { ui.photosQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-photos-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return; }
    if (event.target.matches('[data-pa-search]')) { ui.paQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-pa-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return; }
    if (event.target.matches?.('[data-people-search]')) {
      ui.peopleQuery = event.target.value;
      const list = viewport.querySelector('.lpp-list');
      if (list) { const fresh = document.createElement('div'); fresh.innerHTML = renderPeople(); list.innerHTML = fresh.querySelector('.lpp-list').innerHTML; i18n.translateDOM?.(list); }
      return;
    }
    if (event.target.matches?.('[data-kk-dialer-search]')) {
      ui.phoneSearch = event.target.value;
      const list = viewport.querySelector('[data-kk-dialer-list]');
      if (list) { const fresh = document.createElement('div'); fresh.innerHTML = LPDialer.render({data, ui, t: phoneText, locale: i18n.locale(), byPhone: contactByPhone}); list.innerHTML = fresh.querySelector('[data-kk-dialer-list]').innerHTML; i18n.translateDOM?.(list); }
      return;
    }
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);delete folder.nameKey;save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
    if (event.target.matches('[data-bk-bright]')) { data.bookPrefs = {...PlayApps.bookPrefs(data), brightness: Number(event.target.value)}; save(); viewport.querySelector('.pb-reader')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return; }
    if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return;}
    if(event.target.closest('.email-compose')&&event.target.name){const item=mailbox().find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return;}
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
    if (event.target.closest('.jbp-bar.searching')) { ui.marketEdit = event.target.value; const view = viewport.querySelector('.jbp'); view?.querySelector('.jbp-suggest')?.remove(); const tmp = document.createElement('div'); tmp.innerHTML = JBPlay.render(jbPlayContext()); const sug = tmp.querySelector('.jbp-suggest'); if (sug && view) view.append(sug); return; }
    if (event.target.matches('[data-jbp-auto]')) { const id = event.target.dataset.jbpAuto, list = data.marketAuto || []; data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return; }
    if (event.target.matches('[data-gnr-title]')) { if (ui.gnowDraft) ui.gnowDraft.title = event.target.value; return; }
    if (event.target.matches('[data-gmail-signature]')) { ui.gmSignature = event.target.value; return; }
    if (event.target.matches('[data-keep-li]')) { const item = keepCurrent()?.list?.[Number(event.target.dataset.keepLi)]; if (item) { item.text = event.target.value; save(); } return; }
    if (event.target.matches('.keep-text')) { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { note.text = event.target.value; save(); } return; }
    if (event.target.closest('.hg-new')) {
      const query = event.target.value.trim().toLocaleLowerCase();
      (data.messageDrafts ||= {}).new ||= {body: '', recipient: ''};
      data.messageDrafts.new.recipient = event.target.value; save();
      viewport.querySelectorAll('.hg-person').forEach(row => { row.hidden = !!query && !row.dataset.search.includes(query); });
      return;
    }
    if (event.target.closest('.mms-compose')) {
      const draft = messageDraft();
      if (event.target.name === 'body') draft.body = event.target.value;
      if (event.target.name === 'recipient') {
        draft.recipient = event.target.value;
        const query = draft.recipient.trim().toLocaleLowerCase();
        viewport.querySelector('.mms-suggestions').innerHTML = query ? data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
      }
      draft.updated = Date.now(); save();
      const count = ICSMessaging.counter(draft.body || '');
      viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : '';
      viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
      if (event.target.name === 'body') { event.target.style.height = 'calc(48.5652 * var(--dp))'; event.target.style.height = `${Math.min(dp(97.1303),event.target.scrollHeight)}px`; }
      return;
    }
    if (event.target.dataset.field === 'lp-volume') { data.settings[event.target.dataset.key] = Number(event.target.value); event.target.style.setProperty('--v', `${event.target.value}%`); save(); return; }
    if (event.target.dataset.field === 'auto-brightness') { data.settings.autoBrightness = event.target.checked; save(); const slider = event.target.closest('.jb-brightness')?.querySelector('[data-field="brightness"]'); if (slider) slider.disabled = data.settings.autoBrightness; return; }
    if (event.target.dataset.field === 'brightness') {
      data.settings.brightness = Number(event.target.value); save(); event.target.style.setProperty('--v', `${(data.settings.brightness - 10) / .9}%`);
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
  let homeLongPressTimer = null, calculatorClearTimer = null, messageHoldTimer = null;
  let kdcDialDrag = false;
  const kdcDialPick = event => { const dial = overlayRoot.querySelector('[data-kdc-dial]'); if (!dial || !ui.kdcPicker) return; const r = dial.getBoundingClientRect(); ui.kdcPicker = KKDeskClock.pick(ui.kdcPicker, (event.clientX - r.left) * dial.offsetWidth / r.width, (event.clientY - r.top) * dial.offsetHeight / r.height, dial.offsetWidth, !!data.settings.hour24); renderOverlay(); };
  overlayRoot.addEventListener('pointerdown', event => { if (!event.target.closest('[data-kdc-dial]') || event.target.closest('button')) return; kdcDialDrag = true; event.preventDefault(); kdcDialPick(event); });
  window.addEventListener('pointermove', event => { if (kdcDialDrag) kdcDialPick(event); });
  window.addEventListener('pointerup', () => { if (!kdcDialDrag) return; kdcDialDrag = false; if (ui.kdcPicker?.mode === 'hour') { ui.kdcPicker.mode = 'minute'; setTimeout(renderOverlay, 120); } });
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
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
    const driveItem = event.target.closest('[data-drive-hold]');
    if (driveItem && !ui.overlay && !ui.driveDialog) LPDrive.handle('drv-hold', driveItem.dataset.driveHold, {data, ui, save, render, toast, root: viewport});
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
    const message = event.target.closest('.mms-message');
    const kwpScroll = ui.view === 'wallpaper-picker' ? event.target.closest('.kwp-scroll') : null;
    if (kwpScroll) { pointerStart.kwpScroll = kwpScroll; pointerStart.kwpLeft = kwpScroll.scrollLeft; }
    const kwpLong = ui.view === 'wallpaper-picker' && !ui.wp?.checked?.length ? event.target.closest('[data-kwp-long]') : null;
    if (kwpLong) homeLongPressTimer = setTimeout(() => { ui.wp.checked = [kwpLong.dataset.id]; pointerStart = null; suppressReleaseClick(); wallpaperPickerRender(); }, holdDelay(550));
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
    // Drive: a held item opens menu_doclist_context.xml for it (lp-drive.js).
    const heldDrive = event.target.closest('[data-drive-hold]');
    if (heldDrive && !ui.overlay && !ui.driveDialog) messageHoldTimer = setTimeout(() => { suppressReleaseClick(); LPDrive.handle('drv-hold', heldDrive.dataset.driveHold, {data, ui, save, render, toast, root: viewport}); }, holdDelay(550));
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    if (ui.view === 'calculator' && !ui.overlay && event.target.closest('.calc-pager')) pointerStart.calculatorSwipe = true;
    if (event.target.closest('.ics-calc-delete button')) calculatorClearTimer = setTimeout(() => { operateCalculator('C'); suppressClickUntil = Date.now() + 350; render(); }, holdDelay(600));
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), holdDelay(440));
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > dp(9)) { clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); }
    // The wallpaper strip scrolls sideways under a mouse drag as it would under a finger.
    if (pointerStart.kwpScroll && event.pointerType === 'mouse' && (pointerStart.kwpDragging || Math.abs(dx) > dp(9))) { pointerStart.kwpDragging = true; const k = screen.getBoundingClientRect().width / screen.offsetWidth || 1; pointerStart.kwpScroll.scrollLeft = pointerStart.kwpLeft - dx / k; suppressClickUntil = Date.now() + 350; event.preventDefault(); return; }
    if (pointerStart.calculatorSwipe && (pointerStart.calculatorSwiping || Math.abs(dx) > dp(13) && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.calculatorSwiping = true; suppressClickUntil = Date.now() + 350; event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const track = viewport.querySelector('.calc-panels');
      if (track) { track.style.transition = 'none'; track.style.transform = `translateX(${Math.max(-(screen.clientWidth - LP_CALC_PEEK), Math.min(0, -ui.calcPanel * (screen.clientWidth - LP_CALC_PEEK) + dx))}px)`; }
      return;
    }
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > dp(13) && Math.abs(dx) > Math.abs(dy) * 1.1 && performance.now() - pointerStart.downTime < 260)) {
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
    if((pointerStart.clockSwiping || ui.view==='clock' && !ui.sub && !ui.overlay && pointerStart.target.closest('[data-jbclock-swipe]') && Math.abs(dx)>dp(13) && Math.abs(dx)>Math.abs(dy)*1.2)) {
      pointerStart.clockSwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const track=viewport.querySelector('.jbclock-track'),index=JBDeskClock.TABS.indexOf(data.jbClock?.tab||'clock');
      if(track){track.style.transition='none';track.style.transform=`translateX(calc(${-index*100}% + ${dx}px))`;}return;
    }
    if(ui.view==='calendar' && !ui.sub && !ui.overlay && !pointerStart.scrolling && pointerStart.target.closest('[data-calendar-swipe]') && Math.abs(dx)>dp(13) && Math.abs(dx)>Math.abs(dy)*1.2) {
      pointerStart.calendarSwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const surface=viewport.querySelector('[data-calendar-swipe]');surface.style.transform=`translateX(${dx}px)`;return;
    }
    if (ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && pointerStart.target.closest('[data-gallery-swipe]') && Math.abs(dx)>dp(11) && Math.abs(dx)>Math.abs(dy)) {
      pointerStart.gallerySwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const picture=viewport.querySelector('.gallery-image');if(picture)picture.style.transform=`translateX(${dx}px)`;return;
    }
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
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal)) startDrag(event.clientX, event.clientY);
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
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (pointerStart.kwpDragging) { suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if(pointerStart.clockSwiping){const tabs=JBDeskClock.TABS,index=tabs.indexOf(data.jbClock?.tab||'clock'),next=Math.max(0,Math.min(tabs.length-1,index+(Math.abs(dx)>dp(50)?(dx<0?1:-1):0)));data.jbClock.tab=tabs[next];save();render();suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    // Play Store 4.8: a swipe from the left edge of a top-level page opens the drawer, a swipe to the left closes it.
    if (ui.view === 'play-store' && Math.abs(dx) > dp(55) && Math.abs(dx) > Math.abs(dy) * 1.5) {
      const left = (pointerStart.x - screen.getBoundingClientRect().left) / (screen.getBoundingClientRect().width / screen.offsetWidth);
      if (!ui.overlay && dx > 0 && left < 20 && ['home', 'my-apps', 'wishlist'].includes(ui.market?.page || 'home')) { ui.overlay = 'jbp-drawer'; renderOverlay(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
      if (ui.overlay === 'jbp-drawer' && dx < 0) { ui.overlay = ''; renderOverlay(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    }
    if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && pointerStart.target.closest('.jbp-scroll') && Math.abs(dx) > dp(66) && Math.abs(dx) > Math.abs(dy) * 1.5) { const tabs = [...viewport.querySelectorAll('.jbp-tabs button')], i = tabs.findIndex(b => b.classList.contains('on')), next = tabs[i + (dx < 0 ? 1 : -1)]; if (next) next.click(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if(pointerStart.calendarSwiping){if(Math.abs(dx)>dp(50))calendarMove(dx<0?1:-1);else viewport.querySelector('[data-calendar-swipe]').style.transform='';suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(33)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.gallerySwiping) { if(Math.abs(dx)>dp(50))galleryStep(dx<0?1:-1);else render();suppressClickUntil=Date.now()+350;pointerStart=null;return; }
    if (pointerStart.calculatorSwiping) { setCalculatorPanel(Math.abs(dx) > dp(55) ? (dx < 0 ? 1 : 0) : ui.calcPanel); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
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
          setTimeout(() => removeRecentTask(id), duration);
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
  window.addEventListener('pointercancel', () => { clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer); const calcTrack = viewport.querySelector('.calc-panels'); if (calcTrack) { calcTrack.style.transition = ''; calcTrack.style.transform = `translateX(-${ui.calcPanel * 50}%)`; snapResting(calcTrack); } clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); if (ui.extraScreen) { stripEmptyScreens(); save(); if (ui.view === 'home') render(); } setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  window.addEventListener('pointercancel',()=>{const surface=viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform='';});
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if(ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryStep(event.key==='ArrowLeft'?-1:1);return;}
    if (event.target.matches?.('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
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
  function powerKey() { if (ui.power === 'off') { bootUp(false); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
  for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
  // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
  function powerConfirm(kind) {
    if (kind === 'bugreport') { ui.overlay = ''; render(); setTimeout(() => addNotification('Bug report captured', 'Touch to share your bug report'), 6000); return; }
    ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
    setTimeout(() => powerOff(kind === 'safemode'), GlobalActions.SHUTDOWN_MS);
  }
  function powerOff(reboot) {
    if (ui.activeCall) ui.activeCall = null;
    if (ui.music) ui.music.playing = false;
    ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.safeMode = false; ui.power = 'off';
    render(); renderPower();
    if (reboot) setTimeout(() => bootUp(true), 900);
  }
  function bootUp(safeMode, booted) {
    ui.power = 'boot'; ui.safeMode = safeMode; renderPower();
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
    try { if (sessionStorage.getItem('android-sim-booted-5.1.1') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; sessionStorage.setItem('android-sim-booted-5.1.1', '1'); } catch { return; }
    const loaded = document.readyState === 'complete' ? Promise.resolve() : new Promise(resolve => window.addEventListener('load', resolve, {once: true}));
    const booted = Promise.race([Promise.all([loaded, document.fonts?.ready]), new Promise(resolve => setTimeout(resolve, 12000))]);
    const finish = bootUp(false, booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); suppressClickUntil = Date.now() + 350; finish(); };
    const off = () => { powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
  }
  // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
  const volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; screen.append(volumeLayer);
  let volumeTimer = 0, volumePrevious = 0;
  const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
  function volumeKey(direction) {
    const buttons = ClockPrefs.prefs(data).buttons;
    if (ui.overlay === 'clock-ringing' && buttons !== '0') { const b = document.createElement('button'); b.dataset.action = buttons === '1' ? 'alarm-snooze' : 'alarm-dismiss'; viewport.append(b); b.click(); b.remove(); return; }
    if (ui.power) return;
    const stream = volumeStream();
    // With the screen off the keys only reach music that is playing, and no panel is shown.
    if (ui.sleeping && stream !== 'music') return;
    const result = VolumePanel.adjust(data.settings, stream, direction, volumePrevious); volumePrevious = direction;
    save(); renderStatus();
    if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
    if (!ui.sleeping) showVolume(stream);
  }
  function showVolume(stream) {
    volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key));
    VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
    resetVolumeTimeout();
  }
  function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
  function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
  document.addEventListener('pointerdown', event => { if (volumeLayer.firstElementChild && !volumeLayer.contains(event.target) && !event.target.closest?.('.volume-key,.volume-rocker')) hideVolume(); }, true);
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
  function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ui.safeMode ? GlobalActions.safeMode(key => i18n.t(key)) : ''; }
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
    checkAlarms(now);
    checkTimers();
    // Interruptions: the end of a countdown, alarm or downtime condition, and Downtime's autotrigger.
    if (LPZen.tick(data.settings, now.getTime(), nextAlarmTime())) { save(); renderStatus(); if (ui.view === 'settings' && ui.sub === 'zen' && !ui.overlay) render(); }
    // Dreams redraw only when the saver moves (each minute) or the slideshow advances; otherwise just the text changes.
    if (ui.overlay === 'dream' && !pointerStart) {
      const key = `${data.settings.daydreamType}:${Math.floor(Date.now() / 60000)}:${Math.floor(Date.now() / 6000)}`, type = data.settings.daydreamType || 'clock';
      const changed = type === 'clock' ? key.split(':')[1] !== ui.dreamKey?.split(':')[1] : type === 'photoframe' ? key !== ui.dreamKey : false;
      if (changed || !ui.dreamKey) { ui.dreamKey = key; renderOverlay(); }
      else { const fresh = document.createElement('div'); fresh.innerHTML = renderDream(); const saver = overlayRoot.querySelector('.jb-dream-saver'), next = fresh.querySelector('.jb-dream-saver'); if (saver && next) { saver.querySelector('.jbclock-time').innerHTML = next.querySelector('.jbclock-time').innerHTML; } }
    }
    checkReminders(now);
    if(ui.view==='gallery' && ui.sub==='photo' && ui.gallerySlideshow && !ui.overlay && Date.now()-ui.gallerySlideAt>=3000){ui.gallerySlideAt=Date.now();galleryStep(1);}
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
