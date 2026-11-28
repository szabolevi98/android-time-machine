/* TODO */
'use strict';
LP.define(['google-search', 'voice-search', 'maps', 'drive', 'keep', 'youtube', 'google-plus', 'earth', 'news-weather', 'google-settings'], ({
  clone, deviceDate, holdDelay, i18n, openApp, render, renderOverlay, save, suppressReleaseClick, toast, ui,
  viewport
}, lp) => {
  // Maps directions and navigation (maps-route.js).
  function mrContext() {
    return {ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), root: viewport, save, render,
      focus: selector => selector && requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  const newsSectionsContext=()=>({data: lp.data,ui,locale:i18n.locale(),t:key=>i18n.t(key),save,render,renderOverlay,toast,article:key=>StockApps.newsArticle(lp.data,key),browser:url=>{openApp('chrome');lp.navigateBrowser(url);}});
  // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
  const mapsPrefsContext = () => ({ui, data: lp.data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
  // Currents / Magazines / Newsstand reading and settings (news-reader.js).
  const newsContext = () => ({app: ui.view, profile: 'newsstand-lp', ui, data: lp.data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.['newsstand']?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, account: 'nexus6.demo@gmail.com', save, render, toast: message => toast(message), unavailable: 'lpx-unavailable', emptyFor: {'My Library': 'No magazines'}, share: (text, subject) => { ui.overlay = ''; renderOverlay(); openApp('messaging'); ui.sub = 'new'; Object.assign(lp.messageDraft(), {body: text, updated: Date.now()}); save(); render(); }});
  // Google+ posting and settings (plus-post.js): Google+ 4.9's New post, own posts and Settings.
  const plusContext = () => { PlusPost.bind(ui); return {ui, data: lp.data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.gplus?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, version: '4.9', me: i18n.t('Me'), account: 'nexus6.demo@gmail.com', now: deviceDate(), locale: i18n.locale(), save, render, thumb: i => StockApps.thumb(i), openMessengerSettings: () => { openApp('messenger'); ui.gpmPrefs = true; render(); }}; };
  // Earth (earth-app.js): Earth 8.0.1's settings, search, My location and Share.
  const earthContext = () => ({ui, data: lp.data, t: key => i18n.t(key), lang: i18n.language, save, render, toast: message => toast(message), earth: '8.0.1', account: 'nexus6.demo@gmail.com', dark: false, dot: 'assets/ea8-bluedot.png', shareTargets: [['messaging', 'Messenger']], share: (app, text, subject) => { ui.overlay = ''; renderOverlay(); openApp(app); ui.sub = 'new'; Object.assign(lp.messageDraft(), {body: text, updated: Date.now()}); save(); render(); }, openLocation: () => { openApp('settings'); ui.sub = 'location'; render(); }});
  document.addEventListener('pointerdown', event => {
    const card = event.target.closest?.('[data-gnow-swipe]');
    if (!card || event.target.closest('button')) return;
    event.stopPropagation();
    const x = event.clientX, y = event.clientY, key = card.dataset.gnowSwipe;
    let dx = 0, moved = false;
    const move = ev => { dx = ev.clientX - x; if (!moved && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(ev.clientY - y)) moved = true; if (moved) { card.style.translate = `${dx}px 0`; card.style.opacity = String(Math.max(0, 1 - Math.abs(dx) / card.clientWidth)); } };
    const end = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', end); window.removeEventListener('pointercancel', end);
      if (moved && Math.abs(dx) > card.clientWidth * .4) { (lp.data.nowDismissed ||= []).push(key); ui.gnowUndo = key; save(); render(); setTimeout(() => { if (ui.gnowUndo === key) { ui.gnowUndo = ''; render(); } }, 6000); }
      else { card.style.translate = ''; card.style.opacity = ''; } };
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', end); window.addEventListener('pointercancel', end);
  }, true);
  // Voice Search listens for three seconds, then asks to try again.
  let voiceTimer = null;
  function listenVoice() {
    clearTimeout(voiceTimer); ui.voiceState = 'listening'; if (ui.view === 'voice-search') render();
    voiceTimer = setTimeout(() => { ui.voiceState = 'retry'; if (ui.view === 'voice-search') render(); }, 3000);
  }
  const keepMoreContext=()=>({data: lp.data,ui,t:key=>i18n.t(key),locale:i18n.locale(),account:GmailApp.account,save,render,renderOverlay,saveNote:saveKeepNote,
    sync(){ui.kpScreen='';openApp('settings');ui.kpSyncReturn=true;ui.sub='sync-google';render();},
    website(url){ui.kpScreen='';openApp('chrome');lp.navigateBrowser(url);},
    send(app,spec){ui.kpScreen='';ui.overlay='';renderOverlay();openApp(app);lp.composeEmail();const draft=(app==='gmail'?lp.data.gmailbox:lp.data.mailbox).find(m=>m.id===ui.emailId);if(draft){draft.body=spec.text;draft.subject=spec.text.split('\n')[0]||'';if(spec.audio)draft.attachment={...clone(spec.audio),kind:'audio',vcard:true};else if(spec.photo)draft.attachment=clone(lp.data.photos.find(p=>p.id===spec.photo));}save();render();}
  });
  const keepCurrent = () => (lp.data.keepNotes || []).find(item => item.id === ui.keepNote);
  // Keeps the editor's text; on leaving, empty list items go and a note without text, items or picture is dropped.
  function saveKeepNote(leaving) {
    const area = viewport.querySelector('.keep-text'), note = keepCurrent();
    if (!note) return;
    if (area) note.text = area.value;
    if (leaving && note.list) note.list = note.list.filter(item => item.text.trim());
    if (leaving && !String(note.text || '').trim() && !(note.list || []).length && !note.photo && !note.audio) lp.data.keepNotes = lp.data.keepNotes.filter(item => item !== note);
    save();
  }
  // A picture goes to the open note, or starts a new picture note from the browse bar.
  function keepAttach(photoId, noteId) {
    let note = (lp.data.keepNotes || []).find(item => item.id === noteId);
    if (!note) { note = {id: 'k' + Date.now(), text: '', color: 0}; lp.data.keepNotes = [note, ...(lp.data.keepNotes || [])]; }
    note.photo = photoId; ui.keepNote = note.id; ui.sub = 'note'; ui.view = 'keep'; save(); render();
  }
  // Show / Hide checkboxes: lines become unchecked items; back to text drops the checked ones when asked to.
  function keepToText(note, dropChecked) { note.text = note.list.filter(item => !(dropChecked && item.checked)).map(item => item.text).join('\n'); delete note.list; }
  // Share contact via Email or Gmail: the app's compose with the contact card among its files.
  // Google Search's settings (lp-search-prefs.js).
  function gsContext() {
    return {ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), account: GmailApp.account, save, render,
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  // YouTube 10's Settings (lp-youtube.js).
  function ytContext() {
    return {ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), save, render,
      closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))};
  }
  // Drive's Send file (the item as an attachment) and Share link (its link as the text) in Gmail, Email or Hangouts.
  function driveShareFile(app, file) {
    if (!file.photo) { lp.shareVcard(app, file); return; }
    const photo = lp.data.photos.find(p => p.id === file.photo); ui.overlay = ''; renderOverlay(); openApp(app); lp.composeEmail();
    const d = lp.mailbox().find(m => m.id === ui.emailId); if (d && photo) (d.files ||= []).push({name: photo.name, mime: 'image/jpeg', size: photo.size || 1843200, photo: clone(photo)}); save(); render();
  }
  function driveShareText(app, text, subject) {
    ui.overlay = ''; renderOverlay();
    if (app === 'hangouts') { openApp('hangouts'); ui.sub = 'new'; lp.messageDraft().body = text; save(); render(); return; }
    openApp(app); lp.composeEmail(); const d = lp.mailbox().find(m => m.id === ui.emailId); if (d) { d.subject = subject; d.body = text; } save(); render();
  }
  Object.assign(lp, {newsContext, driveShareText, driveShareFile, newsSectionsContext, mrContext, keepAttach});
  // lp:code
  return {
    // lp:hooks
    pointerdown(event) {
      // Drive: a held item opens menu_doclist_context.xml for it (lp-drive.js).
      const heldDrive = event.target.closest('[data-drive-hold]');
      if (heldDrive && !ui.overlay && !ui.driveDialog) lp.messageHoldTimer = setTimeout(() => { suppressReleaseClick(); LPDrive.handle('drv-hold', heldDrive.dataset.driveHold, {data: lp.data, ui, save, render, toast, root: viewport}); }, holdDelay(550));
      // lp:pointerdown
      return false;
    },
    contextmenu(event) {
      const driveItem = event.target.closest('[data-drive-hold]');
      if (driveItem && !ui.overlay && !ui.driveDialog) LPDrive.handle('drv-hold', driveItem.dataset.driveHold, {data: lp.data, ui, save, render, toast, root: viewport});
      // lp:contextmenu
      return false;
    },
    input(event) {
      if (PlusPost.input(event.target)) return true;
      if (event.target.matches('[data-gnp-q]') && ui.gnowDraft?.placeDialog) { ui.gnowDraft.placeDialog.q = event.target.value; const at = event.target.selectionStart; render(); const field = viewport.querySelector('[data-gnp-q]'); field?.focus(); field?.setSelectionRange(at, at); return true; }
      if (event.target.matches('[data-gnr-rule]') && ui.gnowDraft?.ruleDialog) { const r = ui.gnowDraft.ruleDialog, key = event.target.dataset.gnrRule, value = event.target.value;
        if (key === 'interval' || key === 'count') { r[key] = Math.max(1, Math.min(key === 'count' ? 730 : 99, Number(value) || 1)); const label = event.target.closest('.gnr-interval'); if (label && key === 'interval') { const keep = event.target.selectionStart; render(); const f = viewport.querySelector('[data-gnr-rule="interval"]'); f?.focus(); try { f?.setSelectionRange(keep, keep); } catch (error) { /* number input */ } } return true; }
        if (key === 'until') { r.until = value; return true; }
        r[key] = Number(value); if (key === 'end' && r.end === 1 && !r.until) r.until = ICSCalendar.iso(new Date(deviceDate().getTime() + 30 * 864e5)); render(); return true; }
      if (event.target.matches('[data-keep-search]')) { ui.keepQuery = event.target.value; const at = event.target.selectionStart; render(); const input = viewport.querySelector('[data-keep-search]'); if (input) { input.focus(); input.setSelectionRange(at, at); } return true; }
      if (event.target.matches('[data-gnr-title]')) { if (ui.gnowDraft) ui.gnowDraft.title = event.target.value; return true; }
      if (event.target.matches('[data-keep-li]')) { const item = keepCurrent()?.list?.[Number(event.target.dataset.keepLi)]; if (item) { item.text = event.target.value; save(); } return true; }
      if (event.target.matches('.keep-text')) { const note = (lp.data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { note.text = event.target.value; save(); } return true; }
      // lp:input
      return false;
    },
    backDrive() {
      if (ui.view === 'drive' && window.LPDrive && LPDrive.back(ui)) { render(); return true; }
      // lp:backDrive
      return false;
    },
    backApps() {
      if (StockApps.APPS.includes(ui.view) && ui.sub) { if (ui.view === 'keep') saveKeepNote(true); ui.sub = ''; render(); return true; }
      // lp:backApps
      return false;
    },
    backNow() {
      if (ui.gnowSpin) { ui.gnowSpin = ''; render(); return true; }
      if (ui.gnowDraft || ui.gnowDialog) { ui.gnowDraft = null; ui.gnowDialog = ''; render(); return true; }
      if(ui.view==='keep' && KeepMore.back(keepMoreContext()))return true;
      // lp:backNow
      return false;
    },
    backYt() {
      if (ui.view === 'youtube' && !ui.overlay && LPYouTube.back(ytContext())) return true;
      if (ui.view === 'google-search' && ui.sub === 'settings' && !ui.overlay && LPSearchPrefs.back(gsContext())) return true;
      // lp:backYt
      return false;
    },
    backNews() {
      if(ui.view==='news-weather'&&!ui.overlay&&NewsSections.back(newsSectionsContext()))return true;
      // lp:backNews
      return false;
    },
    backRoute() {
      if (ui.view === 'maps' && !ui.overlay && (ui.mapsRoute || ui.navRun) && MapsRoute.back(mrContext())) return true;
      // lp:backRoute
      return false;
    },
    backGms() {
      if (ui.view === 'google-settings' && GMSSettings.back(ui)) { render(); return true; }
      // lp:backGms
      return false;
    },
    backMaps() {
      if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return true; }
      // lp:backMaps
      return false;
    },
    backEarth() {
      if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return true; }
      if (ui.view === 'google-plus' && !ui.overlay && PlusPost.back(ui)) { render(); return true; }
      // lp:backEarth
      return false;
    },
    openingVoice(app) {
      if (app === 'voice-search') setTimeout(listenVoice);
      // lp:openingVoice
      return false;
    },
    openingApps(app, resume) {
      if (app === 'google-plus' && !resume) PlusPost.open(ui);
      if (app === 'earth' && !resume) EarthApp.open(ui);
      // lp:openingApps
      return false;
    },
    render() {
      return StockApps.render(ui.view, {earthCtx: ui.view === 'earth' ? earthContext() : null, plusCtx: ui.view === 'google-plus' ? plusContext() : null, ui, data: lp.data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), account: GmailApp.account});
      // lp:render
    },
    afterRenderNews() {
      const newsRoot=viewport.querySelector('[data-news-sections]');
      if(ui.newsSectionsHook&&ui.newsSectionsHook.root!==newsRoot){ui.newsSectionsHook.destroy();ui.newsSectionsHook=null;}
      if(newsRoot&&!ui.newsSectionsHook)ui.newsSectionsHook={...NewsSections.attach(newsRoot,newsSectionsContext()),root:newsRoot};
      if(ui.view==='news-weather'&&ui.newsAdd)NewsSections.mount(viewport);
      // lp:afterRenderNews
      return false;
    },
    mount() {
      if (ui.view === 'earth') EarthApp.mount(viewport, earthContext());
      // lp:mount
      return false;
    },
    beforeRender() {
      if(ui.view!=='keep')window.KeepMore?.leave(ui);
      // lp:beforeRender
      return false;
    },
    click(action, button, event) {
      const {id, app, url} = button.dataset;
      if (action.startsWith('mr-') && window.MapsRoute && MapsRoute.handle(action, id, mrContext())) return;
      if (action.startsWith('drv-') && LPDrive.handle(action, id, {data: lp.data, ui, save, render, renderOverlay, toast, root: viewport, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate(), shareFile: driveShareFile, shareText: driveShareText})) return;
      if(action.startsWith('nwsec-')&&NewsSections.handle(action,id,newsSectionsContext()))return;
      if(action.startsWith('kp-') && KeepMore.handle(action,id,keepMoreContext()))return;
      if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return; }
      if (ui.view === 'google-plus' && action.startsWith('gpp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusPost.handle(action, id, plusContext())) return; }
      if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return;
      if (ui.view === 'youtube' && action.startsWith('yt10-') && LPYouTube.handle(action, id, ytContext())) return;
      if (ui.view === 'google-search' && action.startsWith('lsp-') && LPSearchPrefs.handle(action, id, gsContext())) return;
      // lp:click
      switch (action) {
        // The Google Now Launcher's third overview button opens the Google Search settings (not simulated).
        case 'gnow-drawer': document.querySelectorAll('.gnow-page').forEach(page => page.classList.toggle('drawer-open')); break;
        // Google Now reminders and card settings (gel-now.js).
        case 'gnow-reminders': document.querySelectorAll('.gnow-page.drawer-open').forEach(page => page.classList.remove('drawer-open')); ui.gnowDraft = null; ui.gnowDialog = ''; openApp('google-search'); ui.sub = 'reminders'; render(); break;
        case 'gnow-reminder-new': ui.gnowDraft = {...GELNow.draftFrom(null, deviceDate()), home: lp.data.mapsHome || '', work: lp.data.mapsWork || ''}; ui.gnowSpin = ''; render(); viewport.querySelector('[data-gnr-title]')?.focus(); break;
        case 'gnow-reminder-edit': { const item = (lp.data.nowReminders || []).find(r => r.id === id); if (item) { ui.gnowDraft = {...GELNow.draftFrom(item, deviceDate()), home: lp.data.mapsHome || '', work: lp.data.mapsWork || ''}; ui.gnowSpin = ''; render(); } break; }
        case 'gnow-reminder-spin': ui.gnowSpin = ui.gnowSpin === id ? '' : id; render(); break;
        case 'gnow-reminder-pick': if (id === 'day:3' || id === 'time:5') { const d = ui.gnowDraft; ui.gnowSpin = ''; render(); ui.dtp = DateTimePicker.fromValue(id === 'day:3' ? 'date' : 'time', id === 'day:3' ? (d.date || ICSCalendar.iso(deviceDate())) : (d.time || '09:00'), {field: 'gnow', setAction: 'gnow-dtp-set', hour24: !!lp.data.settings.hour24}); ui.overlay = 'dtp'; renderOverlay(); break; } {
          const [kind, value] = id.split(':'), next = {...ui.gnowDraft, [kind === 'day' ? 'day' : 'slot']: Number(value)}; ui.gnowSpin = ''; if (GELNow.draftReminder({...next, day: kind === 'day' ? next.day : 0, slot: kind === 'time' ? next.slot : 0}, deviceDate())) ui.gnowDraft = next; else toast('Not available in this demo'); render(); break; }
        case 'gnow-dtp-set': { const p = ui.dtp, d = ui.gnowDraft; ui.overlay = ''; renderOverlay(); if (!p || !d) break; if (p.kind === 'date') Object.assign(d, {day: -1, date: DateTimePicker.iso(p)}); else Object.assign(d, {slot: -1, time: DateTimePicker.hhmm(p)}); render(); break; }
        // Where: the location spinner's Home / Work (set once through the place search) and Set location.
        case 'gnow-trigger': if (ui.gnowDraft) { ui.gnowDraft.trigger = id; ui.gnowSpin = ''; render(); } break;
        case 'gnow-place-option': { const d = ui.gnowDraft; if (!d) break; ui.gnowSpin = ''; if (id !== 'custom' && d[id]) d.place = {label: id, address: d[id]}; else d.placeDialog = {kind: id, q: ''}; render(); viewport.querySelector('[data-gnp-q]')?.focus(); break; }
        case 'gnow-place-pick': { const d = ui.gnowDraft, hit = GELNow.PLACES.find(([name]) => name === id); if (!d || !hit) break; const [name, address] = hit, kind = d.placeDialog?.kind;
          if (kind === 'home' || kind === 'work') { lp.data[kind === 'home' ? 'mapsHome' : 'mapsWork'] = address; d[kind] = address; d.place = {label: kind, address}; save(); } else d.place = {name, address};
          d.placeDialog = null; render(); break; }
        case 'gnow-place-close': if (ui.gnowDraft) { ui.gnowDraft.placeDialog = null; render(); } break;
        // Repeat: the recurrence dialog's switch, week days, month pattern and Done.
        case 'gnow-rule-open': { const d = ui.gnowDraft; if (!d) break; const date = GELNow.draftReminder(d, deviceDate())?.date || ICSCalendar.iso(deviceDate()); d.ruleDialog = {...GELNow.ruleFrom(date, d.rule), on: !!d.rule}; render(); break; }
        case 'gnow-rule-switch': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.on = !ui.gnowDraft.ruleDialog.on; render(); } break;
        case 'gnow-rule-day': { const r = ui.gnowDraft?.ruleDialog; if (!r) break; const day = Number(id); r.days = r.days.includes(day) ? (r.days.length > 1 ? r.days.filter(x => x !== day) : r.days) : [...r.days, day].sort(); render(); break; }
        case 'gnow-rule-month': if (ui.gnowDraft?.ruleDialog) { ui.gnowDraft.ruleDialog.monthly = id; render(); } break;
        case 'gnow-rule-cancel': if (ui.gnowDraft) { ui.gnowDraft.ruleDialog = null; render(); } break;
        case 'gnow-rule-done': { const d = ui.gnowDraft, r = d?.ruleDialog; if (!r) break; d.rule = r.on ? {freq: r.freq, interval: r.interval, days: r.days, monthly: r.monthly, end: r.end, until: r.until, count: r.count} : null; d.ruleDialog = null; render(); break; }
        // The appointment card's back: its event in Calendar's editor.
        case 'gnow-event-edit': { const event = (lp.data.events || []).find(item => String(item.id) === String(id)); ui.gnowBack = ''; if (!event) break; openApp('calendar'); ui.selectedEvent = event.id; lp.calendarEdit(event); break; }
        case 'gnow-undo': lp.data.nowDismissed = (lp.data.nowDismissed || []).filter(key => key !== ui.gnowUndo); ui.gnowUndo = ''; save(); render(); break;
        case 'gnow-reminder-cancel': ui.gnowDraft = null; ui.gnowSpin = ''; render(); break;
        case 'gnow-reminder-set': { const draft = ui.gnowDraft, when = draft && GELNow.draftReminder(draft, deviceDate()), title = String(draft?.title || '').trim(); if (!when || !title || (draft.trigger === 'place' && !draft.place)) break; const extra = {occasionally: !!when.occasionally, trigger: draft.trigger || 'time', place: draft.trigger === 'place' ? draft.place : null, rule: draft.trigger === 'place' ? null : draft.rule || null}; const list = lp.data.nowReminders ||= []; const item = list.find(r => r.id === draft.id); if (item) Object.assign(item, {title, ...when, ...extra}); else list.push({id: 'r' + Date.now(), title, ...when, ...extra}); ui.gnowDraft = null; ui.gnowSpin = ''; save(); render(); toast(AndroidStrings.pick(window.StockStrings?.google?.['Reminder saved'], i18n.locale(), 'Reminder saved')); break; }
        case 'gnow-reminder-menu': ui.gnowDialog = id; render(); break;
        case 'gnow-reminder-delete': lp.data.nowReminders = (lp.data.nowReminders || []).filter(r => r.id !== id); ui.gnowDialog = ''; ui.gnowDraft = null; save(); render(); break;
        case 'gnow-dialog-close': ui.gnowDialog = ''; render(); break;
        case 'gnow-card-back': ui.gnowBack = ui.gnowBack === id ? '' : id; render(); break;
        case 'gnow-units': lp.data.nowUnits = Number(id); save(); render(); break;
        case 'gel-overview-settings': document.querySelectorAll('.gnow-page.drawer-open').forEach(page => page.classList.remove('drawer-open')); openApp('google-search'); ui.sub = 'settings'; ui.lsPage = ''; render(); break;
        // Google Settings' Play Games opens the Games app.
        case 'gs-play-games': openApp('play-games'); break;
        // Google Settings › Google+: the Google+ app's settings (plus-post.js).
        case 'gs-plus': openApp('google-plus'); ui.gppPrefs = 'root'; ui.gppDialog = ''; render(); break;
        case 'voice-search': toast('Voice search unavailable offline'); break;
        // Google, Voice Search, Maps, Drive, Keep, YouTube, Google+, Earth, News & Weather, Google Settings
        // Google Settings' GMS pages (gms-settings.js).
        case 'gms-open': ui.gmsParent = ui.sub; ui.sub = `gms-${id}`; ui.gmsDialog = ''; if (id === 'ads' && !lp.data.gms?.adid) { lp.data.gms = {...GMSSettings.state(lp.data), adid: GMSSettings.newId()}; save(); } render(); break;
        case 'gms-toggle': { const s = GMSSettings.state(lp.data); lp.data.gms = {...s, [id]: !s[id]}; save(); render(); break; }
        case 'gms-reset': ui.gmsDialog = ''; lp.data.gms = {...GMSSettings.state(lp.data), adid: GMSSettings.newId()}; save(); render(); break;
        case 'gms-dialog': ui.gmsDialog = id; ui.gmsUnderstand = false; render(); break;
        case 'gms-understand': ui.gmsUnderstand = !ui.gmsUnderstand; render(); break;
        // Data management's choice dialog; Google Fit's Delete history empties the Fit app's history (fit-more.js).
        case 'gms-drive': ui.gmsDialog = ''; lp.data.gms = {...GMSSettings.state(lp.data), driveWifi: id === 'wifi'}; save(); render(); break;
        case 'gms-fit-delete': ui.gmsDialog = ''; if (window.FitMore) FitMore.clearHistory({data: lp.data, locale: i18n.locale(), t: key => i18n.t(key)}); save(); render(); break;
        case 'gms-delete': ui.gmsDialog = ''; ui.gmsDeleting = true; render(); setTimeout(() => { ui.gmsDeleting = false; if (ui.sub === 'gms-history') render(); }, 1500); break;
        case 'voice-listen': listenVoice(); break;
        case 'google-now-toggle': lp.data.googleNowOn = lp.data.googleNowOn === false; save(); render(); break;
        case 'maps-locate': ui.mapsQuery = ''; render(); break;
        // Maps 9.3: the search box's grabber opens the side menu; a layer toggles the map's look.
        case 'maps-panel': ui.mapsPanel = !ui.mapsPanel; render(); break;
        case 'maps-layer': lp.data.mapsLayer = lp.data.mapsLayer === id ? '' : id; save(); render(); break;
        case 'drive-nav': ui.driveNav = !ui.driveNav; render(); break;
        case 'drive-open': ui.driveFrom = ui.sub; ui.driveFile = id; ui.sub = 'file'; render(); break;
        case 'keep-open': ui.keepNote = id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break;
        case 'keep-delete': ui.overlay = ''; renderOverlay(); lp.data.keepNotes = (lp.data.keepNotes || []).filter(note => note.id !== ui.keepNote); ui.sub = ''; save(); render(); break;
        case 'keep-new': { const note = {id: 'k' + Date.now(), text: '', color: 0}; lp.data.keepNotes = [note, ...(lp.data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break; }
        case 'keep-color': { const note = (lp.data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.color = ((note.color || 0) + 1) % 5; save(); render(); } break; }
        case 'keep-archive': { ui.overlay = ''; renderOverlay(); const note = (lp.data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.archived = !note.archived; ui.sub = ''; save(); render(); } break; }
        case 'keep-columns': ui.overlay = ''; renderOverlay(); lp.data.keepSingle = !lp.data.keepSingle; save(); render(); break;
        case 'keep-refresh': ui.overlay = ''; renderOverlay(); render(); break;
        // List and picture notes (stock-apps.js keepEditor / keepDialog).
        case 'keep-new-list': { const note = {id: 'k' + Date.now(), text: '', color: 0, list: []}; lp.data.keepNotes = [note, ...(lp.data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
        case 'keep-li-check': { const item = keepCurrent()?.list?.[Number(id)]; if (item) { item.checked = !item.checked; save(); render(); } break; }
        case 'keep-li-delete': { const note = keepCurrent(); if (note?.list) { note.list.splice(Number(id), 1); save(); render(); } break; }
        case 'keep-grave': ui.keepGraveClosed = !ui.keepGraveClosed; render(); break;
        case 'keep-checkboxes': { ui.overlay = ''; renderOverlay(); const note = keepCurrent(); if (!note) break; saveKeepNote(); if (!note.list) { note.list = String(note.text || '').split('\n').filter(line => line.trim()).map(text => ({text, checked: false})); note.text = ''; } else if (note.list.some(item => item.checked)) ui.keepDialog = 'hide-checkboxes'; else keepToText(note, false); save(); render(); break; }
        case 'keep-hide-keep': case 'keep-hide-delete': { const note = keepCurrent(); ui.keepDialog = ''; if (note?.list) keepToText(note, action === 'keep-hide-delete'); save(); render(); break; }
        case 'keep-picture': saveKeepNote(); ui.keepDialog = 'picture'; render(); break;
        case 'keep-photo-take': { ui.keepDialog = ''; saveKeepNote(); keepAttach(lp.cameraShoot().id, ui.sub === 'note' ? ui.keepNote : ''); break; }
        case 'keep-photo-choose': ui.keepDialog = ''; saveKeepNote(); ui.keepPhotoTo = ui.sub === 'note' ? ui.keepNote : ''; lp.docPick('keep', 'image/*'); break;
        case 'keep-photo-remove': saveKeepNote(); ui.keepDialog = 'remove-photo'; render(); break;
        case 'keep-photo-delete': { ui.keepDialog = ''; const note = keepCurrent(); if (note) { delete note.photo; save(); } render(); break; }
        case 'keep-dialog-close': ui.keepDialog = ''; render(); break;
        case 'keep-drawer': ui.keepDrawer = !ui.keepDrawer; render(); break;
        case 'keep-landing': ui.keepView = id; ui.keepDrawer = false; render(); break;
        case 'yt-video': LPYouTube.watched(id, lp.data); save(); ui.ytFrom = ui.sub; ui.ytVideo = id; ui.ytPaused = false; ui.sub = 'video'; render(); break;
        case 'keep-search-open': case 'keep-search-clear': ui.sub = 'search'; ui.keepQuery = ''; render(); viewport.querySelector('[data-keep-search]')?.focus(); break;
        case 'drive-search-open': ui.sub = 'search'; ui.driveQuery = ''; render(); viewport.querySelector('[data-form="drive-search"] input')?.focus(); break;
        case 'drive-search-clear': ui.sub = ''; ui.driveQuery = ''; render(); break;
        case 'yt-search-open': case 'yt-search-clear': ui.sub = 'search'; if (id !== 'keep') ui.ytQuery = ''; render(); viewport.querySelector('.yt-sv input')?.focus(); break;
        case 'yt-guide': ui.ytGuide = !ui.ytGuide; render(); break;
        case 'yt-toggle': ui.ytPaused = !ui.ytPaused; render(); break;
        case 'yt-like': { const likes = lp.data.ytLikes || []; lp.data.ytLikes = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]; save(); render(); break; }
        case 'gplus-plus': { const plus = lp.data.gplusPlus || []; lp.data.gplusPlus = plus.includes(id) ? plus.filter(x => x !== id) : [...plus, id]; save(); render(); break; }
        case 'news-tab': ui.newsTab = id; ui.newsDrawer = false; render(); break;
        case 'news-drawer': ui.newsDrawer = !ui.newsDrawer; render(); break;
        case 'news-chart': ui.newsChart = id; render(); break;
        case 'earth-search-open': ui.earthSearching = true; render(); viewport.querySelector('.ea8-field input')?.focus(); break;
        case 'earth-clear': ui.overlay = ''; renderOverlay(); ui.earthQuery = ''; render(); break;
        case 'earth-drawer': ui.earthDrawer = !ui.earthDrawer; render(); break;
        case 'gplus-refresh': ui.overlay = ''; renderOverlay(); render(); break;
        case 'news2-expand': ui.newsExpanded = id; render(); break;
        case 'news2-open': ui.newsWeb = id; render(); break;
        // Search's SearchView (stock-apps.js newsSearch): open it focused, clear the query, close it.
        case 'news2-search': ui.newsSearch = true; ui.newsQuery = ''; ui.newsDrawer = false; render(); requestAnimationFrame(() => viewport.querySelector('.nw2-sv input')?.focus()); break;
        case 'news2-search-clear': ui.newsQuery = ''; render(); requestAnimationFrame(() => viewport.querySelector('.nw2-sv input')?.focus()); break;
        case 'news2-search-close': ui.newsSearch = false; ui.newsQuery = ''; render(); break;
        case 'news2-share': { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector(`[data-id="${id}"]`)?.closest('.nw2-expanded')?.querySelector('b')?.textContent || viewport.querySelector('.nw2-article h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; lp.messageDraft().body = title; save(); render(); break; }
        case 'news2-weather-menu': ui.newsMenu = 'weather'; ui.overlay = 'sa-menu'; renderOverlay(); break;
        case 'news2-dialog': ui.overlay = ''; renderOverlay(); ui.newsDialog = id; ui.newsPick = undefined; render(); break;
        case 'news2-pick': { const place = viewport.querySelector('[data-news2-place]')?.value; ui.newsPick = id; render(); const input = viewport.querySelector('[data-news2-place]'); if (input && place !== undefined) input.value = place; break; }
        case 'news2-cancel': ui.newsDialog = ''; ui.newsPick = undefined; render(); break;
        case 'news2-ok': {
          const o = StockApps.news2(lp.data), pick = ui.newsPick ?? (ui.newsDialog === 'weather' ? o.weather : ui.newsDialog === 'unit' ? o.unit : o.wind);
          lp.data.news2 = {...o, ...(ui.newsDialog === 'weather' ? {weather: pick, place: (viewport.querySelector('[data-news2-place]')?.value || '').trim()} : ui.newsDialog === 'unit' ? {unit: pick} : {wind: pick})};
          if (lp.data.news2.weather === 'custom' && !lp.data.news2.place) lp.data.news2.weather = 'auto';
          ui.newsDialog = ''; ui.newsPick = undefined; save(); render(); break;
        }
        case 'news2-theme': ui.overlay = ''; renderOverlay(); lp.data.news2 = {...StockApps.news2(lp.data), dark: !StockApps.news2(lp.data).dark}; save(); render(); break;
        // lp:cases
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'maps-search': ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(lp.data, ui.mapsQuery); save(); render(); break;
        case 'drive-search': { const query = String(values.get('query') || '').trim(); if (!query) return; ui.driveQuery = query; ui.sub = 'results'; render(); break; }
        case 'news2-search': ui.newsQuery = String(values.get('query') || ''); render(); viewport.querySelector('.nw2-sv input')?.blur(); break;
        case 'yt-search': { const query = String(values.get('query') || '').trim(); if (!query) return; LPYouTube.searched(query, lp.data); save(); ui.ytQuery = query; ui.sub = 'results'; render(); break; }
        case 'keep-li-add': { const text = String(values.get('text') || '').trim(), note = keepCurrent(); if (!text || !note?.list) return; note.list.push({text, checked: false}); save(); render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
        case 'keep-add': { const text = String(values.get('text') || '').trim(); if (!text) return; lp.data.keepNotes = [{id: 'k' + Date.now(), text, color: (lp.data.keepNotes || []).length % 5}, ...(lp.data.keepNotes || [])]; save(); render(); break; }
        case 'earth-search': ui.earthSearching = false; EarthApp.search(values.get('query'), earthContext()); render(); break;
        // lp:scases
        default: return false;
      }
      return true;
    }
  };
});
