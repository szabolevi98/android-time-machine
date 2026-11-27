/* Focus Timer on Android 2.1: the Market's made-up app (docs/plans/play-apps.md) in the look apps had in 2010, from the
   framework of ERE27. The logic and the texts are shared (store-apps/focus-timer.js); this file only draws it and wires
   its notification:
   - the default theme's window (c.window: title_bar with the app's name) on the black window background
   - the kind of session (textAppearanceLarge), the time left in large digits, a horizontal ProgressBar
     (progress_horizontal) that fills as the session goes, the session count
   - Start / Pause and Reset as btn_default buttons; Skip (ic_menu_forward) and Reset (ic_menu_revert) in the options
     menu of the Menu key
   - when a session ends, open or not, a status bar notification (its white stopwatch icon) that opens the app.
   The Market installs it as the launcher entry 'store-focus-timer' (ec-market.js, EC.apps). */
(() => {
  'use strict';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const F = () => StoreApps.focus;
  const ID = 'store-focus-timer';
  const t = (c, k) => F().t(k, c.lang);
  const button = (action, label) => `<button type="button" class="ecui-button ecft-btn" data-action="${action}"><i class="ec-bg np-fw-btn_default_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_pressed"></i><span>${esc(label)}</span></button>`;
  function render(c) {
    const s = F().state(c.data), now = Date.now(), left = F().remaining(s, now);
    const play = s.running ? 'Pause' : left < F().LENGTH[s.mode] ? 'Resume' : 'Start';
    return c.window(t(c, 'Focus Timer'), `<div class="ecft" data-no-translate><main><b class="ecft-mode">${esc(t(c, F().NAME[s.mode]))}</b><span class="ecft-time">${F().clock(left)}</span>
      <span class="ecft-bar"><i style="width:${(F().progress(s, now) * 100).toFixed(1)}%"></i></span><small>${esc(F().fmt('Sessions today: %d', c.lang, s.sessions))}</small></main>
      <div class="ecft-buttons">${button('ecft-toggle', t(c, play))}${button('ecft-reset', t(c, 'Reset'))}</div></div>`);
  }
  function update(c) {
    const root = c.el.viewport.querySelector('.ecft'); if (!root) return;
    const s = F().state(c.data), now = Date.now();
    root.querySelector('.ecft-time').textContent = F().clock(F().remaining(s, now));
    root.querySelector('.ecft-bar i').style.width = (F().progress(s, now) * 100).toFixed(1) + '%';
  }
  EC.register(ID, {
    render,
    action(name, el, event, c) {
      const s = F().state(c.data);
      if (name === 'ecft-toggle') { if (s.running) F().pause(s); else F().start(s); c.save(); c.render(); return true; }
      if (name === 'ecft-reset') { F().reset(s); c.save(); c.render(); return true; }
      return false;
    },
    menu(c) {
      const s = F().state(c.data);
      c.menu([{label: t(c, 'Skip'), icon: 'fw-ic_menu_forward.png', action: () => { F().skip(s); c.save(); c.render(); }}, {label: t(c, 'Reset'), icon: 'fw-ic_menu_revert.png', action: () => { F().reset(s); c.save(); c.render(); }}]);
      return true;
    },
    // Every second: a session that ran out notifies (open or not); an open timer shows the time.
    tick(c) {
      if (!c.data.storeApps?.focus || !EC.apps.get(ID)) return;
      const s = F().state(c.data), end = F().tick(s);
      if (end) {
        const n = F().ending(end.ended, c.lang);
        c.notify?.({icon: 'app-store-focus-timer-stat.png', title: n.title, text: n.text, ticker: n.title, view: ID});
        c.save(); if (c.ui.view === ID) c.render();
      } else if (c.ui.view === ID && s.running && !c.ui.overlay) update(c);
    },
    clearData(c) { if (c.data.storeApps) delete c.data.storeApps.focus; }
  });
})();
