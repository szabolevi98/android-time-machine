/* Contacts: the local address book and its Material screens. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function list(data, tab, query, group, locale) {
    const members = data.contactGroups.find(g=>g.id===group)?.members || [];
    return data.contacts.filter(p=>(tab!=='favorites'||p.favorite) && (!group || members.includes(p.id)))
      .filter(p=>`${p.name} ${p.phone} ${p.email}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .sort((a,b)=>{const key=p=>window.LPDialerPrefs?LPDialerPrefs.sortKey(p,data):p.name;return key(a).localeCompare(key(b),locale);});
  }
  function remove(data,id) {
    const person = data.contacts.find(p=>p.id===id);
    if (!person) return;
    // Keep existing conversations when their contact card is removed.
    const key = 'tel:' + String(person.phone || person.id).replace(/[\s().-]/g,'');
    data.messages.forEach(m=>{if(String(m.contact)===String(id)) m.contact=key;});
    if(data.messageDrafts?.[id]) { data.messageDrafts[key] ||= data.messageDrafts[id]; delete data.messageDrafts[id]; }
    data.contacts = data.contacts.filter(p=>p.id!==id);
    data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);});
  }
  /* Google Contacts 1.1 (GoogleContacts.apk, com.google.android.contacts, LMY48Y). PeopleActivity: the 56 dp #0288D1 toolbar ("Contacts",
     search, overflow) over the FAVORITES / ALL CONTACTS ViewPagerTabs; All contacts lists 40 dp round photos with the
     16 sp name beside the 48 dp letter column, under the ME row; Favorites are the square tiles. The 56 dp blue FAB
     adds a contact. QuickContactActivity: the header in the contact's letter-tile colour (0.6 x the width, the white
     person_white_540dp silhouette) with back, star, edit and overflow over it and the 36 dp name at the bottom; under
     it the white expanding entry cards on #EEEEEE: phone (icon in the header colour, 16 sp #202020 number, 14 sp
     #737373 "Mobile", message on the right) and email. The editor: a toolbar with the check and Material fields. */
  const tile = (p,cls) => window.LPDialer ? LPDialer.letterTile(p,cls) : '';
  const color = p => window.LPDialer ? LPDialer.tileColor(p?.name||'') : '#0288d1';
  const icon = (file,cls='') => `<img class="${cls}" src="assets/${file}" alt="">`;
  const tool = (action,label,file,id='',extra='') => `<button type="button" data-action="${action}" data-id="${e(id)}" aria-label="${e(label)}"${extra}>${icon(file)}</button>`;
  function render(data,ui,t,locale) {
    const person=data.contacts.find(p=>p.id===ui.selectedContact);
    const editing=['new','edit'].includes(ui.sub), detail=ui.sub==='detail';
    if(editing) {
      const draft=ui.peopleDraft||{};
      const fields=[['name','Name','text',50],['phone','Phone','tel',30],['email','Email','email',80],['company','Company','text',80],['notes','Notes','text',500]];
      return `<div class="app-view lpp-app lpp-editor"><header class="lpp-toolbar">${tool('back',t('Navigate up'),'gc-ic_arrow_back_24dp.png')}<h2>${e(t(ui.sub==='new'?'Add new contact':'Edit contact'))}</h2><button type="submit" form="people-editor" class="lpp-done" aria-label="${e(t('Done'))}">${icon('gc-ic_done_wht_24dp.png')}</button></header><form id="people-editor" class="lpp-scroll lpp-form" data-form="people-save"><div class="lpp-account"><span>${e(t('Phone-only, unsynced contact'))}</span></div><div class="lpp-photo-pick">${icon('gc-ic_camera_alt_black_24dp.png')}</div>${fields.map(([key,label,type,max])=>`<label class="lpp-field"><span>${e(t(label))}</span><input name="${key}" type="${type}" maxlength="${max}" ${key==='name'?'required':''} value="${e(draft[key]||'')}" placeholder="${e(t(label))}"></label>`).join('')}<input type="hidden" name="groups" value=""></form></div>`;
    }
    if(detail) {
      if(!person) return `<div class="app-view lpp-app"><header class="lpp-toolbar">${tool('back',t('Navigate up'),'gc-ic_arrow_back_24dp.png')}</header><p class="empty-note">Contact not found</p></div>`;
      const c=color(person);
      const entry=(img,head,sub,action,alt='') => `<div class="lpp-entry"><button class="lpp-entry-main" data-action="${action}" data-id="${person.id}"><span class="lpp-entry-icon" style="background:${c};-webkit-mask-image:url(assets/${img});mask-image:url(assets/${img})"></span><span class="lpp-entry-text"><strong>${e(head)}</strong><small>${e(sub)}</small></span></button>${alt}</div>`;
      const phone=person.phone?entry('gc-ic_phone_24dp.png',person.phone,t('Mobile'),'contact-call',`<button class="lpp-entry-alt" data-action="contact-message" data-id="${person.id}" aria-label="${e(t('Message'))}"><span class="lpp-entry-icon" style="background:${c};-webkit-mask-image:url(assets/gc-ic_message_24dp.png);mask-image:url(assets/gc-ic_message_24dp.png)"></span></button>`):'';
      const email=person.email?entry('gc-ic_email_24dp.png',person.email,t('Home'),'contact-email'):'';
      const about=['company','notes'].filter(k=>person[k]).map(k=>`<div class="lpp-entry lpp-entry-plain"><span class="lpp-entry-text"><strong>${e(person[k])}</strong><small>${e(t(k==='company'?'Company':'Notes'))}</small></span></div>`).join('');
      return `<div class="app-view lpp-app lpp-quick" style="--qc:${c}"><div class="lpp-scroll"><div class="lpp-header" style="background:${c}">${icon('gc-person_white_540dp.png','lpp-silhouette')}<div class="lpp-header-bar">${tool('back',t('Navigate up'),'gc-ic_arrow_back_24dp.png')}<span></span><button type="button" data-action="people-star" aria-pressed="${!!person.favorite}" aria-label="${e(t('Favorites'))}">${icon(person.favorite?'gc-ic_star_24dp.png':'gc-ic_star_outline_24dp.png')}</button>${tool('people-edit',t('Edit'),'gc-ic_create_24dp.png')}${tool('people-menu',t('More options'),'gd-ic_overflow_menu.png','','class="lpp-white"')}</div><h2>${e(person.name)}</h2></div><div class="lpp-cards"><div class="lpp-card">${phone}${email||(!person.phone?entry('gc-ic_email_24dp.png',t('Add email'),'','people-edit'):'')}</div>${about?`<div class="lpp-card">${about}</div>`:''}</div></div></div>`;
    }
    const tab=ui.peopleTab==='favorites'?'favorites':'all';
    const items=list(data,tab,ui.peopleQuery||'','',locale);
    const searching=!!ui.peopleSearching;
    const bar=searching
      ? `<header class="lpp-toolbar lpp-searchbar">${tool('people-search-close',t('Navigate up'),'gc-ic_arrow_back_24dp.png')}<form data-form="people-search" class="lpp-search"><input name="query" type="search" data-people-search aria-label="${e(t('Find contacts'))}" placeholder="${e(t('Find contacts'))}" value="${e(ui.peopleQuery||'')}" autocomplete="off"></form></header>`
      : `<header class="lpp-toolbar"><h2 class="lpp-title">${e(t('Contacts'))}</h2>${tool('people-search',t('Search'),'gc-ic_ab_search.png')}${tool('people-menu',t('More options'),'gd-ic_overflow_menu.png','list','class="lpp-white"')}</header>`;
    const tabs=searching?'':`<nav class="lpd-tabs lpp-tabs" role="tablist">${[['favorites','Favorites'],['all','All contacts']].map(([key,label])=>`<button role="tab" aria-selected="${tab===key}" data-action="people-tab" data-id="${key}">${e(t(label))}</button>`).join('')}</nav>`;
    let initial='', body;
    if(tab==='favorites'&&!searching) {
      body=items.length?`<div class="lpd-tiles lpp-tiles">${items.map(p=>`<div class="lpd-tile"><button class="lpd-tile-main" data-action="contact" data-id="${p.id}" aria-label="${e(p.name)}">${tile(p,'lpd-tile-photo')}<span class="lpd-tile-shadow"></span><span class="lpd-tile-text"><span class="lpd-tile-name">${e(p.name)}</span></span></button></div>`).join('')}</div>`:`<p class="lpp-empty">${e(t('No favorites.'))}</p>`;
    } else {
      const me=searching?'':`<div class="lpp-me"><span class="lpp-me-label">${e(t('Me'))}</span><button class="lpp-row" data-action="toast" data-id="${e(t('Set up my profile'))}"><span class="lpp-letter-col"></span><span class="lpd-letter lpd-photo lpp-me-photo">${icon('gc-ic_account_circle_black_24dp.png')}</span><span class="lpp-name">${e(t('Set up my profile'))}</span></button></div>`;
      const P=window.LPDialerPrefs;const rows=items.map(p=>{const first=((P?P.sortKey(p,data):p.name).match(/^\p{L}/u)?.[0]||'#').toLocaleUpperCase();const shown=first!==initial;initial=first;return `<button class="lpp-row" data-action="contact" data-id="${p.id}"><span class="lpp-letter-col">${shown?e(first):''}</span>${tile(p,'lpd-photo')}<span class="lpp-name">${e(P?P.displayName(p,data):p.name)}</span></button>`;}).join('');
      body=`${me}${rows||`<p class="lpp-empty">${e(t(searching?'No contacts.':'No contacts.'))}</p>`}`;
    }
    return `<div class="app-view lpp-app">${bar}${tabs}<div class="lpp-scroll lpp-list">${body}</div>${searching?'':`<button class="lpd-fab end lpp-fab" data-action="new-contact" aria-label="${e(t('Add new contact'))}">${icon('gc-ic_person_add_24dp.png')}</button>`}</div>`;
  }
  window.ICSPeople={render,list,remove};
})();
