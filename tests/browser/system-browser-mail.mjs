// Round seven, option 2, package 4: live Chrome settings and Gmail compose on both phones and widths.
// node tests/browser/system-browser-mail.mjs [6.0.1 | 7.1.2]
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
for(const [version,start,p] of [['6.0.1',marshmallow,'mm'],['7.1.2',nougat,'ng']].filter(([v])=>!process.argv[2]||v===process.argv[2])){
 const b=await start(),key=`android-time-machine-${p}-v1`;
 const tap=async(label,scope='#screen')=>{const q=`[...document.querySelectorAll('${scope} button')].filter(x=>x.offsetParent).find(x=>(x.querySelector('.${p}st-title')?.textContent||x.textContent).trim()===${JSON.stringify(label)})`;await b.until(`!!(${q})`);await b.ev(`(${q}).click()`);await sleep(100);};
 const input=async(sel,value,event='input')=>b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});if(!f)throw new Error(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('${event}',{bubbles:true}));return 1})()`);
 const seed=async fn=>{await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${key}'));(${fn})(d);localStorage.setItem('${key}',JSON.stringify(d));window.__ngReloadPending=true;location.reload()})()`);await b.until(`!window.__ngReloadPending&&document.querySelector('#screen')?.classList.contains('view-home')`);};
 const chromePrefs=async()=>{await b.open('chrome');await b.click(`[data-action="${p}cr-menu"]`);await b.click(`[data-action="${p}cr-${p==='mm'?'settings':'m-settings'}"]`);};
 const gmailPrefs=async()=>{await b.open('gmail');await b.click(`[data-action="${p}gm-drawer"]`);await b.click(`[data-action="${p}gm-settings"]`);await tap(p==='mm'?'nexus5x.demo@gmail.com':'nexus6p.demo@gmail.com');};
 try{
  await b.language('en');await b.open('chrome');await b.click(`[data-action="${p}cr-accept"]`);await seed(`d=>{d.chrome.fre=${p==='mm'?'true':'2'};d.gmailSetup=2;}`);
  for(const width of [1280,390]){
   await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
   await seed(`d=>{((d.appPrefs||={}).chrome||={}).text_scale=100;d.appPrefs.chrome.search_engine='Google';}`);
   await chromePrefs();await tap('Search engine');await tap('Bing','#overlay-root');
   assert.equal((await b.save()).appPrefs.chrome.search_engine,'Bing');
   await b.click('#nav-bar [data-key="back"]');await b.click(`[data-action="${p}cr-edit"]`);
   await input(`.${p}cr-input`,'retro android');await b.ev(`document.querySelector('[data-form="${p}cr-omnibox"]').requestSubmit()`);
   await b.until(`document.querySelector('.${p}cr-url')?.textContent.includes('bing.com/search?q=retro+android')`);
   await b.open('chrome','url:https://www.android.com/');await sleep(800);
   const before=await b.ev(`parseFloat(getComputedStyle(document.querySelector('#viewport .${p}cr-page .${p}wb h1')).fontSize)`);
   await chromePrefs();await tap('Accessibility');await tap('Text scaling');await input('[data-text-scale]','150');await tap('OK','#overlay-root');
   assert.equal((await b.save()).appPrefs.chrome.text_scale,150);
   await b.click('#nav-bar [data-key="back"]');await b.click('#nav-bar [data-key="back"]');
   await sleep(450);const after=await b.ev(`parseFloat(getComputedStyle(document.querySelector('#viewport .${p}cr-page .${p}wb h1')).fontSize)`);assert.ok(Math.abs(after/before-1.5)<.02,`${version} text scales (${before} -> ${after})`);
   await sleep(450);await b.shot(`${version}-package4-scale-${width}`);
   // Canceling the slider preserves the current setting.
   await chromePrefs();await tap('Accessibility');await tap('Text scaling');await input('[data-text-scale]','80');await tap('Cancel','#overlay-root');assert.equal((await b.save()).appPrefs.chrome.text_scale,150);
   await seed(`d=>{d.chrome.log=[{url:'https://www.android.com/',title:'Old',time:Date.now()-10*86400000},{url:'https://www.google.com/',title:'Recent',time:Date.now()}];d.chrome.visits={'https://www.android.com/':1,'https://www.google.com/':1};d.chrome.cookies={test:1};d.chrome.passwords={test:2};d.appPrefs.chrome.text_scale=100;}`);
   const bookmarks=(await b.save()).chrome.bookmarks;
   await chromePrefs();await tap('Privacy');await tap('Clear browsing data');await tap('Cancel','#overlay-root');assert.equal((await b.save()).chrome.log.length,2);
   await tap('Clear browsing data');if(p==='ng')await input('[data-clear-period]','0','change');await tap(p==='mm'?'Clear':'Clear data','#overlay-root');
   let data=await b.save();assert.equal(data.chrome.log.length,p==='ng'?1:0);assert.deepEqual(data.chrome.bookmarks,bookmarks);assert.ok(!data.chrome.cookies);assert.deepEqual(data.chrome.passwords,{test:2});
   // A new Gmail message has one signature; Cc/Bcc and attachments survive editing a draft and sending it.
   await seed(`d=>{((d.appPrefs||={}).gmail||={}).signature='Phone signature';}`);
   await b.open('gmail');await b.click(`[data-action="${p}gm-compose"]`);
   assert.equal(await b.ev(`document.querySelector('[data-f="body"]').value`),'\n\nPhone signature');
   await input('[data-f="to"]','alex@example.com');await input('[data-f="subject"]',`Package four ${width}`);
   await b.click(`[data-action="${p}gm-ccbcc"]`);await input('[data-f="cc"]','cc@example.com');await input('[data-f="bcc"]','bcc@example.com');
   await input('[data-f="body"]','Hello\n\nPhone signature');
   await b.click(`[data-action="${p}gm-cback"]`);
   let draft=(await b.save()).mail.find(m=>m.box==='drafts'&&m.subject===`Package four ${width}`);assert.ok(draft);assert.equal(draft.cc,'cc@example.com');assert.equal(draft.bcc,'bcc@example.com');
   await seed(`d=>{}`);await b.open('gmail','folder:drafts');await b.click(`[data-action="${p}gm-open"][data-id="${draft.id}"]`);
   assert.equal(await b.ev(`document.querySelector('[data-f="body"]').value`),'Hello\n\nPhone signature');assert.equal(await b.ev(`document.querySelector('[data-f="cc"]').value`),'cc@example.com');
   await input('[data-f="subject"]',`Edited ${width}`);await b.click(`[data-action="${p}gm-cback"]`);assert.equal((await b.save()).mail.filter(m=>m.id===draft.id).length,1);
   await b.click(`[data-action="${p}gm-open"][data-id="${draft.id}"]`);await sleep(450);await b.shot(`${version}-package4-compose-${width}`);await b.click(`[data-action="${p}gm-send"]`);
   let sent=(await b.save()).mail.find(m=>m.id===draft.id);assert.equal(sent.box,'sent');assert.equal(sent.cc,'cc@example.com');assert.equal(sent.bcc,'bcc@example.com');
   await gmailPrefs();await tap('Vacation responder');await b.click(`[data-action="${p}gv-toggle"]`);await b.click(`[data-action="${p}gv-date"][data-key="start"]`);await tap('Cancel','#overlay-root');
   await b.click(`[data-action="${p}gv-date"][data-key="end"]`);await tap('Last day','#overlay-root');await tap('OK','#overlay-root');
   await input('[data-vac="subject"]','Away');await input('[data-vac="body"]','Back next week');await b.click(`[data-action="${p}gv-contacts"]`);
   await sleep(450);await b.shot(`${version}-package4-vacation-${width}`);await b.click(`[data-action="${p}gv-save"]`);
   data=await b.save();assert.ok(data.appPrefs.gmail.vacation.on);assert.equal(data.appPrefs.gmail.vacation.subject,'Away');assert.ok(data.appPrefs.gmail.vacation.contacts);
   await tap('Vacation responder');await input('[data-vac="subject"]','Discard this');await b.click('#nav-bar [data-key="back"]');await tap('Discard','#overlay-root');assert.equal((await b.save()).appPrefs.gmail.vacation.subject,'Away');
   await seed(`d=>{d.appPrefs.gmail.vacation.on=false;d.appPrefs.gmail.vacation.contacts=false;}`);
   console.log(`ok package 4 ${version} ${width}`);
  }
  b.check();
 }catch(e){await sleep(450);await b.shot(`${version}-package4-failed`);console.error('Page errors:',b.errors);throw e;}finally{b.close();}
}
