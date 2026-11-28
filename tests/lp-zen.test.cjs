require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Lollipop Interruptions (versions/5.1.1/lp-zen.js): ZenModeSettings, ZenModeConditionSelection and Downtime as the
// android-5.1.1_r26 Settings and DowntimeConditionProvider have them.
const w={};vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-zen.js','utf8'),{window:w});
const Z=w.LPZen,t=k=>k,plain=v=>JSON.parse(JSON.stringify(v));
const at=(y,m,d,h,min=0)=>new Date(y,m-1,d,h,min).getTime(),MIN=60000,HOUR=60*MIN;
// default_zen_mode_config.xml and ZenModeConfig: no calls or messages, events on, from anyone, 22:00-07:00, no days.
assert.deepEqual(plain(Z.config({})),{calls:false,messages:false,events:true,from:'anyone',days:[],start:'22:00',end:'07:00',sleepNone:false});
assert.ok(engineSource('5.1.1').includes("zenEvents: true, zenCalls: false, zenMessages: false"));
// Days come back Monday first (ZenModeDowntimeDaysSelection.DAYS); Calendar numbers, 1 = Sunday.
assert.deepEqual(plain(Z.config({zenDays:[1,7,2]}).days),[2,7,1]);
// DowntimeCalendar: a Monday downtime 22:00-07:00 runs into Tuesday morning; Tuesday evening is not chosen.
// 2026-10-05 was a Monday.
{const c=Z.config({zenDays:[2]});
  assert.deepEqual(plain(Z.downtimeAt(c,at(2026,10,5,23))),{start:at(2026,10,5,22),end:at(2026,10,6,7)});
  assert.ok(Z.downtimeAt(c,at(2026,10,6,6,59))&&!Z.downtimeAt(c,at(2026,10,6,7))&&!Z.downtimeAt(c,at(2026,10,6,22,30))&&!Z.downtimeAt(c,at(2026,10,5,21,59)));
  assert.equal(Z.nextStart(c,at(2026,10,6,8)),at(2026,10,12,22));
  // The same start and end make a whole day; an end after the start stays on the day.
  assert.deepEqual(plain(Z.downtimeAt(Z.config({zenDays:[2],zenStart:'09:00',zenEnd:'09:00'}),at(2026,10,6,8))),{start:at(2026,10,5,9),end:at(2026,10,6,9)});
  assert.ok(!Z.downtimeAt(Z.config({zenDays:[2],zenStart:'09:00',zenEnd:'17:00'}),at(2026,10,5,17)));}
// ZenModeConditionSelection: Indefinitely, 8 h down to 15 min (line1 texts), Downtime within 4 h of its start, the next
// alarm within 12 h.
{const now=at(2026,10,5,19),s={zenMode:'priority',zenDays:[2]};
  assert.deepEqual(plain(Z.conditions(s,now,0).map(c=>Z.labelOf(c.label,k=>k))),['Indefinitely','For %d hours'.replace('%d',8),'For 4 hours','For 3 hours','For 2 hours','For one hour','For 45 minutes','For 30 minutes','For 15 minutes','Until your downtime ends']);
  assert.equal(Z.conditions(s,at(2026,10,5,17),0).length,9,'no downtime more than 4 h before it starts');
  const list=Z.conditions({zenMode:'none'},now,at(2026,10,6,6,30));assert.equal(list.at(-1).id,'alarm');assert.equal(list[5].until,now+HOUR);
  assert.ok(!Z.conditions({},now,at(2026,10,6,8)).some(c=>c.id==='alarm'),'an alarm 13 h away is not offered');
  // Downtime with "None" ends at an alarm before its end.
  assert.equal(Z.conditions({zenMode:'none',zenDays:[2],zenSleepNone:true},now,at(2026,10,6,6)).find(c=>c.id==='downtime').until,at(2026,10,6,6));}
