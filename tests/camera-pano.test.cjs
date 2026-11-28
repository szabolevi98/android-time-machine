require('./lib/vm-strings.cjs');
const engineSource=require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Panorama with a demonstration result: the 4.3 / 4.4.4 PanoramaModule layouts, the LP approximation, PANO_ pictures.
for(const [ver,cam] of [['4.3','jb-camera.js'],['4.4.4','kk-camera.js']]){
  const dir=`versions/${ver}/`,html=fs.readFileSync(dir+'index.html','utf8');
  assert.ok(html.indexOf('camera-pano.js')<html.indexOf(cam)&&html.includes('camera-pano.css'),ver);
  const c={window:{}};vm.createContext(c);for(const f of ['media.js','camera-pano.js'])vm.runInContext(fs.readFileSync(dir+f,'utf8'),c);
  const P=c.window.JBPano,media=c.window.ICSMedia,t=k=>k,data={photos:[]};
  assert.equal(P.SWEEP,160);
  assert.ok(P.render(data,{},t,media).includes('data-state="idle"'));
  const cap=P.render(data,{jbPano:{state:'capture'}},t,media);assert.ok(cap.includes('Capturing panorama')&&cap.includes('ic_pan_progression')&&!cap.includes('pnm-pan" hidden'));
  const rev=P.render(data,{jbPano:{state:'review'}},t,media);assert.ok(rev.includes('Rendering panorama')&&rev.includes('ic_menu_cancel_holo_light')&&rev.includes('data-pnm-saving'));
  assert.ok(decodeURIComponent(media.image({pano:true})).includes('width="3072"'));
  assert.ok(fs.readFileSync(dir+cam,'utf8').includes('pano?.toggle()'));
}
const lp=fs.readFileSync('versions/5.1.1/lp-camera.js','utf8');assert.ok(lp.includes("mode === 'panorama') { panoToggle(); return; }")&&lp.includes('pano_target_activated'));
for(const v of ['4.3','4.4.4','5.1.1'])assert.ok(engineSource(v).includes('PANO_${stamp.slice(0, 8)}'),v);
console.log('camera-pano ok');
