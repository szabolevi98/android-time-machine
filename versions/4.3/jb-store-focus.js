/* Focus Timer on Android 4.3: the Play Store's made-up app (docs/plans/play-apps.md) in the Holo look of the apps of
   2012–2013. The logic and the texts are shared (store-apps/focus-timer.js); store-apps/legacy-host.js hosts it in
   simulator.js. This file only draws it and wires its notification:
   - the action bar (#e53935) with the app icon and title, and the overflow (Skip) as a Holo popup menu
   - the three kinds of session as action bar tabs under it (the current one underlined), the time left in thin
     Roboto inside a ring that fills as the session goes, the session count
   - the borderless button bar at the bottom (Start / Pause | Reset), as the Clock's stopwatch has it
   - when a session ends, open or not, a notification (the status bar's own). */
(() => {
  'use strict';
  const F = () => StoreApps.focus;
  const ID = 'store-focus-timer', P = 'jbft';
  const t = (c, k) => F().t(k, c.lang);
  const R = 120, C = 2 * Math.PI * R;
  function render(c) {
    const s = F().state(c.data), now = Date.now(), left = F().remaining(s, now), done = F().progress(s, now);
    const tabs = ['focus', 'short', 'long'].map(m => `<span class="${P}-tab${s.mode === m ? ' on' : ''}">${c.safe(t(c, F().NAME[m]))}</span>`).join('');
    const play = s.running ? 'Pause' : left < F().LENGTH[s.mode] ? 'Resume' : 'Start';
    return `<div class="app-view ${P}" data-no-translate><header class="${P}-bar"><img class="${P}-icon" src="assets/${ID}.png" alt=""><b>${c.safe(t(c, 'Focus Timer'))}</b><button type="button" class="${P}-more" data-action="sth-overflow" aria-label="${c.safe(c.t('More options'))}"><img src="assets/ic_menu_moreoverflow_normal_holo_dark.png" alt=""></button></header>
      <nav class="${P}-tabs">${tabs}</nav>
      <main class="${P}-main"><div class="${P}-ring"><svg viewBox="0 0 280 280" aria-hidden="true"><circle cx="140" cy="140" r="${R}" class="track"/><circle cx="140" cy="140" r="${R}" class="fill" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - done)).toFixed(1)}"/></svg>
        <div><b class="${P}-time">${F().clock(left)}</b><small>${c.safe(F().fmt('Sessions today: %d', c.lang, s.sessions))}</small></div></div></main>
      <footer class="${P}-buttons"><button type="button" data-action="${P}-toggle">${c.safe(t(c, play))}</button><i></i><button type="button" data-action="${P}-reset">${c.safe(t(c, 'Reset'))}</button></footer></div>`;
  }
  function update(c) {
    const root = document.querySelector(`#viewport .${P}`); if (!root) return;
    const s = F().state(c.data), now = Date.now();
    root.querySelector(`.${P}-time`).textContent = F().clock(F().remaining(s, now));
    root.querySelector(`.${P}-ring .fill`).style.strokeDashoffset = (C * (1 - F().progress(s, now))).toFixed(1);
  }
  StoreHost.register(ID, {
    title: 'Focus Timer', color: '#e53935', dark: '#b71c1c', version: '2.0', size: 3.0, key: 'focus',
    render,
    action(name, el, c) {
      const s = F().state(c.data);
      if (name === `${P}-toggle`) { if (s.running) F().pause(s); else F().start(s); c.save(); c.render(); return true; }
      if (name === `${P}-reset`) { F().reset(s); c.save(); c.render(); return true; }
      return false;
    },
    menu(c, anchor) { const s = F().state(c.data); c.menu([{label: t(c, 'Skip'), action: c => { F().skip(s); c.save(); c.render(); }}], anchor); },
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
