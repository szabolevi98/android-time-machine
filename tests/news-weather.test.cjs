const engineSource=require('./lib/engine-source.cjs');
require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// News & Weather (audit step 6): GenieWidget's Preferences (weather, news topics, refresh) with their effects, the
// refresh status and the story page; news-prefs.js comes from docs/templates/news-prefs.template.js.
const tpl=fs.readFileSync('docs/templates/news-prefs.template.js','utf8');
for(const [v,apk] of [['2.3.6','1.3.04'],['4.0.4','1.3.04'],['4.3','1.3.11'],['4.4.4','1.3.11']]){
  const src=fs.readFileSync(`versions/${v}/news-prefs.js`,'utf8');
  assert.equal(src,tpl.replace('__VERSION__',apk).replace(/__IMAGE__/,src.match(/GenieWidget\.apk of the (.+?) image/)[1]),`${v} news-prefs.js is the template (run docs/tools/news-prefs.py)`);
}
const ctxOf=(v,ui,data={})=>{const w={window:{}};for(const f of ['stock-strings.js','news-prefs.js','stock-apps.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);w.window.GELNow={render:()=>''};return {S:w.window.StockApps,NP:w.window.NewsPrefs,ctx:{ui,data,t:k=>k,lang:'hu',locale:'hu',now:new Date(2014,5,20,12)}};};
for(const v of ['4.0.4','4.3','4.4.4']){
  const {S,NP,ctx}=ctxOf(v,{newsSub:'settings',nwpScreen:'root'});
  const root=S.render('news-weather',ctx);
  const order=['Időjárás','Hírek','Frissítési beállítások','Alkalmazás'].map(k=>root.indexOf(k));
  assert.ok(order.every((n,i)=>n>0&&(i===0||n>order[i-1])),v+' '+JSON.stringify(order));
  // Settings effects: the city, Fahrenheit, the topics.
  const data={newsPrefs:{useMyLocation:false,location:'Budapest',celsius:false,topics:{Sports:false},custom:['Space']}};
  const w=S.render('news-weather',{...ctx,ui:{newsTab:'Weather'},data});
  assert.ok(w.includes('Budapest')&&w.includes('70°')&&w.includes('mph'),v);
  const tabs=S.render('news-weather',{...ctx,ui:{},data});assert.ok(!tabs.includes('data-id="Sports"')&&tabs.includes('data-id="Space" data-no-translate'),v);
  assert.ok(S.render('news-weather',{...ctx,ui:{newsTab:'Space'},data}).includes('nw-unavailable'));
  const story=S.render('news-weather',{...ctx,ui:{newsSub:'story',newsStory:'Top Stories:0'},data:{}});assert.ok(story.includes('nwp-story')&&story.includes('nwp-picture'),v);
  assert.equal(S.menu('news-weather',{...ctx,ui:{newsSub:'story'}}).map(i=>i.action).join(),'news-share');
  assert.ok(S.menu('news-weather',{...ctx,ui:{}}).some(i=>i.action==='news-settings'));
  // The handler: toggles, dialogs, topics, the interval and Back.
  const ui={nwpScreen:'weather'},d={};let rendered=0;const h={ui,data:d,lang:'hu',save(){},render(){rendered++;},input:()=>'Szeged',unsupported(){}};
  NP.handle('nwp-toggle','useMyLocation',h);NP.handle('nwp-dialog','location',h);NP.handle('nwp-ok','',h);assert.equal(d.newsPrefs.location,'Szeged');assert.equal(d.newsPrefs.useMyLocation,false);
  NP.handle('nwp-toggle','celsius',h);assert.equal(d.newsPrefs.celsius,false);
  ui.nwpScreen='topics';NP.handle('nwp-topic','Technology',h);assert.equal(d.newsPrefs.topics.Technology,false);
  NP.handle('nwp-dialog','custom',h);NP.handle('nwp-ok','',h);assert.deepEqual([...d.newsPrefs.custom],['Szeged']);NP.handle('nwp-remove','Szeged',h);assert.equal(d.newsPrefs.custom.length,0);
  NP.handle('nwp-dialog','interval',h);NP.handle('nwp-choose','3600',h);assert.equal(d.newsPrefs.interval,'3600');assert.ok(!ui.nwpDialog);
  assert.ok(NP.back(ui)&&ui.nwpScreen==='news'&&NP.back(ui)&&ui.nwpScreen==='root'&&!NP.back(ui));
  NP.refresh(d,Date.UTC(2014,5,20,10));const rs=S.render('news-weather',{...ctx,ui:{newsSub:'settings',nwpScreen:'refresh'},data:d});assert.ok(rs.includes('Utolsó frissítés')||rs.includes('Last refresh'),v);
  assert.ok(rendered>5);
}
const ics=engineSource('4.0.4');assert.ok(ics.includes("ui.view==='news-weather'&&!ui.newsSub")&&ics.includes("if(ui.view==='news-weather'){ui.overlay='sa-menu'"));
console.log('news-weather ok');
