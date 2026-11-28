/* Android 4.0.4 (Galaxy Nexus, IMM76I): the core (docs/plans/engine-migration.md, docs/plans/engine-migration-4.0.4.md).
   Logic only, nothing of a look:
   - the saved state (AndroidState, key android-time-machine-ics-v1, with the upgrades of older saves) and the on-screen
     state (ui): ui.view is the open screen ('home', 'lock', an app), ui.sub its page, ui.overlay a dialog or menu
   - the apps the launcher lists (the store's installed apps join them, store-apps/legacy-host.js), the device clock,
     drawing (the wallpaper, the window transitions, the status and navigation bars through their modules), opening an
     app, Home and Back, toasts, notifications, Recents' task records, factory reset and Clear data
   - one click, form, typing and key handler, and one pointer pipeline with the list scrolling of the mouse: every event
     goes to the modules' hooks, the open screen's module first, then the others in the order they registered
   - the screen-off timeout, the site controls around the phone (full screen, the header, language, reset)
   Every screen is a module that registers itself, as 2.1's (EC), 6.0.1's (MM) and 7.1.2's (NG) do, through
   store-apps/legacy-host.js (StoreHost), named ICS here:
     ICS.register(id, {render(c), mount(c, root), drawn(c, root), action(name, el, c), early(name, el, c), overlay(c),
                       ownOverlay(c), mountOverlay(c, root), submit(form, values, c), input(event, c), key(event, c),
                       contextmenu(event, c), back(c), goHome(c), launch(c, resume, app), open(c, resume), clearData(c),
                       pointerdown / pointermove / pointerdrag / pointerup / pointerdrop / pointercancel, scrollstart(c),
                       clocks(c, now), second(c, now), rendering(c), backdrop(c), rendered(c), beforeOverlay(c),
                       afterOverlay(root, c), init(c), start(c), touch, scroller, legacyMenu(c)})
   docs/plans/engine-migration-4.0.4.md says what each hook is for. The modules load after this file; the core starts
   once they all have (DOMContentLoaded: every script is deferred). */
