import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const count=sel=>b.ev(`document.querySelectorAll(${JSON.stringify(sel)}).length`);
try{
 await b.language('en');
 // Five Play Store notifications (ungrouped) and the two first-boot ones: the Ranker bundles the five.
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));const now=Date.now();
   d.notifications=[...['Drive','Maps','YouTube','Hangouts','Calendar'].map((a,i)=>({id:100+i,app:'play-store',appName:'Google Play Store',color:'#0f9d58',icon:'assets/sui-ic_android.svg',title:a,text:'Successfully installed',time:now-i*60000})),...(d.notifications||[])];
   localStorage.setItem(key,JSON.stringify(d));window.__bundleReloadPending=true;location.reload();})()`);
 await b.until(`!window.__bundleReloadPending && document.querySelector('#screen')?.classList.contains('view-home')`);
 assert.equal(await count('#status-bar .ngsb-note'),3,'one icon for the bundle');
 await b.drag('#status-bar',0,700);await sleep(800);
 assert.equal(await count('.ngsh-stack > .ngnt-group'),1,'one bundle');
 assert.equal(await count('.ngnt-group .ngnt-hybrid'),5,'first row: five lines (system expanded)');
 await b.shot('7.1.2-bundle');
 await b.click('.ngnt-group');await sleep(300);
 assert.equal(await count('.ngnt-group.open .ngnt-row.child'),5,'expanded children');
 await b.shot('7.1.2-bundle-expanded');
 await b.click('.ngnt-group.open .ngnt-row.child');await sleep(500);
 assert.equal((await b.save()).notifications.filter(n=>n.app==='play-store').length,4,'a child opens and goes');
 await b.drag('#status-bar',0,700);await sleep(800);
 assert.equal(await count('.ngsh-stack > .ngnt-group'),1,'still a bundle of four');
 await b.drag('.ngsh-stack > .ngnt-group',300,0);await sleep(800);
 assert.equal((await b.save()).notifications.filter(n=>n.app==='play-store').length,0,'swiping the bundle dismisses all');
 b.check();console.log('Bundles passed: autobundle at four, one status icon, system-expanded lines, expand, child open, swipe all.');
}catch(error){await b.shot('7.1.2-bundles-failure');throw error;}finally{b.close();}
