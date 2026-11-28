require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Downloads opens DocumentsUI in manage mode: KitKat's Holo Light version (kk-downloads.js) and Lollipop's own Material
// DocumentsUI 5.1.1 (lp-downloads.js), each with the mime icons of its image's APK.
const load=(v,f,name)=>{const c={window:{}};vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),c);return c.window[name];};
const KK=load('4.4.4','kk-downloads.js','KKDownloads'),LP=load('5.1.1','lp-downloads.js','LPDownloads');
const items=[{name:'a.pdf',size:2480000,time:Date.now()-3600e3},{name:'b.apk',size:5e6,time:Date.now()-864e5*400},{name:'c.bin',size:900,time:Date.now()}];
for(const [v,M,prefix] of [['4.4.4',KK,'kdu'],['5.1.1',LP,'ldu']]){
  assert.equal(M.mime('x.PNG'),'image');assert.equal(M.mime('x.apk'),'apk');assert.equal(M.mime('x.unknown'),'generic_am');
  const html=M.render(items,{},k=>k,'en-US');
  for(const src of new Set(html.match(/assets\/[\w.-]+\.png/g)))assert.ok(fs.existsSync(`versions/${v}/${src}`),`${v} ${src}`);
  assert.match(html,new RegExp(`${prefix}-ic_doc_pdf`));assert.equal(M.render([],{},k=>k,'en-US').includes('No items'),true);
  assert.deepEqual(Array.from(M.sorted(items,'size'),i=>i.name),['b.apk','a.pdf','c.bin']);
}
// Lollipop: the Material Toolbar in colorPrimary, the dark-theme white icons, Material popups; no Holo leftovers.
const lp=LP.render(items,{dlGrid:true},k=>k,'en-US'),css=fs.readFileSync('versions/5.1.1/lp-downloads.css','utf8');
assert.match(lp,/ldu-toolbar/);assert.match(lp,/ldu-cell/);assert.doesNotMatch(lp,/kdu-|holo/);
assert.match(css,/\.ldu-toolbar\{[^}]*background:#37474f/);assert.match(LP.menu('sort',{},k=>k),/lp-popup-menu/);
const sim=engineSource('5.1.1');
assert.match(sim,/LPDownloads\.render/);assert.doesNotMatch(sim,/KKDownloads/);assert.match(sim,/downloads: '#263238'/);assert.match(sim,/downloads: '#37474f'/);
console.log('Downloads checks passed: DocumentsUI per image, mime icons, sorting, Lollipop Material toolbar.');
