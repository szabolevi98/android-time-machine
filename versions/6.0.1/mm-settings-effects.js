/* mm 6.0.1: apply the saved Settings choices to the running phone. Dates use the device's manual
   clock/zone; font size is applied after each newly drawn view; automatic Zen rules use local provider events
   and the factory ScheduleInfo day/start/end semantics. No hardware discovery is performed by Cast. */
(() => {
 'use strict';
 const settings=c=>c.data.settings;
 MM.deviceEpoch=c=>Date.now()+(settings(c).autoTime===false?(+settings(c).timeOffset||0):0);
 MM.deviceDate=c=>{
  const d=new Date(MM.deviceEpoch(c)),s=settings(c);if(s.autoZone!==false||!s.timeZone)return d;
  try{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:s.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(d).map(p=>[p.type,p.value]));return new Date(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second,d.getMilliseconds());}catch{return d;}
 };
 MM.longPressTimeout=c=>[500,1000,1500].includes(settings(c).a11y?.longPress)?settings(c).a11y.longPress:500;
 MM.applyPreferences=(c,root)=>{
  const scale=(settings(c).a11y?.largeText?1.3:1);
  if(scale===1||!root||(c.ui.view==='settings'&&c.ui.settings?.stack?.at(-1)?.screen==='font-size'))return;
  const nodes=[...root.querySelectorAll('*')].filter(e=>!e.closest('svg,script,style')&&(['INPUT','TEXTAREA','SELECT','OPTION'].includes(e.tagName)||[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())));
  const sizes=nodes.map(e=>{const s=getComputedStyle(e);return[parseFloat(s.fontSize),parseFloat(s.lineHeight)]});
  nodes.forEach((e,i)=>{e.style.fontSize=`${sizes[i][0]*scale}px`;if(Number.isFinite(sizes[i][1]))e.style.lineHeight=`${sizes[i][1]*scale}px`;});
 };
 const rank={0:0,1:1,3:2,2:3};
 const active=(r,c,now)=>{
  if(!r.on)return false;
  if(r.kind==='schedule'){
   const m=now.getHours()*60+now.getMinutes(),start=r.start[0]*60+r.start[1],end=r.end[0]*60+r.end[1],day=now.getDay();
   return start<end?(r.days||[]).includes(day)&&m>=start&&m<end:((r.days||[]).includes(day)&&m>=start||(r.days||[]).includes((day+6)%7)&&m<end);
  }
  if(r.kind==='event')return(c.data.events||[]).some(e=>{
   const reply=e.response||e.status||'accepted';if(r.reply===2&&reply!=='accepted'||r.reply===1&&reply==='declined')return false;
   const start=new Date(e.date+'T'+(e.allDay?'00:00':e.start||'00:00')),end=new Date((e.endDate||e.date)+'T'+(e.allDay?'00:00':e.end||e.start||'00:00'));if(e.allDay&&!e.endDate)end.setDate(end.getDate()+1);else if(end<=start)end.setDate(end.getDate()+1);
   return now>=start&&now<end;
  });return false;
 };
 MM.automaticZenActive=active;
 MM.register('preferences-effects',{app:false,render:()=>'',tick(c){
  const s=settings(c),now=MM.deviceDate(c),current=(s.zenRules||[]).filter(r=>active(r,c,now)),old=s.automaticZen;
  if(current.length){
   const before=JSON.stringify(old);const state=old||{previous:s.zen||0,applied:s.zen||0};if(old&&s.zen!==old.applied)state.previous=s.zen||0;
   const mode=[state.previous,...current.map(r=>r.mode||1)].reduce((a,b)=>rank[b]>rank[a]?b:a,0);
   state.applied=mode;s.automaticZen=state;if(before!==JSON.stringify(state))c.save();if(s.zen!==mode){s.zen=mode;c.save();MM.system.changed(c);}
  }else if(old){if(s.zen===old.applied)s.zen=old.previous;delete s.automaticZen;c.save();MM.system.changed(c);}
 }});
 const t=k=>MM.text('settings').t(k),screen={
  title:()=>t('wifi_display_settings_title'),
  actions:c=>MM.menu.button(c,'mmcast-menu'),
  render:c=>`<div class="mmst-list"><p class="mmcast-empty">${c.safe(t('wifi_display_no_devices_found'))}</p></div>`,
  action(c,name){if(name!=='mm-menu')return false;c.menu([{label:t('wifi_display_enable_menu_item'),checked:!!settings(c).castEnabled,action:c=>{settings(c).castEnabled=!settings(c).castEnabled;c.save();c.render();}}]);return true;}
 };
 MM.settingsScreens['xml:wifi_display_settings']=screen;
})();
