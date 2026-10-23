/* Android 6.0.1 wallpapers: Launcher3's picker as GEL runs it (GelWallpaperPickerActivity in Velvet 5.3.27, the screen
   'wallpapers'), its crop screen, and Live Wallpapers (LiveWallpapersPicker, the screen 'live-wallpapers').
   - What the picker lists (WallpaperPickerActivity.init): the "My photos" tile first (wallpaper_picker_image_picker_item:
     the newest photo's thumbnail under wallpaper_picker_translucent_gray #66000000, ic_images over pick_image), then the
     bundled wallpapers: GelWallpaperPickerActivity.getWallpaperArrayResourceId reads the "wallpapers" meta-data of
     com.google.android.launcher (GoogleHome 1.2, a code-less stub: array/wallpapers = wp_001 … wp_009, each with its
     wp_00N_small tile), after the default wallpaper's tile (framework default_wallpaper, added at index 0); then the pictures set before (SavedWallpaperImages), the live wallpapers (none: no app of the
     image has a WallpaperService) and the third-party pickers (ThirdPartyWallpaperPickerListAdapter leaves out the live
     wallpaper picker and Photos, which also answers GET_CONTENT for images: none left).
   - wallpaper_picker.xml: the picture fills the screen (CropView) under the WallpaperCropperActionBar (#88000000) with
     actionbar_set_wallpaper.xml ("Set wallpaper" after ic_actionbar_accept, 8 dp apart); at the foot the strip between
     tile_shadow_top and tile_shadow_bottom of 106.5 x 94.5 dp tiles (wallpaperThumbnailWidth / Height, centre-cropped),
     the chosen one under wallpaper_tile_fg's ic_tick (48 dp, inset 29.25 / 23.25 dp).
   - "My photos" sends GET_CONTENT for images: DocumentsUI answers it at priority 100, so it opens (mm-smallapps.js) and
     the picture chosen there comes back as a new tile, chosen. Photos' "Select Wallpaper" (from Settings) hands its
     picture to the crop screen (WallpaperCropActivity: the same bar, no strip).
   - The wallpaper is c.data.wallpaper: null (default_wallpaper) or {photo: id}; MM.applyWallpaper puts it in
     --mm-wallpaper on the screen, which the home screen, apps list, widgets list, recents and keyguard draw.
   - Live Wallpapers (LivePickerTheme, Theme.Holo): live_wallpaper_list.xml's empty text "No live wallpapers.". */
