/* Android 6.0.1 Messenger (Messenger 1.4.533, app/PrebuiltBugle of MTC20K), the app 'messenger'.
   - ConversationListActivity (conversation_list_fragment.xml, BugleTheme: primary #0288d1, the status bar #026da7): the
     56 dp action bar "Messenger" with Search and the overflow (conversation_list_fragment_menu.xml: Archived, Blocked
     contacts, Settings, Help & feedback); the RecyclerView 8 dp down; ConversationListItemView rows (16 dp padding, the
     56 dp ContactIconView, 16 dp, the 16 sp #de000000 name, the 14 sp #8a000000 snippet with "You: " before your own
     message, the timestamp); the 60 dp FAB in the primary colour (fab_new_message_bg, ic_add_white) 16 dp from the right
     and 12 dp from the bottom.
   - Times (the app's date helper): under a minute "Just now" in the list and "Now" in a conversation, then
     num_minutes_ago, the time of day, within a week the weekday (with the time in a conversation), within a year the
     date, else M/d/yy; en-US uses the app's own patterns ("EEE h:mmaa", "MMM d, h:mmaa").
   - ConversationActivity (conversation_fragment.xml on #eeeeee): the action bar and the status bar take the
     participant's colour (letter_tile_colors / letter_tile_colors_dark), "Make a call" (ic_phone_small_light) and the
     overflow (Add contact for an unknown number, People & options, Archive, Delete, Help & feedback);
     ConversationMessageView (12 dp sides, 18 dp between authors, 2 dp within one): the 42 dp icon of the other side, the
     msg_bubble_incoming nine-patch in the participant's colour with white 16 sp text, msg_bubble_outgoing in white with
     #323232 text (14 / 10 / 12 dp text padding), the 12 sp time under it (#99ffffff / #99323232); "Sending…" while it
     goes. compose_message_view.xml: ic_attachment_dark (20 dp sides), the msg_bubble_input field "Send message" (16 sp)
     with ic_emoji_dark, then the 42 dp send circle in the primary colour (ic_send_light).
   - The contact picker (contact_picker_fragment.xml): the toolbar's "To" field (20 sp white, hint #a0ffffff), the
     Frequents / All contacts pages; ContactListItemView rows (16 dp in, the 56 dp alphabet header in 26 dp primary
     colour, the 42 dp icon, the 16 sp #4d4d4d name, the 14 sp #999999 number and type); a typed number offers "Send to".
   - People & options (people_and_options_fragment.xml): Notifications (a switch), Sound (the ringtone picker), Vibrate,
     the participant, Block / Unblock <number> (block_confirmation_title / block_confirmation_message; a blocked
     conversation is archived and silent). Archived (archived_activity_title) lists the archived conversations
     (Unarchive in their menu); Blocked contacts lists the blocked numbers with UNBLOCK (tap_to_unblock_message).
   - The media picker (mediapicker_fragment.xml, 215 dp): the chooser buttons (gallery, camera, audio) over the
     gallery's 110 dp cells (6 dp apart on white), the camera (ic_mp_camera_large_light) or the audio recorder ("Touch &
     hold", the 70 dp mic in its 1 dp ring). A picture picked waits above the field and goes as an MMS bubble.
   - The emoji keyboard (emoji_gallery_fragment.xml, 277 dp on emoji_ime_bg's #282828 to black): the category tabs
     (recent, faces, objects, nature, places, symbols; tab_selected / tab_unselected) and the backspace
     (sym_keyboard_delete_holo), the 48 dp grid of the APK's own emoji (mm-emoji.js's sprites); recent_emoji_zero_state_text
     until one is used. ic_emoji_dark turns into ic_ime_dark while it is up. */
