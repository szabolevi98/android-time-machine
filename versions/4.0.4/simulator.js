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
      { id: 1, title: 'Welcome to Android 4.0.4', detail: 'Your phone is ready to explore.' },
      { id: 2, title: 'New message from Alex', detail: 'See you at 11!' }
    ]
  };

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  // state.js reads the save: unreadable JSON is kept aside, a field of the wrong kind takes its default alone, and an
  // error in one of the upgrade steps below is reported by name while the others still run.
  function load() {
    return AndroidState.load(STORE, defaultData, saved => ({ ...clone(defaultData), ...saved, settings: { ...defaultData.settings, ...saved.settings } }), [
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
    calc: '', calcFresh: false, calcPanel: 0, calcHistoryIndex: -1, phoneTab: 'dialpad',
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
  function placeContactShortcut(person) {
    if (!person) return;
    const free = page => (data.homePages[page] || []).findIndex((id, index) => !id && !(data.homeWidgets[page] || []).some(w => { const s = widgetSize(w); return index % 4 >= w.x && index % 4 < w.x + s.width && Math.floor(index / 4) >= w.y && Math.floor(index / 4) < w.y + s.height; }));
    const count = data.homePages.length;
    const order = [2, 3, 1, 4, 0].filter(i => i < count);
    let page = order.find(i => free(i) >= 0);
    if (page === undefined) { toast(VCARD('No room')); return; }
    data.homePages[page][free(page)] = `contact:${person.id}`; save();
    toast(AndroidStrings.format(VCARD('Shortcut "%s" created.'), person.name));
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
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>${(ui.view==='music'||ui.view==='news-weather'&&!ui.newsSub)&&!ui.locked?'<button class="nav-key nav-menu" data-action="legacy-menu" aria-label="Menu"><img src="assets/ic_sysbar_menu.png" alt=""></button>':''}`;
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
    if (ui.view === 'browser' && !ui.sub && ui.browserFind) highlightBrowserText();
    if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=dp(8*48/.85);
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
    if (ui.sub === 'sim-import' && ['people', 'phone'].includes(ui.view)) return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    // Contacts to display, Customize and Settings (people-io.js).
    if (ui.view === 'people' && PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    switch (ui.view) {
      case 'play-store': return ICSPlay.render(icsPlayContext());
      case 'live-wallpapers': return renderLiveWallpapers();
      case 'wallpaper-picker': return `<div class="app-view wallpaper-picker"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>Wallpapers</h2></div><div class="app-content dark">${wallpaperChoices()}</div></div>`;
      case 'settings': return renderSettings();
      case 'browser': return renderBrowser();
      case 'downloads': return HoloDownloads.render(dlContext());
      case 'gmail': return ICSGmail.render(gmailContext());
      case 'play-music': return ICSPlayMusic.render(playMusicContext());
      case 'google-plus': case 'talk': case 'youtube': case 'play-books': case 'play-movies': case 'search': case 'voice-dialer': return ICSGoogleApps.render(ui.view, googleAppsContext());
      case 'maps': case 'latitude': case 'earth': case 'news-weather': return StockApps.render(ui.view, {earthCtx: ui.view === 'earth' ? earthContext() : null, ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), now: deviceDate()});
      case 'messenger': case 'navigation': case 'local': case 'movie-studio': if (ui.view === 'navigation' && ui.navRun) return MapsRoute.nav(mrContext()); return JBExtraApps.render(ui.view, {ui, t: key => i18n.t(key), contacts: data.contacts, data});
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
    if (app === 'earth' && !resume) EarthApp.open(ui);
    // A fresh start of Maps (or Latitude) opens on the map, not on its settings (maps-prefs.js).
    if (!resume) { ui.mapsPrefs = null; ui.mpsDialog = null; ui.navPick = ''; ui.locResults = null; ui.locSearching = false; }
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
    return viewport.querySelector(app === 'play-store' ? '.icsp-scroll' : app === 'messaging' ? '.mms-scroll' : app === 'email' ? '.email-scroll' : app === 'music' ? '.music-library-scroll' : app === 'calendar' ? '.cal-scroll' : app === 'gallery' ? '.gallery-scroll' : app === 'clock' ? '.desk-scroll' : app === 'people' ? '.people-scroll' : app === 'browser' ? '.browser-page,.web-tabs,.web-library' : '.app-view') || viewport.firstElementChild;
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
      play(ids, track) { ui.music.queue = [...ids]; ui.music.track = track; ui.music.position = 0; ui.music.playing = true; ui.musicActive = true; ui.musicTrack = track; ui.musicPlaying = true; saveMusic(); }};
  }
  // Google+, Talk, YouTube, Play Books / Movies, Search, Voice Dialer and Latitude (ics-google-apps.js).
  let voiceDialTimer = null;
  function googleAppsContext() {
    return {data, ui, view: ui.view, lang: i18n.language, account: ICSGmail.account, now: deviceDate().getTime(), t: key => i18n.t(key), save, render, renderOverlay, toast, openApp,
      closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
      focus(selector) { requestAnimationFrame(() => viewport.querySelector(selector)?.focus()); },
      browse(query) { openApp('browser'); navigateBrowser(`search:${query}`); },
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
        else if (app === 'email') { composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) Object.assign(d, {subject, body: text + (d.body || '')}); }
        else { ui.sub = 'new'; Object.assign(messageDraft(), {body: text, updated: Date.now()}); }
        save(); render();
      },
      notify(title) { addNotification(title, ''); },
      // Google Search's searchable items open what they find: an app, a page, a contact, a conversation.
      apps: apps.map(([id, name]) => [id, i18n.t(name), iconAssets.has(id) ? `assets/${id}.png` : '']),
      openUrl(url) { openApp('browser'); navigateBrowser(url); },
      openContact(id) { openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; render(); },
      openThread(key) { openMessageThread(key); render(); },
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
  // Earth (earth-app.js): Earth 6.1's settings, search, My location and Share.
  const earthContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, save, render, toast: message => toast(message), earth: '6.1', account: 'icecream.demo@gmail.com', dark: true, dot: 'assets/ea6-bluedot.png', shareTargets: [['messaging', 'Messaging']], share: (app, text, subject) => { ui.overlay = ''; renderOverlay(); openApp(app); ui.sub = 'new'; Object.assign(messageDraft(), {body: text, updated: Date.now()}); save(); render(); }, openLocation: () => { openApp('settings'); toast(i18n.t('This feature is not part of the simulator.')); }});
  const musicFxContext = () => ({data, ui, language: i18n.language, locale: i18n.locale(), save, render, toast: message => toast(message)});
  const devContext = () => ({data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});
  function navigateBack() {
    if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return; }
    if (ui.view === 'settings' && ui.sub === 'musicfx' && !ui.overlay) { ui.mfxSpin = false; ui.sub = 'sound'; render(); return; }
    if (ui.view === 'play-music' && !ui.overlay && ICSPlayMusic.back(ui)) { render(); return; }
    if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return; }
    if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return; }
    if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return; }
    if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return; }
    if (ui.view === 'maps' && !ui.overlay && ui.mapsRoute && MapsRoute.back(mrContext())) return;
    if (ui.view === 'navigation' && !ui.overlay && ui.navRun) { ui.overlay = 'mr-exit'; renderOverlay(); return; }
    if (!ui.overlay && JBExtraApps.back(ui)) { render(); return; }
    // News & Weather: a settings dialog or nested screen, then the settings or the story page.
    if (ui.view === 'news-weather' && ui.newsSub && !ui.overlay) { if (!(ui.newsSub === 'settings' && NewsPrefs.back(ui))) { ui.newsSub = ''; ui.nwpScreen = ''; } render(); return; }
    if (ui.view === 'email' && ui.sub === 'em-settings' && !ui.overlay) { if (ui.emPrefList || ui.emPrefEdit) { ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); } else if (ui.emPref) ui.emPref = EmailPrefs.parent(ui.emPref); else ui.sub = ''; render(); return; }
    if (ui.view === 'email' && ICSEmail.back(emailContext())) return;
    // The Gallery's picker (GET_CONTENT from Email's Attach file) returns without a picture.
    if (ui.view === 'gallery' && ui.galleryPick && !ui.sub && !ui.overlay) { const caller = ui.galleryPick; ui.galleryPick = ''; openApp(caller, true); return; }
    if (ui.view === 'downloads' && HoloDownloads.back(dlContext())) return;
    // Play Books' reader: a dropdown, Display options, then the Contents popup close before the reader does.
    if (ui.view === 'play-books' && ui.gaSub === 'read' && (ui.gaBkSpin || ui.gaBkOptions || ui.gaBkToc)) { if (ui.gaBkSpin) ui.gaBkSpin = ''; else if (ui.gaBkOptions) ui.gaBkOptions = false; else ui.gaBkToc = false; render(); return; }
    if (ui.view === 'play-books') { ui.gaBkSpin = ''; ui.gaBkOptions = false; ui.gaBkToc = false; }
    // Talk: an open dialog first; Friend info returns to its chat, Blocked friends to Talk settings.
    if (ui.view === 'talk' && (ui.gaTkDialog || ui.gaSub === 'info' || ui.gaSub === 'blocked')) { if (ui.gaTkDialog) ui.gaTkDialog = null; else ui.gaSub = ui.gaSub === 'info' ? 'chat' : 'settings'; render(); return; }
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
    if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return;}
    if (ui.view === 'gallery' && ui.galleryCrop) { ui.galleryCrop=null;render();return; }
    if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return; }
    // YouTube's capture: Back before recording returns to it without a clip (RESULT_CANCELED).
    if (ui.view === 'camera' && ui.captureFor && !ui.cameraRec && !ui.overlay) { openApp(ui.captureFor, true); return; }
    if (ui.view === 'camera' && ui.cameraRec && !ui.overlay) { cameraStop(); render(); return; }
    if (ui.view === 'camera' && ui.icsPano?.state === 'capture' && !ui.overlay) { ui.icsPano = null; render(); return; }
    if (ui.view === 'gallery' && ui.sub === 'movie') { ui.sub='photo';ui.galleryMovie=null;render();return; }
    if (ui.view === 'gallery' && ui.sub === 'photo') { ui.sub='album';ui.galleryZoom=false;render();return; }
    if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return; }
    if(ui.view==='settings' && ['apn','operators','tether-help','device-admin'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security'}[ui.sub];render();return;}
    if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return;}
    if(ui.view==='music' && ui.sub==='queue'){ui.sub='player';render();return;}
    if (ui.view === 'play-store' && ui.marketSearching) { ui.marketSearching = false; render(); return; }
    if (ui.view === 'play-store' && ui.marketHistory?.length) { const prev = ui.marketHistory.pop(); ui.market = prev; render(); const list = viewport.querySelector('.icsp-scroll'); if (list) list.scrollTop = prev.scroll || 0; return; }
    if (ui.view === 'calculator' && ui.calcPanel) { setCalculatorPanel(0); return; }
    if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserFind !== undefined) { ui.browserFind = undefined; render(); return; }
    if (ui.view === 'browser' && !ui.sub && ui.browserIndex > 0) { browserBack(); return; }
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
    if (ui.view === 'messaging' && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return; }
    if (ui.view === 'clock' && ui.sub === 'alarm-edit') { ui.alarmDraft=null; ui.sub='alarms'; render(); return; }
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
    if (ui.overlay === 'shade') {
      overlayRoot.innerHTML = `<div class="notification-shade"><div class="shade-top"><span class="shade-date">${shadeDate()}</span><button data-action="open-app" data-app="settings" aria-label="Settings"><img src="assets/ic_notify_quicksettings_normal.png" alt=""></button>${data.notifications.length ? '<button class="shade-clear" data-action="clear-notifications" aria-label="Clear notifications"><img src="assets/ic_notify_clear_normal.png" alt=""></button>' : ''}</div><div class="shade-divider"></div><div class="shade-body"><div class="shade-list">${ui.activeCall?`<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>`:''}${data.notifications.map(n => `<button class="notification" data-action="notification-open" data-id="${n.id}"><span class="notification-icon"><img src="assets/${n.id === 2 ? 'stat_notify_sms.png' : n.kind === 'calendar' ? 'calendar.png' : 'settings.png'}" alt=""></span><span><strong>${safe(n.title)}</strong><small>${safe(n.detail)}</small></span></button>`).join('')}</div><div class="shade-carrier">${carrierName()}</div></div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
    } else if (ui.overlay.startsWith('widget-photo')) {
      overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
    } else if(ui.overlay==='lng-dialog'){
      overlayRoot.innerHTML=ICSLanguage.overlay(data,ui,i18n.locale());
    } else if(ui.overlay==='sx-dialog'){
      overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay === 'recent') {
      overlayRoot.innerHTML = `<div class="recent-panel" data-action="close-overlay">${ui.recent.length ? `<div class="recent-list">${[...ui.recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${appNames[id]}"><span class="recent-label">${appNames[id]}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${ui.recentSnapshots[id] || `<div class="recent-fallback">${appIcon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${appIcon(id)}</span></div>`).join('')}</div>` : '<p class="recent-empty">No recent apps</p>'}</div>`;
    } else if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
      overlayRoot.innerHTML=ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale(),i18n.language);
    } else if (ui.overlay === 'icpk') {
      // The framework's DatePickerDialog / TimePickerDialog (Calendar's From / To, DeskClock's alarm time).
      overlayRoot.innerHTML = ICSPickers.render(ui.icsPicker, i18n.locale());
    } else if (ui.overlay.startsWith('clock-')) {
      overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key),{hour24:!!data.settings.hour24,locale:i18n.locale(),now:deviceDate()});
      if(ui.overlay==='clock-ringing')ICSDeskClock.bindRinging?.(overlayRoot);
    } else if (ui.overlay === 'hce-dialog') {
      overlayRoot.innerHTML = HoloContactEditor.overlay({lang: i18n.language, draft: ui.peopleDraft, dialog: ui.hceDialog || '', photos: data.photos, photoUrl: pid => { const photo = data.photos.find(p => String(p.id) === String(pid)); return photo ? ICSMedia.image(photo) : ''; }});
    } else if (ui.overlay.startsWith('calendar-')) {
      overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('music-')) {
      overlayRoot.innerHTML = ICSMusic.overlay(ui.music,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('email-')) {
      overlayRoot.innerHTML = ICSEmail.overlay(emailContext());
    } else if (ui.overlay.startsWith('sd-')) {
      overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
    } else if (ui.overlay.startsWith('people-')) {
      overlayRoot.innerHTML = peopleOverlay();
    } else if (ui.overlay === 'browser-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu web-menu"><button data-action="browser-forward" ${ui.browserIndex >= ui.browserHistory.length-1?'disabled':''}>Forward</button><button data-action="browser-refresh">Refresh</button><button data-action="browser-new-tab">New tab</button><button data-action="browser-save">Bookmark</button><button data-action="browser-bookmarks">Bookmarks</button><button data-action="browser-saved">Saved pages</button><button data-action="browser-save-page">Save for offline reading</button><button data-action="browser-find">Find on page</button></div>`;
    } else if (ui.overlay.startsWith('mms-')) {
      overlayRoot.innerHTML = renderMessageOverlay();
    } else if (ui.overlay === 'play-menu') {
      // The action bar overflow: a Holo popup anchored below the overflow button.
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${ICSPlay.menu(icsPlayContext()).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
    } else if (ui.overlay?.startsWith('icsp-')) {
      overlayRoot.innerHTML = ICSPlay.dialog(ui.overlay.slice(5), icsPlayContext());
    } else if (ui.overlay === 'jbx-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${JBExtraApps.menu(ui.view, key => i18n.t(key)).map(item => `<button data-action="${item.action}">${safe(item.title)}</button>`).join('')}</div>`;
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
    } else if (ui.overlay === 'calc-menu') {
      overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="calc-clear">${safe(CALC('Clear history'))}</button><button data-action="calc-panel" data-id="${ui.calcPanel ? 0 : 1}">${safe(CALC(ui.calcPanel ? 'Basic panel' : 'Advanced panel'))}</button></div>`;
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
    if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" data-nyandroid role="button" tabindex="0" aria-label="Close Nyandroid"></div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
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
    ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render();
  }
  function browserBack() { ICSBrowserSession.move(ui.browserSession,-1); saveBrowserState(); render(); }
  function browserForward() { ICSBrowserSession.move(ui.browserSession,1); ui.overlay = ''; saveBrowserState(); render(); }
  function browserLink(url, title, subtitle = '') { return `<div class="web-result"><a href="#" data-action="browser-link" data-url="${safe(url)}"><strong>${safe(title)}</strong></a><small>${safe(url)}</small><p>${safe(subtitle)}</p></div>`; }
  function renderWebsite(url) {
    if (url === 'www.google.com') return `<div class="google-logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>l</span><span>e</span></div><form class="search-form" data-form="web-search"><input name="query" aria-label="Search the web" placeholder="Search the web" required><button type="submit">Search</button></form><div class="browser-tiles">${[['www.android.com','Android'],['en.wikipedia.org/wiki/Android','Wikipedia'],['news.example','News'],['retro.example','2012 Web']].map(item => `<button data-action="browser-link" data-url="${item[0]}">${item[1]}</button>`).join('')}</div><p style="font-size:calc(12.9412 * var(--dp));color:#888;margin-top:calc(28.2353 * var(--dp))">Offline demo pages · 2012</p>`;
    if (url.startsWith('search:')) {
      const term = url.slice(7);
      return `<h2>Search results</h2><p>Results for <strong>${safe(term)}</strong></p>${browserLink('www.android.com', 'Android – Discover the new Android 4.0', 'Ice Cream Sandwich brings a refined design and powerful new features.')}${browserLink('en.wikipedia.org/wiki/Android', 'Android (operating system) – Wikipedia', 'An overview of the Android mobile operating system.')}${browserLink('news.example', 'Tech News', `Stories related to ${term}.`)}`;
    }
    if (url.includes('android.com')) return `<h2 style="color:#79b93f">android</h2><h3>Meet Android 4.0</h3><p>A new, refined Android for phones and tablets. Share more, browse faster and personalize your home screen.</p><div style="background:#23343c;color:white;padding:calc(29.4118 * var(--dp));text-align:center;font-size:calc(44.7059 * var(--dp))">🤖<br><small style="font-size:calc(20 * var(--dp))">Ice Cream Sandwich</small></div>${browserLink('en.wikipedia.org/wiki/Android','Learn about Android','The story of Android.')}`;
    if (url.includes('wikipedia.org')) return `<h2>Android (operating system)</h2><p><small>From Wikipedia, the free encyclopedia</small></p><hr><p>Android is a mobile operating system based on a modified version of the Linux kernel. Android 4.0, known as Ice Cream Sandwich, introduced the Holo interface and virtual navigation buttons.</p><h3>Versions</h3><p>Gingerbread · Ice Cream Sandwich · Jelly Bean</p>${browserLink('www.android.com','Official Android website')}`;
    if (url === 'news.example/galaxy-nexus' || url === 'retro.example/holo') return `<article class="web-offline-article"><h2>${url.startsWith('news')?'A day with Galaxy Nexus':'A closer look at Holo'}</h2><time>August 20, 2012 · Demo archive</time><p>The phone has a large screen, three navigation buttons and a blue-accented interface. Open the app drawer to discover the classic Android experience.</p><h3>Everyday essentials</h3><p>Contacts, messages and the browser share a simple visual language. Swipe between home screens, arrange your favorite apps, and pull down the notification shade.</p><h3>Make it yours</h3><p>Choose a wallpaper, add an analog clock and keep your favorite contacts close. This small offline archive is a fictional snapshot of the early smartphone era.</p>${browserLink('news.example','Back to Tech News')}${browserLink('retro.example/holo','Explore the Holo interface')}</article>`;
    if (url.includes('news.example')) return `<h2>Tech News</h2><p style="color:#777">Monday, August 20, 2012</p><hr><h3>The Galaxy Nexus experience</h3><p>Android 4.0 makes multitasking, notifications and home screen customization easier than ever.</p><h3>Apps in your pocket</h3><p>Explore the growing world of mobile apps and connected devices.</p>${browserLink('news.example/galaxy-nexus','Read the Galaxy Nexus story')}${browserLink('retro.example','Visit the 2012 Web')}`;
    if (url.includes('retro.example')) return `<h2>Welcome to the 2012 Web</h2><p>A little time capsule from the early smartphone era.</p><ul><li>Share photos</li><li>Check your email</li><li>Customize your phone</li></ul>${browserLink('retro.example/holo','Explore the Holo interface')}${browserLink('maps.example','Open the sample map')}${browserLink('www.google.com','Back to Google')}`;
    if (url.includes('maps.example')) return `<h2>Maps</h2><div style="height:calc(270.5883 * var(--dp));background:repeating-linear-gradient(35deg,#e2ead9,#e2ead9 calc(21.1765 * var(--dp)),#c7dfd7 calc(21.1765 * var(--dp)),#c7dfd7 calc(28.2353 * var(--dp)));display:grid;place-items:center;color:#426a68">San Francisco · Demo map</div><p>Map data is a local illustration.</p>`;
    return `<h2>Webpage unavailable</h2><p>The simulator browses a small collection of offline example pages.</p>${browserLink('www.google.com','Go to Google')}`;
  }
  function browserTitle(url) {
    return url === 'www.google.com' ? 'Google' : url.startsWith('search:') ? url.slice(7) : url.replace(/^www\./,'');
  }
  function renderBrowser() {
    const header = title => `<header class="web-header"><button data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t(title))}</h2><button data-action="browser-new-tab" aria-label="New tab"><img src="assets/web-ic_new_window_holo_dark.png" alt=""></button></header>`;
    if (ui.sub === 'tabs') return `<div class="app-view ics-browser">${header('Tabs')}<div class="web-tabs">${ui.browserTabs.map((url,i)=>`<article class="web-tab-card ${i===ui.browserTab?'current':''}"><div class="web-tab-title"><button data-action="browser-tab" data-id="${i}">${safe(browserTitle(url))}</button><button data-action="browser-close-tab" data-id="${i}" aria-label="Close tab"><img src="assets/web-ic_tab_close.png" alt=""></button></div><div class="web-tab-preview" role="button" tabindex="0" aria-label="${safe(browserTitle(url))}" data-action="browser-tab" data-id="${i}"><div class="browser-page" inert aria-hidden="true">${renderWebsite(url)}</div></div></article>`).join('')}</div></div>`;
    if (['bookmarks','history','saved'].includes(ui.sub)) {
      const urls = ui.sub==='history' ? [...data.browserHistory].reverse() : ui.sub==='saved' ? data.savedPages || [] : data.bookmarks;
      return `<div class="app-view ics-browser">${header('Bookmarks')}<nav class="web-library-tabs">${[['bookmarks','Bookmarks'],['history','History'],['saved','Saved pages']].map(([id,label])=>`<button class="${ui.sub===id?'active':''}" data-action="browser-${id}">${safe(i18n.t(label))}</button>`).join('')}</nav><div class="web-library">${urls.map(url=>`<div class="web-library-row"><button data-action="browser-bookmark" data-id="${safe(url)}">${safe(browserTitle(url))}<small>${safe(url)}</small></button>${ui.sub!=='history'?`<button data-action="browser-remove-saved" data-id="${safe(url)}" aria-label="Delete">×</button>`:''}</div>`).join('')||'<p class="empty-note">No saved pages</p>'}</div></div>`;
    }
    return `<div class="app-view ics-browser"><div class="browser-toolbar"><form data-form="address"><img src="assets/browser.png" alt=""><input name="address" aria-label="Web address" value="${safe(ui.browserUrl.startsWith('search:')?ui.browserUrl.slice(7):ui.browserUrl)}"></form><button data-action="browser-tabs" aria-label="Tabs"><img src="assets/web-ic_windows_holo_dark.png" alt=""><span class="browser-tab-count">${ui.browserTabs.length}</span></button><button data-action="browser-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div>${ui.browserFind!==undefined?`<form class="web-find" data-form="browser-find"><input name="query" aria-label="Find on page" placeholder="Find on page" value="${safe(ui.browserFind)}"><button type="submit">Search</button><button type="button" data-action="browser-close-find" aria-label="Close">×</button></form><div class="web-find-count" aria-live="polite"></div>`:''}<div class="browser-page">${renderWebsite(ui.browserUrl)}</div></div>`;
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
      else { clearInterval(ui.marketTimer); ui.marketDownload = null; data.marketInstalled = [...new Set([...(data.marketInstalled || []), id])]; data.marketEverInstalled = [...new Set([...(data.marketEverInstalled || []), id])]; data.notifications = data.notifications.filter(n => n.kind !== 'market-dl'); if ((data.marketPrefs?.notify) !== false) data.notifications.unshift({id: Date.now(), title: item.name, detail: ICSPlay.text(i18n.language, 'Successfully installed.'), kind: 'market'}); save(); renderStatus(); }
      if (ui.view === 'play-store') { const bar = viewport.querySelector('.icsp-progress b'); if (bar && ui.marketDownload?.phase === 'downloading') bar.style.width = `${Math.round(ui.marketDownload.progress * 100)}%`; else render(); }
    }, 350);
  }
  function navigatePlay(next) {
    ui.playHistory.push({...ui.play,scrollTop:viewport.querySelector('.play-content')?.scrollTop || 0});
    ui.play = {...ui.play,...next}; ui.overlay = ''; render();
  }
  function renderPhone() {
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),(key,context)=>i18n.t(key,context));
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
    const tabs = [['dialpad','Dial pad','dialer'],['history','Call log','history'],['favorites','Favorites','favourites']];
    const header = `<div class="phone-tabs" role="tablist">${tabs.map(([id,title,icon]) => `<button role="tab" aria-selected="${ui.phoneTab === id}" aria-label="${title}" data-action="phone-tab" data-id="${id}"><img src="assets/ic_ab_${icon}_holo_dark.png" alt=""></button>`).join('')}</div>`;
    let body;
    if (ui.phoneTab === 'history') {
      body = `<div class="phone-list">${(data.callHistory || []).length ? [...data.callHistory].reverse().map(call => `<div class="phone-log-row"><button class="phone-history-row" data-action="phone-log-detail" data-id="${call.time}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(contactByPhone(call.number)?.name || call.number)}<small><img src="assets/ic_call_outgoing_holo_dark.png" alt="">${new Date(call.time).toLocaleString(i18n.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></span></button><button class="phone-log-redial" data-action="phone-redial" data-id="${safe(call.number)}" aria-label="${safe(i18n.t('Call'))}"><img class="phone-redial" src="assets/ic_dial_action_call.png" alt=""></button></div>`).join('') : '<p class="empty-note">Call log is empty</p>'}</div>`;
    } else if (ui.phoneTab === 'favorites') {
      const favorites=data.contacts.filter(person=>person.favorite && (!ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())));
      body = `<div class="phone-list">${ui.phoneSearch !== undefined ? `<form class="phone-search" data-form="phone-search"><input name="query" aria-label="Search contacts" placeholder="Search contacts" value="${safe(ui.phoneSearch)}"><button aria-label="Search" type="submit"><img src="assets/ph-ic_dial_action_search.png" alt=""></button></form>` : ''}${favorites.length?`<div class="phone-section">Favorites</div><div class="phone-favorite-tiles">${favorites.map(person=>`<button data-action="contact-call" data-id="${person.id}"><img src="assets/phone-picture_unknown.png" alt=""><span>${safe(person.name)}</span></button>`).join('')}</div>`:''}<div class="phone-section">All contacts</div>${data.contacts.filter(person => !ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())).map(person => `<button class="phone-history-row" data-action="contact-call" data-id="${person.id}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(person.name)}<small>${safe(person.phone)}</small></span></button>`).join('')}</div>`;
    } else {
      body = `<div class="ics-dialer"><div class="dial-digits"><output aria-label="Phone number">${safe(ui.dial)}</output><button data-action="dial-delete" aria-label="Delete"><img src="assets/ic_dial_action_delete.png" alt=""></button></div><div class="ics-dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}_wht.png" alt=""></button>`).join('')}</div><div class="dial-actions"><button data-action="phone-search" aria-label="Search contacts"><img src="assets/ph-ic_dial_action_search.png" alt=""></button><button class="dial-call" data-action="call" aria-label="Call"><img src="assets/ic_dial_action_call.png" alt=""></button><button data-action="phone-menu" aria-label="More options"><img src="assets/ph-ic_menu_overflow.png" alt=""></button></div></div>`;
    }
    return `<div class="app-view phone-app">${header}${body}</div>`;
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
    ui.peopleDraft = HoloContactEditor.fromPerson(person,data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id));
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  function peopleOverlay() {
    /* ContactDetailFragment's view_contact menu (Edit, Share, Delete, Set ringtone, the checkable All calls to voicemail
       and, from 4.2, Place on Home screen), people_options' overflow (Contacts to display, Import/export, Accounts,
       Settings and, from 4.2, Help; Clear frequents only with frequent contacts) and ContactDeletionInteraction (Ice Cream
       Sandwich titles it "Delete contact?" with the alert icon; later releases show only the message), in this image's
       words (people-strings.js). */
    if (ui.overlay === 'people-share') return PeopleIO.shareOverlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-vcard') return PeopleIO.overlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-ringtone') return PeopleIO.ringtone({data, ui, t: key => i18n.t(key), locale: i18n.locale()}, contact(ui.selectedContact));
    const P = key => PeopleStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    const option = (action, label, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(P(label))}</button>`;
    if (ui.overlay === 'people-menu') { const person = contact(ui.selectedContact); return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu people-menu" data-no-translate>${option('people-edit', 'Edit')}${option('psh-open', 'Share', person?.id)}${option('people-delete', 'Delete')}${option('people-ringtone', 'Set ringtone')}<button data-action="people-voicemail" role="menuitemcheckbox" aria-checked="${!!person?.sendToVoicemail}"><span>${safe(P('All calls to voicemail'))}</span><img src="assets/btn_check_${person?.sendToVoicemail ? 'on' : 'off'}_holo_dark.png" alt=""></button>${PeopleStrings.has('Place on Home screen') ? option('people-place-home', 'Place on Home screen', person?.id) : ''}</div>`; }
    if (ui.overlay === 'people-list-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu people-menu people-list-menu" data-no-translate>${['Contacts to display', 'Import/export', 'Accounts', 'Settings', ...(PeopleStrings.has('Help') ? ['Help'] : [])].map(label => label === 'Import/export' ? option('vcf-open', label) : label === 'Contacts to display' ? option('pfl-open', label) : label === 'Settings' ? option('pst-open', label) : option('toast', label, unavailable)).join('')}</div>`;
    if (ui.overlay === 'people-delete') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="people-alert" role="alertdialog" aria-label="${safe(P('This contact will be deleted.'))}" data-no-translate>${PeopleStrings.has('Delete contact?') ? `<h3><img src="assets/people-ic_dialog_alert_holo_light.png" alt="">${safe(P('Delete contact?'))}</h3>` : ''}<p>${safe(P('This contact will be deleted.'))}</p><div class="people-alert-buttons">${option('close-overlay', 'Cancel')}${option('people-confirm-delete', 'OK')}</div></div>`;
    const group = data.contactGroups.find(g=>g.id===ui.peopleEditGroup);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog mms-dialog people-editor" role="dialog" aria-label="${group?'Edit group':'New group'}" data-form="people-group"><h3>${group?'Edit group':'New group'}</h3><label>Group name<input name="name" required maxlength="50" value="${safe(group?.name||'')}"></label>${data.contacts.map(p=>`<label class="people-membership"><input type="checkbox" name="members" value="${p.id}" ${group?.members.includes(p.id)?'checked':''}>${safe(p.name)}</label>`).join('')}<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
  }
  function renderMessaging() {
    return ICSMessaging.render(data, ui, key => i18n.t(key), i18n.locale());
  }
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
  /* Messaging overlays from this image's Mms code: the overflow menus (conversation_list_menu with ConversationList's
     visibility rules; ComposeMessageActivity.onPrepareOptionsMenu: Add subject, Send once there is something to send,
     Insert smiley, Delete thread or Discard, Add to People for a number that is no contact, Settings), Insert smiley
     (showSmileyDialog: smiley_menu_item rows of icon, name and text), the message context menu (Copy text, Forward,
     Lock / Unlock, View details, Delete), ConversationList.confirmDeleteThreadDialog (Delete? with "Delete locked
     messages" while locked messages are there), confirmDeleteDialog and MessageUtils.getTextMessageDetails. The words
     are mms-strings.js'. */
  function renderMessageOverlay() {
    const M = key => MmsStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(text)}</button>`;
    const alert = (title, body, buttons = '', icon = false) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="mms-alert" role="alertdialog" aria-label="${safe(title)}" data-no-translate>${title ? `<h3>${icon ? '<img src="assets/mms-ic_dialog_alert_holo_light.png" alt="">' : ''}${safe(title)}</h3>` : ''}${body}${buttons ? `<div class="mms-alert-buttons">${buttons}</div>` : ''}</div>`;
    const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread', 'new'].includes(ui.sub), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
      const messages = ui.sub === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      const to = ui.sub === 'thread' ? String(ui.thread) : ICSMessaging.recipient(draft.recipient || '', data.contacts)?.key || '';
      const items = composing
        ? option('toast', M('Add subject'), unavailable) + ((draft.body || '').trim() || draft.attachment ? option('mms-send-now', M('Send')) : '') + option('mms-smiley', M('Insert smiley'))
          + (messages.length ? option('mms-delete-thread', M('Delete thread')) : option('mms-discard', M('Discard'))) + (to.startsWith('tel:') ? option('toast', M('Add to People'), unavailable) : '') + option('toast', M('Settings'), unavailable)
        : option('toast', M('Settings'), unavailable) + (data.messages.length ? option('mms-delete-all', M('Delete all threads')) : '');
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}" data-no-translate>${items}</div>`;
    }
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(MmsStrings.t('Attach'))}" data-no-translate><h3>${safe(MmsStrings.t('Attach'))}</h3><div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || `<p>${safe(i18n.t('No photos'))}</p>`}</div></div>`;
    if (ui.overlay === 'mms-smiley') return alert(M('Insert smiley'), `<div class="mms-smileys">${MmsStrings.SMILEYS.map(([name, text, icon]) => `<button data-action="mms-insert-smiley" data-id="${safe(text)}"><img src="assets/mms-emo_im_${icon}.png" alt=""><span>${safe(M(name))}</span><b>${safe(text)}</b></button>`).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') {
      const scope = ui.mmsDelete === 'all' ? data.messages : ui.mmsDelete === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      if (ui.mmsDelete === 'message') return alert('', `<p>${safe(M(message?.locked ? 'Delete this locked message?' : 'The message will be deleted.'))}</p>`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')));
      const locked = scope.some(m => m.locked) ? `<label class="mms-alert-check"><input type="checkbox" data-action="mms-delete-locked" ${ui.mmsDeleteLocked ? 'checked' : ''}><span>${safe(M('Delete locked messages'))}</span></label>` : '';
      return alert(M('Delete?'), `<p>${safe(M(ui.mmsDelete === 'all' ? 'All threads will be deleted.' : 'The entire thread will be deleted.'))}</p>${locked}`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')), true);
    }
    if (!message) return '';
    if (ui.overlay === 'mms-message') return alert(M('Message options'), `<div class="mms-alert-list">${option('mms-copy', M('Copy text'))}${option('mms-forward', M('Forward'))}${option('mms-lock', M(message.locked ? 'Unlock' : 'Lock'))}${option('mms-details', M('View details'))}${option('mms-delete-message', M('Delete'))}</div>`);
    if (ui.overlay === 'mms-details') {
      const when = message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale(), {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : i18n.t(message.time || '');
      const lines = [M('Type: ') + M(message.attachment ? 'Multimedia message' : 'Text message'), M(message.mine ? 'To: ' : 'From: ') + ICSMessaging.identity(message.contact, data.contacts).phone, M(message.mine ? 'Sent: ' : 'Received: ') + when];
      return alert(M('Message details'), `<p class="mms-details">${lines.map(safe).join('<br>')}</p>`);
    }
    return '';
  }
  function photoStyle(photo) { return `background-image:url('${ICSMedia.image(photo)}');background-size:cover;background-position:center`; }
  function renderGallery() { return ICSMedia.gallery(data,ui,key=>i18n.t(key),i18n.language); }
  function renderCamera() { return ICSMedia.camera(data,ui,key=>i18n.t(key)); }
  function galleryStep(direction) {
    const items=ICSMedia.photos(data,ui.galleryAlbum); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }

  function renderCalendar() {
    return ICSCalendar.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate());
  }
  function calendarRender() {
    render();
    const timeline=viewport.querySelector('.cal-time-scroll');
    if(timeline)timeline.scrollTop=dp(8*48/.85);
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
    ui.eventDraft=ICSCalendar.normalize(item || {date:ui.selectedDate,time:'12:00',title:''});
    ui.calendarError='';ui.overlay='';ui.sub='event-edit';render();
  }
  function renderClock() { return ICSDeskClock.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate()); }
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

  /* Calculator (IMM76I Calculator.apk), layout-port/main.xml: the display (display_style: 30 sp, 8 dp padding) with the
     overflow_menu button (48 dp, shown as the phone has no menu key), the btn_function strip with CLR / DELETE (15 dp) at a
     quarter, and the CalculatorViewPager's simple_pad.xml / advanced_pad.xml (weights 3 : 1.5 : 10). button_style 40 dp on
     btn_function, digit_button_style on btn_digit, button_small_style 30 dp for sin, cos, tan, ln and log; 1 dp gaps. The
     labels are the image's (strings.xml: "sen" in Spanish, "E" in French). */
  const CALC = key => { const row = window.StockStrings?.calculator?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
  function renderCalculator() {
    const basic = ['7','8','9','÷','4','5','6','×','1','2','3','−','.','0','=','+'];
    const advanced = ['sin','cos','tan','ln','log','!','π','e','^','(',')','√'], small = ['sin','cos','tan','ln','log'];
    const label = key => ['sin','cos','tan','ln','log','e'].includes(key) ? CALC(key) : key;
    const keys = items => items.map(key => `<button class="${/^[0-9.]$/.test(key) ? 'digit' : small.includes(key) ? 'function small' : 'function'}" data-action="calc-key" data-id="${key}">${safe(label(key))}</button>`).join('');
    return `<div class="app-view"><div class="ics-calculator"><div class="ics-calc-display"><output aria-label="Calculator display">${safe(ui.calc === 'Error' ? CALC('Error') : ui.calc)}</output><button data-action="calc-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></div><div class="ics-calc-delete"><span></span><button data-action="calc-key" data-id="${ui.calcFresh ? 'C' : '⌫'}" aria-label="${ui.calcFresh ? 'Clear' : 'Delete'}">${safe(CALC(ui.calcFresh ? 'CLR' : 'DELETE'))}</button></div><div class="calc-pager"><div class="calc-panels" style="transform:translateX(-${ui.calcPanel * 50}%)"><div class="ics-calc-grid" aria-label="${safe(CALC('Basic panel'))}" ${ui.calcPanel ? 'inert' : ''}>${keys(basic)}</div><div class="ics-calc-grid scientific" aria-label="${safe(CALC('Advanced panel'))}" ${ui.calcPanel ? '' : 'inert'}>${keys(advanced)}</div></div></div></div></div>`;
  }
  function setCalculatorPanel(index) {
    ui.calcPanel = index;
    const track = viewport.querySelector('.calc-panels');
    if (!track) return;
    track.style.transition = '';
    track.style.transform = `translateX(-${index * 50}%)`; snapResting(track);
    track.querySelectorAll('.ics-calc-grid').forEach((panel, i) => { panel.inert = i !== index; });
  }
  function renderMusic() {
    return ICSMusic.render(ui.music,ui,key=>i18n.t(key));
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
    const progress=viewport.querySelector('.music-progress');if(progress&&document.activeElement!==progress)progress.value=ui.music.position;
    const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);
  }
  // Email 4.0.4 (email.js): its screens, menus and actions; Attach file opens the Gallery's picker.
  function emailContext() {
    return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), hour24: !!data.settings.hour24, root: viewport, signature: EmailPrefs.signatureBody(data), openSettings: () => { ui.sub = 'em-settings'; ui.emPref = ''; render(); },
      save, render, renderOverlay, toast, back: navigateBack, focus: selector => viewport.querySelector(selector)?.focus(),
      photo: photo => ICSMedia.art(photo), pickPicture: () => { openApp('gallery'); ui.galleryPick = 'email'; ui.galleryAlbum = ''; render(); }};
  }
  function renderEmail() {
    if (ui.sub === 'em-settings') return EmailPrefs.render(data, ui, i18n.language, key => i18n.t(key), ICSEmail.account);
    return ICSEmail.render(emailContext());
  }
  // Share contact via Email or Gmail: the app's compose with the contact card attached.
  function shareVcard(app, file) {
    ui.overlay = ''; renderOverlay(); openApp(app);
    if (app === 'gmail') { ICSGmail.handle('g4-compose', '', gmailContext()); const d = data.gmail40.find(m => m.id === ui.g4Id); if (d) d.attachment = {...file, size: `${Math.max(1, Math.round(file.size / 1024))}KB`}; }
    else { composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) d.attachment = {...file, size: file.size < 1024 ? `${file.size}B` : `${(file.size / 1024).toFixed(2)}KB`}; }
    save(); render();
  }
  function composeEmail(source=null,forward=false,to='') {
    ICSEmail.startCompose(emailContext(),source,source?(forward?'forward':'reply'):'',to);
  }
  function resetSimulator() {
    data=clone(defaultData);data.settings={...ICSSettingsDetail.defaults,...ICSSystemSettings.defaults,...data.settings};
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
  function addNotification(title, detail) { data.notifications.unshift({ id: Date.now(), title, detail }); save(); renderStatus(); }
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}) });
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
  }

  let suppressClickUntil = 0;
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button || !screen.contains(button)) return;
    event.preventDefault();
    if (Date.now() < suppressClickUntil) return;
    const { action, id, app, url } = button.dataset;
    if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return;
    // Navigation's Contacts / Starred places pickers and Places' search and categories (ics-extra-apps.js).
    if (action.startsWith('xa-') && JBExtraApps.handle(action, id, extraContext())) return;
    if (action === 'mr-type-dest') { ui.overlay = 'mr-type'; renderOverlay(); overlayRoot.querySelector('input')?.focus(); return; }
    if (action === 'mr-type-ok') { const to = overlayRoot.querySelector('input')?.value.trim(); ui.overlay = ''; renderOverlay(); if (to) { const rt = MapsRoute.route(mrContext(), {to, mode: 'drive', avoid: data.mapsAvoid || {}}); MapsRoute.startNav(mrContext(), {name: to, km: rt.km, min: rt.min, mode: 'drive'}); render(); } return; }
    if (action === 'mr-exit-ok') { ui.overlay = ''; renderOverlay(); MapsRoute.stopNav(mrContext()); render(); return; }
    if(ui.locked&&!['back','alarm-dismiss','alarm-snooze'].includes(action))return;
    if (ui.view === 'downloads' && action.startsWith('hdl-') && HoloDownloads.handle(action, id, dlContext())) return;
    if (ui.view === 'gmail' && action.startsWith('g4-') && ICSGmail.handle(action, id, gmailContext())) return;
    if (ui.view === 'gmail' && action.startsWith('g4p-') && ICSGmailPrefs.handle(action, id, gmailContext())) return;
    if (ui.view === 'email' && action.startsWith('email-') && ICSEmail.handle(action, id, emailContext())) return;
    // Maps, Earth, News & Weather and the simple extras.
    if (['maps', 'latitude', 'earth', 'news-weather', 'messenger', 'navigation', 'local', 'movie-studio'].includes(ui.view)) {
      if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return; }
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
      if (action === 'news-share') { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector('.nwp-story h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; messageDraft().body = title; save(); render(); return; }
      if (action.startsWith('nwp-')) { NewsPrefs.handle(action, id, {ui, data, lang: i18n.language, save, render, input: () => viewport.querySelector('[data-nwp-input]')?.value, unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))}); return; }
    }
    if (ICSGoogleApps.APPS.includes(ui.view) && action.startsWith('ga-') && ICSGoogleApps.handle(action, id, googleAppsContext())) return;
    if (action.startsWith('lng-') && ICSLanguage.handle(action, id, {data, ui, save, render, renderOverlay, toast: text => toast(i18n.t(text))})) return;
    if (ui.view === 'play-music' && action.startsWith('pm4-') && ICSPlayMusic.handle(action, id, playMusicContext(), button)) return;
    // The Contacts editor (contact-editor.js): fields, types, photo and its dialogs.
    if (ui.view === 'people' && action.startsWith('hce-') && HoloContactEditor.handle(action, id, {draft: ui.peopleDraft, form: viewport.querySelector('#people-editor'), ui, render, renderOverlay,
      focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      takePhoto: () => { const photo = {...ICSMedia.scene(data), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`, album: 'camera', created: Date.now()}; data.photos.unshift(photo); save(); ui.peopleDraft.photo = photo.id; render(); }})) return;
    if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return;
    if (action.startsWith('mfx-') && MusicFX.handle(action, id, musicFxContext())) return;
    if (action.startsWith('icsa-') && ICSA11y.handle(action, id, a11yContext())) return;
    // Email's Quick responses, ringtone and server screens (email-prefs.js).
    if (action.startsWith('empx-') && EmailPrefs.handle(action, id, {data, ui, save, render, root: viewport, account: ICSEmail.account})) return;
    if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data, ui}); if (result) { if (result.share) { shareVcard(result.share.app, result.share.file); return; } if (result.save) save(); renderOverlay(); render(); return; } }
    if (action.startsWith('vcf-')) {
      const result = PeopleIO.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      if (result) { if (result.save) save(); for (const title of result.notify || []) addNotification(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return; }
    }
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
      case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
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
      case 'icsp-open': { const item = ICSPlay.find(id); if (item?.app) openApp(item.app); else toast(ICSPlay.text(i18n.language, 'Unavailable')); break; }
      case 'icsp-uninstall': ui.overlay = ''; renderOverlay(); data.marketInstalled = (data.marketInstalled || []).filter(x => x !== id); save(); render(); break;
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
      case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'voice-search': vs3Start(); break;
      case 'vs3-again': vs3Start(); break;
      case 'vs3-cancel': vs3Stop(); ui.overlay = ''; renderOverlay(); break;
      case 'vs3-help': vs3Stop(); ui.vs3 = {phase: 'help'}; renderOverlay(); break;
      case 'vs3-settings': vs3Stop(); ui.overlay = ''; renderOverlay(); openApp('settings'); ui.sub = 'lng-vs'; render(); break;
      case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; saveMusic(); render(); break;
      case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
      case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
      case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
      case 'close-overlay': ui.overlay = ''; screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`; renderOverlay(); break;
      case 'clear-notifications': data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break;
      case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
        ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
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
      case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
      case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id);else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
      case 'sd-battery-history': ui.sub='battery-history';render();break;
      case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
      case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
      case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
      case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
      case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
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
      case 'noop': break;
      case 'browser-search': openApp('browser'); document.querySelector('.browser-toolbar input')?.focus(); break;
      case 'browser-link': navigateBrowser(url); break;
      case 'browser-back': browserBack(); break;
      case 'browser-forward': browserForward(); break;
      case 'browser-tabs': ui.sub = 'tabs'; render(); break;
      case 'browser-menu': ui.overlay = 'browser-menu'; renderOverlay(); break;
      case 'browser-bookmarks': ui.sub = 'bookmarks'; ui.overlay = ''; render(); break;
      case 'browser-bookmark': navigateBrowser(id); break;
      case 'browser-saved': ui.sub='saved'; ui.overlay=''; render(); break;
      case 'browser-save-page': data.savedPages ||= []; if(!data.savedPages.includes(ui.browserUrl))data.savedPages.push(ui.browserUrl); save(); ui.overlay=''; renderOverlay(); toast('Page saved'); break;
      case 'browser-remove-saved': if(ui.sub==='saved')data.savedPages=data.savedPages.filter(url=>url!==id); else data.bookmarks=data.bookmarks.filter(url=>url!==id); save(); render(); break;
      case 'browser-close-tab': ICSBrowserSession.close(ui.browserSession,Number(id)); saveBrowserState(); render(); break;
      case 'browser-refresh': ui.overlay=''; render(); break;
      case 'browser-find': ui.browserFind=''; ui.overlay=''; render(); viewport.querySelector('.web-find input')?.focus(); break;
      case 'browser-close-find': ui.browserFind=undefined; render(); break;
      case 'browser-history': ui.sub = 'history'; render(); break;
      case 'browser-tab': ui.browserSession.active = Number(id); ui.sub = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-new-tab': if (!ICSBrowserSession.add(ui.browserSession)) { toast('Tab limit reached'); break; } ui.sub = ''; ui.overlay = ''; ui.browserFind = undefined; saveBrowserState(); render(); break;
      case 'browser-save': ui.overlay = ''; renderOverlay(); if (!data.bookmarks.includes(ui.browserUrl)) { data.bookmarks.push(ui.browserUrl); save(); toast('Bookmark saved'); } else toast('Already bookmarked'); break;
      case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
      case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
      case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
      case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phones[0].value=ui.dial; render(); break;
      case 'phone-redial': startPhoneCall(id); break;
      case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
      case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
      case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
      case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
      case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
      case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
      case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
      case 'phone-log-back': ui.sub='';ui.phoneTab='history';render();break;
      case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
      case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
      case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
      case 'people-edit': editPerson(); break;
      case 'people-menu': ui.overlay='people-menu'; renderOverlay(); break;
      case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
      case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
      case 'people-list-menu': ui.overlay='people-list-menu'; renderOverlay(); break;
      case 'people-voicemail': { const person=contact(ui.selectedContact); if(person)person.sendToVoicemail=!person.sendToVoicemail; save(); ui.overlay=''; renderOverlay(); break; }
      case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
      case 'people-ringtone': ui.overlay = 'people-ringtone'; renderOverlay(); break;
      case 'people-group': ui.peopleGroup=id; ui.sub='group'; ui.peopleQuery=''; render(); break;
      case 'people-new-group': ui.peopleEditGroup=''; ui.overlay='people-group'; renderOverlay(); break;
      case 'people-edit-group': ui.peopleEditGroup=ui.peopleGroup; ui.overlay='people-group'; renderOverlay(); break;
      case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
      case 'new-contact': editPerson(true); break;
      case 'contact-call': startPhoneCall(button.dataset.number||contact(id)?.phone||'');break;
      case 'people-discard': ui.sub=ui.sub==='edit'?'detail':'';ui.peopleDraft=null;render();break;
      case 'contact-message': openMessageThread(id); break;
      case 'contact-email': {const recipient=button.dataset.email||contact(id)?.email||'';openApp('email');composeEmail(null,false,recipient);break;}
      case 'thread': openMessageThread(id); break;
      case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
      case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
      case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
      case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
      case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
      case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
      case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
      case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
      case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
      case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
      case 'mms-delete-thread': case 'mms-delete-message': case 'mms-delete-all': ui.mmsDelete = action.slice(11); ui.mmsDeleteLocked = false; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
      case 'mms-delete-locked': ui.mmsDeleteLocked = !ui.mmsDeleteLocked; renderOverlay(); break;
      case 'mms-lock': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (message) { message.locked = !message.locked; save(); } ui.overlay = ''; render(); scrollMessages(); break; }
      case 'mms-copy': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); navigator.clipboard?.writeText(message?.body || '').catch(() => {}); ui.overlay = ''; renderOverlay(); break; }
      case 'mms-send-now': ui.overlay = ''; renderOverlay(); viewport.querySelector('.mms-compose')?.requestSubmit(); break;
      case 'mms-confirm-delete': {
        // Deleting a thread or all threads keeps locked messages unless "Delete locked messages" is ticked.
        const doomed = m => ui.mmsDelete === 'message' ? String(m.id) === String(ui.mmsMessage) : (ui.mmsDelete === 'all' || String(m.contact) === String(ui.thread)) && (!m.locked || ui.mmsDeleteLocked);
        data.messages = data.messages.filter(m => !doomed(m));
        if (ui.mmsDelete === 'all') data.messageDrafts = {};
        if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; if (!data.messages.some(m => String(m.contact) === String(ui.thread))) ui.sub = ''; }
        save(); ui.overlay = ''; render(); break;
      }
      case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
      case 'gallery-camera': openApp('camera'); break;
      case 'gallery-album': ui.galleryAlbum=id; ui.sub='album';ui.gallerySlideshow=false;render();break;
      // GET_CONTENT hands the picture back to whichever app asked: Email or Gmail.
      case 'gallery-pick': { const photo = data.photos.find(p => p.id === Number(id)), caller = ui.galleryPick; ui.galleryPick = ''; ui.sub = ''; openApp(caller, true); if (caller === 'gmail') ICSGmail.attach(gmailContext(), photo); else ICSEmail.attach(emailContext(), photo); render(); break; }
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
      case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('messaging');ui.sub='new';messageDraft().attachment=clone(photo);save();render();break;}
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
      case 'calendar-prev': calendarMove(-1); break;
      case 'calendar-next': calendarMove(1); break;
      case 'calendar-day': ui.selectedDate=id;ui.calendarMode=data.calendarMode='Day';save();calendarRender();break;
      case 'calendar-today': ui.selectedDate=today();calendarRender();break;
      // Calendar's From / To buttons: the picker starts at the form's value; Set writes it back and, like EditEventView,
      // moves the end with the start so the event keeps its length.
      // The repeat / reminder spinners (calendar.js): the list opens under the field (a dialog on 5.1) and the pick goes
      // straight into the form's hidden input, as the date and time pickers do.
      case 'calspin': {
        const form=viewport.querySelector('form[data-form="event"]');if(!form)break;
        const draft={...ICSCalendar.normalize(ui.eventDraft||{}),...Object.fromEntries(new FormData(form))};
        // Spinner's drop-down (Widget.Holo.Spinner: ListPopupWindow, no drop-down offsets): PopupWindow.findDropDownPosition
        // first has the event's ScrollView bring the spinner and the list into view (requestRectangleOnScreen), then opens the
        // list below the spinner when it fits, otherwise on the side with more room, and ListPopupWindow.getMaxAvailableHeight
        // caps its height at that room between the status bar and the navigation bar. Rows are 48 dp.
        const items=ICSCalendar.spinner(id,draft,i18n.locale(),key=>i18n.t(key)),content=items.length*dp(48);
        const sr=screen.getBoundingClientRect(),k=screen.clientWidth/sr.width,scroller=button.closest('.cal-scroll');
        if(scroller){const v=scroller.getBoundingClientRect(),a=button.getBoundingClientRect(),top=a.top,bottom=a.bottom+content/k;
          if(bottom>v.bottom&&top>v.top)scroller.scrollTop+=Math.min(bottom-v.bottom,top-v.top);else if(top<v.top)scroller.scrollTop-=v.top-top;}
        const b=button.getBoundingClientRect(),above=(b.top-sr.top)*k,below=(b.bottom-sr.top)*k;
        const room={below:screen.clientHeight-navRoot.offsetHeight-below,above:above-statusRoot.offsetHeight},onTop=content>room.below&&room.above>room.below;
        const height=Math.min(content,onTop?room.above:room.below);
        ui.calSpin={field:id,value:form.elements[id].value,items,title:button.getAttribute('aria-label')||'',left:(b.left-sr.left)*k,width:b.width*k,top:onTop?above-height:below,height};
        ui.overlay='calendar-spinner';renderOverlay();break;
      }
      case 'calspin-pick': {
        const form=viewport.querySelector('form[data-form="event"]'),sp=ui.calSpin;
        if(form&&sp){form.elements[sp.field].value=id;const field=form.querySelector(`[data-action="calspin"][data-id="${sp.field}"]`);if(field)field.textContent=sp.items.find(item=>item.value===id)?.label||'';}
        ui.overlay='';renderOverlay();break;
      }
      case 'calpick': {
        const form=viewport.querySelector('form[data-form="event"]'),value=form?.elements[id]?.value||'';
        ui.icsPicker=ICSPickers.fromValue(/date/i.test(id)?'date':'time',value||(/date/i.test(id)?ui.selectedDate:'09:00'),{field:id,theme:'light',setAction:'calpick-set',hour24:!!data.settings.hour24});
        ui.overlay='icpk';renderOverlay();break;
      }
      case 'icpk-step': ICSPickers.step(ui.icsPicker,id);renderOverlay();break;
      case 'calpick-set': {
        const form=viewport.querySelector('form[data-form="event"]'),p=ui.icsPicker;ui.overlay='';renderOverlay();if(!form||!p)break;
        const get=name=>form.elements[name].value,stamp=(d,t)=>new Date(`${d}T${t||'00:00'}`).getTime();
        const before=stamp(get('date'),get('time')),length=stamp(get('endDate'),get('endTime'))-before;
        form.elements[p.field].value=p.kind==='date'?ICSPickers.iso(p):ICSPickers.hhmm(p);
        if(p.field==='date'||p.field==='time'){const end=new Date(stamp(get('date'),get('time'))+Math.max(0,length||0));form.elements.endDate.value=ICSCalendar.iso(end);form.elements.endTime.value=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;}
        for(const name of ['date','time','endDate','endTime'])form.querySelector(`[data-action="calpick"][data-id="${name}"]`).textContent=/date/i.test(name)?ICSCalendar.dateButton(get(name),i18n.locale()):ICSCalendar.timeButton(get(name),i18n.locale(),!!data.settings.hour24);
        break;
      }
      case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
      case 'calendar-mode': ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender();break;
      case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input').focus();break;
      case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit({date,time,title:''});break;}
      case 'event-new': calendarEdit();break;
      case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
      case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none'){ui.overlay='calendar-edit-scope';renderOverlay();} else calendarEdit(series); break; }
      case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit({...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
      case 'event-delete-scope': deleteEventScope(id); break;
      case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
      case 'event-delete': ui.overlay=ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'calendar-delete-scope':'calendar-delete';renderOverlay();break;
      case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender();break;
      case 'clock-alarms': ui.sub='alarms'; render(); break;
      case 'clock-dim': ui.clockDim=!ui.clockDim; render(); break;
      case 'alarm-new': editAlarm(); break;
      case 'alarm-edit': editAlarm(id); break;
      case 'alarm-cancel': ui.alarmDraft=null; ui.sub='alarms'; render(); break;
      case 'alarm-draft-toggle': ui.alarmDraft[id]=!ui.alarmDraft[id]; render(); break;
      // SetAlarm's time preference opens the framework's TimePickerDialog (Holo dark, like DeskClock).
      case 'alarm-field': if(id==='time'){ui.icsPicker=ICSPickers.fromValue('time',ICSDeskClock.normalize(ui.alarmDraft).time,{theme:'dark',setAction:'alarm-time-pick',hour24:!!data.settings.hour24});ui.overlay='icpk';renderOverlay();break;} ui.overlay='clock-'+id; renderOverlay(); break;
      case 'alarm-time-pick': ui.alarmDraft.time=ICSPickers.hhmm(ui.icsPicker); ui.overlay=''; renderOverlay(); render(); break;
      case 'alarm-save': {
        const alarm=ICSDeskClock.normalize(ui.alarmDraft); delete alarm.snoozedUntil; delete alarm.lastFiredMinute;
        const index=data.alarms.findIndex(item=>item.id===alarm.id);
        if(index<0){alarm.id=Date.now();data.alarms.push(alarm);}else data.alarms[index]=alarm;
        save(); ui.alarmDraft=null; ui.sub='alarms'; render(); toast('Alarm set'); break;
      }
      case 'alarm-delete': ui.overlay='clock-delete'; renderOverlay(); break;
      case 'alarm-confirm-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==ui.alarmDraft.id); save(); ui.alarmDraft=null; ui.overlay=''; ui.sub='alarms'; render(); break;
      case 'alarm-snooze': {
        const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
        if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+10*60000;save();}
        ui.overlay='';render();{const message=ICSDeskClock.snoozeMessage(new Date(alarm?.snoozedUntil||deviceDate().getTime()+600000),{hour24:!!data.settings.hour24,locale:i18n.locale()});if(message)toast(message);}break;
      }
      case 'alarm-dismiss': ui.overlay=''; render(); break;
      case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
      case 'calc-menu': ui.overlay = 'calc-menu'; renderOverlay(); break;
      case 'calc-panel': ui.overlay = ''; renderOverlay(); setCalculatorPanel(Number(id)); break;
      case 'calc-clear': data.calcHistory = []; ui.calcHistoryIndex = -1; save(); operateCalculator('C'); ui.overlay = ''; render(); break;
      case 'calc-key': operateCalculator(id); render(); break;
      case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
      case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
      case 'music-tab': ui.musicTab=id;ui.sub='';render();break;
      case 'music-library': ui.sub='';render();break;
      case 'music-player': ui.sub='player';render();break;
      case 'music-queue': ui.sub='queue';render();break;
      case 'music-group': ui.musicGroup=id;ui.sub='music-group';render();break;
      case 'music-select': ui.music.queue=[...ICSMusic.listing(ui.music,ui)];ui.music.track=Number(id);ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
      case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;saveMusic();render();break;
      case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();break;
      // AOSP Music (targetSdkVersion 9): the navigation bar's legacy menu key and the long-press context menus.
      // NewsActivity (Theme.NoTitleBar, targetSdkVersion 11) has no action bar, so PhoneWindow asks for the menu key.
      case 'legacy-menu': if(ui.view==='music'){ui.music.lang=i18n.language;ui.overlay='music-options';renderOverlay();}else if(ui.view==='news-weather'){ui.overlay='sa-menu';renderOverlay();}break;
      case 'music-ctx-play': {
        const [kind,key]=String(id).includes(':')?String(id).split(/:(.*)/s):['track',id];
        const list=kind==='track'?[Number(key)]:kind==='playlist'?(key==='recent'?ICSMusic.listing(ui.music,{sub:''}):ui.music.playlists.find(p=>String(p.id)===key)?.tracks||[]):tracks.map((_,i)=>i).filter(i=>tracks[i].artist===key||tracks[i].album===key);
        ui.overlay='';renderOverlay();if(!list.length)break;ui.music.queue=[...list];ui.music.track=list[0];ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;
      }
      case 'music-party': ui.music.party=!ui.music.party;if(ui.music.party)ui.music.shuffle=true;ui.overlay='';renderOverlay();saveMusic();render();break;
      case 'music-shuffle-all': {const list=ICSMusic.listing(ui.music,{sub:''});ui.overlay='';renderOverlay();if(!list.length)break;ui.music.shuffle=true;ui.music.queue=[...list];ui.music.track=list[Math.floor(Math.random()*list.length)];ui.music.position=0;ui.music.playing=true;saveMusic();ui.sub='player';render();break;}
      case 'music-ringtone': {const track=tracks[Number(id)];ui.overlay='';renderOverlay();if(!track)break;data.settings.ringtoneName=track.title;save();toast(AndroidStrings.format(ICSMusic.M('ringtone_set',i18n.language), track.title));break;}
      case 'music-delete': {const n=Number(String(id).replace(/^group:/,''));if(String(id).startsWith('group:')){ui.musicSelected=null;ui.overlay='';renderOverlay();break;}ui.musicSelected=n;ui.music.lang=i18n.language;ui.overlay='music-delete';renderOverlay();break;}
      case 'music-delete-confirm': {ui.music.deleted=[...new Set([...(ui.music.deleted||[]),ui.musicSelected])];ui.music.queue=ui.music.queue.filter(x=>x!==ui.musicSelected);ui.music.playlists.forEach(p=>{p.tracks=p.tracks.filter(x=>x!==ui.musicSelected);});if(ui.music.track===ui.musicSelected){ui.music.playing=false;ui.sub='';}ui.overlay='';renderOverlay();saveMusic();render();break;}
      case 'music-playlist-delete': ui.music.playlists=ui.music.playlists.filter(p=>String(p.id)!==id);ui.overlay='';renderOverlay();saveMusic();render();break;
      case 'music-search': ui.overlay='';renderOverlay();openApp('search');break;
      case 'music-add-to-playlist': if(id&&!String(id).startsWith('group:'))ui.musicSelected=Number(id);ui.music.lang=i18n.language;ui.overlay='music-playlist-choice';renderOverlay();break;
      case 'music-new-playlist': ui.musicAddPending=id==='add';ui.overlay='music-new-playlist';renderOverlay();break;
      case 'music-add-confirm': {const playlist=ui.music.playlists.find(p=>String(p.id)===id);if(playlist&&!playlist.tracks.includes(ui.musicSelected))playlist.tracks.push(ui.musicSelected);saveMusic();ui.overlay='';render();toast('Added to playlist');break;}
      case 'music-remove-from-playlist': {const playlist=ui.music.playlists.find(p=>String(p.id)===ui.musicGroup);if(playlist)playlist.tracks=playlist.tracks.filter(track=>track!==ui.musicSelected);saveMusic();ui.overlay='';render();break;}
      default: break;
    }
  });

  document.addEventListener('submit', event => {
    const form = event.target.closest('[data-form]');
    if (!form || !screen.contains(form)) return;
    event.preventDefault(); const values = new FormData(form);
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
      case 'hce-label': HoloContactEditor.submitLabel(values,{draft:ui.peopleDraft,ui,render,renderOverlay}); break;
      case 'people-save': {
        // ContactEditorFragment.save: every field of the form; a card with nothing in it is not kept.
        const id=ui.sub==='edit'?ui.selectedContact:Date.now();
        const person=HoloContactEditor.commit(viewport.querySelector('#people-editor'),ui.peopleDraft,contact(id)||{id});
        if(!person.name&&!person.phone&&!person.email){ui.sub=ui.sub==='edit'?'detail':'';ui.peopleDraft=null;render();break;}
        if(!person.name)person.name=person.phone||person.email;
        const index=data.contacts.findIndex(p=>p.id===id);if(index>=0)data.contacts[index]=person;else data.contacts.push(person);
        const groups=ui.peopleDraft.groups||[];
        data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});
        save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast(HoloContactEditor.T(i18n.language,'Contact saved.'));break;
      }
      case 'people-ringtone': { const person = contact(ui.selectedContact), choice = String(values.get('choice') || 'default'); if (person) { if (choice === 'default') delete person.ringtone; else person.ringtone = choice; save(); } ui.overlay = ''; renderOverlay(); window.SystemSounds?.stop?.(); render(); break; }
      case 'people-group': {
        const name=String(values.get('name')||'').trim();if(!name)return;
        const group=data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
        group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
        if(!data.contactGroups.some(g=>g.id===group.id))data.contactGroups.push(group);
        save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
      }
      case 'address': navigateBrowser(values.get('address')); break;
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
      case 'music-playlist': {const name=String(values.get('name')||'').trim();if(!name)return;ui.music.playlists.push({id:Date.now(),name,tracks:ui.musicAddPending?[ui.musicSelected]:[]});saveMusic();ui.overlay='';render();break;}
      case 'alarm-days': ui.alarmDraft.days=values.getAll('days').map(Number);ui.overlay='';render();break;
      case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';render();break;
      case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';render();break;
      case 'email': case 'email-search': ICSEmail.submit(form.dataset.form, values, emailContext()); break;
      case 'sd-brightness': data.settings.brightness=Number(values.get('brightness'));data.settings.autoBrightness=values.get('autoBrightness')!==null;save();ui.overlay='';render();break;
      case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
      case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){data.settings.fontSize=choice;data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
      default: break;
    }
  });
  document.addEventListener('input', event => {
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
    if(event.target.closest('.email-compose')&&event.target.name){const item=data.mailbox.find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return;}
    if(event.target.closest('.cal-editor') && event.target.name) {
      ui.eventDraft[event.target.name]=event.target.type==='checkbox'?event.target.checked:event.target.value;
      return;
    }
    if(event.target.matches('.camera-zoom input')) {
      data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.zoom=Number(event.target.value);save();
      viewport.querySelector('.camera-focus-area .media-photo').src=ICSMedia.image(ICSMedia.scene(data));
      return;
    }
    if(event.target.closest('#people-editor')) { HoloContactEditor.sync(event.target.closest('#people-editor'),ui.peopleDraft); return; }
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
      if (event.target.name === 'body') { event.target.style.height = 'calc(51.7648 * var(--dp))'; event.target.style.height = `${Math.min(dp(103.5295),event.target.scrollHeight)}px`; }
      return;
    }
    if (event.target.classList.contains('sd-brightness-bar')) { screen.style.filter = `brightness(${.5 + Number(event.target.value) / 135})`; return; }
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
    const visible = !!id && (preview || ['home', 'lock'].includes(ui.view) || ui.view === 'clock' && !ui.sub) && !ui.sleeping && !ui.power;
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
  let homeLongPressTimer = null, calculatorClearTimer = null, messageHoldTimer = null;
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
    const message = event.target.closest('.mms-message');
    const musicHold = ui.view === 'music' && !ui.overlay && event.target.closest('[data-music-hold]');
    if (musicHold) messageHoldTimer = setTimeout(() => { ui.musicHold = musicHold.dataset.musicHold; if (ui.musicHold.startsWith('track:')) ui.musicSelected = Number(ui.musicHold.slice(6)); ui.music.lang = i18n.language; ui.overlay = 'music-context'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
    if (message && !ui.overlay) messageHoldTimer = setTimeout(() => { ui.mmsMessage = message.dataset.id; ui.overlay = 'mms-message'; suppressReleaseClick(); renderOverlay(); }, holdDelay(550));
    if (pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
    else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    // PlatLogoActivity: the logo jumps to 1.25x, 2x, 3.25x and 5x (no tweening), then Nyandroid starts.
    if (event.target.closest('.easter-robot')) {
      const robot = event.target.closest('.easter-robot'); let count = 0;
      const zoom = () => { count++; if (data.settings.haptic !== false) navigator.vibrate?.(50 * count); robot.style.transform = `scale(${ICSNyandroid.zoomScale(count)})`; if (count <= 3) eggTimer = setTimeout(zoom, ICSNyandroid.LONG_PRESS); else requestAnimationFrame(() => { ui.easterNyan = true; render(); }); };
      eggTimer = setTimeout(zoom, 2 * ICSNyandroid.LONG_PRESS);
    }
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
    if (recentCard && (pointerStart.recentSwiping || Math.abs(dx) > dp(11) && Math.abs(dx) > Math.abs(dy))) {
      pointerStart.recentSwiping = true;
      suppressClickUntil = Date.now() + 350;
      event.preventDefault();
      try { screen.setPointerCapture(event.pointerId); } catch {}
      recentCard.style.transform = `translateX(${dx}px)`;
      recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
      return;
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
    if (pointerStart.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal)) startDrag(event.clientX, event.clientY);
  });
  window.addEventListener('pointerup', event => {
    if (!pointerStart || event.pointerId !== pointerStart.pointerId) return;
    clearTimeout(eggTimer); clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(calculatorClearTimer); clearTimeout(messageHoldTimer);
    const dx = event.clientX - pointerStart.x, dy = event.clientY - pointerStart.y;
    // The ViewPager tab strip and pages follow a horizontal fling.
    if (ui.view === 'play-store' && (ui.market?.page === 'section' || ui.market?.page === 'my-apps') && !ui.overlay && pointerStart.target.closest('.icsp-scroll,.icsp-tabs') && Math.abs(dx) > dp(71) && Math.abs(dx) > Math.abs(dy) * 1.5) { const next = viewport.querySelector(`.icsp-tabs button:${dx < 0 ? 'last' : 'first'}-child`); if (next && !next.disabled) { ui.market.tab = next.dataset.id; render(); } suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if(pointerStart.calendarSwiping){if(Math.abs(dx)>dp(53))calendarMove(dx<0?1:-1);else viewport.querySelector('[data-calendar-swipe]').style.transform='';suppressClickUntil=Date.now()+350;pointerStart=null;return;}
    if (pointerStart.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(pointerStart.photoStack, dy > 0 ? 1 : -1); else render(); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
    if (pointerStart.gallerySwiping) { if(Math.abs(dx)>dp(53))galleryStep(dx<0?1:-1);else render();suppressClickUntil=Date.now()+350;pointerStart=null;return; }
    if (pointerStart.calculatorSwiping) { setCalculatorPanel(Math.abs(dx) > dp(59) ? (dx < 0 ? 1 : 0) : ui.calcPanel); suppressClickUntil = Date.now() + 350; pointerStart = null; return; }
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
    try { if (sessionStorage.getItem('android-sim-booted-4.0.4') || matchMedia('(prefers-reduced-motion: reduce)').matches) return; sessionStorage.setItem('android-sim-booted-4.0.4', '1'); } catch { return; }
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
    if(ui.activeCall){
      const dialing=Date.now()<ui.activeCall.connected;
      const elapsed=viewport.querySelector('.incall-elapsed'),state=viewport.querySelector('.incall-state');
      if(elapsed)elapsed.textContent=dialing?'':ICSPhoneCall.duration(ICSPhoneCall.elapsed(ui.activeCall));
      if(state)state.textContent=i18n.t(dialing?'Calling…':ui.activeCall.hold?'On hold':'In call');
    }
    checkAlarms(now);
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
