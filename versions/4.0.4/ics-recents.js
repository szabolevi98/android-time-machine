/* Recent apps (IMM76I SystemUI's RecentsPanelView), moved out of simulator.js (docs/plans/engine-migration.md): the
   Recent apps key opens the panel of the last seven tasks with their thumbnails (newest at the bottom); a tap resumes
   one where it was, a sideways swipe removes it. */
(() => {
  'use strict';
  /* RecentsPanelView.handleSwipe and the card's "Remove from list": ActivityManager.removeTask(id, REMOVE_TASK_KILL_PROCESS).
     The task and its saved state go; when it is the app on screen, that app is gone too, so once the panel closes (Back,
     the Recent apps key, the scrim, the last card) the home screen is there, with no app-closing transition. */
  function removeTask(c, id) {
    const {ui} = c;
    ui.recent = ui.recent.filter(item => item !== id);
    delete ui.recentState?.[id]; delete ui.recentSnapshots[id];
    if (ui.view === id) ui.removedTask = id;
  }
  ICS.register('recent', {
    init(c) { c.removeTask = id => removeTask(c, id); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay === 'recent') {
        return `<div class="recent-panel" data-action="close-overlay">${ui.recent.length ? `<div class="recent-list">${[...ui.recent].reverse().map(id => `<div class="recent-item" data-action="open-app" data-app="${id}" role="button" tabindex="0" aria-label="${appNames[id]}"><span class="recent-label">${appNames[id]}</span><span class="recent-thumbnail" aria-hidden="true"><span class="recent-thumbnail-inner" inert>${ui.recentSnapshots[id] || `<div class="recent-fallback">${c.appIcon(id)}</div>`}</span></span><span class="recent-app-icon" aria-hidden="true">${c.appIcon(id)}</span></div>`).join('')}</div>` : '<p class="recent-empty">No recent apps</p>'}</div>`;
      }
    },
    // A removed task that was on screen: the home screen is there once the panel closes (no app-closing transition).
    beforeOverlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.removedTask && ui.overlay !== 'recent') {
        const gone = ui.removedTask; ui.removedTask = null;
        if (ui.view === gone) { ui.view = 'home'; ui.sub = ''; c.resetScene({view: 'home', sub: ''}); render(); return true; }
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      switch (action) {
        case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') c.captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
        default: return false;
      }
      return true;
    },
    pointermove(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const recentCard = ui.overlay === 'recent' ? c.pointer.target.closest('.recent-item') : null;
      if (recentCard && (c.pointer.recentSwiping || Math.abs(dx) > dp(11) && Math.abs(dx) > Math.abs(dy))) {
        c.pointer.recentSwiping = true;
        c.suppressClick(350);
        event.preventDefault();
        try { screen.setPointerCapture(event.pointerId); } catch {}
        recentCard.style.transform = `translateX(${dx}px)`;
        recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
        return true;
      }
    },
    pointerup(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (c.pointer.recentSwiping && !c.pointer.target.closest('.recent-item, .notification')?.classList.contains('notification')) {
        const card = c.pointer.target.closest('.recent-item, .notification');
        if (card) {
          card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
          if (Math.abs(dx) > dp(65)) {
            const id = card.dataset.app;
            card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
            card.style.opacity = '0';
            setTimeout(() => {
              removeTask(c, id);
              if (ui.overlay !== 'recent') return;
              if (!ui.recent.length) ui.overlay = '';
              renderOverlay();
            }, 160);
          } else { card.style.transform = ''; card.style.opacity = ''; }
        }
        c.suppressClick(350);
        return true;
      }
    },
    pointercancel(c) { if (c.ui.overlay === 'recent') c.renderOverlay(); },
    // Enter or Space on a card resumes it.
    key(event) {
      if (event.target.matches('.recent-item') && ['Enter',' '].includes(event.key)) { event.preventDefault(); event.target.click(); return true; }
    }
  });
})();
