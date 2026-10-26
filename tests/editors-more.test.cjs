require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c={window:{},TextEncoder};vm.runInNewContext(fs.readFileSync('versions/5.1.1/editors-more.js','utf8'),c);
const M=c.window.EditorMore,seed=[{id:'b',kind:'doc',name:'Beta',text:'árvíz',pinned:true,mtime:2},{id:'a',kind:'doc',name:'Alpha',text:'one',mtime:1},{id:'s',kind:'sheet',name:'Sheet'},{id:'gone',kind:'doc',name:'Deleted',trashed:true},{id:'folder',kind:'folder',name:'Folder'}],data={driveFiles:seed},ui={view:'docs',edFile:'a'},ctx=()=>({data,ui,files:data.driveFiles,locale:'en',t:k=>k,save(){},render(){},renderOverlay(){}});
M.handle('emore-sort-pick','title',ctx());
assert.deepEqual(Array.from(M.list('docs',ctx()),f=>f.id),['a','b']);
assert.equal(M.prefs(data,'sheets').sort,'modified','apps have independent preferences');
M.handle('emore-move','',ctx());M.handle('emore-move-folder','folder',ctx());M.handle('emore-cancel','',ctx());assert.equal(data.driveFiles.find(f=>f.id==='a').parent,undefined);
M.handle('emore-move','',ctx());M.handle('emore-move-folder','folder',ctx());M.handle('emore-move-ok','',ctx());assert.equal(data.driveFiles.find(f=>f.id==='a').parent,'folder');assert.equal(seed[1].parent,undefined,'file operations do not mutate the default catalogue');
M.handle('emore-pin','',ctx());M.handle('emore-collection','offline',ctx());assert.deepEqual(Array.from(M.list('docs',ctx()),f=>f.id),['a','b']);
M.handle('emore-link','',ctx());data.driveFiles.find(f=>f.id==='a').text='later edit';assert.equal(ui.editorShare.text,'one','SEND owns a snapshot');
const f=M.attachment(seed[0]);assert.equal(f.mime,'text/plain');assert.equal(f.text,'árvíz');assert.equal(f.size,7);assert.match(M.link(seed[0]),/document\/d\/b\/edit$/);
console.log('Editors independent collections, sorting, transactional move, immutable catalogue and SEND snapshots passed.');

// Upgraded/provider files may have a timestamp without the legacy preformatted date string.
c.EditorMore=M;vm.runInNewContext(fs.readFileSync('versions/5.1.1/lp-extra-apps.js','utf8'),c);
const html=c.window.LPExtraApps.render('docs',{...ctx(),t:k=>k});
assert.ok(!html.includes('Modified: %s'),'a real provider timestamp must replace the native format placeholder');
