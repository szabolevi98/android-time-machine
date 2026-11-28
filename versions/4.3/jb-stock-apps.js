/* The Google apps of the Nexus 4 image that stock-apps.js draws (Google Search 2.5, Voice Search, Maps 7, Keep 2.0,
   YouTube 4.5, Google+ 4.0, Earth 7.1, News & Weather 1.4, Google Settings), moved out of simulator.js
   (docs/plans/engine-migration.md): their screens, actions, forms, typing, Back and opening, with the more screens of
   jb-search-prefs.js, jb-youtube.js, keep-more.js, maps-prefs.js, gms-settings.js, news-prefs.js, earth-app.js and
   google-plus's post / messenger code. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, back, cameraShoot, clone, composeEmail, composeGmail, data, defaultData, deviceDate, i18n, keepMoreContext, messageDraft, messengerContext, movieContext, mrContext, openApp, overlayRoot, render, renderOverlay, row, safe, save, shareText, toast, ui, viewport;
  const $bind = c => { $c = c; ({back, cameraShoot, clone, composeEmail, composeGmail, data, defaultData, deviceDate, i18n, keepMoreContext, messageDraft, messengerContext, movieContext, mrContext, openApp, overlayRoot, render, renderOverlay, row, safe, save, shareText, toast, ui, viewport} = c); };
  function listenVoice() {
    clearTimeout(voiceTimer); ui.voiceState = 'listening'; if (ui.view === 'voice-search') render();
    voiceTimer = setTimeout(() => { ui.voiceState = 'retry'; if (ui.view === 'voice-search') render(); }, 3000);
  }
  // Voice Search listens for three seconds, then asks to try again.
  let voiceTimer = null;
  // Keeps the editor's text; on leaving, empty list items go and a note without text, items or picture is dropped.
  function saveKeepNote(leaving) {
    const area = viewport.querySelector('.keep-text'), note = keepCurrent();
    if (!note) return;
    if (area) note.text = area.value;
    if (leaving && note.list) note.list = note.list.filter(item => item.text.trim());
    if (leaving && !String(note.text || '').trim() && !(note.list || []).length && !note.photo && !note.audio) data.keepNotes = data.keepNotes.filter(item => item !== note);
    save();
  }
  // A picture goes to the open note, or starts a new picture note from the browse bar.
  function keepAttach(photoId, noteId) {
    let note = (data.keepNotes || []).find(item => item.id === noteId);
    if (!note) { note = {id: 'k' + Date.now(), text: '', color: 0}; data.keepNotes = [note, ...(data.keepNotes || [])]; }
    note.photo = photoId; ui.keepNote = note.id; ui.sub = 'note'; ui.view = 'keep'; save(); render();
  }
  // Show / Hide checkboxes: lines become unchecked items; back to text drops the checked ones when asked to.
  function keepToText(note, dropChecked) { note.text = note.list.filter(item => !(dropChecked && item.checked)).map(item => item.text).join('\n'); delete note.list; }
  // Share contact via Email or Gmail: the app's compose with the contact card attached.
  // Google Search's settings pages (jb-search-prefs.js); Location services is Google Settings' Location.
  function gsContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), account: GmailApp.account, save, render,
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.')),
      openLocation() { openApp('google-settings'); ui.sub = 'gms-location'; ui.gmsDialog = ''; render(); }};
  }
  // YouTube 4.5's watch page (jb-youtube.js): ACTION_SEND text/plain puts the subject and the link into the app's new message.
  function ytContext() {
    return {ui, data, t: key => i18n.t(key), locale: i18n.locale(), save, render, toast,
      focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
      closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
      unsupported: () => toast(i18n.t('This feature is not part of the simulator.')),
      video: vid => StockApps.VIDEOS.find(v => v.id === vid),
      share(app, subject, text) {
        openApp(app);
        if (app === 'gmail' || app === 'email') { if (app === 'gmail') composeGmail(); else composeEmail(); const d = (app === 'gmail' ? data.gmailbox : data.mailbox).find(m => m.id === ui.emailId); if (d) Object.assign(d, {subject, body: text + (d.body || '')}); }
        else { ui.sub = 'new'; Object.assign(messageDraft(), {body: text, updated: Date.now()}); }
        save(); render();
      }};
  }
  // Earth (earth-app.js): Earth 7.1.1's settings, search, My location and Share.
  const earthContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, save, render, toast: message => toast(message), earth: '7.1.1', account: 'jellybean.demo@gmail.com', dark: true, dot: 'assets/ea7-bluedot.png', shareTargets: [['gmail', 'Gmail'], ['messaging', 'Messaging']], share: (app, text, subject) => { ui.overlay = ''; renderOverlay(); if (app === 'gmail') { shareText('gmail', text, subject); return; } openApp(app); ui.sub = 'new'; Object.assign(messageDraft(), {body: text, updated: Date.now()}); save(); render(); }, openLocation: () => { openApp('settings'); ui.sub = 'location'; render(); }});
  // Google+ posting and settings (plus-post.js): Google+ 4.0's New post, own posts and Settings.
  const plusContext = () => { PlusPost.bind(ui); return {ui, data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.gplus?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, version: '4.0', me: i18n.t('Me'), account: 'jellybean.demo@gmail.com', now: deviceDate(), locale: i18n.locale(), save, render, thumb: i => StockApps.thumb(i), openMessengerSettings: () => { openApp('messenger'); ui.gpmPrefs = true; render(); }}; };
  // Maps' settings screens (maps-prefs.js): the shell's save / render and opening another app's page.
  const mapsPrefsContext = () => ({ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), save, render, renderOverlay, open: (app, sub) => { openApp(app); if (sub) { ui.sub = sub; render(); } }});
  const keepCurrent = () => (data.keepNotes || []).find(item => item.id === ui.keepNote);
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'google-search': case 'voice-search': case 'maps': case 'keep': case 'youtube': case 'google-plus': case 'earth': case 'news-weather': case 'google-settings': return StockApps.render(ui.view, {earthCtx: ui.view === 'earth' ? earthContext() : null, plusCtx: ui.view === 'google-plus' ? plusContext() : null, ui, data, t: key => i18n.t(key), lang: i18n.language, locale: i18n.locale(), now: deviceDate(), account: GmailApp.account});
      }
    },
    mount(c, root) {
      $bind(c);
      if (ui.view === 'earth') EarthApp.mount(viewport, earthContext());
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if(action.startsWith('kp-') && KeepMore.handle(action,id,keepMoreContext()))return true;
      if (ui.view === 'earth' && /^(earth|eps)-/.test(action)) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (EarthApp.handle(action, id, earthContext())) return true; }
      if (ui.view === 'google-plus' && action.startsWith('gpp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusPost.handle(action, id, plusContext())) return true; }
      if (action.startsWith('mps-') && window.MapsPrefs?.handle(action, id, mapsPrefsContext())) return true;
      if (ui.view === 'youtube' && action.startsWith('yt4-') && JBYouTube.handle(action, id, ytContext())) return true;
      if (ui.view === 'google-search' && action.startsWith('gsp-') && JBSearchPrefs.handle(action, id, gsContext())) return true;
      switch (action) {
        case 'voice-search': openApp('voice-search'); break;
        case 'gms-open': ui.sub = `gms-${id}`; ui.gmsDialog = ''; render(); break;
        case 'gms-toggle': { const s = GMSSettings.state(data); data.gms = {...s, [id]: !s[id]}; save(); render(); break; }
        case 'gms-dialog': ui.gmsDialog = id; ui.gmsUnderstand = false; render(); break;
        case 'gms-understand': ui.gmsUnderstand = !ui.gmsUnderstand; render(); break;
        case 'gms-delete': ui.gmsDialog = ''; ui.gmsDeleting = true; render(); setTimeout(() => { ui.gmsDeleting = false; if (ui.sub === 'gms-history') render(); }, 1500); break;
        case 'sa-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'voice-listen': listenVoice(); break;
        case 'maps-locate': ui.mapsQuery = ''; render(); break;
        case 'maps-switcher': ui.mapsMenu = 'switcher'; ui.overlay = 'sa-menu'; renderOverlay(); break;
        case 'maps-layers': ui.mapsMenu = 'layers'; ui.overlay = 'sa-menu'; renderOverlay(); break;
        case 'maps-places': openApp('local'); break;
        case 'earth-search-open': ui.earthSearching = true; render(); viewport.querySelector('.sa-earth-field input')?.focus(); break;
        case 'earth-search-close': ui.earthSearching = false; render(); break;
        case 'earth-clear': ui.overlay = ''; renderOverlay(); ui.earthQuery = ''; render(); break;
        case 'gplus-refresh': ui.overlay = ''; renderOverlay(); render(); break;
        case 'maps-feature': ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); if (id === 'local' || id === 'navigation') openApp(id); else { data.mapsLayer = id === 'traffic' ? 'traffic' : ''; save(); render(); } break;
        case 'maps-layer': ui.overlay = ''; ui.mapsMenu = ''; renderOverlay(); data.mapsLayer = data.mapsLayer === id ? '' : id; save(); render(); break;
        case 'maps-clear': ui.overlay = ''; renderOverlay(); ui.mapsQuery = ''; ui.mapsSearching = false; data.mapsLayer = ''; save(); render(); break;
        case 'maps-zoom': { const map = viewport.querySelector('.sa-maps6-map .sa-map'); if (map) { ui.mapsZoom = Math.max(1, Math.min(3, (ui.mapsZoom || 1) * (Number(id) > 0 ? 1.4 : 1 / 1.4))); map.style.transform = `scale(${ui.mapsZoom})`; } break; }
        case 'keep-open': ui.keepNote = id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break;
        case 'keep-delete': ui.overlay = ''; renderOverlay(); data.keepNotes = (data.keepNotes || []).filter(note => note.id !== ui.keepNote); ui.sub = ''; save(); render(); break;
        case 'keep-new': { const note = {id: 'k' + Date.now(), text: '', color: 0}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.keep-text')?.focus(); break; }
        case 'keep-color': { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.color = ((note.color || 0) + 1) % 5; save(); render(); } break; }
        case 'keep-archive': { ui.overlay = ''; renderOverlay(); const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { saveKeepNote(); note.archived = !note.archived; ui.sub = ''; save(); render(); } break; }
        case 'keep-columns': ui.overlay = ''; renderOverlay(); data.keepSingle = !data.keepSingle; save(); render(); break;
        case 'keep-refresh': ui.overlay = ''; renderOverlay(); render(); break;
        case 'keep-new-list': { const note = {id: 'k' + Date.now(), text: '', color: 0, list: []}; data.keepNotes = [note, ...(data.keepNotes || [])]; ui.keepNote = note.id; ui.sub = 'note'; render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
        case 'keep-li-check': { const item = keepCurrent()?.list?.[Number(id)]; if (item) { item.checked = !item.checked; save(); render(); } break; }
        case 'keep-li-delete': { const note = keepCurrent(); if (note?.list) { note.list.splice(Number(id), 1); save(); render(); } break; }
        case 'keep-checkboxes': { ui.overlay = ''; renderOverlay(); const note = keepCurrent(); if (!note) break; saveKeepNote(); if (!note.list) { note.list = String(note.text || '').split('\n').filter(line => line.trim()).map(text => ({text, checked: false})); note.text = ''; } else if (note.list.some(item => item.checked)) ui.keepDialog = 'hide-checkboxes'; else keepToText(note, false); save(); render(); break; }
        case 'keep-hide-keep': case 'keep-hide-delete': { const note = keepCurrent(); ui.keepDialog = ''; if (note?.list) keepToText(note, action === 'keep-hide-delete'); save(); render(); break; }
        case 'keep-photo-take': { ui.keepDialog = ''; saveKeepNote(); keepAttach(cameraShoot().id, ui.sub === 'note' ? ui.keepNote : ''); break; }
        case 'keep-photo-remove': saveKeepNote(); ui.keepDialog = 'remove-photo'; render(); break;
        case 'keep-photo-delete': { ui.keepDialog = ''; const note = keepCurrent(); if (note) { delete note.photo; save(); } render(); break; }
        case 'keep-dialog-close': ui.keepDialog = ''; render(); break;
        case 'keep-archived': ui.overlay = ''; renderOverlay(); ui.keepArchived = true; render(); break;
        case 'yt-video': ui.ytFrom = ui.sub; ui.ytVideo = id; ui.ytPaused = false; ui.sub = 'video'; render(); break;
        case 'yt-search-open': case 'yt-search-clear': ui.sub = 'search'; if (id !== 'keep') ui.ytQuery = ''; render(); viewport.querySelector('.yt-sv input')?.focus(); break;
        case 'yt-toggle': ui.ytPaused = !ui.ytPaused; render(); break;
        case 'yt-like': ui.overlay = ''; renderOverlay(); { const vid = id || ui.ytVideo, likes = data.ytLikes || []; data.ytLikes = likes.includes(vid) ? likes.filter(x => x !== vid) : [...likes, vid]; save(); render(); break; }
        case 'gplus-plus': { const plus = data.gplusPlus || []; data.gplusPlus = plus.includes(id) ? plus.filter(x => x !== id) : [...plus, id]; save(); render(); break; }
        case 'news-tab': ui.newsTab = id; render(); break;
        case 'sa-menu': ui.mapsMenu = ''; ui.overlay = 'sa-menu'; renderOverlay(); break;
        case 'sa-news-refresh': ui.overlay = ''; renderOverlay(); NewsPrefs.refresh(data, deviceDate().getTime()); save(); render(); toast(AndroidStrings.pick(window.StockStrings?.news?.['Updating news topics…'], i18n.language, 'Updating news topics…')); break;
        case 'news-settings': ui.overlay = ''; renderOverlay(); ui.newsSub = 'settings'; ui.nwpScreen = 'root'; ui.nwpDialog = ''; render(); break;
        case 'news-story': ui.newsSub = 'story'; ui.newsStory = id; render(); break;
        case 'news-share': { ui.overlay = ''; renderOverlay(); const title = viewport.querySelector('.nwp-story h2')?.textContent || ''; openApp('messaging'); ui.sub = 'new'; messageDraft().body = title; save(); render(); break; }
        case 'nwp-open': case 'nwp-toggle': case 'nwp-topic': case 'nwp-remove': case 'nwp-dialog': case 'nwp-cancel': case 'nwp-choose': case 'nwp-ok': case 'nwp-unsupported':
          NewsPrefs.handle(action, id, {ui, data, lang: i18n.language, save, render, input: () => viewport.querySelector('[data-nwp-input]')?.value, unsupported: () => toast(i18n.t('This feature is not part of the simulator.'))}); break;
        case 'maps-search-open': ui.mapsSearching = true; render(); viewport.querySelector('.sa-maps6-search input')?.focus(); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      switch (form.dataset.form) {
        case 'maps-search': ui.mapsQuery = String(values.get('query') || '').trim().slice(0, 60); window.MapsPrefs?.remember(data, ui.mapsQuery); save(); render(); break;
        case 'yt-search': { const query = String(values.get('query') || '').trim(); if (!query) return true; JBYouTube.searched(query, data); save(); ui.ytQuery = query; ui.sub = 'results'; render(); break; }
        case 'keep-li-add': { const text = String(values.get('text') || '').trim(), note = keepCurrent(); if (!text || !note?.list) return true; note.list.push({text, checked: false}); save(); render(); viewport.querySelector('.kp-ed-add input')?.focus(); break; }
        case 'keep-add': { const text = String(values.get('text') || '').trim(); if (!text) return true; data.keepNotes = [{id: 'k' + Date.now(), text, color: (data.keepNotes || []).length % 5}, ...(data.keepNotes || [])]; save(); render(); break; }
        case 'earth-search': ui.earthSearching = false; EarthApp.search(values.get('query'), earthContext()); render(); break;
        default: return false;
      }
      return true;
    },
    input(event, c) {
      $bind(c);
      if (event.target.matches('[data-keep-li]')) { const item = keepCurrent()?.list?.[Number(event.target.dataset.keepLi)]; if (item) { item.text = event.target.value; save(); } return true; }
      if (event.target.matches('.keep-text')) { const note = (data.keepNotes || []).find(item => item.id === ui.keepNote); if (note) { note.text = event.target.value; save(); } return true; }
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'google-search' && ui.voiceFromSettings && ui.sub === 'settings' && !ui.overlay && !(ui.gsStack || []).length) { ui.voiceFromSettings = false; openApp('settings'); ui.sub = 'language'; render(); return true; }
      if (ui.view === 'earth' && !ui.overlay && EarthApp.back(ui)) { render(); return true; }
      if (ui.view === 'google-plus' && !ui.overlay && PlusPost.back(ui)) { render(); return true; }
      if ((ui.view === 'maps' || ui.view === 'latitude') && !ui.overlay && window.MapsPrefs?.back(ui)) { render(); return true; }
      if (ui.chromeReturn && ui.view === ui.chromeReturn.view && ui.sub === ui.chromeReturn.sub && !ui.overlay) { const back = ui.chromeReturn; ui.chromeReturn = null; openApp('chrome'); ui.sub = 'chrome-settings'; ui.chromePrefStack = back.stack; render(); return true; }
      if (ui.view === 'google-settings' && GMSSettings.back(ui)) { render(); return true; }
      if (ui.view === 'maps' && !ui.overlay && ui.mapsRoute && MapsRoute.back(mrContext())) return true;
      // News & Weather: a settings dialog or nested screen, then the settings or the story page.
      if (ui.view === 'news-weather' && ui.newsSub && !ui.overlay) { if (!(ui.newsSub === 'settings' && NewsPrefs.back(ui))) { ui.newsSub = ''; ui.nwpScreen = ''; } render(); return true; }
      if (ui.overlay) return false;
      if (ui.view === 'youtube' && !ui.overlay && JBYouTube.back(ytContext())) return true;
      if (ui.view === 'google-search' && ui.sub === 'settings' && !ui.overlay && JBSearchPrefs.back(gsContext())) return true;
      if (ui.view === 'youtube' && ui.sub === 'video' && ui.ytFrom === 'results') { ui.sub = 'results'; ui.ytFrom = ''; render(); return true; }
      if(ui.view==='keep' && KeepMore.back(keepMoreContext()))return true;
      if (ui.view === 'keep' && ui.keepDialog) { ui.keepDialog = ''; render(); return true; }
      if (StockApps.APPS.includes(ui.view) && ui.sub) { if (ui.view === 'keep') saveKeepNote(true); ui.sub = ''; render(); return true; }
      if (ui.view === 'keep' && ui.keepArchived) { ui.keepArchived = false; render(); return true; }
      return false;
    },
    open(c, resume, app) {
      $bind(c);
      if (app === 'google-plus' && !resume) PlusPost.open(ui);
      if (app === 'earth' && !resume) EarthApp.open(ui);
    },
    // Opening, once the core has checked the phone is not locked.
    openUnlocked(c, resume, app) {
      $bind(c);
      if (app === 'news-weather' && !resume) { ui.newsSub = ''; ui.nwpScreen = ''; ui.nwpDialog = ''; }
      if (app === 'voice-search') setTimeout(listenVoice);
      if (app === 'keep' && !Array.isArray(data.keepNotes)) data.keepNotes = clone(defaultData.keepNotes);
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay === 'sa-menu') {
        // The Google apps' action bar overflow (StockApps.menu: their menu XML's overflow items).
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu">${(ui.view === 'messenger' ? PlusMessenger.menu(messengerContext()) : ui.view === 'movie-studio' ? MovieStudio.menu(movieContext()) : StockApps.menu(ui.view, {ui, data, t: key => i18n.t(key), locale: i18n.locale(), now: deviceDate()})).map(item => `<button data-action="${item.action}"${item.id != null ? ` data-id="${safe(item.id)}"` : ''}>${safe(item.title)}</button>`).join('')}</div>`;
      }
      else return;
      return true;
    },
    exports: {
      saveKeepNote: (c, ...args) => { $bind(c); return saveKeepNote(...args); }
    }
  };
  JB.register('google-search', spec);
  JB.register('voice-search', spec);
  JB.register('maps', spec);
  JB.register('keep', spec);
  JB.register('youtube', spec);
  JB.register('google-plus', spec);
  JB.register('earth', spec);
  JB.register('news-weather', spec);
  JB.register('google-settings', spec);
})();
