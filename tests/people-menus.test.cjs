require('./lib/vm-strings.cjs');
const engineSource=require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// People per image: the words of each image's contacts app (people-strings.js), the menus its code builds and its
// ContactDeletionInteraction; Gingerbread uses its own AlertDialog and keeps only the shared removal in people.js.
const strings=v=>{const c={window:{AndroidI18n:{language:'hu'}}};vm.runInNewContext(fs.readFileSync(`versions/${v}/people-strings.js`,'utf8'),c);return c.window.PeopleStrings;};
for(const [v,shortcut,title] of [['4.0.4',false,true],['4.3',true,false],['4.4.4',true,false],['5.1.1',true,false]]){
  const P=strings(v),sim=engineSource(v),index=fs.readFileSync(`versions/${v}/index.html`,'utf8');
  assert.equal(P.has('Place on Home screen'),shortcut,`${v} shortcut`);assert.equal(P.has('Delete contact?'),title,`${v} delete title`);
  assert.equal(P.t('This contact will be deleted.'),'A névjegy törlésre kerül.');assert.equal(P.t('Cancel'),'Mégse');
  assert.ok(index.indexOf('people-strings.js')>0&&index.indexOf('people-strings.js')<index.indexOf('people.js'),`${v} loads people-strings.js first`);
  assert.equal((sim.match(/if \(ui\.overlay === 'people-delete'\)/g)||[]).length,1,`${v} one delete dialog`);
  assert.doesNotMatch(sim,/Messages will be kept under the phone number|Sharing is not available offline/);
  if(v!=='5.1.1'){assert.match(sim,/people-voicemail/);assert.match(sim,/people-list-menu/);assert.doesNotMatch(fs.readFileSync(`versions/${v}/people.js`,'utf8'),/people-delete" data-action/);}
}
const gb=fs.readFileSync('versions/2.3.6/simulator.js','utf8');
assert.match(gb,/deleteConfirmation_title/);assert.doesNotMatch(gb,/case 'people-group':|ICSPeople\.render/);
assert.ok(!fs.existsSync('versions/2.3.6/people.css'));
const c={window:{}};vm.runInNewContext(fs.readFileSync('versions/2.3.6/people.js','utf8'),c);assert.deepEqual(Object.keys(c.window.ICSPeople),['remove']);
console.log('People checks passed: per-image strings, menus and delete dialogs; Gingerbread cleaned up.');
