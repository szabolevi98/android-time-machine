/* Android 6.0.1 lock screen (SystemUI.apk's keyguard, MTC20K): the insecure swipe lock the image starts with
   (def_lockscreen_disabled false, no credential).
   - The wallpaper (framework default_wallpaper) behind ScrimController's keyguard scrim: 0.45 black with the panel open.
     The status bar and the navigation bar's keys are hidden (the keyguard disables home, recents and back).
   - keyguard_status_bar.xml (KeyguardStatusBarView, 40 dp): CarrierText 16 dp from the start (14 sp white; "Airplane mode"
     in airplane mode), the system icons in a 60 dp high container (so centred 30 dp down) with the battery level only
     while charging, and the user's avatar (22 dp in a 34 dp switch 3 dp from the end).
   - keyguard_status_view.xml (KeyguardStatusView): the clock (widget_big_thin: sans-serif-light, widget_big_font_size
     96 dp at h560dp, the best "hm" / "Hm" pattern without AM / PM and ':' replaced by U+EE01, Roboto's clock colon),
     10 dp over the date (abbrev_wday_month_day_no_year "EEEEMMMMd", 14 sp, caps, letter spacing 0.15), then the owner
     info; KeyguardClockPositionAlgorithm centres it at keyguard_clock_y_fraction_max 0.325 of the panel without
     notifications.
   - keyguard_bottom_area.xml: the phone (left) and camera (right) KeyguardAffordanceViews and the LockIcon (open: no
     bouncer to pass) 56 dp at the bottom, the italic KeyguardIndicationTextView 65 dp from the bottom.
   - Swiping up more than keyguard_min_swipe_amount (110 dp) unlocks; a tap plays the unlock hint (the panel up
     hint_move_distance 75 dp and back) with "Swipe up to unlock"; a tap on an icon plays its hint ("Swipe from icon for
     phone / camera") and swiping from it opens the app. The hint text goes 1.2 s after the hint.
   - The keyguard window's user activity timeout: 10 s (StatusBarWindowManager, AWAKE_INTERVAL_DEFAULT_MS).
   - Notifications (mm-notify.js): at most keyguard_max_notification_count 3 rows in the dimmed background
     (notification_material_background_dimmed_color #d4ffffff). KeyguardClockPositionAlgorithm moves the clock up with
     them: t = count / (3 + notification_summary_height 44 / notification_min_height 64), the clock's centre at
     (1 - t) x 0.325 + t x 0.198 of the panel and the rows keyguard_clock_notifications_margin 36 dp (none) to 24 dp
     (t = 1) under the status view. A tap activates a row ("Touch again to open", notification_tap_again); the second
     opens it, through the bouncer with a secure lock. */
