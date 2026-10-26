require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Google Now reminders and card settings (audit step 5): Velvet 3.3.11 (4.4.4) and 4.1.29 (5.1.1).
for(const [v,third] of [['4.4.4','Weekend'],['5.1.1','Occasionally']]){
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/gel-now.js`,'utf8'),w);
  const N=w.window.GELNow,now=new Date(2026,9,7,19,7),t=k=>k;
  assert.equal(w.window.StockStrings.google['Day 2'].en,third,v);
  // A new draft starts on the next symbolic time (Night, 20:00, at 19:07), or tomorrow morning after it.
  assert.deepEqual({...N.draftFrom(null,now)},{title:'',day:0,slot:3});
  assert.deepEqual({...N.draftFrom(null,new Date(2026,9,7,21,0))},{title:'',day:1,slot:0});
  assert.deepEqual({...N.draftReminder({day:1,slot:2},now)},{date:'2026-10-08',time:'17:00'});
  assert.deepEqual({...N.draftReminder({day:0,slot:4},now)},{date:'2026-10-07',time:''});
  assert.equal(N.draftReminder({day:3,slot:0},now),null);assert.equal(N.draftReminder({day:0,slot:5},now),null);
  if(v==='4.4.4')assert.equal(N.draftReminder({day:2,slot:0},now).date,'2026-10-10');else assert.equal(JSON.stringify(N.draftReminder({day:2,slot:0},now)),JSON.stringify({date:'2026-10-07',time:'',occasionally:true}));
  const data={events:[],nowReminders:[{id:'r1',title:'Call the dentist',date:'2026-10-08',time:'17:00'},{id:'r0',title:'Old',date:'2026-10-01',time:'09:00'}]};
  // The Now stream shows upcoming reminders as cards with the card menu; the weather card turns round to the units question.
  const page=N.render({data,t,locale:'en-US',now,ui:{}});
  assert.match(page,/gnow-reminder[\s\S]*Call the dentist[\s\S]*Tomorrow, 5:00 PM|gnow-reminder[\s\S]*Call the dentist[\s\S]*Tomorrow, 5:00 PM/);assert.doesNotMatch(page,/>Old</);
  assert.match(page,/data-action="gnow-reminder-menu" data-id="r1"/);assert.match(page,/data-action="gnow-card-back" data-id="weather"/);
  assert.match(N.render({data,t,locale:'en-US',now,ui:{gnowBack:'weather'}}),/Weather units[\s\S]*Celsius[\s\S]*Fahrenheit/);
  assert.match(N.render({data:{...data,nowUnits:1},t,locale:'en-US',now,ui:{}}),/<b>70°<\/b>/);
  assert.match(N.render({data,t,locale:'en-US',now,ui:{gnowDialog:'r1'}}),/Delete this reminder\?[\s\S]*gnow-reminder-delete" data-id="r1"/);
  // The reminders list: Upcoming and Past, the editor with its spinners.
  const list=N.reminders({data,t,locale:'en-US',now,ui:{}});
  assert.match(list,/Upcoming[\s\S]*Call the dentist[\s\S]*Past[\s\S]*Old/);assert.match(list,/gnow-reminder-new/);
  assert.match(N.reminders({data:{},t,locale:'en-US',now,ui:{}}),/You don't have any upcoming reminders|You don&#39;t have any upcoming reminders/);
  const ed=N.reminders({data,t,locale:'en-US',now,ui:{gnowDraft:N.draftFrom(null,now),gnowSpin:'time'}});
  assert.match(ed,/Add a title[\s\S]*When[\s\S]*Where/);assert.equal((ed.match(/gnow-reminder-pick/g)||[]).length,6);assert.match(ed,/Set time…/);
  // The simulator wires the actions.
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  for(const a of ['gnow-reminders','gnow-reminder-new','gnow-reminder-set','gnow-reminder-delete','gnow-card-back','gnow-units'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
}
console.log('now-reminders ok');
