/* N2G48C Velvet WallpaperPicker / CropView. Its wallpapers array is empty on angler:
   offer the framework default, My photos and the installed live-wallpaper picker.
   Applied photos are local snapshots, independent of later edits/deletion in Photos. */
(() => {
  'use strict';
  const T=()=>NG.text('launcher'),t=k=>T().t(k),DEFAULT={kind:'default',x:0,y:0,scale:1};
  NG.defaults.wallpapers={home:{...DEFAULT},lock:null};
  const S=c=>c.data.wallpapers ||= {home:{...DEFAULT},lock:null};
  const clone=x=>JSON.parse(JSON.stringify(x));
  const U=c=>c.ui.wallpaper ||= {draft:clone(S(c).home||DEFAULT)};
  const image=s=>s?.kind==='photo'&&s.image?.startsWith('data:image/svg+xml')?s.image:'assets/fw-default_wallpaper.png';
  function size(c,s) {const aspect=s?.aspect||1.125,screen=c.el.screen.clientWidth/c.el.screen.clientHeight,zoom=Math.max(1,Math.min(3,+s?.scale||1));return aspect>=screen?`auto ${100*zoom}%`:`${100*zoom}% auto`;}
  function apply(c) {
    const s=S(c),home=s.home||DEFAULT,lock=s.lock||home,style=c.el.screen.style;
    for(const [id,p]of [['home',home],['lock',lock]]) {
      style.setProperty(id==='home'?'--ng-wallpaper':'--ng-lock-wallpaper',`url("${image(p)}")`);
      style.setProperty(`--ng-${id}-position`,`${p.x??50}% ${p.y??50}%`);style.setProperty(`--ng-${id}-size`,size(c,p));
    }
  }
  function paint(c) {
    const el=c.el.viewport.querySelector('.ngwp-crop');if(!el)return;const p=U(c).draft;
    el.style.backgroundImage=`url("${image(p)}")`;el.style.backgroundPosition=`${p.x??50}% ${p.y??50}%`;el.style.backgroundSize=size(c,p);
    c.el.screen.style.setProperty('--ng-wallpaper-preview',`url("${image(p)}")`);
  }
  function choosePhoto(c) {
    NG.pickDocument(c,{mode:'pick',mime:'image/*',onPick(c,files){
      const photo=NG.media.photos(c).find(p=>p.id===files[0]?.photo);if(!photo){c.toast(t('wallpaper_load_fail'));return;}
      const svg=NG.media.svg(photo),box=svg.match(/viewBox="([^"]+)"/)?.[1]?.split(/\s+/).map(Number)||[0,0,960,720];
      U(c).draft={kind:'photo',photo:photo.id,image:'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg),aspect:box[2]/box[3],x:50,y:50,scale:1};
    }});
  }
  function set(c,where) {
    const s=S(c),picture=clone(U(c).draft);
    if(where===0){if(!s.lock)s.lock=clone(s.home||DEFAULT);s.home=picture;}
    else if(where===1)s.lock=picture;else{s.home=picture;s.lock=clone(picture);}
    c.data.settings.wallpaperSet=true;c.save();apply(c);c.home();
  }
  NG.wallpaper={apply,image,size};
  NG.register('wallpaper-system',{app:false,init(c){apply(c);window.addEventListener('resize',()=>{apply(c);if(c.ui.view==='wallpapers')paint(c);});}});
  NG.register('wallpapers',{
    app:false,noStatus:()=>true,statusColor:()=> 'transparent',
    unmount(c){if(!c.ui.documentPicker&&!['documents','files','live-wallpapers'].includes(c.ui.view))c.ui.wallpaper=null;},
    render(c){const draft=U(c).draft,safe=c.safe;return `<div class="ngwp"><div class="ngwp-crop" aria-label="${safe(t('wallpaper_instructions'))}"></div><div class="ngwp-bar"><button type="button" data-action="ngwp-back" aria-label="${safe(NG.text('settings').t('framework/cancel'))}"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><button type="button" class="ngwp-set" data-action="ngwp-set"><img src="assets/wp-accept.png" alt=""><span>${safe(t('wallpaper_instructions'))}</span></button></div><div class="ngwp-strip"><button type="button" class="ngwp-tile ${draft.kind==='default'?'selected':''}" data-action="ngwp-default"><img class="ngwp-thumb" src="assets/fw-default_wallpaper.png" alt=""></button><button type="button" class="ngwp-tile ngwp-photos" data-action="ngwp-photos"><img src="assets/wp-images.png" alt=""><span>${safe(t('pick_image'))}</span></button>${draft.kind==='photo'?`<button type="button" class="ngwp-tile selected" data-action="ngwp-current"><img class="ngwp-thumb" src="${safe(image(draft))}" alt=""></button>`:''}<button type="button" class="ngwp-tile ngwp-live" data-action="ngwp-live"><img src="assets/lw-ic_launcher_live_wallpaper.png" alt=""><span>${safe(t('LiveWallpapersPicker/live_wallpaper_picker_label'))}</span></button></div></div>`;},
    mount(c,root){
      paint(c);const el=root.querySelector('.ngwp-crop'),points=new Map();let start;
      const distance=()=>{const a=[...points.values()];return a.length===2?Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]):0;};
      el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);points.set(e.pointerId,[e.clientX,e.clientY]);const p=U(c).draft;start={x:p.x??50,y:p.y??50,scale:p.scale||1,at:[e.clientX,e.clientY],distance:distance()};});
      el.addEventListener('pointermove',e=>{if(!points.has(e.pointerId)||!start)return;points.set(e.pointerId,[e.clientX,e.clientY]);const p=U(c).draft;if(points.size===2)p.scale=Math.max(1,Math.min(3,start.scale*distance()/Math.max(1,start.distance)));else{const r=el.getBoundingClientRect();p.x=Math.max(0,Math.min(100,start.x-(e.clientX-start.at[0])*100/r.width));p.y=Math.max(0,Math.min(100,start.y-(e.clientY-start.at[1])*100/r.height));}paint(c);});
      const end=e=>{points.delete(e.pointerId);start=null;};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
      el.addEventListener('wheel',e=>{e.preventDefault();const p=U(c).draft;p.scale=Math.max(1,Math.min(3,(p.scale||1)*Math.exp(-e.deltaY*.001)));paint(c);},{passive:false});
    },
    action(name,el,e,c){if(name==='ngwp-back'){c.back();return true;}if(name==='ngwp-default'){U(c).draft={...DEFAULT};c.render();return true;}if(name==='ngwp-photos'){choosePhoto(c);return true;}if(name==='ngwp-live'){c.open('live-wallpapers');return true;}if(name==='ngwp-current')return true;if(name==='ngwp-set'){c.dialog({title:t('wallpaper_instructions'),items:T().t('which_wallpaper_options').map(label=>({label})),onItem:i=>set(c,i)});return true;}return false;}
  });
  NG.register('live-wallpapers',{
    app:false,statusColor:()=> '#21272b',
    render(c){return `<div class="ngst"><div class="ngst-ab"><button type="button" class="ngst-nav" data-action="ngwp-back"><i style="-webkit-mask-image:url('assets/fw-ic_ab_back_material.svg');mask-image:url('assets/fw-ic_ab_back_material.svg')"></i></button><span class="ngst-abtitle nav">${c.safe(t('LiveWallpapersPicker/live_wallpaper_picker_title'))}</span></div><div class="ngst-content ngwp-empty">${c.safe(t('LiveWallpapersPicker/live_wallpaper_empty'))}</div></div>`;},
    action(name,el,e,c){if(name!=='ngwp-back')return false;c.back();return true;}
  });
})();
