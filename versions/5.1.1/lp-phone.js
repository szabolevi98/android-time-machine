/* Phone on Android 5.1.1 (lp-dialer.js draws it), moved out of simulator.js
   (docs/plans/engine-migration.md; the code moved unchanged).
   - the dialer's tabs, dialpad, search, call log and its menus and dialogs; calls and the in-call screen
     (lp.startPhoneCall); the Phone's settings (lp-dialer-prefs.js); Back and Clear data */
'use strict';
LP.define('phone', ({
  captureRecentView, home, i18n, openApp, overlayRoot, render, renderOverlay, safe, save, storeContext, toast, ui,
  viewport
}, lp) => {
  // Toast.LENGTH_SHORT (NotificationManagerService.SHORT_DELAY, 2 s) inside Animation.Toast: toast_enter fades in and
  // toast_exit fades out over config_longAnimTime (500 ms) with decelerate_quad / accelerate_quad.
  // The dialer's screens read the GoogleDialer rows keyed 'Phone|…' first (lp-strings.txt contexts).
  const phoneText = key => i18n.t(key, 'Phone');
  function renderPhone() {
    if(ui.activeCall)return ICSPhoneCall.render(ui.activeCall,contactByPhone(ui.activeCall.number),phoneText);
    if(ui.sub==='call-detail'){const call=(lp.data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return ICSPhoneCall.details(call,contactByPhone(call.number),phoneText,i18n.locale());}
    // Google Dialer 5.1 (lp-dialer.js): speed dial, recents and contacts tabs, search, the sliding dialpad, History.
    return LPDialer.render({data: lp.data, ui, t: phoneText, locale: i18n.locale(), byPhone: contactByPhone});
  }
  function contactByPhone(number) { const normalized = String(number).replace(/[^\d+]/g, ''); return lp.data.contacts.find(item => item.phone.replace(/[^\d+]/g, '') === normalized); }
  function startPhoneCall(number) {
    if(!number)return;
    if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
    captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,7);
    ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
  }
  Object.assign(lp, {contactByPhone, phoneText, startPhoneCall});
  return {
    input(event) {
      if (event.target.matches?.('[data-kk-dialer-search]')) {
        ui.phoneSearch = event.target.value;
        const list = viewport.querySelector('[data-kk-dialer-list]');
        if (list) { const fresh = document.createElement('div'); fresh.innerHTML = LPDialer.render({data: lp.data, ui, t: phoneText, locale: i18n.locale(), byPhone: contactByPhone}); list.innerHTML = fresh.querySelector('[data-kk-dialer-list]').innerHTML; i18n.translateDOM?.(list); }
        return true;
      }
      return false;
    },
    clearData() {
      lp.data.callHistory=[];ui.activeCall=null;
      return false;
    },
    back() {
      if(ui.view==='phone' && !ui.activeCall && ui.kkDialpad){ui.kkDialpad=false;ui.dial='';render();return true;}
      if(ui.view==='phone' && !ui.activeCall && ['kk-history','kk-all'].includes(ui.sub)){ui.sub='';render();return true;}
      if(ui.view==='phone' && !ui.activeCall && ui.sub==='call-detail'){ui.sub=ui.kkLogFrom||'';render();return true;}
      if(ui.view==='phone' && !ui.activeCall && (ui.lpSearchOpen || (ui.phoneSearch||'').trim())){ui.phoneSearch='';ui.lpSearchOpen=false;render();return true;}
      if(ui.view==='phone' && ui.activeCall){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return true;}
      return false;
    },
    backPrefs() {
      if (ui.view === 'phone' && !ui.overlay && LPDialerPrefs.back(ui)) { render(); return true; }
      return false;
    },
    render() {
      if (ui.view === 'phone' && LPDialerPrefs.PAGES.includes(ui.sub)) return LPDialerPrefs.render({data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
      // Import from SIM card, opened from the Phone too (lp-people.js draws it).
      if (ui.sub === 'sim-import' && ui.view === 'phone') return StoreHost.render('people', storeContext());
      return renderPhone();
    },
    overlays: {
      'phone-menu'() {
        // The dialer's popup menus (LPDialer.menu); the dialpad's opens over its overflow button (PopupMenu, overlapAnchor).
        const items = LPDialer.menu(ui.phoneMenu, {data: lp.data, t: phoneText, byPhone: contactByPhone});
        overlayRoot.innerHTML = `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu lpd-menu${ui.phoneMenu === 'dialpad' ? ' lpd-menu-pad' : ''}" role="menu" data-no-translate>${items.map(([action, title]) => { const [act, arg] = action.split(/:(.*)/); return `<button role="menuitem" data-action="${act}"${arg ? ` data-id="${safe(arg)}"` : ''}>${safe(title)}</button>`; }).join('')}</div>`;
        const anchor = ui.phoneMenu === 'dialpad' && viewport.querySelector('.lpd-digits-menu'), list = overlayRoot.querySelector('.lpd-menu');
        if (anchor && list) { const a = anchor.getBoundingClientRect(), box = overlayRoot.getBoundingClientRect(), scale = box.width / overlayRoot.offsetWidth || 1; list.style.left = `${(a.left - box.left) / scale}px`; list.style.top = `${(a.top - box.top) / scale}px`; list.style.right = 'auto'; }
      },
      'lpd-confirm'() {
        overlayRoot.innerHTML = LPDialer.confirm(ui.lpdConfirm, phoneText);
      },
    },
    click(action, button, event) {
      const {id} = button.dataset;
      if ((action.startsWith('dpr-')) && ui.view === 'phone') {
        if (action === 'dpr-settings') { ui.overlay = ''; renderOverlay(); ui.dialerBack = [ui.sub || '']; ui.sub = 'dialer-settings'; ui.dialerDialog = ''; render(); return; }
        if (action === 'dpr-ringtone') { ui.settingsField = 'ringtone'; ui.overlay = 'sd-dialog'; renderOverlay(); return; }
        // Voicemail's Sound: a notification sound of its own; Nearby places' button opens Settings › Location.
        if (action === 'dpr-vmtone') { ui.settingsField = 'vmTone'; ui.overlay = 'sd-dialog'; renderOverlay(); return; }
        if (action === 'dpr-location') { openApp('settings'); ui.sub = 'location'; render(); return; }
        const result = LPDialerPrefs.handle(action, id, {data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()});
        if (result?.vmnumber) { LPDialerPrefs.saveVoicemail(viewport.querySelector('.ldp2-edit input')?.value || '', {data: lp.data, ui}); save(); render(); return; }
        if (result?.submit) { LPDialerPrefs.saveQuick(viewport.querySelector('.ldp2-edit input')?.value || '', {data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()}); save(); render(); return; }
        if (result === 'save') save();
        if (result) { render(); return; }
      }
      switch (action) {
        case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; render(); break;
        case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
        case 'phone-menu': ui.phoneMenu = id || ''; ui.overlay = 'phone-menu'; renderOverlay(); break;
        case 'dial-pause': case 'dial-wait': ui.dial = (ui.dial + (action === 'dial-pause' ? ',' : ';')).slice(0, 30); ui.overlay = ''; render(); break;
        case 'phone-add-contact': { const number = id || ui.dial; openApp('people'); lp.editPerson(true); ui.peopleDraft.phone = number; render(); break; }
        case 'phone-new-contact': openApp('people'); lp.editPerson(true); render(); break;
        case 'phone-dial-sms': ui.overlay = ''; renderOverlay(); { const recipient = ICSMessaging.recipient(ui.dial, lp.data.contacts); if (recipient) lp.openMessageThread(recipient.key); else toast('Enter a valid phone number'); } break;
        case 'lpd-clear-frequents': case 'lpd-clear-log': ui.lpdConfirm = action === 'lpd-clear-log' ? 'log' : 'frequents'; ui.overlay = 'lpd-confirm'; renderOverlay(); break;
        case 'lpd-clear-frequents-ok': lp.data.frequentsClearedAt = Date.now(); save(); ui.overlay = ''; render(); break;
        case 'lpd-clear-log-ok': lp.data.callHistory = []; ui.lpLogExpanded = null; save(); ui.overlay = ''; render(); break;
        case 'lpd-edit-before-call': { const call = (lp.data.callHistory || []).find(c => c.time === ui.phoneCallId); ui.overlay = ''; ui.sub = ''; ui.kkDialpad = true; ui.lpSearchOpen = false; ui.phoneSearch = ''; ui.dial = (call?.number || '').slice(0, 30); render(); break; }
        case 'lpd-remove-call': lp.data.callHistory = (lp.data.callHistory || []).filter(c => c.time !== ui.phoneCallId); ui.lpLogExpanded = null; save(); ui.sub = ui.kkLogFrom || ''; render(); break;
        case 'phone-redial': startPhoneCall(id); break;
        case 'dial': if (ui.dial.length < 30) ui.dial += id; render(); break;
        case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
        case 'smartdial-call': if (id) { ui.dial = id; startPhoneCall(id); } break;
        case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
        case 'hangup': if(ui.activeCall)lp.data.callHistory=[...(lp.data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();ui.sub='';ui.dial='';render();toast('Call ended');break;
        case 'incall-toggle': if(ui.activeCall)ui.activeCall[id]=!ui.activeCall[id];render();break;
        case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
        case 'phone-log-detail': ui.kkLogFrom=ui.sub==='kk-history'?'kk-history':'';ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
        case 'phone-log-back': ui.sub=ui.kkLogFrom||'';ui.phoneTab='history';render();break;
        case 'kk-dialer-history': ui.sub = 'kk-history'; ui.kkDialpad = false; ui.overlay = ''; render(); break;
        case 'kk-dialer-back': ui.sub = ''; render(); break;
        case 'kk-dialer-log-tab': ui.kkLogTab = id; render(); break;
        case 'kk-dialer-pad': ui.kkDialpad = true; ui.lpSearchOpen = false; ui.phoneSearch = ''; render(); break;
        case 'lpd-tab': ui.lpDialTab = id; ui.lpLogExpanded = null; render(); viewport.querySelector('.lpd-pane')?.scrollTo(0, 0); break;
        case 'lpd-search-open': ui.lpSearchOpen = true; render(); viewport.querySelector('[data-kk-dialer-search]')?.focus(); break;
        case 'lpd-search-close': ui.lpSearchOpen = false; ui.phoneSearch = ''; render(); break;
        case 'lpd-log-expand': ui.lpLogExpanded = ui.lpLogExpanded === Number(id) ? null : Number(id); render(); break;
        case 'lpd-dismiss-card': ui.kkRecentDismissed = [...(ui.kkRecentDismissed || []), Number(id)]; render(); break;
        case 'kk-dialer-clear': ui.phoneSearch = ''; render(); viewport.querySelector('[data-kk-dialer-search]')?.focus(); break;
        case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,lp.data.contacts); if(recipient)lp.openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
        default: return false;
      }
      return true;
    },
    submit(name, values, event, form) {
      if (form.dataset.form === 'dpr-vmnumber') { LPDialerPrefs.saveVoicemail(values.get('text') || '', {data: lp.data, ui}); save(); render(); return; }
      if (form.dataset.form === 'dpr-quick') { LPDialerPrefs.saveQuick(values.get('text') || '', {data: lp.data, ui, t: key => i18n.t(key), locale: i18n.locale()}); save(); render(); return; }
      if (form.dataset.form === 'phone-search') { ui.phoneSearch = String(values.get('query') || '').trim(); render(); return; }
      switch (name) {
        default: return false;
      }
      return true;
    }
  };
});
