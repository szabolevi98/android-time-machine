import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const confirm=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
const input=(selector,value)=>b.ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});el.value=${JSON.stringify(value)};el.dispatchEvent(new Event('input',{bubbles:true}));})()`);
const clear=async id=>{await b.open('settings','app-storage:'+id);await b.click('#viewport [data-action="ngap-cleardata"]');await confirm();};
try{
 await b.language('en');
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.documents.nodes.push({id:'reset-audio',parent:'download',name:'Reset audio.mp3',type:'audio',duration:120000});d.appPrefs={...d.appPrefs,music:{'auto-cache':false}};d.driveFiles=[{id:'reset-drive',name:'Keep.pdf',type:'pdf',size:1024,offline:true,previewCached:1}];localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);
 await b.until(`document.querySelector('#screen')?.classList.contains('view-home')`);
 const providers=await b.save();
 await b.open('chrome','url:https://www.android.com/');await b.act('ngcr-accept');await b.act('ngcr-no');
 await clear('chrome');let freshChrome=(await b.save()).chrome;assert.equal(freshChrome.fre,0);assert.deepEqual(freshChrome.bookmarks,[]);assert.deepEqual(freshChrome.log,[]);await b.open('chrome');assert.equal((await b.save()).settings.stoppedApps.includes('chrome'),false);
 // Cancel leaves the player alone. Confirm drops its queue/preferences and its ongoing notification.
 await b.open('play-music','track:reset-audio');await sleep(1200);assert.equal((await b.save()).music.playing,true);
 await b.open('settings','app-storage:play-music');await b.click('#viewport [data-action="ngap-cleardata"]');await b.click('#overlay-root [data-action="ngdlg-button"][data-index="0"]');assert.equal((await b.save()).music.playing,true);
 await b.click('#viewport [data-action="ngap-cleardata"]');await confirm();await sleep(1500);let d=await b.save();assert.equal(d.settings.appCleared['play-music'].data,true);assert.equal(d.music?.playing||false,false);assert.equal(d.music?.queue.length||0,0);assert.equal(d.appPrefs.music,undefined);assert.equal(d.notifications.some(n=>n.app==='play-music'),false);assert.ok(d.documents.nodes.some(n=>n.id==='reset-audio'));assert.equal(await b.ev(`document.querySelector('#viewport [data-action="ngap-cleardata"]').disabled`),true);
 await b.open('play-music');assert.equal((await b.save()).settings.stoppedApps.includes('play-music'),false);assert.equal((await b.save()).music?.playing||false,false);
 // Force stop the Store before its simulated PackageInstaller job completes; no late installation can land.
 await b.open('play-store','app:trail-notes');await b.act('ngps-install',{id:'trail-notes'});await b.open('settings','app:play-store');await b.click('#viewport [data-action="ngap-stop"]');await confirm();await sleep(7200);d=await b.save();assert.equal(Object.keys(d.playStore.jobs).length,0);assert.equal(d.playStore.installed.includes('trail-notes'),false);assert.equal(await b.ev(`!!NG.appsData['demo-trail-notes']`),false);
 // Clear cache keeps offline files; Clear data removes their private offline/cache flags and keeps the cloud file.
 await b.open('settings','app-storage:drive');await b.click('#viewport [data-action="ngap-clearcache"]');d=await b.save();assert.equal(d.driveFiles[0].offline,true);assert.equal(d.driveFiles[0].previewCached,1);await b.click('#viewport [data-action="ngap-cleardata"]');await confirm();d=await b.save();assert.equal(d.driveFiles[0].name,'Keep.pdf');assert.equal(d.driveFiles[0].offline,undefined);assert.equal(d.driveFiles[0].previewCached,undefined);
 // A scheduled Hangouts demo answer is cancelled even though the conversation survives as a service record.
 await b.open('hangouts','chat:1');await input('#viewport .ngho-field','Clear before the reply');await b.act('ngho-send');const sent=(await b.save()).hangouts.threads[0].messages.length;
 await clear('hangouts');await sleep(5000);d=await b.save();assert.equal(d.hangouts.threads[0].messages.length,sent);assert.equal(d.notifications.some(n=>n.app==='hangouts'),false);assert.deepEqual(d.hangouts.drafts,{});
 await b.open('hangouts','chat:1');await sleep(1300);d=await b.save();assert.equal(d.hangouts.threads[0].messages.length,sent);assert.equal(d.hangouts.threads[0].messages.at(-1).status,undefined,'delivery resumes on explicit launch');
 // Shared providers and Settings itself are protected from another app's Clear data.
 for(const id of ['contacts','messenger','calendar','photos','documents'])await clear(id);
 d=await b.save();for(const key of ['contacts','sms','events','photos'])assert.deepEqual(d[key],providers[key],key);assert.ok(d.documents.nodes.some(n=>n.id==='reset-audio'));
 await b.open('settings','app-storage:settings');assert.equal(await b.ev(`document.querySelector('#viewport [data-action="ngap-cleardata"]').disabled`),true);
 await b.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await b.open('settings','app-storage:play-music');await b.shot('7.1.2-app-data-cleared');
 for(const lang of ['hu','de','fr','es']){await b.language(lang);await b.open('settings','app-storage:play-music');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('App data passed: cancel/clear, Music stop, Store job cancellation, Drive cache/offline scope, late Hangouts reply cancellation/resume, shared providers, protected Settings, phone and five languages.');
}catch(error){await b.shot('7.1.2-app-data-failure');throw error;}finally{b.close();}
