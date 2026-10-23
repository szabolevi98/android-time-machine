import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const titles=()=>b.ev(`[...document.querySelectorAll('#viewport .ngst-pref .ngst-title,#viewport .ngst-cat')].map(x=>x.textContent)`);
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);
try{
 await b.language('en');
 // Sound › Emergency broadcasts opens CellBroadcastReceiver's own settings, without developer options.
 await b.open('settings','xml:sound_settings');await row('Emergency broadcasts');await sleep(300);
 assert.equal(await b.ev(`!!document.querySelector('#screen .ng-missing')`),false);
 assert.deepEqual(await titles(),['Emergency alert settings','Show extreme threats','Show severe threats','Show AMBER alerts','Alert reminder','Vibrate']);
 await row('Alert reminder');assert.deepEqual(await b.ev(`[...document.querySelectorAll('#overlay-root .ngst-choice')].map(x=>x.textContent.trim())`),['Once','Every 2 minutes','Every 15 minutes','Off']);
 await b.ev(`[...document.querySelectorAll('#overlay-root .ngst-choice')][2].click()`);await sleep(300);assert.match(await b.ev(`document.querySelector('#viewport').textContent`),/Every 15 minutes/);
 await row('Show extreme threats');assert.equal(await b.ev(`[...document.querySelectorAll('#viewport .ngst-pref')].find(x=>x.textContent.includes('Show severe threats')).classList.contains('disabled')`),true,'severe follows extreme');
 // With developer options the ETWS and developer categories and the two extra alert rows appear.
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.settings.devOptions=true;localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);await b.until(`document.querySelector('#screen')?.classList.contains('view-home')`);
 await b.open('settings','xml:sound_settings');await row('Emergency broadcasts');await sleep(300);
 const all=await titles();for(const t of ['Turn on notifications','Speak alert message','ETWS settings','Show ETWS test broadcasts','Developer options','Show CMAS test broadcasts','Show opt-out dialog'])assert.ok(all.includes(t),t);assert.ok(!all.includes('Settings for Brazil'));
 await b.shot('7.1.2-cell-broadcast');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('settings','xml:sound_settings');await b.ev(`[...document.querySelectorAll('#viewport .ngst-pref')].find(x=>x.dataset.key==='cell_broadcast_settings')?.click()`);await sleep(300);assert.deepEqual(await b.ev('[...AndroidStrings.misses]'),[],lang);}
 b.check();console.log('Cell broadcast settings passed: native rows without/with developer options, reminder intervals, severe dependency, five languages.');
}catch(e){await b.shot('7.1.2-cell-broadcast-failure');throw e;}finally{b.close();}
