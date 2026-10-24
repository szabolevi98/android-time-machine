/* Android 2.1 (Nexus One, ERE27): the core. Logic only, nothing of a look (docs/plan-2.1.md):
   - the saved state (AndroidState, key android-time-machine-ec-v1) and the on-screen state (ui, never saved)
   - the screens: ui.view is the open screen ('home', 'lock', an app), ui.sub its page, ui.overlay a dialog or menu
   - one click handler: data-action="name" goes to the module that drew the element, then to the core's own actions
   - the keys: Back, Menu, Home (held: recent apps), Search, the trackball, power (held: the power menu), volume
   - the site controls around the phone: language, full screen, reset
   Every screen is drawn by an ec- module that registers itself:
     EC.register(id, {title, app, render(c), mount(c, root), action(name, el, event, c), submit(form, event, c),
                      back(c), menu(c), search(c), tick(c, now), noStatus(c)})
   render() returns the screen's HTML; the other hooks are optional and return true when they handled the event.
   A screen no module draws shows the "not built yet" card instead of an older version's screen. */
(() => {
  'use strict';
  const STORE = 'android-time-machine-ec-v1';
  const modules = {};
  // Modules add their saved fields here (EC.defaults.contacts = [...]) and their upgrades of older saves.
  const defaults = {settings: {}};
  const upgrades = [];
  // Text tables: ec-strings-<table>.js (docs/tools/ec-strings.py) call EC.strings(table, rows); modules read them with
  // EC.text(table).t(name) / .fmt(name, ...args) / .plural(name, n), in the simulator's language.
  const tables = {};
  const EC = window.EC = {
    register(id, spec) { modules[id] = spec; },
    module: id => modules[id],
    strings(table, rows) { tables[table] = AndroidStrings.table(`ec-${table}`, rows); },
    text: table => tables[table] || AndroidStrings.table(`ec-${table}`, {}),
    defaults, upgrades
  };

  // What each screen of the image is and where it comes from, for the "not built yet" card (and the recent apps).
  const SCREENS = {
    home: ['Home screen', 'Launcher2.apk'], lock: ['Lock screen', 'framework-res.apk · LockScreen'],
    statusbar: ['Status bar', 'framework-res.apk · StatusBarService'], shade: ['Notifications', 'framework-res.apk · StatusBarService'],
    power: ['Phone options', 'framework-res.apk · GlobalActions'], recent: ['Recent applications', 'framework-res.apk · RecentApplicationsDialog'],
    drawer: ['All applications', 'Launcher2.apk · AllAppsView'], search: ['Quick Search Box', 'GlobalSearch.apk'],
    settings: ['Settings', 'Settings.apk'], phone: ['Phone', 'Contacts.apk · DialtactsActivity'], contacts: ['Contacts', 'Contacts.apk'],
    messaging: ['Messaging', 'Mms.apk'], browser: ['Browser', 'Browser.apk'], email: ['Email', 'Email.apk'],
    calendar: ['Calendar', 'Calendar.apk'], gallery: ['Gallery', 'Gallery3D.apk'], camera: ['Camera', 'Camera.apk'],
    music: ['Music', 'Music.apk'], clock: ['Clock', 'DeskClock.apk'], calculator: ['Calculator', 'Calculator.apk'],
    gmail: ['Gmail', 'Gmail.apk'], maps: ['Maps', 'Maps.apk'], talk: ['Talk', 'Talk.apk'], youtube: ['YouTube', 'YouTube.apk'],
    market: ['Market', 'Vending.apk'], 'voice-search': ['Voice Search', 'VoiceSearchWithKeyboard.apk'],
    'voice-dialer': ['Voice Dialer', 'VoiceDialer.apk'], 'news-weather': ['News and Weather', 'GenieWidget.apk'],
    'car-home': ['Car Home', 'CarDock.apk'], 'google-voice': ['Google Voice', 'googlevoice.apk'], goggles: ['Goggles', 'GoogleGoggles.apk'],
    facebook: ['Facebook', 'Facebook.apk'], 'amazon-mp3': ['Amazon MP3', 'com.amazon.mp3.apk'], quickoffice: ['Quickoffice', 'PassionQuickOffice.apk'],
    'sound-recorder': ['Sound Recorder', 'SoundRecorder.apk'], 'live-wallpapers': ['Live wallpapers', 'LiveWallpapersPicker.apk'],
    'emergency-dialer': ['Emergency dialer', 'Phone.apk · EmergencyDialer'],
    'in-call': ['Call', 'Phone.apk · InCallScreen'], 'contact-view': ['Contact', 'Contacts.apk · ViewContactActivity'],
    'contact-edit': ['Edit contact', 'Contacts.apk · EditContactActivity'], 'contact-join': ['Join contacts', 'Contacts.apk · JoinContactActivity'],
    'gallery-pick': ['Select picture', 'Gallery3D.apk · ACTION_GET_CONTENT'], 'messaging-settings': ['Settings', 'Mms.apk · MessagingPreferenceActivity'],
    'sim-messages': ['Text messages on SIM card', 'Mms.apk · ManageSimMessages'], 'mms-slideshow': ['Slideshow', 'Mms.apk · SlideshowActivity'],
    'mms-slides': ['Edit slideshow', 'Mms.apk · SlideshowEditActivity'], 'mms-slide': ['Edit slide', 'Mms.apk · SlideEditorActivity'], 'contacts-display': ['Display options', 'Contacts.apk · DisplayGroupsActivity'],
    'contact-options': ['Options', 'Contacts.apk · ContactOptionsActivity'], 'sim-contacts': ['SIM contacts', 'Phone.apk · SimContacts'],
    'contact-pick': ['Contacts', 'Contacts.apk · ContactsListActivity (INSERT_OR_EDIT)']
  };

  const i18n = window.AndroidI18n;
  const t = (key, context) => i18n.t(key, context);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const clone = value => JSON.parse(JSON.stringify(value));

  const screen = document.querySelector('#screen');
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  const navRoot = document.querySelector('#nav-bar');
  const trackball = document.querySelector('#trackball');
  const device = document.querySelector('#device');

  let data = null;
  const ui = {view: 'home', sub: '', overlay: '', history: [], recent: [], sleeping: false, power: ''};
  const save = () => AndroidState.save(STORE, data);

  // The context every module hook gets.
  const c = {
    get data() { return data; }, ui, save, render, open, home, back, toast, t, safe, clone,
    get lang() { return i18n.language; }, locale: () => i18n.locale(),
    el: {screen, viewport, status: statusRoot, overlay: overlayRoot, nav: navRoot, device},
    has: id => !!modules[id], title: id => modules[id]?.title || SCREENS[id]?.[0] || id,
    overlay(id) { ui.overlay = id; renderOverlay(); }, closeOverlay() { ui.overlay = ''; renderOverlay(); },
    lock: () => lockScreen(), wake: () => wake(), screens: SCREENS,
    // Factory data reset: the stored phone is wiped and the page starts again from the boot.
    factoryReset() { try { localStorage.removeItem(STORE); } catch {} location.reload(); }
  };

  EC.context = c;   // for the browser tests and debugging

  // android.text.format.DateFormat.format(pattern, date): the image's patterns ("EEEE, MMMM d", "E h:mm aa") with the
  // names of the simulator's language. Quoted text ('…') is kept; a doubled quote is a quote.
  // The device clock: the real time, or with Automatic off the time moved by Set date / Set time
  // (settings.timeOffset, ms) in the zone Select time zone chose (settings.timeZone; none = the browser's). The Date it
  // returns carries the device's wall-clock fields as local time.
  function now() {
    const s = data.settings, auto = s.autoTime !== false;
    const stamp = Date.now() + (auto ? 0 : Number(s.timeOffset) || 0), zone = !auto && s.timeZone;
    if (!zone) return new Date(stamp);
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', {timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric'}).formatToParts(new Date(stamp)).map(x => [x.type, x.value]));
    return new Date(+p.year, p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second, stamp % 1000);
  }
  c.now = now;
  c.zone = () => (data.settings.autoTime !== false ? '' : data.settings.timeZone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
  // DateFormat.getDateFormat: Settings' date format, or with "" (Normal) the locale's java.text SHORT date (ICU 4.2 /
  // CLDR 1.7 data of libicudata.so).
  const SHORT_DATE = {en: 'M/d/yy', hu: 'yyyy.MM.dd.', de: 'dd.MM.yy', fr: 'dd/MM/yy', es: 'dd/MM/yy'};
  c.shortDatePattern = (setting = data.settings.dateFormat) => setting || SHORT_DATE[i18n.language] || SHORT_DATE.en;
  c.shortDate = (date = now()) => dateFormat(c.shortDatePattern(), date);
  // java.text.DateFormatSymbols' AM / PM (ICU 4.2): what SimpleDateFormat's "a", the status bar clock, DigitalClock and
  // TimePicker show. android.text.format.DateFormat's "a" is framework-res's am / pm instead (DateUtils.getAMPMString).
  const JAVA_AMPM = {en: ['AM', 'PM'], hu: ['de.', 'du.'], de: ['vorm.', 'nachm.'], fr: ['AM', 'PM'], es: ['a.m.', 'p.m.']};
  c.javaAmPm = hour => (JAVA_AMPM[i18n.language] || JAVA_AMPM.en)[hour < 12 ? 0 : 1];
  // DateFormat.getTimeFormat: SimpleDateFormat "h:mm a" or "H:mm".
  c.timeText = (date = now()) => c.is24() ? `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}` : `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${c.javaAmPm(date.getHours())}`;
  function dateFormat(pattern, date = now()) {
    const loc = i18n.locale(), name = (opts) => date.toLocaleDateString(loc, opts);
    const h12 = date.getHours() % 12 || 12, pad = n => String(n).padStart(2, '0');
    const ampm = () => { const F = EC.text?.('framework'), key = date.getHours() < 12 ? 'am' : 'pm'; return F?.has(key) ? F.t(key) : key; };
    const tokens = {
      EEEE: () => name({weekday: 'long'}), EEE: () => name({weekday: 'short'}), E: () => name({weekday: 'short'}),
      MMMM: () => name({month: 'long'}),
      MMM: () => name({month: 'short'}), MM: () => pad(date.getMonth() + 1), M: () => String(date.getMonth() + 1),
      dd: () => pad(date.getDate()), d: () => String(date.getDate()), yyyy: () => String(date.getFullYear()), yy: () => pad(date.getFullYear() % 100),
      hh: () => pad(h12), h: () => String(h12), kk: () => pad(date.getHours()), k: () => String(date.getHours()),
      HH: () => pad(date.getHours()), H: () => String(date.getHours()), mm: () => pad(date.getMinutes()), ss: () => pad(date.getSeconds()),
      aa: () => ampm(), a: () => ampm()
    };
    return String(pattern).replace(/'([^']*)'|EEEE|EEE|E|MMMM|MMM|MM|M|dd|d|yyyy|yy|hh|h|kk|k|HH|H|mm|ss|aa|a/g, (all, quoted) => quoted !== undefined ? (quoted || "'") : tokens[all]());
  }
  c.dateFormat = dateFormat;
  c.is24 = () => data.settings.hour24 ?? i18n.language !== 'en';

  function missing(id, extra = '') {
    const [title, source] = SCREENS[id] || [id, ''];
    return `<div class="ec-missing" data-missing="${safe(id)}"><b>${safe(t('Not built yet'))}</b><span>${safe(t(title))}</span>${source ? `<small>Android 2.1 · ${safe(source)}</small>` : ''}${extra}</div>`;
  }
  // While the launcher is missing, its card lists every screen of the version so each one can still be reached.
  function missingHome() {
    const list = Object.keys(SCREENS).filter(id => !['home', 'statusbar', 'lock'].includes(id))
      .map(id => `<button type="button" data-action="ec-open" data-view="${id}">${safe(t(SCREENS[id][0]))}${modules[id] ? '' : ' ·'}</button>`).join('');
    return missing('home', `<div class="ec-missing-list">${list}</div>`);
  }

  // BatteryStats for Settings › Battery use, from the page load (taken as the phone being unplugged): the time it runs,
  // the screen on in each brightness bin (noteScreenBrightness: brightness * 5 / 256), the radio on (not in airplane
  // mode), Wi-Fi and Bluetooth on, and calls. Every change of these goes through render(), which notes the time.
  const stats = {since: Date.now(), at: Date.now(), state: null, up: 0, screen: [0, 0, 0, 0, 0], radio: 0, wifi: 0, bluetooth: 0, phone: 0};
  function noteStats() {
    if (!data) return;
    const now = Date.now(), d = now - stats.at, was = stats.state;
    if (was) {
      if (was.up) stats.up += d;
      if (was.screen >= 0) stats.screen[was.screen] += d;
      for (const k of ['radio', 'wifi', 'bluetooth', 'phone']) if (was[k]) stats[k] += d;
    }
    const s = data.settings, up = ui.power !== 'off', level = s.autoBrightness !== false ? 102 : (s.brightnessLevel ?? 102);
    stats.at = now;
    stats.state = {up, screen: up && !ui.power && !ui.sleeping ? Math.min(4, Math.floor(level * 5 / 256)) : -1, radio: up && !s.airplane,
      wifi: up && !!s.wifi, bluetooth: up && !!s.bluetooth, phone: up && !!modules.incall?.active?.()};
  }
  c.batteryStats = () => { noteStats(); return {...stats, screen: [...stats.screen]}; };

  function render() {
    noteStats();
    const mod = modules[ui.view];
    const noStatus = !!mod?.noStatus?.(c);
    screen.className = `screen${ui.sleeping ? ' sleeping' : ''}${noStatus ? ' no-status' : ''} view-${ui.view}`;
    if (modules.statusbar) { statusRoot.innerHTML = modules.statusbar.render(c); modules.statusbar.mount?.(c, statusRoot); }
    else statusRoot.innerHTML = missing('statusbar');
    viewport.innerHTML = mod ? mod.render(c) : ui.view === 'home' ? missingHome() : missing(ui.view);
    mod?.mount?.(c, viewport);
    renderOverlay();
    // The notification light (ec-statusbar.js 'led'): its colour, on and off times.
    const led = ui.sleeping ? modules.led?.pulse?.(c) : null;
    trackball.classList.toggle('pulse', !!led);
    if (led) {
      const on = +(led.on * 100 / (led.on + led.off)).toFixed(2), sheet = document.getElementById('ec-led') || document.head.appendChild(Object.assign(document.createElement('style'), {id: 'ec-led'}));
      const rule = `@keyframes ec-trackball{0%,${on - 0.01}%{opacity:.85}${on}%,100%{opacity:0}}`;
      if (sheet.textContent !== rule) sheet.textContent = rule;
      trackball.style.setProperty('--led-color', led.color); trackball.style.setProperty('--led-period', `${led.on + led.off}ms`);
    }
  }
  function renderOverlay() {
    if (!ui.overlay) { overlayRoot.innerHTML = ''; return; }
    const mod = modules[ui.overlay];
    overlayRoot.innerHTML = mod ? mod.render(c) : missing(ui.overlay, `<button type="button" data-action="ec-close">${safe(t('Close'))}</button>`);
    mod?.mount?.(c, overlayRoot);
  }

  // Opening a screen: an app goes to the front of the recent list (RecentApplicationsDialog shows the last 8 tasks).
  function open(view, sub = '', {replace = false} = {}) {
    if (ui.view !== view && !replace && ui.view !== 'home' && ui.view !== 'lock') ui.history.push({view: ui.view, sub: ui.sub});
    ui.view = view; ui.sub = sub; ui.overlay = '';
    if (modules[view]?.app !== false && SCREENS[view] && !['home', 'lock', 'drawer', 'power', 'recent', 'shade'].includes(view)) {
      ui.recent = [view, ...ui.recent.filter(id => id !== view)].slice(0, 8);
    }
    render();
  }
  function home() {
    if (ui.view === 'lock') return;
    ui.view = 'home'; ui.sub = ''; ui.overlay = ''; ui.history = [];
    modules.home?.reset?.(c);
    render();
  }
  function back() {
    if (c.imeBack?.()) return;   // the soft keyboard takes Back first
    if (ui.overlay) { if (!modules[ui.overlay]?.back?.(c)) { ui.overlay = ''; renderOverlay(); } return; }
    if (modules[ui.view]?.back?.(c)) return;
    if (ui.view === 'home' || ui.view === 'lock') return;
    const prev = ui.history.pop();
    if (prev) { ui.view = prev.view; ui.sub = prev.sub; render(); } else home();
  }
  function menuKey() {
    if (ui.overlay) { modules[ui.overlay]?.menu?.(c); return; }
    modules[ui.view]?.menu?.(c);
  }
  function searchKey() {
    if (ui.view === 'lock' || ui.sleeping) return;
    if (ui.overlay && modules[ui.overlay]?.search?.(c)) return;
    if (modules[ui.view]?.search?.(c)) return;
    // Activity.onSearchRequested with no searchable of its own: global search, Quick Search Box's dialog over the app.
    if (EC.quickSearch) EC.quickSearch(c); else open('search');
  }

  // Toasts: ec-ui.js replaces c.toast with the framework's Toast; until it loads the text goes to the console.
  function toast(text, long) { if (c.toast !== toast) c.toast(text, long); else console.info('[toast]', text); }

  // Screen off / on. With a lock screen built, turning the screen off shows the keyguard (KeyguardViewMediator).
  function lockScreen() {
    ui.overlay = ''; ui.sleeping = true;
    if (modules.lock) { if (ui.view !== 'lock') ui.beforeLock = {view: ui.view, sub: ui.sub}; ui.view = 'lock'; modules.lock.reset?.(c); }
    render();
  }
  function wake() { ui.sleeping = false; lastActivity = Date.now(); render(); }
  function unlock() { const to = ui.beforeLock || {view: 'home', sub: ''}; ui.beforeLock = null; ui.view = to.view; ui.sub = to.sub; render(); }
  c.unlock = unlock;

  // Activity and the screen-off timeout (Settings › Sound & display › Screen timeout; the image's default is 60 s).
  let lastActivity = Date.now();
  for (const name of ['pointerdown', 'keydown', 'wheel']) document.addEventListener(name, () => { lastActivity = Date.now(); }, {passive: true, capture: true});

  // Key backlight: lit while the phone is in use, off 6 s after the last touch (PowerManagerService's button light).
  let keylightTimer = 0;
  function pokeKeylight() {
    if (ui.sleeping) return;
    navRoot.classList.add('lit'); clearTimeout(keylightTimer);
    keylightTimer = setTimeout(() => navRoot.classList.remove('lit'), 6000);
  }

  const GLYPHS = {
    back: '<path d="M8.5 5.5 5 9l3.5 3.5M5.5 9H15a4.5 4.5 0 0 1 0 9H8"/>',
    menu: '<path d="M9 6h11M4 10h16M4 14h16M4 18h16"/>',
    home: '<path d="M2.5 12.5 12 4.5l9.5 8M6 10.5V19h12v-8.5"/>',
    search: '<circle cx="10" cy="10" r="5.5"/><path d="m14 14 5.5 5.5"/>'
  };
  function renderKeys() {
    navRoot.innerHTML = ['back', 'menu', 'home', 'search'].map(key => `<button type="button" class="touch-key touch-${key}" data-key="${key}" aria-label="${safe(t(key[0].toUpperCase() + key.slice(1)))}"><svg viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[key]}</svg></button>`).join('');
  }

  // A held key: Home opens the recent apps after the long-press timeout (500 ms); power the phone options.
  function holdable(element, onClick, onHold, ms = 500) {
    let timer = 0, held = false;
    element.addEventListener('pointerdown', event => { if (event.button) return; held = false; clearTimeout(timer); timer = setTimeout(() => { held = true; onHold(); }, ms); });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) element.addEventListener(type, () => clearTimeout(timer));
    element.addEventListener('click', event => { if (held) { held = false; event.preventDefault(); return; } onClick(event); });
  }

  function keyPress(key) {
    if (ui.power) return;
    if (ui.sleeping) { wake(); return; }
    if (key === 'back') back(); else if (key === 'menu') menuKey(); else if (key === 'search') searchKey();
    else if (key === 'home') { if (ui.view !== 'lock') home(); }
  }
  // Off: the key boots the phone (ec-system.js). On: a press turns the screen off / on, holding it opens GlobalActions.
  function powerKey() { if (ui.power === 'off') { c.boot?.(); return; } if (ui.power) return; if (ui.sleeping) wake(); else lockScreen(); }
  function powerHold() { if (ui.power === 'off') { c.boot?.(); return; } if (ui.power) return; if (ui.sleeping) { wake(); return; } if (c.showPower) c.showPower(); else { ui.overlay = 'power'; renderOverlay(); } }

  // The trackball press is DPAD_CENTER: it activates the focused view.
  function trackballPress() {
    if (ui.sleeping) { wake(); return; }
    const focused = document.activeElement;
    if (focused && screen.contains(focused) && focused !== screen) focused.click();
  }

  function volumeKey(direction) { if (!ui.power) modules.volume?.key?.(c, direction); }
  function bindVolume(element, direction) {
    element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); volumeKey(typeof direction === 'function' ? direction(event) : direction); });
    element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
  }

  // Clicks and forms go to the module that drew the element: the status bar, the overlay or the open screen.
  function owner(el) {
    if (statusRoot.contains(el)) return modules.statusbar;
    if (overlayRoot.contains(el)) return modules[ui.overlay];
    return modules[ui.view];
  }
  function coreAction(name, el) {
    if (name === 'ec-open') { open(el.dataset.view, el.dataset.sub || ''); return true; }
    if (name === 'ec-close') { ui.overlay = ''; renderOverlay(); return true; }
    if (name === 'ec-back') { back(); return true; }
    if (name === 'ec-home') { home(); return true; }
    return false;
  }

  function start() {
    data = AndroidState.load(STORE, defaults, saved => ({...clone(defaults), ...saved, settings: {...defaults.settings, ...saved.settings}}), upgrades);
    AndroidState.onProblem(problem => setTimeout(() => toast(t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
    for (const mod of Object.values(modules)) mod.init?.(c);
    if (modules.lock) ui.view = 'lock';
    renderKeys();

    document.addEventListener('click', event => {
      const el = event.target.closest('[data-action]');
      if (!el || !screen.contains(el)) return;
      if (ui.sleeping) return;
      const name = el.dataset.action;
      if (owner(el)?.action?.(name, el, event, c)) return;
      coreAction(name, el);
    });
    document.addEventListener('submit', event => {
      const form = event.target.closest('form[data-form]');
      if (!form || !screen.contains(form)) return;
      event.preventDefault();
      owner(form)?.submit?.(form, event, c);
    });
    document.addEventListener('keydown', event => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
      if (event.key === 'Escape' || event.key === 'Backspace' && !typing) { event.preventDefault(); keyPress('back'); }
      else if (event.key === 'Home' && !typing) { event.preventDefault(); keyPress('home'); }
      else if (event.key === 'ContextMenu' || event.key === 'F2') { event.preventDefault(); keyPress('menu'); }
    });

    for (const key of navRoot.querySelectorAll('.touch-key')) {
      if (key.dataset.key === 'home') holdable(key, () => keyPress('home'), () => { if (!ui.sleeping && ui.view !== 'lock') { ui.overlay = 'recent'; renderOverlay(); } });
      else key.addEventListener('click', () => keyPress(key.dataset.key));
    }
    trackball.addEventListener('click', trackballPress);
    device.addEventListener('pointerdown', pokeKeylight, true);
    document.addEventListener('keydown', pokeKeylight, true);
    // An image's native drag would cancel the pointer (pointercancel) and so a pull on a status bar icon, a swipe or a long
    // press that starts on one: the phone has no drag and drop of pictures.
    screen.addEventListener('dragstart', event => event.preventDefault());
    // A long press is the phone's, not the browser's: no image or page menu over the screen (text fields keep theirs).
    screen.addEventListener('contextmenu', event => { if (!event.target.closest('input, textarea, select, [contenteditable="true"]')) event.preventDefault(); });
    screen.addEventListener('pointerdown', event => { if (ui.sleeping) { event.preventDefault(); event.stopPropagation(); wake(); } }, true);
    for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) holdable(key, powerKey, powerHold);
    bindVolume(document.querySelector('#volume-down'), -1);
    bindVolume(document.querySelector('#volume-up'), 1);
    bindVolume(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);

    // Full screen: the phone alone; on phones the header slides away and a handle brings it back for 4 s.
    const fullscreenButton = document.querySelector('#fullscreen-button');
    const fullscreenElement = () => document.fullscreenElement || document.webkitFullscreenElement;
    if (!(document.fullscreenEnabled || document.webkitFullscreenEnabled)) fullscreenButton.hidden = true;
    fullscreenButton.addEventListener('click', () => {
      if (fullscreenElement()) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else { const root = document.documentElement, request = root.requestFullscreen || root.webkitRequestFullscreen; Promise.resolve(request.call(root, {navigationUI: 'hide'})).then(() => window.screen.orientation?.lock?.('portrait')).catch(() => {}); }
    });
    const syncFullscreen = () => {
      const active = !!fullscreenElement(), label = t(active ? 'Exit full screen' : 'Full screen');
      document.documentElement.classList.toggle('is-fullscreen', active);
      fullscreenButton.title = label; fullscreenButton.setAttribute('aria-label', label);
      if (!active) { clearTimeout(peekTimer); document.documentElement.classList.remove('header-peek'); }
    };
    document.addEventListener('fullscreenchange', syncFullscreen); document.addEventListener('webkitfullscreenchange', syncFullscreen);
    let peekTimer = 0;
    const peek = () => { document.documentElement.classList.add('header-peek'); clearTimeout(peekTimer); peekTimer = setTimeout(() => document.documentElement.classList.remove('header-peek'), 4000); };
    document.querySelector('#header-handle').addEventListener('click', peek);
    document.querySelector('.site-header').addEventListener('pointerdown', () => { if (document.documentElement.classList.contains('header-peek')) peek(); });

    const languageSelect = document.querySelector('#language-select');
    languageSelect.value = i18n.language;
    languageSelect.addEventListener('change', event => { i18n.setLanguage(event.target.value); location.reload(); });
    document.querySelector('#reset-button').addEventListener('click', () => {
      if (!confirm(t('Reset all local Eclair simulator data?'))) return;
      try { localStorage.removeItem(STORE); } catch {}
      location.reload();
    });

    setInterval(() => {
      const now = c.now();
      // The simulator's rule: no timeout unless one is chosen in Settings (-1 is Never).
      const timeout = data.settings.screenTimeout ?? -1;
      if (timeout >= 0 && !document.hidden && !ui.sleeping && !ui.overlay && Date.now() - lastActivity >= timeout && !modules[ui.view]?.keepAwake?.(c)) lockScreen();
      for (const mod of Object.values(modules)) mod.tick?.(c, now);
    }, 1000);

    i18n.translateDOM(document.body);
    render();
    modules.boot?.cold?.(c);
  }
  document.addEventListener('DOMContentLoaded', start);
})();
