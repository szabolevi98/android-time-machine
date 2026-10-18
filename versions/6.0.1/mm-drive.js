/* Android 6.0.1 Drive (Drive 2.3, app/Drive of MTC20K), the app 'drive', on the demo account.
   - The toolbar in m_app_primary quantum_grey300 #e0e0e0 (the status bar m_app_secondary #bdbdbd) with
     quantum_ic_menu_grey600_24, the view title, ic_menu_search_alpha and ic_add for the create panel; the list on
     m_doclist_background #eeeeee.
   - A new account's My Drive shows doc_list_empty_view.xml (ic_empty_drive, the 20 sp "Welcome, your Drive is ready!" and
     the 16 sp details in m_material_grey_600); the other views their own empty_doclist_for_*_view texts.
   - The create panel (create_entry_dialog_list.xml, "New"): Folder, Upload, Scan, Google Docs, Google Sheets, Google
     Slides with their ic_createpanel_* icons; a new folder or file lists under Folders / Files with the
     default_new_*_title names. Upload takes a file through DocumentsUI's picker (MM.pickDocument); Scan is the
     scanner (ds_title_activity_capture: the viewfinder and ds_shutter_holo, then the page with
     ds_checkmark_holo_light), which saves Scanned_<date>.pdf.
   - Each row's overflow: Star / Unstar, Rename, Keep offline, Remove (to Trash, announce_*_removed).
   - The drawer: the account, My Drive, Shared with me, Recent, Starred, Offline, Uploads, Trash, then Notifications
     (the Activity card: recent_activity_empty), Settings (drive_preferences, mm-appprefs.js), Help & feedback.
   - Search (search_hint "Search my Drive"): the names that match under "Search Results", else "No results.".
   - The picker other apps use (MM.drivePick, Gmail's Insert from Drive): My Drive's files under a close button; the
     one chosen goes back to the app. */
