import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const click=a=>b.click(`#viewport [data-action="ngphotos-${a}"]`);
const back=()=>b.click('#nav-bar [data-key="back"]');
const confirm=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
try {
 await b.open('photos');await click('start');await click('start');
 assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngphotos-cell').length`),4);
 assert.equal(await b.ev(`Math.abs(document.querySelector('#viewport .ngphotos').getBoundingClientRect().height-document.querySelector('#viewport').getBoundingClientRect().height)<1`),true,'Photos fills the app window');
 await b.shot('7.1.2-photos-grid');
 await b.click('#viewport .ngphotos-cell[data-id="1"]');
 assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('no-status')`),true);
 await click('info');await b.ev(`(()=>{const i=document.querySelector('.ngphotos-caption');i.value='Lake at sunset';i.dispatchEvent(new Event('change',{bubbles:true}));})()`);
 assert.equal((await b.save()).photos.find(p=>p.id===1).caption,'Lake at sunset');await back();
 await click('edit');await b.click('[data-action="ngphotos-tool"][data-tool="adjustments"]');await click('auto');
 await b.click('[data-action="ngphotos-tool"][data-tool="crop"]');await click('rotate');
 await b.drag('#viewport .ngphotos-cropbox i:last-child',-25,-15);await click('save');
 assert.equal((await b.save()).photos.find(p=>p.id===1).edits.turn,3);
 assert.ok((await b.save()).photos.find(p=>p.id===1).edits.crop[2]<1,'free crop is saved');
 await click('delete');await confirm();
 assert.ok((await b.save()).photos.find(p=>p.id===1).trashedAt);
 assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngphotos-cell').length`),3);
 await click('undo');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngphotos-cell').length`),4);
 await click('create');await b.click('[data-action="ngmenu-item"][data-index="0"]');
 await b.click('#viewport .ngphotos-cell[data-id="1"]');await b.click('#viewport .ngphotos-cell[data-id="2"]');await click('picked');
 await b.ev(`(()=>{const i=document.querySelector('#overlay-root input');i.value='Weekend trip';i.dispatchEvent(new Event('input',{bubbles:true}));})()`);await confirm();
 assert.equal((await b.save()).photoLibrary.albums[0].name,'Weekend trip');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngphotos-cell').length`),2);
 await back();await b.click('[data-action="ngphotos-tab"][data-tab="albums"]');
 assert.equal(await b.ev(`!!document.querySelector('[data-action="ngphotos-album"]')`),true);
 await b.click('[data-action="ngphotos-album"]');await b.click('.ngphotos-cell[data-id="1"]');await click('delete');await confirm();
 await b.open('camera');await b.click('[data-action="ngcm-shutter"]');await b.click('[data-action="ngcm-thumb"]');
 assert.equal(await b.ev(`!!document.querySelector('#viewport .ngphotos-full')`),true,'Camera thumbnail opens Photos');
 await b.open('home');await b.open('photos');
 // Reset to the Photos root using its bottom tab or the internal Back stack.
 for(let i=0;i<5&&!await b.ev(`!!document.querySelector('#viewport .ngphotos-tabs')`);i++)await back();
 await click('drawer');await b.click('[data-action="ngphotos-dest"][data-page="trash"]');
 assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngphotos-cell').length`),1);
 await b.click('#viewport .ngphotos-cell');await click('restore');
 assert.equal((await b.save()).photos.filter(p=>p.trashedAt).length,0);
 await b.open('photos','photo:1');await click('edit');await b.click('[data-action="ngphotos-filter"][data-look="1"]');await back();
 assert.equal(await b.ev(`!!document.querySelector('#overlay-root [role="dialog"]')`),true,'unsaved edit confirmation');await confirm();
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
 await b.shot('7.1.2-photos-viewer-phone');
 assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 for(const lang of ['en','hu','de','fr','es']){
   await b.language(lang);await b.open('photos');
   for(const tab of ['photos','assistant','albums'])await b.click(`[data-action="ngphotos-tab"][data-tab="${tab}"]`);
   await click('drawer');await b.click('[data-action="ngphotos-dest"][data-page="settings"]');
   await b.click('[data-action="ngphotos-pref"][data-key="backup"]');
   assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: missing Photos strings`);
 }
 await b.open('phone');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngph') && !document.querySelector('#viewport .ngphotos')`),true,'Phone stylesheet stays separate from Photos');
 await sleep(300);b.check();
 console.log('Photos browser checks passed: onboarding, library, details, nondestructive edit, trash/undo/restore, albums, Camera integration, mobile and five languages.');
}catch(error){await b.shot('7.1.2-photos-failure');throw error;}finally{b.close();}
