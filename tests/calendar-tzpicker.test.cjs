require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// TimeZonePickerDialog of the 4.3 / 4.4.4 / 5.1.1 Calendar (tzpicker.js, generated from each image).
const same=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);
const now=Date.UTC(2026,9,10,12,0),winter=Date.UTC(2026,11,1,9,0),summer=Date.UTC(2026,6,1,9,0);
for(const v of ['4.3','4.4.4','5.1.1']){
  const w={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/tzpicker.js`,'utf8'),w);
  const P=w.window.TimeZonePicker,ctx={lang:'en',locale:'en-US',now,hour24:false,recents:[]};
  // The edit button: the name at the event's time, the offset then in grey, the sun for zones with DST.
  assert.equal(P.label('Europe/Budapest',winter,'en'),'Central European Standard Time  <i>GMT+1</i> <b>☀</b>',v);
  assert.equal(P.label('Europe/Budapest',summer,'en'),'Central European Summer Time  <i>GMT+2</i> <b>☀</b>',v);
  assert.equal(P.label('Europe/Budapest',winter,'hu'),'Közép-európai zónaidő  <i>GMT+1</i> <b>☀</b>',v);
  assert.equal(P.label('Asia/Tokyo',winter,'en'),'Japan Standard Time  <i>GMT+9</i>',v);
  assert.equal(P.label('Asia/Kolkata',winter,'en'),'India Standard Time  <i>GMT+5:30</i>',v);
  // timezone_rename_labels win over ICU's names.
  assert.equal(P.label('Australia/Sydney',winter,'en'),'Australian Eastern - NSW  <i>GMT+11</i> <b>☀</b>',v);
  assert.equal(P.label('Australia/Sydney',winter,'hu'),'Kelet-ausztráliai idő – NSW  <i>GMT+11</i> <b>☀</b>',v);
  // An old id reads its backward zone.
  assert.equal(P.label('Asia/Calcutta',winter,'en'),P.label('Asia/Kolkata',winter,'en'),v);
  // Utils.getDisplayedTimezone's short names (ICU's, else libcore's GMT string) and a wall time in another zone.
  assert.equal(P.shortName('Europe/Budapest',winter,'en'),v==='5.1.1'?'GMT+01:00':'CET',v);assert.equal(P.shortName('Europe/Budapest',summer,'de'),'MESZ',v);
  assert.equal(P.shortName('Asia/Tokyo',winter,'en'),'GMT+09:00',v);assert.equal(P.shortName('Mars/Olympus',winter,'en'),'Mars/Olympus',v);
  same(P.wall('Europe/Budapest',P.millis('Asia/Tokyo','2026-12-01','10:00')),{date:'2026-12-01',time:'02:00'},v);
  // The wall time of the event in its zone.
  assert.equal(P.millis('Europe/Budapest','2026-12-01','10:00'),winter,v);
  // TimeZoneData: sorted by today's offset (largest first), one zone per rule set and country, the event's zone in.
  const d=P.data('Europe/Budapest',winter,'en',now);
  assert.ok(d.list.length>300&&d.list.length<400,v+' '+d.list.length);
  for(let i=1;i<d.list.length;i++)assert.ok(d.list[i-1].nowOff>=d.list[i].nowOff,v);
  assert.equal(d.list[d.defaultIndex].id,'Europe/Budapest');assert.equal(d.list[d.defaultIndex].country,'Hungary');
  assert.equal(d.list.filter(t=>t.country==='Germany').length,1,v);
  same(d.list.filter(t=>t.country==='Australia').map(t=>t.id).slice(0,3),['Australia/Sydney','Australia/Lord_Howe','Antarctica/Macquarie'],v);
  // The list: the event's zone, then the recent ones newest first; the row has the time there and the country.
  let st=P.open('Europe/Budapest',winter);
  let html=P.render(st,{...ctx,recents:['Asia/Tokyo','America/New_York']});
  same([...html.matchAll(/data-action="tzp-pick" data-id="([^"]+)"/g)].map(m=>m[1]),['Europe/Budapest','America/New_York','Asia/Tokyo'],v);
  assert.match(html,/Type country name/);assert.match(html,/<span class="tzp-time">2:00 PM  <i>GMT\+2<\/i> <b>☀<\/b><\/span><span class="tzp-country">Hungary<\/span>/);
  // Suggestions: hours (1 also offers 10-19), countries by start, word or initials.
  same(P.suggestions('Europe/Budapest',winter,'en',now,'usa').map(s=>s[1]),['United States']);
  same(P.suggestions('Europe/Budapest',winter,'en',now,'+5').map(s=>s[1]),['GMT+5']);
  same(P.suggestions('Europe/Budapest',winter,'en',now,'gmt-3').map(s=>s[1]),['GMT-3']);
  assert.ok(P.suggestions('Europe/Budapest',winter,'en',now,'1').map(s=>s[1]).join()=='GMT+14,GMT+13,GMT+12,GMT+11,GMT+10,GMT+1,GMT-1,GMT-10,GMT-11,GMT-12',v);
  assert.ok(P.suggestions('Europe/Budapest',winter,'hu',now,'magy').some(s=>s[1]==='Magyarország'),v);
  assert.equal(P.suggestions('Europe/Budapest',winter,'en',now,'gmt'),null);
  // Typing then picking a suggestion filters the list; nothing matching says so; clearing goes back.
  P.input(st,'jap',ctx);same(st.drop.map(s=>s[1]),['Japan']);
  P.filter(st,0);assert.equal(st.query,'Japan');assert.equal(st.drop,null);
  html=P.render(st,ctx);same([...html.matchAll(/data-id="([^"]+)"/g)].map(m=>m[1]).filter(id=>id.includes('/')),['Asia/Tokyo'],v);
  P.input(st,'zzz',ctx);assert.match(P.render(st,ctx),/class="tzp-empty"[\s\S]*No results found/);
  P.input(st,'+2',ctx);P.filter(st,0);assert.ok([...P.render(st,ctx).matchAll(/data-action="tzp-pick" data-id="([^"]+)"/g)].map(m=>m[1]).includes('Europe/Budapest'),v);
  P.clear(st);assert.equal(st.query,'');assert.match(P.render(st,ctx),/data-id="Europe\/Budapest"/);
  // saveRecentTimezone: the newest last, three at most.
  same(P.saveRecent(null,'Asia/Tokyo'),['Asia/Tokyo']);
  same(P.saveRecent(['A','B','C'],'D'),['B','C','D']);same(P.saveRecent(['A','B','C'],'A'),['B','C','A']);
  const sim=engineSource(v);
  for(const action of ['caltz','tzp-field','tzp-filter','tzp-clear','tzp-pick'])assert.ok(sim.includes(`case '${action}'`),v+' '+action);
  assert.ok(fs.existsSync(`versions/${v}/assets/tzp-ic_search_holo_light.png`)&&fs.existsSync(`versions/${v}/assets/tzp-ic_clear_search_holo_light.png`),v);
}
console.log('calendar-tzpicker ok');
