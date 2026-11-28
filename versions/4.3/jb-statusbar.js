/* The status bar and the navigation bar of Android 4.3 (SystemUI of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): the notification icons, the indicators (Bluetooth, ringer, alarm, Wi-Fi, data,
   signal, battery) and the clock; Back, Home and Recents. The core draws them on every render through the module. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, clock, data, i18n, navRoot, statusRoot, ui;
  const $bind = c => { $c = c; ({clock, data, i18n, navRoot, statusRoot, ui} = c); };
  const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/stat_sys_alarm.png" alt="">' : ''}<span class="status-cluster">${data.settings.wifi && data.settings.wifiNetwork ? '<img class="status-wifi" src="assets/stat_sys_wifi_signal_4_fully.png" alt="">' : ''}${!data.settings.airplane && data.settings.dataEnabled !== false && !(data.settings.wifi && data.settings.wifiNetwork) ? '<img class="status-data-type" src="assets/jb-stat_sys_data_fully_connected_h.png" alt="">' : ''}<img src="assets/${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""></span><img class="status-battery" src="assets/stat_sys_battery_71.png" alt=""><span class="status-clock">${clock()}</span></span>`;
  function renderStatus() {
    const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_sms.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/nav-back.png" alt=""></button><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/nav-home.png" alt=""></button><button class="nav-key nav-recent" data-action="recent" aria-label="Recent apps"><img src="assets/nav-recent.png" alt=""></button>${ui.view==='music'&&!ui.locked?'<button class="nav-key nav-menu" data-action="legacy-menu" aria-label="Menu"><img src="assets/ic_sysbar_menu.png" alt=""></button>':''}`;
    if(ui.locked)navRoot.querySelectorAll('.nav-home,.nav-recent').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');});
  }
  const spec = {
    exports: {
      renderStatus: (c, ...args) => { $bind(c); return renderStatus(...args); },
      renderNav: (c, ...args) => { $bind(c); return renderNav(...args); }
    }
  };
  JB.register('statusbar', spec);
})();
