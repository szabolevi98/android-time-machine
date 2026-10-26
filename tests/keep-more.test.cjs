require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
for(const version of ['4.3','4.4.4','5.1.1']){
  const sandbox={window:{},btoa:s=>Buffer.from(s,'binary').toString('base64')};
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(`versions/${version}/keep-more.js`,'utf8'),sandbox);
  const K=sandbox.window.KeepMore;
  sandbox.window.StockStrings={keep:{Play:{hu:'Google Play',de:'Anhören',fr:'Lire',es:'Google Play'}}};
  assert.equal(K.text({locale:'de',t(){throw new Error('native labels must not register a shared-table miss');}},'Play'),'Anhören');
  const audio=K.sample(1.25),wav=Buffer.from(audio.dataUrl.split(',')[1],'base64');
  assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.readUInt32LE(24),8000);
  assert.equal(wav.length,44+10000);assert.equal(wav.readUInt32LE(40),10000);
  assert.ok(wav.subarray(44).some(n=>n!==128),'the demo recording is playable PCM, not an empty marker');
  const note={id:'original',text:'Museum',archived:true,color:2,list:[{text:'Ticket',checked:true}],audio};
  let saves=0;const c={data:{keepNotes:[note],settings:{}},ui:{view:'keep',keepNote:'original'},saveNote(){note.text='Fresh editor text';},save(){saves++;},render(){},renderOverlay(){}};
  assert.equal(K.handle('kp-copy','',c),true);
  const copy=c.data.keepNotes[0];assert.notEqual(copy.id,note.id);assert.equal(copy.text,'Fresh editor text');assert.equal(copy.archived,false);
  copy.list[0].text='Changed';copy.audio.duration=9;
  assert.equal(note.list[0].text,'Ticket');assert.equal(note.audio.duration,1.25,'copies do not share mutable audio metadata');
  assert.equal(K.noteText(note),'Fresh editor text\n☑ Ticket');assert.equal(saves,1);
}
console.log('Keep copy isolation and persisted PCM audio checks passed.');
