require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Chrome settings and Clear browsing data (audit step 5): Chrome 27 (4.3), 32 (4.4.4) and 40 (5.1.1).
for(const [v,version,last,inBar] of [['4.3','27.0.1453.111','Developer tools',true],['4.4.4','32.0.1700.99','About Chrome',true],['5.1.1','40.0.2214.89','About Chrome',false]]){
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/chrome.js`,'utf8'),w);
  const C=w.window.ChromeApp,t=k=>k;
  const ctx=(ui={},data={})=>({ui:{browserIndex:0,browserHistory:[],...ui},data:{browserHistory:['example.com'],bookmarks:[],...data},t,locale:'en',url:C.NTP,page:()=>'',title:u=>u,tabs:[{url:C.NTP}],active:0});
  // The header list from the image's preference XML, Basics / Advanced.
  const main=C.render(ctx({sub:'chrome-settings'}));
  assert.match(main,/Basics[\s\S]*Search engine[\s\S]*Advanced[\s\S]*Privacy/);assert.ok(main.lastIndexOf(last)>main.indexOf('Privacy'),v);
  // Privacy: check boxes with summaries, the crash report list, Clear browsing data in the bar (27 / 32) or the overflow (40).
  const privacy=C.render(ctx({sub:'chrome-settings',chromePrefStack:['privacy']}));
  assert.match(privacy,/Navigation error suggestions[\s\S]*chr-pref-check on/);assert.match(privacy,/Usage and crash reports[\s\S]*Never send/);
  assert.equal(/chr-pref-action" data-action="chrome-clear-open"/.test(privacy),inBar,v);
  if(!inBar)assert.match(C.render(ctx({sub:'chrome-settings',chromePrefStack:['privacy'],chromePrefMenu:true})),/role="menuitem" data-action="chrome-clear-open"/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromePrefStack:['privacy']},{chromePrefs:{navigation_error:false,crash:1}})),/Only send on Wi-Fi/);
  // The dialog: history, cache and cookies ticked; Clear disabled with nothing ticked; then the progress.
  const ticks=Object.fromEntries(Array.from(C.CLEAR_ITEMS).map(([k,,on])=>[k,on]));
  assert.deepEqual({...ticks},{history:true,cache:true,cookies:true,passwords:false,formdata:false});
  const dlg=C.render(ctx({sub:'chrome-settings',chromePrefStack:['privacy'],chromeClear:ticks}));
  assert.match(dlg,/Clear browsing data[\s\S]*Clear browsing history[\s\S]*Clear autofill data[\s\S]*chrome-clear-run"/);assert.doesNotMatch(dlg,/chrome-clear-run" disabled/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromeClear:{}})),/chrome-clear-run" disabled/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromeClear:{history:true,busy:true}})),/Clearing browsing data[\s\S]*Please wait(…|\.\.\.)/);
  // The history page's link opens the dialog; About Chrome shows the version.
  assert.match(C.render({...ctx(),url:C.HISTORY}),/chr-clear" data-action="chrome-clear-open"/);
  assert.match(C.render(ctx({sub:'chrome-settings',chromePrefStack:['about']})),new RegExp(`Chrome ${version.replace(/\./g,'\\.')}`));
  assert.match(C.menu(ctx()),/data-action="chrome-settings"/);
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  for(const a of ['chrome-settings','chrome-list-pick','chrome-clear-open','chrome-clear-run'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
  assert.ok(sim.includes('ChromeApp.prefAction(action, id,')&&sim.includes('ChromeApp.prefBack(ui)')&&sim.includes('ChromeApp.seekPaint(viewport'),v);
  // T07: the local pages. No Home page (no partner home page provider on the images); every header but the sign-in,
  // Autofill and passwords rows opens its page; Search engine lists the country's engines with the current one marked.
  assert.doesNotMatch(main,/data-id="homepage"/);
  assert.deepEqual([...main.matchAll(/data-action="chrome-unsupported" data-id="(\w+)"/g)].map(m=>m[1]).filter(id=>id!=='signin'),['autofill','passwords'],v);
  const engines=C.render(ctx({sub:'chrome-settings',chromePrefStack:['search_engine']}));
  assert.match(engines,/Google \(google\.com\)<\/b><small>Currently selected search engine/);
  assert.equal(C.render(ctx({sub:'chrome-settings',chromePrefStack:['search_engine']},{chromePrefs:{search_engine:1}})).match(/Currently selected search engine/g).length,1);
  // The omnibox: Google keeps the simulator's search: page, another engine its results URL, read back for the page.
  assert.equal(C.searchUrl('a b',{data:{},locale:'en'}),'search:a b');
  const bingIndex=v==='4.3'?2:1,url=C.searchUrl('a b',{data:{chromePrefs:{search_engine:bingIndex}},locale:'en'});
  assert.match(url,/^www\.bing\.com\/search\?setmkt=en-US&q=a\+b$/);assert.deepEqual({...C.searchResult(url)},{name:'Bing',term:'a b'});
  // Text scaling: the slider's percent, Force enable zoom crossing 130 %, and the page's font size.
  const ui={sub:'chrome-settings',chromePrefStack:['accessibility']},data={chromePrefs:{}};
  assert.match(C.render(ctx(ui,data)),/data-chr-scale>100%<[\s\S]*min="50" max="200" step="5" value="100"/);
  C.prefSeek('135',{ui,data,locale:'en'});assert.equal(data.chromePrefs.text_scale,1.35);assert.equal(data.chromePrefs.force_enable_zoom,true);
  C.prefSeek('120',{ui,data,locale:'en'});assert.equal(data.chromePrefs.force_enable_zoom,false);
  assert.match(C.render({...ctx({},data),url:'example.com'}),/class="browser-page" style="font-size:120%"/);
  // A switch page: the action-bar switch saves; Back climbs the page stack.
  const sw={sub:'chrome-settings',chromePrefStack:['privacy','dnt']},swData={chromePrefs:{}};
  assert.match(C.render(ctx(sw,swData)),/chr-pref-barswitch" data-action="chrome-pref-switch" data-id="dnt" role="switch" aria-checked="false"/);
  C.prefAction('chrome-pref-switch','dnt',{ui:sw,data:swData});assert.equal(swData.chromePrefs.dnt,true);
  assert.equal(C.prefBack(sw),true);assert.deepEqual([...sw.chromePrefStack],['privacy']);
}
console.log('chrome-settings ok');
