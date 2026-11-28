/* Sound Search for Google Play 1.1.9 on Android 4.3 (the image's Ears widget), moved out of simulator.js
   (docs/plans/engine-migration.md): the widget's capture (listening, lookup, a match or none; the widget alone is
   repainted), the history screen with its menu and Clear all, and Back. The widget's place on the home screen is the
   launcher's. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, captureRecentView, data, home, i18n, overlayRoot, render, renderOverlay, safe, save, toast, tracks, ui, viewport;
  const $bind = c => { $c = c; ({captureRecentView, data, home, i18n, overlayRoot, render, renderOverlay, safe, save, toast, tracks, ui, viewport} = c); };
  /* Sound Search capture: EarsWidgetCaptureService listens for at most Ears.CAPTURE_MS; here the song the Music app is
     playing is recognized after Ears.MATCH_MS, anything else ends without a match. The widget alone is repainted. */
  function earsPaint() { viewport.querySelectorAll('.widget-ears').forEach(node => { const id = node.dataset.widgetId; node.innerHTML = Ears.widget(ui.ears, i18n.language) + (node.querySelector('[data-resize-frame]')?.outerHTML || ''); }); }
  function earsStart() {
    clearTimeout(ui.earsTimer); clearInterval(ui.earsTick);
    const hears = ui.music.playing ? tracks[ui.music.track] : null;
    ui.ears = {phase: 'listening', started: Date.now(), hears}; earsPaint();
    ui.earsTick = setInterval(() => { if (ui.ears?.phase === 'listening') earsPaint(); else clearInterval(ui.earsTick); }, 150);
    ui.earsTimer = setTimeout(earsFinish, hears ? Ears.MATCH_MS : Ears.CAPTURE_MS);
  }
  function earsFinish() {
    if (ui.ears?.phase !== 'listening') return;
    clearTimeout(ui.earsTimer); clearInterval(ui.earsTick);
    const song = ui.music.playing ? tracks[ui.music.track] : null;
    ui.ears = {phase: 'lookup'}; earsPaint();
    ui.earsTimer = setTimeout(() => {
      if (song) { ui.ears = {phase: 'result', title: song.title, artist: song.artist}; data.earsHistory = [{title: song.title, artist: song.artist, time: Date.now()}, ...(data.earsHistory || [])].slice(0, 100); save(); }
      else ui.ears = {phase: 'nomatch'};
      earsPaint();
    }, Ears.LOOKUP_MS);
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'ears-history': return Ears.history(data.earsHistory || [], i18n.language, i18n.locale());
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'ears-listen': earsStart(); break;
        case 'ears-stop': earsFinish(); break;
        case 'ears-close': clearTimeout(ui.earsTimer); ui.ears = {phase: 'idle'}; earsPaint(); break;
        case 'ears-history': captureRecentView(); ui.view = 'ears-history'; ui.sub = ''; ui.overlay = ''; render(); break;
        case 'ears-menu': ui.overlay = 'ears-menu'; renderOverlay(); break;
        case 'ears-account': ui.overlay = ''; renderOverlay(); toast('This feature is not part of the simulator.'); break;
        case 'ears-clear-ask': ui.overlay = 'ears-clear'; renderOverlay(); break;
        case 'ears-clear': data.earsHistory = []; save(); ui.overlay = ''; render(); break;
        default: return false;
      }
      return true;
    },
    back(c) {
      $bind(c);
      if (ui.overlay) return false;
      if (ui.view === 'ears-history' && !ui.overlay) { home(false); return true; }
      return false;
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'ears-menu') {
        // history_menu.xml in the Holo dark overflow.
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ears-menu" data-no-translate>${Ears.menu(i18n.language).map(([action, title]) => `<button data-action="${action}">${safe(title)}</button>`).join('')}</div>`;
      } else if (ui.overlay === 'ears-clear') {
        // Clear all: an AlertDialog with delete_all_confirmation and No / Yes.
        const T = key => Ears.text(i18n.language, key);
        overlayRoot.innerHTML = `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${safe(T('delete_all'))}" data-no-translate><p class="ga-body">${safe(T('delete_all_confirmation'))}</p><div class="ga-buttons"><button type="button" data-action="close-overlay">${safe(T('no'))}</button><button type="button" data-action="ears-clear">${safe(T('yes'))}</button></div></div>`;
      }
      else return;
      return true;
    }
  };
  JB.register('ears-history', spec);
})();
