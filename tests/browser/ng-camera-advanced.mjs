import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
try{
  await b.ev(`(()=>{const m=NG.module('camera'),f=m.mount;m.mount=(c,r)=>{window.cameraTestContext=c;f(c,r)};})()`);
  await b.open('camera');
  const state=()=>b.ev(`({guide:cameraTestContext.ui.camera.guide,burst:cameraTestContext.ui.camera.burst,zoom:cameraTestContext.ui.camera.zoom})`);
  const rect=sel=>b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);
  const mouse=(type,x,y,buttons)=>b.send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons,clickCount:type==='mouseMoved'?0:1});
  async function tap(sel){const r=await rect(sel);await mouse('mousePressed',r.x+r.w/2,r.y+r.h/2,1);await mouse('mouseReleased',r.x+r.w/2,r.y+r.h/2,0);await sleep(70);}
  async function move(dx,dy,ms=320){const r=await rect('#viewport .ngcm-preview'),x=r.x+r.w/2,y=r.y+r.h/2;await mouse('mousePressed',x,y,1);for(let i=1;i<=12;i++){await mouse('mouseMoved',x+dx*i/12,y+dy*i/12,1);await sleep(ms/12);}await mouse('mouseReleased',x+dx,y+dy,0);}
  async function mode(m){if((await b.ev('cameraTestContext.data.camera.mode'))!==m){if((await b.ev('cameraTestContext.data.camera.mode'))!=='photo')await tap('#viewport [data-action="ngcm-mode"][data-m="photo"]');await sleep(450);if(m==='photo')return;await tap('#viewport [data-action="ngcm-menu"]');await tap(`#viewport [data-m="${m}"]`);await sleep(450);}}
  let n=(await b.save()).photos.length;
  await mode('panorama');await tap('#viewport [data-action="ngcm-shutter"]');
  await b.until(`cameraTestContext.ui.camera.guide?.index===1`);
  assert.equal((await b.save()).photos.length,n,'no single-frame panorama saved');
  let r=await rect('#viewport .ngcm-preview');await move(-.34*r.w,0);
  await b.until(`cameraTestContext.ui.camera.guide?.index===2`);
  await tap('#viewport [data-action="ngcm-shutter"]');
  let p=(await b.save()).photos.at(-1);assert.equal(p.panorama.poses.length,2);assert.equal(p.ratio,3);n++;
  await tap('#viewport [data-action="ngcm-shutter"]');await tap('#viewport [data-action="ngcm-guide-cancel"]');await sleep(500);assert.equal((await b.save()).photos.length,n,'cancel discards unfinished capture');
  await mode('photosphere');await tap('#viewport [data-action="ngcm-shutter"]');
  for(let i=0;i<24;i++){
    let g=(await state()).guide;if(!g)break;
    const t=g.points[g.index];r=await rect('#viewport .ngcm-preview');
    if(Math.abs(g.x-t.x)+Math.abs(g.y-t.y)>.001)await move((g.x-t.x)*r.w,(g.y-t.y)*r.h);
    await b.until(`!cameraTestContext.ui.camera.guide || cameraTestContext.ui.camera.guide.index>${g.index}`);
  }
  p=(await b.save()).photos.at(-1);assert.equal(p.panorama.type,'sphere');assert.equal(p.panorama.complete,true);assert.equal(p.panorama.poses.length,24);n++;
  await mode('refocus');await tap('#viewport [data-action="ngcm-shutter"]');
  r=await rect('#viewport .ngcm-preview');await move(r.w*.3,0,100);assert.equal((await state()).guide.progress,0,'lateral travel rejected');
  const dp=await b.ev(`cameraTestContext.el.screen.clientWidth/411.4286`);await move(0,-145*dp,1000);
  await b.until(`!cameraTestContext.ui.camera.guide`);p=(await b.save()).photos.at(-1);assert.equal(p.refocus.travel,140);n++;
  await tap('#viewport [data-action="ngcm-thumb"]');await b.until(`document.querySelector('#viewport .ngrf')`);
  assert.equal(await b.ev(`!!document.querySelector('#viewport .ngrf feGaussianBlur')`),true,'depth preview changes rendered image');
  await b.drag('#viewport .ngrf input',45,0);
  await tap('#viewport .ngrf-picture');await tap('#viewport [data-action="ngrf-done"]');await sleep(450);
  p=(await b.save()).photos.at(-1);assert.notEqual(p.refocus.strength,.6,'native slider commits');
  await tap('#viewport [data-action="ngcm-thumb"]');await b.until(`document.querySelector('#viewport .ngrf')`);await b.drag('#viewport .ngrf input',-70,0);await tap('#nav-bar [data-key="back"]');await sleep(450);assert.equal((await b.save()).photos.at(-1).refocus.strength,p.refocus.strength,'Back discards edit');
  await mode('photo');await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_auto_generate_artifacts',false)`);
  async function burst(ms){const r=await rect('#viewport .ngcm-shutter'),x=r.x+r.w/2,y=r.y+r.h/2;await mouse('mousePressed',x,y,1);await sleep(ms);await mouse('mouseReleased',x,y,0);await sleep(200);}
  await burst(2050);let photos=(await b.save()).photos;assert.equal(photos.length,n+8);assert.ok(photos.at(-1).burst.total>8);assert.ok(photos.at(-1).burst.best);n=photos.length;
  await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_smartburst_classicburst',false)`);
  await burst(1800);photos=(await b.save()).photos;assert.ok(photos.length>n+8);assert.equal(photos.at(-1).burst.kept,photos.at(-1).burst.total);n=photos.length;
  await sleep(750);await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_volume_key_action','zoom')`);await tap('#volume-up');assert.ok((await state()).zoom>1);assert.equal((await b.save()).photos.length,n);
  await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_volume_key_action','nothing')`);await tap('#volume-up');assert.equal((await b.save()).photos.length,n);
  await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_volume_key_action','shutter')`);await tap('#volume-down');assert.equal((await b.save()).photos.length,n+1);assert.ok((await b.save()).photos.at(-1).zoom>1);
  const id=(await b.save()).photos.at(-1).id;await b.ev(`(()=>{const p=NG.media.photos(cameraTestContext).find(p=>p.id===${id}),s=NG.media.svg(p),a=s.match(/viewBox="([^"]+)/)[1].split(' ').map(Number);window.zoomView=a;})()`);assert.ok((await b.ev('zoomView[2]'))<400*4/3);
  await b.shot('7.1.2-camera-advanced-desktop');
  await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
  for(const lang of ['en','hu','de','fr','es']){
    await b.language(lang);await b.ev(`(()=>{const m=NG.module('camera'),f=m.mount;m.mount=(c,r)=>{window.cameraTestContext=c;f(c,r)};})()`);await b.open('camera');await mode('refocus');await tap('#viewport [data-action="ngcm-shutter"]');
    assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang+' native text');assert.equal(await b.ev('document.documentElement.scrollWidth<=innerWidth+1'),true);
    await tap('#nav-bar [data-key="home"]');await sleep(450);await b.open('camera');assert.equal((await state()).guide,null,'home cancels sensor sequence');
  }
  await b.shot('7.1.2-camera-advanced-phone');b.check();
  console.log('Camera advanced browser passed: guided pano, full sphere, Lens Blur/editor commit/discard, best/all burst, volume actions, lifecycle, phone and five languages.');
}finally{b.close();}
