/* Android 6.0.1 Settings: what each preference screen's fragment does with its res/xml (Settings.apk code, MTC20K),
   as MM.settingsHooks[<xml name>] = {hidden: [keys], hide(c, key), get(c, key), set(c, key, v), summary(c, key),
   title(c, key), click(c, key), changed(c, key, v), switch: [keys drawn with a switch], top(c)}.
   - display_settings (DisplaySettings.onCreate): lift_to_wake goes without a wake gesture sensor (the 5X has none),
     tap_to_wake with config_supportDoubleTapWake false, camera_gesture with config_cameraLaunchGestureSensorType -1;
     camera_double_tap_power_gesture (config_cameraDoubleTapPowerGestureEnabled), doze (config_dozeComponent) and the
     screensaver (config_dreamsSupported) stay. The timeout's summary is screen_timeout_summary with the largest entry
     not over the value; auto_rotate is a DropDownPreference of "Rotate the contents of the screen" and, the 5X not
     allowing all rotations, "Stay in portrait view"; the screensaver's summary is the active dream's label
     (config_dreamsDefaultComponent: the Clock app's Screensaver) while dreams are on (config_dreamsEnabledByDefault).
   - The simulator's own rule (every version): the screen does not go off by itself unless a timeout is chosen, so Sleep
     starts at "Never" (-1), an entry after screen_timeout_entries in Settings' own Never text. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks = MM.settingsHooks || {};
  const S = c => c.data.settings;

  H.display_settings = {
    hidden: ['lift_to_wake', 'tap_to_wake', 'camera_gesture'],
    get(c, key) {
      const s = S(c);
      if (key === 'auto_brightness') return s.brightnessAuto;
      if (key === 'screen_timeout') return String(s.screenTimeout ?? -1);
      if (key === 'camera_double_tap_power_gesture') return !s.cameraDoubleTapDisabled;
      if (key === 'doze') return s.doze ?? true;
      if (key === 'font_size') return s.fontScale ?? '1.0';
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'auto_brightness') { s.brightnessAuto = v; MM.system?.applyBrightness(c); return true; }
      if (key === 'screen_timeout') { s.screenTimeout = +v; return true; }
      if (key === 'camera_double_tap_power_gesture') { s.cameraDoubleTapDisabled = !v; return true; }
      if (key === 'doze') { s.doze = v; return true; }
      if (key === 'font_size') { s.fontScale = v; return true; }
      return false;
    },
    summary(c, key, n) {
      const t = T(), s = S(c);
      if (key === 'screen_timeout') {
        const values = n.entryValues, entries = MM.settingsArr(n.entries), cur = s.screenTimeout ?? -1;
        if (cur < 0) return t.t('battery_saver_turn_on_automatically_never');
        let best = 0; values.forEach((v, i) => { if (cur >= +v) best = i; });
        return t.fmt('screen_timeout_summary', null, entries[best]);
      }
      if (key === 'auto_rotate') return t.t(s.rotationLocked ? 'display_auto_rotate_stay_in_portrait' : 'display_auto_rotate_rotate');
      if (key === 'screensaver') return s.dreams === false ? t.t('screensaver_settings_summary_off') : {colors: () => t.t('BasicDreams/color_dream_name'), photos: () => t.t('Photos/photos_theme_google_photos')}[s.dream]?.() || MM.appLabel(c, 'clock');
      return undefined;
    },
    click(c, key, n) {
      if (key === 'auto_rotate') {
        const t = T(), s = S(c), items = [t.t('display_auto_rotate_rotate'), t.t('display_auto_rotate_stay_in_portrait')];
        c.dialog({items: items.map((label, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${(i === 1) === !!s.rotationLocked ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`})),
          onItem: i => { s.rotationLocked = i === 1; c.save(); c.render(); }});
        return true;
      }
      if (key === 'brightness') { c.overlay('brightness'); return true; }
      if (key === 'screen_timeout') {
        const t = T(), s = S(c), cur = String(s.screenTimeout ?? -1);
        const values = [...n.entryValues, '-1'], labels = [...MM.settingsArr(n.entries), t.t('battery_saver_turn_on_automatically_never')];
        c.dialog({title: MM.settingsStr(n.dialogTitle) || MM.settingsStr(n.title), items: labels.map((label, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${values[i] === cur ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`})),
          buttons: [{label: t.t('framework/cancel') || 'Cancel'}], onItem: i => { s.screenTimeout = +values[i]; c.save(); c.render(); }});
        return true;
      }
      return false;
    }
  };

  /* wifi_advanced_settings (AdvancedWifiSettings.initPreferences / refreshWifiInfo): Network notification follows
     wifi_networks_available_notification_on (def_networks_available_notification_on true) and is enabled with Wi-Fi on;
     Use open Wi-Fi automatically stays (GCS.apk is a network scorer), off until a scorer is chosen; the 5X is dual band
     (config_wifi_dual_band_support), the band 0 (Automatic) as its summary; Keep Wi-Fi on during sleep shows the entry of
     wifi_sleep_policy (def_wifi_sleep_policy 2, Always); MAC address and IP address are not selectable, the IP
     address Unavailable without a connection (the MAC is the simulator's own, in LG's 64:bc:0c range). */
  H.wifi_advanced_settings = {
    get(c, key) {
      const s = S(c);
      if (key === 'notify_open_networks') return s.wifiNotify ?? true;
      if (key === 'wifi_assistant') return !!s.wifiAssistant;
      if (key === 'sleep_policy') return String(s.wifiSleepPolicy ?? 2);
      if (key === 'frequency_band') return String(s.wifiBand ?? 0);
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'notify_open_networks') { s.wifiNotify = v; return true; }
      if (key === 'wifi_assistant') { s.wifiAssistant = v; return true; }
      if (key === 'sleep_policy') { s.wifiSleepPolicy = +v; return true; }
      if (key === 'frequency_band') { s.wifiBand = +v; return true; }
      return false;
    },
    switch: ['wifi_assistant'],
    disabled: (c, key) => key === 'notify_open_networks' && !S(c).wifi,
    selectable: (c, key) => key !== 'mac_address' && key !== 'current_ip_address',
    summary(c, key, n) {
      const t = T(), s = S(c), connected = MM.system.wifiState(c) === 'connected';
      if (key === 'sleep_policy') { const i = n.entryValues.indexOf(String(s.wifiSleepPolicy ?? 2)); return MM.settingsArr(n.entries)[i] || ''; }
      if (key === 'frequency_band') return MM.settingsArr(n.entries)[s.wifiBand ?? 0];
      if (key === 'mac_address') return '64:bc:0c:8a:4f:21';
      if (key === 'current_ip_address') return connected ? '192.168.1.104' : t.t('status_unavailable');
      return undefined;
    }
  };
})();
