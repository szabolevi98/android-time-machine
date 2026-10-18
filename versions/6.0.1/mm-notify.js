/* Android 6.0.1 notifications: what apps post (NotificationManager), shown in the status bar, the shade (mm-shade.js),
   on the keyguard and as heads-up notifications (SystemUI's HeadsUpManager).
   - MM.notify(c, {app, icon, title, text, person, open: [view, sub], heads}) posts one: kept in the saved phone
     (c.data.notifications), newest first; its small icon goes in the status bar, its row in the shade
     (notification_template_material_base: a 40 dp circle in the app's colour with the small icon, or the person's
     letter tile with the small icon in a 16 dp badge (right_icon), the title, the time and the text). Tapping it opens
     its screen and cancels it (FLAG_AUTO_CANCEL); a swipe or Clear all removes it.
   - Heads-up (a message's priority is high): over the running app, unless the shade is open or the phone is locked or
     asleep, the row appears at the top 8 dp in from the sides (notification_side_padding), sliding down from above its
     own height in 650 ms (ANIMATION_DURATION_HEADS_UP_APPEAR, HeadsUpAppearInterpolator) and going back up in 230 ms
     (ANIMATION_DURATION_HEADS_UP_DISAPPEAR) after heads_up_notification_decay 5 s, at least heads_up_notification_
     minimum_time 2 s; swiped up or sideways it goes at once, tapped it opens.
   - The simulator's own content: a demo contact answers a text (Messenger) or a chat (Hangouts) once a session, 4.5 s
     after it was sent, as in the other versions. */
