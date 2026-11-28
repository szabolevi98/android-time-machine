/* The home screen and the app drawer on Android 5.1.1 (Google Now Launcher), moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the workspace, its pages and the dock; launcher icons, folders and shortcuts (lp.placeShortcut); the clings
   - the widgets, their picker, the photo widget's setup and the resize frame
   - the overview, the drawer and its pages; drag and drop with the reorder and the outlines; the page swipes
     (the core's gesture pipeline calls in); Back from them */
'use strict';
LP.define(['home', 'drawer'], ({
  appNames, apps, clock, deviceDate, dp, fullDate, home, i18n, iconAssets, navRoot, openApp, overlayRoot,
  reducedMotion, render, renderOverlay, safe, save, screen, setWallpaperPan, snapResting, toast, today, tracks, ui,
  viewport
}, lp) => {
  // Folder and grid size of the Large Phone profile.
  const GRID = 5;
  const GEL_UNSIMULATED = [];
  const homePageCount = () => lp.data.homePages.length - (ui.extraScreen ? 1 : 0);
  const widgetTypes = [
    { type: 'analog', name: 'Analog clock', app: 'clock', width: 2, height: 2 },
    { type: 'calendar', name: 'Calendar', app: 'calendar', width: 2, height: 3, resize: {minWidth: 2, minHeight: 2} },
    { type: 'digitalclock', name: 'Digital clock', app: 'clock', width: 3, height: 2, resize: {minWidth: 2, minHeight: 1} },
    // LMY48Y has no Gallery (so no Photo Gallery widget); the music widget is Play Music's.
    { type: 'music', name: 'Google Play Music', app: 'play-music', width: 4, height: 1 },
    { type: 'power', name: 'Power control', app: 'settings', width: 4, height: 1 }
  ];
  const widgetSize = value => {
    const widget = typeof value === 'string' ? {type: value} : value;
    return {...(widgetTypes.find(item => item.type === widget.type) || {width: 2, height: 2}), ...widget};
  };
  const officeShortcut=id=>String(id).startsWith('office:')?(lp.data.driveFiles||StockApps.FILES).find(f=>f.id===String(id).slice(7)&&!f.trashed):null;
  const webShortcut = id => String(id).startsWith('web:') ? (lp.data.webShortcuts || []).find(w => String(w.id) === String(id).slice(4)) || {title: ''} : null;
  const appIcon = id => {
    const office=officeShortcut(id);if(office)return `<span class="app-icon"><img src="assets/${{doc:'docs',sheet:'sheets',slides:'slides'}[office.kind]}.png" alt=""></span>`;
    if (webShortcut(id)) return '<span class="app-icon"><img src="assets/chr40-app_shortcut_icon.png" alt=""></span>';
    const person = contactShortcut(id);
    if (person) return `<span class="app-icon contact-shortcut-icon">${window.LPDialer ? LPDialer.letterTile(person, 'contact-shortcut-tile') : ''}</span>`;
    if (id === 'apps') return '<span class="app-icon"><img src="assets/gnl-ic_allapps.png" alt=""></span>';
    const folder=ICSLauncherFolders.folder(lp.data,id);
    if(folder)return `<span class="app-icon launcher-folder-icon">${folder.items.slice(0,3).map(app=>`<span class="folder-preview-item">${appIcon(app)}</span>`).join('')}</span>`;
    const item = apps.find(app => app[0] === id);
    if (!item) return '';
    return iconAssets.has(id)
      ? `<span class="app-icon"><img src="assets/${id}.png" alt=""></span>`
      : `<span class="app-icon fallback" style="--icon-light:${item[3]};--icon-dark:${item[4]}">${item[2]}</span>`;
  };
  // The default folders keep their name as a string key until renamed, so they follow the language (google_folder_name…).
  const folderName=id=>{const folder=ICSLauncherFolders.folder(lp.data,id);return folder?.name?(folder.nameKey?i18n.t(folder.name):folder.name):i18n.t('Unnamed folder');};
  /* Contacts' Place on Home screen: an INSTALL_SHORTCUT whose shortcut opens the contact (QuickContact), its photo or
     the image's contact picture as the icon, the name as the label. Launcher3's InstallShortcutReceiver adds it on the first free cell from the second screen on (startSearchPageIndex), a new screen when all are full; the toast names it (shortcut_installed). */
  const contactShortcut = id => String(id).startsWith('contact:') ? lp.data.contacts.find(p => p.id === Number(String(id).slice(8))) || {name: ''} : null;
  const VCARD = key => { const row = window.StockStrings?.vcard?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : key; };
  function placeShortcut(key, label) {
    const free = page => (lp.data.homePages[page] || []).findIndex((id, index) => !id && !(lp.data.homeWidgets[page] || []).some(w => { const s = widgetSize(w); return index % 4 >= w.x && index % 4 < w.x + s.width && Math.floor(index / 4) >= w.y && Math.floor(index / 4) < w.y + s.height; }));
    const count = homePageCount ? homePageCount() : lp.data.homePages.length;
    const order = Array.from({length: Math.max(0, count - 1)}, (_, i) => i + 1);
    let page = order.find(i => free(i) >= 0);
    if (page === undefined) { lp.data.homePages.splice(count, 0, Array(16).fill(null)); lp.data.homeWidgets.splice(count, 0, []); page = count; }
    lp.data.homePages[page][free(page)] = key; save();
    toast(AndroidStrings.format(VCARD('Shortcut "%s" created.'), label));
  }
  const launcherIcon = id => officeShortcut(id)?`<button class="launcher-icon" data-action="open-office-shortcut" data-id="${safe(String(id).slice(7))}" aria-label="${safe(officeShortcut(id).name)}" data-no-translate>${appIcon(id)}<span>${safe(officeShortcut(id).name)}</span></button>`:webShortcut(id) ? `<button class="launcher-icon" data-action="open-web-shortcut" data-id="${safe(String(id).slice(4))}" aria-label="${safe(webShortcut(id).title)}" data-no-translate>${appIcon(id)}<span>${safe(webShortcut(id).title)}</span></button>` : contactShortcut(id) ? `<button class="launcher-icon contact-shortcut" data-action="open-contact" data-id="${safe(String(id).slice(8))}" aria-label="${safe(contactShortcut(id).name)}" data-no-translate>${appIcon(id)}<span>${safe(contactShortcut(id).name)}</span></button>` : ICSLauncherFolders.folder(lp.data,id)
    ? `<button class="launcher-icon" data-action="folder-open" data-folder-id="${safe(id)}" aria-label="${safe(folderName(id))}" data-no-translate>${appIcon(id)}<span>${safe(folderName(id))}</span></button>`
    : `<button class="launcher-icon" data-action="${id==='apps'?'drawer':'open-app'}" ${id==='apps'?'':`data-app="${id}"`} aria-label="${safe(appNames[id]||'Apps')}">${appIcon(id)}<span>${safe(appNames[id]||'Apps')}</span></button>`;
  function restoreWidgetScroll() {
    ui.widgetScroll = ui.widgetScroll || {};
    viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
      const id = list.closest('.home-widget').dataset.widgetId;
      list.scrollTop = ui.widgetScroll[id] || 0;
    });
  }
  function analogClock() {
    const now = deviceDate();
    return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
  }
  // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
  function widgetArt(type, preview = false) {
    if (type === 'analog') return preview ? '<img class="widget-preview-image" src="assets/dc5-appwidget_analog_clock_preview.png" alt="">' : analogClock();
    if (type === 'digitalclock') return '<img class="widget-preview-image" src="assets/dc5-appwidget_digital_clock_preview.png" alt="">';
    if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${fullDate()}</span>`;
    if (type === 'calendar') return '<img class="widget-preview-image" src="assets/gc5-calendar_widget_preview.png" alt="">';
    if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
    // Launcher3 shows the provider's previewImage (Music2's) in the widget tray.
    if (type === 'music') return '<img class="widget-preview-image" src="assets/pm-music_widget_preview.png" alt="">';
    if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${lp.data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? lp.data.settings.brightness > 70 ? 'full' : lp.data.settings.brightness > 25 ? 'half' : 'off' : lp.data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
    return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
  }
  const musicActive = () => ui.music.playing || ui.music.position > 0 || !!ui.musicActive;
  function widgetBody(widget) {
    const t = key => i18n.t(key);
    if (widget.type === 'calendar') return ICSWidgets.calendarLP(lp.data, t, i18n.locale(), deviceDate(), !!lp.data.settings.hour24);
    if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
    if (widget.type === 'photo') return ICSWidgets.photo(lp.data, widget, ui.photoStacks?.[widget.id] || 0, t);
    if (widget.type === 'digitalclock') return digitalClockWidget();
    return null;
  }
  /* DeskClock 5.1 digital_appwidget / digital_widget_time: the whole time in widget_big_thin (sans-serif-thin 75sp,
     "h:mm" or "kk:mm", bottom_text_spacing_digital -8dp), then the 14sp date (EEEMMMMd, "Sat, October 3") and the next
     alarm in #B3FFFFFF with ic_alarm_small, 8dp after the date. */
  function digitalClockWidget(tag = 'button') {
    const now = deviceDate(), alarm = lp.nextAlarmLabel(), hour24 = !!lp.data.settings.hour24;
    const time = `${hour24 ? String(now.getHours()).padStart(2, '0') : now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, '0')}`;
    const attrs = tag === 'button' ? ' data-action="open-app" data-app="clock"' : '';
    return `<${tag} class="jbw-digital lpw-digital"${attrs} aria-label="${safe(clock())}"><span class="jbw-digital-time" aria-hidden="true">${safe(time)}</span><span class="jbw-digital-date"><span>${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'long', day: 'numeric'}))}</span>${alarm ? `<span class="jbw-digital-alarm"><img src="assets/dc5-ic_alarm_small.png" alt="">${safe(alarm)}</span>` : ''}</span></${tag}>`;
  }
  const homeWidget = widget => {
    const spec = widgetSize(widget);
    const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${lp.data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!lp.data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? lp.data.settings.brightness > 70 ? 'full' : lp.data.settings.brightness > 25 ? 'half' : 'off' : lp.data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
    const frame = ui.resizeWidget === widget.id && spec.resize ? `<div class="jb-resize-frame" data-resize-frame>${['left', 'top', 'right', 'bottom'].map(edge => `<button class="jb-resize-handle jb-resize-${edge}" data-resize-edge="${edge}" aria-label="${safe(i18n.t('Resize'))}"><img src="assets/jb-widget_resize_handle_${edge}.png" alt=""></button>`).join('')}</div>` : '';
    return `<div class="home-widget widget-${widget.type}${frame ? ' resizing' : ''}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}${frame}</div>`;
  };
  const pageMarker = (active, add = false) => `<img class="kk-pi-off" src="assets/gnl-ic_pageindicator_${add ? 'add' : 'default'}.png" alt=""><img class="kk-pi-on" src="assets/gnl-ic_pageindicator_current.png" alt="">`;
  const homeGrid = (page, index) => `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" ${index !== ui.page && !ui.overview ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % GRID + 1};grid-row:${Math.floor(slot / GRID) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${(lp.data.homeWidgets[index] || []).map(homeWidget).join('')}</div>`;
  function renderHome() {
    const pages = lp.data.homePages.length;
    const nowPane = `<div class="gel-now-layer" ${ui.page === -1 ? '' : 'inert aria-hidden="true"'}>${GELNow.render({data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), ui})}</div>`;
    return `<div class="home-view kk-home gel-home lp-home${ui.overview ? ' kk-overview' : ''}${ui.page === -1 ? ' gel-now-open' : ''}" style="--gnow:${ui.page === -1 ? 1 : 0}">${nowPane}<div class="home-search"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="lp-qsb-logo" src="assets/gnl-ic_searchbox_google.png" alt="Google"></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice Search'))}"><img class="lp-qsb-mic" src="assets/gnl-ic_mic_none.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${lp.data.homePages.map(homeGrid).join('')}</div></div><div class="page-indicators"><button class="gel-now-marker ${ui.page === -1 ? 'active' : ''}" data-action="page" data-id="-1" aria-label="Google Now">${pageMarker(ui.page === -1)}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}">${pageMarker(i === ui.page, ui.extraScreen && i === pages - 1)}</button>`).join('')}</div><div class="dock">${lp.data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/gnl-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/gnl-ic_launcher_clear_active_holo.png" alt=""><span>${safe(i18n.t('Remove'))}</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/gnl-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/gnl-ic_launcher_info_active_holo.png" alt=""><span>${safe(i18n.t('App info'))}</span></div></div><div class="kk-overview-panel" ${ui.overview ? '' : 'inert'}><button data-action="open-wallpapers" style="--pressed:url('assets/gnl-ic_wallpaper_pressed.png')"><img src="assets/gnl-ic_wallpaper.png" alt="">${safe(i18n.t('Wallpapers'))}</button><button data-action="kk-overview-widgets" style="--pressed:url('assets/gnl-ic_widget_pressed.png')"><img src="assets/gnl-ic_widget.png" alt="">${safe(i18n.t('Widgets'))}</button><button data-action="gel-overview-settings" style="--pressed:url('assets/gnl-ic_setting_pressed.png')"><img src="assets/gnl-ic_setting.png" alt="">${safe(i18n.t('Settings'))}</button></div></div>`;
  }
  // All apps: 5 x 6 apps per quantum_panel page, then the widget pages of 2 x 3 previews.
  const DRAWER_APPS = 30, DRAWER_WIDGETS = 6;
  const drawerAppPages = () => Math.ceil(apps.length / DRAWER_APPS);
  const drawerPageCount = () => drawerAppPages() + Math.ceil(widgetTypes.length / DRAWER_WIDGETS);
  const drawerRange = () => ui.drawerWidgets ? [drawerAppPages(), drawerPageCount() - 1] : [0, drawerAppPages() - 1];
  function renderDrawer() {
    const appPages = drawerAppPages(), pages = drawerPageCount();
    const [first, last] = drawerRange();
    const current = Math.max(first, Math.min(ui.drawerPage, last));
    const isApps = current < appPages;
    ui.drawerTab = isApps ? 'apps' : 'widgets';
    const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
    const widgetPage = current - appPages;
    const items = isApps ? sortedApps.slice(current * DRAWER_APPS, current * DRAWER_APPS + DRAWER_APPS).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(widgetPage * DRAWER_WIDGETS, widgetPage * DRAWER_WIDGETS + DRAWER_WIDGETS).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(i18n.t(widget.name))}"><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type, true)}</span><span class="drawer-widget-title"><span>${safe(i18n.t(widget.name))}</span><small>${widget.width} × ${widget.height}</small></span></button>`).join('');
    return `<div class="drawer-view kk-drawer lp-drawer${isApps ? '' : ' drawer-widgets-open'}${ui.drawerReveal ? ' lp-revealing' : ''}"${ui.drawerReveal ? ` style="--dx:${ui.drawerReveal.dx}px;--dy:${ui.drawerReveal.dy}px"` : ''}><div class="lp-drawer-panel"></div><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>i < first || i > last ? '' : `<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}">${pageMarker(i === current)}</button>`).join('')}</div></div>`;
  }
  function widgetFits(page, x, y, type, ignoredId = '') {
    const {width, height} = widgetSize(type);
    if (x < 0 || y < 0 || x + width > GRID || y + height > GRID) return false;
    for (let row = y; row < y + height; row++) for (let column = x; column < x + width; column++) {
      if (lp.data.homePages[page][row * GRID + column]) return false;
    }
    return !lp.data.homeWidgets[page].some(widget => widget.id !== ignoredId && x < widget.x + widgetSize(widget).width && x + width > widget.x && y < widget.y + widgetSize(widget).height && y + height > widget.y);
  }
  function addWidget(type, x = null, y = null) {
    const spots = x === null ? Array.from({length: GRID * GRID}, (_, i) => [i % GRID, Math.floor(i / GRID)]) : [[x,y]];
    const spot = spots.find(([column,row]) => widgetFits(ui.page, column, row, type));
    if (!spot) return false;
    const widget = {id:`widget-${Date.now()}`,type,x:spot[0],y:spot[1]};
    // Gallery2 declares a configure activity; the widget stays empty until it finishes.
    if (type === 'photo') { widget.source = null; ui.photoWidgetSetup = {page: ui.page, id: widget.id}; ui.overlay = 'widget-photo-type'; }
    lp.data.homeWidgets[ui.page].push(widget);
    save(); return widget;
  }
  function stepPhotoStack(id, direction) {
    const widget = lp.data.homeWidgets.flat().find(item => item.id === id);
    if (!widget) return;
    const count = ICSWidgets.photoItems(lp.data, widget).length;
    if (count < 2) { render(); return; }
    ui.photoStacks = ui.photoStacks || {};
    ui.photoStacks[id] = ICSWidgets.wrap((ui.photoStacks[id] || 0) + direction, count);
    render();
    const stack = viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"]`);
    if (stack) stack.classList.add(direction > 0 ? 'stack-next' : 'stack-previous');
  }
  const pendingPhotoWidget = () => ui.photoWidgetSetup && lp.data.homeWidgets[ui.photoWidgetSetup.page]?.find(widget => widget.id === ui.photoWidgetSetup.id);
  function configurePhotoWidget(options) {
    const widget = pendingPhotoWidget();
    if (widget) Object.assign(widget, options);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render(); toast('Widget added');
  }
  // Leaving WidgetConfigure without a choice removes the pending widget, as on Android.
  function cancelPhotoWidget() {
    const setup = ui.photoWidgetSetup;
    if (setup) lp.data.homeWidgets[setup.page] = lp.data.homeWidgets[setup.page].filter(widget => widget.id !== setup.id);
    ui.photoWidgetSetup = null; ui.overlay = ''; save(); render();
  }
  // Created on first use: the first render runs before this point of the script.
  function clingLayerRoot() { let node = screen.querySelector('#cling-layer'); if (!node) { node = document.createElement('div'); node.id = 'cling-layer'; screen.append(node); } return node; }
  function clingTarget(kind) {
    const base = clingLayerRoot().getBoundingClientRect();
    // Cling.getWorkspaceCutOutBounds: the screen centre, 30 dp higher.
    if (kind === 'workspace') return {circle: [base.width / 2, base.height / 2 - LauncherClings.RING.lift], radius: LauncherClings.RING.outer};
    if (kind !== 'folder') return {};
    const folder = overlayRoot.querySelector('.launcher-folder')?.getBoundingClientRect();
    return folder ? {rect: {left: folder.left - base.left, top: folder.top - base.top, right: folder.right - base.left, bottom: folder.bottom - base.top}} : {};
  }
  function placeCling(root, kind) { LauncherClings.cut(root, clingTarget(kind)); }
  function syncClings() {
    let kind = ui.power || ui.locked || ui.sleeping ? '' : LauncherClings.wanted(ui, lp.data.clings);
    if (kind === 'folder' && ui.folderSettled !== ui.folderId) kind = '';
    const current = clingLayerRoot().querySelector('.cling:not(.cling-leaving)');
    if (current?.dataset.cling === kind) { placeCling(current, kind); return; }
    current?.remove();
    if (!kind) return;
    clingLayerRoot().insertAdjacentHTML('beforeend', LauncherClings.markup(kind, key => i18n.t(key)));
    const root = clingLayerRoot().lastElementChild;
    placeCling(root, kind);
    // showLongPressCling(true): the first cling, with the welcome title, is not animated in.
    setTimeout(() => { if (root.isConnected) placeCling(root, kind); }, 450);
  }
  window.addEventListener('resize', () => syncClings());
  function renderFolder() {
    const folder=ICSLauncherFolders.folder(lp.data,ui.folderId);if(!folder){ui.overlay='';return '';}
    const {columns,rows}=ICSLauncherFolders.dimensions(folder.items.length);
    return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder lp-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:calc(${((columns*74+24)/.906).toFixed(4)} * var(--dp));--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="${safe(i18n.t('Unnamed Folder'))}" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
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
  const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
  function dragSource(target) {
    const homeWidget = target.closest('.home-widget[data-widget-id]');
    if (homeWidget) {
      const widget = lp.data.homeWidgets[ui.page].find(item => item.id === homeWidget.dataset.widgetId);
      return widget ? { type: 'widget', id: widget.id, widgetType: widget.type, page: ui.page } : null;
    }
    const drawerWidget = target.closest('.drawer-widget[data-widget-type]');
    if (drawerWidget) return { type: 'drawer-widget', widgetType: drawerWidget.dataset.widgetType };
    const icon = target.closest('.launcher-icon');
    if (!icon) return null;
    const folderSlot=icon.closest('[data-folder-slot]');
    if(folderSlot&&ui.overlay==='folder')return {type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot),id:icon.dataset.app};
    const homeSlot = icon.closest('[data-home-slot]');
    if (homeSlot) return { type: 'home', slot: Number(homeSlot.dataset.homeSlot), page: ui.page, id: lp.data.homePages[ui.page][Number(homeSlot.dataset.homeSlot)] };
    const dockSlot = icon.closest('[data-dock-slot]');
    if (dockSlot && Number(dockSlot.dataset.dockSlot) !== 2) return { type: 'dock', slot: Number(dockSlot.dataset.dockSlot), id: lp.data.dock[Number(dockSlot.dataset.dockSlot)] };
    if (icon.closest('.drawer-apps')) return { type: 'drawer', id: icon.dataset.app };
    return null;
  }
  function startDrag(x, y) {
    if (!lp.pointerStart?.source || lp.dragState) return;
    // Keep touch delivery on the stable screen when a drawer item replaces its view.
    try { screen.setPointerCapture(lp.pointerStart.pointerId); } catch {}
    lp.dragState = lp.pointerStart.source;
    // Workspace.startDrag hides the original view (GONE) while its DragView moves.
    lp.pointerStart.target.closest('.launcher-icon')?.classList.add('drag-source-icon');
    if (lp.dragState.type === 'widget') lp.pointerStart.target.closest('.home-widget')?.classList.add('drag-source-widget');
    if (lp.dragState.type === 'widget') {
      const rect = lp.pointerStart.target.closest('.home-widget').getBoundingClientRect();
      lp.dragState.grabOffset = {x: lp.pointerStart.x - rect.left, y: lp.pointerStart.y - rect.top};
    }
    if (lp.dragState.type === 'drawer' || lp.dragState.type === 'drawer-widget') { ui.view = 'home'; ui.overlay = ''; render(); }
    if (lp.dragState.type === 'drawer-widget') {
      const rect = viewport.querySelector('.home-grid:not([inert])').getBoundingClientRect();
      const size = widgetSize(lp.dragState.widgetType);
      lp.dragState.grabOffset = {x: (rect.width - 12) / 4 * size.width / 2, y: (rect.height - 5) / 4 * size.height / 2};
    }
    const ghost = document.createElement('div'); ghost.className = `drag-ghost${lp.dragState.widgetType ? ' widget-ghost' : ''}`; ghost.innerHTML = lp.dragState.widgetType ? widgetArt(lp.dragState.widgetType) : appIcon(lp.dragState.id); screen.append(ghost);
    // Launcher2 drags a widget at its real span: a live copy when moving, the preview image when adding.
    if (lp.dragState.widgetType && lp.dragState.grabOffset) {
      const source = lp.dragState.type === 'widget' ? lp.pointerStart.target.closest('.home-widget') : null;
      const grid = viewport.querySelector('.home-grid:not([inert])')?.getBoundingClientRect(), size = widgetSize(lp.dragState.widgetType);
      const box = source ? source.getBoundingClientRect() : grid && {width: (grid.width - 12) / 4 * size.width, height: (grid.height - 5) / 4 * size.height};
      if (box) { ghost.classList.add('widget-span-ghost', `widget-${lp.dragState.widgetType}`); ghost.style.width = `${box.width}px`; ghost.style.height = `${box.height}px`; }
      if (source) { ghost.innerHTML = source.innerHTML; ghost.querySelectorAll('button,[tabindex]').forEach(node => node.setAttribute('tabindex', '-1')); }
    }
    lp.dragState.ghost = ghost;
    if (!lp.dragState.widgetType && !reducedMotion?.matches) ICSTransitions.play(ghost, ICSTransitions.specs['drag-lift'].enter);
    moveGhost(x, y);
    screen.classList.add('dragging');
    screen.classList.toggle('dragging-from-drawer', lp.dragState.type === 'drawer');
    addExtraEmptyScreen();
    lp.suppressClickUntil = Date.now() + 500;
  }
  function addExtraEmptyScreen() {
    if (ui.extraScreen) return;
    ui.extraScreen = true;
    lp.data.homePages.push(Array(GRID * GRID).fill(null)); lp.data.homeWidgets.push([]);
    const index = lp.data.homePages.length - 1;
    viewport.querySelector('.home-pages')?.insertAdjacentHTML('beforeend', `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" inert>${Array.from({length: GRID * GRID}, (_, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % GRID + 1};grid-row:${Math.floor(slot / GRID) + 1}"></div>`).join('')}</div>`);
    viewport.querySelector('.page-indicators')?.insertAdjacentHTML('beforeend', `<button data-action="page" data-id="${index}" aria-label="${safe(i18n.t('Home screen'))} ${index + 1}">${pageMarker(false, true)}</button>`);
  }
  // Returns the new index of each old page.
  function stripEmptyScreens() {
    ui.extraScreen = false;
    const empty = page => lp.data.homePages[page].every(id => !id) && !(lp.data.homeWidgets[page] || []).length;
    const keep = lp.data.homePages.map((_, page) => page).filter(page => !empty(page));
    if (!keep.length) keep.push(0);
    const map = new Map(keep.map((page, index) => [page, index]));
    lp.data.homePages = keep.map(page => lp.data.homePages[page]); lp.data.homeWidgets = keep.map(page => lp.data.homeWidgets[page] || []);
    const current = keep.findIndex(page => page >= ui.page);
    ui.page = current < 0 ? keep.length - 1 : keep[current] === ui.page ? current : Math.max(0, current - 1);
    return map;
  }
  function remapDestination(destination, map) { if (destination?.type === 'home' && map.has(destination.page)) destination.page = map.get(destination.page); return destination; }
  function moveGhost(x, y) {
    if (!lp.dragState) return;
    const rect = screen.getBoundingClientRect();
    const offset = lp.dragState.widgetType ? 65 : 27, grab = lp.dragState.ghost.classList.contains('widget-span-ghost') ? lp.dragState.grabOffset : null;
    lp.dragState.ghost.style.left = `${x - rect.left - (grab ? grab.x : offset)}px`;
    lp.dragState.ghost.style.top = `${y - rect.top - (grab ? grab.y : offset)}px`;
    updateFolderDrag(x,y);
    updateDragOutline(x, y);
    const dropTarget = document.elementFromPoint(x, y)?.closest('[data-drop-remove],[data-drop-info]');
    const removeHover = !!dropTarget?.hasAttribute('data-drop-remove'), infoHover = !!dropTarget?.hasAttribute('data-drop-info') && lp.dragState.type === 'drawer';
    screen.querySelectorAll('.drop-target').forEach(node => node.classList.toggle('drop-hover', node === dropTarget && (removeHover || infoHover)));
    lp.dragState.ghost.classList.toggle('tint-delete', removeHover);
    lp.dragState.ghost.classList.toggle('tint-info', infoHover);
    const direction = ui.overlay ? 0 : x - rect.left < dp(20) ? -1 : rect.right - x < dp(20) ? 1 : 0;
    if (direction !== lp.dragState.edgeDirection) {
      clearTimeout(lp.dragState.edgeTimer);
      lp.dragState.edgeDirection = direction;
      if (direction && y > rect.top + 85 && y < rect.bottom - 120) lp.dragState.edgeTimer = setTimeout(() => {
        if (lp.dragState) { setHomePage(ui.page + direction); lp.dragState.edgeDirection = 0; }
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
    const list = JBLauncher.items(lp.data.homePages[ui.page], lp.data.homeWidgets[ui.page], widgetSize);
    for (const [key, to] of Object.entries(solution.moves)) {
      const item = list.find(entry => entry.key === key), node = reorderElement(key);
      if (!item || !node) continue;
      node.classList.add('jb-displaced');
      node.style.transform = `translate(${(to.x - item.x) * metrics.cellW}px,${(to.y - item.y) * metrics.cellH}px)`;
    }
  }
  function requestReorder(key, moving) {
    const source = lp.dragState;
    if (source.wsReorder?.key === key) return source.wsReorder.solution;
    if (source.wsPending === key) return null;
    clearTimeout(source.wsReorderTimer); source.wsPending = key;
    if (source.wsReorder) { source.wsReorder = null; showReorder(null); }
    source.wsReorderTimer = setTimeout(() => {
      if (lp.dragState !== source || source.wsPending !== key) return;
      const list = JBLauncher.items(lp.data.homePages[ui.page], lp.data.homeWidgets[ui.page], widgetSize);
      const solution = JBLauncher.solve(list, moving, source.wsDirection || [0, 0]);
      source.wsReorder = {key, solution, moving}; source.wsPending = '';
      showReorder(solution);
      if (source.lastPointer) updateDragOutline(...source.lastPointer);
    }, JBLauncher.REORDER_TIMEOUT);
    return null;
  }
  function clearReorder() { const source = lp.dragState; if (!source) return; clearTimeout(source.wsReorderTimer); source.wsPending = ''; if (source.wsReorder) { source.wsReorder = null; showReorder(null); } }
  function dragOutlineTarget(x, y) {
    const source = lp.dragState;
    if (!source || ui.overlay) return null;
    source.wsCandidate = null;
    if (source.lastPointer) source.wsDirection = [Math.sign(x - source.lastPointer[0]), Math.sign(y - source.lastPointer[1])];
    source.lastPointer = [x, y];
    const target = document.elementFromPoint(x, y), grid = target?.closest('.home-grid:not([inert])');
    if (source.widgetType) {
      if (!grid) return null;
      const rect = grid.getBoundingClientRect(), oldWidget = source.type === 'widget' ? lp.data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      const column = Math.round((x - rect.left - source.grabOffset.x) / (rect.width / GRID)), row = Math.round((y - rect.top - source.grabOffset.y) / (rect.height / GRID));
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
      const covered = lp.data.homeWidgets[ui.page].some(widget => index % GRID >= widget.x && index % GRID < widget.x + widgetSize(widget).width && Math.floor(index / GRID) >= widget.y && Math.floor(index / GRID) < widget.y + widgetSize(widget).height);
      if (!occupant && !covered) { clearReorder(); return outline; }
      // Near an icon's centre the drop makes or fills a folder; elsewhere the occupant moves aside.
      if (occupant) { const box = occupant.querySelector('.app-icon')?.getBoundingClientRect(); if (box && JBLauncher.folderZone({x, y}, {x: box.left + box.width / 2, y: box.top + box.height / 2}, box.width)) { clearReorder(); return null; } }
      if (ICSLauncherFolders.folder(lp.data, source.id) && occupant?.dataset.folderId) return null;
      const movingKey = source.type === 'home' && source.page === ui.page ? `s${source.slot}` : 'new';
      source.wsCandidate = {key: outline.key, moving: {key: movingKey, x: index % GRID, y: Math.floor(index / GRID), w: 1, h: 1}};
      return requestReorder(outline.key, source.wsCandidate.moving) ? outline : null;
    }
    if (!slot || occupant) return null;
    return {key: `d:${slot.dataset.dockSlot}`, container: slot};
  }
  function updateDragOutline(x, y) {
    const target = dragOutlineTarget(x, y), source = lp.dragState;
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
      const count = ICSLauncherFolders.folder(lp.data, destination.folderId)?.items.length || 0;
      if (panel) return panel.querySelector(`[data-folder-slot="${Math.min(destination.slot, count - 1)}"] .launcher-icon`);
      return [...viewport.querySelectorAll('[data-folder-id]')].find(button => button.dataset.folderId === destination.folderId && !button.closest('[inert]')) || null;
    }
    return null;
  }
  /* Folder.realTimeReorder: after hovering a cell for 150 ms, icons between the empty cell and the
     target slide over in 230 ms, each starting 30 ms later than the previous (decaying by 0.9). */
  function folderReorder(x, y, panel) {
    const source = lp.dragState, folder = ICSLauncherFolders.folder(lp.data, ui.folderId);
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
    const source = lp.dragState, folder = ICSLauncherFolders.folder(lp.data, ui.folderId);
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
    const source=lp.dragState;if(!source||source.widgetType)return;
    screen.querySelectorAll('.folder-drop-target,.folder-reorder-target').forEach(node=>node.classList.remove('folder-drop-target','folder-reorder-target'));
    const target=document.elementFromPoint(x,y),panel=overlayRoot.querySelector('.launcher-folder');
    if(panel){
      const rect=panel.getBoundingClientRect(),inside=x>=rect.left&&x<=rect.right&&y>=rect.top&&y<=rect.bottom;
      if(!inside&&!source.folderExitTimer)source.folderExitTimer=setTimeout(()=>{if(lp.dragState===source){ui.overlay='';renderOverlay();source.folderExitTimer=null;source.hoverFolder=null;}},800);
      else if(inside){clearTimeout(source.folderExitTimer);source.folderExitTimer=null;folderReorder(x,y,panel);}
      return;
    }
    const slot=target?.closest('[data-home-slot],[data-dock-slot]'),icon=slot?.querySelector('.launcher-icon');
    const sourceIsFolder=!!ICSLauncherFolders.folder(lp.data,source.id);
    const sameSlot=slot&&(slot.hasAttribute('data-home-slot')?source.type==='home'&&source.page===ui.page&&source.slot===Number(slot.dataset.homeSlot):source.type==='dock'&&source.slot===Number(slot.dataset.dockSlot));
    const folderId=icon?.dataset.folderId;
    const box=icon?.querySelector('.app-icon')?.getBoundingClientRect(),inZone=!!box&&JBLauncher.folderZone({x,y},{x:box.left+box.width/2,y:box.top+box.height/2},box.width);
    if(icon&&inZone&&!sameSlot&&!sourceIsFolder&&icon.dataset.action!=='drawer')icon.classList.add('folder-drop-target');
    const hoverId=!sourceIsFolder&&!sameSlot&&inZone?folderId:null;
    if(hoverId!==source.hoverFolder){
      clearTimeout(source.folderHoverTimer);source.hoverFolder=hoverId;
      if(hoverId)source.folderHoverTimer=setTimeout(()=>{if(lp.dragState===source&&ICSLauncherFolders.folder(lp.data,hoverId)?.items.length<ICSLauncherFolders.capacity){ui.folderId=hoverId;ui.overlay='folder';renderOverlay();}},700);
    }
  }
  function finishDrag(x, y) {
    if (!lp.dragState) return false;
    const source = lp.dragState;
    let target = document.elementFromPoint(x, y);
    if(ui.overlay==='folder'&&!target?.closest('.launcher-folder')){ui.overlay='';renderOverlay();target=document.elementFromPoint(x,y);}
    const folderSlot=target?.closest('[data-folder-slot]');
    let homeSlot = target?.closest('[data-home-slot]');
    if (target?.closest('[data-resize-frame]')) homeSlot = target.closest('.home-grid')?.querySelector('[data-home-slot]');
    const grid = target?.closest('.home-grid');
    if (!homeSlot && grid) {
      const rect = grid.getBoundingClientRect();
      const column = Math.min(GRID - 1, Math.max(0, Math.floor((x - rect.left) / rect.width * GRID)));
      const row = Math.min(GRID - 1, Math.max(0, Math.floor((y - rect.top) / rect.height * GRID)));
      homeSlot = grid.querySelector(`[data-home-slot="${row * GRID + column}"]`);
    }
    const dockSlot = target?.closest('[data-dock-slot]');
    const pageButton = target?.closest('.page-indicators button');
    const remove = target?.closest('[data-drop-remove]');
    const trashRect = remove?.getBoundingClientRect();
    if (source.type === 'drawer' && target?.closest('[data-drop-info]')) {
      clearTimeout(source.edgeTimer); clearDragOutlines(); source.ghost.remove(); lp.dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer'); stripEmptyScreens(); save();
      openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); lp.suppressClickUntil = Date.now() + 350;
      return true;
    }
    let destination = null;
    // Commit a reorder solution if the drop lands where it was computed.
    let committed = null;
    if (!ui.overlay && source.lastPointer) {
      updateDragOutline(x, y);
      const candidate = source.wsCandidate;
      if (candidate) {
        const solution = source.wsReorder?.key === candidate.key ? source.wsReorder.solution : JBLauncher.solve(JBLauncher.items(lp.data.homePages[ui.page], lp.data.homeWidgets[ui.page], widgetSize), candidate.moving, source.wsDirection || [0, 0]);
        if (solution) committed = {key: candidate.key, solution, moving: candidate.moving};
      }
    }
    if (committed) {
      const page = lp.data.homePages[ui.page], sameIcon = !source.widgetType && source.type === 'home' && source.page === ui.page;
      if (sameIcon) page[source.slot] = null;
      lp.data.homePages[ui.page] = JBLauncher.apply(page, lp.data.homeWidgets[ui.page], committed.solution.moves);
      showReorder(null);
      if (sameIcon) { const slot = committed.moving.y * GRID + committed.moving.x; lp.data.homePages[ui.page][slot] = source.id; homeSlot = null; destination = {type: 'home', page: ui.page, slot}; source.reorderHandled = true; }
    }
    if (source.reorderHandled) { /* placed above */ }
    else if (source.widgetType) {
      const oldWidget = source.type === 'widget' ? lp.data.homeWidgets[source.page].find(widget => widget.id === source.id) : null;
      if (oldWidget) destination = {widget: oldWidget.id, page: source.page};
      if (remove && oldWidget) { lp.data.homeWidgets[source.page] = lp.data.homeWidgets[source.page].filter(widget => widget.id !== source.id); destination = {trash: true}; }
      else if (homeSlot) {
        const rect = homeSlot.closest('.home-grid').getBoundingClientRect();
        const column = Math.round((x - rect.left - source.grabOffset.x) / (rect.width / GRID));
        const row = Math.round((y - rect.top - source.grabOffset.y) / (rect.height / GRID));
        if (widgetFits(ui.page, column, row, oldWidget || source.widgetType, oldWidget?.id || '')) {
          if (oldWidget) {
            lp.data.homeWidgets[source.page] = lp.data.homeWidgets[source.page].filter(widget => widget.id !== source.id);
            oldWidget.x = column; oldWidget.y = row;
            lp.data.homeWidgets[ui.page].push(oldWidget);
            destination = {widget: oldWidget.id, page: ui.page};
            // Launcher2 shows the resize frame after dropping a resizable widget.
            if (widgetSize(oldWidget).resize) ui.resizeWidget = oldWidget.id;
          }
          else { const added = addWidget(source.widgetType, column, row); if (added) { destination = {widget: added.id, page: ui.page}; if (widgetSize(added).resize) ui.resizeWidget = added.id; } }
        } else toast('This home screen is full');
      }
    } else {
      let result=null,attempt=null;
      const dropAt=location=>{attempt=location;return ICSLauncherFolders.drop(lp.data,source,location);};
      if(remove)result={ok:ICSLauncherFolders.remove(lp.data,source)};
      else if((folderSlot||target?.closest('.launcher-folder-grid'))&&source.reorderPanel&&source.reorderPanel===overlayRoot.querySelector('.launcher-folder'))result=dropAt({type:'folder',folderId:ui.folderId,slot:source.folderGap});
      else if(folderSlot)result=dropAt({type:'folder',folderId:ui.folderId,slot:Number(folderSlot.dataset.folderSlot)});
      else if(target?.closest('.launcher-folder-grid'))result=dropAt({type:'folder',folderId:ui.folderId,slot:ICSLauncherFolders.folder(lp.data,ui.folderId).items.length});
      else if(homeSlot){
        const slot=Number(homeSlot.dataset.homeSlot);
        const covered=lp.data.homeWidgets[ui.page].some(widget=>slot%GRID>=widget.x&&slot%GRID<widget.x+widgetSize(widget).width&&Math.floor(slot/GRID)>=widget.y&&Math.floor(slot/GRID)<widget.y+widgetSize(widget).height);
        if(!covered)result=dropAt({type:'home',page:ui.page,slot});
      }else if(dockSlot)result=dropAt({type:'dock',slot:Number(dockSlot.dataset.dockSlot)});
      else if(pageButton){
        const nextPage=Number(pageButton.dataset.id);
        const slot=lp.data.homePages[nextPage].findIndex((id,index)=>id===null&&!lp.data.homeWidgets[nextPage].some(widget=>index%GRID>=widget.x&&index%GRID<widget.x+widgetSize(widget).width&&Math.floor(index/GRID)>=widget.y&&Math.floor(index/GRID)<widget.y+widgetSize(widget).height));
        if(slot>=0){result=dropAt({type:'home',page:nextPage,slot});if(result.ok)ui.page=nextPage;}
        else result={ok:false,error:'This home screen is full'};
      }
      if(result?.error)toast(result.error);
      if(ui.overlay==='folder'&&!ICSLauncherFolders.folder(lp.data,ui.folderId))ui.overlay='';
      // A folder that received the item may now sit where the target icon was.
      if(remove&&result?.ok)destination={trash:true};
      else if(result?.ok&&attempt)destination=attempt;
      else if(['home','dock','folder'].includes(source.type))destination=source;
    }
    clearTimeout(source.folderExitTimer);clearTimeout(source.folderHoverTimer);clearTimeout(source.reorderTimer);clearTimeout(source.wsReorderTimer);clearFolderDragFeedback();
    clearTimeout(source.edgeTimer); clearDragOutlines(); lp.dragState = null; screen.classList.remove('dragging', 'dragging-from-drawer');
    const pageMap = stripEmptyScreens(); remapDestination(destination, pageMap);
    save(); render(); lp.suppressClickUntil = Date.now() + 350;
    landGhost(source.ghost, destination, trashRect);
    return true;
  }
  function setHomePage(page) {
    ui.page = Math.max(lp.dragState || ui.overview ? 0 : -1, Math.min(lp.data.homePages.length - 1, page));
    const track = viewport.querySelector('.home-pages');
    if (!track) return;
    const home = viewport.querySelector('.kk-home');
    if (home) { home.style.removeProperty('--gnow-instant'); home.style.setProperty('--gnow', ui.page === -1 ? 1 : 0); home.classList.toggle('gel-now-open', ui.page === -1); home.querySelector('.gel-now-layer').inert = ui.page !== -1; }
    track.style.transition = '';
    track.style.transform = `translateX(${-Math.max(0, ui.page) * 100}%)`; snapResting(track);
    setWallpaperPan(ui.page);
    track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page && !ui.overview; grid.style.setProperty('--rel', index - ui.page); });
    viewport.querySelectorAll('.page-indicators button').forEach(button => button.classList.toggle('active', Number(button.dataset.id) === ui.page));
    screen.classList.add('show-page-indicator');
    clearTimeout(ui.pageIndicatorTimer);
    ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
  }
  function moveHomePage(dx) {
    const content = viewport.querySelector('.home-pages');
    if (!content) return;
    const home = viewport.querySelector('.kk-home'), width = screen.clientWidth;
    // Scrolling into Google Now: the pane follows the finger and the workspace, dock and indicator slide away.
    if (home && (ui.page === -1 || (ui.page === 0 && dx > 0)) && !ui.overview) {
      const progress = ui.page === -1 ? Math.max(0, Math.min(1, 1 + dx / width)) : Math.max(0, Math.min(1, dx / width));
      home.style.setProperty('--gnow-instant', '1'); home.style.setProperty('--gnow', progress.toFixed(4));
      return;
    }
    const distance = Math.max(-(lp.data.homePages.length - 1 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
    content.style.transition = 'none';
    content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
    setWallpaperPan(ui.page - distance / screen.clientWidth, false);
  }
  function finishHomePage(dx) {
    const nextPage = Math.max(ui.overview ? 0 : -1, Math.min(lp.data.homePages.length - 1, ui.page + (dx < 0 ? 1 : -1)));
    screen.classList.remove('page-swiping');
    lp.suppressClickUntil = Date.now() + 350;
    setHomePage(Math.abs(dx) > dp(50) ? nextPage : ui.page);
  }
  function finishDrawerPage(dx) {
    const [first, last] = drawerRange();
    const nextPage = Math.max(first,Math.min(last,ui.drawerPage + (dx < 0 ? 1 : -1)));
    lp.suppressClickUntil = Date.now() + 350;
    if (Math.abs(dx) > dp(50) && nextPage !== ui.drawerPage) {
      ui.drawerPage = nextPage; render();
      viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
    } else {
      const page = viewport.querySelector('.drawer-page');
      if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
    }
  }
  let lastWheelPage = 0;
  screen.addEventListener('wheel', event => {
    if (ui.view !== 'home' || ui.overlay || lp.dragState || !event.target.closest('.home-content')) return;
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
    const widget = lp.data.homeWidgets[ui.page].find(item => item.id === ui.resizeWidget), metrics = gridMetrics();
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
    const list = JBLauncher.items(lp.data.homePages[ui.page], lp.data.homeWidgets[ui.page], widgetSize);
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
      lp.data.homePages[ui.page] = JBLauncher.apply(lp.data.homePages[ui.page], lp.data.homeWidgets[ui.page], r.solution.moves);
      Object.assign(r.widget, {x: r.rect.x, y: r.rect.y, width: r.rect.w, height: r.rect.h}); save();
    }
    lp.suppressClickUntil = Date.now() + 350; render();
  };
  window.addEventListener('pointerup', endResize); window.addEventListener('pointercancel', endResize);
  Object.assign(lp, {homePageCount, renderHome, restoreWidgetScroll, renderDrawer, GEL_UNSIMULATED, folderName, dragSource, clingLayerRoot, startDrag, moveGhost, moveHomePage, stepPhotoStack, finishDrawerPage, finishHomePage, finishDrag, clearFolderDragFeedback, clearDragOutlines, stripEmptyScreens, setHomePage, appIcon, digitalClockWidget, musicActive, placeShortcut});
  return {
    afterOverlay(closingFolder) {
      // Folder.animateOpen/animateClosed run only when the folder actually opens or closes, not on content updates.
      const folderPanel = ui.overlay === 'folder' ? overlayRoot.querySelector('.launcher-folder') : null;
      if (folderPanel && lp.openFolderId !== ui.folderId) {
        ui.folderSettled = '';
        if (!reducedMotion?.matches) folderPanel.classList.add('lp-folder-opening');
        const animations = ICSTransitions.play(folderPanel, ICSTransitions.specs['folder-open'].enter);
        animations.forEach(animation => animation.finished.then(() => animation.cancel(), () => {}));
        const folderId = ui.folderId;
        Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => { if (ui.overlay === 'folder' && ui.folderId === folderId) { ui.folderSettled = folderId; syncClings(); } });
      }
      if (!folderPanel && lp.openFolderId && clingLayerRoot().querySelector('[data-cling="folder"]') && lp.data.clings) { lp.data.clings.folder = true; save(); }
      else if (!folderPanel && closingFolder && lp.openFolderId) {
        closingFolder.inert = true; closingFolder.classList.add('launcher-folder-closing'); overlayRoot.append(closingFolder);
        const animations = ICSTransitions.play(closingFolder, ICSTransitions.specs['folder-close'].exit);
        Promise.all(animations.map(animation => animation.finished)).catch(() => {}).then(() => closingFolder.remove());
        if (!animations.length) closingFolder.remove();
      }
      lp.openFolderId = folderPanel ? ui.folderId : '';
      if (!folderPanel) ui.folderSettled = '';
      syncClings();
      return false;
    },
    overlay(name, root) {
      if (ui.overlay.startsWith('widget-photo')) {
        overlayRoot.innerHTML = ICSWidgets.photoOverlay(lp.data, ui, key => i18n.t(key));
        return true;
      }
      return false;
    },
    backDrawer() {
      if (ui.view === 'drawer' || ui.view === 'wallpaper-picker') { home(false); return true; }
      return false;
    },
    back() {
      if (ui.view === 'drawer' && ui.drawerWidgets) { ui.drawerWidgets = false; ui.drawerPage = 0; home(false); ui.overview = true; render(); return true; }
      if (ui.view === 'home' && ui.overview) { ui.overview = false; render(); return true; }
      return false;
    },
    backPhotoWidget() {
      if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return true; }
      return false;
    },
    overlays: {
      'folder'() {
        overlayRoot.innerHTML = renderFolder();
        positionFolder();
      },
    },
    click(action, button, event) {
      const {id} = button.dataset;
      switch (action) {
        case 'drawer': {
          // The reveal starts on the all apps button: its centre's offset from the panel centre, in screen px.
          const box = button.getBoundingClientRect(), frame = screen.getBoundingClientRect(), k = frame.width / screen.clientWidth;
          const panelCenterY = (lp.statusBarHeight() + (screen.clientHeight - navRoot.offsetHeight - 23.2)) / 2;
          ui.drawerReveal = reducedMotion?.matches ? null : {dx: Math.round((box.left + box.width / 2 - frame.left) / k - screen.clientWidth / 2), dy: Math.round((box.top + box.height / 2 - frame.top) / k - panelCenterY)};
          ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; ui.overview = false; ui.drawerWidgets = false; if (ui.drawerPage >= drawerAppPages()) ui.drawerPage = 0; render();
          ui.drawerReveal = null; setTimeout(() => viewport.querySelector('.lp-drawer')?.classList.remove('lp-revealing'), 320); break;
        }
        case 'cling-dismiss': if (lp.data.clings) { lp.data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`), () => syncClings()); break;
        case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
        // Overview mode: Widgets opens all apps on the first widget page; a tap on a page returns to it.
        case 'kk-overview-widgets': ui.overview = false; ui.view = 'drawer'; ui.drawerWidgets = true; ui.drawerPage = drawerAppPages(); render(); break;
        case 'kk-overview-page': if (ui.overview) { ui.overview = false; ui.page = Number(id); render(); } break;
        case 'drawer-page': ui.drawerPage = Number(id); render(); break;
        case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
        case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
        case 'widget-calendar-event': { const event = lp.data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
        case 'widget-music-open': openApp('play-music'); break;
        case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
        case 'widget-music-prev': ICSMusic.step(ui.music, -1); ui.musicActive = true; ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
        case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
        case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
        case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
        case 'widget-photo-cancel': cancelPhotoWidget(); break;
        case 'page': setHomePage(Number(id)); break;
        case 'power-toggle':
          if (id === 'brightness') lp.data.settings.brightness = lp.data.settings.brightness < 30 ? 55 : lp.data.settings.brightness < 80 ? 100 : 20;
          else lp.data.settings[id] = !lp.data.settings[id];
          if(id==='wifi'&&lp.data.settings.wifi)lp.data.settings.portableHotspot=false;
          if(id==='bluetooth'&&!lp.data.settings.bluetooth)lp.data.settings.bluetoothTether=false;
          save(); render(); break;
        case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;lp.saveMusic();render();break;
        default: return false;
      }
      return true;
    }
  };
});
