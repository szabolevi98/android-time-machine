/* Android 6.0.1 Hangouts (Hangouts 4.1, app/Hangouts of MTC20K), the app 'hangouts', on the demo account. The chats
   are the simulator's own sample data.
   - The toolbar in primary quantum_googgreen500 #0f9d58 (the status bar primary_dark #0b8043) with the drawer bars,
     "Hangouts" and search; conversation_list_item_view.xml rows (avatar, name, snippet, time); the
     fab_hangouts_primary_color FAB (quantum_ic_add_white_24) for fab_new_conversation.
   - The drawer: the account, Invites, Archived, Snooze notifications, Settings, Help & feedback.
   - A conversation: the toolbar with video_call_title / voice_call_title actions; message_list_item_view.xml bubbles
     (incoming_conversation_bubble_background white with the avatar, outgoing_conversation_bubble_background
     quantum_bluegrey100 #cfd8dc) on quantum_bluegrey50; the compose bar "Send Hangouts message" with ic_send_green_24.
     The conversation's overflow: Archive (conversation_archived) and Turn notifications off / on.
   - The drawer's items (Hangouts 4.1's code, read with docs/tools/dex-uses.py and dex-decompile.py):
     Invites (ConversationInviteListFragment: invites_title, no_invites_text), Archived (ConversationListFragment in its
     archived mode: archived_conversations_title, the archived conversations or no_archived_conversations_text),
     Snooze notifications (dnj: dnd_dialog_title with Off and 1, 2, 4, 8, 24 and 72 hours, plurals dnd_hours),
     Settings and Help & feedback (Google's help).
   - Settings (SettingsActivity → dnz): the signed-in account (doc's General settings only with SMS in Hangouts, which
     Messenger has here); the account (AccountSettingsActivity → dme): General settings (dmn: Share your status, whose
     screen has Device and In-call), Notifications (dnh: Hangouts messages & invites and Video calls, each dnp's
     Notifications / Sound / Vibrate), Account (dmf: Verify phone number, Hidden contacts, Sign out) and Improve
     Hangouts (dnb). Signed out, the app shows the account picker (account_picker_select_initial_title, login_pending).
   - Search: the people search field (people_search_hint) over the contacts; a call (video_call_title /
     voice_call_title) shows the contact over black with quantum_ic_call_end_white_24; ending it toasts
     hangout_call_ended. */
