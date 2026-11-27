/* Android 2.1 Settings › Applications › Manage applications and Application info, over EC.packages (ec-packages.js,
   generated from the image's packages).
   - ManageApplications (compute_sizes.xml): sorted A–Z, filtered to Downloaded at first (the constructor's
     mFilterApps = FILTER_APPS_THIRD_PARTY, mSortOrder = SORT_ORDER_ALPHA). Every package of the image is a system app,
     so that shows "You do not have any third-party applications installed." Menu: Sort / Sort by size and Filter
     ("Select filter options": All, Downloaded, Running). Rows (manage_applications_item.xml): the 48 dp icon (5 / 11 dp
     margins), the bold label and the size (Formatter.formatFileSize of the code size: the APK and its odex; a fresh
     phone's data and cache are left at nothing here). Running: the persistent packages, the home screen and the apps
     opened since the phone started.
   - InstalledAppDetails (installed_app_details.xml): icon, bold label, "version …"; Storage (Total, Application, Data,
     and Clear data, which asks "Delete" first), Cache (Clear cache), Launch by default ("No defaults set.", Clear
     defaults), Controls (Force stop, for a running app) and Permissions: AppSecurityPermissions (app_perms_summary.xml)
     lists the dangerous permissions by group (ic_bullet_key_permission, the group label in bold over the permission
     labels joined with permissions_format) and the rest under "Show all"; "No permissions required" when there are
     none.
   An app installed from the Market (EC.apps entries with a storeId, ec-market.js) is a downloaded package: Downloaded
   lists it, Running once it has been opened, and its Application info has Uninstall beside Clear data
   (UninstallerActivity: "Uninstall application?", "This application will be removed from your phone.", OK / Cancel,
   then "Uninstall finished!"). Its Clear data clears what it keeps. */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const A = () => EC.text('appmgr');
  const t = k => A().t(k);
  const L = (c, entry) => entry?.[c.lang] ?? entry?.en ?? '';
  const stack = c => c.ui.settingsStack;
  // The image's packages, and the ones installed from the Market (third party).
  const downloaded = () => EC.apps.list.filter(a => a.storeId).map(a => ({pkg: a.pkg, label: {en: a.name}, version: a.version, size: a.size, icon: a.icon, perms: a.perms, persistent: false, app: a.id, storeId: a.storeId}));
  const packages = () => [...EC.packages, ...downloaded()];
  const pkgOf = id => packages().find(p => p.pkg === id);
  // The packages with a running process: persistent ones, the home screen, and the apps opened this session.
  function running(c) {
    const set = new Set(EC.packages.filter(p => p.persistent).map(p => p.pkg));
    set.add('com.android.launcher2');
    for (const id of [c.ui.view, ...(c.ui.recent || [])]) {
      const apk = c.screens[id]?.[1]?.split(' ')[0];
      const p = apk && EC.packages.find(x => x.apk === apk);
      if (p) set.add(p.pkg);
    }
    for (const p of downloaded()) if ([c.ui.view, ...(c.ui.recent || [])].includes(p.app)) set.add(p.pkg);
    for (const p of c.ui.forceStopped || []) set.delete(p);
    return set;
  }
  const icon = p => `assets/${p.icon || 'fw-sym_def_app_icon.png'}`;
  function list(c) {
    const filter = c.ui.appFilter ?? 2, sort = c.ui.appSort ?? 4, run = running(c);
    let apps = filter === 2 ? downloaded() : packages().filter(p => filter === 0 || run.has(p.pkg));
    const locale = c.locale();
    apps = apps.slice().sort(sort === 5 ? (a, b) => b.size - a.size : (a, b) => L(c, a.label).localeCompare(L(c, b.label), locale));
    const rows = apps.map(p => `<button type="button" class="ecap-row" data-action="ecap-open" data-pkg="${esc(p.pkg)}"><i class="ec-bg ec-pressed np-fw-list_selector_background_pressed"></i><img src="${icon(p)}" alt=""><span class="ecap-text"><b>${esc(L(c, p.label))}</b><small>${esc(EC.fileSize(c, p.size))}</small></span></button><i class="ecpf-divider"></i>`).join('');
    return c.window(t('manageapplications_settings_title'), apps.length ? `<div class="ecpf-list">${rows}</div>` : `<div class="ecap-empty">${esc(t('empty_list_msg'))}</div>`);
  }
  const header = text => `<div class="ecap-sep">${esc(text)}</div>`;
  const sizeRow = (label, value) => `<div class="ecap-size"><span>${esc(label)}</span><i></i><span>${esc(value)}</span></div>`;
  const button = (action, label, disabled) => `<button type="button" class="ecui-button ecap-btn" data-action="${action}"${disabled ? ' disabled' : ''}><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  function permissions(c, p) {
    const groups = new Map(), normal = new Map();
    for (const name of p.perms) {
      const perm = EC.permissions[name];
      const key = perm.group || '', target = perm.dangerous ? groups : normal;
      if (!target.has(key)) target.set(key, []);
      target.get(key).push(L(c, perm.label));
    }
    const groupLabel = key => key && EC.permGroups[key] ? L(c, EC.permGroups[key].label) : t('framework/default_permission_group');
    const item = ([key, labels], dangerous) => `<div class="ecap-perm"><img src="assets/${dangerous ? 'fw-ic_bullet_key_permission.png' : 'fw-ic_text_dot.png'}" alt=""><div><b>${esc(groupLabel(key))}</b><span>${esc(labels.reduce((a, b) => A().fmt('framework/permissions_format', c.lang, a, b)))}</span></div></div>`;
    const sorted = map => [...map].sort((a, b) => groupLabel(a[0]).localeCompare(groupLabel(b[0]), c.locale()));
    if (!groups.size && !normal.size) return `<div class="ecap-noperm">${esc(t('framework/no_permissions'))}</div>`;
    const open = c.ui.appPermsAll;
    return `<div class="ecap-perms">${sorted(groups).map(g => item(g, true)).join('')}</div>${normal.size ? `<div class="ecap-more"><i class="ecap-div"></i><button type="button" class="ecap-showmore" data-action="ecap-more"><img class="np-fw-expander_ic_${open ? 'maximized' : 'minimized'}" src="assets/fw-expander_ic_${open ? 'maximized' : 'minimized'}.9.png" alt=""><b>${esc(t(open ? 'framework/perms_hide' : 'framework/perms_show_all'))}</b></button><i class="ecap-div"></i></div>${open ? `<div class="ecap-perms">${sorted(normal).map(g => item(g, false)).join('')}</div>` : ''}` : ''}`;
  }
  function details(c, p) {
    const zero = EC.fileSize(c, 0), run = running(c).has(p.pkg);
    return c.window(t('application_info_label'), `<div class="ecap-details">
      <div class="ecap-head"><div><b>${esc(L(c, p.label))}</b><span>${esc(A().fmt('version_text', c.lang, p.version))}</span></div><img src="${icon(p)}" alt=""></div>
      ${header(t('storage_label'))}${sizeRow(t('total_size_label'), EC.fileSize(c, p.size))}${sizeRow(t('application_size_label'), EC.fileSize(c, p.size))}${sizeRow(t('data_size_label'), zero)}
      <div class="ecap-buttons">${p.storeId ? button('ecap-uninstall', t('uninstall_text')) : '<span></span>'}${button('ecap-clear-data', t('clear_user_data_text'), p.pkg === 'android')}</div>
      ${header(t('cache_header_label'))}${sizeRow(t('cache_size_label'), zero)}<div class="ecap-buttons">${button('ecap-clear-cache', t('clear_cache_btn_text'), true)}</div>
      ${header(t('auto_launch_label'))}<div class="ecap-small">${esc(t('auto_launch_disable_text'))}</div><div class="ecap-buttons">${button('ecap-defaults', t('clear_activities'), true)}</div>
      ${header(t('controls_label'))}<div class="ecap-buttons">${button('ecap-stop', t('force_stop'), !run)}</div>
      ${header(t('permissions_label'))}<div class="ecap-small">${esc(t('security_settings_desc'))}</div>${permissions(c, p)}</div>`);
  }
  EC.settingsTargets = {...EC.settingsTargets, ManageApplications: c => { stack(c).push('apps'); c.ui.appFilter = 2; c.ui.appSort = 4; c.render(); }};
  document.addEventListener('DOMContentLoaded', () => {
    const m = EC.module('settings'), base = {render: m.render, action: m.action, menu: m.menu, back: m.back};
    m.render = c => {
      const top = stack(c)?.at(-1) || '';
      if (top === 'apps') return list(c);
      if (top.startsWith('app:')) { const p = pkgOf(top.slice(4)); if (p) return details(c, p); }
      return base.render(c);
    };
    m.action = (name, el, event, c) => {
      switch (name) {
        case 'ecap-open': stack(c).push(`app:${el.dataset.pkg}`); c.ui.appPermsAll = false; c.render(); c.el.viewport.querySelector('.ecwin-content')?.scrollTo(0, 0); return true;
        case 'ecap-more': c.ui.appPermsAll = !c.ui.appPermsAll; c.render(); return true;
        case 'ecap-stop': (c.ui.forceStopped ||= []).push(stack(c).at(-1).slice(4)); c.render(); return true;
        case 'ecap-clear-data': {
          const p = pkgOf(stack(c).at(-1).slice(4));
          c.dialog({title: t('clear_data_dlg_title'), icon: 'fw-ic_dialog_alert.png', message: t('clear_data_dlg_text'), buttons: [{label: t('dlg_ok'), action: () => { if (p?.storeId) { EC.module(p.app)?.clearData?.(c); c.save(); } }}, {label: t('dlg_cancel')}]});
          return true;
        }
        case 'ecap-uninstall': {
          const p = pkgOf(stack(c).at(-1).slice(4)); if (!p) return true;
          c.dialog({title: L(c, p.label), icon: p.icon, message: `${t('PackageInstaller/uninstall_application_question')}\n${t('PackageInstaller/uninstall_application_text')}`,
            buttons: [{label: t('dlg_ok'), action: () => { EC.marketUninstall(c, p.storeId); c.save(); stack(c).pop(); c.render(); c.toast(t('PackageInstaller/uninstall_done')); }}, {label: t('dlg_cancel')}]});
          return true;
        }
      }
      return base.action(name, el, event, c);
    };
    m.menu = c => {
      if (stack(c)?.at(-1) !== 'apps') return base.menu(c);
      const bySize = (c.ui.appSort ?? 4) === 5;
      c.menu([bySize ? {label: t('sort_order_alpha'), icon: 'fw-ic_menu_sort_alphabetically.png', action: () => { c.ui.appSort = 4; c.render(); }}
        : {label: t('sort_order_size'), icon: 'fw-ic_menu_sort_by_size.png', action: () => { c.ui.appSort = 5; c.render(); }},
      {label: t('filter'), icon: 'st-ic_menu_filter_settings.png', action: () => c.dialog({title: t('filter_dlg_title'), icon: null,
        items: [t('filter_apps_all'), t('filter_apps_third_party'), t('filter_apps_running')], onItem: i => { c.ui.appFilter = [0, 2, 1][i]; c.render(); }})}]);
      return true;
    };
  });
})();
