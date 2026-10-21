/* The Nougat easter egg of N2G48C (frameworks/base android-7.1.2_r1, _aosp/aosp712/egg):
   - PlatLogoActivity (Theme.Wallpaper.NoTitleBar.Fullscreen): the platlogo vector, min(screen, 600 dp) - 100 dp square
     with 40 dp padding, scaling in from 0.5 after 800 ms (500 ms, PathInterpolator 0, 0, 0.5, 1); taps count, and a long
     press after five of them starts NekoActivationActivity, which turns NekoTile on (a borderless "🐱" toast) or off
     ("🚫").
   - NekoTile in quick settings (label/icon: the food in the dish, "????" style default; active while food is out): a tap
     empties the dish or opens NekoDialog (Theme.Material.Dialog.NoActionBar, a 2-column grid of food_layout); the food
     sets NekoService's job to its food_intervals minutes ±25 %. When it runs the dish empties and a cat comes: a new one
     with food_new_cat_prob, else one of the cats already found; its notification "A cat is here." (Android Neko).
   - Cat: java.util.Random seeded with the cat's seed picks the colours as Cat.java does (P_BODY_COLORS, belly, back, face,
     feet, tail cap, cap, collar, bow tie) and tints the 27 parts in CatParts' drawing order; the icon is that cat inside
     a circle of the body colour with its value moved by 0.25.
   - NekoLand (Theme.Material.NoActionBar): the cats sorted by hue in a 3-column grid of cat_view; a tap renames (the
     edit_text dialog with the cat's icon), a long press shows delete (Forget %s?) and share (the picture saved to
     Pictures/Cats and sent). Opened by the tile's long press (QS_TILE_PREFERENCES) and the notification. */
