const assert=require('node:assert/strict'),fs=require('node:fs');
const engineSource = require('./lib/engine-source.cjs');
// The KitKat and Lollipop drawers hold the launcher activities their factory images enable after setup (KTU84P on the
// Nexus 5, LMY48Y on the Nexus 6): no AOSP Browser, Messaging (KitKat), Gallery (Lollipop) or Music, and no Cloud Print,
// whose launcher alias is off from API 19 (@bool/launcher_enabled).
const ids=v=>{const s=engineSource(v),i=s.indexOf('const apps = ['),j=s.indexOf('];',i);return [...s.slice(i,j).matchAll(/\['([a-z0-9-]+)', '/g)].map(m=>m[1]).sort();};
assert.deepEqual(ids('4.4.4'),['calculator','calendar','camera','chrome','clock','downloads','drive','earth','email','gallery','gmail','google-plus','google-search','google-settings','hangouts','keep','maps','news-weather','newsstand','people','phone','photos','play-books','play-games','play-movies','play-music','play-store','quickoffice','settings','voice-search','wallet','youtube']);
assert.deepEqual(ids('5.1.1'),['calculator','calendar','camera','chrome','clock','docs','downloads','drive','earth','email','fit','gmail','google-plus','google-search','google-settings','hangouts','keep','maps','messaging','news-weather','newsstand','people','phone','photos','play-books','play-games','play-movies','play-music','play-store','settings','sheets','slides','voice-search','wallet','youtube']);
for(const v of ['4.4.4','5.1.1']){
  const s=engineSource(v);
  assert.match(s,/type: 'music', name: 'Google Play Music', app: 'play-music'/,v);
  assert.equal(/type: 'photo'/.test(s),v==='4.4.4',v+' photo widget only where Gallery ships');
  assert.ok(!fs.readFileSync(`versions/${v}/play-store.js`,'utf8').includes("id:'browser'"),v);
}
for(const f of ['newsstand.png','quickoffice.png','wallet.png'])assert.ok(fs.existsSync('versions/4.4.4/assets/'+f),f);
console.log('factory-drawers ok');
