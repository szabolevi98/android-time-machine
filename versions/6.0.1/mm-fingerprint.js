/* Android 6.0.1 Nexus Imprint: the Nexus 5X's rear fingerprint sensor, Settings' enrollment (com.android.settings.
   fingerprint, Theme.FingerprintEnroll) and FingerprintSettings, and the keyguard's fingerprint unlock.
   - The sensor: the phone's back cannot be seen here, so the sensor is the round control beside the phone (outside
     the screen, like the side keys). Touching it is what the sensor reports: a step of an enrollment, or on the
     keyguard (asleep or not) waking and unlocking as KeyguardUpdateMonitor does with a recognised finger.
   - The enrollment screens are SetupWizardLayout with FingerprintLayoutTheme: the fp_enrollment_header picture at
     the top (Illustration, 2.6 : 1) under the 24 sp white title (suw_header_title_* paddings, 40 dp sides), the
     content in SuwContentFrame (40 dp sides) in Subhead #de000000 with 4 sp extra line spacing, the borderless
     buttons in Settings' accent #009688 at the bottom right.
     FingerprintEnrollIntroduction (Unlock with fingerprint: the message, the warning, Learn more; Cancel /
     Continue) → with no secure lock FingerprintEnrollOnboard (Set up Nexus Imprint: the two steps, Set up screen
     lock → ChooseLockGeneric under lock_settings_picker_fingerprint_message, Pattern / PIN / Password only), with one
     ConfirmLock first → FingerprintEnrollFindSensor (fingerprint_sensor_location with the pulsing dot of
     FingerprintLocationAnimationView at 50.35 % / 29.5 %, Next) → FingerprintEnrollEnrolling (Let’s start! then
     Great! Now repeat, fp_illustration_enrollment in #12000000 that flashes the accent at half alpha for 300 ms on
     each touch, the 192 dp progress ring (4 dp, #20000000 under the accent) moving by getProgress, "Lift finger,
     then touch sensor again" 2.5 s after a touch, IconTouchDialog after three touches on the picture) →
     FingerprintEnrollFinish (Fingerprint added!, fp_app_indicator, Add another (up to five) / Done).
     The number of touches an enrollment needs comes from the sensor's HAL; the simulator asks for six.
   - FingerprintSettings (Nexus Imprint, after confirming the lock): the fingerprints named by fingerprint_name_template
     (rename and delete in fingerprint_rename_dialog's dialog, the last one asking fingerprint_last_delete_*), then
     Add fingerprint. Security's row then sums them up (security_settings_fingerprint_preference_summary).
   - Removing the secure lock removes the fingerprints (ChooseLockGeneric's removeAllFingerprintTemplates). */
