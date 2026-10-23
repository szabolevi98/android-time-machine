/* The simulator's own photo illustrations for the 5.1.1 Camera and Photos (lp-camera.js, photos.js draw the apps): the
   scenes, the editor looks, the albums, and the Share and Details popups. Never device captures. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const palettes=[['#96c8d0','#e8ad7a','#364e59'],['#223850','#ce6979','#101d32'],['#67aab6','#f3d3a0','#21617a']];
  const album=photo=>photo.album || (photo.id<=4?'pictures':'camera');
  const photos=(data,key)=>data.photos.filter(p=>!key||album(p)===key);
  function settings(data) { return {flash:'auto',balance:'auto',exposure:0,zoom:1,front:false,...data.cameraSettings}; }
  function scene(data) { const s=settings(data);return {colors:palettes[s.front?1:0],zoom:s.zoom,balance:s.balance,exposure:s.exposure,front:s.front,scene:s.scene||'auto'}; }
  /* Photo Editor (FilterShow 4.3) looks, as SVG filter steps: saturate, colour matrix and linear contrast. */
  const LOOKS={
    punch:[['saturate',1.5],['contrast',1.25]],
    vintage:[['matrix','.39 .77 .19 0 .04 .35 .69 .17 0 .03 .27 .53 .13 0 .02 0 0 0 1 0'],['contrast',.9]],
    instant:[['matrix','.9 .12 0 0 .05 .05 .85 .1 0 .04 .05 .1 .72 0 .02 0 0 0 1 0'],['contrast',.88]],
    bleach:[['saturate',.35],['contrast',1.3]],
    blue_crush:[['matrix','.78 0 0 0 0 0 .92 0 0 .02 0 0 1.05 0 .08 0 0 0 1 0'],['contrast',1.1]],
    bw_contrast:[['saturate',0],['contrast',1.35]],
    x_process:[['matrix','1.1 0 0 0 0 0 1.05 0 0 .03 0 0 .78 0 .08 0 0 0 1 0'],['contrast',1.15]],
    washout:[['saturate',.7],['contrast',.7]],
    washout_color:[['saturate',1.25],['contrast',.6]]
  };
  const LOOK_NAMES=[['','Original'],['punch','Punch'],['vintage','Vintage'],['bw_contrast','B/W'],['bleach','Bleach'],['instant','Instant'],['washout','Latte'],['blue_crush','Blue'],['washout_color','Litho'],['x_process','X Process']];
  function filterMarkup(photo) {
    const adjust=photo.adjust||{},steps=[...(LOOKS[photo.look]||[])];
    if(adjust.autocolor)steps.push(['saturate',1.12],['contrast',1.08]);
    if(Number.isFinite(adjust.saturation)&&adjust.saturation!==1)steps.push(['saturate',adjust.saturation]);
    if(Number.isFinite(adjust.hue)&&adjust.hue)steps.push(['hue',adjust.hue]);
    if(Number.isFinite(adjust.contrast)&&adjust.contrast!==1)steps.push(['contrast',adjust.contrast]);
    if(!steps.length)return '';
    const primitive=([type,value])=>type==='saturate'?`<feColorMatrix type="saturate" values="${value}"/>`:type==='hue'?`<feColorMatrix type="hueRotate" values="${value}"/>`:type==='matrix'?`<feColorMatrix type="matrix" values="${value}"/>`:`<feComponentTransfer>${['R','G','B'].map(c=>`<feFunc${c} type="linear" slope="${value}" intercept="${(.5*(1-value)).toFixed(3)}"/>`).join('')}</feComponentTransfer>`;
    return `<filter id="look" color-interpolation-filters="sRGB">${steps.map(primitive).join('')}</filter>`;
  }
  function borderMarkup(kind,width,height) {
    const t=Math.round(Math.min(width,height)*.045);
    if(kind==='black'||kind==='white')return `<rect x="${t/2}" y="${t/2}" width="${width-t}" height="${height-t}" fill="none" stroke="${kind}" stroke-width="${t}"/>`;
    if(kind==='rounded')return `<path fill="white" fill-rule="evenodd" d="M0 0H${width}V${height}H0Z M${t} ${t*3}A${t*2} ${t*2} 0 0 1 ${t*3} ${t}H${width-t*3}A${t*2} ${t*2} 0 0 1 ${width-t} ${t*3}V${height-t*3}A${t*2} ${t*2} 0 0 1 ${width-t*3} ${height-t}H${t*3}A${t*2} ${t*2} 0 0 1 ${t} ${height-t*3}Z"/>`;
    if(kind==='film'){const f=t*1.6,holes=Array.from({length:Math.floor(width/(f*1.4))},(_,i)=>`<rect x="${i*f*1.4+f*.35}" y="${f*.3}" width="${f*.7}" height="${f*.4}" rx="${f*.08}" fill="#ddd"/><rect x="${i*f*1.4+f*.35}" y="${height-f*.7}" width="${f*.7}" height="${f*.4}" rx="${f*.08}" fill="#ddd"/>`).join('');return `<rect width="${width}" height="${f}" fill="#111"/><rect y="${height-f}" width="${width}" height="${f}" fill="#111"/>${holes}`;}
    return '';
  }
  // A panorama (PANO_*): the scene three times across, the middle one mirrored so the hills meet, one sun.
  function panoImage(photo) {
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]],width=3072,height=768;
    const hills=`<path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/>`;
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient></defs><rect width="${width}" height="${height}" fill="url(#sky)"/><circle cx="1790" cy="200" r="65" fill="${sun}"/>${hills}<g transform="translate(2048 0) scale(-1 1)">${hills}</g><g transform="translate(2048 0)">${hills}</g></svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  // An edit made in Google+'s editor (plus-editor.js) is drawn over the picture it was made on.
  function image(photo) {
    if(photo.plusEdit?.steps?.length&&window.PlusEditor){const plain=image({...photo,plusEdit:undefined}),turned=!photo.pano&&((Number(photo.rotation)||0)%180);return PlusEditor.compose(plain,photo.pano?3072:turned?768:1024,photo.pano?768:turned?1024:768,photo.plusEdit.steps);}
    if(photo.pano)return panoImage(photo);
    const colors=(photo.colors||palettes[0]).map((c,i)=>/^#[\da-f]{6}$/i.test(c)?c:palettes[0][i%3]);
    const [sky,sun,land]=[...colors,...palettes[0]];
    const rotation=((Number(photo.rotation)||0)%360+360)%360,zoom=Math.min(4,Math.max(1,Number(photo.zoom)||1));
    const width=rotation%180?768:1024,height=rotation%180?1024:768;
    const filter=filterMarkup(photo),vignette=Math.max(0,Math.min(1,Number(photo.adjust?.vignette)||0));
    const exposure=Math.min(3,Math.max(-3,Number(photo.exposure)||0));
    const tint=photo.balance==='incandescent'?'#7899ff':photo.balance==='fluorescent'?'#d6a6ff':photo.balance==='cloudy'?'#ffbb66':photo.balance==='daylight'?'#ffe7a0':null;
    // 4.3 scene modes: night lifts the shadows, sunset and party warm the picture.
    const sceneTint={night:['#203060',.28],sunset:['#ff8040',.22],party:['#ff60a0',.14]}[photo.scene];
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${sun}"/></linearGradient>${filter}<radialGradient id="vig"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${vignette}"/></radialGradient></defs><g ${filter?'filter="url(#look)"':''}><rect width="${width}" height="${height}" fill="${land}"/><g transform="translate(${width/2} ${height/2}) rotate(${rotation}) scale(${(photo.front?-1:1)*(photo.mirror?-1:1)*zoom} ${zoom}) translate(-512 -384)"><rect width="1024" height="768" fill="url(#sky)"/><circle cx="755" cy="200" r="65" fill="${sun}"/><path d="M0 610 260 250 565 580 780 320 1024 610V768H0Z" fill="${land}"/><path d="m170 375 90-125 105 126-98-40Z" fill="#ffffffa0"/><path d="M0 630Q260 510 510 665T1024 610V768H0Z" fill="${sky}" opacity=".7"/><path d="M0 710Q300 630 550 738T1024 700V768H0Z" fill="${land}"/></g>${tint?`<rect width="${width}" height="${height}" fill="${tint}" opacity=".22"/>`:''}${sceneTint?`<rect width="${width}" height="${height}" fill="${sceneTint[0]}" opacity="${sceneTint[1]}"/>`:''}${exposure?`<rect width="${width}" height="${height}" fill="${exposure>0?'white':'black'}" opacity="${Math.abs(exposure)*.12}"/>`:''}</g>${vignette?`<rect width="${width}" height="${height}" fill="url(#vig)"/>`:''}${borderMarkup(photo.border,width,height)}</svg>`;
    return 'data:image/svg+xml,'+encodeURIComponent(svg);
  }
  const art=photo=>`<img class="media-photo" src="${image(photo)}" alt="${e(photo.name||'')}">`;
  function overlay(data,ui,t,locale) {
    const p=data.photos.find(p=>p.id===ui.selectedPhoto),s=settings(data);
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu media-menu">${body}</div>`;
    const item=(action,label,id='')=>`<button data-action="${action}" data-id="${e(id)}">${e(t(label))}</button>`;
    if(ui.overlay==='gallery-share')return menu(item('gallery-share-message','Messaging'));
    if(ui.overlay==='gallery-details')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog media-details" role="dialog" aria-label="Details"><h3>Details</h3><dl><dt>Name</dt><dd>${e(p?.name)}</dd><dt>Album</dt><dd>${e(t(album(p||{})==='camera'?'Camera':'Pictures'))}</dd><dt>Dimensions</dt><dd>${(p?.rotation||0)%180?'768 × 1024':'1024 × 768'}</dd><dt>Rotation</dt><dd>${p?.rotation||0}°</dd>${p?.created?`<dt>Date</dt><dd>${e(new Date(p.created).toLocaleString(locale))}</dd>`:''}</dl><div class="settings-dialog-actions">${item('close-overlay','OK')}</div></div>`;
    return '';
  }
  window.ICSMedia={image,art,album,photos,settings,scene,overlay,LOOKS,LOOK_NAMES};
})();
