/* Hangouts 1.0.2 on the Nexus 4 (Hangouts.apk of JWR66Y; May 2013): chats with Google contacts only, SMS stays in
   Messaging. From the APK's layouts, menus and code:
   - EsActionBar on ab_solid (#e5e5e5 over a 1.5 dp #cecece line) with the 18 sp #9a000000 title; ic_add_gray for New
     Hangout, ic_hangout_gray (start_hangout_menu_item) in a conversation, the Sherlock overflow;
   - conversation_list_item_view.xml: 72 dp rows on #f9f9f9, the 56 dp avatar 8 dp in, the 18 sp name and 12 sp time
     14 dp down, the 14 sp snippet 4 dp under them; ConversationListItemView.refreshUnreadState draws unread rows bold
     in #cc000000, read ones in #9a000000;
   - the conversation on #e5e5e5: MessageListItemView puts the 48 dp avatar top left (incoming) or bottom right
     (outgoing) with msg_bubble_left / msg_bubble_right overlapping it by the 10 dp arrow, 6 dp between messages,
     16 sp #cc000000 text and the 12 sp #66000000 time; compose_message_view.xml: the 48 dp white editor with "Send a
     message" (#bbbbbb) and ic_camera_dark, giving way to ic_send_dark;
   - New Hangout (UberEditAudienceFragment): the audience field ("Type a name, email, number, or circle") over 64 dp
     people_list_item_view.xml rows (48 dp avatar, 18 sp black name);
   - the menus of conversation_list_activity_menu.xml and conversation_activity_menu.xml (People & options, Add people,
     Archive / Unarchive, Delete).
   The SMS data, drafts and message options are shared with the AOSP Mms presentation in messaging.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const AVATAR = 'assets/hg1-default_avatar.png';
  // Hangouts.apk's own texts (stock-strings.js, group hangouts), then the image's.
  const H = (t, key) => { const row = window.StockStrings?.hangouts?.[key]; return row ? AndroidStrings.pick(row, String(globalThis.document?.documentElement?.lang || '').slice(0, 2), key) : t(key); };
  // A conversation stays archived until something newer than the archiving arrives in it (conversation_archived).
  const isArchived = (data, thread) => { const at = data.hgArchived?.[thread.key]; return !!at && !(thread.last?.timestamp > at); };
  // EsApplication.showDndChoiceDialog: 60, 120, 240, 480, 1440 and 4320 minutes as plurals/dnd_hours.
  const SNOOZE_MINUTES = [60, 120, 240, 480, 1440, 4320];
  const hours = (t, minutes) => minutes === 60 ? H(t, '1 hour') : AndroidStrings.format(H(t, '%d hours'), minutes / 60);
  // Hangouts.apk's own xhdpi drawables (hg1-*).
  const IMG = {add: 'hg1-ic_add_gray', hangout: 'hg1-ic_hangout_gray', overflow: 'hg1-abs__ic_menu_moreoverflow_normal_holo_light', camera: 'hg1-ic_camera_dark', send: 'hg1-ic_send_dark_normal', photo: 'hg1-ic_menu_camera', gallery: 'hg1-ic_gallery_dark', albums: 'hg1-ic_plus_gallery_dark', video: 'hg1-ic_video_light'};
  const svg = Object.fromEntries(Object.entries(IMG).map(([key, file]) => [key, `<img src="assets/${file}.png" alt="">`]));
  const button = (action, label, icon, extra = '') => `<button type="button" class="hg-ab-btn" data-action="${action}" aria-label="${e(label)}" ${extra}>${svg[icon]}</button>`;
  function stamp(message, t, locale, now, list) {
    if (!message) return '';
    if (!message.timestamp) return t(message.time || '');
    const date = new Date(message.timestamp);
    if (list && now - date < 60000) return t('Just now');
    if (list && date.toDateString() === new Date(now).toDateString()) return date.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    return list ? date.toLocaleDateString(locale, {month: 'short', day: 'numeric'}) : date.toLocaleString(locale, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  }
  function bar({up, title, subtitle, spinner, actions}) {
    return `<header class="hg-bar"><button type="button" class="hg-up" data-action="${up ? 'back' : 'home'}" aria-label="${up ? 'Back' : 'Home'}">${up ? '<img class="hg-caret" src="assets/hg1-abs__ic_ab_back_holo_light.png" alt="">' : ''}<img src="assets/hangouts.png" alt=""></button><div class="hg-title${spinner ? ' hg-spinner' : ''}"><h2>${e(title)}</h2>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</div>${actions}</header>`;
  }
  function list(data, ui, t, locale, now) {
    const archived = ui.sub === 'archived';
    const rows = ICSMessaging.threads(data).filter(thread => isArchived(data, thread) === archived).map(thread => {
      const draft = thread.draft?.body || thread.draft?.attachment;
      const last = thread.last;
      const snippet = draft ? `<b>${e(t('Draft'))}:</b> ${e(thread.draft.body || t('Picture'))}` : last ? `${last.mine ? e(t('You:')) + ' ' : ''}${e(last.body || t('Picture'))}` : '';
      const unread = thread.messages.some(m => m.read === false), person = window.HangoutsPrefs ? HangoutsPrefs.who(data, thread.key) : thread.person;
      return `<button class="hg-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${e(thread.key)}"><span class="hg-avatar"><img src="${AVATAR}" alt=""></span><span class="hg-thread-copy"><span class="hg-thread-top"><strong>${e(person.name)}</strong><time>${e(stamp(last, t, locale, now, true))}</time></span><span class="hg-snippet">${snippet}</span></span></button>`;
    }).join('');
    if (archived) return `<div class="app-view mms-app hg-app">${bar({up: true, title: H(t, 'Archived Hangouts'), actions: ''})}<div class="mms-scroll hg-threads">${rows || `<p class="hg-empty">${e(H(t, 'No archived Hangouts'))}</p>`}</div></div>`;
    const pending = data.messageDrafts?.new?.body || data.messageDrafts?.new?.attachment;
    // dnd_list_item.xml: the snooze banner over the list.
    const snoozed = data.hgSnooze > now ? `<div class="hg-dnd-bar"><span><b>${e(H(t, 'Notifications snoozed'))}</b><small>${e(AndroidStrings.format(H(t, 'Will resume at %s'), new Date(data.hgSnooze).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'})))}</small></span><i></i><button data-action="hg-dnd-cancel">${e(H(t, 'Resume'))}</button></div>` : '';
    return `<div class="app-view mms-app hg-app">${bar({title: t('Hangouts'), actions: button('new-message', H(t, 'New Hangout'), 'add') + button('mms-menu', t('More options'), 'overflow')})}${snoozed}<div class="mms-scroll hg-threads">${pending ? `<button class="hg-pending" data-action="new-message">${e(t('Draft'))}: ${e(data.messageDrafts.new.body || t('Picture'))}</button>` : ''}${rows || `<p class="hg-empty">${e(t('No conversations'))}</p>`}</div></div>`;
  }
  function picker(data, ui, t) {
    const draft = data.messageDrafts?.new || {};
    const people = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: t('New Hangout'), actions: button('mms-menu', t('More options'), 'overflow')})}<form class="hg-new" data-form="hg-new"><input name="recipient" autocomplete="off" maxlength="60" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(H(t, 'Type a name, email, number, or circle'))}" value="${e(draft.recipient || '')}"></form><div class="mms-scroll hg-people">${people.map(p => `<button class="hg-person" data-action="hg-pick" data-id="${e(p.id)}" data-search="${e(`${p.name} ${p.phone}`.toLocaleLowerCase())}"><img src="${AVATAR}" alt=""><span><strong>${e(p.name)}</strong><small>${e(p.email || p.phone)}</small></span></button>`).join('')}</div></div>`;
  }
  function conversation(data, ui, t, locale, now) {
    const person = window.HangoutsPrefs ? HangoutsPrefs.who(data, ui.thread) : ICSMessaging.identity(ui.thread, data.contacts), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
    const messages = data.messages.filter(m => String(m.contact) === String(ui.thread));
    const actions = button('mms-call', H(t, 'Video call'), 'hangout') + button('mms-menu', t('More options'), 'overflow');
    const cards = messages.map(message => `<button type="button" class="mms-message hg-message ${message.mine ? 'sent' : 'received'}" data-action="mms-message" data-id="${message.id}"><img class="hg-avatar-small" src="${AVATAR}" alt=""><span class="hg-card"><span class="hg-body">${e(message.body)}</span>${message.attachment ? ICSMessaging.photo(message.attachment) : ''}<time>${e(stamp(message, t, locale, now, false))}</time></span></button>`).join('');
    const canSend = (draft.body || '').trim() || draft.attachment;
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: person.name, actions})}<form class="mms-compose hg-compose" data-form="mms-send"><div class="mms-scroll mms-history hg-history">${cards}</div>${draft.attachment ? `<div class="mms-attachment">${ICSMessaging.photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="Remove attachment">×</button></div>` : ''}<div class="mms-compose-bar hg-editor"><textarea name="body" rows="1" maxlength="2000" aria-label="${e(t('Send a message'))}" placeholder="${e(H(t, 'Send a message'))}">${e(draft.body || '')}</textarea><small class="mms-counter" hidden></small><button type="button" class="hg-tool" data-action="mms-attach" aria-label="${e(H(t, 'Camera'))}">${svg.camera}</button><button class="mms-send hg-send" type="submit" aria-label="${e(t('Send'))}" ${canSend ? '' : 'disabled'}>${svg.send}</button></div></form></div>`;
  }
  function render(data, ui, t, locale, now = Date.now()) {
    // Settings, Hangout requests, Blocked People, People & options and Add people (hangouts-prefs.js).
    if (ui.hgPage && window.HangoutsPrefs) return HangoutsPrefs.render(data, ui, t);
    if (ui.sub === 'thread') return conversation(data, ui, t, locale, now);
    if (ui.sub === 'new') return picker(data, ui, t);
    return list(data, ui, t, locale, now);
  }
  // Overflow of the conversation list (GSMArena), of a conversation, and the camera button's attach menu.
  // Hangouts 1.0.2's conversation_list_activity_menu.xml (no mood setting yet) and conversation_activity_menu.xml.
  const MENU = [['hgp-open:invites', 'Invites'], ['hg-dnd', 'Snooze notifications'], ['hg-archived', 'Archived Hangouts'], ['hgp-open:settings', 'Settings'], ['hg-unsupported', 'Send feedback'], ['hg-unsupported', 'Help']];
  // SendPhotoMethodSelectorAdapter.getData: Take photo, Google+ photos, Other photos.
  const ATTACH = [['hg-unsupported', 'Take photo', 'camera'], ['hg-unsupported', 'Google+ photos', 'albums'], ['hg-attach-photo', 'Other photos', 'gallery']];
  function overlay(data, ui, t) {
    const option = (action, label, id = label) => { const [act, arg] = action.split(':'); return `<button data-action="${act}" data-id="${e(arg ?? id)}">${e(H(t, label))}</button>`; };
    if (ui.overlay === 'mms-menu') {
      const thread = {key: ui.thread, last: [...data.messages].reverse().find(m => String(m.contact) === String(ui.thread))};
      const items = ui.sub === 'thread' ? [option('hgp-open:options', 'People & options'), option('hgp-open:add', 'Add people'), isArchived(data, thread) ? option('hg-unarchive', 'Unarchive') : option('hg-archive', 'Archive'), option('mms-delete-thread', 'Delete')] : ui.sub === 'new' ? [option('hgp-open:settings', 'Settings'), option('hg-unsupported', 'Help')] : MENU.map(([action, label]) => option(action, label));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="hg-menu" role="menu">${items.join('')}</div>`;
    }
    if (ui.overlay === 'mms-hg-dnd') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hg-dnd" role="dialog" aria-label="${e(H(t, 'Snooze notifications for…'))}"><h3>${e(H(t, 'Snooze notifications for…'))}</h3><div class="hg-dnd-list">${SNOOZE_MINUTES.map(m => `<button data-action="hg-dnd-set" data-id="${m}">${e(hours(t, m))}</button>`).join('')}</div></div>`;
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="hg-attach" role="menu">${ATTACH.map(([action, label, icon]) => `<button data-action="${action}" data-id="${e(label)}">${svg[icon]}${e(H(t, label))}</button>`).join('')}</div>`;
    return null;
  }
  window.Hangouts = {render, overlay, isArchived, SNOOZE_MINUTES, H};
})();
