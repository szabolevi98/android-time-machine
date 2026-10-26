/* Android 2.3.6 Settings pages that are not preference XML: ManageApplications (manage_applications.xml with the framework
   tabs Downloaded / USB storage / Running / All, manage_applications_item rows and the LinearColorBar storage bar),
   InstalledAppDetails (installed_app_details.xml), RunningServices (running_processes_view / _item), PowerUsageSummary
   (preference_powergauge rows) and PowerUsageDetail (power_usage_details.xml), the legal information screen with the
   open source licenses, and MasterClear (master_clear_primary.xml / master_clear_final.xml). Strings come from
   gb-strings-settings2.js. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.settings2), text = (lang, key) => R.t(key, lang);
  const PAGES = new Set(['sync', 'sync-account', 'apps', 'running', 'app-info', 'battery', 'battery-detail', 'about-legal', 'gb-licenses', 'reset-info', 'gb-reset-final']);
  // Formatter.formatFileSize: KB / MB / GB with two significant decimals.
  function size(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let v = bytes, i = 0;
    while (v >= 900 && i < units.length - 1) { v /= 1024; i++; }
    return `${v < 100 ? v.toFixed(2) : Math.round(v)}${units[i]}`;
  }
  // Stable per-app sizes for the simulator's packages (code, data, cache in bytes).
  function sizes(id) {
    let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return {code: 900000 + h % 5200000, data: 20000 + (h >>> 7) % 900000, cache: (h >>> 13) % 120000};
  }
  const titleBar = label => `<div class="gb-titlebar">${e(label)}</div>`;
  const separator = label => `<div class="gbset-cat">${e(label)}</div>`;
  const button = (action, label, id = '', disabled = false) => `<button type="button" class="gbsp-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}${disabled ? ' disabled' : ''}>${e(label)}</button>`;

  // manage_applications_item: 48 dip icon, bold 18 sp name, 14 sp size.
  function appsPage(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab || 'downloaded';
    const tabs = [['downloaded', 'filter_apps_third_party'], ['sdcard', 'filter_apps_onsdcard'], ['running', 'filter_apps_running'], ['all', 'filter_apps_all']];
    const head = `<div class="gbp-tabs gbsp-tabs" role="tablist">${tabs.map(([id, key]) => `<button class="gbp-tab${tab === id ? ' selected' : ''}" role="tab" aria-selected="${tab === id}" data-action="gbsp-tab" data-id="${id}"><span class="gbsp-tablabel">${e(T(key))}</span></button>`).join('')}</div>`;
    if (tab === 'running') return `<div class="app-view gbset gbsp" data-no-translate>${head}${running(ctx)}</div>`;
    // The simulator's applications are part of the system image: Downloaded and USB storage are empty, All lists them.
    let list = tab === 'all' ? [...ctx.apps] : [];
    list.sort((a, b) => ctx.sortBySize ? (sizes(b.id).code + sizes(b.id).data) - (sizes(a.id).code + sizes(a.id).data) : a.name.localeCompare(b.name, ctx.locale));
    const rows = list.map(app => `<button class="gbsp-app" data-action="gbsp-app" data-id="${e(app.id)}">${app.icon}<span><b>${e(app.name)}</b><small>${e(size(sizes(app.id).code + sizes(app.id).data + sizes(app.id).cache))}</small></span></button>`).join('');
    const used = 0.26, free = ctx.freeText;
    const bar = `<div class="gbsp-storage"><span class="gbsp-storage-label">${e(T('internal_storage'))}</span><div class="gbsp-colorbar"><i style="width:${used * 100}%"></i></div><div class="gbsp-storage-text"><span>${e(AndroidStrings.format(T('service_foreground_processes'), ctx.usedText))}</span><span>${e(AndroidStrings.format(T('service_background_processes'), free))}</span></div></div>`;
    return `<div class="app-view gbset gbsp" data-no-translate>${head}<div class="gbsp-list">${rows || `<p class="gbsp-empty">${e(T('no_applications'))}</p>`}</div>${bar}</div>`;
  }
  // RunningServices: running_processes_item with the process / service counts, size and uptime; RAM bar at the bottom.
  function running(ctx) {
    const T = key => text(ctx.lang, key);
    const rows = ctx.running.map(item => `<button class="gbsp-app running" data-action="gbsp-app" data-id="${e(item.id)}">${item.icon}<span><span class="gbsp-line"><b>${e(item.name)}</b><small>${e(size(item.ram))}</small></span><span class="gbsp-line"><small>${e(AndroidStrings.format(T('running_processes_item_description_s_s'), 1, 1))}</small><small>${e(item.uptime)}</small></span></span></button>`).join('');
    return `<div class="gbsp-list">${rows || `<p class="gbsp-empty">${e(T('no_running_services'))}</p>`}</div><div class="gbsp-storage"><span class="gbsp-storage-label">RAM</span><div class="gbsp-colorbar"><i style="width:58%"></i></div><div class="gbsp-storage-text"><span>${e(AndroidStrings.format(T('service_foreground_processes'), '196MB'))}</span><span>${e(AndroidStrings.format(T('service_background_processes'), '144MB'))}</span></div></div>`;
  }
  // Each package's versionName in the Nexus S GRK39F image (PackageManager, as _aosp/crespo/launcher.txt lists them): the
  // Phone and Contacts are one package, Maps, Navigation, Places and Latitude another.
  const VERSIONS = {phone: '2.3.6', people: '2.3.6', messaging: '2.3.6', browser: '2.3.6', camera: '1', gallery: '1.1.30682', settings: '2.3.6',
    clock: '2.0.2', calendar: '2.3.6', calculator: '2.3.6', music: '2.3.6', email: '2.3.4', 'play-store': '2.3.4', search: '1.1.2.189904',
    downloads: '2.3.6', gmail: '2.3.5.1', maps: '5.4.0', navigation: '5.4.0', places: '5.4.0', latitude: '5.4.0', talk: '1.3', youtube: '2.1.6',
    'news-weather': '1.3.04', books: '1.2.2', earth: '2.0.1', 'voice-search': '2.1.3', 'car-home': '2.2.1.2', 'google-voice': '0.4.2.30', tags: '1.1',
    'voice-dialer': '2.3.6'};
  // InstalledAppDetails: app snippet, Force stop / Uninstall, Storage with dotted leaders, Cache, Launch by default, Permissions.
  function appInfo(ctx) {
    const T = key => text(ctx.lang, key), app = ctx.app;
    if (!app) return null;
    const s = ctx.cleared ? {...sizes(app.id), data: 0, cache: 0} : sizes(app.id);
    const pair = (label, value) => `<div class="gbsp-pair"><span>${e(label)}</span><i></i><span>${e(value)}</span></div>`;
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('application_info_label'))}<div class="gbsp-scroll">
      <div class="gbsp-snippet">${app.icon}<span><b>${e(app.name)}</b><small>${e(AndroidStrings.format(T('version_text'), VERSIONS[app.id] || '2.3.6'))}</small></span></div>
      <div class="gbsp-buttons">${button('gbsp-force-stop', T('force_stop'), app.id, !ctx.isRunning)}${button('gbsp-uninstall', T('uninstall_text'), app.id, true)}</div>
      ${separator(T('storage_label'))}<div class="gbsp-pairs">${pair(T('total_size_label'), size(s.code + s.data))}${pair(T('application_size_label'), size(s.code))}${pair(T('data_size_label'), size(s.data))}</div>
      <div class="gbsp-buttons center">${button('gbsp-clear-data', T('clear_user_data_text'), app.id, !s.data)}</div>
      ${separator(T('cache_header_label'))}<div class="gbsp-pairs">${pair(T('cache_size_label'), size(s.cache))}</div><div class="gbsp-buttons center">${button('gbsp-clear-cache', T('clear_cache_btn_text'), app.id, !s.cache)}</div>
      ${separator(T('auto_launch_label'))}<p class="gbsp-small">${e(T('auto_launch_disable_text'))}</p><div class="gbsp-buttons center">${button('noop', T('clear_activities'), '', true)}</div>
      ${separator(T('permissions_label'))}<p class="gbsp-small">${e(T('security_settings_desc'))}</p>${(ctx.permissions || []).map(p => `<div class="gbsp-perm"><b>${e(p[0])}</b><small>${e(p[1])}</small></div>`).join('')}
    </div></div>`;
  }
  // PowerUsageSummary: preference_powergauge rows (48 dip icon, title, bold percent, the app_gauge bar on #80404040).
  function battery(ctx) {
    const T = key => text(ctx.lang, key);
    const rows = ctx.usage.map(item => `<button class="gbsp-gauge" data-action="gbsp-battery-item" data-id="${e(item.id)}">${item.icon}<span class="gbsp-gauge-body"><span class="gbsp-line"><span>${e(item.name)}</span><b>${item.percent}%</b></span><span class="gbsp-bar"><i style="width:${(item.percent / ctx.usage[0].percent * 100).toFixed(1)}%"></i></span></span></button>`).join('');
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('power_usage_summary_title'))}<div class="gbsp-scroll"><div class="gbsp-onbattery">${e(AndroidStrings.format(T('battery_stats_on_battery'), ctx.onBattery))}</div>${separator(T('battery_since_unplugged'))}${rows}</div></div>`;
  }
  function batteryDetail(ctx) {
    const T = key => text(ctx.lang, key), item = ctx.usage.find(u => u.id === ctx.item) || ctx.usage[0];
    const details = item.details.map(([label, value]) => `<div class="gbsp-detail"><b>${e(T(label))}</b><span>${e(value)}</span></div>`).join('');
    const action = item.action ? `${separator(T('controls_subtitle'))}<div class="gbsp-action"><span>${e(item.actionText || '')}</span>${button(item.action, T(item.actionLabel), item.actionId || '')}</div>` : '';
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('details_title'))}<div class="gbsp-scroll"><div class="gbsp-gauge static">${item.icon}<span class="gbsp-gauge-body"><span class="gbsp-line"><span>${e(item.name)}</span><b>${item.percent}%</b></span><span class="gbsp-bar"><i style="width:${(item.percent / ctx.usage[0].percent * 100).toFixed(1)}%"></i></span></span></div>${item.app ? `<div class="gbsp-buttons">${button('gbsp-force-stop', T('battery_action_stop'), item.app)}${button('gbsp-app', T('battery_action_app_details'), item.app)}</div>` : ''}${separator(T('details_subtitle'))}<div class="gbsp-details">${details}</div>${action}</div></div>`;
  }
  // device_info_settings "legal_information": Open source licenses (Google legal belongs to the Google apps).
  function legal(ctx) {
    const T = key => text(ctx.lang, key);
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('legal_information'))}<div class="gbsp-scroll"><button class="gbset-row" data-action="gbset-go" data-id="gb-licenses"><span class="gbset-text"><span class="gbset-title">${e(T('settings_license_activity_title'))}</span></span></button></div></div>`;
  }
  // SettingsLicenseActivity: the NOTICE.html of the build in a WebView.
  function licenses(ctx) {
    const T = key => text(ctx.lang, key);
    const notices = ['Android Open Source Project', 'Apache License, Version 2.0', 'The Android Open Source Project', 'WebKit', 'OpenSSL', 'zlib', 'FreeType', 'libpng', 'SQLite', 'Linux kernel (GPL v2)'];
    return `<div class="app-view gbset gbsp gbsp-licenses" data-no-translate>${titleBar(T('settings_license_activity_title'))}<div class="gbsp-scroll gbsp-web"><h3>Notices for files:</h3>${notices.map(n => `<p><b>${e(n)}</b><br>Copyright the respective authors. Licensed under the terms that accompany the source code.</p>`).join('')}</div></div>`;
  }
  // MasterClear: master_clear_desc (18 sp), the Erase USB storage check box, the 150 dip "Reset phone" button; then the final screen.
  function reset(ctx) {
    const T = key => text(ctx.lang, key);
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('master_clear_title'))}<div class="gbsp-info"><div class="gbsp-scroll"><p class="gbsp-desc">${e(T('master_clear_desc'))}</p><label class="gbsp-erase"><input type="checkbox" class="gbsp-check" data-gbsp-erase${ctx.eraseExternal ? ' checked' : ''}><span><span>${e(T('erase_external_storage'))}</span><small>${e(T('erase_external_storage_description'))}</small></span></label></div>${button('gbsp-reset-initiate', T('master_clear_button_text'))}</div></div>`;
  }
  function resetFinal(ctx) {
    const T = key => text(ctx.lang, key);
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(T('master_clear_title'))}<div class="gbsp-info"><p class="gbsp-final">${e(T('master_clear_final_desc'))}</p>${button('factory-reset-confirmed', T('master_clear_final_button_text'))}</div></div>`;
  }
  /* AccountsAndSyncSettings (packages/apps/AccountsAndSyncSettings): ManageAccountsSettings with General sync settings and
     Manage accounts above the bottom_bar "Add account" button; AccountSyncSettings with the title_bar header (48 dip provider
     icon, bold account, provider), "Data & synchronization" SyncStateCheckBoxPreferences and "Remove account". */
  const ACC = AndroidStrings.resources(() => window.GBStrings?.accounts), acc = (lang, key) => ACC.t(key, lang);
  const checkRow = (key, title, summary, on, action = 'gbset-check') => `<button class="gbset-row" data-action="${action}" data-id="${e(key)}" role="checkbox" aria-checked="${on}"><span class="gbset-text"><span class="gbset-title">${e(title)}</span>${summary ? `<span class="gbset-sum">${e(summary)}</span>` : ''}</span><img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}.png" alt=""></button>`;
  function syncPage(ctx) {
    const A = key => acc(ctx.lang, key), s = ctx.settings, on = s.backgroundData !== false && s.autoSync !== false;
    const account = ctx.accountRemoved ? '' : `<button class="gbset-row gbacc-account" data-action="gbset-go" data-id="sync-account"><img class="gbacc-provider" src="assets/email.png" alt=""><span class="gbset-text"><span class="gbset-title">${e(ctx.account)}</span><span class="gbset-sum">${e(A(on ? 'sync_enabled' : 'sync_disabled'))}</span></span><img class="gbacc-status" src="assets/gb-acc-ic_sync_${on ? 'green' : 'grey'}.png" alt=""></button>`;
    return `<div class="app-view gbset gbsp" data-no-translate>${titleBar(A('sync_settings'))}<div class="gbsp-scroll">${separator(A('header_general_sync_settings'))}${checkRow('backgroundData', A('background_data'), A('background_data_summary'), s.backgroundData !== false, 'gbacc-background')}${checkRow('autoSync', A('sync_automatically'), A('sync_automatically_summary'), s.autoSync !== false)}${separator(A('header_manage_accounts'))}${account}</div><div class="gbacc-bar"><button class="gbsp-btn" data-action="gbset-toast" data-id="This feature is not part of the simulator.">${e(A('add_account_label'))}</button></div></div>`;
  }
  function syncAccount(ctx) {
    const A = key => acc(ctx.lang, key), s = ctx.settings, auto = s.backgroundData !== false && s.autoSync !== false;
    const items = [['syncContacts', 'sync_contacts'], ['syncCalendar', 'sync_calendar'], ['syncEmail', null]].map(([key, label]) => {
      const name = label ? A(label) : 'Email', on = s[key] !== false;
      const summary = ctx.syncing ? A('sync_one_time_sync').split('\n')[0] : ctx.lastSync;
      return `<button class="gbset-row gbacc-item" data-action="gbset-check" data-id="${key}" role="checkbox" aria-checked="${on}"><span class="gbset-text"><span class="gbset-title">${e(AndroidStrings.format(A('sync_item_title'), name))}</span><span class="gbset-sum">${e(summary)}</span></span>${ctx.syncing && on ? '<img class="gbacc-anim" src="assets/gb-acc-ic_list_sync_anim0.png" alt="">' : ''}<img class="gbset-check" src="assets/gb-btn_check_${on ? 'on' : 'off'}${auto ? '' : '_disable'}.png" alt=""></button>`;
    }).join('');
    return `<div class="app-view gbset gbsp" data-no-translate><div class="gbacc-title"><img src="assets/email.png" alt=""><span><b>${e(ctx.account)}</b><small>Email</small></span></div><div class="gbsp-scroll">${separator(A('header_data_and_synchronization'))}${items}</div><div class="gbacc-bar"><button class="gbsp-btn" data-action="gbacc-remove">${e(A('remove_account_label'))}</button></div></div>`;
  }
  function render(page, ctx) {
    if (page === 'sync') return syncPage(ctx);
    if (page === 'sync-account') return ctx.accountRemoved ? syncPage(ctx) : syncAccount(ctx);
    if (page === 'apps') return appsPage(ctx);
    if (page === 'running') return appsPage({...ctx, tab: 'running'});
    if (page === 'app-info') return appInfo(ctx);
    if (page === 'battery') return battery(ctx);
    if (page === 'battery-detail') return batteryDetail(ctx);
    if (page === 'about-legal') return legal(ctx);
    if (page === 'gb-licenses') return licenses(ctx);
    if (page === 'reset-info') return reset(ctx);
    if (page === 'gb-reset-final') return resetFinal(ctx);
    return null;
  }
  // ManageApplications menu: Sort by name / Sort by size (not on Running).
  function menu(page, ctx) {
    const T = key => text(ctx.lang, key);
    // AccountSyncSettings.onCreateOptionsMenu: Sync now / Cancel sync.
    if (page === 'sync-account') return [ctx.syncing ? {action: 'gbacc-cancel', title: acc(ctx.lang, 'sync_menu_sync_cancel'), icon: 'ic_menu_close_clear_cancel'} : {action: 'gbacc-sync', title: acc(ctx.lang, 'sync_menu_sync_now'), icon: 'ic_menu_refresh'}];
    if (page === 'apps' && (ctx.tab || 'downloaded') !== 'running') return [{action: 'gbsp-sort', id: ctx.sortBySize ? 'name' : 'size', title: T(ctx.sortBySize ? 'sort_order_alpha' : 'sort_order_size'), icon: ctx.sortBySize ? 'ic_menu_sort_alphabetically' : 'ic_menu_sort_by_size'}];
    return [];
  }
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key);
    if (kind === 'background') return {title: acc(ctx.lang, 'background_data_dialog_title'), icon: 'ic_dialog_alert', message: acc(ctx.lang, 'background_data_dialog_message'), buttons: [{action: 'gbacc-background-off', title: acc(ctx.lang, 'ok')}, {action: 'close-overlay', title: acc(ctx.lang, 'cancel')}]};
    if (kind === 'remove') return {title: acc(ctx.lang, 'really_remove_account_title'), icon: 'ic_dialog_alert', message: acc(ctx.lang, 'really_remove_account_message'), buttons: [{action: 'gbacc-remove-ok', title: acc(ctx.lang, 'remove_account_label')}, {action: 'close-overlay', title: acc(ctx.lang, 'cancel')}]};
    if (kind === 'force-stop') return {title: T('force_stop_dlg_title'), icon: 'ic_dialog_alert', message: T('force_stop_dlg_text'), buttons: [{action: 'gbsp-force-stop-ok', title: T('dlg_ok')}, {action: 'close-overlay', title: T('dlg_cancel')}]};
    if (kind === 'clear-data') return {title: T('clear_data_dlg_title'), icon: 'ic_dialog_alert', message: T('clear_data_dlg_text'), buttons: [{action: 'gbsp-clear-data-ok', title: T('dlg_ok')}, {action: 'close-overlay', title: T('dlg_cancel')}]};
    return null;
  }
  window.GBSettingsPages = {PAGES, text, size, sizes, has: page => PAGES.has(page), render, menu, dialog};
})();
