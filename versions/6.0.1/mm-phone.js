/* Android 6.0.1 Phone (Google Dialer 2.21, priv-app/GoogleDialer of MTC20K), the app 'phone'.
   - DialtactsActivity (dialtacts_activity.xml, DialtactsTheme: dialer_theme_color #0288d1, the status bar #0277bd):
     the 64 dp action bar holding search_edittext.xml (an 8 dp inset white card, 3 dp elevation: ic_ab_search, the
     "Search contacts & places" hint at 14 sp #737373 22 dp in, ic_voice_search and the overflow, 28 dp icons tinted
     #a4a4a4), lists_fragment.xml's 43 dp ViewPagerTabs (ListsFragment's tab_speed_dial / tab_recents / tab_contacts:
     ic_grade / ic_schedule / ic_people, the 2 dp white underline of ViewPagerTabStrip), the pager and the 56 dp fab_blue
     FAB (fab_ic_dial; on the Contacts tab ic_person_add_24dp, which adds a contact).
   - Speed dial (speed_dial_fragment.xml): PhoneFavoriteSquareTileView tiles in 2 columns, height 76 % of the width,
     1 dp dividers: the photo or the square letter tile (letter at 70 % scale, 12 % up), shadow_contact_photo over the
     lower 40 %, the 15 sp medium white name with ic_star for a starred contact, the ⋮ (ic_more_vert_24dp) to the contact.
     Starred contacts come first, then the frequently called; empty: empty_speed_dial and speed_dial_empty.
   - Recents (call_log_fragment.xml, CallLogAdapter): CallLogGroupBuilder's groups (consecutive calls of a number in the
     same day group) under the Today / Yesterday / Older labels (14 sp medium #636363, 15 / 9 dp), each a CardView
     (2 dp corners, 4 dp margin) with the 40 dp round letter tile, the 14 sp name and, under it, CallTypeIconsView's
     ic_call_arrow (answered #00c853, outgoing turned 180°, missed #ff2e58; at most 3) then "(n) " for more than 3, the
     number's type label or the number and DateUtils' relative time; ic_call_24dp (#b3000000) calls back. Tapping a row
     expands call_log_list_item_actions.xml (44 dp rows: 24 dp icon at 16 dp, 12 sp medium #636363 text): Create new
     contact and Add to a contact for an unknown number, Send Message, Call details.
   - Contacts (all_contacts_fragment.xml): ContactListItemView rows with the 48 dp section letter (20 sp medium #888888),
     the 40 dp photo 15 dp before the 16 sp #333333 name; empty: empty_contacts and all_contacts_empty.
   - The dialpad (dialpad_fragment.xml → dialpad_view_unthemed.xml, Dialpad_Light): shadow_fade_up, then on #fcfcfc
     the 60 dp digits row (overflow, the 34 sp #333333 DigitsEditText shrinking to 24 sp, ic_dialpad_delete tinted
     #b3b3b3), a 1 dp #e3e3e3 line, 14 dp, the four 64 dp key rows (36 sp light numbers in the theme colour, 12 sp
     #737373 letters, the 1 key's voicemail icon, * and # in #737373 at 80 %), the 65 dp bottom space the green call FAB
     (fab_green, fab_ic_call) sits in. While it is up the action bar and the tabs slide away and SmartDial's matches
     (names by their keypad letters, numbers by digits) list behind it with the search shortcuts.
   - Search (search_bar_expanded.xml): the card opens to the back arrow in the theme colour, a 20 sp field and
     ic_close_dk; RegularSearchFragment lists the matching contacts, then Call / Create new contact / Add to a contact /
     Send SMS for a number.
   - The overflow (dialtacts_options.xml, OptionsPopupMenu.show): Call History, Import/export, Clear frequents (only
     with frequents), New contact, Settings. CallLogActivity: the 56 dp action bar "Call History" with All / Missed tabs;
     CallDetailActivity (call_detail.xml): the white caller_information strip (36 / 32 dp), "Calls list" and
     CallDetailHistoryAdapter's rows (type, formatDateRange(…, 23), "%s min %s sec"), Delete from call history.
   - InCallUI (incall_screen.xml, call_card_fragment.xml, primary_call_info.xml): the #0288d1 banner (5 dp elevation,
     16 dp top, 24 dp sides) with the 16 sp call state at 70 % (Dialing, On hold, Call ended), the 34 dp light name, the
     16 sp #ccffffff "Mobile (202) 555-0148" with the elapsed time at the end, call_button_fragment.xml's 48 dp buttons
     (6 / 8 dp margins: Audio, Mute, Dialpad, Hold, Add call; #b3ffffff icons, white on a #0277bd disc when on), then
     img_no_image on white and the 72 dp fab_red end-call button 8 dp from the bottom. No telephony is used: a call
     connects after a moment and is written to the call log when it ends. */
