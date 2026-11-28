require('./lib/vm-strings.cjs');
const engineSource=require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Hangouts (audit step 6): archiving and Archived Hangouts, Snooze notifications with the banner, sharing a location.
const load=(v,files)=>{const context={document:{documentElement:{lang:'hu'}}};context.window=context;for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};
const t=k=>k;

// 4.4.4: Hangouts 2.0.303.
{
  const W=load('4.4.4',['stock-strings.js','messaging.js','hangouts.js']),H=W.Hangouts;
  const now=Date.UTC(2014,5,20,12);
  const data={contacts:[{id:1,name:'Mom',phone:'555'},{id:2,name:'Alex',phone:'556'}],messages:[{id:1,contact:1,body:'Hi',mine:false,time:'Yesterday'},{id:2,contact:2,body:'Yo',mine:true,timestamp:now-1000}],messageDrafts:{},hgArchived:{1:now-5000}};
  const list=H.render(data,{sub:''},t,'hu',now);assert.ok(!list.includes('>Mom<')&&list.includes('Alex'),'archived threads leave the list');
  const arch=H.render(data,{sub:'archived'},t,'hu',now);assert.ok(arch.includes('Archív Hangouts-beszélgetések')&&arch.includes('Mom')&&!arch.includes('Alex'));
  assert.ok(H.render({...data,hgArchived:{}},{sub:'archived'},t,'hu',now).includes('Nincs archivált Hangouts-beszélgetés')||H.render({...data,hgArchived:{}},{sub:'archived'},t,'hu',now).includes('hg-empty'));
  // Something newer than the archiving brings the conversation back.
  assert.ok(H.render({...data,hgArchived:{2:now-5000}},{sub:''},t,'hu',now).includes('Alex'));
  const snoozed=H.render({...data,hgSnooze:now+3600000},{sub:''},t,'hu',now);assert.ok(snoozed.includes('hg-dnd-bar')&&snoozed.includes('data-action="hg-dnd-cancel"'));
  assert.ok(!H.render({...data,hgSnooze:now-1},{sub:''},t,'hu',now).includes('hg-dnd-bar'));
  const menu=H.overlay(data,{overlay:'mms-menu',sub:''},t);assert.ok(menu.includes('data-action="hg-dnd"')&&menu.includes('data-action="hg-archived"'));
  const tmenu=H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'1'},t);assert.ok(tmenu.includes('data-action="hg-unarchive"')&&!tmenu.includes('data-action="hg-archive"'));
  assert.ok(H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'2'},t).includes('data-action="hg-archive"'));
  const dnd=H.overlay(data,{overlay:'mms-hg-dnd'},t);assert.deepEqual([...dnd.matchAll(/data-id="(\d+)">([^<]+)</g)].map(m=>m[2]),['1 óra','2 óra','4 óra','8 óra','24 óra','72 óra']);
  const loc=H.render(data,{sub:'thread',thread:'1',hgLocation:true},t,'hu',now);assert.ok(loc.includes('hg-ic_map_pin')&&loc.includes('data-action="hg-share-location"')&&loc.includes('Hely megosztása'));
  assert.ok(H.locationBody(t).includes('maps.google.com/maps?q=37.422,-122.0841'));
  const sim=fs.readFileSync('versions/4.4.4/simulator.js','utf8');
  assert.ok(sim.includes("case 'hg-share-location':")&&sim.includes("case 'hg-dnd-set':")&&sim.includes("ui.sub === 'archived' ? 'archived'"));
}
// 4.3: Hangouts 1.0.2: the same archive and snooze; no mood item and no location sharing yet.
{
  const W=load('4.3',['stock-strings.js','messaging.js','hangouts.js']),H=W.Hangouts,now=Date.UTC(2013,7,1,12);
  const data={contacts:[{id:1,name:'Taylor',phone:'5'}],messages:[{id:1,contact:1,body:'Hi',mine:false,time:'Yesterday'}],messageDrafts:{},hgArchived:{1:now}};
  assert.ok(H.render(data,{sub:'archived'},t,'hu',now).includes('Taylor')&&!H.render(data,{sub:''},t,'hu',now).includes('Taylor'));
  const menu=H.overlay(data,{overlay:'mms-menu',sub:''},t);assert.ok(menu.includes('Hangoutkérelmek')&&!menu.includes('mood')&&menu.includes('data-action="hg-dnd"'));
  assert.ok(H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'1'},t).includes('data-action="hg-unarchive"'));
  assert.ok(H.overlay(data,{overlay:'mms-hg-dnd'},t).includes('Minden értesítés halasztása'));
  assert.ok(!H.render(data,{sub:'thread',thread:'1'},t,'hu',now).includes('hg-location'));
  const sim=engineSource('4.3');assert.ok(sim.includes("if (ui.view === 'hangouts') { const own = Hangouts.overlay(")&&sim.includes("case 'hg-dnd-set':"));
}
// 5.1.1: Hangouts 2.5: Archived / Snooze notifications in the overflow, Archive / Unarchive and Delete in a conversation,
// the attachment button (quantum_ic_attachment) with Attach photo and Share your location.
{
  const W=load('5.1.1',['stock-strings.js','messaging.js','hangouts.js']),H=W.Hangouts,now=Date.UTC(2015,7,1,12);
  const data={contacts:[{id:1,name:'Sam',phone:'5'}],messages:[{id:1,contact:1,body:'Hi',mine:false,time:'Yesterday',channel:'hangouts'}],messageDrafts:{},hgArchived:{1:now}};
  const arch=H.render(data,{sub:'archived'},t,'hu',now);assert.ok(arch.includes('Archivált beszélgetések')&&arch.includes('Sam'));
  assert.ok(!H.render(data,{sub:''},t,'hu',now).includes('>Sam<'));
  assert.ok(H.render({...data,hgSnooze:now+60000},{sub:''},t,'hu',now).includes('hg-dnd-bar'));
  const menu=H.overlay(data,{overlay:'mms-menu',sub:''},t);assert.ok(menu.indexOf('hg-archived')<menu.indexOf('hg-dnd')&&menu.includes('Archiválva'));
  assert.ok(H.overlay(data,{overlay:'mms-menu',sub:'thread',thread:'1'},t).includes('data-action="hg-unarchive"'));
  const conv=H.render({...data,hgArchived:{}},{sub:'thread',thread:'1'},t,'hu',now);assert.ok(conv.includes('hg-lp-quantum_ic_attachment_grey600_24'));
  const att=H.overlay(data,{overlay:'mms-attach',sub:'thread',thread:'1'},t);assert.ok(att.includes('data-action="hg-attach-photo"')&&att.includes('data-action="hg-share-location"'));
  assert.equal([...H.overlay(data,{overlay:'mms-hg-dnd'},t).matchAll(/data-id="(\d+)"/g)].length,6);
}
console.log('hangouts-features ok');
