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
     colour, the 42 dp icon, the 16 sp #4d4d4d name, the 14 sp #999999 number and type); a typed number offers "Send to". */
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
    .map(x => ({id: x.id, name: nameOf(c, x.number), avatar: avatar(c, x.number, 'mmwg-ms-av'), when: when(c, x.messages.at(-1).time, true), text: x.messages.at(-1).text, unread: !x.read}));
  const threadFor = (c, number) => threads(c).find(x => P().same(x.number, number));

  // ---- conversation list ------------------------------------------------------------------------------------------
  function list(c) {
    const t = T(), u = ui(c), searching = u.search !== null, q = (u.search || '').trim().toLowerCase();
    let items = threads(c).filter(x => !x.archived && x.messages.length).sort((a, b) => b.messages.at(-1).time - a.messages.at(-1).time);
    if (searching && q) items = items.filter(x => nameOf(c, x.number).toLowerCase().includes(q) || x.messages.some(m => m.text.toLowerCase().includes(q)));
    const bar = searching
      ? `<div class="mmms-bar search"><button type="button" class="mmms-btn" data-action="mmms-sback"><img src="${A('ic_arrow_back_light')}" alt=""></button><input type="text" class="mmms-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off" spellcheck="false"></div>`
      : `<div class="mmms-bar"><span class="mmms-title">${esc(c, t.t('app_name'))}</span><button type="button" class="mmms-btn" data-action="mmms-search" aria-label="${esc(c, t.t('action_search'))}"><img src="${A('ic_search_light')}" alt=""></button>${MM.menu.button(c, 'mmms-over')}</div>`;
    const rows = items.map(x => {
      const last = x.messages.at(-1), unread = !x.read;
      return `<button type="button" class="mmms-conv${unread ? ' unread' : ''}" data-action="mmms-open" data-id="${x.id}">${avatar(c, x.number, 'mmms-icon')}
        <span class="mmms-ctext"><b>${esc(c, nameOf(c, x.number))}</b><span class="mmms-snip">${last.mine ? esc(c, t.t('conversation_list_item_view_sent_from_you_prefix')) : ''}${esc(c, last.text)}</span><span class="mmms-time">${esc(c, last.status === 'sending' ? t.t('message_status_sending') : when(c, last.time, true))}</span></span></button>`;
    }).join('');
    const empty = !items.length && !searching ? `<div class="mmms-empty">${esc(c, t.t('conversation_list_empty_text'))}</div>` : '';
    return `<div class="mmms">${bar}<div class="mmms-page mmms-list">${rows}${empty}</div>${searching ? '' : `<button type="button" class="mmms-fab" data-action="mmms-new" aria-label="${esc(c, t.t('start_new_conversation'))}"><img src="${A('ic_add_white')}" alt=""></button>`}</div>`;
  }

  // ---- conversation ----------------------------------------------------------------------------------------------
  function conversation(c, x) {
    const t = T(), u = ui(c), [color] = colorOf(c, x.number), draft = u.draft[x.id] || '';
    let prev = null;
    const msgs = x.messages.map(m => {
      const gap = prev && prev.mine === m.mine ? 'same' : ''; prev = m;
      const status = m.status === 'sending' ? t.t('message_status_sending') : when(c, m.time, false);
      return `<div class="mmms-msg ${m.mine ? 'out' : 'in'} ${gap}">${m.mine ? '' : avatar(c, x.number, 'mmms-micon')}<div class="mmms-bubble" ${m.mine ? '' : `style="background-color:${color}"`}><span class="mmms-mtext">${esc(c, m.text)}</span><span class="mmms-mmeta">${esc(c, status)}</span></div></div>`;
    }).join('');
    return `<div class="mmms mmms-conv-screen" style="--pal:${color}"><div class="mmms-bar" style="background:${color}"><button type="button" class="mmms-btn" data-action="mmms-up"><img src="${A('ic_arrow_back_light')}" alt=""></button><span class="mmms-title in">${esc(c, nameOf(c, x.number))}</span>
      <button type="button" class="mmms-btn" data-action="mmms-call" aria-label="${esc(c, t.t('action_call'))}"><img src="${A('ic_phone_small_light')}" alt=""></button>${MM.menu.button(c, 'mmms-over')}</div>
      <div class="mmms-page mmms-msgs">${msgs}</div>
      <div class="mmms-compose"><button type="button" class="mmms-attach" data-action="mmms-attach"><img src="${A('ic_attachment_dark')}" alt=""></button>
        <div class="mmms-input"><textarea class="mmms-field" rows="1" placeholder="${esc(c, t.t('compose_message_view_hint_text'))}">${esc(c, draft)}</textarea><button type="button" class="mmms-emoji" data-action="mmms-emoji"><img src="${A('ic_emoji_dark')}" alt=""></button></div>
        <button type="button" class="mmms-send" data-action="mmms-send" aria-label="${esc(c, t.t('sendButtonContentDescription'))}"${draft.trim() ? '' : ' disabled'}><img src="${A('ic_send_light')}" alt=""></button></div></div>`;
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
    const u = ui(c), text = (u.draft[x.id] || '').trim(); if (!text) return;
    const id = Math.max(0, ...threads(c).flatMap(y => y.messages.map(m => m.id))) + 1;
    const m = {id, mine: true, text, time: Date.now(), status: 'sending'};
    x.messages.push(m); u.draft[x.id] = ''; c.save(); c.render();
    setTimeout(() => { delete m.status; m.time = Date.now(); c.save(); if (c.ui.view === 'messenger') c.render(); }, 1200);
  }

  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = ''; u.search = null;
    // ShareIntentActivity: the shared text becomes the draft of the conversation picked next.
    if (sub === 'share') { const d = MM.shareTake(c); u.share = d?.text || ''; u.screen = ''; return; }
    if (sub.startsWith('to:')) { const n = sub.slice(3); if (n) { openThread(c, n); u.external = true; } else { u.screen = 'pick'; u.to = ''; } }
  }
  function render(c) {
    consume(c);
    const u = ui(c);
    if (u.screen === 'pick') return picker(c);
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
      items.push({label: t.t('action_people_and_options'), action: c => c.open('missing-people-options')},
        {label: t.t('action_archive'), action: c => { x.archived = true; c.save(); u.screen = ''; c.toast(t.fmt('archived_toast_message', null, 1), false); c.render(); }},
        {label: t.t('action_delete'), action: c => c.dialog({title: t.plural('delete_conversations_confirmation_dialog_title', 1), buttons: [{label: t.t('delete_conversation_decline_button')}, {label: t.t('delete_conversation_confirmation_button'), action: c => { c.data.sms = threads(c).filter(y => y !== x); c.save(); u.screen = ''; c.render(); }}]})},
        {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')});
      return c.menu(items);
    }
    c.menu([{label: t.t('action_menu_show_archived'), action: c => c.open('missing-archived')}, {label: t.t('blocked_contacts_title'), action: c => c.open('missing-blocked')}, {label: t.t('action_settings'), action: c => MM.openPrefs(c, 'messenger', 'preferences_application')}, {label: t.t('action_help_and_feedback'), action: c => c.open('help', 'messenger')}]);
  }

  MM.register('messenger', {
    statusColor: c => { const u = ui(c); if (u.screen.startsWith('conv:')) { const x = thread(c, u.screen.slice(5)); if (x) return colorOf(c, x.number)[1]; } return '#026da7'; },
    render, mount,
    back(c) {
      const u = ui(c);
      if (u.screen && u.external) { u.external = false; u.screen = ''; return false; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c);
      switch (name) {
        case 'mmms-open': { const x = thread(c, el.dataset.id); x.read = true; c.save(); u.screen = `conv:${x.id}`; if (u.share) { u.draft[x.id] = u.share; u.share = ''; } c.render(); return true; }
        case 'mmms-up': if (u.external) { u.external = false; u.screen = ''; c.back(); return true; } u.screen = ''; c.render(); return true;
        case 'mmms-new': u.screen = 'pick'; u.to = ''; c.render(); return true;
        case 'mmms-ptab': u.pickTab = +el.dataset.tab; c.render(); return true;
        case 'mmms-pick': openThread(c, el.dataset.n); c.render(); return true;
        case 'mmms-search': u.search = ''; c.render(); return true;
        case 'mmms-sback': u.search = null; c.render(); return true;
        case 'mmms-send': send(c, thread(c, u.screen.slice(5))); return true;
        case 'mmms-call': MM.phone?.call(c, thread(c, u.screen.slice(5)).number); return true;
        case 'mmms-attach': c.open('missing-attachments'); return true;
        case 'mmms-emoji': c.open('missing-emoji'); return true;
        case 'mm-menu': menu(c); return true;
      }
      return false;
    }
  });
})();
