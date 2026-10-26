/* KitKat's Gallery: GalleryGoogle 1.1.40304 of the KTU84P image, the same Gallery2 as Jelly Bean 4.3's 1.1.40012 apart
   from details (menu/photo.xml adds Print for the 4.4 print framework): AlbumSetPage / AlbumPage slot grids that scroll
   sideways, the clustering spinner, PhotoPage with film mode, and a reduced FilterShow photo editor. Pictures are the
   simulator's own illustrations. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // menu/photo.xml's Print (print_image) in GalleryGoogle 1.1.40304's words.
  const PRINT = {res: "GalleryGoogle:print_image", "hu": "Nyomtatás", "de": "Drucken", "fr": "Imprimer", "es": "Imprimir"};
  const DP = .9;
  // Config.AlbumSetPage / AlbumPage, PositionController and PhotoPage constants.
  const G = {setRows: 3, setGap: 7 * DP, setPad: 7 * DP, labelHeight: 30 * DP, albumRows: 4, albumGap: 5 * DP,
    filmWidth: .7, filmHeight: .48, imageGap: 16 * DP, snapBack: 600, hideBars: 3500, slide: 300};
  // "People" here means faces; the zero-width space keeps it apart from the People app name in translations.
  const CLUSTERS = [['album', 'Albums'], ['location', 'Locations'], ['time', 'Times'], ['people', 'People​'], ['tag', 'Tags']];
  const BORDERS = [['', 'None'], ['black', 'Black'], ['white', 'White'], ['rounded', 'Rounded'], ['film', 'Film']];
  const ADJUST = [['autocolor', 'Autocolor', 0, 1, 1, 0], ['exposure', 'Exposure', -3, 3, 1, 0], ['vignette', 'Vignette', 0, 1, .05, 0], ['contrast', 'Contrast', .5, 1.5, .05, 1], ['saturation', 'Saturation', 0, 2, .05, 1], ['hue', 'Hue', -180, 180, 5, 0]];
  const GEOMETRY = [['rotate', 'Rotate'], ['mirror', 'Mirror']];
  const albumOf = photo => photo.album || (photo.id <= 4 ? 'pictures' : 'camera');

  // FilterUtils clustering: albums, one "No location" group, day clusters by capture time, no faces, "Untagged".
  function groups(data, cluster, locale = 'en-US') {
    const photos = data.photos || [];
    if (cluster === 'location') return photos.length ? [{key: 'location:none', name: 'No location', items: photos}] : [];
    if (cluster === 'people') return [];
    if (cluster === 'tag') return photos.length ? [{key: 'tag:none', name: 'Untagged', items: photos}] : [];
    if (cluster === 'time') {
      const map = new Map();
      for (const photo of photos) {
        const day = photo.created ? new Date(photo.created) : null, key = day ? `time:${day.getFullYear()}-${day.getMonth()}-${day.getDate()}` : 'time:unknown';
        if (!map.has(key)) map.set(key, {key, name: day ? day.toLocaleDateString(locale, {month: 'short', day: 'numeric', year: 'numeric'}) : 'Unknown', translate: !day, items: []});
        map.get(key).items.push(photo);
      }
      return [...map.values()];
    }
    return [['camera', 'Camera', true], ['pictures', 'Pictures', true], ['download', 'Download', false]].map(([key, name, translate]) => ({key, name, translate, items: photos.filter(p => albumOf(p) === key)})).filter(group => group.items.length);
  }
  function items(data, ui, locale) {
    const cluster = ui.galleryCluster || 'album';
    return groups(data, cluster, locale).find(group => group.key === ui.galleryAlbum)?.items || (cluster === 'album' && ['camera', 'pictures'].includes(ui.galleryAlbum) ? (data.photos || []).filter(p => albumOf(p) === ui.galleryAlbum) : []);
  }
  // PositionController film mode: the picture fits in 70% x 48% of a portrait screen.
  function fit(photo, width, height, film) {
    const rotated = ((Number(photo.rotation) || 0) % 180 + 180) % 180 !== 0, w = photo.sphere ? 4096 : photo.pano ? 3072 : rotated ? 768 : 1024, h = photo.sphere ? 2048 : rotated && !photo.pano ? 1024 : 768;
    const k = Math.min((film ? G.filmWidth : 1) * width / w, (film ? G.filmHeight : 1) * height / h);
    return {w: w * k, h: h * k};
  }
  // Centres of the neighbouring pictures: IMAGE_GAP between edges in film mode, a full screen plus the gap otherwise.
  function strip(list, index, width, height, film) {
    return list.map((photo, i) => ({photo, ...fit(photo, width, height, film)})).map((box, i, all) => {
      let x = 0;
      if (film) {
        const dir = Math.sign(i - index);
        for (let j = index; j !== i; j += dir) x += dir * (all[j].w / 2 + G.imageGap + all[j + dir].w / 2);
      } else x = (i - index) * (width + G.imageGap);
      return {...box, x};
    });
  }

  const bar = (left, actions, t) => `<header class="jbgal-bar">${left}<span class="jbgal-bar-fill"></span>${actions}</header>`;
  const up = t => `<button type="button" class="jbgal-up" data-action="back" aria-label="${e(t('Back'))}"><img class="jbgal-up-caret" src="assets/ic_ab_back_holo_dark.png" alt=""><img class="jbgal-app" src="assets/gallery.png" alt=""></button>`;
  const iconButton = (attr, label, file, t) => `<button type="button" class="jbgal-icon" ${attr} aria-label="${e(t(label))}"><img src="assets/${file}" alt=""></button>`;

  function render(data, ui, t, media, locale) {
    const sub = ui.sub || '', cluster = ui.galleryCluster || 'album';
    if (sub === 'edit') return renderEditor(data, ui, t, media);
    if (sub === 'photo') return renderPhoto(data, ui, t, media, locale);
    // A photo sphere in LightCycle's viewer (kk-sphere.js).
    if (sub === 'sphere') { const photo = data.photos.find(p => p.id === ui.selectedPhoto); if (photo?.sphere) return `<div class="app-view gallery-app jbgal" data-jbgal data-page="sphere">${window.KKSphere.viewer(photo, media, t)}</div>`; return renderPhoto(data, ui, t, media, locale); }
    // MovieActivity for a video (gallery-video.js) under the Holo.ActionBar with the title and Share.
    if (sub === 'movie') {
      const photo = data.photos.find(p => p.id === ui.selectedPhoto);
      if (photo?.video) return window.G2Video.render(photo, {ui, t, media, bar: bar(up(t) + `<h2>${e(photo.name)}</h2>`, iconButton('data-action="gallery-share"', 'Share', 'gallery-ic_menu_share_holo_light.png', t), t)});
      return renderPhoto(data, ui, t, media, locale);
    }
    if (sub === 'album') {
      const list = items(data, ui, locale), group = groups(data, cluster, locale).find(g => g.key === ui.galleryAlbum) || {name: ui.galleryAlbum === 'pictures' ? 'Pictures' : 'Camera', translate: true};
      const spinner = `<button type="button" class="jbgal-spinner jbgal-two-line" data-jbgal-open="mode"><strong>${e(group.translate ? t(group.name) : group.name)}</strong><small>${e(t('Grid view'))}</small></button>`;
      return `<div class="app-view gallery-app jbgal" data-jbgal data-page="album">${bar(up(t) + spinner, iconButton('data-action="gallery-camera"', 'Switch to Camera', 'gallery-ic_menu_camera_holo_light.png', t) + iconButton('data-jbgal-open="album-menu"', 'More options', 'jbgal-overflow.png', t), t)}<div class="jbgal-scroll" data-jbgal-scroll><div class="jbgal-grid jbgal-album-grid">${list.map(photo => `<button type="button" class="jbgal-slot" data-action="photo" data-id="${photo.id}" aria-label="${e(photo.name)}">${media.art(photo)}${window.G2Video.slot(photo)}</button>`).join('') || `<p class="jbgal-empty">${e(t('0 images/videos available.'))}</p>`}</div></div>${popups(ui, t)}</div>`;
    }
    const sets = groups(data, cluster, locale);
    const spinner = `<button type="button" class="jbgal-spinner" data-jbgal-open="cluster">${e(t(CLUSTERS.find(c => c[0] === cluster)[1]))}</button>`;
    const label = group => `<span class="jbgal-label"><img src="assets/gallery-frame_overlay_gallery_${group.key === 'camera' ? 'camera' : 'folder'}.png" alt=""><strong>${e(group.translate ? t(group.name) : group.name)}</strong><small>${group.items.length}</small></span>`;
    return `<div class="app-view gallery-app jbgal" data-jbgal data-page="set">${bar(up(t) + spinner, iconButton('data-action="gallery-camera"', 'Switch to Camera', 'gallery-ic_menu_camera_holo_light.png', t) + iconButton('data-jbgal-open="set-menu"', 'More options', 'jbgal-overflow.png', t), t)}<div class="jbgal-scroll" data-jbgal-scroll><div class="jbgal-grid jbgal-set-grid">${sets.map(group => `<button type="button" class="jbgal-slot jbgal-album" data-jbgal-album="${e(group.key)}" aria-label="${e(group.translate ? t(group.name) : group.name)}">${media.art(group.items[0])}${window.G2Video.slot(group.items[0])}${label(group)}</button>`).join('') || `<p class="jbgal-empty">${e(t('No albums available.'))}</p>`}</div></div>${popups(ui, t)}</div>`;
  }
  // Holo spinner dropdowns and overflow menus, drawn inside the app like the action bar popups.
  function popups(ui, t, video = false) {
    const open = ui.galleryPopup, item = (attr, label, checked) => `<button type="button" ${attr} ${checked === undefined ? '' : `role="menuitemradio" aria-checked="${checked}"`}>${e(t(label))}</button>`;
    if (!open) return '';
    let body = '', cls = 'jbgal-menu';
    if (open === 'cluster') { cls = 'jbgal-dropdown'; body = CLUSTERS.map(([id, label]) => item(`data-jbgal-cluster="${id}"`, label, (ui.galleryCluster || 'album') === id)).join(''); }
    if (open === 'mode') { cls = 'jbgal-dropdown jbgal-dropdown-mode'; body = item('data-jbgal-mode="film"', 'Filmstrip view', false) + item('data-jbgal-mode="grid"', 'Grid view', true); }
    if (open === 'set-menu') body = item('data-jbgal-toast="Select album"', 'Select album') + item('data-jbgal-toast="Settings"', 'Settings');
    if (open === 'album-menu') body = item('data-action="gallery-slideshow"', 'Slideshow') + item('data-jbgal-toast="Select item"', 'Select item') + item('data-jbgal-open="cluster"', 'Group by');
    if (open === 'photo-menu' && video) body = item('data-jbgal-delete', 'Delete') + item('data-action="gallery-slideshow"', 'Slideshow') + item('data-jbgal-toast="This feature is not part of the simulator."', 'Trim') + item('data-jbgal-toast="This feature is not part of the simulator."', 'Mute') + item('data-action="gallery-details"', 'Details');
    else if (open === 'photo-menu') body = item('data-jbgal-delete', 'Delete') + item('data-action="gallery-slideshow"', 'Slideshow') + item('data-jbgal-edit', 'Edit') + item('data-action="gallery-rotate" data-id="-90"', 'Rotate left') + item('data-action="gallery-rotate" data-id="90"', 'Rotate right') + item('data-jbgal-edit="geometry"', 'Crop') + item('data-jbgal-setas', 'Set picture as') + item('data-action="gallery-details"', 'Details') + `<button type="button" data-action="gallery-print">${e(AndroidStrings.pick(PRINT, window.AndroidI18n?.language, 'Print'))}</button>`;
    return `<div class="jbgal-popup-scrim" data-jbgal-close></div><div class="${cls}" role="menu">${body}</div>`;
  }

  function renderPhoto(data, ui, t, media, locale) {
    const list = items(data, ui, locale), index = Math.max(0, list.findIndex(p => p.id === ui.selectedPhoto)), photo = list[index];
    if (!photo) return `<div class="app-view gallery-app jbgal" data-jbgal data-page="photo"><p class="jbgal-empty">${e(t('Photo unavailable'))}</p></div>`;
    const group = groups(data, ui.galleryCluster || 'album', locale).find(g => g.key === ui.galleryAlbum), title = group ? (group.translate ? t(group.name) : group.name) : t('Camera');
    const film = !!ui.galleryFilm, bars = ui.galleryBars !== false || film;
    const pictures = [index - 2, index - 1, index, index + 1, index + 2].filter(i => i >= 0 && i < list.length).map(i => `<button type="button" class="jbgal-picture${i === index ? ' current' : ''}" data-jbgal-picture="${i}" data-id="${list[i].id}" aria-label="${e(list[i].name)}" ${i === index ? '' : 'tabindex="-1"'}>${media.art(list[i])}${window.G2Video.photoIcon(list[i])}</button>`).join('');
    const camera = ui.galleryFromCamera && index === 0 ? `<div class="jbgal-picture jbgal-camera-card" data-jbgal-picture="-1" aria-hidden="true">${media.art(media.scene(data))}</div>` : '';
    return `<div class="app-view gallery-app jbgal jbgal-photo${film ? ' film' : ''}${bars ? ' bars' : ''}${ui.gallerySlideshow ? ' slideshow' : ''}" data-jbgal data-page="photo" data-index="${index}" data-count="${list.length}">
      <div class="jbgal-stage" data-jbgal-stage>${camera}${pictures}</div>
      ${bar(up(t) + `<h2>${e(title)}</h2>`, iconButton('data-action="gallery-share"', 'Share', 'gallery-ic_menu_share_holo_light.png', t) + iconButton('data-jbgal-open="photo-menu"', 'More options', 'jbgal-overflow.png', t), t)}
      <div class="jbgal-bottom"${photo.video ? ' hidden' : ''}><button type="button" class="jbgal-icon" data-jbgal-edit aria-label="${e(t('Edit'))}"><img src="assets/jbgal-ic_menu_edit_holo_dark.png" alt=""></button></div>
      ${photo.sphere ? `<button type="button" class="jbgal-sphere" data-jbgal-sphere aria-label="${e(AndroidStrings.pick(window.StockStrings?.sphere?.['View Photo Sphere'] || {}, window.AndroidI18n?.language, 'View Photo Sphere'))}"><img src="assets/jbgal-ic_view_photosphere.png" alt=""></button>` : ''}
      ${ui.galleryUndo ? `<div class="jbgal-undo" role="status"><span>${e(t('Deleted'))}</span><button type="button" data-jbgal-undo>${e(t('UNDO'))}</button></div>` : ''}
      ${ui.gallerySlideshow ? `<button type="button" class="gallery-stop" data-action="gallery-stop">${e(t('Stop slideshow'))}</button>` : ''}
      ${popups(ui, t, !!photo.video)}</div>`;
  }

  /* FilterShowActivity: Save in the action bar, the picture on #101010, a 128dp category strip and the
     effects / borders / geometry / colours buttons. Looks and borders are thumbnails of the photo itself. */
  function renderEditor(data, ui, t, media) {
    const edit = ui.galleryEdit, photo = data.photos.find(p => p.id === edit?.photoId);
    if (!photo) return `<div class="app-view gallery-app jbgal" data-jbgal data-page="edit"></div>`;
    const draft = {...photo, look: edit.look, border: edit.border, rotation: edit.rotation, mirror: edit.mirror, exposure: edit.exposure, adjust: {...edit.adjust}};
    const thumb = (attr, label, preview, selected) => `<button type="button" class="jbgal-cat${selected ? ' selected' : ''}" ${attr} aria-pressed="${selected}"><span>${media.art(preview)}</span><small>${e(t(label))}</small></button>`;
    let strip = '';
    if (edit.panel === 'fx') strip = media.LOOK_NAMES.map(([id, label]) => thumb(`data-jbgal-look="${id}"`, label, {...draft, look: id}, (edit.look || '') === id)).join('');
    if (edit.panel === 'border') strip = BORDERS.map(([id, label]) => thumb(`data-jbgal-border="${id}"`, label, {...draft, border: id}, (edit.border || '') === id)).join('');
    if (edit.panel === 'geometry') strip = GEOMETRY.map(([id, label]) => `<button type="button" class="jbgal-cat jbgal-cat-text" data-jbgal-geometry="${id}"><span>${e(t(label))}</span></button>`).join('');
    if (edit.panel === 'color') strip = ADJUST.map(([id, label]) => `<button type="button" class="jbgal-cat jbgal-cat-text${edit.slider === id ? ' selected' : ''}" data-jbgal-adjust="${id}" aria-pressed="${edit.slider === id}"><span>${e(t(label))}</span></button>`).join('');
    const slider = edit.panel === 'color' && edit.slider && edit.slider !== 'autocolor' ? (() => {
      const [id, label, min, max, step, base] = ADJUST.find(a => a[0] === edit.slider), value = id === 'exposure' ? edit.exposure || 0 : edit.adjust[id] ?? base;
      return `<label class="jbgal-slider"><span>${e(t(label))}</span><input type="range" data-jbgal-range="${id}" min="${min}" max="${max}" step="${step}" value="${value}"><output>${id === 'hue' ? Math.round(value) + '°' : Number(value).toFixed(id === 'exposure' ? 0 : 2)}</output></label>`;
    })() : '';
    const buttons = [['fx', 'ic_photoeditor_effects', 'Looks'], ['border', 'ic_photoeditor_border', 'Borders'], ['geometry', 'ic_photoeditor_fix', 'Geometry'], ['color', 'ic_photoeditor_color', 'Colors']];
    return `<div class="app-view gallery-app jbgal jbgal-editor" data-jbgal data-page="edit">
      <header class="jbgal-bar jbgal-editor-bar"><button type="button" class="jbgal-save" data-jbgal-save><img src="assets/jbgal-ic_menu_savephoto.png" alt="">${e(t('Save'))}</button><span class="jbgal-bar-fill"></span>${iconButton('data-jbgal-undo-edit', 'Undo', 'jbgal-filtershow_button_undo.png', t)}${iconButton('data-jbgal-redo-edit', 'Redo', 'jbgal-filtershow_button_redo.png', t)}${iconButton('data-jbgal-reset-edit', 'Reset', 'jbgal-overflow.png', t)}</header>
      <div class="jbgal-editor-image" data-jbgal-compare>${media.art(draft)}</div>
      ${slider}<div class="jbgal-categories">${strip}</div>
      <div class="jbgal-editor-buttons">${buttons.map(([id, file, label]) => `<button type="button" class="${edit.panel === id ? 'selected' : ''}" data-jbgal-panel="${id}" aria-label="${e(t(label))}" aria-pressed="${edit.panel === id}"><img src="assets/jbgal-${file}.png" alt=""></button>`).join('')}</div>
      ${edit.confirm ? `<div class="settings-dialog-scrim" data-jbgal-confirm="cancel"></div><div class="settings-dialog" role="dialog" aria-label="${e(t('Do you want to save before exiting?'))}"><h3>${e(t('There are unsaved changes to this image.'))}</h3><p>${e(t('Do you want to save before exiting?'))}</p><div class="settings-dialog-actions"><button type="button" data-jbgal-confirm="exit">${e(t('Exit'))}</button><button type="button" data-jbgal-confirm="save">${e(t('Save and Exit'))}</button></div></div>` : ''}
    </div>`;
  }
  const editState = photo => ({photoId: photo.id, look: photo.look || '', border: photo.border || '', rotation: photo.rotation || 0, mirror: !!photo.mirror, exposure: photo.exposure || 0, adjust: {...(photo.adjust || {})}, panel: 'fx', slider: null, history: [], future: []});
  const editKey = edit => JSON.stringify([edit.look, edit.border, edit.rotation, edit.mirror, edit.exposure, edit.adjust]);

  /* Back: editor -> photo (asking about unsaved changes), photo -> camera when opened from it, otherwise album,
     album -> album set. Returns true when handled. */
  function back(ui, data) {
    if (ui.galleryPopup) { ui.galleryPopup = ''; return true; }
    if (ui.sub === 'edit') {
      const edit = ui.galleryEdit, photo = data.photos.find(p => p.id === edit?.photoId);
      if (edit && photo && !edit.confirm && editKey(edit) !== editKey(editState(photo))) { edit.confirm = true; return true; }
      ui.sub = 'photo'; ui.galleryEdit = null; return true;
    }
    if (ui.sub === 'movie') { ui.sub = 'photo'; ui.galleryMovie = null; return true; }
    if (ui.sub === 'sphere') { ui.sub = 'photo'; return true; }
    if (ui.sub === 'photo' && ui.galleryFilm && !ui.galleryFromCamera) { ui.galleryFilm = false; return true; }
    if (ui.sub === 'photo') { if (ui.galleryFromCamera) return 'camera'; ui.sub = 'album'; return true; }
    if (ui.sub === 'album') { ui.sub = ''; return true; }
    return false;
  }

  function attach(root, {data, ui, t, media, locale, save, render: rerender, toast, openCamera, setWallpaper, reduced}) {
    const page = root.dataset.page;
    if (page === 'movie') return window.G2Video.attach(root, {photo: data.photos.find(p => p.id === ui.selectedPhoto), ui, rerender, reduced});
    if (page === 'sphere') { window.KKSphere.attachViewer(root); return {destroy() {}}; }
    let hideTimer = 0, destroyed = false;
    const refresh = () => { if (!destroyed) rerender(); };
    // Horizontal slot views: vertical wheel scrolls sideways, like the GL SlotView on a phone.
    const scroller = root.querySelector('[data-jbgal-scroll]');
    if (scroller) {
      const key = `${page}:${ui.galleryCluster}:${ui.galleryAlbum}`;
      scroller.scrollLeft = ui.galleryScroll?.[key] || 0;
      scroller.addEventListener('scroll', () => { (ui.galleryScroll ||= {})[key] = scroller.scrollLeft; }, {passive: true});
      scroller.addEventListener('wheel', event => { if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) { event.preventDefault(); scroller.scrollLeft += event.deltaY; } }, {passive: false});
    }
    root.addEventListener('click', event => {
      const target = event.target, hit = sel => target.closest(sel);
      if (hit('[data-jbgal-close]')) { ui.galleryPopup = ''; refresh(); return; }
      const opener = hit('[data-jbgal-open]'); if (opener) { event.stopPropagation(); ui.galleryPopup = opener.dataset.jbgalOpen; refresh(); return; }
      const cluster = hit('[data-jbgal-cluster]'); if (cluster) { ui.galleryCluster = cluster.dataset.jbgalCluster; ui.galleryPopup = ''; ui.sub = ''; refresh(); return; }
      const mode = hit('[data-jbgal-mode]');
      if (mode) { ui.galleryPopup = ''; if (mode.dataset.jbgalMode === 'film') { const list = items(data, ui, locale); if (list.length) { ui.selectedPhoto = list[0].id; ui.sub = 'photo'; ui.galleryFilm = true; ui.galleryFromCamera = false; } } refresh(); return; }
      const album = hit('[data-jbgal-album]'); if (album) { ui.galleryAlbum = album.dataset.jbgalAlbum; ui.sub = 'album'; refresh(); return; }
      const note = hit('[data-jbgal-toast]'); if (note) { ui.galleryPopup = ''; refresh(); toast(t(note.dataset.jbgalToast)); return; }
      if (hit('[data-jbgal-delete]')) { ui.galleryPopup = ''; remove(); return; }
      if (hit('[data-jbgal-undo]')) { const undo = ui.galleryUndo; if (undo) { data.photos.splice(undo.position, 0, undo.photo); ui.selectedPhoto = undo.photo.id; ui.galleryUndo = null; save(); refresh(); } return; }
      if (hit('[data-jbgal-sphere]')) { ui.sub = 'sphere'; refresh(); return; }
      if (hit('[data-jbgal-setas]')) { ui.galleryPopup = ''; const photo = data.photos.find(p => p.id === ui.selectedPhoto); if (photo) setWallpaper(photo); return; }
      const edit = hit('[data-jbgal-edit]');
      if (edit) { const photo = data.photos.find(p => p.id === ui.selectedPhoto); if (!photo) return; ui.galleryPopup = ''; ui.galleryEdit = {...editState(photo), panel: edit.dataset.jbgalEdit || 'fx'}; ui.sub = 'edit'; refresh(); return; }
      if (page === 'edit') editorClick(target);
    }, true);

    function remove() {
      const list = items(data, ui, locale), index = list.findIndex(p => p.id === ui.selectedPhoto), photo = list[index];
      if (!photo) return;
      const position = data.photos.indexOf(photo);
      data.photos.splice(position, 1); save();
      ui.galleryUndo = {photo, position}; later(() => { if (ui.galleryUndo?.photo === photo) { ui.galleryUndo = null; refresh(); } }, 4000);
      const rest = items(data, ui, locale);
      if (rest.length) ui.selectedPhoto = rest[Math.min(index, rest.length - 1)].id; else { ui.sub = 'album'; ui.galleryFilm = false; }
      refresh();
    }
    const timers = new Set(), later = (fn, ms) => { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; };

    // Photo page: drag between pictures, tap toggles the bars, pinch or Ctrl+wheel switches film mode,
    // and in film mode a picture flung upwards is deleted (with UNDO).
    const stage = root.querySelector('[data-jbgal-stage]');
    if (stage) {
      const list = items(data, ui, locale), index = Number(root.dataset.index) || 0, film = !!ui.galleryFilm;
      const size = () => ({w: stage.clientWidth, h: stage.clientHeight});
      const layout = (dx = 0, dy = 0, animate = false) => {
        const {w, h} = size(), boxes = strip(list, index, w, h, film);
        stage.querySelectorAll('[data-jbgal-picture]').forEach(node => {
          const i = Number(node.dataset.jbgalPicture), cam = fit({}, w, h, film), box = i === -1 ? {...cam, x: film ? -(boxes[index].w / 2 + G.imageGap + cam.w / 2) : -(w + G.imageGap)} : boxes[i];
          if (!box) return;
          node.style.transition = animate && !reduced ? `transform ${G.slide}ms cubic-bezier(.22,.61,.36,1)` : 'none';
          node.style.width = `${box.w}px`; node.style.height = `${box.h}px`;
          node.style.transform = `translate(${w / 2 - box.w / 2 + box.x + dx}px,${h / 2 - box.h / 2 + (i === index ? dy : 0)}px)${i === index && ui.galleryZoom && !film ? ' scale(2)' : ''}`;
        });
      };
      layout();
      new ResizeObserver(() => layout()).observe(stage);
      const scheduleHide = () => { clearTimeout(hideTimer); if (!film && ui.galleryBars !== false) hideTimer = setTimeout(() => { if (!destroyed && !ui.galleryPopup) { ui.galleryBars = false; root.classList.remove('bars'); } }, G.hideBars); };
      scheduleHide();
      const pointers = new Map(); let gesture = null, lastTap = 0;
      stage.addEventListener('pointerdown', event => {
        if (event.button > 0) return;
        pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
        try { stage.setPointerCapture(event.pointerId); } catch {}
        if (pointers.size === 2) { const [a, b] = [...pointers.values()]; gesture = {pinch: Math.hypot(a.x - b.x, a.y - b.y)}; return; }
        gesture = {x: event.clientX, y: event.clientY, t: performance.now(), moved: false, axis: ''};
      });
      stage.addEventListener('pointermove', event => {
        if (!pointers.has(event.pointerId) || !gesture) return;
        pointers.set(event.pointerId, {x: event.clientX, y: event.clientY});
        if (gesture.pinch) { const [a, b] = [...pointers.values()]; gesture.ratio = Math.hypot(a.x - b.x, a.y - b.y) / gesture.pinch; return; }
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        if (!gesture.axis && Math.hypot(dx, dy) > 8) gesture.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
        if (!gesture.axis) return;
        gesture.moved = true; event.preventDefault();
        const edge = (dx > 0 && index === 0 && !ui.galleryFromCamera) || (dx < 0 && index === list.length - 1);
        if (gesture.axis === 'x') layout(edge ? dx * .3 : dx, 0); else if (film) layout(0, Math.min(0, dy));
      });
      const finish = event => {
        if (!pointers.has(event.pointerId)) return;
        pointers.delete(event.pointerId);
        if (!gesture) return;
        const was = gesture;
        if (was.pinch) { if (pointers.size === 0) { gesture = null; if (was.ratio && (was.ratio < .85) !== film && (was.ratio < .85 || was.ratio > 1.15)) { ui.galleryFilm = was.ratio < .85; refresh(); } } return; }
        gesture = null;
        const dx = event.clientX - was.x, dy = event.clientY - was.y, dt = performance.now() - was.t, {w, h} = size();
        if (was.axis === 'x') {
          const step = Math.abs(dx) > w * (film ? .15 : .25) || Math.abs(dx) / dt > .5 ? (dx < 0 ? 1 : -1) : 0;
          if (step < 0 && index === 0 && ui.galleryFromCamera) { openCamera(); return; }
          const next = Math.max(0, Math.min(list.length - 1, index + step));
          if (next !== index) { ui.selectedPhoto = list[next].id; ui.galleryZoom = false; refresh(); } else layout(0, 0, true);
          return;
        }
        if (was.axis === 'y' && film) { if (dy < -h * .2 || dy / dt < -.6) remove(); else layout(0, 0, true); return; }
        if (was.moved) { layout(0, 0, true); return; }
        // Tap: double tap zooms, single tap toggles the bars; in film mode a tap picks that picture.
        // Pointer capture retargets the release to the stage, so find the picture under the finger.
        const picture = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-jbgal-picture]');
        if (film) { if (picture && Number(picture.dataset.jbgalPicture) >= 0) { ui.selectedPhoto = list[Number(picture.dataset.jbgalPicture)].id; ui.galleryFilm = false; ui.galleryBars = false; refresh(); } else if (picture) openCamera(); return; }
        if (list[index]?.video && window.G2Video.centerTap(stage.getBoundingClientRect(), event.clientX, event.clientY)) { ui.sub = 'movie'; ui.galleryMovie = null; ui.galleryPopup = ''; refresh(); return; }
        const now = performance.now();
        if (now - lastTap < 300) { ui.galleryZoom = !ui.galleryZoom; lastTap = 0; layout(0, 0, true); return; }
        lastTap = now;
        later(() => { if (lastTap === now && !destroyed) { ui.galleryBars = ui.galleryBars === false; root.classList.toggle('bars', ui.galleryBars !== false); scheduleHide(); } }, 300);
      };
      stage.addEventListener('pointerup', finish); stage.addEventListener('pointercancel', finish);
      stage.addEventListener('wheel', event => { if (!event.ctrlKey) return; event.preventDefault(); if ((event.deltaY > 0) !== film) { ui.galleryFilm = event.deltaY > 0; refresh(); } }, {passive: false});
    }

    // Editor: looks, borders, geometry and colour sliders with undo/redo; Save writes a new picture.
    function editorClick(target) {
      const edit = ui.galleryEdit; if (!edit) return;
      const hit = sel => target.closest(sel), commit = change => { edit.history.push(JSON.parse(editKey(edit))); edit.future = []; change(); refresh(); };
      const panel = hit('[data-jbgal-panel]'); if (panel) { edit.panel = panel.dataset.jbgalPanel; edit.slider = null; refresh(); return; }
      const look = hit('[data-jbgal-look]'); if (look) { commit(() => { edit.look = look.dataset.jbgalLook; }); return; }
      const border = hit('[data-jbgal-border]'); if (border) { commit(() => { edit.border = border.dataset.jbgalBorder; }); return; }
      const geometry = hit('[data-jbgal-geometry]'); if (geometry) { commit(() => { if (geometry.dataset.jbgalGeometry === 'rotate') edit.rotation = (edit.rotation + 90) % 360; else edit.mirror = !edit.mirror; }); return; }
      const adjust = hit('[data-jbgal-adjust]');
      if (adjust) { const id = adjust.dataset.jbgalAdjust; if (id === 'autocolor') commit(() => { edit.adjust.autocolor = !edit.adjust.autocolor; edit.slider = id; }); else { edit.slider = id; refresh(); } return; }
      const restore = state => { [edit.look, edit.border, edit.rotation, edit.mirror, edit.exposure, edit.adjust] = state; };
      if (hit('[data-jbgal-undo-edit]')) { if (edit.history.length) { edit.future.push(JSON.parse(editKey(edit))); restore(edit.history.pop()); refresh(); } return; }
      if (hit('[data-jbgal-redo-edit]')) { if (edit.future.length) { edit.history.push(JSON.parse(editKey(edit))); restore(edit.future.pop()); refresh(); } return; }
      if (hit('[data-jbgal-reset-edit]')) { const photo = data.photos.find(p => p.id === edit.photoId); commit(() => { restore(JSON.parse(editKey(editState(photo)))); }); return; }
      const confirm = hit('[data-jbgal-confirm]');
      if (confirm) { const choice = confirm.dataset.jbgalConfirm; edit.confirm = false; if (choice === 'save') saveEdit(); else if (choice === 'exit') { ui.sub = 'photo'; ui.galleryEdit = null; refresh(); } else refresh(); return; }
      if (hit('[data-jbgal-save]')) saveEdit();
    }
    // FilterShow saves a new file next to the original; the copy opens in the photo page.
    function saveEdit() {
      const edit = ui.galleryEdit, photo = data.photos.find(p => p.id === edit?.photoId); if (!photo) return;
      const copy = {...photo, id: Date.now(), name: `${photo.name || 'IMG'}_edited`, created: Date.now(), look: edit.look, border: edit.border, rotation: edit.rotation, mirror: edit.mirror, exposure: edit.exposure, adjust: {...edit.adjust}};
      data.photos.unshift(copy); save();
      ui.selectedPhoto = copy.id; ui.sub = 'photo'; ui.galleryEdit = null; ui.galleryFilm = false;
      toast(t('Saving picture to ') + t(albumOf(copy) === 'camera' ? 'Camera' : 'Pictures'));
      refresh();
    }
    root.addEventListener('input', event => {
      const range = event.target.closest('[data-jbgal-range]'), edit = ui.galleryEdit; if (!range || !edit) return;
      const id = range.dataset.jbgalRange, value = Number(range.value);
      if (!range.dataset.pushed) { edit.history.push(JSON.parse(editKey(edit))); edit.future = []; range.dataset.pushed = '1'; }
      if (id === 'exposure') edit.exposure = value; else edit.adjust[id] = value;
      const photo = data.photos.find(p => p.id === edit.photoId), draft = {...photo, look: edit.look, border: edit.border, rotation: edit.rotation, mirror: edit.mirror, exposure: edit.exposure, adjust: {...edit.adjust}};
      const img = root.querySelector('[data-jbgal-compare] img'); if (img) img.src = media.image(draft);
      range.nextElementSibling.textContent = id === 'hue' ? `${Math.round(value)}°` : value.toFixed(id === 'exposure' ? 0 : 2);
    });
    root.addEventListener('change', event => { if (event.target.closest('[data-jbgal-range]')) refresh(); });
    // Holding the picture compares with the original (the 4.3 "Compare" gesture).
    const compare = root.querySelector('[data-jbgal-compare]');
    if (compare) {
      const photo = data.photos.find(p => p.id === ui.galleryEdit?.photoId), img = compare.querySelector('img');
      let held = 0;
      compare.addEventListener('pointerdown', () => { held = setTimeout(() => { if (img && photo) img.src = media.image(photo); compare.classList.add('original'); }, 250); });
      const release = () => { clearTimeout(held); if (compare.classList.contains('original')) refresh(); };
      compare.addEventListener('pointerup', release); compare.addEventListener('pointercancel', release); compare.addEventListener('pointerleave', release);
    }
    return {destroy() { destroyed = true; clearTimeout(hideTimer); timers.forEach(clearTimeout); }};
  }
  window.JBGallery = {G, CLUSTERS, BORDERS, ADJUST, groups, items, fit, strip, render, back, attach, editState, editKey};
})();
