// Release gate: the shared used-phone demo, old saves, every launcher app and
// every extracted preference screen in all five languages, desktop and phone.
// --landing writes the release's screen-only JPEG (no browser/phone frame).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const expose=async()=>{await b.ev(`NG.register('release-probe',{render:c=>{window.__release=c;return ''}})`);await b.open('release-probe');};
const home=async()=>{await b.act('ng-key',{key:'home'});await sleep(350);};
const reload=async()=>{await b.ev(`window.__releaseReload=true;location.reload()`);await b.until(`!window.__releaseReload&&document.querySelector('#screen')?.classList.contains('view-home')`);};
try{
 await b.language('en');await expose();let data=await b.save();
 assert.deepEqual(data.contacts.map(x=>[x.name,x.phone,x.email]),[
  ['Alex Morgan','202-555-0148','alex@example.com'],['Sam Rivera','202-555-0192','sam@example.com'],['Taylor Lee','202-555-0116','taylor@example.com'],['Mom','202-555-0107','mom@example.com']]);
 assert.equal(data.contacts[3].starred,true);assert.deepEqual(data.contacts[3].groups,['family']);assert.deepEqual(data.contacts[0].groups,['friends']);
 assert.deepEqual(data.calls.map(x=>[x.type,x.duration]),[['incoming',754],['missed',0],['outgoing',132]]);
 assert.match(data.sms[0].messages.map(x=>x.text).join(' '),/coffee tomorrow.*See you at 11/);assert.match(data.sms[1].messages[0].text,/call this weekend/);
 assert.deepEqual(data.notifications.map(x=>x.own),['demo_welcome','demo_message']);assert.deepEqual(data.notifications[1].open,['messenger','conv:1']);
 assert.equal(data.mail.length,5);assert.equal(data.events.length,4);assert.equal(data.events[0].title,'Coffee with Alex');assert.equal(data.events[0].start,'11:00');
 assert.ok(data.clock.alarms.some(x=>x.h===7&&x.m===0&&x.on));assert.equal(data.photos.length,4);assert.equal(data.photos[3].kind,'pano');assert.equal(data.settings.wifiSsid,'Home Network');
 await b.ev(`NG.hangoutsModel.state(__release);__release.save()`);assert.match((await b.save()).hangouts.threads[0].messages[0].text,/photos from the hike/);
 await b.open('chrome');await b.ev(`__release.save()`);assert.equal((await b.save()).chrome.bookmarks.length,3);await home();assert.equal(await b.ev(`!!__release.data.home.pages[0].find(x=>x.w==='digital')`),true);
 // Older saves acquire only missing modules; user edits and provider data survive twice.
 await b.ev(`(()=>{const d=__release.data;d.contacts[0].name='Alex saved';d.settings.bluetooth=false;delete d.home;delete d.clockWidget;delete d.notifications;__release.save()})()`);
 for(let i=0;i<2;i++){await reload();data=await b.save();assert.equal(data.contacts[0].name,'Alex saved');assert.equal(data.settings.bluetooth,false);assert.equal(data.notifications.length,2);assert.equal(data.clockWidget,true);assert.ok(data.home.pages[0].some(x=>x.w==='digital'));assert.deepEqual(await b.ev(`AndroidState.problems`),[]);}
 let appCount=0,prefCount=0;
 for(const lang of ['en','hu','de','fr','es']){
  await b.language(lang);await expose();
  const report=await b.ev(`(async()=>{const c=__release,out={apps:0,prefs:0,missing:[],placeholders:[]},wait=ms=>new Promise(r=>setTimeout(r,ms));
   const check=where=>{if(document.querySelector('#screen .ng-missing'))out.missing.push(where);if(/%([0-9]+[$])?[sd](?![a-z])/.test(document.querySelector('#viewport').innerText))out.placeholders.push(where);};
   for(const id of Object.keys(NG.appsData).filter(id=>NG.module(id))){c.home();c.open(id);await wait(70);out.apps++;check(id);if(c.ui.overlay)c.closeOverlay();}
   for(const [id,app] of Object.entries(NG.appPrefsXml)){for(const xml of Object.keys(app.xml)){if(c.ui.overlay)c.closeOverlay();c.ui.appPrefs=null;c.transition('none');NG.openPrefs(c,id,xml);await wait(30);out.prefs++;check(id+':'+xml);}}
   c.home();out.misses=[...AndroidStrings.misses];return out})()`);
  assert.deepEqual(report.missing,[],lang+' unfinished screens');assert.deepEqual(report.placeholders,[],lang+' raw format strings');assert.deepEqual(report.misses,[],lang+' missing resource keys');appCount+=report.apps;prefCount+=report.prefs;
 }
 await b.language('en');await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await home();assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);await b.open('settings');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);await home();
 await b.shot('7.1.2-release-phone');
 if(process.argv.includes('--landing')){
  // Reset the disposable profile for a fresh demo, leaving the user's browser untouched.
  await b.ev(`localStorage.removeItem('android-time-machine-ng-v1')`);await reload();await b.send('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});await home();await b.act('ngh-cling');await sleep(500);
  const r=await b.ev(`(()=>{const r=document.querySelector('#screen').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,scale:720/r.width}})()`);
  const shot=await b.send('Page.captureScreenshot',{format:'jpeg',quality:92,clip:r});fs.writeFileSync('versions/7.1.2/assets/landing-home.jpg',Buffer.from(shot.result.data,'base64'));
 }
 b.check();console.log(`Nougat release gate: demo data, two old-save reloads, ${appCount} app openings and ${prefCount} preference screens across five languages, phone width passed`);
}catch(e){await b.shot('7.1.2-release-failure');throw e;}finally{b.close();}
