/* People (IMM76I Contacts.apk), moved out of simulator.js (docs/plans/engine-migration.md). people.js draws the lists
   and the contact, contact-editor.js the editor, ics-people-io.js Contacts to display, Import/export, Settings, Share and
   the SIM import; this module is the app around them:
   - All / Favorites / Groups, search, a contact's star, call, message and email, the contact menu (Edit, Share, Delete,
     Set ringtone, All calls to voicemail, Place on Home screen), new and edited groups
   - the editor's Done keeps every field (an empty card is not kept), Discard leaves it
   - Share contact via Email or Gmail: the app's compose with the contact card attached. */
(() => {
  'use strict';

  function editPerson(c, isNew = false) {
    const {ui, data, render, contact} = c;
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    ui.peopleDraft = HoloContactEditor.fromPerson(person,data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id));
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  /* Contacts' Place on Home screen: an INSTALL_SHORTCUT whose shortcut opens the contact (QuickContact), its photo or
     the image's contact picture as the icon, the name as the label (the launcher places it). */
  function placeContactShortcut(c, person) { if (person) c.placeShortcut(`contact:${person.id}`, person.name); }
  // Share contact via Email or Gmail: the app's compose with the contact card attached.
  function shareVcard(c, app, file) {
    const {ui, data, save, render, renderOverlay, openApp} = c;
    ui.overlay = ''; renderOverlay(); openApp(app);
    if (app === 'gmail') { ICSGmail.handle('g4-compose', '', c.gmailContext()); const d = data.gmail40.find(m => m.id === ui.g4Id); if (d) d.attachment = {...file, size: `${Math.max(1, Math.round(file.size / 1024))}KB`}; }
    else { c.composeEmail(); const d = data.mailbox.find(m => m.id === ui.emailId); if (d) d.attachment = {...file, size: file.size < 1024 ? `${file.size}B` : `${(file.size / 1024).toFixed(2)}KB`}; }
    save(); render();
  }
  function peopleOverlay(c) {
    const {ui, data, safe, i18n, contact} = c;
    /* ContactDetailFragment's view_contact menu (Edit, Share, Delete, Set ringtone, the checkable All calls to voicemail
       and, from 4.2, Place on Home screen), people_options' overflow (Contacts to display, Import/export, Accounts,
       Settings and, from 4.2, Help; Clear frequents only with frequent contacts) and ContactDeletionInteraction (Ice Cream
       Sandwich titles it "Delete contact?" with the alert icon; later releases show only the message), in this image's
       words (people-strings.js). */
    if (ui.overlay === 'people-share') return PeopleIO.shareOverlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-vcard') return PeopleIO.overlay({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-ringtone') return PeopleIO.ringtone({data, ui, t: key => i18n.t(key), locale: i18n.locale()}, contact(ui.selectedContact));
    const P = key => PeopleStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    const option = (action, label, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(P(label))}</button>`;
    if (ui.overlay === 'people-menu') { const person = contact(ui.selectedContact); return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu people-menu" data-no-translate>${option('people-edit', 'Edit')}${option('psh-open', 'Share', person?.id)}${option('people-delete', 'Delete')}${option('people-ringtone', 'Set ringtone')}<button data-action="people-voicemail" role="menuitemcheckbox" aria-checked="${!!person?.sendToVoicemail}"><span>${safe(P('All calls to voicemail'))}</span><img src="assets/btn_check_${person?.sendToVoicemail ? 'on' : 'off'}_holo_dark.png" alt=""></button>${PeopleStrings.has('Place on Home screen') ? option('people-place-home', 'Place on Home screen', person?.id) : ''}</div>`; }
    if (ui.overlay === 'people-list-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu people-menu people-list-menu" data-no-translate>${['Contacts to display', 'Import/export', 'Accounts', 'Settings', ...(PeopleStrings.has('Help') ? ['Help'] : [])].map(label => label === 'Import/export' ? option('vcf-open', label) : label === 'Contacts to display' ? option('pfl-open', label) : label === 'Settings' ? option('pst-open', label) : option('toast', label, unavailable)).join('')}</div>`;
    if (ui.overlay === 'people-delete') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="people-alert" role="alertdialog" aria-label="${safe(P('This contact will be deleted.'))}" data-no-translate>${PeopleStrings.has('Delete contact?') ? `<h3><img src="assets/people-ic_dialog_alert_holo_light.png" alt="">${safe(P('Delete contact?'))}</h3>` : ''}<p>${safe(P('This contact will be deleted.'))}</p><div class="people-alert-buttons">${option('close-overlay', 'Cancel')}${option('people-confirm-delete', 'OK')}</div></div>`;
    const group = data.contactGroups.find(g=>g.id===ui.peopleEditGroup);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog mms-dialog people-editor" role="dialog" aria-label="${group?'Edit group':'New group'}" data-form="people-group"><h3>${group?'Edit group':'New group'}</h3><label>Group name<input name="name" required maxlength="50" value="${safe(group?.name||'')}"></label>${data.contacts.map(p=>`<label class="people-membership"><input type="checkbox" name="members" value="${p.id}" ${group?.members.includes(p.id)?'checked':''}>${safe(p.name)}</label>`).join('')}<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
  }

  ICS.register('people', {
    scroller: '.people-scroll',
    init(c) { c.editPerson = isNew => editPerson(c, isNew); },
    render(c) {
      const {ui, data, i18n} = c;
      if (ui.sub === 'sim-import') return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      // Contacts to display, Customize and Settings (people-io.js).
      if (PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale());
    },
    overlay(c) {
      const {ui, data, i18n} = c;
      if (ui.overlay === 'hce-dialog') return HoloContactEditor.overlay({lang: i18n.language, draft: ui.peopleDraft, dialog: ui.hceDialog || '', photos: data.photos, photoUrl: pid => { const photo = data.photos.find(p => String(p.id) === String(pid)); return photo ? ICSMedia.image(photo) : ''; }});
      if (ui.overlay.startsWith('people-')) return peopleOverlay(c);
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, openApp, viewport, i18n, contact} = c, {id} = button.dataset;
      // The Contacts editor (contact-editor.js): fields, types, photo and its dialogs.
      if (ui.view === 'people' && action.startsWith('hce-') && HoloContactEditor.handle(action, id, {draft: ui.peopleDraft, form: viewport.querySelector('#people-editor'), ui, render, renderOverlay,
        focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        takePhoto: () => { const photo = {...ICSMedia.scene(data), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`, album: 'camera', created: Date.now()}; data.photos.unshift(photo); save(); ui.peopleDraft.photo = photo.id; render(); }})) return true;
      if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data, ui}); if (result) { if (result.share) { shareVcard(c, result.share.app, result.share.file); return true; } if (result.save) save(); renderOverlay(); render(); return true; } }
      if (action.startsWith('vcf-')) {
        const result = PeopleIO.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        if (result) { if (result.save) save(); for (const title of result.notify || []) c.notify(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return true; }
      }
      switch (action) {
        case 'people-place-home': ui.overlay = ''; renderOverlay(); placeContactShortcut(c, data.contacts.find(p => p.id === (Number(id) || ui.selectedContact))); break;
        case 'open-contact': { const person = data.contacts.find(p => p.id === Number(id)); openApp('people'); if (person) { ui.selectedContact = person.id; ui.sub = 'detail'; render(); } break; }
        case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
        case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
        case 'people-edit': editPerson(c); break;
        case 'people-menu': ui.overlay='people-menu'; renderOverlay(); break;
        case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
        case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
        case 'people-list-menu': ui.overlay='people-list-menu'; renderOverlay(); break;
        case 'people-voicemail': { const person=contact(ui.selectedContact); if(person)person.sendToVoicemail=!person.sendToVoicemail; save(); ui.overlay=''; renderOverlay(); break; }
        case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
        case 'people-ringtone': ui.overlay = 'people-ringtone'; renderOverlay(); break;
        case 'people-group': ui.peopleGroup=id; ui.sub='group'; ui.peopleQuery=''; render(); break;
        case 'people-new-group': ui.peopleEditGroup=''; ui.overlay='people-group'; renderOverlay(); break;
        case 'people-edit-group': ui.peopleEditGroup=ui.peopleGroup; ui.overlay='people-group'; renderOverlay(); break;
        case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
        case 'new-contact': editPerson(c, true); break;
        case 'people-discard': ui.sub=ui.sub==='edit'?'detail':'';ui.peopleDraft=null;render();break;
        case 'contact-message': c.openMessageThread(id); break;
        case 'contact-email': {const recipient=button.dataset.email||contact(id)?.email||'';openApp('email');c.composeEmail(null,false,recipient);break;}
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      const {ui, data, save, render, renderOverlay, toast, viewport, i18n, contact} = c;
      switch (form.dataset.form) {
        case 'people-search': ui.peopleQuery=String(values.get('query')||'').trim(); render(); break;
        case 'hce-label': HoloContactEditor.submitLabel(values,{draft:ui.peopleDraft,ui,render,renderOverlay}); break;
        case 'people-save': {
          // ContactEditorFragment.save: every field of the form; a card with nothing in it is not kept.
          const id=ui.sub==='edit'?ui.selectedContact:Date.now();
          const person=HoloContactEditor.commit(viewport.querySelector('#people-editor'),ui.peopleDraft,contact(id)||{id});
          if(!person.name&&!person.phone&&!person.email){ui.sub=ui.sub==='edit'?'detail':'';ui.peopleDraft=null;render();break;}
          if(!person.name)person.name=person.phone||person.email;
          const index=data.contacts.findIndex(p=>p.id===id);if(index>=0)data.contacts[index]=person;else data.contacts.push(person);
          const groups=ui.peopleDraft.groups||[];
          data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});
          save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast(HoloContactEditor.T(i18n.language,'Contact saved.'));break;
        }
        case 'people-ringtone': { const person = contact(ui.selectedContact), choice = String(values.get('choice') || 'default'); if (person) { if (choice === 'default') delete person.ringtone; else person.ringtone = choice; save(); } ui.overlay = ''; renderOverlay(); window.SystemSounds?.stop?.(); render(); break; }
        case 'people-group': {
          const name=String(values.get('name')||'').trim();if(!name)return true;
          const group=data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
          group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
          if(!data.contactGroups.some(g=>g.id===group.id))data.contactGroups.push(group);
          save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
        }
        case 'contact': {
          const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
          if (!name || !phone) return true;
          const id = Date.now(); data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
        }
        default: return false;
      }
      return true;
    },
    input(event, c) { if(event.target.closest('#people-editor')) { HoloContactEditor.sync(event.target.closest('#people-editor'),c.ui.peopleDraft); return true; } },
    back(c) {
      const {ui, render} = c;
      // The SIM import (from People or Phone) returns to the page it came from.
      if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return true; }
      if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return true; }
      if (ui.overlay) return false;
      if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return true; }
      return false;
    },
    clearData(c) { const {ui, data, clone} = c; data.contacts=clone(c.defaults.contacts);data.contactGroups=clone(c.defaults.contactGroups);ui.peopleDraft=null; }
  });
})();
