/* Launcher3 5.1 WallpaperPickerActivity as the Google Now Launcher ships it on the Nexus 6 (LMY48Y), on the 4.4 strip
   UI it inherits: Theme.WallpaperPicker is fullscreen with the wallpaper showing through, and its action bar is a
   #88000000 overlay with one custom button: ic_actionbar_accept and "Set wallpaper". At the bottom sits the wallpaper
   strip: 2 dp tile shadows around a HorizontalScrollView of 106.5 x 94.5 dp tiles. init() fills it in this order: Pick
   image (the last photo under #66000000 with ic_images) added at index 0, then wallpaper_list, where images picked in
   this session go first, findBundledWallpapers() puts the default wallpaper and the launcher's R.array.wallpapers
   (GoogleHome.apk: wp_paper_001, wp_arc_*, wp_geo_*, with their _small thumbnails), and the saved images follow; the
   live wallpaper list stays empty because the image declares no WallpaperService, and no third-party picker remains
   after ThirdPartyWallpaperPickerListAdapter drops the live picker and image pickers. Selecting a tile previews it full
   screen; until something is picked the current wallpaper shows. Tapping the preview hides or shows the strip. A long
   press on a picked or saved image starts the "%d selected" CAB with Delete. Pick image sends ACTION_GET_CONTENT
   image/*, answered by DocumentsUI (lp-docpicker.js). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // The strip in order; keys are 'default', 'wp:<index>' (bundled, index into the simulator's wallpaper list) and 'photo:<id>'.
  function tiles(ctx) {
    const {data, ui} = ctx, wp = ui.wp || {};
    const photo = id => data.photos.find(p => p.id === id);
    const temp = (wp.temp || []).filter(photo), saved = (data.kkSavedWallpapers || []).filter(id => photo(id) && !temp.includes(id));
    return [
      ...temp.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true})),
      {key: 'default', kind: 'default'},
      ...ctx.bundled.map((name, i) => ({key: `wp:${i + 1}`, kind: 'bundled', name})),
      ...saved.map(id => ({key: `photo:${id}`, kind: 'photo', photo: photo(id), deletable: true}))
    ];
  }
  function render(ctx) {
    const {data, ui, t} = ctx, wp = ui.wp || {}, list = tiles(ctx), checked = wp.checked || [];
    const last = data.photos[data.photos.length - 1];
    const sel = list.find(tile => tile.key === wp.selected);
    const preview = !sel ? '' : sel.kind === 'default' ? "url('assets/lp-default_wallpaper.jpg')" : sel.kind === 'bundled' ? `url('assets/gh-${sel.name}.jpg')` : `url('${ctx.image(sel.photo)}')`;
    const tile = item => {
      const cls = `kwp-tile ${item.kind}${item.key === wp.selected && !checked.length ? ' selected' : ''}${checked.includes(item.key) ? ' checked' : ''}`;
      const label = AndroidStrings.format(t('Wallpaper %1$d of %2$d'), list.indexOf(item) + 1, list.length);
      const img = item.kind === 'default' ? 'assets/lp-default_wallpaper.jpg' : item.kind === 'bundled' ? `assets/gh-${item.name}_small.jpg` : ctx.image(item.photo);
      return `<button class="${cls}" data-action="kwp-tile" data-id="${e(item.key)}"${item.deletable ? ' data-kwp-long="1"' : ''} aria-label="${e(label)}" aria-pressed="${item.key === wp.selected}"><img src="${e(img)}" alt=""></button>`;
    };
    const pick = `<button class="kwp-tile pick" data-action="kwp-pick"><img src="${last ? e(ctx.image(last)) : ''}" alt=""><span class="kwp-pick-label"><img src="assets/kwp-ic_images.png" alt="">${e(t('Pick image'))}</span></button>`;
    const bar = checked.length
      ? `<div class="kwp-bar cab"><button class="kwp-cab-done" data-action="kwp-cab-done" aria-label="${e(t('Done'))}"><img src="assets/kwp-ic_cab_done_holo_dark.png" alt=""></button><b>${e(AndroidStrings.format(t('%1$d selected'), checked.length))}</b><button class="kwp-cab-delete" data-action="kwp-delete" aria-label="${e(t('Delete'))}"><img src="assets/kwp-ic_menu_delete.png" alt=""></button></div>`
      : `<div class="kwp-bar"><button class="kwp-set" data-action="kwp-set"><img src="assets/kwp-ic_actionbar_accept.png" alt="">${e(t('Set wallpaper'))}</button></div>`;
    return `<div class="app-view kwp" data-no-translate><button class="kwp-crop${preview ? ' on' : ''}" data-action="kwp-tap" aria-label="${e(t('Wallpapers'))}" style="${preview ? `background-image:${preview}` : ''}"></button>${bar}<div class="kwp-strip${wp.stripHidden ? ' hidden' : ''}"><i class="kwp-shadow top"></i><div class="kwp-scroll"><div class="kwp-list">${pick}${list.map(tile).join('')}</div></div><i class="kwp-shadow bottom"></i></div></div>`;
  }
  window.KKWallpaperPicker = {tiles, render};
})();
