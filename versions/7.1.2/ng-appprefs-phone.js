/* Android 7.1.2 Phone settings (ng-appprefs.js hooks): Google Dialer 8.0's GoogleDialerSettingsActivity, TeleService's
   call settings and Telecom's quick responses and blocked numbers, on the 6P's one SIM with no IMS:
   - DialerSettingsActivity.onBuildHeaders (no preference-headers file): Display options (contact sort and display
     order are user changeable), Sounds and vibration, Quick responses (Telecom's RespondViaSmsSettings), Calls (a system
     user with one SIM: TeleService's CallFeaturesSetting, not Calling accounts), Call blocking (the system user may
     open it: Telecom's BlockedNumbersActivity), Accessibility (Telecom's tty_enabled and TeleService's hac_enabled are
     true: TeleService's accessibility settings); GoogleDialerSettingsActivity adds Nearby places and About Phone.
     Every screen has the Dialer's action bar (#2a56c6, the status bar #1c3aa9).
   - Display options: SortOrderPreference / DisplayOrderPreference (ContactsPreferences, shared with Contacts).
   - Sounds and vibration: the phone ringtone (the system's, as Settings › Sound), Also vibrate for calls and Keypad
     tones (Settings.System VIBRATE_WHEN_RINGING and DTMF_TONE_WHEN_DIALING, shared with Settings), Keypad tone length.
   - Nearby places: the switch; the personalization rows need a signed-in account's opt-in and the location permission
     row only shows while it is denied.
   - About Phone: the build version is Dialer's versionName.
   - Calls: CallFeaturesSetting drops Calling accounts (one account), Wi-Fi calling and video calling (no carrier
     support), Auto-retry and the CDMA settings (GSM phone); the voicemail settings drop Visual Voicemail and Change PIN
     (no visual voicemail carrier); call forwarding rows read "Disabled".
   - Blocked numbers (blocked_numbers.xml layouts of Telecom): the message, ADD A NUMBER in the theme colour, the list
     with ic_close_grey_24dp to unblock; the add dialog (add_blocked_number_dialog) and the unblock dialog. The same
     list the Phone app's Block number writes (data.blockedNumbers). */