(() => {
  'use strict';
  const T=()=>NG.text('egg'),t=k=>T().t(k),E=(c,s)=>c.safe(s);
  const S=c=>{const s=c.data.neko ||= {tile:false,food:0,jobAt:0,cats:[]};s.cats ||= [];return s;};
  // java.util.Random (48-bit LCG), enough for Cat's choices.
  function JRandom(seed){let s=(BigInt(seed)^0x5DEECE66Dn)&((1n<<48n)-1n);const next=bits=>{s=(s*0x5DEECE66Dn+0xBn)&((1n<<48n)-1n);let r=Number(s>>BigInt(48-bits));if(bits===32&&r>=2**31)r-=2**32;return r;};
    return {nextInt(bound){if((bound&-bound)===bound)return Number((BigInt(bound)*BigInt(next(31)))>>31n);let bits,val;do{bits=next(31);val=bits%bound;}while(bits-val+(bound-1)>=2**31);return val;},nextFloat:()=>next(24)/(1<<24)};}
  const BODY=[180,0xFF212121,180,0xFFFFFFFF,140,0xFF616161,140,0xFF795548,100,0xFF90A4AE,100,0xFFFFF9C4,100,0xFFFF8F00,5,0xFF29B6F6,5,0xFFFFCDD2,5,0xFFCE93D8,4,0xFF43A047,1,0];
  const COLLAR=[250,0xFFFFFFFF,250,0xFF000000,250,0xFFF44336,50,0xFF1976D2,50,0xFFFDD835,50,0xFFFB8C00,50,0xFFF48FB1,50,0xFF4CAF50];
  const BELLY=[750,0,250,0xFFFFFFFF],DARK=[700,0,250,0xFF212121,50,0xFF6D4C41],LIGHT=[700,0,300,0xFFFFFFFF];
  const ORDER=['collar','left_ear','left_ear_inside','right_ear','right_ear_inside','head','face_spot','cap','left_eye','right_eye','nose','mouth','tail','tail_cap','tail_shadow','foot1','leg1','foot2','leg2','foot3','leg3','foot4','leg4','leg2_shadow','body','belly','bowtie'];
  const FOOD=[['food_dish',0,0],['food_bits',15,5],['food_sysuituna',30,35],['food_chicken',60,65],['food_donut',120,90]];
  const chooseP=(r,a)=>{let pct=r.nextInt(1000);const stop=a.length-2;let i=0;while(i<stop){pct-=a[i];if(pct<0)break;i+=2;}return a[i+1];};
  const isDark=c=>((c>>16&255)+(c>>8&255)+(c&255))<0x80;
  function hsvToColor(h,s,v){const f=n=>{const k=(n+h/60)%6;return Math.round(255*(v-v*s*Math.max(0,Math.min(k,4-k,1))));};return (0xFF000000|f(5)<<16|f(3)<<8|f(1))>>>0;}
  function colorToHsv(col){const r=(col>>16&255)/255,g=(col>>8&255)/255,b=(col&255)/255,max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}return [h,max?d/max:0,max];}
  const css=col=>{const a=(col>>>24)/255;return `rgba(${col>>16&255},${col>>8&255},${col&255},${a.toFixed(3)})`;};
  function cat(seed){const r=JRandom(seed),tint={},set=(col,...parts)=>parts.forEach(p=>tint[p]=col);
    let body=chooseP(r,BODY);if(body===0)body=hsvToColor(r.nextFloat()*360,(1-.5)*r.nextFloat()+.5,(1-.5)*r.nextFloat()+.5);body>>>=0;
    set(body,'body','head','leg1','leg2','leg3','leg4','tail','left_ear','right_ear','foot1','foot2','foot3','foot4','tail_cap');set(0x20000000,'leg2_shadow','tail_shadow');
    if(isDark(body))set(0xFFFFFFFF,'left_eye','right_eye','mouth','nose');
    set(isDark(body)?0xFFEF9A9A:0x20D50000,'left_ear_inside','right_ear_inside');
    set(chooseP(r,BELLY),'belly');set(chooseP(r,BELLY),'back');const face=chooseP(r,BELLY);set(face,'face_spot');if(!isDark(face))set(0xFF000000,'mouth','nose');
    let feet=0;if(r.nextFloat()<.25){feet=4;set(0xFFFFFFFF,'foot1','foot2','foot3','foot4');}else if(r.nextFloat()<.25){feet=2;set(0xFFFFFFFF,'foot1','foot3');}else if(r.nextFloat()<.25){feet=3;set(0xFFFFFFFF,'foot2','foot4');}else if(r.nextFloat()<.1){feet=1;set(0xFFFFFFFF,['foot1','foot2','foot3','foot4'][r.nextInt(4)]);}
    set(r.nextFloat()<.333?0xFFFFFFFF:body,'tail_cap');set(chooseP(r,isDark(body)?LIGHT:DARK),'cap');const collar=chooseP(r,COLLAR);set(collar,'collar');const bow=r.nextFloat()<.1;set(bow?collar:0,'bowtie');
    return {seed,body,tint};}
  // The cat as one SVG: each part's shape (NG.nekoParts) filled with its tint in CatParts' drawing order; the icon adds
  // the circle (createIcon) and draws the cat 10 % in.
  function catSvg(seed,icon=false){const k=cat(seed),hsv=colorToHsv(k.body);hsv[2]=hsv[2]>.5?hsv[2]-.25:hsv[2]+.25;const ring=hsvToColor(...hsv);
    const parts=ORDER.map(p=>{const col=k.tint[p]??0xFF000000;return col>>>24?`<g fill="${css(col)}" color="${css(col)}">${NG.nekoParts[p]}</g>`:'';}).join('');
    return `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">${icon?`<circle cx="24" cy="24" r="24" fill="${css(ring)}"/><g transform="translate(4.8 4.8) scale(.8)">${parts}</g>`:parts}</svg>`;}
  const catUri=seed=>'data:image/svg+xml,'+encodeURIComponent(catSvg(seed,true));
  const catName=(c,k)=>k.name||T().fmt('default_cat_name',null,String(k.seed%1000));
  const foodName=i=>T().t('food_names')[i];
  // NekoTile as a quick settings tile (ng-shade.js NG.qsCustom).
  (NG.qsCustom ||= {}).neko={available:c=>S(c).tile,state:c=>{const f=S(c).food;return {id:'neko',label:f?foodName(f):t('default_tile_name'),icon:`egg-${FOOD[f][0]}.svg`,dim:!f,desc:f?foodName(f):t('app_name')};},
    click(c,shade){const s=S(c);if(s.food){s.food=0;s.jobAt=0;c.save();shade.refresh(c);return;}shade.close(c);setTimeout(()=>dialog(c),260);},longClick(c){c.closeOverlay();c.open('neko');}};
  // NekoDialog: Theme.Material.Dialog.NoActionBar, food_layout's 64 dp icons (tinted colorControlNormal) over the names.
  function dialog(c){c.dialog({accent:'#80cbc4',items:FOOD.slice(1).map(([icon],i)=>({html:`<span class="ngegg-food"><img src="assets/egg-${icon}.svg" alt=""><span>${E(c,foodName(i+1))}</span></span>`})),onItem:(i,c)=>feed(c,i+1)});c.el.overlay.querySelector('.ngdlg')?.classList.add('ngegg-dialog');}
  function feed(c,food){const s=S(c);if(!s.food&&food){const min=FOOD[food][1],jitter=.25*min;s.jobAt=Date.now()+(min+(Math.random()*2*jitter)-jitter)*60000;}s.food=food;c.save();}
  function arrive(c){const s=S(c),food=s.food;s.food=0;s.jobAt=0;let k;const prob=(FOOD[food]?.[2]??50)/100;if(!s.cats.length||Math.random()<=prob){k={seed:Math.floor(Math.random()*2**31)};s.cats.push(k);}else k=s.cats[Math.floor(Math.random()*s.cats.length)];c.save();
    const notes=c.data.notifications ||= [];const old=notes.find(n=>n.app==='neko');if(old)NG.notifications.cancel(c,old.id);
    NG.notify?.(c,{app:'neko',appName:t('notification_name'),icon:'assets/egg-stat_icon.svg',color:css(cat(k.seed).body),title:t('notification_title'),text:catName(c,k),catSeed:k.seed,open:['neko',''],heads:false});}
  function land(c){const s=S(c),list=[...s.cats].sort((a,b)=>colorToHsv(cat(a.seed).body)[0]-colorToHsv(cat(b.seed).body)[0]),open=c.ui.nekoMenu;
    return `<div class="ngegg-land"><div class="ngegg-grid">${list.map(k=>`<div class="ngegg-cat" data-action="ngegg-rename" data-seed="${k.seed}"><span class="ngegg-icon">${catSvg(k.seed,true)}${open===k.seed?`<span class="ngegg-context"><button type="button" data-action="ngegg-delete" data-seed="${k.seed}"><img src="assets/egg-ic_close.svg" alt=""></button><button type="button" data-action="ngegg-share" data-seed="${k.seed}"><img src="assets/egg-ic_share.svg" alt=""></button></span>`:''}</span><span class="ngegg-name">${E(c,catName(c,k))}</span></div>`).join('')}</div></div>`;}
  function logo(c){const u=c.ui.platlogo ||= {taps:0};return `<div class="ngegg-plat"><button type="button" class="ngegg-logo" data-action="ngegg-tap" aria-label="${E(c,t('app_name'))}"><img src="assets/egg-platlogo.svg" alt=""></button></div>`;}
  NG.register('platlogo',{render:logo,noStatus:()=>true,noNav:()=>false,statusColor:()=> '#000',
    mount(c,root){const u=c.ui.platlogo,btn=root.querySelector('.ngegg-logo');if(!btn)return;let timer=0;const start=()=>{clearTimeout(timer);timer=setTimeout(()=>{timer=-1;if(u.taps>=5)activate(c);},500);};btn.addEventListener('pointerdown',start);btn.addEventListener('pointerup',()=>{if(timer>0)clearTimeout(timer);});btn.addEventListener('pointerleave',()=>{if(timer>0)clearTimeout(timer);});},
    unmount(c){c.ui.platlogo=null;},
    action(name,el,e,c){if(name!=='ngegg-tap')return false;c.ui.platlogo.taps++;return true;}});
  function activate(c){const s=S(c);s.tile=!s.tile;if(!s.tile){const st=c.data.settings;if(st.qsTiles)st.qsTiles=st.qsTiles.filter(id=>id!=='neko');}c.save();c.toast(s.tile?'\u{1F431}':'\u{1F6AB}',{plain:true});}
  NG.nekoActivate=activate;
  NG.register('neko',{render:land,statusColor:()=> '#000',dialogAccent:()=> '#80cbc4',
    notification(c,n){return n.catSeed!==undefined?{large:catSvg(n.catSeed,true)}:null;},
    tick(c){const s=S(c);if(s.food&&s.jobAt&&Date.now()>=s.jobAt)arrive(c);},
    action(name,el,e,c){const s=S(c),k=s.cats.find(x=>String(x.seed)===el.dataset.seed);
      if(!k)return false;
      if(name==='ngegg-rename'){if(c.ui.nekoMenu===k.seed){c.ui.nekoMenu=null;c.render();return true;}let v=catName(c,k);c.dialog({icon:catUri(k.seed),title:' ',html:`<div class="ngegg-edit"><input class="ngst-input" value="${E(c,v)}"></div>`,mount:(c,win)=>{const f=win.querySelector('input');f.addEventListener('input',()=>{v=f.value;});setTimeout(()=>{f.focus();f.setSelectionRange(v.length,v.length);},50);},buttons:[{label:NG.text('framework').t('ok'),action:c=>{k.name=v.trim();c.save();c.render();}}]});return true;}
      if(name==='ngegg-delete'){c.ui.nekoMenu=null;c.dialog({title:T().fmt('confirm_delete',null,catName(c,k)),buttons:[{label:NG.text('framework').t('cancel')},{label:NG.text('framework').t('ok'),action:c=>{s.cats=s.cats.filter(x=>x!==k);c.save();c.render();}}]});c.render();return true;}
      if(name==='ngegg-share'){c.ui.nekoMenu=null;const p=NG.media.add(c,{album:'cats',ratio:1,markup:catSvg(k.seed),name:catName(c,k)+'.png'});NG.share(c,{title:'',kind:'image',name:catName(c,k)+'.png',photo:p.id});c.render();return true;}
      return false;},
    mount(c,root){root.querySelectorAll('.ngegg-cat').forEach(el=>{let timer=0;el.addEventListener('pointerdown',()=>{timer=setTimeout(()=>{timer=-1;c.ui.nekoMenu=+el.dataset.seed;c.render();setTimeout(()=>{if(c.ui.nekoMenu===+el.dataset.seed){c.ui.nekoMenu=null;if(c.ui.view==='neko')c.render();}},5000);},500);});el.addEventListener('pointerup',e=>{if(timer>0)clearTimeout(timer);else if(timer===-1){e.preventDefault();timer=0;el.dataset.skip='1';}});el.addEventListener('click',e=>{if(el.dataset.skip){delete el.dataset.skip;e.stopPropagation();}},true);});}
  });
  NG.neko={cat,catSvg,JRandom,arrive,feed};
})();
