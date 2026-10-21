/* Google settings of PrebuiltGmsCore 9.8 (GoogleSettingsActivity, the Settings dashboard's Google tile), drawn as Settings
   pages (NG.settingsScreens) in preference_material rows: Account (Sign-in & security, Personal info & privacy, Account
   preferences: myaccount.google.com in Chrome) and Services: Ads (the advertising ID, its reset, Opt out of Ads
   Personalization), Connected apps (none for the demo account), Data management (Drive-enabled app files), Location
   (Google location settings with Access location, Google Location History and Location Sharing), Nearby, Play Games,
   Search & Now, Security (Android Device Manager, Verify apps), Set up nearby device and Smart Lock for Passwords. Google
   Fit is not on the image, so its row stays out. Values are kept in c.data.gms. */
(() => {
  'use strict';
  const T=()=>NG.text('gms'),t=k=>T().t(k),f=(k,...a)=>T().fmt(k,null,...a);
  const S=c=>c.data.gms ||= {adid:'',adsOptOut:false,drive:'wifi',access:true,history:false,nearby:true,locate:true,wipe:true,verify:true,smartlock:true,autoSignin:true,neverSave:[]};
  const adid=c=>{const s=S(c);if(!s.adid){const h=()=>Math.floor(Math.random()*16).toString(16);s.adid=[8,4,4,4,12].map(n=>Array.from({length:n},h).join('')).join('-');c.save();}return s.adid;};
  const row=(c,r)=>({html:NG.settingsRow(c,r),sel:true});
  const sw=(c,key,title,summary,disabled)=>row(c,{title,summary,widget:NG.settingsSwitch(!!S(c)[key],disabled),action:'ngms-toggle',data:` data-k="${key}"`,disabled});
  const go=(c,screen,key)=>row(c,{title:t(key),action:'ngms-go',data:` data-to="${screen}" data-t="${key}"`});
  const list=items=>`<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
  const cat=(c,key)=>({html:NG.settingsCat(c,t(key)),sel:false});
  const web=(c,url)=>c.open('chrome','url:'+url);
  const screens={
    gms:{render:c=>list([cat(c,'common_google_settings_account'),
      row(c,{title:t('accountsettings_security_settings_menu_title'),summary:t('accountsettings_security_settings_menu_subtitle'),action:'ngms-web',data:' data-url="https://myaccount.google.com/security"'}),
      row(c,{title:t('accountsettings_privacy_settings_menu_title'),summary:t('accountsettings_privacy_settings_menu_subtitle'),action:'ngms-web',data:' data-url="https://myaccount.google.com/privacy"'}),
      row(c,{title:t('accountsettings_preferences_settings_menu_title'),summary:t('accountsettings_preferences_settings_menu_subtitle'),action:'ngms-web',data:' data-url="https://myaccount.google.com/preferences"'}),
      cat(c,'common_google_settings_services'),go(c,'gms-ads','common_ads_settings_title'),go(c,'gms-connected','common_connected_apps_settings_title'),go(c,'gms-data','common_google_settings_data_management_title'),go(c,'gms-location','common_location_settings_title'),go(c,'gms-nearby','common_nearby_title'),
      row(c,{title:t('common_games_settings_title'),action:'ngms-games'}),row(c,{title:t('common_search_and_now_settings_title'),action:'ngms-search'}),go(c,'gms-security','common_security_settings_title'),go(c,'gms-device','common_set_up_nearby_device_settings_title'),go(c,'gms-smartlock','common_google_settings_credentials_title')])},
    'gms-ads':{render:c=>list([row(c,{title:t('ads_prefs_reset_adid'),action:'ngms-reset-adid'}),sw(c,'adsOptOut',t('ads_prefs_ads_personalization'),t('ads_prefs_ads_personalization_summary')),row(c,{title:t('ads_prefs_ads_by_google'),action:'ngms-web',data:' data-url="https://www.google.com/ads/preferences/"'}),{html:`<div class="ngms-adid">${c.safe(t('ads_prefs_your_adid'))}<br>${c.safe(adid(c))}</div>`,sel:false}])},
    'gms-connected':{render:c=>`<div class="ngst-empty">${c.safe(t('plus_list_apps_empty_message'))}</div>`},
    'gms-data':{render:c=>list([row(c,{title:t('common_google_settings_drive_network_usage'),summary:t(S(c).drive==='all'?'common_settings_drive_network_usage_all':'common_settings_drive_network_usage_wifi'),action:'ngms-drive'})])},
    'gms-location':{title:()=>t('location_settings_screen_title'),render:c=>{const on=c.data.settings?.location!==false;return list([sw(c,'access',t('location_settings_allow_access_title'),t('location_settings_allow_access_summary'),!on),row(c,{title:t('udc_location_history_button'),summary:t('location_settings_ulr_summary_disabled'),action:'ngms-go',data:' data-to="gms-location-history" data-t="location_settings_location_history_activity_title"'}),row(c,{title:t('location_settings_location_sharing_setting_label'),action:'ngms-web',data:' data-url="https://www.google.com/maps/"'})]);}},
    'gms-location-history':{title:()=>t('location_settings_location_history_activity_title'),bar:c=>NG.settingsSwitchBar(c,!!S(c).history,'ngms-history'),render:c=>`<div class="ngms-lh"><div class="ngms-account">${c.safe(NG.account.email)}</div><p>${c.safe(t('location_settings_location_history_summary_full'))}</p><div class="ngms-buttons"><button type="button" data-action="ngms-web" data-url="https://www.google.com/maps/timeline">${c.safe(t('location_settings_manage_activities'))}</button><button type="button" data-action="ngms-delete-history">${c.safe(t('location_settings_delete_location_history'))}</button></div></div>`},
    'gms-nearby':{bar:c=>NG.settingsSwitchBar(c,!!S(c).nearby,'ngms-nearby'),render:()=>''},
    'gms-security':{render:c=>{const loc=c.data.settings?.location!==false;return list([cat(c,'common_security_settings_title'),sw(c,'locate',t('mdm_settings_locate_title'),loc?t('mdm_settings_locate_summary'):t('mdm_settings_system_locate_disabled_summary'),!loc),sw(c,'wipe',t('mdm_settings_wipe_title'),t('mdm_settings_wipe_summary')),cat(c,'verify_apps_section_title'),sw(c,'verify',t('verify_apps_title'),t('verify_apps_summary'))]);}},
    'gms-device':{render:c=>{const st=c.ui.gmsDevice||'intro';return `<div class="ngms-device">${st==='intro'?`<h2>${c.safe(t('smartdevice_setup_intro_title'))}</h2><p>${c.safe(t('smartdevice_setup_intro_text'))}</p><button type="button" class="primary" data-action="ngms-device-search">${c.safe(t('smartdevice_setup_intro_continue'))}</button>`:st==='search'?`<h2>${c.safe(t('smartdevice_searching_for_devices'))}</h2><i class="ngms-spinner"></i>`:`<h2>${c.safe(t('smartdevice_no_nearby_devices_found'))}</h2><div class="ngms-buttons"><button type="button" data-action="ngms-back">${c.safe(t('smartdevice_action_close'))}</button><button type="button" class="primary" data-action="ngms-device-search">${c.safe(t('smartdevice_search_again'))}</button></div>`}</div>`;}},
    'gms-smartlock':{render:c=>{const s=S(c);return list([sw(c,'smartlock',t('credentials_pref_storage_enabled'),t('credentials_pref_storage_enabled_summary')),sw(c,'autoSignin',t('credentials_pref_auto_signin'),t('credentials_pref_auto_signin_summary'),!s.smartlock),cat(c,'credentials_pref_never_save'),...s.neverSave.map(id=>row(c,{title:c.title(id),icon:NG.appsData?.[id]?.icon,action:'ngms-unnever',data:` data-id="${id}"`})),row(c,{title:t('credentials_pref_add_never_save'),action:'ngms-never',disabled:!s.smartlock})]);}}
  };
  for(const [k,v] of Object.entries(screens))NG.settingsScreens[k]={...v,action:(c,name,el)=>action(c,name,el)};
  function action(c,name,el){const s=S(c);if(!name.startsWith('ngms-'))return false;
    switch(name.slice(5)){
      case 'go':NG.settingsGo(c,el.dataset.to,t(el.dataset.t));return true;
      case 'web':web(c,el.dataset.url);return true;
      case 'games':c.open('play-games');NG.gamesUI&&Object.assign(NG.gamesUI.state(c),{route:'settings',stack:[]});return true;
      case 'search':NG.openPrefs(c,'google','preferences_headers',NG.text('google').t('settings'));return true;
      case 'toggle':{const k=el.dataset.k;if(k==='adsOptOut'&&!s.adsOptOut){c.dialog({title:t('ads_prefs_toggle_interest_based_ads_dialog_title'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{s.adsOptOut=true;c.save();c.render();}}]});return true;}s[k]=!s[k];c.save();c.render();return true;}
      case 'reset-adid':c.dialog({title:t('ads_prefs_reset_adid_dialog_title'),message:t('ads_prefs_reset_adid_dialog_msg'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{s.adid='';adid(c);c.render();}}]});return true;
      case 'drive':{const values=['wifi','all'];NG.appPrefsChoose(c,t('common_google_settings_drive_network_usage'),values.map(v=>t(v==='all'?'common_settings_drive_network_usage_all':'common_settings_drive_network_usage_wifi')),values.indexOf(s.drive),(c,i)=>{s.drive=values[i];c.save();c.render();},'#009688');return true;}
      case 'history':if(!s.history){s.history=true;c.save();c.render();}else c.dialog({title:t('location_settings_confirm_location_history_pause_title'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{s.history=false;c.save();c.render();}}]});return true;
      case 'delete-history':c.dialog({title:t('location_settings_confirm_deleting_location_history_title'),message:t('location_settings_confirm_deleting_location_history_body'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok')}]});return true;
      case 'nearby':s.nearby=!s.nearby;c.save();c.render();return true;
      case 'device-search':c.ui.gmsDevice='search';c.render();setTimeout(()=>{if(c.ui.gmsDevice==='search'){c.ui.gmsDevice='none';c.render();}},2500);return true;
      case 'back':c.ui.gmsDevice='';NG.settingsBack(c);return true;
      case 'never':{const apps=Object.keys(NG.appsData||{}).filter(id=>!s.neverSave.includes(id)&&NG.appsData[id].pkg);c.dialog({title:t('credentials_add_never_save_app_dialog_title'),items:apps.map(id=>({html:c.safe(c.title(id))})),onItem:(i,c)=>{s.neverSave.push(apps[i]);c.save();c.render();}});return true;}
      case 'unnever':{const id=el.dataset.id;c.dialog({message:f('credentials_pref_never_save_remove_ask',c.title(id)),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{s.neverSave=s.neverSave.filter(x=>x!==id);c.save();c.render();}}]});return true;}
      default:return false;
    }}
})();
