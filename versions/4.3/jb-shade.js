/* Android 4.3 phone notification panel (SystemUI PhoneStatusBar, flip settings and QuickSettings). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // PhoneStatusBar.FLIP_DURATION_OUT / FLIP_DURATION_IN.
  const FLIP_OUT = 125, FLIP_IN = 225;
  // Clear-all: rows leave one after another, the gap starting at 140 ms and shrinking by 10 ms (minimum 50 ms).
  function clearDelays(count) {
    const delays = []; let current = 140, total = 0;
    for (let i = 0; i < count; i++) { delays.push(total); current = Math.max(50, current - 10); total += current; }
    return delays;
  }
  /* QuickSettings.setupQuickSettings for phones: user, brightness, settings, Wi-Fi, mobile signal, battery,
     airplane mode, Bluetooth, then the temporary alarm and location tiles. No rotation tile on phones. */
  function tiles(settings, {carrier, alarm, battery = 71}) {
    const wifiConnected = settings.wifi && settings.wifiNetwork && !settings.airplane;
    const list = [
      {id: 'user', icon: 'ic_qs_default_user', label: 'Me', action: 'qs-user'},
      {id: 'brightness', icon: settings.autoBrightness ? 'ic_qs_brightness_auto_on' : 'ic_qs_brightness_auto_off', label: 'Brightness', action: 'qs-brightness'},
      {id: 'settings', icon: 'ic_qs_settings', label: 'Settings', action: 'qs-settings'},
      {id: 'wifi', icon: !settings.wifi || settings.airplane ? 'ic_qs_wifi_no_network' : wifiConnected ? 'ic_qs_wifi_full_4' : 'ic_qs_wifi_0', label: !settings.wifi || settings.airplane ? 'Wi-Fi Off' : wifiConnected ? settings.wifiNetwork : 'Wi-Fi', raw: !!wifiConnected, action: 'qs-wifi', toggle: 'wifi'},
      {id: 'rssi', icon: settings.airplane ? 'ic_qs_signal_no_signal' : 'ic_qs_signal_full_4', overlay: settings.airplane || !settings.dataEnabled ? '' : 'ic_qs_signal_full_h', label: settings.airplane ? 'No service.' : carrier, raw: !settings.airplane, action: 'qs-rssi'},
      {id: 'battery', icon: 'ic_qs_battery_71', label: `${battery}%`, raw: true, action: 'qs-battery'},
      {id: 'airplane', icon: settings.airplane ? 'ic_qs_airplane_on' : 'ic_qs_airplane_off', label: 'Airplane mode', action: 'qs-airplane', pressed: !!settings.airplane},
      {id: 'bluetooth', icon: !settings.bluetooth ? 'ic_qs_bluetooth_off' : settings.pairedDevice ? 'ic_qs_bluetooth_on' : 'ic_qs_bluetooth_not_connected', label: !settings.bluetooth ? 'Bluetooth Off' : settings.pairedDevice || 'Bluetooth', raw: !!(settings.bluetooth && settings.pairedDevice), action: 'qs-bluetooth', toggle: 'bluetooth'}
    ];
    if (alarm) list.push({id: 'alarm', icon: 'ic_qs_alarm_on', label: alarm, raw: true, action: 'qs-alarm'});
    if (settings.gps) list.push({id: 'location', icon: 'ic_qs_location', label: 'Location in use', action: 'qs-location'});
    // Wifi Display tile: setShowWhenEnabled, so it appears only while wireless display is on (Nexus 4 enables the feature).
    if (settings.wifiDisplay && settings.wifi && !settings.airplane) list.push({id: 'wifi-display', icon: 'ic_qs_remote_display', label: 'Wireless Display', action: 'qs-wifi-display'});
    return list;
  }
  function tileMarkup(tile, t) {
    const label = tile.raw ? tile.label : t(tile.label);
    return `<button class="jb-qs-tile${tile.pressed ? ' on' : ''}" data-action="${tile.action}" data-qs="${tile.id}" ${tile.toggle ? `data-qs-toggle="${tile.toggle}"` : ''} aria-label="${e(label)}"><span class="jb-qs-icon"><img src="assets/jb-${tile.icon}.png" alt="">${tile.overlay ? `<img class="jb-qs-overlay" src="assets/jb-${tile.overlay}.png" alt="">` : ''}</span><span class="jb-qs-label" data-no-translate>${e(label)}</span></button>`;
  }
  // Notification template: 64dp large icon, title, text, time and the small icon; the expanded form adds big text and actions.
  function row(note, t, locale, expanded) {
    const time = note.time ? new Date(note.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : '';
    const big = note.big || note.detail;
    const actions = expanded && note.actions?.length ? `<div class="jb-note-actions">${note.actions.map(action => `<button data-action="notification-action" data-id="${e(note.id)}" data-note-action="${e(action.id)}"><img src="assets/${e(action.icon)}" alt="">${e(t(action.label))}</button>`).join('')}</div>` : '';
    return `<div class="notification jb-note${expanded ? ' expanded' : ''}" data-id="${e(note.id)}"><button class="jb-note-main" data-action="notification-open" data-id="${e(note.id)}"><span class="jb-note-icon"><img src="assets/${e(note.icon || 'settings.png')}" alt=""></span><span class="jb-note-body"><span class="jb-note-top"><strong data-no-translate>${e(t(note.title))}</strong><time>${e(time)}</time></span><span class="jb-note-text" data-no-translate>${e(t(expanded ? big : note.detail))}</span><img class="jb-note-small" src="assets/${e(note.smallIcon || note.icon || 'settings.png')}" alt=""></span></button>${actions}</div>`;
  }
  // The newest notification is shown expanded, as NotificationRowLayout does for the top item.
  function isExpanded(note, index, ui) {
    const choice = ui.noteExpanded?.[note.id];
    return choice === undefined ? index === 0 && !!(note.big || note.actions?.length) : choice;
  }
  function render(data, ui, t, {locale, clock, date, carrier, alarm, extra = ''}) {
    const notes = data.notifications || [], qs = !!ui.shadeSettings;
    return `<div class="notification-shade jb-shade${qs ? ' show-settings' : ''}"><div class="shade-top jb-shade-header"><div class="jb-shade-datetime"><span class="jb-shade-clock">${e(clock)}</span><span class="jb-shade-date">${e(date)}</span></div><button class="jb-shade-clear" data-action="clear-notifications" aria-label="${e(t('Clear all notifications.'))}" ${notes.length && !qs ? '' : 'hidden'}><img src="assets/jb-ic_notify_clear_normal.png" alt=""></button><button class="jb-shade-flip" data-action="shade-flip" aria-label="${e(t(qs ? 'Notifications.' : 'Quick settings.'))}"><img class="jb-flip-settings" src="assets/jb-ic_notify_settings_normal.png" alt=""><img class="jb-flip-notifications" src="assets/jb-ic_notifications_normal.png" alt=""></button></div><div class="jb-shade-pages"><div class="shade-list jb-shade-list">${extra}${notes.map((note, index) => row(note, t, locale, isExpanded(note, index, ui))).join('')}</div><div class="jb-qs" role="group" aria-label="${e(t('Quick settings.'))}">${tiles(data.settings, {carrier, alarm}).map(tile => tileMarkup(tile, t)).join('')}</div></div><div class="shade-carrier jb-shade-carrier">${e(carrier)}</div><button class="shade-handle" data-action="close-overlay" aria-label="Close notifications"><img src="assets/status_bar_close_on.png" alt=""></button></div>`;
  }
  // Card flip between notifications and quick settings: the visible page squashes horizontally, then the other grows.
  function flip(shade, toSettings, reduced = false) {
    const pages = shade?.querySelector('.jb-shade-pages');
    if (!pages) return;
    const out = pages.querySelector(toSettings ? '.jb-shade-list' : '.jb-qs'), inn = pages.querySelector(toSettings ? '.jb-qs' : '.jb-shade-list');
    shade.classList.toggle('show-settings', toSettings);
    if (reduced || !out?.animate) return;
    out.style.visibility = 'visible';
    out.animate([{transform: 'scaleX(1)'}, {transform: 'scaleX(0)'}], {duration: FLIP_OUT, easing: 'cubic-bezier(.55,0,1,.45)', fill: 'both'}).finished.then(animation => { out.style.visibility = ''; animation.effect.target.getAnimations().forEach(a => a.cancel()); }, () => {});
    inn.animate([{transform: 'scaleX(0)'}, {transform: 'scaleX(1)'}], {duration: FLIP_IN, delay: FLIP_OUT, easing: 'cubic-bezier(0,.55,.45,1)', fill: 'backwards'});
  }
  window.JBShade = {FLIP_OUT, FLIP_IN, clearDelays, tiles, row, isExpanded, render, flip};
})();
/* The notification shade of Android 4.3 (SystemUI of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): the notifications (expanded by two fingers or Ctrl + wheel), their actions and
   Clear all, the flip to Quick Settings with its tiles and the brightness dialog, the next alarm's label. Pulling the
   shade down and up is the core's gesture; it measures the panel with shadeFullHeight. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, clock, contactByPhone, data, deviceDate, fullDate, hangoutsScope, i18n, navRoot, openApp, openMessageThread, overlayRoot, reducedMotion, render, renderOverlay, renderStatus, row, safe, save, screen, toast, ui;
  const $bind = c => { $c = c; ({clock, contactByPhone, data, deviceDate, fullDate, hangoutsScope, i18n, navRoot, openApp, openMessageThread, overlayRoot, reducedMotion, render, renderOverlay, renderStatus, row, safe, save, screen, toast, ui} = c); };
  // NotificationPanelView wraps its content (header, list, carrier label and handle); the rest is scrim.
  function shadeFullHeight(shade) {
    // Measure the open panel: its CSS top and bottom, not the drag's explicit height or bottom:auto.
    const previous = shade.style.height, previousBottom = shade.style.bottom; shade.style.height = ''; shade.style.bottom = '';
    const full = Math.min(shade.offsetHeight, screen.clientHeight - shade.offsetTop - navRoot.offsetHeight);
    shade.style.height = previous; shade.style.bottom = previousBottom; return full;
  }
  function decorateNotification(note) {
    if (note.id === 2) return {...note, icon: 'mms-ic_contact_picture.png', smallIcon: 'stat_notify_sms.png', big: 'Hey! Are we still on for coffee tomorrow?\nSee you at 11!'};
    if (note.kind === 'message' && note.channel === 'hangouts') return {...note, icon: 'mms-ic_contact_picture.png', smallIcon: 'hg1-stat_notify_chat.png', big: note.detail};
    if (note.kind === 'calendar') return {...note, icon: 'calendar.png', smallIcon: 'calendar-stat_notify_calendar.png', big: note.detail, actions: [{id: 'snooze', label: 'Snooze', icon: 'calendar-ic_alarm_holo_dark.png'}]};
    return {...note, icon: 'settings.png', smallIcon: 'stat_notify_more.png'};
  }
  // Settings.System.NEXT_ALARM_FORMATTED, shown by the temporary alarm tile.
  function nextAlarmLabel() {
    const next = data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    return next ? next.toLocaleString(i18n.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
  }
  /* Jelly Bean notifications expand with a two-finger swipe down or a pinch out (trackpad pinches arrive as
     Ctrl+wheel), and collapse with the opposite gesture. */
  function setNoteExpanded(id, expanded) {
    ui.noteExpanded = {...ui.noteExpanded, [id]: expanded};
    renderOverlay();
  }
  const spec = {
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'shade': ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
        case 'clear-notifications': {
          const rows = [...overlayRoot.querySelectorAll('.jb-note')], delays = JBShade.clearDelays(rows.length);
          if (reducedMotion?.matches || !rows.length) { data.notifications = []; ui.overlay = ''; save(); renderStatus(); renderOverlay(); break; }
          overlayRoot.querySelector('.jb-shade-clear')?.setAttribute('hidden', '');
          rows.forEach((row, index) => row.animate([{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${row.offsetWidth}px)`, opacity: 0}], {duration: 125, delay: delays[index], easing: 'linear', fill: 'forwards'}));
          setTimeout(() => { data.notifications = []; save(); renderStatus(); if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }, (delays.at(-1) || 0) + 125 + 225);
          break;
        }
        case 'shade-flip': ui.shadeSettings = !ui.shadeSettings; JBShade.flip(overlayRoot.querySelector('.jb-shade'), ui.shadeSettings, reducedMotion?.matches); { const button = overlayRoot.querySelector('.jb-shade-flip'); button?.setAttribute('aria-label', i18n.t(ui.shadeSettings ? 'Notifications.' : 'Quick settings.')); overlayRoot.querySelector('.jb-shade-clear')?.toggleAttribute('hidden', ui.shadeSettings || !data.notifications.length); } break;
        case 'qs-user': ui.overlay = ''; openApp('people'); break;
        case 'qs-brightness': ui.overlay = 'qs-brightness'; renderOverlay(); break;
        case 'qs-settings': ui.overlay = ''; openApp('settings'); break;
        case 'qs-wifi': ui.overlay = ''; openApp('settings'); ui.sub = 'wifi'; render(); break;
        case 'qs-rssi': ui.overlay = ''; openApp('settings'); ui.sub = 'data'; render(); break;
        case 'qs-battery': ui.overlay = ''; openApp('settings'); ui.sub = 'battery'; render(); break;
        case 'qs-airplane': data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); renderStatus(); renderOverlay(); break;
        case 'qs-bluetooth': ui.overlay = ''; openApp('settings'); ui.sub = 'bluetooth'; render(); break;
        case 'qs-alarm': ui.overlay = ''; openApp('clock'); break;
        case 'qs-location': ui.overlay = ''; openApp('settings'); ui.sub = 'location'; render(); break;
        case 'notification-action': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar' && button.dataset.noteAction === 'snooze') { data.notifications = data.notifications.filter(item => item !== note); (data.calendarSnoozes ||= []).push({eventId: note.eventId, date: note.date, title: note.title, detail: note.detail, at: deviceDate().getTime() + 5 * 60000}); save(); renderStatus(); if (!data.notifications.length) ui.overlay = ''; renderOverlay(); toast('Snoozed'); } break; }
        case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; }
          if (note?.kind === 'message' && note.channel === 'hangouts') { data.notifications = data.notifications.filter(item => item !== note); ui.overlay = ''; openApp('hangouts'); ui.hgPage = ''; hangoutsScope(() => openMessageThread(note.contact)); break; }
          ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break; }
        case 'qs-wifi-display': ui.overlay = ''; ui.view = 'settings'; ui.sub = 'wifi-display'; render(); break;
        default: return false;
      }
      return true;
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'shade') {
        const call = ui.activeCall ? `<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>` : '';
        overlayRoot.innerHTML = '<div class="jb-shade-scrim" data-action="close-overlay"></div>' + JBShade.render({...data, notifications: data.notifications.map(decorateNotification)}, ui, key => i18n.t(key), {locale: i18n.locale(), clock: clock(), date: fullDate(), carrier: data.settings.airplane ? i18n.t('No service.') : (data.settings.networkOperator || 'Telekom'), alarm: nextAlarmLabel(), extra: call});
      } else if (ui.overlay === 'qs-brightness') {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jb-brightness" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><h3>${safe(i18n.t('Brightness'))}</h3><div class="jb-brightness-row"><img src="assets/jb-ic_qs_brightness_auto_off.png" alt=""><input type="range" min="10" max="100" value="${data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" ${data.settings.autoBrightness ? 'disabled' : ''}><label><input type="checkbox" data-field="auto-brightness" ${data.settings.autoBrightness ? 'checked' : ''}><span>${safe(i18n.t('AUTO'))}</span></label></div></div>`;
      }
      else return;
      return true;
    },
    // Once: a notification grows or shrinks with a two-finger drag, or with Ctrl and the wheel.
    init(make, c) {
      $bind(c);
      screen.addEventListener('wheel', event => {
        $bind(make());
        const note = ui.overlay === 'shade' && event.ctrlKey ? event.target.closest('.jb-note') : null;
        if (!note) return;
        event.preventDefault(); event.stopImmediatePropagation();
        setNoteExpanded(note.dataset.id, event.deltaY < 0);
      }, {passive: false, capture: true});
      let noteGesture = null;
      screen.addEventListener('touchstart', event => {
        $bind(make());
        const note = ui.overlay === 'shade' && event.touches.length === 2 ? event.target.closest('.jb-note') : null;
        noteGesture = note ? {id: note.dataset.id, y: (event.touches[0].clientY + event.touches[1].clientY) / 2} : null;
      }, {passive: true});
      screen.addEventListener('touchmove', event => {
        if (!noteGesture || event.touches.length !== 2) return;
        $bind(make());
        const y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        if (Math.abs(y - noteGesture.y) > 30) { const {id} = noteGesture, down = y > noteGesture.y; noteGesture = null; setNoteExpanded(id, down); }
      }, {passive: true});
    },
    exports: {
      shadeFullHeight: (c, ...args) => { $bind(c); return shadeFullHeight(...args); },
      nextAlarmLabel: (c, ...args) => { $bind(c); return nextAlarmLabel(...args); }
    }
  };
  JB.register('shade', spec);
})();
