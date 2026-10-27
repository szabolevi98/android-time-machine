// Round seven, option 2, package 6: store choices, local parental PIN, cancel-install races and game preferences.
import assert from 'node:assert/strict';
import {marshmallow,sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
for(const [version,start,p] of [['6.0.1',marshmallow,'mm'],['7.1.2',nougat,'ng']].filter(([v])=>!process.argv[2]||v===process.argv[2])){
 const b=await start(),key=`android-time-machine-${p}-v1`;
 const tap=async(label,scope='#screen')=>{const q=`[...document.querySelectorAll('${scope} button')].filter(x=>x.offsetParent).find(x=>(x.querySelector('.${p}st-title')?.textContent||x.textContent).trim()===${JSON.stringify(label)})`;await b.until(`!!(${q})`);await b.ev(`(${q}).click()`);await sleep(150);};
 const input=async(sel,value)=>b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
 const seed=async fn=>{await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${key}'));(${fn})(d);localStorage.setItem('${key}',JSON.stringify(d));window.__ngReloadPending=true;location.reload()})()`);await b.until(`!window.__ngReloadPending&&document.querySelector('#screen')?.classList.contains('view-home')`);};
 const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
 const storePrefs=async()=>{await b.open('play-store');await b.click('[data-action="mmps-drawer"]');await b.click('[data-action="mmps-dpage"][data-k="settings"]');};
 try{
  await b.language('en');
  for(const width of [1280,390]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
   if(p==='mm'){
    await seed(`d=>{d.play={installed:[],searches:['old search']};}`);await storePrefs();
    for(const [resource,index,key,value] of [['auto_update_label',2,'auto-update-mode','wifi'],['download_settings_label',1,'download-mode','ask'],['purchase_auth_settings_label',2,'purchase-auth','never']]){
     await tap(await b.ev(`MM.text('appprefs').t('Phonesky/${resource}')`));await b.click(`#overlay-root [data-action="mmdlg-item"][data-index="${index}"]`);assert.equal((await b.save()).appPrefs.play[key],value);
    }
    await tap(await b.ev("MM.text('appprefs').t('Phonesky/clear_local_history_title')"));assert.deepEqual((await b.save()).play.searches,[]);
    await tap(await b.ev("MM.text('appprefs').t('Phonesky/content_filtering_label')"));await b.click('[data-action="mmpsp-toggle"]');await input('#overlay-root input','123');assert.equal(await b.ev("document.querySelector('#overlay-root [data-action=mmdlg-button][data-index=\"1\"]').disabled"),true);await tap('Cancel','#overlay-root');assert.ok(!(await b.save()).play.contentEnabled);
    await b.click('[data-action="mmpsp-toggle"]');await input('#overlay-root input','1234');await tap('OK','#overlay-root');await input('#overlay-root input','1234');await tap('OK','#overlay-root');assert.ok((await b.save()).play.contentEnabled);
    await b.click('[data-action="mmpsp-level"]');await b.click('#overlay-root [data-action="mmdlg-item"][data-index="0"]');assert.equal((await b.save()).play.contentLevel,0);await b.click('[data-action="mmpsp-back"]');
    await tap(await b.ev("MM.text('appprefs').t('Phonesky/content_filtering_label')"));await input('#overlay-root input','9999');await tap('OK','#overlay-root');assert.equal(await b.ev("document.querySelector('#screen').classList.contains('view-app-prefs')"),true);
    await seed(`d=>{}`);assert.equal((await b.save()).appPrefs.play['auto-update-mode'],'wifi');assert.ok((await b.save()).play.contentEnabled);
    await b.open('play-store','details:robot-rally');await b.click('[data-action="mmps-install"]');await b.click('[data-action="mmps-cancel"]');await sleep(4300);assert.ok(!(await b.save()).play.installed.includes('robot-rally'));
    // Cancel inside the last install delay: an old callback must not install a canceled/restarted task.
    await b.click('[data-action="mmps-install"]');await b.until("/Installing/.test(document.querySelector('#viewport .mmps-dl')?.textContent||'')");await b.click('[data-action="mmps-cancel"]');await sleep(1200);assert.ok(!(await b.save()).play.installed.includes('robot-rally'));
    await b.click('[data-action="mmps-install"]');await b.until("JSON.parse(localStorage.getItem('android-time-machine-mm-v1')).play.installed.includes('robot-rally')");assert.equal((await b.save()).play.installed.filter(x=>x==='robot-rally').length,1);
   }else{
    await seed(`d=>{d.games={tutorial:true,profile:{tag:'NexusPlayer',discoverable:true,visible:true},gotIt:true,searches:[],prefs:{mutedGames:['robot-rally']}};}`);
    await b.open('play-games');await b.click('#viewport [data-action="ng-menu"]');await tap('Settings','#overlay-root');
    await b.click('[data-action="ngpg-pref-public"]');await tap('Stay public','#overlay-root');assert.equal((await b.save()).games.profile.visible,true);
    await b.click('[data-action="ngpg-pref-public"]');await tap('Hide','#overlay-root');assert.equal((await b.save()).games.profile.visible,false);
    for(const key of ['multi','quests','requests','friends']){await b.click(`[data-action="ngpg-pref-${key}"]`);assert.equal((await b.save()).games.prefs[key],false);}
    await b.click('[data-action="ngpg-pref-unmute"]');await tap('Cancel','#overlay-root');assert.equal((await b.save()).games.prefs.mutedGames.length,1);await b.click('[data-action="ngpg-pref-unmute"]');await tap('Unmute','#overlay-root');assert.deepEqual((await b.save()).games.prefs.mutedGames,[]);
    await seed(`d=>{}`);assert.equal((await b.save()).games.profile.visible,false);assert.equal((await b.save()).games.prefs.multi,false);await b.open('play-games');await b.click('#viewport [data-action="ng-menu"]');await tap('Settings','#overlay-root');assert.match(await text('#viewport .ngpg-prefnote'),/No games muted yet/);
   }
   await sleep(500);await b.shot(`${version}-package6-${width}`);console.log(`ok package 6 ${version} ${width}`);
  }
  b.check();
 }catch(e){await b.shot(`${version}-package6-failed`);console.error(b.errors);throw e;}finally{b.close();}
}
