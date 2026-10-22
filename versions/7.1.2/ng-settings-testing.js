/* Settings' testing menu (TestingSettings, opened by the Dialer's *#*#4636#*#*: the SECRET_CODE broadcast
   android_secret_code://4636 that TestingSettingsBroadcastReceiver takes), read from android-7.1.2_r1 Settings
   (kept in _aosp/aosp712/settings/testing):
   - Phone information (RadioInfo, radio_info.xml): IMEI, Phone Number, Current Network, Signal Strength
     ("-dBm dBm   asu asu"), Voice / Data Service, Voice / Data Network Type, Voice Call Status, Roaming, Set Preferred
     Network Type (mPreferredNetworkLabels), Run Ping Test (IPv4 / IPv6 / HTTP Client Test: "Pass" or the failure),
     Data Connection Real-Time Info, Message Waiting, Call Redirect, Data Sent / Received, PPP resets, Cellular Radio
     Power and the IMS switches, SMSC with Refresh / Update, Toggle DNS Check, Cell Info Refresh Rate
     (mCellInfoRefreshRateLabels) and the cell information; the overflow (Select Radio Band, the SIM's ADN / FDN /
     SDN, IMS registration status, Disable data connection).
   - Usage statistics (UsageStatsActivity, usage_stats.xml): Sort by Usage time / Last time used / App name and the
     apps the phone has used (the launcher's recent apps, their last use and time).
   - Wi-Fi information (testing_wifi_settings): Wi-Fi API (WifiAPITest: disable / disconnect / enable, the
     configured networks and the connection info), Wi-Fi config (WifiConfigInfo's configured networks) and Wi-Fi
     status (WifiStatusTest: the state, supplicant state, RSSI, BSSID, SSID, addresses, link speed, the scan results,
     ping and HTTP tests). The radio's and Wi-Fi's own debug texts are English in the image too. */
