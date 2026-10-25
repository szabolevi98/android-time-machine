require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// The Galaxy Nexus's Google apps (ics-google-apps.js): APK drawables instead of text glyphs, YouTube 3.5.5's light theme.
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/ics-google-apps.js','utf8'),ctx);
const G=ctx.window.ICSGoogleApps;
const base=(view,ui={},data={})=>({view,ui,data:{contacts:[{id:1,name:'Alex Morgan'}],photos:[],...data},lang:'en',account:'demo@example.com',t:k=>k});
const GLYPHS=/[←-⇿⌀-⏿─-➿⤀-⯿\u{1F300}-\u{1FAFF}]/u;
const screens=[
  ['youtube',{}],['youtube',{gaYtTab:'Browse'}],['youtube',{gaYtTab:'Account'}],['youtube',{gaSub:'watch',gaVideo:'v1'}],['youtube',{gaSub:'watch',gaVideo:'v1',gaYtWatchTab:'related'}],
  ['google-plus',{}],['google-plus',{gaSub:'stream'}],['talk',{}],['talk',{gaSub:'chat',gaChat:1}],['play-books',{}],['play-books',{gaSub:'read'}],
  ['play-movies',{}],['play-movies',{gaMoviesTab:'personal'}],['search',{}],['voice-dialer',{}],['voice-dialer',{gaVoice:'failed'}]
];
for(const [view,ui] of screens){
  const html=G.render(view,base(view,ui));
  // Any visible glyph left would stand in for an icon (✎ ⌕ ⇪ ☰ 🛍 ✓ ▶ ❚ 👍 💬 🎤 ‹ …).
  const text=html.replace(/<[^>]*>/g,' ').replace(/aria-label="[^"]*"/g,'');
  assert.doesNotMatch(text,GLYPHS,view+JSON.stringify(ui));assert.doesNotMatch(text,/‹/,view);
  for(const [,src] of html.matchAll(/src="assets\/([^"]+)"/g))assert.ok(fs.existsSync('versions/4.0.4/assets/'+src),src);
}
// YouTube: no title in the bar (displayOptions useLogo | showHome), Search and Record, Home / Browse / Account.
const home=G.render('youtube',base('youtube'));
assert.match(home,/ga-yt-ic_menu_search/);assert.match(home,/ga-yt-ic_menu_capture/);assert.doesNotMatch(home,/<h2>/);assert.match(home,/data-id="Account"/);
// Watch page: Add to and Share in the bar, +1 panel, Like / Dislike image buttons, statistics line.
let watch=G.render('youtube',base('youtube',{gaSub:'watch',gaVideo:'v1'}));
assert.match(watch,/ga-yt-ic_menu_add_to_playlist/);assert.match(watch,/ga-yt-ic_menu_share/);assert.match(watch,/ic_plusone_standard_off/);
assert.match(watch,/ga-yt-ic_like\.png/);assert.match(watch,/1,204,311 views \| 8,312 likes \| 214 dislikes/);
// A rating is final: both buttons disabled, the count includes it; the overflow is watch_menu.xml's Like / Dislike /
// Copy URL / Flag, then menu.xml's Settings / Feedback / Help.
watch=G.render('youtube',base('youtube',{gaSub:'watch',gaVideo:'v1'},{gaYtRatings:{v1:'like'}}));
assert.match(watch,/ic_like_disabled/);assert.match(watch,/ic_dislike_disabled/);assert.match(watch,/8,313 likes/);
assert.deepEqual([...G.menu(base('youtube',{gaSub:'watch'})).map(i=>i.title)],['Like','Dislike','Copy URL','Flag','Settings','Feedback','Help']);
assert.deepEqual([...G.menu(base('youtube')).map(i=>i.title)],['Settings','Feedback','Help']);
// Talk: Search and Add friend; in a chat Video / Voice chat, End chat in the overflow; dark action bar.
assert.match(G.render('talk',base('talk')),/ga-tk-ic_menu_add_buddy_holo_light/);
assert.deepEqual([...G.menu(base('talk',{gaSub:'chat'})).map(i=>i.title)],['End chat','Friend info','Add to chat','Clear chat history']);
// Handling: rating and clearing a chat.
const toasts=[],d={talkChats:[{contact:1,body:'hi'},{contact:2,body:'yo'}]},u={gaSub:'chat',gaChat:1,gaVideo:'v2'};
const hctx={...base('talk',u,d),ui:u,data:d,save(){},render(){},toast:t=>toasts.push(t),closeOverlay(){},renderOverlay(){}};
G.handle('ga-talk-clear','',hctx);assert.equal(d.talkChats.length,1);
G.handle('ga-yt-rate','dislike',hctx);G.handle('ga-yt-rate','like',hctx);assert.equal(d.gaYtRatings.v2,'dislike');assert.deepEqual(toasts,['You dislike this video.']);
// News & Weather: each image's menu XML (no crosshair for Refresh); on 5.1.1 the items NewsActivity.onPrepareOptionsMenu
// leaves visible on Headlines (dex of the odex).
for(const [v,bar,menu] of [['4.0.4',[],['Refresh','Settings']],['4.3',['nw-navigation_refresh'],['Settings']],['4.4.4',['nw-navigation_refresh'],['Settings']],['5.1.1',['nw2-abc_ic_search_api_mtrl_alpha','nw2-ic_add_white_24dp'],['Refresh','Edit weather display…','Change editions…','Manage sections…','Switch to dark theme']]]){
  const c={window:{}};for(const f of ['news-prefs.js','stock-apps.js'])if(fs.existsSync(`versions/${v}/${f}`))vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),c);
  const html=c.window.StockApps.render('news-weather',{ui:{},data:{},t:k=>k,locale:'en-US',now:new Date(2015,5,1)});
  assert.doesNotMatch(html,/aria-label="Refresh"[^>]*><svg/,v);for(const src of bar){assert.match(html,new RegExp(src),v);assert.ok(fs.existsSync(`versions/${v}/assets/${src}.png`),v+src);}
  assert.deepEqual([...c.window.StockApps.menu('news-weather',{t:k=>k}).map(i=>i.title)],menu,v);
}
// Play Movies 1.4.11 (audit step 9): no title (useLogo | showHome), Shop, rentals_controller.xml's welcome, menus.
const mv=G.render('play-movies',base('play-movies'));
assert.doesNotMatch(mv,/<h2>/);assert.match(mv,/ga-mv-ic_menu_shop_holo_dark/);assert.match(mv,/Welcome!/);assert.match(mv,/There was a problem with the network/);assert.match(mv,/MY RENTALS|My Rentals/);
assert.match(G.render('play-movies',base('play-movies',{gaMoviesTab:'personal'})),/You don&#39;t have any personal videos/);
assert.deepEqual([...G.menu(base('play-movies')).map(i=>i.title)],['Manage offline rentals','Accounts','Settings','Help','Contact us','Send feedback']);
// Play Books 2.3.6 (audit step 9): the carousel by default, "View as list" switches; the offline pin toggles.
let bk=G.render('play-books',base('play-books'));
assert.match(bk,/ga-bk-carousel/);assert.match(bk,/ga-bk-ic_menu_search_light/);assert.match(bk,/ga-bk-btn_pin|ga-bk-pin/);
assert.deepEqual([...G.menu(base('play-books')).map(i=>i.title)],['Refresh','Accounts','Help','Make available offline','View as list']);
const bd={},bu={},bctx={...base('play-books',bu,bd),ui:bu,data:bd,save(){},render(){},closeOverlay(){},toast(){}};
G.handle('ga-bk-view','',bctx);assert.equal(bd.gaBkView,'list');assert.match(G.render('play-books',{...base('play-books'),data:{...base('play-books').data,...bd}}),/ga-bk-list/);
G.handle('ga-bk-pin','b1',bctx);assert.equal(bd.gaBkPinned.b1,true);
console.log('ics-google-apps ok');
