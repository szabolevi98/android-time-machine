/* Android 7.1.2 Settings rows that open another package's activity, drawn where they lead:
   - Cellular network settings (TeleService's MobileNetworkSettings, Theme.Material.Settings): network_setting.xml with the
     rows its code keeps on this GSM phone (Data roaming with its "Allow data roaming?" warning, Preferred network type
     from enabled_networks_choices, Enhanced 4G LTE Mode) and gsm_umts_options.xml's Access Point Names and Network
     operators (carrier_select.xml: Search networks, Choose automatically). Carrier settings has no target on this image.
   - Wi-Fi Direct (WifiP2pSettings): Device information with the phone's P2P name, Peer devices while searching, Remembered
     groups, and the Search for devices / Rename device menu.
   - About phone's Send feedback about this device (Google Feedback) and Emergency information. */
(() => {
  'use strict';
  const T=()=>NG.text('settingsx'),t=k=>T().t(k);
  const S=c=>c.data.settings;
  const NETWORKS=['Telekom','Telenor','Vodafone'];   // the radio's network scan around the simulated phone (data, not texts)
  const color=()=>[NG.settingsTheme?.colorPrimary||'#263238',NG.settingsTheme?.colorPrimaryDark||'#21272b'];
  NG.appPrefsHooks.mobilenet={
    get color(){return color();},
    hidden:['cdma_lte_data_service_key','preferred_network_mode_key','carrier_settings_key'],
    get(c,key){if(key==='button_roaming_key')return !!S(c).dataRoaming;if(key==='enabled_networks_key')return S(c).networkMode||'10';if(key==='enhanced_4g_lte')return S(c).volte!==false;},
    set(c,key,v){if(key==='enabled_networks_key'){S(c).networkMode=v;c.save();return true;}if(key==='enhanced_4g_lte'){S(c).volte=!!v;c.save();return true;}},
    summary(c,key){if(key==='button_roaming_key')return t(S(c).dataRoaming?'TeleService/roaming_enable':'TeleService/roaming_disable');if(key==='button_auto_select_key'&&S(c).networkManual)return S(c).networkManual;},
    after(c,xml){if(xml!=='network_setting')return '';return `<div class="ngst-list">${NG.settingsJoinRows([{html:NG.settingsRow(c,{title:t('TeleService/apn_settings'),action:'ngxs-apn'}),sel:true},{html:NG.settingsRow(c,{title:t('TeleService/networks'),summary:t('TeleService/sum_carrier_select'),action:'ngxs-carrier'}),sel:true}])}</div>`;},
    click(c,key,n){
      if(key==='button_roaming_key'){if(S(c).dataRoaming){S(c).dataRoaming=false;c.save();c.render();}else c.dialog({title:t('TeleService/roaming_alert_title'),message:t('TeleService/roaming_warning'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{S(c).dataRoaming=true;c.save();c.render();}}]});return true;}
      if(key==='button_srch_netwrks_key'){c.dialog({progress:t('TeleService/load_networks_progress'),buttons:[],cancelable:false});setTimeout(()=>{if(c.ui.overlay==='dialog')c.closeOverlay();NG.appPrefsChoose(c,NG.appPrefStr(n.title),NETWORKS,NETWORKS.indexOf(S(c).networkManual),(c,i)=>{S(c).networkManual=NETWORKS[i];c.save();c.toast(t('TeleService/registration_done'));c.render();},color()[0]);},1500);return true;}
      if(key==='button_auto_select_key'){delete S(c).networkManual;c.save();c.dialog({progress:t('TeleService/register_automatically'),buttons:[],cancelable:false});setTimeout(()=>{if(c.ui.overlay==='dialog')c.closeOverlay();c.toast(t('TeleService/registration_done'));c.render();},1200);return true;}
      return false;
    },
    action(c,name){if(name==='ngxs-apn'){c.open('settings','xml:apn_settings');return true;}if(name==='ngxs-carrier'){NG.appPrefsGo(c,'carrier_select',t('TeleService/networks'));return true;}return false;}
  };
  NG.openMobileNetworks=c=>NG.openPrefs(c,'mobilenet','network_setting',NG.text('appprefs').t('TeleService/mobile_networks'));
  // WifiP2pSettings: the device's P2P name is Settings.Global.WIFI_P2P_DEVICE_NAME, by default "Android_" and four
  // characters of the Android ID.
  const p2pName=c=>S(c).p2pName||'Android_3a8f';
  NG.settingsScreens['wifi-direct']={
    title:()=>t('wifi_p2p_settings_title'),
    actions:c=>NG.menu.button(c),
    render(c){const searching=c.ui.p2pSearch>Date.now(),row=r=>({html:NG.settingsRow(c,r),sel:true}),cat=k=>({html:NG.settingsCat(c,t(k)),sel:false});
      return `<div class="ngst-list">${NG.settingsJoinRows([cat('wifi_p2p_device_info'),row({title:p2pName(c),action:'ngxs-p2p-rename'}),cat('wifi_p2p_peer_devices'),...(searching?[{html:`<div class="ngxs-p2p-search"><i class="ngms-spinner"></i></div>`,sel:false}]:[]),cat('wifi_p2p_remembered_groups')])}</div>`;},
    action(c,name,el){
      if(name==='ng-menu'){const searching=c.ui.p2pSearch>Date.now();c.menu([{label:t(searching?'wifi_p2p_menu_searching':'wifi_p2p_menu_search'),disabled:searching,action:c=>search(c)},{label:t('wifi_p2p_menu_rename'),action:c=>rename(c)}],el);return true;}
      if(name==='ngxs-p2p-rename'){rename(c);return true;}
      return false;}
  };
  function search(c){c.ui.p2pSearch=Date.now()+12000;c.render();setTimeout(()=>{if(c.ui.view==='settings')c.render();},12100);}
  function rename(c){let v=p2pName(c);c.dialog({title:t('wifi_p2p_menu_rename'),html:`<div class="ngst-edit"><input type="text" class="ngst-input" value="${c.safe(v)}" maxlength="32"></div>`,mount:(c,win)=>{const f=win.querySelector('input');f.addEventListener('input',()=>{v=f.value;});setTimeout(()=>f.focus(),50);},buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{if(!v.trim()){c.toast(t('wifi_p2p_failed_rename_message'));return;}S(c).p2pName=v.trim();c.save();c.render();}}]});}
})();
