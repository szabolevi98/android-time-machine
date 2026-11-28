/* Settings in the 4.4.4 shell (docs/plans/engine-migration.md): the main list and its pages — Wi-Fi with WPS,
   Wi-Fi Direct and Cast screen, Bluetooth, the system pages (settings-system.js) and the detail pages
   (settings-detail.js), Location, Daydream, Accessibility, Language & input (kk-language.js), Developer options
   (kk-devopts.js) and Process stats (kk-procstats.js), Music effects (kk-musicfx.js), certificates (kk-certinstall.js),
   About phone with the easter egg's taps, reset — their dialogs and menus, the switches and Back, moved out of
   simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {A11Y, HOLD_NAMES, appView, applyMagnification, apps, carrierName, clearAppData, clone, connectivityRow, connectivitySwitch, data, i18n, keepMoreContext, label, lockControls, openApp, overlayRoot, prefRow, render, renderOverlay, resetSimulator, row, safe, save, saveMusic, storeContext, storeUninstall, toast, toggleRow, ui, viewport, wifiNetworks, wirelessCheckRow, wirelessRow} = c;
    function renderSettings() {
      const s = ui.sub;
      if(s==='lock-setup')return lockControls.renderSetup();
      // Music effects: MusicFX's ActivityMusic (*-musicfx.js).
      if(s==='musicfx'){const fx=MusicFX.render(musicFxContext());return appView(fx.title,fx.body,'mfx-page',fx.right);}
      const system=ICSSystemSettings.render(data,ui,key=>i18n.t(key),i18n.locale());
      if(system)return appView(system.title,system.body,'sx-page',system.right);
      const detail=ICSSettingsDetail.render(data,ui,apps,key=>i18n.t(key));
      if(detail)return appView(detail.title,detail.body,'sd-page');
      if (s === 'wifi') return renderWifiSettings();
      if (s === 'wifi-display') { if (data.settings.wifiDisplay && data.settings.wifi && !ui.wfdScanUntil) startWfdScan(); return renderWifiDisplay(); }
      if (s === 'wifi-direct') { if (!ui.p2pSearchUntil) startP2pSearch(); return renderWifiDirect(); }
      if (s === 'bluetooth') return renderBluetoothSettings();
      /* 4.4 WallpaperTypeSettings: "Choose wallpaper from" lists every ACTION_SET_WALLPAPER activity with its label and
         icon. On KTU84P those are Gallery's Wallpaper activity, LivePicker, Photos' SetWallpaperActivity and the Google
         Now Launcher's GelWallpaperPickerActivity ("Wallpapers", ic_launcher_wallpaper). */
      if (s === 'wallpaper') {
        const sources = [['gallery-wallpaper', 'Gallery', 'gallery.png'], ['open-live-wallpapers', 'Live Wallpapers', 'kk-lwp-ic_launcher_live_wallpaper.png'], ['photos-set-wallpaper', 'Photos', 'photos.png'], ['open-wallpapers', 'Wallpapers', 'kk-gel-ic_launcher_wallpaper.png']].sort((a, b) => new Intl.Collator(i18n.locale()).compare(i18n.t(a[1]), i18n.t(b[1])));
        return appView('Choose wallpaper from', sources.map(([action, label, icon]) => `<button class="settings-row kk-wallpaper-type" data-action="${action}"><img class="kk-wallpaper-type-icon" src="assets/${icon}" alt=""><span class="row-copy">${safe(i18n.t(label))}</span></button>`).join(''));
      }
      if (s === 'about') return appView('About phone', `${row('Status', 'Phone number, signal, etc.', 'settings-sub', 'about-status')}${row('Legal information', '', 'settings-sub', 'about-legal')}${row('Model number', 'Nexus 5', 'noop', '')}${row('Android version', '4.4.4', 'about-tap', '')}${row('Baseband version', 'M8974A-2.0.50.1.16', 'noop', '')}${row('Kernel version', '3.4.0-gd59db4e\nandroid-build@vpbs1.mtv.corp.google.com #1\nMon Mar 17 15:16:36 PDT 2014', 'noop', '')}${row('Build number', 'KTU84P', 'developer-tap', '')}${row('SELinux status', i18n.t('Enforcing'), 'noop', '')}`, 'about-settings');
      if (s === 'about-status') return appView('Status', `${row('Battery status', 'Discharging', 'noop', '')}${row('Battery level', '78%', 'noop', '')}${row('Network', carrierName(), 'noop', '')}${row('Signal strength', data.settings.airplane ? '0 dBm  99 asu' : '-75 dBm  19 asu', 'noop', '')}${row('Phone number', 'Unknown', 'noop', '')}${row('Wi-Fi MAC address', '02:00:00:40:04:01', 'noop', '')}${row('Bluetooth address', data.settings.bluetooth ? '02:00:00:40:04:02' : 'Unavailable', 'noop', '')}`, 'about-settings');
      if (s === 'about-legal') return appView('Legal information', `${row('Open source licenses', 'Android Open Source Project', 'noop', '')}${row('Google legal', 'Offline demonstration', 'noop', '')}`, 'about-settings');
      if (s === 'about-safety') return appView('Safety information', `<div class="detail-pad"><p>Nexus 5 safety information is not available in this offline simulation.</p></div>`, 'about-settings');
      if (s === 'easter') return `<div class="kk-platlogo" data-kk-platlogo aria-label="Android KitKat"></div>`;
      if (s === 'dessert') return `<div class="kk-dessert" data-kk-dessert aria-label="Dessert Case"></div>`;
      if (s === 'wireless') return appView('Wireless & networks', `${wirelessCheckRow('Airplane mode', '', 'airplane')}<button class="settings-row wireless-row" data-action="kk-sms-app"><span class="row-copy">Default SMS app<small>Messaging</small></span></button>${wirelessCheckRow('NFC', 'Allow data exchange when the phone touches another device', 'nfc')}${wirelessRow('Android Beam', 'Ready to transmit app content via NFC', 'beam')}${wirelessRow('Tethering & portable hotspot', '', 'tethering')}${wirelessRow('VPN', '', 'vpn')}${wirelessRow('Mobile networks', '', 'mobile-networks')}`, 'wireless-more');
      if (s === 'beam') return appView('Android Beam', `${wirelessCheckRow('Android Beam', 'Ready to transmit app content via NFC', 'androidBeam')}`, 'wireless-more');
      if (s === 'brightness') return appView('Brightness', `<div class="detail-pad"><h3>Brightness</h3><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="Brightness"><p>${data.settings.brightness}%</p></div>`);
      if (s === 'sync') return appView('Accounts & sync', `${toggleRow('Auto-sync', 'Sync app data automatically', 'autoSync', '↻')}${label('ACCOUNTS')}${row('Google', 'demo@android.local', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '<img src="assets/setting-add-account.png" alt="">')}`);
      if(s==='sync-google'&&ui.kpSyncReturn)return appView('Google',KeepMore.syncPage(keepMoreContext()));
      if (s === 'sync-google') return appView('Google', `<div class="detail-pad"><h3>demo@android.local</h3><p>Sample account data is stored only in this browser.</p></div>${row('Sync Gmail', 'Last synced today', 'noop', '', '✉')}${row('Sync Calendar', 'Last synced today', 'noop', '', '▦')}${row('Sync Contacts', 'Last synced today', 'noop', '', '◉')}`);
      if (s === 'location') {
        const on = data.settings.locationAccess !== false, mode = locationMode();
        return appView('Location', `<div class="kk-location${on ? '' : ' jb-disabled-group'}"><button class="settings-row wireless-row" data-action="settings-sub" data-id="location-mode" ${on ? '' : 'disabled'}><span class="row-copy">Mode<small>${safe(i18n.t(on ? LOCATION_MODES[mode][0] : 'Location off'))}</small></span></button></div>${label('Recent location requests')}<div class="settings-row wireless-row kk-pref-disabled" aria-disabled="true"><span class="row-copy">No apps have requested location recently</span></div>`, 'wireless-more kk-location-page', connectivitySwitch('locationAccess', 'Location', true));
      }
      if (s === 'location-mode') return appView('Location mode', Object.entries(LOCATION_MODES).map(([id, [title, summary]]) => `<button class="settings-row wireless-row" data-action="kk-location-mode" data-id="${id}" role="radio" aria-checked="${locationMode() === id}"><span class="row-copy">${safe(title)}<small>${safe(summary)}</small></span><img class="holo-radio" src="assets/btn_radio_${locationMode() === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''), 'wireless-more kk-location-page');
      // PaymentSettings with no HCE payment services, and PrintSettingsFragment with no print services.
      if (s === 'nfc-payment') return appView('Tap & pay', `<div class="kk-empty-page"><img src="assets/setting-nfc-payment.png" alt=""><p>Pay with just a tap</p><button class="kk-link" data-action="toast" data-id="Learn more">Learn more</button></div>`, 'kk-empty', `<button class="jb-ab-action kk-ab-text" data-action="open-app" data-app="play-store">${safe(i18n.t('Find apps'))}</button>`);
      if (s === 'print') return appView('Printing', `${label('Print services')}<p class="kk-empty-text">No services installed</p>`, 'kk-print', `<button class="jb-ab-action" data-action="open-app" data-app="play-store" aria-label="${safe(i18n.t('Add service'))}"><img src="assets/jb-ic_menu_add.png" alt=""></button>`);
      if (s === 'daydream') return renderDaydreamSettings();
      if (s === 'reset-info') return appView('Factory data reset', `<div class="detail-pad"><h3>Erase local simulator data</h3><p>This clears the saved home screens, settings, and sample content for this version.</p><button class="small-button" data-action="factory-reset">Reset simulator</button></div>`);
      if (s === 'accessibility') return appView('Accessibility', `${label('SERVICES')}${row('No services installed', '', 'noop', '', '')}${label('SYSTEM')}${prefRow(A11Y('Magnification gestures'), A11Y(data.settings.magnification ? 'On' : 'Off'), 'settings-sub', 'a11y-magnification')}${toggleRow('Large text', '', 'largeText', 'A')}${toggleRow('Power button ends call', '', 'powerEndsCall', '⏻')}${toggleRow('Auto-rotate screen', '', 'rotate', '↻')}${toggleRow('Speak passwords', '', 'speakPasswords', '◉')}${prefRow(A11Y('Accessibility shortcut'), A11Y(data.settings.a11yShortcut ? 'On' : 'Off'), 'settings-sub', 'a11y-shortcut')}${prefRow('Text-to-speech output', '', 'lng-open', 'tts')}${prefRow(A11Y('Touch & hold delay'), A11Y(HOLD_NAMES[data.settings.longPressTimeout || 0]), 'a11y-hold')}`);
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
      if (s === 'development') return appView('Developer options', JBDeveloperOptions.render(data.settings, key => i18n.t(key), value => ICSSettingsDetail.animationScaleLabel(value), i18n.language), '', connectivitySwitch('developerEnabled', i18n.t('Developer options'), true));
      // Settings 4.3 language_settings.xml: Language opens its own list; keyboards, speech and pointer speed follow.
      const languageNames = {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'};
      if (s === 'language-pick') return appView('Language', Object.entries(languageNames).map(([code, name]) => `<button class="settings-row wireless-row" data-action="set-language" data-id="${code}" role="radio" aria-checked="${i18n.language === code}" data-no-translate><span class="row-copy">${name}</span><img class="holo-radio" src="assets/btn_radio_${i18n.language === code ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join(''));
      if (s === 'volumes' || s === 'ringtone' || s === 'sleep') return appView(s === 'volumes' ? 'Volumes' : s === 'ringtone' ? 'Phone ringtone' : 'Sleep', `<div class="detail-pad"><p>${s === 'ringtone' ? 'Orion is selected.' : s === 'sleep' ? 'Screen turns off after 30 seconds.' : 'Ringtone 70% · Media 60% · Alarm 80%'}</p></div>`);
      return appView('Settings', `${label('WIRELESS & NETWORKS')}${connectivityRow('Wi-Fi', 'wifi')}${connectivityRow('Bluetooth', 'bluetooth')}${row('Data usage', '', 'settings-sub', 'data', '◕')}${row('More...', '', 'settings-sub', 'wireless', null)}${label('DEVICE')}${row('Sound', '', 'settings-sub', 'sound', '♫')}${row('Display', '', 'settings-sub', 'display', '☼')}${row('Storage', '', 'settings-sub', 'storage', '▤')}${row('Battery', '', 'settings-sub', 'battery', '◧')}${row('Apps', '', 'settings-sub', 'apps', '▦')}${row('Tap & pay', '', 'settings-sub', 'nfc-payment', '◎')}${label('PERSONAL')}${row('Location', '', 'settings-sub', 'location', '◎')}${row('Security', '', 'settings-sub', 'security', '◉')}${row('Language & input', '', 'settings-sub', 'language', '◎')}${row('Backup & reset', '', 'settings-sub', 'backup', '↻')}${label('ACCOUNTS')}${row('Google', '', 'settings-sub', 'sync-google', '◎')}${row('Add account', '', 'toast', 'Demo account already added', '<img src="assets/setting-add-account.png" alt="">')}${label('SYSTEM')}${row('Date & time', '', 'settings-sub', 'date', '◷')}${row('Accessibility', '', 'settings-sub', 'accessibility', '◉')}${row('Printing', '', 'settings-sub', 'print', '▤')}${data.settings.developerUnlocked ? row('Developer options', '', 'settings-sub', 'development', '⚙') : ''}${row('About phone', '', 'settings-sub', 'about', '◉')}`);
    }
    // WifiP2pSettings: this device, then PEER DEVICES; Search for devices runs while the page is open.
    function renderWifiDirect() {
      const searching = data.settings.wifi && ui.p2pSearchUntil > Date.now();
      const right = `<button class="jb-ab-text" data-action="p2p-search" ${data.settings.wifi && !searching ? '' : 'disabled'}>${safe(i18n.t(searching ? 'Searching…' : 'Search for devices'))}</button><button class="connectivity-overflow" data-action="p2p-menu" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
      return appView('Wi-Fi Direct', `<div class="connectivity-page">${data.settings.wifi ? `<div class="settings-row network-row jb-p2p-device" aria-disabled="true"><span class="row-copy" data-no-translate>${safe(data.settings.p2pName || 'Android_4f3a')}</span></div>${label('PEER DEVICES')}` : ''}</div>`, '', right);
    }
    function startP2pSearch() { ui.p2pSearchUntil = Date.now() + 12000; clearTimeout(ui.p2pTimer); ui.p2pTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-direct') render(); }, 12100); }
    /* WifiDisplaySettings: the feature is DISABLED while Wi-Fi is off; when ON it scans, listing AVAILABLE DEVICES with a
       progress spinner and, once the scan ends without results, "No nearby wireless displays were found." */
    function startWfdScan() { ui.wfdScanUntil = Date.now() + 10000; clearTimeout(ui.wfdTimer); ui.wfdTimer = setTimeout(() => { if (ui.view === 'settings' && ui.sub === 'wifi-display') render(); }, 10100); }
    function renderWifiDisplay() {
      const on = !!data.settings.wifiDisplay && !!data.settings.wifi;
      const menu = `<button class="jb-ab-action" data-action="kk-cast-menu" aria-label="${safe(i18n.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
      return appView('Cast screen', `<div class="connectivity-page"><p class="wfd-empty">${safe(i18n.t('No nearby devices were found.'))}</p></div>`, '', menu);
    }

    function renderWifiSettings() {
      return appView('Wi-Fi', `<div class="connectivity-page">${data.settings.wifi ? allWifiNetworks().sort((a,b) => Number(b.name === data.settings.wifiNetwork) - Number(a.name === data.settings.wifiNetwork) || b.strength - a.strength || a.name.localeCompare(b.name, i18n.locale())).map(network => `<button class="settings-row network-row" data-action="wifi-network" data-id="${safe(network.name)}"><span class="row-copy">${safe(network.name)}<small>${data.settings.wifiNetwork === network.name ? i18n.t('Connected') : network.security === 'Open' ? i18n.t('Open network') : i18n.t('Secured with WPA2')}</small></span><span class="network-signal"><img src="assets/${network.security === 'Open' ? `ic_wifi_signal_${network.strength >= 3 ? 3 : 2}` : 'ic_wifi_lock_signal_4'}.png" alt=""></span></button>`).join('') : '<p class="connectivity-empty">Turn on Wi-Fi to see available networks</p>'}</div>`, '', connectivitySwitch('wifi', 'Wi-Fi', true) + `<button class="jb-ab-action" data-action="wifi-wps" data-id="pbc" aria-label="${safe(i18n.t('WPS Push Button'))}" ${data.settings.wifi ? '' : 'disabled'}><img src="assets/jb-ic_wps.png" alt=""></button><button class="jb-ab-action" data-action="wifi-add" aria-label="${safe(i18n.t('Add network'))}" ${data.settings.wifi ? '' : 'disabled'}><img src="assets/jb-ic_menu_add.png" alt=""></button>` + connectivityMenu('wifi'));
    }
    function renderBluetoothSettings() {
      const deviceRow = (name, paired) => `<button class="settings-row network-row" data-action="bluetooth-pair" data-id="${safe(name)}"><span class="network-signal"><img src="assets/${name === 'Car Audio' ? 'ic_bt_headphones_a2dp' : 'ic_bt_headset_hfp'}.png" alt=""></span><span class="row-copy">${safe(name)}${paired ? '<small>Paired</small>' : ''}</span>${paired ? '<img class="bt-config-icon" src="assets/ic_bt_config.png" alt="">' : ''}</button>`;
      return appView('Bluetooth', `<div class="connectivity-page">${data.settings.bluetooth ? `<button class="settings-row network-row" data-action="toggle-setting" data-id="bluetoothVisible"><span class="network-signal"><img src="assets/ic_bt_cellphone.png" alt=""></span><span class="row-copy">${safe(data.settings.bluetoothName || 'Nexus 4')}<small>${data.settings.bluetoothVisible ? i18n.t('Visible to nearby Bluetooth devices') : i18n.t('Not visible to other Bluetooth devices')}</small></span></button>${data.settings.pairedDevice ? `${label('PAIRED DEVICES')}${deviceRow(data.settings.pairedDevice, true)}` : ''}${label('AVAILABLE DEVICES')}${ui.bluetoothScanned ? ['Wireless Headset','Car Audio'].filter(name => name !== data.settings.pairedDevice).map(name => deviceRow(name, false)).join('') : '<p class="connectivity-empty small">Tap Scan to find nearby devices</p>'}` : '<p class="connectivity-empty">Turn on Bluetooth to see nearby devices</p>'}</div>`, '', connectivitySwitch('bluetooth', 'Bluetooth', true) + connectivityMenu('bluetooth'));
    }
    /* WpsDialog: "Starting WPS…", then the push-button or PIN instructions with ic_wps; the timeout bar advances once a
       second up to WPS_TIMEOUT_S (120 s), after which the failure message and an OK button remain. */
    function wpsDialog() {
      const wps = ui.wps || {mode: 'pbc', start: Date.now(), pin: '30521874'}, elapsed = Math.floor((Date.now() - wps.start) / 1000), done = elapsed >= 120;
      const text = done ? i18n.t('WPS failed. Please try again in a few minutes.') : elapsed < 1 ? i18n.t('Starting WPS…') : wps.mode === 'pin' ? AndroidStrings.format(i18n.t('Enter pin %1$s on your Wi-Fi router. The setup can take up to two minutes to complete.'), wps.pin) : i18n.t('Press the Wi-Fi Protected Setup button on your router. It may be called "WPS" or contain this symbol:');
      return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert jb-wps" role="dialog" aria-label="${safe(i18n.t('Wi-Fi Protected Setup'))}" data-no-translate><h3 class="ga-title">${safe(i18n.t('Wi-Fi Protected Setup'))}</h3><div class="jb-wps-body"><p>${safe(text)}</p><img src="assets/jb-ic_wps.png" alt=""><span class="jb-progress-h" role="progressbar" aria-valuemin="0" aria-valuemax="120" aria-valuenow="${Math.min(120, elapsed)}"><i style="width:${Math.min(120, elapsed) / 120 * 100}%"></i></span><button type="button" class="jb-holo-button" data-action="close-overlay">${safe(i18n.t(done ? 'OK' : 'Cancel'))}</button></div></div>`;
    }
    function renderDaydreamSettings() {
      const on = !!data.settings.daydream, current = data.settings.daydreamType || 'clock', when = data.settings.daydreamWhen || 'charging';
      const whenLabel = {charging: 'While charging', docked: 'While docked', either: 'Either'}[when];
      // DessertCaseDream is enabled once the Dessert Case has been opened from the easter egg.
      const list = data.settings.dessertCaseUnlocked ? [...dreams, ['dessert', 'Dessert Case']].sort((a, b) => a[1].localeCompare(b[1])) : dreams;
      return appView('Daydream', `${toggleRow('Daydream', on ? whenLabel : 'Off', 'daydream')}${on ? `${list.map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}${label('')}${row('Start now', '', 'dream-start', '')}${row('When to daydream', i18n.t(whenLabel), 'dream-when', '')}` : `<div class="detail-pad"><p>${safe(i18n.t('To control what happens when the phone is docked and/or sleeping, turn Daydream on.'))}</p></div>`}`);
    }

    const allWifiNetworks = () => [...wifiNetworks, ...(data.savedWifiNetworks || [])];
    const connectivityMenu = kind => `<button class="connectivity-overflow" data-action="connectivity-menu" data-id="${kind}" aria-label="More options"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button>`;
    const langContext = () => ({data, ui, root: viewport, language: i18n.language, locale: i18n.locale(), languageName: {en: 'English', hu: 'Magyar', de: 'Deutsch', fr: 'Français', es: 'Español'}[i18n.language],
      save, render, renderOverlay, toast: message => toast(i18n.t(message)),
      openVoice: () => { openApp('google-search'); ui.sub = 'settings'; ui.ksStack = []; ui.ksPage = 'voice'; ui.ksDialog = null; ui.voiceFromSettings = true; render(); }});
    const devContext = () => ({data, ui, root: viewport, save, render, renderOverlay, toast: message => toast(message), t: key => i18n.t(key), language: i18n.language});
    const procStatsContext = () => ({data, ui, save, render, renderOverlay, toast: message => toast(message), language: i18n.language, locale: i18n.locale(), appIcon: id => `<img src="assets/${id === 'play-store' ? 'play-store.svg' : id + '.png'}" alt="">`});
    const musicFxContext = () => ({data, ui, language: i18n.language, locale: i18n.locale(), save, render, toast: message => toast(message)});
    // Advanced Wi-Fi's Install certificates (*-certinstall.js) and its dialogs.
    const certContext = () => ({ui, data, language: i18n.language, root: overlayRoot, save, toast: message => toast(message),
      open: () => { ui.overlay = 'cert-install'; renderOverlay(); overlayRoot.querySelector('[data-cert-name]')?.focus(); }, close: () => { ui.overlay = ''; renderOverlay(); },
      lockSettings: () => { ui.sub = 'security'; render(); }});
    const dreams = [['clock', 'Clock'], ['colors', 'Colors'], ['photoframe', 'Photo Frame']];
    const LOCATION_MODES = {high: ['High accuracy', 'Use GPS, Wi‑Fi, and mobile networks to determine location'], battery: ['Battery saving', 'Use Wi‑Fi and mobile networks to determine location'], device: ['Device only', 'Use GPS to determine your location']};
    const locationMode = () => data.settings.gps && data.settings.networkLocation ? 'high' : data.settings.gps ? 'device' : 'battery';
    return {
      render() {
        return renderSettings();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        // Gmail's label settings, Days of mail to sync and the vacation responder (gmail.js).
        if (action.startsWith('lng-') && InputLanguage.handle(action, id, langContext())) return;
        if (action.startsWith('dev-') && JBDeveloperOptions.handle(action, id, devContext())) return;
        if (action.startsWith('ps-') && ProcStats.handle(action, id, procStatsContext())) return;
        if (action.startsWith('mfx-') && MusicFX.handle(action, id, musicFxContext())) return;
        if (action.startsWith('cert-') && CertInstall.handle(action, id, certContext())) return;
        switch (action) {
          case 'dream-pick': data.settings.daydreamType = id; save(); render(); break;
          case 'dream-when': ui.overlay = 'dream-when'; renderOverlay(); break;
          case 'dream-when-pick': data.settings.daydreamWhen = id; save(); ui.overlay = ''; render(); break;
          case 'dream-start': ui.overlay = 'dream'; ui.dreamKey = ''; renderOverlay(); break;
          case 'kk-location-mode': data.settings.gps = id !== 'battery'; data.settings.networkLocation = id !== 'device'; save(); render(); break;
          case 'kk-sms-app': ui.overlay = 'kk-sms-app'; renderOverlay(); break;
          case 'kk-cast-menu': ui.overlay = 'kk-cast-menu'; renderOverlay(); break;
          case 'kk-cast-enable': data.settings.wifiDisplay = !data.settings.wifiDisplay; save(); ui.overlay = ''; render(); break;
          case 'settings-sub': ui.overlay = ''; if (id === 'development' && !data.settings.developerUnlocked) break; if (ui.view === 'settings' && !ui.sub) ui.settingsRootScroll = viewport.querySelector('.settings-app')?.scrollTop || 0; ui.sub = id; render(); break;
          case 'sd-dialog': ui.settingsField=id;ui.overlay='sd-dialog';renderOverlay();break;
          case 'sd-apps-tab': ui.settingsAppsTab=id;render();break;
          case 'sd-app-info': ui.settingsApp=id;ui.sub='app-info';render();break;
          // Uninstall on a store app's App info: UninstallerActivity's question, then the app goes and App info closes.
          case 'sd-uninstall': { const r = ui.settingsApp, m = StoreHost.module(r); if (!m) break; storeContext().dialog({title: m.title, message: JBPlay.text(i18n.language, 'Do you want to uninstall this app?'), buttons: [{label: i18n.t('Cancel')}, {label: i18n.t('OK'), action: () => { storeUninstall(r.slice(6)); save(); ui.sub = 'apps'; render(); }}]}); break; }
          case 'sd-data-app': ui.settingsApp=id;ui.sub='data-app';render();break;
          case 'sd-storage-open': if(id==='gallery'||id==='music')openApp(id==='music'?'play-music':id);else{ui.sub=id;if(id==='apps')ui.settingsAppsTab='All';render();}break;
          case 'sd-battery-history': ui.sub='battery-history';render();break;
          case 'sd-battery-app': ui.batteryDetail=id;ui.sub='battery-detail';render();break;
          case 'sd-clear-cache': data.appCacheCleared=[...new Set([...(data.appCacheCleared||[]),ui.settingsApp])];save();render();break;
          case 'sd-clear-data': ui.overlay='sd-clear-data';renderOverlay();break;
          case 'sd-confirm-clear': clearAppData(ui.settingsApp);ui.overlay='';render();toast('App data cleared');break;
          case 'sd-force-stop': if(ui.settingsApp==='phone')ui.activeCall=null;if(ui.settingsApp==='music'){ui.music.playing=false;saveMusic();}ui.recent=ui.recent.filter(app=>app!==ui.settingsApp);delete ui.recentState?.[ui.settingsApp];delete ui.recentSnapshots[ui.settingsApp];toast('App stopped');break;
          case 'wifi-wps': ui.wps = {mode: id === 'pin' ? 'pin' : 'pbc', start: Date.now(), pin: String(Math.floor(10000000 + Math.random() * 89999999))}; ui.overlay = 'wifi-wps'; renderOverlay(); break;
          case 'p2p-search': startP2pSearch(); render(); break;
          case 'p2p-menu': ui.overlay = 'p2p-menu'; renderOverlay(); break;
          case 'p2p-rename': ui.overlay = 'p2p-rename'; renderOverlay(); break;
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
          case 'sx-dialog': if(id==='screen-lock'){lockControls.open();break;}ui.systemField=id;ui.systemError='';ui.systemValues=null;ui.overlay='sx-dialog';renderOverlay();break;
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
          case 'dev-info': toast(i18n.t('This feature is not part of the simulator.')); break;
          // Developer options' ListPreferences: the choice is kept in data.settings['dev_<key>'] (index into the entries).
          case 'dev-list': ui.devList = id; ui.overlay = 'dev-list'; renderOverlay(); break;
          case 'dev-list-pick': { const cut = id.lastIndexOf(':'); data.settings[id.slice(0, cut)] = Number(id.slice(cut + 1)); save(); ui.overlay = ''; renderOverlay(); render(); break; }
          case 'toggle-setting': {
            if (id === 'magnification' && data.settings.magnification) { ui.magnify = null; applyMagnification(); }
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
          case 'factory-reset': if (confirm(i18n.t('Reset all local KitKat simulator data?'))) resetSimulator(); break;
          case 'about-tap':
            ui.aboutTapTimes = [...(ui.aboutTapTimes || []), performance.now()].slice(-3);
            if (ui.aboutTapTimes.length === 3 && ui.aboutTapTimes[2] - ui.aboutTapTimes[0] <= 500) { ui.sub = 'easter'; ui.easterNyan = false; ui.aboutTapTimes = []; render(); }
            break;
          case 'developer-tap': {
            if (data.settings.developerUnlocked) { toast('No need, you are already a developer.'); break; }
            const remaining = 7 - ++ui.buildTaps;
            if (remaining <= 0) { data.settings.developerUnlocked = true; ui.buildTaps = 0; save(); toast('You are now a developer!'); }
            else if (remaining < 5) toast(AndroidStrings.format(i18n.t(AndroidStrings.quantity(remaining) === 'one' ? 'You are now %d step away from being a developer.' : 'You are now %d steps away from being a developer.'), remaining));
            break;
          }
          case 'a11y-hold': ui.overlay = 'a11y-hold'; renderOverlay(); break;
          case 'a11y-hold-pick': data.settings.longPressTimeout = Number(id); ui.overlay = ''; save(); renderOverlay(); render(); break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
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
        if (form.dataset.form === 'p2p-rename') {
          const name = String(values.get('name') || '').trim();
          if (!name) return true;
          data.settings.p2pName = name; save(); ui.overlay = ''; render(); return true;
        }
        if (form.dataset.form === 'bluetooth-rename') {
          const name = String(values.get('name') || '').trim();
          if (!name) return true;
          data.settings.bluetoothName = name;
          save(); ui.overlay = ''; render(); return true;
        }
        switch (form.dataset.form) {
          case 'sd-volumes': for(const key of ['mediaVolume','ringVolume','alarmVolume'])data.settings[key]=Math.max(0,Math.min(100,Number(values.get(key))));save();ui.overlay='';render();break;
          case 'sd-choice': {const choice=String(values.get('choice'));if(ui.settingsField==='sleep')data.settings.sleep=Number(choice);else if(['windowScale','transitionScale','animatorScale'].includes(ui.settingsField))data.settings[ui.settingsField]=Number(choice);else if(ui.settingsField==='font'){data.settings.fontSize=choice;data.settings.largeText=choice==='large'||choice==='huge';}else if(ui.settingsField==='silent'){data.settings.silent=choice!=='off';data.settings.silentMode=choice;}else data.settings[ui.settingsField]=choice;save();ui.overlay='';render();break;}
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.matches('[data-lng-seek]') && InputLanguage.input(event.target, langContext())) return true;
        if (event.target.matches('[data-mfx]') && MusicFX.input(event.target, musicFxContext())) return true;
        if(event.target.dataset.field==='data-cycle'){ui.dataCycle=event.target.value;render();return true;}
        return false;
      },
      overlay() {
        if (ui.overlay === 'kk-cast-menu') {
          overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="kk-cast-enable" role="menuitemcheckbox" aria-checked="${!!data.settings.wifiDisplay}" class="kk-check-item">${safe(i18n.t('Enable wireless display'))}<img src="assets/btn_check_${data.settings.wifiDisplay ? 'on' : 'off'}_holo_dark.png" alt=""></button></div>`;
        } else if (ui.overlay === 'kk-sms-app') {
          // SmsDefaultDialog-style list preference: the SMS-capable apps (only Messaging in AOSP).
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Default SMS app'))}"><h3>${safe(i18n.t('Default SMS app'))}</h3><button class="settings-row jb-dream-row" data-action="close-overlay" role="radio" aria-checked="true"><span class="row-copy">${safe(i18n.t('Messaging'))}</span><img class="holo-radio" src="assets/btn_radio_on_holo_dark.png" alt=""></button><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
        } else if (ui.overlay === 'dev-list') {
          overlayRoot.innerHTML = JBDeveloperOptions.dialog(ui.devList, data.settings, key => i18n.t(key), i18n.language);
        } else if (ui.overlay === 'a11y-hold') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(A11Y('Touch & hold delay'))}"><h3>${safe(A11Y('Touch & hold delay'))}</h3>${HOLD_NAMES.map((name, i) => `<button class="settings-row wireless-row" data-action="a11y-hold-pick" data-id="${i}" role="radio" aria-checked="${(data.settings.longPressTimeout || 0) === i}"><span class="row-copy">${safe(A11Y(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.longPressTimeout || 0) === i ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
        } else if (ui.overlay === 'dream-when') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('When to daydream'))}"><h3>${safe(i18n.t('When to daydream'))}</h3>${[['docked', 'While docked'], ['charging', 'While charging'], ['either', 'Either']].map(([id, name]) => `<button class="settings-row jb-dream-row" data-action="dream-when-pick" data-id="${id}" role="radio" aria-checked="${(data.settings.daydreamWhen || 'charging') === id}"><span class="row-copy">${safe(i18n.t(name))}</span><img class="holo-radio" src="assets/btn_radio_${(data.settings.daydreamWhen || 'charging') === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
        } else if (ui.overlay.startsWith('ps-')) {
          overlayRoot.innerHTML = ProcStats.overlay(procStatsContext());
        } else if (ui.overlay === 'lng-dialog') {
          overlayRoot.innerHTML = InputLanguage.overlay(langContext());
        } else if (ui.overlay === 'cert-install') {
          overlayRoot.innerHTML = CertInstall.overlay(certContext());
        } else if (ui.overlay==='sx-dialog') {
          overlayRoot.innerHTML=ICSSystemSettings.overlay(data,ui,key=>i18n.t(key));
        } else if (ui.overlay.startsWith('sd-')) {
          overlayRoot.innerHTML = ICSSettingsDetail.overlay(data,ui,key=>i18n.t(key));
        } else if (ui.overlay === 'connectivity-menu') {
          const wifi = ui.connectivityMenu === 'wifi';
          const enabled = data.settings[wifi ? 'wifi' : 'bluetooth'];
          overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${wifi ? `<button data-action="wifi-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="wifi-wps" data-id="pin" ${enabled ? '' : 'disabled'}>WPS Pin Entry</button><button data-action="settings-sub" data-id="wifi-direct" ${enabled ? '' : 'disabled'}>Wi-Fi Direct</button><button data-action="settings-sub" data-id="wifi-advanced">Advanced</button>` : `<button data-action="bluetooth-scan" ${enabled ? '' : 'disabled'}>Scan</button><button data-action="bluetooth-rename" ${enabled ? '' : 'disabled'}>Rename phone</button><button data-action="bluetooth-files">Show received files</button>`}</div>`;
        } else if (ui.overlay === 'wifi-wps') {
          overlayRoot.innerHTML = wpsDialog();
        } else if (ui.overlay === 'p2p-menu') {
          overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu"><button data-action="p2p-rename" ${data.settings.wifi ? '' : 'disabled'}>${safe(i18n.t('Rename device'))}</button></div>`;
        } else if (ui.overlay === 'p2p-rename') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="p2p-rename" role="dialog" aria-label="Rename device"><h3>Rename device</h3><input name="name" aria-label="Device name" maxlength="32" required value="${safe(data.settings.p2pName || 'Android_4f3a')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">OK</button></div></form>`;
        } else if (ui.overlay === 'wifi-add') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="wifi-add" role="dialog" aria-label="Add network"><h3>Add network</h3><label>Network SSID<input name="ssid" required maxlength="32" autocomplete="off"></label><label>Security<select name="security"><option value="Open" data-i18n="None">None</option><option value="WPA2">WPA/WPA2 PSK</option></select></label><label>Password<input name="password" type="password" autocomplete="off"></label><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
        } else if (ui.overlay === 'bluetooth-pair') {
          const paired = data.settings.pairedDevice === ui.bluetoothTarget;
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Bluetooth pairing request"><h3>${safe(ui.bluetoothTarget)}</h3>${paired ? '<p>Paired</p>' : '<p>Bluetooth pairing request</p><p>Passkey: 123456</p>'}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button><button data-action="bluetooth-confirm">${paired ? 'Unpair' : 'Pair'}</button></div></div>`;
        } else if (ui.overlay === 'bluetooth-rename') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog" data-form="bluetooth-rename" role="dialog" aria-label="Rename phone"><h3>Rename phone</h3><input name="name" aria-label="Device name" maxlength="40" required value="${safe(data.settings.bluetoothName || 'Nexus 4')}"><div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Rename</button></div></form>`;
        } else if (ui.overlay === 'bluetooth-files') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Received files"><h3>Received files</h3><p>No received files</p><div class="settings-dialog-actions"><button data-action="close-overlay">OK</button></div></div>`;
        } else if (ui.overlay === 'wifi-dialog') {
          const network = allWifiNetworks().find(item => item.name === ui.wifiTarget);
          const connected = data.settings.wifiNetwork === ui.wifiTarget;
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(ui.wifiTarget)}"><h3>${safe(ui.wifiTarget)}</h3><p>${safe(network?.security || 'WPA2')}</p>${connected ? '<p>Connected</p>' : network?.security !== 'Open' ? '<label>Password<input class="wifi-password" type="password" autocomplete="off"></label>' : ''}<div class="settings-dialog-actions"><button data-action="close-overlay">Cancel</button>${connected ? '<button data-action="wifi-forget">Forget</button>' : '<button data-action="wifi-connect">Connect</button>'}</div></div>`;
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'settings' && ui.sub.startsWith('lng-') && !ui.overlay && InputLanguage.back(langContext())) return true;
        if (ui.view === 'settings' && ui.sub === 'dev-backup-pw' && !ui.overlay) { ui.sub = 'development'; render(); return true; }
        if (ui.view === 'settings' && ui.sub.startsWith('dev-procstats') && !ui.overlay) { ui.sub = ui.sub === 'dev-procstats' ? 'development' : 'dev-procstats'; render(); return true; }
        if (ui.view === 'settings' && ui.sub === 'musicfx' && !ui.overlay) { ui.mfxSpin = false; ui.sub = 'sound'; render(); return true; }
        if (ui.chromeReturn && ui.view === ui.chromeReturn.view && ui.sub === ui.chromeReturn.sub && !ui.overlay) { const back = ui.chromeReturn; ui.chromeReturn = null; openApp('chrome'); ui.sub = 'chrome-settings'; ui.chromePrefStack = back.stack; render(); return true; }
        if (ui.view === 'settings' && ['a11y-magnification', 'a11y-shortcut'].includes(ui.sub) && !ui.overlay) { ui.sub = 'accessibility'; render(); return true; }
        if(ui.view==='settings' && ui.kpSyncReturn && ui.sub==='sync-google'){ui.kpSyncReturn=false;openApp('keep',true);ui.kpScreen='settings';render();return true;}
        if(ui.view==='settings' && ['apn','operators','tether-help','device-admin','wifi-direct','wifi-display','location-mode'].includes(ui.sub)){ui.sub={apn:'mobile-networks',operators:'mobile-networks','tether-help':'tethering','device-admin':'security','wifi-direct':'wifi','wifi-display':'display','location-mode':'location'}[ui.sub];render();return true;}
        if(ui.view==='settings' && ['app-info','data-app','battery-history','battery-detail','storage-misc','language-pick'].includes(ui.sub)){ui.sub={'language-pick':'language','app-info':'apps','data-app':'data','battery-history':'battery','battery-detail':'battery','storage-misc':'storage'}[ui.sub];render();return true;}
        if (ui.view === 'settings' && ['easter', 'dessert', 'about-status', 'about-legal', 'about-safety'].includes(ui.sub)) { ui.sub = 'about'; render(); return true; }
        if (ui.view === 'settings' && ['vpn', 'tethering', 'beam', 'mobile-networks'].includes(ui.sub)) { ui.sub = 'wireless'; render(); return true; }
        if (ui.view === 'settings' && ui.sub === 'wifi-advanced') { ui.sub = 'wifi'; render(); return true; }
        if (ui.view === 'settings' && ui.sub === 'sync-google') { ui.sub = 'sync'; render(); return true; }
        if (ui.view === 'settings' && ui.sub === 'reset-info') { ui.sub = 'backup'; render(); return true; }
        if (ui.view === 'settings' && ['brightness','wallpaper','sleep'].includes(ui.sub)) { ui.sub = 'display'; render(); return true; }
        if (ui.view === 'settings' && ['volumes','ringtone'].includes(ui.sub)) { ui.sub = 'sound'; render(); return true; }
        return false;
      },
      backAlways() {
        if(ui.view==='settings'&&ui.sub==='lock-setup'){lockControls.cancel();return true;}
        return false;
      },
      second(now) {
        if (ui.overlay === 'wifi-wps') renderOverlay();
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back(),
    backAlways: c => scope(c).backAlways(),
    second: (now, c) => scope(c).second(now)
  };
  for (const id of ['settings']) KK.register(id, spec);
})();
