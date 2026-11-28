/* The ICS image's Google apps drawn by ics-google-apps.js (from its template): Google+ (with plus-post.js's New post and
   Settings), Talk, YouTube, Play Books, Play Movies, Google Search and Voice Dialer, moved out of simulator.js
   (docs/plans/engine-migration.md). One module for the seven screens, as ics-google-apps.js is one: their action bar
   overflow, controls, forms and fields, Back through their pages, a fresh start's reset (Voice Dialer starts
   listening), Books' Read aloud stopping once the reader is left. */
(() => {
  'use strict';
  let voiceDialTimer = null;
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    // Google+, Talk, YouTube, Play Books / Movies, Search, Voice Dialer and Latitude (ics-google-apps.js).
    function googleAppsContext() {
      return {plus: ui.view === 'google-plus' ? plusContext() : null, data, ui, view: ui.view, lang: i18n.language, account: ICSGmail.account, now: deviceDate().getTime(), t: key => i18n.t(key), save, render, renderOverlay, toast, openApp,
        closeOverlay() { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } },
        focus(selector) { requestAnimationFrame(() => viewport.querySelector(selector)?.focus()); },
        browse(query) { openApp('browser'); c.navigateBrowser(`search:${query}`); },
        // The Play Store (Finsky) on a page: Books' About the book and its searches.
        play(next) { openApp('play-store'); c.icsPlayGo(next); },
        // A manual sync (Books' Refresh): the status bar's sync icon while it runs.
        sync(ms) { ui.syncing = true; renderStatus(); setTimeout(() => { ui.syncing = false; renderStatus(); }, ms); },
        // YouTube's Record: the camcorder in VIDEO_CAPTURE with quickCapture, whose clip goes back to YouTube (cameraStop).
        record() { ui.captureFor = 'youtube'; ui.cameraMode = 'video'; ui.cameraModes = false; ui.icsPano = null; openApp('camera'); },
        // ACTION_SEND text/plain: the subject and the text into the chosen app's new message.
        share(app, subject, text) {
          openApp(app);
          if (app === 'gmail') { ICSGmail.handle('g4-compose', '', c.gmailContext()); const d = data.gmail40.find(m => m.id === ui.g4Id); if (d) Object.assign(d, {subject, body: text}); }
          else if (app === 'email') { c.composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) Object.assign(d, {subject, body: text + (d.body || '')}); }
          else { ui.sub = 'new'; Object.assign(c.messageDraft(), {body: text, updated: Date.now()}); }
          save(); render();
        },
        notify(title) { c.notify(title, ''); },
        // Google Search's searchable items open what they find: an app, a page, a contact, a conversation.
        apps: apps.map(([id, name]) => [id, i18n.t(name), iconAssets.has(id) ? `assets/${id}.png` : '']),
        openUrl(url) { openApp('browser'); c.navigateBrowser(url); },
        openContact(id) { openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; render(); },
        openThread(key) { c.openMessageThread(key); render(); },
        listen() { clearTimeout(voiceDialTimer); ui.gaVoice = 'listening'; render(); voiceDialTimer = setTimeout(() => { ui.gaVoice = 'failed'; if (ui.view === 'voice-dialer') render(); }, 3000); }};
    }
    // Google+ posting and settings (plus-post.js): Google+ 2.4's New post, own posts and Settings.
    const plusContext = () => { PlusPost.bind(ui); return {ui, data, t: key => i18n.t(key), S: key => { const row = window.StockStrings?.gplus?.[key]; return row ? AndroidStrings.pick(row, i18n.language, key) : i18n.t(key); }, version: '2.4', me: i18n.t('Me'), account: 'icecream.demo@gmail.com', now: deviceDate(), locale: i18n.locale(), save, render, thumb: i => StockApps.thumb(i), openMessengerSettings: () => { openApp('messenger'); ui.gpmPrefs = true; render(); }}; };

    return {googleAppsContext, plusContext};
  }

  const spec = {
    init(c) { c.googleAppsContext = () => api(c).googleAppsContext(); },
    launch(c, resume, app) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (app === 'google-plus' && !resume) PlusPost.open(ui);
      if (ICSGoogleApps.APPS.includes(app) && !resume) { ui.gaSub = ''; ui.gaYtStack = []; ui.gaYtDialog = null; ui.gaYtDrop = ''; if (app === 'voice-dialer') setTimeout(() => api(c).googleAppsContext().listen()); }
    },
    render(c) { return ICSGoogleApps.render(c.ui.view, api(c).googleAppsContext()); },
    overlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {googleAppsContext} = api(c);
      if (ui.overlay === 'ga-menu') {
        // The ICS Google apps' action bar overflow (their menu XML's never-shown-as-action items).
        return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ga-holo-menu">${ICSGoogleApps.menu(googleAppsContext()).map(item => `<button data-action="${item.action}"${item.id ? ` data-id="${safe(item.id)}"` : ''}${item.disabled ? ' disabled' : ''}${item.checked !== undefined ? ` role="menuitemcheckbox" aria-checked="${item.checked}"` : ''}><span>${safe(item.title)}</span>${item.checked !== undefined ? `<img src="assets/btn_check_${item.checked ? 'on' : 'off'}_holo_dark.png" alt="">` : ''}</button>`).join('')}</div>`;
      }
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {googleAppsContext, plusContext} = api(c), {id} = button.dataset;
      if (ui.view === 'google-plus' && action.startsWith('gpp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (PlusPost.handle(action, id, plusContext())) return true; }
      if (ICSGoogleApps.APPS.includes(ui.view) && action.startsWith('ga-') && ICSGoogleApps.handle(action, id, googleAppsContext())) return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {googleAppsContext} = api(c);
      if (ICSGoogleApps.APPS.includes(ui.view) && ICSGoogleApps.submit(form.dataset.form, values, googleAppsContext())) return true;
    },
    input(event, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {googleAppsContext} = api(c);
      if (PlusPost.input(event.target)) return true;
      // Talk's SearchView and Add friend field: the suggestions follow the query without re-rendering the field.
      if (event.target.closest('.ga-tk-sv')) { ui.gaTalkQ = event.target.value; const box = viewport.querySelector('.ga-tk-extras'), tmp = document.createElement('div'); tmp.innerHTML = ICSGoogleApps.render(ui.view, googleAppsContext()); if (box) box.innerHTML = tmp.querySelector('.ga-tk-extras')?.innerHTML || ''; return true; }
      if (event.target.matches('.ga-tk-add-field')) { ui.gaInvite = event.target.value; return true; }
      if (event.target.matches('[data-ga-bk-bright]')) { data.gaBookPrefs = {...ICSGoogleApps.books.bookPrefs(data), brightness: Number(event.target.value)}; save(); viewport.querySelector('.ga-bk-reader')?.style.setProperty('--bk-dim', ((100 - Number(event.target.value)) / 100 * .7).toFixed(3)); return true; }
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {googleAppsContext} = api(c);
      // Play Books' reader: a dropdown, Display options, then the Contents popup close before the reader does.
      if (ui.view === 'play-books' && ui.gaSub === 'read' && (ui.gaBkSpin || ui.gaBkOptions || ui.gaBkToc)) { if (ui.gaBkSpin) ui.gaBkSpin = ''; else if (ui.gaBkOptions) ui.gaBkOptions = false; else ui.gaBkToc = false; render(); return true; }
      if (ui.view === 'play-books') { ui.gaBkSpin = ''; ui.gaBkOptions = false; ui.gaBkToc = false; }
      // Talk: an open dialog first; Friend info returns to its chat, Blocked friends to Talk settings.
      if (ui.view === 'talk' && (ui.gaTkDialog || ui.gaSub === 'info' || ui.gaSub === 'blocked')) { if (ui.gaTkDialog) ui.gaTkDialog = null; else ui.gaSub = ui.gaSub === 'info' ? 'chat' : 'settings'; render(); return true; }
      if (ui.view === 'google-plus' && !ui.overlay && PlusPost.back(ui)) { render(); return true; }
      if ((ui.view === 'youtube' || ui.view === 'play-movies' || ui.view === 'play-books') && !ui.overlay && ICSGoogleApps.back(googleAppsContext())) return true;
      if (ICSGoogleApps.APPS.includes(ui.view) && ui.gaSub) { ui.gaSub = ''; render(); return true; }
      return false;
    },
    // Before every draw.
    rendering(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      // Read aloud stops once the reader is left.
      if (ui.gaBkAloud && !(ui.view === 'play-books' && ui.gaSub === 'read')) ICSGoogleApps.books.stopAloud(ui);
    },
  };
  for (const id of ['google-plus', 'talk', 'youtube', 'play-books', 'play-movies', 'search', 'voice-dialer']) ICS.register(id, spec);
})();
