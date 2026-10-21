import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(), key=k=>b.click(`.ngboard [data-gb=${JSON.stringify(k)}]`), back=()=>b.click('#nav-bar [data-key="back"]');
const focus=s=>b.ev(`document.querySelector(${JSON.stringify(s)}).focus()`);
const value=s=>b.ev(`document.querySelector(${JSON.stringify(s)}).value`);
try {
 await b.language('en'); await b.open('gmail');
 for(let i=0;i<8&&!await b.ev(`!!document.querySelector('#viewport [data-action="nggm-compose"]')`);i++) {
  const action=await b.ev(`document.querySelector('#viewport [data-action="nggm-tdone"],#viewport [data-action="nggm-setupdone"]')?.dataset.action`);assert.ok(action);await b.act(action);
 }
 await b.click('#viewport [data-action="nggm-compose"]'); await b.until(`!!document.querySelector('.ngboard')`);
 assert.equal(await b.ev(`document.querySelector('.ngnb-key[data-key="back"] img').src.includes('back_ime')`),true);
 const to='#viewport [data-f="to"]';
 for(const x of 'alex')await key('text:'+x);
 await key('symbols');await key('text:@');await key('alpha');for(const x of 'example')await key('text:'+x);await key('text:.');for(const x of 'com')await key('text:'+x);
 assert.equal(await value(to),'alex@example.com');
 await focus('#viewport [data-f="subject"]');for(const x of 'hello')await key('text:'+x);
 await b.ev(`document.querySelector('#viewport [data-f="subject"]').setSelectionRange(1,4)`);await key('text:a');assert.equal(await value('#viewport [data-f="subject"]'),'hao','selection is replaced');
 // Exercise a real held pointer, including release before choosing its accent popup.
 const point=await b.ev(`(()=>{const r=document.querySelector('.ngboard [data-gb="text:e"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
 await b.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',buttons:1,clickCount:1});await sleep(450);await b.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',buttons:0,clickCount:1});
 assert.equal(await b.ev(`!!document.querySelector('.ngboard-preview.choices')`),true,'long press opens native accent choices');await key('text:é');assert.equal(await value('#viewport [data-f="subject"]'),'haéo','accent is inserted at the current caret');
 await focus('#viewport [data-f="body"]');await key('emoji');await key('text:😀');await key('text:😀');await key('delete');assert.equal(await value('#viewport [data-f="body"]'),'😀','backspace removes one complete emoji');
 await key('alpha');await key('enter');assert.equal(await value('#viewport [data-f="body"]'),'😀\n','textarea Enter inserts a line break');
 await sleep(150);await b.shot('7.1.2-gboard');
 const before=await b.ev(`document.querySelector('#viewport').clientHeight`);await back();assert.equal(await b.ev(`!!document.querySelector('.ngboard')`),false);assert.equal(await b.ev(`!!document.querySelector('.nggm-compose')`),true,'first Back leaves compose open');assert.ok(await b.ev(`document.querySelector('#viewport').clientHeight`)>before);
 await focus(to);await b.act('ng-key',{key:'home'});assert.equal(await b.ev(`!!document.querySelector('.ngboard')`),false,'Home dismisses the editor');
 // Messenger search rebuilds its field after every input event.
 await b.open('messenger');await b.act('ngms-search');await b.until(`!!document.querySelector('.ngms-sinput')`);
 for(const x of 'alex')await key('text:'+x);assert.equal(await value('.ngms-sinput'),'alex');assert.equal(await b.ev(`document.activeElement===document.querySelector('.ngms-sinput')`),true);
 await back();await back();
 for(const lang of ['en','hu','de','fr','es']) {
  await b.language(lang);await b.open('settings','keyboards');await b.click('[data-action="ngpe-ime"][data-id="gboard"]');
  assert.equal(await b.ev(`!!document.querySelector('.ngap')`),true);
  await b.click('[data-action="ngap-pref"][data-p="1"]');assert.ok(await b.ev(`document.querySelectorAll('.ngap [data-action="ngap-pref"]').length`)>10,'native preference categories are expanded');
  if(!(await b.save()).appPrefs?.gboard?.enable_number_row)await b.click('[data-action="ngap-pref"][data-p="1.0"]');assert.equal((await b.save()).appPrefs.gboard.enable_number_row,true);await back();
  await b.click('[data-action="ngap-pref"][data-p="2"]');await b.click('[data-action="ngboard-theme"][data-theme="dark"]');if(!(await b.save()).appPrefs?.gboard?.key_borders)await b.click('[data-action="ngboard-borders"]');
  await b.open('gmail');await b.act('nggm-compose');await focus(to);
  assert.equal(await b.ev(`!!document.querySelector('.ngboard.dark.borders .number-row')`),true,'native preferences affect the next editor');
  const expected={en:'qwertyuiop',hu:'qwertzuiop',de:'qwertzuiop',fr:'azertyuiop',es:'qwertyuiop'}[lang];
  assert.equal(await b.ev(`[...document.querySelectorAll('.ngboard .row0 .char')].map(e=>e.textContent.toLowerCase()).join('')`),expected);
  assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],`${lang} native strings`);
  await back();await b.act('nggm-cback');
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await b.open('gmail');await b.act('nggm-compose');await focus(to);await sleep(150);await b.shot('7.1.2-gboard-phone');
 assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);assert.equal(await b.ev(`document.querySelector('.ngboard').getBoundingClientRect().bottom<=document.querySelector('#nav-bar').getBoundingClientRect().top+1`),true);
 b.check();console.log('Gboard checks passed: Gmail address/selection/emoji/newline, Back/Home, Messenger rerender, five layouts and phone dimensions.');
}catch(error){await b.shot('7.1.2-gboard-failure');throw error;}finally{b.close();}
