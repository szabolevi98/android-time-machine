/* Android 4.4 Launcher3 WallpaperPickerActivity (packages/apps/Launcher3/WallpaperPicker, android-4.4.4_r1).
   Theme.WallpaperPicker is fullscreen with the wallpaper showing through, and its action bar is a #88000000 overlay with
   one custom button: ic_actionbar_accept and "Set wallpaper". At the bottom sits the wallpaper strip: 2 dp tile shadows
   around a HorizontalScrollView of 106.5 × 94.5 dp tiles. The order is Pick image (the last photo under #66000000 with
   ic_images), then the images picked in this session, the default wallpaper (KitKat: getBuiltInDrawable), the bundled
   wallpapers, the saved images, and the live wallpapers with their translucent label bar. The Nexus 5's Google Now
   Launcher bundles R.array.wallpapers from GoogleHome.apk (wallpaper_15 ... wallpaper_51 with _small thumbnails), and
   its only live wallpaper is Sun Beam. Selecting a tile previews it full screen; until something is picked the current wallpaper shows. Tapping the
   preview hides or shows the strip. A long press on a picked or saved image starts the "%d selected" CAB with Delete.
   Pick image sends ACTION_GET_CONTENT image/*, which 4.4 answers with DocumentsUI "Open from" on Recent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The strip in order; keys are 'default', 'wp:<index>' (bundled, index into the simulator's wallpaper list), 'photo:<id>' and 'live:<id>'.
  function tiles(ctx) {
    const {data, ui} = ctx, wp = ui.wp || {};
    const photo = id => data.photos.find(p => p.id === id);
    const temp = (wp.temp || []).filter(photo), saved = (data.kkSavedWallpapers || []).filter(id => photo(id) && !temp.includes(id));
    return [
      ...temp.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true})),
      {key: 'default', kind: 'default'},
      ...ctx.bundled.map((name, i) => ({key: `wp:${i + 1}`, kind: 'bundled', name})),
      ...saved.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true})),
      ...ctx.live.map(spec => ({key: `live:${spec.id}`, kind: 'live', spec}))
    ];
  }
  function render(ctx) {
    const {data, ui, t} = ctx, wp = ui.wp || {}, list = tiles(ctx), checked = wp.checked || [];
    const nameless = list.filter(tile => tile.kind !== 'live');
    const last = data.photos[data.photos.length - 1];
    const sel = list.find(tile => tile.key === wp.selected);
    const preview = !sel ? '' : sel.kind === 'default' ? "url('assets/kk-default_wallpaper.jpg')" : sel.kind === 'bundled' ? `url('assets/gh-${sel.name}.jpg')` : sel.kind === 'photo' ? `url('${ctx.image(sel.photo)}')` : '';
    const tile = item => {
      const cls = `kwp-tile ${item.kind}${item.key === wp.selected && !checked.length ? ' selected' : ''}${checked.includes(item.key) ? ' checked' : ''}`;
      const label = item.kind === 'live' ? t(item.spec.label) : AndroidStrings.format(t('Wallpaper %1$d of %2$d'), nameless.indexOf(item) + 1, nameless.length);
      const img = item.kind === 'default' ? 'assets/kk-default_wallpaper.jpg' : item.kind === 'bundled' ? `assets/gh-${item.name}_small.jpg` : item.kind === 'photo' ? ctx.image(item.photo) : `assets/${item.spec.thumb}`;
      return `<button class="${cls}" data-action="kwp-tile" data-id="${e(item.key)}"${item.deletable ? ' data-kwp-long="1"' : ''} aria-label="${e(label)}" aria-pressed="${item.key === wp.selected}"><img src="${e(img)}" alt="">${item.kind === 'live' ? `<span class="kwp-label">${e(t(item.spec.label))}</span>` : ''}</button>`;
    };
    const pick = `<button class="kwp-tile pick" data-action="kwp-pick"><img src="${last ? e(ctx.image(last)) : ''}" alt=""><span class="kwp-pick-label"><img src="assets/kwp-ic_images.png" alt="">${e(t('Pick image'))}</span></button>`;
    const bar = checked.length
      ? `<div class="kwp-bar cab"><button class="kwp-cab-done" data-action="kwp-cab-done" aria-label="${e(t('Done'))}"><img src="assets/kwp-ic_cab_done_holo_dark.png" alt=""></button><b>${e(AndroidStrings.format(t('%1$d selected'), checked.length))}</b><button class="kwp-cab-delete" data-action="kwp-delete" aria-label="${e(t('Delete'))}"><img src="assets/kwp-ic_menu_delete.png" alt=""></button></div>`
      : `<div class="kwp-bar"><button class="kwp-set" data-action="kwp-set"><img src="assets/kwp-ic_actionbar_accept.png" alt="">${e(t('Set wallpaper'))}</button></div>`;
    return `<div class="app-view kwp" data-no-translate><button class="kwp-crop${preview ? ' on' : ''}" data-action="kwp-tap" aria-label="${e(t('Wallpapers'))}" style="${preview ? `background-image:${preview}` : ''}"></button>${bar}<div class="kwp-strip${wp.stripHidden ? ' hidden' : ''}"><i class="kwp-shadow top"></i><div class="kwp-scroll"><div class="kwp-list">${pick}${list.map(tile).join('')}</div></div><i class="kwp-shadow bottom"></i></div></div>`;
  }
  // DocumentsUI in ACTION_GET_CONTENT mode for image/*: the light action bar with the drawer glyph, the Recent root
  // icon and title, and the item_doc_grid cards (centerCrop thumbnail, title) of the recent images.
  function openFrom(ctx) {
    const {data, t} = ctx, photos = [...data.photos].reverse();
    const card = p => `<button class="kdu-item kwp-doc" data-action="kwp-picked" data-id="${p.id}"><span class="kdu-icon"><img class="kwp-doc-thumb" src="${e(ctx.image(p))}" alt=""></span><span class="kdu-copy"><span class="kdu-title">${e(p.name || '')}</span></span></button>`;
    return `<div class="app-view kdu-app kwp-open" data-no-translate><header class="kdu-ab"><button class="kdu-home kwp-roots" data-action="back" aria-label="${e(t('Open from'))}"><img class="kwp-glyph" src="assets/kdu-ic_drawer_glyph.png" alt=""><img src="assets/kdu-ic_root_recent.png" alt=""></button><h2>${e(t('Recent'))}</h2></header><div class="kdu-content">${photos.length ? `<div class="kdu-grid">${photos.map(card).join('')}</div>` : `<p class="kdu-empty">${e(t('No items'))}</p>`}</div></div>`;
  }
  window.KKWallpaperPicker = {tiles, render, openFrom};
})();
/* The Google Now Launcher's wallpaper picker in the 4.4.4 shell (docs/plans/engine-migration.md): the picker and
   the DocumentsUI "Open from" screen it (and Keep) opens, the tiles, the strip's mouse drag and long press, Delete, Set
   wallpaper and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, dp, galleryWallpaper, holdDelay, home, i18n, keepAttach, render, save, screen, suppressReleaseClick, toast, ui, viewport, wallpaperFiles} = c;
    const wallpaperPickerContext = () => ({data, ui, t: key => i18n.t(key), image: photo => ICSMedia.image(photo), bundled: wallpaperFiles.slice(1), live: LiveWallpapers.sorted(key => i18n.t(key), i18n.locale())});
    // Re-render the picker but keep the strip where it was scrolled.
    function wallpaperPickerRender() { const left = viewport.querySelector('.kwp-scroll')?.scrollLeft || 0; render(); const strip = viewport.querySelector('.kwp-scroll'); if (strip) strip.scrollLeft = left; }
    return {
      render() {
        switch (ui.view) {
          case 'wallpaper-picker': return KKWallpaperPicker.render(wallpaperPickerContext());
          case 'kk-doc-picker': return KKWallpaperPicker.openFrom(wallpaperPickerContext());
        }
      },
      click(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'open-wallpapers': ui.overlay = ''; ui.overview = false; ui.wp = {selected: '', temp: [], checked: [], stripHidden: false}; ui.view = 'wallpaper-picker'; render(); break;
          // Launcher3 WallpaperPickerActivity: tiles preview, the action bar sets, a long press on a picked or saved image
          // starts the delete CAB, Pick image goes through DocumentsUI.
          case 'kwp-tile': {
            const wp = ui.wp ||= {selected: '', temp: [], checked: []};
            if (wp.checked?.length) { if (button.dataset.kwpLong) { wp.checked = wp.checked.includes(id) ? wp.checked.filter(k => k !== id) : [...wp.checked, id]; wallpaperPickerRender(); } break; }
            if (id.startsWith('live:')) { ui.lwFromPicker = true; ui.view = 'live-wallpapers'; ui.sub = `preview:${id.slice(5)}`; render(); break; }
            wp.selected = id; wp.stripHidden = false; wallpaperPickerRender(); break;
          }
          case 'kwp-tap': if (ui.wp) { ui.wp.stripHidden = !ui.wp.stripHidden; viewport.querySelector('.kwp-strip')?.classList.toggle('hidden', ui.wp.stripHidden); } break;
          case 'kwp-pick': ui.docPickFor = ''; ui.view = 'kk-doc-picker'; render(); break;
          case 'kwp-picked': if (ui.docPickFor === 'keep') { ui.docPickFor = ''; keepAttach(Number(id), ui.keepPhotoTo); break; } { const wp = ui.wp ||= {selected: '', temp: [], checked: []}, pid = Number(id); wp.temp = [pid, ...(wp.temp || []).filter(x => x !== pid)]; wp.selected = `photo:${pid}`; ui.view = 'wallpaper-picker'; render(); break; }
          case 'kwp-cab-done': if (ui.wp) { ui.wp.checked = []; wallpaperPickerRender(); } break;
          case 'kwp-delete': { const wp = ui.wp, gone = new Set((wp?.checked || []).map(k => Number(k.slice(6)))); if (!wp) break; data.kkSavedWallpapers = (data.kkSavedWallpapers || []).filter(x => !gone.has(x)); wp.temp = (wp.temp || []).filter(x => !gone.has(x)); if (wp.checked.includes(wp.selected)) wp.selected = ''; wp.checked = []; save(); wallpaperPickerRender(); break; }
          case 'kwp-set': {
            const key = ui.wp?.selected || '';
            if (key === 'default' || key.startsWith('wp:')) { data.wallpaper = key === 'default' ? 0 : Number(key.slice(3)); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); }
            else if (key.startsWith('photo:')) { const photo = data.photos.find(p => p.id === Number(key.slice(6))); if (photo) { data.kkSavedWallpapers = [photo.id, ...(data.kkSavedWallpapers || []).filter(x => x !== photo.id)]; galleryWallpaper(photo, true); } }
            ui.wp = null; home(false); break;
          }
          case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
          default: return false;
        }
        return true;
      },
      back() {
        if (ui.view === 'wallpaper-picker' && ui.wp?.checked?.length) { ui.wp.checked = []; wallpaperPickerRender(); return true; }
        if (ui.view === 'kk-doc-picker') { ui.view = ui.docPickFor === 'keep' ? 'keep' : 'wallpaper-picker'; ui.docPickFor = ''; render(); return true; }
        return false;
      },
      gestureDown(event) {
        const kwpScroll = ui.view === 'wallpaper-picker' ? event.target.closest('.kwp-scroll') : null;
        if (kwpScroll) { c.pointerStart.kwpScroll = kwpScroll; c.pointerStart.kwpLeft = kwpScroll.scrollLeft; }
        const kwpLong = ui.view === 'wallpaper-picker' && !ui.wp?.checked?.length ? event.target.closest('[data-kwp-long]') : null;
        if (kwpLong) c.homeLongPressTimer = setTimeout(() => { ui.wp.checked = [kwpLong.dataset.id]; c.pointerStart = null; suppressReleaseClick(); wallpaperPickerRender(); }, holdDelay(550));
      },
      gestureMove(event, dx, dy) {
        if (c.pointerStart.kwpScroll && event.pointerType === 'mouse' && (c.pointerStart.kwpDragging || Math.abs(dx) > dp(9))) { c.pointerStart.kwpDragging = true; const k = screen.getBoundingClientRect().width / screen.offsetWidth || 1; c.pointerStart.kwpScroll.scrollLeft = c.pointerStart.kwpLeft - dx / k; c.suppressClickUntil = Date.now() + 350; event.preventDefault(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    click: (action, button, c, event) => scope(c).click(action, button, event),
    back: c => scope(c).back(),
    gestureDown: (event, c) => scope(c).gestureDown(event),
    gestureMove: (event, dx, dy, c) => scope(c).gestureMove(event, dx, dy)
  };
  if (window.KK) for (const id of ['wallpaper-picker', 'kk-doc-picker']) KK.register(id, spec);
})();
