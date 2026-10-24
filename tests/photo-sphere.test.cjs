require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Photo Sphere (T49) in the 4.4 and 5.1 cameras: LightCycle's targets, the hold that takes a frame, Undo / discard,
// Done once two frames are in, the saved equirectangular picture and the viewers' wiring.
for(const [v,file,name,state] of [['4.4.4','kk-sphere.js','KKSphere','kkSphere'],['5.1.1','lp-sphere.js','LPSphere','lpSphere']]){
  const w={window:{},TextEncoder,TextDecoder};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/media.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/${file}`,'utf8'),w);
  const X=w.window[name],M=w.window.ICSMedia;
  // Three rings of eight, the horizon first, 45 degrees apart.
  const T=X.targets();assert.equal(T.length,24);assert.deepEqual([T[0].row,T[8].row,T[16].row],[0,1,2]);assert.equal(T[1].x,X.STEP);
  const g=X.start();assert.equal(X.aligned(g),false,'the first dot is off the circle');
  X.move(g,0,-g.y,1000);assert.equal(X.aligned(g),true);
  assert.equal(X.tick(g,1000),false);assert.equal(X.tick(g,1000+X.HOLD-1),false);assert.equal(X.tick(g,1000+X.HOLD),true,'held 350 ms');
  assert.deepEqual(JSON.parse(JSON.stringify(g.frames)),[{col:0,row:0}]);assert.equal(X.canSave(g),false);
  // The next target sits a step to the right; a quick turn is "Too fast" but the frame is still taken when held.
  assert.ok(Math.abs(X.offset(g).dx-X.STEP)<1e-9);X.move(g,X.STEP,0,1416);assert.ok(g.tooFast>1416);
  X.tick(g,3000);X.tick(g,3000+X.HOLD);assert.equal(g.frames.length,2);assert.equal(X.canSave(g),true);
  // The yaw wraps round: from the last column the first is one step on.
  const h=X.start();h.x=7*X.STEP;assert.ok(Math.abs(X.offset(h).dx-X.STEP)<1e-9);
  assert.equal(X.complete({index:24}),true);
  if(v==='4.4.4'){X.undo(g);assert.equal(g.frames.length,1);X.tick(g,5000);assert.equal(X.tick(g,6000),false,'not retaken while still on the dot');X.move(g,.2,0,7000);X.tick(g,7000);X.move(g,-.2,0,8000);X.tick(g,8000);assert.equal(X.tick(g,8000+X.HOLD),true,'taken again after leaving it');X.undo(g);X.undo(g);assert.equal(g.frames.length,1,'the first frame stays');}
  else{
    const ui={lpSphere:X.start()};assert.equal(X.capturing(ui),false);assert.equal(X.back(ui),false,'Back leaves the camera before a frame');
    ui.lpSphere.frames=[{col:0,row:0}];assert.equal(X.shutterIcon(ui),'ic_done_disabled');assert.match(X.cancelButton(ui,k=>k),/data-lps-cancel[^>]*aria-label="Discard photo sphere"/);
    ui.lpSphere.frames.push({col:1,row:0});assert.equal(X.shutterIcon(ui),'ic_done_normal');
    assert.equal(X.back(ui),true);assert.equal(ui.lpSphere.frames.length,0,'Back discards');
  }
  // The picture: 4096 x 2048, grey where nothing was taken, nothing grey when everything was; the capture layer is clipped.
  const svg=url=>decodeURIComponent(url.replace('data:image/svg+xml,',''));
  const part=svg(M.image({sphere:true,frames:[{col:0,row:0}]}));assert.match(part,/width="4096" height="2048"/);assert.match(part,/fill="#808080"/);
  assert.equal((part.match(/<rect x=/g)||[]).length,2*23,'two copies of each missing cell (wrapping)');
  const full=svg(M.image({sphere:true,frames:'all'}));assert.doesNotMatch(full,/<rect x="[^"]*" y="\d+" width="512"/);
  assert.match(svg(M.sphereImage({frames:[{col:3,row:1}]},true)),/<clipPath id="taken"[^>]*><rect x="1280" y="256" width="512" height="512"\/>/);
  // Saved as a PANO_ picture from the camera.
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  assert.ok(sim.includes("clip?.sphere ? {sphere: true, frames: clip.sphere}")&&sim.includes("clip?.pano || clip?.sphere ? `PANO_"),v);
  const html=fs.readFileSync(`versions/${v}/index.html`,'utf8');assert.match(html,new RegExp(`${file.replace('.','\\.')}\\?v=\\d+`));
}
// Where the old refusal was, the camera now captures; the viewers open the sphere.
const kk=fs.readFileSync('versions/4.4.4/kk-camera.js','utf8'),lp=fs.readFileSync('versions/5.1.1/lp-camera.js','utf8');
assert.ok(!kk.includes('Photo Sphere capture is not simulated')&&kk.includes("if (module === 'photosphere') { sphere?.shutter(); return; }"));
assert.ok(lp.includes("if (mode === 'photosphere') { sphere?.shutter(); return; }"));
assert.ok(fs.readFileSync('versions/4.4.4/kk-gallery.js','utf8').includes('data-jbgal-sphere'));
assert.ok(fs.readFileSync('versions/5.1.1/photos.js','utf8').includes("photo.sphere ? 'photos-sphere'"));
console.log('photo-sphere ok');
