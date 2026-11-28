/* The live wallpaper picker on Android 4.3 (LivePicker of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): the list, the preview with Set wallpaper and Settings, Polar clock's and Maps'
   settings with their dialogs, and Back (settings → preview → list → home). The wallpapers are live-wallpapers.js's. */
(() => {
  'use strict';
  let $c, data, home, i18n, label, overlayRoot, render, renderOverlay, safe, save, ui;
  const $bind = c => { $c = c; ({data, home, i18n, label, overlayRoot, render, renderOverlay, safe, save, ui} = c); };
  // LivePicker: the list (LiveWallpaperActivity), the preview with its button bar, and Polar clock's settings.
  function renderLiveWallpapers() {
    const sub = String(ui.sub || '');
    if (sub.startsWith('preview:')) {
      const spec = LiveWallpapers.find(sub.slice(8));
      return `<div class="app-view lw-preview"><div class="lw-preview-bar">${spec?.settings ? `<button data-action="lw-settings" data-id="${spec.id}">${safe(i18n.t('Settings…'))}</button>` : ''}<button data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(i18n.t('Set wallpaper'))}</button></div></div>`;
    }
    // Maps: MapWallpaperSettingsActivity (wallpaper_prefs.xml): one ListPreference, its summary fixed in the XML.
    if (sub === 'settings:maps') return `<div class="app-view settings-app"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t('Maps live wallpaper settings'))}</h2></div><div class="app-content dark lw-settings"><button class="settings-row wireless-row" data-action="lw-mapmode"><span class="row-copy">${safe(i18n.t('Map mode'))}<small>${safe(i18n.t('The mode of the map e.g. Satellite'))}</small></span></button></div></div>`;
    if (sub.startsWith('settings:')) {
      const p = data.lwPrefs?.polar || {}, palette = p.palette || '';
      const check = (key, title) => `<button class="settings-row wireless-row" data-action="lw-toggle" data-id="polar:${key}" role="checkbox" aria-checked="${p[key] !== false}"><span class="row-copy">${safe(i18n.t(title))}</span><img class="holo-checkbox" src="assets/btn_check_${p[key] !== false ? 'on' : 'off'}_holo_dark.png" alt=""></button>`;
      return `<div class="app-view settings-app"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>${safe(i18n.t('Polar clock settings'))}</h2></div><div class="app-content dark lw-settings">${check('showSeconds', 'Show seconds')}${check('variableWidth', 'Vary ring widths')}<button class="settings-row wireless-row" data-action="lw-palette"><span class="row-copy">${safe(i18n.t('Color palette'))}${palette ? `<small>${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[palette]))}</small>` : ''}</span></button></div></div>`;
    }
    return `<div class="app-view lw-picker" data-no-translate>${LiveWallpapers.sorted(key => i18n.t(key), i18n.locale()).map(spec => `<button class="lw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span>${safe(LiveWallpapers.labelOf(spec, key => i18n.t(key)))}</span></button>`).join('')}</div>`;
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'live-wallpapers': return renderLiveWallpapers();
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      switch (action) {
        case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
        case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
        case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
        case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
        case 'lw-palette': ui.overlay = 'lw-palette'; renderOverlay(); break;
        case 'lw-mapmode': ui.overlay = 'lw-mapmode'; renderOverlay(); break;
        case 'lw-mapmode-pick': data.lwPrefs ||= {}; data.lwPrefs.maps ||= {}; data.lwPrefs.maps.mode = id; save(); ui.overlay = ''; render(); break;
        case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
        default: return false;
      }
      return true;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return true; } render(); return true; }
      return false;
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'lw-mapmode') {
        const current = data.lwPrefs?.maps?.mode || 'satellite';
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Map mode'))}"><h3>${safe(i18n.t('Map mode'))}</h3>${[['normal', 'Normal'], ['satellite', 'Satellite'], ['terrain', 'Terrain']].map(([id, label]) => `<button class="settings-row wireless-row" data-action="lw-mapmode-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(label, 'Maps'))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      } else if (ui.overlay === 'lw-palette') {
        const current = data.lwPrefs?.polar?.palette || '';
        overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Color palette'))}"><h3>${safe(i18n.t('Color palette'))}</h3>${LiveWallpapers.PALETTE_ORDER.map(id => `<button class="settings-row wireless-row" data-action="lw-palette-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[id]))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      }
      else return;
      return true;
    }
  };
  JB.register('live-wallpapers', spec);
})();
