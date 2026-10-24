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
console.log('limits-messages ok');
