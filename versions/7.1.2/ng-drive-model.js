/* Drive 2.4's local document store. Invented files, uploads and sharing metadata;
   no cloud request. Stable IDs are shared with the DocumentsUI provider. */
(() => {
  'use strict';
  const clone=x=>JSON.parse(JSON.stringify(x));
  const state=c=>c.data.drive ||= {nextId:1,grid:false,sort:'name',ascending:true};
  function files(c){const s=state(c),all=c.data.driveFiles ||= [],used=new Set();for(const f of all){if(!f.id||used.has(f.id)){while(all.some(p=>p.id==='d'+s.nextId))s.nextId++;f.id='d'+s.nextId++;}used.add(f.id);f.parent ||= '';f.time ||= Date.now();f.created ||= f.time;f.type ||= 'file';}while(used.has('d'+s.nextId))s.nextId++;return all;}
  const find=(c,id)=>files(c).find(f=>f.id===id);
  function descendants(c,id){const all=files(c),ids=new Set([id]);let more=true;while(more){more=false;for(const f of all)if(ids.has(f.parent)&&!ids.has(f.id)){ids.add(f.id);more=true;}}return ids;}
  function visible(c,f){const seen=new Set();while(f){if(f.trashed||seen.has(f.id))return false;seen.add(f.id);f=find(c,f.parent);}return true;}
  function list(c,{view='my',parent='',query=''}={}){const s=state(c),q=query.trim().toLocaleLowerCase();let out=files(c).filter(f=>view==='trash'?f.trashed&&!find(c,f.parent)?.trashed:visible(c,f));
    if(view!=='trash'){if(q)out=out.filter(f=>f.name.toLocaleLowerCase().includes(q));else if(view==='my')out=out.filter(f=>f.parent===parent);else if(view==='starred')out=out.filter(f=>f.starred);else if(view==='offline')out=out.filter(f=>f.offline);else if(view==='shared')out=out.filter(f=>f.sharedWithMe);else if(view==='uploads')out=out.filter(f=>f.uploaded);}
    const order=s.ascending===false?-1:1;return out.sort((a,b)=>{const folder=(a.type==='folder'?0:1)-(b.type==='folder'?0:1);if(folder)return folder;if(view==='recent'||s.sort==='modified')return ((b.modified||b.time)-(a.modified||a.time))*order;if(s.sort==='opened')return ((b.opened||0)-(a.opened||0))*order;return a.name.localeCompare(b.name)*order;});
  }
  const valid=name=>typeof name==='string'&&!!name.trim()&&!/[\x00-\x1f]/.test(name);
  function create(c,name,type='file',parent='',extra={}){if(!valid(name)||parent&&find(c,parent)?.type!=='folder')return null;files(c);const s=state(c),now=Date.now(),f={...clone(extra),id:'d'+s.nextId++,name:name.trim(),type,parent,time:now,created:now,modified:now,size:extra.size||extra.content?.length||0};c.data.driveFiles.push(f);return f;}
  function upload(c,node,parent=''){if(!node||node.type==='dir')return null;const photo=node.mediaSnapshot||(node.photo&&NG.photoLibrary?.find(c,node.photo));return create(c,node.name,node.type||'file',parent,{content:node.content||'',size:node.size||0,duration:node.duration||photo?.duration||0,title:node.title,artist:node.artist,album:node.album,genre:node.genre,art:node.art,mime:node.mime,scanPages:node.scanPages,pdfOptions:node.pdfOptions,uploaded:true,uploadReadyAt:Date.now()+1200,...(photo?{photoSnapshot:clone(photo)}:{})});}
  function rename(c,id,name){const f=find(c,id);if(!f||!valid(name))return false;f.name=name.trim();f.modified=Date.now();return true;}
  function move(c,ids,parent=''){if(parent&&find(c,parent)?.type!=='folder')return false;const roots=[...new Set(ids)].filter(id=>!ids.some(other=>other!==id&&descendants(c,other).has(id)));if(roots.some(id=>!find(c,id)||descendants(c,id).has(parent)))return false;for(const id of roots){const f=find(c,id);f.parent=parent;f.modified=Date.now();}return true;}
  function trash(c,ids,restore=false){const roots=[...new Set(ids)].filter(id=>!ids.some(other=>other!==id&&descendants(c,other).has(id)));for(const id of roots){const f=find(c,id);if(f)f.trashed=!restore;}}
  function remove(c,ids){const gone=new Set(ids.flatMap(id=>[...descendants(c,id)]));c.data.driveFiles=files(c).filter(f=>!gone.has(f.id));}
  function copy(c,id,parent='',name){const original=find(c,id);if(!original||parent&&descendants(c,id).has(parent))return null;const sources=[...descendants(c,id)].map(key=>clone(find(c,key))),byParent=new Map();for(const f of sources){if(!byParent.has(f.parent))byParent.set(f.parent,[]);byParent.get(f.parent).push(f);}
    const duplicate=(f,target,root=false)=>{const extra=clone(f);for(const key of ['id','name','parent','trashed','sharedWithMe','people','linkSharing'])delete extra[key];const n=create(c,root&&name?name:f.name,f.type,target,extra);if(!n)return null;for(const child of byParent.get(f.id)||[])duplicate(child,n.id);return n;};return duplicate(sources[0],parent,true);
  }
  function share(c,id,email,role='writer'){const f=find(c,id);email=String(email).trim().toLowerCase();if(!f||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email)||!['writer','commenter','reader'].includes(role))return false;f.people ||= [];const old=f.people.find(p=>p.email===email);if(old)old.role=role;else f.people.push({email,role});return true;}
  function nodes(c){return files(c).filter(f=>visible(c,f)).map(f=>({id:'drive:'+f.id,parent:f.parent?'drive:'+f.parent:'drive',name:f.name,type:f.type==='folder'?'dir':['doc','sheet','slide'].includes(f.type)?'text':f.type,size:f.size||0,time:f.modified||f.time,content:f.content||'',duration:f.duration,title:f.title,artist:f.artist,album:f.album,genre:f.genre,art:f.art,mime:f.mime,scanPages:f.scanPages,pdfOptions:f.pdfOptions,mediaSnapshot:f.photoSnapshot,driveId:f.id}));}
  function trimCache(c){const limit=Number(NG.appPref?.(c,'drive','shared_preferences.cache_size','250')||250)*1048576,entries=files(c).filter(f=>f.previewCached&&!f.offline).sort((a,b)=>Number(a.previewCached)-Number(b.previewCached));let bytes=entries.reduce((sum,f)=>sum+(+f.size||0),0);for(const f of entries){if(bytes<=limit)break;bytes-=+f.size||0;delete f.previewCached;}}
  function cache(c,id){const f=find(c,id);if(!f)return;f.previewCached=Date.now();trimCache(c);}
  function clearCache(c){for(const f of files(c))if(!f.offline)delete f.previewCached;}
  NG.driveModel={state,files,find,list,visible,descendants,create,upload,rename,move,trash,remove,copy,share,nodes,cache,trimCache,clearCache};
})();
