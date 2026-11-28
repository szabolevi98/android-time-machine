/* Clock (IMM76I DeskClock.apk), moved out of simulator.js (docs/plans/engine-migration.md). desk-clock.js draws the
   clock face, the alarm list, SetAlarm and the dialogs; this module is the app around it:
   - the alarm list, SetAlarm (time through the framework's TimePickerDialog, ics-calendar.js's pickers), repeat, ringtone
     and label dialogs, Delete alarm
   - AlarmAlertFullScreen: an alarm due rings over whatever is on screen (also over the keyguard), Snooze (10 min) or
     Dismiss; an alarm without repeat days turns itself off once rung
   - the clock face's time and date every second. */
(() => {
  'use strict';

  function editAlarm(c, id) {
    const {ui, data, render} = c;
    ui.alarmDraft=ICSDeskClock.normalize(data.alarms.find(alarm=>alarm.id===Number(id)));
    ui.sub='alarm-edit'; ui.overlay=''; render();
  }
  function checkAlarms(c, now) {
    const {ui, data, save, renderOverlay, clone} = c;
    if(ui.overlay==='clock-ringing')return;
    const alarm=data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
  }

  ICS.register('clock', {
    scroller: '.desk-scroll',
    render(c) { const {data, ui, i18n, deviceDate} = c; return ICSDeskClock.render(data,ui,key=>i18n.t(key),i18n.locale(),deviceDate()); },
    overlay(c) {
      const {ui, data, i18n, deviceDate} = c;
      if (ui.overlay.startsWith('clock-')) return ICSDeskClock.overlay(ui,key=>i18n.t(key),{hour24:!!data.settings.hour24,locale:i18n.locale(),now:deviceDate()});
    },
    mountOverlay(c, root) { if(c.ui.overlay==='clock-ringing')ICSDeskClock.bindRinging?.(root); },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, i18n, deviceDate} = c, {id} = button.dataset;
      switch (action) {
        case 'clock-alarms': ui.sub='alarms'; render(); break;
        case 'clock-dim': ui.clockDim=!ui.clockDim; render(); break;
        case 'alarm-new': editAlarm(c); break;
        case 'alarm-edit': editAlarm(c, id); break;
        case 'alarm-cancel': ui.alarmDraft=null; ui.sub='alarms'; render(); break;
        case 'alarm-draft-toggle': ui.alarmDraft[id]=!ui.alarmDraft[id]; render(); break;
        // SetAlarm's time preference opens the framework's TimePickerDialog (Holo dark, like DeskClock).
        case 'alarm-field': if(id==='time'){ui.icsPicker=ICSPickers.fromValue('time',ICSDeskClock.normalize(ui.alarmDraft).time,{theme:'dark',setAction:'alarm-time-pick',hour24:!!data.settings.hour24});ui.overlay='icpk';renderOverlay();break;} ui.overlay='clock-'+id; renderOverlay(); break;
        case 'alarm-time-pick': ui.alarmDraft.time=ICSPickers.hhmm(ui.icsPicker); ui.overlay=''; renderOverlay(); render(); break;
        case 'alarm-save': {
          const alarm=ICSDeskClock.normalize(ui.alarmDraft); delete alarm.snoozedUntil; delete alarm.lastFiredMinute;
          const index=data.alarms.findIndex(item=>item.id===alarm.id);
          if(index<0){alarm.id=Date.now();data.alarms.push(alarm);}else data.alarms[index]=alarm;
          save(); ui.alarmDraft=null; ui.sub='alarms'; render(); toast('Alarm set'); break;
        }
        case 'alarm-delete': ui.overlay='clock-delete'; renderOverlay(); break;
        case 'alarm-confirm-delete': data.alarms=data.alarms.filter(alarm=>alarm.id!==ui.alarmDraft.id); save(); ui.alarmDraft=null; ui.overlay=''; ui.sub='alarms'; render(); break;
        case 'alarm-snooze': {
          const alarm=data.alarms.find(item=>item.id===ui.ringingAlarm.id);
          if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+10*60000;save();}
          ui.overlay='';render();{const message=ICSDeskClock.snoozeMessage(new Date(alarm?.snoozedUntil||deviceDate().getTime()+600000),{hour24:!!data.settings.hour24,locale:i18n.locale()});if(message)toast(message);}break;
        }
        case 'alarm-dismiss': ui.overlay=''; render(); break;
        case 'alarm-toggle': { const alarm = data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, render} = c;
      switch (form.dataset.form) {
        case 'alarm-days': ui.alarmDraft.days=values.getAll('days').map(Number);ui.overlay='';render();break;
        case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';render();break;
        case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';render();break;
        default: return false;
      }
      return true;
    },
    back(c) {
      const {ui, render} = c;
      if (ui.overlay) return false;
      if (ui.view === 'clock' && ui.sub === 'alarm-edit') { ui.alarmDraft=null; ui.sub='alarms'; render(); return true; }
      return false;
    },
    // Every second: a due alarm rings; the clock face's time and date follow the device clock.
    second(c, now) {
      const {data, i18n} = c;
      checkAlarms(c, now);
      const deskTime=document.querySelector('.desk-time');
      if(deskTime) {
        deskTime.textContent=now.toLocaleTimeString(i18n.locale(),{hour:'2-digit',minute:'2-digit',hour12:!data.settings.hour24});
        document.querySelector('.desk-date').textContent=now.toLocaleDateString(i18n.locale(),{weekday:'long',month:'long',day:'numeric'});
      }
    },
    clearData(c) { c.data.alarms=c.clone(c.defaults.alarms); }
  });
})();
