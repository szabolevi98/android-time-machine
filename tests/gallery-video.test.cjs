require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Recorded videos in the Gallery2 based Gallery (4.3, 4.4.4): slot overlay, PhotoView's play icon, the middle-only tap,
// the video menu (menu/photo.xml with LocalVideo's operations) and MovieActivity's controller states.
for(const [ver,file,global] of [['4.3','jb-gallery.js','JBGallery'],['4.4.4','kk-gallery.js','JBGallery']]){
  const dir=`versions/${ver}/`,html=fs.readFileSync(dir+'index.html','utf8');
  assert.ok(html.indexOf('gallery-video.js')<html.indexOf(file)&&html.includes('gallery-video.css'),ver);
  const c={window:{},encodeURIComponent,ResizeObserver:class{observe(){}}};vm.createContext(c);
  for(const f of ['media.js','gallery-video.js',file])vm.runInContext(fs.readFileSync(dir+f,'utf8'),c);
  const V=c.window.G2Video,gal=c.window[global]||c.window.KKGallery,media=c.window.ICSMedia,t=k=>k;
  assert.equal(V.time(4629),'00:04');assert.equal(V.time(3725000),'1:02:05');
  assert.ok(V.slot({video:true}).includes('gallery-ic_video_thumb')||V.slot({video:true}).includes('g2v-strip'));assert.equal(V.slot({}),'');
  const rect={left:0,top:0,width:120,height:240};assert.ok(V.centerTap(rect,60,120)&&V.centerTap(rect,69,139));assert.ok(!V.centerTap(rect,71,120)&&!V.centerTap(rect,60,141));
  const clip={id:9,name:'VID_20261009_101010',album:'camera',created:Date.now(),video:true,duration:5000},data={photos:[clip,{id:1,name:'Canyon'}]};
  const ui={sub:'album',galleryAlbum:'camera',galleryCluster:'album'};
  assert.ok(gal.render(data,ui,t,media,'en').includes('g2v-slot-play'),ver+' grid');
  Object.assign(ui,{sub:'photo',selectedPhoto:9,galleryPopup:'photo-menu'});
  const photo=gal.render(data,ui,t,media,'en');
  assert.ok(photo.includes('g2v-photo-play')&&photo.includes('>Trim<')&&photo.includes('>Mute<')&&!photo.includes('>Edit<')&&!photo.includes('>Crop<'),ver+' photo');
  Object.assign(ui,{sub:'movie',galleryPopup:'',galleryMovie:{id:9,pos:5000,ended:true}});
  const movie=gal.render(data,ui,t,media,'en');
  assert.ok(movie.includes('data-page="movie"')&&movie.includes('VID_20261009_101010')&&movie.includes('ic_vidcontrol_reload')&&movie.includes('00:05'),ver+' movie');
  ui.galleryMovie={id:9,pos:1000,paused:true};assert.ok(gal.render(data,ui,t,media,'en').includes('ic_vidcontrol_play'));
  assert.equal(gal.back(ui,data),true);assert.equal(ui.sub,'photo');
  // Native isModified thresholds and independent, composable edits: a second trim advances within the same source.
  assert.equal(V.modified({start:0,end:5000},5000),false);
  assert.equal(V.modified({start:0,end:4950},5000),false);
  assert.equal(V.modified({start:1000,end:1099},5000),false);
  assert.equal(V.modified({start:1000,end:1100},5000),true);
  const before=JSON.stringify(clip),trim=V.copy(clip,{start:1000,end:4000},10000);
  assert.equal(trim.duration,3000);assert.equal(trim.clip.from,1000);assert.equal(trim.clip.full,5000);
  assert.match(trim.name,/^TRIM_\d{8}_\d{6}$/);assert.equal(trim.album,clip.album);assert.equal(trim.created,clip.created);
  assert.equal(V.frameAt(trim,0),.2);assert.equal(V.frameAt(trim,3000),.8);
  const mute=V.copy(trim,{mute:true},20000),again=V.copy(mute,{start:500,end:2000},30000);
  assert.match(mute.name,/^MUTE_/);assert.equal(mute.muted,true);assert.equal(mute.duration,3000);
  assert.equal(again.clip.from,1500);assert.equal(again.clip.full,5000);assert.equal(again.muted,true);
  assert.equal(JSON.stringify(clip),before,'edits preserve the original');
  Object.assign(ui,{sub:'trim',galleryTrim:null});
  assert.ok(gal.render(data,ui,t,media,'en').includes('data-g2v-save disabled'));
  ui.galleryTrim.start=1000;
  assert.ok(!gal.render(data,ui,t,media,'en').includes('data-g2v-save disabled'));
  assert.equal(gal.back(ui,data),true);assert.equal(ui.sub,'photo');assert.equal(ui.galleryTrim,null);
}
// The cameras save the clip instead of a "not saved" note.
for(const f of ['4.3/jb-camera.js','4.4.4/kk-camera.js','5.1.1/lp-camera.js'])assert.ok(fs.readFileSync('versions/'+f,'utf8').includes('shoot({duration})'),f);
console.log('gallery-video ok');
