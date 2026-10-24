require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// The images' ringtones, notification sounds and alarms (docs/tools/sounds.py, docs/tools/sounds-transcode.mjs): every version's
// sounds.js names its build.prop defaults, each title and file name points to a non-empty WebM in assets/audio, the
// Settings ringtone lists and Gingerbread's list can find every tone they offer, and the ringing screens are watched.
const load=v=>{const w={};vm.runInNewContext(fs.readFileSync(`versions/${v}/sounds.js`,'utf8'),{window:w,document:{addEventListener(){},body:{},querySelector(){return null;}},MutationObserver:class{observe(){}},requestAnimationFrame(){}});return w.SystemSounds;};
const defaults={'2.3.6':['Sceptrum','Castor','Alarm_Classic'],'4.0.4':['Girtab','Proxima','Cesium'],'4.3':['Themos','Tejat','Oxygen'],'4.4.4':['Titania','Tethys','Oxygen'],'5.1.1':['Titania','Tethys','Oxygen']};
for(const [v,[ring,note,alarm]] of Object.entries(defaults)){
  const S=load(v);
  assert.deepEqual({...S.DEFAULTS},{ringtones:ring,notifications:note,alarms:alarm},v);
  for(const cat of ['ringtones','notifications','alarms'])for(const [base,[title,name]] of Object.entries(S.SOUNDS[cat])){
    const file=`assets/audio/${name}.webm`;assert.ok(fs.existsSync(file),file);assert.ok(fs.statSync(file).size>500,`${file} is empty`);
    assert.equal(S.asset(cat,base),name);assert.equal(S.asset(cat,title),name);assert.ok(name.startsWith(base+'-'));
  }
  for(const cat of ['ringtones','notifications','alarms'])assert.ok(S.asset(cat,S.DEFAULTS[cat]),`${v} default ${cat}`);
  const src=fs.readFileSync(`versions/${v}/sounds.js`,'utf8');assert.ok(src.includes("'.gbdc-ring, .dcal-ics, .dcal-glow, .dcal-lp'"));
  assert.ok(fs.readFileSync(`versions/${v}/index.html`,'utf8').includes('<script defer src="sounds.js'),v);
}
// The 4.x Settings lists mark their form and offer only tones the image has.
for(const v of ['4.0.4','4.3','4.4.4']){
  const src=fs.readFileSync(`versions/${v}/settings-detail.js`,'utf8'),S=load(v);
  assert.ok(src.includes('data-form="sd-choice" data-sound="${field}"'),v);
  for(const list of ['RINGTONES','NOTIFICATIONS']){const m=src.match(new RegExp(`(?:const |,)${list}=(\\[[^\\]]*\\])`));for(const title of JSON.parse(m[1]))assert.ok(S.asset(list==='RINGTONES'?'ringtones':'notifications',title),`${v} ${title}`);}
}
{const src=fs.readFileSync('versions/5.1.1/settings-detail.js','utf8'),S=load('5.1.1');assert.ok(src.includes(`data-sound="\${field==='vmTone'?'notificationTone':field}"`));
  for(const [cat,list] of [['ringtones',src.match(/\['None',('Atria'[^\]]*)\]/)[1]],['notifications',src.match(/\['None',('Ariel'[^\]]*)\]/)[1]]])for(const title of list.split(',').map(x=>x.trim().slice(1,-1)))assert.ok(S.asset(cat,title),`5.1.1 ${title}`);}
// Gingerbread's list passes file names (gbset-sound-pick ringtone:<file>).
{const src=fs.readFileSync('versions/2.3.6/gb-settings.js','utf8'),S=load('2.3.6');
  for(const [list,cat] of [['RINGTONE_TITLES','ringtones'],['NOTIFICATION_TITLES','notifications']])for(const [file] of JSON.parse(src.match(new RegExp(`const ${list} = (\\[.*?\\]\\]);`))[1].replace(/'/g,'"')))assert.ok(S.asset(cat,file),`2.3.6 ${file}`);}
console.log('sounds: ok');
