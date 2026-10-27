/* Marshmallow AppStorageSettings.clearApplicationUserData / clearCache: clear private app state while
   retaining provider records (contacts, SMS, Calendar, MediaStore/Documents) and demo account records. */
(() => {
 'use strict';
 const privateState={phone:['lastDialed','frequentsCleared'],contacts:['contactsFilter','contactsTab','contactsUngrouped'],drive:['driveSort'],downloads:['downloadsSort'],calendar:['calendarOobe'],camera:['camera'],gmail:['gmailSetup','gmailSearches'],photos:['photosOnboarded','photosCardsGone'],'android-pay':['pay'],search:['google']};
 const prefs={phone:['dialer'],contacts:['contacts'],messenger:['messenger'],clock:['clock'],gmail:['gmail'],calendar:['calendar'],camera:['camera'],chrome:['chrome'],maps:['maps'],youtube:['youtube'],drive:['drive'],'play-store':['play'],'play-music':['music'],'play-movies':['movies']};
 const uiKeys={calculator:['calc'],phone:['phone','call'],contacts:['contacts'],messenger:['messenger'],clock:['clock','clockCities','alarmAlert'],gmail:['gmail'],calendar:['calendar'],camera:['camera'],chrome:['chrome'],maps:['maps'],youtube:['yt'],drive:['drive'],photos:['photos'],'play-store':['play'],'play-games':['playgames']};
 function clearCache(c,id){
  if(id==='chrome'&&c.data.chrome)delete c.data.chrome.cache;
  if(id==='drive')for(const f of c.data.driveFiles||[]){delete f.previewCached;}
  ((c.data.settings.appCleared||={})[id]||={}).cache=true;c.save();
 }
 function clear(c,id){
  if(['settings','launcher','home'].includes(id))return false;
  MM.module(id)?.clearData?.(c);
  for(const key of privateState[id]||[])delete c.data[key];
  for(const key of prefs[id]||[id])if(c.data.appPrefs)delete c.data.appPrefs[key];
  for(const key of uiKeys[id]||[id])delete c.ui[key];
  if(id==='clock'){MM.module('clock-alerts')?.clearData?.();c.data.clock={alarms:[]};c.data.notifications=(c.data.notifications||[]).filter(n=>n.app!=='clock');}
  if(id==='chrome'){delete c.data.chrome;c.data.chrome={fre:false,history:['chrome-native://newtab/'],index:0,bookmarks:[],visits:{},log:[],desktop:false,report:true};}
  if(id==='hangouts'){delete c.data.hangoutsPrefs;delete c.data.hangoutsSignedOut;}
  if(id==='maps'&&c.data.maps){c.data.maps.searches=[];c.data.maps.areas=[];c.data.maps.history=false;}
  if(id==='youtube'&&c.data.yt)c.data.yt.searches=[];
  if(id==='drive')for(const f of c.data.driveFiles||[]){delete f.offline;delete f.previewCached;}
  if(id==='play-store'&&c.data.play)for(const k of ['searches','contentPin','contentEnabled','contentLevel'])delete c.data.play[k];
  if(id==='play-games')delete c.data.games;
  if(c.data.settings.perms)delete c.data.settings.perms[id];
  ((c.data.settings.appCleared||={})[id]||={}).data=true;clearCache(c,id);c.save();return true;
 }
 function opened(c,id){if(MM.appsData?.[id]&&c.data.settings.appCleared?.[id]){delete c.data.settings.appCleared[id];c.save();}}
 MM.appData={clear,clearCache,opened,canClear:id=>!['settings','launcher','home'].includes(id)};
})();
