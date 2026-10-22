const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{test}=require('node:test');
function model(){const NG={};for(const f of ['ng-launcher-data.js','ng-widget-resize.js'])vm.runInNewContext(fs.readFileSync('versions/7.1.2/'+f,'utf8'),{NG});return {R:NG.widgetResize,provider:id=>NG.widgetProviders.find(w=>w.id===id)};}
const box=(id,x,y,spanX=1,spanY=1)=>({id,type:'widget',x,y,spanX,spanY});
test('Resize limits use native flags, explicit minima and the framework fallback for absent minima',()=>{
 const {R,provider}=model();for(const [id,x,y,mode]of [['digital',2,1,3],['analog',1,1,3],['drive-app_widget',4,1,1],['play-music-music_widget_info',4,1,3],['play-music-widget_ifl_info',1,1,0]]){const l=R.limits(provider(id));assert.equal(l.minX,x,id);assert.equal(l.minY,y,id);assert.equal(l.mode,mode,id);}
 assert.equal(R.limits(provider('play-store-widget_info')).mode,0);
});
test('Resize threshold, opposite edge and minima constrain the proposed cell rectangle without changing data',()=>{
 const {R,provider}=model(),w=box('clock',0,0,5,2),items=[w],info=provider('digital');
 assert.equal(R.proposal(items,w,{left:true},.65,0,info)[0].spanX,5);let r=R.proposal(items,w,{left:true},.7,0,info)[0];assert.equal(r.x,1);assert.equal(r.spanX,4);
 r=R.proposal(items,w,{left:true},10,0,info)[0];assert.equal(r.x,3);assert.equal(r.spanX,2);r=R.proposal(items,w,{bottom:true},0,-10,info)[0];assert.equal(r.spanY,1);assert.equal(r.y,0);assert.equal(w.spanX,5);assert.equal(w.spanY,2);
});
test('Horizontal-only providers ignore vertical movement and cannot pass the grid edge',()=>{
 const {R,provider}=model(),w=box('drive',0,2,4,1),info=provider('drive-app_widget');let r=R.proposal([w],w,{bottom:true},0,4,info)[0];assert.equal(r.spanY,1);r=R.proposal([w],w,{right:true},10,0,info)[0];assert.equal(r.spanX,5);r=R.proposal([w],w,{left:true},10,0,info)[0];assert.equal(r.spanX,4);
});
test('Resize reorders displaced cells transactionally and preserves other widgets spans',()=>{
 const {R}=model(),w=box('clock',0,0,2,1),other=box('other',2,0,2,1),fixed=box('icon',0,3),items=[w,other,fixed],before=JSON.stringify(items);
 const p=R.plan(items,w,{x:0,y:0,spanX:3,spanY:2},{x:1,y:1});assert.ok(p);assert.equal(p.find(r=>r.item===other).spanX,2);assert.equal(p.find(r=>r.item===fixed).y,3);assert.equal(JSON.stringify(items),before,'preview never writes the saved layout');
 for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){const a=p[i],b=p[j];assert.equal(a.x<b.x+b.spanX&&b.x<a.x+a.spanX&&a.y<b.y+b.spanY&&b.y<a.y+a.spanY,false);}
});
test('A full grid rejects the whole resize and leaves every item in its old position',()=>{
 const {R}=model(),w=box('clock',0,0),items=[w];for(let y=0;y<5;y++)for(let x=0;x<5;x++)if(x||y)items.push(box(`${x}:${y}`,x,y));const before=JSON.stringify(items);assert.equal(R.plan(items,w,{x:0,y:0,spanX:2,spanY:1}),null);assert.equal(JSON.stringify(items),before);
});
