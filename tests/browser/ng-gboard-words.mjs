import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),key=k=>b.click(`.ngboard [data-gb=${JSON.stringify(k)}]`),field='#viewport [data-f="subject"]';
try{
 await b.language('en');await b.ev(`(()=>{const m=NG.module('gmail'),f=m.render;m.render=c=>{window.wordTestContext=c;return f(c)};})()`);await b.open('gmail');
 for(let i=0;i<8&&!await b.ev(`document.querySelector('#viewport [data-action="nggm-compose"]')`);i++){const a=await b.ev(`document.querySelector('#viewport [data-action="nggm-tdone"],#viewport [data-action="nggm-setupdone"]')?.dataset.action`);await b.act(a);}
 await b.click('#viewport [data-action="nggm-compose"]');await b.ev(`document.querySelector(${JSON.stringify(field)}).focus()`);await b.until(`NG.keyboardWords.get('en').size>100000`);
 const value=()=>b.ev(`document.querySelector(${JSON.stringify(field)}).value`);
 const reset=async()=>{await b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(field)});f.value='';f.setSelectionRange(0,0);f.dispatchEvent(new InputEvent('input',{bubbles:true}));})()`);};
 for(const c of 'teh')await key('text:'+c);await key('space');assert.equal(await value(),'the ','native vocabulary autocorrects transposition');await key('delete');assert.equal(await value(),'teh','backspace restores the original composing word');
 await reset();for(const c of 'hel')await key('text:'+c);assert.equal(await b.ev(`!!document.querySelector('.ngboard [data-gb="candidate:hello"]')`),true);await key('candidate:hello');assert.equal(await value(),'hello ');
 await reset();
 const centres=await b.ev(`Object.fromEntries([...'helo'].map(k=>{const r=document.querySelector('.ngboard [data-gb="text:'+k+'"]').getBoundingClientRect();return [k,{x:r.x+r.width/2,y:r.y+r.height/2}]}))`),path=[...'helo'].map(k=>centres[k]);
 const mouse=(type,p,buttons)=>b.send('Input.dispatchMouseEvent',{type,...p,button:'left',buttons,clickCount:type==='mouseMoved'?0:1});await mouse('mousePressed',path[0],1);
 for(let j=1;j<path.length;j++)for(let i=1;i<=12;i++){const a=path[j-1],z=path[j];await mouse('mouseMoved',{x:a.x+(z.x-a.x)*i/12,y:a.y+(z.y-a.y)*i/12},1);await sleep(8);}
 assert.equal(await b.ev(`!!document.querySelector('.ngboard-trail')`),true);await b.shot('7.1.2-gboard-glide');await mouse('mouseReleased',path.at(-1),0);assert.equal(await value(),'hello','glide decodes repeated letter from the native dictionary');await key('space');assert.equal(await value(),'hello ');
 await b.ev(`wordTestContext.data.settings.userWords=[{word:'be right back',shortcut:'brb'},{word:'SzabóLevente',shortcut:''}];wordTestContext.save()`);await reset();for(const c of 'brb')await key('text:'+c);await key('candidate:be right back');assert.equal(await value(),'be right back ');
 await b.ev(`NG.setAppPref(wordTestContext,'gboard','pref_key_auto_correction',false)`);await reset();for(const c of 'teh')await key('text:'+c);await key('space');assert.equal(await value(),'teh ');
 await b.ev(`NG.setAppPref(wordTestContext,'gboard','show_suggestions',false)`);await key('text:h');assert.equal(await b.ev(`document.querySelectorAll('.ngboard-candidate').length`),0);
 await b.click('#nav-bar [data-key="back"]');await b.ev(`NG.setAppPref(wordTestContext,'gboard','show_suggestions',true);NG.setAppPref(wordTestContext,'gboard','pref_key_auto_correction',true);document.querySelector('#viewport [data-f="to"]').focus()`);assert.equal(await b.ev(`document.querySelectorAll('.ngboard-candidate').length`),0,'email editor excludes prediction');
 const learnedBefore=(await b.save()).appPrefs.gboard.learned_words.length;
 await b.ev(`(()=>{const f=document.createElement('input');f.type='password';f.id='ime-password-contract';document.querySelector('#viewport').append(f);f.focus()})()`);for(const c of 'secret')await key('text:'+c);await key('space');assert.equal(await b.ev(`document.querySelectorAll('.ngboard-candidate').length`),0,'password excludes prediction');assert.equal((await b.save()).appPrefs.gboard.learned_words.length,learnedBefore,'password is not learned');
 for(const [lang,query,expected] of [['de','hal','hallo'],['fr','bon','bonjour'],['es','ho','hola'],['hu','szab','SzabóLevente']]){
  await b.language(lang);await b.open('gmail');await b.act('nggm-compose');await b.ev(`document.querySelector(${JSON.stringify(field)}).focus()`);if(lang!=='hu')await b.until(`NG.keyboardWords.get(${JSON.stringify(lang)}).size>50000`);await reset();for(const c of query)await key('text:'+c);assert.equal(await b.ev(`[...document.querySelectorAll('.ngboard-candidate')].some(e=>e.textContent.toLowerCase()===${JSON.stringify(expected.toLowerCase())})`),true,lang);assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);
 }
 await b.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});await sleep(100);await b.shot('7.1.2-gboard-candidates-phone');assert.equal(await b.ev(`document.documentElement.scrollWidth<=innerWidth+1`),true);b.check();console.log('Gboard words passed: native D3 completions, transposition/undo, real glide, personal shortcuts, preferences, private editor contracts, four dictionaries and Hungarian personal words.');
}catch(e){await b.shot('7.1.2-gboard-words-failure');throw e;}finally{b.close();}