(() => {
  'use strict';
  const T = () => MM.text('phone'), P = () => MM.people;
  const A = n => `assets/gd-${n}.png`;
  const KEYS = [['1', ''], ['2', 'dialpad_2_letters'], ['3', 'dialpad_3_letters'], ['4', 'dialpad_4_letters'], ['5', 'dialpad_5_letters'], ['6', 'dialpad_6_letters'],
    ['7', 'dialpad_7_letters'], ['8', 'dialpad_8_letters'], ['9', 'dialpad_9_letters'], ['*', ''], ['0', 'dialpad_0_letters'], ['#', '']];
  const T9 = {a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, g: 4, h: 4, i: 4, j: 5, k: 5, l: 5, m: 6, n: 6, o: 6, p: 7, q: 7, r: 7, s: 7, t: 8, u: 8, v: 8, w: 9, x: 9, y: 9, z: 9};
  const ui = c => c.ui.phone || (c.ui.phone = {tab: 0, dialpad: false, digits: '', search: null, expanded: null, screen: '', historyTab: 0});
  const call = c => c.ui.call;
  const esc = (c, s) => c.safe(s);

  // ---- data ----------------------------------------------------------------------------------------------------
  const dayGroup = (time, now = new Date()) => {
    const d = new Date(time), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return time >= start ? 0 : time >= start - 864e5 ? 1 : 2;
  };
  // CallLogGroupBuilder: newest first; a group is consecutive calls of one number in one day group.
  function groups(c, filter = null) {
    const calls = [...P().calls(c)].filter(x => !filter || filter(x)).sort((a, b) => b.time - a.time), out = [];
    for (const x of calls) {
      const last = out.at(-1), g = dayGroup(x.time);
      if (last && P().same(last.number, x.number) && last.day === g) last.calls.push(x);
      else out.push({key: x.id, number: x.number, day: g, calls: [x]});
    }
    return out;
  }
  function frequents(c) {
    const since = c.data.frequentsCleared || 0, counts = new Map();
    for (const x of P().calls(c)) if (x.time > since && x.type !== 'missed') { const p = P().byNumber(c, x.number); if (p && !p.starred) counts.set(p.id, (counts.get(p.id) || 0) + 1); }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => P().byId(c, id));
  }
  const nameKeys = name => name.toLowerCase().split(/\s+/).map(w => [...w].map(ch => T9[ch] ?? (/[0-9]/.test(ch) ? ch : '')).join(''));
  function smartMatches(c, d) {
    if (!d) return [];
    return P().sorted(c).filter(p => nameKeys(p.name).some(k => k.startsWith(d)) || P().digits(p.phone).startsWith(d));
  }
  function searchMatches(c, q) {
    q = (q || '').trim().toLowerCase(); if (!q) return [];
    const d = q.replace(/[^0-9]/g, '');
    return P().sorted(c).filter(p => p.name.toLowerCase().split(/\s+/).some(w => w.startsWith(q)) || p.name.toLowerCase().startsWith(q) || (d && P().digits(p.phone).includes(d)));
  }

  // ---- pieces ----------------------------------------------------------------------------------------------------
  const arrow = type => `<i class="mmph-arrow ${type}" aria-hidden="true"></i>`;
  const icon = (n, cls = '') => `<i class="mmph-ic ${cls}" style="--ic:url('${A(n)}')" aria-hidden="true"></i>`;
  function dialpadKeys(c, action) {
    const t = T(), rows = [KEYS.slice(0, 3), KEYS.slice(3, 6), KEYS.slice(6, 9), KEYS.slice(9)];
    return `<div class="mmph-keys">${rows.map(r => `<div class="mmph-krow"><i></i>${r.map(([k, l]) => {
      const sym = k === '*' || k === '#';
      const sub = k === '1' ? `<img class="mmph-vm" src="${A('ic_dialpad_voicemail')}" alt="">` : l ? `<small>${esc(c, t.t(l))}</small>` : '';
      return `<button type="button" class="mmph-key${sym ? ' sym' : ''}${k === '#' ? ' pound' : ''}${k === '0' ? ' zero' : ''}" data-action="${action}" data-k="${k}"><b>${k}</b>${sub}</button>`;
    }).join('')}<i></i></div>`).join('')}</div>`;
  }
  function digitsRow(c, value, del) {
    const t = T(), len = value.length, size = Math.max(24, Math.min(34, 34 - Math.max(0, len - 13) * 1.6));
    return `<div class="mmph-digits"><button type="button" class="mmph-dpmenu${value ? '' : ' hide'}" data-action="mm-menu" aria-label="${esc(c, t.t('description_dialpad_overflow'))}">${icon('ic_overflow_menu')}</button><output style="font-size:calc(${size.toFixed(1)} * var(--dp))">${esc(c, value)}</output>
      <button type="button" class="mmph-del" data-action="${del}" aria-label="${esc(c, t.t('description_delete_button'))}">${icon('ic_dialpad_delete')}</button></div><i class="mmph-dline"></i>`;
  }
  function personRow(c, p, extra = '') {
    return `<button type="button" class="mmph-crow" data-action="mmph-contact" data-id="${p.id}">${P().tile(c, p, 'mmph-photo')}<span class="mmph-cname">${esc(c, p.name)}${extra}</span></button>`;
  }
  function shortcuts(c, number) {
    const t = T(), n = P().format(number), list = [];
    list.push(['ic_call_24dp', AndroidStrings.format(t.t('search_shortcut_call_number'), n), 'mmph-dial']);
    if (!P().byNumber(c, number)) list.push(['ic_person_add_24dp', t.t('search_shortcut_create_new_contact'), 'mmph-newcontact'], ['ic_person_24dp', t.t('search_shortcut_add_to_contact'), 'mmph-addto']);
    list.push(['ic_message_24dp', t.t('search_shortcut_send_sms_message'), 'mmph-sms']);
    return list.map(([ic, label, action]) => `<button type="button" class="mmph-crow mmph-short" data-action="${action}" data-n="${esc(c, number)}">${icon(ic, 'mmph-shic')}<span class="mmph-cname">${esc(c, label)}</span></button>`).join('');
  }
  function empty(c, img, msg, action = '', actionName = '') {
    return `<div class="mmph-empty"><img src="${A(img)}" alt=""><p>${esc(c, msg)}</p>${action ? `<button type="button" data-action="${actionName}">${esc(c, action)}</button>` : ''}<i></i></div>`;
  }

  // ---- pages ----------------------------------------------------------------------------------------------------
  function speedDial(c) {
    const t = T(), list = [...P().sorted(c).filter(p => p.starred), ...frequents(c)];
    if (!list.length) return empty(c, 'empty_speed_dial', t.t('speed_dial_empty'), t.t('speed_dial_empty_add_favorite_action'), 'mmph-addfav');
    return `<div class="mmph-tiles">${list.map(p => `<div class="mmph-tile"><button type="button" class="mmph-tilebtn" data-action="mmph-call" data-n="${esc(c, p.phone)}">${P().tile(c, p, 'mmph-tileimg', false)}<i class="mmph-shade"></i>
      <span class="mmph-tname"><b>${esc(c, p.name)}</b>${p.starred ? `<img src="${A('ic_star')}" alt="">` : ''}</span></button>
      <button type="button" class="mmph-tmore" data-action="mmph-contact" data-id="${p.id}" aria-label="${esc(c, t.t('description_view_contact_detail'))}"><img src="${A('ic_more_vert_24dp')}" alt=""></button></div>`).join('')}</div>`;
  }
  function callRow(c, g, u) {
    const t = T(), p = P().byNumber(c, g.number), types = g.calls.slice(0, 3).map(x => arrow(x.type)).join('');
    const parts = [p ? P().typeLabel() : '', P().relative(c, g.calls[0].time)].filter(Boolean);
    let line = parts.join(t.t('list_delimeter'));
    if (g.calls.length > 3) line = AndroidStrings.format(t.t('call_log_item_count_and_date'), g.calls.length, line);
    const open = u.expanded === g.key;
    const act = (ic, label, action) => `<button type="button" class="mmph-act" data-action="${action}" data-n="${esc(c, g.number)}" data-key="${g.key}">${icon(ic)}<span>${esc(c, label)}</span></button>`;
    const actions = open ? `<div class="mmph-acts"><i class="mmph-adiv"></i>${p ? '' : act('ic_person_add_24dp', t.t('search_shortcut_create_new_contact'), 'mmph-newcontact') + act('ic_person_24dp', t.t('search_shortcut_add_to_contact'), 'mmph-addto')}${act('ic_message_24dp', t.t('call_log_action_send_message'), 'mmph-sms')}${act('ic_info_outline_24dp', t.t('call_log_action_details'), 'mmph-details')}</div>` : '';
    return `<div class="mmph-card${open ? ' open' : ''}"><div class="mmph-row" data-action="mmph-expand" data-key="${g.key}">${P().tile(c, p || {name: ''}, 'mmph-photo')}
      <span class="mmph-info"><b>${esc(c, p ? p.name : P().format(g.number))}</b><span class="mmph-line">${types}<span>${esc(c, line)}</span></span></span>
      <button type="button" class="mmph-callback" data-action="mmph-call" data-n="${esc(c, g.number)}" aria-label="${esc(c, t.t('call_log_action_call').replace('^1', p ? p.name : g.number))}">${icon('ic_call_24dp')}</button></div>${actions}</div>`;
  }
  function recents(c, filter = null, emptyMsg = 'recentCalls_empty') {
    const t = T(), u = ui(c), list = groups(c, filter);
    if (!list.length) return empty(c, 'empty_call_log', t.t(emptyMsg));
    let day = -1, out = '';
    for (const g of list) {
      if (g.day !== day) { day = g.day; out += `<div class="mmph-day">${esc(c, t.t(['call_log_header_today', 'call_log_header_yesterday', 'call_log_header_other'][day]))}</div>`; }
      out += callRow(c, g, u);
    }
    return `<div class="mmph-log">${out}</div>`;
  }
  function contacts(c) {
    const t = T(), list = P().sorted(c);
    if (!list.length) return empty(c, 'empty_contacts', t.t('all_contacts_empty'), t.t('all_contacts_empty_add_contact_action'), 'mmph-newcontact');
    let letter = '';
    return `<div class="mmph-clist">${list.map(p => { const l = p.name.charAt(0).toLocaleUpperCase(c.locale()); const head = l !== letter ? (letter = l) : ''; return `<div class="mmph-citem"><span class="mmph-sec">${esc(c, head)}</span>${personRow(c, p)}</div>`; }).join('')}</div>`;
  }

  // ---- screens ----------------------------------------------------------------------------------------------------
  function main(c) {
    const t = T(), u = ui(c), tabs = [['ic_grade_24dp', 'tab_speed_dial'], ['ic_schedule_24dp', 'tab_recents'], ['ic_people_24dp', 'tab_all_contacts']];
    const searching = u.search !== null;
    const bar = searching
      ? `<div class="mmph-ab exp"><div class="mmph-search exp"><button type="button" class="mmph-sback" data-action="mmph-sback" aria-label="${esc(c, t.t('action_menu_back_from_search'))}"><i class="mmph-ic" style="--ic:url('${A('ic_arrow_back_24dp')}')"></i></button>
          <input type="text" class="mmph-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('dialer_hint_find_contact'))}" autocomplete="off" spellcheck="false">
          ${u.search ? `<button type="button" class="mmph-sclear" data-action="mmph-sclear" aria-label="${esc(c, t.t('description_clear_search'))}">${icon('ic_close_dk')}</button>` : ''}</div></div>`
      : `<div class="mmph-ab${u.dialpad ? ' up' : ''}"><div class="mmph-search"><button type="button" class="mmph-sbox" data-action="mmph-search">${icon('ic_ab_search', 'mmph-mag')}<span>${esc(c, t.t('dialer_hint_find_contact'))}</span></button>
          <button type="button" class="mmph-sicon" data-action="mmph-voice" aria-label="${esc(c, t.t('description_start_voice_search'))}">${icon('ic_voice_search')}</button>
          <button type="button" class="mmph-sicon" data-action="mm-menu" aria-label="${esc(c, t.t('action_menu_overflow_description'))}">${icon('ic_overflow_menu')}</button></div></div>`;
    const tabBar = `<div class="mmph-tabs${u.dialpad || searching ? ' up' : ''}" role="tablist">${tabs.map(([ic, label], i) => `<button type="button" role="tab" aria-selected="${u.tab === i}" data-action="mmph-tab" data-tab="${i}" aria-label="${esc(c, t.t(label))}"><img src="${A(ic)}" alt=""></button>`).join('')}<i class="mmph-under" style="transform:translateX(${u.tab * 100}%)"></i></div>`;
    let body;
    if (u.dialpad) body = `<div class="mmph-results">${smartMatches(c, P().digits(u.digits)).map(p => personRow(c, p, `<small>${esc(c, P().format(p.phone))}</small>`)).join('')}${u.digits ? shortcuts(c, u.digits) : ''}</div>`;
    else if (searching) { const q = u.search.trim(), num = /^[0-9+*#() -]+$/.test(q) && /\d/.test(q); body = `<div class="mmph-results">${searchMatches(c, q).map(p => personRow(c, p, `<small>${esc(c, P().typeLabel())} ${esc(c, P().format(p.phone))}</small>`)).join('')}${num ? shortcuts(c, q) : ''}</div>`; }
    else body = `<div class="mmph-pager"><div class="mmph-page">${[speedDial, recents, contacts][u.tab](c)}</div></div>`;
    const fab = u.dialpad || searching ? '' : `<button type="button" class="mmph-fab" data-action="mmph-fab" aria-label="${esc(c, t.t(u.tab === 2 ? 'search_shortcut_create_new_contact' : 'action_menu_dialpad_button'))}"><img${u.tab === 2 ? ' class="small"' : ''} src="${A(u.tab === 2 ? 'ic_person_add_24dp' : 'fab_ic_dial')}" alt=""></button>`;
    const pad = u.dialpad ? `<div class="mmph-dialpad"><i class="mmph-fade"></i><div class="mmph-dpview">${digitsRow(c, P().typing(u.digits), 'mmph-del')}<i class="mmph-dspace"></i>${dialpadKeys(c, 'mmph-key')}<i class="mmph-bottom"></i></div>
      <button type="button" class="mmph-fab green" data-action="mmph-dialcall" aria-label="${esc(c, t.t('description_dial_button'))}"><img src="${A('fab_ic_call')}" alt=""></button></div>` : '';
    // During Add call, the way back to the call in progress (dialer_returnToInCallScreen) heads the dialer.
    const back = u.addCall && call(c) ? `<button type="button" class="mmph-returncall" data-action="mmph-return">${esc(c, t.t('dialer_returnToInCallScreen'))}</button>` : '';
    return `<div class="mmph${u.dialpad ? ' dp' : ''}">${back}${bar}${tabBar}${body}${fab}${pad}</div>`;
  }
  function screenBar(c, title, actions = '') {
    return `<div class="mmph-bar"><button type="button" class="mmph-up" data-action="mmph-up" aria-label="${esc(c, MM.text('framework').t('action_menu_overflow_description'))}"><img src="${A('ic_arrow_back_24dp')}" alt=""></button><span>${esc(c, title)}</span>${actions}</div>`;
  }
  function history(c) {
    const t = T(), u = ui(c);
    const tabs = `<div class="mmph-tabs text" role="tablist">${['call_log_all_title', 'call_log_missed_title'].map((k, i) => `<button type="button" role="tab" aria-selected="${u.historyTab === i}" data-action="mmph-htab" data-tab="${i}">${esc(c, t.t(k))}</button>`).join('')}<i class="mmph-under half" style="transform:translateX(${u.historyTab * 100}%)"></i></div>`;
    const page = u.historyTab ? recents(c, x => x.type === 'missed', 'recentMissed_empty') : recents(c);
    return `<div class="mmph flat">${screenBar(c, t.t('action_menu_call_history_description'))}${tabs}<div class="mmph-pager"><div class="mmph-page">${page}</div></div></div>`;
  }
  function details(c, key) {
    const t = T(), g = groups(c).find(x => String(x.key) === String(key));
    if (!g) return history(c);
    const p = P().byNumber(c, g.number), loc = c.locale();
    const typeText = {incoming: 'type_incoming', outgoing: 'type_outgoing', missed: 'type_missed'};
    const dur = s => s < 60 ? AndroidStrings.format(t.t('callDetailsShortDurationFormat'), s) : AndroidStrings.format(t.t('callDetailsDurationFormat'), Math.floor(s / 60), s % 60);
    // formatDateRange(…, SHOW_TIME | SHOW_WEEKDAY | SHOW_DATE | SHOW_YEAR): ICU 55's pattern generator joins the date and
    // the time with the locale's plain glue (", " in English), not the newer "at" wording.
    const date = x => new Intl.DateTimeFormat(loc, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}).formatToParts(new Date(x.time))
      .map((part, i, all) => part.type === 'literal' && /\p{L}/u.test(part.value) && all[i - 1]?.type === 'year' ? ', ' : part.value).join('');
    const del = `<button type="button" class="mmph-up" data-action="mmph-delcalls" data-key="${g.key}" aria-label="${esc(c, t.t('recentCalls_removeFromRecentList'))}"><img src="${A('ic_delete_24dp')}" alt=""></button>${MM.menu.button(c, 'mmph-barmenu')}`;
    return `<div class="mmph flat det">${screenBar(c, t.t('callDetailTitle'), del)}
      <div class="mmph-caller">${P().tile(c, p || {name: ''}, 'mmph-photo')}<span class="mmph-info"><b>${esc(c, p ? p.name : P().format(g.number))}</b>${p ? `<span>${esc(c, `${P().typeLabel()} ${P().format(g.number)}`)}</span>` : ''}</span>
        <button type="button" class="mmph-callback" data-action="mmph-call" data-n="${esc(c, g.number)}">${icon('ic_call_24dp')}</button></div>
      <div class="mmph-hist"><div class="mmph-hhead">${esc(c, t.t('call_detail_list_header'))}</div>${g.calls.map(x => `<div class="mmph-hitem"><span class="mmph-htype">${arrow(x.type)}<b>${esc(c, t.t(typeText[x.type]))}</b></span><span>${esc(c, date(x))}</span>${x.type === 'missed' ? '' : `<span>${esc(c, dur(x.duration))}</span>`}</div>`).join('')}</div></div>`;
  }

  // ---- in call ----------------------------------------------------------------------------------------------------
  const elapsed = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`; };
  const callSeconds = (k, now = Date.now()) => k.connected && now >= k.connected ? Math.floor(((k.ended || now) - k.connected) / 1000) : 0;
  function stateLabel(k, now = Date.now()) {
    const t = T();
    if (k.ended) return t.t('card_title_call_ended');
    if (now < k.connected) return t.t('card_title_dialing');
    if (k.hold) return t.t('card_title_on_hold');
    return '';
  }
  /* A second call (Add call: the first one goes on hold and the dialpad opens): secondary_call_info.xml's bar under the
     banner (the held call's name and "On hold", touch to swap); the buttons Swap (ic_toolbar_swap) and Merge calls
     (ic_toolbar_merge) take the places of Hold and Add call; merged, the banner shows "Conference call". When the
     active call ends, the held one comes back. */
  const held = c => c.ui.heldCall;
  const callName = (c, k) => { if (k.conf) return T().t('card_title_conf_call'); const p = P().byNumber(c, k.number); return p ? p.name : P().format(k.number); };
  function incall(c) {
    const t = T(), k = call(c), p = k.conf ? null : P().byNumber(c, k.number), now = Date.now(), live = !k.ended, h = held(c);
    const btn = (id, ic, label, toggle = true) => `<button type="button" class="mmph-cbtn${k[id] ? ' on' : ''}" data-action="${toggle ? 'mmph-ctoggle' : `mmph-${id}`}" data-id="${id}" aria-pressed="${!!k[id]}" aria-label="${esc(c, t.t(label))}"${live ? '' : ' disabled'}>${icon(ic)}</button>`;
    const second = h ? `<button type="button" class="mmph-second" data-action="mmph-swap"><b>${esc(c, callName(c, h))}</b><span>${esc(c, t.t('card_title_on_hold'))}</span></button>` : '';
    const pad = k.dialpad && live ? `<div class="mmph-incallpad">${digitsRow(c, k.dtmf, 'mmph-dtmfdel')}<i class="mmph-dspace"></i>${dialpadKeys(c, 'mmph-dtmf')}<i class="mmph-bottom"></i></div>` : '';
    return `<div class="mmph-incall"><div class="mmph-banner"><div class="mmph-primary"><span class="mmph-state">${esc(c, stateLabel(k, now))}</span><b class="mmph-cname">${esc(c, callName(c, k))}</b>
      <span class="mmph-sub">${p ? `<span>${esc(c, P().typeLabel())}</span><span class="num">${esc(c, P().format(k.number))}</span>` : '<span class="num"></span>'}<time>${now >= k.connected || k.ended ? elapsed(callSeconds(k, now)) : ''}</time></span></div>
      <div class="mmph-cbtns">${btn('speaker', 'ic_toolbar_speaker_on', 'onscreenAudioText')}${btn('mute', 'ic_toolbar_mic_off', 'onscreenMuteText')}${btn('dialpad', 'ic_toolbar_dialpad', 'onscreenShowDialpadText')}${h ? btn('swap', 'ic_toolbar_swap', 'onscreenSwapCallsText', false) : btn('hold', 'ic_toolbar_hold', 'onscreenHoldText_unselected')}${h ? btn('merge', 'ic_toolbar_merge', 'onscreenMergeCallsText', false) : btn('addcall', 'ic_toolbar_add_call', 'onscreenAddCallText', false)}</div></div>
      ${second}<div class="mmph-cphoto"><img src="${A('img_no_image')}" alt=""></div>${pad}
      <button type="button" class="mmph-end" data-action="mmph-hangup" aria-label="${esc(c, t.t('onscreenEndCallText'))}"${live ? '' : ' disabled'}><img src="${A('fab_ic_end_call')}" alt=""></button></div>`;
  }
  function begin(c, number) {
    c.ui.call = {number, started: Date.now(), connected: Date.now() + 2500, mute: false, speaker: false, hold: false, dialpad: false, dtmf: '', ended: 0};
    c.data.lastDialed = number; c.save();
    tickLoop(c);
  }
  function startCall(c, number) {
    number = String(number || '').trim(); if (!number) return;
    const u = ui(c), cur = call(c);
    u.dialpad = false; u.digits = ''; u.search = null; u.expanded = null; u.addCall = false;
    // A call placed while one is up (Add call): that one waits on hold.
    if (cur && !cur.ended) { cur.hold = true; c.ui.heldCall = cur; }
    begin(c, number);
    if (c.ui.view !== 'phone') c.open('phone'); else c.render();
  }
  function hangup(c) {
    const k = call(c); if (!k || k.ended) return;
    k.ended = Date.now(); c.render();
    for (const n of k.conf || [k.number]) P().log(c, {number: n, time: k.started, duration: callSeconds(k), type: 'outgoing'});
    setTimeout(() => {
      if (call(c) !== k) return;
      const h = held(c); c.ui.heldCall = null;
      if (h) { h.hold = false; c.ui.call = h; tickLoop(c); } else c.ui.call = null;
      if (c.ui.view === 'phone') c.render();
    }, 1500);
  }
  let ticker = 0;
  function tickLoop(c) {
    clearInterval(ticker);
    ticker = setInterval(() => {
      const k = call(c); if (!k) { clearInterval(ticker); return; }
      if (c.ui.view !== 'phone' || c.ui.overlay || k.ended) return;
      const root = c.el.viewport, now = Date.now();
      const st = root.querySelector('.mmph-state'), tm = root.querySelector('.mmph-sub time');
      if (st) st.textContent = stateLabel(k, now);
      if (tm) tm.textContent = now >= k.connected ? elapsed(callSeconds(k, now)) : '';
    }, 250);
  }

  // A screen opened with a sub: 'call:<number>' places the call, 'dial:<number>' opens the dialpad with it.
  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    u.opened = sub; c.ui.sub = '';
    if (sub.startsWith('call:')) { u.dialpad = false; u.digits = ''; u.search = null; u.screen = ''; begin(c, sub.slice(5)); }
    else if (sub.startsWith('dial:')) { u.screen = ''; u.search = null; u.dialpad = true; u.digits = P().digits(sub.slice(5)); }
  }
  function render(c) {
    consume(c);
    const u = ui(c);
    if (call(c) && !u.addCall) return incall(c);
    if (u.screen === 'history') return history(c);
    if (u.screen.startsWith('details:')) return details(c, u.screen.slice(8));
    return main(c);
  }
  function mount(c, root) {
    const u = ui(c), page = root.querySelector('.mmph-page, .mmph-results, .mmph-hist');
    if (page) { const key = `${u.screen}|${u.tab}|${u.historyTab}|${u.dialpad}|${u.search !== null}`; page.scrollTop = u.scroll?.[key] || 0; page.addEventListener('scroll', () => { (u.scroll ||= {})[key] = page.scrollTop; }, {passive: true}); }
    const input = root.querySelector('.mmph-sinput');
    if (input) {
      input.addEventListener('input', () => { ui(c).search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.mmph-sinput'); if (i2) { i2.focus(); i2.setSelectionRange(pos, pos); } });
      if (document.activeElement !== input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
    // Long-pressing 0 types +, and the delete key held clears the digits (DialpadFragment.onLongClick).
    root.querySelectorAll('.mmph-key.zero, .mmph-del').forEach(el => {
      let timer = 0;
      el.addEventListener('pointerdown', () => { timer = setTimeout(() => { timer = -1; const u = ui(c); if (el.classList.contains('zero')) u.digits += '+'; else u.digits = ''; c.render(); }, 600); });
      el.addEventListener('pointerup', e => { if (timer === -1) { e.preventDefault(); el.dataset.skip = '1'; } clearTimeout(timer); });
      el.addEventListener('pointerleave', () => clearTimeout(timer));
    });
  }
  function menu(c) {
    const t = T(), u = ui(c);
    if (u.screen.startsWith('details:')) {
      const g = groups(c).find(x => String(x.key) === u.screen.slice(8));
      return c.menu([{label: t.t('recentCalls_editNumberBeforeCall'), action: c => { const uu = ui(c); uu.screen = ''; uu.dialpad = true; uu.digits = P().digits(g?.number); c.render(); }}, {label: t.t('call_detail_menu_report'), action: c => c.dialog({title: t.t('report_google_caller_id_dialog_title'), message: P().format(g?.number || ''), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => c.toast(t.t('report_google_caller_id_toast'), false)}]})}]);
    }
    if (u.dialpad) return c.menu([{label: t.t('add_2sec_pause'), action: c => { ui(c).digits += ','; c.render(); }}, {label: t.t('add_wait'), action: c => { ui(c).digits += ';'; c.render(); }}]);
    const items = [{label: t.t('action_menu_call_history_description'), action: c => { ui(c).screen = 'history'; c.render(); }}, {label: t.t('menu_import_export'), action: c => MM.contactsImportExport(c)}];
    if (frequents(c).length) items.push({label: t.t('menu_clear_frequents'), action: c => c.dialog({title: t.t('clearFrequentsConfirmation_title'), message: t.t('clearFrequentsConfirmation'), buttons: [{label: MM.text('framework').t('cancel')}, {label: MM.text('framework').t('ok'), action: c => { c.data.frequentsCleared = Date.now(); c.save(); c.render(); }}]})});
    items.push({label: t.t('menu_newContact'), action: c => c.open('contacts', 'new')}, {label: t.t('dialer_settings_label'), action: c => MM.openPrefs(c, 'dialer', 'dialer_settings', t.t('dialer_settings_label'))});
    c.menu(items);
  }

  MM.phone = {call: (c, number) => startCall(c, number), active: c => !!call(c) && !call(c).ended};

  /* TeleService's EmergencyDialer (EmergencyDialerTheme: emergency_dialer_background #263238 behind the bars), opened
     from the keyguard's EMERGENCY CALL: emergency_dialer.xml with no emergency assistance app in the image (the action
     group stays hidden), the dialpad in Dialpad_Dark (white digits, #d4d6d7 letters, no overflow) and the 67 dp call
     button (fab_green, fab_ic_call) 26 dp above the bottom. A number that is not an emergency number (112, 911: the
     SIM's list) gets dial_emergency_error. */
  const EMERGENCY = ['112', '911'];
  MM.register('emergency-dialer', {
    app: false,
    statusColor: () => '#263238',
    render(c) {
      const n = c.ui.emergency || '';
      return `<div class="mmph mmed">${digitsRow(c, n, 'mmed-del')}${dialpadKeys(c, 'mmed-key')}<button type="button" class="mmed-fab" data-action="mmed-call" aria-label="dial"><img src="assets/ts-fab_green.png" alt=""><img src="assets/ts-fab_ic_call.png" alt=""></button></div>`;
    },
    back(c) { c.ui.emergency = ''; return false; },
    action(name, el, event, c) {
      const n = c.ui.emergency || '', t = MM.text('emergency');
      if (name === 'mmed-key') { c.ui.emergency = n + el.dataset.k; c.render(); return true; }
      if (name === 'mmed-del') { c.ui.emergency = n.slice(0, -1); c.render(); return true; }
      if (name === 'mmed-call') {
        if (!n) return true;
        if (!EMERGENCY.includes(n)) { c.dialog({message: AndroidStrings.format(t.t('dial_emergency_error'), n), buttons: [{label: t.t('ok')}]}); return true; }
        c.ui.emergency = ''; startCall(c, n); return true;
      }
      return false;
    }
  });
  MM.register('phone', {
    // The window animation's page (mm-core.js): deeper screens open over the ones they came from.
    page: c => MM.page('phone', c.ui.phone?.screen),
    statusColor: () => '#0277bd',
    render, mount,
    back(c) {
      const u = ui(c), k = call(c);
      if (k && u.addCall) { u.addCall = false; u.dialpad = false; if (!held(c)) k.hold = false; c.render(); return true; }
      if (k) { if (k.dialpad) { k.dialpad = false; c.render(); return true; } return false; }
      if (u.screen.startsWith('details:')) { u.screen = u.from || ''; u.from = ''; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.dialpad) { u.dialpad = false; u.digits = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), k = call(c);
      if (el.dataset.skip) { delete el.dataset.skip; return true; }
      switch (name) {
        case 'mmph-tab': u.tab = +el.dataset.tab; u.expanded = null; c.render(); return true;
        case 'mmph-htab': u.historyTab = +el.dataset.tab; u.expanded = null; c.render(); return true;
        case 'mmph-fab': if (u.tab === 2) c.open('contacts', 'new'); else { u.dialpad = true; c.render(); } return true;
        case 'mmph-key': if (u.digits.length < 40) u.digits += el.dataset.k; c.render(); return true;
        case 'mmph-del': u.digits = u.digits.slice(0, -1); c.render(); return true;
        case 'mmph-dialcall':
          if (!u.digits) { u.digits = P().digits(c.data.lastDialed || ''); c.render(); return true; }
          startCall(c, u.digits); return true;
        case 'mmph-call': startCall(c, el.dataset.n); return true;
        case 'mmph-dial': startCall(c, el.dataset.n); return true;
        case 'mmph-search': u.search = ''; c.render(); return true;
        case 'mmph-sback': u.search = null; c.render(); return true;
        case 'mmph-sclear': u.search = ''; c.render(); return true;
        case 'mmph-voice': MM.googleOpen(c, true); return true;
        case 'mmph-expand': if (event?.target?.closest('.mmph-callback')) return false; u.expanded = u.expanded === +el.dataset.key ? null : +el.dataset.key; c.render(); return true;
        case 'mmph-details': u.from = u.screen; u.screen = `details:${el.dataset.key}`; c.render(); return true;
        case 'mmph-delcalls': {
          const g = groups(c).find(x => String(x.key) === el.dataset.key), ids = new Set(g?.calls.map(x => x.id));
          c.data.calls = P().calls(c).filter(x => !ids.has(x.id)); c.save(); u.screen = u.from || ''; u.from = ''; u.expanded = null; c.render(); return true;
        }
        case 'mmph-up': if (u.screen.startsWith('details:')) { u.screen = u.from || ''; u.from = ''; } else u.screen = ''; c.render(); return true;
        case 'mmph-contact': c.open('contacts', `contact:${el.dataset.id}`); return true;
        case 'mmph-newcontact': c.open('contacts', `new:${el.dataset.n || ''}`); return true;
        case 'mmph-addto': c.open('contacts', `add:${el.dataset.n || ''}`); return true;
        case 'mmph-addfav': c.open('contacts'); return true;
        case 'mmph-sms': c.open('messenger', `to:${el.dataset.n || ''}`); return true;
        case 'mm-menu': menu(c); return true;
        case 'mmph-ctoggle': if (!k || k.ended) return true; k[el.dataset.id] = !k[el.dataset.id]; c.render(); return true;
        case 'mmph-addcall': if (!k || k.ended) return true; k.hold = true; u.addCall = true; u.dialpad = true; u.digits = ''; u.screen = ''; c.render(); return true;
        case 'mmph-return': u.addCall = false; u.dialpad = false; if (k && !held(c)) k.hold = false; c.render(); return true;
        case 'mmph-swap': { const h = held(c); if (!h || !k || k.ended) return true; k.hold = true; h.hold = false; c.ui.heldCall = k; c.ui.call = h; tickLoop(c); c.render(); return true; }
        case 'mmph-merge': { const h = held(c); if (!h || !k || k.ended) return true; k.conf = [...(h.conf || [h.number]), ...(k.conf || [k.number])]; k.hold = false; c.ui.heldCall = null; c.render(); return true; }
        case 'mmph-dtmf': if (k) { k.dtmf += el.dataset.k; c.render(); } return true;
        case 'mmph-dtmfdel': if (k) { k.dtmf = k.dtmf.slice(0, -1); c.render(); } return true;
        case 'mmph-hangup': hangup(c); return true;
      }
      return false;
    }
  });
})();
