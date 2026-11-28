/* Gallery (IMM76I Gallery2.apk), moved out of simulator.js (docs/plans/engine-migration.md). media.js draws the albums,
   the photo page, the crop screen and the dialogs (also the Camera's), ics-movie.js the MovieActivity; this module is
   the app around them:
   - albums, the photo page (a sideways swipe or the computer's arrow keys move through the album, the slideshow moves
     every 3 s), zoom, rotate, Crop (CropImage saves a cropped copy beside the picture), Delete, Set as wallpaper, Share
     to Messaging, the clips' movie player
   - GET_CONTENT for Email's and Gmail's Attach file: a picked picture goes back to the app that asked; Back returns
     without one. */
(() => {
  'use strict';
  let movieCtl = null;

  function galleryStep(c, direction) {
    const {ui, data, render} = c;
    const items=ICSMedia.photos(data,ui.galleryAlbum); if(!items.length)return;
    const index=Math.max(0,items.findIndex(p=>p.id===ui.selectedPhoto));
    ui.selectedPhoto=items[(index+direction+items.length)%items.length].id;ui.galleryZoom=false;render();
  }

  ICS.register('gallery', {
    scroller: '.gallery-scroll',
    // CropImage's CropView owns its drags: they never reach the screen's swipe and long-press handling.
    init(c) {
      c.screen.addEventListener('pointerdown', event => {
        const {ui} = c;
        if (ui.view !== 'gallery' || !ui.galleryCrop || ui.overlay || (event.pointerType === 'mouse' && event.button !== 0)) return;
        const frame = event.target.closest('.gallery-crop')?.querySelector('[data-crop-frame]');
        if (!frame || event.target.closest('button')) return;
        if (ICSMedia.cropDrag(event, frame, ui.galleryCrop, () => {})) { event.stopPropagation(); event.preventDefault(); }
      }, true);
    },
    open(c) { c.ui.galleryPick = ''; },
    render(c) { const {data, ui, i18n} = c; return ICSMedia.gallery(data,ui,key=>i18n.t(key),i18n.language); },
    // The Gallery's and the Camera's dialogs (media.js).
    overlay(c) {
      const {ui, data, i18n} = c;
      if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) return ICSMedia.overlay(data,ui,key=>i18n.t(key),i18n.locale(),i18n.language);
    },
    // A clip's MovieActivity (ics-movie.js): its controller is rebuilt when its root is redrawn.
    rendered(cx) {
      const {ui, data, viewport, render} = cx;
      if (movieCtl && !viewport.querySelector('[data-icm]')?.isSameNode(movieCtl.root)) { movieCtl.destroy(); movieCtl = null; }
      const icm = viewport.querySelector('[data-icm]'), clip = data.photos.find(p => p.id === ui.selectedPhoto);
      if (icm && clip && !movieCtl) movieCtl = {...ICSMovie.attach(icm, {photo: clip, ui, rerender: render, reduced: matchMedia('(prefers-reduced-motion: reduce)').matches}), root: icm};
    },
    action(action, button, cx) {
      const {ui, data, save, render, renderOverlay, toast, openApp, clone} = cx, {id} = button.dataset;
      switch (action) {
        case 'gallery-camera': openApp('camera'); break;
        case 'gallery-album': ui.galleryAlbum=id; ui.sub='album';ui.gallerySlideshow=false;render();break;
        // GET_CONTENT hands the picture back to whichever app asked: Email or Gmail.
        case 'gallery-pick': { const photo = data.photos.find(p => p.id === Number(id)), caller = ui.galleryPick; ui.galleryPick = ''; ui.sub = ''; openApp(caller, true); if (caller === 'gmail') ICSGmail.attach(cx.gmailContext(), photo); else ICSEmail.attach(cx.emailContext(), photo); render(); break; }
        case 'gallery-pick-cancel': { const caller = ui.galleryPick || 'email'; ui.galleryPick = ''; ui.sub = ''; openApp(caller, true); break; }
        case 'photo': ui.selectedPhoto=Number(id);ui.galleryAlbum=ICSMedia.album(data.photos.find(p=>p.id===Number(id))||{});ui.sub='photo';ui.galleryZoom=false;render();break;
        case 'gallery-step': galleryStep(cx, Number(id));break;
        case 'gallery-photo-zoom': ui.galleryZoom=!ui.galleryZoom;render();break;
        case 'gallery-menu': case 'gallery-share': case 'gallery-details': ui.overlay=action;renderOverlay();break;
        // PhotoPage's Crop starts CropImage; Crop saves <name>-<n>.jpg beside the picture with its title and date
        // (saveLocalImage), and REQUEST_CROP's result shows the new picture. Cancel, Up and Back leave it unsaved.
        case 'gallery-crop': {const photo=data.photos.find(p=>p.id===Number(id));ui.overlay='';if(photo&&!photo.video){ui.selectedPhoto=photo.id;ui.galleryZoom=false;ui.gallerySlideshow=false;ui.galleryCrop=ICSMedia.cropDefault();}render();break;}
        case 'gallery-crop-cancel': ui.galleryCrop=null;render();break;
        case 'gallery-crop-save': {
          const photo=data.photos.find(p=>p.id===ui.selectedPhoto),c=ui.galleryCrop;
          if(!photo||!c){ui.galleryCrop=null;render();break;}
          ui.overlay='gallery-crop-saving';renderOverlay();
          setTimeout(()=>{
            const data=cx.data, copy={...clone(photo),id:Date.now(),album:ICSMedia.album(photo),source:clone(photo),crop:{x:c.x,y:c.y,w:c.w,h:c.h},rotation:0,zoom:1};
            data.photos.splice(Math.max(0,data.photos.indexOf(photo)),0,copy);save();
            ui.selectedPhoto=copy.id;ui.galleryCrop=null;if(ui.overlay==='gallery-crop-saving')ui.overlay='';render();renderOverlay();
          },600);
          break;
        }
        case 'gallery-rotate': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(photo)photo.rotation=((photo.rotation||0)+Number(id)+360)%360;save();ui.overlay='';render();break;}
        case 'gallery-slideshow': {const items=ICSMedia.photos(data,ui.galleryAlbum);if(!items.length)break;if(ui.sub!=='photo')ui.selectedPhoto=items[0].id;ui.sub='photo';ui.overlay='';ui.gallerySlideshow=true;ui.gallerySlideAt=Date.now();render();break;}
        case 'gallery-stop': ui.gallerySlideshow=false;render();break;
        case 'gallery-share-message': {const photo=data.photos.find(p=>p.id===ui.selectedPhoto);if(!photo)break;openApp('messaging');ui.sub='new';cx.messageDraft().attachment=clone(photo);save();render();break;}
        case 'photo-delete': ui.selectedPhoto=Number(id);ui.overlay='gallery-delete';renderOverlay();break;
        case 'gallery-confirm-delete': {
          const items=ICSMedia.photos(data,ui.galleryAlbum);const index=items.findIndex(p=>p.id===ui.selectedPhoto);
          data.photos=data.photos.filter(p=>p.id!==ui.selectedPhoto);save();ui.overlay='';
          const remaining=ICSMedia.photos(data,ui.galleryAlbum);if(remaining.length)ui.selectedPhoto=remaining[Math.min(index,remaining.length-1)].id;else ui.sub='album';
          render();toast('Photo deleted');break;
        }
        case 'photo-wallpaper': {const photo=data.photos.find(p=>p.id===Number(id));if(!photo)break;data.wallpaper=11;delete data.liveWallpaper;data.customWallpaper=photo.colors;data.customWallpaperPhoto=clone(photo);save();ui.overlay='';render();toast('Wallpaper set');break;}
        case 'gallery-movie': ui.sub='movie';ui.galleryMovie=null;render();break;
        default: return false;
      }
      return true;
    },
    back(c) {
      const {ui, render, openApp} = c;
      // The Gallery's picker (GET_CONTENT from Email's Attach file) returns without a picture.
      if (ui.view === 'gallery' && ui.galleryPick && !ui.sub && !ui.overlay) { const caller = ui.galleryPick; ui.galleryPick = ''; openApp(caller, true); return true; }
      if (ui.overlay === 'gallery-crop-saving') return true;
      if (ui.overlay) return false;
      if (ui.view === 'gallery' && ui.galleryCrop) { ui.galleryCrop=null;render();return true; }
      if (ui.view === 'gallery' && ui.gallerySlideshow) { ui.gallerySlideshow=false;render();return true; }
      if (ui.view === 'gallery' && ui.sub === 'movie') { ui.sub='photo';ui.galleryMovie=null;render();return true; }
      if (ui.view === 'gallery' && ui.sub === 'photo') { ui.sub='album';ui.galleryZoom=false;render();return true; }
      return false;
    },
    // The photo page follows a sideways drag and moves to the next or previous picture past 53 dp.
    pointermove(event, p, dx, dy, c) {
      const {ui, screen, viewport, dp} = c;
      if (ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && p.target.closest('[data-gallery-swipe]') && Math.abs(dx)>dp(12) && Math.abs(dx)>Math.abs(dy)) {
        p.gallerySwiping=true;c.suppressClick(350);event.preventDefault();
        try{screen.setPointerCapture(event.pointerId);}catch{}
        const picture=viewport.querySelector('.gallery-image');if(picture)picture.style.transform=`translateX(${dx}px)`;return true;
      }
    },
    pointerup(event, p, dx, dy, c) {
      if (p.gallerySwiping) { if(Math.abs(dx)>c.dp(53))galleryStep(c, dx<0?1:-1);else c.render();c.suppressClick(350);return true; }
    },
    pointercancel(c) { const photo=c.viewport.querySelector('.gallery-image');if(photo)photo.style.transform=''; },
    key(event, c) {
      const {ui} = c;
      if(ui.view==='gallery' && ui.sub==='photo' && !ui.overlay && ['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();galleryStep(c, event.key==='ArrowLeft'?-1:1);return true;}
    },
    // The slideshow's next picture.
    second(c) {
      const {ui} = c;
      if(ui.view==='gallery' && ui.sub==='photo' && ui.gallerySlideshow && !ui.overlay && Date.now()-ui.gallerySlideAt>=3000){ui.gallerySlideAt=Date.now();galleryStep(c, 1);}
    },
    clearData(c) { c.data.photos=c.clone(c.defaults.photos); }
  });
})();
