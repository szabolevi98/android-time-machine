/* Android 7.1.2 home screen: the Google Now Launcher (Launcher3 and GEL in Velvet.apk 6.5.36 of N2G48C, the layout of
   AnglerLayout.apk), the screen 'home'. The logic is 6.0.1's (mm-launcher.js); the numbers and the look are N2G48C's.
   - InvariantDeviceProfile: the 6P's smallest / largest app sizes (387.43 x 659.43 dp) are nearest "Large Phone": a 5 x 5
     workspace, 5 hotseat icons with the all apps button at rank 2, 4 x 4 folders; the sizes come from the three nearest
     profiles weighted 100000 / distance^5: icons 63.93 dp, labels 14.375 sp, hotseat icons 56 dp.
   - DeviceProfile in pixels at 560 dpi (Utilities.pxFromDp rounds): edge margin 6 dp = 21 px, icons 224 px, labels 50 px,
     icon drawable padding 14 px, the label line (Paint's font metrics, Roboto) 67 px, so a cell's content is 305 px;
     GEL keeps the normal search bar (search_widget_in_gel off): 48 dp = 168 px with qsb_internal_padding 28 px above and
     28 + 14 px below = 238 px; the workspace padded 14 px at the sides (42 px less the 28 px default widget padding),
     238 px at the top and the hotseat 308 px (icon + 4 edges) + the page indicator's 70 px at the bottom, so its 5 x 5
     cells share 1412 x 1692 px (282.4 x 338.4 px each) and centre their content (16.7 px down).
   - BubbleTextView: Icon style, white, one line, its two shadows (4 px at 2 px down #dd000000, 1.75 px #cc000000).
   - The search bar: search_widget.xml (search_bg, the Google logo with 16 / 12 / 4 / 8 dp padding, the 56 dp mic
     button ic_mic), 64 dp at the top of the search bar's bounds; it opens Google (Velvet).
   - The hotseat: 308 px at the bottom, its CellLayout 14 px in at each side, 282.4 px cells, the 196 px icons centred
     without labels; the all apps button ic_allapps (pressed ic_allapps_pressed) at allAppsButtonVisualSize, 17 % smaller.
   - Folders: FolderIcon draws portal_ring_inner at folderIconSize (an edge larger all round, an edge higher) and its
     first three items stacked in perspective (PERSPECTIVE_SCALE_FACTOR 0.35, SHIFT 0.18, the back ones lightened... the
     ColorFilter darkens up to 80 / 255); open, user_folder.xml: quantum_panel, FolderPagedView (4 dp at the sides, 8 dp
     above) of the folder cells (min(cell + 3 edges, a quarter of the width less 4 edges) x cell + 1 edge), the name
     (14 sp condensed #777, 4 dp above, 8 dp below) in the footer; it is centred on its icon within the workspace.
   - Pages: GEL's Google Now page to the left of the home page and the workspace pages; the page indicator's markers
     (page_indicator_marker.xml: 12 dp, ic_pageindicator_default / _current) show while the pages move. The wallpaper
     offset (Workspace.WallpaperOffsetInterpolator) is 0 with one workspace page: the wallpaper's left edge.
   - Long press: on an item it drags it (DragController: the icon dragViewScale (224 + 12 dp) / 224 larger; the search
     bar gives way to search_drop_target_bar.xml's Remove and App info); on the workspace overview mode (the pages at
     config_workspaceOverviewShrinkPercentage 70 % over overview_panel.xml: Wallpapers, Widgets, Settings). */
