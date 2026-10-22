const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
function phone(){
 const modules={},pending=new Map();let next=0;
 const NG={defaults:{documents:{grid:false,sort:'date',nodes:[]},photoLibrary:{seen:false,albums:[],backup:false},google:{history:[],dismissed:[],feed:true}},module:id=>modules[id],documents:{nodes:c=>c.data.documents.nodes}};
 const ctx={NG,setTimeout:fn=>{pending.set(++next,fn);return next;},clearTimeout:id=>pending.delete(id)};
 for(const file of ['ng-apps.js','ng-hangouts-model.js','ng-music-model.js','ng-drive-model.js','ng-app-data.js'])vm.runInNewContext(fs.readFileSync('versions/7.1.2/'+file,'utf8'),ctx);
 const c={data:{settings:{},documents:{grid:true,sort:'name',nodes:[{id:'audio',type:'audio',name:'Demo.mp3',duration:10000}]},contacts:[{id:1}],sms:[{id:1,messages:[]}],events:[{id:1}],photos:[{id:1}]},ui:{recent:[],history:[]},save(){},renderStatus(){}};
 return {NG,c,modules,pending,run(){for(const [id,fn]of [...pending]){pending.delete(id);fn();}}};
}
test('Clear data stops Music and resets its private state while provider audio and other apps survive',()=>{
 const {NG,c}=phone();NG.musicModel.start(c,['audio'],'audio',0);c.data.music.playlists=[{id:1,tracks:['audio']}];
 c.data.maps={saved:['home']};c.data.appPrefs={music:{shuffle:true},maps:{units:'km'}};c.data.settings.perms={'play-music':{storage:true}};
 c.data.notifications=[{id:1,app:'play-music'},{id:2,app:'gmail'}];c.data.recentApps=['play-music','maps'];c.ui.music={route:'queue'};c.ui.recent=['play-music','maps'];c.ui.history=[{view:'play-music'},{view:'maps'}];c.ui.thumbs={'play-music':{html:'stale'}};
 NG.appData.clear(c,'play-music');assert.equal(NG.appData.stopped(c,'play-music'),true);assert.equal(NG.musicModel.state(c).playing,false);assert.equal(NG.musicModel.state(c).queue.length,0);assert.equal(NG.musicModel.state(c).playlists.length,0);
 assert.equal(c.data.documents.nodes.length,1);assert.equal(c.data.maps.saved[0],'home');assert.equal(c.data.appPrefs.music,undefined);assert.equal(c.data.appPrefs.maps.units,'km');assert.equal(c.data.settings.perms['play-music'],undefined);
 assert.equal(c.data.notifications.length,1);assert.equal(c.ui.music,undefined);assert.equal(c.ui.history.length,1);assert.equal(c.ui.recent.length,1);assert.equal(c.ui.thumbs['play-music'],undefined);assert.equal(c.data.settings.appCleared['play-music'].data,true);
 NG.appData.opened(c,'play-music');assert.equal(NG.appData.stopped(c,'play-music'),false);assert.equal(c.data.settings.appCleared['play-music'].data,false);
});
test('Package task cancellation prevents stale work without cancelling another package and allows a new launch',()=>{
 const {NG,c,run,pending,modules}=phone();let stale=0,other=0,resumes=0;modules.calendar={resume(){resumes++;}};
 NG.appTasks.later(c,'calendar-goal',()=>stale++,1000);NG.appTasks.later(c,'gmail',()=>other++,1000);NG.appData.stop(c,'calendar');assert.equal(pending.size,1);run();assert.equal(stale,0);assert.equal(other,1);assert.equal(NG.appData.stopped(c,'calendar-goal'),true);
 NG.appData.opened(c,'calendar-goal');assert.equal(resumes,1);NG.appTasks.later(c,'calendar',()=>stale++,1000);run();assert.equal(stale,1);
});
test('Store clearing cancels downloads and PIN/preferences but preserves PackageManager and service records',()=>{
 const {NG,c}=phone();c.data.playStore={installed:['app'],versions:{app:3},library:['app'],wishlist:['movie'],reviews:{app:5},jobs:{other:{elapsed:5000}},searches:['old'],contentPin:'1234',contentEnabled:true};c.data.appPrefs={play:{'auto-update-mode':'always'}};
 NG.appData.clear(c,'play-store');assert.equal(Object.keys(c.data.playStore.jobs).length,0);assert.equal(c.data.playStore.installed[0],'app');assert.equal(c.data.playStore.versions.app,3);assert.equal(c.data.playStore.wishlist[0],'movie');assert.equal(c.data.playStore.reviews.app,5);assert.equal(c.data.playStore.contentPin,undefined);assert.equal(c.data.appPrefs.play,undefined);
});
test('Documents aliases reset preferences but keep provider nodes; Drive cache and data have different scope',()=>{
 const {NG,c}=phone();const nodes=c.data.documents.nodes;NG.appData.clear(c,'files');assert.equal(c.data.documents.nodes,nodes);assert.equal(c.data.documents.grid,false);assert.equal(NG.appData.stopped(c,'documents'),true);NG.appData.opened(c,'files');assert.equal(NG.appData.stopped(c,'documents'),false);
 c.data.driveFiles=[{id:'a',name:'a',offline:true,previewCached:1},{id:'b',name:'b',previewCached:1},{id:'pending',name:'c',uploadReadyAt:Date.now()+60000}];NG.appData.clearCache(c,'drive');assert.equal(c.data.driveFiles[0].previewCached,1);assert.equal(c.data.driveFiles[1].previewCached,undefined);
 NG.appData.clear(c,'drive');assert.equal(c.data.driveFiles.length,2);assert.equal(c.data.driveFiles[0].offline,undefined);assert.equal(c.data.driveFiles[0].previewCached,undefined);assert.equal(c.data.documents.nodes,nodes);
});
test('Cloud conversations and shared providers survive app clearing; drafts, onboarding and private album state reset',()=>{
 const {NG,c}=phone();const h=NG.hangoutsModel.state(c),threads=h.threads;h.drafts[1]='unsent';h.prefs.notifications=false;NG.appData.clear(c,'hangouts');assert.equal(NG.hangoutsModel.state(c).threads,threads);assert.equal(Object.keys(c.data.hangouts.drafts).length,0);assert.equal(c.data.hangouts.prefs.notifications,true);
 c.data.photoLibrary={seen:true,albums:[{id:1}]};c.data.calendarOobe=true;c.data.goals=[{id:2}];NG.appData.clear(c,'photos');NG.appData.clear(c,'contacts');NG.appData.clear(c,'messenger');NG.appData.clear(c,'calendar');assert.equal(c.data.photoLibrary.seen,false);assert.equal(c.data.photoLibrary.albums.length,0);assert.equal(c.data.photos.length,1);assert.equal(c.data.contacts.length,1);assert.equal(c.data.sms.length,1);assert.equal(c.data.events.length,1);assert.equal(c.data.goals.length,1);assert.equal(c.data.calendarOobe,undefined);
 c.data.clock={alarms:[{on:true}]};NG.appData.clear(c,'clock');assert.equal(c.data.clock.alarms.length,0);
});
test('Protected Settings refuses clearing, and Force stop retains the app data',()=>{
 const {NG,c}=phone();assert.equal(NG.appData.canClear('settings'),false);assert.equal(NG.appData.clear(c,'settings'),false);assert.equal(c.data.settings.stoppedApps,undefined);
 c.data.music={playing:true,queue:['audio'],playlists:[{id:1}]};c.ui.appPrefs={stack:[{app:'music'}]};c.ui.history=[{view:'app-prefs'},{view:'maps'}];NG.appData.stop(c,'play-music');assert.equal(c.data.music.playing,false);assert.equal(c.data.music.queue.length,1);assert.equal(c.data.music.playlists.length,1);assert.equal(c.ui.appPrefs,undefined);assert.equal(c.ui.history.length,1);
});
