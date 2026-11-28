/* The notification shade (IMM76I SystemUI's StatusBarExpanded), moved out of simulator.js
   (docs/plans/engine-migration.md): the date, the quick settings button and Clear all, an ongoing call, the
   notifications (a tap opens what they are about; a sideways swipe dismisses one) and the carrier; it is pulled down
   from the status bar and pushed back up by its handle. */
(() => {
  'use strict';
  ICS.register('shade', {
    touch: '.shade-top, .shade-handle',
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const shadeDate = () => deviceDate().toLocaleDateString(i18n.locale(), { weekday: 'short', month: 'short', day: 'numeric' });
      if (ui.overlay === 'shade') {
        return `<div class="notification-shade"><div class="shade-top"><span class="shade-date">${shadeDate()}</span><button data-action="open-app" data-app="settings" aria-label="Settings"><img src="assets/ic_notify_quicksettings_normal.png" alt=""></button>${data.notifications.length ? '<button class="shade-clear" data-action="clear-notifications" aria-label="Clear notifications"><img src="assets/ic_notify_clear_normal.png" alt=""></button>' : ''}</div><div class="shade-divider"></div><div class="shade-body"><div class="shade-list">${ui.activeCall?`<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(c.contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>`:''}${data.notifications.map(n => `<button class="notification" data-action="notification-open" data-id="${n.id}"><span class="notification-icon"><img src="assets/${n.id === 2 ? 'stat_notify_sms.png' : n.kind === 'calendar' ? 'calendar.png' : 'settings.png'}" alt=""></span><span><strong>${safe(n.title)}</strong><small>${safe(n.detail)}</small></span></button>`).join('')}</div><div class="shade-carrier">${c.carrierName()}</div></div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {id} = button.dataset;
      switch (action) {
        case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
        case 'clear-notifications': data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break;
        case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
          ui.overlay = ''; if (Number(id) === 2) c.openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
        default: return false;
      }
      return true;
    },
    pointerdown(event, p, c) { const {ui} = c; p.shadeDragEligible = !ui.overlay && !!event.target.closest('#status-bar'); p.shadeCloseEligible = ui.overlay === 'shade' && !!event.target.closest('.shade-handle,.shade-top'); },
    pointermove(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const recentCard = ui.overlay === 'shade' ? c.pointer.target.closest('.notification') : null;
      if (recentCard && (c.pointer.recentSwiping || Math.abs(dx) > dp(11) && Math.abs(dx) > Math.abs(dy))) {
        c.pointer.recentSwiping = true;
        c.suppressClick(350);
        event.preventDefault();
        try { screen.setPointerCapture(event.pointerId); } catch {}
        recentCard.style.transform = `translateX(${dx}px)`;
        recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
        return true;
      }
      if (c.pointer.shadeDragging || c.pointer.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || c.pointer.shadeCloseEligible && dy < -dp(9) && -dy > Math.abs(dx)) {
        if (!c.pointer.shadeDragging) { c.pointer.shadeDragging = true; ui.overlay = 'shade'; renderOverlay(); try { screen.setPointerCapture(event.pointerId); } catch {} }
        event.preventDefault();
        const shade = overlayRoot.querySelector('.notification-shade');
        if (shade) {
          shade.style.animation = 'none';
          shade.style.bottom = 'auto';
          shade.style.height = `${Math.max(dp(91.7648), Math.min(screen.clientHeight - dp(83.5295), c.pointer.shadeCloseEligible ? screen.clientHeight - dp(83.5295) + dy : dy))}px`;
        }
        return true;
      }
    },
    pointerup(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (c.pointer.recentSwiping && c.pointer.target.closest('.recent-item, .notification')?.classList.contains('notification')) {
        const card = c.pointer.target.closest('.recent-item, .notification');
        if (card) {
          card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
          if (Math.abs(dx) > dp(65)) {
            const id = card.dataset.app;
            card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
            card.style.opacity = '0';
            setTimeout(() => {
              data.notifications = data.notifications.filter(item => item.id !== Number(card.dataset.id));
              save(); renderStatus();
              if (ui.overlay === 'shade') { if (!data.notifications.length) ui.overlay = ''; renderOverlay(); }
            }, 160);
          } else { card.style.transform = ''; card.style.opacity = ''; }
        }
        c.suppressClick(350);
        return true;
      }
      if (c.pointer.shadeDragging) {
        c.suppressClick(350);
        const close = c.pointer.shadeCloseEligible ? dy < -dp(65) : dy < dp(88);
        if (close) { ui.overlay = ''; renderOverlay(); }
        else {
          const shade = overlayRoot.querySelector('.notification-shade');
          if (shade) { const height = shade.clientHeight; shade.style.removeProperty('height'); shade.style.removeProperty('bottom'); shade.animate([{height:`${height}px`},{height:`${screen.clientHeight - dp(83.5295)}px`}], {duration:180,easing:'ease-out'}); }
        }
        return true;
      }
    },
    // After the launcher's drop: a quick swipe dismisses a notification, a pull on the status bar opens the shade.
    pointerdrop(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay === 'shade' && c.pointer.target.closest('.notification') && Math.abs(dx) > dp(65)) { const id = Number(c.pointer.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); return true; }
      if (!ui.overlay && c.pointer.target.closest('#status-bar') && dy > dp(53)) { ui.overlay = 'shade'; renderOverlay(); }
    },
    pointercancel(c) { if (c.pointer?.shadeDragging || c.ui.overlay === 'shade') c.renderOverlay(); }
  });
})();
