/* KitKat Google Now Launcher workspace behaviour (Launcher3 android-4.4.4_r1, which GoogleHome builds on): items move out
   of the way (CellLayout reorder) and widgets resize. DynamicGrid gives the Nexus 5 a 4 x 4 workspace. */
(() => {
  'use strict';
  const COLS = 4, ROWS = 4;
  // Workspace.REORDER_TIMEOUT (350 ms in Launcher3, 250 in Launcher2), CellLayout.REORDER_ANIMATION_DURATION,
  // AppWidgetResizeFrame.RESIZE_THRESHOLD, and Workspace's folder-creation radius (0.55 of the icon size).
  const REORDER_TIMEOUT = 350, REORDER_DURATION = 150, RESIZE_THRESHOLD = .66, FOLDER_RADIUS = .55;
  const overlaps = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const inside = rect => rect.x >= 0 && rect.y >= 0 && rect.x + rect.w <= COLS && rect.y + rect.h <= ROWS;
  // One page as rectangles: shortcuts/folders are 1 x 1, widgets keep their spans.
  function items(page, widgets, spanOf) {
    const list = [];
    page.forEach((id, slot) => { if (id) list.push({key: `s${slot}`, kind: 'shortcut', id, x: slot % COLS, y: Math.floor(slot / COLS), w: 1, h: 1}); });
    widgets.forEach(widget => { const span = spanOf(widget); list.push({key: `w${widget.id}`, kind: 'widget', id: widget.id, x: widget.x, y: widget.y, w: span.width, h: span.height}); });
    return list;
  }
  /* A simplified CellLayout.findReorderSolution: reserve the drop rectangle, then move each overlapped item to the
     nearest free area, preferring the side the drag came from. Returns null when no arrangement fits. */
  function solve(list, moving, direction = [0, 0]) {
    const target = {x: moving.x, y: moving.y, w: moving.w, h: moving.h};
    if (!inside(target)) return null;
    const others = list.filter(item => item.key !== moving.key);
    const displaced = others.filter(item => overlaps(item, target));
    if (!displaced.length) return {moves: {}};
    const placed = others.filter(item => !displaced.includes(item)).map(item => ({...item}));
    placed.push(target);
    const moves = {};
    displaced.sort((a, b) => (b.w * b.h) - (a.w * a.h) || Math.hypot(a.x - target.x, a.y - target.y) - Math.hypot(b.x - target.x, b.y - target.y));
    for (const item of displaced) {
      let best = null, score = Infinity;
      for (let y = 0; y <= ROWS - item.h; y++) for (let x = 0; x <= COLS - item.w; x++) {
        const rect = {x, y, w: item.w, h: item.h};
        if (placed.some(other => overlaps(rect, other))) continue;
        const dx = x - item.x, dy = y - item.y;
        // Distance, with a small bonus for moving away from the incoming item (Launcher pushes in the drag direction).
        const s = Math.hypot(dx, dy) - .25 * (dx * -direction[0] + dy * -direction[1]) + .001 * (y * COLS + x);
        if (s < score) { score = s; best = rect; }
      }
      if (!best) return null;
      placed.push(best); moves[item.key] = {x: best.x, y: best.y};
    }
    return {moves};
  }
  // Apply a solution to the saved page: shortcut slots move, widget origins change.
  function apply(page, widgets, moves) {
    const next = page.slice(), moved = [];
    for (const [key, to] of Object.entries(moves)) {
      if (key[0] === 's') { const slot = Number(key.slice(1)); moved.push([page[slot], to]); next[slot] = null; }
      else { const widget = widgets.find(item => `w${item.id}` === key); if (widget) { widget.x = to.x; widget.y = to.y; } }
    }
    for (const [id, to] of moved) next[to.y * COLS + to.x] = id;
    return next;
  }
  // AppWidgetResizeFrame: a handle moves the span edge once the drag passes 66% of a cell.
  function resizeSpan(span, delta, cell, min, max) {
    const steps = delta / cell, change = Math.abs(steps - Math.trunc(steps)) > RESIZE_THRESHOLD ? Math.trunc(steps) + Math.sign(steps) : Math.trunc(steps);
    return Math.max(min, Math.min(max, span + change));
  }
  // Workspace.willCreateUserFolder: within 0.55 icon sizes of the icon centre, a drop makes a folder instead.
  const folderZone = (pointer, centre, icon) => Math.hypot(pointer.x - centre.x, pointer.y - centre.y) < FOLDER_RADIUS * icon;
  window.JBLauncher = {COLS, ROWS, REORDER_TIMEOUT, REORDER_DURATION, RESIZE_THRESHOLD, FOLDER_RADIUS, overlaps, items, solve, apply, resizeSpan, folderZone};
})();
/* The Google Now Launcher (Launcher3 of KTU84P) in the 4.4.4 shell (docs/plans/engine-migration.md): the home
   screen with its pages, dock, search bar, shortcuts, folders and widgets, the overview, the all apps / widgets drawer,
   the photo frame's setup and the clings, their taps and Back, moved out of simulator.js. Dragging, the page swipes
   and the long presses stay with the shell's pointer handling. */
