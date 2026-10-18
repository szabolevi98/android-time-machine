/* Android 6.0.1: sending something to another app (ACTION_SEND), as the framework and the receiving APKs of MTC20K do it.
   - ChooserActivity (Theme.DeviceDefault.Resolver: translucent, the dim behind at Material's 0.6): chooser_grid.xml's
     ResolverDrawerLayout rises from the bottom (resolver_max_width 480 dp, maxCollapsedHeight 288 dp), white, elevation
     8 dp; the title row (14 sp textAppearanceMedium, 12 dp above and below, 16 dp in) says what the sending app passed
     to Intent.createChooser, else whichSendApplication; chooser_row.xml rows of four resolve_grid_item.xml targets
     (8 dp above and below, at least 80 dp wide, the 48 dp icon, the label 8 dp under it in 12 sp sans-serif-condensed
     on two lines). The targets are the activities of the image whose ACTION_SEND filter takes the type: Bluetooth's
     BluetoothOppLauncherActivity (bt_share_picker_label; text, images, vCards), Drive's SendTextToClipboardActivity
     (send_to_clipboard_activity_title; text) and UploadSharedItemActivity (Drive; everything), Gmail's
     ComposeActivityGmail (everything), Hangouts' ShareIntentActivity (text, images), Messenger's ShareIntentActivity
     (share_intent_label; text, images, vCards) and Photos' UploadContentActivity (photos_uploadtoalbum_title; images).
     ResolverComparator orders them by use; with no usage stats yet that is the labels' collation order.
   - What each does: Gmail opens its compose screen with the subject and text; Messenger and Hangouts their list of
     conversations, the text waiting as the draft of the one picked; Copy to clipboard puts the text there and says
     send_to_clipboard_success; Drive's upload_shared_item_activity.xml dialog (Save to Drive: Document title, Account,
     Folder My Drive; Cancel / Save) adds the file to My Drive; Bluetooth asks to turn the radio on
     (BluetoothOppBtEnableActivity: bt_enable_line1 and line2, Turn on / Cancel; enabling_progress while it starts) and
     opens Settings' DevicePickerActivity ('bt-picker': Choose Bluetooth device, the Available devices category
     scanning; FILTER_TYPE_TRANSFER keeps only devices with the OBEX object push profile, which neither of the
     simulator's headset and car kit has, so the scan ends in bluetooth_no_devices_found).
   Use: MM.share(c, {title, kind: 'text' | 'image' | 'vcard', subject, text, name, exclude: [target ids]}). */
