require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// KitKat Launcher3 clings: first run, then the workspace cling; the folder cling on an open folder; none in overview.
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/launcher-clings.js','utf8'),context);
const c=context.window.LauncherClings,t=k=>k;
assert.equal(c.SHOW,250);assert.equal(c.DISMISS,200);
assert.ok(Math.abs(c.RING.outer-60*0.906)<1e-9&&Math.abs(c.RING.inner-50*0.906)<1e-9&&Math.abs(c.RING.lift-30*0.906)<1e-9);
const none=c.fresh();
assert.equal(c.wanted({view:'home',overlay:''},none),'firstRun');
assert.equal(c.wanted({view:'home',overlay:''},{...none,firstRun:true}),'workspace');
assert.equal(c.wanted({view:'home',overlay:'',overview:true},{...none,firstRun:true}),'');
assert.equal(c.wanted({view:'home',overlay:'folder'},none),'folder');
assert.equal(c.wanted({view:'drawer',overlay:''},none),'','Launcher3 has no all apps cling');
assert.equal(c.wanted({view:'home',overlay:''},c.dismissedAll()),'');
assert.ok(c.markup('firstRun',t).includes('Create more screens for apps and folders'));
assert.ok(c.markup('workspace',t).includes('kk-cling-ring')&&c.markup('workspace',t).includes('data-id="workspace"'));
// Stock Nexus 5 (Google Now Launcher): one home pane with the Google folder and Play Store, Phone/Hangouts/Chrome dock.
const sim=engineSource('4.4.4').replace(/\r\n/g,'\n');
assert.ok(sim.includes("homePages: [Array.from({length: 16}, (_, slot) => slot === 12 ? 'folder-google' : slot === 15 ? 'play-store' : null)]"));
assert.ok(sim.includes("dock: ['phone', 'hangouts', 'apps', 'chrome', 'camera']"));
assert.ok(sim.includes("view: 'home', sub: '', page: 0,"),'the home pane right of Google Now is the default');
for(const f of ['l3-ic_allapps','l3-ic_home_google_logo_normal_holo','l3-ic_home_voice_search_holo','l3-search_frame','l3-workspace_bg','l3-portal_container_holo','l3-portal_ring_inner_holo','l3-ic_pageindicator_current','l3-ic_pageindicator_default','l3-ic_pageindicator_add','l3-cling','l3-cling_button','l3-screenpanel','kk-ic_sysbar_lights_out_dot_small','kk-ic_sysbar_lights_out_dot_large'])assert.ok(fs.existsSync(`versions/4.4.4/assets/${f}.png`),f);
assert.ok(fs.existsSync('versions/4.4.4/assets/kk-default_wallpaper.jpg')&&fs.existsSync('versions/4.4.4/assets/RobotoCondensed-Regular.ttf'));
console.log('kk-launcher ok');
// About phone on the Nexus 5 (KTU84P) and the KitKat easter egg assets.
assert.ok(sim.includes("row('Model number', 'Nexus 5'")&&sim.includes("row('Android version', '4.4.4'")&&sim.includes("row('Build number', 'KTU84P'"));
const egg={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-egg.js','utf8'),egg);
for(const d of [...egg.window.KKEgg.PASTRIES,...egg.window.KKEgg.RARE,...egg.window.KKEgg.XRARE,...egg.window.KKEgg.XXRARE])assert.ok(fs.existsSync(`versions/4.4.4/assets/kk-dessert_${d}.png`),d);
assert.ok(fs.existsSync('versions/4.4.4/assets/kk-platlogo.png'));
{ // Launcher3's Workspace.REORDER_TIMEOUT (kk-launcher.js), longer than Launcher2's 250 ms.
  const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/kk-launcher.js','utf8'),w);
  const L=Object.values(w.window).find(x=>x&&x.REORDER_TIMEOUT);assert.equal(L.REORDER_TIMEOUT,350);assert.equal(L.REORDER_DURATION,150);
}
console.log('kk about + egg ok');
