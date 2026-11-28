require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6: Google+ 4.9.0 Photos: the white Material bar with the drawer (PhotosHomeActivity's views), CAMERA /
// HIGHLIGHTS, search and the one-up view with photo_action_bar.xml.
const context={window:{}};context.window.window=context.window;
vm.runInNewContext(fs.readFileSync('versions/5.1.1/stock-strings.js','utf8'),context);vm.runInNewContext(fs.readFileSync('versions/5.1.1/photos-video.js','utf8'),context);vm.runInNewContext(fs.readFileSync('versions/5.1.1/photos.js','utf8'),context);
const P=context.window.PhotosApp,t=k=>k,media={image:p=>`img-${p.id}`};
const data={photos:[{id:1,name:'A'},{id:2,name:'B',created:Date.UTC(2015,5,20)},{id:5,name:'IMG_5',created:Date.UTC(2015,5,21)}]};
const groups=[{key:'camera',name:'Camera',translate:true,items:[data.photos[2]]}];
const ctx=ui=>({data,ui,t,locale:'en',media,groups});
const home=P.render(ctx({}));
assert.match(home,/data-action="photos-drawer"[\s\S]*<h2>Photos<\/h2>[\s\S]*quantum_ic_search_grey600_24/);assert.match(home,/CAMERA[\s\S]*HIGHLIGHTS/);
assert.equal(Array.from(P.VIEWS,v=>v[1]).join(','),'Photos,Albums,Auto Awesome,Videos,Photos of you,On device,Trash');
assert.equal((P.render(ctx({photosSpinner:true})).match(/data-action="photos-view"/g)||[]).length,7);
assert.match(P.render(ctx({photosView:'folders'})),/data-action="photos-folder" data-id="camera"/);
assert.match(P.render(ctx({sub:'search'})),/quantum_ic_landscape_grey600_24/);assert.equal((P.render(ctx({sub:'search',photosQuery:'img'})).match(/data-list="search"/g)||[]).length,1);
const viewer=P.render(ctx({sub:'photo',photosIndex:0}));assert.match(viewer,/ph-edit[\s\S]*quantum_ic_share_white_24[\s\S]*quantum_ic_delete_white_24/);
assert.match(P.menu({t,ui:{sub:'photo'},locale:'en'}),/Set as/);
const sim=engineSource('5.1.1');assert.ok(sim.includes("case 'photos-drawer': ui.photosSpinner = !ui.photosSpinner;")&&sim.includes("photos: '#000'"));
assert.ok(!fs.existsSync('versions/5.1.1/lp-photos.css'));
console.log('lp-photos ok');
