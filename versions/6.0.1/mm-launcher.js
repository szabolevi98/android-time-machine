/* Android 6.0.1 home screen: the Google Now Launcher (Launcher3 and GEL in Velvet.apk 5.3.27, the layout of
   BullheadLayout.apk), the screen 'home'.
   - InvariantDeviceProfile: the 5X's smallest / largest app sizes (387.43 x 659.43 dp without the system bars) are
     nearest the "Large Phone" profile: a 5 x 5 workspace, 5 hotseat icons with the all apps button at rank 2, 4 x 4
     folders; the sizes come from the three nearest profiles weighted 100000 / distance^5: icons 63.9 dp, labels 14.38
     sp, hotseat icons 56 dp. DeviceProfile in pixels at 420 dpi (getDimensionPixelSize rounds): edge margin 6 dp = 16 px,
     the search bar 32 px from the top and 56 dp = 147 px high, the workspace padded 11 px at the sides (32 px less the 21
     px default widget padding), 179 px at the top and hotseat 232 px (icon + 4 edges) + page indicator 53 px at the
     bottom; a cell is the icon with the label's font height and the 11 px drawable padding (230 px), the workspace's
     5 x 5 cells share the rest (211.6 x 253.4 px) and centre that content (ShortcutAndWidgetContainer: 11 px down).
   - The labels: Icon style, white, one line, BubbleTextView's two shadows (4 px at 2 px down #dd000000, 1.75 px #cc000000).
   - The search bar: the image's search_widget.xml (search_bg, the Google logo ic_searchbox_google 16 dp in, the 56 dp
     mic button ic_mic_none in gray_700), in the bounds DeviceProfile gives it; it opens Google (Velvet).
   - The hotseat: its CellLayout 2 edges in from each side, the icons centred without labels; the all apps button is
     ic_allapps (pressed: ic_allapps_pressed) at allAppsButtonVisualSize, 17 % smaller than the hotseat icon.
   - Folders: FolderIcon draws portal_ring_inner (folderIconSize, an edge larger all round, an edge higher) and the first
     three items stacked in perspective (PERSPECTIVE_SCALE_FACTOR 0.35, SHIFT 0.18, the back ones darkened up to 80 / 255);
     open, user_folder.xml: quantum_panel (#f5f5f5, 2 dp corners, 4 dp inset), the grid FolderPagedView sizes (taller
     first, at most 4 x 4) of folder cells (a cell + 3 edges wide, + 1 edge high), the name in a 14 sp condensed field
     below; it is centred on its icon and kept inside the workspace's page area.
   - Pages: GEL's Google Now page to the left of the home page (custom content) and the workspace pages; the wallpaper
     offset (Workspace.WallpaperOffsetInterpolator) is 0 with one workspace page, the default wallpaper's left edge. */
