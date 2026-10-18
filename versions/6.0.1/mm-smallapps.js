/* Android 6.0.1: four small apps of MTC20K, each on its own APK's resources.
   - 'downloads': the launcher's Downloads (DownloadProviderUi) only forwards (Theme.NoDisplay) to DocumentsUI's
     Downloads root (DownloadProvider's root_downloads): activity.xml's toolbar in DocumentsTheme's colorPrimary
     material_blue_grey_800 #37474f (the status bar material_blue_grey_900 #263238) with the roots button
     (ic_hamburger_alpha), the root's title, search, the grid / list toggle and the overflow (Sort by: By name, By date
     modified, By size; Show internal storage); fragment_directory.xml's "No items" on material_grey_50; the roots
     drawer (256 dp: Recent, Downloads).
   - 'android-pay' (Android Pay 1.0, app/Wallet): the white toolbar (colorPrimaryDark quantum_grey500 #9e9e9e) with the
     Android Pay logo, the empty card list with tp_placeholder_card and "Add a credit or debit card", the + FAB; How to
     pay in the overflow.
   - 'project-fi' (app/Tycho): the demo account is not a Project Fi subscriber, so the app shows its own activation
     error (activation_error_title, activation_error_account_setup) under the google_green toolbar.
   - 'device-policy' (DMAgent 6.81): dm_introduction_activity.xml — the #3aa3db toolbar "Google Apps Device Policy"
     (status #0099cc), introduction_text and info_shared_admin, and the NEXT button over a 1 dp #cccccc line. */
