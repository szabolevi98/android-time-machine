require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date,encodeURIComponent};
for(const f of ['media.js','gb-strings-gallery.js','gb-gallery.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBGallery;
const data={photos:[1,2,3,4,5,6].map(id=>({id,name:'P'+id,colors:['#123456','#abcdef','#654321'],album:id>4?'camera':undefined}))};
const ctx=(o={})=>({lang:'en',locale:'en-US',now:new Date(2026,9,2),data,sub:'',album:'pictures',photo:data.photos[1],selecting:false,selected:[],popup:'',caption:false,zoom:false,slideshow:false,hudHidden:false,stackMode:false,width:276,height:438,timebar:41.4,...o});
// Albums: one stack per bucket with up to four layers, the count label, the source icon, the path bar and btn_camera.
let html=G.render(ctx());
assert.equal((html.match(/class="gbg-stack/g)||[]).length,2);assert.match(html,/Camera \(2\)/);assert.match(html,/Pictures \(4\)/);
assert.equal((html.match(/gbg-layer/g)||[]).length,6);assert.match(html,/icon_camera_small/);assert.match(html,/icon_folder_small/);
assert.match(html,/gbg-crumb last"><img src="assets\/gb-g3-icon_home_small.png" alt=""><span>Gallery</);assert.match(html,/gbg-camera" data-action="gallery-camera"/);
// The first column is centred: left = (276 - 82.8) / 2.
assert.match(html,/left:96\.60px/);
// Album grid: four rows column by column, the time bar and the mode switch; stack mode clusters the album.
html=G.render(ctx({sub:'album'}));
assert.equal((html.match(/class="gbg-cell/g)||[]).length,4);assert.match(html,/gbg-timebar/);assert.match(html,/Oct 2026/);assert.match(html,/gbg-mode"/);
assert.match(html,/data-action="gbg-home"[^>]*><img src="assets\/gb-g3-icon_home_small.png" alt=""><span>Gallery/);assert.match(html,/gbg-crumb last" data-action="gbg-up"><img src="assets\/gb-g3-icon_folder_small.png" alt=""><span>Pictures/);
assert.match(G.render(ctx({sub:'album',stackMode:true})),/gbg-mode stack"[\s\S]*|Oct 2026 \(4\)/);
// Full screen: index/count label (or the caption), Slideshow / Menu, zoom buttons.
html=G.render(ctx({sub:'photo'}));
assert.match(html,/<span>2\/4<\/span>/);assert.match(html,/>Slideshow</);assert.match(html,/data-action="gbg-select-current"/);assert.match(html,/gbg-zoom/);
assert.match(G.render(ctx({sub:'photo',caption:true})),/<span>P2<\/span>/);
// Selection mode: top and bottom MenuBars, checks, popups.
html=G.render(ctx({sub:'album',selecting:true,selected:['2']}));
assert.match(html,/Select All/);assert.match(html,/1 item selected/);assert.match(html,/Deselect All/);assert.match(html,/>Share</);assert.match(html,/grid_check_on/);assert.doesNotMatch(html,/gbg-path/);
assert.match(G.render(ctx({selecting:true,selected:['camera','pictures']})),/2 albums selected/);
assert.match(G.render(ctx({sub:'album',selecting:true,selected:['2'],popup:'delete'})),/Confirm Delete/);
html=G.render(ctx({sub:'photo',selecting:true,selected:['2'],popup:'more'}));
for(const t of ['Details','Rotate Left','Rotate Right','Set as wallpaper','Crop'])assert.match(html,new RegExp(t));
// HudLayer.buildMoreOptions: Show on map only for an item with a location (a picture taken with Store location).
assert.doesNotMatch(html,/Show on map/);
data.photos[2].location={fx:.5,fy:.52};
assert.match(G.render(ctx({sub:'photo',selecting:true,selected:['3'],popup:'more'})),/data-action="gbg-show-map"[^>]*><img src="assets\/gb-g3-ic_menu_mapmode.png" alt=""><span>Show on map/);
delete data.photos[2].location;
assert.doesNotMatch(G.render(ctx({selecting:true,selected:['camera'],popup:'more'})),/Rotate Left/);
// Details dialog and translations.
assert.match(G.details(ctx()).message,/Title: P2\nType: image\/jpeg\nAlbum: Pictures/);
assert.equal(G.text('hu','slideshow'),'Diavetítés');
console.log('gb-gallery ok');
