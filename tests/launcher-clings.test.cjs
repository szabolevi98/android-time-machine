require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/launcher-clings.js','utf8'),context);
const c=context.window.LauncherClings,t=k=>k;
// 4.0.4 and 4.3 each keep their own copy; the images' cling layouts and texts are the same, so only the comments differ.
{const strip=f=>fs.readFileSync(f,'utf8').replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/gm,'');assert.equal(strip('versions/4.0.4/launcher-clings.js'),strip('versions/4.3/launcher-clings.js'),'same behaviour in both');}
assert.equal(c.SHOW,550);assert.equal(c.DISMISS,250);assert.equal(c.REVEAL,48);
assert.ok(Math.abs(c.PUNCH-400*48/94)<1e-9,'cling.png is scaled by reveal_radius / clingPunchThroughGraphicCenterRadius');
// Launcher shows the workspace cling on home, the all apps cling in the drawer and the folder cling in an open folder.
const none=c.fresh();
assert.equal(c.wanted({view:'home',overlay:''},none),'workspace');
assert.equal(c.wanted({view:'drawer',overlay:''},none),'allApps');
assert.equal(c.wanted({view:'home',overlay:'folder'},none),'folder');
assert.equal(c.wanted({view:'home',overlay:'shade'},none),'');
assert.equal(c.wanted({view:'settings',overlay:''},none),'');
assert.equal(c.wanted({view:'home',overlay:''},c.dismissedAll()),'');
const html=c.markup('allApps',t,[100,200]);
assert.ok(html.includes('Choose some apps')&&html.includes('cling-hand')&&html.includes('data-action="cling-dismiss" data-id="allApps"')&&html.includes('cling-bg_cling2.png'));
assert.ok(c.markup('workspace',t,[1,1]).includes('To see all your apps, touch the circle.'));
assert.ok(!c.markup('folder',t,null).includes('cling-punch'));
for(const v of ['4.0.4','4.3'])for(const f of ['bg_cling1','bg_cling2','bg_cling3','cling','hand','btn_cling_normal','btn_cling_pressed'])assert.ok(fs.existsSync(`versions/${v}/assets/cling-${f}.png`),`${v} ${f}`);
for(const v of ['4.0.4','4.3']){const sim=engineSource(v);assert.ok(sim.includes('if (!saved.clings) result.clings = LauncherClings.dismissedAll();'),'saved desktops skip the first-run clings');}
console.log('Launcher cling checks passed: timings, scaling, when each cling shows, markup and assets.');
