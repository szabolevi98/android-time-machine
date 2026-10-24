require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Contacts' Import/export (T11) and the 5.1 Phone app's Settings (T44): vCard 2.1 out and back, the provider-style
// merge, the dialogs' steps, and the Phone's name order.
const plain=x=>JSON.parse(JSON.stringify(x));
for(const [v,p,full] of [['4.0.4','ics',true],['4.3','jb',true],['4.4.4','kk',true],['5.1.1','lp',false]]){
  const w={window:{},TextEncoder,TextDecoder};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/${p}-people-io.js`,'utf8'),w);
  const IO=w.window.PeopleIO;
  const person=full?{id:9,prefix:'Dr.',given:'Zoé',middle:'',family:'Kovács',suffix:'',name:'Dr. Zoé Kovács',phones:[{type:'mobile',value:'+36 30 123 4567'},{type:'faxwork',value:'555'},{type:'custom',label:'Boat',value:'777'}],emails:[{type:'work',value:'zoe@example.com'},{type:'other',value:'z@example.org'}],postals:[{type:'home',value:'Fő utca 1.\nBudapest'}],ims:[{type:'gtalk',value:'zoe'}],websites:[{type:'other',value:'example.com'}],company:'Acme; Kft.',title:'Chief',notes:'Line one\nLine two',nickname:'Zo',sip:'zoe@sip.example',photo:3,phone:'+36 30 123 4567',email:'zoe@example.com'}
    :{id:9,name:'Zoé Kovács',phone:'+36 30 123 4567',email:'zoe@example.com',company:'Acme; Kft.',notes:'Line one\nLine two'};
  const card=IO.card(person);
  assert.match(card,/^BEGIN:VCARD\r\nVERSION:2\.1\r\nN;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:Kov=C3=A1cs;Zo=C3=A9/);
  assert.match(card,/\r\nTEL;CELL:\+36 30 123 4567\r\n/);assert.match(card,/\r\nORG:Acme\\; Kft\.\r\n/);assert.match(card,/\r\nNOTE:Line one\\nLine two\r\n/);
  if(full){assert.match(card,/TEL;WORK;FAX:555[\s\S]*TEL;X-Boat:777[\s\S]*EMAIL;WORK:zoe@example\.com[\s\S]*EMAIL:z@example\.org[\s\S]*ADR;HOME;CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:;;F=C5=91 utca 1\.\\nBudapest[\s\S]*TITLE:Chief[\s\S]*URL:example\.com[\s\S]*X-GOOGLE-TALK:zoe[\s\S]*X-SIP:zoe@sip\.example/);assert.match(card,/X-ANDROID-CUSTOM:vnd\.android\.cursor\.item\/nickname;Zo;1;/);}
  // Out and back: every field the simulator keeps.
  const [back]=plain(IO.parse(IO.compose([person])));
  const {id,...want}=plain(person);
  if(full){for(const k of Object.keys(want).filter(k=>want[k]!==''))assert.deepEqual(back[k],want[k],`${v} ${k}`);assert.equal(back.middle,undefined);}
  else assert.deepEqual(back,{name:'Zoé Kovács',phone:'+36 30 123 4567',email:'zoe@example.com',company:'Acme; Kft.',notes:'Line one\nLine two'});
  // A folded quoted-printable line (soft break) reads back too.
  assert.equal(plain(IO.parse('BEGIN:VCARD\r\nVERSION:2.1\r\nN:Doe;John;;;\r\nNOTE;ENCODING=QUOTED-PRINTABLE:abc=\r\ndef\r\nEND:VCARD\r\n'))[0].notes,'abcdef');
  // Merge: the same name joins (new numbers only), others are added; nothing changes when the card adds nothing.
  const data={contacts:[{id:1,name:'Alex Morgan',phone:'1',email:'a@x'}],vcards:[]};
  IO.merge(data,[{name:'Alex Morgan',phone:'1',email:'a@x',...(full?{phones:[{type:'mobile',value:'1'}],emails:[{type:'home',value:'a@x'}]}:{})}]);
  assert.deepEqual(plain(data.contacts),[{id:1,name:'Alex Morgan',phone:'1',email:'a@x'}]);
  if(full){IO.merge(data,[{name:'Alex Morgan',phones:[{type:'work',value:'2'}],emails:[]}]);assert.deepEqual(plain(data.contacts[0].phones),[{type:'mobile',value:'1'},{type:'work',value:'2'}]);}
  assert.equal(IO.merge(data,[{name:'New One',phone:'5'}],100),1);assert.equal(data.contacts.at(-1).id,100);
  // ExportVCardActivity's names; the dialog steps.
  assert.equal(IO.nextName({vcards:[{name:'00001.vcf'},{name:'00003.vcf'}]}),'00002.vcf');
  const ui={},ctx={data:{contacts:[{id:1,name:'A'}],settings:{}},ui,t:k=>k,locale:'en'};
  IO.handle('vcf-open','',ctx);assert.equal(ui.overlay,'people-vcard');
  assert.deepEqual([...IO.overlay(ctx).matchAll(/data-action="(vcf-[a-z]+|toast)"/g)].map(m=>m[1]).slice(1),['vcf-sim','vcf-import','vcf-export','vcf-share']);
  // Share: one card named after the contact, several as vcards_yyyyMMdd_HHmmss.vcf.
  assert.equal(IO.shareFile([{name:'Alex Morgan',phone:'1'}]).name,'Alex Morgan.vcf');
  const many=IO.shareFile([{name:'A B'},{name:'C D'}],new Date(2026,9,24,8,5,9));assert.equal(many.name,'vcards_20261024_080509.vcf');assert.equal((many.text.match(/BEGIN:VCARD/g)||[]).length,2);assert.equal(many.mime,'text/x-vcard');
  IO.handle('vcf-import','',ctx);assert.equal(ui.vcard.step,'none');assert.match(IO.overlay(ctx),/No vCard file found in storage\./);
  IO.handle('vcf-cancel','',ctx);IO.handle('vcf-open','',ctx);IO.handle('vcf-export','',ctx);
  assert.match(IO.overlay(ctx),new RegExp(`${v==='4.0.4'?'/mnt/sdcard':'/storage/emulated/0'}/00001\\.vcf`));
  const done=plain(IO.handle('vcf-export-ok','',ctx));assert.equal(done.notify[0],'Finished exporting 00001.vcf.');assert.equal(ctx.data.vcards[0].name,'00001.vcf');
  assert.match(IO.sim(ctx),/No contacts on your SIM card\./);assert.match(IO.sim({...ctx,data:{...ctx.data,settings:{airplane:true}}}),/Airplane mode/);
  assert.equal(typeof IO.ringtone,full?'function':'undefined');
  // Contacts to display / Customize: a hidden group hides its members; ungrouped people follow All other contacts.
  const fd={contacts:[{id:1,name:'Alex Morgan'},{id:5,name:'Zed'}],contactGroups:[{id:'friends',name:'Friends',members:[1]}]};
  assert.equal(IO.visible(fd,fd.contacts[0]),true);fd.contactsFilter='custom';fd.contactsCustom={friends:false};
  assert.equal(IO.visible(fd,fd.contacts[0]),false);assert.equal(IO.visible(fd,fd.contacts[1]),true);fd.contactsCustom.ungrouped=false;assert.equal(IO.visible(fd,fd.contacts[1]),false);
  assert.equal(IO.filterHeader({data:fd,t:k=>k,locale:'en'}),'Contacts in custom view');
  fd.contactPrefs={sort:'family',order:'family'};assert.equal(IO.sortKey(fd.contacts[0],fd),'Morgan Alex');assert.equal(IO.displayName(fd.contacts[0],fd),'Morgan, Alex');
  const pu={sub:''};IO.pageAction('pfl-open','',{data:fd,ui:pu});assert.equal(pu.sub,'people-filter');IO.pageAction('pfl-pick','customize',{data:fd,ui:pu});assert.equal(pu.sub,'people-customize');
  IO.pageAction('pfl-toggle','friends',{data:fd,ui:pu});assert.equal(IO.back(pu),true);assert.equal(fd.contactsCustom.friends,false,'Back keeps the old view');assert.equal(pu.sub,'people-filter');
  IO.pageAction('pfl-pick','all',{data:fd,ui:pu});assert.equal(fd.contactsFilter,'all');assert.equal(pu.sub,'');
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  assert.ok(sim.includes("if (action.startsWith('vcf-'))")&&sim.includes("PeopleIO.sim("),v);
  if(full)assert.ok(sim.includes("case 'people-ringtone': { const person = contact(ui.selectedContact)")&&!sim.includes("option('toast', 'Set ringtone'"),v);
}
// The 5.1 Phone app's Settings: the name order shared with Contacts.
{
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-dialer-prefs.js','utf8'),w);
  const D=w.window.LPDialerPrefs,data={contacts:[],contactPrefs:{}},alex={name:'Alex Morgan'};
  assert.equal(D.displayName(alex,data),'Alex Morgan');assert.equal(D.sortKey(alex,data),'Alex Morgan');
  data.contactPrefs={order:'family',sort:'family'};assert.equal(D.displayName(alex,data),'Morgan, Alex');assert.equal(D.sortKey(alex,data),'Morgan Alex');assert.equal(D.displayName({name:'Mom'},data),'Mom');
  const ui={sub:'dialer-settings',dialerBack:['']},ctx={data,ui,t:k=>k,locale:'en'};
  assert.equal((D.render(ctx).match(/class="ldp2-row"/g)||[]).length,3);
  D.handle('dpr-open','dialer-general',ctx);assert.match(D.render(ctx),/Contact display options[\s\S]*Last name[\s\S]*Last name first[\s\S]*Phone ringtone[\s\S]*Titania[\s\S]*Dialpad tones[\s\S]*Also vibrate for calls[\s\S]*Quick responses/);
  D.handle('dpr-toggle','dialTones',ctx);assert.equal(data.settings.dialTones,false);
  D.handle('dpr-open','dialer-quick',ctx);D.handle('dpr-dialog','quick:2',ctx);D.saveQuick('Soon',ctx);assert.deepEqual(plain(data.quickResponses),["Can't talk now. What's up?","I'll call you right back.",'Soon',"Can't talk now. Call me later?"]);
  assert.equal(D.back(ui),true);assert.equal(ui.sub,'dialer-general');assert.equal(D.back(ui),true);assert.equal(D.back(ui),true);assert.equal(ui.sub,'');
}
console.log('people-io ok');
