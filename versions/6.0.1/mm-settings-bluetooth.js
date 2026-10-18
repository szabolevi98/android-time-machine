/* Android 6.0.1 Settings: Bluetooth (BluetoothSettings, Settings.apk MTC20K), MM.settingsScreens.bluetooth.
   - BluetoothEnabler's switch bar (as Wi-Fi's). updateContent: off shows bluetooth_empty_list_bluetooth_off in the
     empty view (TextAppearance.Medium; ble_scan_always_enabled 0), turning on bluetooth_turning_on; on, the Paired
     devices category (left out while empty), the Available devices BluetoothProgressCategory
     (preference_progress_category: the accent Body2 title with progressBarStyleSmallTitle while discovering, "No nearby
     Bluetooth devices were found." once a scan found none) and the unselectable row "Nexus 5X is visible to nearby
     devices while Bluetooth settings is open." (bluetooth_is_visible_message with the adapter's name).
   - BluetoothDevicePreference (preference_bt_icon: 48 dp at least, the class icon 6 dp in at each side, 15 dp before
     the Subhead title and Body1 summary): the icon by class or first profile (ic_bt_headset_hfp, ic_bt_headphones_a2dp),
     the summary from CachedBluetoothDevice.getConnectionSummary (Pairing…, Connecting…, Connected), a bonded one with
     preference_bluetooth's ic_bt_config button (Device settings) opening DeviceProfilesSettings (Paired devices: Name,
     Use for and the profiles' check boxes, FORGET and OK). onClicked: an unbonded device pairs (the headset with the
     legacy PIN automatically, the car kit through BluetoothPairingDialog's passkey confirmation: Bluetooth pairing code,
     the six digits in Headline, Allow … to access your contacts and call history checked for a handsfree class 0x408),
     a bonded one connects, a connected one asks Disconnect?.
   - The overflow menu: Refresh (Searching… and disabled while discovering), Rename this device, Show received files. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const sys = () => MM.system;
  const A = name => `assets/${name}`;
  const name = c => c.data.settings.btName || 'Nexus 5X';
  const scanning = c => sys().live.btScanUntil > Date.now();

  // The scan: discovery runs a few seconds and finds the devices one after another.
  const FOUND_AT = {headset: 1200, car: 2600}, SCAN_MS = 4500;
  function startScan(c) {
    const live = sys().live; live.btScanStart = Date.now(); live.btScanUntil = Date.now() + SCAN_MS;
    for (const t of [...Object.values(FOUND_AT), SCAN_MS + 50]) setTimeout(() => refresh(c), t);
  }
  const refresh = c => { if (c.ui.view === 'settings' && !c.ui.overlay && c.ui.settings?.stack?.at(-1)?.screen === 'bluetooth') c.render(); };
  const found = (c, d) => Date.now() - (sys().live.btScanStart || 0) >= FOUND_AT[d.id];

  function summary(c, d) {
    const t = T();
    if (d.pairing) return t.t('bluetooth_pairing');
    if (d.connecting) return t.t('bluetooth_connecting');
    if (d.connected) return t.t('bluetooth_connected');
    return '';
  }
  const icon = d => A(d.bonded && d.profiles[0] === 'headset' ? 'st-ic_bt_headset_hfp.png' : d.cls === 0x408 ? 'st-ic_bt_headphones_a2dp.png' : 'st-ic_bt_headset_hfp.png');
  function row(c, d) {
    const busy = d.pairing || d.connecting;
    return `<div class="mmbt-row${busy ? ' disabled' : ''}"><button type="button" class="mmbt-dev" data-action="mmbt-dev" data-id="${d.id}"${busy ? ' disabled' : ''}><img class="mmbt-icon" src="${icon(d)}" alt=""><span class="mmst-texts"><span class="mmst-title">${c.safe(d.name)}</span>${summary(c, d) ? `<span class="mmst-summary">${c.safe(summary(c, d))}</span>` : ''}</span></button>`
      + `${d.bonded ? `<span class="mmbt-widget"><button type="button" class="mmbt-config" data-action="mmbt-config" data-id="${d.id}" aria-label="${c.safe(T().t('bluetooth_device_details'))}"><img src="${A('st-ic_bt_config.png')}" alt=""></button></span>` : ''}</div>`;
  }

  function render(c) {
    const t = T(), s = c.data.settings, live = sys().live;
    if (!s.bluetooth) return `<div class="mmst-empty"><span class="medium">${c.safe(t.t('bluetooth_empty_list_bluetooth_off'))}</span></div>`;
    if (live.btTurningOn > Date.now()) return `<div class="mmst-empty">${c.safe(t.t('bluetooth_turning_on'))}</div>`;
    if (!live.btScanStart) startScan(c);
    const devices = sys().btDevices(c);
    const paired = devices.filter(d => d.bonded).sort((a, b) => (b.connected - a.connected) || a.name.localeCompare(b.name));
    const avail = devices.filter(d => !d.bonded && (d.pairing || found(c, d))).sort((a, b) => b.rssi - a.rssi);
    const cat = (title, spin) => `<div class="mmst-cat mmbt-cat"><span>${c.safe(title)}</span>${spin ? `<svg class="mmbt-spin" viewBox="0 0 48 48" aria-label="${c.safe(t.t('progress_scanning'))}"><circle cx="24" cy="24" r="19"/></svg>` : ''}</div>`;
    let out = '';
    if (paired.length) out += cat(t.t('bluetooth_preference_paired_devices')) + paired.map(d => row(c, d)).join('');
    out += cat(t.t('bluetooth_preference_found_devices'), scanning(c)) + avail.map(d => row(c, d)).join('');
    if (!avail.length && !scanning(c)) out += `<div class="mmst-pref mmbt-none"><span class="mmst-texts"><span class="mmst-title">${c.safe(t.t('bluetooth_no_devices_found'))}</span></span></div>`;
    out += `<div class="mmst-pref mmbt-visible"><span class="mmst-texts"><span class="mmst-summary">${c.safe(t.fmt('bluetooth_is_visible_message', null, name(c)))}</span></span></div>`;
    return `<div class="mmst-list">${out}</div>`;
  }
  function bar(c) {
    const t = T(), on = !!c.data.settings.bluetooth;
    return `<button type="button" class="mmst-switchbar" data-action="mmbt-toggle"><span>${c.safe(t.t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button><div class="mmst-pinned"></div>`;
  }

  // BluetoothPairingDialog, PAIRING_VARIANT_PASSKEY_CONFIRMATION (bluetooth_pin_confirm.xml).
  function pairDialog(c, d) {
    const t = T(), key = String(100000 + Math.floor(Math.random() * 900000));
    sys().live.btPairing = d.id; c.render();
    const done = ok => { if (ok) setTimeout(() => sys().btBond(c, d.id), 900); else { sys().live.btPairing = null; } c.render(); };
    c.dialog({title: t.fmt('bluetooth_pairing_request', null, d.name), cancelable: true, onCancel: () => done(false),
      html: `<div class="mmbt-pin"><div class="mmbt-caption">${c.safe(t.t('bluetooth_pairing_key_msg'))}</div><div class="mmbt-key">${key}</div>
        <label class="mmwf-check mmbt-share"><input type="checkbox" checked><i class="mmst-check"></i><span>${c.safe(t.fmt('bluetooth_pairing_shares_phonebook', null, d.name))}</span></label></div>`,
      buttons: [{label: t.t('bluetooth_pairing_decline'), action: () => done(false)}, {label: t.t('bluetooth_pairing_accept'), action: () => done(true)}]});
  }
  // DeviceProfilesSettings.
  function profilesDialog(c, d) {
    const t = T(), s = c.data.settings, off = (s.btProfilesOff || {})[d.id] || [];
    const label = {headset: 'bluetooth_profile_headset', a2dp: 'bluetooth_profile_a2dp', pbap: 'bluetooth_profile_pbap'};
    c.dialog({title: t.t('bluetooth_preference_paired_devices'),
      html: `<div class="mmbt-profiles"><div class="mmbt-label">${c.safe(t.t('bluetooth_preference_paired_dialog_name_label'))}</div><input class="mmwf-edit mmbt-name" type="text" maxlength="32" value="${c.safe(d.name)}" spellcheck="false">
        <div class="mmbt-label use">${c.safe(t.t('bluetooth_device_advanced_profile_header_title'))}</div>${d.profiles.map(p => `<label class="mmwf-check"><input type="checkbox" data-profile="${p}"${off.includes(p) ? '' : ' checked'}><i class="mmst-check"></i><span>${c.safe(t.t(label[p]))}</span></label>`).join('')}</div>`,
      buttons: [{label: t.t('forget'), action: c => sys().btForget(c, d.id)}, {label: t.t('okay'), action: c => {
        const f = c.ui.btForm || {}; s.btNames = {...(s.btNames || {})};
        if (f.name && f.name !== d.name) s.btNames[d.id] = f.name;
        s.btProfilesOff = {...(s.btProfilesOff || {}), [d.id]: f.off || off}; c.save(); c.render();
      }}],
      mount(c, win) {
        const sync = () => { c.ui.btForm = {name: win.querySelector('.mmbt-name').value.trim(), off: [...win.querySelectorAll('[data-profile]')].filter(i => !i.checked).map(i => i.dataset.profile)}; };
        win.addEventListener('input', sync); win.addEventListener('change', sync); sync();
      }});
  }
  // BluetoothNameDialogFragment.
  function renameDialog(c) {
    const t = T(), s = c.data.settings;
    c.dialog({title: t.t('bluetooth_rename_device'), html: `<div class="mmst-edit"><input type="text" class="mmst-input mmbt-rename" maxlength="248" value="${c.safe(name(c))}" spellcheck="false"></div>`,
      buttons: [{label: t.t('cancel')}, {label: t.t('bluetooth_rename_button'), action: c => { const v = c.ui.btRename; if (v) { s.btName = v; c.save(); c.render(); } }}],
      mount(c, win) {
        const input = win.querySelector('.mmbt-rename'), last = [...win.querySelectorAll('.mmdlg-button')].at(-1);
        const sync = () => { c.ui.btRename = input.value.trim(); last.disabled = !c.ui.btRename; };
        input.addEventListener('input', sync); sync(); setTimeout(() => input.focus(), 50);
      }});
  }

  MM.settingsScreens.bluetooth = {
    title: () => T().t('bluetooth_settings'),
    render, bar,
    actions: c => MM.menu.button(c),
    action(c, actionName, el) {
      const t = T(), s = c.data.settings;
      if (actionName === 'mm-menu') {
        const on = !!s.bluetooth && !(sys().live.btTurningOn > Date.now()), busy = scanning(c);
        c.menu([{label: t.t(busy ? 'bluetooth_searching_for_devices' : 'bluetooth_search_for_devices'), disabled: !on || busy, action: c => { startScan(c); c.render(); }},
          {label: t.t('bluetooth_rename_device'), disabled: !on, action: renameDialog},
          {label: t.t('bluetooth_show_received_files'), action: c => MM.settingsGo(c, 'bt-history', t.t('bluetooth_show_received_files'))}]);
        return true;
      }
      if (actionName === 'mmbt-toggle') {
        const on = !s.bluetooth;
        sys().setBluetooth(c, on); sys().live.btScanStart = 0; sys().live.btScanUntil = 0; c.render();
        if (on) setTimeout(() => refresh(c), 1050);
        return true;
      }
      const d = sys().btDevices(c).find(x => x.id === el.dataset.id);
      if (!d) return false;
      if (actionName === 'mmbt-config') { profilesDialog(c, d); return true; }
      if (actionName === 'mmbt-dev') {
        sys().live.btScanUntil = Math.min(sys().live.btScanUntil, Date.now());   // onDevicePreferenceClick stops scanning
        if (d.connected) {
          c.dialog({title: t.t('bluetooth_disconnect_title'), html: `<div class="mmdlg-message">${t.fmt('bluetooth_disconnect_all_profiles', null, c.safe(d.name)).replace(/<(?!\/?(br|b)\b)[^>]*>/g, '')}</div>`,
            buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => sys().btDisconnect(c, d.id)}]});
        } else if (d.bonded) sys().btConnect(c, d.id);
        else if (d.mode === 'confirm') pairDialog(c, d);
        else { sys().live.btPairing = d.id; c.render(); setTimeout(() => sys().btBond(c, d.id), 1500); }
        return true;
      }
      return false;
    }
  };
})();
