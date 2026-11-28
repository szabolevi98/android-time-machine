const engineSource=require('./lib/engine-source.cjs');
require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Accessibility sub-pages (audit step 5): Touch & hold delay with a real effect on the simulator's long presses,
// Magnification gestures (triple tap) and the accessibility shortcut page on 4.3 / 4.4.4 / 5.1.1.
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w={window:{}};w.window.window=w.window;vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  const a=w.window.StockStrings.a11y;assert.equal(a['Touch & hold delay'].hu,'Érintés és tartási késleltetés');
  assert.deepEqual(['Short','Medium','Long'].map(k=>a[k].hu),['Rövid','Közepes','Hosszú']);
  const sim=engineSource(v);
  assert.ok(sim.includes("const HOLD = [500, 1000, 1500]")&&sim.includes("case 'a11y-hold-pick'")&&sim.includes("ui.overlay === 'a11y-hold'"),v);
  assert.ok((sim.match(/holdDelay\(\d{3}\)/g)||[]).length>=4,`${v} long-press timers`);
  if(v==='4.0.4')continue;
  assert.match(a['Magnification summary'].en,/triple-tap/i);
  assert.ok(sim.includes("if (s === 'a11y-magnification')")&&sim.includes("if (s === 'a11y-shortcut')"),v);
  assert.ok(sim.includes('function applyMagnification()')&&sim.includes("child.id === 'nav-bar'")&&sim.includes('{s: 2, tx: -x, ty: -y}'),v);
  assert.ok(fs.existsSync(`versions/${v}/assets/fw-magnified_region_frame.png`),v);
  assert.match(fs.readFileSync(`versions/${v}/style.css`,'utf8'),/\.screen \.magnify-frame\{[^}]*fw-magnified_region_frame/);
}
console.log('accessibility-settings ok');
