require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Stock Nexus 5: Play Music, Play Movies & TV, Play Books and Play Games (late 2013 looks, own art and sample content).
const w={window:{}};for(const f of ['kk-play-more.js','play-apps.js'])vm.runInNewContext(fs.readFileSync('versions/4.4.4/'+f,'utf8'),w);
const P=w.window.PlayApps,t=k=>k,tracks=[{title:'A',artist:'X',album:'One',duration:100},{title:'B',artist:'X',album:'One',duration:90},{title:'C',artist:'Y',album:'Two',duration:80}];
const music={queue:[0,1,2],track:0,position:10,playing:true,shuffle:false,repeat:'off',playlists:[]};
const ctx=(app,ui={})=>({app,ui,data:{},t,music,tracks,time:s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`});
const listen=P.render(ctx('play-music'));
assert.ok(listen.includes('Listen Now')&&listen.includes('All music')&&listen.includes('pm52-ic_corpora_music_white.png')&&(listen.match(/data-action="pa-album"/g)||[]).length===2&&listen.includes('pm-mini'));
// Play Music 5.2 (audit step 4): HomeMenu.FREE_ITEM_SCREENS, MyLibraryFragment's tabs, menu/home_activity.xml.
assert.deepEqual([...P.drawer(ctx('play-music')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]).join(),'Listen Now,My Library,Playlists,Instant Mixes,Shop');
assert.equal(P.menu(ctx('play-music')).map(i=>i.title).join(),'Refresh,Settings,Help,Send feedback');
const np=P.render(ctx('play-music',{sub:'player'}));
assert.ok(np.includes('data-field="music-position"')&&np.includes('data-action="music-play"')&&np.includes('pa-thumb')&&np.includes('0:10'));
assert.ok(P.render(ctx('play-music',{sub:'queue'})).includes('QUEUE'));
assert.ok(P.render(ctx('play-music',{paPage:{'play-music':'library'},paMusicTab:'songs'})).includes('data-queue="all"'));
const movies=P.render(ctx('play-movies'));
assert.ok(movies.includes('My Movies')&&movies.includes('Recommended for You')&&movies.includes('>Shop<')&&movies.includes('mv3-ic_movie.png')&&(movies.match(/data-action="pa-movie"/g)||[]).length===P.MOVIES.length);
assert.ok(P.render(ctx('play-movies',{sub:'movie',paItem:'m1'})).includes('pm-video-bottom'));
// Play Movies 3.0 (audit step 4): VideosDrawerHelper's verticals and the menus in onCreateOptionsMenu order.
assert.equal([...P.drawer(ctx('play-movies')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]).join(),'Watch Now,My Movies,My TV Shows,On Device,Shop');
assert.equal(P.menu(ctx('play-movies')).map(i=>i.title).join(),'Settings,Help,Contact us,Send feedback,Refresh,Personal videos');
assert.ok(P.render(ctx('play-movies',{paPage:{'play-movies':'watch'}})).includes('Now Playing'));
const books=P.render(ctx('play-books'));
assert.ok(books.includes('Read Now')&&books.includes('SEE ALL')&&(books.match(/data-action="pa-book"/g)||[]).length===P.BOOKS.length);
// Play Books 3.1 (audit step 4): HomeFragment.createSideDrawerItems and menu/fragment_home.xml.
assert.equal([...P.drawer(ctx('play-books')).matchAll(/<button[^>]*>(?:<img[^>]*>)?([^<]*)</g)].map(m=>m[1]).join(),'Read Now,My Library,Shop,Settings,Help &amp; feedback');
assert.equal(P.menu(ctx('play-books')).map(i=>i.title).join(),'Refresh');
assert.equal(P.menu(ctx('play-books',{paPage:{'play-books':'library'}})).map(i=>i.title).join(),'Sort,Refresh');
assert.ok(books.includes('bk3-ic_corpora_books.png')&&!books.includes('‹'));
const reader=P.render(ctx('play-books',{sub:'reader',paItem:'b2'}));
assert.ok(!reader.includes('‹'));
assert.ok(reader.includes('Pride and Prejudice')&&reader.includes('pa-reader-tap')&&reader.includes('1 / 6'));
const games=P.render(ctx('play-games'));
assert.ok(games.includes('Welcome!')&&games.includes('My games')&&games.includes('SEE MORE'));
assert.ok(P.render(ctx('play-games',{paPage:{'play-games':'recommended'}})).includes('POPULAR MULTIPLAYER'));
const drawer=P.drawer(ctx('play-games'));
for(const label of ['Play Now','My Games','My Activity','Players','Recommended Games','Shop'])assert.ok(drawer.includes(`>${label}<`),label);
assert.ok(P.drawer(ctx('play-movies')).includes('class="on" data-action="pa-page" data-id="movies"'));
const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');
assert.ok(sim.includes("const GEL_UNSIMULATED = [];")&&sim.includes("return PlayApps.render(playContext(ui.view));"));
// Play Games 1.1 (audit step 4): getDrawerItems and games_destination_main_menu.
assert.equal([...P.drawer(ctx('play-games')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]).join(),'Play Now,My Games,My Activity,Players,Recommended Games,Shop');
assert.equal(P.menu(ctx('play-games')).map(i=>i.title).join(),'Accounts,Settings,Help');
assert.ok(P.render(ctx('play-games')).includes('pg1-ic_ab_play_games.png')&&!P.render(ctx('play-games',{sub:'game',paItem:'g1'})).includes('‹'));
assert.ok(P.render(ctx('play-games',{paPage:{'play-games':'activity'}})).includes('3/18 unlocked'));
console.log('kk-play-apps ok');
