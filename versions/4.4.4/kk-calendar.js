/* Calendar in the 4.4.4 shell (docs/plans/engine-migration.md): the month, week, day and agenda views (calendar.js)
   and their swipe, events and the editor with its spinners, date / time pickers (dtp.js) and time zone picker
   (tzpicker.js), the settings (calendar-prefs.js), the reminders it posts, the Calendar widget's taps and Back, moved
   out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {calendarEdit, data, deviceDate, dp, i18n, navRoot, openApp, overlayRoot, render, renderOverlay, renderStatus, save, screen, statusRoot, toast, today, ui, viewport} = c;
    function renderCalendar() {
      // Settings and Calendars to display (calendar-prefs.js).
      if (ui.sub === 'calendar-settings') return CalendarPrefs.render(data, ui, key => i18n.t(key), GmailApp.account, '4.4.4');
      return ICSCalendar.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate());
    }
    function calendarRender() {
      render();
      const timeline=viewport.querySelector('.cal-time-scroll');
      if(timeline)timeline.scrollTop=dp(8*48/.906);
    }
    function calendarMove(direction) {
      const mode=ui.calendarMode || 'Month';
      if(mode==='Month') {const date=ICSCalendar.parse(ui.selectedDate);date.setDate(1);date.setMonth(date.getMonth()+direction);ui.selectedDate=ICSCalendar.iso(date);}
      else ui.selectedDate=ICSCalendar.plus(ui.selectedDate,direction*(mode==='Week'?7:1));
      calendarRender();
    }
    function deleteEventScope(scope) {
      const series=data.events.find(item=>item.id===ui.selectedEvent);if(!series)return;
      const item=ICSCalendar.instance(series,ui.selectedInstance);
      if(scope==='this')series.exdates=[...new Set([...(series.exdates||[]),item.date])];
      else if(scope==='future'&&item.date!==item.seriesStart)series.until=ICSCalendar.plus(item.date,-1);
      else data.events=data.events.filter(event=>event.id!==series.id);
      save();ui.overlay='';ui.sub='';calendarRender();
    }
    // Calendar AlertService: a status-bar notification at the reminder time while the page is running.
    function checkReminders(now) {
      const snoozed=(data.calendarSnoozes||[]).filter(item=>item.at<=now.getTime());
      if(snoozed.length){data.calendarSnoozes=data.calendarSnoozes.filter(item=>!snoozed.includes(item));snoozed.forEach(item=>data.notifications.unshift({id:Date.now()+data.notifications.length,title:item.title,detail:item.detail,kind:'calendar',eventId:item.eventId,date:item.date}));save();renderStatus();if(ui.overlay==='shade')renderOverlay();}
      data.calendarFired=Array.isArray(data.calendarFired)?data.calendarFired.slice(-60):[];
      for(const {key,event} of ICSCalendar.dueReminders(CalendarPrefs.prefs(data).alerts?CalendarPrefs.events(data):[],now,data.calendarFired)) {
        data.calendarFired.push(key);
        const when=event.allDay?i18n.t('All day'):`${event.time} – ${event.endTime}`;
        data.notifications.unshift({id:Date.now()+data.notifications.length,title:event.title,detail:[when,event.location].filter(Boolean).join(' · '),kind:'calendar',eventId:event.id,date:event.date});
        save();renderStatus();if(ui.overlay==='shade')renderOverlay();
      }
    }
    // The time zone picker's context: the language, the 12 / 24 hour clock, the instant now (the set time included) and
    // the Calendar's recent zones (preferences_recent_timezones).
    const tzpContext = () => ({lang: i18n.language, locale: i18n.locale(), hour24: !!data.settings.hour24, recents: data.calRecentTimezones || [],
      now: Date.now() + (data.settings.autoTime === false ? Number(data.settings.timeOffset) || 0 : 0)});
    // Re-renders the picker keeping the search field's focus and caret.
    function renderTzPicker(focus) {
      const input = overlayRoot.querySelector('[data-tzp-search]'), at = input && document.activeElement === input ? input.selectionStart : null;
      renderOverlay();
      const next = overlayRoot.querySelector('[data-tzp-search]');
      if (next && (focus || at !== null)) { next.focus(); const end = at ?? next.value.length; next.setSelectionRange(end, end); }
    }
    return {
      render() {
        return renderCalendar();
      },
      mount(root) {
        if(ui.view==='calendar' && viewport.querySelector('.cal-time-scroll'))viewport.querySelector('.cal-time-scroll').scrollTop=dp(8*48/.906);
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        if (action.startsWith('calpref-') && CalendarPrefs.handle(action, id, {data, ui, save, render, toast, root: viewport, pickZone: zone => { ui.tzp = TimeZonePicker.open(zone, Date.now()); ui.tzpFor = 'home'; ui.overlay = 'tzpicker'; renderTzPicker(true); }})) return;
        switch (action) {
          case 'widget-calendar-open': ui.selectedDate = today(); openApp('calendar'); break;
          case 'widget-calendar-event': { const event = data.events.find(item => String(item.id) === id); if (!event) break; const date = button.dataset.date || event.date; ui.selectedDate = date < today() ? today() : date; openApp('calendar'); ui.selectedEvent = event.id; ui.selectedInstance = date; ui.sub = 'event'; render(); break; }
          case 'calendar-prev': calendarMove(-1); break;
          case 'calendar-next': calendarMove(1); break;
          case 'calendar-day': ui.selectedDate=id;ui.calendarMode=data.calendarMode='Day';save();calendarRender();break;
          case 'calendar-today': ui.selectedDate=today();calendarRender();break;
          // Calendar's From / To buttons open the datetimepicker at the form's value; Done writes it back and, like
          // EditEventView, moves the end with the start so the event keeps its length.
          // The repeat / reminder spinners (calendar.js): the list opens under the field (a dialog on 5.1) and the pick goes
          // straight into the form's hidden input, as the date and time pickers do.
          case 'caltz': ui.tzpFor = ''; ui.tzp = TimeZonePicker.open(id, Number(button.dataset.ms) || Date.now()); ui.overlay = 'tzpicker'; renderTzPicker(true); break;
          case 'tzp-field': TimeZonePicker.focus(ui.tzp, tzpContext()); renderTzPicker(true); break;
          case 'tzp-filter': TimeZonePicker.filter(ui.tzp, id); renderTzPicker(false); break;
          case 'tzp-clear': TimeZonePicker.clear(ui.tzp); renderTzPicker(true); break;
          case 'tzp-pick': {
            // Settings › Home time zone takes the zone (calendar-prefs.js).
            if (ui.tzpFor === 'home') { data.calendarPrefs = {...(data.calendarPrefs || {}), homeTz: id}; ui.tzpFor = ''; data.calRecentTimezones = TimeZonePicker.saveRecent(data.calRecentTimezones, id); save(); ui.overlay = ''; renderOverlay(); render(); break; }
            // onTimeZoneSet: the event takes the zone, the button its label; saveRecentTimezone keeps the last three.
            const form = viewport.querySelector('form[data-form="event"]'), field = form?.querySelector('[data-action="caltz"]');
            if (form) { form.elements.tz.value = id; if (ui.eventDraft) ui.eventDraft.tz = id; }
            if (field) { const ms = TimeZonePicker.millis(id, form.elements.date?.value, form.elements.time?.value); field.dataset.id = id; field.dataset.ms = ms; field.innerHTML = TimeZonePicker.label(id, ms, i18n.language); }
            data.calRecentTimezones = TimeZonePicker.saveRecent(data.calRecentTimezones, id); save();
            ui.overlay = ''; renderOverlay(); break;
          }
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
            const room={below:screen.clientHeight-navRoot.offsetHeight-below,above:above-statusRoot.offsetHeight},onTop=content>room.below&&room.above>room.below;
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
            ui.dtp=DateTimePicker.fromValue(/date/i.test(id)?'date':'time',value||(/date/i.test(id)?ui.selectedDate:'09:00'),{field:id,setAction:'dtp-set',hour24:!!data.settings.hour24});
            ui.overlay='dtp';renderOverlay();break;
          }
          case 'dtp-view': case 'dtp-day': case 'dtp-year': case 'dtp-month': case 'dtp-mode': case 'dtp-ampm': case 'dtp-radial': if(DateTimePicker.handle(action,id,ui.dtp))renderOverlay();break;
          case 'dtp-set': {
            const form=viewport.querySelector('form[data-form="event"]'),p=ui.dtp;ui.overlay='';renderOverlay();if(!form||!p)break;
            const get=name=>form.elements[name].value,stamp=(d,t)=>new Date(`${d}T${t||'00:00'}`).getTime();
            const before=stamp(get('date'),get('time')),length=stamp(get('endDate'),get('endTime'))-before;
            form.elements[p.field].value=p.kind==='date'?DateTimePicker.iso(p):DateTimePicker.hhmm(p);
            if(p.field==='date'||p.field==='time'){const end=new Date(stamp(get('date'),get('time'))+Math.max(0,length||0));form.elements.endDate.value=ICSCalendar.iso(end);form.elements.endTime.value=`${String(end.getHours()).padStart(2,'0')}:${String(end.getMinutes()).padStart(2,'0')}`;}
            for(const name of ['date','time','endDate','endTime'])form.querySelector(`[data-action="calpick"][data-id="${name}"]`).textContent=/date/i.test(name)?ICSCalendar.dateButton(get(name),i18n.locale()):ICSCalendar.timeButton(get(name),i18n.locale(),!!data.settings.hour24);
            break;
          }
          case 'calendar-views': case 'calendar-menu': ui.overlay=action;renderOverlay();break;
          case 'calendar-mode': ui.calendarMode=data.calendarMode=id;save();ui.calendarSearch=undefined;ui.overlay='';calendarRender();break;
          case 'calendar-search': ui.calendarMode='Agenda';ui.calendarSearch='';ui.overlay='';render();viewport.querySelector('.cal-search input').focus();break;
          case 'calendar-slot': {const [date,time]=id.split('|');calendarEdit({date,time,title:''});break;}
          case 'event-new': calendarEdit();break;
          case 'calendar-settings': case 'calendar-visible': ui.overlay=''; renderOverlay(); ui.sub='calendar-settings'; ui.calPref=action==='calendar-visible'?'visible':''; ui.calPrefDialog=''; render(); break;
          case 'event-open': ui.selectedEvent=Number(id);ui.selectedInstance=button.dataset.date||'';ui.sub='event';render();break;
          case 'event-edit': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(series&&ICSCalendar.normalize(series).repeat!=='none'){ui.overlay='calendar-edit-scope';renderOverlay();} else calendarEdit(series); break; }
          case 'event-edit-scope': { const series=data.events.find(item=>item.id===ui.selectedEvent); if(!series)break; const item=ICSCalendar.instance(series,ui.selectedInstance); calendarEdit({...series,date:item.date,endDate:item.endDate,...(id==='this'?{repeat:'none'}:{})}); ui.eventDraft.scope=id; ui.eventDraft.instance=item.date; ui.eventDraft.seriesStart=item.seriesStart; render(); break; }
          case 'event-delete-scope': deleteEventScope(id); break;
          case 'event-cancel': ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();break;
          case 'event-delete': ui.overlay=ICSCalendar.normalize(data.events.find(item=>item.id===ui.selectedEvent)||{}).repeat!=='none'?'calendar-delete-scope':'calendar-delete';renderOverlay();break;
          case 'event-confirm-delete': data.events=data.events.filter(item=>item.id!==ui.selectedEvent);save();ui.overlay='';ui.sub='';calendarRender();break;
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
        switch (form.dataset.form) {
          case 'event': {
            const event={...ui.eventDraft,id:ui.eventDraft?.id || Date.now(),title:String(values.get('title')||'').trim(),date:String(values.get('date')),time:String(values.get('time')),endDate:String(values.get('endDate')),endTime:String(values.get('endTime')),allDay:values.has('allDay'),location:String(values.get('location')||'').trim(),description:String(values.get('description')||'').trim()};
            ui.eventDraft=event;
            if(!ICSCalendar.valid(event)){ui.calendarError='End must be after start';render();return;}
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
      input(event) {
        if (event.target.matches('[data-tzp-search]') && ui.tzp) { TimeZonePicker.input(ui.tzp, event.target.value, tzpContext()); renderTzPicker(true); return true; }
        if(event.target.closest('.cal-editor') && event.target.name) {
          ui.eventDraft[event.target.name]=event.target.type==='checkbox'?event.target.checked:event.target.value;
          return true;
        }
        return false;
      },
      overlay() {
        if (ui.overlay === 'dtp') {
          // Calendar's datetimepicker dialogs (dtp.js).
          overlayRoot.innerHTML = DateTimePicker.render(ui.dtp, i18n.locale(), deviceDate());
        } else if (ui.overlay === 'tzpicker') {
          // Calendar's TimeZonePickerDialog (tzpicker.js).
          overlayRoot.innerHTML = TimeZonePicker.render(ui.tzp, tzpContext());
        } else if (ui.overlay.startsWith('calendar-')) {
          overlayRoot.innerHTML = ICSCalendar.overlay(ui,key=>i18n.t(key));
        } else return false;
        return true;
      },
      back() {
        if (ui.view === 'calendar' && ui.sub === 'calendar-settings' && !ui.overlay) { if (CalendarPrefs.back(ui) === 'leave') { ui.sub = ''; ui.calPref = ''; } render(); return true; }
        if (ui.view === 'calendar' && ui.sub === 'event-edit') { ui.sub=ui.eventDraft?.id?'event':'';ui.eventDraft=null;calendarRender();return true; }
        return false;
      },
      gestureMove(event, dx, dy) {
        if(ui.view==='calendar' && !ui.sub && !ui.overlay && !c.pointerStart.scrolling && c.pointerStart.target.closest('[data-calendar-swipe]') && Math.abs(dx)>dp(13) && Math.abs(dx)>Math.abs(dy)*1.2) {
          c.pointerStart.calendarSwiping=true;c.suppressClickUntil=Date.now()+350;event.preventDefault();
          try{screen.setPointerCapture(event.pointerId);}catch{}
          const surface=viewport.querySelector('[data-calendar-swipe]');surface.style.transform=`translateX(${dx}px)`;return true;
        }
        return false;
      },
      gestureUp(event, dx, dy) {
        if(c.pointerStart.calendarSwiping){if(Math.abs(dx)>dp(50))calendarMove(dx<0?1:-1);else viewport.querySelector('[data-calendar-swipe]').style.transform='';c.suppressClickUntil=Date.now()+350;c.pointerStart=null;return true;}
        return false;
      },
      gestureCancel() {
        const surface=viewport.querySelector('[data-calendar-swipe]');if(surface)surface.style.transform='';
      },
      second(now) {
        checkReminders(now);
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    mount: (c, root) => scope(c).mount(root),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back(),
    gestureMove: (event, dx, dy, c) => scope(c).gestureMove(event, dx, dy),
    gestureUp: (event, dx, dy, c) => scope(c).gestureUp(event, dx, dy),
    gestureCancel: c => scope(c).gestureCancel(),
    second: (now, c) => scope(c).second(now)
  };
  for (const id of ['calendar']) KK.register(id, spec);
})();
