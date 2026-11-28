/* TODO */
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
  // lp:code
  return {
    // lp:hooks
    clockTick() {
      // Dreams redraw only when the saver moves (each minute) or the slideshow advances; otherwise just the text changes.
      if (ui.overlay === 'dream' && !lp.pointerStart) {
        const key = `${lp.data.settings.daydreamType}:${Math.floor(Date.now() / 60000)}:${Math.floor(Date.now() / 6000)}`, type = lp.data.settings.daydreamType || 'clock';
        const changed = type === 'clock' ? key.split(':')[1] !== ui.dreamKey?.split(':')[1] : type === 'photoframe' ? key !== ui.dreamKey : false;
        if (changed || !ui.dreamKey) { ui.dreamKey = key; renderOverlay(); }
        else { const fresh = document.createElement('div'); fresh.innerHTML = renderDream(); const saver = overlayRoot.querySelector('.jb-dream-saver'), next = fresh.querySelector('.jb-dream-saver'); if (saver && next) { saver.querySelector('.jbclock-time').innerHTML = next.querySelector('.jbclock-time').innerHTML; } }
      }
      // lp:clockTick
      return false;
    },
    overlays: {
      'dream'() {
        overlayRoot.innerHTML = renderDream();
      },
      // lp:overlays
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'dream-start': ui.overlay = 'dream'; ui.dreamKey = ''; renderOverlay(); break;
        case 'dream-exit': ui.overlay = ''; renderOverlay(); break;
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
