/* Android 7.1.2: sending something to another app (ACTION_SEND), as the framework and the receiving APKs of N2G48C do it.
   The logic is 6.0.1's (its intents module); the targets are the angler image's:
   - ChooserActivity (Theme.DeviceDefault.Resolver: translucent, the dim behind at 0.6): chooser_grid.xml's
     ResolverDrawerLayout rises from the bottom (resolver_max_width 480 dp, maxCollapsedHeight 288 dp), white, elevation
     8 dp; the title (14 sp textAppearanceMedium, 12 dp above and below, 16 dp in) says what the sending app passed to
     Intent.createChooser, else whichSendApplication; chooser_row.xml rows of four resolve_grid_item.xml targets (8 dp
     above and below, at least 80 dp wide, the 48 dp icon, the label 8 dp under it in 12 sp sans-serif-condensed on two
     lines). No direct share row: of the first five targets only Drive has a ChooserTargetService, and it offers none
     without recent folders.
   - The targets: every enabled activity of the image whose ACTION_SEND filter takes the type (docs: the manifests):
     NfcNci's BeamShareActivity (android_beam; any type), Bluetooth's BluetoothOppLauncherActivity (bt_share_picker_label;
     its explicitly declared MIME types), CloudPrint2's share-to-print alias (share_to_cloud_print_enabled is true; any MIME type),
     Drive's SendTextToClipboardActivity (Copy to clipboard; text/plain) and UploadMenuActivity (Save to Drive; any type),
     Gmail's ComposeActivityGmail (any type), Hangouts' and Messenger's ShareIntentActivity and separate video aliases,
     Photos' UploadContentActivity and YouTube's upload alias (the exact MIME sets are in ng-send-model.js). Chrome's PrintShareActivity
     and Nearby's SendActivity start disabled. ResolverComparator orders them by use; with no usage stats yet that is
     the labels' collation order.
   - What each does: Gmail opens its compose screen with the subject and text; Messenger and Hangouts their list of
     conversations, the text waiting as the draft of the one picked; Copy to clipboard says send_to_clipboard_success;
     Save to Drive's dialog (Document title, Account, Folder My Drive; Cancel / Save); Photos' upload; Bluetooth asks to
     turn the radio on (bt_enable_line1 / 2, Cancel / Turn on) and opens Settings' DevicePickerActivity, whose
     FILTER_TYPE_TRANSFER scan finds no device with the object push profile; BeamShareActivity asks to turn NFC on
     (beam_requires_nfc_enabled, the framework's yes / no) and then SendUi shows the screen shrunk to 0.6 with "Tap to
     beam" until it is cancelled; Cloud Print hands the content to the print framework.
   Use: NG.share(c, {title, kind: 'text' | 'image' | 'video' | 'audio' | 'vcard' | 'file', subject, text, name, exclude: [target ids]}). */
