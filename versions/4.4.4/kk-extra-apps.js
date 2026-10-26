/* The remaining launcher apps of the Nexus 5 factory image (KTU84P) as simple Holo screens, the way the Lollipop folder
   shows its extras: Play Newsstand 3.0.1 (magazines_actionbar_color #000000, the Read Now cards in its
   card_background_blue1 / blue2 / orange), Quickoffice 6.3.1 (the light home screen: "Open or create new files" with
   Drive / Device and "Create new file", then the recent files from the simulator's Drive) and Wallet 2.0 (US only,
   so English everywhere: the Wallet Balance tile and PAYMENT METHODS). Labels come from the APKs; content is offline
   and made up. Audit step 4 added Newsstand's and Wallet's navigation drawers and Newsstand's menus from the APKs. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const APPS = ['newsstand', 'quickoffice', 'wallet'];
  // Screen texts from the APKs (Play Books uses "Read Now" with another translation, so these stay local).
  const STRINGS = {
    'Read Now': {res: 'Magazines:read_now_title', hu: 'Olvasson most', de: 'Jetzt lesen', fr: 'À lire', es: 'Leer ahora'},
    'Open or create new files': {res: 'QuickOffice:open_or_create_new_file_label', hu: 'Fájlok megnyitása vagy új fájlok létrehozása', de: 'Öffnen oder neue Dateien erstellen', fr: 'Ouvrir ou créer des fichiers', es: 'Abrir o crear archivos nuevos'},
    'Drive': {res: 'QuickOffice:open_from_drive_button', hu: 'Drive', de: 'Google Drive', fr: 'Drive', es: 'Drive'},
    'Device': {res: 'QuickOffice:open_from_device_button', hu: 'Készülék', de: 'Gerät', fr: 'Appareil', es: 'Dispositivo'},
    'Create new file': {res: 'QuickOffice:create_new_file_label', hu: 'Új fájl létrehozása', de: 'Neue Datei erstellen', fr: 'Créer un fichier', es: 'Crear archivo nuevo'},
    'Recent files': {res: 'QuickOffice:recent_files_label', hu: 'Legújabb fájlok', de: 'Zuletzt verwendete Dateien', fr: 'Fichiers récents', es: 'Archivos recientes'}
  };
  // Texts the stock-strings index resolves from the image's APKs (docs/data/stock-strings.json).
  const S = (app, key, t) => { const row = window.StockStrings?.[app]?.[key]; return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, key) : t(key); };
  const STR = AndroidStrings.table('', STRINGS), local = (key, t) => STR.has(key) ? STR.t(key) : t(key);
  const svg = {
    drawer: '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" fill="currentColor"/></svg>',
    search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="2" fill="currentColor"/><circle cx="12" cy="12" r="2" fill="currentColor"/><circle cx="12" cy="19" r="2" fill="currentColor"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6zm8 1.5V8h4.5zM8 12h8v1.5H8zm0 3h8v1.5H8zm0 3h5v1.5H8z" fill="currentColor"/></svg>',
    drive: '<svg viewBox="0 0 24 24"><path d="M8.2 3h7.6l6 10.4-3.8 6.6H6l-3.8-6.6z" fill="currentColor"/></svg>',
    device: '<svg viewBox="0 0 24 24"><path d="M7 2h10a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1zm1 3v13h8V5z" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" fill="currentColor"/></svg>',
    card: '<svg viewBox="0 0 24 24"><path d="M3 5h18v14H3zm2 3v2h14V8zm0 5v4h14v-4z" fill="currentColor"/></svg>'
  };
  const KIND_COLOR = {doc: '#4285f4', sheet: '#0f9d58', slides: '#f4b400', pdf: '#db4437'};
  // A Holo action bar: the drawer indicator, the app icon and the title, then action buttons.
  // Newsstand and Wallet open their navigation drawers from the home button; Quickoffice 6.3 has none.
  const bar = (app, title, actions = '', cls = '') => `<header class="kkx-bar ${cls}"><button class="kkx-home" data-action="${app === 'quickoffice' ? 'home' : 'kkx-drawer'}" aria-label="${e(title)}">${app === 'quickoffice' ? '' : `<span class="kkx-drawer">${svg.drawer}</span>`}<img src="assets/${app}.png" alt=""></button><h2>${e(title)}</h2>${actions}</header>`;
  const action = (icon, label) => `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(label)}">${svg[icon]}</button>`;
  const Q = (key, t) => S('quickoffice', key, t);
  const QO_KIND = {doc: ['New Document', '.docx'], sheet: ['New Spreadsheet', '.xlsx'], slides: ['New Presentation', '.pptx']};
  function render(app, {files, ui, t, data, locale}) {
    if (app === 'newsstand') {
      const n = key => S('newsstand', key, t);
      const drawer = ui.kkxDrawer ? `<button class="kkx-scrim" data-action="kkx-drawer" aria-label="${e(t('Close'))}"></button><nav class="ns-drawer">${['Read Now', 'My News', 'My Magazines', 'Saved', 'Explore'].map((key, i) => `<button class="${i ? '' : 'on'}" data-action="${i ? 'kkx-unavailable' : 'kkx-drawer'}">${e(n(key))}</button>`).join('')}</nav>` : '';
      const stories = [['Material design comes to more apps', 'Gadget Weekly', '#15a0c8'], ['A weekend of trails above the city', 'Trail & Summit', '#4285f4'], ['Five autumn soups in thirty minutes', 'Weekend Kitchen', '#ef851c']];
      return `<div class="app-view kkx-app kkx-newsstand">${bar('newsstand', n('Read Now'), `<button class="kkx-btn" data-action="kkx-unavailable" aria-label="${e(n('Search'))}"><img class="kkx-img" src="assets/ns-ic_menu_search_holo_dark.png" alt=""></button><button class="kkx-btn" data-action="kkx-menu" aria-label="${e(t('More options'))}">${svg.more}</button>`, 'dark')}<div class="kkx-list kkx-cards">${stories.map(([title, source, color]) => `<article class="kkx-story"><div class="kkx-story-art" style="background:${color}"><b>${e(title)}</b></div><div class="kkx-story-copy"><small>${e(source)}</small></div></article>`).join('')}</div>${drawer}</div>`;
    }
    if (app === 'quickoffice') {
      const context={files,ui,t,data,locale};
      if(ui.qoxDoc)return QuickofficeMore.document(context);
      if(ui.qox?.source==='drive')return QuickofficeMore.page(context);
      // A new file (create_new_file_label: Document / Spreadsheet / Presentation) opens blank and "Not saved yet"; Save keeps it.
      if (ui.sub === 'qo-new') return `<div class="app-view kkx-app kkx-quickoffice">${bar('quickoffice', Q(QO_KIND[ui.qoKind][0], t), `<button class="kkx-btn" data-action="qo-save" aria-label="${e(Q('Save', t))}">${e(Q('Save', t))}</button>`)}<div class="kkx-page"><article class="kkx-paper qo-blank ${ui.qoKind}"><small>${e(Q('Not saved yet', t))}</small></article></div></div>`;
      const open = ui.sub && files.find(file => file.id === ui.sub);
      if (open) return `<div class="app-view kkx-app kkx-quickoffice">${bar('quickoffice', open.name)}<div class="kkx-page"><article class="kkx-paper">${open.text.split('\n').map(line => `<p>${e(line)}</p>`).join('')}</article></div></div>`;
      const recent = files.filter(file => KIND_COLOR[file.kind]).map(file => `<button class="kkx-file" data-action="kkx-open" data-id="${e(file.id)}" data-qo-hold="${e(file.id)}"><span class="kkx-file-icon" style="color:${KIND_COLOR[file.kind]}">${svg.doc}</span><span class="kkx-file-copy"><strong>${e(file.name)}</strong><small>${e(file.date)}</small></span></button>`).join('');
      const tile = (icon, label) => `<button class="kkx-tile" data-action="kkx-unavailable"><span>${svg[icon]}</span>${e(label)}</button>`;
      return `<div class="app-view kkx-app kkx-quickoffice">${bar('quickoffice', 'Quickoffice®', action('more', t('More options')).replace('data-action="kkx-unavailable"','data-action="qox-menu"'))}<div class="kkx-list"><h3 class="kkx-section">${e(local('Open or create new files', t))}</h3><div class="kkx-tiles">${tile('drive', local('Drive', t)).replace('data-action="kkx-unavailable"','data-action="qox-drive"')}${tile('device', local('Device', t)).replace('data-action="kkx-unavailable"','data-action="qox-device"')}${tile('plus', local('Create new file', t)).replace('data-action="kkx-unavailable"', 'data-action="qo-new"')}</div><h3 class="kkx-section">${e(local('Recent files', t))}</h3>${recent}</div></div>`;
    }
    if (app === 'wallet') {
      // Wallet 2.0's nav_drawer (US only, so English as the image shows it everywhere).
      const drawer = ui.kkxDrawer ? `<button class="kkx-scrim" data-action="kkx-drawer" aria-label="${e(t('Close'))}"></button><nav class="wal-drawer">${['My Wallet', 'Send money', 'Transactions', 'Wallet Balance'].map((label, i) => `<button class="${i ? '' : 'on'}" data-action="${i ? 'kkx-unavailable' : 'kkx-drawer'}">${e(label)}</button>`).join('')}</nav>` : '';
      return `<div class="app-view kkx-app kkx-wallet">${bar('wallet', 'Wallet', action('more', 'More options'))}<div class="kkx-list"><div class="kkx-balance"><small>Wallet Balance</small><b>$0.00</b></div><h3 class="kkx-section">PAYMENT METHODS</h3><button class="kkx-file" data-action="kkx-unavailable"><span class="kkx-file-icon">${svg.card}</span><span class="kkx-file-copy"><strong>Tap and pay will not work. Add a card.</strong></span></button></div>${drawer}</div>`;
    }
    return '';
  }
  // Newsstand's overflow: NSActivity's standard_menu, then HomeFragment's home_fragment_menu (Search is the bar icon).
  function menu(app, t) {
    if (app === 'newsstand') return ['Settings', 'Help', 'On device only'].map(key => ({action: 'kkx-unavailable', title: S('newsstand', key, t)}));
    return [];
  }
  // The dialogs: create (Document / Spreadsheet / Presentation), a file's long-press menu, Rename file, Delete.
  function qoDialog(kind, {files, ui, t}) {
    const file = files.find(f => f.id === ui.qoFile), row = (action, id, label) => `<button class="settings-row" data-action="${action}" data-id="${e(id)}"><span class="row-copy">${e(label)}</span></button>`;
    const box = (title, body, buttons = '') => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(title)}" data-no-translate><h3>${e(title)}</h3>${body}${buttons ? `<div class="settings-dialog-actions">${buttons}</div>` : ''}</div>`;
    if (kind === 'create') return box(local('Create new file', t), row('qo-create', 'doc', Q('Document', t)) + row('qo-create', 'sheet', Q('Spreadsheet', t)) + row('qo-create', 'slides', Q('Presentation', t)));
    if (!file) return '';
    if (kind === 'file') return box(file.name, row('qo-rename', file.id, Q('Rename', t)) + row('qo-delete', file.id, Q('Delete', t)));
    if (kind === 'rename') return box(Q('Rename file', t), `<input class="qo-name" data-qo-name value="${e(file.name)}" placeholder="${e(Q('File name', t))}" aria-label="${e(Q('File name', t))}" autocomplete="off" spellcheck="false">`, `<button data-action="close-overlay">${e(Q('Cancel', t))}</button><button data-action="qo-rename-ok">${e(Q('OK', t))}</button>`);
    if (kind === 'delete') return box(Q('Delete', t), `<p>${e(AndroidStrings.format(Q('Are you sure you want to delete %1$s?', t), file.name))}</p>`, `<button data-action="close-overlay">${e(Q('Cancel', t))}</button><button data-action="qo-delete-ok">${e(Q('OK', t))}</button>`);
    return '';
  }
  window.KKExtraApps = {qoDialog, QO_KIND, local, APPS, render, menu};
})();
