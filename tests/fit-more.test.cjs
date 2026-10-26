require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Fit 1.51 (T41): Add activity, Add your weight and Settings kept on the phone (fit-more.js).
// Today's noon as now, so the sessions the test adds hours back stay on today whenever it runs (not yesterday after midnight).
const noon=new Date().setHours(12,0,0,0);Date.now=()=>noon;
const w={window:{},Intl,Date};vm.runInNewContext(['stock-strings.js','lp-extra-apps.js','fit-more.js'].map(f=>fs.readFileSync('versions/5.1.1/'+f,'utf8')).join('\n'),w);
w.LPExtraApps=w.window.LPExtraApps;w.FitMore=w.window.FitMore;w.StockStrings=w.window.StockStrings;
const X=w.window.LPExtraApps,M=w.window.FitMore,toasts=[];
const data={},ui={view:'fit'},c={data,ui,locale:'en-GB',t:k=>k,save(){},render(){},renderOverlay(){},toast:m=>toasts.push(m)};
const r=()=>X.render('fit',{ui,data,t:k=>k,files:[],locale:'en-GB'});
assert.equal(X.menu('fit',k=>k,'en').map(i=>i.action).join(),'fitm-add,fitm-weight,fitm-settings,lpx-unavailable');
// ActivitySpinnerAdapter: every type, sorted by name; the picked type moves to the front (7 at most).
assert.equal(M.TYPES.length,101);
assert.equal(M.typeOrder(c)[0],'aerobics');
// Add activity: invalid values stay in the editor with the APK's messages, Cancel/Back asks to discard.
M.handle('fitm-add','',c);assert.ok(r().includes('Add activity')&&r().includes('fitm-save'));
ui.fitEdit.m='75';M.handle('fitm-save','',c);assert.equal(ui.fitEdit.errors.m,'Invalid value');
ui.fitEdit.m='0';ui.fitEdit.h='0';M.handle('fitm-save','',c);assert.equal(ui.fitEdit.errors.duration,'Duration must be between 1 minutes and 23 hours.');
ui.fitEdit.m='-5';M.handle('fitm-save','',c);assert.equal(ui.fitEdit.errors.m,'Invalid value');
ui.fitEdit.m='20';ui.fitEdit.start=Date.now()+36e5;M.handle('fitm-save','',c);assert.match(ui.fitEdit.errors.start,/hasn.t happened yet/);
assert.equal(M.back(c),true);assert.equal(ui.fitEdit.dialog,'discard');M.handle('fitm-dialog-close','',c);assert.ok(ui.fitEdit&&!ui.fitEdit.dialog);
M.handle('fitm-types','',c);assert.ok(r().includes('fitm-type-list')&&r().includes('fit-ic_zumba.png'));
M.handle('fitm-type','yoga',c);ui.fitEdit.start=Date.now()-2*36e5;ui.fitEdit.h='1';ui.fitEdit.m='5';M.handle('fitm-save','',c);
assert.equal(ui.fitEdit,null);assert.equal(data.fit.sessions[0].min,65);assert.equal(data.fit.recent[0],'yoga');assert.equal(M.typeOrder(c)[0],'yoga');
let fit=r();assert.ok(fit.includes('1 hr 5 min doing yoga')&&fit.includes('fit-ic_yoga.png')&&fit.includes('#5f7c8a'),fit);
assert.ok(fit.includes('You met your goal!')&&fit.includes('Goal exceeded by 53 min'),'goal of 30 min exceeded by 18+65-30');
// Yesterday's activity goes under the divider and leaves today's wheel alone.
M.handle('fitm-add','',c);ui.fitEdit.start=Date.now()-864e5-36e5;M.handle('fitm-save','',c);fit=r();
assert.ok(fit.includes('fit-divider')&&fit.includes('Yesterday')&&fit.includes('Goal exceeded by 53 min'));
// Weight: kg / lb / stone round trip, only positive numbers; the profile card shows the latest.
assert.equal(Math.round(M.weightKg('','154.3',0)*10)/10,70);assert.equal(M.weightKg('','-3',1),null);assert.equal(M.weightKg('','abc',1),null);
assert.deepEqual(Array.from(M.weightFields(70,2)),['11','0.3']);
M.handle('fitm-weight','',c);ui.fitEdit.unit=1;ui.fitEdit.b='0';M.handle('fitm-save','',c);assert.equal(ui.fitEdit.errors.b,'Invalid value');
ui.fitEdit.b='72.5';M.handle('fitm-save','',c);assert.equal(data.fit.weights[0].kg,72.5);assert.equal(toasts.pop(),'Weight saved');
M.handle('fitm-settings','',c);let s=r();assert.ok(s.includes('Basic information')&&s.includes('<b>72.5</b><small>kg</small>')&&s.includes('Daily goal')&&s.includes('Units'));
// Height in feet and inches is stored in cm.
M.handle('fitm-edit','height',c);ui.fitEdit.unit=1;ui.fitEdit.a='5';ui.fitEdit.b='11';M.handle('fitm-save','',c);assert.equal(data.fit.profile.heightCm,180.3);
// Goal: steps or active time, delete; the timeline follows.
M.handle('fitm-edit','goal',c);ui.fitEdit.a='0';ui.fitEdit.b='0';M.handle('fitm-save','',c);assert.match(ui.fitEdit.errors.b,/between 1 minutes and 24 hours/);
ui.fitEdit.a='2';ui.fitEdit.b='0';M.handle('fitm-save','',c);assert.deepEqual({...data.fit.goal},{type:'duration',value:120});assert.equal(toasts.pop(),'Goal saved');
M.handle('fitm-settings-back','',c);fit=r();assert.ok(fit.includes('37 min to goal')&&fit.includes('At the halfway mark'));
M.handle('fitm-goal-delete','',c);assert.equal(data.fit.goal,null);assert.equal(toasts.pop(),'Goal deleted');fit=r();assert.ok(fit.includes('Great going')&&!fit.includes('to goal'));
M.handle('fitm-notify','sound',c);assert.equal(data.fit.notify.sound,false);
console.log('Fit add activity, weight, height, goal, settings and timeline passed.');
