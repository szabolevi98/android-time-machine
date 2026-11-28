/* Android 2.3.6 Contacts / Dialtacts (packages/apps/Contacts, layout-finger): the TabWidget with Phone, Call log,
   Contacts and Favorites (framework tab_indicator.xml, 64 dip), TwelveKeyDialer (twelve_key_dialer.xml, dialpad.xml,
   voicemail_dial_delete.xml), RecentCallsListActivity, ContactsListActivity and ViewContactActivity.
   hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-contacts.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const text = (lang, key, app = 'contacts') => AndroidStrings.resources(() => window.GBStrings?.[app]).t(key, lang);
  const phoneText = (lang, key) => text(lang, key, 'phone');
  const TABS = [['dialpad', 'dialerIconLabel', 'dialer'], ['history', 'recentCallsIconLabel', 'recent'], ['contacts', 'contactsIconLabel', 'contacts'], ['favorites', 'contactsFavoritesLabel', 'starred']];
  const KEYS = [['1', 'dial_num_1_no_vm'], ['2', 'dial_num_2'], ['3', 'dial_num_3'], ['4', 'dial_num_4'], ['5', 'dial_num_5'], ['6', 'dial_num_6'], ['7', 'dial_num_7'], ['8', 'dial_num_8'], ['9', 'dial_num_9'], ['*', 'dial_num_star'], ['0', 'dial_num_0'], ['#', 'dial_num_pound']];

  function tabs(current, lang) {
    return `<div class="gbp-tabs" role="tablist">${TABS.map(([id, label, icon]) => `<button class="gbp-tab${current === id ? ' selected' : ''}" role="tab" aria-selected="${current === id}" data-action="phone-tab" data-id="${id}"><img src="assets/gb-c-ic_tab_${current === id ? 'selected' : 'unselected'}_${icon}.png" alt=""><span>${e(text(lang, label))}</span></button>`).join('')}</div>`;
  }
  // TwelveKeyDialer: the 67 dip digits field (33 sp), the ButtonGridLayout of 88 x 50 dp keys with white digits that turn
  // black on the green pressed key, then voicemail / dial / delete.
  function dialer(dial) {
    return `<div class="gbp-dialer"><div class="gbp-digits${dial ? ' filled' : ''}"><output aria-label="Phone number">${e(dial)}</output></div><div class="gbp-pad">${KEYS.map(([key, art]) => `<button class="gbp-key" data-action="dial" data-id="${e(key)}" aria-label="${e(key)}" style="--wht:url('assets/gb-c-${art}_wht.png');--blk:url('assets/gb-c-${art}_blk.png')"></button>`).join('')}</div><div class="gbp-actions"><button class="gbp-voicemail" data-action="gbp-voicemail" aria-label="Voicemail"><img src="assets/gb-c-ic_dial_action_voice_mail.png" alt=""></button><button class="gbp-dial" data-action="call" aria-label="Dial"><img src="assets/gb-c-ic_dial_action_call.png" alt=""></button><button class="gbp-delete" data-action="dial-delete" aria-label="Delete"><img src="assets/gb-c-ic_dial_action_delete.png" alt=""></button></div></div>`;
  }
  // RecentCallsListItemView: name or number (22 sp), then the call type arrow, the number label (bold) and the relative
  // date (14 sp); a 1 px divider and the call button on the right.
  function relative(time, now, locale) {
    const minutes = Math.max(0, Math.round((now - time) / 60000));
    const rtf = new Intl.RelativeTimeFormat(locale, {numeric: 'auto'});
    if (minutes < 60) return rtf.format(-minutes, 'minute');
    if (minutes < 1440) return rtf.format(-Math.round(minutes / 60), 'hour');
    return rtf.format(-Math.round(minutes / 1440), 'day');
  }
  function callLog(calls, contactOf, ctx) {
    if (!calls.length) return `<p class="gbp-empty">${e(text(ctx.lang, 'recentCalls_empty'))}</p>`;
    return `<div class="gbp-list">${[...calls].reverse().map(call => {
      const person = contactOf(call.number), type = call.type || 'outgoing';
      return `<div class="gbp-log"><button class="gbp-log-main" data-action="phone-log-detail" data-id="${call.time}"><span class="gbp-log-name">${e(person?.name || call.number)}</span><span class="gbp-log-meta"><img src="assets/gb-c-ic_call_log_list_${type === 'missed' ? 'missed' : type === 'incoming' ? 'incoming' : 'outgoing'}_call.png" alt="">${person ? `<b>${e(ctx.t('Mobile'))}</b> ` : ''}${e(relative(call.time, ctx.now, ctx.locale))}</span></button><i class="gbp-divider"></i><button class="gbp-log-call" data-action="phone-redial" data-id="${e(call.number)}" aria-label="${e(AndroidStrings.format(text(ctx.lang, 'recentCalls_callNumber'), person?.name || call.number))}"><img src="assets/gb-c-badge_action_call.png" alt=""></button></div>`;
    }).join('')}</div>`;
  }
  // ContactsListActivity: alphabetical with list_separator headers, a 48 dp QuickContactBadge and the 22 sp name.
  // Display options (gb-contacts-io.js): the visible groups, only contacts with phones, the sort key and the name order.
  function contacts(people, ctx, favorites = false) {
    const io = ctx.io, key = person => io ? io.key(person) : person.name, label = person => io ? io.name(person) : person.name;
    const sorted = [...(io && !favorites ? io.filter(people) : people)].sort((a, b) => key(a).localeCompare(key(b), ctx.locale));
    if (!sorted.length) return `<p class="gbp-empty">${e(text(ctx.lang, favorites ? 'noFavoritesHelpText' : 'noContactsHelpText')).replace(/\n/g, '<br>')}</p>`;
    let letter = '';
    return `<div class="gbp-list">${sorted.map(person => {
      const initial = favorites ? '' : key(person)[0].toLocaleUpperCase(ctx.locale);
      const header = initial && initial !== letter ? `<div class="gbp-section">${e(letter = initial)}</div>` : '';
      return `${header}<button class="gbp-contact" data-action="gbp-contact" data-id="${person.id}"><img src="${window.GBContactPhoto?.(person) || 'assets/gb-c-ic_contact_list_picture.png'}" alt=""><span>${e(label(person))}</span></button>`;
    }).join('')}</div>`;
  }
  // ViewContactActivity: the contact header (photo, name, star) and the data rows - call, text and email.
  function detail(person, ctx) {
    const T = key => text(ctx.lang, key);
    const row = (action, id, icon, title, value) => `<button class="gbp-data" data-action="${action}" data-id="${e(id)}"><span class="gbset-text"><span class="gbset-title">${e(title)}</span><span class="gbset-sum">${e(value)}</span></span><img src="assets/gb-c-${icon}.png" alt=""></button>`;
    return `<div class="gbp-detail"><div class="gbp-header"><img src="${window.GBContactPhoto?.(person) || 'assets/gb-c-ic_contact_picture.png'}" alt=""><span>${e(person.name)}</span><button data-action="people-star" data-id="${person.id}" aria-label="${e(T(person.favorite ? 'menu_removeStar' : 'menu_addStar'))}"><img src="assets/gb-btn_star_big_${person.favorite ? 'on' : 'off'}.png" alt=""></button></div><div class="gbp-list">${person.phone ? row('phone-redial', person.phone, 'badge_action_call', T(`call_${person.phoneType || 'mobile'}`), person.phone) + row('phone-log-message', person.phone, 'sym_action_sms', T(`sms_${person.phoneType || 'mobile'}`), person.phone) : ''}${person.email ? `<div class="gbset-cat">${e(ctx.t('Email'))}</div>` + row('gbp-email', person.email, 'sym_action_add', T(`email_${person.emailType === 'mobile' ? 'other' : person.emailType || 'home'}`), person.email) : ''}</div></div>`;
  }

  // CallDetailActivity (call_detail.xml, call_detail_list_item.xml): under the "Call details" title, the title_bar_tall
  // header with the 32 dip call type icon beside the type (textAppearanceLarge), the time (weekday, date, year and time)
  // and the duration ("%1$s mins %2$s secs", none for a missed call); then the actions, each with its 32 dip icon on the
  // right: the call ("Call <name>" with the label and number when the number is a contact's, else Call back / Call
  // again / Return call), Send text message, and View contact or Add to contacts.
  function callDetail(call, person, ctx) {
    const T = key => text(ctx.lang, key), type = call.type || 'outgoing';
    const when = new Date(call.time).toLocaleString(ctx.locale, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'});
    const secs = Math.max(0, Math.round(call.duration || 0)), duration = AndroidStrings.format(T('callDetailsDurationFormat'), Math.floor(secs / 60), secs % 60);
    const action = (act, id, icon, title, label = '', number = '') => `<button class="gbp-cd-action" data-action="${act}" data-id="${e(id)}"><span class="gbp-cd-copy"><span>${e(title)}</span>${number ? `<small>${label ? `<b>${e(label)}</b>` : ''}${e(number)}</small>` : ''}</span><img src="assets/${icon}.png" alt=""></button>`;
    const callText = person ? AndroidStrings.format(T('recentCalls_callNumber'), person.name) : T({incoming: 'callBack', outgoing: 'callAgain', missed: 'returnCall'}[type]);
    const kind = person?.phoneType || 'mobile', label = person ? T(`phoneType${kind[0].toUpperCase()}${kind.slice(1)}`) : '';
    return `<div class="gbp-calldetail"><div class="gb-titlebar">${e(T('callDetailTitle'))}</div><div class="gbp-cd-head"><img src="assets/gb-c-ic_call_log_header_${type}_call.png" alt=""><span><strong>${e(T(`type_${type}`))}</strong><small>${e(when)}</small>${type === 'missed' ? '' : `<small>${e(duration)}</small>`}</span></div><div class="gbp-cd-list">${action('phone-redial', call.number, 'gb-sym_action_call', callText, person ? label : '', call.number)}${action('phone-log-message', call.number, 'gb-c-sym_action_sms', T('menu_sendTextMessage'))}${person ? action('gbp-contact', person.id, 'gb-c-sym_action_view_contact', T('menu_viewContact')) : action('phone-add-contact', call.number, 'gb-c-sym_action_add', T('recentCalls_addToContact'))}</div></div>`;
  }

  // TwelveKeyDialer.showDialpadChooser: while a call is in progress the dialpad is replaced by a ListView of
  // dialpad_chooser_list_item rows (64 dp icon, textAppearanceMedium).
  function chooser(lang) {
    const rows = [['gbp-dtmf', 'dialer_useDtmfDialpad', 'tt_keypad'], ['gbp-return-call', 'dialer_returnToInCallScreen', 'current_call'], ['gbp-add-call', 'dialer_addAnotherCall', 'add_call']];
    return `<div class="gbp-list gbp-chooser">${rows.map(([action, key, icon]) => `<button class="gbp-choice" data-action="${action}"><img src="assets/gb-c-ic_dialer_fork_${icon}.png" alt=""><span>${e(text(lang, key))}</span></button>`).join('')}</div>`;
  }

  /* InCallScreen (Phone 2.3.6): incall_screen.xml mainFrame with the state gradient (updateInCallBackground), CallCard
     (call_card.xml, call_card_person_info.xml) and InCallTouchUi (incall_touch_ui.xml): the round Hold button, the
     non_drawer_dialpad and the bottom cluster - Add call / End / Dialpad, then Bluetooth / Mute / Speaker toggles.
     A local hang-up shows DISCONNECTING ("Hanging up") and then DISCONNECTED ("Call ended") before the screen closes. */
  const HANGING_UP = 600, ENDED = 400;
  function callState(call, now = Date.now()) {
    if (call.endedAt) return now < call.endedAt + HANGING_UP ? 'hanging' : 'ended';
    if (now < call.connected) return 'dialing';
    return call.hold ? 'holding' : 'active';
  }
  const elapsedText = (call, now = Date.now()) => { const seconds = Math.max(0, Math.floor(((call.endedAt || now) - call.connected) / 1000)); return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`; };
  function background(call, state) {
    if (state === 'ended') return 'ended';
    if (state === 'holding') return 'on_hold';
    if (call.bluetooth) return 'bluetooth';
    return state === 'dialing' || call.endedAt < call.connected ? 'unidentified' : 'connected';
  }
  // CallCard.updateCardTitleWidgets: the upper title for DIALING and DISCONNECTING/DISCONNECTED, the elapsed time
  // in green (blue with Bluetooth) while ACTIVE, red after the call ended and "On hold" in orange while HOLDING.
  function card(call, state, ctx) {
    const P = key => phoneText(ctx.lang, key), person = ctx.person;
    const title = {dialing: P('card_title_dialing'), hanging: P('card_title_hanging_up'), ended: P('card_title_call_ended')}[state] || '';
    const elapsed = state === 'holding' ? P('card_title_on_hold') : state === 'dialing' || call.endedAt < call.connected ? '' : elapsedText(call, ctx.now);
    return `<div class="gbic-card"><div class="gbic-title">${e(title)}</div><div class="gbic-photo-row"><img class="gbic-photo" src="${window.GBContactPhoto?.(person) || 'assets/gb-p-picture_unknown.png'}" alt="${e(P('contactPhoto'))}"><span class="gbic-elapsed">${e(elapsed)}</span></div><div class="gbic-name">${e(person?.name || call.number)}</div>${person ? `<div class="gbic-number"><span>${e(ctx.t('Mobile'))}</span><span>${e(call.number)}</span></div>` : ''}</div>`;
  }
  function inCall(call, ctx) {
    const P = key => phoneText(ctx.lang, key), now = ctx.now ?? Date.now(), state = callState(call, now);
    const connected = state === 'active' || state === 'holding', live = state !== 'ended';
    const keypad = !!call.keypad && state === 'active';
    const button = (action, id, label, icon, enabled, cls = '') => `<button class="gbic-btn${cls}" data-action="${action}"${id ? ` data-id="${id}"` : ''}${enabled ? '' : ' disabled'}><img src="assets/gb-p-${icon}.png" alt=""><span>${e(label)}</span></button>`;
    const toggle = (id, label, enabled) => `<button class="gbic-toggle" data-action="incall-toggle" data-id="${id}" aria-pressed="${!!call[id] && enabled}"${enabled ? '' : ' disabled'}><span>${e(label)}</span></button>`;
    const holdLabel = P(call.hold ? 'onscreenUnholdText' : 'onscreenHoldText');
    const hold = connected && !keypad ? `<div class="gbic-hold"><button data-action="incall-toggle" data-id="hold" aria-label="${e(holdLabel)}"><img src="assets/gb-p-ic_in_call_touch_round_${call.hold ? 'unhold' : 'hold'}.png" alt=""></button><span>${e(holdLabel)}</span></div>` : '';
    const pad = keypad ? `<div class="gbic-dtmf"><output>${e(call.digits)}</output><div class="gbic-pad">${KEYS.map(([key, art]) => `<button class="gbic-key" data-action="incall-digit" data-id="${e(key)}" aria-label="${e(key)}" style="--wht:url('assets/gb-c-${art}_wht.png');--blk:url('assets/gb-c-${art}_blk.png')"></button>`).join('')}</div></div>` : '';
    const row1 = button('gbp-add-call', '', P('onscreenAddCallText'), 'ic_in_call_touch_add_call', connected) + button('hangup', '', P('onscreenEndCallText'), 'ic_in_call_touch_end', state !== 'hanging', ' gbic-end') + button('incall-toggle', 'keypad', P(keypad ? 'onscreenHideDialpadText' : 'onscreenShowDialpadText'), keypad ? 'ic_in_call_touch_dialpad_close' : 'ic_in_call_touch_dialpad', state === 'active');
    const row2 = toggle('bluetooth', P('onscreenBluetoothText'), !!ctx.bluetoothAvailable) + toggle('mute', P('onscreenMuteText'), state !== 'holding') + toggle('speaker', P('onscreenSpeakerText'), true);
    const controls = live ? `<div class="gbic-touch">${hold}${pad}<div class="gbic-bottom"><div class="gbic-row">${row1}</div><div class="gbic-row">${row2}</div></div></div>` : '';
    return `<div class="app-view gbic gbic-${background(call, state)}" data-no-translate data-state="${state}">${keypad ? '' : card(call, state, {...ctx, now})}${controls}</div>`;
  }

  function render(ctx) {
    const tab = ctx.tab || 'dialpad';
    if (ctx.detail) return `<div class="app-view gbp" data-no-translate><div class="gb-titlebar">${e(text(ctx.lang, 'viewContactTitle'))}</div>${detail(ctx.detail, ctx)}</div>`;
    const body = tab === 'history' ? callLog(ctx.calls, ctx.contactOf, ctx) : tab === 'contacts' ? contacts(ctx.people, ctx) : tab === 'favorites' ? contacts(ctx.people.filter(person => person.favorite), ctx, true) : ctx.callActive && !ctx.addCall ? chooser(ctx.lang) : dialer(ctx.dial);
    return `<div class="app-view gbp" data-no-translate>${tabs(tab, ctx.lang)}<div class="gbp-body">${body}</div></div>`;
  }
  // Options menus: TwelveKeyDialer (Add to contacts, Add 2-sec pause, Add wait), RecentCalls (Clear call log),
  // ContactsListActivity (Search, New contact, Display options, Accounts, Import/Export).
  function menu(ctx) {
    const T = key => text(ctx.lang, key), tab = ctx.tab || 'dialpad';
    if (ctx.detail) return [{action: 'people-edit', title: T('menu_editContact'), icon: 'ic_menu_edit'}, {action: 'gbct-share-one', id: ctx.detail.id, title: T('menu_share'), icon: 'ic_menu_share'}, {action: 'people-delete', title: T('menu_deleteContact'), icon: 'ic_menu_delete'}];
    if (tab === 'dialpad') return ctx.dial ? [{action: 'phone-add-contact', title: T('recentCalls_addToContact'), icon: 'ic_menu_add'}, {action: 'dial', id: ',', title: T('add_2sec_pause'), icon: 'ic_menu_add'}, {action: 'dial', id: ';', title: T('add_wait'), icon: 'ic_menu_add'}] : [];
    if (tab === 'history') return ctx.calls.length ? [{action: 'gbp-clear-log', title: T('recentCalls_deleteAll'), icon: 'ic_menu_close_clear_cancel'}] : [];
    return [{action: 'people-search', title: T('menu_search'), icon: 'ic_menu_search'}, {action: 'gbp-new-contact', title: T('menu_newContact'), icon: 'ic_menu_add'}, {action: 'gbct-display', title: T('menu_displayGroup'), icon: 'ic_menu_view'}, {action: 'gbct-accounts', title: T('menu_accounts'), icon: 'ic_menu_account_list'}, {action: 'gbct-io-menu', title: T('menu_import_export'), icon: 'c-ic_menu_import_export'}];
  }

  window.GBPhone = {TABS, KEYS, HANGING_UP, ENDED, text, phoneText, relative, render, menu, callState, elapsedText, inCall, callDetail};
})();

/* Phone and Contacts on Android 2.3.6 (Contacts.apk of GRK39F: DialtactsActivity's Phone, Call log, Contacts and
   Favorites tabs, the contact screens, the editor and Import/Export; Phone.apk's in-call screen) as modules
   (docs/plans/engine-migration.md). The two launcher icons open one activity: 'phone' and 'people' share their hooks.
   The ongoing call is the system's: the status bar and the shade (which returns to the call) stay with the shell. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  // The shell's bindings the screens' code uses, and their helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderOverlay, toast, viewport, openApp, contact, contactByPhone, captureRecentView} = c;
    function renderPhone() {
      if(ui.activeCall&&!ui.gbCallBackground)return GBPhone.inCall(ui.activeCall,{lang:i18n.language,t:key=>i18n.t(key),person:contactByPhone(ui.activeCall.number),bluetoothAvailable:!!(data.settings.bluetooth&&data.settings.pairedDevice)});
      if(ui.sub==='call-detail'){const call=(data.callHistory||[]).find(call=>call.time===ui.phoneCallId);if(call)return GBPhone.callDetail(call,contactByPhone(call.number),{lang:i18n.language,locale:i18n.locale()});}
      return GBPhone.render(gbPhoneContext());
    }
    function startPhoneCall(number) {
      if(!number)return;
      // Add call: the simulator keeps one line, so the call in progress ends and the new one is dialed.
      if(ui.activeCall&&ui.gbAddCall&&!ui.activeCall.endedAt){data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(ui.activeCall)].slice(-50);ui.activeCall=null;save();}
      if(!ui.activeCall)ui.activeCall=ICSPhoneCall.start(number);
      ui.gbCallBackground=false;ui.gbAddCall=false;
      captureRecentView();ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,8);
      ui.callNumber=ui.activeCall.number;ui.view='phone';ui.sub='calling';ui.overlay='';render();
    }
    // Dialtacts context: the Contacts launcher icon opens the same activity on its Contacts tab.
    function gbPhoneContext() {
      const person = ui.view === 'people' && ui.sub === 'detail' ? contact(ui.selectedContact) : null;
      return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), now: Date.now(), tab: ui.view === 'people' ? 'contacts' : ui.phoneTab || 'dialpad', dial: ui.dial || '', callActive: !!ui.activeCall, addCall: !!ui.gbAddCall, calls: data.callHistory || [], contactOf: number => contactByPhone(number), people: data.contacts, detail: person, io: GBContactsIO.view(data, i18n.language)};
    }
    function gbceContext() { return {lang: i18n.language, draft: ui.peopleDraft, isNew: ui.sub === 'new', moreName: !!ui.gbceMoreName, secondary: !!ui.gbceSecondary, familyFirst: false}; }
    // The editor's fields are kept on the draft whenever a button changes the form.
    function gbceSync() {
      const form = viewport.querySelector('.gbce'); if (!form || !ui.peopleDraft) return;
      for (const key of ['given', 'family', 'prefix', 'middle', 'suffix', 'phone', 'email', 'company', 'notes']) if (form.elements[key]) ui.peopleDraft[key] = form.elements[key].value;
    }
    // Contacts' Display options, Import/Export and SIM import (gb-contacts-io.js).
    function gbctContext() {
      return {data, ui, lang: i18n.language, save, render, renderOverlay, toast, account: ICSEmail.account, appName: c.appName,
        openAccounts: () => { ui.view = 'settings'; ui.sub = 'sync'; ui.gbSettingsStack = ['']; render(); },
        unsupported: () => toast('This feature is not part of the simulator.'),
        // Gmail takes the vCard as the compose screen's attachment.
        shareVcard: attachment => { openApp('gmail'); ui.gmDraft = {source: '', body: '', mode: '', attachment}; ui.gmCc = false; ui.gmView = 'compose'; render(); }};
    }
    function renderPeople() { if (GBContactsIO.has(ui.sub)) return GBContactsIO.render(ui.sub, gbctContext()); if (ui.sub === 'edit' || ui.sub === 'new') return GBContactEditor.render(gbceContext()); if (ui.sub === 'detail' && !contact(ui.selectedContact)) ui.sub = ''; return GBPhone.render(gbPhoneContext()); }
    function editPerson(isNew = false) {
      const person = isNew ? {} : contact(ui.selectedContact);
      if (!person) return;
      // EntityModifier.ensureKindExists: the editor always offers a phone and an email row.
      ui.peopleDraft = {...person,phone:person.phone??'',email:person.email??'',groups:data.contactGroups.filter(g=>g.members.includes(person.id)).map(g=>g.id)};
      ui.sub = isNew ? 'new' : 'edit'; ui.overlay = ''; render();
    }
    // ContactDeletionInteraction 2.3: deleteConfirmation_title with ic_dialog_alert, deleteConfirmation, OK / Cancel.
    function peopleOverlay() {
      if (ui.overlay !== 'people-delete') return '';
      const T = key => GBPhone.text(i18n.language, key);
      return GBUI.dialog({t: key => i18n.t(key), title: T('deleteConfirmation_title'), icon: 'ic_dialog_alert', message: T('deleteConfirmation'), buttons: [{action: 'people-confirm-delete', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]});
    }
    return {data, ui, save, render, renderOverlay, toast, viewport, clone: c.clone, openApp, home: c.home, contact, contactByPhone, captureRecentView, openMessageThread: c.intent.thread, blinkTips: c.blinkTips, renderStatus: c.renderStatus, renderPhone, startPhoneCall, gbPhoneContext, gbceContext, gbceSync, gbctContext, renderPeople, editPerson, peopleOverlay};
  }
  const dialtacts = {
    render: c => c.ui.view === 'phone' ? shell(c).renderPhone() : shell(c).renderPeople(),
    // A long press (or a right click) on an account or a contact source of Import/Export.
    mount(c, root) { GB.hold(c, root, '[data-gbct-hold]', held => GBContactsIO.hold(held.dataset.gbctHold, shell(c).gbctContext())); },
    // Import/Export's screens, then the tabs and the contact (none during a call, on a call's details or in the editor).
    menu(c) {
      const {ui, gbctContext, gbPhoneContext} = shell(c);
      if (ui.view === 'people' && GBContactsIO.has(ui.sub)) { c.gbMenu(GBContactsIO.menu(ui.sub, gbctContext())); return; }
      if ((ui.view === 'phone' && (!ui.activeCall || ui.gbCallBackground) && ui.sub !== 'call-detail') || (ui.view === 'people' && (!ui.sub || ui.sub === 'detail'))) { c.gbMenu(GBPhone.menu(gbPhoneContext())); return; }
    },
    // Clear call log, Import/Export's dialogs (their texts come localized from the image's strings and profile names
    // are the user's: no interface translation) and the editor's.
    dialog(kind, c) {
      const {ui, gbctContext, gbceContext} = shell(c);
      if (kind === 'clearlog') return {title: GBPhone.text(i18n.language, 'clearCallLogConfirmation_title'), icon: 'ic_dialog_alert', message: GBPhone.text(i18n.language, 'clearCallLogConfirmation'), buttons: [{action: 'gbp-clear-log-ok', title: GBSettings.text(i18n.language, 'fw_ok')}, {action: 'close-overlay', title: GBSettings.text(i18n.language, 'fw_cancel')}]};
      if (kind === 'gbct') return {...(GBContactsIO.dialog(ui.gbctDialog, gbctContext()) || {title: '', items: []}), noTranslate: true};
      return GBContactEditor.dialog(ui.gbceDialog, gbceContext());
    },
    // The delete confirmation (the inherited people- overlay).
    overlay: c => shell(c).peopleOverlay(),
    // Import/Export's screens; Add call returns to the call; the in-call keypad closes, then the call goes to the
    // background; the editor saves (Back is Done); a contact's edit returns to it.
    back(c) {
      const {ui, viewport, render, home, gbctContext} = shell(c);
      if (ui.view === 'people' && GBContactsIO.back(gbctContext())) return true;
      if(ui.view==='phone' && ui.activeCall && ui.gbAddCall){ui.gbAddCall=false;ui.gbCallBackground=false;render();return true;}
      if(ui.view==='phone' && ui.activeCall && !ui.gbCallBackground){if(ui.activeCall.keypad){ui.activeCall.keypad=false;render();}else home(false);return true;}
      if (ui.view === 'people' && (ui.sub === 'edit' || ui.sub === 'new') && viewport.querySelector('.gbce')) { viewport.querySelector('.gbce').requestSubmit(); return true; }
      if (ui.view === 'people' && ui.sub === 'edit') { ui.sub = 'detail'; render(); return true; }
      return false;
    },
    action(name, el, c) {
      const id = el.dataset.id, action = name, {data, ui, save, render, renderOverlay, renderStatus, toast, viewport, clone, openApp, home, contact, captureRecentView, openMessageThread, blinkTips, startPhoneCall, gbctContext, gbceSync, editPerson} = shell(c);
      if (action.startsWith('gbct-') && GBContactsIO.handle(action, id, gbctContext())) return true;
      switch (name) {
        case 'gbce-photo': gbceSync(); ui.gbceDialog = ui.peopleDraft?.photo ? 'photo-edit' : 'photo'; ui.overlay = 'gb-dialog-ce'; renderOverlay(); break;
        case 'gbce-photo-take': { gbceSync(); ui.overlay = ''; renderOverlay(); const ret = {sub: ui.sub}; openApp('camera'); ui.gbceCapture = {type: 'image', ret, taken: null}; ui.gbcamMode = 'photo'; render(); break; }
        // Gallery's GET_CONTENT pick returns to the editor with the picture (Back returns without one).
        case 'gbce-photo-pick': { ui.overlay = ''; const sub = ui.sub; captureRecentView(); ui.gbcePick = {sub}; ui.view = 'gallery'; ui.sub = ''; ui.gbgPick = true; render(); break; }
        case 'gbce-photo-remove': if (ui.peopleDraft) ui.peopleDraft.photo = null; ui.overlay = ''; render(); break;
        case 'phone-tab': ui.phoneTab = id; ui.phoneSearch = undefined; if (id === 'contacts') { ui.view = 'people'; ui.sub = ''; } else if (ui.view === 'people') { ui.view = 'phone'; ui.sub = ''; } render(); break;
        case 'gbp-contact': ui.selectedContact = Number(id); ui.view = 'people'; ui.sub = 'detail'; render(); break;
        case 'gbp-voicemail': toast('Voicemail number not set'); break;
        case 'gbp-new-contact': ui.overlay = ''; openApp('people'); editPerson(true); break;
        case 'gbp-email': ui.overlay = ''; openApp('email'); break;
        case 'gbp-clear-log': ui.overlay = 'gb-dialog-clearlog'; renderOverlay(); break;
        case 'gbp-clear-log-ok': data.callHistory = []; ui.overlay = ''; save(); render(); break;
        case 'phone-search': ui.phoneTab = 'favorites'; ui.phoneSearch = ''; ui.overlay = ''; render(); viewport.querySelector('.phone-search input')?.focus(); break;
        case 'phone-menu': ui.overlay = 'phone-menu'; renderOverlay(); break;
        case 'phone-add-contact': openApp('people'); editPerson(true); ui.peopleDraft.phone=ui.dial; render(); break;
        case 'phone-redial': startPhoneCall(id); break;
        case 'dial': if (ui.dial.length < 30) ui.dial += id; if (ui.dial.endsWith('*#*#8477#*#*')) { ui.dial = ''; data.protips = {index: 0, set: 1 - (data.protips?.set || 0)}; save(); home(false); setTimeout(() => blinkTips(3), 300); break; } render(); break;
        case 'dial-delete': ui.dial = ui.dial.slice(0, -1); render(); break;
        case 'call': if(!ui.dial){toast('Enter a phone number');break;}startPhoneCall(ui.dial);break;
        case 'hangup': { const call=ui.activeCall; if(!call||call.endedAt)break; call.endedAt=Date.now(); call.keypad=false; render(); setTimeout(()=>{if(ui.activeCall===call&&ui.view==='phone')render();},GBPhone.HANGING_UP); setTimeout(()=>{if(ui.activeCall!==call)return; data.callHistory=[...(data.callHistory||[]),ICSPhoneCall.finish(call,call.endedAt)].slice(-50); ui.activeCall=null; ui.gbCallBackground=false; ui.gbAddCall=false; save(); if(ui.view==='phone'){ui.sub='';ui.dial='';render();} else renderStatus();},GBPhone.HANGING_UP+GBPhone.ENDED); break; }
        case 'gbp-add-call': if(!ui.activeCall)break; ui.gbCallBackground=true; ui.gbAddCall=true; ui.phoneTab='dialpad'; ui.view='phone'; ui.sub=''; ui.dial=''; render(); break;
        case 'gbp-dtmf': if(!ui.activeCall)break; ui.gbCallBackground=false; ui.gbAddCall=false; ui.activeCall.keypad=GBPhone.callState(ui.activeCall)==='active'; ui.view='phone'; render(); break;
        case 'gbp-return-call': if(!ui.activeCall)break; ui.overlay=''; ui.gbCallBackground=false; ui.gbAddCall=false; captureRecentView(); ui.view='phone'; ui.sub='calling'; ui.recent=['phone',...ui.recent.filter(id=>id!=='phone')].slice(0,8); render(); break;
        case 'incall-toggle': if(ui.activeCall&&!ui.activeCall.endedAt){ui.activeCall[id]=!ui.activeCall[id];if(id==='hold')ui.activeCall.keypad=false;}render();renderStatus();break;
        case 'incall-digit': if(ui.activeCall)ui.activeCall.digits=(ui.activeCall.digits+id).slice(-24);render();break;
        case 'phone-log-detail': ui.phoneCallId=Number(id);ui.sub='call-detail';render();break;
        case 'phone-log-message': { const recipient=ICSMessaging.recipient(id,data.contacts); if(recipient)openMessageThread(recipient.key);else toast('Enter a valid phone number');break; }
        case 'people-search': ui.peopleTab='all'; ui.peopleSearching=true; render(); viewport.querySelector('.people-search input')?.focus(); break;
        case 'people-edit': ui.gbceMoreName = false; ui.gbceSecondary = false; editPerson(); break;
        case 'gbce-type': gbceSync(); ui.gbceDialog = id; ui.overlay = 'gb-dialog-ce'; renderOverlay(); break;
        case 'gbce-set-type': { const [kind, type] = id.split(':'); ui.peopleDraft[`${kind}Type`] = type; ui.overlay = ''; render(); break; }
        case 'gbce-remove': gbceSync(); ui.peopleDraft[id] = null; render(); break;
        case 'gbce-add': gbceSync(); ui.peopleDraft[id] = ''; render(); viewport.querySelector(`.gbce [name="${id}"]`)?.focus(); break;
        case 'gbce-more-name': gbceSync(); ui.gbceMoreName = !ui.gbceMoreName; render(); break;
        case 'gbce-secondary': gbceSync(); ui.gbceSecondary = !ui.gbceSecondary; render(); break;
        case 'gbce-revert': ui.sub = ui.sub === 'edit' && contact(ui.selectedContact) ? 'detail' : ''; ui.peopleDraft = null; render(); break;
        case 'people-star': { const person=contact(ui.selectedContact); if(person)person.favorite=!person.favorite; save(); render(); break; }
        case 'people-delete': ui.overlay='people-delete'; renderOverlay(); break;
        case 'people-confirm-delete': ICSPeople.remove(data,ui.selectedContact); save(); ui.sub=''; ui.overlay=''; render(); break;
        case 'contact': ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      const {data, ui, save, render, toast, contact} = shell(c);
      if (name === 'phone-search') { ui.phoneSearch = String(values.get('query') || '').trim(); render(); return true; }
      switch (name) {
        case 'people-search': ui.peopleQuery=String(values.get('query')||'').trim(); render(); break;
        case 'people-save': {
          // ContactEditorActivity: the structured name is joined into the display name; an empty contact is not saved.
          const name=values.has('given')?GBContactEditor.join([values.get('prefix'),values.get('given'),values.get('middle')].filter(Boolean).join(' '),[values.get('family'),values.get('suffix')].filter(Boolean).join(' ')):String(values.get('name')||'').trim(); if(!name){ui.sub=ui.sub==='edit'&&contact(ui.selectedContact)?'detail':'';ui.peopleDraft=null;render();break;}
          const id=ui.sub==='edit'?ui.selectedContact:Date.now();
          const person=contact(id)||{id};
          person.name=name;for(const key of ['phone','email','company','notes'])person[key]=String(values.get(key)||'').trim();
          if(ui.peopleDraft&&'photo' in ui.peopleDraft){if(ui.peopleDraft.photo)person.photo=ui.peopleDraft.photo;else delete person.photo;}
          if(ui.peopleDraft?.phoneType)person.phoneType=ui.peopleDraft.phoneType;if(ui.peopleDraft?.emailType)person.emailType=ui.peopleDraft.emailType;
          if(!contact(id))data.contacts.push(person);
          if(!values.has('given')){const groups=values.getAll('groups');data.contactGroups.forEach(g=>{g.members=g.members.filter(member=>member!==id);if(groups.includes(g.id))g.members.push(id);});}
          save();ui.selectedContact=id;ui.sub='detail';ui.peopleDraft=null;render();toast(GBContactEditor.text(i18n.language,'contactSavedToast'));break;
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
    // The inherited ICS editor's fields.
    input(event, c) {
      const {ui, viewport} = shell(c);
      if(event.target.closest('#people-editor')) {
        if(event.target.name==='groups')ui.peopleDraft.groups=[...viewport.querySelectorAll('[name=groups]:checked')].map(input=>input.value);
        else ui.peopleDraft[event.target.name]=event.target.value;
        return true;
      }
      return false;
    }
  };
  window.GB?.register('phone', {...dialtacts,
    call: (c, number) => shell(c).startPhoneCall(number),
    // Opened from the launcher during a call: the dialpad to add one, the call itself in the background.
    open(c, resume) { const ui = c.ui; if (ui.activeCall && !resume) { ui.gbCallBackground = true; ui.gbAddCall = false; ui.phoneTab = 'dialpad'; } },
    // The in-call screen's state and its elapsed time.
    tick(c) {
      const {data, ui, render} = c;
      if(ui.activeCall){
        const screen=c.viewport.querySelector('.gbic'),state=GBPhone.callState(ui.activeCall);
        if(screen&&screen.dataset.state!==state)render();
        else if(screen&&state==='active'){const elapsed=screen.querySelector('.gbic-elapsed');if(elapsed)elapsed.textContent=GBPhone.elapsedText(ui.activeCall);}
      }
    },
    clearData(c) { const {data, ui} = c; data.callHistory=[];ui.activeCall=null; }
  });
  window.GB?.register('people', {...dialtacts,
    edit: (c, isNew) => shell(c).editPerson(isNew),
    clearData(c) { const {data, ui} = c, clone = c.clone, defaultData = c.defaults; data.contacts=clone(defaultData.contacts);data.contactGroups=clone(defaultData.contactGroups);ui.peopleDraft=null; }
  });
})();
