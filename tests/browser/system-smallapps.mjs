// Round seven, option 2, package 5: the small system-app fixes, on desktop and phone widths.
import assert from 'node:assert/strict';
import {marshmallow,sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
for(const [version,start,p] of [['6.0.1',marshmallow,'mm'],['7.1.2',nougat,'ng']].filter(([v])=>!process.argv[2]||v===process.argv[2])){
 const b=await start(),key=`android-time-machine-${p}-v1`;
 const tap=async(label,scope='#screen')=>{const q=`[...document.querySelectorAll('${scope} button')].filter(x=>x.offsetParent).find(x=>(x.querySelector('.${p}st-title')?.textContent||x.textContent).trim()===${JSON.stringify(label)})`;await b.until(`!!(${q})`);await b.ev(`(${q}).click()`);await sleep(150);};
 const input=async(sel,value)=>b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
 const seed=async fn=>{await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${key}'));(${fn})(d);localStorage.setItem('${key}',JSON.stringify(d));window.__ngReloadPending=true;location.reload()})()`);await b.until(`!window.__ngReloadPending&&document.querySelector('#screen')?.classList.contains('view-home')`);};
 const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
 try{
  await b.language('en');
  for(const width of [1280,390]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
   if(p==='mm'){
    await seed(`d=>{((d.appPrefs||={}).camera||={}).pref_camera_grid_lines=false;d.photosOnboarded=true;d.photos=d.photos.filter(p=>p.id!==91&&p.source!==91);d.hangouts=JSON.parse(JSON.stringify(MM.defaults.hangouts));d.photos.push({id:91,kind:'video',duration:6000,seed:7,time:Date.now(),album:'camera'});d.docs=[{name:'Zebra.pdf',text:'Local PDF content <safe>',size:100,time:Date.now()},{name:'Alpha.pdf',text:'Alpha body',size:300,time:Date.now()-1000}];d.driveFiles=[{name:'Zebra',type:'doc',time:20},{name:'Alpha',type:'pdf',time:10},{name:'Restore me',type:'pdf',time:30,trashed:true}];d.yt={history:[1,2],searches:['nexus'],later:[],playlists:[]};d.maps={home:'',work:'',saved:[],history:false,areas:[],searches:[]};d.hangoutsPrefs={};}`);
    await b.open('camera');assert.equal(await b.ev('!!document.querySelector("#viewport .mmcm-grid")'),false);
    await b.click('[data-action="mmcm-modes"]');await b.click('[data-action="mmcm-settings"]');
    await tap(await b.ev("MM.text('appprefs').t('GoogleCamera/pref_camera_gridlines_title')"));await b.click('[data-action="mmpf-up"]');
    assert.equal(await b.ev('!!document.querySelector("#viewport .mmcm-grid")'),true);
    // Local video Edit opens Trim. Back preserves the original, Save creates a separate source-offset copy.
    await b.open('photos','photo:91');await b.click('[data-action="mmgp-edit"]');await input('[data-trim="start"]','1000');await b.click('[data-action="mmgp-vcancel"]');assert.equal((await b.save()).photos.find(x=>x.id===91).duration,6000);
    await b.click('[data-action="mmgp-edit"]');await input('[data-trim="start"]','1000');await input('[data-trim="end"]','4000');await b.click('[data-action="mmgp-vsave"]');
    let saved=await b.save(),copy=saved.photos.find(x=>x.source===91);assert.ok(copy);assert.equal(copy.duration,3000);assert.equal(copy.trimStart,1000);assert.equal(saved.photos.find(x=>x.id===91).duration,6000);
    await b.open('downloads');await b.click('#viewport [data-action="mm-menu"]');await tap('Sort by','#overlay-root');await b.click('#overlay-root [data-action="mmdlg-item"][data-index="0"]');
    assert.equal(await text('#viewport .mmsa-file b'),'Alpha.pdf');await b.click('#viewport .mmsa-file');assert.equal(await text('#viewport .mmsa-document'),'Alpha body');await b.click('[data-action="mmsa-view-back"]');
    // Sort settings persist after reloading; search results retain their original file identity.
    await seed(`d=>{}`);await b.open('downloads');assert.equal(await text('#viewport .mmsa-file b'),'Alpha.pdf');await b.click('[data-action="mmsa-missing"]');await input('.mmsa-q','Zebra');await b.click('#viewport .mmsa-file');assert.equal(await text('.mmsa-document'),'Local PDF content <safe>');
    await b.open('drive');await b.click('#viewport [data-action="mm-menu"]');await tap('Sort by','#overlay-root');await tap('Name','#overlay-root');assert.equal(await text('#viewport .mmgd-row span'),'Alpha');
    await b.click('[data-action="mmgd-drawer"]');await b.click('[data-action="mmgd-view"][data-v="menu_show_trash"]');await b.click('.mmgd-more');await tap('Restore','#overlay-root');assert.equal((await b.save()).driveFiles[2].trashed,false);
    await b.open('youtube');await b.click('[data-action="mmyt-menu"]');await tap('Settings','#overlay-root');await tap('Privacy');await tap('Clear watch history');await tap('Cancel','#overlay-root');assert.deepEqual((await b.save()).yt.history,[1,2]);await tap('Clear watch history');await tap('OK','#overlay-root');assert.deepEqual((await b.save()).yt.history,[]);await tap('Clear search history');await tap('OK','#overlay-root');assert.deepEqual((await b.save()).yt.searches,[]);
    await b.open('maps');await b.click('[data-action="mmmp-search"]');await input('.mmmp-input','park');await b.click('button[data-action="mmmp-place"][data-id="park"]');assert.equal((await b.save()).maps.searches[0].id,'park');
    await b.click('[data-action="mmmp-menu"]');await b.click('[data-action="mmmp-settings"]');await tap('Distance units');await tap('Miles','#overlay-root');await b.click('[data-action="mmpf-up"]');await b.click('[data-action="mmmp-route"]');await b.click('[data-action="mmmp-start"]');assert.match(await text('#viewport .mmmp-nav'),/ft|mi/);
    await b.open('maps');await b.click('[data-action="mmmp-navexit"]');await b.click('#nav-bar [data-key="back"]');await b.click('[data-action="mmmp-menu"]');await b.click('[data-action="mmmp-settings"]');await tap('Maps history');assert.match(await text('#viewport .mmmp-history'),/Riverside Park/);await b.click('[data-action="mmmp-historydel"]');assert.equal((await b.save()).maps.searches.length,0);
    await b.open('hangouts');await b.click('[data-action="mmho-drawer"]');await b.click('[data-action="mmho-item"][data-id="dnd"]');await b.click('#overlay-root [data-action="mmdlg-item"][data-index="1"]');assert.match(await text('.mmho-snooze'),/Notifications snoozed until/);await b.click('[data-action="mmho-resume"]');assert.equal((await b.save()).hangoutsPrefs.dndUntil,0);
    const id=await b.ev("document.querySelector('[data-action=mmho-open]').dataset.id");await b.click('[data-action="mmho-open"]');await b.click('[data-action="mmho-cmenu"]');await tap('Delete','#overlay-root');await tap('Cancel','#overlay-root');assert.ok((await b.save()).hangouts.some(x=>x.id===+id));await b.click('[data-action="mmho-cmenu"]');await tap('Delete','#overlay-root');await tap('Delete','#overlay-root');assert.ok(!(await b.save()).hangouts.some(x=>x.id===+id));
    if(width===1280)for(const mode of ['off','snoozed','on']){
     await seed(`d=>{d.hangouts=JSON.parse(JSON.stringify(MM.defaults.hangouts));d.hangoutsPrefs={chat_enabled:${mode!=='off'},dndUntil:${mode==='snoozed'?'Date.now()+3600000':'0'}};d.notifications=d.notifications.filter(n=>n.app!=='hangouts');}`);
     await b.open('hangouts');await b.click('[data-action="mmho-open"]');const before=(await b.save()).hangouts[0].messages.length;await input('.mmho-field','Notification gate '+mode);await b.click('[data-action="mmho-send"]');await b.click('#nav-bar [data-key="home"]');await sleep(5100);const data=await b.save();assert.equal(data.hangouts[0].messages.length,before+2);assert.equal(data.notifications.filter(n=>n.app==='hangouts').length,mode==='on'?1:0,'Hangouts notification gate '+mode);
    }
   }else{
    await b.open('photos','photo:1');await b.click('[data-action="ngphotos-more"]');await tap('Use as','#overlay-root');await b.until("document.querySelector('#screen').classList.contains('view-wallpapers')");assert.equal(await b.ev("!!document.querySelector('#viewport .ngwp-tile.selected.ngwp-current, #viewport .ngwp-tile.selected img[src^=\"data:image\"]')"),true);
    await b.click('[data-action="ngwp-back"]');await b.open('photos','photo:1');await b.click('[data-action="ngphotos-more"]');await tap('Print','#overlay-root');await b.until("document.querySelector('#screen').classList.contains('view-print-preview')");assert.ok(await b.ev("!!document.querySelector('#viewport svg')"));await b.click('#nav-bar [data-key="back"]');
   }
   await sleep(500);await b.shot(`${version}-package5-${width}`);console.log(`ok package 5 ${version} ${width}`);
  }
  b.check();
 }catch(e){await b.shot(`${version}-package5-failed`);console.error(b.errors);throw e;}finally{b.close();}
}
