/* Google Talk 1.3 of the Nexus S image (Talk2.apk, with voice and video chat), from its layouts, colours and texts:
   - The friends list (BuddyList): roster_list.xml on roster_list_online_background #e3e3e3, roster_list_self_item.xml
     (your picture in im_avatar_picture_border_normal, your name and status, the presence on the right) and
     roster_list_item.xml rows (65 dip: the picture, the 18 sp bold name, the 14 sp status, a seperator_vertical_light and
     the 62 dip presence column; offline friends on #cccccc in #666666), and the Set status choices.
   - The chat (ChatScreen): title_message_bar.xml on header_chat (the friend's name in bold, the status, the presence and
     the voice / video buttons), chat_screen_item.xml rows (18 sp; received chats on received_chat_color #effbff, names in
     chat_from #7785e0 / chat_me #3492c5), the compose bar on bottombar_landscape_565 ("Type to compose", Send), and the
     emoticons of Insert smiley.
   - The Menu-key menus of both screens in the order of buddy_list_menu.xml and chat_screen_menu.xml.
   - Add friend (AddBuddyScreen, add_buddy_screen.xml): "Send chat invitation to", the address field and Send invitation
     centred on the ButtonBar; a name without a domain gets @gmail.com, as onCreate does. Sent invitations wait in Invites
     (InvitedUserList, invited_user.xml); Blocked lists blocked friends (none). Most popular / All friends switches the
     list between the friends you chat with and everyone.
   Friends' replies are made up and offline. 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const {e} = GBApps;
  const STRINGS = __STRINGS__({
    "Talk": "app_label",
    "Google Talk": "landing_page_title",
    "Friends list": "menu_view_roster",
    "Available": "presence_available",
    "Busy": "presence_busy",
    "Away": "presence_away",
    "Invisible": "presence_invisible",
    "Offline": "presence_offline",
    "Status message": "custom_status_hint",
    "Set Status": "set_status_activity_title",
    "Type to compose": "compose_hint",
    "Send": "send",
    "Add friend": "menu_add",
    "Search": "menu_search",
    "All friends": "menu_show_all_contacts",
    "Most popular": "menu_show_quick_contacts",
    "Invites": "menu_show_invites",
    "Settings": "menu_settings",
    "Sign out": "menu_sign_out",
    "Switch chats": "menu_switch_chats",
    "Chat off record": "menu_go_off_record",
    "Chat on record": "menu_go_on_record",
    "Add to chat": "menu_add_contact",
    "End chat": "menu_end_conversation",
    "End all chats": "menu_leave_all_chats",
    "Insert smiley": "menu_insert_smiley",
    "Clear chat history": "menu_clear_chat",
    "Friend info": "menu_user_info",
    "Video chat": "menu_video_chat",
    "Voice chat": "menu_voice_chat",
    "Send video chat invitation?": "confirm_dialog_video_chat_message",
    "Send voice chat invitation?": "confirm_dialog_voice_chat_message",
    "Calling…": "video_audio_chat_calling",
    "No active chats": "no_chats",
    "%s is away": "user_away",
    "%s is busy": "user_busy",
    "%s is offline": "user_offline",
    "Chat with %s": "chat_with",
    "Video chat available": "video_chat_available",
    "Mobile indicator": "mobile_indicator_title",
    "Search Google Talk": "search_hint",
    "%1$s results for \"%2$s\"": "chat_search_history",
    "Invite a friend to chat": "invite_buddy",
    "Send chat invitation to": "invite_instruction",
    "Send invitation": "invite_label",
    "Pending invitations": "pending_invitations_title",
    "Blocked friends": "blocked_title",
    "Blocked": "menu_show_blocked_contacts",
    "Help": "menu_help",
    "View contact": "menu_view_contact",
    "Select friend to invite": "group_chat_add_contact",
    "Invitation sent to %s": "group_chat_invited",
    "This is now a group chat.": "convert_to_groupchat",
    "Group chat": "group_chat",
    "General settings": "gtalk_general_settings",
    "Sign in automatically": "auto_login",
    "Sign into Talk when you turn on this Android device": "auto_login_summary",
    "Mobile indicator": "mobile_indicator_title",
    "Show mobile indicator to friends": "mobile_indicator_summary",
    "Automatic away status": "show_away_on_idle_title",
    "Set status to away when the screen is turned off": "show_away_on_idle_summary",
    "Clear search history": "pref_gtalk_clear_search_history_title",
    "Clear previous Google Talk chat searches from showing up in the Search box": "pref_gtalk_clear_search_history_summary",
    "Invitation notifications": "friend_invite_notification_title",
    "Notify in Status bar when friend invitations are received": "friend_invite_notification_summary",
    "Text chat settings": "notification_group_title",
    "Notifications": "notification_enabled_title",
    "Ringtone": "notification_ringtone_title",
    "Vibrate": "notification_vibrateWhen_title",
    "Also vibrate with notification": "notification_vibrateWhen_summary_always",
    "Voice & video chat settings": "video_chat_group_title",
    "About": "preferences_about",
    "Terms & privacy": "preferences_terms_title",
    "Pop-up alert": "@array/prefEntries_text_notifications:0",
    "Status bar notification": "@array/prefEntries_text_notifications:1",
    "Off": "@array/prefEntries_text_notifications:2",
    "Always": "@array/prefEntries_vibrateWhen:0",
    "Only when silent": "@array/prefEntries_vibrateWhen:1",
    "Never": "@array/prefEntries_vibrateWhen:2"
  });
  const T = GBApps.texts(STRINGS);
  const A = name => `assets/tk-${name}.png`;
  const PRESENCE = ['available', 'away', 'busy', 'offline'];
  // The made-up roster over the simulator's contacts: presence, status message, voice / video and mobile.
  const ROSTER = {1: ['available', 'On the trail with my Nexus S', 'video'], 2: ['away', 'Back in 10', 'voice'], 3: ['busy', 'Meetings all day', ''], 4: ['available', '', 'mobile']};
  const REPLIES = ['Sounds good!', 'Haha, nice :)', 'On my way.', 'Let me check and get back to you.', 'Sure, see you then!'];
  const SMILEYS = [['happy', ':-)'], ['sad', ':-('], ['winking', ';-)'], ['tongue_sticking_out', ':-P'], ['surprised', '=-O'], ['kissing', ':-*'], ['cool', 'B-)'], ['laughing', ':-D']];
  const smileys = text => SMILEYS.reduce((html, [img, code]) => html.split(e(code)).join(`<img class="tk-emo" src="${A(`emo_im_${img}`)}" alt="${e(code)}">`), e(text));
  const friend = (ctx, id) => { const c = (ctx.contacts || []).find(x => String(x.id) === String(id)); if (!c) return null; const [presence, status, kind] = ROSTER[c.id] || ['offline', '', '']; return {...c, presence, status, kind}; };
  const presenceIcon = f => f.presence === 'offline' ? 'assets/gb-presence_offline.png' : f.kind === 'voice' || f.kind === 'video' ? A(`presence_audio_${f.presence === 'available' ? 'online' : f.presence}`) : `assets/gb-presence_${f.presence === 'available' ? 'online' : f.presence}.png`;
  const store = data => (data.talk23 ||= {presence: 'available', message: '', chats: {}, offRecord: {}});
  const label = (lang, p) => T(lang, p === 'available' ? 'Available' : p === 'away' ? 'Away' : p === 'busy' ? 'Busy' : p === 'invisible' ? 'Invisible' : 'Offline');

  function roster(ctx) {
    const {lang, data} = ctx, s = store(data);
    const friends = (ctx.contacts || []).filter(c => !s.popular || s.chats[c.id]?.length).map(c => friend(ctx, c.id)).sort((a, b) => PRESENCE.indexOf(a.presence) - PRESENCE.indexOf(b.presence) || a.name.localeCompare(b.name));
    const self = `<button class="tk-self" data-action="tk-status"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(ctx.account)}</b><small>${e(s.message || label(lang, s.presence))}</small></span><i class="tk-sep"></i><span class="tk-presence"><img src="assets/gb-presence_${s.presence === 'available' ? 'online' : s.presence}.png" alt=""></span></button>`;
    const active = Object.keys(s.chats).filter(id => s.chats[id].length);
    const rows = friends.map(f => `<button class="tk-buddy${f.presence === 'offline' ? ' off' : ''}" data-action="tk-chat" data-id="${f.id}"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(f.name)}</b><small>${e(f.status || label(lang, f.presence))}</small>${f.kind === 'mobile' ? `<img class="tk-kind" src="${A('im_contact_icon_mobile_light')}" alt="">` : ''}</span>${active.includes(String(f.id)) ? `<img class="tk-active" src="${A('status_chat')}" alt="">` : ''}<i class="tk-sep"></i><span class="tk-presence"><img src="${presenceIcon(f)}" alt=""></span></button>`).join('');
    return `<div class="app-view tk tk-roster" data-no-translate><div class="gb-titlebar">${e(T(lang, 'Friends list'))}</div><div class="tk-scroll">${self}${rows}</div></div>`;
  }
  function chat(ctx) {
    const {lang, data, ui, locale} = ctx, s = store(data), f = friend(ctx, ui.tkChat);
    if (!f) return roster(ctx);
    const msgs = s.chats[f.id] || [], off = s.offRecord[f.id];
    const buttons = f.kind === 'video' || f.kind === 'voice' ? `${f.kind === 'video' ? `<i class="tk-msep"></i><button data-action="tk-call" data-id="video" aria-label="${e(T(lang, 'Video chat'))}"><img src="${A('ic_start_video_holo_light')}" alt=""></button>` : ''}<i class="tk-msep"></i><button data-action="tk-call" data-id="voice" aria-label="${e(T(lang, 'Voice chat'))}"><img src="${A('ic_start_audio_gray_holo_light')}" alt=""></button>` : '';
    const group = (s.groups?.[f.id] || []).map(id => friend(ctx, id)).filter(Boolean);
    const rows = msgs.map(m => m.system ? `<p class="tk-note">${e(m.system === 'invited' ? AndroidStrings.format(T(lang, 'Invitation sent to %s'), m.name) : T(lang, 'This is now a group chat.'))}</p>` : `<div class="tk-msg${m.me ? ' me' : ''}"><img class="tk-badge" src="${A('ic_contact_picture')}" alt=""><p><b>${e(m.me ? 'me' : f.name.split(' ')[0])}:</b> ${smileys(m.body)}</p></div>`).join('');
    const note = off ? `<p class="tk-note">${e(T(lang, 'Chat off record'))}</p>` : '';
    return `<div class="app-view tk tk-chatview" data-no-translate><div class="tk-bar"><span class="tk-who"><b>${e(group.length ? T(lang, 'Group chat') : f.name)}</b><small>${e(group.length ? [f, ...group].map(x => x.name).join(', ') : f.status || label(lang, f.presence))}</small></span><img class="tk-pres" src="${presenceIcon(f)}" alt="">${buttons}</div><div class="tk-scroll tk-history">${note}${rows}</div><form class="tk-compose" data-form="tk-send"><input name="body" placeholder="${e(T(lang, 'Type to compose'))}" aria-label="${e(T(lang, 'Type to compose'))}" autocomplete="off"><button type="submit">${e(T(lang, 'Send'))}</button></form></div>`;
  }
  // Search (audit step 5): the framework SearchDialog with Talk's hint and history, then search_results.xml.
  function searchDialog(ctx) {
    const {lang, data} = ctx, s = store(data), hint = T(lang, 'Search Google Talk');
    return `<div class="gbbr-search-scrim" data-action="tk-search-cancel"></div><form class="gbbr-search" data-form="tk-search"><div class="gbbr-search-row"><img class="gbbr-search-app" src="assets/talk.png" alt=""><input name="query" autocomplete="off" aria-label="${e(hint)}" placeholder="${e(hint)}"><button class="gbbr-go" type="submit" aria-label="Go"><img src="assets/gb-ic_btn_search_go.png" alt=""></button></div><div class="gbbr-suggest">${(s.searches || []).slice(0, 4).map(q => `<button type="button" class="gbbr-suggestion" data-action="tk-search-run" data-id="${e(q)}"><img src="assets/gb-br-ic_search_category_history.png" alt=""><span><b>${e(q)}</b></span></button>`).join('')}</div></form>`;
  }
  function results(ctx) {
    const {lang, data, ui, locale} = ctx, s = store(data), q = ui.tkQuery.toLocaleLowerCase();
    const hits = Object.keys(s.chats).map(id => ({f: friend(ctx, id), m: [...(s.chats[id] || [])].reverse().find(m => m.body.toLocaleLowerCase().includes(q))})).filter(h => h.f && h.m);
    const rows = hits.map(({f, m}) => `<button class="tk-hit" data-action="tk-chat" data-id="${f.id}"><span class="tk-hit-title"><img src="assets/gb-stat_notify_chat.png" alt=""><b>${e(f.name)}</b></span><span class="tk-hit-snippet">${e(m.body)}</span><span class="tk-hit-meta"><i>${e(m.me ? ctx.account : f.name)}</i><time>${e(new Date(m.time).toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}))}</time></span></button>`).join('');
    const title = AndroidStrings.format(T(lang, '%1$s results for "%2$s"'), hits.length, ui.tkQuery);
    return `<div class="app-view tk tk-results" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="tk-scroll tk-hits">${rows}</div></div>`;
  }
  // AddBuddyScreen, InvitedUserList and the blocked list.
  function addBuddy(ctx) {
    const {lang, ui} = ctx, value = ui.tkInvite || '';
    return `<form class="app-view tk tk-add" data-form="tk-invite" data-no-translate><div class="gb-titlebar">${e(T(lang, 'Invite a friend to chat'))}</div><div class="tk-add-body"><label for="tk-invite">${e(T(lang, 'Send chat invitation to'))}</label><input id="tk-invite" class="gbdlg-input" name="email" value="${e(value)}" autocomplete="off" spellcheck="false"></div><div class="tk-buttonbar"><button type="submit"${value.trim() ? '' : ' disabled'}>${e(T(lang, 'Send invitation'))}</button></div></form>`;
  }
  function people(ctx, title, list) {
    return `<div class="app-view tk tk-people" data-no-translate><div class="gb-titlebar">${e(title)}</div><div class="tk-scroll">${list.map(x => `<div class="tk-invited"><span class="tk-avatar"><img src="${A('ic_contact_picture')}" alt=""></span><span class="tk-text"><b>${e(x.email.split('@')[0])}</b><small>${e(x.email)}</small></span></div>`).join('')}</div></div>`;
  }
  function render(ctx) {
    const {ui, lang, data} = ctx;
    if (ui.tkSub === 'add') return addBuddy(ctx);
    if (ui.tkSub === 'invites') return people(ctx, T(lang, 'Pending invitations'), store(data).invites || []);
    if (ui.tkSub === 'blocked') return people(ctx, T(lang, 'Blocked friends'), []);
    const html = ctx.ui.tkChat ? chat(ctx) : ctx.ui.tkQuery ? results(ctx) : roster(ctx); return ctx.ui.tkSearching ? html.replace(/<\/div>$/, `${searchDialog(ctx)}</div>`) : html; }
  function menu(ctx) {
    const {lang, ui, data} = ctx, t = k => T(lang, k), s = store(data);
    if (ui.tkSub) return [];
    if (ui.tkChat) {
      const f = friend(ctx, ui.tkChat);
      return [
        {action: 'tk-record', title: t(s.offRecord[ui.tkChat] ? 'Chat on record' : 'Chat off record'), icon: s.offRecord[ui.tkChat] ? 'tk-ic_menu_chat_on_record.png' : 'tk-ic_menu_chat_off_record.png'},
        {action: 'tk-switch', title: t('Switch chats'), icon: 'tk-ic_menu_chat_dashboard.png'}, {action: 'tk-roster', title: t('Friends list'), icon: 'tk-ic_menu_friendslist.png'},
        {action: 'tk-add-to-chat', title: t('Add to chat'), icon: 'ic_menu_add'}, {action: 'tk-end', title: t('End chat'), icon: 'tk-ic_menu_end_conversation.png'},
        ...(f && (f.kind === 'voice' || f.kind === 'video') ? [{action: 'tk-call', id: 'voice', title: t('Voice chat')}] : []),
        {action: 'tk-clear', title: t('Clear chat history'), icon: 'tk-ic_menu_end_conversation.png'}, {action: 'tk-smiley', title: t('Insert smiley'), icon: 'tk-ic_menu_emoticons.png'},
        {action: 'tk-contact', title: t('View contact'), icon: 'tk-ic_menu_contact.png'}, {action: 'tk-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
    }
    return [{action: 'tk-popular', title: t(s.popular ? 'All friends' : 'Most popular'), icon: 'tk-ic_menu_allfriends.png'}, {action: 'tk-add', title: t('Add friend'), icon: 'tk-ic_menu_invite.png'},
      {action: 'tk-search', title: t('Search'), icon: 'ic_menu_search'}, {action: 'tk-unsupported', title: t('Sign out'), icon: 'tk-ic_menu_logout.png'},
      {action: 'gbpref-open', id: 'talk', title: t('Settings'), icon: 'ic_menu_preferences'}, {action: 'tk-end-all', title: t('End all chats'), icon: 'tk-ic_menu_end_all_conversations.png'},
      {action: 'tk-invites', title: t('Invites'), icon: 'tk-ic_menu_invites.png'}, {action: 'tk-blocked', title: t('Blocked'), icon: 'tk-ic_menu_blocked_user.png'},
      {action: 'tk-unsupported', title: t('Help'), icon: 'ic_menu_help'}];
  }
  function dialog(kind, ctx) {
    if (kind === 'tk-add-to-chat') {
      const {lang, data, ui} = ctx, s = store(data), inChat = [String(ui.tkChat), ...(s.groups?.[ui.tkChat] || [])];
      const list = (ctx.contacts || []).map(c => friend(ctx, c.id)).filter(f => f && f.presence !== 'offline' && !inChat.includes(String(f.id)));
      return {title: T(lang, 'Select friend to invite'), items: list.map(f => ({action: 'tk-invite-pick', id: f.id, title: f.name}))};
    }
    const {lang, data, ui} = ctx, s = store(data), t = k => T(lang, k);
    if (kind === 'status') return {title: t('Set Status'), items: ['available', 'busy', 'invisible'].map(p => ({action: 'tk-presence', id: p, title: label(lang, p), icon: `gb-presence_${p === 'available' ? 'online' : p}.png`})), custom: `<form data-form="tk-message"><input class="gbdlg-input" name="message" value="${e(s.message)}" placeholder="${e(t('Status message'))}" aria-label="${e(t('Status message'))}" autocomplete="off"></form>`, buttons: [{action: 'tk-message-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'switch') { const ids = Object.keys(s.chats).filter(id => s.chats[id].length); return {title: t('Switch chats'), items: ids.length ? ids.map(id => ({action: 'tk-chat', id, title: friend(ctx, id)?.name || id, icon: 'tk-status_chat.png'})) : [{action: 'close-overlay', title: t('No active chats')}]}; }
    if (kind === 'smiley') return {title: t('Insert smiley'), items: SMILEYS.map(([img, code]) => ({action: 'tk-insert', id: code, title: code, icon: `tk-emo_im_${img}.png`}))};
    if (kind === 'call') return {title: friend(ctx, ui.tkChat)?.name || '', message: t(ui.tkCall === 'video' ? 'Send video chat invitation?' : 'Send voice chat invitation?'), buttons: [{action: 'tk-call-ok', title: ctx.ok}, {action: 'close-overlay', title: ctx.cancel}]};
    if (kind === 'info') { const f = friend(ctx, ui.tkChat); return f ? {title: t('Friend info'), message: `${f.name}\n${f.email || ''}\n${label(lang, f.presence)}${f.status ? ` – ${f.status}` : ''}`, buttons: [{action: 'close-overlay', title: ctx.ok}]} : null; }
    return null;
  }
  let replyTimer = 0;
  function handle(action, id, ctx) {
    const {ui, data, lang} = ctx, s = store(data), close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'tk-chat': close(); ui.tkChat = id; s.chats[id] ||= []; ctx.save(); ctx.render(); ctx.focus('.tk-compose input'); break;
      case 'tk-roster': close(); ui.tkChat = ''; ctx.render(); break;
      case 'tk-status': ctx.dialog('status'); break;
      case 'tk-presence': s.presence = id; ctx.save(); close(); ctx.render(); break;
      case 'tk-message-ok': { const input = document.querySelector('.gbdlg [name=message]'); s.message = (input?.value || '').trim(); ctx.save(); close(); ctx.render(); break; }
      case 'tk-switch': ctx.dialog('switch'); break;
      case 'tk-record': s.offRecord[ui.tkChat] = !s.offRecord[ui.tkChat]; ctx.save(); close(); ctx.render(); break;
      case 'tk-end': delete s.chats[ui.tkChat]; ui.tkChat = ''; ctx.save(); close(); ctx.render(); break;
      case 'tk-end-all': s.chats = {}; ctx.save(); close(); ctx.render(); break;
      case 'tk-clear': s.chats[ui.tkChat] = []; ctx.save(); close(); ctx.render(); break;
      case 'tk-smiley': ctx.dialog('smiley'); break;
      case 'tk-insert': { close(); const input = ctx.root.querySelector('.tk-compose input'); if (input) { input.value = `${input.value}${input.value && !input.value.endsWith(' ') ? ' ' : ''}${id}`; input.focus(); } break; }
      case 'tk-info': ctx.dialog('info'); break;
      case 'tk-call': ui.tkCall = id; ctx.dialog('call'); break;
      case 'tk-call-ok': close(); ctx.toast(T(lang, 'Calling…')); break;
      case 'tk-search': close(); ui.tkSearching = true; ctx.render(); ctx.focus('.gbbr-search input'); break;
      case 'tk-search-cancel': ui.tkSearching = false; ctx.render(); break;
      case 'tk-search-run': ui.tkSearching = false; ui.tkQuery = id; ctx.render(); break;
      // Add to chat (menu_add_contact): "Select friend to invite" over the available friends not in the chat yet; the
      // chat turns into a group chat with the invitation (group_chat_invited) and convert_to_groupchat notes.
      case 'tk-add-to-chat': close(); ctx.dialog('tk-add-to-chat'); break;
      case 'tk-invite-pick': { const s = store(data), host = ui.tkChat, f = friend(ctx, id); close(); if (!f || !host) break;
        const list = (s.groups ||= {})[host] ||= [], chat = s.chats[host] ||= [];
        if (!list.includes(String(f.id))) { if (!list.length) chat.push({system: 'group', time: Date.now()}); list.push(String(f.id)); chat.push({system: 'invited', name: f.name, time: Date.now()}); }
        ctx.save(); ctx.render(); break; }
      case 'tk-unsupported': close(); ctx.toast('This feature is not part of the simulator.'); break;
      case 'tk-popular': s.popular = !s.popular; ctx.save(); close(); ctx.render(); break;
      case 'tk-add': close(); ui.tkSub = 'add'; ui.tkInvite = ''; ctx.render(); ctx.focus('.tk-add input'); break;
      case 'tk-invites': close(); ui.tkSub = 'invites'; ctx.render(); break;
      case 'tk-blocked': close(); ui.tkSub = 'blocked'; ctx.render(); break;
      case 'tk-contact': { close(); const id = Number(ui.tkChat); ctx.openApp('people'); ui.selectedContact = id; ui.sub = 'detail'; ctx.render(); break; }
      default: return false;
    }
    return true;
  }
  function submit(form, values, ctx) {
    const {ui, data} = ctx, s = store(data);
    // AddBuddyScreen.inviteBuddies: each address (a bare name gets @gmail.com), then the screen closes.
    if (form === 'tk-invite') {
      const emails = String(values.get('email') || '').split(/[,;\s]+/).map(x => x.trim()).filter(Boolean).map(x => x.includes('@') ? x : `${x}@gmail.com`);
      if (!emails.length) return true;
      s.invites = [...(s.invites || []).filter(x => !emails.includes(x.email)), ...emails.map(email => ({email, time: Date.now()}))];
      ctx.save(); ui.tkSub = ''; ui.tkInvite = ''; ctx.render(); return true;
    }
    if (form === 'tk-message') { handle('tk-message-ok', null, ctx); return true; }
    if (form === 'tk-search') { const query = String(values.get('query') || '').trim(); if (!query) return true; s.searches = [query, ...(s.searches || []).filter(q => q !== query)].slice(0, 10); ctx.save(); ui.tkSearching = false; ui.tkQuery = query; ctx.render(); return true; }
    if (form !== 'tk-send') return false;
    const body = String(values.get('body') || '').trim(), id = ui.tkChat; if (!body || !id) return true;
    (s.chats[id] ||= []).push({me: true, body, time: Date.now()}); ctx.save(); ctx.render(); ctx.focus('.tk-compose input');
    const f = friend(ctx, id);
    if (f && f.presence !== 'offline') {
      clearTimeout(replyTimer);
      replyTimer = setTimeout(() => { s.chats[id]?.push({me: false, body: REPLIES[(s.chats[id].length + Number(id)) % REPLIES.length], time: Date.now()}); ctx.save(); if (ui.view === 'talk' && ui.tkChat === id) { ctx.render(); ctx.focus('.tk-compose input'); } }, 1800);
    }
    return true;
  }
  function back(ctx) { if (ctx.ui.tkSub) { ctx.ui.tkSub = ''; ctx.render(); return true; } if (ctx.ui.tkSearching) { ctx.ui.tkSearching = false; ctx.render(); return true; } if (ctx.ui.tkChat) { ctx.ui.tkChat = ''; ctx.render(); return true; } if (ctx.ui.tkQuery) { ctx.ui.tkQuery = ''; ctx.render(); return true; } return false; }
  function mounted(ctx) { const invite = ctx.root.querySelector('.tk-add input'); if (invite) invite.addEventListener('input', () => { ctx.ui.tkInvite = invite.value; ctx.root.querySelector('.tk-add [type=submit]').disabled = !invite.value.trim(); }); const box = ctx.root.querySelector('.tk-history'); if (box) box.scrollTop = box.scrollHeight; }
  function open(ctx, resume) { if (!resume) { ctx.ui.tkSub = ''; ctx.ui.tkChat = ''; ctx.ui.tkQuery = ''; ctx.ui.tkSearching = false; } }
  GBApps.register('talk', {render, mounted, menu, dialog, handle, submit, back, open, scroll: '.tk-scroll'});
  window.GBTalk = {T, ROSTER};
})();
