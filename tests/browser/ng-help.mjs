import assert from 'node:assert/strict';
import {nougat} from './ng-harness.mjs';
const b=await nougat(),back=()=>b.click('#nav-bar [data-key="back"]');
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const menu=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#overlay-root .ngmenu-item')].find(el=>el.textContent===${JSON.stringify(label)});el?.click();return !!el;})()`),true,label);
try{
 await b.language('en');await b.open('calculator');await b.open('help','calculator');assert.ok((await text('#viewport .nghp')).includes('Calculator Help'));await b.shot('7.1.2-help');
 await b.ev(`(()=>{const f=document.querySelector('#viewport .nghp-search');f.querySelector('input').value='history';f.requestSubmit();})()`);assert.ok((await text('#viewport .nghp-console')).includes('No results found.'));await back();assert.equal(await b.ev(`!!document.querySelector('#viewport .nghp-none')`),false);
 await b.click('#viewport .nghp-overflow');await menu('Version info');assert.ok((await text('#overlay-root')).includes('Version 7.1.1'));await b.click('#overlay-root [data-action="ngdlg-button"]');
 await b.act('nghp-feedback');assert.ok((await text('#viewport .nghp-fb')).includes('nexus6p.demo@gmail.com'));await b.act('nghp-send');await b.until(`document.querySelector('.ngtoast')?.textContent.includes('Write your feedback before sending.')`);await b.ev(`(()=>{const e=document.querySelector('#viewport .nghp-text');e.value='The history list is great';e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await b.shot('7.1.2-feedback');await b.act('nghp-send');await b.until(`document.querySelector('.ngtoast')?.textContent.includes('Sending feedback')`);
 for(const app of ['play-store','gmail','settings','maps','youtube']){await b.open('help',app);assert.ok(await b.ev(`!!document.querySelector('#viewport .nghp-card')`),app);}
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('help','gmail');await b.click('#viewport .nghp-overflow');await b.ev(`document.querySelector('#overlay-root .ngmenu-item').click()`);await b.click('#overlay-root [data-action="ngdlg-button"]');await b.act('nghp-feedback');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('help','drive');assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));b.check();console.log('Help passed: per-app help console, search, version info, feedback validation and send, callers, five languages and phone width.');
}catch(error){await b.shot('7.1.2-help-failure');throw error;}finally{b.close();}
