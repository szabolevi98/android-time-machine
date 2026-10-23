/* Android 7.1.2 Settings: the special access lists and the device administrators (SettingsGoogle 7.1.2; android-7.1.2_r1
   sources in _aosp/aosp712/settings).
   - ManagedServiceSettings (NotificationAccessSettings, VrListenerSettings): a SwitchPreference per service holding the
     permission (the image: Google VR Services' VrNotificationService and VrCoreListenerService, enabled on API 24 by its
     is_n_or_above), titled with the service label or else the application label, sorted by label. Turning one on asks
     with the ScaryWarningDialogFragment (Deny / Allow); turning notification access off asks with the
     FriendlyWarningDialogFragment. EmptyTextSettings: the empty text centred in the list in textAppearanceMedium.
   - ZenAccessSettings: the packages requesting ACCESS_NOTIFICATION_POLICY (Camera, Google VR Services); framework
     config_defaultDndAccessPackages grants Camera; a package with notification access is approved and its switch
     disabled with zen_access_disabled_package_warning. On: zen_access_warning_dialog; off: the revoke dialog.
   - PremiumSmsAccess: no package has asked (SmsUsageMonitor keeps none), so only premium_sms_none.
   - UserCredentialsSettings: the keystore has no user key, so the list is empty (user_credentials.xml has no empty view).
   - DeviceAdminSettings (device_admin_item.xml): the receivers holding BIND_DEVICE_ADMIN whose device_admin XML is
     visible, and the active ones. DMAgent's and Gmail's are visible="false" and inactive, GmsCore's TapAndPay and
     kids receivers are disabled components: Android Device Manager is the one row, active while Google settings' "Allow
     remote lock and erase" is on. A row opens DeviceAdminAdd (Theme.SubSettingsDialogWhenLarge, full screen on a
     phone): the 48 dp icon and bold name, the description, device_admin_warning or device_admin_status with the policy
     list (DeviceAdminInfo.sPoliciesDisplayOrder; AppSecurityPermissions' app_permission_item_old with
     ic_bullet_key_permission, the descriptions only while adding), then the action and Cancel buttons. */
