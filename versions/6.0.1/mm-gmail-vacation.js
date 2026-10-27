/* mm Gmail 5.7, MTC20K: VacationResponderActivity, vacation_responder.xml and gmail_vacation_responder_body.xml.
   A local vacation configuration on the demo account: dates, subject/message and Contacts only; Save commits the
   form, Back confirms discarding it. No mail is sent by this screen. */
(() => {
  'use strict';
  const T = () => MM.text('gmail'), F = () => MM.text('framework');
  const iso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const saved = c => MM.appPref(c, 'gmail', 'vacation', {on:false, start:iso(), end:'', subject:'', body:'', contacts:false});
  const u = c => c.ui.gmailVacation;
  const hooks = MM.appPrefsHooks.gmail, click = hooks.click, summary = hooks.summary;
  hooks.click = (c, key, node) => {
    if (key !== 'vacation-responder') return click?.(c, key, node) || false;
    c.ui.gmailVacation = {...saved(c)}; u(c).original = JSON.stringify(saved(c)); c.open('gmail-vacation', 'gmail'); return true;
  };
  const date = (c, s) => new Date(s + 'T12:00:00').toLocaleDateString(c.locale(), {month:'short', day:'numeric', year:'numeric'});
  hooks.summary = (c, k, n) => {
    if (k !== 'vacation-responder') return summary?.(c, k, n);
    const s = saved(c); return !s.on ? T().t('vacation_responder_off') : AndroidStrings.format(T().t(s.end ? 'vacation_responder_on_with_end_date' : 'vacation_responder_on'), date(c,s.start), s.end ? date(c,s.end) : '');
  };
  MM.register('gmail-vacation', {
    app:false, statusColor:()=>'#b93221', dialogAccent:()=>'#4285f4',
    render(c) {
      const d = u(c), t = T(); if (!d) return '';
      return `<div class="mmgm mmgv"><div class="mmgm-bar"><button type="button" class="mmgm-btn" data-action="mmgv-back" aria-label="${c.safe(F().t('cancel'))}"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button><span class="mmgm-title">${c.safe(t.t('preferences_vacation_responder_title'))}</span><button type="button" class="mmgv-save" data-action="mmgv-save">${c.safe(t.t('save'))}</button></div>
      <div class="mmgm-page mmgv-form"><button type="button" class="mmst-pref" data-action="mmgv-toggle"><span class="mmst-texts"><span class="mmst-title">${c.safe(t.t('preferences_vacation_responder_title'))}</span></span><i class="mmw-switch${d.on?' on':''}"><i class="mmw-thumb"></i></i></button>
      <fieldset${d.on ? '' : ' disabled'}><div class="mmgv-dates">${['start','end'].map((k,i)=>`<label>${c.safe(t.t(i?'pick_end_date_title':'pick_start_date_title'))}<button type="button" data-action="mmgv-date" data-key="${k}">${c.safe(d[k] ? date(c,d[k]) : t.t('date_none'))}</button></label>`).join('')}</div>
      <input class="mmgm-csubj" data-vac="subject" maxlength="500" value="${c.safe(d.subject)}" placeholder="${c.safe(t.t('subject_hint'))}"><textarea class="mmgm-cbody" data-vac="body" placeholder="${c.safe(t.t('vacation_responder_body_hint_text'))}">
${c.safe(d.body)}</textarea>
      <button type="button" class="mmst-pref" data-action="mmgv-contacts"><i class="mmst-check${d.contacts?' on':''}"></i><span>${c.safe(t.t('send_to_contacts_text'))}</span></button></fieldset></div></div>`;
    },
    mount(c, root) { root.querySelectorAll('[data-vac]').forEach(el => el.addEventListener('input', () => { u(c)[el.dataset.vac] = el.value; })); },
    back(c) {
      const d = u(c); if (!d) return false;
      const {original, ...value} = d;
      if (JSON.stringify(value) === original) { c.ui.gmailVacation = null; return false; }
      c.dialog({message:T().t('discard_changes'), buttons:[{label:F().t('cancel')},{label:T().t('discard'),action:c=>{c.ui.gmailVacation=null;c.back();}}]}); return true;
    },
    action(name, el, event, c) {
      const d = u(c); if (!d) return false;
      if (name === 'mmgv-date') {
        const key=el.dataset.key;
        const pick=()=>MM.datePicker(c,new Date((d[key]||d.start)+'T12:00:00'),(c,value)=>{
          const text=`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
          d[key]=key==='end'&&text<d.start?d.start:text;
          if(d.end&&d.end<d.start)d.end=d.start;
          c.render();
        });
        if(key==='end')c.dialog({title:T().t('pick_end_date_title'),items:[{html:c.safe(T().t('date_none'))},{html:c.safe(T().t('pick_end_date_title'))}],onItem(i,c){if(i)pick();else{d.end='';c.render();}}});else pick();return true;
      }
      if (name === 'mmgv-back') { c.back(); return true; }
      if (name === 'mmgv-toggle' || name === 'mmgv-contacts') { const k = name === 'mmgv-toggle'?'on':'contacts'; if (k === 'contacts' && !d.on) return true; d[k]=!d[k];c.render();return true; }
      if (name !== 'mmgv-save') return false;
      if (d.on) {

        if (!d.subject.trim() && !d.body.trim()) { c.toast(T().t('vacation_responder_empty_subject_and_body_warning'));return true; }
      }
      const {original,...value}=d; ((c.data.appPrefs||={}).gmail||={}).vacation=value;c.save();c.ui.gmailVacation=null;c.back();c.toast(T().t('vacation_responder_changes_saved'));return true;
    }
  });
})();
