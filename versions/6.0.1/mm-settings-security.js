/* Android 6.0.1 Settings: Security and the screen lock (Settings.apk MTC20K).
   - SecuritySettings.createPreferenceHierarchy: security_settings.xml, the lock screen's own xml by the stored quality
     (getResIdForLockUnlockScreen: no lock security_settings_lockscreen, swipe security_settings_chooser, PIN / password /
     pattern their xml with Automatically lock and Power button instantly locks), Nexus Imprint added to that category
     (the 5X has the fingerprint sensor; "Touch to set up fingerprint" until one is enrolled), the trust agents
     TrustManagerService enabled from the image (GMS Core's Smart Lock, disabled with "To use, first set a screen lock"
     without a secure lock), security_settings_encrypted (the 5X ships encrypted), then security_settings_misc: SIM card
     lock (a SIM is in), Make passwords visible (on), Device administrators, Unknown sources (install_non_market_apps 0;
     turning it on warns install_all_warning), Hardware-backed credential storage, Trust agents (needs a secure lock),
     Screen pinning, Apps with usage access. Automatically lock shows lock_after_timeout_summary (5 seconds by default,
     lock_screen_lock_after_timeout) and, with Smart Lock, the "except when kept unlocked by" forms.
   - ChooseLockGeneric (security_settings_picker.xml): None, Swipe, Pattern, PIN, Password, the current one marked
     current_screen_lock; a secure lock is confirmed first (ConfirmLockPassword / ConfirmLockPattern: the accent Headline
     header, the Body1 details, Cancel, the entry), and leaving it for None or Swipe asks "Remove device protection?".
   - A new secure lock on the encrypted 5X goes through EncryptionInterstitial (Secure start-up: require it to start the
     device or No thanks), then ChooseLockPassword (choose_lock_password.xml: the Medium header, the 24 sp entry 30 dp in
     from the sides, Cancel / Continue at the bottom; at least 4 characters, a PIN digits only, a password one letter;
     Confirm your …, "… don't match") or ChooseLockPattern (choose_lock_pattern.xml's stages: at least 4 dots, Clear /
     Continue, Draw pattern again to confirm, Confirm), then RedactionInterstitial (Notifications: Show all / Hide
     sensitive / Don't show, the middle one checked).
   - Lock screen message (OwnerInfoSettings): an edit dialog, shown under the date on the lock screen. */
