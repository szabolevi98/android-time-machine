/* Android 2.3.6 keyguard: keyguard_screen_tab_unlock.xml with the SlidingTab widget (LockScreen.java), plus the shared
   pieces of the pattern and password unlock screens. hdpi px x 0.575, 1 dp = 0.8625px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // SlidingTab: THRESHOLD = 2/3, ANIM_DURATION = 250 ms, ANIM_TARGET_TIME = 500 ms, VIBRATE_SHORT = 30 ms.
  const THRESHOLD = 2 / 3, ANIM = 250;

  // DigitalClock: Clockopia digits, "h:mm" with a Droid Sans Bold AM/PM, or "kk:mm" (1-24) without it.
  function time(date, hour24) {
    const h = date.getHours(), m = String(date.getMinutes()).padStart(2, '0');
    return hour24 ? {time: `${String(h || 24).padStart(2, '0')}:${m}`, ampm: ''} : {time: `${h % 12 || 12}:${m}`, ampm: h < 12 ? 'AM' : 'PM'};
  }
  const statusLine = (icon, text, cls = '') => `<div class="gbkg-status ${cls}"><img src="assets/${icon}" alt="">${e(text)}</div>`;
  const clock = parts => `<div class="gbkg-clock" data-no-translate><span class="gbkg-time">${e(parts.time)}</span>${parts.ampm ? `<span class="gbkg-ampm">${e(parts.ampm)}</span>` : ''}</div>`;

  // LockScreen right tab: ic_jog_dial_sound_on (normal) or the yellow sound-off / vibrate dial when silent.
  function rightTab(parts) {
    if (!parts.silent) return {icon: 'gb-ic_jog_dial_sound_on.png', target: 'gb-jog_tab_target_gray.png', confirm: 'gray', hint: parts.t('Sound off')};
    return {icon: parts.vibrate ? 'gb-ic_jog_dial_vibrate_on.png' : 'gb-ic_jog_dial_sound_off.png', target: 'gb-jog_tab_target_yellow.png', confirm: 'yellow', hint: parts.t('Sound on')};
  }
  function slideScreen(parts) {
    const right = rightTab(parts);
    const toast = parts.toast ? `<div class="gbkg-toast" style="color:${parts.toast.color}"><img src="assets/${parts.toast.icon}" alt="">${e(parts.toast.text)}</div>` : '';
    return `<div class="lock-view gbkg gbkg-tab-screen"><div class="gbkg-carrier">${e(parts.carrier)}</div>${clock(parts)}<div class="gbkg-date">${e(parts.date)}</div>${parts.alarm ? statusLine('gb-ic_lock_idle_alarm.png', parts.alarm) : ''}<div class="gbkg-locked" aria-live="polite">${toast}</div>
      <div class="gbkg-tabs" data-gb-tabs>
        <div class="gbkg-slider gbkg-left" data-side="left"><img class="gbkg-target" src="assets/gb-jog_tab_target_green.png" alt=""><span class="gbkg-bar"><span>${e(parts.t('Unlock'))}</span></span><button class="gbkg-tab" data-gb-tab="left" aria-label="${e(parts.t('Unlock'))}"><img src="assets/gb-ic_jog_dial_unlock.png" alt=""></button></div>
        <div class="gbkg-slider gbkg-right" data-side="right" data-confirm="${right.confirm}"><img class="gbkg-target" src="assets/${right.target}" alt=""><span class="gbkg-bar"><span>${e(right.hint)}</span></span><button class="gbkg-tab" data-gb-tab="right" aria-label="${e(right.hint)}"><img src="assets/${right.icon}" alt=""></button></div>
      </div></div>`;
  }

  /* SlidingTab touch handling: grabbing a tab shows its target and hides the other slider; the tab (and its hint bar)
     follows the finger; crossing the threshold activates it and slides it away; releasing early snaps it back. Leaving
     the view's tracking area (50 px above or below) counts as a release. */
  function slidingTab(root, {onTrigger, haptic, reduced}) {
    const tabs = root?.querySelector('[data-gb-tabs]');
    if (!tabs) return {destroy() {}};
    let drag = null;
    const sliders = {left: tabs.querySelector('.gbkg-left'), right: tabs.querySelector('.gbkg-right')};
    const move = (slider, dx, duration = 0, ease = 'linear') => {
      for (const node of slider.querySelectorAll('.gbkg-tab,.gbkg-bar')) {
        node.style.transition = duration && !reduced ? `transform ${duration}ms ${ease}` : 'none';
        node.style.transform = dx ? `translateX(${dx}px)` : '';
      }
    };
    const width = () => tabs.clientWidth, tabWidth = () => sliders.left.querySelector('.gbkg-tab').offsetWidth;
    const down = event => {
      const tab = event.target.closest('[data-gb-tab]'); if (!tab || drag || event.button) return;
      event.preventDefault(); event.stopPropagation();
      const side = tab.dataset.gbTab, slider = sliders[side], other = sliders[side === 'left' ? 'right' : 'left'];
      drag = {side, slider, other, id: event.pointerId, rect: tabs.getBoundingClientRect(), scale: tabs.clientWidth / tabs.getBoundingClientRect().width};
      try { tabs.setPointerCapture(event.pointerId); } catch {}
      if (haptic?.()) navigator.vibrate?.(30);
      slider.classList.add('gbkg-pressed', 'gbkg-show-target');
      // Slider.hide(): the other tab slides off its own edge.
      move(other, side === 'left' ? tabWidth() : -tabWidth(), ANIM);
      other.classList.add('gbkg-hidden');
    };
    const pointerMove = event => {
      if (!drag || event.pointerId !== drag.id) return;
      event.preventDefault();
      const x = (event.clientX - drag.rect.left) * drag.scale, y = (event.clientY - drag.rect.top) * drag.scale;
      const margin = 50 * width() / 480, h = tabs.clientHeight;
      if (y < -margin || y > h + margin) { release(); return; }
      const w = width(), tw = tabWidth();
      // moveHandle: the tab's centre follows the finger.
      const rest = drag.side === 'left' ? tw / 2 : w - tw / 2;
      move(drag.slider, x - rest);
      const reached = drag.side === 'left' ? x > THRESHOLD * w : x < (1 - THRESHOLD) * w;
      if (reached) trigger();
    };
    const trigger = () => {
      const {side, slider} = drag, w = width(), tw = tabWidth();
      drag = null;
      slider.classList.remove('gbkg-pressed'); slider.classList.add('gbkg-active');
      if (haptic?.()) navigator.vibrate?.(40);
      // startAnimating: the left tab slides off the right edge and stays (hold); the right one slides off and resets.
      const current = new DOMMatrixReadOnly(getComputedStyle(slider.querySelector('.gbkg-tab')).transform).m41;
      move(slider, side === 'left' ? current + w * 2 : current - (w * 2 - tw), ANIM);
      setTimeout(() => onTrigger?.(side), reduced ? 0 : ANIM);
      if (side === 'right') setTimeout(() => reset(true), ANIM * 2);
    };
    const reset = fade => {
      for (const slider of Object.values(sliders)) {
        slider.classList.remove('gbkg-pressed', 'gbkg-active', 'gbkg-show-target', 'gbkg-hidden');
        move(slider, 0, slider.classList.contains('gbkg-hidden') ? ANIM : 0);
        if (fade && !reduced) slider.animate?.([{opacity: .5}, {opacity: 1}], {duration: ANIM});
      }
    };
    const release = () => {
      if (!drag) return;
      const {slider, other} = drag; drag = null;
      slider.classList.remove('gbkg-pressed', 'gbkg-show-target');
      move(slider, 0);                 // reset(false): snap back
      other.classList.remove('gbkg-hidden');
      move(other, 0, ANIM);            // show(true): slide back in
    };
    tabs.addEventListener('pointerdown', down);
    tabs.addEventListener('pointermove', pointerMove);
    tabs.addEventListener('pointerup', release);
    tabs.addEventListener('pointercancel', release);
    // Keyboard: Enter/Space on a tab triggers it, as the accessibility path does.
    tabs.addEventListener('click', event => {
      const tab = event.target.closest('[data-gb-tab]'); if (!tab || event.detail !== 0) return;
      event.preventDefault(); drag = {side: tab.dataset.gbTab, slider: sliders[tab.dataset.gbTab], other: sliders[tab.dataset.gbTab === 'left' ? 'right' : 'left']}; trigger();
    });
    return {destroy() { drag = null; }};
  }

  window.GBKeyguard = {THRESHOLD, time, clock, statusLine, slideScreen, slidingTab, rightTab};
})();

