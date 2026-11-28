require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{devicePixelRatio:1},Intl,performance,document:{},Image:class{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
vm.runInNewContext(fs.readFileSync('versions/4.3/live-wallpapers.js','utf8'),context);
const lw=context.window.LiveWallpapers,plain=v=>JSON.parse(JSON.stringify(v));
// The two copies differ in the 4.0.4 descriptions, in Phase Beam's label (IMM76I's PhaseBeam.apk has no translations: raw, JWR66Y's has) and in
// Microbes, which only the Galaxy Nexus image ships.
const lf=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n'),ics=lf('versions/4.0.4/live-wallpapers.js'),microbes=/\n  \/\* ---------- Microbes [\s\S]*?\n  }\n(?=\n  \/\* ---------- )/;
assert.ok(microbes.test(ics),'Microbes scene in 4.0.4');
// 4.0.4's list also carries the wallpapers' descriptions (live_wallpaper_entry.xml has a description line there only).
assert.ok(ics.includes('const DESCRIPTIONS = ')&&ics.includes("'galaxy': {res: 'LiveWallpapers:wallpaper_galaxy_desc', en: 'A galaxy made of slowly swirling stars.'"));
assert.equal(ics.replace(/  \/\* LiveWallpaperListAdapter \(4\.0\.4\)[\s\S]*?\n  const describe = [^\n]*\n/,'').replace('{describe, ','{').replace(microbes,'').replace(/    \{id: 'microbes'.*\n/,'').replaceAll(', gl: true, raw: true}',', gl: true}'),lf('versions/4.3/live-wallpapers.js'),'both versions share the rest of the file');
// packages/wallpapers/Basic services, sorted by label as LiveWallpaperListAdapter does with a Collator.
assert.deepEqual(plain(lw.sorted(k=>k,'en').map(s=>s.label)),['Bubbles','Galaxy','Grass','Holo Spiral','Many','Maps','Nexus','Phase Beam','Polar clock','Spectrum','VU meter','Water','Waveform']);
// Phase Beam, the Galaxy Nexus and Nexus 4 images' default_wallpaper_component, with its image's mesh and textures.
const pb=fs.readFileSync('versions/4.3/live-wallpapers.js','utf8');assert.ok(pb.includes('interval: 66')&&pb.includes('gl.blendFunc(gl.SRC_ALPHA, gl.ONE)'));
for(const v of ['4.0.4','4.3'])for(const f of ['dot','beam','thumb'])assert.ok(fs.existsSync(`versions/${v}/assets/lw-phasebeam_${f}.png`),v+f);
// Phase Beam is the first-boot wallpaper on 4.0.4 only; 4.3 opens on JWR66Y's default_wallpaper (xhdpi wallpaper_05) and moves a
// desktop still on an old default (Phase Beam, then wallpaper_01) to it (wallpaperRevision 2 and 3).
assert.ok(fs.readFileSync('versions/4.0.4/simulator.js','utf8').includes("liveWallpaper: { id: 'phasebeam' }"));
const jbSim=fs.readFileSync('versions/4.3/simulator.js','utf8');assert.ok(!jbSim.includes("liveWallpaper: { id: 'phasebeam' }"));assert.match(jbSim,/wallpaper: 4, wallpaperRevision: 3/);assert.match(jbSim,/result\.liveWallpaper\?\.id === 'phasebeam'/);
assert.equal(lw.labelOf(lw.find('phasebeam'),k=>k==='Phase Beam'?'Elmosódott cseppek':k),'Elmosódott cseppek');
// AudioCapture: silence returns zero samples, then nothing after MAX_IDLE_TIME_MS; music yields centred 8-bit PCM.
let playing=false;const cap=lw.audioCapture(()=>playing);
assert.equal(cap.pcm(16).length,16);assert.ok(cap.pcm(16).every(v=>v===0));
playing=true;const pcm=cap.pcm(1024);assert.equal(pcm.length,1024);assert.ok(pcm.some(v=>v!==0)&&pcm.every(v=>v>=-128&&v<=127));
assert.equal(cap.fft(512).length,512);
// Visualization4RS needle: at rest it parks at 131°, a loud signal swings it toward the peak.
const needle=lw.needleModel();needle.step([]);assert.equal(needle.angle,131);for(let i=0;i<40;i++)needle.step(new Array(64).fill(50000));assert.ok(needle.angle<131);
const hu={Galaxy:'Galaxis',Grass:'Fű','Polar clock':'Íves óra',Water:'Víz',Nexus:'Nexus',Waveform:'Hullám',Spectrum:'Spektrum','VU meter':'Kivezérlésjelző',Many:'Sok','Phase Beam':'Elmosódott cseppek','Holo Spiral':'Holografikus spirál',Bubbles:'Buborékok',Maps:'Térkép'};
assert.deepEqual(plain(lw.sorted(k=>hu[k]||k,'hu').map(s=>hu[s.label])),['Buborékok','Elmosódott cseppek','Fű','Galaxis','Holografikus spirál','Hullám','Íves óra','Kivezérlésjelző','Nexus','Sok','Spektrum','Térkép','Víz']);
assert.deepEqual(plain(lw.LIST.filter(s=>s.settings).map(s=>s.id)),['maps','polar'],'Maps and Polar clock have settings activities');
assert.deepEqual(plain(lw.PALETTE_ORDER),['palette_gray','palette_white_c','palette_black_c','palette_matrix','palette_halloween','palette_violet','palette_oceanic','palette_zenburn']);
assert.equal(lw.PALETTES.palette_violet.minute,'#603050');
for(const id of lw.PALETTE_ORDER)assert.ok(lw.PALETTE_NAMES[id],id);
// Matrix4f.loadProjectionNormalized: x spans -1..1 at z = 0 in portrait, y spans ±h/w.
const {M}=lw,P=M.projectionNormalized(720,1280),apply=(m,[x,y,z])=>{const v=[0,0,0,0];for(let r=0;r<4;r++)v[r]=m[r]*x+m[4+r]*y+m[8+r]*z+m[12+r];return [v[0]/v[3],v[1]/v[3]];};
const [nx]=apply(P,[1,0,0]),[,ny]=apply(P,[0,1280/720,0]);
assert.ok(Math.abs(nx-1)<1e-6&&Math.abs(ny-1)<1e-6,`normalized projection ${nx} ${ny}`);
for(const v of ['4.0.4','4.3'])for(const f of ['lw-pyramid_background.png','lw-pulse.png','lw-glow.png','lw-space.jpg','lw-flares.png','lw-light1.jpg','lw-pond.jpg','lw-leaves.png','lw-night.jpg','lw-sky.jpg','lw-sunrise.jpg','lw-sunset.jpg','lw-galaxy_thumb.jpg','lw-polarclock_thumb.jpg','lw-vis-fire.png','lw-vis-ice.png','lw-vis-needle.png','lw-vis-albumart.png','lw-vis5.png'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}`),`${v} ${f}`);
console.log('Live wallpaper checks passed: list order per locale, settings, palettes, projection and assets.');
// Microbes: only the Nexus S and Galaxy Nexus images ship Google's Microbes.apk; the four shaders come from libmicrobes_jni.so.
for(const v of ['2.3.6','4.0.4']){
  const c={window:{devicePixelRatio:1},Intl,performance,document:{},Image:class{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
  vm.runInNewContext(fs.readFileSync(`versions/${v}/live-wallpapers.js`,'utf8'),c);
  assert.ok(c.window.LiveWallpapers.find('microbes'),v);assert.ok(fs.existsSync(`versions/${v}/assets/lw-microbes_thumb.png`),v);
  const src=fs.readFileSync(`versions/${v}/live-wallpapers.js`,'utf8');
  for(const s of ['vWidthScale=1./mix(.5,.9,energy)','pow(2.81,-pow(h*2.,2.))','vWidthScale=7./energy','mix(.03,.08,pos.z)'])assert.ok(src.includes(s),v+s);
}
assert.ok(!lw.find('microbes'),'the Nexus 4 image has no Microbes');
console.log('Microbes checks passed: registered on 2.3.6 and 4.0.4 with the library shaders.');
// Maps (Google Maps' MapWallpaper, in all three images): drawn here, with wallpaper_prefs.xml's options and translations.
for(const v of ['2.3.6','4.0.4','4.3']){
  const c={window:{devicePixelRatio:1},Intl,performance,document:{},Image:class{},requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
  vm.runInNewContext(fs.readFileSync(`versions/${v}/live-wallpapers.js`,'utf8'),c);
  const spec=c.window.LiveWallpapers.find('maps');assert.ok(spec&&spec.settings,v);assert.ok(fs.existsSync(`versions/${v}/assets/lw-maps_thumb.png`),v);
  const sim=require('./lib/engine-source.cjs')(v);assert.ok(sim.includes("sub === 'settings:maps'")&&sim.includes("case 'lw-mapmode-pick'"),v);
  assert.equal(sim.includes("data-id=\"maps:traffic\""),v==='2.3.6','Show traffic only in Maps 5.4.0 (Nexus S)');
}
assert.ok(fs.readFileSync('i18n.js','utf8').includes("'Maps|Normal': {own: true, hu: 'Normál', de: 'Normal', fr: 'Standard', es: 'Normal'}"));
console.log('Maps wallpaper checks passed: registered with settings on 2.3.6, 4.0.4 and 4.3.');
