/* Hangouts 2.0.303 (the KTU84P image's Hangouts.apk) as the SMS app of the stock Nexus 5 (Android 4.4 Quick Start Guide,
   "Hangouts & SMS"); its menus follow conversation_list_activity_menu, its art is the APK's. A light Holo action bar with the green Hangouts icon, the
   conversation list with square avatars and an SMS tag, the New Hangout picker ("Type a name, email, number, or
   circle") and conversations of white cards on #e5e5e5 with the location and camera buttons beside the editor.
   The SMS data, drafts and message options are shared with the AOSP Mms presentation in messaging.js. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const AVATAR = 'assets/hg-default_avatar.png';
  // Hangouts.apk's own texts (stock-strings.js, group hangouts), then the image's.
  const H = (t, key) => { const row = window.StockStrings?.hangouts?.[key]; return row ? AndroidStrings.pick(row, String(globalThis.document?.documentElement?.lang || '').slice(0, 2), key) : t(key); };
  // A conversation stays archived until something newer than the archiving arrives in it (conversation_archived).
  const archivedAt = (data, key) => data.hgArchived?.[key];
  const isArchived = (data, thread) => { const at = archivedAt(data, thread.key); return !!at && !(thread.last?.timestamp > at); };
  // EsApplication's snooze list: 60, 120, 240, 480, 1440 and 4320 minutes as plurals/dnd_hours.
  const SNOOZE_MINUTES = [60, 120, 240, 480, 1440, 4320];
  const hours = (t, minutes) => minutes === 60 ? H(t, '1 hour') : AndroidStrings.format(H(t, '%d hours'), minutes / 60);
  // The demo place ShareLocationActivity drops its pin on.
  const PLACE = {address: '1600 Amphitheatre Pkwy, Mountain View, CA', lat: 37.4220, lng: -122.0841};
  const locationBody = t => `${H(t, 'Location')}: ${PLACE.address}\nhttp://maps.google.com/maps?q=${PLACE.lat},${PLACE.lng}`;
  // Hangouts 2.0.303's own xxhdpi art (32 dp icons): add, handset, location, camera, video, gallery, Google+ gallery, send.
  const ICONS = {add: 'ic_add_gray', call: 'ic_handset_dk', pin: 'ic_location_light_normal', camera: 'ic_camera_dark', video: 'ic_hangout_dark',
    photo: 'ic_gallery_dark', albums: 'ic_plus_gallery_dark', send: 'ic_send_dark_normal'};
  const svg = Object.fromEntries(Object.entries(ICONS).map(([key, file]) => [key, `<img class="hg-icon" src="assets/hg-${file}.png" alt="">`]));
  const button = (action, label, icon, extra = '') => `<button type="button" class="hg-ab-btn" data-action="${action}" aria-label="${e(label)}" ${extra}>${svg[icon] || `<img src="assets/${icon}" alt="">`}</button>`;
  function stamp(message, t, locale, now, list) {
    if (!message) return '';
    if (!message.timestamp) return t(message.time || '');
    const date = new Date(message.timestamp);
    if (list && now - date < 60000) return t('Just now');
    if (list && date.toDateString() === new Date(now).toDateString()) return date.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'});
    return list ? date.toLocaleDateString(locale, {month: 'short', day: 'numeric'}) : date.toLocaleString(locale, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'});
  }
  function bar({up, title, subtitle, spinner, actions}) {
    return `<header class="hg-bar"><button type="button" class="hg-up" data-action="${up ? 'back' : 'home'}" aria-label="${up ? 'Back' : 'Home'}">${up ? '<span aria-hidden="true">‹</span>' : ''}<img src="assets/hangouts.png" alt=""></button><div class="hg-title${spinner ? ' hg-spinner' : ''}"><h2>${e(title)}</h2>${subtitle ? `<small>${e(subtitle)}</small>` : ''}</div>${actions}</header>`;
  }
  function list(data, ui, t, locale, now) {
    const archived = ui.sub === 'archived';
    const rows = ICSMessaging.threads(data).filter(thread => isArchived(data, thread) === archived).map(thread => {
      const draft = thread.draft?.body || thread.draft?.attachment;
      const last = thread.last;
      const snippet = draft ? `<b>${e(t('Draft'))}:</b> ${e(thread.draft.body || t('Picture'))}` : last ? `${last.mine ? e(t('You:')) + ' ' : ''}${e(last.body || t('Picture'))}` : '';
      const unread = thread.messages.some(m => m.read === false), person = window.HangoutsPrefs ? HangoutsPrefs.who(data, thread.key) : thread.person;
      return `<button class="hg-thread${unread ? ' unread' : ''}" data-action="thread" data-id="${e(thread.key)}"><span class="hg-avatar"><img src="${AVATAR}" alt=""><img class="hg-sms-badge" src="assets/hg-ic_sms_status_badge.png" alt="SMS"></span><span class="hg-thread-copy"><span class="hg-thread-top"><strong>${e(person.name)}</strong><time>${e(stamp(last, t, locale, now, true))}</time></span><span class="hg-snippet">${snippet}</span></span></button>`;
    }).join('');
    if (archived) return `<div class="app-view mms-app hg-app">${bar({up: true, title: H(t, 'Archived Hangouts'), actions: ''})}<div class="mms-scroll hg-threads">${rows || `<p class="hg-empty">${e(H(t, 'No archived Hangouts'))}</p>`}</div></div>`;
    const pending = data.messageDrafts?.new?.body || data.messageDrafts?.new?.attachment;
    const snoozed = data.hgSnooze > now ? `<div class="hg-dnd-bar"><span><b>${e(H(t, 'Notifications snoozed'))}</b><small>${e(AndroidStrings.format(H(t, 'Will resume at %s'), new Date(data.hgSnooze).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'})))}</small></span><i></i><button data-action="hg-dnd-cancel">${e(H(t, 'Resume'))}</button></div>` : '';
    return `<div class="app-view mms-app hg-app">${bar({title: t('Hangouts'), actions: button('new-message', t('New Hangout'), 'add') + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}${snoozed}<div class="mms-scroll hg-threads">${pending ? `<button class="hg-pending" data-action="new-message">${e(t('Draft'))}: ${e(data.messageDrafts.new.body || t('Picture'))}</button>` : ''}${rows || `<p class="hg-empty">${e(t('No conversations'))}</p>`}</div></div>`;
  }
  function picker(data, ui, t) {
    const draft = data.messageDrafts?.new || {};
    const people = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: t('New Hangout'), actions: button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png')})}<form class="hg-new" data-form="hg-new"><input name="recipient" autocomplete="off" maxlength="60" aria-label="${e(t('Type a name, email, number, or circle'))}" placeholder="${e(t('Type a name, email, number, or circle'))}" value="${e(draft.recipient || '')}"></form><div class="mms-scroll hg-people">${people.map(p => `<button class="hg-person" data-action="hg-pick" data-id="${e(p.id)}" data-search="${e(`${p.name} ${p.phone}`.toLocaleLowerCase())}"><img src="${AVATAR}" alt=""><span><strong>${e(p.name)}</strong><small>${e(p.phone)} ${e(t('Mobile'))}</small></span></button>`).join('')}</div></div>`;
  }
  function conversation(data, ui, t, locale, now) {
    const person = window.HangoutsPrefs ? HangoutsPrefs.who(data, ui.thread) : ICSMessaging.identity(ui.thread, data.contacts), draft = data.messageDrafts?.[ICSMessaging.draftKey(ui)] || {};
    const messages = data.messages.filter(m => String(m.contact) === String(ui.thread));
    // The Call action needs one SMS person (ConversationFragment.pK).
    const actions = (person.group ? '' : button('mms-call', t('Call'), 'call')) + button('mms-menu', t('More options'), 'ic_menu_moreoverflow_normal_holo_light.png');
    const cards = messages.map(message => `<button type="button" class="mms-message hg-message ${message.mine ? 'sent' : 'received'}" data-action="mms-message" data-id="${message.id}"><img class="hg-avatar-small" src="${AVATAR}" alt=""><span class="hg-card"><span class="hg-body">${e(message.body)}</span>${message.attachment ? ICSMessaging.photo(message.attachment) : ''}<time>${e(stamp(message, t, locale, now, false))}</time></span></button>`).join('');
    const canSend = (draft.body || '').trim() || draft.attachment;
    return `<div class="app-view mms-app hg-app">${bar({up: true, title: person.name, subtitle: t('SMS'), spinner: true, actions})}<form class="mms-compose hg-compose" data-form="mms-send"><div class="mms-scroll mms-history hg-history">${cards}</div>${draft.attachment ? `<div class="mms-attachment">${ICSMessaging.photo(draft.attachment)}<button type="button" data-action="mms-remove-attachment" aria-label="Remove attachment">×</button></div>` : ''}<div class="mms-compose-bar hg-editor"><textarea name="body" rows="1" maxlength="2000" aria-label="${e(t('Send an SMS message'))}" placeholder="${e(t('Send an SMS message'))}">${e(draft.body || '')}</textarea><small class="mms-counter" hidden></small><button type="button" class="hg-tool" data-action="hg-location" aria-label="${e(t('Share location'))}">${svg.pin}</button><button type="button" class="hg-tool" data-action="mms-attach" aria-label="${e(t('Attach'))}">${svg.camera}</button><button class="mms-send hg-send" type="submit" aria-label="${e(t('Send'))}" ${canSend ? '' : 'disabled'}>${svg.send}</button></div></form></div>`;
  }
  // ShareLocationActivity (share_location_activity.xml): the map with ic_map_pin in the middle and the SHARE action
  // (share_location_menu_item, ic_send_dark with its text) in the action bar.
  function shareLocation(data, ui, t) {
    const map = '<div class="hg-map" aria-hidden="true"></div>';
    return `<div class="app-view mms-app hg-app hg-share-location">${bar({up: true, title: H(t, 'Share location'), actions: `<button type="button" class="hg-ab-text" data-action="hg-share-location"><img src="assets/hg-ic_send_dark_normal.png" alt="">${e(H(t, 'SHARE'))}</button>`})}<div class="hg-map-wrap">${map}<img class="hg-pin" src="assets/hg-ic_map_pin.png" alt="${e(H(t, 'Location'))}"></div></div>`;
  }
  function render(data, ui, t, locale, now = Date.now()) {
    // Settings, Invites, Blocked People, People & options and New group MMS (hangouts-prefs.js).
    if (ui.hgPage && window.HangoutsPrefs) return HangoutsPrefs.render(data, ui, t);
    if (ui.sub === 'thread' && ui.hgLocation) return shareLocation(data, ui, t);
    if (ui.sub === 'thread') return conversation(data, ui, t, locale, now);
    if (ui.sub === 'new') return picker(data, ui, t);
    return list(data, ui, t, locale, now);
  }
  // Overflow of the conversation list (conversation_list_activity_menu.xml of the KTU84P Hangouts; BabelHomeActivity
  // .onPrepareOptionsMenu only adds the invite count to Invites and hides Debug), of a conversation, and the camera
  // button's attach menu.
  const MENU = [['hg-unsupported', 'Set mood…'], ['hgp-open:invites', 'Invites'], ['hg-dnd', 'Snooze notifications'], ['hg-archived', 'Archived Hangouts'], ['hgp-open:settings', 'Settings'], ['hg-unsupported', 'Send feedback'], ['hg-unsupported', 'Help']];
  const ATTACH = [['hg-unsupported', 'Take photo', 'camera'], ['hg-unsupported', 'Take video', 'video'], ['hg-attach-photo', 'Attach photo', 'photo'], ['hg-unsupported', 'Google+ albums', 'albums']];
  function overlay(data, ui, t) {
    const option = (action, label, id = label) => { const [act, arg] = action.split(':'); return `<button data-action="${act}" data-id="${e(arg ?? id)}">${e(H(t, label))}</button>`; };
    if (ui.overlay === 'mms-menu') {
      const thread = {key: ui.thread, last: [...data.messages].reverse().find(m => String(m.contact) === String(ui.thread))};
      // ConversationFragment.onPrepareOptionsMenu: an SMS person's Add people is "New group MMS"; a group has none, and
      // Delete is for one person only (a group deletes from People & options).
      const group = window.HangoutsPrefs?.isGroup(ui.thread);
      const items = ui.sub === 'thread' ? [option('hgp-open:options', 'People & options'), group ? '' : `<button data-action="hgp-open" data-id="add">${e(HangoutsPrefs.S('New group MMS'))}</button>`, isArchived(data, thread) ? option('hg-unarchive', 'Unarchive') : option('hg-archive', 'Archive'), group ? '' : option('mms-delete-thread', 'Delete')] : ui.sub === 'new' ? [option('hgp-open:settings', 'Settings'), option('hg-unsupported', 'Help')] : MENU.map(([action, label]) => option(action, label));
      return `<div class="menu-scrim" data-action="close-overlay"></div><div class="hg-menu" role="menu">${items.join('')}</div>`;
    }
    if (ui.overlay === 'mms-hg-dnd') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog hg-dnd" role="dialog" aria-label="${e(H(t, 'Snooze notifications for…'))}"><h3>${e(H(t, 'Snooze notifications for…'))}</h3><div class="hg-dnd-list">${SNOOZE_MINUTES.map(m => `<button data-action="hg-dnd-set" data-id="${m}">${e(hours(t, m))}</button>`).join('')}</div></div>`;
    if (ui.overlay === 'mms-attach') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="hg-attach" role="menu">${ATTACH.map(([action, label, icon]) => `<button data-action="${action}" data-id="${e(label)}">${svg[icon]}${e(t(label))}</button>`).join('')}</div>`;
    return null;
  }
  window.Hangouts = {render, overlay, isArchived, locationBody, SNOOZE_MINUTES, H};
})();