/* The lock screen of Android 2.3.6 as a module (docs/plans/engine-migration.md): LockScreen's SlidingTab (unlock on the
   left, sound on the right, the toast of the sound tab) over the carrier, the time, the date and the next alarm, and
   for a PIN or password lock the password screen behind it; a pattern lock opens straight on the pattern
   (lockscreen.js: ICSLockscreen.controller, which the shell keeps as lockControls). */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  let gbTabs = null;
  // The shell's bindings the screen's code uses, and its helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderStatus, viewport, deviceDate, lockControls, home, reducedMotion} = c, gbLockDate = c.lockDate;
    // Next alarm as NEXT_ALARM_FORMATTED ("EEE h:mm aa" or "EEE k:mm") and the lock screen date (full_wday_month_day_no_year).
    function nextAlarmLabel() {
      const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
      if (!next) return '';
      const day = next.toLocaleDateString(i18n.locale(), {weekday: 'short'}), h = next.getHours(), m = String(next.getMinutes()).padStart(2, '0');
      return data.settings.hour24 ? `${day} ${h}:${m}` : `${day} ${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
    }
    /* LockPatternKeyguardView.getInitialMode: a pattern lock opens straight on the pattern screen; PIN and password locks
       show the SlidingTab lock screen first and its unlock tab leads to the password screen. */
    function renderLock() {
      if (ui.locked && (data.settings.screenLock === 'pattern' || ui.gbPasswordEntry)) return lockControls.renderLock();
      return GBKeyguard.slideScreen({t: key => i18n.t(key), carrier: data.settings.airplane ? i18n.t('No service.') : data.settings.networkOperator || 'Telekom', ...GBKeyguard.time(deviceDate(), !!data.settings.hour24), date: gbLockDate(), alarm: nextAlarmLabel(), silent: !!data.settings.silent, vibrate: data.settings.silentMode === 'vibrate', toast: ui.gbLockToast});
    }
    function attachGBLock() {
      gbTabs?.destroy(); gbTabs = null;
      const root = viewport.querySelector('.gbkg-tab-screen'); if (!root) return;
      gbTabs = GBKeyguard.slidingTab(root, {haptic: () => data.settings.haptic !== false, reduced: !!reducedMotion?.matches, onTrigger: side => {
        if (ui.view !== 'lock') return;
        c.suppressClick(350);
        if (side === 'left') { if (ui.locked) { ui.gbPasswordEntry = true; render(); } else home(); return; }
        // LockScreen.onTrigger(RIGHT_HANDLE): toggle silent mode (vibrate when "vibrate in silent" is on) and toast it for 3.5 s.
        const silent = !data.settings.silent;
        data.settings.silent = silent;
        if (silent) data.settings.silentMode = data.settings.vibrateSilent === false ? 'silent' : 'vibrate';
        save(); renderStatus();
        ui.gbLockToast = silent ? {text: i18n.t('Sound is OFF'), color: '#ffffff', icon: 'gb-ic_lock_ringer_off.png'} : {text: i18n.t('Sound is ON'), color: '#e69310', icon: 'gb-ic_lock_ringer_on.png'};
        clearTimeout(ui.gbLockToastTimer); ui.gbLockToastTimer = setTimeout(() => { ui.gbLockToast = null; if (ui.view === 'lock') render(); }, 3500);
        render();
      }});
    }
    return {data, ui, render, lockControls, renderLock, attachGBLock};
  }
  window.GB?.register('lock', {
    render: c => shell(c).renderLock(),
    mount: c => shell(c).attachGBLock(),
    // The password screen returns to the lock screen.
    back(c) {
      const {data, ui, render, lockControls} = shell(c);
      if(ui.gbPasswordEntry&&data.settings.screenLock!=='pattern'){ui.gbPasswordEntry=false;lockControls.lock();render();return true;}
      return false;
    },
    action(name, el, c) {
      const {ui, render} = c;
      switch (name) {
        case 'unlock': ui.view = 'home'; render(); break;
        default: return false;
      }
      return true;
    }
  });
})();
