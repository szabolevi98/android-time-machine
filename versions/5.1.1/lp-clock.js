/* Clock (DeskClock) on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the alarm, clock, timer and stopwatch pages and their swipe; cities and their search; the clock settings
   - the alarm editor, its time picker dial, ringtone and label; the ringing alarm (snooze, dismiss, silence after)
   - alarms and timers, checked by the device clock's tick (lp.checkAlarms, lp.checkTimers); Back; Clear data */
'use strict';
LP.define('clock', ({
  clone, defaultData, deviceDate, dp, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, screen, toast,
  ui, viewport
}, lp) => {
  // 4.2 DeskClock pages; the alarm list and editor keep the ICS AlarmClock/SetAlarm screens.
  const jbClockState = () => { lp.data.jbClock ||= {tab: 'clock', timers: [], stopwatch: {accumulated: 0, started: null, laps: []}}; return {...lp.data.jbClock, timerDigits: ui.timerDigits || '', timerSetup: !!ui.timerSetup}; };
  // DeskClock's settings (clock-prefs): the analog style and the Home clock reach the clock page through its state.
  const clockExtras = state => ({...state, home: ClockPrefs.home(lp.data, Date.now(), i18n.locale()), analog: ClockPrefs.prefs(lp.data).style === 'analog' ? ClockPrefs.analog(deviceDate()) : ''});
  function renderClock() {
    if (ui.sub === 'clock-settings') return ClockPrefs.settings({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale(), color: JBDeskClock.SPECTRUM[deviceDate().getHours()]});
    if (ui.sub === 'night') return ClockPrefs.night({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), hour24: !!lp.data.settings.hour24, date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'})});
    if (ui.sub === 'cities') return JBDeskClock.cities({...jbClockState(), cityQuery: ui.cityQuery}, key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!lp.data.settings.hour24, words: {title: i18n.t('Cities'), selected: i18n.t('Selected Cities')}});
    const clockState = {...jbClockState(), alarmPage: KKDeskClock.page(lp.data.alarms, {expandedId: ui.kdcExpanded, t: key => i18n.t(key), locale: i18n.locale(), hour24: !!lp.data.settings.hour24, normalize: ICSDeskClock.normalize})};
    return JBDeskClock.render(clockExtras(clockState), key => i18n.t(key), {locale: i18n.locale(), now: deviceDate(), hour24: !!lp.data.settings.hour24, alarm: lp.nextAlarmLabel(), date: deviceDate().toLocaleDateString(i18n.locale(), {weekday: 'short', month: 'short', day: 'numeric'}).toLocaleUpperCase(i18n.locale())});
  }
  let clockFrame = 0, clockSilenceTimer = 0;
  function clockTicker() {
    cancelAnimationFrame(clockFrame);
    const step = () => {
      const root = viewport.querySelector('.jbclock-app');
      if (!root || ui.view !== 'clock') return;
      JBDeskClock.tick(root, lp.data.jbClock, Date.now(), key => i18n.t(key));
      clockFrame = requestAnimationFrame(step);
    };
    clockFrame = requestAnimationFrame(step);
  }
  // TimerReceiver: a finished timer posts "Time's up" and shows its alert in the Timer page.
  function checkTimers() {
    const now = Date.now();
    for (const timer of lp.data.jbClock?.timers || []) {
      if (timer.state !== 'running' || JBDeskClock.remaining(timer, now) > 0) continue;
      Object.assign(timer, {state: 'done', left: 0, started: null});
      lp.data.notifications.unshift({id: now + lp.data.notifications.length, title: i18n.t("Time's up"), detail: i18n.t('Timer'), kind: 'timer'}); save();
      lp.renderStatus(); if (ui.overlay === 'shade') renderOverlay();
      if (ui.view === 'clock') { lp.data.jbClock.tab = 'timer'; render(); }
      toast("Time's up");
    }
  }
  // Label and ringtone edits from a 4.4 alarm card go straight into that alarm.
  function kdcCommit() {
    if (!ui.kdcEditing) return;
    const alarm = lp.data.alarms.find(item => item.id === ui.kdcEditing);
    if (alarm) { alarm.label = ui.alarmDraft.label; alarm.tone = ui.alarmDraft.tone; save(); }
    ui.kdcEditing = null; ui.alarmDraft = null;
  }
  function checkAlarms(now) {
    if(ui.overlay==='clock-ringing')return;
    const alarm=lp.data.alarms.find(alarm=>ICSDeskClock.due(alarm,now));
    if(!alarm)return;
    alarm.lastFiredMinute=Math.floor(now.getTime()/60000);
    delete alarm.snoozedUntil;
    if(!ICSDeskClock.normalize(alarm).days.length)alarm.enabled=false;
    ui.ringingAlarm=clone(alarm); save(); ui.overlay='clock-ringing'; renderOverlay();
    // Silence after: an alarm left ringing stops by itself.
    clearTimeout(clockSilenceTimer); { const after = Number(ClockPrefs.prefs(lp.data).silence), ringing = ui.ringingAlarm; if (after > 0) clockSilenceTimer = setTimeout(() => { if (ui.overlay === 'clock-ringing' && ui.ringingAlarm === ringing) { ui.overlay = ''; render(); } }, after * 60000); }
  }
  let kdcDialDrag = false;
  const kdcDialPick = event => { const dial = overlayRoot.querySelector('[data-kdc-dial]'); if (!dial || !ui.kdcPicker) return; const r = dial.getBoundingClientRect(); ui.kdcPicker = KKDeskClock.pick(ui.kdcPicker, (event.clientX - r.left) * dial.offsetWidth / r.width, (event.clientY - r.top) * dial.offsetHeight / r.height, dial.offsetWidth, !!lp.data.settings.hour24); renderOverlay(); };
  overlayRoot.addEventListener('pointerdown', event => { if (!event.target.closest('[data-kdc-dial]') || event.target.closest('button')) return; kdcDialDrag = true; event.preventDefault(); kdcDialPick(event); });
  window.addEventListener('pointermove', event => { if (kdcDialDrag) kdcDialPick(event); });
  window.addEventListener('pointerup', () => { if (!kdcDialDrag) return; kdcDialDrag = false; if (ui.kdcPicker?.mode === 'hour') { ui.kdcPicker.mode = 'minute'; setTimeout(renderOverlay, 120); } });
  Object.assign(lp, {checkAlarms, checkTimers});
  return {
    clearData() {
      lp.data.alarms=clone(defaultData.alarms);
      return false;
    },
    overlay(name, root) {
      if (ui.overlay === 'kdc-picker' && ui.kdcPicker) {
        overlayRoot.innerHTML = KKDeskClock.picker(ui.kdcPicker, {t: key => i18n.t(key), hour24: !!lp.data.settings.hour24, accent: ui.kdcPicker.zen ? '#009688' : undefined});
        return true;
      }
      if (ui.overlay.startsWith('clock-')) {
        overlayRoot.innerHTML = ICSDeskClock.overlay(ui,key=>i18n.t(key),{hour24:!!lp.data.settings.hour24,locale:i18n.locale(),now:deviceDate()});
        if(ui.overlay==='clock-ringing')ICSDeskClock.bindRinging?.(overlayRoot);
        return true;
      }
      return false;
    },
    pointerup(event, dx) {
      if(lp.pointerStart.clockSwiping){const tabs=JBDeskClock.TABS,index=tabs.indexOf(lp.data.jbClock?.tab||'clock'),next=Math.max(0,Math.min(tabs.length-1,index+(Math.abs(dx)>dp(50)?(dx<0?1:-1):0)));lp.data.jbClock.tab=tabs[next];save();render();lp.suppressClickUntil=Date.now()+350;lp.pointerStart=null;return true;}
      return false;
    },
    pointermove(event, dx, dy) {
      if((lp.pointerStart.clockSwiping || ui.view==='clock' && !ui.sub && !ui.overlay && lp.pointerStart.target.closest('[data-jbclock-swipe]') && Math.abs(dx)>dp(13) && Math.abs(dx)>Math.abs(dy)*1.2)) {
        lp.pointerStart.clockSwiping=true;lp.suppressClickUntil=Date.now()+350;event.preventDefault();
        try{screen.setPointerCapture(event.pointerId);}catch{}
        const track=viewport.querySelector('.jbclock-track'),index=JBDeskClock.TABS.indexOf(lp.data.jbClock?.tab||'clock');
        if(track){track.style.transition='none';track.style.transform=`translateX(calc(${-index*100}% + ${dx}px))`;}return true;
      }
      return false;
    },
    input(event) {
      if (event.target.matches?.('[data-city-search]')) { ui.cityQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-city-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return true; }
      if (event.target.matches?.('[data-cpref-volume]')) { ui.clockDraft = Number(event.target.value); return true; }
      return false;
    },
    backCities() {
      if (ui.view === 'clock' && ui.sub === 'cities') { ui.sub = ''; render(); return true; }
      return false;
    },
    back() {
      if (ui.view === 'clock' && !ui.overlay && ClockPrefs.back(ui)) { render(); return true; }
      if (ui.view === 'clock' && ui.sub === 'cities' && ui.cityQuery !== undefined && !ui.overlay) { ui.cityQuery = undefined; render(); return true; }
      return false;
    },
    render() {
      return renderClock();
    },
    afterRender() {
      if (ui.view === 'clock' && viewport.querySelector('.jbclock-app')) clockTicker();
      return false;
    },
    overlays: {
      ...Object.fromEntries(['jbclock-cities-menu', 'cpref-main'].map(name => [name, () => {
        const items = ClockPrefs.menu(ui.overlay === 'cpref-main' ? 'main' : 'cities', {data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), tab: jbClockState().tab});
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu">${items.map(([action, id, label]) => `<button data-action="${action}" data-id="${id}">${safe(label)}</button>`).join('')}</div>`;
      }])),
    },
    click(action, button, event) {
      const {id} = button.dataset;
      if (action.startsWith('cpref-') && ui.view === 'clock') {
        const result = ClockPrefs.handle(action, id, {data: lp.data, ui});
        if (['cpref-main', 'jbclock-cities-menu'].includes(ui.overlay)) { ui.overlay = ''; renderOverlay(); }
        if (result === 'save') save();
        if (result?.open) { openApp('chrome'); lp.navigateBrowser(result.open); return; }
        if (result) { render(); return; }
      }
      switch (action) {
        case 'clock-alarms': jbClockState(); lp.data.jbClock.tab='alarm'; save(); ui.sub=''; render(); break;
        case 'kdc-add': { const now=deviceDate(); ui.kdcPicker={id:null,hour:now.getHours(),minute:now.getMinutes(),mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
        case 'kdc-time': { const alarm=ICSDeskClock.normalize(lp.data.alarms.find(item=>item.id===Number(id))); const [h,m]=alarm.time.split(':').map(Number); ui.kdcPicker={id:alarm.id,hour:h,minute:m,mode:'hour'}; ui.overlay='kdc-picker'; renderOverlay(); break; }
        case 'kdc-picker-mode': ui.kdcPicker.mode=id; renderOverlay(); break;
        case 'kdc-picker-ampm': { const p=ui.kdcPicker; const pm=id?id==='pm':p.hour<12; p.hour=p.hour%12+(pm?12:0); renderOverlay(); break; }
        case 'kdc-picker-cancel': ui.kdcPicker=null; ui.overlay=''; renderOverlay(); break;
        case 'kdc-picker-done': {
          // AlarmClockFragment.onTimeSet: an edited alarm is switched on; a new one is added, enabled and expanded.
          const p=ui.kdcPicker, time=`${String(p.hour).padStart(2,'0')}:${String(p.minute).padStart(2,'0')}`;
          if(p.zen){lp.data.settings[p.zen==='start'?'zenStart':'zenEnd']=time;delete lp.data.settings.zenDowntimed;save();ui.kdcPicker=null;ui.overlay='';render();renderOverlay();break;}
          if(p.id){const alarm=lp.data.alarms.find(item=>item.id===p.id); if(alarm){alarm.time=time;alarm.enabled=true;delete alarm.snoozedUntil;}}
          else{const alarm=ICSDeskClock.normalize({time,enabled:true});alarm.id=Date.now();lp.data.alarms.push(alarm);ui.kdcExpanded=alarm.id;}
          save(); ui.kdcPicker=null; ui.overlay=''; render(); toast('Alarm set'); break;
        }
        case 'kdc-expand': ui.kdcExpanded=ui.kdcExpanded===Number(id)?null:Number(id); render(); break;
        case 'kdc-repeat': { const alarm=lp.data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; const days=ICSDeskClock.normalize(alarm).days; alarm.days=days.length?[]:[0,1,2,3,4,5,6]; save(); render(); break; }
        case 'kdc-day': { const [alarmId,day]=id.split(':').map(Number); const alarm=lp.data.alarms.find(item=>item.id===alarmId); if(!alarm)break; const days=new Set(ICSDeskClock.normalize(alarm).days); days.has(day)?days.delete(day):days.add(day); alarm.days=[...days].sort(); save(); render(); break; }
        case 'kdc-vibrate': { const alarm=lp.data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; alarm.vibrate=!ICSDeskClock.normalize(alarm).vibrate; save(); render(); break; }
        case 'kdc-label': case 'kdc-tone': { const alarm=lp.data.alarms.find(item=>item.id===Number(id)); if(!alarm)break; ui.alarmDraft=ICSDeskClock.normalize(alarm); ui.kdcEditing=alarm.id; ui.overlay=action==='kdc-label'?'clock-label':'clock-tone'; renderOverlay(); break; }
        case 'kdc-delete': lp.data.alarms=lp.data.alarms.filter(alarm=>alarm.id!==Number(id)); if(ui.kdcExpanded===Number(id))ui.kdcExpanded=null; save(); render(); toast('Alarm deleted'); break;
        case 'jbclock-tab': jbClockState(); lp.data.jbClock.tab = id; save(); render(); break;
        case 'jbclock-key': ui.timerDigits = JBDeskClock.setupDigits(ui.timerDigits || '', id); render(); break;
        case 'jbclock-setup-cancel': ui.timerSetup = false; ui.timerDigits = ''; render(); break;
        case 'jbclock-setup-start': { const time = JBDeskClock.setupTime(ui.timerDigits || ''); if (!time.ms) break; jbClockState(); lp.data.jbClock.timers.push({id: `t${Date.now()}`, length: time.ms, left: time.ms, started: Date.now(), state: 'running', label: ''}); ui.timerSetup = false; ui.timerDigits = ''; save(); render(); break; }
        case 'jbclock-timer-add': ui.timerSetup = true; ui.timerDigits = ''; render(); break;
        case 'jbclock-timer-toggle': case 'jbclock-timer-plus': { const timers = jbClockState() && lp.data.jbClock.timers, index = timers.findIndex(timer => timer.id === id); if (index < 0) break; timers[index] = JBDeskClock.timerAction(timers[index], action === 'jbclock-timer-plus' ? 'plus' : 'toggle', Date.now()); save(); render(); break; }
        case 'jbclock-timer-delete': jbClockState(); lp.data.jbClock.timers = lp.data.jbClock.timers.filter(timer => timer.id !== id); save(); render(); break;
        case 'jbclock-sw': {
          jbClockState();
          if (id === 'share') {
            const watch = lp.data.jbClock.stopwatch, laps = watch.laps || [], total = JBDeskClock.elapsed(watch, Date.now());
            const text = [`${i18n.t('Stopwatch')}: ${JBDeskClock.formatStopwatch(total)}`, ...laps.map((lap, i) => `# ${i + 1}  ${JBDeskClock.formatStopwatch(lap - (laps[i - 1] || 0))}`)].join('\n');
            openApp('messaging'); ui.sub = 'new'; lp.messageDraft().body = text; save(); render(); break;
          }
          lp.data.jbClock.stopwatch = JBDeskClock.stopwatchAction(lp.data.jbClock.stopwatch, id, Date.now()); save(); render(); break;
        }
        case 'jbclock-menu': ui.overlay = 'cpref-main'; renderOverlay(); break;
        // CitiesActivity: the chosen cities are kept in the clock state; the list keeps its place while ticking them.
        case 'jbclock-cities': ui.cityQuery = undefined; ui.sub = 'cities'; ui.overlay = ''; render(); break;
        case 'jbclock-city': { const list = viewport.querySelector('.jbclock-city-list'), top = list?.scrollTop || 0; jbClockState(); const chosen = lp.data.jbClock.cities ||= []; const at = chosen.indexOf(id); if (at >= 0) chosen.splice(at, 1); else chosen.push(id); save(); render(); const after = viewport.querySelector('.jbclock-city-list'); if (after) after.scrollTop = top; break; }
        case 'jbclock-city-search': ui.cityQuery = ''; render(); viewport.querySelector('[data-city-search]')?.focus(); break;
        case 'jbclock-cities-menu': ui.overlay = 'jbclock-cities-menu'; renderOverlay(); break;
        case 'jbclock-city-sort': jbClockState(); lp.data.jbClock.citySort = lp.data.jbClock.citySort === 'time' ? 'name' : 'time'; save(); ui.overlay = ''; renderOverlay(); render(); break;
        case 'alarm-snooze': {
          const alarm=lp.data.alarms.find(item=>item.id===ui.ringingAlarm.id);
          if(alarm){alarm.enabled=true;alarm.snoozedUntil=deviceDate().getTime()+ClockPrefs.prefs(lp.data).snooze*60000;save();}
          ui.overlay='';render();{const message=ICSDeskClock.snoozeMessage(new Date(alarm?.snoozedUntil||deviceDate().getTime()+ClockPrefs.prefs(lp.data).snooze*60000),{hour24:!!lp.data.settings.hour24,locale:i18n.locale()});if(message)toast(message);}break;
        }
        case 'alarm-dismiss': ui.overlay=''; render(); break;
        case 'alarm-toggle': { const alarm = lp.data.alarms.find(item => item.id === Number(id)); if (alarm) { alarm.enabled = !alarm.enabled; delete alarm.snoozedUntil; } save(); render(); break; }
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'alarm-tone': ui.alarmDraft.tone=String(values.get('tone'));ui.overlay='';kdcCommit();render();break;
        case 'alarm-label': ui.alarmDraft.label=String(values.get('label')||'').trim();ui.overlay='';kdcCommit();render();break;
        default: return false;
      }
      return true;
    }
  };
});
