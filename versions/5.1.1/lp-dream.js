/* Daydream on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the Clock, Colors and Photo Frame screen savers, their redraw in the device clock's tick, start and exit */
'use strict';
LP.define('dream', ({
  deviceDate, i18n, overlayRoot, renderOverlay, safe, ui
}, lp) => {
  const dreams = [['clock', 'Clock'], ['colors', 'Colors'], ['photoframe', 'Photo Frame']];
  // Dreams: DeskClock Screensaver (dimmed clock that moves every minute), SystemUI Colors and a photo slideshow.
  function renderDream() {
    const type = lp.data.settings.daydreamType || 'clock', now = deviceDate();
    if (type === 'colors') return '<div class="jb-dream jb-dream-colors" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"></div>';
    if (type === 'photoframe') { const photo = lp.data.photos[Math.floor(Date.now() / 6000) % Math.max(1, lp.data.photos.length)]; return `<div class="jb-dream jb-dream-photo" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream">${photo ? `<img src="${ICSMedia.image(photo)}" alt="">` : ''}</div>`; }
    const time = now.toLocaleTimeString(i18n.locale(), {hour: lp.data.settings.hour24 ? '2-digit' : 'numeric', minute: '2-digit', hour12: !lp.data.settings.hour24}), [hours, rest = ''] = time.split(/[:.]/);
    const spot = Math.floor(Date.now() / 60000) % 4;
    return `<div class="jb-dream jb-dream-clock" data-action="dream-exit" role="button" tabindex="0" aria-label="Daydream"><div class="jb-dream-saver" style="--spot:${spot}"><div class="jbclock-time"><span class="jbclock-hours">${safe(hours)}</span><span class="jbclock-minutes">:${safe(rest.replace(/\s?[^\d].*$/, ''))}</span></div><div class="jbclock-date">${safe(now.toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale()))}${lp.nextAlarmLabel() ? ` <img src="assets/dc5-ic_alarm_small.png" alt="">${safe(lp.nextAlarmLabel())}` : ''}</div></div></div>`;
  }
  Object.assign(lp, {dreams});
  return {
    clockTick() {
      // Dreams redraw only when the saver moves (each minute) or the slideshow advances; otherwise just the text changes.
      if (ui.overlay === 'dream' && !lp.pointerStart) {
        const key = `${lp.data.settings.daydreamType}:${Math.floor(Date.now() / 60000)}:${Math.floor(Date.now() / 6000)}`, type = lp.data.settings.daydreamType || 'clock';
        const changed = type === 'clock' ? key.split(':')[1] !== ui.dreamKey?.split(':')[1] : type === 'photoframe' ? key !== ui.dreamKey : false;
        if (changed || !ui.dreamKey) { ui.dreamKey = key; renderOverlay(); }
        else { const fresh = document.createElement('div'); fresh.innerHTML = renderDream(); const saver = overlayRoot.querySelector('.jb-dream-saver'), next = fresh.querySelector('.jb-dream-saver'); if (saver && next) { saver.querySelector('.jbclock-time').innerHTML = next.querySelector('.jbclock-time').innerHTML; } }
      }
      return false;
    },
    overlays: {
      'dream'() {
        overlayRoot.innerHTML = renderDream();
      },
    },
    click(action, button, event) {
            switch (action) {
        case 'dream-start': ui.overlay = 'dream'; ui.dreamKey = ''; renderOverlay(); break;
        case 'dream-exit': ui.overlay = ''; renderOverlay(); break;
        default: return false;
      }
      return true;
    }
  };
});