(() => {
  'use strict';
  const T = () => MM.text('hangouts'), P = () => MM.people;
  const A = n => `assets/ho-${n}.png`;
  const H = 36e5;
  MM.defaults.hangouts = [{id: 1, contact: 2, messages: [{id: 1, mine: false, text: 'The photos from the hike are up!', time: Date.now() - 26 * H}, {id: 2, mine: true, text: 'They look amazing 😀', time: Date.now() - 25.8 * H}]}];
  const chats = c => c.data.hangouts || (c.data.hangouts = JSON.parse(JSON.stringify(MM.defaults.hangouts)));
  const ui = c => c.ui.hangouts || (c.ui.hangouts = {chat: 0, drawer: false, draft: {}, pick: false});
  const prefs = c => c.data.hangoutsPrefs || (c.data.hangoutsPrefs = {});
  const back = `<img src="${A('quantum_ic_arrow_back_white_24')}" alt="">`;
  const bar = (c, title, extra = '') => `<div class="mmho-bar"><button type="button" class="mmho-btn" data-action="mmho-up" aria-label="${esc(c, c.t('Back'))}">${back}</button><span class="mmho-title">${esc(c, title)}</span>${extra}</div>`;
  // A preference row as Settings draws them (.mmst-pref), with a check box where it has one.
  const pref = (c, key, title, summary = '', check) => `<button type="button" class="mmst-pref" data-action="mmho-pref" data-k="${key}"><span class="mmst-texts"><span class="mmst-title">${esc(c, title)}</span>${summary ? `<span class="mmst-summary">${esc(c, summary)}</span>` : ''}</span>${check === undefined ? '' : `<span class="mmst-widget"><i class="mmst-check${check ? ' on' : ''}"></i></span>`}</button>`;
  const cat = (c, title) => `<div class="mmpf-cat">${esc(c, title)}</div>`;
  const on = (c, k, def = true) => prefs(c)[k] ?? def;
  // The settings screens: 'settings' (the accounts), 'account', 'notify:<chat|video>', 'status', 'hidden'.
  function settingsPage(c, page) {
    // AccountSettingsActivity: the display name as the title, the account under it in quantum_white_text.
    const t = T(), wrap = (title, body, sub = '') => `<div class="mmho mmpf" style="--mmpf-accent:#0f9d58;--mmw-accent:#0f9d58">${bar(c, title).replace('</span>', sub ? `<small>${esc(c, sub)}</small></span>` : '</span>')}<div class="mmpf-list">${body}</div></div>`;
    if (page === 'settings') return wrap(t.t('babel_settings_label'), pref(c, 'go:account', MM.account.email));
    if (page === 'account') return wrap(MM.account.name, cat(c, t.t('general_settings_preference_category')) + pref(c, 'go:status', t.t('rich_status_share_your_status'), t.t(on(c, 'status_device') || on(c, 'status_incall') ? 'status_settings_enabled' : 'status_settings_disabled'))
      + cat(c, t.t('chat_notifications_preference_category')) + pref(c, 'go:notify:chat', t.t('chat_notification_enabled_title')) + pref(c, 'go:notify:video', t.t('video_nofification_screen_title'))
      + cat(c, t.t('account_preference_category')) + pref(c, 'verify', t.t('phone_verification_title_default'), t.t('phone_verification_summary_default')) + pref(c, 'go:hidden', t.t('hidden_contacts_title')) + pref(c, 'signout', t.t('sign_out_title'))
      + cat(c, t.t('improve_hangouts_category')) + pref(c, 'improve', t.t('improve_hangouts_title'), t.t('improve_hangouts_summary'), on(c, 'improve', false)), MM.account.email);
    if (page.startsWith('notify:')) { const k = page.slice(7); return wrap(t.t(k === 'chat' ? 'chat_notification_enabled_title' : 'video_nofification_screen_title'), pref(c, `${k}_enabled`, t.t('sms_notification_enabled_title'), '', on(c, `${k}_enabled`)) + pref(c, `${k}_sound`, t.t('chat_notification_sound_title'), prefs(c)[`${k}_sound`] || '') + pref(c, `${k}_vibrate`, t.t('sms_notification_vibrate_title'), '', on(c, `${k}_vibrate`))); }
    if (page === 'status') return wrap(t.t('rich_status_share_your_status'), pref(c, 'status_device', t.t('rich_status_device'), t.t('rich_status_device_summary'), on(c, 'status_device')) + pref(c, 'status_incall', t.t('rich_status_incall'), t.t('rich_status_incall_summary_text'), on(c, 'status_incall')));
    if (page === 'hidden') return wrap(t.t('hidden_contacts_title'), '');
    return '';
  }
  // Invites and Archived: the conversation list in its other modes.
  function modePage(c, mode) {
    const t = T();
    if (mode === 'invites') return `<div class="mmho">${bar(c, t.t('invites_title'))}<div class="mmho-page"><div class="mmho-empty"><b>${esc(c, t.t('no_invites_text'))}</b></div></div></div>`;
    const items = chats(c).filter(x => x.archived && x.messages.length);
    return `<div class="mmho">${bar(c, t.t('archived_conversations_title'))}<div class="mmho-page">${items.length ? items.map(x => rowHtml(c, x)).join('') : `<div class="mmho-empty"><img src="${A('empty_archive')}" alt=""><b>${esc(c, t.t('no_archived_conversations_text'))}</b></div>`}</div></div>`;
  }
  function rowHtml(c, x) { const p = P().byId(c, x.contact), last = x.messages.at(-1); return `<button type="button" class="mmho-row" data-action="mmho-open" data-id="${x.id}">${P().tile(c, p, 'mmho-av')}<span class="mmho-rtext"><b>${esc(c, p.name)}</b><small>${esc(c, last.text)}</small></span><span class="mmho-time">${esc(c, when(c, last.time))}</span></button>`; }
  function searchPage(c) {
    const t = T(), u = ui(c), q = u.search.trim().toLowerCase(), list = P().sorted(c).filter(p => !q || p.name.toLowerCase().includes(q) || P().digits(p.phone || '').includes(q.replace(/\D/g, '') || '\u0000'));
    return `<div class="mmho mmho-search"><div class="mmho-sbar"><button type="button" class="mmho-btn" data-action="mmho-up">${`<img src="assets/gm-ic_arrow_back_wht_24dp.png" alt="" style="filter:invert(.46)">`}</button><input class="mmho-sfield" type="text" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('people_search_hint'))}" spellcheck="false" autocomplete="off"></div>
      <div class="mmho-page">${list.map(p => `<button type="button" class="mmho-prow" data-action="mmho-start" data-id="${p.id}">${P().tile(c, p, 'mmho-av')}<span>${esc(c, p.name)}</span></button>`).join('')}</div></div>`;
  }
  function callPage(c, x) {
    const p = P().byId(c, x.contact);
    return `<div class="mmho mmho-call">${P().tile(c, p, 'mmho-cav')}<b>${esc(c, p.name)}</b><button type="button" class="mmho-end" data-action="mmho-endcall"><img src="${A('quantum_ic_call_end_white_24')}" alt=""></button></div>`;
  }
  function signedOut(c) {
    const t = T(), u = ui(c);
    return `<div class="mmho"><div class="mmho-bar"><span class="mmho-title">${esc(c, t.t('account_picker_select_initial_title'))}</span></div><div class="mmho-page">${u.signing ? `<div class="mmho-empty"><b>${esc(c, t.t('login_pending'))}</b></div>` : `<button type="button" class="mmho-prow" data-action="mmho-signin"><img class="mmho-av" src="assets/gm-avatar_placeholder.png" alt=""><span>${esc(c, MM.account.email)}</span></button>`}</div></div>`;
  }
  const esc = (c, s) => c.safe(s);
  function when(c, time) {
    const d = Date.now() - time, date = new Date(time);
    if (d < 6e4) return T().t('posted_now');
    if (new Date().toDateString() === date.toDateString()) return new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(date);
    if (d < 7 * 864e5) return new Intl.DateTimeFormat(c.locale(), {weekday: 'short'}).format(date);
    return new Intl.DateTimeFormat(c.locale(), {month: 'short', day: 'numeric'}).format(date);
  }
  // Hangouts' widget (mm-widgets.js) lists the same conversations.
  MM.hangoutsWidget = c => chats(c).filter(x => x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time)
    .map(x => { const p = P().byId(c, x.contact), last = x.messages.at(-1); return {name: p.name, avatar: P().tile(c, p, 'mmwg-ho-av'), when: when(c, last.time), text: last.text}; });
  function list(c) {
    const t = T(), u = ui(c), items = chats(c).filter(x => x.messages.length && !x.archived).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);
    const drawer = u.drawer ? `<div class="mmho-scrim" data-action="mmho-drawer"></div><div class="mmho-drawer"><div class="mmho-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${[['menu_invites', 'invites'], ['menu_archived_conversations', 'archived'], ['dnd_menu_item', 'dnd'], ['home_menu_settings', 'settings'], ['help_feedback_menu_item_text', 'help']].map(([k, id]) => `<button type="button" class="mmho-di" data-action="mmho-item" data-id="${id}">${esc(c, t.t(k))}${id === 'dnd' && prefs(c).dndUntil > Date.now() ? `<small>${esc(c, new Intl.DateTimeFormat(c.locale(), {hour: 'numeric', minute: '2-digit'}).format(new Date(prefs(c).dndUntil)))}</small>` : ''}</button>`).join('')}</div>` : '';
    const pick = u.pick ? `<div class="mmho-scrim" data-action="mmho-pick"></div><div class="mmho-sheet">${P().sorted(c).map(p => `<button type="button" class="mmho-prow" data-action="mmho-start" data-id="${p.id}">${P().tile(c, p, 'mmho-av')}<span>${esc(c, p.name)}</span></button>`).join('')}</div>` : '';
    return `<div class="mmho"><div class="mmho-bar"><button type="button" class="mmho-hb" data-action="mmho-drawer"><i></i><i></i><i></i></button><span class="mmho-title">${esc(c, t.t('app_name'))}</span><button type="button" class="mmho-btn" data-action="mmho-search"><img class="inv" src="${A('quantum_ic_search_black_24')}" alt=""></button></div>
      <div class="mmho-page">${prefs(c).dndUntil > Date.now() ? `<div class="mmho-snooze"><span>${esc(c, AndroidStrings.format(t.t('notifications_are_dnd'),new Date(prefs(c).dndUntil).toLocaleTimeString(c.locale(),{hour:'numeric',minute:'2-digit'})))}</span><button type="button" data-action="mmho-resume">${esc(c,t.t('notifications_dnd_cancel'))}</button></div>` : ''}${items.map(x => rowHtml(c, x)).join('')}</div>
      <button type="button" class="mmho-fab" data-action="mmho-pick" aria-label="${esc(c, t.t('fab_new_conversation'))}"><img src="${A('quantum_ic_add_white_24')}" alt=""></button>${pick}${drawer}</div>`;
  }
  function chat(c, x) {
    const t = T(), u = ui(c), p = P().byId(c, x.contact), draft = u.draft[x.id] || '';
    return `<div class="mmho mmho-chat"><div class="mmho-bar"><button type="button" class="mmho-btn" data-action="mmho-up"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button><span class="mmho-title">${esc(c, p.name)}</span>
      <button type="button" class="mmho-btn" data-action="mmho-call" aria-label="${esc(c, t.t('video_call_title'))}"><img src="${A('quantum_ic_videocam_white_24')}" alt=""></button><button type="button" class="mmho-btn" data-action="mmho-call" aria-label="${esc(c, t.t('voice_call_title'))}"><img src="${A('ic_call_white_32')}" alt=""></button><button type="button" class="mmho-btn" data-action="mmho-cmenu"><img src="assets/fw-ic_menu_moreoverflow_material.svg" alt=""></button></div>
      <div class="mmho-page mmho-msgs">${x.messages.map(m => `<div class="mmho-msg ${m.mine ? 'out' : 'in'}">${m.mine ? '' : P().tile(c, p, 'mmho-mav')}<div class="mmho-bubble"><span>${esc(c, m.text)}</span><small>${esc(c, when(c, m.time))}</small></div></div>`).join('')}</div>
      <div class="mmho-compose"><textarea class="mmho-field" rows="1" placeholder="${esc(c, t.t('realtimechat_message_text_hint'))}">${esc(c, draft)}</textarea><button type="button" class="mmho-send" data-action="mmho-send" aria-label="${esc(c, t.t('realtimechat_send_button_description'))}"><img src="${A(draft.trim() ? 'ic_send_green_24' : 'ic_send_grey_24')}" alt=""></button></div></div>`;
  }
  // ShareIntentActivity: the shared text waits for the conversation picked from the list (or started), as its draft.
  function render(c) {
    const u = ui(c);
    if (c.ui.sub?.startsWith('chat:')) { const id = +c.ui.sub.slice(5); c.ui.sub = ''; if (chats(c).some(y => y.id === id)) { u.chat = id; u.drawer = u.pick = false; } }
    if (c.ui.sub === 'share') { c.ui.sub = ''; const d = MM.shareTake(c); u.share = d?.text || ''; u.chat = 0; u.drawer = u.pick = false; }
    if (u.chat && u.share) { u.draft[u.chat] = u.share; u.share = ''; }
    if (c.data.hangoutsSignedOut) return signedOut(c);
    const x = chats(c).find(y => y.id === u.chat);
    if (x && u.calling) return callPage(c, x);
    if (x) return chat(c, x);
    if (u.screen?.startsWith('set:')) return settingsPage(c, u.screen.slice(4));
    if (u.screen === 'invites' || u.screen === 'archived') return modePage(c, u.screen);
    if (u.search !== undefined && u.search !== null) return searchPage(c);
    return list(c);
  }
  function endCall(c) { const u = ui(c); u.calling = false; c.render(); c.toast(T().t('hangout_call_ended')); }
  MM.register('hangouts', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => { const u = c.ui.hangouts || {}; return MM.page('hangouts', ...(u.screen || '').split(':').filter(x => x !== 'set'), u.search != null && 'search', u.chat && 'chat', u.calling && 'call'); },
    statusColor: c => ui(c).calling ? '#000' : '#0b8043',
    render,
    tick(c){const p=prefs(c);if(p.dndUntil&&p.dndUntil<=Date.now()){p.dndUntil=0;c.save();c.render();}},
    mount(c, root) {
      const msgs = root.querySelector('.mmho-msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const sf = root.querySelector('.mmho-sfield');
      if (sf) { sf.addEventListener('input', () => { ui(c).search = sf.value; const pos = sf.selectionStart; c.render(); const g = c.el.viewport.querySelector('.mmho-sfield'); g?.focus(); g?.setSelectionRange(pos, pos); }); setTimeout(() => sf.focus(), 30); }
      const f = root.querySelector('.mmho-field');
      if (f) { const u = ui(c), img = root.querySelector('.mmho-send img'); f.addEventListener('input', () => { u.draft[u.chat] = f.value; img.src = A(f.value.trim() ? 'ic_send_green_24' : 'ic_send_grey_24'); }); f.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); root.querySelector('.mmho-send').click(); } }); }
    },
    back(c) {
      const u = ui(c);
      if (u.drawer || u.pick) { u.drawer = u.pick = false; c.render(); return true; }
      if (u.calling) { endCall(c); return true; }
      if (u.chat) { u.chat = 0; c.render(); return true; }
      if (u.screen) { const s = u.screen; u.screen = s.startsWith('set:notify:') || s === 'set:status' || s === 'set:hidden' ? 'set:account' : s === 'set:account' ? 'set:settings' : ''; c.render(); return true; }
      if (u.search != null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c);
      switch (name) {
        case 'mmho-resume': prefs(c).dndUntil=0;c.save();c.render();return true;
        case 'mmho-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmho-pick': u.pick = !u.pick; c.render(); return true;
        case 'mmho-open': { u.chat = +el.dataset.id; const x = chats(c).find(y => y.id === u.chat); if (x?.archived) { x.archived = false; c.save(); } u.screen = ''; c.render(); return true; }
        case 'mmho-start': { const id = +el.dataset.id, all = chats(c); let x = all.find(y => y.contact === id); if (!x) { x = {id: Math.max(0, ...all.map(y => y.id)) + 1, contact: id, messages: []}; all.push(x); c.save(); } u.pick = false; u.search = null; u.chat = x.id; c.render(); return true; }
        case 'mmho-up': c.back(); return true;
        case 'mmho-search': u.search = ''; c.render(); return true;
        case 'mmho-item': {
          const id = el.dataset.id, t = T(); u.drawer = false;
          if (id === 'help') { c.render(); c.open('help', 'hangouts'); return true; }
          if (id === 'dnd') {
            c.render();
            const hours = [0, 1, 2, 4, 8, 24, 72];
            c.dialog({title: t.t('dnd_dialog_title'), items: hours.map(h => ({html: esc(c, h ? t.plural('dnd_hours', h, null, h) : t.t('dnd_off'))})), onItem: i => { prefs(c).dndUntil = hours[i] ? Date.now() + hours[i] * 36e5 : 0; c.save(); c.render(); }});
            return true;
          }
          u.screen = id === 'settings' ? 'set:settings' : id; c.render(); return true;
        }
        case 'mmho-pref': {
          const k = el.dataset.k, t = T(), p = prefs(c);
          if (k.startsWith('go:')) { u.screen = `set:${k.slice(3)}`; c.render(); return true; }
          if (/_sound$/.test(k)) { MM.ringtonePicker?.(c, {kind: 'notification', current: p[k] || 'default', onPick: (c, v) => { p[k] = v === 'default' ? '' : v; c.save(); c.render(); }}); return true; }
          if (k === 'verify') {
            c.dialog({title: t.t('verify_phone_enter_your_phone_number'), message: t.t('verify_phone_pitch'), html: `<div class="mmpf-edit"><input type="tel" placeholder="${esc(c, t.t('dialpad_edit_text_hint'))}"></div>`,
              buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => { c.toast(t.t('progress_verify_phone_number_message')); setTimeout(() => c.toast(t.t('setup_error_phone_verification_failed')), 2500); }}]});
            return true;
          }
          if (k === 'signout') { c.data.hangoutsSignedOut = true; c.save(); u.screen = ''; c.render(); return true; }
          p[k] = !on(c, k, k === 'improve' ? false : true); c.save(); c.render(); return true;
        }
        case 'mmho-signin': u.signing = true; c.render(); setTimeout(() => { u.signing = false; c.data.hangoutsSignedOut = false; c.save(); if (c.ui.view === 'hangouts') c.render(); }, 1500); return true;
        case 'mmho-call': u.calling = true; c.render(); return true;
        case 'mmho-endcall': endCall(c); return true;
        case 'mmho-cmenu': {
          const x = chats(c).find(y => y.id === u.chat), t = T(); if (!x) return true;
          c.menu([{label:t.t('realtimechat_conversation_delete_menu_item_text'),action:c=>c.dialog({title:t.t('realtimechat_conversation_delete_title'),message:t.t('realtimechat_conversation_delete_text'),buttons:[{label:MM.text('framework').t('cancel')},{label:t.t('realtimechat_conversation_delete_menu_item_text'),action:c=>{c.data.hangouts=chats(c).filter(y=>y!==x);delete u.draft[x.id];u.chat=0;c.save();c.render();}}]})},{label: t.t('realtimechat_conversation_archive_menu_item_text'), action: c => { x.archived = true; c.save(); u.chat = 0; c.render(); c.toast(t.t('conversation_archived')); }},
            {label: t.t(x.muted ? 'realtimechat_conversation_unmute_menu_item_text' : 'realtimechat_conversation_mute_menu_item_text'), action: c => { x.muted = !x.muted; c.save(); }}]);
          return true;
        }
        case 'mmho-send': {
          const x = chats(c).find(y => y.id === u.chat), text = (u.draft[u.chat] || '').trim(); if (!text) return true;
          x.messages.push({id: Date.now(), mine: true, text, time: Date.now()}); u.draft[u.chat] = ''; c.save(); c.render();
          // The other side answers once (mm-notify.js), posted with stat_notify_hangout unless the chat is open.
          const who = MM.people?.byId(c, x.contact);
          if (who && MM.notifications) MM.notifications.answer(c, 'hangouts', x.id, c => {
            if (!chats(c).includes(x)) return;
            const answer = MM.text('hangouts').t(`sim_reply_${who.id % 2 + 1}`), open = c.ui.view === 'hangouts' && ui(c).chat === x.id;
            x.messages.push({id: Date.now(), mine: false, text: answer, time: Date.now()}); c.save();
            if (open) { c.render(); return; }
            if (x.muted || !on(c,'chat_enabled') || prefs(c).dndUntil > Date.now()) return;
            MM.notify(c, {app: 'hangouts', icon: 'assets/ho-stat_notify_hangout.png', title: who.name, text: answer, person: who.id, open: ['hangouts', `chat:${x.id}`]});
          });
          return true;
        }
      }
      return false;
    }
  });
})();
