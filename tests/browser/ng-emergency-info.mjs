import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),click=a=>b.click(`#viewport [data-action="ngeinfo-${a}"]`),back=()=>b.click('#nav-bar [data-key="back"]');
const yes=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
try{
 await b.open('emergency-info');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo-empty')`),true);
 await click('edit');assert.equal(await b.ev(`!!document.querySelector('#overlay-root [role="dialog"]')`),true);await yes();
 await b.click('#viewport [data-action="ngeinfo-field"][data-key="name"]');await b.ev(`(()=>{const f=document.querySelector('#overlay-root textarea');f.value='Nexus demo owner';f.dispatchEvent(new Event('input',{bubbles:true}));})()`);await yes();
 await b.click('#viewport [data-action="ngeinfo-field"][data-key="blood_type"]');await b.click('#overlay-root [data-action="ngdlg-item"][data-index="1"]');
 assert.ok((await b.save()).emergencyInfo.values.blood_type);
 await b.click('#viewport [data-action="ngeinfo-tab"][data-tab="contacts"]');await click('add');
 assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('view-contacts')`),true);
 await b.click('#viewport [data-action="ngct-pick"]');assert.equal((await b.save()).emergencyInfo.contacts.length,1);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo-person')`),true);
 await back();assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo.edit')`),false);
 await b.shot('7.1.2-emergency-info');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('emergency-info');await click('edit');await b.click('[data-action="ngeinfo-tab"][data-tab="info"]');await b.click('[data-action="ngeinfo-field"][data-key="organ_donor"]');await back();assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: missing emergency strings`);}
 // A secure saved phone requires the existing keyguard bouncer before medical information can be edited.
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.settings.lock={type:'pin',secret:'1234'};localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);
 await b.until(`document.querySelector('#screen')?.classList.contains('view-lock') || document.querySelector('#screen')?.classList.contains('view-home')`);
 await b.open('emergency-dialer');await b.click('[data-action="ngph-eact"]');await b.click('[data-action="ngph-eopen"]');await click('edit');
 assert.equal(await b.ev(`!!document.querySelector('#viewport .ngbo')`),true);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo.edit')`),false);
 await back();assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo')`),true,'cancel returns to the public information screen');
 await click('edit');for(const digit of '1234')await b.click(`[data-action="ngbo-digit"][data-d="${digit}"]`);await b.click('[data-action="ngbo-enter"]');
 assert.equal(await b.ev(`!!document.querySelector('#viewport .ngeinfo.edit')`),true,'correct PIN continues editing');
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.shot('7.1.2-emergency-info-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 await sleep(300);b.check();console.log('Emergency information browser checks passed: consent, fields/lists, Contacts picker, persistent data, five languages, protected editing, cancel and PIN continuation, phone width.');
}catch(error){await b.shot('7.1.2-emergency-info-failure');throw error;}finally{b.close();}