(() => {
  'use strict';
  const T = () => MM.text('drive');
  const A = n => `assets/dr-${n}.png`;
  const files = c => c.data.driveFiles || (c.data.driveFiles = []);
  const ui = c => c.ui.drive || (c.ui.drive = {view: 'menu_my_drive', drawer: false, create: false});
  const esc = (c, s) => c.safe(s);
  const ICON = {folder: 'ic_type_folder', sheet: 'ic_type_sheet', slide: 'ic_type_presentation', file: 'ic_type_file', image: 'ic_type_image', pdf: 'ic_type_pdf', doc: 'ic_type_doc'};
  const EMPTY = {menu_shared_with_me: ['empty_doclist_for_shared_with_me_view'], menu_show_recent: ['empty_doclist_for_recent_view'],
    menu_show_starred: ['empty_doclist_for_starred_view', 'empty_doclist_for_starred_view_details'], menu_show_pinned: ['empty_doclist_for_pinned_view', 'empty_doclist_for_pinned_view_details'],
    menu_show_upload: ['empty_doclist_for_uploads_view', 'empty_doclist_for_uploads_view_details'], menu_show_trash: ['empty_doclist']};
  const live = c => files(c).filter(f => !f.trashed);
  function inView(c, v) {
    if (v === 'menu_my_drive') return live(c);
    if (v === 'menu_show_starred') return live(c).filter(f => f.starred);
    if (v === 'menu_show_recent') return live(c).filter(f => f.type !== 'folder').sort((a, b) => (b.time || 0) - (a.time || 0));
    if (v === 'menu_show_pinned') return live(c).filter(f => f.offline);
    if (v === 'menu_show_upload') return live(c).filter(f => f.uploaded);
    if (v === 'menu_show_trash') return files(c).filter(f => f.trashed);
    return [];
  }
  const row = (c, f, pick) => `<div class="mmgd-row"${pick ? ` data-action="mmgd-pickone" data-i="${files(c).indexOf(f)}"` : ''}><img src="${A(ICON[f.type] || 'ic_type_doc')}" alt=""><span>${esc(c, f.name)}</span>${f.starred && !pick ? '<i class="mmgd-star"></i>' : ''}
    ${pick ? '' : `<button type="button" class="mmgd-more" data-action="mmgd-more" data-i="${files(c).indexOf(f)}" aria-label="${esc(c, T().t('menu_overflow_content_description'))}"><img src="assets/gm-ic_menu_moreoverflow_mtrl_alpha.png" alt=""></button>`}</div>`;
  function grouped(c, list, pick) {
    const t = T(), folders = list.filter(f => f.type === 'folder'), docs = list.filter(f => f.type !== 'folder');
    return `${folders.length ? `<div class="mmgd-group">${esc(c, t.t('fast_scroll_title_grouper_collections'))}</div>${folders.map(f => row(c, f, pick)).join('')}` : ''}${docs.length ? `<div class="mmgd-group">${esc(c, t.t('title_grouper_files'))}</div>${docs.map(f => row(c, f, pick)).join('')}` : ''}`;
  }
  const empty = (c, title, details) => `<div class="mmgd-empty">${details === undefined ? `<img src="${A('ic_empty_drive')}" alt="">` : ''}<b>${esc(c, title)}</b>${details ? `<span>${esc(c, details)}</span>` : ''}</div>`;

  function search(c) {
    const t = T(), u = ui(c), q = (u.q || '').trim().toLowerCase(), hits = q ? live(c).filter(f => f.name.toLowerCase().includes(q)) : [];
    const body = !q ? '' : hits.length ? `<div class="mmgd-group">${esc(c, t.t('fast_scroll_search_result_grouper'))}</div>${hits.map(f => row(c, f)).join('')}` : empty(c, t.t('empty_doclist_for_search_view'), '');
    return `<div class="mmgd"><div class="mmgd-bar white"><button type="button" class="mmgd-btn" data-action="mmgd-searchoff" aria-label="${esc(c, t.t('action_bar_close_search_button_desc'))}"><img src="${A('ic_back_grey')}" alt=""></button>
      <input class="mmgd-q" value="${esc(c, u.q || '')}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off" spellcheck="false">${u.q ? `<button type="button" class="mmgd-btn" data-action="mmgd-qclear" aria-label="${esc(c, t.t('menu_search_clear'))}"><img src="${A('ic_close')}" alt=""></button>` : ''}</div>
      <div class="mmgd-page">${body}</div></div>`;
  }
  // The scanner: the viewfinder with a page under the camera, the shutter; then the page taken with the check mark.
  function scan(c) {
    const t = T(), u = ui(c);
    if (u.scan === 'page') return `<div class="mmgd mmgd-scan"><div class="mmgd-sbar"><button type="button" class="mmgd-btn" data-action="mmgd-scanoff"><img src="${A('ic_close')}" alt=""></button><span>${esc(c, u.scanName)}</span><button type="button" class="mmgd-btn" data-action="mmgd-scansave"><img src="${A('ds_checkmark_holo_light')}" alt=""></button></div>
      <div class="mmgd-spage"><i class="mmgd-paper done"><i></i><i></i><i></i><i></i></i></div><div class="mmgd-shint"><b>${esc(c, t.t('ds_scanner_introduction_header'))}</b><span>${esc(c, t.t('ds_scanner_introduction_text'))}</span></div></div>`;
    return `<div class="mmgd mmgd-scan"><div class="mmgd-sbar"><button type="button" class="mmgd-btn" data-action="mmgd-scanoff"><img src="${A('ic_close')}" alt=""></button><span>${esc(c, t.t('ds_title_activity_capture'))}</span></div>
      <div class="mmgd-sview"><i class="mmgd-paper"><i></i><i></i><i></i><i></i></i></div><div class="mmgd-sfoot"><button type="button" class="mmgd-shutter" data-action="mmgd-shutter"><img src="${A('ds_shutter_holo')}" alt=""></button></div></div>`;
  }
  function picker(c) {
    const t = T(), list = live(c).filter(f => f.type !== 'folder');
    return `<div class="mmgd"><div class="mmgd-bar"><button type="button" class="mmgd-btn" data-action="mmgd-pickoff"><img src="${A('ic_close')}" alt=""></button><span class="mmgd-title">${esc(c, ui(c).pickTitle || t.t('menu_my_drive'))}</span></div>
      <div class="mmgd-page">${list.length ? grouped(c, list, true) : empty(c, t.t('empty_doclist_for_my_drive_view'), t.t('empty_doclist_for_my_drive_view_details'))}</div></div>`;
  }
  function render(c) {
    const t = T(), u = ui(c);
    if (c.ui.sub === 'pick') { c.ui.sub = ''; u.pick = true; u.drawer = u.create = false; }
    // The Drive scan shortcut (ScanToDriveActivity) goes straight to the scanner.
    if (c.ui.sub === 'scan') { c.ui.sub = ''; u.scan = 'view'; u.drawer = u.create = u.search = false; }
    if (u.pick) return picker(c);
    if (u.scan) return scan(c);
    if (u.search) return search(c);
    const list = inView(c, u.view);
    let body;
    if (u.view === 'menu_notifications') body = `<div class="mmgd-card"><b>${esc(c, t.t('recent_activity_card_title'))}</b><span>${esc(c, t.t('recent_activity_empty'))}</span></div>`;
    else if (list.length) body = grouped(c, list);
    else if (u.view === 'menu_my_drive') body = empty(c, t.t('empty_doclist_for_my_drive_view'), t.t('empty_doclist_for_my_drive_view_details'));
    else { const [a, b] = EMPTY[u.view]; body = empty(c, t.t(a), b ? t.t(b) : ''); }
    const nav = [['menu_my_drive', 'ic_drive_my_drive'], ['menu_shared_with_me', 'ic_empty_shared_with_me'], ['menu_show_recent', 'ic_drive_recently_opened'], ['menu_show_starred', 'ic_drive_starred'], ['menu_show_pinned', 'ic_drive_offline'], ['menu_show_upload', 'ic_drive_upload'], ['menu_show_trash', 'ic_drive_trash']];
    const drawer = u.drawer ? `<div class="mmgd-scrim" data-action="mmgd-drawer"></div><div class="mmgd-drawer"><div class="mmgd-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${nav.map(([k, ic]) => `<button type="button" class="mmgd-di${u.view === k ? ' on' : ''}" data-action="mmgd-view" data-v="${k}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(k))}</span></button>`).join('')}<i class="mmgd-div"></i>
      ${['menu_notifications', 'menu_settings', 'menu_help_and_feedback'].map(k => `<button type="button" class="mmgd-di text${u.view === k ? ' on' : ''}" data-action="mmgd-foot" data-k="${k}">${esc(c, t.t(k))}</button>`).join('')}</div>` : '';
    const create = u.create ? `<div class="mmgd-scrim" data-action="mmgd-create"></div><div class="mmgd-sheet"><div class="mmgd-stitle">${esc(c, t.t('create_new_choice_title'))}</div>
      ${[['folder', 'create_new_choice_folder', 'ic_createpanel_folder'], ['upload', 'create_new_choice_upload', 'ic_createpanel_upload'], ['scan', 'create_new_choice_scan', 'ic_createpanel_scan'], ['doc', 'create_new_choice_document', 'ic_createpanel_doc'], ['sheet', 'create_new_choice_sheet', 'ic_createpanel_sheet'], ['slide', 'create_new_choice_slide', 'ic_createpanel_slide']]
        .map(([id, k, ic]) => `<button type="button" class="mmgd-crow" data-action="mmgd-new" data-t="${id}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(k))}</span></button>`).join('')}</div>` : '';
    return `<div class="mmgd"><div class="mmgd-bar"><button type="button" class="mmgd-btn" data-action="mmgd-drawer"><img src="${A('quantum_ic_menu_grey600_24')}" alt=""></button><span class="mmgd-title">${esc(c, t.t(u.view))}</span>
      <button type="button" class="mmgd-btn" data-action="mmgd-search" aria-label="${esc(c, t.t('menu_search'))}"><img src="${A('ic_menu_search_alpha')}" alt=""></button><button type="button" class="mmgd-btn" data-action="mmgd-create" aria-label="${esc(c, t.t('create_new_choice_title'))}"><img src="${A('ic_add')}" alt=""></button></div>
      <div class="mmgd-page">${body}</div>${create}${drawer}</div>`;
  }
  const add = (c, f) => { files(c).push({time: Date.now(), ...f}); c.save(); };
  const typeOf = mime => mime?.startsWith('image/') ? 'image' : mime === 'application/pdf' ? 'pdf' : 'file';
  const MIME = {image: 'image/jpeg', pdf: 'application/pdf'};
  // Other apps' Insert from Drive.
  MM.drivePick = (c, onPick, title) => { c.ui.drivePick = onPick; ui(c).pickTitle = title || ''; c.open('drive', 'pick'); };
  MM.register('drive', {
    statusColor: c => ui(c).scan ? '#000' : '#bdbdbd',
    render,
    mount(c, root) {
      const q = root.querySelector('.mmgd-q');
      if (q) { q.addEventListener('input', () => { const p = q.selectionStart; ui(c).q = q.value; c.render(); const g = c.el.viewport.querySelector('.mmgd-q'); if (g) { g.focus(); g.setSelectionRange(p, p); } }); if (document.activeElement !== q) setTimeout(() => q.focus(), 40); }
    },
    back(c) {
      const u = ui(c);
      if (u.pick) { u.pick = false; c.ui.drivePick = null; return false; }
      if (u.scan) { u.scan = ''; c.render(); return true; }
      if (u.search) { u.search = false; u.q = ''; c.render(); return true; }
      if (u.drawer || u.create) { u.drawer = u.create = false; c.render(); return true; }
      if (u.view !== 'menu_my_drive') { u.view = 'menu_my_drive'; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'mmgd-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmgd-create': u.create = !u.create; c.render(); return true;
        case 'mmgd-view': u.view = el.dataset.v; u.drawer = false; c.render(); return true;
        case 'mmgd-foot': {
          const k = el.dataset.k; u.drawer = false;
          if (k === 'menu_notifications') { u.view = k; c.render(); }
          else if (k === 'menu_settings') MM.openPrefs(c, 'drive', 'drive_preferences', t.t('menu_settings'));
          else c.open('help', 'drive');
          return true;
        }
        case 'mmgd-search': u.search = true; u.q = ''; c.render(); return true;
        case 'mmgd-searchoff': u.search = false; u.q = ''; c.render(); return true;
        case 'mmgd-qclear': u.q = ''; c.render(); return true;
        case 'mmgd-new': {
          const type = el.dataset.t; u.create = false;
          if (type === 'upload') { MM.pickDocument(c, (c, f) => { add(c, {type: typeOf(f.mime), name: f.name, size: f.size, uploaded: true}); c.toast(AndroidStrings.format(t.t('grid_sync_upload_label_format'), f.name)); c.render(); }); return true; }
          if (type === 'scan') { u.scan = 'view'; c.render(); return true; }
          const base = t.t({folder: 'default_new_folder_title', doc: 'default_new_kix_title', sheet: 'default_new_trix_title', slide: 'default_new_punch_title'}[type]);
          const n = files(c).filter(f => f.type === type && f.name.startsWith(base)).length;
          add(c, {type, name: n ? `${base} (${n})` : base}); c.render();
          return true;
        }
        case 'mmgd-shutter': {
          const d = new Date(), p = x => String(x).padStart(2, '0');
          u.scanName = AndroidStrings.format(t.t('ds_scanned_file_name'), `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`);
          u.scan = 'page'; c.render(); return true;
        }
        case 'mmgd-scanoff': u.scan = ''; c.render(); return true;
        case 'mmgd-scansave': add(c, {type: 'pdf', name: `${u.scanName}.pdf`, size: 412000, uploaded: true}); u.scan = ''; c.toast(AndroidStrings.format(t.t('grid_sync_upload_label_format'), `${u.scanName}.pdf`)); c.render(); return true;
        case 'mmgd-more': {
          const f = files(c)[+el.dataset.i]; if (!f) return true;
          if (f.trashed) return c.menu([{label: t.t('menu_delete'), action: c => { files(c).splice(files(c).indexOf(f), 1); c.save(); c.render(); }}]), true;
          c.menu([{label: t.t(f.starred ? 'action_card_unstar' : 'action_card_star'), action: c => { f.starred = !f.starred; c.save(); c.render(); }},
            {label: t.t('menu_rename'), action: c => {
              let v = f.name;
              c.dialog({title: t.t('menu_rename'), html: `<div class="mmst-edit"><input type="text" class="mmst-input mmgd-rename" value="${esc(c, v)}" spellcheck="false"></div>`,
                mount(c, win) { const i = win.querySelector('.mmgd-rename'); i.addEventListener('input', () => { v = i.value.trim(); }); setTimeout(() => { i.focus(); i.select(); }, 50); },
                buttons: [{label: t.t('chips_action_cancel')}, {label: t.t('button_ok'), action: c => { if (v && v !== f.name) { f.name = v; c.save(); c.toast(AndroidStrings.format(t.t('announce_rename'), v)); c.render(); } }}]});
            }},
            ...(f.type === 'folder' ? [] : [{label: t.t('menu_offline'), checked: !!f.offline, action: c => { f.offline = !f.offline; c.save(); c.render(); }}]),
            {label: t.t('menu_delete'), action: c => { f.trashed = true; c.save(); c.toast(t.t(f.type === 'folder' ? 'announce_collection_removed' : 'announce_document_removed')); c.render(); }}]);
          return true;
        }
        // Back with the picker still up: back() ends it and leaves for the asking app.
        case 'mmgd-pickoff': c.back(); return true;
        case 'mmgd-pickone': {
          const f = files(c)[+el.dataset.i], pick = c.ui.drivePick;
          c.back();
          if (f && pick) pick(c, {name: f.name, size: f.size || 24000, mime: MIME[f.type] || 'application/octet-stream'});
          return true;
        }
      }
      return false;
    }
  });
})();
