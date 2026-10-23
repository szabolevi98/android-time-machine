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


test('SEND_MULTIPLE uses each native action filter rather than reusing single-stream targets',()=>{const {M}=model(),targets=type=>Object.keys(M.types).filter(id=>M.accepts(id,type,true)).sort();assert.deepEqual(targets('image/jpeg'),['beam','bluetooth','drive','gmail','messenger','photos']);assert.deepEqual(targets('video/mp4'),['beam','bluetooth','drive','gmail','photos','youtube']);assert.deepEqual(targets('audio/mpeg'),['beam','drive','gmail']);assert.deepEqual(targets('*/*'),['beam','drive','gmail']);assert.equal(M.accepts('bluetooth','x-mixmedia/*',true),true);});
test('Multi-stream snapshots preserve order and independent media/doc metadata, with an honest common MIME',()=>{const {M,c}=model();c.data.photos.push({id:1,kind:'photo',seed:7,time:100,edits:{look:2,lookIntensity:.8}},{id:2,kind:'photo',seed:19,time:200,edits:{temperature:20}},{id:3,kind:'video',seed:30,duration:9000});const s=M.normalize(c,{photos:[2,1],subject:'Album'});assert.equal(s.multiple,true);assert.equal(s.action,'android.intent.action.SEND_MULTIPLE');assert.equal(s.mime,'image/jpeg');assert.deepEqual(Array.from(s.streams,x=>x.photo),[2,1]);c.data.photos[0].edits.lookIntensity=.1;assert.equal(s.streams[1].photoSnapshot.edits.lookIntensity,.8);assert.equal(s.streams[0].photoSnapshot.edits.temperature,20);assert.equal(M.normalize(c,{photos:[1,3]}).mime,'*/*');const a={name:'A.pdf',type:'pdf',mime:'application/pdf',content:'one'},b={name:'B.txt',type:'text',mime:'text/plain',content:'two'},mixed=M.normalize(c,{streams:[{document:a},{document:b}]});a.content='changed';assert.equal(mixed.streams[0].document.content,'one');assert.equal(mixed.streams[1].document.content,'two');assert.equal(mixed.mime,'*/*');assert.equal(mixed.subject,undefined);});
test('A singleton document selection retains SEND target compatibility and top-level text/subject',()=>{const {M,c}=model(),s=M.normalize(c,{subject:'Notes',text:'Body',streams:[{document:{name:'Notes.txt',type:'text',mime:'text/plain',content:'notes'}}]});assert.equal(s.multiple,false);assert.equal(s.action,'android.intent.action.SEND');assert.equal(s.document.name,'Notes.txt');assert.equal(s.subject,'Notes');assert.equal(s.text,'Body');assert.equal(s.kind,'text');assert.equal(M.streams(s).length,1);});
