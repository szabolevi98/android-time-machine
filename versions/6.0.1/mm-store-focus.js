/* Focus Timer on Android 6.0.1: the store's made-up app (docs/plans/play-apps.md) in the Material look of its time. The
   logic and the texts are shared (store-apps/focus-timer.js); this file only draws it and wires its notification:
   - the Toolbar in colorPrimary #e53935 (status bar #b71c1c) with the title and the overflow (Reset, Skip)
   - the three kinds of session as chips (the current one filled), the time left inside a ring that fills as the
     session goes, the session count, and the round start / pause button in colorAccent #ffb300
   - when a session ends, open or not, the notification (NotificationCompat: the app's small icon and colour, its title
     and text) that opens the app.
   It is the Play Store's runtime 'store-focus-timer' (mm-play.js). */
(() => {
  'use strict';
  const F = () => StoreApps.focus;
  const ID = 'store-focus-timer';
  const t = (c, k) => F().t(k, c.lang);
  const icon = svg => 'data:image/svg+xml,' + encodeURIComponent(svg);
  const R = 120, C = 2 * Math.PI * R;
  function render(c) {
    const s = F().state(c.data), now = Date.now(), left = F().remaining(s, now), done = F().progress(s, now);
    const chips = ['focus', 'short', 'long'].map(m => `<span class="mmft-chip${s.mode === m ? ' on' : ''}">${c.safe(t(c, F().NAME[m]))}</span>`).join('');
    const play = s.running ? 'Pause' : left < F().LENGTH[s.mode] ? 'Resume' : 'Start';
    return `<div class="mmft" data-no-translate><header class="mmft-bar"><b>${c.safe(t(c, 'Focus Timer'))}</b>${MM.menu.button(c)}</header>
      <main class="mmft-main"><div class="mmft-chips">${chips}</div>
        <div class="mmft-ring"><svg viewBox="0 0 280 280" aria-hidden="true"><circle cx="140" cy="140" r="${R}" class="track"/><circle cx="140" cy="140" r="${R}" class="fill" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - done)).toFixed(1)}"/></svg>
          <div><b class="mmft-time">${F().clock(left)}</b><small>${c.safe(F().fmt('Sessions today: %d', c.lang, s.sessions))}</small></div></div>
        <button type="button" class="mmft-play${s.running ? ' running' : ''}" data-action="mmft-toggle" aria-label="${c.safe(t(c, play))}"><i></i></button>
        <div class="mmft-actions"><button type="button" data-action="mmft-reset">${c.safe(t(c, 'Reset'))}</button><button type="button" data-action="mmft-skip">${c.safe(t(c, 'Skip'))}</button></div>
      </main></div>`;
  }
  // While it is open, the time and the ring follow the clock without drawing the whole screen again.
  function update(c) {
    const root = c.el.viewport.querySelector('.mmft'); if (!root) return;
    const s = F().state(c.data), now = Date.now();
    root.querySelector('.mmft-time').textContent = F().clock(F().remaining(s, now));
    root.querySelector('.mmft-ring .fill').style.strokeDashoffset = (C * (1 - F().progress(s, now))).toFixed(1);
  }
  MM.register(ID, {
    title: 'Focus Timer',
    statusColor: () => F().STORE.dark,
    render,
    action(name, el, event, c) {
      const s = F().state(c.data);
      switch (name) {
        case 'mmft-toggle': if (s.running) F().pause(s); else F().start(s); c.save(); c.render(); return true;
        case 'mmft-reset': F().reset(s); c.save(); c.render(); return true;
        case 'mmft-skip': F().skip(s); c.save(); c.render(); return true;
        case 'mm-menu': c.menu([{label: t(c, 'Reset'), action: c => { F().reset(s); c.save(); c.render(); }}, {label: t(c, 'Skip'), action: c => { F().skip(s); c.save(); c.render(); }}], el); return true;
      }
      return false;
    },
    // Every second: a session that ran out notifies (open or not); an open timer shows the time.
    tick(c) {
      if (!c.data.storeApps?.focus || !MM.appsData?.[ID]) return;
      const s = F().state(c.data), end = F().tick(s);
      if (end) {
        const n = F().ending(end.ended, c.lang);
        MM.notify?.(c, {app: ID, appName: 'Focus Timer', icon: icon(F().STORE.small), color: F().STORE.color, title: n.title, text: n.text, open: [ID, '']});
        c.save(); if (c.ui.view === ID) c.render();
      } else if (c.ui.view === ID && s.running) update(c);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.focus; }
  });
})();
