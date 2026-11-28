/* Android 2.3.6 (Nexus S, GRK39F): the core. Logic only, nothing of a look (docs/plans/engine-migration.md):
   - the saved state (AndroidState, key android-time-machine-gb-v1) and the on-screen state (ui, never saved)
   - the screens: ui.view is the open screen ('home', 'lock', 'drawer', an app), ui.sub its page, ui.overlay a dialog,
     a menu or a panel; ui.gbPrefs an app's settings screen drawn over its view
   - one click handler: data-action="name" goes to the screen in front, then to the core's own actions, then to the
     module that has the action (an ongoing call in the shade); forms, fields and keys go to the screen in front
   - the keys: Back, Menu, Search, Home (held: recent apps; gb-system.js), power (held: the phone options) and volume
   - the site controls around the phone: language, full screen, reset
   Every screen, and the system UI, is a module that registers itself (the module host is store-apps/legacy-host.js,
   which the store's apps share):
     GB.register(id, {render(c), mount(c, root), action(name, el, c), submit(name, values, c), input(event, c),
                      key(event, c), back(c), menu(c), dialog(kind, c), overlay(c, root), open(c, resume), tick(c),
                      init(c), clearData(c)})
   render() returns the screen's HTML; the other hooks are optional and return true when they handled the event. The
   context c (storeContext below) carries the state and the core's helpers: {data, ui, save, render, renderOverlay,
   toast, openApp, home, back, safe, lang, locale, t, screen, viewport, overlayRoot, statusRoot, navRoot, dp(n),
   deviceDate(), today(), clock(), defaults, clone, suppressClick(ms), suppressRelease(), snapResting(el), live(), intent,
   ...}, plus c.dialog(spec) and c.menu(items) (the host's), c.gbDialog(kind) (2.3.6's AlertDialog from the module's
   dialog(kind, c)) and c.gbMenu(items) (the Menu key's IconMenu). */
window.GB = window.StoreHost;

// A long press (550 ms, ViewConfiguration's long-press timeout) or a right click on an element of the screen opens
// its context menu: open(el) runs and the release does not also tap the element. The listeners go on the screen's own
// element (root's first child, drawn anew by every render), so they leave with it. Options: rightClick false (no right
// click), when(el) (the press counts only while it is true).
GB.hold = (c, root, selector, open, {rightClick = true, when = () => true} = {}) => {
  root = root.firstElementChild || root;
  let timer = null, start = null;
  root.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    const el = event.target.closest(selector); if (!el || c.ui.overlay || !when(el)) return;
    start = {x: event.clientX, y: event.clientY};
    timer = setTimeout(() => { c.suppressRelease(); open(el); }, 550);
  });
  root.addEventListener('pointermove', event => { if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) clearTimeout(timer); });
  for (const name of ['pointerup', 'pointercancel']) root.addEventListener(name, () => { clearTimeout(timer); start = null; });
  if (rightClick) root.addEventListener('contextmenu', event => { const el = event.target.closest(selector); if (el && !c.ui.overlay) open(el); });
};

// A drag on the screen's own element (a swipe between days or pictures): the press (left button or touch) starts a
// gesture {x, y, id, target, el}; move(g, event, dx, dy) and end(g, event, dx, dy) follow it, cancel(g) ends it when the
// browser takes the pointer. g.capture(event) keeps the pointer's events on the screen once the gesture is the screen's.
GB.gesture = (root, {move, end, cancel}) => {
  const el = root.firstElementChild || root;
  let g = null;
  el.addEventListener('pointerdown', event => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    g = {x: event.clientX, y: event.clientY, id: event.pointerId, target: event.target, el, capture: e => { try { el.setPointerCapture(e.pointerId); } catch {} }};
  });
  el.addEventListener('pointermove', event => { if (g && event.pointerId === g.id) move?.(g, event, event.clientX - g.x, event.clientY - g.y); });
  el.addEventListener('pointerup', event => { if (!g || event.pointerId !== g.id) return; const done = g; g = null; end?.(done, event, event.clientX - done.x, event.clientY - done.y); });
  el.addEventListener('pointercancel', () => { const done = g; g = null; cancel?.(done); });
};

