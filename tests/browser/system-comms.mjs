// Round seven, package 3 (T72–T74, docs/reports/simulator-limits-2026-10-23.md): Phone, Contacts and Messenger of 6.0.1
// and 7.1.2. 6.0.1: Clear call history on the Call history screen, Sort by / Name format shared by Phone and Contacts,
// a message's action mode (View details, Delete). Both: the voicemail number and sound, Export to .vcf file writing
// every contact into the saved file and Import from .vcf file reading it back, a typed draft kept with its conversation
// and shown as "Draft" in the list (also after a reload); then the phone width.
//     node tests/browser/system-comms.mjs [6.0.1 | 7.1.2]
import assert from 'node:assert/strict';
import {marshmallow, sleep} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';

for (const [version, start, p] of [['6.0.1', marshmallow, 'mm'], ['7.1.2', nougat, 'ng']].filter(([v]) => !process.argv[2] || process.argv[2] === v)) {
  const b = await start(), KEY = `android-time-machine-${p}-v1`;
  const text = sel => b.ev(`document.querySelector(${JSON.stringify(sel)})?.textContent||''`);
  // Taps the first visible element of the screen or the overlay whose own text is exactly label.
  const tap = async (label, scope = '#screen') => {
    const js = `[...document.querySelectorAll('${scope} button, ${scope} [role=button], ${scope} [data-action]')].filter(x=>x.offsetParent).find(x=>(x.querySelector('.${p}st-title, .${p}menu-item span, b')?.textContent||x.textContent).trim()===${JSON.stringify(label)})`;
    await b.until(`!!(${js})`); await b.ev(`(${js}).click()`); await sleep(250);
  };
  const menu = async label => { await b.click(`#viewport [data-action="${p}-menu"], #viewport [data-action="ngph-menu"]`); await tap(label, '#overlay-root'); };
  const seed = async fn => {
    await b.ev(`(()=>{const d=JSON.parse(localStorage.getItem('${KEY}'));(${fn})(d);localStorage.setItem('${KEY}',JSON.stringify(d));window.__ngReloadPending=true;location.reload();})()`);
    await b.until(`!window.__ngReloadPending && document.querySelector('#screen')?.classList.contains('view-home')`);
  };
  const contacts = async () => (await b.save()).contacts || [];
  try {
    await b.language('en');

    // The voicemail number (EditPhoneNumberPreference) and its sound.
    await b.open('phone');
    await menu('Settings');
    await tap('Calls'); await tap('Voicemail'); await tap('Setup');
    await b.until(`[...document.querySelectorAll('#viewport .${p}st-summary')].some(x=>x.textContent==='<Not set>')`);
    await tap('Voicemail number');
    await b.until(`!!document.querySelector('#overlay-root input')`);
    await b.ev(`(()=>{const f=document.querySelector('#overlay-root input');f.value='+36 1 555 0100';f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
    await tap('OK', '#overlay-root');
    await b.until(`/Voicemail number changed/.test(document.querySelector('#overlay-root')?.textContent||'')`);
    await tap('OK', '#overlay-root');
    assert.ok((await text('#viewport')).includes('+3615550100'), 'the number is the summary');
    await b.click('#nav-bar [data-key="back"]'); await sleep(300);
    await tap('Sound');
    await b.until(`document.querySelectorAll('#overlay-root .${p}dlg-item').length>3`);
    const tone = await b.ev(`document.querySelectorAll('#overlay-root .${p}dlg-item')[2].textContent.trim()`);
    await b.click(`#overlay-root .${p}dlg-item[data-index="2"]`);
    await b.click(`#overlay-root [data-action="${p}dlg-button"][data-index="1"]`);
    await b.until(`[...document.querySelectorAll('#viewport .${p}st-summary')].some(x=>x.textContent===${JSON.stringify(tone)})`);
    await b.shot(`${version}-comms-voicemail`);

    // Export to .vcf file, then Import from .vcf file reads it back.
    const before = (await contacts()).length;
    await b.open('contacts');
    await menu('Import/export');
    await tap('Export to .vcf file', '#overlay-root');
    if (version === '6.0.1') { await b.until(`!!document.querySelector('#viewport [data-action="mmsa-save"]')`); await b.click('#viewport [data-action="mmsa-save"]'); }
    else { await b.until(`!!document.querySelector('#viewport [data-action="ngdocs-save"]')`); await b.click('#viewport [data-action="ngdocs-save"]'); }
    await sleep(500);
    const saved = version === '6.0.1' ? ((await b.save()).downloadsDocs || (await b.save()).documents || []) : [];
    const file = await b.ev(version === '6.0.1'
      ? `(()=>{const d=JSON.parse(localStorage.getItem('${KEY}'));const all=Object.values(d).flat().filter(x=>x&&typeof x==='object'&&/\\.vcf$/.test(x.name||''));return all.at(-1)})()`
      : `(()=>{const d=JSON.parse(localStorage.getItem('${KEY}'));const all=JSON.stringify(d).match(/"name":"contacts\\.vcf"[^}]*"content":"([^"]*)"/);return all&&{text:JSON.parse('"'+all[1]+'"')}})()`);
    void saved;
    const vcf = file?.text || file?.content || '';
    assert.equal((vcf.match(/BEGIN:VCARD/g) || []).length, before, 'every contact is in the file');
    assert.match(vcf, /TEL;CELL:202-555-0148/);
    await b.open('contacts');
    await menu('Import/export');
    await tap('Import from .vcf file', '#overlay-root');
    if (version === '6.0.1') {
      await b.until(`[...document.querySelectorAll('#viewport [data-action="mmsa-pickdoc"]')].some(x=>/\\.vcf/.test(x.textContent))`);
      await b.ev(`[...document.querySelectorAll('#viewport [data-action="mmsa-pickdoc"]')].find(x=>/\\.vcf/.test(x.textContent)).click()`);
    } else {
      await b.until(`[...document.querySelectorAll('#viewport [data-action="ngdocs-item"]')].some(x=>/contacts\\.vcf/.test(x.textContent))`);
      await b.ev(`[...document.querySelectorAll('#viewport [data-action="ngdocs-item"]')].find(x=>/contacts\\.vcf/.test(x.textContent)).click()`);
    }
    await b.until(`/Finished importing vCard/.test(document.body.textContent)`);
    assert.equal((await contacts()).length, before * 2, 'the file adds its contacts');

    // A draft is kept with its conversation and shown as "Draft".
    await b.open('messenger');
    await b.until(`!!document.querySelector('#viewport [data-action="${p}ms-open"]')`);
    const id = await b.ev(`document.querySelector('#viewport [data-action="${p}ms-open"]').dataset.id`);
    await b.click(`#viewport [data-action="${p}ms-open"][data-id="${id}"]`);
    await b.until(`!!document.querySelector('#viewport .${p}ms-field')`);
    await b.ev(`(()=>{const f=document.querySelector('#viewport .${p}ms-field');f.value='See you at 8';f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
    await sleep(700);
    await b.click('#nav-bar [data-key="back"]');
    await b.until(`[...document.querySelectorAll('#viewport [data-action="${p}ms-open"]')].some(x=>/See you at 8/.test(x.textContent)&&/Draft/.test(x.textContent))`);
    await b.shot(`${version}-comms-draft`);
    await seed(`d=>{}`);
    await b.open('messenger');
    await b.until(`[...document.querySelectorAll('#viewport [data-action="${p}ms-open"]')].some(x=>/See you at 8/.test(x.textContent)&&/Draft/.test(x.textContent))`);
    await b.click(`#viewport [data-action="${p}ms-open"][data-id="${id}"]`);
    await b.until(`document.querySelector('#viewport .${p}ms-field')?.value==='See you at 8'`);

    if (version === '6.0.1') {
      // A message's action mode: View details, then Delete.
      const count = (await b.save()).sms.find(x => x.id === +id).messages.length;
      const hold = async () => {
        const [x, y] = await b.ev(`(()=>{const r=document.querySelector('#viewport .mmms-msg .mmms-bubble').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]})()`);
        await b.send('Input.dispatchMouseEvent', {type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1}); await sleep(700);
        await b.send('Input.dispatchMouseEvent', {type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1});
        await b.until(`!!document.querySelector('#viewport .mmms-bar.cab')`);
      };
      await hold();
      assert.ok(await b.ev(`!!document.querySelector('#viewport .mmms-msg.selected')`));
      await b.shot('6.0.1-comms-cab');
      await b.click('#viewport [data-action="mmms-m-details"]');
      await b.until(`/Message details/.test(document.querySelector('#overlay-root')?.textContent||'')`);
      await tap('OK', '#overlay-root');
      await hold();
      await b.click('#viewport [data-action="mmms-m-delete"]');
      await tap('Delete', '#overlay-root');
      await b.until(`!document.querySelector('#viewport .mmms-bar.cab')`);
      assert.equal((await b.save()).sms.find(x => x.id === +id).messages.length, count - 1);
      // Clear call history from the Call history screen.
      await b.open('phone');
      await menu('Call History');
      await b.until(`!!document.querySelector('#viewport .mmph-barmenu')`);
      await b.click('#viewport .mmph-barmenu');
      await tap('Clear call history', '#overlay-root');
      await tap('OK', '#overlay-root');
      await b.until(`((JSON.parse(localStorage.getItem('${KEY}')).calls)||[1]).length===0`);
      // Sort by last name and Last name first: Phone's list and Contacts follow the same values.
      await seed(`d=>{d.appPrefs=d.appPrefs||{};d.appPrefs.contacts={sortOrder:'2',displayOrder:'2'};}`);
      await b.open('contacts');
      await b.until(`!!document.querySelector('#viewport .mmct-name')`);
      const names = await b.ev(`[...document.querySelectorAll('#viewport .mmct-item:not(.mmct-me) .mmct-name')].map(x=>x.textContent).slice(0,3)`);
      assert.deepEqual(names.slice(0, 2), ['Lee, Taylor', 'Lee, Taylor'], 'Lee first, family name first');
    }

    // The phone width.
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('messenger');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`));
    b.check();
    console.log(version, 'comms ok');
  } catch (error) { await b.shot(`${version}-comms-failure`); throw error; } finally { b.close(); }
}
