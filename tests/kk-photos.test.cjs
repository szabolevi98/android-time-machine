require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// Stock Nexus 5: Google+ 4.2.3 Photos: the host bar with the photo_spinner views, CAMERA / HIGHLIGHTS tabs, the Folders
// tile and view, search, and the one-up viewer with photo_action_bar.xml.
const context={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.4.4/photos-video.js','utf8'),context);vm.runInNewContext(fs.readFileSync('versions/4.4.4/photos.js','utf8'),context);
const P=context.window.PhotosApp,t=k=>k,media={image:p=>`img-${p.id}`};
const data={photos:[{id:1,name:'A'},{id:2,name:'B',created:Date.UTC(2014,5,20)},{id:5,name:'C',created:Date.UTC(2014,5,21),album:'camera'}]};
const groups=[{key:'camera',name:'Camera',translate:true,items:[data.photos[2]]},{key:'pictures',name:'Pictures',translate:true,items:data.photos.slice(0,2)}];
const ctx=ui=>({data,ui,t,locale:'en',media,groups});
const cam=P.render(ctx({}));
assert.ok(cam.includes('ph-tabs')&&cam.includes('data-action="photos-folders"')&&(cam.match(/data-action="photos-open"/g)||[]).length===3);
assert.ok(cam.indexOf('data-id="5"')<cam.indexOf('data-id="2"'),'newest first');
const hl=P.render(ctx({photosTab:'highlights'}));
assert.ok((hl.match(/class="ph-day"/g)||[]).length===3&&hl.includes('photos-share-day'));
assert.ok(P.render(ctx({sub:'folders'})).includes('data-action="photos-folder" data-id="pictures"'));
assert.ok((P.render(ctx({sub:'folder',photosFolder:'pictures'})).match(/data-list="folder"/g)||[]).length===2);
const viewer=P.render(ctx({sub:'photo',photosList:'folder',photosFolder:'pictures',photosIndex:1}));
assert.ok(viewer.includes('ph-viewer')&&viewer.includes('img-2')&&viewer.includes('gallery-share-message'));
assert.ok(P.menu({t,ui:{sub:'photo'}}).includes('Set as')&&P.menu({t,ui:{}}).includes('Select photos'));
assert.ok(viewer.includes('ph-actionbar')&&viewer.includes('data-action="photos-edit"')&&viewer.includes('gp-ic_trash_white_20'));
assert.ok(cam.includes('data-action="photos-spinner"')&&cam.includes('gp-ic_create_movie_20')&&cam.includes('data-action="photos-search"'));
assert.equal((P.render(ctx({photosSpinner:true})).match(/data-action="photos-view"/g)||[]).length,6);
assert.ok(P.render(ctx({sub:'search'})).includes('gp-ic_sunglasses_24'));assert.equal((P.render(ctx({sub:'search',photosQuery:'B'})).match(/data-list="search"/g)||[]).length,1);
assert.ok(P.render(ctx({sub:'search',photosQuery:'zzz'})).includes('zzz')&&!P.render(ctx({sub:'search',photosQuery:'<i>'})).includes('<i>'));
const sim=engineSource('4.4.4');
assert.ok(sim.includes("return PhotosApp.render(photosContext());")&&sim.includes("for (const id of ['photos']) KK.register(id, spec);")&&!/GEL_ALIASES = {[^}]*photos/.test(sim));
console.log('kk-photos ok');
