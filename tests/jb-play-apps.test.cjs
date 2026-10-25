require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Nexus 4 (JWR66Y): the Play apps of the image, each from its APK (audit step 4).
const w={window:{}};vm.runInNewContext(['stock-strings.js','jb-play-more.js','play-apps.js'].map(f=>fs.readFileSync('versions/4.3/'+f,'utf8')).join(';'),w);
const P=w.window.PlayApps,t=k=>k,tracks=[{title:'A',artist:'X',album:'One',duration:100},{title:'B',artist:'X',album:'One',duration:90}];
const music={queue:[0,1],track:0,position:10,playing:true,shuffle:false,repeat:'off',playlists:[]};
const ctx=(app,ui={},locale='en')=>({app,ui,data:{},t,locale,music,tracks,time:s=>`${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`});
// Play Books 2.8.91: FlatBlue bar with the drawer toggle and ic_corpora_books, "Recent" over books_card_small cards.
const books=P.render(ctx('play-books'));
assert.ok(books.includes('bk28-ic_drawer_white.png')&&books.includes('bk28-ic_corpora_books.png')&&books.includes('Read Now')&&books.includes('>Recent<'));
assert.equal((books.match(/class="bk28-card"/g)||[]).length,P.BOOKS.length);
assert.ok(!books.includes('SEE ALL')&&!books.includes('‹'));
const lib=P.render(ctx('play-books',{paPage:{'play-books':'library'},bkFilterOpen:true}));
assert.ok(lib.includes('My Library')&&lib.includes('bk28-spinner')&&lib.includes('All books')&&lib.includes('Purchases')&&lib.includes('bk28-divider'));
// HomeFragment.createSideDrawerItems: Read Now, My Library, Shop.
assert.deepEqual([...P.drawer(ctx('play-books')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]),['Read Now','My Library','Shop']);
// menu/home.xml overflow: Sort only in My Library.
assert.equal(JSON.stringify(P.menu(ctx('play-books')).map(i=>i.title)),JSON.stringify(['Refresh','Settings','Help']));
assert.equal(JSON.stringify(P.menu(ctx('play-books',{paPage:{'play-books':'library'}})).map(i=>i.title)),JSON.stringify(['Sort','Refresh','Settings','Help']));
assert.equal(P.menu(ctx('play-books',{},'hu'))[0].title,w.window.StockStrings.books.Refresh.hu);
const reader=P.render(ctx('play-books',{sub:'reader',paItem:'b2'}));
assert.ok(reader.includes('bk28-ic_ab_back_holo_light.png')&&reader.includes('Pride and Prejudice')&&!reader.includes('‹'));
// Play Movies 2.5.4: "Google Play", the three verticals as tabs, My movies + Suggestions, the menus in insertion order.
const movies=P.render(ctx('play-movies'));
assert.ok(movies.includes('mv25-ic_launcher_videos.png')&&movies.includes('>Google Play<')&&movies.includes('>My movies<')&&movies.includes('>Suggestions<')&&movies.includes('See more from Google Play'));
assert.deepEqual([...movies.matchAll(/data-action="pa-page" data-id="(\w+)"/g)].map(m=>m[1]).join(),'movies,shows,personal');
assert.equal((movies.match(/data-action="pa-movie"/g)||[]).length,P.MOVIES.length);
assert.ok(movies.includes('2012, 104 mins.')&&movies.includes('mv25-ic_menu_shop_holo_dark.png'));
const personal=P.render(ctx('play-movies',{paPage:{'play-movies':'personal'}}));
assert.ok(personal.includes('NO VIDEOS FOUND')&&!personal.includes('mv25-ic_menu_search.png'));
assert.equal(JSON.stringify(P.menu(ctx('play-movies')).map(i=>i.title)),JSON.stringify(['Settings','Help','Contact us','Send feedback','Refresh','Accounts']));
assert.ok(!P.render(ctx('play-movies',{sub:'movie',paItem:'m1'})).includes('‹'));
// Play Music 5.0: MusicActionBar, HomeMenu.FREE_ITEM_SCREENS, MyLibraryFragment's tabs, menu/home_activity.xml.
const listen=P.render(ctx('play-music'));
assert.ok(listen.includes('pm5-ic_corpora_music_white.png')&&listen.includes('>Listen Now<')&&listen.includes('>All music<')&&listen.includes('pm5-ic_search_white.png')&&!listen.includes('‹'));
assert.deepEqual([...P.drawer(ctx('play-music')).matchAll(/<button[^>]*>([^<]*)</g)].map(m=>m[1]),['Listen Now','My Library','Playlists','Instant Mixes','Shop']);
const mlib=P.render(ctx('play-music',{paPage:{'play-music':'library'}}));
assert.deepEqual([...mlib.matchAll(/data-action="pa-libtab" data-id="\w+">([^<]*)</g)].map(m=>m[1]),['Genres','Artists','Albums','Songs']);
assert.ok(P.render(ctx('play-music',{paPage:{'play-music':'mixes'}})).includes('data-action="pa-mixtab"'));
assert.equal(JSON.stringify(P.menu(ctx('play-music')).map(i=>i.title)),JSON.stringify(['Refresh music','Settings','Help']));
assert.ok(P.render(ctx('play-music',{sub:'album'})).includes('ic_ab_back_holo_dark.png'));
console.log('jb-play-apps ok');
