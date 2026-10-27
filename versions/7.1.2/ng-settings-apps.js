/* Android 7.1.2 Settings: Apps, App info and the pages under it, the app notifications list, Configure apps and
   Special access (SettingsGoogle N2G48C). The logic is 6.0.1's (its Apps, App info, permissions and battery
   optimization code); N2G48C decides what differs:
   - ManageApplications (LIST_TYPE_MAIN): apps_filter_spinner (switchbar_background, the Spinner 64 dp in: All apps,
     Enabled, and Disabled when some app is off), app_item rows (72 dp, the 40 dp icon, the Subhead label, the size at
     the end in textColorSecondary, Disabled under it), manage_apps: Advanced (ic_settings_24dp, shown as an action),
     Show system / Hide system (every package of the image: ng-packages.js), Reset app preferences.
   - InstalledAppDetails: installed_app_details (app_item with "version %1$s", two_buttons_panel: Disable / Enable and
     Force stop, plain Buttons), then Storage, Data usage, Permissions, Notifications (getNotificationSummary: Blocked /
     Silenced / Not on lock screen / Do Not Disturb overridden, joined by " / ", nothing when normal), Open by default,
     Battery and Memory (greyed with nothing used).
   - The pages under it carry AppHeader (app_header: the bar in switchbar_background, the 40 dp icon in a 72 dp start,
     the name in white): AppStorageSettings (app_storage_settings.xml), AppNotificationSettings (Block all, Show
     silently, On the lock screen with a secure lock, Override Do Not Disturb; the importance slider stays off as
     show_importance_slider is 0), AppLaunchSettings (Other defaults: auto_launch_disable_text, Clear defaults greyed),
     the runtime permissions of GooglePackageInstaller (AppPermissionsFragment, the groups DefaultPermissionGrantPolicy
     grants the default handlers).
   - NotificationApps (Notifications tile): the same list with each app's notification summary and the filter spinner
     (All apps, Blocked, Silenced, Sensitive content hidden, Do Not Disturb overridden), Configure notifications (gear).
   - advanced_apps (Configure apps): App permissions, the default apps (Home: the Google Now Launcher; Browser: Chrome;
     Phone; SMS: Messenger; Assist & voice input), Special access (special_access.xml: Battery optimization, the others
     as their lists).
   - HighPowerApps: Not optimized (the device idle whitelist: Google Play services, Project Fi) / All apps; each app's
     HighPowerDetail dialog. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const go = (c, screen, title) => NG.settingsGo(c, screen, title);
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  const mask = file => `-webkit-mask-image:url('${A(file)}');mask-image:url('${A(file)}')`;
  const label = (c, id) => id === 'gms' ? T().t('PrebuiltGmsCore/common_app_name') : (NG.appsData[id]?.label[c.lang] || NG.appsData[id]?.label.en || id);
  const iconOf = id => id === 'gms' ? A('gms-common_ic_googleplayservices.png') : NG.appsData[id]?.icon;
  const disabled = (c, id) => NG.appDisabled(c, id);
  NG.appLabel = NG.appLabel || label;
  const ids = c => {
    const seen = new Set(), col = new Intl.Collator(c.locale(), {sensitivity: 'base'});
    return Object.keys(NG.appsData).filter(id => { const p = NG.appsData[id].pkg; if (seen.has(p)) return false; seen.add(p); return true; }).sort((a, b) => col.compare(label(c, a), label(c, b)));
  };
  NG.settingsAppCount = c => ids(c).length;
  Object.assign(NG.settingsFragments, {'com.android.settings.applications.ManageApplications': 'apps', 'com.android.settings.applications.NotificationApps': 'notification-apps',
    'com.android.settings.applications.AdvancedAppSettings': 'xml:advanced_apps', 'com.android.settings.applications.SpecialAccessSettings': 'xml:special_access'});

  // A stable per-app figure from its package name (the simulator's data and cache use).
  const hash = s => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const usage = (c, id) => {
    const a = NG.appsData[id], h = hash(a.pkg), cleared = (S(c).appCleared || {})[id] || {};
    return {app: a.codeSize, data: cleared.data ? 0 : 24576 * (4 + h % 900), cache: cleared.cache ? 0 : 4096 * (h % 2000)};
  };
  const total = (c, id) => { const u = usage(c, id); return u.app + u.data + u.cache; };
  NG.appTotalSize = total;
  NG.appUsage = usage;

  // app_item.xml: the 40 dp icon, the label, the size at the end, a line under it.
  const appRow = (c, action, id, icon, title, size, sub) => `<button type="button" class="ngap-row" data-action="${action}" data-app="${id}"><img src="${icon}" alt=""><span class="ngap-texts"><span class="ngap-line"><span class="ngap-label">${c.safe(title)}</span>${size ? `<span class="ngap-size">${c.safe(size)}</span>` : ''}</span>${sub ? `<span class="ngap-sub">${c.safe(sub)}</span>` : ''}</span></button>`;
  // apps_filter_spinner: the Spinner on the switch bar's colour, optionally the gear at the end.
  const spinner = (c, action, text, gear) => `<div class="ngap-spinbar"><button type="button" class="ngap-spinner" data-action="${action}"><span>${c.safe(text)}</span><i></i></button>${gear ? `<button type="button" class="ngap-spingear" data-action="${gear}" aria-label="${c.safe(T().t('configure'))}"><i style="${mask('st-ic_settings_24dp.svg')}"></i></button>` : ''}</div>`;
  const pick = (c, items, cur, onPick) => c.dialog({items: items.map((l, i) => radio(c, l, i === cur)), onItem: onPick});
  const gearAction = (c, action, labelKey) => `<button type="button" class="ngst-ab-btn" data-action="${action}" aria-label="${c.safe(T().t(labelKey))}"><i style="${mask('st-ic_settings_24dp.svg')}"></i></button>`;

  // -- Apps -----------------------------------------------------------------------------------------------------------
  const st = c => c.ui.apps || (c.ui.apps = {filter: 0});
  const filters = c => { const t = T(), list = [t.t('filter_all_apps'), t.t('filter_enabled_apps')]; if (ids(c).some(id => disabled(c, id))) list.push(t.t('filter_apps_disabled')); return list; };
  const resetPrefs = c => { const t = T(); c.dialog({title: t.t('reset_app_preferences_title'), message: t.t('reset_app_preferences_desc'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('reset_app_preferences_button'), action: c => { S(c).disabledApps = []; S(c).appNotif = {}; S(c).perms = {}; S(c).restrictApps = []; c.save(); c.render(); }}]}); };
  NG.settingsScreens.apps = {
    title: () => T().t('applications_settings'),
    bar(c) { const f = filters(c); return spinner(c, 'ngap-filter', f[Math.min(st(c).filter, f.length - 1)]); },
    actions: c => gearAction(c, 'ngap-advanced', 'advanced_apps') + NG.menu.button(c),
    render(c) {
      const t = T(), i = Math.min(st(c).filter, filters(c).length - 1);
      const list = ids(c).filter(id => i === 0 || (i === 1 ? !disabled(c, id) : disabled(c, id)));
      if (!list.length) return `<div class="ngst-emptyview center">${c.safe(t.t('no_applications'))}</div>`;
      return `<div class="ngst-list">${list.map(id => appRow(c, 'ngap-app', id, iconOf(id), label(c, id), NG.fileSize(c, total(c, id)), disabled(c, id) ? t.t('disabled') : '')).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngap-app') { go(c, `app:${el.dataset.app}`, t.t('application_info_label')); return true; }
      if (name === 'ngap-advanced') { go(c, 'xml:advanced_apps', t.t('configure_apps')); return true; }
      if (name === 'ngap-filter') { const f = filters(c); pick(c, f, Math.min(st(c).filter, f.length - 1), i => { st(c).filter = i; c.render(); }); return true; }
      if (name === 'ng-menu') { c.menu([{label: t.t('menu_show_system'), action: c => go(c, 'apps-all', t.t('applications_settings'))}, {label: t.t('reset_app_preferences'), action: resetPrefs}], el); return true; }
      return false;
    }
  };
  // Show system: every package of the image (its application label, else the package name; its icon, else
  // sym_def_app_icon).
  NG.settingsScreens['apps-all'] = {
    title: () => T().t('applications_settings'),
    bar: c => spinner(c, 'ngap-nofilter', T().t('filter_all_apps')),
    actions: c => gearAction(c, 'ngap-advanced', 'advanced_apps') + NG.menu.button(c),
    render(c) {
      const col = new Intl.Collator(c.locale(), {sensitivity: 'base'}), byPkg = {};
      for (const id of Object.keys(NG.appsData)) byPkg[NG.appsData[id].pkg] = id;
      const list = (NG.systemPackages || []).map(p => ({...p, id: byPkg[p.pkg], name: byPkg[p.pkg] ? label(c, byPkg[p.pkg]) : p.label[c.lang] || p.label.en, icon: byPkg[p.pkg] ? NG.appsData[byPkg[p.pkg]].icon : p.icon})).sort((a, b) => col.compare(a.name, b.name));
      return `<div class="ngst-list">${list.map(p => appRow(c, 'ngap-sysapp', p.id || '', p.icon, p.name, NG.fileSize(c, p.size), '')).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngap-sysapp') { if (el.dataset.app) go(c, `app:${el.dataset.app}`, t.t('application_info_label')); return true; }
      if (name === 'ngap-advanced') { go(c, 'xml:advanced_apps', t.t('configure_apps')); return true; }
      if (name === 'ngap-nofilter') return true;
      if (name === 'ng-menu') { c.menu([{label: t.t('menu_hide_system'), action: c => { c.ui.settings.stack.pop(); c.render(); }}, {label: t.t('reset_app_preferences'), action: resetPrefs}], el); return true; }
      return false;
    }
  };

  // -- Permissions (GooglePackageInstaller's AppPermissionsFragment) -------------------------------------------------
  // DefaultPermissionGrantPolicy.grantDefaultSystemHandlerPermissions for the 6P's default handlers; Settings runs as the
  // system uid and holds what it asks for.
  const ROLES = {camera: ['camera', 'microphone', 'storage', 'location'], phone: ['phone', 'contacts', 'sms', 'microphone'], contacts: ['contacts', 'phone'],
    messenger: ['phone', 'contacts', 'sms'], calendar: ['calendar', 'contacts'], maps: ['location'], gmail: ['contacts'], chrome: ['location'],
    photos: ['storage'], 'play-music': ['storage'], search: ['contacts', 'calendar', 'microphone', 'phone', 'sms', 'location'],
    'play-store': ['storage', 'phone', 'sms'], settings: null};
  const PLATFORM = ['settings', 'downloads'];
  const GROUPS = ['calendar', 'camera', 'contacts', 'location', 'microphone', 'phone', 'sensors', 'sms', 'storage'];
    const groupLabel = g => T().t(`framework/permgrouplab_${g}`);
  const defaultGrant = (id, g) => ROLES[id] === null ? true : (ROLES[id] || []).includes(g);
  const granted = (c, id, g) => { const p = (S(c).perms || {})[id] || {}; return g in p ? p[g] : defaultGrant(id, g); };
  const setGrant = (c, id, g, v) => { const s = S(c); s.perms = {...(s.perms || {})}; s.perms[id] = {...(s.perms[id] || {}), [g]: v}; c.save(); };
  const byLabel = (c, list) => { const col = new Intl.Collator(c.locale()); return list.sort((a, b) => col.compare(groupLabel(a), groupLabel(b))); };
  NG.appPermissionGranted = granted;
  function permissions(c, id) {
    const t = T(), asked = NG.appsData[id].permGroups || [];
    if (!asked.length) return t.t('runtime_permissions_summary_no_permissions_requested');
    const allowed = byLabel(c, asked.filter(g => granted(c, id, g))).map(groupLabel);
    if (!allowed.length) return t.t('runtime_permissions_summary_no_permissions_granted');
    try { return new Intl.ListFormat(c.locale(), {type: 'conjunction'}).format(allowed); } catch { return allowed.join(', '); }
  }
  const toggleGrant = (c, id, g) => {
    const t = T(), on = granted(c, id, g);
    if (on && defaultGrant(id, g)) c.dialog({message: t.t('GooglePackageInstaller/system_warning'), buttons: [{label: t.t('GooglePackageInstaller/cancel')}, {label: t.t('GooglePackageInstaller/grant_dialog_button_deny'), action: c => { setGrant(c, id, g, false); c.render(); }}]});
    else { setGrant(c, id, g, !on); c.transition('none'); c.render(); }
  };
  const permRow = (c, action, key, icon, title, on) => NG.settingsRow(c, {title, icon, widget: NG.settingsSwitch(on), action, data: ` data-k="${key}"`});
  NG.settingsScreens['app-perms'] = {
    title: () => T().t('GooglePackageInstaller/app_permissions'),
    bar: (c, cur) => header(c, cur.screen.split(':')[1]),
    render(c, cur) {
      const id = cur.screen.split(':')[1];
      return `<div class="ngst-list">${NG.settingsJoinRows(byLabel(c, [...(NG.appsData[id].permGroups || [])]).map(g => ({html: permRow(c, 'ngap-grant', g, `<i class="ngst-ic masked" style="background:#0000008a;${mask(`fw-perm_group_${g === 'phone' ? 'phone_calls' : g}.svg`)}"></i>`, groupLabel(g), granted(c, id, g)), sel: true})))}</div>`;
    },
    action(c, name, el, cur) { if (name !== 'ngap-grant') return false; toggleGrant(c, cur.screen.split(':')[1], el.dataset.k); return true; }
  };
  const asking = (c, g) => ids(c).filter(id => (NG.appsData[id].permGroups || []).includes(g));
  NG.settingsScreens['perm-groups'] = {
    title: () => T().t('GooglePackageInstaller/app_permissions'),
    render(c) {
      const t = T();
      return `<div class="ngst-list">${NG.settingsJoinRows(byLabel(c, [...GROUPS]).map(g => { const apps = asking(c, g), n = apps.filter(id => granted(c, id, g)).length;
        return {html: NG.settingsRow(c, {title: groupLabel(g), summary: t.fmt('GooglePackageInstaller/app_permissions_group_summary', null, n, apps.length), icon: `<i class="ngst-ic masked" style="background:#0000008a;${mask(`fw-perm_group_${g === 'phone' ? 'phone_calls' : g}.svg`)}"></i>`, action: 'ngap-group', data: ` data-k="${g}"`}), sel: true}; }))}</div>`;
    },
    action(c, name, el) { if (name !== 'ngap-group') return false; go(c, `perm-apps:${el.dataset.k}`, T().fmt('GooglePackageInstaller/permission_title', null, groupLabel(el.dataset.k))); return true; }
  };
  NG.settingsScreens['perm-apps'] = {
    render(c, cur) {
      const g = cur.screen.split(':')[1];
      return `<div class="ngst-list">${NG.settingsJoinRows(asking(c, g).map(id => ({html: permRow(c, 'ngap-grantapp', id, `<img class="ngst-ic icon40" src="${iconOf(id)}" alt="">`, label(c, id), granted(c, id, g)), sel: true})))}</div>`;
    },
    action(c, name, el, cur) { if (name !== 'ngap-grantapp') return false; toggleGrant(c, el.dataset.k, cur.screen.split(':')[1]); return true; }
  };

  // -- App info -------------------------------------------------------------------------------------------------------
  const notif = (c, id) => (S(c).appNotif || {})[id] || {};
  const secureLock = c => ['pin', 'password', 'pattern'].includes(S(c).lock?.type);
  // InstalledAppDetails.getNotificationSummary.
  function notifSummary(c, id) {
    const t = T(), n = notif(c, id), parts = [];
    if (n.block) parts.push(t.t('notifications_disabled')); else if (n.silent) parts.push(t.t('notifications_silenced'));
    if (secureLock(c) && n.vis === 'hide') parts.push(t.t('notifications_redacted'));
    if (secureLock(c) && n.vis === 'none') parts.push(t.t('notifications_hidden'));
    if (n.bypass) parts.push(t.t('notifications_priority'));
    return parts.join(t.t('notifications_summary_divider'));
  }
  NG.appNotifSummary = notifSummary;
  NG.appNotifBlocked = (c, id) => !!notif(c, id).block;
  const running = (c, id) => !NG.appData?.stopped(c, id) && ((c.data.recentApps || []).includes(id) || id === 'play-music' && c.data.music?.playing || id === 'play-store' && Object.keys(c.data.playStore?.jobs || {}).length) && !disabled(c, id);
  NG.settingsScreens.app = {
    title: () => T().t('application_info_label'),
    render(c, cur) {
      const t = T(), id = cur.screen.slice(4), a = NG.appsData[id];
      if (!a) return '';
      const off = disabled(c, id), bytes = NG.appDataUsage?.(c, id) || 0;
      const row = (key, title, summary, dim = false) => ({html: NG.settingsRow(c, {key, title, summary, disabled: dim, action: 'ngap-pref'}), sel: true});
      const head = `<div class="ngap-head"><div class="ngap-row static"><img src="${a.icon}" alt=""><span class="ngap-texts"><span class="ngap-line"><span class="ngap-label">${c.safe(label(c, id))}</span></span><span class="ngap-sub">${c.safe(t.fmt('version_text', null, a.version))}</span></span></div>
        <div class="ngap-buttons"><button type="button" class="ngsx-btn" data-action="ngap-disable"${PLATFORM.includes(id) ? ' disabled' : ''}>${c.safe(a.storeId || a.installed ? NG.text('play-appinfo').t('uninstall_text') : t.t(off ? 'enable_text' : 'disable_text'))}</button><i></i><button type="button" class="ngsx-btn" data-action="ngap-stop"${running(c, id) ? '' : ' disabled'}>${c.safe(t.t('force_stop'))}</button></div></div>`;
      return `<div class="ngst-list">${head}${NG.settingsJoinRows([
        row('storage_settings', t.t('storage_settings'), t.fmt('storage_summary_format', null, NG.fileSize(c, total(c, id)), t.t('storage_type_internal'))),
        row('data_settings', t.t('data_usage_summary_title'), bytes ? t.fmt('data_summary_format', null, NG.fileSize(c, bytes), NG.dataCycleRange?.(c) || '') : t.t('no_data_usage')),
        row('permission_settings', t.t('permissions_label'), permissions(c, id)),
        row('notification_settings', t.t('notifications_label'), notifSummary(c, id)),
        row('preferred_settings', t.t('launch_by_default'), t.t('launch_defaults_none')),
        row('battery', t.t('power_usage_summary_title'), t.t('no_battery_summary'), true),
        row('memory', t.t('memory_settings_title'), t.t('no_memory_use_summary'), true)])}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.slice(4), s = S(c);
      if (name === 'ngap-disable') {
        if (NG.appsData[id]?.storeId) { NG.playUI.uninstall(c, NG.appsData[id].storeId, c => { c.ui.settings.stack.pop(); }); return true; }
        // An app installed from Play before the demo (ng-apps.js installed: Earth …) stays: Uninstall is not simulated.
        if (NG.appsData[id]?.installed) { c.toast(c.t('This feature is not part of the simulator.')); return true; }
        if (disabled(c, id)) { s.disabledApps = (s.disabledApps || []).filter(x => x !== id); c.save(); c.render(); return true; }
        c.dialog({message: t.t('app_disable_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('app_disable_dlg_positive'), action: c => {
          s.disabledApps = [...new Set([...(s.disabledApps || []), id])]; NG.appData.stop(c, id); c.save(); c.render();
        }}]});
        return true;
      }
      if (name === 'ngap-stop') {
        c.dialog({title: t.t('force_stop_dlg_title'), message: t.t('force_stop_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok'), action: c => { NG.appData.stop(c, id); c.render(); }}]});
        return true;
      }
      if (name === 'ngap-pref') {
        const k = el.dataset.key;
        if (k === 'permission_settings') { if ((NG.appsData[id].permGroups || []).length) go(c, `app-perms:${id}`, t.t('GooglePackageInstaller/app_permissions')); }
        else if (k === 'storage_settings') go(c, `app-storage:${id}`, t.t('application_info_label'));
        else if (k === 'data_settings') go(c, `data-app:${id}:mobile`, t.t('data_usage_app_summary_title'));
        else if (k === 'notification_settings') go(c, `app-notif:${id}`, t.t('app_notifications_title'));
        else if (k === 'preferred_settings') go(c, `app-launch:${id}`, t.t('application_info_label'));
        return true;
      }
      return false;
    }
  };
  // AppHeader (app_header.xml) over the pages of one app.
  const header = (c, id) => `<div class="ngap-appheader"><img src="${iconOf(id)}" alt=""><span>${c.safe(label(c, id))}</span></div>`;
  NG.settingsAppHeader = header;
  // AppStorageSettings: horizontal_preference rows and the clear buttons.
  const pair = (c, title, value) => `<div class="ngap-pair"><span>${c.safe(title)}</span><b>${c.safe(value)}</b></div>`;
  const button = (c, action, text, off = false) => `<div class="ngap-btnrow"><button type="button" class="ngsx-btn" data-action="${action}"${off ? ' disabled' : ''}>${c.safe(text)}</button></div>`;
  NG.settingsScreens['app-storage'] = {
    title: () => T().t('application_info_label'),
    bar: (c, cur) => header(c, cur.screen.split(':')[1]),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], u = usage(c, id), f = n => NG.fileSize(c, n);
      // initMoveDialog: the 6P has one volume (getPackageCandidateVolumes size 1), so storage_space, storage_used and
      // change_storage_button are removed.
      return `<div class="ngst-list">${NG.settingsCat(c, t.t('storage_label'))}${pair(c, t.t('total_size_label'), f(u.app + u.data))}${pair(c, t.t('application_size_label'), f(u.app))}${pair(c, t.t('external_code_size_label'), f(0))}
        ${pair(c, t.t('data_size_label'), f(u.data))}${pair(c, t.t('external_data_size_label'), f(0))}${button(c, 'ngap-cleardata', t.t('clear_user_data_text'), !u.data || !NG.appData.canClear(id))}
        <i class="ngap-space"></i>${pair(c, t.t('cache_size_label'), f(u.cache))}${button(c, 'ngap-clearcache', t.t('clear_cache_btn_text'), !u.cache)}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = S(c);
      if (name === 'ngap-cleardata') { if (!NG.appData.canClear(id)) return true; c.dialog({title: t.t('clear_data_dlg_title'), message: t.t('clear_data_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok'), action: c => { NG.appData.clear(c, id); c.render(); }}]}); return true; }
      if (name === 'ngap-clearcache') { NG.appData.clearCache(c, id); c.render(); return true; }
      return false;
    }
  };
  // AppNotificationSettings.
  const VIS = [['show', 'lock_screen_notifications_summary_show'], ['hide', 'lock_screen_notifications_summary_hide'], ['none', 'lock_screen_notifications_summary_disable']];
  NG.settingsScreens['app-notif'] = {
    title: () => T().t('app_notifications_title'),
    bar: (c, cur) => header(c, cur.screen.split(':')[1]),
    render(c, cur) {
      const t = T(), id = cur.screen.split(':')[1], n = notif(c, id);
      const sw = (key, title, summary, on) => ({html: NG.settingsRow(c, {title, summary, widget: NG.settingsSwitch(on), action: 'ngap-notif', data: ` data-k="${key}"`}), sel: true});
      const rows = [sw('block', t.t('app_notification_block_title'), t.t('app_notification_block_summary'), !!n.block)];
      if (!n.block) {
        rows.push(sw('silent', t.t('show_silently'), t.t('show_silently_summary'), !!n.silent));
        if (secureLock(c)) rows.push({html: NG.settingsRow(c, {title: t.t('app_notification_visibility_override_title'), summary: t.t(VIS.find(v => v[0] === (n.vis || 'show'))[1]), action: 'ngap-vis'}), sel: true});
        rows.push(sw('bypass', t.t('app_notification_override_dnd_title'), t.t('app_notification_override_dnd_summary'), !!n.bypass));
      }
      return `<div class="ngst-list">${NG.settingsJoinRows(rows)}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1], s = S(c), n = {...notif(c, id)};
      const save = () => { s.appNotif = {...(s.appNotif || {}), [id]: n}; c.save(); c.transition('none'); c.render(); };
      if (name === 'ngap-notif') { n[el.dataset.k] = !n[el.dataset.k]; save(); return true; }
      if (name === 'ngap-vis') { c.dialog({title: t.t('app_notification_visibility_override_title'), items: VIS.map(([v, k]) => radio(c, t.t(k), v === (n.vis || 'show'))), buttons: [{label: t.t('dlg_cancel')}], onItem: i => { n.vis = VIS[i][0]; save(); }}); return true; }
      return false;
    }
  };
  // AppLaunchSettings: no app of the image here handles web links by itself, so only Other defaults.
  NG.settingsScreens['app-launch'] = {
    title: () => T().t('application_info_label'),
    bar: (c, cur) => header(c, cur.screen.split(':')[1]),
    render(c) {
      const t = T();
      return `<div class="ngst-list">${NG.settingsCat(c, t.t('app_launch_other_defaults_title'))}<div class="ngap-defaults"><p>${c.safe(t.t('auto_launch_disable_text'))}</p><button type="button" class="ngsx-btn" disabled>${c.safe(t.t('clear_activities'))}</button></div></div>`;
    }
  };

  // -- Notifications list (NotificationApps: ManageApplications LIST_TYPE_NOTIFICATION) ---------------------------------
  const NFILTERS = [['filter_all_apps', () => true], ['filter_notif_blocked_apps', n => n.block], ['filter_notif_silent', n => n.silent && !n.block],
    ['filter_notif_sensitive_apps', n => n.vis === 'hide' || n.vis === 'none'], ['filter_notif_priority_apps', n => n.bypass]];
  NG.settingsScreens['notification-apps'] = {
    title: () => T().t('app_notifications_title'),
    bar: c => spinner(c, 'ngap-nfilter', T().t(NFILTERS[c.ui.notifFilter || 0][0])),
    actions: c => gearAction(c, 'ngap-confignotif', 'configure_notification_settings'),
    render(c) {
      const t = T(), f = NFILTERS[c.ui.notifFilter || 0][1];
      const list = ids(c).filter(id => !disabled(c, id) && f(notif(c, id)));
      if (!list.length) return `<div class="ngst-emptyview center">${c.safe(t.t('no_applications'))}</div>`;
      return `<div class="ngst-list">${list.map(id => appRow(c, 'ngap-notifapp', id, iconOf(id), label(c, id), '', notifSummary(c, id))).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngap-notifapp') { go(c, `app-notif:${el.dataset.app}`, t.t('app_notifications_title')); return true; }
      if (name === 'ngap-confignotif') { go(c, 'xml:configure_notification_settings', t.t('configure_notification_settings')); return true; }
      if (name === 'ngap-nfilter') { pick(c, NFILTERS.map(f => t.t(f[0])), c.ui.notifFilter || 0, i => { c.ui.notifFilter = i; c.render(); }); return true; }
      return false;
    }
  };

  // -- Configure apps -------------------------------------------------------------------------------------------------
  // The candidates of each default the image has: one handler each (the home is Velvet's Google Now Launcher).
  const DEFAULTS = {default_home: [['launcher', 'Velvet/launcher_name']], default_browser: [['chrome']], default_phone_app: [['phone']], default_sms_app: [['messenger']]};
  const defLabel = (c, [id, key]) => key ? T().t(key) : label(c, id);
  NG.settingsHooks.advanced_apps = {
    hidden: ['work_defaults', 'default_emergency_app', 'domain_urls'],
    summary(c, key) {
      const t = T();
      if (DEFAULTS[key]) return defLabel(c, DEFAULTS[key][0]);
      if (key === 'assist_and_voice_input') return t.t('Velvet/app_name');
      return undefined;
    },
    click(c, key, n) {
      const t = T();
      if (key === 'manage_perms') { go(c, 'perm-groups', t.t('GooglePackageInstaller/app_permissions')); return true; }
      if (DEFAULTS[key]) { c.dialog({title: NG.settingsStr(n.title), items: DEFAULTS[key].map(d => radio(c, defLabel(c, d), true)), buttons: [{label: t.t('dlg_cancel')}]}); return true; }
      return false;
    }
  };
  NG.settingsHooks.manage_assist = {
    get: (c, key) => ['context', 'screenshot', 'flash'].includes(key) ? (S(c).assist?.[key] ?? true) : undefined,
    set(c, key, v) { if (!['context', 'screenshot', 'flash'].includes(key)) return false; S(c).assist = {...(S(c).assist || {}), [key]: v}; return true; },
    summary(c, key) { const t = T(); if (key === 'default_assist') return t.t('Velvet/app_name'); if (key === 'voice_input_settings') return t.t('Velvet/app_name'); return undefined; },
    click(c, key) {
      const t = T();
      if (key === 'default_assist') { c.dialog({title: t.t('default_assist_title'), items: [radio(c, t.t('Velvet/app_name'), true), radio(c, t.t('default_assist_none'), false)], buttons: [{label: t.t('dlg_cancel')}]}); return true; }
      if (key === 'voice_input_settings') { c.dialog({title: t.t('voice_input_settings_title'), items: [radio(c, t.t('Velvet/app_name'), true)], buttons: [{label: t.t('dlg_cancel')}]}); return true; }
      return false;
    }
  };
  NG.settingsHooks.special_access = {
    click(c, key, n) {
      const t = T();
      if (key === 'high_power_apps') { go(c, 'high-power', t.t('high_power_apps')); return true; }
      if (key === 'data_saver') { go(c, 'data-unrestricted', t.t('unrestricted_data_saver')); return true; }
      if (key === 'usage_access') { go(c, 'usage-access', t.t('usage_access')); return true; }
      return false;
    }
  };
  // HighPowerApps and HighPowerDetail.
  const WHITELIST = ['gms', 'project-fi'];
  const notOptimized = (c, id) => WHITELIST.includes(id) || (S(c).highPower || []).includes(id);
  NG.settingsScreens['high-power'] = {
    title: () => T().t('high_power_apps'),
    bar: c => spinner(c, 'ngap-hpfilter', T().t(c.ui.highPowerAll ? 'filter_all_apps' : 'high_power_filter_on')),
    render(c) {
      const t = T(), col = new Intl.Collator(c.locale());
      const list = ['gms', ...ids(c)].filter(id => c.ui.highPowerAll || notOptimized(c, id)).sort((a, b) => col.compare(label(c, a), label(c, b)));
      return `<div class="ngst-list">${list.map(id => appRow(c, 'ngap-hp', id, iconOf(id), label(c, id), '', t.t(notOptimized(c, id) ? 'high_power_on' : 'high_power_off'))).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ngap-hpfilter') { pick(c, [t.t('high_power_filter_on'), t.t('filter_all_apps')], c.ui.highPowerAll ? 1 : 0, i => { c.ui.highPowerAll = i === 1; c.render(); }); return true; }
      if (name !== 'ngap-hp') return false;
      const id = el.dataset.app, sys = WHITELIST.includes(id), on = notOptimized(c, id);
      let pickV = null;
      const opt = (v, l, d) => `<button type="button" class="ngap-hpopt" data-v="${v}"${sys ? ' disabled' : ''}><i class="ngw-radio ngst-radio${(v === 'on') === on ? ' on' : ''}"></i><span><span>${c.safe(t.t(l))}</span><small>${c.safe(t.t(d))}</small></span></button>`;
      c.dialog({title: label(c, id), html: `<div class="ngap-hpdlg">${sys ? `<p>${c.safe(t.t('high_power_system'))}</p>` : ''}${opt('on', 'ignore_optimizations_on', 'ignore_optimizations_on_desc')}${opt('off', 'ignore_optimizations_off', 'ignore_optimizations_off_desc')}</div>`,
        buttons: [{label: t.t('done'), action: c => { if (!sys && pickV) { s.highPower = (s.highPower || []).filter(x => x !== id); if (pickV === 'on') s.highPower.push(id); c.save(); c.render(); } }}],
        mount(c, win) { win.querySelectorAll('.ngap-hpopt').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); pickV = b.dataset.v; win.querySelectorAll('.ngap-hpopt .ngw-radio').forEach(r => r.classList.toggle('on', r.closest('.ngap-hpopt') === b)); })); }});
      return true;
    }
  };
})();
