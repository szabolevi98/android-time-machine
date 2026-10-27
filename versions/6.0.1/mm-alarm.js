/* Android 6.0.1 Clock alerts (PrebuiltDeskClockGoogle 4.2.1 of MTC20K, its AlarmStateManager, AlarmActivity,
   AlarmNotifications and TimerReceiver / TimerAlertFullScreen), the screens 'alarm-alert' and 'timer-alert':
   - An alarm that is on fires at its minute (a one-off switches itself off); a snoozed one fires again after Snooze length
   (snooze_duration, 10 minutes), the "Snoozing until" notification (alarm_alert_snooze_until with AlarmUtils'
   getFormattedTime, skeleton Ehma / EHm) waiting meanwhile.
   - AlarmActivity (alarm_activity.xml in AlarmAlertFullScreenTheme, shown over the keyguard and turning the screen on):
   the window in the hour's colour; the label or default_label (header 24 sp bold), the TextClock in big_thin (70 sp
   sans-serif-thin, AM / PM 32 sp); in the bottom row the snooze (ic_snooze_white_80dp on bg_circle_accent) and dismiss
   (ic_alarm_off_white_80dp on bg_circle_white) buttons at 0.7 scale with their backgrounds hidden, and between them the
   alarm button (ic_fab_alarm, 16 / 48 dp padding) over CircleView's pulse (128 dp, white fading out, 1 s, repeated).
   Dragging the alarm button towards a button grows that button, shows its background and tints the dismiss icon in the
   hour's colour; letting go on it snoozes or dismisses, anywhere else it springs back. A touch on snooze or dismiss
   shows the hint (description_direction_left / _right, 16 sp, 40 dp from the bottom). Snooze reveals the accent colour
   from the button with "Snoozed" and alarm_alert_snooze_duration, dismiss reveals white with "Alarm off"; the screen
   closes 2 s later. Back does nothing.
   - While it rings, AlarmNotifications' notification (the label, the alarm's time) brings the screen back; Silence after
   (auto_silence, 10 minutes, -1 Never) stops it and posts alarm_missed_title / alarm_missed_text; the volume keys do
   what Volume buttons says (volume_button_setting: 0 nothing, 1 snooze, 2 dismiss). The vibration (AlarmKlaxon's 500 ms
   on / 500 ms off) goes through navigator.vibrate; the simulator plays no sound.
   - The timer (the Clock app's c.data.clock.timer): run out, TimerReceiver posts timer_times_up under
   timer_notification_label and TimerAlertFullScreen shows the timer in timer_full_screen_fragment: the circle and the
   time past the end counting up with a minus, ic_plusone (timer_plus_1_min) adding a minute, the FAB's ic_stop_white_24dp
   (timer_stop) ending it.
   On the phone a ringing alarm or timer over an unlocked screen in use comes as a heads-up notification with its
   actions; the simulator's notification rows have no action buttons, so the full screen opens in every case. */
