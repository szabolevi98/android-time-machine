require('./lib/vm-strings.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
// Keep list and picture notes (audit step 5): Keep 1.0 (4.3), 2.0 (4.4.4) and 3.0 (5.1.1).
const list=['Milk','Eggs','Bread','Coffee','Apples','Butter','Cheese'].map((text,i)=>({text,checked:i===1||i===4}));
for(const [v,max,checked] of [['4.3',4,'kp-ic_checked_dark.png'],['4.4.4',4,'kp2-ic_checked_dark.png'],['5.1.1',6,'kp3-ic_material_box_checked_dark.png']]){
  const w={window:{GELNow:{render:()=>''},ICSMedia:{image:p=>`photo-${p.id}.png`}}};w.window.window=w.window;
  vm.runInNewContext(fs.readFileSync(`versions/${v}/stock-apps.js`,'utf8'),w);
  const A=w.window.StockApps,data={photos:[{id:7}],keepNotes:[{id:'l',text:'',color:0,list},{id:'p',text:'Trip',color:0,photo:7}]};
  const ctx=(ui={})=>({ui,data,t:k=>k,locale:'en',now:new Date(2014,5,20)});
  // Browse: the list card shows at most four (3.0: six) items, then the ellipse; checked items carry the checked box.
  const browse=A.render('keep',ctx());
  const card=browse.slice(browse.indexOf('data-id="l"'),browse.indexOf('</button>',browse.indexOf('data-id="l"')));
  assert.equal((card.match(/class="kp-li/g)||[]).length,max,v);assert.match(card,/kp-ellipse/);assert.match(card,new RegExp(checked.replace('.','\\.')));
  assert.match(browse,/<img class="kp-photo" src="photo-7\.png"/);assert.match(browse,/data-no-translate data-action="keep-open"/);
  // 3.0 puts the unchecked items first on the card.
  if(v==='5.1.1')assert.match(card,/Cheese[\s\S]*Eggs/);else assert.match(card,/Eggs[\s\S]*Bread/);
  // The editor: rows with check boxes and the "List item" footer form; the picture with its delete button.
  const ed=A.render('keep',ctx({sub:'note',keepNote:'l'}));
  assert.equal((ed.match(/data-action="keep-li-check"/g)||[]).length,7);assert.match(ed,/data-form="keep-li-add"/);assert.match(ed,/placeholder="List item"/);
  assert.match(A.render('keep',ctx({sub:'note',keepNote:'p'})),/data-action="keep-photo-remove"[\s\S]*class="keep-text"/);
  if(v==='5.1.1'){assert.match(ed,/kp-grave-head[\s\S]*Checked/);assert.doesNotMatch(A.render('keep',ctx({sub:'note',keepNote:'l',keepGraveClosed:true})),/data-keep-li="1"/);}
  // Dialogs: Add picture (2.0 / 3.0), Remove photo and Delete checked items.
  assert.match(A.render('keep',ctx({keepDialog:'picture'})),/keep-photo-take[\s\S]*Take photo[\s\S]*keep-photo-choose[\s\S]*Choose photo/);
  assert.match(A.render('keep',ctx({sub:'note',keepNote:'p',keepDialog:'remove-photo'})),/kp-dlg[\s\S]*keep-photo-delete/);
  assert.match(A.render('keep',ctx({sub:'note',keepNote:'l',keepDialog:'hide-checkboxes'})),/Delete checked items\?[\s\S]*keep-hide-keep[\s\S]*keep-hide-delete/);
  // The note menu offers Hide checkboxes on a list and Show checkboxes on text.
  const menu=note=>Array.from(A.menu('keep',{...ctx({sub:'note',keepNote:note}),data})).map(i=>i.title);
  assert.ok(menu('l').includes('Hide checkboxes')&&menu('p').includes('Show checkboxes'),v);
  // Strings come from the image's Keep.
  const strings=fs.readFileSync(`versions/${v}/stock-strings.js`,'utf8');
  for(const key of ['List item','Hide checkboxes','Delete checked items?','Remove photo?'])assert.ok(strings.includes(`"${key}"`),`${v} ${key}`);
  for(const f of [checked,'kp'+(v==='4.3'?'':v==='4.4.4'?'2':'3')+'-'+(v==='5.1.1'?'ic_material_delete_dark.png':'ic_delete_dark.png')])assert.ok(fs.existsSync(`versions/${v}/assets/${f}`),f);
  // simulator.js: the actions, the list item form and the picture flows.
  const sim=fs.readFileSync(`versions/${v}/simulator.js`,'utf8');
  for(const a of ['keep-new-list','keep-li-check','keep-li-delete','keep-checkboxes','keep-hide-delete','keep-photo-take','keep-photo-delete','keep-li-add'])assert.ok(sim.includes(`case '${a}'`),`${v} ${a}`);
  // Choose photo goes through the image's document picker: 4.4.4's own, 5.1.1's DocumentsUI (lp-docpicker.js).
  if(v!=='4.3')assert.ok(sim.includes("case 'keep-photo-choose'")&&(v==='5.1.1'?sim.includes("docPick('keep', 'image/*')")&&sim.includes("if (caller === 'keep')"):sim.includes("if (ui.docPickFor === 'keep')")),v);
}
console.log('keep-notes ok');