(() => {
  'use strict';
  const T = () => MM.text('launcher');
  const PX = 2.625;
  const dp = px => `calc(${(px / PX).toFixed(3)} * var(--dp))`;
  // DeviceProfile, portrait, in px.
  const G = (() => {
    const edge = 16, iconSize = 168, textSize = 38, drawablePadding = 11, fontHeight = 51;
    const W = 1080, H = 1731, searchTop = edge * 2, searchBottom = searchTop + 147;
    const cellContent = fontHeight + iconSize + drawablePadding, hotseatH = iconSize + edge * 4, indicatorH = 53;
    const ws = {left: 11, top: searchBottom, right: W - 11, bottom: H - hotseatH - indicatorH};
    return {edge, iconSize, textSize, drawablePadding, fontHeight, W, H, searchTop, searchBottom, cellContent, hotseatH, indicatorH, ws,
      cellW: (ws.right - ws.left) / 5, cellH: (ws.bottom - ws.top) / 5, hsCellW: (W - edge * 4) / 5, hotseatIcon: 147, allAppsButton: Math.trunc((1 - .17) * 147),
      folderCellW: iconSize + edge * 3, folderCellH: cellContent + edge, folderIcon: iconSize + edge * 2};
  })();
  MM.launcherGrid = G;
  // DeviceProfile follows the display it runs on: on a phone whose screen is taller or shorter than the 5X's (the
  // mobile layout fills the browser), the workspace between the search bar and the hotseat takes the height there is,
  // its five rows share it and each cell centres its content (ShortcutAndWidgetContainer).
  function fit(c) {
    const vp = c.el.viewport, k = vp.clientWidth / 411.4286;
    if (!k || !vp.clientHeight) return;
    const H = Math.max(1200, Math.round(vp.clientHeight / k * PX));
    G.H = H; G.ws.bottom = H - G.hotseatH - G.indicatorH; G.cellH = (G.ws.bottom - G.ws.top) / 5;
    G.cellPad = Math.max(0, (G.cellH - G.cellContent) / 2);
  }
  G.cellPad = (G.cellH - G.cellContent) / 2;

  // The saved home: pages of {type, app | title + items, x, y}, the hotseat's five ranks (2 is the all apps button).
  function fromLayout() {
    const pages = [[]], hotseat = [null, null, 'allapps', null, null];
    for (const it of MM.defaultWorkspace || []) {
      if (it.type === 'app' && it.container === 'hotseat') hotseat[it.screen] = it.app;
      else if (it.type === 'app') (pages[it.screen] ||= []).push({type: 'app', app: it.app, x: it.x, y: it.y});
      else (pages[it.screen] ||= []).push({type: 'folder', title: it.title, items: it.items.slice(), x: it.x, y: it.y});
    }
    return {pages, hotseat};
  }
  MM.defaults.home = null;
  const home = c => c.data.home || (c.data.home = fromLayout());

  const label = (c, id) => { const a = MM.appsData[id]; return a ? (a.label[c.lang] || a.label.en) : id; };
  const folderTitle = (c, f) => typeof f.title === 'string' ? f.title : (f.title?.[c.lang] || f.title?.en || '');
  MM.appLabel = label;
  // Apps turned off in Settings (InstalledAppDetails' Disable): the launcher and the drawer leave them out.
  MM.appDisabled = (c, id) => (c.data.settings.disabledApps || []).includes(id);

  // An item's view; src names where it lives for the drag code ("ws:<page>:<index>", "hs:<rank>", "fd:<index>").
  function icon(c, item, where, src = '') {
    if (item.type === 'folder') return folderIcon(c, item, where, src);
    // A shortcut an app made (CREATE_SHORTCUT, mm-shortcuts.js): its own label and icon; a contact's is the contact's
    // photo tile with the call or message badge.
    if (item.type === 'shortcut') return `<button type="button" class="mmh-icon mmh-sc ${where}" data-action="mmh-sc" data-src="${src}">${scIcon(c, item)}<span>${c.safe(item.label)}</span></button>`;
    // A disabled package's shortcuts go (Launcher3's PackageUpdatedTask on a disabled app).
    if (MM.appDisabled(c, item.app)) return '';
    const a = MM.appsData[item.app];
    return `<button type="button" class="mmh-icon ${where}" data-action="mmh-app" data-app="${item.app}" data-src="${src}"><img src="${a?.icon}" alt=""><span>${c.safe(label(c, item.app))}</span></button>`;
  }
  function scIcon(c, item) {
    const p = item.person && MM.people?.byId(c, item.person);
    if (p) return `<i class="mmh-scperson">${MM.people.tile(c, p, 'mmh-sctile')}${item.badge && item.badge !== 'contact' ? `<img class="mmh-scbadge" src="assets/ct-ic_${item.badge === 'dial' ? 'phone' : 'message'}_24dp.png" alt="">` : ''}</i>`;
    return `<img src="${item.icon || ''}" alt="">`;
  }
  // FolderIcon.computePreviewDrawingParams / computePreviewItemDrawingParams, for its first three items.
  function folderPreview(f, cellW = G.cellW, pad = G.cellPad) {
    const previewSize = G.folderIcon, padding = 11, avail = previewSize - 2 * padding;
    const adjusted = Math.trunc(avail / 2 * 1.8), unscaledH = Math.trunc(G.iconSize * 1.18);
    const baseScale = adjusted / unscaledH, baseSize = Math.trunc(G.iconSize * baseScale), shift = baseSize * .18;
    const items = f.items.slice(0, 3);
    return items.map((app, i) => {
      const idx = 2 - i, r = idx / 2, scale = 1 - .35 * (1 - r), size = scale * baseSize;
      // dispatchDraw translates by mPreviewOffsetY (preview padding + folderBackgroundOffset); transY adds the icon's
      // top padding (11 px in a workspace cell); transX centres the item in the cell.
      const y = (padding - G.edge) + avail - ((1 - r) * shift + size + (1 - scale) * baseSize) + pad;
      const x = (cellW - size) / 2;
      return {app, x, y, size, overlay: Math.trunc((1 - r) * 80) / 255};
    }).reverse();
  }
  function folderIcon(c, f, where, src = '') {
    const items = folderPreview(f, where === 'hs' ? G.hsCellW : G.cellW, where === 'hs' ? 11 : G.cellPad).map(p => `<span class="mmh-fi" style="left:${dp(p.x)};top:${dp(p.y)};width:${dp(p.size)};height:${dp(p.size)};--shade:${p.overlay.toFixed(3)}"><img src="${MM.appsData[p.app]?.icon}" alt=""></span>`).join('');
    return `<button type="button" class="mmh-icon mmh-folder ${where}" data-action="mmh-folder" data-src="${src}" aria-label="${c.safe(T().fmt('folder_name_format', null, folderTitle(c, f)))}"><i class="mmh-ring"></i>${items}<span>${c.safe(folderTitle(c, f))}</span></button>`;
  }

  function pageHtml(c, items, p) {
    return `<div class="mmh-page" data-page="${p}" style="--i:${p}"><i class="mmh-panel"></i>${items.map((it, i) => it.type === 'widget'
      ? `<div class="mmh-cell mmh-wcell" style="left:${dp(G.cellW * it.x)};top:${dp(G.cellH * it.y)};width:${dp(G.cellW * it.spanX)};height:${dp(G.cellH * it.spanY)}" data-index="${i}"><div class="mmh-widget" data-src="ws:${p}:${i}" data-w="${it.w}">${MM.widgets.home(c, it)}</div></div>`
      : `<div class="mmh-cell" style="left:${dp(G.cellW * it.x)};top:${dp(G.cellH * it.y)}" data-index="${i}">${icon(c, it, 'ws', `ws:${p}:${i}`)}</div>`).join('')}</div>`;
  }

  // CellLayout's occupied cells: an item covers its span (1 x 1 for icons and folders).
  const covers = (it, x, y) => x >= it.x && x < it.x + (it.spanX || 1) && y >= it.y && y < it.y + (it.spanY || 1);
  const free = (list, x, y, sx, sy, skip) => x >= 0 && y >= 0 && x + sx <= 5 && y + sy <= 5
    && !list.some(it => it !== skip && it.x < x + sx && x < it.x + (it.spanX || 1) && it.y < y + sy && y < it.y + (it.spanY || 1));
  // CellLayout.findNearestVacantArea: the free area of the size whose centre is nearest to the drop point.
  function nearest(list, fx, fy, sx, sy, skip) {
    let best = null, dist = Infinity;
    for (let y = 0; y + sy <= 5; y++) for (let x = 0; x + sx <= 5; x++) {
      if (!free(list, x, y, sx, sy, skip)) continue;
      const d = Math.hypot(x + sx / 2 - fx, y + sy / 2 - fy);
      if (d < dist) { dist = d; best = {x, y}; }
    }
    return best;
  }

  // An item and where it is, from a drag source name.
  function locate(h, src) {
    const [kind, a, b] = src.split(':');
    if (kind === 'ws') { const list = h.pages[+a - 1]; return {kind, list, index: +b, item: list?.[+b]}; }
    if (kind === 'hs') { const v = h.hotseat[+a]; return {kind, rank: +a, item: typeof v === 'string' ? {type: 'app', app: v} : v}; }
    return null;
  }

  function render(c) {
    fit(c);
    const h = home(c), st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    const t = T();
    const hotseat = h.hotseat.map((v, rank) => `<div class="mmh-hs" data-rank="${rank}" style="left:${dp(G.edge * 2 + rank * G.hsCellW)}">${v === 'allapps'
      ? `<button type="button" class="mmh-allapps" data-action="mmh-allapps" aria-label="${c.safe(t.t('all_apps_button_label'))}"></button>`
      : v ? icon(c, typeof v === 'string' ? {type: 'app', app: v} : v, 'hs', `hs:${rank}`) : ''}</div>`).join('');
    // Workspace.addExtraEmptyScreenOnDrag: an empty page after the last one, reachable only while dragging.
    const pages = h.pages.map((items, i) => pageHtml(c, items, i + 1)).join('') + `<div class="mmh-page mmh-extra" data-page="${h.pages.length + 1}" style="--i:${h.pages.length + 1}"><i class="mmh-panel"></i></div>`;
    const dots = [0, ...h.pages.map((_, i) => i + 1)].map(i => `<i class="${i === st.page ? 'on' : ''}"></i>`).join('');
    // search_drop_target_bar.xml: Remove and App info (Uninstall only for an app the user installed: none here).
    const targets = `<div class="mmh-targets"><span data-target="remove"><img src="assets/gel-ic_remove_launcher.png" alt="">${c.safe(t.t('delete_target_label'))}</span><span data-target="info"><img src="assets/gel-ic_info_launcher.png" alt="">${c.safe(t.t('info_target_label'))}</span></div>`;
    const overview = `<div class="mmh-overview">${[['wallpaper', 'wallpaper_button_text'], ['widget', 'widget_button_text'], ['setting', 'settings_button_text']].map(([k, s]) => `<button type="button" class="mmh-ov-${k}" data-action="mmh-ov" data-ov="${k}"><i></i><span>${c.safe(t.t(s))}</span></button>`).join('')}</div>`;
    const cling = !c.data.homeClingSeen ? `<div class="mmh-cling"><i></i><div class="mmh-cling-box np-gel-cling_bg"><div class="mmh-cling-1">${c.safe(t.t('first_run_cling_title'))}</div><div class="mmh-cling-2">${c.safe(t.t('workspace_cling_longpress_title'))}</div><div class="mmh-cling-3">${c.safe(t.t('workspace_cling_longpress_description'))}</div><button type="button" data-action="mmh-cling">${c.safe(t.t('workspace_cling_longpress_dismiss'))}</button></div><i class="mmh-cling-2x"></i></div>` : '';
    return `<div class="mmh${st.page === 0 ? ' now' : ''}${st.overview ? ' overview' : ''}" style="--page:${st.page};--cellh:${dp(G.cellH)};--cellpad:${dp(G.cellPad)};--wsh:${dp(G.ws.bottom - G.ws.top)}">
      <div class="mmh-strip"><div class="mmh-nowpage">${MM.google ? MM.google.nowPage(c) : c.missing('now')}</div>${pages}</div>
      <div class="mmh-qsb np-gel-search_bg"><button type="button" class="mmh-qsb-plate" data-action="mmh-search" aria-label="${c.safe(t.t('accessibility_google_search_button'))}"><img src="assets/gel-ic_searchbox_google.png" alt="Google"></button><button type="button" class="mmh-qsb-mic" data-action="mmh-voice" aria-label="${c.safe(t.t('accessibility_voice_button'))}"><i></i></button></div>
      ${targets}<div class="mmh-dots">${dots}</div>
      <div class="mmh-hotseat">${hotseat}</div>${overview}
      ${st.folder ? folderHtml(c, st.folder) : ''}${cling}</div>`;
  }

  // Folder / FolderPagedView.
  function folderGrid(n) {
    let x = 0, y = 0;
    for (;;) {
      const ox = x, oy = y;
      if (x * y < n) { if ((x <= y || y === 4) && x < 4) x++; else if (y < 4) y++; if (y === 0) y++; }
      else if ((y - 1) * x >= n && y >= x) y = Math.max(0, y - 1);
      else if ((x - 1) * y >= n) x = Math.max(0, x - 1);
      if (x === ox && y === oy) return [x, y];
    }
  }
  function folderOf(c, ref) { const loc = locate(home(c), ref); return loc?.item?.type === 'folder' ? loc : null; }
  function folderHtml(c, ref) {
    const loc = folderOf(c, ref);
    if (!loc) return '';
    const f = loc.item;
    const [cols, rows] = folderGrid(f.items.length), inset = 11, padX = 11, padTop = 21, footer = 32 + Math.ceil(37 * 1.172);
    const w = cols * G.folderCellW + padX * 2 + inset * 2, hgt = rows * G.folderCellH + padTop + footer + inset * 2;
    const cx = loc.kind === 'hs' ? G.edge * 2 + G.hsCellW * (loc.rank + .5) : G.ws.left + G.cellW * (f.x + .5);
    const cy = loc.kind === 'hs' ? G.H - G.hotseatH / 2 : G.ws.top + G.cellH * f.y + G.cellPad + G.iconSize / 2;
    const left = Math.min(Math.max(G.ws.left, cx - w / 2), G.ws.right - w), top = Math.min(Math.max(G.ws.top, cy - hgt / 2), G.ws.bottom - hgt);
    const cells = f.items.map((id, i) => `<div class="mmh-fcell" style="left:${dp(inset + padX + (i % cols) * G.folderCellW)};top:${dp(inset + padTop + Math.floor(i / cols) * G.folderCellH)}">${icon(c, {type: 'app', app: id}, 'fd', `fd:${i}`)}</div>`).join('');
    const title = folderTitle(c, f);
    return `<div class="mmh-fscrim" data-action="mmh-close-folder"></div><div class="mmh-fpanel" style="left:${dp(left)};top:${dp(top)};width:${dp(w)};height:${dp(hgt)};--ox:${dp(cx - left)};--oy:${dp(cy - top)}">
      <div class="mmh-fgrid">${cells}</div><input class="mmh-fname" style="top:${dp(inset + padTop + rows * G.folderCellH)}" value="${c.safe(title)}" placeholder="${c.safe(T().t('folder_hint_text'))}" spellcheck="false"></div>`;
  }

  // Removing an item from a folder: one left replaces the folder (Folder.replaceFolderWithFinalItem), none removes it.
  function tidyFolder(h, loc) {
    const f = loc.item;
    if (f.items.length > 1) return;
    const rest = f.items[0];
    if (loc.kind === 'ws') { if (rest) loc.list[loc.index] = {type: 'app', app: rest, x: f.x, y: f.y}; else loc.list.splice(loc.index, 1); }
    else h.hotseat[loc.rank] = rest || null;
  }

  // Drag and drop (DragController, Workspace / Hotseat as drop targets, DeleteDropTarget, InfoDropTarget).
  function startDrag(c, root, d) {
    const st = c.ui.home, el = root.querySelector('.mmh');
    st.dragging = d;
    el.classList.add('dragging');
    if (st.folder && d.from === 'fd') { st.folder = null; el.querySelector('.mmh-fpanel')?.remove(); el.querySelector('.mmh-fscrim')?.remove(); }
    const view = document.createElement('div');
    view.className = 'mmh-dragview';
    if (d.item.type === 'widget') {
      // A widget drags as its view on the home screen, or from the list as its preview at the size it will take.
      const wi = MM.widgets.info(d.item.w), w = G.cellW * wi.spanX, h = G.cellH * wi.spanY;
      view.classList.add('widget');
      Object.assign(view.style, {width: dp(w), height: dp(h), margin: `calc(${(-h / 2 / PX).toFixed(3)} * var(--dp)) 0 0 calc(${(-w / 2 / PX).toFixed(3)} * var(--dp))`});
      view.innerHTML = d.from === 'ws' ? MM.widgets.home(c, d.item) : `<div class="mmh-wprev">${MM.widgets.preview(c, wi)}</div>`;
    } else if (d.item.type === 'shortcut') view.innerHTML = scIcon(c, d.item);
    else view.innerHTML = `<img src="${MM.appsData[d.item.type === 'folder' ? d.item.items[0] : d.item.app]?.icon}" alt="">`;
    if (d.item.type === 'folder') view.innerHTML = el.querySelector(`[data-src="${d.src}"]`)?.outerHTML || view.innerHTML, view.classList.add('folder');
    el.append(view);
    d.view = view;
    if (d.srcEl) d.srcEl.style.visibility = 'hidden';
    navigator.vibrate?.(20);
  }
  function target(c, root, x, y) {
    const r = root.querySelector('.mmh').getBoundingClientRect(), k = r.width / G.W;
    const px = (x - r.left) / k, py = (y - r.top) / k;
    if (py < G.searchBottom) return {kind: px < G.W / 2 ? 'remove' : 'info'};
    if (py > G.H - G.hotseatH) return {kind: 'hs', rank: Math.max(0, Math.min(4, Math.floor((px - G.edge * 2) / G.hsCellW)))};
    if (py < G.ws.bottom) return {kind: 'ws', x: Math.max(0, Math.min(4, Math.floor((px - G.ws.left) / G.cellW))), y: Math.max(0, Math.min(4, Math.floor((py - G.ws.top) / G.cellH))), fx: (px - G.ws.left) / G.cellW, fy: (py - G.ws.top) / G.cellH};
    return null;
  }
  // DragController.checkScrollState: held within scroll_zone (20 dp) of a side for 500 ms, the workspace turns a page
  // (to the extra empty one after the last).
  function edgeScroll(c, root, x, r) {
    const st = c.ui.home, d = st.dragging, zone = 20 * r.width / (G.W / PX), dir = x - r.left < zone ? -1 : r.right - x < zone ? 1 : 0;
    if (dir === d.edgeDir) return;
    clearTimeout(d.edgeTimer); d.edgeDir = dir;
    if (!dir) return;
    d.edgeTimer = setTimeout(() => {
      const last = home(c).pages.length + 1, page = Math.max(1, Math.min(last, st.page + dir));
      d.edgeDir = 0;
      if (page === st.page || st.dragging !== d) return;
      st.page = page;
      const el = root.querySelector('.mmh');
      el.style.setProperty('--page', page);
      root.querySelectorAll('.mmh-dots i').forEach((dot, i) => dot.classList.toggle('on', i === page));
    }, 500);
  }
  function moveDrag(c, root, x, y) {
    const d = c.ui.home.dragging, r = root.querySelector('.mmh').getBoundingClientRect();
    d.view.style.left = `${x - r.left}px`; d.view.style.top = `${y - r.top}px`;
    edgeScroll(c, root, x, r);
    const t = target(c, root, x, y);
    root.querySelectorAll('.mmh-targets span').forEach(s => s.classList.toggle('hover', !!t && s.dataset.target === t.kind));
    d.view.classList.toggle('remove', t?.kind === 'remove');
  }
  function endDrag(c, root, x, y) {
    const st = c.ui.home, d = st.dragging, h = home(c);
    st.dragging = null;
    // The click that may follow this release is the drag's; a drag begun elsewhere (the widgets list, the drawer) has
    // none, and the next tap must not be eaten.
    setTimeout(() => { st.suppressClick = false; }, 60);
    clearTimeout(d.edgeTimer);
    const t = target(c, root, x, y), page = st.page > 0 ? st.page : 1;
    // A drop on the extra page makes it a real one; Workspace.stripEmptyScreens drops the empty ones afterwards.
    if (page > h.pages.length) h.pages.push([]);
    const strip = () => { const keep = h.pages.filter((p, i) => !i || p.length); if (keep.length !== h.pages.length) { const cur = h.pages[st.page - 1]; h.pages = keep; st.page = Math.max(1, keep.indexOf(cur) + 1 || Math.min(st.page, keep.length)); } };
    const saveRender = () => { strip(); c.save(); c.render(); };
    const app = d.item.type === 'app' ? d.item.app : null;
    // Taking the item out of where it was (a drawer item is a copy and leaves nothing behind).
    const take = () => {
      if (d.from === 'ws') { const loc = locate(h, d.src); loc.list.splice(loc.index, 1); }
      else if (d.from === 'hs') h.hotseat[+d.src.split(':')[1]] = null;
      else if (d.from === 'fd') { const loc = folderOf(c, d.folder); loc.item.items.splice(d.index, 1); tidyFolder(h, loc); }
    };
    const wi = d.item.type === 'widget' ? MM.widgets.info(d.item.w) : null;
    if (t?.kind === 'info' && (app || wi)) { strip(); c.render(); c.open('settings', `app:${app || wi.app}`); return; }
    if (t?.kind === 'remove' && d.from !== 'drawer') { take(); saveRender(); return; }
    const fresh = {...d.item};
    if (wi && t?.kind === 'ws') {
      // A widget (or a shortcut from the widgets list) goes to the nearest free area of its span on this page.
      const list = h.pages[page - 1], self = d.from === 'ws' ? locate(h, d.src).item : null;
      const at = nearest(list, t.fx - wi.spanX / 2 + .5, t.fy - wi.spanY / 2 + .5, wi.spanX, wi.spanY, self);
      if (!at) { strip(); c.render(); c.toast(MM.widgets.outOfSpace(), false); return; }
      // A shortcut's CREATE_SHORTCUT activity or a widget's configure activity first (mm-shortcuts.js); its result
      // lands at the area found here, and Back there places nothing.
      if (d.from !== 'ws' && MM.widgetConfigs?.[wi.id]) {
        strip(); c.render();
        const target = h.pages[page - 1] ? page : h.pages.length + 1, x = at.x, y = at.y;
        MM.widgetConfigs[wi.id](c, res => {
          const hh = home(c); while (hh.pages.length < target) hh.pages.push([]);
          const item = res.type === 'shortcut' ? {...res, x, y} : {type: 'widget', w: wi.id, spanX: wi.spanX, spanY: wi.spanY, x, y, cfg: res};
          if (!free(hh.pages[target - 1], x, y, item.spanX || 1, item.spanY || 1)) { c.toast(MM.widgets.outOfSpace(), false); return; }
          hh.pages[target - 1].push(item); c.save(); if (c.ui.view === 'home') c.render();
        });
        return;
      }
      take();
      h.pages[page - 1].push({type: 'widget', w: wi.id, spanX: wi.spanX, spanY: wi.spanY, x: at.x, y: at.y});
      saveRender(); return;
    }
    if (wi) { strip(); c.render(); return; }
    if (t?.kind === 'ws') {
      const list = h.pages[page - 1];
      let hit = list.findIndex(it => covers(it, t.x, t.y));
      // Over a widget an icon takes the nearest free cell instead.
      if (hit >= 0 && list[hit].type === 'widget') {
        const at = nearest(list, t.fx, t.fy, 1, 1, d.from === 'ws' ? locate(h, d.src).item : null);
        if (!at) { strip(); c.render(); c.toast(MM.widgets.outOfSpace(), false); return; }
        t.x = at.x; t.y = at.y; hit = list.findIndex(it => covers(it, t.x, t.y));
      }
      const self = d.from === 'ws' && d.src === `ws:${page}:${hit}`;
      if (hit < 0 || self) { take(); const l2 = h.pages[page - 1]; l2.push({...fresh, x: t.x, y: t.y}); }
      else if (app && list[hit].type === 'app') { take(); const l2 = h.pages[page - 1], at = l2.findIndex(it => it.x === t.x && it.y === t.y); l2[at] = {type: 'folder', title: '', items: [l2[at].app, app], x: t.x, y: t.y}; }
      else if (app && list[hit].type === 'folder') { take(); const l2 = h.pages[page - 1], at = l2.findIndex(it => it.x === t.x && it.y === t.y); l2[at].items.push(app); }
      else { strip(); c.render(); return; }
      saveRender(); return;
    }
    if (t?.kind === 'hs' && h.hotseat[t.rank] !== 'allapps') {
      const cur = h.hotseat[t.rank], self = d.from === 'hs' && d.src === `hs:${t.rank}`;
      if (!cur || self) { take(); h.hotseat[t.rank] = fresh.type === 'app' ? fresh.app : fresh; }
      else if (app && typeof cur === 'string') { take(); h.hotseat[t.rank] = {type: 'folder', title: '', items: [cur, app]}; }
      else if (app && cur.type === 'folder') { take(); h.hotseat[t.rank].items.push(app); }
      saveRender(); return;
    }
    strip(); c.render();
  }

  function mount(c, root) {
    const el = root.querySelector('.mmh'), strip = root.querySelector('.mmh-strip');
    if (!el) return;
    const st = c.ui.home, h = home(c), last = h.pages.length;
    const name = el.querySelector('.mmh-fname');
    name?.addEventListener('change', () => { const loc = folderOf(c, st.folder); if (loc) { loc.item.title = name.value; c.save(); } });
    name?.addEventListener('keydown', e => { if (e.key === 'Enter') name.blur(); e.stopPropagation(); });
    let press = null;
    const longPress = 500;   // ViewConfiguration's long press timeout
    el.addEventListener('pointerdown', e => {
      if (e.button || st.dragging) return;
      if (e.target.closest('.mmh-qsb,.mmh-overview,.mmh-cling,.mmh-fname,.mmh-allapps')) return;
      const src = e.target.closest('[data-src]');
      press = {x: e.clientX, y: e.clientY, moved: false, w: el.clientWidth, src, timer: 0};
      press.timer = setTimeout(() => {
        if (!press || press.moved) return;
        if (st.folder && !src) return;
        st.suppressClick = true;
        if (src) {
          const s = src.dataset.src;
          let item, from = s.split(':')[0], folder = null, index = 0;
          if (from === 'fd') { folder = st.folder; index = +s.split(':')[1]; item = {type: 'app', app: folderOf(c, folder).item.items[index]}; }
          else item = locate(h, s).item;
          startDrag(c, root, {src: s, from, item, folder, index, srcEl: src});
          moveDrag(c, root, press.x, press.y);
        } else if (st.page > 0 && !st.overview) {
          // Launcher.onLongClick on the workspace: overview mode (and the long-press cling is done).
          c.data.homeClingSeen = true; c.save();
          st.overview = true; c.render();
        }
        press = null;
      }, longPress);
    });
    const move = e => {
      if (st.dragging) { moveDrag(c, root, e.clientX, e.clientY); return; }
      if (!press) return;
      const dx = e.clientX - press.x;
      if (!press.moved && Math.hypot(dx, e.clientY - press.y) > 10) {
        press.moved = true; clearTimeout(press.timer);
        if (Math.abs(dx) > Math.abs(e.clientY - press.y) && !st.folder) { press.scroll = true; strip.style.transition = 'none'; el.classList.add('scrolling'); }
      }
      if (press.scroll) strip.style.transform = `translateX(calc(${-st.page * 100}% + ${dx}px))`;
    };
    const end = e => {
      if (st.dragging) { endDrag(c, root, e.clientX, e.clientY); return; }
      if (!press) return;
      const p = press; press = null; clearTimeout(p.timer);
      if (!p.scroll) return;
      st.suppressClick = true; setTimeout(() => { st.suppressClick = false; });
      const dx = e.clientX - p.x;
      let page = st.page;
      if (dx < -p.w / 4 && page < last) page++;
      else if (dx > p.w / 4 && page > (st.overview ? 1 : 0)) page--;
      strip.style.transition = ''; strip.style.transform = '';
      el.classList.remove('scrolling');
      st.page = page; el.style.setProperty('--page', page); el.classList.toggle('now', page === 0);
      root.querySelectorAll('.mmh-dots i').forEach((dot, i) => dot.classList.toggle('on', i === page));
    };
    // Moves and the release go to the document: a drag may start in the drawer and the pointer leave the launcher.
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end, true);
    root._mmhOff?.();
    root._mmhOff = () => { document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end, true); };
    // A drag the drawer started (an app held there) continues here.
    if (st.pendingDrag) {
      const d = st.pendingDrag; st.pendingDrag = null;
      startDrag(c, root, {src: '', from: 'drawer', item: d.item || {type: 'app', app: d.app}});
      moveDrag(c, root, d.x, d.y);
    }
  }

  MM.launcherDragFromDrawer = (c, app, x, y) => {
    const st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    st.pendingDrag = {app, x, y}; st.suppressClick = true;
    c.ui.drawer = null; c.home();
  };
  // A widget or shortcut held in the widgets list: the drag goes on over the home screen (a copy, like the drawer's).
  // InstallShortcutReceiver: a shortcut an app asks for goes to the first free cell, page by page (a new page when all
  // are full).
  MM.launcherInstall = (c, item) => {
    const h = home(c);
    for (const list of h.pages) for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (free(list, x, y, 1, 1)) { list.push({...item, x, y}); c.save(); return; }
    h.pages.push([{...item, x: 0, y: 0}]); c.save();
  };
  MM.launcherDragNew = (c, item, x, y) => {
    const st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    st.pendingDrag = {item, x, y}; st.suppressClick = true;
    c.home();
  };

  MM.register('home', {
    app: false,
    render, mount,
    reset(c) { if (c.ui.home) { Object.assign(c.ui.home, {folder: null, overview: false}); if (!c.ui.home.pendingDrag) c.ui.home.page = 1; } },
    back(c) { const st = c.ui.home; if (st?.folder || st?.overview) { st.folder = null; st.overview = false; c.render(); } return true; },
    action(name, el, event, c) {
      const st = c.ui.home;
      if (st?.suppressClick) { st.suppressClick = false; return true; }
      if (st?.overview && name !== 'mmh-ov') { st.overview = false; c.render(); return true; }
      if (name === 'mmh-app') { if (st.folder) st.folder = null; c.open(el.dataset.app, '', {from: el.querySelector('img')}); return true; }
      if (name === 'mmh-folder') { st.folder = el.dataset.src; c.render(); return true; }
      if (name === 'mmh-sc') { const it = locate(home(c), el.dataset.src)?.item; if (st.folder) st.folder = null; if (it) MM.openShortcut?.(c, it); return true; }
      if (name === 'mmh-close-folder') { st.folder = null; c.render(); return true; }
      if (name === 'mmh-allapps') { c.open('drawer'); return true; }
      if (name === 'mmh-search') { MM.googleOpen ? MM.googleOpen(c, false) : c.open('search'); return true; }
      if (name === 'mmh-voice') { MM.googleOpen ? MM.googleOpen(c, true) : c.open('search', 'voice'); return true; }
      if (name.startsWith('mmgg-') && MM.google) return MM.google.action(name, el, event, c);
      if (name.startsWith('mmwg-') && MM.widgets) return MM.widgets.action(name, el, event, c);
      if (name === 'mmh-cling') { c.data.homeClingSeen = true; c.save(); c.render(); return true; }
      if (name === 'mmh-ov') { st.overview = false; c.open({wallpaper: 'wallpapers', widget: 'widgets', setting: 'home-settings'}[el.dataset.ov]); return true; }
      return false;
    }
  });
})();
