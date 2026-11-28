/* The notification shade and Quick Settings on Android 5.1.1 (lp-shade.js draws them), moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the panel, its closing animation, the peek, the pull down and its fling; Quick Settings and the tile details
   - notifications: adding (lp.addNotification), decorating, heads-up, expanding, clearing; the brightness dialogs */
'use strict';
LP.define('shade', ({
  activeTouches, clock, deviceDate, dp, fullDate, holdDelay, i18n, navRoot, openApp, overlayRoot, reducedMotion,
  render, renderOverlay, safe, save, screen, shadeDate, suppressReleaseClick, toast, ui
}, lp) => {
  function startPeek() {
    if (ui.overlay || ui.locked || ui.view === 'lock') return;
    ui.shadePeek = true; ui.peekDone = false; ui.peekCollapse = false; ui.overlay = 'shade'; renderOverlay();
    const shade = overlayRoot.querySelector('.notification-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
    if (!shade) return;
    LPShade.peek(shade, scrim, () => { ui.peekDone = true; if (ui.peekCollapse) closePeek(); });
  }
  function closePeek() { if (!ui.shadePeek) return; ui.shadePeek = false; ui.peekCollapse = false; if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }
  // QS tile clicks (QSTile.handleClick): Wi-Fi, Bluetooth, airplane, rotation, flashlight, location, invert and hotspot
  // toggle in place; Cellular opens data usage and Cast its settings, as their details point there.
  function lpQsToggle(id) {
    const s = lp.data.settings;
    if (id === 'wifi') { s.wifi = !s.wifi; if (s.wifi) { s.airplane = false; s.portableHotspot = false; } }
    else if (id === 'bluetooth') s.bluetooth = !s.bluetooth;
    else if (id === 'airplane') { s.airplane = !s.airplane; if (s.airplane) { s.wifi = false; s.bluetooth = false; } }
    else if (id === 'rotation') s.rotate = s.rotate === false;
    else if (id === 'flashlight') s.flashlight = !s.flashlight;
    else if (id === 'location') s.locationAccess = !(s.locationAccess !== false && (s.gps || s.networkLocation)) ? true : false, s.locationAccess && !s.gps && !s.networkLocation && (s.networkLocation = true);
    else if (id === 'inversion') s.inversion = !s.inversion;
    else if (id === 'hotspot') { s.portableHotspot = !s.portableHotspot; if (s.portableHotspot) s.wifi = false; }
    else if (id === 'cell') { ui.overlay = ''; openApp('settings'); ui.sub = 'data'; render(); return; }
    else if (id === 'cast') { ui.overlay = ''; openApp('settings'); ui.sub = 'wifi-display'; render(); return; }
    if (['airplane', 'rotation', 'flashlight', 'location', 'inversion', 'hotspot'].includes(id)) ui.qsIconAnim = {...ui.qsIconAnim, [id]: performance.now()};
    save(); lp.renderStatus(); renderOverlay(); JBDeveloperOptions.apply(screen, lp.data.settings);
  }
  /* Each notification's Material look: the app's small icon on its accent colour (Notification.color) in the 40 dp
     circle, or the large icon (a contact photo) with the small icon badged on the colour. */
  function decorateNotification(note) {
    if (note.id === 2) return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-messenger.png', color: '#0277bd', big: 'Hey! Are we still on for coffee tomorrow?\nSee you at 11!', actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'message' && note.channel === 'hangouts') return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-hangouts.png', color: '#0f9d58', big: note.detail, actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'message') return {...note, largeIcon: 'mms-ic_contact_picture.png', smallIcon: 'lpn-messenger.png', color: '#0277bd', big: note.detail, actions: [{id: 'reply', label: 'Reply'}]};
    if (note.kind === 'calendar') return {...note, smallIcon: 'lpn-calendar.png', color: '#4285f4', big: note.detail, actions: [{id: 'snooze', label: 'Snooze'}]};
    if (note.kind === 'timer') return {...note, smallIcon: 'lpn-timer.png', color: '#00796b'};
    if (note.kind === 'market-dl') return {...note, smallIcon: 'lpn-download.png', color: '#607d8b'};
    if (note.kind === 'market-done') return {...note, smallIcon: 'lpn-play-installed.png', color: '#607d8b'};
    return {...note, smallIcon: 'lp-sysui-android.svg', color: '#9e9e9e'};
  }
  // AlarmManager.getNextAlarmClock: the next enabled alarm, in ms of device time (0 without one).
  function nextAlarmTime() { const next = lp.data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0]; return next ? next.getTime() : 0; }
  // Settings.System.NEXT_ALARM_FORMATTED, shown by the temporary alarm tile.
  function nextAlarmLabel() {
    const next = lp.data.alarms.filter(alarm => alarm.enabled).map(alarm => ICSDeskClock.nextOccurrence(alarm, deviceDate())).filter(Boolean).sort((a, b) => a - b)[0];
    return next ? next.toLocaleString(i18n.locale(), {weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: !lp.data.settings.hour24}) : '';
  }
  function addNotification(title, detail) { lp.data.notifications.unshift({ id: Date.now(), title, detail }); save(); lp.renderStatus(); }
  /* HeadsUpNotificationView (5.1): a high-priority notification drops in at the top over the running app, 8 dp in from
     the sides, and leaves after heads_up_notification_decay (10 s) or when swiped away; tapping it opens it. */
  let headsUpTimer = 0;
  // OvershootInterpolator (tension 2), DecelerateInterpolator / AccelerateInterpolator (factor 1), sampled.
  function headsUpFrames(enter) {
    const overshoot = t => { t -= 1; return t * t * (3 * t + 2) + 1; };
    return Array.from({length: 13}, (_, i) => {
      const t = i / 12, y = enter ? -50 * (1 - overshoot(t)) : -50 * overshoot(t), alpha = enter ? 1 - (1 - t) * (1 - t) : 1 - t * t;
      return {offset: t, transform: `translateY(${y.toFixed(2)}%)`, opacity: alpha.toFixed(3)};
    });
  }
  function headsUp(note) {
    if (ui.locked || ui.view === 'lock' || ui.sleeping || ui.overlay === 'shade') return;
    let layer = screen.querySelector('#lp-headsup');
    if (!layer) { layer = document.createElement('div'); layer.id = 'lp-headsup'; screen.insertBefore(layer, overlayRoot); }
    layer.innerHTML = LPShade.row(decorateNotification(note), key => i18n.t(key), i18n.locale(), true).replace('class="notification jb-note lp-note', 'class="notification lp-note lp-headsup-card');
    i18n.translateDOM(layer);
    const card = layer.firstElementChild;
    // Swiping the heads-up card up or sideways dismisses it into the shade (HeadsUpNotificationView.EdgeSwipeHelper).
    card.addEventListener('pointerdown', down => {
      const start = {x: down.clientX, y: down.clientY};
      const move = event => { const dx = event.clientX - start.x, dy = event.clientY - start.y; card.style.transform = Math.abs(dx) > Math.abs(dy) ? `translateX(${dx}px)` : `translateY(${Math.min(0, dy)}px)`; card.style.opacity = String(1 - Math.min(.7, Math.abs(dx) / 400)); };
      const up = event => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); const dx = event.clientX - start.x, dy = event.clientY - start.y; if (dy < -dp(26) || Math.abs(dx) > dp(99)) { lp.suppressClickUntil = Date.now() + 300; card.style.transform = ''; card.style.opacity = ''; releaseHeadsUp(dy < -dp(26) && Math.abs(dy) > Math.abs(dx) ? 'up' : dx < 0 ? 'left' : 'right'); } else { card.style.transform = ''; card.style.opacity = ''; } };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);
    });
    // Animation.StatusBar.HeadsUp (heads_up_enter): from -50 % with the overshoot interpolator, fading in with
    // decelerate_quad, config_shortAnimTime (200 ms).
    if (!reducedMotion?.matches) card.animate(headsUpFrames(true), {duration: 200, fill: 'backwards'});
    clearTimeout(headsUpTimer); headsUpTimer = setTimeout(() => releaseHeadsUp(), 10000);
  }
  function releaseHeadsUp(direction = 'up') {
    clearTimeout(headsUpTimer);
    const card = screen.querySelector('#lp-headsup .lp-headsup-card'); if (!card) return;
    const done = () => card.remove();
    if (reducedMotion?.matches || !card.animate) { done(); return; }
    // heads_up_exit: up to -50 % (overshoot) fading with accelerate_quad in 200 ms; a sideways swipe flies out.
    if (direction === 'up') { card.animate(headsUpFrames(false), {duration: 200, fill: 'forwards'}).finished.then(done, done); return; }
    card.animate([{transform: 'none', opacity: 1}, {transform: `translateX(${direction === 'left' ? '-' : ''}110%)`, opacity: 0}], {duration: 220, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards'}).finished.then(done, done);
  }
  /* Jelly Bean notifications expand with a two-finger swipe down or a pinch out (trackpad pinches arrive as
     Ctrl+wheel), and collapse with the opposite gesture. */
  function setNoteExpanded(id, expanded) {
    ui.noteExpanded = {...ui.noteExpanded, [id]: expanded};
    renderOverlay();
  }
  screen.addEventListener('wheel', event => {
    const note = ui.overlay === 'shade' && event.ctrlKey ? event.target.closest('.jb-note') : null;
    if (!note) return;
    event.preventDefault(); event.stopImmediatePropagation();
    setNoteExpanded(note.dataset.id, event.deltaY < 0);
  }, {passive: false, capture: true});
  let noteGesture = null;
  screen.addEventListener('touchstart', event => {
    const note = ui.overlay === 'shade' && event.touches.length === 2 ? event.target.closest('.jb-note') : null;
    noteGesture = note ? {id: note.dataset.id, y: (event.touches[0].clientY + event.touches[1].clientY) / 2} : null;
  }, {passive: true});
  screen.addEventListener('touchmove', event => {
    if (!noteGesture || event.touches.length !== 2) return;
    const y = (event.touches[0].clientY + event.touches[1].clientY) / 2;
    if (Math.abs(y - noteGesture.y) > 30) { const {id} = noteGesture, down = y > noteGesture.y; noteGesture = null; setNoteExpanded(id, down); }
  }, {passive: true});
  Object.assign(lp, {addNotification, nextAlarmLabel, nextAlarmTime, decorateNotification, headsUp});
  return {
    pointerupLate(event, dx, dy) {
      if (ui.overlay === 'shade' && lp.pointerStart.target.closest('.notification') && Math.abs(dx) > dp(61)) { const id = Number(lp.pointerStart.target.closest('.notification').dataset.id); lp.data.notifications = lp.data.notifications.filter(n => n.id !== id); save(); lp.renderStatus(); renderOverlay(); lp.pointerStart = null; return true; }
      if (!ui.overlay && lp.pointerStart.target.closest('#status-bar') && dy > dp(50)) { ui.overlay = 'shade'; renderOverlay(); }
      return false;
    },
    pointerup() {
      if (lp.pointerStart.qsPulled) { lp.pointerStart = null; return true; }
      if (lp.pointerStart.shadeDragging) {
        lp.suppressClickUntil = Date.now() + 350;
        // PanelView.onTrackingStopped: a fling decides by its direction, a slow release by the half-way point.
        const shade = overlayRoot.querySelector('.notification-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
        const velocity = lp.pointerStart.shadeVelocity || 0, height = shade ? shade.offsetHeight : 0, full = shade ? LPShade.maxHeight(shade) : 0;
        const close = Math.abs(velocity) > 400 * LPShade.DP() ? velocity < 0 : height < full / 2;
        if (close) { lp.closingVelocity = Math.abs(velocity); ui.overlay = ''; renderOverlay(); }
        else if (shade) LPShade.animate(shade, height, full, {velocity: Math.max(0, velocity), scrim, done: () => LPShade.settle(shade, scrim)});
        lp.pointerStart = null; return true;
      }
      return false;
    },
    pointerupPeek() {
      // A tap on the status bar (PanelView.collapse during a peek): the panel peeks, then collapses (mCollapseAfterPeek).
      if (lp.pointerStart.shadeDragEligible && !lp.pointerStart.shadeDragging && !reducedMotion?.matches) {
        if (!ui.shadePeek) startPeek();
        if (ui.shadePeek) { ui.peekCollapse = true; if (ui.peekDone) closePeek(); }
        lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true;
      }
      return false;
    },
    pointermove(event, dx, dy) {
      // NotificationPanelView: pulling down again on the open panel expands Quick Settings.
      if (lp.pointerStart.qsPullEligible && !ui.shadeSettings && dy > dp(40) && dy > Math.abs(dx)) { ui.shadeSettings = true; ui.qsDetail = ''; renderOverlay(); lp.suppressClickUntil = Date.now() + 350; lp.pointerStart.qsPullEligible = false; lp.pointerStart.qsPulled = true; return true; }
      if (lp.pointerStart.qsPulled) return true;
      if (lp.pointerStart.shadeDragging || lp.pointerStart.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || lp.pointerStart.shadeCloseEligible && dy < -dp(9) && -dy > Math.abs(dx)) {
        if (!lp.pointerStart.shadeDragging) {
          clearTimeout(lp.pointerStart.peekTimer); lp.pointerStart.shadeDragging = true;
          if (ui.shadePeek) {
            // The finger moved during the peek: tracking continues from the height the peek reached.
            const peeking = overlayRoot.querySelector('.notification-shade'); ui.shadePeek = false; ui.peekCollapse = false;
            if (peeking) { if (peeking._lpAnim) cancelAnimationFrame(peeking._lpAnim); lp.pointerStart.shadeFrom = peeking.offsetHeight - dy; }
          } else { if (ui.overlay !== 'shade') ui.shadeSettings = activeTouches.size >= 2; ui.overlay = 'shade'; renderOverlay(); }
          try { screen.setPointerCapture(event.pointerId); } catch {}
        }
        event.preventDefault();
        const shade = overlayRoot.querySelector('.notification-shade');
        if (shade) {
          // PanelView.setExpandedHeight follows the finger (an open panel starts from its full height); the fling on
          // release is handled below.
          const now = performance.now(), max = screen.clientHeight - shade.offsetTop - navRoot.offsetHeight;
          if (lp.pointerStart.shadeLast) { const dt = now - lp.pointerStart.shadeLast.t; if (dt > 0) lp.pointerStart.shadeVelocity = (event.clientY - lp.pointerStart.shadeLast.y) / dt * 1000; }
          lp.pointerStart.shadeLast = {t: now, y: event.clientY};
          if (lp.pointerStart.shadeFrom === undefined) lp.pointerStart.shadeFrom = lp.pointerStart.shadeCloseEligible ? shade.offsetHeight && LPShade.maxHeight(shade) : 0;
          LPShade.expand(shade, Math.max(0, Math.min(max, lp.pointerStart.shadeFrom + dy)), overlayRoot.querySelector('.lp-shade-scrim'));
        }
        return true;
      }
      return false;
    },
    pointerdown(event) {
      // PanelView.schedulePeek: a finger resting on the status bar for ViewConfiguration.TAP_TIMEOUT (100 ms) peeks the panel.
      if (lp.pointerStart.shadeDragEligible && !reducedMotion?.matches) lp.pointerStart.peekTimer = setTimeout(() => startPeek(), 100);
      const qsToggle = ui.overlay === 'shade' ? event.target.closest('[data-qs-toggle]') : null;
      if (qsToggle) lp.homeLongPressTimer = setTimeout(() => { const key = qsToggle.dataset.qsToggle; lp.data.settings[key] = !lp.data.settings[key]; if (lp.data.settings[key]) lp.data.settings.airplane = false; if (key === 'wifi' && lp.data.settings.wifi) lp.data.settings.portableHotspot = false; save(); lp.renderStatus(); renderOverlay(); lp.pointerStart = null; suppressReleaseClick(); }, holdDelay(500));
      return false;
    },
    beforeOverlay() {
      // NotificationPanelView.collapse: the open panel folds up into the status bar and the scrim fades, whatever closed it
      // (Back, Home, the scrim, a swipe up or an action); the old nodes are put back after this render for the animation.
      const closingShade = ui.overlay !== 'shade' && overlayRoot.querySelector('.lp-shade:not(.lp-closing)');
      if (closingShade?._lpAnim) cancelAnimationFrame(closingShade._lpAnim);
      if (closingShade) {
        const scrim = overlayRoot.querySelector('.lp-shade-scrim'), height = closingShade.offsetHeight, opacity = scrim ? getComputedStyle(scrim).opacity : '1';
        closingShade.remove(); scrim?.remove();
        if (!matchMedia('(prefers-reduced-motion: reduce)').matches) queueMicrotask(() => {
          for (const node of [scrim, closingShade]) if (node) { node.classList.add('lp-closing'); node.style.pointerEvents = 'none'; node.style.animation = 'none'; node.removeAttribute('data-action'); overlayRoot.append(node); }
          if (scrim) scrim.style.opacity = opacity;
          LPShade.animate(closingShade, Math.min(height, LPShade.maxHeight(closingShade)), 0, {velocity: lp.closingVelocity, scrim, done: () => { closingShade.remove(); scrim?.remove(); }});
          lp.closingVelocity = 0;
        });
      }
      // Collapsing the panel also collapses Quick Settings and closes a tile detail.
      if (ui.overlay !== 'shade') { ui.shadeAnimated = false; ui.shadeSettings = false; ui.qsDetail = ''; }
      return false;
    },
    overlays: {
      'shade'() {
        const call = ui.activeCall ? `<button class="phone-resume-call" data-action="open-app" data-app="phone">${safe(i18n.t('Ongoing call'))} · ${safe(lp.contactByPhone(ui.activeCall.number)?.name||ui.activeCall.number)}</button>` : '';
        const scroll = overlayRoot.querySelector('.lp-shade-scroll')?.scrollTop || 0;
        overlayRoot.innerHTML = '<div class="lp-shade-scrim" data-action="close-overlay"></div>' + LPShade.render({...lp.data, notifications: lp.data.notifications.map(decorateNotification)}, ui, key => i18n.t(key), {locale: i18n.locale(), clock: clock(), date: fullDate(), shortDate: shadeDate(), carrier: lp.carrierName(), alarm: nextAlarmLabel(), statusIcons: lp.statusIndicators(), networks: lp.allWifiNetworks(), extra: call});
        const body = overlayRoot.querySelector('.lp-shade-scroll'); if (body) body.scrollTop = scroll;
        LPShade.playIcons(overlayRoot, reducedMotion?.matches ? null : ui.qsIconAnim);
        const opening = !ui.shadeAnimated;
        overlayRoot.querySelectorAll('.lp-shade,.lp-shade-scrim').forEach(node => { node.style.animation = 'none'; });
        ui.shadeAnimated = true;
        if (opening && !lp.pointerStart?.shadeDragging && !ui.shadePeek && !reducedMotion?.matches) {
          const shade = overlayRoot.querySelector('.lp-shade'), scrim = overlayRoot.querySelector('.lp-shade-scrim');
          LPShade.animate(shade, 0, LPShade.maxHeight(shade), {scrim, done: () => LPShade.settle(shade, scrim)});
        }
      },
      'lp-brightness'() {
        const auto = !!lp.data.settings.autoBrightness;
        overlayRoot.innerHTML = `<div class="lp-bright-scrim" data-action="close-overlay"></div><div class="lp-bright-dlg" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><button type="button" class="lp-bright-auto${auto ? ' on' : ''}" data-action="lp-brightness-auto" aria-pressed="${auto}" aria-label="${safe(i18n.t('AUTO'))}"><img src="assets/lp-sysui-ic_qs_brightness_auto_${auto ? 'on' : 'off'}_alpha.png" alt=""></button><div class="lp-qs-brightness lp-bright-slider"><input type="range" min="10" max="100" value="${lp.data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" style="--v:${(lp.data.settings.brightness - 10) / .9}%"></div></div>`;
      },
      'qs-brightness'() {
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jb-brightness" role="dialog" aria-label="${safe(i18n.t('Brightness'))}"><h3>${safe(i18n.t('Brightness'))}</h3><div class="jb-brightness-row"><img src="assets/jb-ic_qs_brightness_auto_off.png" alt=""><input type="range" min="10" max="100" value="${lp.data.settings.brightness}" data-field="brightness" aria-label="${safe(i18n.t('Brightness'))}" ${lp.data.settings.autoBrightness ? 'disabled' : ''}><label><input type="checkbox" data-field="auto-brightness" ${lp.data.settings.autoBrightness ? 'checked' : ''}><span>${safe(i18n.t('AUTO'))}</span></label></div></div>`;
      },
    },
    click(action, button, event) {
      const {id} = button.dataset;
      switch (action) {
        case 'shade': if (ui.pinned) break; ui.overlay = ui.overlay === 'shade' ? '' : 'shade'; renderOverlay(); break;
        case 'clear-notifications': {
          const rows = [...overlayRoot.querySelectorAll('.jb-note')], delays = LPShade.clearDelays(rows.length);
          if (reducedMotion?.matches || !rows.length) { lp.data.notifications = []; ui.overlay = ''; save(); lp.renderStatus(); renderOverlay(); break; }
          overlayRoot.querySelector('.jb-shade-clear')?.setAttribute('hidden', '');
          rows.forEach((row, index) => row.animate([{transform: 'translateX(0)', opacity: 1}, {transform: `translateX(${row.offsetWidth}px)`, opacity: 0}], {duration: 125, delay: delays[index], easing: 'linear', fill: 'forwards'}));
          setTimeout(() => { lp.data.notifications = []; save(); lp.renderStatus(); if (ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); } }, (delays.at(-1) || 0) + 125 + 225);
          break;
        }
        // Lollipop Quick Settings: the icon toggles, the dual label opens the tile's detail.
        case 'lp-qs-expand': ui.shadeSettings = !ui.shadeSettings; ui.qsDetail = ''; renderOverlay(); break;
        case 'lp-qs-user': toast('Only the owner can be signed in on this simulator.'); break;
        case 'lp-qs-toggle': lpQsToggle(id); break;
        case 'lp-qs-detail': ui.qsDetail = id; renderOverlay(); break;
        case 'lp-qsd-done': ui.qsDetail = ''; renderOverlay(); break;
        case 'lp-qsd-more': ui.qsDetail = ''; ui.overlay = ''; openApp('settings'); ui.sub = id === 'wifi' ? 'wifi' : 'bluetooth'; render(); break;
        case 'lp-qsd-switch': lpQsToggle(id); break;
        case 'lp-qsd-item': if (id === 'wifi') { lp.data.settings.wifiNetwork = button.dataset.key; save(); lp.renderStatus(); renderOverlay(); } break;
        case 'lp-qsd-disconnect': if (id === 'wifi') lp.data.settings.wifiNetwork = ''; else lp.data.settings.pairedDevice = ''; save(); lp.renderStatus(); renderOverlay(); break;
        case 'qs-brightness': ui.overlay = 'qs-brightness'; renderOverlay(); break;
        case 'lp-brightness': ui.overlay = 'lp-brightness'; renderOverlay(); break;
        case 'lp-brightness-auto': lp.data.settings.autoBrightness = !lp.data.settings.autoBrightness; save(); renderOverlay(); break;
        case 'qs-settings': ui.overlay = ''; openApp('settings'); break;
        case 'qs-alarm': ui.overlay = ''; openApp('clock'); break;
        case 'notification-action': if (button.dataset.noteAction === 'reply') { const note = lp.data.notifications.find(item => String(item.id) === id); releaseHeadsUp(); lp.data.notifications = lp.data.notifications.filter(item => item !== note); save(); lp.renderStatus(); ui.overlay = ''; openApp(note?.channel === 'hangouts' ? 'hangouts' : 'messaging'); lp.openMessageThread(note?.contact || 1); break; } { const note = lp.data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar' && button.dataset.noteAction === 'snooze') { lp.data.notifications = lp.data.notifications.filter(item => item !== note); (lp.data.calendarSnoozes ||= []).push({eventId: note.eventId, date: note.date, title: note.title, detail: note.detail, at: deviceDate().getTime() + 5 * 60000}); save(); lp.renderStatus(); if (!lp.data.notifications.length) ui.overlay = ''; renderOverlay(); toast('Snoozed'); } break; }
        case 'notification-open': { const note = lp.data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { lp.data.notifications = lp.data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; }
          releaseHeadsUp();
          if (note?.kind === 'message') { lp.data.notifications = lp.data.notifications.filter(item => item !== note); save(); lp.renderStatus(); ui.overlay = ''; openApp(note.channel === 'hangouts' ? 'hangouts' : 'messaging'); lp.openMessageThread(note.contact); break; }
          ui.overlay = ''; if (Number(id) === 2) lp.openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break; }
        default: return false;
      }
      return true;
    }
  };
});
