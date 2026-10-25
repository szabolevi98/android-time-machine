/* Drive 1.2.484 (the KTU84P image's Drive.apk) on the demo account's local files (data.driveFiles, shared with
   Quickoffice). From the APK:
   - menu_doclist_activity.xml's overflow: Add new (CreateEntryDialogFragment: SimpleEntryCreator's Folder, Document and
     Spreadsheet, then Scan and Upload), Refresh, Filter by (FilterByDialogFragment with the doclist's filters: Folders,
     Presentations, Spreadsheets, Text documents, Images, Videos, PDF; Notes only with the Keep feature), Sort by (qG:
     Title, Last modified, Last opened by me, Last edited by me, Quota used), Settings (preferences.xml as
     DocsPreferencesActivity keeps it without the server's feature flags: Documents cache › Clear cache, Data Usage,
     Storage, About), Product Tour;
   - the navigation panel's entries (iM): My Drive, Shared with me, Starred, Recent, Offline, Uploads;
   - menu_doclist_context.xml for a held item: Send, Move to… (pick_entry_dialog_header.xml / _row.xml), Available
     offline, Send link, Rename (Rename document / Rename folder), Remove (Remove document / Remove folder);
   - the detail panel (detail_fragment.xml): the star, the title, the thumbnail, Offline › Available offline, Who has
     access, General info (Modified, Modified by me, Opened by me, Quota used) and the close button.
   Sorting groups the list by Drive's time ranges; a filter lists every item of its kind ("Filter: %s"); a folder opens
   on its own items. Refresh reads the stored list again (nothing syncs). Send hands the item to Gmail or Email, Send
   link puts its link in a new mail or message. Open with, Download a copy, Add to home screen, Print, Scan and the
   web pages (Product Tour, Buy more storage, About, licenses) are not part of this local Drive. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const ACCOUNT = 'kitkat.demo@gmail.com', DAY = 864e5;
  const ICON = {folder: 'ic_type_folder', doc: 'ic_type_doc', sheet: 'ic_type_sheet', pdf: 'ic_type_pdf', slides: 'ic_type_presentation', image: 'ic_type_image'};
  // FilterByDialogFragment's list and the kind each filter keeps.
  const FILTERS = [['Folders', 'folder'], ['Presentations', 'slides'], ['Spreadsheets', 'sheet'], ['Text documents', 'doc'], ['Images', 'image'], ['Videos', 'video'], ['PDF', 'pdf']];
  const SORTS = [['Title', 'title'], ['Last modified', 'modified'], ['Last opened by me', 'opened'], ['Last edited by me', 'edited'], ['Quota used', 'quota']];
  const NAV = [['My Drive', 'my_drive', 'my'], ['Shared with me', 'shared_with_me', 'shared'], ['Starred', 'starred', 'starred'], ['Recent', 'recently_opened', 'recent'], ['Offline', 'offline', 'offline'], ['Uploads', 'upload', 'uploads']];
  const D = (ctx, key) => { const row = window.StockStrings?.drive?.[key]; return row ? AndroidStrings.pick(row, String(ctx.locale || 'en').slice(0, 2), row.en || key) : ctx.t(key); };
  const fmt = (...args) => AndroidStrings.format(...args);
  const now = ctx => ctx.now?.getTime?.() ?? Date.now();
  // The stored list (Quickoffice's too); an item without times takes them from its age in days.
  const files = data => data.driveFiles || window.StockApps?.FILES || [];
  const time = (f, key, ctx) => f[key] ?? (key === 'mtime' || (key === 'etime' && f.kind !== 'folder') ? now(ctx) - (f.age || 0) * DAY : null);
  const parent = f => f.parent || 'root';
  const prefs = data => ({sort: 'modified', wifiOnly: true, ...(data.drivePrefs || {})});
  const size = f => f.size ?? (f.kind === 'pdf' ? 1258291 : 0);
  // Formatter.formatFileSize as KitKat writes it.
  function bytes(n, ctx) {
    const units = ['B', 'KB', 'MB', 'GB']; let v = n, u = 0;
    while (v > 900 && u < units.length - 1) { v /= 1024; u++; }
    const text = v < 1 ? v.toFixed(2) : v < 10 ? v.toFixed(2) : v < 100 ? v.toFixed(1) : v.toFixed(0);
    return `${Number(text).toLocaleString(ctx.locale, {maximumFractionDigits: 2})} ${units[u]}`;
  }
  const range = (t, ctx) => { const age = Math.floor((now(ctx) - t) / DAY); return age <= 0 ? 'Today' : age === 1 ? 'Yesterday' : age < 7 ? 'Earlier this Week' : age < 31 ? 'Earlier this Month' : 'Older'; };
  const day = (t, ctx) => new Date(t).toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric'});
  // What the list shows: a nav entry, a filter, a search, or a folder of My Drive.
  function listing(ctx) {
    const {ui, data} = ctx, all = files(data).filter(f => !f.trashed), nav = ui.driveNavItem || 'my';
    if (ui.sub === 'results') { const q = String(ui.driveQuery || '').trim().toLocaleLowerCase(); return {title: fmt(D(ctx, 'Search: "%s"'), ui.driveQuery), items: all.filter(f => f.name.toLocaleLowerCase().includes(q))}; }
    if (ui.driveFilter) { const [label, kind] = FILTERS.find(([, k]) => k === ui.driveFilter) || FILTERS[0]; return {title: fmt(D(ctx, 'Filter: %s'), D(ctx, label)), items: all.filter(f => f.kind === kind)}; }
    if (nav === 'starred') return {title: D(ctx, 'Starred'), items: all.filter(f => f.starred)};
    if (nav === 'recent') return {title: D(ctx, 'Recent'), items: all.filter(f => time(f, 'otime', ctx)), sort: 'opened'};
    if (nav === 'offline') return {title: D(ctx, 'Offline'), items: all.filter(f => f.pinned)};
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
      const head = group && group !== last ? `<h4 class="dr-group">${e(D(ctx, group))}</h4>` : ''; last = group;
      const line = sort === 'quota' ? fmt(D(ctx, 'Quota used: %s'), bytes(size(f), ctx)) : sort === 'opened' ? fmt(D(ctx, 'Opened by me: %s'), t ? day(t, ctx) : D(ctx, 'Never'))
        : sort === 'edited' ? fmt(D(ctx, 'Edited by me: %s'), t ? day(t, ctx) : D(ctx, 'Never')) : fmt(D(ctx, 'Modified: %s'), day(time(f, 'mtime', ctx), ctx));
      return `${head}<div class="dr-row" data-drive-hold="${e(f.id)}"><button class="dr-main" data-action="drv-open" data-id="${e(f.id)}"><span class="dr-icon"><img src="assets/dr-${ICON[f.kind] || 'ic_type_doc'}.png" alt=""></span><span class="dr-text"><b>${e(f.name)}</b><small>${e(line)}</small></span>${f.pinned ? '<i class="drv-pin" aria-hidden="true"></i>' : ''}</button><button class="dr-info" data-action="drv-detail" data-id="${e(f.id)}" aria-label="${e(D(ctx, 'Show item properties'))}"><img src="assets/dr-ic_information_gray_small.png" alt=""></button></div>`;
    }).join('');
  }
  const check = on => `<i class="drv-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
  function settings(ctx) {
    const p = prefs(ctx.data), cat = title => `<h4 class="drv-cat">${e(title)}</h4>`;
    const row = (action, title, summary = '', extra = '') => `<button type="button" class="drv-row" data-action="${action}"><span><b>${e(title)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const used = files(ctx.data).reduce((n, f) => n + size(f), 0) + 0.4 * 1024 ** 3, quota = 15 * 1024 ** 3;
    return cat(D(ctx, 'Documents cache')) + row('drv-clear-cache', D(ctx, 'Clear cache'), ctx.ui.driveCacheCleared ? D(ctx, 'Document cache has been cleared') : D(ctx, 'Clear cache summary'))
      + cat(D(ctx, 'Data Usage')) + row('drv-wifi', D(ctx, 'Transfer files only over Wi-Fi'), D(ctx, 'Wi-Fi only summary'), check(p.wifiOnly))
      + cat(D(ctx, 'Storage')) + row('drv-limit', D(ctx, 'Buy more storage'), fmt(D(ctx, 'Storage summary'), bytes(used, ctx), Math.round(used / quota * 100), bytes(quota, ctx)))
      + cat(D(ctx, 'About category')) + row('drv-limit', D(ctx, 'About')) + row('drv-limit', D(ctx, 'Open source licenses'));
  }
  function detail(ctx) {
    const f = files(ctx.data).find(x => x.id === ctx.ui.driveDetail); if (!f) return '';
    const m = time(f, 'mtime', ctx), ed = time(f, 'etime', ctx), op = time(f, 'otime', ctx), stamp = t => `${day(t, ctx)}`;
    const thumb = f.kind === 'folder' ? `<img class="drv-thumb-icon" src="assets/dr-ic_type_folder.png" alt="">` : f.photo && window.ICSMedia ? ICSMedia.art(ctx.data.photos.find(p => p.id === f.photo) || {}) : `<div class="drv-thumb-page">${e(f.text || '').split('\n').slice(0, 6).map(line => `<p>${line}</p>`).join('')}</div>`;
    return `<button class="drv-detail-scrim" data-action="drv-detail-close" aria-label="${e(D(ctx, 'Close detail panel'))}"></button><aside class="drv-detail"><button class="drv-close" data-action="drv-detail-close" aria-label="${e(D(ctx, 'Close detail panel'))}"><img src="assets/dr-ic_close.png" alt=""></button><div class="drv-detail-in"><div class="drv-title"><button class="drv-star" data-action="drv-star" data-id="${e(f.id)}" aria-label="${e(D(ctx, 'Star'))}" aria-pressed="${!!f.starred}"><img src="assets/dr-ic_star_${f.starred ? 'on' : 'off'}.png" alt=""></button><img class="drv-doc-icon" src="assets/dr-${ICON[f.kind] || 'ic_type_doc'}.png" alt=""><span>${e(f.name)}</span></div><div class="drv-thumb">${thumb}</div>
      ${f.kind === 'folder' ? '' : `<h4 class="drv-sec">${e(D(ctx, 'Offline section'))}</h4><button class="drv-pin-row" data-action="drv-pin" data-id="${e(f.id)}">${check(f.pinned)}<span>${e(D(ctx, 'Available offline'))}</span>${f.pinned ? `<small>${e(D(ctx, 'Up to date'))}</small>` : ''}</button>`}
      <h4 class="drv-sec">${e(D(ctx, 'Who has access'))}</h4><p class="drv-line">${e(ACCOUNT)}<small>${e(D(ctx, 'Owner'))}</small></p>
      <h4 class="drv-sec">${e(D(ctx, 'General info'))}</h4><p class="drv-line">${e(fmt(D(ctx, 'Modified: %1$s, %2$s'), day(m, ctx), new Date(m).toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit'})))}</p>
      ${ed ? `<p class="drv-line">${e(fmt(D(ctx, 'Modified by me: %s'), stamp(ed)))}</p>` : ''}<p class="drv-line">${e(fmt(D(ctx, 'Opened by me info: %s'), op ? stamp(op) : D(ctx, 'Never')))}</p>${f.kind === 'folder' ? '' : `<p class="drv-line">${e(fmt(D(ctx, 'Quota used info: %s'), bytes(size(f), ctx)))}</p>`}</div></aside>`;
  }
  function dialog(ctx) {
    const {ui, data} = ctx, d = ui.driveDialog; if (!d) return '';
    const f = files(data).find(x => x.id === ui.driveTarget), folderish = f?.kind === 'folder';
    const scrim = `<button class="drv-scrim" data-action="drv-close" aria-label="${e(D(ctx, 'Cancel'))}"></button>`;
    const box = (title, inner, buttons = '') => `${scrim}<div class="drv-dialog" role="dialog"><h3>${e(title)}</h3>${inner}${buttons ? `<div class="drv-buttons">${buttons}</div>` : ''}</div>`;
    const item = (action, id, label, extra = '') => `<button class="drv-item" data-action="${action}" data-id="${e(id)}"><span>${e(label)}</span>${extra}</button>`;
    const radio = on => `<i class="drv-radio${on ? ' on' : ''}"></i>`;
    const cancel = `<button data-action="drv-close">${e(D(ctx, 'Cancel'))}</button>`;
    if (d === 'add') return box(D(ctx, 'Add new'), [['folder', 'Folder'], ['doc', 'Document'], ['sheet', 'Spreadsheet'], ['scan', 'Scan'], ['upload', 'Upload']].map(([id, label]) => item('drv-add', id, D(ctx, label))).join(''));
    if (d === 'upload') return box(D(ctx, 'Upload'), `<div class="drv-photos">${(data.photos || []).map(p => `<button data-action="drv-upload" data-id="${p.id}">${window.ICSMedia ? ICSMedia.art(p) : ''}</button>`).join('')}</div>`, cancel);
    if (d === 'folder') return box(D(ctx, 'Folder name'), `<input class="drv-edit" data-drv-edit maxlength="100" value="${e(D(ctx, 'New folder'))}">`, cancel + `<button data-action="drv-folder-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'filter') return box(D(ctx, 'Filter by'), FILTERS.map(([label, kind]) => item('drv-filter', kind, D(ctx, label), radio(ui.driveFilter === kind))).join(''));
    if (d === 'sort') { const s = prefs(data).sort; return box(D(ctx, 'Sort by'), SORTS.map(([label, id]) => item('drv-sort', id, D(ctx, label), radio(s === id))).join('')); }
    if (d === 'menu' && f) return `${scrim}<div class="drv-dialog drv-context" role="dialog"><h3>${e(f.name)}</h3>${folderish ? '' : item('drv-send', f.id, D(ctx, 'Send'))}${item('drv-move', f.id, D(ctx, 'Move to…'))}${folderish ? '' : item('drv-pin', f.id, D(ctx, 'Available offline'), check(f.pinned))}${item('drv-send-link', f.id, D(ctx, 'Send link'))}${item('drv-rename', f.id, D(ctx, 'Rename'))}${item('drv-remove', f.id, D(ctx, 'Remove'))}</div>`;
    if (d === 'rename' && f) return box(D(ctx, folderish ? 'Rename folder' : 'Rename document'), `<input class="drv-edit" data-drv-edit maxlength="100" value="${e(f.name)}">`, cancel + `<button data-action="drv-rename-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'remove' && f) return box(D(ctx, folderish ? 'Remove folder' : 'Remove document'), `<p class="drv-msg">${e(f.name)}</p>`, cancel + `<button data-action="drv-remove-ok">${e(D(ctx, 'Remove button'))}</button>`);
    if (d === 'move' && f) {
      const at = ui.drivePick || 'root', here = files(data).find(x => x.id === at), folders = files(data).filter(x => x.kind === 'folder' && !x.trashed && parent(x) === at && x.id !== f.id);
      const head = `<div class="drv-pick-head">${here ? `<button data-action="drv-pick-up" aria-label="${e(D(ctx, 'Navigate up'))}"><img src="assets/dr-ic_upaffordance.png" alt=""></button>` : ''}<b>${e(here ? here.name : D(ctx, 'My Drive'))}</b><button data-action="drv-pick-new" aria-label="${e(D(ctx, 'Create new folder'))}"><img src="assets/dr-ic_new_folder.png" alt=""></button></div>`;
      return `${scrim}<div class="drv-dialog drv-move" role="dialog">${head}<div class="drv-pick-list">${folders.map(x => `<button class="drv-pick" data-action="drv-pick" data-id="${e(x.id)}"><img src="assets/dr-ic_type_folder.png" alt=""><span>${e(x.name)}</span></button>`).join('') || `<p class="drv-msg">${e(D(ctx, 'No Items'))}</p>`}</div><div class="drv-buttons">${cancel}<button data-action="drv-move-ok"${parent(f) === at ? ' disabled' : ''}>${e(D(ctx, 'OK'))}</button></div></div>`;
    }
    if (d === 'pick-new') return box(D(ctx, 'Folder name'), `<input class="drv-edit" data-drv-edit maxlength="100" value="${e(D(ctx, 'New folder'))}">`, `<button data-action="drv-pick-new-cancel">${e(D(ctx, 'Cancel'))}</button><button data-action="drv-pick-new-ok">${e(D(ctx, 'OK'))}</button>`);
    if (d === 'send' || d === 'link') return box(D(ctx, d === 'send' ? 'Send' : 'Send link'), (d === 'send' ? [['gmail', 'Gmail'], ['email', 'Email']] : [['gmail', 'Gmail'], ['email', 'Email'], ['hangouts', 'Hangouts']]).map(([app, name]) => `<button class="drv-item drv-app" data-action="drv-send-to" data-id="${app}"><img src="assets/${app}.png" alt=""><span>${e(ctx.t(name))}</span></button>`).join(''));
    if (d === 'clear-cache') return box(D(ctx, 'Clear cache'), `<p class="drv-msg">${e(D(ctx, 'Document cache will be cleared.'))}</p>`, cancel + `<button data-action="drv-clear-cache-ok">${e(D(ctx, 'OK'))}</button>`);
    return '';
  }
  // The list screen's parts the stock Drive view draws: title, rows, the panel and the dialogs.
  function list(ctx) {
    const {title, items, sort, folder} = listing(ctx);
    return {title, folder, rows: rows(ctx, items, sort || prefs(ctx.data).sort), empty: !items.length, extra: (ctx.ui.driveDetail ? detail(ctx) : '') + dialog(ctx)};
  }
  function page(ctx) { return `<div class="sa-scroll drv-settings">${settings(ctx)}</div>${dialog(ctx)}`; }
  const NAV_ITEMS = NAV;
  // The overflow (menu_doclist_activity.xml's overflow items).
  const menu = ctx => [['Add new', 'drv-dialog', 'add'], ['Refresh', 'drv-refresh'], ['Filter by', 'drv-dialog', 'filter'], ['Sort by', 'drv-dialog', 'sort'], ['Settings', 'drv-settings'], ['Product Tour', 'drv-limit']].map(([key, action, id]) => ({action, id, title: D(ctx, key)}));
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
      case 'drv-detail': ui.driveDetail = id || ui.driveFile; ctx.render(); return true;
      case 'drv-detail-close': ui.driveDetail = ''; ctx.render(); return true;
      case 'drv-star': update(id, {starred: !file?.starred}); ctx.render(); return true;
      case 'drv-pin': update(id, {pinned: !file?.pinned}); if (ui.driveDialog === 'menu') close(); ctx.render(); return true;
      case 'drv-hold': ui.driveTarget = id; ui.driveDialog = 'menu'; ctx.render(); return true;
      case 'drv-dialog': ui.overlay = ''; ctx.renderOverlay?.(); ui.driveDialog = id; ctx.render(); return true;
      case 'drv-close': close(); ctx.render(); return true;
      case 'drv-nav': ui.driveNav = false; ui.driveNavItem = id; ui.driveFilter = ''; ui.driveFolder = ''; ui.driveStack = []; if (['search', 'results'].includes(ui.sub)) ui.sub = ''; ctx.render(); return true;
      case 'drv-refresh': ui.overlay = ''; ctx.renderOverlay?.(); ui.driveRefreshing = true; ctx.render(); setTimeout(() => { ui.driveRefreshing = false; if (ui.view === 'drive') ctx.render(); }, 900); return true;
      case 'drv-filter': (ui.driveStack ||= []).push({folder: ui.driveFolder || '', nav: ui.driveNavItem || 'my', filter: ui.driveFilter || '', sub: ui.sub}); ui.driveFilter = id; ui.driveFolder = ''; close(); ctx.render(); return true;
      case 'drv-sort': data.drivePrefs = {...prefs(data), sort: id}; ctx.save(); close(); ctx.render(); return true;
      case 'drv-settings': ui.overlay = ''; ctx.renderOverlay?.(); ui.sub = 'drive-settings'; ctx.render(); return true;
      case 'drv-wifi': data.drivePrefs = {...prefs(data), wifiOnly: !prefs(data).wifiOnly}; ctx.save(); ctx.render(); return true;
      case 'drv-clear-cache': ui.driveDialog = 'clear-cache'; ctx.render(); return true;
      case 'drv-clear-cache-ok': ui.driveCacheCleared = true; close(); ctx.render(); return true;
      case 'drv-add': {
        close();
        if (id === 'folder') { ui.driveDialog = 'folder'; ctx.render(); ctx.root.querySelector('[data-drv-edit]')?.select(); return true; }
        if (id === 'upload') { ui.driveDialog = 'upload'; ctx.render(); return true; }
        if (id === 'scan') { ctx.render(); ctx.toast('This feature is not part of the simulator.'); return true; }
        const f = create(id, D(ctx, id === 'doc' ? 'Untitled document' : 'Untitled spreadsheet'));
        ui.driveFrom = ui.sub; ui.driveFile = f.id; ui.sub = 'file'; ctx.render(); return true;
      }
      case 'drv-folder-ok': { const name = ctx.root.querySelector('[data-drv-edit]')?.value.trim(); if (!name) return true; create('folder', name); close(); ctx.render(); return true; }
      case 'drv-upload': { const p = (data.photos || []).find(x => String(x.id) === String(id)); if (!p) return true; const f = create('image', p.name); update(f.id, {uploaded: true, photo: p.id, size: p.size || 1843200}); close(); ctx.render(); return true; }
      case 'drv-send': ui.driveTarget = file?.id; ui.driveDialog = 'send'; ctx.render(); return true;
      case 'drv-send-link': ui.driveTarget = file?.id; ui.driveDialog = 'link'; ctx.render(); return true;
      case 'drv-send-to': {
        const f = all().find(x => x.id === ui.driveTarget), link = ui.driveDialog === 'link'; close(); if (!f) return true;
        const url = `https://docs.google.com/${f.kind === 'sheet' ? 'spreadsheet' : f.kind === 'folder' ? 'folderview' : 'document'}/d/${f.id}`;
        if (link) ctx.shareText(id, `${f.name}\n${url}`, f.name);
        else ctx.shareFile(id, f.photo ? {photo: f.photo} : {vcard: true, mime: f.kind === 'pdf' ? 'application/pdf' : 'application/pdf', name: /\.\w+$/.test(f.name) ? f.name : `${f.name}.pdf`, size: size(f) || new TextEncoder().encode(f.text || '').length, text: f.text || ''});
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
      case 'drv-remove-ok': { update(ui.driveTarget, {trashed: true}); if (ui.driveDetail === ui.driveTarget) ui.driveDetail = ''; if (ui.sub === 'file' && ui.driveFile === ui.driveTarget) ui.sub = ui.driveFrom || ''; close(); ctx.render(); return true; }
      case 'drv-limit': ui.overlay = ''; ctx.renderOverlay?.(); ctx.toast('This feature is not part of the simulator.'); return true;
      default: return false;
    }
  }
  // Back: a dialog, the detail panel, Settings, then a folder or filter back to where it was opened.
  function back(ui) {
    if (ui.driveDialog) { ui.driveDialog = ''; return true; }
    if (ui.driveDetail) { ui.driveDetail = ''; return true; }
    if (ui.sub === 'drive-settings') { ui.sub = ''; return true; }
    if (!ui.sub && (ui.driveFolder || ui.driveFilter)) { const prev = ui.driveStack?.pop() || {}; ui.driveFolder = prev.folder || ''; ui.driveFilter = prev.filter || ''; ui.driveNavItem = prev.nav || 'my'; if (prev.sub) ui.sub = prev.sub; return true; }
    if (!ui.sub && ui.driveNavItem && ui.driveNavItem !== 'my') { ui.driveNavItem = 'my'; return true; }
    return false;
  }
  window.KKDrive = {list, page, menu, handle, back, files, NAV: NAV_ITEMS, D, prefs};
})();
