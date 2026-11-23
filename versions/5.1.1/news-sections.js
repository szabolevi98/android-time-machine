/* News & Weather 2.2, LMY48Y: Choose an edition, manage_sections_activity/list_item/header_item.xml,
   section_move/add/remove buttons and web_content_activity.xml's Open in browser. Country/catalogue profiles and
   article URLs are the simulator's own offline data, where the native app would receive server configuration.
   The existing Headlines catalogue remains mandatory; the two existing sample topics can be hidden/reordered.
   Add section (news_activity.xml and manage_sections.xml: menu_group_add_section, a sub-menu of Add topic… and Add
   location…) opens the add-section DialogFragment (dialog_content_add_section.xml): the title, the message, the
   search field with its hint, the italic example and, for a topic only, "Topic name (optional)"; Cancel and OK, OK
   enabled once the field holds text. The new custom section joins the end of the list (data.news2.custom). A topic
   lists the offline stories that hold all of its words, or content_loading_empty_state; a location shows the weather
   for that place (local news is not available offline). Remove this section (menu_remove_section, on a custom
   section's overflow) asks remove_section_dialog_text; Manage sections deletes a custom section outright. */
(() => {
  'use strict';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const EDITIONS={us:{region:'US',sections:['Headlines','Technology','Sports']},gb:{region:'GB',sections:['Headlines','Sports','Technology']}};
  const N=(c,k)=>{const r=window.StockStrings?.news?.[k];return r?AndroidStrings.pick(r,String(c.locale||'en').slice(0,2),k):c.t(k);};
  const edition=data=>EDITIONS[data.news2?.edition]?data.news2.edition:'us';
  const custom=data=>Array.isArray(data.news2?.custom)?data.news2.custom:[];
  const customOf=(data,id)=>custom(data).find(s=>s.id===id);
  function sections(data){
    const id=edition(data),saved=data.news2?.sectionsByEdition?.[id],allowed=[...EDITIONS[id].sections,...custom(data).map(s=>s.id)];
    if(!saved)return allowed;
    const list=['Headlines',...saved.filter((s,i,a)=>s!=='Headlines'&&allowed.includes(s)&&a.indexOf(s)===i)];
    return [...list,...custom(data).map(s=>s.id).filter(s=>!list.includes(s))];
  }
  // A topic's words (AND / OR are the example's operators, not words to find).
  const words=query=>String(query).toLocaleLowerCase().split(/\s+/).filter(w=>w&&!['and','or','és','vagy','und','oder','et','ou','y','o'].includes(w)).map(w=>w.replace(/^"|"$/g,''));
  const region=(c,id)=>new Intl.DisplayNames([c.locale||'en'],{type:'region'}).of(EDITIONS[id].region);
  const rows=(data,stories,id)=>{const own=customOf(data,id);if(own){if(own.kind!=='topic')return [];const want=words(own.query),seen=new Set();return Object.values(stories).flat().filter(r=>{const hay=`${r[0]} ${r[1]}`.toLocaleLowerCase();if(seen.has(r[0])||!want.length||!want.every(w=>hay.includes(w)))return false;seen.add(r[0]);return true;});}const list=id==='Headlines'?stories['Top Stories']||[]:stories[id]||[];return id==='Headlines'&&edition(data)==='gb'&&list.length>1?[list[1],list[0],...list.slice(2)]:list;};
  const label=(c,id)=>{const own=customOf(c.data,id);return own?own.name||own.query:id==='Headlines'?N(c,'Headlines'):c.t(id);};
  function setSections(c,list){const state=c.data.news2||={};(state.sectionsByEdition||={})[edition(c.data)]=list;c.save();}
  const buttons=(c,cancel,ok,submit=false)=>`<div class="nw2-dialog-buttons"><button type="button" data-action="${cancel}">${e(c.t('Cancel'))}</button><button ${submit?'type="submit" class="nwsec-ok" disabled':`type="button" data-action="${ok}"`}>${e(c.t('OK'))}</button></div>`;
  function addDialog(c){
    const topic=c.ui.newsAdd==='topic',[title,message,hint,example]=(topic?['Add a topic','Get news on topics that interest you.','Enter a search term or phrase','Example: "Syria", "Yankees AND Red Sox"']:['Add a location','Get weather and local news (when available) for any location.','Enter a city or postal code','Example: "Washington DC", "98121", etc.']).map(k=>N(c,k));
    return `<button class="nw2-dialog-scrim" data-action="nwsec-add-cancel" aria-label="${e(c.t('Cancel'))}"></button><form class="nw2-dialog nwsec-add" data-form="nwsec-add" role="dialog" aria-label="${e(title)}"><h3>${e(title)}</h3><p>${e(message)}</p><input name="query" placeholder="${e(hint)}" aria-label="${e(hint)}" autocomplete="off" spellcheck="false" enterkeyhint="${topic?'next':'done'}"><em>${e(example)}</em>${topic?`<input name="name" placeholder="${e(N(c,'Topic name (optional)'))}" aria-label="${e(N(c,'Topic name (optional)'))}" autocomplete="off" enterkeyhint="done">`:''}${buttons(c,'nwsec-add-cancel','',true)}</form>`;
  }
  function dialog(c){
    if(c.ui.newsAdd)return addDialog(c);
    if(c.ui.newsRemove)return `<button class="nw2-dialog-scrim" data-action="nwsec-remove-cancel" aria-label="${e(c.t('Cancel'))}"></button><div class="nw2-dialog nwsec-confirm" role="alertdialog" aria-label="${e(N(c,'Remove this section?'))}"><p>${e(N(c,'Remove this section?'))}</p>${buttons(c,'nwsec-remove-cancel','nwsec-remove-ok')}</div>`;
    if(!c.ui.newsEditionDialog)return '';
    return `<button class="nw2-dialog-scrim" data-action="nwsec-cancel" aria-label="${e(c.t('Cancel'))}"></button><div class="nw2-dialog nwsec-editions" role="dialog" aria-label="${e(N(c,'Choose an edition'))}"><h3>${e(N(c,'Choose an edition'))}</h3>${Object.keys(EDITIONS).map(id=>`<button class="nw2-radio${edition(c.data)===id?' on':''}" data-action="nwsec-edition-pick" data-id="${id}" role="radio" aria-checked="${edition(c.data)===id}"><i></i><span>${e(region(c,id))}</span></button>`).join('')}<div class="nw2-dialog-buttons"><button data-action="nwsec-cancel">${e(c.t('Cancel'))}</button></div></div>`;
  }
  function page(c){
    const active=sections(c.data),hidden=EDITIONS[edition(c.data)].sections.filter(s=>!active.includes(s)),dark=!!c.data.news2?.dark;
    const row=(id,on)=>`<div class="nwsec-row" data-news-section="${id}">${on?`<button class="nwsec-grip" data-nwsec-drag="${id}" aria-label="${e(N(c,'Reorder section'))}"${id==='Headlines'?' disabled':''}><img src="assets/nwsect-reorder.png" alt=""></button>`:`<button data-action="nwsec-restore" data-id="${id}" aria-label="${e(N(c,'Add section'))}"><img src="assets/nwsect-add.png" alt=""></button>`}<span>${e(label(c,id))}</span>${on?`<button data-action="nwsec-hide" data-id="${id}" aria-label="${e(N(c,'Remove this section'))}"${id==='Headlines'?' disabled':''}><img src="assets/nwsect-remove.png" alt=""></button>`:''}</div>`;
    return `<div class="app-view sa-app sa-news2 nwsect-page${dark?' nw2-dark':''}" data-news-sections><header class="nw2-bar"><button class="nw2-back" data-action="nwsec-back" aria-label="${e(c.t('Navigate up'))}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button><b>${e(N(c,'Manage sections'))}</b><button class="sa-btn" data-action="nwsec-add-menu" aria-label="${e(N(c,'Add section'))}"><img src="assets/nw2-ic_add_white_24dp.png" alt=""></button></header><div class="sa-scroll"><div class="nwsec-active">${active.map(s=>row(s,true)).join('')}</div>${hidden.length?`<h4>${e(N(c,'Hidden sections'))}</h4>${hidden.map(s=>row(s,false)).join('')}`:''}</div>${dialog(c)}</div>`;
  }
  function dropCustom(c,id){const state=c.data.news2||={};state.custom=custom(c.data).filter(s=>s.id!==id);for(const list of Object.values(state.sectionsByEdition||{}))if(Array.isArray(list)&&list.includes(id))list.splice(list.indexOf(id),1);if(c.ui.newsTab===id)c.ui.newsTab='Headlines';c.save();}
  function handle(action,id,c){
    if(!action.startsWith('nwsec-'))return false;
    if(action==='nwsec-add-menu'){c.ui.newsMenu='add';c.ui.overlay='sa-menu';c.renderOverlay();return true;}
    c.ui.overlay='';c.ui.newsMenu='';c.renderOverlay();
    if(action==='nwsec-add'&&(id==='topic'||id==='location')){c.ui.newsAdd=id;c.ui.newsDrawer=false;}
    else if(action==='nwsec-add-cancel')c.ui.newsAdd='';
    else if(action==='nwsec-remove'&&customOf(c.data,c.ui.newsTab))c.ui.newsRemove=true;
    else if(action==='nwsec-remove-cancel')c.ui.newsRemove=false;
    else if(action==='nwsec-remove-ok'){c.ui.newsRemove=false;dropCustom(c,c.ui.newsTab);c.ui.newsExpanded='';}
    else if(action==='nwsec-hide'&&customOf(c.data,id)){dropCustom(c,id);c.toast(N(c,'Section deleted'));}
    else
    if(action==='nwsec-editions')c.ui.newsEditionDialog=true;
    else if(action==='nwsec-edition-pick'&&EDITIONS[id]){(c.data.news2||={}).edition=id;c.ui.newsEditionDialog=false;c.ui.newsTab='Headlines';c.ui.newsExpanded='';c.save();}
    else if(action==='nwsec-cancel')c.ui.newsEditionDialog=false;
    else if(action==='nwsec-manage'){c.ui.newsManage=true;c.ui.newsEditionDialog=false;}
    else if(action==='nwsec-back')c.ui.newsManage=false;
    else if(action==='nwsec-hide'&&id!=='Headlines'){setSections(c,sections(c.data).filter(s=>s!==id));if(c.ui.newsTab===id)c.ui.newsTab='Headlines';c.toast(N(c,'Section deleted'));}
    else if(action==='nwsec-restore'&&EDITIONS[edition(c.data)].sections.includes(id)){setSections(c,[...sections(c.data).filter(s=>s!==id),id]);}
    else if(action==='nwsec-browser'){const story=c.article(c.ui.newsWeb);if(story?.url)c.browser(story.url);return true;}
    else return false;
    c.render();return true;
  }
  // OK of the add-section dialog: a new custom section at the end of the list; from the main screen it opens.
  function submit(name,values,c){
    if(name!=='nwsec-add'||!c.ui.newsAdd)return false;
    const query=String(values.get('query')||'').trim().replace(/\s+/g,' ').slice(0,60);if(!query)return true;
    const state=c.data.news2||={},own={id:`custom-${Date.now().toString(36)}`,kind:c.ui.newsAdd,query};
    const name2=String(values.get('name')||'').trim().slice(0,40);if(own.kind==='topic'&&name2)own.name=name2;
    const list=sections(c.data);state.custom=[...custom(c.data),own];setSections(c,[...list,own.id]);
    c.ui.newsAdd='';if(!c.ui.newsManage){c.ui.newsTab=own.id;c.ui.newsExpanded='';}
    c.render();return true;
  }
  // The dialog's OK waits for text in the search field, which takes the focus.
  function mount(root){
    const form=root.querySelector('.nwsec-add');if(!form||form.dataset.ready)return;form.dataset.ready='1';
    const field=form.querySelector('[name="query"]'),ok=form.querySelector('.nwsec-ok');
    field.addEventListener('input',()=>{ok.disabled=!field.value.trim();});
    field.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&form.querySelector('[name="name"]')){ev.preventDefault();form.querySelector('[name="name"]').focus();}});
    field.focus();
  }
  function back(c){if(c.ui.newsAdd){c.ui.newsAdd='';c.render();return true;}if(c.ui.newsRemove){c.ui.newsRemove=false;c.render();return true;}if(c.ui.newsEditionDialog){c.ui.newsEditionDialog=false;c.render();return true;}if(c.ui.newsManage){c.ui.newsManage=false;c.render();return true;}return false;}
  function attach(root,c){
    let cleanup=()=>{},destroyed=false;
    root.addEventListener('pointerdown',event=>{
      const grip=event.target.closest('[data-nwsec-drag]');if(!grip||grip.disabled)return;
      event.preventDefault();event.stopPropagation();cleanup();
      const id=grip.dataset.nwsecDrag,list=sections(c.data),index=list.indexOf(id),row=grip.closest('[data-news-section]'),r=row.getBoundingClientRect(),start=event.clientY;
      let dy=0;row.classList.add('dragging');
      const move=ev=>{dy=ev.clientY-start;row.style.transform=`translateY(${dy}px)`;};
      const finish=ev=>{cleanup();if(destroyed)return;if(ev.type!=='pointercancel'){const at=Math.max(1,Math.min(list.length-1,index+Math.round(dy/r.height)));list.splice(index,1);list.splice(at,0,id);setSections(c,list);}c.render();};
      cleanup=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);row.style.transform='';row.classList.remove('dragging');};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
    });
    return {destroy(){destroyed=true;cleanup();}};
  }
  window.NewsSections={EDITIONS,N,edition,sections,rows,label,custom:customOf,dialog,page,handle,submit,mount,back,attach};
})();
