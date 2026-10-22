/* Tycho DataUsageWidgetProvider's no-account layouts and Velvet's
   soundsearch_intent_widget / intent_api_soundsearch. The demo account has no Fi service. */
(() => {
  'use strict';
  const T=()=>NG.text('appwidgets'),E=(c,s)=>c.safe(s);
  function fi(c,it){const g=NG.launcherGrid,size=Math.max(1,Math.min((it.spanX||2)*g.cellW/3.5-16,(it.spanY||2)*g.cellH/3.5-16)),small=size<133,scale=size/133;
    return `<button type="button" class="ngfiwg${small?' small':''}" data-action="ngsvw-fi" style="--fi-size:${size};--fi-scale:${scale}" aria-label="${E(c,NG.appLabel(c,'project-fi')+', '+T().t('Tycho/sign_in'))}"><span class="ngfiwg-circle">${small?'':'<img class="ngfiwg-bg" src="assets/fi-widget-background.svg" alt="">'}<img class="ngfiwg-logo" src="assets/fi-logo.svg" alt=""><span>${E(c,T().t('Tycho/sign_in'))}</span></span></button>`;}
  function sound(c){return `<button type="button" class="ngsound-widget" data-action="ngsvw-sound" aria-label="${E(c,T().t('Velvet/soundsearch_widget_name'))}"><img src="assets/sw-sound-normal.png" alt=""><img class="pressed" src="assets/sw-sound-pressed.png" alt=""></button>`;}
  function start(c){c.ui.soundSearch={token:Date.now(),error:false,queued:false};}
  const action=(name,el,e,c)=>{if(name==='ngsvw-fi'){c.open('project-fi');return true;}if(name==='ngsvw-sound'){start(c);c.open('sound-search');return true;}return false;};
  (NG.widgetViews ||= {})['project-fi-widget_data_usage']={render:fi,action};NG.widgetViews['search-soundsearch_intent_appwidget']={render:sound,action};
  NG.register('sound-search',{app:false,statusColor:()=> '#b6b6b6',keepAwake:c=>!c.ui.soundSearch?.error,
    render(c){const u=c.ui.soundSearch;if(!u)start(c);return `<div class="ngsound np-sw-ime"><button type="button" class="ngsound-recognizer" data-action="ngsound-retry" aria-label="${E(c,T().t('Velvet/content_description_none'))}"><span><img src="assets/sw-music-note.png" alt=""></span></button><p>${E(c,T().t(c.ui.soundSearch.error?'Velvet/message_no_sound_search_results_tts':'Velvet/listening_for_music_status'))}</p><div class="ngsound-wave" aria-hidden="true"><i></i></div></div>`;},
    unmount(c){delete c.ui.soundSearch;},
    mount(c){const u=c.ui.soundSearch;if(u.queued)return;u.queued=true;const token=u.token;NG.appTasks.later(c,'search',()=>{if(c.ui.view!=='sound-search'||c.ui.soundSearch?.token!==token)return;c.ui.soundSearch.error=true;c.render();},4500);},
    action(name,el,e,c){if(name!=='ngsound-retry')return false;start(c);c.render();return true;}
  });
})();