(() => {
  'use strict';
  const T = () => MM.text('fingerprint');
  const STEPS = 5, MAX = 5;
  let core = null;
  const S = c => c.data.settings;
  const prints = c => S(c).fingerprints || (S(c).fingerprints = []);
  const secure = c => ['pin', 'password', 'pattern'].includes(S(c).lock?.type);
  const esc = (c, s) => c.safe(s);
  const go = (c, screen) => MM.settingsGo(c, screen, '');
  const stack = c => c.ui.settings.stack;
  // Back to the screen the enrollment started from (FingerprintSettings or Security).
  function leave(c) {
    const st = stack(c);
    while (st.length > 1 && !['fp-settings', 'xml:security'].includes(st.at(-1).screen)) st.pop();
    c.ui.fp = null; c.render();
  }

  function frame(c, title, body) {
    return `<div class="mmfp"><div class="mmfp-head"><i></i><h1>${esc(c, title)}</h1></div><div class="mmfp-body">${body}</div></div>`;
  }
  const btn = (c, action, label) => `<button type="button" class="mmfp-btn" data-action="${action}">${esc(c, label)}</button>`;
  const msg = (c, text, cls = '') => `<p class="mmfp-msg ${cls}">${esc(c, text)}</p>`;

  const screens = {
    'fp-intro': c => { const t = T(); return frame(c, t.t('security_settings_fingerprint_enroll_introduction_title'),
      `${msg(c, t.t('security_settings_fingerprint_enroll_introduction_message'))}${msg(c, t.t('security_settings_fingerprint_enroll_introduction_message_warning'))}<button type="button" class="mmfp-link" data-action="mmfp-learn">${esc(c, t.t('security_settings_fingerprint_enroll_introduction_risk_link_text'))}</button><i class="mmfp-fill"></i>
      <div class="mmfp-btns">${btn(c, 'mmfp-cancel', t.t('security_settings_fingerprint_enroll_introduction_cancel'))}${btn(c, 'mmfp-continue', t.t('security_settings_fingerprint_enroll_introduction_continue'))}</div>`); },
    'fp-onboard': c => { const t = T(), step = k => `<div class="mmfp-step"><i></i><span>${esc(c, t.t(k))}</span></div>`; return frame(c, t.t('security_settings_fingerprint_enroll_onboard_title'),
      `${msg(c, t.t('security_settings_fingerprint_enroll_onboard_message'), 'gap')}${step('security_settings_fingerprint_enroll_onboard_message_1')}${step('security_settings_fingerprint_enroll_onboard_message_2')}<i class="mmfp-fill"></i>
      <div class="mmfp-btns">${btn(c, 'mmfp-setlock', t.t('security_settings_fingerprint_enroll_setup_screen_lock'))}</div>`); },
    'fp-find': c => { const t = T(); return frame(c, t.t('security_settings_fingerprint_enroll_find_sensor_title'),
      `${msg(c, t.t('security_settings_fingerprint_enroll_find_sensor_message'))}<i class="mmfp-fill"></i><div class="mmfp-sensor"><img src="assets/st-fingerprint_sensor_location.png" alt=""><i></i></div><i class="mmfp-fill"></i>
      <div class="mmfp-btns">${btn(c, 'mmfp-next', t.t('fingerprint_enroll_button_next'))}</div>`); },
    'fp-enroll': c => {
      const t = T(), e = c.ui.fp || (c.ui.fp = {steps: -1, remaining: 0, iconTouches: 0});
      const started = e.steps !== -1, progress = started ? Math.max(0, e.steps + 1 - e.remaining) / (e.steps + 1) : 0;
      const r = 90, len = 2 * Math.PI * r;
      return frame(c, t.t(started ? 'security_settings_fingerprint_enroll_repeat_title' : 'security_settings_fingerprint_enroll_start_title'),
        `${msg(c, t.t(started ? 'security_settings_fingerprint_enroll_repeat_message' : 'security_settings_fingerprint_enroll_start_message'))}
        <div class="mmfp-ring"><svg viewBox="0 0 192 192" aria-hidden="true"><circle cx="96" cy="96" r="${r}" class="bg"/><circle cx="96" cy="96" r="${r}" class="fg" stroke-dasharray="${len}" stroke-dashoffset="${(len * (1 - progress)).toFixed(1)}"/></svg><button type="button" class="mmfp-print${e.flash ? ' flash' : ''}" data-action="mmfp-icon" aria-hidden="true"></button></div>
        <div class="mmfp-error">${esc(c, e.error || '')}</div>`);
    },
    'fp-finish': c => { const t = T(); return frame(c, t.t('security_settings_fingerprint_enroll_finish_title'),
      `${msg(c, t.t('security_settings_fingerprint_enroll_finish_message'))}<i class="mmfp-fill"></i><img class="mmfp-indicator" src="assets/st-fp_app_indicator.png" alt=""><i class="mmfp-fill"></i>
      <div class="mmfp-btns">${prints(c).length < MAX ? btn(c, 'mmfp-another', t.t('fingerprint_enroll_button_add')) : ''}${btn(c, 'mmfp-done', t.t('security_settings_fingerprint_enroll_done'))}</div>`); }
  };

  function action(c, name, el) {
    const t = T();
    switch (name) {
      case 'mmfp-cancel': leave(c); return true;
      case 'mmfp-learn': c.open('help', 'settings'); return true;
      case 'mmfp-continue':
        if (secure(c)) { c.ui.fpFlow = 'enroll'; MM.settingsGo(c, 'lock-confirm', ''); }
        else go(c, 'fp-onboard');
        return true;
      case 'mmfp-setlock': c.ui.fpFlow = 'onboard'; MM.settingsGo(c, 'xml:security_settings_picker', MM.text('settings').t('lock_settings_picker_title')); return true;
      case 'mmfp-next': stack(c).pop(); c.ui.fp = null; go(c, 'fp-enroll'); return true;
      case 'mmfp-icon': {
        // Touching the picture instead of the sensor: the third touch brings IconTouchDialog.
        const e = c.ui.fp; if (!e) return true;
        if (++e.iconTouches >= 3) { e.iconTouches = 0; c.dialog({title: t.t('security_settings_fingerprint_enroll_touch_dialog_title'), message: t.t('security_settings_fingerprint_enroll_touch_dialog_message'), buttons: [{label: t.t('security_settings_fingerprint_enroll_dialog_ok')}]}); }
        return true;
      }
      case 'mmfp-another': stack(c).pop(); c.ui.fp = null; go(c, 'fp-enroll'); return true;
      case 'mmfp-done': leave(c); return true;
    }
    return false;
  }

  // A touch of the sensor during an enrollment (FingerprintEnrollSidecar → onEnrollmentProgressChange).
  function enrollTouch(c) {
    const e = c.ui.fp || (c.ui.fp = {steps: -1, remaining: 0, iconTouches: 0});
    if (e.steps === -1) { e.steps = STEPS; e.remaining = STEPS; } else e.remaining = Math.max(0, e.remaining - 1);
    e.error = ''; e.flash = true; clearTimeout(e.again); clearTimeout(e.flashTimer);
    c.render();
    e.flashTimer = setTimeout(() => { e.flash = false; c.el.viewport.querySelector('.mmfp-print')?.classList.remove('flash'); }, 300);
    if (e.remaining === 0) {
      const n = prints(c).length + 1;
      prints(c).push({id: Date.now(), name: AndroidStrings.format(T().t('framework/fingerprint_name_template'), n)});
      c.save();
      setTimeout(() => { if (stack(c).at(-1)?.screen !== 'fp-enroll') return; stack(c).pop(); c.ui.fp = null; go(c, 'fp-finish'); }, 400);
      return;
    }
    e.again = setTimeout(() => { if (c.ui.fp !== e) return; e.error = T().t('security_settings_fingerprint_enroll_lift_touch_again'); c.render(); }, 2500);
  }

  // The rear sensor.
  function touch(c) {
    if (!c || c.ui.power) return;
    if (c.ui.view === 'settings' && c.ui.settings?.stack?.at(-1)?.screen === 'fp-enroll' && !c.ui.sleeping) { enrollTouch(c); return; }
    if (c.ui.view === 'lock' && prints(c).length && secure(c)) {
      if (c.ui.sleeping) c.wake();
      navigator.vibrate?.(30);
      c.unlock();
    }
  }

  // FingerprintSettings.
  const fpSettings = {
    title: () => T().t('security_settings_fingerprint_preference_title'),
    render(c) {
      const t = T();
      return `<div class="mmst-list">${prints(c).map(p => `<button type="button" class="mmst-pref" data-action="mmfp-rename" data-id="${p.id}"><span class="mmst-iconframe"><i class="mmfp-fpicon"></i></span><span class="mmst-texts"><span class="mmst-title">${esc(c, p.name)}</span></span></button>`).join('')}
        ${prints(c).length < MAX ? `<button type="button" class="mmst-pref" data-action="mmfp-add"><span class="mmst-iconframe"><img class="mmst-ic" src="assets/st-ic_add.svg" alt=""></span><span class="mmst-texts"><span class="mmst-title">${esc(c, t.t('fingerprint_add_title'))}</span></span></button>` : ''}</div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'mmfp-add') { c.ui.fp = null; go(c, 'fp-enroll'); return true; }
      if (name === 'mmfp-rename') {
        const p = prints(c).find(x => x.id === +el.dataset.id); if (!p) return true;
        c.dialog({title: p.name, html: `<div class="mmst-edit"><small class="mmfp-label">${esc(c, t.t('security_settings_fingerprint_enroll_dialog_name_label'))}</small><input type="text" class="mmst-input mmfp-name" value="${esc(c, p.name)}" spellcheck="false"></div>`,
          buttons: [{label: t.t('security_settings_fingerprint_enroll_dialog_delete'), action: c => {
            const remove = () => { S(c).fingerprints = prints(c).filter(x => x !== p); c.save(); c.render(); };
            if (prints(c).length > 1) remove();
            else c.dialog({title: t.t('fingerprint_last_delete_title'), message: t.t('fingerprint_last_delete_message'), buttons: [{label: MM.text('settings').t('cancel')}, {label: t.t('fingerprint_last_delete_confirm'), action: remove}]});
          }}, {label: t.t('security_settings_fingerprint_enroll_dialog_ok'), action: c => { if (c.ui.fpName) p.name = c.ui.fpName; c.ui.fpName = ''; c.save(); c.render(); }}],
          mount(c, win) { const i = win.querySelector('.mmfp-name'); c.ui.fpName = i.value; i.addEventListener('input', () => { c.ui.fpName = i.value.trim(); }); }});
        return true;
      }
      return false;
    }
  };

  for (const [name, render] of Object.entries(screens)) MM.settingsScreens[name] = {full: true, render, action: (c, n, el) => action(c, n, el), back: name === 'fp-enroll' || name === 'fp-finish' ? c => { leave(c); return true; } : undefined};
  MM.settingsScreens['fp-settings'] = fpSettings;

  MM.fingerprint = {
    enrolled: c => prints(c).length > 0 && secure(c),
    count: c => prints(c).length,
    clear: c => { S(c).fingerprints = []; },
    // Security's row: no fingerprint → enroll; some → confirm the lock, then FingerprintSettings.
    open(c) {
      if (!prints(c).length) { go(c, 'fp-intro'); return; }
      c.ui.fpFlow = 'settings'; MM.settingsGo(c, 'lock-confirm', '');
    },
    // Where a confirmed lock or a new backup lock goes on.
    continueFlow(c) {
      const flow = c.ui.fpFlow; c.ui.fpFlow = '';
      if (flow === 'settings') { go(c, 'fp-settings'); return true; }
      if (flow === 'enroll' || flow === 'onboard') { go(c, 'fp-find'); return true; }
      return false;
    },
    pending: c => !!c.ui.fpFlow
  };

  MM.register('fingerprint', {
    app: false,
    init(c) {
      core = c;
      const sensor = document.querySelector('#fp-sensor');
      sensor?.addEventListener('click', () => touch(core));
    },
    render: () => ''
  });
})();
