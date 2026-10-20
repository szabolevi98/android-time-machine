/* EmergencyInfo of angler N2G48C: ViewInfoActivity (#e53935 / #c62828), EditInfoActivity
   (AppTheme #263238 / #21272b / #009688), custom_action_bar.xml, view_activity_layout,
   edit_activity_layout, tabs.xml, view/edit_emergency_info and view/edit_emergency_contacts.
   The image's fields and array values are used verbatim. All information remains in this phone's saved state. */
(() => {
  'use strict';
  const T=()=>NG.text('emergencyinfo'),t=k=>T().t(k),esc=(c,v)=>c.safe(v);
  NG.defaults.emergencyInfo={values:{},contacts:[],consent:false};
  const S=c=>c.data.emergencyInfo||(c.data.emergencyInfo={values:{},contacts:[],consent:false});
  const U=c=>c.ui.emergencyInfo||(c.ui.emergencyInfo={edit:false,tab:'info'});
  const fields=[['name','ic_account_circle'],['address','ic_address_black_24dp'],['blood_type','ic_bloodtype_black_24dp'],['allergies','ic_allergies_black_24dp'],['medications','ic_medication_24dp'],['organ_donor','ic_heart_black_24dp'],['medical_conditions','ic_notes_black_24dp']];
  const icon=n=>`<img src="assets/ei-${n}.svg" alt="">`;
  const populated=c=>Object.values(S(c).values).some(Boolean)||S(c).contacts.some(id=>NG.people.byId(c,id));
  function value(c,key){const v=S(c).values[key]||'';if(['blood_type','organ_donor'].includes(key)){const values=t(`${key}_values`),i=values.indexOf(v);return i>=0?t(`${key}_entries`)[i]:t(`unknown_${key}`);}return v||t(`unknown_${key}`);}
  function rows(c){const edit=U(c).edit;return fields.filter(([key])=>edit||(key!=='name'&&S(c).values[key])).map(([key,img])=>NG.settingsRow(c,{title:t(key),summary:value(c,key),action:'ngeinfo-field',key,icon:icon(img),div:!edit})).join('');}
  function contacts(c){const edit=U(c).edit,list=S(c).contacts.map(id=>NG.people.byId(c,id)).filter(Boolean);return `<div class="ngeinfo-contacts">${list.map(p=>`<div class="ngeinfo-person"><button type="button" data-action="ngeinfo-call" data-id="${p.id}">${NG.people.tile(c,p)}<span><strong>${esc(c,p.name)}</strong><small>${esc(c,NG.people.format(p.phone))}</small></span></button>${edit?`<button type="button" class="ngeinfo-remove" data-action="ngeinfo-remove" data-id="${p.id}" aria-label="${esc(c,t('remove_contact_icon_text'))}">${icon('ic_clear_24dp')}</button>`:''}</div>`).join('')}${edit?NG.settingsRow(c,{title:t('add_emergency_contact'),action:'ngeinfo-add',icon:icon('ic_add_24dp')}):''}</div>`;}
  function render(c){const u=U(c),s=S(c),filled=populated(c),editing=u.edit;
    return `<div class="ngeinfo${editing?' edit':''}"><header class="ngeinfo-bar"><button type="button" class="ngeinfo-back" data-action="ngeinfo-back" aria-label="${esc(c,t('abc_action_bar_up_description'))}"><i></i></button><span>${esc(c,t('app_label'))}</span>${editing?NG.menu.button(c,'ngeinfo-more'):`<button type="button" class="ngeinfo-edit" data-action="ngeinfo-edit" aria-label="${esc(c,t('edit_info'))}">${icon('ic_mode_edit_24dp')}</button>`}</header>${!editing&&s.values.name?`<div class="ngeinfo-name">${esc(c,s.values.name)}</div>`:''}${editing||filled?`<div class="ngeinfo-tabs">${[['info','tab_title_info'],['contacts','tab_title_contacts']].map(([tab,key])=>`<button type="button" class="${u.tab===tab?'on':''}" data-action="ngeinfo-tab" data-tab="${tab}">${esc(c,t(key))}</button>`).join('')}</div><div class="ngeinfo-content ngst">${u.tab==='info'?rows(c):contacts(c)}</div>`:`<div class="ngeinfo-empty"><p>${esc(c,t('no_info_provided'))}</p><p>${esc(c,t('tap_pencil'))}</p></div>`}</div>`;
  }
  function edit(c){NG.requireUnlock(c,()=>{const go=()=>{U(c).edit=true;U(c).tab='info';c.render();};if(!S(c).consent)c.dialog({title:t('app_label'),message:t('user_emergency_info_consent'),buttons:[{label:t('cancel')},{label:t('emergency_info_continue'),action:c=>{S(c).consent=true;c.save();go();}}]});else go();});}
  function field(c,key){if(!U(c).edit)return;
    if(['blood_type','organ_donor'].includes(key)){const values=t(`${key}_values`),entries=t(`${key}_entries`);c.dialog({title:t(key),items:entries.map(label=>({label})),onItem:i=>{S(c).values[key]=values[i];c.save();c.render();}});return;}
    let value=S(c).values[key]||'';c.dialog({title:t(key),html:`<div class="ngeinfo-input"><textarea aria-label="${esc(c,t(key))}"${['allergies','medications','medical_conditions'].includes(key)?` placeholder="${esc(c,t(`${key}_hint`))}"`:''}>${esc(c,value)}</textarea></div>`,mount(c,root){const input=root.querySelector('textarea');input.addEventListener('input',()=>value=input.value);input.focus();},buttons:[{label:t('cancel')},{label:t('ok'),action:c=>{S(c).values[key]=value.trim();c.save();c.render();}}]});
  }
  NG.register('emergency-info',{app:false,statusColor:c=>U(c).edit?'#21272b':'#c62828',dialogAccent:()=> '#009688',render,
    back(c){if(U(c).edit){U(c).edit=false;c.render();return true;}return false;},
    action(name,el,event,c){switch(name){
      case 'ngeinfo-back':if(!this.back(c))c.back();return true;
      case 'ngeinfo-edit':edit(c);return true;
      case 'ngeinfo-tab':U(c).tab=el.dataset.tab;c.render();return true;
      case 'ngeinfo-field':field(c,el.dataset.key);return true;
      case 'ngeinfo-add':NG.pickContact(c,{phoneOnly:true,onPick:(c,p)=>{if(p&&!S(c).contacts.includes(p.id)){S(c).contacts.push(p.id);c.save();}}});return true;
      case 'ngeinfo-remove':{const id=+el.dataset.id,p=NG.people.byId(c,id);c.dialog({message:T().fmt('remove_contact',null,p?.name||''),buttons:[{label:t('cancel')},{label:t('remove'),action:c=>{S(c).contacts=S(c).contacts.filter(x=>x!==id);c.save();c.render();}}]});return true;}
      case 'ngeinfo-call':{const p=NG.people.byId(c,el.dataset.id);if(p)NG.phone.call(c,p.phone);return true;}
      case 'ng-menu':c.menu([{label:t('clear_all'),action:c=>c.dialog({message:t('clear_all_message'),buttons:[{label:t('cancel')},{label:t('clear'),action:c=>{S(c).values={};S(c).contacts=[];c.save();c.render();}}]})}],el);return true;
    }return false;}
  });
})();
