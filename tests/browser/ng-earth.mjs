// Google Earth 9.0.4.2 on 7.1.2 (installed from Play): the Blue Marble globe, Search flying to a place, I'm Feeling
// Lucky, the overflow's My Location, the compass, Map Style, My Places, Settings (the APK's settings.xml) and the
// drawer of apps listing it.
import assert from 'node:assert/strict';
import {nougat, sleep} from './ng-harness.mjs';
const b = await nougat();
const view = () => b.ev(`EarthGlobe.current()`);
try {
  await b.language('en');
  await b.open('earth');
  await b.until(`!!document.querySelector('#viewport .ngea-globe')`);
  assert.ok(!await b.ev(`!!document.querySelector('#viewport .ng-missing')`), 'Earth is built');
  await b.until(`(()=>{const c=document.querySelector('#viewport .ngea-globe');if(!c||!c.width)return false;const d=c.getContext('2d').getImageData(c.width/2|0,c.height/2|0,1,1).data;return d[3]>0&&!(d[0]===22&&d[1]===62)})()`);
  await b.shot('7.1.2-earth');
  // Search: the field, a query, Enter flies to the first result.
  await b.act('ngea-search');
  await b.until(`!!document.querySelector('#viewport .ngea-input')`);
  await b.ev(`(()=>{const f=document.querySelector('#viewport .ngea-input');f.value='Budap';f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  await b.until(`[...document.querySelectorAll('#viewport .ngea-result')].some(r=>/Budapest/.test(r.textContent))`);
  await b.click('#viewport .ngea-result');
  await b.until(`(()=>{const v=EarthGlobe.current();return v&&!v.anim&&Math.abs(v.lon-19.04)<1&&Math.abs(v.lat-47.5)<1})()`);
  assert.match(await b.ev(`document.querySelector('#viewport .ngea-card')?.textContent||''`), /Budapest/);
  await b.shot('7.1.2-earth-budapest');
  // No results.
  await b.act('ngea-search');
  await b.ev(`(()=>{const f=document.querySelector('#viewport .ngea-input');f.value='zzqx';f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  await b.until(`/No results/.test(document.querySelector('#viewport .ngea-empty')?.textContent||'')`);
  await b.act('ngea-search-back');
  // I'm Feeling Lucky flies somewhere and names it.
  await b.act('ngea-lucky');
  await b.until(`!!document.querySelector('#viewport .ngea-card b')?.textContent`);
  // The overflow: My Location.
  await b.click('#viewport .ngea-more');
  await b.until(`!!document.querySelector('.ngmenu-item')`);
  assert.deepEqual(await b.ev(`[...document.querySelectorAll('.ngmenu-item')].map(i=>i.textContent)`), ['My Location', 'Share Link']);
  await b.click('.ngmenu-item');
  await b.until(`(()=>{const v=EarthGlobe.current();return v&&!v.anim&&Math.abs(v.lon+122.08)<1&&Math.abs(v.lat-37.39)<1})()`);
  // The compass turns the heading back.
  await b.ev(`(EarthGlobe.current().heading=80,1)`);
  await b.act('ngea-north');
  await b.until(`Math.abs(((EarthGlobe.current().heading+180)%360)-180)<1`);
  // 2D / 3D and Map Style are kept.
  await b.act('ngea-3d');
  assert.equal((await b.save()).earth9.three, true);
  await b.act('ngea-drawer');
  await b.until(`!!document.querySelector('#viewport .ngea-drawer')`);
  await b.shot('7.1.2-earth-drawer');
  await b.click('#viewport .ngea-drawer [data-action="ngea-style"]');
  await b.click('#viewport [data-action="ngea-style-set"][data-index="2"]');
  assert.equal((await b.save()).earth9.style, 2);
  await b.act('ngea-panel-close');
  await b.act('ngea-places');
  assert.match(await b.ev(`document.querySelector('#viewport .ngea-panel p')?.textContent||''`), /Welcome to My Places/);
  await b.act('ngea-panel-close');
  // Settings: the APK's settings.xml.
  await b.act('ngea-settings');
  await b.until(`/Flight animation speed/.test(document.querySelector('#viewport')?.textContent||'') && /9\\.0\\.4\\.2/.test(document.querySelector('#viewport')?.textContent||'')`);
  await b.shot('7.1.2-earth-settings');
  // The apps drawer lists it.
  assert.equal(await b.ev(`!!NG.appsData.earth?.installed`), true);
  await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
  await b.open('earth');
  await b.until(`!!document.querySelector('#viewport .ngea-globe')`);
  assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
  await sleep(300);
  b.check();
  console.log('ng-earth ok');
} catch (error) { await b.shot('7.1.2-earth-failure'); throw error; } finally { b.close(); }
