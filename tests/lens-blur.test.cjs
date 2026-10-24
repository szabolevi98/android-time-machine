require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Lens Blur (T49, 5.1.1): the sweep counts only a slow drag upwards, a full one succeeds; the saved picture blurs
// round its focus by its strength.
const w={window:{},TextEncoder,TextDecoder};w.window.window=w.window;
for(const f of ['stock-strings.js','media.js','lp-refocus.js'])vm.runInNewContext(fs.readFileSync(`versions/5.1.1/${f}`,'utf8'),w);
const R=w.window.LPRefocus,M=w.window.ICSMedia;
const g={state:'capture',travel:0};
assert.equal(R.move(g,80,0,200,100),false);assert.equal(g.travel,0,'sideways does not count');
assert.equal(R.move(g,0,-300,50,100),false);assert.equal(g.travel,0,'too fast does not count');
assert.equal(R.move(g,0,-60,200,100),false);assert.equal(g.travel,60);
assert.equal(R.move(g,0,30,200,100),false);assert.equal(g.travel,30,'down takes back');
assert.equal(R.move(g,0,-80,200,100),true);assert.equal(g.state,'success');
assert.equal(R.shutterIcon({lpRefocus:{state:'capture'}}),'ic_cancel_normal');assert.equal(R.shutterIcon({}),'ic_capture_refocus');
const ui={lpRefocus:{state:'capture',travel:20}};assert.equal(R.back(ui),true);assert.equal(ui.lpRefocus.state,'idle');assert.equal(R.back(ui),false);
const svg=url=>decodeURIComponent(url.replace('data:image/svg+xml,',''));
const out=svg(M.image({id:9,colors:['#96c8d0','#e8ad7a','#364e59'],refocus:{focus:[.25,.75],strength:.5}}));
assert.match(out,/feGaussianBlur stdDeviation="11.00"/);assert.match(out,/<ellipse cx="256" cy="576"/);assert.equal((out.match(/<image /g)||[]).length,2);
assert.match(svg(M.image({id:9,rotation:90,refocus:{focus:[.5,.5],strength:0}})),/width="768" height="1024"/);
// The camera, Photos and the shell are wired.
const cam=fs.readFileSync('versions/5.1.1/lp-camera.js','utf8'),sim=fs.readFileSync('versions/5.1.1/simulator.js','utf8');
assert.ok(cam.includes("if (mode === 'refocus') { refocus?.shutter(); return; }"));
assert.ok(sim.includes("clip?.refocus ? {refocus: {focus: [.5, .5], strength: .6}}")&&sim.includes("case 'photos-refocus-done'"));
assert.ok(fs.readFileSync('versions/5.1.1/photos.js','utf8').includes("photo.refocus ? 'photos-refocus'"));
console.log('lens-blur ok');
