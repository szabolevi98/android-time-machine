import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const cls=()=>b.ev(`document.querySelector('#screen').className`);
const has=async(...names)=>{const c=await cls();for(const n of names)assert.ok(c.split(' ').includes(n),`${n} in ${c}`);};
const hasNot=async n=>assert.ok(!(await cls()).split(' ').includes(n),n);
const center=sel=>b.ev(`(()=>{const r=document.querySelector(${JSON.stringify(sel)})?.getBoundingClientRect();return r&&[r.left+r.width/2,r.top+r.height/2]})()`);
const mouse=(type,x,y,buttons)=>b.send('Input.dispatchMouseEvent',{type,x,y,button:'left',buttons,clickCount:type==='mouseMoved'?0:1});
// Overview held (the key's long press, 500 ms).
const holdOverview=async()=>{const r=await center('#nav-bar [data-key="recents"]');await mouse('mousePressed',...r,1);await sleep(650);await mouse('mouseReleased',...r,0);await sleep(900);};
const toast=()=>b.ev(`document.querySelector('.ngtoast-layer')?.textContent||''`);
try{
 await b.language('en');
 await b.open('calculator');await b.open('chrome');await sleep(300);
 // Overview held in Chrome: Chrome docks at the top, Overview below without it.
 await holdOverview();
 await has('split','split-b','view-recents');
 assert.ok(await b.ev(`!!document.querySelector('#split-other .ngsp-shot')`),'the docked app above');
 assert.equal(await b.ev(`[...document.querySelectorAll('#viewport .ngrc-task')].map(t=>t.dataset.task).includes('chrome')`),false,'the docked task is not in Overview');
 assert.ok(await b.ev(`document.querySelector('#nav-bar [data-key="recents"] img').src.includes('ic_sysbar_docked')`),'docked Overview icon');
 const vp=await b.ev(`(()=>{const v=document.querySelector('#viewport').getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect(),dp=s.width/411.43;return [(v.top-s.top)/dp,(v.bottom-s.top)/dp]})()`);
 assert.ok(Math.abs(vp[0]-358.86)<1.5&&Math.abs(vp[1]-683.43)<1.5,`bottom window ${vp}`);
 await b.shot('7.1.2-split-recents');
 // The calculator below.
 await b.ev(`document.querySelector('#viewport .ngrc-task[data-task="calculator"]').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:200,clientY:500,pointerId:1}))`);
 await b.ev(`document.querySelector('#viewport .ngrc').dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:200,clientY:500,pointerId:1}))`);await sleep(700);
 await has('split','split-b','view-calculator');await b.shot('7.1.2-split');
 // A tap on Chrome makes it the live side.
 await b.click('#split-other');await sleep(500);await has('split','split-a','view-chrome');
 // Home minimizes; an app from the launcher restores the split.
 await b.click('#nav-bar [data-key="home"]');await sleep(600);await has('split','split-min','view-home');await b.shot('7.1.2-split-minimized');
 await b.open('calculator');await sleep(400);await has('split','split-b','view-calculator');await hasNot('split-min');
 // The divider dragged to the top: the docked app goes, the calculator takes the screen.
 const d=await center('#split-divider');await mouse('mousePressed',...d,1);for(let i=1;i<=10;i++){await mouse('mouseMoved',d[0],d[1]-i*30,1);await sleep(16);}await mouse('mouseMoved',d[0],60,1);await mouse('mouseReleased',d[0],60,0);await sleep(700);
 await hasNot('split');await has('view-calculator');
 // Overview held again, then held once more: undocked, the docked app takes the screen.
 await holdOverview();await has('split');await holdOverview();await sleep(500);await hasNot('split');await has('view-calculator');
 // Camera does not dock.
 await b.open('camera');await sleep(600);await holdOverview();await hasNot('split');assert.ok((await toast()).includes("doesn't support split screen"),await toast());
 await b.click('#nav-bar [data-key="home"]');await sleep(500);
 // Overview: a task held and dragged into the top docks it.
 await b.open('chrome');await b.click('#nav-bar [data-key="recents"]');await sleep(900);
 const t=await center('#viewport .ngrc-task[data-task="calculator"] .ngrc-head');assert.ok(t,'calculator card');
 await mouse('mousePressed',...t,1);await sleep(650);
 assert.ok(await b.ev(`!!document.querySelector('.ngrc-dock')`),'drag hint');assert.ok((await b.ev(`document.querySelector('.ngrc-dock')?.textContent`)).includes('Drag here to use split screen'));
 await b.shot('7.1.2-split-drag-hint');
 for(let i=1;i<=10;i++){await mouse('mouseMoved',t[0],t[1]-(t[1]-120)*i/10,1);await sleep(20);}await sleep(300);
 assert.ok(await b.ev(`document.querySelector('.ngrc-dock')?.classList.contains('docked')`),'over the dock area');
 await mouse('mouseReleased',t[0],120,0);await sleep(1000);
 await has('split','split-b','view-recents');assert.equal(await b.ev(`document.querySelector('#screen').dataset.x||''`),'');
 b.check();console.log('Split screen passed: dock from Overview held and from a dragged task, the bottom window, focus, minimize and restore, divider dismiss, undock, Camera refused.');
}catch(error){await b.shot('7.1.2-split-failure');throw error;}finally{b.close();}
