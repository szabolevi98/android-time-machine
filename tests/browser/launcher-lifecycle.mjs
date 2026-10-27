import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';

// Exercise document-level drag ownership after animated viewports have been discarded.
async function marshmallowDrags(width, touch = false, reduced = false) {
  const b = await marshmallow();
  const point = selector => b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  const pointer = async (phase, p) => {
    if (touch) return b.send('Input.dispatchTouchEvent', {type: {down:'touchStart',move:'touchMove',up:'touchEnd'}[phase], touchPoints: phase === 'up' ? [] : [{...p,id:1}]});
    return b.send('Input.dispatchMouseEvent', {type:{down:'mousePressed',move:'mouseMoved',up:'mouseReleased'}[phase], ...p, button:'left',buttons:phase==='up'?0:1,clickCount:phase==='move'?0:1});
  };
  const cell = (x,y) => b.ev(`(()=>{const r=document.querySelector('.mmh').getBoundingClientRect(),g=MM.launcherGrid,k=r.width/g.W;return {x:r.left+(g.ws.left+(${x}+.5)*g.cellW)*k,y:r.top+(g.ws.top+(${y}+.5)*g.cellH)*k}})()`);
  const begin = async selector => {const p=await point(selector);await pointer('down',p);await sleep(650);await b.until(`!!document.querySelector('#viewport .mmh.dragging .mmh-dragview')`);};
  const drop = async p => {await pointer('move',p);await pointer('up',p);await sleep(450);assert.equal(await b.ev(`!!document.querySelector('.mmh.dragging,.mmh-dragview')`),false,'drop clears drag mode');};
  const home = async () => {await b.click('#nav-bar [data-key="home"]');await sleep(400);};
  const roundTrips = async () => {for(let i=0;i<3;i++){await b.open('calculator');await home();}};
  const listeners = async () => {
    const doc=await b.send('Runtime.evaluate',{expression:'document'});
    const r=await b.send('DOMDebugger.getEventListeners',{objectId:doc.result.result.objectId});
    return r.result.listeners.filter(l=>['pointermove','pointerup','pointercancel','touchmove'].includes(l.type)).length;
  };
  try {
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:touch});
    await b.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:reduced?'reduce':'no-preference'}]});
    await b.ev(`(()=>{const k='android-time-machine-mm-v1',d=JSON.parse(localStorage.getItem(k));d.homeClingSeen=true;localStorage.setItem(k,JSON.stringify(d));window.__dragReload=true;location.reload()})()`);
    await b.until(`!window.__dragReload&&!!document.querySelector('.mmh')`);
    if(touch)await b.send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
    const listenerCount=await listeners();
    await roundTrips();
    assert.equal(await listeners(),listenerCount,'app transitions do not accumulate document listeners');
    const before = (await b.save()).home;
    await begin('#viewport .mmh-icon[data-app="play-store"]');
    const edge=await b.ev(`(()=>{const r=document.querySelector('.mmh').getBoundingClientRect();return {x:r.right-3,y:r.top+r.height*.5}})()`);
    await pointer('move',edge);await sleep(650);
    await drop(await cell(2,2));
    let saved=(await b.save()).home;
    assert.equal(saved.pages.length,2,'edge hold creates page two after app transitions');
    assert.equal(saved.pages[1].filter(i=>i.app==='play-store').length,1,'dragged app survives on page two');
    assert.equal(saved.pages.flat().length,before.pages.flat().length,'moving an app preserves item count');
    await begin('#viewport .mmh-page[data-page="2"] [data-app="play-store"]');
    const remove=await point('.mmh-targets [data-target="remove"]');
    await drop(remove);
    saved=(await b.save()).home;
    assert.equal(saved.pages.flat().some(i=>i.app==='play-store'),false,'Remove deletes the item');
    assert.equal(saved.pages.length,1,'empty extra page is removed');
    await roundTrips();
    await b.open('drawer');
    await begin('#viewport .mmd-app[data-app="calculator"]');
    await drop(await cell(4,2));
    saved=(await b.save()).home;
    assert.equal(saved.pages.flat().filter(i=>i.app==='calculator').length,1,'drawer drag places one shortcut');
    // Removing a whole folder must also work after the drawer-to-home hand-off.
    await begin('#viewport [data-action="mmh-folder"]');
    await drop(await point('.mmh-targets [data-target="remove"]'));
    assert.equal((await b.save()).home.pages.flat().filter(i=>i.type==='folder').length,before.pages.flat().filter(i=>i.type==='folder').length-1,'Remove deletes a folder');
    const beforeCancel=(await b.save()).home;
    await begin('#viewport .mmh-icon[data-app="calculator"]');
    if(touch)await b.send('Input.dispatchTouchEvent',{type:'touchCancel',touchPoints:[]});
    else await b.ev(`document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true}))`);
    await sleep(150);
    assert.equal(await b.ev(`!!document.querySelector('.mmh.dragging,.mmh-dragview')`),false,'cancelled pointer clears drag mode');
    assert.deepEqual((await b.save()).home,beforeCancel,'cancelled drag preserves items');
    assert.equal(await listeners(),listenerCount,'drawer hand-off and drops keep one listener owner');
    await b.shot(`6.0.1-launcher-drag-${width}-${reduced?'reduced':'normal'}`);
    b.check();
    console.log(`ok MM launcher: ${width}, ${touch?'touch':'mouse'}, ${reduced?'reduced':'animated'}; edge page, Remove, drawer, folder`);
  } catch(e) {await b.shot('6.0.1-launcher-drag-failure');throw e;} finally {b.close();}
}

