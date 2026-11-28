/* Gmail 4.0.4 (the IMM76I image's Gmail.apk: ics-gmail.js and ics-gmail-prefs.js), moved out of simulator.js
   (docs/plans/engine-migration.md): its offline account (data.gmail40), the conversation list with its selection and
   search, a conversation, compose (a draft is kept on Back; Attach picture through the Gallery's picker), the dialogs and
   Settings. */
(() => {
  'use strict';
  function api(c) {
    const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
    // The context Gmail's module renders and acts with.
    function gmailContext() {
      return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), save, render, renderOverlay, toast, t: key => i18n.t(key), account: ICSGmail.account, root: viewport,
        focus: selector => viewport.querySelector(selector)?.focus(), submit: selector => viewport.querySelector(selector)?.requestSubmit(),
        keep: () => ICSGmail.keepDraft(data, ui, viewport.querySelector('.g4-form')), photo: photo => ICSMedia.art(photo),
        pickPicture: () => { openApp('gallery'); ui.galleryPick = 'gmail'; ui.galleryAlbum = ''; render(); }};
    }

    return {gmailContext};
  }

  ICS.register('gmail', {
    init(c) { c.gmailContext = () => api(c).gmailContext(); },
    render(c) { return ICSGmail.render(api(c).gmailContext()); },
    // Its dialogs are drawn as they are (not translated, no launcher clings).
    ownOverlay(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {gmailContext} = api(c);
      if (ui.view === 'gmail' && ui.overlay.startsWith('g4-')) return ICSGmail.overlay(gmailContext()) || '';
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {gmailContext} = api(c), {id} = button.dataset;
      if (ui.view === 'gmail' && action.startsWith('g4-') && ICSGmail.handle(action, id, gmailContext())) return true;
      if (ui.view === 'gmail' && action.startsWith('g4p-') && ICSGmailPrefs.handle(action, id, gmailContext())) return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      const {gmailContext} = api(c);
      if (ui.view === 'gmail' && ICSGmail.submit(form.dataset.form, values, gmailContext())) return true;
    },
    back(c) {
      const {ui, data, save, render, renderOverlay, renderStatus, toast, openApp, home, viewport, overlayRoot, screen, i18n, safe, clone, deviceDate, apps, iconAssets, tracks} = c;
      if (ui.view === 'gmail' && ui.sub === 'g4-prefs' && !ui.overlay) { ICSGmailPrefs.back(ui); render(); return true; }
      if (ui.view === 'gmail') {
        if (ui.overlay) { ui.overlay = ''; renderOverlay(); return true; }
        if (ui.sub === 'compose') { ICSGmail.keepDraft(data, ui, viewport.querySelector('.g4-form')); save(); }
        if (!ui.sub && (ui.g4Selected || []).length) { ui.g4Selected = []; render(); return true; }
        if (!ui.sub && ui.g4Query !== undefined) { ui.g4Query = undefined; render(); return true; }
      }
      return false;
    },
  });
})();
