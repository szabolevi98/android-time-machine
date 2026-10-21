/* N2G48C Launcher3 WidgetsContainerView / widget_cell. The complete enabled provider
   catalogue and each provider's previews/minimum sizes come from ng-launcher-data.js.
   Provider implementations are explicit: unbuilt providers retain a visible not-built label. */
(() => {
  'use strict';
  const old=NG.widgets, providers=()=>NG.widgetProviders||[], label=(c,w)=>w.label?.[c.lang]||w.label?.en||w.id;
  const known=id=>id==='digital'||id==='analog'||id==='search-search_widget_info'||id==='search-predictive_cards_widget_info';
  function search(c){return `<div class="ngwc-search np-gel-search_bg"><button type="button" data-action="ngwg-search"><img src="assets/gel-ic_searchbox_google.png" alt="Google"></button><button type="button" data-action="ngwg-voice" aria-label="${c.safe(NG.text('launcher').t('accessibility_voice_search_button'))}"><img src="assets/gel-ic_mic.png" alt=""></button></div>`;}
  function analog(c){const now=new Date(),h=(now.getHours()%12)*30+now.getMinutes()/2,m=now.getMinutes()*6;return `<button type="button" class="ngwc-analog" data-action="ngwg-open" data-app="clock"><img src="assets/wid-clock-dial.png" alt=""><img class="hour" src="assets/wid-clock-hour.png" alt="" style="transform:rotate(${h}deg)"><img class="minute" src="assets/wid-clock-minute.png" alt="" style="transform:rotate(${m}deg)"></button>`;}
  function now(c){const e=NG.google.nextEvent(c),temp=c.data.google?.units==='f'?'64°':'18°';return `<div class="ngwc-now np-wid-now-frame"><button type="button" data-action="ngwg-now"><span>Riverside</span><div><img src="assets/gg-weather.png" alt=""><b>${temp}</b><small>${c.safe(NG.text('google').t('weather_conditions'))}</small></div></button>${e?`<button type="button" data-action="ngwg-open" data-app="calendar"><b>${c.safe(e.title)}</b><small>${c.safe(e.date)} ${c.safe(e.start||'')}</small></button>`:''}</div>`;}
  NG.widgets={
    ...old,
    info:id=>providers().find(w=>w.id===id)||old.info(id),
    implemented:known,
    home(c,it){
      if(it.w==='digital')return old.home(c,it);if(it.w==='analog')return analog(c);if(it.w==='search-search_widget_info')return search(c);if(it.w==='search-predictive_cards_widget_info')return now(c);
      const p=providers().find(w=>w.id===it.w);return p?`<button type="button" class="ngwc-pending" data-action="ngwg-open" data-app="${p.app}"><img src="${c.safe(p.preview||NG.appsData[p.app]?.icon||'')}" alt=""><b>${c.safe(label(c,p))}</b><span>${c.safe(c.t('Not built yet'))}</span></button>`:'';
    },
    action(name,el,e,c){if(name==='ngwg-search'){NG.googleOpen(c,false);return true;}if(name==='ngwg-voice'){NG.googleOpen(c,true);return true;}if(name==='ngwg-now'){c.open('now');return true;}return old.action(name,el,e,c);}
  };
  NG.register('widgets',{
    app:false,statusColor:()=> 'transparent',
    render(c){
      const groups=new Map();for(const w of providers()){if(NG.appDisabled(c,w.app))continue;if(!groups.has(w.app))groups.set(w.app,[]);groups.get(w.app).push(w);}
      return `<div class="ngwc"><div class="ngwc-panel">${[...groups].sort((a,b)=>NG.appLabel(c,a[0]).localeCompare(NG.appLabel(c,b[0]),c.locale())).map(([app,rows])=>`<section class="ngwc-section"><h2><img src="${c.safe(NG.appsData[app]?.icon||'')}" alt=""><span>${c.safe(NG.appLabel(c,app))}</span></h2><div class="ngwc-row">${rows.map(w=>`<button type="button" class="ngwc-cell" data-action="ngwc-cell" data-widget="${w.id}"><span class="ngwc-cell-label"><b>${c.safe(label(c,w))}</b><small>${w.spanX} × ${w.spanY}</small></span><span class="ngwc-preview"><img src="${c.safe(w.preview||NG.appsData[app]?.icon||'')}" alt=""></span></button>`).join('')}</div></section>`).join('')}</div></div>`;
    },
    mount(c,root){for(const cell of root.querySelectorAll('.ngwc-cell'))cell.addEventListener('pointerdown',e=>{
      if(e.button)return;const x=e.clientX,y=e.clientY;let timer;
      const off=()=>{clearTimeout(timer);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',off);window.removeEventListener('pointercancel',off);};
      const move=e=>{if(Math.hypot(e.clientX-x,e.clientY-y)>10)off();};
      timer=setTimeout(()=>{off();c.ui.widgetHeldAt=Date.now();const w=NG.widgets.info(cell.dataset.widget);NG.launcherDragNew(c,{type:'widget',w:w.id,spanX:w.spanX,spanY:w.spanY},x,y);},500);
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',off,{once:true});window.addEventListener('pointercancel',off,{once:true});
    });},
    action(name,el,e,c){if(name!=='ngwc-cell')return false;if(Date.now()-(c.ui.widgetHeldAt||0)>700)c.toast(NG.text('launcher').t('long_press_widget_to_add'));return true;}
  });
  let minute=-1;
  NG.register('widgets-catalogue', {app:false,tick(c,now){if(minute===now.getMinutes()||c.ui.view!=='home')return;minute=now.getMinutes();for(const el of c.el.viewport.querySelectorAll('.ngh-widget[data-w="analog"],.ngh-widget[data-w="search-predictive_cards_widget_info"]'))el.innerHTML=NG.widgets.home(c,{w:el.dataset.w});}});
})();
