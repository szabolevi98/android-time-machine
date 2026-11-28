/* Play Music 4.1 (the IMM76I image's Music2.apk: ics-play-music.js), moved out of simulator.js
   (docs/plans/engine-migration.md): its library and search, the dialogs, and playback through the shared engine
   (ui.music, ics-music.js's saveMusic), like AOSP Music. */
(() => {
  'use strict';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    // Play Music 4.1 plays the demo library through the shared engine (ui.music), like AOSP Music.
    function playMusicContext() {
      return {tracks, music: ui.music, ui, data, lang: i18n.language, time: ICSMusic.time, save, render, renderOverlay, toast, account: window.ICSGmail?.account,
        focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        play(ids, track) { ui.music.queue = [...ids]; ui.music.track = track; ui.music.position = 0; ui.music.playing = true; ui.musicActive = true; ui.musicTrack = track; ui.musicPlaying = true; c.saveMusic(); }};
    }

    return {playMusicContext};
  }

  ICS.register('play-music', {
    render(c) { return ICSPlayMusic.render(api(c).playMusicContext()); },
    // Its dialogs are drawn as they are (not translated, no launcher clings).
    ownOverlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {playMusicContext} = api(c);
      if (ui.view === 'play-music' && ui.overlay.startsWith('pm4-')) return ICSPlayMusic.overlay(playMusicContext()) || '';
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {playMusicContext} = api(c), {id} = button.dataset;
      if (ui.view === 'play-music' && action.startsWith('pm4-') && ICSPlayMusic.handle(action, id, playMusicContext(), button)) return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (form.dataset.form === 'pm4-search') { viewport.querySelector('[data-pm4-query]')?.blur(); return true; }
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      // Play Music's search: the sections follow the query; the field keeps its focus and caret.
      if (event.target.matches('[data-pm4-query]')) { ui.pm4Query = event.target.value; const at = event.target.selectionStart; render(); const field = viewport.querySelector('[data-pm4-query]'); if (field) { field.focus(); field.setSelectionRange(at, at); } return true; }
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (ui.view === 'play-music' && !ui.overlay && ICSPlayMusic.back(ui)) { render(); return true; }
      return false;
    },
  });
})();
