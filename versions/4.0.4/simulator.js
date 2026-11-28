/* Android 4.0.4 inspired browser simulation. No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-ics-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // Launcher2 shows its clings on the first run; saved desktops from before count as dismissed.
    clings: LauncherClings.fresh(),
    // The framework's default_wallpaper is Chroma; Launcher2's wallpapers array lists the set alphabetically (IMM76I).
    wallpaper: 3, wallpaperRevision: 1,
    // config default_wallpaper_component: com.android.phasebeam/.PhaseBeamWallpaper (IMM76I and JWR66Y frameworks).
    liveWallpaper: { id: 'phasebeam' },
    // IMM76I's Launcher2 default_workspace.xml: Power control; the analog clock, Camera and the Google folder; Play Store's
    // widget, Gallery and Settings. Revision 3 fills the Google folder with the image's apps.
    layoutRevision: 3,
    homePages: Array.from({length: 5}, (_, page) => Array.from({length: 16}, (_, slot) =>
      page === 2 && slot === 12 ? 'camera' : page === 2 && slot === 15 ? 'folder-google' :
      page === 3 && slot === 13 ? 'gallery' : page === 3 && slot === 14 ? 'settings' : null)),
    homeWidgets: [
      [],
      [{ id: 'default-power', type: 'power', x: 0, y: 3 }],
      [{ id: 'default-analog', type: 'analog', x: 1, y: 0 }],
      [{ id: 'default-play', type: 'play-store', x: 1, y: 1 }],
      []
    ],
    folders: {'folder-google': {name: 'Google', items: ['maps', 'gmail', 'google-plus', 'play-store', 'play-music', 'youtube', 'talk', 'calendar', 'navigation', 'messenger']}},
    dock: ['phone', 'people', 'apps', 'messaging', 'browser'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false,
      // IMM76I SettingsProvider: def_screen_brightness_automatic_mode is true (the Galaxy Nexus has a light sensor).
      autoBrightness: true },
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
      { id: 1, title: 'Welcome to Android 4.0.4', detail: 'Your phone is ready to explore.' },
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
      // A saved desktop without a live wallpaper keeps its picture: the Phase Beam default is for a first boot only.
      ['live wallpaper on first boot only', (result, saved) => {
        if (!('liveWallpaper' in saved)) delete result.liveWallpaper;
      }],
      ['clings of an older save', (result, saved) => {
        if (!saved.clings) result.clings = LauncherClings.dismissedAll();
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
        if ((saved.layoutRevision || 0) < 3) { result.homePages = clone(defaultData.homePages); result.homeWidgets = clone(defaultData.homeWidgets); result.dock = clone(defaultData.dock); result.folders = {...(result.folders || {}), ...clone(defaultData.folders)}; result.layoutRevision = 3; }
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
      // Saved choices from the Chroma-first list follow their picture into the image's order once.
      ['wallpaper revision 1', (result, saved) => {
        if (!saved.wallpaperRevision) {
          const old = ['chroma','architecture','bubblegum','canyon','escape','fidelity','flora','kepler','leaf','noir','outofthebox'];
          if (typeof result.wallpaper === 'number' && result.wallpaper < old.length) result.wallpaper = ['architecture','bubblegum','canyon','chroma','escape','fidelity','flora','kepler','leaf','noir','outofthebox'].indexOf(old[result.wallpaper]);
          result.wallpaperRevision = 1;
        }
      }]
    ]);
  }
  let data = load();
  AndroidState.onProblem(problem => setTimeout(() => toast(i18n.t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
  if(!data.sleepNever){data.sleepNever=true;if(data.settings.sleep===30)data.settings.sleep=-1;}
  ICSLockscreen.initialize(data);
  function save() { AndroidState.save(STORE, data); }
  const ui = {
    view: 'home', sub: '', page: 2, drawerTab: 'apps', drawerPage: 0, overlay: '',
    selectedContact: 1, thread: 1, selectedPhoto: 1,
    dial: '', callNumber: '', aboutTaps: 0, buildTaps: 0, easterNyan: false, settingsRootScroll: 0,
    browserUrl: data.browserHistory.at(-1) || 'www.google.com', browserHistory: [...data.browserHistory], browserIndex: data.browserHistory.length - 1, browserTabs: [data.browserHistory.at(-1) || 'www.google.com'], browserTab: 0,
    calendarMode: ['Day','Week','Month','Agenda'].includes(data.calendarMode)?data.calendarMode:'Month', selectedDate: localDate(ICSSystemSettings.wallDate(data)),
    phoneTab: 'dialpad',
    play: ICSPlayStore.initial(), playHistory: [],
    musicPlaying: false, musicTrack: 0, musicPosition: 0,
    emailId: 1, recent: [], recentSnapshots: {}, toastTimer: null, wifiTarget: '', bluetoothScanned: false
  };
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Galaxy Nexus is ready. Explore the new look of Android 4.0, customize your home screen, and discover the little surprise hidden in Settings.', hoursAgo: 1 },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', hoursAgo: 26 },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', hoursAgo: 30 }
  ];
  const tracks = ICSMusic.tracks;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  // Gmail 4.0.4's own offline account (ics-gmail.js).
  data.gmail40 = ICSGmail.restore(data.gmail40);
  syncBrowserState();
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'People', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Play Store', '▶', '#b5d26d', '#53732f'],
    // Google's apps of the IMM76I image.
    ['gmail', 'Gmail', '✉', '#ffffff', '#db4437'], ['play-music', 'Play Music', '♫', '#ff9800', '#e65100'],
    ['maps', 'Maps', '⌖', '#cfe6b8', '#4285f4'], ['navigation', 'Navigation', '➤', '#4285f4', '#1a73e8'], ['local', 'Places', '⌖', '#db4437', '#a52714'],
    ['earth', 'Earth', '◍', '#1f6fd1', '#0b2f73'], ['news-weather', 'News & Weather', '☼', '#4285f4', '#9e9e9e'], ['messenger', 'Messenger', '✉', '#dd4b39', '#b03a2e'],
    ['movie-studio', 'Movie Studio', '▶', '#607d8b', '#37474f'],
    ['google-plus', 'Google+', 'g+', '#dd4b39', '#b03a2e'], ['talk', 'Talk', '✆', '#5b9bd5', '#2f6ea8'], ['youtube', 'YouTube', '▶', '#e62117', '#b31217'],
    ['play-books', 'Play Books', '▤', '#4285f4', '#1a73e8'], ['play-movies', 'Play Movies', '▶', '#e53935', '#b71c1c'], ['search', 'Search', '⌕', '#9ad0f0', '#3a7fb0'],
    ['voice-dialer', 'Voice Dialer', '🎤', '#3dc484', '#217258'], ['latitude', 'Latitude', '⌖', '#4285f4', '#1a73e8'],
    // DownloadProviderUi of the image (holo-downloads).
    ['downloads', 'Downloads', '⬇', '#8bc34a', '#33691e']
  ];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  const wallpaperFiles = ['architecture','bubblegum','canyon','chroma','escape','fidelity','flora','kepler','leaf','noir','outofthebox'];
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3 },
    { type: 'music', name: 'Music', app: 'music', width: 4, height: 1 },
    // Gallery2 asks for 180dp plus ICS default widget padding: 3 × 3 Launcher cells.
    { type: 'photo', name: 'Photo Gallery', app: 'gallery', width: 3, height: 3 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 },
    // Play Store 3.4.7's MarketWidgetProvider (minWidth / minHeight 110 dp: 2 × 2).
    { type: 'play-store', name: 'Play Store', app: 'play-store', width: 2, height: 2 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const iconAssets = new Set(['downloads', 'google-plus', 'talk', 'youtube', 'play-books', 'play-movies', 'search', 'voice-dialer', 'latitude', 'maps', 'earth', 'news-weather', 'messenger', 'navigation', 'local', 'movie-studio', 'play-music', 'gmail', 'phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps']);
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
  // The context of the store apps and of this version's own modules (ics-*.js): c below, with the host's dialog and menu.
  function storeContext() { return StoreHost.context(c); }
  const isStoreApp = id => String(id).startsWith('store-') && StoreHost.has(id);
  // Installed from the store: the app joins the launcher and, with the store's shortcut setting on, the home screen.
  function storeInstalled(id) { const r = StoreHost.runtime(id); if (!r) return; storeAppsSync(); if (icsPlayContext().prefs.widgets) placeShortcut(r, appNames[r]); }
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
  StoreHost.provide(storeContext);
  ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
  const screen = document.querySelector('#screen');
  // dp → CSS px now: the display is 360 dp wide (the desktop frame's width, the whole width on a phone).
  const dp = n => n * screen.clientWidth / 360;
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
    const person = contactShortcut(id);
    if (person) return `<span class="app-icon contact-shortcut-icon">${person.photo != null && ICSMedia?.image ? `<img src="${safe(ICSMedia.image(data.photos.find(p => String(p.id) === String(person.photo)) || {}))}" alt="">` : '<img src="assets/people-ic_contact_picture_holo_light.png" alt="">'}</span>`;
    if (id === 'play-store') return '<span class="app-icon"><img src="assets/play-store.svg?v=3" alt=""></span>';
    if (id === 'apps') return '<span class="app-icon"><img src="assets/apps.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(data,id);
    if(folder)return `<span class="app-icon launcher-folder-icon">${folder.items.slice(0,3).map(app=>`<span class="folder-preview-item">${appIcon(app)}</span>`).join('')}</span>`;
    if (id === 'google') return '<span class="app-icon google-folder-icon"><img src="assets/browser.png" alt=""><img src="assets/email.png" alt=""><img src="assets/calendar.png" alt=""><img src="assets/gallery.png" alt=""></span>';
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  const folderName=id=>ICSLauncherFolders.folder(data,id)?.name||i18n.t('Unnamed folder');
  /* Contacts' Place on Home screen: an INSTALL_SHORTCUT whose shortcut opens the contact (QuickContact), its photo or
     the image's contact picture as the icon, the name as the label. Launcher2's InstallShortcutReceiver tries the default screen, then the screens beside it outwards, the first free cell of each; none free gives out_of_space; the toast names it (shortcut_installed). */
  const contactShortcut = id => String(id).startsWith('contact:') ? data.contacts.find(p => p.id === Number(String(id).slice(8))) || {name: ''} : null;
  const VCARD = key => { const row = window.StockStrings?.vcard?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
  // InstallShortcutReceiver: a shortcut (a contact, an app the store installed) on the first free cell.
  function placeShortcut(key, label) {
    const free = page => (data.homePages[page] || []).findIndex((id, index) => !id && !(data.homeWidgets[page] || []).some(w => { const s = widgetSize(w); return index % 4 >= w.x && index % 4 < w.x + s.width && Math.floor(index / 4) >= w.y && Math.floor(index / 4) < w.y + s.height; }));
    const count = data.homePages.length;
    const order = [2, 3, 1, 4, 0].filter(i => i < count);
    let page = order.find(i => free(i) >= 0);
    if (page === undefined) { toast(VCARD('No room')); return; }
    data.homePages[page][free(page)] = key; save();
    toast(AndroidStrings.format(VCARD('Shortcut "%s" created.'), label));
  }
  const launcherIcon = id => contactShortcut(id) ? `<button class="launcher-icon contact-shortcut" data-action="open-contact" data-id="${safe(String(id).slice(8))}" aria-label="${safe(contactShortcut(id).name)}" data-no-translate>${appIcon(id)}<span>${safe(contactShortcut(id).name)}</span></button>` : ICSLauncherFolders.folder(data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="${ui.view === 'settings' && !ui.sub ? 'noop' : 'back'}" aria-label="${ui.view === 'settings' && !ui.sub ? 'Settings' : 'Back'}">${ui.view === 'settings' ? `${ui.sub ? '<img class="up-chevron" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="settings-header-icon" src="assets/settings.png" alt="">` : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  // Accessibility texts from the image's Settings (stock-strings.js).
  const a11yContext = () => ({ui, data, t: key => i18n.t(key), language: i18n.language, locale: i18n.locale(), now: deviceDate, save, render, renderOverlay, toast});
  const A11Y = key => { const row = window.StockStrings?.a11y?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); };
  // Touch & hold delay: Settings' long_press_timeout_selector values (500 / 1000 / 1500 ms); the simulator's own
  // long-press timers stretch by the same amount.
  const HOLD = [500, 1000, 1500], HOLD_NAMES = ['Short', 'Medium', 'Long'];
  const holdDelay = ms => ms + (HOLD[data.settings.longPressTimeout || 0] - 500);
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;home(false);}});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/stat_sys_alarm.png" alt="">' : ''}<span class="status-cluster">${data.settings.wifi && data.settings.wifiNetwork ? '<img class="status-wifi" src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""></span><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;

  function renderStatus() {
    const notificationIcons = (ui.syncing ? '<img src="assets/stat_notify_sync.png" alt="">' : '') + (data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_sms.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '');
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>${(modules().some(m => m.legacyMenu?.(c))||ui.view==='news-weather'&&!ui.newsSub)&&!ui.locked?'<button class="nav-key nav-menu" data-action="legacy-menu" aria-label="Menu"><img src="assets/ic_sysbar_menu.png" alt=""></button>':''}`;
    if(ui.locked)navRoot.querySelectorAll('.nav-home,.nav-recent').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');});
  }
  // Window transitions: the outgoing view is kept in a temporary layer while both animate.
  let lastScene = null, pendingNav = '', activeTransition = null;
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
    // Read aloud stops once the reader is left.
    if (ui.gaBkAloud && !(ui.view === 'play-books' && ui.gaSub === 'read')) ICSGoogleApps.books.stopAloud(ui);
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('assets/wallpaper_${wallpaperFiles[data.wallpaper] || 'chroma'}.jpg') center center / cover no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav(); syncLiveWallpaper();
    if (ui.view === 'lock') { viewport.innerHTML = renderLock(); requestAnimationFrame(lockPing); }
    else if (ui.view === 'home') { viewport.innerHTML = renderHome(); restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = renderDrawer();
    else viewport.innerHTML = renderApp();
    snapResting(viewport);
    renderOverlay();
    i18n.translateDOM(screen);
    if (ui.view === 'earth') EarthApp.mount(viewport, earthContext());
    if (StoreHost.has(ui.view)) StoreHost.mount(ui.view, storeContext(), viewport);
    const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
    lastScene = scene;
    if (transit) startTransition(transit, outgoing, viewport.firstElementChild);
    else if (activeTransition) {
      // A same-screen re-render during a transition continues the incoming animation.
      const elapsed = performance.now() - activeTransition.start;
      ICSTransitions.play(viewport.firstElementChild, ICSTransitions.specs[activeTransition.name].enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
    }
    if (ui.nyandroid && !viewport.querySelector('[data-nyandroid]')?.isSameNode(ui.nyandroid.root)) { ui.nyandroid.stop(); ui.nyandroid = null; }
    const nyanRoot = viewport.querySelector('[data-nyandroid]');
    if (nyanRoot && !ui.nyandroid) requestAnimationFrame(() => { if (nyanRoot.isConnected && !ui.nyandroid) ui.nyandroid = {...ICSNyandroid.start(nyanRoot), root: nyanRoot}; });
    each('rendered');
    cameraAttach();
  }
  /* VideoCamera and PanoramaActivity (media.js, ics-pano.js) and the Gallery's MovieActivity (ics-movie.js): a
     controller per screen, rebuilt when its root is redrawn. Leaving the camera while recording stops and keeps the clip. */
  let panoCtl = null, movieCtl = null, recTimer = 0;
  function cameraAttach() {
    if (ui.cameraRec && ui.view !== 'camera') cameraStop();
    if (ui.view !== 'camera') ui.captureFor = '';
    if (panoCtl && !viewport.querySelector('[data-icp]')?.isSameNode(panoCtl.root)) { panoCtl.destroy(); panoCtl = null; }
    const icp = viewport.querySelector('[data-icp]');
    if (icp && !panoCtl) panoCtl = {...ICSPano.attach(icp, {ui, rerender: render, shoot: cameraSave}), root: icp};
    if (movieCtl && !viewport.querySelector('[data-icm]')?.isSameNode(movieCtl.root)) { movieCtl.destroy(); movieCtl = null; }
    const icm = viewport.querySelector('[data-icm]'), clip = data.photos.find(p => p.id === ui.selectedPhoto);
    if (icm && clip && !movieCtl) movieCtl = {...ICSMovie.attach(icm, {photo: clip, ui, rerender: render, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches}), root: icm};
    clearInterval(recTimer);
    if (ui.cameraRec && ui.view === 'camera') { const paint = () => { const el = viewport.querySelector('[data-camera-rec]'); if (el) el.textContent = ICSMovie.time(Date.now() - ui.cameraRec.start); }; paint(); recTimer = setInterval(paint, 250); }
  }
  // A clip or panorama into the Camera album, named as VideoCamera / PanoramaActivity name them.
  function cameraSave(clip) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const photo = {...ICSMedia.scene(data), id: Date.now(), name: `${clip.pano ? 'PANO' : 'VID'}_${stamp.slice(0, 8)}_${stamp.slice(8)}`, album: 'camera', created: Date.now(), ...(clip.pano ? {pano: true} : {video: true, duration: Math.max(1000, Math.round(clip.duration))})};
    data.photos.unshift(photo); save(); return photo;
  }
  // A clip recorded for YouTube's Record (quickCapture) returns to it at once.
  function cameraStop() {
    const rec = ui.cameraRec; ui.cameraRec = null; clearInterval(recTimer); if (!rec) return;
    const clip = cameraSave({duration: Date.now() - rec.start});
    if (ui.captureFor === 'youtube' && ui.view === 'camera') { openApp('youtube', true); ICSGoogleApps.captured(clip, googleAppsContext()); }
  }
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  function lockScreen(){captureRecentView();lockControls.lock();ui.locked=ICSLockscreen.secure(data);ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
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
    // TransportControlView covers the clock rows while the Music service is active.
    const track = tracks[ui.music.track], transport = musicActive() ? `<div class="lock-transport" data-no-translate><div class="lock-transport-art"></div><div class="lock-transport-bar"><p><span>${safe(track.title)}</span> - ${safe(track.artist)} - ${safe(track.album)}</p><div><button data-action="lock-media" data-id="previous" aria-label="${safe(i18n.t('Previous track'))}"><img src="assets/music-ic_media_previous.png" alt=""></button><button data-action="lock-media" data-id="play" aria-label="${safe(i18n.t(ui.music.playing ? 'Pause' : 'Play'))}"><img src="assets/music-ic_media_${ui.music.playing ? 'pause' : 'play'}.png" alt=""></button><button data-action="lock-media" data-id="next" aria-label="${safe(i18n.t('Next track'))}"><img src="assets/music-ic_media_next.png" alt=""></button></div></div></div>` : '';
    return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${carrierName()}</div></div>`;
  }
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return '<img class="widget-preview-image" src="assets/calwidget-calendar_widget_preview.png" alt="">';
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return ICSWidgets.music(ui.music, tracks, false, key => i18n.t(key), true);
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  // Play Store's widget: three featured items cross-fade (ViewFlipper, 7 s each); a tap opens the item.
  function playStoreWidget() {
    const items = ICSPlay.all().filter(item => ['apps', 'games', 'books', 'movies'].includes(item.kind) && item.developer !== 'Android Demo').slice(0, 3);
    return `<div class="psw">${items.map((item, i) => `<button class="psw-item" style="--i:${i};--n:${items.length};--a:${(item.colors || ['#2c3e57'])[0]};--b:${(item.colors || ['#2c3e57', '#f1b45d'])[1] || '#f1b45d'}" data-action="widget-play-item" data-id="${safe(item.id)}"><span class="psw-promo"><em>${safe(item.name)}</em></span><span class="psw-panel"><img src="assets/play-store.svg?v=2" alt=""><span><b>${safe(item.name)}</b><small>${safe(item.developer)}</small></span></span></button>`).join('')}</div>`;
  }
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
    if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
    if (widget.type === 'play-store') return playStoreWidget();
    return null;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
  };
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(name)}"><span class="wallpaper-swatch" style="background-image:url('assets/wallpaper_${name}.jpg')"></span><strong>${safe(name[0].toUpperCase() + name.slice(1))}</strong></button>`).join('')}</div>`;
  function renderHome() {
    return `<div class="home-view"><div class="home-search"><button data-action="browser-search" aria-label="Search"><span class="google-word">Google</span></button><button class="voice-search" data-action="voice-search" aria-label="Voice search"><img class="search-microphone" src="assets/ic_btn_speak_now.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div><div class="page-indicators">${Array.from({ length: 5 }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}"></button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/launcher-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/launcher-ic_launcher_clear_active_holo.png" alt=""><span>Remove</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/launcher-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/launcher-ic_launcher_info_active_holo.png" alt=""><span>App info</span></div></div></div>`;
  }
  function renderDrawer() {
    const isApps = ui.drawerTab === 'apps';
    const pages = Math.ceil((isApps ? apps.length : widgetTypes.length) / (isApps ? 20 : 4));
    const current = Math.min(ui.drawerPage, pages - 1);
    const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    const items = isApps ? sortedApps.slice(current * 20, current * 20 + 20).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(current * 4, current * 4 + 4).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(widget.name)}"><span class="drawer-widget-title">${safe(widget.name)} <small>${widget.width} × ${widget.height}</small></span><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type)}</span></button>`).join('');
    return `<div class="drawer-view"><div class="drawer-tabs"><button class="${isApps ? 'active' : ''}" data-action="drawer-tab" data-id="apps">Apps</button><button class="${!isApps ? 'active' : ''}" data-action="drawer-tab" data-id="widgets">Widgets</button><button class="drawer-market" data-action="market" aria-label="Shop"><img src="assets/ic_launcher_market_holo.png" alt=""></button></div><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>`<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}"></button>`).join('')}</div></div>`;
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
  // LivePicker: the list (LiveWallpaperActivity), the preview with its button bar, and Polar clock's settings.
  function renderLiveWallpapers() {
    const sub = String(ui.sub || '');
    if (sub.startsWith('preview:')) {
      const spec = LiveWallpapers.find(sub.slice(8));
      return `<div class="app-view lw-preview"><div class="lw-preview-bar">${spec?.settings ? `<button data-action="lw-settings" data-id="${spec.id}">${safe(i18n.t('Settings…'))}</button>` : ''}<button data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(i18n.t('Set wallpaper'))}</button></div></div>`;
    }
    // Maps: MapWallpaperSettingsActivity (wallpaper_prefs.xml): one ListPreference, its summary fixed in the XML.
    if (sub === 'settings:maps') return `<div class="app-view settings-app"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t('Maps live wallpaper settings'))}</h2></div><div class="app-content dark lw-settings"><button class="settings-row wireless-row" data-action="lw-mapmode"><span class="row-copy">${safe(i18n.t('Map mode'))}<small>${safe(i18n.t('The mode of the map e.g. Satellite'))}</small></span></button></div></div>`;
    if (sub.startsWith('settings:')) {
      const p = data.lwPrefs?.polar || {}, palette = p.palette || '';
      const check = (key, title) => `<button class="settings-row wireless-row" data-action="lw-toggle" data-id="polar:${key}" role="checkbox" aria-checked="${p[key] !== false}"><span class="row-copy">${safe(i18n.t(title))}</span><img class="holo-checkbox" src="assets/btn_check_${p[key] !== false ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      return `<div class="app-view settings-app"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t('Polar clock settings'))}</h2></div><div class="app-content dark lw-settings">${check('showSeconds', 'Show seconds')}${check('variableWidth', 'Vary ring widths')}<button class="settings-row wireless-row" data-action="lw-palette"><span class="row-copy">${safe(i18n.t('Color palette'))}${palette ? `<small>${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[palette]))}</small>` : ''}</span></button></div></div>`;
    }
    return `<div class="app-view lw-picker" data-no-translate>${LiveWallpapers.sorted(key => i18n.t(key), i18n.locale()).map(spec => `<button class="lw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span><b>${safe(LiveWallpapers.labelOf(spec, key => i18n.t(key)))}</b><small>${safe(LiveWallpapers.describe(spec, i18n.language)).split('\n').join('<br>')}</small></span></button>`).join('')}</div>`;
  }
  viewport.addEventListener('click', event => {
    if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
    const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
  });
  function renderApp() {
    if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
    switch (ui.view) {
      case 'play-store': return ICSPlay.render(icsPlayContext());
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': return `<div class="app-view wallpaper-picker"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>Wallpapers</h2></div><div class="app-content dark">${wallpaperChoices()}</div></div>`;
      case 'settings': return renderSettings();
      case 'downloads': return HoloDownloads.render(dlContext());
      case 'gmail': return ICSGmail.render(gmailContext());
      case 'play-music': return ICSPlayMusic.render(playMusicContext());
      case 'google-plus': case 'talk': case 'youtube': case 'play-books': case 'play-movies': case 'search': case 'voice-dialer': return ICSGoogleApps.render(ui.view, googleAppsContext());
      case 'maps': case 'latitude': case 'earth': case 'news-weather': return StockApps.render(ui.view, {earthCtx: ui.view === 'earth' ? earthContext() : null, ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), now: deviceDate()});
      case 'messenger': case 'navigation': case 'local': case 'movie-studio': if (ui.view === 'navigation' && ui.navRun) return MapsRoute.nav(mrContext()); return JBExtraApps.render(ui.view, {studio: ui.view === 'movie-studio' ? movieContext() : null, messenger: ui.view === 'messenger' ? messengerContext() : null, ui, t: key => i18n.t(key), contacts: data.contacts, data});
      case 'gallery': return renderGallery();
      case 'camera': return renderCamera();
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if (app === 'movie-studio' && !resume) MovieStudio.open(ui);
    if (app === 'google-plus' && !resume) PlusPost.open(ui);
    if (app === 'messenger' && !resume) PlusMessenger.open(ui);
    if (app === 'earth' && !resume) EarthApp.open(ui);
    // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
    if (!resume) { ui.mmsPrefs = ''; ui.mmsDialog = ''; ui.mapsPrefs = null; ui.mpsDialog = null; ui.navPick = ''; ui.locResults = null; ui.locSearching = false; }
    if (app === 'news-weather' && !resume) { ui.newsSub = ''; ui.nwpScreen = ''; ui.nwpDialog = ''; }
    if (ICSGoogleApps.APPS.includes(app) && !resume) { ui.gaSub = ''; ui.gaYtStack = []; ui.gaYtDialog = null; ui.gaYtDrop = ''; if (app === 'voice-dialer') setTimeout(() => googleAppsContext().listen()); }
    if (app !== 'camera') ui.captureFor = '';
    if(ui.locked)return;
    if (!appNames[app]) return;
    captureRecentView();
    if (app === 'play-store' && !resume) { ui.play = ICSPlayStore.initial(); ui.playHistory = []; ui.market = {page: 'home'}; ui.marketHistory = []; ui.marketSearching = false; }
    if (app === 'gallery') ui.galleryPick = '';
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(StoreHost.module(app)?.scroller || (app === 'play-store' ? '.icsp-scroll' : app === 'gallery' ? '.gallery-scroll' : '.app-view')) || viewport.firstElementChild;
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
  // Play Music 4.1 plays the demo library through the shared engine (ui.music), like AOSP Music.
  function playMusicContext() {
    return {tracks, music: ui.music, ui, data, lang: i18n.language, time: ICSMusic.time, save, render, renderOverlay, toast, account: window.ICSGmail?.account,
      focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      play(ids, track) { ui.music.queue = [...ids]; ui.music.track = track; ui.music.position = 0; ui.music.playing = true; ui.musicActive = true; ui.musicTrack = track; ui.musicPlaying = true; c.saveMusic(); }};
  }
  // Google+, Talk, YouTube, Play Books / Movies, Search, Voice Dialer and Latitude (ics-google-apps.js).
  let voiceDialTimer = null;
  function googleAppsContext() {
    return {plus: ui.view === 'google-plus' ? plusContext() : null, data, ui, view: ui.view, lang: i18n.language, account: ICSGmail.account, now: deviceDate().getTime(), t: key => i18n.t(key), save, render, renderOverlay, toast, openApp,
      closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
      focus(selector) { requestAnimationFrame(() => viewport.querySelector(selector)?.focus()); },
      browse(query) { openApp('browser'); c.navigateBrowser(`search:${query}`); },
      // The Play Store (Finsky) on a page: Books' About the book and its searches.
      play(next) { openApp('play-store'); icsPlayGo(next); },
      // A manual sync (Books' Refresh): the status bar's sync icon while it runs.
      sync(ms) { ui.syncing = true; renderStatus(); setTimeout(() => { ui.syncing = false; renderStatus(); }, ms); },
      // YouTube's Record: the camcorder in VIDEO_CAPTURE with quickCapture, whose clip goes back to YouTube (cameraStop).
      record() { ui.captureFor = 'youtube'; ui.cameraMode = 'video'; ui.cameraModes = false; ui.icsPano = null; openApp('camera'); },
      // ACTION_SEND text/plain: the subject and the text into the chosen app's new message.
      share(app, subject, text) {
        openApp(app);
        if (app === 'gmail') { ICSGmail.handle('g4-compose', '', gmailContext()); const d = data.gmail40.find(m => m.id === ui.g4Id); if (d) Object.assign(d, {subject, body: text}); }
        else if (app === 'email') { c.composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) Object.assign(d, {subject, body: text + (d.body || '')}); }
        else { ui.sub = 'new'; Object.assign(c.messageDraft(), {body: text, updated: Date.now()}); }
        save(); render();
      },
      notify(title) { addNotification(title, ''); },
      // Google Search's searchable items open what they find: an app, a page, a contact, a conversation.
      apps: apps.map(([id, name]) => [id, i18n.t(name), iconAssets.has(id) ? `assets/${id}.png` : '']),
      openUrl(url) { openApp('browser'); c.navigateBrowser(url); },
      openContact(id) { openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; render(); },
      openThread(key) { c.openMessageThread(key); render(); },
      listen() { clearTimeout(voiceDialTimer); ui.gaVoice = 'listening'; render(); voiceDialTimer = setTimeout(() => { ui.gaVoice = 'failed'; if (ui.view === 'voice-dialer') render(); }, 3000); }};
  }
  // The context Gmail's module renders and acts with.
  function gmailContext() {
    return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), save, render, renderOverlay, toast, t: key => i18n.t(key), account: ICSGmail.account, root: viewport,
      focus: selector => viewport.querySelector(selector)?.focus(), submit: selector => viewport.querySelector(selector)?.requestSubmit(),
      keep: () => ICSGmail.keepDraft(data, ui, viewport.querySelector('.g4-form')), photo: photo => ICSMedia.art(photo),
      pickPicture: () => { openApp('gallery'); ui.galleryPick = 'gmail'; ui.galleryAlbum = ''; render(); }};
  }
  // Downloads: data.downloads (seeded on first use); the sort order and the selection live in ui.hdl.
  function dlContext() {
    return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), hour24: !!data.settings.hour24, t: key => i18n.t(key),
      save, render, renderOverlay, toast, openApp};
  }
  // A picked destination drives there as Type destination does; a Places find opens on the map.
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
  // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
  const mapsPrefsContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
  // Movie Studio (movie-studio.js): the projects and the editor shell.
  const movieContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('studio', key), save, render, toast: message => toast(message), refuse: () => toast(i18n.t('This feature is not part of the simulator.')), thumb: i => StockApps.thumb(i), addIcon: 'assets/ms-ic_menu_add_clip_normal.png'});
  // Google+ posting and settings (plus-post.js): Google+ 2.4's New post, own posts and Settings.
  const plusContext = () => { PlusPost.bind(ui); return {ui, data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.gplus?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, version: '2.4', me: i18n.t('Me'), account: 'icecream.demo@gmail.com', now: deviceDate(), locale: i18n.locale(), save, render, thumb: i => StockApps.thumb(i), openMessengerSettings: () => { openApp('messenger'); ui.gpmPrefs = true; render(); }}; };
  // Google+ Messenger (plus-messenger.js): Google+ 2.4's conversations, New conversation and settings.
  const messengerContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('gplus', key), contacts: data.contacts, now: deviceDate(), locale: i18n.locale(), save, render, toast: message => toast(message), avatar: 'assets/msg-default_avatar.png', photoIcon: 'assets/gpm-ic_send_photo_holo_light.png', sendIcon: 'assets/gpm-ic_send_holo_light.png', version: '2.4', listMenu: ['Settings', 'Send feedback', 'Help'], me: i18n.t('Me')});
  // Earth (earth-app.js): Earth 6.1's settings, search, My location and Share.
  const earthContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, save, render, toast: message => toast(message), earth: '6.1', account: 'icecream.demo@gmail.com', dark: true, dot: 'assets/ea6-bluedot.png', shareTargets: [['messaging', 'Messaging']], share: (app, text, subject) => { ui.overlay = ''; renderOverlay(); openApp(app); ui.sub = 'new'; Object.assign(c.messageDraft(), {body: text, updated: Date.now()}); save(); render(); }, openLocation: () => { openApp('settings'); toast(i18n.t('This feature is not part of the simulator.')); }});
  const musicFxContext = () => ({data, ui, language: i18n.language, locale: i18n.locale(), save, render, toast: message => toast(message)});
  const devContext = () => ({data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});
  function navigateBack() {
    if ((ui.overlay === 'store-host' || !ui.overlay && isStoreApp(ui.view)) && StoreHost.back(storeContext())) return;
    if (ask('back')) return;
    if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'musicfx' && !ui.overlay) { ui.mfxSpin = false; ui.sub = 'sound'; render(); return; }
    if (ui.view === 'play-music' && !ui.overlay && ICSPlayMusic.back(ui)) { render(); return; }
    if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return; }
    if (ui.view === 'messenger' && !ui.overlay && PlusMessenger.back(ui)) { render(); return; }
    if (ui.view === 'movie-studio' && !ui.overlay && MovieStudio.back(ui)) { render(); return; }
    if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return; }
    if (ui.view === 'maps' && !ui.overlay && ui.mapsRoute && MapsRoute.back(mrContext())) return;
    if (ui.view === 'navigation' && !ui.overlay && ui.navRun) { ui.overlay = 'mr-exit'; renderOverlay(); return; }
    if (!ui.overlay && JBExtraApps.back(ui)) { render(); return; }
    // News & Weather: a settings dialog or nested screen, then the settings or the story page.
    if (ui.view === 'news-weather' && ui.newsSub && !ui.overlay) { if (!(ui.newsSub === 'settings' && NewsPrefs.back(ui))) { ui.newsSub = ''; ui.nwpScreen = ''; } render(); return; }
    // The Gallery's picker (GET_CONTENT from Email's Attach file) returns without a picture.
    if (ui.view === 'gallery' && ui.galleryPick && !ui.sub && !ui.overlay) { const caller = ui.galleryPick; ui.galleryPick = ''; openApp(caller, true); return; }
    if (ui.view === 'downloads' && HoloDownloads.back(dlContext())) return;
    // Play Books' reader: a dropdown, Display options, then the Contents popup close before the reader does.
    if (ui.view === 'play-books' && ui.gaSub === 'read' && (ui.gaBkSpin || ui.gaBkOptions || ui.gaBkToc)) { if (ui.gaBkSpin) ui.gaBkSpin = ''; else if (ui.gaBkOptions) ui.gaBkOptions = false; else ui.gaBkToc = false; render(); return; }
    if (ui.view === 'play-books') { ui.gaBkSpin = ''; ui.gaBkOptions = false; ui.gaBkToc = false; }
    // Talk: an open dialog first; Friend info returns to its chat, Blocked friends to Talk settings.
    if (ui.view === 'talk' && (ui.gaTkDialog || ui.gaSub === 'info' || ui.gaSub === 'blocked')) { if (ui.gaTkDialog) ui.gaTkDialog = null; else ui.gaSub = ui.gaSub === 'info' ? 'chat' : 'settings'; render(); return; }
    if (ui.view === 'google-plus' && !ui.overlay && PlusPost.back(ui)) { render(); return; }
    if ((ui.view === 'youtube' || ui.view === 'play-movies' || ui.view === 'play-books') && !ui.overlay && ICSGoogleApps.back(googleAppsContext())) return;
    if (ICSGoogleApps.APPS.includes(ui.view) && ui.gaSub) { ui.gaSub = ''; render(); return; }
    if (ui.view === 'gmail' && ui.sub === 'g4-prefs' && !ui.overlay) { ICSGmailPrefs.back(ui); render(); return; }
    if (ui.view === 'gmail') {
      if (ui.overlay) { ui.overlay = ''; renderOverlay(); return; }
      if (ui.sub === 'compose') { ICSGmail.keepDraft(data, ui, viewport.querySelector('.g4-form')); save(); }
      if (!ui.sub && (ui.g4Selected || []).length) { ui.g4Selected = []; render(); return; }
      if (!ui.sub && ui.g4Query !== undefined) { ui.g4Query = undefined; render(); return; }
    }
    if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();return;}
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay === 'gallery-crop-saving') return;
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return; } render(); return; }
    if (ui.view === 'lock') return;
    if (ui.view === 'gallery' && ui.galleryCrop) { ui.galleryCrop=null;render();return; }
    if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return; }
    // YouTube's capture: Back before recording returns to it without a clip (RESULT_CANCELED).
    if (ui.view === 'camera' && ui.captureFor && !ui.cameraRec && !ui.overlay) { openApp(ui.captureFor, true); return; }
    if (ui.view === 'camera' && ui.cameraRec && !ui.overlay) { cameraStop(); render(); return; }
    if (ui.view === 'camera' && ui.icsPano?.state === 'capture' && !ui.overlay) { ui.icsPano = null; render(); return; }
    if (ui.view === 'gallery' && ui.sub === 'movie') { ui.sub='photo';ui.galleryMovie=null;render();return; }
    if (ui.view === 'gallery' && ui.sub === 'photo') { ui.sub='album';ui.galleryZoom=false;render();return; }
    if(ui.view==='settings' && ['apn','operators','tether-help','device-admin'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security'}[ui.sub];render();return;}
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return; }
    if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.icsp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    // System updates, TalkBack and its settings, Explore by touch (ics-a11y.js).
    if (ui.view === 'settings' && ICSA11y.back(ui)) { render(); return; }
    if (ui.view === 'settings' && ['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; ui.easterNyan = false; render(); return; }
    if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return; }
    // Language & input's pages go back to their parent screen.
    if (ui.view === 'settings' && String(ui.sub).startsWith('lng-')) { ui.sub = {'lng-latin-adv': 'lng-latin', 'lng-subtypes': 'lng-latin', 'lng-tts-engine': 'lng-tts'}[ui.sub] || 'language'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return; }
    if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return; }
    if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return; }
    if (ui.sub) { ui.sub = ''; render(); if (ui.view === 'settings') viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return; }
    home(false);
  }
  function toast(message) {
    document.querySelector('.toast')?.remove();
    const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
    screen.append(element);
    clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
  }
  let openFolderId = '';
  /* Voice Search 3.0.1 (ics-voice.js): RecognitionDialog waits, then listens; without a microphone the recognizer's
     speech timeout ends it in "No speech heard". The listening level repaints the dialog. */
  function vs3Stop() { clearTimeout(ui.vs3Timer); clearInterval(ui.vs3Tick); }
  function vs3Start() {
    vs3Stop(); ui.vs3 = {phase: 'waiting'}; ui.overlay = 'vs3'; renderOverlay();
    ui.vs3Timer = setTimeout(() => {
      ui.vs3 = {phase: 'listening'}; renderOverlay();
      ui.vs3Tick = setInterval(() => { if (ui.overlay === 'vs3' && ui.vs3.phase === 'listening') renderOverlay(); else clearInterval(ui.vs3Tick); }, 150);
      ui.vs3Timer = setTimeout(() => { clearInterval(ui.vs3Tick); if (ui.overlay === 'vs3') { ui.vs3 = {phase: 'error'}; renderOverlay(); } }, ICSVoice.LISTEN_MS);
    }, ICSVoice.WAIT_MS);
  }
  /* RecentsPanelView.handleSwipe and the card's "Remove from list": ActivityManager.removeTask(id, REMOVE_TASK_KILL_PROCESS).
     The task and its saved state go; when it is the app on screen, that app is gone too, so once the panel closes (Back,
     the Recent apps key, the scrim, the last card) the home screen is there, with no app-closing transition. */
  function removeTask(id) {
    ui.recent = ui.recent.filter(item => item !== id);
    delete ui.recentState?.[id]; delete ui.recentSnapshots[id];
    if (ui.view === id) ui.removedTask = id;
  }
  function renderOverlay() {
    if (ui.removedTask && ui.overlay !== 'recent') {
      const gone = ui.removedTask; ui.removedTask = null;
      if (ui.view === gone) { ui.view = 'home'; ui.sub = ''; lastScene = {view: 'home', sub: ''}; render(); return; }
    }
    if (ui.view === 'downloads' && ui.overlay.startsWith('hdl-')) { overlayRoot.innerHTML = HoloDownloads.overlay(dlContext()) || ''; return; }
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    if (ui.view === 'play-music' && ui.overlay.startsWith('pm4-')) { overlayRoot.innerHTML = ICSPlayMusic.overlay(playMusicContext()) || ''; return; }
    if (ui.view === 'gmail' && ui.overlay.startsWith('g4-')) { overlayRoot.innerHTML = ICSGmail.overlay(gmailContext()) || ''; return; }
    if (ui.overlay === 'vs3') { overlayRoot.innerHTML = ICSVoice.render(ui.vs3 || {phase: 'waiting'}, i18n.language, data.inputPrefs?.vsLanguage || 'en-US'); return; }
    const drawn = moduleOverlay();
    if (drawn) {
      overlayRoot.innerHTML = drawn.html; drawn.m.mountOverlay?.(drawn.cx, overlayRoot);
    } else if (ui.overlay === 'shade') {
      overlayRoot.innerHTML = `<div class="notification-shade"><div class="shade-top"><span class="shade-date">${shadeDate()}</span><button data-action="open-app" data-app="settings" aria-label="Settings"><img src="assets/ic_notify_quicksettings_normal.png" alt=""></button>${data.notifications.length ? '<button class="shade-clear" data-action="clear-notifications" aria-label="Clear notifications"><img src="assets/ic_notify_clear_normal.png" alt=""></button>' : ''}</div><div class="shade-divider"></div><div class="shade-body"><div class="shade-list">${ui.activeCall?`<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(c.contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>`:''}${data.notifications.map(n => `<button class="notification" data-action="notification-open" data-id="${n.id}"><span class="notification-icon"><img src="assets/${n.id === 2 ? 'stat_notify_sms.png' : n.kind === 'calendar' ? 'calendar.png' : 'settings.png'}" alt=""></span><span><strong>${safe(n.title)}</strong><small>${safe(n.detail)}</small></span></button>`).join('')}</div><div class="shade-carrier">${carrierName()}</div></div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if(ui.overlay==='lng-dialog'){
      overlayRoot.innerHTML=ICSLanguage.overlay(data,ui,i18n.locale());
    } else if(ui.overlay==='sx-dialog'){
      overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'store-host') {
      overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
    } else if (ui.overlay === 'recent') {
      overlayRoot.innerHTML = `<div class="recent-panel" data-action="close-overlay">${ui.recent.length ? `<div class="recent-list">${[...ui.recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${appNames[id]}"><span class="recent-label">${appNames[id]}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${ui.recentSnapshots[id] || `<div class="recent-fallback">${appIcon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${appIcon(id)}</span></div>`).join('')}</div>` : '<p class="recent-empty">No recent apps</p>'}</div>`;
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale(),i18n.language);
    } else if (ui.overlay.startsWith('sd-')) {
      overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'play-menu') {
      // The action bar overflow: a Holo popup anchored below the overflow button.
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${ICSPlay.menu(icsPlayContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay?.startsWith('icsp-')) {
      overlayRoot.innerHTML = ICSPlay.dialog(ui.overlay.slice(5), icsPlayContext());
    } else if (ui.overlay === 'jbx-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${(ui.view === 'messenger' ? PlusMessenger.menu(messengerContext()) : ui.view === 'movie-studio' ? MovieStudio.menu(movieContext()) : JBExtraApps.menu(ui.view, key => i18n.t(key))).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'ga-menu') {
      // The ICS Google apps' action bar overflow (their menu XML's never-shown-as-action items).
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ga-holo-menu">${ICSGoogleApps.menu(googleAppsContext()).map(item => `<button data-action="${item.action}"${item.id ? ` data-id="${safe(item.id)}"` : ''}${item.disabled ? ' disabled' : ''}${item.checked !== undefined ? ` role="menuitemcheckbox" aria-checked="${item.checked}"` : ''}><span>${safe(item.title)}</span>${item.checked !== undefined ? `<img src="assets/btn_check_${item.checked ? 'on' : 'off'}_holo_dark.png" alt="">` : ''}</button>`).join('')}</div>`;
    } else if (ui.overlay === 'mr-type') {
      // Navigation's Type destination: the address field with OK / Cancel.
      const S = key => MapsRoute.S(mrContext(), key), title = JBExtraApps.text ? JBExtraApps.text('navigation', 'Type destination') : 'Type destination';
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="mr-type" role="dialog" aria-label="${safe(title)}" data-no-translate><h3>${safe(title)}</h3><input class="settings-dialog-input" name="to" autocomplete="off" spellcheck="false" style="display:block;width:calc(100% - calc(28.2353 * var(--dp)));margin:calc(4.7059 * var(--dp)) calc(14.1177 * var(--dp)) calc(14.1177 * var(--dp));padding:calc(7.0589 * var(--dp));font:inherit"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">${safe(S('Cancel'))}</button><button type="button" data-action="mr-type-ok">${safe(S('OK'))}</button></div></form>`;
    } else if (ui.overlay === 'mr-exit') {
      const S = key => MapsRoute.S(mrContext(), key);
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(S('Exit navigation?'))}" data-no-translate><h3>${safe(S('Exit navigation?'))}</h3><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(S('Cancel'))}</button><button data-action="mr-exit-ok">${safe(S('OK'))}</button></div></div>`;
    } else if (ui.overlay === 'sa-menu') {
      // The Google apps' action bar overflow (StockApps.menu: their menu XML's overflow items).
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${StockApps.menu(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()}).map(item => `<button data-action="${item.action}"${item.id != null ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
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
    } else if (ui.overlay === 'dev-list') {
      overlayRoot.innerHTML = JBDeveloperOptions.dialog(ui.devList, data.settings, key => i18n.t(key), i18n.language);
    } else if (ui.overlay === 'icsa-dialog') {
      overlayRoot.innerHTML = ICSA11y.overlay(a11yContext());
    } else if (ui.overlay === 'a11y-hold') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(A11Y('Touch & hold delay'))}"><h3>${safe(A11Y('Touch & hold delay'))}</h3>${HOLD_NAMES.map((name, i) => `<button class="settings-row wireless-row" data-action="a11y-hold-pick" data-id="${i}" role="radio" aria-checked="${(data.settings.longPressTimeout || 0) === i}"><span class="row-copy">${safe(A11Y(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.longPressTimeout || 0) === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'lw-mapmode') {
      const current = data.lwPrefs?.maps?.mode || 'satellite';
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Map mode'))}"><h3>${safe(i18n.t('Map mode'))}</h3>${[['normal', 'Normal'], ['satellite', 'Satellite'], ['terrain', 'Terrain']].map(([id, label]) => `<button class="settings-row wireless-row" data-action="lw-mapmode-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(label, 'Maps'))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'lw-palette') {
      const current = data.lwPrefs?.polar?.palette || '';
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Color palette'))}"><h3>${safe(i18n.t('Color palette'))}</h3>${LiveWallpapers.PALETTE_ORDER.map(id => `<button class="settings-row wireless-row" data-action="lw-palette-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[id]))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
    } else if (ui.overlay === 'power-menu') {
      overlayRoot.innerHTML = GlobalActions.menu({airplane: data.settings.airplane, ringer: GlobalActions.ringerOf(data.settings), }, key => i18n.t(key));
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
    const base = clingLayerRoot().getBoundingClientRect(), centre = node => { if (!node) return null; const r = node.getBoundingClientRect(); return [r.left + r.width / 2 - base.left, r.top + r.height / 2 - base.top]; };
    // Workspace: the all apps button, centred in the hotseat. All apps: the cell at clingFocusedX/Y = (1, 1).
    if (kind === 'workspace') return {circle: centre(viewport.querySelector('.dock [data-action="drawer"]'))};
    if (kind === 'allApps') return {circle: centre(viewport.querySelectorAll('.drawer-apps > *')[5])};
    const folder = overlayRoot.querySelector('.launcher-folder')?.getBoundingClientRect();
    return folder ? {rect: {left: folder.left - base.left, top: folder.top - base.top, right: folder.right - base.left, bottom: folder.bottom - base.top}} : {};
  }
  function placeCling(root, kind) {
    const target = clingTarget(kind), point = target.circle;
    LauncherClings.cut(root, target);
    root.querySelectorAll('.cling-punch,.cling-hand').forEach(node => { node.hidden = !point; });
    if (!point) return;
    const punch = root.querySelector('.cling-punch'), hand = root.querySelector('.cling-hand');
    if (punch) { punch.style.left = `${point[0]}px`; punch.style.top = `${point[1]}px`; }
    if (hand) { hand.style.left = `${point[0] + LauncherClings.HAND_OFFSET * LauncherClings.DP()}px`; hand.style.top = `${point[1] + LauncherClings.HAND_OFFSET * LauncherClings.DP()}px`; }
  }
  function syncClings() {
    let kind = ui.power || ui.locked || ui.sleeping ? '' : LauncherClings.wanted(ui, data.clings);
    if (kind === 'folder' && ui.folderSettled !== ui.folderId) kind = '';
    const current = clingLayerRoot().querySelector('.cling:not([style*="pointer-events: none"])');
    if (current?.dataset.cling === kind) { placeCling(current, kind); return; }
    current?.remove();
    if (!kind) return;
    clingLayerRoot().insertAdjacentHTML('beforeend', LauncherClings.markup(kind, key => i18n.t(key), [0, 0]));
    const root = clingLayerRoot().lastElementChild;
    placeCling(root, kind);
    // initCling: all apps and folder clings fade in; the workspace one is there at once.
    if (kind !== 'workspace') LauncherClings.show(root);
    // Positions are read again once a launcher transition has settled.
    setTimeout(() => { if (root.isConnected) placeCling(root, kind); }, 450);
  }
  window.addEventListener('resize', () => syncClings());

  function renderFolder() {
    const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const {columns,rows}=ICSLauncherFolders.dimensions(folder.items.length);
    return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:calc(${((columns*74+24)/.85).toFixed(4)} * var(--dp));--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="Unnamed folder" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
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
  function renderWifiSettings() {
    return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + connectivityMenu('wifi'));
  }
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Galaxy Nexus')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
  }

  window.ICSCarrierName = () => carrierName();
  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    const a11y=ICSA11y.render(a11yContext());
    if(a11y)return a11y.full||appView(a11y.title,a11y.body,'sx-page icsa-page',a11y.right);
    // Music effects: MusicFX's ActivityMusic (*-musicfx.js).
    if(s==='musicfx'){const fx=MusicFX.render(musicFxContext());return appView(fx.title,fx.body,'mfx-page',fx.right);}
    const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'bluetooth') return renderBluetoothSettings();
    if (s === 'wallpaper') {
      return appView('Wallpaper', wallpaperChoices());
    }
    if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" data-nyandroid role="button" tabindex="0" aria-label="Close Nyandroid"></div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img draggable="false" src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessCheckRow('WiFi direct', '', 'wifiDirect')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    // DevelopmentSettings of the IMM76I image (ics-devopts.js, generated by docs/tools/devopts.py maguro).
    const devPage = JBDeveloperOptions.page(s, key => i18n.t(key), i18n.language);
    if (devPage) return appView(devPage.title, devPage.body, 'dev-page');
    if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value), i18n.language));
    // Language & input and its pages (ics-language.js, from language_settings.xml and the IME / TTS / Voice Search preferences).
    const language=ICSLanguage.render(data,ui,i18n.locale());
    if(language)return appView(language.title,language.body,'lng-page',language.right||'');
    return appView('Settings', `${label('WIRELESS & NETWORKS')}${connectivityRow('Wi-Fi', 'wifi')}${connectivityRow('Bluetooth', 'bluetooth')}${row('Data usage', '', 'settings-sub', 'data', '◕')}${row('More...', '', 'settings-sub', 'wireless', null)}${label('DEVICE')}${row('Sound', '', 'settings-sub', 'sound', '♫')}${row('Display', '', 'settings-sub', 'display', '☼')}${row('Storage', '', 'settings-sub', 'storage', '▤')}${row('Battery', '', 'settings-sub', 'battery', '◧')}${row('Apps', '', 'settings-sub', 'apps', '▦')}${label('PERSONAL')}${row('Accounts & sync', '', 'settings-sub', 'sync', '↻')}${row('Location services', '', 'settings-sub', 'location', '◎')}${row('Security', '', 'settings-sub', 'security', '◉')}${row('Language & input', '', 'settings-sub', 'language', '◎')}${row('Backup & reset', '', 'settings-sub', 'backup', '↻')}${label('SYSTEM')}${row('Date & time', '', 'settings-sub', 'date', '◷')}${row('Accessibility', '', 'settings-sub', 'accessibility', '◉')}${row('Developer options', '', 'settings-sub', 'development', '⚙')}${row('About phone', '', 'settings-sub', 'about', '◉')}`);
  }

  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }

  /* Google Play Store 3.4.7: ui.market holds the page, section, tab and selection, ui.marketHistory the back stack; downloads
     run on a timer with a notification while they last and "Successfully installed." afterwards. */
  function icsPlayContext() {
    const m = ui.market || {page: 'home'};
    return {lang: i18n.language, locale: i18n.locale(), ...m, installed: data.marketInstalled || [], everInstalled: data.marketEverInstalled || [], downloading: ui.marketDownload?.id || '', phase: ui.marketDownload?.phase || '', progress: ui.marketDownload?.progress || 0, plussed: data.marketPlus || [], autoUpdate: data.marketAuto || [], prefs: {notify: true, autoUpdate: false, wifiOnly: false, widgets: true, pin: false, admob: true, ...(data.marketPrefs || {})}, unlocked: !!ui.icspUnlocked, pinStep: ui.icspPinStep, pinWrong: !!ui.icspPinWrong, filterDraft: ui.icspFilterDraft, searching: !!ui.marketSearching, editValue: ui.marketEdit || '', history: data.marketSearches || [], reviewSort: ui.reviewSort || 'helpful', reviewLatest: !!ui.reviewLatest, reviewDevice: !!ui.reviewDevice};
  }
  function icsPlayGo(next) { (ui.marketHistory ||= []).push({...(ui.market || {page: 'home'}), scroll: viewport.querySelector('.icsp-scroll')?.scrollTop || 0}); ui.market = {...(ui.market || {}), ...next}; ui.overlay = ''; ui.marketSearching = false; render(); }
  function icsPlayDownload(id) {
    const item = ICSPlay.find(id); if (!item) return;
    clearInterval(ui.marketTimer); ui.marketDownload = {id, phase: 'downloading', progress: 0};
    data.notifications = data.notifications.filter(n => n.kind !== 'market-dl');
    data.notifications.unshift({id: Date.now(), title: item.name, detail: ICSPlay.text(i18n.language, 'Downloading…'), kind: 'market-dl'});
    save(); render(); renderStatus();
    ui.marketTimer = setInterval(() => {
      const d = ui.marketDownload; if (!d) { clearInterval(ui.marketTimer); return; }
      if (d.phase === 'downloading') { d.progress = Math.min(1, d.progress + .12); if (d.progress >= 1) d.phase = 'installing'; }
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; storeInstalled(id); data.marketEverInstalled = [...new Set([...(data.marketEverInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: ICSPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store') { const bar = viewport.querySelector('.icsp-progress b'); if (bar && ui.marketDownload?.phase === 'downloading') bar.style.width = `${Math.round(ui.marketDownload.progress * 100)}%`; else render(); }
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  function renderGallery() { return ICSMedia.gallery(data,ui,key=>i18n.t(key),i18n.language); }
  function renderCamera() { return ICSMedia.camera(data,ui,key=>i18n.t(key)); }
  function galleryStep(direction) {
    const items=ICSMedia.photos(data,ui.galleryAlbum); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }


  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(window.StoreHost?.has(id)){StoreHost.module(id).clearData?.(storeContext());save();}
    if(id==='gallery'){data.photos=clone(defaultData.photos);}
    if(id==='camera')delete data.cameraSettings;
    if(id==='play-store')delete data.playRatings;
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }

  /* The context every module hook gets (ics-core.js, docs/plans/engine-migration.md): the saved and the on-screen
     state, the shell's drawing and navigation, and the helpers the screens share. */
  const c = {
    get data() { return data; }, defaults: defaultData, emailSeed: emailData, ui, save, render, renderOverlay, renderStatus, toast, openApp, home, back, navigateBack, captureRecentView,
    screen, viewport, overlayRoot, statusRoot, navRoot, get pointer() { return pointerStart; },
    notify: (title, text) => addNotification(title, text), get lang() { return i18n.language; }, get locale() { return i18n.locale(); }, t: key => i18n.t(key), i18n, safe, clone,
    dp, snapResting, holdDelay, deviceDate, today, clock, contact, tracks, syncBrowserState, placeShortcut, gmailContext,
    suppressClick: ms => { suppressClickUntil = Date.now() + ms; }, suppressReleaseClick
  };
  // This version's modules (the store apps aside): the open screen's first, then the others in the order they registered.
  function modules() { const ids = StoreHost.ids().filter(id => !id.startsWith('store-')); return [...ids.filter(id => id === ui.view), ...ids.filter(id => id !== ui.view)].map(id => StoreHost.module(id)); }
  // A hook offered to the modules until one takes it (returns true), or run on every module.
  function ask(hook, ...args) { const cx = storeContext(); return modules().some(m => m[hook]?.(...args, cx)); }
  function each(hook, ...args) { const cx = storeContext(); for (const m of modules()) m[hook]?.(...args, cx); }
  // The overlay a module draws (its markup, '' for nothing), or null when it is none of theirs.
  function moduleOverlay() { const cx = storeContext(); for (const m of modules()) { const html = m.overlay?.(cx); if (html != null) return {html, m, cx}; } return null; }
  // Every second, in the order the modules registered (the old tick's order).
  function everySecond(now) { const cx = storeContext(); for (const id of StoreHost.ids()) if (!id.startsWith('store-')) StoreHost.module(id).second?.(cx, now); }
  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    // Before the lock check: the modules' early controls (Messaging › Settings).
    if (ask('early', action, button)) return;
    if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return;
    // Navigation's Contacts / Starred places pickers and Places' search and categories (ics-extra-apps.js).
    if (action.startsWith('xa-') && JBExtraApps.handle(action, id, extraContext())) return;
    if (action === 'mr-type-dest') { ui.overlay = 'mr-type'; renderOverlay(); overlayRoot.querySelector('input')?.focus(); return; }
    if (action === 'mr-type-ok') { const to = overlayRoot.querySelector('input')?.value.trim(); ui.overlay = ''; renderOverlay(); if (to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); } return; }
    if (action === 'mr-exit-ok') { ui.overlay = ''; renderOverlay(); MapsRoute.stopNav(mrContext()); render(); return; }
    if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
    // The modules' own controls (the open screen's module first).
    if (ask('action', action, button)) return;
    if (ui.view === 'downloads' && action.startsWith('hdl-') && HoloDownloads.handle(action, id, dlContext())) return;
    if (ui.view === 'gmail' && action.startsWith('g4-') && ICSGmail.handle(action, id, gmailContext())) return;
    if (ui.view === 'gmail' && action.startsWith('g4p-') && ICSGmailPrefs.handle(action, id, gmailContext())) return;
    // Maps, Earth, News & Weather and the simple extras.
    if (['maps', 'latitude', 'earth', 'news-weather', 'messenger', 'navigation', 'local', 'movie-studio'].includes(ui.view)) {
      if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return; }
      if (ui.view === 'messenger' && action.startsWith('gpm-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusMessenger.handle(action, id, messengerContext())) return; }
      if (ui.view === 'movie-studio' && action.startsWith('mst-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (MovieStudio.handle(action, id, movieContext())) return; }
      if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return;
      if (action === 'jbx-menu') { ui.overlay = 'jbx-menu'; renderOverlay(); return; }
      if (action === 'sa-unsupported' || action === 'kkx-unavailable') { ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); return; }
      if (action === 'maps-switcher' || action === 'maps-layers') { ui.mapsMenu = action === 'maps-switcher' ? 'switcher' : 'layers'; ui.overlay = 'sa-menu'; renderOverlay(); return; }
      if (action === 'maps-places') { openApp('local'); return; }
      if (action === 'maps-feature') { ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); if (id === 'local' || id === 'navigation' || id === 'latitude' && ui.view !== 'latitude') openApp(id); else if (id === 'map' && ui.view === 'latitude') openApp('maps'); else if (id !== 'latitude') { data.mapsLayer = id === 'traffic' ? 'traffic' : ''; save(); render(); } return; }
      // Latitude's arrows: me, then each friend, round again (StockApps.LAT_FRIENDS).
      if (action === 'maps-lat-step') { const n = StockApps.LAT_FRIENDS.length + 1; ui.latIndex = ((ui.latIndex ?? (Number(id) > 0 ? -1 : 0)) + Number(id) + n) % n; render(); return; }
      if (action === 'maps-layer') { ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); data.mapsLayer = data.mapsLayer === id ? '' : id; save(); render(); return; }
      if (action === 'maps-clear') { ui.overlay = ''; renderOverlay(); ui.mapsQuery = ''; ui.mapsSearching = false; data.mapsLayer = ''; save(); render(); return; }
      if (action === 'maps-zoom') { const map = viewport.querySelector('.sa-maps6-map .sa-map'); if (map) { ui.mapsZoom = Math.max(1, Math.min(3, (ui.mapsZoom || 1) * (Number(id) > 0 ? 1.4 : 1 / 1.4))); map.style.transform = `scale(${ui.mapsZoom})`; } return; }
      if (action === 'maps-locate') { ui.mapsQuery = ''; ui.mapsSearching = false; render(); return; }
      if (action === 'maps-search-open') { ui.mapsSearching = true; render(); viewport.querySelector('.sa-maps6-search input')?.focus(); return; }
      if (action === 'news-tab') { ui.newsTab = id; render(); return; }
      if (action === 'sa-menu') { ui.mapsMenu = ''; ui.overlay = 'sa-menu'; renderOverlay(); return; }
      // News & Weather: Refresh records the time the refresh status shows; Settings, the story page and Share story.
      if (action === 'sa-news-refresh') { ui.overlay = ''; renderOverlay(); NewsPrefs.refresh(data, deviceDate().getTime()); save(); render(); toast(AndroidStrings.pick(window.StockStrings?.news?.['Updating news topics…'], i18n.language, 'Updating news topics…')); return; }
      if (action === 'news-settings') { ui.overlay = ''; renderOverlay(); ui.newsSub = 'settings'; ui.nwpScreen = 'root'; ui.nwpDialog = ''; render(); return; }
      if (action === 'news-story') { ui.newsSub = 'story'; ui.newsStory = id; render(); return; }
      if (action === 'news-share') { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector('.nwp-story h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; c.messageDraft().body = title; save(); render(); return; }
      if (action.startsWith('nwp-')) { NewsPrefs.handle(action, id, {ui, data, lang: i18n.language, save, render, input: () => viewport.querySelector('[data-nwp-input]')?.value, unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))}); return; }
    }
    if (ui.view === 'google-plus' && action.startsWith('gpp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusPost.handle(action, id, plusContext())) return; }
    if (ICSGoogleApps.APPS.includes(ui.view) && action.startsWith('ga-') && ICSGoogleApps.handle(action, id, googleAppsContext())) return;
    if (action.startsWith('lng-') && ICSLanguage.handle(action, id, {data, ui, save, render, renderOverlay, toast: text => toast(i18n.t(text))})) return;
    if (ui.view === 'play-music' && action.startsWith('pm4-') && ICSPlayMusic.handle(action, id, playMusicContext(), button)) return;
    // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
    if ((action.startsWith('sth-') || isStoreApp(ui.view)) && StoreHost.action(action, button, storeContext())) return;
    if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return;
    if (action.startsWith('mfx-') && MusicFX.handle(action, id, musicFxContext())) return;
    if (action.startsWith('icsa-') && ICSA11y.handle(action, id, a11yContext())) return;
    switch (action) {
      case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
      case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
      case 'ga-ringer': GlobalActions.setRinger(data.settings, id); save(); renderStatus(); renderOverlay(); setTimeout(() => { if (ui.overlay === 'power-menu') { ui.overlay = ''; render(); } }, GlobalActions.DISMISS_DELAY); break;
      case 'ga-confirm': powerConfirm(); break;
      case 'drawer': if (data.clings && !data.clings.workspace) { data.clings.workspace = true; save(); } ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`)); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': { const active = musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; c.saveMusic(); render(); break;
      case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
      case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
      case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
      case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
      case 'widget-photo-cancel': cancelPhotoWidget(); break;
      case 'open-wallpapers': ui.overlay = ''; ui.view = 'wallpaper-picker'; render(); break;
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
      case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
      case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
      case 'lw-palette': ui.overlay = 'lw-palette'; renderOverlay(); break;
      case 'lw-mapmode': ui.overlay = 'lw-mapmode'; renderOverlay(); break;
      case 'lw-mapmode-pick': data.lwPrefs ||= {}; data.lwPrefs.maps ||= {}; data.lwPrefs.maps.mode = id; save(); ui.overlay = ''; render(); break;
      case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
      case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
      case 'market': openApp('play-store'); break;
      case 'play-menu': case 'icsp-menu': ui.overlay = 'play-menu'; renderOverlay(); break;
      case 'icsp-section': icsPlayGo({page: 'section', section: id, tab: 'FEATURED'}); break;
      case 'icsp-tab': if (id) { ui.market.tab = id; render(); } break;
      case 'icsp-detail': icsPlayGo({page: 'detail', selected: id}); break;
      case 'widget-play-item': openApp('play-store'); icsPlayGo({page: 'detail', selected: id}); break;
      case 'icsp-buy': { const item = ICSPlay.find(id); if (item && item.price !== 'FREE') { toast(ICSPlay.text(i18n.language, 'Unavailable')); break; } icsPlayGo({page: 'permissions', selected: id}); break; }
      case 'icsp-accept': ui.market = ui.marketHistory.pop() || {page: 'detail', selected: id}; icsPlayDownload(id); break;
      case 'icsp-cancel': clearInterval(ui.marketTimer); ui.marketDownload = null; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); save(); renderStatus(); render(); break;
      case 'icsp-open': { const item = ICSPlay.find(id); if (item?.app) openApp(item.app); else if (StoreHost.runtime(id)) { storeAppsSync(); openApp(StoreHost.runtime(id)); } else toast(ICSPlay.text(i18n.language, 'Unavailable')); break; }
      case 'icsp-uninstall': ui.overlay = ''; renderOverlay(); storeUninstall(id); save(); render(); break;
      case 'icsp-uninstall-ask': ui.overlay = 'icsp-uninstall'; renderOverlay(); break;
      case 'icsp-plus': { const list = data.marketPlus || []; data.marketPlus = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; save(); const top = viewport.querySelector('.icsp-scroll')?.scrollTop || 0; render(); const list2 = viewport.querySelector('.icsp-scroll'); if (list2) list2.scrollTop = top; break; }
      case 'icsp-my-apps': icsPlayGo({page: 'my-apps', tab: 'INSTALLED'}); break;
      case 'icsp-settings': icsPlayGo({page: 'settings'}); break;
      case 'icsp-unavailable': ui.overlay = ''; renderOverlay(); toast(ICSPlay.text(i18n.language, 'Unavailable')); break;
      case 'icsp-pref': { const base = icsPlayContext().prefs; data.marketPrefs = {...base, [id]: !base[id]}; save(); const top = viewport.querySelector('.icsp-scroll')?.scrollTop || 0; render(); const list = viewport.querySelector('.icsp-scroll'); if (list) list.scrollTop = top; break; }
      // Content filtering and the PIN (ics-play.js's PinEntryDialog): a new PIN is typed twice; with a PIN the user
      // controls stay locked until Unlock settings, and editing it can remove it.
      case 'icsp-filter': ui.icspFilterDraft = undefined; ui.overlay = 'icsp-filter'; renderOverlay(); break;
      case 'icsp-filter-pick': { const levels = ICSPlay.LEVELS, cur = ui.icspFilterDraft || icsPlayContext().prefs.filter || levels; let next = cur.includes(id) ? cur.filter(x => x !== id && (id === 'Show all apps' || x !== 'Show all apps')) : [...cur, id]; if (id === 'Show all apps') next = cur.includes(id) ? [] : [...levels]; else if (levels.slice(0, 4).every(l => next.includes(l))) next = [...levels]; ui.icspFilterDraft = next; renderOverlay(); break; }
      case 'icsp-filter-ok': data.marketPrefs = {...icsPlayContext().prefs, filter: ui.icspFilterDraft || icsPlayContext().prefs.filter || ICSPlay.LEVELS}; save(); ui.overlay = ''; renderOverlay(); render(); break;
      case 'icsp-unlock': case 'icsp-pin': ui.icspPinNext = action; ui.icspPinStep = action === 'icsp-unlock' ? 'settings' : data.marketPrefs?.pinCode ? 'edit' : 'create'; ui.icspPinWrong = false; ui.overlay = 'icsp-pin'; renderOverlay(); overlayRoot.querySelector('[data-icsp-pin]')?.focus(); break;
      case 'icsp-pin-remove': { const p = {...icsPlayContext().prefs}; delete p.pinCode; p.pin = false; data.marketPrefs = p; save(); ui.overlay = ''; renderOverlay(); render(); break; }
      case 'icsp-pin-ok': {
        const value = String(overlayRoot.querySelector('[data-icsp-pin]')?.value || '').trim(), prefs = icsPlayContext().prefs, step = ui.icspPinStep;
        const again = wrong => { ui.icspPinWrong = wrong; renderOverlay(); overlayRoot.querySelector('[data-icsp-pin]')?.focus(); };
        if (!/^\d+$/.test(value)) { again(!!value); break; }
        if (step === 'settings') { if (value !== prefs.pinCode) { again(true); break; } ui.icspUnlocked = true; ui.overlay = ''; renderOverlay(); render(); break; }
        if (step === 'create' || step === 'edit') { ui.icspPinNew = value; ui.icspPinStep = 'confirm'; again(false); break; }
        if (value !== ui.icspPinNew) { ui.icspPinStep = data.marketPrefs?.pinCode ? 'edit' : 'create'; again(true); break; }
        data.marketPrefs = {...prefs, pinCode: value}; ui.icspUnlocked = false; save(); ui.overlay = ''; renderOverlay(); render(); break;
      }
      case 'icsp-clear-history': data.marketSearches = []; save(); break;
      case 'icsp-search': ui.marketSearching = true; ui.marketEdit = ''; render(); viewport.querySelector('.icsp-bar input')?.focus(); break;
      case 'icsp-search-run': data.marketSearches = [id, ...(data.marketSearches || []).filter(q => q !== id)].slice(0, 10); save(); icsPlayGo({page: 'search', query: id}); break;
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
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;c.saveMusic();render();break;
      case 'voice-search': vs3Start(); break;
      case 'vs3-again': vs3Start(); break;
      case 'vs3-cancel': vs3Stop(); ui.overlay = ''; renderOverlay(); break;
      case 'vs3-help': vs3Stop(); ui.vs3 = {phase: 'help'}; renderOverlay(); break;
      case 'vs3-settings': vs3Stop(); ui.overlay = ''; renderOverlay(); openApp('settings'); ui.sub = 'lng-vs'; render(); break;
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; c.saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': ui.overlay = ''; screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`; renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break;
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
        ui.overlay = ''; if (Number(id) === 2) c.openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
      case 'unlock': ui.view = 'home'; render(); break;
      case 'unlock-camera': openApp('camera'); break;
      case 'settings-sub': ui.overlay = ''; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
      case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
      case 'dev-info': toast(i18n.t('This feature is not part of the simulator.')); break;
      // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
      case 'dev-list': ui.devList = id; ui.overlay = 'dev-list'; renderOverlay(); break;
      case 'dev-list-pick': { const cut = id.lastIndexOf(':'); data.settings[id.slice(0, cut)] = Number(id.slice(cut + 1)); save(); ui.overlay = ''; renderOverlay(); render(); break; }
      case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
      case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
      // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
      case 'sd-uninstall': { const r = ui.settingsApp, m = StoreHost.module(r); if (!m) break; storeContext().dialog({title: m.title, message: ICSPlay.text(i18n.language, 'Do you want to uninstall this app?'), buttons: [{label: i18n.t('Cancel')}, {label: i18n.t('OK'), action: () => { storeUninstall(r.slice(6)); save(); ui.sub = 'apps'; render(); }}]}); break; }
      case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
      case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id);else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
      case 'sd-battery-history': ui.sub='battery-history';render();break;
      case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
      case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
      case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
      case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
      case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;c.saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
      case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
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
      case 'sx-sync-toggle': { if (data.settings.autoSync === false) break; const off = data.settings.syncOff ||= {}; off[id] = !off[id]; save(); render(); break; }
      case 'toggle-setting': {
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
      case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'factory-reset': if (confirm(i18n.t('Reset all local ICS simulator data?'))) resetSimulator(); break;
      case 'about-tap':
        ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
        if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTapTimes = []; render(); }
        break;
      case 'egg-nyan': toast('Android 4.0: Ice Cream Sandwich'); break;
      case 'a11y-hold': ui.overlay = 'a11y-hold'; renderOverlay(); break;
      case 'a11y-hold-pick': data.settings.longPressTimeout = Number(id); ui.overlay = ''; save(); renderOverlay(); render(); break;
      case 'toast': toast(id); break;
      case 'noop': break;
      case 'gallery-camera': openApp('camera'); break;
      case 'gallery-album': ui.galleryAlbum=id; ui.sub='album';ui.gallerySlideshow=false;render();break;
      // GET_CONTENT hands the picture back to whichever app asked: Email or Gmail.
      case 'gallery-pick': { const photo = data.photos.find(p => p.id === Number(id)), caller = ui.galleryPick; ui.galleryPick = ''; ui.sub = ''; openApp(caller, true); if (caller === 'gmail') ICSGmail.attach(gmailContext(), photo); else ICSEmail.attach(c.emailContext(), photo); render(); break; }
      case 'gallery-pick-cancel': { const caller = ui.galleryPick || 'email'; ui.galleryPick = ''; ui.sub = ''; openApp(caller, true); break; }
      case 'photo': ui.selectedPhoto=Number(id);ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});ui.sub='photo';ui.galleryZoom=false;render();break;
      case 'gallery-step': galleryStep(Number(id));break;
      case 'gallery-photo-zoom': ui.galleryZoom=!ui.galleryZoom;render();break;
      case 'gallery-menu': case 'gallery-share': case 'gallery-details': ui.overlay=action;renderOverlay();break;
      // PhotoPage's Crop starts CropImage; Crop saves <name>-<n>.jpg beside the picture with its title and date
      // (saveLocalImage), and REQUEST_CROP's result shows the new picture. Cancel, Up and Back leave it unsaved.
      case 'gallery-crop': {const photo=data.photos.find(p=>p.id===Number(id));ui.overlay='';if(photo&&!photo.video){ui.selectedPhoto=photo.id;ui.galleryZoom=false;ui.gallerySlideshow=false;ui.galleryCrop=ICSMedia.cropDefault();}render();break;}
      case 'gallery-crop-cancel': ui.galleryCrop=null;render();break;
      case 'gallery-crop-save': {
        const photo=data.photos.find(p=>p.id===ui.selectedPhoto),c=ui.galleryCrop;
        if(!photo||!c){ui.galleryCrop=null;render();break;}
        ui.overlay='gallery-crop-saving';renderOverlay();
        setTimeout(()=>{
          const copy={...clone(photo),id:Date.now(),album:ICSMedia.album(photo),source:clone(photo),crop:{x:c.x,y:c.y,w:c.w,h:c.h},rotation:0,zoom:1};
          data.photos.splice(Math.max(0,data.photos.indexOf(photo)),0,copy);save();
          ui.selectedPhoto=copy.id;ui.galleryCrop=null;if(ui.overlay==='gallery-crop-saving')ui.overlay='';render();renderOverlay();
        },600);
        break;
      }
      case 'gallery-rotate': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(photo)photo.rotation=((photo.rotation||0)+Number(id)+360)%360;save();ui.overlay='';render();break;}
      case 'gallery-slideshow': {const items=ICSMedia.photos(data,ui.galleryAlbum);if(!items.length)break;if(ui.sub!=='photo')ui.selectedPhoto=items[0].id;ui.sub='photo';ui.overlay='';ui.gallerySlideshow=true;ui.gallerySlideAt=Date.now();render();break;}
      case 'gallery-stop': ui.gallerySlideshow=false;render();break;
      case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('messaging');ui.sub='new';c.messageDraft().attachment=clone(photo);save();render();break;}
      case 'photo-delete': ui.selectedPhoto=Number(id);ui.overlay='gallery-delete';renderOverlay();break;
      case 'gallery-confirm-delete': {
        const items=ICSMedia.photos(data,ui.galleryAlbum);const index=items.findIndex(p=>p.id===ui.selectedPhoto);
        data.photos=data.photos.filter(p=>p.id!==ui.selectedPhoto);save();ui.overlay='';
        const remaining=ICSMedia.photos(data,ui.galleryAlbum);if(remaining.length)ui.selectedPhoto=remaining[Math.min(index,remaining.length-1)].id;else ui.sub='album';
        render();toast('Photo deleted');break;
      }
      case 'photo-wallpaper': {const photo=data.photos.find(p=>p.id===Number(id));if(!photo)break;data.wallpaper=11;delete data.liveWallpaper;data.customWallpaper=photo.colors;data.customWallpaperPhoto=clone(photo);save();ui.overlay='';render();toast('Wallpaper set');break;}
      case 'shoot': {
        // Video: the shutter starts and stops recording; Panorama: it starts and stops the sweep.
        if (ui.cameraMode === 'video') { if (ui.cameraRec) cameraStop(); else ui.cameraRec = {start: Date.now()}; render(); break; }
        if (ui.cameraMode === 'panorama') { panoCtl?.toggle(); break; }
        const photo={...ICSMedia.scene(data),id:Date.now(),name:`IMG_${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`,album:'camera',created:Date.now()};
        data.photos.unshift(photo);save();render();screen.animate([{opacity:1},{opacity:.4},{opacity:1}],{duration:240});toast('Photo saved to Gallery');break;
      }
      case 'camera-review': {const photo=ICSMedia.photos(data,'camera')[0];openApp('gallery');if(photo){ui.galleryAlbum='camera';ui.selectedPhoto=photo.id;ui.sub='photo';render();}break;}
      case 'camera-focus': {const preview=viewport.querySelector('.camera-focus-area');preview.classList.remove('focusing');void preview.offsetWidth;preview.classList.add('focusing');break;}
      case 'camera-flip': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.front=!data.cameraSettings.front;save();render();break;
      case 'camera-level': ui.cameraLevel2=!ui.cameraLevel2;render();break;
      case 'camera-modes': ui.cameraModes=!ui.cameraModes;render();break;
      case 'camera-mode': ui.cameraModes=false;ui.cameraLevel2=false;if(['camera','video','panorama'].includes(id)&&!ui.cameraRec){ui.cameraMode=id;ui.icsPano=null;}render();break;
      case 'gallery-movie': ui.sub='movie';ui.galleryMovie=null;render();break;
      case 'camera-setting': ui.cameraSetting=id;ui.overlay='camera-setting';renderOverlay();break;
      case 'camera-pick': {data.cameraSettings=ICSMedia.settings(data);const key=ui.cameraSetting;data.cameraSettings[key]=key==='exposure'?Number(id):id;save();ui.overlay='';renderOverlay();render();break;}
      case 'camera-knob': {data.cameraSettings=ICSMedia.settings(data);const [key,step]=id.split(':'),values=ICSMedia.PREF[key].values,i=values.indexOf(data.cameraSettings[key]);data.cameraSettings[key]=values[Math.max(0,Math.min(values.length-1,i+Number(step)))];save();renderOverlay();break;}
      case 'camera-location': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.location=!data.cameraSettings.location;save();renderOverlay();break;
      // NewsActivity (Theme.NoTitleBar, targetSdkVersion 11) has no action bar, so PhoneWindow asks for the menu key.
      case 'legacy-menu': if(ui.view==='news-weather'){ui.overlay='sa-menu';renderOverlay();}break;
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (ask('submit', form, values)) return;
    if (PlusMessenger.submit(form.dataset.form, values, messengerContext())) return;
    if (JBExtraApps.submit(form.dataset.form, values, extraContext())) return;
    if (form.dataset.form === 'pm4-search') { viewport.querySelector('[data-pm4-query]')?.blur(); return; }
    if (form.dataset.form === 'mr-type') { overlayRoot.querySelector('[data-action="mr-type-ok"]')?.click(); return; }
    if (form.dataset.form === 'mr-go') { MapsRoute.submit(values, mrContext()); return; }
    if (ui.view === 'gmail' && ICSGmail.submit(form.dataset.form, values, gmailContext())) return;
    if (ICSGoogleApps.APPS.includes(ui.view) && ICSGoogleApps.submit(form.dataset.form, values, googleAppsContext())) return;
    if (form.dataset.form === 'maps-search') { ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(data, ui.mapsQuery); save(); render(); return; }
    if (form.dataset.form === 'earth-search') { ui.earthSearching = false; EarthApp.search(new FormData(form).get('query'), earthContext()); render(); return; }
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    if(ICSLanguage.submit(form.dataset.form,values,{data,ui,save,render,renderOverlay}))return;
    if(form.dataset.form==='sx-save'){ui.systemError=ICSSystemSettings.submit(data,ui,values);if(ui.systemError){ui.systemValues=Object.fromEntries(values);renderOverlay();return;}save();ui.overlay='';render();return;}
    if(form.dataset.form==='sx-vpn-connect'){ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();return;}
    if(form.dataset.form==='sx-profile-delete'){ICSSystemSettings.removeProfile(data,ui);save();ui.overlay='';render();return;}
    if (form.dataset.form === 'icsp-search') { const q = String(values.get('query') || '').trim(); if (!q) return; data.marketSearches = [q, ...(data.marketSearches || []).filter(x => x !== q)].slice(0, 10); save(); icsPlayGo({page: 'search', query: q}); return; }
    if (form.dataset.form === 'play-search') { ui.play.query = String(values.get('query') || '').trim(); render(); return; }
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
      case 'sd-brightness': data.settings.brightness=Number(values.get('brightness'));data.settings.autoBrightness=values.get('autoBrightness')!==null;save();ui.overlay='';render();break;
      case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){data.settings.fontSize=choice;data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  document.addEventListener('input', event => {
    if (ask('input', event)) return;
    if (PlusPost.input(event.target)) return;
    if (PlusMessenger.input(event.target, messengerContext())) return;
    if (event.target.matches('[data-mfx]') && MusicFX.input(event.target, musicFxContext())) return;
    // Play Music's search: the sections follow the query; the field keeps its focus and caret.
    if (event.target.matches('[data-pm4-query]')) { ui.pm4Query = event.target.value; const at = event.target.selectionStart; render(); const field = viewport.querySelector('[data-pm4-query]'); if (field) { field.focus(); field.setSelectionRange(at, at); } return; }
    // Talk's SearchView and Add friend field: the suggestions follow the query without re-rendering the field.
    if (event.target.closest('.ga-tk-sv')) { ui.gaTalkQ = event.target.value; const box = viewport.querySelector('.ga-tk-extras'), tmp = document.createElement('div'); tmp.innerHTML = ICSGoogleApps.render(ui.view, googleAppsContext()); if (box) box.innerHTML = tmp.querySelector('.ga-tk-extras')?.innerHTML || ''; return; }
    if (event.target.matches('.ga-tk-add-field')) { ui.gaInvite = event.target.value; return; }
    if (event.target.matches('[data-ga-bk-bright]')) { data.gaBookPrefs = {...ICSGoogleApps.books.bookPrefs(data), brightness: Number(event.target.value)}; save(); viewport.querySelector('.ga-bk-reader')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return; }
    // SearchView: the suggestion dropdown follows the query without re-rendering the field.
    if (event.target.closest('.icsp-bar.searching')) { ui.marketEdit = event.target.value; const view = viewport.querySelector('.icsp'); view?.querySelector('.icsp-suggest')?.remove(); const html = ICSPlay.render(icsPlayContext()); const tmp = document.createElement('div'); tmp.innerHTML = html; const sug = tmp.querySelector('.icsp-suggest'); if (sug && view) view.append(sug); return; }
    if (event.target.matches('[data-icsp-auto]')) { const id = event.target.dataset.icspAuto, list = data.marketAuto || []; data.marketAuto = event.target.checked ? [...new Set([...list, id])] : list.filter(x => x !== id); save(); return; }
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
    if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return;}
    if(event.target.matches('.camera-zoom input')) {
      data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.zoom=Number(event.target.value);save();
      viewport.querySelector('.camera-focus-area .media-photo').src=ICSMedia.image(ICSMedia.scene(data));
      return;
    }
    if (event.target.classList.contains('sd-brightness-bar')) { screen.style.filter = `brightness(${.5 + Number(event.target.value) / 135})`; return; }
    if (event.target.dataset.field === 'brightness') {
      data.settings.brightness = Number(event.target.value); save();
      const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
      screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    }
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
        if(!covered)result=dropAt({type:'home',page:ui.page,slot});
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
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
    viewport.querySelectorAll('.page-indicators button').forEach((button,index) => button.classList.toggle('active', index === ui.page));
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  /* WallpaperService visibility: the engine draws only while its window shows (home and keyguard, or the picker's
     preview), and the launcher feeds it the workspace scroll as an x offset across the five pages. */
  function syncLiveWallpaper() {
    const preview = ui.view === 'live-wallpapers' && String(ui.sub || '').startsWith('preview:');
    const id = preview ? ui.sub.slice(8) : data.liveWallpaper?.id || '';
    // DeskClock's face is Theme.Holo.Wallpaper.NoTitleBar: the (live) wallpaper shows behind it too.
    const visible = !!id && (preview || (ui.view === 'settings' && ui.sub === 'easter' && !ui.easterNyan) || ['home', 'lock'].includes(ui.view) || ui.view === 'clock' && !ui.sub) && !ui.sleeping && !ui.power;
    const key = id ? `${id}:${preview}` : '';
    if (liveWallpaper && liveWallpaper.key !== key) { liveWallpaper.destroy(); liveWallpaper = null; }
    if (key && !liveWallpaper) {
      liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : ui.page / 4, audio: () => !!ui.music?.playing});
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
    setHomePage(Math.abs(dx) > dp(53) ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const pageCount = ui.drawerTab === 'apps' ? Math.ceil(apps.length / 20) : Math.ceil(widgetTypes.length / 4);
    const nextPage = Math.max(0,Math.min(pageCount - 1,ui.drawerPage + (dx < 0 ? 1 : -1)));
    suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > dp(53) && nextPage !== ui.drawerPage) {
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
  let homeLongPressTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    each('contextmenu', event);
    if (!dragState && ui.view === 'home' && !ui.overlay && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overlay = 'wallpaper-source'; renderOverlay(); }
  });
  // Older WebKit versions may still start page rubber-banding during a custom
  // gesture. Cancel only gestures owned by the simulator; lists scroll natively.
  screen.addEventListener('touchmove', event => {
    if (event.touches.length !== 1 || !pointerStart || event.target.closest('input, textarea, select')) return;
    if (pointerStart.source || pointerStart.target.closest(['#status-bar, #nav-bar, .home-view, .drawer-view, .lock-view, .shade-top, .shade-handle, .easter-robot', ...modules().map(m => m.touch).filter(Boolean)].join(', '))) {
      if (event.cancelable) event.preventDefault();
    }
  }, { passive: false });
  // A long press opens a dialog under the finger; the release must not activate it (Android ignores it too).
  function suppressReleaseClick() {
    suppressClickUntil = Infinity;
    window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
    window.addEventListener('pointercancel', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
  }
  // CropImage's CropView owns its drags: they never reach the screen's swipe and long-press handling.
  screen.addEventListener('pointerdown', event => {
    if (ui.view !== 'gallery' || !ui.galleryCrop || ui.overlay || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const frame = event.target.closest('.gallery-crop')?.querySelector('[data-crop-frame]');
    if (!frame || event.target.closest('button')) return;
    if (ICSMedia.cropDrag(event, frame, ui.galleryCrop, () => {})) { event.stopPropagation(); event.preventDefault(); }
  }, true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.icsp-scroll,.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    // PlatLogoActivity: the logo jumps to 1.25x, 2x, 3.25x and 5x (no tweening), then Nyandroid starts.
    if (event.target.closest('.easter-robot')) {
      const robot = event.target.closest('.easter-robot'); let count = 0;
      const zoom = () => { count++; if (data.settings.haptic !== false) navigator.vibrate?.(50 * count); robot.style.transform = `scale(${ICSNyandroid.zoomScale(count)})`; if (count <= 3) eggTimer = setTimeout(zoom, ICSNyandroid.LONG_PRESS); else requestAnimationFrame(() => { suppressReleaseClick(); ui.easterNyan = true; render(); }); };
      eggTimer = setTimeout(zoom, 2 * ICSNyandroid.LONG_PRESS);
    }
    each('pointerdown', event, pointerStart);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), holdDelay(440));
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > dp(9)) clearTimeout(homeLongPressTimer);
    if (ask('pointermove', event, pointerStart, dx, dy)) return;
    if (pointerStart.drawerSwipeEligible && (pointerStart.drawerSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy) * 1.1)) {
      pointerStart.drawerSwiping = true;
      clearTimeout(dragTimer);
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
      return;
    }
    const recentCard = ui.overlay === 'recent' ? pointerStart.target.closest('.recent-item') : ui.overlay === 'shade' ? pointerStart.target.closest('.notification') : null;
    if (recentCard && (pointerStart.recentSwiping || Math.abs(dx) > dp(11) && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.recentSwiping = true;
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
    }
    if (ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && pointerStart.target.closest('[data-gallery-swipe]') && Math.abs(dx)>dp(12) && Math.abs(dx)>Math.abs(dy)) {
      pointerStart.gallerySwiping=true;suppressClickUntil=Date.now()+350;event.preventDefault();
      try{screen.setPointerCapture(event.pointerId);}catch{}
      const picture=viewport.querySelector('.gallery-image');if(picture)picture.style.transform=`translateX(${dx}px)`;return;
    }
    if (pointerStart.lockDrag) { event.preventDefault(); pointerStart.lockActive = lockMove(dx, dy); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && dy < -dp(9) && -dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) { pointerStart.shadeDragging = true; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) {
        shade.style.animation = 'none';
        shade.style.bottom = 'auto';
        shade.style.height = `${Math.max(dp(91.7648), Math.min(screen.clientHeight - dp(83.5295), pointerStart.shadeCloseEligible ? screen.clientHeight - dp(83.5295) + dy : dy))}px`;
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
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (ask('pointerup', event, pointerStart, dx, dy)) { pointerStart = null; return; }
    // The ViewPager tab strip and pages follow a horizontal fling.
    if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && pointerStart.target.closest('.icsp-scroll,.icsp-tabs') && Math.abs(dx) > dp(71) && Math.abs(dx) > Math.abs(dy) * 1.5) { const next = viewport.querySelector(`.icsp-tabs button:${dx < 0 ? 'last' : 'first'}-child`); if (next && !next.disabled) { ui.market.tab = next.dataset.id; render(); } suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.gallerySwiping) { if(Math.abs(dx)>dp(53))galleryStep(dx<0?1:-1);else render();suppressClickUntil=Date.now()+350;pointerStart=null;return; }
    if (pointerStart.drawerSwiping) { finishDrawerPage(dx); pointerStart = null; return; }
    if (pointerStart.recentSwiping) {
      const card = pointerStart.target.closest('.recent-item, .notification');
      if (card) {
        card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
        if (Math.abs(dx) > dp(65)) {
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
            removeTask(id);
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
      const close = pointerStart.shadeCloseEligible ? dy < -dp(65) : dy < dp(88);
      if (close) { ui.overlay = ''; renderOverlay(); }
      else {
        const shade = overlayRoot.querySelector('.notification-shade');
        if (shade) { const height = shade.clientHeight; shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); shade.animate([{height:`${height}px`},{height:`${screen.clientHeight - dp(83.5295)}px`}], {duration:180,easing:'ease-out'}); }
      }
      pointerStart = null; return;
    }
    if (pointerStart.lockDrag) {
      const active = lockMove(dx, dy);
      if (!active && Math.hypot(dx, dy) > dp(7)) suppressClickUntil = Date.now() + 350;
      lockRelease(active);
      pointerStart = null; return;
    }
    if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.swiping || pointerStart.pageSwipeEligible && !dragState && Math.abs(dx) > dp(53) && Math.abs(dx) > Math.abs(dy) && (!pointerStart.source || pointerStart.source.type === 'home' && performance.now() - pointerStart.downTime < 260)) {
      finishHomePage(dx); pointerStart = null; return;
    }
    if (!dragState && pointerStart?.source && !['drawer', 'drawer-widget'].includes(pointerStart.source.type) && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > dp(11)) startDrag(event.clientX, event.clientY);
    if (finishDrag(event.clientX, event.clientY)) { pointerStart = null; return; }
    if (!pointerStart) return;
    if (ui.overlay === 'shade' && pointerStart.target.closest('.notification') && Math.abs(dx) > dp(65)) { const id = Number(pointerStart.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); pointerStart = null; return; }
    if (!ui.overlay && pointerStart.target.closest('#status-bar') && dy > dp(53)) { ui.overlay = 'shade'; renderOverlay(); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { each('pointercancel'); clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if(ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryStep(event.key==='ArrowLeft'?-1:1);return;}
    if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (ask('key', event)) return;
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });
  function powerKey() { if (ui.power === 'off') { bootUp(); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
  // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
  function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
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
    const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('4.0.4'); ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); lastActivity = Date.now(); };
    stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
    return finish;
  }
  /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
     Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
  function coldBoot() {
    if (!AndroidBoot.shouldBoot('4.0.4')) return;
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
    if (!confirm(i18n.t('Reset all local ICS simulator data?'))) return;
    resetSimulator();
  });
  let lastWidgetMinute = '';
  setInterval(() => {
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && data.settings.sleep>0&&Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lockScreen();lastActivity=Date.now();}
    everySecond(now);
    if(ui.view==='gallery' && ui.sub==='photo' && ui.gallerySlideshow && !ui.overlay && Date.now()-ui.gallerySlideAt>=3000){ui.gallerySlideAt=Date.now();galleryStep(1);}
    document.querySelectorAll('.analog-clock').forEach(node => {
      node.setAttribute('aria-label', clock());
      node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
      node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
    });
    const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
    if (minute(now) !== lastWidgetMinute) {
      lastWidgetMinute = minute(now);
      if (ui.view === 'home' && !ui.overlay && !pointerStart && !dragState && viewport.querySelector('.calw')) render();
    }
  }, 1000);

  for (const m of modules()) m.init?.(c);
  i18n.translateDOM(document.body);
  render();
  coldBoot();
})();