(() => {
  'use strict';
  const T = () => MM.text('settings');
  const H = MM.settingsHooks;
  const S = c => c.data.settings;
  const lock = c => S(c).lock || (S(c).lock = {type: 'swipe'});
  const secure = c => ['pin', 'password', 'pattern'].includes(lock(c).type);
  const X = () => MM.settingsXml;
  let core = null;
  MM.register('settings-security', {app: false, init(c) { core = c; }, render: () => ''});

  // The composed hierarchy, rebuilt from the current lock each time it is read.
  const LOCK_XML = {none: 'security_settings_lockscreen', swipe: 'security_settings_chooser', pin: 'security_settings_pin', password: 'security_settings_password', pattern: 'security_settings_pattern'};
  function composed() {
    const c = core, type = c ? lock(c).type : 'swipe';
    const cat = JSON.parse(JSON.stringify(X()[LOCK_XML[type]].c[0]));
    cat.c.push({t: 'Preference', key: 'fingerprint_settings', title: 'string/security_settings_fingerprint_preference_title', summary: 'string/security_settings_fingerprint_preference_summary_none'});
    cat.c.push({t: 'Preference', key: 'trust_agent', title: 'string/PrebuiltGmsCore/auth_google_trust_agent_title'});
    return {t: 'PreferenceScreen', title: 'string/security_settings_title', c: [cat, ...X().security_settings_encrypted.c, ...X().security_settings_misc.c]};
  }
  Object.defineProperty(MM.settingsXml, 'security', {get: composed, configurable: true});

  const trustTitle = () => T().t('PrebuiltGmsCore/auth_google_trust_agent_title');
  H.security = {
    title(c, key, n) { return key === 'trust_agent' ? trustTitle() : undefined; },
    get(c, key) {
      const l = lock(c), s = S(c);
      if (key === 'lock_after_timeout') return String(l.lockAfter ?? 5000);
      if (key === 'power_button_instantly_locks') return l.powerLocks ?? true;
      if (key === 'visiblepattern') return l.visible ?? true;
      if (key === 'show_password') return s.showPassword ?? true;
      if (key === 'toggle_install_applications') return !!s.unknownSources;
      return undefined;
    },
    set(c, key, v) {
      const l = lock(c), s = S(c);
      if (key === 'lock_after_timeout') { l.lockAfter = +v; return true; }
      if (key === 'power_button_instantly_locks') { l.powerLocks = v; return true; }
      if (key === 'visiblepattern') { l.visible = v; return true; }
      if (key === 'show_password') { s.showPassword = v; return true; }
      if (key === 'toggle_install_applications') { s.unknownSources = v; return true; }
      return false;
    },
    // Clear credentials is enabled only with user certificates installed (SecuritySettings' mResetCredentials:
    // KeyStore.isEmpty()); the simulator has none.
    disabled: (c, key) => key === 'credentials_reset' || ((key === 'trust_agent' || key === 'manage_trust_agents') && !secure(c)),
    summary(c, key, n) {
      const t = T(), l = lock(c);
      if (key === 'trust_agent') return secure(c) ? '' : t.t('disabled_because_no_backup_security');
      if (key === 'fingerprint_settings' && MM.fingerprint?.count(c)) { const n = MM.fingerprint.count(c); return MM.text('fingerprint').plural('security_settings_fingerprint_preference_summary', n, null, n); }
      if (key === 'manage_trust_agents' && !secure(c)) return t.t('disabled_because_no_backup_security');
      if (key === 'credential_storage_type') return t.t('credential_storage_type_hardware');
      if (key === 'owner_info_settings') return l.ownerInfo || MM.settingsStr(n.summary);
      if (key === 'power_button_instantly_locks') return t.fmt('lockpattern_settings_power_button_instantly_locks_summary', null, trustTitle());
      if (key === 'lock_after_timeout') {
        const values = n.entryValues, entries = MM.settingsArr(n.entries), cur = l.lockAfter ?? 5000;
        let i = 0; values.forEach((v, j) => { if (cur >= +v) i = j; });
        return +values[i] === 0 ? t.fmt('lock_immediately_summary_with_exception', null, trustTitle()) : t.fmt('lock_after_timeout_summary_with_exception', null, entries[i], trustTitle());
      }
      return undefined;
    },
    click(c, key) {
      const t = T(), l = lock(c), s = S(c);
      if (key === 'unlock_set_or_change') {
        if (secure(c)) MM.settingsGo(c, 'lock-confirm:picker', t.t('unlock_set_unlock_launch_picker_title'));
        else MM.settingsGo(c, 'xml:security_settings_picker', t.t('lock_settings_picker_title'));
        return true;
      }
      if (key === 'owner_info_settings') {
        c.dialog({title: t.t('owner_info_settings_title'), html: `<div class="mmst-edit"><input type="text" class="mmst-input mmsc-owner" value="${c.safe(l.ownerInfo || '')}" spellcheck="false"></div>`,
          buttons: [{label: t.t('cancel')}, {label: t.t('save'), action: c => { l.ownerInfo = c.ui.ownerInfo ?? l.ownerInfo; c.save(); c.render(); }}],
          mount(c, win) { const i = win.querySelector('.mmsc-owner'); c.ui.ownerInfo = i.value; i.addEventListener('input', () => { c.ui.ownerInfo = i.value.trim(); }); setTimeout(() => i.focus(), 50); }});
        return true;
      }
      if (key === 'fingerprint_settings') { MM.fingerprint.open(c); return true; }
      // CertInstallerMain looks for certificate files in the storage's root; there are none.
      if (key === 'credentials_install') { c.toast(t.t('CertInstaller/no_cert_file_found')); return true; }
      // Google Play services' Smart Lock settings, an activity of its own (only with a secure lock).
      if (key === 'trust_agent') { MM.openPrefs(c, 'smartlock', 'personal_unlocking_settings_preferences', trustTitle()); return true; }
      if (key === 'usage_access') { MM.settingsGo(c, 'usage-access', t.t('usage_access_title')); return true; }
      if (key === 'toggle_install_applications' && !s.unknownSources) {
        c.dialog({message: t.t('install_all_warning'), buttons: [{label: t.t('cancel')}, {label: t.t('okay'), action: c => { s.unknownSources = true; c.save(); c.render(); }}]});
        return true;
      }
      return false;
    }
  };

  // -- ChooseLockGeneric ---------------------------------------------------------------------------------------------
  const PICK = {unlock_set_off: 'none', unlock_set_none: 'swipe', unlock_set_pattern: 'pattern', unlock_set_pin: 'pin', unlock_set_password: 'password'};
  function setLock(c, type, secret = '') {
    const l = lock(c); l.type = type; l.secret = secret;
    // No secure lock, no fingerprints (ChooseLockGeneric's removeAllFingerprintTemplates).
    if (!secure(c)) MM.fingerprint?.clear(c);
    c.save();
  }
  // Back to Security, dropping the lock screens from the stack.
  function done(c) {
    const st = c.ui.settings; while (st.stack.length > 1 && st.stack.at(-1).screen !== 'xml:security') st.stack.pop();
    // A backup lock set up for Nexus Imprint goes on to the sensor; without one the enrollment ends.
    if (c.ui.fpFlow === 'onboard') { if (secure(c)) { MM.fingerprint.continueFlow(c); return; } c.ui.fpFlow = ''; }
    c.render();
  }
  H.security_settings_picker = {
    // For Nexus Imprint: the backup methods only, under lock_settings_picker_fingerprint_message.
    hide: (c, key) => c.ui.fpFlow === 'onboard' && (key === 'unlock_set_off' || key === 'unlock_set_none'),
    top: c => c.ui.fpFlow === 'onboard' ? `<div class="mmfp-pickhead">${c.safe(MM.text('fingerprint').t('lock_settings_picker_fingerprint_message'))}</div>` : '',
    summary: (c, key) => PICK[key] === lock(c).type ? T().t('current_screen_lock') : undefined,
    click(c, key) {
      const t = T(), type = PICK[key];
      if (!type) return false;
      const apply = () => {
        if (type === 'none' || type === 'swipe') { setLock(c, type); done(c); return; }
        MM.settingsGo(c, `lock-encrypt:${type}`, t.t('encryption_interstitial_header'));
      };
      if (secure(c) && (type === 'none' || type === 'swipe')) {
        c.dialog({title: t.t('unlock_disable_frp_warning_title'), message: t.t(`unlock_disable_frp_warning_content_${lock(c).type}`),
          buttons: [{label: t.t('cancel')}, {label: t.t('unlock_disable_frp_warning_ok'), action: apply}]});
        return true;
      }
      apply();
      return true;
    }
  };

  // -- EncryptionInterstitial ----------------------------------------------------------------------------------------
  MM.settingsScreens['lock-encrypt'] = {
    title: () => T().t('encryption_interstitial_header'),
    render(c, cur) {
      const t = T(), type = cur.screen.split(':')[1], req = c.ui.encryptReq ?? true;
      const radio = (on, label, v) => `<button type="button" class="mmsc-radio" data-action="mmsc-req" data-v="${v}"><i class="mmw-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></button>`;
      return `<div class="mmsc-inter"><p class="mmsc-medium">${c.safe(t.t(`encryption_interstitial_message_${type}`))}</p>
        <div class="mmsc-radios">${radio(req, t.t(`encrypt_require_${type}`), 1)}${radio(!req, t.t(`encrypt_dont_require_${type}`), 0)}</div></div>
        <div class="mmsc-buttons"><i></i><button type="button" class="mmsc-button" data-action="mmsc-continue">${c.safe(t.t('encryption_continue_button'))}</button></div>`;
    },
    action(c, name, el, cur) {
      const t = T(), type = cur.screen.split(':')[1];
      if (name === 'mmsc-req') { c.ui.encryptReq = el.dataset.v === '1'; c.render(); return true; }
      if (name === 'mmsc-continue') {
        lock(c).requireAtBoot = c.ui.encryptReq ?? true; c.ui.encryptReq = null;
        MM.settingsGo(c, `lock-choose:${type}`, t.t(type === 'pattern' ? 'lockpassword_choose_your_pattern_header' : `lockpassword_choose_your_${type}_header`));
        return true;
      }
      return false;
    }
  };

  // -- ChooseLockPassword / ChooseLockPattern -------------------------------------------------------------------------
  const st = c => c.ui.chooseLock || (c.ui.chooseLock = {first: null, stage: 'intro', text: ''});
  function validate(type, text) {
    const t = T();
    if (text.length < 4) return t.fmt(type === 'pin' ? 'lockpassword_pin_too_short' : 'lockpassword_password_too_short', null, 4);
    if (text.length > 16) return t.fmt(type === 'pin' ? 'lockpassword_pin_too_long' : 'lockpassword_password_too_long', null, 17);
    if (type === 'pin' && /\D/.test(text)) return t.t('lockpassword_pin_contains_non_digits');
    if (/[^\x20-\x7f]/.test(text)) return t.t('lockpassword_illegal_character');
    if (type === 'password' && !/[a-zA-Z]/.test(text)) return t.t('lockpassword_password_requires_alpha');
    return '';
  }
  function passwordView(c, type) {
    const t = T(), s = st(c), confirm = s.first != null;
    let header = s.wrong ? t.t(type === 'pin' ? 'lockpassword_confirm_pins_dont_match' : 'lockpassword_confirm_passwords_dont_match')
      : t.t(confirm ? `lockpassword_confirm_your_${type}_header` : `lockpassword_choose_your_${type}_header`);
    let ok = false;
    if (s.text) { const err = confirm ? '' : validate(type, s.text); if (err) header = err; else { if (!confirm) header = t.t('lockpassword_press_continue'); ok = true; } }
    return `<div class="mmsc-choose"><div class="mmsc-header">${c.safe(header)}</div>
      <input class="mmsc-entry" type="password" ${type === 'pin' ? 'inputmode="numeric"' : ''} autocomplete="off" spellcheck="false" value="${c.safe(s.text)}"><i class="mmsc-fill"></i>
      <div class="mmsc-buttons"><button type="button" class="mmsc-button" data-action="mmsc-cancel">${c.safe(t.t('lockpassword_cancel_label'))}</button><button type="button" class="mmsc-button" data-action="mmsc-next"${ok ? '' : ' disabled'}>${c.safe(t.t(confirm ? 'lockpassword_ok_label' : 'lockpassword_continue_label'))}</button></div></div>`;
  }
  // ChooseLockPattern's stages: header, left and right button, the pattern's mode.
  const STAGES = {intro: ['lockpattern_recording_intro_header', 'cancel', 'continue-off'], short: ['lockpattern_recording_incorrect_too_short', 'retry', 'continue-off'],
    first: ['lockpattern_pattern_entered_header', 'retry', 'continue'], confirm: ['lockpattern_need_to_confirm', 'cancel', 'confirm-off'],
    wrong: ['lockpattern_need_to_unlock_wrong', 'cancel', 'confirm-off'], confirmed: ['lockpattern_pattern_confirmed_header', 'cancel', 'confirm']};
  function patternView(c) {
    const t = T(), s = st(c), [head, left, right] = STAGES[s.stage];
    const header = s.drawing ? t.t('lockpattern_recording_inprogress') : s.stage === 'short' ? t.fmt(head, null, 4) : t.t(head);
    const lbl = {cancel: 'lockpattern_tutorial_cancel_label', retry: 'lockpattern_retry_button_text', continue: 'lockpattern_continue_button_text', confirm: 'lockpattern_confirm_button_text'};
    const r = right.replace('-off', '');
    return `<div class="mmsc-choose pattern"><div class="mmsc-header">${c.safe(header)}</div><i class="mmsc-rule"></i>
      <div class="mmsc-patwrap">${MM.pattern.markup('mmsc-pattern')}</div>
      <div class="mmsc-buttons"><button type="button" class="mmsc-button" data-action="mmsc-left" data-mode="${left}">${c.safe(t.t(lbl[left]))}</button><button type="button" class="mmsc-button" data-action="mmsc-right" data-mode="${r}"${right.endsWith('-off') ? ' disabled' : ''}>${c.safe(t.t(lbl[r]))}</button></div></div>`;
  }
  function finish(c, type, secret) {
    setLock(c, type, secret); c.ui.chooseLock = null;
    MM.settingsGo(c, 'lock-redaction', T().t('lock_screen_notifications_interstitial_title'));
  }
  MM.settingsScreens['lock-choose'] = {
    render: (c, cur) => cur.screen.endsWith(':pattern') ? patternView(c) : passwordView(c, cur.screen.split(':')[1]),
    mount(c, root, cur) {
      const type = cur.screen.split(':')[1], s = st(c);
      if (type !== 'pattern') {
        const input = root.querySelector('.mmsc-entry');
        input.addEventListener('input', () => { s.text = input.value; s.wrong = false; const pos = input.value.length; c.render(); const i = c.el.viewport.querySelector('.mmsc-entry'); i?.focus(); i?.setSelectionRange(pos, pos); });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); c.el.viewport.querySelector('[data-action="mmsc-next"]:not([disabled])')?.click(); } });
        setTimeout(() => input.focus(), 30);
        return;
      }
      const view = root.querySelector('.mmsc-pattern');
      MM.pattern.init(view);
      if (s.shown) MM.pattern.show(view, s.shown, s.mode);
      const enabled = () => ['intro', 'short', 'confirm', 'wrong'].includes(s.stage);
      MM.pattern.bind(view, {enabled,
        onStart: () => { s.drawing = true; s.shown = null; root.querySelector('.mmsc-header').textContent = T().t('lockpattern_recording_inprogress'); },
        onDone: cells => {
          s.drawing = false;
          if (s.stage === 'intro' || s.stage === 'short') {
            if (cells.length < 4) { s.stage = 'short'; s.shown = cells; s.mode = 'wrong'; }
            else { s.stage = 'first'; s.first = cells.join(''); s.shown = cells; s.mode = 'correct'; }
          } else {
            if (cells.join('') === s.first) { s.stage = 'confirmed'; s.shown = cells; s.mode = 'correct'; }
            else { s.stage = 'wrong'; s.shown = cells; s.mode = 'wrong'; }
          }
          c.render();
        }});
    },
    action(c, name, el, cur) {
      const type = cur.screen.split(':')[1], s = st(c);
      if (name === 'mmsc-cancel' || (name === 'mmsc-left' && el.dataset.mode === 'cancel')) { c.ui.chooseLock = null; done(c); return true; }
      if (name === 'mmsc-left') { s.stage = 'intro'; s.shown = null; s.first = null; c.render(); return true; }
      if (name === 'mmsc-right') {
        if (el.dataset.mode === 'continue') { s.stage = 'confirm'; s.shown = null; c.render(); }
        else finish(c, 'pattern', s.first);
        return true;
      }
      if (name === 'mmsc-next') {
        if (s.first == null) { s.first = s.text; s.text = ''; c.render(); }
        else if (s.text === s.first) finish(c, type, s.first);
        else { s.text = ''; s.first = null; s.wrong = true; c.render(); }
        return true;
      }
      return false;
    },
    back(c) { c.ui.chooseLock = null; return false; }
  };

  // -- ConfirmLockPassword / ConfirmLockPattern ----------------------------------------------------------------------
  MM.settingsScreens['lock-confirm'] = {
    title: () => T().t('unlock_set_unlock_launch_picker_title'),
    render(c) {
      const t = T(), l = lock(c), type = l.type, err = c.ui.confirmError || '';
      const head = `<div class="mmsc-cheader">${c.safe(t.t(`lockpassword_confirm_your_${type}_header`))}</div><div class="mmsc-details">${c.safe(t.t(`lockpassword_confirm_your_${type}_generic`))}</div>
        <button type="button" class="mmsc-cancel" data-action="mmsc-ccancel">${c.safe(t.t('cancel'))}</button>`;
      if (type === 'pattern') return `<div class="mmsc-confirm pattern">${head}<div class="mmsc-cpat">${MM.pattern.markup(lock(c).visible === false ? 'mmsc-pattern stealth' : 'mmsc-pattern')}</div><div class="mmsc-error">${c.safe(err)}</div></div>`;
      return `<div class="mmsc-confirm">${head}<i class="mmsc-fill"></i><input class="mmsc-centry" type="password" ${type === 'pin' ? 'inputmode="numeric"' : ''} autocomplete="off"><div class="mmsc-error">${c.safe(err)}</div></div>`;
    },
    mount(c, root, cur) {
      const t = T(), l = lock(c), next = () => { c.ui.confirmError = ''; const st2 = c.ui.settings.stack; st2.pop(); if (MM.fingerprint?.pending(c)) { MM.fingerprint.continueFlow(c); return; } MM.settingsGo(c, 'xml:security_settings_picker', t.t('lock_settings_picker_title')); };
      if (l.type === 'pattern') {
        const view = root.querySelector('.mmsc-pattern'); MM.pattern.init(view);
        MM.pattern.bind(view, {onDone: cells => {
          if (cells.join('') === l.secret) { MM.pattern.show(view, cells, 'correct'); next(); }
          else { MM.pattern.show(view, cells, 'wrong'); root.querySelector('.mmsc-error').textContent = t.t('lockpattern_need_to_unlock_wrong'); setTimeout(() => MM.pattern.clear(view), 2000); }
        }});
        return;
      }
      const input = root.querySelector('.mmsc-centry');
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (input.value === l.secret) next();
        else { input.value = ''; root.querySelector('.mmsc-error').textContent = t.t(l.type === 'pin' ? 'lockpassword_invalid_pin' : 'lockpassword_invalid_password'); }
      });
      setTimeout(() => input.focus(), 30);
    },
    action(c, name) { if (name === 'mmsc-ccancel') { c.ui.confirmError = ''; c.ui.fpFlow = ''; c.ui.settings.stack.pop(); c.render(); return true; } return false; }
  };

  // -- RedactionInterstitial -----------------------------------------------------------------------------------------
  MM.settingsScreens['lock-redaction'] = {
    title: () => T().t('lock_screen_notifications_interstitial_title'),
    render(c) {
      const t = T(), cur = c.ui.redaction ?? 'hide';
      const radio = (v, label) => `<button type="button" class="mmsc-radio" data-action="mmsc-redact" data-v="${v}"><i class="mmw-radio${cur === v ? ' on' : ''}"></i><span>${c.safe(t.t(label))}</span></button>`;
      return `<div class="mmsc-inter redaction"><p class="mmsc-medium">${c.safe(t.t('lock_screen_notifications_interstitial_message'))}</p>
        <div class="mmsc-radios">${radio('show', 'lock_screen_notifications_summary_show')}${radio('hide', 'lock_screen_notifications_summary_hide')}${radio('none', 'lock_screen_notifications_summary_disable')}</div></div>`;
    },
    action(c, name, el) {
      if (name !== 'mmsc-redact') return false;
      c.ui.redaction = el.dataset.v; S(c).lockRedaction = el.dataset.v; S(c).lockNotifications = el.dataset.v !== 'none'; c.save(); c.render();
      return true;
    },
    back(c) { c.ui.redaction = null; done(c); return true; }
  };

  /* TrustAgentSettings.updateAgents: the dummy row of trust_agent_settings.xml gives way to a SwitchPreference per
     trust agent the image installs, Google Play services' Smart Lock (Google), on until switched off. */
  X().trust_agent_settings.c = [{t: 'SwitchPreference', key: 'smartlock_agent'}];
  H.trust_agent_settings = {
    // The row is the agent service's label (GoogleTrustAgent: auth_personal_unlocking_service_name).
    title: (c, key) => key === 'smartlock_agent' ? T().t('PrebuiltGmsCore/auth_personal_unlocking_service_name') : undefined,
    get: (c, key) => key === 'smartlock_agent' ? S(c).trustAgentOff !== true : undefined,
    set(c, key, v) { if (key !== 'smartlock_agent') return false; S(c).trustAgentOff = !v; return true; }
  };

  /* Apps with usage access (ManageApplications, LIST_TYPE_USAGE_ACCESS): AppStateUsageBridge's packages that request
     PACKAGE_USAGE_STATS, without "android" and Settings itself (shouldIgnorePackage): on the 5X Google Play services and
     Google Play Store, both granted it as privileged apps, so On (switch_on_text). A row opens UsageAccessDetails
     (app_ops_permissions_details.xml): the app's header, Permit usage access, the description; App usage preferences
     goes (neither app has a USAGE_ACCESS_CONFIG activity). */
  const USAGE = ['com.google.android.gms', 'com.android.vending'];
  const pkgOf = pkg => (MM.systemPackages || []).filter(p => p.pkg === pkg).find(p => p.label.en !== pkg) || {pkg, label: {en: pkg}, icon: 'assets/fw-sym_def_app_icon.png'};
  const pkgLabel = (c, pkg) => { const p = pkgOf(pkg); return p.label[c.lang] || p.label.en; };
  const usageOn = (c, pkg) => !(S(c).usageOff || []).includes(pkg);
  MM.settingsScreens['usage-access'] = {
    title: () => T().t('usage_access_title'),
    render(c) {
      const t = T(), col = new Intl.Collator(c.locale());
      return `<div class="mmst-list">${[...USAGE].sort((a, b) => col.compare(pkgLabel(c, a), pkgLabel(c, b))).map(pkg => `<button type="button" class="mmap-row" data-action="mmsc-usage" data-app="${pkg}"><img src="${pkgOf(pkg).icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(pkgLabel(c, pkg))}</span></span><span class="mmap-sub">${c.safe(t.t(usageOn(c, pkg) ? 'switch_on_text' : 'switch_off_text'))}</span></span></button>`).join('')}</div>`;
    },
    action(c, name, el) {
      if (name !== 'mmsc-usage') return false;
      c.ui.usagePkg = el.dataset.app; MM.settingsGo(c, 'xml:app_ops_permissions_details', T().t('usage_access')); return true;
    }
  };
  H.app_ops_permissions_details = {
    hidden: ['app_ops_settings_preference'],
    top: c => `<div class="mmai-head"><div class="mmap-row static"><img src="${pkgOf(c.ui.usagePkg).icon}" alt=""><span class="mmap-texts"><span class="mmap-line"><span class="mmap-label">${c.safe(pkgLabel(c, c.ui.usagePkg))}</span></span></span></div></div>`,
    title: (c, key) => key === 'app_ops_settings_switch' ? T().t('permit_usage_access') : undefined,
    summary: (c, key) => key === 'app_ops_settings_description' ? T().t('usage_access_description') : undefined,
    selectable: (c, key) => key !== 'app_ops_settings_description',
    get: (c, key) => key === 'app_ops_settings_switch' ? usageOn(c, c.ui.usagePkg) : undefined,
    set(c, key, v) {
      if (key !== 'app_ops_settings_switch') return false;
      const off = new Set(S(c).usageOff || []); v ? off.delete(c.ui.usagePkg) : off.add(c.ui.usagePkg); S(c).usageOff = [...off]; return true;
    }
  };
})();
