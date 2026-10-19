/* Android 7.1.2: the phone's radios and switches, and what the status bar shows of them. Logic only (6.0.1's, with the
   N2G48C image's defaults).
   - Saved settings (SettingsProvider defaults of the image where the simulator does not differ): Wi-Fi on and connected
     to the simulator's network (the image's def_wifi_on is false, the simulator starts set up, as every version),
     Bluetooth on (def_bluetooth_on true in this image), airplane off (def_airplane_mode_on), zen 0 (Settings.Global.
     ZEN_MODE: 0 off, 1 priority only, 2 total silence, 3 alarms only), mobile data on, rotation not locked
     (def_accelerometer_rotation true), location on (def_location_providers_allowed "gps"), automatic brightness
     (def_screen_brightness_automatic_mode true, def_screen_brightness 82, screen_auto_brightness_adj 0).
   - Airplane mode turns the radios of def_airplane_mode_radios off (cell, bluetooth, wifi) and back on as they were.
   - The portable hotspot (SystemUI's HotspotControllerImpl, Settings' WifiApEnabler): switching it on turns Wi-Fi off
     and remembers it (WIFI_SAVED_STATE), switching it off turns that Wi-Fi back on; switching Wi-Fi on stops the hotspot,
     so does airplane mode. It is "turning on" / "turning off" for a moment (WIFI_AP_STATE_ENABLING / _DISABLING).
   - PhoneStatusBarPolicy: the status icons in config_statusBarIcons order (cast, hotspot, location, bluetooth, zen,
     volume … alarm_clock): zen is stat_sys_dnd, or stat_sys_dnd_total_silence for total silence; Bluetooth shows while it
     is on (connected: its own icon); the alarm while AlarmManager has a next alarm clock.
   - SignalClusterView: Wi-Fi, the 4 dp spacer when both show, the mobile signal with its data type over it (LTE), the
     airplane after its spacer. The icons are drawn "fully" while the network has internet.
   - The screen's brightness: the simulator dims the phone with a CSS filter (manual: 0.5 at 0 up to 1 at 255; automatic:
     the adjustment below the middle dims down to 0.5). */
