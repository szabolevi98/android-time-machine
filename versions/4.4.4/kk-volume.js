/* The volume panel of the 4.4.4 shell (docs/plans/engine-migration.md): the active stream's slider
   (volume-panel.js), its seek and the 3 s timeout, moved out of simulator.js. The volume keys are the shell's. */
(() => {
  'use strict';
  let volumeTimer = 0;
  function scope(c) {
    const {data, i18n, save, volumeLayer} = c;
    function showVolume(stream) {
      volumeLayer.innerHTML = VolumePanel.render(data.settings, stream, key => i18n.t(key));
      VolumePanel.bindSeek(volumeLayer, VolumePanel.STREAMS[stream].max, value => { VolumePanel.setIndex(data.settings, stream, value); save(); VolumePanel.update(volumeLayer, data.settings, stream); resetVolumeTimeout(); });
      resetVolumeTimeout();
    }
    function resetVolumeTimeout() { clearTimeout(volumeTimer); volumeTimer = setTimeout(hideVolume, VolumePanel.TIMEOUT); }
    function hideVolume() { clearTimeout(volumeTimer); const panel = volumeLayer.firstElementChild; if (!panel || panel.classList.contains('fading')) return; panel.classList.add('fading'); setTimeout(() => panel.remove(), 400); }
    return {
      showVolume,
      hideVolume
    };
  }
  const spec = {
    api: scope
  };
  for (const id of ['volume']) KK.register(id, spec);
})();
