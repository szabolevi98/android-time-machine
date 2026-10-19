/* Android 2.1 status bar and notification panel: framework-res.apk status_bar.xml, status_bar_expanded.xml,
   status_bar_latest_event(_content).xml and status_bar_tracking.xml, run by services.jar StatusBarService / StatusBarPolicy
   (ERE27). Modules 'statusbar' (the bar) and 'shade' (the expanded panel, an overlay).
   - Icons: config array status_bar_icon_order (clock, alarm_clock, battery, phone_signal, phone_evdo_signal,
     data_connection, cdma_eri, tty, volume, mute, speakerphone, wifi, tty, bluetooth, gps, sync_active, sync_failing, ime);
     index 0 sits rightmost. Each icon is a 25 dp square (status_bar_icon.xml); the clock is a text icon, 16 sp bold black
     (StatusBarIcon), "h:mm a" (twelve_hour_time_format) or "HH:mm".
   - Ticker (Ticker.java): TICKER_SEGMENT_DELAY 3000 ms per segment; push_up_in/out and push_down_in/out are 400 ms
     (config_longAnimTime) translate + alpha.
   - DateView: java.text.DateFormat.getDateInstance(LONG), 16 sp bold, shown over the icons while the panel is open.
   - Panel motion (StatusBarService.performFling / incrementAnim): y += v t + a t^2 / 2, a = +-2000 px/s^2, an expand
     starts at 2000 px/s, a collapse at -2000 px/s; a release opens when v > 200 px/s, or below half the display (closed)
     or the last 25 px (open) with v > -200 px/s. Pixels are hdpi (1.5 per dp).
   Notifications are data.notifications rows {id, icon, title, text, when, ongoing, view, sub, ticker}; apps post them with
   c.notify(row) and they keep the order StatusBarService gives: newest first in each section. */
