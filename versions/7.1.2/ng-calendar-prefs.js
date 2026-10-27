/* ng Calendar 5.7, N2G48C: GeneralPreferences constructs these segments in code, not a preference XML.
   Order/defaults verified in its dex: week start, device/home time zone, alternate calendar, week number, declined events,
   default duration, notifications and quick responses. Show more events is tablet-only in these phone builds.
   Values stay local; recurring events and their reminder delivery are outside option 2. */
(() => {
 'use strict';
 const T=()=>NG.text('calendar'),t=k=>T().t(k),F=()=>NG.text('settings'),durations=[-1,15,30,60,90,120];
 const localZone=()=>Intl.DateTimeFormat().resolvedOptions().timeZone;
 const prefs=c=>({weekStart:-1,deviceTz:true,zone:localZone(),weekNumbers:false,declined:true,duration:60,alerts:true,standard:true,vibrate:false,gmail:true,alternate:0,...c.data.appPrefs?.calendar});
 const set=(c,k,v)=>{((c.data.appPrefs||={}).calendar||={})[k]=v;c.save();};
 const quick=c=>prefs(c).quick||t('quick_response_defaults');
 const firstDay=c=>prefs(c).weekStart<0?((new Intl.Locale(c.locale()).weekInfo?.firstDay??(c.locale()==='en-US'?7:1))%7):prefs(c).weekStart;
 const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
 const hm=d=>`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
 const durationLabel=m=>m<0?t('no_end_time'):AndroidStrings.format(t('end_time_min'),m);
 function applyDuration(c,d){const minutes=prefs(c).duration,at=new Date(d.date+'T'+d.start);at.setMinutes(at.getMinutes()+Math.max(0,minutes));d.end=hm(at);d.endDate=iso(at);d.noEnd=minutes<0;}
 function visible(c,list){const p=prefs(c);return list.filter(e=>(p.declined||!['declined','rejected'].includes(e.response||e.status))&&(p.gmail||!e.fromGmail)).map(e=>{
  if(p.deviceTz||!p.zone||p.zone===localZone()||e.allDay)return e;
  const wall=(date,hm)=>Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:p.zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(date+'T'+hm)).map(x=>[x.type,x.value]));
  const a=wall(e.date,e.start||'00:00'),b=wall(e.endDate||e.date,e.end||e.start||'00:00');
  return {...e,date:`${a.year}-${a.month}-${a.day}`,start:`${a.hour}:${a.minute}`,endDate:`${b.year}-${b.month}-${b.day}`,end:`${b.hour}:${b.minute}`};
 });}
 const week=d=>{const v=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));v.setUTCDate(v.getUTCDate()+4-(v.getUTCDay()||7));return Math.ceil((((v-new Date(Date.UTC(v.getUTCFullYear(),0,1)))/86400000)+1)/7);};
 const alt=(c,d)=>{const cal=[null,'chinese','chinese','hebrew','islamic-civil','islamic','islamic-umalqura','indian','dangi','persian'][prefs(c).alternate];if(!cal)return '';try{return new Intl.DateTimeFormat(c.locale(),{calendar:cal,day:'numeric',month:'short'}).format(d);}catch{return '';}};
 NG.calendarPreferences={prefs,firstDay,applyDuration,visible,week,alt};
 const u=c=>c.ui.calendarSettings||=( {page:'general'} );
 const tone=c=>prefs(c).tone??NG.settingsRingtones?.notification?.default??'';
 const row=(c,key,title,summary='',value,disabled=false)=>`<button type="button" class="ngst-pref" data-action="ngcp-${key}"${disabled?' disabled':''}><span class="ngst-texts"><span class="ngst-title">${c.safe(title)}</span>${summary?`<span class="ngst-summary">${c.safe(summary)}</span>`:''}</span>${value===undefined?'':`<i class="ngw-switch${value?' on':''}"><i class="ngw-thumb"></i></i>`}</button>`;
 const choices=(c,title,labels,values,cur,done)=>c.dialog({title,items:labels.map((label,i)=>({html:`<span class="ngst-choice"><i class="ngw-radio${values[i]===cur?' on':''}"></i><span>${c.safe(label)}</span></span>`})),buttons:[{label:F().t('framework/cancel')}],onItem(i,c){done(c,values[i]);c.render();}});
 NG.appPrefsHooks.calendar={click(c,key,n){const general=n.fragment?.endsWith('.GeneralPreferences'),gmail=n.fragment?.endsWith('.SmartmailPreferences');if(!general&&!gmail)return false;c.ui.calendarSettings={page:general?'general':'gmail'};c.open('calendar-settings','calendar');return true;}};
 NG.register('calendar-settings',{
  app:false,statusColor:()=> '#000',dialogAccent:()=> '#4285f4',
  render(c){const p=prefs(c),page=u(c).page,cat=k=>`<div class="ngst-cat">${c.safe(t(k))}</div>`;let body='',title=t('menu_category_general_preferences');
   if(page==='general'){
    const label=t('preferences_week_start_day_labels')[[6,0,1].indexOf(firstDay(c))]||'';
    body=row(c,'week',t('preference_edit_week_start_header'),label)+row(c,'toggle:deviceTz',t('preference_edit_use_device_timezone_label'),'',p.deviceTz)+row(c,'zone',t('preference_edit_device_timezone_header'),p.zone,undefined,p.deviceTz)
     + row(c,'alternate',t('preference_edit_alternate_calendar_header'),t('preferences_alternate_calendar_labels')[p.alternate]||'')
     +row(c,'toggle:weekNumbers',t('preference_edit_show_week_number'),'',p.weekNumbers)+row(c,'toggle:declined',t('preference_edit_show_declined'),'',p.declined)
     +row(c,'duration',t('settings_default_event_duration_title_spinner'),durationLabel(p.duration))
     +cat('preference_edit_notifications_header')+row(c,'toggle:alerts',t('preference_edit_notify'),'',p.alerts)
     +row(c,'toggle:standard',t('preference_edit_use_standard'),'',p.standard,!p.alerts)+row(c,'tone',t('preference_edit_ringtone_header'),tone(c)||t('preference_edit_no_ringtone_string'),undefined,!p.alerts||p.standard)
     +row(c,'toggle:vibrate',t('preference_edit_vibrate'),'',p.vibrate,!p.alerts)+`<p class="ngcp-note">${c.safe(t('preference_edit_notifications_disclaimer'))}</p>`
     +row(c,'quick',t('quick_response_settings'));
   }else if(page==='quick'){title=t('quick_response_settings_title');body=quick(c).map((text,i)=>row(c,'response:'+i,text)).join('');}
   else {title=t('menu_smartmail_preferences');body=`<div class="ngcp-account">${c.safe(NG.account.email)}</div>`+row(c,'gmail',t('add_automatically'),'',p.gmail);}
   return `<div class="ngpf ngcp" style="--ngpf-accent:#4285f4;--ngw-accent:#4285f4"><div class="ngpf-bar light" style="background:#fff"><button type="button" class="ngpf-up" data-action="ngcp-back"><img src="assets/fw-ic_ab_back_material.svg" alt=""></button><span>${c.safe(title)}</span></div><div class="ngpf-list">${body}</div></div>`;
  },
  back(c){if(u(c).page==='quick'){u(c).page='general';c.render();return true;}return false;},
  action(name,el,event,c){if(!name.startsWith('ngcp-'))return false;const key=name.slice(5),p=prefs(c);
   if(key==='back'){c.back();return true;}
   if(key.startsWith('toggle:')){const k=key.slice(7);set(c,k,!p[k]);c.render();return true;}
   if(key==='week'){choices(c,t('preference_edit_week_start_header'),t('preferences_week_start_day_labels'),[6,0,1],firstDay(c),(c,v)=>set(c,'weekStart',v));return true;}
   if(key==='duration'){choices(c,t('settings_default_event_duration_title_spinner'),durations.map(durationLabel),durations,p.duration,(c,v)=>set(c,'duration',v));return true;}
   if(key==='zone'){if(p.deviceTz)return true;const zones=Intl.supportedValuesOf('timeZone');choices(c,t('preference_edit_device_timezone_header'),zones.map(z=>z.split('_').join(' ')),zones,p.zone,(c,v)=>set(c,'zone',v));return true;}
   if(key==='alternate'){const labels=t('preferences_alternate_calendar_labels');choices(c,t('preference_edit_alternate_calendar_header'),labels,labels.map((_,i)=>i),p.alternate,(c,v)=>set(c,'alternate',v));return true;}
   if(key==='tone'){NG.ringtonePicker(c,{kind:'notification',current:tone(c),onPick:(c,value)=>{set(c,'tone',value);c.render();}});return true;}
   if(key==='quick'){u(c).page='quick';c.render();return true;}
   if(key.startsWith('response:')){const i=+key.slice(9);let text=quick(c)[i];c.dialog({title:t('quick_response_settings_edit_title'),html:`<div class="ngpf-edit"><textarea data-quick rows="3">\n${c.safe(text)}</textarea></div>`,mount(c,win){win.querySelector('textarea').addEventListener('input',e=>text=e.target.value);},buttons:[{label:F().t('framework/cancel')},{label:F().t('framework/ok'),action:c=>{if(text.trim()){const list=[...quick(c)];list[i]=text;set(c,'quick',list);}c.render();}}]});return true;}
   if(key==='gmail'){c.dialog({message:t(p.gmail?'smartmail_toggle_off_dialog_text':'smartmail_toggle_on_dialog_text'),buttons:[{label:F().t('framework/cancel')},{label:t(p.gmail?'smartmail_toggle_off_dialog_confirm_button_text':'smartmail_toggle_on_dialog_confirm_button_text'),action:c=>{set(c,'gmail',!p.gmail);c.render();}}]});return true;}
   return false;
  }
 });
})();
