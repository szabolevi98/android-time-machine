/* The wallpapers (IMM76I Launcher2's WallpaperChooser and LiveWallpapersPicker.apk), moved out of simulator.js
   (docs/plans/engine-migration.md): the Wallpapers grid (also Settings › Display › Wallpaper), the live wallpapers'
   list, preview (Set wallpaper, Settings…) and the Maps and Polar clock settings with their dialogs, and the live
   wallpaper engine: live-wallpapers.js draws in the wallpaper window behind the launcher and the keyguard, follows the
   home screen's scroll and takes the taps that reach the wallpaper. */
(() => {
  'use strict';
  let liveLayer = null, liveWallpaper = null, liveOffsetTween = 0;
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
    const wallpaperChoices = () => `<div class="wallpaper-grid">${c.wallpaperFiles.map((name, i) => `<button class="wallpaper-choice ${data.wallpaper === i ? 'selected' : ''}" data-action="wallpaper" data-id="${i}" aria-label="${safe(name)}"><span class="wallpaper-swatch" style="background-image:url('assets/wallpaper_${name}.jpg')"></span><strong>${safe(name[0].toUpperCase() + name.slice(1))}</strong></button>`).join('')}</div>`;
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
      return `<div class="app-view lw-picker" data-no-translate>${LiveWallpapers.sorted(key => i18n.t(key), i18n.locale()).map(spec => `<button class="lw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span><b>${safe(LiveWallpapers.labelOf(spec, key => i18n.t(key)))}</b><small>${safe(LiveWallpapers.describe(spec, i18n.language)).split('\n').join('<br>')}</small></span></button>`).join('')}</div>`;
    }
    /* WallpaperService visibility: the engine draws only while its window shows (home and keyguard, or the picker's
       preview), and the launcher feeds it the workspace scroll as an x offset across the five pages. */
    function syncLiveWallpaper() {
      const preview = ui.view === 'live-wallpapers' && String(ui.sub || '').startsWith('preview:');
      const id = preview ? ui.sub.slice(8) : data.liveWallpaper?.id || '';
      // DeskClock's face is Theme.Holo.Wallpaper.NoTitleBar: the (live) wallpaper shows behind it too.
      const visible = !!id && (preview || (ui.view === 'settings' && ui.sub === 'easter' && !ui.easterNyan) || ['home', 'lock'].includes(ui.view) || ui.view === 'clock' && !ui.sub) && !ui.sleeping && !ui.power;
      const key = id ? `${id}:${preview}` : '';
      if (liveWallpaper && liveWallpaper.key !== key) { liveWallpaper.destroy(); liveWallpaper = null; }
      if (key && !liveWallpaper) {
        liveWallpaper = LiveWallpapers.mount(liveLayer, id, {preview, prefs: () => c.data.lwPrefs?.[id] || {}, clock: deviceDate, offset: preview ? .5 : ui.page / 4, audio: () => !!ui.music?.playing});
        if (liveWallpaper) liveWallpaper.key = key;
      }
      liveLayer.hidden = !visible; liveWallpaper?.pause(!visible);
      if (liveWallpaper && !preview && ui.view === 'home') liveWallpaper.setOffset(ui.page / 4);
      screen.classList.toggle('live-wallpaper', !!data.liveWallpaper?.id || preview);
    }
    function tweenWallpaperOffset(target) {
      if (!liveWallpaper) return;
      cancelAnimationFrame(liveOffsetTween);
      const from = liveWallpaper.offset ?? target, start = performance.now();
      const step = now => { const t = Math.min(1, (now - start) / 350), value = from + (target - from) * (1 - Math.pow(1 - t, 3)); liveWallpaper?.setOffset(value); if (liveWallpaper) liveWallpaper.offset = value; if (t < 1) liveOffsetTween = requestAnimationFrame(step); };
      liveOffsetTween = requestAnimationFrame(step);
    }
    return {wallpaperChoices, renderLiveWallpapers, syncLiveWallpaper, tweenWallpaperOffset};
  }

  const spec = {
    init(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      // The wallpaper window: a live wallpaper draws here, behind the status bar, the launcher and the keyguard.
      liveLayer = document.createElement('div'); liveLayer.id = 'live-wallpaper'; liveLayer.hidden = true; screen.prepend(liveLayer);
      c.wallpaperChoices = () => api(c).wallpaperChoices(); c.tweenWallpaperOffset = target => api(c).tweenWallpaperOffset(target);
      c.wallpaperOffset = value => { if (liveWallpaper) { liveWallpaper.setOffset(value); liveWallpaper.offset = value; } };
      viewport.addEventListener('click', event => {
        if (ui.view !== 'home' || !liveWallpaper || event.target.closest('button,a,input,[data-action],.widget,.home-search,.dock')) return;
        const r = screen.getBoundingClientRect(); liveWallpaper.tap(event.clientX - r.left, event.clientY - r.top);
      });
    },
    render(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.view === 'wallpaper-picker') return `<div class="app-view wallpaper-picker"><div class="actionbar"><button class="up" data-action="back" aria-label="Back">‹</button><h2>Wallpapers</h2></div><div class="app-content dark">${wallpaperChoices()}</div></div>`;
      return api(c).renderLiveWallpapers();
    },
    // Every draw: the wallpaper window shows (and its engine draws) only on the home screen, the keyguard and a preview.
    backdrop(c) { api(c).syncLiveWallpaper(); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay === 'lw-mapmode') {
        const current = data.lwPrefs?.maps?.mode || 'satellite';
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Map mode'))}"><h3>${safe(i18n.t('Map mode'))}</h3>${[['normal', 'Normal'], ['satellite', 'Satellite'], ['terrain', 'Terrain']].map(([id, label]) => `<button class="settings-row wireless-row" data-action="lw-mapmode-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(label, 'Maps'))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      }
      if (ui.overlay === 'lw-palette') {
        const current = data.lwPrefs?.polar?.palette || '';
        return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${safe(i18n.t('Color palette'))}"><h3>${safe(i18n.t('Color palette'))}</h3>${LiveWallpapers.PALETTE_ORDER.map(id => `<button class="settings-row wireless-row" data-action="lw-palette-pick" data-id="${id}" role="radio" aria-checked="${current === id}"><span class="row-copy">${safe(i18n.t(LiveWallpapers.PALETTE_NAMES[id]))}</span><img class="holo-radio" src="assets/btn_radio_${current === id ? 'on' : 'off'}_holo_dark.png" alt=""></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button></div></div>`;
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      const {id} = button.dataset;
      switch (action) {
        case 'open-wallpapers': ui.overlay = ''; ui.view = 'wallpaper-picker'; render(); break;
        case 'open-live-wallpapers': ui.overlay = ''; ui.view = 'live-wallpapers'; ui.sub = ''; render(); break;
        case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
        case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
        // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
        case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
        case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
        case 'lw-palette': ui.overlay = 'lw-palette'; renderOverlay(); break;
        case 'lw-mapmode': ui.overlay = 'lw-mapmode'; renderOverlay(); break;
        case 'lw-mapmode-pick': data.lwPrefs ||= {}; data.lwPrefs.maps ||= {}; data.lwPrefs.maps.mode = id; save(); ui.overlay = ''; render(); break;
        case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
        case 'gallery-wallpaper': ui.overlay = ''; openApp('gallery'); break;
        default: return false;
      }
      return true;
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, statusRoot, navRoot, screen, i18n, safe, clone, deviceDate, today, clock, apps, appNames, iconAssets, tracks, dp, snapResting, reducedMotion} = c;
      if (ui.overlay) return false;
      if (ui.view === 'live-wallpapers') { const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return true; } render(); return true; }
      if (ui.view === 'wallpaper-picker') { home(false); return true; }
      return false;
    }
  };
  ICS.register('wallpaper-picker', spec);
  ICS.register('live-wallpapers', spec);
})();
