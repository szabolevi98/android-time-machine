/* The launcher (IMM76I Launcher2.apk), moved out of simulator.js (docs/plans/engine-migration.md): the home screen and
   the all apps drawer, with everything that lives on them:
   - five pages of 4 × 4 cells and the hotseat; a sideways swipe, the mouse wheel or the page dots move between pages,
     and a live wallpaper follows the scroll (ics-wallpapers.js)
   - the drawer's Apps and Widgets tabs and their pages, the Play Store button
   - widgets: Analog clock, Calendar, Music, Photo Gallery (with its WidgetConfigure), Power control and Play Store's; a
     vertical fling on a photo frame moves through its stack
   - drag and drop (a long press, or a mouse drag): icons, folders and widgets between pages, the hotseat, folders, Remove
     and App info, with the outlines, the edge scroll and the drop animations; folders with their names and reordering
   - the first-run clings, InstallShortcutReceiver (a contact or a store app's shortcut on the first free cell), the
     Google search bar and its Voice Search, and a long press on the wallpaper (Select wallpaper from). */
(() => {
  'use strict';
  let dragState = null, dragTimer = null, homeLongPressTimer = null, openFolderId = '', closingFolder = null, lastWheelPage = 0, lastWidgetMinute = '';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
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
    function analogClock() {
      const now = deviceDate();
      return `<div class="analog-clock" aria-label="${clock()}"><img class="clock-dial" src="assets/appwidget_clock_dial.png" alt=""><img class="clock-hour" src="assets/appwidget_clock_hour.png" alt="" style="transform:rotate(${(now.getHours() % 12) * 30 + now.getMinutes() / 2}deg)"><img class="clock-minute" src="assets/appwidget_clock_minute.png" alt="" style="transform:rotate(${now.getMinutes() * 6}deg)"></div>`;
    }
    // Drawer and drag previews use the providers' original previewImage artwork where AOSP has one.
    function widgetArt(type) {
      if (type === 'analog') return analogClock();
      if (type === 'digital') return `<strong class="widget-time">${clock()}</strong><span>${c.fullDate()}</span>`;
      if (type === 'calendar') return '<img class="widget-preview-image" src="assets/calwidget-calendar_widget_preview.png" alt="">';
      if (type === 'weather') return '<strong class="widget-weather">☀ 22°</strong><span>Sunny · San Francisco</span>';
      if (type === 'music') return ICSWidgets.music(ui.music, tracks, false, key => i18n.t(key), true);
      if (type === 'power') return `<div class="power-widget">${[['wifi','wifi'],['bluetooth','bluetooth'],['gps','gps'],['autoSync','sync'],['brightness','brightness']].map(([key,asset]) => `<span class="power-cell ${data.settings[key] ? 'enabled' : ''}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></span>`).join('')}</div>`;
      return '<img class="widget-preview-image" src="assets/gallery-widget_preview.png" alt="">';
    }
    // Play Store's widget: three featured items cross-fade (ViewFlipper, 7 s each); a tap opens the item.
    function playStoreWidget() {
      const items = ICSPlay.all().filter(item => ['apps', 'games', 'books', 'movies'].includes(item.kind) && item.developer !== 'Android Demo').slice(0, 3);
      return `<div class="psw">${items.map((item, i) => `<button class="psw-item" style="--i:${i};--n:${items.length};--a:${(item.colors || ['#2c3e57'])[0]};--b:${(item.colors || ['#2c3e57', '#f1b45d'])[1] || '#f1b45d'}" data-action="widget-play-item" data-id="${safe(item.id)}"><span class="psw-promo"><em>${safe(item.name)}</em></span><span class="psw-panel"><img src="assets/play-store.svg?v=2" alt=""><span><b>${safe(item.name)}</b><small>${safe(item.developer)}</small></span></span></button>`).join('')}</div>`;
    }
    function widgetBody(widget) {
      const t = key => i18n.t(key);
      if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
      if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, c.musicActive(), t);
      if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
      if (widget.type === 'play-store') return playStoreWidget();
      return null;
    }
    const homeWidget = widget => {
      const spec = widgetSize(widget);
      const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
      return `<div class="home-widget widget-${widget.type}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}</div>`;
    };
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
    function restoreWidgetScroll() {
      ui.widgetScroll = ui.widgetScroll || {};
      viewport.querySelectorAll('.home-widget .calw-list').forEach(list => {
        const id = list.closest('.home-widget').dataset.widgetId;
        list.scrollTop = ui.widgetScroll[id] || 0;
      });
    }
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
      if (!c.pointer?.source || dragState) return;
      // Keep touch delivery on the stable screen when a drawer item replaces its view.
      try { screen.setPointerCapture(c.pointer.pointerId); } catch {}
      dragState = c.pointer.source;
      // Workspace.startDrag hides the original view (GONE) while its DragView moves.
      c.pointer.target.closest('.launcher-icon')?.classList.add('drag-source-icon');
      if (dragState.type === 'widget') c.pointer.target.closest('.home-widget')?.classList.add('drag-source-widget');
      if (dragState.type === 'widget') {
        const rect = c.pointer.target.closest('.home-widget').getBoundingClientRect();
        dragState.grabOffset = {x: c.pointer.x - rect.left, y: c.pointer.y - rect.top};
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
        const source = dragState.type === 'widget' ? c.pointer.target.closest('.home-widget') : null;
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
      c.suppressClick(500);
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
        openApp('settings'); ui.settingsApp = source.id; ui.sub = 'app-info'; render(); c.suppressClick(350);
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
      save(); render(); c.suppressClick(350);
      landGhost(source.ghost, destination, trashRect);
      return true;
    }
    function setHomePage(page) {
      ui.page = Math.max(0, Math.min(4, page));
      const track = viewport.querySelector('.home-pages');
      if (!track) return;
      track.style.transition = '';
      track.style.transform = `translateX(${-ui.page * 100}%)`; snapResting(track);
      c.tweenWallpaperOffset(ui.page / 4);
      track.querySelectorAll('.home-grid').forEach((grid, index) => { grid.inert = index !== ui.page; });
      viewport.querySelectorAll('.page-indicators button').forEach((button,index) => button.classList.toggle('active', index === ui.page));
      screen.classList.add('show-page-indicator');
      clearTimeout(ui.pageIndicatorTimer);
      ui.pageIndicatorTimer = setTimeout(() => screen.classList.remove('show-page-indicator'), 800);
    }
    function moveHomePage(dx) {
      const content = viewport.querySelector('.home-pages');
      if (!content) return;
      const distance = Math.max(-(4 - ui.page) * screen.clientWidth, Math.min(ui.page * screen.clientWidth, dx));
      content.style.transition = 'none';
      content.style.transform = `translateX(calc(${-ui.page * 100}% + ${distance}px))`;
      c.wallpaperOffset((ui.page - distance / screen.clientWidth) / 4);
    }
    function finishHomePage(dx) {
      const nextPage = Math.max(0, Math.min(4, ui.page + (dx < 0 ? 1 : -1)));
      screen.classList.remove('page-swiping');
      c.suppressClick(350);
      setHomePage(Math.abs(dx) > dp(53) ? nextPage : ui.page);
    }
    function finishDrawerPage(dx) {
      const pageCount = ui.drawerTab === 'apps' ? Math.ceil(apps.length / 20) : Math.ceil(widgetTypes.length / 4);
      const nextPage = Math.max(0,Math.min(pageCount - 1,ui.drawerPage + (dx < 0 ? 1 : -1)));
      c.suppressClick(350);
      if (Math.abs(dx) > dp(53) && nextPage !== ui.drawerPage) {
        ui.drawerPage = nextPage; render();
        viewport.querySelector('.drawer-page')?.animate([{transform:`translateX(${dx < 0 ? '100%' : '-100%'})`,opacity:.5},{transform:'translateX(0)',opacity:1}],{duration:210,easing:'ease-out'});
      } else {
        const page = viewport.querySelector('.drawer-page');
        if (page) { page.style.transition = 'transform .18s ease-out'; page.style.transform = ''; }
      }
    }
    return {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage};
  }

  const spec = {
    // The launcher's own gestures (the page must not rubber-band under them).
    touch: '.home-view, .drawer-view',
    init(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      c.appIcon = id => api(c).appIcon(id); c.placeShortcut = (key, label) => api(c).placeShortcut(key, label); c.dragging = () => !!dragState;
      screen.addEventListener('wheel', event => {
        if (ui.view !== 'home' || ui.overlay || dragState || !event.target.closest('.home-content')) return;
        const widgetList = event.target.closest('.calw-list');
        if (widgetList && Math.abs(event.deltaY) > Math.abs(event.deltaX) && widgetList.scrollHeight > widgetList.clientHeight) return;
        event.preventDefault();
        const stack = event.target.closest('[data-photo-stack]');
        if (stack && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          if (Math.abs(event.deltaY) >= 8 && performance.now() - lastWheelPage >= 300) { lastWheelPage = performance.now(); api(c).stepPhotoStack(stack.dataset.photoStack, event.deltaY > 0 ? 1 : -1); }
          return;
        }
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        if (Math.abs(delta) < 8 || performance.now() - lastWheelPage < 300) return;
        lastWheelPage = performance.now();
        api(c).setHomePage(ui.page + Math.sign(delta));
      }, {passive:false});
      window.addEventListener('resize', () => api(c).syncClings());
      window.addEventListener('resize',()=>{if(ui.overlay==='folder')api(c).positionFolder();});
    },
    render(c) { return c.ui.view === 'drawer' ? api(c).renderDrawer() : api(c).renderHome(); },
    drawn(c) { if (c.ui.view === 'home') api(c).restoreWidgetScroll(); },
    // Before every draw: the calendar widgets keep their scroll.
    rendering(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      viewport.querySelectorAll('.home-widget .calw-list').forEach(list => { (ui.widgetScroll ||= {})[list.closest('.home-widget').dataset.widgetId] = list.scrollTop; });
    },
    // Voice Search's dialog is drawn as it is (not translated, no clings).
    ownOverlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay === 'vs3') return ICSVoice.render(ui.vs3 || {phase: 'waiting'}, i18n.language, data.inputPrefs?.vsLanguage || 'en-US');
    },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if (ui.overlay.startsWith('widget-photo')) {
        return ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
      }
      if (ui.overlay === 'wallpaper-source') {
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="wallpaper-source" role="dialog" aria-label="Select wallpaper from"><h3>Select wallpaper from</h3>${[['gallery-wallpaper', 'Gallery'], ['open-live-wallpapers', 'Live Wallpapers'], ['open-wallpapers', 'Wallpapers']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1]))).map(([action, label]) => `<button data-action="${action}" data-no-translate>${safe(i18n.t(label))}</button>`).join('')}</div>`;
      }
      if (ui.overlay === 'folder') {
        return renderFolder();
      }
    },
    mountOverlay(c) { if (c.ui.overlay === 'folder') api(c).positionFolder(); },
    // The folder that is open before the overlay is drawn again; after it, its open / close animation and the clings.
    beforeOverlay(c) { closingFolder = c.overlayRoot.querySelector('.launcher-folder'); },
    afterOverlay(root, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
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
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      const {id} = button.dataset;
      switch (action) {
        case 'drawer': if (data.clings && !data.clings.workspace) { data.clings.workspace = true; save(); } ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; render(); break;
        case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`)); break;
        case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
        case 'drawer-tab': ui.drawerTab = id; ui.drawerPage = 0; render(); break;
        case 'drawer-page': ui.drawerPage = Number(id); render(); break;
        case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
        case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
        case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
        case 'widget-music-open': { const active = c.musicActive(); openApp('music'); if (active) { ui.sub = 'player'; render(); } break; }
        case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; c.saveMusic(); render(); break;
        case 'widget-photo-open': { const photo = data.photos.find(item => item.id === Number(id)); if (!photo) break; openApp('gallery'); ui.selectedPhoto = photo.id; ui.galleryAlbum = ICSMedia.album(photo); ui.sub = 'photo'; ui.galleryZoom = false; render(); break; }
        case 'widget-photo-type': if (id === 'shuffle') configurePhotoWidget({source: 'shuffle'}); else { ui.overlay = id === 'album' ? 'widget-photo-album' : 'widget-photo-image'; renderOverlay(); } break;
        case 'widget-photo-album': configurePhotoWidget({source: 'album', album: id}); break;
        case 'widget-photo-image': configurePhotoWidget({source: 'photo', photo: Number(id)}); break;
        case 'widget-photo-cancel': cancelPhotoWidget(); break;
        case 'page': setHomePage(Number(id)); break;
        case 'power-toggle':
          if (id === 'brightness') data.settings.brightness = data.settings.brightness < 30 ? 55 : data.settings.brightness < 80 ? 100 : 20;
          else data.settings[id] = !data.settings[id];
          if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
          if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
          save(); render(); break;
        case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;c.saveMusic();render();break;
        case 'voice-search': vs3Start(); break;
        case 'vs3-again': vs3Start(); break;
        case 'vs3-cancel': vs3Stop(); ui.overlay = ''; renderOverlay(); break;
        case 'vs3-help': vs3Stop(); ui.vs3 = {phase: 'help'}; renderOverlay(); break;
        case 'vs3-settings': vs3Stop(); ui.overlay = ''; renderOverlay(); openApp('settings'); ui.sub = 'lng-vs'; render(); break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if(form.dataset.form==='folder-name'){form.querySelector('input')?.blur();render();return true;}
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return true;}
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if (ui.overlay.startsWith('widget-photo')) { cancelPhotoWidget(); return true; }
      if (ui.overlay) return false;
      if (ui.view === 'drawer') { home(false); return true; }
      return false;
    },
    // Home: a photo frame still waiting for its WidgetConfigure goes.
    goHome(c) { const {ui, data, save} = c; if(ui.photoWidgetSetup){const setup=ui.photoWidgetSetup;data.homeWidgets[setup.page]=data.homeWidgets[setup.page].filter(widget=>widget.id!==setup.id);ui.photoWidgetSetup=null;save();} },
    contextmenu(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (!dragState && ui.view === 'home' && !ui.overlay && event.button === 2 && event.target.closest('.home-slot') && !event.target.closest('.launcher-icon')) { ui.overlay = 'wallpaper-source'; renderOverlay(); }
    },
    pointerdown(event, p, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      p.source = dragSource(event.target); p.pageSwipeEligible = ui.view === 'home' && !ui.overlay && !!event.target.closest('.home-view') && !event.target.closest('.dock, .page-indicators, .home-search'); p.drawerSwipeEligible = ui.view === 'drawer' && !!event.target.closest('.drawer-page');
      if (ui.view === 'home' && !ui.overlay && event.target.closest('.home-slot') && !c.pointer.source) homeLongPressTimer = setTimeout(() => { ui.overlay = 'wallpaper-source'; renderOverlay(); c.endPointer(); c.suppressReleaseClick(); }, c.holdDelay(550));
      if (ui.view === 'home' && !ui.overlay) c.pointer.photoStack = event.target.closest('[data-photo-stack]')?.dataset.photoStack || '';
      if (c.pointer.source) dragTimer = setTimeout(() => startDrag(event.clientX, event.clientY), c.holdDelay(440));
    },
    pointermove(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if (dragState) { moveGhost(event.clientX, event.clientY); return true; }
      if (Math.hypot(dx,dy) > dp(9)) clearTimeout(homeLongPressTimer);
      if (c.pointer.drawerSwipeEligible && (c.pointer.drawerSwiping || Math.abs(dx) > dp(14) && Math.abs(dx) > Math.abs(dy) * 1.1)) {
        c.pointer.drawerSwiping = true;
        clearTimeout(dragTimer);
        event.preventDefault();
        try { screen.setPointerCapture(event.pointerId); } catch {}
        const page = viewport.querySelector('.drawer-page');
        if (page) { page.style.transition = 'none'; page.style.transform = `translateX(${Math.max(-screen.clientWidth*.65,Math.min(screen.clientWidth*.65,dx))}px)`; }
        return true;
      }
      // StackView: a vertical fling on the front picture moves through the stack.
      if (c.pointer.photoStack && (c.pointer.photoSwiping || Math.abs(dy) > dp(7) && Math.abs(dy) > Math.abs(dx) * 1.2)) {
        if (!c.pointer.photoSwiping) { c.pointer.photoSwiping = true; clearTimeout(dragTimer); c.suppressClick(350); try { screen.setPointerCapture(event.pointerId); } catch {} }
        event.preventDefault();
        const front = viewport.querySelector(`[data-photo-stack="${CSS.escape(c.pointer.photoStack)}"] .phw-front`);
        if (front) { front.style.transition = 'none'; front.style.transform = `translateY(${Math.max(-60, Math.min(90, dy))}px) rotate(${Math.max(-6, Math.min(6, dy / 15))}deg)`; front.style.opacity = String(Math.max(.35, 1 - Math.abs(dy) / 160)); }
        return true;
      }
    },
    // The core's list scrolling started: no long press drag.
    scrollstart() { clearTimeout(dragTimer); },
    pointerdrag(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if (c.pointer.swiping) { event.preventDefault(); moveHomePage(dx); return true; }
      const distance = Math.hypot(dx, dy);
      if (distance > 9) clearTimeout(dragTimer);
      const horizontal = Math.abs(dx) > Math.abs(dy) * 1.1;
      const quickHomeIcon = ['home','widget'].includes(c.pointer.source?.type) && performance.now() - c.pointer.downTime < 260;
      if (c.pointer.pageSwipeEligible && horizontal && Math.abs(dx) > (c.pointer.source ? 28 : 10) && (!c.pointer.source || quickHomeIcon)) {
        c.pointer.swiping = true;
        screen.classList.add('page-swiping');
        try { screen.setPointerCapture(event.pointerId); } catch {}
        c.suppressClick(350);
        event.preventDefault();
        moveHomePage(dx);
        return true;
      }
      // A sideways drag in the drawer turns its page however slowly it starts, also from an icon (PagedView takes the
      // gesture past the touch slop, before the long press); the mouse's quick drag to the home screen is a vertical one.
      if (c.pointer.source && event.pointerType === 'mouse' && distance > 8 && !(quickHomeIcon && horizontal) && !(c.pointer.drawerSwipeEligible && horizontal)) startDrag(event.clientX, event.clientY);
    },
    pointerup(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      clearTimeout(dragTimer); clearTimeout(homeLongPressTimer);
      if (c.pointer.photoSwiping) { if (Math.abs(dy) > dp(35)) stepPhotoStack(c.pointer.photoStack, dy > 0 ? 1 : -1); else render(); c.suppressClick(350); return true; }
      if (c.pointer.drawerSwiping) { finishDrawerPage(dx); return true; }
    },
    pointerdrop(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      if (c.pointer.swiping || c.pointer.pageSwipeEligible && !dragState && Math.abs(dx) > dp(53) && Math.abs(dx) > Math.abs(dy) && (!c.pointer.source || c.pointer.source.type === 'home' && performance.now() - c.pointer.downTime < 260)) {
        finishHomePage(dx); return true;
      }
      if (!dragState && c.pointer?.source && !['drawer', 'drawer-widget'].includes(c.pointer.source.type) && Math.hypot(event.clientX - c.pointer.x, event.clientY - c.pointer.y) > dp(11)) startDrag(event.clientX, event.clientY);
      if (finishDrag(event.clientX, event.clientY)) return true;
    },
    pointercancel(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      clearTimeout(dragTimer); clearTimeout(homeLongPressTimer); clearTimeout(dragState?.edgeTimer);clearTimeout(dragState?.folderExitTimer);clearTimeout(dragState?.folderHoverTimer);clearFolderDragFeedback();dragState?.ghost.remove(); clearDragOutlines(); dragState = null; setHomePage(ui.page); const drawerPage = viewport.querySelector('.drawer-page'); if (drawerPage) drawerPage.style.transform = '';
      if (ui.overlay === 'folder') renderOverlay();
    },
    key(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {widgetTypes, widgetSize, appIcon, folderName, contactShortcut, VCARD, placeShortcut, launcherIcon, analogClock, widgetArt, playStoreWidget, widgetBody, homeWidget, renderHome, renderDrawer, widgetFits, addWidget, stepPhotoStack, pendingPhotoWidget, configurePhotoWidget, cancelPhotoWidget, restoreWidgetScroll, vs3Stop, vs3Start, clingLayerRoot, clingTarget, placeCling, syncClings, renderFolder, positionFolder, dragSource, startDrag, moveGhost, dragOutlineTarget, updateDragOutline, clearDragOutlines, landGhost, dragDestination, folderReorder, applyFolderGap, clearFolderDragFeedback, updateFolderDrag, finishDrag, setHomePage, moveHomePage, finishHomePage, finishDrawerPage} = api(c);
      const focusedStack = ui.view === 'home' && !ui.overlay && document.activeElement?.closest?.('[data-photo-stack]');
      if (focusedStack && ['ArrowUp','ArrowDown'].includes(event.key)) { event.preventDefault(); const id = focusedStack.dataset.photoStack; stepPhotoStack(id, event.key === 'ArrowDown' ? 1 : -1); viewport.querySelector(`[data-photo-stack="${CSS.escape(id)}"] .phw-front`)?.focus(); return true; }
    },
    // Every second: the analog clocks; once a minute the calendar widgets (their "now" line and next events).
    second(c, now) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      document.querySelectorAll('.analog-clock').forEach(node => {
        node.setAttribute('aria-label', clock());
        node.querySelector('.clock-hour').style.transform = `rotate(${now.getHours() % 12 * 30 + now.getMinutes() / 2}deg)`;
        node.querySelector('.clock-minute').style.transform = `rotate(${now.getMinutes() * 6}deg)`;
      });
      const minute = stamp => `${stamp.toDateString()} ${stamp.getHours()}:${stamp.getMinutes()}`;
      if (minute(now) !== lastWidgetMinute) {
        lastWidgetMinute = minute(now);
        if (ui.view === 'home' && !ui.overlay && !c.pointer && !dragState && viewport.querySelector('.calw')) render();
      }
    },
  };
  ICS.register('home', spec);
  ICS.register('drawer', spec);
})();
