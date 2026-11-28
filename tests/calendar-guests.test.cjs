require('./lib/vm-strings.cjs');
const engineSource=require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Calendar (audit step 6): guests, Show me as / Privacy (5.1: Visibility) and the event's time zone (4.3 / 4.4.4: the
// TimeZonePickerDialog button, tzpicker.js, and the details in the device's zone (4.3 / 4.4.4 with its short name,
// 5.1.1 without a zone suffix); 4.0.4 retains the zone list.
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w={window:{AndroidI18n:{language:'en'},ICSSystemSettings:{zone:()=>'Europe/Budapest'}}};w.window.window=w.window;
  const JB=v==='4.3'||v==='4.4.4';
  const PICKER=JB||v==='5.1.1';
  for(const f of ['stock-strings.js',PICKER?'tzpicker.js':'calendar-timezones.js','calendar.js'])vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);
  const C=w.window.ICSCalendar,t=k=>k,LP=v==='5.1.1',zone=PICKER?/Japan Standard Time  <i>GMT\+9<\/i>/:/\(GMT\+9:00\) Tokyo/;
  if(!PICKER)assert.equal(w.window.CalendarTimezones.length,83);
  const draft={date:'2026-10-08',title:'x',guests:'alex@example.com',tz:'Asia/Tokyo',availability:1,privacy:2};
  const ed=C.render({events:[],calendarMode:'Month'},{sub:'event-edit',selectedDate:'2026-10-08',eventDraft:draft},t,'en-US',new Date(2026,9,8));
  assert.match(ed,/name="tz" value="Asia\/Tokyo"/);assert.match(ed,zone);assert.match(ed,/name="guests"[^>]*value="alex@example\.com"/);
  if(LP)assert.match(ed,/name="visibility" value="2:1"[\s\S]*Public - Available/);
  else{assert.match(ed,/name="availability" value="1"[\s\S]*Available[\s\S]*name="privacy" value="2"[\s\S]*Public/);assert.match(ed,/All day[\s\S]*Time zone[\s\S]*Guests[\s\S]*name="description"[\s\S]*name="repeat"[\s\S]*name="reminder"[\s\S]*Show me as[\s\S]*Privacy/);}
  if(!PICKER)assert.equal(C.spinner('tz',draft,'en-US',t).length,83);else assert.match(ed,/data-action="caltz" data-id="Asia\/Tokyo"/);assert.deepEqual(Array.from(C.spinner('availability',draft,'en-US',t),i=>i.label),['Busy','Available']);
  const n=C.normalize({date:'2026-10-08',availability:'1',privacy:'5',tz:'Europe/Paris'});assert.equal(n.availability,1);assert.equal(n.privacy,0);assert.equal(n.tz,'Europe/Paris');assert.equal(n.guests,'');
  const info=C.render({events:[{id:1,...draft,time:'10:00',endTime:'11:00',endDate:'2026-10-08',repeat:'none',reminder:-1}],calendarMode:'Month'},{sub:'event',selectedEvent:1,selectedDate:'2026-10-08'},t,'en-US',new Date(2026,9,8));
  assert.match(info,/alex@example\.com/);if(JB)assert.match(info,/Thursday, October 8, 2026, 03:00 – 04:00<span class="cal-tz">  CEST<\/span>/);else if(LP){assert.match(info,/Thursday, October 8, 2026<small>03:00 – 04:00<\/small>/);assert.doesNotMatch(info,/Japan Standard Time|GMT\+9|CEST/);assert.match(ed,/assets\/gc5-ic_link\.png/);}else assert.match(info,zone);
  if(LP){
    const details=item=>C.render({events:[{id:2,title:'Boundary',repeat:'none',reminder:-1,...item}]},{sub:'event',selectedEvent:2},t,'en-US');
    // Zone conversion may cross the year boundary; all-day dates must never move with it.
    assert.match(details({date:'2027-01-01',endDate:'2027-01-01',time:'01:30',endTime:'02:30',tz:'Asia/Tokyo'}),/Thursday, December 31, 2026<small>17:30 – 18:30<\/small>/);
    const allDay=details({date:'2027-01-01',endDate:'2027-01-02',time:'01:30',endTime:'02:30',tz:'Asia/Tokyo',allDay:true});
    assert.match(allDay,/Friday, January 1, 2027 – Saturday, January 2, 2027/);assert.doesNotMatch(allDay,/17:30|GMT|December 31/);
  }
  const sim=engineSource(v);assert.ok(sim.includes("event.guests=String(values.get('guests')||'').trim();event.tz=String(values.get('tz')||'');"),v);
  assert.ok(fs.readFileSync(`versions/${v}/index.html`,'utf8').includes(PICKER?'tzpicker.js?v=':'calendar-timezones.js?v='),v);
}
console.log('calendar-guests ok');
