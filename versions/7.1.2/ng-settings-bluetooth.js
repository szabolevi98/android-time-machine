/* Android 7.1.2 Settings: Bluetooth (BluetoothSettings, SettingsGoogle N2G48C), NG.settingsScreens.bluetooth. The logic
   is 6.0.1's (its Bluetooth screen); N2G48C's classes and layouts:
   - BluetoothEnabler's switch bar. updateContent: off shows bluetooth_empty_list_bluetooth_off in the empty view, turning
     on bluetooth_turning_on; on, the Paired devices category (left out while empty), the Available devices
     BluetoothProgressCategory (the accent Body2 title with the small spinner while discovering, "No nearby Bluetooth
     devices were found." once a scan found none) and bluetooth_is_visible_message with the adapter's name.
   - BluetoothDevicePreference (preference_bt_icon.xml: 48 dp at least, the class icon 6 dp in at each side, 15 dp before
     the Subhead title and the Body1 summary; widget_frame 58 dp at least): getBtClassDrawableWithDescription
     (ic_bt_headset_hfp for the headset profile, ic_bt_headphones_a2dp for A2DP); the summary from
     CachedBluetoothDevice.getConnectionSummary (Pairing…, Connecting…, Connected); a bonded one with preference_bluetooth's
     ic_settings button (8 dp padding, Device settings) opening DeviceProfilesSettings (Paired devices: Name, Use for and
     the profiles' check boxes, FORGET and OK). An unbonded device pairs (the headset with the legacy PIN by itself, the
     car kit through BluetoothPairingDialog: "Pair with …?", bluetooth_pin_confirm.xml's Bluetooth pairing code over the
     six digits in Headline, Allow … to access your contacts and call history checked, CANCEL / PAIR), a bonded one
     connects, a connected one asks "Disconnect?".
   - The overflow: Refresh (Searching… and disabled while discovering), Rename this device, Show received files, Help. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const sys = () => NG.system;
  const A = name => `assets/${name}`;
  const name = c => c.data.settings.btName || 'Nexus 6P';
  const scanning = c => sys().live.btScanUntil > Date.now();

  // The scan: discovery runs a few seconds and finds the devices one after another.
  const FOUND_AT = {headset: 1200, car: 2600}, SCAN_MS = 4500;
  function startScan(c) {
    const live = sys().live; live.btScanStart = Date.now(); live.btScanUntil = Date.now() + SCAN_MS;
    for (const t of [...Object.values(FOUND_AT), SCAN_MS + 50]) setTimeout(() => refresh(c), t);
  }
  const refresh = c => { if (c.ui.view === 'settings' && !c.ui.overlay && c.ui.settings?.stack?.at(-1)?.screen === 'bluetooth') { c.transition('none'); c.render(); } };
  const found = (c, d) => Date.now() - (sys().live.btScanStart || 0) >= FOUND_AT[d.id];

  function summary(c, d) {
    const t = T();
    if (d.pairing) return t.t('bluetooth_pairing');
    if (d.connecting) return t.t('bluetooth_connecting');
    if (d.connected) return t.t('bluetooth_connected');
    return '';
  }
  const icon = d => d.profiles[0] === 'headset' ? 'st-ic_bt_headset_hfp.svg' : 'st-ic_bt_headphones_a2dp.svg';
  function row(c, d) {
    const busy = d.pairing || d.connecting, sum = summary(c, d);
    return `<div class="ngbt-row${busy ? ' disabled' : ''}"><button type="button" class="ngbt-dev" data-action="ngbt-dev" data-id="${d.id}"${busy ? ' disabled' : ''}><i class="ngbt-icon" style="-webkit-mask-image:url('${A(icon(d))}');mask-image:url('${A(icon(d))}')"></i><span class="ngst-texts"><span class="ngst-title">${c.safe(d.name)}</span>${sum ? `<span class="ngbt-summary">${c.safe(sum)}</span>` : ''}</span></button>`
      + `${d.bonded ? `<span class="ngbt-widget"><button type="button" class="ngst-gear" data-action="ngbt-config" data-id="${d.id}" aria-label="${c.safe(T().t('bluetooth_device_details'))}"><i></i></button></span>` : ''}</div>`;
  }

  function render(c) {
    const t = T(), s = c.data.settings, live = sys().live;
    if (!s.bluetooth) return `<div class="ngst-emptyview">${c.safe(t.t('bluetooth_empty_list_bluetooth_off'))}</div>`;
    if (live.btTurningOn > Date.now()) return `<div class="ngst-list">${NG.settingsRow(c, {title: t.t('bluetooth_turning_on'), div: true})}</div>`;
    if (!live.btScanStart) startScan(c);
    const devices = sys().btDevices(c);
    const paired = devices.filter(d => d.bonded).sort((a, b) => (b.connected - a.connected) || a.name.localeCompare(b.name));
    const avail = devices.filter(d => !d.bonded && (d.pairing || found(c, d))).sort((a, b) => b.rssi - a.rssi);
    const cat = (title, spin) => ({html: `<div class="ngst-cat ngbt-cat"><span>${c.safe(title)}</span>${spin ? `<svg class="ngbt-spin" viewBox="0 0 48 48" aria-label="${c.safe(t.t('progress_scanning'))}"><circle cx="24" cy="24" r="19"/></svg>` : ''}</div>`, sel: false});
    const items = [];
    if (paired.length) items.push(cat(t.t('bluetooth_preference_paired_devices')), ...paired.map(d => ({html: row(c, d), sel: true})));
    items.push(cat(t.t('bluetooth_preference_found_devices'), scanning(c)), ...avail.map(d => ({html: row(c, d), sel: true})));
    if (!avail.length && !scanning(c)) items.push({html: NG.settingsRow(c, {title: t.t('bluetooth_no_devices_found'), div: true}), sel: false});
    items.push({html: `<div class="ngst-pref ngbt-visible"><span class="ngst-texts"><span class="ngst-summary">${c.safe(t.fmt('bluetooth_is_visible_message', null, name(c)))}</span></span></div>`, sel: false});
    return `<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
  }
  const bar = c => `${NG.settingsSwitchBar(c, !!c.data.settings.bluetooth, 'ngbt-toggle')}<div class="ngst-pinned"></div>`;

  // BluetoothPairingDialog (passkey confirmation).
  function pairDialog(c, d) {
    const t = T(), key = String(100000 + Math.floor(Math.random() * 900000));
    sys().live.btPairing = d.id; c.render();
    const done = ok => { if (ok) setTimeout(() => sys().btBond(c, d.id), 900); else sys().live.btPairing = null; c.render(); };
    c.dialog({title: t.fmt('bluetooth_pairing_request', null, d.name), cancelable: true, onCancel: () => done(false),
      html: `<div class="ngbt-pin"><div class="ngbt-caption">${c.safe(t.t('bluetooth_pairing_key_msg'))}</div><div class="ngbt-key">${key}</div>
        <label class="ngwf-check ngbt-share"><input type="checkbox" checked><i class="ngst-check"></i><span>${c.safe(t.fmt('bluetooth_pairing_shares_phonebook', null, d.name))}</span></label></div>`,
      buttons: [{label: t.t('bluetooth_pairing_decline'), action: () => done(false)}, {label: t.t('bluetooth_pairing_accept'), action: () => done(true)}]});
  }
  // DeviceProfilesSettings.
  function profilesDialog(c, d) {
    const t = T(), s = c.data.settings, off = (s.btProfilesOff || {})[d.id] || [];
    const label = {headset: 'bluetooth_profile_headset', a2dp: 'bluetooth_profile_a2dp', pbap: 'bluetooth_profile_pbap'};
    let form = {name: d.name, off};
    c.dialog({title: t.t('bluetooth_preference_paired_devices'),
      html: `<div class="ngbt-profiles"><div class="ngbt-label">${c.safe(t.t('bluetooth_preference_paired_dialog_name_label'))}</div><input class="ngwf-edit ngbt-name" type="text" maxlength="32" value="${c.safe(d.name)}" spellcheck="false">
        <div class="ngbt-label use">${c.safe(t.t('bluetooth_device_advanced_profile_header_title'))}</div>${d.profiles.map(p => `<label class="ngwf-check"><input type="checkbox" data-profile="${p}"${off.includes(p) ? '' : ' checked'}><i class="ngst-check"></i><span>${c.safe(t.t(label[p]))}</span></label>`).join('')}</div>`,
      buttons: [{label: t.t('forget'), neutral: true, action: c => sys().btForget(c, d.id)}, {label: t.t('okay'), action: c => {
        s.btNames = {...(s.btNames || {})};
        if (form.name && form.name !== d.name) s.btNames[d.id] = form.name;
        s.btProfilesOff = {...(s.btProfilesOff || {}), [d.id]: form.off}; c.save(); c.render();
      }}],
      mount(c, win) {
        const sync = () => { form = {name: win.querySelector('.ngbt-name').value.trim(), off: [...win.querySelectorAll('[data-profile]')].filter(i => !i.checked).map(i => i.dataset.profile)}; };
        win.addEventListener('input', sync); win.addEventListener('change', sync); sync();
      }});
  }
  // BluetoothNameDialogFragment.
  function renameDialog(c) {
    const t = T(), s = c.data.settings;
    let value = name(c);
    c.dialog({title: t.t('bluetooth_rename_device'), html: `<div class="ngst-edit"><input type="text" class="ngst-input ngbt-rename" maxlength="248" value="${c.safe(value)}" spellcheck="false"></div>`,
      buttons: [{label: t.t('cancel')}, {label: t.t('bluetooth_rename_button'), action: c => { if (value) { s.btName = value; c.save(); c.render(); } }}],
      mount(c, win) {
        const input = win.querySelector('.ngbt-rename'), last = [...win.querySelectorAll('.ngdlg-button')].at(-1);
        const sync = () => { value = input.value.trim(); last.disabled = !value; };
        input.addEventListener('input', sync); sync(); setTimeout(() => input.focus(), 50);
      }});
  }

  NG.settingsScreens.bluetooth = {
    title: () => T().t('bluetooth_settings'),
    render, bar,
    actions: c => NG.menu.button(c),
    action(c, actionName, el) {
      const t = T(), s = c.data.settings;
      if (actionName === 'ng-menu') {
        const on = !!s.bluetooth && !(sys().live.btTurningOn > Date.now()), busy = scanning(c);
        c.menu([{label: t.t(busy ? 'bluetooth_searching_for_devices' : 'bluetooth_search_for_devices'), disabled: !on || busy, action: c => { startScan(c); c.render(); }},
          {label: t.t('bluetooth_rename_device'), disabled: !on, action: renameDialog},
          {label: t.t('bluetooth_show_received_files'), action: c => NG.settingsGo(c, 'bt-history', '')},
          {label: t.t('help_label'), action: c => c.open('help', 'settings')}], el);
        return true;
      }
      if (actionName === 'ngbt-toggle') {
        const on = !s.bluetooth;
        sys().setBluetooth(c, on); sys().live.btScanStart = 0; sys().live.btScanUntil = 0; c.transition('none'); c.render();
        if (on) setTimeout(() => refresh(c), 1050);
        return true;
      }
      const d = sys().btDevices(c).find(x => x.id === el.dataset.id);
      if (!d) return false;
      if (actionName === 'ngbt-config') { profilesDialog(c, d); return true; }
      if (actionName === 'ngbt-dev') {
        sys().live.btScanUntil = Math.min(sys().live.btScanUntil, Date.now());   // onDevicePreferenceClick stops scanning
        if (d.connected) {
          const msg = t.fmt('bluetooth_disconnect_all_profiles', null, d.name).replace(/<br\s*\/?>/g, '\n').replace(/<[^>]+>/g, '');
          c.dialog({title: t.t('bluetooth_disconnect_title'), message: msg, buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => sys().btDisconnect(c, d.id)}]});
        } else if (d.bonded) sys().btConnect(c, d.id);
        else if (d.mode === 'confirm') pairDialog(c, d);
        else { sys().live.btPairing = d.id; c.render(); setTimeout(() => sys().btBond(c, d.id), 1500); }
        return true;
      }
      return false;
    }
  };

  // Bluetooth Share's transfer history (BluetoothOppTransferHistory, Bluetooth.apk): nothing received on the simulator.
  NG.settingsScreens['bt-history'] = {
    title: () => T().t('Bluetooth/inbound_history_title'),
    render: c => `<div class="ngst-emptyview center">${c.safe(T().t('Bluetooth/no_transfers'))}</div>`
  };
})();
