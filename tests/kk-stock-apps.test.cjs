require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Stock Nexus 5: the other Google apps in the drawer with simple 2013 screens, and GSMArena's Google folder.
const w={window:{}};w.window.GELNow={render:()=>'<div class="gnow-page">now</div>'};vm.runInNewContext(fs.readFileSync('earth-app.js','utf8'),w);vm.runInNewContext(fs.readFileSync('plus-post.js','utf8'),w);for(const f of ['news-prefs.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.4.4/'+f,'utf8'),w);
const A=w.window.StockApps,t=k=>k,ctx=(ui={},data={})=>({ui,data,t,locale:'en',now:new Date(2014,5,20)});
for(const app of A.APPS)assert.ok(A.render(app,ctx({},{keepNotes:A.DEFAULT_NOTES})).includes('app-view sa-app'),app);
assert.ok(A.render('google-search',ctx()).includes('gnow-page')&&A.render('google-search',ctx({sub:'settings'})).includes('SEARCH &amp; NOW CARDS'));
assert.ok(A.render('maps',ctx({mapsQuery:'Coffee'})).includes('sa-maps-card')&&A.render('maps',ctx()).includes('data-form="maps-search"'));
assert.ok(A.render('keep',ctx({},{keepNotes:A.DEFAULT_NOTES})).includes('Buy concert tickets')&&A.render('keep',ctx({sub:'note',keepNote:'k1'},{keepNotes:A.DEFAULT_NOTES})).includes('keep-text'));
assert.ok(A.render('drive',ctx({sub:'file',driveFile:'f1'})).includes('Lisbon'));
assert.ok(A.render('youtube',ctx({sub:'video',ytVideo:'v2'})).includes('sa-yt-player'));
assert.ok(A.render('news-weather',ctx({newsTab:'Weather'})).includes('nw-forecast'));
assert.ok(A.render('voice-search',ctx({voiceState:'retry'})).includes('vn3-vs_micbtn_on.png'));
for(const f of ['google-plus','maps','earth','google-search','keep','drive','youtube','news-weather','voice-search'])assert.ok(fs.existsSync(`versions/4.4.4/assets/${f}.png`),f);
const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');
assert.ok(sim.includes("items: ['gmail', 'google-plus', 'photos', 'maps', 'people', 'calendar', 'keep', 'drive', 'youtube', 'play-music', 'play-games']"));
assert.ok(sim.includes("const GEL_UNSIMULATED = [];")&&sim.includes("case 'gel-overview-settings': openApp('google-search');"));
console.log('kk-stock-apps ok');
