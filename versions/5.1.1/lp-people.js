/* Contacts on Android 5.1.1, moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the list, search, the contact page, the editor, groups, the menus and dialogs
   - Import/export, Import from SIM card (the Phone opens it too), sharing a card, Place on Home screen
   - Back and Clear data */
'use strict';
LP.define('people', ({
  captureRecentView, clone, contact, defaultData, i18n, openApp, overlayRoot, render, renderOverlay, safe, save,
  toast, ui, viewport
}, lp) => {
  function placeContactShortcut(person) { if (person) lp.placeShortcut(`contact:${person.id}`, person.name); }
  function renderPeople() { return ICSPeople.render(lp.data,ui,key => i18n.t(key),i18n.locale()); }
  function editPerson(isNew = false) {
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    ui.peopleDraft = {...person,groups:lp.data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id)};
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
  function peopleOverlay() {
    /* GoogleContacts 1.1: quickcontact's overflow (Delete, Share, Place on Home screen) and people_options' (Contacts to
       display, Import/export, Accounts, Settings, Help; Clear frequents only with frequent contacts), and
       ContactDeletionInteraction's Material alert (the message, then Cancel / OK in the #0288D1 accent), in this image's
       words (people-strings.js). */
    if (ui.overlay === 'people-share') return PeopleIO.shareOverlay({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if (ui.overlay === 'people-vcard') return PeopleIO.overlay({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    const P = key => PeopleStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    if (ui.overlay === 'people-menu') { const items = ui.sub === 'detail' ? [['people-delete', 'Delete'], ['psh-open', 'Share'], ['people-place-home', 'Place on Home screen']] : [['pfl-open', 'Contacts to display'], ['vcf-open', 'Import/export'], ['open-settings-sync', 'Accounts'], ['pst-open', 'Settings'], ['toast', 'Help']]; return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu" data-no-translate>${items.map(([action, title]) => `<button role="menuitem" data-action="${action}"${action === 'toast' ? ` data-id="${safe(unavailable)}"` : ''}>${safe(P(title))}</button>`).join('')}</div>`; }
    if (ui.overlay === 'people-delete') return `<div class="lpp-alert-scrim" data-action="close-overlay"></div><div class="lpp-alert" role="alertdialog" aria-label="${safe(P('This contact will be deleted.'))}" data-no-translate><p>${safe(P('This contact will be deleted.'))}</p><div class="lpp-alert-buttons"><button data-action="close-overlay">${safe(P('Cancel'))}</button><button data-action="people-confirm-delete">${safe(P('OK'))}</button></div></div>`;
    const group = lp.data.contactGroups.find(g=>g.id===ui.peopleEditGroup);
    return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><form class="settings-dialog mms-dialog people-editor" role="dialog" aria-label="${group?'Edit group':'New group'}" data-form="people-group"><h3>${group?'Edit group':'New group'}</h3><label>Group name<input name="name" required maxlength="50" value="${safe(group?.name||'')}"></label>${lp.data.contacts.map(p=>`<label class="people-membership"><input type="checkbox" name="members" value="${p.id}" ${group?.members.includes(p.id)?'checked':''}>${safe(p.name)}</label>`).join('')}<div class="settings-dialog-actions"><button type="button" data-action="close-overlay">Cancel</button><button type="submit">Save</button></div></form>`;
  }
  function shareVcard(app, file) { ui.overlay = ''; renderOverlay(); openApp(app); lp.composeEmail(); const d = lp.mailbox().find(m => m.id === ui.emailId); if (d) (d.files ||= []).push({name: file.name, mime: file.mime, size: file.size, text: file.text}); save(); render(); }
  Object.assign(lp, {shareVcard, editPerson});
  return {
    input(event) {
      if (event.target.matches?.('[data-people-search]')) {
        ui.peopleQuery = event.target.value;
        const list = viewport.querySelector('.lpp-list');
        if (list) { const fresh = document.createElement('div'); fresh.innerHTML = renderPeople(); list.innerHTML = fresh.querySelector('.lpp-list').innerHTML; i18n.translateDOM?.(list); }
        return true;
      }
      if(event.target.closest('#people-editor')) {
        if(event.target.name==='groups')ui.peopleDraft.groups=[...viewport.querySelectorAll('[name=groups]:checked')].map(input=>input.value);
        else ui.peopleDraft[event.target.name]=event.target.value;
        return true;
      }
      return false;
    },
    clearData() {
      lp.data.contacts=clone(defaultData.contacts);lp.data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;
      return false;
    },
    overlay(name, root) {
      if (ui.overlay.startsWith('people-')) {
        overlayRoot.innerHTML = peopleOverlay();
        return true;
      }
      return false;
    },
    back() {
      if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return true; }
      if (ui.view === 'people' && ui.sub === 'detail' && ui.quickContactReturn) { const back = ui.quickContactReturn; ui.quickContactReturn = null; ui.view = back.view; ui.sub = back.sub; render(); return true; }
      if (ui.view === 'people' && ui.peopleSearching) { ui.peopleSearching = false; ui.peopleQuery = ''; render(); return true; }
      return false;
    },
    backIo() {
      if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return true; }
      if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return true; }
      return false;
    },
    render() {
      if (ui.sub === 'sim-import' && ['people', 'phone'].includes(ui.view)) return PeopleIO.sim({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      // Contacts to display, Customize and Settings (people-io.js).
      if (ui.view === 'people' && PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      return renderPeople();
    },
    click(action, button, event) {
      const {id, app} = button.dataset;
      if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data: lp.data, ui}); if (result) { if (result.share) { shareVcard(result.share.app, result.share.file); return; } if (result.save) save(); renderOverlay(); render(); return; } }
      if (action.startsWith('vcf-')) {
        const result = PeopleIO.handle(action, id, {data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        if (result) { if (result.save) save(); for (const title of result.notify || []) lp.addNotification(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return; }
      }
      switch (action) {
        case 'people-place-home': ui.overlay = ''; renderOverlay(); placeContactShortcut(lp.data.contacts.find(p => p.id === (Number(id) || ui.selectedContact))); break;
        case 'open-contact': { const person = lp.data.contacts.find(p => p.id === Number(id)); openApp('people'); if (person) { ui.selectedContact = person.id; ui.sub = 'detail'; render(); } break; }
        case 'people-tab': ui.peopleTab=id; ui.sub=''; ui.peopleQuery=''; ui.peopleSearching=false; render(); break;
        case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('[data-people-search]')?.focus(); break;
        case 'people-edit': editPerson(); break;
        case 'people-menu': ui.overlay='people-menu'; renderOverlay(); break;
        case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
        case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
        case 'people-confirm-delete': ICSPeople.remove(lp.data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
        case 'people-group': ui.peopleGroup=id; ui.sub='group'; ui.peopleQuery=''; render(); break;
        case 'contact': {
          // From the dialer (or any other app) a contact opens Contacts' QuickContactActivity; back returns there.
          if (ui.view !== 'people') { ui.quickContactReturn = {view: ui.view, sub: ui.sub}; captureRecentView(); ui.view = 'people'; }
          ui.selectedContact = Number(id); ui.sub = 'detail'; ui.overlay = ''; render(); break;
        }
        case 'people-search-close': ui.peopleSearching = false; ui.peopleQuery = ''; render(); break;
        case 'new-contact': editPerson(true); break;
        case 'contact-call': lp.startPhoneCall(contact(id)?.phone||'');break;
        case 'contact-message': lp.openMessageThread(id); break;
        case 'contact-email': {const recipient=contact(id)?.email||'';openApp('email');lp.composeEmail(null,false,recipient);break;}
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      switch (name) {
        case 'people-search': ui.peopleQuery=String(values.get('query')||'').trim(); render(); break;
        case 'people-save': {
          const name=String(values.get('name')||'').trim(); if(!name)return;
          const id=ui.sub==='edit'?ui.selectedContact:Date.now();
          const person=contact(id)||{id};
          for(const key of ['name','phone','email','company','notes'])person[key]=String(values.get(key)||'').trim();
          if(!contact(id))lp.data.contacts.push(person);
          const groups=values.getAll('groups');
          lp.data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});
          save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast('Contact saved');break;
        }
        case 'people-group': {
          const name=String(values.get('name')||'').trim();if(!name)return;
          const group=lp.data.contactGroups.find(g=>g.id===ui.peopleEditGroup)||{id:'group-'+Date.now()};
          group.name=name;group.members=values.getAll('members').map(Number).filter(id=>!!contact(id));
          if(!lp.data.contactGroups.some(g=>g.id===group.id))lp.data.contactGroups.push(group);
          save();ui.peopleGroup=group.id;ui.peopleTab='groups';ui.sub='group';ui.overlay='';render();break;
        }
        case 'contact': {
          const name = String(values.get('name')).trim(), phone = String(values.get('phone')).trim(), email = String(values.get('email')).trim();
          if (!name || !phone) return;
          const id = Date.now(); lp.data.contacts.push({ id, name, phone, email }); save(); ui.selectedContact = id; ui.sub = 'detail'; render(); toast('Contact saved'); break;
        }
        default: return false;
      }
      return true;
    }
  };
});
