/* SettingsActivity installs choice values/defaults for Phonesky's custom list
   preferences. The XML supplies all categories, labels and checkbox rows. */
(() => {
  'use strict';
  const T=()=>NG.text('play'),t=k=>T().t(k),S=c=>NG.playModel.state(c),p=(c,k,d)=>NG.appPref(c,'play',k,d);
  const rows=NG.appPrefsXml.play.xml.settings.c.flatMap(n=>n.c||[]),find=k=>rows.find(n=>n.key===k);
  for(const [key,keys,values,def] of [
    ['auto-update-mode',['auto_update_value_disabled','auto_update_value_enabled','auto_update_value_wifi_only'],['off','always','wifi'],'off'],
    ['download-mode',['download_settings_value_download_always','download_settings_value_ask','download_settings_value_wifi_only'],['always','ask','wifi'],'always']
  ])Object.assign(find(key),{entries:keys.map(k=>t(k)),entryValues:values,defaultValue:def});
  // Resolve choice strings when the page is drawn, including after language changes.
  find('auto-update-mode').entries=['auto_update_value_disabled','auto_update_value_enabled','auto_update_value_wifi_only'].map(k=>'string/Phonesky/'+k);
  find('download-mode').entries=['download_settings_value_download_always','download_settings_value_ask','download_settings_value_wifi_only'].map(k=>t(k));
  for(const key of ['auto-add-shortcuts','update-notifications','update-completion-notifications','gmail-itineraries'])find(key).defaultValue='true';
  function choose(c,key,title,keys,values,def){const v=p(c,key,def);NG.appPrefsChoose(c,title,keys.map(t),values.indexOf(v),(c,i)=>{NG.setAppPref(c,'play',key,values[i]);c.render();},'#009688');}
  function pin(c,title,done){let value='';c.dialog({title:t(title),html:`<div class="ngst-edit"><input type="password" inputmode="numeric" maxlength="8" class="ngst-input" placeholder="${c.safe(t('pin_hint'))}" autocomplete="off"></div>`,mount(c,win){const ok=win.querySelector('[data-index="1"]');ok.disabled=true;win.querySelector('input').addEventListener('input',e=>{value=e.target.value.replace(/\D/g,'');e.target.value=value;ok.disabled=value.length<4;});},buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>done(c,value)}]});}
  function createPin(c){pin(c,'pin_setup_label',(c,value)=>pin(c,'pin_confirm_label',(c,confirmed)=>{if(value!==confirmed){c.toast(t('pin_entry_hint_wrong_passcode'));return;}S(c).contentPin=value;S(c).contentEnabled=true;c.save();c.render();}));}
  function parental(c){if(S(c).contentEnabled)pin(c,'pin_entry_label',(c,value)=>{if(value!==S(c).contentPin){c.toast(t('pin_entry_hint_wrong_passcode'));return;}NG.appPrefsGo(c,'play-parental',t('content_filtering_label'));});else NG.appPrefsGo(c,'play-parental',t('content_filtering_label'));}
  const levels=['content_filter_everyone','content_filter_low_maturity','content_filter_medium_maturity','content_filter_high_maturity','content_filter_show_all_apps'];
  NG.appPrefsHooks.play={
    summary(c,key){if(key==='build-version')return NG.appsData['play-store'].version;if(key==='certification-status')return t('certification_status_certified');if(key==='purchase-auth')return t(p(c,key,'always')==='always'?'purchase_auth_value_always':p(c,key,'always')==='session'?'purchase_auth_value_session':'purchase_auth_value_never');if(key==='download-mode')return t(p(c,key,'always')==='wifi'?'download_settings_value_wifi_only':p(c,key,'always')==='ask'?'download_settings_value_ask':'download_settings_value_download_always');if(key==='auto-update-mode')return t(p(c,key,'off')==='off'?'auto_update_value_disabled':p(c,key,'off')==='wifi'?'auto_update_value_wifi_only':'auto_update_value_enabled');},
    enabled(c,key){if(key==='certification-status')return false;},
    click(c,key,n){
      if(key==='auto-update-mode'){choose(c,key,NG.appPrefStr(n.title),['auto_update_value_disabled','auto_update_value_enabled','auto_update_value_wifi_only'],['off','always','wifi'],'off');return true;}
      if(key==='download-mode'){choose(c,key,NG.appPrefStr(n.title),['download_settings_value_download_always','download_settings_value_ask','download_settings_value_wifi_only'],['always','ask','wifi'],'always');return true;}
      if(key==='purchase-auth'){choose(c,key,NG.appPrefStr(n.title),['purchase_auth_value_always','purchase_auth_value_session','purchase_auth_value_never'],['always','session','never'],'always');return true;}
      if(key==='clear-history'){S(c).searches=[];c.save();c.render();return true;}
      if(key==='content-level'){parental(c);return true;}
      if(key==='os-licenses'){NG.playUI.state(c).route='licenses';c.open('play-store');return true;}
      if(key==='build-version'){c.toast(t('up_to_date'));return true;}
      return false;
    },
    customs:{'play-parental':{
      render(c){const s=S(c);return NG.settingsRow(c,{title:t('content_filtering_label'),summary:t(s.contentEnabled?'enable_content_filters':'disable_content_filters'),widget:NG.settingsSwitch(!!s.contentEnabled),action:'ngpsp-content'})+(s.contentEnabled?NG.settingsCat(c,t('content_filtering_apps_and_content_description'))+NG.settingsRow(c,{title:t('menu_home_v2'),summary:t(levels[s.contentLevel??4]),action:'ngpsp-level'}):'');},
      action(c,name){if(name==='ngpsp-content'){if(S(c).contentEnabled){S(c).contentEnabled=false;c.save();c.render();}else createPin(c);return true;}if(name==='ngpsp-level'){NG.appPrefsChoose(c,t('content_filter_title'),levels.map(t),S(c).contentLevel??4,(c,i)=>{S(c).contentLevel=i;c.save();c.render();});return true;}return false;}
    }}
  };
})();
