/* DocumentsUI 7.1.2: browser-local document provider. The files below are invented demo content;
   Camera media and Drive uploads are exposed through the same provider operations. */
(() => {
  'use strict';
  const DAY=864e5;
  NG.defaults.documents={grid:false,sort:'date',showInternal:false,showSize:true,nodes:[
    {id:'download',parent:'internal',name:'Download',type:'dir'},
    {id:'documents',parent:'internal',name:'Documents',type:'dir'},
    {id:'pictures',parent:'internal',name:'Pictures',type:'dir'},
    {id:'dcim',parent:'internal',name:'DCIM',type:'dir'},
    {id:'camera',parent:'dcim',name:'Camera',type:'dir'},
    {id:'music',parent:'internal',name:'Music',type:'dir'},
    {id:'file-1',parent:'download',name:'Android-7.1.2.txt',type:'text',size:1248,time:Date.now()-DAY,content:'Welcome to Android 7.1.2 on the Nexus 6P.\n\nNougat brings split-screen apps, quick switching in Overview, bundled notifications and direct reply.\n\nThis is an offline demo document in Android Time Machine.'},
    {id:'file-2',parent:'download',name:'Meetup-slides.pdf',type:'pdf',size:2480000,time:Date.now()-2*DAY,content:'Android meetup\n\n1. The Android timeline\n2. Material Design\n3. What is new in Nougat\n4. Questions and discussion'},
    {id:'file-3',parent:'documents',name:'Weekend.txt',type:'text',size:180,time:Date.now()-3*DAY,content:'Coffee with Alex at 11.\nHike on Saturday.\nBring dessert to Mom on Sunday.'}
  ]};
  const state=c=>c.data.documents||(c.data.documents=JSON.parse(JSON.stringify(NG.defaults.documents)));
  const mime=type=>({text:'text/plain',pdf:'application/pdf',image:'image/jpeg',video:'video/mp4',audio:'audio/mpeg',dir:'vnd.android.document/directory'})[type]||'application/octet-stream';
  function nodes(c){
    const photos=NG.media.photos(c).map(p=>({id:`photo:${p.id}`,parent:p.folder||'camera',name:p.fileName||`${p.kind==='video'?'VID':'IMG'}_${p.id}.${p.kind==='video'?'mp4':'jpg'}`,type:p.kind==='video'?'video':'image',photo:p.id,size:p.kind==='video'?Math.max(1e6,(p.duration||1000)*1200):3200000,time:p.time}));
    const drive=(c.data.driveFiles||[]).map((p,i)=>({id:`drive:${i}`,parent:'drive',name:p.name||'Untitled',type:p.type==='image'?'image':'text',size:p.size||2048,time:p.time||0,content:p.content||''}));
    return [...state(c).nodes,...photos,...drive];
  }
  const find=(c,id)=>nodes(c).find(n=>n.id===id);
  const valid=name=>typeof name==='string'&&!!name.trim()&&!/[\\/\x00-\x1f]/.test(name)&&!['.','..'].includes(name.trim());
  function available(c,parent,name,except){return valid(name)&&!nodes(c).some(n=>n.parent===parent&&n.name.toLocaleLowerCase()===name.trim().toLocaleLowerCase()&&n.id!==except);}
  function list(c,parent,query=''){
    const q=query.toLocaleLowerCase(),type=parent==='images'?'image':parent==='videos'?'video':parent==='audio'?'audio':null;
    return nodes(c).filter(n=>(parent==='recent'?n.type!=='dir':type?n.type===type:n.parent===parent)&&(!q||n.name.toLocaleLowerCase().includes(q))).sort((a,b)=>{
      const folder=(a.type==='dir'?0:1)-(b.type==='dir'?0:1);if(folder)return folder;
      const sort=state(c).sort;return sort==='name'?a.name.localeCompare(b.name):sort==='size'?b.size-a.size||a.name.localeCompare(b.name):(b.time||0)-(a.time||0)||a.name.localeCompare(b.name);
    });
  }
  function create(c,parent,name,type='dir',content=''){
    if(!['internal','drive'].includes(parent)&&find(c,parent)?.type!=='dir')return null;
    if(!available(c,parent,name))return null;
    const all=state(c).nodes,id=`file-${Math.max(0,...all.map(n=>+(n.id.match(/^file-(\d+)$/)?.[1]||0)))+1}`;
    const n={id,parent,name:name.trim(),type,content,size:content.length,time:Date.now()};all.push(n);c.save();return n;
  }
  function rename(c,id,name){const n=find(c,id);if(!n||!available(c,n.parent,name,id))return false;
    if(n.photo){NG.photoLibrary.find(c,n.photo).fileName=name.trim();}
    else if(id.startsWith('drive:'))c.data.driveFiles[+id.slice(6)].name=name.trim();
    else state(c).nodes.find(n=>n.id===id).name=name.trim();c.save();return true;
  }
  function descendants(c,id){const result=new Set([id]);let changed=true;while(changed){changed=false;for(const n of nodes(c))if(result.has(n.parent)&&!result.has(n.id)){result.add(n.id);changed=true;}}return result;}
  function remove(c,ids){const gone=new Set(ids.flatMap(id=>[...descendants(c,id)]));const photos=nodes(c).filter(n=>gone.has(n.id)&&n.photo).map(n=>n.photo);if(photos.length)NG.photoLibrary.trash(c,photos);
    state(c).nodes=state(c).nodes.filter(n=>!gone.has(n.id));c.data.driveFiles=(c.data.driveFiles||[]).filter((_,i)=>!gone.has(`drive:${i}`));c.save();
  }
  function transfer(c,ids,parent,copy=false){
    if(!['internal','drive'].includes(parent)&&find(c,parent)?.type!=='dir')return false;
    const unique=[...new Set(ids)],roots=unique.filter(id=>!unique.some(other=>other!==id&&descendants(c,other).has(id)));
    if(roots.some(id=>descendants(c,id).has(parent)))return false;
    if(roots.some(id=>{const n=find(c,id);return !n||!available(c,parent,n.name,copy?undefined:id);}))return false;
    const clone=(n,target)=>{if(n.photo){const {id,...p}=NG.photoLibrary.find(c,n.photo);return NG.media.add(c,{...JSON.parse(JSON.stringify(p)),folder:target}).id;}
      const fresh=create(c,target,n.name,n.type,n.content||'');if(!fresh)return null;Object.assign(fresh,{size:n.size,time:n.time});for(const child of nodes(c).filter(x=>x.parent===n.id))clone(child,fresh.id);return fresh.id;};
    const originals=roots.map(id=>find(c,id)),removedDrive=new Set();
    for(const n of originals){const id=n.id;if(!copy&&n.parent===parent)continue;if(copy)clone(n,parent);else if(n.photo)NG.photoLibrary.find(c,n.photo).folder=parent;else if(id.startsWith('drive:')){const fresh=create(c,parent,n.name,n.type,n.content||'');if(fresh){fresh.size=n.size;removedDrive.add(+id.slice(6));}}else state(c).nodes.find(x=>x.id===id).parent=parent;}
    if(removedDrive.size)c.data.driveFiles=c.data.driveFiles.filter((_,i)=>!removedDrive.has(i));
    c.save();return true;
  }
  NG.documents={state,nodes,find,list,mime,valid,available,create,rename,remove,transfer,descendants};
})();
