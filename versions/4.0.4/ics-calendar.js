/* Calendar (IMM76I Calendar.apk), moved out of simulator.js (docs/plans/engine-migration.md). calendar.js draws the
   Day, Week, Month and Agenda views, the event and the editor; this module is the app around it:
   - a sideways swipe on the view, the arrows or Today move the date; the action bar's views and menu, Search
   - the editor: From / To through the framework's DatePickerDialog / TimePickerDialog (ics-pickers.js, also DeskClock's
     time picker: the overlay 'icpk' is drawn here), the repeat / reminder spinners, a repeating event's This / Future /
     All when editing or deleting it
   - AlertService: a status-bar notification at an event's reminder time while the page runs. */
(() => {
  'use strict';

  function calendarRender(c) {
    c.render();
    const timeline=c.viewport.querySelector('.cal-time-scroll');
    if(timeline)timeline.scrollTop=c.dp(8*48/.85);
  }
  function calendarMove(c, direction) {
    const {ui} = c;
    const mode=ui.calendarMode || 'Month';
    if(mode==='Month') {const date=ICSCalendar.parse(ui.selectedDate);date.setDate(1);date.setMonth(date.getMonth()+direction);ui.selectedDate=ICSCalendar.iso(date);}
    else ui.selectedDate=ICSCalendar.plus(ui.selectedDate,direction*(mode==='Week'?7:1));
    calendarRender(c);
  }
  function deleteEventScope(c, scope) {
    const {ui, data, save} = c;
    const series=data.events.find(item=>item.id===ui.selectedEvent);if(!series)return;
    const item=ICSCalendar.instance(series,ui.selectedInstance);
    if(scope==='this')series.exdates=[...new Set([...(series.exdates||[]),item.date])];
    else if(scope==='future'&&item.date!==item.seriesStart)series.until=ICSCalendar.plus(item.date,-1);
    else data.events=data.events.filter(event=>event.id!==series.id);
    save();ui.overlay='';ui.sub='';calendarRender(c);
  }
  // Calendar AlertService: a status-bar notification at the reminder time while the page is running.
  function checkReminders(c, now) {
    const {ui, data, save, renderStatus, renderOverlay, i18n} = c;
    data.calendarFired=Array.isArray(data.calendarFired)?data.calendarFired.slice(-60):[];
    for(const {key,event} of ICSCalendar.dueReminders(data.events,now,data.calendarFired)) {
      data.calendarFired.push(key);
      const when=event.allDay?i18n.t('All day'):`${event.time} – ${event.endTime}`;
      data.notifications.unshift({id:Date.now()+data.notifications.length,title:event.title,detail:[when,event.location].filter(Boolean).join(' · '),kind:'calendar',eventId:event.id,date:event.date});
      save();renderStatus();if(ui.overlay==='shade')renderOverlay();
    }
  }
  function calendarEdit(c, item) {
    const {ui, render} = c;
    ui.eventDraft=ICSCalendar.normalize(item || {date:ui.selectedDate,time:'12:00',title:''});
    ui.calendarError='';ui.overlay='';ui.sub='event-edit';render();
  }

  ICS.register('calendar', {
    scroller: '.cal-scroll',
    render(c) { const {data, ui, i18n, deviceDate} = c; return ICSCalendar.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate()); },
    mount(c, root) { const timeline = root.querySelector('.cal-time-scroll'); if (timeline) timeline.scrollTop = c.dp(8*48/.85); },
    overlay(c) {
      const {ui, i18n} = c;
      // The framework's DatePickerDialog / TimePickerDialog (Calendar's From / To, DeskClock's alarm time).
      if (ui.overlay === 'icpk') return ICSPickers.render(ui.icsPicker, i18n.locale());
      if (ui.overlay.startsWith('calendar-')) return ICSCalendar.overlay(ui,key=>i18n.t(key));
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, i18n, viewport, screen, dp, today} = c, {id} = button.dataset;
      switch (action) {
        case 'calendar-prev': calendarMove(c, -1); break;
        case 'calendar-next': calendarMove(c, 1); break;
        case 'calendar-day': ui.selectedDate=id;ui.calendarMode=data.calendarMode='Day';save();calendarRender(c);break;
        case 'calendar-today': ui.selectedDate=today();calendarRender(c);break;
        // Calendar's From / To buttons: the picker starts at the form's value; Set writes it back and, like EditEventView,
        // moves the end with the start so the event keeps its length.
        // The repeat / reminder spinners (calendar.js): the list opens under the field (a dialog on 5.1) and the pick goes
        // straight into the form's hidden input, as the date and time pickers do.
        case 'calspin': {
          const form=viewport.querySelector('form[data-form="event"]');if(!form)break;
          const draft={...ICSCalendar.normalize(ui.eventDraft||{}),...Object.fromEntries(new FormData(form))};
          // Spinner's drop-down (Widget.Holo.Spinner: ListPopupWindow, no drop-down offsets): PopupWindow.findDropDownPosition
          // first has the event's ScrollView bring the spinner and the list into view (requestRectangleOnScreen), then opens the
          // list below the spinner when it fits, otherwise on the side with more room, and ListPopupWindow.getMaxAvailableHeight
          // caps its height at that room between the status bar and the navigation bar. Rows are 48 dp.
          const items=ICSCalendar.spinner(id,draft,i18n.locale(),key=>i18n.t(key)),content=items.length*dp(48);
          const sr=screen.getBoundingClientRect(),k=screen.clientWidth/sr.width,scroller=button.closest('.cal-scroll');
          if(scroller){const v=scroller.getBoundingClientRect(),a=button.getBoundingClientRect(),top=a.top,bottom=a.bottom+content/k;
            if(bottom>v.bottom&&top>v.top)scroller.scrollTop+=Math.min(bottom-v.bottom,top-v.top);else if(top<v.top)scroller.scrollTop-=v.top-top;}
          const b=button.getBoundingClientRect(),above=(b.top-sr.top)*k,below=(b.bottom-sr.top)*k;
          const room={below:screen.clientHeight-c.navRoot.offsetHeight-below,above:above-c.statusRoot.offsetHeight},onTop=content>room.below&&room.above>room.below;
          const height=Math.min(content,onTop?room.above:room.below);
          ui.calSpin={field:id,value:form.elements[id].value,items,title:button.getAttribute('aria-label')||'',left:(b.left-sr.left)*k,width:b.width*k,top:onTop?above-height:below,height};
          ui.overlay='calendar-spinner';renderOverlay();break;
        }
        case 'calspin-pick': {
          const form=viewport.querySelector('form[data-form="event"]'),sp=ui.calSpin;
          if(form&&sp){form.elements[sp.field].value=id;const field=form.querySelector(`[data-action="calspin"][data-id="${sp.field}"]`);if(field)field.textContent=sp.items.find(item=>item.value===id)?.label||'';}
          ui.overlay='';renderOverlay();break;
        }
        case 'calpick': {
          const form=viewport.querySelector('form[data-form="event"]'),value=form?.elements[id]?.value||'';
          ui.icsPicker=ICSPickers.fromValue(/date/i.test(id)?'date':'time',value||(/date/i.test(id)?ui.selectedDate:'09:00'),{field:id,theme:'light',setAction:'calpick-set',hour24:!!data.settings.hour24});
          ui.overlay='icpk';renderOverlay();break;
        }
        case 'icpk-step': ICSPickers.step(ui.icsPicker,id);renderOverlay();break;
        case 'calpick-set': {
          const form=viewport.querySelector('form[data-form="event"]'),p=ui.icsPicker;ui.overlay='';renderOverlay();if(!form||!p)break;
          const get=name=>form.elements[name].value,stamp=(d,t)=>new Date(`${d}T${t||'00:00'}`).getTime();
          const before=stamp(get('date'),get('time')),length=stamp(get('endDate'),get('endTime'))-before;
          form.elements[p.field].value=p.kind==='date'?ICSPickers.iso(p):ICSPickers.hhmm(p);
          if(p.field==='date'||p.field==='time'){const end=new Date(stamp(get('date'),get('time'))+Math.max(0,length||0));form.elements.endDate.value=ICSCalendar.iso(end);form.elements.endTime.value=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;}
          for(const name of ['date','time','endDate','endTime'])form.querySelector(`[data-action="calpick"][data-id="${name}"]`).textContent=/date/i.test(name)?ICSCalendar.dateButton(get(name),i18n.locale()):ICSCalendar.timeButton(get(name),i18n.locale(),!!data.settings.hour24);
          break;
        }
        case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
        case 'calendar-mode': ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender(c);break;
        case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input').focus();break;
        case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit(c, {date,time,title:''});break;}
        case 'event-new': calendarEdit(c);break;
        case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
        case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none'){ui.overlay='calendar-edit-scope';renderOverlay();} else calendarEdit(c, series); break; }
        case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit(c, {...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
        case 'event-delete-scope': deleteEventScope(c, id); break;
        case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender(c);break;
        case 'event-delete': ui.overlay=ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'calendar-delete-scope':'calendar-delete';renderOverlay();break;
        case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender(c);break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, toast} = c;
      switch (form.dataset.form) {
        case 'event': {
          const event={...ui.eventDraft,id:ui.eventDraft?.id || Date.now(),title:String(values.get('title')||'').trim(),date:String(values.get('date')),time:String(values.get('time')),endDate:String(values.get('endDate')),endTime:String(values.get('endTime')),allDay:values.has('allDay'),location:String(values.get('location')||'').trim(),description:String(values.get('description')||'').trim()};
          ui.eventDraft=event;
          if(!ICSCalendar.valid(event)){ui.calendarError='End must be after start';render();return true;}
          event.repeat=String(values.get('repeat')||'none');event.reminder=Number(values.get('reminder')??-1);
          // Guests, the time zone ('' is the device's) and Show me as / Privacy (5.1's Visibility holds both).
          event.guests=String(values.get('guests')||'').trim();event.tz=String(values.get('tz')||'');
          if(values.has('visibility')){const [privacy,availability]=String(values.get('visibility')).split(':').map(Number);event.privacy=privacy||0;event.availability=availability||0;}else{event.availability=Number(values.get('availability')||0);event.privacy=Number(values.get('privacy')||0);}
          const {scope,instance,seriesStart}=event;delete event.scope;delete event.instance;delete event.seriesStart;
          const existing=data.events.findIndex(item=>item.id===event.id);
          if(scope&&existing>=0){
            const series=data.events[existing];
            if(scope==='this'){series.exdates=[...new Set([...(series.exdates||[]),instance])];event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
            else if(scope==='future'&&instance!==seriesStart){series.until=ICSCalendar.plus(instance,-1);event.id=Date.now();delete event.exdates;delete event.until;data.events.push(event);}
            else {const shift=Math.round((ICSCalendar.parse(event.date)-ICSCalendar.parse(instance))/864e5),span=Math.round((ICSCalendar.parse(event.endDate)-ICSCalendar.parse(event.date))/864e5);event.date=ICSCalendar.plus(seriesStart,shift);event.endDate=ICSCalendar.plus(event.date,span);data.events[existing]=event;}
          } else if(existing<0)data.events.push(event);else data.events[existing]=event;
          save();ui.selectedDate=event.date;ui.selectedEvent=event.id;ui.selectedInstance=scope&&scope!=='all'?event.date:instance||'';ui.eventDraft=null;ui.sub='event';render();toast('Event saved');break;
        }
        case 'calendar-search': ui.calendarSearch=String(values.get('query')||'').trim();render();break;
        default: return false;
      }
      return true;
    },
    input(event, c) {
      if(event.target.closest('.cal-editor') && event.target.name) {
        c.ui.eventDraft[event.target.name]=event.target.type==='checkbox'?event.target.checked:event.target.value;
        return true;
      }
    },
    back(c) {
      const {ui} = c;
      if (ui.overlay) return false;
      if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender(c);return true; }
      return false;
    },
    // A sideways swipe on the view moves the date by a month, week or day.
    pointermove(event, p, dx, dy, c) {
      const {ui, screen, viewport, dp} = c;
      if(ui.view==='calendar' && !ui.sub && !ui.overlay && !p.scrolling && p.target.closest('[data-calendar-swipe]') && Math.abs(dx)>dp(14) && Math.abs(dx)>Math.abs(dy)*1.2) {
        p.calendarSwiping=true;c.suppressClick(350);event.preventDefault();
        try{screen.setPointerCapture(event.pointerId);}catch{}
        const surface=viewport.querySelector('[data-calendar-swipe]');surface.style.transform=`translateX(${dx}px)`;return true;
      }
    },
    pointerup(event, p, dx, dy, c) {
      if(p.calendarSwiping){if(Math.abs(dx)>c.dp(53))calendarMove(c, dx<0?1:-1);else c.viewport.querySelector('[data-calendar-swipe]').style.transform='';c.suppressClick(350);return true;}
    },
    pointercancel(c) { const surface=c.viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform=''; },
    second(c, now) { checkReminders(c, now); },
    clearData(c) { c.data.events=c.clone(c.defaults.events); }
  });
})();