async function nougatWallpaper(width) {
  const b=await nougat();
  const background=selector=>b.ev(`(()=>{const s=getComputedStyle(document.querySelector(${JSON.stringify(selector)}));return [s.backgroundImage,s.backgroundPosition,s.backgroundSize]})()`);
  try {
    await b.send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});
    // Non-central, zoomed crop exposes both horizontal and vertical snapshot offsets.
    await b.ev(`(()=>{const k='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(k));d.wallpapers.home={kind:'bundled',res:'wp_003',aspect:2880/2560,x:73,y:28,scale:1.4};d.homeClingSeen=true;localStorage.setItem(k,JSON.stringify(d));window.__dragReload=true;location.reload()})()`);
    await b.until(`!window.__dragReload&&!!document.querySelector('.ngh')`);
    const home=await background('#screen');
    await b.shot(`7.1.2-wallpaper-home-${width}`);
    await b.click('#nav-bar [data-key="recents"]');await sleep(400);
    assert.deepEqual(await background('#screen'),home,'Recents preserves the complete home crop');
    await b.shot(`7.1.2-wallpaper-recents-${width}`);
    await b.click('#nav-bar [data-key="home"]');await sleep(400);
    // Observe the outgoing launcher while the app's real window animation is running.
    await b.act('ng-open',{view:'calculator'});
    assert.deepEqual(await background('.ng-leaving .ng-transition-wallpaper'),home,'outgoing wallpaper preserves crop');
    assert.deepEqual(await b.ev(`(()=>{const r=document.querySelector('.ng-transition-wallpaper').getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect();return [Math.round(r.x-s.x),Math.round(r.y-s.y),Math.round(r.width-s.width),Math.round(r.height-s.height)]})()`),[0,0,0,0],'outgoing wallpaper covers the original screen bounds');
    await sleep(450);b.check();
    console.log(`ok NG wallpaper ${width}: Recents and animated home snapshot retain saved pan/zoom`);
  } catch(e) {await b.shot('7.1.2-wallpaper-lifecycle-failure');throw e;} finally {b.close();}
}

if(process.argv[2]!=='ng'){
  await marshmallowDrags(1280);
  await marshmallowDrags(390,true);
  await marshmallowDrags(1280,false,true);
}
if(process.argv[2]!=='mm')for(const width of [1280,390])await nougatWallpaper(width);
