// Google Keep installed from Play on 6.0.1 (Keep 3.3.315.0) and 7.1.2 (Keep 3.4.724.02): the demo notes, a new note and
// a new list kept, a check box, a colour, Pin, Archive and the Archive view, Delete to Trash and Empty Trash, an empty
// note dropped, Search, Settings, the overflow's column view, and the phone width. Round five (T66): an audio note
// recorded, kept and played, sent with its recording, and its recording deleted.
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
for (const [version, start, cls, ns, menuItem] of [['6.0.1', marshmallow, 'mmkp', 'MM', '.mmmenu-item'], ['7.1.2', nougat, 'ngkp', 'NG', '.ngmenu-item']]) {
  const b = await start();
  const notes = async () => (await b.save()).keepNotes || [];
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  const menuPick = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const enter = sel => b.ev(`(()=>{document.querySelector(${JSON.stringify(sel)}).dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData.keep?.installed`), true, 'Keep is installed');
    await b.open('keep');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===3`);
    await b.shot(`${version}-keep`);
    // A new note.
    await b.click(`#viewport .${cls}-take`);
    await b.until(`!!document.querySelector('#viewport [data-keep-text]')`);
    await type('#viewport [data-keep-title]', 'Weekend');
    await type('#viewport [data-keep-text]', 'Bake bread');
    await b.shot(`${version}-keep-editor`);
    await b.act(`${cls}-close`);
    await b.until(`[...document.querySelectorAll('#viewport .${cls}-card')].some(c=>/Weekend/.test(c.textContent)&&/Bake bread/.test(c.textContent))`);
    // A new list with a checked item.
    await b.act(`${cls}-new-list`);
    await b.until(`!!document.querySelector('#viewport [data-keep-add]')`);
    await type('#viewport [data-keep-add]', 'Milk'); await enter('#viewport [data-keep-add]');
    await b.until(`!!document.querySelector('#viewport [data-keep-item]')`);
    await b.click(`#viewport .${cls}-check`);
    assert.equal((await notes()).find(n => n.list?.[0]?.text === 'Milk')?.list[0].checked, true);
    // Colour and Pin.
    await b.click(`#viewport [data-action="${cls}-sheet"]`);
    await b.click(`#viewport [data-action="${cls}-color"][data-id="4"]`);
    await b.act(`${cls}-pin`);
    const list = (await notes()).find(n => n.list?.[0]?.text === 'Milk');
    assert.equal(list.color, 4); assert.equal(list.pinned, true);
    await b.act(`${cls}-close`);
    assert.equal(await b.ev(`document.querySelector('#viewport .${cls}-card')?.textContent.includes('Milk')`), true, 'the pinned note comes first');
    // Archive, then the Archive view.
    await b.click(`#viewport .${cls}-card:last-child`);
    const archived = await b.ev(`document.querySelector('#viewport [data-keep-title]')?.value + '|' + (document.querySelector('#viewport [data-keep-text]')?.value||'')`);
    await b.act(`${cls}-archive`);
    await b.act(`${cls}-view`, {id: 'archive'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    assert.ok((await b.ev(`document.querySelector('#viewport .${cls}-card').textContent`)).includes(archived.split('|')[1] || archived.split('|')[0]));
    // Delete to Trash, then Empty Trash.
    await b.click(`#viewport .${cls}-card`);
    await b.click(`#viewport [data-action="${cls}-sheet"]`);
    await b.click(`#viewport [data-action="${cls}-delete"]`);
    await b.act(`${cls}-view`, {id: 'trash'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1 && !!document.querySelector('#viewport .${cls}-banner')`);
    await b.click(`#viewport .${cls}-more`);
    await b.until(`!!document.querySelector(${JSON.stringify(menuItem)})`);
    await b.click(menuItem);
    await b.until(`[...document.querySelectorAll('button')].some(x=>x.textContent==='Empty Trash'&&x.closest('[role=dialog], .ngdlg, .mmdlg'))`);
    await b.ev(`[...document.querySelectorAll('button')].filter(x=>x.textContent==='Empty Trash'&&x.closest('[role=dialog], .ngdlg, .mmdlg')).pop().click()`);
    await b.until(`!document.querySelector('#viewport .${cls}-card') && /No notes in Trash/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    assert.equal((await notes()).filter(n => n.trashed).length, 0);
    // An empty note is dropped.
    await b.act(`${cls}-view`, {id: 'notes'});
    const count = (await notes()).length;
    await b.click(`#viewport .${cls}-take`);
    await b.act(`${cls}-close`);
    assert.equal((await notes()).length, count, 'an empty note is not kept');
    // An audio note: recording, then the clip with Play; Send carries it; Delete voice recording? removes it.
    await b.click(`#viewport [data-action="${cls}-new-audio"]`);
    await b.until(`!!document.querySelector('#viewport .${cls}-clip.recording [data-keep-timer]')`);
    await b.click(`#viewport [data-action="${cls}-stop"]`);
    await b.until(`!!document.querySelector('#viewport [data-action="${cls}-play"]')`);
    const voice = (await notes()).find(n => n.audio);
    assert.ok(voice && voice.audio.sec >= 1, 'the recording is kept');
    await b.click(`#viewport [data-action="${cls}-play"]`);
    await b.click(`#viewport [data-action="${cls}-play"]`);
    await b.click(`#viewport [data-action="${cls}-sheet"]`);
    await b.click(`#viewport [data-action="${cls}-send"]`);
    const sheet = version === '6.0.1' ? 'mmin' : 'ngin';
    await b.until(`!!document.querySelector('.${sheet}-sheet')`);
    await b.click(`.${sheet}-dim`);
    await b.click(`#viewport [data-action="${cls}-unaudio"]`);
    await b.until(`[...document.querySelectorAll('button')].some(x=>x.textContent.trim()==='Delete'&&x.closest('.ngdlg, .mmdlg'))`);
    await b.ev(`[...document.querySelectorAll('button')].filter(x=>x.textContent.trim()==='Delete'&&x.closest('.ngdlg, .mmdlg')).pop().click()`);
    await b.until(`!document.querySelector('#viewport [data-action="${cls}-play"]')`);
    assert.equal((await notes()).filter(n => n.audio).length, 0);
    await b.act(`${cls}-close`);
    // Back while recording drops the note.
    const before = (await notes()).length;
    await b.click(`#viewport [data-action="${cls}-new-audio"]`);
    await b.until(`!!document.querySelector('#viewport [data-keep-timer]')`);
    await b.ev(`document.querySelector('#nav-bar [data-key="back"]')?.click()`);
    await b.until(`!document.querySelector('#viewport [data-keep-timer]')`);
    assert.equal((await notes()).length, before, 'Back while recording keeps nothing');
    // Round six (T70): a photo note (Take photo), a picture chosen from the phone, the picture's Delete.
    const dlg = version === '6.0.1' ? 'mmdlg' : 'ngdlg';
    await b.click(`#viewport [data-action="${cls}-new-photo"]`);
    await b.until(`[...document.querySelectorAll('.${dlg}-item')].some(x=>x.textContent.includes('Take photo'))`);
    await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes('Take photo')).click()`);
    await b.until(`!!document.querySelector('#viewport .${cls}-image svg')`);
    await b.click(`#viewport [data-action="${cls}-add"]`);
    await b.until(`[...document.querySelectorAll('#viewport .${cls}-sheet button')].map(x=>x.textContent.trim()).join('|')==='Take photo|Choose image|Drawing|Recording|Checkboxes'`);
    await b.click(`#viewport [data-action="${cls}-choose"]`);
    if (version === '6.0.1') { await b.until(`!!document.querySelector('#viewport [data-action="mmsa-pickone"]')`); await b.click('#viewport [data-action="mmsa-pickone"]'); }
    else { await b.until(`!!document.querySelector('#viewport [data-action="ngdocs-root"][data-root="images"]')`); await b.click('#viewport [data-action="ngdocs-root"][data-root="images"]'); await b.until(`!!document.querySelector('#viewport .ngdocs-item')`); await b.click('#viewport .ngdocs-item'); }
    await b.until(`document.querySelectorAll('#viewport .${cls}-image').length===2`);
    assert.equal((await notes()).find(n => n.images)?.images.length, 2);
    await b.shot(`${version}-keep-photo`);
    await b.click(`#viewport .${cls}-image`);
    await b.until(`!!document.querySelector('#viewport .${cls}-viewer svg')`);
    await b.click(`#viewport [data-action="${cls}-viewer-menu"]`);
    await menuPick('Delete');
    await b.until(`[...document.querySelectorAll('.${dlg} button')].some(x=>x.textContent.trim()==='Delete')`);
    assert.ok(await b.ev(`/Delete image\\?/.test(document.querySelector('.${dlg}').textContent)`));
    await b.ev(`[...document.querySelectorAll('.${dlg} button')].filter(x=>x.textContent.trim()==='Delete').pop().click()`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-image').length===1 && !document.querySelector('#viewport .${cls}-viewer')`);
    await b.click(`#viewport [data-action="${cls}-sheet"]`);
    assert.equal(await b.ev(`[...document.querySelectorAll('#viewport .${cls}-sheet>button')].map(x=>x.textContent.trim()).join('|')`), 'Delete|Make a copy|Send|Collaborator|Labels');
    await b.click(`#viewport [data-action="${cls}-sheet"]`);
    await b.act(`${cls}-close`);
    await b.until(`!!document.querySelector('#viewport .${cls}-card .${cls}-backdrop svg')`);
    // A list: the Checked section and its chevron, Delete checked items, Hide checkboxes, Checkboxes back, an item deleted.
    await b.act(`${cls}-new-list`);
    await b.until(`!!document.querySelector('#viewport [data-keep-add]')`);
    for (const item of ['Eggs', 'Bread']) { await type('#viewport [data-keep-add]', item); await enter('#viewport [data-keep-add]'); }
    await b.until(`document.querySelectorAll('#viewport [data-keep-item]').length===2`);
    await b.click(`#viewport .${cls}-check`);
    await b.until(`/Checked/.test(document.querySelector('#viewport .${cls}-grave')?.textContent||'')`);
    await b.click(`#viewport .${cls}-grave`);
    await b.until(`document.querySelectorAll('#viewport [data-keep-item]').length===1`);
    await b.click(`#viewport .${cls}-grave`);
    await b.click(`#viewport [data-action="${cls}-list-menu"]`);
    await menuPick('Delete checked items');
    await b.until(`document.querySelectorAll('#viewport [data-keep-item]').length===1 && !document.querySelector('#viewport .${cls}-grave')`);
    await b.click(`#viewport [data-action="${cls}-list-menu"]`);
    await menuPick('Hide checkboxes');
    await b.until(`document.querySelector('#viewport [data-keep-text]')?.value==='Eggs'`);
    await b.click(`#viewport [data-action="${cls}-add"]`);
    await b.click(`#viewport [data-action="${cls}-checkboxes"]`);
    await b.until(`document.querySelector('#viewport [data-keep-item]')?.value==='Eggs'`);
    await b.click(`#viewport [data-action="${cls}-item-delete"]`);
    await b.until(`!document.querySelector('#viewport [data-keep-item]')`);
    await b.act(`${cls}-close`);
    // Search.
    await b.act(`${cls}-search`);
    await type('#viewport [data-keep-search]', 'concert');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    await type('#viewport [data-keep-search]', 'zzz');
    await b.until(`/No matching notes/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.act(`${cls}-search-close`);
    // Single-column view from the overflow.
    await b.click(`#viewport .${cls}-more`);
    await b.until(`!!document.querySelector(${JSON.stringify(menuItem)})`);
    await b.click(menuItem);
    await b.until(`!!document.querySelector('#viewport .${cls}-grid.single')`);
    // Settings.
    await b.act(`${cls}-settings`);
    await b.until(`/Move checked items to bottom/.test(document.querySelector('#viewport').textContent)`);
    await b.shot(`${version}-keep-settings`);
    await b.click(`#viewport [data-action="${cls}-pref"][data-id="sharing"]`);
    assert.equal((await b.save()).keepPrefs.sharing, false);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('keep');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'keep ok');
  } catch (error) { await b.shot(`${version}-keep-failure`); throw error; } finally { b.close(); }
}
