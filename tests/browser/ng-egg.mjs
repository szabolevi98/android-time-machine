import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
// A test action on the neko module hands the test the context the modules get.
const withC=code=>b.ev(`(()=>{const mod=NG.module('neko'),action=mod.action;mod.action=function(name,el,e,c){if(name==='ngegg-test'){(${code})(c);c.render();return true;}return action.call(this,name,el,e,c);};})()`).then(()=>b.act('ngegg-test'));
try{
 await b.language('en');
 // java.util.Random as Cat.java uses it: seed 42's first next(32) is Java's well-known -1170105035, so nextInt(1000) gives 130, then 763.
 assert.deepEqual(await b.ev(`(()=>{const r=NG.neko.JRandom(42);return [r.nextInt(1000),r.nextInt(1000)];})()`),[130,763]);
 await b.open('settings','xml:device_info_settings');await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport [data-key="firmware_version"]')][0];el.click();el.click();el.click();})()`);await b.until(`document.querySelector('#screen').classList.contains('view-platlogo')`);await sleep(1400);await b.shot('7.1.2-platlogo');
 for(let i=0;i<5;i++)await b.click('#viewport .ngegg-logo');
 await b.ev(`document.querySelector('#viewport .ngegg-logo').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);await sleep(700);assert.equal((await b.save()).neko.tile,true);await b.until(`document.querySelector('.ngtoast.plain')?.textContent==='\u{1F431}'`);
 assert.ok(await b.ev(`NG.qsTiles.available({data:JSON.parse(localStorage.getItem('android-time-machine-ng-v1'))}).includes('neko')`));
 await b.open('neko');await withC(`c=>{c.data.settings.qsTiles=[...(c.data.settings.qsTiles||NG.qsTiles.DEFAULT),'neko'];NG.qsCustom.neko.click(c,{refresh(){},close(){}});}`);await sleep(400);assert.equal(await b.ev(`document.querySelectorAll('#overlay-root .ngegg-food').length`),4);await b.shot('7.1.2-neko-food');await b.click('#overlay-root .ngdlg-item[data-index="1"]');let s=(await b.save()).neko;assert.equal(s.food,2);assert.ok(s.jobAt>Date.now()+20*60000&&s.jobAt<Date.now()+40*60000);
 assert.equal(await b.ev(`NG.qsTiles.state({data:JSON.parse(localStorage.getItem('android-time-machine-ng-v1')),lang:'en'},'neko').label`),'Fish');
 await withC(`c=>{c.data.neko.jobAt=Date.now()-1;}`);await b.until(`JSON.parse(localStorage.getItem('android-time-machine-ng-v1')).neko.cats.length===1`);s=(await b.save());assert.equal(s.neko.food,0);const note=s.notifications.find(n=>n.app==='neko');assert.equal(note.title,'A cat is here.');assert.ok(/^Cat #\d+$/.test(note.text));
 await b.open('neko');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngegg-cat').length`),1);await b.shot('7.1.2-neko-land');
 await b.click('#viewport .ngegg-cat');await b.ev(`(()=>{const f=document.querySelector('#overlay-root input');f.value='Pixel';f.dispatchEvent(new Event('input',{bubbles:true}));})()`);await b.click('#overlay-root [data-action="ngdlg-button"]');assert.equal((await b.save()).neko.cats[0].name,'Pixel');
 await b.ev(`document.querySelector('#viewport .ngegg-cat').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);await sleep(700);assert.ok(await b.ev(`!!document.querySelector('#viewport .ngegg-context')`));await b.click('#viewport [data-action="ngegg-share"]');await b.until(`!!document.querySelector('#overlay-root .ngin, #overlay-root [class*="share"], #overlay-root .ngdlg')`);assert.ok((await b.save()).photos.some(p=>p.album==='cats'&&p.markup.includes('<svg')));
 await b.open('neko');await b.ev(`document.querySelector('#viewport .ngegg-cat').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);await sleep(700);await b.click('#viewport [data-action="ngegg-delete"]');assert.ok((await text('#overlay-root')).includes('Forget Pixel?'));await b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');assert.equal((await b.save()).neko.cats.length,0);
 b.check();console.log('Easter egg passed: java.util.Random, PlatLogo taps and long press enabling the Neko tile, food dialog and job interval, a cat arriving with its notification, NekoLand rename/share/forget.');
}catch(error){await b.shot('7.1.2-egg-failure');throw error;}finally{b.close();}
