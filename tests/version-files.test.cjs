const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
// Every version owns its files (audit step 4): a file in versions/<v> carries no other era's prefix, index.html loads
// only files that exist there, and no two versions ship the same file byte for byte (line endings aside). The groups
// below are the copies left when the rule came in (2026-10-06); the list may only shrink: a new identical pair fails,
// and so does an entry whose files have since diverged (remove it then).
const OWN={'2.1':'ec','2.3.6':'gb','4.0.4':'ics','4.3':'jb','4.4.4':'kk','5.1.1':'lp','6.0.1':'mm','7.1.2':'ng'},ERAS=Object.values(OWN),V=Object.keys(OWN);
const SHARED={
  // Logic and data without an era look.
  'calculator-engine.js':[['2.3.6','4.0.4','4.3','4.4.4','5.1.1']],'browser-session.js':[['4.0.4','4.3','4.4.4','5.1.1']],
  'play-store.js':[['4.0.4','4.3']],
  // Not yet checked against each image (the audit's follow-up list in docs/audit-plan-2026-10.md).
  
  
  
  
  
  
  
  
  // In dp the stylesheets of one scale stay alike: 4.3 (0.8516 px a dp) no longer matches 4.4.4 / 5.1.1 (0.906).
  'settings-system.css':[['4.4.4','5.1.1']],
};
const files={};
for(const v of V){
  files[v]=fs.readdirSync(`versions/${v}`).filter(f=>/\.(js|css|html)$/.test(f));
  for(const f of files[v]){const era=f.match(/^([a-z]+)-/)?.[1];if(ERAS.includes(era))assert.equal(era,OWN[v],`versions/${v}/${f} carries the ${era}- prefix`);}
  const html=fs.readFileSync(`versions/${v}/index.html`,'utf8');
  for(const [,ref] of html.matchAll(/(?:src|href)="([^":?#/]+\.(?:js|css))[?"]/g))assert.ok(files[v].includes(ref),`versions/${v}/index.html loads a missing ${ref}`);
}
// The module name without its era prefix, so kk-gallery.js and lp-gallery.js meet as gallery.js.
const base=f=>f.replace(new RegExp(`^(${ERAS.join('|')})-`),'');
const groups=new Map();
for(const v of V)for(const f of files[v]){if(f==='index.html')continue;const h=crypto.createHash('sha1').update(fs.readFileSync(`versions/${v}/${f}`,'utf8').replace(/\r\n/g,'\n')).digest('hex');if(!groups.has(h))groups.set(h,[]);groups.get(h).push([v,f]);}
const found={};
for(const list of groups.values()){
  if(list.length<2)continue;
  const names=[...new Set(list.map(([,f])=>base(f)))];
  assert.equal(names.length,1,`identical files under different names: ${list.map(([v,f])=>v+'/'+f).join(', ')}`);
  (found[names[0]]??=[]).push(list.map(([v])=>v));
}
const key=g=>g.map(l=>l.join(',')).sort().join(' | ');
for(const [name,got] of Object.entries(found))assert.equal(key(got),key(SHARED[name]||[]),`${name}: identical in ${key(got)}; allowed ${key(SHARED[name]||[])||'nowhere'}`);
for(const name of Object.keys(SHARED))assert.ok(found[name],`${name} is no longer shared byte for byte: drop it from SHARED`);
console.log('version-files ok');
