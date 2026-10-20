import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),click=a=>b.click(`#viewport [data-action="ngdocs-${a}"]`),back=()=>b.click('#nav-bar [data-key="back"]');
const menu=async label=>{await b.click('#viewport .ngdocs-more');assert.equal(await b.ev(`(()=>{const a=[...document.querySelectorAll('#overlay-root .ngmenu-item')].find(e=>e.textContent===${JSON.stringify(label)});a?.click();return !!a})()`),true,label);};
const confirm=()=>b.click('#overlay-root [data-action="ngdlg-button"][data-index="1"]');
try{
 await b.language('en');await b.open('documents');assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngdocs-item').length`),2);
 assert.equal(await b.ev(`Math.abs(document.querySelector('#viewport .ngdocs').clientHeight-document.querySelector('#viewport').clientHeight)<1`),true);
 await b.click('#viewport [data-id="file-1"]');assert.equal(await b.ev(`document.querySelector('.ngdocs-preview article').textContent.includes('Nougat')`),true);await back();
 await menu('New folder');await b.ev(`(()=>{const f=document.querySelector('#overlay-root input');f.value='Test folder';f.dispatchEvent(new Event('input',{bubbles:true}));})()`);await confirm();
 assert.equal((await b.save()).documents.nodes.some(n=>n.name==='Test folder'),true);
 await click('grid');assert.equal(await b.ev(`!!document.querySelector('#viewport .ngdocs-items.grid')`),true);
 await click('search');await b.ev(`(()=>{const f=document.querySelector('.ngdocs-search');f.value='Meetup';f.dispatchEvent(new Event('input',{bubbles:true}));})()`);assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngdocs-item').length`),1);await back();
 await sleep(350);await b.shot('7.1.2-documents');
 await b.open('gmail');
 // Complete Gmail's own first-run screens through their actions.
 for(let i=0;i<8&&!await b.ev(`!!document.querySelector('#viewport [data-action="nggm-compose"]')`);i++){
   const action=await b.ev(`document.querySelector('#viewport [data-action="nggm-tdone"],#viewport [data-action="nggm-setupdone"]')?.dataset.action`);
   assert.ok(action,'Gmail onboarding action');await b.act(action);
 }
 await b.click('#viewport [data-action="nggm-compose"]');await b.click('#viewport [data-action="nggm-attach"]');
 assert.equal(await b.ev(`!!document.querySelector('.ngdocs-drawer')`),true);
 await b.click('#viewport [data-action="ngdocs-root"][data-root="download"]');await b.click('#viewport [data-id="file-2"]');
 assert.equal(await b.ev(`!!document.querySelector('#viewport .nggm-attachment')`),true,'picker returns a Gmail attachment');
 await b.ev(`(()=>{for(const [key,value]of Object.entries({to:'alex@example.com',subject:'Slides attached',body:'Here you go!'})){const f=document.querySelector('[data-f="'+key+'"]');f.value=value;f.dispatchEvent(new Event('input',{bubbles:true}));}})()`);
 await b.click('#viewport [data-action="nggm-send"]');assert.equal((await b.save()).mail.at(-1).attachments[0].name,'Meetup-slides.pdf');
 await b.click('#viewport [data-action="nggm-compose"]');await b.click('#viewport [data-action="nggm-attach"]');await b.click('#viewport [data-action="ngdocs-root"][data-root="download"]');await b.click('#viewport [data-id="file-1"]');await b.click('#viewport [data-action="nggm-cback"]');
 const draft=(await b.save()).mail.find(m=>m.box==='drafts');assert.ok(draft?.attachments?.length,'attachment-only draft is saved');
 await b.act('nggm-open',{id:String(draft.id)});assert.equal(await b.ev(`!!document.querySelector('#viewport .nggm-attachment')`),true,'draft reopens with its attachment');
 await b.click('#viewport [data-action="nggm-remove-attachment"]');await b.click('#viewport [data-action="nggm-cback"]');assert.equal((await b.save()).mail.some(m=>m.id===draft.id),false,'empty resumed draft is removed');
 await b.open('files');assert.equal(await b.ev(`document.querySelector('#viewport .ngdocs-title').textContent`),'Nexus 6P');
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.shot('7.1.2-documents-phone');
 assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('documents');await click('drawer');for(const root of ['images','videos','audio','recent','download']){await b.click(`#viewport [data-action="ngdocs-root"][data-root="${root}"]`);await click('drawer');}await click('drawer');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang}: missing document strings`);}
 await sleep(300);b.check();console.log('Documents browser checks passed: Downloads, preview, folder creation, grid/search, Gmail attachment and send, Files, phone width and five languages.');
}catch(error){await b.shot('7.1.2-documents-failure');throw error;}finally{b.close();}
