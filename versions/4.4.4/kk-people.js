/* People (Contacts of KTU84P) in the 4.4.4 shell (docs/plans/engine-migration.md): the tabs, a contact and the
   editor (contact-editor.js) with its dialogs, groups, favorites, ringtone, Place on Home screen, search, import /
   export and the display pages (people-io.js), SIM import, the menus and Back, moved out of simulator.js. */
(() => {
  'use strict';
  function scope(c) {
    const {addNotification, composeEmail, contact, data, editPerson, i18n, openApp, openMessageThread, overlayRoot, placeContactShortcut, render, renderOverlay, safe, save, shareVcard, startPhoneCall, toast, ui, viewport} = c;
    function renderPeople() { return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale()); }
    function peopleOverlay() {
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
    return {
      render() {
        if (ui.sub === 'sim-import' && ['people', 'phone'].includes(ui.view)) return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        // Contacts to display, Customize and Settings (people-io.js).
        if (ui.view === 'people' && PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        return renderPeople();
      },
      action(action, button, event) {
        const {id, app, url} = button.dataset;
        // The Contacts editor (contact-editor.js): fields, types, photo and its dialogs.
        if (ui.view === 'people' && action.startsWith('hce-') && HoloContactEditor.handle(action, id, {draft: ui.peopleDraft, form: viewport.querySelector('#people-editor'), ui, render, renderOverlay,
          focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
          takePhoto: () => { const photo = {...ICSMedia.scene(data), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`, album: 'camera', created: Date.now()}; data.photos.unshift(photo); save(); ui.peopleDraft.photo = photo.id; render(); }})) return;
        if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data, ui}); if (result) { if (result.share) { shareVcard(result.share.app, result.share.file); return; } if (result.save) save(); renderOverlay(); render(); return; } }
        if (action.startsWith('vcf-')) {
          const result = PeopleIO.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
          if (result) { if (result.save) save(); for (const title of result.notify || []) addNotification(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return; }
        }
        switch (action) {
          case 'people-place-home': ui.overlay = ''; renderOverlay(); placeContactShortcut(data.contacts.find(p => p.id === (Number(id) || ui.selectedContact))); break;
          case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
          case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
          case 'people-edit': editPerson(); break;
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
          case 'new-contact': editPerson(true); break;
          case 'contact-call': startPhoneCall(button.dataset.number||contact(id)?.phone||'');break;
          case 'people-discard': ui.sub=ui.sub==='edit'?'detail':'';ui.peopleDraft=null;render();break;
          case 'contact-message': openMessageThread(id); break;
          case 'contact-email': {const recipient=button.dataset.email||contact(id)?.email||'';openApp('email');composeEmail(null,false,recipient);break;}
          default: return false;
        }
        return true;
      },
      submit(form, event) {
        const values = new FormData(form);
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
            const name=String(values.get('name')||'').trim();if(!name)return;
            const group=data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
            group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
            if(!data.contactGroups.some(g=>g.id===group.id))data.contactGroups.push(group);
            save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
          }
          case 'contact': {
            const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
            if (!name || !phone) return;
            const id = Date.now(); data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
          }
          default: return false;
        }
        return true;
      },
      input(event) {
        if(event.target.closest('#people-editor')) { HoloContactEditor.sync(event.target.closest('#people-editor'),ui.peopleDraft); return true; }
        return false;
      },
      overlay() {
        if (ui.overlay === 'hce-dialog') {
          overlayRoot.innerHTML = HoloContactEditor.overlay({lang: i18n.language, draft: ui.peopleDraft, dialog: ui.hceDialog || '', photos: data.photos, photoUrl: pid => { const photo = data.photos.find(p => String(p.id) === String(pid)); return photo ? ICSMedia.image(photo) : ''; }});
        } else if (ui.overlay.startsWith('people-')) {
          overlayRoot.innerHTML = peopleOverlay();
        } else return false;
        return true;
      },
      back() {
        if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return true; }
        if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return true; }
        if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return true; }
        return false;
      }
    };
  }
  const spec = {
    render: c => scope(c).render(),
    action: (name, el, event, c) => scope(c).action(name, el, event),
    submit: (form, event, c) => scope(c).submit(form, event),
    input: (event, c) => scope(c).input(event),
    overlay: c => scope(c).overlay(),
    back: c => scope(c).back()
  };
  for (const id of ['people']) KK.register(id, spec);
})();