// tick: a countdown ends the mode; entering a downtime switches to its mode once, and not again after a manual change.
{const s={zenMode:'priority',zenExit:{kind:'countdown',until:at(2026,10,5,20)}};
  assert.equal(Z.tick(s,at(2026,10,5,19,59),0),false);assert.equal(Z.tick(s,at(2026,10,5,20),0),true);assert.equal(s.zenMode,'all');assert.equal(s.zenExit,null);
  const d={zenMode:'all',zenDays:[2]};
  assert.equal(Z.tick(d,at(2026,10,5,21,59),0),false);
  assert.equal(Z.tick(d,at(2026,10,5,22),0),true);assert.equal(d.zenMode,'priority');assert.equal(d.zenExit.until,at(2026,10,6,7));
  d.zenMode='all';d.zenExit=null;assert.equal(Z.tick(d,at(2026,10,5,23),0),false,'mDowntimed: no second autotrigger');
  assert.equal(Z.tick(d,at(2026,10,6,7,1),0),false);assert.ok(!('zenDowntimed' in d));
  const n={zenMode:'all',zenDays:[2],zenSleepNone:true};Z.tick(n,at(2026,10,5,22),at(2026,10,6,6,30));
  assert.equal(n.zenMode,'none');assert.equal(n.zenExit.until,at(2026,10,6,6,30));
  assert.equal(Z.tick(n,at(2026,10,6,6,30),0),true);assert.equal(n.zenMode,'all');}
// updateEndSummary and updateDays.
{const end=s=>Z.endText(Z.config(s),k=>k,'en-US',true);
  assert.equal(end({}),'%s next day'.replace('%s','07:00'));assert.equal(end({zenStart:'09:00',zenEnd:'17:00'}),'17:00');
  assert.equal(end({zenSleepNone:true}),'07:00 next day or any alarm before');assert.equal(end({zenSleepNone:true,zenStart:'09:00',zenEnd:'17:00'}),'17:00 or any alarm before');
  assert.equal(Z.daysText(Z.config({zenDays:[1,2,4]}),k=>k,'en-US'),'Mon, Wed, Sun');assert.equal(Z.daysText(Z.config({}),k=>k,'en-US'),'None');}
// The page: the from list needs calls or messages, the times and the downtime mode need days; no Automation category.
{const page=s=>Z.page(s,{t,locale:'en-US',hour24:true});
  assert.ok(page({}).includes('data-id="from" disabled')&&!page({zenCalls:true}).includes('data-id="from" disabled'));
  assert.ok(page({}).includes('data-id="start" disabled')&&page({}).includes('data-id="downtime" disabled'));
  assert.ok(!page({zenDays:[2],zenCalls:true}).includes('disabled'));
  assert.ok(!page({}).includes('Automation'));
  const order=['When calls and notifications arrive','Priority interruptions','Events and reminders','Calls','Messages','Calls/messages from','Alarms are always priority interruptions','Downtime','Days','Start time','End time','Interruptions allowed'];
  const html=page({});let last=-1;for(const title of order){const i=html.indexOf(`>${title}<`);assert.ok(i>last,title);last=i;}}
// Every text the module asks for is in the image's strings (lp-strings.js).
{let table={};vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-strings.js','utf8'),{window:{AndroidI18n:{extend:t=>{table=t;}}}});
  const known=new Set(Object.keys(table));
  const src=fs.readFileSync('versions/5.1.1/lp-zen.js','utf8');
  for(const key of ['Indefinitely','For %d minutes','For one hour','For %d hours','Until your downtime ends','Until next alarm','When calls and notifications arrive','Priority interruptions','Events and reminders','Calls','Messages','Calls/messages from','Anyone','Starred contacts only','Contacts only','Alarms are always priority interruptions','Downtime','Days','Start time','End time','Interruptions allowed','Priority only','None','%s next day','%s or any alarm before','%s next day or any alarm before','Always interrupt','Allow only priority interruptions',"Don't interrupt",'CANCEL','OK']){
    assert.ok(known.has(key),`lp-strings.js lacks ${key}`);assert.ok(src.includes(key),key);}}
console.log('LP Interruptions checks passed: defaults, downtime windows, conditions, autotrigger, summaries, page and strings.');
