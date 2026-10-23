// Local integration harness for the modular Nougat apps. Each run owns a private headless Chrome.
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
export const sleep = ms => new Promise(resolve => setTimeout(resolve,ms));
export async function nougat() {
  const profile=fs.mkdtempSync(path.join(os.tmpdir(),'nougat-')), port=10000+Math.floor(Math.random()*2000);
  const base=process.env.BASE||'http://127.0.0.1:8090';
  const chrome=spawn(process.env.CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',['--headless=new','--no-sandbox',`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,'about:blank'],{stdio:'ignore'});
  let ws,seq=0; const pending=new Map(),errors=[],failed=[];
  const close=()=>{ws?.close();chrome.kill();};
  try {
    for(let i=0;i<100&&!ws;i++){try{const tabs=await(await fetch(`http://127.0.0.1:${port}/json`)).json();ws=new WebSocket(tabs.find(t=>t.type==='page').webSocketDebuggerUrl);}catch{await sleep(200);}}
    assert.ok(ws,'Chrome starts');await new Promise(resolve=>ws.onopen=resolve);
    ws.onmessage=message=>{const d=JSON.parse(message.data);if(d.method==='Runtime.exceptionThrown')errors.push(d.params.exceptionDetails.exception?.description||d.params.exceptionDetails.text);if(d.method==='Network.responseReceived'&&d.params.response.status>=400)failed.push(d.params.response.url);if(pending.has(d.id)){pending.get(d.id)(d);pending.delete(d.id);}};
    const send=(method,params={})=>new Promise(resolve=>{pending.set(++seq,resolve);ws.send(JSON.stringify({id:seq,method,params}));});
    const ev=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});assert.ok(!r.result?.exceptionDetails,JSON.stringify(r.result?.exceptionDetails));return r.result?.result?.value;};
    const until=async expression=>{for(let i=0;i<100;i++){if(await ev(expression))return;await sleep(200);}throw new Error(`Timed out: ${expression}; errors: ${errors.slice(0,3).join(' | ')}; requests: ${failed.join(' | ')}`);};
    const click=async selector=>assert.equal(await ev(`(()=>{const el=document.querySelector(${JSON.stringify(selector)});if(!el)return false;el.click();return true})()`),true,selector);
    const act=(action,data={})=>ev(`(()=>{const b=document.createElement('button');b.dataset.action=${JSON.stringify(action)};Object.assign(b.dataset,${JSON.stringify(data)});document.querySelector('#viewport').append(b);b.click();b.remove();})()`);
    const drag=async(selector,dx,dy)=>{const r=await ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)})?.getBoundingClientRect();return r&&[r.left+r.width/2,r.top+r.height/2]})()`);assert.ok(r,selector);const mouse=(type,x,y,buttons)=>send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons,clickCount:type==='mouseMoved'?0:1});await mouse('mousePressed',...r,1);for(let i=1;i<=8;i++)await mouse('mouseMoved',r[0]+dx*i/8,r[1]+dy*i/8,1);await mouse('mouseReleased',r[0]+dx,r[1]+dy,0);};
    const open=async(view,sub='')=>{await act('ng-open',{view,sub});await sleep(400);};
    const shot=async name=>{fs.mkdirSync('tests/browser/artifacts',{recursive:true});const r=await send('Page.captureScreenshot',{format:'png'});fs.writeFileSync(`tests/browser/artifacts/${name}.png`,Buffer.from(r.result.data,'base64'));};
    await send('Runtime.enable');await send('Network.enable');await send('Network.setCacheDisabled',{cacheDisabled:true});
    await send('Emulation.setFocusEmulationEnabled',{enabled:true});
    await send('Emulation.setDeviceMetricsOverride',{width:1280,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Page.navigate',{url:`${base}/versions/7.1.2/`});
    await until(`!!window.NG?.module('boot') && !!document.querySelector('#screen')`);
    await ev(`document.querySelector('.ngpw-boot')?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
    await until(`document.querySelector('#screen')?.classList.contains('view-home') && !document.querySelector('.ngpw-boot')`);
    return {ev,send,until,click,act,drag,open,shot,close,errors,failed,
      save:()=>ev(`JSON.parse(localStorage.getItem('android-time-machine-ng-v1'))`),
      async language(lang){await ev(`window.__ngReloadPending=true;AndroidI18n.setLanguage(${JSON.stringify(lang)});location.reload()`);await until(`!window.__ngReloadPending && document.querySelector('#screen')?.classList.contains('view-home') && document.documentElement.lang===${JSON.stringify(lang)}`);},
      check(){assert.deepEqual(errors,[],'JavaScript exceptions');assert.deepEqual(failed,[],'failed local requests');}
    };
  } catch(error){close();throw error;}
}
