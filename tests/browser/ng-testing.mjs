import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const dial=async code=>{await b.open('phone');await b.act('ngph-fab');await sleep(300);for(const k of code)await b.act('ngph-key',{k});await sleep(400);};
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);
try{
 await b.language('en');
 // *#06#: the IMEI dialog; the digits clear.
 await dial('*#06#');assert.ok((await text('#overlay-root')).includes('IMEI'));assert.ok((await text('#overlay-root')).includes('867981020754412'));
 await b.shot('7.1.2-dialer-imei');await b.click('#overlay-root [data-action="ngdlg-button"]');
 // *#07#: the regulatory labels.
 await dial('*#07#');assert.ok((await text('#overlay-root')).includes('Regulatory labels'));await b.click('#overlay-root [data-action="ngdlg-button"]');
 // *#*#4636#*#*: Testing.
 await dial('*#*#4636#*#*');await sleep(400);assert.ok(await b.ev(`document.querySelector('#screen').classList.contains('view-settings')`));assert.ok((await text('#viewport')).includes('Phone information'));
 await b.shot('7.1.2-testing');
 await row('Phone information');await sleep(400);const ri=await text('#viewport .ngts');assert.ok(ri.includes('IMEI:')&&ri.includes('867981020754412')&&ri.includes('Voice Service:'),ri.slice(0,200));
 await b.act('ngts-ping');await sleep(1500);assert.ok((await text('#viewport .ngts')).includes('Pass'),'ping');await b.shot('7.1.2-radio-info');
 await b.act('ngts-toggle',{k:'power'});assert.ok((await text('#viewport .ngts')).includes('Radio Off'),'radio power changes service');
 await b.act('ngts-toggle',{k:'power'});assert.ok((await text('#viewport .ngts')).includes('In Service'));
 await b.ev(`(()=>{const el=document.querySelector('#viewport .ngts-input');el.value='+36123456789';el.dispatchEvent(new Event('input'));})()`);
 await b.act('ngts-smsc-update');await b.ev(`(()=>{const el=document.querySelector('#viewport .ngts-input');el.value='discard';el.dispatchEvent(new Event('input'));})()`);await b.act('ngts-smsc-refresh');assert.equal(await b.ev(`document.querySelector('#viewport .ngts-input').value`),'+36123456789');
 await b.click('#viewport .ng-overflow');await b.click('#overlay-root [data-action="ngmenu-item"][data-index="4"]');assert.ok((await text('#overlay-root')).includes('IMS Registration:'));await b.click('#nav-bar [data-key="back"]');
 await b.click('#viewport .ng-overflow');await b.click('#overlay-root [data-action="ngmenu-item"][data-index="0"]');await b.click('#overlay-root [data-action="ngdlg-item"][data-index="1"]');assert.ok((await text('#overlay-root')).includes('[Europe] Successful'));await b.click('#overlay-root [data-action="ngdlg-button"]');
 await b.click('#viewport .ng-overflow');await b.click('#overlay-root [data-action="ngmenu-item"][data-index="1"]');assert.ok((await text('#viewport')).includes('No contacts on your SIM card.'));await b.click('#nav-bar [data-key="back"]');await sleep(500);
 await b.click('#nav-bar [data-key="back"]');await sleep(800);
 await row('Usage statistics');await sleep(400);assert.ok((await text('#viewport .ngts-usage')).includes('Sort by:'));assert.ok((await b.save()).usageStats.phone.time>0,'measured foreground time');await b.click('#nav-bar [data-key="back"]');await sleep(800);
 await row('Wi-Fi information');await sleep(400);await row('Wi-Fi status');await sleep(400);assert.ok((await text('#viewport .ngts')).includes('Supplicant state:'));await b.click('#nav-bar [data-key="back"]');await sleep(800);
 await row('Wi-Fi config');await sleep(400);assert.ok((await text('#viewport .ngts')).includes('Home Network'));await b.click('#nav-bar [data-key="back"]');await sleep(800);
 await row('Wi-Fi API');await sleep(400);await row('getConnectionInfo');await sleep(200);assert.ok((await text('#overlay-root')).includes('SSID'));
 await b.click('#overlay-root [data-action="ngdlg-button"]');await row('disableNetwork');await b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');assert.equal((await b.save()).settings.wifiSsid,'Home Network','blank input must not disable network zero');
 await row('disableNetwork');await b.ev(`(()=>{const el=document.querySelector('#overlay-root input');el.value='0';el.dispatchEvent(new Event('input'));})()`);await b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');assert.equal((await b.save()).settings.wifiSsid,'');
 await row('enableNetwork');await b.ev(`(()=>{const el=document.querySelector('#overlay-root input');el.value='0';el.dispatchEvent(new Event('input'));})()`);await b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');await sleep(2800);assert.equal((await b.save()).settings.wifiSsid,'Home Network');
 await row('getConnectionInfo');assert.ok((await text('#overlay-root')).includes('Net ID: 0'));await b.click('#overlay-root [data-action="ngdlg-button"]');
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.open('settings','radio-info');await b.shot('7.1.2-testing-phone');
 for(const lang of ['hu','de','fr','es']){await b.language(lang);for(const s of ['xml:testing_settings','radio-info','usage-stats','wifi-status-test','wifi-config-info','wifi-api-test'])await b.open('settings',s);assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('Testing passed: *#06#, *#07#, *#*#4636#*#*, Phone information with ping, Usage statistics, Wi-Fi status/config/API, languages.');
}catch(error){await b.shot('7.1.2-testing-failure');throw error;}finally{b.close();}