window.ICS = window.StoreHost;
(() => {
  'use strict';
  function start() {
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
    const wallpaperFiles = ['architecture','bubblegum','canyon','chroma','escape','fidelity','flora','kepler','leaf','noir','outofthebox'];
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
    function storeInstalled(id) { const r = StoreHost.runtime(id); if (!r) return; storeAppsSync(); if (c.icsPlayContext().prefs.widgets) c.placeShortcut(r, appNames[r]); }
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
    const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
    const deviceDate = () => ICSSystemSettings.wallDate(data);
    const today = () => localDate(deviceDate());
    const clock = () => deviceDate().toLocaleTimeString(i18n.locale(), { hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24 });
    const fullDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'long', month: 'long', day: 'numeric' });
    const contact = id => data.contacts.find(item => item.id === Number(id));
    // Touch & hold delay: Settings' long_press_timeout_selector values (500 / 1000 / 1500 ms); the simulator's own
    // long-press timers stretch by the same amount.
    const HOLD = [500, 1000, 1500];
    const holdDelay = ms => ms + (HOLD[data.settings.longPressTimeout || 0] - 500);
    const carrierName = () => data.settings.airplane ? i18n.t('No service.') : safe(data.settings.networkOperator||'Telekom');
    let lastActivity=Date.now();
    for(const name of ['pointerdown','keydown','input','wheel'])document.addEventListener(name,()=>{lastActivity=Date.now();},{passive:true,capture:true});

    function renderStatus() { const m = StoreHost.module('statusbar'); statusRoot.innerHTML = m.render(storeContext()); i18n.translateDOM(statusRoot); }
    function renderNav() { const m = StoreHost.module('navbar'), cx = storeContext(); navRoot.innerHTML = m.render(cx); m.mount?.(cx, navRoot); }
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
      if(ui.locked)ui.view='lock';
      each('rendering');
      const outgoing = viewport.firstElementChild;
      screen.className = `screen${activeTransition ? ' transitioning' : ''} wallpaper-${data.wallpaper}${data.settings.largeText ? ' large-text' : ''}${ui.sleeping?' sleeping':''}${ui.locked?' credential-locked':''}`;
      screen.style.background = data.wallpaper === 11 && data.customWallpaperPhoto ? `#080d14 url('${ICSMedia.image(data.customWallpaperPhoto)}') center / cover no-repeat` : data.wallpaper === 11 && data.customWallpaper ? `linear-gradient(160deg, ${data.customWallpaper[0]}, ${data.customWallpaper[1]} 53%, ${data.customWallpaper[2]})` : `#080d14 url('assets/wallpaper_${wallpaperFiles[data.wallpaper] || 'chroma'}.jpg') center center / cover no-repeat`;
      screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
      renderStatus(); renderNav(); each('backdrop');
      viewport.innerHTML = renderApp(); StoreHost.module(ui.view)?.drawn?.(storeContext(), viewport);
      snapResting(viewport);
      renderOverlay();
      i18n.translateDOM(screen);
      if (StoreHost.has(ui.view)) StoreHost.mount(ui.view, storeContext(), viewport);
      const scene = {view: ui.view, sub: ui.sub}, transit = ui.sleeping ? '' : ICSTransitions.kind(lastScene, scene, pendingNav);
      lastScene = scene;
      if (transit) startTransition(transit, outgoing, viewport.firstElementChild);
      else if (activeTransition) {
        // A same-screen re-render during a transition continues the incoming animation.
        const elapsed = performance.now() - activeTransition.start;
        ICSTransitions.play(viewport.firstElementChild, ICSTransitions.specs[activeTransition.name].enter, activeTransition.factor).forEach(animation => { animation.currentTime = elapsed; activeTransition.animations.push(animation); });
      }
      each('rendered');
    }
    function lockScreen(){captureRecentView();c.lockControls.lock();ui.locked=ICSLockscreen.secure(data);ui.sleeping=data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}

    function renderApp() {
      if (StoreHost.has(ui.view)) return StoreHost.render(ui.view, storeContext());
      return StoreHost.module('home').render(storeContext());
    }
    function openApp(app, resume = false) {
      if (!isStoreApp(app)) StoreHost.module(app)?.launch?.(storeContext(), resume, app);
      // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
      if (!resume) { ui.mmsPrefs = ''; ui.mmsDialog = ''; ui.mapsPrefs = null; ui.mpsDialog = null; ui.navPick = ''; ui.locResults = null; ui.locSearching = false; }
      if (app !== 'camera') ui.captureFor = '';
      if(ui.locked)return;
      if (!appNames[app]) return;
      captureRecentView();
      if (!isStoreApp(app)) StoreHost.module(app)?.open?.(storeContext(), resume);
      ui.view = app; ui.sub = resume ? ui.recentState?.[app]?.sub || '' : ''; ui.overlay = '';
      ui.recent = [app, ...ui.recent.filter(id => id !== app)].slice(0, 7);
      render();
      if (resume && viewport.firstElementChild) appScrollContainer(app).scrollTop = ui.recentState?.[app]?.scrollTop || 0;
    }
    function appScrollContainer(app) {
      return viewport.querySelector(StoreHost.module(app)?.scroller || '.app-view') || viewport.firstElementChild;
    }
    function captureRecentView() {
      if (appNames[ui.view] && viewport.firstElementChild) {
        ui.recentSnapshots[ui.view] = viewport.innerHTML;
        ui.recentState ||= {};
        ui.recentState[ui.view] = {sub: ui.sub, scrollTop: appScrollContainer(ui.view).scrollTop};
      }
    }
    function home(resetPage = true) { if(ui.locked)return;each('goHome');captureRecentView(); ui.view = 'home'; ui.sub = ''; ui.overlay = ''; if (resetPage) ui.page = 2; render(); }
    function back() { pendingNav = 'back'; try { navigateBack(); } finally { pendingNav = ''; } }
    function navigateBack() {
      if ((ui.overlay === 'store-host' || !ui.overlay && isStoreApp(ui.view)) && StoreHost.back(storeContext())) return;
      if (ask('back')) return;
      if (ui.overlay) { ui.overlay = ''; render(); return; }
      if (ui.view === 'lock') return;
      if (ui.sub) { ui.sub = ''; render(); return; }
      home(false);
    }
    function toast(message) {
      document.querySelector('.toast')?.remove();
      const element = document.createElement('div'); element.className = 'toast'; element.textContent = i18n.t(message);
      screen.append(element);
      clearTimeout(ui.toastTimer); ui.toastTimer = setTimeout(() => element.remove(), 2500);
    }
    function renderOverlay() {
      if (ask('beforeOverlay')) return;
      { const cx = storeContext(); for (const m of modules()) { const html = m.ownOverlay?.(cx); if (html != null) { overlayRoot.innerHTML = html; return; } } }
      const drawn = moduleOverlay();
      if (drawn) {
        overlayRoot.innerHTML = drawn.html; drawn.m.mountOverlay?.(drawn.cx, overlayRoot);
      } else if (ui.overlay === 'store-host') {
        overlayRoot.innerHTML = StoreHost.overlay(storeContext()); StoreHost.mountOverlay(storeContext(), overlayRoot);
      } else overlayRoot.innerHTML = '';
      i18n.translateDOM(overlayRoot);
      each('afterOverlay', overlayRoot);
    }
    window.ICSCarrierName = () => carrierName();

    function syncBrowserState() {
      const tab = ICSBrowserSession.current(ui.browserSession);
      ui.browserUrl = ICSBrowserSession.url(ui.browserSession);
      ui.browserHistory = tab.history; ui.browserIndex = tab.index;
      ui.browserTab = ui.browserSession.active;
      ui.browserTabs = ui.browserSession.tabs.map(tab => tab.history[tab.index]);
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
      ui.recent=ui.recent.filter(app=>app!==id);delete ui.recentState?.[id];delete ui.recentSnapshots[id];save();
    }

    function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }

    /* The context every module hook gets (ics-core.js, docs/plans/engine-migration.md): the saved and the on-screen
       state, the shell's drawing and navigation, and the helpers the screens share. */
    const c = {
      get data() { return data; }, defaults: defaultData, emailSeed: emailData, ui, save, render, renderOverlay, renderStatus, toast, openApp, home, back, navigateBack, captureRecentView,
      screen, viewport, overlayRoot, statusRoot, navRoot, get pointer() { return pointerStart; },
      notify: (title, text) => addNotification(title, text), get lang() { return i18n.language; }, get locale() { return i18n.locale(); }, t: key => i18n.t(key), i18n, safe, clone,
      dp, snapResting, holdDelay, deviceDate, today, clock, fullDate, carrierName, contact, tracks, syncBrowserState, apps, appNames, iconAssets, wallpaperFiles, reducedMotion, storeInstalled, storeAppsSync, clearAppData, resetSimulator, storeUninstall, lockScreen,
      endPointer: () => { pointerStart = null; }, poke: () => { lastActivity = Date.now(); }, resetScene: scene => { lastScene = scene; }, legacyMenu: () => modules().some(m => m.legacyMenu?.(storeContext())),
      suppressClick: ms => { suppressClickUntil = Date.now() + ms; }, suppressReleaseClick
    };
    // This version's modules (the store apps aside): the open screen's first, then the others in the order they registered.
    function modules() { const ids = StoreHost.ids().filter(id => !id.startsWith('store-')); return [...new Set([...ids.filter(id => id === ui.view), ...ids.filter(id => id !== ui.view)].map(id => StoreHost.module(id)))]; }
    // A hook offered to the modules until one takes it (returns true), or run on every module.
    function ask(hook, ...args) { const cx = storeContext(); return modules().some(m => m[hook]?.(...args, cx)); }
    function each(hook, ...args) { const cx = storeContext(); for (const m of modules()) m[hook]?.(...args, cx); }
    // The overlay a module draws (its markup, '' for nothing), or null when it is none of theirs.
    function moduleOverlay() { const cx = storeContext(); for (const m of modules()) { const html = m.overlay?.(cx); if (html != null) return {html, m, cx}; } return null; }
    // Every second, in the order the modules registered (the old tick's order).
    // In the order they registered (the old tick's order).
    function allModules() { return [...new Set(StoreHost.ids().filter(id => !id.startsWith('store-')).map(id => StoreHost.module(id)))]; }
    function everySecond(now) { const cx = storeContext(); for (const m of allModules()) m.second?.(cx, now); }
    let suppressClickUntil = 0;
    document.addEventListener('click', event => {
      const button = event.target.closest('[data-action]');
      if (!button || !screen.contains(button)) return;
      event.preventDefault();
      if (Date.now() < suppressClickUntil) return;
      const { action, id, app, url } = button.dataset;
      // Before the lock check: the modules' early controls (Messaging › Settings).
      if (ask('early', action, button)) return;
      if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
      // The modules' own controls (the open screen's module first).
      if (ask('action', action, button)) return;
      // A store app's own controls and the host's dialog and menu (store-apps/legacy-host.js).
      if ((action.startsWith('sth-') || isStoreApp(ui.view)) && StoreHost.action(action, button, storeContext())) return;
      switch (action) {
        case 'open-app': openApp(app || id, !!button.closest('.recent-item')); break;
        case 'home': if (ui.view !== 'lock') home(); break;
        case 'back': back(); break;
        case 'close-overlay': ui.overlay = ''; screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`; renderOverlay(); break;
        case 'toast': toast(id); break;
        case 'noop': break;
        default: break;
      }
    });

    document.addEventListener('submit', event => {
      const form = event.target.closest('[data-form]');
      if (!form || !screen.contains(form)) return;
      event.preventDefault(); const values = new FormData(form);
      if (ask('submit', form, values)) return;
    });
    document.addEventListener('input', event => {
      if (ask('input', event)) return;
    });

    let pointerStart = null;
    screen.addEventListener('dragstart', event => event.preventDefault());
    screen.addEventListener('contextmenu', event => {
      if (event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault();
      each('contextmenu', event);
    });
    // Older WebKit versions may still start page rubber-banding during a custom
    // gesture. Cancel only gestures owned by the simulator; lists scroll natively.
    screen.addEventListener('touchmove', event => {
      if (event.touches.length !== 1 || !pointerStart || event.target.closest('input, textarea, select')) return;
      if (pointerStart.source || pointerStart.target.closest(modules().map(m => m.touch).filter(Boolean).join(', '))) {
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
        ? (ui.view === 'settings' && event.target.closest('.settings-app .app-content') ? event.target.closest('.settings-app') : event.target.closest('.icsp-scroll,.play-content,.mms-scroll,.people-scroll,.browser-page,.web-tabs,.web-library,.desk-scroll,.gallery-scroll,.cal-scroll,.music-library-scroll,.email-scroll')) : null);
      pointerStart = { x: event.clientX, y: event.clientY, target: event.target, pointerType: event.pointerType, pointerId: event.pointerId, downTime: performance.now(), scrollTarget, scrollTop: scrollTarget?.scrollTop || 0 };
      each('pointerdown', event, pointerStart);
    });
    window.addEventListener('pointermove', event => {
      if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
      if (ask('pointermove', event, pointerStart, dx, dy)) return;
      if (pointerStart.scrolling) { event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return; }
      if (pointerStart.scrollTarget && Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx)) {
        each('scrollstart');
        pointerStart.scrolling = true; screen.classList.add('settings-scrolling');
        try { screen.setPointerCapture(event.pointerId); } catch {}
        suppressClickUntil = Date.now() + 350;
        event.preventDefault(); pointerStart.scrollTarget.scrollTop = pointerStart.scrollTop - dy; return;
      }
      // After the lists: the launcher's page swipe and icon drag.
      ask('pointerdrag', event, pointerStart, dx, dy);
    });
    window.addEventListener('pointerup', event => {
      if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
      const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
      if (ask('pointerup', event, pointerStart, dx, dy)) { pointerStart = null; return; }
      if (pointerStart.scrolling) { screen.classList.remove('settings-scrolling'); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
      // After the lists: the launcher's page and icon drop, then the shade's swipe and pull.
      if (ask('pointerdrop', event, pointerStart, dx, dy)) { pointerStart = null; return; }
      if (!pointerStart) return;
      pointerStart = null;
    });
    window.addEventListener('pointercancel', () => { each('pointercancel'); screen.classList.remove('dragging', 'page-swiping', 'settings-scrolling', 'lock-dragging'); pointerStart = null; });
    document.addEventListener('keydown', event => {
      if (ask('key', event)) return;

    });
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
    setInterval(() => {
      const now = deviceDate();
      { const cx = storeContext(); for (const m of allModules()) m.clocks?.(cx, now); }
      if(!document.hidden && !ui.sleeping && ui.view!=='lock' && !ui.overlay && !ui.activeCall && !c.dragging() && data.settings.sleep>0&&Date.now()-lastActivity>=data.settings.sleep*1000){captureRecentView();lockScreen();lastActivity=Date.now();}
      everySecond(now);
    }, 1000);

    for (const m of allModules()) m.init?.(c);
    i18n.translateDOM(document.body);
    render();
    for (const m of allModules()) m.start?.(storeContext());
  }
  document.addEventListener('DOMContentLoaded', start);
})();
