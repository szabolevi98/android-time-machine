/* Android 7.1.2 Nexus Imprint: the Nexus 6P's rear fingerprint sensor, Settings' enrollment (com.android.settings.
   fingerprint of SettingsGoogle N2G48C) and FingerprintSettings, and the keyguard's fingerprint unlock. The logic is
   6.0.1's (its Nexus Imprint module); the N2G48C screens are GLIF pages:
   - The sensor: the phone's back cannot be seen here, so the sensor is the round control beside the phone (outside the
     screen, like the side keys). Touching it is what the sensor reports: a step of an enrollment, or on the keyguard
     (asleep or not) waking and unlocking as KeyguardUpdateMonitor does with a recognised finger.
   - FingerprintEnrollBase sets Theme.FingerprintEnroll (SuwThemeGlif.Light: the accent #4285f4, android:colorPrimary
     the same, so the GLIF pattern behind the status bar is #4285f4 at 204 / 255) and FingerprintLayoutTheme's
     ic_fingerprint_header as the GLIF icon. FingerprintEnrollIntroduction ("Unlock with fingerprint", the message,
     Cancel / Next): without a secure lock Next goes to ChooseLockGeneric for a backup lock (its fingerprint header and
     "Nexus Imprint + …" entries), with one to ConfirmLock; then FingerprintEnrollFindSensor ("Find the sensor", "Hint:
     It's on the back of your phone.", raw/fingerprint_location_animation.mp4 looping at the bottom, Next) →
     FingerprintEnrollEnrolling ("Let's start" / "Keep going", the 88 dp fp_illustration_enrollment on
     fingerprint_indicator_background_resting #12000000 flashing the accent at half alpha on each touch, the 192 dp
     fingerprint_progress_ring: 4 dp, #20000000 under the accent, from the top; "Lift finger, then touch sensor again"
     2.5 s after a touch; IconTouchDialog after three touches on the picture) → FingerprintEnrollFinish ("Fingerprint
     added!", fp_app_indicator, Add another (up to five) / Done). The simulator's sensor asks for six touches.
   - FingerprintSettings (Nexus Imprint, after confirming the lock): the fingerprints (ic_fingerprint_24dp,
     fingerprint_name_template; rename and delete in fingerprint_rename_dialog, the last one asking
     fingerprint_last_delete_*), Add fingerprint (ic_add_24dp; at five, disabled with "You can add up to 5
     fingerprints"), the disclaimer under the list. Security's row then counts them.
   - Removing the secure lock removes the fingerprints (ChooseLockGeneric's removeAllFingerprintTemplates). */