(() => {
  'use strict';
  const T = () => MM.text('wallpapers');
  const esc = (c, s) => c.safe(s);
  const photo = (c, id) => MM.media?.photos(c).find(p => p.id === +id);
  const svgUrl = p => `url('data:image/svg+xml,${encodeURIComponent(MM.media.svg(p, '').replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ')).split("'").join('%27')}')`;
  const DEFAULT = "url('assets/fw-default_wallpaper.jpg')";
  const BUNDLED = Array.from({length: 9}, (_, i) => `wp_00${i + 1}`), bundled = sel => BUNDLED.includes(sel);
  const imageOf = (c, sel) => { if (bundled(sel)) return `url('assets/ghome-${sel}.jpg')`; const p = sel === 'default' ? null : photo(c, sel); return p ? svgUrl(p) : DEFAULT; };

  MM.applyWallpaper = c => {
    const w = c.data.wallpaper, p = w?.photo ? photo(c, w.photo) : null;
    if (bundled(w?.res)) c.el.screen.style.setProperty('--mm-wallpaper', imageOf(c, w.res));
    else if (p) c.el.screen.style.setProperty('--mm-wallpaper', svgUrl(p)); else c.el.screen.style.removeProperty('--mm-wallpaper');
  };
  const ui = c => c.ui.wallpapers || (c.ui.wallpapers = {sel: null, temp: null, crop: null});

  function render(c) {
    const t = T(), u = ui(c), sub = c.ui.sub || '';
    if (sub) { c.ui.sub = ''; if (sub.startsWith('crop:')) u.crop = +sub.slice(5); }
    const saved = (c.data.savedWallpapers || []).filter(id => photo(c, id));
    if (u.sel === null) u.sel = c.data.wallpaper?.photo || (bundled(c.data.wallpaper?.res) ? c.data.wallpaper.res : 'default');
    const shown = u.crop ? imageOf(c, u.crop) : imageOf(c, u.sel);
    const bar = `<button type="button" class="mmwl-set" data-action="mmwl-set"><img src="assets/vv-ic_actionbar_accept.png" alt=""><span>${esc(c, t.t('Velvet/wallpaper_instructions'))}</span></button>`;
    if (u.crop) return `<div class="mmwl"><div class="mmwl-crop" style="background-image:${shown}"></div><div class="mmwl-bar">${bar}</div></div>`;
    const tick = '<i class="mmwl-tick"></i>';
    const newest = (MM.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video').sort((a, b) => b.time - a.time)[0];
    const tiles = [`<button type="button" class="mmwl-tile pick" data-action="mmwl-pick">${newest ? MM.media.svg(newest, 'mmwl-svg', 106.5 / 94.5) : ''}<i class="mmwl-gray"></i><span><img src="assets/vv-ic_images.png" alt="">${esc(c, t.t('Velvet/pick_image'))}</span></button>`,
      `<button type="button" class="mmwl-tile def" data-action="mmwl-tile" data-id="default">${u.sel === 'default' ? tick : ''}</button>`,
      ...BUNDLED.map(id => `<button type="button" class="mmwl-tile" data-action="mmwl-tile" data-id="${id}" style="background-image:url('assets/ghome-${id}_small.jpg')">${u.sel === id ? tick : ''}</button>`),
      ...[...new Set([...(u.temp ? [u.temp] : []), ...saved])].map(id => `<button type="button" class="mmwl-tile" data-action="mmwl-tile" data-id="${id}">${MM.media.svg(photo(c, id), 'mmwl-svg', 106.5 / 94.5)}${String(u.sel) === String(id) ? tick : ''}</button>`)];
    return `<div class="mmwl"><div class="mmwl-crop" style="background-image:${shown}"></div><div class="mmwl-bar">${bar}</div>
      <div class="mmwl-strip"><i class="np-vv-tile_shadow_top"></i><div class="mmwl-tiles">${tiles.join('')}</div><i class="np-vv-tile_shadow_bottom"></i></div></div>`;
  }

  function set(c, sel) {
    const id = sel === 'default' || bundled(sel) ? null : +sel;
    c.data.wallpaper = id ? {photo: id} : bundled(sel) ? {res: sel} : null;
    // A picture set as the wallpaper is kept as a tile (SavedWallpaperImages).
    if (id) c.data.savedWallpapers = [id, ...(c.data.savedWallpapers || []).filter(x => x !== id)];
    c.save(); MM.applyWallpaper(c);
    c.ui.wallpapers = null; c.home();
  }

  // The picture chosen in DocumentsUI comes back as a new tile, chosen (addTemporaryWallpaperTile).
  MM.wallpaperPicked = (c, id) => { const u = ui(c); u.temp = id; u.sel = id; };
  MM.register('wallpapers', {
    app: false,
    statusColor: () => 'rgba(0,0,0,.25)',
    render,
    back(c) { c.ui.wallpapers = null; return false; },
    action(name, el, event, c) {
      const u = ui(c);
      if (name === 'mmwl-tile') { const id = el.dataset.id; u.sel = id === 'default' || bundled(id) ? id : +id; c.render(); return true; }
      if (name === 'mmwl-pick') { c.open('downloads', 'pick:wallpaper'); return true; }
      if (name === 'mmwl-set') { set(c, u.crop || u.sel); return true; }
      return false;
    },
    // The wallpaper of the saved data, once the page is up.
    tick(c) { if (!this.applied) { this.applied = true; MM.applyWallpaper(c); } }
  });

  MM.register('live-wallpapers', {
    statusColor: () => '#000',
    render(c) {
      const t = T();
      return `<div class="mmwl-live"><div class="mmwl-lbar"><img src="assets/lw-ic_launcher_live_wallpaper.png" alt=""><span>${esc(c, t.t('LiveWallpapersPicker/live_wallpaper_picker_label'))}</span></div><div class="mmwl-empty">${esc(c, t.t('LiveWallpapersPicker/live_wallpaper_empty'))}</div></div>`;
    }
  });
})();
