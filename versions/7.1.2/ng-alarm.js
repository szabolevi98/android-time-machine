/* Android 7.1.2 Clock alerts (PrebuiltDeskClockGoogle 4.6.1 of N2G48C: AlarmStateManager, AlarmActivity,
   AlarmNotifications, TimerNotificationBuilder and ExpiredTimersActivity), the screens 'alarm-alert' and 'timer-alert'.
   The logic is 6.0.1's (mm-alarm.js); the APK's resources decide the look:
   - alarm_activity.xml as in 4.2.1, the snooze and dismiss buttons now ic_snooze / ic_dismiss (80 dp vectors) on
   bg_circle_accent / bg_circle_white, the alarm button ic_fab_alarm (56 dp); the same drag, hints, reveal and 2 s.
   - Settings (the Clock's own SettingsActivity, c.data.clock.prefs): Silence after, Snooze length, Volume buttons
   (volume_button_setting: 0 nothing, 1 snooze, 2 dismiss), Timer vibrate.
   - A timer that ran out: timer_times_up under timer_notification_label, and ExpiredTimersActivity
   (expired_timers_activity.xml): the timer's TimerItem, its time past the end counting up with a minus, reset_add's
   ic_plusone (timer_plus_one, a minute more), the FAB's ic_stop_white_24dp (timer_stop).
   On the phone a ringing alarm or timer over an unlocked screen in use comes as a heads-up notification with its
   actions; the simulator opens the full screen in every case, as 6.0.1 does. */
