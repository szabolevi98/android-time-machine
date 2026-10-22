/* MusicSettingsActivity's XML plus its installed runtime rows. Wear-only and
   developer rows stay hidden on the stock production phone without Wear. */
(() => {
  'use strict';
  const T=()=>NG.text('music'),t=k=>T().t(k),S=c=>NG.musicModel.state(c),P=(c,k,d)=>NG.appPref(c,'music',k,d);
  const rows=NG.appPrefsXml.music.xml.music_settings.c.flatMap(n=>n.c||[]);
  for(const key of ['notification_settings_key','headphone_notification_settings_key','cache_streamed_key','offlinedl_on_wifi_key','autocache_key']){const n=rows.find(n=>n.key===key);if(n)n.defaultValue='true';}
  function sleep(c){let hours=0,minutes=30;const left=S(c).sleepAt?Math.max(0,Math.ceil((S(c).sleepAt-Date.now())/60000)):0;c.dialog({title:t('sleep_timer_settings_title'),message:left?T().fmt('sleep_timer_time_left',null,Math.floor(left/60),left%60):t('sleep_timer_default_summary'),html:`<div class="ngmu-sleep"><label>${c.safe(t('sleep_timer_spinner_hour'))}<input type="number" min="0" max="23" value="0" data-sleep="hours"></label><label>${c.safe(t('sleep_timer_spinner_minute'))}<input type="number" min="0" max="59" value="30" data-sleep="minutes"></label></div>`,mount(c,win){const ok=win.querySelector('[data-index="1"]'),change=()=>{hours=+win.querySelector('[data-sleep="hours"]').value;minutes=+win.querySelector('[data-sleep="minutes"]').value;ok.disabled=!Number.isInteger(hours)||!Number.isInteger(minutes)||hours<0||hours>23||minutes<0||minutes>59||hours+minutes===0;};win.querySelectorAll('input').forEach(el=>el.addEventListener('input',change));change();},buttons:[{label:t(left?'sleep_timer_dialog_cancel_timer':'framework/cancel'),action:c=>{if(left){delete S(c).sleepAt;c.save();c.render();}}},{label:t('sleep_timer_dialog_start'),action:c=>{S(c).sleepAt=Date.now()+(hours*60+minutes)*60000;c.save();c.render();}}]});}
  NG.appPrefsHooks.music={
    hidden:['manage_family_settings_key','manage_nautilus_settings_key','pb_opt_out_key','settings_catergory_wear_key','debug_logs_key','music_one_push_key','music_build_info_key','apiary_endpoints_key','music_pa_endpoints_key','streamauth_endpoints_key','cast_app_id_selection_key','playback_service_key','player_key','api_stack','features'],
    title(c,key){if(key==='account_settings_key')return NG.account.email;if(key==='music_version_key')return NG.appsData['play-music'].version;},
    enabled(c,key){if(key==='music_version_key')return false;},
    summary(c,key){if(key==='stream_quality_key')return t('stream_quality_'+P(c,key,'normal'));if(key==='sleep_timer_settings_key'&&S(c).sleepAt){const left=Math.max(0,Math.ceil((S(c).sleepAt-Date.now())/60000));return T().fmt('sleep_timer_time_left',null,Math.floor(left/60),left%60);}},
    click(c,key,n){
      if(key==='account_settings_key'){c.dialog({title:t('launcher_name'),items:[{html:c.safe(NG.account.email)}],onItem:()=>{}});return true;}
      if(key==='manage_fop_key'){Object.assign(NG.playUI.state(c),{route:'account',accountTab:'payment_methods',stack:[]});c.open('play-store');return true;}
      if(key==='refresh_key'){c.save();c.toast(t('no_music_scanning_heading'));return true;}
      if(key==='sleep_timer_settings_key'){sleep(c);return true;}
      if(key==='stream_quality_key'){const values=['low','normal','high'];NG.appPrefsChoose(c,NG.appPrefStr(n.title),values.map(v=>t('stream_quality_'+v)),values.indexOf(P(c,key,'normal')),(c,i)=>{NG.setAppPref(c,'music',key,values[i]);c.render();},'#ef6c00');return true;}
      if(key==='clear_cache_settings_key'){c.dialog({title:NG.appPrefStr(n.title),buttons:[{label:t('framework/cancel')},{label:t('clear_cache_button'),action:c=>{S(c).cached=[];c.save();c.render();}}]});return true;}
      if(key==='download_location_key'){NG.appPrefsChoose(c,NG.appPrefStr(n.title),[NG.text('settings').t('storage_type_internal')],0,(c)=>c.render(),'#ef6c00');return true;}
      if(key==='download_queue_key'){NG.musicUI.go(c,'downloads');c.open('play-music');return true;}
      if(key==='my_devices_setting_key'){NG.appPrefsGo(c,'music-devices',NG.appPrefStr(n.title));return true;}
      if(key==='licenses'){Object.assign(NG.musicUI.state(c),{route:'licenses',query:null,scope:null,pid:''});c.open('play-music');return true;}
      if(key==='lmark_licenses'){NG.appPrefsGo(c,'music-other-licenses',t('other_license_title'));return true;}
      if(key==='equalizer_settings_key'){c.open('musicfx','com.google.android.music');return true;}
      if(key==='gift_subscription_setting_key'){NG.musicUI.go(c,'gift');c.open('play-music');return true;}
      return false;
    },
    customs:{'music-devices':{render:c=>`<div class="ngmu-empty">${c.safe(t('empty_screen_manage_devices_text'))}</div>`},'music-other-licenses':{render:c=>`<div class="ngmu-empty">${c.safe(t('other_license_a11y_text'))}</div>`}}
  };
  NG.musicSleep=sleep;
})();
