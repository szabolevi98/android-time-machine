import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
try{await b.language('en');await b.ev("NG.register('zz-audit',{render:c=>{window.__c=c;return ''}})");await b.open('zz-audit');
 const out=await b.ev(`(async()=>{const c=__c,w=ms=>new Promise(r=>setTimeout(r,ms)),res=[];
  for(const [app,d] of Object.entries(NG.appPrefsXml)){for(const xml of Object.keys(d.xml)){try{if(c.ui.overlay)c.closeOverlay();c.ui.appPrefs=null;c.transition?.('none');NG.openPrefs(c,app,xml);}catch(e){res.push([app,xml,'ERR '+e]);continue;}await w(120);
   const t=document.querySelector('#viewport').innerText,m=t.match(/%([0-9][$])?[sd](?![a-z])/);if(m)res.push([app,xml,t.slice(Math.max(0,t.indexOf(m[0])-50),t.indexOf(m[0])+30)]);if(document.querySelector('#screen .ng-missing'))res.push([app,xml,'MISSING']);}}
  return res;})()`);
 console.log(JSON.stringify(out,null,0));console.log(b.errors.slice(0,3));
}finally{b.close();}
