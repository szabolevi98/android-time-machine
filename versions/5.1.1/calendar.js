/* Local calendar model (repetition, reminders, lanes) and its Google Calendar 5.0 screens. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad = n => String(n).padStart(2, '0');
  const iso = date => `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
  const parse = date => new Date(`${date}T12:00:00`);
  const plus = (date, days) => { const d=parse(date);d.setDate(d.getDate()+days);return iso(d); };
  const minutes = time => Number(time.slice(0,2))*60+Number(time.slice(3,5));
  // EditEventView repetition choices and reminder_minutes_values (minutes before the start; -1 is none).
  const repeats=['none','daily','weekdays','weekly','monthly-weekday','monthly-day','yearly'];
  const reminders=[0,1,5,10,15,20,25,30,45,60,120,180,720,1440,2880,10080];
  const isDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'');
  function normalize(event) {
    const time=event.time || '12:00', endMinutes=minutes(time)+60;
    return {...event, time, endDate:event.endDate || plus(event.date,endMinutes>=1440?1:0),
      endTime:event.endTime || `${pad(Math.floor(endMinutes/60)%24)}:${pad(endMinutes%60)}`,
      allDay:!!event.allDay, location:event.location || '', description:event.description || '',
      repeat:repeats.includes(event.repeat)?event.repeat:'none', until:isDate(event.until)?event.until:'',
      exdates:Array.isArray(event.exdates)?event.exdates.filter(isDate):[], reminder:reminders.includes(Number(event.reminder))&&event.reminder!==null&&event.reminder!==''?Number(event.reminder):-1,
      guests:String(event.guests||''), availability:Number(event.availability)===1?1:0, privacy:[1,2].includes(Number(event.privacy))?Number(event.privacy):0, tz:typeof event.tz==='string'?event.tz:''};
  }
  const days=(from,to)=>Math.round((parse(to)-parse(from))/864e5);
  const lastDay=date=>{const d=parse(date);return new Date(d.getFullYear(),d.getMonth()+1,0).getDate();};
  // Monthly "every Nth weekday": a fifth occurrence is stored as "last", as in EditEventView.
  const ordinal=date=>{const day=parse(date).getDate();return day+7>lastDay(date)&&day>28?-1:Math.ceil(day/7);};
  function matches(event,date) {
    if(date<event.date||event.until&&date>event.until||event.exdates.includes(date))return false;
    if(date===event.date)return true;
    const a=parse(event.date),b=parse(date);
    if(event.repeat==='daily')return true;
    if(event.repeat==='weekdays')return b.getDay()>0&&b.getDay()<6;
    if(event.repeat==='weekly')return a.getDay()===b.getDay();
    if(event.repeat==='monthly-day')return a.getDate()===b.getDate();
    if(event.repeat==='monthly-weekday'){const n=ordinal(event.date);return a.getDay()===b.getDay()&&(n<0?b.getDate()+7>lastDay(date):Math.ceil(b.getDate()/7)===n);}
    if(event.repeat==='yearly')return a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
    return false;
  }
  // Instances overlapping [from, to]; each keeps its series id and records its instance date.
  function expand(events,from,to) {
    const out=[];
    for(const raw of events||[]) {
      if(!raw||!isDate(raw.date))continue;
      const event=normalize(raw),span=Math.max(0,days(event.date,event.endDate));
      if(event.repeat==='none'){if(event.date<=to&&event.endDate>=from)out.push({...event,instance:event.date});continue;}
      for(let date=plus(from,-span)<event.date?event.date:plus(from,-span);date<=to;date=plus(date,1))
        if(matches(event,date))out.push({...event,date,endDate:plus(date,span),instance:date,seriesStart:event.date});
    }
    return out;
  }
  function instance(event,date) {
    const item=normalize(event),span=Math.max(0,days(item.date,item.endDate));
    return isDate(date)&&matches(item,date)?{...item,date,endDate:plus(date,span),instance:date,seriesStart:item.date}:{...item,instance:item.date,seriesStart:item.date};
  }
  // AlertService: one notification per instance when start minus the reminder has passed (stale ones are skipped).
  function dueReminders(events,now,fired=[]) {
    const today=iso(now),due=[];
    for(const item of expand((events||[]).filter(event=>normalize(event).reminder>=0),plus(today,-1),plus(today,8))) {
      if(item.instance!==item.date)continue;
      const start=new Date(`${item.date}T${item.allDay?'00:00':item.time}:00`),at=start.getTime()-item.reminder*60000,key=`${item.id}@${item.date}`;
      if(at<=now.getTime()&&now.getTime()-at<10*60000&&!fired.includes(key))due.push({key,event:item,at});
    }
    return due;
  }
  function repeatLabel(event,locale,t) {
    const item=normalize(event),date=parse(item.date),weekday=date.toLocaleDateString(locale,{weekday:'long'});
    if(item.repeat==='daily')return t('Daily');
    if(item.repeat==='weekdays')return t('Every weekday (Mon–Fri)');
    if(item.repeat==='weekly')return AndroidStrings.format(t('Weekly (every %s)'), weekday);
    if(item.repeat==='monthly-weekday'){const n=ordinal(item.date);return AndroidStrings.format(t('Monthly (every %1$s %2$s)'), t(['last','first','second','third','fourth'][n<0?0:n]), weekday);}
    if(item.repeat==='monthly-day')return AndroidStrings.format(t('Monthly (on day %s)'), date.getDate());
    if(item.repeat==='yearly')return AndroidStrings.format(t('Yearly (on %s)'), date.toLocaleDateString(locale,{month:'long',day:'numeric'}));
    return t('One-time event');
  }
  const reminderLabels=['0 minutes','1 minute','5 minutes','10 minutes','15 minutes','20 minutes','25 minutes','30 minutes','45 minutes','1 hour','2 hours','3 hours','12 hours','24 hours','2 days','1 week'];
  const reminderLabel=(value,t)=>value<0?t('None'):t(reminderLabels[reminders.indexOf(value)]||'10 minutes');
  function valid(event) {
    const dateOK=value=>/^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(parse(value)) && iso(parse(value))===value;
    const timeOK=value=>/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    return !!event.title.trim() && dateOK(event.date) && dateOK(event.endDate) &&
      (event.allDay ? event.endDate>=event.date : timeOK(event.time) && timeOK(event.endTime) && event.endDate+event.endTime>event.date+event.time);
  }
  function onDay(events, date) {
    return expand(events,date,date).filter(event=>event.date<=date &&
      (event.endDate>date || event.endDate===date && (event.allDay || event.endTime>'00:00')))
      .sort((a,b)=>Number(b.allDay)-Number(a.allDay) || (a.date+a.time).localeCompare(b.date+b.time));
  }
  function week(date, start=1) { const d=parse(date);return Array.from({length:7},(_,i)=>plus(date,i-(d.getDay()-start+7)%7)); }
  function month(date, start=1) {
    const d=parse(date);d.setDate(1);const first=week(iso(d),start)[0];
    return Array.from({length:42},(_,i)=>plus(first,i));
  }
  // Assign simultaneous events distinct lanes. Connected overlap groups share a width.
  function lanes(events,date) {
    const items=onDay(events,date).filter(event=>!event.allDay).map(event=>({event,
      start:event.date<date?0:minutes(event.time),end:event.endDate>date?1440:minutes(event.endTime)}));
    items.sort((a,b)=>a.start-b.start || b.end-a.end);
    let group=[], ends=[], boundary=-1;
    const finish=()=>group.forEach(item=>item.columns=ends.length);
    for(const item of items) {
      if(item.start>=boundary){finish();group=[];ends=[];boundary=-1;}
      let lane=ends.findIndex(end=>end<=item.start);if(lane<0)lane=ends.length;
      ends[lane]=item.end;item.lane=lane;group.push(item);boundary=Math.max(boundary,item.end);
    }
    finish();return items;
  }
  // Google Calendar 5.0's views; the Agenda list is its Schedule.
  // Google Calendar 5.0.1-1689541 (the LMY48Y build) offers Schedule, Day, Week and Month; the 3 day view came later.
  const modes=['Agenda','Day','Week','Month'];
  const modeLabel=mode=>mode==='Agenda'?'Schedule':mode;
  const icon=name=>`<img src="assets/calendar-${name}_holo_light.png" alt="">`;
  const dateLabel=(date,locale,options={weekday:'long',month:'long',day:'numeric',year:'numeric'})=>parse(date).toLocaleDateString(locale,options);
  /* Google Calendar 5.0.1 (LMY48Y). A white toolbar (#333333 title: the month with its dropdown arrow; today, search and
     overflow in #777777) under the #3367D6 status bar. Schedule: each month opens on its illustration (bkg_01_jan …
     bkg_12_dec) with the month name, weeks carry a #757575 "Oct 4 – 10" header, a day shows its weekday and number
     in the 56 dp column (today in #4285F4) beside rounded event chips in the event colour with white text. Day
     and Week lay coloured blocks over the hour grid; Month marks each day's events. The red #DB4437 FAB creates an
     event; the drawer switches the view. Event details open on a header in the event colour with the white title,
     then icon rows (time, place, repeat, reminder, calendar, notes); the editor puts the title on the same header. */
  const gicon=name=>`<img src="assets/gc5-${name}.png" alt="">`;
  const COLOR='#4285f4';
  function render(data,ui,t,locale,now=new Date()) {
    const selected=ui.selectedDate, mode=modes.includes(ui.calendarMode)?ui.calendarMode:'Agenda', P=window.CalendarPrefs, first=P?P.firstDay(data,locale):locale==='en-US'?0:1;
    // The events of the synced calendars (Settings; calendar-prefs.js).
    const shown=P?P.events(data):data.events;
    const event=data.events.find(item=>item.id===ui.selectedEvent);
    const btn=(action,title,body=title,cls='')=>`<button type="button" class="gc-btn ${cls}" data-action="${action}" aria-label="${e(t(title))}">${body}</button>`;
    if(ui.sub==='event-edit') {
      const draft=normalize(ui.eventDraft || {date:selected,title:''});
      // edit_segment_when.xml: the date (Edit.Text.When, 16 sp, 12 dp padding) and, at the end, the time; each opens the datetimepicker.
      const when=(dateName,timeName,kind)=>`<div class="gc-when"><button type="button" class="gc-when-date" data-action="calpick" data-id="${dateName}" aria-label="${e(t(kind+' date'))}">${e(dateButton(draft[dateName]||selected,locale))}</button><button type="button" class="gc-when-time" data-action="calpick" data-id="${timeName}" aria-label="${e(t(kind+' time'))}">${e(timeButton(draft[timeName],locale,data.settings?.hour24))}</button><input type="hidden" name="${dateName}" value="${e(draft[dateName]||selected)}"><input type="hidden" name="${timeName}" value="${e(draft[timeName]||'')}"></div>`;
      const field=(name,label,type='text',value=draft[name]||'')=>`<input class="gc-input" name="${name}" aria-label="${e(t(label))}" type="${type}" value="${e(value)}" ${['title','date','endDate','time','endTime'].includes(name)?'required':''} ${type==='text'?'maxlength="120"':''}>`;
      const row=(img,body)=>`<div class="gc-edit-row">${img?gicon(img):'<span class="gc-noicon"></span>'}<div class="gc-edit-body">${body}</div></div>`;
      return `<form class="app-view cal-app gc-app gc-editor" data-form="event"><header class="gc-detail-head" style="background:${COLOR}"><div class="gc-detail-bar">${btn('event-cancel','Discard',gicon('ic_cancel_white'))}<span></span><button type="submit" class="gc-save">${e(t('Save'))}</button></div><input class="gc-title-input" name="title" aria-label="${e(t('Event name'))}" placeholder="${e(t('Enter title'))}" value="${e(draft.title||'')}" required maxlength="120"></header><div class="cal-scroll gc-scroll">${row('ic_calendar',`<span class="gc-account">${e(t('Calendar'))}<small>nexus6.demo@gmail.com</small></span>`)}${row('ic_date',`<label class="gc-allday"><span>${e(t('All day'))}</span><input type="checkbox" class="gc-switch" role="switch" name="allDay" ${draft.allDay?'checked':''}></label>`)}${row('',`${when('date','time','Start')}${when('endDate','endTime','End')}`)}${row('ic_link',`<input type="hidden" name="tz" value="${e(draft.tz)}">${tzButton(draft.tz||deviceZone(data),draft.date||selected,draft.time)}`)}${row('ic_repeat',`<input type="hidden" name="repeat" value="${e(draft.repeat)}"><button type="button" class="gc-select" data-action="calspin" data-id="repeat" aria-label="${e(t('Repetition'))}">${e(repeatLabel(draft,locale,t))}</button>`)}${row('ic_location',field('location','Add location'))}${row('ic_notification',`<input type="hidden" name="reminder" value="${e(draft.reminder)}"><button type="button" class="gc-select" data-action="calspin" data-id="reminder" aria-label="${e(t('Reminders'))}">${e(reminderLabel(draft.reminder,t))}</button>`)}${row('ic_guests',`<input class="gc-input" name="guests" type="text" value="${e(draft.guests)}" placeholder="${e(CS('Invite people'))}" aria-label="${e(CS('Invite people'))}" maxlength="400" autocomplete="off" data-no-translate>`)}${row('ic_visibility',`<input type="hidden" name="visibility" value="${e(draft.privacy+':'+draft.availability)}"><button type="button" class="gc-select" data-action="calspin" data-id="visibility" aria-label="${e(CS('Visibility'))}">${e(CS((VISIBILITY.find(([value])=>value===draft.privacy+':'+draft.availability)||VISIBILITY[0])[1]))}</button>`)}${row('ic_notes',`<textarea name="description" maxlength="2000" placeholder="${e(t('Add note'))}" aria-label="${e(t('Add note'))}">${e(draft.description)}</textarea>`)}<p class="cal-form-error" role="alert">${ui.calendarError?e(t(ui.calendarError)):''}</p></div></form>`;
    }
    if(ui.sub==='event' && event) {
      const item=instance(event,ui.selectedInstance);
      const row=(img,body)=>body?`<div class="gc-detail-row">${gicon(img)}<div>${body}</div></div>`:'';
      const when=whenLine(item,locale,data);
      return `<div class="app-view cal-app gc-app gc-details"><header class="gc-detail-head" style="background:${COLOR}"><div class="gc-detail-bar">${btn('back','Navigate up',gicon('ic_cancel_white'))}<span></span>${btn('event-edit','Edit',gicon('ic_edit_white'))}${btn('event-delete','Delete','<img src="assets/gm5-ic_delete_wht_24dp.png" alt="">')}</div><h2>${e(item.title)}</h2></header><div class="cal-scroll gc-scroll">${row('ic_date',when)}${row('ic_repeat',item.repeat!=='none'?e(repeatLabel(item,locale,t)):'')}${row('ic_location',item.location?e(item.location):'')}${row('ic_notification',item.reminder>=0?e(reminderLabel(item.reminder,t)):'')}${row('ic_calendar',`${e(t('Calendar'))}<small>nexus6.demo@gmail.com</small>`)}${row('ic_guests',item.guests?item.guests.split(/[,;]\s*/).filter(Boolean).map(guest=>`<span data-no-translate>${e(guest)}</span>`).join('<br>'):'')}${row('ic_notes',item.description?e(item.description):'')}</div></div>`;
    }
    const title=parse(selected).toLocaleDateString(locale,{month:'long'});
    const header=`<header class="gc-bar">${btn('calendar-views','Show Calendar List and Settings drawer','<img src="assets/gm5-ic_menu_wht_24dp.png" alt="">','gc-nav')}<button class="gc-title" data-action="calendar-views"><span>${e(title.charAt(0).toLocaleUpperCase(locale)+title.slice(1))}</span>${gicon('ic_arrow_down')}</button>${btn('calendar-today','Today',`<span class="gc-today">${gicon('ic_today')}<b>${now.getDate()}</b></span>`)}${btn('calendar-menu','More options',gicon('ic_overflow'))}</header>`;
    let content='';
    if(mode==='Month') {
      content=`<div class="cal-weekdays gc-weekdays">${week(selected,first).map(date=>`<span>${e(dateLabel(date,locale,{weekday:'narrow'}))}</span>`).join('')}</div><div class="cal-month gc-month" data-calendar-swipe>${month(selected,first).map(date=>{const items=onDay(shown,date);return `<button data-action="calendar-day" data-id="${date}" aria-label="${e(dateLabel(date,locale))}" class="${date===iso(now)?'cal-today ':''}${date.slice(0,7)!==selected.slice(0,7)?'cal-other':''}"><span>${parse(date).getDate()}</span>${items.slice(0,3).map(item=>`<i style="background:${COLOR}">${e(item.title)}</i>`).join('')}</button>`;}).join('')}</div>`;
    } else if(mode==='Agenda') {
      const query=(ui.calendarSearch||'').toLocaleLowerCase(locale);
      const start=query?selected:iso(new Date(parse(selected).getFullYear(),parse(selected).getMonth(),1,12));
      const base=shown.map(normalize),last=[plus(start,92),...base.filter(item=>item.repeat==='none').map(item=>item.endDate)].sort().at(-1);
      const events=(query?base.filter(item=>[item.title,item.location,item.description].join(' ').toLocaleLowerCase(locale).includes(query)):expand(shown,start,last).filter(item=>item.repeat==='none'||item.date<=plus(start,92))).sort((a,b)=>(a.date+(a.allDay?'':a.time)).localeCompare(b.date+(b.allDay?'':b.time)));
      const chip=item=>`<button class="gc-chip" style="background:${COLOR}" data-action="event-open" data-id="${item.id}" data-date="${item.instance||item.date}"><strong>${e(item.title)}</strong>${item.allDay?'':`<small>${e(item.time+' – '+item.endTime)}${item.location?', '+e(item.location):''}</small>`}</button>`;
      let body='';
      if(query) body=events.map(item=>`<div class="gc-day"><span class="gc-day-label"><small>${e(dateLabel(item.date,locale,{weekday:'short'}))}</small><b>${parse(item.date).getDate()}</b></span><div class="gc-day-events">${chip(item)}</div></div>`).join('')||`<p class="gc-empty">${e(t('No results'))}</p>`;
      else {
        // Month banners, then week headers; days without events show only today.
        const byDay=new Map();events.forEach(item=>{if(!byDay.has(item.date))byDay.set(item.date,[]);byDay.get(item.date).push(item);});
        const today=iso(now);if(today>=start&&today<=last&&!byDay.has(today))byDay.set(today,[]);
        const days=[...byDay.keys()].sort();
        let month='',weekKey='';
        for(let m=0;m<3;m++){const d=parse(start);d.setMonth(d.getMonth()+m);const key=iso(d).slice(0,7);if(!days.some(day=>day.startsWith(key)))days.push(key+'-00');}
        days.sort();
        for(const day of days){
          const d=day.endsWith('-00')?parse(day.slice(0,8)+'01'):parse(day),key=iso(d).slice(0,7);
          if(key!==month){month=key;weekKey='';body+=`<div class="gc-banner" style="background-image:url(assets/gc5-bkg_${String(d.getMonth()+1).padStart(2,'0')}.jpg)"><h3>${e(d.toLocaleDateString(locale,{month:'long',year:d.getFullYear()!==now.getFullYear()?'numeric':undefined}))}</h3></div>`;}
          if(day.endsWith('-00'))continue;
          const ws=week(day,first),wk=ws[0];
          if(wk!==weekKey){weekKey=wk;body+=`<h4 class="gc-week">${e(parse(ws[0]).toLocaleDateString(locale,{month:'short',day:'numeric'}))} – ${e(parse(ws[6]).toLocaleDateString(locale,{month:parse(ws[6]).getMonth()!==parse(ws[0]).getMonth()?'short':undefined,day:'numeric'}))}</h4>`;}
          const items=byDay.get(day)||[];
          body+=`<div class="gc-day${day===today?' today':''}"><span class="gc-day-label"><small>${e(dateLabel(day,locale,{weekday:'short'}))}</small><b>${d.getDate()}</b></span><div class="gc-day-events">${items.map(chip).join('')||`<button class="gc-nothing" data-action="event-new">${e(t('Nothing planned. Tap to create.'))}</button>`}</div></div>`;
        }
      }
      content=`${ui.calendarSearch!==undefined?`<form class="cal-search gc-search" data-form="calendar-search"><input name="query" value="${e(ui.calendarSearch)}" placeholder="${e(t('Search'))}" aria-label="${e(t('Search'))}"></form>`:''}<div class="cal-scroll cal-agenda gc-schedule">${body}</div>`;
    } else {
      const dates=mode==='Day'?[selected]:mode==='3 day'?[selected,plus(selected,1),plus(selected,2)]:week(selected,first);
      content=`<div class="cal-day-labels gc-day-labels" style="--days:${dates.length}"><span></span>${dates.map(date=>`<button data-action="calendar-day" data-id="${date}" class="${date===iso(now)?'cal-today':''}"><small>${e(dateLabel(date,locale,{weekday:'short'}))}</small><strong>${parse(date).getDate()}</strong></button>`).join('')}</div><div class="cal-all-day gc-all-day" style="--days:${dates.length}"><small></small>${dates.map(date=>`<div>${onDay(shown,date).filter(item=>item.allDay).map(item=>`<button style="background:${COLOR}" data-action="event-open" data-id="${item.id}" data-date="${item.instance||item.date}">${e(item.title)}</button>`).join('')}</div>`).join('')}</div><div class="cal-scroll cal-time-scroll gc-time-scroll" data-calendar-swipe><div class="cal-hours gc-hours" style="--days:${dates.length}"><div class="cal-hour-labels">${Array.from({length:24},(_,hour)=>`<span>${hour?new Date(2015,0,1,hour).toLocaleTimeString(locale,{hour:'numeric'}):''}</span>`).join('')}</div>${dates.map(date=>`<div class="cal-day-column">${Array.from({length:24},(_,hour)=>`<button class="cal-hour-cell" data-action="calendar-slot" data-id="${date}|${pad(hour)}:00" aria-label="${e(dateLabel(date,locale))} ${pad(hour)}:00"></button>`).join('')}${lanes(shown,date).map(({event:item,start,end,lane,columns})=>`<button class="cal-timed-event gc-block" data-action="event-open" data-id="${item.id}" data-date="${item.instance||item.date}" style="background:${COLOR};top:${start/60*48}px;height:${Math.max(22,(end-start)/60*48)}px;left:${lane/columns*100}%;width:${100/columns}%"><strong>${e(item.title)}</strong><small>${e(item.time+' – '+item.endTime)}</small></button>`).join('')}</div>`).join('')}</div></div>`;
    }
    return `<div class="app-view cal-app gc-app gc-mode-${mode.replace(' ','')}">${header}${content}<button class="gc-fab" data-action="event-new" aria-label="${e(t('New event'))}">${gicon('ic_add_24dp_white')}</button></div>`;
  }
  // The repeat and reminder fields (audit step 6): Google Calendar 5's rows open single-choice dialogs; the hidden
  // inputs keep the values the form submits.
  // Guests, Show me as, Privacy (Visibility on 5.1) and the time zone (audit step 6), in the APK's words
  // (stock-strings.js, group calendar).
  const CS=key=>{const row=window.StockStrings?.calendar?.[key];return row ? AndroidStrings.pick(row, window.AndroidI18n?.language, key) :key;};
  // TimeZoneEditSegment (edit_segment_timezone.xml: the ic_link globe, "Time zone"): the zone's name at the event's
  // start with its offset, as TimeZonePickerUtils gives it; a tap opens TimeZonePickerDialog (tzpicker.js, the image's
  // zones, names and countries).
  const tzButton=(tz,date,time)=>{const lang=window.AndroidI18n?.language,ms=window.TimeZonePicker.millis(tz,date,time);return `<button type="button" class="gc-select cal-tz" data-action="caltz" data-id="${e(tz)}" data-ms="${ms}" aria-label="${e(window.TimeZonePicker.description(lang))}">${window.TimeZonePicker.label(tz,ms,lang)}</button>`;};
  // The event info shows an event of another zone in the device's zone; 5.0.1 has no zone label there any more (its
  // resources lost event_info_headline_transparent_color).
  const whenLine=(item,locale,data)=>{const local=deviceZone(data),P=window.TimeZonePicker,other=!item.allDay&&item.tz&&item.tz!==local;let [date,time,endDate,endTime]=[item.date,item.time,item.endDate,item.endTime];if(other){const a=P.wall(local,P.millis(item.tz,item.date,item.time)),b=P.wall(local,P.millis(item.tz,item.endDate,item.endTime));[date,time,endDate,endTime]=[a.date,a.time,b.date,b.time];}return `${e(dateLabel(date,locale))}${endDate!==date?' – '+e(dateLabel(endDate,locale)):''}${item.allDay?'':`<small>${e(time+' – '+endTime)}</small>`}`;};
  const deviceZone=data=>{try{return window.ICSSystemSettings?.zone?.(data)||Intl.DateTimeFormat().resolvedOptions().timeZone;}catch{return Intl.DateTimeFormat().resolvedOptions().timeZone;}};
  const VISIBILITY=[['0:0','Busy'],['0:1','Available'],['2:0','Public - Busy'],['2:1','Public - Available'],['1:0','Private - Busy'],['1:1','Private - Available']];
  const spinner=(field,draft,locale,t)=>field==='repeat'?repeats.map(kind=>({value:kind,label:repeatLabel({...draft,repeat:kind},locale,t)}))
    :field==='availability'?['Busy','Available'].map((key,i)=>({value:String(i),label:CS(key)}))
    :field==='privacy'?['Default','Private','Public'].map((key,i)=>({value:String(i),label:CS(key)}))
    :field==='visibility'?VISIBILITY.map(([value,key])=>({value,label:CS(key)}))
    :[-1,...reminders].map(value=>({value:String(value),label:reminderLabel(value,t)}));
  function overlay(ui,t) {
    if(ui.overlay==='calendar-spinner'&&ui.calSpin){const sp=ui.calSpin;return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="gc-choice" role="dialog" aria-label="${e(sp.title)}">${sp.items.map(item=>`<button type="button" role="radio" aria-checked="${item.value===sp.value}" data-action="calspin-pick" data-id="${e(item.value)}"><i></i><span>${e(item.label)}</span></button>`).join('')}</div>`;}
    if(ui.overlay==='calendar-views'){const current=modes.includes(ui.calendarMode)?ui.calendarMode:'Agenda';const icons={Agenda:'ic_agenda','Day':'ic_hourview','3 day':'ic_hourview','Week':'ic_week','Month':'ic_monthview'};return `<div class="lem-drawer-scrim" data-action="close-overlay"></div><nav class="lem-drawer gc-drawer" style="--lem:#4285f4" aria-label="Calendar"><div class="lem-account"><span class="lem-account-avatar">N</span><b>Nexus 6</b><small>nexus6.demo@gmail.com</small></div>${modes.map(mode=>`<button class="lem-folder${mode===current?' on':''}" data-action="calendar-mode" data-id="${mode}"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gc5-${icons[mode]}.png);mask-image:url(assets/gc5-${icons[mode]}.png)"></span><span class="lem-folder-name">${e(t(modeLabel(mode)))}</span></button>`).join('')}<hr><h4>nexus6.demo@gmail.com</h4><div class="gc-cal-row"><i style="background:#4285f4"></i>${e(t('Calendar'))}</div><div class="gc-cal-row"><i style="background:#0f9d58"></i>${e(t('Holidays'))}</div><div class="gc-cal-row"><i style="background:#f4b400"></i>${e(t('Birthdays'))}</div><hr><button class="lem-folder" data-action="calendar-settings"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gc5-ic_settings.png);mask-image:url(assets/gc5-ic_settings.png)"></span><span class="lem-folder-name">${e(t('Settings'))}</span></button><button class="lem-folder" data-action="toast" data-id="${e(t('Help is not available offline.'))}"><span class="lem-folder-icon" style="-webkit-mask-image:url(assets/gc5-ic_help.png);mask-image:url(assets/gc5-ic_help.png)"></span><span class="lem-folder-name">${e(t('Help & feedback'))}</span></button></nav>`;}
    const menu=body=>`<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${body}</div>`;
    if(ui.overlay==='calendar-menu')return menu(`<button data-action="calendar-search">${e(t('Search'))}</button><button data-action="calendar-refresh">${e(t('Refresh'))}</button>`);
    const scopes=(action,labels)=>`<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog cal-scope" role="dialog">${labels.map(([id,label])=>`<button data-action="${action}" data-id="${id}">${e(t(label))}</button>`).join('')}</div>`;
    if(ui.overlay==='calendar-edit-scope')return scopes('event-edit-scope',[['this','Change only this event'],['future','Change this and all future events'],['all','Change all events in the series']]);
    if(ui.overlay==='calendar-delete-scope')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog cal-scope" role="dialog" aria-label="${e(t('Delete this event?'))}"><h3>${e(t('Delete this event?'))}</h3>${[['this','Only this event'],['future','This and future events'],['all','All events']].map(([id,label])=>`<button data-action="event-delete-scope" data-id="${id}">${e(t(label))}</button>`).join('')}</div>`;
    if(ui.overlay==='calendar-delete')return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog" role="dialog" aria-label="${e(t('Delete this event?'))}"><h3>${e(t('Delete this event?'))}</h3><div class="settings-dialog-actions"><button data-action="close-overlay">${e(t('Cancel'))}</button><button data-action="event-confirm-delete">${e(t('Delete'))}</button></div></div>`;
    return '';
  }
  // WhenEditSegment's texts: the date as EEE, MMM d, yyyy and the time with the clock setting.
  function dateButton(date,locale){return parse(date).toLocaleDateString(locale,{weekday:'short',month:'short',day:'numeric',year:'numeric'});}
  function timeButton(time,locale,hour24){const [h,m]=String(time||'00:00').split(':').map(Number);return new Date(2012,0,1,h||0,m||0).toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',hour12:!hour24});}
  window.ICSCalendar = {spinner,modes,modeLabel,iso,parse,plus,normalize,valid,onDay,week,month,lanes,render,overlay,repeats,reminders,matches,expand,instance,dueReminders,repeatLabel,reminderLabel, dateButton, timeButton};
})();