(() => {
  'use strict';
  Object.assign(NG.defaults.settings, {wifi: true, wifiSsid: 'Home Network', bluetooth: true, airplane: false, zen: 0, zenFavorite: 3, zenUntil: 0, mobileData: true,
    rotationLocked: false, location: true, brightnessAuto: true, brightness: 82, brightnessAdj: 0});
  // What is not saved: the flashlight (it goes off with the camera service on a reboot) and the radios coming up.
  const live = {flashlight: false, hotspotChanging: 0, wifiConnecting: 0, btConnecting: {}, btPairing: null, btTurningOn: 0, btScanUntil: 0, bootAt: Date.now()};

  // The simulator's Wi-Fi networks, as every version has them (names are data, not interface text): level is
  // WifiManager.calculateSignalLevel(rssi, 4), 0..3; saved ones connect without a password. freq (MHz) and speed (Mbps)
  // are the WifiInfo the connection reports.
  const NETWORKS = [{ssid: 'AndroidAP', secure: true, level: 3, freq: 2437, speed: 72}, {ssid: 'CoffeeShop', secure: false, level: 2, freq: 2412, speed: 54},
    {ssid: 'Home Network', secure: true, level: 3, saved: true, freq: 5180, speed: 433}, {ssid: 'Library Wi-Fi', secure: false, level: 1, freq: 2462, speed: 24}];

  // The simulator's Bluetooth devices, as the other versions have them (names are data): a headset that pairs with the
  // legacy PIN (BluetoothDevice class 0x404, Phone audio) and a car kit with a display (0x408 handsfree: passkey
  // confirmation, Phone audio, Media audio and Contact sharing). rssi orders the found ones.
  const BT_DEVICES = [{id: 'headset', name: 'Wireless Headset', cls: 0x404, profiles: ['headset'], pairing: 'pin', rssi: -60},
    {id: 'car', name: 'Car Audio', cls: 0x408, profiles: ['headset', 'a2dp', 'pbap'], pairing: 'confirm', rssi: -70}];

  const sys = NG.system = {
    live,
    // CachedBluetoothDeviceManager's devices: bonded ones (connected first) and those the scan has found.
    btDevices(c) {
      const s = c.data.settings, bonded = s.btBonded || [], connected = s.btConnected || [], names = s.btNames || {};
      return BT_DEVICES.map(d => ({...d, name: names[d.id] || d.name, bonded: bonded.includes(d.id), connected: connected.includes(d.id),
        pairing: live.btPairing === d.id, connecting: live.btConnecting?.[d.id] > Date.now(), mode: d.pairing}));
    },
    // Pairing ends bonded and connected (the profiles connect as A2DP / HFP sinks do after bonding).
    btBond(c, id) {
      const s = c.data.settings;
      live.btPairing = null;
      s.btBonded = [...new Set([...(s.btBonded || []), id])];
      sys.btConnect(c, id);
    },
    btConnect(c, id) {
      live.btConnecting[id] = Date.now() + 1500; sys.changed(c);
      setTimeout(() => { const s = c.data.settings; if ((s.btBonded || []).includes(id) && s.bluetooth) { s.btConnected = [...new Set([...(s.btConnected || []), id])]; c.save(); } sys.changed(c); }, 1550);
    },
    btDisconnect(c, id) { const s = c.data.settings; s.btConnected = (s.btConnected || []).filter(d => d !== id); c.save(); sys.changed(c); },
    btForget(c, id) { const s = c.data.settings; s.btBonded = (s.btBonded || []).filter(d => d !== id); s.btConnected = (s.btConnected || []).filter(d => d !== id); c.save(); sys.changed(c); },
    // WifiTracker's list: AccessPoint.compareTo puts the active network first, then the saved ones, then the stronger,
    // then by name.
    accessPoints(c) {
      const s = c.data.settings, connected = sys.wifiState(c) === 'connected';
      const forgotten = s.wifiForgotten || [];
      return NETWORKS.map(n => ({...n, saved: (n.saved && !forgotten.includes(n.ssid)) || (s.wifiSaved || []).includes(n.ssid), active: connected && n.ssid === s.wifiSsid}))
        .sort((a, b) => (b.active - a.active) || (b.saved - a.saved) || (b.level - a.level) || a.ssid.localeCompare(b.ssid, undefined, {sensitivity: 'base'}));
    },
    connectWifi(c, ssid) {
      const s = c.data.settings;
      s.wifiSsid = ssid; s.wifiSaved = [...new Set([...(s.wifiSaved || []), ssid])];
      s.wifiForgotten = (s.wifiForgotten || []).filter(n => n !== ssid);
      sys.setWifi(c, true);
    },
    // WifiManager.forget: the network's configuration goes; forgetting the connected one disconnects.
    forgetWifi(c, ssid) {
      const s = c.data.settings;
      s.wifiSaved = (s.wifiSaved || []).filter(n => n !== ssid); s.wifiForgotten = [...new Set([...(s.wifiForgotten || []), ssid])];
      if (s.wifiSsid === ssid) s.wifiSsid = '';
      c.save(); sys.changed(c);
    },
    // Wi-Fi: off, searching (a moment after switching it on, or with no network to join) or connected.
    wifiState(c) { const s = c.data.settings; return !s.wifi ? 'off' : live.wifiConnecting > Date.now() || !s.wifiSsid ? 'searching' : 'connected'; },
    setWifi(c, on) {
      const s = c.data.settings;
      if (on && s.hotspot) { s.hotspot = false; s.wifiSavedState = false; }
      s.wifi = on; if (on) live.wifiConnecting = Date.now() + 2500;
      c.save(); sys.changed(c);
      if (on) setTimeout(() => sys.changed(c), 2600);
    },
    hotspotState(c) { return live.hotspotChanging > Date.now() ? (c.data.settings.hotspot ? 'enabling' : 'disabling') : c.data.settings.hotspot ? 'on' : 'off'; },
    setHotspot(c, on) {
      const s = c.data.settings;
      if (on === !!s.hotspot) return;
      if (on) { if (s.wifi) { s.wifi = false; s.wifiSavedState = true; } s.hotspotUsed = Date.now(); }
      s.hotspot = on; live.hotspotChanging = Date.now() + 1200;
      c.save(); sys.changed(c);
      setTimeout(() => {
        if (!on && s.wifiSavedState) { s.wifiSavedState = false; s.wifi = true; live.wifiConnecting = Date.now() + 2500; c.save(); setTimeout(() => sys.changed(c), 2600); }
        sys.changed(c);
      }, 1250);
    },
    // BluetoothAdapter: STATE_TURNING_ON for a moment, then on with the bonded devices reconnecting; off drops them.
    setBluetooth(c, on) {
      const s = c.data.settings;
      s.bluetooth = on; live.btTurningOn = on ? Date.now() + 1000 : 0;
      if (!on) s.btConnected = [];
      c.save(); sys.changed(c);
      if (on) setTimeout(() => sys.changed(c), 1050);
    },
    setAirplane(c, on) {
      const s = c.data.settings;
      if (on === s.airplane) return;
      if (on) { s.beforeAirplane = {wifi: s.wifi, bluetooth: s.bluetooth}; s.wifi = false; s.bluetooth = false; s.hotspot = false; s.wifiSavedState = false; }
      else { const b = s.beforeAirplane || {}; s.wifi = !!b.wifi; s.bluetooth = !!b.bluetooth; if (s.wifi) live.wifiConnecting = Date.now() + 2500; delete s.beforeAirplane; }
      s.airplane = on; c.save(); sys.changed(c);
      if (!on && s.wifi) setTimeout(() => sys.changed(c), 2600);
    },
    setZen(c, zen) { const s = c.data.settings; s.zen = zen; if (!zen) s.zenUntil = 0; c.save(); sys.changed(c); },
    setFlashlight(c, on) { live.flashlight = on; sys.changed(c); },
    setRotationLocked(c, on) { c.data.settings.rotationLocked = on; c.save(); sys.changed(c); },
    // The mobile network: no service in airplane mode; connected to data when Wi-Fi is not.
    mobile(c) {
      const s = c.data.settings;
      if (s.airplane) return {service: false};
      return {service: true, data: s.mobileData && sys.wifiState(c) !== 'connected'};
    },
    // The screen's brightness factor for the filter.
    brightness(c) {
      const s = c.data.settings;
      if (s.brightnessAuto) return s.brightnessAdj < 0 ? 1 + s.brightnessAdj * 0.5 : 1;
      return 0.5 + 0.5 * (s.brightness / 255);
    },
    applyBrightness(c) { const f = sys.brightness(c); c.el.screen.style.filter = f < 1 ? `brightness(${f.toFixed(3)})` : ''; },
    // Something changed: the status bar and an open shade draw it again.
    changed(c) {
      sys.applyBrightness(c);
      c.renderStatus?.();
      if (c.ui.overlay === 'shade') NG.module('shade')?.refresh?.(c);
      // An open Settings screen follows the radios (the Wi-Fi and Bluetooth lists, their switch bars).
      if (c.ui.view === 'settings' && !c.ui.overlay && !c.ui.sleeping) c.render();
    }
  };

  NG.register('system', {
    app: false,
    render: () => '',
    init(c) {
      // The status icons (PhoneStatusBarPolicy) and the signal cluster (SignalClusterView), for ng-statusbar.js.
      c.statusIcons = () => {
        const s = c.data.settings, out = [];
        if (s.hotspot) out.push('stat_sys_hotspot');
        if (s.bluetooth) out.push((s.btConnected || []).length ? 'stat_sys_data_bluetooth_connected' : 'stat_sys_data_bluetooth');
        if (s.zen) out.push(s.zen === 2 ? 'stat_sys_dnd_total_silence' : 'stat_sys_dnd');
        // The volume slot: vibrate unless total silence or alarms only (PhoneStatusBarPolicy.updateVolumeZen).
        if (s.ringerMode === 'vibrate' && s.zen !== 2 && s.zen !== 3) out.push('stat_sys_ringer_vibrate');
        // alarm_clock: shown while AlarmManager has a next alarm clock set.
        if ((c.data.clock?.alarms || []).some(x => x.on)) out.push('stat_sys_alarm');
        return out;
      };
      c.signal = () => {
        const s = c.data.settings, wifi = sys.wifiState(c), m = sys.mobile(c);
        return {
          wifi: wifi === 'connected' ? 'stat_sys_wifi_signal_4_fully' : null,
          mobile: m.service ? 'stat_sys_signal_4_fully' : null,
          type: m.service && m.data ? 'stat_sys_data_fully_connected_lte' : null,
          airplane: s.airplane
        };
      };
      sys.applyBrightness(c);
    },
    // A countdown condition ends Do not disturb at its time (ZenModeConditions / CountdownConditionProvider).
    tick(c) { const s = c.data.settings; if (s.zen && s.zenUntil && Date.now() >= s.zenUntil) sys.setZen(c, 0); }
  });
})();
