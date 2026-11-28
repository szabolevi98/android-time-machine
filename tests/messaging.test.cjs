const engineSource=require('./lib/engine-source.cjs');
require('./lib/vm-strings.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('versions/4.0.4/messaging.js','utf8'),context);
const m = context.window.ICSMessaging;
assert.equal(m.counter('a'.repeat(160)).count,1);
assert.equal(m.counter('a'.repeat(161)).remaining,145);
assert.equal(m.counter('^'.repeat(80)).count,1);
assert.equal(m.counter('^'.repeat(81)).count,2);
assert.equal(m.counter('ő'.repeat(70)).count,1);
assert.equal(m.counter('ő'.repeat(71)).remaining,63);
assert.equal(m.counter('😀'.repeat(36)).count,2);
const contacts = [{id:1,name:'Alex Morgan',phone:'202-555-0148'}];
assert.equal(m.recipient('alex morgan',contacts).key,'1');
assert.equal(m.recipient('(202) 555-0148',contacts).key,'1');
assert.equal(m.recipient('+36 30 123 4567',contacts).key,'tel:+36301234567');
assert.equal(m.recipient('<img src=x>',contacts),null);
const data = {contacts,messages:[{id:1,contact:1,body:'Coffee?',time:'10:00'},{id:2,contact:'1',body:'Yes',time:'10:01'}],messageDrafts:{'tel:5551234':{body:'Draft',updated:100},new:{body:'Not a thread'}}};
assert.equal(m.threads(data).length,2);
assert.equal(m.threads(data)[0].key,'tel:5551234');
assert.equal(m.threads(data,'coffee')[0].messages.length,2);
assert.equal(m.threads(data,'missing').length,0);
const unfiltered = m.render(data,{sub:'',mmsSearch:'missing'},key=>key,'en-US');
assert.ok(unfiltered.includes('Alex Morgan'), 'Leaving search restores the full list');
const html = m.render({...data,messages:[{id:1,contact:1,body:'<img src=x>',time:'10:00'}]}, {sub:'thread',thread:1},key=>key,'en-US');
assert.ok(html.includes('&lt;img src=x&gt;'));
assert.ok(!html.includes('<img src=x>'));
console.log('Messaging checks passed: SMS segments, recipients, legacy threads, drafts, search and escaping.');
// Per image: Messaging's words come from the image's Mms.apk (mms-strings.js) and the overlays follow its code.
for (const [v, cell] of [['4.0.4', false], ['4.3', true]]) {
  const ctx = {window:{AndroidI18n:{language:'hu'}}};
  vm.runInNewContext(fs.readFileSync(`versions/${v}/mms-strings.js`,'utf8'), ctx);
  const S = ctx.window.MmsStrings;
  assert.equal(S.t('Insert smiley'), 'Hangulatjel beszúrása');
  assert.equal(S.t('Delete?'), 'Törli?');
  assert.equal(S.has('Cell broadcasts'), cell, `${v} menu_cell_broadcasts`);
  assert.equal(S.SMILEYS.length, 21);
  for (const [name, , icon] of S.SMILEYS) { assert.ok(S.has(name), `${v} ${name}`); assert.ok(fs.existsSync(`versions/${v}/assets/mms-emo_im_${icon}.png`), `${v} ${icon}`); }
  for (const f of ['mms-ic_lock_message_sms.png', 'mms-ic_dialog_alert_holo_light.png']) assert.ok(fs.existsSync(`versions/${v}/assets/${f}`), `${v} ${f}`);
  const sim = engineSource(v), index = fs.readFileSync(`versions/${v}/index.html`, 'utf8');
  assert.ok(index.indexOf('mms-strings.js') > 0 && index.indexOf('mms-strings.js') < index.indexOf('messaging.js'), `${v} loads mms-strings.js first`);
  assert.equal(/Cell broadcasts/.test(sim), cell, `${v} Cell broadcasts menu item`);
  assert.doesNotMatch(sim, /Delete this conversation or message from the simulator/);
  assert.match(sim, /mmsDeleteLocked/);
}
// 4.3's RecipientsEditor is ex/chips: a picked contact is a chip (photo at its end; selected: chip_delete), and the
// suggestions are mms_chips_recipient_dropdown_item rows. 4.0.4's MultiAutoCompleteTextView has no chips.
{
  const ctx = {window:{}}; vm.runInNewContext(fs.readFileSync('versions/4.3/messaging.js','utf8'), ctx);
  const J = ctx.window.ICSMessaging, contacts = [{id:1,name:'Alex Morgan',phone:'202-555-0148'},{id:2,name:'Sam Rivera',phone:'202-555-0192'}];
  const compose = (draft, ui = {}) => J.render({contacts,messages:[],messageDrafts:{new:draft}}, {sub:'new',...ui}, k=>k, 'en-US');
  let html = compose({recipient:'202-555-0148',chip:true,query:''});
  assert.match(html, /<button type="button" class="mms-chip" data-action="mms-chip"[^>]*><span>Alex Morgan<\/span><img src="assets\/mms-ic_contact_picture\.png"/);
  assert.match(html, /<input name="recipient"[^>]*placeholder=""[^>]*value=""/);
  assert.match(compose({recipient:'202-555-0148',chip:true}, {mmsChipSelected:true}), /class="mms-chip selected"[^]*mms-chip_delete\.png/);
  assert.doesNotMatch(compose({recipient:'202-555-0148'}), /mms-chip/);
  const rows = J.suggestions('sam', contacts, k => k === 'Mobile' ? 'Mobil' : k);
  assert.match(rows, /data-action="mms-recipient" data-id="2"[^]*mms-suggestion-name">Sam Rivera[^]*<span>202-555-0192<\/span><small>Mobil<\/small>[^]*mms-ic_contact_picture\.png/);
  assert.equal(J.suggestions('  ', contacts, k=>k), '');
  for (const f of ['mms-chip_background.png','mms-chip_background_selected.png','mms-chip_delete.png']) assert.ok(fs.existsSync(`versions/4.3/assets/${f}`), f);
  const old = {window:{}}; vm.runInNewContext(fs.readFileSync('versions/4.0.4/messaging.js','utf8'), old);
  assert.equal(old.window.ICSMessaging.suggestions, undefined);
}
// Gingerbread draws Messaging with gb-mms.js; the ICS overlay is gone and messaging.js keeps the shared helpers.
assert.doesNotMatch(fs.readFileSync('versions/2.3.6/simulator.js','utf8'), /function renderMessageOverlay/);
const gb = {window:{}}; vm.runInNewContext(fs.readFileSync('versions/2.3.6/messaging.js','utf8'), gb);
assert.equal(gb.window.ICSMessaging.render, undefined);
assert.equal(typeof gb.window.ICSMessaging.threads, 'function');
console.log('Messaging image checks passed: Mms strings, smileys, menus and dialogs per image.');
