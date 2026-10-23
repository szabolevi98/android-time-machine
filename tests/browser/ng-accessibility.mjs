import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const back=async()=>{await b.click('#nav-bar [data-key="back"]');await sleep(320);};
const tap=async selector=>{
 await b.ev(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center'})`);await sleep(100);
 const pos=await b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();return r&&{x:r.x+r.width/2,y:r.y+r.height/2}})()`);assert.ok(pos,selector);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...pos,button:'left',buttons:1,clickCount:1});await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...pos,button:'left',buttons:0,clickCount:1});await sleep(330);
};
const pref=async key=>{
 const selector=await b.ev(`(()=>{const c=__ax,n=NG.appPrefsXml[c.ui.appPrefs.stack.at(-1).app].xml[c.ui.appPrefs.stack.at(-1).xml],find=(n,k)=>n.key===k?n:(n.c||[]).map(x=>find(x,k)).find(Boolean);const el=[...document.querySelectorAll('#viewport [data-action="ngap-pref"]')].find(el=>{let q=n;for(const p of c.ui.appPrefs.stack.at(-1).path)q=find(q,p);for(const i of el.dataset.p.split('.'))q=q.c[+i];return q.key===${JSON.stringify(key)}});return el&&'[data-action="ngap-pref"][data-p="'+el.dataset.p+'"]'})()`);assert.ok(selector,key);await tap('#viewport '+selector);
};
const dialog=()=>b.ev(`document.querySelector('#overlay-root .ngdlg-win')?.innerText||''`);
const btn=i=>tap(`#overlay-root [data-action="ngdlg-button"][data-index="${i}"]`);
const key=async(code,key,modifiers=0)=>{await b.send('Input.dispatchKeyEvent',{type:'keyDown',code,key,modifiers,windowsVirtualKeyCode:key.length===1?key.toUpperCase().charCodeAt(0):code==='Enter'?13:0});await b.send('Input.dispatchKeyEvent',{type:'keyUp',code,key,modifiers});};
async function settings(service){await b.open('settings','a11y:'+service);await tap('#viewport [data-action="ng-menu"]');await tap('#overlay-root [data-action="ngmenu-item"]');}
async function expose(){await b.ev(`NG.register('ax-probe',{render:c=>{window.__ax=c;return ''}})`);await b.open('ax-probe');}
try{
 await b.language('en');await expose();await settings('a11y_talkback');
 assert.match(await b.ev(`document.querySelector('#viewport').innerText`),/Speech volume/);
 await pref('pref_speech_volume');await tap('#overlay-root [data-action="ngdlg-item"][data-index="2"]');assert.equal((await b.save()).appPrefs.talkback.pref_speech_volume,'50');
 await pref('pref_tutorial');assert.match(await dialog(),/TalkBack Disabled/);await btn(0);
 await pref('pref_category_manage_gestures');await pref('pref_shortcut_up');await tap('#overlay-root [data-action="ngdlg-item"][data-index="0"]');assert.ok((await b.save()).appPrefs.talkback.pref_shortcut_up);await back();
 await pref('pref_explore_by_touch_reflect');assert.match(await dialog(),/Disable Explore by touch/);await btn(0);assert.equal((await b.save()).appPrefs.talkback.pref_explore_by_touch_reflect,undefined);
 await pref('pref_category_developer');await pref('pref_dump_a11y_event');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngst-check').length`),25);await tap('#viewport [data-action="ng-menu"]');await tap('#overlay-root [data-action="ngmenu-item"][data-index="0"]');assert.equal(Object.entries((await b.save()).appPrefs.talkback).filter(([k,v])=>k.startsWith('pref_dump_event_')&&v).length,25);await tap('#viewport [data-action="ng-menu"]');await tap('#overlay-root [data-action="ngmenu-item"][data-index="1"]');assert.equal(Object.entries((await b.save()).appPrefs.talkback).filter(([k,v])=>k.startsWith('pref_dump_event_')&&v).length,0);await back();await back();
 await pref('pref_category_manage_keyboard_shortcut_key');
 await pref('keycombo_shortcut_navigate_next');assert.match(await dialog(),/Press key combination/);await key('KeyJ','j',3);await btn(1);assert.deepEqual((await b.save()).appPrefs.talkback['classic_keymap:keycombo_shortcut_navigate_next'],[4098,38]);
 await pref('pref_reset_keymap');await btn(0);assert.ok((await b.save()).appPrefs.talkback['classic_keymap:keycombo_shortcut_navigate_next']);await pref('pref_reset_keymap');await btn(1);assert.equal((await b.save()).appPrefs.talkback['classic_keymap:keycombo_shortcut_navigate_next'],undefined);
 await pref('pref_select_keymap');await tap('#overlay-root [data-action="ngdlg-item"][data-index="1"]');assert.equal((await b.save()).appPrefs.talkback.pref_select_keymap,'default_keymap');await back();
 await pref('pref_manage_labels');assert.match(await b.ev(`document.querySelector('#viewport').innerText`),/currently no custom labels/);await tap('#viewport [data-action="ngax-label-export"]');
 const imported={labels_array:[{package_name:'com.android.chrome',package_signature:'demo',view_name:'button',label_text:'My label',locale:'en',package_version:1,timestamp:1}]};
 await b.ev(`NG.documents.create(__ax,'download','labels.json','json',${JSON.stringify(JSON.stringify(imported))})`);
 await tap('#viewport [data-action="ngax-label-import"]');await tap('#viewport [data-action="ngdocs-root"][data-root="download"]');await tap('#viewport .ngdocs-item');await btn(2);assert.equal((await b.save()).accessibilityLabels.length,1);
 await tap('#viewport [data-action="ngax-label-export"]');assert.equal((await b.save()).documents.nodes.filter(n=>n.type==='json').length,2);
 await tap('#viewport [data-action="ngax-label-revert"]');assert.equal((await b.save()).accessibilityLabels.length,0);
 await b.open('settings','a11y:a11y_talkback');await tap('#viewport [data-action="nga1-toggle"]');await btn(1);await settings('a11y_talkback');await pref('pref_tutorial');
 assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngax-lesson').length`),5);await tap('#viewport [data-action="ngax-lesson"][data-lesson="0"][data-page="0"]');assert.match(await b.ev(`document.querySelector('.ngax-tutorial').innerText`),/Part 1/);await tap('#viewport [data-action="ngax-part"][data-step="1"]');await b.shot('7.1.2-talkback-tutorial');
 await tap('#viewport [data-action="ngax-tutorial-home"]');await tap('#viewport [data-action="ngax-lesson"][data-lesson="2"][data-page="0"]');assert.equal(await b.ev(`document.querySelector('.ngax-arrow img').src.endsWith('tb-down-right-arrow.png')`),true);await tap('#viewport [data-action="ngax-tutorial-menu"]');assert.match(await dialog(),/Read from top/);await btn(0);await tap('#viewport [data-action="ngax-tutorial-home"]');
 await tap('#viewport [data-action="ngax-lesson"][data-lesson="3"][data-page="0"]');assert.match(await b.ev(`document.querySelector('.ngax-reading').innerText`),/sample text/);await tap('#viewport [data-action="ngax-reading"]');assert.match(await dialog(),/Characters/);await tap('#overlay-root [data-action="ngdlg-item"][data-index="1"]');await tap('#viewport [data-action="ngax-tutorial-home"]');await tap('#viewport [data-action="ngax-lesson"][data-lesson="4"][data-page="0"]');assert.equal(await b.ev(`!!document.querySelector('.ngax-practice textarea')`),true);
 await settings('a11y_switch');await pref('pref_key_auto_scan_enabled');assert.equal((await b.save()).appPrefs.talkback.pref_key_auto_scan_enabled,true);await pref('pref_key_auto_scan_time_delay');await b.ev(`(()=>{const e=document.querySelector('#overlay-root input');e.value='2.5';e.dispatchEvent(new Event('input',{bubbles:true}))})()`);await btn(1);assert.equal((await b.save()).appPrefs.talkback.pref_key_auto_scan_time_delay,'2.5');
 await pref('pref_scanning_methods_key');assert.equal(await b.ev(`document.querySelectorAll('#overlay-root .ngdlg-item').length`),2);await back();await pref('pref_key_auto_scan_enabled');await pref('pref_scanning_methods_key');await tap('#overlay-root [data-action="ngdlg-item"][data-index="2"]');
 assert.equal(await b.ev(`document.querySelector('#viewport').innerText.includes('Primary scan style')`),false);await pref('pref_highlights_key');assert.match(await b.ev(`document.querySelector('#viewport').innerText`),/Option Scan Switch 5/);await back();
 await pref('pref_category_scan_mappings');await pref('pref_key_mapped_to_click');await key('Space',' ');await btn(1);assert.deepEqual((await b.save()).appPrefs.talkback.pref_key_mapped_to_click,[[0,62]]);await back();
 for(const lang of ['en','hu','de','fr','es']){
  await b.language(lang);await expose();for(const service of ['a11y_talkback','a11y_switch']){await settings(service);assert.equal(await b.ev(`!!document.querySelector('#screen .ng-missing')`),false);assert.equal(await b.ev(`/%([0-9]+\$)?[sd]/.test(document.querySelector('#viewport').innerText)`),false);}
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await settings('a11y_talkback');await b.shot('7.1.2-talkback-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 assert.deepEqual(await b.ev(`AndroidState.problems`),[]);assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[]);b.check();console.log('Nougat accessibility: native settings, tutorial, keymaps, labels, Switch Access, five languages and phone width passed');
}catch(e){await b.shot('7.1.2-accessibility-failure');throw e;}finally{b.close();}
