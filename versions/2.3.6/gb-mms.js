/* Android 2.3.6 Messaging (packages/apps/Mms): ConversationList (conversation_list_screen.xml, white
   listViewWhiteStyle, ConversationListItem), ComposeMessageActivity (compose_message_activity.xml, MessageListItem,
   recipients editor and the bottom_panel with the text editor, Send and the character counter), their option menus
   and dialogs. hdpi px x 0.575, 1 dp = 0.8625px. Strings come from gb-strings-mms.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.mms), text = (lang, key) => R.t(key, lang), array = (lang, key) => R.array(key, lang);
  // SmileyParser: default_smiley_texts with DEFAULT_SMILEY_RES_IDS in the same order.
  const SMILEYS = ['happy', 'sad', 'winking', 'tongue_sticking_out', 'surprised', 'kissing', 'yelling', 'cool', 'money_mouth', 'foot_in_mouth', 'embarrassed', 'angel', 'undecided', 'crying', 'lips_are_sealed', 'laughing', 'wtf'];
  function smileys(body, lang) {
    const texts = array(lang, 'default_smiley_texts');
    if (!texts.length) return e(body);
    const sorted = texts.map((t, i) => [t, i]).sort((a, b) => b[0].length - a[0].length);
    const pattern = new RegExp(sorted.map(([t]) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
    let out = '', last = 0;
    for (const m of String(body).matchAll(pattern)) {
      const index = texts.indexOf(m[0]);
      out += e(body.slice(last, m.index)) + `<img class="gbmms-emo" src="assets/gb-m-emo_im_${SMILEYS[index]}.png" alt="${e(m[0])}">`;
      last = m.index + m[0].length;
    }
    return out + e(body.slice(last));
  }
  // MessageUtils.formatTimeStampString: the time today, the date earlier this year, the date and year before.
  function stamp(message, ctx, full = false) {
    if (!message?.timestamp) return ctx.t(message?.time || '');
    const then = new Date(message.timestamp), now = new Date(ctx.now);
    const time = {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24};
    const sameDay = then.toDateString() === now.toDateString(), sameYear = then.getFullYear() === now.getFullYear();
    if (full) return then.toLocaleString(ctx.locale, {month: 'short', day: 'numeric', ...(sameYear ? {} : {year: 'numeric'}), ...time});
    if (sameDay) return then.toLocaleTimeString(ctx.locale, time);
    return then.toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric', ...(sameYear ? {} : {year: 'numeric'})});
  }
  // Contact.formatNameAndNumber: "Name <number>" for saved contacts, the number alone otherwise.
  const nameAndNumber = person => person.name && person.name !== person.phone ? `${person.name} <${person.phone}>` : person.phone;
  const badge = person => `<span class="gbmms-badge"><img src="${window.GBContactPhoto?.(person) || 'assets/gb-m-ic_contact_picture.png'}" alt=""></span>`;

  // ConversationListItem: 64 dip rows, white when unread (bold "from"), #eeeeee when read; the header row is
  // "New message / Compose new message" without a badge.
  function list(ctx) {
    const T = key => text(ctx.lang, key), M = window.ICSMessaging;
    const searching = ctx.sub === 'search', threads = M.threads(ctx.data, searching ? ctx.query || '' : '');
    const header = searching ? '' : `<button class="gbmms-thread gbmms-header" data-action="new-message"><span class="gbmms-from">${e(T('new_message'))}</span><span class="gbmms-subject">${e(T('create_new_message'))}</span></button>`;
    const rows = threads.map(thread => {
      const unread = thread.messages.some(m => m.read === false), count = thread.messages.length;
      const draft = thread.draft?.body || thread.draft?.attachment;
      const subject = draft ? thread.draft.body : thread.last?.body || '';
      const attachment = thread.last?.attachment || thread.draft?.attachment;
      return `<button class="gbmms-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${e(thread.key)}">${badge(thread.person)}<span class="gbmms-from">${e(thread.person.name)}${count > 1 ? ` (${count}) ` : ''}${draft ? `<em> ${e(T('has_draft'))}</em>` : ''}</span><span class="gbmms-subject">${e(subject)}</span><span class="gbmms-date${attachment ? ' clip' : ''}">${e(stamp(draft ? {timestamp: thread.draft.updated} : thread.last, ctx))}</span></button>`;
    }).join('');
    const search = searching ? `<form class="gbmms-search" data-form="mms-search"><input name="query" type="search" aria-label="${e(T('search_hint'))}" placeholder="${e(T('search_hint'))}" maxlength="100" value="${e(ctx.query || '')}"></form>` : '';
    const empty = searching && ctx.query && !threads.length ? `<p class="gbmms-empty">${e(T('search_empty'))}</p>` : '';
    return `<div class="app-view gbmms" data-no-translate><div class="gb-titlebar">${e(T('app_label'))}</div>${search}<div class="mms-scroll gbmms-list">${header}${rows}${empty}</div></div>`;
  }

  // MessageListItem: the QuickContactBadge floats in the leading margin of "Name: body", then the "Sent: date" line in
  // TextAppearance.Small at #bf000000. Received messages sit on light blue, sent ones on white.
  function message(m, ctx, person) {
    const T = key => text(ctx.lang, key), name = m.mine ? T('messagelist_sender_self') : person.name;
    const subject = m.subject ? e(AndroidStrings.format(T('inline_subject'), m.subject)) + (m.body ? ' - ' : '') : '';
    const time = m.sending ? T('sending_message') : AndroidStrings.format(T('sent_on'), stamp(m, ctx));
    return `<button type="button" class="mms-message gbmms-msg${m.mine ? ' sent' : ' received'}" data-action="mms-message" data-id="${e(m.id)}">${m.attachment ? window.GBMmsAttach?.row(m) || `<span class="gbmms-mms">${window.ICSMessaging.photo(m.attachment)}</span>` : ''}<span class="gbmms-text">${badge(m.mine ? null : person)}<b>${e(name)}</b>: ${subject}${smileys(m.body || '', ctx.lang)}<br><small>${e(time)}</small></span>${m.locked ? '<img class="gbmms-lock" src="assets/gb-m-ic_lock_message_sms.png" alt="">' : ''}</button>`;
  }
  function compose(ctx) {
    const T = key => text(ctx.lang, key), M = window.ICSMessaging, detail = ctx.sub === 'thread';
    const person = M.identity(ctx.thread, ctx.data.contacts), draft = ctx.draft || {};
    const messages = detail ? ctx.data.messages.filter(m => String(m.contact) === String(ctx.thread)) : [];
    const title = detail ? nameAndNumber(person) : draft.recipient || '';
    const count = M.counter(draft.body || '');
    const counter = draft.attachment ? 'MMS' : count.count > 1 || count.remaining <= 10 ? `${count.remaining} / ${count.count}` : '';
    const ready = !!((draft.body || '').trim() || draft.attachment);
    const recipients = !detail || ctx.subjectVisible ? `<div class="gbmms-recipients">${!detail ? `<div class="mms-recipient"><input name="recipient" class="gbmms-field" aria-label="${e(T('to_hint'))}" placeholder="${e(T('to_hint'))}" autocomplete="off" maxlength="60" value="${e(draft.recipient || '')}"><div class="mms-suggestions gbmms-suggestions"></div></div>` : ''}${ctx.subjectVisible ? `<input name="subject" class="gbmms-field" aria-label="${e(T('subject_hint'))}" placeholder="${e(T('subject_hint'))}" maxlength="40" value="${e(draft.subject || '')}">` : ''}</div>` : '';
    const attachment = window.GBMmsAttach ? GBMmsAttach.editor(ctx, draft) : draft.attachment ? `<div class="gbmms-attachment"><span class="gbmms-attachment-image">${M.photo(draft.attachment)}</span><span class="gbmms-attachment-buttons"><button type="button" data-action="gbset-toast" data-id="This feature is not part of the simulator.">${e(T('view'))}</button><button type="button" data-action="mms-attach">${e(T('replace_image'))}</button><button type="button" data-action="mms-remove-attachment">${e(T('remove'))}</button></span></div>` : '';
    return `<div class="app-view gbmms gbmms-compose" data-no-translate><div class="gb-titlebar">${e(title)}</div><form class="mms-compose gbmms-form" data-form="mms-send">${recipients}<div class="mms-scroll mms-history gbmms-history">${messages.map(m => message(m, ctx, person)).join('')}</div>${attachment}<div class="gbmms-bottom${window.GBMmsAttach?.kindOf(draft.attachment) === 'slideshow' ? ' gbma-hidden' : ''}"><textarea name="body" class="gbmms-field" aria-label="${e(T('type_to_compose_text_enter_to_send'))}" placeholder="${e(T('type_to_compose_text_enter_to_send'))}" rows="1" maxlength="2000">${e(draft.body || '')}</textarea><div class="gbmms-send-col"><button class="mms-send gbmms-send" type="submit"${ready ? '' : ' disabled'}>${e(T('send'))}</button><small class="mms-counter gbmms-counter">${e(counter)}</small></div></div></form></div>`;
  }
  function render(ctx) {
    // The slideshow editor, the player and Sound Recorder open over the compose screen (gb-mms-attach.js).
    const over = (ctx.sub === 'thread' || ctx.sub === 'new') && window.GBMmsAttach?.screen(ctx);
    if (over) return over;
    return ctx.sub === 'thread' || ctx.sub === 'new' ? compose(ctx) : list(ctx);
  }

  // Options menus: ConversationList.onPrepareOptionsMenu and ComposeMessageActivity.onPrepareOptionsMenu.
  function menu(ctx) {
    const T = key => text(ctx.lang, key), M = window.ICSMessaging;
    const over = window.GBMmsAttach?.menu(ctx);
    if (over) return over;
    if (ctx.sub !== 'thread' && ctx.sub !== 'new') {
      const any = M.threads(ctx.data).length > 0;
      return [{action: 'new-message', title: T('menu_compose_new'), icon: 'ic_menu_compose'}, ...(any ? [{action: 'gbmms-delete-all', title: T('menu_delete_all'), icon: 'ic_menu_delete'}] : []), {action: 'mms-search', title: ctx.t('Search'), icon: 'ic_menu_search'}, {action: 'gbpref-open', id: 'mms', title: T('menu_preferences'), icon: 'ic_menu_preferences'}];
    }
    const draft = ctx.draft || {}, detail = ctx.sub === 'thread';
    const target = detail ? {key: String(ctx.thread)} : M.recipient(draft.recipient || '', ctx.data.contacts);
    const person = target && ctx.data.contacts.find(p => String(p.id) === target.key);
    const messages = detail && ctx.data.messages.some(m => String(m.contact) === String(ctx.thread));
    const items = [];
    if (target) items.push({action: 'mms-call', title: T('menu_call'), icon: 'gb-m-ic_menu_call.png'});
    if (person) items.push({action: 'gbmms-view-contact', id: person.id, title: T('menu_view_contact'), icon: 'gb-m-ic_menu_contact.png'});
    if (!ctx.subjectVisible) items.push({action: 'gbmms-subject', title: T('add_subject'), icon: 'gb-m-ic_menu_edit.png'});
    if (!draft.attachment) items.push({action: 'mms-attach', title: T('add_attachment'), icon: 'gb-m-ic_menu_attachment.png'});
    if (target && ((draft.body || '').trim() || draft.attachment)) items.push({action: 'gbmms-send', title: T('send'), icon: 'ic_menu_send'});
    items.push({action: 'mms-smiley', title: T('menu_insert_smiley'), icon: 'gb-m-ic_menu_emoticons.png'});
    items.push(messages ? {action: 'mms-delete-thread', title: T('delete_thread'), icon: 'ic_menu_delete'} : {action: 'mms-discard', title: T('discard'), icon: 'ic_menu_delete'});
    items.push({action: 'gbmms-all-threads', title: T('all_threads'), icon: 'gb-m-ic_menu_friendslist.png'});
    if (target && !person) items.push({action: 'gbmms-add-contact', title: T('menu_add_to_contacts'), icon: 'ic_menu_add'});
    return items;
  }

  // AlertDialogs: Add attachment (AttachmentTypeSelectorAdapter), Insert smiley, Message options, Message details and
  // the delete confirmations.
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), ok = ctx.ok, cancel = T('no');
    if (kind === 'attach') return {title: T('add_attachment'), icon: 'gb-m-ic_dialog_attach.png', items: [['attach_image', 'gallery', 'image'], ['attach_take_photo', 'camera', 'take-photo'], ['attach_video', 'video_player', 'video'], ['attach_record_video', 'camera_record', 'record-video'], ['attach_sound', 'musicplayer_2', 'sound'], ['attach_record_sound', 'record_audio', 'record-sound'], ['attach_slideshow', 'slideshow_add_sms', 'slideshow']].map(([key, icon, type]) => ({action: 'gbma-attach', id: type, title: T(key), icon: `gb-m-ic_launcher_${icon}.png`}))};
    if (String(kind).startsWith('gbma-')) return window.GBMmsAttach?.dialog(kind, ctx) || null;
    if (kind === 'pictures') return {title: T('attach_image'), custom: `<div class="gbmms-pictures">${ctx.data.photos.map(p => `<button type="button" data-action="mms-photo" data-id="${p.id}">${window.ICSMessaging.photo(p)}</button>`).join('')}</div>`, buttons: [{action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'smiley') {
      const names = array(ctx.lang, 'default_smiley_names'), texts = array(ctx.lang, 'default_smiley_texts');
      return {title: T('menu_insert_smiley'), custom: `<div class="gbmms-smileys" role="menu">${texts.map((t, i) => `<button type="button" data-action="mms-insert-smiley" data-id="${e(t)}"><img src="assets/gb-m-emo_im_${SMILEYS[i]}.png" alt=""><span>${e(names[i])}</span><span>${e(t)}</span></button>`).join('')}</div>`};
    }
    // ConversationList.onCreateContextMenu: the conversation's name as the title, View thread, View contact or Add to
    // Contacts, Delete thread.
    if (kind === 'thread') {
      const person = window.ICSMessaging.identity(ctx.thread, ctx.data.contacts), saved = ctx.data.contacts.some(p => String(p.id) === String(ctx.thread));
      return {title: person.name, items: [{action: 'thread', id: ctx.thread, title: T('menu_view')}, saved ? {action: 'gbmms-view-contact', id: ctx.thread, title: T('menu_view_contact')} : {action: 'gbmms-add-contact', title: T('menu_add_to_contacts')}, {action: 'mms-delete-thread', title: T('menu_delete')}]};
    }
    const m = ctx.message;
    if (kind === 'message' && m) return {title: T('message_options'), items: [{action: 'mms-forward', title: T('menu_forward')}, {action: 'gbmms-copy', title: T('copy_message_text')}, {action: 'mms-details', title: T('view_message_details')}, {action: 'mms-delete-message', title: T('delete_message')}, {action: 'gbmms-lock', title: T(m.locked ? 'menu_unlock' : 'menu_lock')}]};
    if (kind === 'details' && m) {
      const person = window.ICSMessaging.identity(m.contact, ctx.data.contacts);
      const lines = [T('message_type_label') + T(m.attachment ? 'multimedia_message' : 'text_message'), T(m.mine ? 'to_address_label' : 'from_label') + person.phone, T(m.mine ? 'sent_label' : 'received_label') + stamp(m, ctx, true)];
      return {title: T('message_details_title'), message: lines.join('\n'), buttons: [{action: 'close-overlay', title: ok}]};
    }
    if (kind === 'delete-thread') return {title: T('confirm_dialog_title'), icon: 'ic_dialog_alert', message: T('confirm_delete_conversation'), buttons: [{action: 'mms-confirm-delete', title: T('delete')}, {action: 'close-overlay', title: cancel}]};
    if (kind === 'delete-message') return {title: T('confirm_dialog_title'), icon: 'ic_dialog_alert', message: T('confirm_delete_message'), buttons: [{action: 'mms-confirm-delete', title: T('delete')}, {action: 'close-overlay', title: cancel}]};
    if (kind === 'delete-all') return {title: T('confirm_dialog_title'), icon: 'ic_dialog_alert', message: T('confirm_delete_all_conversations'), buttons: [{action: 'gbmms-delete-all-ok', title: T('delete')}, {action: 'close-overlay', title: cancel}]};
    return null;
  }

  window.GBMms = {SMILEYS, text, array, smileys, stamp, nameAndNumber, render, menu, dialog};
})();

/* Messaging on Android 2.3.6 (Mms.apk of GRK39F) as a module (docs/plans/engine-migration.md): the conversation list,
   search, the thread and the compose screen with its draft, subject and attachments (gb-mms-attach.js: the slideshow
   editor, the pickers, the capture requests), the long presses on a thread or a message, the Menu key, the dialogs and
   Clear data. Other apps open a thread (openThread), read the draft being written (draft) and return a capture
   (captureReturn, captureCancel) through the module. */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  // The shell's bindings the screen's code uses, and its helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderOverlay, toast, viewport, openApp, back} = c, clock = c.clock, clone = c.clone;
    function gbMmsContext() {
      const composing = ui.sub === 'thread' || ui.sub === 'new';
      return {lang: i18n.language, locale: i18n.locale(), t: key => i18n.t(key), hour24: data.settings.hour24, now: Date.now(), sub: ui.sub, thread: ui.thread, query: ui.mmsSearch, data, draft: composing ? data.messageDrafts?.[ICSMessaging.draftKey(ui)] : null, subjectVisible: composing && !!ui.gbMmsSubject, message: data.messages.find(m => String(m.id) === String(ui.mmsMessage)), ok: GBSettings.text(i18n.language, 'fw_ok'), cancel: GBSettings.text(i18n.language, 'fw_cancel'),
        // gb-mms-attach.js: the draft, the shell, the Camera's capture and Back.
        ui, root: viewport, draftOf: messageDraft, save, render, renderOverlay, toast, dialog: gbMmsDialog, capture: gbmaCapture, back};
    }
    // Capture picture / video (IMAGE_CAPTURE, VIDEO_CAPTURE): the Camera, then back to the message with what it took.
    function gbmaCapture(type, target) {
      ui.gbmaCapture = {type, target, ret: {sub: ui.sub, thread: ui.thread, screen: ui.gbmaScreen, slide: ui.gbmaSlide}};
      const capture = ui.gbmaCapture; openApp('camera'); ui.gbmaCapture = capture; ui.gbcamMode = type === 'video' ? 'video' : 'photo'; render();
    }
    function gbmaCancel() {
      const c = ui.gbmaCapture; ui.gbmaCapture = null; if (!c) return;
      openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, gbmaScreen: c.ret.screen, gbmaSlide: c.ret.slide}); render(); scrollMessages();
    }
    function gbmaReturn(part) {
      const c = ui.gbmaCapture; ui.gbmaCapture = null; if (!c) return;
      openApp('messaging'); Object.assign(ui, {sub: c.ret.sub, thread: c.ret.thread, gbmaScreen: c.ret.screen, gbmaSlide: c.ret.slide});
      GBMmsAttach.apply(gbMmsContext(), c.target, part); render(); scrollMessages();
    }
    function gbMmsDialog(kind) { ui.gbMmsDialog = kind; ui.overlay = 'gb-dialog-mms'; renderOverlay(); }
    function messageDraft() {
      data.messageDrafts ||= {};
      const key = ICSMessaging.draftKey(ui);
      return data.messageDrafts[key] ||= {body:'',recipient:''};
    }
    function openMessageThread(key) {
      if (ui.view !== 'messaging') openApp('messaging');
      if (ui.sub !== 'thread') ui.mmsListMode = ui.sub === 'search' ? 'search' : '';
      ui.thread = key; ui.sub = 'thread'; ui.overlay = '';
      data.messages.filter(m => String(m.contact) === String(key)).forEach(m => { m.read = true; });
      if (String(key) === '1') data.notifications = data.notifications.filter(n => n.id !== 2);
      save(); render(); scrollMessages();
    }
    function scrollMessages() {
      const history = viewport.querySelector('.mms-history');
      if (history) history.scrollTop = history.scrollHeight;
    }
    function sendMessage(id, body, attachment) {
      if (!body && !attachment) return;
      const subject = String(data.messageDrafts?.[ICSMessaging.draftKey(ui)]?.subject || '').trim();
      data.messages.push({ id: Date.now(), contact: id, body, mine: true, time: clock(), timestamp:Date.now(), read:true, ...(attachment ? {attachment:clone(attachment)} : {}), ...(subject ? {subject} : {}) });
      ui.gbMmsSubject = false;
      delete data.messageDrafts?.[ICSMessaging.draftKey(ui)];
      openMessageThread(id);
    }
    return {data, ui, save, render, renderOverlay, toast, viewport, clone, openApp, contact: c.contact, startPhoneCall: c.startPhoneCall, editPerson: c.editPerson, gbMmsContext, gbmaCapture, gbmaCancel, gbmaReturn, gbMmsDialog, messageDraft, openMessageThread, scrollMessages, sendMessage};
  }
  window.GB?.register('messaging', {
    openThread: (c, key) => shell(c).openMessageThread(key),
    draft: c => shell(c).messageDraft(),
    captureCancel: c => shell(c).gbmaCancel(),
    captureReturn: (c, part) => shell(c).gbmaReturn(part),
    render: c => GBMms.render(shell(c).gbMmsContext()),
    // The attachment editor's controls; a long press (or a right click) on a message or a thread opens its menu.
    mount(c, root) {
      const {ui, gbMmsContext, gbMmsDialog} = shell(c);
      window.GBMmsAttach?.mounted(gbMmsContext());
      GB.hold(c, root, '.mms-message', message => { ui.mmsMessage = message.dataset.id; gbMmsDialog('message'); });
      GB.hold(c, root, '.gbmms-thread[data-action="thread"]', thread => { ui.thread = thread.dataset.id; gbMmsDialog('thread'); });
    },
    // The slideshow player and Sound Recorder have no menu.
    menu(c) { c.gbMenu(GBMms.menu(shell(c).gbMmsContext())); },
    dialog: (kind, c) => GBMms.dialog(kind, shell(c).gbMmsContext()),
    // The attachment screens close first; a thread returns to the list (or the search it came from).
    back(c) {
      const {ui, render, gbMmsContext} = shell(c);
      if (window.GBMmsAttach?.back(gbMmsContext())) { render(); return true; }
      if (ui.sub === 'thread') { ui.sub = ui.mmsListMode || ''; render(); return true; }
      return false;
    },
    action(name, el, c) {
      const id = el.dataset.id, action = name, {data, ui, save, render, renderOverlay, toast, viewport, clone, openApp, contact, startPhoneCall, editPerson, gbMmsContext, gbMmsDialog, messageDraft, openMessageThread, scrollMessages} = shell(c);
      if (action.startsWith('gbma-') && window.GBMmsAttach?.handle(action, id, gbMmsContext())) return true;
      switch (name) {
        case 'thread': openMessageThread(id); break;
        case 'mms-search': ui.sub = 'search'; ui.overlay = ''; ui.mmsSearch = ''; render(); viewport.querySelector('.mms-search input')?.focus(); break;
        case 'mms-attach': gbMmsDialog('attach'); break;
        case 'mms-smiley': gbMmsDialog('smiley'); break;
        case 'gbmms-pictures': gbMmsDialog('pictures'); break;
        case 'gbmms-delete-all': gbMmsDialog('delete-all'); break;
        case 'gbmms-delete-all-ok': data.messages = []; data.messageDrafts = data.messageDrafts?.new ? {new: data.messageDrafts.new} : {}; data.notifications = data.notifications.filter(n => n.id !== 2); ui.overlay = ''; save(); render(); break;
        case 'gbmms-view-contact': ui.overlay = ''; openApp('people'); ui.selectedContact = Number(id); ui.sub = 'detail'; render(); break;
        case 'gbmms-add-contact': { const target = ui.sub === 'new' ? ICSMessaging.recipient(messageDraft().recipient || '', data.contacts) : ICSMessaging.identity(ui.thread, data.contacts); ui.overlay = ''; openApp('people'); editPerson(true); ui.peopleDraft.phone = target?.phone || ''; render(); break; }
        case 'gbmms-subject': ui.gbMmsSubject = true; ui.overlay = ''; render(); viewport.querySelector('[name=subject]')?.focus(); break;
        case 'gbmms-send': ui.overlay = ''; renderOverlay(); viewport.querySelector('.mms-compose')?.requestSubmit(); break;
        case 'gbmms-all-threads': ui.overlay = ''; ui.sub = ''; ui.gbMmsSubject = false; render(); break;
        case 'gbmms-copy': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); try { navigator.clipboard?.writeText(message?.body || '')?.catch(() => {}); } catch {} ui.overlay = ''; renderOverlay(); break; }
        case 'gbmms-lock': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (message) message.locked = !message.locked; ui.overlay = ''; save(); render(); break; }
        case 'gbmms-thread-menu': ui.thread = id; gbMmsDialog('thread'); break;
        case 'mms-recipient': { const person = contact(id); if (person) { messageDraft().recipient = person.phone; save(); render(); viewport.querySelector('.mms-compose textarea').focus(); } break; }
        case 'mms-call': {const person=ICSMessaging.identity(ui.thread,data.contacts);startPhoneCall(person.phone);break;}
        case 'mms-photo': { const photo = data.photos.find(p => p.id === Number(id)); if (photo) { messageDraft().attachment = clone(photo); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); } break; }
        case 'mms-remove-attachment': { const draft = messageDraft(); delete draft.attachment; if (!draft.subject) toast(GBMms.text(i18n.language, 'converting_to_text_message')); save(); render(); scrollMessages(); break; }
        case 'mms-insert-smiley': messageDraft().body = ((messageDraft().body || '') + ' ' + id).trim().slice(0,2000); messageDraft().updated = Date.now(); save(); ui.overlay = ''; render(); scrollMessages(); break;
        case 'mms-discard': delete data.messageDrafts?.[ICSMessaging.draftKey(ui)]; ui.gbMmsSubject = false; save(); ui.overlay = ''; if (ui.sub === 'new') ui.sub = ''; render(); scrollMessages(); break;
        case 'mms-message': ui.mmsMessage = id; gbMmsDialog('message'); break;
        case 'mms-details': gbMmsDialog('details'); break;
        case 'mms-forward': { const message = data.messages.find(m => String(m.id) === String(ui.mmsMessage)); if (!message) break; ui.sub = 'new'; Object.assign(messageDraft(),{body:message.body,recipient:'',attachment:message.attachment ? clone(message.attachment) : null,updated:Date.now()}); save(); ui.overlay = ''; render(); break; }
        case 'mms-delete-thread': case 'mms-delete-message': ui.mmsDelete = action === 'mms-delete-thread' ? 'thread' : 'message'; gbMmsDialog(`delete-${ui.mmsDelete}`); break;
        case 'mms-confirm-delete': {
          data.messages = data.messages.filter(m => ui.mmsDelete === 'thread' ? String(m.contact) !== String(ui.thread) : String(m.id) !== String(ui.mmsMessage));
          if (ui.mmsDelete === 'thread') { delete data.messageDrafts?.[String(ui.thread)]; ui.sub = ''; }
          save(); ui.overlay = ''; render(); break;
        }
        case 'new-message': ui.sub = 'new'; ui.overlay = ''; render(); viewport.querySelector('[name=recipient]')?.focus(); break;
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      const {data, ui, render, toast, messageDraft, sendMessage} = shell(c);
      switch (name) {
        case 'mms-search': ui.mmsSearch = String(values.get('query') || '').trim(); render(); break;
        case 'mms-send': {
          const target = ui.sub === 'thread' ? {key:ui.thread} : ICSMessaging.recipient(values.get('recipient'),data.contacts);
          if (!target) { toast('Enter a contact name or valid phone number'); return true; }
          sendMessage(target.key, String(values.get('body') || '').trim(), messageDraft().attachment); break;
        }
        default: return false;
      }
      return true;
    },
    // The compose form: the draft, the recipient's suggestions, the character counter and the growing body.
    input(event, c) {
      const {data, save, viewport, messageDraft} = shell(c), safe = c.safe, dp = c.dp;
      if (event.target.closest('.mms-compose')) {
        const draft = messageDraft();
        if (event.target.name === 'body') draft.body = event.target.value;
        if (event.target.name === 'subject') draft.subject = event.target.value;
        if (event.target.name === 'recipient') {
          draft.recipient = event.target.value;
          const query = draft.recipient.trim().toLocaleLowerCase();
          viewport.querySelector('.mms-suggestions').innerHTML = query ? data.contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(query)).slice(0,5).map(p => `<button type="button" data-action="mms-recipient" data-id="${p.id}">${safe(p.name)}<small>${safe(p.phone)}</small></button>`).join('') : '';
        }
        draft.updated = Date.now(); save();
        const count = ICSMessaging.counter(draft.body || '');
        viewport.querySelector('.mms-counter').textContent = draft.attachment ? 'MMS' : count.count > 1 || count.remaining <= 10 ? `${count.remaining} / ${count.count}` : '';
        viewport.querySelector('.mms-send').disabled = !(draft.body || '').trim() && !draft.attachment;
        if (event.target.name === 'body') { event.target.style.height = 'calc(48 * var(--dp))'; event.target.style.height = `${Math.min(dp(93.913),event.target.scrollHeight)}px`; }
        return true;
      }
      return false;
    },
    clearData(c) { const data = c.data; data.messages=c.clone(c.defaults.messages);data.messageDrafts={}; }
  });
})();
