/* Android 7.1.2 Messenger (Messenger 2.0.906, app/PrebuiltBugle of N2G48C), the app 'messenger'. The logic is 6.0.1's
   (its messenger module); the look and the behaviour below are the image's (layouts, styles and the decompiled
   ConversationMessageView, ComposeMessageView, ConversationListItemView, MediaPicker in _aosp/ngbg):
   - ConversationListActivity (BugleTheme: primary_color #2a56c6, google_blue_900 #1c3aa9 under the status bar, the list
     on white): BugleActionBar.BigTitle (56 dp, "Messenger" 20 sp sans-serif-medium), Search messages and the overflow
     (conversation_list_fragment_menu.xml: Archived, Blocked contacts, Settings, Help & feedback);
     conversation_list_item_view.xml rows (80 dp at least, 12 / 16 dp padding, the 40 dp ContactIconView, 16 dp, the
     16 sp name and the 14 sp snippet in google_blue_grey_900 #263238, bold while unread, "You: " before your own
     message, the 14 sp #546e7a timestamp, the muted bell 4 dp before the name); the 56 dp FAB (fab_new_message_bg: an
     oval in primary_color, ic_add_white) 16 dp from the end and the bottom. A row swiped sideways is archived
     (conversation_list_cross_swipe_background: swipe_shadow with ic_archive_small_dark on the side it leaves), with
     Bugle's own snack bar (snack_bar.xml: #323232, 14 sp white, 18 / 24 dp, the #eeff41 UNDO). A long press selects
     rows: the contextual bar (white, ic_arrow_back_dark) with Archive / Unarchive, Delete, Turn off / on notifications,
     Add contact and Block (conversation_list_fragment_select_menu.xml), the row's icon turning into
     ic_checkmark_circle_blue.
   - Times (the app's date helper, util.n): under a minute "Just now" in the list and "Now" in a conversation, then
     num_minutes_ago ("5 mins"), the time of day, within a week the weekday, within a year the date, else M/d/yy.
   - ConversationActivity (conversation_fragment.xml on google_blue_grey_50 #eceff1): the action bar and the status bar
     take the participant's colour (letter_tile_colors / letter_tile_colors_dark, bugle_message_individual_color),
     "Make a call" and the overflow (conversation_menu.xml: Add contact for an unknown number, People & options, Search,
     Archive / Unarchive, Delete, Help & feedback). ConversationMessageView (8 dp sides, 16 dp before a new author, 2 dp
     within a cluster: the same sender within 60 s): the message_separator (12 sp #546e7a, centred, 16 dp under it)
     when an hour has passed (posted_yesterday / posted_this_week / posted_this_year / posted_over_a_year with " • ");
     the bubble a GradientDrawable (18 dp corners, 4 dp on the side a cluster continues; message_text_left_right_padding
     12 dp, 8 dp above and below, 40 dp high at least): incoming in the participant's colour with white 16 sp text and
     the 40 dp ContactIconView beside the last of a cluster, outgoing white with #263238 text; the 30 dp
     message_metadata line under it (12 sp #546e7a: the time, " • SMS" for your own, "Sending" with sending_dots) on
     the last message, on one still sending, and on a message tapped. A long press selects a message (in primary_color):
     Share, Forward, Copy text, View details, Delete (conversation_fragment_select_menu.xml). Search shows the
     search_details_container (#333333, 12 sp white "%1$d/%2$d results found", the previous / next arrows).
   - compose_message_view.xml: the 1 dp google_blue_grey_200 border, ic_add_attachment_grey (48 dp, 16 / 16 / 16 / 8 dp
     padding), the 16 sp #37474f field "Type an SMS message" (#546e7a hint, 8 dp padding, 48 dp high at least), the send
     button: ic_send_grey tinted the conversation's colour, google_blue_grey_400 while there is nothing to send, over the
     11 sp bold #90a4ae "SMS" (MMS with an attachment). No emoji button: bugle_prefer_system_emoji_ime keeps it gone with
     the image's Gboard. The attachments wait in the 100 dp attachments_container (24 dp in).
   - The media picker (mediapicker_fragment.xml, 215 dp): the 48 dp tab strip in the conversation's colour with the
     choosers in MediaPicker's order: stickers, camera, gallery, audio, location (the selected tab at full alpha, the
     others at 0.5). Stickers: the local Foodies set (res/xml/local_foodies.xml) in sticker_grid_view.xml's 82 dp cells
     (6 dp apart on white, #eeeeee behind each); camera: the black preview with the capture button; gallery: the
     110 dp cells of the simulator's own photos (ng-media.js); audio: "Touch & hold" (16 sp #40000000) over the 70 dp
     white mic in its 1 dp #30000000 ring; location: not built yet (it needs Maps).
   - The contact picker (contact_picker_fragment.xml): the bar "New message", the "To" row on #fafafa (the 72 dp label
     16 sp #546e7a, the 14 sp field "Type a name, phone number, or email", ic_numeric_dialpad) over a 4 dp shadow, then
     top_contacts_view.xml (16 sp #546e7a header, four columns of 56 dp icons with 13 sp names) and the contacts
     (contact_item_header.xml's 18 sp #546e7a letter, contact_item_view_row.xml: 10 / 16 dp, 40 dp icon, the 16 sp
     #37474f name, the 14 sp #546e7a number and type); a typed number offers "Send to".
   - People & options (people_options_item_view.xml, 56 dp rows, 16 sp #212121 / 14 sp #6d6d6d): Notifications,
     Notification sound, Vibrate, Block; then "People in this conversation" (16 sp #546e7a after a 1 dp #1f000000
     divider) and the participant (person_item_view.xml). On Nougat Messenger blocks through the system's blocked
     numbers (block_confirmation_message_system), the list Phone and Contacts keep (data.blockedNumbers).
   - Archived (BugleTheme.ArchivedConversationListActivity: #9d9d9d, #838383) and Blocked contacts
     (blocked_participant_list_item_view.xml: 16 dp padding, the 40 dp icon, the name, UNBLOCK in primary_color).
   - ContactIconView: the contact's letter tile (ng-people.js) with Bugle's letter_tile_font_color #8affffff, or
     ic_person_light on the participant's colour for a number without a contact.
   - The message notification (ng-notify.js): the sender's icon as the large icon, Reply (a RemoteInput: the answer
     goes out and the notification is cancelled) and Call. */
