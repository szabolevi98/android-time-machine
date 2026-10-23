/* Home-screen widgets of the JWR66Y (Nexus 4) image: Calendar's CalendarAppWidgetProvider, Music2's album widget and
   Gallery's PhotoAppWidgetProvider (the same layouts as 4.0.4). */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  // CalendarAppWidgetService.MAX_DAYS and EVENT_MIN_COUNT.
  const MAX_DAYS=7,EVENT_MIN_COUNT=20;
  const cal=()=>window.ICSCalendar;
  const stamp=date=>`${cal().iso(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const dayOffset=(from,to)=>Math.round((cal().parse(to)-cal().parse(from))/864e5);

  /* Mirrors CalendarAppWidgetModel: today has no day header, all-day rows lead each
     day, finished events are skipped and later days stop once 20 events are listed. */
  function calendarRows(events,now) {
    const C=cal(),today=C.iso(now),last=C.plus(today,MAX_DAYS-1),current=stamp(now);
    const buckets=Array.from({length:MAX_DAYS},()=>[]);
    const items=C.expand((Array.isArray(events)?events:[]).filter(item=>item&&/^\d{4}-\d{2}-\d{2}$/.test(item.date||'')),today,last)
      .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time)||(a.endDate+a.endTime).localeCompare(b.endDate+b.endTime));
    for(const event of items) {
      const start=event.allDay?`${event.date}T00:00`:`${event.date}T${event.time}`;
      const end=event.allDay?`${C.plus(event.endDate,1)}T00:00`:`${event.endDate}T${event.endTime}`;
      if(end<current)continue;
      const endDay=event.allDay?event.endDate:event.endTime==='00:00'&&event.endDate>event.date?C.plus(event.endDate,-1):event.endDate;
      const row={type:'event',event,inProgress:!event.allDay&&start<=current&&current<=end,multiDay:endDay>event.date};
      for(let day=event.date<today?today:event.date;day<=endDay&&day<=last;day=C.plus(day,1)) {
        const bucket=buckets[dayOffset(today,day)];
        if(event.allDay)bucket.unshift(row);else bucket.push(row);
      }
    }
    const rows=[];let count=0;
    buckets.forEach((bucket,index)=>{
      if(count>=EVENT_MIN_COUNT||!bucket.length)return;
      if(index)rows.push({type:'day',date:C.plus(today,index),tomorrow:index===1});
      rows.push(...bucket);count+=bucket.length;
    });
    return rows;
  }
  function when(event,locale,hour24,multiDay) {
    const part=(date,time)=>{
      const value=new Date(`${date}T${time}:00`);
      const clock=value.toLocaleTimeString(locale,{hour:'numeric',minute:'2-digit',hour12:!hour24});
      return multiDay?`${value.toLocaleDateString(locale,{month:'short',day:'numeric'})}, ${clock}`:clock;
    };
    return `${part(event.date,event.time)} – ${part(event.endDate,event.endTime)}`;
  }
  function calendar(data,t,locale,now,hour24) {
    const rows=calendarRows(window.CalendarPrefs?CalendarPrefs.events(data):data.events,now);
    const list=rows.map(row=>{
      if(row.type==='day') {
        const label=cal().parse(row.date).toLocaleDateString(locale,row.tomorrow?{month:'short',day:'numeric'}:{weekday:'short',month:'short',day:'numeric'});
        return `<div class="calw-day">${e(row.tomorrow?`${t('Tomorrow')}, ${label}`:label)}</div>`;
      }
      const event=row.event,title=event.title.trim()||t('(No title)');
      if(event.allDay)return `<button class="calw-all-day" data-action="widget-calendar-event" data-id="${e(event.id)}" data-date="${e(event.date)}" aria-label="${e(title)}"><strong>${e(title)}</strong></button>`;
      return `<button class="calw-event${row.inProgress?' in-progress':''}" data-action="widget-calendar-event" data-id="${e(event.id)}" data-date="${e(event.date)}" aria-label="${e(title)}"><i class="calw-chip"></i><span><strong>${e(title)}</strong><small>${e(when(event,locale,hour24,row.multiDay))}</small>${event.location?`<small>${e(event.location)}</small>`:''}</span></button>`;
    }).join('');
    const weekday=now.toLocaleDateString(locale,{weekday:'short'}),date=now.toLocaleDateString(locale,{month:'short',day:'numeric'});
    return `<div class="calw" data-no-translate><button class="calw-header" data-action="widget-calendar-open" aria-label="${e(t('Calendar'))}"><span class="calw-weekday">${e(weekday)}</span><span class="calw-date">${e(date)}</span></button><div class="calw-list" data-widget-scroll>${list||`<button class="calw-empty" data-action="widget-calendar-open">${e(t('No upcoming calendar events'))}</button>`}</div></div>`;
  }

  /* MediaAppWidgetProvider: before playback starts the title is hidden and the
     artist line asks the user to choose music; the left area opens the player. */
  function music(state,tracks,active,t,preview=false) {
    const track=tracks[state.track]||tracks[0];
    const info=active?`<strong>${e(track.title)}</strong><span>${e(track.artist)}</span>`:`<span>${e(t('Touch to select music.'))}</span>`;
    const markup=`<div class="musw" data-no-translate><button class="musw-info" data-action="widget-music-open" aria-label="${e(t('Music'))}">${info}</button><i class="musw-divider"></i><button class="musw-control" data-action="widget-music-play" aria-label="${e(t(state.playing?'Pause':'Play'))}"><img src="assets/music-ic_appwidget_music_${state.playing?'pause':'play'}.png" alt=""></button><i class="musw-divider"></i><button class="musw-control musw-next" data-action="widget-music-next" aria-label="${e(t('Next track'))}"><img src="assets/music-ic_appwidget_music_next.png" alt=""></button></div>`;
    // Drawer and drag previews sit inside a button, so they must not contain controls.
    return preview?markup.replace(/<button[^>]*?class="([^"]*)"[^>]*>/g,'<span class="$1">').replace(/<\/button>/g,'</span>'):markup;
  }

  /* Gallery2 widget types: one cropped picture, an album stack or all pictures shuffled. */
  function seeded(text) {
    let seed=[...String(text)].reduce((hash,char)=>Math.imul(hash^char.charCodeAt(0),16777619),2166136261)>>>0;
    return ()=>{seed=seed+0x6d2b79f5>>>0;let value=seed;value=Math.imul(value^value>>>15,value|1);value^=value+Math.imul(value^value>>>7,value|61);return((value^value>>>14)>>>0)/4294967296;};
  }
  function photoItems(data,widget) {
    const photos=Array.isArray(data.photos)?data.photos:[];
    if(!('source' in widget))return photos.slice(0,1);
    if(widget.source==='photo')return photos.filter(photo=>photo.id===widget.photo);
    if(widget.source==='album')return window.ICSMedia.photos(data,widget.album);
    if(widget.source==='shuffle') {
      const random=seeded(widget.id),items=[...photos];
      for(let i=items.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[items[i],items[j]]=[items[j],items[i]];}
      return items;
    }
    return [];
  }
  const wrap=(index,length)=>length?(index%length+length)%length:0;
  function photo(data,widget,index,t) {
    const items=photoItems(data,widget);
    if(!items.length)return `<div data-no-translate class="phw phw-empty"><span class="phw-card">${e(t('No photos.'))}</span></div>`;
    const media=window.ICSMedia;
    if(!('source' in widget)||widget.source==='photo')return `<div data-no-translate class="phw phw-single"><button class="phw-frame" data-action="widget-photo-open" data-id="${items[0].id}" aria-label="${e(items[0].name)}"><img src="${media.image(items[0])}" alt=""></button></div>`;
    const current=wrap(index,items.length),visible=Math.min(3,items.length);
    const cards=Array.from({length:visible},(_,depth)=>items[wrap(current+depth,items.length)]).reverse();
    return `<div data-no-translate class="phw phw-stack" data-photo-stack="${e(widget.id)}" data-count="${items.length}">${cards.map((item,i)=>{const depth=visible-1-i;return `<button class="phw-card${depth?"":" phw-front"}" style="--depth:${depth}" data-action="widget-photo-open" data-id="${item.id}" aria-label="${e(item.name)}" ${depth?'tabindex="-1" aria-hidden="true"':''}><img src="${media.image(item)}" alt=""></button>`;}).join('')}</div>`;
  }
  function photoOverlay(data,ui,t) {
    const scrim='<div class="settings-dialog-scrim" data-action="widget-photo-cancel"></div>';
    const cancel=`<div class="settings-dialog-actions"><button data-action="widget-photo-cancel">${e(t('Cancel'))}</button></div>`;
    const media=window.ICSMedia;
    if(ui.overlay==='widget-photo-type')return `${scrim}<div class="settings-dialog phw-dialog" role="dialog" aria-label="${e(t('Choose images'))}"><h3>${e(t('Choose images'))}</h3>${[['album','Choose an album'],['photo','Choose an image'],['shuffle','Shuffle all images']].map(([id,label])=>`<button class="phw-choice" data-action="widget-photo-type" data-id="${id}" role="radio" aria-checked="false"><span>${e(t(label))}</span><img src="assets/btn_radio_off_holo_dark.png" alt=""></button>`).join('')}${cancel}</div>`;
    if(ui.overlay==='widget-photo-album') {
      const albums=['camera','pictures'].map(key=>[key,media.photos(data,key)]).filter(([,items])=>items.length);
      return `${scrim}<div class="settings-dialog phw-dialog" role="dialog" aria-label="${e(t('Choose an album'))}"><h3>${e(t('Choose an album'))}</h3>${albums.map(([key,items])=>`<button class="phw-album" data-action="widget-photo-album" data-id="${key}"><img src="${media.image(items[0])}" alt=""><span>${e(t(key==='camera'?'Camera':'Pictures'))}<small>${items.length}</small></span></button>`).join('')||`<p>${e(t('No photos.'))}</p>`}${cancel}</div>`;
    }
    if(ui.overlay==='widget-photo-image')return `${scrim}<div class="settings-dialog phw-dialog" role="dialog" aria-label="${e(t('Choose an image'))}"><h3>${e(t('Choose an image'))}</h3><div class="phw-picker">${(data.photos||[]).map(item=>`<button data-action="widget-photo-image" data-id="${item.id}" aria-label="${e(item.name)}"><img src="${media.image(item)}" alt=""></button>`).join('')||`<p>${e(t('No photos.'))}</p>`}</div>${cancel}</div>`;
    return '';
  }
  window.ICSWidgets={MAX_DAYS,EVENT_MIN_COUNT,calendarRows,when,calendar,music,photoItems,photo,photoOverlay,wrap};
})();
