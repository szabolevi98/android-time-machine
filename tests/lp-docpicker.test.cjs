require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-downloads.js','utf8'),context);
vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-docpicker.js','utf8'),context);
const P=context.window.LPDocPicker,now=Date.UTC(2026,9,24,12);
const photos=[{id:1,name:'Mountain afternoon'},{id:2,name:'City lights'},{id:7,name:'IMG_20261020_101010',album:'camera',created:now-4*864e5},{id:8,name:'VID_20261022_090000',album:'camera',created:now-2*864e5,video:true,duration:4000}];
const tracks=[{title:'Blue Horizon',artist:'The Demo Tapes',album:'First Light',duration:213},{title:'Night Drive',artist:'The Demo Tapes',album:'After Hours',duration:246}];
const album=p=>p.album||(p.id<=4?'pictures':'camera');
const ctx=(data,ui)=>({data,ui,t:k=>k,locale:'en',image:p=>`photo-${p.id}.png`,album,tracks,now,free:'9.93 GB'});
const items=html=>[...html.matchAll(/class="ldu-title">([^<]*)/g)].map(m=>m[1]);
const plain=x=>JSON.parse(JSON.stringify(x));
const menu=html=>[...html.matchAll(/role="menuitem"[^>]*>(?:<i[^>]*><\/i>)?([^<]+)/g)].map(m=>m[1]);

