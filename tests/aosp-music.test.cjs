require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// AOSP Music on 4.0.4 and 4.3: its own menus (long-press context menus, the legacy menu key), no simulator buttons inside.
for(const v of ['4.0.4','4.3']){
  const ctx={window:{AndroidI18n:{language:'en'}}};vm.runInNewContext(fs.readFileSync(`versions/${v}/music-strings.js`,'utf8')+fs.readFileSync(`versions/${v}/music.js`,'utf8'),ctx);
  const M=ctx.window.ICSMusic,t=k=>k,state=M.restore?M.restore({}):{track:0,queue:[0],playlists:[],position:0,playing:false,shuffle:false,repeat:'off'};
  state.playlists=state.playlists||[];
  const library=M.render(state,{musicTab:'Songs'},t),player=M.render(state,{sub:'player'},t);
  assert.doesNotMatch(library+player,/Demo tracks|Music library<\/button>|⋮|＋|‹/,v);
  assert.match(library,/data-music-hold="track:0"/,v);
  assert.match(M.render(state,{musicTab:'Playlists'},t),/data-music-hold="playlist:recent"[^]*Recently added/,v);
  assert.match(M.overlay(state,{overlay:'music-context',musicHold:'track:1'},t),/Play<\/button>.*Add to playlist.*Use as phone ringtone.*Delete.*Search/s,v);
  assert.match(M.overlay(state,{overlay:'music-options'},t),/Party shuffle.*Shuffle all/s,v);
  assert.match(M.overlay(state,{overlay:'music-options',sub:'player'},t),/Library.*Party shuffle.*Add to playlist.*Use as phone ringtone.*Delete/s,v);
  ctx.window.AndroidI18n.language='hu';assert.match(M.overlay(state,{overlay:'music-options'},t),/Keverés bulihoz/,v);
  assert.equal(M.M('ringtone_set','en'),'"%s" set as phone ringtone.',v);
  // Deleted songs leave the lists.
  state.deleted=[0];assert.doesNotMatch(M.render(state,{musicTab:'Songs'},t),/data-music-hold="track:0"/,v);
  // The simulator shows the legacy menu key for Music (targetSdkVersion 9) and opens the menus.
  const sim=engineSource(v);assert.match(sim,/data-action="legacy-menu"/,v);assert.match(sim,/ui\.overlay='music-options'/,v);assert.match(sim,/ui\.overlay = 'music-context'/,v);
  assert.ok(fs.existsSync(`versions/${v}/assets/ic_sysbar_menu.png`)&&fs.existsSync(`versions/${v}/assets/music-ic_mp_playlist_recently_added_list.png`),v);
}
console.log('aosp-music ok');
