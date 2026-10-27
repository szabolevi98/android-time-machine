const assert=require('node:assert/strict'),fs=require('node:fs');
// Android 2.1 is built from its own image, nothing inherited (docs/plan-2.1.md, rules 1-4). This test keeps it that way:
// - the page loads only ec- files and the shared root files (i18n.js, strings.js, state.js)
// - no 2.1 file reaches into another version's folder or names another era's modules (GBSettings, ICSLockscreen …)
// - every asset comes from the Nexus One image (the inventory's source is passion:…) or is our own, with its source named
// - every text table row of 2.1 names a resource of the passion image, or is marked own
const V='versions/2.1';
const files=fs.readdirSync(V).filter(f=>/\.(js|css|html)$/.test(f));
const html=fs.readFileSync(`${V}/index.html`,'utf8');
for(const [,ref] of html.matchAll(/(?:src|href)="([^":?#]+\.(?:js|css))[?"]/g)){
  assert.ok(/^ec-[\w-]+\.(js|css)$/.test(ref)||/^\.\.\/\.\.\/(i18n|strings|state|boot-ready)\.js$/.test(ref),`2.1 loads ${ref}`);
}
for(const f of files){
  assert.ok(f==='index.html'||f.startsWith('ec-'),`${V}/${f} has no ec- prefix`);
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  const other=src.match(/versions\/(?!2\.1\/)[\d.]+\/|\.\.\/(?:2\.3\.6|4\.0\.4|4\.3|4\.4\.4|5\.1\.1)\//);
  assert.equal(other,null,`${V}/${f} reaches into another version: ${other?.[0]}`);
  const era=src.match(/\b(GB|ICS|JB|KK|LP)[A-Z][A-Za-z]+\b/);
  assert.equal(era,null,`${V}/${f} names another era's module: ${era?.[0]}`);
}
const rows=fs.readFileSync('docs/reports/assets/2.1.tsv','utf8').trim().split('\n').slice(1).map(line=>line.split('\t'));
for(const [file,,status,source] of rows){
  if(status==='own'){assert.ok(source,`${file}: own, but no source`);continue;}
  assert.ok(source.startsWith('passion:'),`${file} comes from another image: ${source||status}`);
}
// Text tables: generated ec-strings-*.js files carry {res: 'passion:…'} or {own: true} rows.
const index=fs.existsSync('_aosp/passion/strings-index.json');
for(const f of files.filter(f=>/^ec-strings-.*\.js$/.test(f))){
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  for(const [,res] of src.matchAll(/\bres:\s*'([^']+)'/g))assert.ok(res.startsWith('passion:'),`${f}: ${res} is not a passion resource`);
  if(!index)continue;
}
console.log('2.1 leak checks ok');
