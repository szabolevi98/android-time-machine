require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Gallery crop on 2.3.6 (Gallery3D's CropImage / HighlightView) and 4.0.4 (Gallery2's CropImage / CropView): the menu
// entry, the crop screen, the drags and the cropped copy media.js draws from its source.
const listeners={};
const load=(v,files)=>{const context={window:{addEventListener:(k,f)=>{listeners[k]=f;},removeEventListener:k=>{delete listeners[k];}},document:{}};for(const f of files)vm.runInNewContext(fs.readFileSync(`versions/${v}/${f}`,'utf8'),context);return context.window;};
const decode=uri=>decodeURIComponent(uri.slice(uri.indexOf(',')+1));
const fakeFrame=(c,W,H)=>{const hl={style:{},classes:[],classList:{add:(...k)=>hl.classes.push(...k)},set className(v){hl.classes=[];}};return {hl,frame:{getBoundingClientRect:()=>({left:0,top:0,width:W,height:H}),querySelector:()=>hl}};};
const drag=(dragFn,from,to)=>{const ok=dragFn({clientX:from[0],clientY:from[1]});if(ok){listeners.pointermove({clientX:to[0],clientY:to[1]});listeners.pointerup();}return ok;};

// media.js: a cropped copy draws its source in a frame of the crop's size and turns with its own rotation.
for(const v of ['2.3.6','4.0.4']){
  const M=load(v,['media.js']).ICSMedia,src={id:1,name:'A',colors:['#96c8d0','#e8ad7a','#364e59']};
  assert.equal(JSON.stringify(M.size(src)),JSON.stringify([1024,768]));assert.equal(JSON.stringify(M.size({...src,rotation:90})),JSON.stringify([768,1024]));
  const copy={id:2,name:'A',source:src,crop:{x:.25,y:0,w:.5,h:1}};
  assert.equal(JSON.stringify(M.size(copy)),JSON.stringify([512,768]));assert.equal(JSON.stringify(M.size({...copy,rotation:270})),JSON.stringify([768,512]));
  const svg=decode(M.image(copy));
  assert.ok(svg.includes('width="512" height="768"')&&svg.includes('viewBox="256.00 0.00 512.00 768.00"')&&svg.includes('<image href="data:image/svg+xml,'),v);
  assert.ok(decode(M.image({...copy,rotation:90})).includes('rotate(90)'));
  const nested={id:3,source:copy,crop:{x:0,y:0,w:.5,h:.5}};assert.equal(JSON.stringify(M.size(nested)),JSON.stringify([256,384]));
}

// 2.3.6: More → Crop, makeDefault's centred square, Save / Discard, symmetric Grow and Move.
{
  const W=load('2.3.6',['media.js','gb-strings-gallery.js','gb-gallery.js']),G=W.GBGallery;
  const photo={id:1,name:'A',album:'pictures'},data={photos:[photo]};
  const ctx=extra=>({lang:'hu',locale:'hu',data,sub:'photo',album:'pictures',photo,selecting:true,selected:['1'],popup:'more',width:276,height:438,timebar:41,...extra});
  const more=G.render(ctx({}));assert.ok(more.includes('data-action="gbg-crop"')&&more.includes('Levágás')&&!more.includes('Unavailable in this simulator"><img src="assets/gb-g3-ic_menu_crop'));
  const c=G.cropDefault(photo);assert.ok(Math.abs(c.w*1024-614.4)<.01&&Math.abs(c.h*768-614.4)<.01&&Math.abs(c.x-(1-c.w)/2)<1e-9&&Math.abs(c.y-(1-c.h)/2)<1e-9);
  const screen=G.render(ctx({selecting:false,popup:'',crop:c}));
  assert.ok(screen.includes('gbg-crop')&&screen.includes('data-action="gbg-crop-save">Mentés')&&screen.includes('data-action="gbg-crop-discard">Elvetés')&&screen.includes('data-crop-hl'));
  const {frame}=fakeFrame(c,400,300),start={...c};
  // The right edge pulled 40 px in: both sides move in (growBy insets the box).
  assert.ok(drag(e=>G.cropDrag(e,frame,c,photo,()=>{}),[(c.x+c.w)*400,(c.y+c.h/2)*300],[(c.x+c.w)*400-40,(c.y+c.h/2)*300]));
  assert.ok(Math.abs(c.w-(start.w-80/400))<1e-9&&Math.abs(c.x-(start.x+40/400))<1e-9&&Math.abs(c.h-start.h)<1e-9);
  // Moving keeps the box on the picture; a press far outside does nothing.
  assert.ok(drag(e=>G.cropDrag(e,frame,c,photo,()=>{}),[(c.x+c.w/2)*400,(c.y+c.h/2)*300],[-500,-500]));
  assert.ok(c.x===0&&c.y===0);
  assert.equal(G.cropDrag({clientX:399,clientY:299},frame,c,photo,()=>{}),false);
  const sim=require('./lib/engine-source.cjs')('2.3.6');
  assert.ok(sim.includes("case 'gbg-crop-save':")&&sim.includes("source: clone(photo), crop:")&&sim.includes("ui.overlay === 'gb-dialog-crop-saving'")&&sim.includes("if (ui.gbgCrop) { ui.gbgCrop = null;"));
}

// 4.0.4: photo.xml's Crop after Rotate right, the action bar (crop_label, Cancel, crop_save_text), setInitRectangle's
// 0.2–0.8 box, single-edge resizing and the saving dialog.
{
  const W=load('4.0.4',['stock-strings.js','media.js']),M=W.ICSMedia,photo={id:1,name:'A',album:'pictures'},data={photos:[photo]},t=k=>k;
  const menu=M.overlay(data,{overlay:'gallery-menu',sub:'photo',selectedPhoto:1},t,'hu','hu');
  assert.ok(menu.indexOf('Rotate right')<menu.indexOf('data-action="gallery-crop"')&&menu.indexOf('data-action="gallery-crop"')<menu.indexOf('Details')&&menu.includes('Körbevágás'));
  const c=M.cropDefault();assert.equal(JSON.stringify(c),JSON.stringify({x:.2,y:.2,w:.6,h:.6}));
  const screen=M.gallery(data,{sub:'photo',selectedPhoto:1,galleryCrop:c},t,'hu');
  assert.ok(screen.includes('Kép levágása')&&screen.includes('data-action="gallery-crop-cancel">Mégse')&&screen.includes('data-action="gallery-crop-save">Körülvágás'));
  assert.ok(M.gallery(data,{sub:'photo',selectedPhoto:1,galleryCrop:c},t,'en').includes('data-action="gallery-crop-save">Crop<'));
  const {frame,hl}=fakeFrame(c,400,300);
  // Only the dragged edge moves.
  assert.ok(drag(e=>M.cropDrag(e,frame,c,()=>{}),[320,150],[280,150]));
  assert.ok(Math.abs(c.x-.2)<1e-9&&Math.abs(c.w-.5)<1e-9&&Math.abs(c.h-.6)<1e-9);
  assert.equal(M.cropDrag({clientX:5,clientY:5},frame,c,()=>{}),false);
  assert.ok(M.overlay(data,{overlay:'gallery-crop-saving',selectedPhoto:1},t,'hu','hu').includes('Kép mentése...'));
  const sim=fs.readFileSync('versions/4.0.4/simulator.js','utf8');
  assert.ok(sim.includes("case 'gallery-crop-save':")&&sim.includes('ui.selectedPhoto=copy.id')&&sim.includes("if (ui.overlay === 'gallery-crop-saving') return;"));
}
console.log('gallery-crop ok');
