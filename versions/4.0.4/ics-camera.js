/* Camera (IMM76I Camera.apk), moved out of simulator.js (docs/plans/engine-migration.md). media.js draws the camera, its
   settings knobs and dialogs (drawn by ics-gallery.js with the Gallery's), ics-pano.js the panorama sweep; this module is
   the app around them:
   - the shutter: a photo into the Camera album, or in video mode recording (VideoCamera; the time runs on screen) and in
     panorama mode the sweep (PanoramaActivity), each kept as a clip or panorama named as the image names them
   - leaving the camera while recording stops and keeps the clip; YouTube's Record (VIDEO_CAPTURE with quickCapture)
     returns to YouTube at once with the clip, Back before recording returns without one. */
(() => {
  'use strict';
  let panoCtl = null, recTimer = 0;

  // A clip or panorama into the Camera album, named as VideoCamera / PanoramaActivity name them.
  function cameraSave(c, clip) {
    const {data, save} = c;
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const photo = {...ICSMedia.scene(data), id: Date.now(), name: `${clip.pano ? 'PANO' : 'VID'}_${stamp.slice(0, 8)}_${stamp.slice(8)}`, album: 'camera', created: Date.now(), ...(clip.pano ? {pano: true} : {video: true, duration: Math.max(1000, Math.round(clip.duration))})};
    data.photos.unshift(photo); save(); return photo;
  }
  // A clip recorded for YouTube's Record (quickCapture) returns to it at once.
  function cameraStop(c) {
    const {ui, openApp} = c;
    const rec = ui.cameraRec; ui.cameraRec = null; clearInterval(recTimer); if (!rec) return;
    const clip = cameraSave(c, {duration: Date.now() - rec.start});
    if (ui.captureFor === 'youtube' && ui.view === 'camera') { openApp('youtube', true); ICSGoogleApps.captured(clip, c.googleAppsContext()); }
  }

  ICS.register('camera', {
    render(c) { const {data, ui, i18n} = c; return ICSMedia.camera(data,ui,key=>i18n.t(key)); },
    /* After every draw: VideoCamera and PanoramaActivity (media.js, ics-pano.js): a controller per screen, rebuilt when its
       root is redrawn. Leaving the camera while recording stops and keeps the clip. */
    rendered(c) {
      const {ui, viewport, render} = c;
      if (ui.cameraRec && ui.view !== 'camera') cameraStop(c);
      if (ui.view !== 'camera') ui.captureFor = '';
      if (panoCtl && !viewport.querySelector('[data-icp]')?.isSameNode(panoCtl.root)) { panoCtl.destroy(); panoCtl = null; }
      const icp = viewport.querySelector('[data-icp]');
      if (icp && !panoCtl) panoCtl = {...ICSPano.attach(icp, {ui, rerender: render, shoot: clip => cameraSave(c, clip)}), root: icp};
      clearInterval(recTimer);
      if (ui.cameraRec && ui.view === 'camera') { const paint = () => { const el = c.viewport.querySelector('[data-camera-rec]'); if (el) el.textContent = ICSMovie.time(Date.now() - ui.cameraRec.start); }; paint(); recTimer = setInterval(paint, 250); }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, openApp, screen, viewport} = c, {id} = button.dataset;
      switch (action) {
        case 'shoot': {
          // Video: the shutter starts and stops recording; Panorama: it starts and stops the sweep.
          if (ui.cameraMode === 'video') { if (ui.cameraRec) cameraStop(c); else ui.cameraRec = {start: Date.now()}; render(); break; }
          if (ui.cameraMode === 'panorama') { panoCtl?.toggle(); break; }
          const photo={...ICSMedia.scene(data),id:Date.now(),name:`IMG_${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`,album:'camera',created:Date.now()};
          data.photos.unshift(photo);save();render();screen.animate([{opacity:1},{opacity:.4},{opacity:1}],{duration:240});toast('Photo saved to Gallery');break;
        }
        case 'camera-review': {const photo=ICSMedia.photos(data,'camera')[0];openApp('gallery');if(photo){ui.galleryAlbum='camera';ui.selectedPhoto=photo.id;ui.sub='photo';render();}break;}
        case 'camera-focus': {const preview=viewport.querySelector('.camera-focus-area');preview.classList.remove('focusing');void preview.offsetWidth;preview.classList.add('focusing');break;}
        case 'camera-flip': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.front=!data.cameraSettings.front;save();render();break;
        case 'camera-level': ui.cameraLevel2=!ui.cameraLevel2;render();break;
        case 'camera-modes': ui.cameraModes=!ui.cameraModes;render();break;
        case 'camera-mode': ui.cameraModes=false;ui.cameraLevel2=false;if(['camera','video','panorama'].includes(id)&&!ui.cameraRec){ui.cameraMode=id;ui.icsPano=null;}render();break;
        case 'camera-setting': ui.cameraSetting=id;ui.overlay='camera-setting';renderOverlay();break;
        case 'camera-pick': {data.cameraSettings=ICSMedia.settings(data);const key=ui.cameraSetting;data.cameraSettings[key]=key==='exposure'?Number(id):id;save();ui.overlay='';renderOverlay();render();break;}
        case 'camera-knob': {data.cameraSettings=ICSMedia.settings(data);const [key,step]=id.split(':'),values=ICSMedia.PREF[key].values,i=values.indexOf(data.cameraSettings[key]);data.cameraSettings[key]=values[Math.max(0,Math.min(values.length-1,i+Number(step)))];save();renderOverlay();break;}
        case 'camera-location': data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.location=!data.cameraSettings.location;save();renderOverlay();break;
        default: return false;
      }
      return true;
    },
    // The zoom slider: the preview follows it.
    input(event, c) {
      const {data, save, viewport} = c;
      if(event.target.matches('.camera-zoom input')) {
        data.cameraSettings=ICSMedia.settings(data);data.cameraSettings.zoom=Number(event.target.value);save();
        viewport.querySelector('.camera-focus-area .media-photo').src=ICSMedia.image(ICSMedia.scene(data));
        return true;
      }
    },
    back(c) {
      const {ui, render, openApp} = c;
      if (ui.overlay) return false;
      // YouTube's capture: Back before recording returns to it without a clip (RESULT_CANCELED).
      if (ui.view === 'camera' && ui.captureFor && !ui.cameraRec && !ui.overlay) { openApp(ui.captureFor, true); return true; }
      if (ui.view === 'camera' && ui.cameraRec && !ui.overlay) { cameraStop(c); render(); return true; }
      if (ui.view === 'camera' && ui.icsPano?.state === 'capture' && !ui.overlay) { ui.icsPano = null; render(); return true; }
      return false;
    },
    clearData(c) { delete c.data.cameraSettings; }
  });
})();
