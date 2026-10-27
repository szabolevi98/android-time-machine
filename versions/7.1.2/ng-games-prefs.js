/* PlayGames 3.7.24 (N2G48C): GamesSettingsFragment's PublicProfileListItem, NotificationChannelListItem
   and MutedGamesAdapter/UnMuteDialog, verified in the factory dex. The settings are local to the demo profile. */
(() => {
  'use strict';
  const T=()=>NG.text('games'),t=k=>T().t(k),S=c=>c.data.games,P=c=>S(c).prefs||=( {} );
  const channels=[['multi','multiplayer'],['quests','quest'],['requests','request'],['friends','friend']];
  NG.gamesPreferences=c=>{
    const s=S(c),p=P(c),pub=s.profile?.visible!==false,esc=c.safe;
    const row=(key,title,summary,on)=>`<button type="button" class="ngpg-pref ngpg-toggle" data-action="ngpg-pref-${key}"${on===undefined?'':` role="switch" aria-checked="${on}"`}><span><b>${esc(title)}</b>${summary?`<small>${esc(summary)}</small>`:''}</span>${on===undefined?'':`<i class="ngw-switch${on?' on':''}" style="--ngw-accent:#689f38"><i class="ngw-thumb"></i></i>`}</button>`;
    return row('public',t('games_gcore_public_profile'),t(pub?'games_gcore_public_profile_public_status':'games_gcore_public_profile_hidden_status'))
      +channels.map(([key,name])=>row(key,t('games_gcore_'+name+'_notifications'),t('games_gcore_'+name+'_notifications_summary'),p[key]!==false)).join('')
      +`<h4 class="ngpg-prefcat">${esc(t('games_gcore_muted_games'))}</h4>`+((p.mutedGames||[]).length?(p.mutedGames||[]).map((id,i)=>`<button type="button" class="ngpg-pref" data-action="ngpg-pref-unmute" data-i="${i}"><b>${esc(NG.playModel.item(c,id)?.name||id)}</b></button>`).join(''):`<p class="ngpg-prefnote">${esc(t('games_gcore_muted_games_empty'))}</p>`);
  };
  NG.gamesPreferencesAction=(c,name,el)=>{
    if(!name.startsWith('ngpg-pref-'))return false;const key=name.slice(10),p=P(c),s=S(c);
    if(channels.some(([k])=>k===key)){p[key]=p[key]===false;c.save();c.render();return true;}
    if(key==='public'){const pub=s.profile?.visible!==false;c.dialog({title:t('games_profile_visibility_dialog_title'),message:t('games_profile_visibility_dialog_content'),html:`<p class="ngpg-prefnote">${c.safe(t(pub?'games_profile_status_message_public':'games_profile_status_message_hidden'))}</p>`,buttons:[{label:t(pub?'games_profile_button_remain_public':'games_profile_button_remain_hidden')},{label:t(pub?'games_profile_button_hide_profile':'games_profile_button_go_public'),action:c=>{s.profile.visible=!pub;c.save();c.render();}}]});return true;}
    if(key==='unmute'){const i=+el.dataset.i,id=p.mutedGames[i],title=NG.playModel.item(c,id)?.name||id;c.dialog({title:t('games_settings_unmute_title'),message:T().fmt('games_settings_unmute_message',null,title),buttons:[{label:t('framework/cancel')},{label:t('games_settings_unmute_ok'),action:c=>{p.mutedGames=p.mutedGames.filter(x=>x!==id);c.save();c.render();}}]});return true;}
    return false;
  };
})();
