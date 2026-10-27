// Google Fit installed from Play on 6.0.1 (1.58.09) and 7.1.2 (1.68.00): Home with the demo day's wheel and timeline,
// the FAB menu, Add activity (the type dialog with the APK's whole list and the last picked first, a future end
// refused, Discard changes?, a new session kept and counted), Add your weight in stones, the goal card's Edit goal
// (a step goal) and Delete goal, Settings (Gender, Height in feet and inches, the Units card, goal notifications),
// the Timeline view, Challenges refused, and the phone width.
// node tests/browser/play-fit.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns, menuItem, dlg] of [['6.0.1', marshmallow, 'mmfit', 'MM', '.mmmenu-item', 'mmdlg'], ['7.1.2', nougat, 'ngfit', 'NG', '.ngmenu-item', 'ngdlg']]) {
  if (only && only !== version) continue;
  const b = await start();
  const fit = async () => (await b.save()).fit;
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event(f.tagName==='SELECT'?'change':'input',{bubbles:true}));return 1})()`);
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const button = async label => { await b.until(`[...document.querySelectorAll('.${dlg} button')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('.${dlg} button')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const item = async label => { await b.until(`[...document.querySelectorAll('.${dlg}-item')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const pad = n => String(n).padStart(2, '0');
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData.fit?.installed`), true, 'Fit is installed');
    await b.open('fit');
    await b.until(`!!document.querySelector('#viewport .${cls}-wheel')`);
    const before = await b.ev(`+document.querySelector('#viewport .${cls}-wheel b').textContent`);
    await b.shot(`${version}-fit`);
    // The FAB menu, then Add activity.
    await b.click(`#viewport .${cls}-fab`);
    await b.until(`!!document.querySelector('#viewport .${cls}-fabmenu')`);
    await b.shot(`${version}-fit-fab`);
    await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-add"]`);
    await b.until(`!!document.querySelector('#viewport .${cls}-type')`);
    // The type dialog lists every type of the APK.
    await b.click(`#viewport .${cls}-type`);
    await b.until(`document.querySelectorAll('.${dlg}-item').length>90`);
    await item('Yoga');
    await b.until(`/Yoga/.test(document.querySelector('#viewport .${cls}-type').textContent)`);
    // Leaving with changes asks first; Keep stays.
    await b.act(`${cls}-cancel`);
    await button('Keep');
    assert.ok(await b.ev(`!!document.querySelector('#viewport .${cls}-type')`), 'Keep stays in the editor');
    const now = new Date();
    await type('#viewport [data-fit="date"]', `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`);
    await type('#viewport [data-fit="time"]', '23:59');
    await b.act(`${cls}-save`);
    await b.until(`/future activity/.test(document.querySelector('#viewport .${cls}-error')?.textContent||'')`);
    const from = new Date(Date.now() - 2 * 36e5);
    await type('#viewport [data-fit="date"]', `${from.getFullYear()}-${pad(from.getMonth() + 1)}-${pad(from.getDate())}`);
    await type('#viewport [data-fit="time"]', `${pad(from.getHours())}:${pad(from.getMinutes())}`);
    await type('#viewport [data-fit="m"]', '20');
    await type('#viewport [data-fit="name"]', 'Morning yoga');
    await b.shot(`${version}-fit-add`);
    await b.act(`${cls}-save`);
    await b.until(`!!document.querySelector('#viewport .${cls}-wheel')`);
    const s1 = await fit(), yoga = s1.sessions.find(s => s.type === 'yoga');
    assert.equal(yoga?.min, 20); assert.equal(yoga.name, 'Morning yoga'); assert.equal(s1.recent[0], 'yoga');
    if (new Date(yoga.start).toDateString() === new Date().toDateString()) assert.equal(await b.ev(`+document.querySelector('#viewport .${cls}-wheel b').textContent`), before + 20, 'the wheel counts the new session');
    // The last picked type comes first.
    await b.click(`#viewport .${cls}-fab`);
    await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-add"]`);
    await b.click(`#viewport .${cls}-type`);
    await b.until(`document.querySelector('.${dlg}-item')?.textContent.trim()==='Yoga'`);
    await b.ev(`document.querySelector('.${dlg}-item').click()`);
    await b.act(`${cls}-cancel`);
    // Add your weight in stones (st + lb).
    await b.click(`#viewport .${cls}-fab`);
    await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-weight"]`);
    await b.until(`!!document.querySelector('#viewport [data-fit-select="eunit"]')`);
    await type('#viewport [data-fit-select="eunit"]', '2');
    await b.until(`!!document.querySelector('#viewport [data-fit="a"]')`);
    await type('#viewport [data-fit="a"]', '11');
    await type('#viewport [data-fit="b"]', '6');
    await b.act(`${cls}-save`);
    await b.until(`/11 st 6 lb/.test(document.querySelector('#viewport .${cls}-big')?.textContent||'')`);
    const s2 = await fit();
    assert.equal(Math.round(s2.weights[0].kg * 10) / 10, 72.6); assert.equal(s2.units.weight, 2);
    // The goal card: Edit goal to 8000 steps, then Delete goal.
    await b.click(`#viewport [data-action="${cls}-goalmenu"]`);
    await menu('Edit goal');
    await b.until(`!!document.querySelector('#viewport [data-fit-select="goaltype"]')`);
    await type('#viewport [data-fit-select="goaltype"]', '1');
    await b.until(`/I will take/.test(document.querySelector('#viewport .${cls}-sentence')?.textContent||'')`);
    await type('#viewport [data-fit="value"]', '8000');
    await b.act(`${cls}-save`);
    assert.deepEqual((await fit()).goal, {type: 'steps', value: 8000});
    await b.until(`/8000/.test(document.querySelector('#viewport .${cls}-wheel small')?.textContent||'')`);
    await b.click(`#viewport [data-action="${cls}-goalmenu"]`);
    await menu('Delete goal');
    await b.until(`!!document.querySelector('#viewport [data-action="${cls}-goal"]')`);
    assert.equal((await fit()).goal, null);
    // Timeline lists every session under its day.
    await b.act(`${cls}-view`, {id: 'timeline'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-session').length===4 && !!document.querySelector('#viewport .${cls}-day')`);
    assert.ok(await b.ev(`/Morning yoga/.test(document.querySelector('#viewport').textContent)`));
    // Settings: Gender, Height in feet and inches, the Units card, goal notifications.
    await b.act(`${cls}-view`, {id: 'settings'});
    await type('#viewport [data-fit-select="gender"]', '2');
    assert.equal((await fit()).profile.gender, 1);
    await b.click(`#viewport [data-action="${cls}-height"]`);
    await b.until(`!!document.querySelector('#viewport [data-fit-select="eunit"]')`);
    await type('#viewport [data-fit-select="eunit"]', '1');
    await b.until(`!!document.querySelector('#viewport [data-fit="a"]')`);
    await type('#viewport [data-fit="a"]', '5');
    await type('#viewport [data-fit="b"]', '10');
    await b.act(`${cls}-save`);
    await b.until(`/5 ft 10 in/.test(document.querySelector('#viewport').textContent)`);
    assert.equal(Math.round((await fit()).profile.heightCm), 178);
    await type('#viewport [data-fit-select="unit-distance"]', '1');
    assert.equal((await fit()).units.distance, 1);
    await b.click(`#viewport [data-action="${cls}-notify"]`);
    assert.equal((await fit()).notify, false);
    await b.shot(`${version}-fit-settings`);
    // Challenges keep the limit.
    await b.act(`${cls}-drawer`);
    await b.click(`#viewport [data-action="${cls}-view"][data-id="groups"]`);
    await b.act(`${cls}-view`, {id: 'home'});
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('fit');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'fit ok');
  } catch (error) { await b.shot(`${version}-fit-failure`); throw error; } finally { b.close(); }
}
