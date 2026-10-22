/* CalendarGooglePrebuilt widget provider data, shared by the schedule/month renderers.
   Dates use local civil days so DST does not shift widget cells; provider snapshots are never mutated. */
(() => {
  'use strict';
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parse=s=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(s||''))return null;const [y,m,d]=s.split('-').map(Number),at=new Date(y,m-1,d);return iso(at)===s?at:null;};
  const add=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
  function range(e){const start=parse(e?.date);if(!start)return null;const end=parse(e.endDate)||new Date(start),hm=(v,f)=>/^\d{2}:\d{2}$/.test(v||'')?v.split(':').map(Number):f;
    if(e.allDay){if(!e.endDate)end.setDate(end.getDate()+1);}else{const [h,m]=hm(e.start,[0,0]);start.setHours(h,m);const [eh,em]=hm(e.end,[h+1,m]);end.setHours(eh,em);if(end<=start)end.setDate(end.getDate()+1);}return {start,end};}
  function dayEvents(events,day){const next=add(day,1);return events.filter(e=>{const r=range(e);return r&&r.start<next&&r.end>day&&!e.deleted&&!e.done;}).sort((a,b)=>Number(!!b.allDay)-Number(!!a.allDay)||range(a).start-range(b).start);}
  function agenda(events,now=new Date()){const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()),out=[];for(let n=0;n<31;n++){const at=add(day,n),items=dayEvents(events,at).filter(e=>range(e).end>now);if(n===0||items.length)out.push({date:iso(at),events:items});}return out;}
  function month(events,at,firstDay){const first=new Date(at.getFullYear(),at.getMonth(),1),start=add(first,-((first.getDay()-firstDay+7)%7)),weeks=Math.ceil((((first.getDay()-firstDay+7)%7)+new Date(at.getFullYear(),at.getMonth()+1,0).getDate())/7);return Array.from({length:weeks*7},(_,i)=>{const date=add(start,i);return {date:iso(date),day:date.getDate(),outside:date.getMonth()!==at.getMonth(),events:dayEvents(events,date)};});}
  NG.calendarWidgetData={iso,parse,add,range,agenda,month};
})();
