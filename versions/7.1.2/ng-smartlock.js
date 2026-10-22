/* Smart Lock (Settings › Security › Smart Lock, GmsCore 9.8's GoogleTrustAgentPersonalUnlockingSettings, after the screen
   lock is confirmed) and FaceLock's Trusted Face setup, as Settings pages:
   - the list: On-body detection, Trusted places, Trusted devices, Trusted face, Trusted voice (the Google app's Voice
     Match is not set up, so it opens the hotword setup), with the menu's How it works and Help;
   - On-body detection: the switch bar, auth_illustration_on_body_detection and the "Keep in mind" dialog;
   - Trusted places: Home from Google Maps (set in Maps) and the places added here (name and address);
   - Trusted devices: Add trusted device → Bluetooth (the bonded devices) or NFC, the "Add trusted device?" question,
     a device's Connected / Not connected state and removal;
   - Trusted face: FaceLock's intro, instructions, enrollment (camera preview inside the dotted circle until Face added)
     and end screens; afterwards Improve face matching and Remove trusted face.
   NG.trustAgent.trusted(c) tells the keyguard when an agent keeps the phone unlocked (after the screen lock has been
   used once since boot): on-body detection, a trusted face, or a trusted Bluetooth device connected. */
(() => {
  'use strict';
  const T=()=>NG.text('smartlock'),t=k=>T().t(k),f=(k,...a)=>T().fmt(k,null,...a);
  const S=c=>{const s=c.data.smartLock ||= {onBody:false,face:false,places:[],devices:[]};s.places ||= [];s.devices ||= [];return s;};
  const bt=c=>(NG.system?.btDevices?.(c)||[]).filter(d=>d.bonded);
  const row=(c,r)=>({html:NG.settingsRow(c,r),sel:true}),cat=(c,k)=>({html:NG.settingsCat(c,t(k)),sel:false}),list=items=>`<div class="ngst-list">${NG.settingsJoinRows(items)}</div>`;
  NG.trustAgent={trusted(c){if(!c.ui.trustArmed)return false;const s=S(c);if(s.onBody||s.face)return true;const on=bt(c).filter(d=>d.connected).map(d=>d.address||d.name);return s.devices.some(d=>on.includes(d.id));}};
  function deviceSummary(c){const n=S(c).devices.map(d=>d.name);return n.length===1?f('auth_trust_agent_pref_trusted_devices_one_device_setup_summary',n[0]):n.length?f('auth_trust_agent_pref_trusted_devices_multiple_devices_setup_summary',n.join(', ')):t('auth_trust_agent_pref_trusted_devices_default_summary');}
  function placeSummary(c){const p=S(c).places;return p.length?f('auth_trust_agent_pref_trusted_places_configured_summary',p.map(x=>x.name).join(', ')):t('auth_trust_agent_pref_trusted_places_default_summary');}
  const go=(c,screen,key)=>NG.settingsGo(c,screen,t(key));
  const screens={
    smartlock:{actions:c=>NG.menu.button(c),render:c=>{const s=S(c);return list([
      row(c,{title:t('auth_trust_agent_pref_activity_recognition_unlock_title'),summary:t(s.onBody?'auth_trust_agent_pref_on_body_detection_enabled_summary':'auth_trust_agent_pref_on_body_detection_disabled_summary'),action:'ngsl-go',data:' data-to="smartlock-body" data-t="auth_trust_agent_pref_activity_recognition_unlock_title"'}),
      row(c,{title:t('auth_trust_agent_pref_trusted_places_title'),summary:placeSummary(c),action:'ngsl-go',data:' data-to="smartlock-places" data-t="auth_trust_agent_pref_trusted_places_title"'}),
      row(c,{title:t('auth_trust_agent_pref_trusted_devices_title'),summary:deviceSummary(c),action:'ngsl-go',data:' data-to="smartlock-devices" data-t="auth_trust_agent_pref_trusted_devices_title"'}),
      row(c,{title:t('auth_trust_agent_pref_face_unlock_title'),summary:t(s.face?'auth_trust_agent_pref_face_unlock_enabled_summary':'auth_trust_agent_pref_face_unlock_disabled_summary'),action:'ngsl-face'}),
      row(c,{title:t('auth_trust_agent_pref_voice_unlock_title'),summary:t('auth_trust_agent_pref_voice_unlock_disabled_summary'),action:'ngsl-voice'})]);}},
    'smartlock-body':{bar:c=>NG.settingsSwitchBar(c,S(c).onBody,'ngsl-body'),render:c=>`<div class="ngsl-onbody"><img src="assets/sl-on-body.png" alt=""><b>${c.safe(t('auth_trust_agent_on_body_detection_prompt_title'))}</b><p>${c.safe(t('auth_trust_agent_on_body_detection_prompt_content'))}</p></div>`},
    'smartlock-places':{render:c=>list([cat(c,'auth_trust_agent_pref_trusted_places_from_google_maps_title'),row(c,{title:t('auth_trust_agent_pref_trusted_places_home_title'),summary:t('auth_trust_agent_pref_trusted_places_none_home_summary'),action:'ngsl-maps'}),...S(c).places.map((p,i)=>row(c,{title:p.name,summary:p.address,action:'ngsl-place',data:` data-i="${i}"`})),row(c,{title:t('auth_trust_agent_pref_trusted_places_add_trusted_place_title'),icon:'<img src="assets/sl-add.png" alt="">',action:'ngsl-add-place'})])},
    'smartlock-devices':{render:c=>{const on=bt(c).filter(d=>d.connected).map(d=>d.address||d.name);return list([...S(c).devices.map((d,i)=>row(c,{title:d.name,summary:t(on.includes(d.id)?'auth_trust_agent_pref_trusted_devices_connected':'auth_trust_agent_pref_trusted_devices_not_connected'),action:'ngsl-device',data:` data-i="${i}"`})),row(c,{title:t('auth_trust_agent_add_trusted_device_prompt'),action:'ngsl-add-device'})]);}}
  };
  // FaceLock's activities (SetupIntro, SetupInstructionsScreen, AddToSetup, SetupEnrollmentScreen, SetupEndScreen): each
  // lays out under the transparent status bar (setSystemUiVisibility 1280) and replaces the previous one without an
  // animation. The banner is bg_*_illustration_header over the bg_tile title; bullets are FaceLockUtil's BulletSpans.
  const bullets=(c,k,cls='')=>`<p class="ngsl-bullets${cls}">${T().t(k).split('\n').map(l=>l.trim()?`<span>${c.safe(l)}</span>`:'<br>').join('')}</p>`;
  const bar=(c,next,nextKey)=>`<footer class="ngsl-bar"><button type="button" data-action="ngsl-face-cancel">${c.safe(t('shared_cancel_label'))}</button><button type="button" data-action="${next}">${c.safe(t(nextKey))}</button></footer>`;
  const banner=(c,img,title)=>`<img class="ngsl-head" src="assets/${img}" alt=""><h1 class="ngsl-title">${c.safe(t(title))}</h1>`;
  function face(c){const st=c.ui.faceSetup||'intro';
    if(st==='intro')return `<div class="ngsl-face">${banner(c,'sl-face-setup.png','intro_screen_title')}<div class="ngsl-body"><h2>${c.safe(t('intro_screen_header'))}</h2><p>${c.safe(t('intro_screen_body_start').trim())}</p>${bullets(c,'intro_screen_bullets')}</div>${bar(c,'ngsl-face-next','intro_screen_continue_label')}</div>`;
    if(st==='instructions')return `<div class="ngsl-face">${banner(c,'sl-face-setup.png','instructions_screen_title')}<div class="ngsl-body"><h2>${c.safe(t('instructions_screen_header'))}</h2>${bullets(c,'instructions_screen_bullets',' sub')}</div>${bar(c,'ngsl-face-enroll','instructions_screen_continue_label')}</div>`;
    if(st==='improve')return `<div class="ngsl-face">${banner(c,'sl-face-setup.png','add_to_setup_intro_screen_title')}<div class="ngsl-body"><h2>${c.safe(t('add_to_setup_intro_screen_header'))}</h2><p>${c.safe(t('add_to_setup_intro_screen_body_start').trim())}</p>${bullets(c,'add_to_setup_intro_screen_bullets')}<p>${c.safe(t('add_to_setup_intro_screen_body_end'))}</p></div>${bar(c,'ngsl-face-enroll','add_to_setup_intro_screen_continue_label')}</div>`;
    if(st==='enroll')return `<div class="ngsl-face ngsl-enroll" style="--p:0"><h1 class="ngsl-title">${c.safe(t(c.ui.faceImprove?'add_to_setup_intro_screen_title':'instructions_screen_title'))}</h1>
      <div class="ngsl-stage"><div class="ngsl-preview" role="img" aria-label="${c.safe(t('enrollment_screen_talkback_preview_description'))}">${NG.media.svg({id:'facelock',seed:7,time:Date.now(),front:true},'ngsl-scene')}</div>
        <div class="ngsl-done"><img src="assets/sl-face-done.png" alt=""><b>${c.safe(t('enrollment_screen_message_done'))}</b></div>
        <div class="ngsl-col"><div class="ngsl-ringbox"><div class="ngsl-ringsq"><i class="ngsl-hole"></i><i class="ngsl-ring"></i></div></div><span class="ngsl-status">${c.safe(t('enrollment_screen_status_no_face'))}</span>
          <div class="ngsl-overlay"><p class="ngsl-message">${c.safe(t('enrollment_screen_message_initializing'))}</p><footer class="ngsl-bar"><button type="button" data-action="ngsl-face-cancel">${c.safe(t('shared_cancel_label'))}</button></footer></div></div></div></div>`;
    return `<div class="ngsl-face">${banner(c,'sl-face-allset.png','end_screen_title')}<div class="ngsl-body"><h2>${c.safe(t('end_screen_body'))}</h2><div class="ngsl-point"><img src="assets/sl-lock-open.png" alt=""><p>${c.safe(t('end_screen_bullet_one_text'))}</p></div><div class="ngsl-point"><img src="assets/sl-lock.png" alt=""><p>${c.safe(t('end_screen_bullet_two_text'))}</p></div><p class="ngsl-tip">${c.safe(t('end_screen_tip_text'))}</p></div><footer class="ngsl-bar"><button type="button" class="second" data-action="ngsl-face-licenses">${c.safe(t('end_screen_licenses_label'))}</button><button type="button" data-action="ngsl-face-done">${c.safe(t('end_screen_continue_label'))}</button></footer></div>`;}
  // SetupEnrollmentScreen: the first preview frame replaces "Starting up…" with the instructions; a frame is taken every
  // 660 ms and each match fills one of the ProgressRing's 10 steps. The last one writes the gallery (the face is trusted
  // from then on), drops the scrim's opening, fades the ring and slides the bottom overlay away in 300 ms, raises the
  // checkmark and "Face added" by 50 dp (delays 300 / 500 ms, 200 ms), and 1 s later SetupEndScreen replaces it (the
  // improve flow just finishes).
  function enroll(c,root){clearTimeout(c.ui.faceTimer);const el=root.querySelector('.ngsl-enroll');if(!el)return;let n=0;
    const alive=()=>el.isConnected&&c.ui.faceSetup==='enroll';
    const step=()=>{if(!alive())return;n++;el.style.setProperty('--p',n/10);
      if(n<10){c.ui.faceTimer=setTimeout(step,660);return;}
      S(c).face=true;c.save();el.classList.add('done');
      c.ui.faceTimer=setTimeout(()=>{if(!alive())return;if(c.ui.faceImprove){c.ui.faceSetup='';NG.settingsBack(c);}else{c.ui.faceSetup='end';c.render();}},1300);};
    c.ui.faceTimer=setTimeout(()=>{if(!alive())return;el.querySelector('.ngsl-message').textContent=t('enrollment_screen_message_instructions');c.ui.faceTimer=setTimeout(step,660);},500);}
  screens['smartlock-face']={full:true,underStatus:()=>true,statusColor:()=>'transparent',render:c=>face(c),mount:(c,root)=>{if(c.ui.faceSetup==='enroll')enroll(c,root);},back:c=>{clearTimeout(c.ui.faceTimer);c.ui.faceSetup='';return false;}};
  for(const [k,v] of Object.entries(screens))NG.settingsScreens[k]={...v,action:(c,name,el)=>action(c,name,el)};
  function action(c,name,el){const s=S(c);
    if(name==='ng-menu'){c.menu([{label:t('auth_trust_agent_personal_unlocking_action_how_it_works'),action:c=>c.open('chrome','url:https://support.google.com/nexus/answer/6093922')},{label:t('auth_trust_agent_personal_unlocking_action_help'),action:c=>c.open('help','settings')}],el);return true;}
    if(!name.startsWith('ngsl-'))return false;
    switch(name.slice(5)){
      case 'go':go(c,el.dataset.to,el.dataset.t);return true;
      case 'body':if(s.onBody){s.onBody=false;c.save();c.render();}else c.dialog({title:t('auth_trust_agent_dialog_on_body_detection_title'),message:t('auth_trust_agent_dialog_on_body_detection_message'),buttons:[{label:NG.text('framework').t('cancel')},{label:t('auth_trust_agent_dialog_continue'),action:c=>{s.onBody=true;c.save();c.render();}}]});return true;
      case 'maps':c.open('maps');return true;
      case 'add-place':{if(c.data.settings.location===false){c.dialog({message:t('auth_trust_agent_trusted_place_gps_off'),buttons:[{label:NG.text('framework').t('ok')}]});return true;}let name='',address='';c.dialog({title:t('auth_trust_agent_pref_trusted_places_add_trusted_place_title'),html:`<div class="ngst-edit ngsl-placeform"><input class="ngst-input" data-f="name" placeholder="${c.safe(t('auth_trust_agent_trusted_places_place_name_hint'))}"><input class="ngst-input" data-f="address" placeholder="${c.safe(t('auth_trust_agent_trusted_places_place_address_hint'))}"></div>`,mount:(c,win)=>{win.querySelectorAll('input').forEach(i=>i.addEventListener('input',()=>{if(i.dataset.f==='name')name=i.value;else address=i.value;}));},buttons:[{label:NG.text('framework').t('cancel')},{label:NG.text('framework').t('ok'),action:c=>{const n=name.trim()||address.trim()||t('auth_trust_agent_trusted_places_place_dropped_pin');if(s.places.some(p=>p.name===n)){c.toast(t('auth_trust_agent_add_trusted_place_duplicated_place'));return;}s.places.push({name:n,address:address.trim()||t('auth_trust_agent_trusted_places_place_unknown_place')});c.save();c.render();}}]});return true;}
      case 'place':{const i=+el.dataset.i;c.dialog({title:s.places[i].name,message:s.places[i].address,buttons:[{label:NG.text('framework').t('cancel')},{label:NG.text('settings').t('forget'),action:c=>{s.places.splice(i,1);c.save();c.render();}}]});return true;}
      case 'add-device':c.dialog({title:t('auth_trust_agent_trusted_devices_choose_device_type_title'),items:[{html:c.safe(t('auth_trust_agent_trusted_devices_add_device_bluetooth_option'))},{html:c.safe(t('auth_trust_agent_trusted_devices_add_device_nfc_option'))}],onItem:(i,c)=>{if(i===1){c.toast(t('auth_trust_agent_trusted_devices_prompt_subtitle'));return;}if(!c.data.settings.bluetooth){c.dialog({message:t('auth_trust_agent_trusted_devices_add_device_bluetooth_disable_summary'),buttons:[{label:NG.text('framework').t('ok')}]});return;}const list=bt(c).filter(d=>!s.devices.some(x=>x.id===(d.address||d.name)));c.dialog({title:t('auth_trust_agent_trusted_devices_choose_device_title'),items:list.length?list.map(d=>({html:c.safe(d.name)})):[{html:c.safe(t('auth_trust_agent_pref_add_devices_not_available'))}],onItem:(j,c)=>{const d=list[j];if(!d)return;c.dialog({title:t('auth_trust_agent_trusted_Device_add_trusted_device'),message:f('auth_trust_agent_trusted_bt_device_always_unlock_info',d.name),buttons:[{label:NG.text('framework').t('cancel')},{label:t('auth_trust_agent_trusted_devices_add'),action:c=>{s.devices.push({id:d.address||d.name,name:d.name});c.save();c.render();}}]});}});}});return true;
      case 'device':{const i=+el.dataset.i;c.dialog({title:s.devices[i].name,message:t('auth_trust_agent_trusted_devices_remove_message'),buttons:[{label:NG.text('framework').t('cancel')},{label:t('auth_trust_agent_trusted_devices_remove'),action:c=>{s.devices.splice(i,1);c.save();c.render();}}]});return true;}
      case 'face':if(s.face){c.dialog({title:t('auth_trust_agent_pref_face_unlock_title'),items:[{html:c.safe(t('auth_trust_agent_pref_face_unlock_improve_title'))},{html:c.safe(t('auth_trust_agent_pref_face_unlock_reset_title'))}],onItem:(i,c)=>{if(i===0){c.ui.faceSetup='improve';c.ui.faceImprove=true;go(c,'smartlock-face','add_to_setup_intro_screen_title');return;}c.dialog({title:t('auth_trust_agent_pref_face_unlock_reset_dialog_title'),message:t('auth_trust_agent_pref_face_unlock_reset_dialog_message'),buttons:[{label:NG.text('framework').t('cancel')},{label:t('auth_trust_agent_pref_face_unlock_reset_dialog_reset'),action:c=>{s.face=false;c.save();c.render();}}]});}});return true;}c.ui.faceSetup='intro';c.ui.faceImprove=false;go(c,'smartlock-face','intro_screen_title');return true;
      case 'face-next':c.ui.faceSetup='instructions';c.transition('none');c.render();return true;
      case 'face-enroll':c.ui.faceSetup='enroll';c.transition('none');c.render();return true;
      case 'face-cancel':case 'face-done':clearTimeout(c.ui.faceTimer);c.ui.faceSetup='';NG.settingsBack(c);return true;
      case 'face-licenses':c.dialog({html:`<div class="ngsl-license"><h2>${c.safe(t('license_screen_title'))}</h2><div class="ngsl-licbody"><b>${c.safe(t('license_screen_header'))}</b><p>${c.safe(t('license_screen_description'))}</p><b class="gap">${c.safe(t('license_screen_notices_header'))}</b><p>${c.safe(t('license_screen_body'))}</p></div></div>`,buttons:[{label:t('license_screen_continue_label')}]});return true;
      case 'voice':c.open('search','hotword');return true;
      default:return false;
    }}
})();
