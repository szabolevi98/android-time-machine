/* News & Weather 2.2, LMY48Y: Choose an edition, manage_sections_activity/list_item/header_item.xml,
   section_move/add/remove buttons and web_content_activity.xml's Open in browser. Country/catalogue profiles and
   article URLs are the simulator's own offline data, where the native app would receive server configuration.
   The existing Headlines catalogue remains mandatory; the two existing sample topics can be hidden/reordered. */
(() => {
  'use strict';
  const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const EDITIONS={us:{region:'US',sections:['Headlines','Technology','Sports']},gb:{region:'GB',sections:['Headlines','Sports','Technology']}};
  const N=(c,k)=>{const r=window.StockStrings?.news?.[k];return r?AndroidStrings.pick(r,String(c.locale||'en').slice(0,2),k):c.t(k);};
  const edition=data=>EDITIONS[data.news2?.edition]?data.news2.edition:'us';
  function sections(data){
    const id=edition(data),saved=data.news2?.sectionsByEdition?.[id],allowed=EDITIONS[id].sections;
    return saved?['Headlines',...saved.filter((s,i,a)=>s!=='Headlines'&&allowed.includes(s)&&a.indexOf(s)===i)]:[...allowed];
  }
  const region=(c,id)=>new Intl.DisplayNames([c.locale||'en'],{type:'region'}).of(EDITIONS[id].region);
  const rows=(data,stories,id)=>{const list=id==='Headlines'?stories['Top Stories']||[]:stories[id]||[];return id==='Headlines'&&edition(data)==='gb'&&list.length>1?[list[1],list[0],...list.slice(2)]:list;};
  const label=(c,id)=>id==='Headlines'?N(c,'Headlines'):c.t(id);
  function setSections(c,list){const state=c.data.news2||={};(state.sectionsByEdition||={})[edition(c.data)]=list;c.save();}
  function dialog(c){
    if(!c.ui.newsEditionDialog)return '';
    return `<button class="nw2-dialog-scrim" data-action="nwsec-cancel" aria-label="${e(c.t('Cancel'))}"></button><div class="nw2-dialog nwsec-editions" role="dialog" aria-label="${e(N(c,'Choose an edition'))}"><h3>${e(N(c,'Choose an edition'))}</h3>${Object.keys(EDITIONS).map(id=>`<button class="nw2-radio${edition(c.data)===id?' on':''}" data-action="nwsec-edition-pick" data-id="${id}" role="radio" aria-checked="${edition(c.data)===id}"><i></i><span>${e(region(c,id))}</span></button>`).join('')}<div class="nw2-dialog-buttons"><button data-action="nwsec-cancel">${e(c.t('Cancel'))}</button></div></div>`;
  }
  function page(c){
    const active=sections(c.data),hidden=EDITIONS[edition(c.data)].sections.filter(s=>!active.includes(s)),dark=!!c.data.news2?.dark;
    const row=(id,on)=>`<div class="nwsec-row" data-news-section="${id}">${on?`<button class="nwsec-grip" data-nwsec-drag="${id}" aria-label="${e(N(c,'Reorder section'))}"${id==='Headlines'?' disabled':''}><img src="assets/nwsect-reorder.png" alt=""></button>`:`<button data-action="nwsec-restore" data-id="${id}" aria-label="${e(N(c,'Add section'))}"><img src="assets/nwsect-add.png" alt=""></button>`}<span>${e(label(c,id))}</span>${on?`<button data-action="nwsec-hide" data-id="${id}" aria-label="${e(N(c,'Remove this section'))}"${id==='Headlines'?' disabled':''}><img src="assets/nwsect-remove.png" alt=""></button>`:''}</div>`;
    return `<div class="app-view sa-app sa-news2 nwsect-page${dark?' nw2-dark':''}" data-news-sections><header class="nw2-bar"><button class="nw2-back" data-action="nwsec-back" aria-label="${e(c.t('Navigate up'))}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button><b>${e(N(c,'Manage sections'))}</b></header><div class="sa-scroll"><div class="nwsec-active">${active.map(s=>row(s,true)).join('')}</div>${hidden.length?`<h4>${e(N(c,'Hidden sections'))}</h4>${hidden.map(s=>row(s,false)).join('')}`:''}</div></div>`;
  }
  function handle(action,id,c){
    if(!action.startsWith('nwsec-'))return false;
    c.ui.overlay='';c.ui.newsMenu='';c.renderOverlay();
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
  function back(c){if(c.ui.newsEditionDialog){c.ui.newsEditionDialog=false;c.render();return true;}if(c.ui.newsManage){c.ui.newsManage=false;c.render();return true;}return false;}
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
  window.NewsSections={EDITIONS,N,edition,sections,rows,dialog,page,handle,back,attach};
})();
