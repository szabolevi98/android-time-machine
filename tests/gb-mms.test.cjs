require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{},Intl,Date};
for(const f of ['messaging.js','gb-strings-mms.js','gb-mms.js'])vm.runInNewContext(fs.readFileSync(`versions/2.3.6/${f}`,'utf8'),context);
const G=context.window.GBMms,now=new Date(2026,9,2,14,0).getTime();
const data={contacts:[{id:1,name:'Alex',phone:'555-1'}],photos:[{id:1,name:'Sea',colors:['#123456']}],messages:[{id:1,contact:1,body:'Hi :-)',mine:false,read:false,timestamp:now-3600000},{id:2,contact:1,body:'Yo',mine:true,timestamp:now-60000},{id:3,contact:'tel:999',body:'Old',mine:false,timestamp:new Date(2025,0,5).getTime()}],messageDrafts:{}};
const ctx=(o={})=>({lang:'en',locale:'en-US',t:k=>k,hour24:false,now,sub:'',data,ok:'OK',cancel:'Cancel',...o});
// ConversationList: header row, unread conversation bold on white with its count, read rows, dates by age.
let html=G.render(ctx());
assert.match(html,/gb-titlebar">Messaging</);assert.match(html,/gbmms-header"[^>]*><span class="gbmms-from">New message<\/span><span class="gbmms-subject">Compose new message/);
assert.match(html,/gbmms-thread unread" data-action="thread" data-id="1"/);assert.match(html,/Alex \(2\) /);assert.match(html,/gbmms-date">1:59 PM</);
assert.match(html,/data-id="tel:999"/);assert.match(html,/Jan 5, 2025/);
data.messageDrafts['tel:999']={body:'Later',updated:now};assert.match(G.render(ctx()),/<em> Draft<\/em>/);delete data.messageDrafts['tel:999'];
// Compose: "Name <number>" title, "Name: body" with smileys, "Sent: time", inbox rows light blue, the bottom panel.
html=G.render(ctx({sub:'thread',thread:1,draft:{}}));
assert.match(html,/gb-titlebar">Alex &lt;555-1&gt;</);assert.match(html,/received"[^>]*>.*<b>Alex<\/b>: Hi <img class="gbmms-emo" src="assets\/gb-m-emo_im_happy.png"/);
assert.match(html,/<b>Me<\/b>: Yo/);assert.match(html,/Sent: 1:59 PM/);assert.match(html,/placeholder="Type to compose"/);assert.match(html,/gbmms-send" type="submit" disabled>Send/);
assert.match(G.render(ctx({sub:'thread',thread:1,draft:{body:'x'.repeat(155)}})),/gbmms-counter">5 \/ 1</);
assert.match(G.render(ctx({sub:'new',draft:{}})),/name="recipient"[^>]*placeholder="To"/);
assert.match(G.render(ctx({sub:'new',draft:{},subjectVisible:true})),/placeholder="Subject"/);
// Menus.
assert.deepEqual([...G.menu(ctx()).map(i=>i.title)],['Compose','Delete threads','Search','Settings']);
assert.deepEqual([...G.menu(ctx({sub:'thread',thread:1,draft:{body:'a'}})).map(i=>i.title)],['Call','View contact','Add subject','Attach','Send','Insert smiley','Delete thread','All threads']);
assert.deepEqual([...G.menu(ctx({sub:'new',draft:{recipient:'12345'}})).map(i=>i.action)],['mms-call','gbmms-subject','mms-attach','mms-smiley','mms-discard','gbmms-all-threads','gbmms-add-contact']);
// Dialogs.
assert.equal(G.dialog('attach',ctx()).items.length,7);
// Every source is local (gb-mms-attach.js): Pictures … Slideshow in AttachmentTypeSelectorAdapter's order.
assert.deepEqual([...G.dialog('attach',ctx()).items.map(i=>`${i.action}:${i.id}`)],['image','take-photo','video','record-video','sound','record-sound','slideshow'].map(t=>'gbma-attach:'+t));
assert.match(G.dialog('smiley',ctx()).custom,/Tongue sticking out/);assert.match(G.dialog('smiley',ctx({lang:'hu'})).custom,/Kacsintás/);
assert.deepEqual([...G.dialog('message',ctx({message:data.messages[0]})).items.map(i=>i.title)],['Forward','Copy message text','View message details','Delete message','Lock message']);
assert.match(G.dialog('details',ctx({message:data.messages[0]})).message,/^Type: Text message\nFrom: 555-1\nReceived: Oct 2, 1:00 PM$/);
assert.equal(G.dialog('delete-thread',ctx()).message,'The entire thread will be deleted.');
assert.deepEqual([...G.dialog('thread',ctx({thread:'tel:999'})).items.map(i=>i.title)],['View thread','Add to Contacts','Delete thread']);
console.log('gb-mms ok');
