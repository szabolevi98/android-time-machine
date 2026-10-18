/* Android 6.0.1 Settings (Settings.apk MTC20K): Security's sub-pages, Backup & reset's resets, Android Beam, Assist,
   notification and Do Not Disturb access, and the device admins.
   - SIM card lock (IccLockSettings, sim_lock_settings.xml): Lock SIM card and Change SIM PIN (EditPinPreference's
     dialogs). The simulator's SIM takes the first 4–8 digit PIN as its PIN (as 5.1.1's does); a wrong one afterwards
     says sim_lock_failed / sim_change_failed, a new PIN is typed twice (sim_pins_dont_match).
   - Device administrators (DeviceAdminSettings): the receivers holding android.app.device_admin in the image — Google
     Play services' Android Device Manager (wipe-data, reset-password, force-lock) and Android Pay (force-lock,
     limit-password), DMAgent's Google Apps Device Policy (the ten policies of dm_agent_device_admin.xml) — each with its
     label, description and check box; a row opens DeviceAdminAdd (device_admin_warning / device_admin_status, the
     framework's policylab_ / policydesc_ texts, Activate / Deactivate, Cancel).
   - Trusted credentials (TrustedCredentialsSettings): System / User tabs, the image's 158 CA certificates
     (mm-cacerts.js, docs/tools/mm-cacerts.py) with their switches, SslCertificate's details dialog with Disable / Enable
     and its confirmation; the user tab is empty.
   - Smart Lock (Google Play services' GoogleTrustAgentPersonalUnlockingSettings, personal_unlocking_settings_preferences
     through mm-appprefs.js), only with a secure lock.
   - Factory data reset (MasterClear, master_clear.xml): what it erases, the signed-in Google account, Reset phone, then
     MasterClearConfirm's Erase everything: the saved phone is erased and the page starts again from the boot.
   - Network settings reset (ResetNetwork / ResetNetworkConfirm): Wi-Fi, cellular data and Bluetooth back to their
     defaults, reset_network_complete_toast.
   - Android Beam (AndroidBeam: the switch bar, android_beam_explained), Notification access and Do Not Disturb access
     (no app of the image asks for them: their empty texts). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  const esc = (c, s) => c.safe(s);
  const H = MM.settingsHooks;
  const bar = (c, action, on) => `<button type="button" class="mmst-switchbar" data-action="${action}"><span>${esc(c, T().t(on ? 'switch_on_text' : 'switch_off_text'))}</span><i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i></button>`;

  // -- SIM card lock -------------------------------------------------------------------------------------------------
  function pinDialog(c, mode) {
    const t = T(), s = S(c);
    let step = 'pin', typed = '', fresh = '', error = '';
    const title = () => mode === 'change' ? t.t('sim_change_pin') : t.t(s.simLock ? 'sim_disable_sim_lock' : 'sim_enable_sim_lock');
    const prompt = () => ({pin: mode === 'change' ? 'sim_enter_old' : 'sim_enter_pin', new: 'sim_enter_new', again: 'sim_reenter_new'})[step];
    const open = () => c.dialog({title: title(), html: `<div class="mmsx-form"><label>${esc(c, t.t(prompt()))}${error ? `<b class="mmsx-err">${esc(c, t.t(error))}</b>` : ''}<input type="password" inputmode="numeric" maxlength="8" class="mmsx-pin" autocomplete="off"></label></div>`,
      mount(c, win) { typed = ''; const f = win.querySelector('.mmsx-pin'); f.addEventListener('input', () => { f.value = f.value.replace(/\D/g, ''); typed = f.value; }); setTimeout(() => f.focus(), 50); },
      buttons: [{label: t.t('sim_enter_cancel')}, {label: t.t('sim_enter_ok'), action: c => {
        const v = typed;
        if (v.length < 4) { error = ''; open(); return; }
        if (step === 'pin') {
          if (s.simPin && v !== s.simPin) { c.toast(t.t(mode === 'change' ? 'sim_change_failed' : 'sim_lock_failed')); return; }
          if (!s.simPin) s.simPin = v;
          if (mode === 'toggle') { s.simLock = !s.simLock; c.save(); c.render(); return; }
          step = 'new'; error = ''; open(); return;
        }
        if (step === 'new') { fresh = v; step = 'again'; open(); return; }
        if (v !== fresh) { step = 'new'; error = 'sim_pins_dont_match'; open(); return; }
        s.simPin = fresh; c.save(); c.toast(t.t('sim_change_succeeded')); c.render();
      }}]});
    open();
  }
  H.sim_lock_settings = {
    get: (c, key) => key === 'sim_toggle' ? !!S(c).simLock : undefined,
    disabled: (c, key) => key === 'sim_pin' && !S(c).simLock,
    click(c, key) {
      if (key === 'sim_toggle') { pinDialog(c, 'toggle'); return true; }
      if (key === 'sim_pin') { pinDialog(c, 'change'); return true; }
      return false;
    }
  };

  // -- Device administrators -----------------------------------------------------------------------------------------
  const ADMINS = [
    {id: 'adm', label: 'PrebuiltGmsCore/common_mdm_feature_name', desc: 'PrebuiltGmsCore/mdm_device_admin_desc_2', icon: 'assets/gms-ic_google.png', policies: ['wipeData', 'resetPassword', 'forceLock'], app: 'PrebuiltGmsCore/common_app_name'},
    {id: 'pay', label: 'PrebuiltGmsCore/tp_payments_application_name', desc: 'PrebuiltGmsCore/tp_device_admin_desc', icon: 'assets/app-android-pay.png', policies: ['forceLock', 'limitPassword'], app: 'PrebuiltGmsCore/common_app_name'},
    {id: 'dm', label: 'DMAgent/agent_device_admin', desc: 'DMAgent/agent_device_admin_description', icon: 'assets/app-device-policy.png', policies: ['limitPassword', 'watchLogin', 'resetPassword', 'forceLock', 'wipeData', 'encryptedStorage', 'expirePassword', 'disableCamera', 'disableKeyguardFeatures', 'setGlobalProxy'], app: 'DMAgent/agent_device_admin'}];
  const activeAdmins = c => S(c).deviceAdmins || [];
  MM.settingsScreens['device-admins'] = {
    title: () => T().t('manage_device_admin'),
    render(c) {
      const t = T(), on = activeAdmins(c);
      return `<div class="mmst-list">${ADMINS.map(a => `<button type="button" class="mmst-pref" data-action="mmsx-admin" data-id="${a.id}"><span class="mmst-iconframe"><img class="mmst-ic big" src="${a.icon}" alt=""></span><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t(a.label))}</span><span class="mmst-summary">${esc(c, t.t(a.desc))}</span></span><span class="mmst-widget"><i class="mmst-check${on.includes(a.id) ? ' on' : ''}"></i></span></button>`).join('')}</div>`;
    },
    action(c, name, el) { if (name !== 'mmsx-admin') return false; MM.settingsGo(c, `device-admin:${el.dataset.id}`, T().t('device_admin_add_title')); return true; }
  };
  MM.settingsScreens['device-admin'] = {
    title: () => T().t('device_admin_add_title'),
    render(c, cur) {
      const t = T(), a = ADMINS.find(x => x.id === cur.screen.split(':')[1]), on = activeAdmins(c).includes(a.id);
      const pol = a.policies.map(p => `<div class="mmsx-policy"><b>${esc(c, t.t(`framework/policylab_${p}`))}</b><span>${esc(c, t.t(`framework/policydesc_${p}`))}</span></div>`).join('');
      return `<div class="mmsx-admin"><div class="mmsx-adminhead"><img src="${a.icon}" alt=""><b>${esc(c, t.t(a.label))}</b></div><p>${esc(c, t.t(a.desc))}</p>
        ${on ? '' : `<p class="mmsx-ask">${esc(c, t.t('add_device_admin_msg'))}</p>`}<p>${esc(c, t.fmt(on ? 'device_admin_status' : 'device_admin_warning', null, t.t(a.app)))}</p>${pol}</div>
        <div class="mmsx-foot"><button type="button" data-action="mmsx-admincancel">${esc(c, t.t('cancel'))}</button><button type="button" data-action="mmsx-adminok">${esc(c, t.t(on ? 'remove_device_admin' : 'add_device_admin'))}</button></div>`;
    },
    action(c, name, el, cur) {
      const id = cur.screen.split(':')[1], s = S(c);
      if (name === 'mmsx-admincancel') { c.ui.settings.stack.pop(); c.render(); return true; }
      if (name === 'mmsx-adminok') { const on = activeAdmins(c).includes(id); s.deviceAdmins = on ? activeAdmins(c).filter(x => x !== id) : [...activeAdmins(c), id]; c.save(); c.ui.settings.stack.pop(); c.render(); return true; }
      return false;
    }
  };

  // -- Trusted credentials -------------------------------------------------------------------------------------------
  MM.settingsScreens.credentials = {
    title: () => T().t('trusted_credentials'),
    bar(c) { const t = T(), tab = c.ui.credTab || 'system'; return `<div class="mmsx-tabs">${[['system', 'trusted_credentials_system_tab'], ['user', 'trusted_credentials_user_tab']].map(([k, l]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-action="mmsx-credtab" data-tab="${k}">${esc(c, t.t(l))}</button>`).join('')}</div>`; },
    render(c) {
      if ((c.ui.credTab || 'system') === 'user') return '<div class="mmst-list"></div>';
      const off = new Set(S(c).disabledCerts || []);
      return `<div class="mmst-list">${(MM.caCerts || []).map(x => `<button type="button" class="mmst-pref" data-action="mmsx-cert" data-id="${esc(c, x.file)}"><span class="mmst-texts"><span class="mmst-title wrap">${esc(c, x.p)}</span>${x.s ? `<span class="mmst-summary">${esc(c, x.s)}</span>` : ''}</span><span class="mmst-widget"><i class="mmw-switch${off.has(x.file) ? '' : ' on'}"><i class="mmw-thumb"></i></i></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'mmsx-credtab') { c.ui.credTab = el.dataset.tab; c.render(); return true; }
      if (name !== 'mmsx-cert') return false;
      const x = (MM.caCerts || []).find(y => y.file === el.dataset.id), off = (s.disabledCerts || []).includes(x.file);
      const date = v => new Intl.DateTimeFormat(c.locale(), {year: 'numeric', month: 'numeric', day: 'numeric'}).format(new Date(`${v}T12:00:00Z`));
      const field = (label, v) => v ? `<dt>${esc(c, t.t(`framework/${label}`))}</dt><dd>${esc(c, v)}</dd>` : '';
      const who = n => field('common_name', n.cn) + field('org_name', n.o) + field('org_unit', n.ou);
      const toggle = c => c.dialog({message: t.t(off ? 'trusted_credentials_enable_confirmation' : 'trusted_credentials_disable_confirmation'), buttons: [{label: t.t('cancel')}, {label: t.t('framework/ok'), action: c => {
        s.disabledCerts = off ? (s.disabledCerts || []).filter(f => f !== x.file) : [...(s.disabledCerts || []), x.file]; c.save(); c.render(); }}]});
      c.dialog({title: t.t('framework/ssl_certificate'), html: `<dl class="mmsx-cert"><dt class="h">${esc(c, t.t('framework/issued_to'))}</dt>${who(x.to)}<dt class="h">${esc(c, t.t('framework/issued_by'))}</dt>${who(x.by)}<dt class="h">${esc(c, t.t('framework/validity_period'))}</dt>${field('issued_on', date(x.from))}${field('expires_on', date(x.until))}<dt class="h">${esc(c, t.t('framework/fingerprints'))}</dt>${field('sha256_fingerprint', x.sha256)}${field('sha1_fingerprint', x.sha1)}</dl>`,
        buttons: [{label: t.t(off ? 'trusted_credentials_enable_label' : 'trusted_credentials_disable_label'), neutral: true, action: toggle}, {label: t.t('framework/ok')}]});
      return true;
    }
  };

  // -- Resets ---------------------------------------------------------------------------------------------------------
  const big = (c, action, label) => `<div class="mmsx-btncenter"><button type="button" class="mmsx-btn" data-action="${action}">${esc(c, label)}</button></div>`;
  MM.settingsScreens['master-clear'] = {
    title: () => T().t('master_clear_title'),
    render(c, cur) {
      const t = T();
      if (cur.screen.endsWith(':confirm')) return `<div class="mmsx-text">${esc(c, t.t('master_clear_final_desc'))}</div>${big(c, 'mmsx-erase', t.t('master_clear_final_button_text'))}`;
      return `<div class="mmsx-text">${esc(c, t.t('master_clear_desc'))}${esc(c, t.t('master_clear_accounts'))}</div><div class="mmsx-acct"><img src="assets/gms-auth_gls_ic_google_selected.png" alt=""><span>${esc(c, MM.account.email)}</span></div>${big(c, 'mmsx-masterclear', t.t('master_clear_button_text'))}`;
    },
    action(c, name) {
      if (name === 'mmsx-masterclear') {
        const go = () => MM.settingsGo(c, 'master-clear:confirm', T().t('master_clear_confirm_title'));
        if (['pin', 'password', 'pattern'].includes(S(c).lock?.type) && MM.confirmLock) MM.confirmLock(c, go); else go();
        return true;
      }
      if (name === 'mmsx-erase') { c.dialog({title: T().t('master_clear_progress_title'), progress: T().t('master_clear_progress_text'), cancelable: false}); setTimeout(() => c.factoryReset(), 1500); return true; }
      return false;
    }
  };
  MM.settingsScreens['reset-network'] = {
    title: () => T().t('reset_network_title'),
    render(c, cur) {
      const t = T();
      if (cur.screen.endsWith(':confirm')) return `<div class="mmsx-text">${esc(c, t.t('reset_network_final_desc'))}</div>${big(c, 'mmsx-resetnet2', t.t('reset_network_final_button_text'))}`;
      return `<div class="mmsx-text">${esc(c, t.t('reset_network_desc'))}</div>${big(c, 'mmsx-resetnet', t.t('reset_network_button_text'))}`;
    },
    action(c, name) {
      const t = T(), s = S(c);
      if (name === 'mmsx-resetnet') { MM.settingsGo(c, 'reset-network:confirm', t.t('reset_network_confirm_title')); return true; }
      if (name === 'mmsx-resetnet2') {
        Object.assign(s, {wifi: true, wifiSsid: 'Home Network', bluetooth: false, mobileData: true, btBonded: [], btConnected: [], savedNetworks: undefined});
        c.save(); MM.system?.changed(c); c.ui.settings.stack.pop(); c.ui.settings.stack.pop(); c.render(); c.toast(t.t('reset_network_complete_toast'));
        return true;
      }
      return false;
    }
  };

  // -- Android Beam, access lists ------------------------------------------------------------------------------------
  MM.settingsScreens.beam = {
    title: () => T().t('android_beam_settings_title'),
    bar: c => bar(c, 'mmsx-beam', (S(c).nfc ?? true) && (S(c).beam ?? true)),
    render: c => `<div class="mmsx-text">${esc(c, T().t('android_beam_explained'))}</div>`,
    action(c, name) { if (name !== 'mmsx-beam') return false; S(c).beam = !(S(c).beam ?? true); c.save(); c.render(); return true; }
  };
  MM.settingsScreens['notif-access'] = {title: () => T().t('manage_notification_access_title'), render: c => `<div class="mmst-empty center"><span>${esc(c, T().t('no_notification_listeners'))}</span></div>`};
  MM.settingsScreens['zen-access'] = {title: () => T().t('manage_zen_access_title'), render: c => `<div class="mmst-empty center"><span>${esc(c, T().t('zen_access_empty_text'))}</span></div>`};

  // ManageAssist (manage_assist.xml): the assist app (the Google app, the voice interaction service) and Use text from
  // screen, which the Google app's Now on Tap follows.
  H.manage_assist = {
    summary: (c, key) => key === 'default_assist' ? MM.appLabel(c, 'search') : undefined,
    get: (c, key) => key === 'context' ? (S(c).assistContext ?? true) : key === 'screenshot' ? (S(c).assistScreenshot ?? false) : undefined,
    set(c, key, v) { if (key === 'context') { S(c).assistContext = v; return true; } if (key === 'screenshot') { S(c).assistScreenshot = v; return true; } return false; },
    click(c, key) {
      if (key !== 'default_assist') return false;
      c.dialog({title: MM.settingsStr('string/default_assist_title'), items: [{html: `<span class="mmst-choice"><i class="mmw-radio on"></i><span>${esc(c, MM.appLabel(c, 'search'))}</span></span>`}, {html: `<span class="mmst-choice"><i class="mmw-radio"></i><span>${esc(c, T().t('default_assist_none'))}</span></span>`}], onItem: () => {}});
      return true;
    }
  };
})();
