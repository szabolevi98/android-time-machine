// Easter egg regressions: real touch holds, wallpaper windows, Nyandroid particles and moving Dessert Case tiles.
// BASE can point at the deployed site as well as the local server.
import assert from 'node:assert/strict';
import {marshmallow,sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
let b=await marshmallow();const base=process.env.BASE||'http://127.0.0.1:8090';
const versions=['4.0.4','4.3','4.4.4'].filter(v=>!process.argv[2]||process.argv[2]===v);
const act=(action,data={})=>b.act(action,data);
const hold=async(selector,ms)=>{
 const r=await b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}})()`);
 await b.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...r,radiusX:4,radiusY:4,force:1,id:1}]});
 await sleep(ms);await b.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
};
const contextProtected=async selector=>{
 assert.equal(await b.ev(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),s=getComputedStyle(e);return s.userSelect==='none'&&s.webkitUserDrag==='none'})()`),true,'native selection and image dragging disabled');
 assert.equal(await b.ev(`!document.querySelector(${JSON.stringify(selector)}).dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}))`),true,'native context menu suppressed');
 assert.equal(await b.ev(`String(getSelection())`),'');
};
try{
 await b.ev(`for(const v of ['2.3.6','4.0.4','4.3','4.4.4','5.1.1'])sessionStorage.setItem('android-sim-booted-'+v,'1')`);
 for(const v of versions)for(const width of [1280,390])for(const reduced of [false,true]){
  await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
  await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2});
  await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
  await b.ev(`for(const k of ['android-time-machine-ics-v1','android-time-machine-jb-v1','android-time-machine-kk-v1'])localStorage.removeItem(k)`);
  await b.send('Page.navigate',{url:`${base}/versions/${v}/`});
  await b.until(`!!document.querySelector('#viewport .home-view,#viewport .lock-view')`);
  await act('unlock');
  // Explicitly choose a live wallpaper on every release (KitKat's first-boot choice is a static photo).
  await act('open-app',{app:'live-wallpapers'});await act('lw-set',{id:'phasebeam'});
  await b.until(`!document.querySelector('#live-wallpaper').hidden`);
  await act('open-app',{app:'settings'});await act('settings-sub',{id:'about'});
  await b.ev(`for(let i=0;i<3;i++)document.querySelector('[data-action="about-tap"]').click()`);
  await sleep(350);
  assert.equal(await b.ev(`document.querySelector('#live-wallpaper').hidden`),false,`${v} wallpaper visible behind logo`);
  const root=v==='4.0.4'?'.easter-view':v==='4.3'?'.jb-platlogo-view':'.kk-platlogo';
  assert.ok(!(await b.ev(`getComputedStyle(document.querySelector('${root}')).backgroundColor`)).match(/^rgb\(0, 0, 0\)$/),'no opaque black window');
  await contextProtected(root+' img');
  await b.shot(`${v}-egg-wallpaper-${width}-${reduced}`);
  if(v==='4.0.4'){
   await hold('.easter-robot',2700);await b.until(`document.querySelectorAll('.nyan-star').length===20`);
   assert.equal(await b.ev(`document.querySelectorAll('.nyan-cat').length`),20);
   const frames=()=>b.ev(`[...document.querySelectorAll('.nyan-star')].map(e=>e.dataset.frame)`);
   const before=await frames(),x=await b.ev(`document.querySelector('.nyan-cat').style.transform`);await sleep(300);
   if(reduced)assert.ok((await frames()).every(f=>f==='3'),'reduced motion keeps visible star frames');
   else assert.notDeepEqual(await frames(),before,'particle frames twinkle');
   assert.notEqual(await b.ev(`document.querySelector('.nyan-cat').style.transform`),x,'androids fly');
   assert.equal(await b.ev(`getComputedStyle(document.querySelector('.nyan-sky')).backgroundColor`),'rgb(0, 51, 102)','Nyandroid retains its own sky');
  }else if(v==='4.3'){
   await b.click('.jb-platlogo');await hold('.jb-platlogo',800);await b.until(`document.querySelectorAll('.jb-beanbag .bean').length===40`);
   assert.equal(await b.ev(`document.querySelector('#live-wallpaper').hidden`),false,'wallpaper also visible in BeanBag');
   await contextProtected('.jb-beanbag .bean');
  }else{
   for(let i=0;i<6;i++)await b.click('[data-kk-platlogo]');await sleep(reduced?100:2100);
   await hold('.kk-egg-logo',700);await b.until(`document.querySelectorAll('.kk-dessert-tile').length>10`);await sleep(2200);
   // Observe the actual halfway transform, including reduced-motion mode: movement is the game content.
   await b.ev(`window.__tile=document.querySelector('.kk-dessert-tile');window.__tile.click()`);await sleep(100);
   assert.equal(await b.ev(`__tile.getAnimations().some(a=>a.playState==='running')`),true,'tile placement animates');
   const t=await b.ev(`getComputedStyle(__tile).transform`);await sleep(150);assert.notEqual(await b.ev(`getComputedStyle(__tile).transform`),t,'tile moves between animation frames');
   // Native auto-juggle starts after five seconds and repeats every two; observe a later automatic move.
   await b.until(`document.querySelector('.kk-dessert-tile')?.getAnimations().length===0`);
   await b.until(`[...document.querySelectorAll('.kk-dessert-tile')].some(e=>e.getAnimations().some(a=>a.playState==='running'))`);
   await contextProtected('.kk-dessert-tile');
  }
  await b.shot(`${v}-egg-running-${width}-${reduced}`);
  console.log(`ok easter egg ${v} ${width} reduced=${reduced}`);
 }
 if(!process.argv[2]){
  for(const v of ['2.3.6','5.1.1']){
   await b.send('Page.navigate',{url:`${base}/versions/${v}/`});await b.until(`!!document.querySelector('#viewport .home-view,#viewport .lock-view')`);
   await act('unlock');await act('open-app',{app:'settings'});await act('settings-sub',{id:'about'});
   await b.ev(`for(let i=0;i<3;i++)document.querySelector('[data-action="about-tap"]').click()`);await sleep(400);
   await contextProtected(v==='2.3.6'?'.gb-platlogo img':'.lp-platlogo');
   if(v==='5.1.1')assert.notEqual(await b.ev(`getComputedStyle(document.querySelector('#screen')).backgroundImage`),'none','Lollipop wallpaper retained');
   console.log(`ok mobile easter egg selection ${v}`);
  }
  // The modular releases have their own native context-menu handlers and wallpaper roots.
  b.check();b.close();
  for(const [version,start,root] of [['6.0.1',marshmallow,'.mmeg'],['7.1.2',nougat,'.ngegg-plat']]){
   b=await start();await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
   await b.open('platlogo');await sleep(1400);await contextProtected(root+' img');
   const wallpaper=await b.ev(`getComputedStyle(document.querySelector('${root==='.mmeg'?'#screen':root}')).backgroundImage`);
   assert.notEqual(wallpaper,'none',`${version} wallpaper retained`);b.check();console.log(`ok mobile easter egg selection ${version}`);
   if(version==='6.0.1')b.close();
  }
 }
 b.check();
}catch(e){await b.shot('easter-egg-failure');throw e;}finally{b.close();}
