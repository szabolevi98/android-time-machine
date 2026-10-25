/* Drive 2.1.495 (the LMY48Y image's Drive.apk) on the demo account's local files (data.driveFiles). From the APK:
   - the overflow of menu_doclist_activity.xml as the doclist shows it: Create, Refresh, Filter by, Sort by;
   - Create opens create_document_host_activity.xml: the "New" sheet from the bottom (CreateDocumentItemEnum's Folder,
     Upload and Scan, then Google Docs, Google Sheets and Google Slides, each with its ic_createpanel_* icon);
   - Filter by (FilterByDialogFragment with DocListActivity's list: DriveEntriesFilter COLLECTIONS, PRESENTATIONS,
     SPREADSHEETS, DOCUMENTS, PICTURES, MOVIES, PDF) and Sort by (SortSelectionDialogFragment over SortKind: Title,
     Last modified, Last opened by me, Last edited by me, Quota used, each with its doclist_date_* line);
   - menu_doclist_context.xml for a held item: Share link, Send file, Keep on device / Remove from device, Move,
     Rename (Rename document / Rename folder), Remove (Remove file / Remove folder); Move picks a folder with
     "Navigate up" and "Create new folder";
   - the navigation entries: My Drive, Shared with me, Starred, Recent, On device, Uploads.
   A folder opens on its items, a filter lists every item of its kind ("Filter: %s"), Refresh reads the stored list
   again (nothing syncs). Send file hands the item to Gmail or Email, Share link puts its link in a new mail or
   message. Open with, Download, Add to home screen, Print and Scan are not part of this local Drive. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const DAY = 864e5;
  const ICON = {folder: 'ic_type_folder', doc: 'ic_type_doc', sheet: 'ic_type_sheet', pdf: 'ic_type_pdf', slides: 'ic_type_presentation', image: 'ic_type_image'};
  const FILTERS = [['Folders', 'folder'], ['Presentations', 'slides'], ['Spreadsheets', 'sheet'], ['Text documents', 'doc'], ['Images', 'image'], ['Videos', 'video'], ['PDF', 'pdf']];
  const SORTS = [['Title', 'title'], ['Last modified', 'modified'], ['Last opened by me', 'opened'], ['Last edited by me', 'edited'], ['Quota used', 'quota']];
  const NAV = [['My Drive', 'my_drive', 'my'], ['Shared with me', 'shared_with_me', 'shared'], ['Starred', 'starred', 'starred'], ['Recent', 'recently_opened', 'recent'], ['On device', 'offline', 'offline'], ['Uploads', 'upload', 'uploads']];
  // create_document_host_activity.xml's two rows.
  const CREATE = [['folder', 'Folder'], ['upload', 'Upload'], ['scan', 'Scan'], ['doc', 'Google Docs'], ['sheet', 'Google Sheets'], ['slides', 'Google Slides']];
  const PANEL = {folder: 'folder', upload: 'upload', scan: 'scan', doc: 'doc', sheet: 'sheet', slides: 'slide'};
  const UNTITLED = {doc: 'Untitled document', sheet: 'Untitled spreadsheet', slides: 'Untitled presentation'};
  const D = (ctx, key) => { const row = window.StockStrings?.drive?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  const now = ctx => ctx.now?.getTime?.() ?? Date.now();
  const files = data => data.driveFiles || window.StockApps?.FILES || [];
  const time = (f, key, ctx) => f[key] ?? (key === 'mtime' || (key === 'etime' && f.kind !== 'folder') ? now(ctx) - (f.age || 0) * DAY : null);
  const parent = f => f.parent || 'root';
  const prefs = data => ({sort: 'modified', ...(data.drivePrefs || {})});
  const size = f => f.size ?? (f.kind === 'pdf' ? 1258291 : 0);
  // Formatter.formatFileSize as Lollipop writes it.
  function bytes(n, ctx) {
    const units = ['B', 'KB', 'MB', 'GB']; let v = n, u = 0;
    while (v > 900 && u < units.length - 1) { v /= 1024; u++; }
    const text = v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0);
    return `${Number(text).toLocaleString(ctx.locale, {maximumFractionDigits: 2})} ${units[u]}`;
  }
  const range = (t, ctx) => { const age = Math.floor((now(ctx) - t) / DAY); return age <= 0 ? 'Today' : age === 1 ? 'Yesterday' : age < 7 ? 'Earlier this Week' : age < 31 ? 'Earlier this Month' : 'Older'; };
  const day = (t, ctx) => new Date(t).toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'});
  function listing(ctx) {
    const {ui, data} = ctx, all = files(data).filter(f => !f.trashed), nav = ui.driveNavItem || 'my';
    if (ui.sub === 'results') { const q = String(ui.driveQuery || '').trim().toLocaleLowerCase(); return {title: fmt(D(ctx, 'Search: "%s"'), ui.driveQuery), items: all.filter(f => f.name.toLocaleLowerCase().includes(q))}; }
    if (ui.driveFilter) { const [label, kind] = FILTERS.find(([, k]) => k === ui.driveFilter) || FILTERS[0]; return {title: fmt(D(ctx, 'Filter: %s'), D(ctx, label)), items: all.filter(f => f.kind === kind)}; }
    if (nav === 'starred') return {title: D(ctx, 'Starred'), items: all.filter(f => f.starred)};
    if (nav === 'recent') return {title: D(ctx, 'Recent'), items: all.filter(f => time(f, 'otime', ctx)), sort: 'opened'};
    if (nav === 'offline') return {title: D(ctx, 'On device'), items: all.filter(f => f.pinned)};
    if (nav === 'uploads') return {title: D(ctx, 'Uploads'), items: all.filter(f => f.uploaded)};
    if (nav === 'shared') return {title: D(ctx, 'Shared with me'), items: []};
    const folder = all.find(f => f.id === ui.driveFolder && f.kind === 'folder');
    return {title: folder ? folder.name : D(ctx, 'My Drive'), items: all.filter(f => parent(f) === (folder ? folder.id : 'root')), folder};
  }
  function sorted(items, sort, ctx) {
    const key = {modified: 'mtime', opened: 'otime', edited: 'etime'}[sort];
    if (sort === 'title') return [...items].sort((a, b) => (a.kind === 'folder' ? 0 : 1) - (b.kind === 'folder' ? 0 : 1) || a.name.localeCompare(b.name, ctx.locale));
    if (sort === 'quota') return [...items].sort((a, b) => size(b) - size(a) || a.name.localeCompare(b.name, ctx.locale));
    return [...items].sort((a, b) => (time(b, key, ctx) ?? -Infinity) - (time(a, key, ctx) ?? -Infinity));
  }
  function rows(ctx, items, sort) {
    const key = {modified: 'mtime', opened: 'otime', edited: 'etime'}[sort];
    let last = '';
    return sorted(items, sort, ctx).map(f => {
      const t = key ? time(f, key, ctx) : null, group = key ? (t ? range(t, ctx) : 'Never') : '';
      const head = group && group !== last ? `<h4 class="dr2-group">${e(D(ctx, group))}</h4>` : ''; last = group;
      const line = sort === 'quota' ? fmt(D(ctx, 'Quota used: %s'), bytes(size(f), ctx)) : sort === 'opened' ? fmt(D(ctx, 'Opened by me: %s'), t ? day(t, ctx) : D(ctx, 'Never'))
        : sort === 'edited' ? fmt(D(ctx, 'Edited by me: %s'), t ? day(t, ctx) : D(ctx, 'Never')) : fmt(D(ctx, 'Modified: %s'), day(time(f, 'mtime', ctx), ctx));
      return `${head}<button class="dr2-row" data-action="drv-open" data-id="${e(f.id)}" data-drive-hold="${e(f.id)}"><img src="assets/dr2-${ICON[f.kind] || 'ic_type_doc'}.png" alt=""><span><b>${e(f.name)}</b><small>${e(line)}</small></span>${f.pinned ? '<i class="drv2-pin" aria-hidden="true"></i>' : ''}</button>`;
    }).join('');
  }
  const radio = on => `<i class="drv2-radio${on ? ' on' : ''}"></i>`;
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.driveDialog; if (!d) return '';
    const f = files(data).find(x => x.id === ui.driveTarget), folderish = f?.kind === 'folder';
    const scrim = `<button class="drv2-scrim" data-action="drv-close" aria-label="${e(D(ctx, 'Cancel'))}"></button>`;
    const box = (title, inner, buttons = '') => `${scrim}<div class="drv2-dialog" role="dialog">${title ? `<h3>${e(title)}</h3>` : ''}${inner}${buttons ? `<div class="drv2-buttons">${buttons}</div>` : ''}</div>`;
    const item = (action, id, label, extra = '') => `<button class="drv2-item" data-action="${action}" data-id="${e(id)}">${extra}<span>${e(label)}</span></button>`;
    const cancel = `<button data-action="drv-close">${e(D(ctx, 'Cancel'))}</button>`;
    if (d === 'add') return `<button class="drv2-sheet-scrim" data-action="drv-close" aria-label="${e(D(ctx, 'Cancel'))}"></button><div class="drv2-sheet" role="dialog"><h3>${e(D(ctx, 'New'))}</h3><i class="drv2-divider"></i>${[CREATE.slice(0, 3), CREATE.slice(3)].map(row => `<div class="drv2-choices">${row.map(([id, label]) => `<button class="drv2-choice" data-action="drv-add" data-id="${id}"><img src="assets/dr2-ic_createpanel_${PANEL[id]}.png" alt=""><span>${e(D(ctx, label))}</span></button>`).join('')}</div>`).join('')}</div>`;
    if (d === 'upload') return box(D(ctx, 'Upload'), `<div class="drv2-photos">${(data.photos || []).map(p => `<button data-action="drv-upload" data-id="${p.id}">${window.ICSMedia ? ICSMedia.art(p) : ''}</button>`).join('')}</div>`, cancel);
    if (d === 'folder') return box(D(ctx, 'Folder name'), `<input class="drv2-edit" data-drv-edit maxlength="100" value="${e(D(ctx, 'New folder'))}">`, cancel + `<button data-action="drv-folder-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'filter') return box(D(ctx, 'Filter by'), FILTERS.map(([label, kind]) => item('drv-filter', kind, D(ctx, label), radio(ui.driveFilter === kind))).join(''));
    if (d === 'sort') { const s = prefs(data).sort; return box(D(ctx, 'Sort by'), SORTS.map(([label, id]) => item('drv-sort', id, D(ctx, label), radio(s === id))).join('')); }
    if (d === 'menu' && f) return box(f.name, item('drv-send-link', f.id, D(ctx, 'Share link')) + (folderish ? '' : item('drv-send', f.id, D(ctx, 'Send file')) + item('drv-pin', f.id, D(ctx, f.pinned ? 'Remove from device' : 'Keep on device'))) + item('drv-move', f.id, D(ctx, 'Move')) + item('drv-rename', f.id, D(ctx, 'Rename')) + item('drv-remove', f.id, D(ctx, 'Remove'))).replace('drv2-dialog"', 'drv2-dialog drv2-context"');
    if (d === 'rename' && f) return box(D(ctx, folderish ? 'Rename folder' : 'Rename document'), `<input class="drv2-edit" data-drv-edit maxlength="100" value="${e(f.name)}">`, cancel + `<button data-action="drv-rename-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'remove' && f) return box(D(ctx, folderish ? 'Remove folder' : 'Remove file'), `<p class="drv2-msg">${e(f.name)}</p>`, cancel + `<button data-action="drv-remove-ok">${e(D(ctx, 'Remove button'))}</button>`);
    if (d === 'move' && f) {
      const at = ui.drivePick || 'root', here = files(data).find(x => x.id === at), folders = files(data).filter(x => x.kind === 'folder' && !x.trashed && parent(x) === at && x.id !== f.id);
      const head = `<div class="drv2-pick-head">${here ? `<button data-action="drv-pick-up" aria-label="${e(D(ctx, 'Navigate up'))}"><img src="assets/dr2-ic_back_arrow_alpha.png" alt=""></button>` : ''}<b>${e(here ? here.name : D(ctx, 'My Drive'))}</b><button data-action="drv-pick-new" aria-label="${e(D(ctx, 'Create new folder'))}"><img src="assets/dr2-ic_createpanel_folder.png" alt=""></button></div>`;
      return `${scrim}<div class="drv2-dialog drv2-move" role="dialog">${head}<div class="drv2-pick-list">${folders.map(x => `<button class="drv2-pick" data-action="drv-pick" data-id="${e(x.id)}"><img src="assets/dr2-ic_type_folder.png" alt=""><span>${e(x.name)}</span></button>`).join('') || `<p class="drv2-msg">${e(D(ctx, 'No Items'))}</p>`}</div><div class="drv2-buttons">${cancel}<button data-action="drv-move-ok"${parent(f) === at ? ' disabled' : ''}>${e(D(ctx, 'Move'))}</button></div></div>`;
    }
    if (d === 'pick-new') return box(D(ctx, 'Folder name'), `<input class="drv2-edit" data-drv-edit maxlength="100" value="${e(D(ctx, 'New folder'))}">`, `<button data-action="drv-pick-new-cancel">${e(D(ctx, 'Cancel'))}</button><button data-action="drv-pick-new-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'send' || d === 'link') return box(D(ctx, d === 'send' ? 'Send file' : 'Share link'), (d === 'send' ? [['gmail', 'Gmail'], ['email', 'Email']] : [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']]).map(([app, name]) => `<button class="drv2-item drv2-app" data-action="drv-send-to" data-id="${app}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join(''));
    if (d === 'file-menu' && f) return `<button class="drv2-scrim clear" data-action="drv-close" aria-label="${e(D(ctx, 'Cancel'))}"></button><div class="lp-popup-menu drv2-popup" role="menu">${item('drv-send-link', f.id, D(ctx, 'Share link'))}${item('drv-send', f.id, D(ctx, 'Send file'))}${item('drv-pin', f.id, D(ctx, f.pinned ? 'Remove from device' : 'Keep on device'))}${item('drv-move', f.id, D(ctx, 'Move'))}${item('drv-rename', f.id, D(ctx, 'Rename'))}${item('drv-remove', f.id, D(ctx, 'Remove'))}</div>`;
    return '';
  }
  function list(ctx) {
    const {title, items, sort, folder} = listing(ctx);
    return {title, folder, rows: rows(ctx, items, sort || prefs(ctx.data).sort), empty: !items.length, extra: dialog(ctx)};
  }
  const menu = ctx => [['Create', 'drv-dialog', 'add'], ['Refresh', 'drv-refresh'], ['Filter by', 'drv-dialog', 'filter'], ['Sort by', 'drv-dialog', 'sort']].map(([key, action, id]) => ({action, id, title: D(ctx, key)}));
  const newId = () => `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  function handle(action, id, ctx) {
    const {data, ui} = ctx, all = () => files(data);
    const update = (fid, patch) => { data.driveFiles = all().map(f => f.id === fid ? {...f, ...patch} : f); ctx.save(); };
    const close = () => { ui.driveDialog = ''; };
    const here = () => (ui.driveNavItem || 'my') === 'my' && !ui.driveFilter && ui.sub !== 'results' ? (ui.driveFolder || 'root') : 'root';
    const create = (kind, name) => { const t = now(ctx), f = {id: newId(), name, kind, parent: here(), mtime: t, etime: t, otime: kind === 'folder' ? null : t, date: day(t, ctx), age: 0, text: ''}; data.driveFiles = [f, ...all()]; ctx.save(); return f; };
    const file = all().find(f => f.id === (id || ui.driveTarget));
    switch (action) {
      case 'drv-open': {
        if (!file) return true;
        if (file.kind === 'folder') { (ui.driveStack ||= []).push({folder: ui.driveFolder || '', nav: ui.driveNavItem || 'my', filter: ui.driveFilter || '', sub: ui.sub}); ui.driveFolder = file.id; ui.driveNavItem = 'my'; ui.driveFilter = ''; if (ui.sub === 'results') ui.sub = ''; ctx.render(); return true; }
        update(file.id, {otime: now(ctx)}); ui.driveFrom = ui.sub; ui.driveFile = file.id; ui.sub = 'file'; ctx.render(); return true;
      }
      case 'drv-pin': update(file.id, {pinned: !file.pinned}); close(); ctx.render(); return true;
      case 'drv-hold': ui.driveTarget = id; ui.driveDialog = 'menu'; ctx.render(); return true;
      case 'drv-file-menu': ui.driveTarget = id; ui.driveDialog = 'file-menu'; ctx.render(); return true;
      case 'drv-dialog': ui.overlay = ''; ctx.renderOverlay?.(); ui.driveDialog = id; ctx.render(); return true;
      case 'drv-close': close(); ctx.render(); return true;
      case 'drv-nav': ui.driveNav = false; ui.driveNavItem = id; ui.driveFilter = ''; ui.driveFolder = ''; ui.driveStack = []; if (['search', 'results'].includes(ui.sub)) ui.sub = ''; ctx.render(); return true;
      case 'drv-refresh': ui.overlay = ''; ctx.renderOverlay?.(); ui.driveRefreshing = true; ctx.render(); setTimeout(() => { ui.driveRefreshing = false; if (ui.view === 'drive') ctx.render(); }, 900); return true;
      case 'drv-filter': (ui.driveStack ||= []).push({folder: ui.driveFolder || '', nav: ui.driveNavItem || 'my', filter: ui.driveFilter || '', sub: ui.sub}); ui.driveFilter = id; ui.driveFolder = ''; close(); ctx.render(); return true;
      case 'drv-sort': data.drivePrefs = {...prefs(data), sort: id}; ctx.save(); close(); ctx.render(); return true;
      case 'drv-add': {
        close();
        if (id === 'folder') { ui.driveDialog = 'folder'; ctx.render(); ctx.root.querySelector('[data-drv-edit]')?.select(); return true; }
        if (id === 'upload') { ui.driveDialog = 'upload'; ctx.render(); return true; }
        if (id === 'scan') { ctx.render(); ctx.toast('This feature is not part of the simulator.'); return true; }
        const f = create(id, D(ctx, UNTITLED[id]));
        ui.driveFrom = ui.sub; ui.driveFile = f.id; ui.sub = 'file'; ctx.render(); return true;
      }
      case 'drv-folder-ok': { const name = ctx.root.querySelector('[data-drv-edit]')?.value.trim(); if (!name) return true; create('folder', name); close(); ctx.render(); return true; }
      case 'drv-upload': { const p = (data.photos || []).find(x => String(x.id) === String(id)); if (!p) return true; const f = create('image', p.name); update(f.id, {uploaded: true, photo: p.id, size: p.size || 1843200}); close(); ctx.render(); return true; }
      case 'drv-send': ui.driveTarget = file?.id; ui.driveDialog = 'send'; ctx.render(); return true;
      case 'drv-send-link': ui.driveTarget = file?.id; ui.driveDialog = 'link'; ctx.render(); return true;
      case 'drv-send-to': {
        const f = all().find(x => x.id === ui.driveTarget), link = ui.driveDialog === 'link'; close(); if (!f) return true;
        const url = `https://docs.google.com/${f.kind === 'sheet' ? 'spreadsheets' : f.kind === 'slides' ? 'presentation' : f.kind === 'folder' ? 'folderview' : 'document'}/d/${f.id}`;
        if (link) ctx.shareText(id, `${f.name}\n${url}`, f.name);
        else ctx.shareFile(id, f.photo ? {photo: f.photo} : {vcard: true, mime: 'application/pdf', name: /\.\w+$/.test(f.name) ? f.name : `${f.name}.pdf`, size: size(f) || new TextEncoder().encode(f.text || '').length, text: f.text || ''});
        return true;
      }
      case 'drv-move': ui.driveTarget = file?.id; ui.drivePick = 'root'; ui.driveDialog = 'move'; ctx.render(); return true;
      case 'drv-pick': ui.drivePick = id; ctx.render(); return true;
      case 'drv-pick-up': ui.drivePick = parent(all().find(x => x.id === ui.drivePick) || {}); ctx.render(); return true;
      case 'drv-pick-new': ui.driveDialog = 'pick-new'; ctx.render(); ctx.root.querySelector('[data-drv-edit]')?.select(); return true;
      case 'drv-pick-new-cancel': ui.driveDialog = 'move'; ctx.render(); return true;
      case 'drv-pick-new-ok': { const name = ctx.root.querySelector('[data-drv-edit]')?.value.trim(); if (!name) return true; const t = now(ctx), f = {id: newId(), name, kind: 'folder', parent: ui.drivePick || 'root', mtime: t, etime: t, age: 0, date: day(t, ctx)}; data.driveFiles = [f, ...all()]; ctx.save(); ui.drivePick = f.id; ui.driveDialog = 'move'; ctx.render(); return true; }
      case 'drv-move-ok': {
        const f = all().find(x => x.id === ui.driveTarget); if (!f) return true;
        const from = all().find(x => x.id === parent(f)), to = all().find(x => x.id === ui.drivePick), name = x => x ? x.name : D(ctx, 'My Drive');
        update(f.id, {parent: ui.drivePick || 'root', mtime: now(ctx)}); close(); ctx.render();
        ctx.toast(from ? fmt(D(ctx, '%1$s has been moved from %2$s to %3$s.'), f.name, name(from), name(to)) : fmt(D(ctx, '%1$s has been moved to %2$s.'), f.name, name(to))); return true;
      }
      case 'drv-rename': ui.driveTarget = file?.id; ui.driveDialog = 'rename'; ctx.render(); ctx.root.querySelector('[data-drv-edit]')?.select(); return true;
      case 'drv-rename-ok': { const name = ctx.root.querySelector('[data-drv-edit]')?.value.trim(); if (name) update(ui.driveTarget, {name, mtime: now(ctx), etime: now(ctx)}); close(); ctx.render(); return true; }
      case 'drv-remove': ui.driveTarget = file?.id; ui.driveDialog = 'remove'; ctx.render(); return true;
      case 'drv-remove-ok': { update(ui.driveTarget, {trashed: true}); if (ui.sub === 'file' && ui.driveFile === ui.driveTarget) ui.sub = ui.driveFrom || ''; close(); ctx.render(); return true; }
      default: return false;
    }
  }
  function back(ui) {
    if (ui.driveDialog) { ui.driveDialog = ''; return true; }
    if (!ui.sub && (ui.driveFolder || ui.driveFilter)) { const prev = ui.driveStack?.pop() || {}; ui.driveFolder = prev.folder || ''; ui.driveFilter = prev.filter || ''; ui.driveNavItem = prev.nav || 'my'; if (prev.sub) ui.sub = prev.sub; return true; }
    if (!ui.sub && ui.driveNavItem && ui.driveNavItem !== 'my') { ui.driveNavItem = 'my'; return true; }
    return false;
  }
  window.LPDrive = {list, dialog, menu, handle, back, files, NAV, D};
})();
