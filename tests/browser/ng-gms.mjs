import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);
const ok=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
try{
 await b.language('en');await b.open('settings');await b.ev(`[...document.querySelectorAll('#viewport [data-action]')].find(e=>e.textContent.trim()==='Google').click()`);await sleep(400);
 assert.ok((await text('#viewport')).includes('Sign-in & security'));assert.ok((await text('#viewport')).includes('Smart Lock for Passwords'));await b.shot('7.1.2-gms');
 await row('Ads');assert.ok(/[0-9a-f]{8}-/.test(await text('#viewport .ngms-adid')));const id=(await b.save()).gms.adid;await row('Reset advertising ID');await ok();assert.notEqual((await b.save()).gms.adid,id);await row('Opt out of Ads Personalization');await ok();assert.equal((await b.save()).gms.adsOptOut,true);await back();
 await row('Data management');await row('Update Drive-enabled app files');await b.click('#overlay-root .ngdlg-item[data-index="1"]');assert.equal((await b.save()).gms.drive,'all');await back();
 await row('Location');await row('Google Location History');assert.ok((await text('#viewport .ngms-lh')).includes('nexus6p.demo@gmail.com'));await b.act('ngms-history');assert.equal((await b.save()).gms.history,true);await b.act('ngms-history');await ok();assert.equal((await b.save()).gms.history,false);await back();await back();
 await row('Security');await row('Allow remote lock and erase');assert.equal((await b.save()).gms.wipe,false);await back();
 await row('Set up nearby device');await b.act('ngms-device-search');await b.until(`document.querySelector('#viewport .ngms-device')?.textContent.includes('No nearby devices found')`);await back();
 await row('Smart Lock for Passwords');await row('Add app not to be saved');await b.click('#overlay-root .ngdlg-item[data-index="0"]');assert.equal((await b.save()).gms.neverSave.length,1);await back();
 await row('Connected apps');assert.ok((await text('#viewport')).includes('No apps are connected'));await back();
 await b.open('settings','location');await row('Google Location History');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngms-lh')`));
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('settings','location');await b.ev(`[...document.querySelectorAll('#viewport .ngst-pref')].at(-1).click()`);await sleep(300);for(const to of ['gms','gms-ads','gms-data','gms-location','gms-security','gms-device','gms-smartlock','gms-connected','gms-nearby'])await b.act('ngms-go',{to,t:'common_ads_settings_title'});assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('Google settings passed: account rows, Ads/reset/opt-out, Data management, Location and Location History, Security, nearby device search, Smart Lock never-save, Connected apps.');
}catch(error){await b.shot('7.1.2-gms-failure');throw error;}finally{b.close();}
