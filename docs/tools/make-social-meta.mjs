// Static English SEO/Open Graph/X metadata, using the same English catalogue as the landing page.
// node docs/tools/make-social-meta.mjs [--check]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..'),site='https://android.levente.net/';
const box={window:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'versions/catalog.js'),'utf8'),box);
const image=site+'assets/og-cover.jpg?v=18';
const alt='Five Nexus phones showing their Android home screens beside the Android Time Machine title.';
const pages=[{file:'index.html',title:'Android Time Machine',socialTitle:'Android Time Machine â€“ old Androids in the browser',description:'Explore Android 2.1â€“7.1 on classic Nexus phones: home screens, notifications, settings and apps, in your browser. Nothing to install.',url:site},
 ...box.window.ANDROID_VERSIONS.filter(v=>v.status==='available').map(v=>({file:v.url+'index.html',title:`${v.version} ${v.name} Â· Android Time Machine`,socialTitle:`${v.version} ${v.name} â€“ ${v.device.split(' Â· ')[0]} simulator`,description:v.description,url:site+v.url}))];
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
for(const p of pages){
 const meta=(key,value,name=false)=>`  <meta ${name?'name':'property'}="${key}" content="${esc(value)}">`;
 const block=[meta('description',p.description,true),`  <title>${esc(p.title)}</title>`,meta('og:type','website'),meta('og:site_name','Android Time Machine'),meta('og:locale','en_US'),
  ...['hu_HU','de_DE','fr_FR','es_ES'].map(locale=>meta('og:locale:alternate',locale)),meta('og:title',p.socialTitle),meta('og:description',p.description),meta('og:url',p.url),
  meta('og:image',image),meta('og:image:type','image/jpeg'),meta('og:image:width','1200'),meta('og:image:height','630'),meta('og:image:alt',alt),
  meta('twitter:title',p.socialTitle,true),meta('twitter:description',p.description,true),meta('twitter:image',image,true),meta('twitter:image:alt',alt,true),meta('twitter:card','summary_large_image',true)].join('\n');
 const file=path.join(root,p.file),before=fs.readFileSync(file,'utf8');
 const pattern=/  <meta name="description"[^>]*>[\s\S]*?  <meta name="twitter:card"[^>]*>/;
 if(!pattern.test(before))throw new Error(`Metadata block not found: ${p.file}`);
 const after=before.replace(pattern,block);
 if(process.argv.includes('--check')){if(before.replaceAll('\r\n','\n')!==after.replaceAll('\r\n','\n')){console.error(`Stale metadata: ${p.file}`);process.exitCode=1;}}
 else fs.writeFileSync(file,after);
}
if(!process.exitCode)console.log(`English metadata ${process.argv.includes('--check')?'verified':'written'}: ${pages.length} pages.`);
