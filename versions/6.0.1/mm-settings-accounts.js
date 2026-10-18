/* Android 6.0.1 Settings: Accounts (AccountSettings) and Add an account (ChooseAccountActivity), Settings.apk MTC20K,
   as MM.settingsScreens.accounts / 'add-account'.
   - The Google row for the demo account (gms auth_gls_label), then the Add account row (ic_menu_add: ic_menu_add_white in the accent); the
     overflow menu's Auto-sync data, checked (ContentResolver's master sync is on), with
     ConfirmAutoSyncChangeFragment's dialogs before a change.
   - ChooseAccountActivity: the account types the image's authenticators declare, by label: GMS Core's Google
     (auth_gls_label, auth_gls_ic_google_selected) and Gmail's Exchange, Personal (IMAP) and Personal (POP3) (with
     Gmail's icon); picking one starts its add-account flow (the authenticator's own activity). */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const S = c => c.data.settings;
  const TYPES = [['google', 'PrebuiltGmsCore/auth_gls_label', 'assets/gms-auth_gls_ic_google_selected.png'], ['exchange', 'PrebuiltGmail/exchange_eas_name', 'assets/app-gmail.png'],
    ['imap', 'PrebuiltGmail/imap_name', 'assets/app-gmail.png'], ['pop3', 'PrebuiltGmail/pop3_name', 'assets/app-gmail.png']];

  MM.settingsScreens.accounts = {
    title: () => T().t('account_settings_title'),
    actions: c => MM.menu.button(c),
    // AccountSettings.updateUi: one row per account type on the phone (the demo Google account, MM.account), then Add account.
    render(c) {
      const google = MM.account ? `<button type="button" class="mmst-pref" data-action="mmac-google"><span class="mmst-iconframe"><img class="mmst-ic" src="assets/gms-auth_gls_ic_google_selected.png" alt=""></span><span class="mmst-texts"><span class="mmst-title">${c.safe(T().t('PrebuiltGmsCore/auth_gls_label'))}</span></span></button>` : '';
      return `<div class="mmst-list">${google}<button type="button" class="mmst-pref" data-action="mmac-add"><span class="mmst-iconframe"><i class="mmst-ic" style="background:#009688;-webkit-mask-image:url('assets/st-ic_menu_add_white.png');mask-image:url('assets/st-ic_menu_add_white.png')"></i></span><span class="mmst-texts"><span class="mmst-title">${c.safe(T().t('add_account_label'))}</span></span></button></div>`;
    },
    action(c, name) {
      const t = T(), s = S(c);
      if (name === 'mmac-add') { MM.settingsGo(c, 'add-account', t.t('header_add_an_account')); return true; }
      if (name === 'mmac-google') { MM.settingsGo(c, 'account-sync', ''); return true; }
      if (name === 'mm-menu') {
        const on = s.autoSync ?? true;
        c.menu([{label: t.t('data_usage_menu_auto_sync'), checked: on, action: c => c.dialog({title: t.t(on ? 'data_usage_auto_sync_off_dialog_title' : 'data_usage_auto_sync_on_dialog_title'),
          message: t.t(on ? 'data_usage_auto_sync_off_dialog' : 'data_usage_auto_sync_on_dialog'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.autoSync = !on; c.save(); }}]})}]);
        return true;
      }
      return false;
    }
  };
  MM.settingsScreens['add-account'] = {
    title: () => T().t('header_add_an_account'),
    render(c) {
      const t = T(), collator = new Intl.Collator(c.locale());
      const list = TYPES.map(([id, label, icon]) => ({id, label: t.t(label), icon})).sort((a, b) => collator.compare(a.label, b.label));
      return `<div class="mmst-list">${list.map(e => `<button type="button" class="mmst-pref" data-action="mmac-type" data-type="${e.id}"><span class="mmst-iconframe"><img class="mmst-ic" src="${e.icon}" alt=""></span><span class="mmst-texts"><span class="mmst-title">${c.safe(e.label)}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmac-type') return false;
      const type = el.dataset.type;
      // Google Play services' AccountIntroActivity or the Email part of Gmail's account setup (mm-settings-more.js).
      c.ui.addAccount = null;
      MM.settingsGo(c, `account-setup:${type === 'google' ? 'google' : 'email'}`, '');
      return true;
    }
  };
})();