(() => {
  'use strict';
  const T = () => NG.text('settings'), t = k => T().t(k), f = (k, ...a) => T().fmt(k, null, ...a);
  const S = c => c.data.settings.access ||= {nls: [], vr: [], zen: ['com.google.android.GoogleCamera']};
  const VR = 'com.google.vr.vrcore', CAMERA = 'com.google.android.GoogleCamera';
  const pkgOf = pkg => NG.systemPackages?.find(p => p.pkg === pkg);
  const label = (c, pkg) => { const p = pkgOf(pkg); return p ? (p.label[c.lang] || p.label.en) : pkg; };
  const icon = pkg => `<img class="ngsa-appic" src="${pkgOf(pkg)?.icon || 'assets/fw-sym_def_app_icon.png'}" alt="">`;
  const sorted = (c, list) => [...list].sort((a, b) => new Intl.Collator(c.locale()).compare(label(c, a), label(c, b)));
  const empty = (c, key) => `<div class="ngsa-empty">${c.safe(t(key))}</div>`;
  const redraw = c => { c.save(); c.transition('none'); c.render(); };
  const toggle = (list, pkg, on) => on ? [...new Set([...list, pkg])] : list.filter(x => x !== pkg);
  Object.assign(NG.settingsFragments, {
    'com.android.settings.notification.NotificationAccessSettings': 'notification-access',
    'com.android.settings.applications.VrListenerSettings': 'vr-listeners',
    'com.android.settings.notification.ZenAccessSettings': 'zen-access',
    'com.android.settings.applications.PremiumSmsAccess': 'premium-sms',
    'com.android.settings.UserCredentialsSettings': 'user-credentials',
    'com.android.settings.DeviceAdminSettings': 'device-admins', 'com.android.settings.Settings$DeviceAdminSettingsActivity': 'device-admins'
  });

  // ManagedServiceSettings and its two configs.
  const SERVICES = {
    'notification-access': {list: 'nls', title: 'notification_listener_security_warning_title', summary: 'notification_listener_security_warning_summary', empty: 'no_notification_listeners', services: [VR]},
    'vr-listeners': {list: 'vr', title: 'vr_listener_security_warning_title', summary: 'vr_listener_security_warning_summary', empty: 'no_vr_listeners', services: [VR]}
  };
  for (const [id, cfg] of Object.entries(SERVICES)) NG.settingsScreens[id] = {
    render(c) {
      const on = S(c)[cfg.list] || [];
      if (!cfg.services.length) return empty(c, cfg.empty);
      return `<div class="ngst-list">${NG.settingsJoinRows(sorted(c, cfg.services).map(pkg => ({html: NG.settingsRow(c, {title: label(c, pkg), icon: icon(pkg), widget: NG.settingsSwitch(on.includes(pkg)), action: 'ngsa-service', data: ` data-pkg="${pkg}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngsa-service') return false;
      const s = S(c), pkg = el.dataset.pkg, title = label(c, pkg), set = v => { s[cfg.list] = toggle(s[cfg.list] || [], pkg, v); redraw(c); };
      if (!(s[cfg.list] || []).includes(pkg)) {
        c.dialog({title: f(cfg.title, title), message: f(cfg.summary, title), buttons: [{label: t('deny')}, {label: t('allow'), action: () => set(true)}]});
      } else if (cfg.list === 'nls') {
        c.dialog({message: f('notification_listener_disable_warning_summary', title), buttons: [{label: t('notification_listener_disable_warning_cancel')}, {label: t('notification_listener_disable_warning_confirm'), action: () => set(false)}]});
      } else set(false);
      return true;
    }
  };

  NG.settingsScreens['zen-access'] = {
    render(c) {
      const s = S(c), approved = s.nls || [];
      return `<div class="ngst-list">${NG.settingsJoinRows(sorted(c, [CAMERA, VR]).map(pkg => {
        const auto = approved.includes(pkg);
        return {html: NG.settingsRow(c, {title: label(c, pkg), summary: auto ? t('zen_access_disabled_package_warning') : '', icon: icon(pkg), widget: NG.settingsSwitch(auto || (s.zen || []).includes(pkg), auto), action: 'ngsa-zen', data: ` data-pkg="${pkg}"`, disabled: auto}), sel: true};
      }))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngsa-zen') return false;
      const s = S(c), pkg = el.dataset.pkg, title = label(c, pkg), set = v => { s.zen = toggle(s.zen || [], pkg, v); redraw(c); };
      if ((s.nls || []).includes(pkg)) return true;
      if ((s.zen || []).includes(pkg)) c.dialog({title: f('zen_access_revoke_warning_dialog_title', title), message: t('zen_access_revoke_warning_dialog_summary'), buttons: [{label: t('cancel')}, {label: t('okay'), action: () => set(false)}]});
      else c.dialog({title: f('zen_access_warning_dialog_title', title), message: t('zen_access_warning_dialog_summary'), buttons: [{label: t('deny')}, {label: t('allow'), action: () => set(true)}]});
      return true;
    }
  };
  NG.settingsScreens['premium-sms'] = {render: c => empty(c, 'premium_sms_none')};
  NG.settingsScreens['user-credentials'] = {render: () => '<div class="ngst-list"></div>'};

  // Device administrators. Android Device Manager is GmsCore's MdmDeviceAdminReceiver (device_admin.xml: wipe-data,
  // reset-password, force-lock); its state is Google settings' remote lock and erase (ng-gms.js).
  const POLICIES = [['framework/policylab_wipeData', 'framework/policydesc_wipeData'], ['framework/policylab_resetPassword', 'framework/policydesc_resetPassword'], ['framework/policylab_forceLock', 'framework/policydesc_forceLock']];
  const active = c => c.data.gms?.wipe ?? true;
  const setActive = (c, v) => { (NG.gmsState ? NG.gmsState(c) : (c.data.gms ||= {})).wipe = v; c.save(); };
  const GMS_ICON = 'assets/gms-common_ic_googleplayservices.png';
  NG.deviceAdminOpen = c => NG.settingsGo(c, 'device-admin', t(active(c) ? 'active_device_admin_msg' : 'add_device_admin_msg'));
  NG.settingsScreens['device-admins'] = {
    render(c) {
      return `<div class="ngst-list"><button type="button" class="ngsa-admin" data-action="ngsa-admin"><img class="ngsa-adminic" src="${GMS_ICON}" alt=""><span class="ngsa-admintexts"><span class="ngsa-adminname">${c.safe(t('PrebuiltGmsCore/common_mdm_feature_name'))}</span><span class="ngsa-admindesc">${c.safe(t('PrebuiltGmsCore/mdm_device_admin_desc_2'))}</span></span><i class="ngst-check${active(c) ? ' on' : ''}"></i></button></div>`;
    },
    action(c, name) { if (name !== 'ngsa-admin') return false; NG.deviceAdminOpen(c); return true; }
  };
  NG.settingsScreens['device-admin'] = {
    render(c) {
      const on = active(c), app = t('PrebuiltGmsCore/common_app_name');
      const policies = POLICIES.map(([l, d]) => `<div class="ngsa-policy"><img src="assets/fw-ic_bullet_key_permission.png" alt=""><span><b>${c.safe(t(l))}</b>${on ? '' : `<small>${c.safe(t(d))}</small>`}</span></div>`).join('');
      return `<div class="ngsa-add"><div class="ngsa-addscroll"><div class="ngsa-addhead"><img src="${GMS_ICON}" alt=""><b>${c.safe(t('PrebuiltGmsCore/common_mdm_feature_name'))}</b></div>
        <div class="ngsa-addbody"><p>${c.safe(t('PrebuiltGmsCore/mdm_device_admin_desc_2'))}</p><p class="ngsa-warning">${c.safe(f(on ? 'device_admin_status' : 'device_admin_warning', app))}</p><div class="ngsa-policies">${policies}</div></div></div>
        <div class="ngsa-buttons"><button type="button" data-action="ngsa-admin-act">${c.safe(t(on ? 'remove_device_admin' : 'add_device_admin'))}</button><button type="button" data-action="ngsa-admin-cancel">${c.safe(t('cancel'))}</button></div></div>`;
    },
    action(c, name) {
      if (name === 'ngsa-admin-act') { setActive(c, !active(c)); NG.settingsBack(c); return true; }
      if (name === 'ngsa-admin-cancel') { NG.settingsBack(c); return true; }
      return false;
    }
  };
})();
