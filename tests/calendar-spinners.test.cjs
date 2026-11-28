const engineSource=require('./lib/engine-source.cjs');
require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Calendar editor (audit step 6): the repeat and reminder fields are spinners with their own lists, no <select>.
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const src=fs.readFileSync(`versions/${v}/calendar.js`,'utf8');assert.ok(!src.includes('<select'),v);
  const w={window:{AndroidI18n:{language:'en'}},document:{}};w.window.window=w.window;if(v!=='4.0.4')vm.runInNewContext(fs.readFileSync(`versions/${v}/tzpicker.js`,'utf8'),w);vm.runInNewContext(src,w);
  const C=w.window.ICSCalendar,t=k=>k;
  const html=C.render({events:[],calendarMode:'Month'},{sub:'event-edit',selectedDate:'2026-10-08',eventDraft:{date:'2026-10-08',title:'x',repeat:'weekly',reminder:60}},t,'en-US',new Date(2026,9,8));
  assert.match(html,/<input type="hidden" name="repeat" value="weekly"><button type="button" class="[^"]*" data-action="calspin" data-id="repeat"/);
  assert.match(html,/<input type="hidden" name="reminder" value="60"><button type="button" class="[^"]*" data-action="calspin" data-id="reminder"/);
  const items=C.spinner('repeat',{date:'2026-10-08',repeat:'none'},'en-US',t);assert.ok(items.length>=5&&items[0].value==='none',v);
  assert.equal(C.spinner('reminder',{},'en-US',t)[0].value,'-1');
  const over=C.overlay({overlay:'calendar-spinner',calSpin:{field:'repeat',value:'none',items,title:'Repetition',left:10,top:20,width:200}},t);
  assert.match(over,/data-action="calspin-pick" data-id="none"/);
  if(v==='5.1.1'){assert.match(over,/gc-choice/);assert.match(html,/class="gc-switch" role="switch" name="allDay"/);}else assert.match(over,/cal-spin-list[^>]*left:10px;top:20px;width:200px/);
  const sim=engineSource(v);assert.ok(sim.includes("case 'calspin':")&&sim.includes("case 'calspin-pick':"),v);
}
assert.ok(!fs.readFileSync('docs/templates/calendar-jb.template.js','utf8').includes('<select'));
console.log('calendar-spinners ok');
