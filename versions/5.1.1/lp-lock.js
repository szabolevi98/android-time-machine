/* The lock screen on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - locking (lp.lockScreen), the keyguard and its parts, the bouncer, the notification cards, the media controls
   - the keyguard widgets and their picker, the unlock wave and its drag, the camera, Back on the lock screen
   The core draws it in render() (lp.renderLock, lp.attachKeyguard) and keeps the credential lock's controller. */
'use strict';
LP.define('lock', ({
  captureRecentView, clock, deviceDate, dp, fullDate, home, i18n, lockControls, openApp, overlayRoot,
  reducedMotion, render, renderOverlay, safe, save, screen, shadeDate, today, tracks, ui, viewport
}, lp) => {
  function lockScreen(){captureRecentView();lockControls.lock();ui.kgUp=true;ui.kgBouncing=false;ui.kgPending=null;ui.kgRelock=false;ui.locked=ICSLockscreen.secure(lp.data);ui.sleeping=lp.data.settings.screenLock==='none';ui.view=ui.sleeping?'home':'lock';ui.overlay='';render();}
  /* MultiWaveView (keyguard_screen_tab_unlock): targets sit on the ring (radius 135dp), the handle follows the
     finger inside it and snaps to a target within the 60dp hit radius. Release elsewhere returns the handle in
     300 ms (Quart ease-out), fades the targets after 200 ms over 1200 ms, then pings the right chevrons
     (three, 160 ms apart, 850 ms Quad ease-out, scale 0.5 -> 2, alpha 1 -> 0). */
  const lockWave = {radius: 112, hit: 54};
  function lockPing() {
    const chevrons = [...viewport.querySelectorAll('.lock-chevron')];
    if (!chevrons.length || reducedMotion?.matches) return;
    chevrons.forEach((chevron, index) => {
      chevron.getAnimations().forEach(animation => animation.cancel());
      chevron.animate([{transform: 'translateX(39px) scale(.5)', opacity: 1}, {transform: `translateX(${lockWave.radius * .9}px) scale(2)`, opacity: 0}], {duration: 850, delay: index * 160, easing: 'cubic-bezier(.25,.46,.45,.94)', fill: 'backwards'});
    });
  }
  function lockMove(dx, dy) {
    const handle = viewport.querySelector('.lock-handle');
    if (!handle) return null;
    const distance = Math.hypot(dx, dy), scale = distance > lockWave.radius ? lockWave.radius / distance : 1;
    let x = dx * scale, y = dy * scale, active = null;
    for (const [name, tx] of [['unlock', lockWave.radius], ['camera', -lockWave.radius]]) if (Math.hypot(x - tx, y) < lockWave.hit) { active = name; x = tx; y = 0; }
    handle.style.setProperty('--lock-x', `${x}px`); handle.style.setProperty('--lock-y', `${y}px`);
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.toggle('active', target.classList.contains(`lock-target-${active}`)));
    handle.classList.toggle('over-target', !!active);
    if (active && active !== lp.pointerStart?.lockActive && lp.data.settings.haptic !== false) navigator.vibrate?.(20);
    return active;
  }
  function lockRelease(active) {
    const handle = viewport.querySelector('.lock-handle');
    screen.classList.remove('lock-dragging');
    if (active) {
      viewport.querySelectorAll(`.lock-target:not(.lock-target-${active})`).forEach(target => target.classList.add('dismissed'));
      viewport.querySelector('.lock-outer-ring')?.classList.add('dismissed');
      lp.suppressClickUntil = Date.now() + 350;
      if (active === 'unlock') home(); else openApp('camera');
      return;
    }
    viewport.querySelectorAll('.lock-target').forEach(target => target.classList.remove('active'));
    if (!handle) return;
    handle.classList.remove('over-target');
    screen.classList.add('lock-releasing');
    handle.style.setProperty('--lock-x', '0px'); handle.style.setProperty('--lock-y', '0px');
    clearTimeout(ui.lockReleaseTimer);
    ui.lockReleaseTimer = setTimeout(() => { screen.classList.remove('lock-releasing'); lockPing(); }, 300);
  }
  function renderLock() {
    if(ui.locked)return lockControls.renderLock();
    return LPKeyguard.render(lpKeyguardParts(false));
  }
  function renderSecureKeyguard(api) {
    const parts = lpKeyguardParts(true);
    return LPKeyguard.render({...parts, bouncer: ui.kgBouncing ? LPKeyguard.bouncer(api, parts) : ''});
  }
  // What the Lollipop lock screen shows: clock, date and alarm, owner info, the notification cards and the hint.
  function lpKeyguardParts(secure) {
    const now = deviceDate(), hour24 = !!lp.data.settings.hour24;
    return {t: key => i18n.t(key), locale: i18n.locale(), secure, height: screen.clientHeight || 662.67,
      clock: now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''),
      date: now.toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'}), shortDate: shadeDate(), alarm: lp.nextAlarmLabel(),
      owner: lp.data.settings.showOwner ? lp.data.settings.ownerInfo : '', carrier: lp.carrierName(), statusIcons: lp.statusIndicators(),
      notifications: lp.data.notifications.map(lp.decorateNotification), activated: ui.kgActivated || '', hint: ui.kgHint || ''};
  }
  function kgHint(text) {
    ui.kgHint = i18n.t(text); clearTimeout(ui.kgHintTimer);
    const line = viewport.querySelector('.lp-kg-indication'); if (line) { line.textContent = ui.kgHint; line.classList.add('visible'); }
    LPKeyguard.bounce(viewport.querySelector('[data-lp-kg]'), !!reducedMotion?.matches);
    ui.kgHintTimer = setTimeout(() => { ui.kgHint = ''; ui.kgActivated = ''; viewport.querySelector('.lp-kg-indication')?.classList.remove('visible'); viewport.querySelectorAll('.lp-kg-note.activated').forEach(node => node.classList.remove('activated')); }, 3500);
  }
  function keyguardParts() {
    // TransportControlView covers the clock rows while the Music service is active.
    const track = tracks[ui.music.track], transport = lp.musicActive() ? `<div class="lock-transport" data-no-translate><div class="lock-transport-art"></div><div class="lock-transport-bar"><p><span>${safe(track.title)}</span> - ${safe(track.artist)} - ${safe(track.album)}</p><div><button data-action="lock-media" data-id="previous" aria-label="${safe(i18n.t('Previous track'))}"><img src="assets/music-ic_media_previous.png" alt=""></button><button data-action="lock-media" data-id="play" aria-label="${safe(i18n.t(ui.music.playing ? 'Pause' : 'Play'))}"><img src="assets/music-ic_media_${ui.music.playing ? 'pause' : 'play'}.png" alt=""></button><button data-action="lock-media" data-id="next" aria-label="${safe(i18n.t('Next track'))}"><img src="assets/music-ic_media_next.png" alt=""></button></div></div></div>` : '';
    const kgPages = JBKeyguard.pages(lp.data.keyguardWidgets || [], {music: lp.musicActive()});
    if (!Number.isInteger(ui.kgPage) || ui.kgPage >= kgPages.length || kgPages[ui.kgPage]?.type === 'camera') ui.kgPage = JBKeyguard.defaultPage(kgPages);
    const now = deviceDate(), hour24 = !!lp.data.settings.hour24;
    return {list: kgPages, parts: {
      t: key => i18n.t(key), carrier: lp.data.settings.airplane ? i18n.t('No service.') : lp.data.settings.networkOperator || 'Telekom', owner: lp.data.settings.showOwner ? lp.data.settings.ownerInfo : '', alarm: lp.nextAlarmLabel(),
      clock: now.toLocaleTimeString(i18n.locale(), {hour: hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !hour24}).replace(/\s?[AaPp]\.?\s?[Mm]\.?$/, ''),
      ampm: hour24 ? '' : now.getHours() < 12 ? 'AM' : 'PM', date: now.toLocaleDateString(i18n.locale(), {weekday: 'long', month: 'long', day: 'numeric'}).toLocaleUpperCase(i18n.locale()),
      transport: transport.replace('class="lock-transport"', 'class="lock-transport jbk-transport-view"'), widget: keyguardWidget
    }};
    return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${fullDate()}</div>${lp.data.settings.showOwner?`<div class="lock-owner">${safe(lp.data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${lp.carrierName()}</div></div>`;
  }
  // Keyguard-capable widgets: the Calendar list and the 4.2 DeskClock digital clock.
  function keyguardWidget(widget) {
    if (widget.type === 'calendar') return ICSWidgets.calendar(lp.data, key => i18n.t(key), i18n.locale(), deviceDate(), !!lp.data.settings.hour24);
    return lp.digitalClockWidget('div');
  }
  function requestBouncer(pending) {
    ui.kgPending = pending; ui.kgBouncing = true; ui.kgHint = ''; render();
  }
  // OnDismissAction: what the widget asked for once the security check passes.
  function afterKeyguardDismiss(pending) {
    if (pending.type === 'add') { ui.kgRelock = true; ui.overlay = 'kg-widget-picker'; renderOverlay(); return; }
    if (pending.type === 'camera' || pending.type === 'phone') { openApp(pending.type); return; }
    if (pending.type === 'note') { const button = document.createElement('button'); button.dataset.action = 'notification-open'; button.dataset.id = pending.id; screen.append(button); button.click(); button.remove(); return; }
    const event = pending.id && lp.data.events.find(item => String(item.id) === pending.id);
    if (!event) { ui.selectedDate = today(); openApp('calendar'); return; }
    const date = pending.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render();
  }
  function attachKeyguard() {
    ui.kgPad?.destroy(); ui.kgPad = null; ui.kgChallenge?.destroy(); ui.kgChallenge = null;
    const root = viewport.querySelector('[data-lp-kg]');
    if (!root) return;
    ui.kgPad = LPKeyguard.attach(root, {
      suppressClick: () => { lp.suppressClickUntil = Date.now() + 350; },
      onTap: kind => kgHint(kind === 'camera' ? 'Swipe left for camera' : kind === 'phone' ? 'Swipe right for phone' : 'Swipe up to unlock'),
      onUnlock: () => { if (ui.locked) requestBouncer(null); else { lp.suppressClickUntil = Date.now() + 350; home(); } },
      onAffordance: kind => { if (ui.locked) requestBouncer({type: kind}); else { ui.kgHint = ''; openApp(kind); } }
    });
  }
  Object.assign(lp, {afterKeyguardDismiss, renderSecureKeyguard, renderLock, attachKeyguard, requestBouncer, lockScreen});
  return {
    pointerup(event, dx, dy) {
      if (lp.pointerStart.lockDrag) {
        const active = lockMove(dx, dy);
        if (!active && Math.hypot(dx, dy) > dp(7)) lp.suppressClickUntil = Date.now() + 350;
        lockRelease(active);
        lp.pointerStart = null; return true;
      }
      return false;
    },
    pointermove(event, dx, dy) {
      if (lp.pointerStart.lockDrag) { event.preventDefault(); lp.pointerStart.lockActive = lockMove(dx, dy); return true; }
      return false;
    },
    pointerdown(event) {
      if (lp.pointerStart.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
      else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
      return false;
    },
    back() {
      if (ui.view === 'lock' && ui.kgBouncing) { ui.kgBouncing = false; ui.kgPending = null; lockControls.lock(); render(); return true; }
      if (ui.view === 'lock') return true;
      return false;
    },
    overlays: {
      'kg-widget-picker'() {
        const choices = [['calendar', 'Calendar', 'calendar.png'], ['clock', 'Digital clock', 'clock.png']];
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog jbk-picker" role="dialog" aria-label="${safe(i18n.t('Choose widget'))}"><h3>${safe(i18n.t('Choose widget'))}</h3>${choices.map(([type, label, icon]) => `<button data-action="kg-pick-widget" data-id="${type}"><img src="assets/${icon}" alt=""><span>${safe(i18n.t(label))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      },
    },
    click(action, button, event) {
      const {id} = button.dataset;
      switch (action) {
        case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; lp.saveMusic(); render(); break;
        case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!lp.pointerStart?.lockDrag) lockRelease(null); }, 1000); break;
        case 'kg-add-widget': ui.overlay = 'kg-widget-picker'; renderOverlay(); break;
        case 'kg-pick-widget': { const widgets = lp.data.keyguardWidgets ||= []; if (widgets.length < JBKeyguard.MAX_WIDGETS) { widgets.push({id: `kg-${Date.now()}`, type: id}); save(); ui.kgPage = widgets.length; } ui.overlay = ''; if (ui.kgRelock) { ui.kgRelock = false; const page = ui.kgPage; lockScreen(); ui.kgPage = page; render(); } else render(); break; }
        case 'unlock': ui.view = 'home'; render(); break;
        // ActivatableNotificationView: the first touch activates the card ("Touch again to open"), the second opens it.
        case 'lp-kg-note': if (ui.kgActivated !== id) { ui.kgActivated = id; viewport.querySelectorAll('.lp-kg-note').forEach(node => node.classList.toggle('activated', node.dataset.id === id)); kgHint('Touch again to open'); break; }
          ui.kgActivated = ''; if (ui.locked) { requestBouncer({type: 'note', id}); break; } { const opener = document.createElement('button'); opener.dataset.action = 'notification-open'; opener.dataset.id = id; screen.append(opener); home(false); opener.click(); opener.remove(); } break;
        case 'unlock-camera': openApp('camera'); break;
        default: return false;
      }
      return true;
    }
  };
});
