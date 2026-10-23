/* Offline Camera/Gallery presentation. Scenes are local illustrations, never device captures. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const palettes=[['#96c8d0','#e8ad7a','#364e59'],['#223850','#ce6979','#101d32'],['#67aab6','#f3d3a0','#21617a']];
  const album=photo=>photo.album || (photo.id<=4?'pictures':'camera');
  const photos=(data,key)=>data.photos.filter(p=>!key||album(p)===key);
  function settings(data) { return {flash:'auto',balance:'auto',exposure:0,scene:'auto',location:false,size:'2592x1944',focus:'auto',zoom:1,front:false,...data.cameraSettings}; }
  function scene(data) { const s=settings(data);return {colors:palettes[s.front?1:0],zoom:s.zoom,balance:s.balance,exposure:s.exposure,front:s.front}; }
  // A cropped copy (CropImage's saved picture) keeps its source and the crop as fractions of the source's picture;
  // it draws the source inside its own frame, so later rotations turn the cropped picture.
  function size(photo) {
    const rotation=((Number(photo.rotation)||0)%360+360)%360;
    let width=1024,height=768;
    if(photo.source&&photo.crop){const [w,h]=size(photo.source);width=Math.max(1,Math.round(w*photo.crop.w));height=Math.max(1,Math.round(h*photo.crop.h));}
    return rotation%180?[height,width]:[width,height];
  }
  // A panorama (PANO_*): the scene three times across, the middle one mirrored so the hills meet, one sun.
  function panoImage(photo) {
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]],width=3072,height=768;
    const hills=`<path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/>`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#sky)"/><circle cx="1790" cy="200" r="65" fill="${sun}"/>${hills}<g transform="translate(2048 0) scale(-1 1)">${hills}</g><g transform="translate(2048 0)">${hills}</g></svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  function image(photo) {
    if(photo.pano)return panoImage(photo);
    if(photo.source&&photo.crop){
      const [sw,sh]=size(photo.source),c=photo.crop,rotation=((Number(photo.rotation)||0)%360+360)%360;
      const cw=Math.max(1,Math.round(sw*c.w)),ch=Math.max(1,Math.round(sh*c.h)),[width,height]=size(photo);
      return 'data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) translate(${-cw/2} ${-ch/2})"><svg width="${cw}" height="${ch}" viewBox="${(sw*c.x).toFixed(2)} ${(sh*c.y).toFixed(2)} ${(sw*c.w).toFixed(2)} ${(sh*c.h).toFixed(2)}" preserveAspectRatio="none"><image href="${image(photo.source)}" width="${sw}" height="${sh}"/></svg></g></svg>`);
    }
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]];
    const rotation=((Number(photo.rotation)||0)%360+360)%360,zoom=Math.min(4,Math.max(1,Number(photo.zoom)||1));
    const width=rotation%180?768:1024,height=rotation%180?1024:768;
    const exposure=Math.min(2,Math.max(-2,Number(photo.exposure)||0));
    const tint=photo.balance==='incandescent'?'#7899ff':photo.balance==='cloudy'||photo.balance==='cloudy-daylight'?'#ffbb66':photo.balance==='fluorescent'?'#d8ffe8':photo.balance==='daylight'?'#ffe7a0':null;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="${land}"/><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) scale(${photo.front?-zoom:zoom} ${zoom}) translate(-512 -384)"><rect width="1024" height="768" fill="url(#sky)"/><circle cx="755" cy="200" r="65" fill="${sun}"/><path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/></g>${tint?`<rect width="${width}" height="${height}" fill="${tint}" opacity=".22"/>`:''}${exposure?`<rect width="${width}" height="${height}" fill="${exposure>0?'white':'black'}" opacity="${Math.abs(exposure)*.14}"/>`:''}</svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  const art=photo=>`<img class="media-photo" src="${image(photo)}" alt="${e(photo.name||'')}">`;
  const icon=(action,label,file,id='')=>`<button data-action="${action}" data-id="${e(id)}" aria-label="${e(label)}"><img src="assets/${file}" alt=""></button>`;
  // Gallery2's own strings (stock-strings.js, group gallery): crop_action, crop_label, menu/crop.xml's cancel and
  // crop_save_text, saving_image.
  const G=(key,lang)=>{const row=window.StockStrings?.gallery?.[key];return row ? AndroidStrings.pick(row, lang, key) :key;};
  // CropImage (com.android.gallery3d.app): the overlay action bar titled crop_label with menu/crop.xml's Cancel and Crop
  // (ifRoom|withText), and the CropView: the picture fitted to the view, HighlightRectangle's selection (setInitRectangle:
  // 0.3 either side of the centre on both axes when no aspect is asked for) outlined 3 px #008aff over a #a0000000
  // shade, with camera_crop_holo on the edges' midpoints (all four at rest, only the dragged edges while resizing, none
  // while the box moves).
  const CROP={hit:30/2*.85,min:16/2*.85};
  const cropDefault=()=>({x:.2,y:.2,w:.6,h:.6});
  function crop(data,ui,t,lang) {
    const photo=data.photos.find(p=>p.id===ui.selectedPhoto),c=ui.galleryCrop,[w,h]=size(photo),pct=n=>`${(n*100).toFixed(3)}%`;
    return `<div class="app-view gallery-app gallery-crop"><header class="gallery-header">${icon('gallery-crop-cancel','Navigate up','gallery.png')}<h2>${e(G('Crop picture',lang))}</h2><button class="gallery-pick-cancel" data-action="gallery-crop-cancel">${e(G('Cancel',lang))}</button><button class="gallery-pick-cancel" data-action="gallery-crop-save">${e(G('Crop save',lang))}</button></header><div class="gallery-crop-stage"><div class="gallery-crop-frame" data-crop-frame style="--ar:${(w/h).toFixed(5)}"><img src="${image(photo)}" alt="${e(photo.name||'')}"><div class="gallery-crop-hl" data-crop-hl style="left:${pct(c.x)};top:${pct(c.y)};width:${pct(c.w)};height:${pct(c.h)}"><i class="l"></i><i class="r"></i><i class="t"></i><i class="b"></i></div></div></div></div>`;
  }
  // HighlightRectangle.setMovingEdges / moveEdges: within 30 px of an edge drags that edge (the nearer one when both
  // sides are close), inside drags the box; edges keep 16 px apart and everything stays on the picture.
  function cropDrag(event,frame,c,done) {
    const box=frame.getBoundingClientRect(),hl=frame.querySelector('[data-crop-hl]');
    if(!box.width||!hl)return false;
    const W=box.width,H=box.height,x=event.clientX-box.left,y=event.clientY-box.top,tol=CROP.hit;
    const r={l:c.x*W,t:c.y*H,r:(c.x+c.w)*W,b:(c.y+c.h)*H};
    if(!(r.l-tol<=x&&x<=r.r+tol&&r.t-tol<=y&&y<=r.b+tol))return false;
    const edge={l:Math.abs(x-r.l)<=tol,r:Math.abs(x-r.r)<=tol,t:Math.abs(y-r.t)<=tol,b:Math.abs(y-r.b)<=tol};
    if(edge.l&&edge.r){if(Math.abs(x-r.l)<Math.abs(x-r.r))edge.r=false;else edge.l=false;}
    if(edge.t&&edge.b){if(Math.abs(y-r.t)<Math.abs(y-r.b))edge.b=false;else edge.t=false;}
    const edges=Object.keys(edge).filter(k=>edge[k]),inside=x>=r.l&&x<=r.r&&y>=r.t&&y<=r.b;
    if(!edges.length&&!inside)return false;
    const start={...r},clamp=(v,lo,hi)=>Math.min(hi,Math.max(lo,v)),min=CROP.min;
    hl.classList.add(edges.length?'resizing':'moving',...edges);
    const onMove=ev=>{
      const dx=ev.clientX-event.clientX,dy=ev.clientY-event.clientY,n={...start};
      if(!edges.length){const mx=clamp(dx,-start.l,W-start.r),my=clamp(dy,-start.t,H-start.b);n.l+=mx;n.r+=mx;n.t+=my;n.b+=my;}
      else{if(edge.l)n.l=clamp(start.l+dx,0,start.r-min);if(edge.r)n.r=clamp(start.r+dx,start.l+min,W);if(edge.t)n.t=clamp(start.t+dy,0,start.b-min);if(edge.b)n.b=clamp(start.b+dy,start.t+min,H);}
      c.x=n.l/W;c.y=n.t/H;c.w=(n.r-n.l)/W;c.h=(n.b-n.t)/H;
      Object.assign(hl.style,{left:`${c.x*100}%`,top:`${c.y*100}%`,width:`${c.w*100}%`,height:`${c.h*100}%`});
    };
    const onUp=()=>{window.removeEventListener('pointermove',onMove);window.removeEventListener('pointerup',onUp);window.removeEventListener('pointercancel',onUp);hl.className='gallery-crop-hl';done();};
    window.addEventListener('pointermove',onMove);window.addEventListener('pointerup',onUp);window.addEventListener('pointercancel',onUp);
    return true;
  }
  function gallery(data,ui,t,lang) {
    if(ui.sub==='photo'&&ui.galleryCrop&&data.photos.some(p=>p.id===ui.selectedPhoto))return crop(data,ui,t,lang);
    const photo=data.photos.find(p=>p.id===ui.selectedPhoto),inPhoto=ui.sub==='photo',inAlbum=ui.sub==='album';
    const items=photos(data,ui.galleryAlbum),title=inPhoto?photo?.name||t('Photo unavailable'):inAlbum?t(ui.galleryAlbum==='camera'?'Camera':'Pictures'):t('Albums');
    // GET_CONTENT (Email's Attach file): AlbumSetPage titles the picker select_image and shows menu/pickup.xml's Cancel.
    if(ui.galleryPick&&!inPhoto)return `<div class="app-view gallery-app">${`<header class="gallery-header">${icon('back','Back','gallery.png')}<h2>${e(inAlbum?title:t('Select photo'))}</h2><button class="gallery-pick-cancel" data-action="gallery-pick-cancel">${e(t('Cancel'))}</button></header>`}<div class="gallery-scroll ${inAlbum?'gallery-photo-grid':'gallery-albums'}">${inAlbum?items.map(p=>`<button data-action="gallery-pick" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join(''):['camera','pictures'].map(key=>{const group=photos(data,key);return group.length?`<button class="gallery-album" data-action="gallery-album" data-id="${key}">${art(group[0])}<span><img src="assets/gallery-frame_overlay_gallery_${key==='camera'?'camera':'folder'}.png" alt="">${e(t(key==='camera'?'Camera':'Pictures'))}<small>${group.length}</small></span></button>`:'';}).join('')}</div></div>`;
    const header=`<header class="gallery-header">${icon('back','Back','gallery.png')}<h2>${e(title)}</h2>${inPhoto?icon('gallery-share','Share','gallery-ic_menu_share_holo_light.png'):!inAlbum?icon('gallery-camera','Camera','gallery-ic_menu_camera_holo_light.png'):icon('gallery-slideshow','Slideshow','gallery-ic_menu_slideshow_holo_light.png')}${(inPhoto||inAlbum)?icon('gallery-menu','More options','ic_menu_overflow.png'):''}</header>`;
    if(ui.sub==='movie'&&photo?.video&&window.ICSMovie)return ICSMovie.render(photo,{ui,t,art:art(photo),header:`<header class="gallery-header icm-bar">${icon('back','Back','gallery.png')}<h2>${e(photo.name)}</h2>${icon('gallery-share','Share','gallery-ic_menu_share_holo_light.png')}</header>`});
    if(inPhoto && photo)return `<div class="app-view gallery-app ${ui.gallerySlideshow?'gallery-slideshow':''}">${header}<div class="gallery-stage" data-gallery-swipe><button data-action="gallery-photo-zoom" class="gallery-image ${ui.galleryZoom?'zoomed':''}" aria-label="Zoom">${art(photo)}</button>${window.ICSMovie?ICSMovie.play(photo,t('Play video')):''}<button class="gallery-previous" data-action="gallery-step" data-id="-1" aria-label="Previous photo">‹</button><button class="gallery-next" data-action="gallery-step" data-id="1" aria-label="Next photo">›</button>${ui.gallerySlideshow?'<button class="gallery-stop" data-action="gallery-stop">Stop slideshow</button>':''}</div><div class="gallery-filmstrip">${items.map(p=>`<button class="${p.id===photo.id?'selected':''}" data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}</button>`).join('')}</div></div>`;
    if(inAlbum)return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-photo-grid">${items.map(p=>`<button data-action="photo" data-id="${p.id}" aria-label="${e(p.name)}">${art(p)}${window.ICSMovie?ICSMovie.slot(p):''}</button>`).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
    return `<div class="app-view gallery-app">${header}<div class="gallery-scroll gallery-albums">${['camera','pictures'].map(key=>{const group=photos(data,key);return group.length?`<button class="gallery-album" data-action="gallery-album" data-id="${key}">${art(group[0])}<span><img src="assets/gallery-frame_overlay_gallery_${key==='camera'?'camera':'folder'}.png" alt="">${e(t(key==='camera'?'Camera':'Pictures'))}<small>${group.length}</small></span></button>`:'';}).join('')||'<p class="empty-note">No photos</p>'}</div></div>`;
  }
  /* Camera (CameraGoogle 4.0.4), portrait camera.xml: preview_frame.xml (the preview, focus_indicator's 120 dp ring,
     indicator_bar.xml's 48 dp bar along its bottom) over camera_control.xml's 76 dp bg_camera_pattern panel (mode_picker's
     55 dp current mode with the video / camera / panorama icons, the shutter, the 52 dp review thumbnail). The first-level
     bar (IndicatorControlBar.initialize) has the settings icon, the ZoomControlBar (ic_zoom_out, ic_zoom_big_dark, the
     ic_zoom_slider knob, ic_zoom_in) and the camera picker (ic_switch_photo_facing_holo_light); the settings icon opens the
     second level on indicator_background #40000000: btn_close_settings, then Camera.initializeIndicatorControl's keys
     (flash, white balance, exposure, scene mode, each IconListPreference's icon) and ic_menu_overflow for the other
     settings (store location, picture size, focus mode). camera_preferences.xml's titles, entries and icons.
     The mode picker switches to VideoCamera (video_camera.xml: the same panels, btn_video_shutter_holo, red
     btn_video_shutter_recording_holo while recording, ic_recording_indicator with the white elapsed time
     (recording_time_elapsed_text) on the preview, the video-facing switch) and to PanoramaActivity (ics-pano.js, without
     the indicator bar, btn_pan_shutter_holo / btn_pan_shutter_recording_holo). The current mode's icon is the bright one. */
  const CS=(key,lang)=>{const row=window.StockStrings?.camera?.[key];return row ? AndroidStrings.pick(row, lang||window.AndroidI18n?.language, key) :key;};
  const PREF={
    flash:{title:'pref_camera_flashmode_title',values:['auto','on','off'],entries:['flashmode_entry_auto','flashmode_entry_on','flashmode_entry_off'],icons:['ic_flash_auto_holo_light','ic_flash_on_holo_light','ic_flash_off_holo_light']},
    balance:{title:'pref_camera_whitebalance_title',values:['auto','incandescent','daylight','fluorescent','cloudy-daylight'],entries:['whitebalance_entry_auto','whitebalance_entry_incandescent','whitebalance_entry_daylight','whitebalance_entry_fluorescent','whitebalance_entry_cloudy'],icons:['ic_white_balance_auto_holo_light','ic_white_balance_incandescent_holo_light','ic_white_balance_sunlight_holo_light','ic_white_balance_fluorescent_holo_light','ic_white_balance_cloudy_holo_light']},
    exposure:{title:'pref_exposure_title',values:[2,1,0,-1,-2],icon:'ic_exposure_holo_light'},
    scene:{title:'pref_camera_scenemode_title',values:['auto','action','night','sunset','party'],entries:['scenemode_entry_auto','scenemode_entry_action','scenemode_entry_night','scenemode_entry_sunset','scenemode_entry_party'],icon:'ic_scn_holo_light'},
    size:{title:'pref_camera_picturesize_title',values:['2592x1944','2048x1536','1600x1200','1280x960','1024x768','640x480','320x240'],entries:['picturesize_entry_2592x1936','picturesize_entry_2048x1536','picturesize_entry_1600x1200','picturesize_entry_1280x960','picturesize_entry_1024x768','picturesize_entry_640x480','picturesize_entry_320x240']},
    focus:{title:'pref_camera_focusmode_title',values:['auto','infinity','macro'],entries:['focusmode_entry_auto','focusmode_entry_infinity','focusmode_entry_macro']}
  };
  const entry=(key,value)=>{const p=PREF[key],i=p.values.indexOf(value);return p.entries?CS('pref_camera_'+p.entries[Math.max(0,i)]):(value>0?'+':'')+value;};
  const prefIcon=(key,value)=>{const p=PREF[key];return p.icons?p.icons[Math.max(0,p.values.indexOf(value))]:p.icon;};
  function camera(data,ui,t) {
    const s=settings(data),last=photos(data,'camera')[0],mode=ui.cameraMode||'camera',rec=mode==='video'&&ui.cameraRec;
    const btn=(action,label,src,id='')=>`<button class="camera-ind" data-action="${action}" data-id="${e(id)}" aria-label="${e(label)}"><img src="assets/camera-${src}.png" alt=""></button>`;
    const bar=ui.cameraLevel2
      ?`<div class="camera-bar camera-bar2">${btn('camera-level','Close setting controls','btn_close_settings')}<i class="camera-bar-divider"></i>${['flash','balance','exposure','scene'].map(key=>btn('camera-setting',CS(PREF[key].title),prefIcon(key,s[key]),key)).join('')}${btn('camera-setting','Camera settings','ic_menu_overflow','other')}</div>`
      :`<div class="camera-bar">${btn('camera-level','More setting controls','ic_settings_holo_light')}<label class="camera-zoom"><img src="assets/camera-ic_zoom_out_holo_light.png" alt=""><input type="range" min="1" max="4" step=".1" value="${s.zoom}" aria-label="Zoom control"><img src="assets/camera-ic_zoom_in_holo_light.png" alt=""></label>${btn('camera-flip','Front and back camera switch',mode==='video'?'ic_switch_video_facing_holo_light':'ic_switch_photo_facing_holo_light')}</div>`;
    const modes=ui.cameraModes?`<div class="camera-mode-selection">${[['camera','switch_to_camera_label','ic_switch_camera_holo_light'],['video','switch_to_video_label','ic_switch_video_holo_light'],['panorama','switch_to_panorama_label','ic_switch_pan_holo_light']].map(([id,label,src])=>`<button data-action="camera-mode" data-id="${id}" aria-label="${e(CS(label))}"><img src="assets/camera-${src}.png" alt=""></button>`).join('')}</div>`:'';
    const pano=mode==='panorama'&&window.ICSPano,review=pano&&ui.icsPano?.state==='review';
    const timer=rec?`<div class="camera-rec"><img src="assets/camera-ic_recording_indicator.png" alt=""><span data-camera-rec>00:00</span></div>`:'';
    const preview=pano?ICSPano.render(data,ui,CS,{image,scene}):`<button class="camera-focus-area" data-action="camera-focus" aria-label="Focus">${art(scene(data))}<span class="camera-focus-ring"></span></button>${timer}${bar}`;
    const on=id=>mode===id?' on':'';
    return `<div class="app-view camera-app camera-${mode}${review?' camera-review':''}"><div class="camera-preview">${preview}</div><div class="camera-bottom"><button class="camera-mode" data-action="camera-modes" aria-label="Camera, video, or panorama selector"${rec?' disabled':''}><img class="m0${on('video')}" src="assets/camera-ic_switch_video_holo_light.png" alt=""><img class="m1${on('camera')}" src="assets/camera-ic_switch_camera_holo_light.png" alt=""><img class="m2${on('panorama')}" src="assets/camera-ic_switch_pan_holo_light.png" alt=""></button>${modes}<button class="camera-shutter${mode==='camera'?'':' '+mode}${rec||(pano&&ui.icsPano?.state==='capture')?' recording':''}" data-action="shoot" aria-label="Shutter button"></button>${last?`<button class="camera-thumbnail" data-action="camera-review" aria-label="Most recent photo">${art(last)}</button>`:''}</div></div>`;
  }
  // BasicSettingPopup (basic_setting_popup.xml: the 22 dp #33b5e5 title over a 2 dp rule, setting_item.xml rows of 50 dp
  // with the 18 sp entry and its 28 dp icon) and OtherSettingsPopup (in-line rows: the store location switch, the
  // picture size and focus mode knobs), above the indicator bar.
  function cameraPopup(data,ui) {
    const s=settings(data),key=ui.cameraSetting;
    const shell=(title,body,wide)=>`<div class="camera-popup-scrim" data-action="close-overlay"></div><div class="camera-popup${wide?' wide':''}" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3><div class="camera-popup-list">${body}</div></div>`;
    if(key==='other'){
      const knob=k=>{const p=PREF[k],i=p.values.indexOf(s[k]);return `<div class="camera-row"><span>${e(CS(p.title))}</span><button class="camera-knob" data-action="camera-knob" data-id="${k}:-1" ${i<=0?'disabled':''}>&lt;</button><b>${e(entry(k,s[k]))}</b><button class="camera-knob" data-action="camera-knob" data-id="${k}:1" ${i>=p.values.length-1?'disabled':''}>&gt;</button></div>`;};
      return shell(CS('pref_camera_settings_category'),`<button class="camera-row" data-action="camera-location" role="switch" aria-checked="${s.location}"><span>${e(CS('pref_camera_recordlocation_title'))}</span><i class="camera-switch${s.location?' on':''}"></i></button>${knob('size')}${knob('focus')}`,true);
    }
    const p=PREF[key];if(!p)return '';
    return shell(CS(p.title),p.values.map(v=>`<button class="camera-row${String(v)===String(s[key])?' on':''}" data-action="camera-pick" data-id="${e(v)}" role="radio" aria-checked="${String(v)===String(s[key])}"><span>${e(entry(key,v))}</span>${p.icons?`<img src="assets/camera-${prefIcon(key,v)}.png" alt="">`:''}</button>`).join(''));
  }
  function overlay(data,ui,t,locale,lang) {
    const p=data.photos.find(p=>p.id===ui.selectedPhoto),s=settings(data);
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu media-menu">${body}</div>`;
    const item=(action,label,id='')=>`<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if(ui.overlay==='gallery-menu')return menu(ui.sub==='photo'?item('gallery-slideshow','Slideshow')+item('gallery-rotate','Rotate left','-90')+item('gallery-rotate','Rotate right','90')+(p&&!p.video?`<button data-action="gallery-crop" data-id="${p.id}">${e(G('Crop',lang))}</button>`:'')+item('gallery-details','Details')+item('photo-wallpaper','Set wallpaper',p?.id)+item('photo-delete','Delete',p?.id):item('gallery-slideshow','Slideshow'));
    if(ui.overlay==='gallery-crop-saving')return `<div class="ga-scrim"></div><div class="ga-dialog ga-alert" role="alertdialog" aria-label="${e(G('Saving picture…',lang))}"><div class="ga-progress"><span class="ga-spinner" aria-hidden="true"><img src="assets/ga-spinner_48_outer_holo.png" alt=""><img src="assets/ga-spinner_48_inner_holo.png" alt=""></span><span>${e(G('Saving picture…',lang))}</span></div></div>`;
    if(ui.overlay==='gallery-share')return menu(item('gallery-share-message','Messaging'));
    if(ui.overlay==='camera-setting')return cameraPopup(data,ui);
    if(ui.overlay==='gallery-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="Delete photo?"><h3>Delete photo?</h3><p>${e(p?.name)}</p><div class="settings-dialog-actions">${item('close-overlay','Cancel')}${item('gallery-confirm-delete','Delete')}</div></div>`;
    if(ui.overlay==='gallery-details')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog media-details" role="dialog" aria-label="Details"><h3>Details</h3><dl><dt>Name</dt><dd>${e(p?.name)}</dd><dt>Album</dt><dd>${e(t(album(p||{})==='camera'?'Camera':'Pictures'))}</dd><dt>Dimensions</dt><dd>${p?size(p).join(' × '):''}</dd><dt>Rotation</dt><dd>${p?.rotation||0}°</dd>${p?.created?`<dt>Date</dt><dd>${e(new Date(p.created).toLocaleString(locale))}</dd>`:''}</dl><div class="settings-dialog-actions">${item('close-overlay','OK')}</div></div>`;
    return '';
  }
  window.ICSMedia={size,image,art,album,photos,settings,scene,gallery,camera,overlay,cropDefault,cropDrag,PREF};
})();
