require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 4.4.4 stock Google apps checked against the KTU84P APKs (audit step 4).
const w={window:{GELNow:{render:()=>'<div class="gnow-page"></div>'}}};for(const f of ['stock-strings.js','news-prefs.js','kk-drive.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.4.4/'+f,'utf8'),w);
const A=w.window.StockApps,css=fs.readFileSync('versions/4.4.4/stock-apps.css','utf8'),ctx=(ui={},locale='en')=>({ui,data:{},t:k=>k,locale,now:new Date(2014,5,20,10)});
// Google Settings: GoogleSettingsActivity's rows in GMS 4.3.23's order, no section headers.
const gs=A.render('google-settings',ctx({},'de'));assert.ok(!gs.includes('<h4>'));
assert.deepEqual([...gs.matchAll(/<button data-action="[^"]+" data-id="[^"]*">([^<]+)<\/button>/g)].map(m=>m[1]),['Verbundene Apps','Google+','Play Games','Standort','Suche &amp; Google Now','Anzeigen','Apps bestätigen','Android Geräte-Manager','Drive apps']);
// Earth 7.1.3: Search and Reset to north in the bar, the rest in the overflow; Clear map only after a search.
const earth=A.render('earth',ctx());assert.ok(earth.includes('ea7-ic_menu_northup.png')&&!earth.includes('sensors')&&!earth.includes('sa-earth-home'));
assert.equal(JSON.stringify(A.menu('earth',ctx()).map(i=>i.title)),JSON.stringify(['My location','Share','Settings','Feedback','Help','Tutorial']));
assert.equal(A.menu('earth',ctx({earthQuery:'Pizza'}))[0].action,'earth-clear');
// News & Weather 1.3.11: GenieWidget's tabs, rows and weather panel with its own strings.
assert.ok(A.render('news-weather',ctx()).includes('nw-item')&&css.includes('.nw-tabs'));
const wx=A.render('news-weather',ctx({newsTab:'Weather'},'hu'));assert.ok(wx.includes('Páratartalom: 60%')&&wx.includes('nw-ic_weather_partly_cloudy_xl.png'));
// Google Now (Velvet 3.3.11): the header picture, search_bg plate, card_background cards, load_more_card and in_app_footer.
const g={window:{}};for(const f of ['stock-strings.js','gel-now.js'])vm.runInNewContext(fs.readFileSync('versions/4.4.4/'+f,'utf8'),g);
const gel=fs.readFileSync('versions/4.4.4/kk-gel.css','utf8'),now=g.window.GELNow.render({data:{events:[{id:1,date:'2014-06-20',title:'Coffee',time:'11:00'}]},t:k=>k,locale:'hu',now:new Date(2014,5,20,10)});
for(const part of ['vn3-context_header_bg_daylight.jpg','vn3-ic_google_small_dark.png','vn3-ic_training_dots_normal.png','Megtekintés a Naptárban','Továbbiak','vn3-ic_endoflist_reminders_normal.png','vn3-ic_magic_wand_normal.png'])assert.ok(now.includes(part),part);
assert.ok(!now.includes('gnow-tip')&&gel.includes("vn3-search_bg.png")&&gel.includes("vn3-card_background.png")&&gel.includes('.gnow-page{--gn-top:var(--sb)'));
// Voice Search: the search plate's voice mode with Velvet 3.3's recognizer and texts.
assert.ok(A.render('voice-search',ctx()).includes('vn3-vs_micbtn_rec.png')&&A.render('voice-search',ctx({voiceState:'retry'},'hu')).includes('Nem sikerült értelmezni. Mondja ki újra.'));
// Maps 7.5: the omnibox, the side tab and the layers menu from the right with the APK's toggles and buttons.
const mp=A.render('maps',ctx({mapsPanel:true},'de'),);assert.ok(mp.includes('mp7-omnibox')&&mp.includes('mp7-views_entry_point_flipped.png')&&mp.includes('mp7-ic_location.png')&&mp.includes('Google Earth'));
assert.ok(!A.render('maps',ctx()).includes('mp7-panel')&&A.render('maps',{...ctx({mapsPanel:true}),data:{mapsLayer:'traffic'}}).includes('mp7-ic_layers_traffic_selected.png'));
// Keep 2.0: the drawer toggle and DrawerFragment's items in the dex's order; Archived notes left the overflow.
const kp=A.render('keep',{...ctx({keepDrawer:true},'hu'),data:{keepNotes:[{id:'k1',text:'Tej'}]}});assert.ok(kp.includes('kp2-ic_drawer.png')&&kp.includes('kitkat.demo@gmail.com'));
assert.deepEqual([...kp.matchAll(/data-action="keep-landing" data-id="(\w+)"/g)].map(m=>m[1]).join(),'notes,archive,reminders');
assert.ok(!JSON.stringify(A.menu('keep',ctx())).includes('keep-archived')&&A.render('keep',ctx({keepView:'reminders'})).includes('Create a reminder'));
// YouTube 5.2: the logo bar with the guide toggle, GuideFragment's entries in the dex's order, feed cards, watch cards.
const yt=A.render('youtube',ctx({ytGuide:true}));assert.ok(yt.includes('yt5-action_bar_logo.png')&&yt.includes('yt5-card'));
assert.deepEqual([...yt.matchAll(/class="yt5-entry[^"]*" data-action="[^"]+">(?:<img[^>]*>|<i><\/i>)<span>([^<]+)/g)].map(m=>m[1]).join('|'),'Uploads|History|Favorites|Playlists|Watch later|What to watch|My subscriptions|Browse channels|Recommended|Trending');
const watch=A.render('youtube',ctx({sub:'video',ytVideo:'v2'}));assert.ok(watch.includes('yt5-info')&&watch.includes('yt5-ic_like.png')&&watch.includes('yt5-suggested'));
// Drive 1.2: the toggle bar with Search and the grid toggle, iM's navigation entries, doc rows under time ranges.
const dr=A.render('drive',ctx({driveNav:true}));assert.ok(dr.includes('dr-ic_drawer.png')&&dr.includes('dr-ic_grid_toggle.png')&&dr.includes('Today')&&dr.includes('Modified: '));
assert.ok(/My Drive.*Shared with me.*Starred.*Recent.*Offline.*Uploads/s.test(dr.slice(dr.indexOf('dr-nav'))));
assert.equal(JSON.stringify(A.menu('drive',ctx()).map(i=>i.title)),JSON.stringify(['Add new','Refresh','Filter by','Sort by','Settings','Product Tour']));
// Google+ 4.2: the bell button, the visible compose buttons and the menu items the dex enables for the stream.
const gp=A.render('google-plus',ctx());assert.ok(gp.includes('gp42-ic_notifications_20.png')&&gp.includes('Location')&&!gp.includes('Mood')&&!gp.includes('Check in'));
assert.equal(JSON.stringify(A.menu('google-plus',ctx()).map(i=>i.title)),JSON.stringify(['Refresh','Send feedback','Settings','Help','Sign out']));
console.log('kk stock google ok');