(() => {
  'use strict';
  const T = () => NG.text('settings');
  const STEPS = 5, MAX = 5;
  const GLIF_STATUS = '#6a9df6';
  let core = null;
  const S = c => c.data.settings;
  const prints = c => S(c).fingerprints || (S(c).fingerprints = []);
  const secure = c => ['pin', 'password', 'pattern'].includes(S(c).lock?.type);
  const go = (c, screen) => NG.settingsGo(c, screen, '');
  const stack = c => c.ui.settings.stack;
  // Back to the screen the enrollment started from (FingerprintSettings, Security or the dashboard's suggestion).
  function leave(c) {
    const st = stack(c);
    const flow = /^(fp-(intro|find|enroll|finish)|fingerprint-enroll|lock-|xml:security_settings_picker)/;
    while (st.length && flow.test(st.at(-1).screen)) st.pop();
    c.ui.fp = null; c.ui.fpFlow = ''; c.render();
  }
  const glif = (c, title, body) => `<div class="ngsc-glif ngfp"><div class="ngsc-scroll"><div class="ngsc-ghead"><i class="ngsc-gicon"></i><h1>${c.safe(title)}</h1></div><div class="ngsc-frame">${body}</div></div></div>`;
  const pos = (action, label, c) => `<button type="button" class="ngsc-pos" data-action="${action}">${c.safe(label)}</button>`;
  const neg = (action, label, c) => `<button type="button" class="ngsc-neg" data-action="${action}">${c.safe(label)}</button>`;
  const msg = (c, text) => `<p class="ngsc-desc">${c.safe(text)}</p>`;

  const screens = {
    'fp-intro': c => { const t = T(); return glif(c, t.t('security_settings_fingerprint_enroll_introduction_title'),
      `${msg(c, t.t('security_settings_fingerprint_enroll_introduction_message'))}<div class="ngsc-buttons">${neg('ngfp-cancel', t.t('security_settings_fingerprint_enroll_introduction_cancel'), c)}<i></i>${pos('ngfp-continue', t.t('suw_next_button_label'), c)}</div>`); },
    'fp-find': c => { const t = T(); return glif(c, t.t('security_settings_fingerprint_enroll_find_sensor_title'),
      `<p class="ngsc-desc">${c.safe(t.t('security_settings_fingerprint_enroll_find_sensor_message'))}</p><div class="ngfp-video"><video src="assets/st-fingerprint_location_animation.mp4" autoplay loop muted playsinline></video></div>
      <div class="ngsc-buttons end">${pos('ngfp-next', t.t('fingerprint_enroll_button_next'), c)}</div>`); },
    'fp-enroll': c => {
      const t = T(), e = c.ui.fp || (c.ui.fp = {steps: -1, remaining: 0, iconTouches: 0});
      const started = e.steps !== -1, progress = started ? Math.max(0, e.steps + 1 - e.remaining) / (e.steps + 1) : 0;
      const r = 94, len = 2 * Math.PI * r;
      return glif(c, t.t(started ? 'security_settings_fingerprint_enroll_repeat_title' : 'security_settings_fingerprint_enroll_start_title'),
        `${msg(c, t.t(started ? 'security_settings_fingerprint_enroll_repeat_message' : 'security_settings_fingerprint_enroll_start_message'))}
        <div class="ngfp-ring"><svg viewBox="0 0 192 192" aria-hidden="true"><circle cx="96" cy="96" r="${r}" class="bg"/><circle cx="96" cy="96" r="${r}" class="fg" stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${(len * (1 - progress)).toFixed(1)}"/></svg><button type="button" class="ngfp-print${e.flash ? ' flash' : ''}" data-action="ngfp-icon" aria-hidden="true"><i></i></button></div>
        <div class="ngfp-error">${c.safe(e.error || '')}</div>`);
    },
    'fp-finish': c => { const t = T(); return glif(c, t.t('security_settings_fingerprint_enroll_finish_title'),
      `<p class="ngsc-desc">${c.safe(t.t('security_settings_fingerprint_enroll_finish_message'))}</p><i class="ngsc-fill ngfp-gap"></i><img class="ngfp-indicator" src="assets/st-fp_app_indicator.png" alt=""><i class="ngsc-fill ngfp-gap"></i>
      <div class="ngsc-buttons">${prints(c).length < MAX ? neg('ngfp-another', t.t('fingerprint_enroll_button_add'), c) : ''}<i></i>${pos('ngfp-done', t.t('security_settings_fingerprint_enroll_done'), c)}</div>`); }
  };

  function action(c, name) {
    const t = T();
    switch (name) {
      case 'ngfp-cancel': leave(c); return true;
      case 'ngfp-continue':
        if (secure(c)) { c.ui.fpFlow = 'enroll'; NG.settingsGo(c, 'lock-confirm', ''); }
        else { c.ui.fpFlow = 'onboard'; NG.settingsGo(c, 'xml:security_settings_picker', t.t('lock_settings_picker_title')); }
        return true;
      case 'ngfp-next': stack(c).pop(); c.ui.fp = null; go(c, 'fp-enroll'); return true;
      case 'ngfp-icon': {
        // Touching the picture instead of the sensor: the third touch brings IconTouchDialog.
        const e = c.ui.fp; if (!e) return true;
        if (++e.iconTouches >= 3) { e.iconTouches = 0; c.dialog({title: t.t('security_settings_fingerprint_enroll_touch_dialog_title'), message: t.t('security_settings_fingerprint_enroll_touch_dialog_message'), buttons: [{label: t.t('security_settings_fingerprint_enroll_dialog_ok')}]}); }
        return true;
      }
      case 'ngfp-another': stack(c).pop(); c.ui.fp = null; go(c, 'fp-enroll'); return true;
      case 'ngfp-done': leave(c); return true;
    }
    return false;
  }

  // A touch of the sensor during an enrollment (FingerprintEnrollSidecar → onEnrollmentProgressChange).
  function enrollTouch(c) {
    const e = c.ui.fp || (c.ui.fp = {steps: -1, remaining: 0, iconTouches: 0});
    if (e.steps === -1) { e.steps = STEPS; e.remaining = STEPS; } else e.remaining = Math.max(0, e.remaining - 1);
    e.error = ''; e.flash = true; clearTimeout(e.again); clearTimeout(e.flashTimer);
    c.transition('none'); c.render();
    e.flashTimer = setTimeout(() => { e.flash = false; c.el.viewport.querySelector('.ngfp-print')?.classList.remove('flash'); }, 300);
    if (e.remaining === 0) {
      const n = prints(c).length + 1;
      prints(c).push({id: Date.now(), name: AndroidStrings.format(T().t('framework/fingerprint_name_template'), n)});
      c.save();
      setTimeout(() => { if (stack(c).at(-1)?.screen !== 'fp-enroll') return; stack(c).pop(); c.ui.fp = null; go(c, 'fp-finish'); }, 400);
      return;
    }
    e.again = setTimeout(() => { if (c.ui.fp !== e) return; e.error = T().t('security_settings_fingerprint_enroll_lift_touch_again'); c.transition('none'); c.render(); }, 2500);
  }

  // The rear sensor: an enrollment step, or the keyguard's unlock with a recognised finger.
  function touch(c) {
    if (!c || c.ui.power) return;
    navigator.vibrate?.(30);
    if (c.ui.view === 'settings' && c.ui.settings?.stack?.at(-1)?.screen === 'fp-enroll' && !c.ui.sleeping) { enrollTouch(c); return; }
    if (c.ui.view === 'lock' && prints(c).length && secure(c)) {
      if (c.ui.sleeping) c.wake();
      if (NG.lockVerified) NG.lockVerified(c); else c.unlock();
    }
  }

  // FingerprintSettings.
  const fpSettings = {
    title: () => T().t('security_settings_fingerprint_preference_title'),
    render(c) {
      const t = T(), full = prints(c).length >= MAX;
      const icon = name => `<i class="ngst-ic masked" style="background:#0000008a;-webkit-mask-image:url('assets/st-${name}.svg');mask-image:url('assets/st-${name}.svg')"></i>`;
      const items = prints(c).map(p => ({html: NG.settingsRow(c, {title: p.name, icon: icon('ic_fingerprint_24dp'), action: 'ngfp-rename', data: ` data-id="${p.id}"`}), sel: true}));
      items.push({html: NG.settingsRow(c, {title: t.t('fingerprint_add_title'), summary: full ? t.fmt('fingerprint_add_max', null, MAX) : '', icon: icon('ic_add_24dp'), action: 'ngfp-add', disabled: full}), sel: true});
      return `<div class="ngst-list">${NG.settingsJoinRows(items)}<div class="ngfp-footer">${c.safe(t.t('security_settings_fingerprint_enroll_disclaimer'))}</div></div>`;
    },
    action(c, name, el) {
      const t = T();
      if (name === 'ngfp-add') { if (prints(c).length < MAX) { c.ui.fp = null; go(c, 'fp-enroll'); } return true; }
      if (name === 'ngfp-rename') {
        const p = prints(c).find(x => x.id === +el.dataset.id); if (!p) return true;
        let value = p.name;
        c.dialog({title: p.name, html: `<div class="ngst-edit"><small class="ngfp-label">${c.safe(t.t('security_settings_fingerprint_enroll_dialog_name_label'))}</small><input type="text" class="ngst-input ngfp-name" value="${c.safe(p.name)}" spellcheck="false"></div>`,
          buttons: [{label: t.t('security_settings_fingerprint_enroll_dialog_delete'), action: c => {
            const remove = () => { S(c).fingerprints = prints(c).filter(x => x !== p); c.save(); c.render(); };
            if (prints(c).length > 1) remove();
            else c.dialog({title: t.t('fingerprint_last_delete_title'), message: t.t('fingerprint_last_delete_message'), buttons: [{label: t.t('cancel')}, {label: t.t('fingerprint_last_delete_confirm'), action: remove}]});
          }}, {label: t.t('security_settings_fingerprint_enroll_dialog_ok'), action: c => { if (value.trim()) p.name = value.trim(); c.save(); c.render(); }}],
          mount(c, win) { const i = win.querySelector('.ngfp-name'); i.addEventListener('input', () => { value = i.value; }); }});
        return true;
      }
      return false;
    }
  };

  for (const [name, render] of Object.entries(screens)) NG.settingsScreens[name] = {full: true, statusColor: () => GLIF_STATUS, render, action: (c, n, el) => action(c, n, el), back: name === 'fp-enroll' || name === 'fp-finish' ? c => { leave(c); return true; } : undefined};
  NG.settingsScreens['fp-settings'] = fpSettings;
  // The dashboard's suggestions start the enrollment.
  NG.settingsScreens['fingerprint-enroll'] = {full: true, statusColor: () => GLIF_STATUS, render: c => screens['fp-intro'](c), action: (c, n, el) => action(c, n, el)};

  NG.fingerprint = {
    enrolled: c => prints(c).length > 0 && secure(c),
    count: c => prints(c).length,
    clear: c => { S(c).fingerprints = []; },
    // Security's row: no fingerprint → enroll; some → confirm the lock, then FingerprintSettings.
    open(c) {
      if (!prints(c).length) { go(c, 'fp-intro'); return; }
      c.ui.fpFlow = 'settings'; NG.settingsGo(c, 'lock-confirm', '');
    },
    // Where a confirmed lock or a new backup lock goes on.
    continueFlow(c) {
      const flow = c.ui.fpFlow; c.ui.fpFlow = '';
      if (flow === 'settings') { go(c, 'fp-settings'); return true; }
      if (flow === 'enroll' || flow === 'onboard') {
        const st = stack(c);
        while (st.length > 1 && /^(lock-|xml:security_settings_picker)/.test(st.at(-1).screen)) st.pop();
        go(c, 'fp-find'); return true;
      }
      return false;
    },
    pending: c => !!c.ui.fpFlow,
    touch: c => touch(c)
  };

  NG.register('fingerprint', {
    app: false,
    init(c) {
      core = c;
      document.querySelector('#fp-sensor')?.addEventListener('click', () => touch(core));
    },
    render: () => ''
  });
})();
