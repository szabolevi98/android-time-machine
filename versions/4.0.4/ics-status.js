/* The status bar (IMM76I SystemUI's PhoneStatusBar), moved out of simulator.js (docs/plans/engine-migration.md): the
   notification icons on the left (sync, the message, a calendar reminder, more), the system icons and the clock on the
   right; a touch opens the notification shade (ics-shade.js). Its clock follows the device clock every second. */
(() => {
  'use strict';
  ICS.register('statusbar', {
    touch: '#status-bar',
    render(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/stat_sys_alarm.png" alt="">' : ''}<span class="status-cluster">${data.settings.wifi && data.settings.wifiNetwork ? '<img class="status-wifi" src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""></span><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;
      const notificationIcons = (ui.syncing ? '<img src="assets/stat_notify_sync.png" alt="">' : '') + (data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_sms.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '');
      return `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    },
    // Every second: the clock follows the device clock.
    tick(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      document.querySelectorAll('.status-clock').forEach(node => { node.textContent = clock(); });
    },
  });
})();
