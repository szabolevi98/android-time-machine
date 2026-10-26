require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 4 (JWR66Y) extra launcher apps, each from its APK (audit step 4).
const w={window:{AndroidI18n:{language:'en'}}};vm.runInNewContext(fs.readFileSync('versions/4.3/stock-strings.js','utf8')+fs.readFileSync('versions/4.3/jb-extra-apps.js','utf8')+fs.readFileSync('plus-messenger.js','utf8'),w);
const X=w.window.JBExtraApps,t=k=>k,contacts=[{name:'Alex Morgan'},{name:'Sam Rivera'},{name:'Taylor Lee'}];
const r=(app,ui={})=>X.render(app,{ui,t,contacts});
const nav=r('navigation');
assert.ok(nav.includes('SHORTCUTS')&&nav.includes('STARRED')&&(nav.match(/class="nav-tile"/g)||[]).length===4&&nav.includes('nav-da_picker_speak_destination.png'));
const local=r('local');
assert.ok(local.includes('loc-ic_feature_local.png')&&(local.match(/loc-places_cat_icon_/g)||[]).length===7);
// Messenger's list comes from plus-messenger.js (data.plusChats, seeded with the three conversations).
const mctx={ui:{},data:{},t,S:k=>k,contacts:contacts.map((c,i)=>({...c,id:String(i+1)})),now:new Date(2013,6,1,12),locale:'en-US',avatar:'',photoIcon:'',sendIcon:'',version:'4.0',listMenu:['Send feedback','Settings','Help','Sign out']};
const msg=X.render('messenger',{ui:{},t,contacts,messenger:mctx});
assert.ok(msg.includes('msg-ic_menu_start_new_huddle.png')&&msg.includes('data-action="sa-menu"')&&(msg.match(/class="msg-row"/g)||[]).length===3);
const cur=r('currents'),curOpen=r('currents',{currentsMenu:true});
assert.ok(cur.includes('Breaking stories')&&cur.includes('Customize')&&curOpen.includes('menu-open'));
const mag=r('play-magazines',{magDrawer:true});
assert.ok(mag.includes('mag-ic_corpora_tile_magazines.png')&&mag.includes('>Read Now<')&&mag.includes('>Shop<')&&mag.includes('class="mag-card"'));
const wal=r('wallet');
assert.deepEqual([...wal.matchAll(/<span>([^<]*)<\/span>/g)].map(m=>m[1]),['Payment cards','Rewards cards','Offers','Transactions']);
assert.ok(r('movie-studio').includes('ms-add_video_project_big.png')&&r('movie-studio').includes('Create new project'));
for(const app of ['navigation','local','currents','play-magazines','wallet','movie-studio'])assert.ok(!r(app).includes('kkx-file'),app);assert.ok(!msg.includes('kkx-file'));
console.log('jb-extra-apps ok');
