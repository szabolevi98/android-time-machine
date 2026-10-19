/* Android 6.0.1 Settings: About phone and the screens under it (Settings.apk MTC20K), as MM.settingsHooks.
   - device_info_settings (DeviceInfoSettings.onCreate): Android version Build.VERSION.RELEASE 6.0.1, the security patch
     level ro.build.version.security_patch 2016-09-06 in the locale's "dMMMMyyyy" pattern, Model number Nexus 5X, the
     baseband gsm.version.baseband (the image's radio M8994F-2.6.32.1.13), the kernel as getFormattedKernelVersion
     formats the boot image's banner ("Linux version 3.10.73-g4e0bcb3 (android-build@vped11.mtv.corp.google.com) …
     #1 SMP PREEMPT Tue Aug 9 18:05:44 UTC 2016"), Build number Build.DISPLAY MTC20K, SELinux Enforcing; FCC equipment ID
     goes (no ro.ril.fccid), Manual and Additional system updates go (config_show_manual, config_additional_system_update_
     setting_enable false); Regulatory information stays (RegulatoryInfoDisplayActivity enabled by
     config_show_regulatory_info: the AlertDialog with regulatory_info_<sku>, the simulator being the US LG-H790) and
     Send feedback stays (oem_preferred_feedback_reporter com.google.android.gms).
   - onPreferenceTreeClick: Build number counts seven taps down (Toasts from show_dev_countdown at 4 … 1, "You are now a
     developer!" at 0, "No need, you are already a developer." after), which turns Developer options on; Android version
     three times within 500 ms opens PlatLogoActivity.
   - device_info_status (Status): battery status (Utils.getBatteryStatus) and level (formatPercentage), the Wi-Fi IP and
     MAC, the Bluetooth address (lower case, Unavailable with Bluetooth off), the serial number, the up time
     (elapsedRealtime as h:mm:ss, every second); no WiMAX.
   - device_info_sim_status (SimStatus): the operator, the signal (sim_signal_strength: dBm and asu), LTE, In service, Not
     roaming, the data state, the number Unknown (no MSISDN on the SIM); the cell broadcast area info goes.
   - device_info_phone_status (ImeiInformation): a GSM phone shows IMEI and IMEI SV; the CDMA rows (MIN, PRL, MEID) and
     the ICCID go. The identifiers are the simulator's own. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks = MM.settingsHooks || {};
  const S = c => c.data.settings;
  const sys = () => MM.system;
  const top = c => c.ui.settings?.stack?.at(-1) || {};

  const KERNEL = '3.10.73-g4e0bcb3\nandroid-build@vped11.mtv.corp.google.com #1\nTue Aug 9 18:05:44 UTC 2016';
  const IDS = {serial: '00c5f4a8d2e1b7a3', bt: '64:BC:0C:8A:4F:22', imei: '353627074512386', imeiSv: '13'};

  H.device_info_settings = {
    hidden: ['fcc_equipment_id', 'manual', 'additional_system_update_settings', 'safetylegal'],
    summary(c, key) {
      if (key === 'firmware_version') return '6.0.1';
      if (key === 'security_patch') return new Intl.DateTimeFormat(c.locale(), {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(2016, 8, 6));
      if (key === 'device_model') return 'Nexus 5X';
      if (key === 'baseband_version') return 'M8994F-2.6.32.1.13';
      if (key === 'kernel_version') return KERNEL;
      if (key === 'build_number') return 'MTC20K';
      return undefined;
    },
    click(c, key) {
      const t = T(), s = S(c), entry = top(c);
      // sendFeedback: ACTION_BUG_REPORT to oem_preferred_feedback_reporter, Google Play services' feedback.
      if (key === 'device_feedback') { c.open('feedback', 'settings'); return true; }
      if (key === 'build_number') {
        if (entry.devHits == null) entry.devHits = s.devOptions ? -1 : 7;
        if (entry.devHits < 0) { c.toast(t.t('show_dev_already'), true); return true; }
        entry.devHits--;
        if (entry.devHits === 0) { s.devOptions = true; entry.devHits = -1; c.save(); c.toast(t.t('show_dev_on'), true); }
        else if (entry.devHits < 5) c.toast(t.plural('show_dev_countdown', entry.devHits), false);
        return true;
      }
      if (key === 'firmware_version') {
        const now = Date.now(); entry.logoHits = [...(entry.logoHits || []), now].slice(-3);
        if (entry.logoHits.length === 3 && entry.logoHits[0] >= now - 500) { entry.logoHits = []; c.open('platlogo'); }
        return true;
      }
      if (key === 'regulatory_info') {
        c.dialog({title: t.t('regulatory_information'), html: '<div class="mmst-regulatory"><img src="assets/st-regulatory_info_lgh790.png" alt=""></div>', buttons: [{label: t.t('framework/ok')}]});
        return true;
      }
      return false;
    }
  };

  // Status.convert: hours:minutes:seconds since boot.
  const upTime = () => {
    const t = Math.floor((Date.now() - sys().live.bootAt) / 1000), p = n => String(n).padStart(2, '0');
    return `${Math.floor(t / 3600)}:${p(Math.floor(t / 60) % 60)}:${p(t % 60)}`;
  };
  let upTimer = 0;
  H.device_info_status = {
    hidden: ['wimax_mac_address'],
    selectable: () => false,
    summary(c, key) {
      const t = T(), s = S(c), b = MM.battery?.() || {level: 87, plugged: false};
      if (key === 'battery_status') return t.t(b.plugged ? (b.level >= 100 ? 'battery_info_status_full' : 'battery_info_status_charging') : 'battery_info_status_discharging');
      if (key === 'battery_level') return new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100);
      if (key === 'wifi_ip_address') return sys().wifiState(c) === 'connected' ? '192.168.1.104' : t.t('status_unavailable');
      if (key === 'wifi_mac_address') return '64:bc:0c:8a:4f:21';
      if (key === 'bt_address') return s.bluetooth ? IDS.bt.toLowerCase() : t.t('status_unavailable');
      if (key === 'serial_number') return IDS.serial;
      if (key === 'up_time') {
        clearInterval(upTimer);
        upTimer = setInterval(() => { const el = c.el.viewport.querySelector('[data-key="up_time"] .mmst-summary'); if (el) el.textContent = upTime(); else clearInterval(upTimer); }, 1000);
        return upTime();
      }
      return undefined;
    }
  };

  H.device_info_sim_status = {
    hidden: ['latest_area_info'],
    selectable: () => false,
    summary(c, key) {
      const t = T(), s = S(c), m = sys().mobile(c), on = !s.airplane;
      if (key === 'operator_name') return on ? MM.text('shade').t('carrier') : t.t('device_info_default');
      if (key === 'signal_strength') return on ? t.fmt('sim_signal_strength', null, -87, 26) : '0';
      if (key === 'network_type') return on ? 'LTE' : t.t('device_info_default');
      if (key === 'service_state') return t.t(on ? 'radioInfo_service_in' : 'radioInfo_service_off');
      if (key === 'roaming_state') return t.t('radioInfo_roaming_not');
      if (key === 'data_state') return t.t(m.service && m.data ? 'radioInfo_data_connected' : 'radioInfo_data_disconnected');
      if (key === 'number') return t.t('device_info_default');
      if (key === 'imei') return IDS.imei;
      if (key === 'imei_sv') return IDS.imeiSv;
      return undefined;
    }
  };

  H.device_info_phone_status = {
    hidden: ['min_number', 'prl_version', 'meid_number', 'icc_id'],
    selectable: () => false,
    summary(c, key) {
      if (key === 'imei') return IDS.imei;
      if (key === 'imei_sv') return IDS.imeiSv;
      return undefined;
    }
  };
})();
