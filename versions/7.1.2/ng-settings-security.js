/* Android 7.1.2 Settings: Security and the screen lock (SettingsGoogle.apk N2G48C). The logic is 6.0.1's (its
   Security hooks); N2G48C's classes and layouts decide the rest:
   - SecuritySettings.createPreferenceHierarchy: security_settings.xml, then the lock's own xml by the stored quality
     (getResIdForLockUnlockScreen: none security_settings_lockscreen, swipe security_settings_chooser, PIN / password /
     pattern theirs), each a "Screen lock" GearPreference (preference_widget_settings: ic_settings, 8 dp padding) whose
     gear opens SecuritySubSettings (security_settings_<lock>_sub: Make pattern visible, Automatically lock, Power button
     instantly locks, Lock screen message; with swipe only the message); maybeAddFingerprintPreference adds Nexus
     Imprint (FingerprintSettings.getFingerprintPreferenceForUser), the trust agents GMS Core's Smart Lock (disabled with
     "To use, first set a screen lock" without a secure lock); security_settings_encrypted (the 6P ships encrypted),
     security_settings_misc: SIM card lock (a SIM is in), Make passwords visible, Device administrators, Unknown sources
     (install_all_warning first), Credential storage (Hardware-backed; Clear credentials only with user certificates),
     Trust agents, Screen pinning (Off), Apps with usage access.
   - ChooseLockGeneric (security_settings_picker.xml): None, Swipe, Pattern, PIN, Password, the current one "Current screen
     lock"; for Nexus Imprint the header choose_lock_generic_fingerprint_header and "Nexus Imprint + Pattern / PIN /
     Password" (updatePreferenceText). A secure lock is confirmed first (ConfirmLockPassword / ConfirmLockPattern in
     Theme.ConfirmDeviceCredentials: confirm_lock_password_base, the Headline header in colorAccent 16 dp in, the Body1
     details 12 dp under it, the borderless Cancel, the 208 dp entry, the error text), and leaving it for None or Swipe
     asks "Remove device protection?".
   - A new secure lock on the encrypted 6P: EncryptionInterstitial (GlifPreferenceLayout "Secure start-up": the message
     and Require … to start device / No thanks), then ChooseLockPassword (choose_lock_password.xml in GlifLayout: the
     ic_lock icon and "Choose your PIN" / "Choose your password", the 24 sp entry, PasswordRequirementAdapter's list of
     what is still missing — at least 4, at most 16 characters, a PIN digits only, a password a letter — then
     Cancel / Continue; Confirm your …, "… don't match") or ChooseLockPattern (choose_lock_pattern_common: the 18 sp
     header, the LockPatternView, Cancel / Retry and Next / Confirm), then RedactionInterstitial (Notifications: Show all
     / Hide sensitive / Don't show, Done).
   - The GLIF pages: SetupWizardTheme.Light (SuwThemeGlif.Light): no action bar, the window #fafafa, the status bar over
     GlifPatternDrawable in android:colorPrimary #3367d6 at 204 / 255 alpha, the accent suw_color_accent_glif_light
     #4285f4; suw_glif_header: the 32 dp icon 48 dp down and 24 dp in, the 24 sp title 15 dp under it; SuwContentFrame
     24 dp at the sides. */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const H = NG.settingsHooks;
  const S = c => c.data.settings;
  const lock = c => S(c).lock || (S(c).lock = {type: 'swipe'});
  const secure = c => ['pin', 'password', 'pattern'].includes(lock(c).type);
  const X = () => NG.settingsXml;
  const radio = (c, label, on) => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${on ? ' on' : ''}"></i><span>${c.safe(label)}</span></span>`});
  let core = null;
  NG.register('settings-security', {app: false, init(c) { core = c; }, render: () => ''});
  NG.settingsFragments['com.android.settings.SecuritySettings'] = 'xml:security';

  // The composed hierarchy, rebuilt from the current lock each time it is read.
  const LOCK_XML = {none: 'security_settings_lockscreen', swipe: 'security_settings_chooser', pin: 'security_settings_pin', password: 'security_settings_password', pattern: 'security_settings_pattern'};
  function composed() {
    const c = core, type = c ? lock(c).type : 'swipe';
    const cat = JSON.parse(JSON.stringify(X()[LOCK_XML[type]].c[0]));
    cat.c.push({t: 'Preference', key: 'fingerprint_settings', title: 'string/security_settings_fingerprint_preference_title'});
    cat.c.push({t: 'Preference', key: 'trust_agent', title: 'PrebuiltGmsCore/auth_google_trust_agent_title'});
    return {t: 'PreferenceScreen', title: 'string/security_settings_title', c: [cat, ...X().security_settings_encrypted.c, ...X().security_settings_misc.c]};
  }
  Object.defineProperty(NG.settingsXml, 'security', {get: composed, configurable: true});
  const SUB = {swipe: 'security_settings_slide_sub', pin: 'security_settings_pin_sub', password: 'security_settings_password_sub', pattern: 'security_settings_pattern_sub'};

  const trustTitle = () => T().t('PrebuiltGmsCore/auth_google_trust_agent_title');
  const gear = c => `<button type="button" class="ngst-gear" data-action="ngsc-gear" aria-label="${c.safe(T().t('settings_button'))}"><i></i></button>`;
  H.security = {
    hidden: ['crypt_keeper_encrypt_title_x'],
    widget: (c, key) => key === 'unlock_set_or_change' && lock(c).type !== 'none' ? gear(c) : undefined,
    get(c, key) {
      const s = S(c);
      if (key === 'show_password') return s.showPassword ?? true;
      if (key === 'toggle_install_applications') return !!s.unknownSources;
      return undefined;
    },
    set(c, key, v) {
      const s = S(c);
      if (key === 'show_password') { s.showPassword = v; return true; }
      if (key === 'toggle_install_applications') { s.unknownSources = v; return true; }
      return false;
    },
    // Clear credentials only with user certificates installed (KeyStore.isEmpty()); the simulator has none.
    disabled: (c, key) => key === 'credentials_reset' || (key === 'trust_agent' && !secure(c)),
    selectable: (c, key) => key !== 'crypt_keeper_encrypt_title',
    summary(c, key) {
      const t = T();
      if (key === 'trust_agent') return secure(c) ? '' : t.t('disabled_because_no_backup_security');
      if (key === 'fingerprint_settings') { const n = NG.fingerprint?.count(c) || 0; return n ? t.plural('security_settings_fingerprint_preference_summary', n) : t.t('security_settings_fingerprint_preference_summary_none'); }
      if (key === 'manage_trust_agents' && !secure(c)) return t.t('disabled_because_no_backup_security');
      if (key === 'credential_storage_type') return t.t('credential_storage_type_hardware');
      if (key === 'screen_pinning_settings') return t.t(S(c).screenPinning ? 'switch_on_text' : 'switch_off_text');
      return undefined;
    },
    title: (c, key) => key === 'trust_agent' ? trustTitle() : undefined,
    action(c, name) {
      if (name !== 'ngsc-gear') return false;
      const xml = SUB[lock(c).type];
      if (xml) NG.settingsGo(c, `xml:${xml}`, T().t('settings_label'));
      return true;
    },
    click(c, key) {
      const t = T(), s = S(c);
      if (key === 'unlock_set_or_change') {
        if (secure(c)) NG.settingsGo(c, 'lock-confirm:picker', t.t('unlock_set_unlock_launch_picker_title'));
        else NG.settingsGo(c, 'xml:security_settings_picker', t.t('lock_settings_picker_title'));
        return true;
      }
      if (key === 'fingerprint_settings') { NG.fingerprint ? NG.fingerprint.open(c) : NG.settingsGo(c, 'missing:FingerprintSettings', t.t('security_settings_fingerprint_preference_title')); return true; }
      if (key === 'credentials_install') { c.toast(t.t('CertInstaller/no_cert_file_found')); return true; }
      if (key === 'trust_agent') { NG.settingsGo(c, 'missing:com.google.android.gms.auth.trustagent.GoogleTrustAgentPersonalUnlockingSettings', trustTitle()); return true; }
      if (key === 'sim_lock_settings') { NG.settingsGo(c, 'xml:sim_lock_settings', t.t('sim_lock_settings')); return true; }
      if (key === 'crypt_keeper_encrypt_title') return true;
      if (key === 'toggle_install_applications' && !s.unknownSources) {
        c.dialog({message: t.t('install_all_warning'), buttons: [{label: t.t('no')}, {label: t.t('yes'), action: c => { s.unknownSources = true; c.save(); c.render(); }}]});
        return true;
      }
      return false;
    }
  };

  // SecuritySubSettings: the lock's own settings behind the gear.
  const subHook = {
    get(c, key) {
      const l = lock(c);
      if (key === 'lock_after_timeout') return String(l.lockAfter ?? 5000);
      if (key === 'power_button_instantly_locks') return l.powerLocks ?? true;
      if (key === 'visiblepattern') return l.visible ?? true;
      return undefined;
    },
    set(c, key, v) {
      const l = lock(c);
      if (key === 'lock_after_timeout') { l.lockAfter = +v; return true; }
      if (key === 'power_button_instantly_locks') { l.powerLocks = v; return true; }
      if (key === 'visiblepattern') { l.visible = v; return true; }
      return false;
    },
    summary(c, key, n) {
      const t = T(), l = lock(c);
      if (key === 'owner_info_settings') return l.ownerInfo || t.t('owner_info_settings_summary');
      if (key === 'power_button_instantly_locks') return t.fmt('lockpattern_settings_power_button_instantly_locks_summary', null, trustTitle());
      if (key === 'lock_after_timeout') {
        const values = n.entryValues, entries = NG.settingsArr(n.entries), cur = l.lockAfter ?? 5000;
        let i = 0; values.forEach((v, j) => { if (cur >= +v) i = j; });
        return +values[i] === 0 ? t.fmt('lock_immediately_summary_with_exception', null, trustTitle()) : t.fmt('lock_after_timeout_summary_with_exception', null, entries[i], trustTitle());
      }
      return undefined;
    },
    click(c, key) {
      if (key !== 'owner_info_settings') return false;
      const t = T(), l = lock(c);
      let value = l.ownerInfo || '';
      c.dialog({title: t.t('owner_info_settings_title'), html: `<div class="ngst-edit"><input type="text" class="ngst-input ngsc-owner" value="${c.safe(value)}" placeholder="${c.safe(t.t('owner_info_settings_edit_text_hint'))}" spellcheck="false"></div>`,
        buttons: [{label: t.t('cancel')}, {label: t.t('save'), action: c => { l.ownerInfo = value.trim(); c.save(); c.render(); }}],
        mount(c, win) { const i = win.querySelector('.ngsc-owner'); i.addEventListener('input', () => { value = i.value; }); setTimeout(() => i.focus(), 50); }});
      return true;
    }
  };
  for (const xml of Object.values(SUB)) H[xml] = subHook;

  // -- ChooseLockGeneric ---------------------------------------------------------------------------------------------
  const PICK = {unlock_set_off: 'none', unlock_set_none: 'swipe', unlock_set_pattern: 'pattern', unlock_set_pin: 'pin', unlock_set_password: 'password'};
  function setLock(c, type, secret = '') {
    const l = lock(c); l.type = type; l.secret = secret;
    // No secure lock, no fingerprints (ChooseLockGeneric's removeAllFingerprintTemplates).
    if (!secure(c)) NG.fingerprint?.clear(c);
    c.save();
  }
  NG.settingsSetLock = setLock;
  // Back to Security (or wherever the flow began), dropping the lock screens from the stack.
  function done(c) {
    const st = c.ui.settings;
    while (st.stack.length > 1 && /^(xml:security_settings_picker|lock-|xml:security$)/.test(st.stack.at(-1).screen) && st.stack.at(-1).screen !== 'xml:security') st.stack.pop();
    if (c.ui.fpFlow === 'onboard') { if (secure(c)) { NG.fingerprint.continueFlow(c); return; } c.ui.fpFlow = ''; }
    c.render();
  }
  const forFp = c => c.ui.fpFlow === 'onboard';
  H.security_settings_picker = {
    hide: (c, key) => key === 'unlock_set_managed' || key === 'unlock_skip_fingerprint' || (forFp(c) && (key === 'unlock_set_off' || key === 'unlock_set_none')),
    top: c => forFp(c) ? `<div class="ngsc-fphead">${c.safe(T().t('lock_settings_picker_fingerprint_message'))}</div>` : '',
    title: (c, key) => forFp(c) && ['unlock_set_pattern', 'unlock_set_pin', 'unlock_set_password'].includes(key) ? T().t(`fingerprint_unlock_set_unlock_${key.split('_').pop()}`) : undefined,
    summary: (c, key) => PICK[key] === lock(c).type ? T().t('current_screen_lock') : undefined,
    click(c, key) {
      const t = T(), type = PICK[key];
      if (!type) return false;
      const apply = () => {
        if (type === 'none' || type === 'swipe') { setLock(c, type); done(c); return; }
        NG.settingsGo(c, `lock-encrypt:${type}`, '');
      };
      if (secure(c) && (type === 'none' || type === 'swipe')) {
        const fp = (NG.fingerprint?.count(c) || 0) > 0 ? '_fingerprint' : '';
        c.dialog({title: t.t('unlock_disable_frp_warning_title'), message: t.t(`unlock_disable_frp_warning_content_${lock(c).type}${fp}`),
          buttons: [{label: t.t('cancel')}, {label: t.t('unlock_disable_frp_warning_ok'), action: apply}]});
        return true;
      }
      apply();
      return true;
    }
  };

  // -- GLIF pages ----------------------------------------------------------------------------------------------------
  const glif = (c, title, body, cls = '', after = '') => `<div class="ngsc-glif ${cls}"><div class="ngsc-scroll"><div class="ngsc-ghead"><i class="ngsc-gicon"></i><h1>${c.safe(title)}</h1></div><div class="ngsc-frame${after ? ' tight' : ''}">${body}</div>${after}</div></div>`;
  const GLIF_STATUS = '#5c85de';

  // EncryptionInterstitial: the message, then the two choices as preferences; a choice goes straight on.
  NG.settingsScreens['lock-encrypt'] = {
    full: true, statusColor: () => GLIF_STATUS,
    render(c, cur) {
      const t = T(), type = cur.screen.split(':')[1], fp = forFp(c) ? '_for_fingerprint' : '';
      const items = [{html: NG.settingsRow(c, {title: t.t(`encrypt_require_${type}`), action: 'ngsc-req', data: ' data-v="1"'}), sel: true},
        {html: NG.settingsRow(c, {title: t.t(`encrypt_dont_require_${type}`), action: 'ngsc-req', data: ' data-v="0"'}), sel: true}];
      return glif(c, t.t('encryption_interstitial_header'), `<p class="ngsc-desc">${c.safe(t.t(`encryption_interstitial_message_${type}${fp}`))}</p>`, '', `<div class="ngsc-prefs">${NG.settingsJoinRows(items)}</div>`);
    },
    action(c, name, el, cur) {
      if (name !== 'ngsc-req') return false;
      const type = cur.screen.split(':')[1];
      lock(c).requireAtBoot = el.dataset.v === '1';
      c.ui.chooseLock = null;
      NG.settingsGo(c, `lock-choose:${type}`, '');
      return true;
    }
  };

  // -- ChooseLockPassword / ChooseLockPattern -------------------------------------------------------------------------
  const st = c => c.ui.chooseLock || (c.ui.chooseLock = {first: null, stage: 'intro', text: ''});
  // validatePassword / convertErrorCodeToMessages: what the entry still lacks, in that order.
  function requirements(type, text) {
    const t = T(), out = [];
    if ([...text].some(ch => ch < ' ' || ch > '\x7f')) out.push(t.t('lockpassword_illegal_character'));
    if (type === 'pin' && /[^0-9]/.test(text)) out.push(t.t('lockpassword_pin_contains_non_digits'));
    if (type === 'password' && !/[a-zA-Z]/.test(text)) out.push(t.plural('lockpassword_password_requires_letters', 1));
    if (text.length < 4) out.push(t.fmt(type === 'pin' ? 'lockpassword_pin_too_short' : 'lockpassword_password_too_short', null, 4));
    else if (text.length > 16) out.push(t.fmt(type === 'pin' ? 'lockpassword_pin_too_long' : 'lockpassword_password_too_long', null, 17));
    return out;
  }
  function passwordView(c, type) {
    const t = T(), s = st(c), confirm = s.first != null;
    const title = t.t(`lockpassword_choose_your_${type}_header`);
    const header = s.wrong ? t.t(type === 'pin' ? 'lockpassword_confirm_pins_dont_match' : 'lockpassword_confirm_passwords_dont_match') : confirm ? t.t(`lockpassword_confirm_your_${type}_header`) : '';
    const reqs = confirm || s.wrong ? [] : requirements(type, s.text);
    const ok = confirm || s.wrong ? s.text.length > 0 : reqs.length === 0;
    const next = t.t(confirm ? 'lockpassword_ok_label' : 'lockpassword_continue_label');
    return glif(c, title, `<div class="ngsc-pwheader">${c.safe(header)}</div>
      <input class="ngsc-entry" type="password" ${type === 'pin' ? 'inputmode="numeric"' : ''} autocomplete="off" spellcheck="false" value="${c.safe(s.text)}">
      <div class="ngsc-reqs">${reqs.map(r => `<div class="ngsc-req">${c.safe(r)}</div>`).join('')}</div><i class="ngsc-fill"></i>
      <div class="ngsc-buttons"><button type="button" class="ngsc-neg" data-action="ngsc-cancel">${c.safe(t.t('lockpassword_cancel_label'))}</button><i></i><button type="button" class="ngsc-pos" data-action="ngsc-next"${ok ? '' : ' disabled'}>${c.safe(next)}</button></div>`, 'choose');
  }
  // ChooseLockPattern's stages: header, left and right button.
  const STAGES = {intro: ['lockpattern_recording_intro_header', 'cancel', 'continue-off'], short: ['lockpattern_recording_incorrect_too_short', 'retry', 'continue-off'],
    first: ['lockpattern_pattern_entered_header', 'retry', 'continue'], confirm: ['lockpattern_need_to_confirm', 'cancel', 'confirm-off'],
    wrong: ['lockpattern_need_to_unlock_wrong', 'cancel', 'confirm-off'], confirmed: ['lockpattern_pattern_confirmed_header', 'cancel', 'confirm']};
  function patternView(c) {
    const t = T(), s = st(c), [head, left, right] = STAGES[s.stage];
    const header = s.drawing ? t.t('lockpattern_recording_inprogress') : s.stage === 'short' ? t.fmt(head, null, 4) : t.t(head);
    const lbl = {cancel: 'lockpattern_tutorial_cancel_label', retry: 'lockpattern_retry_button_text', continue: 'lockpattern_tutorial_continue_label', confirm: 'lockpattern_confirm_button_text'};
    const r = right.replace('-off', '');
    return glif(c, t.t('lockpassword_choose_your_pattern_header'), `<div class="ngsc-patheader">${c.safe(header)}</div>
      <div class="ngsc-patwrap">${NG.pattern.markup('ngsc-pattern')}</div>
      <div class="ngsc-buttons"><button type="button" class="ngsc-neg" data-action="ngsc-left" data-mode="${left}">${c.safe(t.t(lbl[left]))}</button><i></i><button type="button" class="ngsc-pos" data-action="ngsc-right" data-mode="${r}"${right.endsWith('-off') ? ' disabled' : ''}>${c.safe(t.t(lbl[r]))}</button></div>`, 'choose pattern');
  }
  function finish(c, type, secret) {
    setLock(c, type, secret); c.ui.chooseLock = null;
    c.ui.redaction = null;
    NG.settingsGo(c, 'lock-redaction', '');
  }
  NG.settingsScreens['lock-choose'] = {
    full: true, statusColor: () => GLIF_STATUS,
    render: (c, cur) => cur.screen.endsWith(':pattern') ? patternView(c) : passwordView(c, cur.screen.split(':')[1]),
    mount(c, root, cur) {
      const type = cur.screen.split(':')[1], s = st(c);
      if (type !== 'pattern') {
        const input = root.querySelector('.ngsc-entry');
        input.addEventListener('input', () => { s.text = input.value; if (s.wrong) { s.wrong = false; } const pos = input.value.length; c.transition('none'); c.render(); const i = c.el.viewport.querySelector('.ngsc-entry'); i?.focus(); i?.setSelectionRange(pos, pos); });
        input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); c.el.viewport.querySelector('[data-action="ngsc-next"]:not([disabled])')?.click(); } });
        setTimeout(() => input.focus(), 30);
        return;
      }
      const view = root.querySelector('.ngsc-pattern');
      NG.pattern.init(view);
      if (s.shown) NG.pattern.show(view, s.shown, s.mode);
      const enabled = () => ['intro', 'short', 'confirm', 'wrong'].includes(s.stage);
      NG.pattern.bind(view, {enabled,
        onStart: () => { s.drawing = true; s.shown = null; root.querySelector('.ngsc-patheader').textContent = T().t('lockpattern_recording_inprogress'); },
        onDone: cells => {
          s.drawing = false;
          if (s.stage === 'intro' || s.stage === 'short') {
            if (cells.length < 4) { s.stage = 'short'; s.shown = cells; s.mode = 'wrong'; }
            else { s.stage = 'first'; s.first = cells.join(''); s.shown = cells; s.mode = 'correct'; }
          } else if (cells.join('') === s.first) { s.stage = 'confirmed'; s.shown = cells; s.mode = 'correct'; }
          else { s.stage = 'wrong'; s.shown = cells; s.mode = 'wrong'; }
          c.transition('none'); c.render();
        }});
    },
    action(c, name, el, cur) {
      const type = cur.screen.split(':')[1], s = st(c);
      if (name === 'ngsc-cancel' || (name === 'ngsc-left' && el.dataset.mode === 'cancel')) { c.ui.chooseLock = null; c.ui.fpFlow = ''; done(c); return true; }
      if (name === 'ngsc-left') { s.stage = 'intro'; s.shown = null; s.first = null; c.transition('none'); c.render(); return true; }
      if (name === 'ngsc-right') {
        if (el.dataset.mode === 'continue') { s.stage = 'confirm'; s.shown = null; c.transition('none'); c.render(); }
        else finish(c, 'pattern', s.first);
        return true;
      }
      if (name === 'ngsc-next') {
        if (s.first == null && !s.wrong) { s.first = s.text; s.text = ''; c.transition('none'); c.render(); }
        else if (s.wrong) { s.wrong = false; s.first = s.text; s.text = ''; c.transition('none'); c.render(); }
        else if (s.text === s.first) finish(c, type, s.first);
        else { s.text = ''; s.first = null; s.wrong = true; c.transition('none'); c.render(); }
        return true;
      }
      return false;
    },
    back(c) { c.ui.chooseLock = null; return false; }
  };

  // -- ConfirmLockPassword / ConfirmLockPattern ----------------------------------------------------------------------
  NG.settingsScreens['lock-confirm'] = {
    title: () => T().t('unlock_set_unlock_launch_picker_title'),
    render(c) {
      const t = T(), l = lock(c), type = l.type, err = c.ui.confirmError || '';
      const head = `<div class="ngsc-cheader">${c.safe(t.t(`lockpassword_confirm_your_${type}_header`))}</div><div class="ngsc-details">${c.safe(t.t(`lockpassword_confirm_your_${type}_generic`))}</div>
        <button type="button" class="ngsc-ccancel" data-action="ngsc-ccancel">${c.safe(t.t('cancel'))}</button>`;
      if (type === 'pattern') return `<div class="ngsc-confirm pattern">${head}<div class="ngsc-cpat">${NG.pattern.markup('ngsc-pattern ngsc-cpattern')}</div><div class="ngsc-error">${c.safe(err)}</div></div>`;
      return `<div class="ngsc-confirm">${head}<i class="ngsc-fill"></i><input class="ngsc-centry" type="password" ${type === 'pin' ? 'inputmode="numeric"' : ''} autocomplete="off"><div class="ngsc-error">${c.safe(err)}</div></div>`;
    },
    mount(c, root) {
      const t = T(), l = lock(c);
      const next = () => {
        c.ui.confirmError = ''; c.ui.settings.stack.pop();
        if (NG.fingerprint?.pending(c)) { NG.fingerprint.continueFlow(c); return; }
        NG.settingsGo(c, 'xml:security_settings_picker', t.t('lock_settings_picker_title'));
      };
      if (l.type === 'pattern') {
        const view = root.querySelector('.ngsc-pattern'); NG.pattern.init(view);
        NG.pattern.bind(view, {onDone: cells => {
          if (cells.join('') === l.secret) { NG.pattern.show(view, cells, 'correct'); next(); }
          else { NG.pattern.show(view, cells, 'wrong'); root.querySelector('.ngsc-error').textContent = t.t('lockpattern_need_to_unlock_wrong'); setTimeout(() => NG.pattern.clear(view), 3000); }
        }});
        return;
      }
      const input = root.querySelector('.ngsc-centry');
      input.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        if (input.value === l.secret) next();
        else { input.value = ''; root.querySelector('.ngsc-error').textContent = t.t(l.type === 'pin' ? 'lockpassword_invalid_pin' : 'lockpassword_invalid_password'); }
      });
      setTimeout(() => input.focus(), 30);
    },
    action(c, name) { if (name === 'ngsc-ccancel') { c.ui.confirmError = ''; c.ui.fpFlow = ''; c.ui.settings.stack.pop(); c.render(); return true; } return false; }
  };

  // -- RedactionInterstitial -----------------------------------------------------------------------------------------
  NG.settingsScreens['lock-redaction'] = {
    full: true, statusColor: () => GLIF_STATUS,
    render(c) {
      const t = T(), cur = c.ui.redaction ?? 'hide';
      const option = (v, label) => `<button type="button" class="ngsc-radio" data-action="ngsc-redact" data-v="${v}"><i class="ngw-radio ngsc-gradio${cur === v ? ' on' : ''}"></i><span>${c.safe(t.t(label))}</span></button>`;
      return glif(c, t.t('lock_screen_notifications_interstitial_title'), `<p class="ngsc-desc">${c.safe(t.t('lock_screen_notifications_interstitial_message'))}</p>
        <div class="ngsc-radios">${option('all', 'lock_screen_notifications_summary_show')}${option('hide', 'lock_screen_notifications_summary_hide')}${option('none', 'lock_screen_notifications_summary_disable')}</div>
        <div class="ngsc-buttons end"><button type="button" class="ngsc-pos" data-action="ngsc-redact-done">${c.safe(t.t('app_notifications_dialog_done'))}</button></div>`);
    },
    action(c, name, el) {
      if (name === 'ngsc-redact') { c.ui.redaction = el.dataset.v; c.transition('none'); c.render(); return true; }
      if (name === 'ngsc-redact-done') { S(c).lockNotifications = c.ui.redaction ?? 'hide'; c.ui.redaction = null; c.save(); done(c); return true; }
      return false;
    },
    back(c) { S(c).lockNotifications = c.ui.redaction ?? 'hide'; c.ui.redaction = null; c.save(); done(c); return true; }
  };
})();
