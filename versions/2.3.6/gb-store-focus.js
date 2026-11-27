/* Focus Timer on Android 2.3.6: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2011, from the
   framework of GRK39F. The logic and the texts are shared (store-apps/focus-timer.js); store-apps/legacy-host.js hosts
   it in simulator.js. This file only draws it and wires its notification:
   - the default theme's window title bar on the black window background
   - the kind of session (textAppearanceLarge), the time left in large digits, a horizontal ProgressBar
     (progress_horizontal) that fills as the session goes, the session count
   - Start / Pause and Reset as btn_default buttons, Skip and Reset in the Menu key's options panel
   - when a session ends, open or not, a status bar notification. */
(() => {
  'use strict';
  const F = () => StoreApps.focus;
  const ID = 'store-focus-timer';
  const t = (c, k) => F().t(k, c.lang);
  function render(c) {
    const s = F().state(c.data), now = Date.now(), left = F().remaining(s, now);
    const play = s.running ? 'Pause' : left < F().LENGTH[s.mode] ? 'Resume' : 'Start';
    return `<div class="app-view gbft" data-no-translate><div class="gb-titlebar">${c.safe(t(c, 'Focus Timer'))}</div>
      <main class="gbft-main"><b class="gbft-mode">${c.safe(t(c, F().NAME[s.mode]))}</b><span class="gbft-time">${F().clock(left)}</span>
        <span class="gbft-bar"><i style="width:${(F().progress(s, now) * 100).toFixed(1)}%"></i></span><small>${c.safe(F().fmt('Sessions today: %d', c.lang, s.sessions))}</small></main>
      <div class="gbsp-buttons gbft-buttons"><button type="button" class="gbsp-btn" data-action="gbft-toggle">${c.safe(t(c, play))}</button><button type="button" class="gbsp-btn" data-action="gbft-reset">${c.safe(t(c, 'Reset'))}</button></div></div>`;
  }
  function update(c) {
    const root = document.querySelector('#viewport .gbft'); if (!root) return;
    const s = F().state(c.data), now = Date.now();
    root.querySelector('.gbft-time').textContent = F().clock(F().remaining(s, now));
    root.querySelector('.gbft-bar i').style.width = (F().progress(s, now) * 100).toFixed(1) + '%';
  }
  StoreHost.register(ID, {
    title: 'Focus Timer', color: '#e53935', dark: '#b71c1c', version: '1.4', size: 3.0, key: 'focus',
    render,
    action(name, el, c) {
      const s = F().state(c.data);
      if (name === 'gbft-toggle') { if (s.running) F().pause(s); else F().start(s); c.save(); c.render(); return true; }
      if (name === 'gbft-reset') { F().reset(s); c.save(); c.render(); return true; }
      return false;
    },
    menu(c) {
      const s = F().state(c.data);
      c.menu([{label: t(c, 'Skip'), icon: 'ic_menu_forward', action: c => { F().skip(s); c.save(); c.render(); }}, {label: t(c, 'Reset'), icon: 'ic_menu_revert', action: c => { F().reset(s); c.save(); c.render(); }}]);
    },
    tick(c) {
      if (!c.data.storeApps?.focus) return;
      const s = F().state(c.data), end = F().tick(s);
      if (end) { const n = F().ending(end.ended, c.lang); c.notify(n.title, n.text); c.save(); if (c.ui.view === ID) c.render(); }
      else if (c.ui.view === ID && s.running && !c.ui.overlay) update(c);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.focus; }
  });
})();
