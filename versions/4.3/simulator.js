/* Android 4.3 Jelly Bean browser simulation (Nexus 4, JWR66Y). No network or Android runtime required. */
(() => {
  'use strict';

  const STORE = 'android-time-machine-jb-v1';
  const localDate = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const defaultData = {
    // Launcher2 shows its clings on the first run; saved desktops from before count as dismissed.
    clings: LauncherClings.fresh(),
    // JWR66Y's framework default_wallpaper.jpg (drawable-xhdpi, the Nexus 4's: = Launcher2's xhdpi wallpaper_05, index 4),
    // the Jelly Bean bokeh picture; wallpaper_01 is that picture only in the tablets' sw600dp set. The image's
    // default_wallpaper_component is Phase Beam, as on the Galaxy Nexus; the simulator keeps Phase Beam for 4.0.4 only so
    // the two versions do not open on the same wallpaper. Phase Beam stays in the live wallpaper picker.
    wallpaper: 4, wallpaperRevision: 3,
    // JWR66Y's Launcher2 default_workspace.xml: the analog clock, the Google folder and Play Store on the middle screen,
    // Play Recommendations right of it; the dock holds Camera, Chrome, all apps, Messaging and Phone. Revision 3.
    layoutRevision: 3,
    homePages: Array.from({length: 5}, (_, page) => Array.from({length: 16}, (_, slot) =>
      page === 2 && slot === 12 ? 'folder-google' : page === 2 && slot === 15 ? 'play-store' : null)),
    homeWidgets: [
      [],
      [],
      [{ id: 'default-analog', type: 'analog', x: 1, y: 0 }],
      [{ id: 'default-play', type: 'play-recommended', x: 0, y: 0 }],
      []
    ],
    folders: {'folder-google': {name: 'Google', items: ['gmail', 'google-plus', 'maps', 'play-store', 'play-music', 'play-movies', 'play-books', 'play-magazines', 'youtube', 'hangouts', 'calendar', 'people']}},
    dock: ['camera', 'chrome', 'apps', 'messaging', 'phone'],
    settings: { wifi: true, wifiNetwork: 'AndroidAP', wifiNotify: true, bluetooth: false, bluetoothVisible: false, pairedDevice: '', airplane: false, nfc: true, androidBeam: true, wifiDirect: false, portableHotspot: false, dataEnabled: true, dataRoaming: false, developerUnlocked: false, silent: false, rotate: true, brightness: 68, autoSync: true, networkLocation: true, gps: false, visiblePasswords: false, unknownSources: false, backup: true, autoRestore: true, largeText: false, speakPasswords: false, usbDebug: false, stayAwake: false, mockLocations: false, showTouches: false,
      // SettingsProvider / framework defaults of JWR66Y: automatic brightness on (def_screen_brightness_automatic_mode); Daydream on,
      // started while docked (config_dreamsEnabledByDefault, config_dreamsActivatedOnDockByDefault; not on sleep).
      autoBrightness: true, daydream: true, daydreamWhen: 'docked' },
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
    // Hangouts' own chats (Google Talk history), kept apart from the SMS in Messaging.
    keepNotes: StockApps.DEFAULT_NOTES.map(note => ({...note})),
    hangoutChats: [
      { id: 1, contact: 2, body: 'Did you try the new Hangouts? Group video calls work great.', mine: false, time: '9:12' },
      { id: 2, contact: 2, body: 'Just installed it. Talk is gone and all our chats are here!', mine: true, time: '9:20' },
      { id: 3, contact: 3, body: 'Photos from the meetup are up on Google+ 📷', mine: false, time: 'Yesterday' }
    ],
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
      { id: 1, title: 'Welcome to Android 4.3', detail: 'Your phone is ready to explore.' },
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
      // The Nexus 4 offers all fourteen wallpapers (wallpapers array, xhdpi); the custom one moved off index 11.
      ['wallpaper revision 1', (result, saved) => {
        if (!saved.wallpaperRevision) {
          const old = ['01','02','03','04','05','08','09','10','11','12'];
          if (result.wallpaper === 11 && (result.customWallpaper || result.customWallpaperPhoto)) result.wallpaper = 'custom';
          else if (typeof result.wallpaper === 'number') result.wallpaper = Math.max(0, ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'].indexOf(old[result.wallpaper] || '01'));
          result.wallpaperRevision = 1;
        }
      }],
      // Revision 2: Phase Beam was the first-boot default until now; a desktop still on it moves to the JB picture.
      ['wallpaper revision 2', (result, saved) => {
        if ((saved.wallpaperRevision || 0) < 2) {
          if (result.liveWallpaper?.id === 'phasebeam') { delete result.liveWallpaper; result.wallpaper = 0; }
          result.wallpaperRevision = 2;
        }
      }],
      // Revision 3: the first-boot picture was wallpaper_01 (the colour circles) by mistake; a desktop still on it moves to
      // the image's default_wallpaper, wallpaper_05.
      ['wallpaper revision 3', (result, saved) => {
        if ((saved.wallpaperRevision || 0) < 3) {
          if (result.wallpaper === 0 && !result.liveWallpaper) result.wallpaper = 4;
          result.wallpaperRevision = 3;
        }
      }]
    ]);
  }
  let data = load();
  AndroidState.onProblem(problem => setTimeout(() => toast(i18n.t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
  data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...JBDeveloperOptions.DEFAULTS,spellChecker:true,imeLatin:true,...data.settings};
  if(!data.sleepNever){data.sleepNever=true;if(data.settings.sleep===30)data.settings.sleep=-1;}
  ICSLockscreen.initialize(data);
  // While Hangouts is in front data.messages holds its chats (hangoutsScope); the saved copy keeps each store in place.
  let hangoutsSwap = null;
  function save() {
    const stored = hangoutsSwap ? {...data, messages: hangoutsSwap.messages, messageDrafts: hangoutsSwap.messageDrafts, hangoutChats: data.messages, hangoutDrafts: data.messageDrafts, messagesOwner: undefined} : data;
    AndroidState.save(STORE, stored);
  }
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
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Nexus 4 is ready. Explore Android 4.3 Jelly Bean, customize your home screen, and discover the little surprise hidden in Settings.', hoursAgo: 1 },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', hoursAgo: 26 },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', hoursAgo: 30 }
  ];
  const tracks = ICSMusic.tracks;
  data.mailbox=ICSEmail.restore(data.mailbox,emailData,data.sentEmails);
  ui.music=ICSMusic.restore(data.music);
  ui.musicTrack=ui.music.track;
  ui.browserSession = ICSBrowserSession.restore(data.browserSession,data.browserHistory);
  // Gmail's own offline account (UnifiedEmail screens from jb-email.js); the AOSP Email keeps data.mailbox.
  data.gmailbox=GmailApp.restore(data.gmailbox);
  // Chrome and the AOSP Browser keep separate tabs; ui.browserSession is the one of the browser in front.
  ui.browserOwner = 'browser'; ui.browserSessions = {};
  syncBrowserState();
  const apps = [
    ['phone', 'Phone', '☎', '#3dc484', '#217258'], ['people', 'People', '◉', '#efa96f', '#a45142'],
    ['messaging', 'Messaging', '✉', '#84cf62', '#428c43'], ['browser', 'Browser', '◎', '#65aee2', '#246ba8'],
    // Chrome, the Nexus 4's own browser (the JWR66Y image has no AOSP Browser; the owner keeps both).
    ['chrome', 'Chrome', '◎', '#4285f4', '#db4437'],
    // Google's Play media apps of the JWR66Y image (labels as its launcher shows them); AOSP Music stays beside Play Music.
    ['gmail', 'Gmail', '✉', '#ffffff', '#db4437'], ['hangouts', 'Hangouts', '❝', '#8bc34a', '#33691e'],
    // The other Google apps of the image's launcher (stock-apps.js).
    ['google-search', 'Google', 'g', '#4285f4', '#3367d6'], ['voice-search', 'Voice Search', '🎤', '#eeeeee', '#5f6368'], ['maps', 'Maps', '⌖', '#cfe6b8', '#4285f4'],
    ['keep', 'Keep', '✎', '#f7c600', '#d9a800'], ['youtube', 'YouTube', '▶', '#e62117', '#b31217'], ['google-plus', 'Google+', 'g+', '#dd4b39', '#b03a2e'],
    ['earth', 'Earth', '◍', '#1f6fd1', '#0b2f73'], ['news-weather', 'News & Weather', '☼', '#4285f4', '#9e9e9e'], ['google-settings', 'Google Settings', 'g', '#757575', '#424242'],
    // The rest of the image's launcher (jb-extra-apps.js); Google Keyboard opens Language & input like its SetupActivity.
    ['messenger', 'Messenger', '✉', '#dd4b39', '#b03a2e'], ['navigation', 'Navigation', '➤', '#4285f4', '#1a73e8'], ['local', 'Local', '⌖', '#db4437', '#a52714'],
    ['currents', 'Currents', '◐', '#00a1e4', '#0277bd'], ['play-magazines', 'Play Magazines', '▤', '#e53935', '#b71c1c'], ['wallet', 'Wallet', '▭', '#0f9d58', '#0b8043'],
    ['movie-studio', 'Movie Studio', '▶', '#607d8b', '#37474f'], ['google-keyboard', 'Google Keyboard', '⌨', '#9e9e9e', '#616161'],
    ['play-music', 'Play Music', '♫', '#ff9800', '#e65100'], ['play-movies', 'Google Play Movies', '▶', '#e53935', '#b71c1c'], ['play-books', 'Play Books', '▤', '#4285f4', '#1a73e8'],
    ['camera', 'Camera', '▣', '#c8cbd0', '#6b7a87'], ['gallery', 'Gallery', '▧', '#e9b674', '#8d673c'],
    ['settings', 'Settings', '⚙', '#b7c5ce', '#53606f'], ['clock', 'Clock', '◷', '#71b7dc', '#3d6e8d'],
    ['calendar', 'Calendar', '31', '#7ec7e7', '#397c9e'], ['calculator', 'Calculator', '＋', '#7cb4bd', '#32727f'],
    ['music', 'Music', '♫', '#fd9e70', '#c25360'], ['email', 'Email', '✉', '#75b7df', '#326b9e'],
    ['play-store', 'Play Store', '▶', '#b5d26d', '#53732f'],
    // DownloadProviderUi of the image (holo-downloads).
    ['downloads', 'Downloads', '⬇', '#8bc34a', '#33691e']
  ];
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];
  // The Nexus 4's Launcher2 (JWR66Y): its xhdpi wallpapers array lists 01 to 14 (the AOSP phone list drops 06, 07, 13
  // and 14). wallpaper_01 is also the framework default_wallpaper.
  const wallpaperFiles = ['01','02','03','04','05','06','07','08','09','10','11','12','13','14'];
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3, resize: {minWidth: 2, minHeight: 2} },
    { type: 'digitalclock', name: 'Digital clock', app: 'clock', width: 3, height: 2, resize: {minWidth: 2, minHeight: 1} },
    { type: 'music', name: 'Music', app: 'music', width: 4, height: 1 },
    // Gallery2 asks for 180dp plus ICS default widget padding: 3 × 3 Launcher cells.
    { type: 'photo', name: 'Photo Gallery', app: 'gallery', width: 3, height: 3 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 },
    // Play Store 4.2.3's RecommendedWidgetProvider (minWidth 500 dp, minHeight 110 dp: 4 × 2).
    { type: 'play-recommended', name: 'Play Recommendations', app: 'play-store', width: 4, height: 2 },
    // Sound Search 1.1.9's EarsMusicWidgetProvider (minWidth 300 dp, minHeight 60 dp: 4 x 1), labelled ears_widget_name.
    { type: 'ears', get name() { return Ears.text(i18n.language, 'ears_widget_name'); }, app: '', width: 4, height: 1 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const PLAY_APPS = ['play-music', 'play-movies', 'play-books'];
  const iconAssets = new Set(['downloads', 'messenger', 'navigation', 'local', 'currents', 'play-magazines', 'wallet', 'movie-studio', 'google-keyboard', 'phone', 'people', 'messaging', 'browser', 'chrome', 'gmail', 'hangouts', 'google-search', 'voice-search', 'maps', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings', 'play-music', 'play-movies', 'play-books', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps']);
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
  // The context of the store apps and of the jb-* modules (jb-core.js); `extra` adds what one call gives (the click's
  // event, the submitted form, the app whose data is cleared).
  function storeContext(extra) { return StoreHost.context(Object.setPrototypeOf({data, ui, save, render, renderOverlay, toast, openApp, screen, viewport, dp, snapResting, holdDelay, suppressClick: ms => { suppressClickUntil = Date.now() + ms; }, notify: (title, text) => addNotification(title, text), lang: i18n.language, locale: i18n.locale(), safe, t: key => i18n.t(key), ...extra}, moduleApi)); }
  // A click, a form, typing or an overlay is offered to every jb-* module (a case can be reached from another screen:
  // the shade, a widget, a ringing alarm), at the place its code stood; the first that takes it ends the search.
  function moduleHook(hook, extra, ...args) {
    const c = storeContext(extra), seen = new Set();
    for (const id of StoreHost.ids()) {
      const m = StoreHost.module(id);
      if (id.startsWith('store-') || seen.has(m) || !m[hook]) continue;
      seen.add(m);
      const result = m[hook](...args, c);
      if (result) return result;
    }
  }
  // Every jb-* module, each in turn (the screen's live parts made after every render, whichever screen is in front).
  function moduleEach(hook, extra, ...args) {
    const c = storeContext(extra), seen = new Set();
    for (const id of StoreHost.ids()) {
      const m = StoreHost.module(id);
      if (id.startsWith('store-') || seen.has(m) || !m[hook]) continue;
      seen.add(m);
      m[hook](...args, c);
    }
  }
  // The names the jb-* modules bind (generated as code moves out; docs/plans/engine-migration-4.3.md).
  const moduleApi = {get A11Y() { return A11Y; }, get HOLD_NAMES() { return HOLD_NAMES; }, get PLAY_APPS() { return PLAY_APPS; }, get addNotification() { return addNotification; }, get appIcon() { return appIcon; }, get appNames() { return appNames; }, get appView() { return appView; }, get applyMagnification() { return applyMagnification; }, get apps() { return apps; }, get back() { return back; }, get cameraIntent() { return cameraIntent; }, get cameraShoot() { return cameraShoot; }, get captureRecentView() { return captureRecentView; }, get carrierName() { return carrierName; }, get cczContext() { return cczContext; }, get clearAppData() { return clearAppData; }, get clock() { return clock; }, get clone() { return clone; }, get composeEmail() { return composeEmail; }, get composeGmail() { return composeGmail; }, get connectivityRow() { return connectivityRow; }, get connectivitySwitch() { return connectivitySwitch; }, get contact() { return contact; }, get contactByPhone() { return contactByPhone; }, get content() { return content; }, get data() { return data; }, get defaultData() { return defaultData; }, get deviceDate() { return deviceDate; }, get digitalClockWidget() { return digitalClockWidget; }, get dp() { return dp; }, get dragState() { return dragState; }, set dragState(v) { dragState = v; }, get emailContext() { return emailContext; }, get emailData() { return emailData; }, get fullDate() { return fullDate; }, get hangoutsScope() { return hangoutsScope; }, get hangoutsSwap() { return hangoutsSwap; }, set hangoutsSwap(v) { hangoutsSwap = v; }, get home() { return home; }, get i18n() { return i18n; }, get jbPlayGo() { return jbPlayGo; }, get jbmaContext() { return jbmaContext; }, get jbmaReturn() { return jbmaReturn; }, get keepMoreContext() { return keepMoreContext; }, get label() { return label; }, get lastActivity() { return lastActivity; }, set lastActivity(v) { lastActivity = v; }, get liveLayer() { return liveLayer; }, get lockControls() { return lockControls; }, get lockScreen() { return lockScreen; }, get messageDraft() { return messageDraft; }, get messengerContext() { return messengerContext; }, get movieContext() { return movieContext; }, get mrContext() { return mrContext; }, get musicActive() { return musicActive; }, get navRoot() { return navRoot; }, get navigateBack() { return navigateBack; }, get navigateBrowser() { return navigateBrowser; }, get nextAlarmLabel() { return nextAlarmLabel; }, get openApp() { return openApp; }, get openMessageThread() { return openMessageThread; }, get overlayRoot() { return overlayRoot; }, get placeContactShortcut() { return placeContactShortcut; }, get pointerStart() { return pointerStart; }, set pointerStart(v) { pointerStart = v; }, get powerLayer() { return powerLayer; }, get prefRow() { return prefRow; }, get reducedMotion() { return reducedMotion; }, get render() { return render; }, get renderOverlay() { return renderOverlay; }, get renderStatus() { return renderStatus; }, get restoreChrome() { return restoreChrome; }, get row() { return row; }, get safe() { return safe; }, get save() { return save; }, get saveMusic() { return saveMusic; }, get screen() { return screen; }, get shareText() { return shareText; }, get shareVcard() { return shareVcard; }, get snapResting() { return snapResting; }, get startPhoneCall() { return startPhoneCall; }, get statusRoot() { return statusRoot; }, get storeAppsSync() { return storeAppsSync; }, get storeContext() { return storeContext; }, get storeInstalled() { return storeInstalled; }, get storeUninstall() { return storeUninstall; }, get suppressClickUntil() { return suppressClickUntil; }, set suppressClickUntil(v) { suppressClickUntil = v; }, get syncBrowserState() { return syncBrowserState; }, get toast() { return toast; }, get today() { return today; }, get toggleRow() { return toggleRow; }, get tracks() { return tracks; }, get ui() { return ui; }, get viewport() { return viewport; }, get volumeLayer() { return volumeLayer; }, get wallpaperChoices() { return wallpaperChoices; }, get wallpaperFiles() { return wallpaperFiles; }, get widgetSize() { return widgetSize; }, get widgetTypes() { return widgetTypes; }, get wifiNetworks() { return wifiNetworks; }, get wirelessCheckRow() { return wirelessCheckRow; }, get wirelessRow() { return wirelessRow; }};
  // Installed from the store: the app joins the launcher and, with the store's shortcut setting on, the home screen.
  function storeInstalled(id) { const r = StoreHost.runtime(id); if (!r) return; storeAppsSync(); if (jbPlayContext().prefs.shortcuts) placeShortcut(r, appNames[r]); }
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
  // dp → CSS px now: the display is 384 dp wide (the desktop frame's width, the whole width on a phone).
  const dp = n => n * screen.clientWidth / 384;
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const navRoot = document.querySelector('#nav-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  // The wallpaper window: a live wallpaper draws here, behind the status bar, the launcher and the keyguard.
  const liveLayer = document.createElement('div'); liveLayer.id = 'live-wallpaper'; liveLayer.hidden = true; screen.prepend(liveLayer);
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
    if (id === 'play-store') return '<span class="app-icon"><img src="assets/play-store.svg?v=2" alt=""></span>';
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
  const contactShortcut = (...args) => StoreHost.module('launcher').exports.contactShortcut(storeContext(), ...args);
  function placeContactShortcut(...args) { return StoreHost.module('launcher').exports.placeContactShortcut(storeContext(), ...args); }
  function placeShortcut(...args) { return StoreHost.module('launcher').exports.placeShortcut(storeContext(), ...args); }
  const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="${ui.view === 'settings' && !ui.sub ? 'noop' : 'back'}" aria-label="${ui.view === 'settings' && !ui.sub ? 'Settings' : 'Back'}">${ui.view === 'settings' ? `${ui.sub ? '<img class="up-chevron" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="settings-header-icon" src="assets/settings.png" alt="">` : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
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
    look:{wrong:kind=>JBKeyguard.WRONG[kind],clearMs:JBKeyguard.S.clear,message:({state,remaining})=>JBKeyguard.securityMessage({error:state.error,errorAt:state.errorAt,remaining,owner:data.settings.showOwner?data.settings.ownerInfo:''},key=>i18n.t(key)),renderLock:api=>renderSecureKeyguard(api)}});
  ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);

  function renderStatus(...args) { return StoreHost.module('statusbar').exports.renderStatus(storeContext(), ...args); }
  function renderNav(...args) { return StoreHost.module('statusbar').exports.renderNav(storeContext(), ...args); }
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
    const animations = [...ICSTransitions.play(outgoing, spec.exit, factor), ...ICSTransitions.play(incoming, spec.enter, factor)];
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
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    if(ui.locked)ui.view='lock';
    const outgoing = viewport.firstElementChild;
    screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
    screen.style.background = data.wallpaper === 'custom' && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 'custom' && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('assets/jb-wallpaper_${wallpaperFiles[data.wallpaper] || '01'}.jpg?v=2') center center / cover no-repeat`;
    screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
    renderStatus(); renderNav(); syncLiveWallpaper();
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
    moduleEach('afterRender', null);
    if (ui.ccz && !viewport.querySelector('[data-ccz]')?.isSameNode(ui.ccz.root)) { ui.ccz.destroy(); ui.ccz = null; }
    const cczRoot = viewport.querySelector('[data-ccz]');
    if (cczRoot && !ui.ccz) ui.ccz = {...CurrentsCustomize.attach(cczRoot, cczContext()), root: cczRoot};
  }
  function restoreWidgetScroll(...args) { return StoreHost.module('launcher').exports.restoreWidgetScroll(storeContext(), ...args); }
  function closeRecents(...args) { return StoreHost.module('recents').exports.closeRecents(storeContext(), ...args); }
  /* SearchPanelView: an upward swipe of navbar_search_up_threshhold (40dp) from the navigation bar shows the ring;
     releasing on the assist target starts search (the Google Search app on Google builds, Browser here). */
  // PointerLocationView: the bar at the top follows the primary pointer while the option is on.
  let pointerDownCount = 0;
  screen.addEventListener('pointerdown', event => { pointerDownCount++; if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, true, 1); }, true);
  screen.addEventListener('pointermove', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, event.buttons > 0, 1); }, true);
  window.addEventListener('pointerup', event => { if (data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, false, 1); }, true);
  function lockScreen(...args) { return StoreHost.module('keyguard').exports.lockScreen(storeContext(), ...args); }
  function lockPing(...args) { return StoreHost.module('keyguard').exports.lockPing(storeContext(), ...args); }
  function lockMove(...args) { return StoreHost.module('keyguard').exports.lockMove(storeContext(), ...args); }
  function lockRelease(...args) { return StoreHost.module('keyguard').exports.lockRelease(storeContext(), ...args); }
  function renderDream(...args) { return StoreHost.module('settings').exports.renderDream(storeContext(), ...args); }
  function renderLock(...args) { return StoreHost.module('keyguard').exports.renderLock(storeContext(), ...args); }
  function renderSecureKeyguard(...args) { return StoreHost.module('keyguard').exports.renderSecureKeyguard(storeContext(), ...args); }
  function requestBouncer(...args) { return StoreHost.module('keyguard').exports.requestBouncer(storeContext(), ...args); }
  function afterKeyguardDismiss(...args) { return StoreHost.module('keyguard').exports.afterKeyguardDismiss(storeContext(), ...args); }
  function attachKeyguard(...args) { return StoreHost.module('keyguard').exports.attachKeyguard(storeContext(), ...args); }
  const musicActive = (...args) => StoreHost.module('launcher').exports.musicActive(storeContext(), ...args);
  function digitalClockWidget(...args) { return StoreHost.module('launcher').exports.digitalClockWidget(storeContext(), ...args); }
  const wallpaperChoices = (...args) => StoreHost.module('launcher').exports.wallpaperChoices(storeContext(), ...args);
  function renderHome(...args) { return StoreHost.module('launcher').exports.renderHome(storeContext(), ...args); }
  function renderDrawer(...args) { return StoreHost.module('launcher').exports.renderDrawer(storeContext(), ...args); }
  function stepPhotoStack(...args) { return StoreHost.module('launcher').exports.stepPhotoStack(storeContext(), ...args); }
  function cancelPhotoWidget(...args) { return StoreHost.module('launcher').exports.cancelPhotoWidget(storeContext(), ...args); }
  function renderApp() {
    if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
    switch (ui.view) {
      default: return renderHome();
    }
  }
  function openApp(app, resume = false) {
    if (StoreHost.has(app) && StoreHost.module(app).open?.(storeContext(), resume, app)) return;
    // A capture for Messaging lasts while the Camera is open; Messaging opens on its compose screen, not over it.
    if (!resume) { ui.jbmaCapture = null; ui.camIntent = null; if (app === 'messaging') ui.jbmaScreen = null; }
    // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
    if (!resume) { ui.mmsPrefs = ''; ui.mmsDialog = ''; ui.mapsPrefs = null; ui.mpsDialog = null; ui.yt4Dialog = null; ui.gsPage = ''; ui.gsStack = []; ui.gsDialog = null; ui.hgPage = ''; ui.hgStack = []; ui.hgDialog = ''; ui.paStack = []; ui.paMore = ''; ui.navPick = ''; ui.locResults = null; ui.locSearching = false; }
    if(ui.locked)return;
    if (StoreHost.has(app) && StoreHost.module(app).openUnlocked?.(storeContext(), resume, app)) return;
    if (app === 'google-keyboard') { openApp('settings'); ui.sub = 'language'; render(); return; }
    if (!appNames[app]) return;
    captureRecentView();
    ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
    ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
    render();
    if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
  }
  function appScrollContainer(app) {
    return viewport.querySelector(app === 'play-store' ? '.jbp-scroll' : app === 'messaging' ? '.mms-scroll' : app === 'email' ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : '.app-view') || viewport.firstElementChild;
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
  // Navigation's pickers and Local's search (jb-extra-apps.js): a picked destination drives there as Type destination
  // does; a Local find opens on the map.
  // Currents' Customize and Add editions (currents-customize.js).
  const cczContext = () => ({ui, data, S: key => JBExtraApps.text('currents', key), save, render, toast: message => toast(message)});
  function mrContext(...args) { return StoreHost.module('messenger').exports.mrContext(storeContext(), ...args); }
  // Movie Studio (movie-studio.js): the projects and the editor shell.
  const movieContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('studio', key), save, render, toast: message => toast(message), refuse: () => toast(i18n.t('This feature is not part of the simulator.')), thumb: i => StockApps.thumb(i), addIcon: 'assets/ms-ic_menu_add_clip_normal.png'});
  // Google+ Messenger (plus-messenger.js): Google+ 4.0's conversations, New conversation and settings.
  const messengerContext = () => ({ui, data, t: key => i18n.t(key), S: key => JBExtraApps.text('gplus', key), contacts: data.contacts, now: deviceDate(), locale: i18n.locale(), save, render, toast: message => toast(message), avatar: 'assets/msg-ic_avatar.png', photoIcon: 'assets/gpm-ic_send_photo_holo_light.png', sendIcon: 'assets/gpm-ic_menu_send_holo_light.png', version: '4.0', listMenu: ['Send feedback', 'Settings', 'Help', 'Sign out'], me: i18n.t('Me')});
  function navigateBack() {
    if ((ui.overlay === 'store-host' || !ui.overlay && ui.view.startsWith('store-') && StoreHost.has(ui.view)) && StoreHost.back(storeContext())) return;
    // The screen's module (jb-*.js), open overlay or not: its lines that stood after the overlay closes below check it.
    if (!ui.view.startsWith('store-') && StoreHost.has(ui.view) && StoreHost.module(ui.view).back?.(storeContext())) return;
    if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return; }
    if (ui.overlay) { ui.overlay = ''; render(); return; }
    if (ui.view === 'lock' && ui.kgChallenge?.bouncing()) { ui.kgChallenge.hideBouncer(); return; }
    if (ui.view === 'lock') return;
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
  function removeTask(...args) { return StoreHost.module('recents').exports.removeTask(storeContext(), ...args); }
  function renderOverlay() {
    if (ui.removedTask && ui.overlay !== 'recent') {
      const gone = ui.removedTask; ui.removedTask = null;
      if (ui.view === gone) { ui.view = 'home'; ui.sub = ''; lastScene = {view: 'home', sub: ''}; render(); return; }
    }
    if (moduleHook('overlayEarly', null)) return;
    const closingFolder = overlayRoot.querySelector('.launcher-folder');
    // A module's own overlays (jb-core.js: overlay(c) returns the markup, or true when it drew them itself).
    const moduleOverlay = ui.overlay ? moduleHook('overlay', null) : undefined;
    if (typeof moduleOverlay === 'string') overlayRoot.innerHTML = moduleOverlay;
    else if (moduleOverlay) { /* drawn by the module */ }
    else if (ui.overlay === 'store-host') {
      overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
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
  function clingLayerRoot(...args) { return StoreHost.module('launcher').exports.clingLayerRoot(storeContext(), ...args); }
  function syncClings(...args) { return StoreHost.module('launcher').exports.syncClings(storeContext(), ...args); }




  function syncBrowserState() {
    const tab = ICSBrowserSession.current(ui.browserSession);
    ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
    ui.browserHistory = tab.history; ui.browserIndex = tab.index;
    ui.browserTab = ui.browserSession.active;
    ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
  }
  const restoreChrome = () => ICSBrowserSession.restore(data.chromeSession, [ChromeApp.NTP]);
  function navigateBrowser(...args) { return StoreHost.module('browser').exports.navigateBrowser(storeContext(), ...args); }

  function jbPlayContext(...args) { return StoreHost.module('play-store').exports.jbPlayContext(storeContext(), ...args); }
  function jbPlayGo(...args) { return StoreHost.module('play-store').exports.jbPlayGo(storeContext(), ...args); }
  function contactByPhone(...args) { return StoreHost.module('phone').exports.contactByPhone(storeContext(), ...args); }
  function startPhoneCall(...args) { return StoreHost.module('phone').exports.startPhoneCall(storeContext(), ...args); }
  function messageDraft(...args) { return StoreHost.module('messaging').exports.messageDraft(storeContext(), ...args); }
  function removeRecipientChip(...args) { return StoreHost.module('messaging').exports.removeRecipientChip(storeContext(), ...args); }

  // While Hangouts is in front the Messaging code works on its chat store (data.hangoutChats / hangoutDrafts).
  function hangoutsScope(fn) {
    if (ui.view !== 'hangouts' || hangoutsSwap) return fn();
    hangoutsSwap = {messages: data.messages, messageDrafts: data.messageDrafts};
    data.messages = data.hangoutChats ||= clone(defaultData.hangoutChats); data.messageDrafts = data.hangoutDrafts ||= {};
    let left = false;
    try { const result = fn(); left = ui.view !== 'hangouts'; return result; }
    finally { data.hangoutChats = data.messages; data.hangoutDrafts = data.messageDrafts; data.messages = hangoutsSwap.messages; data.messageDrafts = hangoutsSwap.messageDrafts; hangoutsSwap = null; if (left) { save(); render(); } }
  }
  function openMessageThread(...args) { return StoreHost.module('messaging').exports.openMessageThread(storeContext(), ...args); }
  function galleryWallpaper(...args) { return StoreHost.module('gallery').exports.galleryWallpaper(storeContext(), ...args); }
  function cameraShoot(...args) { return StoreHost.module('gallery').exports.cameraShoot(storeContext(), ...args); }
  const jbmaContext = (...args) => StoreHost.module('messaging').exports.jbmaContext(storeContext(), ...args);
  function cameraIntent(...args) { return StoreHost.module('gallery').exports.cameraIntent(storeContext(), ...args); }
  function jbmaReturn(...args) { return StoreHost.module('messaging').exports.jbmaReturn(storeContext(), ...args); }
  function cameraGallery(...args) { return StoreHost.module('gallery').exports.cameraGallery(storeContext(), ...args); }
  function galleryStep(...args) { return StoreHost.module('gallery').exports.galleryStep(storeContext(), ...args); }

  function calendarMove(...args) { return StoreHost.module('calendar').exports.calendarMove(storeContext(), ...args); }
  function checkReminders(...args) { return StoreHost.module('calendar').exports.checkReminders(storeContext(), ...args); }
  function checkTimers(...args) { return StoreHost.module('clock').exports.checkTimers(storeContext(), ...args); }
  function checkAlarms(...args) { return StoreHost.module('clock').exports.checkAlarms(storeContext(), ...args); }

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
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  const keepMoreContext=()=>({data,ui,t:key=>i18n.t(key),locale:i18n.locale(),account:GmailApp.account,save,render,renderOverlay,saveNote:saveKeepNote,
    sync(){ui.kpScreen='';openApp('settings');ui.kpSyncReturn=true;ui.sub='sync-google';render();},
    website(url){ui.kpScreen='';openApp('chrome');navigateBrowser(url);},
    send(app,spec){ui.kpScreen='';ui.overlay='';renderOverlay();openApp(app);if(app==='gmail')composeGmail();else composeEmail();const draft=(app==='gmail'?data.gmailbox:data.mailbox).find(m=>m.id===ui.emailId);if(draft){draft.body=spec.text;draft.subject=spec.text.split('\n')[0]||'';if(spec.audio)draft.attachment={...clone(spec.audio),kind:'audio',vcard:true};else if(spec.photo)draft.attachment=clone(data.photos.find(p=>p.id===spec.photo));}save();render();}
  });
  function saveKeepNote(...args) { return StoreHost.module('google-search').exports.saveKeepNote(storeContext(), ...args); }
  function tickPlayVideo(...args) { return StoreHost.module('play-music').exports.tickPlayVideo(storeContext(), ...args); }
  setInterval(tickPlayVideo, 1000);
  function composeGmail(...args) { return StoreHost.module('email').exports.composeGmail(storeContext(), ...args); }
  function emailContext(...args) { return StoreHost.module('email').exports.emailContext(storeContext(), ...args); }
  function shareText(...args) { return StoreHost.module('email').exports.shareText(storeContext(), ...args); }
  function shareVcard(...args) { return StoreHost.module('email').exports.shareVcard(storeContext(), ...args); }
  function composeEmail(...args) { return StoreHost.module('email').exports.composeEmail(storeContext(), ...args); }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
    data.mailbox=ICSEmail.restore(null,emailData,[]);ui.music=ICSMusic.restore();ui.musicActive=false;ui.photoStacks={};ui.photoWidgetSetup=null;ui.musicTrack=0;ui.musicPlaying=false;ui.musicPosition=0;
    ui.activeCall=null;ui.sleeping=false;ui.locked=false;ui.vpnConnected=null;ui.calendarMode='Month';ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[];ui.recent=[];ui.recentState={};ui.recentSnapshots={};
    ICSLauncherFolders.initialize(data,apps.map(app=>app[0]));
    ui.browserSession=ICSBrowserSession.restore(null,data.browserHistory);ui.browserOwner='browser';ui.browserSessions={};syncBrowserState();ui.peopleDraft=null;ui.peopleQuery='';ui.peopleTab='all';save();home();
  }
  function clearAppData(id) {
    if(window.StoreHost?.has(id)){StoreHost.module(id).clearData?.(storeContext({clearId: id}));save();}
    ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
  }

  function shadeFullHeight(...args) { return StoreHost.module('shade').exports.shadeFullHeight(storeContext(), ...args); }
  function nextAlarmLabel(...args) { return StoreHost.module('shade').exports.nextAlarmLabel(storeContext(), ...args); }
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }

  let suppressClickUntil = 0;
  function handleClick(event) {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    // The jb-* modules' handlers that stood here, before the keyguard's filter below.
    if (moduleHook('actionEarly', {event}, action, button)) return;
    if(ui.locked){
      // KeyguardHostView: launching from a widget or adding one needs the bouncer first.
      const pending={'kg-add-widget':{type:'add'},'widget-calendar-open':{type:'calendar'},'widget-calendar-event':{type:'calendar',id,date:button.dataset.date}}[action];
      if(pending&&ui.view==='lock'){requestBouncer(pending);return;}
      if(!['back','alarm-dismiss','alarm-snooze','lock-media'].includes(action))return;
    }
    // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
    if ((action.startsWith('sth-') || ui.view.startsWith('store-') && StoreHost.has(ui.view)) && StoreHost.action(action, button, storeContext())) return;
    // The jb-* modules' cases, where they stood in this switch.
    if (moduleHook('action', {event}, action, button)) return;
    switch (action) {
      case 'open-app': {
        const icon = button.closest('.launcher-icon, .drawer-app, .dock-app') || button;
        // Launcher icons start apps with makeScaleUpAnimation; Recents uses makeThumbnailScaleUpAnimation from the thumbnail.
        const source = button.closest('.recent-item') ? button.closest('.recent-item').querySelector('.recent-thumbnail') : ['home', 'drawer'].includes(ui.view) ? icon : null;
        if (source) { const box = source.getBoundingClientRect(), frame = viewport.getBoundingClientRect(), k = frame.width / viewport.offsetWidth || 1; launchFrom = {left: (box.left - frame.left) / k, top: (box.top - frame.top) / k, width: box.width / k, height: box.height / k, recents: !!button.closest('.recent-item')}; }
        openApp(app || id, !!button.closest('.recent-item')); break;
      }
      case 'home': if (ui.view !== 'lock') home(); break;
      case 'back': back(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      // Share on the details page: the chooser, then the target's compose screen with the link (play-store.js).
      // The search box microphones open the image's voice search.
      case 'close-overlay': if (ui.overlay === 'recent') { closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
      // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
      // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
      case 'factory-reset': if (confirm(i18n.t('Reset all local Jelly Bean simulator data?'))) resetSimulator(); break;
      // The Email app's settings (email-prefs.js, from the image's EmailGoogle preference XMLs).
      case 'toast': toast(id); break;
      case 'noop': break;
      // Google, Voice Search, Maps, Keep, YouTube, Google+, Earth, News & Weather, Google Settings
      // Google Settings' GMS pages (gms-settings.js).
      // Maps 6.14: the feature switcher, Places (Local), Layers, Clear map, the zoom controls.
      // Keep 1.0's menus: New note, the note color (cycled through the picker's colors), Archive, the column view, Archived notes.
      // List and picture notes (stock-apps.js keepEditor / keepDialog).
      // News & Weather: Refresh records the time the refresh status shows; Settings, the story page and Share story.
      // Play Music, Play Movies and Play Books
      // Currents' menu: Breaking stories or one edition's stories (jb-extra-apps.js); the panel slides back.
      // Play Books 2.8.91's reader: Contents (TableOfContentsActivity) and the Display options popup (ReaderSettingsController).
      // Chrome menu and New Tab page
      // Share: the Nexus 4 shares a link by SMS in Messaging (Hangouts took over SMS only on KitKat).
      // Clear browsing data: the dialog's ticks, then a short "Please wait…" before the history goes.
      // Hangouts 1.0.2: conversations archive until something newer arrives; the snooze dialog (1–72 hours) shows
      // dnd_list_item.xml's banner until Resume.
      // Calendar's From / To buttons open the datetimepicker at the form's value; Done writes it back and, like
      // EditEventView, moves the end with the start so the event keeps its length.
      // The repeat / reminder spinners (calendar.js): the list opens under the field (a dialog on 5.1) and the pick goes
      // straight into the form's hidden input, as the date and time pickers do.
      // CitiesActivity: the chosen cities are kept in the clock state; the list keeps its place while ticking them.

      // AOSP Music (targetSdkVersion 9): the navigation bar's legacy menu key and the long-press context menus.
      default: break;
    }
  }
  document.addEventListener('click', event => hangoutsScope(() => handleClick(event)));

  function handleSubmit(event) {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
    if (moduleHook('submit', {event, form}, form.dataset.form, values)) return;
    switch (form.dataset.form) {
      default: break;
    }
  }
  document.addEventListener('submit', event => hangoutsScope(() => handleSubmit(event)));
  document.addEventListener('input', event => hangoutsScope(() => handleInput(event)));
  function handleInput(event) {
    if (moduleHook('input', null, event)) return;
  }

  let pointerStart = null, eggTimer = null, dragTimer = null, dragState = null;
  function dragSource(...args) { return StoreHost.module('launcher').exports.dragSource(storeContext(), ...args); }
  function startDrag(...args) { return StoreHost.module('launcher').exports.startDrag(storeContext(), ...args); }
  function moveGhost(...args) { return StoreHost.module('launcher').exports.moveGhost(storeContext(), ...args); }
  /* CellLayout drag outlines: a holo-blue outline marks the cell where the item would land.
     Each outline fades in and out over config_dragOutlineFadeTime (900 ms) to 128/255 alpha, leaving a short trail. */
  const clearDragOutlines = (...args) => StoreHost.module('launcher').exports.clearDragOutlines(storeContext(), ...args);
  function clearFolderDragFeedback(...args) { return StoreHost.module('launcher').exports.clearFolderDragFeedback(storeContext(), ...args); }
  function finishDrag(...args) { return StoreHost.module('launcher').exports.finishDrag(storeContext(), ...args); }
  function setHomePage(...args) { return StoreHost.module('launcher').exports.setHomePage(storeContext(), ...args); }
  function syncLiveWallpaper(...args) { return StoreHost.module('launcher').exports.syncLiveWallpaper(storeContext(), ...args); }
  function moveHomePage(...args) { return StoreHost.module('launcher').exports.moveHomePage(storeContext(), ...args); }
  function finishHomePage(...args) { return StoreHost.module('launcher').exports.finishHomePage(storeContext(), ...args); }
  function finishDrawerPage(...args) { return StoreHost.module('launcher').exports.finishDrawerPage(storeContext(), ...args); }
  screen.addEventListener('dragstart', event => event.preventDefault());
  let homeLongPressTimer = null, messageHoldTimer = null;
  screen.addEventListener('contextmenu', event => {
    if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    const message = event.target.closest('.mms-message');
    if (message && !ui.overlay) { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; renderOverlay(); }
    const musicRow = ui.view === 'music' && !ui.overlay && event.target.closest('[data-music-hold]');
    if (musicRow) { ui.musicHold = musicRow.dataset.musicHold; if (ui.musicHold.startsWith('track:')) ui.musicSelected = Number(ui.musicHold.slice(6)); ui.music.lang = i18n.language; ui.overlay = 'music-context'; renderOverlay(); }
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
    if (last && (now - last.time > 300 || Math.hypot(last.x - x, last.y - y) > dp(47))) magnifyTaps = [];
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
  const activeTouches = new Set();
  window.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') activeTouches.add(event.pointerId); }, true);
  for (const type of ['pointerup', 'pointercancel']) window.addEventListener(type, event => activeTouches.delete(event.pointerId), true);
  screen.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
    const widgetList = ui.view === 'home' && !ui.overlay ? event.target.closest('.calw-list') : null;
    const scrollTarget = widgetList || (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
      ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.jbp-scroll,.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
    pointerStart = { x: event.clientX, y: event.clientY, target: event.target, source: dragSource(event.target), pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0, lockDrag: ui.view === 'lock' && !!event.target.closest('.lock-handle'), shadeDragEligible: !ui.overlay && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'), pageSwipeEligible: ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'), drawerSwipeEligible: ui.view === 'drawer' && !!event.target.closest('.drawer-page') };
    const qsToggle = ui.overlay === 'shade' ? event.target.closest('[data-qs-toggle]') : null;
    if (qsToggle) homeLongPressTimer = setTimeout(() => { const key = qsToggle.dataset.qsToggle; data.settings[key] = !data.settings[key]; if (data.settings[key]) data.settings.airplane = false; if (key === 'wifi' && data.settings.wifi) data.settings.portableHotspot = false; save(); renderStatus(); renderOverlay(); pointerStart = null; suppressReleaseClick(); }, holdDelay(500));
    if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !pointerStart.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); pointerStart = null; suppressReleaseClick(); }, holdDelay(550));
    const message = event.target.closest('.mms-message');
    const musicHold = ui.view === 'music' && !ui.overlay && event.target.closest('[data-music-hold]');
    if (musicHold) messageHoldTimer = setTimeout(() => { ui.musicHold = musicHold.dataset.musicHold; if (ui.musicHold.startsWith('track:')) ui.musicSelected = Number(ui.musicHold.slice(6)); ui.music.lang = i18n.language; ui.overlay = 'music-context'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    if (event.target.closest('.jb-platlogo')) eggTimer = setTimeout(() => { suppressReleaseClick(); document.querySelector('.jb-toast')?.remove(); ui.sub = 'beanbag'; ui.jbLogoTapped = false; render(); }, 500);
    if (ui.view === 'home' && !ui.overlay) pointerStart.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
    if (pointerStart.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), holdDelay(440));
  });
  window.addEventListener('pointermove', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    if (dragState) { moveGhost(event.clientX, event.clientY); return; }
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (Math.hypot(dx,dy) > dp(9)) { clearTimeout(homeLongPressTimer); clearTimeout(messageHoldTimer); }
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
    // The modules' gestures (jb-core.js: pointerMove / pointerUp), where the apps' branches stood.
    if (moduleHook('pointerMove', null, event, pointerStart, dx, dy)) return;
    if (pointerStart.lockDrag) { event.preventDefault(); pointerStart.lockActive = lockMove(dx, dy); return; }
    if (pointerStart.shadeDragging || pointerStart.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || pointerStart.shadeCloseEligible && dy < -dp(9) && -dy > Math.abs(dx)) {
      if (!pointerStart.shadeDragging) { pointerStart.shadeDragging = true; if (ui.overlay !== 'shade') ui.shadeSettings = activeTouches.size >= 2; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
      event.preventDefault();
      const shade = overlayRoot.querySelector('.notification-shade');
      if (shade) {
        shade.style.animation = 'none';
        shade.style.bottom = 'auto';
        // The panel follows the finger; released, it opens fully to the navigation bar (handled below).
        const full = shadeFullHeight(shade), max = screen.clientHeight - shade.offsetTop - navRoot.offsetHeight;
        shade.style.height = `${Math.max(dp(91.5923), Math.min(max, pointerStart.shadeCloseEligible ? full + dy : dy))}px`;
        overlayRoot.querySelector('.jb-shade-scrim')?.style.setProperty('opacity', String(Math.min(1, shade.offsetHeight / full)));
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
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    if (moduleHook('pointerUp', null, event, pointerStart, dx, dy)) { pointerStart = null; return; }
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
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
        if (shade) { const height = shade.clientHeight, full = shadeFullHeight(shade); shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); overlayRoot.querySelector('.jb-shade-scrim')?.style.removeProperty('opacity'); shade.animate([{height:`${height}px`},{height:`${full}px`}], {duration:180,easing:'ease-out'}); }
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
  window.addEventListener('pointercancel', () => { clearTimeout(messageHoldTimer); clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = ''; const lockHandle = viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); if (pointerStart?.shadeDragging || ui.overlay === 'recent' || ui.overlay === 'shade' || ui.overlay === 'folder') renderOverlay(); pointerStart = null; });
  document.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && event.target.name === 'recipient' && !event.target.value && event.target.closest('.mms-compose') && messageDraft().chip) { event.preventDefault(); removeRecipientChip(); return; }
    const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
    if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return; }
    if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
    if (StoreHost.has(ui.view) && StoreHost.key(event, storeContext())) return;
    if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
    else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

  });
  function powerKey(...args) { return StoreHost.module('power').exports.powerKey(storeContext(), ...args); }
  function powerHold(...args) { return StoreHost.module('power').exports.powerHold(storeContext(), ...args); }
  for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', powerKey); GlobalActions.hold(key, powerHold); }
  function coldBoot(...args) { return StoreHost.module('power').exports.coldBoot(storeContext(), ...args); }
  // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
  const volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; screen.append(volumeLayer);
  function hideVolume(...args) { return StoreHost.module('volume').exports.hideVolume(storeContext(), ...args); }
  document.addEventListener('pointerdown', event => { if (volumeLayer.firstElementChild && !volumeLayer.contains(event.target) && !event.target.closest?.('.volume-key,.volume-rocker')) hideVolume(); }, true);
  function bindVolumeKey(...args) { return StoreHost.module('volume').exports.bindVolumeKey(storeContext(), ...args); }
  bindVolumeKey(document.querySelector('#volume-down'), -1);
  bindVolumeKey(document.querySelector('#volume-up'), 1);
  bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
  const powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; screen.append(powerLayer);
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
    if (!confirm(i18n.t('Reset all local Jelly Bean simulator data?'))) return;
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
      if(state)state.textContent=i18n.t(dialing?'Calling…':ui.activeCall.hold?'On hold':'In call');
    }
    checkAlarms(now);
    checkTimers();
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

  // Once, before the first render: the modules' own listeners (init(make, c); make() gives a fresh context later).
  moduleEach('init', null, storeContext);
  i18n.translateDOM(document.body);
  render();
  coldBoot();
})();
