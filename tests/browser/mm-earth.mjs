// Google Earth 8.0.4 on 6.0.1 (installed from Play): the Blue Marble globe, Search flying to a place, My location with
// the blue dot, the compass, Share, Layers kept, Settings (the APK's settings.xml) and Settings › Apps' Uninstall.
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
const b = await marshmallow();
try {
  await b.language('en');
  await b.open('earth');
  await b.until(`!!document.querySelector('#viewport .mmea-globe')`);
  assert.ok(!await b.ev(`!!document.querySelector('#viewport .mm-missing')`), 'Earth is built');
  await b.until(`(()=>{const c=document.querySelector('#viewport .mmea-globe');if(!c||!c.width)return false;const d=c.getContext('2d').getImageData(c.width/2|0,c.height/2|0,1,1).data;return d[3]>0&&!(d[0]===22&&d[1]===62)})()`);
  await b.shot('6.0.1-earth');
  // Search.
  await b.act('mmea-search');
  await b.until(`!!document.querySelector('#viewport .mmea-field input')`);
  await b.ev(`(()=>{const f=document.querySelector('#viewport .mmea-field');f.querySelector('input').value='Tokyo';f.requestSubmit();return 1})()`);
  await b.until(`(()=>{const v=EarthGlobe.current();return v&&!v.anim&&Math.abs(v.lon-139.69)<1&&Math.abs(v.lat-35.69)<1})()`);
  assert.match(await b.ev(`document.querySelector('#viewport .mmea-bar b')?.textContent||''`), /Tokyo/);
  await b.shot('6.0.1-earth-tokyo');
  // Not found: the APK's text.
  await b.act('mmea-search');
  await b.ev(`(()=>{const f=document.querySelector('#viewport .mmea-field');f.querySelector('input').value='Atlantis';f.requestSubmit();return 1})()`);
  await b.until(`/Not Found: Atlantis/.test(document.body.textContent)`);
  // The overflow after a search: My location.
  await b.click('#viewport .mmea-more');
  await b.until(`!!document.querySelector('.mmmenu-item, [data-action="mmmenu-item"]')`);
  await b.click('.mmmenu-item, [data-action="mmmenu-item"]');
  await b.until(`(()=>{const v=EarthGlobe.current();return v&&!v.anim&&Math.abs(v.lon+122.08)<1&&Math.abs(v.lat-37.39)<1})()`);
  // The compass.
  await b.ev(`(EarthGlobe.current().heading=80,1)`);
  await b.act('mmea-north');
  await b.until(`Math.abs(((EarthGlobe.current().heading+180)%360)-180)<1`);
  // Layers.
  await b.act('mmea-drawer');
  await b.until(`!!document.querySelector('#viewport .mmea-drawer')`);
  await b.shot('6.0.1-earth-drawer');
  await b.act('mmea-layers');
  await b.until(`document.querySelectorAll('[data-action="mmdlg-item"]').length===6`);
  await b.click('[data-action="mmdlg-item"][data-index="3"]');
  assert.ok((await b.save()).earthLayers.includes('Wikipedia'));
  await b.click('[data-action="mmdlg-button"]');
  // Settings.
  await b.act('mmea-settings');
  await b.until(`/Data Cache Size/.test(document.querySelector('#viewport')?.textContent||'') && /About Google Earth/.test(document.querySelector('#viewport')?.textContent||'')`);
  await b.shot('6.0.1-earth-settings');
  // Settings › Apps: Earth is a downloaded app with Uninstall.
  assert.equal(await b.ev(`!!MM.appsData.earth?.installed`), true);
  await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
  await b.open('earth');
  await b.until(`!!document.querySelector('#viewport .mmea-globe')`);
  assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
  await sleep(300);
  b.check();
  console.log('mm-earth ok');
} catch (error) { await b.shot('6.0.1-earth-failure'); throw error; } finally { b.close(); }
