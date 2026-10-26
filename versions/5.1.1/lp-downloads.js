/* Android 5.1 Downloads: the launcher entry (DownloadProviderUi DownloadList) opens DocumentsUI 5.1.1 (LMY48Y) with
   ACTION_MANAGE_ROOT for the Downloads root, in DocumentsTheme (Theme.Material.Light with colorPrimary
   material_blue_grey_800 #37474F, colorPrimaryDark #263238, colorAccent #009688). Manage mode shows no roots drawer:
   the Toolbar carries the root icon tinted for the dark action bar theme and the root's title, Search and Sort by
   (a submenu of By name / By date modified / By size), and Grid view / List view in the overflow (onPrepareOptionsMenu
   hides New folder, advanced devices and file size here). fragment_directory sits on material_grey_50; item_doc_list
   rows are 72 dp with the 24 dp mime icon in a 40 dp box, the Subhead title and the Body1 date and size (90 dp each);
   item_doc_grid cells are 152 x 176 dp on material_grey_300 with the #88000000 caption band. The empty directory says
   "No items". */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const SORTS = [['name', 'By name'], ['date', 'By date modified'], ['size', 'By size']];
  function size(bytes) { return bytes >= 1048576 ? `${(bytes / 1048576).toFixed(2)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`; }
  function sorted(items, sort) {
    const list = [...items];
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'size') list.sort((a, b) => b.size - a.size);
    else list.sort((a, b) => b.time - a.time);
    return list;
  }
  // IconUtils.loadMimeIcon: the ic_doc_* icon of the file's MIME type, in secondary_text_material_light.
  function mime(name) {
    const ext = String(name).toLowerCase().split('.').pop();
    if (ext === 'apk') return 'apk';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['zip', 'gz', 'tar', 'rar', '7z'].includes(ext)) return 'compressed';
    if (['mp3', 'ogg', 'm4a', 'wav', 'flac', 'aac'].includes(ext)) return 'audio';
    if (['mp4', '3gp', 'webm', 'mkv'].includes(ext)) return 'video_am';
    if (['txt', 'html', 'htm', 'csv', 'xml'].includes(ext)) return 'text_am';
    return 'generic_am';
  }
  const icon = (file, cls) => `<i class="${cls}" style="--icon:url('assets/ldu-${file}.png')"></i>`;
  // DocumentsUI's formatTime: today the time, this year the abbreviated date, older dates with the year.
  function when(time, locale, now = new Date()) {
    const d = new Date(time);
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    return d.toLocaleDateString(locale, d.getFullYear() === now.getFullYear() ? {month: 'short', day: 'numeric'} : {year: 'numeric', month: 'short', day: 'numeric'});
  }
  function render(items, ui, t, locale) {
    const sort = ui.dlSort || 'date', grid = !!ui.dlGrid;
    const list = sorted(items || [], sort);
    const open = `data-action="toast" data-id="${e(t('No app can open this file.'))}"`;
    const openOf = item => item.pdf ? `data-action="dl-open-pdf" data-id="${item.time}"` : item.photoId ? `data-action="dl-open-photo" data-id="${item.photoId}"` : open;
    const row = item => `<button class="ldu-item" ${openOf(item)}><span class="ldu-icon">${icon(`ic_doc_${mime(item.name)}`, 'ldu-mime')}</span><span class="ldu-copy"><span class="ldu-title">${e(item.name)}</span><span class="ldu-line2"><span>${e(when(item.time, locale))}</span><span>${e(size(item.size))}</span></span></span></button>`;
    const cell = item => `<button class="ldu-cell" ${open}>${icon(`ic_doc_${mime(item.name)}`, 'ldu-mime')}<span class="ldu-band"><span class="ldu-title">${e(item.name)}</span><span class="ldu-line2"><span>${e(when(item.time, locale))}</span><span>${e(size(item.size))}</span></span></span></button>`;
    const body = list.length ? `<div class="ldu-${grid ? 'grid' : 'list'}">${list.map(grid ? cell : row).join('')}</div>` : `<p class="ldu-empty">${e(t('No items'))}</p>`;
    const action = (act, id, label, file) => `<button data-action="${act}" ${id ? `data-id="${id}"` : ''} aria-label="${e(t(label))}">${icon(file, 'ldu-ab-icon')}</button>`;
    return `<div class="app-view ldu-app"><header class="ldu-toolbar"><button class="ldu-nav" data-action="home" aria-label="${e(t('Downloads'))}">${icon('ic_root_download', 'ldu-ab-icon')}</button><h2>${e(t('Downloads'))}</h2>${action('ldu-search', '', 'Search', 'ic_menu_search')}${action('ldu-menu', 'sort', 'Sort by', 'ic_menu_sortby_am')}${action('ldu-menu', 'overflow', 'More options', 'ic_menu_overflow')}</header><div class="ldu-content">${body}</div></div>`;
  }
  // The Sort by submenu and the overflow open as Material popups (no check marks: the submenu is not a checkable group).
  function menu(kind, ui, t) {
    const items = kind === 'sort' ? SORTS.map(([id, label]) => `<button role="menuitem" data-action="ldu-sort" data-id="${id}">${e(t(label))}</button>`).join('') : `<button role="menuitem" data-action="ldu-view" data-id="${ui.dlGrid ? 'list' : 'grid'}">${e(t(ui.dlGrid ? 'List view' : 'Grid view'))}</button>`;
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu ldu-popup" role="menu">${items}</div>`;
  }
  window.LPDownloads = {render, menu, sorted, size, mime, when, SORTS};
})();
