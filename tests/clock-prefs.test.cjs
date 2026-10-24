require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// DeskClock's menus, Settings, Night mode, analog style, Home clock and Cities search (T33): 2.0.3 (4.3), 3.0.0 (4.4.4),
// 3.0.4 (5.1.1), each on its own APK's texts (clock-prefs-strings.py).
const plain=x=>JSON.parse(JSON.stringify(x));
for(const [v,p,zones] of [['4.3','jb',84],['4.4.4','kk',85],['5.1.1','lp',85]]){
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/${p}-clock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/${p}-clock-prefs.js`,'utf8'),w);
  const C=w.window.ClockPrefs,data={settings:{autoZone:false,timeZone:'Europe/Budapest'},jbClock:{}},ui={},ctx={data,ui,t:k=>k,locale:'en'};
  // Defaults: digital, automatic home clock on, silence after 10, snooze 10, volume buttons do nothing.
  assert.deepEqual(plain(C.prefs(data)),{style:'digital',autoHome:true,homeZone:'',silence:'10',snooze:10,volume:6,buttons:'0'});
  // The menus: Night mode only off the Alarm tab in 3.x; Cities: Sort (3.x), Settings, Help.
  const actions=(kind,tab)=>C.menu(kind,{...ctx,tab}).map(i=>i[0]);
  assert.deepEqual(plain(actions('main','clock')),['cpref-night','cpref-open','cpref-help']);
  assert.deepEqual(plain(actions('main','alarm')),v==='4.3'?['cpref-night','cpref-open','cpref-help']:['cpref-open','cpref-help']);
  assert.deepEqual(plain(actions('cities','clock')),v==='4.3'?['cpref-open','cpref-help']:['jbclock-city-sort','cpref-open','cpref-help']);
  // Settings: opening stores the phone's zone as the home zone; the zone list is "(GMT+H:MM) label" by offset.
  assert.equal(C.handle('cpref-open','',ctx),'save');assert.equal(ui.sub,'clock-settings');assert.equal(data.jbClock.prefs.homeZone,'Europe/Budapest');
  const list=plain(C.zones(ctx));assert.equal(list.length,zones);
  assert.ok(list.every((z,i)=>!i||list[i-1].offset<=z.offset));assert.match(list.find(z=>z.id==='Asia/Tokyo').label,/^\(GMT\+9:00\) Tokyo/);
  let html=C.settings(ctx);
  assert.equal((html.match(/class="cpref-row"/g)||[]).length,7);assert.match(html,/Digital[\s\S]*cpref-check on[\s\S]*10 minutes[\s\S]*10 minutes/);
  // List dialogs save their pick; the snooze picker wraps 30 → 1; the volume dialog keeps its draft until OK.
  C.handle('cpref-dialog','style',ctx);assert.match(C.settings(ctx),/cpref-dlg[\s\S]*Analog[\s\S]*Digital/);
  C.handle('cpref-pick','analog',ctx);assert.equal(C.prefs(data).style,'analog');assert.equal(ui.clockDialog,'');
  C.handle('cpref-dialog','silence',ctx);C.handle('cpref-pick','-1',ctx);assert.equal(C.summary(ctx,'silence'),'Never');
  C.handle('cpref-dialog','snooze',ctx);for(let i=0;i<21;i++)C.handle('cpref-step','1',ctx);assert.equal(ui.clockDraft,1);
  C.handle('cpref-step','-1',ctx);assert.equal(ui.clockDraft,30);C.handle('cpref-save','snooze',ctx);assert.equal(C.prefs(data).snooze,30);assert.equal(C.summary(ctx,'snooze'),'30 minutes');
  C.handle('cpref-dialog','volume',ctx);ui.clockDraft=3;assert.equal(C.back(ui),true);assert.equal(C.prefs(data).volume,6);
  C.handle('cpref-dialog','buttons',ctx);C.handle('cpref-pick','2',ctx);assert.equal(C.summary(ctx,'buttons'),'Dismiss');assert.equal(C.prefs(data).buttons,'2');
  // The Home clock: only while the phone's zone differs from the home zone, and only with the automatic home clock on.
  assert.equal(C.home(data),null);
  C.handle('cpref-dialog','zone',ctx);C.handle('cpref-pick','Asia/Tokyo',ctx);assert.deepEqual(plain(C.home(data)),{zone:'Asia/Tokyo',label:'Home'});
  C.handle('cpref-toggle','autoHome',ctx);assert.equal(C.home(data),null);assert.match(C.settings(ctx),/data-id="zone" disabled/);
  // The analog clock and Night mode.
  const now=new Date(2026,9,24,3,30,15);
  assert.match(C.analog(now),new RegExp(`clock_analog_dial\\.png[\\s\\S]*clock_analog_hour\\.png" alt="" style="transform:rotate\\(105deg\\)[\\s\\S]*clock_analog_minute\\.png" alt="" style="transform:rotate\\(181\\.5deg\\)[\\s\\S]*animation-delay:-15s`));
  C.handle('cpref-night','',ctx);assert.equal(ui.sub,'night');
  assert.match(C.night({...ctx,now,hour24:true,date:'SAT'}),/cpref-night"[\s\S]*data-cpref-analog/);
  C.handle('cpref-night-end','',ctx);assert.equal(ui.sub,'clock-settings');
  assert.deepEqual(plain(C.handle('cpref-help','',ctx)),{open:'http'+(v==='4.3'?'':'s')+'://support.google.com/mobile/?p=clock_main'});
  for(const n of ['dial','hour','minute','second'])assert.ok(fs.existsSync(`versions/${v}/assets/${v==='5.1.1'?'dc5':'jbclock'}-clock_analog_${n}.png`),n);
  // simulator.js: the menu, the screens, the snooze length, Silence after and the volume keys.
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  for(const bit of ["case 'jbclock-menu': ui.overlay = 'cpref-main'","ClockPrefs.handle(action, id, {data, ui})","ClockPrefs.prefs(data).snooze*60000","clockSilenceTimer = setTimeout","buttons === '1' ? 'alarm-snooze' : 'alarm-dismiss'","ClockPrefs.settings(","ClockPrefs.night(","clockExtras("])assert.ok(sim.includes(bit),`${v} ${bit}`);
  assert.doesNotMatch(sim,/'jbclock-menu': toast/);
}
console.log('clock-prefs ok');
