/* TODO */
'use strict';
LP.define('camera', ({
  clone, i18n, openApp, overlayRoot, reducedMotion, render, renderOverlay, save, screen, toast, ui, viewport
}, lp) => {
  function renderCamera() { return LPCamera.render(lp.data, ui, key => i18n.t(key), ICSMedia, i18n.locale(), i18n.language); }
  // JB Camera callbacks: a capture adds a local illustration to the Camera album; the filmstrip opens Gallery.
  // A picture, with clip = {duration} a video (VID_..., its first frame), with clip = {pano} a panorama (PANO_...),
  // with clip = {sphere: frames} a photo sphere (PANO_... too), into the Camera album.
  function cameraShoot(clip) {
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const photo = {...ICSMedia.scene(lp.data), id: Date.now(), name: clip?.pano || clip?.sphere ? `PANO_${stamp.slice(0, 8)}_${stamp.slice(8)}` : clip ? `VID_${stamp.slice(0, 8)}_${stamp.slice(8)}` : `IMG_${stamp}`, album: 'camera', created: Date.now(), ...(clip?.refocus ? {refocus: {focus: [.5, .5], strength: .6}} : clip?.sphere ? {sphere: true, frames: clip.sphere} : clip?.pano ? {pano: true} : clip ? {video: true, duration: Math.max(1000, Math.round(clip.duration))} : {})};
    // An IMAGE_CAPTURE request keeps the picture for its review (lp-camera.js) and hands it to the caller, not the camera roll.
    if (ui.camIntent && !clip) { ui.camIntent.taken = photo; return photo; }
    lp.data.photos.unshift(photo); save(); return photo;
  }
  // An IMAGE_CAPTURE request open in the Camera: Done hands the picture back, Cancel or Back returns without one, Retake
  // goes back to the shutter.
  function cameraIntent(done, cancel) {
    const intent = {type: 'image', taken: null, done: () => { const photo = intent.taken; ui.camIntent = null; done(photo); }, cancel: () => { ui.camIntent = null; cancel(); }};
    return intent;
  }
  // Hangouts' Take photo: the picture joins the conversation's draft as its attachment.
  function hangoutsTakePhoto() {
    const ret = {sub: ui.sub, thread: ui.thread};
    ui.overlay = ''; renderOverlay(); openApp('camera'); ui.jbcamModule = 'photo';
    const back = () => { openApp('hangouts'); Object.assign(ui, ret); };
    ui.camIntent = cameraIntent(photo => { back(); const d = lp.messageDraft(); d.attachment = clone(photo); d.updated = Date.now(); save(); render(); lp.scrollMessages(); }, () => { back(); render(); lp.scrollMessages(); });
    render();
  }
  // Camera review: LMY48Y has no Gallery, so the picture opens in the Photos viewer.
  function cameraGallery(id) {
    const photo = lp.data.photos.find(item => item.id === id) || ICSMedia.photos(lp.data, 'camera')[0];
    openApp('photos'); if (!photo) return;
    const index = PhotosApp.list(lp.photosContext()).findIndex(item => item.id === photo.id);
    if (index >= 0) { ui.photosIndex = index; ui.sub = 'photo'; render(); }
  }
  Object.assign(lp, {cameraShoot, hangoutsTakePhoto});
  // lp:code
  return {
    // lp:hooks
    overlay(name, root) {
      if (ui.overlay.startsWith('gallery-') || ui.overlay.startsWith('camera-')) {
        overlayRoot.innerHTML=ICSMedia.overlay(lp.data,ui,key=>i18n.t(key),i18n.locale());
        return true;
      }
      // lp:overlay
      return false;
    },
    // Settings › Apps › Camera › Clear data (clearAppData offers it to the screen of that id).
    clearData() { delete lp.data.cameraSettings; },
    back() {
      if (ui.view === 'camera' && LPCamera.back(ui)) { render(); return true; }
      if (ui.view === 'camera' && (ui.gcamModes || ui.gcamOptions)) { ui.gcamModes = false; ui.gcamOptions = false; ui.gcamExposure = false; render(); return true; }
      // lp:back
      return false;
    },
    backIntent() {
      if (ui.view === 'camera' && ui.camIntent && !ui.overlay) { ui.camIntent.cancel(); return true; }
      // lp:backIntent
      return false;
    },
    opening(app, resume) {
      if (app === 'camera' && !resume) { ui.gcsPage = ''; ui.gcsDialog = ''; ui.gcamExposure = false; }
      // lp:opening
      return false;
    },
    render() {
      return renderCamera();
      // lp:render
    },
    afterRender() {
      if (ui.jbcam && !viewport.querySelector('[data-gcam]')?.isSameNode(ui.jbcam.root)) { ui.jbcam.destroy(); ui.jbcam = null; }
      const camRoot = viewport.querySelector('[data-gcam]');
      if (camRoot && !ui.jbcam) ui.jbcam = {...LPCamera.attach(camRoot, {data: lp.data, ui, t: key => i18n.t(key), media: ICSMedia, save, render, shoot: cameraShoot, gallery: cameraGallery, toast, reduced: !!reducedMotion?.matches}), root: camRoot};
      // lp:afterRender
      return false;
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      switch (action) {
        case 'cam-review-done': ui.camIntent?.taken && ui.camIntent.done(); break;
        case 'cam-review-retake': if (ui.camIntent) { ui.camIntent.taken = null; render(); } break;
        case 'cam-review-cancel': ui.camIntent?.cancel(); break;
        case 'shoot': {
          const photo={...ICSMedia.scene(lp.data),id:Date.now(),name:`IMG_${new Date().toISOString().replace(/[-:T]/g,'').slice(0,14)}`,album:'camera',created:Date.now()};
          lp.data.photos.unshift(photo);save();render();screen.animate([{opacity:1},{opacity:.4},{opacity:1}],{duration:240});toast('Photo saved to Gallery');break;
        }
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
