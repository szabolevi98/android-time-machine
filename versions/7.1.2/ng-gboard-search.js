/* Gboard 6.0 access points and gbot search keyboard. Search cards are supplied by
   the same invented 2017 offline service used by Chrome/Google, never live Google. */
(() => {
 'use strict';let K,state=null,scroll=null;
 const c=()=>K.context(),root=()=>K.root(),T=()=>NG.text('gboard'),tr=k=>T().t(k),esc=s=>c().safe(s),icon=n=>`<img src="assets/gb-${n}.png" alt="">`,button=(key,image,label)=>`<button type="button" class="ngboard-key tool" data-gb="${key}" aria-label="${esc(tr(label))}">${icon(image)}</button>`;
 function query(){K.alpha();state={page:'query',q:state?.q||'',caret:state?.q?.length||0,rows:[]};K.draw();}
 function close(){state=null;K.focus();K.draw();}
 function results(q){q=String(q).trim().slice(0,300);if(!q)return;const ctx=c(),history=NG.appPref(ctx,'gboard','gbot_search_history',[]);NG.setAppPref(ctx,'gboard','gbot_search_history',[q,...history.filter(s=>s!==q)].slice(0,30));state.q=q;state.page='results';
   const words=q.toLocaleLowerCase(ctx.locale()).split(/\s+/).filter(Boolean),all=[{title:'Android – Nougat',snippet:'Android 7 Nougat: split screen, quick replies and a better Android experience.',url:NG.web.ANDROID},{title:'Android (operating system) – Wikipedia',snippet:'Explore the history and versions of Android.',url:NG.web.WIKI},...NG.web.articles()];
   if(/weather|időjárás|wetter|météo|tiempo/i.test(q))state.rows=[{title:'Riverside · 18°C',snippet:'Partly cloudy',url:NG.web.GOOGLE+'search?q=weather+Riverside'}];
   else if(/sun.?set|napnyugta|sonnen|coucher|puesta/i.test(q))state.rows=[{title:'Riverside · Sunset',snippet:'6:42 PM',url:NG.web.GOOGLE+'search?q=sunset+Riverside'}];
   else if(/news|hír|nachricht|actualit|notici/i.test(q))state.rows=NG.web.articles();
   else state.rows=all.filter(r=>words.some(w=>`${r.title} ${r.snippet}`.toLocaleLowerCase(ctx.locale()).includes(w)));
   K.draw();K.focus();
 }
 function edit(text,deleting=false){const input=root().querySelector('.ngboard-search-query');if(!input)return;let start=input.selectionStart??state.q.length,end=input.selectionEnd??start;if(deleting&&start===end&&start>0)start=[...new Intl.Segmenter(c().locale(),{granularity:'grapheme'}).segment(input.value.slice(0,start))].at(-1)?.index??0;input.setRangeText(text,start,end,'end');state.q=input.value;state.caret=start+text.length;K.draw();}
 NG.keyboardFeatures={connect:k=>{K=k;},reset(){state=null;scroll=null;},isSearch:()=>state?.page==='query'||state?.page==='results',
  header(){if(!state)return null;if(state.page==='menu')return `<div class="ngboard-feature-menu">${button('feature-close','menu','close_access_points_menu_content_desc')}${button('feature-search','feature-search','search_access_point_content_desc')}${NG.appPref(c(),'gboard','enable_voice_input',true)?button('feature-voice','mic','voice_input_key_content_desc'):''}${button('feature-hand','feature-hand','one_handed_access_point_content_desc')}${button('feature-theme','feature-theme','theme_settings_access_point_content_desc')}${button('feature-settings','settings','settings_access_point_content_desc')}</div>`;
   return `<div class="ngboard-query-box">${button('feature-close','menu','close_access_points_menu_content_desc')}${button('feature-submit','feature-search','search_access_point_content_desc')}${state.page==='query'?`<input class="ngboard-search-query" type="text" inputmode="none" spellcheck="false" autocomplete="off" value="${esc(state.q)}" placeholder="${esc(tr('gbot_search_results_hint'))}" aria-label="${esc(tr('gbot_search_results_hint'))}">`:`<button type="button" class="ngboard-query-text" data-gb="feature-query">${esc(state.q)}</button>`}${button('feature-clear','delete','abc_searchview_description_clear')}</div>`;
  },
  body(){if(state?.page!=='results')return null;return `<div class="ngboard-search-results">${state.rows.length?`<div class="ngboard-result-cards">${state.rows.map((r,i)=>`<article class="ngboard-search-card"><button type="button" data-gb="feature-open:${i}"><h3>${esc(r.title)}</h3><small>${esc(r.url)}</small><p>${esc(r.snippet)}</p></button><button type="button" class="ngboard-search-share" data-gb="feature-share:${i}">${esc(tr('gbot_share_chip_text'))}</button></article>`).join('')}</div>`:`<div class="ngboard-no-results"><strong>${esc(tr('gboard_no_results_header'))}</strong><p>${esc(tr('gboard_no_results_message'))}</p></div>`}<div class="ngboard-search-chips">${[0,1,2].map(i=>`<button type="button" data-gb="feature-default:${i}">${esc(tr('gbot_keyboard_default_candidate_'+i))}</button>`).join('')}</div></div>`;},
  pointerDown(e){const box=e.target.closest('.ngboard-result-cards,.ngboard-search-chips');scroll=box?{box,x:e.clientX,y:e.clientY,left:box.scrollLeft,body:e.target.closest('.ngboard-search-card>button:first-child'),active:false}:null;if(scroll?.body)scroll.top=scroll.body.scrollTop;},
  pointerMove(e){if(!scroll)return false;const dx=e.clientX-scroll.x,dy=e.clientY-scroll.y;if(!scroll.active&&Math.hypot(dx,dy)<7)return false;if(!scroll.active){scroll.active=true;scroll.vertical=Math.abs(dy)>Math.abs(dx)&&scroll.body;root().setPointerCapture?.(e.pointerId);}if(scroll.vertical)scroll.body.scrollTop=scroll.top-dy;else scroll.box.scrollLeft=scroll.left-dx;return true;},
  pointerUp(){const handled=!!scroll?.active;scroll=null;return handled;},
  mount(){const input=root()?.querySelector('.ngboard-search-query');if(!input)return;input.addEventListener('input',()=>{state.q=input.value;state.caret=input.selectionStart;});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();results(input.value);}});input.focus({preventScroll:true});input.setSelectionRange(state.caret,state.caret);},
  back(){if(!state)return false;if(state.page==='results')query();else close();return true;},
  press(key){if(key==='features'){if(state)close();else if(NG.appPref(c(),'gboard','enable_one_tap_to_search',false))query();else{state={page:'menu',q:'',rows:[]};K.draw();}return true;}
   if(state?.page==='query'){if(key.startsWith('text:')){edit(key.slice(5));return true;}if(key==='space'){edit(' ');return true;}if(key==='delete'){edit('',true);return true;}if(key==='enter'){results(state.q);return true;}}
   if(!key.startsWith('feature-'))return false;const ctx=c();
   if(key==='feature-close'){close();return true;}
   if(key==='feature-search'||key==='feature-query'){query();return true;}
   if(key==='feature-clear'){state.q='';state.caret=0;state.page='query';K.draw();return true;}
   if(key==='feature-submit'){if(state?.page==='query')results(state.q);else query();return true;}
   if(key==='feature-voice'){state=null;K.press('voice');return true;}
   if(key==='feature-settings'){K.hide();NG.openPrefs(ctx,'gboard','settings',tr('ime_name'));return true;}
   if(key==='feature-theme'){K.hide();NG.openPrefs(ctx,'gboard','themes',tr('theme_selector_title'));return true;}
   if(key==='feature-hand'){NG.setAppPref(ctx,'gboard','one_handed_mode',NG.appPref(ctx,'gboard','one_handed_mode','0')==='0'?'1':'0');close();return true;}
   if(key.startsWith('feature-default:')){if(!state)state={};results(tr('gbot_keyboard_default_candidate_'+key.split(':')[1]));return true;}
   if(key.startsWith('feature-share:')){const r=state?.rows[+key.split(':')[1]];if(r){state=null;K.focus();K.insert(r.title+(K.multiline()?'\n':' ')+r.url);}return true;}
   if(key.startsWith('feature-open:')){const r=state?.rows[+key.split(':')[1]];if(r){K.hide();ctx.open('chrome','url:'+r.url);}return true;}
   return false;
  }
 };
})();
