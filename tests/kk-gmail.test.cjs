require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const engineSource=require('./lib/engine-source.cjs');
// Stock Nexus 5: Gmail 4.6.1 (Gmail2.apk of KTU84P) on the UnifiedEmail screens (sectioned inbox teaser, drawer, carets, Archive, label chip).
const w={};w.window=w;
for(const f of ['stock-strings.js','email.js','kk-email.js','gmail.js'])vm.runInNewContext(fs.readFileSync(`versions/4.4.4/${f}`,'utf8'),w);
const {GmailApp:G,KKEmail:K}=w;
const mail=G.restore(null,Date.UTC(2014,5,20,12));
assert.equal(G.list(mail,'Primary').length,5);assert.equal(G.list(mail,'Social').length,2);assert.equal(G.list(mail,'Promotions').length,1);
assert.equal(G.list(mail,'Priority Inbox').length,2);assert.equal(G.list(mail,'Starred').length,1);assert.equal(G.list(mail,'Chats').length,0);
const data={gmailbox:mail},ui={emailFolder:'Primary'},t=k=>k,emailT=k=>K.tr('en',k);
const list=K.render(mail,ui,t,'en','en',G.options(data,ui,'en',emailT));
assert.ok(list.includes('assets/gmail.png')&&list.includes('3 unread')&&list.includes('Welcome to your new Inbox')&&list.includes('2 New')&&list.includes('1 New'));
assert.ok(list.includes('kem-ic_email_caret_double_important_unread')&&list.includes('kem-ic_email_caret_single.png')&&list.includes('Touch a sender image to select that conversation.'));
data.gmailWelcomeSeen=true;data.gmailTeaserDismissed=true;
const seen=K.render(mail,ui,t,'en','en',G.options(data,ui,'en',emailT));
assert.ok(!seen.includes('Welcome to your new Inbox')&&seen.includes('gm-section')&&seen.includes('Taylor Lee shared')===false&&seen.includes('>Google+<')&&!seen.includes('kem-teaser'));
const read=K.render(mail,{...ui,sub:'read',emailId:'gm-1'},t,'en','en',G.options(data,ui,'en',emailT));
assert.ok(read.includes('data-action="email-archive"')&&read.includes('gm-chip'));
const drawer=K.overlay(mail,{...ui,overlay:'email-drawer'},[],t,'en',G.options(data,ui,'en',emailT));
for(const label of ['Inbox','Primary','Social','Promotions','Priority Inbox','All labels','Important','All mail','Spam'])assert.ok(drawer.includes(`>${label}<`),label);
assert.ok(drawer.includes('<em class="gm-unseen" style="background:#4880d7">2</em>')&&drawer.includes('gm-ic_menu_inbox_main_holo_dark')&&!drawer.includes('>Updates<'));
// Opening a section marks its mail seen: the drawer shows the unread count and the teaser leaves the section out.
const opened={...data,gmailSeen:{Social:Date.now()}};
const drawer2=K.overlay(mail,{...ui,overlay:'email-drawer'},[],t,'en',G.options(opened,ui,'en',emailT));
assert.ok(!drawer2.includes('background:#4880d7')&&drawer2.includes('<em class="gm-unseen" style="background:#13a864">1</em>'));
const list2=K.render(mail,ui,t,'en','en',G.options(opened,ui,'en',emailT));
assert.ok(!list2.includes('data-id="Social"')&&list2.includes('data-id="Promotions"'));
// Hungarian from the image: headings, the teaser count, the action bar subtitle.
const hu=K.overlay(mail,{...ui,overlay:'email-drawer'},[],t,'hu',G.options(data,ui,'hu',emailT));
assert.ok(hu.includes('>Minden címke<')&&hu.includes('>Beérkező levelek<')&&hu.includes('>Közösségi<'));
const huList=K.render(mail,ui,t,'hu','hu',G.options({gmailbox:mail},ui,'hu',emailT));
assert.ok(huList.includes('2 új')&&huList.includes('3 olvasatlan')&&huList.includes('Üdvözli a beérkező üzenetek megújult fiókja'));
assert.equal(G.tr('hu','Primary'),'Elsődleges');
const email=K.render([],{emailFolder:'Inbox'},t,'en','en');
assert.ok(email.includes('assets/email.png')&&!email.includes('kem-teaser'),'AOSP Email unchanged when empty');
const sim=engineSource('4.4.4');
assert.ok(sim.includes("case 'gmail': return renderGmail();")&&sim.includes("const GEL_ALIASES = {};")&&!sim.includes('data.mailbox.find'));
console.log('kk-gmail ok');
