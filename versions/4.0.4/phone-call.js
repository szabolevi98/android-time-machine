/* The in-call screen and call details of the IMM76I (Galaxy Nexus) image (Phone: incall_screen, call_card,
   incall_touch_ui with ic_end_call; its xhdpi art). Local call state only; no telephony or audio hardware is used. */
(() => {
  'use strict';
  const e=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const duration=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const start=(number,now=Date.now())=>({number,started:now,connected:now+1500,mute:false,speaker:false,hold:false,keypad:false,digits:''});
  const elapsed=(call,now=Date.now())=>Math.max(0,Math.floor((now-call.connected)/1000));
  const finish=(call,now=Date.now())=>({number:call.number,time:call.started,duration:elapsed(call,now),connected:now>=call.connected});
  const image=name=>`<img src="assets/phone-${name}.png" alt="">`;
  function render(call,person,t,now=Date.now()) {
    const dialing=now<call.connected;
    const controls=[['keypad','Dial pad','ic_dialpad_holo_dark'],['speaker','Speaker','ic_sound_speakerphone_holo_dark'],['mute','Mute','ic_mute_holo_dark'],['hold','Hold','ic_hold_pause_holo_dark']];
    return `<div class="app-view incall-app"><div class="incall-photo">${image('picture_unknown')}<div class="incall-banner"><span><strong>${e(person?.name||call.number)}</strong><small>${e(call.number)} ${person?e(t('Mobile')):''}</small></span><time class="incall-elapsed">${dialing?'':duration(elapsed(call,now))}</time></div><div class="incall-state">${e(t(dialing?'Calling…':call.hold?'On hold':'In call'))}</div>${call.keypad?`<div class="incall-keypad"><output>${e(call.digits)}</output><div>${['1','2','3','4','5','6','7','8','9','*','0','#'].map(digit=>`<button data-action="incall-digit" data-id="${digit}" aria-label="${digit}"><img src="assets/dial_num_${digit==='*'?'star':digit==='#'?'pound':digit}_wht.png" alt=""></button>`).join('')}</div></div>`:''}</div><button class="incall-end" data-action="hangup" aria-label="${e(t('End call'))}">${image('ic_end_call')}</button><div class="incall-controls">${controls.map(([key,title,asset])=>`<button data-action="incall-toggle" data-id="${key}" aria-label="${e(t(title,'Phone'))}" aria-pressed="${call[key]}">${image(asset)}<i></i></button>`).join('')}<button disabled aria-label="${e(t('Add call'))}">${image('ic_add_contact_holo_dark')}</button></div></div>`;
  }
  // The call type's label (type_incoming, type_outgoing, type_missed); CallDetailHistoryAdapter hides a missed call's duration.
  function details(call,person,t,locale) {
    if(!call)return '';
    return `<div class="app-view phone-app"><header class="phone-detail-header"><button data-action="phone-log-back" aria-label="${e(t('Back'))}">‹</button><h2>${e(t('Call details'))}</h2></header><div class="phone-detail-person"><img src="assets/ic_contact_picture_holo_dark.png" alt=""><span><strong>${e(person?.name||call.number)}</strong><small>${e(call.number)}</small></span></div><button class="phone-detail-action" data-action="phone-redial" data-id="${e(call.number)}"><img src="assets/ic_dial_action_call.png" alt=""><span>${e(t('Call'))}</span></button><button class="phone-detail-action" data-action="phone-log-message" data-id="${e(call.number)}">${e(t('Send message'))}</button><div class="phone-log-facts"><h3>${e(call.type === 'missed' ? t('Missed call') : call.type === 'incoming' ? t('Incoming call') : t('Outgoing call'))}</h3><p>${e(new Date(call.time).toLocaleString(locale))}</p>${call.type === 'missed' ? '' : `<p>${e(t('Duration'))}: ${duration(call.duration||0)}</p>`}</div></div>`;
  }
  window.ICSPhoneCall={start,elapsed,finish,duration,render,details};
})();
