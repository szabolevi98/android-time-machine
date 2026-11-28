const engineSource=require('./lib/engine-source.cjs');
require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Email 4.0.4 (versions/4.0.4/email.js from docs/templates/ics-email.template.js): the mailbox model, then the screens and menus of
// IMM76I's EmailGoogle.apk (split bar items in menu order, the message view's Delete / Move / Newer / Older, compose's
// overflow, the discard confirmation, the Gallery attachment).
const ctx0={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.0.4/email.js','utf8'),ctx0);const mail=ctx0.window.ICSEmail;
const messages=mail.restore(undefined,[{id:1,from:'Android Team',subject:'Welcome',body:'Hello'}],[{id:1,to:'alex@example.com',subject:'Old sent',body:'Saved'}]);
assert.equal(messages.length,2);assert.notEqual(messages[0].id,messages[1].id);assert.equal(messages[1].folder,'Sent');
const reply=mail.draft(messages[0],false,1);assert.equal(reply.to,'android@example.com');assert.equal(reply.subject,'Re: Welcome');
const forward=mail.draft(messages[0],true,2);assert.equal(forward.to,'');assert.equal(forward.subject,'Fwd: Welcome');
assert.equal(mail.validRecipients({to:'a@example.com; b@example.com',cc:'c@example.com'}),true);
assert.equal(mail.validRecipients({to:'a@example.com',bcc:'invalid'}),false);
messages[0].starred=true;mail.trash(messages,['inbox-1']);assert.equal(mail.list(messages,'Starred').length,0);assert.equal(mail.list(messages,'Trash').length,1);mail.untrash(messages[0]);assert.equal(messages[0].folder,'Inbox');
reply.to='broken';assert.equal(mail.send(reply),false);assert.equal(reply.folder,'Drafts');reply.to='alex@example.com';assert.equal(mail.send(reply,5),true);assert.equal(reply.folder,'Sent');
assert.equal(mail.restore(JSON.parse(JSON.stringify(messages))).length,2);
assert.equal(mail.list(messages,'Sent','saved').length,1);
// The screens.
const toasts=[],now=Date.UTC(2012,3,20,10);
const data={mailbox:mail.restore(undefined,[{id:1,from:'Android Team',subject:'<script>bad()</script>',body:'Hello',hoursAgo:1},{id:2,from:'Alex Morgan',subject:'Photos',body:'Look',hoursAgo:30}],[],now),photos:[{id:7,name:'Mountain'}]};
let picked=0;
const ui={},ctx={data,ui,lang:'en',locale:'en-US',now,hour24:false,save(){},render(){},renderOverlay(){},toast:m=>toasts.push(m),focus(){},back(){},pickPicture:()=>{picked++;}};
let html=mail.render(ctx);
assert.ok(!html.includes('<script>'));
const labels=h=>[...h.matchAll(/<footer class="em-split">(.*?)<\/footer>/g)][0][1].match(/aria-label="([^"]*)"/g).map(x=>x.slice(12,-1));
assert.deepEqual(labels(html),['Compose','Search','Show all folders','Refresh','More options']);
assert.ok(html.includes('<b>Inbox</b><small>demo@example.com</small>')&&html.includes('<span class="em-count">2</span>'));
mail.handle('email-read','inbox-1',ctx);html=mail.render(ctx);
assert.equal(ui.sub,'read');assert.ok(data.mailbox[0].read);
assert.deepEqual(labels(html),['Delete','Move','Newer','Older','More options']);
assert.ok(html.includes('class="em-header"')&&html.includes('data-action="email-reply"'));
ui.overlay='email-menu';assert.ok(/Mark as unread.*Settings/.test(mail.overlay(ctx)));
ui.overlay='email-more';assert.ok(/Reply all.*Forward/.test(mail.overlay(ctx)));ui.overlay='';
mail.handle('email-reply',null,ctx);assert.equal(ui.sub,'compose');const d=data.mailbox.find(m=>m.id===ui.emailId);assert.equal(d.mode,'reply');assert.equal(d.to,'android@example.com');
ui.overlay='email-menu';assert.deepEqual([...mail.overlay(ctx).matchAll(/<span>([^<]*)<\/span>/g)].map(m=>m[1]),['Attach file','Add Cc/Bcc','Save draft','Discard','Settings']);
mail.handle('email-attach',null,ctx);assert.equal(picked,1);mail.attach(ctx,data.photos[0]);assert.equal(d.attachment.name,'Mountain');
mail.handle('email-discard',null,ctx);assert.ok(mail.overlay(ctx).includes('Delete this message?'));
mail.handle('email-confirm-discard',null,ctx);assert.ok(!data.mailbox.includes(d));assert.ok(toasts.includes('Message discarded.'));
mail.handle('email-compose',null,ctx);assert.equal(mail.shown(data.mailbox,'Drafts').length,0,'an untouched message is not a draft');
assert.ok(mail.submit('email',new Map([['to',''],['subject','x'],['body','y']]),ctx));assert.ok(toasts.includes('You must add at least one recipient.'));
assert.ok(mail.submit('email',new Map([['to','alex@example.com'],['subject','Hi'],['body','There']]),ctx));assert.equal(mail.list(data.mailbox,'Sent').length,1);
ctx.lang='hu';ui.sub='';ui.emailFolder='Inbox';html=mail.render(ctx);assert.ok(html.includes('Beérkezett üzenetek'));
const sim=engineSource('4.0.4');
assert.ok(sim.includes("if (ui.view === 'email' && action.startsWith('email-') && ICSEmail.handle(action, id, emailContext(c))) return true;")&&sim.includes("case 'gallery-pick':"));
// Email 4.3 (versions/4.3/email.js from docs/templates/email-4.3.template.js): one menu per screen; the message view adds Mark as
// unread to the bar, the folder list has no menu and a plain "Folders" title.
{
  const w={window:{}};vm.runInNewContext(fs.readFileSync('versions/4.3/email.js','utf8'),w);const M=w.window.ICSEmail;
  const d43={mailbox:M.restore(undefined,[{id:1,from:'Android Team',subject:'Welcome',body:'Hello',hoursAgo:1},{id:2,from:'Alex Morgan',subject:'Photos',body:'Look',hoursAgo:30}],[],now),photos:[]};
  const u={},c={...ctx,data:d43,ui:u,lang:'en'};
  assert.deepEqual(labels(M.render(c)),['Compose','Search','Show all folders','Refresh','More options']);
  M.handle('email-read','inbox-2',c);assert.deepEqual(labels(M.render(c)),['Delete','Move','Mark as unread','Newer','Older','More options']);
  u.overlay='email-menu';assert.ok(!M.overlay(c).includes('Mark as unread')&&M.overlay(c).includes('Settings'));u.overlay='';
  M.handle('email-mailboxes',null,c);const h=M.render(c);assert.ok(h.includes('<span class="em-titles"><b>Folders</b>')&&!h.includes('em-split'));
}
console.log('Email checks passed: mailbox model, the 4.0.4 split bars and menus, reply, discard, Gallery attachment and sending.');
