/* Android 7.1.2 Settings: More (WirelessSettings), Tethering & portable hotspot, VPN, Network settings reset, Android
   Beam, Tap & pay, Screen saver and Wallpaper (SettingsGoogle N2G48C). The logic is 6.0.1's (its wireless, tethering,
   payment, dream and wallpaper hooks); N2G48C's classes decide what shows:
   - WirelessSettings.onCreate on the 6P: Airplane mode, NFC (an NfcAdapter), Android Beam, Tethering & portable hotspot
     (getTetheringLabel: USB, Wi-Fi and Bluetooth all supported), VPN, Cellular networks, Network settings reset; Wi-Fi
     calling goes (ImsManager: not provisioned), so do Manage mobile plan (config_show_mobile_plan false), WiMAX and the
     proxy (removed in code). NFC, Android Beam and VPN depend on Airplane mode (airplane_mode_toggleable_radios).
   - TetherSettings: USB tethering greyed out ("USB not connected"), Portable Wi-Fi hotspot (turning on / off for a
     moment, then "Portable hotspot … active"; greyed out in airplane mode), Set up Wi-Fi hotspot (WifiApDialog: Network
     name, Security None / WPA2 PSK, the password with "Must have at least 8 characters" and Show password, AP Band 2.4 /
     5 GHz on the dual band 6P), Bluetooth tethering (turns Bluetooth on first); with Data Saver on they are disabled and
     tether_settings_disabled_on_data_saver shows under them.
   - VpnSettings: "No VPNs added." with the + action (vpn_create) opening ConfigDialog (Name, Type PPTP …, Server address).
   - ResetNetwork / ResetNetworkConfirm: reset_network.xml (the description 12 dp in, Reset settings), then "Reset?" with
     reset_network_final_desc; the toast reset_network_complete_toast.
   - AndroidBeam: the switch bar and android_beam_explained (textAppearanceMedium, 20 dp down).
   - PaymentSettings: NfcPaymentPreference ("Payment default": CardEmulationManager made the image's only payment service,
     Android Pay, the default; the preference_widget_settings gear) and NfcForegroundPreference (Use default: Always /
     Except when another payment app is open); the overflow's How it works.
   - DreamSettings: the switch bar (screensaver_enabled, config_dreamsEnabledByDefault), DreamBackend's dreams of the
     image sorted by caption (Clock's Screensaver with its settings, BasicDreams' Colors, Photos' PhotosDreamService with
     its settings; SystemUI's DessertCaseDream is disabled) in dream_info_row.xml (the 48 dp icon, the Medium caption, the
     radio, nav_divider and ic_settings); the overflow's Start now and When to start screen saver (While docked by default).
   - WallpaperTypeSettings: the activities handling SET_WALLPAPER: Live Wallpapers and Photos' Set wallpaper (Velvet's
     GelWallpaperPickerActivity is disabled, launcher_default_enabled false). */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks;
  const S = c => c.data.settings;
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const appLabel = (c, id) => { const a = NG.appsData?.[id]; return a ? a.label[c.lang] || a.label.en : id; };
  let core = null;
  NG.register('settings-system', {app: false, init(c) { core = c; }, render: () => ''});
  Object.assign(NG.settingsFragments, {'com.android.settings.nfc.AndroidBeam': 'beam', 'com.android.settings.ResetNetwork': 'reset-network',
    'com.android.settings.vpn2.VpnSettings': 'vpn', 'com.android.settings.DreamSettings': 'dream', 'com.android.settings.WallpaperTypeSettings': 'wallpaper-type'});

  H.wireless_settings = {
    hidden: ['wifi_calling_settings', 'manage_mobile_plan', 'wimax_settings', 'proxy_settings'],
    get(c, key) {
      const s = S(c);
      if (key === 'toggle_airplane') return !!s.airplane;
      if (key === 'toggle_nfc') return s.nfc ?? true;
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'toggle_airplane') { NG.system.setAirplane(c, v); return true; }
      if (key === 'toggle_nfc') { s.nfc = v; return true; }
      return false;
    },
    disabled: (c, key) => (['toggle_nfc', 'android_beam_settings', 'vpn_settings'].includes(key) && !!S(c).airplane) || (key === 'android_beam_settings' && !(S(c).nfc ?? true)),
    summary(c, key) {
      if (key === 'android_beam_settings') return T().t((S(c).nfc ?? true) && (S(c).beam ?? true) ? 'android_beam_on_summary' : 'android_beam_off_summary');
      return undefined;
    },
    click(c, key, n) {
      if (key === 'mobile_network_settings') { NG.settingsGo(c, 'missing:com.android.phone.MobileNetworkSettings', NG.settingsStr(n.title)); return true; }
      return false;
    }
  };

  // -- Tethering ----------------------------------------------------------------------------------------------------
  const hotspot = c => NG.system.hotspotConfig(c);
  const apName = c => hotspot(c).ssid || T().t('framework/wifi_tether_configure_ssid_default');
  function apDialog(c) {
    const t = T(), cfg = hotspot(c), opts = (list, sel) => list.map((o, i) => `<option${i === sel ? ' selected' : ''}>${c.safe(o)}</option>`).join('');
    const html = `<div class="ngwf-dialog"><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_ssid'))}</span><input class="ngwf-edit ngwf-ssid" type="text" maxlength="32" value="${c.safe(apName(c))}" placeholder="${c.safe(t.t('wifi_ssid_hint'))}" autocomplete="off" spellcheck="false"></div>
      <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_security'))}</span><select class="ngwf-spinner ngwf-sec">${opts(t.t('wifi_ap_security'), cfg.security)}</select></div>
      <div class="ngwf-secfields"${cfg.security ? '' : ' hidden'}><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_password'))}</span><input class="ngwf-edit ngwf-pw" type="password" maxlength="63" value="${c.safe(cfg.password)}" autocomplete="off" spellcheck="false"></div>
      <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('credentials_password_too_short'))}</span><label class="ngwf-check"><input type="checkbox" class="ngwf-show"><i class="ngst-check"></i><span>${c.safe(t.t('wifi_show_password'))}</span></label></div></div>
      <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('wifi_ap_band_config'))}</span><select class="ngwf-spinner ngwf-band">${opts(t.t('wifi_ap_band_config_full'), cfg.band)}</select></div></div>`;
    let form = null;
    c.dialog({title: t.t('wifi_tether_configure_ap_text'), html, buttons: [{label: t.t('wifi_cancel')}, {label: t.t('wifi_save'), action: c => {
      if (!form) return;
      Object.assign(hotspot(c), form); c.save();
      if (S(c).hotspot) { NG.system.setHotspot(c, false); setTimeout(() => NG.system.setHotspot(c, true), 1300); }
      c.render();
    }}], mount(c, win) {
      const ssid = win.querySelector('.ngwf-ssid'), sec = win.querySelector('.ngwf-sec'), pw = win.querySelector('.ngwf-pw'), band = win.querySelector('.ngwf-band');
      const save = [...win.querySelectorAll('.ngdlg-button')].at(-1);
      const sync = () => {
        win.querySelector('.ngwf-secfields').hidden = sec.selectedIndex === 0;
        form = {ssid: ssid.value, security: sec.selectedIndex, password: pw.value, band: band.selectedIndex};
        if (save) save.disabled = !ssid.value || (sec.selectedIndex === 1 && pw.value.length < 8);
      };
      win.addEventListener('input', sync); win.addEventListener('change', sync);
      win.querySelector('.ngwf-show').addEventListener('change', e => { pw.type = e.target.checked ? 'text' : 'password'; });
      sync(); setTimeout(() => ssid.focus(), 50);
    }});
  }
  H.tether_prefs = {
    hide: (c, key) => key === 'disabled_on_data_saver' && !S(c).dataSaver,
    get(c, key) {
      const s = S(c);
      if (key === 'usb_tether_settings') return false;
      if (key === 'enable_wifi_ap') return !!s.hotspot;
      if (key === 'enable_bluetooth_tethering') return !!(s.btTether && s.bluetooth);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'enable_wifi_ap') { NG.system.setHotspot(c, v); setTimeout(() => c.ui.view === 'settings' && c.render(), 1300); return true; }
      if (key === 'enable_bluetooth_tethering') { s.btTether = v; if (v && !s.bluetooth) { NG.system.setBluetooth(c, true); setTimeout(() => c.render(), 1100); } return true; }
      return key === 'usb_tether_settings';
    },
    disabled(c, key) {
      const st = NG.system.hotspotState(c), saver = !!S(c).dataSaver;
      if (key === 'usb_tether_settings') return true;
      if (key === 'enable_wifi_ap') return saver || !!S(c).airplane || st === 'enabling' || st === 'disabling';
      if (key === 'enable_bluetooth_tethering') return saver || NG.system.live.btTurningOn > Date.now();
      if (key === 'wifi_ap_ssid_and_security') return saver;
      return false;
    },
    summary(c, key) {
      const t = T(), s = S(c), st = NG.system.hotspotState(c);
      if (key === 'usb_tether_settings') return t.t('usb_tethering_unavailable_subtext');
      if (key === 'enable_wifi_ap') return st === 'enabling' ? t.t('wifi_tether_starting') : st === 'disabling' ? t.t('wifi_tether_stopping') : st === 'on' ? t.fmt('wifi_tether_enabled_subtext', null, apName(c)) : '';
      if (key === 'wifi_ap_ssid_and_security') return t.fmt('wifi_tether_configure_subtext', null, apName(c), t.t('wifi_ap_security')[hotspot(c).security]);
      if (key === 'enable_bluetooth_tethering') return NG.system.live.btTurningOn > Date.now() ? t.t('bluetooth_turning_on') : t.t(s.btTether && s.bluetooth ? 'bluetooth_tethering_available_subtext' : 'bluetooth_tethering_off_subtext');
      return undefined;
    },
    click(c, key) { if (key === 'wifi_ap_ssid_and_security') { apDialog(c); return true; } return false; }
  };

  // -- VPN, network reset, Android Beam --------------------------------------------------------------------------
  NG.settingsScreens.vpn = {
    title: () => T().t('vpn_title'),
    actions: c => `<button type="button" class="ngst-ab-btn" data-action="ngsx-vpnadd" aria-label="${c.safe(T().t('vpn_create'))}"><i style="-webkit-mask-image:url('assets/st-ic_menu_add_white.svg');mask-image:url('assets/st-ic_menu_add_white.svg')"></i></button>${NG.menu.button(c)}`,
    render(c) {
      const t = T(), list = S(c).vpns || [];
      if (!list.length) return `<div class="ngst-emptyview center">${c.safe(t.t('vpn_no_vpns_added'))}</div>`;
      return `<div class="ngst-list">${NG.settingsJoinRows(list.map((v, i) => ({html: NG.settingsRow(c, {title: v.name, summary: t.t('vpn_states')[0], action: 'ngsx-vpn', data: ` data-i="${i}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ng-menu') { c.menu([{label: t.t('help_label'), action: c => c.open('help', 'settings')}], el); return true; }
      if (name === 'ngsx-vpn') return true;
      if (name !== 'ngsx-vpnadd') return false;
      let form = {name: '', type: 0, server: ''};
      const types = t.t('vpn_types');
      c.dialog({title: t.t('vpn_edit'), html: `<div class="ngwf-dialog"><div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('vpn_name'))}</span><input class="ngwf-edit ngsx-vname" type="text"></div>
        <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('vpn_type'))}</span><select class="ngwf-spinner ngsx-vtype">${types.map(o => `<option>${c.safe(o)}</option>`).join('')}</select></div>
        <div class="ngwf-item"><span class="ngwf-label">${c.safe(t.t('vpn_server'))}</span><input class="ngwf-edit ngsx-vserver" type="text"></div></div>`,
        buttons: [{label: t.t('vpn_cancel')}, {label: t.t('vpn_save'), disabled: true, action: c => { s.vpns = [...(s.vpns || []), {name: form.name, type: form.type, server: form.server}]; c.save(); c.render(); }}],
        mount(c, win) {
          const save = [...win.querySelectorAll('.ngdlg-button')].at(-1);
          const sync = () => { form = {name: win.querySelector('.ngsx-vname').value.trim(), type: win.querySelector('.ngsx-vtype').selectedIndex, server: win.querySelector('.ngsx-vserver').value.trim()}; save.disabled = !form.name || !form.server; };
          win.addEventListener('input', sync); win.addEventListener('change', sync); sync(); setTimeout(() => win.querySelector('.ngsx-vname').focus(), 50);
        }});
      return true;
    }
  };
  const bigButton = (c, action, label) => `<div class="ngsx-btnrow"><button type="button" class="ngsx-btn" data-action="${action}">${c.safe(label)}</button></div>`;
  NG.settingsScreens['reset-network'] = {
    title: (c, cur) => T().t(cur.screen.endsWith(':confirm') ? 'reset_network_confirm_title' : 'reset_network_title'),
    render(c, cur) {
      const t = T();
      if (cur.screen.endsWith(':confirm')) return `<div class="ngsx-text">${c.safe(t.t('reset_network_final_desc'))}</div>${bigButton(c, 'ngsx-resetnet2', t.t('reset_network_final_button_text'))}`;
      return `<div class="ngsx-text">${c.safe(t.t('reset_network_desc'))}</div><i class="ngsc-fill"></i>${bigButton(c, 'ngsx-resetnet', t.t('reset_network_button_text'))}`;
    },
    action(c, name) {
      const t = T(), s = S(c);
      if (name === 'ngsx-resetnet') {
        const go = () => NG.settingsGo(c, 'reset-network:confirm', t.t('reset_network_confirm_title'));
        go(); return true;
      }
      if (name === 'ngsx-resetnet2') {
        Object.assign(s, {wifi: true, wifiSsid: 'Home Network', wifiSaved: [], wifiForgotten: [], wifiAdded: [], bluetooth: true, btBonded: [], btConnected: [], mobileData: true, dataSaver: false, hotspot: false});
        c.save(); NG.system.changed(c); c.ui.settings.stack.pop(); c.ui.settings.stack.pop(); c.render(); c.toast(t.t('reset_network_complete_toast'));
        return true;
      }
      return false;
    }
  };
  NG.settingsScreens.beam = {
    title: () => T().t('android_beam_settings_title'),
    bar: c => NG.settingsSwitchBar(c, (S(c).nfc ?? true) && (S(c).beam ?? true), 'ngsx-beam', !(S(c).nfc ?? true)),
    render: c => `<div class="ngsx-medium">${c.safe(T().t('android_beam_explained'))}</div>`,
    action(c, name) { if (name !== 'ngsx-beam') return false; if (!(S(c).nfc ?? true)) return true; S(c).beam = !(S(c).beam ?? true); c.save(); c.transition('none'); c.render(); return true; }
  };

  // -- Tap & pay ----------------------------------------------------------------------------------------------------
  NG.settingsScreens['nfc-payment'] = {
    title: () => T().t('nfc_payment_settings_title'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T(), s = S(c), app = appLabel(c, 'android-pay');
      const gear = `<button type="button" class="ngst-gear" data-action="ngpy-gear" aria-label="${c.safe(t.t('settings_button'))}"><i></i></button>`;
      return `<div class="ngst-list">${NG.settingsJoinRows([
        {html: `<div class="ngst-pref" role="button" data-action="ngpy-default"><span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('nfc_payment_default'))}</span><span class="ngst-summary">${c.safe(s.paymentDefault === false ? t.t('nfc_payment_default_not_set') : app)}</span></span><span class="ngst-widget">${gear}</span></div>`, sel: true},
        {html: NG.settingsRow(c, {title: t.t('nfc_payment_use_default'), summary: t.t(s.paymentForeground ? 'nfc_payment_favor_open' : 'nfc_payment_favor_default'), action: 'ngpy-fg'}), sel: true}])}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ng-menu') { c.menu([{label: t.t('nfc_payment_how_it_works'), action: c => c.dialog({title: t.t('nfc_payment_how_it_works'), message: t.t('nfc_how_it_works_content'), buttons: [{label: t.t('nfc_how_it_works_got_it')}]})}, {label: t.t('help_label'), action: c => c.open('help', 'settings')}], el); return true; }
      if (name === 'ngpy-gear') { c.open('android-pay'); return true; }
      if (name === 'ngpy-default') { c.dialog({title: t.t('nfc_payment_pay_with'), items: [radio(c, appLabel(c, 'android-pay'), s.paymentDefault !== false)], buttons: [{label: t.t('cancel')}], onItem: () => { s.paymentDefault = true; c.save(); c.render(); }}); return true; }
      if (name === 'ngpy-fg') { c.dialog({title: t.t('nfc_payment_use_default'), items: [radio(c, t.t('nfc_payment_favor_default'), !s.paymentForeground), radio(c, t.t('nfc_payment_favor_open'), !!s.paymentForeground)], buttons: [{label: t.t('cancel')}], onItem: i => { s.paymentForeground = i === 1; c.save(); c.render(); }}); return true; }
      return false;
    }
  };
  NG.settingsSummaries['Settings$PaymentSettingsActivity'] = c => S(c).paymentDefault === false ? '' : T().fmt('payment_summary', null, appLabel(c, 'android-pay'));

  // -- Screen saver -------------------------------------------------------------------------------------------------
  const DREAMS = [['clock', c => appLabel(c, 'clock'), 'assets/app-clock.png', true], ['colors', () => T().t('BasicDreams/color_dream_name'), 'assets/bd-colors_icon.png', false],
    ['photos', () => T().t('Photos/photos_theme_google_photos'), 'assets/app-photos.png', true]];
  NG.settingsDreamName = c => (DREAMS.find(d => d[0] === (S(c).dream || 'clock')) || DREAMS[0])[1](c);
  const WHEN = [['dock', 'screensaver_settings_summary_dock'], ['sleep', 'screensaver_settings_summary_sleep'], ['either', 'screensaver_settings_summary_either_short']];
  NG.settingsScreens.dream = {
    title: () => T().t('screensaver_settings_title'),
    bar: c => NG.settingsSwitchBar(c, S(c).dreams !== false, 'ngdr-toggle'),
    actions: c => NG.menu.button(c),
    render(c) {
      const s = S(c), cur = s.dream || 'clock', collator = new Intl.Collator(c.locale());
      if (s.dreams === false) return `<div class="ngst-emptyview center">${c.safe(T().t('screensaver_settings_disabled_prompt'))}</div>`;
      const list = DREAMS.map(([id, label, icon, settings]) => ({id, label: label(c), icon, settings})).sort((a, b) => collator.compare(a.label, b.label));
      return `<div class="ngst-list">${list.map(d => `<div class="ngdr-row"><button type="button" class="ngdr-main" data-action="ngdr-pick" data-id="${d.id}"><img src="${d.icon}" alt=""><span>${c.safe(d.label)}</span><i class="ngw-radio ngst-radio${d.id === cur ? ' on' : ''}"></i></button>${d.settings ? `<i class="ngdr-div"></i><button type="button" class="ngst-gear" data-action="ngdr-settings" data-id="${d.id}" aria-label="${c.safe(T().t('settings_button'))}"><i></i></button>` : ''}</div>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ngdr-toggle') { s.dreams = s.dreams === false; c.save(); c.transition('none'); c.render(); return true; }
      if (name === 'ngdr-pick') { s.dream = el.dataset.id; c.save(); c.transition('none'); c.render(); return true; }
      if (name === 'ngdr-settings') { const d = DREAMS.find(x => x[0] === el.dataset.id); if (el.dataset.id === 'clock') NG.openPrefs(c, 'clocksaver', 'screensaver_settings', d[1](c)); else NG.settingsGo(c, 'photos-dream', d[1](c)); return true; }
      if (name === 'ng-menu') {
        const on = s.dreams !== false, when = s.dreamWhen || 'dock';
        c.menu([{label: t.t('screensaver_settings_dream_start'), disabled: !on, action: c => c.open('daydream', s.dream || 'clock')},
          {label: t.t('screensaver_settings_when_to_dream'), disabled: !on, action: c => c.dialog({title: t.t('screensaver_settings_when_to_dream'),
            items: WHEN.map(([v, label]) => radio(c, t.t(label), v === when)), onItem: i => { s.dreamWhen = WHEN[i][0]; c.save(); }})},
          {label: t.t('help_label'), action: c => c.open('help', 'settings')}], el);
        return true;
      }
      return false;
    }
  };

  // -- Wallpaper ----------------------------------------------------------------------------------------------------
  NG.settingsScreens['wallpaper-type'] = {
    title: () => T().t('wallpaper_settings_fragment_title'),
    render(c) {
      const t = T(), items = [['live', t.t('LiveWallpapersPicker/live_wallpaper_picker_label'), 'assets/lw-ic_launcher_live_wallpaper.png'], ['photos', t.t('Photos/photos_setwallpaper_app_name'), 'assets/app-photos.png']];
      return `<div class="ngst-list">${NG.settingsJoinRows(items.map(([id, label, icon]) => ({html: NG.settingsRow(c, {title: label, icon: `<img class="ngst-ic big" src="${icon}" alt="">`, action: 'ngwp-pick', data: ` data-id="${id}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngwp-pick') return false;
      const id = el.dataset.id;
      c.open(id === 'live' ? 'live-wallpapers' : 'photos', id === 'photos' ? 'pick:wallpaper' : '');
      return true;
    }
  };
})();