(() => {
  'use strict';
  function scope(c) {
    const {addWidget, apps, cancelPhotoWidget, clingLayerRoot, data, deviceDate, digitalClockWidget, drawerAppPages, drawerPageCount, drawerRange, folderName, home, i18n, launcherIcon, musicActive, navigateBrowser, openApp, overlayRoot, pageMarker, positionFolder, render, renderOverlay, safe, save, saveMusic, setHomePage, syncClings, toast, tracks, ui, viewport, widgetArt, widgetSize, widgetTypes} = c;
    function renderHome() {
      const pages = data.homePages.length;
      const nowPane = `<div class="gel-now-layer" ${ui.page === -1 ? '' : 'inert aria-hidden="true"'}>${GELNow.render({data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), ui})}</div>`;
      return `<div class="home-view kk-home gel-home${ui.overview ? ' kk-overview' : ''}${ui.page === -1 ? ' gel-now-open' : ''}" style="--gnow:${ui.page === -1 ? 1 : 0}">${nowPane}<div class="home-search"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="kk-qsb-logo" src="assets/gel-ic_google_small_light.png" alt="Google"><span class="gel-hint">${safe(i18n.t('Say “Ok Google”'))}</span></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice search'))}"><img class="search-microphone" src="assets/gel-ic_mic_light.png" alt=""></button></div><div class="home-content"><div class="home-pages" style="transform:translateX(${-ui.page * 100}%)">${data.homePages.map((page, index) => `<div class="home-grid" data-home-page="${index}" data-action="kk-overview-page" data-id="${index}" style="--rel:${index - ui.page}" ${index !== ui.page && !ui.overview ? 'inert' : ''}>${page.map((id, slot) => `<div class="home-slot" data-home-slot="${slot}" style="grid-column:${slot % 4 + 1};grid-row:${Math.floor(slot / 4) + 1}">${id ? launcherIcon(id) : ''}</div>`).join('')}${(data.homeWidgets[index] || []).map(homeWidget).join('')}</div>`).join('')}</div></div><div class="page-indicators"><button class="gel-now-marker ${ui.page === -1 ? 'active' : ''}" data-action="page" data-id="-1" aria-label="Google Now">${pageMarker(ui.page === -1)}</button>${Array.from({ length: pages }, (_, i) => `<button class="${i === ui.page ? 'active' : ''}" data-action="page" data-id="${i}" aria-label="${safe(i18n.t('Home screen'))} ${i + 1}">${pageMarker(i === ui.page, ui.extraScreen && i === pages - 1)}</button>`).join('')}</div><div class="dock">${data.dock.map((id, slot) => `<div class="dock-slot" data-dock-slot="${slot}">${id ? launcherIcon(id) : ''}</div>`).join('')}</div><div class="drop-target-bar"><div class="drop-target" data-drop-remove="true"><img src="assets/l3-ic_launcher_clear_normal_holo.png" alt=""><img class="drop-target-active" src="assets/l3-ic_launcher_clear_active_holo.png" alt=""><span>${safe(i18n.t('Remove'))}</span></div><div class="drop-target info-drop-target" data-drop-info="true"><img src="assets/l3-ic_launcher_info_normal_holo.png" alt=""><img class="drop-target-active" src="assets/l3-ic_launcher_info_active_holo.png" alt=""><span>${safe(i18n.t('App info'))}</span></div></div><div class="kk-overview-panel" ${ui.overview ? '' : 'inert'}><button data-action="open-wallpapers" style="--pressed:url('assets/l3-ic_wallpaper_pressed.png')"><img src="assets/l3-ic_wallpaper.png" alt="">${safe(i18n.t('Wallpapers'))}</button><button data-action="kk-overview-widgets" style="--pressed:url('assets/l3-ic_widget_pressed.png')"><img src="assets/l3-ic_widget.png" alt="">${safe(i18n.t('Widgets'))}</button><button data-action="gel-overview-settings" style="--pressed:url('assets/l3-ic_setting_pressed.png')"><img src="assets/l3-ic_setting.png" alt="">${safe(i18n.t('Settings'))}</button></div></div>`;
    }
    function renderDrawer() {
      const appPages = drawerAppPages(), pages = drawerPageCount();
      const [first, last] = drawerRange();
      const current = Math.max(first, Math.min(ui.drawerPage, last));
      const isApps = current < appPages;
      ui.drawerTab = isApps ? 'apps' : 'widgets';
      const sortedApps = [...apps].sort((a,b) => i18n.t(a[1]).localeCompare(i18n.t(b[1]), i18n.locale()));
      const widgetPage = current - appPages;
      const items = isApps ? sortedApps.slice(current * 20, current * 20 + 20).map(app => launcherIcon(app[0])).join('') : widgetTypes.slice(widgetPage * 4, widgetPage * 4 + 4).map(widget => `<button class="drawer-widget" data-action="add-widget" data-widget-type="${widget.type}" aria-label="${safe(widget.name)}"><span class="drawer-widget-title">${safe(widget.name)} <small>${widget.width} × ${widget.height}</small></span><span class="drawer-widget-preview widget-${widget.type}">${widgetArt(widget.type)}</span></button>`).join('');
      return `<div class="drawer-view kk-drawer"><div class="drawer-page ${isApps ? 'drawer-apps' : 'drawer-widgets'}">${items}</div><div class="drawer-indicators">${Array.from({length:pages},(_,i)=>i < first || i > last ? '' : `<button class="${i===current?'active':''}" data-action="drawer-page" data-id="${i}" aria-label="${safe(i18n.t('Page'))} ${i+1}">${pageMarker(i === current)}</button>`).join('')}</div></div>`;
    }
    function widgetBody(widget) {
      const t = key => i18n.t(key);
      if (widget.type === 'calendar') return ICSWidgets.calendar(data, t, i18n.locale(), deviceDate(), !!data.settings.hour24);
      if (widget.type === 'music') return ICSWidgets.music(ui.music, tracks, musicActive(), t);
      if (widget.type === 'photo') return ICSWidgets.photo(data, widget, ui.photoStacks?.[widget.id] || 0, t);
      if (widget.type === 'digitalclock') return digitalClockWidget();
      return null;
    }
    function configurePhotoWidget(options) {
      const widget = pendingPhotoWidget();
      if (widget) Object.assign(widget, options);
      ui.photoWidgetSetup = null; ui.overlay = ''; save(); render(); toast('Widget added');
    }

    function renderFolder() {
      const folder=ICSLauncherFolders.folder(data,ui.folderId);if(!folder){ui.overlay='';return '';}
      const {columns,rows}=ICSLauncherFolders.dimensions(folder.items.length);
      return `<div class="launcher-folder-scrim" data-action="close-overlay"></div><div class="launcher-folder" role="dialog" aria-label="${safe(i18n.t('Folder'))}: ${safe(folderName(ui.folderId))}" style="width:calc(${((columns*74+24)/.906).toFixed(4)} * var(--dp));--folder-columns:${columns}"><div class="launcher-folder-grid">${Array.from({length:columns*rows},(_,slot)=>`<div class="launcher-folder-cell" data-folder-slot="${slot}">${folder.items[slot]?launcherIcon(folder.items[slot]):''}</div>`).join('')}</div><form class="launcher-folder-name" data-form="folder-name"><input name="name" aria-label="Folder name" placeholder="Unnamed folder" maxlength="40" autocomplete="off" value="${safe(folder.name)}"></form></div>`;
    }
    const homeWidget = widget => {
      const spec = widgetSize(widget);
      const body = widgetBody(widget) ?? (widget.type === 'power' ? `<div class="power-widget">${[['wifi','Wi-Fi','wifi'],['bluetooth','Bluetooth','bluetooth'],['gps','GPS satellites','gps'],['autoSync','Auto-sync','sync'],['brightness','Brightness','brightness']].map(([key,title,asset]) => `<button class="power-cell ${data.settings[key] ? 'enabled' : ''}" data-action="power-toggle" data-id="${key}" aria-label="${title}" aria-pressed="${!!data.settings[key]}"><img src="assets/power-${asset}-${key === 'brightness' ? data.settings.brightness > 70 ? 'full' : data.settings.brightness > 25 ? 'half' : 'off' : data.settings[key] ? 'on' : 'off'}.png" alt=""><i></i></button>`).join('')}</div>` : `<button data-action="open-app" data-app="${spec.app || 'gallery'}" aria-label="${safe(spec.name || 'Widget')}">${widgetArt(widget.type)}</button>`);
      const frame = ui.resizeWidget === widget.id && spec.resize ? `<div class="jb-resize-frame" data-resize-frame>${['left', 'top', 'right', 'bottom'].map(edge => `<button class="jb-resize-handle jb-resize-${edge}" data-resize-edge="${edge}" aria-label="${safe(i18n.t('Resize'))}"><img src="assets/l3-widget_resize_handle_${edge}.png" alt=""></button>`).join('')}</div>` : '';
      return `<div class="home-widget widget-${widget.type}${frame ? ' resizing' : ''}" data-widget-id="${safe(widget.id)}" style="grid-column:${widget.x + 1}/span ${spec.width};grid-row:${widget.y + 1}/span ${spec.height}">${body}${frame}</div>`;
    };
    const pendingPhotoWidget = () => ui.photoWidgetSetup && data.homeWidgets[ui.photoWidgetSetup.page]?.find(widget => widget.id === ui.photoWidgetSetup.id);
    return {
      render() {
        return ui.view === 'drawer' ? renderDrawer() : renderHome();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'drawer': ui.view = 'drawer'; ui.sub = ''; ui.overlay = ''; ui.overview = false; ui.drawerWidgets = false; if (ui.drawerPage >= drawerAppPages()) ui.drawerPage = 0; render(); break;
          case 'cling-dismiss': if (data.clings) { data.clings[id] = true; save(); } LauncherClings.dismiss(clingLayerRoot().querySelector(`[data-cling="${id}"]`), () => syncClings()); break;
          case 'folder-open': ui.folderId=button.dataset.folderId;ui.overlay='folder';renderOverlay();break;
          // Overview mode: Widgets opens all apps on the first widget page; a tap on a page returns to it.
          case 'kk-overview-widgets': ui.overview = false; ui.view = 'drawer'; ui.drawerWidgets = true; ui.drawerPage = drawerAppPages(); render(); break;
          case 'gel-overview-settings': openApp('google-search'); ui.sub = 'settings'; ui.ksPage = ''; render(); break;
          case 'kk-overview-page': if (ui.overview) { ui.overview = false; ui.page = Number(id); render(); } break;
          case 'drawer-page': ui.drawerPage = Number(id); render(); break;
          case 'add-widget': { const added = addWidget(button.dataset.widgetType); if (!added) { toast('This home screen is full'); break; } const setup = ui.photoWidgetSetup; ui.photoWidgetSetup = null; home(false); ui.photoWidgetSetup = setup; if (added.type === 'photo') { ui.overlay = 'widget-photo-type'; renderOverlay(); } else toast('Widget added'); break; }
          case 'widget-music-open': openApp('play-music'); break;
          case 'widget-music-next': ICSMusic.step(ui.music, 1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
          case 'widget-music-prev': ICSMusic.step(ui.music, -1); ui.musicActive = true; ui.musicTrack = ui.music.track; saveMusic(); render(); break;
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
          case 'widget-music-play': ui.musicActive=true;ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
          case 'open-contact': { const person = data.contacts.find(p => p.id === Number(id)); openApp('people'); if (person) { ui.selectedContact = person.id; ui.sub = 'detail'; render(); } break; }
          case 'open-web-shortcut': { const item = (data.webShortcuts || []).find(w => String(w.id) === id); if (!item) break; openApp('chrome'); navigateBrowser(item.url); break; }
          case 'music-play': ui.music.playing=!ui.music.playing;if(ui.music.playing&&ui.music.position>=tracks[ui.music.track].duration)ui.music.position=0;saveMusic();render();break;
          case 'music-prev': case 'music-next': ICSMusic.step(ui.music,action==='music-prev'?-1:1);saveMusic();render();break;
          case 'music-shuffle': ui.music.shuffle=!ui.music.shuffle;saveMusic();render();break;
          case 'music-repeat': ui.music.repeat={off:'all',all:'one',one:'off'}[ui.music.repeat];saveMusic();render();break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        if(form.dataset.form==='folder-name'){event.target.querySelector('input')?.blur();render();return true;}
        return false;
      },
      input(event) {
        if(event.target.closest('[data-form="folder-name"]')){const folder=ICSLauncherFolders.folder(data,ui.folderId);if(folder){folder.name=event.target.value.slice(0,40);save();for(const button of viewport.querySelectorAll('[data-folder-id]'))if(button.dataset.folderId===ui.folderId){button.setAttribute('aria-label',folderName(ui.folderId));button.lastElementChild.textContent=folderName(ui.folderId);}}return true;}
        if(event.target.dataset.field==='music-position'){ui.music.position=Number(event.target.value);saveMusic();const elapsed=viewport.querySelector('.music-elapsed');if(elapsed)elapsed.textContent=ICSMusic.time(ui.music.position);}
        return false;
      },
      overlay() {
        if (ui.overlay.startsWith('widget-photo')) {
          overlayRoot.innerHTML = ICSWidgets.photoOverlay(data, ui, key => i18n.t(key));
        } else if (ui.overlay === 'folder') {
          overlayRoot.innerHTML = renderFolder();
          positionFolder();
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'drawer' && ui.drawerWidgets) { ui.drawerWidgets = false; ui.drawerPage = 0; home(false); ui.overview = true; render(); return true; }
        if (ui.view === 'home' && ui.overview) { ui.overview = false; render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back()
  };
  if (window.KK) for (const id of ['home', 'drawer']) KK.register(id, spec);
})();
