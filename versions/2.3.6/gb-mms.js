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
    const attachment = window.GBMmsAttach ? GBMmsAttach.editor(ctx, draft) : draft.attachment ? `<div class="gbmms-attachment"><span class="gbmms-attachment-image">${M.photo(draft.attachment)}</span><span class="gbmms-attachment-buttons"><button type="button" data-action="gbset-toast" data-id="Unavailable in this simulator">${e(T('view'))}</button><button type="button" data-action="mms-attach">${e(T('replace_image'))}</button><button type="button" data-action="mms-remove-attachment">${e(T('remove'))}</button></span></div>` : '';
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
      return [{action: 'new-message', title: T('menu_compose_new'), icon: 'ic_menu_compose'}, ...(any ? [{action: 'gbmms-delete-all', title: T('menu_delete_all'), icon: 'ic_menu_delete'}] : []), {action: 'mms-search', title: ctx.t('Search'), icon: 'ic_menu_search'}, {action: 'gbset-toast', id: 'Unavailable in this simulator', title: T('menu_preferences'), icon: 'ic_menu_preferences'}];
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