(() => {
  'use strict';
  const T = () => NG.text('messenger'), P = () => NG.people;
  const A = n => `assets/bg-${n}.png`;
  const DARK = ['#c53929', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#3367d6', '#0277bd', '#006064', '#00796b', '#0b8043', '#33691e', '#e65100', '#e64a19', '#424242'];
  const PRIMARY = '#2a56c6', M = 60000, H = 3600000;
  // The local sticker set of res/xml/local_foodies.xml, in its order (staticIcon drawables, nodpi).
  const STICKERS = ['angry', 'bye', 'confused', 'congratulations', 'eating', 'encouragement', 'happy', 'hate', 'laugh', 'love', 'ok', 'playful', 'sad', 'shy', 'sleepy', 'sorry', 'surprised', 'thankful', 'vulgar', 'working'];
  NG.defaults.sms = [
    {id: 1, number: '202-555-0148', read: true, messages: [{id: 1, mine: false, text: 'Hey! Are we still on for coffee tomorrow?', time: Date.now() - 62 * M}, {id: 2, mine: true, text: 'Absolutely. See you at 11!', time: Date.now() - 59 * M}]},
    {id: 2, number: '202-555-0107', read: true, messages: [{id: 3, mine: false, text: 'Don’t forget to call this weekend ☺', time: Date.now() - 27 * H}]}
  ];
  const threads = c => c.data.sms || (c.data.sms = JSON.parse(JSON.stringify(NG.defaults.sms)));
  const ui = c => c.ui.messenger || (c.ui.messenger = {screen: '', to: '', search: null, draft: {}, attach: {}, details: {}, sel: null, msel: null, panel: '', mediaTab: 'gallery', csearch: null, mode: ''});
  const esc = (c, s) => c.safe(s);
  const thread = (c, id) => threads(c).find(x => x.id === +id);
  const threadFor = (c, number) => threads(c).find(x => P().same(x.number, number));
  const blockedList = c => c.data.blockedNumbers || (c.data.blockedNumbers = []);
  const isBlocked = (c, number) => blockedList(c).some(b => P().same(b, number));
  const colorIndex = (c, number) => { const p = P().byNumber(c, number), key = p ? (p.lookup || p.name) : P().digits(number); return Math.abs(P().javaHash(key)) % 14; };
  const colorOf = (c, number) => { const i = colorIndex(c, number); return [P().COLORS[i], DARK[i]]; };
  const nameOf = (c, number) => { const p = P().byNumber(c, number); return p ? P().displayName(c, p) : P().format(number); };
  const avatar = (c, number, cls) => { const p = P().byNumber(c, number); return p ? P().tile(c, p, `ngms-av ${cls}`) : `<span class="ngpp-tile round ngms-av ${cls}" style="background:${colorOf(c, number)[0]}" aria-hidden="true"><img src="${A('ic_person_light')}" alt=""></span>`; };
  const nextId = c => Math.max(0, ...threads(c).flatMap(y => y.messages.map(m => m.id))) + 1;
  const sorted = (c, archived) => threads(c).filter(x => !!x.archived === archived && x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);

  // ---- times -----------------------------------------------------------------------------------------------------
  const h12 = c => !(c.data.settings.time24 ?? !new Intl.DateTimeFormat(c.locale(), {hour: 'numeric'}).resolvedOptions().hour12);
  const hm = (c, date) => new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit', hour12: h12(c)}).format(date);
  function when(c, time, inList) {
    const t = T(), loc = c.locale(), now = Date.now(), d = now - time, date = new Date(time);
    if (d < M) return t.t(inList ? 'posted_just_now' : 'posted_now');
    if (d < H) { const n = Math.floor(d / M); return t.plural('num_minutes_ago', n, null, n); }
    if (new Date(now).toDateString() === date.toDateString()) return hm(c, date);
    if (d < 7 * 864e5) return new Intl.DateTimeFormat(loc, {weekday: 'short'}).format(date);
    if (d < 364 * 864e5) return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric'}).format(date);
    return new Intl.DateTimeFormat(loc, {year: '2-digit', month: 'numeric', day: 'numeric'}).format(date);
  }
  // The separator over a message an hour or more after the one before (ConversationMessageData.G).
  function separator(c, time) {
    const t = T(), loc = c.locale(), date = new Date(time), now = new Date(), sep = t.t('message_metadata_separator');
    const day = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), days = Math.round((day(now) - day(date)) / 864e5);
    const time_ = hm(c, date);
    if (days === 0) return time_;
    if (days === 1) return t.fmt('posted_yesterday', null, sep, time_);
    if (now - date < 7 * 864e5) return t.fmt('posted_this_week', null, new Intl.DateTimeFormat(loc, {weekday: 'long'}).format(date), sep, time_);
    if (now - date < 364 * 864e5) return t.fmt('posted_this_year', null, new Intl.DateTimeFormat(loc, {weekday: 'long', month: 'short', day: 'numeric'}).format(date), sep, time_);
    return t.fmt('posted_over_a_year', null, new Intl.DateTimeFormat(loc, {weekday: 'long', month: 'short', day: 'numeric', year: 'numeric'}).format(date), sep, time_);
  }
  const snippetOf = (c, m) => m.text || m.location?.name || T().t(m.photo ? (NG.photoLibrary.find(c,m.photo)?.kind==='video'?'conversation_list_snippet_video':'conversation_list_snippet_picture') : m.sticker ? 'conversation_list_snippet_picture' : m.vcard ? 'conversation_list_snippet_vcard' : m.audio ? 'conversation_list_snippet_audio_clip' : 'conversation_list_snippet_picture');

  // ---- pieces ----------------------------------------------------------------------------------------------------
  const icon = (n, cls = '') => `<img class="ngms-ic ${cls}" src="${A(n)}" alt="">`;
  const back = (c, action = 'ngms-up', dark = false) => `<button type="button" class="ngms-btn" data-action="${action}" aria-label="${esc(c, T().t('framework/action_bar_up_description'))}">${icon(dark ? 'ic_arrow_back_dark' : 'ic_arrow_back_light')}</button>`;
  const iconBtn = (c, action, ic, label, extra = '') => `<button type="button" class="ngms-btn" data-action="${action}" aria-label="${esc(c, label)}"${extra}>${icon(ic)}</button>`;
  function bar(c, title, {up = true, actions = '', color = '', big = false} = {}) {
    return `<div class="ngms-bar"${color ? ` style="background:${color}"` : ''}>${up ? back(c) : ''}<span class="ngms-title${big ? ' big' : ''}${up ? ' in' : ''}">${esc(c, title)}</span>${actions}</div>`;
  }
  // Bugle's own snack bar (snack_bar.xml), with an action.
  let snackTimer = 0;
  function snack(c, text, action, onAction) {
    c.el.viewport.querySelector('.ngms-snack')?.remove();
    const el = document.createElement('div');
    el.className = 'ngms-snack';
    el.innerHTML = `<span>${esc(c, text)}</span>${action ? `<button type="button">${esc(c, action)}</button>` : ''}`;
    el.querySelector('button')?.addEventListener('click', e => { e.stopPropagation(); el.remove(); onAction?.(c); });
    c.el.viewport.querySelector('.ngms')?.appendChild(el);
    requestAnimationFrame(() => el.classList.add('in'));
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 250); }, 5000);
  }

  // ---- conversation list -----------------------------------------------------------------------------------------
  function convRow(c, x) {
    const t = T(), u = ui(c), last = x.messages.at(-1), unread = !x.read, sel = u.sel?.includes(x.id);
    const status = last.status === 'sending' ? t.t('message_status_sending') : when(c, last.time, true);
    const prefix = last.mine ? t.t('conversation_list_item_view_sent_from_you_prefix') : '';
    return `<div class="ngms-item" data-id="${x.id}"><div class="ngms-swipebg np-bg-swipe_shadow">${icon('ic_archive_small_dark', 'l')}${icon('ic_archive_small_dark', 'r')}</div>
      <button type="button" class="ngms-conv${unread ? ' unread' : ''}${sel ? ' sel' : ''}" data-action="ngms-open" data-id="${x.id}">${sel ? `<img class="ngms-av ngms-check" src="${A('ic_checkmark_circle_blue')}" alt="">` : avatar(c, x.number, 'ngms-cicon')}
        <span class="ngms-ctext"><span class="ngms-cname">${x.muted ? icon('ic_notifications_off_small_light', 'ngms-bell') : ''}<b>${esc(c, nameOf(c, x.number))}</b></span><span class="ngms-snip">${esc(c, prefix + snippetOf(c, last))}</span><span class="ngms-time">${esc(c, status)}</span></span></button></div>`;
  }
  // The contextual bar of a selection (BugleActionBarActivity's own action mode: white, dark icons).
  function cab(c, buttons) {
    return `<div class="ngms-bar cab">${back(c, 'ngms-cabclose', true)}<span class="ngms-title"></span>${buttons.map(([action, ic, label]) => iconBtn(c, action, ic, label)).join('')}</div>`;
  }
  function listCab(c) {
    const t = T(), u = ui(c), sel = u.sel.map(id => thread(c, id)).filter(Boolean), one = sel.length === 1 ? sel[0] : null;
    const archivedView = u.screen === 'archived', allMuted = sel.every(x => x.muted);
    const items = [archivedView ? ['ngms-sel-unarchive', 'ic_archive_undo_small_dark', t.t('action_unarchive')] : ['ngms-sel-archive', 'ic_archive_small_dark', t.t('action_archive')],
      ['ngms-sel-delete', 'ic_delete_small_dark', t.t('action_delete')],
      allMuted ? ['ngms-sel-notif', 'ic_notifications_on_dark', t.t('action_notification_on')] : ['ngms-sel-notif', 'ic_notifications_off_dark', t.t('action_notification_off')]];
    if (one && !P().byNumber(c, one.number)) items.push(['ngms-sel-contact', 'ic_person_add_dark', t.t('action_add_contact')]);
    if (one && !isBlocked(c, one.number)) items.push(['ngms-sel-block', 'ic_dnd_on_dark', t.t('action_block')]);
    return cab(c, items);
  }
  function list(c) {
    const t = T(), u = ui(c), searching = u.search !== null, q = (u.search || '').trim().toLowerCase();
    let items = sorted(c, false);
    if (searching) items = q ? items.filter(x => nameOf(c, x.number).toLowerCase().includes(q) || x.messages.some(m => (m.text || '').toLowerCase().includes(q))) : [];
    const picking = u.mode === 'share' || u.mode === 'forward';
    let head;
    if (u.sel) head = listCab(c);
    else if (searching) head = `<div class="ngms-bar search">${back(c, 'ngms-sback', true)}<input type="text" class="ngms-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('search_messages_hint'))}" autocomplete="off" spellcheck="false"></div>`;
    else if (picking) head = bar(c, t.t(u.mode === 'share' ? 'share_intent_activity_label' : 'forward_message_activity_title'), {actions: ''});
    else head = bar(c, t.t('app_name'), {up: false, big: true, actions: iconBtn(c, 'ngms-search', 'ic_search_light', t.t('action_search_messages')) + NG.menu.button(c, 'ngms-over')});
    const empty = !items.length ? (searching ? (q ? `<div class="ngms-empty">${esc(c, t.fmt('conversation_list_first_empty_search_results', null, u.search.trim()))}</div>` : '') : `<div class="ngms-empty">${esc(c, t.t('conversation_list_empty_text'))}</div>`) : '';
    return `<div class="ngms ngms-listscreen">${head}<div class="ngms-page ngms-list">${items.map(x => convRow(c, x)).join('')}${empty}</div>${searching || u.sel ? '' : `<button type="button" class="ngms-fab" data-action="ngms-new" aria-label="${esc(c, t.t('start_new_conversation'))}">${icon('ic_add_white')}</button>`}</div>`;
  }
  function archived(c) {
    const t = T(), u = ui(c), items = sorted(c, true);
    const head = u.sel ? listCab(c) : bar(c, t.t('archived_activity_title'), {color: '#9d9d9d', actions: NG.menu.button(c, 'ngms-over')});
    return `<div class="ngms ngms-listscreen">${head}<div class="ngms-page ngms-list">${items.map(x => convRow(c, x)).join('') || `<div class="ngms-empty">${esc(c, t.t('archived_conversation_list_empty_text'))}</div>`}</div></div>`;
  }
  function blocked(c) {
    const t = T(), rows = blockedList(c).map((n, i) => `<button type="button" class="ngms-brow" data-action="ngms-unblock" data-i="${i}">${avatar(c, n, 'ngms-picon')}<span class="ngms-bname">${esc(c, nameOf(c, n))}</span><span class="ngms-unblock">${esc(c, t.t('tap_to_unblock_message'))}</span></button>`).join('');
    return `<div class="ngms">${bar(c, t.t('blocked_contacts_title'))}<div class="ngms-page white">${rows}</div></div>`;
  }

  // ---- People & options ------------------------------------------------------------------------------------------
  function people(c, x) {
    const t = T(), p = P().byNumber(c, x.number), notif = !x.muted, block = isBlocked(c, x.number);
    const sound = x.sound === '' ? t.t('silent_ringtone') : x.sound || t.t('framework/ringtone_default');
    const row = (key, title, sub, on, disabled) => `<button type="button" class="ngms-orow${disabled ? ' off' : ''}" data-action="ngms-opt" data-key="${key}"${disabled ? ' disabled' : ''}><span class="ngms-otext"><b>${esc(c, title)}</b>${sub ? `<small>${esc(c, sub)}</small>` : ''}</span>${on === null ? '' : `<i class="ngw-switch${on ? ' on' : ''}${disabled ? ' disabled' : ''}"><i class="ngw-thumb"></i></i>`}</button>`;
    const fmt = P().format(x.number);
    return `<div class="ngms">${bar(c, t.t('people_and_options_activity_title'))}<div class="ngms-page white">
      ${row('notif', t.t('notifications_enabled_conversation_pref_title'), '', notif, false)}${row('sound', t.t('notification_sound_pref_title'), sound, null, !notif)}${row('vibrate', t.t('notification_vibrate_pref_title'), '', x.vibrate ?? true, !notif)}
      ${row('block', t.fmt(block ? 'unblock_contact_title' : 'block_contact_title', null, fmt), '', null, false)}
      <div class="ngms-phead"><i></i><span>${esc(c, t.t('participant_list_title'))}</span></div>
      <button type="button" class="ngms-prow" data-action="ngms-contact">${avatar(c, x.number, 'ngms-picon')}<span class="ngms-otext"><b>${esc(c, nameOf(c, x.number))}</b>${p ? `<small>${esc(c, fmt)}</small>` : ''}</span></button></div></div>`;
  }

  // ---- the media picker ------------------------------------------------------------------------------------------
  const CHOOSERS = [['stickers', 'ic_stickers_light', 'mediapicker_stickerChooserDescription'], ['camera', 'ic_camera_light', 'mediapicker_cameraChooserDescription'], ['gallery', 'ic_image_light', 'mediapicker_galleryChooserDescription'], ['audio', 'ic_audio_light', 'mediapicker_audioChooserDescription'], ['location', 'ic_location_light', 'mediapicker_locationChooserDescription']];
  function mediaPicker(c, x) {
    const t = T(), u = ui(c), tab = u.mediaTab, [color] = colorOf(c, x.number);
    const tabs = CHOOSERS.map(([k, ic, d]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-action="ngms-mtab" data-tab="${k}" aria-label="${esc(c, t.t(d))}">${icon(ic)}</button>`).join('');
    let body;
    if (tab === 'stickers') body = `<div class="ngms-stickers"><div class="ngms-ssets"><span class="on"><img src="${A('icon_local_sticker_set')}" alt=""></span></div><div class="ngms-sgrid">${STICKERS.map(s => `<button type="button" class="ngms-scell" data-action="ngms-sticker" data-s="${s}"><img src="${A(`foodies_static_${s}`)}" alt=""></button>`).join('')}</div></div>`;
    else if (tab === 'camera') body = `<div class="ngms-mcam"><button type="button" class="ngms-shutter" data-action="ngms-shoot" aria-label="${esc(c, t.t('camera_take_picture'))}">${icon('ic_mp_camera_large_light')}</button></div>`;
    else if (tab === 'gallery') body = `<div class="ngms-gallery">${(NG.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video').sort((a, b) => b.time - a.time).map(p => `<button type="button" class="ngms-gcell" data-action="ngms-gpick" data-id="${p.id}">${NG.media.svg(p, '', 1)}</button>`).join('')}</div>`;
    else if (tab === 'audio') body = `<div class="ngms-maudio"><span>${esc(c, t.t('audio_picker_hint_text'))}</span><button type="button" class="ngms-mic" data-action="ngms-mic" aria-label="${esc(c, t.t('audio_record_view_content_description'))}">${icon('ic_mp_audio_mic')}</button></div>`;
    else body = NG.mapsMessengerPicker(c);
    return `<div class="ngms-picker-panel"><div class="ngms-mtabs" style="background:${color}">${tabs}</div><div class="ngms-mbody">${body}</div></div>`;
  }

  // ---- conversation ----------------------------------------------------------------------------------------------
  const cluster = (a, b) => a && b && a.mine === b.mine && Math.abs(a.time - b.time) <= 60000 && !a.sticker && !b.sticker;
  function messageView(c, x, m, i, color, hits) {
    const t = T(), u = ui(c), list = x.messages, prev = list[i - 1], next = list[i + 1];
    const cp = cluster(prev, m), cn = cluster(m, next), sep = !prev || m.time - prev.time >= H;
    const sending = m.status === 'sending', selected = u.msel === m.id;
    const showMeta = sending || !next || u.details[m.id];
    const meta = sending ? `${esc(c, t.t('message_status_sending'))}<i class="ngms-dots"><i></i><i></i><i></i></i>` : esc(c, m.mine ? when(c, m.time, false) + t.t('message_metadata_separator') + t.t(m.photo||m.audio||m.sticker||m.vcard||m.location?'mms_text':'sms_text') : when(c, m.time, false));
    const photo = m.photo && NG.photoLibrary.find(c,m.photo);
    let text = m.text ? esc(c, m.text) : '';
    if (text && hits && u.csearch?.q) { const q = u.csearch.q.toLowerCase(), raw = m.text, low = raw.toLowerCase(); let out = '', k = 0, j; while ((j = low.indexOf(q, k)) >= 0) { out += esc(c, raw.slice(k, j)) + `<mark${hits.cur === hits.n ? ' class="cur"' : ''}>${esc(c, raw.slice(j, j + q.length))}</mark>`; hits.n++; k = j + q.length; } text = out + esc(c, raw.slice(k)); }
    const att = m.location ? `<button type="button" class="ngmaps-message" data-action="ngms-location-open" data-place="${esc(c,m.location.id)}">${NG.mapsPreview(c,m.location.id)}<b>${esc(c,m.location.name)}</b><small>${esc(c,m.location.address)}</small></button>` : photo ? `<button type="button" class="ngms-att${m.text ? ' with' : ''}" data-action="ngms-media-open" data-photo="${m.photo}" aria-label="${esc(c,t.t(photo.kind==='video'?'video_thumbnail_view_play_button_content_description':'mediapicker_galleryChooserDescription'))}">${NG.media.svg(photo, 'ngms-photo', 4 / 3)}${photo.kind==='video'?NG.smsMedia.video(c,photo):''}</button>` : m.audio ? NG.smsMedia.render(c,m.audio,`m:${x.id}:${m.id}`,false,!m.mine,color) : m.sticker ? `<div class="ngms-att sticker"><img src="${A(`foodies_static_${m.sticker}`)}" alt=""></div>` : '';
    const vcard = m.vcard ? `<span class="ngms-vcard">${icon('ic_person_light')}<b>${esc(c, m.vcard)}</b></span>` : '';
    const bubble = text || vcard ? `<div class="ngms-bubble${cp ? ' cp' : ''}${cn ? ' cn' : ''}"${!m.mine && !selected ? ` style="background:${color}"` : ''}>${vcard}${text ? `<span class="ngms-mtext">${text}</span>` : ''}</div>` : '';
    return `${sep ? `<div class="ngms-sep">${esc(c, separator(c, m.time))}</div>` : ''}<div class="ngms-msg ${m.mine ? 'out' : 'in'}${cp && !sep ? ' cp' : ''}${selected ? ' selected' : ''}" data-action="ngms-msg" data-id="${m.id}">
      ${m.mine ? '' : cn ? '<span class="ngms-micon"></span>' : avatar(c, x.number, 'ngms-micon')}<div class="ngms-mcol">${att}${bubble}${showMeta ? `<div class="ngms-meta">${meta}</div>` : ''}</div></div>`;
  }
  function conversation(c, x) {
    const t = T(), u = ui(c), [color] = colorOf(c, x.number), draft = u.draft[x.id] || '', pending = u.attach[x.id] || [];
    let head;
    if (u.msel) {
      const m = x.messages.find(y => y.id === u.msel);
      const items = [['ngms-m-share', 'ic_share_dark', t.t('action_share')], ['ngms-m-forward', 'ic_forward_dark', t.t('message_context_menu_forward_message')]];
      if (m?.text) items.push(['ngms-m-copy', 'ic_content_copy_dark', t.t('message_context_menu_copy_text')]);
      items.push(['ngms-m-details', 'ic_info_dark', t.t('message_context_menu_view_details')], ['ngms-m-delete', 'ic_delete_small_dark', t.t('action_delete_message')]);
      head = cab(c, items);
    } else if (u.csearch) head = `<div class="ngms-bar" style="background:${color}">${back(c, 'ngms-csclose')}<input type="text" class="ngms-csinput" value="${esc(c, u.csearch.q)}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off" spellcheck="false"></div>`;
    else head = bar(c, nameOf(c, x.number), {color, actions: iconBtn(c, 'ngms-call', 'ic_phone_small_light', t.t('action_call')) + NG.menu.button(c, 'ngms-over')});
    // Conversation search: every match counted, the current one marked.
    const hits = u.csearch?.q ? {n: 0, cur: u.csearch.cur || 0} : null;
    const msgs = x.messages.map((m, i) => messageView(c, x, m, i, color, hits)).join('');
    const details = hits ? `<div class="ngms-sdetails"><span>${esc(c, hits.n ? t.fmt('search_matches', null, Math.min(hits.cur, hits.n - 1) + 1, hits.n) : '')}</span>${iconBtn(c, 'ngms-sprev', 'ic_keyboard_arrow_left_light', t.t('search_prev_content_description'))}${iconBtn(c, 'ngms-snext', 'ic_keyboard_arrow_right_light', t.t('search_next_content_description'))}</div>` : '';
    const pend = pending.length ? `<div class="ngms-pending">${pending.map((a, i) => { const p = a.photo && NG.photoLibrary.find(c,a.photo); const inner = a.audio ? NG.smsMedia.render(c,a.audio,`p:${x.id}:${i}`,true,false,color) : a.location ? NG.mapsPreview(c,a.location.id) : p ? NG.media.svg(p, '', 1) : a.sticker ? `<img src="${A(`foodies_static_${a.sticker}`)}" alt="">` : `<span class="ngms-pvcard">${icon('ic_person_light')}</span>`; return `<span class="ngms-pthumb">${inner}<button type="button" data-action="ngms-unattach" data-i="${i}">${icon('ic_remove_small_light')}</button></span>`; }).join('')}</div>` : '';
    const canSend = !!(draft.trim() || pending.length);
    const hint = pending.length ? 'compose_message_view_hint_text_with_attachment' : 'compose_message_view_sms_hint_text';
    return `<div class="ngms ngms-convscreen" style="--pal:${color}">${head}${details}
      <div class="ngms-page ngms-msgs">${msgs}</div>
      <div class="ngms-compose">${pend}<div class="ngms-crow"><button type="button" class="ngms-attach" data-action="ngms-attach" aria-label="${esc(c, t.t('attachMediaButtonContentDescription'))}">${icon('ic_add_attachment_grey')}</button>
        <textarea class="ngms-field" rows="1" placeholder="${esc(c, t.t(hint))}">${esc(c, draft)}</textarea>
        <button type="button" class="ngms-send" data-action="ngms-send" aria-label="${esc(c, t.t('send_button_content_description'))}"${canSend ? '' : ' disabled'}><i class="ngms-sendic"></i><small>${esc(c, t.t(pending.length ? 'mms_text' : 'sms_text'))}</small></button></div></div>${u.panel === 'media' ? mediaPicker(c, x) : ''}</div>`;
  }

  // ---- contact picker --------------------------------------------------------------------------------------------
  function picker(c) {
    const t = T(), u = ui(c), q = u.to.trim().toLowerCase(), d = q.replace(/[^0-9]/g, '');
    const row = p => `<button type="button" class="ngms-crow2" data-action="ngms-pick" data-n="${esc(c, p.phone)}">${P().tile(c, p, 'ngms-av ngms-picon')}<span class="ngms-cinfo"><b>${esc(c, P().displayName(c, p))}</b><span><span>${esc(c, P().format(p.phone))}</span><small>${esc(c, P().typeLabel())}</small></span></span></button>`;
    let body;
    if (q) {
      const found = P().sorted(c).filter(p => p.name.toLowerCase().split(/\s+/).some(w => w.startsWith(q)) || (d && P().digits(p.phone).includes(d)));
      const send = d && /^[0-9+*#() -]+$/.test(q) ? `<button type="button" class="ngms-crow2" data-action="ngms-pick" data-n="${esc(c, u.to.trim())}">${avatar(c, u.to.trim(), 'ngms-picon')}<span class="ngms-cinfo"><b>${esc(c, t.fmt('contact_list_send_to_text', null, P().format(u.to.trim())))}</b></span></button>` : '';
      body = found.map(row).join('') + send || `<div class="ngms-empty">${esc(c, t.t('contact_list_empty_text'))}</div>`;
    } else {
      // Top contacts: the ones written to and called most.
      const counts = new Map();
      for (const x of threads(c)) { const p = P().byNumber(c, x.number); if (p) counts.set(p.id, (counts.get(p.id) || 0) + x.messages.length); }
      for (const x of P().calls(c)) { const p = P().byNumber(c, x.number); if (p) counts.set(p.id, (counts.get(p.id) || 0) + 1); }
      const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => P().byId(c, id)).filter(Boolean);
      const topView = top.length ? `<div class="ngms-top"><div class="ngms-tophead">${esc(c, t.t('top_contacts_title'))}</div><div class="ngms-topgrid">${top.map(p => `<button type="button" class="ngms-topc" data-action="ngms-pick" data-n="${esc(c, p.phone)}">${P().tile(c, p, 'ngms-av ngms-topicon')}<span class="ngms-topname">${esc(c, P().displayName(c, p))}</span></button>`).join('')}</div></div>` : '';
      let letter = '';
      body = topView + P().sorted(c).map(p => { const l = P().displayName(c, p).charAt(0).toLocaleUpperCase(c.locale()); const head = l !== letter ? `<div class="ngms-alpha"><span>${esc(c, letter = l)}</span></div>` : ''; return head + row(p); }).join('');
    }
    return `<div class="ngms ngms-pickscreen">${bar(c, t.t('contact_picker_title_one_to_one'))}<div class="ngms-to"><span class="ngms-tolabel">${esc(c, t.t('recipient_label'))}</span><input type="text" class="ngms-toinput" value="${esc(c, u.to)}" placeholder="${esc(c, t.t('recipient_hint'))}" autocomplete="off" spellcheck="false"${u.dialpad ? ' inputmode="tel"' : ''}>${iconBtn(c, 'ngms-dialpad', 'ic_numeric_dialpad', t.t('numeric_text_keyboard_toggle_button_content_description'), ' class="ngms-btn ngms-dpt"')}</div><div class="ngms-page white ngms-plist">${body}</div></div>`;
  }

  // ---- logic -----------------------------------------------------------------------------------------------------
  function openThread(c, number) {
    const u = ui(c);
    let x = threadFor(c, number);
    if (!x) { const all = threads(c); x = {id: Math.max(0, ...all.map(y => y.id)) + 1, number, read: true, messages: []}; all.push(x); }
    x.read = true; x.archived = false; c.save();
    u.screen = `conv:${x.id}`; u.panel = ''; u.msel = null;
    if (u.carry) { if (u.carry.text) u.draft[x.id] = u.carry.text; if (u.carry.attach||u.carry.attachments) u.attach[x.id] = [...(u.attach[x.id] || []), ...(u.carry.attachments||[u.carry.attach])]; u.carry = null; u.mode = ''; }
    NG.notifications?.list(c).filter(n => n.app === 'messenger' && n.open?.[1] === `conv:${x.id}`).forEach(n => NG.notifications.cancel(c, n.id));
    return x;
  }
  // A demo contact writes back once (as in every version): the message lands in the thread, the notification follows
  // unless the conversation is open, the conversation is muted or the number blocked.
  const answered = new Set();
  function answer(c, x) {
    const who = P().byNumber(c, x.number);
    if (!who || answered.has(x.id)) return;
    answered.add(x.id);
    NG.appTasks.later(c, 'messenger', () => {
      if (!threads(c).includes(x)) return;
      const t = T(), text = t.t(`sim_reply_${(who.id + x.id) % 3 + 1}`), open = c.ui.view === 'messenger' && ui(c).screen === `conv:${x.id}` && !c.ui.sleeping;
      if (isBlocked(c, x.number)) return;
      x.messages.push({id: nextId(c), mine: false, text, time: Date.now()});
      x.read = open; c.save();
      if (open) { c.render(); return; }
      if (!x.muted && NG.appPref?.(c, 'messenger', 'notifications_enabled', true) !== false) NG.notify(c, {app: 'messenger', icon: 'assets/bg-ic_sms_light.png', title: who.name, text, person: who.id, open: ['messenger', `conv:${x.id}`]});
      if (c.ui.view === 'messenger' && !ui(c).screen) c.render();
    }, 4500);
  }
  function deliver(c, x, out) {
    NG.appTasks.later(c, 'messenger', () => { if (!threads(c).includes(x)) return; for (const m of out) { delete m.status; m.time = Date.now(); } c.save(); if (c.ui.view === 'messenger') c.render(); }, out.some(m => m.photo || m.sticker) ? 2400 : 1200);
  }
  function send(c, x) {
    const u = ui(c), text = (u.draft[x.id] || '').trim(), pending = u.attach[x.id] || []; if (!text && !pending.length) return;
    let id = nextId(c) - 1;
    // An MMS: each attachment its own part (bubble), the text with the last one.
    const out = pending.length ? pending.map((a, i) => ({id: ++id, mine: true, ...a, text: i === pending.length - 1 ? text : '', time: Date.now(), status: 'sending'})) : [{id: ++id, mine: true, text, time: Date.now(), status: 'sending'}];
    for(const message of out)if(message.photo){const source=NG.photoLibrary.find(c,message.photo);message.photo=NG.media.fromDocument(c,{...message.document,photo:message.photo,name:message.document?.name||source?.fileName||(source?.kind==='video'?'Video.mp4':'Photo.jpg')},'sms-provider');if(message.document){message.document.photo=message.photo;delete message.document.mediaSnapshot;}}
    NG.smsMedia.stop(c);
    x.messages.push(...out); x.read = true; u.draft[x.id] = ''; u.attach[x.id] = []; u.panel = ''; c.save(); c.render();
    deliver(c, x, out);
    answer(c, x);
  }
  // A notification's direct reply (RemoteInput): the text goes out from the notification, the conversation is read.
  function replyFromNotification(c, n, text) {
    const x = thread(c, (n.open?.[1] || '').slice(5)); if (!x || !text.trim()) return;
    const m = {id: nextId(c), mine: true, text: text.trim(), time: Date.now(), status: 'sending'};
    x.messages.push(m); x.read = true; c.save();
    deliver(c, x, [m]); answer(c, x);
    if (c.ui.view === 'messenger') c.render();
  }
  function setBlocked(c, x, on) {
    const t = T();
    if (on) { if (!isBlocked(c, x.number)) blockedList(c).push(x.number); x.archived = true; c.save(); c.toast(t.t('blocked_toast_message')); }
    else { c.data.blockedNumbers = blockedList(c).filter(b => !P().same(b, x.number)); x.archived = false; c.save(); c.toast(t.t('unblocked_toast_message')); }
  }
  function confirmBlock(c, x, done) {
    const t = T();
    c.dialog({title: t.fmt('block_confirmation_title', null, P().format(x.number)), message: t.t('block_confirmation_message_system'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { setBlocked(c, x, true); done?.(c); c.render(); }}]});
  }
  function confirmDelete(c, list, done) {
    const t = T();
    c.dialog({title: t.plural('delete_conversations_confirmation_dialog_title', list.length), buttons: [{label: t.t('delete_conversation_decline_button')}, {label: t.t('delete_conversation_confirmation_button'), action: c => { c.data.sms = threads(c).filter(y => !list.includes(y)); c.save(); done?.(c); c.render(); }}]});
  }
  function archive(c, ids, on) {
    const t = T();
    for (const id of ids) { const x = thread(c, id); if (x) x.archived = on; }
    c.save(); c.render();
    snack(c, t.plural(on ? 'archived_toast_message' : 'unarchived_toast_message', ids.length, null, ids.length), t.t('snack_bar_undo'), c => { for (const id of ids) { const x = thread(c, id); if (x) x.archived = !on; } c.save(); c.render(); });
  }

  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = ''; u.search = null; u.sel = null; u.msel = null; u.csearch = null;
    // ShareIntentActivity ("Select conversation"): what was shared waits in the conversation picked next.
    if (sub === 'widget:list' || sub === 'widget:new') { u.screen=sub.endsWith('new')?'pick':'';u.mode='';u.external=false;u.sel=null;u.search=null;u.to='';return; }
    if (sub === 'share') { const d = NG.shareTake?.(c); u.carry = d?.multiple ? {text:d.text||'',attachments:NG.sendModel.streams(d).map(item=>({photo:item.photo,document:item.document}))} : d?.kind === 'vcard' ? {attach: {vcard: d.subject || d.name || ''}} : {text: d?.text || '',...(d?.kind==='audio'&&d.document?{attach:{audio:JSON.parse(JSON.stringify(d.document))}}:d?.photo?{attach:{photo:d.photo,document:d.document}}:{})}; u.mode = 'share'; u.screen = ''; u.external = true; return; }
    if (sub.startsWith('conv:')) { const x = thread(c, sub.slice(5)); if (x) { openThread(c, x.number); u.external = true; } return; }
    if (sub.startsWith('to:')) { const n = sub.slice(3); if (n) { openThread(c, n); u.external = true; } else { u.screen = 'pick'; u.to = ''; u.external = true; } }
  }
  function render(c) {
    consume(c);
    const u = ui(c);
    if (u.screen === 'pick') return picker(c);
    if (u.screen === 'archived') return archived(c);
    if (u.screen === 'blocked') return blocked(c);
    if (u.screen.startsWith('people:')) { const x = thread(c, u.screen.slice(7)); if (x) return people(c, x); u.screen = ''; }
    if (u.screen.startsWith('conv:')) { const x = thread(c, u.screen.slice(5)); if (x) return conversation(c, x); u.screen = ''; }
    return list(c);
  }

  // A row of the list follows the finger sideways and is archived past 40 % of its width (or a fling); a long press
  // starts the selection.
  function bindRows(c, root) {
    const u = ui(c), dp = c.el.screen.clientWidth / (1440 / 3.5);
    for (const item of root.querySelectorAll('.ngms-item')) {
      const row = item.querySelector('.ngms-conv'), bg = item.querySelector('.ngms-swipebg'), id = +item.dataset.id;
      row.addEventListener('pointerdown', e => {
        if (e.button) return;
        const x0 = e.clientX, y0 = e.clientY, w = row.offsetWidth, t0 = performance.now();
        let mode = '', last = [t0, x0];
        const press = setTimeout(() => { if (mode) return; mode = 'press'; u.pressedAt = Date.now(); u.sel = u.sel ? (u.sel.includes(id) ? u.sel : [...u.sel, id]) : [id]; c.render(); }, 500);
        const move = ev => {
          const dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!mode) { if (Math.hypot(dx, dy) < 8 * dp) return; clearTimeout(press); mode = Math.abs(dx) > Math.abs(dy) && !u.sel ? 'x' : 'none'; }
          if (mode !== 'x') return;
          ev.preventDefault();
          last = [performance.now(), ev.clientX];
          row.style.translate = `${dx}px 0`; bg.classList.toggle('right', dx < 0); bg.style.opacity = '1';
        };
        const end = ev => {
          clearTimeout(press);
          window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', end, true); window.removeEventListener('pointercancel', end, true);
          if (mode === 'press') return;
          if (mode !== 'x') return;
          row.dataset.swiped = '1'; setTimeout(() => delete row.dataset.swiped, 0);
          const dx = ev.clientX - x0, v = (ev.clientX - last[1]) / Math.max(1, performance.now() - last[0]) * 1000 / dp;
          if (Math.abs(dx) > w * .4 || (Math.abs(v) > 800 && Math.sign(v) === Math.sign(dx))) {
            row.animate([{translate: `${dx}px 0`}, {translate: `${Math.sign(dx) * w}px 0`}], {duration: 150, fill: 'forwards'}).finished.then(() => archive(c, [id], u.screen !== 'archived'), () => archive(c, [id], u.screen !== 'archived'));
          } else { row.animate([{translate: `${dx}px 0`}, {translate: '0 0'}], {duration: 150, easing: 'cubic-bezier(.4,0,.2,1)'}); row.style.translate = ''; bg.style.opacity = ''; }
        };
        window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
      });
    }
  }
  // The click that ends a long press is the press's, not a tap (the selection redraw put a new element under it).
  const pressed = u => { const was = u.pressedAt && Date.now() - u.pressedAt < 1500; u.pressedAt = 0; return was; };
  // A long press on a message selects it.
  function bindMessages(c, root) {
    const u = ui(c);
    for (const el of root.querySelectorAll('.ngms-msg')) {
      el.addEventListener('pointerdown', e => {
        if (e.button) return;
        const x0 = e.clientX, y0 = e.clientY;
        const timer = setTimeout(() => { u.pressedAt = Date.now(); u.msel = +el.dataset.id; u.panel = ''; u.keepScroll = u.lastScroll; c.render(); }, 500);
        const cancel = ev => { if (ev.type === 'pointermove' && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 10) return; clearTimeout(timer); el.removeEventListener('pointermove', cancel); el.removeEventListener('pointerup', cancel); el.removeEventListener('pointercancel', cancel); };
        el.addEventListener('pointermove', cancel); el.addEventListener('pointerup', cancel); el.addEventListener('pointercancel', cancel);
      });
    }
  }
  function mount(c, root) {
    const u = ui(c);
    const msgs = root.querySelector('.ngms-msgs');
    if (msgs) {
      const cur = msgs.querySelector('mark.cur');
      if (cur) cur.scrollIntoView({block: 'center'}); else if (u.keepScroll != null) msgs.scrollTop = u.keepScroll; else msgs.scrollTop = msgs.scrollHeight;
      u.keepScroll = null;
      msgs.addEventListener('scroll', () => { u.lastScroll = msgs.scrollTop; }, {passive: true});
      bindMessages(c, root);
    }
    if (root.querySelector('.ngms-item')) bindRows(c, root);
    const field = root.querySelector('.ngms-field');
    if (field) {
      const x = thread(c, u.screen.slice(5)), btn = root.querySelector('.ngms-send');
      const fit = () => { field.style.height = 'auto'; field.style.height = `${Math.min(field.scrollHeight, field.clientWidth * .9)}px`; };
      field.addEventListener('input', () => { u.draft[x.id] = field.value; btn.disabled = !field.value.trim() && !(u.attach[x.id] || []).length; fit(); });
      field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(c, x); } });
      field.addEventListener('focus', () => { if (u.panel) { u.panel = ''; u.keepScroll = u.lastScroll; c.render(); c.el.viewport.querySelector('.ngms-field')?.focus(); } });
      fit();
    }
    for (const [sel, set] of [['.ngms-sinput', v => { u.search = v; }], ['.ngms-toinput', v => { u.to = v; }], ['.ngms-csinput', v => { u.csearch.q = v; u.csearch.cur = 0; }]]) {
      const input = root.querySelector(sel); if (!input) continue;
      input.addEventListener('input', () => { set(input.value); const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector(sel); i2?.focus(); i2?.setSelectionRange(pos, pos); });
      if (document.activeElement !== input) input.focus();
    }
  }
  function menu(c, anchor) {
    const t = T(), u = ui(c);
    if (u.screen.startsWith('conv:')) {
      const x = thread(c, u.screen.slice(5)), items = [];
      if (!P().byNumber(c, x.number)) items.push({label: t.t('action_add_contact'), action: c => c.open('contacts', `new:${x.number}`)});
      items.push({label: t.t('action_people_and_options'), action: c => { u.panel = ''; u.screen = `people:${x.id}`; c.render(); }},
        {label: t.t('action_search'), action: c => { u.panel = ''; u.csearch = {q: '', cur: 0}; c.render(); }},
        x.archived ? {label: t.t('action_unarchive'), action: c => { x.archived = false; c.save(); c.render(); snack(c, t.plural('unarchived_toast_message', 1, null, 1)); }}
          : {label: t.t('action_archive'), action: c => { x.archived = true; c.save(); u.screen = u.prev || ''; u.prev = ''; c.render(); snack(c, t.plural('archived_toast_message', 1, null, 1), t.t('snack_bar_undo'), c => { x.archived = false; c.save(); c.render(); }); }},
        {label: t.t('action_delete'), action: c => confirmDelete(c, [x], () => { u.screen = u.prev || ''; u.prev = ''; })},
        {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')});
      return c.menu(items, anchor);
    }
    if (u.screen === 'archived') return c.menu([{label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')}], anchor);
    if (u.screen) return;
    c.menu([{label: t.t('action_menu_show_archived'), action: c => { u.screen = 'archived'; c.render(); }}, {label: t.t('blocked_contacts_title'), action: c => { u.screen = 'blocked'; c.render(); }},
      {label: t.t('action_settings'), action: c => NG.openPrefs ? NG.openPrefs(c, 'messenger', 'preferences_application', NG.text('appprefs').t('PrebuiltBugle/settings_activity_title')) : null},
      {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')}], anchor);
  }
  function messageAction(c, name) {
    const t = T(), u = ui(c), x = thread(c, u.screen.slice(5)), m = x?.messages.find(y => y.id === u.msel);
    if (!m) { u.msel = null; c.render(); return; }
    const done = () => { u.msel = null; c.render(); };
      if (name === 'ngms-m-share') { done(); const p=m.photo&&NG.photoLibrary.find(c,m.photo); NG.share?.(c, m.audio ? {kind:'audio',name:m.audio.name,text:m.text||'',document:JSON.parse(JSON.stringify(m.audio))} : p ? {kind:p.kind==='video'?'video':'image',photo:m.photo,name:m.document?.name||p.fileName,text:m.text||'',document:m.document} : {kind: 'text', text: m.location ? [m.text,m.location.name,m.location.address,'https://maps.example/?place='+m.location.id].filter(Boolean).join('\n') : m.text || ''}); return; }
    if (name === 'ngms-m-forward') { u.msel = null; u.carry = m.photo || m.audio || m.sticker || m.vcard || m.location ? {text: m.text || '', attach: m.audio ? {audio:JSON.parse(JSON.stringify(m.audio))} : m.location ? {location:{...m.location}} : m.photo ? {photo: m.photo, document:m.document?JSON.parse(JSON.stringify(m.document)):undefined} : m.sticker ? {sticker: m.sticker} : {vcard: m.vcard}} : {text: m.text || ''}; u.mode = 'forward'; u.prev = u.screen; u.screen = ''; c.render(); return; }
    if (name === 'ngms-m-copy') { NG.clipboard = m.text || ''; done(); return; }
    if (name === 'ngms-m-details') {
      const multimedia = !!(m.photo || m.audio || m.sticker || m.vcard || m.location), file = m.audio || m.document;
      const lines = [`${t.t('message_type_label')}${t.t(multimedia ? 'multimedia_message' : 'text_message')}`, `${t.t(m.mine ? 'to_address_label' : 'from_label')}${nameOf(c, x.number)}`,
        `${t.t(m.mine ? 'sent_label' : 'received_label')}${new Intl.DateTimeFormat(c.locale(), {dateStyle: 'medium', timeStyle: 'short', hour12: h12(c)}).format(new Date(m.time))}`];
      if (file?.size) lines.push(`${t.t('message_size_label')}${NG.fileSize(c, file.size)}`);
      done(); c.dialog({title: t.t('message_details_title'), message: lines.join('\n'), buttons: [{label: t.t('framework/ok')}]}); return;
    }
    if (name === 'ngms-m-delete') {
      c.dialog({title: t.t('delete_message_confirmation_dialog_title'), message: t.t('delete_message_confirmation_dialog_text'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('delete_message_confirmation_button'), action: c => { x.messages = x.messages.filter(y => y !== m); c.save(); done(); }}]});
    }
  }

  NG.messengerWidget = {threads: c => sorted(c,false), thread, name:nameOf, avatar, snippet:snippetOf, when,
    draft(c,id,text){const d=ui(c).draft;if(text!==undefined)d[id]=String(text);return d[id]||'';},
    reply(c,id,text){const x=thread(c,id);if(!x||!String(text).trim()||isBlocked(c,x.number))return false;NG.appData.opened(c,'messenger');replyFromNotification(c,{open:['messenger','conv:'+id]},String(text));ui(c).draft[id]='';return true;}
  };
  NG.register('messenger', {
    stop(c) { answered.clear(); NG.smsMedia?.stop(c); },
    unmount(c) { NG.smsMedia?.stop(c); },
    tick(c) { NG.smsMedia?.tick(c); },
    resume(c) { for (const x of threads(c)) { const pending = x.messages.filter(m => m.status === 'sending'); if (pending.length) deliver(c, x, pending); } },
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('messenger', c.ui.messenger?.screen),
    statusColor: c => { consume(c); const u = ui(c); if (u.screen.startsWith('conv:')) { const x = thread(c, u.screen.slice(5)); if (x) return colorOf(c, x.number)[1]; } return u.screen === 'archived' ? '#838383' : '#1c3aa9'; },
    // BugleTheme: colorAccent primary_color.
    dialogAccent: () => PRIMARY,
    render, mount,
    // The message notification (ng-notify.js): the sender's icon, Reply (RemoteInput) and Call.
    notification(c, n) {
      const t = T(), x = thread(c, (n.open?.[1] || '').slice(5)); if (!x) return null;
      return {large: avatar(c, x.number, 'ngnt-large'), actions: [{id: 'reply', label: t.t('notification_reply'), input: t.t('notification_reply_prompt')}, {id: 'call', label: t.t('notification_call')}]};
    },
    notificationAction(c, n, id, text) {
      const x = thread(c, (n.open?.[1] || '').slice(5)); if (!x) return;
      if (id === 'call') { NG.notifications.cancel(c, n.id); NG.phone?.call(c, x.number); return; }
      if (id === 'reply') replyFromNotification(c, n, text || '');
    },
    back(c) {
      const u = ui(c);
      if (u.msel) { u.msel = null; c.render(); return true; }
      if (u.sel) { u.sel = null; c.render(); return true; }
      if (u.panel) { u.panel = ''; c.render(); return true; }
      if (u.csearch) { u.csearch = null; c.render(); return true; }
      if (u.mode && !u.screen) { const from = u.prev; u.mode = ''; u.carry = null; if (from) { u.screen = from; u.prev = ''; c.render(); return true; } if (u.external) { u.external = false; return false; } c.render(); return true; }
      if (u.screen && u.external) { u.external = false; u.screen = ''; return false; }
      if (u.screen.startsWith('people:')) { u.screen = `conv:${u.screen.slice(7)}`; c.render(); return true; }
      if (u.screen.startsWith('conv:') && u.prev) { u.screen = u.prev; u.prev = ''; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      if (NG.smsMedia?.action(name, el, c)) return true;
      const u = ui(c), t = T();
      switch (name) {
        case 'ngms-open': {
          if (el.dataset.swiped || pressed(u)) return true;
          const id = +el.dataset.id;
          if (u.sel) { u.sel = u.sel.includes(id) ? u.sel.filter(y => y !== id) : [...u.sel, id]; if (!u.sel.length) u.sel = null; c.render(); return true; }
          const x = thread(c, id); u.prev = u.screen === 'archived' ? 'archived' : ''; openThread(c, x.number); if (u.prev === 'archived') x.archived = true, c.save(); c.render(); return true;
        }
        case 'ngms-up': if (!this.back(c)) c.back(); return true;
        case 'ngms-cabclose': u.sel = null; u.msel = null; c.render(); return true;
        case 'ngms-sel-archive': case 'ngms-sel-unarchive': { const ids = u.sel; u.sel = null; archive(c, ids, name === 'ngms-sel-archive'); return true; }
        case 'ngms-sel-delete': { const list = u.sel.map(id => thread(c, id)).filter(Boolean); confirmDelete(c, list, () => { u.sel = null; }); return true; }
        case 'ngms-sel-notif': { const sel = u.sel.map(id => thread(c, id)).filter(Boolean), off = !sel.every(x => x.muted); for (const x of sel) x.muted = off; u.sel = null; c.save(); c.render(); c.toast(t.t(off ? 'notification_off_toast_message' : 'notification_on_toast_message')); return true; }
        case 'ngms-sel-contact': { const x = thread(c, u.sel[0]); u.sel = null; c.open('contacts', `new:${x.number}`); return true; }
        case 'ngms-sel-block': { const x = thread(c, u.sel[0]); confirmBlock(c, x, () => { u.sel = null; }); return true; }
        case 'ngms-unblock': { const n = blockedList(c)[+el.dataset.i]; const x = threadFor(c, n); c.data.blockedNumbers = blockedList(c).filter(b => b !== n); if (x) x.archived = false; c.save(); c.toast(t.t('unblocked_toast_message')); c.render(); return true; }
        case 'ngms-contact': { const x = thread(c, u.screen.slice(7)), p = P().byNumber(c, x.number); c.open('contacts', p ? `contact:${p.id}` : `new:${x.number}`); return true; }
        case 'ngms-opt': {
          const x = thread(c, u.screen.slice(7)), k = el.dataset.key;
          if (k === 'notif') x.muted = !x.muted;
          else if (k === 'vibrate') x.vibrate = !(x.vibrate ?? true);
          else if (k === 'sound') { NG.ringtonePicker?.(c, {kind: 'notification', current: x.sound ?? 'default', defaultTitle: t.t('framework/ringtone_default'), onPick: (c, v) => { x.sound = v === 'default' ? undefined : v; c.save(); c.render(); }}); return true; }
          else if (k === 'block') { if (isBlocked(c, x.number)) { setBlocked(c, x, false); c.render(); } else confirmBlock(c, x, () => { u.screen = ''; }); return true; }
          c.save(); c.render(); return true;
        }
        case 'ngms-msg': {
          if (pressed(u)) return true;
          const id = +el.dataset.id;
          if (u.msel) { u.msel = u.msel === id ? null : id; c.render(); return true; }
          // ConversationMessageView: a tap shows or hides the message's details line.
          u.details[id] = !u.details[id]; u.keepScroll = u.lastScroll; c.render(); return true;
        }
        case 'ngms-m-share': case 'ngms-m-forward': case 'ngms-m-copy': case 'ngms-m-details': case 'ngms-m-delete': messageAction(c, name); return true;
        case 'ngms-mtab': u.mediaTab = el.dataset.tab; u.keepScroll = u.lastScroll; c.render(); return true;
        case 'ngms-location': {
          const x=thread(c,u.screen.slice(5)),p=NG.mapsModel.find(el.dataset.id);if(!x||!p)return true;
          u.attach[x.id]=[...(u.attach[x.id]||[]),{location:{id:p.id,name:p.name,address:p.address}}];u.panel='';c.render();return true;
        }
        case 'ngms-location-open': c.open('maps','place:'+el.dataset.place);return true;
        case 'ngms-gpick': case 'ngms-shoot': case 'ngms-sticker': {
          const x = thread(c, u.screen.slice(5));
          const a = name === 'ngms-sticker' ? {sticker: el.dataset.s} : {photo: name === 'ngms-shoot' ? NG.media.add(c, {seed: Math.floor(Math.random() * 90) + 3, time: Date.now(), kind: 'photo'}).id : +el.dataset.id};
          // A sticker goes at once; a picture waits above the field.
          if (a.sticker) { const m = {id: nextId(c), mine: true, sticker: a.sticker, text: '', time: Date.now(), status: 'sending'}; x.messages.push(m); x.read = true; u.panel = ''; c.save(); c.render(); deliver(c, x, [m]); answer(c, x); return true; }
          u.attach[x.id] = [...(u.attach[x.id] || []), a]; u.panel = ''; c.render(); return true;
        }
        case 'ngms-unattach': { const x = thread(c, u.screen.slice(5)); u.attach[x.id].splice(+el.dataset.i, 1); c.render(); return true; }
        case 'ngms-mic': c.toast(t.t('audio_picker_hint_text')); return true;
        case 'ngms-new': u.screen = 'pick'; u.to = ''; c.render(); return true;
        case 'ngms-dialpad': u.dialpad = !u.dialpad; c.render(); return true;
        case 'ngms-pick': openThread(c, el.dataset.n); c.render(); return true;
        case 'ngms-search': u.search = ''; c.render(); return true;
        case 'ngms-sback': u.search = null; c.render(); return true;
        case 'ngms-csclose': u.csearch = null; c.render(); return true;
        case 'ngms-sprev': case 'ngms-snext': { const n = c.el.viewport.querySelectorAll('.ngms-msgs mark').length; if (!n) return true; u.csearch.cur = ((u.csearch.cur || 0) + (name === 'ngms-snext' ? 1 : -1) + n) % n; c.render(); return true; }
        case 'ngms-send': send(c, thread(c, u.screen.slice(5))); return true;
        case 'ngms-call': NG.phone?.call(c, thread(c, u.screen.slice(5)).number); return true;
        case 'ngms-attach': u.panel = u.panel === 'media' ? '' : 'media'; document.activeElement?.blur?.(); NG.ime?.hide?.(); u.keepScroll = null; c.render(); return true;
        case 'ng-menu': menu(c, el); return true;
      }
      return false;
    }
  });

  // Messenger's Settings (SettingsActivity with one SIM: ApplicationSettingsFragment, xml-v23/preferences_application.xml):
  // Default SMS app (Messenger is), Get notifications, Notification sound (RingtonePreference), Hear outgoing message
  // sounds, Vibrate, Your current country (detected from the US SIM), Advanced (PerSubscriptionSettingsActivity,
  // xml-v21/preferences_per_subscription.xml: Group messaging, the MMS switches, Wireless alerts, Access Point Names,
  // SIM card messages, Phone number). The Debug category is for debug builds and Enhanced features for RCS carriers.
  // The switches without a defaultValue take the defaults of the carrier's mms_config as AOSP Messaging has them.
  const AP = () => NG.text('appprefs');
  const DEFAULTS = {buglesub_auto_retrieve_mms: true, buglesub_group_messaging: true};
  if (NG.appPrefsHooks) NG.appPrefsHooks.messenger = {
    hidden: ['debug_category', 'sms_disabled', 'rcs_prefs'],
    get: (c, key) => key in DEFAULTS ? NG.appPref(c, 'messenger', key, DEFAULTS[key]) : undefined,
    summary(c, key) {
      const t = T();
      if (key === 'sms_enabled') return t.t('app_name');
      if (key === 'notification_sound') { const v = NG.appPref(c, 'messenger', 'notification_sound', 'default'); return v === 'default' ? t.t('framework/ringtone_default') : v || t.t('silent_ringtone'); }
      if (key === 'current_country') return AP().fmt('PrebuiltBugle/auto_selected_country_summary', null, new Intl.DisplayNames([c.locale()], {type: 'region'}).of('US'));
      if (key === 'buglesub_group_messaging') return AP().t(NG.appPref(c, 'messenger', key, true) ? 'PrebuiltBugle/enable_group_mms' : 'PrebuiltBugle/disable_group_mms');
      if (key === 'buglesub_mms_phone_number') return NG.appPref(c, 'messenger', key, '') || AP().t('PrebuiltBugle/unknown_phone_number_pref_display_value');
      return undefined;
    },
    click(c, key, n) {
      const t = T();
      if (key === 'sms_enabled') { c.open('settings', 'xml:advanced_apps'); return true; }
      if (key === 'notification_sound') { NG.ringtonePicker?.(c, {kind: 'notification', current: NG.appPref(c, 'messenger', key, 'default'), defaultTitle: t.t('framework/ringtone_default'), onPick: (c, v) => { NG.setAppPref(c, 'messenger', key, v); c.render(); }}); return true; }
      if (key === 'buglesub_group_messaging') {
        NG.appPrefsChoose(c, NG.appPrefStr(n.title), [AP().t('PrebuiltBugle/disable_group_mms'), AP().t('PrebuiltBugle/enable_group_mms')], NG.appPref(c, 'messenger', key, true) ? 1 : 0, (c, i) => { NG.setAppPref(c, 'messenger', key, i === 1); c.render(); }, PRIMARY);
        return true;
      }
      if (key === 'buglesub_mms_phone_number') {
        let v = NG.appPref(c, 'messenger', key, '');
        c.dialog({title: NG.appPrefStr(n.title), html: `<div class="ngst-edit"><input type="tel" class="ngst-input" value="${esc(c, v)}" placeholder="${esc(c, AP().t('PrebuiltBugle/enter_phone_number_hint'))}" autocomplete="off" style="border-color:${PRIMARY}"></div>`,
          mount: (c, win) => { const f = win.querySelector('input'); f.addEventListener('input', () => { v = f.value; }); setTimeout(() => f.focus(), 50); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { NG.setAppPref(c, 'messenger', key, v.trim()); c.render(); }}]});
        return true;
      }
      if (key === 'advanced_prefs') { NG.appPrefsGo(c, 'preferences_per_subscription', AP().t('PrebuiltBugle/advanced_settings_activity_title')); return true; }
      if (key === 'buglesub_wireless_alerts_key') { NG.openPrefs(c, 'cellbroadcast', 'preferences', NG.appPrefStr('string/CellBroadcastReceiver/sms_cb_settings')); return true; }
      if (key === 'sms_apns_key') { c.open('settings', 'xml:apn_settings'); return true; }
      if (key === 'current_country') return true;
      return false;
    },
    screens: {sim_storage_pref_key: 'sim-messages'},
    // SimMessagesActivity with an empty SIM.
    customs: {'sim-messages': {title: () => AP().t('PrebuiltBugle/sim_storage_pref_title'), render: c => `<div class="ngms-simempty">${esc(c, AP().t('PrebuiltBugle/no_sim_message'))}</div>`}}
  };
})();