(() => {
  'use strict';
  const T = () => NG.text('clock');
  const A = n => `assets/dc-${n}`;
  const S = c => c.data.clock || {alarms: []};
  const pref = (c, key, def) => (c.data.clock?.prefs || {})[key] ?? def;
  const label = (c, a) => a?.label || T().t('default_label');
  // AlarmUtils.getFormattedTime: the weekday and the time (skeleton Ehma, or EHm in 24-hour time).
  const formatted = (c, ms) => new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !NG.clock24(c)}).format(new Date(ms));
  const accent = '#da4336';
  let vib = 0;
  const vibrate = on => { clearInterval(vib); vib = 0; if (!navigator.vibrate) return; if (on) { navigator.vibrate(500); vib = setInterval(() => navigator.vibrate(500), 1000); } else navigator.vibrate(0); };

  // -- firing ---------------------------------------------------------------------------------------------------------
  function show(c, view) {
    const from = ['alarm-alert', 'timer-alert'].includes(c.ui.view) ? (c.ui.alertFrom || {view: 'home', sub: ''}) : {view: c.ui.view, sub: c.ui.sub};
    c.ui.alertFrom = from;
    if (c.ui.overlay) c.closeOverlay();
    if (c.ui.sleeping) c.wake();
    c.open(view, '', {replace: true});
  }
  function leave(c) {
    vibrate(false);
    const to = c.ui.alertFrom || {view: 'home', sub: ''}; c.ui.alertFrom = null;
    if (to.view === 'lock') { c.ui.view = 'lock'; c.ui.sub = ''; c.render(); }
    else if (to.view === 'home' || !to.view) c.home();
    else c.open(to.view, to.sub, {replace: true});
  }
  function fire(c, a) {
    if (!a.days.length) a.on = false;
    const st = c.ui.alarmAlert = {id: a.id, label: label(c, a), at: Date.now(), phase: 'ring', vibrate: a.vibrate !== false};
    const sn = S(c).snooze; if (sn) { NG.notifications?.cancel(c, sn.note); S(c).snooze = null; }
    st.note = NG.notify(c, {app: 'clock', title: st.label, text: formatted(c, Date.now()), open: ['alarm-alert'], heads: false})?.id;
    c.save(); NG.system?.changed(c);
    vibrate(st.vibrate);
    show(c, 'alarm-alert');
  }
  function done(c, how) {
    const st = c.ui.alarmAlert; if (!st || st.phase !== 'ring') return;
    vibrate(false);
    NG.notifications?.cancel(c, st.note);
    const t = T();
    if (how === 'snooze') {
      const m = +pref(c, 'snooze_duration', 10) || 10, until = Date.now() + m * 60000;
      S(c).snooze = {id: st.id, until, label: st.label};
      S(c).snooze.note = NG.notify(c, {app: 'clock', title: st.label, text: AndroidStrings.format(t.t('alarm_alert_snooze_until'), formatted(c, until)), open: ['clock'], heads: false})?.id;
      st.phase = 'snoozed'; st.info = t.plural('alarm_alert_snooze_duration', m, null, m);
    } else if (how === 'missed') {
      NG.notify(c, {app: 'clock', title: t.t('alarm_missed_title'), text: AndroidStrings.format(t.t('alarm_missed_text'), formatted(c, st.at), st.label), open: ['clock'], heads: false});
      c.ui.alarmAlert = null; c.save(); leave(c); return;
    } else st.phase = 'off';
    c.save();
    if (c.ui.view !== 'alarm-alert') { c.ui.alarmAlert = null; return; }
    c.transition('none'); c.render();
    setTimeout(() => { if (c.ui.alarmAlert === st) { c.ui.alarmAlert = null; if (c.ui.view === 'alarm-alert') leave(c); } }, 2000);
  }
  function timerOut(c) {
    const tm = S(c).timer; tm.expired = tm.end; c.save();
    c.ui.timerNote = NG.notify(c, {app: 'clock', title: T().t('timer_notification_label'), text: T().t('timer_times_up'), open: ['timer-alert'], heads: false})?.id;
    vibrate(!!pref(c, 'timer_vibrate', false));
    show(c, 'timer-alert');
  }
  function timerDone(c, more) {
    const s = S(c); NG.notifications?.cancel(c, c.ui.timerNote); c.ui.timerNote = null;
    s.timer = more ? {total: (s.timer?.total || 0) + 60000, left: 60000, end: Date.now() + 60000} : null;
    c.save(); leave(c);
  }

  // -- AlarmActivity --------------------------------------------------------------------------------------------------
  function alarmScreen(c) {
    const t = T(), st = c.ui.alarmAlert, now = new Date(), color = NG.clockHourColor();
    if (!st) return `<div class="ngal" style="background:${color}"></div>`;
    const icon = (cls, img) => `<i class="ngal-ic ${cls}" style="-webkit-mask-image:url('${A(img)}');mask-image:url('${A(img)}')"></i>`;
    const alert = st.phase !== 'ring' ? `<div class="ngal-reveal ${st.phase}" style="--hour:${color}"><b>${c.safe(t.t(st.phase === 'off' ? 'alarm_alert_off_text' : 'alarm_alert_snoozed_text'))}</b>${st.info ? `<span>${c.safe(st.info)}</span>` : ''}</div>` : '';
    return `<div class="ngal" style="background:${color};--hour:${color}"><div class="ngal-content${st.phase !== 'ring' ? ' gone' : ''}">
      <div class="ngal-title">${c.safe(st.label)}</div><div class="ngal-clock">${NG.clockTimeHtml(c, now.getHours(), now.getMinutes(), 'ngal-ampm')}</div>
      <div class="ngal-row"><i class="ngal-pulse"></i>
        <button type="button" class="ngal-btn snooze" data-action="ngal-hint" data-dir="left" aria-label="${c.safe(t.t('alarm_alert_snooze_text'))}"><i class="ngal-bg"></i>${icon('', 'ic_snooze.svg')}</button>
        <button type="button" class="ngal-alarm" aria-label="${c.safe(t.t('description_direction_both'))}"><img src="${A('ic_fab_alarm.svg')}" alt=""></button>
        <button type="button" class="ngal-btn dismiss" data-action="ngal-hint" data-dir="right" aria-label="${c.safe(t.t('alarm_alert_dismiss_text'))}"><i class="ngal-bg"></i>${icon('', 'ic_dismiss.svg')}</button>
        <div class="ngal-hint"></div></div></div>${alert}</div>`;
  }
  // The drag (AlarmActivity.onTouch): the fraction of the way from the alarm button's centre to a button's centre.
  function bindDrag(c, root) {
    const btn = root.querySelector('.ngal-alarm'); if (!btn) return;
    const snooze = root.querySelector('.ngal-btn.snooze'), dismiss = root.querySelector('.ngal-btn.dismiss');
    const mid = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const hour = rgb(NG.clockHourColor());
    const paint = (el, f, tint) => {
      el.style.transform = `scale(${0.7 + 0.3 * f})`;
      el.querySelector('.ngal-bg').style.opacity = f;
      if (tint) el.querySelector('.ngal-ic').style.background = `rgb(${hour.map(v => Math.round(255 + (v - 255) * f)).join(',')})`;
    };
    paint(snooze, 0); paint(dismiss, 0, true);
    btn.addEventListener('pointerdown', e => {
      if (c.ui.alarmAlert?.phase !== 'ring') return;
      e.preventDefault(); try { btn.setPointerCapture(e.pointerId); } catch {}
      const x0 = e.clientX, c0 = mid(btn), sx = mid(snooze) - c0, dx = mid(dismiss) - c0;
      let fs = 0, fd = 0;
      btn.style.transition = 'none';
      const move = ev => {
        const d = Math.max(sx, Math.min(dx, ev.clientX - x0));
        fs = d < 0 ? Math.min(1, d / sx) : 0; fd = d > 0 ? Math.min(1, d / dx) : 0;
        btn.style.transform = `translateX(${d}px)`; paint(snooze, fs); paint(dismiss, fd, true);
      };
      const up = () => {
        btn.removeEventListener('pointermove', move); btn.removeEventListener('pointerup', up); btn.removeEventListener('pointercancel', up);
        if (fs >= 1) { done(c, 'snooze'); return; }
        if (fd >= 1) { done(c, 'dismiss'); return; }
        btn.style.transition = 'transform 150ms'; btn.style.transform = ''; paint(snooze, 0); paint(dismiss, 0, true);
      };
      btn.addEventListener('pointermove', move); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up);
    });
  }
  NG.register('alarm-alert', {
    app: false,
    statusColor: () => NG.clockHourColor(),
    render: alarmScreen,
    mount(c, root) { bindDrag(c, root); },
    back: () => true,
    keepAwake: () => true,
    tick(c, now) { if (c.ui.view === 'alarm-alert' && c.ui.alarmAlert?.phase === 'ring' && now.getSeconds() === 0) { c.transition('none'); c.render(); } },
    volumeKey(c) { const v = String(pref(c, 'volume_button_setting', '0')); if (v === '1') done(c, 'snooze'); else if (v === '2') done(c, 'dismiss'); return true; },
    action(name, el, event, c) {
      if (name !== 'ngal-hint') return false;
      const hint = c.el.viewport.querySelector('.ngal-hint');
      if (hint) { hint.textContent = T().t(el.dataset.dir === 'left' ? 'description_direction_left' : 'description_direction_right'); hint.classList.remove('on'); void hint.offsetWidth; hint.classList.add('on'); }
      return true;
    }
  });

  // -- TimerAlertFullScreen -------------------------------------------------------------------------------------------
  const pad2 = n => String(n).padStart(2, '0');
  function overText(ms) { const s = Math.floor(ms / 1000); return `-${s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}` : Math.floor(s / 60)}:${pad2(s % 60)}`; }
  NG.register('timer-alert', {
    app: false,
    statusColor: () => NG.clockHourColor(),
    render(c) {
      const t = T(), tm = S(c).timer, over = tm?.expired ? Date.now() - tm.expired : 0;
      return `<div class="ngck ngal-timer" style="background:${NG.clockHourColor()}">
        <div class="ngck-circlewrap"><div class="ngck-circle done" style="--p:1"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="ngck-ctime">${over >= 0 ? overText(over) : ''}</span></div></div>
        <div class="ngck-footer"><span></span><button type="button" class="ngck-fab" data-action="ngal-tstop" aria-label="${c.safe(t.t('timer_stop'))}"><img src="${A('ic_stop_white_24dp.png')}" alt=""></button><button type="button" class="ngck-side" data-action="ngal-tplus" aria-label="${c.safe(t.t('timer_plus_one'))}"><i class="ngck-ic white" style="-webkit-mask-image:url('${A('ic_plusone.svg')}');mask-image:url('${A('ic_plusone.svg')}')"></i></button></div></div>`;
    },
    back: () => true,
    keepAwake: () => true,
    tick(c) { if (c.ui.view === 'timer-alert' && !c.ui.overlay) { c.transition('none'); c.render(); } },
    action(name, el, event, c) {
      if (name === 'ngal-tstop') { timerDone(c, false); return true; }
      if (name === 'ngal-tplus') { timerDone(c, true); return true; }
      return false;
    }
  });

  // -- the clock's tick: alarms, snooze, Silence after, the timer -----------------------------------------------------
  let last = 0;
  NG.register('clock-alerts', {
    app: false,
    render: () => '',
    tick(c, now) {
      if (c.ui.power) return;
      const ms = now.getTime(), from = last || ms; last = ms;
      const s = S(c), st = c.ui.alarmAlert;
      if (st?.phase === 'ring') {
        const after = +pref(c, 'auto_silence', 10);
        if (after > 0 && ms - st.at >= after * 60000) done(c, 'missed');
        return;
      }
      if (st || ['alarm-alert', 'timer-alert'].includes(c.ui.view)) return;
      if (s.snooze && ms >= s.snooze.until) { const a = (s.alarms || []).find(x => x.id === s.snooze.id); if (a) { fire(c, a); return; } NG.notifications?.cancel(c, s.snooze.note); s.snooze = null; c.save(); }
      for (const a of (s.alarms || []).filter(x => x.on)) {
        const at = NG.clock?.nextFire?.(a, new Date(from - 1));
        if (at && at.getTime() <= ms && at.getTime() > from - 1500) { fire(c, a); return; }
      }
      if (s.timer?.end && !s.timer.expired && ms >= s.timer.end) timerOut(c);
    }
  });
})();
