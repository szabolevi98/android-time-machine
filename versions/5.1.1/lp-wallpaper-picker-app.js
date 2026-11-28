/* TODO */
'use strict';
LP.define('wallpaper-picker', ({
  dp, galleryWallpaper, holdDelay, home, i18n, render, save, screen, suppressReleaseClick, toast, ui, viewport,
  wallpaperFiles
}, lp) => {
  const wallpaperPickerContext = () => ({data: lp.data, ui, t: key => i18n.t(key), image: photo => ICSMedia.image(photo), bundled: wallpaperFiles.slice(1)});
  // Re-render the picker but keep the strip where it was scrolled.
  function wallpaperPickerRender() { const left = viewport.querySelector('.kwp-scroll')?.scrollLeft || 0; render(); const strip = viewport.querySelector('.kwp-scroll'); if (strip) strip.scrollLeft = left; }
  screen.addEventListener('wheel', event => {
    if (ui.view !== 'wallpaper-picker' || ui.overlay || event.ctrlKey) return;
    const strip = event.target.closest('.kwp-scroll'); if (!strip) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    strip.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1);
    event.preventDefault();
  }, {passive: false});
  // lp:code
  return {
    // lp:hooks
    pointerup() {
      if (lp.pointerStart.kwpDragging) { lp.suppressClickUntil = Date.now() + 350; lp.pointerStart = null; return true; }
      // lp:pointerup
      return false;
    },
    pointermove(event, dx) {
      if (lp.pointerStart.kwpScroll && event.pointerType === 'mouse' && (lp.pointerStart.kwpDragging || Math.abs(dx) > dp(9))) { lp.pointerStart.kwpDragging = true; const k = screen.getBoundingClientRect().width / screen.offsetWidth || 1; lp.pointerStart.kwpScroll.scrollLeft = lp.pointerStart.kwpLeft - dx / k; lp.suppressClickUntil = Date.now() + 350; event.preventDefault(); return true; }
      // lp:pointermove
      return false;
    },
    pointerdown(event) {
      const kwpScroll = ui.view === 'wallpaper-picker' ? event.target.closest('.kwp-scroll') : null;
      if (kwpScroll) { lp.pointerStart.kwpScroll = kwpScroll; lp.pointerStart.kwpLeft = kwpScroll.scrollLeft; }
      const kwpLong = ui.view === 'wallpaper-picker' && !ui.wp?.checked?.length ? event.target.closest('[data-kwp-long]') : null;
      if (kwpLong) lp.homeLongPressTimer = setTimeout(() => { ui.wp.checked = [kwpLong.dataset.id]; lp.pointerStart = null; suppressReleaseClick(); wallpaperPickerRender(); }, holdDelay(550));
      // lp:pointerdown
      return false;
    },
    back() {
      if (ui.view === 'wallpaper-picker' && ui.wp?.checked?.length) { ui.wp.checked = []; wallpaperPickerRender(); return true; }
      // lp:back
      return false;
    },
    render() {
      return KKWallpaperPicker.render(wallpaperPickerContext());
      // lp:render
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'open-wallpapers': ui.overlay = ''; ui.overview = false; ui.wp = {selected: '', temp: [], checked: [], stripHidden: false}; ui.view = 'wallpaper-picker'; render(); break;
        // Launcher3 WallpaperPickerActivity: tiles preview, the action bar sets, a long press on a picked or saved image
        // starts the delete CAB, Pick image goes through DocumentsUI.
        case 'kwp-tile': {
          const wp = ui.wp ||= {selected: '', temp: [], checked: []};
          if (wp.checked?.length) { if (button.dataset.kwpLong) { wp.checked = wp.checked.includes(id) ? wp.checked.filter(k => k !== id) : [...wp.checked, id]; wallpaperPickerRender(); } break; }
          wp.selected = id; wp.stripHidden = false; wallpaperPickerRender(); break;
        }
        case 'kwp-tap': if (ui.wp) { ui.wp.stripHidden = !ui.wp.stripHidden; viewport.querySelector('.kwp-strip')?.classList.toggle('hidden', ui.wp.stripHidden); } break;
        case 'kwp-pick': lp.docPick('wallpaper', 'image/*'); break;
        case 'kwp-cab-done': if (ui.wp) { ui.wp.checked = []; wallpaperPickerRender(); } break;
        case 'kwp-delete': { const wp = ui.wp, gone = new Set((wp?.checked || []).map(k => Number(k.slice(6)))); if (!wp) break; lp.data.kkSavedWallpapers = (lp.data.kkSavedWallpapers || []).filter(x => !gone.has(x)); wp.temp = (wp.temp || []).filter(x => !gone.has(x)); if (wp.checked.includes(wp.selected)) wp.selected = ''; wp.checked = []; save(); wallpaperPickerRender(); break; }
        case 'kwp-set': {
          const key = ui.wp?.selected || '';
          if (key === 'default' || key.startsWith('wp:')) { lp.data.wallpaper = key === 'default' ? 0 : Number(key.slice(3)); delete lp.data.customWallpaper; delete lp.data.customWallpaperPhoto; save(); }
          else if (key.startsWith('photo:')) { const photo = lp.data.photos.find(p => p.id === Number(key.slice(6))); if (photo) { lp.data.kkSavedWallpapers = [photo.id, ...(lp.data.kkSavedWallpapers || []).filter(x => x !== photo.id)]; galleryWallpaper(photo, true); } }
          ui.wp = null; home(false); break;
        }
        case 'wallpaper': lp.data.wallpaper = Number(id); delete lp.data.customWallpaper; delete lp.data.customWallpaperPhoto; save(); if (ui.view === 'wallpaper-picker') home(false); else render(); toast('Wallpaper set'); break;
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
