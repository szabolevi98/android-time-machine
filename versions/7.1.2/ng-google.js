/* Google app 6.5.36 (Velvet), N2G48C. Native search_plate/core_suggestion_view,
   now_doodle_themed_header, qp_now_card, drawer_entry and screen_assist_opt_in layouts.
   Search pages, Riverside weather and news are the simulator's own offline content (demo-data.md).
   Calendar/contacts/app results use the same saved phone as their owning activities. */
(() => {
  'use strict';
  const T=()=>NG.text('google'), t=k=>T().t(k.replace(/^own:/,'')), esc=(c,x)=>c.safe(x), A=n=>`assets/gg-${n}.png`;
  const icon=n=>`<img src="${A(n)}" alt="">`;
  NG.defaults.google={history:[],dismissed:[],units:'c',assistOptIn:false,feed:true};
  const S=c=>{const s=c.data.google ||= {};s.history ||= [];s.dismissed ||= [];return s;};
  const U=c=>c.ui.google ||= {mode:'feed',q:'',tab:'websearch',feedTab:'feed',drawer:false,focus:false};
  const date=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`;};
  const clock=(c,s)=>{const [h,m]=(s||'00:00').split(':');return new Intl.DateTimeFormat(c.locale(),{hour:'numeric',minute:'2-digit'}).format(new Date(2000,0,1,+h,+m));};
  const events=c=>NG.calendarEvents?.(c)||[];
  function nextEvent(c) {
    const now=new Date();return events(c).filter(e=>!e.task&&!e.done&&new Date(`${e.date}T${e.allDay?'23:59':e.end||e.start||'23:59'}`)>=now).sort((a,b)=>`${a.date} ${a.start||''}`.localeCompare(`${b.date} ${b.start||''}`))[0]||null;
  }
  function remember(c,q) {
    q=String(q||'').trim().slice(0,300);if(!q)return '';
    S(c).history=[q,...S(c).history.filter(x=>x.toLocaleLowerCase(c.locale())!==q.toLocaleLowerCase(c.locale()))].slice(0,50);c.save();return q;
  }
  const btn=(c,action,image,label,extra='')=>`<button type="button" class="nggoogle-icon" data-action="nggoogle-${action}" aria-label="${esc(c,t(label))}" ${extra}>${icon(image)}</button>`;
  function plate(c,editing=false) {
    const u=U(c);
    return `<div class="nggoogle-plate">${btn(c,editing?'back':'drawer',editing?'back':'menu',editing?'cancel':'accessibility_drawer_menu_button')}
      ${editing?`<form data-form="nggoogle-query"><input class="nggoogle-query" type="search" name="q" value="${esc(c,u.q)}" placeholder="${esc(c,t('search_box_hint'))}" aria-label="${esc(c,t('search_box_hint'))}" autocomplete="off" spellcheck="false" enterkeyhint="search"></form>`:`<button type="button" class="nggoogle-placeholder" data-action="nggoogle-edit">${u.q&&u.mode==='results'?esc(c,u.q):icon('logo')}</button>`}
      ${btn(c,editing&&u.q?'clear':'voice',editing&&u.q?'clear':'mic',editing&&u.q?'clear':'accessibility_voice_search_button')}</div>`;
  }
  function suggestions(c) {
    const q=U(c).q.trim(), lower=q.toLocaleLowerCase(c.locale()), s=S(c);
    const history=s.history.filter(x=>!q||x.toLocaleLowerCase(c.locale()).includes(lower)).slice(0,6);
    const queries=[...new Set([...(q?[q]:[]),...history,...(q?['Android Nougat','Nexus 6P','weather Riverside'].filter(x=>x.toLocaleLowerCase(c.locale()).includes(lower)):[])])].slice(0,8);
    const queryRows=queries.map(x=>`<div class="nggoogle-suggestion" data-history="${history.includes(x)?esc(c,x):''}"><button type="button" data-action="nggoogle-query" data-q="${esc(c,x)}">${icon(history.includes(x)?'history':'search')}<span>${esc(c,x)}</span></button><button type="button" class="nggoogle-refine" data-action="nggoogle-refine" data-q="${esc(c,x)}" aria-label="${esc(c,t('search_box_hint'))}">↖</button></div>`).join('');
    if(!q)return queryRows;
    const apps=NG.appPref(c,'google','source_search',true)?Object.keys(NG.appsData||{}).filter(id=>!NG.appDisabled(c,id)&&NG.appLabel(c,id).toLocaleLowerCase(c.locale()).includes(lower)).slice(0,4):[];
    const people=NG.appPref(c,'google','source_contacts',true)?NG.people.list(c).filter(p=>`${p.name} ${p.phone} ${p.email}`.toLocaleLowerCase(c.locale()).includes(lower)).slice(0,4):[];
    return queryRows+apps.map(id=>`<div class="nggoogle-suggestion"><button type="button" data-action="nggoogle-app" data-id="${esc(c,id)}"><img src="${esc(c,NG.appsData[id].icon)}" alt=""><span>${esc(c,NG.appLabel(c,id))}</span></button></div>`).join('')+
      people.map(p=>`<div class="nggoogle-suggestion"><button type="button" data-action="nggoogle-contact" data-id="${p.id}">${NG.people.tile(c,p)}<span>${esc(c,p.name)}<small>${esc(c,p.phone||p.email)}</small></span></button></div>`).join('');
  }
  function resultData(c) {
    const q=U(c).q.toLowerCase(), articles=NG.web.articles();
    const rows=[{url:NG.web.ANDROID,title:'Android – Nougat',snippet:'Android 7 Nougat: split screen, bundled notifications, quick replies and a better Android experience.'},
      {url:NG.web.WIKI,title:'Android (operating system) – Wikipedia',snippet:'Android is a mobile operating system developed by Google. Explore its history and versions.'},
      ...articles];
    return rows.sort((a,b)=>Number(`${b.title} ${b.snippet}`.toLowerCase().includes(q))-Number(`${a.title} ${a.snippet}`.toLowerCase().includes(q)));
  }
  function weather(c) {
    const s=S(c), unit=s.units==='f', temp=unit?'64°':'18°';
    return `<div class="nggoogle-weather"><button type="button" class="nggoogle-weather-city" data-action="nggoogle-weather"><h2>Riverside</h2><span>${esc(c,t('own:weather_conditions'))}</span></button><img src="${A('weather')}" alt=""><strong>${temp}</strong><button type="button" data-action="nggoogle-units">${unit?'°F':'°C'}</button></div>`;
  }
  const card=(c,id,body)=>`<article class="nggoogle-card" data-card="${esc(c,id)}">${btn(c,'card-menu','more','more',`data-id="${esc(c,id)}"`)}${body}</article>`;
  function feedCards(c) {
    const s=S(c), u=U(c), all=s.feed!==false;
    let html='';
    if(all&&u.feedTab!=='upcoming'&&!s.dismissed.includes('weather')) html+=card(c,'weather',`<div class="nggoogle-cardbody">${weather(c)}</div>`);
    const event=nextEvent(c);
    if(all&&event&&!s.dismissed.includes('event:'+event.id))html+=card(c,'event:'+event.id,`<button type="button" class="nggoogle-cardbody" data-action="nggoogle-calendar" data-id="${event.id}"><small>${esc(c,new Intl.DateTimeFormat(c.locale(),{weekday:'long',month:'short',day:'numeric'}).format(new Date(event.date+'T12:00')))}</small><h2>${esc(c,event.title)}</h2><p>${event.allDay?'':esc(c,clock(c,event.start))}${event.where?' · '+esc(c,event.where):''}</p></button>`);
    if(u.feedTab!=='upcoming'&&(all||NG.appPref(c,'google','npStreamPreference',true))) for(const [i,story] of NG.web.articles().slice(0,2).entries())if(!s.dismissed.includes('story:'+i))html+=card(c,'story:'+i,`<button type="button" class="nggoogle-cardbody" data-action="nggoogle-url" data-url="${esc(c,story.url)}">${NG.web.picture(story.hue,'nggoogle-storypic')}<h2>${esc(c,story.title)}</h2><small>Tech News</small><p>${esc(c,story.snippet)}</p></button>`);
    return html||`<p class="nggoogle-empty">${esc(c,t('own:feed_empty'))}</p>`;
  }
  function drawer(c) {
    if(!U(c).drawer)return '';
    return `<div class="nggoogle-drawer-dim" data-action="nggoogle-drawer"></div><aside class="nggoogle-drawer"><div class="nggoogle-account">${icon('logo')}<div class="nggoogle-avatar">N</div><b>${esc(c,NG.account?.name||'Nexus 6P')}</b><small>${esc(c,NG.account?.email||'nexus6p.demo@gmail.com')}</small></div>${[
      ['feed','g','now_cards'],['reminders','reminder','my_reminders'],['customize','customize','customize'],['settings','settings','settings'],['help','search','help']].map(([id,img,label])=>`<button type="button" data-action="nggoogle-${id}">${icon(img)}<span>${esc(c,t(label))}</span></button>`).join('')}</aside>`;
  }
  function nowPage(c) {
    return `<div class="nggoogle nggoogle-feed"><div class="nggoogle-scroll"><div class="nggoogle-nowhead">${btn(c,'drawer','menu','accessibility_drawer_menu_button')}<img class="nggoogle-nowlogo" src="${A('logo')}" alt="Google"><div class="nggoogle-nowplate">${plate(c)}</div></div><div class="nggoogle-feedtabs"><button type="button" class="${U(c).feedTab==='feed'?'on':''}" data-action="nggoogle-feedtab" data-tab="feed">${esc(c,t('now_cards'))}</button><button type="button" class="${U(c).feedTab==='upcoming'?'on':''}" data-action="nggoogle-feedtab" data-tab="upcoming">${esc(c,t('now_update_tab'))}</button></div><div class="nggoogle-cards">${feedCards(c)}</div></div>${drawer(c)}</div>`;
  }
  function results(c) {
    const u=U(c), tabs=['websearch','websearch_images','websearch_news','websearch_videos','intent_maps'];
    let content='';
    if(/weather|időjárás|wetter|météo|tiempo/i.test(u.q)&&!S(c).dismissed.includes('answer'))content+=card(c,'answer',weather(c));
    if(u.tab==='websearch_images')content+=`<div class="nggoogle-images">${NG.media.photos(c).map(p=>`<button type="button" data-action="nggoogle-photo" data-id="${p.id}">${NG.media.svg(p,'nggoogle-photo')}<span>${esc(c,p.title||p.name||'')}</span></button>`).join('')}</div>`;
    else content+=resultData(c).filter((x,i)=>u.tab==='websearch_news'?i>1:u.tab==='websearch_videos'?i<2:true).map(r=>`<article class="nggoogle-result"><button type="button" data-action="nggoogle-url" data-url="${esc(c,r.url)}"><h2>${esc(c,r.title)}</h2><small>${esc(c,r.url)}</small><p>${esc(c,r.snippet)}</p></button></article>`).join('');
    return `<div class="nggoogle">${plate(c)}<div class="nggoogle-tabs">${tabs.map(id=>`<button type="button" class="${u.tab===id?'on':''}" data-action="nggoogle-tab" data-tab="${id}">${esc(c,t('corpus_name_'+id))}</button>`).join('')}</div><div class="nggoogle-resultscroll">${content}<p class="nggoogle-offline">${esc(c,t('own:offline_results'))}</p></div>${drawer(c)}</div>`;
  }
  function voice(c) {
    return `<div class="nggoogle nggoogle-voice">${btn(c,'back','back','cancel')}<img class="nggoogle-voicelogo" src="${A('logo')}" alt="Google"><h1>${esc(c,t('speak_now'))}</h1><div class="nggoogle-mic">${icon('mic')}</div><p>${esc(c,t('own:voice_samples'))}</p>${['Weather in Riverside','Android Nougat','Nexus 6P'].map(q=>`<button type="button" class="nggoogle-phrase" data-action="nggoogle-query" data-q="${esc(c,q)}">${esc(c,q)}</button>`).join('')}</div>`;
  }
  function reminderEditor(c,id) {
    const old=events(c).find(e=>e.task&&e.id===+id), draft={title:old?.title||'',date:old?.date||date(new Date()),start:old?.start||'09:00',where:old?.where||''};
    c.dialog({title:t('edit_reminder'),html:`<div class="nggoogle-reminderedit"><input data-field="title" value="${esc(c,draft.title)}" placeholder="${esc(c,t('edit_reminder_set_title'))}"><input type="date" data-field="date" value="${draft.date}"><input type="time" data-field="start" value="${draft.start}"><input data-field="where" value="${esc(c,draft.where)}" placeholder="${esc(c,t('edit_reminder_set_location'))}"></div>`,
      mount(c,win){for(const f of win.querySelectorAll('input'))f.addEventListener('input',()=>draft[f.dataset.field]=f.value);},
      buttons:[...(old?[{label:t('delete'),neutral:true,action:c=>{c.data.events=events(c).filter(e=>e.id!==old.id);c.save();c.render();}}]:[]),{label:t('cancel')},{label:t('done'),action:c=>{if(!draft.title.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(draft.date)||!/^\d{2}:\d{2}$/.test(draft.start))return;const e=old||{id:Math.max(0,...events(c).map(e=>+e.id||0))+1,task:true,done:false,allDay:false,note:''};Object.assign(e,draft,{title:draft.title.trim(),end:draft.start});if(!old)events(c).push(e);c.save();c.render();}}]});
  }
  function reminders(c) {
    const tab=U(c).reminderTab||'ongoing', list=events(c).filter(e=>e.task&&!!e.done===(tab==='done')).sort((a,b)=>`${a.date} ${a.start}`.localeCompare(`${b.date} ${b.start}`));
    return `<div class="nggoogle">${plate(c)}<h1 class="nggoogle-heading">${esc(c,t('my_reminders'))}</h1><div class="nggoogle-tabs">${['ongoing','done'].map(id=>`<button type="button" data-action="nggoogle-remindertab" data-tab="${id}" class="${id===tab?'on':''}">${esc(c,t('reminders_'+id))}</button>`).join('')}</div><div class="nggoogle-resultscroll">${list.map(e=>`<div class="nggoogle-reminder"><button type="button" class="nggoogle-complete" data-action="nggoogle-reminder-toggle" data-id="${e.id}"><i class="ngst-check${e.done?' on':''}"></i></button><button type="button" data-action="nggoogle-reminder-edit" data-id="${e.id}"><b>${esc(c,e.title)}</b><small>${esc(c,e.date)} · ${esc(c,clock(c,e.start))}${e.where?' · '+esc(c,e.where):''}</small></button></div>`).join('')||`<p class="nggoogle-empty">${esc(c,t('own:reminder_empty'))}</p>`}</div><button type="button" class="nggoogle-fab" data-action="nggoogle-reminder-add" aria-label="${esc(c,t('reminders_accessibility_add_reminder'))}">${icon('add')}</button>${drawer(c)}</div>`;
  }
  function render(c) {
    const u=U(c);if(c.ui.sub==='voice'){u.mode='voice';u.tab='websearch';c.ui.sub='';}else if(c.ui.sub.startsWith('q:')){u.q=remember(c,c.ui.sub.slice(2));u.mode='results';u.tab='websearch';c.ui.sub='';}
    if(u.mode==='voice')return voice(c);if(u.mode==='results')return results(c);if(u.mode==='reminders')return reminders(c);
    if(u.mode==='edit')return `<div class="nggoogle">${plate(c,true)}<div class="nggoogle-suggestions">${suggestions(c)}</div></div>`;
    return nowPage(c);
  }
  function search(c,q) {
    const u=U(c);
    if(u.voiceReturn){finishVoice(c,q);return;}
    const text=remember(c,q);if(!text)return;Object.assign(u,{q:text,mode:'results',focus:false,drawer:false});NG.ime?.hide();c.render();
  }
  function mount(c,root) {
    const f=root.querySelector('.nggoogle-query');if(f){f.addEventListener('input',()=>{U(c).q=f.value;root.querySelector('.nggoogle-suggestions').innerHTML=suggestions(c);const b=root.querySelector('.nggoogle-plate>.nggoogle-icon:last-child');b.dataset.action='nggoogle-'+(f.value?'clear':'voice');b.innerHTML=icon(f.value?'clear':'mic');});if(U(c).focus){U(c).focus=false;f.focus();try{f.setSelectionRange(f.value.length,f.value.length);}catch{}}}
    for(const row of root.querySelectorAll('.nggoogle-suggestion[data-history]'))if(row.dataset.history){let timer;row.addEventListener('pointerdown',()=>{timer=setTimeout(()=>{U(c).heldAt=Date.now();c.dialog({title:row.dataset.history,items:[{label:t('remove_from_history')}],onItem(){S(c).history=S(c).history.filter(q=>q!==row.dataset.history);c.save();c.render();}});},500);});for(const e of ['pointerup','pointercancel','pointerleave'])row.addEventListener(e,()=>clearTimeout(timer));}
    for(const card of root.querySelectorAll('.nggoogle-feed .nggoogle-card'))card.addEventListener('pointerdown',e=>{
      if(e.button||e.target.closest('.nggoogle-icon'))return;
      const x=e.clientX,y=e.clientY;let direction='';
      const move=ev=>{const dx=ev.clientX-x,dy=ev.clientY-y;if(!direction&&Math.hypot(dx,dy)>10)direction=Math.abs(dx)>Math.abs(dy)?'x':'y';if(direction==='x'){ev.preventDefault();card.style.translate=`${dx}px 0`;card.style.opacity=String(1-Math.min(.8,Math.abs(dx)/card.clientWidth));}};
      const end=ev=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end);window.removeEventListener('pointercancel',cancel);if(direction==='x'&&Math.abs(ev.clientX-x)>card.clientWidth*.4){U(c).swipedAt=Date.now();S(c).dismissed.push(card.dataset.card);c.save();c.render();}else{card.style.translate='';card.style.opacity='';}};
      const cancel=()=>{direction='y';end({clientX:x});};
      window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',end,{once:true});window.addEventListener('pointercancel',cancel,{once:true});
    });
  }
  function action(name,el,event,c) {
    if(!name.startsWith('nggoogle-'))return false;
    const u=U(c),s=S(c),id=el.dataset.id;
    if(u.swipedAt&&Date.now()-u.swipedAt<700){u.swipedAt=0;return true;}
    if(u.heldAt&&Date.now()-u.heldAt<900){u.heldAt=0;return true;}
    switch(name.slice(9)) {
      case 'drawer':u.drawer=!u.drawer;c.render();break;
      case 'edit':u.mode='edit';u.focus=true;c.render();break;
      case 'back':if(u.voiceReturn){finishVoice(c);}else if(u.mode==='edit'&&u.q){u.mode='results';NG.ime?.hide();c.render();}else{u.mode='feed';NG.ime?.hide();c.render();}break;
      case 'clear':u.q='';u.mode='edit';u.focus=true;c.render();break;
      case 'voice':NG.ime?.hide();u.mode='voice';c.render();break;
      case 'query':search(c,el.dataset.q);break;
      case 'refine':u.q=el.dataset.q;u.focus=true;c.render();break;
      case 'app':c.open(id);break;
      case 'contact':c.open('contacts','contact:'+id);break;
      case 'url':c.open('chrome','url:'+el.dataset.url);break;
      case 'photo':c.open('photos','photo:'+id);break;
      case 'calendar':c.open('calendar');break;
      case 'feed':u.drawer=false;u.mode='feed';c.render();break;
      case 'feedtab':u.feedTab=el.dataset.tab;c.render();break;
      case 'tab':if(el.dataset.tab==='intent_maps')c.open('maps','q:'+u.q);else{u.tab=el.dataset.tab;c.render();}break;
      case 'weather':u.q=remember(c,'weather Riverside');u.mode='results';c.render();break;
      case 'units':s.units=s.units==='f'?'c':'f';c.save();c.render();break;
      case 'card-menu':c.menu([{label:t('assist_layer_dismiss'),action:c=>{s.dismissed.push(id);c.save();c.render();}},{label:t('customize'),action:c=>customize(c)}],el);break;
      case 'customize':u.drawer=false;customize(c);break;
      case 'settings':u.drawer=false;NG.openPrefs(c,'google','preferences_headers',t('settings'));break;
      case 'reminders':u.mode='reminders';u.drawer=false;c.render();break;
      case 'remindertab':u.reminderTab=el.dataset.tab;c.render();break;
      case 'reminder-add':reminderEditor(c);break;
      case 'reminder-edit':reminderEditor(c,id);break;
      case 'reminder-toggle':{const e=events(c).find(e=>e.task&&e.id===+id);if(e){e.done=!e.done;c.save();c.render();}break;}
      case 'help':c.open('help','google');break;
      default:return false;
    }
    return true;
  }
  function customize(c) {c.dialog({title:t('customize'),items:[{label:t('now_cards')},{label:t('weather_title')},{label:t('assistant_settings_personal_info_weather_celsius')},{label:t('assistant_settings_personal_info_weather_fahrenheit')}],onItem:i=>{if(i===0)S(c).feed=S(c).feed===false;else if(i===1)S(c).dismissed=S(c).dismissed.filter(id=>id!=='weather');else S(c).units=i===2?'c':'f';c.save();c.render();}});}
  const prefLabel=(ctx,node)=>NG.appPrefStr(node.title);
  NG.appPrefsHooks.google={
    hide(ctx,key,node){return /header_category_dogfood/.test(node.title||'')||node.fragment?.endsWith('InternalAPICardsSettingsFragment');},
    fragment(ctx,name,node){const short=name.split('.').at(-1);return {
      PrivacyAndAccountFragment:'privacy_and_account_preferences',SearchLanguageSettingsFragment:'languages',DataSaverSettingsFragment:'data-saver',
      VoiceSettingsFragment:'voicesearch_preferences',SearchableItemsFragment:/ipa_search_sources/.test(node.title||'')?'in-apps':'phone-search',
      BackgroundRetrySettingsFragment:'background_retry_settings',NowCardsSettingsFragment:'now_cards_settings',ScreenAssistSettingsFragment:'screen_assist_settings',
      TopdeckSettingsFragment:'topdeck_preferences',SuggestSettingsFragment:'suggest_preferences',AboutFragment:'about'
    }[short];},
    title(ctx,key,node){return {enableScreenAssistPreference:t('enable_screen_assist_title'),donateScreenshotPreference:t('donate_screenshot_title'),npStreamPreference:t('np_stream')}[key];},
    get(ctx,key){if(key==='pref_show_predictions')return ctx.data.launcherPredictions!==false;if(key==='pref_allowRotation')return !!ctx.data.launcherRotation;if(key==='showCardsPreference')return S(ctx).feed!==false;if(key==='enableScreenAssistPreference')return !!S(ctx).assistOptIn;},
    set(ctx,key,v){if(key==='pref_show_predictions'){ctx.data.launcherPredictions=v;return true;}if(key==='pref_allowRotation'){ctx.data.launcherRotation=v;return true;}if(key==='showCardsPreference'){S(ctx).feed=v;return true;}if(key==='enableScreenAssistPreference'){S(ctx).assistOptIn=v;return true;}return false;},
    enabled(ctx,key){if(['enableScreenAssistPreference','donateScreenshotPreference','manageCardHistoryPreference'].includes(key))return true;},
    summary(ctx,key){if(key==='google_account')return NG.account?.email||'';if(key==='manageCardHistoryPreference')return '';return {enableScreenAssistPreference:t('enable_screen_assist_summary_now_emphasis'),donateScreenshotPreference:t('donate_screenshot_summary'),npStreamPreference:t('np_stream_summary')}[key];},
    click(ctx,key,node){
      if(key==='google_account'){ctx.open('settings','accounts');return true;}
      if(key==='hotword'){NG.appPrefsGo(ctx,'hotword_settings',prefLabel(ctx,node));return true;}
      if(key==='handsFree'){NG.appPrefsGo(ctx,'hands_free_settings',prefLabel(ctx,node));return true;}
      if(key==='language'){NG.appPrefsGo(ctx,'languages',prefLabel(ctx,node));return true;}
      if(key==='manageCardHistoryPreference'||key==='google_account_history'||key==='Manage searches'){NG.appPrefsGo(ctx,'history',prefLabel(ctx,node));return true;}
      if(key==='deleteCardPreferencesPreference'){ctx.dialog({title:prefLabel(ctx,node),buttons:[{label:t('cancel')},{label:t('delete'),action:ctx=>{S(ctx).dismissed=[];ctx.save();ctx.render();}}]});return true;}
      if(node.t==='NotificationGroupPreference'){NG.setAppPref(ctx,'google',key,!NG.appPref(ctx,'google',key,true));ctx.render();return true;}
      return false;
    },
    customs:{
      languages:{render(ctx){const selected=NG.appPref(ctx,'google','language',ctx.lang);return ['en','hu','de','fr','es'].map(l=>NG.settingsRow(ctx,{title:new Intl.DisplayNames([ctx.locale()],{type:'language'}).of(l),action:'nggoogle-language',data:` data-lang="${l}"`,widget:`<i class="ngw-radio ngst-radio${l===selected?' on':''}"></i>`})).join('');},action(ctx,name,el){if(name!=='nggoogle-language')return false;NG.setAppPref(ctx,'google','language',el.dataset.lang);ctx.render();return true;}},
      'phone-search':{render(ctx){return ['contacts','search'].map(id=>NG.settingsRow(ctx,{title:id==='contacts'?NG.appLabel(ctx,'contacts'):t('corpus_name_websearch_apps'),action:'nggoogle-source',data:` data-source="${id}"`,widget:NG.settingsSwitch(NG.appPref(ctx,'google','source_'+id,true))})).join('');},action(ctx,name,el){if(name!=='nggoogle-source')return false;const key='source_'+el.dataset.source;NG.setAppPref(ctx,'google',key,!NG.appPref(ctx,'google',key,true));ctx.render();return true;}},
      'in-apps':{render(ctx){return ['gmail','calendar','messenger','contacts'].map(id=>NG.settingsRow(ctx,{title:NG.appLabel(ctx,id),action:'nggoogle-source',data:` data-source="${id}"`,widget:NG.settingsSwitch(NG.appPref(ctx,'google','source_'+id,true))})).join('');},action(ctx,name,el){return NG.appPrefsHooks.google.customs['phone-search'].action(ctx,name,el);}},
      'data-saver':{render(ctx){return NG.settingsRow(ctx,{title:NG.text('appprefs').t('Velvet/data_saver_settings_title'),action:'nggoogle-data-saver',widget:NG.settingsSwitch(NG.appPref(ctx,'google','data_saver',false))});},action(ctx,name){if(name!=='nggoogle-data-saver')return false;NG.setAppPref(ctx,'google','data_saver',!NG.appPref(ctx,'google','data_saver',false));ctx.render();return true;}},
      history:{render(ctx){return S(ctx).history.map(q=>NG.settingsRow(ctx,{title:q,action:'nggoogle-history-remove',data:` data-q="${esc(ctx,q)}"`})).join('');},action(ctx,name,el){if(name!=='nggoogle-history-remove')return false;ctx.dialog({title:el.dataset.q,items:[{label:t('remove_from_history')}],onItem(){S(ctx).history=S(ctx).history.filter(q=>q!==el.dataset.q);ctx.save();ctx.render();}});return true;}},
      about:{render(ctx){return NG.settingsRow(ctx,{title:'Google',summary:'6.5.36.21.arm64'})+NG.settingsRow(ctx,{title:NG.text('appprefs').t('Velvet/about'),action:'nggoogle-legal'});},action(ctx,name){if(name!=='nggoogle-legal')return false;NG.appPrefsGo(ctx,'legal_settings',t('about'));return true;}}
    }
  };
  function finishVoice(c,text) {
    const u=U(c),deliver=u.voiceReturn,same=u.voiceSame,prior=u.voicePrior;
    u.voiceReturn=null;u.voiceSame=false;u.mode='feed';
    if(same){Object.assign(u,prior);c.render();}else c.back();
    if(text)deliver?.(c,text);
  }
  const back=c=>{const u=U(c);if(u.voiceReturn){finishVoice(c);return true;}if(u.drawer){u.drawer=false;c.render();return true;}if(u.mode!=='feed'){u.mode='feed';u.q='';c.render();return true;}return false;};
  NG.google={nowPage,action,mount,back,nextEvent};
  NG.googleOpen=(c,voiceMode=false)=>{Object.assign(U(c),{mode:voiceMode?'voice':'edit',focus:!voiceMode,q:'',drawer:false,tab:'websearch'});c.open('search');};
  NG.googleVoiceInput=(c,deliver)=>{
    const u=U(c);u.voiceReturn=deliver;u.voiceSame=c.ui.view==='search';u.voicePrior={mode:u.mode,q:u.q,tab:u.tab,focus:true};
    if(u.voiceSame){u.mode='voice';c.render();}else c.open('search','voice');
  };
  NG.register('search',{render,mount,action,back,statusColor:()=> '#b6b6b6',submit(form,e,c){if(form.dataset.form!=='nggoogle-query')return false;search(c,form.elements.q.value);return true;},unmount(c){const u=U(c);if(u.voiceReturn){u.voiceReturn=null;u.mode=u.voiceSame?u.voicePrior?.mode||'feed':'feed';u.voiceSame=false;u.focus=false;}}});
  NG.register('now',{render:nowPage,mount,action,back,statusColor:()=> '#b6b6b6'});
  NG.register('home-settings',{...NG.module('app-prefs'),render(c){
    if(c.ui.appPrefs?.stack?.[0]?.xml!=='preferences_launcher')c.ui.appPrefs={stack:[{app:'google',xml:'preferences_launcher',path:[],title:t('settings')}]};
    return NG.module('app-prefs').render(c);
  }});
  function assistContext(c) {
    const selected=window.getSelection(), selectedText=selected?.anchorNode&&c.el.viewport.contains(selected.anchorNode)?selected.toString().trim():'';
    return (selectedText||c.el.viewport.querySelector('.ngcr-page h1,.nggm-body h1,h1,h2')?.textContent||NG.appLabel?.(c,c.ui.view)||'Android Nougat').trim().slice(0,160);
  }
  NG.register('assist',{
    app:false,
    show(c){NG.ime?.hide();U(c).assistQuery=assistContext(c);c.overlay('assist');},
    render(c){
      const accepted=S(c).assistOptIn, q=U(c).assistQuery;
      return `<div class="nggoogle-assist"><div class="nggoogle-assist-dim" data-action="nggoogleassist-close"></div><section class="nggoogle-assist-panel"><img class="nggoogle-assist-g" src="${A('g')}" alt="Google">
      ${!accepted?`<h2>${esc(c,t('assist_optin_title'))}</h2><p>${esc(c,t('assist_optin_body'))}</p><button type="button" class="nggoogle-assist-learn" data-action="nggoogleassist-learn">${esc(c,t('assist_optin_learn_more_text'))}</button><div class="nggoogle-assist-buttons"><button type="button" data-action="nggoogleassist-close">${esc(c,t('assist_optin_decline'))}</button><button type="button" class="accept" data-action="nggoogleassist-accept">${esc(c,t('assist_optin_accept'))}</button></div>`:
      `<h2>${esc(c,q||t('screen_assist_nothing_on_tap'))}</h2><button type="button" class="nggoogle-assist-result" data-action="nggoogleassist-search">${icon('search')}<span>${esc(c,t('accessibility_google_search_button'))}</span></button><button type="button" class="nggoogle-assist-result" data-action="nggoogleassist-now">${icon('g')}<span>${esc(c,t('screen_assist_now_stream_text'))}</span></button>`}</section></div>`;
    },
    action(name,el,e,c){if(!name.startsWith('nggoogleassist-'))return false;const kind=name.slice(15);if(kind==='close')c.closeOverlay();else if(kind==='accept'){S(c).assistOptIn=true;NG.setAppPref(c,'google','enableScreenAssistPreference',true);c.save();c.overlay('assist');}else if(kind==='now'){c.closeOverlay();U(c).mode='feed';c.open('search');}else if(kind==='search'){const q=U(c).assistQuery;c.closeOverlay();c.open('search','q:'+q);}else if(kind==='learn'){c.closeOverlay();c.open('help','screen-search');}return true;},
    back(c){c.closeOverlay();return true;}
  });
})();
