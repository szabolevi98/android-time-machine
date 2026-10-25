/* Messaging of the JWR66Y (Nexus 4) image (Mms.apk): ConversationList and ComposeMessageActivity in Holo Light with the
   split action bar. Its words come from mms-strings.js (the image's Mms resources); contact names and message texts are
   the simulator's. */
(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize = number => String(number).replace(/[\s().-]/g, '');
  function recipient(value, contacts) {
    const raw = String(value).trim();
    const person = contacts.find(p => p.name.toLocaleLowerCase() === raw.toLocaleLowerCase() || normalize(p.phone) === normalize(raw));
    if (person) return {key:String(person.id), name:person.name, phone:person.phone};
    const phone = normalize(raw);
    return /^\+?\d{3,20}$/.test(phone) ? {key:`tel:${phone}`, name:raw, phone:raw} : null;
  }
  function identity(key, contacts) {
    const person = contacts.find(p => String(p.id) === String(key));
    return person || {name:String(key).replace(/^tel:/,''),phone:String(key).replace(/^tel:/,'')};
  }
  const draftKey = ui => ui.sub === 'new' ? 'new' : String(ui.thread);
  function counter(body) {
    const basic = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà';
    const extended = '^{}\\[~]|€\f';
    let length = 0, unicode = false;
    for (const char of body) {
      if (basic.includes(char)) length++;
      else if (extended.includes(char)) length += 2;
      else { unicode = true; break; }
    }
    if (unicode) length = body.length;
    const single = unicode ? 70 : 160, segment = unicode ? 67 : 153;
    const count = length <= single ? 1 : Math.ceil(length / segment);
    return {remaining:(count === 1 ? single : count * segment) - length, count};
  }
  function threads(data, query = '') {
    const keys = new Set(data.messages.map(m=>String(m.contact)));
    for (const [key,draft] of Object.entries(data.messageDrafts || {})) if (key !== 'new' && (draft.body || draft.attachment)) keys.add(key);
    const q = query.trim().toLocaleLowerCase();
    return [...keys].map(key => {
      const messages = data.messages.filter(m=>String(m.contact)===key);
      const last = messages.at(-1), draft = data.messageDrafts?.[key];
      return {key,person:identity(key,data.contacts),messages,last,draft,order:Math.max(last?.timestamp || last?.id || 0,draft?.updated || 0)};
    }).filter(thread=>!q || [thread.person.name,thread.person.phone,...thread.messages.map(m=>m.body),thread.draft?.body].join(' ').toLocaleLowerCase().includes(q))
      .sort((a,b)=>b.order-a.order);
  }
  const M = key => window.MmsStrings?.t(key) ?? key;
  const icon = (action, label, file) => `<button data-action="${action}" aria-label="${escape(label)}"><img src="assets/${file}" alt=""></button>`;
  const avatar = '<img class="mms-avatar" src="assets/mms-ic_contact_picture.png" alt="">';
  /* audio_attachment_view.xml (on attachment_editor_bg): ic_attach_capture_audio_holo_light over the audio's name,
     album and artist, with Play, Replace and Remove (100 x 45 dp small buttons) at the end; in the message list the
     icon and the name. */
  function audio(item, editor = false) {
    const lines = `<img src="assets/mms-ic_attach_capture_audio_holo_light.png" alt=""><span>${escape(item.name)}</span>${editor ? `<span>${escape(item.album || '')}</span><span>${escape(item.artist || '')}</span>` : ''}`;
    return editor ? `<div class="mms-audio-editor"><div class="mms-audio-info">${lines}</div><div class="mms-audio-buttons"><button type="button" data-action="jbma-view">${escape(M('Play'))}</button><button type="button" data-action="mms-attach">${escape(M('Replace'))}</button><button type="button" data-action="mms-remove-attachment">${escape(M('Remove'))}</button></div></div>` : `<div class="mms-audio">${lines}</div>`;
  }
  function photo(item) {
    if(item?.kind==='audio')return audio(item);
    if(window.ICSMedia)return `<div class="mms-photo media-attachment">${ICSMedia.art(item)}<span>${escape(item.name)}</span></div>`;
    const colors = item.colors.filter(c=>/^#[\da-f]{6}$/i.test(c));
    return `<div class="mms-photo" style="background:linear-gradient(150deg,${colors.join(',') || '#555,#aaa'})"><span>${escape(item.name)}</span></div>`;
  }
  // RecipientsEditor is ex/chips' RecipientEditTextView: a picked contact becomes a chip, chip_background with the name
  // in 14 sp black and the contact photo as a chip-high square at its end (createUnselectedChip); a tapped chip turns
  // chip_background_selected with white text and chip_delete in place of the photo (createSelectedChip). The simulator
  // keeps one recipient, so a new pick replaces the chip.
  function chip(draft, contacts, ui) {
    const person = draft.chip ? recipient(draft.recipient || '', contacts) : null;
    if (!person) return '';
    const selected = !!ui.mmsChipSelected;
    return `<button type="button" class="mms-chip${selected ? ' selected' : ''}" data-action="mms-chip" aria-label="${escape(person.name)}"><span>${escape(person.name)}</span><img src="assets/${selected ? 'mms-chip_delete.png' : 'mms-ic_contact_picture.png'}" alt=""></button>`;
  }
  // The suggestions as mms_chips_recipient_dropdown_item: the name (18 sp), under it the number (14 sp) and its type
  // label (10 sp) at the end, and the 48 dp contact photo on the right.
  function suggestions(query, contacts, t) {
    const q = String(query).trim().toLocaleLowerCase();
    if (!q) return '';
    return contacts.filter(p => `${p.name} ${p.phone}`.toLocaleLowerCase().includes(q)).slice(0, 5).map(p => `<button type="button" class="mms-suggestion" data-action="mms-recipient" data-id="${p.id}"><span class="mms-suggestion-copy"><span class="mms-suggestion-name">${escape(p.name)}</span><span class="mms-suggestion-line"><span>${escape(p.phone)}</span><small>${escape(t('Mobile'))}</small></span></span><img src="assets/mms-ic_contact_picture.png" alt=""></button>`).join('');
  }
  function render(data, ui, t, locale) {
    const detail = ui.sub === 'thread', compose = detail || ui.sub === 'new';
    const person = identity(ui.thread,data.contacts), draft = data.messageDrafts?.[draftKey(ui)] || {};
    const title = detail ? person.name : ui.sub === 'new' ? M('New message') : M('Messaging');
    const time = message => message?.timestamp ? new Date(message.timestamp).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'}) : t(message?.time || '');
    const header = `<header class="mms-header"><button class="mms-up" data-action="${ui.sub ? 'back' : 'home'}" aria-label="Back">${ui.sub ? '<span>‹</span>' : ''}<img src="assets/messaging.png" alt=""></button><div class="mms-title"><h2>${escape(title)}</h2>${detail ? `<small>${escape(person.phone)}</small>` : ''}</div>${compose ? `${detail ? icon('mms-call',M('Call'),'mms-ic_menu_call.png') : ''}${icon('mms-attach',M('Attach'),'mms-ic_menu_attachment.png')}${icon('mms-menu','More options','ic_menu_overflow.png')}` : ''}</header>`;
    if (!compose) {
      const list = threads(data,ui.sub === 'search' ? ui.mmsSearch || '' : '');
      return `<div class="app-view mms-app" data-no-translate>${header}${ui.sub === 'search' ? `<form class="mms-search" data-form="mms-search"><input name="query" type="search" aria-label="${escape(M('Search messaging'))}" placeholder="${escape(M('Search messaging'))}" maxlength="100" value="${escape(ui.mmsSearch || '')}"><button type="submit" aria-label="Search">⌕</button></form>` : ''}<div class="mms-scroll mms-threads">${data.messageDrafts?.new?.body || data.messageDrafts?.new?.attachment ? `<button class="mms-new-draft" data-action="new-message">${escape(M('Draft'))}: ${escape(data.messageDrafts.new.body || t('Picture'))}</button>` : ''}${list.map(thread=>`<button class="mms-thread ${thread.messages.some(m=>m.read===false) ? 'unread' : ''}" data-action="thread" data-id="${escape(thread.key)}">${avatar}<span class="mms-thread-copy"><strong>${escape(thread.person.name)} <em>(${thread.messages.length})</em></strong><span>${thread.draft?.body || thread.draft?.attachment ? `<b>${escape(M('Draft'))}:</b> ${escape(thread.draft.body || t('Picture'))}` : escape(thread.last?.body || t('Picture'))}</span></span><time>${escape(time(thread.last))}</time></button>`).join('') || `<p class="mms-empty">${escape(ui.mmsSearch ? t('No messages found') : M('No conversations.'))}</p>`}</div><footer class="mms-actions">${icon('new-message',M('New message'),'mms-ic_menu_msg_compose_holo_dark.png')}${icon('mms-search',M('Search'),'mms-ic_menu_search_holo_dark.png')}${icon('mms-menu','More options','ic_menu_overflow.png')}</footer></div>`;
    }
    // The slideshow editor and player open over the compose screen (jb-mms-attach.js).
    const over = window.JBMmsAttach?.screen({ui, data, t, draftOf: () => draft});
    if (over) return over;
    const messages = detail ? data.messages.filter(m=>String(m.contact)===String(ui.thread)) : [];
    const count = counter(draft.body || '');
    return `<div class="app-view mms-app" data-no-translate>${header}<form class="mms-compose" data-form="mms-send">${!detail ? `<div class="mms-recipient">${chip(draft, data.contacts, ui)}<input name="recipient" aria-label="${escape(M('To'))}" placeholder="${draft.chip ? '' : escape(M('To'))}" autocomplete="off" maxlength="60" value="${escape(draft.chip ? draft.query || '' : draft.recipient || '')}"><div class="mms-suggestions"></div></div>` : ''}<div class="mms-scroll mms-history">${messages.map(message=>`<button type="button" class="mms-message ${message.mine ? 'sent' : 'received'}" data-action="mms-message" data-id="${message.id}">${avatar}<span class="mms-message-copy"><span>${escape(message.body)}</span>${message.attachment ? window.JBMmsAttach?.row(message) || photo(message.attachment) : ''}<time>${escape(time(message))}${message.locked ? '<img class="mms-locked" src="assets/mms-ic_lock_message_sms.png" alt="">' : ''}</time></span></button>`).join('')}</div>${window.JBMmsAttach ? JBMmsAttach.editor(draft) : draft.attachment ? (draft.attachment.kind === 'audio' ? audio(draft.attachment, true) : `<div class="mms-attachment">${photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="Remove attachment">×</button></div>`) : ''}<div class="mms-compose-bar${window.JBMmsAttach?.kindOf(draft.attachment) === 'slideshow' ? ' jbma-hidden' : ''}"><textarea name="body" aria-label="${escape(M('Type message'))}" placeholder="${escape(M('Type message'))}" rows="1" maxlength="2000">${escape(draft.body || '')}</textarea><div><small class="mms-counter">${draft.attachment ? escape(M('MMS')) : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : ''}</small><button class="mms-send" type="submit" aria-label="${escape(M('Send'))}" ${!(draft.body || '').trim() && !draft.attachment ? 'disabled' : ''}><img src="assets/mms-ic_send_holo_light.png" alt=""></button></div></div></form></div>`;
  }
  window.ICSMessaging = {render,recipient,identity,draftKey,counter,threads,photo,escape,suggestions};
})();
