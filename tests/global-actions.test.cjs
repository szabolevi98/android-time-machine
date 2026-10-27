require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=v=>{const context={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/global-actions.js`,'utf8'),context);return context.window.GlobalActions;};
const ics=load('4.0.4'),jb=load('4.3'),gb=load('2.3.6'),lp=load('5.1.1'),t=k=>k,plain=v=>JSON.parse(JSON.stringify(v));
{const strip=f=>fs.readFileSync(f,'utf8').replace(/\r\n/g,'\n').replace(/\/\*[\s\S]*?\*\//,'');assert.equal(strip('versions/4.4.4/global-actions.js'),strip('versions/4.3/global-actions.js'),'4.4.4: same code as 4.3, only the header differs');}
// createDialog() order: power off, airplane mode, bug report (4.2+ and only when enabled), silent mode; 4.0.4 has no bug report.
assert.deepEqual(plain(jb.items({bugreport:true}).map(i=>i.id)),['power','airplane','bugreport','ringer']);
assert.deepEqual(plain(jb.items({bugreport:false}).map(i=>i.id)),['power','airplane','ringer']);
assert.deepEqual(plain(ics.items({bugreport:true}).map(i=>i.id)),['power','airplane','ringer']);
assert.equal(jb.items({airplane:true})[1].status,'Airplane mode is ON');
assert.equal(jb.KEY_TIMEOUT,500);assert.equal(jb.DISMISS_DELAY,300);
// SilentModeTriStateAction indices follow AudioManager.RINGER_MODE_*, stored as the Sound settings' silent mode.
assert.deepEqual(plain(jb.RINGER.map(r=>r[0])),['silent','vibrate','normal']);
for(const mode of ['silent','vibrate','normal']){const s={};jb.setRinger(s,mode);assert.equal(jb.ringerOf(s),mode);}
const menu=jb.menu({ringer:'vibrate'},t);
assert.ok(menu.includes('data-id="vibrate" role="radio" aria-checked="true"')&&menu.includes('data-id="normal" role="radio" aria-checked="false"'));
assert.ok(menu.includes('assets/ga-ic_lock_airplane_mode_off.png'));
// ShutdownThread: Cancel on the left, OK on the right; the safe mode and bug report variants.
const confirm=jb.confirm('shutdown',t);assert.ok(confirm.indexOf('>Cancel<')<confirm.indexOf('>OK<')&&confirm.includes('Your phone will shut down.'));
assert.ok(jb.confirm('safemode',t).includes('Reboot to safe mode')&&jb.confirm('bugreport',t).includes('>Report<'));
assert.ok(jb.progress(t).includes('Shutting down…')&&jb.boot().includes('ga-boot-frame'));
assert.ok(!('safemode' in ics.CONFIRM)&&!('bugreport' in ics.CONFIRM),'4.0.4: no safe-mode reboot or bug report');
for(const v of ['4.0.4','4.3','4.4.4'])for(const f of ['ga-dialog_full_holo_dark','ga-ic_lock_power_off','ga-spinner_48_outer_holo','stat_sys_ringer_vibrate','stat_sys_alarm'])assert.ok(fs.existsSync(`versions/${v}/assets/${f}.png`),`${v} ${f}`);
// Each image's own framework-res art: xhdpi on the Galaxy Nexus and Nexus 4, xxhdpi on the Nexus 5.
{const size=f=>{const b=fs.readFileSync(f);return [b.readUInt32BE(16),b.readUInt32BE(20)];};
assert.deepEqual(size('versions/4.3/assets/ga-ic_lock_power_off.png'),[64,64]);assert.deepEqual(size('versions/4.4.4/assets/ga-ic_lock_power_off.png'),[96,96]);
assert.ok(fs.readFileSync('versions/4.4.4/global-actions.css','utf8').includes("ga-dialog_full_holo_dark.png') 30 fill"));
assert.ok(fs.readFileSync('versions/4.0.4/global-actions.css','utf8').includes('padding:calc(6.353 * var(--dp)) 0 calc(6.353 * var(--dp)) calc(16.9412 * var(--dp))'),'4.0.4 row: 16dp start padding, no 56dp icon box');}
// Gingerbread: the list is a GBUI dialog; only the key hold, shutdown and boot come from here.
assert.deepEqual(Object.keys(gb).sort(),['BOOT_MS','KEY_TIMEOUT','SHUTDOWN_MS','boot','hold','playBoot']);
// Lollipop: Power off and, when enabled, Take bug report with ic_lock_bugreport; no airplane or ringer rows.
assert.deepEqual(plain(lp.items({bugreport:true}).map(i=>[i.id,i.icon,i.message])),[['power','lp-fw-ic_lock_power_off.png','Power off'],['bugreport','lp-fw-ic_lock_bugreport.svg','Take bug report']]);
assert.ok(!lp.menu({},t).includes('ga-silent')&&!lp.progress(t).includes('<img'));
for(const f of ['lp-fw-ic_lock_power_off.png','lp-fw-ic_lock_bugreport.svg'])assert.ok(fs.existsSync(`versions/5.1.1/assets/${f}`),f);
assert.ok(!fs.readFileSync('versions/5.1.1/lp-dialogs.css','utf8').includes('.ga-'),'the LP power dialogs live in their own global-actions.css');
// Boot animations from each image's bootanimation.zip: desc.txt's fps and parts ("c" parts only from 4.3 on).
const bootData=v=>{const w={};vm.runInNewContext(fs.readFileSync(`versions/${v}/boot-animation.js`,'utf8'),{window:w});return w.BootAnimationData;};
const shape={'2.3.6':[30,'p1 p0'],'4.0.4':[24,'p0'],'4.3':[24,'p1 c0 c0'],'4.4.4':[24,'p1 p0'],'5.1.1':[30,'c1 c1 c0 c1 c1 c1']};
for(const [v,[fps,parts]] of Object.entries(shape)){const d=bootData(v);assert.equal(d.fps,fps,v);assert.equal(d.parts.map(p=>(p.complete?'c':'p')+p.count).join(' '),parts,v);
  for(const p of d.parts){assert.ok(fs.existsSync(`versions/${v}/${p.sheet}`),`${v} ${p.sheet}`);assert.ok(p.cols*p.rows>=p.frames);}}
// movie(): after the exit request a "c" loop finishes and the later parts play; a "p" loop stops at once.
async function playOrder(v,exitAfter,frames){
  const data=bootData(v);data.fps=1000;
  const shown=[],view={style:{set backgroundImage(u){const m=u.match(/boot-(part\d)/);if(frames)frames[m[1]]=(frames[m[1]]||0)+1;if(shown.at(-1)!==m[1])shown.push(m[1]);}}};
  const w={BootAnimationData:data};
  const ctx={window:w,Image:class{decode(){return Promise.resolve();}},setTimeout,clearTimeout,Promise,performance};
  vm.runInNewContext(fs.readFileSync(`versions/${v}/global-actions.js`,'utf8'),ctx);
  await new Promise(resolve=>w.GlobalActions.playBoot({querySelector:()=>view},resolve,exitAfter));
  return shown.join(' ');
}
(async()=>{
  assert.equal(await playOrder('5.1.1',150),'part0 part1 part2 part3 part4 part5');
  assert.equal(await playOrder('4.3',100),'part0 part1 part2');
  assert.equal(await playOrder('2.3.6',1500),'part0 part1');assert.equal(await playOrder('4.0.4',50),'part0');
  // The boot completes at the end of a loop: with the system already booted the looping part still plays once, whole,
  // "p" (2.3.6, 4.0.4, 4.4.4) as well as "c"; a promise of the boot (the cold start's page load) works as the delay does.
  for(const v of ['2.3.6','4.0.4','4.3','4.4.4','5.1.1']){const frames={},d=bootData(v);await playOrder(v,Promise.resolve(),frames);
    d.parts.forEach((p,i)=>assert.equal(frames[`part${i}`],p.count?p.count*p.frames:p.frames,`${v} part${i}`));}
  {const frames={};await playOrder('2.3.6',30,frames);assert.equal(frames.part1%49,0,'2.3.6: the looping X shine is not cut off half-way');}
  // Cold start: a new tab boots each version once (sessionStorage), after the first render, into the lock screen.
  for(const v of ['2.3.6','4.0.4','4.3','4.4.4','5.1.1']){const src=fs.readFileSync(`versions/${v}/simulator.js`,'utf8').replace(/\r\n/g,'\n');
    assert.ok(src.includes(`AndroidBoot.shouldBoot('${v}')`)&&src.includes('AndroidBoot.prepare'),v);
    assert.ok(/\n  render\(\);\n  coldBoot\(\);\n\}\)\(\);\s*$/.test(src),`${v}: coldBoot after the first render`);
    assert.ok(/const finish = \(\) => \{[^\n]*lockScreen\(\)/.test(src),`${v}: the boot ends on the lock screen`);}
  console.log('Global actions checks passed: item order per version, ringer modes, dialogs, assets and boot animations.');
})().catch(error=>{console.error(error);process.exit(1);});
