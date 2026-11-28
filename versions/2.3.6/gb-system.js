/* The system UI of Android 2.3.6 as modules (docs/plans/engine-migration.md): StatusBarService's bar ('statusbar') and
   notification shade ('shade', with its pull and fling and the notifications' swipes), RecentApplicationsDialog
   ('recents', the held Home key), GlobalActions with ShutdownThread and the boot ('power') and the volume panel
   ('volume'). The core draws them through these modules and gives the keys and the side buttons to them. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  // Gingerbread status bar: one 25 dp icon per notification on the left, config_statusBarIcons on the right.
  const noteIcon = n => n.id === 2 ? 'gb-app-mms-stat_notify_sms.png' : n.kind === 'calendar' ? 'gb-app-calendar-stat_notify_calendar.png' : n.kind === 'alarm' ? 'gb-app-deskclock-stat_notify_alarm.png' : n.kind === 'market-dl' ? 'gb-stat_sys_download_anim0.png' : n.kind === 'market' ? 'gb-stat_sys_download_anim5.png' : 'gb-stat_sys_adb.png';
  let seenNotes = null, stopTicker = null;
  window.GB?.register('statusbar', {
    render(c) {
      const {data, ui, statusRoot, deviceDate, gbClock} = c;
      const icons = data.notifications.map(noteIcon);
      icons.unshift(...GBNetwork.statusIcons(GB.module('settings').net(c)));
      if (ui.activeCall) icons.unshift(ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png');
      GBStatusBar.bar(statusRoot, {
        label: i18n.t('Open notifications'), notifications: icons, clock: gbClock(), expanded: ui.overlay === 'shade',
        date: deviceDate().toLocaleDateString(i18n.locale(), {year: 'numeric', month: 'long', day: 'numeric'}),
        state: {bluetooth: data.settings.bluetooth, ringer: data.settings.silent ? (data.settings.silentMode === 'vibrate' ? 'vibrate' : 'silent') : '', airplane: data.settings.airplane, wifi: data.settings.wifi && !!data.settings.wifiNetwork, data: data.settings.mobileData === false || data.settings.dataEnabled === false ? '' : '3g', battery: 78, alarm: data.alarms.some(alarm => alarm.enabled)}
      });
      // Ticker: newly posted notifications scroll through the bar once (tickerText = the notification title).
      const ids = new Set(data.notifications.map(n => n.id));
      const fresh = seenNotes ? data.notifications.filter(n => !seenNotes.has(n.id)) : [];
      seenNotes = ids;
      if (fresh.length && !ui.sleeping) { stopTicker?.(); stopTicker = GBStatusBar.ticker(statusRoot, fresh.reverse().map(n => ({icon: noteIcon(n), text: n.title})), () => { stopTicker = null; }); }
    }
  });

  // The shade: the panel's motion, its contents, the pull from the status bar and the swipes on its notifications.
  let shadeTracking = null, stopShade = null, press = null;
  function shade(c) {
    const {data, ui, screen, overlayRoot, statusRoot, renderOverlay, renderStatus, reducedMotion} = c;
    // Shade motion (StatusBarService): the panel's bottom edge follows the finger and flings with +-2000 px/s^2.
    const shadeBottom = () => screen.clientHeight;
    function shadeFling(from, velocity, expand) {
      const panel = overlayRoot.querySelector('.gbsh-panel'); if (!panel) return;
      stopShade?.();
      stopShade = GBStatusBar.slide(panel, {from, velocity, accel: (expand ? 1 : -1) * GBStatusBar.ACCEL(), top: statusRoot.offsetHeight, bottom: shadeBottom(), reduced: !!reducedMotion?.matches}, opened => {
        stopShade = null;
        if (!opened && ui.overlay === 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); }
      });
    }
    function closeShade() {
      const panel = overlayRoot.querySelector('.gbsh-panel');
      if (!panel || ui.overlay !== 'shade') { ui.overlay = ''; renderOverlay(); renderStatus(); return; }
      const y = new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom();
      shadeFling(Math.min(shadeBottom() - 1, y), -2000 * GBStatusBar.PX(), false);
    }
    return {shadeBottom, shadeFling, closeShade};
  }
  window.GB?.register('shade', {
    close: c => shade(c).closeShade(),
    overlay(c, overlayRoot) {
      const {data, ui, screen, statusRoot, renderStatus, carrierName, contactByPhone} = c, {shadeBottom, shadeFling} = shade(c);
      const time = n => n.id > 1e12 ? new Date(n.id).toLocaleTimeString(i18n.locale(), {hour: 'numeric', minute: '2-digit', hour12: !data.settings.hour24}) : '';
      const ongoing = ui.activeCall ? [{id: 'call', action: 'gbp-return-call', icon: ui.activeCall.hold ? 'gb-stat_sys_phone_call_on_hold.png' : ui.activeCall.bluetooth ? 'gb-stat_sys_phone_call_bluetooth.png' : 'gb-stat_sys_phone_call.png', title: ui.activeCall.hold ? GBPhone.phoneText(i18n.language, 'notification_on_hold') : AndroidStrings.format(GBPhone.phoneText(i18n.language, 'notification_ongoing_call_format'), GBPhone.elapsedText(ui.activeCall)), text: contactByPhone(ui.activeCall.number)?.name || ui.activeCall.number}] : [];
      ongoing.push(...GBNetwork.ongoing(GB.module('settings').net(c)));
      const latest = data.notifications.map(n => ({id: n.id, icon: noteIcon(n), title: n.title, text: n.detail, time: time(n)}));
      const open = overlayRoot.querySelector('.gbsh');
      overlayRoot.innerHTML = GBStatusBar.shade({t: key => i18n.t(key), carrier: carrierName(), ongoing, latest, clearable: latest.length > 0});
      const panel = overlayRoot.querySelector('.gbsh-panel');
      if (open || shadeTracking) GBStatusBar.place(panel, shadeTracking ? shadeTracking.y : screen.clientHeight, shadeBottom());
      else shadeFling(statusRoot.offsetHeight, 2000 * GBStatusBar.PX(), true);
      renderStatus();
    },
    action(name, el, c) {
      const id = el.dataset.id, {data, ui, save, render, renderOverlay, renderStatus, openApp} = c, {closeShade} = shade(c), openMessageThread = c.intent.thread;
      switch (name) {
        case 'shade': if (ui.overlay === 'shade') { closeShade(); break; } if (ui.locked) break; ui.overlay = 'shade'; renderOverlay(); break;
        case 'clear-notifications': data.notifications = []; save(); renderStatus(); renderOverlay(); closeShade(); break;
        case 'notification-open': { const note = data.notifications.find(item => String(item.id) === id); if (note?.kind === 'calendar') { data.notifications = data.notifications.filter(item => item !== note); save(); ui.overlay = ''; openApp('calendar'); ui.selectedEvent = note.eventId; ui.selectedInstance = note.date; ui.selectedDate = note.date; ui.sub = 'event'; render(); break; } }
          ui.overlay = ''; if (Number(id) === 2) openMessageThread(1); else { ui.view = 'settings'; ui.sub = 'about'; render(); } break;
        default: return false;
      }
      return true;
    },
    init(core) {
      const {screen} = core;
      screen.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;
        const {ui} = core.live();
        press = { x: event.clientX, y: event.clientY, target: event.target, pointerId: event.pointerId, shadeDragEligible: !ui.overlay && !ui.locked && !!event.target.closest('#status-bar'), shadeCloseEligible: ui.overlay === 'shade' && !!event.target.closest('.gbsh-close') };
      });
      window.addEventListener('pointermove', event => {
        if (!press || event.pointerId !== press.pointerId) return;
        const c = core.live(), {ui, screen, overlayRoot, statusRoot, renderOverlay, dp} = c, {shadeBottom} = shade(c);
        const dx = event.clientX - press.x, dy = event.clientY - press.y;
        const recentCard = ui.overlay === 'shade' ? press.target.closest('.notification') : null;
        if (recentCard && (press.recentSwiping || Math.abs(dx) > dp(10) && Math.abs(dx) > Math.abs(dy))) {
          press.recentSwiping = true;
          c.suppressClick(350);
          event.preventDefault();
          try { screen.setPointerCapture(event.pointerId); } catch {}
          recentCard.style.transform = `translateX(${dx}px)`;
          recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
          return;
        }
        if (press.shadeDragging || press.shadeDragEligible && dy > dp(9) && dy > Math.abs(dx) || press.shadeCloseEligible && Math.abs(dy) > dp(5)) {
          const rect = screen.getBoundingClientRect(), scale = screen.clientHeight / rect.height;
          if (!press.shadeDragging) {
            press.shadeDragging = true; stopShade?.(); stopShade = null;
            const panel = overlayRoot.querySelector('.gbsh-panel');
            const start = panel ? new DOMMatrixReadOnly(getComputedStyle(panel).transform).m42 + shadeBottom() : statusRoot.offsetHeight;
            shadeTracking = {expanded: ui.overlay === 'shade', offset: press.shadeCloseEligible ? start - (press.y - rect.top) * scale : 0, y: start, samples: []};
            if (ui.overlay !== 'shade') { ui.overlay = 'shade'; renderOverlay(); }
            try { screen.setPointerCapture(event.pointerId); } catch {}
          }
          event.preventDefault();
          const y = Math.max(statusRoot.offsetHeight, Math.min(shadeBottom(), (event.clientY - rect.top) * scale + shadeTracking.offset));
          shadeTracking.y = y; shadeTracking.samples.push([performance.now(), y]); if (shadeTracking.samples.length > 6) shadeTracking.samples.shift();
          const panel = overlayRoot.querySelector('.gbsh-panel'); if (panel) GBStatusBar.place(panel, y, shadeBottom());
          return;
        }
      });
      window.addEventListener('pointerup', event => {
        if (!press || event.pointerId !== press.pointerId) return;
        const c = core.live(), {data, ui, screen, save, renderStatus, renderOverlay, dp} = c, {shadeFling} = shade(c);
        const dx = event.clientX - press.x, dy = event.clientY - press.y;
        if (press.recentSwiping) {
          const card = press.target.closest('.recent-item, .notification');
          if (card) {
            card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
            if (Math.abs(dx) > dp(64)) {
              const id = card.dataset.app;
              card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
              card.style.opacity = '0';
              setTimeout(() => {
                if (card.classList.contains('notification')) {
                  data.notifications = data.notifications.filter(item => item.id !== Number(card.dataset.id));
                  save(); renderStatus();
                  if (ui.overlay === 'shade') { if (!data.notifications.length) ui.overlay = ''; renderOverlay(); }
                  return;
                }
                ui.recent = ui.recent.filter(item => item !== id);
                if (ui.overlay !== 'recent') return;
                if (!ui.recent.length) ui.overlay = '';
                renderOverlay();
              }, 160);
            } else { card.style.transform = ''; card.style.opacity = ''; }
          }
          c.suppressClick(350);
          press = null; return;
        }
        if (press.shadeDragging) {
          c.suppressClick(350);
          const track = shadeTracking; shadeTracking = null;
          const [first, last] = [track.samples[0], track.samples.at(-1)];
          let velocity = first && last && last[0] > first[0] ? (last[1] - first[1]) / ((last[0] - first[0]) / 1000) : 0;
          const expand = GBStatusBar.flingDirection(track.expanded, track.y, velocity, screen.clientHeight);
          if (expand ? velocity < 0 : velocity > 0) velocity = 0;
          shadeFling(track.y, velocity, expand);
          press = null; return;
        }
        if (ui.overlay === 'shade' && press.target.closest('.notification') && Math.abs(dx) > dp(64)) { const id = Number(press.target.closest('.notification').dataset.id); data.notifications = data.notifications.filter(n => n.id !== id); save(); renderStatus(); renderOverlay(); press = null; return; }
        press = null;
      });
      window.addEventListener('pointercancel', () => { const {ui, renderOverlay} = core.live(); if (press?.shadeDragging || ui.overlay === 'shade') renderOverlay(); press = null; });
    }
  });

  // RecentApplicationsDialog (recent_apps_dialog.xml): "Recent", up to eight 80 dip icon buttons in rows of four, newest
  // first, or "No recent applications."; recent_dialog_background behind it, fading in and out. Holding Home opens it.
  let card = null;
  window.GB?.register('recents', {
    overlay(c) {
      const {ui, appNames, appIcon, safe} = c;
      const fw = key => AndroidStrings.resources(() => window.GBStrings?.framework).t(key, i18n.language);
      const items = ui.recent.filter(id => appNames[id]).slice(0, 8);
      const rows = items.length ? [items.slice(0, 4), items.slice(4, 8)].filter(row => row.length).map(row => `<div class="gbrecent-row">${row.map(id => `<button class="gbrecent-item" data-action="open-app" data-app="${id}">${appIcon(id)}<span>${safe(appNames[id])}</span></button>`).join('')}</div>`).join('') : `<div class="gbrecent-empty">${safe(fw('no_recent_tasks'))}</div>`;
      return `<div class="gbrecent-scrim" data-action="close-overlay"></div><div class="gbrecent" role="dialog" aria-label="${safe(fw('recent_tasks_title'))}"><div class="gbrecent-title">${safe(fw('recent_tasks_title'))}</div>${rows}<div class="gbrecent-spacer"></div></div>`;
    },
    action(name, el, c) {
      const {ui, renderOverlay, captureRecentView} = c;
      switch (name) {
        case 'recent': if (ui.view === 'lock') break; if (ui.overlay !== 'recent') captureRecentView(); ui.overlay = ui.overlay === 'recent' ? '' : 'recent'; renderOverlay(); break;
        default: return false;
      }
      return true;
    },
    init(core) {
      const {navRoot, screen} = core;
      let homeHold = 0;
      navRoot.addEventListener('pointerdown', event => {
        const key = event.target.closest('.touch-home'); if (!key || key.disabled || event.button) return;
        clearTimeout(homeHold);
        homeHold = setTimeout(() => {
          homeHold = 0;
          const swallow = click => { click.stopPropagation(); click.preventDefault(); window.removeEventListener('click', swallow, true); };
          window.addEventListener('click', swallow, true); setTimeout(() => window.removeEventListener('click', swallow, true), 600);
          const {ui, captureRecentView, renderOverlay} = core.live();
          if (ui.view !== 'lock' && ui.overlay !== 'recent') { captureRecentView(); ui.overlay = 'recent'; renderOverlay(); }
        }, 500);
      });
      for (const type of ['pointerup', 'pointercancel', 'pointerleave']) navRoot.addEventListener(type, () => { clearTimeout(homeHold); homeHold = 0; });
      // The inherited ICS recent cards swipe away.
      screen.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse' && event.button !== 0) return; card = {x: event.clientX, y: event.clientY, target: event.target, pointerId: event.pointerId}; });
      window.addEventListener('pointermove', event => {
        if (!card || event.pointerId !== card.pointerId) return;
        const c = core.live(), {ui, screen, dp} = c, press = card, dx = event.clientX - card.x, dy = event.clientY - card.y;
        const recentCard = ui.overlay === 'recent' ? press.target.closest('.recent-item') : null;
        if (recentCard && (press.recentSwiping || Math.abs(dx) > dp(10) && Math.abs(dx) > Math.abs(dy))) {
          press.recentSwiping = true;
          c.suppressClick(350);
          event.preventDefault();
          try { screen.setPointerCapture(event.pointerId); } catch {}
          recentCard.style.transform = `translateX(${dx}px)`;
          recentCard.style.opacity = String(Math.max(.25, 1 - Math.abs(dx) / 240));
          return;
        }
      });
      window.addEventListener('pointerup', event => {
        if (!card || event.pointerId !== card.pointerId) return;
        const c = core.live(), {data, ui, screen, save, renderStatus, renderOverlay, dp} = c, dx = event.clientX - card.x;
        let press = card; card = null;
        if (press.recentSwiping) {
          const card = press.target.closest('.recent-item, .notification');
          if (card) {
            card.style.transition = 'transform .16s ease-out, opacity .16s ease-out';
            if (Math.abs(dx) > dp(64)) {
              const id = card.dataset.app;
              card.style.transform = `translateX(${Math.sign(dx || 1) * screen.clientWidth}px)`;
              card.style.opacity = '0';
              setTimeout(() => {
                if (card.classList.contains('notification')) {
                  data.notifications = data.notifications.filter(item => item.id !== Number(card.dataset.id));
                  save(); renderStatus();
                  if (ui.overlay === 'shade') { if (!data.notifications.length) ui.overlay = ''; renderOverlay(); }
                  return;
                }
                ui.recent = ui.recent.filter(item => item !== id);
                if (ui.overlay !== 'recent') return;
                if (!ui.recent.length) ui.overlay = '';
                renderOverlay();
              }, 160);
            } else { card.style.transform = ''; card.style.opacity = ''; }
          }
          c.suppressClick(350);
          return;
        }
      });
      window.addEventListener('pointercancel', () => { const {ui, renderOverlay} = core.live(); if (ui.overlay === 'recent') renderOverlay(); card = null; });
    }
  });

  // The volume keys: the active stream's panel (volume-panel.js), the alarm's snooze or dismiss.
  let volumeLayer = null;
  function volume(c) {
    const {data, ui, save, renderStatus, overlayRoot} = c;
    // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
    const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
    function volumeKey(direction) {
      if (ui.power) return;
      // AlarmAlert: the side buttons do what Clock's volume_button_setting says (None / Snooze / Dismiss).
      if (ui.overlay === 'clock-ringing') { const how = data.appPrefs?.clock?.volume_button_setting ?? 2; if (how) { const key = document.createElement('button'); key.dataset.action = how === 1 ? 'alarm-snooze' : 'alarm-dismiss'; overlayRoot.append(key); key.click(); key.remove(); return; } }
      const stream = volumeStream();
      // With the screen off the keys only reach music that is playing, and no panel is shown.
      if (ui.sleeping && stream !== 'music') return;
      const result = VolumePanel.adjust(data.settings, stream, direction, volumePrevious); volumePrevious = direction;
      save(); renderStatus();
      if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
      if (!ui.sleeping) showVolume(stream);
    }
    function showVolume(stream) {
      volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key), i18n.language);
      VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
      resetVolumeTimeout();
    }
    function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
    function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
    return {volumeKey};
  }
  let volumeTimer = 0, volumePrevious = 0;
  window.GB?.register('volume', {
    init(core) {
      volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; core.screen.append(volumeLayer);
      const key = direction => volume(core.live()).volumeKey(direction);
      // The volume toast stays for its LENGTH_SHORT whatever is touched. Held keys repeat after config_keyRepeatTimeout
      // (500 ms) every 50 ms, as key repeats do.
      function bindVolumeKey(element, direction) {
        let delay = 0, repeat = 0;
        const stop = () => { clearTimeout(delay); clearInterval(repeat); };
        element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); const dir = typeof direction === 'function' ? direction(event) : direction; key(dir); stop(); delay = setTimeout(() => { repeat = setInterval(() => key(dir), 50); }, 500); });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, stop));
        element.addEventListener('click', event => { if (event.detail === 0) key(typeof direction === 'function' ? 1 : direction); });
      }
      bindVolumeKey(document.querySelector('#volume-down'), -1);
      bindVolumeKey(document.querySelector('#volume-up'), 1);
      bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
    }
  });

  // The power key, GlobalActions ("Phone options"), ShutdownThread and the boot (global-actions.js, boot-ready.js).
  let powerLayer = null;
  function power(c) {
    const {data, ui, save, render, renderOverlay, lockControls, lockScreen, home, apps, appIcon} = c;
    function powerKey() { if (ui.power === 'off') { bootUp(); return; } if (ui.power || ui.overlay === 'power-progress') return; if(ui.locked){ui.sleeping=!ui.sleeping;lockControls.lock();render();}else if(ui.sleeping||ui.view==='lock'){ui.sleeping=false;home(false);}else lockScreen(); }
    // PhoneWindowManager: holding the key opens GlobalActions only while the screen is on; otherwise it just wakes.
    function powerHold() { if (ui.power || ui.sleeping || ui.overlay === 'power-progress') { powerKey(); return; } ui.overlay = 'power-menu'; render(); }
    // ShutdownThread: the confirmation, the "Shutting down…" progress dialog with a 500 ms vibration, then off.
    function powerConfirm() {
      ui.overlay = 'power-progress'; renderOverlay(); navigator.vibrate?.(500);
      setTimeout(powerOff, GlobalActions.SHUTDOWN_MS);
    }
    function powerOff() {
      if (ui.activeCall) ui.activeCall = null;
      if (ui.music) ui.music.playing = false;
      ui.overlay = ''; ui.view = 'home'; ui.sub = ''; ui.recent = []; ui.recentState = {}; ui.recentSnapshots = {}; ui.power = 'off';
      render(); renderPower();
    }
    function bootUp(booted) {
      booted ||= AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
      ui.power = 'boot'; renderPower();
      // Finish after the native movie, or after a requested skip once startup resources are ready.
      let finished = false, stop = () => {};
      const finish = () => { if (finished) return; finished = true; stop(); AndroidBoot.complete('2.3.6'); ui.power = ''; lockScreen(); ui.sleeping = false; if (!ui.locked && ui.view !== 'lock') home(); else render(); renderPower(); c.noteActivity(); };
      stop = GlobalActions.playBoot(powerLayer.firstElementChild, finish, booted);
      return finish;
    }
    /* A fresh tab always shows the image's boot movie, including reduced-motion/private browsing.
       Its exit waits for decoded launcher/keyguard resources; a requested skip cannot reveal unloaded icons. */
    function coldBoot() {
      if (!AndroidBoot.shouldBoot('2.3.6')) return;
      const booted = AndroidBoot.prepare({markup: apps.map(app => appIcon(app[0])).join('')});
      const finish = bootUp(booted);
      const skip = event => { off(); if (ui.power !== 'boot') return; event.preventDefault(); event.stopPropagation(); c.suppressClick(350); booted.then(finish); };
      const off = () => { powerLayer.removeEventListener('pointerdown', skip); window.removeEventListener('keydown', skip, true); };
      powerLayer.addEventListener('pointerdown', skip); window.addEventListener('keydown', skip, true);
    }
    function renderPower() { if (ui.power === 'boot' && powerLayer.querySelector('.ga-boot')) return; powerLayer.innerHTML = ui.power === 'off' ? '<div class="ga-off"></div>' : ui.power === 'boot' ? GlobalActions.boot() : ''; }
    return {powerKey, powerHold, powerConfirm, coldBoot};
  }
  window.GB?.register('power', {
    coldBoot: c => power(c).coldBoot(),
    // GlobalActions (2.3.6): "Phone options" over a bright list - Silent mode and Airplane mode toggles with their status
    // line (global_actions_item.xml), then Power off; ShutdownThread's confirmation and progress.
    overlay(c) {
      const {data, ui, safe} = c;
      if (ui.overlay === 'power-menu') {
        const t = key => i18n.t(key), silent = !!data.settings.silent, vibrate = data.settings.silentMode === 'vibrate';
        return GBUI.dialog({t, title: t('Phone options'), items: [
          {action: 'gb-ga-silent', title: t('Silent mode'), summary: t(silent ? 'Sound is OFF' : 'Sound is ON'), icon: silent ? (vibrate ? 'ic_lock_silent_mode_vibrate' : 'ic_lock_silent_mode') : 'ic_lock_silent_mode_off'},
          {action: 'ga-airplane', title: t('Airplane mode'), summary: t(data.settings.airplane ? 'Airplane mode is ON' : 'Airplane mode is OFF'), icon: data.settings.airplane ? 'ic_lock_airplane_mode' : 'ic_lock_airplane_mode_off'},
          {action: 'ga-power', title: t('Power off'), icon: 'ic_lock_power_off'}]});
      } else if (ui.overlay === 'power-confirm') {
        // ShutdownThread.shutdown(confirm): ic_dialog_alert, "Power off", shutdown_confirm, OK / Cancel.
        return GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), icon: 'ic_dialog_alert', message: i18n.t('Your phone will shut down.'), buttons: [{action: 'ga-confirm', id: 'shutdown', title: i18n.t('OK')}, {action: 'close-overlay', title: i18n.t('Cancel')}]});
      } else if (ui.overlay === 'power-progress') {
        // ProgressDialog: spinner_white_48 (12 frames, 100 ms) beside "Shutting down…"; not cancelable.
        return GBUI.dialog({t: key => i18n.t(key), title: i18n.t('Power off'), custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${safe(i18n.t('Shutting down…'))}</span></div>`, cancel: 'noop'});
      }
      return '';
    },
    action(name, el, c) {
      const {data, ui, save, render, renderOverlay} = c, {powerConfirm} = power(c);
      switch (name) {
        case 'gb-ga-silent': { const silent = !data.settings.silent; data.settings.silent = silent; data.settings.silentMode = silent ? (data.settings.vibrateSilent === false ? 'mute' : 'vibrate') : 'off'; ui.overlay = ''; save(); render(); break; }
        case 'ga-power': ui.overlay = 'power-confirm'; ui.powerKind = 'shutdown'; renderOverlay(); break;
        case 'ga-airplane': ui.overlay = ''; data.settings.airplane = !data.settings.airplane; if (data.settings.airplane) { data.settings.wifi = false; data.settings.bluetooth = false; } save(); render(); break;
        case 'ga-confirm': powerConfirm(); break;
        default: return false;
      }
      return true;
    },
    init(core) {
      powerLayer = document.createElement('div'); powerLayer.id = 'power-layer'; core.screen.append(powerLayer);
      for (const key of [document.querySelector('#power-button'), document.querySelector('.power-key')]) { key.addEventListener('click', () => power(core.live()).powerKey()); GlobalActions.hold(key, () => power(core.live()).powerHold()); }
    }
  });
})();