(() => {
  'use strict';
  function start() {
    // ---- The saved state (AndroidState, key android-time-machine-gb-v1; the modules' fields are in defaultData) and the
    // on-screen state (ui, never saved). The apps of the launcher, and the store's installed apps among them.
    const i18n = window.AndroidI18n;
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
    const iconAssets = new Set(['car-home', 'google-voice', 'tags', 'voice-dialer', 'gmail', 'maps', 'navigation', 'places', 'latitude', 'talk', 'youtube', 'news-weather', 'books', 'earth', 'voice-search', 'phone', 'people', 'messaging', 'browser', 'camera', 'gallery', 'settings', 'clock', 'calendar', 'calculator', 'music', 'email', 'apps', 'search', 'downloads']);
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
    // ---- The screen's elements and what every screen shares: the device clock (Settings › Date & time), the apps' icons,
    // the toast, the notifications
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
    // Clock.java: twelve_hour_time_format h:mm a with AM_PM_STYLE_GONE, or H:mm.
    const gbClock = () => { const now = deviceDate(), h = now.getHours(), m = String(now.getMinutes()).padStart(2, '0'); return `${data.settings.hour24 ? h : h % 12 || 12}:${m}`; };
    // The lock screen's date (full_wday_month_day_no_year), which the pattern and password screens show too.
    const gbLockDate = () => deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'});
    const contact = id => data.contacts.find(item => item.id === Number(id));
    function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
    // A contact's photo as the people screens draw it: a Gallery picture or one the Camera took for the contact.
    window.GBContactPhoto = person => { const photo = person?.photo && (data.photos.find(p => p.id === person.photo) || (data.contactPhotos || []).find(p => p.id === person.photo)); return photo ? ICSMedia.image(photo) : ''; };
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
    const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
    function toast(message) {
      document.querySelector('.toast')?.remove();
      const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
      screen.append(element);
      clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
    }
    function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
    function blinkTips(times) {
      let delay = 0;
      for (const [icon, wait] of GBLauncher.blinkFrames(times)) { setTimeout(() => { ui.tipsIcon = icon; if (ui.view === 'home') { const img = viewport.querySelector('.gbtips-droid img'); if (img) img.src = `assets/gb-tips-${icon}.png`; } }, delay); delay += wait; }
    }
    // ---- The keyguard (lockscreen.js: the pattern and password screens; gb-keyguard.js draws the lock screen)
    const lockControls=ICSLockscreen.controller({getData:()=>data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>data.settings.airplane?i18n.t('No service.'):data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;ui.gbPasswordEntry=false;home(false);},gb:()=>({...GBKeyguard.time(deviceDate(),!!data.settings.hour24),date:gbLockDate()})});
    ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
    function lockScreen(){captureRecentView();lockControls.lock();ui.locked=ICSLockscreen.secure(data);ui.gbPasswordEntry=false;ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
    // ---- The context c every module hook gets (store-apps/legacy-host.js adds c.dialog and c.menu), the module in front, and
    // what one app asks of another (a page, a message, a call, a capture)
    // Gingerbread's own AlertDialog (GBUI.dialog) and the Menu key's IconMenu (GBUI.menu) for the store apps.
    function storeContext() {
      return StoreHost.context({data, ui, save, render, renderOverlay, toast, openApp, screen, viewport, dp, snapResting, suppressClick: ms => { suppressClickUntil = Date.now() + ms; },
        // 2.3.6's own AlertDialog (a spec the module's dialog(kind, c) returns) and the Menu key's IconMenu items.
        saveMusic, deviceDate, today, home, cancelPhotoWidget, composeEmail, messageDraft, gapp: () => gappContext(), gbCapture, gbmaCancel, gbmaReturn, gbceReturn, back, contact, contactByPhone, captureRecentView, appName: id => appNames[id] || id, startPhoneCall, editPerson, clock, blinkTips, renderStatus, apps, appNames, appIcon, carrierName, gbClock, lockControls, navigateBrowser, clearAppData, resetSimulator, storeUninstall, storeInstalled, storeAppsSync, wallpaperFiles, reducedMotion, lockDate: gbLockDate, fullDate, launcherIcon, folderName, renderWebsite, openSearch, snapResting, tweenWallpaperOffset, liveWallpaper: () => liveWallpaper, pressing: () => !!pointerStart, live: () => storeContext(), statusRoot, navRoot, lockScreen, noteActivity: () => { lastActivity = Date.now(); }, defaults: defaultData, clone, overlayRoot, suppressRelease: () => suppressReleaseClick(),
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
    // A Google app (gb-apps.js) still takes its own clicks, forms and mount behind its settings screen (Earth's About,
    // Voice's Background data).
    const googleBehindPrefs = () => prefsOpen() && StoreHost.module(ui.view)?.google ? StoreHost.module(ui.view) : null;
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
    // The status bar (gb-system.js).
    function renderStatus() { GB.module('statusbar').render(storeContext()); }
    // The notification shade (gb-system.js) closes with its fling.
    function closeShade() { GB.module('shade').close(storeContext()); }
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
    // Launcher (gb-launcher.js): leaving the Gallery's picker without a picture drops the Picture frame being added.
    function cancelPhotoWidget() { GB.module('home').cancelPhotoWidget(storeContext()); }
    // Music's playback (gb-music.js: MediaPlaybackService) keeps its state in the save.
    function saveMusic() { GB.module('music').save(storeContext()); }
    // MessageCompose with a new draft (a reply, a forward, an address): Email's (gb-email.js).
    function composeEmail(...args) { GB.module('email').compose(storeContext(), ...args); }
    // ---- render / renderOverlay: the screen in front (its module, or the app settings over it) with the window transition,
    // the wallpaper, the keys, and the overlay (a module's dialog, menu or panel)
    // Window transitions: the outgoing view is kept in a temporary layer while both animate.
    let lastScene = null, pendingNav = '', activeTransition = null;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
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
      viewport.innerHTML = renderApp();
      if (moduleView()) StoreHost.mount(ui.view, storeContext(), viewport);
      else googleBehindPrefs()?.mount(storeContext(), viewport);
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
    function renderApp() {
      if (prefsOpen()) return GB.module('prefs').render(storeContext());
      if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
      switch (ui.view) {
        default: return GB.module('home').render(storeContext());
      }
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
    viewport.addEventListener('click', event => {
      if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
      const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
    });
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
    // The 2.3.6 AlertDialog (GBUI.dialog) of the overlay: its module's spec.
    function gbDialogSpec() {
      if (['gb-dialog-add', 'gb-dialog-shortcuts', 'gb-dialog-widgets', 'gb-dialog-folders', 'gb-dialog-rename', 'gb-dialog-wallpaper'].includes(ui.overlay)) return GB.module('home').dialog(ui.overlay.slice(10), storeContext());
      if (ui.overlay === 'gb-dialog-emsetup') return GB.module('email').dialog('setup:' + ui.gbEmSetupDialog, storeContext());
      if (ui.overlay === 'gb-dialog-pref') return GB.module('prefs').dialog(ui.gbPrefDialog, storeContext()) || {title: '', items: []};
      if (ui.overlay === 'gb-dialog-module') return StoreHost.module(ui.view)?.dialog?.(ui.gbModuleDialog, storeContext()) || {title: '', items: []};
      if (ui.overlay === 'gb-dialog-gbmk') return GB.module('play-store').dialog(ui.gbmkDialog, storeContext()) || {title: '', items: []};
      if (ui.overlay === 'gb-dialog-clearlog' || ui.overlay === 'gb-dialog-gbct' || ui.overlay === 'gb-dialog-ce') return GB.module('people').dialog(ui.overlay.slice(10), storeContext()) || {title: '', items: []};
      if (ui.overlay.startsWith('gb-dialog-lw-')) return GB.module('live-wallpapers').dialog(ui.overlay.slice(13), storeContext());
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
      return {title: '', items: []};
    }
    function renderOverlay() { renderOverlayBase(); gingerbreadMenu(); if (ui.overlay === 'gb-dialog-net') GBNetwork.wire(overlayRoot, gbNetContext()); }
    function renderOverlayBase() {
      const closingFolder = overlayRoot.querySelector('.launcher-folder');
      if (['gb-previews', 'gb-menu-home', 'wallpaper-source', 'folder'].includes(ui.overlay)) {
        GB.module('home').overlay(storeContext(), overlayRoot);
      } else if (ui.overlay === 'store-host') {
        overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
      } else if (ui.overlay === 'gb-menu-settings') {
        overlayRoot.innerHTML = GBUI.menu(ui.gbMenuItems || [], key => i18n.t(key));
      } else if (ui.overlay === 'gb-menu-more') {
        overlayRoot.innerHTML = GBUI.expanded(ui.gbMenuItems || [], key => i18n.t(key));
      } else if (ui.overlay.startsWith('gb-dialog')) {
        overlayRoot.innerHTML = GBUI.dialog({...gbDialogSpec(), t: key => i18n.t(key)});
      } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
        overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale());
      } else if (ui.overlay === 'shade') {
        GB.module('shade').overlay(storeContext(), overlayRoot);
      } else if (ui.overlay === 'recent') {
        overlayRoot.innerHTML = GB.module('recents').overlay(storeContext());
      } else if (ui.overlay === 'power-menu' || ui.overlay === 'power-confirm' || ui.overlay === 'power-progress') {
        overlayRoot.innerHTML = GB.module('power').overlay(storeContext());
      } else if (ui.overlay === 'clock-ringing' && ui.ringingAlarm) {
        overlayRoot.innerHTML = GB.module('alarm').overlay(storeContext());
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
      } else overlayRoot.innerHTML = '';
      i18n.translateDOM(overlayRoot);
      GB.module('home').afterOverlay(storeContext(), closingFolder);
    }
    // ---- open / home / back, the Menu and Search keys, Settings › Apps › Clear data and the factory reset
    function openApp(app, resume = false) {
      if(ui.locked)return;
      if (!appNames[app]) return;
      // A capture for Messaging lasts while the Camera is open; Messaging opens on its compose screen, not over it.
      if (!resume) { ui.gbmaCapture = null; ui.gbceCapture = null; if (app === 'messaging') ui.gbmaScreen = null; }
      captureRecentView();
      ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; if (!resume) { ui.gbPrefs = null; ui.gbCalSel = null; ui.gbEmSetup = null; } ui.overlay = ''; if (app === 'settings' && !resume) ui.settingsRootScroll = 0;
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
      // The password screen returns to the lock screen, over a dialog too (a ringing alarm).
      if (ui.view === 'lock' && GB.module('lock').back(storeContext())) return;
      if (prefsOpen() && !ui.overlay && GB.module('prefs').back(storeContext())) return;
      if (ui.overlay === 'shade') { closeShade(); return; }
      if (ui.overlay) { ui.overlay = ''; render(); return; }
      if (ui.view === 'lock') return;
      if (ui.sub) { ui.sub = ''; render(); return; }
      home(false);
    }
    // The Menu key toggles the current screen's options panel; screens without a menu ignore it.
    function menuKey() {
      if (ui.overlay.startsWith('gb-menu') || overlayRoot.querySelector('.gbmenu')) { closeGBMenu(); return; }
      if (ui.overlay === 'shade') return;
      if (moduleView()) { StoreHost.menuKey(storeContext()); return; }
      if (prefsOpen()) { GB.module('prefs').menu(storeContext()); return; }
      const button = [...viewport.querySelectorAll('[data-action$="-menu"]')].find(node => !node.disabled);
      button?.click();
    }
    function closeGBMenu() {
      const panel = overlayRoot.querySelector('.gbmenu');
      if (!panel || reducedMotion?.matches) { ui.overlay = ''; renderOverlay(); return; }
      panel.classList.add('closing');
      setTimeout(() => { if (overlayRoot.contains(panel)) { ui.overlay = ''; renderOverlay(); } }, 150);
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
    // PowerManagerService: user activity turns the button backlight on; it goes off LONG_KEYLIGHT_DELAY (6 s) later.
    let keylightTimer = 0;
    function pokeKeylight() {
      if (ui.sleeping) return;
      navRoot.classList.add('lit'); clearTimeout(keylightTimer);
      keylightTimer = setTimeout(() => navRoot.classList.remove('lit'), 6000);
    }
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
    // ---- Clicks, forms, fields and keys go to the screen in front, then to the core's own actions, then to the module that
    // has them (the shade's ongoing call); the touches the core keeps (an app list's mouse scrolling, waking the screen)
    let suppressClickUntil = 0;
    // A long press opens a dialog under the finger; the release must not activate it (Android ignores it too).
    function suppressReleaseClick() {
      suppressClickUntil = Infinity;
      window.addEventListener('pointerup', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
      window.addEventListener('pointercancel', () => { suppressClickUntil = Date.now() + 350; }, {once: true, capture: true});
    }
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-action]');
      if (!button || !screen.contains(button) && !navRoot.contains(button)) return;
      event.preventDefault();
      if (Date.now() < suppressClickUntil) return;
      const { action, id, app, url } = button.dataset;
      if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
      // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
      if ((action.startsWith('sth-') || moduleView()) && StoreHost.action(action, button, storeContext())) return;
      if (googleBehindPrefs()?.action(action, button, storeContext())) return;
      switch (action) {
        case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
        case 'home': if (ui.view !== 'lock') home(); break;
        case 'back': back(); break;
        case 'menu-key': menuKey(); break;
        case 'search-key': searchKey(); break;
        // The search box and widget microphones start Voice Search's recognition dialog (gb-google-apps.js).
        case 'voice-search': openApp('voice-search'); break;
        case 'gb-menu-more': ui.overlay = 'gb-menu-more'; renderOverlay(); break;
        case 'settings-open': ui.overlay = ''; ui.view = 'settings'; ui.sub = id; ui.gbSettingsStack = id ? [''] : []; render(); break;
        // Select text arms the page (Browser / Google Mail): the next touch there selects (gb-browser.js).
        case 'gb-select-text': ui.overlay = ''; ui.gbMenuItems = null; renderOverlay(); ui.gbSelecting = ui.view; break;
        case 'close-overlay': if (ui.overlay === 'shade') { closeShade(); break; } ui.overlay = ''; renderOverlay(); break;
        case 'toast': toast(id); break;
        case 'noop': break;
        default: StoreHost.ids().some(other => other !== ui.view && !other.startsWith('store-') && !StoreHost.module(other).google && StoreHost.module(other).action?.(action, button, storeContext())); break;
      }
    });
    document.addEventListener('submit', event => {
      const form = event.target.closest('[data-form]');
      if (!form || !screen.contains(form)) return;
      event.preventDefault(); const values = new FormData(form);
      if (googleBehindPrefs()?.submit(form.dataset.form, values, storeContext())) return;
      if (moduleView() && StoreHost.submit(form.dataset.form, values, storeContext())) return;
      if (prefsOpen() && GB.module('prefs').submit(form.dataset.form, values, storeContext(), form)) return;
      switch (form.dataset.form) {
        default: StoreHost.ids().some(other => other !== ui.view && !other.startsWith('store-') && !StoreHost.module(other).google && StoreHost.module(other).submit?.(form.dataset.form, values, storeContext())); break;
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
      if (prefsOpen() && GB.module('prefs').input(event, storeContext())) return;
    });
    document.addEventListener('keydown', event => {
      if (event.target.matches('.recent-item,.web-tab-preview') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return; }
      // A store app's own key (its store id: Focus Timer, Pocket Planner, Daily Weather) is not a key handler.
      if (moduleView() && typeof StoreHost.module(ui.view).key === 'function' && StoreHost.key(event, storeContext())) return;
      if (event.key === 'Escape' || event.key === 'Backspace' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); back(); }
      else if (event.key === 'Home' && !['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)) { event.preventDefault(); if (ui.view !== 'lock') home(); }

    });
    // Touch keys: any touch on the device lights them; holding Home for the 500 ms long-press timeout opens the recent apps.
    document.querySelector('#device').addEventListener('pointerdown', pokeKeylight, true);
    document.addEventListener('keydown', pokeKeylight, true);
    // Live dialog controls: "Show password." and "Use incoming call volume for notifications".
    overlayRoot.addEventListener('change', event => {
      if (event.target.matches('[data-wifi-show]')) { const input = overlayRoot.querySelector('[data-wifi-password]'); if (input) input.type = event.target.checked ? 'text' : 'password'; }
      if (event.target.matches('[data-vol-same]')) overlayRoot.querySelector('[data-vol-notification]')?.toggleAttribute('hidden', event.target.checked);
    });
    let pointerStart = null;
    screen.addEventListener('dragstart', event => event.preventDefault());
    screen.addEventListener('contextmenu', event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
    });
    // Older WebKit versions may still start page rubber-banding during a custom
    // gesture. Cancel only gestures owned by the simulator; lists scroll natively.
    screen.addEventListener('touchmove', event => {
      if (event.touches.length !== 1 || !pointerStart || event.target.closest('input, textarea, select')) return;
      if (pointerStart.target.closest('#status-bar, #nav-bar, .home-view, .drawer-view, .lock-view, .shade-top, .shade-handle, .calc-pager, .easter-robot')) {
        if (event.cancelable) event.preventDefault();
      }
    }, { passive: false });
    screen.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      if (data.settings.showTouches) { const dot = document.createElement('span'); const rect = screen.getBoundingClientRect(); dot.className = 'touch-indicator'; dot.style.left = `${event.clientX - rect.left}px`; dot.style.top = `${event.clientY - rect.top}px`; screen.append(dot); setTimeout(() => dot.remove(), 400); }
      const scrollTarget = (event.pointerType === 'mouse' && !ui.overlay && !event.target.closest('input, select, textarea, .wallpaper-choice')
        ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.gbdc-alarms,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
      pointerStart = { x: event.clientX, y: event.clientY, target: event.target, pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0 };
    });
    window.addEventListener('pointermove', event => {
      if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
      if (pointerStart.scrolling) { event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return; }
      if (pointerStart.scrollTarget && Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx)) {
        pointerStart.scrolling = true; screen.classList.add('settings-scrolling');
        try { screen.setPointerCapture(event.pointerId); } catch {}
        suppressClickUntil = Date.now() + 350;
        event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return;
      }
    });
    window.addEventListener('pointerup', event => {
      if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
      if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
      pointerStart = null;
    });
    window.addEventListener('pointercancel', () => { screen.classList.remove('settings-scrolling'); pointerStart = null; });
    screen.addEventListener('pointerdown',()=>{if(ui.sleeping){ui.sleeping=false;suppressClickUntil=Date.now()+350;if(ui.locked)render();else home(false);}},true);
    // ---- The device clock: every second the status clock, the screen timeout (Settings › Display), the analog clocks
    let lastActivity=Date.now();
    for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});
    // Settings > Display > Animation (animations_values "00", "01", "11": window then transition scale).
    // Settings > Display > Screen timeout: Settings.apk's screen_timeout_values (ms).
    const SCREEN_TIMEOUT = [15000, 30000, 60000, 120000, 600000, 1800000];
    setInterval(() => {
      lockControls.tick();
      document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
      const now = deviceDate();
      if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !GB.module('home').dragging() && SCREEN_TIMEOUT[data.settings.screenTimeout ?? GBSettings.DEFAULTS.screenTimeout]!==undefined&&Date.now()-lastActivity>=SCREEN_TIMEOUT[data.settings.screenTimeout ?? GBSettings.DEFAULTS.screenTimeout]){captureRecentView();lockScreen();lastActivity=Date.now();}
      document.querySelectorAll('.analog-clock').forEach(node => {
        node.setAttribute('aria-label', clock());
        node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
        node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
      });
      const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    }, 1000);
    // ---- The site controls around the phone: full screen, the header handle, the language, reset
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
    // ---- Start: the modules' init (their listeners for the whole page), the first render, then the boot movie of a new tab
    for (const id of StoreHost.ids()) StoreHost.module(id).init?.(storeContext());
    i18n.translateDOM(document.body);
    render();
    GB.module('power').coldBoot(storeContext());
  }
  // Every module has registered by then (the deferred scripts run in order before DOMContentLoaded).
  document.addEventListener('DOMContentLoaded', start);
})();
