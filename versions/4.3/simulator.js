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
  const moduleApi = {get A11Y() { return A11Y; }, get HOLD_NAMES() { return HOLD_NAMES; }, get PLAY_APPS() { return PLAY_APPS; }, get addNotification() { return addNotification; }, get appIcon() { return appIcon; }, get appNames() { return appNames; }, get appView() { return appView; }, get applyMagnification() { return applyMagnification; }, get apps() { return apps; }, get back() { return back; }, get cameraIntent() { return cameraIntent; }, get cameraShoot() { return cameraShoot; }, get captureRecentView() { return captureRecentView; }, get carrierName() { return carrierName; }, get cczContext() { return cczContext; }, get clearAppData() { return clearAppData; }, get clock() { return clock; }, get clone() { return clone; }, get composeEmail() { return composeEmail; }, get composeGmail() { return composeGmail; }, get connectivityRow() { return connectivityRow; }, get connectivitySwitch() { return connectivitySwitch; }, get contact() { return contact; }, get contactByPhone() { return contactByPhone; }, get content() { return content; }, get data() { return data; }, get defaultData() { return defaultData; }, get deviceDate() { return deviceDate; }, get digitalClockWidget() { return digitalClockWidget; }, get dp() { return dp; }, get emailContext() { return emailContext; }, get emailData() { return emailData; }, get fullDate() { return fullDate; }, get hangoutsScope() { return hangoutsScope; }, get hangoutsSwap() { return hangoutsSwap; }, set hangoutsSwap(v) { hangoutsSwap = v; }, get home() { return home; }, get i18n() { return i18n; }, get jbmaContext() { return jbmaContext; }, get jbmaReturn() { return jbmaReturn; }, get keepMoreContext() { return keepMoreContext; }, get label() { return label; }, get lastActivity() { return lastActivity; }, set lastActivity(v) { lastActivity = v; }, get lockControls() { return lockControls; }, get lockScreen() { return lockScreen; }, get messageDraft() { return messageDraft; }, get messengerContext() { return messengerContext; }, get movieContext() { return movieContext; }, get mrContext() { return mrContext; }, get musicActive() { return musicActive; }, get navRoot() { return navRoot; }, get navigateBack() { return navigateBack; }, get navigateBrowser() { return navigateBrowser; }, get nextAlarmLabel() { return nextAlarmLabel; }, get openApp() { return openApp; }, get openMessageThread() { return openMessageThread; }, get overlayRoot() { return overlayRoot; }, get placeContactShortcut() { return placeContactShortcut; }, get pointerStart() { return pointerStart; }, set pointerStart(v) { pointerStart = v; }, get powerLayer() { return powerLayer; }, get prefRow() { return prefRow; }, get reducedMotion() { return reducedMotion; }, get render() { return render; }, get renderOverlay() { return renderOverlay; }, get renderStatus() { return renderStatus; }, get restoreChrome() { return restoreChrome; }, get row() { return row; }, get safe() { return safe; }, get save() { return save; }, get saveMusic() { return saveMusic; }, get screen() { return screen; }, get shareText() { return shareText; }, get shareVcard() { return shareVcard; }, get startPhoneCall() { return startPhoneCall; }, get statusRoot() { return statusRoot; }, get storeAppsSync() { return storeAppsSync; }, get storeContext() { return storeContext; }, get storeInstalled() { return storeInstalled; }, get storeUninstall() { return storeUninstall; }, get suppressClickUntil() { return suppressClickUntil; }, set suppressClickUntil(v) { suppressClickUntil = v; }, get syncBrowserState() { return syncBrowserState; }, get toast() { return toast; }, get today() { return today; }, get toggleRow() { return toggleRow; }, get tracks() { return tracks; }, get ui() { return ui; }, get viewport() { return viewport; }, get volumeLayer() { return volumeLayer; }, get wallpaperChoices() { return wallpaperChoices; }, get wifiNetworks() { return wifiNetworks; }, get wirelessCheckRow() { return wirelessCheckRow; }, get wirelessRow() { return wirelessRow; }};
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
  const folderName=id=>ICSLauncherFolders.folder(data,id)?.name||i18n.t('Unnamed folder');
  /* Contacts' Place on Home screen: an INSTALL_SHORTCUT whose shortcut opens the contact (QuickContact), its photo or
     the image's contact picture as the icon, the name as the label. Launcher2's InstallShortcutReceiver tries the default screen, then the screens beside it outwards, the first free cell of each; none free gives out_of_space; the toast names it (shortcut_installed). */
  const contactShortcut = id => String(id).startsWith('contact:') ? data.contacts.find(p => p.id === Number(String(id).slice(8))) || {name: ''} : null;
  const VCARD = key => { const row = window.StockStrings?.vcard?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
  function placeContactShortcut(person) { if (person) placeShortcut(`contact:${person.id}`, person.name); }
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
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
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
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type) {
    if (type === 'analog') return analogClock();
    if (type === 'digitalclock') return '<img class="widget-preview-image" src="assets/jbclock-appwidget_digital_clock_preview.png" alt="">';
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return '<img class="widget-preview-image" src="assets/calwidget-calendar_widget_preview.png" alt="">';
    if (type === 'ears') return '<img class="widget-preview-image" src="assets/ears-ears_widget_preview.png" alt="">';
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    if (type === 'music') return ICSWidgets.music(ui.music, tracks, false, key => i18n.t(key), true);
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  /* Play Recommendations (rec_widget_base / rec_widget_double): two cards side by side, each under its corpus's 3 dp
     colour strip, with the item's art, title and creator; a tap opens the item in Play Store. */
  function playRecommendations() {
    const items = JBPlay.all().filter(item => ['apps', 'games'].includes(item.kind) && item.developer !== 'Android Demo').slice(0, 2);
    const color = kind => (JBPlay.SECTIONS.find(section => section[0] === kind) || [])[3] || '#96aa39';
    return `<div class="jbw-play">${items.map(item => `<button class="jbw-play-card" data-action="widget-play-item" data-id="${safe(item.id)}" style="--corpus:${color(item.kind)}"><span class="jbw-play-art">${JBPlay.art(item, 'jbw-play-icon')}</span><span class="jbw-play-copy"><b>${safe(item.name)}</b><small>${safe(item.developer)}</small></span></button>`).join('')}</div>`;
  }
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
    if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
    if (widget.type === 'digitalclock') return digitalClockWidget();
    if (widget.type === 'play-recommended') return playRecommendations();
    if (widget.type === 'ears') return Ears.widget(ui.ears, i18n.language);
    return null;
  }
  /* DeskClock 4.3 digital_appwidget / digital_widget_time: bold sans-serif hours and thin minutes (widget_big_font_size
     80dp, scaled down when the widget is narrower than 160dp), then the condensed bold date and the grey next alarm. */
  function digitalClockWidget(tag = 'button') {
    const now = deviceDate(), alarm = nextAlarmLabel(), hour24 = !!data.settings.hour24;
    const hours = hour24 ? String(now.getHours()).padStart(2, '0') : String(now.getHours() % 12 || 12), minutes = `:${String(now.getMinutes()).padStart(2, '0')}`;
    const attrs = tag === 'button' ? ' data-action="open-app" data-app="clock"' : '';
    return `<${tag} class="jbw-digital"${attrs} aria-label="${safe(clock())}"><span class="jbw-digital-time" aria-hidden="true"><b>${safe(hours)}</b><i>${safe(minutes)}</i></span><span class="jbw-digital-date"><span>${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}))}</span>${alarm ? `<span class="jbw-digital-alarm"><img src="assets/jbclock-ic_alarm_small.png" alt="">${safe(alarm)}</span>` : ''}</span></${tag}>`;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    const frame = ui.resizeWidget === widget.id && spec.resize ? `<div class="jb-resize-frame" data-resize-frame>${['left', 'top', 'right', 'bottom'].map(edge => `<button class="jb-resize-handle jb-resize-${edge}" data-resize-edge="${edge}" aria-label="${safe(i18n.t('Resize'))}"><img src="assets/jb-widget_resize_handle_${edge}.png" alt=""></button>`).join('')}</div>` : '';
    return `<div class="home-widget widget-${widget.type}${frame ? ' resizing' : ''}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}${frame}</div>`;
  };
  const wallpaperChoices = () => `<div class="wallpaper-grid">${wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(i18n.t('Wallpaper'))} ${i + 1}"><span class="wallpaper-swatch" style="background-image:url('assets/jb-wallpaper_${name}_small.jpg?v=2')"></span></button>`).join('')}</div>`;
  function renderHome() {
    return `<div class="home-view"><div class="home-search"><button data-action="browser-search" aria-label="Search"><span class="google-word">Google</span></button><button class="voice-search" data-action="voice-search" aria-label="Voice search"><img class="search-microphone" src="assets/launcher-ic_home_voice_search_holo.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" ${index !== ui.page ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${data.homeWidgets[index].map(homeWidget).join('')}</div>`).join('')}</div></div><div class="page-indicators">${Array.from({ length: 5 }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}"></button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/launcher-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/launcher-ic_launcher_clear_active_holo.png" alt=""><span>Remove</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/launcher-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/launcher-ic_launcher_info_active_holo.png" alt=""><span>App info</span></div></div></div>`;
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
  viewport.addEventListener('click', event => {
    if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
    const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
  });
  function renderApp() {
    if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
    switch (ui.view) {
      case 'wallpaper-picker': return `<div class="app-view wallpaper-picker"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>Wallpapers</h2></div><div class="app-content dark">${wallpaperChoices()}</div></div>`;
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
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
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
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if (ui.overlay === 'wallpaper-source') {
      overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3>${[['gallery-wallpaper', 'Gallery'], ['open-live-wallpapers', 'Live Wallpapers'], ['open-wallpapers', 'Wallpapers']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1]))).map(([action, label]) => `<button data-action="${action}" data-no-translate>${safe(i18n.t(label))}</button>`).join('')}</div>`;
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
    if (hand) { hand.style.left = `${point[0] + LauncherClings.HAND_OFFSET}px`; hand.style.top = `${point[1] + LauncherClings.HAND_OFFSET}px`; }
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
    return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:calc(${((columns*74+24)/.8516).toFixed(4)} * var(--dp));--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="Unnamed folder" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
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
      case 'drawer': if (data.clings && !data.clings.workspace) { data.clings.workspace = true; save(); } ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
      case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`)); break;
      case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
      case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
      case 'drawer-page': ui.drawerPage = Number(id); render(); break;
      case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
      case 'widget-play-item': openApp('play-store'); jbPlayGo({page: 'detail', selected: id}); break;
      case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
      case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
      case 'widget-music-open': { const active = musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
      case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
      case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
      case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
      case 'widget-photo-cancel': cancelPhotoWidget(); break;
      case 'open-wallpapers': ui.overlay = ''; ui.view = 'wallpaper-picker'; render(); break;
      case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
      // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
      // Share on the details page: the chooser, then the target's compose screen with the link (play-store.js).
      case 'page': setHomePage(Number(id)); break;
      case 'power-toggle':
        if (id === 'brightness') data.settings.brightness = data.settings.brightness < 30 ? 55 : data.settings.brightness < 80 ? 100 : 20;
        else data.settings[id] = !data.settings[id];
        if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
        if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
        save(); render(); break;
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      // The search box microphones open the image's voice search.
      case 'close-overlay': if (ui.overlay === 'recent') { closeRecents(); break; } ui.overlay = ''; renderOverlay(); break;
      // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
      // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
      case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
      case 'factory-reset': if (confirm(i18n.t('Reset all local Jelly Bean simulator data?'))) resetSimulator(); break;
      // The Email app's settings (email-prefs.js, from the image's EmailGoogle preference XMLs).
      case 'toast': toast(id); break;
      case 'open-contact': { const person = data.contacts.find(p => p.id === Number(id)); openApp('people'); if (person) { ui.selectedContact = person.id; ui.sub = 'detail'; render(); } break; }
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
    if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return;}
    if (moduleHook('submit', {event, form}, form.dataset.form, values)) return;
    switch (form.dataset.form) {
      default: break;
    }
  }
  document.addEventListener('submit', event => hangoutsScope(() => handleSubmit(event)));
  document.addEventListener('input', event => hangoutsScope(() => handleInput(event)));
  function handleInput(event) {
    if (moduleHook('input', null, event)) return;
    if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return;}
  }

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
      const column = Math.round((x - rect.left - 6 - source.grabOffset.x) / ((rect.width - 12) / 4)), row = Math.round((y - rect.top - 5 - source.grabOffset.y) / ((rect.height - 5) / 4));
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
      const covered = data.homeWidgets[ui.page].some(widget => index % 4 >= widget.x && index % 4 < widget.x + widgetSize(widget).width && Math.floor(index / 4) >= widget.y && Math.floor(index / 4) < widget.y + widgetSize(widget).height);
      if (!occupant && !covered) { clearReorder(); return outline; }
      // Near an icon's centre the drop makes or fills a folder; elsewhere the occupant moves aside.
      if (occupant) { const box = occupant.querySelector('.app-icon')?.getBoundingClientRect(); if (box && JBLauncher.folderZone({x, y}, {x: box.left + box.width / 2, y: box.top + box.height / 2}, box.width)) { clearReorder(); return null; } }
      if (ICSLauncherFolders.folder(data, source.id) && occupant?.dataset.folderId) return null;
      const movingKey = source.type === 'home' && source.page === ui.page ? `s${source.slot}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: index % 4, y: Math.floor(index / 4), w: 1, h: 1}};
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
      if (sameIcon) { const slot = committed.moving.y * 4 + committed.moving.x; data.homePages[ui.page][slot] = source.id; homeSlot = null; destination = {type: 'home', page: ui.page, slot}; source.reorderHandled = true; }
    }
    if (source.reorderHandled) { /* placed above */ }
    else if (source.widgetType) {
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
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearTimeout(source.wsReorderTimer);clearFolderDragFeedback();
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
    const visible = !!id && (preview || (ui.view === 'settings' && ['easter','beanbag'].includes(ui.sub)) || ['home', 'lock'].includes(ui.view)) && !ui.sleeping && !ui.power;
    const key = id ? `${id}:${preview}` : '';
    if (liveWallpaper && liveWallpaper.key !== key) { liveWallpaper.destroy(); liveWallpaper = null; }
    if (key && !liveWallpaper) {
      liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : ui.page / 4, audio: () => !!ui.music?.playing, deviceWidth: 768});
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
