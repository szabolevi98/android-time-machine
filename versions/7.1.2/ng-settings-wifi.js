/* Android 7.1.2 Settings: Wi-Fi (WifiSettings, SettingsGoogle N2G48C), Configure Wi-Fi, saved networks and Advanced, as
   NG.settingsScreens.wifi / 'wifi-saved' and hooks on wifi_configure_settings. The logic is 6.0.1's (its Wi-Fi screen);
   N2G48C's WifiSettings decides the rest:
   - The SwitchBar above the list, the indeterminate progress header under it while Wi-Fi turns on or scans.
   - onAccessPointsChanged: off, the empty view's wifi_empty_list_wifi_off; turning on wifi_starting; then the networks in
     range as LongPressAccessPointPreference rows (the theme's wifi_signal: ic_wifi_signal_1..4 in colorAccent,
     ic_wifi_signal_lock over a secured one; the SSID and AccessPoint.getSettingsSummary: "Connected", "Saved"), and last
     the "Add network" preference (ic_menu_add_inset: ic_menu_add inset 4 dp).
   - addOptionsMenuItems: the Configure gear (ic_settings_24dp, always shown), then the overflow's Refresh (with Wi-Fi on),
     Advanced and Help & feedback.
   - onPreferenceTreeClick: an open network that is not saved connects at once; any other opens WifiDialog
     (WifiConfigController: wifi_item rows, the 14 sp textColorSecondary label over the 16 sp Subhead value; the
     password with Show password and Advanced options, Connect from 8 characters; the active one Status, Signal
     strength, Link speed, Frequency, Security; Forget on a saved or active one, Cancel).
   - A long press opens the context menu (Connect to network, Forget network, Modify network).
   - ConfigureWifiSettings (wifi_configure_settings.xml): Saved networks (with any), Network notification
     (wifi_networks_available_notification_on, enabled with Wi-Fi on), Use open Wi-Fi automatically (GCS is a network
     scorer), Keep Wi-Fi on during sleep (wifi_sleep_policy 2, Always); the carrier networks switch goes (none
     configured), so does the cellular fallback (config_networkAvoidBadWifi 1); MAC address and IP address, not
     selectable. AdvancedWifiSettings: Install certificates, Wi-Fi Direct, WPS Push Button, WPS Pin Entry. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const sys = () => NG.system;
  const A = name => `assets/${name}`;
  const H = NG.settingsHooks;

  function summary(c, ap) {
    const t = T(), s = c.data.settings;
    if (ap.active) return t.t('array:wifi_status')[5];
    if (sys().live.wifiConnecting > Date.now() && s.wifiSsid === ap.ssid) return t.t('array:wifi_status')[2];
    return ap.saved ? t.t('wifi_remembered') : '';
  }
  const security = (t, ap) => t.t(ap.secure ? 'wifi_security_wpa2' : 'wifi_security_none');
  const icon = ap => `<span class="ngwf-signal"><img src="${A(`st-ic_wifi_signal_${ap.level + 1}.svg`)}" alt="">${ap.secure ? `<img src="${A('st-ic_wifi_signal_lock.svg')}" alt="">` : ''}</span>`;
  const added = c => c.data.settings.wifiAdded || [];
  const saved = c => [...sys().accessPoints(c).filter(ap => ap.saved), ...added(c).map(n => ({...n, level: -1, saved: true, away: true}))];
  const progress = () => '<div class="ngst-progress"><i></i><i></i></div>';

  function render(c) {
    const t = T(), s = c.data.settings, live = sys().live, now = Date.now();
    const on = !!s.wifi, starting = on && (live.wifiStarting || 0) > now;
    if (!on) return `<div class="ngst-emptyview">${c.safe(t.t('wifi_empty_list_wifi_off'))}</div>`;
    if (starting) return `<div class="ngst-list">${NG.settingsRow(c, {title: t.t('wifi_starting'), div: true})}</div>`;
    const items = sys().accessPoints(c).map((ap, i) => ({html: NG.settingsRow(c, {title: ap.ssid, summary: summary(c, ap), icon: icon(ap), action: 'ngwf-ap', data: ` data-index="${i}"`}), sel: true}));
    items.push({html: NG.settingsRow(c, {title: t.t('wifi_add_network'), icon: `<img class="ngst-ic" src="${A('st-ic_menu_add.svg')}" alt="">`, action: 'ngwf-add'}), sel: true});
    return `<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
  }
  function bar(c) {
    const s = c.data.settings, live = sys().live, on = !!s.wifi;
    return `${NG.settingsSwitchBar(c, on, 'ngwf-toggle')}<div class="ngst-pinned">${on && live.wifiConnecting > Date.now() ? progress() : ''}</div>`;
  }

  const item = (c, label, value) => `<div class="ngwf-item"><span class="ngwf-label">${c.safe(label)}</span><span class="ngwf-value">${c.safe(value)}</span></div>`;
  function apDialog(c, ap) {
    const t = T(), edit = !ap.saved && !ap.active && ap.secure, buttons = [];
    let html = '';
    if (ap.saved || ap.active) buttons.push({label: t.t('wifi_forget'), neutral: true, action: c => sys().forgetWifi(c, ap.ssid)});
    buttons.push({label: t.t('wifi_cancel')});
    if (edit) {
      html = `<div class="ngwf-dialog">${passwordFields(c)}${advancedFields(c)}</div>`;
      buttons.push({label: t.t('wifi_connect'), disabled: true, action: c => sys().connectWifi(c, ap.ssid)});
    } else if (ap.active) {
      html = `<div class="ngwf-dialog">${item(c, t.t('wifi_status'), t.t('array:wifi_status')[5])}${item(c, t.t('wifi_signal'), t.t('array:wifi_signal')[ap.level])}${item(c, t.t('wifi_speed'), t.fmt('link_speed', null, ap.speed))}${item(c, t.t('wifi_frequency'), t.t(ap.freq >= 4900 ? 'wifi_band_5ghz' : 'wifi_band_24ghz'))}${item(c, t.t('wifi_security'), security(t, ap))}</div>`;
    } else {
      html = '<div class="ngwf-dialog"></div>';
      buttons.push({label: t.t('wifi_connect'), action: c => sys().connectWifi(c, ap.ssid)});
    }
    c.dialog({title: ap.ssid, html, buttons, mount: edit ? (c, win) => bindPassword(win, 8) : null});
  }
  const passwordFields = c => {
    const t = T();
    return `<div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_password'))}</span><input class="ngwf-edit" type="password" autocomplete="off" spellcheck="false"></div>
      <div class="ngwf-item"><label class="ngwf-check"><input type="checkbox" class="ngwf-show"><i class="ngst-check"></i><span>${c.safe(t.t('wifi_show_password'))}</span></label></div>`;
  };
  // wifi_advanced_toggle (ic_expand at its end) and the IP / proxy spinners it shows.
  const advancedFields = c => {
    const t = T(), opts = list => list.map(o => `<option>${c.safe(o)}</option>`).join('');
    return `<div class="ngwf-item"><label class="ngwf-check ngwf-adv"><input type="checkbox" class="ngwf-advbox"><span>${c.safe(t.t('wifi_show_advanced'))}</span><i class="ngwf-expand"></i></label></div>
      <div class="ngwf-advanced" hidden><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('proxy_settings_title'))}</span><select class="ngwf-spinner">${opts(t.t('wifi_proxy_settings'))}</select></div>
      <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_ip_settings'))}</span><select class="ngwf-spinner">${opts(t.t('array:wifi_ip_settings'))}</select></div></div>`;
  };
  // enableSubmitIfAppropriate: a WPA password has 8 characters at least; Show password unmasks it.
  function bindPassword(win, min, extra = () => true) {
    const pw = win.querySelector('.ngwf-edit[type=password], .ngwf-edit.pw'), submit = win.querySelectorAll('.ngdlg-button');
    const last = submit[submit.length - 1];
    const check = () => { if (last) last.disabled = !(extra() && (!pw || pw.closest('[hidden]') || pw.value.length >= min)); };
    pw?.classList.add('pw');
    win.addEventListener('input', check); win.addEventListener('change', check);
    win.querySelector('.ngwf-show')?.addEventListener('change', e => { if (pw) pw.type = e.target.checked ? 'text' : 'password'; });
    win.querySelector('.ngwf-advbox')?.addEventListener('change', e => { win.querySelector('.ngwf-advanced').hidden = !e.target.checked; });
    check();
    setTimeout(() => (win.querySelector('.ngwf-ssid') || pw)?.focus(), 50);
  }
  // Add network: the SSID, the security spinner, the password for a secured one; Save.
  function addDialog(c) {
    const t = T(), sec = t.t('array:wifi_security');
    const html = `<div class="ngwf-dialog"><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_ssid'))}</span><input class="ngwf-edit ngwf-ssid" type="text" maxlength="32" placeholder="${c.safe(t.t('wifi_ssid_hint'))}" autocomplete="off" spellcheck="false"></div>
      <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_security'))}</span><select class="ngwf-spinner ngwf-sec">${sec.map(o => `<option>${c.safe(o)}</option>`).join('')}</select></div>
      <div class="ngwf-secfields" hidden>${passwordFields(c)}</div>${advancedFields(c)}</div>`;
    let form = {};
    c.dialog({title: t.t('wifi_add_network'), html, buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), disabled: true, action: c => {
      const s = c.data.settings;
      if (!form.ssid) return;
      if (sys().accessPoints(c).find(ap => ap.ssid === form.ssid)) sys().connectWifi(c, form.ssid);
      else { s.wifiAdded = [...added(c).filter(n => n.ssid !== form.ssid), {ssid: form.ssid, secure: form.secure}]; c.save(); c.render(); }
    }}], mount(c, win) {
      const ssid = win.querySelector('.ngwf-ssid'), secSel = win.querySelector('.ngwf-sec'), fields = win.querySelector('.ngwf-secfields');
      const sync = () => { fields.hidden = secSel.selectedIndex === 0; form = {ssid: ssid.value.trim(), secure: secSel.selectedIndex > 0}; };
      win.addEventListener('input', sync); win.addEventListener('change', sync); sync();
      bindPassword(win, 8, () => !!ssid.value.trim());
    }});
  }
  function menu(c, el) {
    const t = T(), on = !!c.data.settings.wifi;
    c.menu([{label: t.t('menu_stats_refresh'), disabled: !on, action: c => { sys().live.wifiConnecting = Math.max(sys().live.wifiConnecting, Date.now() + 1500); c.render(); setTimeout(() => c.ui.view === 'settings' && c.render(), 1600); }},
      {label: t.t('wifi_menu_advanced'), action: c => NG.settingsGo(c, 'xml:wifi_advanced_settings', t.t('wifi_advanced_titlebar'))},
      {label: t.t('help_label'), action: c => c.open('help', 'settings')}], el);
  }
  function contextMenu(c, ap) {
    const t = T(), items = [];
    if (!ap.active) items.push([t.t('wifi_menu_connect'), () => ap.secure && !ap.saved ? apDialog(c, ap) : sys().connectWifi(c, ap.ssid)]);
    if (ap.saved || ap.active) { items.push([t.t('wifi_menu_forget'), () => sys().forgetWifi(c, ap.ssid)]); items.push([t.t('wifi_menu_modify'), () => modifyDialog(c, ap)]); }
    if (!items.length) return;
    c.dialog({title: ap.ssid, items: items.map(([label]) => ({html: `<span class="ngst-dlgitem">${c.safe(label)}</span>`})), onItem: i => items[i][1]()});
  }
  function modifyDialog(c, ap) {
    const t = T();
    c.dialog({title: ap.ssid, html: `<div class="ngwf-dialog">${ap.secure ? passwordFields(c) : ''}${advancedFields(c)}</div>`,
      buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), action: () => {}}], mount: (c, win) => bindPassword(win, ap.secure ? 8 : 0)});
  }

  NG.settingsScreens.wifi = {
    title: () => T().t('wifi_settings'),
    render, bar,
    actions: c => `<button type="button" class="ngst-ab-btn" data-action="ngwf-configure" aria-label="${c.safe(T().t('wifi_menu_configure'))}"><i style="-webkit-mask-image:url('${A('st-ic_settings_24dp.svg')}');mask-image:url('${A('st-ic_settings_24dp.svg')}')"></i></button>${NG.menu.button(c)}`,
    mount(c, root) {
      for (const el of root.querySelectorAll('[data-action="ngwf-ap"]')) {
        let timer = 0;
        el.addEventListener('pointerdown', () => { el.dataset.held = ''; timer = setTimeout(() => { el.dataset.held = '1'; contextMenu(c, sys().accessPoints(c)[+el.dataset.index]); }, 500); });
        for (const type of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(type, () => clearTimeout(timer));
      }
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ng-menu') { menu(c, el); return true; }
      if (name === 'ngwf-configure') { NG.settingsGo(c, 'xml:wifi_configure_settings', t.t('wifi_configure_titlebar')); return true; }
      if (name === 'ngwf-add') { if (c.data.settings.wifi) addDialog(c); return true; }
      if (name === 'ngwf-toggle') {
        const on = !c.data.settings.wifi;
        sys().setWifi(c, on); c.transition('none'); c.render();
        if (on) setTimeout(() => c.ui.view === 'settings' && !c.ui.overlay && c.render(), 1050);
        return true;
      }
      if (name === 'ngwf-ap') {
        if (el.dataset.held === '1') { el.dataset.held = ''; return true; }
        const ap = sys().accessPoints(c)[+el.dataset.index];
        if (!ap) return true;
        if (!ap.secure && !ap.saved && !ap.active) { sys().connectWifi(c, ap.ssid); c.render(); return true; }
        apDialog(c, ap); return true;
      }
      return false;
    }
  };

  // SavedAccessPointsWifiSettings: every saved network by name.
  NG.settingsScreens['wifi-saved'] = {
    title: () => T().t('wifi_saved_access_points_titlebar'),
    render: c => `<div class="ngst-list">${NG.settingsJoinRows(saved(c).map((ap, i) => ({html: NG.settingsRow(c, {title: ap.ssid, action: 'ngwf-saved', data: ` data-index="${i}"`}), sel: true})))}</div>`,
    action(c, name, el) {
      if (name !== 'ngwf-saved') return false;
      const ap = saved(c)[+el.dataset.index], t = T();
      if (!ap) return true;
      c.dialog({title: ap.ssid, html: '<div class="ngwf-dialog"></div>', buttons: [{label: t.t('wifi_forget'), neutral: true, action: c => {
        if (ap.away) { c.data.settings.wifiAdded = added(c).filter(n => n.ssid !== ap.ssid); c.save(); c.render(); } else sys().forgetWifi(c, ap.ssid);
      }}, {label: t.t('wifi_cancel')}]});
      return true;
    }
  };
  NG.settingsFragments['com.android.settings.wifi.SavedAccessPointsWifiSettings'] = 'wifi-saved';

  H.wifi_configure_settings = {
    hidden: ['connect_carrier_networks', 'wifi_cellular_data_fallback'],
    hide: (c, key) => key === 'saved_networks' && !saved(c).length,
    get(c, key) {
      const s = c.data.settings;
      if (key === 'notify_open_networks') return s.wifiNotify ?? false;
      if (key === 'wifi_assistant') return !!s.wifiAssistant;
      if (key === 'sleep_policy') return String(s.wifiSleepPolicy ?? 2);
      return undefined;
    },
    set(c, key, v) {
      const s = c.data.settings;
      if (key === 'notify_open_networks') { s.wifiNotify = v; return true; }
      if (key === 'wifi_assistant') { s.wifiAssistant = v; return true; }
      if (key === 'sleep_policy') { s.wifiSleepPolicy = +v; return true; }
      return false;
    },
    switch: ['wifi_assistant'],
    disabled: (c, key) => key === 'notify_open_networks' && !c.data.settings.wifi,
    selectable: (c, key) => key !== 'mac_address' && key !== 'current_ip_address',
    summary(c, key, n) {
      const t = T(), s = c.data.settings, connected = sys().wifiState(c) === 'connected';
      if (key === 'sleep_policy') { const i = n.entryValues.indexOf(String(s.wifiSleepPolicy ?? 2)); return NG.settingsArr(n.entries)[i] || ''; }
      // The simulator's own MAC in Huawei's ac:37:43 range.
      if (key === 'mac_address') return 'ac:37:43:6b:1e:58';
      if (key === 'current_ip_address') return connected ? '192.168.1.105' : t.t('status_unavailable');
      return undefined;
    },
    click(c, key) {
      if (key === 'saved_networks') { NG.settingsGo(c, 'wifi-saved', T().t('wifi_saved_access_points_titlebar')); return true; }
      return false;
    }
  };
  H.wifi_advanced_settings = {
    click(c, key) {
      const t = T();
      if (key === 'install_credentials') { c.toast(t.t('CertInstaller/no_cert_file_found')); return true; }
      if (key === 'wifi_direct') { NG.settingsGo(c, 'missing:com.android.settings.wifi.p2p.WifiP2pSettings', t.t('wifi_p2p_settings_title')); return true; }
      if (key === 'wps_push_button' || key === 'wps_pin_entry') {
        c.dialog({title: t.t(key === 'wps_push_button' ? 'wifi_menu_wps_pbc' : 'wifi_menu_wps_pin'), html: `<div class="ngwf-wps"><div class="ngwf-wpsmsg">${c.safe(key === 'wps_push_button' ? t.t('wifi_wps_onstart_pbc') : t.fmt('wifi_wps_onstart_pin', null, '18930675'))}</div><div class="ngst-progress static"><i></i><i></i></div></div>`, buttons: [{label: t.t('cancel')}]});
        return true;
      }
      return false;
    }
  };
})();