(() => {
  'use strict';
  const list = c => c.data.notifications || (c.data.notifications = []);
  const color = id => MM.appsData?.[id]?.color || '#607d8b';
  const DP = () => { const s = document.querySelector('#screen'); return s?.clientWidth ? s.clientWidth / 411.43 : .833; };

  // HeadsUpAppearInterpolator: three cubic segments of a path, overshooting to 90 / 80 and settling back through 78 / 80.
  const APPEAR = (() => {
    const x1 = 250, x2 = 150, x3 = 100, y1 = 90, y2 = 78, y3 = 80, tot = x1 + x2 + x3;
    const segs = [
      [[0, 0], [x1 * .9 / tot, 0], [x1 * .8 / tot, y1 / y3], [x1 / tot, y1 / y3]],
      [[x1 / tot, y1 / y3], [(x1 + x2 * .4) / tot, y1 / y3], [(x1 + x2 * .2) / tot, y2 / y3], [(x1 + x2) / tot, y2 / y3]],
      [[(x1 + x2) / tot, y2 / y3], [(x1 + x2 + x3 * .4) / tot, y2 / y3], [(x1 + x2 + x3 * .2) / tot, 1], [1, 1]]
    ];
    const pts = [];
    for (const [p0, p1, p2, p3] of segs) for (let i = 0; i <= 40; i++) {
      const t = i / 40, u = 1 - t, b = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
      pts.push([b[0] * p0[0] + b[1] * p1[0] + b[2] * p2[0] + b[3] * p3[0], b[0] * p0[1] + b[1] * p1[1] + b[2] * p2[1] + b[3] * p3[1]]);
    }
    pts.sort((a, b) => a[0] - b[0]);
    return t => { let i = pts.findIndex(p => p[0] >= t); if (i <= 0) return pts[Math.max(0, i)][1]; const [a, b] = [pts[i - 1], pts[i]]; return a[1] + (b[1] - a[1]) * (t - a[0]) / ((b[0] - a[0]) || 1); };
  })();

  // The row (notification_template_material_base), shared by the shade, the keyguard and the heads-up.
  function row(c, n, extra = '') {
    const person = n.person ? MM.people?.byId(c, n.person) : null;
    const icon = person ? `<span class="mmnt-large">${MM.people.tile(c, person, 'mmnt-tile')}<i class="mmnt-badge" style="background:${color(n.app)}"><img src="${c.safe(n.icon)}" alt=""></i></span>`
      : `<span class="mmsh-nicon" style="background:${color(n.app)}"><img src="${c.safe(n.icon)}" alt=""></span>`;
    const time = new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(new Date(n.time));
    return `<div class="mmsh-note mmnt-row" data-id="${n.id}" data-action="mmnt-open"${extra}><div class="mmsh-nmain">${icon}<span class="mmsh-ntexts"><span class="mmnt-line1"><b>${c.safe(n.title)}</b><time>${c.safe(time)}</time></span><small>${c.safe(n.text)}</small></span></div></div>`;
  }

  function refresh(c) {
    c.renderStatus?.();
    if (c.ui.overlay === 'shade') MM.module('shade')?.refresh?.(c);
    if (c.ui.view === 'lock') MM.module('lock')?.refreshNotes?.(c);
  }

  function notify(c, n) {
    const note = {id: Date.now() + Math.floor(Math.random() * 1000), time: Date.now(), ...n};
    list(c).unshift(note); c.save(); refresh(c);
    if (n.heads !== false) headsUp(c, note);
    return note;
  }
  function cancel(c, id) {
    const before = list(c).length;
    c.data.notifications = list(c).filter(n => n.id !== +id);
    if (c.data.notifications.length !== before) { c.save(); refresh(c); }
    if (shown?.id === +id) hideHeadsUp(c, 'up', true);
  }
  function open(c, id) {
    const n = list(c).find(x => x.id === +id); if (!n) return;
    cancel(c, id);
    if (c.ui.overlay) c.closeOverlay();
    if (n.open) c.open(n.open[0], n.open[1] || '');
  }

  // ---- heads-up ---------------------------------------------------------------------------------------------------
  let shown = null, timer = 0, since = 0;
  function layer(c) {
    let el = c.el.screen.querySelector('.mmnt-hun');
    if (!el) { el = document.createElement('div'); el.className = 'mmnt-hun'; c.el.screen.append(el); }
    return el;
  }
  function headsUp(c, n) {
    if (c.ui.overlay === 'shade' || c.ui.view === 'lock' || c.ui.sleeping || c.ui.power) return;
    const el = layer(c);
    el.innerHTML = row(c, n);
    const card = el.firstElementChild;
    shown = n; since = Date.now();
    if (card.animate && !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      const h = card.offsetHeight + 8 * DP();
      card.animate(Array.from({length: 26}, (_, i) => ({offset: i / 25, transform: `translateY(${(-h * (1 - APPEAR(i / 25))).toFixed(2)}px)`})), {duration: 650, fill: 'backwards'});
    }
    bindSwipe(c, card, dir => hideHeadsUp(c, dir, true));
    clearTimeout(timer); timer = setTimeout(() => hideHeadsUp(c), 5000);
  }
  function hideHeadsUp(c, dir = 'up', now = false) {
    clearTimeout(timer);
    const card = c.el.screen.querySelector('.mmnt-hun .mmnt-row'); if (!card) { shown = null; return; }
    if (!now && Date.now() - since < 2000) { timer = setTimeout(() => hideHeadsUp(c, dir), 2000 - (Date.now() - since)); return; }
    shown = null;
    const done = () => card.remove();
    if (!card.animate) { done(); return; }
    if (dir === 'up') card.animate([{transform: getComputedStyle(card).transform === 'none' ? 'none' : getComputedStyle(card).transform}, {transform: `translateY(${-card.offsetHeight - 8 * DP()}px)`}], {duration: 230, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards'}).finished.then(done, done);
    else card.animate([{translate: card.style.translate || '0 0', opacity: card.style.opacity || 1}, {translate: `${dir === 'left' ? -1 : 1}00% 0`, opacity: 0}], {duration: 200, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}).finished.then(done, done);
  }

  /* SwipeHelper on a row: it follows the finger sideways and fades (getAlphaForOffset), past 40 % of its width
     (SWIPED_FAR_ENOUGH_SIZE_FRACTION) or flung faster than 500 dp/s it flies off in 200 ms (DEFAULT_ESCAPE_ANIMATION_DURATION),
     else it snaps back in 150 ms. A heads-up row also goes when pulled up. */
  function bindSwipe(c, card, onDismiss, {up = true} = {}) {
    card.addEventListener('pointerdown', e => {
      if (e.button) return;
      const x0 = e.clientX, y0 = e.clientY, w = card.offsetWidth, samples = [[performance.now(), x0]];
      let mode = '';
      const move = ev => {
        const dx = ev.clientX - x0, dy = ev.clientY - y0;
        if (!mode) { if (Math.hypot(dx, dy) < 8 * DP()) return; mode = Math.abs(dx) > Math.abs(dy) ? 'x' : (up && dy < 0 ? 'y' : 'none'); if (mode === 'none') return; }
        if (mode === 'x') { samples.push([performance.now(), ev.clientX]); if (samples.length > 6) samples.shift(); card.style.translate = `${dx}px 0`; card.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / (w * .6))); }
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
        if (Math.abs(dx) > w * .4 || (Math.abs(v) > 500 && Math.sign(v) === Math.sign(dx))) onDismiss(dx < 0 ? 'left' : 'right');
        else { card.animate([{translate: `${dx}px 0`, opacity: card.style.opacity}, {translate: '0 0', opacity: 1}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'}); card.style.translate = ''; card.style.opacity = ''; }
      };
      window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
    });
  }

  // ---- the simulator's own answers ------------------------------------------------------------------------------
  const answered = new Set();
  function answer(c, app, key, make) {
    if (answered.has(`${app}:${key}`)) return;
    answered.add(`${app}:${key}`);
    setTimeout(() => make(c), 4500);
  }

  MM.notify = (c, n) => notify(c, n);
  MM.notifications = {row, cancel, open, bindSwipe, answer, list, hideHeadsUp: c => hideHeadsUp(c, 'up', true)};
  (MM.notificationSources ||= []).push(c => list(c));

  MM.register('notify', {
    app: false, render: () => '',
    // Locking or sleeping takes a heads-up away (its notification stays in the shade and on the keyguard).
    tick(c) { if (shown && (c.ui.view === 'lock' || c.ui.sleeping || c.ui.overlay === 'shade')) hideHeadsUp(c, 'up', true); },
    init(c) {
      // The heads-up row is the screen's, not a module's, so its clicks come here.
      c.el.screen.addEventListener('click', e => {
        const hun = e.target.closest('.mmnt-hun .mmnt-row');
        if (!hun || hun.dataset.swiped) return;
        e.stopPropagation(); hideHeadsUp(c, 'up', true); open(c, hun.dataset.id);
      }, true);
    }
  });
})();
