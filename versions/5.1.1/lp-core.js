/* Android 5.1.1 (Nexus 6, LMY48Y): the core. Logic only, nothing of a look (docs/plans/engine-migration.md):
   - the saved state (AndroidState, key android-time-machine-lp-v1, one per user of lp-users.js) and the on-screen
     state (ui, never saved)
   - the screens: ui.view is the open screen ('home', 'drawer', 'lock', an app), ui.sub its page, ui.overlay a dialog,
     menu or panel
   - the context c every module hook gets (storeContext(), over LP.live)
   - render / renderOverlay, open / home / back
   - one click, one form and one field handler: the modules first, then the core's own actions
   - the gestures (one pointer pipeline around pointerStart), the keys, the device clock's tick
   - the site controls around the phone: language, full screen, reset
   Every screen is drawn by an lp- module that registers itself. The host is store-apps/legacy-host.js, named LP here:
     LP.register(id, {title, render(c), mount(c, root), action(name, el, c), back(c), menu(c), key(event, c),
                      submit(name, values, c), input(event, c), open(c, resume), clearData(c, id), tick(c)})
   render() returns the screen's HTML; the other hooks are optional and return true when they handled the event.
   The screens that left the former simulator.js kept their code as it was: a module is defined with
     LP.define(id, ({ui, render, safe, ...}, lp) => { ...the screen's code...; return {render, click, ...}; })
   and starts once the core has given its bindings (LP.kernel, live getters, at the end of start()): the first
   argument holds them, lp (LP.live) reads the ones that change (lp.data, lp.pointerStart, lp.suppressClickUntil)
   and the functions the modules share (a module adds its own with Object.assign(lp, {...})). Such a module also
   answers click(action, button, event) for its buttons wherever they are, submit(name, values, event, form),
   input(event), overlays[name](root) and overlay(name, root), and the hooks the core calls at the place the code
   was (back, pointerdown / pointermove / pointerup, afterRender, opening...). */
'use strict';
window.LP = window.StoreHost;
(() => {
  'use strict';
  // LP is the host itself: what is added here must not replace one of its own methods (overlay, action, ...).
  const add = (name, value) => { if (name in LP) throw new Error(`LP.${name} is the host's`); LP[name] = value; };
  const live = {}, defined = [];
  add('live', live);
  add('define', (id, factory) => { defined.push([id, factory]); });
  add('kernel', getters => { Object.defineProperties(live, Object.getOwnPropertyDescriptors(getters)); });
  // A screen shared by several views (the Play apps) is defined once under all of their ids.
  add('start', () => { for (const [id, factory] of defined) { const spec = factory(live, live); for (const one of [id].flat()) LP.register(one, spec); } });
  // The version's own screens (the store apps answer the host's view-scoped hooks instead).
  const specs = () => [...new Set(LP.ids().filter(id => !id.startsWith('store-')).map(id => LP.module(id)))];
  // A screen's own overlay (ui.overlay names it): true when a module drew it into root.
  add('drawOverlay', (name, root) => {
    for (const m of specs()) { const draw = m.overlays?.[name]; if (draw) { draw(root); return true; } }
    // a module that names its overlays itself: overlay(name, root), true when it drew one
    for (const m of specs()) if (m.overlay?.(name, root)) return true;
    return false;
  });
  add('dispatchClick', (action, button, event) => {
    for (const m of specs()) if (m.click?.(action, button, event)) return true;
    return false;
  });
  // A form's submit (data-form names it) and a field's input: true when a module took it.
  add('dispatchSubmit', (name, values, event, form) => {
    for (const m of specs()) if (m.submit?.(name, values, event, form)) return true;
    return false;
  });
  add('dispatchInput', event => {
    for (const m of specs()) if (m.input?.(event)) return true;
    return false;
  });
})();