// Attach file (any type), first time: Recent with the last 45 days' photos and videos as a list, and the roots drawer
// open under "Open from" (Recent, Images, Videos, Audio, Downloads; Internal storage only when shown).
let data={photos},ui={};
P.start(data,ui,'gmail','*/*',ctx(data,ui));
let html=P.render(ctx(data,ui));
assert.equal(ui.docs.drawer,true);
assert.match(html,/ldu-ic_hamburger\.png[^]*<h2>Recent<\/h2>/);
assert.doesNotMatch(html,/data-id="sort"|ldu-ic_menu_search/);
assert.deepEqual(items(html),['VID_20261022_090000.mp4','IMG_20261020_101010.jpg']);
assert.match(html,/class="ldu-list"/);
assert.deepEqual([...html.matchAll(/data-action="ldp-root" data-id="(\w+)"/g)].map(m=>m[1]),['recent','images','videos','audio','downloads']);
assert.match(html,/<h2>Open from<\/h2>[^]*ldp-root on" data-action="ldp-root" data-id="recent"/);
// Images: buckets as grid folders with their newest picture; a bucket lists its pictures; Back climbs, then cancels.
P.act('ldp-root','images',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.equal(ui.docs.drawer,false);
assert.deepEqual(items(html),['Camera','Pictures']);
assert.match(html,/class="ldu-grid"><button class="ldu-cell ldp-doc" data-action="ldp-open" data-id="images\/camera"><img class="ldp-thumb" src="photo-7\.png"/);
P.act('ldp-open','images/pictures',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.match(html,/class="ldp-crumb" data-action="ldp-menu" data-id="crumbs"><span>Pictures<\/span>/);
assert.deepEqual(menu(P.menu('crumbs',ctx(data,ui))),['Images','Pictures']);
assert.deepEqual(menu(P.menu('sort',ctx(data,ui))),['By name','By date modified','By size']);
assert.deepEqual(menu(P.menu('overflow',ctx(data,ui))),['List view','Show internal storage','Show file size']);
assert.equal(P.back(ctx(data,ui)),'render');
assert.deepEqual(plain(ui.docs.stack),['images']);
// Audio: artists, albums (ic_doc_album), then the songs by title; picking one returns its name, type and size and
// remembers the stack for Gmail.
P.act('ldp-root','audio',ctx(data,ui));
assert.deepEqual(items(P.render(ctx(data,ui))),['The Demo Tapes']);
P.act('ldp-open','audio/The Demo Tapes',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.deepEqual(items(html),['After Hours','First Light']);
assert.match(html,/ldu-ic_doc_album\.png/);
P.act('ldp-open','audio/The Demo Tapes/First Light',ctx(data,ui));
let result=P.act('ldp-open','track:0',ctx(data,ui));
assert.deepEqual(JSON.parse(JSON.stringify(result.pick)),{id:'track:0',name:'Blue Horizon',mime:'audio/mpeg',size:213*16000,time:0});
assert.deepEqual(plain(data.docsUi.last.gmail),['audio','audio/The Demo Tapes','audio/The Demo Tapes/First Light']);
// The next Attach file restores that stack without the drawer; a picture picked carries the photo.
ui={};P.start(data,ui,'gmail','*/*',ctx(data,ui));
assert.equal(ui.docs.drawer,false);
assert.deepEqual(items(P.render(ctx(data,ui))),['Blue Horizon']);
P.act('ldp-root','recent',ctx(data,ui));
result=P.act('ldp-open','photo:7',ctx(data,ui));
assert.equal(result.pick.name,'IMG_20261020_101010.jpg');
assert.equal(result.pick.mime,'image/jpeg');
assert.equal(result.pick.photo.id,7);
// Show file size and Show internal storage (LocalPreferences): the sizes appear; Internal storage joins the roots with
// its free space, holds the standard folders and can be searched.
P.act('ldp-pref','size',ctx(data,ui));P.act('ldp-pref','advanced',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.match(html,/<span>\d+\.\d\d MB<\/span>/);
P.act('ldp-root','sdcard',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.match(html,/data-id="sdcard"><i[^>]*ldu-ic_root_sdcard[^]*<b>Internal storage<\/b><small>%1\$s free<\/small>|<h2>Internal storage<\/h2>/);
assert.deepEqual(items(html),['Alarms','Android','DCIM','Download','Movies','Music','Notifications','Pictures','Podcasts','Ringtones']);
assert.match(html,/data-action="ldp-search"/);
P.act('ldp-search','',ctx(data,ui));P.search('drive',ctx(data,ui));
assert.deepEqual(items(P.render(ctx(data,ui))),['Night Drive.mp3']);
assert.equal(P.back(ctx(data,ui)),'render');
assert.equal(P.back(ctx(data,ui)),'cancel');
// Pick image (image/*): no Videos or Audio root, Recent in grid mode, and other types listed but disabled.
data={photos};ui={};
P.start(data,ui,'wallpaper','image/*',ctx(data,ui));
assert.equal(ui.docs.drawer,false);
P.act('ldp-drawer','',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.deepEqual([...html.matchAll(/data-action="ldp-root" data-id="(\w+)"/g)].map(m=>m[1]),['recent','images','downloads']);
assert.deepEqual(items(html),['IMG_20261020_101010.jpg']);
assert.match(html,/class="ldu-grid"/);
data.downloads=[{name:'notes.pdf',size:2048,time:now}];
P.act('ldp-root','downloads',ctx(data,ui));
html=P.render(ctx(data,ui));
assert.match(html,/class="ldu-item ldp-doc off" disabled>/);
assert.deepEqual(plain(P.act("ldp-open","dl:0",ctx(data,ui))),{});
// An empty Recent opens the drawer by itself, as DirectoryFragment does for a stack nobody touched.
data={photos:[{id:1,name:'A'}]};ui={};
P.start(data,ui,'keep','image/*',ctx(data,ui));
assert.equal(ui.docs.drawer,true);
assert.match(P.render(ctx(data,ui)),/ldu-empty">No items/);
assert.equal(P.size(1536000),'1.46 MB');
for(const f of ['ldu-ic_root_recent','ldu-ic_root_sdcard','ldu-ic_doc_folder','ldu-ic_doc_album','ldu-ic_grid_folder','ldu-ic_breadcrumb_arrow','ldu-spinner_mtrl_am'])assert.ok(fs.existsSync(`versions/5.1.1/assets/${f}.png`),f);
console.log('lp-docpicker ok');
