/* The volume keys (IMM76I framework's VolumePanel), moved out of simulator.js (docs/plans/engine-migration.md): the
   active stream's slider (the call, music while it plays, the ringer otherwise), a 3 s timeout, and a touch anywhere
   else closes it; with the screen off the keys only reach music that is playing. Held keys repeat. */
(() => {
  'use strict';
  ICS.register('volume', {
    init(c) {
      const {ui, save, renderStatus, screen, i18n} = c;
      // Volume keys: the active stream's slider, a 3 s timeout, and a touch anywhere else closes it.
      const volumeLayer = document.createElement('div'); volumeLayer.id = 'volume-layer'; screen.append(volumeLayer);
      let volumeTimer = 0, volumePrevious = 0;
      const volumeStream = () => VolumePanel.activeStream({inCall: !!ui.activeCall, musicActive: !!ui.music?.playing});
      function volumeKey(direction) {
        if (ui.power) return;
        const stream = volumeStream();
        // With the screen off the keys only reach music that is playing, and no panel is shown.
        if (ui.sleeping && stream !== 'music') return;
        const result = VolumePanel.adjust(c.data.settings, stream, direction, volumePrevious); volumePrevious = direction;
        save(); renderStatus();
        if (result.vibrate) setTimeout(() => navigator.vibrate?.(VolumePanel.VIBRATE_DURATION), VolumePanel.VIBRATE_DELAY);
        if (!ui.sleeping) showVolume(stream);
      }
      function showVolume(stream) {
        volumeLayer.innerHTML = VolumePanel.render(c.data.settings, stream, key => i18n.t(key));
        VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(c.data.settings, stream, value); save(); VolumePanel.update(volumeLayer, c.data.settings, stream); resetVolumeTimeout(); });
        resetVolumeTimeout();
      }
      function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
      function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
      document.addEventListener('pointerdown', event => { if (volumeLayer.firstElementChild && !volumeLayer.contains(event.target) && !event.target.closest?.('.volume-key,.volume-rocker')) hideVolume(); }, true);
      // Held keys repeat after config_keyRepeatTimeout (500 ms) every 50 ms, as key repeats do.
      function bindVolumeKey(element, direction) {
        let delay = 0, repeat = 0;
        const stop = () => { clearTimeout(delay); clearInterval(repeat); };
        element.addEventListener('pointerdown', event => { if (event.button) return; event.preventDefault(); const dir = typeof direction === 'function' ? direction(event) : direction; volumeKey(dir); stop(); delay = setTimeout(() => { repeat = setInterval(() => volumeKey(dir), 50); }, 500); });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => element.addEventListener(type, stop));
        element.addEventListener('click', event => { if (event.detail === 0) volumeKey(typeof direction === 'function' ? 1 : direction); });
      }
      bindVolumeKey(document.querySelector('#volume-down'), -1);
      bindVolumeKey(document.querySelector('#volume-up'), 1);
      bindVolumeKey(document.querySelector('.volume-rocker'), event => event.offsetY < event.currentTarget.clientHeight / 2 ? 1 : -1);
    }
  });
})();
