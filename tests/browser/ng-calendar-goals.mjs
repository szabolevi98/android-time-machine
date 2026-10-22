import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const opt=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngcg-opt')].find(e=>e.textContent.trim()===${JSON.stringify(label)});el?.click();return !!el})()`),true,label);
try{
 await b.language('en');
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.calendarOobe=true;localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);
 await b.until(`document.querySelector('#screen')?.classList.contains('view-home')`);
 await b.open('calendar');await b.act('ngcl-dial');await sleep(200);await b.act('ngcl-goal');await sleep(500);
 assert.ok((await text('#viewport .ngcg-head')).includes('Choose a goal'));assert.equal(await b.ev(`document.querySelectorAll('#viewport .ngcg-cat').length`),5);
 assert.ok(await b.ev(`document.querySelector('#status-bar .ngsb').classList.contains('light')`),'light status bar');
 await b.shot('7.1.2-goal-store');
 await b.click('#viewport .ngcg-cat[data-cat="256"]');await sleep(700);
 assert.ok((await text('#viewport h1')).includes('Which exercise?'));
 assert.deepEqual(await b.ev(`[...document.querySelectorAll('#viewport .ngcg-opt')].map(e=>e.textContent.trim())`),['Work out','Run','Walk','Do yoga','Custom…']);
 await b.shot('7.1.2-goal-sub');
 await opt('Run');await sleep(300);assert.ok((await text('#viewport h1')).includes('How often?'));await b.shot('7.1.2-goal-frequency');
 await opt('3 times a week');await sleep(200);assert.ok((await text('#viewport h1')).includes('For how long?'));
 await opt('30 minutes');await sleep(200);assert.ok((await text('#viewport h1')).includes('Best time?'));
 await opt('Morning');await sleep(300);
 const sum=await text('#viewport .ngcg-summary');assert.ok(sum.includes('Calendar will schedule:')&&sum.includes('3 sessions a week')&&sum.includes('30 minutes, mornings'),sum);
 await b.shot('7.1.2-goal-summary');
 await b.act('ngcg-create');await sleep(600);assert.ok((await text('#viewport .ngcg-waiting')).includes('Finding time for your goal'));await b.shot('7.1.2-goal-creating');
 await b.until(`document.querySelector('#screen').classList.contains('view-calendar') && !!document.querySelector('.ngcg-sheet')`);
 assert.ok((await text('.ngcg-sheet')).includes('Does this time work for you?'));await b.shot('7.1.2-goal-sheet');
 const sessions=(await b.save()).events.filter(e=>e.goal);assert.ok(sessions.length>=9&&sessions.length<=12,`${sessions.length} sessions`);
 assert.ok(sessions.every(e=>e.start>='07:00'&&e.start<'11:00'&&e.title==='Run'),'mornings');
 await b.act('ngcg-sheet-adjust',{id:String(sessions.sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start))[0].id)});await sleep(500);
 assert.ok((await text('#viewport .ngcg-info')).includes('Session 1 this week')||(await text('#viewport .ngcg-info')).includes('Session'),'session segment');
 await b.shot('7.1.2-goal-session');
 await b.ev(`document.querySelector('#viewport [data-action="ngcg-did"]').click()`);await sleep(300);
 assert.ok((await b.ev(`document.querySelector('.ngph-snack')?.textContent||''`)).match(/Nicely done|Well done/),'did it');
 assert.ok(await b.ev(`!!document.querySelector('#viewport [data-action="ngcg-undone"]')`),'mark as not done');
 // A custom goal from a question subcategory: Learn a language → What language? → a suggestion.
 await b.act('ngcl-up');await sleep(200);await b.act('ngcl-dial');await sleep(200);await b.act('ngcl-goal');await sleep(400);
 await b.click('#viewport .ngcg-cat[data-cat="512"]');await sleep(600);await opt('Learn a language');await sleep(300);
 assert.equal(await b.ev(`document.querySelector('#viewport .ngcg-title')?.placeholder`),'What language?');
 await b.ev(`document.querySelector('#viewport .ngcg-sugg .ngcg-opt').click()`);await sleep(300);assert.ok((await text('#viewport h1')).includes('Once a month')||(await text('#viewport h1')).includes('How often?'));
 await b.click('#nav-bar [data-key="back"]');await sleep(300);await b.click('#nav-bar [data-key="back"]');await sleep(300);
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('calendar');await b.act('ngcl-dial');await sleep(100);await b.act('ngcl-goal');await sleep(300);for(const id of [256,512,768,1024,1280]){await b.click(`#viewport .ngcg-cat[data-cat="${id}"]`);await sleep(250);await b.ev(`document.querySelector('#viewport .ngcg-opt[data-action="ngcg-custom"]').click()`);await sleep(200);await b.act('ngcg-back');await sleep(150);await b.ev(`document.querySelector('#viewport .ngcg-opt[data-action="ngcg-sub"]').click()`);await sleep(150);for(const s of ['ngcg-freq','ngcg-dur','ngcg-time'])await b.ev(`document.querySelector('#viewport [data-action="${s}"]')?.click()`);await sleep(150);await b.ev(`document.querySelector('#viewport [data-action="ngcg-edit"]')?.click()`);await sleep(150);for(let i=0;i<6;i++){await b.act('ngcg-back');await sleep(120);if(await b.ev(`!!document.querySelector('#viewport .ngcg-store')`))break;}}
  assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('Calendar goals passed: store, subcategories, frequency/duration/time, summary, scheduling, post-creation sheet, session Did it, custom with suggestions, five languages.');
}catch(error){await b.shot('7.1.2-goals-failure');throw error;}finally{b.close();}
