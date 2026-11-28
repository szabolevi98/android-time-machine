/* The wallpaper screens of Android 2.3.6 as modules (docs/plans/engine-migration.md): LivePicker's list, preview and the
   live wallpapers' settings (Magic Smoke's selector, Polar Clock's and Maps' preferences) with their dialogs, and
   Launcher2's WallpaperChooser (the gallery of the image's wallpapers above the preview). The wallpaper itself (the
   engines on home and the keyguard) is the system's and stays with the shell. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  // The shell's bindings the screens' code uses, and their helpers on them.
  function shell(c) {
    const {data, ui, safe} = c;
    /* LivePicker 2.3.6: LiveWallpaperListActivity (Theme.NoTitleBar; live_wallpaper_entry rows with the 75 dip thumbnail,
       the label and the Html description), LiveWallpaperPreview (two 160 dip buttons at the bottom; Settings… only with a
       settings activity), MagicSmokeSelector ("Tap to change", OK) and PolarClockSettings (Theme, two checkboxes and a list). */
    const lwText = key => AndroidStrings.resources(() => window.GBStrings?.wallpapers).t(key, i18n.language);
    const lwLabel = spec => lwText(spec.gb?.[0] || spec.label);
    function renderLiveWallpapers() {
      const sub = String(ui.sub || ''), T = lwText;
      if (sub.startsWith('preview:')) {
        const spec = LiveWallpapers.find(sub.slice(8));
        return `<div class="app-view lw-preview gblw-preview" data-no-translate><div class="gblw-buttons"><button class="gblw-btn" data-action="lw-set" data-id="${safe(spec?.id || '')}">${safe(T('wallpaper_instructions'))}</button>${spec?.settings ? `<button class="gblw-btn" data-action="lw-settings" data-id="${spec.id}">${safe(T('configure_wallpaper'))}</button>` : ''}</div></div>`;
      }
      if (sub === 'settings:magicsmoke') return `<div class="app-view lw-preview gblw-smoke" data-action="lw-smoke-tap" data-no-translate><div class="gblw-smoke-hint">${safe(T('taptochange'))}</div><button class="gblw-btn" data-action="lw-smoke-ok">${safe(T('ok'))}</button></div>`;
      // Maps 5.4.0's MapWallpaperSettingsActivity (wallpaper_prefs.xml): Show traffic (off by default) and Map mode.
      if (sub === 'settings:maps') {
        const traffic = data.lwPrefs?.maps?.traffic === true;
        return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${safe(T('maps_settings'))}</div><div class="gbset-list"><button class="gbset-row" data-action="lw-flag" data-id="maps:traffic" role="checkbox" aria-checked="${traffic}"><span class="gbset-text"><span class="gbset-title">${safe(T('maps_show_traffic'))}</span></span><img class="gbset-check" src="assets/gb-btn_check_${traffic ? 'on' : 'off'}.png" alt=""></button><button class="gbset-row" data-action="lw-mapmode"><span class="gbset-text"><span class="gbset-title">${safe(T('maps_map_mode'))}</span><span class="gbset-sum">${safe(T('maps_map_mode_summary'))}</span></span></button></div></div>`;
      }
      if (sub.startsWith('settings:')) {
        const p = data.lwPrefs?.polar || {};
        const check = (key, title) => `<button class="gbset-row" data-action="lw-toggle" data-id="polar:${key}" role="checkbox" aria-checked="${p[key] !== false}"><span class="gbset-text"><span class="gbset-title">${safe(T(title))}</span></span><img class="gbset-check" src="assets/gb-btn_check_${p[key] !== false ? 'on' : 'off'}.png" alt=""></button>`;
        return `<div class="app-view gbset" data-no-translate><div class="gb-titlebar">${safe(T('clock_settings'))}</div><div class="gbset-list">${check('showSeconds', 'show_seconds')}${check('variableWidth', 'variable_line_width')}<button class="gbset-row" data-action="lw-palette"><span class="gbset-text"><span class="gbset-title">${safe(T('palette'))}</span></span></button></div></div>`;
      }
      const collator = new Intl.Collator(i18n.locale());
      const list = [...LiveWallpapers.LIST].sort((a, b) => collator.compare(lwLabel(a), lwLabel(b)));
      return `<div class="app-view lw-picker gblw" data-no-translate>${list.map(spec => `<button class="gblw-entry" data-action="lw-preview" data-id="${spec.id}"><img src="assets/${spec.thumb}" alt=""><span class="gblw-copy"><span class="gblw-title">${safe(lwLabel(spec))}</span><span class="gblw-desc">${safe(T(spec.gb[1])).replace(/\s*&lt;br&gt;\s*/g, '<br>')}</span></span></button>`).join('')}</div>`;
    }
    return {data, ui, save: c.save, render: c.render, renderOverlay: c.renderOverlay, home: c.home, lwText, renderLiveWallpapers};
  }
  window.GB?.register('live-wallpapers', {
    render: c => shell(c).renderLiveWallpapers(),
    // Map mode and Polar Clock's palette.
    dialog(kind, c) {
      const {data, lwText} = shell(c);
      if (kind === 'mapmode') { const modes = ['normal', 'satellite', 'terrain']; return {title: lwText('maps_map_mode'), items: modes.map(id => ({action: 'lw-mapmode-pick', id, title: lwText(`maps_mode_${id}`)})), choice: 'single', selected: modes.indexOf(data.lwPrefs?.maps?.mode || 'satellite'), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
      if (kind === 'palette') { const current = data.lwPrefs?.polar?.palette || ''; return {title: lwText('palette'), items: LiveWallpapers.PALETTE_ORDER.map(id => ({action: 'lw-palette-pick', id, title: lwText(id)})), choice: 'single', selected: LiveWallpapers.PALETTE_ORDER.indexOf(current), buttons: [{action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]}; }
      return {title: '', items: []};
    },
    // Settings return to the preview, the preview to the list, the list to the launcher.
    back(c) {
      const {ui, render, home} = shell(c);
      const sub = String(ui.sub || ''); if (sub.startsWith('settings:')) ui.sub = `preview:${sub.slice(9)}`; else if (sub) ui.sub = ''; else { home(false); return true; } render(); return true;
    },
    action(name, el, c) {
      const id = el.dataset.id, {data, ui, save, render, renderOverlay, home} = shell(c);
      switch (name) {
        case 'lw-preview': ui.sub = `preview:${id}`; render(); break;
        case 'lw-settings': ui.sub = `settings:${id}`; render(); break;
        // LiveWallpaperPreview.setLiveWallpaper: set it and return to the launcher.
        case 'lw-set': data.liveWallpaper = {id}; save(); ui.sub = ''; home(false); break;
        case 'lw-toggle': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] === false; save(); render(); break; }
        case 'lw-palette': ui.overlay = 'gb-dialog-lw-palette'; renderOverlay(); break;
        // MagicSmokeSelector.onTouchEvent: every touch steps back one preset; OK finishes the selector.
        case 'lw-smoke-tap': { data.lwPrefs ||= {}; data.lwPrefs.magicsmoke ||= {}; const n = LiveWallpapers.SMOKE_PRESETS.length, cur = Number(data.lwPrefs.magicsmoke.preset ?? LiveWallpapers.SMOKE_DEFAULT); data.lwPrefs.magicsmoke.preset = cur <= 0 || cur >= n ? n - 1 : cur - 1; save(); break; }
        case 'lw-smoke-ok': ui.sub = 'preview:magicsmoke'; render(); break;
        case 'lw-flag': { const [wid, key] = String(id).split(':'); data.lwPrefs ||= {}; data.lwPrefs[wid] ||= {}; data.lwPrefs[wid][key] = data.lwPrefs[wid][key] !== true; save(); render(); break; }
        case 'lw-mapmode': ui.overlay = 'gb-dialog-lw-mapmode'; renderOverlay(); break;
        case 'lw-mapmode-pick': data.lwPrefs ||= {}; data.lwPrefs.maps ||= {}; data.lwPrefs.maps.mode = id; save(); ui.overlay = ''; render(); break;
        case 'lw-palette-pick': data.lwPrefs ||= {}; data.lwPrefs.polar ||= {}; data.lwPrefs.polar.palette = id; save(); ui.overlay = ''; render(); break;
        default: return false;
      }
      return true;
    }
  });
  // WallpaperChooser: the wallpaper picked in the gallery shows above it; Set wallpaper sets it and returns home.
  window.GB?.register('wallpaper-picker', {
    render(c) {
      const {data, ui, safe, wallpaperFiles} = c, t = key => i18n.t(key);
      const selected = Number.isInteger(ui.wpChoice) ? ui.wpChoice : Math.max(0, data.wallpaper); return `<div class="app-view gbwp"><div class="gbwp-preview"><img src="assets/gb-wallpaper_${wallpaperFiles[selected]}.jpg" alt=""></div><div class="gbwp-gallery" role="listbox" aria-label="${safe(t('Wallpapers'))}">${wallpaperFiles.map((name, index) => `<button class="gbwp-item${index === selected ? ' selected' : ''}" role="option" aria-selected="${index === selected}" data-action="gb-wp-pick" data-id="${index}" aria-label="${safe(name.replace(/_/g, ' '))}"><img src="assets/gb-wallpaper_${name}_small.jpg" alt=""></button>`).join('')}</div><button class="gbwp-set" data-action="wallpaper" data-id="${selected}">${safe(t('Set wallpaper'))}</button></div>`;
    },
    back(c) { c.home(false); return true; },
    action(name, el, c) {
      const id = el.dataset.id, {data, ui, save, render, toast, viewport, home, reducedMotion} = c;
      switch (name) {
        case 'gb-wp-pick': ui.wpChoice = Number(id); render(); viewport.querySelector('.gbwp-item.selected')?.scrollIntoView({inline: 'center', block: 'nearest', behavior: reducedMotion?.matches ? 'auto' : 'smooth'}); break;
        case 'wallpaper': data.wallpaper = Number(id); delete data.liveWallpaper; delete data.customWallpaper; delete data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
        default: return false;
      }
      return true;
    }
  });
})();
