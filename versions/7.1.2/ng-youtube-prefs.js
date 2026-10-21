/* SettingsActivity's XML fragments, with the rows installed by its Java
   fragments. Captions use the enabled system CaptionProperties activity. */
(() => {
  'use strict';
  const T=()=>NG.text('youtube'),t=k=>T().t(k),xml=NG.appPrefsXml.youtube.xml;
  const row=(key,title,kind='Preference')=>({t:kind,key,title:t(title)});
  xml.youtube_privacy={t:'PreferenceScreen',c:[row('clear-watch','watch_history_clear'),row('pause_watch_history','pause_history','SwitchPreference'),row('clear-search','clear_search'),row('pause_search_history','pause_search','SwitchPreference'),row('privacy','menu_privacy_policy')]};
  xml.youtube_autoplay={t:'PreferenceScreen',c:[row('autonav_settings_activity_key','pref_autonav_title','SwitchPreference')]};
  xml.youtube_notifications={t:'PreferenceScreen',c:[{...row('video_notifications_enabled','pref_video_notifications_enabled_title','SwitchPreference'),defaultValue:'true'}]};
  xml.youtube_about={t:'PreferenceScreen',c:[{...row('version','application_name'),summary:'11.41.56'},row('privacy','menu_privacy_policy'),{...row('licenses','open_source_licenses_title'),summary:t('open_source_licenses_description')}]};
  const caption=xml.preference_headers.c.find(n=>n.title==='string/YouTube/pref_subtitles_category'&&!n.fragment);if(caption)caption.fragment='system-captions';
  NG.appPrefsHooks.youtube={color:['#e62117','#ba1b12'],accent:'#4285f4',
    hide(c,key,n){return /DogfoodPrefsFragment|DeveloperPrefsFragment|SubtitlesLegacyPrefsFragment|OfflinePrefsFragment/.test(n.fragment||'')||key==='innertube_managed_restricted_mode';},
    title(c,key,n){if(n.fragment?.endsWith('NotificationPrefsFragment'))return t('pref_video_notifications_enabled_title');},
    fragments:{GeneralPrefsFragment:'general_prefs',SendToTvPrefsFragment:'pair_with_tv_prefs',PrivacyPrefsFragment:'youtube_privacy',NotificationPrefsFragment:'youtube_notifications',AboutPrefsFragment:'youtube_about'},
    click(c,key,n){
      if(n.fragment==='system-captions'){c.open('settings','xml:captioning_settings');return true;}
      if(key==='autonav_settings_activity_key'&&n.t==='ListPreference'){NG.appPrefsGo(c,'youtube_autoplay',t('pref_autonav_title'));return true;}
      if(key==='clear-watch'){NG.youtubeUI.clearHistory(c);return true;}
      if(key==='clear-search'){c.dialog({title:t('clear_search'),buttons:[{label:t('framework/cancel')},{label:t('framework/ok'),action:c=>{NG.youtubeModel.state(c).searches=[];c.save();c.render();}}]});return true;}
      if(key==='privacy'){c.open('chrome','url:https://www.google.com/policies/privacy/');return true;}
      if(key==='licenses'){const u=NG.youtubeUI.state(c);u.watch=false;u.licenses=true;c.open('youtube');return true;}
      if(['pair_with_youtube_tv','edit_tvs'].includes(key)){c.dialog({title:t('mdx_pref_pair_with_tv_no_tvs_found_title'),message:t('mdx_pref_pair_with_tv_no_tvs_found_with_wifi_summary'),buttons:[{label:t('framework/ok')}]});return true;}
      return false;
    }
  };
})();
