/* SMS/MMS: the local conversations and their Google Messenger screens. */
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
  // Hangouts keeps its chats and drafts apart from Messenger's SMS (channel 'hangouts', drafts under 'hg:').
  const channelOf = message => message.channel || 'sms';
  const draftKey = ui => (ui.view === 'hangouts' ? 'hg:' : '') + (ui.sub === 'new' ? 'new' : String(ui.thread));
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
  function threads(data, query = '', channel = 'sms') {
    const pool = data.messages.filter(m => channelOf(m) === channel), prefix = channel === 'hangouts' ? 'hg:' : '';
    const keys = new Set(pool.map(m=>String(m.contact)));
    for (const [key,draft] of Object.entries(data.messageDrafts || {})) if (key.startsWith(prefix) && (prefix || !key.startsWith('hg:')) && key !== prefix + 'new' && (draft.body || draft.attachment)) keys.add(key.slice(prefix.length));
    const q = query.trim().toLocaleLowerCase();
    return [...keys].map(key => {
      const messages = pool.filter(m=>String(m.contact)===key);
      const last = messages.at(-1), draft = data.messageDrafts?.[prefix + key];
      return {key,person:identity(key,data.contacts),messages,last,draft,order:Math.max(last?.timestamp || last?.id || 0,draft?.updated || 0)};
    }).filter(thread=>!q || [thread.person.name,thread.person.phone,...thread.messages.map(m=>m.body),thread.draft?.body].join(' ').toLocaleLowerCase().includes(q))
      .sort((a,b)=>b.order-a.order);
  }
  function photo(item) {
    if(window.ICSMedia)return `<div class="mms-photo media-attachment">${ICSMedia.art(item)}<span>${escape(item.name)}</span></div>`;
    const colors = item.colors.filter(c=>/^#[\da-f]{6}$/i.test(c));
    return `<div class="mms-photo" style="background:linear-gradient(150deg,${colors.join(',') || '#555,#aaa'})"><span>${escape(item.name)}</span></div>`;
  }
  /* Google Messenger 1.1 (com.google.android.apps.messaging, PrebuiltBugle on LMY48Y). ConversationListActivity: the
     #0288D1 toolbar ("Messenger", search, overflow), rows padded 16 dp with the round contact icon, the 16 sp name
     (#323232 and bold when unread, #636363 when read), the 14 sp snippet and the timestamp under it ("Now", "5 mins",
     the time, the weekday, the date); the blue 56 dp FAB with + sits 14 dp in and 12 dp up.
     ConversationActivity: the toolbar and status bar take the conversation's letter-tile colour; messages on
     #EEEEEE in msg_bubble nine-patches with the tail at the top, incoming in that colour with white 16 sp text and
     the 42 dp contact icon, outgoing white with #323232 text; 18 dp between authors, 2 dp within a run. The compose
     row: attach, the white "Send message" field and the round send button in the conversation colour. */
  const color = person => window.LPDialer ? LPDialer.tileColor(person?.name || '') : '#547dbe';
  const tile = (person, cls) => window.LPDialer ? LPDialer.letterTile(person, cls) : '';
  function stamp(message, t, locale, now = Date.now()) {
    if (!message) return '';
    if (!message.timestamp) return t(message.time || '');
    const diff = now - message.timestamp, minutes = Math.floor(diff / 60000);
    if (minutes < 1) return t('Now');
    if (minutes < 60) return AndroidStrings.format(t(AndroidStrings.quantity(minutes) === 'one' ? '%d min' : '%d mins'), minutes);
    const date = new Date(message.timestamp), today = new Date(now);
    if (date.toDateString() === today.toDateString()) return date.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    if (diff < 6 * 86400000) return date.toLocaleDateString(locale, {weekday: 'short'});
    return date.toLocaleDateString(locale, {month: 'short', day: 'numeric'});
  }
  const tool = (action, label, file, cls = '') => `<button type="button" class="lpm-tool ${cls}" data-action="${action}" aria-label="${escape(label)}"><img src="assets/${file}" alt=""></button>`;
  function render(data, ui, t, locale, now = Date.now()) {
    const detail = ui.sub === 'thread', compose = detail || ui.sub === 'new';
    const person = identity(ui.thread,data.contacts), draft = data.messageDrafts?.[draftKey(ui)] || {};
    if (!compose) {
      // A blocked conversation is archived (MessengerOptions); Archived lists those apart.
      const searching = ui.sub === 'search', archived = ui.sub === 'archived', list = threads(data, searching ? ui.mmsSearch || '' : '').filter(thread => !!window.MessengerOptions?.archived(data, thread.key) === archived);
      const M = key => window.MessengerOptions ? MessengerOptions.M(key) : key;
      const bar = archived ? `<header class="lpm-toolbar">${tool('back', t('Navigate up'), 'bg-ic_arrow_back_light.png')}<h2>${escape(M('Archived'))}</h2>${tool('mms-menu', t('More options'), 'gd-ic_overflow_menu.png', 'lpm-white')}</header>`
        : searching
        ? `<header class="lpm-toolbar">${tool('back', t('Navigate up'), 'bg-ic_arrow_back_light.png')}<form class="lpm-search mms-search" data-form="mms-search"><input name="query" type="search" aria-label="${escape(t('Search'))}" placeholder="${escape(t('Search'))}" maxlength="100" value="${escape(ui.mmsSearch || '')}"></form></header>`
        : `<header class="lpm-toolbar"><h2>${escape(t('Messenger'))}</h2>${tool('mms-search', t('Search'), 'bg-ic_search_light.png')}${tool('mms-menu', t('More options'), 'gd-ic_overflow_menu.png', 'lpm-white')}</header>`;
      const rows = list.map(thread => {
        const unread = thread.messages.some(m => m.read === false), last = thread.last;
        const snippet = thread.draft?.body || thread.draft?.attachment ? `<b>${escape(t('Draft'))}</b> ${escape(thread.draft.body || t('Picture'))}` : `${last?.mine ? escape(t('You: ')) : ''}${escape(last?.body || t('Picture'))}`;
        return `<button class="mms-thread lpm-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${escape(thread.key)}">${tile(thread.person, 'lpm-avatar')}<span class="lpm-thread-copy"><strong>${escape(thread.person.name)}</strong><span class="lpm-snippet">${snippet}</span><time>${escape(stamp(last, t, locale, now))}</time></span></button>`;
      }).join('');
      return `<div class="app-view mms-app lpm-app">${bar}<div class="mms-scroll mms-threads lpm-list">${rows || `<p class="lpm-empty">${escape(archived ? M('Archived empty') : t(ui.mmsSearch ? 'No messages found' : 'Once you start a new conversation, you’ll see it listed here'))}</p>`}</div>${searching || archived ? '' : `<button class="lpm-fab" data-action="new-message" aria-label="${escape(t('Start new conversation'))}"><img src="assets/bg-ic_add_white.png" alt=""></button>`}</div>`;
    }
    const messages = detail ? data.messages.filter(m=>String(m.contact)===String(ui.thread) && channelOf(m) === 'sms') : [];
    const c = detail ? color(person) : '#0288d1';
    const can = !!(draft.body || '').trim() || !!draft.attachment;
    const count = counter(draft.body || '');
    const head = detail
      ? `<header class="lpm-toolbar lpm-conv-bar" style="background:${c}">${tool('back', t('Navigate up'), 'bg-ic_arrow_back_light.png')}<h2>${escape(person.name)}</h2>${tool('mms-call', t('Make a call'), 'bg-ic_phone_small_light.png')}${tool('mms-menu', t('More options'), 'gd-ic_overflow_menu.png', 'lpm-white')}</header>`
      : `<header class="lpm-toolbar">${tool('back', t('Navigate up'), 'bg-ic_arrow_back_light.png')}<h2>${escape(t('New message'))}</h2></header>`;
    let previous = null;
    const bubbles = messages.map(message => {
      const same = previous && previous.mine === message.mine; previous = message;
      return `<button type="button" class="mms-message lpm-message ${message.mine ? 'sent' : 'received'}${same ? ' same' : ''}" data-action="mms-message" data-id="${message.id}">${message.mine ? '' : `<span class="lpm-message-icon">${same ? '' : tile(person, 'lpm-avatar-small')}</span>`}<span class="lpm-bubble"${message.mine ? '' : ` style="background:${c}"`}><span class="lpm-text">${escape(message.body)}</span>${message.attachment ? photo(message.attachment) : ''}<time>${escape(stamp(message, t, locale, now))}</time></span></button>`;
    }).join('');
    const picker = !detail ? `<div class="mms-recipient lpm-to"><span>${escape(t('To'))}</span><input name="recipient" aria-label="${escape(t('To'))}" placeholder="${escape(t('Type name or phone number'))}" autocomplete="off" maxlength="60" value="${escape(draft.recipient || '')}"><div class="mms-suggestions"></div></div><div class="lpm-picker"><nav class="lpm-picker-tabs"><span class="on">${escape(t('ALL CONTACTS'))}</span></nav>${[...data.contacts].sort((a, b) => a.name.localeCompare(b.name, locale)).map(p => `<button type="button" class="lpm-pick" data-action="mms-recipient" data-id="${p.id}">${tile(p, 'lpm-avatar')}<span><strong>${escape(p.name)}</strong><small>${escape(p.phone)} ${escape(t('Mobile'))}</small></span></button>`).join('')}</div>` : '';
    return `<div class="app-view mms-app lpm-app lpm-conversation" style="--lpm-c:${c}">${head}<form class="mms-compose lpm-compose" data-form="mms-send">${picker}<div class="mms-scroll mms-history lpm-history"${detail ? '' : ' hidden'}>${bubbles}</div>${draft.attachment ? `<div class="mms-attachment lpm-attachment">${photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="${escape(t('Remove'))}">×</button></div>` : ''}<div class="mms-compose-bar lpm-compose-bar">${tool('mms-attach', t('Add attachment'), 'bg-ic_attachment_dark.png', 'lpm-attach')}<span class="lpm-field"><textarea name="body" rows="1" maxlength="2000" aria-label="${escape(t('Send message'))}" placeholder="${escape(t('Send message'))}">${escape(draft.body || '')}</textarea><small class="mms-counter">${draft.attachment ? 'MMS' : count.count > 1 || count.remaining < 10 ? `${count.remaining} / ${count.count}` : ''}</small></span><button class="mms-send lpm-send" type="submit" aria-label="${escape(t('Send'))}" ${can ? '' : 'disabled'}><img src="assets/bg-ic_send_light.png" alt=""></button></div></form></div>`;
  }
  window.ICSMessaging = {render,recipient,identity,draftKey,counter,threads,photo,escape,stamp,channelOf};
})();
