// Docs, Sheets and Slides installed from Play on 6.0.1 (1.6) and 7.1.2 (1.7): the welcome view, the FAB menu and a new
// file edited and kept in Drive's files, Rename, Available offline and the Offline view, the grid view, Sort by,
// Search, Remove to Trash and Restore, Delete, Settings, Google Drive from the drawer, and the phone width.
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const TYPE = {docs: 'doc', sheets: 'sheet', slides: 'slide'};
for (const [version, start, cls, ns, menuItem, dlg] of [['6.0.1', marshmallow, 'mmeds', 'MM', '.mmmenu-item', 'mmdlg'], ['7.1.2', nougat, 'ngeds', 'NG', '.ngmenu-item', 'ngdlg']]) {
  const b = await start();
  const files = async type => ((await b.save()).driveFiles || []).filter(f => f.type === type);
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const button = async label => { await b.until(`[...document.querySelectorAll('.${dlg} button')].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll('.${dlg} button')].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  try {
    await b.language('en');
    for (const app of ['docs', 'sheets', 'slides']) {
      assert.equal(await b.ev(`!!${ns}.appsData.${app}?.installed`), true, `${app} is installed`);
      await b.open(app);
      await b.until(`!!document.querySelector('#viewport .${cls}-welcome')`);
      if (app === 'docs') await b.shot(`${version}-docs-welcome`);
      // The FAB menu, then a new file in the editor.
      await b.click(`#viewport .${cls}-fab`);
      await b.until(`!!document.querySelector('#viewport .${cls}-fabmenu')`);
      await b.click(`#viewport .${cls}-fabmenu [data-action="${cls}-new"]`);
      const field = {docs: '[data-ed-doc]', sheets: '[data-ed-cell="B2"]', slides: '[data-ed-slide="0"][data-k="title"]'}[app];
      await b.until(`!!document.querySelector('#viewport ${field}')`);
      await type(`#viewport ${field}`, 'Trip budget');
      if (app === 'slides') { await b.act(`${cls}-addslide`); await b.until(`document.querySelectorAll('#viewport .${cls}-slide').length===2`); }
      await b.shot(`${version}-${app}-editor`);
      await b.act(`${cls}-done`);
      await b.until(`!document.querySelector('#viewport ${field}') && /Trip budget/.test(document.querySelector('#viewport .${cls}-scroll').textContent)`);
      const made = (await files(TYPE[app]))[0];
      assert.ok(made && /Trip budget/.test(made.content), `${app} keeps the file in Drive`);
      await b.act(`${cls}-close`);
      await b.until(`document.querySelectorAll('#viewport .${cls}-row').length===1`);
      await b.shot(`${version}-${app}-list`);
      // Rename.
      await b.click(`#viewport .${cls}-row [data-action="${cls}-item"]`);
      await menu('Rename');
      await b.until(`!!document.querySelector('.${cls}-input')`);
      await type(`.${cls}-input`, 'Budget');
      await button('OK');
      await b.until(`document.querySelector('#viewport .${cls}-row b')?.textContent==='Budget'`);
      // Available offline and the Offline view.
      await b.click(`#viewport .${cls}-row [data-action="${cls}-item"]`);
      await menu('Available offline');
      assert.equal((await files(TYPE[app]))[0].offline, true);
      await b.act(`${cls}-view`, {id: 'offline'});
      await b.until(`document.querySelectorAll('#viewport .${cls}-row').length===1`);
      await b.act(`${cls}-view`, {id: 'starred'});
      await b.until(`/no starred files/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
      await b.act(`${cls}-view`, {id: 'recent'});
      // Grid view and Sort by from the overflow.
      await b.click(`#viewport .${cls}-more`);
      await menu('View as Grid');
      await b.until(`!!document.querySelector('#viewport .${cls}-grid .${cls}-card')`);
      await b.click(`#viewport .${cls}-more`);
      await menu('View as List');
      await b.click(`#viewport .${cls}-more`);
      await menu('Sort by');
      await b.until(`!!document.querySelector('.${dlg}-item')`);
      await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes('Name')).click()`);
      assert.equal((await b.save()).editorsPrefs[app].sort, 'title');
      // Search.
      await b.act(`${cls}-search`);
      await type('#viewport [data-ed-search]', 'budg');
      await b.until(`document.querySelectorAll('#viewport .${cls}-row').length===1`);
      await type('#viewport [data-ed-search]', 'zzz');
      await b.until(`!!document.querySelector('#viewport .${cls}-empty')`);
      await b.act(`${cls}-search-close`);
      // Remove to Trash, Restore, then Remove and Delete.
      await b.click(`#viewport .${cls}-row [data-action="${cls}-item"]`);
      await menu('Remove');
      await button(app === 'sheets' || version === '7.1.2' ? 'Move to trash' : 'Remove');
      await b.until(`!document.querySelector('#viewport .${cls}-row')`);
      await b.act(`${cls}-view`, {id: 'trash'});
      await b.until(`document.querySelectorAll('#viewport .${cls}-row').length===1`);
      await b.click(`#viewport .${cls}-row [data-action="${cls}-item"]`);
      await menu('Restore');
      await b.until(`!document.querySelector('#viewport .${cls}-row')`);
      await b.act(`${cls}-view`, {id: 'recent'});
      await b.until(`document.querySelectorAll('#viewport .${cls}-row').length===1`);
      // Settings.
      await b.act(`${cls}-settings`);
      await b.until(`/Make recent files available offline/.test(document.querySelector('#viewport').textContent)`);
      if (app === 'docs') await b.shot(`${version}-docs-settings`);
      await b.click(`#viewport [data-action="${cls}-pref"][data-id="wifi"]`);
      assert.equal((await b.save()).editorsPrefs[app].wifi, true);
      await b.act(`${cls}-prefs-close`);
    }
    // Drive lists the editors' files; Google Drive opens from the drawer.
    assert.equal((await b.save()).driveFiles.filter(f => !f.trashed).length, 3);
    await b.act(`${cls}-drawer`);
    await b.click(`#viewport .${cls}-drive`);
    await b.until(`document.querySelector('#screen').classList.contains('view-drive')`);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    for (const app of ['docs', 'sheets', 'slides']) {
      await b.open(app);
      assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), `${app} fits the phone width`);
    }
    b.check();
    console.log(version, 'editors ok');
  } catch (error) { await b.shot(`${version}-editors-failure`); throw error; } finally { b.close(); }
}