// The core, once every module has loaded (deferred scripts run before DOMContentLoaded).
function start() {
  // The modules' shared names: what they add, and the core's bindings they use (lp:kernel at the end).
  const lp = LP.live;


  // ---- The saved state and ui ----
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

  // ---- What the image has: the apps, their colours, the wallpapers ----
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
  /* Workspace.wallpaperOffsetForCurrentScroll: a still wallpaper spans at least MIN_PARALLAX_PAGE_SPAN (3) page
     gaps; the extra empty screen added while dragging does not count. */
  function wallpaperOffset(page) {
    const pages = lp.homePageCount(), span = Math.max(3, pages - 1);
    return span > 0 ? Math.max(0, Math.min(pages - 1, page)) / span : 0;
  }
  function setWallpaperPan(page, animate = true) {
    if (data.wallpaper === 11) return;
    screen.style.transition = animate ? 'background-position .35s cubic-bezier(.215,.61,.355,1)' : 'none';
    screen.style.backgroundPosition = `${(wallpaperOffset(page) * 100).toFixed(3)}% center`;
  }
  const iconAssets = new Set(['phone', 'people', 'messaging', 'camera', 'settings', 'clock', 'calendar', 'calculator', 'email', 'play-store', 'downloads', 'hangouts', 'chrome', 'gmail', 'photos', 'play-books', 'play-games', 'play-movies', 'play-music', 'google-settings', 'google-plus', 'maps', 'earth', 'google-search', 'keep', 'drive', 'youtube', 'news-weather', 'voice-search', 'docs', 'sheets', 'slides', 'fit', 'newsstand', 'wallet']);
  const i18n = window.AndroidI18n;
  const appNames = Object.fromEntries(apps.map(app => [app[0], app[1]]));
  appNames.google = 'Google';

  // ---- The context c: the store apps and the modules ----
  /* The store apps that work (docs/plans/play-apps.md, store-apps/legacy-host.js): the store's installed ones join the
     launcher's apps (icon assets/<id>.png) while installed, open as StoreHost modules, and leave with their icons and
     data when uninstalled. */
  function storeAppsSync() {
    const want = (data.marketInstalled || []).map(id => StoreHost.runtime(id)).filter(Boolean);
    for (const id of want) if (!apps.some(a => a[0] === id)) { const m = StoreHost.module(id); apps.push([id, m.title, '', m.color || '#888', m.dark || '#444']); appNames[id] = m.title; iconAssets.add(id); LP_STATUS_COLORS[id] = m.dark; LP_PRIMARY[id] = m.color; }
    for (let i = apps.length - 1; i >= 0; i--) if (String(apps[i][0]).startsWith('store-') && !want.includes(apps[i][0])) { delete appNames[apps[i][0]]; apps.splice(i, 1); }
  }
  storeAppsSync();
  function storeContext() { return StoreHost.context(Object.create(lp, Object.getOwnPropertyDescriptors({data, ui, save, render, renderOverlay, toast, openApp, screen, notify: (title, text) => lp.addNotification(title, text), menuClass: 'lp-popup-menu', lang: i18n.language, locale: i18n.locale(), safe, t: key => i18n.t(key)}))); }
  StoreHost.provide(storeContext);
  ICSLauncherFolders.initialize(data,apps.map(app=>app[0]).concat((data.driveFiles||StockApps.FILES).map(f=>'office:'+f.id)));

  // ---- The phone: its views, the device clock, dates, the long-press delay, the credential lock ----
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
  // Touch & hold delay: Settings' long_press_timeout_selector values (500 / 1000 / 1500 ms); the simulator's own
  // long-press timers stretch by the same amount.
  const HOLD = [500, 1000, 1500], HOLD_NAMES = ['Short', 'Medium', 'Long'];
  const holdDelay = ms => ms + (HOLD[data.settings.longPressTimeout || 0] - 500);
  let lastActivity=Date.now();
  for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
  const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;const pending=ui.kgPending;ui.kgPending=null;ui.kgBouncing=false;ui.kgUp=true;home(false);if(pending)lp.afterKeyguardDismiss(pending);},
    // Android 4.3 security views (KeyguardPatternView/PINView/PasswordView) inside the SlidingChallengeLayout.
    // Lollipop security views: the kg_* instructions, the kg_wrong_* errors and the countdown.
    look:{wrong:kind=>({pattern:'Wrong Pattern',pin:'Wrong PIN',password:'Wrong Password'})[kind],clearMs:2000,message:({state,remaining})=>remaining?AndroidStrings.format(i18n.t('Try again in %d seconds.'), remaining):state.error&&Date.now()-state.errorAt<5000?i18n.t(state.error):i18n.t({pattern:'Draw your pattern',pin:'Enter PIN',password:'Enter Password'}[state.kind]||''),renderLock:api=>lp.renderSecureKeyguard(api)}});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);


  // ---- render: transitions, the screen, the app ----
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
    lp.updateBarMode();
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${ui.view === 'wallpaper-picker' ? ' lp-wallpaper-picker' : ''}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('${wallpaperUrl(data.wallpaper)}') ${(wallpaperOffset(['home', 'drawer'].includes(ui.view) ? ui.page : 0, false) * 100).toFixed(3)}% center / auto 100% no-repeat`;
    screen.style.transition = 'none';
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    lp.renderStatus(); lp.renderNav();
    document.querySelector('.notification-led')?.classList.toggle('on', !!ui.sleeping && !ui.power && data.settings.pulse !== false && data.notifications.length > 0);
    JBDeveloperOptions.apply(screen, data.settings);
    if (ui.view !== 'lock' && ui.kgPad) { ui.kgPad.destroy(); ui.kgPad = null; }
    if (ui.view !== 'lock' && ui.kgChallenge) { ui.kgChallenge.destroy(); ui.kgChallenge = null; }
    if (ui.view === 'lock') { viewport.innerHTML = lp.renderLock(); lp.attachKeyguard(); }
    else if (ui.view === 'home') { viewport.innerHTML = lp.renderHome(); lp.restoreWidgetScroll(); }
    else if (ui.view === 'drawer') viewport.innerHTML = lp.renderDrawer();
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
  const mixVelocity = (old, value, k) => old === undefined ? value : old + (value - old) * k;

  function renderApp() {
    if (StoreHost.module(ui.view)?.render) return StoreHost.render(ui.view, storeContext());
    switch (ui.view) {
      default: return lp.renderHome();
    }
  }

  // ---- open / home / back ----
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
    if (LP.module('home').backPhotoWidget()) return;
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (LP.module('camera').back()) return;
    if (LP.module('live-wallpapers').back()) return;
    if (LP.module('lock').back()) return;
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
    if (LP.module('home').back()) return;
    if (LP.module('wallpaper-picker').back()) return;
    if (LP.module('kk-doc-picker').back()) return;
    if (LP.module('home').backDrawer()) return;
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

  // ---- Toasts ----
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

  // ---- renderOverlay ----
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
    LP.module('shade').beforeOverlay();
    // A screen's own overlay, menu or dialog (lp-*.js modules: the shade first).
    if (LP.drawOverlay(ui.overlay, overlayRoot)) {
    } else if (ui.overlay === 'store-host') {
      overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
    } else overlayRoot.innerHTML = '';
    i18n.translateDOM(overlayRoot);
    LP.module('home').afterOverlay(closingFolder);
  }



  setInterval(() => { if (ui.overlay === 'wifi-wps') renderOverlay(); }, 1000);




  // ---- The browser sessions, Reset and Clear data ----
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


  // ---- The click, form and field dispatch ----
  /* A simulated answer shows Lollipop's heads-up notification: a few seconds after a text to one of the demo contacts
     they write back once (per contact and session). */
  const REPLIES = {1: 'Sounds good, see you then!', 2: 'Got it, thanks!', 3: 'Haha, nice 😄', 4: 'Love you! Talk soon ♥'};

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
      if(pending&&ui.view==='lock'){lp.requestBouncer(pending);return;}
      if(!['back','alarm-dismiss','alarm-snooze','lock-media'].includes(action))return;
    }
    // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
    if ((action.startsWith('sth-') || StoreHost.has(ui.view)) && StoreHost.action(action, button, storeContext())) return;
    // The Phone app's Settings (lp-dialer-prefs.js).
    // The screens' own buttons (lp-*.js modules).
    if (LP.dispatchClick(action, button, event)) return;
    switch (action) {
      case 'open-app': if (lp.GEL_UNSIMULATED.includes(app)) { toast(i18n.t('This app is not part of the simulator.')); break; } {
        const icon = button.closest('.launcher-icon, .drawer-app, .dock-app') || button;
        // Launcher icons start apps with makeScaleUpAnimation; Recents uses makeThumbnailScaleUpAnimation from the thumbnail.
        const source = button.closest('.recent-item') ? button.closest('.recent-item').querySelector('.recent-thumbnail') : ['home', 'drawer'].includes(ui.view) ? icon : null;
        if (source) { const box = source.getBoundingClientRect(), frame = viewport.getBoundingClientRect(), k = frame.width / viewport.offsetWidth || 1; launchFrom = {left: (box.left - frame.left) / k, top: (box.top - frame.top) / k, width: box.width / k, height: box.height / k, recents: !!button.closest('.recent-item')}; }
        openApp(app || id, !!button.closest('.recent-item')); break;
      }
      // Screen pinning: Home and Overview only remind how to unpin; ScreenPinningRequest confirms the pin.
      case 'home': if (ui.pinned && ui.view !== 'lock') { lp.pinnedToast(); break; } if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      case 'close-overlay': if (ui.overlay === 'recent') { lp.closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
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
    if (LP.dispatchSubmit(form.dataset.form, values, event, form)) return;
    switch (form.dataset.form) {
      default: break;
    }
  });
  document.addEventListener('input', event => {
    // The screens' own fields (lp-*.js modules).
    if (LP.dispatchInput(event)) return;
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);delete folder.nameKey;save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',lp.folderName(ui.folderId));button.lastElementChild.textContent=lp.folderName(ui.folderId);}}return;}
  });


  // ---- Gestures: one pointer pipeline ----
  let pointerStart = null, eggTimer = null, dragTimer = null, dragState = null;
  screen.addEventListener('dragstart', event => event.preventDefault());
  let homeLongPressTimer = null, messageHoldTimer = null;
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
  const activeTouches = new Set();
  window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') activeTouches.add(event.pointerId); }, true);
  for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => activeTouches.delete(event.pointerId), true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    // Lists scroll by mouse drag in lp-scroll.js (OverScroller fling, EdgeEffect); only the widget picker keeps this one.
    const scrollTarget = widgetList || null;
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: lp.dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), qsPullEligible: ui.overlay === 'shade' && !ui.shadeSettings && !!event.target.closest('.lp-shade') && !event.target.closest('.lp-note,input') && !(overlayRoot.querySelector('.lp-shade-scroll')?.scrollTop > 0), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    LP.module('shade').pointerdown(event);
    if (ui.view === 'home' && event.target.closest('.lp-cling .cling-shade')) homeLongPressTimer = setTimeout(() => { data.clings.workspace = true; save(); LauncherClings.dismiss(lp.clingLayerRoot().querySelector('[data-cling="workspace"]'), () => { ui.overview = true; render(); }); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    if (ui.view === 'home' && !ui.overlay && !ui.overview && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overview = true; render(); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    LP.module('messaging').pointerdown(event);
    if (LP.module('wallpaper-picker').pointerdown(event)) return;
    LP.module('google-search').pointerdown(event);
    LP.module('lock').pointerdown(event);
    LP.module('calculator').pointerdown(event);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => lp.startDrag(event.clientX, event.clientY), holdDelay(440));
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { lp.moveGhost(event.clientX, event.clientY); return; }
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
    if (LP.module('lock').pointermove(event, dx, dy)) return;
    if (LP.module('shade').pointermove(event, dx, dy)) return;
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
    if (pointerStart.swiping) { event.preventDefault(); lp.moveHomePage(dx); return; }
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
      lp.moveHomePage(dx);
      return;
    }
    // A sideways drag in the drawer turns its page however slowly it starts, also from an icon (PagedView takes the
    // gesture past the touch slop, before the long press); the mouse's quick drag to the home screen is a vertical one.
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal) && !(pointerStart.drawerSwipeEligible && horizontal)) lp.startDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    clearTimeout(pointerStart.peekTimer);
    if (LP.module('shade').pointerupPeek()) return;
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); LP.module('calculator').cancelHold(); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (LP.module('wallpaper-picker').pointerup()) return;
    if (LP.module('clock').pointerup(event, dx)) return;
    if (LP.module('play-store').pointerup(event, dx, dy)) return;
    if (LP.module('calendar').pointerup(event, dx)) return;
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(33)) lp.stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (LP.module('photos').pointerup(event, dx)) return;
    if (LP.module('calculator').pointerup(dx)) return;
    if (pointerStart.drawerSwiping) { lp.finishDrawerPage(dx); pointerStart = null; return; }
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
              save(); lp.renderStatus();
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
    if (LP.module('shade').pointerup()) return;
    if (LP.module('lock').pointerup(event, dx, dy)) return;
    if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.swiping || pointerStart.pageSwipeEligible && !dragState && Math.abs(dx) > dp(50) && Math.abs(dx) > Math.abs(dy) && (!pointerStart.source || pointerStart.source.type === 'home' && performance.now() - pointerStart.downTime < 260)) {
      lp.finishHomePage(dx); pointerStart = null; return;
    }
    if (!dragState && pointerStart?.source && !['drawer', 'drawer-widget'].includes(pointerStart.source.type) && Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y) > dp(10)) lp.startDrag(event.clientX, event.clientY);
    if (lp.finishDrag(event.clientX, event.clientY)) { pointerStart = null; return; }
    if (!pointerStart) return;
    if (LP.module('shade').pointerupLate(event, dx, dy)) return;
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { LP.module('calculator').pointercancel(); clearTimeout(messageHoldTimer); clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);lp.clearFolderDragFeedback();dragState?.ghost.remove(); lp.clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); if (ui.extraScreen) { lp.stripEmptyScreens(); save(); if (ui.view === 'home') render(); } lp.setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  window.addEventListener('pointercancel',()=>{const photo=viewport.querySelector('.gallery-image');if(photo)photo.style.transform='';});

  // ---- Keys ----
  document.addEventListener('keydown', event => {
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; lp.stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if (LP.module('photos').keydown(event)) return;
    if (event.target.matches?.('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (ui.view === 'calculator' && StoreHost.key(event, storeContext())) return;
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });

  // ---- The cold boot ----
  /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
     Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
  function coldBoot() {
    if (!AndroidBoot.shouldBoot('5.1.1')) return;
    const booted = AndroidBoot.prepare({markup: apps.map(app => lp.appIcon(app[0])).join('')});
    const finish = lp.bootUp(false, booted);
    const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); suppressClickUntil = Date.now() + 350; booted.then(finish); };
    const off = () => { lp.powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
    lp.powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
  }

  // ---- The site controls around the phone ----
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

  // ---- The device clock's tick ----
  let lastWidgetMinute = '';
  setInterval(() => {
    const cpu = screen.querySelector('.dev-cpu'); if (cpu) JBDeveloperOptions.updateCpu(cpu);
    lockControls.tick();
    document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    const now = deviceDate();
    if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !dragState && data.settings.sleep>0&&Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lp.lockScreen();lastActivity=Date.now();}
    if(ui.activeCall){
      const dialing=Date.now()<ui.activeCall.connected;
      const elapsed=viewport.querySelector('.incall-elapsed'),state=viewport.querySelector('.incall-state');
      if(elapsed)elapsed.textContent=dialing?'':ICSPhoneCall.duration(ICSPhoneCall.elapsed(ui.activeCall));
      if(state)state.textContent=i18n.t(ICSPhoneCall.stateLabel(ui.activeCall))||'';
    }
    lp.checkAlarms(now);
    lp.checkTimers();
    // Interruptions: the end of a countdown, alarm or downtime condition, and Downtime's autotrigger.
    if (LPZen.tick(data.settings, now.getTime(), lp.nextAlarmTime())) { save(); lp.renderStatus(); if (ui.view === 'settings' && ui.sub === 'zen' && !ui.overlay) render(); }
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


  // ---- Start: the modules get the core, the first render, the boot ----
  // lp:kernel (the core's bindings the lp-*.js modules use, live; written by the migration's move tool)
  LP.kernel({
    get activeTouches() { return activeTouches; }, get applyMagnification() { return applyMagnification; },
    get appNames() { return appNames; }, get apps() { return apps; },
    get captureRecentView() { return captureRecentView; }, get chromeText() { return chromeText; },
    get clearAppData() { return clearAppData; }, get clock() { return clock; }, get clone() { return clone; },
    get closingVelocity() { return closingVelocity; }, set closingVelocity(v) { closingVelocity = v; },
    get contact() { return contact; }, get data() { return data; }, set data(v) { data = v; },
    get defaultData() { return defaultData; }, get deviceDate() { return deviceDate; }, get dp() { return dp; },
    get dragState() { return dragState; }, set dragState(v) { dragState = v; },
    get emailData() { return emailData; }, get fullDate() { return fullDate; },
    get HOLD_NAMES() { return HOLD_NAMES; }, get holdDelay() { return holdDelay; }, get home() { return home; },
    get homeLongPressTimer() { return homeLongPressTimer; }, set homeLongPressTimer(v) { homeLongPressTimer = v; },
    get i18n() { return i18n; }, get iconAssets() { return iconAssets; },
    get lastActivity() { return lastActivity; }, set lastActivity(v) { lastActivity = v; },
    get lockControls() { return lockControls; }, get LP_PRIMARY() { return LP_PRIMARY; },
    get LP_STATUS_COLORS() { return LP_STATUS_COLORS; },
    get messageHoldTimer() { return messageHoldTimer; }, set messageHoldTimer(v) { messageHoldTimer = v; },
    get navRoot() { return navRoot; }, get openApp() { return openApp; },
    get openFolderId() { return openFolderId; }, set openFolderId(v) { openFolderId = v; },
    get overlayRoot() { return overlayRoot; },
    get pointerStart() { return pointerStart; }, set pointerStart(v) { pointerStart = v; },
    get reducedMotion() { return reducedMotion; }, get render() { return render; },
    get renderOverlay() { return renderOverlay; }, get REPLIES() { return REPLIES; },
    get resetSimulator() { return resetSimulator; }, get safe() { return safe; }, get save() { return save; },
    get screen() { return screen; }, get setWallpaperPan() { return setWallpaperPan; },
    get shadeDate() { return shadeDate; }, get snapResting() { return snapResting; },
    get statusRoot() { return statusRoot; }, get storeAppsSync() { return storeAppsSync; },
    get storeContext() { return storeContext; },
    get suppressClickUntil() { return suppressClickUntil; }, set suppressClickUntil(v) { suppressClickUntil = v; },
    get suppressReleaseClick() { return suppressReleaseClick; }, get syncBrowserState() { return syncBrowserState; },
    get toast() { return toast; }, get today() { return today; }, get tracks() { return tracks; },
    get ui() { return ui; }, get viewport() { return viewport; }, get wallpaperFiles() { return wallpaperFiles; },
    get wifiNetworks() { return wifiNetworks; }
  });
  // lp:kernel-end
  LP.start();

  i18n.translateDOM(document.body);
  render();
  coldBoot();
}
document.addEventListener('DOMContentLoaded', start);
