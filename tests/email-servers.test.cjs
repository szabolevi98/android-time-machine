const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Email's server screens (T09): validateFields (user name and password, a server name, a port 1-65535; outgoing
// without Require sign-in needs no user), the ports a security type sets, and no stored password.
const document={addEventListener(){}};
for(const v of ['4.0.4','4.3','4.4.4','5.1.1']){
  const w={window:{},document};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/email-prefs.js`,'utf8'),w);
  const P=w.window.EmailPrefs,ok={user:'a@b.c',password:'x',server:'imap.example.com',port:'993'};
  assert.equal(P.valid('incoming',ok),true,v);
  for(const bad of [{port:'0'},{port:'65536'},{port:'99a'},{server:'bad host'},{server:''},{password:''},{user:' '}])assert.equal(P.valid('incoming',{...ok,...bad}),false,`${v} ${JSON.stringify(bad)}`);
  assert.equal(P.valid('outgoing',{server:'smtp.example.com',port:'465',login:false}),true,v);
  assert.equal(P.valid('outgoing',{server:'smtp.example.com',port:'465',login:true,user:'',password:''}),false,v);
  // An older save with the password in it reads as "set" and the password itself is dropped.
  const s=P.server({emailPrefs:{incoming:{password:'secret',server:'mail.example.org'}}},'incoming','demo@example.com');
  assert.equal(s.passwordSet,true);assert.equal('password' in s,false);assert.equal(s.server,'mail.example.org');
  const src=fs.readFileSync(`versions/${v}/email-prefs.js`,'utf8');
  assert.ok(src.includes("PORTS = {incoming: [143, 993], outgoing: [587, 465]}"),v);
  assert.ok(fs.readFileSync(`versions/${v}/simulator.js`,'utf8').includes("action.startsWith('empx-') && EmailPrefs.handle("),v);
}
{
  const w={window:{GBStrings:{}},document};w.window.window=w.window;w.AndroidStrings={resources:()=>({t:k=>k,array:()=>[]})};
  vm.runInNewContext(fs.readFileSync('versions/2.3.6/gb-prefs.js','utf8'),w);
  const G=w.window.GBPrefs;
  assert.deepEqual([...G.PORTS.incoming],[143,993,993,143,143]);assert.deepEqual([...G.PORTS.outgoing],[587,465,465,587,587]);
  assert.equal(G.serverValid('incoming',{user:'u',password:'p',server:'imap.example.com',port:'143'}),true);
  assert.equal(G.serverValid('incoming',{user:'u',password:'p',server:'imap.example.com',port:'0'}),false);
  assert.equal(G.serverValid('outgoing',{server:'smtp.example.com',port:'587',login:false}),true);
  const ctx={lang:'en',account:'demo@example.com',servers:{}};
  assert.deepEqual({...G.server(ctx,'incoming')},{user:'demo@example.com',passwordSet:true,server:'imap.example.com',port:'993',security:1,prefix:''});
  assert.match(G.SCREENS['email-incoming'](ctx).form,/data-form="gbem-server" data-page="incoming"/);
  assert.match(G.SCREENS.email({...ctx,values:{}}).items.find(i=>i.key==='incoming').open,/email-incoming/);
}
// The IMAP account's list menu has no Sync options (folder_options needs offerLookback, Exchange only).
for(const f of ['versions/4.3/jb-email.js','versions/4.4.4/kk-email.js','versions/5.1.1/lp-email.js'])assert.ok(!fs.readFileSync(f,'utf8').includes("['email-unavailable', 'Sync options']"),f);
console.log('email-servers ok');
