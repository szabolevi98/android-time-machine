import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);
const btn=n=>b.click(`#overlay-root [data-action="ngdlg-button"][data-index="${n}"]`);
const pin=async()=>{for(const d of '1234')await b.click(`[data-action="ngbo-digit"][data-d="${d}"]`);await b.click('[data-action="ngbo-enter"]');await sleep(400);};
try{
 await b.language('en');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('settings','smartlock');for(const to of ['smartlock-body','smartlock-places','smartlock-devices'])await b.act('ngsl-go',{to,t:'auth_trust_agent_pref_trusted_devices_title'});
  await b.act('ngsl-face');for(const a of ['ngsl-face-next','ngsl-face-enroll'])await b.act(a);await sleep(800);await b.act('ngsl-face-cancel');await b.act('ngsl-face-licenses');
  assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 await b.language('en');
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.settings.lock={type:'pin',secret:'1234'};localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);
 await b.until(`document.querySelector('#screen')?.classList.contains('view-lock') || document.querySelector('#screen')?.classList.contains('view-home')`);
 // Settings › Security › Smart Lock asks for the screen lock first.
 await b.open('settings','xml:security');await row('Smart Lock');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngbo')`),true,'bouncer first');await pin();
 await b.until(`document.querySelector('#viewport')?.textContent.includes('On-body detection')`);
 for(const s of ['Trusted places','Trusted devices','Trusted face','Trusted voice'])assert.ok((await text('#viewport')).includes(s),s);
 await sleep(500);await b.shot('7.1.2-smartlock');
 // On-body detection: the "Keep in mind" dialog turns it on; the agent then keeps the phone unlocked.
 await row('On-body detection');await sleep(500);assert.ok(await b.ev(`!!document.querySelector('#viewport .ngsl-onbody img')`));await b.act('ngsl-body');assert.ok((await text('#overlay-root')).includes('Keep in mind'));await btn(1);assert.equal((await b.save()).smartLock.onBody,true);
 await sleep(500);await b.shot('7.1.2-smartlock-onbody');await back();
 // Trusted places: add one, a duplicate is refused.
 await row('Trusted places');await row('Add trusted place');await b.ev(`(()=>{const [n,a]=document.querySelectorAll('#overlay-root input');n.value='Office';n.dispatchEvent(new Event('input'));a.value='1 Main St';a.dispatchEvent(new Event('input'));})()`);await btn(1);
 assert.deepEqual((await b.save()).smartLock.places.map(p=>p.name),['Office']);assert.ok((await text('#viewport')).includes('Office'));await back();
 assert.ok((await text('#viewport')).includes('Office'),'places summary');
 // Trusted face: FaceLock's intro, instructions, enrollment (10 frames), end.
 await row('Trusted face');assert.ok(await b.ev(`document.querySelector('#screen').classList.contains('under-status')`),'under the status bar');assert.ok((await text('#viewport .ngsl-title')).includes('About trusted face'));await sleep(500);await b.shot('7.1.2-smartlock-face-intro');
 await b.act('ngsl-face-next');assert.ok((await text('#viewport .ngsl-title')).includes('Add a trusted face'));
 await b.act('ngsl-face-enroll');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngsl-enroll .ngsl-ring')`));await sleep(3000);await b.shot('7.1.2-smartlock-face-enroll');
 await b.until(`document.querySelector('#viewport .ngsl-enroll.done')`,10000);assert.equal((await b.save()).smartLock.face,true);await sleep(400);await b.shot('7.1.2-smartlock-face-added');
 await b.until(`document.querySelector('#viewport .ngsl-title')?.textContent.includes('All set!')`,4000);await b.shot('7.1.2-smartlock-face-end');
 await b.act('ngsl-face-licenses');assert.ok((await text('#overlay-root')).includes('STLport'));await btn(0);await b.act('ngsl-face-done');
 assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('under-status')`),false);assert.ok((await text('#viewport')).includes('Device will unlock when face is recognized'),'trusted face summary');
 // Improve face matching: AddToSetup → enrollment → back to Smart Lock.
 await row('Trusted face');await b.click('#overlay-root .ngdlg-item[data-index="0"]');assert.ok((await text('#viewport .ngsl-title')).includes('Improve face matching'));await b.act('ngsl-face-enroll');
 await b.until(`document.querySelector('#viewport')?.textContent.includes('On-body detection')`,12000);
 // Locking again: the screen lock's first use since boot armed the agents, so the lock icon is open and no bouncer comes.
 await b.click('#power-button');await sleep(500);await b.click('#power-button');await b.until(`document.querySelector('#screen')?.classList.contains('view-lock')`);
 assert.ok((await b.ev(`document.querySelector('.nglk-lock img')?.getAttribute('src')||''`)).includes('lock_open'),'trusted: open lock icon');
 b.check();console.log('Smart Lock passed: bouncer first, list, on-body detection, trusted places, Trusted face setup and improve flows, licenses.');
}catch(error){await b.shot('7.1.2-smartlock-failure');throw error;}finally{b.close();}
