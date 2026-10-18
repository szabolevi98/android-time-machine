/* Android 6.0.1 (Nexus 5X, MTC20K): the core. Logic only, nothing of a look (docs/plan-6.0.1.md):
   - the saved state (AndroidState, key android-time-machine-mm-v1) and the on-screen state (ui, never saved)
   - the screens: ui.view is the open screen ('home', 'lock', an app), ui.sub its page, ui.overlay a dialog or menu
   - one click handler: data-action="name" goes to the module that drew the element, then to the core's own actions
   - the keys: the navigation bar is on the screen (SystemUI draws it), so the core only offers c.key('back' | 'home' |
     'recents') and the held Home (the assist gesture); the side keys are power (held: the power menu) and volume
   - the site controls around the phone: language, full screen, reset
   Every screen is drawn by an mm- module that registers itself:
     MM.register(id, {title, app, render(c), mount(c, root), action(name, el, event, c), submit(form, event, c),
                      back(c), tick(c, now), noStatus(c), noNav(c), keepAwake(c), timeout(c)})
   render() returns the screen's HTML; the other hooks are optional and return true when they handled the event.
   A screen no module draws shows the "not built yet" card instead of an older version's screen. */
(() => {
  'use strict';
  // Each user of the phone (mm-users.js) has a saved phone of its own; the owner keeps the original key.
  const USER = (() => { try { return sessionStorage.getItem('mm-user') || 'owner'; } catch { return 'owner'; } })();
  const STORE = `android-time-machine-mm-v1${USER === 'owner' ? '' : `-${USER}`}`;
  const modules = {};
  // Modules add their saved fields here (MM.defaults.contacts = [...]) and their upgrades of older saves.
  const defaults = {settings: {}};
  const upgrades = [];
  // Text tables: mm-strings-<table>.js (docs/tools/mm-strings.py) call MM.strings(table, rows); modules read them with
  // MM.text(table).t(name) / .fmt(name, ...args) / .plural(name, n), in the simulator's language.
  const tables = {};
  const MM = window.MM = {
    register(id, spec) { modules[id] = spec; },
    module: id => modules[id],
    strings(table, rows) { tables[table] = AndroidStrings.table(`mm-${table}`, rows); },
    text: table => tables[table] || AndroidStrings.table(`mm-${table}`, {}),
    defaults, upgrades
  };

  // What each screen of the image is and where it comes from, for the "not built yet" card (and the recent apps).
  const SCREENS = {
    home: ['Home screen', 'GoogleHome.apk · Velvet.apk'], lock: ['Lock screen', 'SystemUI.apk · Keyguard'],
    statusbar: ['Status bar', 'SystemUI.apk · PhoneStatusBar'], navbar: ['Navigation bar', 'SystemUI.apk · NavigationBarView'],
    shade: ['Notifications', 'SystemUI.apk · NotificationPanelView'], power: ['Power menu', 'framework-res.apk · GlobalActions'],
    recents: ['Overview', 'SystemUI.apk · RecentsActivity'], volume: ['Volume', 'SystemUI.apk · VolumeDialog'],
    drawer: ['Apps', 'Velvet.apk · AllAppsContainerView'], search: ['Google', 'Velvet.apk'], now: ['Google Now', 'Velvet.apk · Now cards'],
    'device-policy': ['Device Policy', 'DMAgent.apk'], wallpapers: ['Wallpapers', 'Velvet.apk · GelWallpaperPickerActivity'],
    widgets: ['Widgets', 'Velvet.apk · WidgetsContainerView'], 'home-settings': ['Settings', 'Velvet.apk · Launcher settings'],
    settings: ['Settings', 'Settings.apk'], phone: ['Phone', 'GoogleDialer.apk'], contacts: ['Contacts', 'GoogleContacts.apk'],
    messenger: ['Messenger', 'PrebuiltBugle.apk'], chrome: ['Chrome', 'Chrome.apk'], gmail: ['Gmail', 'PrebuiltGmail.apk'],
    calendar: ['Calendar', 'CalendarGooglePrebuilt.apk'], camera: ['Camera', 'GoogleCamera.apk'], photos: ['Photos', 'Photos.apk'],
    clock: ['Clock', 'PrebuiltDeskClockGoogle.apk'], calculator: ['Calculator', 'CalculatorGoogle.apk'],
    maps: ['Maps', 'Maps.apk'], youtube: ['YouTube', 'YouTube.apk'], hangouts: ['Hangouts', 'Hangouts.apk'], drive: ['Drive', 'Drive.apk'],
    'play-store': ['Play Store', 'Phonesky.apk'], 'play-music': ['Play Music', 'Music2.apk'], 'play-movies': ['Play Movies & TV', 'Videos.apk'],
    'play-games': ['Play Games', 'PlayGames.apk'], 'android-pay': ['Android Pay', 'Wallet.apk'], 'project-fi': ['Project Fi', 'Tycho.apk'],
    downloads: ['Downloads', 'DownloadProviderUi.apk'], documents: ['Documents', 'DocumentsUI.apk'],
    'live-wallpapers': ['Live wallpapers', 'LiveWallpapersPicker.apk'], 'google-settings': ['Google Settings', 'PrebuiltGmsCore.apk'],
    // Quick settings details (QSPanel.showDetail), drawn inside the shade.
    'qs-wifi': ['Wi-Fi', 'SystemUI.apk · WifiTile detail'], 'qs-bt': ['Bluetooth', 'SystemUI.apk · BluetoothTile detail'],
    'qs-dnd': ['Do not disturb', 'SystemUI.apk · ZenModePanel'], 'qs-cell': ['Mobile data', 'SystemUI.apk · CellularTile detail'],
    'qs-cast': ['Cast screen', 'SystemUI.apk · CastTile detail'], 'qs-user': ['Users', 'SystemUI.apk · UserDetailView'],
    'user-guest': ['Guest', 'SystemUI.apk · UserSwitcherController'], 'user-add': ['Add user', 'SystemUI.apk · UserSwitcherController.AddUserDialog']
  };
  const SYSTEM = ['home', 'lock', 'statusbar', 'navbar', 'shade', 'power', 'recents', 'volume', 'drawer', 'widgets', 'now'];

  const i18n = window.AndroidI18n;
  const t = (key, context) => i18n.t(key, context);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const clone = value => JSON.parse(JSON.stringify(value));

  const screen = document.querySelector('#screen');
  const viewport = document.querySelector('#viewport');
  const statusRoot = document.querySelector('#status-bar');
  const overlayRoot = document.querySelector('#overlay-root');
  const navRoot = document.querySelector('#nav-bar');
  const device = document.querySelector('#device');

  let data = null;
  const ui = {view: 'home', sub: '', overlay: '', history: [], recent: [], sleeping: false, power: ''};
  const save = () => AndroidState.save(STORE, data);

  // The context every module hook gets.
  const c = {
    get data() { return data; }, user: USER, notifications: () => (window.MM.notificationSources || []).flatMap(f => f(c)), ui, save, render, open, home, back: () => back(true), key: keyPress, toast, t, safe, clone,
    get lang() { return i18n.language; }, locale: () => i18n.locale(),
    el: {screen, viewport, status: statusRoot, overlay: overlayRoot, nav: navRoot, device},
    has: id => !!modules[id], title: id => modules[id]?.title || SCREENS[id]?.[0] || id,
    overlay(id) { ui.overlay = id; renderOverlay(); }, closeOverlay() { ui.overlay = ''; renderOverlay(); },
    lock: () => lockScreen(), wake: () => wake(),
    // MasterClear: the saved phone goes and the page starts again from the boot animation.
    factoryReset() { try { localStorage.removeItem(STORE); sessionStorage.removeItem('android-sim-booted-6.0.1'); } catch {} location.reload(); }, screens: SCREENS, missing: (id, extra) => missing(id, extra)
  };

  function missing(id, extra = '') {
    const [title, source] = SCREENS[id] || [id, ''];
    return `<div class="mm-missing" data-missing="${safe(id)}"><b>${safe(t('Not built yet'))}</b><span>${safe(t(title))}</span>${source ? `<small>Android 6.0.1 · ${safe(source)}</small>` : ''}${extra}</div>`;
  }
  // While the launcher is missing, its card lists every screen of the version so each one can still be reached.
  function missingHome() {
    const list = Object.keys(SCREENS).filter(id => !['home', 'statusbar', 'navbar', 'lock'].includes(id) && !/^(qs|user)-/.test(id))
      .map(id => `<button type="button" data-action="mm-open" data-view="${id}">${safe(t(SCREENS[id][0]))}${modules[id] ? '' : ' ·'}</button>`).join('');
    return missing('home', `<div class="mm-missing-list">${list}</div>`);
  }
  // Until SystemUI's navigation bar is built, a plain strip of the three keys keeps the phone usable.
  function missingNav() {
    return `<div class="mm-missing-nav">${[['back', 'Back'], ['home', 'Home'], ['recents', 'Recent apps']].map(([key, label]) => `<button type="button" data-action="mm-key" data-key="${key}">${safe(t(label))}</button>`).join('')}</div>`;
  }

  // Overview's thumbnails: the screen an app was left on (its HTML, the status bar's colour and the page), kept when
  // another screen takes its place.
  let shown = {view: '', sub: ''};
  function snapshot() {
    const v = shown.view;
    if (v && v !== ui.view && SCREENS[v] && !SYSTEM.includes(v) && !v.startsWith('qs-')) {
      (ui.thumbs ||= {})[v] = {html: viewport.innerHTML, sub: shown.sub, status: statusRoot.querySelector('.mmsb')?.style.background || ''};
    }
  }
  function render() {
    snapshot();
    const mod = modules[ui.view];
    const noStatus = !!mod?.noStatus?.(c), noNav = !!mod?.noNav?.(c);
    screen.className = `screen${ui.sleeping ? ' sleeping' : ''}${noStatus ? ' no-status' : ''}${noNav ? ' no-nav' : ''} view-${ui.view}`;
    if (modules.statusbar) { statusRoot.innerHTML = modules.statusbar.render(c); modules.statusbar.mount?.(c, statusRoot); }
    else statusRoot.innerHTML = missing('statusbar');
    if (modules.navbar) { navRoot.innerHTML = modules.navbar.render(c); modules.navbar.mount?.(c, navRoot); }
    else navRoot.innerHTML = missingNav();
    viewport.innerHTML = mod ? mod.render(c) : ui.view === 'home' ? missingHome() : missing(ui.view);
    mod?.mount?.(c, viewport);
    shown = {view: ui.view, sub: ui.sub};
    renderOverlay();
  }
  function renderOverlay() {
    if (!ui.overlay) { overlayRoot.innerHTML = ''; return; }
    const mod = modules[ui.overlay];
    overlayRoot.innerHTML = mod ? mod.render(c) : missing(ui.overlay, `<button type="button" data-action="mm-close">${safe(t('Close'))}</button>`);
    mod?.mount?.(c, overlayRoot);
  }

  // Opening a screen: an app goes to the front of the recent list (Overview keeps every task; trimmed here at 20).
  // from: an element the screen opens out of (the launcher's ActivityOptions.makeClipRevealAnimation from the icon).
  function open(view, sub = '', {replace = false, from = null} = {}) {
    if (ui.view !== view && !replace && ui.view !== 'home' && ui.view !== 'lock') ui.history.push({view: ui.view, sub: ui.sub});
    ui.view = view; ui.sub = sub; ui.overlay = '';
    if (modules[view]?.app !== false && SCREENS[view] && !SYSTEM.includes(view)) ui.recent = [view, ...ui.recent.filter(id => id !== view)].slice(0, 20);
    // The launcher's predicted apps follow what was opened last (kept with the saved state).
    if (window.MM.appsData?.[view]) { data.recentApps = [view, ...(data.recentApps || []).filter(id => id !== view)].slice(0, 12); save(); }
    const box = from?.getBoundingClientRect?.(), vb = viewport.getBoundingClientRect();
    render();
    // AppTransition's clip reveal: the window grows out of the icon's bounds (fast out, slow in).
    if (box && viewport.animate) {
      const inset = `inset(${box.top - vb.top}px ${vb.right - box.right}px ${vb.bottom - box.bottom}px ${box.left - vb.left}px)`;
      viewport.animate([{clipPath: inset}, {clipPath: 'inset(0px 0px 0px 0px)'}], {duration: 300, easing: 'cubic-bezier(.4,0,.2,1)'});
    }
  }
  function home() {
    if (ui.view === 'lock') return;
    ui.view = 'home'; ui.sub = ''; ui.overlay = ''; ui.history = [];
    modules.home?.reset?.(c);
    render();
  }
  // fromApp: an app going back itself (its Up button, finish()) rather than the Back key, so an open input method
  // closes with the window instead of taking the press.
  function back(fromApp = false) {
    // An open input method takes the Back key first (InputMethodService.onKeyDown hides itself).
    if (fromApp) window.MM.ime?.hide?.();
    else if (window.MM.ime?.back?.()) return;
    if (ui.overlay) { if (!modules[ui.overlay]?.back?.(c)) { ui.overlay = ''; renderOverlay(); } return; }
    if (modules[ui.view]?.back?.(c)) return;
    if (ui.view === 'home' || ui.view === 'lock') return;
    const prev = ui.history.pop();
    if (prev) { ui.view = prev.view; ui.sub = prev.sub; render(); } else home();
  }

  // Toasts: drawn by the toast module once it exists; until then the text goes to the console.
  function toast(text, long) { if (modules.toast) modules.toast.show(c, text, long); else console.info('[toast]', text); }

  // Screen off / on. With a lock screen built, turning the screen off shows the keyguard (KeyguardViewMediator).
  function lockScreen() {
    ui.overlay = ''; ui.sleeping = true;
    // A lock set to None (Settings' unlock_set_off) keeps no keyguard: the screen just goes off.
    if (modules.lock && modules.lock.shouldLock?.(c) !== false) { if (ui.view !== 'lock') ui.beforeLock = {view: ui.view, sub: ui.sub}; ui.view = 'lock'; modules.lock.reset?.(c); }
    render();
  }
  function wake() { ui.sleeping = false; lastActivity = Date.now(); render(); }
  function unlock() { const to = ui.beforeLock || {view: 'home', sub: ''}; ui.beforeLock = null; ui.view = to.view; ui.sub = to.sub; render(); }
  c.unlock = unlock;

  // Activity and the screen-off timeout (SettingsProvider's def_screen_off_timeout in the image: 30 s).
  let lastActivity = Date.now();
  for (const name of ['pointerdown', 'keydown', 'wheel']) document.addEventListener(name, () => { lastActivity = Date.now(); }, {passive: true, capture: true});

  // A held key: power opens the power menu after the long-press timeout (500 ms).
  function holdable(element, onClick, onHold, ms = 500) {
    let timer = 0, held = false;
    element.addEventListener('pointerdown', event => { if (event.button) return; held = false; clearTimeout(timer); timer = setTimeout(() => { held = true; onHold(); }, ms); });
    for (const type of ['pointerup', 'pointercancel', 'pointerleave']) element.addEventListener(type, () => clearTimeout(timer));
    element.addEventListener('click', event => { if (held) { held = false; event.preventDefault(); return; } onClick(event); });
  }
  c.holdable = holdable;

  // The navigation bar's keys. Held Home is the assist gesture; Overview opens the recents screen.
  function keyPress(key) {
    if (ui.power) return;
    if (ui.sleeping) { wake(); return; }
    if (key === 'back') back();
    else if (key === 'home') { if (ui.view !== 'lock') home(); }
    else if (key === 'recents') { if (ui.view === 'lock') return; if (ui.view === 'recents' && modules.recents?.recentsKey) modules.recents.recentsKey(c); else { ui.recentsState = null; ui.overlay = ''; open('recents'); } }
    else if (key === 'assist') { if (ui.view !== 'lock') modules.assist?.show?.(c); }
  }
  // ui.power: '' on, 'off' (shut down: the key boots it, mm-power.js), 'boot' or 'shutdown' (keys do nothing).
  function powerKey() { if (ui.power === 'off') { c.boot?.(); return; } if (ui.power) return; if (ui.sleeping) wake(); else lockScreen(); }
  function powerHold() { if (ui.power === 'off') { c.boot?.(); return; } if (ui.power) return; if (ui.sleeping) { wake(); return; } ui.overlay = 'power'; renderOverlay(); }

  function volumeKey(direction) { modules.volume?.key?.(c, direction); }
  function bindVolume(element, direction) {
    element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); volumeKey(typeof direction === 'function' ? direction(event) : direction); });
    element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
  }

  // Clicks and forms go to the module that drew the element: the status bar, the navigation bar, the overlay or the
  // open screen.
  function owner(el) {
    if (statusRoot.contains(el)) return modules.statusbar;
    if (navRoot.contains(el)) return modules.navbar;
    if (overlayRoot.contains(el)) return modules[ui.overlay];
    return modules[ui.view];
  }
  function coreAction(name, el) {
    if (name === 'mm-open') { open(el.dataset.view, el.dataset.sub || ''); return true; }
    if (name === 'mm-close') { ui.overlay = ''; renderOverlay(); return true; }
    if (name === 'mm-key') { keyPress(el.dataset.key); return true; }
    if (name === 'mm-back') { back(); return true; }
    if (name === 'mm-home') { home(); return true; }
    return false;
  }

  function start() {
    data = AndroidState.load(STORE, defaults, saved => ({...clone(defaults), ...saved, settings: {...defaults.settings, ...saved.settings}}), upgrades);
    AndroidState.onProblem(problem => setTimeout(() => toast(t({unreadable: 'The saved data could not be read, so the phone started fresh. A copy of it was kept.', repaired: 'Some saved data was damaged and has been reset.', upgrade: 'Your saved data was kept, but part of it could not be updated.', unsaved: 'Changes can’t be saved: this browser’s storage is full or turned off.'}[problem.kind])), 1200));
    for (const mod of Object.values(modules)) mod.init?.(c);
    // As in the other versions, a page load starts on the keyguard only with a secure lock set, else on the home screen.
    if (modules.lock && ['pin', 'password', 'pattern'].includes(data.settings?.lock?.type)) ui.view = 'lock';

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
    });

    screen.addEventListener('pointerdown', event => { if (ui.power) { event.preventDefault(); if (ui.power !== 'boot') event.stopPropagation(); return; } if (ui.sleeping) { event.preventDefault(); event.stopPropagation(); wake(); } }, true);
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
      if (!confirm(t('Reset all local Marshmallow simulator data?'))) return;
      try { localStorage.removeItem(STORE); } catch {}
      location.reload();
    });

    setInterval(() => {
      const now = new Date();
      // A screen may keep its own user activity timeout (the keyguard's 10 s).
      const timeout = modules[ui.view]?.timeout?.(c) ?? data.settings.screenTimeout ?? 30000;
      if (!document.hidden && !ui.sleeping && !ui.power && !ui.overlay && Date.now() - lastActivity >= timeout && !modules[ui.view]?.keepAwake?.(c)) lockScreen();
      for (const mod of Object.values(modules)) mod.tick?.(c, now);
    }, 1000);

    i18n.translateDOM(document.body);
    render();
    modules.boot?.cold?.(c);
  }
  document.addEventListener('DOMContentLoaded', start);
})();
