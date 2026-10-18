/* Android 6.0.1 Drive (Drive 2.3, app/Drive of MTC20K), the app 'drive', on the demo account.
   - The toolbar in m_app_primary quantum_grey300 #e0e0e0 (the status bar m_app_secondary #bdbdbd) with
     quantum_ic_menu_grey600_24, the view title, ic_menu_search_alpha and ic_add for the create panel; the list on
     m_doclist_background #eeeeee.
   - A new account's My Drive shows doc_list_empty_view.xml (ic_empty_drive, the 20 sp "Welcome, your Drive is ready!" and
     the 16 sp details in m_material_grey_600).
   - The create panel (create_entry_dialog_list.xml, "New"): Folder, Upload, Scan, Google Docs, Google Sheets, Google
     Slides with their ic_createpanel_* icons; a new folder or file lists under Folders / Files.
   - The drawer: the account, My Drive, Shared with me, Recent, Starred, Offline, Uploads, Trash, then Notifications,
     Settings, Help & feedback. */
(() => {
  'use strict';
  const T = () => MM.text('drive');
  const A = n => `assets/dr-${n}.png`;
  const files = c => c.data.driveFiles || (c.data.driveFiles = []);
  const ui = c => c.ui.drive || (c.ui.drive = {view: 'menu_my_drive', drawer: false, create: false});
  const esc = (c, s) => c.safe(s);
  function render(c) {
    const t = T(), u = ui(c), list = u.view === 'menu_my_drive' ? files(c) : u.view === 'menu_show_starred' ? files(c).filter(f => f.starred) : u.view === 'menu_show_recent' ? [...files(c)].reverse() : [];
    const folders = list.filter(f => f.type === 'folder'), docs = list.filter(f => f.type !== 'folder');
    const row = f => `<div class="mmgd-row"><img src="${A({folder: 'ic_type_folder', sheet: 'ic_type_sheet', file: 'ic_type_file', image: 'ic_type_image', pdf: 'ic_type_pdf'}[f.type] || 'ic_type_doc')}" alt=""><span>${esc(c, f.name)}</span></div>`;
    const body = list.length ? `${folders.length ? `<div class="mmgd-group">${esc(c, t.t('fast_scroll_title_grouper_collections'))}</div>${folders.map(row).join('')}` : ''}${docs.length ? `<div class="mmgd-group">${esc(c, t.t('title_grouper_files'))}</div>${docs.map(row).join('')}` : ''}`
      : u.view === 'menu_my_drive' ? `<div class="mmgd-empty"><img src="${A('ic_empty_drive')}" alt=""><b>${esc(c, t.t('empty_doclist_for_my_drive_view'))}</b><span>${esc(c, t.t('empty_doclist_for_my_drive_view_details'))}</span></div>`
      : `<div class="mmgd-empty"><b>${esc(c, t.t('empty_doclist'))}</b></div>`;
    const nav = [['menu_my_drive', 'ic_drive_my_drive'], ['menu_shared_with_me', 'ic_empty_shared_with_me'], ['menu_show_recent', 'ic_drive_recently_opened'], ['menu_show_starred', 'ic_drive_starred'], ['menu_show_pinned', 'ic_drive_offline'], ['menu_show_upload', 'ic_drive_upload'], ['menu_show_trash', 'ic_drive_trash']];
    const drawer = u.drawer ? `<div class="mmgd-scrim" data-action="mmgd-drawer"></div><div class="mmgd-drawer"><div class="mmgd-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${nav.map(([k, ic]) => `<button type="button" class="mmgd-di${u.view === k ? ' on' : ''}" data-action="mmgd-view" data-v="${k}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(k))}</span></button>`).join('')}<i class="mmgd-div"></i>
      ${['menu_notifications', 'menu_settings', 'menu_help_and_feedback'].map(k => `<button type="button" class="mmgd-di text" data-action="mmgd-missing">${esc(c, t.t(k))}</button>`).join('')}</div>` : '';
    const create = u.create ? `<div class="mmgd-scrim" data-action="mmgd-create"></div><div class="mmgd-sheet"><div class="mmgd-stitle">${esc(c, t.t('create_new_choice_title'))}</div>
      ${[['folder', 'create_new_choice_folder', 'ic_createpanel_folder'], ['upload', 'create_new_choice_upload', 'ic_createpanel_upload'], ['scan', 'create_new_choice_scan', 'ic_createpanel_scan'], ['doc', 'create_new_choice_document', 'ic_createpanel_doc'], ['sheet', 'create_new_choice_sheet', 'ic_createpanel_sheet'], ['slide', 'create_new_choice_slide', 'ic_createpanel_slide']]
        .map(([id, k, ic]) => `<button type="button" class="mmgd-crow" data-action="mmgd-new" data-t="${id}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(k))}</span></button>`).join('')}</div>` : '';
    return `<div class="mmgd"><div class="mmgd-bar"><button type="button" class="mmgd-btn" data-action="mmgd-drawer"><img src="${A('quantum_ic_menu_grey600_24')}" alt=""></button><span class="mmgd-title">${esc(c, t.t(u.view))}</span>
      <button type="button" class="mmgd-btn" data-action="mmgd-missing"><img src="${A('ic_menu_search_alpha')}" alt=""></button><button type="button" class="mmgd-btn" data-action="mmgd-create" aria-label="${esc(c, t.t('create_new_choice_title'))}"><img src="${A('ic_add')}" alt=""></button></div>
      <div class="mmgd-page">${body}</div>${create}${drawer}</div>`;
  }
  MM.register('drive', {
    statusColor: () => '#bdbdbd',
    render,
    back(c) { const u = ui(c); if (u.drawer || u.create) { u.drawer = u.create = false; c.render(); return true; } if (u.view !== 'menu_my_drive') { u.view = 'menu_my_drive'; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'mmgd-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmgd-create': u.create = !u.create; c.render(); return true;
        case 'mmgd-view': u.view = el.dataset.v; u.drawer = false; c.render(); return true;
        case 'mmgd-new': {
          const type = el.dataset.t; u.create = false;
          if (type === 'folder' || type === 'doc' || type === 'sheet') {
            const base = t.t(type === 'folder' ? 'create_new_choice_folder' : type === 'doc' ? 'create_new_choice_document' : 'create_new_choice_sheet');
            const n = files(c).filter(f => f.type === type).length + 1;
            files(c).push({type, name: n > 1 ? `${base} ${n}` : base}); c.save(); c.render();
          } else c.open(`missing-drive-${type}`);
          return true;
        }
        case 'mmgd-missing': u.drawer = false; c.open('missing-drive-feature'); return true;
      }
      return false;
    }
  });
})();
