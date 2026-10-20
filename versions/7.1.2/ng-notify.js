/* Android 7.1.2 notifications: what apps post (NotificationManager), kept in the saved phone (c.data.notifications,
   newest first), shown as small icons in the status bar and as rows in the shade (ng-shade.js).
   - NG.notify(c, {app, icon, title, text, open: [view, sub], heads}) posts one (as a heads-up unless heads is false);
     NG.notifications.cancel(c, id) takes it away.
   - The row is Notification.Builder's notification_template_material_base of N2G48C: the 53 dp NotificationHeaderView
     (paddingTop 10, paddingBottom 16, 16 dp from the start) with the 18 dp small icon, the app's name, "•" and the
     DateTimeView's relative time (showRelative: "now" under a minute, then minutes, hours, days, years in their
     *_shortest plurals); the main column 37.5 dp down (16 dp in from both sides, 16 dp above the bottom) with the title
     (TextAppearance.Material.Notification.Title, 14 sp #de000000) and the text (14 sp #8a000000), each one line. The
     small icon, the app name and the expand button take resolveContrastColor() of the notification's colour
     (notification_icon_default_color #757575 when the app sets none).
   - An app may add to its rows (module.notification(c, n) gives {large, actions}): the large icon
     (notification_template_right_icon.xml: 40 dp, 36 dp down, 16 dp from the end) and, on an expanded row (the first in
     the shade, the heads-up), the actions (notification_material_action_list.xml: 56 dp on #eeeeee, 4 dp at the end;
     notification_material_action.xml: 48 dp borderless buttons 4 dp apart in the notification's colour). An action with
     an input is a RemoteInput: SystemUI's remote_input.xml takes the actions' place in the notification's colour (16 sp
     white text, the #99ffffff hint, ic_send 12 / 24 dp in, the progress while it goes); the app's
     module.notificationAction(c, n, id, text) does the rest.
   - The simulator's own content: a new phone starts with the welcome and Alex's message, as every version
     (docs/demo-data.md); their texts follow the simulator's language (docs/data/ng-own.tsv). */
