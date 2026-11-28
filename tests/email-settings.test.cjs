require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// Email app settings (audit step 5): generated from each image's EmailGoogle preference XMLs (docs/tools/email-prefs.py).
for(const [v,version,sig,first]of [['4.0.4','4.1','\n','auto_advance'],['4.3','4.1','\n','auto_advance'],['4.4.4','6.2-1227136','\n\n','confirm_delete'],['5.1.1','7.0-1669963','\n\n','removal-action']]){
  const w={window:{}};w.window.window=w.window;vm.runInNewContext(fs.readFileSync(`versions/${v}/email-prefs.js`,'utf8'),w);
  const P=w.window.EmailPrefs,t=k=>k,acct='demo@example.com';assert.equal(P.version,version);
  assert.match(P.render({},{},'en',t,acct),/emailpref-page" data-id="general"[\s\S]*demo@example\.com/);
  assert.match(P.render({},{emPref:'general'},'en',t,acct),new RegExp(`data-id="${first}"`));
  const account=P.render({},{emPref:'account'},'en',t,acct);
  assert.match(account,/Account name<\/b><small>demo@example\.com[\s\S]*Your name<\/b><small>demo[\s\S]*Signature/);
  assert.match(account,/Data usage[\s\S]*Sync frequency|Data usage[\s\S]*Inbox check frequency/);assert.match(account,/Every 15 minutes/);
  assert.doesNotMatch(account,/Sync contacts|Sync calendar|policies_/);
  assert.match(P.render({},{emPref:'account',emPrefEdit:'account_signature'},'en',t,acct),/data-email-pref-edit/);
  assert.match(P.render({},{emPref:'account',emPrefList:'account_check_frequency'},'en',t,acct),/emailpref-pick" data-id="account_check_frequency:3" role="radio" aria-checked="true"/);
  assert.match(P.render({},{emPref:'general'},'hu',t,acct),/Általános|Automatikus/);
  assert.equal(P.signatureBody({emailPrefs:{account_signature:'Regards'}}),sig+'Regards');assert.equal(P.signatureBody({}),'');
  assert.equal(P.value({emailPrefs:{account_sync_email:false}},'account_sync_email',acct),false);
  const sim=engineSource(v);
  for(const a of ['emailpref-page','emailpref-toggle','emailpref-pick','emailpref-save'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
  assert.ok(fs.readFileSync(`versions/${v}/index.html`,'utf8').includes('email-prefs.js?v='),v);
}
console.log('email-settings ok');