(() => {
  'use strict';
  const T = () => MM.text('smallapps');
  const esc = (c, s) => c.safe(s);
  const bar = (c, title, color, dark, actions = '', lead = '') => `<div class="mmsa-bar${dark ? ' dark' : ''}" style="background:${color}">${lead}<span class="mmsa-title">${esc(c, title)}</span>${actions}</div>`;
  /* GET_CONTENT for images (the launcher's "My photos"): DocumentsUI at its Recent root, the images as
     item_doc_grid.xml tiles (the thumbnail, the file name the camera gives, the date); the roots drawer opens under
     title_open ("Open from"). The picture chosen goes back to the asking app. */
  const pad = n => String(n).padStart(2, '0');
  const imgName = p => { const d = new Date(p.time); return `IMG_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.jpg`; };
  // GET_CONTENT for any file (Gmail's Attach file, MM.pickDocument): the Recent root with the pictures and the files
  // saved to Downloads as tiles; the one chosen goes back to the app as {name, size, mime}.
  MM.pickDocument = (c, onPick) => { c.ui.docPick = onPick; c.open('downloads', 'pick:any'); };
  function pickImage(c) {
    const t = T(), u = c.ui.downloads, w = MM.text('wallpapers');
    const list = (MM.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video').sort((a, b) => b.time - a.time);
    const day = time => esc(c, new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(new Date(time)));
    const files = u.pick === 'any' ? [...docs(c)].sort((a, b) => b.time - a.time).map((d, i) => `<button type="button" class="mmsa-doc" data-action="mmsa-pickdoc" data-i="${docs(c).indexOf(d)}"><span class="mmsa-docicon"><i class="mmsa-mime" style="-webkit-mask-image:url('assets/du-ic_doc_pdf_alpha.png');mask-image:url('assets/du-ic_doc_pdf_alpha.png')"></i></span><span><b>${esc(c, d.name)}</b><small>${day(d.time)}</small></span></button>`).join('') : '';
    const tiles = files + list.map(p => `<button type="button" class="mmsa-doc" data-action="mmsa-pickone" data-id="${p.id}">${MM.media.svg(p, 'mmsa-docsvg', 1)}<span><b>${esc(c, imgName(p))}</b><small>${day(p.time)}</small></span></button>`).join('');
    const roots = u.roots ? `<div class="mmsa-scrim" data-action="mmsa-roots"></div><div class="mmsa-roots"><div class="mmsa-rbar"><span>${esc(c, w.t('DocumentsUI/title_open'))}</span></div><button type="button" class="mmsa-root on" data-action="mmsa-roots"><img src="assets/du-ic_root_recent_alpha.png" alt=""><span>${esc(c, t.t('DocumentsUI/root_recent'))}</span></button><button type="button" class="mmsa-root" data-action="mmsa-roots"><img src="assets/du-ic_root_download_alpha.png" alt=""><span>${esc(c, t.t('DownloadProvider/root_downloads'))}</span></button></div>` : '';
    const btn = (img, action) => `<button type="button" class="mmsa-btn" data-action="${action}"><img src="assets/du-${img}.png" alt=""></button>`;
    return `<div class="mmsa">${bar(c, t.t('DocumentsUI/root_recent'), '#37474f', true, btn('ic_menu_search_alpha', 'mmsa-missing'), btn('ic_hamburger_alpha', 'mmsa-roots'))}
      <div class="mmsa-page grey">${tiles ? `<div class="mmsa-docs">${tiles}</div>` : `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>`}</div>${roots}</div>`;
  }
  // The files of the Downloads root (what the simulator saved there: printed PDFs), item_doc_list.xml rows: the mime
  // icon tinted colorControlNormal, the Subhead title, the date (90 dp) and the size in Body1.
  const docs = c => c.data.docs || (c.data.docs = []);
  function docRows(c) {
    const list = [...docs(c)].sort((a, b) => b.time - a.time);
    if (!list.length) return '';
    const day = time => new Intl.DateTimeFormat(c.locale(), new Date(time).toDateString() === new Date().toDateString() ? {hour: 'numeric', minute: '2-digit'} : {month: 'short', day: 'numeric'}).format(new Date(time));
    return `<div class="mmsa-list">${list.map(d => `<div class="mmsa-file"><i class="mmsa-mime" style="-webkit-mask-image:url('assets/du-ic_doc_pdf_alpha.png');mask-image:url('assets/du-ic_doc_pdf_alpha.png')"></i><span><b>${esc(c, d.name)}</b><small><em>${esc(c, day(d.time))}</em><em>${esc(c, MM.fileSize(c, d.size))}</em></small></span></div>`).join('')}</div>`;
  }
  /* ACTION_CREATE_DOCUMENT (printing's Save as PDF): DocumentsUI in Downloads with fragment_save.xml at the bottom, the
     PDF icon, the file name (selected) and SAVE; the roots drawer opens under title_save ("Save to"). */
  function saveDoc(c) {
    const t = T(), u = c.ui.downloads, s = c.ui.docSave || {name: 'Document.pdf'};
    const roots = u.roots ? `<div class="mmsa-scrim" data-action="mmsa-roots"></div><div class="mmsa-roots"><div class="mmsa-rbar"><span>${esc(c, MM.text('print').t('DocumentsUI/title_save'))}</span></div><button type="button" class="mmsa-root on" data-action="mmsa-roots"><img src="assets/du-ic_root_download_alpha.png" alt=""><span>${esc(c, t.t('DownloadProvider/root_downloads'))}</span></button></div>` : '';
    const btn = (img, action) => `<button type="button" class="mmsa-btn" data-action="${action}"><img src="assets/du-${img}.png" alt=""></button>`;
    return `<div class="mmsa">${bar(c, t.t('DownloadProvider/root_downloads'), '#37474f', true, '', btn('ic_hamburger_alpha', 'mmsa-roots'))}
      <div class="mmsa-page grey">${docRows(c) || `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>`}</div>
      <div class="mmsa-save"><i class="mmsa-mime" style="-webkit-mask-image:url('assets/du-ic_doc_pdf_alpha.png');mask-image:url('assets/du-ic_doc_pdf_alpha.png')"></i><input class="mmsa-savename" value="${esc(c, s.name)}" autocomplete="off" spellcheck="false"><button type="button" data-action="mmsa-save">${esc(c, MM.text('print').t('DocumentsUI/menu_save'))}</button></div>${roots}</div>`;
  }
  /* DocumentsUI browsing a root (ACTION_BROWSE_DOCUMENT_ROOT from Settings > Storage): MediaDocumentsProvider's Images /
     Videos / Audio (the camera's bucket "Camera" as a folder, its pictures as item_doc_grid tiles) and
     ExternalStorageProvider's Internal storage (the primary volume's standard folders; DCIM holds Camera, Download the
     saved files). A folder opens inside the root; Back goes up. */
  const FOLDERS = ['Alarms', 'Android', 'DCIM', 'Download', 'Movies', 'Music', 'Notifications', 'Pictures', 'Podcasts', 'Ringtones'];
  function browse(c) {
    const t = T(), u = c.ui.downloads, path = u.path || [];
    const rootTitle = {images: 'MediaProvider/root_images', videos: 'MediaProvider/root_videos', audio: 'MediaProvider/root_audio', storage: 'ExternalStorageProvider/root_internal_storage'}[u.root];
    const photos = kind => (MM.media?.photos(c) || []).filter(p => !p.trashed && (kind === 'video' ? p.kind === 'video' : p.kind !== 'video')).sort((a, b) => b.time - a.time);
    const folder = (name, n) => `<button type="button" class="mmsa-file" data-action="mmsa-open" data-name="${esc(c, name)}"><i class="mmsa-mime" style="-webkit-mask-image:url('assets/du-ic_doc_folder_alpha.png');mask-image:url('assets/du-ic_doc_folder_alpha.png')"></i><span><b>${esc(c, name)}</b>${n != null ? `<small><em>${n}</em></small>` : ''}</span></button>`;
    const tiles = list => list.length ? `<div class="mmsa-docs">${list.map(p => `<div class="mmsa-doc">${MM.media.svg(p, 'mmsa-docsvg', 1)}<span><b>${esc(c, p.name || (p.kind === 'video' ? 'VID' : 'IMG'))}</b><small>${esc(c, new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(new Date(p.time)))}</small></span></div>`).join('')}</div>` : '';
    let body = '';
    const where = [u.root, ...path].join('/');
    if (where === 'images' || where === 'videos') { const list = photos(u.root === 'videos' ? 'video' : 'image'); body = list.length ? `<div class="mmsa-list">${folder('Camera', list.length)}</div>` : ''; }
    else if (where === 'images/Camera' || where === 'storage/DCIM/Camera') body = tiles(photos('image'));
    else if (where === 'videos/Camera') body = tiles(photos('video'));
    else if (where === 'storage') body = `<div class="mmsa-list">${FOLDERS.map(f => folder(f)).join('')}</div>`;
    else if (where === 'storage/DCIM') body = `<div class="mmsa-list">${folder('Camera')}</div>`;
    else if (where === 'storage/Download') body = docRows(c);
    const title = path.length ? path.at(-1) : t.t(rootTitle);
    return `<div class="mmsa">${bar(c, title, '#37474f', true, '', `<button type="button" class="mmsa-btn" data-action="mmsa-up"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button>`)}<div class="mmsa-page grey">${body || `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>`}</div></div>`;
  }
  // DocumentsUI's search (the action bar's SearchView, search_hint): the root's file names that match.
  function search(c) {
    const t = T(), u = c.ui.downloads, q = (u.q || '').trim().toLowerCase();
    const hits = q ? docs(c).filter(d => d.name.toLowerCase().includes(q)) : [];
    return `<div class="mmsa"><div class="mmsa-bar dark" style="background:#37474f"><button type="button" class="mmsa-btn" data-action="mmsa-searchoff"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><input class="mmsa-q" value="${esc(c, u.q || '')}" placeholder="${esc(c, t.t('framework/search_hint'))}" autocomplete="off"></div>
      <div class="mmsa-page grey">${hits.length ? `<div class="mmsa-list">${hits.map(d => `<div class="mmsa-file"><i class="mmsa-mime" style="-webkit-mask-image:url('assets/du-ic_doc_pdf_alpha.png');mask-image:url('assets/du-ic_doc_pdf_alpha.png')"></i><span><b>${esc(c, d.name)}</b><small><em>${esc(c, MM.fileSize(c, d.size))}</em></small></span></div>`).join('')}</div>` : q ? `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>` : ''}</div></div>`;
  }
  MM.register('downloads', {
    statusColor: () => '#263238',
    render(c) {
      const root = /^root:(\w+)$/.exec(c.ui.sub || '');
      if (root) { c.ui.sub = ''; c.ui.downloads = {root: root[1], path: []}; }
      if (c.ui.downloads?.root) return browse(c);
      if (c.ui.downloads?.searching) return search(c);
      if (c.ui.sub === 'pick:wallpaper' || c.ui.sub === 'pick:any') { c.ui.downloads = {grid: true, roots: false, pick: c.ui.sub.slice(5)}; c.ui.sub = ''; }
      if (c.ui.sub === 'save') { c.ui.sub = ''; c.ui.downloads = {grid: false, roots: false, save: true}; }
      if (c.ui.downloads?.pick) return pickImage(c);
      if (c.ui.downloads?.save) return saveDoc(c);
      const t = T(), u = c.ui.downloads || (c.ui.downloads = {grid: false, roots: false});
      const btn = (img, action, label) => `<button type="button" class="mmsa-btn" data-action="${action}" aria-label="${esc(c, label)}"><img src="assets/du-${img}.png" alt=""></button>`;
      const roots = u.roots ? `<div class="mmsa-scrim" data-action="mmsa-roots"></div><div class="mmsa-roots"><div class="mmsa-rbar"></div><button type="button" class="mmsa-root" data-action="mmsa-roots"><img src="assets/du-ic_root_recent_alpha.png" alt=""><span>${esc(c, t.t('DocumentsUI/root_recent'))}</span></button><button type="button" class="mmsa-root on" data-action="mmsa-roots"><img src="assets/du-ic_root_download_alpha.png" alt=""><span>${esc(c, t.t('DownloadProvider/root_downloads'))}</span></button></div>` : '';
      return `<div class="mmsa">${bar(c, t.t('DownloadProvider/root_downloads'), '#37474f', true, `${btn('ic_menu_search_alpha', 'mmsa-missing', t.t('DocumentsUI/menu_search'))}${btn(u.grid ? 'ic_menu_view_list_alpha' : 'ic_menu_view_grid_alpha', 'mmsa-grid', t.t(u.grid ? 'DocumentsUI/menu_list' : 'DocumentsUI/menu_grid'))}${MM.menu.button(c, 'mmsa-over')}`, btn('ic_hamburger_alpha', 'mmsa-roots', ''))}
        <div class="mmsa-page grey">${docRows(c) || `<div class="mmsa-empty">${esc(c, t.t('DocumentsUI/empty'))}</div>`}</div>${roots}</div>`;
    },
    mount(c, root) {
      const q = root.querySelector('.mmsa-q');
      if (q) { q.addEventListener('input', () => { const p = q.selectionStart; c.ui.downloads.q = q.value; c.render(); const g = c.el.viewport.querySelector('.mmsa-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } }); if (document.activeElement !== q) setTimeout(() => q.focus(), 40); }
      const f = root.querySelector('.mmsa-savename');
      if (f) { f.addEventListener('input', () => { if (c.ui.docSave) c.ui.docSave.name = f.value; }); const dot = f.value.lastIndexOf('.'); setTimeout(() => { f.focus(); f.setSelectionRange(0, dot > 0 ? dot : f.value.length); }, 60); }
    },
    back(c) {
      const u = c.ui.downloads;
      if (u?.root) { if (u.path.length) { u.path.pop(); c.render(); return true; } c.ui.downloads = null; return false; }
      if (u?.searching) { u.searching = false; u.q = ''; c.render(); return true; }
      if (u?.roots) { u.roots = false; c.render(); return true; } if (u?.pick || u?.save) { c.ui.downloads = null; c.ui.docSave = null; c.ui.docPick = null; } return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.downloads;
      if (name === 'mmsa-roots') { u.roots = !u.roots; c.render(); return true; }
      if (name === 'mmsa-grid') { u.grid = !u.grid; c.render(); return true; }
      if (name === 'mm-menu') { c.menu([{label: t.t('DocumentsUI/menu_sort'), action: c => c.dialog({title: t.t('DocumentsUI/menu_sort'), items: ['DocumentsUI/sort_name', 'DocumentsUI/sort_date', 'DocumentsUI/sort_size'].map(k => ({html: c.safe(t.t(k))}))})}, {label: t.t('DocumentsUI/menu_advanced_show'), action: () => {}}]); return true; }
      if (name === 'mmsa-missing') { u.searching = true; u.q = ''; c.render(); return true; }
      if (name === 'mmsa-searchoff') { u.searching = false; u.q = ''; c.render(); return true; }
      if (name === 'mmsa-open') { u.path.push(el.dataset.name); c.render(); return true; }
      if (name === 'mmsa-up') { if (!this.back(c)) c.back(); return true; }
      if (name === 'mmsa-save') {
        const s = c.ui.docSave || {}, name = (s.name || '').trim() || 'Document.pdf';
        docs(c).push({name, size: s.size || 20000, mime: s.mime || 'application/pdf', time: Date.now()}); c.save();
        c.ui.downloads = null; c.ui.docSave = null; c.back(); s.done?.(c);
        return true;
      }
      if (name === 'mmsa-pickone' || name === 'mmsa-pickdoc') {
        const pick = c.ui.docPick, photo = name === 'mmsa-pickone' && (MM.media?.photos(c) || []).find(p => p.id === +el.dataset.id);
        c.ui.downloads = null; c.ui.docPick = null;
        if (!pick) { MM.wallpaperPicked?.(c, +el.dataset.id); c.back(); return true; }
        const d = docs(c)[+el.dataset.i];
        c.back(); pick(c, photo ? {name: imgName(photo), size: 1800000 + (photo.id % 7) * 230000, mime: 'image/jpeg'} : {name: d.name, size: d.size, mime: d.mime || 'application/pdf'});
        return true;
      }
      return false;
    }
  });
  MM.register('android-pay', {
    statusColor: () => '#9e9e9e',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('Wallet/application_name'), '#fff', false, MM.menu.button(c, 'mmsa-over light'), '<img class="mmsa-logo" src="assets/wa-tp_logo_android_pay_color_48dp.png" alt="">')}
        <div class="mmsa-page"><div class="mmsa-pay"><img src="assets/wa-tp_placeholder_card_color_296x187dp.png" alt=""><b>${esc(c, t.t('Wallet/add_payment_card_headline'))}</b></div></div>
        <button type="button" class="mmsa-fab" data-action="mmsa-addcard" aria-label="${esc(c, t.t('Wallet/action_add_payment_card'))}"><img src="assets/wa-ic_add.png" alt=""></button></div>`;
    },
    action(name, el, event, c) {
      if (name === 'mmsa-addcard') { c.open('missing-android-pay-add-card'); return true; }
      if (name === 'mm-menu') { c.menu([{label: T().t('Wallet/menu_item_warm_welcome'), action: c => c.open('missing-android-pay-how-to-pay')}]); return true; }
      return false;
    }
  });
  MM.register('project-fi', {
    statusColor: () => '#0b8043',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('Tycho/app_name'), '#0f9d58', true)}<div class="mmsa-page"><div class="mmsa-text"><h1>${esc(c, t.t('Tycho/activation_error_title'))}</h1><p>${esc(c, t.t('Tycho/activation_error_account_setup'))}</p></div></div></div>`;
    }
  });
  MM.register('device-policy', {
    statusColor: () => '#0099cc',
    render(c) {
      const t = T();
      return `<div class="mmsa">${bar(c, t.t('DMAgent/main_title'), '#3aa3db', true)}<div class="mmsa-page"><div class="mmsa-text"><p>${esc(c, t.t('DMAgent/introduction_text'))}</p><p>${esc(c, t.t('DMAgent/info_shared_admin'))}</p></div></div>
        <div class="mmsa-foot"><button type="button" data-action="mmsa-next">${esc(c, t.t('DMAgent/next_button_label'))}</button></div></div>`;
    },
    action(name, el, event, c) { if (name === 'mmsa-next') { c.open('missing-device-policy-sign-in'); return true; } return false; }
  });
})();