(() => {
  'use strict';
  const list = c => c.data.notifications || (c.data.notifications = []);
  const T = () => NG.text('shade');
  // The posting apps: the name the header shows and the colour the app gives its notifications (Notification.color).
  const APPS = {
    android: {name: () => T().t('framework/android_system_label'), color: '#757575'},
    // Messenger (PrebuiltBugle 2.0.906): its notifications in primary_color #2a56c6.
    messenger: {name: () => NG.text('apps').t('app_name'), color: '#2a56c6'}
  };
  const appOf = n => APPS[n.app] || {name: () => n.appName || '', color: n.color || '#757575'};

  // DateTimeView.updateRelativeTime (showRelative): now under a minute; minutes and hours by the elapsed time; days by
  // the calendar days between; years after 364 days.
  function relative(c, time) {
    const t = T(), d = Math.abs(Date.now() - time);
    if (d < 60000) return t.t('framework/now_string_shortest');
    if (d < 3600000) return t.plural('framework/duration_minutes_shortest', Math.floor(d / 60000));
    if (d < 86400000) return t.plural('framework/duration_hours_shortest', Math.floor(d / 3600000));
    if (d < 31449600000) {
      const day = x => { const v = new Date(x); return Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()) / 864e5; };
      return t.plural('framework/duration_days_shortest', Math.max(1, Math.abs(day(Date.now()) - day(time))));
    }
    return t.plural('framework/duration_years_shortest', Math.floor(d / 31449600000));
  }

  // One row of the shade (ng-shade.css draws it); expanded, it shows the app's actions.
  let replying = null;
  const extras = (c, n) => NG.module(n.app)?.notification?.(c, n) || null;
  function row(c, n, {expanded = false} = {}) {
    const app = appOf(n), safe = c.safe, x = extras(c, n);
    const large = x?.large ? `<span class="ngnt-right">${x.large}</span>` : '';
    let actions = '';
    if (expanded && x?.actions?.length) {
      const input = replying?.id === n.id && x.actions.find(a => a.id === replying.act && a.input);
      actions = input
        ? `<div class="ngnt-input" data-action="ngnt-input" style="background:${app.color}"><input type="text" class="ngnt-rinput" data-id="${n.id}" data-act="${input.id}" placeholder="${safe(input.input)}" autocomplete="off"${replying.sending ? ' disabled' : ''}>${replying.sending ? '<i class="ngnt-progress"></i>' : `<button type="button" class="ngnt-send" data-action="ngnt-send" data-id="${n.id}" data-act="${input.id}" aria-label="${safe(T().t('framework/ime_action_send'))}"><i></i></button>`}</div>`
        : `<div class="ngnt-actions">${x.actions.map(a => `<button type="button" class="ngnt-act" data-action="ngnt-act" data-id="${n.id}" data-act="${a.id}">${safe(a.label)}</button>`).join('')}</div>`;
    }
    return `<div class="ngnt-row${large ? ' large' : ''}" data-id="${n.id}" data-action="ngnt-open" style="--ngnt-color:${app.color}">
      <div class="ngnt-header"><i class="ngnt-icon" style="-webkit-mask-image:url('${safe(n.icon)}');mask-image:url('${safe(n.icon)}')"></i><span class="ngnt-app">${safe(app.name())}</span><span class="ngnt-sep">${safe(T().t('framework/notification_header_divider_symbol'))}</span><time class="ngnt-time" data-time="${n.time}">${safe(relative(c, n.time))}</time></div>
      <div class="ngnt-main"><div class="ngnt-title">${safe(n.title)}</div><div class="ngnt-text">${safe(n.text)}</div></div>${large}${actions}</div>`;
  }
  // The rows' actions: a plain one runs (and the shade or the heads-up goes); one with an input opens the RemoteInput.
  function redraw(c) {
    if (c.ui.overlay === 'shade') NG.module('shade')?.refresh?.(c);
    const hun = c.el.screen.querySelector('.ngnt-hun .ngnt-row');
    if (hun && shown) {
      hun.outerHTML = row(c, ownTexts(shown), {expanded: true});
      const card = c.el.screen.querySelector('.ngnt-hun .ngnt-row'), note = shown;
      bindSwipe(c, card, dir => { if (dir !== 'up') cancel(c, note.id); hideHeadsUp(c, dir, true); });
    }
    const f = c.el.screen.querySelector('.ngnt-rinput:not([disabled])');
    if (f) { f.focus(); f.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); action('ngnt-send', f, c); } }); }
  }
  function action(name, el, c) {
    if (name === 'ngnt-input') return true;
    const n = list(c).find(x => x.id === +el.dataset.id);
    if (!n) return false;
    const mod = NG.module(n.app), x = extras(c, n), a = x?.actions?.find(y => y.id === el.dataset.act);
    if (name === 'ngnt-act' && a) {
      if (a.input) { replying = {id: n.id, act: a.id}; clearTimeout(timer); redraw(c); return true; }
      if (c.ui.overlay === 'shade') c.closeOverlay();
      hideHeadsUp(c, 'up', true);
      mod?.notificationAction?.(c, n, a.id);
      return true;
    }
    if (name === 'ngnt-send') {
      const text = (c.el.screen.querySelector(`.ngnt-rinput[data-id="${n.id}"]`)?.value || '').trim();
      if (!text) return true;
      replying = {...replying, sending: true}; redraw(c);
      mod?.notificationAction?.(c, n, el.dataset.act, text);
      setTimeout(() => { replying = null; hideHeadsUp(c, 'up', true); cancel(c, n.id); }, 800);
      return true;
    }
    return false;
  }

  function refresh(c) {
    c.renderStatus?.();
    if (c.ui.overlay === 'shade') NG.module('shade')?.refresh?.(c);
    // The keyguard shows the rows too.
    else if (c.ui.view === 'lock' && !c.ui.sleeping && !c.ui.overlay) c.render();
  }
  function notify(c, n) {
    const note = {id: Date.now() + Math.floor(Math.random() * 1000), time: Date.now(), ...n};
    list(c).unshift(note); c.save(); refresh(c);
    if (n.heads !== false) headsUp(c, note);
    return note;
  }
  function cancel(c, id) {
    if (replying?.id === +id) replying = null;
    c.data.notifications = list(c).filter(n => n.id !== +id); c.save(); refresh(c);
  }
  // Tapping a row: its content intent (the screen it opens) and FLAG_AUTO_CANCEL.
  function open(c, id) {
    const n = list(c).find(x => x.id === +id);
    if (!n) return;
    cancel(c, id);
    if (n.open) c.open(n.open[0], n.open[1] || '');
  }

  /* ---- heads-up (HeadsUpManager of N2G48C) ----------------------------------------------------------------------
     A notification posted while the screen is on, unlocked and the shade closed is pinned at the top of the screen
     (StackScrollAlgorithm.updateHeadsUpStates: yTranslation 0, over the status bar), full width. It comes down from
     its own height above in 650 ms along HeadsUpAppearInterpolator (a path overshooting to 1.125 and back by 0.975) and
     goes up again in 230 ms (StackStateAnimator, ANIMATION_TYPE_HEADS_UP_DISAPPEAR) after heads_up_notification_decay
     5 s, shown heads_up_notification_minimum_time 2 s at least. Swiped sideways it is dismissed, pulled up it only stops
     being pinned (its notification stays in the shade). */
  const DP = () => document.querySelector('#screen').clientWidth / (1440 / 3.5);
  // HeadsUpAppearInterpolator's path, x scaled by 1 / 500 ms: three cubics, y read off for x.
  const APPEAR = (() => {
    const segs = [[0, 0, 225, 0, 200, 1.125, 250, 1.125], [250, 1.125, 310, 1.125, 280, .975, 400, .975], [400, .975, 440, .975, 420, 1, 500, 1]]
      .map(s => s.map((v, i) => i % 2 ? v : v / 500));
    const pts = [];
    for (const [x0, y0, x1, y1, x2, y2, x3, y3] of segs) for (let i = 0; i <= 60; i++) {
      const t = i / 60, u = 1 - t;
      pts.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]);
    }
    return x => { const i = pts.findIndex(p => p[0] >= x); if (i <= 0) return i ? 1 : 0; const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (x - a[0]) / ((b[0] - a[0]) || 1); };
  })();
  let shown = null, timer = 0, since = 0;
  function layer(c) {
    let el = c.el.screen.querySelector('.ngnt-hun');
    if (!el) { el = document.createElement('div'); el.className = 'ngnt-hun'; c.el.screen.append(el); }
    return el;
  }
  function headsUp(c, n) {
    if (c.ui.overlay === 'shade' || c.ui.view === 'lock' || c.ui.sleeping || c.ui.power) return;
    const el = layer(c);
    el.innerHTML = row(c, ownTexts(n), {expanded: true});
    const card = el.firstElementChild;
    shown = n; since = Date.now();
    if (card.animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      const h = card.offsetHeight;
      card.animate(Array.from({length: 41}, (_, i) => ({offset: i / 40, transform: `translateY(${(-h * (1 - APPEAR(i / 40))).toFixed(2)}px)`})), {duration: 650, fill: 'backwards'});
    }
    bindSwipe(c, card, dir => { if (dir !== 'up') cancel(c, n.id); hideHeadsUp(c, dir, true); });
    clearTimeout(timer); timer = setTimeout(() => hideHeadsUp(c), 5000);
  }
  function hideHeadsUp(c, dir = 'up', now = false) {
    clearTimeout(timer);
    if (!now && replying && shown && replying.id === shown.id) return;
    const card = c.el.screen.querySelector('.ngnt-hun .ngnt-row'); if (!card) { shown = null; return; }
    if (!now && Date.now() - since < 2000) { timer = setTimeout(() => hideHeadsUp(c, dir), 2000 - (Date.now() - since)); return; }
    shown = null;
    const done = () => card.remove();
    if (!card.animate) { done(); return; }
    if (dir === 'up') card.animate([{transform: 'none', translate: card.style.translate || '0 0'}, {transform: `translateY(${-card.offsetHeight}px)`, translate: card.style.translate || '0 0'}], {duration: 230, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'}).finished.then(done, done);
    else card.animate([{translate: card.style.translate || '0 0'}, {translate: `${dir === 'left' ? -1 : 1}00% 0`}], {duration: 200, easing: 'linear', fill: 'forwards'}).finished.then(done, done);
  }

  /* SwipeHelper on a row: it follows the finger sideways without fading (NotificationStackScrollLayout.updateSwipeProgress
     takes the progress, so the row keeps its alpha); past 0.4 of its width (swipedFarEnough) or flung faster than
     SWIPE_ESCAPE_VELOCITY 100 dp/s the way it moved, it flies off (DEFAULT_ESCAPE_ANIMATION_DURATION 200 ms linear, faster
     with the fling's speed down to the distance at that speed), else it snaps back in 150 ms. A heads-up row also goes
     when pulled up. */
  function bindSwipe(c, card, onDismiss, {up = true} = {}) {
    card.addEventListener('pointerdown', e => {
      if (e.button) return;
      const x0 = e.clientX, y0 = e.clientY, w = card.offsetWidth, samples = [[performance.now(), x0]];
      let mode = '';
      const move = ev => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (!mode) { if (Math.hypot(dx, dy) < 8 * DP()) return; mode = Math.abs(dx) > Math.abs(dy) ? 'x' : (up && dy < 0 ? 'y' : 'none'); }
        // A drag that is not a swipe stays the panel's (pulling it on to quick settings).
        if (mode === 'none') return;
        if (mode === 'x') { samples.push([performance.now(), ev.clientX]); if (samples.length > 6) samples.shift(); card.style.translate = `${dx}px 0`; }
        else if (mode === 'y') card.style.translate = `0 ${Math.min(0, dy)}px`;
        ev.preventDefault(); ev.stopPropagation();
      };
      const end = ev => {
        window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', end, true); window.removeEventListener('pointercancel', end, true);
        if (!mode || mode === 'none') return;
        card.dataset.swiped = '1'; setTimeout(() => { delete card.dataset.swiped; }, 0);
        const dx = ev.clientX - x0, dy = ev.clientY - y0, [t0, a] = samples[0], [t1, b] = samples[samples.length - 1];
        const v = t1 > t0 ? (b - a) / (t1 - t0) * 1000 / DP() : 0;
        if (mode === 'y') { if (dy < -26 * DP()) onDismiss('up'); else { card.style.translate = ''; } return; }
        if (Math.abs(dx) > w * .4 || (Math.abs(v) > 100 && Math.sign(v) === Math.sign(dx))) onDismiss(dx < 0 ? 'left' : 'right', v);
        else { card.animate([{translate: `${dx}px 0`}, {translate: '0 0'}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'}); card.style.translate = ''; }
      };
      window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
    });
  }

  NG.notify = (c, n) => notify(c, n);
  NG.notifications = {row, relative, cancel, open, list, bindSwipe, action, hideHeadsUp: c => hideHeadsUp(c, 'up', true)};
  // The simulator's own first-boot notifications, as in every version: the welcome (SystemUI's ic_android, posted as
  // Android System) and Alex's message (Messenger's ic_sms_light, opening the thread).
  NG.defaults.notifications = [
    {id: 1, own: 'demo_welcome', app: 'android', icon: 'assets/sui-ic_android.svg', time: Date.now() - 2 * 60000},
    {id: 2, own: 'demo_message', app: 'messenger', icon: 'assets/bg-ic_sms_light.png', person: 1, open: ['messenger', 'conv:1'], time: Date.now() - 61 * 60000}];
  const ownTexts = n => n.own ? {...n, title: T().t(`${n.own}_title`), text: T().t(`${n.own}_text`)} : n;
  (NG.notificationSources ||= []).push(c => list(c).map(ownTexts));

  NG.register('notify', {
    app: false, render: () => '',
    // Locking, sleeping or pulling the shade takes a heads-up away (its notification stays in the shade).
    tick(c) { if (shown && (c.ui.view === 'lock' || c.ui.sleeping || c.ui.overlay === 'shade')) hideHeadsUp(c, 'up', true); },
    init(c) {
      // The heads-up row is the screen's, not a module's, so its clicks come here.
      c.el.screen.addEventListener('click', e => {
        const hun = e.target.closest('.ngnt-hun .ngnt-row');
        if (!hun || hun.dataset.swiped) return;
        e.stopPropagation();
        const act = e.target.closest('[data-action="ngnt-act"],[data-action="ngnt-send"],[data-action="ngnt-input"]');
        if (act) { action(act.dataset.action, act, c); return; }
        hideHeadsUp(c, 'up', true); open(c, hun.dataset.id);
      }, true);
    }
  });
})();
