const assert=require('node:assert/strict'),fs=require('node:fs');
// Android 6.0.1 is built from its own image, nothing inherited (docs/plan-6.0.1.md, rules 1-5). This test keeps it that
// way, the 2.1 checks (tests/ec-leaks.test.cjs) with 5.1.1 as the nearest neighbour:
// - the page loads only mm- files and the shared root files (i18n.js, strings.js, state.js)
// - no 6.0.1 file reaches into another version's folder, names another era's modules (LPLauncher, EC.register …) or
//   carries another era's class names (.lp-…, .kk-…), the trace a copied stylesheet or render function leaves
// - every asset comes from the Nexus 5X image (the inventory's source is bullhead:…) or is our own, with its source named
// - every text table row of 6.0.1 names a resource of the bullhead image, or is marked own
const V='versions/6.0.1';
const files=fs.readdirSync(V).filter(f=>/\.(js|css|html)$/.test(f));
const html=fs.readFileSync(`${V}/index.html`,'utf8');
for(const [,ref] of html.matchAll(/(?:src|href)="([^":?#]+\.(?:js|css))[?"]/g)){
  assert.ok(/^mm-[\w-]+\.(js|css)$/.test(ref)||/^\.\.\/\.\.\/(i18n|strings|state|earth-globe)\.js$/.test(ref),`6.0.1 loads ${ref}`);
}
for(const f of files){
  assert.ok(f==='index.html'||f.startsWith('mm-'),`${V}/${f} has no mm- prefix`);
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  const other=src.match(/versions\/(?!6\.0\.1\/)[\d.]+\/|\.\.\/(?:2\.1|2\.3\.6|4\.0\.4|4\.3|4\.4\.4|5\.1\.1)\//);
  assert.equal(other,null,`${V}/${f} reaches into another version: ${other?.[0]}`);
  const era=src.match(/\b(GB|ICS|JB|KK|LP)[A-Z][A-Za-z]+\b|\bEC\.(?:register|module|text|strings)\b/);
  assert.equal(era,null,`${V}/${f} names another era's module: ${era?.[0]}`);
  const cls=src.match(/[.\s"'](?:lp|kk|jb|ics|gb|ec)-[a-z][\w-]*/);
  assert.equal(cls,null,`${V}/${f} carries another era's class name: ${cls?.[0]?.trim()}`);
}
const rows=fs.readFileSync('docs/reports/assets/6.0.1.tsv','utf8').trim().split('\n').slice(1).map(line=>line.split('\t'));
for(const [file,,status,source] of rows){
  if(status==='own'){assert.ok(source,`${file}: own, but no source`);continue;}
  assert.ok(source.startsWith('bullhead:'),`${file} comes from another image: ${source||status}`);
}
// Text tables: generated mm-strings-*.js files carry {res: 'bullhead:…'} or {own: true} rows.
for(const f of files.filter(f=>/^mm-strings-.*\.js$/.test(f))){
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  for(const m of src.matchAll(/"res":\s*"([^"]+)"|\bres:\s*'([^']+)'/g)){const res=m[1]||m[2];assert.ok(res.startsWith('bullhead:'),`${f}: ${res} is not a bullhead resource`);}
}
console.log('6.0.1 leak checks ok');
