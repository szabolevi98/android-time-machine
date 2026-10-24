/* Android 5.1 DocumentsUI (LMY48Y) answering ACTION_GET_CONTENT: Gmail's and Email's Attach file (any type), the wallpaper
   picker's and Keep's Pick image (image/*). DocumentsActivity in DocumentsTheme (colorPrimary #37474F): activity.xml's
   Toolbar with the ic_hamburger roots button (drawer_open "Show roots"), the root's title or, below the root, the
   breadcrumb Spinner (item_subdir_title; its dropdown lists the stack, deeper levels with ic_breadcrumb_arrow), Search
   (only roots with FLAG_SUPPORTS_SEARCH: Internal storage), Sort by (hidden in Recent, where there is no directory) and
   the overflow's Grid view / List view, Show / Hide internal storage and Show / Hide file size (LocalPreferences).
   The 256 dp roots drawer has its own Toolbar titled title_open ("Open from"); RootsFragment lists Recent, Internal
   storage (FLAG_ADVANCED, only while shown), Images, Videos, Audio, then Downloads (RootsAdapter's order), each with
   RootInfo.deriveFields' icon (ic_root_recent, ic_root_sdcard, ic_doc_image, ic_doc_video, ic_doc_audio,
   ic_root_download); roots whose mime_types cannot match the request are left out (MediaDocumentsProvider: Images
   image/*, Videos video/*, Audio audio/*). The drawer opens by itself when no stack was restored for the asking app and
   the request is not for visual media, or when Recent comes up empty.
   Documents: MediaDocumentsProvider's Images and Videos list buckets (FLAG_DIR_PREFERS_GRID | PREFERS_LAST_MODIFIED,
   thumbnails), Audio lists artists, then albums (ic_doc_album), then the songs by title; Recent holds the documents of
   the roots with FLAG_SUPPORTS_RECENTS (Images, Videos, Downloads) from the last 45 days (RecentLoader), in grid mode
   for visual requests and list mode otherwise; Internal storage is the shared storage's standard folders. Documents
   whose type does not match the request stay listed but disabled. Picking a document finishes with it and the stack is
   remembered for that app (RecentsProvider); Back climbs the stack, then cancels. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const RECENT_AGE = 45 * 864e5;
  const ROOTS = [
    ['recent', 'Recent', 'ic_root_recent'], ['sdcard', 'Internal storage', 'ic_root_sdcard'], ['images', 'Images', 'ic_doc_image'],
    ['videos', 'Videos', 'ic_doc_video_am'], ['audio', 'Audio', 'ic_doc_audio'], ['downloads', 'Downloads', 'ic_root_download']
  ];
  const ROOT_MIMES = {images: 'image/*', videos: 'video/*', audio: 'audio/*'};
  // Environment's standard directories, as a 5.1 phone creates them on its shared storage.
  const FOLDERS = ['Alarms', 'Android', 'DCIM', 'Download', 'Movies', 'Music', 'Notifications', 'Pictures', 'Podcasts', 'Ringtones'];
  const BUCKETS = {camera: 'Camera', pictures: 'Pictures', screenshots: 'Screenshots', download: 'Download'};
  const SORTS = [['name', 'By name'], ['date', 'By date modified'], ['size', 'By size']];
  const MIMES = {jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', mp4: 'video/mp4', '3gp': 'video/3gpp', webm: 'video/webm',
    mp3: 'audio/mpeg', ogg: 'audio/ogg', m4a: 'audio/mp4', pdf: 'application/pdf', apk: 'application/vnd.android.package-archive', zip: 'application/zip', txt: 'text/plain', html: 'text/html'};
  const mimeOf = name => MIMES[(String(name).match(/\.([a-z0-9]{2,4})$/i) || [])[1]?.toLowerCase()] || 'application/octet-stream';
  const matches = (accept, mime) => accept === '*/*' || accept === mime || (accept.endsWith('/*') && String(mime).startsWith(accept.slice(0, -1)));
  // MimePredicate.VISUAL_MIMES (image and video types) against the request: any type is not visual.
  const visual = accept => /^(image|video)\//.test(accept);
  // IconUtils.loadMimeIcon: the ic_doc_* of the type.
  function mimeIcon(mime) {
    if (mime.startsWith('image/')) return 'ic_doc_image';
    if (mime.startsWith('video/')) return 'ic_doc_video_am';
    if (mime.startsWith('audio/')) return 'ic_doc_audio';
    if (mime === 'application/pdf') return 'ic_doc_pdf';
    if (mime === 'application/vnd.android.package-archive') return 'ic_doc_apk';
    if (mime === 'application/zip') return 'ic_doc_compressed';
    if (mime.startsWith('text/')) return 'ic_doc_text_am';
    return 'ic_doc_generic_am';
  }
  // The simulator's photos, songs and downloads as documents: camera-style file names, sizes of a JPEG, a 17 Mbit/s
  // camcorder clip and a 128 kbit/s MP3.
  function photoDoc(p) {
    const video = !!p.video, name = /\.\w{3,4}$/.test(p.name || '') ? p.name : `${p.name || 'IMG'}.${video ? 'mp4' : 'jpg'}`;
    const seed = [...String(p.id)].reduce((s, c) => (s * 31 + c.charCodeAt(0)) >>> 0, 7);
    return {id: `photo:${p.id}`, name, mime: video ? 'video/mp4' : 'image/jpeg', size: video ? Math.round((p.duration || 5000) / 1000 * 2125000) : 1400000 + seed * 7919 % 1900000, time: p.created || 0, photo: p};
  }
  const trackDoc = (track, i, file) => ({id: `track:${i}`, name: file ? `${track.title}.mp3` : track.title, mime: 'audio/mpeg', size: track.duration * 16000, time: 0});
  const downloadDoc = (d, i) => ({id: `dl:${i}`, name: d.name, mime: d.mime || mimeOf(d.name), size: d.size || 0, time: d.time || 0});
  // A directory's last modified time is its newest document's (MediaDocumentsProvider's buckets: MAX(date_modified)).
  const dir = (id, name, children, more = {}) => ({id, name, dir: true, children, time: Math.max(0, ...children.map(c => c.time || 0)), ...more});
  function group(list, key) { const map = new Map(); for (const item of list) { const k = key(item); if (!map.has(k)) map.set(k, []); map.get(k).push(item); } return map; }
  // Every root's document tree, rebuilt from the simulator's data.
  function roots(ctx) {
    const {data} = ctx, now = ctx.now || Date.now();
    const media = (data.photos || []).map(photoDoc), images = media.filter(d => !d.photo.video), videos = media.filter(d => d.photo.video);
    const tracks = ctx.tracks || [], downloads = (data.downloads || []).map(downloadDoc);
    const buckets = (kind, list) => [...group(list, d => ctx.album(d.photo))].map(([key, items]) => dir(`${kind}/${key}`, BUCKETS[key] || key, items, {grid: true, byDate: true, thumb: newest(items)[0]}));
    const artists = [...group(tracks.map((track, i) => ({track, i})), x => x.track.artist)].map(([artist, list]) =>
      dir(`audio/${artist}`, artist, [...group(list, x => x.track.album)].map(([album, songs]) => dir(`audio/${artist}/${album}`, album, songs.map(x => trackDoc(x.track, x.i)), {album: true}))));
    const inAlbum = key => media.filter(d => ctx.album(d.photo) === key);
    const folder = name => dir(`sdcard/${name}`, name, {
      Android: [dir('sdcard/Android/data', 'data', []), dir('sdcard/Android/obb', 'obb', [])],
      DCIM: inAlbum('camera').length ? [dir('sdcard/DCIM/Camera', 'Camera', inAlbum('camera'))] : [],
      Download: downloads, Music: tracks.map((track, i) => trackDoc(track, i, true)), Pictures: inAlbum('pictures')
    }[name] || []);
    return {
      recent: dir('recent', 'Recent', newest([...media, ...downloads].filter(d => d.time && now - d.time < RECENT_AGE)), {recents: true}),
      sdcard: dir('sdcard', 'Internal storage', FOLDERS.map(folder), {search: true, summary: true}),
      images: dir('images', 'Images', buckets('images', images), {grid: true, byDate: true}),
      videos: dir('videos', 'Videos', buckets('videos', videos), {grid: true, byDate: true}),
      audio: dir('audio', 'Audio', artists),
      downloads: dir('downloads', 'Downloads', downloads, {byDate: true})
    };
  }
  function newest(list) { return [...list].sort((a, b) => (b.time || 0) - (a.time || 0)); }
  function find(node, id) { if (node.id === id) return node; for (const child of node.dir ? node.children : []) { const hit = find(child, id); if (hit) return hit; } return null; }
  function all(node) { return node.dir ? node.children.flatMap(child => [child, ...all(child)]) : []; }
  const prefs = data => data.docsUi || (data.docsUi = {});
  // The roots this request can see, in the drawer's order.
  function shown(ctx) { const {data, ui} = ctx, accept = ui.docs.accept; return ROOTS.filter(([id]) => (id !== 'sdcard' || prefs(data).advanced) && (!ROOT_MIMES[id] || accept === '*/*' || matches(accept, ROOT_MIMES[id].replace('*', 'x')))); }
  // The stack as nodes; a remembered stack whose documents are gone falls back to Recent.
  function stack(ctx, tree = roots(ctx)) {
    const d = ctx.ui.docs, root = tree[d.stack[0]] && shown(ctx).some(([id]) => id === d.stack[0]) ? tree[d.stack[0]] : null;
    const nodes = root ? d.stack.map(id => find(root, id)) : [];
    if (!root || nodes.some(n => !n || !n.dir)) { d.stack = ['recent']; return [tree.recent]; }
    return nodes;
  }
  // DirectoryLoader: the user's sort, else the directory's preference (last modified or display name, folders first).
  function sorted(node, sort) {
    const by = sort || (node.byDate || node.recents ? 'date' : 'name'), list = [...node.children];
    if (by === 'name') return list.sort((a, b) => (b.dir - a.dir) || a.name.localeCompare(b.name));
    if (by === 'size') return list.sort((a, b) => (a.dir - b.dir) || (b.size || 0) - (a.size || 0));
    return list.sort((a, b) => (b.time || 0) - (a.time || 0));
  }
  function mode(ctx, node) {
    const d = ctx.ui.docs, saved = prefs(ctx.data).modes?.[node.id];
    if (node.recents || d.query != null) return d.userMode || (visual(d.accept) ? 'grid' : 'list');
    return saved || (node.grid ? 'grid' : 'list');
  }
  function size(bytes) { return bytes >= 1073741824 ? `${(bytes / 1073741824).toFixed(2)} GB` : bytes >= 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
  const mask = (file, cls) => `<i class="${cls}" style="--icon:url('assets/ldu-${file}.png')"></i>`;
  function start(data, ui, caller, accept, ctx) {
    const last = prefs(data).last?.[caller];
    ui.docs = {caller, accept, stack: last ? [...last] : ['recent'], drawer: false, touched: false};
    if (!last && !visual(accept)) ui.docs.drawer = true;
    if (ctx) { const nodes = stack({...ctx, ui}); if (nodes[0].recents && !nodes[0].children.some(doc => matches(accept, doc.mime))) ui.docs.drawer = true; }
  }
  function render(ctx) {
    const {ui, t, locale} = ctx, d = ui.docs, tree = roots(ctx), nodes = stack(ctx, tree), cwd = nodes[nodes.length - 1], root = nodes[0];
    const showSize = !!prefs(ctx.data).size, searching = d.query != null;
    let list = searching ? all(root).filter(doc => doc.name.toLocaleLowerCase(locale).includes(d.query.toLocaleLowerCase(locale))) : sorted(cwd, d.sort);
    if (cwd.recents) list = list.filter(doc => matches(d.accept, doc.mime));
    const grid = mode(ctx, cwd) === 'grid';
    const thumb = doc => { const p = doc.photo || doc.thumb?.photo; return p ? `<img class="ldp-thumb" src="${e(ctx.image(p))}" alt="">` : ''; };
    const iconOf = doc => doc.dir ? (doc.album ? 'ic_doc_album' : grid ? 'ic_grid_folder' : 'ic_doc_folder') : mimeIcon(doc.mime);
    const when = doc => doc.time ? window.LPDownloads.when(doc.time, locale) : '';
    const line2 = doc => doc.dir ? '' : `<span class="ldu-line2"><span>${e(when(doc))}</span>${showSize ? `<span>${e(size(doc.size))}</span>` : ''}</span>`;
    const item = doc => {
      const on = doc.dir || matches(d.accept, doc.mime), attrs = on ? `data-action="ldp-open" data-id="${e(doc.id)}"` : 'disabled';
      return grid
        ? `<button class="ldu-cell ldp-doc${on ? '' : ' off'}" ${attrs}>${thumb(doc) || mask(iconOf(doc), 'ldu-mime')}<span class="ldu-band"><span class="ldu-title">${e(doc.name)}</span>${line2(doc)}</span></button>`
        : `<button class="ldu-item ldp-doc${on ? '' : ' off'}" ${attrs}><span class="ldu-icon">${thumb(doc) || mask(iconOf(doc), 'ldu-mime')}</span><span class="ldu-copy"><span class="ldu-title">${e(doc.name)}</span>${line2(doc)}</span></button>`;
    };
    const body = list.length ? `<div class="ldu-${grid ? 'grid' : 'list'}">${list.map(item).join('')}</div>` : `<p class="ldu-empty">${e(t('No items'))}</p>`;
    const act = (action, id, label, file) => `<button data-action="${action}"${id ? ` data-id="${id}"` : ''} aria-label="${e(t(label))}">${mask(file, 'ldu-ab-icon')}</button>`;
    const title = d.searching
      ? `<form class="ldp-search" data-form="ldp-search"><input name="q" type="search" value="${e(d.query || '')}" aria-label="${e(t('Search'))}" autocomplete="off" enterkeyhint="search"></form>`
      : nodes.length > 1 && !searching ? `<button class="ldp-crumb" data-action="ldp-menu" data-id="crumbs"><span>${e(cwd.name)}</span><i></i></button>` : `<h2>${e(searching ? d.query : t(root.name))}</h2>`;
    const actions = (root.search && !d.searching ? act('ldp-search', '', 'Search', 'ic_menu_search') : '') + (cwd.recents || searching ? '' : act('ldp-menu', 'sort', 'Sort by', 'ic_menu_sortby_am')) + act('ldp-menu', 'overflow', 'More options', 'ic_menu_overflow');
    const rows = shown(ctx).map(([id, label, icon]) => `<button class="ldp-root${id === root.id ? ' on' : ''}" data-action="ldp-root" data-id="${id}">${mask(icon, 'ldp-root-icon')}<span><b>${e(t(label))}</b>${tree[id].summary ? `<small>${e(window.AndroidStrings.format(t('%1$s free'), ctx.free || ''))}</small>` : ''}</span></button>`).join('');
    const drawer = d.drawer ? `<div class="ldp-scrim" data-action="ldp-drawer"></div><nav class="ldp-drawer"><header class="ldp-drawer-bar"><h2>${e(t('Open from'))}</h2></header><div class="ldp-roots">${rows}</div></nav>` : '';
    return `<div class="app-view ldu-app ldp-app" data-no-translate><header class="ldu-toolbar"><button class="ldu-nav" data-action="ldp-drawer" aria-label="${e(t(d.drawer ? 'Hide roots' : 'Show roots'))}">${mask('ic_hamburger', 'ldu-ab-icon')}</button>${title}${actions}</header><div class="ldu-content">${body}</div>${drawer}</div>`;
  }
  // The Sort by submenu, the overflow (menu/activity.xml order) and the breadcrumb Spinner's dropdown.
  function menu(kind, ctx) {
    const {ui, t, data} = ctx, d = ui.docs, row = (action, id, label, extra = '') => `<button role="menuitem" data-action="${action}" data-id="${id}">${extra}${e(label)}</button>`;
    let items;
    if (kind === 'sort') items = SORTS.map(([id, label]) => row('ldp-sort', id, t(label))).join('');
    else if (kind === 'crumbs') items = stack(ctx).map((node, i) => row('ldp-crumb', i, i ? node.name : t(node.name), i ? mask('ic_breadcrumb_arrow', 'ldp-crumb-arrow') : '')).join('');
    else {
      const nodes = stack(ctx), grid = mode(ctx, nodes[nodes.length - 1]) === 'grid', p = prefs(data);
      items = row('ldp-view', grid ? 'list' : 'grid', t(grid ? 'List view' : 'Grid view')) + row('ldp-pref', 'advanced', t(p.advanced ? 'Hide internal storage' : 'Show internal storage')) + row('ldp-pref', 'size', t(p.size ? 'Hide file size' : 'Show file size'));
    }
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu ldu-popup${kind === 'crumbs' ? ' ldp-crumbs' : ''}" role="menu">${items}</div>`;
  }
  // An action of the picker: {overlay} opens a menu, {pick} finishes with a document, otherwise it redraws.
  function act(name, id, ctx) {
    const {ui, data} = ctx, d = ui.docs, p = prefs(data);
    if (name === 'ldp-drawer') { d.drawer = !d.drawer; return {}; }
    if (name === 'ldp-root') { d.stack = [id]; d.drawer = false; d.touched = true; d.query = undefined; d.searching = false; return {}; }
    if (name === 'ldp-menu') return {overlay: id};
    if (name === 'ldp-sort') { d.sort = id; return {}; }
    if (name === 'ldp-crumb') { d.stack = d.stack.slice(0, Number(id) + 1); return {}; }
    if (name === 'ldp-view') { const nodes = stack(ctx), cwd = nodes[nodes.length - 1]; if (cwd.recents || d.query != null) d.userMode = id; else (p.modes ||= {})[cwd.id] = id; return {}; }
    if (name === 'ldp-pref') { p[id] = !p[id]; if (id === 'advanced' && !p.advanced && d.stack[0] === 'sdcard') d.stack = ['recent']; return {save: true}; }
    if (name === 'ldp-search') { d.searching = true; return {focus: true}; }
    if (name === 'ldp-open') {
      const tree = roots(ctx), nodes = stack(ctx, tree), doc = find(tree[nodes[0].id], id);
      if (!doc) return {};
      if (doc.dir) { d.stack = d.query != null ? [nodes[0].id, ...path(tree[nodes[0].id], id)] : [...d.stack, doc.id]; d.query = undefined; d.searching = false; d.touched = true; return {}; }
      if (!matches(d.accept, doc.mime)) return {};
      (p.last ||= {})[d.caller] = [...d.stack];
      const {photo, ...file} = doc;
      return {pick: {...file, ...(photo ? {photo} : {})}, save: true};
    }
    return {};
  }
  function path(node, id, trail = []) { for (const child of node.dir ? node.children : []) { if (child.id === id) return [...trail, id]; const hit = path(child, id, [...trail, child.id]); if (hit) return hit; } return null; }
  // A submitted query keeps the SearchView expanded over the results (DocumentsActivity: currentSearch, mSearchExpanded).
  function search(query, ctx) { const d = ctx.ui.docs; d.query = String(query || '').trim() || undefined; d.searching = d.query != null; }
  // Back: the drawer, then the search, then up the stack; 'cancel' when the picker finishes without a document.
  function back(ctx) {
    const d = ctx.ui.docs;
    if (!d) return 'cancel';
    if (d.drawer) { d.drawer = false; return 'render'; }
    if (d.searching || d.query != null) { d.searching = false; d.query = undefined; return 'render'; }
    if (d.stack.length > 1) { d.stack.pop(); return 'render'; }
    return 'cancel';
  }
  window.LPDocPicker = {start, render, menu, act, search, back, roots, photoDoc, mimeOf, matches, size};
})();
