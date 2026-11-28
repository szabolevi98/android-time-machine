/* Email 4.0.4 (IMM76I EmailGoogle.apk), moved out of simulator.js (docs/plans/engine-migration.md). email.js has its
   screens, menus and actions, email-prefs.js its settings (from the image's preference XMLs); this module is the app
   around them: the compose (also from People's Email and Share), Attach file through the Gallery's picker, the
   settings pages and their list, text and ringtone dialogs. */
(() => {
  'use strict';

  // Email 4.0.4 (email.js): its screens, menus and actions; Attach file opens the Gallery's picker.
  function emailContext(c) {
    const {data, ui, i18n, deviceDate, viewport, save, render, renderOverlay, toast, openApp} = c;
    return {data, ui, lang: i18n.language, locale: i18n.locale(), now: deviceDate().getTime(), hour24: !!data.settings.hour24, root: viewport, signature: EmailPrefs.signatureBody(data), openSettings: () => { ui.sub = 'em-settings'; ui.emPref = ''; render(); },
      save, render, renderOverlay, toast, back: c.navigateBack, focus: selector => viewport.querySelector(selector)?.focus(),
      photo: photo => ICSMedia.art(photo), pickPicture: () => { openApp('gallery'); ui.galleryPick = 'email'; ui.galleryAlbum = ''; render(); }};
  }
  function composeEmail(c, source=null,forward=false,to='') {
    ICSEmail.startCompose(emailContext(c),source,source?(forward?'forward':'reply'):'',to);
  }

  ICS.register('email', {
    scroller: '.email-scroll',
    init(c) { c.emailContext = () => emailContext(c); c.composeEmail = (...args) => composeEmail(c, ...args); },
    render(c) {
      const {ui, data, i18n} = c;
      if (ui.sub === 'em-settings') return EmailPrefs.render(data, ui, i18n.language, key => i18n.t(key), ICSEmail.account);
      return ICSEmail.render(emailContext(c));
    },
    overlay(c) { if (c.ui.overlay.startsWith('email-')) return ICSEmail.overlay(emailContext(c)); },
    action(action, button, c) {
      const {ui, data, save, render, toast, viewport} = c, {id} = button.dataset;
      if (ui.view === 'email' && action.startsWith('email-') && ICSEmail.handle(action, id, emailContext(c))) return true;
      // Email's Quick responses, ringtone and server screens (email-prefs.js).
      if (action.startsWith('empx-') && EmailPrefs.handle(action, id, {data, ui, save, render, root: viewport, account: ICSEmail.account})) return true;
      switch (action) {
        // The Email app's settings (email-prefs.js, from the image's EmailGoogle preference XMLs).
        case 'emailpref-page': ui.emPref = id; render(); break;
        case 'emailpref-toggle': (data.emailPrefs ||= {})[id] = !EmailPrefs.value(data, id, ICSEmail.account); save(); render(); break;
        case 'emailpref-list': ui.emPrefList = id; render(); break;
        case 'emailpref-pick': { const [key, value] = id.split(':'); (data.emailPrefs ||= {})[key] = Number(value); ui.emPrefList = ''; save(); render(); break; }
        case 'emailpref-edit': ui.emPrefEdit = id; ui.emPrefEditValue = undefined; render(); viewport.querySelector('[data-email-pref-edit]')?.focus(); break;
        case 'emailpref-save': { const field = viewport.querySelector('[data-email-pref-edit]'); if (ui.emPrefEdit && field) { (data.emailPrefs ||= {})[ui.emPrefEdit] = field.value.trim(); save(); } ui.emPrefEdit = ''; render(); break; }
        case 'emailpref-close': ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); render(); break;
        case 'emailpref-unsupported': toast('This feature is not part of the simulator.'); break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      if (['email', 'email-search'].includes(form.dataset.form)) { ICSEmail.submit(form.dataset.form, values, emailContext(c)); return true; }
    },
    // The compose's fields go into the draft as they are typed.
    input(event, c) {
      const {ui, data, save} = c;
      if(event.target.closest('.email-compose')&&event.target.name){const item=data.mailbox.find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return true;}
    },
    back(c) {
      const {ui, render} = c;
      if (ui.view === 'email' && ui.sub === 'em-settings' && !ui.overlay) { if (ui.emPrefList || ui.emPrefEdit) { ui.emPrefList = ''; ui.emPrefEdit = ''; ui.emPrefTone = undefined; window.SystemSounds?.stop(); } else if (ui.emPref) ui.emPref = EmailPrefs.parent(ui.emPref); else ui.sub = ''; render(); return true; }
      if (ui.view === 'email' && ICSEmail.back(emailContext(c))) return true;
      return false;
    },
    clearData(c) { const {ui, data} = c; data.mailbox=ICSEmail.restore(null,c.emailSeed,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[]; }
  });
})();
