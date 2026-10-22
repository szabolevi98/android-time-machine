const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
function model(){const NG={defaults:{}};for(const f of ['ng-media.js','ng-send-model.js'])vm.runInNewContext(fs.readFileSync('versions/7.1.2/'+f,'utf8'),{NG});const c={data:{photos:[]},save(){}};NG.photoLibrary={find:(c,id)=>c.data.photos.find(p=>p.id===+id)};return {NG,c,M:NG.sendModel};}
test('SEND MIME sets include separate video aliases and exclude undeclared audio/file targets',()=>{
 const {M}=model(),targets=mime=>Object.keys(M.types).filter(id=>M.accepts(id,mime)).sort();
 assert.deepEqual(targets('video/mp4'),['beam','bluetooth','cloudprint','drive','gmail','hangouts','messenger','photos','youtube']);
 assert.deepEqual(targets('audio/mpeg'),['beam','bluetooth','cloudprint','drive','gmail','messenger']);
 assert.deepEqual(targets('application/ogg'),['beam','cloudprint','drive','gmail','messenger']);
 assert.deepEqual(targets('application/octet-stream'),['beam','cloudprint','drive','gmail']);
 assert.equal(M.accepts('hangouts','text/html'),false);assert.equal(M.accepts('clipboard','text/plain'),true);assert.equal(M.accepts('photos','application/vnd.google.panorama360+jpg'),true);
});
test('The stream corrects a mislabelled Photos video and snapshots capture metadata at share time',()=>{
 const {M,c}=model(),p={id:1,kind:'video',seed:91,duration:6500,ratio:16/9,time:12345,edits:{light:10},fileName:'Clip.mp4'};c.data.photos.push(p);
 const s=M.normalize(c,{kind:'image',photo:1,name:'Clip.mp4'});assert.equal(s.kind,'video');assert.equal(s.mime,'video/mp4');assert.equal(s.document.type,'video');assert.equal(s.document.duration,6500);assert.equal(s.document.mediaSnapshot.time,12345);p.edits.light=99;assert.equal(s.document.mediaSnapshot.edits.light,10);
});
test('Audio normalization keeps independent file tags, duration and a parameter-free native MIME',()=>{
 const {M,c}=model(),node={type:'audio',name:'Loop.ogg',mime:'application/ogg; charset=binary',duration:9000,title:'Loop',artist:'Demo',album:'Samples',art:{color:'#fff'}};
 const s=M.normalize(c,{kind:'file',document:node});assert.equal(s.kind,'audio');assert.equal(s.mime,'application/ogg');assert.equal(s.document.title,'Loop');assert.equal(s.document.duration,9000);node.art.color='#000';assert.equal(s.document.art.color,'#fff');
});
test('Receiving media copies preserves capture time, duration and filename while detaching the provider snapshot',()=>{
 const {NG,c}=model(),source={kind:'video',seed:44,duration:12000,time:678,edits:{color:8}};
 const id=NG.media.fromDocument(c,{name:'Shared.mp4',type:'video',duration:12000,mediaSnapshot:source},'messenger'),p=NG.photoLibrary.find(c,id);assert.equal(p.fileName,'Shared.mp4');assert.equal(p.time,678);assert.equal(p.duration,12000);assert.equal(p.appPrivate,'messenger');source.edits.color=99;assert.equal(p.edits.color,8);assert.equal(NG.media.photos(c).length,0);
 const sent=NG.media.fromDocument(c,{name:p.fileName,photo:id},'sms-provider');assert.notEqual(sent,id);assert.equal(NG.photoLibrary.find(c,sent).duration,12000);assert.equal(NG.media.photos(c).length,0);
});
