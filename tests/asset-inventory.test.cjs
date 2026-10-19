const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
// Audit point 12: the asset inventory (docs/reports/assets/<version>.tsv, docs/tools/asset-inventory.py) lists every asset file of a
// version, and each file still has the hash it was traced with. Rebuilding the files from the factory images needs the
// images: python docs/tools/asset-inventory.py --check.
// An SVG counts with LF line ends, as Git stores it (a Windows checkout turns them into CRLF).
const sha=file=>{const data=fs.readFileSync(file);return crypto.createHash('sha256').update(file.endsWith('.svg')?Buffer.from(data.toString('latin1').replace(/\r\n/g,'\n'),'latin1'):data).digest('hex').slice(0,16);};
for(const v of ['2.1','2.3.6','4.0.4','4.3','4.4.4','5.1.1','6.0.1','7.1.2']){
  const rows=fs.readFileSync(`docs/reports/assets/${v}.tsv`,'utf8').trim().split('\n').slice(1).map(line=>line.split('\t'));
  const files=fs.readdirSync(`versions/${v}/assets`).map(f=>`versions/${v}/assets/${f}`)
    .concat(v==='2.3.6'?fs.readdirSync('assets/audio').map(f=>`assets/audio/${f}`):[]).sort();
  assert.deepEqual(rows.map(r=>r[0]).sort(),files,`${v}: the inventory lists other files (python docs/tools/asset-inventory.py ${v})`);
  const changed=rows.filter(r=>sha(r[0])!==r[1]).map(r=>r[0]);
  assert.deepEqual(changed,[],`${v}: changed since the inventory (python docs/tools/asset-inventory.py ${v})`);
  for(const r of rows)assert.ok(r[2]!=='own'||r[3],`${v}: ${r[0]} has no source`);
}
console.log('asset inventory ok');