(() => {
  'use strict';
  const T = () => MM.text('messenger'), P = () => MM.people;
  const A = n => `assets/bg-${n}.png`;
  const DARK = ['#c53929', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#3367d6', '#0277bd', '#006064', '#00796b', '#0b8043', '#33691e', '#e65100', '#e64a19', '#424242'];
  const M = 60000, H = 3600000;
  MM.defaults.sms = [
    {id: 1, number: '202-555-0148', read: true, messages: [{id: 1, mine: false, text: 'Hey! Are we still on for coffee tomorrow?', time: Date.now() - 62 * M}, {id: 2, mine: true, text: 'Absolutely. See you at 11!', time: Date.now() - 59 * M}]},
    {id: 2, number: '202-555-0107', read: true, messages: [{id: 3, mine: false, text: 'Don’t forget to call this weekend ☺', time: Date.now() - 27 * H}]}
  ];
  const threads = c => c.data.sms || (c.data.sms = JSON.parse(JSON.stringify(MM.defaults.sms)));
  const ui = c => c.ui.messenger || (c.ui.messenger = {screen: '', to: '', pickTab: 0, draft: {}, search: null});
  const esc = (c, s) => c.safe(s);
  const colorOf = (c, number) => { const p = P().byNumber(c, number), key = p ? (p.lookup || p.name) : P().digits(number); const i = Math.abs(P().javaHash(key)) % 14; return [P().COLORS[i], DARK[i]]; };
  const nameOf = (c, number) => P().byNumber(c, number)?.name || P().format(number);
  const avatar = (c, number, cls) => { const p = P().byNumber(c, number); return p ? P().tile(c, p, cls) : `<span class="mmpp-tile round ${cls}" style="background:${colorOf(c, number)[0]}" aria-hidden="true"><img src="assets/gd-ic_person_white_120dp.png" alt=""></span>`; };

  function when(c, time, inList) {
    const t = T(), loc = c.locale(), now = Date.now(), d = now - time, date = new Date(time), us = /^en(-US)?$/i.test(loc);
    const h12 = !(c.data.settings.time24 ?? !new Intl.DateTimeFormat(loc, {hour: 'numeric'}).resolvedOptions().hour12);
    const usTime = () => `${date.getHours() % 12 || 12}:${String(date.getMinutes()).padStart(2, '0')}${date.getHours() < 12 ? 'AM' : 'PM'}`;
    const hm = () => h12 && us ? usTime() : new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: h12}).format(date);
    if (d < M) return t.t(inList ? 'posted_just_now' : 'posted_now');
    if (d < H) { const n = Math.floor(d / M); return t.plural('num_minutes_ago', n, null, n); }
    const same = new Date(now).toDateString() === date.toDateString();
    if (same) return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit', hour12: h12}).format(date);
    const wd = new Intl.DateTimeFormat(loc, {weekday: 'short'}).format(date), md = new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric'}).format(date);
    if (d < 7 * 864e5) return inList ? wd : us ? `${wd} ${hm()}` : `${wd}, ${hm()}`;
    if (d < 364 * 864e5) return inList ? md : us ? `${md}, ${hm()}` : `${md}, ${hm()}`;
    return new Intl.DateTimeFormat(loc, {year: '2-digit', month: 'numeric', day: 'numeric'}).format(date);
  }
  const thread = (c, id) => threads(c).find(x => x.id === +id);
  // Messenger's conversation list widget (mm-widgets.js) shows the same list.
  MM.messengerWidget = c => threads(c).filter(x => !x.archived && x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time)
    .map(x => ({id: x.id, name: nameOf(c, x.number), avatar: avatar(c, x.number, 'mmwg-ms-av'), when: when(c, x.messages.at(-1).time, true), text: x.messages.at(-1).text || T().t('conversation_list_snippet_picture'), unread: !x.read}));
  // The single conversation widget (WidgetConversationProvider): the conversation's name, colour and messages.
  MM.messengerConversation = (c, id) => { const x = thread(c, id); if (!x) return null; const [color] = colorOf(c, x.number);
    return {id: x.id, name: nameOf(c, x.number), color, avatar: avatar(c, x.number, 'mmwg-mc-av'), messages: x.messages.slice(-20).map(m => ({mine: m.mine, text: m.text, photo: m.photo, when: when(c, m.time, false)}))}; };
  // WidgetPickConversationActivity: the conversation list (Messenger's own look) picking the widget's conversation.
  MM.widgetConfigs = MM.widgetConfigs || {};
  MM.widgetConfigs['messenger-conversation'] = (c, done) => { ui(c).widgetPick = done; c.open('messenger', 'widget-pick'); };
  const threadFor = (c, number) => threads(c).find(x => P().same(x.number, number));

  // ---- conversation list ------------------------------------------------------------------------------------------
  function list(c) {
    const t = T(), u = ui(c), searching = u.search !== null, q = (u.search || '').trim().toLowerCase();
    let items = threads(c).filter(x => !x.archived && x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);
    if (searching && q) items = items.filter(x => nameOf(c, x.number).toLowerCase().includes(q) || x.messages.some(m => m.text.toLowerCase().includes(q)));
    const bar = searching
      ? `<div class="mmms-bar search"><button type="button" class="mmms-btn" data-action="mmms-sback"><img src="${A('ic_arrow_back_light')}" alt=""></button><input type="text" class="mmms-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off" spellcheck="false"></div>`
      : `<div class="mmms-bar"><span class="mmms-title">${esc(c, t.t('app_name'))}</span><button type="button" class="mmms-btn" data-action="mmms-search" aria-label="${esc(c, t.t('action_search'))}"><img src="${A('ic_search_light')}" alt=""></button>${MM.menu.button(c, 'mmms-over')}</div>`;
    const rows = items.map(x => convRow(c, x)).join('');
    const empty = !items.length && !searching ? `<div class="mmms-empty">${esc(c, t.t('conversation_list_empty_text'))}</div>` : '';
    const title = u.widgetPick ? `<div class="mmms-bar"><button type="button" class="mmms-btn" data-action="mmms-wpickoff"><img src="${A('ic_arrow_back_light')}" alt=""></button><span class="mmms-title in">${esc(c, t.t('app_name'))}</span></div>` : bar;
    return `<div class="mmms">${title}<div class="mmms-page mmms-list">${rows}${empty}</div>${searching || u.widgetPick ? '' : `<button type="button" class="mmms-fab" data-action="mmms-new" aria-label="${esc(c, t.t('start_new_conversation'))}"><img src="${A('ic_add_white')}" alt=""></button>`}</div>`;
  }
  function convRow(c, x) {
    const t = T();
    {
      const last = x.messages.at(-1), unread = !x.read;
      return `<button type="button" class="mmms-conv${unread ? ' unread' : ''}" data-action="mmms-open" data-id="${x.id}">${avatar(c, x.number, 'mmms-icon')}
        <span class="mmms-ctext"><b>${esc(c, nameOf(c, x.number))}${x.muted ? `<img class="mmms-muted" src="${A('ic_notifications_off_small_light')}" alt="">` : ''}</b><span class="mmms-snip">${last.mine ? esc(c, t.t('conversation_list_item_view_sent_from_you_prefix')) : ''}${esc(c, last.text || (last.photo ? t.t('conversation_list_snippet_picture') : last.audio ? t.t('conversation_list_snippet_audio_clip') : ''))}</span><span class="mmms-time">${esc(c, last.status === 'sending' ? t.t('message_status_sending') : when(c, last.time, true))}</span></span></button>`;
    }
  }
  function subBar(c, title) { return `<div class="mmms-bar"><button type="button" class="mmms-btn" data-action="mmms-up"><img src="${A('ic_arrow_back_light')}" alt=""></button><span class="mmms-title in">${esc(c, title)}</span></div>`; }
  function archived(c) {
    const t = T(), items = threads(c).filter(x => x.archived && x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);
    return `<div class="mmms">${subBar(c, t.t('archived_activity_title'))}<div class="mmms-page mmms-list">${items.map(x => convRow(c, x)).join('') || `<div class="mmms-empty">${esc(c, t.t('archived_conversation_list_empty_text'))}</div>`}</div></div>`;
  }
  function blocked(c) {
    const t = T(), items = threads(c).filter(x => x.blocked);
    return `<div class="mmms">${subBar(c, t.t('blocked_contacts_title'))}<div class="mmms-page mmms-list white">${items.map(x => `<button type="button" class="mmms-brow" data-action="mmms-unblock" data-id="${x.id}">${avatar(c, x.number, 'mmms-micon')}<span>${esc(c, nameOf(c, x.number))}</span><em>${esc(c, t.t('tap_to_unblock_message'))}</em></button>`).join('')}</div></div>`;
  }
  // PeopleAndOptionsFragment: the conversation's options, its participant, Block.
  function people(c, x) {
    const t = T(), p = P().byNumber(c, x.number), sound = x.sound === '' ? t.t('silent_ringtone') : x.sound || t.t('framework/ringtone_default');
    const sw = (key, title, on, disabled, sum = '') => `<button type="button" class="mmms-orow${disabled ? ' off' : ''}" data-action="mmms-opt" data-key="${key}"${disabled ? ' disabled' : ''}><span><b>${esc(c, title)}</b>${sum ? `<small>${esc(c, sum)}</small>` : ''}</span>${on === null ? '' : `<i class="mmw-switch${on ? ' on' : ''}"><i class="mmw-thumb"></i></i>`}</button>`;
    const notif = !x.muted;
    return `<div class="mmms mmms-people">${subBar(c, t.t('people_and_options_activity_title'))}<div class="mmms-page white">
      ${sw('notif', t.t('notifications_enabled_conversation_pref_title'), notif, false)}${sw('sound', t.t('notification_sound_pref_title'), null, !notif, sound)}${sw('vibrate', t.t('notification_vibrate_pref_title'), x.vibrate ?? true, !notif)}
      <i class="mmms-odiv"></i><button type="button" class="mmms-prow" data-action="mmms-contact">${avatar(c, x.number, 'mmms-micon')}<span><b>${esc(c, nameOf(c, x.number))}</b>${p ? `<small>${esc(c, P().format(x.number))}</small>` : ''}</span></button>
      <button type="button" class="mmms-orow" data-action="mmms-opt" data-key="block"><span><b>${esc(c, AndroidStrings.format(t.t(x.blocked ? 'unblock_contact_title' : 'block_contact_title'), P().format(x.number)))}</b></span></button></div></div>`;
  }
  // The media picker under the compose bar.
  function mediaPicker(c, x) {
    const t = T(), u = ui(c), tab = u.mediaTab || 'gallery';
    const tabs = [['gallery', 'ic_image_light', 'mediapicker_galleryChooserDescription'], ['camera', 'ic_camera_light', 'mediapicker_cameraChooserDescription'], ['audio', 'ic_audio_light', 'mediapicker_audioChooserDescription']]
      .map(([k, ic, d]) => `<button type="button" class="${tab === k ? 'on' : ''}" data-action="mmms-mtab" data-tab="${k}" aria-label="${esc(c, t.t(d))}"><img src="${A(ic)}" alt=""></button>`).join('');
    let body;
    if (tab === 'gallery') body = `<div class="mmms-gallery">${(MM.media?.photos(c) || []).filter(p => !p.trashed && p.kind !== 'video').sort((a, b) => b.time - a.time).map(p => `<button type="button" class="mmms-gcell" data-action="mmms-gpick" data-id="${p.id}">${MM.media.svg(p, '', 1)}</button>`).join('')}</div>`;
    else if (tab === 'camera') body = `<div class="mmms-mcam"><button type="button" class="mmms-shutter" data-action="mmms-shoot" aria-label="${esc(c, t.t('camera_take_picture'))}"><img src="${A('ic_mp_camera_large_light')}" alt=""></button></div>`;
    else body = `<div class="mmms-maudio"><span>${esc(c, t.t('audio_picker_hint_text'))}</span><button type="button" class="mmms-mic" data-action="mmms-mic" aria-label="${esc(c, t.t('audio_record_view_content_description'))}"><img src="${A('ic_mp_audio_mic')}" alt=""></button></div>`;
    return `<div class="mmms-picker-panel"><div class="mmms-mtabs">${tabs}</div><div class="mmms-mbody">${body}</div></div>`;
  }
  const CATS = [['recent', 'ic_emoji_recent_light'], ['faces', 'ic_emoji_people_light'], ['objects', 'ic_emoji_objects_light'], ['nature', 'ic_emoji_nature_light'], ['places', 'ic_emoji_places_light'], ['symbols', 'ic_emoji_symbols_light']];
  const emojiChar = code => String.fromCodePoint(...code.split('_').map(h => parseInt(h, 16)));
  function emojiCell(cat, code) {
    const list = MM.bugleEmoji?.[cat] || [], i = list.indexOf(code), cols = MM.bugleEmojiCols || 16, rows = Math.ceil(list.length / cols);
    return `<button type="button" class="mmms-ecell" data-action="mmms-emo" data-code="${code}"><i style="background-image:url('assets/bg-emoji-${cat}.png');background-size:${cols * 100}% ${rows * 100}%;background-position:${cols > 1 ? (i % cols) / (cols - 1) * 100 : 0}% ${rows > 1 ? Math.floor(i / cols) / (rows - 1) * 100 : 0}%"></i></button>`;
  }
  const catOf = code => Object.keys(MM.bugleEmoji || {}).find(k => MM.bugleEmoji[k].includes(code));
  function emojiPanel(c) {
    const t = T(), u = ui(c), cat = u.emojiCat || 'recent', recent = c.data.bugleRecentEmoji || [];
    const tabs = CATS.map(([k, ic]) => `<button type="button" class="${k === cat ? 'np-bg-tab_selected on' : 'np-bg-tab_unselected'}" data-action="mmms-ecat" data-cat="${k}"><img src="${A(`${ic}_${k === cat ? 'activated' : 'normal'}`)}" alt=""></button>`).join('');
    const cells = cat === 'recent' ? recent.map(code => emojiCell(catOf(code), code)).join('') : (MM.bugleEmoji?.[cat] || []).map(code => emojiCell(cat, code)).join('');
    return `<div class="mmms-emoji-panel"><div class="mmms-etabs">${tabs}<button type="button" class="mmms-eback" data-action="mmms-ebks" aria-label="${esc(c, t.t('emoji_keyboard_backspace_content_description'))}"><img src="${A('sym_keyboard_delete_holo')}" alt=""></button></div>
      <div class="mmms-egrid">${cells || (cat === 'recent' ? `<div class="mmms-ezero">${esc(c, t.t('recent_emoji_zero_state_text'))}</div>` : '')}</div></div>`;
  }

  // ---- conversation ----------------------------------------------------------------------------------------------
  function conversation(c, x) {
    const t = T(), u = ui(c), [color] = colorOf(c, x.number), draft = u.draft[x.id] || '', pending = (u.attach || {})[x.id] || [];
    const pend = pending.length ? `<div class="mmms-pending">${pending.map((id, i) => { const p = (MM.media?.photos(c) || []).find(q => q.id === id); return p ? `<span class="mmms-pthumb">${MM.media.svg(p, '', 1)}<button type="button" data-action="mmms-unattach" data-i="${i}"><img src="${A('ic_remove_small_light')}" alt=""></button></span>` : ''; }).join('')}</div>` : '';
    let prev = null;
    const msgs = x.messages.map(m => {
      const gap = prev && prev.mine === m.mine ? 'same' : ''; prev = m;
      const status = m.status === 'sending' ? t.t('message_status_sending') : when(c, m.time, false);
      const photo = m.photo && (MM.media?.photos(c) || []).find(p => p.id === m.photo);
      return `<div class="mmms-msg ${m.mine ? 'out' : 'in'} ${gap}">${m.mine ? '' : avatar(c, x.number, 'mmms-micon')}<div class="mmms-bubble${photo ? ' photo' : ''}" ${m.mine ? '' : `style="background-color:${color}"`}>${photo ? MM.media.svg(photo, 'mmms-mimg', 4 / 3) : ''}${m.text ? `<span class="mmms-mtext">${esc(c, m.text)}</span>` : ''}<span class="mmms-mmeta">${esc(c, status)}</span></div></div>`;
    }).join('');
    return `<div class="mmms mmms-conv-screen" style="--pal:${color}"><div class="mmms-bar" style="background:${color}"><button type="button" class="mmms-btn" data-action="mmms-up"><img src="${A('ic_arrow_back_light')}" alt=""></button><span class="mmms-title in">${esc(c, nameOf(c, x.number))}</span>
      <button type="button" class="mmms-btn" data-action="mmms-call" aria-label="${esc(c, t.t('action_call'))}"><img src="${A('ic_phone_small_light')}" alt=""></button>${MM.menu.button(c, 'mmms-over')}</div>
      <div class="mmms-page mmms-msgs">${msgs}</div>
      ${pend}<div class="mmms-compose"><button type="button" class="mmms-attach" data-action="mmms-attach" aria-label="${esc(c, t.t('attachMediaButtonContentDescription'))}"><img src="${A('ic_attachment_dark')}" alt=""></button>
        <div class="mmms-input"><textarea class="mmms-field" rows="1" placeholder="${esc(c, t.t('compose_message_view_hint_text'))}">${esc(c, draft)}</textarea><button type="button" class="mmms-emoji" data-action="mmms-emoji" aria-label="${esc(c, t.t('emojiKeyboardButtonContentDescription'))}"><img src="${A(u.panel === 'emoji' ? 'ic_ime_dark' : 'ic_emoji_dark')}" alt=""></button></div>
        <button type="button" class="mmms-send" data-action="mmms-send" aria-label="${esc(c, t.t('sendButtonContentDescription'))}"${draft.trim() || pending.length ? '' : ' disabled'}><img src="${A('ic_send_light')}" alt=""></button></div>${u.panel === 'emoji' ? emojiPanel(c) : u.panel === 'media' ? mediaPicker(c, x) : ''}</div>`;
  }

  // ---- contact picker ----------------------------------------------------------------------------------------------
  function picker(c) {
    const t = T(), u = ui(c), q = u.to.trim().toLowerCase(), d = q.replace(/[^0-9]/g, '');
    const row = (p, head = '') => `<button type="button" class="mmms-crow" data-action="mmms-pick" data-n="${esc(c, p.phone)}"><span class="mmms-alpha">${esc(c, head)}</span>${P().tile(c, p, 'mmms-cicon')}<span class="mmms-cinfo"><b>${esc(c, p.name)}</b><span><span>${esc(c, P().format(p.phone))}</span><small>${esc(c, P().typeLabel())}</small></span></span></button>`;
    let body;
    if (q) {
      const found = P().sorted(c).filter(p => p.name.toLowerCase().split(/\s+/).some(w => w.startsWith(q)) || (d && P().digits(p.phone).includes(d)));
      const send = d && /^[0-9+*#() -]+$/.test(q) ? `<button type="button" class="mmms-crow" data-action="mmms-pick" data-n="${esc(c, u.to.trim())}"><span class="mmms-alpha"></span>${avatar(c, u.to.trim(), 'mmms-cicon')}<span class="mmms-cinfo"><b>${esc(c, AndroidStrings.format(t.t('contact_list_send_to_text'), P().format(u.to.trim())))}</b></span></button>` : '';
      body = found.map(p => row(p)).join('') + send;
    } else if (u.pickTab === 0) {
      const counts = new Map();
      for (const x of threads(c)) { const p = P().byNumber(c, x.number); if (p) counts.set(p.id, x.messages.length); }
      for (const x of P().calls(c)) { const p = P().byNumber(c, x.number); if (p) counts.set(p.id, (counts.get(p.id) || 0) + 1); }
      body = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => row(P().byId(c, id))).join('') || `<div class="mmms-empty">${esc(c, t.t('contact_list_empty_text'))}</div>`;
    } else {
      let letter = '';
      body = P().sorted(c).map(p => { const l = p.name.charAt(0).toLocaleUpperCase(c.locale()); const h = l !== letter ? (letter = l) : ''; return row(p, h); }).join('');
    }
    const tabs = q ? '' : `<div class="mmms-tabs" role="tablist">${['contact_picker_frequents_tab_title', 'contact_picker_all_contacts_tab_title'].map((k, i) => `<button type="button" role="tab" aria-selected="${u.pickTab === i}" data-action="mmms-ptab" data-tab="${i}">${esc(c, t.t(k))}</button>`).join('')}<i class="mmms-under" style="transform:translateX(${u.pickTab * 100}%)"></i></div>`;
    return `<div class="mmms mmms-picker"><div class="mmms-head"><div class="mmms-bar"><button type="button" class="mmms-btn" data-action="mmms-up"><img src="${A('ic_arrow_back_light')}" alt=""></button><input type="text" class="mmms-to" value="${esc(c, u.to)}" placeholder="${esc(c, t.t('recipient_hint'))}" autocomplete="off" spellcheck="false"></div>${tabs}</div><div class="mmms-page mmms-plist">${body}</div></div>`;
  }

  function openThread(c, number) {
    const u = ui(c);
    let x = threadFor(c, number);
    if (!x) { const all = threads(c); x = {id: Math.max(0, ...all.map(y => y.id)) + 1, number, read: true, messages: []}; all.push(x); c.save(); }
    x.read = true; x.archived = false; u.screen = `conv:${x.id}`;
    if (u.share) { u.draft[x.id] = u.share; u.share = ''; }
  }
  function send(c, x) {
    const u = ui(c), text = (u.draft[x.id] || '').trim(), pending = (u.attach || {})[x.id] || []; if (!text && !pending.length) return;
    let id = Math.max(0, ...threads(c).flatMap(y => y.messages.map(m => m.id)));
    // An MMS: each picture its own part (bubble), the text with the last one.
    const out = pending.length ? pending.map((photo, i) => ({id: ++id, mine: true, photo, text: i === pending.length - 1 ? text : '', time: Date.now(), status: 'sending'})) : [{id: ++id, mine: true, text, time: Date.now(), status: 'sending'}];
    x.messages.push(...out); u.draft[x.id] = ''; if (u.attach) u.attach[x.id] = []; u.panel = ''; c.save(); c.render();
    setTimeout(() => { for (const m of out) { delete m.status; m.time = Date.now(); } c.save(); if (c.ui.view === 'messenger') c.render(); }, pending.length ? 2400 : 1200);
  }

  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = ''; u.search = null;
    // ShareIntentActivity: the shared text becomes the draft of the conversation picked next.
    if (sub === 'share') { const d = MM.shareTake(c); u.share = d?.text || ''; u.screen = ''; return; }
    if (sub === 'widget-pick') { u.screen = ''; return; }
    // The conversation widget opens its conversation.
    if (sub.startsWith('conv:')) { const x = thread(c, sub.slice(5)); if (x) { x.read = true; c.save(); u.screen = sub; u.external = true; } return; }
    if (sub.startsWith('to:')) { const n = sub.slice(3); if (n) { openThread(c, n); u.external = true; } else { u.screen = 'pick'; u.to = ''; } }
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
  function mount(c, root) {
    const u = ui(c);
    const msgs = root.querySelector('.mmms-msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
    const field = root.querySelector('.mmms-field');
    if (field) {
      const x = thread(c, u.screen.slice(5)), btn = root.querySelector('.mmms-send');
      const fit = () => { field.style.height = 'auto'; field.style.height = `${Math.min(field.scrollHeight, 120)}px`; };
      field.addEventListener('input', () => { u.draft[x.id] = field.value; btn.disabled = !field.value.trim(); fit(); });
      field.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(c, x); } });
      fit();
    }
    for (const [sel, key] of [['.mmms-sinput', 'search'], ['.mmms-to', 'to']]) {
      const input = root.querySelector(sel); if (!input) continue;
      input.addEventListener('input', () => { u[key] = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector(sel); i2?.focus(); i2?.setSelectionRange(pos, pos); });
      if (document.activeElement !== input) input.focus();
    }
  }
  function menu(c) {
    const t = T(), u = ui(c);
    if (u.screen.startsWith('conv:')) {
      const x = thread(c, u.screen.slice(5)), items = [];
      if (!P().byNumber(c, x.number)) items.push({label: t.t('action_add_contact'), action: c => c.open('contacts', `new:${x.number}`)});
      items.push({label: t.t('action_people_and_options'), action: c => { u.panel = ''; u.screen = `people:${x.id}`; c.render(); }},
        x.archived ? {label: t.t('action_unarchive'), action: c => { x.archived = false; c.save(); u.screen = u.prev || ''; u.prev = ''; c.toast(t.fmt('unarchived_toast_message', null, 1), false); c.render(); }}
          : {label: t.t('action_archive'), action: c => { x.archived = true; c.save(); u.screen = ''; c.toast(t.fmt('archived_toast_message', null, 1), false); c.render(); }},
        {label: t.t('action_delete'), action: c => c.dialog({title: t.plural('delete_conversations_confirmation_dialog_title', 1), buttons: [{label: t.t('delete_conversation_decline_button')}, {label: t.t('delete_conversation_confirmation_button'), action: c => { c.data.sms = threads(c).filter(y => y !== x); c.save(); u.screen = ''; c.render(); }}]})},
        {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')});
      return c.menu(items);
    }
    if (u.screen) return;
    c.menu([{label: t.t('action_menu_show_archived'), action: c => { u.screen = 'archived'; c.render(); }}, {label: t.t('blocked_contacts_title'), action: c => { u.screen = 'blocked'; c.render(); }}, {label: t.t('action_settings'), action: c => MM.openPrefs(c, 'messenger', 'preferences_application')}, {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')}]);
  }

  MM.register('messenger', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('messenger', c.ui.messenger?.screen),
    statusColor: c => { const u = ui(c); if (u.screen.startsWith('conv:')) { const x = thread(c, u.screen.slice(5)); if (x) return colorOf(c, x.number)[1]; } return '#026da7'; },
    render, mount,
    back(c) {
      const u = ui(c);
      if (u.panel) { u.panel = ''; c.render(); return true; }
      if (u.widgetPick && !u.screen) { u.widgetPick = null; return false; }
      if (u.screen && u.external) { u.external = false; u.screen = ''; return false; }
      if (u.screen.startsWith('people:')) { u.screen = `conv:${u.screen.slice(7)}`; c.render(); return true; }
      if (u.screen.startsWith('conv:') && u.prev) { u.screen = u.prev; u.prev = ''; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T();
      switch (name) {
        case 'mmms-open': { const x = thread(c, el.dataset.id);
          if (u.widgetPick) { const done = u.widgetPick; c.back(); done({conv: x.id}); return true; }
          x.read = true; c.save(); u.prev = u.screen === 'archived' ? 'archived' : ''; u.screen = `conv:${x.id}`; if (u.share) { u.draft[x.id] = u.share; u.share = ''; } c.render(); return true; }
        case 'mmms-up': if (u.external) { u.external = false; u.screen = ''; c.back(); return true; } this.back(c); return true;
        case 'mmms-wpickoff': c.back(); return true;
        case 'mmms-unblock': { const x = thread(c, el.dataset.id); x.blocked = false; x.archived = false; c.save(); c.toast(t.t('unblocked_toast_message'), false); c.render(); return true; }
        case 'mmms-contact': { const x = thread(c, u.screen.slice(7)), p = P().byNumber(c, x.number); c.open('contacts', p ? `card:${p.id}` : `new:${x.number}`); return true; }
        case 'mmms-opt': {
          const x = thread(c, u.screen.slice(7)), k = el.dataset.key;
          if (k === 'notif') x.muted = !x.muted;
          else if (k === 'vibrate') x.vibrate = !(x.vibrate ?? true);
          else if (k === 'sound') { MM.ringtonePicker(c, {kind: 'notification', current: x.sound ?? 'default', defaultTitle: t.t('framework/ringtone_default'), onPick: (c, v) => { x.sound = v === 'default' ? undefined : v; c.save(); c.render(); }}); return true; }
          else if (k === 'block') {
            if (x.blocked) { x.blocked = false; x.archived = false; c.save(); c.toast(t.t('unblocked_toast_message'), false); c.render(); return true; }
            c.dialog({title: AndroidStrings.format(t.t('block_confirmation_title'), P().format(x.number)), message: t.t('block_confirmation_message'), buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { x.blocked = true; x.archived = true; c.save(); u.screen = ''; c.toast(t.t('blocked_toast_message'), false); c.render(); }}]});
            return true;
          }
          c.save(); c.render(); return true;
        }
        case 'mmms-mtab': u.mediaTab = el.dataset.tab; c.render(); return true;
        case 'mmms-gpick': case 'mmms-shoot': {
          const x = thread(c, u.screen.slice(5)); u.attach = u.attach || {};
          const id = name === 'mmms-shoot' ? MM.media.add(c, {seed: Math.floor(Math.random() * 90) + 3, time: Date.now(), kind: 'photo'}).id : +el.dataset.id;
          u.attach[x.id] = [...(u.attach[x.id] || []), id]; u.panel = ''; c.render(); return true;
        }
        case 'mmms-unattach': { const x = thread(c, u.screen.slice(5)); u.attach[x.id].splice(+el.dataset.i, 1); c.render(); return true; }
        case 'mmms-mic': c.toast(t.t('audio_record_view_content_description'), false); return true;
        case 'mmms-ecat': u.emojiCat = el.dataset.cat; c.render(); return true;
        case 'mmms-emo': {
          const x = thread(c, u.screen.slice(5)), code = el.dataset.code;
          u.draft[x.id] = (u.draft[x.id] || '') + emojiChar(code);
          c.data.bugleRecentEmoji = [code, ...(c.data.bugleRecentEmoji || []).filter(e => e !== code)].slice(0, 48); c.save(); c.render(); return true;
        }
        case 'mmms-ebks': { const x = thread(c, u.screen.slice(5)); u.draft[x.id] = [...(u.draft[x.id] || '')].slice(0, -1).join(''); c.render(); return true; }
        case 'mmms-new': u.screen = 'pick'; u.to = ''; c.render(); return true;
        case 'mmms-ptab': u.pickTab = +el.dataset.tab; c.render(); return true;
        case 'mmms-pick': openThread(c, el.dataset.n); c.render(); return true;
        case 'mmms-search': u.search = ''; c.render(); return true;
        case 'mmms-sback': u.search = null; c.render(); return true;
        case 'mmms-send': send(c, thread(c, u.screen.slice(5))); return true;
        case 'mmms-call': MM.phone?.call(c, thread(c, u.screen.slice(5)).number); return true;
        // The attach button and the emoji button swap the input method for their panel (and back).
        case 'mmms-attach': u.panel = u.panel === 'media' ? '' : 'media'; MM.ime?.hide?.(); c.render(); return true;
        case 'mmms-emoji': if (u.panel === 'emoji') { u.panel = ''; c.render(); c.el.viewport.querySelector('.mmms-field')?.focus(); return true; } u.panel = 'emoji'; MM.ime?.hide?.(); c.render(); return true;
        case 'mm-menu': menu(c); return true;
      }
      return false;
    }
  });
})();
