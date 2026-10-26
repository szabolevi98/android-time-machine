// Google Fit installed from Play on 6.0.1 (1.58.09) and 7.1.2 (1.68.00): Home with the demo day's wheel and timeline,
// the FAB menu, Add activity (a future end refused, a new session kept and counted), Add your weight, the Timeline
// view, Settings (the weight unit and goal notifications), Challenges refused, and the phone width.
// node tests/browser/play-fit.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns] of [['6.0.1', marshmallow, 'mmfit', 'MM'], ['7.1.2', nougat, 'ngfit', 'NG']]) {
  if (only && only !== version) continue;
  const b = await start();
  const fit = async () => (await b.save()).fit;
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event(f.tagName==='SELECT'?'change':'input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData.fit?.installed`), true, 'Fit is installed');
    await b.open('fit');
    await b.until(`!!document.querySelector('#viewport .${cls}-wheel')`);
    const before = await b.ev(`+document.querySelector('#viewport .${cls}-wheel b').textContent`);
    await b.shot(`${version}-fit`);
    // The FAB menu, then Add activity: a future end is refused, a past one is kept.
    await b.click(`#viewport .${cls}-fab`);
    await b.until(`!!document.querySelector('#viewport .${cls}-fabmenu')`);
    await b.shot(`${version}-fit-fab`);
    await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-add"]`);
    await b.until(`!!document.querySelector('#viewport [data-fit="type"]')`);
    const now = new Date(), pad = n => String(n).padStart(2, '0');
    await type('#viewport [data-fit="date"]', `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    await type('#viewport [data-fit="time"]', '23:59');
    await type('#viewport [data-fit="type"]', 'yoga');
    await b.act(`${cls}-save`);
    await b.until(`/future activity/.test(document.querySelector('#viewport .${cls}-error')?.textContent||'')`);
    const start = new Date(Date.now() - 2 * 36e5);
    await type('#viewport [data-fit="date"]', `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`);
    await type('#viewport [data-fit="time"]', `${pad(start.getHours())}:${pad(start.getMinutes())}`);
    await type('#viewport [data-fit="m"]', '20');
    await type('#viewport [data-fit="name"]', 'Morning yoga');
    await b.shot(`${version}-fit-add`);
    await b.act(`${cls}-save`);
    await b.until(`!!document.querySelector('#viewport .${cls}-wheel')`);
    const yoga = (await fit()).sessions.find(s => s.type === 'yoga');
    assert.equal(yoga?.min, 20); assert.equal(yoga.name, 'Morning yoga');
    if (new Date(yoga.start).toDateString() === new Date().toDateString()) assert.equal(await b.ev(`+document.querySelector('#viewport .${cls}-wheel b').textContent`), before + 20, 'the wheel counts the new session');
    // Add your weight.
    await b.click(`#viewport .${cls}-fab`);
    await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-weight"]`);
    await b.until(`!!document.querySelector('#viewport [data-fitw="value"]')`);
    await type('#viewport [data-fitw="value"]', '72.5');
    await b.act(`${cls}-wsave`);
    await b.until(`/72\\.5/.test(document.querySelector('#viewport .${cls}-big')?.textContent||'')`);
    assert.equal((await fit()).weights[0].kg, 72.5);
    // Timeline lists every session under its day.
    await b.act(`${cls}-view`, {id: 'timeline'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-session').length===4 && !!document.querySelector('#viewport .${cls}-day')`);
    assert.ok(await b.ev(`/Morning yoga/.test(document.querySelector('#viewport').textContent)`));
    // Settings: the unit and the goal notifications.
    await b.act(`${cls}-view`, {id: 'settings'});
    await b.click(`#viewport [data-action="${cls}-unit"]`);
    assert.equal((await fit()).unit, 'lb');
    await b.click(`#viewport [data-action="${cls}-notify"]`);
    assert.equal((await fit()).notify, false);
    await b.shot(`${version}-fit-settings`);
    // Challenges keep the limit; the drawer goes home.
    await b.act(`${cls}-drawer`);
    await b.click(`#viewport [data-action="${cls}-view"][data-id="groups"]`);
    await b.act(`${cls}-view`, {id: 'home'});
    await b.until(`/159\\.8/.test(document.querySelector('#viewport .${cls}-big')?.textContent||'')`);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('fit');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'fit ok');
  } catch (error) { await b.shot(`${version}-fit-failure`); throw error; } finally { b.close(); }
}
