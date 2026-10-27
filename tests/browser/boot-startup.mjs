// Fresh private browser, empty cache: boot -> keyguard -> explicit unlock -> fully drawn launcher/drawer.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
const sleep=ms=>new Promise(r=>setTimeout(r,ms)),base=process.env.BASE||'http://127.0.0.1:8090';
const binary=process.env.CHROME||(process.platform==='win32'?'C:/Program Files/Google/Chrome/Application/chrome.exe':'google-chrome');
const port=12000+Math.floor(Math.random()*1000),profile=fs.mkdtempSync(path.join(os.tmpdir(),'boot-startup-'));
const chrome=spawn(binary,['--headless=new','--no-sandbox',binary.includes('msedge')?'--inprivate':'--incognito',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let ws,seq=0,held=null;const replies=new Map(),errors=[],failed=[];
try{
 for(let i=0;i<100&&!ws;i++){try{const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);}catch{await sleep(150);}}
 assert.ok(ws,'private browser starts');await new Promise(r=>ws.onopen=r);
 const send=(method,params={})=>new Promise(resolve=>{replies.set(++seq,resolve);ws.send(JSON.stringify({id:seq,method,params}));});
 ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);if(d.method==='Network.responseReceived'&&d.params.response.status>=400)failed.push(d.params.response.url);if(d.method==='Fetch.requestPaused')held=d.params.requestId;if(replies.has(d.id)){replies.get(d.id)(d);replies.delete(d.id);}};
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert.ok(!r.result?.exceptionDetails,JSON.stringify(r.result?.exceptionDetails));return r.result?.result?.value;};
 const until=async expression=>{for(let i=0;i<250;i++){if(await ev(expression))return;await sleep(200);}throw new Error('Timed out: '+expression+' '+errors.join(' | '));};
 const act=(action,data={})=>ev(`(()=>{const e=document.createElement('button');e.dataset.action=${JSON.stringify(action)};Object.assign(e.dataset,${JSON.stringify(data)});document.querySelector('#viewport').append(e);e.click();e.remove()})()`);
 const drag=async selector=>{const [x,y]=await ev(`(()=>{const r=document.querySelector('${selector}').getBoundingClientRect();return[r.left+r.width/2,r.top+r.height/2]})()`);for(const [type,dy,buttons]of[['mousePressed',0,1],['mouseMoved',-80,1],['mouseMoved',-180,1],['mouseReleased',-180,0]]){await send('Input.dispatchMouseEvent',{type,x,y:y+dy,buttons,button:'left',clickCount:1});await sleep(40);}};
 await send('Runtime.enable');await send('Page.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:900,deviceScaleFactor:1,mobile:true});
 const versions=['2.1','2.3.6','4.0.4','4.3','4.4.4','5.1.1','6.0.1','7.1.2'].filter(v=>!process.argv[2]||process.argv[2]===v);
 for(const version of versions)for(const quiet of [false,true]){
  errors.length=0;failed.length=0;held=null;
  const modern=['6.0.1','7.1.2'].includes(version),p=version==='6.0.1'?'mm':'ng';
  const boot=version==='2.1'?'.ecsys-boot':modern?`.${p}pw-boot`:'.ga-boot';
  const lock=version==='2.1'?'.eclk':modern?`.${p}lk`:'.lock-view';
  const home=version==='2.1'?'.eclh':modern?`.${p}h`:'.home-view';
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:quiet?'reduce':'no-preference'}]});
  const injected=await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__bootScenes=[];localStorage.clear();sessionStorage.clear();localStorage.setItem('android-time-machine-language','en');
   ${quiet?`for(const method of ['getItem','setItem']){const original=Storage.prototype[method];Storage.prototype[method]=function(key,...args){if(String(key).startsWith('android-sim-booted-'))throw new DOMException('Storage blocked','SecurityError');return original.call(this,key,...args);};}`:''}
   window.__bootScenes=[];new MutationObserver(()=>{const stage=document.querySelector('${boot}')?'boot':document.querySelector('${lock}')?'lock':document.querySelector('${home}')?'home':'';if(stage&&(__bootScenes.length||stage==='boot')&&__bootScenes.at(-1)!==stage)__bootScenes.push(stage);}).observe(document,{childList:true,subtree:true});`});
  const delayed=version==='7.1.2'&&!quiet;
  if(delayed)await send('Fetch.enable',{patterns:[{urlPattern:'*/7.1.2/assets/app-calculator.png*',requestStage:'Request'}]});
  await send('Page.navigate',{url:`${base}/versions/${version}/`});await until(`location.pathname.includes('/${version}/')&&!!document.querySelector('${boot}')`);
  if(delayed){
   await until(`AndroidBoot.state.status==='loading'`);for(let i=0;i<100&&!held;i++)await sleep(100);assert.ok(held,'drawer icon was requested during boot');
   await sleep(7000);assert.equal(await ev(`!!document.querySelector('${boot}')`),true,'boot cannot finish on a fixed six-second timer');
   await ev(`document.querySelector('${boot}').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,cancelable:true}))`);await sleep(200);
   assert.equal(await ev(`!!document.querySelector('${boot}')`),true,'skip cannot expose unloaded icons');
   await send('Fetch.continueRequest',{requestId:held});await send('Fetch.disable');
  }
  await until(`!document.querySelector('${boot}')&&!!document.querySelector('${lock}')`);
  assert.deepEqual(await ev('__bootScenes'),['boot','lock'],`${version}: boot ends at keyguard`);
  assert.equal(await ev('AndroidBoot.state.status'),'ready',JSON.stringify(await ev('AndroidBoot.state.failed')));
  if(version==='2.1')await ev('EC.context.unlock()');else if(modern)await drag(lock);else await act('unlock');
  await until(`!!document.querySelector('${home}')`);
  if(modern){await ev(`document.querySelector('[data-action="${p}h-cling"]')?.click()`);await act(`${p}-open`,{view:'drawer'});}
  else if(version==='2.1')await ev(`EC.context.open('drawer')`);else await act('drawer');
  await sleep(200);
  assert.deepEqual(await ev(`[...document.querySelectorAll('#viewport img[src]')].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src'))`),[],`${version}: drawer pictures already decoded`);
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:injected.result.identifier});
  console.log(`ok private cold boot ${version} reduced+blocked-storage=${quiet}`);
 }
}catch(e){console.error('browser errors',errors);if(ws){try{const id=++seq;const result=new Promise(r=>replies.set(id,r));ws.send(JSON.stringify({id,method:'Page.captureScreenshot',params:{format:'png'}}));const r=await result;fs.mkdirSync('tests/browser/artifacts',{recursive:true});fs.writeFileSync('tests/browser/artifacts/boot-startup-failure.png',Buffer.from(r.result.data,'base64'));}catch{}}throw e;}finally{ws?.close();chrome.kill();}
