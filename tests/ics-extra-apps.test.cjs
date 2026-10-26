require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Galaxy Nexus (IMM76I) extra launcher apps from their APKs (audit step 4).
const w={window:{AndroidI18n:{language:'en'}}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/stock-strings.js','utf8')+fs.readFileSync('versions/4.0.4/ics-extra-apps.js','utf8')+fs.readFileSync('plus-messenger.js','utf8'),w);
const X=w.window.JBExtraApps,t=k=>k,contacts=[{name:'Alex Morgan'},{name:'Sam Rivera'},{name:'Taylor Lee'}];
const r=(app,ui={})=>X.render(app,{ui,t,contacts});
const nav=r('navigation');
assert.ok(nav.includes('nav-ic_feature_navigation.png')&&nav.includes('>Map<')&&(nav.match(/class="nav-tile"/g)||[]).length===4);
assert.ok(r('local').includes('>Places<')&&(r('local').match(/loc-places_cat_icon_/g)||[]).length===7);
assert.ok(r('movie-studio').includes('Create New Project'));
// Messenger's list comes from plus-messenger.js (data.plusChats, seeded with the three conversations).
const mctx={ui:{},data:{},t,S:k=>k,contacts:contacts.map((c,i)=>({...c,id:String(i+1)})),now:new Date(2013,6,1,12),locale:'en-US',avatar:'',photoIcon:'',sendIcon:'',version:'2.4',listMenu:['Settings','Send feedback','Help']};
const msg=X.render('messenger',{ui:{},t,contacts,messenger:mctx});
assert.ok(msg.includes('msg-ic_menu_start_new_huddle_action_bar.png')&&msg.includes('data-action="jbx-menu"')&&(msg.match(/class="msg24-row"/g)||[]).length===3);
assert.equal(w.window.PlusMessenger.menu(mctx).map(i=>i.action+':'+i.title).join(),'gpm-settings:Settings,kkx-unavailable:Send feedback,kkx-unavailable:Help');
console.log('ics-extra-apps ok');
