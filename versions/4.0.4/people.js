/* Offline People presentation inspired by the AOSP ICS Contacts layouts. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function list(data, tab, query, group, locale) {
    const members = data.contactGroups.find(g=>g.id===group)?.members || [];
    return data.contacts.filter(p=>(tab!=='favorites'||p.favorite) && (!group || members.includes(p.id)))
      .filter(p=>`${p.name} ${p.phone} ${p.email}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
      .filter(p=>tab==='favorites'||group||!window.PeopleIO?.visible||PeopleIO.visible(data,p))
      .sort((a,b)=>{const key=p=>window.PeopleIO?.sortKey?PeopleIO.sortKey(p,data):p.name;return key(a).localeCompare(key(b),locale);});
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
  const photoUrl=(data,id)=>{const photo=data.photos?.find(p=>String(p.id)===String(id));return photo&&window.ICSMedia?ICSMedia.image(photo):'';};
  const button = (action,label,file,id='') => `<button type="button" data-action="${action}" data-id="${e(id)}" aria-label="${label}"><img src="assets/${file}" alt=""></button>`;
  function render(data,ui,t,locale) {
    const person=data.contacts.find(p=>p.id===ui.selectedContact);
    const editing=['new','edit'].includes(ui.sub), detail=ui.sub==='detail';
    const group=data.contactGroups.find(g=>g.id===ui.peopleGroup);
    const title=editing ? t(ui.sub==='new'?'New contact':'Edit contact') : detail ? t('People') : ui.sub==='group' ? group?.name || t('Groups') : t('People');
    const header=`<header class="people-header">${button(ui.sub?'back':'home','Back','people.png')}<h2>${e(title)}</h2>${detail&&person?`<button data-action="people-star" aria-label="Favorites" aria-pressed="${!!person.favorite}" class="people-star"><img src="assets/ce-btn_star_${person.favorite?'on':'off'}_normal_holo_dark.png" alt=""></button>${button('people-menu','More options','ic_menu_overflow.png')}`:''}${editing?`<button type="submit" form="people-editor" class="people-done"><img src="assets/ce-ic_menu_done_holo_dark.png" alt="">${e(HoloContactEditor.T(String(locale).slice(0,2),'Done'))}</button>${button('people-discard',HoloContactEditor.T(String(locale).slice(0,2),'Discard'),'ic_menu_overflow.png')}`:''}</header>`;
    if(editing) {
      // ContactEditorFragment of the image (contact-editor.js).
      const draft=ui.peopleDraft||HoloContactEditor.fromPerson({});
      return `<div class="app-view people-app">${header}${HoloContactEditor.render({lang:String(locale).slice(0,2),draft,groups:data.contactGroups.map(g=>({id:g.id,name:t(g.name)})),photoUrl:id=>photoUrl(data,id)})}</div>`;
    }
    if(detail) {
      if(!person) return `<div class="app-view people-app">${header}<p class="empty-note">Contact not found</p></div>`;
      return `<div class="app-view people-app">${header}<div class="people-scroll"><div class="people-portrait"><img src="${e(person.photo!=null&&photoUrl(data,person.photo)||'assets/people-ic_contact_picture_180_holo_light.png')}" alt=""><h3>${e(person.name)}</h3></div><h4 class="people-section">${e(t('Contact details'))}</h4>${HoloContactEditor.details(person,String(locale).slice(0,2),'stat_notify_sms.png')}<div class="people-note"><small>${e(t('Groups'))}</small><p>${data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>e(t(g.name))).join(', ') || e(t('None'))}</p></div></div></div>`;
    }
    const tab=ui.peopleTab||'all';
    const tabs=ui.sub==='group'?'':`<nav class="people-tabs">${[['groups','Groups'],['all','All contacts'],['favorites','Favorites']].map(([key,label])=>`<button role="tab" aria-selected="${tab===key}" data-action="people-tab" data-id="${key}">${e(t(label))}</button>`).join('')}</nav>`;
    const toolbar=`<footer class="people-actions">${button('people-search','Search contacts','mms-ic_menu_search_holo_dark.png')}${button(tab==='groups'?'people-new-group':'new-contact',tab==='groups'?'New group':'Add contact',tab==='groups'?'people-ic_groups_holo_dark.png':'people-ic_menu_add_contact_holo_light.png')}${ui.sub==='group'?'<button data-action="people-edit-group">Edit group</button>':''}${ui.sub==='group'?'':button('people-list-menu','More options','ic_menu_moreoverflow_normal_holo_light.png')}</footer>`;
    if(tab==='groups' && ui.sub!=='group') return `<div class="app-view people-app">${header}${tabs}<div class="people-scroll">${data.contactGroups.map(g=>`<button class="people-group" data-action="people-group" data-id="${e(g.id)}"><strong>${e(t(g.name))}</strong><small>${g.members.filter(id=>data.contacts.some(p=>p.id===id)).length} ${e(t('contacts'))}</small></button>`).join('')||'<p class="empty-note">No groups</p>'}</div>${toolbar}</div>`;
    const items=list(data,tab,ui.peopleQuery||'',ui.sub==='group'?ui.peopleGroup:'',locale);
    let initial='';
    const rows=tab==='favorites' ? items.map(p=>`<button class="people-favorite-tile" data-action="contact" data-id="${p.id}"><img src="assets/people-ic_contact_picture_180_holo_light.png" alt=""><span>${e(p.name)}</span></button>`).join('') : items.map(p=>{const first=(window.PeopleIO?.sortKey?PeopleIO.sortKey(p,data):p.name).slice(0,1).toLocaleUpperCase();const separator=first!==initial?`<h4 class="people-section">${e(first)}</h4>`:'';initial=first;return `${separator}<button class="people-row" data-action="contact" data-id="${p.id}"><span>${e(window.PeopleIO?.displayName?PeopleIO.displayName(p,data):p.name)}</span><img src="${e(p.photo!=null&&photoUrl(data,p.photo)||'assets/people-ic_contact_picture_holo_light.png')}" alt=""></button>`;}).join('');
    return `<div class="app-view people-app">${header}${tabs}${ui.peopleSearching?`<form class="people-search" data-form="people-search"><input name="query" type="search" aria-label="Search contacts" placeholder="Search contacts" value="${e(ui.peopleQuery||'')}"><button type="submit">Search</button></form>`:''}<div class="people-scroll ${tab==='favorites'?'people-favorites':''}">${tab==='all'&&ui.sub!=='group'&&!ui.peopleSearching&&window.PeopleIO?.filterHeader&&PeopleIO.filterHeader({data,t,locale})?`<p class="people-filter-header">${e(PeopleIO.filterHeader({data,t,locale}))}</p>`:''}${rows||`<p class="empty-note">${e(t(tab==='favorites'?'No favorites yet':'No contacts found'))}</p>`}</div>${toolbar}</div>`;
  }
  window.ICSPeople={render,list,remove};
})();
