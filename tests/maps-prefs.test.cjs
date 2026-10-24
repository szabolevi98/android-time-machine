require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Maps' settings (T12, maps-prefs.js): Maps 7.5 / 9.3 settings.xml rows in the APK's words, Distance units, Maps
// history with its delete confirmation, the home address, About's version; Maps 6.x's Cache settings and 4.3's My Places.
const load=v=>{const c={window:{},document:{querySelector:()=>null},requestAnimationFrame(){}};c.window.window=c.window;
  for(const f of ['stock-strings.js','maps-prefs.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),c);return c.window.MapsPrefs;};
const ctx=(o={})=>{const c={ui:{mapsPrefs:['settings']},data:{},t:k=>k,lang:'en',locale:'en-US',account:'demo@gmail.com',bar:t=>`<h1>${t}</h1>`,saved:0,rendered:0,...o};c.save=()=>c.saved++;c.render=()=>c.rendered++;return c;};
for(const [v,version] of [['4.4.4','7.5.0 (#705001723)'],['5.1.1','9.3.0 (#903008024)']]){
  const P=load(v),c=ctx();
  let html=P.render(c);
  for(const t of ['Edit home or work','Google location settings','Maps history','Distance units','Shake to send feedback','About, terms &amp; privacy'])assert.match(html,new RegExp(t),`${v} ${t}`);
  assert.match(html,/data-action="mps-check" data-id="shake_to_send_feedback" role="checkbox" aria-checked="true"/);
  // Distance units: the list in DISTANCE_UNIT_ENTRIES order; Miles is kept and wins over the language.
  P.handle('mps-list','distance_units',c);assert.match(P.render(c),/Automatic[\s\S]*Kilometers[\s\S]*Miles/);
  P.handle('mps-pick','distance_units:2',c);assert.equal(c.data.mapsPrefs.distance_units,'MILES');assert.equal(P.imperial(c.data,false),true);
  P.handle('mps-pick','distance_units:1',c);assert.equal(P.imperial(c.data,true),false);
  // Maps history: newest first, once, at most 20; delete asks with MY_PLACES_DELETE_CONFIRM.
  for(const q of ['a','b','a'])P.remember(c.data,q);assert.deepEqual([...c.data.mapsHistory],['a','b']);
  for(let i=0;i<30;i++)P.remember(c.data,'q'+i);assert.equal(c.data.mapsHistory.length,20);
  c.data.mapsHistory=['Coffee'];P.handle('mps-open','history',c);P.handle('mps-del','mapsHistory:0',c);
  assert.match(P.render(c),/<b>Coffee<\/b> will be removed from Maps History\./);
  P.handle('mps-del-ok','',c);assert.equal(c.data.mapsHistory.length,0);
  // Home: the hint until an address is kept; About: VERSION with ABOUT_VERSION_SUMMARY.
  assert.ok(P.back(c.ui));P.handle('mps-open','homework',c);assert.match(P.render(c),/Enter home address/);
  c.data.mapsHome='1 Main St';assert.match(P.render(c),/1 Main St/);
  P.back(c.ui);P.handle('mps-open','about',c);assert.match(P.render(c),new RegExp(version.replace(/[.()#]/g,'\\$&')));
  // Back pops the screens, then leaves the map to the shell.
  assert.ok(P.back(c.ui));assert.ok(P.back(c.ui));assert.equal(c.ui.mapsPrefs,null);assert.equal(P.back(c.ui),false);
}
// Maps 6.x: Cache settings' Clear cache empties the shown tiles; 4.3's My Places lists the starred places.
for(const v of ['4.0.4','4.3']){
  const P=load(v),c=ctx({data:{mapsCache:true}});
  assert.match(P.render(c),/demo@gmail\.com/);
  P.handle('mps-open','cache',c);assert.match(P.render(c),/data-id="clear">/);
  P.handle('mps-act','clear',c);assert.equal(c.data.mapsCache,false);assert.match(P.render(c),/data-id="clear" disabled/);
}
{
  const P=load('4.3'),c=ctx({ui:{mapsPrefs:['places']}});
  assert.match(P.render(c),/You have no starred places\./);
  P.handle('mps-star','Pizza',c);assert.match(P.render(c),/Pizza[\s\S]*Starred/);
  P.handle('mps-del','mapsStarred:0',c);assert.match(P.render(c),/<b>Pizza<\/b> will be removed from My Places\./);
  P.handle('mps-del-ok','',c);assert.equal(c.data.mapsStarred.length,0);
}
console.log('maps-prefs ok');
