/* Messaging (Mms.apk of JWR66Y) and Hangouts 1.0.2 on Android 4.3, moved out of simulator.js
   (docs/plans/engine-migration.md): the threads, compose with its recipient chip, attachments (jb-mms-attach.js) and
   settings (mms-prefs), the message menus and dialogs, Hangouts' list, archive, Do not disturb, settings
   (hangouts-prefs.js) and the friends' replies; their actions, forms, typing, Back and Clear data. While Hangouts is in
   front data.messages holds its chats (the core's hangoutsScope). */
(() => {
  'use strict';
  if (!window.JB) return; // loaded on its own (the renderer's unit tests)
  let $c, back, cameraIntent, clock, clone, contact, data, defaultData, deviceDate, dp, hangoutsScope, i18n, label, openApp, overlayRoot, render, renderOverlay, renderStatus, safe, save, startPhoneCall, toast, ui, viewport;
  const $bind = c => { $c = c; ({back, cameraIntent, clock, clone, contact, data, defaultData, deviceDate, dp, hangoutsScope, i18n, label, openApp, overlayRoot, render, renderOverlay, renderStatus, safe, save, startPhoneCall, toast, ui, viewport} = c); };
  function renderMessaging() {
    if (ui.mmsPrefs) return MmsPrefs.render(mmspContext());
    return ICSMessaging.render(data, ui, key => i18n.t(key), i18n.locale());
  }
  function messageDraft() {
    data.messageDrafts ||= {};
    const key = ICSMessaging.draftKey(ui);
    return data.messageDrafts[key] ||= {body:'',recipient:''};
  }
  function removeRecipientChip() { Object.assign(messageDraft(), {recipient: '', chip: false, query: ''}); ui.mmsChipSelected = false; save(); render(); viewport.querySelector('[name=recipient]')?.focus(); }
  // KitKat's New Hangout picker: a pending draft moves to the chosen conversation.
  function pickHangout(key) {
    const pending = data.messageDrafts?.new;
    if (pending && (pending.body || pending.attachment)) {
      const target = data.messageDrafts[String(key)] ||= {body: '', recipient: ''};
      target.body = [target.body, pending.body].filter(Boolean).join(' ').slice(0, 2000);
      if (pending.attachment) target.attachment = pending.attachment;
      target.updated = Date.now(); delete data.messageDrafts.new;
    }
    openMessageThread(String(key)); save(); render();
  }
  function openMessageThread(key) {
    if (!['messaging', 'hangouts'].includes(ui.view)) openApp('messaging');
    if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : ui.sub === 'archived' ? 'archived' : '';
    ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
    data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
    if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
    save(); render(); scrollMessages();
  }
  function scrollMessages() {
    const history = viewport.querySelector('.mms-history');
    if (history) history.scrollTop = history.scrollHeight;
  }
  /* Messaging overlays from this image's Mms code: the overflow menus (conversation_list_menu with ConversationList's
     visibility rules; ComposeMessageActivity.onPrepareOptionsMenu: Add subject, Send once there is something to send,
     Insert smiley, Delete thread or Discard, Add to People for a number that is no contact, Settings), Insert smiley
     (showSmileyDialog: smiley_menu_item rows of icon, name and text), the message context menu (Copy text, Forward,
     Lock / Unlock, View details, Delete), ConversationList.confirmDeleteThreadDialog (Delete? with "Delete locked
     messages" while locked messages are there), confirmDeleteDialog and MessageUtils.getTextMessageDetails. The words
     are mms-strings.js'. */
  function renderMessageOverlay() {
    // Hangouts draws its own overflow, attach menu and snooze dialog (hangouts.js); the rest is Messaging's.
    if (ui.view === 'hangouts') { const own = Hangouts.overlay(data, ui, key => i18n.t(key)); if (own !== null) return own; }
    const M = key => MmsStrings.t(key), unavailable = 'This feature is not part of the simulator.';
    const option = (action, text, id = '') => `<button data-action="${action}" data-id="${safe(id)}">${safe(text)}</button>`;
    const alert = (title, body, buttons = '', icon = false) => `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="mms-alert" role="alertdialog" aria-label="${safe(title)}" data-no-translate>${title ? `<h3>${icon ? '<img src="assets/mms-ic_dialog_alert_holo_light.png" alt="">' : ''}${safe(title)}</h3>` : ''}${body}${buttons ? `<div class="mms-alert-buttons">${buttons}</div>` : ''}</div>`;
    const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage));
    if (ui.overlay === 'mms-menu' && ui.mmsPrefs) return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu" data-no-translate>${MmsPrefs.menu(mmspContext()).map(item => option(item.action, item.title)).join('')}</div>`;
    if (ui.overlay === 'mms-menu') {
      const composing = ['thread', 'new'].includes(ui.sub), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
      const messages = ui.sub === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      const to = ui.sub === 'thread' ? String(ui.thread) : ICSMessaging.recipient(draft.recipient || '', data.contacts)?.key || '';
      const items = composing
        ? option('toast', M('Add subject'), unavailable) + ((draft.body || '').trim() || draft.attachment ? option('mms-send-now', M('Send')) : '') + option('mms-smiley', M('Insert smiley'))
          + (messages.length ? option('mms-delete-thread', M('Delete thread')) : option('mms-discard', M('Discard'))) + (to.startsWith('tel:') ? option('toast', M('Add to People'), unavailable) : '') + option('mmsp-open', M('Settings'))
        : option('mmsp-open', M('Settings')) + (data.messages.length ? option('mms-delete-all', M('Delete all threads')) : '') + option('mms-cell-broadcasts', M('Cell broadcasts'));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="holo-menu ${composing ? '' : 'mms-menu-root'}" data-no-translate>${items}</div>`;
    }
    /* ComposeMessageActivity's attachment chooser: an AlertDialog ("Attach", ic_dialog_attach) over
       AttachmentTypeSelectorAdapter's icon_list_item rows in its order. Pictures lists the simulator's photos; Record
       audio starts Sound Recorder; the other sources are not part of the simulator. */
    if (ui.overlay === 'mms-attach') { const M = key => MmsStrings.t(key); const types = [['pictures', 'Pictures', 'ic_attach_picture_holo_light'], ['capture-picture', 'Capture picture', 'ic_attach_capture_picture_holo_light'], ['videos', 'Videos', 'ic_attach_video_holo_light'], ['capture-video', 'Capture video', 'ic_attach_capture_video_holo_light'], ['audio', 'Audio', 'ic_attach_audio_holo_light'], ['record-audio', 'Record audio', 'ic_attach_capture_audio_holo_light'], ['slideshow', 'Slideshow', 'ic_attach_slideshow_holo_light']]; return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog mms-attach-types" role="dialog" aria-label="${safe(M('Attach'))}" data-no-translate><h3><img src="assets/mms-ic_dialog_attach.png" alt="">${safe(M('Attach'))}</h3><div class="mms-dialog-list">${types.map(([id, label, icon]) => `<button data-action="mms-attach-type" data-id="${id}"><img src="assets/mms-${icon}.png" alt=""><span>${safe(M(label))}</span></button>`).join('')}</div></div>`; }
    if (ui.overlay?.startsWith('jbma-')) return JBMmsAttach.overlay(ui.overlay, jbmaContext()) || '';
    if (ui.overlay === 'mms-attach-photos') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(i18n.t('Attach photo'))}" data-no-translate><h3>${safe(i18n.t('Attach photo'))}</h3><div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || `<p>${safe(i18n.t('No photos'))}</p>`}</div></div>`;
    if (ui.overlay === 'mms-attach-pick') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog mms-dialog" role="dialog" aria-label="${safe(MmsStrings.t('Attach'))}" data-no-translate><h3>${safe(MmsStrings.t('Attach'))}</h3><div class="mms-dialog-list">${data.photos.map(p => `<button data-action="mms-photo" data-id="${p.id}">${ICSMessaging.photo(p)}</button>`).join('') || `<p>${safe(i18n.t('No photos'))}</p>`}</div></div>`;
    if (ui.overlay === 'mms-smiley') return alert(M('Insert smiley'), `<div class="mms-smileys">${MmsStrings.SMILEYS.map(([name, text, icon]) => `<button data-action="mms-insert-smiley" data-id="${safe(text)}"><img src="assets/mms-emo_im_${icon}.png" alt=""><span>${safe(M(name))}</span><b>${safe(text)}</b></button>`).join('')}</div>`);
    if (ui.overlay === 'mms-delete-confirm') {
      const scope = ui.mmsDelete === 'all' ? data.messages : ui.mmsDelete === 'thread' ? data.messages.filter(m => String(m.contact) === String(ui.thread)) : [];
      if (ui.mmsDelete === 'message') return alert('', `<p>${safe(M(message?.locked ? 'Delete this locked message?' : 'The message will be deleted.'))}</p>`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')));
      const locked = scope.some(m => m.locked) ? `<label class="mms-alert-check"><input type="checkbox" data-action="mms-delete-locked" ${ui.mmsDeleteLocked ? 'checked' : ''}><span>${safe(M('Delete locked messages'))}</span></label>` : '';
      return alert(M('Delete?'), `<p>${safe(M(ui.mmsDelete === 'all' ? 'All threads will be deleted.' : 'The entire thread will be deleted.'))}</p>${locked}`, option('close-overlay', M('Cancel')) + option('mms-confirm-delete', M('Delete')), true);
    }
    if (!message) return '';
    if (ui.overlay === 'mms-message') return alert(M('Message options'), `<div class="mms-alert-list">${option('mms-copy', M('Copy text'))}${option('mms-forward', M('Forward'))}${option('mms-lock', M(message.locked ? 'Unlock' : 'Lock'))}${option('mms-details', M('View details'))}${option('mms-delete-message', M('Delete'))}</div>`);
    if (ui.overlay === 'mms-details') {
      const when = message.timestamp ? new Date(message.timestamp).toLocaleString(i18n.locale(), {year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) : i18n.t(message.time || '');
      const lines = [M('Type: ') + M(message.attachment ? 'Multimedia message' : 'Text message'), M(message.mine ? 'To: ' : 'From: ') + ICSMessaging.identity(message.contact, data.contacts).phone, M(message.mine ? 'Sent: ' : 'Received: ') + when];
      return alert(M('Message details'), `<p class="mms-details">${lines.map(safe).join('<br>')}</p>`);
    }
    return '';
  }
  // Messaging › Settings (mms-prefs.js) under Messaging's own action bar.
  const mmspContext = () => ({ui, data, version: '4.3', M: key => MmsStrings.t(key), t: key => i18n.t(key), save, render,
    bar: (title, menu) => `<header class="mms-header"><button class="mms-up" data-action="back" aria-label="${safe(i18n.t('Back'))}"><span>‹</span><img src="assets/messaging.png" alt=""></button><div class="mms-title"><h2>${safe(title)}</h2></div>${menu ? `<button data-action="mms-menu" aria-label="${safe(i18n.t('More options'))}"><img src="assets/ic_menu_overflow.png" alt=""></button>` : ''}</header>`});
  // Messaging's attachments (jb-mms-attach.js): the draft, the shell, the Camera's capture, Sound Recorder and Back.
  const jbmaContext = () => ({ui, data, t: key => i18n.t(key), root: viewport, draftOf: messageDraft, save, render, renderOverlay, toast, back,
    capture(type, target) {
      const c = {type, target, ret: {sub: ui.sub, thread: ui.thread, screen: ui.jbmaScreen, slide: ui.jbmaSlide}}; openApp('camera'); ui.jbmaCapture = c; ui.jbcamModule = type === 'video' ? 'video' : 'photo';
      if (type !== 'video') ui.camIntent = cameraIntent(photo => { ui.jbmaCapture = null; jbmaReturn(c, photo); }, () => { ui.jbmaCapture = null; openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, jbmaScreen: c.ret.screen, jbmaSlide: c.ret.slide}); render(); scrollMessages(); });
      render();
    },
    record(target) { ui.overlay = ''; renderOverlay(); ui.srReturn = {view: ui.view, sub: ui.sub, thread: ui.thread, target, screen: ui.jbmaScreen, slide: ui.jbmaSlide}; ui.sr = SoundRecorder.initial(); ui.view = 'sound-recorder'; ui.sub = ''; render(); }});
  function sendMessage(id, body, attachment) {
    if (!body && !attachment) return;
    data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}) });
    delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
    openMessageThread(id);
    if (ui.view === 'hangouts') scheduleHangoutsReply(id);
  }
  /* A demo contact answers a Hangouts message once a few seconds later (per contact and session), into Hangouts' own
     chats. The answer notifies unless Hangouts notifications, the conversation's Notifications or a snooze keep it
     quiet; a blocked person's answer never arrives (hangouts-prefs.js). */
  const HANGOUTS_REPLIES = {1: 'Sounds good, see you then!', 2: 'Got it, thanks!', 3: 'Haha, nice 😄', 4: 'Love you! Talk soon ♥'};
  function scheduleHangoutsReply(id) {
    const key = Number(id);
    if (!HANGOUTS_REPLIES[key] || (ui.repliedTo ||= new Set()).has(key) || !HangoutsPrefs.receives(data, key)) return;
    ui.repliedTo.add(key);
    setTimeout(() => {
      const who = contact(key); if (!who || !HangoutsPrefs.receives(data, key)) return;
      const open = ui.view === 'hangouts' && ui.sub === 'thread' && Number(ui.thread) === key && !ui.hgPage;
      const chats = $c.hangoutsSwap ? data.messages : (data.hangoutChats ||= clone(defaultData.hangoutChats));
      chats.push({id: Date.now(), contact: key, body: i18n.t(HANGOUTS_REPLIES[key]), mine: false, time: clock(), timestamp: Date.now(), read: open});
      if (!open && HangoutsPrefs.notifies(data, key, deviceDate().getTime())) data.notifications.unshift({id: Date.now(), title: who.name, detail: i18n.t(HANGOUTS_REPLIES[key]), kind: 'message', channel: 'hangouts', contact: key});
      save(); renderStatus(); if (ui.view === 'hangouts') render(); if (ui.overlay === 'shade') renderOverlay();
    }, 4500);
  }
  // Hangouts' Take photo: the picture joins the conversation's draft as its attachment.
  function hangoutsTakePhoto() {
    const ret = {sub: ui.sub, thread: ui.thread};
    ui.overlay = ''; renderOverlay(); openApp('camera'); ui.jbcamModule = 'photo';
    const back = () => { openApp('hangouts'); Object.assign(ui, ret); };
    ui.camIntent = cameraIntent(photo => { back(); const d = messageDraft(); d.attachment = clone(photo); d.updated = Date.now(); save(); render(); scrollMessages(); }, () => { back(); render(); scrollMessages(); });
    render();
  }
  function jbmaReturn(c, photo) {
    openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, jbmaScreen: c.ret.screen, jbmaSlide: c.ret.slide});
    JBMmsAttach.apply(jbmaContext(), c.target, photo.video ? {video: clone(photo)} : {image: clone(photo)}); render(); scrollMessages();
  }
  const spec = {
    render(c) {
      $bind(c);
      switch (ui.view) {
        case 'hangouts': return hangoutsScope(() => Hangouts.render(data, ui, key => i18n.t(key), i18n.locale(), deviceDate().getTime()));
        case 'messaging': return renderMessaging();
      }
    },
    mount(c, root) {
      $bind(c);
      if (ui.view === 'hangouts' && ui.hgPage === 'add') HangoutsPrefs.mount(viewport, ui, render);
      if (ui.view === 'messaging') window.JBMmsAttach?.mounted(jbmaContext());
    },
    action(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (ui.view === 'messaging' && action.startsWith('jbma-') && JBMmsAttach.handle(action, id, jbmaContext())) return true;
      switch (action) {
        case 'hg-pick': pickHangout(id); break;
        case 'hg-attach-photo': ui.overlay = 'mms-attach-photos'; renderOverlay(); break;
        case 'hg-take-photo': hangoutsTakePhoto(); break;
        case 'hg-unsupported': ui.overlay = ''; renderOverlay(); toast(i18n.t('This feature is not part of the simulator.')); break;
        case 'hg-archive': (data.hgArchived ||= {})[ui.thread] = Date.now(); ui.overlay = ''; ui.sub = ''; ui.mmsListMode = ''; save(); renderOverlay(); render(); toast(Hangouts.H(key => i18n.t(key), 'Hangout archived.')); break;
        case 'hg-unarchive': if (data.hgArchived) delete data.hgArchived[ui.thread]; ui.overlay = ''; if (ui.mmsListMode === 'archived') ui.mmsListMode = ''; save(); renderOverlay(); render(); break;
        case 'hg-archived': ui.overlay = ''; ui.sub = 'archived'; renderOverlay(); render(); break;
        case 'hg-dnd': ui.overlay = 'mms-hg-dnd'; renderOverlay(); break;
        case 'hg-dnd-set': data.hgSnooze = deviceDate().getTime() + Number(id) * 60000; ui.overlay = ''; save(); renderOverlay(); render(); break;
        case 'hg-dnd-cancel': delete data.hgSnooze; save(); render(); break;
        case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
        case 'mms-menu': case 'mms-attach': case 'mms-smiley': ui.overlay = action; renderOverlay(); break;
        case 'mms-attach-type': if (id === 'pictures') { ui.overlay = 'mms-attach-pick'; renderOverlay(); } else JBMmsAttach.start(jbmaContext(), id); break;
        case 'mms-recipient': { const person = contact(id); if (person) { Object.assign(messageDraft(), {recipient: person.phone, chip: true, query: ''}); ui.mmsChipSelected = false; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
        case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
        case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
        case 'mms-remove-attachment': delete messageDraft().attachment; save(); render(); scrollMessages(); break;
        case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
        case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; save(); ui.overlay = ''; render(); scrollMessages(); break;
        case 'mms-message': ui.mmsMessage = id; ui.overlay = 'mms-message'; renderOverlay(); break;
        case 'mms-details': ui.overlay = 'mms-details'; renderOverlay(); break;
        case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
        case 'mms-delete-thread': case 'mms-delete-message': case 'mms-delete-all': ui.mmsDelete = action.slice(11); ui.mmsDeleteLocked = false; ui.overlay = 'mms-delete-confirm'; renderOverlay(); break;
        case 'mms-delete-locked': ui.mmsDeleteLocked = !ui.mmsDeleteLocked; renderOverlay(); break;
        case 'mms-lock': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (message) { message.locked = !message.locked; save(); } ui.overlay = ''; render(); scrollMessages(); break; }
        case 'mms-copy': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); navigator.clipboard?.writeText(message?.body || '').catch(() => {}); ui.overlay = ''; renderOverlay(); break; }
        case 'mms-send-now': ui.overlay = ''; renderOverlay(); viewport.querySelector('.mms-compose')?.requestSubmit(); break;
        case 'mms-confirm-delete': {
          // Deleting a thread or all threads keeps locked messages unless "Delete locked messages" is ticked.
          const doomed = m => ui.mmsDelete === 'message' ? String(m.id) === String(ui.mmsMessage) : (ui.mmsDelete === 'all' || String(m.contact) === String(ui.thread)) && (!m.locked || ui.mmsDeleteLocked);
          data.messages = data.messages.filter(m => !doomed(m));
          if (ui.mmsDelete === 'all') data.messageDrafts = {};
          if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; if (!data.messages.some(m => String(m.contact) === String(ui.thread))) ui.sub = ''; }
          save(); ui.overlay = ''; render(); break;
        }
        case 'mms-chip': if (!ui.mmsChipSelected) { ui.mmsChipSelected = true; render(); break; } removeRecipientChip(); break;
        case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
        case 'thread': openMessageThread(id); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      $bind(c);
      const event = c.event, form = c.form;
      switch (form.dataset.form) {
        case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
        case 'hg-new': { const target = ICSMessaging.recipient(values.get('recipient'), data.contacts); if (!target) { toast('Enter a contact name or valid phone number'); return true; } pickHangout(target.key); break; }
        case 'mms-send': {
          const draft = messageDraft(), target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(draft.chip ? draft.recipient : values.get('recipient'),data.contacts);
          if (!target) { toast('Enter a contact name or valid phone number'); return true; }
          sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
        }
        default: return false;
      }
      return true;
    },
    input(event, c) {
      $bind(c);
      if (event.target.closest('.mms-compose')) {
        const draft = messageDraft();
        if (event.target.name === 'body') draft.body = event.target.value;
        if (event.target.name === 'recipient') {
          if (draft.chip) draft.query = event.target.value; else draft.recipient = event.target.value;
          viewport.querySelector('.mms-suggestions').innerHTML = ICSMessaging.suggestions(event.target.value, data.contacts, key => i18n.t(key));
        }
        draft.updated = Date.now(); save();
        const count = ICSMessaging.counter(draft.body || '');
        viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : '';
        viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
        if (event.target.name === 'body') { event.target.style.height = 'calc(51.6675 * var(--dp))'; event.target.style.height = `${Math.min(dp(103.3349),event.target.scrollHeight)}px`; }
        return true;
      }
      return false;
    },
    back(c) {
      $bind(c);
      if (ui.view === 'messaging' && !ui.overlay && MmsPrefs.back(ui)) { render(); return true; }
      if (ui.view === 'messaging' && !ui.overlay && window.JBMmsAttach?.back(jbmaContext())) { render(); return true; }
      if (ui.overlay) return false;
      // Hangouts' own pages (hangouts-prefs.js) step back through what opened them.
      if (ui.view === 'hangouts' && ui.hgPage) { HangoutsPrefs.back(ui); render(); return true; }
      if (ui.view === 'hangouts' && ui.sub === 'archived') { ui.sub = ''; render(); return true; }
      if (ui.view === 'hangouts' && ui.sub === 'thread') { ui.sub = ui.mmsListMode === 'archived' ? 'archived' : ''; render(); return true; }
      if (ui.view === 'messaging' && ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return true; }
      return false;
    },
    // Clicks taken before the keyguard's filter (the core's click handler).
    actionEarly(action, button, c) {
      $bind(c);
      const event = c.event, { id, app, url } = button.dataset;
      if (action.startsWith('mmsp-')) { if (ui.overlay) { ui.overlay = ''; renderOverlay(); } if (MmsPrefs.handle(action, id, mmspContext())) return true; }
      // Messaging's Cell broadcasts starts the CellBroadcastReceiver's list; Back returns to Messaging.
      if (action === 'mms-cell-broadcasts') { ui.overlay = ''; renderOverlay(); openApp('settings'); ui.sub = 'cb-list'; ui.cbReturn = 'messaging'; ui.cbFromList = false; render(); return true; }
      if (action.startsWith('hgp-') && HangoutsPrefs.handle(action, id, {data, ui, save, render, renderOverlay, toast, root: viewport, openApp, openThread: key => openMessageThread(key)})) return true;
      return false;
    },
    clearData(c) {
      $bind(c);
      const id = c.clearId;
      if(id==='messaging'){data.messages=clone(defaultData.messages);data.messageDrafts={};}
    },
    overlay(c) {
      $bind(c);
      if (ui.overlay.startsWith('mms-') || ui.overlay.startsWith('jbma-')) {
        overlayRoot.innerHTML = hangoutsScope(renderMessageOverlay);
      }
      else return;
      return true;
    },
    exports: {
      messageDraft: (c, ...args) => { $bind(c); return messageDraft(...args); },
      removeRecipientChip: (c, ...args) => { $bind(c); return removeRecipientChip(...args); },
      openMessageThread: (c, ...args) => { $bind(c); return openMessageThread(...args); },
      jbmaContext: (c, ...args) => { $bind(c); return jbmaContext(...args); },
      jbmaReturn: (c, ...args) => { $bind(c); return jbmaReturn(...args); }
    }
  };
  JB.register('messaging', spec);
  JB.register('hangouts', spec);
})();
