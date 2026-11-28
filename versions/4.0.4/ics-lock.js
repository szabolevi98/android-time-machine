/* The lock screen (IMM76I framework's LockScreen with MultiWaveView, keyguard_screen_tab_unlock), moved out of
   simulator.js (docs/plans/engine-migration.md). lockscreen.js has the secure keyguards (pattern, PIN, password, Face
   Unlock's fallback) and their setup; this module is the slide lock around them:
   - the clock, the date, the owner info and the carrier; the Music transport while the Music service is active
   - the handle: drag it to the unlock or the camera target (60 dp hit radius), or it returns and the chevrons ping;
     a tap shows the hint
   - Back does nothing here; the countdown of a locked-out keyguard and the clock follow the device clock. */
(() => {
  'use strict';
  let lockControls = null;
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
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
      if (active && active !== c.pointer?.lockActive && data.settings.haptic !== false) navigator.vibrate?.(20);
      return active;
    }
    function lockRelease(active) {
      const handle = viewport.querySelector('.lock-handle');
      screen.classList.remove('lock-dragging');
      if (active) {
        viewport.querySelectorAll(`.lock-target:not(.lock-target-${active})`).forEach(target => target.classList.add('dismissed'));
        viewport.querySelector('.lock-outer-ring')?.classList.add('dismissed');
        c.suppressClick(350);
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
      // TransportControlView covers the clock rows while the Music service is active.
      const track = tracks[ui.music.track], transport = c.musicActive() ? `<div class="lock-transport" data-no-translate><div class="lock-transport-art"></div><div class="lock-transport-bar"><p><span>${safe(track.title)}</span> - ${safe(track.artist)} - ${safe(track.album)}</p><div><button data-action="lock-media" data-id="previous" aria-label="${safe(i18n.t('Previous track'))}"><img src="assets/music-ic_media_previous.png" alt=""></button><button data-action="lock-media" data-id="play" aria-label="${safe(i18n.t(ui.music.playing ? 'Pause' : 'Play'))}"><img src="assets/music-ic_media_${ui.music.playing ? 'pause' : 'play'}.png" alt=""></button><button data-action="lock-media" data-id="next" aria-label="${safe(i18n.t('Next track'))}"><img src="assets/music-ic_media_next.png" alt=""></button></div></div></div>` : '';
      return `<div class="lock-view${transport ? ' with-transport' : ''}">${transport}<div class="lock-clock"><div class="lock-time">${clock()}</div><div class="lock-date">${c.fullDate()}</div>${data.settings.showOwner?`<div class="lock-owner">${safe(data.settings.ownerInfo)}</div>`:''}</div><div class="lock-wave"><div class="lock-outer-ring"></div><button class="lock-target lock-target-unlock" data-action="unlock" aria-label="Unlock"><img src="assets/ic_lockscreen_unlock_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_unlock_activated.png" alt=""></button><button class="lock-target lock-target-camera" data-action="unlock-camera" aria-label="Camera"><img src="assets/ic_lockscreen_camera_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_camera_activated.png" alt=""></button>${[0,1,2].map(() => '<img class="lock-chevron" src="assets/ic_lockscreen_chevron_right.png" alt="">').join('')}<button class="lock-handle" data-action="lock-hint" aria-label="Slide to unlock"><img src="assets/ic_lockscreen_handle_normal.png" alt=""><img class="lock-activated" src="assets/ic_lockscreen_handle_pressed.png" alt=""></button></div><div class="lock-carrier">${c.carrierName()}</div></div>`;
    }
    return {lockWave, lockPing, lockMove, lockRelease, renderLock};
  }

  ICS.register('lock', {
    touch: '.lock-view',
    // The keyguard of a secure lock (lockscreen.js): it is up from the start when a pattern, PIN or password is set.
    init(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {fullDate} = c;
      lockControls=ICSLockscreen.controller({getData:()=>c.data,getUI:()=>ui,t:key=>i18n.t(key),save,render,clock,date:fullDate,carrier:()=>c.data.settings.airplane?i18n.t('No service.'):c.data.settings.networkOperator||'Telekom',toast,unlock:()=>{ui.locked=false;ui.sleeping=false;home(false);}});
      ui.locked=ICSLockscreen.secure(data);if(ui.locked)ui.view='lock';lockControls.lock();lockControls.bind(screen);
      c.lockControls = lockControls;
    },
    render(c) { return api(c).renderLock(); },
    drawn(c) { requestAnimationFrame(api(c).lockPing); },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {lockRelease} = api(c), {id} = button.dataset;
      switch (action) {
        case 'lock-media': if (id === 'play') { ui.music.playing = !ui.music.playing; if (ui.music.playing && ui.music.position >= tracks[ui.music.track].duration) ui.music.position = 0; } else ICSMusic.step(ui.music, id === 'previous' ? -1 : 1); ui.musicTrack = ui.music.track; c.saveMusic(); render(); break;
        case 'lock-hint': screen.classList.add('lock-dragging'); setTimeout(() => { if (!c.pointer?.lockDrag) lockRelease(null); }, 1000); break;
        case 'unlock': ui.view = 'home'; render(); break;
        case 'unlock-camera': openApp('camera'); break;
        default: return false;
      }
      return true;
    },
    back(c) { const {ui} = c; if (ui.overlay) return false; return ui.view === 'lock'; },
    pointerdown(event, p, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {lockPing} = api(c);
      p.lockDrag = ui.view === 'lock' && !!event.target.closest('.lock-handle');
      if (c.pointer.lockDrag) { clearTimeout(ui.lockReleaseTimer); viewport.querySelectorAll('.lock-chevron').forEach(chevron => chevron.getAnimations().forEach(animation => animation.cancel())); screen.classList.remove('lock-releasing'); screen.classList.add('lock-dragging'); try { screen.setPointerCapture(event.pointerId); } catch {} }
      else if (ui.view === 'lock' && !ui.locked && event.target.closest('.lock-wave')) lockPing();
    },
    pointermove(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {lockMove} = api(c);
      if (c.pointer.lockDrag) { event.preventDefault(); c.pointer.lockActive = lockMove(dx, dy); return true; }
    },
    pointerup(event, p, dx, dy, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {lockMove, lockRelease} = api(c);
      if (c.pointer.lockDrag) {
        const active = lockMove(dx, dy);
        if (!active && Math.hypot(dx, dy) > dp(7)) c.suppressClick(350);
        lockRelease(active);
        return true;
      }
    },
    pointercancel(c) { const lockHandle = c.viewport.querySelector('.lock-handle'); if (lockHandle) lockHandle.style.removeProperty('--lock-x'); },
    // Every second: the keyguard's countdown, then the clock.
    tick(c) {
      lockControls.tick();
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const lockTime = document.querySelector('.lock-time'); if (lockTime) lockTime.textContent = clock();
    },
  });
})();
