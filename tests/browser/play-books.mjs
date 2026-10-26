// Google Play Books installed from Play on 6.0.1 (3.9.37) and 7.1.2 (3.13.17): the empty Read now / Home, My library
// with 5.1.1's four books, Sort by Title, a book opened and read (page turns, the scrubber, Contents, Display options'
// Night theme and line height), Read now listing it, the card's Remove download with Downloaded only, Delete from
// library, Search, and the phone width.
// node tests/browser/play-books.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns, menuItem, dlg] of [['6.0.1', marshmallow, 'mmbk', 'MM', '.mmmenu-item', 'mmdlg'], ['7.1.2', nougat, 'ngbk', 'NG', '.ngmenu-item', 'ngdlg']]) {
  if (only && only !== version) continue;
  const b = await start();
  const books = async () => (await b.save()).books;
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData['play-books']?.installed`), true, 'Play Books is installed');
    await b.open('play-books');
    await b.until(`!!document.querySelector('#viewport .${cls}-empty')`);
    await b.act(`${cls}-view`, {id: 'library'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===4`);
    await b.shot(`${version}-books-library`);
    // Sort by Title (the toolbar icon on 3.9, the overflow on 3.13).
    if (await b.ev(`!!document.querySelector('#viewport [data-action="${cls}-sort"]')`)) await b.click(`#viewport [data-action="${cls}-sort"]`);
    else { await b.click(`#viewport .${cls}-more`); await menu('Sort'); }
    await b.until(`!!document.querySelector('.${dlg}-item')`);
    await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes('Title')).click()`);
    await b.until(`/^Alice/.test(document.querySelector('#viewport .${cls}-meta b')?.textContent||'')`);
    // Read a book: page turns, the scrubber, Contents, Display options.
    await b.click(`#viewport .${cls}-card:nth-child(2) .${cls}-cover`);
    await b.until(`!!document.querySelector('#viewport .${cls}-page h2')`);
    await b.act(`${cls}-next`); await b.act(`${cls}-next`);
    assert.equal((await books()).progress.b4 ?? (await books()).progress[Object.keys((await books()).opened)[0]], 2);
    await b.act(`${cls}-toc`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-toc li').length>=2`);
    await b.click(`#viewport .${cls}-toc li:nth-child(2) button`);
    await b.until(`!!document.querySelector('#viewport .${cls}-page h2')`);
    await b.act(`${cls}-options`);
    await b.click(`#viewport [data-action="${cls}-theme"][data-id="night"]`);
    await b.click(`#viewport [data-action="${cls}-line"][data-id="1"]`);
    const s = await books();
    assert.equal(s.theme, 'night'); assert.equal(s.lineHeight, 1.6875);
    await b.shot(`${version}-books-reader`);
    await b.act(`${cls}-close`);
    // Read now lists the book read last.
    await b.act(`${cls}-view`, {id: 'read'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    // Remove download hides it under Downloaded only; Delete from library drops one.
    await b.act(`${cls}-view`, {id: 'library'});
    await b.click(`#viewport .${cls}-card [data-action="${cls}-card"]`);
    await menu('Remove download');
    await b.act(`${cls}-downloaded`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===3`);
    await b.act(`${cls}-downloaded`);
    await b.click(`#viewport .${cls}-card [data-action="${cls}-card"]`);
    await menu('Delete from library');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===3`);
    // Search.
    await b.act(`${cls}-search`);
    await type(`#viewport [data-bk-search]`, 'holmes');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    await type(`#viewport [data-bk-search]`, 'zzz');
    await b.until(`/No matches/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.act(`${cls}-search-close`);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('play-books');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'books ok');
  } catch (error) { await b.shot(`${version}-books-failure`); throw error; } finally { b.close(); }
}
