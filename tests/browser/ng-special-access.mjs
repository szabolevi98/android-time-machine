import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);
const btn=async n=>{await b.click(`#overlay-root [data-action="ngdlg-button"][data-index="${n}"]`);await sleep(150);};
const missing=()=>b.ev(`!!document.querySelector('#screen .ng-missing')`),dialog=()=>b.ev(`document.querySelector('#overlay-root')?.textContent.replace(/\\s+/g,' ').trim()||''`);
const switches=()=>b.ev(`[...document.querySelectorAll('#viewport .ngst-pref')].map(r=>r.querySelector('.ngst-title').textContent+':'+(r.querySelector('.ngst-switch.on')?1:0)+(r.disabled?'d':''))`);
const save=()=>b.save();
try{
 await b.language('en');
 await b.open('settings','xml:special_access');
 // ManagedServiceSettings: Google VR Services' notification listener, Allow after the warning, off after the friendly one.
 await row('Notification access');assert.equal(await missing(),false);assert.deepEqual(await switches(),['Google VR Services:0']);
 await row('Google VR Services');assert.match(await dialog(),/Allow notification access for Google VR Services\?/);await btn(0);assert.deepEqual(await switches(),['Google VR Services:0'],'Deny keeps it off');
 await row('Google VR Services');await btn(1);assert.deepEqual(await switches(),['Google VR Services:1']);
 await back();await sleep(300);
 // ZenAccessSettings: Camera is granted by config_defaultDndAccessPackages, VR Services now approved through notification access.
 await row('Do Not Disturb access');assert.deepEqual(await switches(),['Camera:1','Google VR Services:1d']);
 assert.equal(await b.ev(`[...document.querySelectorAll('#viewport .ngst-summary')].map(x=>x.textContent).join()`),'Must stay turned on because notification access is on');
 await row('Camera');assert.match(await dialog(),/Revoke access to Do Not Disturb for Camera\?/);await btn(1);assert.deepEqual(await switches(),['Camera:0','Google VR Services:1d']);
 await row('Camera');assert.match(await dialog(),/Allow access to Do Not Disturb for Camera\?/);await btn(1);assert.deepEqual(await switches(),['Camera:1','Google VR Services:1d']);
 await back();await sleep(300);
 await row('Notification access');await row('Google VR Services');assert.match(await dialog(),/Do Not Disturb access may also be turned off/);await btn(1);assert.deepEqual(await switches(),['Google VR Services:0']);await back();await sleep(300);
 await row('VR helper services');assert.deepEqual(await switches(),['Google VR Services:0']);await row('Google VR Services');assert.match(await dialog(),/Allow VR service access for Google VR Services\?/);await btn(1);assert.deepEqual(await switches(),['Google VR Services:1']);await row('Google VR Services');assert.deepEqual(await switches(),['Google VR Services:0'],'off needs no dialog');await back();await sleep(300);
 await row('Premium SMS access');assert.equal(await b.ev(`document.querySelector('#viewport .ngsa-empty')?.textContent`),'No installed apps have requested Premium SMS access');await back();await sleep(300);
 // Device administrators: Android Device Manager, active while Google settings' remote lock and erase is on.
 await row('Device administrators');assert.equal(await missing(),false);assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngsa-admin').length`),1);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngsa-admin .ngst-check.on')`),true);
 await b.click('#viewport [data-action="ngsa-admin"]');await sleep(300);assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngsa-policy small').length`),0,'an active admin lists its policies without descriptions');
 assert.match(await b.ev(`document.querySelector('#viewport .ngsa-warning').textContent`),/This administrator is active/);await b.shot('7.1.2-device-admin-active');
 await b.click('#viewport [data-action="ngsa-admin-act"]');await sleep(300);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngsa-admin .ngst-check.on')`),false);assert.equal((await save()).gms.wipe,false);
 await b.click('#viewport [data-action="ngsa-admin"]');await sleep(300);assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngsa-policy small').length`),3);await b.shot('7.1.2-device-admin-add');
 await b.click('#viewport [data-action="ngsa-admin-cancel"]');await sleep(300);assert.equal((await save()).gms.wipe,false,'Cancel changes nothing');
 // Google settings' switch turned on asks with DeviceAdminAdd and Activate grants it.
 await b.open('settings','gms-security');await b.ev(`[...document.querySelectorAll('#viewport [data-action="ngms-toggle"]')].find(x=>x.dataset.k==='wipe').click()`);await sleep(300);
 assert.equal(await b.ev(`!!document.querySelector('#viewport .ngsa-add')`),true);await b.click('#viewport [data-action="ngsa-admin-act"]');await sleep(300);assert.equal((await save()).gms.wipe,true);
 // Security's rows and Device info's IMEI row reach their screens.
 await b.open('settings','xml:security');for(const label of ['Device administrators','User credentials']){await row(label);await sleep(200);assert.equal(await missing(),false,label);await back();await sleep(300);}
 // TrustedCredentialsSettings: the image's 156 system CAs sorted as CertHolder names them; a row's dialog disables after asking.
 await row('Trusted credentials');assert.equal(await missing(),false);assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngsa-ca').length`),156);
 const names=await b.ev(`[...document.querySelectorAll('#viewport .ngsa-ca1')].map(x=>x.textContent)`);assert.deepEqual(names,[...names].sort((a,b)=>a.toLowerCase().localeCompare(b.toLowerCase(),'en')));
 await b.click('#viewport .ngsa-ca');await sleep(200);assert.match(await dialog(),/Security certificate.*Issued to:.*SHA-256 fingerprint:/);await b.shot('7.1.2-trusted-credential');
 await btn(0);assert.match(await dialog(),/Disable the system CA certificate\?/);await btn(1);assert.equal(await b.ev(`!!document.querySelector('#viewport .ngsa-ca .ngst-switch:not(.on)')`),true);assert.equal((await save()).settings.access.caDisabled.length,1);
 await b.click('#viewport .ngsa-ca');await sleep(200);await btn(0);assert.match(await dialog(),/Enable the system CA certificate\?/);await btn(1);assert.equal((await save()).settings.access.caDisabled.length,0);
 await b.click('#viewport [data-action="ngsa-ctab"][data-tab="1"]');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngsa-ca').length`),0);await back();await sleep(300);
 await b.open('settings','xml:device_info_status');await row('IMEI information');await sleep(200);assert.equal(await missing(),false,'IMEI');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);for(const s of ['notification-access','zen-access','vr-listeners','premium-sms','device-admins','device-admin','trusted-credentials'])await b.open('settings',s);await b.click('#viewport .ngsa-ca');assert.deepEqual(await b.ev('[...AndroidStrings.misses]'),[],lang);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('settings','device-admin');await b.shot('7.1.2-device-admin-phone');assert.equal(await b.ev('document.documentElement.scrollWidth<=innerWidth+1'),true);
 b.check();console.log('Special access passed: notification access, Do Not Disturb access, VR helpers, premium SMS, device administrators with Google settings, IMEI, five languages and phone width.');
}catch(e){await b.shot('7.1.2-special-access-failure');throw e;}finally{b.close();}