(() => {
  'use strict';
  const T = () => NG.text('testing'), t = k => T().t(k);
  const sys = () => NG.system;
  const S = c => c.ui.testing ||= {pref: 9, rate: 0, ping: null, wping: null, sort: 0, power: true, volte: true, vt: false, wfc: true, dns: false};
  Object.assign(NG.defaults.settings, {testingSmsc: '+36309888000'});
  NG.defaults.usageStats = {};
  // UsageStatsManager stores real foreground time, not a fabricated duration inferred from launcher predictions.
  let foreground = '', sampledAt = Date.now(), persistedAt = 0;
  NG.register('testing-service', {app: false, tick(c) {
    const now = Date.now(), id = !document.hidden && !c.ui.sleeping && !c.ui.power && NG.appsData?.[c.ui.view] ? c.ui.view : '';
    const stats = c.data.usageStats ||= {};
    if (foreground && stats[foreground]) stats[foreground].time += Math.min(2000, Math.max(0, now - sampledAt));
    if (id) { const a = stats[id] ||= {time: 0, last: now}; a.last = now; }
    if (id !== foreground || now - persistedAt > 10000) { c.save(); persistedAt = now; }
    foreground = id; sampledAt = now;
  }});
  const PREFERRED = ['WCDMA preferred', 'GSM only', 'WCDMA only', 'GSM auto (PRL)', 'CDMA auto (PRL)', 'CDMA only', 'EvDo only', 'Global auto (PRL)', 'LTE/CDMA auto (PRL)', 'LTE/UMTS auto (PRL)', 'LTE/CDMA/UMTS auto (PRL)', 'LTE only', 'LTE/WCDMA', 'TD-SCDMA only', 'TD-SCDMA/WCDMA', 'LTE/TD-SCDMA', 'TD-SCDMA/GSM', 'TD-SCDMA/UMTS', 'LTE/TD-SCDMA/WCDMA', 'LTE/TD-SCDMA/UMTS', 'TD-SCDMA/CDMA/UMTS', 'Global/TD-SCDMA', 'Unknown'];
  const RATES = ['Disabled', 'Immediate', 'Min 5s', 'Min 10s', 'Min 60s'];
  const esc = (c, s) => c.safe(String(s));
  const row = (c, label, value) => `<div class="ngts-row"><span>${esc(c, t(label))}</span><b>${esc(c, value)}</b></div>`;
  const sel = (c, key, list, cur) => `<select class="ngts-sel" data-k="${key}">${list.map((x, i) => `<option value="${i}"${i === cur ? ' selected' : ''}>${esc(c, x)}</option>`).join('')}</select>`;
  const sw = (c, key, label, on) => `<button type="button" class="ngts-switch" data-action="ngts-toggle" data-k="${key}"><span>${esc(c, t(label))}</span>${NG.settingsSwitch(on)}</button>`;
  const button = (c, label, action, disabled = false) => `<button type="button" class="ngts-btn" data-action="${action}"${disabled ? ' disabled' : ''}>${esc(c, t(label))}</button>`;
  const online = c => sys().wifiState(c) === 'connected' || !!sys().mobile(c).data;

  function radioInfo(c) {
    const s = S(c), m = sys().mobile(c), d = c.data.settings, ids = NG.deviceIds || {};
    const svc = !m.service ? 'radioInfo_service_off' : 'radioInfo_service_in', data = m.data ? 'radioInfo_data_connected' : 'radioInfo_data_disconnected';
    const call = NG.phone?.inCall?.(c) ? 'radioInfo_phone_offhook' : 'radioInfo_phone_idle', u = sys().dataUsage?.(c);
    const tx = Math.round((u?.usage || 0) * .12), rx = Math.round(u?.usage || 0);
    const ping = s.ping || {v4: t('radioInfo_unknown'), v6: t('radioInfo_unknown'), http: t('radioInfo_unknown')};
    return `<div class="ngts">${row(c, 'radio_info_imei_label', ids.imei || t('radioInfo_unknown'))}${row(c, 'radio_info_phone_number_label', t('radioInfo_unknown'))}
      ${row(c, 'radio_info_current_network_label', m.service ? NG.text('shade').t('carrier') : '')}${row(c, 'radio_info_signal_strength_label', m.service ? `-85 ${t('radioInfo_display_dbm')}   55 ${t('radioInfo_display_asu')}` : '')}
      ${row(c, 'radio_info_gsm_service_label', t(svc))}${row(c, 'radio_info_gprs_service_label', t(data))}${row(c, 'radio_info_voice_network_type_label', m.service ? 'LTE' : 'Unknown')}${row(c, 'radio_info_data_network_type_label', m.service ? 'LTE' : 'Unknown')}
      ${row(c, 'radio_info_call_status_label', t(call))}${row(c, 'radio_info_roaming_label', t(d.roaming ? 'radioInfo_roaming_in' : 'radioInfo_roaming_not'))}
      <div class="ngts-row"><span>${esc(c, t('radio_info_set_perferred_label'))}</span></div>${sel(c, 'pref', PREFERRED, s.pref)}
      ${button(c, 'ping_test_label', 'ngts-ping')}${row(c, 'radio_info_ping_hostname_v4', ping.v4)}${row(c, 'radio_info_ping_hostname_v6', ping.v6)}${row(c, 'radio_info_http_client_test', ping.http)}
      ${row(c, 'radio_info_dcrtinfo_label', '')}${row(c, 'radio_info_message_waiting_label', 'false')}${row(c, 'radio_info_call_redirect_label', 'false')}
      ${row(c, 'radio_info_ppp_sent_label', `${Math.round(tx / 1400)} ${t('radioInfo_display_packets')}, ${tx} ${t('radioInfo_display_bytes')}`)}${row(c, 'radio_info_ppp_received_label', `${Math.round(rx / 1400)} ${t('radioInfo_display_packets')}, ${rx} ${t('radioInfo_display_bytes')}`)}${row(c, 'radio_info_ppp_resets_label', '0')}
      ${sw(c, 'power', 'radio_info_radio_power', sys().live.radioPower !== false && !d.airplane)}${sw(c, 'volte', 'volte_provisioned_switch_string', s.volte)}${sw(c, 'vt', 'vt_provisioned_switch_string', s.vt)}${sw(c, 'wfc', 'wfc_provisioned_switch_string', s.wfc)}
      <div class="ngts-row"><span>${esc(c, t('radio_info_smsc_label'))}</span></div><input class="ngts-input" value="${esc(c, s.smsc ?? d.testingSmsc)}" data-k="smsc"><div class="ngts-btns">${button(c, 'radio_info_smsc_update_label', 'ngts-smsc-update')}${button(c, 'radio_info_smsc_refresh_label', 'ngts-smsc-refresh')}</div>
      ${button(c, 'radio_info_toggle_dns_check_label', 'ngts-dns')}<div class="ngts-row"><b>${s.dns ? '0.0.0.0 allowed' : '0.0.0.0 not allowed'}</b></div>${button(c, 'oem_radio_info_label', 'ngts-oem', true)}
      <div class="ngts-row"><span>${esc(c, t('radio_info_cell_info_refresh_rate'))}</span></div>${sel(c, 'rate', RATES, s.rate)}
      ${row(c, 'radio_info_signal_location_label', m.service ? `${t('radioInfo_lac')} = 10101   ${t('radioInfo_cid')} = 26641153` : 'unknown')}${row(c, 'radio_info_neighboring_location_label', m.service ? 'unknown' : '')}
      ${row(c, 'radio_info_cellinfo_label', m.service && s.rate ? 'LTE:{mcc=216 mnc=30 ci=26641153 pci=287 tac=10101 earfcn=6300} RSRP=-85 RSRQ=-9' : '')}
      ${button(c, 'carrier_provisioning', 'ngts-noop')}${button(c, 'trigger_carrier_provisioning', 'ngts-noop')}</div>`;
  }
  // UsageStatsActivity: the apps used, sorted by usage time, last time used or name.
  function usageStats(c) {
    const s = S(c), cutoff = Date.now() - 5 * 86400000;
    const apps = Object.entries(c.data.usageStats || {}).filter(([id, a]) => NG.appsData?.[id] && a.last >= cutoff).map(([id, a]) => ({...a, id, label: NG.appLabel(c, id)}));
    apps.sort(s.sort === 0 ? (a, b) => b.time - a.time : s.sort === 1 ? (a, b) => b.last - a.last : (a, b) => a.label.localeCompare(b.label));
    const time = ms => new Date(ms).toDateString() === new Date().toDateString() ? new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(ms) : new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(ms);
    const dur = ms => { const sec = Math.floor(ms / 1000); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; };
    return `<div class="ngts ngts-usage"><div class="ngts-sort"><span>${esc(c, t('display_order_text'))}</span>${sel(c, 'sort', T().t('usage_stats_display_order_types'), s.sort)}</div>
      <div class="ngts-uhead"><b>${esc(c, t('app_name_label'))}</b><b>${esc(c, t('last_time_used_label'))}</b><b>${esc(c, t('usage_time_label'))}</b></div>
      ${apps.map(a => `<div class="ngts-urow"><span>${esc(c, a.label)}</span><span>${esc(c, time(a.last))}</span><span>${esc(c, dur(a.time))}</span></div>`).join('')}</div>`;
  }
  // Network IDs survive sorting the active AP to the front of Settings' list.
  const saved = c => sys().accessPoints(c).filter(a => a.saved).sort((a, b) => a.ssid.localeCompare(b.ssid));
  const connInfo = c => { const a = sys().accessPoints(c).find(x => x.active); return a ? `SSID: "${a.ssid}", BSSID: 02:00:00:00:00:00, MAC: ${NG.deviceIds?.wifiMac || ''}, Supplicant state: COMPLETED, RSSI: ${-40 - (4 - a.level) * 12}, Link speed: ${a.speed}Mbps, Frequency: ${a.freq}MHz, Net ID: ${saved(c).findIndex(n => n.ssid === a.ssid)}, Metered hint: false` : 'SSID: <unknown ssid>, BSSID: <none>, MAC: 02:00:00:00:00:00, Supplicant state: DISCONNECTED, RSSI: -127, Link speed: -1Mbps, Frequency: -1MHz, Net ID: -1, Metered hint: false'; };
  const configs = c => saved(c).map((a, i) => `ID: ${i} SSID: "${a.ssid}" PROVIDER-NAME: null BSSID: null FQDN: null PRIO: 0 HIDDEN: false\n NetworkSelectionStatus NETWORK_SELECTION_ENABLED\n KeyMgmt: ${a.secure ? 'WPA_PSK' : 'NONE'} Protocols: WPA RSN`).join('\n\n');
  function wifiConfig(c) { return `<div class="ngts"><div class="ngts-row"><span>${esc(c, t('config_list_label'))}</span></div><pre class="ngts-pre">${esc(c, c.data.settings.wifi ? configs(c) : t('wifi_state_disabled'))}</pre></div>`; }
  function wifiStatus(c) {
    const s = S(c), st = sys().wifiState(c), a = sys().accessPoints(c).find(x => x.active), on = !!c.data.settings.wifi;
    const ping = s.wping || {v4: t('radioInfo_unknown'), http: t('radioInfo_unknown')};
    const scan = on ? sys().accessPoints(c).map(x => `"${x.ssid}" `).join('') : '';
    return `<div class="ngts">${button(c, 'wifi_update', 'ngts-refresh')}${row(c, 'wifi_state_label', t(on ? 'wifi_state_enabled' : 'wifi_state_disabled'))}${row(c, 'network_state_label', st === 'connected' ? 'CONNECTED/CONNECTED' : 'DISCONNECTED/DISCONNECTED')}
      ${row(c, 'supplicant_state_label', st === 'connected' ? 'COMPLETED' : on ? 'SCANNING' : 'DISCONNECTED')}${row(c, 'rssi_label', a ? -40 - (4 - a.level) * 12 : -127)}${row(c, 'bssid_label', a ? '02:00:00:00:00:00' : '')}${row(c, 'ssid_label', a ? `"${a.ssid}"` : '<unknown ssid>')}
      ${row(c, 'hidden_ssid_label', 'false')}${row(c, 'ipaddr_label', a ? NG.deviceIds?.ip || '' : '0.0.0.0')}${row(c, 'macaddr_label', NG.deviceIds?.wifiMac || '')}${row(c, 'networkid_label', a ? saved(c).findIndex(n => n.ssid === a.ssid) : -1)}${row(c, 'link_speed_label', a ? `${a.speed} Mbps` : '-1 Mbps')}
      ${row(c, 'scan_list_label', scan)}${button(c, 'ping_test_label', 'ngts-wping')}${row(c, 'radio_info_ping_hostname_v4', ping.v4)}${row(c, 'radio_info_http_client_test', ping.http)}</div>`;
  }
  // WifiAPITest: the preference list; disable / enable ask for a network ID (the "Input" dialog).
  function wifiApi(c) {
    const r = k => NG.settingsRow(c, {title: t(k), action: 'ngts-api', data: ` data-k="${k}"`});
    return `<div class="ngst-list">${['disableNetwork', 'disconnect', 'enableNetwork', 'getConfiguredNetworks', 'getConnectionInfo'].map(r).join('')}</div>`;
  }
  const screens = {'radio-info': [radioInfo, 'testing_phone_info'], 'usage-stats': [usageStats, 'testing_usage_stats'], 'wifi-config-info': [wifiConfig, 'wifi_config_info'], 'wifi-status-test': [wifiStatus, 'wifi_status_test'], 'wifi-api-test': [wifiApi, 'wifi_api_test']};
  for (const [k, [render, title]] of Object.entries(screens)) NG.settingsScreens[k] = {title: () => t(title), render: c => render(c),
    mount(c, root) { for (const el of root.querySelectorAll('.ngts-sel')) el.addEventListener('change', () => { S(c)[el.dataset.k] = +el.value; c.transition('none'); c.render(); }); const i = root.querySelector('.ngts-input'); if (i) i.addEventListener('input', () => { S(c).smsc = i.value; }); },
    action(c, name, el) { return action(c, name, el); }};
  Object.assign(NG.settingsFragments, {'com.android.settings.RadioInfo': 'radio-info', 'com.android.settings.UsageStatsActivity': 'usage-stats', 'com.android.settings.wifi.WifiConfigInfo': 'wifi-config-info', 'com.android.settings.wifi.WifiStatusTest': 'wifi-status-test', 'com.android.settings.Settings$WifiAPITestActivity': 'wifi-api-test'});
  Object.assign(NG.settingsXmlFragments, {'com.android.settings.Settings$WifiInfoActivity': 'testing_wifi_settings', 'com.android.settings.TestingSettings': 'testing_settings'});
  function ping(c, key) {
    const s = S(c), ok = online(c), fail = 'Fail: Host unreachable';
    s[key] = {v4: '…', v6: '…', http: '…'}; c.render();
    setTimeout(() => { s[key] = ok ? {v4: 'Pass', v6: 'Fail: Host unreachable', http: 'Pass'} : {v4: fail, v6: fail, http: 'Fail: IOException'}; if (c.ui.view === 'settings') { c.transition('none'); c.render(); } }, 1200);
  }
  function action(c, name, el) {
    const s = S(c);
    switch (name) {
      case 'ngts-ping': ping(c, 'ping'); return true;
      case 'ngts-wping': ping(c, 'wping'); return true;
      case 'ngts-refresh': c.transition('none'); c.render(); return true;
      case 'ngts-toggle': if (el.dataset.k === 'power') { sys().live.radioPower = !(sys().live.radioPower !== false && !c.data.settings.airplane); sys().changed(c); } else s[el.dataset.k] = !s[el.dataset.k]; c.transition('none'); c.render(); return true;
      case 'ngts-dns': s.dns = !s.dns; c.transition('none'); c.render(); return true;
      case 'ngts-smsc-update': c.data.settings.testingSmsc = s.smsc ?? c.data.settings.testingSmsc; c.save(); return true;
      case 'ngts-smsc-refresh': s.smsc = c.data.settings.testingSmsc; c.transition('none'); c.render(); return true;
      // These send broadcasts to an optional carrier provisioning receiver; this image has no receiver.
      case 'ngts-oem': case 'ngts-noop': return true;
      case 'ng-menu': {
        const keys = ['radio_info_band_mode_label', 'radioInfo_menu_viewADN', 'radioInfo_menu_viewFDN', 'radioInfo_menu_viewSDN', 'radioInfo_menu_getIMS', `radio_info_data_connection_${sys().mobile(c).data ? 'disable' : 'enable'}`];
        c.menu(keys.map((k, i) => ({label: t(k), action: c => {
          if (i === 0) { bandDialog(c); return; }
          if (i >= 1 && i <= 3) { NG.settingsGo(c, `sim-test:${i}`, t(k)); return; }
          if (i === 4) { const available = key => t(key ? 'radio_info_ims_feature_status_available' : 'radio_info_ims_feature_status_unavailable'), service = sys().mobile(c).service;
            c.dialog({title: t('radio_info_ims_reg_status_title'), message: T().fmt('radio_info_ims_reg_status', null, t(service ? 'radio_info_ims_reg_status_registered' : 'radio_info_ims_reg_status_not_registered'), available(service && s.volte), available(sys().wifiState(c) === 'connected' && s.wfc), available(service && s.vt), available(service))}); return; }
          sys().setMobileData(c, !sys().mobile(c).data);
        }})), el); return true;
      }
      case 'ngts-api': {
        const k = el.dataset.k;
        if (k === 'disconnect') { c.data.settings.wifiSsid = ''; c.save(); sys().changed(c); return true; }
        if (k === 'getConfiguredNetworks' || k === 'getConnectionInfo') { c.dialog({message: k === 'getConfiguredNetworks' ? configs(c) || '[]' : connInfo(c), buttons: [{label: t('framework/ok')}]}); return true; }
        let networkId = ''; c.dialog({title: 'Input', message: 'Enter Network ID', html: '<div class="ngst-edit"><input class="ngst-input" inputmode="numeric"></div>', mount: (c, win) => win.querySelector('input').addEventListener('input', e => { networkId = e.target.value; }), buttons: [{label: 'Cancel'}, {label: 'Ok', action: c => {
          const v = networkId.trim();
          if (!/^\d+$/.test(v) || !c.data.settings.wifi) return;
          const a = saved(c)[+v]; if (!a) return;
          if (k === 'disableNetwork') { s.disabledNetworks = [...new Set([...(s.disabledNetworks || []), a.ssid])]; if (c.data.settings.wifiSsid === a.ssid) c.data.settings.wifiSsid = ''; c.save(); sys().changed(c); }
          else { s.disabledNetworks = (s.disabledNetworks || []).filter(n => n !== a.ssid); if (sys().wifiState(c) !== 'connected') sys().connectWifi(c, a.ssid); }
        }}]});
        return true;
      }
    }
    return false;
  }
  NG.settingsScreens['radio-info'].actions = c => NG.menu.button(c);
  function bandDialog(c) {
    // BandMode.BAND_NAMES; the simulated RIL supports the GSM regional modes (automatic always comes first).
    const bands = ['Automatic', 'Europe', 'United States', 'Japan', 'Australia', 'Australia 2'];
    c.dialog({title: t('band_mode_title'), items: bands.map(label => ({html: esc(c, label)})), onItem: i => {
      S(c).band = i; c.dialog({message: `${t('band_mode_set')} [${bands[i]}] ${t('band_mode_succeeded')}`, buttons: [{label: t('framework/ok')}]});
    }});
  }
  // The shared demo SIM contains no ADN, FDN or SDN records. These lists are separate from Contacts' provider.
  NG.settingsScreens['sim-test'] = {title: c => +c.ui.settings?.stack.at(-1)?.screen.split(':')[1] === 2 ? t('TeleService/fdnListLabel') : t('TeleService/simContacts_title'), render: c => `<div class="ngts-empty">${esc(c, t(c.data.settings.airplane ? 'TeleService/simContacts_airplaneMode' : 'TeleService/simContacts_empty'))}</div>`};
  // The Dialer's SpecialCharSequenceMgr (handleChars after each digit): *#06# the IMEI dialog, *#07# the regulatory
  // labels (SHOW_REGULATORY_INFO), *#*#<code>#*#* the SECRET_CODE broadcast (4636: this menu).
  NG.dialerSpecialChars = (c, digits) => {
    if (digits === '*#06#') { c.dialog({title: t('GoogleDialer/imei'), items: [{html: esc(c, NG.deviceIds?.imei || '')}], buttons: [{label: t('framework/ok')}], cancelable: false}); return true; }
    if (digits === '*#07#') { NG.regulatoryDialog?.(c); return true; }
    if (digits.length > 8 && digits.startsWith('*#*#') && digits.endsWith('#*#*')) { if (digits.slice(4, -4) === '4636') { c.open('settings', 'xml:testing_settings'); } return true; }
    return false;
  };
})();
