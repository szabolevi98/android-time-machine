/* Photos (Google+ 4.2.3) in the 4.4.4 shell (docs/plans/engine-migration.md): the albums and the viewer
   (photos.js), its swipe, the slideshow, Select, Delete, Download, Share, Settings, search and Back, moved out of
   simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {clone, data, dp, galleryWallpaper, i18n, messageDraft, openApp, overlayRoot, photosContext, printContext, render, renderOverlay, safe, save, suppressReleaseClick, toast, ui, viewport} = c;
    function photosCurrent() { const list = PhotosApp.list(photosContext()); return list[ui.photosIndex] || null; }
    const photosText = key => AndroidStrings.pick(window.StockStrings?.photos?.[key], i18n.locale(), key);
    /* Slideshow (PhotoOneUpFragment's slideshow runnable): full screen, the pager scrolls one page in 600 ms
       (AccelerateDecelerateInterpolator) every 5000 ms, and the last picture ends it with the bars back. A tap ends it. */
    function photosSlideshowStop() { clearTimeout(ui.photosSlideTimer); ui.photosSlideTimer = null; ui.photosSlideshow = false; }
    function photosSlideshowStep() {
      if (!ui.photosSlideshow || ui.view !== 'photos' || ui.sub !== 'photo') { photosSlideshowStop(); return; }
      const list = PhotosApp.list(photosContext());
      if (ui.photosIndex >= list.length - 1) { photosSlideshowStop(); ui.photosChrome = true; render(); return; }
      ui.photosIndex += 1; ui.selectedPhoto = list[ui.photosIndex].id; render();
      viewport.querySelector('.ph-viewer > img')?.classList.add('ph-slide-in');
      ui.photosSlideTimer = setTimeout(photosSlideshowStep, 5000);
    }
    /* Download (DownloadManager.addCompletedDownload): "Downloading image…", then a copy in the Download folder named
       after download_file_name_format ('download'_yyyyMMdd_HHmmss), listed in Downloads, and "Download complete." */
    function photosDownload(photo) {
      toast(photosText('Downloading image…'));
      setTimeout(() => {
        const now = new Date(), two = n => String(n).padStart(2, '0');
        const name = `download_${now.getFullYear()}${two(now.getMonth() + 1)}${two(now.getDate())}_${two(now.getHours())}${two(now.getMinutes())}${two(now.getSeconds())}`;
        const copy = {...clone(photo), id: Date.now(), name, album: 'download', created: now.getTime()};
        data.photos.push(copy);
        (data.downloads ||= []).unshift({name: `${name}.jpg`, size: 1048576 + (copy.id % 900000), time: now.getTime(), photoId: copy.id});
        save(); if (ui.view === 'photos') render(); toast(photosText('Download complete.'));
      }, 1200);
    }
    function photosShare(photo) { if (!photo) return; ui.overlay = ''; renderOverlay(); openApp('hangouts'); ui.sub = 'new'; messageDraft().attachment = clone(photo); save(); render(); }
    // Swipe between pictures in the viewer; a tap shows or hides the bars.
    function attachPhotosSwipe() {
      const pane = viewport.querySelector('.ph-viewer');
      if (!pane || pane.dataset.swipe) return;
      pane.dataset.swipe = '1';
      let start = null;
      pane.addEventListener('pointerdown', event => { start = {x: event.clientX, y: event.clientY}; });
      pane.addEventListener('pointerup', event => {
        if (!start) return;
        const dx = event.clientX - start.x, dy = event.clientY - start.y; start = null;
        if (Math.abs(dx) < dp(44) || Math.abs(dx) < Math.abs(dy)) return;
        const list = PhotosApp.list(photosContext()), next = ui.photosIndex + (dx < 0 ? 1 : -1);
        if (next < 0 || next >= list.length) return;
        ui.photosIndex = next; ui.selectedPhoto = list[next].id; suppressReleaseClick(); render();
      });
    }
    return {
      render() {
        return PhotosApp.render(photosContext());
      },
      mount(root) {
        if (ui.view === 'photos' && ui.sub === 'photo') attachPhotosSwipe();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        switch (action) {
          case 'photos-set-wallpaper': ui.overlay = ''; openApp('photos'); break;
          // Google+ Photos
          case 'photos-tab': ui.photosTab = id; render(); break;
          case 'photos-folders': ui.sub = 'folders'; render(); break;
          case 'photos-folder': ui.sub = 'folder'; ui.photosFolder = id; render(); break;
          case 'photos-open': { ui.photosList = ['folder', 'search', 'videos'].includes(button.dataset.list) ? button.dataset.list : 'all'; ui.photosReturn = ui.sub; const list = PhotosApp.list(photosContext()); ui.photosIndex = Math.max(0, list.findIndex(photo => String(photo.id) === id)); ui.selectedPhoto = list[ui.photosIndex]?.id; ui.sub = 'photo'; ui.photosChrome = true; render(); break; }
          case 'photos-play': ui.photosVideo = null; ui.sub = 'video'; render(); break;
          case 'photos-toggle-bars': if (ui.photosSlideshow) { photosSlideshowStop(); viewport.querySelectorAll('.ph-slide-out, .ph-slide-in').forEach(el => el.classList.remove('ph-slide-out', 'ph-slide-in')); }
            ui.photosChrome = ui.photosChrome === false; viewport.querySelector('.ph-viewer-view')?.classList.toggle('ph-bare', ui.photosChrome === false); break;
          case 'photos-menu': ui.overlay = 'photos-menu'; renderOverlay(); break;
          case 'photos-share-day': photosShare(data.photos.find(photo => String(photo.id) === id)); break;
          case 'photos-wallpaper': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) galleryWallpaper(photo); break; }
          case 'photos-details': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) toast(`${photo.name}${photo.created ? ' · ' + new Date(photo.created).toLocaleString(i18n.locale()) : ''}`); break; }
          case 'photos-delete': ui.overlay = 'photos-delete'; renderOverlay(); break;
          case 'photos-confirm-delete': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (!photo) break; data.photos = data.photos.filter(item => item.id !== photo.id); save(); const list = PhotosApp.list(photosContext()); if (!list.length) ui.sub = ui.photosReturn || ''; else ui.photosIndex = Math.min(ui.photosIndex, list.length - 1); render(); break; }
          // The home spinner (photo_spinner_*), search, and Edit, which opens the Gallery's editor and comes back here.
          case 'photos-spinner': ui.photosSpinner = !ui.photosSpinner; render(); break;
          case 'photos-view': ui.photosView = id; ui.photosSpinner = false; render(); break;
          case 'photos-search': ui.sub = 'search'; ui.photosQuery = ''; render(); viewport.querySelector('[data-photos-search]')?.focus(); break;
          case 'photos-edit': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (!photo) break; openApp('gallery'); const group = JBGallery.groups(data, 'album', i18n.locale()).find(item => item.items.some(p => p.id === photo.id)); ui.galleryCluster = 'album'; ui.galleryAlbum = group?.key || 'camera'; ui.selectedPhoto = photo.id; ui.sub = 'photo'; ui.galleryFromPhotos = true; render(); viewport.querySelector('[data-jbgal-edit]')?.click(); break; }
          case 'photos-slideshow': ui.overlay = ''; renderOverlay(); photosSlideshowStop(); ui.photosSlideshow = true; ui.photosChrome = false; render(); ui.photosSlideTimer = setTimeout(photosSlideshowStep, 5000); break;
          case 'photos-download': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) photosDownload(photo); break; }
          case 'photos-select': ui.overlay = ''; renderOverlay(); ui.photosSelect = []; ui.photosSpinner = false; render(); break;
          case 'photos-pick': { const n = Number(id), list = ui.photosSelect || []; ui.photosSelect = list.includes(n) ? list.filter(x => x !== n) : [...list, n]; render(); break; }
          case 'photos-select-done': ui.photosSelect = null; render(); break;
          case 'photos-select-share': { const chosen = (ui.photosSelect || []).map(n => data.photos.find(p => p.id === n)).filter(Boolean); if (!chosen.length) break; ui.photosSelect = null; photosShare(chosen[0]); if (chosen.length > 1) { messageDraft().moreAttachments = chosen.slice(1).map(clone); save(); } break; }
          case 'photos-select-delete': ui.overlay = 'photos-delete-many'; renderOverlay(); break;
          case 'photos-select-confirm': { const gone = ui.photosSelect || []; ui.overlay = ''; renderOverlay(); data.photos = data.photos.filter(p => !gone.includes(p.id)); ui.photosSelect = null; save(); render(); break; }
          case 'photos-settings': ui.overlay = ''; renderOverlay(); ui.sub = 'settings'; render(); break;
          case 'photos-settings-backup': ui.sub = 'settings-backup'; render(); break;
          case 'photos-pref': { const prefs = data.photosPrefs ||= {}; prefs[id] = !({...PhotosApp.PREFS, ...prefs})[id]; save(); render(); break; }
          case 'photos-pref-list': ui.photosPrefList = id; ui.overlay = 'photos-pref-list'; renderOverlay(); break;
          case 'photos-pref-pick': (data.photosPrefs ||= {})[ui.photosPrefList] = id; ui.overlay = ''; renderOverlay(); save(); render(); break;
          case 'photos-pref-online': toast(i18n.t('This feature is not part of the simulator.')); break;
          case 'photos-print': { const photo = photosCurrent(); ui.overlay = ''; renderOverlay(); if (photo) PrintSpooler.open(printContext(), {name: photo.name, image: ICSMedia.image(photo)}); break; }
          case 'photos-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
          default: return false;
        }
        return true;
      },
      input(event) {
        if (event.target.matches('[data-photos-search]')) { ui.photosQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-photos-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return true; }
        return false;
      },
      overlay() {
        if (ui.overlay === 'photos-menu') {
          overlayRoot.innerHTML = PhotosApp.menu(photosContext());
        } else if (ui.overlay === 'photos-delete-many') {
          overlayRoot.innerHTML = PhotosApp.deleteDialog(photosContext());
        } else if (ui.overlay === 'photos-pref-list') {
          overlayRoot.innerHTML = PhotosApp.prefDialog(photosContext());
        } else if (ui.overlay === 'photos-delete') {
          overlayRoot.innerHTML = `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t('Delete'))}"><h3>${safe(i18n.t('Delete'))}</h3><p>${safe(i18n.t('Delete this photo?'))}</p><div class="settings-dialog-actions"><button data-action="close-overlay">${safe(i18n.t('Cancel'))}</button><button data-action="photos-confirm-delete">${safe(i18n.t('Delete'))}</button></div></div>`;
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'photos' && ui.photosSpinner) { ui.photosSpinner = false; render(); return true; }
        if (ui.view === 'photos' && ui.sub === 'video') { ui.sub = 'photo'; ui.photosVideo = null; render(); return true; }
        if (ui.view === 'photos' && Array.isArray(ui.photosSelect)) { ui.photosSelect = null; render(); return true; }
        if (ui.view === 'photos' && ui.sub === 'settings-backup') { ui.sub = 'settings'; render(); return true; }
        if (ui.view === 'photos' && ui.sub === 'photo') photosSlideshowStop();
        if (ui.view === 'photos' && ui.sub) { ui.sub = ui.sub === 'photo' ? ui.photosReturn || '' : ui.sub === 'folder' ? 'folders' : ''; ui.photosChrome = true; render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    mount: (c, root) => scope(c).mount(root),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back()
  };
  for (const id of ['photos']) KK.register(id, spec);
})();