(() => {
  'use strict';
  const T = () => NG.text('intents');
  const esc = (c, s) => c.safe(s);
  const icon = id => NG.appsData?.[id]?.icon || '';
  const TARGETS = [
    {id: 'beam', label: 'NfcNci/android_beam', icon: () => 'assets/in-beam.png'},
    {id: 'bluetooth', label: 'Bluetooth/bt_share_picker_label', icon: () => 'assets/in-bt_share.png'},
    {id: 'cloudprint', label: 'CloudPrint2/app_name', icon: () => 'assets/in-cloudprint.png'},
    {id: 'clipboard', label: 'Drive/send_to_clipboard_activity_title', icon: () => icon('drive')},
    {id: 'drive', label: 'Drive/upload_shared_item_title', icon: () => icon('drive')},
    {id: 'gmail', label: 'PrebuiltGmail/app_name', icon: () => icon('gmail')},
    {id: 'hangouts', label: 'Hangouts/home_screen_babel_label', icon: () => icon('hangouts')},
    {id: 'messenger', label: 'PrebuiltBugle/share_intent_label', icon: () => icon('messenger')},
    {id: 'photos', label: 'Photos/photos_uploadtoalbum_title', icon: () => icon('photos')},
    {id: 'youtube', label: 'YouTube/application_name', icon: () => icon('youtube')}
  ];
  const targets = (c, s) => TARGETS.filter(x => NG.sendModel.accepts(x.id, NG.sendModel.mime(s),s.multiple) && !(s.exclude || []).includes(x.id) && !(NG.appsData?.[x.id] && NG.appDisabled?.(c, x.id)))
    .sort((a, b) => new Intl.Collator(c.locale()).compare(T().t(a.label), T().t(b.label)));

  NG.share = (c, spec) => { c.ui.shareSpec = NG.sendModel.normalize(c, {kind: 'text', ...spec}); c.overlay('share'); };
  // What the receiving app picks up (Gmail's compose, a draft in Messenger or Hangouts), cleared once it has.
  NG.shareTake = c => { const s = c.ui.shareData; c.ui.shareData = null; return s; };

  function render(c) {
    const s = c.ui.shareSpec; if (!s) return '';
    const list = targets(c, s), rows = [];
    for (let i = 0; i < list.length; i += 4) rows.push(list.slice(i, i + 4));
    const item = x => `<button type="button" class="ngin-item" data-action="ngin-pick" data-id="${x.id}"><img src="${x.icon()}" alt=""><span>${esc(c, T().t(x.label))}</span></button>`;
    const grid = list.length ? rows.map(r => `<div class="ngin-row">${r.map(item).join('')}${'<i class="ngin-item"></i>'.repeat(4 - r.length)}</div>`).join('')
      : `<div class="ngin-empty">${esc(c, T().t('framework/noApplications'))}</div>`;
    return `<div class="ngin"><div class="ngin-dim" data-action="ngin-cancel"></div><div class="ngin-sheet">
      <div class="ngin-title">${esc(c, s.title || T().t('framework/whichSendApplication'))}</div><div class="ngin-grid">${grid}</div></div></div>`;
  }
  function close(c, then) { c.closeOverlay(); c.ui.shareSpec = null; then?.(); }

  // Bluetooth: BluetoothOppLauncherActivity checks the adapter, BluetoothOppBtEnableActivity asks to turn it on.
  function bluetooth(c,spec) {
    const t = T(), pick = () => {c.ui.btPicker={until:0,sendSpec:JSON.parse(JSON.stringify(spec))};c.open('bt-picker');};
    if (c.data.settings.bluetooth) { pick(); return; }
    c.dialog({html: `<div class="ngin-bt"><p>${esc(c, t.t('Bluetooth/bt_enable_line1'))}</p><p>${esc(c, t.t('Bluetooth/bt_enable_line2'))}</p></div>`, buttons: [{label: t.t('Bluetooth/bt_enable_cancel')}, {label: t.t('Bluetooth/bt_enable_ok'), action: c => {
      NG.system?.setBluetooth(c, true);
      c.dialog({title: t.t('Bluetooth/enabling_progress_title'), progress: t.t('Bluetooth/enabling_progress_content'), cancelable: false});
      setTimeout(() => { if (c.ui.overlay === 'dialog') c.closeDialog(); pick(); }, 1100);
    }}]});
  }
  // Drive's UploadSharedItemActivity: the dialog with the document's title, the account and the folder.
  function drive(c, s, parent = '', retainedName) {
    const t = T(), untitled = t.t('Drive/upload_untitled_file_title'), title = retainedName ?? s.name ?? s.subject ?? untitled;
    const folder=NG.driveModel?.find(c,parent)?.name||t.t('Drive/menu_my_drive'),items=NG.sendModel.streams(s),multiple=items.length>1;
    const html = `<div class="ngin-up"><div class="ngin-uplabel">${esc(c, t.t(multiple?'Drive/upload_multiple_document_titles':'Drive/upload_document_title'))}</div>${multiple?`<div class="ngin-upnames">${items.map(item=>esc(c,item.document?.name||item.name||untitled)).join('<br>')}</div>`:`<input class="ngin-upname" value="${esc(c, title)}" autocomplete="off">`}
      <div class="ngin-uplabel">${esc(c, t.t('Drive/upload_account'))}</div><div class="ngin-upspin">${esc(c, NG.account?.email || '')}</div>
      <div class="ngin-uplabel">${esc(c, t.t('Drive/upload_folder'))}</div><button type="button" class="ngin-upspin folder"><img src="assets/dr-ic_type_folder.png" alt="">${esc(c,folder)}</button></div>`;
    let name = title;
    c.dialog({title: t.t('Drive/upload_shared_item_title'), html, mount: (c, win) => {
      const f = win.querySelector('.ngin-upname'); f?.addEventListener('input', () => { name = f.value; });
      win.querySelector('.folder').addEventListener('click',()=>{if(!NG.driveFolderPick)return;c.closeDialog();NG.driveFolderPick(c,parent,(c,chosen)=>drive(c,s,chosen===undefined?parent:chosen,name));});
    }, buttons: [{label: t.t('Drive/upload_cancel')}, {label: t.t('Drive/upload_shared_item_confirm'), action: c => {
      const n=name.trim()||untitled;
      for(const item of items){const fileName=multiple?(item.document?.name||item.name||untitled):n;
        if(NG.driveModel){const snapshot=item.photoSnapshot||(item.photo&&NG.photoLibrary.find(c,item.photo));NG.driveModel.upload(c,item.document?{...item.document,name:fileName}:{name:fileName,type:item.kind==='image'?'image':'text',content:item.text||'',size:snapshot?3200000:(item.text||'').length,mediaSnapshot:snapshot},parent);}
        else (c.data.driveFiles ||= []).push({type:item.kind==='image'?'image':'file',name:fileName});
      }
      c.save();c.toast(t.fmt('Drive/upload_completed_announcement',null,n));
    }}]});
  }
  // Photos' UploadContentActivity: the account to upload to, then Upload.
  function photos(c, spec) {
    const t = T();
    c.dialog({title: t.t('Photos/photos_uploadtoalbum_title'), html: `<div class="ngin-up"><div class="ngin-uplabel">${esc(c, t.t('Photos/photos_uploadtoalbum_account_label'))}</div><div class="ngin-upspin">${esc(c, NG.account?.email || '')}</div></div>`,
      buttons: [{label: t.t('framework/cancel')}, {label: t.t('Photos/photos_uploadtoalbum_upload'), action: c => {
        c.dialog({progress: t.t('Photos/photos_uploadtoalbum_progress_title'), cancelable: false});
        const progress = c.ui.dialogSpec;
        NG.appTasks.later(c, 'photos', () => {
          for(const item of NG.sendModel.streams(spec)){const existing = item.photo && NG.photoLibrary.find(c, item.photo);
          if (!existing || existing.appPrivate) {
            const id = NG.media.fromDocument(c, item.document || {name:item.name,mediaSnapshot:item.photoSnapshot}, 'photos-upload');
            const media = id && NG.photoLibrary.find(c,id); if (media) { delete media.appPrivate; media.album = 'photos'; media.uploaded = true; c.save(); }
          } else { existing.uploaded = true; c.save(); }}
          if (c.ui.overlay === 'dialog' && c.ui.dialogSpec === progress) c.closeDialog(); c.toast(t.t('Photos/photos_uploadtoalbum_upload_complete'));
        }, 1200);
      }}]});
  }
  // BeamShareActivity: NFC off asks first; then SendUi (the screen at 0.6 over black, "Tap to beam").
  function beam(c,spec) {
    const t = T(), s = c.data.settings;
    const send = c => { c.ui.beamData=JSON.parse(JSON.stringify(spec));c.ui.beamShot = c.el.viewport.innerHTML; c.overlay('beam'); };
    if (s.nfc ?? true) { if (s.beam ?? true) send(c); return; }
    c.dialog({message: t.t('NfcNci/beam_requires_nfc_enabled'), buttons: [{label: t.t('framework/no')}, {label: t.t('framework/yes'), action: c => { s.nfc = true; c.save(); if (s.beam ?? true) send(c); }}]});
  }
  function pick(c, id) {
    const s = c.ui.shareSpec, t = T();
    if (!s || !targets(c, s).some(x => x.id === id)) return;
    close(c, () => {
      if (id === 'clipboard') { NG.clipboard = s.text || ''; try { navigator.clipboard?.writeText(s.text || ''); } catch {} c.toast(t.t('Drive/send_to_clipboard_success')); return; }
      if (id === 'bluetooth') { bluetooth(c,s); return; }
      if (id === 'drive') { drive(c, s); return; }
      if (id === 'photos') { NG.appData.opened(c, 'photos'); photos(c, s); return; }
      if (id === 'beam') { beam(c,s); return; }
      if (id === 'cloudprint') { if (s.kind === 'audio' || s.kind === 'video') { c.dialog({title:t.t('CloudPrint2/document_submit_failed_title'),message:t.t('CloudPrint2/failure_msg_request_failed'),buttons:[{label:NG.text('settings').t('framework/ok')}]}); return; } c.ui.printJob = {title: s.subject || s.name || '', text: s.text || s.document?.content || '', photo: s.photo, document:s.document}; c.ui.print = null; c.open('print-preview'); return; }
      const delivered=NG.sendModel.streams(s).map(item=>{
        const photo=['image','video'].includes(item.kind)&&['gmail','messenger','hangouts'].includes(id)?NG.media.fromDocument(c,{...item.document,name:item.document?.name||item.name,photo:item.photo,mediaSnapshot:item.photoSnapshot},id):item.photo;
        const document=item.document?JSON.parse(JSON.stringify(item.document)):undefined;if(document&&photo){document.photo=photo;delete document.mediaSnapshot;}
        return {kind:item.kind,mime:item.mime,name:item.name||document?.name||'',photo,document};
      });
      c.ui.shareData = {...delivered[0],subject:s.subject||'',text:s.text||(['messenger','hangouts'].includes(id)&&s.kind==='text'?s.document?.content:'')||'',...(s.multiple?{streams:delivered,multiple:true}:{} )};
      c.open(id, 'share');
    });
  }

  NG.register('share', {
    app: false,
    render,
    back(c) { close(c); return true; },
    action(name, el, event, c) {
      if (name === 'ngin-cancel') { close(c); return true; }
      if (name === 'ngin-pick') { pick(c, el.dataset.id); return true; }
      return false;
    }
  });
  NG.register('beam', {
    app: false,
    render: c => `<div class="ngin-beam" data-action="ngin-beamoff"><div class="ngin-beamtext">${esc(c, T().t('NfcNci/tap_to_beam'))}</div><div class="ngin-shot"><div class="ngin-shotin">${c.ui.beamShot || ''}</div></div></div>`,
    back(c) { c.ui.beamShot = '';c.ui.beamData=null; c.closeOverlay(); return true; },
    action(name, el, event, c) { if (name === 'ngin-beamoff') { c.ui.beamShot = '';c.ui.beamData=null; c.closeOverlay(); } return true; }
  });

  // Settings' DevicePickerActivity (device_picker.xml in Theme.Settings): the Available devices category scanning, then
  // what FILTER_TYPE_TRANSFER keeps of what it found; the overflow's Refresh scans again.
  const SCAN_MS = 4500;
  NG.register('bt-picker', {
    app: false,
    statusColor: () => NG.settingsTheme?.colorPrimaryDark || '#21272b',
    render(c) {
      const t = T(), u = c.ui.btPicker || (c.ui.btPicker = {until: 0});
      if (!u.until) { u.until = Date.now() + SCAN_MS; setTimeout(() => { if (c.ui.view === 'bt-picker') c.render(); }, SCAN_MS + 50); }
      const scanning = u.until > Date.now();
      return `<div class="ngst"><div class="ngst-ab"><button type="button" class="ngst-nav" data-action="ngin-btup" aria-label="${esc(c, NG.text('settings').t('framework/action_bar_up_description'))}"><i style="-webkit-mask-image:url('assets/fw-ic_ab_back_material.svg');mask-image:url('assets/fw-ic_ab_back_material.svg')"></i></button>
        <span class="ngst-abtitle nav">${esc(c, t.t('SettingsGoogle/device_picker'))}</span><span class="ngst-actions">${NG.menu.button(c)}</span></div>
        <div class="ngst-content ngst-list"><div class="ngst-cat ngin-btcat"><span>${esc(c, t.t('SettingsGoogle/bluetooth_preference_found_devices'))}</span>${scanning ? `<svg class="ngin-spin" viewBox="0 0 48 48" aria-label="${esc(c, t.t('SettingsGoogle/progress_scanning'))}"><circle cx="24" cy="24" r="18"/></svg>` : ''}</div>
        ${scanning ? '' : NG.settingsRow(c, {title: t.t('SettingsGoogle/bluetooth_no_devices_found'), div: true})}</div></div>`;
    },
    back(c) { c.ui.btPicker = null; return false; },
    action(name, el, event, c) {
      const t = T(), u = c.ui.btPicker;
      if (name === 'ngin-btup') { c.ui.btPicker = null; c.back(); return true; }
      if (name === 'ng-menu') {
        const scanning = u?.until > Date.now();
        c.menu([{label: t.t(scanning ? 'SettingsGoogle/bluetooth_searching_for_devices' : 'SettingsGoogle/bluetooth_search_for_devices'), disabled: scanning, action: c => { c.ui.btPicker = {...c.ui.btPicker,until: 0}; c.render(); }}], el);
        return true;
      }
      return false;
    }
  });
})();
