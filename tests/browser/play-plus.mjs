// Google+ installed from Play on 6.0.1 (8.4.0) and 7.1.2 (9.14.0): the Home stream's three demo posts, +1 and back, a
// new post (POST disabled while empty, the discard question, then posted at the top), Delete on one's own post, Share
// opening the share sheet, Notifications' "All caught up!", Collections refused, and the phone width. Round five (T64):
// a post with a picture from the phone's photos and the phone's location, and Settings (checkboxes, Ringtone, About).
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
    // A post with a picture and the location.
    await b.click(`#viewport .${cls}-fab`);
    await b.until(`!!document.querySelector('#viewport [data-plus-draft]')`);
    await b.click(`#viewport [data-action="${cls}-place"]`);
    await b.click(`#viewport [data-action="${cls}-photo"]`);
    if (version === '6.0.1') { await b.until(`!!document.querySelector('#viewport [data-action="mmsa-pickone"]')`); await b.click('#viewport [data-action="mmsa-pickone"]'); }
    else { await b.until(`!!document.querySelector('#viewport [data-action="ngdocs-root"][data-root="images"]')`); await b.click('#viewport [data-action="ngdocs-root"][data-root="images"]'); await b.until(`!!document.querySelector('#viewport .ngdocs-item')`); await b.click('#viewport .ngdocs-item'); }
    await b.until(`!!document.querySelector('#viewport .${cls}-picture.draft svg') && /Mountain View/.test(document.querySelector('#viewport .${cls}-place')?.textContent||'')`);
    await b.click(`#viewport .${cls}-post`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===5 && !!document.querySelector('#viewport .${cls}-card .${cls}-picture svg')`);
    const pic = (await state()).mine.at(-1);
    assert.ok(pic.photo != null); assert.equal(pic.place, 'Mountain View, CA');
    await b.click(`#viewport .${cls}-card [data-action="${cls}-card"]`);
    await menu('Delete');
    await button('Delete');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===4`);
    // Settings: Vibrate off, Ringtone Silent, About Google+.
    await b.act(`${cls}-drawer`);
    await b.click(`#viewport [data-action="${cls}-page"][data-id="settings"]`);
    await b.until(`!!document.querySelector('#viewport .${cls}-settings')`);
    await b.click(`#viewport [data-action="${cls}-pref"][data-id="vibrate"]`);
    assert.equal((await state()).prefs.vibrate, false);
    await b.click(`#viewport [data-action="${cls}-ringtone"]`);
    await b.until(`[...document.querySelectorAll('.${dlg}-item')].some(x=>x.textContent.includes('Silent'))`);
    await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes('Silent')).click()`);
    assert.equal((await state()).prefs.silent, true);
    await b.click(`#viewport [data-action="${cls}-about"]`);
    await b.until(`/(8|9)[.]/.test(document.querySelector('.${dlg}')?.textContent||'') && (document.querySelector('.${dlg}')?.textContent||'').includes('Google+ ')`);
    await button('OK');
    await b.shot(`${version}-plus-settings`);
    await b.act(`${cls}-settings-close`);
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
