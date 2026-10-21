/* DocumentsUI of angler N2G48C (FilesActivity / DocumentsActivity / Downloads launcher).
   DocumentsTheme: primary #263238, dark #21272b, accent #009688, window/drawer #f1f1f1.
   drawer_layout.xml: 56dp DocumentsToolbar, 256dp roots pane. item_root.xml: 48dp rows,
   24dp icons in 40dp slots. item_doc_list.xml: 72dp rows with 40dp thumbnails, 16sp title,
   12sp date/size. Grid uses item_doc_grid's 4dp margin and 2dp elevation. The menus are
   res/menu/activity and mode_directory of this APK. File contents are invented offline demo data. */
(() => {
  'use strict';
  const D=()=>NG.documents,T=()=>NG.text('documents'),t=key=>T().t(key),esc=(c,value)=>c.safe(value);
  const U=c=>c.ui.documents||(c.ui.documents={root:'download',path:['download'],drawer:false,selected:[],search:false,query:'',preview:null});
  const pref=c=>D().state(c),picker=c=>c.ui.documentPicker;
  const icon=name=>`<img src="assets/du-${name}.svg" alt="">`;
  const mask=name=>`<i class="ngdocs-mask" style="-webkit-mask-image:url('assets/du-${name}.png');mask-image:url('assets/du-${name}.png')"></i>`;
  const btn=(c,action,name,label)=>`<button type="button" class="ngdocs-btn" data-action="ngdocs-${action}" aria-label="${esc(c,t(label))}">${mask(name)}</button>`;
  function sync(c){const u=U(c),sub=c.ui.sub;if(sub){c.ui.sub='';if(sub==='pick'||sub==='save'){u.path=['recent'];u.root='recent';u.drawer=true;}else if(sub.startsWith('root:')){u.root=sub.slice(5);u.path=[u.root];}u.selected=[];u.preview=null;u.query='';u.search=false;}
    if(c.ui.view==='files'&&u.lastView!=='files'&&!picker(c)){u.root='internal';u.path=['internal'];}
    else if(c.ui.view==='documents'&&u.lastView==='files'&&!picker(c)){u.root='download';u.path=['download'];}u.lastView=c.ui.view;
  }
  const here=c=>U(c).path.at(-1)||U(c).root;
  const rootName=(c,id)=>({recent:t('root_recent'),download:t('downloads_label'),internal:'Nexus 6P',images:t('MediaProvider/root_images'),videos:t('MediaProvider/root_videos'),audio:t('MediaProvider/root_audio'),drive:'Google Drive'})[id]||D().find(c,id)?.name||t('app_label');
  const types={text:'ic_doc_text',pdf:'ic_doc_pdf',image:'ic_doc_image',video:'ic_doc_video',audio:'ic_doc_audio',dir:'ic_doc_folder'};
  const size=(c,n)=>NG.fileSize?NG.fileSize(c,n.size||0,true):`${n.size||0} B`;
  function visible(c){const spec=picker(c);return D().list(c,here(c),U(c).query).filter(n=>spec?.mode==='folder'?n.type==='dir':!spec?.mime||n.type==='dir'||spec.mime==='*/*'||D().mime(n.type).startsWith(spec.mime.replace('*','')));}
  function rootPane(c){const u=U(c),items=['recent','images','videos','audio','download',...(pref(c).showInternal||c.ui.view==='files'?['internal']:[]),'drive'];return `<div class="ngdocs-dim" data-action="ngdocs-drawer"></div><aside class="ngdocs-drawer"><div class="ngdocs-drawertitle">${esc(c,t(picker(c)?.mode==='save'?'title_save':'title_open'))}</div>${items.map(id=>`<button type="button" class="ngdocs-root${u.root===id?' on':''}" data-action="ngdocs-root" data-root="${id}">${id==='recent'||id==='download'?mask(`ic_root_${id==='recent'?'recent':'download'}_alpha`):icon(id==='internal'?'ic_root_smartphone':id==='drive'?'ic_root_documents':types[id==='images'?'image':id==='videos'?'video':'audio'])}<span>${esc(c,rootName(c,id))}</span></button>`).join('')}</aside>`;}
  function toolbar(c){const u=U(c),p=pref(c),selection=u.selected.length>0;return `<header class="ngdocs-bar${selection?' selected':''}">${selection?`<button type="button" class="ngdocs-btn" data-action="ngdocs-unselect" aria-label="${esc(c,t('close'))}">×</button><span class="ngdocs-title">${u.selected.length}</span>${btn(c,'share','ic_menu_share_alpha','menu_share')}${btn(c,'delete','ic_menu_delete_alpha','menu_delete')}`:`${btn(c,u.preview?'back':'drawer','ic_hamburger_alpha',u.preview?'abc_action_bar_up_description':'drawer_open')}${u.search?`<input class="ngdocs-search" value="${esc(c,u.query)}" placeholder="${esc(c,t('menu_search'))}" aria-label="${esc(c,t('menu_search'))}">`:`<button type="button" class="ngdocs-title" data-action="ngdocs-breadcrumb">${esc(c,u.preview?u.preview.name:rootName(c,here(c)))}</button>`}${btn(c,'search','ic_menu_search_alpha','menu_search')}${btn(c,'grid',p.grid?'ic_menu_view_list_alpha':'ic_menu_view_grid_alpha',p.grid?'menu_list':'menu_grid')}`}${NG.menu.button(c,'ngdocs-more')}</header>`;}
  function list(c){const u=U(c),items=visible(c),grid=pref(c).grid;return items.length?`<div class="ngdocs-items${grid?' grid':''}">${items.map(n=>`<button type="button" class="ngdocs-item${u.selected.includes(n.id)?' on':''}" data-action="ngdocs-item" data-id="${esc(c,n.id)}"><span class="ngdocs-icon">${n.photo?NG.media.svg(NG.photoLibrary.find(c,n.photo),'ngdocs-thumb',1):icon(types[n.type]||'ic_doc_generic')}${u.selected.includes(n.id)?'<i class="ngdocs-check">✓</i>':''}</span><span class="ngdocs-nametext"><strong>${esc(c,n.name)}</strong><small>${n.time?esc(c,new Date(n.time).toLocaleDateString(c.locale(),{month:'short',day:'numeric'})):''}${pref(c).showSize&&n.type!=='dir'?` <span>${esc(c,size(c,n))}</span>`:''}</small></span></button>`).join('')}</div>`:`<div class="ngdocs-empty">${icon('ic_root_documents')}<span>${esc(c,u.query?T().fmt('no_results',null,rootName(c,here(c))):t('empty'))}</span></div>`;}
  function preview(c,n){return `<section class="ngdocs-preview"><div class="ngdocs-previewname">${icon(types[n.type]||'ic_doc_generic')}<strong>${esc(c,n.name)}</strong><small>${esc(c,size(c,n))}</small></div>${n.scanPages?`<div class="ngdv-pdfpages">${n.scanPages.map(p=>NG.driveScan.sheet(p,n.pdfOptions)).join('')}</div>`:`<article>${esc(c,n.content||'').replace(/\n/g,'<br>')}</article>`}</section>`;}
  function render(c){sync(c);const u=U(c),spec=picker(c);return `<div class="ngdocs">${toolbar(c)}<div class="ngdocs-content">${u.preview?preview(c,u.preview):list(c)}</div>${spec?.mode==='save'?`<div class="ngdocs-save">${icon('ic_doc_text')}<input class="ngdocs-save-name" value="${esc(c,u.saveName||spec.name||'Untitled.txt')}" aria-label="${esc(c,t('menu_save'))}"><button type="button" data-action="ngdocs-save">${esc(c,t('menu_save'))}</button></div>`:spec?.mode==='folder'?`<div class="ngdocs-save"><button type="button" data-action="ngdocs-target">${esc(c,t(spec.copy?'button_copy':'button_move'))}</button></div>`:''}${u.drawer?rootPane(c):''}</div>`;}
  function finish(c,nodes){const spec=picker(c);c.ui.documentPicker=null;U(c).finishing=true;spec?.onPick?.(c,nodes);c.back();}
  NG.pickDocument=(c,spec={})=>{c.ui.documentPicker={mode:'pick',...spec};c.open('documents','pick');};
  NG.saveDocument=(c,spec={})=>{c.ui.documentPicker={mode:'save',...spec};U(c).saveName=spec.name||'Untitled.txt';c.open('documents','save');};
  NG.viewDocument=(c,file)=>{if(file.photo){c.open('photos',`photo:${file.photo}`);return;}c.open('documents');U(c).preview=file;c.render();};
  function open(c,n){const u=U(c);if(n.type==='dir'){u.path.push(n.id);u.selected=[];u.search=false;u.query='';c.render();return;}
    if(picker(c)?.mode==='pick'){finish(c,[n]);return;}
    if(n.driveId){c.open('drive','file:'+n.driveId);return;}
    if(n.photo){c.open('photos',`photo:${n.photo}`);return;}
    u.preview=n;u.search=false;c.render();
  }
  function back(c){const u=U(c);if(u.finishing){u.finishing=false;return false;}if(u.drawer){u.drawer=false;c.render();return true;}if(u.preview){u.preview=null;c.render();return true;}if(u.selected.length){u.selected=[];c.render();return true;}if(u.search){u.search=false;u.query='';c.render();return true;}if(u.path.length>1){u.path.pop();c.render();return true;}if(picker(c)){const p=picker(c);c.ui.documentPicker=null;p.onCancel?.(c);}return false;}
  function nameDialog(c,title,value,onDone){let name=value;c.dialog({title:t(title),html:`<div class="ngdocs-name"><input value="${esc(c,value)}" aria-label="${esc(c,t(title))}" autocomplete="off"><small class="ngdocs-error"></small></div>`,mount(c,root){const input=root.querySelector('input');input.addEventListener('input',()=>name=input.value);input.focus();},buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{if(!onDone(name.trim()))c.toast(t(title==='menu_rename'?'rename_error':'create_error'));}}]});}
  function remove(c){const u=U(c),ids=[...u.selected],n=D().find(c,ids[0]);if(!n)return;c.dialog({message:ids.length===1?T().fmt(n.type==='dir'?'delete_foldername_confirmation_message':'delete_filename_confirmation_message',null,n.name):t('delete_preparing'),buttons:[{label:t('framework/cancel')},{label:t('menu_delete'),action:c=>{D().remove(c,ids);u.selected=[];c.render();}}]});}
  function transfer(c,copy){const u=U(c),ids=[...u.selected];u.selected=[];c.ui.documentPicker={mode:'folder',copy,ids,origin:[...u.path]};u.root='internal';u.path=['internal'];u.drawer=false;c.render();}
  function menu(c,anchor){const u=U(c),s=pref(c),items=[],add=(key,action)=>items.push({label:t(key),action});
    if(u.selected.length){add('menu_select_all',c=>{u.selected=visible(c).map(n=>n.id);c.render();});if(u.selected.length===1)add('menu_rename',c=>{const n=D().find(c,u.selected[0]);nameDialog(c,'menu_rename',n.name,name=>{const ok=D().rename(c,n.id,name);if(ok){u.selected=[];c.render();}return ok;});});add('menu_copy',c=>transfer(c,true));add('menu_move',c=>transfer(c,false));add('menu_copy_to_clipboard',c=>{u.clipboard=[...u.selected];u.selected=[];c.render();});}
    else{add('menu_sort',c=>c.menu(['sort_name','sort_date','sort_size'].map(key=>({label:t(key),action:c=>{s.sort=key.slice(5);c.save();c.render();}}))));if(!['recent','images','videos','audio','drive'].includes(here(c)))add('menu_create_dir',c=>nameDialog(c,'menu_create_dir','',name=>{const n=D().create(c,here(c),name);if(n)c.render();return !!n;}));if(u.clipboard?.length)add('menu_paste_from_clipboard',c=>{if(!D().transfer(c,u.clipboard,here(c),true))c.toast(t('clipboard_files_cannot_paste'));else{u.clipboard=[];c.render();}});add(s.showInternal?'menu_advanced_hide':'menu_advanced_show',c=>{s.showInternal=!s.showInternal;c.save();c.render();});add(s.showSize?'menu_file_size_hide':'menu_file_size_show',c=>{s.showSize=!s.showSize;c.save();c.render();});add('menu_settings',c=>{if(NG.settingsGo){c.open('settings');NG.settingsGo(c,'storage_settings');}else c.open('settings');});}
    c.menu(items,anchor);
  }
  const module={statusColor:()=> '#21272b',dialogAccent:()=> '#009688',render,back,
    unmount(c){if(!['documents','files','photos'].includes(c.ui.view)&&picker(c)){const spec=picker(c);c.ui.documentPicker=null;spec.onCancel?.(c);}},
    mount(c,root){const u=U(c),search=root.querySelector('.ngdocs-search');if(search){search.addEventListener('input',()=>{const pos=search.selectionStart;u.query=search.value;c.render();const next=c.el.viewport.querySelector('.ngdocs-search');next.focus();next.setSelectionRange(pos,pos);});search.focus();}root.querySelector('.ngdocs-save-name')?.addEventListener('input',e=>u.saveName=e.target.value);
      for(const item of root.querySelectorAll('.ngdocs-item')){let timer;item.addEventListener('pointerdown',()=>timer=setTimeout(()=>{const id=item.dataset.id;if(!u.selected.includes(id))u.selected.push(id);c.render();},500));for(const type of ['pointerup','pointerleave','pointercancel'])item.addEventListener(type,()=>clearTimeout(timer));}
    },
    action(name,el,event,c){const u=U(c),s=pref(c);switch(name){
      case 'ngdocs-item':{const id=el.dataset.id;if(u.selected.length){u.selected=u.selected.includes(id)?u.selected.filter(x=>x!==id):[...u.selected,id];c.render();}else{const n=D().find(c,id);if(n)open(c,n);}return true;}
      case 'ngdocs-drawer':u.drawer=!u.drawer;c.render();return true;
      case 'ngdocs-root':u.root=el.dataset.root;u.path=[u.root];u.drawer=false;u.selected=[];u.preview=null;u.query='';u.search=false;c.render();return true;
      case 'ngdocs-breadcrumb':if(u.path.length>1)c.menu(u.path.map((id,i)=>({label:rootName(c,id),action:c=>{u.path=u.path.slice(0,i+1);c.render();}})),el);return true;
      case 'ngdocs-back':back(c);return true;
      case 'ngdocs-unselect':u.selected=[];c.render();return true;
      case 'ngdocs-search':u.search=!u.search;u.query='';c.render();return true;
      case 'ngdocs-grid':s.grid=!s.grid;c.save();c.render();return true;
      case 'ngdocs-delete':remove(c);return true;
      case 'ngdocs-share':{const n=D().find(c,u.selected[0]);if(n)NG.share(c,{kind:n.type==='image'?'image':'file',name:n.name,text:'',photo:n.photo,photoSnapshot:n.mediaSnapshot,document:JSON.parse(JSON.stringify(n))});return true;}
      case 'ngdocs-save':{const spec=picker(c),target=here(c)==='recent'?'download':here(c),n=D().create(c,target,u.saveName||spec.name||'Untitled.txt','text',spec.content||'');if(n)finish(c,[n]);else c.toast(t('save_error'));return true;}
      case 'ngdocs-target':{const spec=picker(c);if(D().transfer(c,spec.ids,here(c),spec.copy)){c.ui.documentPicker=null;u.path=spec.origin;u.root=u.path[0];c.render();}else c.toast(t('clipboard_files_cannot_paste'));return true;}
      case 'ng-menu':menu(c,el);return true;
    }return false;}
  };
  NG.register('documents',module);NG.register('files',module);
})();
