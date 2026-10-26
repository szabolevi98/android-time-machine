/* QuickOffice 6.3.1, KTU84P: HomeActivity / P's Open and New menus, AboutQuickoffice (quickoffice.a.a),
   FilePickerActivity's Downloads start directory, FilePickerFragment's Holo.Light.Dialog, custom title and
   Cancel/Open buttons, file_picker_row.xml (54dp, 32dp type icon). The Drive provider reads the T34 local Drive model.
   Source inspected from the image's classes.dex in _aosp/qo/java; no new editor/file-format engine. */
(() => {
  'use strict';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const Q=(c,k)=>{const r=window.StockStrings?.quickoffice?.[k];return r?AndroidStrings.pick(r,String(c.locale||'en').slice(0,2),k):c.t(k);};
  const supported=f=>['doc','sheet','slides','pdf','folder'].includes(f.kind);
  const isLocal=f=>f.local===true||(/^q/.test(f.id)&&f.local!==false);
  function deviceFiles(c){
    const saved=c.files.filter(f=>!f.trashed&&isLocal(f));
    const downloads=(c.data.downloads||[]).filter(f=>/\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(f.name)).map(f=>({id:'download:'+f.time,name:f.name,kind:/\.pdf$/i.test(f.name)?'pdf':/\.xlsx?$/i.test(f.name)?'sheet':/\.pptx?$/i.test(f.name)?'slides':'doc',text:f.text||(f.pdf?.lines||[]).join('\n'),pdf:f.pdf,time:f.time,local:true}));
    return [...saved,...downloads].sort((a,b)=>a.name.localeCompare(b.name,c.locale));
  }
  function driveFiles(c){return c.files.filter(f=>!f.trashed&&!isLocal(f)&&supported(f));}
  const icon=f=>({doc:'word',sheet:'excel',slides:'powerpoint',folder:'folder',pdf:'pdf'}[f.kind]||'word');
  const entry=(c,f,action,selected=false)=>`<button class="qox-entry${selected?' selected':''}" data-action="${action}" data-id="${e(f.id)}"${action==='qox-select'?` role="radio" aria-checked="${selected}"`:''}><img src="assets/qox-${icon(f)}.png" alt=""><span><b>${e(f.name)}</b>${f.date?`<small>${e(f.date)}</small>`:''}</span></button>`;
  function box(c,title,body,buttons=''){return `<div class="settings-dialog-scrim" data-action="qox-cancel"></div><div class="settings-dialog qox-dialog" role="dialog" aria-label="${e(title)}" data-no-translate><h3>${e(title)}</h3><div class="qox-rows">${body}</div>${buttons?`<div class="settings-dialog-actions">${buttons}</div>`:''}</div>`;}
  const button=(c,action,key,disabled=false)=>`<button data-action="${action}"${disabled?' disabled':''}>${e(Q(c,key))}</button>`;
  function dialog(c){
    const u=c.ui.qox||{},q=k=>Q(c,k);
    if(c.ui.overlay==='qox-menu')return box(c,'Quickoffice',button(c,'qox-open-menu','Open')+button(c,'qo-new','New')+button(c,'qox-about','About'));
    if(c.ui.overlay==='qox-open')return box(c,q('Open'),button(c,'qox-drive','Open from Drive')+button(c,'qox-device','Open from Device'));
    if(c.ui.overlay==='qox-about')return box(c,q('About Quickoffice'),'<p class="qox-about">Quickoffice 6.3.1</p>',button(c,'qox-cancel','Close'));
    const root=u.folder==='root',items=root?[{id:'folder:Download',kind:'folder',name:'Download'}]:deviceFiles(c);
    const rows=(root?'':`<button class="qox-path" data-action="qox-up">${e(q('Internal Storage'))} / Download</button>`)+items.map(f=>entry(c,f,root?'qox-folder':'qox-select',u.selected===f.id)).join('');
    return box(c,q('Open from Device'),rows,button(c,'qox-cancel','Cancel')+button(c,'qox-confirm','Open',!items.some(f=>f.id===u.selected&&f.kind!=='folder')));
  }
  function page(c){
    const u=c.ui.qox,q=k=>Q(c,k),folder=driveFiles(c).find(f=>f.id===u?.folder),list=driveFiles(c).filter(f=>(f.parent||'root')===(folder?.id||'root'));
    return `<div class="app-view kkx-app kkx-quickoffice qox-drive"><header class="kkx-bar"><button class="kkx-btn" data-action="qox-up" aria-label="${e(c.t('Back'))}"><img src="assets/ic_ab_back_holo_light.png" alt=""></button><img src="assets/drive.png" alt=""><h2>${e(folder?.name||q('Open from Drive'))}</h2><button class="kkx-btn" data-action="qox-cancel">${e(q('Cancel'))}</button></header><div class="kkx-list">${list.map(f=>entry(c,f,'qox-drive-pick')).join('')}</div></div>`;
  }
  function document(c){
    const f=c.ui.qoxDoc;return `<div class="app-view kkx-app kkx-quickoffice"><header class="kkx-bar"><button class="kkx-btn" data-action="qox-document-back" aria-label="${e(c.t('Back'))}"><img src="assets/ic_ab_back_holo_light.png" alt=""></button><h2>${e(f.name)}</h2></header><div class="kkx-page"><article class="kkx-paper">${String(f.text||'').split('\n').map(line=>`<p>${e(line)}</p>`).join('')}</article></div></div>`;
  }
  function open(c,f){if(!f||f.kind==='folder')return;c.ui.qoxDoc=JSON.parse(JSON.stringify(f));c.ui.qox=null;c.ui.sub='qox-document';c.ui.overlay='';c.renderOverlay();c.render();}
  function back(c){
    if(c.ui.qoxDoc){c.ui.qoxDoc=null;c.ui.sub='';c.render();return true;}
    if(c.ui.qox?.source==='drive'){if(c.ui.qox.folder!=='root')c.ui.qox.folder=driveFiles(c).find(f=>f.id===c.ui.qox.folder)?.parent||'root';else{c.ui.qox=null;c.ui.sub='';}c.render();return true;}
    return false;
  }
  function handle(action,id,c){
    if(!action.startsWith('qox-'))return false;
    const u=c.ui.qox||{},q=k=>Q(c,k);
    if(action==='qox-device'){c.ui.qox={source:'device',folder:'Download',selected:''};c.ui.overlay='qox-device';}
    else if(action==='qox-drive'){c.ui.qox={source:'drive',folder:'root'};c.ui.overlay='';c.ui.sub='qox-drive';}
    else if(action==='qox-select'){u.selected=id;}
    else if(action==='qox-confirm'){open(c,deviceFiles(c).find(f=>f.id===u.selected));return true;}
    else if(action==='qox-drive-pick'){const f=driveFiles(c).find(f=>f.id===id);if(f?.kind==='folder')u.folder=f.id;else{open(c,f);return true;}}
    else if(action==='qox-folder'){u.folder='Download';u.selected='';}
    else if(action==='qox-up'){if(u.source==='device'){u.folder='root';u.selected='';}else{return back(c);}}
    else if(action==='qox-document-back')return back(c);
    else if(action==='qox-menu')c.ui.overlay='qox-menu';
    else if(action==='qox-open-menu')c.ui.overlay='qox-open';
    else if(action==='qox-about')c.ui.overlay='qox-about';
    else if(action==='qox-cancel'){c.ui.overlay='';c.ui.qox=null;c.ui.sub='';}
    else return false;
    c.renderOverlay();c.render();return true;
  }
  window.QuickofficeMore={Q,isLocal,deviceFiles,driveFiles,dialog,page,document,handle,back};
})();
