/* Photos on the Nexus 6 (LMY48Y): com.google.android.apps.photos 1.0.2 is a trampoline into Google+ 4.9.0
   (PlusOne.apk), PhotosHomeActivity in Theme.Photos.Material: the 56 dp white action bar (photos_actionbar_background,
   colorPrimaryDark black) with the drawer toggle and the view's title, quantum_ic_search_grey600_24 and
   quantum_ic_more_vert_grey600_24. photos_home_activity.xml's drawer (NavigationBarLayout on #e5e5e5):
   selected_account.xml (the cover, the 56 dp round avatar 16 dp in, the name and the account in white over 64 dp),
   then host_navigation_item.xml rows on switcher_background #f3f3f3 (48 dp, 16 dp in, the 24 dp icon 32 dp before the
   14 sp medium text) in PhotosHomeActivity's order: Photos, Albums, Auto Awesome, Videos, Photos of you, On device,
   Trash (quantum_ic_photo_library / photo_album / auto_awesome / play_circle_fill / tag_faces / folder / delete).
   hosted_photos_home_fragment.xml: the tab strip over play_checker_tile with equal tabs (CAMERA and HIGHLIGHTS: the
   "tabs" mask turns ALL into CAMERA, 14 sp #505050, the #4285f4 underline) on white, the 2 dp grid three across with
   all_folders_tile_view.xml first; HIGHLIGHTS groups the days. Search (hosted_photo_tile_search_fragment.xml): the
   instructions in body 1 secondary black with quantum_ic_person / location_on / landscape, then the matches. The one-up
   view is black with photo_action_bar.xml: Edit on ov_circle_blue_40 (quantum_ic_create_white_24), Share and Delete
   (white 24 dp). The texts are the APK's (stock-strings.js, group photos). Pictures are the simulator's own. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const P = (ctx, key) => { const row = window.StockStrings?.photos?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), key) : ctx.t(key); };
  const newest = photos => [...photos].sort((a, b) => (b.created || b.id || 0) - (a.created || a.id || 0));
  const VIEWS = [['photos', 'Photos', 'photo_library'], ['albums', 'Albums', 'photo_album'], ['auto-awesome', 'Auto Awesome', 'auto_awesome'], ['videos', 'Videos', 'play_circle_fill'], ['of-you', 'Photos of you', 'tag_faces'], ['folders', 'On device', 'folder'], ['trash', 'Trash', 'delete']];
  const thumb = (ctx, photo, list) => { const sel = Array.isArray(ctx.ui.photosSelect) ? ctx.ui.photosSelect.includes(photo.id) : null; return `<button class="ph-thumb${sel ? ' ph-picked' : ''}" data-action="${sel === null ? 'photos-open' : 'photos-pick'}" data-id="${photo.id}" data-list="${list}" aria-label="${e(photo.name)}"${sel === null ? '' : ` aria-pressed="${sel}"`}><img src="${ctx.media.image(photo)}" alt="">${window.GPVideo.tile(photo)}${sel === null ? '' : `<img class="ph-sel" src="assets/gp4-ov_selected_${sel ? 'on' : 'off'}_32.png" alt="">`}</button>`; };
  const iconBtn = (name, label, src) => `<button class="ph-btn" data-action="${name}" aria-label="${e(label)}"><img src="assets/gp4-${src}.png" alt=""></button>`;
  /* Select… (host_menu.xml select_photos): the picker's selection mode 4 — the CAB (cab_solid_light_holo, cab_done's
     ic_cab_done_holo_light, the divider and the count as cab_title) with Share and Delete photos once something is
     picked (Copy to album is for the account's web albums), the tiles with ov_selected_off / _on; Delete asks
     with delete_local_photo_dialog_message (Cancel / Delete). */
  const picked = ctx => Array.isArray(ctx.ui.photosSelect) ? ctx.ui.photosSelect : null;
  function cab(ctx) {
    const n = picked(ctx).length, icon = (name, label, src) => `<button class="ph-btn" data-action="${name}" aria-label="${e(label)}"><img src="assets/${src}.png" alt=""></button>`;
    return `<header class="ph-bar ph-cab"><button class="ph-cab-done" data-action="photos-select-done" aria-label="${e(P(ctx, 'Navigate up'))}"><img src="assets/gp4-ic_cab_done_holo_light.png" alt=""></button><i class="ph-cab-divider"></i>${n ? `<h2>${n}</h2>` : ''}<span class="ph-gap"></span>${n ? icon('photos-select-share', P(ctx, 'Share'), 'gp4-quantum_ic_share_grey600_24') + icon('photos-select-delete', P(ctx, 'Delete photos'), 'gp4-quantum_ic_delete_grey600_24') : ''}</header>`;
  }
  function deleteDialog(ctx) {
    const n = picked(ctx)?.length || 0, q = key => P(ctx, `${key}.${n === 1 ? 'one' : 'other'}`);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${e(P(ctx, 'Delete photos'))}"><p>${e(q('dellocal'))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${e(P(ctx, 'Cancel'))}</button><button data-action="photos-select-confirm">${e(P(ctx, 'Delete'))}</button></div></div>`;
  }
  /* Settings (home_menu_settings): accounts_preferences_common.xml's General Settings (Auto Backup), the account's
     photos_preferences.xml (Google Drive, Photo Location, Auto Enhance, Auto Awesome with its movies, Find My Face),
     accounts_preferences_photos.xml's About and the Account Settings; Auto Backup is auto_backup_preferences.xml with
     the XML's defaults. The values stay on the phone (data.photosPrefs); nothing is uploaded or sent to the account, so
     Get more storage, Back up all, the About pages and Add account say so. */
  const PREFS = {autoBackup: false, photoSize: 'FULL', photoConnection: 'WIFI_ONLY', videoConnection: 'WIFI_ONLY', roaming: false, onBattery: true,
    drive: true, location: true, enhance: true, awesome: true, awesomeMovies: true, findMyFace: true};
  const LISTS = {photoSize: [['FULL', 'Full size'], ['STANDARD', 'Standard size']], photoConnection: [['WIFI_OR_MOBILE', 'Over Wi-Fi or mobile network'], ['WIFI_ONLY', 'Over Wi-Fi only']],
    videoConnection: [['WIFI_OR_MOBILE', 'Over Wi-Fi or mobile network'], ['WIFI_ONLY', 'Over Wi-Fi only']]};
  const LIST_TITLES = {photoSize: 'Photo size', photoConnection: 'Back up photos', videoConnection: 'Back up videos'};
  const pref = (ctx, key) => ({...PREFS, ...ctx.data.photosPrefs})[key];
  const ACCOUNT = 'nexus6.demo@gmail.com';
  function prefsPage(ctx) {
    const section = title => `<h4 class="ph-pref-head">${e(title)}</h4>`;
    const row = (title, summary, action, id = '', off = false) => `<button class="ph-pref" data-action="${action}" data-id="${e(id)}"${off ? ' disabled' : ''}><span>${title ? `<b>${e(title)}</b>` : ''}${summary ? `<small>${e(summary)}</small>` : ''}</span></button>`;
    const check = (title, summary, key, off = false) => { const on = !!pref(ctx, key); return `<button class="ph-pref" data-action="photos-pref" data-id="${key}" role="checkbox" aria-checked="${on}"${off ? ' disabled' : ''}><span>${title ? `<b>${e(title)}</b>` : ''}${summary ? `<small>${e(summary)}</small>` : ''}</span><img class="ph-pref-check" src="assets/btn_check_${on ? 'on' : 'off'}_holo_light.png" alt=""></button>`; };
    const list = (key, summary) => row(P(ctx, LIST_TITLES[key]), summary ?? P(ctx, LISTS[key].find(([v]) => v === pref(ctx, key))?.[1]), 'photos-pref-list', key);
    const toast = (title, summary = '') => row(title, summary, 'photos-pref-online');
    if (ctx.ui.sub === 'settings-backup') {
      const conn = key => P(ctx, pref(ctx, key) === 'WIFI_ONLY' ? 'Only when there is a Wi-Fi connection available' : 'When there is a Wi-Fi or mobile data connection available');
      return {title: P(ctx, 'Auto Backup'), body: check(P(ctx, 'Turn on Auto Backup'), P(ctx, 'Automatically back up new photos and videos to Google+. Backups are for your eyes only.'), 'autoBackup')
        + section(P(ctx, 'Account')) + row(ACCOUNT, '', 'noop')
        + section(P(ctx, 'Backup Storage')) + list('photoSize', pref(ctx, 'photoSize') === 'STANDARD' ? `${P(ctx, 'Standard size')} · ${P(ctx, 'Unlimited free storage at 2048 px')}` : P(ctx, 'Full size')) + toast(P(ctx, 'Get more storage'), P(ctx, 'Purchase additional storage for full-size photos'))
        + section(P(ctx, 'Backup Settings')) + list('photoConnection', conn('photoConnection')) + list('videoConnection', conn('videoConnection'))
        + check(P(ctx, 'Roaming'), P(ctx, 'Back up photos & videos when roaming on a data network'), 'roaming') + check(P(ctx, 'While charging only'), P(ctx, 'Back up photos & videos only when a charger is connected'), 'onBattery')
        + toast(P(ctx, 'Back up all'), P(ctx, 'Back up all photos & videos now (if connection settings allow)'))
        + section(P(ctx, 'About')) + toast(P(ctx, 'About Auto Backup'), P(ctx, 'Learn more about storing photos with Google+'))};
    }
    return {title: P(ctx, 'Settings'), body: section(P(ctx, 'General Settings')) + row(P(ctx, 'Auto Backup'), P(ctx, 'Automatically back up new photos and videos to Google+. Backups are for your eyes only.'), 'photos-settings-backup')
      + section(ACCOUNT) + check(P(ctx, 'Google Drive'), P(ctx, 'See your Drive photos and videos in Google Photos.'), 'drive') + check(P(ctx, 'Photo Location'), P(ctx, 'location summary'), 'location')
      + check(P(ctx, 'Auto Enhance'), P(ctx, 'enhance summary'), 'enhance')
      + section(P(ctx, 'Auto Awesome')) + check('', P(ctx, 'awesome summary'), 'awesome') + check('', P(ctx, 'awesome movies summary'), 'awesomeMovies', !pref(ctx, 'awesome'))
      + section(P(ctx, 'Find My Face')) + check('', P(ctx, 'fmf summary'), 'findMyFace') + toast(P(ctx, 'About Find My Face'))
      + section(P(ctx, 'About')) + toast(P(ctx, 'About Google Photos')) + section(P(ctx, 'Account Settings')) + toast(P(ctx, 'Add account'))};
  }
  function prefDialog(ctx) {
    const key = ctx.ui.photosPrefList, current = pref(ctx, key);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog ph-pref-dialog" role="dialog" aria-label="${e(P(ctx, LIST_TITLES[key]))}"><h3>${e(P(ctx, LIST_TITLES[key]))}</h3>${LISTS[key].map(([v, label]) => `<button class="ph-pref-radio" data-action="photos-pref-pick" data-id="${v}" role="radio" aria-checked="${v === current}"><span>${e(P(ctx, label))}</span><i class="${v === current ? 'on' : ''}"></i></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(P(ctx, 'Cancel'))}</button></div></div>`;
  }
  function bar(ctx, {up, title, actions = ''}) {
    if (picked(ctx) && !up) return cab(ctx);
    const start = up
      ? `<button class="ph-up" data-action="back" aria-label="${e(P(ctx, 'Navigate up'))}"><img src="assets/gp4-quantum_ic_arrow_back_grey600_24.png" alt=""></button>`
      : `<button class="ph-up ph-toggle" data-action="photos-drawer" aria-label="${e(P(ctx, 'Photos'))}"><i></i><i></i><i></i></button>`;
    return `<header class="ph-bar">${start}<h2>${e(title || '')}</h2>${actions}${iconBtn('photos-menu', ctx.t('More options'), 'quantum_ic_more_vert_grey600_24')}</header>`;
  }
  function camera(ctx) {
    const photos = newest(ctx.data.photos || []), cover = photos[0];
    const folders = `<button class="ph-thumb ph-folders" data-action="photos-folders" aria-label="${e(P(ctx, 'Folders'))}">${cover ? `<img src="${ctx.media.image(cover)}" alt="">` : ''}<span><img src="assets/gp4-ic_folder_white_20.png" alt="">${e(P(ctx, 'Folders'))}</span></button>`;
    return `<div class="ph-grid">${folders}${photos.map(p => thumb(ctx, p, 'camera')).join('')}</div>`;
  }
  function highlights(ctx) {
    const days = new Map();
    for (const photo of newest(ctx.data.photos || [])) {
      const date = photo.created ? new Date(photo.created) : null, key = date ? date.toDateString() : 'unknown';
      if (!days.has(key)) days.set(key, {date, items: []});
      days.get(key).items.push(photo);
    }
    if (!days.size) return `<p class="ph-empty">${e(ctx.t('No photos'))}</p>`;
    return [...days.values()].map(day => `<section class="ph-day"><header class="ph-day-head"><h3>${e(day.date ? day.date.toLocaleDateString(ctx.locale, {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'}) : ctx.t('Earlier'))}</h3><button class="ph-share" data-action="photos-share-day" data-id="${day.items[0].id}" aria-label="${e(P(ctx, 'Share'))}"><img src="assets/gp4-quantum_ic_share_grey600_24.png" alt=""></button></header><div class="ph-grid">${day.items.map(p => thumb(ctx, p, 'highlights')).join('')}</div></section>`).join('');
  }
  function folders(ctx) {
    return `<div class="ph-grid ph-albums">${ctx.groups.map(group => `<button class="ph-thumb ph-folder" data-action="photos-folder" data-id="${e(group.key)}">${group.items[0] ? `<img src="${ctx.media.image(group.items[0])}" alt="">` : ''}<span>${e(group.translate ? ctx.t(group.name) : group.name)}</span></button>`).join('') || `<p class="ph-empty">${e(ctx.t('No photos'))}</p>`}</div>`;
  }
  function search(ctx) {
    const q = String(ctx.ui.photosQuery || ''), query = q.trim().toLocaleLowerCase();
    const found = query ? newest(ctx.data.photos || []).filter(p => [p.name, p.album].join(' ').toLocaleLowerCase().includes(query)) : [];
    const body = !query
      ? `<div class="ph-search-help"><p>${e(P(ctx, 'Search instructions'))}</p><p class="ph-search-icons"><img src="assets/gp4-quantum_ic_person_grey600_24.png" alt=""><img src="assets/gp4-quantum_ic_location_on_grey600_24.png" alt=""><img src="assets/gp4-quantum_ic_landscape_grey600_24.png" alt=""></p><p class="ph-search-examples">${e(P(ctx, 'Search examples'))}</p></div>`
      : found.length ? `<h4 class="ph-search-head">${e(P(ctx, 'Camera & folders'))}</h4><div class="ph-grid">${found.map(p => thumb(ctx, p, 'search')).join('')}</div>`
      : `<p class="ph-empty">${AndroidStrings.format(P(ctx, 'No photos found for %s'), e(q))}</p>`;
    return `<div class="app-view ph-app"><header class="ph-bar ph-search-bar"><button class="ph-up" data-action="back" aria-label="${e(P(ctx, 'Navigate up'))}"><img src="assets/gp4-quantum_ic_arrow_back_grey600_24.png" alt=""></button><input data-photos-search value="${e(q)}" placeholder="${e(P(ctx, 'Search for photos'))}" aria-label="${e(P(ctx, 'Search for photos'))}" autocomplete="off" spellcheck="false"></header><div class="ph-scroll">${body}</div></div>`;
  }
  function viewer(ctx) {
    const {ui, list} = ctx, photo = list[ui.photosIndex] || list[0];
    if (!photo) return '';
    return `<div class="app-view ph-app ph-viewer-view${ui.photosChrome === false ? ' ph-bare' : ''}"><div class="ph-viewer" data-action="${photo.sphere ? 'photos-sphere' : photo.refocus ? 'photos-refocus' : 'photos-toggle-bars'}"><img src="${ctx.media.image(photo)}" alt="${e(photo.name)}" draggable="false">${window.GPVideo.viewerIcon(photo, ctx.t('Play video'))}</div>${bar(ctx, {up: true})}<nav class="ph-actionbar">${photo.video ? '' : `<button class="ph-edit" data-action="photos-edit" aria-label="${e(P(ctx, 'Edit'))}"><img src="assets/gp4-quantum_ic_create_white_24.png" alt=""></button>`}<button data-action="gallery-share-message" aria-label="${e(P(ctx, 'Share'))}"><img src="assets/gp4-quantum_ic_share_white_24.png" alt=""></button><button data-action="photos-delete" aria-label="${e(P(ctx, 'Delete'))}"><img src="assets/gp4-quantum_ic_delete_white_24.png" alt=""></button></nav></div>`;
  }
  function list(ctx) {
    const {data, ui, groups} = ctx;
    if (ui.photosList === 'folder') return groups.find(group => group.key === ui.photosFolder)?.items || [];
    if (ui.photosList === 'videos') return newest((data.photos || []).filter(p => p.video));
    if (ui.photosList === 'search') { const q = String(ui.photosQuery || '').trim().toLocaleLowerCase(); return newest(data.photos || []).filter(p => [p.name, p.album].join(' ').toLocaleLowerCase().includes(q)); }
    return newest(data.photos || []);
  }
  // The drawer: selected_account.xml over the navigation items.
  function drawer(ctx) {
    if (!ctx.ui.photosSpinner) return '';
    const view = ctx.ui.photosView || 'photos';
    return `<button class="ph-drawer-scrim" data-action="photos-drawer" aria-label="${e(ctx.t('Close'))}"></button><nav class="ph-drawer"><div class="ph-account"><span class="ph-account-avatar">N</span><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div><div class="ph-nav">${VIEWS.map(([id, key, icon]) => `<button class="${view === id ? 'on' : ''}" data-action="photos-view" data-id="${id}"><img src="assets/gp4-quantum_ic_${icon}_grey600_24.png" alt=""><span>${e(P(ctx, key))}</span></button>`).join('')}</div></nav>`;
  }
  function render(ctx) {
    const {ui} = ctx;
    ctx.list = list(ctx);
    if (ui.sub === 'photo') return viewer(ctx);
    // A photo sphere: the touch on it opens the photo sphere view (lp-sphere.js).
    // A Lens Blur picture: the camera's RefocusActivity viewer (lp-refocus.js).
    if (ui.sub === 'refocus') { const photo = ctx.list[ui.photosIndex]; if (photo?.refocus && ui.refocusEdit) return window.LPRefocus.viewer(photo, ctx.media, ctx.t, ui.refocusEdit); return viewer(ctx); }
    if (ui.sub === 'sphere') { const photo = ctx.list[ui.photosIndex]; if (photo?.sphere) return window.LPSphere.viewer(photo, ctx.media, ctx.t); return viewer(ctx); }
    // Edit: Google+'s photo editor (plus-editor.js).
    if (ui.sub === 'edit' && window.PlusEditor) return PlusEditor.render(ctx);
    // VideoViewActivity (photos-video.js).
    if (ui.sub === 'video') { const photo = ctx.list[ui.photosIndex]; if (photo?.video) return window.GPVideo.render(photo, ctx); }
    if (ui.sub === 'search') return search(ctx);
    if (ui.sub === 'settings' || ui.sub === 'settings-backup') { const page = prefsPage(ctx); return `<div class="app-view ph-app">${bar(ctx, {up: true, title: page.title})}<div class="ph-scroll ph-prefs">${page.body}</div></div>`; }
    if (ui.sub === 'folders') return `<div class="app-view ph-app">${bar(ctx, {up: true, title: P(ctx, 'Folders')})}<div class="ph-scroll">${folders(ctx)}</div></div>`;
    if (ui.sub === 'folder') {
      const group = ctx.groups.find(item => item.key === ui.photosFolder);
      return `<div class="app-view ph-app">${bar(ctx, {up: true, title: group ? (group.translate ? ctx.t(group.name) : group.name) : P(ctx, 'Folders')})}<div class="ph-scroll"><div class="ph-grid">${(group?.items || []).map(p => thumb(ctx, p, 'folder')).join('')}</div></div></div>`;
    }
    const view = ui.photosView || 'photos', title = P(ctx, VIEWS.find(([id]) => id === view)[1]);
    const actions = iconBtn('photos-search', P(ctx, 'Search photos'), 'quantum_ic_search_grey600_24');
    if (view === 'folders') return `<div class="app-view ph-app">${bar(ctx, {title, actions})}<div class="ph-scroll">${folders(ctx)}</div>${drawer(ctx)}</div>`;
    const videos = newest((ctx.data.photos || []).filter(p => p.video));
    if (view === 'videos' && videos.length) return `<div class="app-view ph-app">${bar(ctx, {title, actions})}<div class="ph-scroll"><div class="ph-grid">${videos.map(p => thumb(ctx, p, 'videos')).join('')}</div></div>${drawer(ctx)}</div>`;
    if (view !== 'photos') return `<div class="app-view ph-app">${bar(ctx, {title, actions})}<div class="ph-scroll"><p class="ph-empty">${e(ctx.t('No photos'))}</p></div>${drawer(ctx)}</div>`;
    const tab = ui.photosTab || 'camera';
    return `<div class="app-view ph-app">${bar(ctx, {title, actions})}<nav class="ph-tabs">${[['camera', 'CAMERA'], ['highlights', 'HIGHLIGHTS']].map(([id, label]) => `<button class="${tab === id ? 'active' : ''}" data-action="photos-tab" data-id="${id}">${e(P(ctx, label))}</button>`).join('')}</nav><div class="ph-scroll">${tab === 'highlights' ? highlights(ctx) : camera(ctx)}</div>${drawer(ctx)}</div>`;
  }
  function menu(ctx) {
    const {ui} = ctx, item = (name, label) => `<button data-action="${name}" role="menuitem">${e(P(ctx, label))}</button>`;
    const items = ui.sub === 'photo'
      ? [item('photos-details', 'Photo details'), item('photos-unsupported', 'Print'), ...(ctx.data && list(ctx).length > 1 ? [item('photos-slideshow', 'Slideshow')] : []), item('photos-wallpaper', 'Set as'), item('photos-download', 'Download')]
      : [item('photos-select', 'Select photos'), item('photos-settings', 'Settings'), item('photos-unsupported', 'Send feedback'), item('photos-unsupported', 'Help')];
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="ph-menu" role="menu">${items.join('')}</div>`;
  }
  window.PhotosApp = {render, menu, list, VIEWS, deleteDialog, prefDialog, PREFS, LISTS};
})();
