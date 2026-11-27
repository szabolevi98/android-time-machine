/* Focus Timer on Android 5.1.1: the Play Store's made-up app (docs/plans/play-apps.md) in the Material look of 2015. The
   logic and the texts are shared (store-apps/focus-timer.js); store-apps/legacy-host.js hosts it in simulator.js. This
   file only draws it and wires its notification:
   - the Toolbar in colorPrimary #e53935 (status bar #b71c1c) with the title and the overflow (Reset, Skip)
   - the three kinds of session as chips (the current one filled), the time left inside a ring that fills as the
     session goes, the session count, and the round start / pause button in colorAccent #ffb300
   - when a session ends, open or not, the notification (NotificationCompat: the app's small icon and colour, its title
     and text) that opens the app.
   Its status bar is colorPrimaryDark (simulator.js LP_STATUS_COLORS). */
(() => {
  'use strict';
  const F = () => StoreApps.focus;
  const ID = 'store-focus-timer';
  const t = (c, k) => F().t(k, c.lang);
  const R = 120, C = 2 * Math.PI * R;
  function render(c) {
    const s = F().state(c.data), now = Date.now(), left = F().remaining(s, now), done = F().progress(s, now);
    const chips = ['focus', 'short', 'long'].map(m => `<span class="lpft-chip${s.mode === m ? ' on' : ''}">${c.safe(t(c, F().NAME[m]))}</span>`).join('');
    const play = s.running ? 'Pause' : left < F().LENGTH[s.mode] ? 'Resume' : 'Start';
    return `<div class="app-view lpft" data-no-translate><header class="lpft-bar"><b>${c.safe(t(c, 'Focus Timer'))}</b><button type="button" class="lpft-more" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/lp-fw-ic_menu_moreoverflow_material.svg" alt=""></button></header>
      <main class="lpft-main"><div class="lpft-chips">${chips}</div>
        <div class="lpft-ring"><svg viewBox="0 0 280 280" aria-hidden="true"><circle cx="140" cy="140" r="${R}" class="track"/><circle cx="140" cy="140" r="${R}" class="fill" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - done)).toFixed(1)}"/></svg>
          <div><b class="lpft-time">${F().clock(left)}</b><small>${c.safe(F().fmt('Sessions today: %d', c.lang, s.sessions))}</small></div></div>
        <button type="button" class="lpft-play${s.running ? ' running' : ''}" data-action="lpft-toggle" aria-label="${c.safe(t(c, play))}"><i></i></button>
        <div class="lpft-actions"><button type="button" data-action="lpft-reset">${c.safe(t(c, 'Reset'))}</button><button type="button" data-action="lpft-skip">${c.safe(t(c, 'Skip'))}</button></div>
      </main></div>`;
  }
  // While it is open, the time and the ring follow the clock without drawing the whole screen again.
  function update(c) {
    const root = document.querySelector('#viewport .lpft'); if (!root) return;
    const s = F().state(c.data), now = Date.now();
    root.querySelector('.lpft-time').textContent = F().clock(F().remaining(s, now));
    root.querySelector('.lpft-ring .fill').style.strokeDashoffset = (C * (1 - F().progress(s, now))).toFixed(1);
  }
  StoreHost.register(ID, {
    title: 'Focus Timer', color: '#e53935', dark: '#b71c1c', version: '3.1', size: 3.0, key: 'focus',
    render,
    action(name, el, c) {
      const s = F().state(c.data);
      switch (name) {
        case 'lpft-toggle': if (s.running) F().pause(s); else F().start(s); c.save(); c.render(); return true;
        case 'lpft-reset': F().reset(s); c.save(); c.render(); return true;
        case 'lpft-skip': F().skip(s); c.save(); c.render(); return true;
      }
      return false;
    },
    menu(c, anchor) { const s = F().state(c.data); c.menu([{label: t(c, 'Reset'), action: c => { F().reset(s); c.save(); c.render(); }}, {label: t(c, 'Skip'), action: c => { F().skip(s); c.save(); c.render(); }}], anchor); },
    // Every second: a session that ran out notifies (open or not); an open timer shows the time.
    tick(c) {
      if (!c.data.storeApps?.focus) return;
      const s = F().state(c.data), end = F().tick(s);
      if (end) { const n = F().ending(end.ended, c.lang); c.notify(n.title, n.text); c.save(); if (c.ui.view === ID) c.render(); }
      else if (c.ui.view === ID && s.running && !c.ui.overlay) update(c);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.focus; }
  });
})();
