import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),click=a=>b.click(`#viewport [data-action="nggoogle-${a}"]`),back=()=>b.click('#nav-bar [data-key="back"]');
const input=async(q)=>b.ev(`(()=>{const f=document.querySelector('#viewport .nggoogle-query');f.value=${JSON.stringify(q)};f.dispatchEvent(new Event('input',{bubbles:true}));})()`);
const submit=()=>b.ev(`document.querySelector('#viewport [data-form="nggoogle-query"]').requestSubmit()`);
const edit=async()=>{if(!await b.ev(`!!document.querySelector('#viewport .nggoogle-query')`))await click('edit');};
const yes=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
try {
 await b.language('en');await b.open('search');
 assert.ok(await b.ev(`document.querySelectorAll('#viewport .nggoogle-card').length`)>=3);
 assert.equal(await b.ev(`document.querySelector('#viewport [data-card="weather"]').textContent.includes('Partly cloudy')`),true);
 await click('units');assert.equal((await b.save()).google.units,'f');await click('units');
 await b.click('#viewport [data-card="weather"] [data-action="nggoogle-card-menu"]');await b.click('#overlay-root [data-action="ngmenu-item"][data-index="0"]');assert.equal(await b.ev(`!!document.querySelector('#viewport [data-card="weather"]')`),false);
 await click('drawer');await click('customize');await b.click('#overlay-root [data-action="ngdlg-item"][data-index="1"]');assert.equal(await b.ev(`!!document.querySelector('#viewport [data-card="weather"]')`),true);
 await edit();await input('Alex');assert.ok(await b.ev(`document.querySelectorAll('#viewport [data-action="nggoogle-contact"]').length`)>0);
 await click('contact');assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('view-contacts')`),true);assert.equal(await b.ev(`document.querySelector('#viewport').textContent.includes('Alex Morgan')`),true);
 await b.open('search');await edit();await input('Android Nougat');await submit();
 assert.equal((await b.save()).google.history[0],'Android Nougat');assert.ok(await b.ev(`document.querySelectorAll('#viewport .nggoogle-result').length`)>1);
 await b.shot('7.1.2-google-results');await click('url');assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('view-chrome')`),true);
 await b.open('search');await edit();await input('android nougat');await submit();assert.equal((await b.save()).google.history.length,1,'search history de-duplicates case variants');
 await b.click('#viewport [data-action="nggoogle-tab"][data-tab="websearch_images"]');assert.equal(await b.ev(`document.querySelectorAll('#viewport .nggoogle-images svg').length`),4);await b.click('#viewport [data-action="nggoogle-photo"]');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngphotos-canvas')`),true);
 await b.open('search','voice');await click('query');assert.equal((await b.save()).google.history[0],'Weather in Riverside');
 // Google reminders and Calendar share the same saved events.
 await click('drawer');await click('reminders');await click('reminder-add');await b.ev(`(()=>{const d={title:'Buy concert tickets',date:'2027-01-21',start:'18:30',where:'Riverside'};for(const f of document.querySelectorAll('.nggoogle-reminderedit input')){f.value=d[f.dataset.field];f.dispatchEvent(new Event('input',{bubbles:true}));}})()`);await yes();
 let reminder=(await b.save()).events.find(e=>e.title==='Buy concert tickets');assert.ok(reminder?.task);await click('reminder-toggle');assert.equal((await b.save()).events.find(e=>e.id===reminder.id).done,true);
 await b.click('[data-action="nggoogle-remindertab"][data-tab="done"]');assert.equal(await b.ev(`document.querySelector('.nggoogle-reminder b').textContent`),'Buy concert tickets');
 await click('reminder-edit');await b.click('#overlay-root [data-action="ngdlg-button"][data-index="0"]');assert.equal((await b.save()).events.some(e=>e.id===reminder.id),false);
 await b.open('home-settings');assert.equal(await b.ev(`document.querySelector('#viewport .ngst-abtitle').textContent`),'Settings');await b.click('[data-action="ngap-pref"][data-p="1"]');assert.equal((await b.save()).launcherPredictions,false);await back();
 await b.open('home');await b.act('ng-key',{key:'assist'});assert.equal(await b.ev(`!!document.querySelector('.nggoogle-assist-panel')`),true);await b.click('[data-action="nggoogleassist-accept"]');assert.equal((await b.save()).google.assistOptIn,true);await b.click('[data-action="nggoogleassist-search"]');assert.equal(await b.ev(`!!document.querySelector('#viewport .nggoogle-result')`),true);
 for(const lang of ['en','hu','de','fr','es']) {
  await b.language(lang);await b.open('search');await click('drawer');await click('settings');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngap')`),true);
  for(const path of ['1','2','3','4','5','6','7','8','9','10','11','12']) {await b.click(`[data-action="ngap-pref"][data-p="${path}"]`);await back();}
  assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: missing Google strings`);
  await b.open('search');assert.equal(await b.ev(`document.querySelector('#viewport').textContent.includes('own:')`),false);
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('search');await sleep(350);await b.shot('7.1.2-google-now-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 await b.open('home');await b.act('ngh-search');assert.equal(await b.ev(`!!document.querySelector('#viewport .nggoogle-query')`),true,'launcher search opens Google editor');
 await b.click('.ngboard [data-gb="voice"]');await click('query');assert.equal(await b.ev(`document.querySelector('#viewport .nggoogle-query').value`),'Weather in Riverside','voice input also returns within the Google activity');
 await sleep(300);b.check();console.log('Google browser checks passed: Now/weather, dismissal/restore, contacts, history, Chrome/photos, voice samples, shared reminder CRUD, launcher settings, screen search, native settings, five languages and phone width.');
}catch(error){await b.shot('7.1.2-google-failure');throw error;}finally{b.close();}
