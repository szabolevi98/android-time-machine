require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 6 (LMY48Y): the Play apps from their APKs (audit step 4).
const w={window:{}};vm.runInNewContext(['stock-strings.js','lp-play-more.js','play-apps.js'].map(f=>fs.readFileSync('versions/5.1.1/'+f,'utf8')).join(';'),w);
const P=w.window.PlayApps,t=k=>k,tracks=[{title:'A',artist:'X',album:'One',duration:100},{title:'B',artist:'X',album:'One',duration:90}];
const music={queue:[0,1],track:0,position:10,playing:true,shuffle:false,repeat:'off',playlists:[]};
const ctx=(app,ui={},locale='en')=>({app,ui,data:{},t,locale,music,tracks,time:s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`});
const labels=html=>[...html.matchAll(/<button[^>]*>(?:<img[^>]*>)?([^<]*)</g)].map(m=>m[1]).join();
// Play Music 5.8: the Toolbar with the drawer toggle, Search only, the PlayDrawer, MyLibraryFragment's tabs.
const listen=P.render(ctx('play-music'));
assert.ok(listen.includes('lpa-bar')&&listen.includes('>Listen Now<')&&listen.includes('pm58-ic_search_white.png')&&!listen.includes('pa-menu')&&!listen.includes('ALL MUSIC'));
const md=P.drawer(ctx('play-music'));
assert.equal(labels(md),'Listen Now,My Library,Playlists,Instant Mixes,Shop,Settings,Help,Send feedback');
assert.ok(md.includes('pm58-ic_drawer_listennow_selected.png')&&md.includes('nexus6.demo@gmail.com'));
assert.equal([...P.render(ctx('play-music',{paPage:{'play-music':'library'}})).matchAll(/data-action="pa-libtab" data-id="\w+">([^<]*)</g)].map(m=>m[1]).join(),'Genres,Artists,Albums,Songs');
assert.ok(!P.render(ctx('play-music',{sub:'album'})).includes('‹'));
// Play Movies 3.6: VideosDrawerHelper's verticals in the PlayDrawer, Search only, My Library's tabs.
assert.equal(labels(P.drawer(ctx('play-movies'))),'Watch Now,My Library,My Wishlist,Shop,Settings,Help &amp; feedback');
const lib=P.render(ctx('play-movies'));
assert.ok(lib.includes('>My Library<')&&lib.includes('mv36-abc_ic_search_api_mtrl_alpha.png')&&!lib.includes('pa-menu'));
assert.equal([...lib.matchAll(/data-action="pa-movietab" data-id="\w+">([^<]*)</g)].map(m=>m[1]).join(),'My Movies,My TV Shows');
assert.ok(!P.render(ctx('play-movies',{sub:'movie',paItem:'m1'})).includes('‹'));
// Play Books 3.3: populateDrawerActions, menu/fragment_home.xml, the filter tabs.
assert.equal(labels(P.drawer(ctx('play-books'))),'Read Now,My Library,Shop,Settings,Help &amp; feedback');
assert.ok(!P.render(ctx('play-books')).includes('bk33-ic_sort_wht_24dp')&&P.render(ctx('play-books',{paPage:{'play-books':'library'}})).includes('bk33-ic_sort_wht_24dp'));
assert.equal(P.menu(ctx('play-books')).map(i=>i.title).join(),'Refresh');
assert.ok(P.render(ctx('play-books',{paPage:{'play-books':'library'}})).includes('data-action="pa-bookstab"')&&!P.render(ctx('play-books',{sub:'reader',paItem:'b1'})).includes('‹'));
// Play Games 2.2: the destination drawer, games_default_menu, Play Now's sections, Inbox's null state.
assert.equal(labels(P.drawer(ctx('play-games'))),'Play Now,My Games,Inbox,Players,Explore,Settings,Help &amp; Feedback');
assert.equal(P.menu(ctx('play-games')).map(i=>i.title).join(),'Settings');
const now=P.render(ctx('play-games'));
assert.ok(now.includes('Continue playing')&&now.includes('Discover new games')&&now.includes('Add players you know')&&!now.includes('Welcome!'));
assert.ok(P.render(ctx('play-games',{paPage:{'play-games':'inbox'}})).includes('FIND MULTIPLAYER GAMES'));
console.log('lp-play-apps ok');
