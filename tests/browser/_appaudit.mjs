import {nougat,sleep} from './ng-harness.mjs';import fs from 'node:fs';
const b=await nougat();
try{
 await b.language('en');
 await b.ev("NG.register('zz-audit',{render:c=>{window.__c=c;return ''}})");await b.open('zz-audit');
 await b.ev(`window.__aa={done:false,found:[],ph:[],at:''};(async()=>{
  const c=__c,wait=ms=>new Promise(r=>setTimeout(r,ms));c.factoryReset=()=>{};
  const apps=Object.keys(NG.appsData).filter(id=>NG.module(id)&&!['settings','phone','camera'].includes(id));
  const settle=async()=>{for(let i=0;i<6&&c.ui.overlay;i++){if(c.ui.overlay==='dialog')c.closeDialog?.();else c.closeOverlay();await wait(20);}};
  const check=(app,where,label)=>{const tx=(document.querySelector('#screen').innerText+' '+(document.querySelector('#overlay-root')?.innerText||'')).match(/%([0-9][$])?[sd](?![a-z])/);if(tx)__aa.ph.push({app,where,label,text:tx[0],around:(document.querySelector('#screen').innerText).slice(Math.max(0,(document.querySelector('#screen').innerText).indexOf(tx[0])-40),(document.querySelector('#screen').innerText).indexOf(tx[0])+40)});const m=document.querySelector('#screen .ng-missing');if(m)__aa.found.push({app,where,label,view:c.ui.view,missing:m.dataset.missing,detail:[...m.querySelectorAll('small')].map(x=>x.textContent).join(' / ')});return !!m;};
  for(const app of apps){__aa.at=app;
   await settle();c.open(app);await wait(80);check(app,'open','');
   const n=document.querySelectorAll('#viewport [data-action]').length;
   for(let i=0;i<Math.min(n,60);i++){await settle();c.open(app);await wait(40);const el=document.querySelectorAll('#viewport [data-action]')[i];if(!el)continue;const label=(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,40);
    try{el.click();}catch{}await wait(60);check(app,el.dataset.action,label);
    // an overflow menu: every item
    if(c.ui.overlay==='menu'){const items=document.querySelectorAll('#overlay-root [data-action]').length;for(let j=0;j<items;j++){await settle();c.open(app);await wait(30);const e2=document.querySelectorAll('#viewport [data-action]')[i];if(!e2)break;e2.click();await wait(50);const it=document.querySelectorAll('#overlay-root [data-action]')[j];if(!it)break;const l2=(it.textContent||'').trim().slice(0,40);try{it.click();}catch{}await wait(60);check(app,'menu',label+' > '+l2);}}
   }
   c.back?.();
  }
  __aa.done=true;})().catch(e=>{__aa.err=String(e);__aa.done=true;});0`);
 let out;for(let i=0;i<110;i++){await sleep(5000);out=await b.ev('JSON.parse(JSON.stringify(__aa))');if(out.done)break;}
 fs.writeFileSync(process.env.TEMP+'/appaudit.json',JSON.stringify(out,null,1));console.log(out.done,out.at,out.err,out.found.length,out.ph.length);
}finally{b.close();}
