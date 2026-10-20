/* Android 7.1.2 lock screen (SystemUI.apk's keyguard, N2G48C): the insecure swipe lock the image starts with
   (def_lockscreen_disabled false, no credential). The logic is 6.0.1's (mm-lock.js); the look and the numbers are
   N2G48C's (ng-lock.css):
   - The wallpaper (framework default_wallpaper, the Nougat mountains) behind ScrimController's keyguard scrim:
     mScrimBehindAlphaKeyguard 0.45 with the panel open, down to mScrimBehindAlphaUnlocking 0.2 as it is pulled up. The
     status bar and the navigation bar's keys are hidden (the keyguard disables home, recents and back).
   - keyguard_status_bar.xml (KeyguardStatusBarView, 40 dp): CarrierText 16 dp from the start (textAppearanceSmall,
     white; "Airplane mode" in airplane mode), the system icons centred in the bar (the 104 dp container is held to the
     bar's height by RelativeLayout) with the battery level only while charging; the user switch only with a second user.
   - keyguard_status_view.xml: the clock (widget_big_thin: sans-serif-light, widget_big_font_size 88 dp at h650dp; the
     6P's panel is 659 dp high), the best "hm" / "Hm" pattern without AM / PM, ':' replaced by U+EE01 (Roboto's clock
     colon), -1 dp (bottom_text_spacing_digital) over keyguard_status_area.xml: the date (14 sp caps, letter spacing
     0.15; abbrev_wday_month_day_no_year "EEEEMMMMd", "EEEMMMd" while an alarm is set) and the next alarm 6 dp after it
     (ic_access_alarms_big, 6 dp padding, clock_gray #b3ffffff, KeyguardStatusView.formatNextAlarm "Ehma" / "EHm").
   - KeyguardClockPositionAlgorithm: t = notifications / (max 5 + notification_summary_height 44 / notification_min_height
     92); the status view's centre at ((1 - t) x 0.325 + t x 0.198) of the panel, the notifications
     keyguard_clock_notifications_margin 36 dp (none) to 32 dp (t = 1, h650dp) under it. Pulled up, the stack moves with
     the rubber band (getClockYExpansionAdjustment) and the clock shrinks and fades (getClockScale, getClockAlpha).
   - keyguard_bottom_area.xml: the left button is voice assist (ic_mic_26dp: Velvet's voice_interaction_service sets
     supportsLaunchVoiceAssistFromKeyguard), the camera at the right, the LockIcon (ic_lock_open_24dp: no bouncer) in the
     middle, 56 dp at the bottom; KeyguardIndicationTextView (textAppearanceSmall italic) 65 dp from the bottom.
   - KeyguardAffordanceView: the icons rest at 0.5; swiping from one grows its white circle ((translation - paging touch
     slop 16 dp) x 0.25 + 30 dp), the icon turning from white to black as the circle reaches 30 dp, and it launches past
     keyguard_min_swipe_amount 110 dp. A tap plays the hint: the circle out to hint_grow_amount_sideways 60 dp in 200 ms
     (linear out slow in) and back after 500 ms in 350 ms (fast out linear in), with "Swipe from icon for voice assist /
     camera".
   - The panel: swiping up more than keyguard_min_swipe_amount unlocks; a tap plays PanelView's unlock hint (the panel up
     hint_move_distance 75 dp in 250 ms fast out slow in and back in 450 ms with the BounceInterpolator, the indication
     text with it) and "Swipe up to unlock" (keyguard_unlock), gone 1.2 s after the hint (HINT_RESET_DELAY_MS).
   - Unlocking: the panel collapses, then the window behind comes in: lock_screen_behind_enter_wallpaper for the home
     screen (from 11 % down, alpha from 0 in 400 ms, decelerate quint, after 100 ms), lock_screen_behind_enter for an app
     (from 110 % down in 300 ms).
   - The keyguard window's user activity timeout: 10 s (StatusBarWindowManager, AWAKE_INTERVAL_DEFAULT_MS).
   - Notifications (ng-notify.js rows): at most keyguard_max_notification_count 5 (h650dp) in the dimmed background
     (notification_material_background_dimmed_color #ccffffff); a tap activates a row ("Tap again to open",
     notification_tap_again), the second opens it. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => NG.text('lock');
  const W = 1440 / 3.5, NAV = 48;
  const MAX_NOTES = 5;
  let hintTimer = 0;

  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  // KeyguardStatusView.Patterns: the best "hm" / "Hm" pattern, AM / PM taken out, ':' as the clock colon.
  function clockText(c, now = new Date()) {
    const parts = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: !is24(c)}).formatToParts(now);
    return parts.filter(p => p.type !== 'dayPeriod').map(p => p.type === 'literal' ? p.value.replace(':', '').replace(/\s+/g, '') : p.value).join('').trim();
  }
  const dateText = (c, alarm, now = new Date()) => new Intl.DateTimeFormat(c.locale(), alarm ? {weekday: 'short', month: 'short', day: 'numeric'} : {weekday: 'long', month: 'long', day: 'numeric'}).format(now);
  const alarmText = (c, at) => new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !is24(c)}).format(at);

  const secure = c => ['pin', 'password', 'pattern'].includes(c.data.settings.lock?.type);
  const shownNotes = c => (c.notifications?.() || []).slice(0, MAX_NOTES);

  /* KeyguardClockPositionAlgorithm.run for a panel H dp high pulled up by d dp: the status view's top, the stack's top,
     the clock's scale and alpha. statusH is the status view's height (dp). */
  const slowDown = (() => {
    // sSlowDownInterpolator: the path (0, 0) to (1, 1) through (0.3, 0.875) and (0.6, 1).
    const pts = Array.from({length: 101}, (_, i) => { const t = i / 100, u = 1 - t; return [3 * u * u * t * .3 + 3 * u * t * t * .6 + t ** 3, 3 * u * u * t * .875 + 3 * u * t * t + t ** 3]; });
    return x => { if (!(x > 0)) return 0; if (x >= 1) return 1; const i = pts.findIndex(p => p[0] >= x), a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (x - a[0]) / ((b[0] - a[0]) || 1); };
  })();
  function position(count, H, statusH, d = 0) {
    const t = count / (MAX_NOTES + 44 / 92), tc = Math.min(t, 1);
    const top = ((1 - tc) * .325 + .198 * tc) * H - statusH / 2;
    const p3 = Math.pow(tc, .3), rubber = (1 - p3) * .8 + .08 * p3;
    const v3 = rubber * d, v1 = -slowDown(v3 / H) * .4 * H;
    const adj = (count ? v1 : (-2 * v3 + v1) / 3) * ((1 - tc) * 1.4 + 3.2 * tc);
    const padding = 32 * tc + 36 * (1 - tc);
    const stack = statusH + top + padding + adj;
    const v2 = top - statusH * (count ? 5 : 6), x = Math.max(0, Math.min(1, (stack - v2) / (top + padding + statusH - v2)));
    const scale = x * x;
    const from = count ? .75 : .5, alpha = Math.max(0, Math.min(1, (scale - from) / (.95 - from)));
    return {top, stack, scale, alpha};
  }

  /* The bouncer (KeyguardBouncer over ScrimController's in-front scrim, black at 0.75, N2G48C's SCRIM_IN_FRONT_ALPHA):
     keyguard_host_view's KeyguardSecurityContainer at the bottom above the navigation bar, keyguard_security_width 320 dp
     wide, keyguard_security_view_margin 8 dp above the view; the logic is 6.0.1's:
     - keyguard_pin_view.xml (keyguard_security_max_height 450 dp at most): keyguard_message_area (14 sp,
       textColorSecondary), the PasswordTextView row (password_dot_size 9 dp dots password_char_padding 8 dp apart, the
       ic_backspace_24dp key, a 1 dp #28ffffff divider), four rows of NumPadKey (Widget.TextView.NumPadKey 36 sp
       sans-serif-light white, .Klondike 12 sp #80ffffff), the last with 0 and the ic_done_wht enter key;
       keyguard_password_view.xml (keyguard_security_height 400 dp: 7 : 2 spaces around the 280 dp 16 sp field);
       keyguard_pattern_view.xml (400 dp: the LockPatternView in white, wrong in system_error #f4511e);
     - keyguard_eca's emergency button (lockscreen_emergency_call) at the bottom;
     - a wrong entry: kg_wrong_pin / password / pattern; five in a row lock it for 30 s
       (kg_too_many_failed_attempts_countdown); Back hides the bouncer. */
  const KLONDIKE = ['+', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  function bouncer(c) {
    const s = c.data.settings, type = s.lock.type, st = c.ui.lockState, t = T();
    const eca = `<div class="ngbo-eca"><button type="button" class="ngbo-emergency" data-action="ngbo-emergency">${c.safe(t.t('framework/lockscreen_emergency_call'))}</button></div>`;
    const msg = `<div class="ngbo-msg">${c.safe(st.message || '')}</div>`;
    let view;
    if (type === 'pin') {
      const key = d => `<button type="button" class="ngbo-key" data-action="ngbo-digit" data-d="${d}"><span class="ngbo-digit">${d}</span><span class="ngbo-letters">${KLONDIKE[d]}</span></button>`;
      view = `<div class="ngbo-view pin">${msg}<div class="ngbo-rows"><div class="ngbo-row0"><span class="ngbo-entry">${'<i></i>'.repeat((st.entry || '').length)}</span><button type="button" class="ngbo-del" data-action="ngbo-del"><img src="${A('sui-ic_backspace_24dp.svg')}" alt=""></button></div>
        ${[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(r => `<div class="ngbo-row">${r.map(key).join('')}</div>`).join('')}<div class="ngbo-row"><i></i>${key(0)}<button type="button" class="ngbo-key" data-action="ngbo-enter"><img src="${A('sui-ic_done_wht.png')}" alt=""></button></div></div>${eca}</div>`;
    } else if (type === 'password') {
      view = `<div class="ngbo-view password"><i class="ngbo-space7"></i>${msg}<input class="ngbo-field" type="password" autocomplete="off" spellcheck="false"><i class="ngbo-space2"></i>${eca}</div>`;
    } else view = `<div class="ngbo-view pattern">${msg}<div class="ngbo-pat">${NG.pattern.markup('ngbo-pattern')}</div>${eca}</div>`;
    return `<div class="ngbo"><div class="ngbo-scrim"></div><div class="ngbo-container${st.lockedUntil > Date.now() ? ' locked' : ''}">${view}</div></div>`;
  }
  function checked(c, ok) {
    const st = c.ui.lockState, t = T(), type = c.data.settings.lock.type;
    if (ok) { st.verified = true; st.confirmReturn = false; st.fails = 0; st.entry = ''; st.message = ''; const then = st.bouncer; st.bouncer = null; c.unlock(); if (typeof then === 'function') then(); else if (then && then !== 'unlock') c.open(then); return; }
    st.entry = ''; st.fails = (st.fails || 0) + 1;
    st.message = t.t(type === 'pin' ? 'kg_wrong_pin' : type === 'password' ? 'kg_wrong_password' : 'kg_wrong_pattern');
    if (st.fails >= 5) {
      st.fails = 0; st.lockedUntil = Date.now() + 30000;
      const tick = () => {
        if (!c.ui.lockState?.bouncer) return;
        const left = Math.ceil((st.lockedUntil - Date.now()) / 1000), el = c.el.viewport.querySelector('.ngbo-msg');
        if (left <= 0) { st.message = ''; c.render(); return; }
        st.message = t.fmt('kg_too_many_failed_attempts_countdown', null, left); if (el) el.textContent = st.message;
        setTimeout(tick, 1000);
      };
      tick();
    }
    c.render();
  }
  NG.lockVerified = c => { const st = c.ui.lockState || (c.ui.lockState = {hint: ''}); checked(c, true); };
  NG.requireUnlock = (c, then) => {
    if (!secure(c) || c.ui.lockState?.verified) { then(); return; }
    c.ui.beforeLock = {view:c.ui.view,sub:c.ui.sub};
    const st=c.ui.lockState||(c.ui.lockState={hint:''});st.bouncer=then;st.confirmReturn=true;c.ui.sleeping=false;
    c.open('lock','',{replace:true});
  };
  function mountBouncer(c, root) {
    const st = c.ui.lockState, l = c.data.settings.lock, locked = () => st.lockedUntil > Date.now();
    const box = root.querySelector('.ngbo');
    box?.addEventListener('pointerdown', e => e.stopPropagation());
    box?.addEventListener('click', e => {
      const a = e.target.closest('[data-action]')?.dataset.action;
      if (!a) return;
      e.stopPropagation();
      if (locked()) return;
      if (a === 'ngbo-digit') { if ((st.entry || '').length < 16) st.entry = (st.entry || '') + e.target.closest('[data-d]').dataset.d; st.message = ''; c.render(); }
      else if (a === 'ngbo-del') { st.entry = (st.entry || '').slice(0, -1); c.render(); }
      else if (a === 'ngbo-enter') { if (st.entry) checked(c, st.entry === l.secret); }
      else if (a === 'ngbo-emergency') { st.bouncer = null; c.open('emergency-dialer'); }
    });
    const field = root.querySelector('.ngbo-field');
    if (field) {
      field.disabled = locked();
      field.addEventListener('keydown', e => { if (e.key === 'Enter' && field.value) { e.preventDefault(); checked(c, field.value === l.secret); } });
      setTimeout(() => field.focus(), 30);
    }
    const pat = root.querySelector('.ngbo-pattern');
    if (pat) {
      NG.pattern.init(pat);
      NG.pattern.bind(pat, {enabled: () => !locked(), onStart: () => { st.message = ''; const m = root.querySelector('.ngbo-msg'); if (m) m.textContent = ''; },
        onDone: cells => {
          if (cells.join('') === l.secret) { NG.pattern.show(pat, cells, 'correct'); checked(c, true); }
          else { NG.pattern.show(pat, cells, 'wrong'); setTimeout(() => checked(c, false), 600); }
        }});
    }
  }

  function render(c) {
    const st = c.ui.lockState || (c.ui.lockState = {hint: ''});
    const html = keyguard(c);
    // The panel is collapsed under the bouncer (StatusBarKeyguardViewManager.showBouncer): only the wallpaper stays.
    return secure(c) && st.bouncer ? html.replace('<div class="nglk">', '<div class="nglk bouncing">').replace(/<\/div>$/, `${bouncer(c)}</div>`) : html;
  }
  function keyguard(c) {
    const t = T(), s = c.data.settings, st = c.ui.lockState;
    const carrier = s.airplane ? t.t('airplane_mode') : NG.text('shade').t('carrier');
    const b = NG.battery(), alarm = NG.clock?.nextAlarm(c) || 0;
    const indication = st.hint || (b.plugged ? t.t(b.level >= 100 ? 'keyguard_charged' : 'keyguard_plugged_in') : '');
    const status = (c.statusIcons?.() || []).map(name => `<img class="ngsb-icon" src="${A(`sui-${name}.svg`)}" alt="">`).join('');
    const notes = shownNotes(c);
    return `<div class="nglk">
      <div class="nglk-wall"></div><div class="nglk-scrim"></div>
      <div class="nglk-panel">
        <div class="nglk-bar"><span class="nglk-carrier">${c.safe(carrier)}</span>
          <span class="nglk-icons"><span class="ngsb-icons">${status}</span>${NG.signalCluster ? NG.signalCluster(c) : ''}${NG.batteryMeter(!!s.powerSave)}${b.plugged ? `<span class="nglk-level">${c.safe(new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100))}</span>` : ''}</span></div>
        <div class="nglk-status">
          <div class="nglk-clock">${c.safe(clockText(c))}</div>
          <div class="nglk-area"><span class="nglk-date">${c.safe(dateText(c, !!alarm))}</span>${alarm ? `<span class="nglk-alarm" aria-label="${c.safe(t.fmt('keyguard_accessibility_next_alarm', null, alarmText(c, alarm)))}"><img src="${A('sui-ic_access_alarms_big.svg')}" alt="">${c.safe(alarmText(c, alarm))}</span>` : ''}</div>
          ${s.lock?.ownerInfo ? `<div class="nglk-owner">${c.safe(s.lock.ownerInfo)}</div>` : ''}</div>
        ${notes.length ? `<div class="nglk-notes">${notes.map(n => NG.notifications.row(c, n)).join('')}</div>` : ''}
        <div class="nglk-bottom">
          <div class="nglk-indication">${c.safe(indication)}</div>
          <button type="button" class="nglk-aff nglk-left" data-aff="voice" aria-label="${c.safe(t.t('accessibility_voice_assist_button'))}"><i class="nglk-circle"></i><i class="nglk-icon"></i></button>
          <button type="button" class="nglk-lock" aria-label="${c.safe(t.t('accessibility_unlock_button'))}"><img src="${A(secure(c) ? 'sui-ic_lock_24dp.svg' : 'sui-ic_lock_open_24dp.svg')}" alt=""></button>
          <button type="button" class="nglk-aff nglk-camera" data-aff="camera" aria-label="${c.safe(t.t('accessibility_camera_button'))}"><i class="nglk-circle"></i><i class="nglk-icon"></i></button>
        </div>
      </div></div>`;
  }

  // Lays the status view and the rows out for a pull of d dp (the algorithm above) and fades the rest with it.
  function layout(c, root, d = 0) {
    const panel = root.querySelector('.nglk-panel'), status = root.querySelector('.nglk-status'); if (!panel || !status) return;
    const dp = c.el.screen.clientWidth / W, H = panel.clientHeight / dp, statusH = status.offsetHeight / dp;
    const count = Math.min(shownNotes(c).length, MAX_NOTES), p = position(count, H, statusH, d);
    status.style.top = `calc(${p.top.toFixed(2)} * var(--dp))`;
    status.style.transform = d ? `scale(${p.scale.toFixed(4)})` : '';
    status.style.opacity = d ? p.alpha.toFixed(4) : '';
    const notes = root.querySelector('.nglk-notes');
    if (notes) notes.style.top = `calc(${p.stack.toFixed(2)} * var(--dp))`;
    // ScrimController.updateScrimKeyguard: from 0.45 down to 0.2 as the panel's fraction drops; the bottom area and the
    // status bar fade with the panel.
    const f = Math.max(0, 1 - d / H), scrim = root.querySelector('.nglk-scrim');
    if (scrim) scrim.style.opacity = (f * (.45 - .2) + .2).toFixed(3);
    for (const el of root.querySelectorAll('.nglk-bottom,.nglk-bar')) el.style.opacity = d ? Math.pow(Math.max(0, 1 - d / 110), .75).toFixed(3) : '';
  }

  function setHint(c, root, text) {
    const st = c.ui.lockState; st.hint = text;
    const el = root.querySelector('.nglk-indication'); if (el) el.textContent = text;
    clearTimeout(hintTimer);
  }
  function hintGone(c, ms) {
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { if (c.ui.lockState) c.ui.lockState.hint = ''; const e = c.el.viewport.querySelector('.nglk-indication'); if (e) e.textContent = ''; }, ms);
  }

  // Unlocking: the panel collapses (PanelView's fling closed, about 250 ms), then the keyguard goes and the window
  // behind plays its enter animation.
  function unlock(c, root, then) {
    if (secure(c) && !c.ui.lockState.verified) { c.ui.lockState.bouncer = then || 'unlock'; c.render(); return; }
    const panel = root.querySelector('.nglk-panel'), lk = root.querySelector('.nglk');
    if (panel?.animate) panel.animate([{transform: getComputedStyle(panel).transform}, {transform: 'translateY(-100%)'}], {duration: 250, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'});
    lk?.querySelector('.nglk-scrim')?.animate?.([{opacity: getComputedStyle(lk.querySelector('.nglk-scrim')).opacity}, {opacity: 0}], {duration: 250, fill: 'forwards'});
    setTimeout(() => {
      c.transition('none');
      c.unlock();
      if (typeof then === 'function') then(); else if (then) c.open(then);
      const vp = c.el.viewport, home = c.ui.view === 'home';
      if (vp.animate) {
        const fwd = {fill: 'backwards', delay: 100};
        if (home) {
          vp.animate([{opacity: 0}, {opacity: 1}], {duration: 400, easing: 'cubic-bezier(.23,1,.32,1)', ...fwd});
          vp.animate([{transform: 'translateY(11%)'}, {transform: 'none'}], {duration: 300, easing: 'cubic-bezier(.23,1,.32,1)', ...fwd});
        } else vp.animate([{transform: 'translateY(110%)'}, {transform: 'none'}], {duration: 300, easing: 'cubic-bezier(.23,1,.32,1)', ...fwd});
      }
    }, 250);
  }

  // SystemUI's BounceInterpolator.
  function bounce(t) {
    t *= 1.1;
    if (t < 4 / 11) return 7.5625 * t * t;
    if (t < 8 / 11) { const u = t - 6 / 11; return 7.5625 * u * u + .75; }
    if (t < 10 / 11) { const u = t - 9 / 11; return 7.5625 * u * u + .9375; }
    return 1;
  }
  // PanelView.startUnlockHintAnimation: the panel up 75 dp (250 ms) and back with the bounce (450 ms).
  function unlockHint(c, root) {
    setHint(c, root, T().t('keyguard_unlock'));
    const fosi = x => { let lo = 0, hi = 1; const f = (a, b, t) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (f(.4, .2, m) < x) lo = m; else hi = m; } return f(0, 1, (lo + hi) / 2); };
    const ind = root.querySelector('.nglk-indication'), start = performance.now();
    const step = now => {
      const ms = now - start, k = ms < 250 ? fosi(ms / 250) : 1 - bounce(Math.min(1, (ms - 250) / 450)), d = 75 * k;
      layout(c, root, d);
      if (ind) ind.style.transform = `translateY(calc(${(-d).toFixed(2)} * var(--dp)))`;
      if (ms < 700 && c.ui.view === 'lock') requestAnimationFrame(step);
      else { layout(c, root, 0); if (ind) ind.style.transform = ''; hintGone(c, 1200); }
    };
    requestAnimationFrame(step);
  }

  // KeyguardAffordanceView: the circle and the icon's colour for a swipe of x dp from the icon (KeyguardAffordanceHelper).
  function affordance(el, x, other) {
    const r = x > 16 ? (x - 16) * .25 + 30 : 0, t = Math.min(1, x / 110), alpha = t + .5 * (1 - t);
    el.style.setProperty('--r', r.toFixed(2));
    el.style.setProperty('--ink', Math.min(1, r / 30).toFixed(3));
    el.style.setProperty('--a', alpha.toFixed(3));
    el.style.setProperty('--ca', (.5 + Math.max(0, Math.min(1, (r - 30) / 15)) * .5).toFixed(3));
    if (other) other.style.setProperty('--a', ((1 - t) * .5).toFixed(3));
  }
  function resetAff(root) { for (const el of root.querySelectorAll('.nglk-aff')) for (const p of ['--r', '--ink', '--a', '--ca']) el.style.removeProperty(p); }
  // KeyguardAffordanceHelper.startHintAnimation: out to 60 dp in 200 ms (linear out slow in), back after 500 ms in 350 ms.
  function affordanceHint(c, root, el, which) {
    setHint(c, root, T().t(which === 'voice' ? 'voice_hint' : 'camera_hint'));
    const losi = x => 1 - (1 - x) ** 2.2, foli = x => x ** 2.2, start = performance.now();
    const other = [...root.querySelectorAll('.nglk-aff')].find(x => x !== el);
    const step = now => {
      const ms = now - start, k = ms < 200 ? losi(ms / 200) : ms < 700 ? 1 : 1 - foli(Math.min(1, (ms - 700) / 350));
      affordance(el, 16 + 120 * k * .5, other);
      if (ms < 1050 && c.ui.view === 'lock') requestAnimationFrame(step); else { resetAff(root); hintGone(c, 1200); }
    };
    requestAnimationFrame(step);
  }

  function mount(c, root) {
    const lk = root.querySelector('.nglk'), panel = root.querySelector('.nglk-panel');
    if (!lk || !panel) return;
    layout(c, root, 0);
    // On a page that starts on the keyguard the screen may not be laid out yet: once more on the next frame.
    requestAnimationFrame(() => layout(c, root, 0));
    if (c.ui.lockState?.bouncer) mountBouncer(c, root);
    const dpPx = () => c.el.screen.clientWidth / W;
    let drag = null;
    lk.addEventListener('pointerdown', e => {
      if (e.button) return;
      const aff = e.target.closest('.nglk-aff');
      drag = {x: e.clientX, y: e.clientY, aff: aff?.dataset.aff || '', el: aff, moved: false, top: e.target.closest('.nglk-bar'), t0: performance.now()};
      if (aff) affordance(aff, 16, null);
      try { lk.setPointerCapture(e.pointerId); } catch {}
    });
    lk.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / dpPx(), dy = (e.clientY - drag.y) / dpPx();
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) drag.moved = true;
      if (drag.aff) {
        const along = drag.aff === 'voice' ? Math.max(0, dx) : Math.max(0, -dx);
        affordance(drag.el, Math.max(16, along), [...root.querySelectorAll('.nglk-aff')].find(x => x !== drag.el));
      } else if (!drag.top && dy < 0) layout(c, root, -dy);
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      const dx = (e.clientX - d.x) / dpPx(), dy = (e.clientY - d.y) / dpPx(), v = dy / Math.max(1, performance.now() - d.t0) * 1000;
      if (d.aff) {
        const along = d.aff === 'voice' ? dx : -dx;
        if (along >= 110) { unlock(c, root, d.aff === 'camera' ? 'camera' : 'search'); return; }
        resetAff(root);
        if (!d.moved) affordanceHint(c, root, d.el, d.aff);
        return;
      }
      if (d.top && dy > 40) { NG.module('shade')?.open(c); return; }
      const note = !d.moved && document.elementFromPoint(e.clientX, e.clientY)?.closest('.nglk-notes .ngnt-row');
      if (note) {
        if (note.classList.contains('active')) { const id = note.dataset.id; unlock(c, root, () => NG.notifications.open(c, id)); return; }
        root.querySelectorAll('.nglk-notes .ngnt-row.active').forEach(x => x.classList.remove('active'));
        note.classList.add('active'); setHint(c, root, T().t('notification_tap_again')); hintGone(c, 1200);
        clearTimeout(note.timer); note.timer = setTimeout(() => note.classList.remove('active'), 1200);
        return;
      }
      // PanelView.flingExpands: past keyguard_min_swipe_amount up, or flung up, unlocks; else the panel comes back.
      if (dy <= -110 || (v < -500 && dy < -24)) { unlock(c, root); return; }
      if (d.moved) {
        const from = -dy, start = performance.now();
        const back = now => { const k = Math.min(1, (now - start) / 300), e2 = 1 - (1 - k) ** 3; layout(c, root, from * (1 - e2)); if (k < 1) requestAnimationFrame(back); };
        requestAnimationFrame(back);
      } else unlockHint(c, root);
    };
    lk.addEventListener('pointerup', end);
    lk.addEventListener('pointercancel', () => { if (drag) { drag = null; layout(c, root, 0); resetAff(root); } });
  }

  let lastMinute = -1;
  NG.register('lock', {
    app: false,
    noStatus: () => true, noNav: c => !c.ui.lockState?.bouncer,
    shouldLock: c => (c.data.settings.lock?.type || 'swipe') !== 'none',
    timeout: c => (c.data.settings.screenTimeout ?? -1) < 0 ? -1 : 10000,
    reset(c) { c.ui.lockState = {hint: ''}; },
    render, mount,
    back(c) { if (c.ui.lockState?.bouncer) { c.ui.lockState.bouncer = null; if(c.ui.lockState.confirmReturn){c.ui.lockState.confirmReturn=false;c.unlock();}else c.render(); } return true; },
    tick(c, now) {
      if (c.ui.view !== 'lock' || now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      const clock = c.el.viewport.querySelector('.nglk-clock'), date = c.el.viewport.querySelector('.nglk-date');
      if (clock) clock.textContent = clockText(c, now);
      if (date) date.textContent = dateText(c, !!NG.clock?.nextAlarm(c), now);
    }
  });
  NG.lockClockText = clockText;
})();
