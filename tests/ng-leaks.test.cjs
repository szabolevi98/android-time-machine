const assert=require('node:assert/strict'),fs=require('node:fs');
// Android 7.1.2 is built from its own image, nothing inherited (docs/plan-7.1.2.md, rules 1-5). This test keeps it that
// way, the 6.0.1 checks (tests/mm-leaks.test.cjs) with 6.0.1 as the nearest neighbour:
// - the page loads only ng- files and the shared root files (i18n.js, strings.js, state.js, earth-globe.js: the Blue
//   Marble globe every Earth draws, owner decision 2026-10-26)
// - no 7.1.2 file reaches into another version's folder, names another era's modules (MM.register, LPLauncher …) or
//   carries another era's class names (.mm-…, .lp-…), the trace a copied stylesheet or render function leaves
// - every asset comes from the Nexus 6P image (the inventory's source is angler:…) or is our own, with its source named
// - every text table row of 7.1.2 names a resource of the angler image, or is marked own
const V='versions/7.1.2';
const files=fs.readdirSync(V).filter(f=>/\.(js|css|html)$/.test(f));
const html=fs.readFileSync(`${V}/index.html`,'utf8');
for(const [,ref] of html.matchAll(/(?:src|href)="([^":?#]+\.(?:js|css))[?"]/g)){
  assert.ok(/^ng-[\w-]+\.(js|css)$/.test(ref)||/^\.\.\/\.\.\/(i18n|strings|state|earth-globe)\.js$/.test(ref),`7.1.2 loads ${ref}`);
}
for(const f of files){
  assert.ok(f==='index.html'||f.startsWith('ng-'),`${V}/${f} has no ng- prefix`);
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  const other=src.match(/versions\/(?!7\.1\.2\/)[\d.]+\/|\.\.\/(?:2\.1|2\.3\.6|4\.0\.4|4\.3|4\.4\.4|5\.1\.1|6\.0\.1)\//);
  assert.equal(other,null,`${V}/${f} reaches into another version: ${other?.[0]}`);
  const era=src.match(/\b(GB|ICS|JB|KK|LP)[A-Z][A-Za-z]+\b|\b(?:EC|MM)\.(?:register|module|text|strings|defaults)\b/);
  assert.equal(era,null,`${V}/${f} names another era's module: ${era?.[0]}`);
  const cls=src.match(/[.\s"'](?:mm|lp|kk|jb|ics|gb|ec)-[a-z][\w-]*|\.mm[a-z]+-/);
  assert.equal(cls,null,`${V}/${f} carries another era's class name: ${cls?.[0]?.trim()}`);
}
const rows=fs.readFileSync('docs/reports/assets/7.1.2.tsv','utf8').trim().split('\n').slice(1).map(line=>line.split('\t'));
for(const [file,,status,source] of rows){
  if(status==='own'){assert.ok(source,`${file}: own, but no source`);continue;}
  assert.ok(source.startsWith('angler:'),`${file} comes from another image: ${source||status}`);
}
// Text tables: generated ng-strings-*.js files carry {res: 'angler:…'} or {own: true} rows.
for(const f of files.filter(f=>/^ng-strings-.*\.js$/.test(f))){
  const src=fs.readFileSync(`${V}/${f}`,'utf8');
  for(const m of src.matchAll(/"res":\s*"([^"]+)"|\bres:\s*'([^']+)'/g)){const res=m[1]||m[2];assert.ok(res.startsWith('angler:'),`${f}: ${res} is not an angler resource`);}
}
console.log('7.1.2 leak checks ok');
