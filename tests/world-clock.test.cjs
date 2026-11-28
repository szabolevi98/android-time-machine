require('./lib/vm-strings.cjs');
const engineSource=require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// World clock: each image's cities.xml (dc-cities.js) and its DeskClock's CitiesActivity / world clock rows.
for(const [v,file,count,selected] of [['4.3','jb-deskclock.js',280,false],['4.4.4','kk-deskclock.js',299,true],['5.1.1','lp-deskclock.js',300,true]]){
  const c={window:{},Intl,Date,CSS:{escape:x=>x}};vm.runInNewContext(fs.readFileSync(`versions/${v}/dc-cities.js`,'utf8'),c);vm.runInNewContext(fs.readFileSync(`versions/${v}/${file}`,'utf8'),c);
  const D=c.window.JBDeskClock,cities=c.window.DeskClockCities;
  assert.equal(cities.length,count,`${v} cities`);
  const tokyo=cities.find(r=>r[2]==='Tokyo');assert.equal(tokyo[1],'Asia/Tokyo');assert.equal(tokyo[3],'Tokió');
  const now=new Date(Date.UTC(2026,9,7,12,0));
  const t=D.cityTime('Asia/Tokyo',now,true,'en-US');assert.equal(`${t.hours}:${t.minutes}`,'21:00');
  assert.doesNotThrow(()=>D.cityTime('America/Chihuaha',now,true,'en-US'));
  const html=D.cities({cities:[tokyo[0]]},k=>k,{locale:'hu-HU',now,hour24:true,words:{title:'Városok',selected:'Kiválasztott városok'}});
  assert.match(html,/data-action="jbclock-city" data-id="C139"[^>]*aria-checked="true"/);
  assert.equal(/Kiválasztott városok/.test(html),selected,`${v} Selected Cities header`);
  const index=fs.readFileSync(`versions/${v}/index.html`,'utf8');assert.ok(index.indexOf('dc-cities.js')>0&&index.indexOf('dc-cities.js')<index.indexOf(file));
  assert.doesNotMatch(engineSource(v),/case 'jbclock-cities': case 'jbclock-menu'/);
}
console.log('World clock checks passed: cities per image, times, selection, headers.');
