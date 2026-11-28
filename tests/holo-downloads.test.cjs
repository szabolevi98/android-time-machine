require('./lib/vm-strings.cjs');
const engineSource = require('./lib/engine-source.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Galaxy Nexus 4.0.4 and Nexus 4 4.3: DownloadList (ics-downloads.js / jb-downloads.js from docs/templates/holo-downloads.template.js).
for(const [v,f,failed] of [['4.0.4','ics-downloads.js','Failed'],['4.3','jb-downloads.js','Unsuccessful']]){
  const w={setTimeout};w.window=w;vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),w);
  const H=w.HoloDownloads,now=new Date(2012,5,20,15).getTime(),opened=[],toasts=[];
  const ctx={data:{},ui:{overlay:''},lang:'en',locale:'en-US',now,hour24:false,t:k=>k,save(){},render(){},renderOverlay(){},toast:m=>toasts.push(m),openApp:a=>opened.push(a)};
  let html=H.render(ctx);
  assert.ok(html.includes('Downloads - Sorted by date')&&html.includes('beach-panorama.jpg')&&html.includes('Sort by size'),v);
  assert.equal(H.size(1384448,'en-US'),'1.32 MB');
  H.handle('hdl-select','1',ctx);html=H.render(ctx);assert.ok(html.includes('Selected 1 out of 6')&&html.includes('dl-ic_menu_share.png'));
  H.handle('hdl-delete',null,ctx);assert.equal(ctx.data.downloads.length,5);
  H.handle('hdl-sort',null,ctx);html=H.render(ctx);assert.ok(html.includes('Downloads - Sorted by size')&&html.includes(`<small>${failed}</small>`),v);
  H.handle('hdl-open','3',ctx);assert.equal(ctx.ui.overlay,'hdl-failed:3');assert.ok(H.overlay(ctx).includes('Retry'));
  ctx.ui.overlay='';H.handle('hdl-open','4',ctx);assert.equal(opened.at(-1),'browser');
  assert.equal(H.T('hu','Sort by size'),'Rendezés méret szerint');assert.equal(H.T('hu','Today'),'ma');
  const sim=engineSource(v);assert.ok(sim.includes("case 'downloads': return HoloDownloads.render(dlContext());"));
}
console.log('holo-downloads ok');