(() => {
  'use strict';
  const T = () => EC.text('statusbar');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[ch]);
  const icon = (file, cls = '') => `<span class="ecsb-icon${cls}"><img src="assets/${file}" alt=""></span>`;

  // The simulator's own first-boot notifications, as in every version (docs/demo-data.md): the welcome (the framework's
  // ic_launcher_android robot) and Alex's message, which opens the conversation; their texts are translated (i18n.js).
  EC.defaults.notifications = [
    {id: 'demo-welcome', icon: 'fw-ic_launcher_android.png', title: 'Welcome to Android 2.1', text: 'Your Nexus One is ready to explore.', when: Date.now() - 2 * 60000, demo: true},
    {id: 'demo-alex', icon: 'mm-stat_notify_sms.png', title: 'New message from Alex', text: 'See you at 11!', when: Date.now() - 61 * 60000, demo: true, view: 'messaging', sub: 'compose', ui: {smsThread: '202-555-0148'}}];
  // SettingsProvider defaults of the image (def_wifi_on false, def_bluetooth_on false, def_airplane_mode_on false).
  Object.assign(EC.defaults.settings, {wifi: false, wifiConnected: false, bluetooth: false, airplane: false, ringer: '', battery: 80, charging: false, gps: false, hour24: null});

  // is24HourFormat: the setting when set, else the locale's own time format (en-US 12 h; de, fr, es, hu 24 h).
  const hour24 = c => c.data.settings.hour24 ?? c.lang !== 'en';
  function clockText(c, date = c.now()) {
    if (hour24(c)) return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    return `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')} ${c.javaAmPm(date.getHours())}`;
  }
  const longDate = c => c.now().toLocaleDateString(c.locale(), {year: 'numeric', month: 'long', day: 'numeric'});
  // stat_sys_battery level-list: 0-4 → 0, 5-14 → 10, 15-29 → 20, 30-49 → 40, 50-69 → 60, 70-89 → 80, 90-100 → 100.
  const battery = (level, charging) => charging ? 'fw-stat_sys_battery_charge_anim5.png'
    : `fw-stat_sys_battery_${level < 5 ? 0 : level < 15 ? 10 : level < 30 ? 20 : level < 50 ? 40 : level < 70 ? 60 : level < 90 ? 80 : 100}.png`;

  // Left to right: the order array read from its end (index 0, the clock, is rightmost).
  function statusIcons(c) {
    const s = c.data.settings, out = [];
    if (s.gps) out.push(icon('fw-stat_sys_gps_on.png'));
    if (s.bluetooth) out.push(icon('fw-stat_sys_data_bluetooth.png'));
    if (!s.airplane && s.wifi && s.wifiConnected) out.push(icon('fw-stat_sys_wifi_signal_4.png'));
    if (s.ringer) out.push(icon(`fw-stat_sys_ringer_${s.ringer}.png`));
    if (!s.airplane && !(s.wifi && s.wifiConnected)) out.push(icon('fw-stat_sys_data_connected_3g.png'));
    out.push(icon(s.airplane ? 'fw-stat_sys_signal_flightmode.png' : 'fw-stat_sys_signal_4.png'));
    out.push(icon(battery(s.battery, s.charging)));
    if ((c.data.alarms || []).some(alarm => alarm.enabled)) out.push(icon('fw-stat_notify_alarm.png'));
    out.push(`<span class="ecsb-clock">${esc(clockText(c))}</span>`);
    return out.join('');
  }
  const notificationIcons = c => (c.data.notifications || []).map(n => icon(n.icon)).join('');

  // The bar keeps its layers across renders so a running ticker is not cut off by an icon update.
  let ticking = null;
  function renderBar(c) {
    const expanded = c.ui.overlay === 'shade';
    return `<div class="ecsb${expanded ? ' ecsb-expanded' : ''}${ticking ? ' ecsb-ticking' : ''}" data-action="ecsb-open" role="button" aria-label="${esc(c.t('Notifications'))}"><i class="ec-bg np-fw-statusbar_background"></i>
      <div class="ecsb-icons"><div class="ecsb-notifications">${notificationIcons(c)}</div><div class="ecsb-status">${statusIcons(c)}</div></div>
      <div class="ecsb-ticker" aria-live="polite"></div>
      <div class="ecsb-date"><i class="ec-bg np-fw-statusbar_background"></i><span>${esc(longDate(c))}</span></div></div>`;
  }

  // Ticker.reflowText: the text is cut into segments that fit the line, each shown for 3 s.
  function segments(text, width, font) {
    const ctx = segments.ctx ||= document.createElement('canvas').getContext('2d');
    ctx.font = font;
    const words = String(text).split(/\s+/), lines = [];
    let line = '';
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > width) { lines.push(line); line = word; } else line = next;
    }
    if (line) lines.push(line);
    return lines;
  }
  function startTicker(c, n) {
    const root = c.el.status.querySelector('.ecsb');
    if (!root || c.ui.sleeping) return;
    const layer = root.querySelector('.ecsb-ticker');
    const probe = document.createElement('span'); probe.className = 'ecsb-ticker-text'; layer.append(probe);
    const style = getComputedStyle(probe), width = layer.clientWidth - parseFloat(getComputedStyle(layer).paddingLeft) - probe.offsetLeft - parseFloat(style.paddingRight || 0) - 10;
    const parts = segments(n.ticker, Math.max(40, width), `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`);
    probe.remove();
    stopTicker();
    let index = 0, timer = 0;
    const show = first => {
      const old = layer.querySelector('.ecsb-seg:not(.out)');
      if (old) { old.classList.add('out'); setTimeout(() => old.remove(), 400); }
      layer.insertAdjacentHTML('beforeend', `<div class="ecsb-seg${first ? ' first' : ''}">${first ? icon(n.icon, ' ecsb-ticker-icon') : '<span class="ecsb-icon ecsb-ticker-icon"></span>'}<span class="ecsb-ticker-text">${esc(parts[index])}</span></div>`);
    };
    ticking = {stop: () => { clearTimeout(timer); layer.innerHTML = ''; root.classList.remove('ecsb-ticking', 'ecsb-ticker-done'); }};
    root.classList.add('ecsb-ticking'); root.classList.remove('ecsb-ticker-done');
    show(true);
    const advance = () => {
      index++;
      if (index < parts.length) { show(false); timer = setTimeout(advance, 3000); return; }
      root.classList.add('ecsb-ticker-done');
      timer = setTimeout(() => { stopTicker(); }, 400);
    };
    timer = setTimeout(advance, 3000);
  }
  function stopTicker() { ticking?.stop(); ticking = null; }

  // The panel ------------------------------------------------------------------------------------------------------------
  const timeOf = (c, when) => {
    const d = new Date(when), now = new Date();
    return d.toDateString() === now.toDateString() ? clockText(c, d) : d.toLocaleDateString(c.locale(), {month: 'numeric', day: 'numeric', year: '2-digit'});
  };
  const item = (c, n) => `<div class="ecsh-event"><button type="button" class="ecsh-item" data-action="ecsh-open" data-id="${esc(n.id)}"><i class="ec-bg np-fw-status_bar_item_background_normal"></i><i class="ec-bg ec-pressed np-fw-status_bar_item_background_pressed"></i><i class="ec-bg ec-focused np-fw-status_bar_item_background_focus"></i><span class="ecsh-row"><img class="ecsh-icon" src="assets/${esc(n.icon)}" alt=""><span class="ecsh-title">${esc(n.demo ? c.t(n.title) : n.title)}</span></span><span class="ecsh-row"><span class="ecsh-text">${esc(n.demo ? c.t(n.text) : n.text)}</span>${n.when ? `<span class="ecsh-time">${esc(timeOf(c, n.when))}</span>` : ''}</span></button><i class="ecsh-divider"></i></div>`;
  function renderShade(c) {
    const list = c.data.notifications || [], ongoing = list.filter(n => n.ongoing), latest = list.filter(n => !n.ongoing);
    const title = key => `<div class="ecsh-title-bar"><i class="ec-bg np-fw-title_bar_portrait"></i><span>${esc(T().t(key))}</span></div>`;
    const body = !list.length ? title('status_bar_no_notifications_title')
      : `${ongoing.length ? title('status_bar_ongoing_events_title') + ongoing.map(n => item(c, n)).join('') : ''}${latest.length ? title('status_bar_latest_events_title') + latest.map(n => item(c, n)).join('') : ''}`;
    const carrier = c.data.settings.airplane ? '' : (c.data.settings.carrier || 'T-Mobile');
    return `<div class="ecsh" role="dialog" aria-label="${esc(c.t('Notifications'))}"><div class="ecsh-panel">
      <div class="ecsh-header"><i class="ec-bg np-fw-status_bar_header_background"></i><div class="ecsh-carrier">${esc(carrier)}</div>${latest.length ? `<button type="button" class="ecsh-clear" data-action="ecsh-clear"><i class="ec-bg np-fw-btn_default_small_normal"></i><i class="ec-bg ec-pressed np-fw-btn_default_small_pressed"></i><span>${esc(T().t('status_bar_clear_all_button'))}</span></button>` : ''}</div>
      <div class="ecsh-scroll"><div class="ecsh-list">${body}</div><img class="ecsh-shadow" src="assets/fw-title_bar_shadow.9.png" alt=""></div>
      <div class="ecsh-close" data-action="ecsh-close" role="button" aria-label="${esc(c.t('Close'))}"><i></i><i></i><i></i><i></i><i></i></div></div></div>`;
  }

  // Motion. Positions are the panel's bottom edge, measured from the top of the screen, in CSS px.
  const px = c => c.el.screen.clientWidth / 320 / 1.5;   // one hdpi pixel
  let anim = 0, panelY = 0;
  function place(c, y) {
    panelY = y;
    const panel = c.el.overlay.querySelector('.ecsh-panel');
    if (panel) panel.style.transform = `translateY(${Math.round((y - c.el.screen.clientHeight) * 100) / 100}px)`;
  }
  function animate(c, from, velocity, accel, done) {
    cancelAnimationFrame(anim);
    const top = c.el.status.offsetHeight, bottom = c.el.screen.clientHeight, k = px(c);
    let y = from, v = velocity * k, last = performance.now();
    const step = now => {
      const t = Math.min(0.05, (now - last) / 1000); last = now;
      y += v * t + 0.5 * accel * k * t * t; v += accel * k * t;
      if (y >= bottom) { place(c, bottom); done(true); return; }
      if (y <= top && v <= 0) { place(c, top); done(false); return; }
      place(c, y); anim = requestAnimationFrame(step);
    };
    place(c, y); anim = requestAnimationFrame(step);
  }
  function expand(c, from = c.el.status.offsetHeight, velocity = 2000) {
    if (c.ui.overlay !== 'shade') { stopTicker(); c.ui.overlay = 'shade'; c.render(); }
    animate(c, from, velocity, 2000, open => open || collapseDone(c));
  }
  function collapse(c, from = panelY || c.el.screen.clientHeight, velocity = -2000) {
    animate(c, from, velocity, -2000, open => open || collapseDone(c));
  }
  function collapseDone(c) { panelY = 0; if (c.ui.overlay === 'shade') { c.ui.overlay = ''; c.render(); } }
  // performFling
  function fling(c, y, velocity, expanded) {
    const k = px(c), v = velocity / k, h = c.el.screen.clientHeight / k, yy = y / k;
    const open = expanded ? v > 200 || (yy > h - 25 && v > -200) : v > 200 || (yy > h / 2 && v > -200);
    if (open) animate(c, y, Math.max(v, 0) || 0, 2000, o => o || collapseDone(c));
    else animate(c, y, Math.min(v, 0) || 0, -2000, o => o || collapseDone(c));
  }

  // Dragging from the bar opens the panel under the finger; dragging the close handle moves it back.
  let drag = null;
  function startDrag(c, event, expanded) {
    if (c.ui.sleeping || c.ui.view === 'lock' && !expanded) return;
    cancelAnimationFrame(anim);
    const top = c.el.screen.getBoundingClientRect().top;
    drag = {c, top, expanded, moved: false, startY: event.clientY, samples: [[performance.now(), event.clientY - top]], id: event.pointerId};
  }
  window.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const {c} = drag, y = event.clientY - drag.top;
    if (!drag.moved && Math.abs(event.clientY - drag.startY) < 4) return;
    if (!drag.moved) { drag.moved = true; if (c.ui.overlay !== 'shade') { stopTicker(); c.ui.overlay = 'shade'; c.render(); } }
    place(c, Math.min(c.el.screen.clientHeight, Math.max(c.el.status.offsetHeight, y)));
    drag.samples.push([performance.now(), y]); if (drag.samples.length > 6) drag.samples.shift();
  });
  window.addEventListener('pointerup', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const d = drag; drag = null;
    if (!d.moved) return;   // a tap: the click handler opens or closes
    d.c.suppressClick = Date.now() + 300;
    const [t0, y0] = d.samples[0], [t1, y1] = d.samples.at(-1);
    fling(d.c, y1, (y1 - y0) / Math.max(0.001, (t1 - t0) / 1000), d.expanded);
  });

  // NotificationManagerService.updateLightsLocked (services.odex): the newest notification with FLAG_SHOW_LIGHTS
  // ({lights: {color, on, off}}: ledARGB, ledOnMS, ledOffMS) flashes LIGHT_ID_NOTIFICATIONS, LIGHT_FLASH_TIMED, while the
  // screen is off, no call is going on and Settings' "Pulse notification light" (notification_light_pulse) is on. On
  // the Nexus One that light is the trackball (lights.mahimahi.so: jogball-backlight color and period).
  EC.register('led', {
    app: false, render: () => '',
    pulse(c) {
      if (c.data.prefs?.notification_pulse === false || EC.module('incall')?.active?.()) return null;
      return (c.data.notifications || []).find(n => n.lights)?.lights || null;
    }
  });

  EC.register('statusbar', {
    init(c) {
      c.notify = n => {
        const row = {id: Date.now() + Math.random(), when: Date.now(), ...n};
        c.data.notifications = [row, ...(c.data.notifications || []).filter(x => x.id !== row.id)];
        c.save(); c.render();
        if (row.ticker) startTicker(c, row);
        return row;
      };
      c.expandShade = () => expand(c);
      c.cancelNotification = id => { c.data.notifications = (c.data.notifications || []).filter(n => n.id !== id); c.save(); c.render(); };
      c.el.status.addEventListener('pointerdown', event => startDrag(c, event, false));
      c.el.overlay.addEventListener('pointerdown', event => { if (event.target.closest('.ecsh-close')) startDrag(c, event, true); });
    },
    render: c => renderBar(c),
    action(name, el, event, c) {
      if (name !== 'ecsb-open' || (c.suppressClick || 0) > Date.now()) return name === 'ecsb-open';
      if (c.ui.view === 'lock') return true;
      if (c.ui.overlay === 'shade') collapse(c); else expand(c);
      return true;
    },
    tick(c) { const clock = c.el.status.querySelector('.ecsb-clock'); if (clock) clock.textContent = clockText(c); }
  });

  EC.register('shade', {
    render: c => renderShade(c),
    mount(c) { place(c, panelY || c.el.status.offsetHeight); },
    back(c) { collapse(c); return true; },
    action(name, el, event, c) {
      if ((c.suppressClick || 0) > Date.now()) return true;
      if (name === 'ecsh-close') { collapse(c); return true; }
      if (name === 'ecsh-clear') { c.data.notifications = c.data.notifications.filter(n => n.ongoing); c.save(); c.render(); collapse(c); return true; }
      if (name === 'ecsh-open') {
        const n = c.data.notifications.find(x => String(x.id) === el.dataset.id);
        if (!n) return true;
        if (!n.ongoing) c.data.notifications = c.data.notifications.filter(x => x !== n);
        c.save(); c.ui.overlay = ''; panelY = 0;
        if (n.ui) Object.assign(c.ui, n.ui);
        if (n.view) c.open(n.view, n.sub || ''); else if (n.overlay) c.overlay(n.overlay); else c.render();
        return true;
      }
      return false;
    },
    menu() {}
  });
})();
