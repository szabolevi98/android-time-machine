/* Android 6.0.1 Settings (Settings.apk MTC20K): the detail pages under Battery, Memory and Accounts, Location History,
   Bluetooth's received files, Apps' Show system, About phone's System updates and legal pages, the dashboard's search,
   Developer options' own screens and dialogs.
   - PowerUsageDetail (power_usage_details.xml): the entry's header (icon, label, its share and bar); for an app Force
     stop and App info (two_buttons_panel), for the screen / Wi-Fi / Bluetooth their settings; Use details (the
     usage_type_ rows BatterySipper has for the drain type, computed power in mAh of the 5X's 2700 mAh); the
     battery_desc_ / battery_sugg_ messages; Included packages for a shared uid. The figures follow the Battery list's.
   - ProcessStatsDetail (app_memory_settings.xml): the app's average use (proc_stats_ui), Frequency (always / sometimes /
     rarely running with the share of the period), Maximum usage, the app's processes.
   - AccountSyncSettings for the Google account: the account's header, every Google sync adapter of the image
     (mm-sync-adapters.js) with its check box and "Last synced", Sync now in the overflow. Add account: Google Play
     services' AccountIntroActivity (Add your account: the e-mail field, Next) and Gmail's account setup for Exchange,
     personal IMAP and POP3 (the address and password, Manual setup, Next); both reach their servers' error offline.
   - Google Location History (Google Play services' LocationHistorySettingsActivity): the switch bar (off), the device
     row, the summary, DELETE LOCATION HISTORY.
   - Received files (Bluetooth's BluetoothOppTransferHistory): Inbound transfers, Transfer history is empty., Clear.
   - Show system (ManageApplications with every package, mm-packages.js); System updates (Google Play services'
     SystemUpdateActivity: Your system is up to date., Last checked, Check for update); License (SettingsLicenseActivity:
     /system/etc/NOTICE.html.gz), Terms and conditions (Google Services Framework's SettingsTosActivity, Google legal:
     its additional terms), System WebView License (WebView's LicenseActivity); Copyright has no activity in the image
     and is removed (Utils.updatePreferenceToSpecificActivityOrRemove).
   - SearchResultsSummary: the search field in the action bar, the titles of every screen matching, with the screen
     they are on.
   - Developer options: Take bug report (bugreport_message, Report), Desktop backup password (SetFullBackupPassword),
     Running services (RunningServices: Device memory's bar and the running apps), Revoke USB debugging authorizations
     (adb_keys_warning_message), Select mock location app / Select debug app (AppPicker: Nothing), Inactive apps
     (Active / Inactive per app). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  const esc = (c, s) => c.safe(s);
  const H = MM.settingsHooks;
  const go = (c, screen, title) => MM.settingsGo(c, screen, title);
  const pair = (c, title, value) => `<div class="mmsx-pair"><span>${esc(c, title)}</span><b>${esc(c, value)}</b></div>`;
  const pct = (c, v) => new Intl.NumberFormat(c.locale(), {style: 'percent', maximumFractionDigits: 0}).format(v / 100);

  // -- Battery: PowerUsageDetail --------------------------------------------------------------------------------------
  const CAPACITY = 2700;
  const DRAIN = {
    screen: {icon: {mask: 'st-ic_settings_display_am_alpha.png'}, label: 'power_screen', rows: ['on_time', 'computed_power'], desc: 'battery_desc_display', sugg: 'battery_sugg_display', button: ['battery_action_display', 'xml:display_settings']},
    kernel: {icon: {img: 'st-ic_power_system.png'}, label: 'process_kernel_label', rows: ['cpu', 'cpu_foreground', 'wake_lock', 'computed_power']},
    cell: {icon: {img: 'st-ic_settings_cell_standby.png'}, label: 'power_cell', rows: ['on_time', 'no_coverage', 'computed_power'], desc: 'battery_desc_radio', sugg: 'battery_sugg_radio'},
    gms: {icon: {img: 'gms-ic_google.png'}, label: 'PrebuiltGmsCore/common_app_name', rows: ['cpu', 'cpu_foreground', 'wake_lock', 'gps', 'data_wifi_send', 'data_wifi_recv', 'computed_power'], app: 'gms', packages: ['com.google.android.gms', 'com.google.android.gsf', 'com.google.android.gsf.login', 'com.google.android.backuptransport', 'com.google.android.partnersetup']},
    system: {icon: {img: 'st-ic_power_system.png'}, label: 'framework/android_system_label', rows: ['cpu', 'cpu_foreground', 'wake_lock', 'computed_power'], packages: ['android', 'com.android.settings', 'com.android.providers.settings', 'com.android.location.fused', 'com.android.keychain', 'com.qualcomm.timeservice']},
    idle: {icon: {img: 'st-ic_settings_phone_idle.png'}, label: 'power_idle', rows: ['on_time', 'computed_power'], desc: 'battery_desc_standby'},
    wifi: {icon: {mask: 'st-ic_settings_wireless_alpha.png'}, label: 'power_wifi', rows: ['wifi_running', 'computed_power'], desc: 'battery_desc_wifi', sugg: 'battery_sugg_wifi', button: ['battery_action_wifi', 'wifi']}
  };
  MM.settingsScreens.batt = {
    title: () => T().t('details_title'),
    render(c, cur) {
      const t = T(), key = cur.screen.split(':')[1], d = DRAIN[key]; if (!d) return '';
      const e = (MM.batteryEntries?.(c) || []).find(x => x.key === key) || {share: 0, of: 0};
      const b = MM.battery(), usedMah = CAPACITY * (100 - b.level) / 100 * e.share / 100, sinceMs = (100 - b.level) * 240000;
      const icon = d.icon.mask ? `<i class="mmbt-ic" style="-webkit-mask-image:url('assets/${d.icon.mask}');mask-image:url('assets/${d.icon.mask}')"></i>` : `<img src="assets/${d.icon.img}" alt="">`;
      const val = r => ({on_time: MM.elapsed(c, sinceMs * (key === 'screen' ? .3 : key === 'cell' ? 1 : .7)), no_coverage: MM.elapsed(c, 0), computed_power: `${Math.round(usedMah)} mAh`,
        cpu: MM.elapsed(c, sinceMs * e.share / 400), cpu_foreground: MM.elapsed(c, sinceMs * e.share / 1600), wake_lock: MM.elapsed(c, sinceMs * e.share / 900), gps: MM.elapsed(c, sinceMs * .01),
        data_wifi_send: String(Math.round(e.share * 37)), data_wifi_recv: String(Math.round(e.share * 112)), wifi_running: MM.elapsed(c, sinceMs)})[r];
      const two = d.app ? `<div class="mmai-buttons"><button type="button" class="mmai-button" data-action="mmsx-battstop">${esc(c, t.t('battery_action_stop'))}</button><i></i><button type="button" class="mmai-button" data-action="mmsx-battinfo">${esc(c, t.t('battery_action_app_details'))}</button></div>`
        : d.button ? `<div class="mmai-buttons"><button type="button" class="mmai-button" data-action="mmsx-battgo">${esc(c, t.t(d.button[0]))}</button></div>` : '';
      return `<div class="mmst-list"><div class="mmsx-batthead">${icon}<span><b>${esc(c, t.t(d.label))}</b><i class="mmsx-bar"><i style="width:${e.of.toFixed(1)}%"></i></i></span><em>${esc(c, pct(c, e.share))}</em></div>${two}
        ${d.app ? `<div class="mmst-cat">${esc(c, t.t('controls_subtitle'))}</div><button type="button" class="mmst-pref" data-action="mmsx-batthp"><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('high_power_apps'))}</span></span></button>` : ''}
        <div class="mmst-cat">${esc(c, t.t('details_subtitle'))}</div>${d.rows.map(r => pair(c, t.t(r === 'computed_power' ? 'usage_type_computed_power' : `usage_type_${r}`), val(r))).join('')}
        ${d.desc ? `<div class="mmst-cat"></div><div class="mmsx-text small">${esc(c, t.t(d.desc))}${d.sugg ? `\n${esc(c, t.t(d.sugg))}` : ''}</div>` : ''}
        ${d.packages ? `<div class="mmst-cat">${esc(c, t.t('packages_subtitle'))}</div>${d.packages.map(p => { const k = (MM.systemPackages || []).find(x => x.pkg === p); return `<div class="mmap-row static"><img src="${k?.icon || 'assets/fw-sym_def_app_icon.png'}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, k?.label?.[c.lang] || p)}</span></span></span></div>`; }).join('')}` : ''}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), d = DRAIN[cur.screen.split(':')[1]];
      if (name === 'mmsx-battgo') { go(c, d.button[1], ''); return true; }
      if (name === 'mmsx-batthp') { go(c, 'high-power', t.t('high_power_apps')); return true; }
      if (name === 'mmsx-battinfo') { go(c, 'high-power', t.t('high_power_apps')); return true; }
      if (name === 'mmsx-battstop') { c.dialog({title: t.t('force_stop_dlg_title'), message: t.t('force_stop_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok')}]}); return true; }
      return false;
    }
  };

  // -- Memory: ProcessStatsDetail -------------------------------------------------------------------------------------
  MM.settingsScreens['mem-app'] = {
    title: (c, cur) => MM.appLabel(c, cur.screen.split(':')[1]),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], a = (MM.memoryApps?.(c) || []).find(x => x.id === id) || {bytes: 0}, recent = (c.data.recentApps || []).indexOf(id);
      const share = recent < 0 ? 18 : Math.max(30, 100 - recent * 12), freq = share >= 96 ? 'always_running' : share >= 25 ? 'sometimes_running' : 'rarely_running';
      const head = `<div class="mmai-head"><div class="mmap-row static"><img src="${MM.appsData[id]?.icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, MM.appLabel(c, id))}</span></span></span></div></div>`;
      return `<div class="mmst-list">${head}<div class="mmst-cat">${esc(c, t.t('average_memory_use'))}</div><div class="mmme-head"><div class="mmme-state">${esc(c, MM.fileSize(c, a.bytes, true))}</div><div class="mmme-bar"><i style="width:${Math.min(100, a.bytes / 1932735283 * 100 * 4).toFixed(1)}%"></i></div></div>
        ${pair(c, t.t('running_frequency'), t.fmt(freq, null, pct(c, share)))}${pair(c, t.t('memory_maximum_usage'), MM.fileSize(c, a.bytes * 1.6, true))}
        <div class="mmst-cat">${esc(c, t.t('memory_details'))}</div>${pair(c, MM.appsData[id]?.pkg || id, MM.fileSize(c, a.bytes, true))}</div>`;
    }
  };

  // -- Accounts -------------------------------------------------------------------------------------------------------
  const lastSync = c => new Intl.DateTimeFormat(c.locale(), {dateStyle: 'short', timeStyle: 'short'}).format(new Date(S(c).lastSync || Date.now() - 41 * 60000));
  MM.settingsScreens['account-sync'] = {
    title: () => T().t('PrebuiltGmsCore/common_google_platform_settings') || 'Google',
    actions: c => MM.menu.button(c),
    render(c) {
      const t = T(), off = new Set(S(c).syncOff || []);
      return `<div class="mmst-list"><div class="mmsx-acct big"><img src="assets/gms-auth_gls_ic_google_selected.png" alt=""><span><b>${esc(c, MM.account.email)}</b><small>${esc(c, t.t(off.size === (MM.syncAdapters || []).length ? 'sync_disabled' : 'sync_enabled'))}</small></span></div>
        ${(MM.syncAdapters || []).map(a => `<button type="button" class="mmst-pref" data-action="mmsx-sync" data-a="${esc(c, a.authority)}"><span class="mmst-texts"><span class="mmst-title">${esc(c, a[c.lang] || a.en)}</span><span class="mmst-summary">${esc(c, off.has(a.authority) ? t.t('sync_disabled') : t.fmt('last_synced', null, lastSync(c)))}</span></span><span class="mmst-widget"><i class="mmst-check${off.has(a.authority) ? '' : ' on'}"></i></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mm-menu') { c.menu([{label: t.t('sync_menu_sync_now'), action: c => { s.lastSync = Date.now(); c.save(); c.render(); }}]); return true; }
      if (name === 'mmsx-sync') { const a = el.dataset.a, off = new Set(s.syncOff || []); off.has(a) ? off.delete(a) : off.add(a); s.syncOff = [...off]; c.save(); c.render(); return true; }
      return false;
    }
  };
  MM.settingsScreens['account-setup'] = {
    full: true,
    render(c, cur) {
      const t = T(), type = cur.screen.split(':')[1], u = c.ui.addAccount || (c.ui.addAccount = {email: '', password: ''});
      // Google Play services' AccountIntroActivity: Checking info…, then the sign-in page from Google's servers, which the
      // simulator cannot reach: ShowErrorActivity's Couldn't sign in.
      if (type === 'google') return u.failed ? `<div class="mmsx-gsign"><img class="mmsx-glogo" src="assets/gms-ic_google.png" alt=""><h1>${esc(c, t.t('PrebuiltGmsCore/auth_show_error_activity_title'))}</h1><p>${esc(c, t.t('PrebuiltGmsCore/auth_error_generic_server_error'))}</p><div class="mmsx-gfoot"><i></i><button type="button" class="next" data-action="mmsx-acctback">${esc(c, t.t('framework/ok'))}</button></div></div>`
        : `<div class="mmsx-gsign"><img class="mmsx-glogo" src="assets/gms-ic_google.png" alt=""><h1>${esc(c, t.t('PrebuiltGmsCore/auth_gls_name_checking_info_title'))}</h1><div class="mmsx-gspin"><svg class="mmdlg-spinner" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"/></svg></div></div>`;
      const g = 'PrebuiltGmail/';
      return `<div class="mmsx-esetup"><div class="mmsx-ebar">${esc(c, t.t(g + 'account_setup_basics_title'))}</div><div class="mmsx-ebody"><h2>${esc(c, t.t(g + 'account_setup_basics_headline'))}</h2>
        <input class="mmsx-efield" type="email" data-f="email" value="${esc(c, u.email)}" placeholder="${esc(c, t.t(g + 'account_setup_basics_email_label'))}" autocomplete="off"></div>
        <div class="mmsx-efoot"><button type="button" data-action="mmsx-emanual">${esc(c, t.t(g + 'account_setup_basics_manual_setup_action'))}</button><button type="button" data-action="mmsx-enext">${esc(c, t.t('PrebuiltGmail/next'))}</button></div></div>`;
    },
    mount(c, root, cur) {
      for (const f of root.querySelectorAll('[data-f]')) f.addEventListener('input', () => { c.ui.addAccount[f.dataset.f] = f.value; });
      if (cur.screen.endsWith(':google') && !c.ui.addAccount.failed) setTimeout(() => { if (c.ui.addAccount) { c.ui.addAccount.failed = true; c.render(); } }, 1600);
    },
    back(c) { c.ui.addAccount = null; return false; },
    action(c, name) {
      const t = T(), u = c.ui.addAccount;
      if (name === 'mmsx-acctback') { c.ui.addAccount = null; c.ui.settings.stack.pop(); c.render(); return true; }
      // Without a working connection to Google's or the mail servers the setup ends in their own errors.
      if (name === 'mmsx-enext' || name === 'mmsx-emanual') {
        if (!u.email.trim()) return true;
        c.dialog({progress: t.t('PrebuiltGmail/account_setup_check_settings_check_incoming_msg'), cancelable: false});
        setTimeout(() => { c.closeDialog(); c.dialog({title: t.t('PrebuiltGmail/account_setup_failed_dlg_title'), message: t.t('PrebuiltGmail/account_setup_failed_ioerror'), buttons: [{label: t.t('PrebuiltGmail/account_setup_failed_dlg_edit_details_action')}]}); }, 1500);
        return true;
      }
      return false;
    }
  };

  // -- Location History -------------------------------------------------------------------------------------------------
  MM.settingsScreens['location-history'] = {
    title: () => T().t('PrebuiltGmsCore/location_settings_location_history_activity_title'),
    bar: c => `<button type="button" class="mmst-switchbar" data-action="mmsx-lh"><span>${esc(c, T().t(S(c).locationHistory ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${S(c).locationHistory ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`,
    render(c) {
      const t = T(), on = !!S(c).locationHistory;
      return `<div class="mmst-list"><div class="mmst-pref"><span class="mmst-texts"><span class="mmst-title">Nexus 5X</span><span class="mmst-summary">${esc(c, t.t(on ? 'PrebuiltGmsCore/location_ulr_history_enabled_text' : 'PrebuiltGmsCore/location_ulr_history_disabled_text'))}</span></span></div>
        <div class="mmsx-text small">${esc(c, t.t('PrebuiltGmsCore/location_settings_location_history_summary_full'))}</div><div class="mmsx-btnrow"><button type="button" class="mmsx-flat" data-action="mmsx-lhdelete">${esc(c, t.t('PrebuiltGmsCore/location_settings_delete_location_history'))}</button></div></div>`;
    },
    action(c, name) {
      const t = T(), s = S(c);
      if (name === 'mmsx-lh') {
        if (s.locationHistory) c.dialog({title: t.t('PrebuiltGmsCore/location_settings_confirm_location_history_off_title'), message: t.t('PrebuiltGmsCore/location_settings_confirm_location_history_off_body'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { s.locationHistory = false; c.save(); c.render(); }}]});
        else c.dialog({message: t.fmt('PrebuiltGmsCore/location_settings_dialog_message_ulr', null, MM.account.email), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => { s.locationHistory = true; c.save(); c.render(); }}]});
        return true;
      }
      if (name === 'mmsx-lhdelete') { c.dialog({message: t.t('PrebuiltGmsCore/location_settings_confirm_deleting_location_history_body'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok')}]}); return true; }
      return false;
    }
  };

  // -- Bluetooth received files ---------------------------------------------------------------------------------------
  MM.settingsScreens['bt-history'] = {
    title: () => T().t('Bluetooth/inbound_history_title'),
    actions: c => MM.menu.button(c),
    render: c => `<div class="mmst-empty center"><span>${esc(c, T().t('Bluetooth/no_transfers'))}</span></div>`,
    action(c, name) { if (name !== 'mm-menu') return false; c.menu([{label: T().t('Bluetooth/transfer_clear_dlg_title'), disabled: true, action: () => {}}]); return true; }
  };

  // -- Apps: Show system --------------------------------------------------------------------------------------------
  MM.settingsScreens['apps-all'] = {
    title: () => T().t('applications_settings'),
    actions: c => MM.menu.button(c),
    render(c) {
      const col = new Intl.Collator(c.locale(), {sensitivity: 'base'}), byPkg = {};
      for (const id of Object.keys(MM.appsData)) byPkg[MM.appsData[id].pkg] = id;
      const list = (MM.systemPackages || []).map(p => ({...p, id: byPkg[p.pkg], name: byPkg[p.pkg] ? MM.appLabel(c, byPkg[p.pkg]) : p.label[c.lang] || p.label.en, icon: byPkg[p.pkg] ? MM.appsData[byPkg[p.pkg]].icon : p.icon})).sort((a, b) => col.compare(a.name, b.name));
      return `<div class="mmst-list">${list.map(p => `<button type="button" class="mmap-row" data-action="mmsx-sysapp" data-app="${p.id || ''}"><img src="${p.icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, p.name)}</span><span class="mmap-size">${esc(c, MM.fileSize(c, p.size))}</span></span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'mm-menu') { c.menu([{label: t.t('menu_hide_system'), action: c => { c.ui.settings.stack.pop(); c.render(); }}]); return true; }
      if (name === 'mmsx-sysapp') { if (el.dataset.app) go(c, `app:${el.dataset.app}`, t.t('application_info_label')); return true; }
      return false;
    }
  };

  // -- About phone ----------------------------------------------------------------------------------------------------
  MM.settingsScreens['system-update'] = {
    full: true,
    render(c) {
      const t = T(), checking = (c.ui.updateCheck || 0) > Date.now();
      if (checking) setTimeout(() => c.ui.view === 'settings' && c.render(), c.ui.updateCheck - Date.now() + 30);
      const last = new Intl.DateTimeFormat(c.locale(), {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(S(c).updateChecked || Date.now() - 3 * 3600000));
      return `<div class="mmsx-update"><div class="mmsx-ubar"><button type="button" data-action="mmsx-uback"><img src="assets/gms-abc_ic_ab_back_mtrl_am_alpha.png" alt=""></button><span>${esc(c, t.t('PrebuiltGmsCore/system_update_activity_title'))}</span></div>
        <div class="mmsx-ubody">${checking ? `<p>${esc(c, t.t('PrebuiltGmsCore/system_update_checking_status_text'))}…</p>` : `<p>${esc(c, t.t('PrebuiltGmsCore/system_update_no_update_content_text'))}</p><p class="small">${esc(c, t.t('PrebuiltGmsCore/system_update_last_checkin').replace('^1', last))}</p>`}</div>
        <div class="mmsx-ufoot"><button type="button" data-action="mmsx-ucheck"${checking ? ' disabled' : ''}>${esc(c, t.t('PrebuiltGmsCore/system_update_check_now_button_text'))}</button></div></div>`;
    },
    action(c, name) {
      if (name === 'mmsx-uback') { c.ui.settings.stack.pop(); c.render(); return true; }
      if (name === 'mmsx-ucheck') { c.ui.updateCheck = Date.now() + 2500; S(c).updateChecked = Date.now() + 2500; c.save(); c.render(); return true; }
      return false;
    }
  };
  // An HTML file of the image in a page of its own: the license (gzip, inflated here as HTMLViewer does) or the terms.
  MM.settingsScreens.html = {
    title: (c, cur) => cur.title,
    render: () => '<div class="mmsx-html"><iframe title=""></iframe></div>',
    mount(c, root, cur) {
      const frame = root.querySelector('.mmsx-html iframe'); if (!frame) return;
      const file = cur.screen.split(':').slice(1).join(':');
      (async () => {
        const res = await fetch(`assets/${file}`);
        let html;
        if (file.endsWith('.gz') && 'DecompressionStream' in window) html = await new Response(res.body.pipeThrough(new DecompressionStream('gzip'))).text();
        else html = await res.text();
        frame.srcdoc = html.replace(/@import url\([^)]*\);?/g, '');
      })().catch(() => { frame.srcdoc = `<p>${esc(c, T().t('settings_license_activity_unavailable'))}</p>`; });
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

  // -- Search ---------------------------------------------------------------------------------------------------------
  function index(c) {
    const out = [], seen = new Set();
    const add = (title, where, screen) => { if (!title || seen.has(title + where)) return; seen.add(title + where); out.push({title, where, screen}); };
    for (const cat of MM.settingsXml.dashboard_categories.c) for (const tile of cat.c || []) if (tile.title) add(MM.settingsStr(tile.title), T().t('settings_label_launcher'), tile.fragment ? null : null);
    const walk = (n, where, xml) => { for (const k of n.c || []) { if (k.title && k.t !== 'PreferenceCategory') add(MM.settingsStr(k.title), where, `xml:${xml}`); walk(k, where, xml); } };
    for (const [xml, n] of Object.entries(MM.settingsXml)) if (n.title && !/^(dashboard|timezones)/.test(xml)) walk(n, MM.settingsStr(n.title), xml);
    return out;
  }
  MM.settingsScreens.search = {
    title: () => '',
    bar: c => '',
    render(c) {
      const t = T(), q = (c.ui.settingsQ || '').trim().toLowerCase();
      const hits = q ? index(c).filter(x => x.title.toLowerCase().includes(q)).slice(0, 60) : [];
      return `<div class="mmsx-search"><input class="mmsx-sq" value="${esc(c, c.ui.settingsQ || '')}" placeholder="${esc(c, t.t('search_menu'))}" autocomplete="off"></div><div class="mmst-list">${q ? `<div class="mmst-cat">${esc(c, t.t('search_results_label'))}</div>` : ''}${hits.map(h => `<button type="button" class="mmst-pref" data-action="mmsx-hit" data-screen="${esc(c, h.screen || '')}" data-title="${esc(c, h.where)}"><span class="mmst-texts"><span class="mmst-title">${esc(c, h.title)}</span><span class="mmst-summary">${esc(c, h.where)}</span></span></button>`).join('')}</div>`;
    },
    mount(c, root) {
      const f = root.querySelector('.mmsx-sq'); if (!f) return;
      f.addEventListener('input', () => { const p = f.selectionStart; c.ui.settingsQ = f.value; c.render(); const g = c.el.viewport.querySelector('.mmsx-sq'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
      if (document.activeElement !== f) setTimeout(() => f.focus(), 40);
    },
    back(c) { c.ui.settingsQ = ''; return false; },
    action(c, name, el) { if (name !== 'mmsx-hit') return false; if (el.dataset.screen) go(c, el.dataset.screen, el.dataset.title); return true; }
  };

  // -- Developer options ----------------------------------------------------------------------------------------------
  const picker = (c, title) => c.dialog({title: T().t('select_application'), items: [{html: `<span class="mmst-choice"><i class="mmw-radio on"></i><span>${esc(c, T().t('no_application'))}</span></span>`}], onItem: () => {}});
  MM.devClick = (c, key) => {
    const t = T(), s = S(c);
    if (key === 'bugreport') { c.dialog({title: t.t('framework/bugreport_title'), message: t.t('framework/bugreport_message'), buttons: [{label: t.t('cancel')}, {label: t.t('report'), action: c => c.toast(t.t('framework/bugreport_title'))}]}); return true; }
    if (key === 'clear_adb_keys') { c.dialog({message: t.t('adb_keys_warning_message'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok')}]}); return true; }
    if (key === 'mock_location_app' || key === 'debug_app') { picker(c); return true; }
    if (key === 'local_backup_password') { go(c, 'backup-password', t.t('local_backup_password_title')); return true; }
    if (key === 'running_apps') { go(c, 'running', t.t('runningservices_settings_title')); return true; }
    if (key === 'inactive_apps') { go(c, 'inactive', t.t('inactive_apps_title')); return true; }
    return false;
  };
  MM.settingsScreens['backup-password'] = {
    title: () => T().t('local_backup_password_title'),
    render(c) {
      const t = T(), f = (k, p) => `<label>${esc(c, t.t(p))}<input type="password" data-f="${k}" autocomplete="off"></label>`;
      return `<div class="mmsx-form">${f('cur', 'current_backup_pw_prompt')}${f('new', 'new_backup_pw_prompt')}${f('again', 'confirm_new_backup_pw_prompt')}</div><div class="mmsx-foot"><button type="button" data-action="mmsx-bpcancel">${esc(c, t.t('backup_pw_cancel_button_text'))}</button><button type="button" data-action="mmsx-bpset">${esc(c, t.t('backup_pw_set_button_text'))}</button></div>`;
    },
    mount(c, root) { c.ui.backupPw = {}; for (const i of root.querySelectorAll('[data-f]')) i.addEventListener('input', () => { c.ui.backupPw[i.dataset.f] = i.value; }); },
    action(c, name) {
      const t = T(), p = c.ui.backupPw || {}, s = S(c);
      if (name === 'mmsx-bpcancel') { c.ui.settings.stack.pop(); c.render(); return true; }
      if (name !== 'mmsx-bpset') return false;
      if ((p.new || '') !== (p.again || '')) { c.toast(t.t('local_backup_password_toast_confirmation_mismatch')); return true; }
      if (s.backupPassword && p.cur !== s.backupPassword) { c.toast(t.t('local_backup_password_toast_validation_failure')); return true; }
      s.backupPassword = p.new || ''; c.save(); c.toast(t.t('local_backup_password_toast_success')); c.ui.settings.stack.pop(); c.render();
      return true;
    }
  };
  MM.settingsScreens.running = {
    title: () => T().t('runningservices_settings_title'),
    render(c) {
      const t = T(), total = 1932735283, sys = 702545920, apps = 398458880, free = total - sys - apps;
      const running = (c.ui.recent || []).filter(id => MM.appsData[id]).slice(0, 6);
      const seg = (cls, v) => `<i class="${cls}" style="width:${(v / total * 100).toFixed(1)}%"></i>`;
      return `<div class="mmst-list"><div class="mmsx-ram"><div class="mmsx-ramtitle">${esc(c, t.t('running_processes_header_title'))}</div><div class="mmsx-rambar">${seg('sys', sys)}${seg('app', apps)}${seg('free', free)}</div>
        <div class="mmsx-ramkeys"><span><i class="sys"></i>${esc(c, t.t('running_processes_header_system_prefix'))} ${esc(c, MM.fileSize(c, sys, true))}</span><span><i class="app"></i>${esc(c, t.t('running_processes_header_apps_prefix'))} ${esc(c, MM.fileSize(c, apps, true))}</span><span><i class="free"></i>${esc(c, t.t('running_processes_header_free_prefix'))} ${esc(c, MM.fileSize(c, free, true))}</span></div><div class="mmst-cat">${esc(c, t.t('running_processes_header_footer'))}</div></div>
        ${running.map((id, i) => `<div class="mmap-row static"><img src="${MM.appsData[id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, MM.appLabel(c, id))}</span><span class="mmap-size">${esc(c, MM.fileSize(c, 15e6 + i * 4.2e6, true))}</span></span><span class="mmap-sub">${esc(c, t.fmt('running_processes_item_description_s_s', null, 1, 1))}</span></span></div>`).join('')}</div>`;
    }
  };
  MM.settingsScreens.inactive = {
    title: () => T().t('inactive_apps_title'),
    render(c) {
      const t = T(), off = new Set(S(c).inactiveApps || []), col = new Intl.Collator(c.locale()), seen = new Set();
      const ids = Object.keys(MM.appsData).filter(id => { const p = MM.appsData[id].pkg; if (seen.has(p)) return false; seen.add(p); return true; }).sort((a, b) => col.compare(MM.appLabel(c, a), MM.appLabel(c, b)));
      return `<div class="mmst-list">${ids.map(id => `<button type="button" class="mmap-row" data-action="mmsx-inactive" data-app="${id}"><img src="${MM.appsData[id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${esc(c, MM.appLabel(c, id))}</span></span><span class="mmap-sub">${esc(c, t.t(off.has(id) ? 'inactive_app_inactive_summary' : 'inactive_app_active_summary'))}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) { if (name !== 'mmsx-inactive') return false; const s = S(c), off = new Set(s.inactiveApps || []), id = el.dataset.app; off.has(id) ? off.delete(id) : off.add(id); s.inactiveApps = [...off]; c.save(); c.render(); return true; }
  };
})();
