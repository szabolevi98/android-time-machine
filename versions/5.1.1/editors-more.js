/* EditorsDocs/EditorsSheets/EditorsSlides 1.4 from LMY48Y. menu_doclist_activity_editors.xml,
   menu_doclist_context.xml, EditorsEntriesFilter (Recent/Starred/On device), navigation_list_footerview_editors.xml,
   doc_grid_item.xml and pick_entry_dialog layouts. Uses T34's local Drive files and the native DocumentsUI picker.
   SEND exports the stored demo document text (plain text / TSV); no Office ZIP or cloud service is fabricated. */
(() => {
  'use strict';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KIND={docs:'doc',sheets:'sheet',slides:'slides'},APP={doc:'docs',sheet:'sheets',slides:'slides'};
  const NAV=[['recent','Recent'],['starred','Starred'],['offline','On device']];
  const SORTS=[['title','Title'],['modified','Last modified'],['opened','Last opened by me'],['edited','Last edited by me'],['quota','Quota used']];
  const E=(c,k)=>{const r=window.StockStrings?.editors?.[k];return r?AndroidStrings.pick(r,String(c.locale||'en').slice(0,2),k):c.t(k);};
  const prefs=(data,app)=>({grid:false,sort:'modified',collection:'recent',...(data.editorPrefs?.[app]||{})});
  const modified=(f,c)=>f.date||new Date(f.mtime??Date.now()-(f.age||0)*864e5).toLocaleDateString(c.locale,{month:'short',day:'numeric'});
  function setPref(c,key,value){((c.data.editorPrefs||={})[c.ui.view]||={})[key]=value;c.save();}
  const all=c=>c.files||c.data.driveFiles||window.StockApps.FILES;
  function list(app,c){
    const p=prefs(c.data,app),items=all(c).filter(f=>!f.trashed&&f.kind===KIND[app]&&(p.collection!=='starred'||f.starred)&&(p.collection!=='offline'||f.pinned));
    const stamp=Date.now(),metric=f=>p.sort==='quota'?f.size||new TextEncoder().encode(f.text||'').length:p.sort==='opened'?f.otime||0:p.sort==='edited'?f.etime||0:f.mtime||stamp-(f.age||0)*864e5;
    return [...items].sort((a,b)=>p.sort==='title'?a.name.localeCompare(b.name,c.locale):metric(b)-metric(a)||a.name.localeCompare(b.name,c.locale));
  }
  function menu(c){const p=prefs(c.data,c.ui.view);return [{action:'emore-grid',title:E(c,p.grid?'View as List':'View as Grid')},{action:'emore-sort',title:E(c,'Sort by')},{action:'emore-open',title:E(c,'Open document')},{action:'emore-refresh',title:E(c,'Refresh')}];}
  function drawer(c){
    if(!c.ui.editorDrawer)return '';
    const p=prefs(c.data,c.ui.view);
    return `<button class="emore-scrim" data-action="emore-drawer" aria-label="${e(E(c,'Cancel'))}"></button><nav class="emore-drawer"><header><img src="assets/${c.ui.view}.png" alt=""><b>${e(E(c,{docs:'Docs',sheets:'Sheets',slides:'Slides'}[c.ui.view]))}</b><small>nexus6.demo@gmail.com</small></header>${NAV.map(([id,key])=>`<button data-action="emore-collection" data-id="${id}" class="${p.collection===id?'on':''}">${e(E(c,key))}</button>`).join('')}<hr><button data-action="emore-drive"><img src="assets/drive.png" alt="">${e(E(c,'Google Drive'))}</button></nav>`;
  }
  function panel(c,title,body,buttons=''){return `<div class="settings-dialog-scrim" data-action="emore-cancel"></div><div class="settings-dialog emore-dialog" role="dialog" aria-label="${e(title)}" data-no-translate><h3>${e(title)}</h3><div class="emore-rows">${body}</div>${buttons?`<div class="settings-dialog-actions">${buttons}</div>`:''}</div>`;}
  function dialog(c){
    const name=c.ui.overlay,button=(action,key)=>`<button data-action="${action}">${e(E(c,key))}</button>`;
    if(name==='emore-sort')return panel(c,E(c,'Sort by'),SORTS.map(([id,key])=>`<button data-action="emore-sort-pick" data-id="${id}" role="radio" aria-checked="${prefs(c.data,c.ui.view).sort===id}">${e(E(c,key))}</button>`).join(''));
    if(name==='emore-share')return panel(c,E(c,c.ui.editorSend==='link'?'Share link':'Send file'),(c.ui.editorSend==='link'?['gmail','email','hangouts']:['gmail','email']).map(app=>`<button data-action="emore-send-to" data-id="${app}"><img src="assets/${app}.png" alt="">${e(c.t({gmail:'Gmail',email:'Email',hangouts:'Hangouts'}[app]))}</button>`).join(''));
    const where=c.ui.editorMove||'root',folder=all(c).find(f=>f.id===where),folders=all(c).filter(f=>f.kind==='folder'&&!f.trashed&&(f.parent||'root')===where);
    return panel(c,E(c,'Move'),`<button data-action="emore-move-up">${e(folder?.name||E(c,'My Drive'))}</button>${folders.map(f=>`<button data-action="emore-move-folder" data-id="${e(f.id)}"><img src="assets/dr2-ic_type_folder.png" alt="">${e(f.name)}</button>`).join('')}`,button('emore-cancel','Cancel')+button('emore-move-ok','Move'));
  }
  const link=f=>`https://docs.google.com/${{doc:'document',sheet:'spreadsheets',slides:'presentation'}[f.kind]}/d/${encodeURIComponent(f.id)}/edit`;
  function attachment(f){const sheet=f.kind==='sheet';return {vcard:true,name:f.name.replace(/\.(docx?|xlsx?|pptx?|txt|tsv)$/i,'')+(sheet?'.tsv':'.txt'),mime:sheet?'text/tab-separated-values':'text/plain',text:String(f.text||''),size:new TextEncoder().encode(f.text||'').length};}
  function handle(action,id,c){
    if(!action.startsWith('emore-'))return false;
    const {ui,data}=c,file=all(c).find(f=>f.id===ui.edFile),close=()=>{ui.overlay='';c.renderOverlay();};
    if(action==='emore-drawer'){ui.editorDrawer=!ui.editorDrawer;c.render();return true;}
    if(action==='emore-collection'){setPref(c,'collection',id);ui.editorDrawer=false;ui.sub='';}
    else if(action==='emore-drive'){ui.editorDrawer=false;c.openDrive();return true;}
    else if(action==='emore-grid')setPref(c,'grid',!prefs(data,ui.view).grid);
    else if(action==='emore-sort'){ui.overlay='emore-sort';c.renderOverlay();return true;}
    else if(action==='emore-sort-pick')setPref(c,'sort',id);
    else if(action==='emore-open'){close();c.pick();return true;}
    else if(action==='emore-refresh'){close();ui.editorRefreshing=true;c.render();setTimeout(()=>{ui.editorRefreshing=false;if(KIND[ui.view])c.render();},700);return true;}
    else if(action==='emore-pin'&&file){data.driveFiles=all(c).map(f=>f.id===file.id?{...f,pinned:!f.pinned}:f);c.save();}
    else if((action==='emore-link'||action==='emore-send')&&file){ui.editorShare=JSON.parse(JSON.stringify(file));ui.editorSend=action==='emore-link'?'link':'file';ui.overlay='emore-share';c.renderOverlay();return true;}
    else if(action==='emore-send-to'){const f=ui.editorShare;close();if(f){if(ui.editorSend==='link')c.shareText(id,link(f),f.name);else c.shareFile(id,attachment(f));}return true;}
    else if(action==='emore-move'&&file){ui.editorMove='root';ui.overlay='emore-move';c.renderOverlay();return true;}
    else if(action==='emore-move-folder'){ui.editorMove=id;c.renderOverlay();return true;}
    else if(action==='emore-move-up'){ui.editorMove=all(c).find(f=>f.id===ui.editorMove)?.parent||'root';c.renderOverlay();return true;}
    else if(action==='emore-move-ok'&&file){data.driveFiles=all(c).map(f=>f.id===file.id?{...f,parent:ui.editorMove||'root'}:f);c.save();}
    else if(action==='emore-shortcut'&&file){c.shortcut(file);}
    else if(action!=='emore-cancel')return false;
    close();c.render();return true;
  }
  const ACCEPT={docs:'application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain',sheets:'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,text/tab-separated-values',slides:'application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation'};
  function importFile(c,file){
    const doc=file.document||{},id='editor-local:'+file.id,existing=all(c).find(f=>f.id===id);
    if(!existing){const made={id,name:file.name,kind:KIND[c.ui.view],local:true,pinned:true,text:String(doc.text||doc.content||''),mime:file.mime,size:file.size,mtime:doc.time||Date.now(),date:new Date(doc.time||Date.now()).toLocaleDateString(c.locale,{month:'short',day:'numeric'})};c.data.driveFiles=[made,...all(c)];}
    c.ui.edFrom='';c.ui.sub=id;c.save();c.render();
  }
  window.EditorMore={E,prefs,modified,list,menu,drawer,dialog,handle,attachment,link,importFile,ACCEPT,APP};
})();
