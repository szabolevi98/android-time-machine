const assert=require('node:assert/strict'),fs=require('node:fs');
// T48 (core part): the apps the limits work touched refuse with the one translated key; no untranslated variant of the
// same meaning is left in them.
const KEY='This feature is not part of the simulator.';
const i18n=fs.readFileSync('i18n.js','utf8'),row=i18n.split('\n').find(l=>l.includes(`'${KEY}': {`));
assert.ok(row,'the common key is in i18n.js');
for(const lang of ['hu','de','fr','es'])assert.match(row,new RegExp(`${lang}: '[^']+'`),lang);
const TOUCHED=['4.0.4/ics-people-io.js','4.3/jb-people-io.js','4.4.4/kk-people-io.js','5.1.1/lp-people-io.js','4.3/calendar.js','4.4.4/calendar.js','4.4.4/kk-gallery.js','4.4.4/kk-camera.js','5.1.1/lp-camera.js','5.1.1/photos.js','5.1.1/lp-dialer-prefs.js','4.4.4/kk-sphere.js','5.1.1/lp-sphere.js'];
for(const file of TOUCHED){
  const s=fs.readFileSync(`versions/${file}`,'utf8');
  assert.doesNotMatch(s,/Not available in this simulator|capture is not simulated/,file);
}
// The shells: People's menus and Email's unavailable rows.
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const s=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  assert.ok(s.includes(`PeopleStrings.t(key), unavailable = '${KEY}'`),v);
  assert.ok(s.includes(`case 'emailpref-unsupported': toast('${KEY}')`),v);
  assert.ok(!/email-unavailable'[^\n]*Not available in this simulator/.test(s),v);
}
assert.ok(!i18n.includes("'Photo Sphere capture is not simulated'"),'the old Photo Sphere refusal is gone');
// T48 (rest): every version's same-meaning refusals ("Unavailable in this simulator", "Not available in this/the
// simulator", Messenger's settings, the 2.3.6 SD card erase) use the key too, and their old rows are gone. Emergency
// calls and the offline texts keep their own (translated) wording.
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(d=>d.isDirectory()?(d.name==='assets'?[]:walk(`${dir}/${d.name}`)):d.name.endsWith('.js')?[`${dir}/${d.name}`]:[]);
for(const file of walk('versions')){
  const s=fs.readFileSync(file,'utf8');
  assert.doesNotMatch(s,/['"]Unavailable in this simulator['"]|Not available in (this|the) simulator|Messenger settings are not part of this simulation|Erasing the SD card is disabled/,file);
}
for(const key of ['Unavailable in this simulator','Not available in the simulator','Not available in this simulator'])assert.ok(!i18n.includes(`'${key}': {`),key);
for(const key of ['Help is not available offline.','Search is not available offline','Emergency calls are unavailable in this simulator.']){
  const r=i18n.split('\n').find(l=>l.includes(`'${key}': {`));assert.ok(r,key);for(const lang of ['hu','de','fr','es'])assert.match(r,new RegExp(`${lang}: '[^']+'`),key+' '+lang);
}
console.log('limits-messages ok');