(() => {
  'use strict';
  const T = () => NG.text('launcher');
  const P = 3.5;
  const dp = px => `calc(${(px / P).toFixed(3)} * var(--dp))`;
  // DeviceProfile, portrait, in px.
  const G = (() => {
    const edge = 21, iconSize = 224, textSize = 50, drawablePadding = 14, fontHeight = 67, widgetPad = 28, side = edge * 2 - widgetPad;
    const W = 1440, H = 2308, searchBottom = 168 + 28 + 0 + 28 + 14;
    const cellContent = fontHeight + iconSize + drawablePadding, hotseatH = iconSize + edge * 4, indicatorH = 70;
    const ws = {left: side, top: searchBottom, right: W - side, bottom: H - hotseatH - indicatorH};
    return {edge, iconSize, textSize, drawablePadding, fontHeight, side, W, H, searchBottom, cellContent, hotseatH, indicatorH, ws,
      cellW: (ws.right - ws.left) / 5, cellH: (ws.bottom - ws.top) / 5, hsCellW: (W - side * 2) / 5, hotseatIcon: 196, allAppsButton: Math.trunc((1 - .17) * 196),
      folderCellW: Math.min(edge * 3 + iconSize, Math.trunc((W - edge * 4) / 4)), folderCellH: cellContent + edge, folderIcon: iconSize + edge * 2};
  })();
  NG.launcherGrid = G;
  // DeviceProfile follows the display it runs on: on a phone whose screen is taller or shorter than the 6P's (the mobile
  // layout fills the browser), the workspace between the search bar and the hotseat takes the height there is.
  function fit(c) {
    const vp = c.el.viewport, k = vp.clientWidth / (1440 / P);
    if (!k || !vp.clientHeight) return;
    const H = Math.max(1600, Math.round(vp.clientHeight / k * P));
    G.H = H; G.ws.bottom = H - G.hotseatH - G.indicatorH; G.cellH = (G.ws.bottom - G.ws.top) / 5;
    G.cellPad = Math.max(0, (G.cellH - G.cellContent) / 2);
  }
  G.cellPad = (G.cellH - G.cellContent) / 2;

  // The saved home: pages of {type, app | title + items, x, y}, the hotseat's five ranks (2 is the all apps button).
  function fromLayout() {
    const pages = [[]], hotseat = [null, null, 'allapps', null, null];
    for (const it of NG.defaultWorkspace || []) {
      if (it.type === 'app' && it.container === 'hotseat') hotseat[it.screen] = it.app;
      else if (it.type === 'app') (pages[it.screen] ||= []).push({type: 'app', app: it.app, x: it.x, y: it.y});
      else (pages[it.screen] ||= []).push({type: 'folder', title: it.title, items: it.items.slice(), x: it.x, y: it.y});
    }
    return {pages, hotseat};
  }
  NG.defaults.home = null;
  /* The simulator's own rule for every version (the owner's): the home screen starts with the Clock app's digital clock
     widget (DigitalAppWidgetProvider) across the top two rows of the first page, as most people set their phone up. */
  function addClock(h) {
    const page = h.pages[0] || (h.pages[0] = []);
    if (free(page, 0, 0, 5, 2)) page.push({type: 'widget', w: 'digital', spanX: 5, spanY: 2, x: 0, y: 0});
  }
  const home = c => {
    const h = c.data.home || (c.data.home = fromLayout());
    if (!c.data.clockWidget) { c.data.clockWidget = true; addClock(h); c.save(); }
    return h;
  };

  const label = (c, id) => { const a = NG.appsData?.[id]; return a ? (a.label[c.lang] || a.label.en) : id; };
  const folderTitle = (c, f) => typeof f.title === 'string' ? f.title : (f.title?.[c.lang] || f.title?.en || '');
  NG.appLabel = label;
  // Apps turned off in Settings (InstalledAppDetails' Disable): the launcher and the drawer leave them out.
  NG.appDisabled = (c, id) => (c.data.settings.disabledApps || []).includes(id);

  // An item's view; src names where it lives for the drag code ("ws:<page>:<index>", "hs:<rank>", "fd:<index>").
  function icon(c, item, where, src = '') {
    if (item.type === 'folder') return folderIcon(c, item, where, src);
    if (item.type === 'shortcut') return `<button type="button" class="ngh-icon ngh-sc ${where}" data-action="ngh-sc" data-src="${src}"><img src="${c.safe(item.icon || '')}" alt=""><span>${c.safe(item.deepId?NG.shortcuts?.label(c,item.app,item.deepId)||item.label:item.label)}</span></button>`;
    if (NG.appDisabled(c, item.app)) return '';
    const a = NG.appsData?.[item.app];
    return `<button type="button" class="ngh-icon ${where}" data-action="ngh-app" data-app="${item.app}" data-src="${src}"><img src="${a?.icon}" alt=""><span>${c.safe(label(c, item.app))}</span></button>`;
  }
  // FolderIcon.computePreviewDrawingParams / computePreviewItemDrawingParams, for its first three items.
  function folderPreview(f, cellW = G.cellW, pad = G.cellPad) {
    const previewSize = G.folderIcon, padding = 14, avail = previewSize - 2 * padding;
    const adjusted = Math.trunc(avail / 2 * 1.8), unscaledH = Math.trunc(G.iconSize * 1.18);
    const baseScale = adjusted / unscaledH, baseSize = Math.trunc(G.iconSize * baseScale), shift = baseSize * .18;
    return f.items.slice(0, 3).map((app, i) => {
      const idx = 2 - i, r = idx / 2, scale = 1 - .35 * (1 - r), size = scale * baseSize;
      // dispatchDraw translates by the preview padding plus folderBackgroundOffset; transY adds the icon's top padding.
      const y = (padding - G.edge) + avail - ((1 - r) * shift + size + (1 - scale) * baseSize) + pad;
      return {app, x: (cellW - size) / 2, y, size, overlay: Math.trunc((1 - r) * 80) / 255};
    }).reverse();
  }
  function folderIcon(c, f, where, src = '') {
    const hs = where === 'hs', items = folderPreview(f, hs ? G.hsCellW : G.cellW, hs ? (G.hotseatH - G.iconSize) / 2 : G.cellPad)
      .map(p => `<span class="ngh-fi" style="left:${dp(p.x)};top:${dp(p.y)};width:${dp(p.size)};height:${dp(p.size)};--shade:${p.overlay.toFixed(3)}"><img src="${NG.appsData?.[p.app]?.icon}" alt=""></span>`).join('');
    return `<button type="button" class="ngh-icon ngh-folder ${where}" data-action="ngh-folder" data-src="${src}" aria-label="${c.safe(T().fmt('folder_name_format', null, folderTitle(c, f)))}"><i class="ngh-ring"></i>${items}<span>${c.safe(folderTitle(c, f))}</span></button>`;
  }

  function pageHtml(c, items, p) {
    return `<div class="ngh-page" data-page="${p}" style="--i:${p}"><i class="ngh-panel"></i>${items.map((it, i) => it.type === 'widget'
      ? `<div class="ngh-cell ngh-wcell" style="left:${dp(G.cellW * it.x)};top:${dp(G.cellH * it.y)};width:${dp(G.cellW * it.spanX)};height:${dp(G.cellH * it.spanY)}" data-index="${i}"><div class="ngh-widget" data-src="ws:${p}:${i}" data-w="${it.w}">${NG.widgets ? NG.widgets.home(c, it) : ''}</div></div>`
      : `<div class="ngh-cell" style="left:${dp(G.cellW * it.x)};top:${dp(G.cellH * it.y)}" data-index="${i}">${icon(c, it, 'ws', `ws:${p}:${i}`)}</div>`).join('')}</div>`;
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
    const hotseat = h.hotseat.map((v, rank) => `<div class="ngh-hs" data-rank="${rank}" style="left:${dp(G.side + rank * G.hsCellW)}">${v === 'allapps'
      ? `<button type="button" class="ngh-allapps" data-action="ngh-allapps" aria-label="${c.safe(t.t('all_apps_button_label'))}"></button>`
      : v ? icon(c, typeof v === 'string' ? {type: 'app', app: v} : v, 'hs', `hs:${rank}`) : ''}</div>`).join('');
    // Workspace.addExtraEmptyScreenOnDrag: an empty page after the last one, reachable only while dragging.
    const pages = h.pages.map((items, i) => pageHtml(c, items, i + 1)).join('') + `<div class="ngh-page ngh-extra" data-page="${h.pages.length + 1}" style="--i:${h.pages.length + 1}"><i class="ngh-panel"></i></div>`;
    const dots = [0, ...h.pages.map((_, i) => i + 1)].map(i => `<i class="${i === st.page ? 'on' : ''}"><b></b></i>`).join('');
    // search_drop_target_bar.xml: Remove and App info (Uninstall only for an app the user installed: none here).
    const targets = `<div class="ngh-targets"><span data-target="remove"><img src="assets/gel-ic_remove_launcher.png" alt="">${c.safe(t.t('delete_target_label'))}</span><span data-target="info"><img src="assets/gel-ic_info_launcher.png" alt="">${c.safe(t.t('info_target_label'))}</span></div>`;
    const overview = `<div class="ngh-overview">${[['wallpaper', 'wallpaper_button_text'], ['widget', 'widget_button_text'], ['setting', 'settings_button_text']].map(([k, s]) => `<button type="button" class="ngh-ov-${k}" data-action="ngh-ov" data-ov="${k}"><i></i><span>${c.safe(t.t(s))}</span></button>`).join('')}</div>`;
    const cling = !c.data.homeClingSeen ? `<div class="ngh-cling"><i></i><div class="ngh-cling-box np-gel-cling_bg"><div class="ngh-cling-1">${c.safe(t.t('first_run_cling_title'))}</div><div class="ngh-cling-2">${c.safe(t.t('workspace_cling_longpress_title'))}</div><div class="ngh-cling-3">${c.safe(t.t('workspace_cling_longpress_description'))}</div><button type="button" data-action="ngh-cling">${c.safe(t.t('workspace_cling_longpress_dismiss'))}</button></div><i class="ngh-cling-2x"></i></div>` : '';
    return `<div class="ngh${st.page === 0 ? ' now' : ''}${st.overview ? ' overview' : ''}" style="--page:${st.page};--cellh:${dp(G.cellH)};--cellpad:${dp(G.cellPad)};--wsh:${dp(G.ws.bottom - G.ws.top)}">
      <div class="ngh-strip"><div class="ngh-nowpage">${NG.google?.nowPage ? NG.google.nowPage(c) : c.missing('now')}</div>${pages}</div>
      <div class="ngh-qsb np-gel-search_bg"><button type="button" class="ngh-qsb-logo" data-action="ngh-search" aria-label="${c.safe(t.t('accessibility_google_search_button'))}"><img src="assets/gel-ic_searchbox_google.png" alt=""></button><button type="button" class="ngh-qsb-plate" data-action="ngh-search" aria-label="${c.safe(t.t('accessibility_google_search_button'))}"></button><button type="button" class="ngh-qsb-mic" data-action="ngh-voice" aria-label="${c.safe(t.t('accessibility_voice_search_button'))}"><img src="assets/gel-ic_mic.png" alt=""></button></div>
      ${targets}<div class="ngh-dots">${dots}</div>
      <div class="ngh-hotseat">${hotseat}</div>${overview}
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
    // quantum_panel's padding (3.75 / 3.25 / 3.75 / 4.25 dp), FolderPagedView's 4 dp sides and 8 dp top, the footer's
    // name (14 sp condensed, 4 + 8 dp padding).
    const [cols, rows] = folderGrid(f.items.length), pl = 13, pt = 11, pb = 15, padX = 14, padTop = 28, footer = 42 + Math.ceil(49 * 1.328);
    const w = cols * G.folderCellW + padX * 2 + pl * 2, hgt = rows * G.folderCellH + padTop + footer + pt + pb;
    const cx = loc.kind === 'hs' ? G.side + G.hsCellW * (loc.rank + .5) : G.ws.left + G.cellW * (f.x + .5);
    const cy = loc.kind === 'hs' ? G.H - G.hotseatH / 2 : G.ws.top + G.cellH * f.y + G.cellPad + G.iconSize / 2;
    const left = Math.min(Math.max(G.ws.left, cx - w / 2), G.ws.right - w), top = Math.min(Math.max(G.ws.top, cy - hgt / 2), G.ws.bottom - hgt);
    const cells = f.items.map((id, i) => `<div class="ngh-fcell" style="left:${dp(pl + padX + (i % cols) * G.folderCellW)};top:${dp(pt + padTop + Math.floor(i / cols) * G.folderCellH)}">${icon(c, {type: 'app', app: id}, 'fd', `fd:${i}`)}</div>`).join('');
    return `<div class="ngh-fscrim" data-action="ngh-close-folder"></div><div class="ngh-fpanel" style="left:${dp(left)};top:${dp(top)};width:${dp(w)};height:${dp(hgt)};--ox:${dp(cx - left)};--oy:${dp(cy - top)}" data-geo="${[w, hgt, cx - left, cy - top].map(v => (v / P).toFixed(2)).join(' ')}">
      <i class="ngh-fbg np-gel-quantum_panel_bitmap"></i><div class="ngh-fgrid">${cells}</div><input class="ngh-fname" style="top:${dp(pt + padTop + rows * G.folderCellH)}" value="${c.safe(folderTitle(c, f))}" placeholder="${c.safe(T().t('folder_hint_text'))}" spellcheck="false"></div>`;
  }

  /* Folder.animateOpen (ATLEAST_LOLLIPOP): a circular reveal from the folder icon's centre to the farthest corner over
     config_materialFolderExpandDuration 200 ms (LogDecelerateInterpolator 100, 0), the panel drifting in from 7.5 % of
     the way to the icon, the icons and the name fading in (AccelerateInterpolator 1.5), after
     config_materialFolderExpandStagger 60 ms. animateClosed: to alpha 0 and scale 0.9 in config_folderExpandDuration
     120 ms about the same pivot. */
  const logDecel = t => (1 - Math.pow(100, -t)) / (1 - 1 / 100);
  function folderOpenAnim(c, panel) {
    if (!panel?.animate || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const k = c.el.viewport.clientWidth / (1440 / P), [w, h, ox, oy] = panel.dataset.geo.split(' ').map(v => +v * k);
    const r = Math.hypot(Math.max(w - ox, ox), Math.max(h - oy, oy)), tx = -.075 * (w / 2 - ox), ty = -.075 * (h / 2 - oy);
    const n = 12, steps = f => Array.from({length: n + 1}, (_, i) => f(i / n));
    panel.animate(steps(t => ({offset: t, clipPath: `circle(${(r * logDecel(t)).toFixed(1)}px at ${ox}px ${oy}px)`})), {duration: 200});
    panel.animate(steps(t => ({offset: t, transform: `translate(${(tx * (1 - logDecel(t))).toFixed(2)}px, ${(ty * (1 - logDecel(t))).toFixed(2)}px)`})), {duration: 200, delay: 60, fill: 'backwards'});
    for (const el of panel.querySelectorAll('.ngh-fgrid, .ngh-fname')) el.animate(steps(t => ({offset: t, opacity: Math.pow(t, 3)})), {duration: 200, delay: 60, fill: 'backwards'});
  }
  function closeFolder(c, then) {
    const st = c.ui.home, panel = c.el.viewport.querySelector('.ngh-fpanel');
    st.folder = null; st.folderShown = null;
    if (!panel?.animate) { then ? then() : c.render(); return; }
    panel.remove();
    if (then) then(); else c.render();
    const root = c.el.viewport.querySelector('.ngh') || c.el.viewport;
    panel.style.pointerEvents = 'none'; root.append(panel);
    panel.animate([{opacity: 1, transform: 'none'}, {opacity: 0, transform: 'scale(.9)'}], {duration: 120, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'}).finished.then(() => panel.remove(), () => panel.remove());
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
    const st = c.ui.home, el = root.querySelector('.ngh');
    st.dragging = d;
    el.classList.add('dragging');
    if (st.folder && d.from === 'fd') { st.folder = null; el.querySelector('.ngh-fpanel')?.remove(); el.querySelector('.ngh-fscrim')?.remove(); }
    const view = document.createElement('div');
    view.className = 'ngh-dragview';
    if (d.item.type === 'widget') {
      const wi = NG.widgets?.info(d.item.w) || {spanX: d.item.spanX || 1, spanY: d.item.spanY || 1}, w = G.cellW * wi.spanX, h = G.cellH * wi.spanY;
      view.classList.add('widget');
      Object.assign(view.style, {width: dp(w), height: dp(h), margin: `calc(${(-h / 2 / P).toFixed(3)} * var(--dp)) 0 0 calc(${(-w / 2 / P).toFixed(3)} * var(--dp))`});
      view.innerHTML = d.from === 'ws' ? (NG.widgets?.home(c, d.item) || '') : `<div class="ngh-wprev">${NG.widgets?.preview?.(c, wi) || ''}</div>`;
    } else if (d.item.type === 'shortcut') view.innerHTML = `<img src="${c.safe(d.item.icon || '')}" alt="">`;
    else view.innerHTML = `<img src="${NG.appsData?.[d.item.type === 'folder' ? d.item.items[0] : d.item.app]?.icon}" alt="">`;
    if (d.item.type === 'folder') { view.innerHTML = el.querySelector(`[data-src="${d.src}"]`)?.outerHTML || view.innerHTML; view.classList.add('folder'); }
    el.append(view);
    d.view = view;
    if (d.srcEl) d.srcEl.style.visibility = 'hidden';
    navigator.vibrate?.(20);
  }
  function target(c, root, x, y) {
    const r = root.querySelector('.ngh').getBoundingClientRect(), k = r.width / G.W;
    const px = (x - r.left) / k, py = (y - r.top) / k;
    if (py < G.searchBottom) return {kind: px < G.W / 2 ? 'remove' : 'info'};
    if (py > G.H - G.hotseatH) return {kind: 'hs', rank: Math.max(0, Math.min(4, Math.floor((px - G.side) / G.hsCellW)))};
    if (py < G.ws.bottom) return {kind: 'ws', x: Math.max(0, Math.min(4, Math.floor((px - G.ws.left) / G.cellW))), y: Math.max(0, Math.min(4, Math.floor((py - G.ws.top) / G.cellH))), fx: (px - G.ws.left) / G.cellW, fy: (py - G.ws.top) / G.cellH};
    return null;
  }
  // DragController.checkScrollState: held within scroll_zone (20 dp) of a side for 500 ms, the workspace turns a page.
  function edgeScroll(c, root, x, r) {
    const st = c.ui.home, d = st.dragging, zone = 20 * r.width / (G.W / P), dir = x - r.left < zone ? -1 : r.right - x < zone ? 1 : 0;
    if (dir === d.edgeDir) return;
    clearTimeout(d.edgeTimer); d.edgeDir = dir;
    if (!dir) return;
    d.edgeTimer = setTimeout(() => {
      const last = home(c).pages.length + 1, page = Math.max(1, Math.min(last, st.page + dir));
      d.edgeDir = 0;
      if (page === st.page || st.dragging !== d) return;
      st.page = page;
      root.querySelector('.ngh').style.setProperty('--page', page);
      root.querySelectorAll('.ngh-dots i').forEach((dot, i) => dot.classList.toggle('on', i === page));
    }, 500);
  }
  function moveDrag(c, root, x, y) {
    const d = c.ui.home.dragging, r = root.querySelector('.ngh').getBoundingClientRect();
    d.view.style.left = `${x - r.left}px`; d.view.style.top = `${y - r.top}px`;
    edgeScroll(c, root, x, r);
    const t = target(c, root, x, y);
    root.querySelectorAll('.ngh-targets span').forEach(s => s.classList.toggle('hover', !!t && s.dataset.target === t.kind));
    d.view.classList.toggle('remove', t?.kind === 'remove');
  }
  function endDrag(c, root, x, y) {
    const st = c.ui.home, d = st.dragging, h = home(c);
    st.dragging = null;
    setTimeout(() => { st.suppressClick = false; }, 60);
    clearTimeout(d.edgeTimer);
    const t = target(c, root, x, y), page = st.page > 0 ? st.page : 1;
    // A drop on the extra page makes it a real one; Workspace.stripEmptyScreens drops the empty ones afterwards.
    if (page > h.pages.length) h.pages.push([]);
    const strip = () => { const keep = h.pages.filter((p, i) => !i || p.length); if (keep.length !== h.pages.length) { const cur = h.pages[st.page - 1]; h.pages = keep; st.page = Math.max(1, keep.indexOf(cur) + 1 || Math.min(st.page, keep.length)); } };
    const saveRender = () => { strip(); c.save(); c.render(); };
    const app = d.item.type === 'app' ? d.item.app : null;
    const take = () => {
      if (d.from === 'ws') { const loc = locate(h, d.src); loc.list.splice(loc.index, 1); }
      else if (d.from === 'hs') h.hotseat[+d.src.split(':')[1]] = null;
      else if (d.from === 'fd') { const loc = folderOf(c, d.folder); loc.item.items.splice(d.index, 1); tidyFolder(h, loc); }
    };
    const wi = d.item.type === 'widget' ? (NG.widgets?.info(d.item.w) || {id: d.item.w, spanX: d.item.spanX, spanY: d.item.spanY}) : null;
    if (t?.kind === 'info' && (app || wi?.app)) { strip(); c.render(); c.open('settings', `app:${app || wi.app}`); return; }
    if (t?.kind === 'remove' && d.from !== 'drawer') { take(); saveRender(); return; }
    const fresh = {...d.item};
    if (wi && t?.kind === 'ws') {
      const list = h.pages[page - 1], self = d.from === 'ws' ? locate(h, d.src).item : null;
      const at = nearest(list, t.fx - wi.spanX / 2 + .5, t.fy - wi.spanY / 2 + .5, wi.spanX, wi.spanY, self);
      if (!at) { strip(); c.render(); c.toast(T().t('out_of_space'), false); return; }
      take();
      const placed={...(d.from === 'ws' ? fresh : {}), type: 'widget', w: wi.id || d.item.w, spanX: wi.spanX, spanY: wi.spanY, x: at.x, y: at.y};
      h.pages[page - 1].push(placed);saveRender();
      if(d.from!=='ws')NG.widgets?.configure?.(c,placed,ok=>{if(!ok){const list=h.pages.find(p=>p.includes(placed));if(list)list.splice(list.indexOf(placed),1);}saveRender();});
      return;
    }
    if (wi) { strip(); c.render(); return; }
    if (t?.kind === 'ws') {
      const list = h.pages[page - 1];
      let hit = list.findIndex(it => covers(it, t.x, t.y));
      // Over a widget an icon takes the nearest free cell instead.
      if (hit >= 0 && list[hit].type === 'widget') {
        const at = nearest(list, t.fx, t.fy, 1, 1, d.from === 'ws' ? locate(h, d.src).item : null);
        if (!at) { strip(); c.render(); c.toast(T().t('out_of_space'), false); return; }
        t.x = at.x; t.y = at.y; hit = list.findIndex(it => covers(it, t.x, t.y));
      }
      const self = d.from === 'ws' && d.src === `ws:${page}:${hit}`;
      if (hit < 0 || self) { take(); h.pages[page - 1].push({...fresh, x: t.x, y: t.y}); }
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
    const el = root.querySelector('.ngh'), strip = root.querySelector('.ngh-strip');
    if (!el) return;
    const st = c.ui.home, h = home(c), last = h.pages.length;
    st.listenersOff?.();
    NG.widgets?.mount?.(c, el);
    NG.google?.mount?.(c, el.querySelector('.ngh-nowpage'));
    if (st.folder && st.folderShown !== st.folder) { st.folderShown = st.folder; folderOpenAnim(c, el.querySelector('.ngh-fpanel')); }
    if (!st.folder) st.folderShown = null;
    const name = el.querySelector('.ngh-fname');
    name?.addEventListener('change', () => { const loc = folderOf(c, st.folder); if (loc) { loc.item.title = name.value; c.save(); } });
    name?.addEventListener('keydown', e => { if (e.key === 'Enter') name.blur(); e.stopPropagation(); });
    let press = null;
    el.addEventListener('pointerdown', e => {
      if (e.button || st.dragging) return;
      if (e.target.closest('.ngh-qsb,.ngh-overview,.ngh-cling,.ngh-fname,.ngh-allapps,.nggoogle-card,.nggoogle-drawer,.nggoogle-plate,.nggoogle-feedtabs')) return;
      const src = e.target.closest('[data-src]');
      press = {x: e.clientX, y: e.clientY, moved: false, w: el.clientWidth, src, timer: 0};
      // ViewConfiguration's long press timeout, 500 ms.
      press.timer = setTimeout(() => {
        if (!press || press.moved) return;
        if (st.folder && !src) return;
        st.suppressClick = true;
        if (src) {
          const s = src.dataset.src;
          let item, from = s.split(':')[0], folder = null, index = 0;
          if (from === 'fd') { folder = st.folder; index = +s.split(':')[1]; item = {type: 'app', app: folderOf(c, folder).item.items[index]}; }
          else item = locate(h, s).item;
          const origin={x:press.x,y:press.y},drag={src:s,from,item,folder,index,srcEl:src};
          if(item.type==='app'&&NG.shortcuts?.show(c,item.app,src,origin,(x,y)=>{startDrag(c,root,drag);moveDrag(c,root,x,y);})){press=null;return;}
          startDrag(c, root, drag);
          moveDrag(c, root, press.x, press.y);
        } else if (st.page > 0 && !st.overview) {
          // Launcher.onLongClick on the workspace: overview mode (and the long-press cling is done).
          c.data.homeClingSeen = true; c.save();
          st.overview = true; c.render();
        }
        press = null;
      }, 500);
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
      root.querySelectorAll('.ngh-dots i').forEach((dot, i) => dot.classList.toggle('on', i === page));
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', end, true);
    st.listenersOff = () => { clearTimeout(press?.timer); press=null; document.removeEventListener('pointermove', move); document.removeEventListener('pointerup', end, true); };
    // A drag the drawer or the widgets list started continues here.
    if (st.pendingDrag) {
      const d = st.pendingDrag; st.pendingDrag = null;
      startDrag(c, root, {src: '', from: 'drawer', item: d.item || {type: 'app', app: d.app}});
      moveDrag(c, root, d.x, d.y);
    }
  }

  NG.launcherDragFromDrawer = (c, app, x, y) => {
    const st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    st.pendingDrag = {app, x, y}; st.suppressClick = true;
    c.ui.drawer = null; c.home();
  };
  NG.launcherDragNew = (c, item, x, y) => {
    const st = c.ui.home || (c.ui.home = {page: 1, folder: null});
    st.pendingDrag = {item, x, y}; st.suppressClick = true;
    c.home();
  };
  // InstallShortcutReceiver: a shortcut an app asks for goes to the first free cell, page by page.
  NG.launcherInstall = (c, item) => {
    const h = home(c);
    for (const list of h.pages) for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (free(list, x, y, 1, 1)) { list.push({...item, x, y}); c.save(); return; }
    h.pages.push([{...item, x: 0, y: 0}]); c.save();
  };

  NG.register('home', {
    app: false,
    render, mount,
    unmount(c){c.ui.home?.listenersOff?.();if(c.ui.home)c.ui.home.listenersOff=null;},
    statusColor: () => 'transparent',
    reset(c) { if (c.ui.home) { Object.assign(c.ui.home, {folder: null, overview: false}); if (!c.ui.home.pendingDrag) c.ui.home.page = 1; } },
    back(c) { const st = c.ui.home; if (st?.folder) { closeFolder(c); return true; } if (st?.overview) { st.overview = false; c.render(); } else if (c.ui.google?.drawer) { c.ui.google.drawer=false; c.render(); } else if(st?.page===0){st.page=1;c.render();} return true; },
    action(name, el, event, c) {
      const st = c.ui.home;
      if (name.startsWith('nggoogle-') && NG.google) return NG.google.action(name, el, event, c);
      if (st?.suppressClick) { st.suppressClick = false; return true; }
      if (st?.overview && name !== 'ngh-ov') { st.overview = false; c.render(); return true; }
      if (name === 'ngh-app') { if (st.folder) st.folder = null; c.open(el.dataset.app, '', {from: el.querySelector('img')}); return true; }
      if (name === 'ngh-folder') { st.folder = el.dataset.src; c.render(); return true; }
      if (name === 'ngh-sc') { const it = locate(home(c), el.dataset.src)?.item; if (st.folder) st.folder = null; if (it) NG.openShortcut?.(c, it); return true; }
      if (name === 'ngh-close-folder') { closeFolder(c); return true; }
      if (name === 'ngh-allapps') { c.open('drawer'); return true; }
      if (name === 'ngh-search') { NG.googleOpen ? NG.googleOpen(c, false) : c.open('search'); return true; }
      if (name === 'ngh-voice') { NG.googleOpen ? NG.googleOpen(c, true) : c.open('search', 'voice'); return true; }
      if (NG.widgets?.action(name, el, event, c)) return true;
      if (name === 'ngh-cling') { c.data.homeClingSeen = true; c.save(); c.render(); return true; }
      if (name === 'ngh-ov') { st.overview = false; c.open({wallpaper: 'wallpapers', widget: 'widgets', setting: 'home-settings'}[el.dataset.ov]); return true; }
      return false;
    }
  });
})();
