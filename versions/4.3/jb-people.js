/* Phone and People on Android 4.3 (Dialer and Contacts of JWR66Y), moved out of simulator.js
   (docs/plans/engine-migration.md): the dialpad, call log and favourites, the call screen, the contact list, detail and
   editor (contact-editor.js), groups, ringtone, import / export and display settings (jb-people-io.js); their actions,
   forms, typing, overlays, Back and Clear data. */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, addNotification, captureRecentView, clone, composeEmail, contact, data, defaultData, home, i18n, label, openApp, openMessageThread, overlayRoot, placeContactShortcut, render, renderOverlay, safe, save, shareVcard, toast, ui, viewport;
  const $bind = c => { $c = c; ({addNotification, captureRecentView, clone, composeEmail, contact, data, defaultData, home, i18n, label, openApp, openMessageThread, overlayRoot, placeContactShortcut, render, renderOverlay, safe, save, shareVcard, toast, ui, viewport} = c); };
  function renderPhone() {
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),(key,context)=>i18n.t(key,context));
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
    const tabs = [['dialpad','Dial pad','dialer'],['history','Call log','history'],['favorites','Favorites','favourites']];
    // Dialer 4.3 (dialtacts_options.xml): search and the overflow sit at the end of the tab bar.
    const header = `<div class="phone-tabs jb-phone-tabs" role="tablist">${tabs.map(([id,title,icon]) => `<button role="tab" aria-selected="${ui.phoneTab === id}" aria-label="${title}" data-action="phone-tab" data-id="${id}"><img src="assets/ic_ab_${icon}_holo_dark.png" alt=""></button>`).join('')}<span class="jb-phone-tab-actions"><button data-action="phone-search" aria-label="Search contacts"><img src="assets/ic_dial_action_search.png" alt=""></button><button data-action="phone-menu" aria-label="More options"><img src="assets/ic_menu_overflow.png" alt=""></button></span></div>`;
    let body;
    if (ui.phoneTab === 'history') {
      body = `<div class="phone-list">${(data.callHistory || []).length ? [...data.callHistory].reverse().map(call => `<div class="phone-log-row"><button class="phone-history-row" data-action="phone-log-detail" data-id="${call.time}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(contactByPhone(call.number)?.name || call.number)}<small><img src="assets/ic_call_${call.type === 'missed' ? 'missed' : call.type === 'incoming' ? 'incoming' : 'outgoing'}_holo_dark.png" alt="">${new Date(call.time).toLocaleString(i18n.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></span></button><button class="phone-log-redial" data-action="phone-redial" data-id="${safe(call.number)}" aria-label="${safe(i18n.t('Call'))}"><img class="phone-redial" src="assets/ic_dial_action_call.png" alt=""></button></div>`).join('') : '<p class="empty-note">Call log is empty</p>'}</div>`;
    } else if (ui.phoneTab === 'favorites') {
      const favorites=data.contacts.filter(person=>person.favorite && (!ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())));
      body = `<div class="phone-list">${ui.phoneSearch !== undefined ? `<form class="phone-search" data-form="phone-search"><input name="query" aria-label="Search contacts" placeholder="Search contacts" value="${safe(ui.phoneSearch)}"><button aria-label="Search" type="submit"><img src="assets/ic_dial_action_search.png" alt=""></button></form>` : ''}${favorites.length?`<div class="phone-section">Favorites</div><div class="phone-favorite-tiles">${favorites.map(person=>`<button data-action="contact-call" data-id="${person.id}"><img src="assets/phone-picture_unknown.png" alt=""><span>${safe(person.name)}</span></button>`).join('')}</div>`:''}<div class="phone-section">All contacts</div>${data.contacts.filter(person => !ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())).map(person => `<button class="phone-history-row" data-action="contact-call" data-id="${person.id}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(person.name)}<small>${safe(person.phone)}</small></span></button>`).join('')}</div>`;
    } else {
      body = `<div class="ics-dialer"><div class="dial-digits"><output aria-label="Phone number">${safe(ui.dial)}</output><button data-action="dial-delete" aria-label="Delete"><img src="assets/ic_dial_action_delete.png" alt=""></button></div>${JBDialer.render(data.contacts, ui.dial, key => i18n.t(key))}<div class="ics-dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}_wht.png" alt=""></button>`).join('')}</div><div class="dial-actions jb-dial-actions"><button class="dial-call" data-action="call" aria-label="Call"><img src="assets/ic_dial_action_call.png" alt=""></button></div></div>`;
    }
    return `<div class="app-view phone-app">${header}${body}</div>`;
  }
  function renderPeople() { return ICSPeople.render(data,ui,key => i18n.t(key),i18n.locale()); }
  function editPerson(isNew = false) {
    const person = isNew ? {} : contact(ui.selectedContact);
    if (!person) return;
    ui.peopleDraft = HoloContactEditor.fromPerson(person,data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id));
    ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
  }
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
  function startPhoneCall(number) {
    if(!number)return;
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  const spec = {
    render(c) {
      $bind(c);
      if (ui.sub === 'sim-import' && ['people', 'phone'].includes(ui.view)) return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      // Contacts to display, Customize and Settings (people-io.js).
      if (ui.view === 'people' && PeopleIO.PAGES.includes(ui.sub)) return PeopleIO.page({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      switch (ui.view) {
        case 'phone': return renderPhone();
        case 'people': return renderPeople();
      }
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      // The Contacts editor (contact-editor.js): fields, types, photo and its dialogs.
      if (ui.view === 'people' && action.startsWith('hce-') && HoloContactEditor.handle(action, id, {draft: ui.peopleDraft, form: viewport.querySelector('#people-editor'), ui, render, renderOverlay,
        focus: selector => requestAnimationFrame(() => viewport.querySelector(selector)?.focus()),
        takePhoto: () => { const photo = {...ICSMedia.scene(data), id: Date.now(), name: `IMG_${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}`, album: 'camera', created: Date.now()}; data.photos.unshift(photo); save(); ui.peopleDraft.photo = photo.id; render(); }})) return true;
      if (/^(pfl|pst|psh)-/.test(action)) { const result = PeopleIO.pageAction(action, id, {data, ui}); if (result) { if (result.share) { shareVcard(result.share.app, result.share.file); return true; } if (result.save) save(); renderOverlay(); render(); return true; } }
      if (action.startsWith('vcf-')) {
        const result = PeopleIO.handle(action, id, {data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        if (result) { if (result.save) save(); for (const title of result.notify || []) addNotification(title, ''); renderOverlay(); render(); if (result.toast) toast(result.toast); return true; }
      }
      switch (action) {
        case 'people-place-home': ui.overlay = ''; renderOverlay(); placeContactShortcut(data.contacts.find(p => p.id === (Number(id) || ui.selectedContact))); break;
        case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
        case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
        case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
        case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phones[0].value=ui.dial; render(); break;
        case 'phone-redial': startPhoneCall(id); break;
        case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
        case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
        case 'smartdial-call': if (id) { ui.dial = id; startPhoneCall(id); } break;
        case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
        case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
        case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
        case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
        case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
        case 'phone-log-back': ui.sub='';ui.phoneTab='history';render();break;
        case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
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
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      if (form.dataset.form === 'phone-search') { ui.phoneSearch = String(values.get('query') || '').trim(); render(); return true; }
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
    input(event, c) {
      $bind(c);
      if(event.target.closest('#people-editor')) { HoloContactEditor.sync(event.target.closest('#people-editor'),ui.peopleDraft); return true; }
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.sub === 'sim-import' && !ui.overlay) { ui.sub = ui.peopleBack || ''; render(); return true; }
      if (ui.view === 'people' && !ui.overlay && PeopleIO.back(ui)) { render(); return true; }
      if (ui.overlay) return false;
      if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return true;}
      if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return true; }
      return false;
    },
    clearData(c) {
      $bind(c);
      const id = c.clearId;
      if(id==='people'){data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null;}
      if(id==='phone'){data.callHistory=[];ui.activeCall=null;}
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay.startsWith('people-')) {
        overlayRoot.innerHTML = peopleOverlay();
      } else if (ui.overlay === 'phone-menu') {
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
      }
      else return;
      return true;
    },
    exports: {
      startPhoneCall: (c, ...args) => { $bind(c); return startPhoneCall(...args); },
      contactByPhone: (c, ...args) => { $bind(c); return contactByPhone(...args); }
    }
  };
  JB.register('phone', spec);
  JB.register('people', spec);
})();
