require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// 2.3.6 / 4.4.4 / 5.1.1 email.js hold only the local mailbox; each version's own module draws its dialogs:
// GB discards with a toast (MessageCompose.onDiscard), KitKat and Lollipop ask DiscardConfirmDialogFragment's question.
for(const v of ['2.3.6','4.4.4','5.1.1']){
  const w={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/email.js`,'utf8'),w);
  assert.deepEqual(Object.keys(w.window.ICSEmail),['account','restore','list','recipients','validRecipients','draft','trash','untrash','send'],v);
  assert.ok(!fs.readFileSync(`versions/${v}/index.html`,'utf8').includes('href="email.css'),v);
}
const gb=require('./lib/engine-source.cjs')('2.3.6');
assert.ok(!gb.includes("'email-confirm-discard'")&&gb.includes("case 'gbem-discard':")&&gb.includes("gbEmLeaveCompose('message_discarded_toast')"));
const load=(v,files)=>{const w={window:{AndroidI18n:{t:k=>k}},document:{}};w.window.window=w.window;for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);return w.window;};
{
  const W=load('4.4.4',['email.js','kk-email.js']),K=W.KKEmail;
  const ui={overlay:'email-menu',emailMenu:'compose'};
  assert.deepEqual([...K.overlay([],ui,[],k=>k,'en').matchAll(/>([^<>]+)<\/button>/g)].map(m=>m[1]),['Attach picture','Attach video','Add Cc/Bcc','Save draft','Discard','Settings','Send feedback','Help']);
  ui.overlay='email-discard';const d=K.overlay([],ui,[],k=>k,'hu');assert.ok(d.includes('Elveti ezt az üzenetet?')&&d.includes('>Elvetés<')&&d.includes('>Mégse<'));
}
{
  const W=load('5.1.1',['email.js','lp-email.js']),L=W.LPEmail;
  const ui={overlay:'email-menu',emailMenu:'compose'};
  assert.deepEqual([...L.overlay([],ui,[],k=>k,'en').matchAll(/>([^<>]+)<\/button>/g)].map(m=>m[1]),['Save draft','Discard','Settings','Help &amp; feedback']);
  ui.emailMenu='attach';assert.deepEqual([...L.overlay([],ui,[],k=>k,'en').matchAll(/>([^<>]+)<\/button>/g)].map(m=>m[1]),['Attach file','Attach picture']);
  ui.overlay='email-discard';assert.ok(L.overlay([],ui,[],k=>k,'hu').includes('Elveti ezt a levelet?'));
}
console.log('email-model ok');
