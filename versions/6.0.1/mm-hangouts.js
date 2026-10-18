/* Android 6.0.1 Hangouts (Hangouts 4.1, app/Hangouts of MTC20K), the app 'hangouts', on the demo account. The chats
   are the simulator's own sample data.
   - The toolbar in primary quantum_googgreen500 #0f9d58 (the status bar primary_dark #0b8043) with the drawer bars,
     "Hangouts" and search; conversation_list_item_view.xml rows (avatar, name, snippet, time); the
     fab_hangouts_primary_color FAB (quantum_ic_add_white_24) for fab_new_conversation.
   - The drawer: the account, Invites, Archived, Snooze notifications, Settings, Help & feedback.
   - A conversation: the toolbar with video_call_title / voice_call_title actions; message_list_item_view.xml bubbles
     (incoming_conversation_bubble_background white with the avatar, outgoing_conversation_bubble_background
     quantum_bluegrey100 #cfd8dc) on quantum_bluegrey50; the compose bar "Send Hangouts message" with ic_send_green_24. */
(() => {
  'use strict';
  const T = () => MM.text('hangouts'), P = () => MM.people;
  const A = n => `assets/ho-${n}.png`;
  const H = 36e5;
  MM.defaults.hangouts = [{id: 1, contact: 2, messages: [{id: 1, mine: false, text: 'The photos from the hike are up!', time: Date.now() - 26 * H}, {id: 2, mine: true, text: 'They look amazing 😀', time: Date.now() - 25.8 * H}]}];
  const chats = c => c.data.hangouts || (c.data.hangouts = JSON.parse(JSON.stringify(MM.defaults.hangouts)));
  const ui = c => c.ui.hangouts || (c.ui.hangouts = {chat: 0, drawer: false, draft: {}, pick: false});
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
    const t = T(), u = ui(c), items = chats(c).filter(x => x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);
    const drawer = u.drawer ? `<div class="mmho-scrim" data-action="mmho-drawer"></div><div class="mmho-drawer"><div class="mmho-dhead"><img src="assets/gm-avatar_placeholder.png" alt=""><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div>
      ${['menu_invites', 'menu_archived_conversations', 'dnd_menu_item', 'home_menu_settings', 'help_feedback_menu_item_text'].map(k => `<button type="button" class="mmho-di" data-action="mmho-missing">${esc(c, t.t(k))}</button>`).join('')}</div>` : '';
    const pick = u.pick ? `<div class="mmho-scrim" data-action="mmho-pick"></div><div class="mmho-sheet">${P().sorted(c).map(p => `<button type="button" class="mmho-prow" data-action="mmho-start" data-id="${p.id}">${P().tile(c, p, 'mmho-av')}<span>${esc(c, p.name)}</span></button>`).join('')}</div>` : '';
    return `<div class="mmho"><div class="mmho-bar"><button type="button" class="mmho-hb" data-action="mmho-drawer"><i></i><i></i><i></i></button><span class="mmho-title">${esc(c, t.t('app_name'))}</span><button type="button" class="mmho-btn" data-action="mmho-missing"><img class="inv" src="${A('quantum_ic_search_black_24')}" alt=""></button></div>
      <div class="mmho-page">${items.map(x => { const p = P().byId(c, x.contact), last = x.messages.at(-1); return `<button type="button" class="mmho-row" data-action="mmho-open" data-id="${x.id}">${P().tile(c, p, 'mmho-av')}<span class="mmho-rtext"><b>${esc(c, p.name)}</b><small>${esc(c, last.text)}</small></span><span class="mmho-time">${esc(c, when(c, last.time))}</span></button>`; }).join('')}</div>
      <button type="button" class="mmho-fab" data-action="mmho-pick" aria-label="${esc(c, t.t('fab_new_conversation'))}"><img src="${A('quantum_ic_add_white_24')}" alt=""></button>${pick}${drawer}</div>`;
  }
  function chat(c, x) {
    const t = T(), u = ui(c), p = P().byId(c, x.contact), draft = u.draft[x.id] || '';
    return `<div class="mmho mmho-chat"><div class="mmho-bar"><button type="button" class="mmho-btn" data-action="mmho-up"><img src="assets/gm-ic_arrow_back_wht_24dp.png" alt=""></button><span class="mmho-title">${esc(c, p.name)}</span>
      <button type="button" class="mmho-btn" data-action="mmho-missing" aria-label="${esc(c, t.t('video_call_title'))}"><img src="${A('quantum_ic_videocam_white_24')}" alt=""></button><button type="button" class="mmho-btn" data-action="mmho-missing" aria-label="${esc(c, t.t('voice_call_title'))}"><img src="${A('ic_call_white_32')}" alt=""></button></div>
      <div class="mmho-page mmho-msgs">${x.messages.map(m => `<div class="mmho-msg ${m.mine ? 'out' : 'in'}">${m.mine ? '' : P().tile(c, p, 'mmho-mav')}<div class="mmho-bubble"><span>${esc(c, m.text)}</span><small>${esc(c, when(c, m.time))}</small></div></div>`).join('')}</div>
      <div class="mmho-compose"><textarea class="mmho-field" rows="1" placeholder="${esc(c, t.t('realtimechat_message_text_hint'))}">${esc(c, draft)}</textarea><button type="button" class="mmho-send" data-action="mmho-send" aria-label="${esc(c, t.t('realtimechat_send_button_description'))}"><img src="${A(draft.trim() ? 'ic_send_green_24' : 'ic_send_grey_24')}" alt=""></button></div></div>`;
  }
  // ShareIntentActivity: the shared text waits for the conversation picked from the list (or started), as its draft.
  function render(c) {
    const u = ui(c);
    if (c.ui.sub?.startsWith('chat:')) { const id = +c.ui.sub.slice(5); c.ui.sub = ''; if (chats(c).some(y => y.id === id)) { u.chat = id; u.drawer = u.pick = false; } }
    if (c.ui.sub === 'share') { c.ui.sub = ''; const d = MM.shareTake(c); u.share = d?.text || ''; u.chat = 0; u.drawer = u.pick = false; }
    if (u.chat && u.share) { u.draft[u.chat] = u.share; u.share = ''; }
    const x = chats(c).find(y => y.id === u.chat); return x ? chat(c, x) : list(c);
  }
  MM.register('hangouts', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('hangouts', c.ui.hangouts?.chat ? 'chat' : ''),
    statusColor: () => '#0b8043',
    render,
    mount(c, root) {
      const msgs = root.querySelector('.mmho-msgs'); if (msgs) msgs.scrollTop = msgs.scrollHeight;
      const f = root.querySelector('.mmho-field');
      if (f) { const u = ui(c), img = root.querySelector('.mmho-send img'); f.addEventListener('input', () => { u.draft[u.chat] = f.value; img.src = A(f.value.trim() ? 'ic_send_green_24' : 'ic_send_grey_24'); }); f.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); root.querySelector('.mmho-send').click(); } }); }
    },
    back(c) { const u = ui(c); if (u.drawer || u.pick) { u.drawer = u.pick = false; c.render(); return true; } if (u.chat) { u.chat = 0; c.render(); return true; } return false; },
    action(name, el, event, c) {
      const u = ui(c);
      switch (name) {
        case 'mmho-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmho-pick': u.pick = !u.pick; c.render(); return true;
        case 'mmho-open': u.chat = +el.dataset.id; c.render(); return true;
        case 'mmho-start': { const id = +el.dataset.id, all = chats(c); let x = all.find(y => y.contact === id); if (!x) { x = {id: Math.max(0, ...all.map(y => y.id)) + 1, contact: id, messages: []}; all.push(x); c.save(); } u.pick = false; u.chat = x.id; c.render(); return true; }
        case 'mmho-up': u.chat = 0; c.render(); return true;
        case 'mmho-send': {
          const x = chats(c).find(y => y.id === u.chat), text = (u.draft[u.chat] || '').trim(); if (!text) return true;
          x.messages.push({id: Date.now(), mine: true, text, time: Date.now()}); u.draft[u.chat] = ''; c.save(); c.render();
          // The other side answers once (mm-notify.js), posted with stat_notify_hangout unless the chat is open.
          const who = MM.people?.byId(c, x.contact);
          if (who && MM.notifications) MM.notifications.answer(c, 'hangouts', x.id, c => {
            const answer = MM.text('hangouts').t(`sim_reply_${who.id % 2 + 1}`), open = c.ui.view === 'hangouts' && ui(c).chat === x.id;
            x.messages.push({id: Date.now(), mine: false, text: answer, time: Date.now()}); c.save();
            if (open) { c.render(); return; }
            MM.notify(c, {app: 'hangouts', icon: 'assets/ho-stat_notify_hangout.png', title: who.name, text: answer, person: who.id, open: ['hangouts', `chat:${x.id}`]});
          });
          return true;
        }
        case 'mmho-missing': u.drawer = false; c.open('missing-hangouts-feature'); return true;
      }
      return false;
    }
  });
})();
