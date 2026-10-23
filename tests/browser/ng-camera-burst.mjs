import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
try{
 await b.ev(`(()=>{const m=NG.module('camera'),f=m.mount;m.mount=(c,r)=>{window.cameraTestContext=c;f(c,r)};})()`);await b.open('camera');await sleep(500);
 const mouse=(type,x,y,buttons)=>b.send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons,clickCount:type==='mouseMoved'?0:1});
 const rect=sel=>b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 const tap=async sel=>{const r=await rect(sel);await mouse('mousePressed',r.x,r.y,1);await mouse('mouseReleased',r.x,r.y,0);await sleep(100);};
 await b.ev(`NG.setAppPref(cameraTestContext,'camera','pref_smartburst_classicburst',false)`);
 let r=await rect('#viewport .ngcm-shutter');await mouse('mousePressed',r.x,r.y,1);await b.until(`!!cameraTestContext.ui.camera.burst`);await sleep(1600);await mouse('mouseReleased',r.x,r.y,0);await sleep(250);
 let photos=(await b.save()).photos,stack=photos.filter(p=>p.burst),auto=photos.at(-1);assert.ok(stack.length>8);assert.equal(auto.burstCreation.type,'animation');
 await tap('#viewport [data-action="ngcm-thumb"]');await b.until(`document.querySelector('#viewport .ngbu-grid')`);
 assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngbu-grid').length`),3,'best/all/creations sections');
 await b.shot('7.1.2-camera-burst-desktop');
 await tap('#viewport .ngbu-circle');assert.equal(await b.ev(`document.querySelector('#viewport .ngbu-toolbar').classList.contains('selecting')`),true);
 await tap('#viewport [data-action="ngbu-delete"]');assert.equal((await b.save()).photos.filter(p=>p.burst&&!p.trashedAt).length,stack.length-1);
 for(const type of ['collage','animation','video','photo_booth']){
  await tap('#viewport [data-action="ngbu-menu"]');await tap(`#viewport [data-action="ngbu-create"][data-type="${type}"]`);
  assert.equal((await b.save()).photos.at(-1).burstCreation.type,type);
  if(type==='animation'||type==='video'){await tap('#viewport [data-action="ngbu-play"]');await sleep(250);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngbu-full svg')`),true);}
  await tap('#nav-bar [data-key="back"]');await sleep(200);
 }
 await tap('#viewport .ngbu-cell [data-action="ngbu-photo"]');await tap('#viewport [data-action="ngbu-edit"]');await b.until(`document.querySelector('#viewport .ngphotos-edittools')`);
 await b.open('camera');await tap('#viewport [data-action="ngcm-thumb"]');await b.until(`document.querySelector('#viewport .ngbu-grid')`);
 await tap('#viewport .ngbu-cell [data-action="ngbu-photo"]');await tap('#viewport [data-action="ngbu-share"]');await sleep(400);assert.equal(await b.ev(`!!document.querySelector('#overlay-root .ngin')`),true);await tap('#nav-bar [data-key="back"]');
  // A multi-frame selection leaves as SEND_MULTIPLE: Hangouts has no such filter, so it drops out of the chooser.
 const chooser=()=>b.ev(`[...document.querySelectorAll('#overlay-root [data-action="ngin-pick"]')].map(x=>x.dataset.id)`);
 await tap('#viewport [data-action="ngbu-share"]');await sleep(400);assert.equal((await chooser()).includes('hangouts'),true);await tap('#nav-bar [data-key="back"]');await tap('#nav-bar [data-key="back"]');await b.until(`document.querySelector('#viewport .ngbu-grid')`);
 const picks=await b.ev(`[...document.querySelectorAll('#viewport [data-action="ngbu-select"]')].slice(0,2).map(x=>x.dataset.id)`);assert.equal(picks.length,2);
 for(const id of picks)await tap(`#viewport [data-action="ngbu-select"][data-id="${id}"]`);await tap('#viewport [data-action="ngbu-share"]');await sleep(400);const multi=await chooser();assert.equal(multi.includes('hangouts'),false);assert.equal(multi.includes('gmail'),true);await tap('#nav-bar [data-key="back"]');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('camera');await tap('#viewport [data-action="ngcm-thumb"]');await b.until(`document.querySelector('#viewport .ngbu-grid')`);await tap('#viewport [data-action="ngbu-menu"]');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.shot('7.1.2-camera-burst-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);b.check();console.log('Burst editor passed: auto creation, best/all sections, selection/deletion, four creation types, playback, edit/share, phone and five languages.');
}finally{b.close();}
