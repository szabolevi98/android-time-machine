/* Android 7.1.2 Settings: Accounts (AccountSettings), Add an account (ChooseAccountActivity), AccountSyncSettings and
   the authenticators' add-account starts (SettingsGoogle N2G48C). The logic is 6.0.1's (its accounts code); N2G48C
   decides what differs:
   - AccountSettings on a phone with one profile: a row per account type on the phone with the authenticator's label and
     icon (GMS Core's auth_authenticator.xml: Google, auth_ic_google_account), then Add account (ic_menu_add); the
     overflow's Auto-sync data check box with ConfirmAutoSyncChangeFragment's dialogs. One account of a type opens its
     AccountSyncSettings at once.
   - AccountSyncSettings: the account's header (its icon and name), then a SyncStateSwitchPreference per Google sync
     adapter of the image (ng-sync-adapters.js) with "Last synced …" (or Sync is OFF while auto-sync is off); the
     overflow's Sync now / Cancel sync and Remove account (really_remove_account_*; the only Google account of the phone
     is not removed here: remove_account_failed).
   - ChooseAccountActivity: the account types the image's authenticators add, by label: Google (GMS Core) and Gmail's
     Exchange, Personal (IMAP) and Personal (POP3) with Gmail's launcher icon; picking one starts its own flow: GMS Core's
     "Checking info…", then, with no route to Google's servers, "Couldn't sign in"; Gmail's Account setup ends in its
     own connection error. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const S = c => c.data.settings;
  const A = name => `assets/${name}`;
  const go = (c, screen, title) => NG.settingsGo(c, screen, title);
  const GOOGLE_ICON = A('gms-auth_ic_google_account.png');
  const TYPES = [['google', 'PrebuiltGmsCore/auth_authenticator_label', GOOGLE_ICON], ['exchange', 'PrebuiltGmail/exchange_eas_name', A('app-gmail.png')],
    ['imap', 'PrebuiltGmail/imap_name', A('app-gmail.png')], ['pop3', 'PrebuiltGmail/pop3_name', A('app-gmail.png')]];
  Object.assign(NG.settingsFragments, {'com.android.settings.accounts.AccountSettings': 'accounts', 'com.android.settings.accounts.AccountSyncSettings': 'account-sync'});
  const icon = src => `<img class="ngst-ic icon48" src="${src}" alt="">`;
  const autoSync = c => S(c).autoSync ?? true;

  NG.settingsScreens.accounts = {
    title: () => T().t('account_settings_title'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T();
      return `<div class="ngst-list">${NG.settingsJoinRows([
        {html: NG.settingsRow(c, {title: t.t('PrebuiltGmsCore/auth_authenticator_label'), icon: icon(GOOGLE_ICON), action: 'ngac-google'}), sel: true},
        {html: NG.settingsRow(c, {title: t.t('add_account_label'), icon: `<i class="ngst-ic masked" style="background:#009688;-webkit-mask-image:url('${A('st-ic_menu_add.svg')}');mask-image:url('${A('st-ic_menu_add.svg')}')"></i>`, action: 'ngac-add'}), sel: true}])}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c);
      if (name === 'ngac-add') { go(c, 'add-account', t.t('header_add_an_account')); return true; }
      if (name === 'ngac-google') { go(c, 'account-sync', t.t('account_sync_settings_title')); return true; }
      if (name === 'ng-menu') {
        const on = autoSync(c);
        c.menu([{label: t.t('data_usage_menu_auto_sync'), checked: on, action: c => c.dialog({title: t.t(on ? 'data_usage_auto_sync_off_dialog_title' : 'data_usage_auto_sync_on_dialog_title'),
          message: t.t(on ? 'data_usage_auto_sync_off_dialog' : 'data_usage_auto_sync_on_dialog'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.autoSync = !on; c.save(); c.render(); }}]})}], el);
        return true;
      }
      return false;
    }
  };
  // The time of the last sync: the phone's own boot, then Sync now.
  const lastSync = c => new Intl.DateTimeFormat(c.locale(), {dateStyle: 'short', timeStyle: 'short', hour12: !(S(c).time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12)}).format(new Date(S(c).lastSync || NG.system.live.bootAt));
  NG.settingsScreens['account-sync'] = {
    title: () => T().t('account_sync_settings_title'),
    actions: c => NG.menu.button(c),
    render(c) {
      const t = T(), off = new Set(S(c).syncOff || []), syncing = (c.ui.syncUntil || 0) > Date.now();
      if (syncing) setTimeout(() => c.ui.view === 'settings' && c.render(), c.ui.syncUntil - Date.now() + 30);
      const rows = (NG.syncAdapters || []).map(a => {
        const on = !off.has(a.authority) && autoSync(c);
        const summary = !autoSync(c) ? t.t('sync_disabled') : syncing && on ? t.t('sync_in_progress') : t.fmt('last_synced', null, lastSync(c));
        return {html: NG.settingsRow(c, {title: a[c.lang] || a.en, summary, widget: NG.settingsSwitch(on, !autoSync(c)), action: 'ngac-sync', data: ` data-a="${c.safe(a.authority)}"`, disabled: !autoSync(c)}), sel: true};
      });
      return `<div class="ngst-list"><div class="ngac-head">${icon(GOOGLE_ICON)}<span>${c.safe(NG.account.email)}</span></div>${NG.settingsJoinRows(rows)}</div>`;
    },
    action(c, name, el) {
      const t = T(), s = S(c), syncing = (c.ui.syncUntil || 0) > Date.now();
      if (name === 'ng-menu') {
        c.menu([syncing ? {label: t.t('sync_menu_sync_cancel'), action: c => { c.ui.syncUntil = 0; c.render(); }} : {label: t.t('sync_menu_sync_now'), action: c => { c.ui.syncUntil = Date.now() + 2500; s.lastSync = Date.now() + 2500; c.save(); c.render(); }},
          {label: t.t('remove_account_label'), action: c => c.dialog({title: t.t('really_remove_account_title'), message: t.t('really_remove_account_message'), buttons: [{label: t.t('cancel')},
            {label: t.t('remove_account_label'), action: c => c.dialog({title: t.t('really_remove_account_title'), message: t.t('remove_account_failed'), buttons: [{label: t.t('ok')}]})}]})}], el);
        return true;
      }
      if (name === 'ngac-sync') { const a = el.dataset.a, off = new Set(s.syncOff || []); off.has(a) ? off.delete(a) : off.add(a); s.syncOff = [...off]; c.save(); c.transition('none'); c.render(); return true; }
      return false;
    }
  };
  NG.settingsScreens['add-account'] = {
    title: () => T().t('header_add_an_account'),
    render(c) {
      const t = T(), col = new Intl.Collator(c.locale());
      const list = TYPES.map(([id, label, src]) => ({id, label: t.t(label), src})).sort((a, b) => col.compare(a.label, b.label));
      return `<div class="ngst-list">${NG.settingsJoinRows(list.map(e => ({html: NG.settingsRow(c, {title: e.label, icon: icon(e.src), action: 'ngac-type', data: ` data-type="${e.id}"`}), sel: true})))}</div>`;
    },
    action(c, name, el) {
      if (name !== 'ngac-type') return false;
      c.ui.addAccount = null;
      go(c, `account-setup:${el.dataset.type === 'google' ? 'google' : 'email'}`, '');
      return true;
    }
  };
  NG.settingsScreens['account-setup'] = {
    full: true,
    render(c, cur) {
      const t = T(), type = cur.screen.split(':')[1], u = c.ui.addAccount || (c.ui.addAccount = {email: ''});
      if (type === 'google') return u.failed
        ? `<div class="ngac-gsign"><img class="ngac-glogo" src="${A('gms-ic_google.png')}" alt=""><h1>${c.safe(t.t('PrebuiltGmsCore/auth_show_error_activity_title'))}</h1><p>${c.safe(t.t('PrebuiltGmsCore/auth_error_generic_server_error'))}</p><div class="ngac-gfoot"><i></i><button type="button" data-action="ngac-back">${c.safe(t.t('framework/ok'))}</button></div></div>`
        : `<div class="ngac-gsign"><img class="ngac-glogo" src="${A('gms-ic_google.png')}" alt=""><h1>${c.safe(t.t('PrebuiltGmsCore/auth_gls_name_checking_info_title'))}</h1><div class="ngac-gspin"><svg class="ngdlg-spinner" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19"/></svg></div></div>`;
      const g = 'PrebuiltGmail/';
      return `<div class="ngac-esetup"><div class="ngac-ebar">${c.safe(t.t(g + 'account_setup_basics_title'))}</div><div class="ngac-ebody"><h2>${c.safe(t.t(g + 'account_setup_basics_headline'))}</h2>
        <input class="ngwf-edit" type="email" data-f="email" value="${c.safe(u.email)}" placeholder="${c.safe(t.t(g + 'account_setup_basics_email_label'))}" autocomplete="off"></div>
        <div class="ngac-efoot"><button type="button" data-action="ngac-manual">${c.safe(t.t(g + 'account_setup_basics_manual_setup_action'))}</button><button type="button" data-action="ngac-next">${c.safe(t.t(g + 'next'))}</button></div></div>`;
    },
    mount(c, root, cur) {
      for (const f of root.querySelectorAll('[data-f]')) f.addEventListener('input', () => { c.ui.addAccount[f.dataset.f] = f.value; });
      if (cur.screen.endsWith(':google') && !c.ui.addAccount.failed) setTimeout(() => { if (c.ui.addAccount) { c.ui.addAccount.failed = true; c.render(); } }, 1600);
    },
    back(c) { c.ui.addAccount = null; return false; },
    action(c, name) {
      const t = T(), u = c.ui.addAccount;
      if (name === 'ngac-back') { c.ui.addAccount = null; c.ui.settings.stack.pop(); c.render(); return true; }
      if (name === 'ngac-next' || name === 'ngac-manual') {
        if (!u.email.trim()) return true;
        c.dialog({progress: t.t('PrebuiltGmail/account_setup_check_settings_check_incoming_msg'), cancelable: false});
        setTimeout(() => { c.closeDialog(); c.dialog({title: t.t('PrebuiltGmail/account_setup_failed_dlg_title'), message: t.t('PrebuiltGmail/account_setup_failed_ioerror'), buttons: [{label: t.t('PrebuiltGmail/account_setup_failed_dlg_edit_details_action')}]}); }, 1500);
        return true;
      }
      return false;
    }
  };
})();
