/* The status bar of the 4.4.4 shell (docs/plans/engine-migration.md): KitKat's notification icons, the system
   icons (Bluetooth, ringer, alarm, Wi-Fi, mobile data, signal), BatteryMeterView and the clock, moved out of
   simulator.js. The shell draws it (renderStatus) with its bar mode; a tap opens the shade. */
(() => {
  'use strict';
  function scope(c) {
    const {clock, data} = c;
    const statusIndicators = () => `<span class="status-right">${data.settings.bluetooth ? '<img class="status-bluetooth" src="assets/kk-stat_sys_data_bluetooth.png" alt="">' : ''}${data.settings.silent ? `<img src="assets/kk-stat_sys_ringer_${data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent'}.png" alt="">` : ''}${data.alarms.some(alarm => alarm.enabled) ? '<img src="assets/kk-stat_sys_alarm.png" alt="">' : ''}<span class="status-cluster">${data.settings.wifi && data.settings.wifiNetwork ? '<img class="status-wifi" src="assets/kk-stat_sys_wifi_signal_4_fully.png" alt="">' : ''}${!data.settings.airplane && data.settings.dataEnabled !== false && !(data.settings.wifi && data.settings.wifiNetwork) ? '<img class="status-data-type" src="assets/kk-stat_sys_data_fully_connected_h.png" alt="">' : ''}<img src="assets/kk-${data.settings.airplane ? 'stat_sys_signal_flightmode' : 'stat_sys_signal_4_fully'}.png" alt=""></span>${kkBattery(71)}<span class="status-clock">${clock()}</span></span>`;
    // BatteryMeterView (4.4): the button is 25 %-75 % wide and 12 % tall; frame #66FFFFFF, level white, red at 15 % or less.
    const kkBattery = level => `<svg class="kk-battery" viewBox="0 0 10.5 16" aria-label="Battery ${level}%"><path d="M2.75 .4h5v1.6h-5zM.4 2.32h9.7v13.28H.4z" fill="#fff" fill-opacity=".4"/><rect x=".4" y="${(2.32 + 13.28 * (1 - level / 100)).toFixed(2)}" width="9.7" height="${(13.28 * level / 100).toFixed(2)}" fill="${level <= 15 ? '#ff3300' : '#fff'}"/></svg>`;
    return {
      render() {
        const notificationIcons = data.notifications.length ? `${data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_hangouts.png" alt="">' : ''}${data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
        return `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
      }
    };
  }
  const spec = {
    render: c => scope(c).render()
  };
  for (const id of ['statusbar']) KK.register(id, spec);
})();