(() => {
  'use strict';
  const T = () => MM.text('intents');
  const esc = (c, s) => c.safe(s);
  const app = id => MM.appsData?.[id];
  const TARGETS = [
    {id: 'bluetooth', label: 'Bluetooth/bt_share_picker_label', icon: 'assets/in-bt_share.png', kinds: ['text', 'image', 'vcard']},
    {id: 'clipboard', label: 'Drive/send_to_clipboard_activity_title', icon: 'assets/app-drive.png', kinds: ['text']},
    {id: 'drive', label: 'Drive/app_name', icon: 'assets/app-drive.png', kinds: ['text', 'image', 'vcard']},
    {id: 'gmail', label: 'PrebuiltGmail/app_name', icon: 'assets/app-gmail.png', kinds: ['text', 'image', 'vcard']},
    {id: 'hangouts', label: 'Hangouts/home_screen_babel_label', icon: 'assets/app-hangouts.png', kinds: ['text', 'image']},
    {id: 'messenger', label: 'PrebuiltBugle/share_intent_label', icon: 'assets/app-messenger.png', kinds: ['text', 'image', 'vcard']},
    {id: 'photos', label: 'Photos/photos_uploadtoalbum_title', icon: 'assets/app-photos.png', kinds: ['image']}
  ];
  const targets = (c, s) => TARGETS.filter(x => x.kinds.includes(s.kind || 'text') && !(s.exclude || []).includes(x.id))
    .sort((a, b) => new Intl.Collator(c.locale()).compare(T().t(a.label), T().t(b.label)));

  MM.share = (c, spec) => { c.ui.shareSpec = {kind: 'text', ...spec}; c.ui.shareClosing = false; c.overlay('share'); };
  // What the receiving app picks up (Gmail's compose, a draft in Messenger or Hangouts), cleared once it has.
  MM.shareTake = c => { const s = c.ui.shareData; c.ui.shareData = null; return s; };

  function render(c) {
    const s = c.ui.shareSpec; if (!s) return '';
    const list = targets(c, s), rows = [];
    for (let i = 0; i < list.length; i += 4) rows.push(list.slice(i, i + 4));
    const item = x => `<button type="button" class="mmin-item" data-action="mmin-pick" data-id="${x.id}"><img src="${x.icon}" alt=""><span>${esc(c, T().t(x.label))}</span></button>`;
    const grid = list.length ? rows.map(r => `<div class="mmin-row">${r.map(item).join('')}${'<i class="mmin-item"></i>'.repeat(4 - r.length)}</div>`).join('')
      : `<div class="mmin-empty">${esc(c, T().t('noApplications'))}</div>`;
    return `<div class="mmin${c.ui.shareClosing ? ' closing' : ''}"><div class="mmin-dim" data-action="mmin-cancel"></div><div class="mmin-sheet">
      <div class="mmin-title">${esc(c, s.title || T().t('whichSendApplication'))}</div><div class="mmin-grid">${grid}</div></div></div>`;
  }
  function close(c, then) {
    c.ui.shareClosing = true; c.closeOverlay();
    c.ui.shareSpec = null; c.ui.shareClosing = false; then?.();
  }

  // Bluetooth: BluetoothOppLauncherActivity checks the adapter, BluetoothOppBtEnableActivity asks to turn it on.
  function bluetooth(c) {
    const t = T();
    const pick = () => c.open('bt-picker');
    if (c.data.settings.bluetooth) { pick(); return; }
    c.dialog({html: `<div class="mmin-bt"><p>${esc(c, t.t('Bluetooth/bt_enable_line1'))}</p><p>${esc(c, t.t('Bluetooth/bt_enable_line2'))}</p></div>`, buttons: [{label: t.t('Bluetooth/bt_enable_cancel')}, {label: t.t('Bluetooth/bt_enable_ok'), action: c => {
      MM.system.setBluetooth(c, true);
      c.dialog({title: t.t('Bluetooth/enabling_progress_title'), progress: t.t('Bluetooth/enabling_progress_content'), cancelable: false});
      setTimeout(() => { if (c.ui.overlay === 'dialog') c.closeDialog(); pick(); }, 1100);
    }}]});
  }
  // Drive's UploadSharedItemActivity: the dialog with the document's title, the account and the folder.
  function drive(c, s) {
    const t = T(), title = s.name || s.subject || t.t('Drive/upload_untitled_file_title');
    const html = `<div class="mmin-up"><div class="mmin-uplabel">${esc(c, t.t('Drive/upload_document_title'))}</div><input class="mmin-upname" value="${esc(c, title)}" autocomplete="off">
      <div class="mmin-uplabel">${esc(c, t.t('Drive/upload_account'))}</div><div class="mmin-upspin">${esc(c, MM.account.email)}</div>
      <div class="mmin-uplabel">${esc(c, t.t('Drive/upload_folder'))}</div><div class="mmin-upspin folder"><img src="assets/dr-ic_type_folder.png" alt="">${esc(c, t.t('Drive/menu_my_drive'))}</div></div>`;
    let name = title;
    c.dialog({title: t.t('Drive/upload_shared_item_title'), html, mount: (c, win) => { const f = win.querySelector('.mmin-upname'); f.addEventListener('input', () => { name = f.value; }); },
      buttons: [{label: t.t('Drive/upload_cancel')}, {label: t.t('Drive/upload_shared_item_confirm'), action: c => {
        const files = c.data.driveFiles || (c.data.driveFiles = []);
        files.push({type: s.kind === 'image' ? 'image' : 'file', name: name.trim() || t.t('Drive/upload_untitled_file_title')}); c.save();
        c.toast(t.fmt('Drive/grid_sync_upload_label_format', null, name.trim() || t.t('Drive/upload_untitled_file_title')));
      }}]});
  }
  // Photos' UploadContentActivity: the account to upload to, then Upload.
  function photos(c) {
    const t = T();
    c.dialog({title: t.t('Photos/photos_uploadtoalbum_title'), html: `<div class="mmin-up"><div class="mmin-uplabel">${esc(c, t.t('Photos/photos_uploadtoalbum_account_label'))}</div><div class="mmin-upspin">${esc(c, MM.account.email)}</div></div>`,
      buttons: [{label: t.t('cancel')}, {label: t.t('Photos/photos_uploadtoalbum_upload'), action: c => {
        c.dialog({progress: t.t('Photos/photos_uploadtoalbum_progress_title'), cancelable: false});
        setTimeout(() => { if (c.ui.overlay === 'dialog') c.closeDialog(); c.toast(t.t('Photos/photos_uploadtoalbum_upload_complete')); }, 1200);
      }}]});
  }
  function pick(c, id) {
    const s = c.ui.shareSpec, t = T();
    close(c, () => {
      if (id === 'clipboard') { MM.clipboard = s.text || ''; c.toast(t.t('Drive/send_to_clipboard_success')); return; }
      if (id === 'bluetooth') { bluetooth(c); return; }
      if (id === 'drive') { drive(c, s); return; }
      if (id === 'photos') { photos(c); return; }
      c.ui.shareData = {subject: s.subject || '', text: s.text || '', kind: s.kind};
      c.open(id, 'share');
    });
  }

  MM.register('share', {
    app: false,
    render,
    back(c) { close(c); return true; },
    action(name, el, event, c) {
      if (name === 'mmin-cancel') { close(c); return true; }
      if (name === 'mmin-pick') { pick(c, el.dataset.id); return true; }
      return false;
    }
  });

  // Settings' DevicePickerActivity (device_picker.xml in Theme.Settings): the Available devices category scanning, then
  // what FILTER_TYPE_TRANSFER keeps of what it found; the overflow's Refresh scans again.
  const SCAN_MS = 4500;
  MM.register('bt-picker', {
    app: false,
    statusColor: () => '#21272b',
    render(c) {
      const t = T(), u = c.ui.btPicker || (c.ui.btPicker = {until: 0});
      if (!u.until) { u.until = Date.now() + SCAN_MS; setTimeout(() => { if (c.ui.view === 'bt-picker') c.render(); }, SCAN_MS + 50); }
      const scanning = u.until > Date.now();
      return `<div class="mmst"><div class="mmst-ab"><button type="button" class="mmst-up" data-action="mmbp-up" aria-label="Navigate up"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span class="mmst-abtitle up">${esc(c, t.t('Settings/device_picker'))}</span>${MM.menu.button(c, 'mmst-over')}</div>
        <div class="mmst-content"><div class="mmst-list"><div class="mmst-cat mmbt-cat"><span>${esc(c, t.t('Settings/bluetooth_preference_found_devices'))}</span>${scanning ? `<svg class="mmbt-spin" viewBox="0 0 48 48" aria-label="${esc(c, t.t('Settings/progress_scanning'))}"><circle cx="24" cy="24" r="19"/></svg>` : ''}</div>
        ${scanning ? '' : `<div class="mmst-pref small" ><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('Settings/bluetooth_no_devices_found'))}</span></span></div>`}</div></div></div>`;
    },
    back(c) { c.ui.btPicker = null; return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.btPicker;
      if (name === 'mmbp-up') { c.ui.btPicker = null; c.back(); return true; }
      if (name === 'mm-menu') {
        const scanning = u?.until > Date.now();
        c.menu([{label: t.t(scanning ? 'Settings/bluetooth_searching_for_devices' : 'Settings/bluetooth_search_for_devices'), disabled: scanning, action: c => { c.ui.btPicker = {until: 0}; c.render(); }}]);
        return true;
      }
      return false;
    }
  });
})();
