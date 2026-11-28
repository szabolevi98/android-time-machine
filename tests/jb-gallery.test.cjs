require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},encodeURIComponent,ResizeObserver:class{observe(){}}};vm.createContext(context);
vm.runInContext(fs.readFileSync('versions/4.3/media.js','utf8'),context);vm.runInContext(fs.readFileSync('versions/4.3/gallery-video.js','utf8'),context);vm.runInContext(fs.readFileSync('versions/4.3/jb-gallery.js','utf8'),context);
const gal=context.window.JBGallery,media=context.window.ICSMedia,plain=v=>JSON.parse(JSON.stringify(v)),t=k=>k;
const day=new Date(2026,9,1,12).getTime();
const data={photos:[{id:101,name:'IMG_1',album:'camera',created:day},{id:102,name:'IMG_2',album:'camera',created:day+1000},{id:1,name:'Canyon'},{id:2,name:'Coast'}]};
// FilterUtils clusters: albums (Camera, Pictures), one location group, day clusters, no faces, Untagged.
assert.deepEqual(plain(gal.groups(data,'album').map(g=>[g.key,g.items.length])),[['camera',2],['pictures',2]]);
assert.deepEqual(plain(gal.groups(data,'location').map(g=>g.name)),['No location']);
assert.deepEqual(plain(gal.groups(data,'people')),[]);
assert.deepEqual(plain(gal.groups(data,'tag').map(g=>[g.name,g.items.length])),[['Untagged',4]]);
const times=gal.groups(data,'time','en-US');assert.equal(times.length,2);assert.equal(times[0].name,'Oct 1, 2026');assert.equal(times[0].items.length,2);assert.equal(times[1].name,'Unknown');
assert.equal(gal.items(data,{galleryCluster:'time',galleryAlbum:times[0].key}).length,2);
assert.equal(gal.items(data,{galleryAlbum:'pictures'}).length,2);
// Config values: 3 album-set rows, 4 album rows, 7dp / 5dp gaps, 30dp labels; film mode 70% x 48%, 16dp gaps.
assert.equal(gal.G.setRows,3);assert.equal(gal.G.albumRows,4);assert.ok(Math.abs(gal.G.labelHeight-27)<1e-9);
const film=gal.fit({},360,600,true);assert.ok(Math.abs(film.w-252)<1e-9&&Math.abs(film.h-189)<1e-9,'landscape picture limited by 70% width');
const tall=gal.fit({rotation:90},360,600,true);assert.ok(Math.abs(tall.h-288)<1e-9,'portrait picture limited by 48% height');
assert.deepEqual(plain(gal.fit({},360,600,false)),{w:360,h:270});
const stripFilm=gal.strip([{},{},{rotation:90}],1,360,600,true);
assert.equal(stripFilm[1].x,0);assert.ok(Math.abs(stripFilm[0].x+(252+gal.G.imageGap))<1e-9);assert.ok(Math.abs(stripFilm[2].x-(126+gal.G.imageGap+tall.w/2))<1e-9);
assert.equal(gal.strip([{},{}],0,360,600,false)[1].x,360+gal.G.imageGap);
// Back: popup, editor with unsaved changes asks first, film mode, photo -> camera or album, album -> set.
const ui={sub:'edit',galleryEdit:{...gal.editState(data.photos[0]),look:'vintage'}};
assert.equal(gal.back(ui,data),true);assert.equal(ui.galleryEdit.confirm,true);assert.equal(ui.sub,'edit');
assert.equal(gal.back(ui,data),true);assert.equal(ui.sub,'photo');
assert.equal(gal.back({sub:'photo',galleryFromCamera:true},data),'camera');
const film2={sub:'photo',galleryFilm:true};assert.equal(gal.back(film2,data),true);assert.equal(film2.galleryFilm,false);
const album={sub:'album'};gal.back(album,data);assert.equal(album.sub,'');assert.equal(gal.back({sub:''},data),false);
assert.notEqual(gal.editKey({...gal.editState(data.photos[0]),mirror:true}),gal.editKey(gal.editState(data.photos[0])));
// Markup: spinner, labels with counts, horizontal grids, photo bars and edit button, editor panels.
const set=gal.render(data,{},t,media,'en-US');
assert.ok(set.includes('data-jbgal-open="cluster"')&&set.includes('jbgal-set-grid')&&set.includes('<small>2</small>')&&set.includes('frame_overlay_gallery_camera'));
assert.ok(gal.render(data,{sub:'album',galleryAlbum:'camera'},t,media).includes('Grid view'));
const photo=gal.render(data,{sub:'photo',galleryAlbum:'camera',selectedPhoto:102,galleryFromCamera:true},t,media);
assert.ok(photo.includes('data-jbgal-edit')&&photo.includes('data-jbgal-open="photo-menu"')&&!photo.includes('jbgal-camera-card'),'camera card only before the first picture');
assert.ok(gal.render(data,{sub:'photo',galleryAlbum:'camera',selectedPhoto:101,galleryFromCamera:true},t,media).includes('jbgal-camera-card'));
const menu=gal.render(data,{sub:'photo',galleryAlbum:'camera',selectedPhoto:101,galleryPopup:'photo-menu'},t,media);
for(const label of ['Delete','Slideshow','Edit','Rotate left','Rotate right','Crop','Set picture as','Details'])assert.ok(menu.includes(`>${label}<`),label);
const editor=gal.render(data,{sub:'edit',galleryEdit:{...gal.editState(data.photos[0]),panel:'fx'}},t,media);
assert.equal((editor.match(/data-jbgal-look=/g)||[]).length,10);assert.ok(editor.includes('data-jbgal-panel="color"')&&editor.includes('data-jbgal-save'));
// media.js: looks, borders, mirror and vignette are part of the picture itself.
const svg=decodeURIComponent(media.image({look:'bw_contrast',border:'film',mirror:true,adjust:{vignette:.6,contrast:1.2}}));
assert.ok(svg.includes('feColorMatrix type="saturate" values="0"')&&svg.includes('slope="1.2"')&&svg.includes('url(#vig)')&&svg.includes('fill="#111"')&&svg.includes('scale(-1 1)'));
assert.ok(!decodeURIComponent(media.image({})).includes('<filter'),'no filter without edits');
console.log('JB gallery checks passed: clusters, slot and film geometry, back stack, markup, editor and picture filters.');
// KitKat's GalleryGoogle adds Print to menu/photo.xml; Lollipop has no Gallery: lp-gallery.js only groups the pictures
// for Photos and no Gallery2 stylesheet or view code reaches it.
{
  const kk=fs.readFileSync('versions/4.4.4/kk-gallery.js','utf8');assert.match(kk,/"hu":"Nyomtatás"|"hu": "Nyomtatás"/);assert.match(kk,/GalleryGoogle 1\.1\.40304/);
  const c={window:{}};vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-gallery.js','utf8'),c);
  assert.deepEqual(Object.keys(c.window.LPGallery),['groups','items']);
  assert.ok(!fs.existsSync('versions/5.1.1/lp-gallery.css'));assert.doesNotMatch(engineSource('5.1.1'),/JBGallery|data-jbgal/);
  console.log('Gallery per image checks passed.');
}
