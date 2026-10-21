import assert from 'node:assert/strict';
import {nougat} from './ng-harness.mjs';
const b=await nougat();
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
try{
 await b.language('en');await b.open('device-policy');assert.ok((await text('#viewport .ngdm')).includes('There is no Google Apps for Business'));assert.equal(await b.ev(`getComputedStyle(document.querySelector('#viewport .ngdm-bar')).backgroundColor`),'rgb(58, 163, 219)');await b.shot('7.1.2-dmagent');
 await b.act('ngdm-add');await b.until(`document.querySelector('#screen').classList.contains('view-settings')`);
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('device-policy');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('device-policy');assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));b.check();console.log('Device Policy passed: no work account page, Add account to Settings, five languages and phone width.');
}catch(error){await b.shot('7.1.2-dmagent-failure');throw error;}finally{b.close();}
