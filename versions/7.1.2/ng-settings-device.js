/* Android 7.1.2 Settings: About phone, Users, Printing and Developer options (SettingsGoogle N2G48C), as NG.settingsHooks
   and screens. The logic is 6.0.1's (its About phone, Users, Printing and Developer options code); N2G48C decides:
   - DeviceInfoSettings: System updates (Google Play services' SystemUpdateActivity), Status, Legal information,
     Regulatory labels (RegulatoryInfoDisplayActivity: the AlertDialog with regulatory_info_<sku>, the simulator being
     the US H1511), Send feedback about this device (oem_preferred_feedback_reporter, Google Play services); Model number
     Nexus 6P, Android version 7.1.2 (three taps within 500 ms: PlatLogoActivity), Android security patch level
     2017-08-05 in the locale's "dMMMMyyyy" pattern (it opens the security bulletin), Baseband version (the image's
     angler-03.81), Kernel version as getFormattedKernelVersion formats the boot image's banner, Build number N2G48C
     (seven taps: show_dev_countdown, "You are now a developer!", "No need, you are already a developer."). Manual,
     Additional system updates, Safety & regulatory manual, FCC equipment ID and SELinux status go (config_show_manual
     and config_additional_system_update_setting_enable false, no activity, no ro.ril.fccid, no ro.build.selinux).
   - Status: battery status and level, SIM status, IMEI information, the Wi-Fi IP and MAC address (the ones Wi-Fi's
     advanced settings show), the Bluetooth address (Unavailable with Bluetooth off), the serial number, the up time
     (every second); no WiMAX. SIM status: the operator, signal (sim_signal_strength), network LTE, service, roaming,
     data, the number Unknown; no area info. IMEI information: a GSM phone's IMEI and IMEI SV. The identifiers are the
     simulator's own.
   - LegalSettings: License (SettingsLicenseActivity over /system/etc/NOTICE.html.gz), Terms and conditions (Google
     Services Framework's additional terms), System WebView licenses; Copyright has no activity and Wallpaper
     attributions are off (config_show_wallpaper_attribution false).
   - UserSettings on a voice-capable phone without restricted profiles (ng-users.js): the rows on the screen itself, in
     serial order: You (Owner) with Admin; the users added (Not set up until used: a tap asks Set up user now?) and the
     Guest, each with the settings button (restricted_preference_user_delete_widget: the 2 dp divider_horizontal_dark,
     ic_settings) that opens UserDetailsSettings (Turn on phone calls & SMS / Turn on phone calls for the guest, each
     asking first; Remove user / Remove guest); Add user (greyed with user_add_max_count at the maximum); Add users from
     lock screen; Emergency information (the image's EmergencyInfo).
   - PrintSettingsFragment: no print jobs (the category goes); the print services, Cloud Print (on: N enables what
     DISABLED_PRINT_SERVICES does not list) with its application icon and On / Off; Add service (Google Play).
     PrintServiceSettingsFragment: the switch bar (off: Service disabled), Searching for printers, then No printers
     found; the overflow's Search, Add printers and Settings.
   - DevelopmentSettings on the user build: the switch bar (Allow development settings? before on), Take bug report
     (BugreportPreference: Interactive report / Full report), Desktop backup password, Stay awake, Bluetooth HCI snoop
     log, OEM unlocking (the 6P's persistent data block), Running services, WebView implementation (Chrome Stable or the
     Android System WebView), Multiprocess WebView, Automatic system updates, Demo mode; Clear USB debugging
     authorizations stays (ro.adb.secure); the terminal, logpersist, HDCP checking, Convert to file encryption (FDE),
     Picture color mode (one mode) and Color temperature (config_enableColorTemperature false) go. List rows show their
     entry; USB debugging asks Allow USB debugging?; Smallest width (DensityPreference) the width in dp. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks;
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const sys = () => NG.system;
  const top = c => c.ui.settings?.stack?.at(-1) || {};
  const go = (c, screen, title) => NG.settingsGo(c, screen, title);
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const mask = file => `-webkit-mask-image:url('${A(file)}');mask-image:url('${A(file)}')`;
  Object.assign(NG.settingsFragments, {'com.android.settings.users.UserDetailsSettings': 'user-detail', 'com.android.settings.applications.RunningServices': 'running'});

  // -- About phone ----------------------------------------------------------------------------------------------------
  const KERNEL = '3.10.73-g5b0be8f02fe\nandroid-build@wphs1.hot.corp.google.com #1\nThu Jun 8 18:03:16 UTC 2017';
  const IDS = {serial: '84B7N16226000751', bt: 'ac:37:43:6b:1e:57', wifiMac: 'ac:37:43:6b:1e:58', ip: '192.168.1.105', imei: '867981020754412', imeiSv: '03'};
  H.device_info_settings = {
    hidden: ['fcc_equipment_id', 'manual', 'additional_system_update_settings', 'safety_info', 'selinux_status'],
    // onCreate's setEnabled(true) (the taps count on them); the other information rows stay disabled, not greyed
    // (shouldDisableView="false").
    enabled: ['firmware_version', 'build_number'],
    summary(c, key) {
      if (key === 'firmware_version') return '7.1.2';
      if (key === 'security_patch') return new Intl.DateTimeFormat(c.locale(), {day: 'numeric', month: 'long', year: 'numeric'}).format(new Date(2017, 7, 5));
      if (key === 'device_model') return 'Nexus 6P';
      if (key === 'baseband_version') return 'angler-03.81';
      if (key === 'kernel_version') return KERNEL;
      if (key === 'build_number') return 'N2G48C';
      return undefined;
    },
    click(c, key) {
      const t = T(), s = S(c), entry = top(c);
      if (key === 'system_update_settings') { go(c, 'system-update', ''); return true; }
      if (key === 'device_feedback') { go(c, 'missing:com.google.android.gms.feedback.FeedbackActivity', t.t('device_feedback')); return true; }
      if (key === 'security_patch') { c.open('chrome', 'https://source.android.com/security/bulletin/'); return true; }
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
        if (entry.logoHits.length === 3 && entry.logoHits[0] >= now - 500) { entry.logoHits = []; NG.screens?.platlogo ? c.open('platlogo') : go(c, 'missing:com.android.internal.app.PlatLogoActivity', ''); }
        return true;
      }
      if (key === 'regulatory_info') {
        c.dialog({title: t.t('regulatory_labels'), html: `<div class="ngdv-regulatory"><img src="${A('st-regulatory_info_h1511.png')}" alt=""></div>`, buttons: [{label: t.t('framework/ok')}]});
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
    summary(c, key) {
      const t = T(), s = S(c), b = NG.battery?.(c) || {level: 87, plugged: false};
      if (key === 'battery_status') return t.t(b.plugged ? (b.level >= 100 ? 'battery_info_status_full' : 'battery_info_status_charging') : 'battery_info_status_discharging');
      if (key === 'battery_level') return new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100);
      if (key === 'wifi_ip_address') return sys().wifiState(c) === 'connected' ? IDS.ip : t.t('status_unavailable');
      if (key === 'wifi_mac_address') return IDS.wifiMac;
      if (key === 'bt_address') return s.bluetooth ? IDS.bt : t.t('status_unavailable');
      if (key === 'serial_number') return IDS.serial;
      if (key === 'up_time') {
        clearInterval(upTimer);
        upTimer = setInterval(() => { const el = c.el.viewport.querySelector('[data-key="up_time"] .ngst-summary'); if (el) el.textContent = upTime(); else clearInterval(upTimer); }, 1000);
        return upTime();
      }
      return undefined;
    }
  };
  H.device_info_sim_status = {
    hidden: ['latest_area_info', 'imei', 'imei_sv', 'iccid'],
    summary(c, key) {
      const t = T(), s = S(c), on = !s.airplane, m = sys().mobile?.(c) || {service: on, data: on};
      if (key === 'operator_name') return on ? NG.text('shade').t('carrier') : t.t('device_info_default');
      if (key === 'signal_strength') return on ? t.fmt('sim_signal_strength', null, -91, 22) : '0';
      if (key === 'network_type') return on ? 'LTE' : t.t('device_info_default');
      if (key === 'service_state') return t.t(on ? 'radioInfo_service_in' : 'radioInfo_service_off');
      if (key === 'roaming_state') return t.t('radioInfo_roaming_not');
      if (key === 'data_state') return t.t(m.service && m.data ? 'radioInfo_data_connected' : 'radioInfo_data_disconnected');
      if (key === 'number') return t.t('device_info_default');
      return undefined;
    }
  };
  H.device_info_phone_status = {
    hidden: ['min_number', 'prl_version', 'meid_number', 'icc_id'],
    summary: (c, key) => key === 'imei' ? IDS.imei : key === 'imei_sv' ? IDS.imeiSv : undefined
  };
  // Google Play services' SystemUpdateActivity: Your system is up to date, the last check, Check for update.
  NG.settingsScreens['system-update'] = {
    title: () => T().t('PrebuiltGmsCore/system_update_activity_title'),
    render(c) {
      const t = T(), checking = (c.ui.updateCheck || 0) > Date.now();
      if (checking) setTimeout(() => c.ui.view === 'settings' && c.render(), c.ui.updateCheck - Date.now() + 30);
      const last = new Intl.DateTimeFormat(c.locale(), {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(S(c).updateChecked || Date.now() - 3 * 3600000));
      return `<div class="ngdv-update"><div class="ngdv-ubody">${checking ? `<p>${c.safe(t.t('PrebuiltGmsCore/system_update_checking_status_text'))}</p>` : `<p>${c.safe(t.t('PrebuiltGmsCore/system_update_no_update_content_text'))}</p><p class="small">${c.safe(t.t('PrebuiltGmsCore/system_update_last_checkin').replace('^1', last))}</p>`}</div>
        <div class="ngdv-ufoot"><button type="button" data-action="ngdv-ucheck"${checking ? ' disabled' : ''}>${c.safe(t.t('PrebuiltGmsCore/system_update_check_now_button_text'))}</button></div></div>`;
    },
    action(c, name) {
      if (name !== 'ngdv-ucheck') return false;
      c.ui.updateCheck = Date.now() + 2500; S(c).updateChecked = Date.now() + 2500; c.save(); c.transition('none'); c.render(); return true;
    }
  };
  // An HTML file of the image in a page of its own: the license (gzip, inflated here as HTMLViewer does) or the terms.
  NG.settingsScreens.html = {
    title: (c, cur) => cur.title,
    render: () => '<div class="ngdv-html"><iframe title=""></iframe></div>',
    mount(c, root, cur) {
      const frame = root.querySelector('.ngdv-html iframe'); if (!frame) return;
      const file = cur.screen.split(':').slice(1).join(':');
      (async () => {
        const res = await fetch(A(file));
        const html = file.endsWith('.gz') && 'DecompressionStream' in window ? await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).text() : await res.text();
        frame.srcdoc = html.replace(/@import url\([^)]*\);?/g, '');
      })().catch(() => { frame.srcdoc = `<p>${c.safe(T().t('settings_license_activity_unavailable'))}</p>`; });
    }
  };
  H.about_legal = {
    hidden: ['copyright', 'wallpaper_attributions'],
    click(c, key) {
      const t = T();
      if (key === 'license') { go(c, 'html:st-NOTICE.html.gz', t.t('settings_license_activity_title')); return true; }
      if (key === 'terms') { const f = {es: '-es', fr: '-fr'}[c.lang] || ''; go(c, `html:gsf-additional_terms_of_service${f}.html`, t.t('GoogleServicesFramework/gls_settings_tos_activity_title')); return true; }
      if (key === 'webview_license') { go(c, 'html:st-NOTICE.html.gz', t.t('webview_license_title')); return true; }
      return false;
    }
  };

  // -- Users ----------------------------------------------------------------------------------------------------------
  const U = () => NG.users;
  // The dashboard tile's user_summary: the current user's name.
  NG.settingsOwnerName = c => NG.users?.name(NG.users.current(c));
  // UserPreference with restricted_preference_user_delete_widget: the divider and the settings button.
  const userRow = (c, key, icon, title, summary, manage, selectable) => {
    const gear = manage ? `<span class="ngst-widget ngdv-usermanage"><i class="ngdv-userdiv"></i><button type="button" class="ngst-gear" data-action="ngst-pref" data-key="manage_${key.slice(5)}" aria-label="${c.safe(T().t('settings_label'))}"><i></i></button></span>` : '';
    const tag = selectable && !manage ? 'button type="button"' : `div${selectable ? ' role="button"' : ''}`;
    return `<${tag} class="ngst-pref${selectable ? '' : ' ngdv-static'}"${selectable ? ` data-action="ngst-pref" data-key="${key}"` : ''}><span class="ngst-iconframe"><img class="ngst-ic icon40" src="${A(icon)}" alt=""></span><span class="ngst-texts"><span class="ngst-title">${c.safe(title)}</span>${summary ? `<span class="ngst-summary">${c.safe(summary)}</span>` : ''}</span>${gear}</${tag.split(' ')[0]}>`;
  };
  H.user_settings = {
    title: (c, key) => key === 'user_add' ? T().t('user_add_user_menu') : undefined,
    hidden: ['user_list'],
    // On a phone (no restricted profiles) updateUserList puts the rows on the screen itself, sorted by serial number.
    top(c) {
      const t = T(), u = U(), me = u.current(c), admin = me === 'owner';
      const own = me === 'guest' ? t.t('user_exit_guest_title') : t.fmt('user_you', null, u.name(me));
      const rows = ['owner', ...u.list().map(x => x.id)].map(id => id === me
        ? {html: userRow(c, 'user_me', u.icon(me), own, admin ? t.t('user_admin') : '', false, true), sel: true}
        : {html: userRow(c, `user_${id}`, u.icon(id), u.name(id), id === 'owner' ? t.t('user_admin') : u.setUp(id) ? '' : t.t('user_summary_not_set_up'), admin, !u.setUp(id)), sel: true});
      if (me === 'guest') rows.push({html: userRow(c, 'user_me', 'fw-ic_account_circle-gray.svg', own, '', false, true), sel: true});
      else rows.push({html: userRow(c, 'user_guest', 'fw-ic_account_circle-gray.svg', t.t('user_guest'), '', admin, false), sel: true});
      if (me === 'guest') rows.splice(rows.findIndex(r => r.html.includes('data-key="user_me"')), 1);
      return NG.settingsJoinRows(rows);
    },
    hide: (c, key) => (key === 'user_add' || key === 'lock_screen_settings') && U().current(c) !== 'owner',
    disabled: (c, key) => key === 'user_add' && !U().canAdd(),
    summary: (c, key) => key === 'user_add' && !U().canAdd() ? T().fmt('user_add_max_count', null, U().MAX + 1) : undefined,
    get: (c, key) => key === 'add_users_when_locked' ? !!S(c).addUsersWhenLocked : undefined,
    set(c, key, v) { if (key !== 'add_users_when_locked') return false; S(c).addUsersWhenLocked = v; return true; },
    click(c, key) {
      const t = T(), u = U(), me = u.current(c);
      if (key === 'user_add') { u.addDialog(c, true); return true; }
      if (key === 'emergency_info') { go(c, 'missing:com.android.emergency.view.ViewInfoActivity', t.t('emergency_info_title')); return true; }
      if (key === 'user_me') {
        if (me === 'guest') { c.dialog({title: t.t('user_exit_guest_confirm_title'), message: t.t('user_exit_guest_confirm_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('user_exit_guest_dialog_remove'), action: c => u.removeGuest(c)}]}); return true; }
        // EditUserInfoController.createDialog: the photo and the name (the row's title in the field); OK keeps a change.
        const shown = t.fmt('user_you', null, u.name(me)); let name = shown;
        c.dialog({title: t.t('profile_info_settings_title'), html: `<div class="ngdv-userinfo"><img src="${A(u.icon(me))}" alt=""><input class="ngwf-edit" value="${c.safe(name)}" spellcheck="false"></div>`,
          mount: (c, win) => { const i = win.querySelector('input'); i.addEventListener('input', () => { name = i.value; }); setTimeout(() => i.focus(), 50); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { if (name.trim() && name !== shown) { u.rename(me, name.trim()); c.render(); } }}]});
        return true;
      }
      if (key?.startsWith('manage_')) { const id = key.slice(7); go(c, `user-detail:${id}`, id === 'guest' ? t.t('user_guest') : u.name(id)); return true; }
      if (key?.startsWith('user_')) {
        const id = key.slice(5);
        c.dialog({title: t.t('user_setup_dialog_title'), message: t.t('user_setup_dialog_message'), buttons: [{label: t.t('user_setup_button_setup_later')}, {label: t.t('user_setup_button_setup_now'), action: c => u.switchTo(c, id)}]});
        return true;
      }
      return false;
    }
  };
  // UserDetailsSettings (user_details_settings.xml).
  NG.settingsScreens['user-detail'] = {
    title: (c, cur) => { const id = cur.screen.split(':')[1]; return id === 'guest' ? T().t('user_guest') : U().name(id); },
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], guest = id === 'guest', calls = (S(c).userCalls || {})[id] ?? !guest;
      return `<div class="ngst-list">${NG.settingsJoinRows([
        {html: NG.settingsRow(c, {title: t.t(guest ? 'user_enable_calling' : 'user_enable_calling_sms'), widget: NG.settingsSwitch(calls), action: 'ngdv-calls'}), sel: true},
        ...(guest && !U().hasGuest() ? [] : [{html: NG.settingsRow(c, {title: t.t(guest ? 'user_exit_guest_title' : 'user_remove_user'), action: 'ngdv-remove'}), sel: true}])])}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], guest = id === 'guest', s = S(c), u = U();
      if (name === 'ngdv-calls') {
        const on = (s.userCalls || {})[id] ?? !guest, set = v => { s.userCalls = {...(s.userCalls || {}), [id]: v}; c.save(); c.transition('none'); c.render(); };
        if (on) set(false);
        else c.dialog({title: t.t(guest ? 'user_enable_calling_confirm_title' : 'user_enable_calling_and_sms_confirm_title'), message: t.t(guest ? 'user_enable_calling_confirm_message' : 'user_enable_calling_and_sms_confirm_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('okay'), action: () => set(true)}]});
        return true;
      }
      if (name !== 'ngdv-remove') return false;
      if (guest) c.dialog({title: t.t('user_exit_guest_confirm_title'), message: t.t('user_exit_guest_confirm_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('user_exit_guest_dialog_remove'), action: c => { u.removeGuest(c); c.ui.settings.stack.pop(); c.render(); }}]});
      else c.dialog({title: t.t('user_confirm_remove_title'), message: t.t('user_confirm_remove_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('user_delete_button'), action: c => { u.removeUser(id); c.ui.settings.stack.pop(); c.render(); }}]});
      return true;
    }
  };

  // -- Printing -------------------------------------------------------------------------------------------------------
  (() => {
    const pc = NG.settingsXml.print_settings?.c.find(n => n.key === 'print_services_category');
    if (pc && !pc.c) pc.c = [{t: 'Preference', key: 'print_cloud', title: 'string/CloudPrint2/app_name'}, {t: 'Preference', key: 'print_add_service', title: 'string/print_menu_item_add_service'}];
  })();
  const cloudOn = c => S(c).cloudPrint !== false;
  H.print_settings = {
    hidden: ['print_jobs_category'],
    summary: (c, key) => key === 'print_cloud' ? T().t(cloudOn(c) ? 'print_feature_state_on' : 'print_feature_state_off') : undefined,
    row(c, key, n) {
      if (key === 'print_cloud') return NG.settingsRow(c, {key, title: NG.settingsStr(n.title), summary: this.summary(c, key), icon: `<img class="ngst-ic icon48" src="${A('cp-ic_main.png')}" alt="">`});
      if (key === 'print_add_service') return NG.settingsRow(c, {key, title: NG.settingsStr(n.title), icon: `<img class="ngst-ic" src="${A('st-ic_add_24dp.svg')}" alt="">`});
      return null;
    },
    click(c, key) {
      if (key === 'print_cloud') { go(c, 'cloudprint', T().t('CloudPrint2/app_name')); return true; }
      if (key === 'print_add_service') { c.open('store', 'search:print service'); return true; }
      return false;
    }
  };
  NG.settingsScreens.cloudprint = {
    title: () => T().t('CloudPrint2/app_name'),
    bar: c => NG.settingsSwitchBar(c, cloudOn(c), 'ngdv-cloudprint'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T();
      if (!cloudOn(c)) return `<div class="ngst-emptyview center">${c.safe(t.t('print_service_disabled'))}</div>`;
      const searching = (c.ui.cloudPrintAt || 0) > Date.now();
      if (searching) setTimeout(() => c.ui.view === 'settings' && c.render(), c.ui.cloudPrintAt - Date.now() + 30);
      return `<div class="ngst-emptyview center">${c.safe(t.t(searching ? 'print_searching_for_printers' : 'print_no_printers_found'))}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ng-menu') { c.menu([{label: t.t('print_menu_item_search'), disabled: !cloudOn(c), action: () => {}}, {label: t.t('print_menu_item_add_printers'), disabled: !cloudOn(c), action: () => {}}, {label: t.t('print_menu_item_settings'), disabled: !cloudOn(c), action: () => {}}], el); return true; }
      if (name !== 'ngdv-cloudprint') return false;
      s.cloudPrint = !cloudOn(c); if (cloudOn(c)) c.ui.cloudPrintAt = Date.now() + 3000; c.save(); c.transition('none'); c.render();
      return true;
    }
  };

  // -- Developer options ----------------------------------------------------------------------------------------------
  const DEV_DEFAULTS = {select_logd_size: '262144', select_usb_configuration: 'mtp', window_animation_scale: '1', transition_animation_scale: '1',
    animator_duration_scale: '1', overlay_display_devices: '', debug_hw_overdraw: 'false', show_non_rect_clip: 'hide', simulate_color_space: '-1',
    track_frame_time: 'false', app_process_limit: '-1', verify_apps_over_usb: true, select_webview_provider: 'com.android.chrome', enable_webview_multiprocess: false};
  const dev = c => S(c).dev || (S(c).dev = {on: true});
  // The WebView packages' labels: Chrome's app_name, WebViewGoogle's manifest literal.
  const WEBVIEW = [['com.android.chrome', t => t.t('Chrome/app_name')], ['com.google.android.webview', () => 'Android System WebView']];
  H.development_prefs = {
    hidden: ['enable_terminal', 'select_logpersist', 'hdcp_checking', 'convert_to_file_encryption', 'color_mode', 'color_temperature'],
    get(c, key) { const d = dev(c); return key in d ? d[key] : key in DEV_DEFAULTS ? DEV_DEFAULTS[key] : undefined; },
    set(c, key, v) { dev(c)[key] = v; return true; },
    disabled: c => !dev(c).on,
    summary(c, key, n) {
      const t = T(), d = dev(c);
      if (key === 'mock_location_app') return t.t('mock_location_app_not_set');
      if (key === 'debug_app') return t.t('debug_app_not_set');
      if (key === 'local_backup_password') return t.t(S(c).backupPassword ? 'local_backup_password_summary_change' : 'local_backup_password_summary_none');
      if (key === 'density') return t.fmt('developer_density_summary', null, d.density || 411);
      if (key === 'select_webview_provider') { const w = WEBVIEW.find(x => x[0] === (d.select_webview_provider || DEV_DEFAULTS.select_webview_provider)); return w[1](t); }
      if (/ListPreference$/.test(n.t) && n.entryValues) { const v = String(d[key] ?? DEV_DEFAULTS[key] ?? ''); const i = n.entryValues.indexOf(v); return i >= 0 ? NG.settingsArr(n.entries)[i] : ''; }
      return undefined;
    },
    click(c, key) {
      const t = T(), d = dev(c);
      if (key === 'enable_adb' && !d.enable_adb) {
        c.dialog({title: t.t('adb_warning_title'), message: t.t('adb_warning_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { d.enable_adb = true; c.save(); c.render(); }}]});
        return true;
      }
      if (key === 'oem_unlock_enable' && !d.oem_unlock_enable) {
        c.dialog({title: t.t('confirm_enable_oem_unlock_title'), message: t.t('confirm_enable_oem_unlock_text'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('enable_text'), action: c => { d.oem_unlock_enable = true; c.save(); c.render(); }}]});
        return true;
      }
      if (key === 'bugreport') {
        let full = false;
        const opt = (on, title, sum, i) => `<button type="button" class="ngdv-bropt" data-i="${i}"><span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(title)}</span></span><small>${c.safe(sum)}</small></button>`;
        const html = () => `<div class="ngdv-bugreport">${opt(!full, t.t('bugreport_option_interactive_title'), t.t('bugreport_option_interactive_summary'), 0)}${opt(full, t.t('bugreport_option_full_title'), t.t('bugreport_option_full_summary'), 1)}</div>`;
        c.dialog({title: t.t('framework/bugreport_title'), html: html(), buttons: [{label: t.t('framework/cancel')}, {label: t.t('report'), action: c => c.toast(t.t('framework/bugreport_title'))}],
          mount: (c, win) => win.addEventListener('click', e => { const b = e.target.closest('.ngdv-bropt'); if (!b) return; full = b.dataset.i === '1'; win.querySelector('.ngdv-bugreport').outerHTML = html(); })});
        return true;
      }
      if (key === 'clear_adb_keys') { c.dialog({message: t.t('adb_keys_warning_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok')}]}); return true; }
      if (key === 'mock_location_app' || key === 'debug_app') { c.dialog({title: t.t('select_application'), items: [{html: `<span class="ngst-dlgitem">${c.safe(t.t('no_application'))}</span>`}]}); return true; }
      if (key === 'local_backup_password') { go(c, 'backup-password', t.t('local_backup_password_title')); return true; }
      if (key === 'running_apps') { go(c, 'running', t.t('runningservices_settings_title')); return true; }
      if (key === 'inactive_apps') { go(c, 'inactive', t.t('inactive_apps_title')); return true; }
      if (key === 'demo_mode') { go(c, 'demo-mode', t.t('demo_mode')); return true; }
      if (key === 'reset_shortcut_manager_throttling') { c.toast(t.t('reset_shortcut_manager_throttling_complete')); return true; }
      if (key === 'select_webview_provider') {
        const cur = d.select_webview_provider || DEV_DEFAULTS.select_webview_provider;
        c.dialog({title: t.t('select_webview_provider_dialog_title'), items: WEBVIEW.map(([pkg, label]) => radio(c, label(t), pkg === cur)), buttons: [{label: t.t('framework/cancel')}],
          onItem: i => { d.select_webview_provider = WEBVIEW[i][0]; c.save(); c.render(); }});
        return true;
      }
      if (key === 'density') {
        let v = String(d.density || 411);
        c.dialog({title: t.t('developer_smallest_width'), html: `<div class="ngst-edit"><input type="number" class="ngst-input" value="${v}"></div>`,
          mount: (c, win) => { const i = win.querySelector('input'); i.addEventListener('input', () => { v = i.value; }); setTimeout(() => i.focus(), 50); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { const n = Math.round(+v); if (n >= 320) { d.density = n; c.save(); c.render(); } }}]});
        return true;
      }
      return false;
    },
    bar(c) { return NG.settingsSwitchBar(c, dev(c).on, 'ngdv-dev'); },
    action(c, name) {
      if (name !== 'ngdv-dev') return false;
      const t = T(), d = dev(c);
      if (d.on) { d.on = false; c.save(); c.transition('none'); c.render(); }
      else c.dialog({title: t.t('dev_settings_warning_title'), message: t.t('dev_settings_warning_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { d.on = true; c.save(); c.render(); }}]});
      return true;
    }
  };
  // SetFullBackupPassword.
  NG.settingsScreens['backup-password'] = {
    title: () => T().t('local_backup_password_title'),
    render(c) {
      const t = T(), f = (k, p) => `<div class="ngdv-field"><span>${c.safe(t.t(p))}</span><input type="password" class="ngwf-edit" data-f="${k}" autocomplete="off"></div>`;
      return `<div class="ngdv-form">${f('cur', 'current_backup_pw_prompt')}${f('new', 'new_backup_pw_prompt')}${f('again', 'confirm_new_backup_pw_prompt')}</div><div class="ngdv-foot"><button type="button" data-action="ngdv-bpcancel">${c.safe(t.t('backup_pw_cancel_button_text'))}</button><button type="button" data-action="ngdv-bpset">${c.safe(t.t('backup_pw_set_button_text'))}</button></div>`;
    },
    mount(c, root) { c.ui.backupPw = {}; for (const i of root.querySelectorAll('[data-f]')) i.addEventListener('input', () => { c.ui.backupPw[i.dataset.f] = i.value; }); },
    action(c, name) {
      const t = T(), p = c.ui.backupPw || {}, s = S(c);
      if (name === 'ngdv-bpcancel') { c.ui.settings.stack.pop(); c.render(); return true; }
      if (name !== 'ngdv-bpset') return false;
      if ((p.new || '') !== (p.again || '')) { c.toast(t.t('local_backup_password_toast_confirmation_mismatch')); return true; }
      if (s.backupPassword && p.cur !== s.backupPassword) { c.toast(t.t('local_backup_password_toast_validation_failure')); return true; }
      s.backupPassword = p.new || ''; c.save(); c.toast(t.t('local_backup_password_toast_success')); c.ui.settings.stack.pop(); c.render();
      return true;
    }
  };
  // RunningServices: the device memory bar (System / Apps / Free) and the apps used last.
  NG.settingsScreens.running = {
    title: () => T().t('runningservices_settings_title'),
    render(c) {
      const t = T(), total = 2.88e9, system = 1.13e9, apps = 0.64e9, free = total - system - apps;
      const running = (c.data.recents || c.ui.recent || []).map(x => x.app || x).filter(id => NG.appsData?.[id]).slice(0, 6);
      const seg = (cls, v) => `<i class="${cls}" style="width:${(v / total * 100).toFixed(1)}%"></i>`;
      const label = id => { const a = NG.appsData[id]; return a.label[c.lang] || a.label.en; };
      return `<div class="ngst-list"><div class="ngdv-ram"><div class="ngdv-ramtitle">${c.safe(t.t('running_processes_header_title'))}</div><div class="ngdv-rambar">${seg('sys', system)}${seg('app', apps)}${seg('free', free)}</div>
        <div class="ngdv-ramkeys"><span><i class="sys"></i>${c.safe(t.t('running_processes_header_system_prefix'))} ${c.safe(NG.fileSize(c, system, true))}</span><span><i class="app"></i>${c.safe(t.t('running_processes_header_apps_prefix'))} ${c.safe(NG.fileSize(c, apps, true))}</span><span><i class="free"></i>${c.safe(t.t('running_processes_header_free_prefix'))} ${c.safe(NG.fileSize(c, free, true))}</span></div>${NG.settingsCat(c, t.t('running_processes_header_footer'))}</div>
        ${NG.settingsJoinRows(running.map((id, i) => ({html: NG.settingsRow(c, {title: label(id), summary: t.fmt('running_processes_item_description_s_s', null, 1, 1), icon: `<img class="ngst-ic icon40" src="${NG.appsData[id].icon}" alt="">`, widget: `<span class="ngdv-size">${c.safe(NG.fileSize(c, 15e6 + i * 4.2e6, true))}</span>`, div: true}), sel: true})))}</div>`;
    }
  };
  // InactiveApps (app standby): every app with Active / Inactive; a tap flips it.
  NG.settingsScreens.inactive = {
    title: () => T().t('inactive_apps_title'),
    render(c) {
      const t = T(), off = new Set(S(c).inactiveApps || []), col = new Intl.Collator(c.locale()), seen = new Set(), label = id => NG.appsData[id].label[c.lang] || NG.appsData[id].label.en;
      const ids = Object.keys(NG.appsData || {}).filter(id => { const p = NG.appsData[id].pkg || id; if (seen.has(p)) return false; seen.add(p); return true; }).sort((a, b) => col.compare(label(a), label(b)));
      return `<div class="ngst-list">${NG.settingsJoinRows(ids.map(id => ({html: NG.settingsRow(c, {title: label(id), summary: t.t(off.has(id) ? 'inactive_app_inactive_summary' : 'inactive_app_active_summary'), icon: `<img class="ngst-ic icon40" src="${NG.appsData[id].icon}" alt="">`, action: 'ngdv-inactive', data: ` data-app="${id}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) { if (name !== 'ngdv-inactive') return false; const s = S(c), off = new Set(s.inactiveApps || []), id = el.dataset.app; off.has(id) ? off.delete(id) : off.add(id); s.inactiveApps = [...off]; c.save(); c.transition('none'); c.render(); return true; }
  };
  // SystemUI's DemoModeActivity (demo_mode_prefs): Enable demo mode, then Show demo mode.
  NG.settingsScreens['demo-mode'] = {
    title: () => T().t('SystemUI/demo_mode'),
    render(c) {
      const t = T(), d = dev(c), on = !!d.demoAllowed;
      return `<div class="ngst-list">${NG.settingsJoinRows([
        {html: NG.settingsRow(c, {title: t.t('SystemUI/enable_demo_mode'), widget: NG.settingsSwitch(on), action: 'ngdv-demo', data: ' data-k="demoAllowed"'}), sel: true},
        {html: NG.settingsRow(c, {title: t.t('SystemUI/show_demo_mode'), widget: NG.settingsSwitch(!!d.demoOn, !on), action: 'ngdv-demo', data: ' data-k="demoOn"', disabled: !on}), sel: true}])}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngdv-demo') return false;
      const d = dev(c), k = el.dataset.k; d[k] = !d[k]; if (!d.demoAllowed) d.demoOn = false; c.save(); NG.system?.changed(c); c.transition('none'); c.render();
      return true;
    }
  };
})();
