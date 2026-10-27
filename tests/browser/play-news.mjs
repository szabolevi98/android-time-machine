// News & Weather installed from Play on 6.0.1 (2.7.1) and 7.1.2 (3.1.4): Headlines with the weather card (the tabs, C° /
// F°, the section header menu's Wind speed units), a story opened and shared from its overflow, the drawer's sections,
// Search with "No matching news", the dark theme, Edit weather display's Hide, and the phone width.
// node tests/browser/play-news.mjs [6.0.1|7.1.2]
import assert from 'node:assert/strict';
import {marshmallow} from './mm-harness.mjs';
import {nougat} from './ng-harness.mjs';
const only = process.argv[2];
for (const [version, start, cls, ns, menuItem, dlg] of [['6.0.1', marshmallow, 'mmnw', 'MM', '.mmmenu-item', 'mmdlg'], ['7.1.2', nougat, 'ngnw', 'NG', '.ngmenu-item', 'ngdlg']]) {
  if (only && only !== version) continue;
  const b = await start();
  const news = async () => (await b.save()).news;
  const menu = async label => { await b.until(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].some(x=>x.textContent.trim().startsWith(${JSON.stringify(label)}))`); await b.ev(`[...document.querySelectorAll(${JSON.stringify(menuItem)})].find(x=>x.textContent.trim().startsWith(${JSON.stringify(label)})).click()`); };
  const item = async label => { await b.until(`[...document.querySelectorAll('.${dlg}-item')].some(x=>x.textContent.includes(${JSON.stringify(label)}))`); await b.ev(`[...document.querySelectorAll('.${dlg}-item')].find(x=>x.textContent.includes(${JSON.stringify(label)})).click()`); };
  const type = (sel, value) => b.ev(`(()=>{const f=document.querySelector(${JSON.stringify(sel)});f.value=${JSON.stringify(value)};f.dispatchEvent(new Event('input',{bubbles:true}));return 1})()`);
  try {
    await b.language('en');
    assert.equal(await b.ev(`!!${ns}.appsData['news-weather']?.installed`), true, 'News & Weather is installed');
    await b.open('news-weather');
    await b.until(`!!document.querySelector('#viewport .${cls}-now') && document.querySelectorAll('#viewport .${cls}-story').length===4`);
    await b.shot(`${version}-news`);
    // The weather: F°, the Wind tab in m/s from the section header menu.
    await b.click(`#viewport [data-action="${cls}-unit"][data-id="F"]`);
    await b.until(`/64°/.test(document.querySelector('#viewport .${cls}-now b').textContent)`);
    await b.click(`#viewport .${cls}-hmenu`);
    await menu('Wind speed units');
    await item('m/s');
    assert.equal((await news()).wind, 'ms');
    await b.click(`#viewport [data-action="${cls}-tab"][data-id="wind"]`);
    await b.until(`document.querySelector('#viewport .${cls}-chart small').textContent==='2'`);
    // A story and its overflow's Share article.
    await b.click(`#viewport .${cls}-story`);
    await b.until(`!!document.querySelector('#viewport .${cls}-article h1')`);
    await b.shot(`${version}-news-story`);
    await b.click(`#viewport .${cls}-more`);
    await menu('Share article');
    const sheet = version === '6.0.1' ? 'mmin' : 'ngin';
    await b.until(`!!document.querySelector('.${sheet}-sheet')`);
    await b.click(`.${sheet}-dim`);
    await b.until(`!document.querySelector('.${sheet}-sheet')`);
    await b.act(`${cls}-close`);
    // The drawer's Technology section.
    await b.act(`${cls}-drawer`);
    await b.click(`#viewport [data-action="${cls}-section"][data-id="Technology"]`);
    await b.until(`document.querySelectorAll('#viewport .${cls}-story').length===2 && !document.querySelector('#viewport .${cls}-now')`);
    // Search.
    await b.act(`${cls}-search`);
    await type(`#viewport [data-news-search]`, 'comet');
    await b.until(`document.querySelectorAll('#viewport .${cls}-story').length===1`);
    await type(`#viewport [data-news-search]`, 'zzz');
    await b.until(`/No matching news/.test(document.querySelector('#viewport .${cls}-empty')?.textContent||'')`);
    await b.act(`${cls}-search-close`);
    // The dark theme and Edit weather display's Hide from the overflow.
    await b.act(`${cls}-section`, {id: 'Headlines'});
    await b.click(`#viewport .${cls}-more`);
    await menu('Switch to dark theme');
    await b.until(`document.querySelector('#viewport .${cls}').classList.contains('dark')`);
    await b.click(`#viewport .${cls}-more`);
    await menu('Edit weather display');
    await item('Hide');
    await b.until(`!document.querySelector('#viewport .${cls}-now')`);
    assert.equal((await news()).weather, 'hide');
    await b.send('Emulation.setDeviceMetricsOverride', {width: 375, height: 812, deviceScaleFactor: 1, mobile: true});
    await b.open('news-weather');
    assert.ok(await b.ev(`document.querySelector('#viewport').scrollWidth<=document.querySelector('#viewport').clientWidth+1`), 'fits the phone width');
    b.check();
    console.log(version, 'news ok');
  } catch (error) { await b.shot(`${version}-news-failure`); throw error; } finally { b.close(); }
}
