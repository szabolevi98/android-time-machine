/* The volume keys of Android 4.3, moved out of simulator.js (docs/plans/engine-migration.md): the active stream's
   panel (volume-panel.js) with its seek bar and 3 s timeout, key repeats, music with the screen off, and the ringing
   alarm's snooze / dismiss by the keys. The volume layer is the core's. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, data, i18n, renderStatus, save, ui, viewport, volumeLayer;
  const $bind = c => { $c = c; ({data, i18n, renderStatus, save, ui, viewport, volumeLayer} = c); };
  let volumeTimer = 0, volumePrevious = 0;
  const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
  function volumeKey(direction) {
    const buttons = ClockPrefs.prefs(data).buttons;
    if (ui.overlay === 'clock-ringing' && buttons !== '0') { const b = document.createElement('button'); b.dataset.action = buttons === '1' ? 'alarm-snooze' : 'alarm-dismiss'; viewport.append(b); b.click(); b.remove(); return; }
    if (ui.power) return;
    const stream = volumeStream();
    // With the screen off the keys only reach music that is playing, and no panel is shown.
    if (ui.sleeping && stream !== 'music') return;
    const result = VolumePanel.adjust(data.settings, stream, direction, volumePrevious); volumePrevious = direction;
    save(); renderStatus();
    if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
    if (!ui.sleeping) showVolume(stream);
  }
  function showVolume(stream) {
    volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key));
    VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
    resetVolumeTimeout();
  }
  function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
  function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
  // Held keys repeat after config_keyRepeatTimeout (500 ms) every 50 ms, as key repeats do.
  function bindVolumeKey(element, direction) {
    let delay = 0, repeat = 0;
    const stop = () => { clearTimeout(delay); clearInterval(repeat); };
    element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); const dir = typeof direction === 'function' ? direction(event) : direction; volumeKey(dir); stop(); delay = setTimeout(() => { repeat = setInterval(() => volumeKey(dir), 50); }, 500); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, stop));
    element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
  }
  const spec = {
    exports: {
      hideVolume: (c, ...args) => { $bind(c); return hideVolume(...args); },
      bindVolumeKey: (c, ...args) => { $bind(c); return bindVolumeKey(...args); }
    }
  };
  JB.register('volume', spec);
})();
