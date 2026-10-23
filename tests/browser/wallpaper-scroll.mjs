// Real pointer regression for the Marshmallow and Lollipop wallpaper strips.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const port=12000+Math.floor(Math.random()*1000),profile=fs.mkdtempSync(path.join(os.tmpdir(),'wallpaper-scroll-'));
const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
let ws,seq=0;const pending=new Map(),errors=[],failed=[];
let version='';
try{
 for(let i=0;i<100&&!ws;i++){try{const pages=await(await fetch(`http://127.0.0.1:${port}/json`)).json();ws=new WebSocket(pages.find(x=>x.type==='page').webSocketDebuggerUrl);}catch{await sleep(150);}}
 assert.ok(ws,'Chrome starts');await new Promise(r=>ws.onopen=r);
 ws.onmessage=m=>{const d=JSON.parse(m.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);if(d.method==='Network.responseReceived'&&d.params.response.status>=400)failed.push(d.params.response.url);if(pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id);}};
 const send=(method,params={})=>new Promise(r=>{pending.set(++seq,r);ws.send(JSON.stringify({id:seq,method,params}));});
 const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert.ok(!r.result?.exceptionDetails,JSON.stringify(r.result?.exceptionDetails));return r.result?.result?.value;};
 const until=async expression=>{for(let i=0;i<100;i++){if(await ev(expression))return;await sleep(150);}throw new Error('Timed out: '+expression);};
 const act=async(action,data={})=>ev(`(()=>{const e=document.createElement('button');e.dataset.action=${JSON.stringify(action)};Object.assign(e.dataset,${JSON.stringify(data)});document.querySelector('#viewport').append(e);e.click();e.remove();})()`);
 const mouse=(type,x,y)=>send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons:type==='mouseReleased'?0:1,clickCount:type==='mouseMoved'?0:1});
 const rect=selector=>ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {left:r.left,top:r.top,width:r.width,height:r.height};})()`);
 const drag=async selector=>{const r=await rect(selector),x=r.left+r.width*.8,y=r.top+r.height/2;await mouse('mousePressed',x,y);for(let i=1;i<=8;i++)await mouse('mouseMoved',x-r.width*.6*i/8,y);await mouse('mouseReleased',x-r.width*.6,y);await sleep(400);};
 const tap=async selector=>{const r=await rect(selector),x=r.left+r.width/2,y=r.top+r.height/2;assert.equal(await ev(`!!document.elementFromPoint(${x},${y})?.closest(${JSON.stringify(selector)})`),true,selector+' is visible');await mouse('mousePressed',x,y);await mouse('mouseReleased',x,y);await sleep(100);};
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`sessionStorage.setItem('android-sim-booted-5.1.1','1');sessionStorage.setItem('android-sim-booted-6.0.1','1');localStorage.setItem('android-time-machine-language','en');`});
 const versions=process.argv.slice(2).filter(x=>/^\d/.test(x));
 for(version of versions.length?versions:['6.0.1','5.1.1']){
  const mm=version==='6.0.1',strip=mm?'.mmwl-tiles':'.kwp-scroll',tile=mm?'.mmwl-tile':'.kwp-tile',last=mm?'wp_009':'wp:10',lastTile=`${tile}[data-id="${last}"]`,store=`android-time-machine-${mm?'mm':'lp'}-v1`;
  const open=async()=>{await act(mm?'mm-open':'open-wallpapers',mm?{view:'wallpapers'}:{});await until(`!!document.querySelector('${strip}')`);await sleep(400);};
  const left=()=>ev(`document.querySelector('${strip}').scrollLeft`);
  const selected=()=>ev(mm?`document.querySelector('.mmwl-tick')?.closest('[data-id]').dataset.id||''`:`document.querySelector('.kwp-tile.selected')?.dataset.id||''`);
  await send('Emulation.setTouchEmulationEnabled',{enabled:false});
  await send('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:`${process.env.BASE||'http://127.0.0.1:8090'}/versions/${version}/`});
  await until(mm?`!!window.MM&&document.querySelector('#screen.view-home')`:`!!document.querySelector('#viewport .home-view,#viewport .lock-view')`);
  await sleep(1000);
  if(!mm){await act('unlock');await sleep(400);}else await ev(`document.querySelector('[data-action="mmh-cling"]')?.click()`);
  await open();const before=await selected();await drag(strip);
  assert.ok(await left()>50,version+': mouse drag scrolls the strip');assert.equal(await selected(),before,'drag does not change the selection');
  for(let i=0;i<6;i++)await drag(strip);
  const scrolled=await left();await tap(lastTile);assert.ok(Math.abs(await left()-scrolled)<2,'selecting a late wallpaper preserves scroll position');assert.equal(await selected(),last);
  await tap(mm?'.mmwl-set':'.kwp-set');await sleep(400);
  let saved=await ev(`JSON.parse(localStorage.getItem('${store}'))`);assert.equal(mm?saved.wallpaper.res:saved.wallpaper,mm?last:10,'last bundled wallpaper is applied');
  await open();const r=await rect(strip);await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:r.left+r.width/2,y:r.top+r.height/2,deltaX:0,deltaY:200});await sleep(200);assert.ok(await left()>50,'ordinary wheel scrolls sideways');
  await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:r.left+r.width/2,y:r.top+r.height/2,deltaX:0,deltaY:-10000});await sleep(200);assert.equal(await left(),0,'wheel returns to the first tiles');
  await send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});await sleep(300);
  const touch=await rect(strip),x=touch.left+touch.width*.8,y=touch.top+touch.height/2,priorTouch=await selected();
  await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let i=1;i<=8;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-touch.width*.6*i/8,y,id:1}]});await sleep(20);}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await sleep(400);
  assert.ok(await left()>80,'phone touch swipe scrolls the strip');assert.equal(await selected(),priorTouch,'touch scrolling does not select a different image');assert.equal(await ev(`document.documentElement.scrollWidth<=innerWidth+1`),true,'phone width');
  const shot=await send('Page.captureScreenshot',{format:'png'});fs.mkdirSync('tests/browser/artifacts',{recursive:true});fs.writeFileSync(`tests/browser/artifacts/${version}-wallpaper-scroll.png`,Buffer.from(shot.result.data,'base64'));
  assert.deepEqual(errors,[],'JavaScript exceptions');assert.deepEqual(failed,[],'failed requests');console.log(`${version}: mouse drag, last wallpaper selection/application, scroll position, wheel and phone touch passed`);
 }
}catch(error){if(ws?.readyState===1){ws.send(JSON.stringify({id:++seq,method:'Page.captureScreenshot',params:{format:'png'}}));const shot=await new Promise(r=>pending.set(seq,r));fs.mkdirSync('tests/browser/artifacts',{recursive:true});if(shot.result?.data)fs.writeFileSync(`tests/browser/artifacts/${version}-wallpaper-scroll-failure.png`,Buffer.from(shot.result.data,'base64'));}throw error;}finally{ws?.close();chrome.kill();}
