/* Phone (IMM76I Contacts.apk's DialtactsActivity and Phone.apk's InCallScreen), moved out of simulator.js
   (docs/plans/engine-migration.md). phone-call.js draws the call and the call log's details; this module is the app:
   - the action bar tabs: Dial pad, Call log, Favorites (with the contacts search)
   - a call (also from People, Messaging and the call log): InCallScreen with its keypad, mute, speaker and hold; Back
     closes the keypad, then leaves the call running (the notification shade offers it again); End call keeps it in
     data.callHistory
   - Settings › Apps › Clear data empties the call log. */
(() => {
  'use strict';

  function renderPhone(c) {
    const {ui, data, safe, i18n} = c, contactByPhone = c.contactByPhone;
    if (ui.sub === 'sim-import') return PeopleIO.sim({data, ui, t: key => i18n.t(key), locale: i18n.locale()});
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),(key,context)=>i18n.t(key,context));
    if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),key=>i18n.t(key),i18n.locale());}
    const tabs = [['dialpad','Dial pad','dialer'],['history','Call log','history'],['favorites','Favorites','favourites']];
    const header = `<div class="phone-tabs" role="tablist">${tabs.map(([id,title,icon]) => `<button role="tab" aria-selected="${ui.phoneTab === id}" aria-label="${title}" data-action="phone-tab" data-id="${id}"><img src="assets/ic_ab_${icon}_holo_dark.png" alt=""></button>`).join('')}</div>`;
    let body;
    if (ui.phoneTab === 'history') {
      body = `<div class="phone-list">${(data.callHistory || []).length ? [...data.callHistory].reverse().map(call => `<div class="phone-log-row"><button class="phone-history-row" data-action="phone-log-detail" data-id="${call.time}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(contactByPhone(call.number)?.name || call.number)}<small><img src="assets/ic_call_${call.type === 'missed' ? 'missed' : call.type === 'incoming' ? 'incoming' : 'outgoing'}_holo_dark.png" alt="">${new Date(call.time).toLocaleString(i18n.locale(),{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</small></span></button><button class="phone-log-redial" data-action="phone-redial" data-id="${safe(call.number)}" aria-label="${safe(i18n.t('Call'))}"><img class="phone-redial" src="assets/ic_dial_action_call.png" alt=""></button></div>`).join('') : '<p class="empty-note">Call log is empty</p>'}</div>`;
    } else if (ui.phoneTab === 'favorites') {
      const favorites=data.contacts.filter(person=>person.favorite && (!ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())));
      body = `<div class="phone-list">${ui.phoneSearch !== undefined ? `<form class="phone-search" data-form="phone-search"><input name="query" aria-label="Search contacts" placeholder="Search contacts" value="${safe(ui.phoneSearch)}"><button aria-label="Search" type="submit"><img src="assets/ph-ic_dial_action_search.png" alt=""></button></form>` : ''}${favorites.length?`<div class="phone-section">Favorites</div><div class="phone-favorite-tiles">${favorites.map(person=>`<button data-action="contact-call" data-id="${person.id}"><img src="assets/phone-picture_unknown.png" alt=""><span>${safe(person.name)}</span></button>`).join('')}</div>`:''}<div class="phone-section">All contacts</div>${data.contacts.filter(person => !ui.phoneSearch || `${person.name} ${person.phone}`.toLocaleLowerCase().includes(ui.phoneSearch.toLocaleLowerCase())).map(person => `<button class="phone-history-row" data-action="contact-call" data-id="${person.id}"><img class="phone-contact-image" src="assets/ic_contact_picture_holo_dark.png" alt=""><span>${safe(person.name)}<small>${safe(person.phone)}</small></span></button>`).join('')}</div>`;
    } else {
      body = `<div class="ics-dialer"><div class="dial-digits"><output aria-label="Phone number">${safe(ui.dial)}</output><button data-action="dial-delete" aria-label="Delete"><img src="assets/ic_dial_action_delete.png" alt=""></button></div><div class="ics-dial-pad">${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit => `<button data-action="dial" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}_wht.png" alt=""></button>`).join('')}</div><div class="dial-actions"><button data-action="phone-search" aria-label="Search contacts"><img src="assets/ph-ic_dial_action_search.png" alt=""></button><button class="dial-call" data-action="call" aria-label="Call"><img src="assets/ic_dial_action_call.png" alt=""></button><button data-action="phone-menu" aria-label="More options"><img src="assets/ph-ic_menu_overflow.png" alt=""></button></div></div>`;
    }
    return `<div class="app-view phone-app">${header}${body}</div>`;
  }
  function contactByPhone(c, number) { const normalized = String(number).replace(/[^\d+]/g, ''); return c.data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(c, number) {
    const {ui, render} = c;
    if(!number)return;
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    c.captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }

  ICS.register('phone', {
    init(c) { c.contactByPhone = number => contactByPhone(c, number); c.startPhoneCall = number => startPhoneCall(c, number); },
    render: renderPhone,
    overlay(c) {
      if (c.ui.overlay === 'phone-menu') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu phone-overflow"><button data-action="phone-add-contact">Add to contacts</button></div>`;
    },
    action(action, button, c) {
      const {ui, data, save, render, renderOverlay, toast, openApp, viewport, contact, startPhoneCall} = c, {id} = button.dataset;
      switch (action) {
        case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
        case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
        case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
        case 'phone-add-contact': openApp('people'); c.editPerson(true); ui.peopleDraft.phones[0].value=ui.dial; render(); break;
        case 'phone-redial': startPhoneCall(id); break;
        case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
        case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
        case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
        case 'hangup': if(ui.activeCall)data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
        case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
        case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
        case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
        case 'phone-log-back': ui.sub='';ui.phoneTab='history';render();break;
        case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)c.openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
        case 'contact-call': startPhoneCall(button.dataset.number||contact(id)?.phone||'');break;
        default: return false;
      }
      return true;
    },
    submit(form, values, c) {
      if (form.dataset.form === 'phone-search') { c.ui.phoneSearch = String(values.get('query') || '').trim(); c.render(); return true; }
    },
    back(c) {
      const {ui, render, home} = c;
      if (ui.overlay) return false;
      if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return true;}
      return false;
    },
    // The call's time and state while it runs.
    tick(c) {
      const {ui, viewport, i18n} = c;
      if(ui.activeCall){
        const dialing=Date.now()<ui.activeCall.connected;
        const elapsed=viewport.querySelector('.incall-elapsed'),state=viewport.querySelector('.incall-state');
        if(elapsed)elapsed.textContent=dialing?'':ICSPhoneCall.duration(ICSPhoneCall.elapsed(ui.activeCall));
        if(state)state.textContent=i18n.t(dialing?'Calling…':ui.activeCall.hold?'On hold':'In call');
      }
    },
    clearData(c) { c.data.callHistory=[];c.ui.activeCall=null; }
  });
})();
