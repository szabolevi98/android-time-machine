/* Android 4.4 Downloads: the launcher entry (DownloadProvider ui DownloadList.onCreate) trampolines into DocumentsUI
   with ACTION_MANAGE_ROOT for the "Downloads" root (frameworks/base/packages/DocumentsUI, Theme.Holo.Light).
   Manage mode has no roots drawer; the action bar shows the root icon (ic_root_download) and title with Search and
   Sort by, and Grid view / List view in the overflow. item_doc_list rows: the 32 dp ic_doc_* mime icon, title, date and size;
   the empty directory says "No items". */
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
  // IconUtils.loadMimeIcon: the ic_doc_* icon of the file's MIME type.
  function mime(name) {
    const ext = String(name).toLowerCase().split('.').pop();
    if (ext === 'apk') return 'apk';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['zip', 'gz', 'tar', 'rar', '7z'].includes(ext)) return 'compressed';
    if (['mp3', 'ogg', 'm4a', 'wav', 'flac', 'aac'].includes(ext)) return 'audio_am';
    if (['mp4', '3gp', 'webm', 'mkv'].includes(ext)) return 'video_am';
    if (['txt', 'html', 'htm', 'csv', 'xml'].includes(ext)) return 'text_am';
    return 'generic_am';
  }
  function render(items, ui, t, locale) {
    const sort = ui.dlSort || 'date', grid = !!ui.dlGrid;
    const list = sorted(items || [], sort);
    const open = item => item.pdf ? `data-action="dl-open-pdf" data-id="${item.time}"` : item.photoId ? `data-action="dl-open-photo" data-id="${item.photoId}"` : `data-action="toast" data-id="${e(t('No app can open this file.'))}"`;
    const row = item => `<button class="kdu-item" ${open(item)}><span class="kdu-icon"><img src="assets/kdu-ic_doc_${mime(item.name)}.png" alt=""></span><span class="kdu-copy"><span class="kdu-title">${e(item.name)}</span><span class="kdu-line2"><span>${e(new Date(item.time).toLocaleDateString(locale, {month: 'short', day: 'numeric'}))}</span><span>${e(size(item.size))}</span></span></span></button>`;
    const body = list.length ? `<div class="kdu-${grid ? 'grid' : 'list'}">${list.map(row).join('')}</div>` : `<p class="kdu-empty">${e(t('No items'))}</p>`;
    return `<div class="app-view kdu-app"><header class="kdu-ab"><button class="kdu-home" data-action="home" aria-label="${e(t('Downloads'))}"><img src="assets/kdu-ic_root_download.png" alt=""></button><h2>${e(t('Downloads'))}</h2><button data-action="kdu-search" aria-label="${e(t('Search'))}"><img src="assets/kdu-ic_menu_search.png" alt=""></button><button data-action="kdu-menu" data-id="sort" aria-label="${e(t('Sort by'))}"><img src="assets/kdu-ic_menu_sortby_am.png" alt=""></button><button data-action="kdu-menu" data-id="overflow" aria-label="${e(t('More options'))}"><img src="assets/kdu-ic_menu_overflow.png" alt=""></button></header><div class="kdu-content">${body}</div></div>`;
  }
  function menu(kind, ui, t) {
    const items = kind === 'sort' ? SORTS.map(([id, label]) => `<button data-action="kdu-sort" data-id="${id}" role="menuitemradio" aria-checked="${(ui.dlSort || 'date') === id}">${e(t(label))}<img src="assets/btn_radio_${(ui.dlSort || 'date') === id ? 'on' : 'off'}_holo_light.png" alt=""></button>`).join('') : `<button data-action="kdu-view" data-id="${ui.dlGrid ? 'list' : 'grid'}">${e(t(ui.dlGrid ? 'List view' : 'Grid view'))}</button>`;
    return `<div class="menu-scrim" data-action="close-overlay"></div><div class="kdu-menu" role="menu">${items}</div>`;
  }
  window.KKDownloads = {render, menu, sorted, size, mime, SORTS};
})();
/* Downloads in the 4.4.4 shell (docs/plans/engine-migration.md): the screen, its Sort by / overflow menus and its
   rows opening a PDF or a picture, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {data, i18n, openApp, overlayRoot, photosContext, printContext, render, renderOverlay, toast, ui} = c;
    return {
      render() {
        return KKDownloads.render(data.downloads || [], ui, key => i18n.t(key), i18n.locale());
      },
      click(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'kdu-menu': ui.overlay = `kdu-${id}`; renderOverlay(); break;
          case 'kdu-sort': ui.dlSort = id; ui.overlay = ''; render(); break;
          case 'kdu-view': ui.dlGrid = id === 'grid'; ui.overlay = ''; render(); break;
          case 'kdu-search': toast('No items'); break;
          case 'dl-open-pdf': { const doc = (data.downloads || []).find(d => String(d.time) === id); if (doc) PrintSpooler.openPdf(printContext(), doc); break; }
          case 'dl-open-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (!photo) break; openApp('photos'); ui.photosList = 'all'; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(p => p.id === photo.id)); ui.selectedPhoto = photo.id; ui.sub = 'photo'; render(); break; }
          default: return false;
        }
        return true;
      },
      overlay() {
        if (ui.overlay === 'kdu-sort' || ui.overlay === 'kdu-overflow') {
          overlayRoot.innerHTML = KKDownloads.menu(ui.overlay.slice(4), ui, key => i18n.t(key));
        } else return false;
        return true;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    click: (action, button, c, event) => scope(c).click(action, button, event),
    overlay: c => scope(c).overlay()
  };
  for (const id of ['downloads']) KK.register(id, spec);
})();
