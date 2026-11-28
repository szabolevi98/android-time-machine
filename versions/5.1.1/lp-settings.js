/* TODO */
'use strict';
LP.define('settings', ({
  applyMagnification, apps, clearAppData, clone, deviceDate, dreams, HOLD_NAMES, i18n, lockControls, nextAlarmTime,
  openApp, overlayRoot, render, renderOverlay, resetSimulator, safe, save, screen, storeContext, toast, ui,
  viewport, wifiNetworks
}, lp) => {
  /* Settings 5.1 toolbar (Widget.Material.Light.ActionBar.Solid on colorPrimary #263238): the up arrow
     (ic_ab_back_material) on sub-screens, the 20 sp title 16 dp in (72 dp after the arrow). */
  const actionbar = (title, right = '') => ui.view === 'settings'
    ? `<div class="actionbar lp-toolbar">${ui.sub ? `<button class="up" data-action="back" aria-label="${safe(i18n.t('Navigate up'))}"><img src="assets/lp-fw-ic_ab_back_material.svg" alt=""></button>` : ''}<h2>${safe(title)}</h2>${right}</div>`
    : `<div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(title)}</h2>${right}</div>`;
  // Material controls in place of the Holo checkbox and radio images, for every Settings screen and dialog.
  const materialControls = html => html.replace(/class="holo-switch/g, 'class="lp-mswitch').replace(/<img class="holo-checkbox" src="assets\/btn_check_(on|off)_holo_dark\.png" alt="">/g, (_, on) => `<span class="lp-check${on === 'on' ? ' on' : ''}" aria-hidden="true"></span>`).replace(/<img class="holo-radio" src="assets\/btn_radio_(on|off)_holo_dark\.png" alt="">/g, (_, on) => `<span class="lp-radio${on === 'on' ? ' on' : ''}" aria-hidden="true"></span>`);
  const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
  const SESSION_START = Date.now();
  const appView = (title, inner, theme = '', right = '') => ui.view === 'settings'
    ? materialControls(`<div class="app-view settings-app lp-settings ${!ui.sub ? 'settings-main' : ''}">${actionbar(title, right)}${content(inner, `settings-light ${theme}`)}</div>`)
    : `<div class="app-view">${actionbar(title, right)}${content(inner, theme)}</div>`;
  /* SwitchBar (Settings 5.1): the "On" / "Off" bar under the toolbar of Wi-Fi, Bluetooth and the other master
     switches, #37474F with the white 20 sp label and a Material switch. */
  const switchBar = (key, on = !!lp.data.settings[key]) => `<div class="lp-switchbar"><span>${safe(i18n.t(on ? 'On' : 'Off'))}</span>${connectivitySwitch(key, i18n.t(on ? 'On' : 'Off'))}</div>`;
  const overflowButton = id => `<button class="lp-ab-overflow" data-action="lp-settings-menu" data-id="${id}" aria-label="${safe(i18n.t('More options'))}"><img src="assets/lp-fw-ic_menu_moreoverflow_material.svg" alt=""></button>`;
  const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development','nfc-payment','print'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
  const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
  const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
  const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${lp.data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${lp.data.settings[key]}"><span class="switch-label" aria-hidden="true">${lp.data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
  const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
  const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
  const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${lp.data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${lp.data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
  const label = text => `<div class="section-label">${safe(text)}</div>`;
  const LOCATION_MODES = {high: ['High accuracy', 'Use GPS, Wi‑Fi, and mobile networks to determine location'], battery: ['Battery saving', 'Use Wi‑Fi and mobile networks to determine location'], device: ['Device only', 'Use GPS to determine your location']};
  const locationMode = () => lp.data.settings.gps && lp.data.settings.networkLocation ? 'high' : lp.data.settings.gps ? 'device' : 'battery';
  // Plain 4.3 preference rows (no icon or chevron); rows without their own screen explain that in a toast.
  // Accessibility texts from the image's Settings (stock-strings.js).
  const A11Y = key => { const row = window.StockStrings?.a11y?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); };
  const prefRow = (title, summary, action = 'dev-info', id = '') => `<button class="settings-row wireless-row" data-action="${action}" data-id="${safe(id || title)}"><span class="row-copy">${safe(i18n.t(title))}${summary ? `<small>${safe(i18n.t(summary))}</small>` : ''}</span></button>`;
  const carrierName = () => lp.data.settings.airplane ? i18n.t('No service.') : safe(lp.data.settings.networkOperator||'Telekom');
  function renderDaydreamSettings() {
    const on = !!lp.data.settings.daydream, current = lp.data.settings.daydreamType || 'clock', when = lp.data.settings.daydreamWhen || 'charging';
    const whenLabel = {charging: 'While charging', docked: 'While docked', either: 'Either'}[when];
    const list = dreams;
    return appView('Daydream', `${toggleRow('Daydream', on ? whenLabel : 'Off', 'daydream')}${on ? `${list.map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}${label('')}${row('Start now', '', 'dream-start', '')}${row('When to daydream', i18n.t(whenLabel), 'dream-when', '')}` : `<div class="detail-pad"><p>${safe(i18n.t('To control what happens when the phone is docked and/or sleeping, turn Daydream on.'))}</p></div>`}`);
  }
  // Advanced Wi-Fi's Install certificates (*-certinstall.js) and its dialogs.
  const certContext = () => ({ui, data: lp.data, language: i18n.language, root: overlayRoot, save, toast: message => toast(message),
    open: () => { ui.overlay = 'cert-install'; renderOverlay(); overlayRoot.querySelector('[data-cert-name]')?.focus(); }, close: () => { ui.overlay = ''; renderOverlay(); },
    lockSettings: () => { ui.sub = 'security'; render(); }});
  const devContext = () => ({data: lp.data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});
  const procStatsContext = () => ({data: lp.data, ui, save, render, renderOverlay, toast: message => toast(message), language: i18n.language, locale: i18n.locale(), appIcon: id => `<img src="assets/${id}.png" alt="">`});
  const langContext = () => ({data: lp.data, ui, root: viewport, language: i18n.language, locale: i18n.locale(), languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[i18n.language],
    save, render, renderOverlay, toast: message => toast(i18n.t(message)),
    openVoice: () => { openApp('google-search'); ui.sub = 'settings'; ui.lsStack = []; ui.lsPage = 'voice'; ui.lsDialog = null; ui.voiceFromSettings = true; render(); }});
  const printContext = () => ({ui, data: lp.data, root: overlayRoot, language: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), save, renderOverlay, toast: message => toast(i18n.t(message)), mime: name => LPDownloads.mime(name), saved: () => { if (ui.view === 'downloads') render(); }});
  const allWifiNetworks = () => [...wifiNetworks, ...(lp.data.savedWifiNetworks || [])];
  /* WpsDialog: "Starting WPS…", then the push-button or PIN instructions with ic_wps; the timeout bar advances once a
     second up to WPS_TIMEOUT_S (120 s), after which the failure message and an OK button remain. */
  function wpsDialog() {
    const wps = ui.wps || {mode: 'pbc', start: Date.now(), pin: '30521874'}, elapsed = Math.floor((Date.now() - wps.start) / 1000), done = elapsed >= 120;
    const text = done ? i18n.t('WPS failed. Please try again in a few minutes.') : elapsed < 1 ? i18n.t('Starting WPS…') : wps.mode === 'pin' ? AndroidStrings.format(i18n.t('Enter pin %1$s on your Wi-Fi router. The setup can take up to two minutes to complete.'), wps.pin) : i18n.t('Press the Wi-Fi Protected Setup button on your router. It may be called "WPS" or contain this symbol:');
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert jb-wps" role="dialog" aria-label="${safe(i18n.t('Wi-Fi Protected Setup'))}" data-no-translate><h3 class="ga-title">${safe(i18n.t('Wi-Fi Protected Setup'))}</h3><div class="jb-wps-body"><p>${safe(text)}</p><img src="assets/jb-ic_wps.png" alt=""><span class="jb-progress-h" role="progressbar" aria-valuemin="0" aria-valuemax="120" aria-valuenow="${Math.min(120, elapsed)}"><i style="width:${Math.min(120, elapsed) / 120 * 100}%"></i></span><button type="button" class="jb-holo-button" data-action="close-overlay">${safe(i18n.t(done ? 'OK' : 'Cancel'))}</button></div></div>`;
  }
  // WifiP2pSettings: this device, then PEER DEVICES; Search for devices runs while the page is open.
  function renderWifiDirect() {
    const searching = lp.data.settings.wifi && ui.p2pSearchUntil > Date.now();
    const right = `<button class="jb-ab-text" data-action="p2p-search" ${lp.data.settings.wifi && !searching ? '' : 'disabled'}>${safe(i18n.t(searching ? 'Searching…' : 'Search for devices'))}</button><button class="connectivity-overflow" data-action="p2p-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Wi-Fi Direct', `<div class="connectivity-page">${lp.data.settings.wifi ? `<div class="settings-row network-row jb-p2p-device" aria-disabled="true"><span class="row-copy" data-no-translate>${safe(lp.data.settings.p2pName || 'Android_4f3a')}</span></div>${label('PEER DEVICES')}` : ''}</div>`, '', right);
  }
  function startP2pSearch() { ui.p2pSearchUntil = Date.now() + 12000; clearTimeout(ui.p2pTimer); ui.p2pTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-direct') render(); }, 12100); }
  /* WifiDisplaySettings: the feature is DISABLED while Wi-Fi is off; when ON it scans, listing AVAILABLE DEVICES with a
     progress spinner and, once the scan ends without results, "No nearby wireless displays were found." */
  function startWfdScan() { ui.wfdScanUntil = Date.now() + 10000; clearTimeout(ui.wfdTimer); ui.wfdTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-display') render(); }, 10100); }
  function renderWifiDisplay() {
    const on = !!lp.data.settings.wifiDisplay && !!lp.data.settings.wifi;
    const menu = `<button class="jb-ab-action" data-action="kk-cast-menu" aria-label="${safe(i18n.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    return appView('Cast screen', `<div class="connectivity-page"><p class="wfd-empty">${safe(i18n.t('No nearby devices were found.'))}</p></div>`, '', menu);
  }
  /* WifiSettings 5.1: the switch bar, then the access points (connected first, then by signal) with the teal
     wifi_signal icons (lock overlay when secured); off, the ic_wifi_emptystate hint. Overflow: Add network, Saved
     networks, Refresh, Advanced. */
  function renderWifiSettings() {
    const on = !!lp.data.settings.wifi && !lp.data.settings.airplane;
    const list = allWifiNetworks().sort((a,b) => Number(b.name === lp.data.settings.wifiNetwork) - Number(a.name === lp.data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale()));
    const level = n => Math.max(2, Math.min(4, n.strength || 4));
    const body = on ? list.map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${lp.data.settings.wifiNetwork === network.name ? i18n.t('Connected') : (lp.data.savedWifiNetworks || []).some(item => item.name === network.name) ? i18n.t('Saved') : network.security === 'Open' ? '' : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/lps-ic_wifi_${network.security === 'Open' ? '' : 'lock_'}signal_${level(network)}_teal.png" alt=""></span></button>`).join('')
      : `<div class="lp-empty-state"><img src="assets/lps-ic_wifi_emptystate.png" alt=""><p>${safe(i18n.t('To see available networks, turn Wi‑Fi on.'))}</p></div>`;
    return appView('Wi‑Fi', `${switchBar('wifi', on)}<div class="connectivity-page">${body}</div>`, '', overflowButton('wifi'));
  }
  /* BluetoothSettings 5.1: the switch bar, Paired devices and Available devices, and the footer saying the phone is
     visible while the screen is open; off, the explanation. Overflow: Refresh, Rename this device, Show received files. */
  function renderBluetoothSettings() {
    const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
    const on = !!lp.data.settings.bluetooth, name = lp.data.settings.bluetoothName || 'Nexus 6';
    if (on && !ui.bluetoothScanned) { ui.bluetoothScanned = true; }
    const body = on ? `${lp.data.settings.pairedDevice ? `${label(i18n.t('Paired devices'))}${deviceRow(lp.data.settings.pairedDevice, true)}` : ''}${label(i18n.t('Available devices'))}${['Wireless Headset','Car Audio'].filter(device => device !== lp.data.settings.pairedDevice).map(device => deviceRow(device, false)).join('')}<p class="lp-bt-footer">${safe(AndroidStrings.format(i18n.t('%1$s is visible to nearby devices while Bluetooth settings is open.'), name))}</p>`
      : `<p class="lp-bt-off">${safe(i18n.t('When Bluetooth is turned on, your device can communicate with other nearby Bluetooth devices.'))}</p>`;
    return appView('Bluetooth', `${switchBar('bluetooth', on)}<div class="connectivity-page">${body}</div>`, '', overflowButton('bluetooth'));
  }
  function renderSettings() {
    const s = ui.sub;
    if(s==='lock-setup')return lockControls.renderSetup();
    // Security's sub-pages (lp-security.js), then the other Lollipop pages.
    // Cell Broadcasts' list and settings (cell-broadcast.js).
    const cb=CellBroadcast.page(s,{data: lp.data,t:key=>i18n.t(key)});
    if(cb)return appView(cb.title,cb.body,'sx-page cb-page',cb.right||'');
    const page=LPSecurity.page(s,{data: lp.data,ui,t:key=>i18n.t(key)})||LPSettingsPages.render(s,{data: lp.data,t:key=>i18n.t(key),locale:i18n.locale()});
    if(page)return appView(page.title,(page.switchKey?switchBar(page.switchKey,page.switchOn):'')+page.body,'','');
    const system=ICSSystemSettings.render(lp.data,ui,key=>i18n.t(key),i18n.locale());
    if(system)return appView(system.title,system.body,'sx-page',system.right);
    const detail=ICSSettingsDetail.render(lp.data,ui,apps,key=>i18n.t(key));
    if(detail)return appView(detail.title,detail.body,'sd-page');
    if (s === 'wifi') return renderWifiSettings();
    if (s === 'wifi-display') { if (lp.data.settings.wifiDisplay && lp.data.settings.wifi && !ui.wfdScanUntil) startWfdScan(); return renderWifiDisplay(); }
    if (s === 'wifi-direct') { if (!ui.p2pSearchUntil) startP2pSearch(); return renderWifiDirect(); }
    if (s === 'bluetooth') return renderBluetoothSettings();
    /* WallpaperTypeSettings: "Choose wallpaper from" lists every ACTION_SET_WALLPAPER activity with its label and icon. On
       LMY48Y those are LivePicker's LiveWallpaperActivity, Photos' SetWallpaperActivityAlias ("Wallpaper", the app
       icon) and the Google Now Launcher's GelWallpaperPickerActivity ("Wallpapers", ic_launcher_wallpaper). */
    if (s === 'wallpaper') {
      const sources = [['photos-set-wallpaper', 'Wallpaper', 'photos.png'], ['open-live-wallpapers', 'Live Wallpapers', 'lp-lwp-ic_launcher_live_wallpaper.png'], ['open-wallpapers', 'Wallpapers', 'lp-gel-ic_launcher_wallpaper.png']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1])));
      return appView('Choose wallpaper from', sources.map(([action, label, icon]) => `<button class="settings-row kk-wallpaper-type" data-action="${action}"><img class="kk-wallpaper-type-icon" src="assets/${icon}" alt=""><span class="row-copy">${safe(i18n.t(label))}</span></button>`).join(''));
    }
    /* About phone's sub-screens as LMY48Y's Settings builds them. device_info_status.xml with deviceinfo.Status
       (WiMAX removed): Battery status, Battery level, SIM status, IMEI information, IP address, Wi‑Fi MAC address,
       Bluetooth address, Serial number, Up time; device_info_sim_status.xml with SimStatus (Network, Signal strength,
       Cellular network type, Service state, Roaming, Cellular network state, My phone number) and device_info_phone_status.xml
       with ImeiInformation for a GSM phone (IMEI, IMEI SV). The values are the demo device's. Legal information is
       device_info_settings.xml's container after Utils.updatePreferenceToSpecificActivityOrRemove: Copyright and
       System WebView License have no activity in the image and go, License and Terms take the titles of Settings'
       SettingsLicenseActivity ("Open source licenses") and GoogleServicesFramework's SettingsTosActivity ("Google legal"),
       Wallpapers keeps its attribution summary. */
    const info = (title, value) => `<div class="settings-row lp-info-row"><span class="row-copy">${safe(i18n.t(title))}<small>${safe(value)}</small></span></div>`;
    const na = i18n.t('Not available');
    if (s === 'about-status') {
      const up = Math.floor((Date.now() - SESSION_START) / 1000), pad = n => String(n).padStart(2, '0');
      return appView('Status', `${info('Battery status', i18n.t('Not charging'))}${info('Battery level', '78%')}${row('SIM status', '', 'settings-sub', 'about-sim', null)}${row('IMEI information', '', 'settings-sub', 'about-imei', null)}${info('IP address', lp.data.settings.wifi ? '192.168.1.107' : na)}${info('Wi‑Fi MAC address', '02:00:00:51:01:01')}${info('Bluetooth address', lp.data.settings.bluetooth ? '02:00:00:51:01:02' : na)}${info('Serial number', 'ZX1G42DEMO')}${info('Up time', `${Math.floor(up / 3600)}:${pad(Math.floor(up / 60) % 60)}:${pad(up % 60)}`)}`, 'about-settings');
    }
    if (s === 'about-sim') return appView('SIM status', `${info('Network', carrierName())}${info('Signal strength', lp.data.settings.airplane ? '0 dBm   0 asu' : '-97 dBm   43 asu')}${info('Cellular network type', lp.data.settings.airplane ? 'Unknown' : 'LTE')}${info('Service state', lp.data.settings.airplane ? 'Unknown' : i18n.t('In service'))}${info('Roaming', i18n.t('Not roaming'))}${info('Cellular network state', i18n.t(lp.data.settings.mobileData === false || lp.data.settings.airplane ? 'Disconnected' : 'Connected'))}${info('My phone number', 'Unknown')}`, 'about-settings');
    if (s === 'about-imei') return appView('IMEI information', `${info('IMEI', '355458061234567')}${info('IMEI SV', '13')}`, 'about-settings');
    if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', '', 'toast', 'This feature is not part of the simulator.', null)}${row('Google legal', '', 'toast', 'This feature is not part of the simulator.', null)}${info('Wallpapers', i18n.t('Satellite imagery providers:\n©2014 CNES / Astrium, DigitalGlobe, Bluesky'))}`, 'about-settings');
    if (s === 'easter') return `<div class="lp-platlogo" data-lp-platlogo aria-label="Android Lollipop"></div>`;
    if (s === 'lland') return `<div class="lp-lland" data-lp-lland role="application" aria-label="${safe(i18n.t('Android Lollipop'))}"></div>`;
    if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}<button class="settings-row wireless-row" data-action="kk-sms-app"><span class="row-copy">Default SMS app<small>Messaging</small></span></button>${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
    if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
    /* Accounts as LMY48Y's Settings shows them: AccountSettings (the Google account type with its icon, Add account with
       ic_menu_add_dark; menu/account_settings.xml's checkable "Auto-sync data" in the overflow), ManageAccountsSettings
       (the account with ic_sync_green_holo / _grey_holo and "Sync is ON" / "OFF") and AccountSyncSettings (title.xml:
       the provider icon, the account and "Google"; a SyncStateSwitchPreference per sync adapter of the image, from
       lp-sync-adapters.js, "Last synced %1$s"; Sync now and Remove account in the overflow). */
    const GOOGLE_ACCOUNT = 'nexus6.demo@gmail.com', autoSync = lp.data.settings.autoSync !== false;
    if (s === 'sync') return appView('Accounts', `${row('Google', '', 'settings-sub', 'sync-google', '<img class="lp-account-icon" src="assets/lp-gls-ic_google_selected.png" alt="">')}${row('Add account', '', 'toast', 'This feature is not part of the simulator.', '<img class="lp-account-icon" src="assets/lp-set-ic_menu_add_dark.png" alt="">')}`, '', overflowButton('accounts'));
    if (s === 'sync-google') return appView('Google', `${label('Accounts')}${row(GOOGLE_ACCOUNT, i18n.t(autoSync ? 'Sync is ON' : 'Sync is OFF'), 'settings-sub', 'sync-account', `<img class="lp-account-icon" src="assets/lp-set-ic_sync_${autoSync ? 'green' : 'grey'}_holo.png" alt="">`)}`);
    if (s === 'sync-account') {
      const when = new Date(SESSION_START).toLocaleString(i18n.locale(), {year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: '2-digit'});
      const off = lp.data.settings.syncOff || {};
      const rows = (window.LPSyncAdapters || []).map(row => ({key: row.en, name: AndroidStrings.pick(row, i18n.language, row.en)})).sort((a, b) => a.name.localeCompare(b.name, i18n.locale())).map(({key, name}) => {
        const on = autoSync && !off[key];
        return `<button class="settings-row lp-sync-row" data-action="lp-sync-toggle" data-id="${safe(key)}" role="switch" aria-checked="${on}"><span class="row-copy" data-no-translate>${safe(name)}<small>${safe(AndroidStrings.format(i18n.t('Last synced %1$s'), when))}</small></span><span class="lp-mswitch${on ? ' on' : ''}"></span></button>`;
      }).join('');
      return appView('Sync', `<div class="lp-sync-title"><img src="assets/lp-gls-ic_google_selected.png" alt=""><b data-no-translate>${GOOGLE_ACCOUNT}</b><small>Google</small></div>${rows}`, '', overflowButton('sync-account'));
    }
    if (s === 'location') {
      const on = lp.data.settings.locationAccess !== false, mode = locationMode();
      return appView('Location', `<div class="kk-location${on ? '' : ' jb-disabled-group'}"><button class="settings-row wireless-row" data-action="settings-sub" data-id="location-mode" ${on ? '' : 'disabled'}><span class="row-copy">Mode<small>${safe(i18n.t(on ? LOCATION_MODES[mode][0] : 'Location off'))}</small></span></button></div>${label('Recent location requests')}<div class="settings-row wireless-row kk-pref-disabled" aria-disabled="true"><span class="row-copy">No apps have requested location recently</span></div>`, 'wireless-more kk-location-page', connectivitySwitch('locationAccess', 'Location', true));
    }
    if (s === 'location-mode') return appView('Location mode', Object.entries(LOCATION_MODES).map(([id, [title, summary]]) => `<button class="settings-row wireless-row" data-action="kk-location-mode" data-id="${id}" role="radio" aria-checked="${locationMode() === id}"><span class="row-copy">${safe(title)}<small>${safe(summary)}</small></span><img class="holo-radio" src="assets/btn_radio_${locationMode() === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''), 'wireless-more kk-location-page');
    // PaymentSettings with no HCE payment services, and PrintSettingsFragment with no print services.
    if (s === 'nfc-payment') return appView('Tap & pay', `<div class="kk-empty-page"><img src="assets/lps-nfc_payment_empty_state.png" alt=""><p>Pay with just a tap</p><button class="kk-link" data-action="toast" data-id="Learn more">Learn more</button></div>`, 'kk-empty', `<button class="jb-ab-action kk-ab-text" data-action="open-app" data-app="play-store">${safe(i18n.t('Find apps'))}</button>`);
    if (s === 'print') return appView('Printing', `${label('Print services')}<p class="kk-empty-text">No services installed</p>`, 'kk-print', `<button class="jb-ab-action" data-action="open-app" data-app="play-store" aria-label="${safe(i18n.t('Add service'))}"><img src="assets/jb-ic_menu_add.png" alt=""></button>`);
    if (s === 'daydream') return renderDaydreamSettings();
    if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
    if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${prefRow(A11Y('Magnification gestures'), A11Y(lp.data.settings.magnification ? 'On' : 'Off'), 'settings-sub', 'a11y-magnification')}${toggleRow('Large text', '', 'largeText', 'A')}${toggleRow('Power button ends call', '', 'powerEndsCall', '⏻')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', '', 'speakPasswords', '◉')}${prefRow(A11Y('Accessibility shortcut'), A11Y(lp.data.settings.a11yShortcut ? 'On' : 'Off'), 'settings-sub', 'a11y-shortcut')}${prefRow('Text-to-speech output', '', 'lng-open', 'tts')}${prefRow(A11Y('Touch & hold delay'), A11Y(HOLD_NAMES[lp.data.settings.longPressTimeout || 0]), 'a11y-hold')}`);
    // ToggleScreenMagnificationPreferenceFragment / ToggleGlobalGesturePreferenceFragment: the switch in the action
    // bar over the feature's description.
    if (s === 'a11y-magnification') return appView(A11Y('Magnification gestures'), `<p class="a11y-summary">${safe(A11Y('Magnification summary'))}</p>`, '', connectivitySwitch('magnification', A11Y('Magnification gestures'), true));
    if (s === 'a11y-shortcut') return appView(A11Y('Accessibility shortcut'), `<p class="a11y-summary">${safe(A11Y('Accessibility shortcut summary'))}</p>`, '', connectivitySwitch('a11yShortcut', A11Y('Accessibility shortcut'), true));
    // Android 4.3 development_prefs.xml, with the master switch in the action bar (DevelopmentSettings).
    const lngPage = InputLanguage.render(langContext());
    if (lngPage) return appView(lngPage.title, lngPage.body, 'lng-page', lngPage.right);
    const devPage = JBDeveloperOptions.page(s, key => i18n.t(key), i18n.language);
    if (devPage) return appView(devPage.title, devPage.body, 'dev-page');
    if (s.startsWith('dev-procstats')) { const stats = ProcStats.render(procStatsContext()); if (stats) return appView(stats.title, stats.body, 'ps-page', stats.right); }
    if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(lp.data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value), i18n.language), '', connectivitySwitch('developerEnabled', i18n.t('Developer options'), true));
    // Settings 4.3 language_settings.xml: Language opens its own list; keyboards, speech and pointer speed follow.
    const languageNames = {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'};
    if (s === 'language-pick') return appView('Language', Object.entries(languageNames).map(([code, name]) => `<button class="settings-row wireless-row" data-action="set-language" data-id="${code}" role="radio" aria-checked="${i18n.language === code}" data-no-translate><span class="row-copy">${name}</span><img class="holo-radio" src="assets/btn_radio_${i18n.language === code ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''));
    if (s === 'volumes' || s === 'ringtone' || s === 'sleep') return appView(s === 'volumes' ? 'Volumes' : s === 'ringtone' ? 'Phone ringtone' : 'Sleep', `<div class="detail-pad"><p>${s === 'ringtone' ? 'Titania is selected.' : s === 'sleep' ? 'Screen turns off after 30 seconds.' : 'Ringtone 70% · Media 60% · Alarm 80%'}</p></div>`);
    /* Settings 5.1 dashboard (dashboard_categories.xml) as the Nexus 6 shows it: no SIM cards (one slot), no Home
       (one launcher), Developer options once unlocked. Each category is a white card with its teal 14 sp bold title;
       tiles are 72 dp with the teal 24 dp icon, 16 dp in and 32 dp before the 18 sp title. */
    const tile = (id, icon, title) => `<button class="lp-tile" data-action="settings-sub" data-id="${id}"><img src="assets/lps-${icon}.png" alt=""><span>${safe(i18n.t(title))}</span></button>`;
    const category = (title, tiles) => `<section class="lp-dash-category"><h3>${safe(i18n.t(title))}</h3>${tiles.join('')}</section>`;
    return appView('Settings', `<div class="lp-dashboard">${category('Wireless & networks', [tile('wifi', 'ic_settings_wireless', 'Wi‑Fi'), tile('bluetooth', 'ic_settings_bluetooth2', 'Bluetooth'), tile('data', 'ic_settings_data_usage', 'Data usage'), tile('wireless', 'ic_settings_more', 'More')])}${category('Device', [tile('display', 'ic_settings_display_am', 'Display'), tile('sound', 'ic_settings_notifications', 'Sound & notification'), tile('storage', 'ic_settings_storage', 'Storage'), tile('battery', 'ic_settings_battery', 'Battery'), tile('apps', 'ic_settings_applications', 'Apps'), tile('users', 'ic_settings_multiuser', 'Users'), tile('nfc-payment', 'ic_settings_nfc_payment_am', 'Tap & pay')])}${category('Personal', [tile('location', 'ic_settings_location', 'Location'), tile('security', 'ic_settings_security', 'Security'), tile('sync', 'ic_settings_accounts', 'Accounts'), tile('language', 'ic_settings_language', 'Language & input'), tile('backup', 'ic_settings_backup', 'Backup & reset')])}${category('System', [tile('date', 'ic_settings_date_time', 'Date & time'), tile('accessibility', 'ic_settings_accessibility', 'Accessibility'), tile('print', 'ic_settings_print', 'Printing'), ...(lp.data.settings.developerUnlocked ? [tile('development', 'ic_settings_development', 'Developer options')] : []), tile('about', 'ic_settings_about', 'About phone')])}</div>`, 'lp-dash-page', `<button class="lp-ab-action" data-action="toast" data-id="Search is not available offline" aria-label="${safe(i18n.t('Search'))}"><img src="assets/lp-fw-ic_search_api_material.svg" alt=""></button>`);
  }
  Object.assign(lp, {carrierName, allWifiNetworks, printContext});
  // lp:code
  return {
    // lp:hooks
    input(event) {
      if (event.target.matches('[data-pr]') && PrintSpooler.input(event.target, printContext())) return true;
      if (event.target.matches('[data-lng-seek]') && InputLanguage.input(event.target, langContext())) return true;
      if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return true;}
      if (event.target.dataset.field === 'lp-volume') { lp.data.settings[event.target.dataset.key] = Number(event.target.value); event.target.style.setProperty('--v', `${event.target.value}%`); save(); return true; }
      if (event.target.dataset.field === 'auto-brightness') { lp.data.settings.autoBrightness = event.target.checked; save(); const slider = event.target.closest('.jb-brightness')?.querySelector('[data-field="brightness"]'); if (slider) slider.disabled = lp.data.settings.autoBrightness; return true; }
      if (event.target.dataset.field === 'brightness') {
        lp.data.settings.brightness = Number(event.target.value); save(); event.target.style.setProperty('--v', `${(lp.data.settings.brightness - 10) / .9}%`);
        const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${lp.data.settings.brightness}%`;
        screen.style.filter = `brightness(${.5 + lp.data.settings.brightness / 135})`;
      }
      // lp:input
      return false;
    },
    overlay(name, root) {
      if (ui.overlay === 'lp-zen-cond' && ui.zenCond) {
        overlayRoot.innerHTML = LPZen.conditionDialog(ui.zenCond, key => i18n.t(key));
        return true;
      }
      if (ui.overlay.startsWith('lps-')) {
        overlayRoot.innerHTML = LPSecurity.overlay({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        overlayRoot.querySelector('[data-lps-pin]')?.focus();
        return true;
      }
      if (ui.overlay.startsWith('ps-')) {
        overlayRoot.innerHTML = ProcStats.overlay(procStatsContext());
        return true;
      }
      if (ui.overlay==='cb-menu'||ui.overlay==='cb-dialog') {
        overlayRoot.innerHTML=CellBroadcast.overlay(ui,lp.data,key=>i18n.t(key));
        return true;
      }
      if (ui.overlay==='sx-dialog') {
        overlayRoot.innerHTML=ICSSystemSettings.overlay(lp.data,ui,key=>i18n.t(key));
        return true;
      }
      if (ui.overlay.startsWith('sd-')) {
        overlayRoot.innerHTML = ICSSettingsDetail.overlay(lp.data,ui,key=>i18n.t(key));
        return true;
      }
      // lp:overlay
      return false;
    },
    back() {
      if (ui.view === 'settings' && ['about-sim', 'about-imei'].includes(ui.sub)) { ui.sub = 'about-status'; render(); return true; }
      if (ui.view === 'settings' && ['easter', 'lland', 'about-status', 'about-legal'].includes(ui.sub)) { ui.sub = 'about'; render(); return true; }
      if (ui.view === 'settings' && ui.sub?.startsWith('user:')) { ui.sub = 'users'; render(); return true; }
      if (ui.view === 'settings' && !ui.overlay && CellBroadcast.back(ui, openApp)) { render(); return true; }
      if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'sync-account') { ui.sub = 'sync-google'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return true; }
      if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return true; }
      if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return true; }
      // lp:back
      return false;
    },
    backPages() {
      if(ui.view==='settings' && ['apn','operators','tether-help','device-admin','wifi-direct','wifi-display','location-mode'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security','wifi-direct':'wifi','wifi-display':'display','location-mode':'location'}[ui.sub];render();return true;}
      if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc','language-pick'].includes(ui.sub)){ui.sub={'language-pick':'language','app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return true;}
      // lp:backPages
      return false;
    },
    backSync() {
      if(ui.view==='settings' && ui.kpSyncReturn && ui.sub==='sync-google'){ui.kpSyncReturn=false;openApp('keep',true);ui.kpScreen='settings';render();return true;}
      // lp:backSync
      return false;
    },
    backLock() {
      if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();return true;}
      // lp:backLock
      return false;
    },
    backA11y() {
      if (ui.view === 'settings' && ['a11y-magnification', 'a11y-shortcut'].includes(ui.sub) && !ui.overlay) { ui.sub = 'accessibility'; render(); return true; }
      // lp:backA11y
      return false;
    },
    backDev() {
      if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return true; }
      if (ui.view === 'settings' && ui.sub.startsWith('dev-procstats') && !ui.overlay) { ui.sub = ui.sub === 'dev-procstats' ? 'development' : 'dev-procstats'; render(); return true; }
      // lp:backDev
      return false;
    },
    backLang() {
      if (ui.view === 'settings' && ui.sub.startsWith('lng-') && !ui.overlay && InputLanguage.back(langContext())) return true;
      // lp:backLang
      return false;
    },
    backPrint() {
      if (ui.overlay === 'print') { const u = ui.print; if (u?.step === 'printers') { u.step = 'config'; renderOverlay(); } else if (u?.expanded) { u.expanded = false; renderOverlay(); } else { ui.print = null; ui.overlay = ''; renderOverlay(); } return true; }
      // lp:backPrint
      return false;
    },
    render() {
      return renderSettings();
      // lp:render
    },
    overlays: {
      'kk-cast-menu'() {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="kk-cast-enable" role="menuitemcheckbox" aria-checked="${!!lp.data.settings.wifiDisplay}" class="kk-check-item">${safe(i18n.t('Enable wireless display'))}<img src="assets/btn_check_${lp.data.settings.wifiDisplay ? 'on' : 'off'}_holo_dark.png" alt=""></button></div>`;
      },
      'lp-zen-drop'() {
        overlayRoot.innerHTML = LPZen.dropdown(ui.zenDrop, lp.data.settings, key => i18n.t(key));
        // overlapAnchor: the list covers the preference, from its start padding.
        const anchor = viewport.querySelector(`[data-action="lp-zen-drop"][data-id="${ui.zenDrop}"]`), list = overlayRoot.querySelector('.lp-dropdown');
        if (anchor && list) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), frame = screen.getBoundingClientRect(), scale = frame.height / screen.offsetHeight || 1; list.style.top = `${Math.max(0, Math.min((a.top - box.top) / scale, screen.offsetHeight - list.offsetHeight))}px`; }
      },
      'lp-zen-days'() {
        overlayRoot.innerHTML = LPZen.daysDialog(lp.data.settings, key => i18n.t(key), i18n.locale());
      },
      'kk-sms-app'() {
        // SmsDefaultDialog-style list preference: the SMS-capable apps (only Messaging in AOSP).
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Default SMS app'))}"><h3>${safe(i18n.t('Default SMS app'))}</h3><button class="settings-row jb-dream-row" data-action="close-overlay" role="radio" aria-checked="true"><span class="row-copy">${safe(i18n.t('Messaging'))}</span><img class="holo-radio" src="assets/btn_radio_on_holo_dark.png" alt=""></button><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      },
      'dev-list'() {
        overlayRoot.innerHTML = JBDeveloperOptions.dialog(ui.devList, lp.data.settings, key => i18n.t(key), i18n.language);
      },
      'a11y-hold'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(A11Y('Touch & hold delay'))}"><h3>${safe(A11Y('Touch & hold delay'))}</h3>${HOLD_NAMES.map((name, i) => `<button class="settings-row wireless-row" data-action="a11y-hold-pick" data-id="${i}" role="radio" aria-checked="${(lp.data.settings.longPressTimeout || 0) === i}"><span class="row-copy">${safe(A11Y(name))}</span><img class="holo-radio" src="assets/btn_radio_${(lp.data.settings.longPressTimeout || 0) === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      },
      'dream-when'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('When to daydream'))}"><h3>${safe(i18n.t('When to daydream'))}</h3>${[['docked', 'While docked'], ['charging', 'While charging'], ['either', 'Either']].map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-when-pick" data-id="${id}" role="radio" aria-checked="${(lp.data.settings.daydreamWhen || 'charging') === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${(lp.data.settings.daydreamWhen || 'charging') === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      },
      'lng-dialog'() {
        overlayRoot.innerHTML = InputLanguage.overlay(langContext());
      },
      'print'() {
        overlayRoot.innerHTML = PrintSpooler.overlay(printContext());
      },
      'cert-install'() {
        overlayRoot.innerHTML = CertInstall.overlay(certContext());
      },
      'lp-settings-menu'() {
        if (ui.lpMenu === 'accounts') { const on = lp.data.settings.autoSync !== false; overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu"><button role="menuitemcheckbox" aria-checked="${on}" data-action="lp-auto-sync" class="lp-menu-check"><span>${safe(i18n.t('Auto-sync data'))}</span><i class="lp-check${on ? ' on' : ''}"></i></button></div>`; return; }
        const items = ui.lpMenu === 'sync-account' ? [['lp-sync-now', 'Sync now'], ['toast:This feature is not part of the simulator.', 'Remove account']] : ui.lpMenu === 'wifi' ? [['wifi-add', 'Add network'], ['settings-sub:wifi-saved', 'Saved networks'], ['wifi-scan', 'Refresh'], ['settings-sub:wifi-advanced', 'Advanced']] : [['bluetooth-scan', 'Refresh'], ['bluetooth-rename', 'Rename this device'], ['bluetooth-files', 'Show received files']];
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.map(([action, title]) => { const [act, sub] = action.split(':'); return `<button role="menuitem" data-action="${act}"${sub ? ` data-id="${sub}"` : ''}>${safe(i18n.t(title))}</button>`; }).join('')}</div>`;
      },
      'connectivity-menu'() {
        const wifi = ui.connectivityMenu === 'wifi';
        const enabled = lp.data.settings[wifi ? 'wifi' : 'bluetooth'];
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-wps" data-id="pin" ${enabled ? '' : 'disabled'}>WPS Pin Entry</button><button data-action="settings-sub" data-id="wifi-direct" ${enabled ? '' : 'disabled'}>Wi-Fi Direct</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
      },
      'wifi-wps'() {
        overlayRoot.innerHTML = wpsDialog();
      },
      'p2p-menu'() {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="p2p-rename" ${lp.data.settings.wifi ? '' : 'disabled'}>${safe(i18n.t('Rename device'))}</button></div>`;
      },
      'p2p-rename'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="p2p-rename" role="dialog" aria-label="Rename device"><h3>Rename device</h3><input name="name" aria-label="Device name" maxlength="32" required value="${safe(lp.data.settings.p2pName || 'Android_4f3a')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div></form>`;
      },
      'wifi-add'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
      },
      'bluetooth-pair'() {
        const paired = lp.data.settings.pairedDevice === ui.bluetoothTarget;
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
      },
      'bluetooth-rename'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(lp.data.settings.bluetoothName || 'Nexus 4')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
      },
      'bluetooth-files'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
      },
      'wifi-dialog'() {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        const connected = lp.data.settings.wifiNetwork === ui.wifiTarget;
        /* WifiDialog / WifiConfigController (wifi_dialog.xml): the network as the title, its info rows (status, signal
           strength from the wifi_signal array, link speed and frequency when connected, security), then for a secured
           network the password field with Show password and the Advanced options checkbox; CANCEL and CONNECT, or
           CANCEL and FORGET for the connected one. */
        const T = key => safe(i18n.t(key)), signal = ['Poor', 'Fair', 'Good', 'Excellent'][Math.max(0, Math.min(3, (network?.strength || 4) - 1))];
        const security = !network || network.security === 'Open' ? 'None' : `${network.security} PSK`;
        const info = (label, value) => `<div class="lp-wifi-row"><span>${T(label)}</span><b data-no-translate>${safe(value)}</b></div>`;
        const rows = (connected ? info('Status', i18n.t('Connected')) : '') + info('Signal strength', i18n.t(signal, 'Wi-Fi')) + (connected ? info('Link speed', '65 Mbps') + info('Frequency', '2.4 GHz') : '') + info('Security', i18n.t(security));
        const secret = !connected && network?.security !== 'Open' ? `<label class="lp-wifi-password"><span>${T('Password')}</span><input class="wifi-password" type="password" autocomplete="off"></label><label class="lp-wifi-check"><input type="checkbox" data-wifi-show-password>${T('Show password')}</label><label class="lp-wifi-check"><input type="checkbox">${T('Advanced options')}</label>` : '';
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog lp-wifi-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3 data-no-translate>${safe(ui.wifiTarget)}</h3><div class="lp-wifi-info">${rows}</div>${secret}<div class="settings-dialog-actions"><button data-action="close-overlay">${T('Cancel')}</button>${connected ? `<button data-action="wifi-forget">${T('Forget')}</button>` : `<button data-action="wifi-connect">${T('Connect')}</button>`}</div></div>`;
        overlayRoot.querySelector('[data-wifi-show-password]')?.addEventListener('change', event => { const field = overlayRoot.querySelector('.wifi-password'); if (field) field.type = event.target.checked ? 'text' : 'password'; });
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if (action.startsWith('lng-') && InputLanguage.handle(action, id, langContext())) return;
      if (action.startsWith('pr-') && PrintSpooler.handle(action, id, printContext())) return;
      if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return;
      if (action.startsWith('ps-') && ProcStats.handle(action, id, procStatsContext())) return;
      if (action.startsWith('cert-') && CertInstall.handle(action, id, certContext())) return;
      if (action.startsWith('lpu-') && window.LPUsers?.handle(action, button, {data: lp.data, save, render, open: sub => { ui.sub = sub; render(); }, back: () => { ui.sub = 'users'; render(); }})) return;
      if(action.startsWith('cb-')&&CellBroadcast.handle(action,id,{data: lp.data,ui,save,render,renderOverlay}))return;
      // lp:click
      switch (action) {
        case 'dream-pick': lp.data.settings.daydreamType = id; save(); render(); break;
        case 'dream-when': ui.overlay = 'dream-when'; renderOverlay(); break;
        case 'dream-when-pick': lp.data.settings.daydreamWhen = id; save(); ui.overlay = ''; render(); break;
        case 'kk-location-mode': lp.data.settings.gps = id !== 'battery'; lp.data.settings.networkLocation = id !== 'device'; save(); render(); break;
        case 'kk-sms-app': ui.overlay = 'kk-sms-app'; renderOverlay(); break;
        case 'kk-cast-menu': ui.overlay = 'kk-cast-menu'; renderOverlay(); break;
        case 'kk-cast-enable': lp.data.settings.wifiDisplay = !lp.data.settings.wifiDisplay; save(); ui.overlay = ''; render(); break;
        case 'settings-sub': ui.overlay = ''; if (id === 'development' && !lp.data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
        case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
        case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
        case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
        // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
        case 'sd-uninstall': { const r = ui.settingsApp, m = StoreHost.module(r); if (!m) break; storeContext().dialog({title: m.title, message: JBPlay.text(i18n.language, 'Do you want to uninstall this app?'), buttons: [{label: i18n.t('Cancel')}, {label: i18n.t('OK'), action: () => { lp.storeUninstall(r.slice(6)); save(); ui.sub = 'apps'; render(); }}]}); break; }
        case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
        case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id==='gallery'?'photos':'play-music');else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
        case 'sd-battery-history': ui.sub='battery-history';render();break;
        case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
        case 'sd-clear-cache': lp.data.appCacheCleared=[...new Set([...(lp.data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
        case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
        case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
        case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;lp.saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
        case 'wifi-wps': ui.wps = {mode: id === 'pin' ? 'pin' : 'pbc', start: Date.now(), pin: String(Math.floor(10000000 + Math.random() * 89999999))}; ui.overlay = 'wifi-wps'; renderOverlay(); break;
        case 'p2p-search': startP2pSearch(); render(); break;
        case 'p2p-menu': ui.overlay = 'p2p-menu'; renderOverlay(); break;
        case 'p2p-rename': ui.overlay = 'p2p-rename'; renderOverlay(); break;
        case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
        case 'lp-settings-menu': ui.lpMenu = id; ui.overlay = 'lp-settings-menu'; renderOverlay(); break;
        case 'lp-auto-sync': lp.data.settings.autoSync = lp.data.settings.autoSync === false; ui.overlay = ''; save(); renderOverlay(); render(); break;
        case 'lp-sync-toggle': { const off = lp.data.settings.syncOff ||= {}; if (lp.data.settings.autoSync === false) break; off[id] = !off[id]; save(); render(); break; }
        case 'lp-sync-now': ui.overlay = ''; renderOverlay(); render(); break;
        case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
        case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
        case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
        case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
        case 'bluetooth-confirm': lp.data.settings.pairedDevice = lp.data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
        case 'wifi-network': ui.wifiTarget = id; ui.overlay = 'wifi-dialog'; renderOverlay(); break;
        case 'wifi-connect': {
          const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
          if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
          lp.data.settings.wifiNetwork = ui.wifiTarget; lp.data.settings.wifi = true;
          save(); ui.overlay = ''; render(); break;
        }
        case 'wifi-forget': lp.data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
        case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
        case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
        case 'set-language': i18n.setLanguage(id); location.reload(); break;
        case 'sx-dialog': if(id==='screen-lock'){lockControls.open();break;}ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-new': ui.systemDraft={};ui.systemField='vpn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-open': ui.systemId=id;ui.systemField='vpn-connect';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-edit': ui.systemValues=null;ui.systemDraft=clone((lp.data.vpnProfiles||[]).find(profile=>profile.id===ui.systemId)||{});ui.systemField='vpn-edit';renderOverlay();break;
        case 'sx-profile-delete': ui.systemDeleteKind=id;ui.systemField='profile-delete';renderOverlay();break;
        case 'sx-network-scan': ui.networkScanned=true;render();break;
        case 'sx-network-auto': lp.data.settings.networkAuto=true;lp.data.settings.networkOperator='Telekom';save();render();break;
        case 'sx-network-select': lp.data.settings.networkAuto=false;lp.data.settings.networkOperator=id;save();render();break;
        case 'sx-apn-new': ui.systemDraft={};ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-apn-open': ui.systemDraft=clone((lp.data.apnProfiles||[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}]).find(profile=>profile.id===id)||{});ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-apn-select': lp.data.settings.apnId=id;save();render();break;
        case 'dev-info': toast(i18n.t('This feature is not part of the simulator.')); break;
        // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
        case 'dev-list': ui.devList = id; ui.overlay = 'dev-list'; renderOverlay(); break;
        case 'dev-list-pick': { const cut = id.lastIndexOf(':'); lp.data.settings[id.slice(0, cut)] = Number(id.slice(cut + 1)); save(); ui.overlay = ''; renderOverlay(); render(); break; }
        // Interruptions (lp-zen.js): the DropDownPreference lists, the condition dialog after priority / none, Days, the times.
        case 'lp-zen-drop': ui.zenDrop = id; ui.overlay = 'lp-zen-drop'; renderOverlay(); break;
        case 'lp-zen-pick': {
          const [kind, value] = id.split(':'), s = lp.data.settings;
          ui.overlay = '';
          if (kind === 'mode' && value !== (s.zenMode || 'all')) {
            const old = s.zenMode || 'all', oldExit = s.zenExit || null;
            s.zenMode = value;
            if (value === 'all') s.zenExit = null;
            else { const now = deviceDate().getTime(); ui.zenCond = {mode: value, old, oldExit, index: 0, list: LPZen.conditions(s, now, nextAlarmTime())}; ui.overlay = 'lp-zen-cond'; }
          }
          if (kind === 'from') s.zenFrom = value;
          if (kind === 'downtime' && s.zenSleepNone !== (value === 'none')) { s.zenSleepNone = value === 'none'; delete s.zenDowntimed; }
          save(); render(); renderOverlay(); break;
        }
        case 'lp-zen-cond': ui.zenCond.index = Number(id); renderOverlay(); break;
        case 'lp-zen-ok': LPZen.confirm(lp.data.settings, ui.zenCond.list[ui.zenCond.index], deviceDate().getTime()); ui.zenCond = null; ui.overlay = ''; save(); render(); renderOverlay(); break;
        case 'lp-zen-cancel': lp.data.settings.zenMode = ui.zenCond.old; lp.data.settings.zenExit = ui.zenCond.oldExit; ui.zenCond = null; ui.overlay = ''; save(); render(); renderOverlay(); break;
        case 'lp-zen-days': ui.overlay = 'lp-zen-days'; renderOverlay(); break;
        case 'lp-zen-day': { const day = Number(id), days = new Set(lp.data.settings.zenDays || []); if (days.has(day)) days.delete(day); else days.add(day); lp.data.settings.zenDays = [...days].sort(); delete lp.data.settings.zenDowntimed; save(); render(); renderOverlay(); break; }
        case 'lp-zen-time': { const [h, m] = (lp.data.settings[id === 'start' ? 'zenStart' : 'zenEnd'] || (id === 'start' ? '22:00' : '07:00')).split(':').map(Number); ui.kdcPicker = {zen: id, hour: h, minute: m, mode: 'hour'}; ui.overlay = 'kdc-picker'; renderOverlay(); break; }
        case 'lp-lock-notif': { const order = ['show', 'hide', 'none']; lp.data.settings.lockNotifications = order[(order.indexOf(lp.data.settings.lockNotifications || 'show') + 1) % 3]; save(); render(); break; }
        case 'build-tap': {
          if (lp.data.settings.developerUnlocked) { toast('No need, you are already a developer.'); break; }
          const remaining = 7 - ++ui.buildTaps;
          if (remaining <= 0) { lp.data.settings.developerUnlocked = true; ui.buildTaps = 0; save(); toast('You are now a developer!'); }
          else if (remaining < 5) toast(AndroidStrings.format(i18n.t(AndroidStrings.quantity(remaining) === 'one' ? 'You are now %d step away from being a developer.' : 'You are now %d steps away from being a developer.'), remaining));
          break;
        }
        case 'toggle-setting': {
          if (id === 'magnification' && lp.data.settings.magnification) { ui.magnify = null; applyMagnification(); }
          const previousScroll = viewport.querySelector('.settings-app')?.scrollTop || 0;
          lp.data.settings[id] = !lp.data.settings[id];
          if(id==='autoTime')lp.data.settings.timeOffset=0;
          if(id==='autoZone'&&!lp.data.settings.autoZone)lp.data.settings.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (id === 'airplane' && lp.data.settings.airplane) { lp.data.settings.wifi = false; lp.data.settings.bluetooth = false; lp.data.settings.wifiDirect = false; lp.data.settings.portableHotspot = false;lp.data.settings.bluetoothTether=false;ui.vpnConnected=null; }
          if(id==='portableHotspot'&&lp.data.settings.portableHotspot)lp.data.settings.wifi=false;
          if(id==='wifi'&&lp.data.settings.wifi)lp.data.settings.portableHotspot=false;
          if(id==='bluetoothTether'&&lp.data.settings.bluetoothTether)lp.data.settings.bluetooth=true;
          if(id==='bluetooth'&&!lp.data.settings.bluetooth)lp.data.settings.bluetoothTether=false;
          if (id === 'nfc' && !lp.data.settings.nfc) lp.data.settings.androidBeam = false;
          if (id === 'nfc' && lp.data.settings.nfc) lp.data.settings.androidBeam = true;
          save(); render(); const settingsView = viewport.querySelector('.settings-app'); if (settingsView) settingsView.scrollTop = previousScroll; break;
        }
        case 'factory-reset': if (confirm(i18n.t('Reset all local Lollipop simulator data?'))) resetSimulator(); break;
        case 'about-tap':
          ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
          if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.aboutTapTimes = []; render(); }
          break;
        case 'a11y-hold': ui.overlay = 'a11y-hold'; renderOverlay(); break;
        case 'a11y-hold-pick': lp.data.settings.longPressTimeout = Number(id); ui.overlay = ''; save(); renderOverlay(); render(); break;
        // Security's sub-pages (lp-security.js).
        case 'lps-toast': toast(i18n.t(id)); break;
        case 'lps-sim': ui.lpsPin = {mode: id, step: 'pin'}; ui.overlay = 'lps-pin'; renderOverlay(); break;
        case 'lps-pin-ok': { const value = overlayRoot.querySelector('[data-lps-pin]')?.value || '', note = LPSecurity.pinOk(lp.data, ui, value); if (note === null) { renderOverlay(); break; } save(); ui.overlay = ''; renderOverlay(); render(); if (note) toast(i18n.t(note)); break; }
        case 'lps-tab': ui.lpsTab = id; render(); break;
        case 'lps-cert': ui.lpsCert = id; ui.overlay = 'lps-cert'; renderOverlay(); break;
        case 'lps-cert-ask': ui.overlay = 'lps-confirm'; renderOverlay(); break;
        case 'lps-cert-toggle': { const off = new Set(lp.data.settings.disabledCerts || []); if (off.has(ui.lpsCert)) off.delete(ui.lpsCert); else off.add(ui.lpsCert); lp.data.settings.disabledCerts = [...off]; save(); ui.overlay = ''; renderOverlay(); render(); break; }
        case 'lps-agent': lp.data.settings.smartLockAgent = lp.data.settings.smartLockAgent === false; save(); render(); break;
        case 'open-settings-sync': ui.overlay = ''; openApp('settings'); ui.sub = 'sync'; render(); break;
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      if (CellBroadcast.submit(form.dataset.form, values, {data: lp.data, ui, save, render, renderOverlay})) return;
      if(form.dataset.form==='sx-save'){ui.systemError=ICSSystemSettings.submit(lp.data,ui,values);if(ui.systemError){ui.systemValues=Object.fromEntries(values);renderOverlay();return;}save();ui.overlay='';render();return;}
      if(form.dataset.form==='sx-vpn-connect'){ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();return;}
      if(form.dataset.form==='sx-profile-delete'){ICSSystemSettings.removeProfile(lp.data,ui);save();ui.overlay='';render();return;}
      if (form.dataset.form === 'wifi-add') {
        const name = String(values.get('ssid') || '').trim();
        const security = values.get('security');
        if (!name) return;
        if (security !== 'Open' && String(values.get('password') || '').length < 8) { toast('Password must have at least 8 characters'); return; }
        lp.data.savedWifiNetworks ||= [];
        if (!allWifiNetworks().some(network => network.name === name)) lp.data.savedWifiNetworks.push({name, security, strength:4});
        lp.data.settings.wifiNetwork = name;
        save(); ui.overlay = ''; render(); return;
      }
      if (form.dataset.form === 'p2p-rename') {
        const name = String(values.get('name') || '').trim();
        if (!name) return;
        lp.data.settings.p2pName = name; save(); ui.overlay = ''; render(); return;
      }
      if (form.dataset.form === 'bluetooth-rename') {
        const name = String(values.get('name') || '').trim();
        if (!name) return;
        lp.data.settings.bluetoothName = name;
        save(); ui.overlay = ''; render(); return;
      }
      // lp:submit
      switch (name) {
        case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])lp.data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
        case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')lp.data.settings.sleep=Number(choice);else if(['windowScale','transitionScale','animatorScale'].includes(ui.settingsField))lp.data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){lp.data.settings.fontSize=choice;lp.data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){lp.data.settings.silent=choice!=='off';lp.data.settings.silentMode=choice;}else lp.data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
