// 6.0.1 and 7.1.2 Messenger › Advanced: no Access Point Names (Messenger uses the system APN table), and Wireless
// alerts opens CellBroadcastReceiver's CellBroadcastListActivity: the empty list, Settings in its overflow (the
// CellBroadcastSettings rows), Back to the list and to Messenger's Advanced settings.
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';

const rowsText = (b, sel) => b.ev(`[...document.querySelectorAll(${JSON.stringify(sel)})].map(x=>x.textContent.trim())`);
const tapRow = (b, sel, title) => b.ev(`(()=>{const r=[...document.querySelectorAll(${JSON.stringify(sel)})].find(x=>x.textContent.includes(${JSON.stringify(title)}));if(!r)return false;r.click();return true})()`);

async function run(name, start, E) {
  const b = await start();
  try {
    await b.language('en');
    await b.ev(`${E.ns}.register('zz-cap',{render:c=>{window.__c=c;return ''}})`); await b.open('zz-cap');
    await b.ev(`${E.ns}.openPrefs(window.__c,'messenger','preferences_per_subscription','')`); await sleep(500);
    const rows = await rowsText(b, `#viewport ${E.row}`);
    assert.ok(rows.some(r => r.includes('Wireless alerts')), `${name}: Advanced has Wireless alerts`);
    assert.ok(!rows.some(r => r.includes('Access Point Names')), `${name}: Advanced has no Access Point Names`);
    assert.equal(await tapRow(b, `#viewport ${E.row}`, 'Wireless alerts'), true);
    await b.until(`/no active alerts in your area/.test(document.querySelector('#viewport ${E.empty}')?.textContent||'')`);
    assert.match(await b.ev(`document.querySelector('#viewport ${E.title}')?.textContent||''`), /Cell Broadcasts/, `${name}: the list's title`);
    await b.click(`#viewport [data-action="${E.menu}"]`);
    await b.until(`!!document.querySelector('${E.item}')`);
    assert.deepEqual(await rowsText(b, E.item), ['Settings'], `${name}: the overflow holds Settings only`);
    await b.click(E.item); await sleep(400);
    const settings = await rowsText(b, `#viewport ${E.row}`);
    assert.ok(settings.some(r => r.startsWith('Show extreme threats')) && settings.some(r => r.startsWith('Alert reminder')), `${name}: Settings shows the alert settings`);
    await b.act(E.back); await sleep(400);
    assert.ok(await b.ev(`!!document.querySelector('#viewport ${E.empty}')`), `${name}: Back returns to the list`);
    await b.act(E.back); await sleep(400);
    assert.ok((await rowsText(b, `#viewport ${E.row}`)).some(r => r.includes('Wireless alerts')), `${name}: Back again returns to Advanced`);
    assert.deepEqual(b.errors, []);
    console.log(`${name} Cell broadcasts passed: Advanced without APNs, Wireless alerts' empty list, its Settings, Back twice.`);
  } finally { await b.close(); }
}
await run('6.0.1', marshmallow, {ns: 'MM', row: '[data-action="mmpf-pref"]', empty: '.mmpf-empty', title: '.mmpf-bar span', menu: 'mm-menu', item: '.mmmenu-item, [data-action="mmmenu-item"]', back: 'mmpf-up'});
await run('7.1.2', nougat, {ns: 'NG', row: '[data-action="ngap-pref"]', empty: '.ngap-empty', title: '.ngst-abtitle', menu: 'ng-menu', item: '.ngmenu-item', back: 'ngap-up'});
