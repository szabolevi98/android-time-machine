import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat(),back=async()=>{await b.click('#nav-bar [data-key="back"]');await sleep(400);};
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const row=async label=>assert.equal(await b.ev(`(()=>{const el=[...document.querySelectorAll('#viewport .ngst-pref')].find(el=>el.textContent.includes(${JSON.stringify(label)}));el?.click();return !!el;})()`),true,label);await sleep(350);
const title=()=>text('#viewport .ngst-abtitle');
const missing=()=>b.ev(`!!document.querySelector('#viewport .ng-missing, #viewport .ngst-missing')`);
const btn=n=>b.click(`#overlay-root [data-action="ngdlg-button"][data-index="${n}"]`);
try{
 await b.language('en');
 // Every input method enabled, as Manage keyboards would leave it.
 await b.ev(`(()=>{const key='android-time-machine-ng-v1',d=JSON.parse(localStorage.getItem(key));d.settings.imes=['gboard','voice','hindi','japanese','korean','pinyin'];localStorage.setItem(key,JSON.stringify(d));location.reload();})()`);
 await b.until(`document.querySelector('#screen')?.classList.contains('view-home')`);
 for(const [id,name] of [['hindi','Google Indic Keyboard'],['korean','Google Korean Input'],['pinyin','Google Pinyin Input'],['japanese','Google Japanese Input']]){
  await b.open('settings','keyboards');await b.act('ngpe-ime',{id});await sleep(400);
  assert.equal(await missing(),false,id);assert.ok(await b.ev(`document.querySelectorAll('#viewport .ngst-pref').length>2`),id+' headers');
  await b.ev(`document.querySelector('#viewport .ngst-pref').click()`);await sleep(300);assert.equal(await missing(),false,id+' first fragment');
 }
 // Google Japanese Input: Dictionary tool, theme, keyboard layout, licences, privacy link.
 await b.open('settings','keyboards');await b.act('ngpe-ime',{id:'japanese'});await sleep(300);
 await row('Dictionary tool');assert.equal(await title(),'Dictionary tool');assert.ok((await text('#viewport .ngime-spinner')).includes('User Dictionary 1'));
 await b.act('ngime-add');await b.ev(`(()=>{const [w,r]=document.querySelectorAll('#overlay-root input');w.value='東京';w.dispatchEvent(new Event('input'));r.value='とうきょう';r.dispatchEvent(new Event('input'));const s=document.querySelector('#overlay-root select');s.value='place_name';s.dispatchEvent(new Event('change'));})()`);await btn(1);
 assert.deepEqual((await b.save()).imeDictionary.dicts[0].words,[{word:'東京',reading:'とうきょう',pos:'place_name'}]);assert.ok((await text('#viewport .ngime-list')).includes('Place name'));
 await b.act('ngime-delete');assert.ok((await text('#toast-root, #overlay-root, body')).length>0);
 await b.click('#viewport .ngime-entry input');await b.act('ngime-delete');assert.equal((await b.save()).imeDictionary.dicts[0].words.length,0);
 await b.shot('7.1.2-ime-dictool');await back();
 await row('Theme');await b.act('ngime-theme',{theme:'dark'});assert.equal((await b.save()).appPrefs.imejapanese.theme,'dark');await back();
 await row('Keyboard layout');await row('Keyboard layout');await b.click('#overlay-root .ngdlg-item[data-index="2"]');assert.equal((await b.save()).appPrefs.imejapanese['japanese_keyboard_layout.portrait'],'GODAN');await back();
 const about=async()=>{await b.click('#viewport .ngst-actions [data-action="ng-menu"]');await sleep(250);await b.ev(`[...document.querySelectorAll('#overlay-root [data-action="ngmenu-item"]')].find(e=>/About/.test(e.textContent)).click()`);await sleep(400);};
 await about();assert.ok((await text('#viewport')).includes('2.18.2583'),'version');await row('Open source licenses');assert.ok(await b.ev(`!!document.querySelector('#viewport iframe.ngap-licframe')`));await back();
 await row('Privacy');await sleep(500);assert.ok(await b.ev(`document.querySelector('#screen').classList.contains('view-chrome')`),'privacy policy in Chrome');
 // Gboard's licences (no metadata: the whole text) and the Phone app's licence menu.
 await b.open('settings','keyboards');await b.act('ngpe-ime',{id:'gboard'});await sleep(300);await about();await row('Open source licenses');await b.until(`document.querySelector('#viewport .ngap-lictext')?.textContent.includes('latinime')`);
 // Spell checker settings → Gboard's settings.
 await b.open('settings','spellcheck');await b.act('ngpe-spellsettings');await sleep(400);assert.equal(await missing(),false,'spell checker settings');
 // Text-to-speech output › the engine's gear → Google TTS Options; Anonymous usage reports.
 await b.open('settings','xml:tts_settings');await b.ev(`document.querySelector('#viewport .ngpe-engine .ngst-gear')?.click()`);await sleep(400);
 assert.equal(await title(),'Google TTS Options');assert.ok((await text('#viewport')).includes('Auto-update voices'));assert.equal((await text('#viewport')).includes('text selection menu'),false,'process_text removed');
 await row('Anonymous usage reports');await b.act('ngpe-tts-analytics');assert.equal((await b.save()).appPrefs.tts.analytics,false);await b.shot('7.1.2-tts-analytics');await back();
 // Links that used to reach no screen.
 await b.open('help','feedback:calculator');assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('view-help')`),true);
 await b.open('settings');await b.ev(`[...document.querySelectorAll('#viewport [data-action="ngst-tab"], #viewport .ngst-tab')].find(e=>/Support/.test(e.textContent))?.click()`);await sleep(300);await b.act('ngst-support',{kind:'tips'});await sleep(400);
 assert.ok(await b.ev(`document.querySelector('#screen').classList.contains('view-chrome')`),'tips & tricks in Chrome');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('settings','keyboards');await b.act('ngpe-ime',{id:'japanese'});await sleep(300);await row(lang==='en'?'Dictionary tool':'');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('Input methods passed: four IME settings, Dictionary tool, theme, layout, licences, links, spell checker, Google TTS options, feedback and tips.');
}catch(error){await b.shot('7.1.2-imes-failure');throw error;}finally{b.close();}
