/* Maps 9.34.1, angler N2G48C. base_header.xml, SheetPage/SheetHeader, the
   navigation_stepcueview and settings XMLs, native qu_* palette and raster icons.
   Maps' programmatic map chrome uses the 48dp targets, 24dp icons, 8dp/15dp
   spacers, 2dp card radius/elevation and 56dp FAB in its resource table.
   The streets, POIs and route geometry below are our invented offline demo content. */
(() => {
  'use strict';
  const M=()=>NG.mapsModel,T=()=>NG.text('maps'),t=k=>T().t(k),esc=(c,v)=>c.safe(v);
  const U=c=>c.ui.maps ||= {x:0,y:0,z:.9,focused:false,place:'',route:false,origin:'me',mode:'driving',search:null,menu:false,page:'',tab:'labeled',layer:'',nav:null};
  const D=c=>M().state(c),img=(n,cls='')=>`<img class="${cls}" src="assets/mp-${n}.png" alt="">`;
  const button=(c,action,icon,label,extra='')=>`<button type="button" class="ngmaps-icon" data-action="ngmaps-${action}" aria-label="${esc(c,t(label))}"${extra}>${img(icon)}</button>`;
  const back=c=>`<button type="button" class="ngmaps-icon ngmaps-back" data-action="ngmaps-back" aria-label="${esc(c,t('framework/cancel'))}"><img src="assets/gg-back.png" alt=""></button>`;
  const row=(c,action,title,summary='',data='')=>`<button type="button" class="ngmaps-row" data-action="ngmaps-${action}"${data}><b>${esc(c,title)}</b>${summary?`<small>${esc(c,summary)}</small>`:''}</button>`;
  const head=(c,title)=>`<header class="ngmaps-bar">${back(c)}<span>${esc(c,title)}</span></header>`;
  const route=c=>M().route(U(c).origin,U(c).place,U(c).mode);
  const originName=c=>U(c).origin==='me'?t('DIRECTIONS_YOUR_LOCATION'):M().find(U(c).origin)?.name||t('DIRECTIONS_YOUR_LOCATION');
  function distance(c,meters){
    const unit=NG.appPref(c,'maps','distance_units',''),imperial=unit==='MILES'||!unit&&c.locale()==='en-US';
    let n=meters,key='METERS';if(imperial){n=meters*3.28084;key='FEET';if(n>=5280){n/=5280;key='MILES';}}else if(meters>=1000){n=meters/1000;key='KILOMETERS';}
    return T().fmt('DA_DISTANCE_FORMAT_'+key+'_ABBREVIATED',null,n.toLocaleString(c.locale(),{maximumFractionDigits:key==='MILES'||key==='KILOMETERS'?1:0}));
  }
  const minutes=n=>T().plural('DA_MINUTES_ABBREVIATED',n,null,n);
  function scene(c,{place='',layer='',r=null,position=null,mini=false}={}){
    const p=M().find(place),sat=layer==='satellite',roads=[['M0 210H1200',false],['M0 465H1200',true],['M0 745H1200',false],['M195 0V1000',false],['M520 0V1000',true],['M880 0V1000',false]],u=U(c);
    const small=[];for(let x=55;x<1200;x+=85)small.push(`<path d="M${x} 0V1000"/>`);for(let y=45;y<1000;y+=90)small.push(`<path d="M0 ${y}H1200"/>`);
    const view=mini&&p?`${p.x-180} ${p.y-115} 360 230`:'0 0 1200 1000';
    const dot=position||M().me;
    return `<svg class="ngmaps-scene${mini?' mini':''}" viewBox="${view}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="1200" height="1000" fill="${sat?'#58654a':'#e9e6df'}"/>
      <path d="M0 555C210 525 345 645 570 600S940 545 1200 585V655C930 615 800 670 570 665S210 590 0 620Z" fill="${sat?'#35586c':'#b0cfe9'}"/>
      <path d="M255 170h165v175H255zM775 660h155v140H775z" fill="${sat?'#365334':'#cee6bf'}"/>
      <g stroke="${sat?'#777665':'#fff'}" stroke-width="5">${small.join('')}</g>
      <g fill="none" stroke-linejoin="round">${roads.map(([d,major])=>`<path d="${d}" stroke="${major?'#d5c49c':'#cecac2'}" stroke-width="${major?19:14}"/><path d="${d}" stroke="${major?'#ffedac':'#fff'}" stroke-width="${major?15:11}"/>`).join('')}</g>
      ${layer==='traffic'?`<g fill="none" stroke-width="6">${roads.map(([d],i)=>`<path d="${d}" stroke="${['#81c784','#f9a825','#81c784','#e57373','#81c784','#f9a825'][i]}"/>`).join('')}</g>`:''}
      ${layer==='transit'?'<path d="M0 285H665V1000M0 705H880V0" fill="none" stroke="#7986cb" stroke-width="8"/>':layer==='bicycling'?'<path d="M195 0V1000M0 335H880V1000" fill="none" stroke="#4a9b5c" stroke-width="5" stroke-dasharray="12 7"/>':''}
      <g fill="${sat?'#fff':'#7c817f'}" font-size="12" font-family="Roboto,sans-serif"><text x="540" y="430">Main Street</text><text x="245" y="725">Harbor Street</text><text x="380" y="190">Park Lane</text><text x="930" y="445">River Road</text><text x="620" y="620" fill="#6699b4">Riverside River</text></g>
      ${r?`<polyline points="${r.points.map(v=>v.x+','+v.y).join(' ')}" fill="none" stroke="#fff" stroke-width="13" stroke-linejoin="round"/><polyline points="${r.points.map(v=>v.x+','+v.y).join(' ')}" fill="none" stroke="#4285f4" stroke-width="8" stroke-linejoin="round"${r.mode==='walking'?' stroke-dasharray="3 10"':''}/>`:''}
      ${M().places.map(v=>`<g${mini?'':` data-action="ngmaps-place" data-id="${v.id}" class="ngmaps-poi"`}><circle cx="${v.x}" cy="${v.y}" r="8" fill="${v.id===place?'#db4437':'#8a99a7'}" stroke="#fff" stroke-width="2"/><text x="${v.x+13}" y="${v.y+4}" font-size="13" font-family="Roboto,sans-serif" fill="${sat?'white':'#5c6975'}">${esc(c,v.name)}</text>${mini?'':`<circle cx="${v.x}" cy="${v.y}" r="23" fill="transparent"/>`}</g>`).join('')}
      ${p?`<path d="M${p.x} ${p.y}c-8-12-17-22-17-32a17 17 0 0 1 34 0c0 10-9 20-17 32" fill="#db4437"/><circle cx="${p.x}" cy="${p.y-32}" r="6" fill="#a52714"/>`:''}
      <circle cx="${dot.x}" cy="${dot.y}" r="26" fill="#4285f426"/><circle cx="${dot.x}" cy="${dot.y}" r="9" fill="#4285f4" stroke="#fff" stroke-width="3"/>
    </svg>`;
  }
  NG.mapsPreview=(c,id)=>scene(c,{place:id,mini:true});
  function focus(c,p){const u=U(c),rect=c.el.viewport.getBoundingClientRect(),dp=parseFloat(getComputedStyle(c.el.screen).getPropertyValue('--dp'))||1;u.x=rect.width/dp/2-p.x*u.z;u.y=(rect.height/dp-(u.place?120:0))/2-p.y*u.z;u.focused=true;}
  function select(c,id){const p=M().find(id);if(!p)return;const u=U(c);u.place=id;u.search=null;u.page='';u.route=false;u.menu=false;M().visit(c,id);focus(c,p);c.save();c.render();}
  function searchResults(c){const u=U(c),q=u.search||'',found=[...(u.searchTarget==='origin'&&!q?[{...M().me,name:t('DIRECTIONS_YOUR_LOCATION')}]:[]),...M().search(q)];return found.length?found.map(p=>`<button type="button" class="ngmaps-result" data-action="ngmaps-${u.searchTarget?'endpoint':'place'}" data-id="${p.id}">${img('place')}<span><b>${esc(c,p.name)}</b><small>${esc(c,p.address)}</small></span></button>`).join(''):`<p class="ngmaps-empty">${esc(c,T().fmt('SEARCH_NO_RESULTS',null,q))}</p>`;}
  function drawer(c){
    const u=U(c),items=[['page','YOUR_PLACES','places','bookmark'],['page','YOUR_TIMELINE','timeline','timeline'],['page','OFFLINE_MAPS_TITLE','offline','offline'],['layer','LAYER_TRAFFIC','traffic','traffic'],['layer','LAYER_PUBLIC_TRANSIT','transit','transit'],['layer','LAYER_BICYCLING','bicycling','bicycling'],['layer','LAYER_SATELLITE','satellite','satellite'],['settings','SETTINGS','','settings'],['help','HELP','','help'],['feedback','SEND_FEEDBACK','','share']];
    return `<div class="ngmaps-dim" data-action="ngmaps-menu"></div><aside class="ngmaps-drawer"><div class="ngmaps-account"><span class="ngmaps-avatar">N</span><b>${esc(c,NG.account?.name||'Nexus 6P')}</b><small>${esc(c,NG.account?.email||'')}</small></div>${items.map(([a,k,v,icon])=>`<button type="button" class="ngmaps-menuitem${a==='layer'&&u.layer===v?' on':''}" data-action="ngmaps-${a}" data-value="${v}">${img(icon)}<span>${esc(c,t(k))}</span></button>`).join('')}</aside>`;
  }

  function placeCard(c){const u=U(c),p=M().find(u.place),r=route(c);if(!p)return '';return `<section class="ngmaps-card"><div class="ngmaps-placehead"><span><b>${esc(c,p.name)}</b><small>${esc(c,p.kind||p.address)}</small></span>${button(c,'close-place','close','framework/cancel')}</div>${u.route&&r?`<div class="ngmaps-routefoot"><span><b>${esc(c,minutes(r.minutes))}</b><small>${esc(c,distance(c,r.meters))}</small></span><button type="button" class="ngmaps-start" data-action="ngmaps-start">${img('navigation')}${esc(c,t('NAVIGATION_FAB_LABEL_START'))}</button></div>`:`<small class="ngmaps-address">${esc(c,p.address)}</small><div class="ngmaps-cardactions"><button type="button" data-action="ngmaps-route">${img('directions')}${esc(c,t('NAVIGATION'))}</button><button type="button" data-action="ngmaps-save">${img(D(c).saved.includes(p.id)?'star-saved':'star')}${esc(c,t(D(c).saved.includes(p.id)?'SAVED':'SAVE'))}</button><button type="button" data-action="ngmaps-share">${img('share')}${esc(c,t('SHARE'))}</button></div>`}</section>`;}
  function navigation(c){const u=U(c),r=route(c);if(!r)return '';const i=u.nav.step,up=r.to.y<r.from.y,right=(r.to.x>r.from.x)===up;
    const texts=[T().fmt('DA_STEP_DEPART_ON',null,t(up?'DA_DIRECTION_NORTH':'DA_DIRECTION_SOUTH'),'Main Street'),T().fmt(right?'DA_STEP_TURN_RIGHT_ONTO':'DA_STEP_TURN_LEFT_ONTO',null,r.to.y<400?'Park Lane':'Harbor Street'),t('DA_DESTINATION_REACHED')];
    const left=i===2?0:i===1?Math.abs(r.to.x-r.from.x)*1.2:r.meters,mins=i===2?0:Math.max(1,Math.ceil(r.minutes*(left/r.meters))),arrival=new Date(Date.now()+mins*60000).toLocaleTimeString(c.locale(),{hour:'numeric',minute:'2-digit'});
    return `<div class="ngmaps-cue">${img('navigation')}<span><b>${esc(c,distance(c,left))}</b><span>${esc(c,texts[i])}</span></span></div><div class="ngmaps-navfoot">${button(c,'exit','close','DA_EXIT_NAVIGATION')}<span><b>${esc(c,minutes(mins))}</b><small>${esc(c,distance(c,left)+' · '+T().fmt('ARRIVE_AT_TIME',null,arrival))}</small></span></div>`;
  }
  function page(c){const u=U(c),d=D(c),p=u.page;
    if(p==='places'){const tabs=[['labeled','YOUR_PLACES_NICKNAMED_PLACES'],['saved','YOUR_PLACES_SAVED_PLACES'],['visited','YOUR_PLACES_VISITED_PLACES']];let content='';if(u.tab==='labeled')content=['home','work'].map(k=>row(c,'label',t(k==='home'?'HOME_LOCATION':'WORK_LOCATION'),d[k]||t(k==='home'?'SET_HOME_LOCATION':'SET_WORK_LOCATION'),` data-label="${k}"`)).join('');else{const ids=u.tab==='saved'?d.saved:d.visits.map(v=>v.id);content=ids.map(id=>{const v=M().find(id);return v?row(c,'place',v.name,v.address,` data-id="${id}"`):'';}).join('')||`<p class="ngmaps-empty">${esc(c,t(u.tab==='saved'?'SAVED_PLACES_EMPTY_STATE_TEXT':'VISITED_PLACES_EMPTY_STATE_TEXT'))}</p>`;}return head(c,t('YOUR_PLACES'))+`<nav class="ngmaps-tabs">${tabs.map(([id,k])=>`<button type="button" class="${u.tab===id?'on':''}" data-action="ngmaps-tab" data-value="${id}">${esc(c,t(k))}</button>`).join('')}</nav><div class="ngmaps-list">${content}</div>`;}
    if(p==='offline')return head(c,t('OFFLINE_MAPS_TITLE'))+`<div class="ngmaps-list">${d.areas.map(a=>row(c,'area',a.name,M().progress(a)<100?T().fmt('OFFLINE_REGION_LIST_STATUS_SAVING',null,M().progress(a)):T().fmt('OFFLINE_REGION_LIST_STATUS_SAVED',null,a.mb,new Date(a.expires).toLocaleDateString(c.locale())),` data-id="${a.id}"`)).join('')}${row(c,'download',t('OFFLINE_CACHE_START_SELECTION_BUTTON_IN_MENU'))}</div>`;
    if(p==='timeline')return head(c,t('YOUR_TIMELINE'))+`<div class="ngmaps-list">${row(c,'history-toggle',t(d.historyEnabled?'SETTINGS_ITEM_LOCATION_HISTORY_TITLE_STATUS_ON':'SETTINGS_ITEM_LOCATION_HISTORY_TITLE_STATUS_OFF'))}${d.historyEnabled?d.visits.map(v=>row(c,'place',M().find(v.id)?.name||'',new Date(v.time).toLocaleDateString(c.locale()),` data-id="${v.id}"`)).join('')+row(c,'clear-history',t('SETTINGS_ITEM_DELETE_ALL_LOCATION_HISTORY_TITLE')):row(c,'history-toggle',t('LOCATION_HISTORY_TURN_ON'))}</div>`;
    if(p==='history')return head(c,t('MAPS_HISTORY'))+`<div class="ngmaps-list">${d.searches.map(q=>row(c,'history-search',q,'',` data-query="${esc(c,q)}"`)).join('')}${row(c,'clear-search',t('DELETE_BUTTON'))}</div>`;
    if(p==='licenses')return head(c,t('OPEN_SOURCE_LICENSES'))+`<pre class="ngmaps-licenses">${esc(c,u.licenses||'')}</pre>`;
    return head(c,t('ABOUT'))+`<div class="ngmaps-list">${row(c,'noop','Maps','9.34.1')}${['TERMS_OF_SERVICE','PRIVACY_POLICY','OPEN_SOURCE_LICENSES'].map(k=>row(c,'legal',t(k),'',` data-value="${k}"`)).join('')}</div>`;
  }
  function sync(c){const u=U(c),sub=c.ui.sub;if(!sub)return;c.ui.sub='';if(sub.startsWith('q:')){u.search=sub.slice(2);u.page='';u.menu=false;u.nav=null;}else if(sub==='driving'){u.route=true;u.page='';u.search='';u.searchTarget='destination';u.mode='driving';u.origin='me';}else if(sub.startsWith('place:')){u.place=sub.slice(6);u.page='';u.route=false;u.focused=false;}else if(sub.startsWith('shortcut:')){const id=sub.slice(9);if(id.includes('home')||id.includes('work')){const q=D(c)[id.includes('home')?'home':'work'],p=M().search(q)[0];if(q&&p){u.origin='me';u.place=p.id;u.route=true;u.focused=false;}else{u.page='places';u.tab='labeled';}}else{u.search='';u.page='';}}}
  function render(c){sync(c);const u=U(c);if(u.page)return `<div class="ngmaps page">${page(c)}</div>`;
    const r=u.route?route(c):null,position=u.nav&&r?r.points[Math.min(2,u.nav.step)]:null;
    const search=u.search!==null?`<div class="ngmaps-search">${back(c)}<input class="ngmaps-input" value="${esc(c,u.search)}" placeholder="${esc(c,t('SEARCH_HINT'))}" autocomplete="off">${button(c,'clear','close','REMOVE')}</div><div class="ngmaps-results">${searchResults(c)}</div>`:u.route?`<div class="ngmaps-directions">${back(c)}<div class="ngmaps-endpoints"><button type="button" data-action="ngmaps-origin">${esc(c,originName(c))}</button><button type="button" data-action="ngmaps-destination">${esc(c,M().find(u.place)?.name||t('DIRECTIONS_CHOOSE_END_POINT'))}</button></div><button type="button" class="ngmaps-icon ngmaps-swap" data-action="ngmaps-swap">↕</button><nav>${['driving','transit','walking','bicycling'].map(mode=>`<button type="button" class="${u.mode===mode?'on':''}" data-action="ngmaps-mode" data-value="${mode}" aria-label="${esc(c,t('ACCESSIBILITY_SWITCH_TO_'+mode.toUpperCase()))}">${img(mode)}</button>`).join('')}</nav></div>`:`<div class="ngmaps-search">${button(c,'menu','menu','ACCESSIBILITY_MENU')}<button type="button" class="ngmaps-searchlabel" data-action="ngmaps-search">${esc(c,t('SEARCH_HINT'))}</button>${button(c,'voice','mic','SEARCH')}</div>`;
    const areaSelection=u.areaSelecting?`<div class="ngmaps-area"><b>${esc(c,t('OFFLINE_CACHE_SELECT_AREA_TITLE'))}</b><i></i><footer><span>${esc(c,T().fmt('OFFLINE_SELECT_AREA_SIZE_STRING_LANDSCAPE',null,24,1024))}</span><button type="button" data-action="ngmaps-area-download">${esc(c,t('OFFLINE_DOWNLOAD'))}</button></footer></div>`:'';
    return `<div class="ngmaps${u.place?' has-place':''}${u.nav?' navigating':''}"><div class="ngmaps-map"><div class="ngmaps-transform" style="transform:translate(calc(${u.x} * var(--dp)),calc(${u.y} * var(--dp))) scale(${u.z})">${scene(c,{place:u.place,layer:u.layer,r,position})}</div></div>${img('logo','ngmaps-watermark')}${u.nav?navigation(c):u.areaSelecting?'':search}${u.search===null&&!u.nav&&!u.areaSelecting?`${button(c,'locate','locate','ACCESSIBILITY_MOVE_TO_MY_LOCATION', ' data-floating="locate"')}${!u.place?`<button type="button" class="ngmaps-fab" data-action="ngmaps-destination" aria-label="${esc(c,t('NAVIGATION'))}">${img('directions-white')}</button>`:''}${placeCard(c)}`:''}${areaSelection}${u.menu?drawer(c):''}</div>`;
  }
  function edit(c,title,value,done){let text=value;c.dialog({title,html:`<div class="ngst-edit"><input class="ngst-input" value="${esc(c,value)}" autocomplete="off"></div>`,mount(c,win){win.querySelector('input').addEventListener('input',e=>text=e.target.value);},buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{done(text.trim());c.save();c.render();}}]});}
  function showArea(c,id){const a=D(c).areas.find(x=>x.id===id);if(!a)return;c.menu([{label:t('OFFLINE_MENU_RENAME_AREA'),action:c=>edit(c,t('OFFLINE_MAPS_RENAME_AREA_TITLE'),a.name,text=>a.name=text||a.name)},{label:t('OFFLINE_MENU_DELETE_AREA'),action:c=>c.dialog({message:T().fmt('OFFLINE_MAPS_DELETE_AREA_CONFIRM',null,a.name),buttons:[{label:t('framework/cancel')},{label:t('OFFLINE_MENU_DELETE_AREA'),action:c=>{D(c).areas=D(c).areas.filter(v=>v.id!==id);c.save();c.render();}}]})}]);}
  const mod={statusColor:c=>U(c).nav?'#0b8043':'#c4c4c4',render,
    mount(c,root){const u=U(c),map=root.querySelector('.ngmaps-map'),transform=root.querySelector('.ngmaps-transform');if(map&&!u.focused){focus(c,M().find(u.place)||M().me);transform.style.transform=`translate(calc(${u.x} * var(--dp)),calc(${u.y} * var(--dp))) scale(${u.z})`;}
      const input=root.querySelector('.ngmaps-input');if(input){input.addEventListener('input',()=>{u.search=input.value;root.querySelector('.ngmaps-results').innerHTML=searchResults(c);});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();D(c).searches=[input.value.trim(),...D(c).searches.filter(q=>q!==input.value.trim())].filter(Boolean).slice(0,30);c.save();NG.ime?.hide?.();input.blur();}});}
      if(!map)return;const pointers=new Map();let pan=null,pinch=null,moved=false;const dp=()=>parseFloat(getComputedStyle(c.el.screen).getPropertyValue('--dp'))||1,draw=()=>transform.style.transform=`translate(calc(${u.x} * var(--dp)),calc(${u.y} * var(--dp))) scale(${u.z})`;
      const zoom=(z,x,y)=>{const old=u.z;u.z=Math.max(.7,Math.min(3.2,z));u.x=x-(x-u.x)*u.z/old;u.y=y-(y-u.y)*u.z/old;draw();};
      map.addEventListener('pointerdown',e=>{pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});map.setPointerCapture(e.pointerId);pan={x:e.clientX,y:e.clientY,tx:u.x,ty:u.y,target:e.target.closest('.ngmaps-poi')?.dataset.id};moved=false;if(pointers.size===2){const a=[...pointers.values()];pinch={distance:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),z:u.z};}});
      map.addEventListener('pointermove',e=>{if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2&&pinch){const a=[...pointers.values()],rect=map.getBoundingClientRect();zoom(pinch.z*Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)/pinch.distance,((a[0].x+a[1].x)/2-rect.left)/dp(),((a[0].y+a[1].y)/2-rect.top)/dp());moved=true;}else if(pan){const dx=e.clientX-pan.x,dy=e.clientY-pan.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){u.x=pan.tx+dx/dp();u.y=pan.ty+dy/dp();draw();}}});
      const end=e=>{const target=pan?.target;pointers.delete(e.pointerId);pan=null;pinch=null;if(moved)u.suppressUntil=Date.now()+250;else if(target&&!u.areaSelecting&&e.type!=='pointercancel')select(c,target);};map.addEventListener('pointerup',end);map.addEventListener('pointercancel',end);
      map.addEventListener('wheel',e=>{e.preventDefault();const r=map.getBoundingClientRect();zoom(u.z*(e.deltaY<0?1.15:1/1.15),(e.clientX-r.left)/dp(),(e.clientY-r.top)/dp());},{passive:false});
    },
    back(c){const u=U(c);if(u.menu)u.menu=false;else if(u.areaSelecting){u.areaSelecting=false;u.page='offline';}else if(u.search!==null){u.search=null;u.searchTarget='';}else if(u.nav)u.nav=null;else if(u.page==='licenses')u.page='about';else if(u.page)u.page='';else if(u.route)u.route=false;else if(u.place)u.place='';else return false;c.render();return true;},
    unmount(c){U(c).nav=null;},
    tick(c,now){const u=U(c);if(c.ui.view!=='maps')return;if(u.nav&&now>=u.nav.next&&u.nav.step<2){u.nav.step++;u.nav.next=now+6000;const r=route(c);if(r)focus(c,r.points[u.nav.step]);c.render();}if(u.page==='offline'&&D(c).areas.some(a=>M().progress(a,now-1000)<100))c.render();},
    action(name,el,event,c){const u=U(c),d=D(c);if(!name.startsWith('ngmaps-'))return false;
      switch(name.slice(7)){
        case 'noop':return true;
        case 'place':if(Date.now()<(u.suppressUntil||0))return true;select(c,el.dataset.id);return true;
        case 'endpoint':{const p=M().find(el.dataset.id);if(!p)return true;if(u.searchTarget==='origin')u.origin=p.id;else u.place=p.id;u.searchTarget='';u.search=null;u.route=true;focus(c,p);break;}
        case 'menu':u.menu=!u.menu;break;
        case 'page':u.page=el.dataset.value;u.menu=false;break;
        case 'tab':u.tab=el.dataset.value;break;
        case 'back':if(!this.back(c))c.back();return true;
        case 'search':u.search='';u.searchTarget='';break;
        case 'voice':NG.googleVoiceInput(c,text=>{u.search=text;c.render();});return true;
        case 'clear':u.search='';break;
        case 'origin':u.search='';u.searchTarget='origin';break;
        case 'destination':u.search='';u.searchTarget='destination';break;
        case 'swap':if(u.place){[u.origin,u.place]=[u.place,u.origin];focus(c,M().find(u.place));}break;
        case 'route':u.route=true;focus(c,M().find(u.place));break;
        case 'mode':u.mode=el.dataset.value;break;
        case 'close-place':u.place='';u.route=false;u.nav=null;break;
        case 'locate':focus(c,M().me);break;
        case 'layer':u.layer=u.layer===el.dataset.value?'':el.dataset.value;u.menu=false;break;
        case 'save':M().save(c,u.place);c.save();break;
        case 'share':{const p=M().find(u.place);if(p)NG.share(c,{subject:p.name,text:p.name+'\n'+p.address+'\nhttps://maps.example/?place='+p.id});return true;}
        case 'start':if(route(c)){u.nav={step:0,next:Date.now()+6000};u.z=1.5;focus(c,route(c).from);}break;
        case 'exit':u.nav=null;u.z=.9;focus(c,M().find(u.place)||M().me);break;
        case 'settings':u.menu=false;NG.openPrefs(c,'maps','settings',t('SETTINGS'));return true;
        case 'help':c.open('help','maps');return true;
        case 'feedback':c.open('help','feedback:maps');return true;
        case 'label':{const k=el.dataset.label;edit(c,t(k==='home'?'SET_HOME_LOCATION':'SET_WORK_LOCATION'),d[k],text=>d[k]=text);return true;}
        case 'history-toggle':d.historyEnabled=!d.historyEnabled;c.save();break;
        case 'clear-history':d.visits=[];c.save();break;
        case 'clear-search':d.searches=[];c.save();break;
        case 'history-search':u.search=el.dataset.query;u.page='';break;
        case 'download':u.page='';u.areaSelecting=true;u.search=null;break;
        case 'area-download':edit(c,t('OFFLINE_NAME_AREA_TITLE'),'Riverside',text=>{const a=M().area(c,text);a.camera={x:u.x,y:u.y,z:u.z};u.areaSelecting=false;u.page='offline';});return true;
        case 'area':showArea(c,+el.dataset.id);return true;
        case 'legal':if(el.dataset.value==='OPEN_SOURCE_LICENSES'){u.page='licenses';if(!u.licenses)fetch('assets/mp-gmm_license_notices.txt').then(r=>r.text()).then(text=>{u.licenses=text;if(c.ui.view==='maps'&&u.page==='licenses')c.render();});break;}c.open('chrome','url:https://www.google.com/'+(el.dataset.value==='PRIVACY_POLICY'?'policies/privacy/':'intl/en_US/help/terms_maps.html'));return true;
        default:return false;
      }c.render();return true;
    }
  };
  NG.register('maps',mod);
  NG.appPrefsHooks.maps={hide:(c,key)=>key==='sign_in_out',fragments:{},click(c,key){const u=U(c);if(key==='navigation_settings'){NG.appPrefsGo(c,'settings_navigation_prefs',t('NAVIGATION_SETTINGS'));return true;}if(key==='play_test_sound'){const sound=new Audio('assets/mp-test.ogg');sound.volume=NG.appPref(c,'maps','voice_level','NORMAL')==='SOFTER'?.3:.8;sound.play().catch(()=>{});return true;}if(key==='hotword_settings'){NG.openPrefs(c,'google','hotword_settings',NG.text('appprefs').t('Maps/HOTWORD_SETTINGS'));return true;}if(key==='driving_mode_add_homescreen_shortcut'){NG.launcherInstall(c,{type:'shortcut',label:t('DRIVING_MODE_SIDE_MENU_ITEM'),icon:NG.appsData.maps.icon,target:{view:'maps',sub:'driving'}});return true;}if(key==='improve_location'){c.toast(t('LOCATION_SETTING_IS_ALREADY_OPTIMIZED'));return true;}if(key==='location_reporting'){c.open('settings','location');return true;}if(key==='notifications'){c.open('settings','app-notif:maps');return true;}const target={edit_home_work:'places',offline_maps_settings:'offline',maps_history:'history',about:'about'}[key];if(target){u.page=target;c.open('maps');return true;}return false;}};
  NG.mapsMessengerPicker=c=>`<div class="ngmaps-picker"><div class="ngmaps-pickmap">${scene(c,{place:'cafe',mini:true})}</div><div class="ngmaps-picktitle">${esc(c,t('PrebuiltBugle/place_picker_nearby_places'))}</div>${M().places.map(p=>`<button type="button" class="ngmaps-pickrow" data-action="ngms-location" data-id="${p.id}">${img('place')}<span><b>${esc(c,p.name)}</b><small>${esc(c,p.address)}</small></span></button>`).join('')}</div>`;
})();
