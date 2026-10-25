import {nougat,sleep} from './ng-harness.mjs';import fs from 'node:fs';
const b=await nougat();
try{
 await b.ev("NG.register('zz-audit',{render:c=>{window.__c=c;return ''}})");await b.open('zz-audit');
 await b.ev(`window.__audit={done:false,found:[],noop:[],ph:[],screens:0,at:''};(async()=>{
  const c=__c,wait=ms=>new Promise(r=>setTimeout(r,ms));c.factoryReset=()=>{};const reload=location.reload;
  const found=__audit.found,seen=new Set(),queue=[[]],skip=/^(ng-key|ngst-up|ngst-back|ngst-drawer|ng-up)$/;
  const settle=async()=>{for(let i=0;i<6&&c.ui.overlay;i++){if(c.ui.overlay==='dialog')c.closeDialog?.();else c.closeOverlay();await wait(20);}};
  const at=async stack=>{await settle();if(c.ui.view!=='settings')c.open('settings');c.ui.settings={stack:JSON.parse(JSON.stringify(stack)),tab:0};c.render();await wait(30);};
  let screens=0;
  while(queue.length&&screens<700){const stack=queue.shift(),id=stack.at(-1)?.screen||'dashboard';if(seen.has(id))continue;seen.add(id);screens++;__audit.screens=screens;__audit.at=id;
   await at(stack);if(document.querySelector('#screen .ng-missing'))continue;const n=document.querySelectorAll('#viewport [data-action]').length;
   for(let i=0;i<n;i++){await at(stack);const el=document.querySelectorAll('#viewport [data-action]')[i];if(!el||skip.test(el.dataset.action))continue;
    if(el.dataset.action==='ngst-dtile'&&id!=='dashboard')continue;const label=(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,60),act=el.dataset.action,key=el.dataset.key||el.dataset.cls||el.dataset.id||'';
    const before=document.querySelector('#viewport').innerHTML,ov0=c.ui.overlay,v0=c.ui.view,sl=JSON.stringify(c.ui.settings?.stack),d0=JSON.stringify(c.data);try{el.click();}catch(e){found.push({id,act,key,label,error:String(e)});continue;}await wait(40);
    const miss=document.querySelector('#screen .ng-missing');
    {const all=document.querySelector('#screen').innerText+' '+(document.querySelector('#overlay-root')?.innerText||''),m=all.match(/%([0-9][$])?[sd](?![a-z])/);if(m)__audit.ph.push({id,act,key,label,text:m[0],around:all.slice(Math.max(0,all.indexOf(m[0])-40),all.indexOf(m[0])+40)});}
    if(!miss&&c.ui.view===v0&&!c.ui.overlay&&!ov0&&JSON.stringify(c.ui.settings?.stack)===sl&&document.querySelector('#viewport').innerHTML===before&&JSON.stringify(c.data)===d0&&!document.querySelector('#screen .ngtoast,#screen .ng-toast'))__audit.noop.push({id,act,key,label});
    if(miss)found.push({id,act,key,label,view:c.ui.view,overlay:c.ui.overlay,missing:miss.dataset.missing,to:c.ui.settings?.stack?.at(-1)?.screen,detail:[...miss.querySelectorAll('small')].map(x=>x.textContent).join(' / ')});
    __audit.at=id+' #'+i+' '+act+' '+key;const st=c.ui.settings?.stack;if(!miss&&c.ui.view==='settings'&&st&&st.length>stack.length&&!seen.has(st.at(-1).screen))queue.push(JSON.parse(JSON.stringify(st)));
   }}
  __audit.done=true;})().catch(e=>{__audit.err=String(e);__audit.done=true;});0`);
 let out;for(let i=0;i<110;i++){await sleep(5000);out=await b.ev('JSON.parse(JSON.stringify(__audit))');if(out.done)break;}
 fs.writeFileSync(process.env.TEMP+'/audit.json',JSON.stringify(out,null,1));console.log(out.done,out.screens,out.at,out.err,out.found.length,out.noop.length,out.ph.length,b.errors.slice(0,5));
}finally{b.close();}
