require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 5.1.1 stock Google apps checked against the LMY48Y APKs and their odex code (audit step 4).
const w={window:{GELNow:{render:()=>'<div class="gnow-page"></div>'}}};vm.runInNewContext(fs.readFileSync('earth-app.js','utf8'),w);for(const f of ['stock-strings.js','lp-drive.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/5.1.1/'+f,'utf8'),w);
const A=w.window.StockApps,css=fs.readFileSync('versions/5.1.1/stock-apps.css','utf8'),ctx=(ui={},locale='en')=>({ui,data:{},t:k=>k,locale,now:new Date(2015,7,20,10)});
// Google Settings 6.7: GoogleSettingsActivity's categories and rows in the dex's order.
const gs=A.render('google-settings',ctx({},'hu'));
assert.equal([...gs.matchAll(/<(?:h4 class="gs6-cat"|button class="gs6-row"[^>]*)>([^<]+)</g)].map(m=>m[1]).join('|'),'Fiók|Google+|Fiókelőzmények|Szolgáltatások|Hirdetések|Társított alkalmazások|Google Fitnesz|Play Játékok|Adatkezelés|Keresés és Asszisztens|Biztonság|Hely');
assert.ok(css.includes('.gs6-bar{')&&css.includes('#263238')&&css.includes('#009688'));
// Earth 8: the gradient Toolbar with Search, My location and Share (no overflow until a search adds Clear map).
const ea=A.render('earth',ctx());assert.ok(ea.includes('ea8-bar')&&ea.includes('ea8-ic_menu_mylocation.png')&&ea.includes('ea8-ic_share_alt_white_24dp.png')&&!ea.includes('data-action="sa-menu"'));
const ea2=A.render('earth',ctx({earthQuery:'Pizza'}));assert.ok(ea2.includes('earth-clear')&&ea2.includes('data-action="sa-menu"'));
// News & Weather 2.2: the light Toolbar with Search and Add section, Headlines' weather card and section card, the drawer.
const nw=A.render('news-weather',ctx({newsDrawer:true},'hu'));assert.ok(nw.includes('nw2-bar')&&nw.includes('Címsorok')&&nw.includes('nw2-ic_add_white_24dp.png')&&nw.includes('nw2-weather')&&nw.includes('Súgó és visszajelzés'));
assert.ok(fs.readFileSync('versions/5.1.1/simulator.js','utf8').includes("'news-weather': '#9e9e9e'"));
// Keep 3.0: the yellow Toolbar with Search, the floating quick-edit bar, DrawerFragment's items in the dex's order.
const kp=A.render('keep',{...ctx({keepDrawer:true}),data:{keepNotes:[{id:'k1',text:'Milk'}]}});assert.ok(kp.includes('kp3-bar')&&kp.includes('kp3-ic_material_search_light.png')&&kp.includes('kp3-quick'));
assert.equal([...kp.matchAll(/data-action="keep-landing" data-id="(\w+)"/g)].map(m=>m[1]).join(),'notes,reminders,archive,trash');
assert.ok(css.includes('.kp3-bar{')&&css.includes('#ffcc3f'));
// Maps 9.3: the search box with the grabber and mic, the FAB and my-location button, layers_menu_internal's side menu.
const mp=A.render('maps',ctx({mapsPanel:true}));assert.ok(mp.includes('mp9-ic_qu_menu_grabber.png')&&mp.includes('mp9-ic_qu_directions.png')&&mp.includes('mp9-ic_qu_direction_mylocation.png'));
assert.ok(/Your places.*Traffic.*Public transit.*Bicycling.*Satellite.*Terrain.*Google Earth.*Settings.*Help.*Send feedback/s.test(mp));
// Drive 2.1: the grey bar with Search and the grid toggle, rows under Drive's time ranges, the jx navigation entries.
const dr=A.render('drive',ctx({driveNav:true}));assert.ok(dr.includes('dr2-bar')&&dr.includes('dr2-ic_grid_toggle.png')&&dr.includes('dr2-ic_type_doc.png')&&dr.includes('Today'));
assert.ok(/My Drive.*Shared with me.*Starred.*Recent.*On device.*Uploads/s.test(dr.slice(dr.indexOf('dr2-nav'))));
assert.equal(JSON.stringify(A.menu('drive',ctx()).map(i=>i.title)),JSON.stringify(['Create','Refresh','Filter by','Sort by']));
// YouTube 10.03: the red Toolbar with Search, q_video_feed_entry rows, the guide's local entries in the bhx order.
const yt=A.render('youtube',ctx({ytGuide:true}));assert.ok(yt.includes('yt10-bar')&&yt.includes('yt10-item')&&yt.includes('yt10-ic_drawer_what_to_watch.png'));
assert.ok(/Watch later.*Favorites.*Uploads.*History.*Offline/s.test(yt.slice(yt.indexOf('yt10-guide'))));
assert.ok(fs.readFileSync('versions/5.1.1/simulator.js','utf8').includes("youtube: '#c31c13'"));
// Google+ 4.9: the red Toolbar with "Home" and the notifications button, the compose FAB, the host menu.
const gp=A.render('google-plus',ctx());assert.ok(gp.includes('gp49-bar')&&gp.includes('gp49-quantum_ic_notifications_none_white_24.png')&&gp.includes('gp49-fab'));
assert.equal(JSON.stringify(A.menu('google-plus',ctx()).map(i=>i.title)),JSON.stringify(['Refresh','Feedback','Settings','Help','Sign out']));
// Google Now (Velvet 4.1.29): no in_app_footer; navigation_menu.xml's drawer behind ic_hamburger in the search plate.
const g={window:{}};for(const f of ['stock-strings.js','gel-now.js'])vm.runInNewContext(fs.readFileSync('versions/5.1.1/'+f,'utf8'),g);
const now=g.window.GELNow.render({data:{events:[]},t:k=>k,locale:'en',now:new Date(2015,7,20,10)});
assert.ok(now.includes('vn4-ic_hamburger.png')&&now.includes('vn4-context_header_bg_daylight.jpg')&&!now.includes('gnow-bar')&&!now.includes('ic_endoflist'));
assert.ok(/Reminders.*Customize.*<hr>.*Settings.*Help &amp; feedback/s.test(now.slice(now.indexOf('gnow-drawer'))));
// Voice Search: the 4.1 search plate's voice mode with the listening orb, then ic_mic_idle and no_match.
assert.ok(A.render('voice-search',ctx()).includes('vn4-ic_mic_listening_shadow.png')&&A.render('voice-search',ctx({voiceState:'retry'})).includes('vn4-ic_mic_idle.png'));
console.log('lp stock google ok');
