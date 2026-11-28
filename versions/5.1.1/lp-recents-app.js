/* TODO */
'use strict';
LP.define('recent', ({
  appIcon, appNames, captureRecentView, home, i18n, lockControls, lockScreen, LP_PRIMARY, LP_STATUS_COLORS,
  navRoot, openApp, overlayRoot, reducedMotion, render, renderOverlay, safe, save, toast, ui, updateBarMode,
  viewport
}, lp) => {
  /* TaskStackView.onStackTaskRemoved: the front-most remaining task keeps its place (the stack scroll moves by as much
     as it would fall back) and the other cards glide to their new transforms in 200 ms
     (requestSynchronizeStackViewsWithModel(200), fast_out_slow_in). With no task left, onAllTaskViewsDismissed runs
     mFinishLaunchHomeRunnable: Home starts with recents_to_launcher_enter (150 ms linear fade in) under
     recents_to_launcher_exit (Recents fades out in 150 ms, linear_out_slow_in). */
  function removeRecentTask(id) {
    if (ui.overlay !== 'recent') return;
    const panel = overlayRoot.querySelector('.lp-recents'), tasks = [...ui.recent].reverse(), index = tasks.indexOf(id);
    if (index < 0) return;
    ui.recent = ui.recent.filter(item => item !== id);
    if (!ui.recent.length) {
      ui.lpRecents?.destroy(); ui.lpRecents = null; ui.recentsScroll = undefined;
      home(false); updateBarMode();
      if (panel?.animate && !reducedMotion?.matches) {
        panel.style.pointerEvents = 'none'; overlayRoot.append(panel);
        panel.animate([{opacity: 1}, {opacity: 0}], {duration: 150, easing: 'cubic-bezier(0,0,.2,1)', fill: 'forwards'}).finished.then(() => panel.remove(), () => panel.remove());
        viewport.animate([{opacity: 0}, {opacity: 1}], {duration: 150, easing: 'linear'});
      }
      return;
    }
    const old = new Map([...(panel?.querySelectorAll('.lp-task') || [])].filter(card => !card.hidden).map(card => [card.dataset.app, card.style.transform]));
    const m = LPRecents.metrics(tasks.length), between = tasks.length > 1 ? m.progress[1] - m.progress[0] : 0;
    if (ui.recentsScroll !== undefined && index !== tasks.length - 1) ui.recentsScroll -= between;
    ui.recentsFrom = null;
    renderOverlay();
    const next = overlayRoot.querySelector('.lp-recents');
    if (!next) return;
    ui.recentsScroll = LPRecents.layout(next, ui.recentsScroll);
    if (reducedMotion?.matches) return;
    next.querySelectorAll('.lp-task').forEach(card => {
      const from = old.get(card.dataset.app);
      if (from && !card.hidden && from !== card.style.transform) card.animate([{transform: from}, {transform: card.style.transform}], {duration: 200, easing: 'cubic-bezier(.4,0,.2,1)'});
    });
  }
  // recents_return_to_launcher: Recents fades out while the launcher fades back in (250 ms).
  // Leaving Overview for home: the stack drops away (recents_task_exit_to_home_duration, 225 ms) as the launcher returns.
  function closeRecents() {
    const panel = overlayRoot.querySelector('.recent-panel'); ui.recentPopup = null; ui.recentsScroll = undefined;
    const done = () => { ui.overlay = ''; ui.lpRecents?.destroy(); ui.lpRecents = null; renderOverlay(); updateBarMode(); };
    if (!panel?.animate || reducedMotion?.matches) { done(); return; }
    LPRecents.exit(panel).then(done, done);
  }
  const pinHeld = new Set(); let pinTimer = 0;
  navRoot.addEventListener('pointerdown', event => {
    if (!ui.pinned) return;
    const key = event.target.closest('.nav-back') ? 'back' : event.target.closest('.nav-recent') ? 'recent' : '';
    if (!key) return;
    pinHeld.add(key); clearTimeout(pinTimer);
    if (pinHeld.has('recent')) pinTimer = setTimeout(() => { if (pinHeld.has('recent')) { lp.suppressClickUntil = Date.now() + 400; unpin(); } }, pinHeld.has('back') ? 500 : 1000);
  });
  window.addEventListener('pointerup', event => { pinHeld.clear(); clearTimeout(pinTimer); });
  window.addEventListener('pointercancel', () => { pinHeld.clear(); clearTimeout(pinTimer); });
  // Screen pinning: the reminder toast, and unpinning (lock_to_app_exit, then the lock screen when it asks for the lock).
  function pinnedToast() { toast(i18n.t('To unpin this screen, touch and hold Back and Overview at the same time.')); }
  function unpin() {
    if (!ui.pinned) return;
    ui.pinned = null; updateBarMode(); toast(i18n.t('Screen unpinned'));
    const secure = ['pin', 'password', 'pattern'].includes(lp.data.settings.screenLock);
    if (lp.data.settings.pinExitLocked ?? secure) { lockScreen(); ui.sleeping = false; render(); }
  }
  Object.assign(lp, {pinnedToast, closeRecents, removeRecentTask});
  // lp:code
  return {
    // lp:hooks
    preClick(action) {
      if (ui.overlay === 'recent' && ui.recentPopup && !['remove-recent', 'recent-app-info'].includes(action)) { ui.recentPopup = null; renderOverlay(); return true; }
      // lp:preClick
      return false;
    },
    backPinned() {
      if (ui.pinned && ui.view === ui.pinned && !ui.overlay && !ui.sub) { pinnedToast(); return true; }
      // lp:backPinned
      return false;
    },
    overlays: {
      'recent'() {
        ui.lpRecents?.destroy();
        const searchCard = `<div class="lp-qsb-card"><button data-action="browser-search" aria-label="${safe(i18n.t('Search'))}"><img class="lp-qsb-logo" src="assets/gnl-ic_searchbox_google.png" alt="Google"></button><button class="voice-search" data-action="voice-search" aria-label="${safe(i18n.t('Voice Search'))}"><img class="lp-qsb-mic" src="assets/gnl-ic_mic_none.png" alt=""></button></div>`;
        overlayRoot.innerHTML = LPRecents.render(ui.recent, {names: appNames, icon: appIcon, snapshots: ui.recentSnapshots, colors: LP_PRIMARY, statusColors: LP_STATUS_COLORS, t: key => i18n.t(key), pin: !!lp.data.settings.screenPinning, search: searchCard});
        const panel = overlayRoot.querySelector('.lp-recents');
        ui.lpRecents = LPRecents.attach(panel, {scroll: ui.recentsScroll, reduced: !!reducedMotion?.matches, from: ui.recentsFrom, elapsed: performance.now() - (ui.recentsAt || 0), onScroll: (value, end) => { ui.recentsScroll = value; if (end) lp.suppressClickUntil = Date.now() + 300; }});
        if (ui.recentsScroll === undefined) ui.recentsScroll = LPRecents.layout(panel);
      },
      'pin-request'() {
        const ring = key => `<span class="pin-key ${key}"><i></i><img src="assets/lp-ic_sysbar_${key}.png" alt=""></span>`;
        overlayRoot.innerHTML = `<div class="pin-scrim"></div><div class="pin-request" role="dialog" aria-label="${safe(i18n.t('Screen is pinned'))}" data-no-translate><h3>${safe(i18n.t('Screen is pinned'))}</h3><p>${safe(i18n.t('This keeps it in view until you unpin. Touch and hold Back and Overview at the same time to unpin.'))}</p><div class="pin-buttons"><button data-action="pin-cancel">${safe(i18n.t('No thanks'))}</button><button data-action="pin-ok">${safe(i18n.t('Got it'))}</button></div><div class="pin-nav">${ring('back')}<span class="pin-key home"><img src="assets/lp-ic_sysbar_home.png" alt=""></span>${ring('recent')}</div></div>`;
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'lp-pin': event.stopPropagation(); ui.recentPopup = null; ui.recentsScroll = undefined; ui.lpRecents?.destroy(); ui.lpRecents = null; openApp(app, true); ui.overlay = 'pin-request'; renderOverlay(); updateBarMode(); break;
        case 'pin-ok': ui.pinned = ui.view; ui.overlay = ''; renderOverlay(); updateBarMode(); toast(i18n.t('Screen pinned')); break;
        case 'pin-cancel': ui.overlay = ''; renderOverlay(); break;
        case 'lp-pin-lock': { const secure = ['pin', 'password', 'pattern'].includes(lp.data.settings.screenLock), current = lp.data.settings.pinExitLocked ?? secure;
          // Without a secure lock, turning it on asks for one first (ChooseLockGeneric).
          if (!current && !secure) { lp.data.settings.pinExitLocked = true; save(); lockControls.open(); render(); break; }
          lp.data.settings.pinExitLocked = !current; save(); render(); break; }
        case 'recent': {
          if (ui.view === 'lock') break;
          if (ui.pinned) { pinnedToast(); break; }
          if (ui.overlay === 'recent') { closeRecents(); break; }
          captureRecentView(); ui.recentPopup = null; ui.recentsScroll = undefined;
          ui.recentsFrom = ui.view === 'home' ? 'home' : 'app'; ui.recentsAt = performance.now(); ui.overlay = 'recent'; renderOverlay(); updateBarMode();
          break;
        }
        case 'recent-app-info': ui.overlay = ''; ui.recentPopup = null; openApp('settings'); ui.settingsApp = id; ui.sub = 'app-info'; render(); break;
        case 'remove-recent': {
          // TaskView.startDeleteTaskAnimation: translationX to recents_task_view_remove_anim_translation_x (100 dp) and alpha
          // 0 over recents_animate_task_view_remove_duration (250 ms) with fast_out_slow_in, then the task goes.
          event.stopPropagation(); ui.recentPopup = null;
          const card = button.closest('.lp-task');
          if (!card || reducedMotion?.matches) { removeRecentTask(id); break; }
          card.style.transition = 'translate .25s cubic-bezier(.4,0,.2,1), opacity .25s cubic-bezier(.4,0,.2,1)';
          card.style.translate = `${(100 * LPRecents.DP()).toFixed(2)}px 0`; card.style.opacity = '0';
          setTimeout(() => removeRecentTask(id), 250); break;
        }
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
