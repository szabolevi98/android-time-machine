/* Videos' SettingsActivity (res/xml/preferences) and CaptionSettingsActivity (preferences_caption) with the rows its
   code fills in. The Dogfood category is the internal build's, Disney Movies Anywhere only appears for a linked
   account and TV pairing needs a set-top box on the network: those stay hidden on this phone. */
(() => {
  'use strict';
  const T=()=>NG.text('movies'),t=k=>T().t(k),P=(c,k,d)=>NG.appPref(c,'movies',k,d);
  const RATINGS=['G','PG','PG-13','R','NC-17'];
  const LANGS={en:'en-US',hu:'hu-HU',de:'de-DE',fr:'fr-FR',es:'es-ES'};
  const name=tag=>NG.locales.names[tag]?.[0]||tag;
  NG.appPrefsHooks.movies={
    color:['#ff1744','#d60b41'],
    hidden:['experimental_category','pairing_category','connected_accounts_category','dma_unlink_account','captioning_preview'],
    summary(c,key){
      if(key==='content_filtering_settings')return t(P(c,'content_rating')?'pref_content_filtering_on_summary':'pref_content_filtering_off_summary');
      if(key==='download_storage')return t('primary_storage');
      if(key==='captioning_locale')return name(LANGS[P(c,key,c.lang)]||LANGS.en);
      if(key==='version')return NG.appsData['play-movies'].version;
      if(key==='gservices_id')return '3a8f21c94be07d16';
      if(key==='device_summary')return 'Nexus 6P · N2G48C';
    },
    screens:{captioning_settings:'preferences_caption'},
    top(c,xml){if(xml!=='preferences_caption')return '';const scale=+P(c,'captioning_font_scale','1.0')||1;return `<div class="ngmv-capview"><span style="font-size:calc(${(16*scale).toFixed(1)} * var(--dp))">${c.safe(t('pref_captioning_preview_text'))}</span></div>`;},
    click(c,key,n){
      if(key==='captioning_system_settings'){c.open('settings','xml:captioning_settings');return true;}
      if(key==='content_filtering_settings'){const cur=P(c,'content_rating','');NG.appPrefsChoose(c,t('allow_movies_rated'),[...RATINGS,t('pref_content_filtering_off_summary')],cur?RATINGS.indexOf(cur):RATINGS.length,(c,i)=>{NG.setAppPref(c,'movies','content_rating',RATINGS[i]||'');c.render();},'#ff1744');return true;}
      if(key==='manage_downloads'){NG.appPrefsGo(c,'movies-downloads',t('manage_downloads'));return true;}
      if(key==='download_storage'){NG.appPrefsChoose(c,NG.appPrefStr(n.title),[t('primary_storage')],0,c=>c.render(),'#ff1744');return true;}
      if(key==='captioning_locale'){const tags=Object.values(LANGS),cur=LANGS[P(c,key,c.lang)]||LANGS.en;NG.appPrefsChoose(c,NG.appPrefStr(n.title),tags.map(name),tags.indexOf(cur),(c,i)=>{NG.setAppPref(c,'movies',key,Object.keys(LANGS)[i]);c.render();},'#ff1744');return true;}
      if(key==='surround_sound_demo'){c.open('play-movies');NG.moviesUI.play(c,NG.playMedia.items.find(it=>it.media===2).id);return true;}
      if(key==='open_source_licenses'){Object.assign(NG.moviesUI.state(c),{route:'licenses',query:null,drawer:false});c.open('play-movies');return true;}
      if(['version','gservices_id','device_summary'].includes(key))return true;
      return false;
    },
    customs:{'movies-downloads':{render:c=>`<div class="ngmv-empty"><img src="assets/mv-library-empty.png" alt=""><b>${c.safe(t('instructions_no_offline_content'))}</b></div>`}}
  };
})();
