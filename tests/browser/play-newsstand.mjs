// Play Newsstand installed from Play on 6.0.1 (3.5.2: the drawer) and 7.1.2 (4.5.0: the bottom bar): the home view's six
// demo articles, an article kept (Bookmark for Later / Add to Read Later) and listed in the saved view, removed again
// (the empty caption), Article text size from the overflow, the library by source, Search with "No results found",
// Explore's empty caption, Share opening the share sheet, and the phone width. Round five (T65): Downloaded only, Settings
// (the APK's settings.xml) setting the reader's Article text size, and 3.5's library tabs.
// node tests/browser/play-newsstand.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns, menuItem, dlg, sheet, saveLabel, empty] of [['6.0.1', marshmallow, 'mmns', 'MM', '.mmmenu-item', 'mmdlg', 'mmin', 'Bookmark for Later', 'No articles bookmarked'], ['7.1.2', nougat, 'ngns', 'NG', '.ngmenu-item', 'ngdlg', 'ngin', 'Add to Read Later', 'No articles saved to Read Later']]) {
  if (only && only !== version) continue;
  const b = await start();
  const state = async () => (await b.save()).newsstand;
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim()===${JSON.stringify(label)})`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim()===${JSON.stringify(label)}).click()`); };
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData.newsstand?.installed`), true, 'Play Newsstand is installed');
    await b.open('newsstand');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===6`);
    await b.shot(`${version}-newsstand`);
    // Keep an article, then the saved view.
    await b.click(`#viewport .${cls}-card`);
    await b.until(`!!document.querySelector('#viewport .${cls}-article h1')`);
    await b.click(`#viewport [data-action="${cls}-save"]`);
    assert.equal(await b.ev(`document.querySelector('#viewport [data-action="${cls}-save"]').getAttribute('aria-pressed')`), 'true');
    assert.deepEqual((await state()).saved, ['n1']);
    await b.shot(`${version}-newsstand-article`);
    await b.click(`#viewport [data-action="${cls}-share"]`);
    await b.until(`!!document.querySelector('.${sheet}-sheet')`);
    await b.click(`.${sheet}-dim`);
    await b.act(`${cls}-close`);
    await b.act(`${cls}-view`, {id: 'saved'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    await b.click(`#viewport .${cls}-card`);
    await b.click(`#viewport [data-action="${cls}-save"]`);
    await b.act(`${cls}-close`);
    await b.until(`(document.querySelector('#viewport .${cls}-empty')?.textContent||'').includes(${JSON.stringify(empty)})`);
    // Article text size from the overflow.
    await b.click(`#viewport .${cls}-more`);
    await menu('Article text size');
    await b.until(`[...document.querySelectorAll('.${dlg}-item')].some(x=>x.textContent.includes('Large'))`);
    await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes('Large')).click()`);
    assert.equal((await b.save()).appPrefs.newsstand.articleTextSize, 'LARGE');
    // The library by source, Explore refused, Search.
    await b.act(`${cls}-view`, {id: 'library'});
    await b.until(`document.querySelectorAll('#viewport .${cls}-source').length>=3`);
    if (version === '6.0.1') {
      await b.click(`#viewport [data-action="${cls}-tab"][data-id="magazines"]`);
      await b.until(`/No magazines/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
      await b.click(`#viewport [data-action="${cls}-tab"][data-id="news"]`);
    } else assert.ok(await b.ev(`/No magazines/.test(document.querySelector('#viewport').textContent)`), '4.5 shows My Magazines under the sources');
    await b.act(`${cls}-view`, {id: 'explore'});
    await b.until(`/No recent articles/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    // Downloaded only leaves the kept articles: none now.
    await b.act(`${cls}-view`, {id: 'home'});
    await b.click(`#viewport .${cls}-more`);
    await menu('Downloaded only');
    await b.until(`/Download content to read offline/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.click(`#viewport .${cls}-more`);
    await menu('Downloaded only');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===6`);
    // Settings: the APK's settings.xml; Article text size there reaches the reader.
    await b.click(`#viewport .${cls}-more`);
    await menu('Settings');
    await b.until(`/view-app-prefs/.test(document.querySelector('#screen').className) && /Article text size/.test(document.querySelector('#viewport').textContent)`);
    await b.shot(`${version}-newsstand-settings`);
    await b.open('newsstand');
    await b.act(`${cls}-search`);
    await type(`#viewport [data-ns-search]`, 'soups');
    await b.until(`document.querySelectorAll('#viewport .${cls}-card').length===1`);
    await type(`#viewport [data-ns-search]`, 'zzz');
    await b.until(`/No results found/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.act(`${cls}-search-close`);
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('newsstand');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'newsstand ok');
  } catch (error) { await b.shot(`${version}-newsstand-failure`); throw error; } finally { b.close(); }
}
