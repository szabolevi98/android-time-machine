require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Gmail settings (audit step 5): Gmail 4.5.1 (4.3), 4.6.1 (4.4.4) and 5.0.2 (5.1.1).
for(const [v,email,about] of [['4.3','jb-email.js',true],['4.4.4','kk-email.js',true],['5.1.1','lp-email.js',false]]){
  const w={window:{}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8'),w);
  vm.runInNewContext(fs.readFileSync(`versions/${v}/gmail.js`,'utf8'),w);
  const G=w.window.GmailApp,t=k=>k,mail=G.restore(null,Date.now());
  // Settings: General settings, the account (and About Gmail on 4.x).
  const main=G.settings({},{},'en',t);assert.match(main,/General settings[\s\S]*@gmail\.com/);assert.equal(/About Gmail/.test(main),about,v);
  assert.match(G.settings({},{gmPref:'general'},'en',t),/(Archive &amp; delete actions|Gmail default action)[\s\S]*(Swipe to archive|Swipe actions)[\s\S]*Action Confirmations[\s\S]*Confirm before sending/);
  const account=G.settings({gmailPrefs:{signature:'Sent from my Nexus'}},{gmPref:'account'},'en',t);
  assert.match(account,/Inbox type[\s\S]*Default Inbox[\s\S]*Inbox categories[\s\S]*Notifications[\s\S]*Signature[\s\S]*Sent from my Nexus[\s\S]*Data usage/);
  assert.match(G.settings({},{gmPref:'account'},'en',t),/Signature<\/b><small>Not set/);
  const cats=G.settings({},{gmPref:'categories'},'en',t);
  assert.match(cats,/Primary[\s\S]*Social[\s\S]*gmp-check on[\s\S]*Promotions[\s\S]*Updates[\s\S]*Forums[\s\S]*Include starred in Primary/);
  assert.match(G.settings({},{gmPref:'general',gmPrefList:'auto-advance'},'en',t),/gmail-pref-pick" data-id="auto-advance:2" role="radio" aria-checked="true"/);
  assert.match(G.settings({},{gmSignature:'x'},'en',t),/data-gmail-signature/);
  // A category turned off: its mail is listed in Primary and its row leaves the inbox.
  const social=mail.filter(item=>item.category==='social').length;assert.ok(social>0);
  const before=G.list(mail,'Primary').length;
  G.options({gmailbox:mail,gmailPrefs:{'category-social':false}},{},'en',t);
  assert.equal(G.list(mail,'Primary').length,before+social);assert.equal(G.list(mail,'Social').length,0);
  G.options({gmailbox:mail},{},'en',t);assert.equal(G.list(mail,'Primary').length,before);
  // The mail menus' Settings opens Gmail's settings; new Gmail messages get the signature.
  assert.ok(fs.readFileSync(`versions/${v}/${email}`,'utf8').includes("['email-settings', 'Settings']"));
  const sim=engineSource(v);
  for(const a of ['email-settings','gmail-pref','gmail-pref-toggle','gmail-pref-pick','gmail-signature-save','gmail-categories'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
  assert.ok(sim.includes("data.gmailPrefs?.signature"),v);
}
console.log('gmail-settings ok');