(() => {
  'use strict';
  const A = name => `assets/${name}`;
  const T = () => MM.text('lock');
  // The panel is the display above the 48 dp navigation bar (683.43 dp on the 5X; taller on a tall phone's page), the
  // clock a fraction of the way down it.
  let hintTimer = 0;

  const is24 = c => c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12;
  // KeyguardStatusView.Patterns: the time without AM / PM and with the clock colon.
  function clockText(c, now = new Date()) {
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${is24(c) ? now.getHours() : now.getHours() % 12 || 12}${mm}`;
  }
  const dateText = (c, now = new Date()) => new Intl.DateTimeFormat(c.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).format(now);

  function render(c) {
    const t = T(), s = c.data.settings, st = c.ui.lockState || (c.ui.lockState = {hint: ''});
    const carrier = s.airplane ? t.t('airplane_mode') : MM.text('shade').t('carrier');
    const b = MM.battery();
    const indication = st.hint || (b.plugged ? t.t(b.level >= 100 ? 'keyguard_charged' : 'keyguard_plugged_in') : '');
    return `<div class="mmlk${st.bouncer ? ' bouncing' : ''}">
      <div class="mmlk-wall"></div><div class="mmlk-scrim"></div>
      <div class="mmlk-panel">
        <div class="mmlk-bar" data-action="mmlk-pull"><span class="mmlk-carrier">${c.safe(carrier)}</span>
          <span class="mmlk-icons"><span class="mmlk-cluster">${MM.signalCluster ? MM.signalCluster(c) : ''}</span><span class="mmlk-batt"></span>${b.plugged ? `<span class="mmlk-level">${c.safe(new Intl.NumberFormat(c.locale(), {style: 'percent'}).format(b.level / 100))}</span>` : ''}</span>
          <span class="mmlk-user"><img src="${A(MM.users ? MM.users.icon(MM.users.current(c)) : 'fw-ic_account_circle-user0.svg')}" alt=""></span></div>
        <div class="mmlk-status" style="top:${(clockFraction(c) * 100).toFixed(2)}%">
          <div class="mmlk-clock">${clockText(c)}</div><div class="mmlk-date">${c.safe(dateText(c))}</div>
          ${s.lock?.ownerInfo ? `<div class="mmlk-owner">${c.safe(s.lock.ownerInfo)}</div>` : ''}</div>
        ${notes(c)}<div class="mmlk-indication">${c.safe(indication)}</div>
        <button type="button" class="mmlk-aff mmlk-phone" data-aff="phone" aria-label="${c.safe(t.t('accessibility_phone_button'))}"><i></i><img src="${A('sui-ic_phone_24dp.png')}" alt=""></button>
        <button type="button" class="mmlk-lock" data-action="mmlk-hint" aria-label="${c.safe(t.t('accessibility_unlock_button'))}"><img src="${A(secure(c) && MM.fingerprint?.enrolled(c) ? 'sui-ic_fingerprint.svg' : secure(c) ? 'sui-ic_lock_24dp.svg' : 'sui-ic_lock_open_24dp.svg')}" alt=""></button>
        <button type="button" class="mmlk-aff mmlk-camera" data-aff="camera" aria-label="${c.safe(t.t('accessibility_camera_button'))}"><i></i><img src="${A('sui-ic_camera_alt_24dp.png')}" alt=""></button>
      </div>${st.bouncer ? bouncer(c) : ''}</div>`;
  }

  const secure = c => ['pin', 'password', 'pattern'].includes(c.data.settings.lock?.type);
  const shownNotes = c => (MM.notifications?.list(c) || []).slice(0, 3);
  const amount = c => shownNotes(c).length / (3 + 44 / 64);
  const clockFraction = c => (1 - amount(c)) * .325 + amount(c) * .198;
  const notes = c => { const list = shownNotes(c); return list.length ? `<div class="mmlk-notes">${list.map(n => MM.notifications.row(c, n)).join('')}</div>` : ''; };

  /* The bouncer (KeyguardBouncer over ScrimController's in-front scrim, black at 0.75): keyguard_host_view's
     KeyguardSecurityContainer at the bottom (BouncerSecurityContainer) above the navigation bar, keyguard_security_width
     320 dp wide, 8 dp of keyguard_security_view_margin above the view:
     - keyguard_pin_view.xml (450 dp high at most): the message area (14 sp, textColorSecondary), the PasswordTextView row
       (9 dp dots password_char_padding 8 dp apart, the ic_backspace_24dp key, a 1 dp #28ffffff divider) and four rows of
       NumPadKey (the digit 36 sp sans-serif-light white, the letters 12 sp at 50 %), the last with 0 and the
       ic_done_wht enter key; keyguard_password_view.xml (400 dp: 7 : 2 spaces around the 280 dp 16 sp field);
       keyguard_pattern_view.xml (400 dp: the LockPatternView in the framework's white with error #f4511e, 8 dp at
       the sides);
     - the emergency button (lockscreen_emergency_call, 14 sp caps, textColorSecondary) at the bottom;
     - a wrong entry: kg_wrong_pin / password / pattern; five in a row lock it for 30 s
       (kg_too_many_failed_attempts_countdown); Back hides the bouncer. */
  const KLONDIKE = ['+', '', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'];
  function bouncer(c) {
    const s = c.data.settings, type = s.lock.type, st = c.ui.lockState, t = T();
    const eca = `<div class="mmbo-eca"><button type="button" class="mmbo-emergency" data-action="mmbo-emergency">${c.safe(t.t('lockscreen_emergency_call'))}</button></div>`;
    const msg = `<div class="mmbo-msg">${c.safe(st.message || '')}</div>`;
    let view;
    if (type === 'pin') {
      const key = d => `<button type="button" class="mmbo-key" data-action="mmbo-digit" data-d="${d}"><span class="mmbo-digit">${d}</span><span class="mmbo-letters">${KLONDIKE[d]}</span></button>`;
      view = `<div class="mmbo-view pin">${msg}<div class="mmbo-rows"><div class="mmbo-row0"><span class="mmbo-entry">${'<i></i>'.repeat((st.entry || '').length)}</span><button type="button" class="mmbo-del" data-action="mmbo-del"><img src="${A('sui-ic_backspace_24dp.svg')}" alt=""></button></div>
        ${[[1, 2, 3], [4, 5, 6], [7, 8, 9]].map(r => `<div class="mmbo-row">${r.map(key).join('')}</div>`).join('')}<div class="mmbo-row"><i></i>${key(0)}<button type="button" class="mmbo-key" data-action="mmbo-enter"><img src="${A('sui-ic_done_wht.png')}" alt=""></button></div></div>${eca}</div>`;
    } else if (type === 'password') {
      view = `<div class="mmbo-view password"><i class="mmbo-space7"></i>${msg}<input class="mmbo-field" type="password" autocomplete="off" spellcheck="false"><i class="mmbo-space2"></i>${eca}</div>`;
    } else view = `<div class="mmbo-view pattern">${msg}<div class="mmbo-pat">${MM.pattern.markup(s.lock.visible === false ? 'mmbo-pattern stealth' : 'mmbo-pattern')}</div>${eca}</div>`;
    return `<div class="mmbo"><div class="mmbo-scrim"></div><div class="mmbo-container${st.lockedUntil > Date.now() ? ' locked' : ''}">${view}</div></div>`;
  }
  function checked(c, ok) {
    const st = c.ui.lockState, t = T(), type = c.data.settings.lock.type;
    if (ok) { st.verified = true; st.fails = 0; const then = st.bouncer; st.bouncer = null; c.unlock(); if (typeof then === 'function') then(); else if (then && then !== 'unlock') c.open(then); return; }
    st.entry = ''; st.fails = (st.fails || 0) + 1;
    st.message = t.t(type === 'pin' ? 'kg_wrong_pin' : type === 'password' ? 'kg_wrong_password' : 'kg_wrong_pattern');
    if (st.fails >= 5) {
      st.fails = 0; st.lockedUntil = Date.now() + 30000;
      const tick = () => {
        if (!c.ui.lockState?.bouncer) return;
        const left = Math.ceil((st.lockedUntil - Date.now()) / 1000), el = c.el.viewport.querySelector('.mmbo-msg');
        if (left <= 0) { st.message = ''; c.render(); return; }
        st.message = t.fmt('kg_too_many_failed_attempts_countdown', null, left); if (el) el.textContent = st.message;
        setTimeout(tick, 1000);
      };
      tick();
    }
    c.render();
  }
  function mountBouncer(c, root) {
    const st = c.ui.lockState, l = c.data.settings.lock, locked = () => st.lockedUntil > Date.now();
    const box = root.querySelector('.mmbo');
    box?.addEventListener('pointerdown', e => e.stopPropagation());
    box?.addEventListener('click', e => {
      const a = e.target.closest('[data-action]')?.dataset.action;
      if (!a) return;
      e.stopPropagation();
      if (locked()) return;
      if (a === 'mmbo-digit') { if ((st.entry || '').length < 16) st.entry = (st.entry || '') + e.target.closest('[data-d]').dataset.d; st.message = ''; c.render(); }
      else if (a === 'mmbo-del') { st.entry = (st.entry || '').slice(0, -1); c.render(); }
      else if (a === 'mmbo-enter') { if (st.entry) checked(c, st.entry === l.secret); }
      else if (a === 'mmbo-emergency') { st.bouncer = null; c.open('emergency-dialer'); }
    });
    const field = root.querySelector('.mmbo-field');
    if (field) {
      field.disabled = locked();
      field.addEventListener('keydown', e => { if (e.key === 'Enter' && field.value) { e.preventDefault(); checked(c, field.value === l.secret); } });
      setTimeout(() => field.focus(), 30);
    }
    const pat = root.querySelector('.mmbo-pattern');
    if (pat) {
      MM.pattern.init(pat);
      MM.pattern.bind(pat, {enabled: () => !locked(), onStart: () => { st.message = ''; const m = root.querySelector('.mmbo-msg'); if (m) m.textContent = ''; },
        onDone: cells => {
          if (cells.join('') === l.secret) { MM.pattern.show(pat, cells, 'correct'); checked(c, true); }
          else { MM.pattern.show(pat, cells, 'wrong'); setTimeout(() => checked(c, false), 600); }
        }});
    }
  }

  function setHint(c, root, text) {
    const st = c.ui.lockState; st.hint = text;
    const el = root.querySelector('.mmlk-indication'); if (el) el.textContent = text;
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => { st.hint = ''; const e = c.el.viewport.querySelector('.mmlk-indication'); if (e) e.textContent = ''; }, 1800);
  }

  function unlock(c, root, then) {
    const panel = root.querySelector('.mmlk-panel'), lk = root.querySelector('.mmlk');
    // A secure lock shows the bouncer first (the camera opens in its secure mode without it).
    if (secure(c) && then !== 'camera' && !c.ui.lockState.verified) {
      c.ui.lockState.bouncer = then || 'unlock'; c.render(); return;
    }
    lk?.classList.add('leaving');
    if (panel) panel.style.transform = 'translateY(-100%)';
    setTimeout(() => { c.unlock(); if (typeof then === 'function') then(); else if (then) c.open(then); }, 260);
  }

  function mount(c, root) {
    if (c.ui.lockState?.bouncer) mountBouncer(c, root);
    const slot = root.querySelector('.mmlk-batt'); if (slot && MM.batteryMeter) slot.innerHTML = MM.batteryMeter();
    const lk = root.querySelector('.mmlk'), panel = root.querySelector('.mmlk-panel');
    if (!lk || !panel) return;
    const dpPx = () => c.el.screen.clientWidth / 411.4286;
    // The rows start under the status view (its centre is at the clock fraction) by the clock-notifications margin.
    const status = root.querySelector('.mmlk-status'), list = root.querySelector('.mmlk-notes');
    if (status && list) list.style.top = `${status.offsetTop + status.offsetHeight / 2 + (amount(c) * 24 + (1 - amount(c)) * 36) * dpPx()}px`;
    let drag = null;
    lk.addEventListener('pointerdown', e => {
      if (e.button) return;
      const aff = e.target.closest('.mmlk-aff');
      drag = {x: e.clientX, y: e.clientY, aff: aff?.dataset.aff || '', el: aff, moved: false, top: e.target.closest('.mmlk-bar')};
      try { lk.setPointerCapture(e.pointerId); } catch {}
    });
    lk.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = (e.clientX - drag.x) / dpPx(), dy = (e.clientY - drag.y) / dpPx();
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) drag.moved = true;
      if (drag.aff) {
        const along = drag.aff === 'phone' ? Math.max(0, dx) : Math.min(0, dx);
        drag.el.style.transform = `translateX(calc(${along.toFixed(1)} * var(--dp)))`;
        drag.el.style.setProperty('--grow', Math.min(1, Math.abs(along) / 110).toFixed(3));
        drag.el.classList.add('dragging');
      } else if (!drag.top && dy < 0) {
        panel.style.transition = 'none';
        panel.style.transform = `translateY(calc(${dy.toFixed(1)} * var(--dp)))`;
        panel.style.opacity = String(Math.max(0, 1 + dy / 300));
      }
    });
    const end = e => {
      if (!drag) return;
      const d = drag; drag = null;
      const dx = (e.clientX - d.x) / dpPx(), dy = (e.clientY - d.y) / dpPx();
      if (d.aff) {
        d.el.classList.remove('dragging'); d.el.style.transform = ''; d.el.style.removeProperty('--grow');
        const along = d.aff === 'phone' ? dx : -dx;
        if (along >= 110) { unlock(c, root, d.aff); return; }
        if (!d.moved) affordanceHint(c, root, d.el, d.aff);
        return;
      }
      if (d.top && dy > 40) { MM.module('shade')?.open(c); return; }
      const note = !d.moved && document.elementFromPoint(e.clientX, e.clientY)?.closest('.mmlk-notes .mmnt-row');
      if (note) {
        if (note.classList.contains('active')) { const id = note.dataset.id; unlock(c, root, () => MM.notifications.open(c, id)); return; }
        root.querySelectorAll('.mmlk-notes .mmnt-row.active').forEach(x => x.classList.remove('active'));
        note.classList.add('active'); setHint(c, root, T().t('notification_tap_again'));
        clearTimeout(note.timer); note.timer = setTimeout(() => note.classList.remove('active'), 1800);
        return;
      }
      panel.style.transition = ''; panel.style.opacity = '';
      if (dy <= -110) { unlock(c, root); return; }
      panel.style.transform = '';
      if (!d.moved) unlockHint(c, root);
    };
    lk.addEventListener('pointerup', end);
    lk.addEventListener('pointercancel', e => { if (drag) { drag = null; panel.style.transform = ''; panel.style.opacity = ''; } });
  }

  // PanelView.startUnlockHintAnimation: up by hint_move_distance and back down with a bounce.
  function unlockHint(c, root) {
    const panel = root.querySelector('.mmlk-panel');
    setHint(c, root, T().t('keyguard_unlock'));
    panel.classList.remove('hinting'); void panel.offsetWidth; panel.classList.add('hinting');
  }
  // KeyguardAffordanceHelper.startHintAnimation: the icon moves sideways and back.
  function affordanceHint(c, root, el, which) {
    setHint(c, root, T().t(which === 'phone' ? 'phone_hint' : 'camera_hint'));
    el.classList.remove('hinting'); void el.offsetWidth; el.classList.add('hinting');
  }

  let lastMinute = -1;
  MM.register('lock', {
    app: false,
    refreshNotes(c) { if (!c.ui.lockState?.bouncer) c.render(); },
    noStatus: () => true, noNav: c => !c.ui.lockState?.bouncer,
    shouldLock: c => (c.data.settings.lock?.type || 'swipe') !== 'none',
    timeout: c => (c.data.settings.screenTimeout ?? -1) < 0 ? -1 : 10000,
    reset(c) { c.ui.lockState = {hint: ''}; },
    render, mount,
    back(c) { if (c.ui.lockState?.bouncer) { c.ui.lockState.bouncer = null; c.render(); } return true; },
    action(name, el, event, c) {
      if (name === 'mmlk-hint') return true;   // handled by the gesture code
      if (name === 'mmlk-pull') return true;
      return false;
    },
    tick(c, now) {
      if (c.ui.view !== 'lock' || now.getMinutes() === lastMinute) return;
      lastMinute = now.getMinutes();
      const clock = c.el.viewport.querySelector('.mmlk-clock'), date = c.el.viewport.querySelector('.mmlk-date');
      if (clock) clock.textContent = clockText(c, now);
      if (date) date.textContent = dateText(c, now);
    }
  });
})();
