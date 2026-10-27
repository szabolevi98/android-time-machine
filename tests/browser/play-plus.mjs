// Google+ installed from Play on 6.0.1 (8.4.0) and 7.1.2 (9.14.0): the Home stream's three demo posts, +1 and back, a
// new post (POST disabled while empty, the discard question, then posted at the top), Delete on one's own post, Share
// opening the share sheet, Notifications' "All caught up!", Collections refused, and the phone width.
// node tests/browser/play-plus.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns, menuItem, dlg, sheet] of [['6.0.1', marshmallow, 'mmplus', 'MM', '.mmmenu-item', 'mmdlg', 'mmin'], ['7.1.2', nougat, 'ngplus', 'NG', '.ngmenu-item', 'ngdlg', 'ngin']]) {
  if (only && only !== version) continue;
  const b = await start();
  const state = async () => (await b.save()).plusPlay;
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const button = async label => { await b.until(`[...document.querySelectorAll('.${dlg} button')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('.${dlg} button')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData['google-plus']?.installed`), true, 'Google+ is installed');
    await b.open('google-plus');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===3`);
    await b.shot(`${version}-plus`);
    // +1 and back.
    await b.click(`#viewport .${cls}-plus[data-id="g1"]`);
    await b.until(`document.querySelector('#viewport .${cls}-plus[data-id="g1"]').textContent.includes('13')`);
    await b.click(`#viewport .${cls}-plus[data-id="g1"]`);
    assert.deepEqual((await state()).plused, []);
    // A new post: POST is off while empty; Back with text asks to discard.
    await b.click(`#viewport .${cls}-fab`);
    await b.until(`!!document.querySelector('#viewport [data-plus-draft]')`);
    assert.equal(await b.ev(`document.querySelector('#viewport .${cls}-post').disabled`), true);
    await type('#viewport [data-plus-draft]', 'Hello from the simulator');
    assert.equal(await b.ev(`document.querySelector('#viewport .${cls}-post').disabled`), false);
    await b.shot(`${version}-plus-compose`);
    await b.act(`${cls}-compose-close`);
    await button('Cancel');
    await b.click(`#viewport .${cls}-post`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===4 && /Hello from the simulator/.test(document.querySelector('#viewport .${cls}-card p').textContent)`);
    // Delete one's own post.
    await b.click(`#viewport .${cls}-card [data-action="${cls}-card"]`);
    await menu('Delete');
    await button('Delete');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===3`);
    assert.equal((await state()).mine.length, 0);
    // Share opens the share sheet.
    await b.click(`#viewport [data-action="${cls}-share"][data-id="g2"]`);
    await b.until(`!!document.querySelector('.${sheet}-sheet')`);
    await b.click(`.${sheet}-dim`);
    // Notifications, then Collections refused.
    await b.click(`#viewport .${cls}-nav [data-id="notifications"]`);
    await b.until(`/All caught up!/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.click(`#viewport .${cls}-nav [data-id="collections"]`);
    assert.ok(await b.ev(`!!document.querySelector('#viewport .${cls}-empty')`), 'Collections stays on the page it was');
    await b.click(`#viewport .${cls}-nav [data-id="home"]`);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('google-plus');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'plus ok');
  } catch (error) { await b.shot(`${version}-plus-failure`); throw error; } finally { b.close(); }
}
