/* TODO */
'use strict';
LP.define('statusbar', ({
  clock, contact, deviceDate, i18n, LP_STATUS_COLORS, navRoot, openApp, overlayRoot, reducedMotion, renderOverlay,
  screen, statusRoot, ui
}, lp) => {
  // BatteryMeterView (5.1): 9.5 x 14.5 dp; the button is 25 %-75 % wide and 12 % tall; frame #66FFFFFF, level white,
  // battery_saver_mode_color (#F4511E) at 15 % or less.
  const kkBattery = level => `<svg class="kk-battery" viewBox="0 0 9.5 14.5" aria-label="Battery ${level}%"><path d="M2.375 0h4.75v1.74h-4.75zM0 1.74h9.5V14.5H0z" fill="#fff" fill-opacity=".4"/><rect x="0" y="${(1.74 + 12.76 * (1 - level / 100)).toFixed(2)}" width="9.5" height="${(12.76 * level / 100).toFixed(2)}" fill="${level <= 15 ? '#f4511e' : '#fff'}"/></svg>`;
  const statusBarHeight = () => statusRoot.offsetHeight || 22.65;
  // Launcher3 and the keyguard draw under translucent system bars; apps get opaque ones.
  function updateBarMode() {
    screen.classList.toggle('kk-translucent', ['home', 'lock', 'drawer'].includes(ui.view) && !ui.sleeping);
    screen.classList.toggle('lp-on-keyguard', ui.view === 'lock' && !ui.sleeping);
    // RecentsTheme: transparent system bars over the wallpaper.
    screen.classList.toggle('lp-recents-open', ui.overlay === 'recent');
    // Window.setStatusBarColor: the app's colorPrimaryDark (LP_STATUS_COLORS), black where the theme sets none.
    screen.style.setProperty('--lp-sb', ui.view === 'youtube' && ['search', 'results'].includes(ui.sub) ? '#d9d9d9' : ui.sub === 'chrome-settings' && ['chrome', 'browser'].includes(ui.view) ? '#161e21' : ui.view === 'wallet' ? LPExtraApps.walletStatus(ui) : ui.view === 'play-store' && window.JBPlay?.statusColor ? JBPlay.statusColor(lp.jbPlayContext()) : LP_STATUS_COLORS[ui.view] || LPExtraApps.COLORS[ui.view]?.[1] || '#000');
    // QuickContactActivity tints the status bar with the darker shade of the contact's colour.
    if (ui.view === 'people' && ui.sub === 'detail') { const person = contact(ui.selectedContact); if (person) screen.style.setProperty('--lp-sb', LPDialer.tileColorDark(person.name)); }
    // Google+'s VideoViewActivity: VideoViewTheme's colorPrimaryDark (Theme.EmeraldSea, quantum_googred700).
    if (ui.view === 'photos' && ui.sub === 'video') screen.style.setProperty('--lp-sb', '#c53929');
    // DeskClock's translucent status bar (#26000000) over the hour colour.
    if (ui.view === 'clock') screen.style.setProperty('--lp-sb', `color-mix(in srgb, ${JBDeskClock.SPECTRUM[deviceDate().getHours()]}, #000 15%)`);
    // Messenger colours a conversation's bars with the participant's tile colour.
    if (ui.view === 'messaging' && ui.sub === 'thread') screen.style.setProperty('--lp-sb', LPDialer.tileColorDark(ICSMessaging.identity(ui.thread, lp.data.contacts).name));
    // PlatLogoActivity is fullscreen; the Dessert Case hides both bars (immersive sticky).
    const egg = ui.view === 'settings' && ui.sub === 'easter';
    if (ui.view === 'settings' && ui.sub === 'lland') screen.style.setProperty('--lp-sb', '#757575');
    // Theme.WallpaperPicker is fullscreen as well.
    screen.classList.toggle('kk-hide-status', egg || ui.view === 'wallpaper-picker');
    screen.classList.toggle('kk-immersive', false);
    if (!egg) screen.classList.remove('kk-bars-peek');
  }
  /* PhoneStatusBarPolicy icons (Bluetooth, the 5.0 interruptions/vibrate icon, alarm), then SignalClusterView (Wi-Fi,
     the mobile signal with its data type in the corner, or the airplane), BatteryMeterView and the clock. */
  const sysui = name => `assets/lp-sysui-${name}.svg`;
  const statusIndicators = () => {
    const wifi = lp.data.settings.wifi && lp.data.settings.wifiNetwork, zen = lp.data.settings.zenMode && lp.data.settings.zenMode !== 'all';
    const mobile = lp.data.settings.airplane ? `<img src="${sysui('stat_sys_airplane_mode')}" alt="">` : (!wifi && lp.data.settings.dataEnabled !== false ? `<span class="lp-mobile lp-mobile-wide"><img src="${sysui('stat_sys_signal_4_fully')}" alt=""><img class="lp-mobile-type" src="${sysui('stat_sys_data_fully_connected_lte')}" alt=""></span>` : `<span class="lp-mobile"><img src="${sysui('stat_sys_signal_4_fully')}" alt=""></span>`);
    return `<span class="status-right">${lp.data.settings.bluetooth ? `<img class="status-bluetooth" src="${sysui('stat_sys_data_bluetooth')}" alt="">` : ''}${zen ? `<img src="${sysui(lp.data.settings.zenMode === 'none' ? 'stat_sys_zen_none' : 'stat_sys_zen_important')}" alt="">` : ''}${lp.data.settings.silent && lp.data.settings.silentMode === 'vibrate' ? `<img src="${sysui('stat_sys_ringer_vibrate')}" alt="">` : ''}${lp.data.alarms.some(alarm => alarm.enabled) ? `<img src="${sysui('stat_sys_alarm')}" alt="">` : ''}<span class="status-cluster${wifi && lp.data.settings.airplane ? ' lp-wifi-airplane' : ''}">${wifi ? `<img class="status-wifi" src="${sysui('stat_sys_wifi_signal_4_fully')}" alt="">` : ''}${mobile}</span>${kkBattery(71)}<span class="status-clock">${clock()}</span></span>`;
  };
  function renderStatus() {
    updateBarMode();
    const notificationIcons = lp.data.notifications.length ? `${lp.data.notifications.some(item => item.id === 2) ? '<img src="assets/stat_notify_hangouts.png" alt="">' : ''}${lp.data.notifications.some(item => item.kind === 'calendar') ? '<img src="assets/calendar-stat_notify_calendar.png" alt="">' : ''}${lp.data.notifications.some(item => item.id !== 2 && item.kind !== 'calendar') ? '<img src="assets/stat_notify_more.png" alt="">' : ''}` : '';
    statusRoot.innerHTML = `<button class="status-button" data-action="shade" aria-label="Open notifications"><span class="status-left">${notificationIcons}</span>${statusIndicators()}</button>`;
    i18n.translateDOM(statusRoot);
  }
  function renderNav() {
    // navigation_bar.xml: the side padding and the keys (values-sw400dp: 50 dp, 80 dp) spread by weighted spacers; Back turns down for the IME.
    navRoot.innerHTML = `<button class="nav-key nav-back" data-action="back" aria-label="Back"><img src="assets/lp-ic_sysbar_back${ui.imeShown ? '_ime' : ''}.png" alt=""></button><span class="nav-spacer"></span><button class="nav-key nav-home" data-action="home" aria-label="Home screen"><img src="assets/lp-ic_sysbar_home.png" alt=""></button><span class="nav-spacer"></span><button class="nav-key nav-recent" data-action="recent" aria-label="Overview"><img src="assets/lp-ic_sysbar_recent.png" alt=""></button>`;
    // Over the keyguard the navigation bar is empty (StatusBarManager.DISABLE_HOME | _RECENT | _BACK); the bouncer brings Back.
    if(ui.view==='lock'&&!ui.sleeping)navRoot.querySelectorAll(ui.kgBouncing?'.nav-home,.nav-recent':'.nav-key').forEach(button=>{button.disabled=true;button.setAttribute('aria-hidden','true');button.classList.add('nav-hidden');});
  }
  /* SearchPanelView: an upward swipe of navbar_search_up_threshhold (40dp) from the navigation bar shows the ring;
     releasing on the assist target starts search (the Google Search app on Google builds, Browser here). */
  // PointerLocationView: the bar at the top follows the primary pointer while the option is on.
  let pointerDownCount = 0;
  screen.addEventListener('pointerdown', event => { pointerDownCount++; if (lp.data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, true, 1); }, true);
  screen.addEventListener('pointermove', event => { if (lp.data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, event.buttons > 0, 1); }, true);
  window.addEventListener('pointerup', event => { if (lp.data.settings.pointerLocation) JBDeveloperOptions.pointerMove(screen, event, false, 1); }, true);
  let searchSwipe = null;
  navRoot.addEventListener('pointerdown', event => { if (ui.locked || ui.view === 'lock' || event.button > 0) return; searchSwipe = {id: event.pointerId, x: event.clientX, y: event.clientY, panel: null}; }, true);
  window.addEventListener('pointermove', event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const box = overlayRoot.getBoundingClientRect(), k = box.width / overlayRoot.offsetWidth || 1;
    if (!searchSwipe.panel) {
      if ((searchSwipe.y - event.clientY) / k < JBSearchPanel.S.up) return;
      const home = navRoot.querySelector('.nav-home').getBoundingClientRect();
      ui.overlay = 'search'; overlayRoot.innerHTML = ''; renderOverlay();
      searchSwipe.panel = JBSearchPanel.attach(overlayRoot.querySelector('[data-jb-search]'), {homeX: (home.left + home.width / 2 - box.left) / k, haptic: () => lp.data.settings.haptic !== false, reduced: !!reducedMotion?.matches,
        onLaunch: () => { ui.overlay = ''; renderOverlay(); openApp('google-search'); },
        onClose: () => { if (ui.overlay === 'search') { ui.overlay = ''; renderOverlay(); } }});
      lp.suppressClickUntil = Infinity;
    }
    const panel = overlayRoot.querySelector('[data-jb-search]').getBoundingClientRect();
    searchSwipe.panel.move((event.clientX - panel.left) / k, (event.clientY - panel.top) / k);
  }, true);
  const endSearchSwipe = event => {
    if (!searchSwipe || event.pointerId !== searchSwipe.id) return;
    const panel = searchSwipe.panel; searchSwipe = null;
    if (!panel) return;
    lp.suppressClickUntil = Date.now() + 350;
    event.type === 'pointercancel' ? panel.cancel() : panel.release();
  };
  window.addEventListener('pointerup', endSearchSwipe, true); window.addEventListener('pointercancel', endSearchSwipe, true);
  let barsPeekTimer = 0;
  screen.addEventListener('pointerdown', event => {
    if (!screen.classList.contains('kk-immersive')) return;
    const rect = screen.getBoundingClientRect(), y = event.clientY - rect.top;
    if (y > 24 && y < rect.height - 24) return;
    screen.classList.add('kk-bars-peek'); clearTimeout(barsPeekTimer);
    barsPeekTimer = setTimeout(() => screen.classList.remove('kk-bars-peek'), 3000);
  }, true);
  Object.assign(lp, {updateBarMode, renderStatus, renderNav, statusIndicators, statusBarHeight});
  // lp:code
  return {
    // lp:hooks
    overlays: {
      'search'() {
        if (!overlayRoot.querySelector('[data-jb-search]')) overlayRoot.innerHTML = JBSearchPanel.markup(key => i18n.t(key));
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
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
