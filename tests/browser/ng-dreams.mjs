import assert from 'node:assert/strict';
import {nougat,sleep} from './ng-harness.mjs';
const b=await nougat();
const text=sel=>b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
const pref=async key=>b.ev(`(()=>{[...document.querySelectorAll('#viewport .ngap [data-action="ngap-pref"]')].find(el=>el.textContent.includes(NG.text('appprefs').t('PrebuiltDeskClockGoogle/'+${JSON.stringify(key)}))).click();})()`);
try{
 await b.language('en');await b.open('settings','dream');assert.ok(await b.ev(`document.querySelectorAll('#viewport .ngdr-row').length===3`));
 await b.click('#viewport [data-action="ngdr-settings"][data-id="clock"]');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngap')`));await pref('clock_style');await b.click('#overlay-root .ngdlg-item[data-index="0"]');assert.equal((await b.save()).appPrefs.clocksaver.screensaver_clock_style,'analog');await b.click('#nav-bar [data-key="back"]');
 await b.open('daydream','clock');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngsv-analog')`));assert.ok(await b.ev(`document.querySelector('#viewport .ngsv-clock').classList.contains('night')`));assert.equal(await b.ev(`document.querySelector('#screen').classList.contains('view-daydream')`),true);await b.shot('7.1.2-dream-clock');await b.click('#viewport .ngsv');await b.until(`!document.querySelector('#screen').classList.contains('view-daydream')`);
 await b.open('daydream','colors');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngsv-colors')`));await b.click('#viewport .ngsv');
 await b.open('settings','dream');await b.click('#viewport [data-action="ngdr-settings"][data-id="photos"]');assert.ok((await text('#viewport')).includes('Albums on device'));await b.ev(`document.querySelector('#viewport [data-action="ngsv-album"]').click()`);assert.ok(Array.isArray((await b.save()).dreams.albums));await b.ev(`document.querySelector('#viewport [data-action="ngsv-album"]').click()`);assert.equal((await b.save()).dreams.albums,undefined);
 await b.open('daydream','photos');assert.ok(await b.ev(`!!document.querySelector('#viewport .ngsv-photo svg, #viewport .ngsv-photo img')`));await b.shot('7.1.2-dream-photos');
 for(const lang of ['en','hu','de','fr','es']){await b.language(lang);await b.open('daydream','clock');await b.open('settings','dream');await b.click('#viewport [data-action="ngdr-settings"][data-id="photos"]');assert.deepEqual(await b.ev(`[...AndroidStrings.misses]`),[],lang);}
 b.check();console.log('Screen savers passed: clock style/night mode settings and analog dream, Colors, Photos album settings and slideshow, wake on touch, five languages.');
}catch(error){await b.shot('7.1.2-dreams-failure');throw error;}finally{b.close();}
