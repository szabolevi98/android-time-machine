/* Android 2.3.6 Gallery (packages/apps/Gallery3D, com.cooliris.media) redrawn in HTML: the BackgroundLayer (the current
   cover blurred behind everything), the PathBarLayer breadcrumbs (pathbar_bg / join / cap, 18 dip text, 38 dip icons),
   the HudLayer top-right button (btn_camera on the albums, the mode_grid / mode_stack switch in an album), the GridLayer
   states (album stacks in 3 rows, the album grid in 4 rows, both scrolling sideways, 96 x 72 dip items), full screen with
   the Slideshow / Menu bar and the zoom buttons, and selection mode with Select All / Deselect All and Share / Delete / More
   with their popup menus. Photos are drawn by media.js (ICSMedia); strings come from gb-strings-gallery.js. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.gallery), text = (lang, key) => R.t(key, lang);
  // 1 dp in CSS px: the display is 320 dp wide (276 px in the desktop frame, the whole width on a phone).
  const DP = () => (globalThis.document?.querySelector?.('#screen')?.clientWidth || 276) / 320, ITEM_W = () => 96 * DP(), ITEM_H = () => 72 * DP();
  const M = () => window.ICSMedia;
  // LocalDataSource buckets shown in this simulator: the camera roll and the Pictures folder.
  const ALBUMS = ['camera', 'pictures'];
  const albumName = (key, lang) => key === 'camera' ? text(lang, 'camera') : 'Pictures';
  const albumIcon = key => key === 'camera' ? 'gb-g3-icon_camera_small.png' : 'gb-g3-icon_folder_small.png';
  // GridDrawables.TEXTURE_VIDEO: videos carry the play overlay.
  const thumb = (photo, cls = '') => `<span class="gbg-thumb${cls}"><img src="${M().image(photo)}" alt="">${photo.video ? '<img class="gbg-video" src="assets/gb-g3-videooverlay.png" alt="">' : ''}</span>`;
  // PathBarLayer: each label after the first is joined by pathbar_join; the last one ends with pathbar_cap.
  function pathBar(parts) {
    return `<div class="gbg-path">${parts.map(([icon, label, action], i) => `<button class="gbg-crumb${i === parts.length - 1 ? ' last' : ''}"${action ? ` data-action="${action}"` : ''}>${icon ? `<img src="assets/${icon}" alt="">` : ''}${label ? `<span>${e(label)}</span>` : ''}</button>`).join('')}</div>`;
  }
  const home = ctx => ctx.pick ? ['gb-g3-icon_folder_small.png', text(ctx.lang, 'pick'), ctx.sub ? 'gbg-home' : ''] : ['gb-g3-icon_home_small.png', text(ctx.lang, 'app_name'), ctx.sub ? 'gbg-home' : ''];
  const background = cover => `<div class="gbg-bg"${cover ? ` style="background-image:url('${cover}')"` : ''}></div>`;
  // MenuBar: selection_menu_bg with dividers; each item is an icon and a label.
  const menuBar = (items, cls) => `<div class="gbg-menubar ${cls}">${items.map(([action, label, icon]) => `<button data-action="${action}">${icon ? `<img src="assets/${icon}" alt="">` : ''}<span>${e(label)}</span></button>`).join('<i></i>')}</div>`;

  function stack(photos, key, x, y, ctx, selected) {
    // DisplayList stack: up to four photos, the newest on top and the others turned slightly behind it.
    const angles = [0, -6, 5, -3];
    const layers = photos.slice(0, 4).map((photo, i) => `<span class="gbg-layer" style="transform:rotate(${angles[i]}deg);z-index:${4 - i}">${thumb(photo)}</span>`).reverse().join('');
    return `<button class="gbg-stack${selected ? ' selected' : ''}" style="left:${x.toFixed(2)}px;top:calc(50% + ${y.toFixed(2)}px)" data-action="${ctx.selecting ? 'gbg-toggle' : 'gallery-album'}" data-id="${key}" data-gbg-hold="${key}">${layers}<img class="gbg-source" src="assets/${albumIcon(key)}" alt="">${ctx.selecting ? `<img class="gbg-check" src="assets/gb-g3-grid_check_${selected ? 'on' : 'off'}.png" alt="">` : ''}<span class="gbg-label">${e(albumName(key, ctx.lang))} (${photos.length})</span></button>`;
  }
  // STATE_MEDIA_SETS: 3 rows (numMaxRows - 1 in portrait), 100 dip x spacing, 70 dip x yStretch y spacing; the camera
  // starts centred on the first column.
  function albums(ctx) {
    const sets = ALBUMS.map(key => [key, M().photos(ctx.data, key)]).filter(([, photos]) => photos.length);
    const yStretch = (320 / 480) / (ctx.width / ctx.height), sx = ITEM_W() + 100 * DP(), sy = ITEM_H() + 70 * DP() * Math.max(1, yStretch);
    const stacks = sets.map(([key, photos], i) => stack(photos, key, ctx.width / 2 - ITEM_W() / 2 + Math.floor(i / 3) * sx, (i % 3) * sy - sy - ITEM_H() / 2, ctx, ctx.selected.includes(key))).join('');
    const cover = sets[0]?.[1][0];
    const width = ctx.width + Math.max(0, Math.ceil(sets.length / 3) - 1) * sx;
    return `<div class="app-view gbg gbg-sets" data-no-translate>${background(cover && M().image(cover))}<div class="gbg-scroll"><div class="gbg-canvas" style="width:${width.toFixed(1)}px">${stacks || `<p class="gbg-empty">${e(text(ctx.lang, 'no_items'))}</p>`}</div></div>${hud(ctx, [home(ctx)], ctx.pick ? '' : `<button class="gbg-camera" data-action="gallery-camera" aria-label="${e(text(ctx.lang, 'camera'))}"></button>`)}</div>`;
  }
  // STATE_GRID_VIEW: 4 rows, 10 dip spacing, column by column; the TimeBar along the bottom.
  function album(ctx) {
    const photos = M().photos(ctx.data, ctx.album), gap = 10 * DP(), cols = Math.ceil(photos.length / 4);
    const cells = photos.map((photo, i) => {
      const x = gap + Math.floor(i / 4) * (ITEM_W() + gap), y = (i % 4) * (ITEM_H() + gap) - (3 * (ITEM_H() + gap)) / 2 - ITEM_H() / 2, on = ctx.selected.includes(String(photo.id));
      return `<button class="gbg-cell${on ? ' selected' : ''}" style="left:${x.toFixed(2)}px;top:calc(50% - ${(ctx.timebar / 2).toFixed(2)}px + ${y.toFixed(2)}px)" data-action="${ctx.selecting ? 'gbg-toggle' : 'photo'}" data-id="${photo.id}" data-gbg-hold="${photo.id}" aria-label="${e(photo.name)}">${thumb(photo)}${ctx.selecting ? `<img class="gbg-check" src="assets/gb-g3-grid_check_${on ? 'on' : 'off'}.png" alt="">` : ''}</button>`;
    }).join('');
    const width = Math.max(ctx.width, gap + cols * (ITEM_W() + gap));
    const month = ctx.now.toLocaleDateString(ctx.locale, {month: 'short', year: 'numeric'});
    const timebar = ctx.selecting ? '' : `<div class="gbg-timebar"><span class="gbg-month">${e(month)}</span><span class="gbg-knob"></span></div>`;
    const toggle = `<button class="gbg-mode${ctx.stackMode ? ' stack' : ''}" data-action="gbg-mode" aria-label="Grid / stack"></button>`;
    const body = ctx.stackMode
      ? `<div class="gbg-canvas" style="width:${ctx.width}px">${photos.length ? `<button class="gbg-stack" style="left:${(ctx.width / 2 - ITEM_W() / 2).toFixed(2)}px;top:calc(50% - ${(ITEM_H() / 2).toFixed(2)}px)" data-action="gbg-mode">${photos.slice(0, 4).map((photo, i) => `<span class="gbg-layer" style="transform:rotate(${[0, -6, 5, -3][i]}deg);z-index:${4 - i}">${thumb(photo)}</span>`).reverse().join('')}<span class="gbg-label">${e(month)} (${photos.length})</span></button>` : ''}</div>`
      : `<div class="gbg-canvas" style="width:${width.toFixed(1)}px">${cells}</div>`;
    return `<div class="app-view gbg gbg-album" data-no-translate>${background(photos[0] && M().image(photos[0]))}<div class="gbg-scroll">${body}</div>${timebar}${hud(ctx, [home(ctx), [albumIcon(ctx.album), albumName(ctx.album, ctx.lang), ctx.selecting ? '' : 'gbg-up']], toggle)}</div>`;
  }
  // STATE_FULL_SCREEN: the photo fills the width; Slideshow / Menu along the bottom with the zoom buttons above it.
  function photo(ctx) {
    const photos = M().photos(ctx.data, ctx.album), item = ctx.photo, index = photos.findIndex(p => p.id === item.id) + 1;
    const label = ctx.caption ? item.name : `${index}/${photos.length}`;
    const bottom = ctx.selecting ? '' : menuBar([['gallery-slideshow', text(ctx.lang, 'slideshow'), 'gb-g3-icon_play.png'], ['gbg-select-current', text(ctx.lang, 'menu'), 'gb-g3-icon_more.png']], 'bottom');
    const zoom = ctx.selecting ? '' : `<div class="gbg-zoom"><button class="out" data-action="gbg-zoom" data-id="-1" aria-label="Zoom out"></button><button class="in" data-action="gbg-zoom" data-id="1" aria-label="Zoom in"></button></div>`;
    return `<div class="app-view gbg gbg-full${ctx.slideshow ? ' gbg-slideshow' : ''}${ctx.hudHidden ? ' hud-hidden' : ''}" data-no-translate><div class="gbg-black"></div><div class="gbg-stage" data-gallery-swipe><button class="gbg-photo${ctx.zoom ? ' zoomed' : ''}" data-action="gbg-hud" aria-label="${e(item.name)}"><img src="${M().image(item)}" alt="${e(item.name)}"></button></div>${hud(ctx, [home(ctx), [albumIcon(ctx.album), albumName(ctx.album, ctx.lang), 'gbg-up'], ['gb-g3-ic_fs_details.png', label, 'gbg-caption']], '')}${zoom}${bottom}</div>`;
  }
  // HudLayer: the path bar (hidden while selecting) and the top-right button, or the selection menus.
  function hud(ctx, crumbs, topRight) {
    if (ctx.selecting) {
      const n = ctx.selected.length, sets = ctx.sub === '', T = key => text(ctx.lang, key);
      const count = `${n} ${T(sets ? (AndroidStrings.quantity(n) === 'one' ? 'album_selected' : 'albums_selected') : (AndroidStrings.quantity(n) === 'one' ? 'item_selected' : 'items_selected'))}`;
      return `${menuBar([['gbg-select-all', T('select_all')], ['', count], ['gbg-deselect', T('deselect_all')]], 'top')}${menuBar([['gbg-share', T('share'), 'gb-g3-icon_share.png'], ['gbg-delete', T('delete'), 'gb-g3-icon_delete.png'], ['gbg-more', T('more'), 'gb-g3-icon_more.png']], 'bottom')}${popup(ctx)}`;
    }
    return `${pathBar(crumbs)}${topRight}`;
  }
  // PopupMenu above the bottom bar: Confirm Delete / Cancel, or the More options.
  function popup(ctx) {
    const T = key => text(ctx.lang, key);
    if (ctx.popup === 'delete') return `<div class="gbg-popup at-1"><button data-action="gbg-confirm-delete"><img src="assets/gb-g3-icon_delete.png" alt=""><span>${e(T('confirm_delete'))}</span></button><button data-action="gbg-popup-close"><img src="assets/gb-g3-icon_cancel.png" alt=""><span>${e(T('cancel'))}</span></button></div>`;
    if (ctx.popup === 'more') {
      const single = ctx.sub !== '' && ctx.selected.length === 1;
      // HudLayer.buildMoreOptions: Show on map only for an item with a location (the camera's Store location).
      const located = single && ctx.data.photos.find(p => String(p.id) === String(ctx.selected[0]))?.location;
      const options = [['gallery-details', T('details'), 'gb-g3-ic_menu_view_details.png'], ...(located ? [['gbg-show-map', T('show_on_map'), 'gb-g3-ic_menu_mapmode.png']] : []), ...(ctx.sub !== '' ? [['gbg-rotate', T('rotate_left'), 'gb-g3-ic_menu_rotate_left.png', '-90'], ['gbg-rotate', T('rotate_right'), 'gb-g3-ic_menu_rotate_right.png', '90']] : []), ...(single ? [['gbg-wallpaper', T('set_as_wallpaper'), 'gb-g3-ic_menu_set_as.png'], ['gbg-crop', T('crop'), 'gb-g3-ic_menu_crop.png']] : [])];
      return `<div class="gbg-popup at-2">${options.map(([action, label, icon, id]) => `<button data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}><img src="assets/${icon}" alt=""><span>${e(label)}</span></button>`).join('')}</div>`;
    }
    if (ctx.popup === 'share') return `<div class="gbg-popup at-0"><button data-action="gallery-share-message"><img src="assets/messaging.png" alt=""><span>Messaging</span></button><button data-action="gbg-share-email"><img src="assets/email.png" alt=""><span>Email</span></button></div>`;
    return '';
  }
  // CropImage (com.cooliris.media, cropimage.xml): the CropImageView over #55000000 with the picture fitted to the screen,
  // and Save / Discard (100 dip, crop_save_text / crop_discard_text) in the bottom corners. HighlightView: makeDefault's
  // square (4/5 of the shorter side, centred) outlined 3 px #ff8a00, the rest of the view shaded ARGB(125, 50, 50, 50);
  // while an edge is dragged (ModifyMode.Grow) camera_crop_width / camera_crop_height sit on the edges' midpoints.
  const CROP = {get hit() { return 20 / 1.5 * DP(); }, min: 25};
  function cropDefault(photo) {
    const [w, h] = M().size(photo), side = Math.min(w, h) * 4 / 5;
    return {x: (w - side) / 2 / w, y: (h - side) / 2 / h, w: side / w, h: side / h};
  }
  function crop(ctx) {
    const c = ctx.crop, [w, h] = M().size(ctx.photo), T = key => text(ctx.lang, key), pct = n => `${(n * 100).toFixed(3)}%`;
    return `<div class="app-view gbg-crop" data-no-translate><div class="gbg-crop-frame" data-crop-frame style="--ar:${(w / h).toFixed(5)}"><img src="${M().image(ctx.photo)}" alt="${e(ctx.photo.name)}"><div class="gbg-crop-hl" data-crop-hl style="left:${pct(c.x)};top:${pct(c.y)};width:${pct(c.w)};height:${pct(c.h)}"><i class="l"></i><i class="r"></i><i class="t"></i><i class="b"></i></div></div><div class="gbg-crop-buttons"><button data-action="gbg-crop-save">${e(T('crop_save_text'))}</button><button data-action="gbg-crop-discard">${e(T('crop_discard_text'))}</button></div></div>`;
  }
  // HighlightView.handleMotion: getHit's 20 px hysteresis picks the edges; Grow insets the box on both sides (growBy keeps
  // it at least 25 picture pixels and inside the picture), Move slides it (moveBy keeps it on the picture).
  function cropDrag(event, frame, c, photo, done) {
    const box = frame.getBoundingClientRect(), hl = frame.querySelector('[data-crop-hl]');
    if (!box.width || !hl) return false;
    const W = box.width, H = box.height, [pw, ph] = M().size(photo), x = event.clientX - box.left, y = event.clientY - box.top;
    const r = {l: c.x * W, t: c.y * H, r: (c.x + c.w) * W, b: (c.y + c.h) * H}, tol = CROP.hit;
    const vertical = y >= r.t - tol && y < r.b + tol, horizontal = x >= r.l - tol && x < r.r + tol;
    const edge = {l: Math.abs(r.l - x) < tol && vertical, r: Math.abs(r.r - x) < tol && vertical, t: Math.abs(r.t - y) < tol && horizontal, b: Math.abs(r.b - y) < tol && horizontal};
    const grow = edge.l || edge.r || edge.t || edge.b, move = !grow && x >= r.l && x < r.r && y >= r.t && y < r.b;
    if (!grow && !move) return false;
    const start = {...c}, minW = CROP.min / pw, minH = CROP.min / ph, clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    if (grow) hl.classList.add('grow', ...Object.keys(edge).filter(k => edge[k]));
    const onMove = ev => {
      const dx = (ev.clientX - event.clientX) / W, dy = (ev.clientY - event.clientY) / H;
      if (move) { c.x = clamp(start.x + dx, 0, 1 - start.w); c.y = clamp(start.y + dy, 0, 1 - start.h); }
      else {
        const gx = edge.l || edge.r ? (edge.l ? -dx : dx) : 0, gy = edge.t || edge.b ? (edge.t ? -dy : dy) : 0;
        const w = clamp(start.w + 2 * gx, minW, 1), h = clamp(start.h + 2 * gy, minH, 1);
        c.w = w; c.h = h; c.x = clamp(start.x + (start.w - w) / 2, 0, 1 - w); c.y = clamp(start.y + (start.h - h) / 2, 0, 1 - h);
      }
      Object.assign(hl.style, {left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%`, height: `${c.h * 100}%`});
    };
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp); hl.className = 'gbg-crop-hl'; done(); };
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp); window.addEventListener('pointercancel', onUp);
    return true;
  }
  function render(ctx) {
    if (ctx.crop && ctx.photo) return crop(ctx);
    if (ctx.sub === 'photo' && ctx.photo) return photo(ctx);
    if (ctx.sub === 'album') return album(ctx);
    return albums(ctx);
  }
  // The Details dialog (an AlertDialog with OK): title, type, album and the taken-on date.
  function details(ctx) {
    const T = key => text(ctx.lang, key), p = ctx.photo;
    if (!p) return null;
    return {title: T('details'), icon: 'ic_dialog_info', message: `${T('title')}: ${p.name}\n${T('type')}: image/jpeg\n${T('album')}: ${albumName(M().album(p), ctx.lang)}\n${T('taken_on')}: ${T('date_unknown')}\n${T('location')}: ${p.location && window.GBMaps ? GBMaps.place(p.location.fx, p.location.fy).address : T('location_unknown')}`, buttons: [{action: 'close-overlay', title: T('details_ok')}]};
  }
  window.GBGallery = {DP, ITEM_W, ITEM_H, ALBUMS, CROP, text, albumName, render, details, cropDefault, cropDrag};
})();
