// Round seven, package 2 (T75, docs/reports/simulator-limits-2026-10-23.md): the Clock of 6.0.1 and 7.1.2. An alarm
// fires at its minute over the phone (AlarmActivity): the hint, snooze by dragging (Snoozed, the "Snoozing until"
// notification, firing again after Snooze length), Volume buttons dismissing it (Alarm off), Silence after with the
// missed-alarm notification; the timer runs out ("Time's up" screen, +1 min, Stop) and survives a reload; Style Analog,
// the automatic home clock, the alarm's ringtone and Night mode; then the phone width. The page's clock is moved forward
// (a Date shifted in the page) instead of waiting for the minutes to pass.
//     node tests/browser/system-clock.mjs [6.0.1 | 7.1.2]
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';

for (const [version, start, p] of [['6.0.1', marshmallow, 'mm'], ['7.1.2', nougat, 'ng']].filter(([v]) => !process.argv[2] || process.argv[2] === v)) {
  const b = await start(), KEY = `android-time-machine-${p}-v1`;
  const text = sel => b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
  const view = () => b.ev(`[...document.querySelector('#screen').classList].find(x=>x.startsWith('view-'))`);
  const prefsPath = version === '6.0.1' ? `((d.appPrefs||(d.appPrefs={})).clock||(d.appPrefs.clock={}))` : `(d.clock.prefs||(d.clock.prefs={}))`;
  const seed = async (fn, v = 'home') => {
    await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${KEY}'));(${fn})(d);localStorage.setItem('${KEY}',JSON.stringify(d));window.__ngReloadPending=true;location.reload();})()`);
    await b.until(`!window.__ngReloadPending && document.querySelector('#screen')?.classList.contains('view-${v}')`);
  };
  // Moves the page's clock: from now on it reads ms later than the real one.
  const shift = ms => b.ev(`(()=>{const D=window.__realDate||(window.__realDate=Date);class F extends D{constructor(...a){if(a.length)super(...a);else super(D.now()+${ms})}static now(){return D.now()+${ms}}}window.Date=F;return 1})()`);
  const notes = async () => (await b.save()).notifications || [];
  const drag = async (sel, toSel) => {
    const [x0, y0, x1] = await b.ev(`(()=>{const a=document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(),t=document.querySelector(${JSON.stringify(toSel)}).getBoundingClientRect();return [a.left+a.width/2,a.top+a.height/2,t.left+t.width/2]})()`);
    const mouse = (type, x, y, buttons) => b.send('Input.dispatchMouseEvent', {type, x, y, button: 'left', buttons, clickCount: type === 'mouseMoved' ? 0 : 1});
    await mouse('mousePressed', x0, y0, 1);
    for (let i = 1; i <= 10; i++) await mouse('mouseMoved', x0 + (x1 - x0) * i / 10, y0, 1);
    await mouse('mouseReleased', x1, y0, 0);
  };
  try {
    await b.language('en');
    // An alarm two minutes ahead, the clock moved to 3 s before it.
    const at = new Date(Math.ceil(Date.now() / 60000) * 60000 + 60000), h = at.getHours(), m = at.getMinutes();
    await seed(`d=>{d.clock=d.clock||{alarms:[]};d.clock.alarms.push({id:91,h:${h},m:${m},days:[],on:true,vibrate:true,label:'Wake up'});}`);
    await shift(at.getTime() - Date.now() - 3000);
    await b.until(`document.querySelector('#screen').classList.contains('view-alarm-alert')`);
    assert.equal(await text(`#viewport .${p}al-title`), 'Wake up');
    assert.match(await text(`#viewport .${p}al-clock`), new RegExp(`${h % 12 || 12}:${String(m).padStart(2, '0')}|${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`));
    assert.equal((await b.save()).clock.alarms.find(a => a.id === 91).on, false, 'a one-off alarm switches itself off');
    assert.ok((await notes()).some(n => n.title === 'Wake up'), 'the ringing notification');
    await b.shot(`${version}-clock-alarm`);
    await b.click(`#viewport .${p}al-btn.snooze`);
    assert.equal(await text(`#viewport .${p}al-hint`), 'Swipe left to snooze');
    await b.click('#nav-bar [data-key="back"]');
    assert.equal(await view(), 'view-alarm-alert', 'Back does nothing');
    // Snooze: drag the alarm button onto the snooze button.
    await drag(`#viewport .${p}al-alarm`, `#viewport .${p}al-btn.snooze`);
    await b.until(`/Snoozed/.test(document.querySelector('#viewport .${p}al-reveal')?.textContent||'')`);
    assert.match(await text(`#viewport .${p}al-reveal`), /10 min/);
    await b.shot(`${version}-clock-snoozed`);
    await b.until(`document.querySelector('#screen').classList.contains('view-home')`);
    let n = await notes();
    assert.ok(n.some(x => /^Snoozing until /.test(x.text)), 'the snooze notification');
    assert.ok(!n.some(x => x.title === 'Wake up' && !/Snoozing/.test(x.text)), 'the ringing notification went');
    // Ten minutes later it fires again; Volume buttons: Dismiss.
    await seed(`d=>{${prefsPath}.volume_button_setting='2';}`);
    await shift(at.getTime() - Date.now() + 10 * 60000 + 30000);
    await b.until(`document.querySelector('#screen').classList.contains('view-alarm-alert')`);
    assert.ok(!(await notes()).some(x => /^Snoozing until /.test(x.text)), 'the snooze notification goes when it fires');
    await b.ev(`document.querySelector('#volume-up').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))`);
    await b.until(`/Alarm off/.test(document.querySelector('#viewport .${p}al-reveal')?.textContent||'')`);
    await b.until(`document.querySelector('#screen').classList.contains('view-home')`);
    assert.equal((await b.save()).clock.snooze, null);
    // Silence after one minute: the missed-alarm notification.
    await seed(`d=>{${prefsPath}.auto_silence='1';d.clock.alarms.find(a=>a.id===91).on=true;}`);
    await shift(at.getTime() - Date.now() + 24 * 3600000 - 2000);
    await b.until(`document.querySelector('#screen').classList.contains('view-alarm-alert')`);
    await shift(at.getTime() - Date.now() + 24 * 3600000 + 62000);
    await b.until(`!document.querySelector('#screen').classList.contains('view-alarm-alert')`);
    n = await notes();
    assert.ok(n.some(x => x.title === 'Missed alarm' && /Wake up/.test(x.text)), 'the missed alarm');
    await b.ev(`(()=>{if(window.__realDate)window.Date=window.__realDate;return 1})()`);

    // The timer: runs out on the home screen, +1 min, survives a reload, Stop.
    await b.open('clock');
    await b.click(`#viewport [data-action="${p}ck-tab"][data-tab="timer"]`);
    for (const k of ['3']) await b.click(`#viewport [data-action="${p}ck-tkey"][data-k="${k}"]`);
    await b.click(`#viewport [data-action="${p}ck-fab"]`);
    assert.ok((await b.save()).clock.timer?.end, 'the timer is kept in the phone');
    await b.click('#nav-bar [data-key="home"]');
    await b.until(`document.querySelector('#screen').classList.contains('view-timer-alert')`);
    assert.ok((await notes()).some(x => x.text === "Time's up"));
    await sleep(1200);
    assert.match(await b.ev(`document.querySelector('#viewport .${p}ck-ctime')?.textContent||document.querySelector('#viewport [class*="ctime"]')?.textContent`), /^-0:0\d$/);
    await b.shot(`${version}-clock-timesup`);
    await b.click(`#viewport [data-action="${p}al-tplus"]`);
    await b.until(`document.querySelector('#screen').classList.contains('view-home')`);
    const left = (await b.save()).clock.timer.end - Date.now();
    assert.ok(left > 55000 && left <= 61000, `+1 min runs it again (${left})`);
    await seed(`d=>{}`);
    assert.ok((await b.save()).clock.timer?.end, 'the timer survives a reload');
    await shift(62000);
    await b.until(`document.querySelector('#screen').classList.contains('view-timer-alert')`);
    await b.click(`#viewport [data-action="${p}al-tstop"]`);
    await b.until(`!document.querySelector('#screen').classList.contains('view-timer-alert')`);
    assert.equal((await b.save()).clock.timer, null);
    assert.ok(!(await notes()).some(x => x.text === "Time's up"));
    await b.ev(`(()=>{if(window.__realDate)window.Date=window.__realDate;return 1})()`);

    // Style Analog and the automatic home clock.
    const zone = await b.ev(`Intl.DateTimeFormat().resolvedOptions().timeZone`), away = /Tokyo/.test(zone) ? 'America/Los_Angeles' : 'Asia/Tokyo';
    await seed(`d=>{${prefsPath}.clock_style='analog';${prefsPath}.home_time_zone='${away}';}`);
    await b.open('clock');
    await b.click(`#viewport [data-action="${p}ck-tab"][data-tab="clock"]`);
    await b.until(`!!document.querySelector('#viewport .${p}ck-analog')`);
    assert.ok(await b.ev(`[...document.querySelectorAll('#viewport .${p}ck-wcname, #viewport .${p}ck-wcname span')].some(x=>x.textContent.trim()==='Home')`), 'the home clock');
    await b.shot(`${version}-clock-analog`);
    // Night mode, then Back.
    await b.click(`#viewport [data-action="${p}-menu"]`);
    // menu_item_night_mode: "Night mode" in DeskClock 4.2.1, "Screen saver" in 4.6.1.
    const night = version === '6.0.1' ? 'Night mode' : 'Screen saver';
    await b.until(`[...document.querySelectorAll('.${p}menu-item')].some(x=>x.textContent.trim()===${JSON.stringify(night)})`);
    await b.ev(`[...document.querySelectorAll('.${p}menu-item')].find(x=>x.textContent.trim()===${JSON.stringify(night)}).click()`);
    await b.until(`!!document.querySelector('#viewport .${p}ck-night')`);
    await b.click('#nav-bar [data-key="back"]');
    await b.until(`!document.querySelector('#viewport .${p}ck-night') && !!document.querySelector('#viewport .${p}ck-tabs')`);
    // The alarm's ringtone.
    await b.click(`#viewport [data-action="${p}ck-tab"][data-tab="alarm"]`);
    await b.click(`#viewport [data-action="${p}ck-expand"][data-id="91"]`);
    await b.click(`#viewport [data-action="${p}ck-ring"]`);
    await b.until(`document.querySelectorAll('#overlay-root .${p}dlg-item').length>3`);
    const tone = await b.ev(`document.querySelectorAll('#overlay-root .${p}dlg-item')[3].textContent.trim()`);
    await b.click(`#overlay-root .${p}dlg-item[data-index="3"]`);
    await b.click(`#overlay-root [data-action="${p}dlg-button"][data-index="1"]`);
    assert.equal((await b.save()).clock.alarms.find(a => a.id === 91).ringtone, tone);
    assert.ok((await text(`#viewport [data-action="${p}ck-ring"]`)).includes(tone));

    // The phone width.
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.click(`#viewport [data-action="${p}ck-tab"][data-tab="clock"]`);
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));
    await seed(`d=>{d.clock.alarms.find(a=>a.id===91).on=true;}`);
    await shift(at.getTime() - Date.now() + 2 * 24 * 3600000 - 2000);
    await b.until(`document.querySelector('#screen').classList.contains('view-alarm-alert')`);
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));
    await b.shot(`${version}-clock-alarm-phone`);
    await drag(`#viewport .${p}al-alarm`, `#viewport .${p}al-btn.dismiss`);
    await b.until(`/Alarm off/.test(document.querySelector('#viewport .${p}al-reveal')?.textContent||'')`);
    b.check();
    console.log(version, 'clock ok');
  } catch (error) { await b.shot(`${version}-clock-failure`); throw error; } finally { b.close(); }
}