(() => {
  'use strict';
  const H = NG.appPrefsHooks, P = () => NG.text('appprefs');
  const D = 'GoogleDialer/', TS = 'TeleService/', TC = 'Telecom/';
  const BLUE = ['#2a56c6', '#1c3aa9'];
  const S = c => c.data.settings;
  const set = (c, id, key, v) => { NG.setAppPref(c, id, key, v); c.render(); };

  // ContactsPreferences: Sort by First name / Last name, Name format First name first / Last name first.
  const order = (id, A, color = BLUE[0]) => ({
    get(c, key) { if (key === 'sortOrder' || key === 'displayOrder') return NG.appPref(c, 'contacts', key, '1'); },
    summary(c, key) {
      const t = P();
      if (key === 'sortOrder') return t.t(A + (NG.appPref(c, 'contacts', key, '1') === '1' ? 'display_options_sort_by_given_name' : 'display_options_sort_by_family_name'));
      if (key === 'displayOrder') return t.t(A + (NG.appPref(c, 'contacts', key, '1') === '1' ? 'display_options_view_given_name_first' : 'display_options_view_family_name_first'));
    },
    click(c, key, n) {
      if (key !== 'sortOrder' && key !== 'displayOrder') return false;
      const t = P(), keys = (key === 'sortOrder' ? ['display_options_sort_by_given_name', 'display_options_sort_by_family_name'] : ['display_options_view_given_name_first', 'display_options_view_family_name_first']).map(k => A + k);
      NG.appPrefsChoose(c, NG.appPrefStr(n.title), keys.map(k => t.t(k)), +NG.appPref(c, 'contacts', key, '1') - 1, (c, i) => set(c, 'contacts', key, String(i + 1)), color);
      return true;
    }
  });
  NG.appPrefsOrder = order;
  NG.contactsOrder = c => ({sort: NG.appPref(c, 'contacts', 'sortOrder', '1'), display: NG.appPref(c, 'contacts', 'displayOrder', '1')});

  if (NG.appPrefsXml?.dialer) NG.appPrefsXml.dialer.xml.dialer_settings = {t: 'PreferenceScreen', c: [
    {t: 'header', key: 'display', title: `string/${D}display_options_title`, fragment: 'display_options_settings'},
    {t: 'header', key: 'sounds', title: `string/${D}sounds_and_vibration_title`, fragment: 'sound_settings'},
    {t: 'header', key: 'quick', title: `string/${D}respond_via_sms_setting_title`},
    {t: 'header', key: 'calls', title: `string/${D}call_settings_label`},
    {t: 'header', key: 'blocking', title: `string/${D}manage_blocked_numbers_label`},
    {t: 'header', key: 'a11y', title: `string/${D}accessibility_settings_title`},
    {t: 'header', key: 'nearby', title: `string/${D}local_search_setting_title`, fragment: 'nearby_places_settings'},
    {t: 'header', key: 'about', title: `string/${D}about_phone_label`, fragment: 'about_phone_fragment'}]};

  const dialerOrder = order('dialer', D);
  H.dialer = {...dialerOrder, color: BLUE, accent: BLUE[0],
    screenTitle: (c, xml) => xml === 'dialer_settings' ? P().t(D + 'dialer_settings_label') : '',
    fragment: (c, name) => name,
    hidden: ['personalization_google_account', 'location_permission_key', 'instruction_text_key', 'use_personalization'],
    summary(c, key) {
      if (key === 'button_ringtone_key') { const s = S(c).tones?.ringtone ?? NG.settingsRingtones.ringtone.default; return s || NG.text('settings').t('framework/ringtone_silent'); }
      if (key === 'build_version') return NG.appsData?.phone?.version || '';
      return dialerOrder.summary(c, key);
    },
    get(c, key) {
      if (key === 'button_vibrate_on_ring') return !!S(c).vibrateWhenRinging;
      if (key === 'button_play_dtmf_tone') return (S(c).otherSounds || {}).dial_pad_tones ?? true;
      return dialerOrder.get(c, key);
    },
    set(c, key, v) {
      if (key === 'button_vibrate_on_ring') { S(c).vibrateWhenRinging = v; return true; }
      if (key === 'button_play_dtmf_tone') { S(c).otherSounds = {...(S(c).otherSounds || {}), dial_pad_tones: v}; return true; }
      return false;
    },
    click(c, key, n) {
      if (key === 'quick') { NG.openPrefs(c, 'quickresponses', 'respond_via_sms_settings'); return true; }
      if (key === 'calls') { NG.openPrefs(c, 'calls', 'call_feature_setting'); return true; }
      if (key === 'a11y') { NG.openPrefs(c, 'calls', 'accessibility_settings'); return true; }
      if (key === 'blocking') { NG.openPrefs(c, 'quickresponses', 'blocked', P().t(TC + 'blocked_numbers')); return true; }
      if (key === 'location_settings_key') { c.open('settings', 'xml:location_settings'); return true; }
      if (key === 'open_source_licenses' || key === 'privacy_policy' || key === 'terms_of_service') return true;
      if (key === 'button_ringtone_key') {
        NG.ringtonePicker(c, {kind: 'ringtone', current: S(c).tones?.ringtone ?? NG.settingsRingtones.ringtone.default, onPick: (c, v) => { S(c).tones = {...(S(c).tones || {}), ringtone: v}; c.save(); c.render(); }});
        return true;
      }
      return dialerOrder.click(c, key, n);
    }
  };

  // TeleService's call settings for a GSM phone with one SIM and no IMS.
  H.calls = {
    color: BLUE, accent: BLUE[0], window: '#f5f5f5',
    hidden: ['button_cdma_more_expand_key', 'button_wifi_calling_settings_key', 'button_enable_video_calling', 'phone_account_settings_preference_screen', 'button_auto_retry_key', 'voicemail_visual_voicemail_key', 'voicemail_change_pin_key', 'fdn_list_pref_screen_key'],
    screens: {button_voicemail_category_key: 'voicemail_settings', button_fdn_key: 'fdn_setting', button_gsm_more_expand_key: 'gsm_umts_call_options', call_forwarding_key: 'callforward_options', additional_gsm_call_settings_key: 'gsm_umts_additional_options'},
    summary(c, key) {
      const m = /^button_(cfu|cfb|cfnry|cfnrc)_key$/.exec(key); if (m) return P().t(`${TS}sum_${m[1]}_disabled`);
      if (key === 'button_fdn_enable_key') return P().t(TS + 'fdn_disabled');
      if (key === 'button_voicemail_provider_key') return NG.text('shade').t('carrier') || '';
    },
    get(c, key) { if (key === 'button_cw_key') return NG.appPref(c, 'calls', key, true); }
  };

  // Telecom: quick responses, and BlockedNumbersActivity drawn from its layouts.
  const blocked = c => c.data.blockedNumbers || (c.data.blockedNumbers = []);
  const fmt = n => NG.people?.format(n) || n;
  H.quickresponses = {color: BLUE, accent: BLUE[0],
    customs: {blocked: {
      render(c) {
        const t = P(), list = blocked(c);
        return `<div class="ngap-blocked"><p>${c.safe(t.t(TC + 'blocked_numbers_msg'))}</p><button type="button" class="ngap-addblock" data-action="ngap-addblock">${c.safe(t.t(TC + 'block_number'))}</button>
          ${list.map((n, i) => `<div class="ngap-bnum"><span>${c.safe(fmt(n))}</span><button type="button" data-action="ngap-unblock" data-i="${i}" aria-label="${c.safe(t.t(TC + 'delete_icon_description'))}"><img src="assets/tl-ic_close_grey_24dp.png" alt=""></button></div>`).join('')}</div>`;
      },
      action(c, name, el) {
        const t = P(), fw = NG.text('settings');
        if (name === 'ngap-unblock') {
          const n = blocked(c)[+el.dataset.i]; if (n === undefined) return true;
          c.dialog({message: t.fmt(TC + 'unblock_dialog_body', null, fmt(n)), buttons: [{label: fw.t('framework/cancel')}, {label: t.t(TC + 'unblock_button'), action: c => {
            c.data.blockedNumbers = blocked(c).filter(x => x !== n); c.save(); c.render(); NG.snackbar?.(c, t.fmt(TC + 'blocked_numbers_number_unblocked_message', null, fmt(n)));
          }}]});
          return true;
        }
        if (name === 'ngap-addblock') {
          let v = '';
          c.dialog({html: `<div class="ngap-adddlg"><p>${c.safe(t.t(TC + 'add_blocked_dialog_body'))}</p><input type="tel" class="ngst-input" placeholder="${c.safe(t.t(TC + 'add_blocked_number_hint'))}" style="border-color:${BLUE[0]}"></div>`,
            mount: (c, win) => { const f = win.querySelector('input'); f.addEventListener('input', () => { v = f.value; }); setTimeout(() => f.focus(), 50); },
            buttons: [{label: fw.t('framework/cancel')}, {label: t.t(TC + 'block_button'), action: c => {
              const n = v.trim(); if (!n) return;
              if (blocked(c).some(x => NG.people?.same(x, n) ?? x === n)) { NG.snackbar?.(c, t.fmt(TC + 'blocked_numbers_number_already_blocked_message', null, fmt(n))); return; }
              blocked(c).push(n); c.save(); c.render(); NG.snackbar?.(c, t.fmt(TC + 'blocked_numbers_number_blocked_message', null, fmt(n)));
            }}]});
          return true;
        }
        return false;
      }
    }}
  };
})();
