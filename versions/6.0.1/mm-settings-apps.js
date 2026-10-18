/* Android 6.0.1 Settings: Apps (ManageApplications, LIST_TYPE_MAIN) and App info (InstalledAppDetails), Settings.apk
   MTC20K, as MM.settingsScreens.apps / app.
   - The list: ApplicationsState's FILTER_DOWNLOADED_AND_LAUNCHER, so the system apps with a launcher entry
   (mm-apps.js, one row per package), sorted by label; manage_applications_apps.xml with apps_filter_spinner.xml pinned
   above it (switchbar_background, the Spinner 64 dp in: All apps, Enabled and, when some app is off, Disabled);
   app_item.xml rows (72 dp at least, 16 dp padding, the 40 dp icon 16 dp before the Subhead label, the size in
   textColorSecondary at the end: Formatter.formatFileSize of the package's size, here the APK and its oat files, and
   "Disabled" under the label of an app that is off). manage_apps.xml: Configure apps (ic_settings_24dp, always shown),
   Show system / Hide system and Reset app preferences in the overflow.
   - App info: the installed_app_details.xml header (app_item with "version %1$s" under the label, then
   two_buttons_panel: Disable / Enable for a system app that is not part of the platform (Utils.isSystemPackage greys
   it for Settings and the platform-signed Downloads), Force stop enabled while the app has run), then Storage
   (storage_summary_format, Internal storage), Data usage (No data used), Permissions (the groups
   DefaultPermissionGrantPolicy grants the app's default roles, of those it requests, in ICU's ListFormatter; none:
   No permissions granted / requested), Notifications (Normal), Open by default (No defaults set), Battery and Memory
   (nothing used since the last charge / in the last 3 hours). Disabling asks app_disable_dlg_text and turns the
   package off: its launcher shortcuts and drawer entry go. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;

  // DefaultPermissionGrantPolicy.grantDefaultSystemHandlerPermissions for the 5X's handlers: the camera
  // (IMAGE_CAPTURE), the dialer, contacts (APP_CONTACTS), the SMS app, calendar (APP_CALENDAR), maps (APP_MAPS), email
  // (APP_EMAIL), the browser (APP_BROWSER), the gallery (APP_GALLERY), music (APP_MUSIC), the voice interaction service
  // (the Google app), the package verifier (Play Store); Settings runs as the system uid and holds what it asks for.
  const ROLES = {camera: ['camera', 'microphone', 'storage'], phone: ['phone', 'contacts', 'sms', 'microphone'], contacts: ['contacts', 'phone'],
    messenger: ['phone', 'contacts', 'sms'], calendar: ['calendar', 'contacts'], maps: ['location'], gmail: ['contacts'], chrome: ['location'],
    photos: ['storage'], 'play-music': ['storage'], search: ['contacts', 'calendar', 'microphone', 'phone', 'sms', 'location'],
    'play-store': ['storage', 'phone', 'sms'], settings: null};
  // Utils.isSystemPackage: signed with the platform key.
  const PLATFORM = ['settings', 'downloads'];
  const disabled = (c, id) => MM.appDisabled(c, id);
  const ids = c => {
    const seen = new Set(), collator = new Intl.Collator(c.locale(), {sensitivity: 'base'});
    return Object.keys(MM.appsData).filter(id => { const p = MM.appsData[id].pkg; if (seen.has(p)) return false; seen.add(p); return true; })
      .sort((a, b) => collator.compare(MM.appLabel(c, a), MM.appLabel(c, b)));
  };
  const size = (c, id) => MM.fileSize(c, MM.appsData[id].codeSize);

  function permissions(c, id) {
    const t = T(), a = MM.appsData[id], asked = a.permGroups || [];
    if (!asked.length) return t.t('runtime_permissions_summary_no_permissions_requested');
    const allowed = asked.filter(g => granted(c, id, g)).map(g => t.t(`framework/permgrouplab_${g}`));
    if (!allowed.length) return t.t('runtime_permissions_summary_no_permissions_granted');
    const collator = new Intl.Collator(c.locale());
    allowed.sort((x, y) => collator.compare(x, y));
    try { return new Intl.ListFormat(c.locale(), {type: 'conjunction'}).format(allowed); } catch { return allowed.join(', '); }
  }

  // -- the list ------------------------------------------------------------------------------------------------------
  const st = c => c.ui.apps || (c.ui.apps = {filter: 0});
  function filters(c) {
    const t = T(), list = [t.t('filter_all_apps'), t.t('filter_enabled_apps')];
    if (ids(c).some(id => disabled(c, id))) list.push(t.t('filter_apps_disabled'));
    return list;
  }
  function bar(c) {
    const f = filters(c), i = Math.min(st(c).filter, f.length - 1);
    return `<div class="mmst-spinbar"><button type="button" class="mmst-spinner" data-action="mmap-filter"><span>${c.safe(f[i])}</span><i></i></button></div>`;
  }
  function render(c) {
    const t = T(), i = Math.min(st(c).filter, filters(c).length - 1);
    const list = ids(c).filter(id => i === 0 || (i === 1 ? !disabled(c, id) : disabled(c, id)));
    if (!list.length) return `<div class="mmst-empty center">${c.safe(t.t('no_applications'))}</div>`;
    return `<div class="mmst-list">${list.map(id => `<button type="button" class="mmap-row" data-action="mmap-app" data-app="${id}"><img src="${MM.appsData[id].icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(MM.appLabel(c, id))}</span><span class="mmap-size">${c.safe(size(c, id))}</span></span>${disabled(c, id) ? `<span class="mmap-sub">${c.safe(t.t('disabled'))}</span>` : ''}</span></button>`).join('')}</div>`;
  }
  const actions = c => `<button type="button" class="mmst-ab-btn" data-action="mmap-advanced" aria-label="${c.safe(T().t('advanced_apps'))}"><img src="assets/st-ic_settings_24dp.svg" alt=""></button>${MM.menu.button(c)}`;

  MM.settingsScreens.apps = {
    title: () => T().t('applications_settings'),
    render, bar, actions,
    action(c, name, el) {
      const t = T();
      if (name === 'mmap-app') { MM.settingsGo(c, `app:${el.dataset.app}`, t.t('application_info_label')); return true; }
      if (name === 'mmap-advanced') { MM.settingsGo(c, 'xml:advanced_apps', t.t('advanced_apps')); return true; }
      if (name === 'mmap-filter') {
        const f = filters(c), cur = Math.min(st(c).filter, f.length - 1);
        c.dialog({items: f.map((label, i) => ({html: `<span class="mmst-choice"><i class="mmw-radio${i === cur ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`})),
          onItem: i => { st(c).filter = i; c.render(); }});
        return true;
      }
      if (name === 'mm-menu') {
        c.menu([{label: t.t('menu_show_system'), action: c => MM.settingsGo(c, 'apps-all', t.t('applications_settings'))},
          {label: t.t('reset_app_preferences'), action: c => c.dialog({title: t.t('reset_app_preferences_title'), message: t.t('reset_app_preferences_desc'),
            buttons: [{label: t.t('dlg_cancel')}, {label: t.t('reset_app_preferences_button'), action: c => { S(c).disabledApps = []; c.save(); c.render(); }}]})}]);
        return true;
      }
      return false;
    }
  };

  // -- App info ------------------------------------------------------------------------------------------------------
  function details(c, cur) {
    const t = T(), id = cur.screen.slice(4), a = MM.appsData[id];
    if (!a) return '';
    const off = disabled(c, id), running = (c.ui.recent || []).includes(id) && !off;
    // Battery and Memory stay greyed while the app has used nothing (InstalledAppDetails.refreshUi).
    const pref = (key, title, summary, off = false) => `<button type="button" class="mmst-pref${off ? ' disabled' : ''}" data-action="mmai-pref" data-key="${key}"${off ? ' disabled' : ''}><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span><span class="mmst-summary">${c.safe(summary)}</span></span></button>`;
    return `<div class="mmst-list"><div class="mmai-head"><div class="mmap-row static"><img src="${a.icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(MM.appLabel(c, id))}</span></span><span class="mmap-sub">${c.safe(t.fmt('version_text', null, a.version))}</span></span></div>
      <div class="mmai-buttons"><button type="button" class="mmai-button" data-action="mmai-disable"${PLATFORM.includes(id) ? ' disabled' : ''}>${c.safe(t.t(off ? 'enable_text' : 'disable_text'))}</button><i></i><button type="button" class="mmai-button" data-action="mmai-stop"${running ? '' : ' disabled'}>${c.safe(t.t('force_stop'))}</button></div></div>
      ${pref('storage_settings', t.t('storage_settings'), t.fmt('storage_summary_format', null, MM.fileSize(c, MM.appTotalSize ? MM.appTotalSize(c, id) : a.codeSize), t.t('storage_type_internal')))}
      ${pref('data_settings', t.t('data_usage_summary_title'), MM.appDataUsage?.(c, id) ? t.fmt('data_summary_format', null, MM.fileSize(c, MM.appDataUsage(c, id)), MM.dataCycleStart?.(c) || '') : t.t('no_data_usage'))}
      ${pref('permission_settings', t.t('permissions_label'), permissions(c, id))}
      ${pref('notification_settings', t.t('notifications_label'), MM.appNotifSummary ? MM.appNotifSummary(c, id) : t.t('notifications_enabled'))}
      ${pref('preferred_settings', t.t('launch_by_default'), MM.appLaunchSummary ? MM.appLaunchSummary(c, id) : t.t('launch_defaults_none'))}
      ${pref('battery', t.t('power_usage_summary_title'), t.t('no_battery_summary'), true)}
      ${pref('memory', t.t('memory_settings_title'), t.t('no_memory_use_summary'), true)}</div>`;
  }
  MM.settingsScreens.app = {
    title: () => T().t('application_info_label'),
    render: details,
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.slice(4), s = S(c);
      if (name === 'mmai-disable') {
        if (disabled(c, id)) { s.disabledApps = (s.disabledApps || []).filter(x => x !== id); c.save(); c.render(); return true; }
        c.dialog({message: t.t('app_disable_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('app_disable_dlg_positive'), action: c => {
          s.disabledApps = [...new Set([...(s.disabledApps || []), id])]; c.ui.recent = (c.ui.recent || []).filter(x => x !== id); c.save(); c.render();
        }}]});
        return true;
      }
      if (name === 'mmai-stop') {
        c.dialog({title: t.t('force_stop_dlg_title'), message: t.t('force_stop_dlg_text'), buttons: [{label: t.t('dlg_cancel')}, {label: t.t('dlg_ok'), action: c => {
          c.ui.recent = (c.ui.recent || []).filter(x => x !== id); if (c.ui.thumbs) delete c.ui.thumbs[id]; c.render();
        }}]});
        return true;
      }
      if (name === 'mmai-pref') {
        const k = el.dataset.key;
        if (k === 'permission_settings') { if ((MM.appsData[id].permGroups || []).length) MM.settingsGo(c, `app-perms:${id}`, t.t('GooglePackageInstaller/app_permissions')); }
        else if (k === 'storage_settings') MM.settingsGo(c, `app-storage:${id}`, t.t('application_info_label'));
        else if (k === 'data_settings') MM.settingsGo(c, `data-app:${id}`, t.t('data_usage_app_summary_title'));
        else if (k === 'notification_settings') MM.settingsGo(c, `app-notif:${id}`, t.t('app_notifications_title'));
        else if (k === 'preferred_settings') MM.settingsGo(c, `app-launch:${id}`, t.t('application_info_label'));
        return true;
      }
      return false;
    }
  };

  // -- App permissions (GooglePackageInstaller) ----------------------------------------------------------------------
  /* AppPermissionsFragment (ManagePermissionsActivity, the Settings theme): header.xml under the action bar (the app's
     icon in the 72 dp start area, its label in Medium white on colorPrimary #263238, ic_info at the end), then a
     SwitchPreference per platform permission group the app requests, sorted by label, with the framework's
     perm_group_* icon in colorControlNormal; turning off a group the system granted (a default handler's) warns
     system_warning with Cancel / Deny. ManagePermissionsFragment (Configure apps > App permissions): the groups with
     "%1$d of %2$d apps allowed"; PermissionAppsFragment: the apps asking for a group, each with its switch. */
  const GROUPS = ['calendar', 'camera', 'contacts', 'location', 'microphone', 'phone', 'sensors', 'sms', 'storage'];
  const groupIcon = g => `assets/fw-perm_group_${g === 'phone' ? 'phone_calls' : g}.svg`;
  const groupLabel = g => T().t(`framework/permgrouplab_${g}`);
  const defaultGrant = (id, g) => ROLES[id] === null ? true : (ROLES[id] || []).includes(g);
  const granted = (c, id, g) => { const p = (S(c).perms || {})[id] || {}; return g in p ? p[g] : defaultGrant(id, g); };
  function setGrant(c, id, g, v) { const s = S(c); s.perms = {...(s.perms || {})}; s.perms[id] = {...(s.perms[id] || {}), [g]: v}; c.save(); }
  const byLabel = (c, list) => { const col = new Intl.Collator(c.locale()); return list.sort((a, b) => col.compare(groupLabel(a), groupLabel(b))); };
  MM.appPermissionGranted = granted;

  const permRow = (c, action, key, icon, title, on, summary = '') => `<button type="button" class="mmst-pref" data-action="${action}" data-key="${key}"><span class="mmst-iconframe">${icon}</span><span class="mmst-texts"><span class="mmst-title">${c.safe(title)}</span>${summary ? `<span class="mmst-summary">${c.safe(summary)}</span>` : ''}</span><span class="mmst-widget"><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></span></button>`;
  MM.settingsScreens['app-perms'] = {
    title: () => T().t('GooglePackageInstaller/app_permissions'),
    bar(c, cur) {
      const id = cur.screen.split(':')[1], a = MM.appsData[id];
      return `<div class="mmpi-header"><img src="${a.icon}" alt=""><span>${c.safe(MM.appLabel(c, id))}</span><button type="button" data-action="mmpi-info"><img src="assets/pi-ic_info.svg" alt=""></button></div>`;
    },
    render(c, cur) {
      const id = cur.screen.split(':')[1], groups = byLabel(c, [...(MM.appsData[id].permGroups || [])]);
      return `<div class="mmst-list">${groups.map(g => permRow(c, 'mmpi-toggle', g, `<img class="mmst-ic" src="${groupIcon(g)}" alt="">`, groupLabel(g), granted(c, id, g))).join('')}</div>`;
    },
    action(c, name, el, cur) {
      const t = T(), id = cur.screen.split(':')[1];
      if (name === 'mmpi-info') { c.ui.settings.stack.pop(); c.render(); return true; }
      if (name !== 'mmpi-toggle') return false;
      const g = el.dataset.key, on = granted(c, id, g);
      if (on && defaultGrant(id, g)) c.dialog({message: t.t('GooglePackageInstaller/system_warning'), buttons: [{label: t.t('GooglePackageInstaller/cancel')}, {label: t.t('GooglePackageInstaller/grant_dialog_button_deny'), action: c => { setGrant(c, id, g, false); c.render(); }}]});
      else { setGrant(c, id, g, !on); c.render(); }
      return true;
    }
  };
  const asking = (c, g) => ids(c).filter(id => (MM.appsData[id].permGroups || []).includes(g));
  MM.settingsScreens['perm-groups'] = {
    title: () => T().t('GooglePackageInstaller/app_permissions'),
    render(c) {
      const t = T();
      return `<div class="mmst-list">${byLabel(c, [...GROUPS]).map(g => { const apps = asking(c, g), n = apps.filter(id => granted(c, id, g)).length;
        return `<button type="button" class="mmst-pref" data-action="mmpg-group" data-key="${g}"><span class="mmst-iconframe"><img class="mmst-ic" src="${groupIcon(g)}" alt=""></span><span class="mmst-texts"><span class="mmst-title">${c.safe(groupLabel(g))}</span><span class="mmst-summary">${c.safe(t.fmt('GooglePackageInstaller/app_permissions_group_summary', null, n, apps.length))}</span></span></button>`; }).join('')}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmpg-group') return false;
      MM.settingsGo(c, `perm-apps:${el.dataset.key}`, T().fmt('GooglePackageInstaller/permission_title', null, groupLabel(el.dataset.key)));
      return true;
    }
  };
  MM.settingsScreens['perm-apps'] = {
    render(c, cur) {
      const g = cur.screen.split(':')[1];
      return `<div class="mmst-list">${asking(c, g).map(id => permRow(c, 'mmpa-toggle', id, `<img class="mmst-ic big" src="${MM.appsData[id].icon}" alt="">`, MM.appLabel(c, id), granted(c, id, g))).join('')}</div>`;
    },
    action(c, name, el, cur) {
      if (name !== 'mmpa-toggle') return false;
      const t = T(), g = cur.screen.split(':')[1], id = el.dataset.key, on = granted(c, id, g);
      if (on && defaultGrant(id, g)) c.dialog({message: t.t('GooglePackageInstaller/system_warning'), buttons: [{label: t.t('GooglePackageInstaller/cancel')}, {label: t.t('GooglePackageInstaller/grant_dialog_button_deny'), action: c => { setGrant(c, id, g, false); c.render(); }}]});
      else { setGrant(c, id, g, !on); c.render(); }
      return true;
    }
  };

  // -- Battery optimization (HighPowerApps, LIST_TYPE_HIGH_POWER) ------------------------------------------------------
  /* The spinner's Not optimized (the device idle whitelist: the image's sysconfig allow-in-power-save packages, Google
     Play services and Project Fi among the apps) and All apps; each row "Not optimized" or "Optimizing battery use";
     HighPowerDetail's choice (Don't optimize / Optimize with their descriptions), not available for a system-whitelisted
     package (high_power_system). */
  const WHITELIST = ['gms', 'project-fi'];
  const notOptimized = (c, id) => WHITELIST.includes(id) || (S(c).highPower || []).includes(id);
  const powerApps = c => ['gms', ...ids(c)];
  const appIcon = id => id === 'gms' ? 'assets/gms-ic_google.png' : MM.appsData[id].icon;
  const appName = (c, id) => id === 'gms' ? T().t('PrebuiltGmsCore/common_app_name') : MM.appLabel(c, id);
  MM.settingsScreens['high-power'] = {
    title: () => T().t('high_power_apps'),
    bar(c) {
      const t = T(), all = c.ui.highPowerAll;
      return `<div class="mmst-spinbar"><button type="button" class="mmst-spinner" data-action="mmhp-filter"><span>${c.safe(t.t(all ? 'filter_all_apps' : 'high_power_filter_on'))}</span><i></i></button></div>`;
    },
    render(c) {
      const t = T(), col = new Intl.Collator(c.locale());
      const list = powerApps(c).filter(id => c.ui.highPowerAll || notOptimized(c, id)).sort((a, b) => col.compare(appName(c, a), appName(c, b)));
      return `<div class="mmst-list">${list.map(id => `<button type="button" class="mmap-row" data-action="mmhp-app" data-app="${id}"><img src="${appIcon(id)}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(appName(c, id))}</span></span><span class="mmap-sub">${c.safe(t.t(notOptimized(c, id) ? 'high_power_on' : 'high_power_off'))}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mmhp-filter') {
        const opts = [['high_power_filter_on', false], ['filter_all_apps', true]];
        c.dialog({items: opts.map(([l, v]) => ({html: `<span class="mmst-choice"><i class="mmw-radio${!!c.ui.highPowerAll === v ? ' on' : ''}"></i><span>${c.safe(t.t(l))}</span></span>`})), onItem: i => { c.ui.highPowerAll = opts[i][1]; c.render(); }});
        return true;
      }
      if (name !== 'mmhp-app') return false;
      const id = el.dataset.app, sys = WHITELIST.includes(id), on = notOptimized(c, id);
      const opt = (v, label, desc) => `<button type="button" class="mmsc-radio mmhp-opt" data-v="${v}"${sys ? ' disabled' : ''}><i class="mmw-radio${(v === 'on') === on ? ' on' : ''}"></i><span><span>${c.safe(t.t(label))}</span><small>${c.safe(t.t(desc))}</small></span></button>`;
      c.dialog({title: appName(c, id), html: `<div class="mmhp-dlg">${sys ? `<p>${c.safe(t.t('high_power_system'))}</p>` : ''}${opt('on', 'ignore_optimizations_on', 'ignore_optimizations_on_desc')}${opt('off', 'ignore_optimizations_off', 'ignore_optimizations_off_desc')}</div>`,
        buttons: [{label: t.t('done'), action: c => { const v = c.ui.highPowerPick; if (!sys && v) { s.highPower = (s.highPower || []).filter(x => x !== id); if (v === 'on') s.highPower.push(id); c.save(); c.render(); } }}],
        mount(c, win) { c.ui.highPowerPick = null; win.querySelectorAll('.mmhp-opt').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); c.ui.highPowerPick = b.dataset.v; win.querySelectorAll('.mmhp-opt .mmw-radio').forEach(r => r.classList.toggle('on', r.closest('.mmhp-opt') === b)); })); }});
      return true;
    }
  };
  MM.settingsHooks.advanced_apps = {
    click(c, key) {
      const t = T();
      if (key === 'manage_perms') { MM.settingsGo(c, 'perm-groups', t.t('GooglePackageInstaller/app_permissions')); return true; }
      if (key === 'high_power_apps') { MM.settingsGo(c, 'high-power', t.t('high_power_apps')); return true; }
      return false;
    }
  };
})();
