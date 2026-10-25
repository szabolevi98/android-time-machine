/* Hangouts 2.5 on the Nexus 6: its own chats (channel 'hangouts' in data.messages; SMS belongs to Messenger). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const AVATAR = 'assets/people-ic_contact_picture_holo_light.png';
  // Hangouts.apk's own texts (stock-strings.js, group hangouts), then the image's.
  const H = (t, key) => { const row = window.StockStrings?.hangouts?.[key]; return row ? AndroidStrings.pick(row, String(globalThis.document?.documentElement?.lang || '').slice(0, 2), key) : t(key); };
  // A conversation stays archived until something newer than the archiving arrives in it (conversation_archived).
  const isArchived = (data, thread) => { const at = data.hgArchived?.[thread.key]; return !!at && !(thread.last?.timestamp > at); };
  // EsApplication.y(): 1, 2, 4, 8, 24 and 72 hours (plurals/dnd_hours).
  const SNOOZE_MINUTES = [60, 120, 240, 480, 1440, 4320];
  const hours = (t, minutes) => minutes === 60 ? H(t, '1 hour') : AndroidStrings.format(H(t, '%d hours'), minutes / 60);
  // The demo place "Share your location" sends.
  const PLACE = {address: '1600 Amphitheatre Pkwy, Mountain View, CA', lat: 37.4220, lng: -122.0841};
  const locationBody = t => `${H(t, 'Location')}: ${PLACE.address}\nhttp://maps.google.com/maps?q=${PLACE.lat},${PLACE.lng}`;
  const svg = {
    add: '<svg viewBox="0 0 24 24"><path d="M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7z" fill="currentColor"/></svg>',
    call: '<svg viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" fill="currentColor"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>',
    camera: '<svg viewBox="0 0 24 24"><path d="M9 3 7.2 5H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-3.2L15 3zm3 15a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/></svg>',
    video: '<svg viewBox="0 0 24 24"><path d="M3 6h12a1 1 0 0 1 1 1v3.5l5-3.5v10l-5-3.5V17a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z" fill="currentColor"/></svg>',
    photo: '<svg viewBox="0 0 24 24"><path d="M3 4h18v16H3zm2 2v12h14V6zm1 10 3.5-4.5 2.5 3 3.5-4.5L19 16z" fill="currentColor"/></svg>',
    albums: '<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3zm6.2 12.6a3.6 3.6 0 0 0 3.5-3.9H9.2v1.4h2a2 2 0 0 1-2 1.3 2.2 2.2 0 0 1 0-4.4c.6 0 1.1.2 1.5.6l1-1a3.6 3.6 0 1 0-2.5 6zm6.8-5.1V9h-1.2v1.5h-1.5v1.2h1.5v1.5H16v-1.5h1.5v-1.2z" fill="currentColor"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M3 20.5 22 12 3 3.5v6.6L16 12 3 13.9z" fill="currentColor"/></svg>'
  };
  const button = (action, label, icon, extra = '') => `<button type="button" class="hg-ab-btn" data-action="${action}" aria-label="${e(label)}" ${extra}>${svg[icon] || `<img src="assets/${icon}" alt="">`}</button>`;
  function stamp(message, t, locale, now, list) {
    if (!message) return '';
    if (!message.timestamp) return t(message.time || '');
    const date = new Date(message.timestamp);
    if (list && now - date < 60000) return t('Just now');
    if (list && date.toDateString() === new Date(now).toDateString()) return date.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    return list ? date.toLocaleDateString(locale, {month: 'short', day: 'numeric'}) : date.toLocaleString(locale, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  }
  /* Hangouts 2.5 (com.google.android.talk on LMY48Y): the Material #0F9D58 toolbar (status bar #0B8043), conversation
     rows with the round avatar, the 18 sp name, the snippet and time, a 1 dp divider and the video-call button at the
     end; the toolbar's drawer toggle opens NavigationDrawerFragment and home_activity_menu.xml's ic_add_24dp starts a
     "New Hangout" ("Type a name, email, number, or circle"); Hangouts 2.5 has no list overflow and no FAB. A conversation lays the chat
     on #EEEEEE: incoming msg_bubble_left (white, the fold at the top left) beside the avatar, outgoing
     msg_bubble_hangout_right (#DEF3D8, the fold at the bottom right), 16 sp #333 text and #66000000 times; the
     editor row holds the emoji button, "Send Hangouts message" and the send arrow. */
  // The home toolbar: the drawer toggle (BabelHomeActivity's DrawerLayout), the title and home_activity_menu.xml's
  // ic_add_24dp; the rest of the old overflow lives in NavigationDrawerFragment.
  function bar({up, title, actions, drawer}) {
    return `<header class="hgl-bar">${drawer ? `<button type="button" class="hgl-btn hgl-white" data-action="hg-drawer" aria-label="${e(drawer)}"><img src="assets/hg-quantum_ic_menu_black_24.png" alt=""></button>` : ''}${up ? `<button type="button" class="hgl-btn" data-action="back" aria-label="${e('Navigate up')}"><img src="assets/bg-ic_arrow_back_light.png" alt=""></button>` : ''}<h2>${e(title)}</h2>${actions}</header>`;
  }
  const tool = (action, label, file, cls = '') => `<button type="button" class="hgl-btn ${cls}" data-action="${action}" aria-label="${e(label)}"><img src="assets/${file}" alt=""></button>`;
  const avatar = (person, cls) => window.LPDialer ? LPDialer.letterTile(person, cls) : `<img class="${cls}" src="assets/hg-default_avatar.png" alt="">`;
  function list(data, ui, t, locale, now) {
    const archived = ui.sub === 'archived';
    const rows = ICSMessaging.threads(data, '', 'hangouts').filter(thread => isArchived(data, thread) === archived).map(thread => {
      const draft = thread.draft?.body || thread.draft?.attachment;
      const last = thread.last;
      const snippet = draft ? `<b>${e(t('Draft'))}</b> ${e(thread.draft.body || t('Picture'))}` : last ? `${last.mine ? e(t('You:')) + ' ' : ''}${e(last.body || t('Picture'))}` : '';
      const unread = thread.messages.some(m => m.read === false), person = window.HangoutsPrefs ? HangoutsPrefs.who(data, thread.key) : thread.person;
      return `<div class="hgl-row${unread ? ' unread' : ''}"><button class="hgl-thread" data-action="thread" data-id="${e(thread.key)}">${avatar(person, 'hgl-avatar')}<span class="hgl-copy"><strong>${e(person.name)}</strong><span class="hgl-snippet">${snippet}</span><time>${e(stamp(last, t, locale, now, true))}</time></span></button><i class="hgl-divider"></i><button class="hgl-video" data-action="hg-unsupported" data-id="${e(t('Video call'))}" aria-label="${e(t('Video call'))}"><img src="assets/hg-ic_hangout_video_24dp.png" alt=""></button></div>`;
    }).join('');
    if (archived) return `<div class="app-view mms-app hgl-app">${bar({up: true, title: H(t, 'Archived conversations'), actions: ''})}<div class="mms-scroll hgl-list">${rows || `<p class="hgl-empty">${e(H(t, 'No archived conversations'))}</p>`}</div></div>`;
    // dnd_list_item.xml on notification_off_background (#d8453c).
    const snoozed = data.hgSnooze > now ? `<div class="hg-dnd-bar"><span><b>${e(H(t, 'Notifications snoozed'))}</b><small>${e(AndroidStrings.format(H(t, 'Will resume at %s'), new Date(data.hgSnooze).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'})))}</small></span><i></i><button data-action="hg-dnd-cancel">${e(H(t, 'Resume'))}</button></div>` : '';
    return `<div class="app-view mms-app hgl-app">${bar({title: t('Hangouts'), drawer: H(t, 'Open navigation drawer'), actions: tool('new-message', H(t, 'New Hangout'), 'hg-ic_add_24dp.png', 'hgl-white')})}${snoozed}<div class="mms-scroll hgl-list">${rows || `<p class="hgl-empty">${e(t('Send a message or'))}<br>${e(t('start a video call'))}</p>`}</div></div>`;
  }
  function picker(data, ui, t) {
    const draft = data.messageDrafts?.['hg:new'] || {};
    const people = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="app-view mms-app hgl-app">${bar({up: true, title: t('New message'), actions: ''})}<form class="hg-new hgl-new" data-form="hg-new"><input name="recipient" autocomplete="off" maxlength="60" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}" value="${e(draft.recipient || '')}"></form><div class="mms-scroll hgl-people">${people.map(p => `<button class="hg-person hgl-person" data-action="hg-pick" data-id="${e(p.id)}" data-search="${e(`${p.name} ${p.phone}`.toLocaleLowerCase())}">${avatar(p, 'hgl-avatar')}<span><strong>${e(p.name)}</strong><small>${e(p.email || p.phone)}</small></span></button>`).join('')}</div></div>`;
  }
  function conversation(data, ui, t, locale, now) {
    const person = window.HangoutsPrefs ? HangoutsPrefs.who(data, ui.thread) : ICSMessaging.identity(ui.thread, data.contacts), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
    const messages = data.messages.filter(m => String(m.contact) === String(ui.thread) && ICSMessaging.channelOf(m) === 'hangouts');
    const actions = tool('hg-unsupported', t('Video call'), 'hg-ic_hangout_video_24dp.png', 'hgl-white') + tool('mms-menu', t('More options'), 'gd-ic_overflow_menu.png', 'hgl-white');
    let previous = null;
    const cards = messages.map(message => { const same = previous && previous.mine === message.mine; previous = message; return `<button type="button" class="mms-message hgl-message ${message.mine ? 'sent' : 'received'}${same ? ' same' : ''}" data-action="mms-message" data-id="${message.id}">${message.mine ? '' : `<span class="hgl-msg-avatar">${same ? '' : avatar(person, 'hgl-avatar-small')}</span>`}<span class="hgl-bubble"><span class="hgl-body">${e(message.body)}</span>${message.attachment ? ICSMessaging.photo(message.attachment) : ''}<time>${e(stamp(message, t, locale, now, false))}</time></span></button>`; }).join('');
    const canSend = (draft.body || '').trim() || draft.attachment;
    return `<div class="app-view mms-app hgl-app hgl-conversation">${bar({up: true, title: person.name, actions})}<form class="mms-compose hgl-compose" data-form="mms-send"><div class="mms-scroll mms-history hgl-history">${cards}</div>${draft.attachment ? `<div class="mms-attachment lpm-attachment">${ICSMessaging.photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="${e(t('Remove'))}">×</button></div>` : ''}<div class="mms-compose-bar hgl-editor"><button type="button" class="hgl-btn hgl-emoji" data-action="mms-smiley" aria-label="${e(t('Emoji'))}"><img src="assets/hg-ic_emoji_dark.png" alt=""></button><textarea name="body" rows="1" maxlength="2000" aria-label="${e(t('Send Hangouts message'))}" placeholder="${e(t('Send Hangouts message'))}">${e(draft.body || '')}</textarea><small class="mms-counter" hidden></small><button type="button" class="hgl-btn hgl-attach" data-action="mms-attach" aria-label="${e(H(t, 'Add attachment'))}"><img src="assets/hg-lp-quantum_ic_attachment_grey600_24.png" alt=""></button><button class="mms-send hgl-send" type="submit" aria-label="${e(t('Send'))}" ${canSend ? '' : 'disabled'}>${svg.send}</button></div></form></div>`;
  }
  function render(data, ui, t, locale, now = Date.now()) {
    // Settings, Invites, Blocked people, People & options and Add people (hangouts-prefs.js).
    if (ui.hgPage && window.HangoutsPrefs) return HangoutsPrefs.render(data, ui, t);
    if (ui.sub === 'thread') return conversation(data, ui, t, locale, now);
    if (ui.sub === 'new') return picker(data, ui, t);
    return list(data, ui, t, locale, now);
  }
  // NavigationDrawerFragment items (above), the overflow of a conversation, and the camera button's attach menu.
  // NavigationDrawerFragment.onAttachBinder's items sorted by their index (Invites 1, Archived 2, Blocked people 3 | Snooze
  // notifications 5, Settings 6, Help & feedback 7; the second group under a divider), with their 24 dp icons, 50 dp rows
  // (20 dp in, the 16 sp #4c4c4c label 44 dp after the icon) under AccountSwitcherView's 147 dp selected account.
  const DRAWER = [['hgp-open:invites', 'Invites', 'ic_drafts_24dp', 0], ['hg-archived', 'Archived', 'ic_archive_24dp', 0], ['hgp-open:blocked', 'Blocked people', 'ic_report_24dp', 0], ['hg-dnd', 'Snooze notifications', 'ic_notifications_off_24dp', 1], ['hgp-open:settings', 'Settings', 'ic_settings_24dp', 1], ['hg-unsupported', 'Help & feedback', 'ic_help_24dp', 1]];
  const MENU = DRAWER.map(([action, label]) => [action, label]);
  // The attachment button's choices: menu_choose_photo_from_gallery and realtimechat_location.
  const ATTACH = [['hg-attach-photo', 'Attach photo'], ['hg-share-location', 'Share your location']];
  function overlay(data, ui, t) {
    const option = (action, label, id = label) => { const [act, arg] = action.split(':'); return `<button data-action="${act}" data-id="${e(arg ?? id)}">${e(H(t, label))}</button>`; };
    if (ui.overlay === 'mms-hg-drawer') {
      const account = 'nexus6.demo@gmail.com';
      const rows = DRAWER.map(([action, label, icon, group], i) => `${i && group !== DRAWER[i - 1][3] ? '<hr>' : ''}<button type="button" data-action="${action.split(':')[0]}" data-id="${e(action.split(':')[1] ?? label)}"><img src="assets/hg-${icon}.png" alt=""><span>${e(H(t, label))}</span></button>`).join('');
      return `<div class="hgl-drawer-scrim" data-action="close-overlay"></div><nav class="hgl-drawer" aria-label="Hangouts"><div class="hgl-account"><span class="hgl-account-avatar">${e(account.charAt(0).toUpperCase())}</span><b>${e(account.split('@')[0])}</b><small>${e(account)}</small></div>${rows}</nav>`;
    }
    if (ui.overlay === 'mms-menu') {
      const thread = {key: ui.thread, last: [...data.messages].reverse().find(m => String(m.contact) === String(ui.thread) && ICSMessaging.channelOf(m) === 'hangouts')};
      const items = ui.sub === 'thread' ? [option('hgp-open:options', 'People & options'), option('hgp-open:add', 'Add people'), isArchived(data, thread) ? option('hg-unarchive', 'Unarchive') : option('hg-archive', 'Archive'), option('mms-delete-thread', 'Delete')] : ui.sub === 'new' ? [option('hgp-open:settings', 'Settings'), option('hg-unsupported', 'Help')] : MENU.map(([action, label]) => option(action, label));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu" role="menu">${items.join('')}</div>`;
    }
    if (ui.overlay === 'mms-hg-dnd') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hg-dnd" role="dialog" aria-label="${e(H(t, 'Snooze notifications for…'))}"><h3>${e(H(t, 'Snooze notifications for…'))}</h3><div class="hg-dnd-list">${SNOOZE_MINUTES.map(m => `<button data-action="hg-dnd-set" data-id="${m}">${e(hours(t, m))}</button>`).join('')}</div></div>`;
    if (ui.overlay === 'mms-attach') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="lp-popup-menu hg-attach-menu" role="menu">${ATTACH.map(([action, label]) => option(action, label)).join('')}</div>`;
    return null;
  }
  window.Hangouts = {render, overlay, isArchived, locationBody, SNOOZE_MINUTES, H};
})();
