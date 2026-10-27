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
    // Installed from Play (not in the image: _aosp/<device>/playapps).
    'earth': ['Earth', 'GoogleEarth.apk (Play)'], 'keep': ['Keep', 'Keep.apk (Play)'],
    docs: ['Docs', 'Docs.apk (Play)'], sheets: ['Sheets', 'Sheets.apk (Play)'], slides: ['Slides', 'Slides.apk (Play)'], fit: ['Fit', 'Fit.apk (Play)'], 'play-books': ['Play Books', 'Books.apk (Play)'], 'news-weather': ['News & Weather', 'News.apk (Play)'], 'google-plus': ['Google+', 'PlusOne.apk (Play)'], newsstand: ['Play Newsstand', 'Newsstand.apk (Play)'],
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
  let viewport = document.querySelector('#viewport');
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
    el: {screen, get viewport() { return viewport; }, status: statusRoot, overlay: overlayRoot, nav: navRoot, device},
    has: id => !!modules[id], title: id => modules[id]?.title || SCREENS[id]?.[0] || id,
    transition(kind) { pending = kind; },
    // The status bar alone (a notification posted while an app is busy with input keeps the app as it is).
    renderStatus() { if (modules.statusbar) { statusRoot.innerHTML = modules.statusbar.render(c); modules.statusbar.mount?.(c, statusRoot); } },
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
  let shown = {view: '', sub: '', page: ''};
  function snapshot() {
    const v = shown.view;
    if (v && v !== ui.view && SCREENS[v] && !SYSTEM.includes(v) && !v.startsWith('qs-')) {
      (ui.thumbs ||= {})[v] = {html: viewport.innerHTML, sub: shown.sub, status: statusRoot.querySelector('.mmsb')?.style.background || ''};
    }
  }
  /* Window animations (framework-res res/anim in MTC20K), played by keeping the leaving window's content on screen as a
     still layer while the new one comes in:
     - open (activity_open_enter / _exit): the new window fades in (200 ms decelerate_quart) while it rises from 8 %
       down (350 ms decelerate_quint); the old one dims to 0.7 over black (217 ms fast_out_slow_in).
     - close (activity_close_exit / _enter): the old window drops 8 % (250 ms accelerate_quart) and fades out after
       100 ms (150 ms linear); the one under it comes back from 0.7 (250 ms linear_out_slow_in).
     - home (wallpaper_open_exit, the launcher with the wallpaper behind it coming forward): the app drops by 110 % of its
       height in 225 ms (fast_out_linear_in) over the home screen.
     - reveal: the window grows out of the icon (open's from), the home screen staying under it.
     - unreveal: the apps drawer closes back into the all apps button (Launcher3's reveal run backwards).
     - to-recents: the app's window shrinks into its card in Overview (recents_enter_from_app_transition_duration
       325 ms, the thumbnail scale-down); zoom: a card tapped in Overview grows into its window (open's zoom option);
       recents-home: Overview's cards drop away (TaskView.startExitToHomeAnimation: recents_task_exit_to_home_duration
       225 ms, fast_out_linear_in) over the home screen.
     Opening another screen, Back, Home and a module's own page change (module.page(c): a path such as 'xml:display/
     battery', deeper = longer) choose the animation; a module can ask for one with c.transition(kind). */
  const E = {decQuart: 'cubic-bezier(.165,.84,.44,1)', decQuint: 'cubic-bezier(.23,1,.32,1)', accQuart: 'cubic-bezier(.895,.03,.685,.22)', fosi: 'cubic-bezier(.4,0,.2,1)', losi: 'cubic-bezier(0,0,.2,1)', foli: 'cubic-bezier(.4,0,1,1)'};
  const LAUNCHER = ['home', 'drawer', 'widgets', 'recents'];
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  let pending = '', reveal = null;
  const depth = page => page ? page.split('/').length : 0;
  // A page path from its parts: empty parts drop out, a '/' inside a part does not split it.
  window.MM.page = (...parts) => parts.filter(p => p !== undefined && p !== null && p !== '' && p !== false).map(p => String(p).replace(/\//g, '_')).join('/');
  function chooseTransition(page) {
    if (!shown.view || ui.sleeping || reducedMotion?.matches || !viewport.animate || document.hidden) return '';
    if (pending) return pending === 'none' ? '' : pending;
    const from = shown.view, to = ui.view;
    if (from === to) {
      if (page === shown.page) return '';
      if (ui.backing) return 'close';
      return depth(page) < depth(shown.page) || shown.page.startsWith(`${page}/`) ? 'close' : 'open';
    }
    if (from === 'drawer' && to === 'home') return 'unreveal';
    if (to === 'home') return from === 'recents' ? 'recents-home' : SYSTEM.includes(from) ? '' : 'home';
    if (to === 'recents') return SYSTEM.includes(from) ? '' : 'to-recents';
    if (reveal) return reveal.zoom ? 'zoom' : 'reveal';
    if (SYSTEM.includes(from) && from !== 'home' && from !== 'drawer') return '';
    if (SYSTEM.includes(to)) return '';
    return ui.backing ? 'close' : 'open';
  }
  // The leaving window: the old viewport element stays where it was (scroll positions and all), the new one takes its
  // id. Launcher screens carry the wallpaper with them, which otherwise belongs to the screen.
  function leave(kind) {
    const old = viewport, fresh = old.cloneNode(false), top = old.offsetTop, height = old.offsetHeight;
    if (LAUNCHER.includes(shown.view)) {
      const cs = getComputedStyle(screen);
      old.style.background = `#000 ${cs.backgroundImage} 0 ${-top}px / auto ${screen.clientHeight}px no-repeat`;
    }
    old.removeAttribute('id'); old.classList.add('mm-leaving');
    Object.assign(old.style, {position: 'absolute', left: '0', right: '0', top: `${top}px`, height: `${height}px`, overflow: 'hidden', pointerEvents: 'none'});
    if (kind === 'open' || kind === 'reveal' || kind === 'zoom') old.after(fresh); else old.before(fresh);
    if (kind === 'recents-home') old.style.background = 'none';
    viewport = fresh;
    return old;
  }
  function animateTransition(kind, old) {
    const done = ms => setTimeout(() => old.remove(), ms);
    const fwd = {fill: 'forwards'};
    if (kind === 'open') {
      viewport.animate([{opacity: 0}, {opacity: 1}], {duration: 200, easing: E.decQuart});
      viewport.animate([{transform: 'translateY(8%)'}, {transform: 'none'}], {duration: 350, easing: E.decQuint});
      old.animate([{opacity: 1}, {opacity: .7}], {duration: 217, easing: E.fosi, ...fwd});
      done(350);
    } else if (kind === 'close') {
      old.animate([{transform: 'none'}, {transform: 'translateY(8%)'}], {duration: 250, easing: E.accQuart, ...fwd});
      old.animate([{opacity: 1}, {opacity: 0}], {duration: 150, delay: 100, easing: 'linear', ...fwd});
      viewport.animate([{opacity: .7}, {opacity: 1}], {duration: 250, easing: E.losi});
      done(250);
    } else if (kind === 'home') {
      old.animate([{transform: 'none'}, {transform: 'translateY(110%)'}], {duration: 225, easing: E.foli, ...fwd});
      done(225);
    } else if (kind === 'reveal' && reveal) {
      const vb = viewport.getBoundingClientRect(), box = reveal;
      const inset = `inset(${box.top - vb.top}px ${vb.right - box.right}px ${vb.bottom - box.bottom}px ${box.left - vb.left}px)`;
      viewport.animate([{clipPath: inset}, {clipPath: 'inset(0px 0px 0px 0px)'}], {duration: 300, easing: E.fosi});
      done(300);
    } else if (kind === 'unreveal') {
      const panel = old.querySelector('.mmd'), cs = panel && getComputedStyle(panel);
      const at = cs ? `at ${cs.getPropertyValue('--rx').trim()} ${cs.getPropertyValue('--ry').trim()}` : 'at 50% 100%';
      (panel || old).animate([{clipPath: `circle(150% ${at})`}, {clipPath: `circle(0px ${at})`}], {duration: 250, easing: E.fosi, ...fwd});
      done(250);
    } else if (kind === 'to-recents') {
      const card = [...viewport.querySelectorAll('.mmrc-task')].pop(), ob = old.getBoundingClientRect();
      if (!card) { old.animate([{opacity: 1}, {opacity: 0}], {duration: 150, ...fwd}); done(150); return; }
      const r = card.getBoundingClientRect(), k = r.width / ob.width, bar = 24 * screen.clientWidth / 411.4286;
      old.style.transformOrigin = '0 0';
      old.animate([{transform: 'none'}, {transform: `translate(${r.left - ob.left}px, ${r.top + bar * k - ob.top}px) scale(${k})`}], {duration: 325, easing: E.fosi, ...fwd});
      card.style.visibility = 'hidden';
      setTimeout(() => { card.style.visibility = ''; old.remove(); }, 325);
    } else if (kind === 'zoom' && reveal) {
      const vb = viewport.getBoundingClientRect(), k = reveal.width / vb.width, bar = 24 * screen.clientWidth / 411.4286;
      viewport.style.transformOrigin = '0 0';
      viewport.animate([{transform: `translate(${reveal.left - vb.left}px, ${reveal.top + bar * k - vb.top}px) scale(${k})`}, {transform: 'none'}], {duration: 325, easing: E.fosi});
      setTimeout(() => { viewport.style.transformOrigin = ''; }, 330);
      done(325);
    } else if (kind === 'recents-home') {
      const h = old.getBoundingClientRect();
      for (const card of old.querySelectorAll('.mmrc-task')) card.animate([{translate: card.style.translate || '0 0'}, {translate: `0 ${h.bottom - card.getBoundingClientRect().top}px`}], {duration: 225, easing: E.foli, ...fwd});
      for (const el of old.querySelectorAll('.mmrc-search,.mmrc-top,.mmrc-bottom,.mmrc-empty')) el.animate([{opacity: 1}, {opacity: 0}], {duration: 150, ...fwd});
      done(225);
    } else old.remove();
  }
  function render() {
    snapshot();
    const mod = modules[ui.view];
    const page = mod?.page?.(c) ?? '';
    const kind = chooseTransition(page);
    pending = '';
    const old = kind ? leave(kind) : null;
    ui.prevView = shown.view;
    const noStatus = !!mod?.noStatus?.(c), noNav = !!mod?.noNav?.(c);
    screen.className = `screen${ui.sleeping ? ' sleeping' : ''}${noStatus ? ' no-status' : ''}${noNav ? ' no-nav' : ''} view-${ui.view}`;
    if (modules.statusbar) { statusRoot.innerHTML = modules.statusbar.render(c); modules.statusbar.mount?.(c, statusRoot); }
    else statusRoot.innerHTML = missing('statusbar');
    if (modules.navbar) { navRoot.innerHTML = modules.navbar.render(c); modules.navbar.mount?.(c, navRoot); }
    else navRoot.innerHTML = missingNav();
    viewport.innerHTML = mod ? mod.render(c) : ui.view === 'home' ? missingHome() : missing(ui.view);
    mod?.mount?.(c, viewport);
    shown = {view: ui.view, sub: ui.sub, page};
    renderOverlay();
    if (old) animateTransition(kind, old);
    reveal = null; ui.backing = false;
  }
  /* An overlay window that goes (or gives way to another) plays its exit animation on a still copy above the screen:
     a dialog dialog_exit (down to 0.9 in 220 ms decelerate_quint, fading in 150 ms decelerate_cubic, its dim with it),
     anything else popup_exit_material (a 150 ms fade). The shade, Now on Tap and the volume panel close themselves. */
  const SELF_CLOSING = ['shade', 'assist', 'volume'];
  let shownOverlay = '';
  function overlayExit() {
    const prev = shownOverlay; shownOverlay = ui.overlay;
    if (!prev || prev === ui.overlay || SELF_CLOSING.includes(prev) || !overlayRoot.firstElementChild || ui.sleeping || reducedMotion?.matches || !overlayRoot.animate) return;
    const ghost = document.createElement('div');
    ghost.className = 'mm-overlay-ghost';
    ghost.append(...overlayRoot.childNodes);
    overlayRoot.after(ghost);
    const win = ghost.querySelector('.mmdlg-win'), fwd = {fill: 'forwards'};
    if (win) {
      win.animate([{transform: 'none'}, {transform: 'scale(.9)'}], {duration: 220, easing: E.decQuint, ...fwd});
      ghost.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: 'cubic-bezier(.215,.61,.355,1)', ...fwd});
    } else ghost.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: 'cubic-bezier(.215,.61,.355,1)', ...fwd});
    setTimeout(() => ghost.remove(), 230);
  }
  function renderOverlay() {
    overlayExit();
    if (!ui.overlay) { overlayRoot.innerHTML = ''; return; }
    const mod = modules[ui.overlay];
    overlayRoot.innerHTML = mod ? mod.render(c) : missing(ui.overlay, `<button type="button" data-action="mm-close">${safe(t('Close'))}</button>`);
    mod?.mount?.(c, overlayRoot);
  }

  // Opening a screen: an app goes to the front of the recent list (Overview keeps every task; trimmed here at 20).
  // from: an element the screen opens out of (the launcher's ActivityOptions.makeClipRevealAnimation from the icon).
  function open(view, sub = '', {replace = false, from = null, zoom = false} = {}) {
    if (ui.view !== view && !replace && ui.view !== 'home' && ui.view !== 'lock') ui.history.push({view: ui.view, sub: ui.sub});
    ui.view = view; ui.sub = sub; ui.overlay = '';
    if (modules[view]?.app !== false && SCREENS[view] && !SYSTEM.includes(view)) ui.recent = [view, ...ui.recent.filter(id => id !== view)].slice(0, 20);
    // The launcher's predicted apps follow what was opened last (kept with the saved state).
    if (window.MM.appsData?.[view]) { data.recentApps = [view, ...(data.recentApps || []).filter(id => id !== view)].slice(0, 12); save(); }
    // AppTransition's clip reveal: the window grows out of the icon's bounds (fast out, slow in).
    const box = from?.getBoundingClientRect?.();
    reveal = box ? {left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height, zoom} : null;
    render();
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
    // A screen that goes back within itself closes the page it was on (the close animation).
    ui.backing = true;
    const handled = modules[ui.view]?.back?.(c);
    ui.backing = false;
    if (handled) return;
    if (ui.view === 'home' || ui.view === 'lock') return;
    const prev = ui.history.pop();
    if (prev) { ui.view = prev.view; ui.sub = prev.sub; ui.backing = true; render(); } else home();
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

  // A screen may take the volume keys itself (DeskClock's AlarmActivity.dispatchKeyEvent).
  function volumeKey(direction) { if (modules[ui.view]?.volumeKey?.(c, direction)) return; modules.volume?.key?.(c, direction); }
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

    // An image's native drag would cancel the pointer (pointercancel) and so a pull on a status bar icon, a swipe or a long
    // press that starts on one: the phone has no drag and drop of pictures.
    screen.addEventListener('dragstart', event => event.preventDefault());
    // A long press is the phone's, not the browser's: no image or page menu over the screen (text fields keep theirs).
    screen.addEventListener('contextmenu', event => { if (!event.target.closest('input, textarea, select, [contenteditable="true"]')) event.preventDefault(); });
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
      // The simulator's rule: no timeout unless one is chosen in Settings › Display › Sleep (-1 is Never).
      const timeout = modules[ui.view]?.timeout?.(c) ?? data.settings.screenTimeout ?? -1;
      if (timeout >= 0 && !document.hidden && !ui.sleeping && !ui.power && !ui.overlay && Date.now() - lastActivity >= timeout && !modules[ui.view]?.keepAwake?.(c)) lockScreen();
      for (const mod of Object.values(modules)) mod.tick?.(c, now);
    }, 1000);

    i18n.translateDOM(document.body);
    render();
    modules.boot?.cold?.(c);
  }
  document.addEventListener('DOMContentLoaded', start);
})();