(() => {
  'use strict';
  const T = () => MM.text('clock');
  const A = n => `assets/dc-${n}.png`;
  const S = c => c.data.clock || {alarms: []};
  const pref = (c, key, def) => MM.appPref(c, 'clock', key, def);
  const label = (c, a) => a?.label || T().t('default_label');
  // AlarmUtils.getFormattedTime: the weekday and the time (skeleton Ehma, or EHm in 24-hour time).
  const formatted = (c, ms) => new Intl.DateTimeFormat(c.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !MM.clock24(c)}).format(new Date(ms));
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
    const sn = S(c).snooze; if (sn) { MM.notifications?.cancel(c, sn.note); S(c).snooze = null; }
    st.note = MM.notify(c, {app: 'clock', title: st.label, text: formatted(c, Date.now()), open: ['alarm-alert'], heads: false})?.id;
    c.save(); MM.system?.changed(c);
    vibrate(st.vibrate);
    show(c, 'alarm-alert');
  }
  function done(c, how) {
    const st = c.ui.alarmAlert; if (!st || st.phase !== 'ring') return;
    vibrate(false);
    MM.notifications?.cancel(c, st.note);
    const t = T();
    if (how === 'snooze') {
      const m = +pref(c, 'snooze_duration', 10) || 10, until = Date.now() + m * 60000;
      S(c).snooze = {id: st.id, until, label: st.label};
      S(c).snooze.note = MM.notify(c, {app: 'clock', title: st.label, text: AndroidStrings.format(t.t('alarm_alert_snooze_until'), formatted(c, until)), open: ['clock'], heads: false})?.id;
      st.phase = 'snoozed'; st.info = t.plural('alarm_alert_snooze_duration', m, null, m);
    } else if (how === 'missed') {
      MM.notify(c, {app: 'clock', title: t.t('alarm_missed_title'), text: AndroidStrings.format(t.t('alarm_missed_text'), formatted(c, st.at), st.label), open: ['clock'], heads: false});
      c.ui.alarmAlert = null; c.save(); leave(c); return;
    } else st.phase = 'off';
    c.save();
    if (c.ui.view !== 'alarm-alert') { c.ui.alarmAlert = null; return; }
    c.transition('none'); c.render();
    setTimeout(() => { if (c.ui.alarmAlert === st) { c.ui.alarmAlert = null; if (c.ui.view === 'alarm-alert') leave(c); } }, 2000);
  }
  function timerOut(c) {
    const tm = S(c).timer; tm.expired = tm.end; c.save();
    c.ui.timerNote = MM.notify(c, {app: 'clock', title: T().t('timer_notification_label'), text: T().t('timer_times_up'), open: ['timer-alert'], heads: false})?.id;
    show(c, 'timer-alert');
  }
  function timerDone(c, more) {
    const s = S(c); MM.notifications?.cancel(c, c.ui.timerNote); c.ui.timerNote = null;
    s.timer = more ? {total: (s.timer?.total || 0) + 60000, left: 60000, end: Date.now() + 60000} : null;
    c.save(); leave(c);
  }

  // -- AlarmActivity --------------------------------------------------------------------------------------------------
  function alarmScreen(c) {
    const t = T(), st = c.ui.alarmAlert, now = new Date(), color = MM.clockHourColor();
    if (!st) return `<div class="mmal" style="background:${color}"></div>`;
    const icon = (cls, img) => `<i class="mmal-ic ${cls}" style="-webkit-mask-image:url('${A(img)}');mask-image:url('${A(img)}')"></i>`;
    const alert = st.phase !== 'ring' ? `<div class="mmal-reveal ${st.phase}" style="--hour:${color}"><b>${c.safe(t.t(st.phase === 'off' ? 'alarm_alert_off_text' : 'alarm_alert_snoozed_text'))}</b>${st.info ? `<span>${c.safe(st.info)}</span>` : ''}</div>` : '';
    return `<div class="mmal" style="background:${color};--hour:${color}"><div class="mmal-content${st.phase !== 'ring' ? ' gone' : ''}">
      <div class="mmal-title">${c.safe(st.label)}</div><div class="mmal-clock">${MM.clockTimeHtml(c, now.getHours(), now.getMinutes(), 'mmal-ampm')}</div>
      <div class="mmal-row"><i class="mmal-pulse"></i>
        <button type="button" class="mmal-btn snooze" data-action="mmal-hint" data-dir="left" aria-label="${c.safe(t.t('alarm_alert_snooze_text'))}"><i class="mmal-bg"></i>${icon('', 'ic_snooze_white_80dp')}</button>
        <button type="button" class="mmal-alarm" aria-label="${c.safe(t.t('description_direction_both'))}"><img src="${A('ic_fab_alarm')}" alt=""></button>
        <button type="button" class="mmal-btn dismiss" data-action="mmal-hint" data-dir="right" aria-label="${c.safe(t.t('alarm_alert_dismiss_text'))}"><i class="mmal-bg"></i>${icon('', 'ic_alarm_off_white_80dp')}</button>
        <div class="mmal-hint"></div></div></div>${alert}</div>`;
  }
  // The drag (AlarmActivity.onTouch): the fraction of the way from the alarm button's centre to a button's centre.
  function bindDrag(c, root) {
    const btn = root.querySelector('.mmal-alarm'); if (!btn) return;
    const snooze = root.querySelector('.mmal-btn.snooze'), dismiss = root.querySelector('.mmal-btn.dismiss');
    const mid = el => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
    const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const hour = rgb(MM.clockHourColor());
    const paint = (el, f, tint) => {
      el.style.transform = `scale(${0.7 + 0.3 * f})`;
      el.querySelector('.mmal-bg').style.opacity = f;
      if (tint) el.querySelector('.mmal-ic').style.background = `rgb(${hour.map(v => Math.round(255 + (v - 255) * f)).join(',')})`;
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
  MM.register('alarm-alert', {
    app: false,
    statusColor: () => MM.clockHourColor(),
    render: alarmScreen,
    mount(c, root) { bindDrag(c, root); },
    back: () => true,
    keepAwake: () => true,
    tick(c, now) { if (c.ui.view === 'alarm-alert' && c.ui.alarmAlert?.phase === 'ring' && now.getSeconds() === 0) { c.transition('none'); c.render(); } },
    volumeKey(c) { const v = String(pref(c, 'volume_button_setting', '0')); if (v === '1') done(c, 'snooze'); else if (v === '2') done(c, 'dismiss'); return true; },
    action(name, el, event, c) {
      if (name !== 'mmal-hint') return false;
      const hint = c.el.viewport.querySelector('.mmal-hint');
      if (hint) { hint.textContent = T().t(el.dataset.dir === 'left' ? 'description_direction_left' : 'description_direction_right'); hint.classList.remove('on'); void hint.offsetWidth; hint.classList.add('on'); }
      return true;
    }
  });

  // -- TimerAlertFullScreen -------------------------------------------------------------------------------------------
  const pad2 = n => String(n).padStart(2, '0');
  function overText(ms) { const s = Math.floor(ms / 1000); return `-${s >= 3600 ? `${Math.floor(s / 3600)}:${pad2(Math.floor(s / 60) % 60)}` : Math.floor(s / 60)}:${pad2(s % 60)}`; }
  MM.register('timer-alert', {
    app: false,
    statusColor: () => MM.clockHourColor(),
    render(c) {
      const t = T(), tm = S(c).timer, over = tm?.expired ? Date.now() - tm.expired : 0;
      return `<div class="mmck mmal-timer" style="background:${MM.clockHourColor()}">
        <div class="mmck-circlewrap"><div class="mmck-circle done" style="--p:1"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48"/><circle class="arc" cx="50" cy="50" r="48" pathLength="100"/></svg><span class="mmck-ctime">${over >= 0 ? overText(over) : ''}</span></div></div>
        <div class="mmck-footer"><span></span><button type="button" class="mmck-fab" data-action="mmal-tstop" aria-label="${c.safe(t.t('timer_stop'))}"><img src="${A('ic_stop_white_24dp')}" alt=""></button><button type="button" class="mmck-side" data-action="mmal-tplus" aria-label="${c.safe(t.t('timer_plus_1_min'))}"><img src="${A('ic_plusone')}" alt=""></button></div></div>`;
    },
    back: () => true,
    keepAwake: () => true,
    tick(c) { if (c.ui.view === 'timer-alert' && !c.ui.overlay) { c.transition('none'); c.render(); } },
    action(name, el, event, c) {
      if (name === 'mmal-tstop') { timerDone(c, false); return true; }
      if (name === 'mmal-tplus') { timerDone(c, true); return true; }
      return false;
    }
  });

  // -- the clock's tick: alarms, snooze, Silence after, the timer -----------------------------------------------------
  let last = 0;
  MM.register('clock-alerts', {
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
      if (s.snooze && ms >= s.snooze.until) { const a = (s.alarms || []).find(x => x.id === s.snooze.id); if (a) { fire(c, a); return; } MM.notifications?.cancel(c, s.snooze.note); s.snooze = null; c.save(); }
      for (const a of (s.alarms || []).filter(x => x.on)) {
        const at = MM.clockNextFire?.(a, new Date(from - 1));
        if (at && at.getTime() <= ms && at.getTime() > from - 1500) { fire(c, a); return; }
      }
      if (s.timer?.end && !s.timer.expired && ms >= s.timer.end) timerOut(c);
    }
  });
})();
