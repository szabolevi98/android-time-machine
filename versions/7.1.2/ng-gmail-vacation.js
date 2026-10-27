/* ng Gmail 6.9.25, N2G48C: VacationResponderActivity, vacation_responder.xml and gmail_vacation_responder_body.xml.
   A local vacation configuration on the demo account: dates, subject/message and Contacts only; Save commits the
   form, Back confirms discarding it. No mail is sent by this screen. */
(() => {
  'use strict';
  const T = () => NG.text('gmail'), F = () => NG.text('settings');
  const iso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
  const saved = c => NG.appPref(c, 'gmail', 'vacation', {on:false, start:iso(), end:'', subject:'', body:'', contacts:false});
  const u = c => c.ui.gmailVacation;
  const hooks = NG.appPrefsHooks.gmail, click = hooks.click, summary = hooks.summary;
  hooks.click = (c, key, node) => {
    if (key !== 'vacation-responder') return click?.(c, key, node) || false;
    c.ui.gmailVacation = {...saved(c)}; u(c).original = JSON.stringify(saved(c)); c.open('gmail-vacation', 'gmail'); return true;
  };
  const date = (c, s) => new Date(s + 'T12:00:00').toLocaleDateString(c.locale(), {month:'short', day:'numeric', year:'numeric'});
  hooks.summary = (c, k, n) => {
    if (k !== 'vacation-responder') return summary?.(c, k, n);
    const s = saved(c); return !s.on ? T().t('vacation_responder_off') : AndroidStrings.format(T().t(s.end ? 'vacation_responder_on_with_end_date' : 'vacation_responder_on'), date(c,s.start), s.end ? date(c,s.end) : '');
  };
  NG.register('gmail-vacation', {
    app:false, statusColor:()=>'#b93221', dialogAccent:()=>'#4285f4',
    render(c) {
      const d = u(c), t = T(); if (!d) return '';
      return `<div class="nggm nggv"><div class="nggm-bar"><button type="button" class="nggm-btn" data-action="nggv-back" aria-label="${c.safe(F().t('framework/cancel'))}"><img src="assets/gm-ic_arrow_back_wht_24dp.svg" alt=""></button><span class="nggm-title">${c.safe(t.t('preferences_vacation_responder_title'))}</span><button type="button" class="nggv-save" data-action="nggv-save">${c.safe(t.t('save'))}</button></div>
      <div class="nggm-page nggv-form"><button type="button" class="ngst-pref" data-action="nggv-toggle"><span class="ngst-texts"><span class="ngst-title">${c.safe(t.t('preferences_vacation_responder_title'))}</span></span><i class="ngw-switch${d.on?' on':''}"><i class="ngw-thumb"></i></i></button>
      <fieldset${d.on ? '' : ' disabled'}><div class="nggv-dates">${['start','end'].map((k,i)=>`<label>${c.safe(t.t(i?'pick_end_date_title':'pick_start_date_title'))}<button type="button" data-action="nggv-date" data-key="${k}">${c.safe(d[k] ? date(c,d[k]) : t.t('date_none'))}</button></label>`).join('')}</div>
      <input class="nggm-csubj" data-vac="subject" maxlength="500" value="${c.safe(d.subject)}" placeholder="${c.safe(t.t('subject_hint'))}"><textarea class="nggm-cbody" data-vac="body" placeholder="${c.safe(t.t('vacation_responder_body_hint_text'))}">
${c.safe(d.body)}</textarea>
      <button type="button" class="ngst-pref" data-action="nggv-contacts"><i class="ngst-check${d.contacts?' on':''}"></i><span>${c.safe(t.t('send_to_contacts_text'))}</span></button></fieldset></div></div>`;
    },
    mount(c, root) { root.querySelectorAll('[data-vac]').forEach(el => el.addEventListener('input', () => { u(c)[el.dataset.vac] = el.value; })); },
    back(c) {
      const d = u(c); if (!d) return false;
      const {original, ...value} = d;
      if (JSON.stringify(value) === original) { c.ui.gmailVacation = null; return false; }
      c.dialog({message:T().t('discard_changes'), buttons:[{label:F().t('framework/cancel')},{label:T().t('discard'),action:c=>{c.ui.gmailVacation=null;c.back();}}]}); return true;
    },
    action(name, el, event, c) {
      const d = u(c); if (!d) return false;
      if (name === 'nggv-date') {
        const key=el.dataset.key;
        const pick=()=>NG.datePicker(c,new Date((d[key]||d.start)+'T12:00:00'),(c,value)=>{
          const text=`${value.getFullYear()}-${String(value.getMonth()+1).padStart(2,'0')}-${String(value.getDate()).padStart(2,'0')}`;
          d[key]=key==='end'&&text<d.start?d.start:text;
          if(d.end&&d.end<d.start)d.end=d.start;
          c.render();
        }, {bg:'#ffffff',header:'#4285f4',dial:'#eceff1',numbers:'#000000de',accent:'#4285f4',dim:'#ffffff99',on:'#ffffff'});
        if(key==='end')c.dialog({title:T().t('pick_end_date_title'),items:[{html:c.safe(T().t('date_none'))},{html:c.safe(T().t('pick_end_date_title'))}],onItem(i,c){if(i)pick();else{d.end='';c.render();}}});else pick();return true;
      }
      if (name === 'nggv-back') { c.back(); return true; }
      if (name === 'nggv-toggle' || name === 'nggv-contacts') { const k = name === 'nggv-toggle'?'on':'contacts'; if (k === 'contacts' && !d.on) return true; d[k]=!d[k];c.render();return true; }
      if (name !== 'nggv-save') return false;
      if (d.on) {

        if (!d.subject.trim() && !d.body.trim()) { c.toast(T().t('vacation_responder_empty_subject_and_body_warning'));return true; }
      }
      const {original,...value}=d; ((c.data.appPrefs||={}).gmail||={}).vacation=value;c.save();c.ui.gmailVacation=null;c.back();c.toast(T().t('vacation_responder_changes_saved'));return true;
    }
  });
})();
