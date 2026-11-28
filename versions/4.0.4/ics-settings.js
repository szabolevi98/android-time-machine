/* Settings (IMM76I Settings.apk), moved out of simulator.js (docs/plans/engine-migration.md). The pages come from the
   image's preference XMLs through settings-detail.js (Sound, Display, Storage, Battery, Apps, Data usage),
   settings-system.js (Date & time, Security, Location, Accounts & sync, Backup & reset, About phone, VPN, Mobile
   networks ...), ics-a11y.js (Accessibility, System updates), ics-language.js (Language & input), ics-devopts.js
   (Developer options) and ics-musicfx.js (Music effects); this module draws the main list, Wi-Fi, Bluetooth and
   Wireless & networks, and is the app around them: the switches and check boxes, the dialogs, Apps' App info (Force
   stop, Clear data, Clear cache, a store app's Uninstall), Back through the pages, and About phone's easter egg
   (three quick taps on Android version: the platform logo; hold it for Nyandroid). */
(() => {
  'use strict';
  const wifiNetworks = [
    { name: 'AndroidAP', security: 'WPA2', strength: 4 },
    { name: 'CoffeeShop', security: 'Open', strength: 3 },
    { name: 'Home Network', security: 'WPA2', strength: 4 },
    { name: 'Library Wi-Fi', security: 'Open', strength: 2 }
  ];

  let eggTimer = null;
  // The page helpers: the action bar with Settings' icon, rows, switches and check boxes (Theme.Holo, dark).
  function helpers(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
    const actionbar = (title, right = '') => `<div class="actionbar"><button class="up" data-action="${ui.view === 'settings' && !ui.sub ? 'noop' : 'back'}" aria-label="${ui.view === 'settings' && !ui.sub ? 'Settings' : 'Back'}">${ui.view === 'settings' ? `${ui.sub ? '<img class="up-chevron" src="assets/ic_ab_back_holo_dark.png" alt="">' : ''}<img class="settings-header-icon" src="assets/settings.png" alt="">` : '‹'}</button><h2>${safe(title)}</h2>${right}</div>`;
    const content = (inner, theme = '') => `<div class="app-content ${theme}">${inner}</div>`;
    const appView = (title, inner, theme = '', right = '') => `<div class="app-view ${ui.view === 'settings' ? `settings-app ${!ui.sub ? 'settings-main' : ''}` : ''}">${actionbar(title, right)}${content(inner, ui.view === 'settings' ? `settings-dark ${theme}` : theme)}</div>`;
    const settingIcon = (id, fallback) => ui.view === 'settings' && ['wireless','bluetooth','data','sound','display','storage','battery','apps','language','date','about','sync','location','security','backup','accessibility','development'].includes(id) ? `<img src="assets/setting-${id}.png${id === 'bluetooth' ? '?v=2' : ''}" alt="">` : fallback;
    const row = (title, subtitle, action, id, icon = '') => `<button class="settings-row" data-action="${action}" data-id="${safe(id)}"><span class="row-icon">${icon === null ? '' : settingIcon(id, icon)}</span><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><span class="chevron">›</span></button>`;
    // Accessibility texts from the image's Settings (stock-strings.js).
    const a11yContext = () => ({ui, data, t: key => i18n.t(key), language: i18n.language, locale: i18n.locale(), now: deviceDate, save, render, renderOverlay, toast});
    const A11Y = key => { const row = window.StockStrings?.a11y?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); };
    // Touch & hold delay's choices (long_press_timeout_selector; the core's HOLD has their times).
    const HOLD_NAMES = ['Short', 'Medium', 'Long'];
    const toggleRow = (title, subtitle, key) => wirelessCheckRow(title, subtitle, key);
    const connectivitySwitch = (key, title, inHeader = false) => `<button class="holo-switch ${data.settings[key] ? 'on' : ''} ${inHeader ? 'settings-action-switch' : ''}" data-action="toggle-setting" data-id="${key}" role="switch" aria-label="${safe(title)}" aria-checked="${data.settings[key]}"><span class="switch-label" aria-hidden="true">${data.settings[key] ? 'ON' : 'OFF'}</span></button>`;
    const connectivityRow = (title, key) => `<div class="settings-row connectivity-row"><button class="connectivity-open" data-action="settings-sub" data-id="${key}"><span class="row-icon">${settingIcon(key === 'wifi' ? 'wireless' : key, '')}</span><span class="row-copy">${safe(title)}</span></button>${connectivitySwitch(key, title)}</div>`;
    const wirelessRow = (title, subtitle, id) => `<button class="settings-row wireless-row" data-action="settings-sub" data-id="${id}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span></button>`;
    const wirelessCheckRow = (title, subtitle, key) => `<button class="settings-row wireless-row" data-action="toggle-setting" data-id="${key}" role="checkbox" aria-checked="${data.settings[key]}"><span class="row-copy">${safe(title)}${subtitle ? `<small>${safe(subtitle)}</small>` : ''}</span><img class="holo-checkbox" src="assets/btn_check_${data.settings[key] ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
    const label = text => `<div class="section-label">${safe(text)}</div>`;

    const musicFxContext = () => ({data, ui, language: i18n.language, locale: i18n.locale(), save, render, toast: message => toast(message)});
    const devContext = () => ({data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});

    const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
    const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    function renderWifiSettings() {
      return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + connectivityMenu('wifi'));
    }
    function renderBluetoothSettings() {
      const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
      return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Galaxy Nexus')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
    }

    function renderSettings() {
      const s = ui.sub;
      if(s==='lock-setup')return c.lockControls.renderSetup();
      const a11y=ICSA11y.render(a11yContext());
      if(a11y)return a11y.full||appView(a11y.title,a11y.body,'sx-page icsa-page',a11y.right);
      // Music effects: MusicFX's ActivityMusic (*-musicfx.js).
      if(s==='musicfx'){const fx=MusicFX.render(musicFxContext());return appView(fx.title,fx.body,'mfx-page',fx.right);}
      const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
      if(system)return appView(system.title,system.body,'sx-page',system.right);
      const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
      if(detail)return appView(detail.title,detail.body,'sd-page');
      if (s === 'wifi') return renderWifiSettings();
      if (s === 'bluetooth') return renderBluetoothSettings();
      if (s === 'wallpaper') {
        return appView('Wallpaper', c.wallpaperChoices());
      }
      if (s === 'easter') return `<div class="easter-view">${ui.easterNyan ? `<div class="nyan-sky" data-action="back" data-nyandroid role="button" tabindex="0" aria-label="Close Nyandroid"></div>` : '<button class="easter-robot" data-action="egg-nyan" aria-label="Android easter egg"><img draggable="false" src="assets/platlogo.png" alt="Ice Cream Sandwich Android"></button>'}</div>`;
      if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessCheckRow('WiFi direct', '', 'wifiDirect')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
      if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
      // DevelopmentSettings of the IMM76I image (ics-devopts.js, generated by docs/tools/devopts.py maguro).
      const devPage = JBDeveloperOptions.page(s, key => i18n.t(key), i18n.language);
      if (devPage) return appView(devPage.title, devPage.body, 'dev-page');
      if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value), i18n.language));
      // Language & input and its pages (ics-language.js, from language_settings.xml and the IME / TTS / Voice Search preferences).
      const language=ICSLanguage.render(data,ui,i18n.locale());
      if(language)return appView(language.title,language.body,'lng-page',language.right||'');
      return appView('Settings', `${label('WIRELESS & NETWORKS')}${connectivityRow('Wi-Fi', 'wifi')}${connectivityRow('Bluetooth', 'bluetooth')}${row('Data usage', '', 'settings-sub', 'data', '◕')}${row('More...', '', 'settings-sub', 'wireless', null)}${label('DEVICE')}${row('Sound', '', 'settings-sub', 'sound', '♫')}${row('Display', '', 'settings-sub', 'display', '☼')}${row('Storage', '', 'settings-sub', 'storage', '▤')}${row('Battery', '', 'settings-sub', 'battery', '◧')}${row('Apps', '', 'settings-sub', 'apps', '▦')}${label('PERSONAL')}${row('Accounts & sync', '', 'settings-sub', 'sync', '↻')}${row('Location services', '', 'settings-sub', 'location', '◎')}${row('Security', '', 'settings-sub', 'security', '◉')}${row('Language & input', '', 'settings-sub', 'language', '◎')}${row('Backup & reset', '', 'settings-sub', 'backup', '↻')}${label('SYSTEM')}${row('Date & time', '', 'settings-sub', 'date', '◷')}${row('Accessibility', '', 'settings-sub', 'accessibility', '◉')}${row('Developer options', '', 'settings-sub', 'development', '⚙')}${row('About phone', '', 'settings-sub', 'about', '◉')}`);
    }

    return {actionbar, content, appView, settingIcon, row, a11yContext, A11Y, HOLD_NAMES, toggleRow, connectivitySwitch, connectivityRow, wirelessRow, wirelessCheckRow, label, musicFxContext, devContext, allWifiNetworks, connectivityMenu, renderWifiSettings, renderBluetoothSettings, renderSettings};
  }

  ICS.register('settings', {
    // About phone's platform logo: a long press zooms it, then Nyandroid starts.
    touch: '.easter-robot',
    open(c, resume) { if (!resume) c.ui.settingsRootScroll = 0; },
    render(c) { return helpers(c).renderSettings(); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      const {a11yContext, A11Y, HOLD_NAMES, allWifiNetworks} = helpers(c);
      if(ui.overlay==='lng-dialog'){
        return ICSLanguage.overlay(data,ui,i18n.locale());
      }
      if(ui.overlay==='sx-dialog'){
        return ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
      }
      if (ui.overlay.startsWith('sd-')) {
        return ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
      }
      if (ui.overlay === 'connectivity-menu') {
        const wifi = ui.connectivityMenu === 'wifi';
        const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-add" ${enabled ? '' : 'disabled'}>Add network</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
      }
      if (ui.overlay === 'wifi-add') {
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
      }
      if (ui.overlay === 'bluetooth-pair') {
        const paired = data.settings.pairedDevice === ui.bluetoothTarget;
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
      }
      if (ui.overlay === 'bluetooth-rename') {
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Galaxy Nexus')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
      }
      if (ui.overlay === 'bluetooth-files') {
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
      }
      if (ui.overlay === 'wifi-dialog') {
        const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
        const connected = data.settings.wifiNetwork === ui.wifiTarget;
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
      }
      if (ui.overlay === 'dev-list') {
        return JBDeveloperOptions.dialog(ui.devList, data.settings, key => i18n.t(key), i18n.language);
      }
      if (ui.overlay === 'icsa-dialog') {
        return ICSA11y.overlay(a11yContext());
      }
      if (ui.overlay === 'a11y-hold') {
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(A11Y('Touch & hold delay'))}"><h3>${safe(A11Y('Touch & hold delay'))}</h3>${HOLD_NAMES.map((name, i) => `<button class="settings-row wireless-row" data-action="a11y-hold-pick" data-id="${i}" role="radio" aria-checked="${(data.settings.longPressTimeout || 0) === i}"><span class="row-copy">${safe(A11Y(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.longPressTimeout || 0) === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      const {a11yContext, musicFxContext, devContext, allWifiNetworks} = helpers(c), {id} = button.dataset;
      if (action.startsWith('lng-') && ICSLanguage.handle(action, id, {data, ui, save, render, renderOverlay, toast: text => toast(i18n.t(text))})) return true;
      if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return true;
      if (action.startsWith('mfx-') && MusicFX.handle(action, id, musicFxContext())) return true;
      if (action.startsWith('icsa-') && ICSA11y.handle(action, id, a11yContext())) return true;
      switch (action) {
        case 'settings-sub': ui.overlay = ''; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
        case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
        case 'dev-info': toast(i18n.t('This feature is not part of the simulator.')); break;
        // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
        case 'dev-list': ui.devList = id; ui.overlay = 'dev-list'; renderOverlay(); break;
        case 'dev-list-pick': { const cut = id.lastIndexOf(':'); data.settings[id.slice(0, cut)] = Number(id.slice(cut + 1)); save(); ui.overlay = ''; renderOverlay(); render(); break; }
        case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
        case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
        // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
        case 'sd-uninstall': { const r = ui.settingsApp, m = StoreHost.module(r); if (!m) break; c.dialog({title: m.title, message: ICSPlay.text(i18n.language, 'Do you want to uninstall this app?'), buttons: [{label: i18n.t('Cancel')}, {label: i18n.t('OK'), action: () => { c.storeUninstall(r.slice(6)); save(); ui.sub = 'apps'; render(); }}]}); break; }
        case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
        case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id);else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
        case 'sd-battery-history': ui.sub='battery-history';render();break;
        case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
        case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
        case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
        case 'sd-confirm-clear': c.clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
        case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;c.saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
        case 'connectivity-menu': ui.connectivityMenu = id; ui.overlay = 'connectivity-menu'; renderOverlay(); break;
        case 'wifi-scan': ui.overlay = ''; renderOverlay(); toast('Scanning…'); break;
        case 'wifi-add': ui.overlay = 'wifi-add'; renderOverlay(); break;
        case 'bluetooth-rename': ui.overlay = 'bluetooth-rename'; renderOverlay(); break;
        case 'bluetooth-files': ui.overlay = 'bluetooth-files'; renderOverlay(); break;
        case 'bluetooth-confirm': data.settings.pairedDevice = data.settings.pairedDevice === ui.bluetoothTarget ? '' : ui.bluetoothTarget; save(); ui.overlay = ''; render(); break;
        case 'wifi-network': ui.wifiTarget = id; ui.overlay = 'wifi-dialog'; renderOverlay(); break;
        case 'wifi-connect': {
          const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
          if (network?.security !== 'Open' && !overlayRoot.querySelector('.wifi-password')?.value.trim()) { toast('Enter a password'); break; }
          data.settings.wifiNetwork = ui.wifiTarget; data.settings.wifi = true;
          save(); ui.overlay = ''; render(); break;
        }
        case 'wifi-forget': data.settings.wifiNetwork = ''; save(); ui.overlay = ''; render(); break;
        case 'bluetooth-scan': ui.bluetoothScanned = true; ui.overlay = ''; render(); break;
        case 'bluetooth-pair': ui.bluetoothTarget = id; ui.overlay = 'bluetooth-pair'; renderOverlay(); break;
        case 'set-language': i18n.setLanguage(id); location.reload(); break;
        case 'sx-dialog': if(id==='screen-lock'){c.lockControls.open();break;}ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-new': ui.systemDraft={};ui.systemField='vpn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-open': ui.systemId=id;ui.systemField='vpn-connect';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-vpn-edit': ui.systemValues=null;ui.systemDraft=clone((data.vpnProfiles||[]).find(profile=>profile.id===ui.systemId)||{});ui.systemField='vpn-edit';renderOverlay();break;
        case 'sx-profile-delete': ui.systemDeleteKind=id;ui.systemField='profile-delete';renderOverlay();break;
        case 'sx-network-scan': ui.networkScanned=true;render();break;
        case 'sx-network-auto': data.settings.networkAuto=true;data.settings.networkOperator='Telekom';save();render();break;
        case 'sx-network-select': data.settings.networkAuto=false;data.settings.networkOperator=id;save();render();break;
        case 'sx-apn-new': ui.systemDraft={};ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-apn-open': ui.systemDraft=clone((data.apnProfiles||[{id:'default',name:'Telekom',apn:'internet.telekom',mcc:'216',mnc:'30'}]).find(profile=>profile.id===id)||{});ui.systemField='apn-edit';ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
        case 'sx-apn-select': data.settings.apnId=id;save();render();break;
        case 'sx-sync-toggle': { if (data.settings.autoSync === false) break; const off = data.settings.syncOff ||= {}; off[id] = !off[id]; save(); render(); break; }
        case 'toggle-setting': {
          const previousScroll = viewport.querySelector('.settings-app')?.scrollTop || 0;
          data.settings[id] = !data.settings[id];
          if(id==='autoTime')data.settings.timeOffset=0;
          if(id==='autoZone'&&!data.settings.autoZone)data.settings.timeZone=Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (id === 'airplane' && data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; data.settings.wifiDirect = false; data.settings.portableHotspot = false;data.settings.bluetoothTether=false;ui.vpnConnected=null; }
          if(id==='portableHotspot'&&data.settings.portableHotspot)data.settings.wifi=false;
          if(id==='wifi'&&data.settings.wifi)data.settings.portableHotspot=false;
          if(id==='bluetoothTether'&&data.settings.bluetoothTether)data.settings.bluetooth=true;
          if(id==='bluetooth'&&!data.settings.bluetooth)data.settings.bluetoothTether=false;
          if (id === 'nfc' && !data.settings.nfc) data.settings.androidBeam = false;
          if (id === 'nfc' && data.settings.nfc) data.settings.androidBeam = true;
          save(); render(); const settingsView = viewport.querySelector('.settings-app'); if (settingsView) settingsView.scrollTop = previousScroll; break;
        }
        case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
        case 'factory-reset': if (confirm(i18n.t('Reset all local ICS simulator data?'))) c.resetSimulator(); break;
        case 'about-tap':
          ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
          if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTapTimes = []; render(); }
          break;
        case 'egg-nyan': toast('Android 4.0: Ice Cream Sandwich'); break;
        case 'a11y-hold': ui.overlay = 'a11y-hold'; renderOverlay(); break;
        case 'a11y-hold-pick': data.settings.longPressTimeout = Number(id); ui.overlay = ''; save(); renderOverlay(); render(); break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      const {allWifiNetworks} = helpers(c);
      if(ICSLanguage.submit(form.dataset.form,values,{data,ui,save,render,renderOverlay}))return true;
      if(form.dataset.form==='sx-save'){ui.systemError=ICSSystemSettings.submit(data,ui,values);if(ui.systemError){ui.systemValues=Object.fromEntries(values);renderOverlay();return true;}save();ui.overlay='';render();return true;}
      if(form.dataset.form==='sx-vpn-connect'){ui.vpnConnected=ui.vpnConnected===ui.systemId?null:ui.systemId;ui.overlay='';render();return true;}
      if(form.dataset.form==='sx-profile-delete'){ICSSystemSettings.removeProfile(data,ui);save();ui.overlay='';render();return true;}
      if (form.dataset.form === 'wifi-add') {
        const name = String(values.get('ssid') || '').trim();
        const security = values.get('security');
        if (!name) return true;
        if (security !== 'Open' && String(values.get('password') || '').length < 8) { toast('Password must have at least 8 characters'); return true; }
        data.savedWifiNetworks ||= [];
        if (!allWifiNetworks().some(network => network.name === name)) data.savedWifiNetworks.push({name, security, strength:4});
        data.settings.wifiNetwork = name;
        save(); ui.overlay = ''; render(); return true;
      }
      if (form.dataset.form === 'bluetooth-rename') {
        const name = String(values.get('name') || '').trim();
        if (!name) return true;
        data.settings.bluetoothName = name;
        save(); ui.overlay = ''; render(); return true;
      }
      switch (form.dataset.form) {
        case 'sd-brightness': data.settings.brightness=Number(values.get('brightness'));data.settings.autoBrightness=values.get('autoBrightness')!==null;save();ui.overlay='';render();break;
        case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
        case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){data.settings.fontSize=choice;data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
        default: return false;
      }
      return true;
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      const {musicFxContext} = helpers(c);
      if (event.target.matches('[data-mfx]') && MusicFX.input(event.target, musicFxContext())) return true;
      if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return true;}
      if (event.target.classList.contains('sd-brightness-bar')) { screen.style.filter = `brightness(${.5 + Number(event.target.value) / 135})`; return true; }
      if (event.target.dataset.field === 'brightness') {
        data.settings.brightness = Number(event.target.value); save();
        const display = event.target.closest('.detail-pad')?.querySelector('p'); if (display) display.textContent = `${data.settings.brightness}%`;
        screen.style.filter = `brightness(${.5 + data.settings.brightness / 135})`;
        return true;
      }
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'musicfx' && !ui.overlay) { ui.mfxSpin = false; ui.sub = 'sound'; render(); return true; }
      if(ui.view==='settings'&&ui.sub==='lock-setup'){c.lockControls.cancel();return true;}
      if (ui.overlay) return false;
      if(ui.view==='settings' && ['apn','operators','tether-help','device-admin'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security'}[ui.sub];render();return true;}
      if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc'].includes(ui.sub)){ui.sub={'app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return true;}
      // System updates, TalkBack and its settings, Explore by touch (ics-a11y.js).
      if (ui.view === 'settings' && ICSA11y.back(ui)) { render(); return true; }
      if (ui.view === 'settings' && ['easter', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; ui.easterNyan = false; render(); return true; }
      if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return true; }
      // Language & input's pages go back to their parent screen.
      if (ui.view === 'settings' && String(ui.sub).startsWith('lng-')) { ui.sub = {'lng-latin-adv': 'lng-latin', 'lng-subtypes': 'lng-latin', 'lng-tts-engine': 'lng-tts'}[ui.sub] || 'language'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return true; }
      if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return true; }
      if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return true; }
      if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return true; }
      if (ui.view === 'settings' && ui.sub) { ui.sub = ''; render(); viewport.querySelector('.settings-app').scrollTop = ui.settingsRootScroll; return true; }
      return false;
    },
    pointerdown(event, p, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      // PlatLogoActivity: the logo jumps to 1.25x, 2x, 3.25x and 5x (no tweening), then Nyandroid starts.
      if (event.target.closest('.easter-robot')) {
        const robot = event.target.closest('.easter-robot'); let count = 0;
        const zoom = () => { count++; if (data.settings.haptic !== false) navigator.vibrate?.(50 * count); robot.style.transform = `scale(${ICSNyandroid.zoomScale(count)})`; if (count <= 3) eggTimer = setTimeout(zoom, ICSNyandroid.LONG_PRESS); else requestAnimationFrame(() => { c.suppressReleaseClick(); ui.easterNyan = true; c.render(); }); };
        eggTimer = setTimeout(zoom, 2 * ICSNyandroid.LONG_PRESS);
      }
    },
    pointerup() { clearTimeout(eggTimer); },
    pointercancel() { clearTimeout(eggTimer); },
    // After every draw: Nyandroid runs while its sky is on screen.
    rendered(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps} = c;
      if (ui.nyandroid && !viewport.querySelector('[data-nyandroid]')?.isSameNode(ui.nyandroid.root)) { ui.nyandroid.stop(); ui.nyandroid = null; }
      const nyanRoot = viewport.querySelector('[data-nyandroid]');
      if (nyanRoot && !ui.nyandroid) requestAnimationFrame(() => { if (nyanRoot.isConnected && !ui.nyandroid) ui.nyandroid = {...ICSNyandroid.start(nyanRoot), root: nyanRoot}; });
    }
  });
})();
