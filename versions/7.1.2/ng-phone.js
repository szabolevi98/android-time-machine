/* Android 7.1.2 Phone (Google Dialer 8.0, priv-app/GoogleDialer of N2G48C), the app 'phone'. The logic is 6.0.1's (its
   phone module); the look and the behaviour below are the image's:
   - DialtactsActivity (dialtacts_activity.xml, DialtactsTheme: dialer_theme_color #2a56c6, colorPrimaryDark #1c3aa9, the
     window #fafafa): lists_fragment.xml's 64 dp theme-coloured bar holding search_edittext.xml (an 8 dp inset white card,
     3 dp elevation: ic_ab_search, the 14 sp #737373 "Search contacts" hint 22 dp in, ic_mic_grey600 and ic_overflow_menu
     tinted #737373), the 48 dp ViewPagerTabs (ListsFragment: tab_speed_dial / tab_history / tab_all_contacts with
     ic_grade_24dp / ic_schedule_24dp / ic_people_24dp tinted by tab_text_color, white or #a6ffffff, the 2 dp white
     underline; the Voicemail tab only comes with a visual voicemail account), the pager and the 56 dp dialer_fab
     (fab_ic_dial; on the Contacts tab ic_person_add_24dp, Create new contact) 16 dp above the bottom.
   - Speed dial (speed_dial_fragment.xml, PhoneFavoritesTileAdapter): starred contacts, then the frequently contacted, as
     PhoneFavoriteSquareTileView tiles in 2 columns (height 0.76 of the width, 1 dp dividers): the photo or the square
     letter tile (letter at 70 %, 12 % up), shadow_contact_photo over the lower 4/10, the 15 sp medium white name with
     ic_star for a starred contact, the 11 sp phone type, ⋮ (ic_more_vert_24dp, 36 dp) to the contact. Empty:
     empty_speed_dial, speed_dial_empty and "Add a favorite", which shows the Contacts tab.
   - Call History (call_log_fragment.xml, CallLogAdapter): CallLogGroupBuilder's groups (consecutive calls of one number
     in one day group) each in a CardView (2 dp corners, 4 dp margin, white) inside the 8 dp list margins, the day heading
     (Today / Yesterday / Older, 14 sp medium #8a000000, 15 / 9 dp) above the first of each day. A row: the 48 dp round
     letter tile, 16 dp, the 16 sp #de000000 name, under it CallTypeIconsView's ic_call_arrow (answered #00c853, outgoing
     turned 180°, missed #ff2e58; at most 3), "(n) " past 3, then the phone type and DateUtils' relative time joined by
     list_delimeter; ic_call_24dp (#8a000000, 48 dp) calls back. A tap expands call_log_list_item_actions.xml after a
     1 dp #eeeeee line (48 dp rows, 24 dp icon tinted #636363 at 16 dp, 16 sp #b3000000 text at 64 dp): Create new
     contact and Add to a contact for an unknown number, Send a message, Block number / Unblock number, Call details.
     Video call, Call with a note and Share and call need the carrier's video calling, call subjects and enriched
     calling, which the image's SIM has none of. Empty: empty_call_log, call_log_all_empty and "Make a call".
   - Contacts (all_contacts_fragment.xml): ContactListItemView rows 18 dp under the tabs, the 48 dp section letter
     column (20 sp medium #888888), the 40 dp photo, 15 dp, the 16 sp #333333 name; empty: empty_contacts.
   - The dialpad (dialpad_fragment.xml → dialpad_view_unthemed.xml, Dialpad.Light): shadow_fade_up, then on #fcfcfc the
     60 dp digits row (the overflow while digits are typed, the 34 sp #333333 DigitsEditText shrinking to 24 sp,
     ic_dialpad_delete tinted #89000000), a 1 dp #e3e3e3 line, 14 dp, four 64 dp key rows (36 sp light numbers in the
     theme colour, 12 sp #737373 letters, the 1 key's voicemail icon in #919191, * and # in #737373 at 80 %), 8 dp and the
     80 dp space the green call FAB (fab_green, fab_ic_call) sits in, 16 dp from the bottom. While it is up the bar and
     the tabs slide away and SmartDial's matches list behind it with the number's shortcuts. Its overflow
     (dialpad_options.xml): Add 2-sec pause, Add wait (Call with a note needs call subjects).
   - Search (search_bar_expanded.xml): the card opens to the back arrow in the theme colour, a 20 sp field and
     ic_close_dk; the matching contacts, then for a number Call, Create new contact, Add to a contact and Send SMS.
   - The overflow (dialtacts_options.xml, DialtactsActivity's OptionsPopupMenu): Clear call history, Clear frequents (only
     with frequents), Settings.
   - CallDetailActivity (call_detail.xml): the theme-coloured bar with Delete (ic_delete_24dp), the white
     call_detail_header.xml (16 / 20 dp: the 48 dp photo, the 16 sp name, "Mobile (202) 555-0148" at 12 sp #636363, the
     call back button), CallDetailHistoryAdapter's rows (13 / 20 dp: the type icon and text at 16 sp,
     formatDateRange(…, SHOW_TIME | SHOW_DATE | SHOW_WEEKDAY | SHOW_YEAR) and "%s min %s sec" at 12 sp) and
     call_detail_footer.xml (Copy number, Edit number before call: 16 sp #616161, 16 / 28 dp, the icon 28 dp before).
   - InCallUI (incall_screen.xml, frag_incall_voice.xml, Theme.InCallScreen): the wallpaper shows through
     incall_background_gradient (#e91141bb to #cc229feb) under transparent system bars. The contact grid, 12 dp down and
     24 dp in: the top row's 18 sp #ddffffff state ("Calling…" while dialing, nothing once connected), the 36 sp light
     name (shrinking to 28 sp), the bottom row's "Mobile (202) 555-0148" while dialing, the Chronometer once connected,
     "Call ended" at the end (the shared logic's TopRow and BottomRow). incall_button_grid.xml's 3 × 2
     CheckableLabeledButtons (48 dp icon on a white disc when checked, the icon then #01579b; 12 sp label 8 dp under;
     disabled at 30 %): Mute, Keypad, Speaker, Add call, Hold, Video call (no video calling: disabled); with a second
     call Merge and Swap take Add call's and Hold's places, the held call in incall_on_hold_banner.xml (#cc212121) at the
     top. The 48 dp end call button (#df0000, quantum_ic_call_end_white_24) 36 dp above the bottom. Keypad shows the
     InCallDialpad (white, the 60 dp digits row with ic_close_black_24dp back and no delete key, the end call button over
     its 116 dp bottom space) below the contact grid. No telephony is used: a call connects after a moment and is written
     to the call log when it ends. */
(() => {
  'use strict';
  const T = () => NG.text('phone'), P = () => NG.people;
  const A = n => `assets/gd-${n}.png`;
  const KEYS = [['1', ''], ['2', 'dialpad_2_letters'], ['3', 'dialpad_3_letters'], ['4', 'dialpad_4_letters'], ['5', 'dialpad_5_letters'], ['6', 'dialpad_6_letters'],
    ['7', 'dialpad_7_letters'], ['8', 'dialpad_8_letters'], ['9', 'dialpad_9_letters'], ['*', ''], ['0', 'dialpad_0_letters'], ['#', '']];
  const T9 = {a: 2, b: 2, c: 2, d: 3, e: 3, f: 3, g: 4, h: 4, i: 4, j: 5, k: 5, l: 5, m: 6, n: 6, o: 6, p: 7, q: 7, r: 7, s: 7, t: 8, u: 8, v: 8, w: 9, x: 9, y: 9, z: 9};
  const ui = c => c.ui.phone || (c.ui.phone = {tab: 0, dialpad: false, digits: '', search: null, expanded: null, screen: ''});
  const call = c => c.ui.call;
  const esc = (c, s) => c.safe(s);
  const fw = k => T().t(`framework/${k}`);

  // ---- data ----------------------------------------------------------------------------------------------------
  const dayGroup = (time, now = new Date()) => {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return time >= start ? 0 : time >= start - 864e5 ? 1 : 2;
  };
  // CallLogGroupBuilder: newest first; a group is consecutive calls of one number in one day group.
  function groups(c) {
    const calls = [...P().calls(c)].sort((a, b) => b.time - a.time), out = [];
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
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => P().byId(c, id)).filter(Boolean);
  }
  const blocked = c => c.data.blockedNumbers || (c.data.blockedNumbers = []);
  const isBlocked = (c, n) => blocked(c).some(b => P().same(b, n));
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

  // The Design library's Snackbar (design_layout_snackbar_include: #323232, 14 sp white, 14 / 12 dp, 6 dp elevation).
  let snackTimer = 0;
  NG.snackbar = (c, text) => {
    c.el.viewport.querySelector('.ngph-snack')?.remove();
    const el = document.createElement('div');
    el.className = 'ngph-snack'; el.textContent = text;
    c.el.viewport.appendChild(el);
    // FloatingActionButtonBehavior: the FAB moves up out of the snackbar's way.
    requestAnimationFrame(() => { el.classList.add('in'); c.el.viewport.classList.add('ngph-snacking'); });
    clearTimeout(snackTimer);
    snackTimer = setTimeout(() => { el.classList.remove('in'); c.el.viewport.classList.remove('ngph-snacking'); setTimeout(() => el.remove(), 250); }, 2750);
  };

  // A sheet slides in when it opens, not on every redraw while it is up.
  const anim = (o, key) => { const was = o[`${key}Shown`]; o[`${key}Shown`] = true; return !was; };

  // ---- pieces ----------------------------------------------------------------------------------------------------
  const arrow = type => `<i class="ngph-arrow ${type}" aria-hidden="true"></i>`;
  const icon = (n, cls = '') => `<i class="ngph-ic ${cls}" style="--ic:url('${A(n)}')" aria-hidden="true"></i>`;
  function dialpadKeys(action) {
    const rows = [KEYS.slice(0, 3), KEYS.slice(3, 6), KEYS.slice(6, 9), KEYS.slice(9)];
    return `<div class="ngph-keys">${rows.map(r => `<div class="ngph-krow">${r.map(([k, l]) => {
      const sub = k === '1' ? `<i class="ngph-vm" aria-hidden="true"></i>` : l ? `<small>${T().t(l)}</small>` : '';
      return `<button type="button" class="ngph-key${k === '*' ? ' star' : ''}${k === '#' ? ' pound' : ''}${k === '0' ? ' zero' : ''}" data-action="${action}" data-k="${k}"><b>${k}</b>${sub}</button>`;
    }).join('')}</div>`).join('')}</div>`;
  }
  // DigitsEditText's ResizingTextEditText: the text shrinks from the row's size to 24 sp to fit.
  function digitsRow(c, value, {del = '', menu = false, back = '', size = 34} = {}) {
    const t = T(), len = value.length, px = Math.max(24, Math.min(size, size - Math.max(0, len - 13) * 1.6));
    const start = back ? `<button type="button" class="ngph-dpside" data-action="${back}" aria-label="${esc(c, t.t('description_dialpad_back'))}">${icon('ic_close_black_24dp', 'dark')}</button>`
      : menu ? `<button type="button" class="ngph-dpside${value ? '' : ' hide'}" data-action="ngph-dpmenu" aria-label="${esc(c, t.t('description_dialpad_overflow'))}">${icon('ic_overflow_menu', 'dark')}</button>` : '';
    const end = del ? `<button type="button" class="ngph-del" data-action="${del}" aria-label="${esc(c, t.t('description_delete_button'))}">${icon('ic_dialpad_delete', 'dark')}</button>` : '';
    return `<div class="ngph-digits">${start}<output style="font-size:calc(${px.toFixed(1)} * var(--dp))">${esc(c, value)}</output>${end}</div><i class="ngph-dline"></i>`;
  }
  function personRow(c, p, extra = '') {
    return `<button type="button" class="ngph-crow" data-action="ngph-contact" data-id="${p.id}">${P().tile(c, p, 'ngph-photo')}<span class="ngph-cname">${esc(c, P().displayName(c, p))}${extra}</span></button>`;
  }
  function shortcuts(c, number) {
    const t = T(), list = [['ic_call_24dp', t.fmt('search_shortcut_call_number', null, P().format(number)), 'ngph-dial']];
    if (!P().byNumber(c, number)) list.push(['ic_person_add_24dp', t.t('search_shortcut_create_new_contact'), 'ngph-newcontact'], ['ic_person_24dp', t.t('search_shortcut_add_to_contact'), 'ngph-addto']);
    list.push(['ic_message_24dp', t.t('search_shortcut_send_sms_message'), 'ngph-sms']);
    return list.map(([ic, label, action]) => `<button type="button" class="ngph-crow ngph-short" data-action="${action}" data-n="${esc(c, number)}">${icon(ic, 'ngph-shic')}<span class="ngph-cname">${esc(c, label)}</span></button>`).join('');
  }
  function empty(c, img, msg, action = '', actionName = '') {
    return `<div class="ngph-empty"><img src="${A(img)}" alt=""><p>${esc(c, msg)}</p>${action ? `<button type="button" data-action="${actionName}">${esc(c, action)}</button>` : ''}<i></i></div>`;
  }

  // ---- pages ----------------------------------------------------------------------------------------------------
  function speedDial(c) {
    const t = T(), list = [...P().sorted(c).filter(p => p.starred), ...frequents(c)];
    if (!list.length) return empty(c, 'empty_speed_dial', t.t('speed_dial_empty'), t.t('speed_dial_empty_add_favorite_action'), 'ngph-addfav');
    return `<div class="ngph-tiles">${list.map(p => `<div class="ngph-tile"><button type="button" class="ngph-tilebtn" data-action="ngph-call" data-n="${esc(c, p.phone)}">${P().tile(c, p, 'ngph-tileimg', false)}<i class="ngph-shade"></i>
      <span class="ngph-tname"><span><b>${esc(c, p.name)}</b>${p.starred ? `<img src="${A('ic_star')}" alt="">` : ''}</span><small>${esc(c, P().typeLabel())}</small></span></button>
      <button type="button" class="ngph-tmore" data-action="ngph-contact" data-id="${p.id}" aria-label="${esc(c, t.t('description_view_contact_detail'))}"><img src="${A('ic_more_vert_24dp')}" alt=""></button></div>`).join('')}</div>`;
  }
  function callRow(c, g, u) {
    const t = T(), p = P().byNumber(c, g.number), types = g.calls.slice(0, 3).map(x => arrow(x.type)).join('');
    let line = [p ? P().typeLabel() : '', P().relative(c, g.calls[0].time)].filter(Boolean).join(t.t('list_delimeter'));
    if (g.calls.length > 3) line = t.fmt('call_log_item_count_and_date', null, g.calls.length, line);
    const open = u.expanded === g.key, block = isBlocked(c, g.number);
    const act = (ic, label, action) => `<button type="button" class="ngph-act" data-action="${action}" data-n="${esc(c, g.number)}" data-key="${g.key}">${icon(ic, 'grey')}<span>${esc(c, label)}</span></button>`;
    const actions = open ? `<div class="ngph-acts">${p ? '' : act('ic_person_add_24dp', t.t('search_shortcut_create_new_contact'), 'ngph-newcontact') + act('ic_person_24dp', t.t('search_shortcut_add_to_contact'), 'ngph-addto')}${act('ic_message_24dp', t.t('call_log_action_send_message'), 'ngph-sms')}${block ? act('ic_unblock', t.t('call_log_action_unblock_number'), 'ngph-unblock') : act('ic_block_24dp', t.t('call_log_action_block_number'), 'ngph-block')}${act('ic_info_outline_24dp', t.t('call_log_action_details'), 'ngph-details')}</div>` : '';
    return `<div class="ngph-card${open ? ' open' : ''}"><div class="ngph-row" data-action="ngph-expand" data-key="${g.key}">${P().tile(c, p || {name: ''}, 'ngph-photo48')}
      <span class="ngph-info"><b>${esc(c, p ? p.name : P().format(g.number))}</b><span class="ngph-line">${types}<span>${esc(c, line)}</span></span></span>
      <button type="button" class="ngph-callback" data-action="ngph-call" data-n="${esc(c, g.number)}" aria-label="${esc(c, t.fmt('call_log_action_call', null, p ? p.name : P().format(g.number)))}">${icon('ic_call_24dp', 'dim')}</button></div>${actions}</div>`;
  }
  function history(c) {
    const t = T(), u = ui(c), list = groups(c);
    if (!list.length) return empty(c, 'empty_call_log', t.t('call_log_all_empty'), t.t('call_log_all_empty_action'), 'ngph-makecall');
    let day = -1, out = '';
    for (const g of list) {
      if (g.day !== day) { day = g.day; out += `<div class="ngph-day">${esc(c, t.t(['call_log_header_today', 'call_log_header_yesterday', 'call_log_header_other'][day]))}</div>`; }
      out += callRow(c, g, u);
    }
    return `<div class="ngph-log">${out}</div>`;
  }
  function contacts(c) {
    const t = T(), list = P().sorted(c);
    if (!list.length) return empty(c, 'empty_contacts', t.t('all_contacts_empty'), t.t('all_contacts_empty_add_contact_action'), 'ngph-newcontact');
    let letter = '';
    // ContactsPreferences: the sort order picks the section letters, the name format the names.
    const byLast = NG.appPref?.(c, 'contacts', 'sortOrder', '1') === '2';
    return `<div class="ngph-clist">${list.map(p => { const l = (byLast ? P().alt(p) : p.name).charAt(0).toLocaleUpperCase(c.locale()); const head = l !== letter ? (letter = l) : ''; return `<div class="ngph-citem"><span class="ngph-sec">${esc(c, head)}</span>${personRow(c, p)}</div>`; }).join('')}</div>`;
  }

  // ---- screens ----------------------------------------------------------------------------------------------------
  function main(c) {
    const t = T(), u = ui(c), tabs = [['ic_grade_24dp', 'tab_speed_dial'], ['ic_schedule_24dp', 'tab_history'], ['ic_people_24dp', 'tab_all_contacts']];
    const searching = u.search !== null;
    const box = searching
      ? `<div class="ngph-search exp"><button type="button" class="ngph-sback" data-action="ngph-sback" aria-label="${esc(c, t.t('action_menu_back_from_search'))}">${icon('ic_arrow_back_24dp', 'theme')}</button>
          <input type="text" class="ngph-sinput" value="${esc(c, u.search)}" placeholder="${esc(c, t.t('dialer_hint_find_contact'))}" autocomplete="off" spellcheck="false">
          ${u.search ? `<button type="button" class="ngph-sclear" data-action="ngph-sclear" aria-label="${esc(c, t.t('description_clear_search'))}">${icon('ic_close_dk', 'hint')}</button>` : ''}</div>`
      : `<div class="ngph-search"><button type="button" class="ngph-sbox" data-action="ngph-search">${icon('ic_ab_search', 'hint ngph-mag')}<span>${esc(c, t.t('dialer_hint_find_contact'))}</span></button>
          <button type="button" class="ngph-sicon" data-action="ngph-voice" aria-label="${esc(c, t.t('description_start_voice_search'))}">${icon('ic_mic_grey600', 'hint')}</button>
          <button type="button" class="ngph-sicon" data-action="ngph-menu" aria-label="${esc(c, t.t('action_menu_overflow_description'))}">${icon('ic_overflow_menu', 'hint')}</button></div>`;
    const bar = `<div class="ngph-ab${u.dialpad ? ' up' : ''}${searching ? ' exp' : ''}">${box}</div>`;
    const tabBar = `<div class="ngph-tabs${u.dialpad || searching ? ' up' : ''}" role="tablist">${tabs.map(([ic, label], i) => `<button type="button" role="tab" aria-selected="${u.tab === i}" data-action="ngph-tab" data-tab="${i}" aria-label="${esc(c, t.t(label))}">${icon(ic)}</button>`).join('')}<i class="ngph-under" style="transform:translateX(${u.tab * 100}%)"></i></div>`;
    let body;
    if (u.dialpad) body = `<div class="ngph-results dp">${smartMatches(c, P().digits(u.digits)).map(p => personRow(c, p, `<small>${esc(c, P().format(p.phone))}</small>`)).join('')}${u.digits ? shortcuts(c, u.digits) : ''}</div>`;
    else if (searching) { const q = u.search.trim(), num = /^[0-9+*#() -]+$/.test(q) && /\d/.test(q); body = `<div class="ngph-results">${searchMatches(c, q).map(p => personRow(c, p, `<small>${esc(c, P().typeLabel())} ${esc(c, P().format(p.phone))}</small>`)).join('')}${num ? shortcuts(c, q) : ''}</div>`; }
    else body = `<div class="ngph-pager"><div class="ngph-page t${u.tab}">${[speedDial, history, contacts][u.tab](c)}</div></div>`;
    const fab = u.dialpad || searching ? '' : `<button type="button" class="ngph-fab" data-action="ngph-fab" aria-label="${esc(c, t.t(u.tab === 2 ? 'search_shortcut_create_new_contact' : 'action_menu_dialpad_button'))}"><img${u.tab === 2 ? ' class="small"' : ''} src="${A(u.tab === 2 ? 'ic_person_add_24dp' : 'fab_ic_dial')}" alt=""></button>`;
    const pad = u.dialpad ? `<div class="ngph-dialpad${anim(u, 'dialpad') ? ' in' : ''}"><i class="ngph-fade"></i><div class="ngph-dpview">${digitsRow(c, P().typing(u.digits), {del: 'ngph-del', menu: true})}<i class="ngph-above"></i>${dialpadKeys('ngph-key')}<i class="ngph-below"></i><i class="ngph-endspace"></i></div>
      <button type="button" class="ngph-fab green" data-action="ngph-dialcall" aria-label="${esc(c, t.t('description_dial_button'))}"><img src="${A('fab_ic_call')}" alt=""></button></div>` : '';
    // During Add call the way back to the call in progress (dialer_returnToInCallScreen) heads the dialer.
    const back = u.addCall && call(c) ? `<button type="button" class="ngph-returncall" data-action="ngph-return">${esc(c, t.t('dialer_returnToInCallScreen'))}</button>` : '';
    return `<div class="ngph${u.dialpad ? ' dp' : ''}">${bar}${back}${tabBar}${body}${fab}${pad}</div>`;
  }
  function screenBar(c, title, actions = '') {
    return `<div class="ngph-bar"><button type="button" class="ngph-up" data-action="ngph-up" aria-label="${esc(c, NG.text('framework').t('action_menu_overflow_description'))}">${icon('ic_arrow_back_24dp')}</button><span>${esc(c, title)}</span>${actions}</div>`;
  }
  function details(c, key) {
    const t = T(), g = groups(c).find(x => String(x.key) === String(key));
    if (!g) { ui(c).screen = ''; return main(c); }
    const p = P().byNumber(c, g.number), loc = c.locale();
    const typeText = {incoming: 'type_incoming', outgoing: 'type_outgoing', missed: 'type_missed'};
    const dur = s => s < 60 ? t.fmt('callDetailsShortDurationFormat', null, s) : t.fmt('callDetailsDurationFormat', null, Math.floor(s / 60), s % 60);
    // formatDateRange(…, SHOW_TIME | SHOW_DATE | SHOW_WEEKDAY | SHOW_YEAR): ICU's pattern generator joins the date and the
    // time with the plain ", " glue, not the long formats' "at".
    const date = x => new Intl.DateTimeFormat(loc, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'}).formatToParts(new Date(x.time))
      .map((part, i, all) => part.type === 'literal' && /\p{L}/u.test(part.value) && all[i - 1]?.type === 'year' ? ', ' : part.value).join('');
    const del = `<button type="button" class="ngph-up" data-action="ngph-delcalls" data-key="${g.key}" aria-label="${esc(c, t.t('call_details_delete'))}">${icon('ic_delete_24dp')}</button>`;
    const foot = (ic, label, action) => `<button type="button" class="ngph-foot" data-action="${action}" data-n="${esc(c, g.number)}">${icon(ic, 'foot')}<span>${esc(c, label)}</span></button>`;
    return `<div class="ngph flat det">${screenBar(c, t.t('callDetailTitle'), del)}<div class="ngph-detlist">
      <div class="ngph-caller">${P().tile(c, p || {name: ''}, 'ngph-photo48')}<span class="ngph-info"><b>${esc(c, p ? p.name : P().format(g.number))}</b>${p ? `<span>${esc(c, `${P().typeLabel()} ${P().format(g.number)}`)}</span>` : ''}</span>
        <button type="button" class="ngph-callback" data-action="ngph-call" data-n="${esc(c, g.number)}" aria-label="${esc(c, t.t('description_call_log_call_action'))}">${icon('ic_call_24dp', 'dim')}</button></div>
      ${g.calls.map(x => `<div class="ngph-hitem"><span class="ngph-htype">${arrow(x.type)}<b>${esc(c, t.t(typeText[x.type]))}</b></span><span>${esc(c, date(x))}</span>${x.type === 'missed' ? '' : `<span>${esc(c, dur(x.duration))}</span>`}</div>`).join('')}
      <i class="ngph-fline"></i>${foot('ic_content_copy_24dp', t.t('action_copy_number_text'), 'ngph-copy')}${foot('ic_create_24dp', t.t('action_edit_number_before_call'), 'ngph-edit')}</div></div>`;
  }

  // ---- in call ----------------------------------------------------------------------------------------------------
  const elapsed = s => { const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60; return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`; };
  const callSeconds = (k, now = Date.now()) => k.connected && now >= k.connected ? Math.floor(((k.ended || now) - k.connected) / 1000) : 0;
  const held = c => c.ui.heldCall;
  const callName = (c, k) => { if (k.conf) return T().t('conference_call_name'); const p = P().byNumber(c, k.number); return p ? p.name : P().format(k.number); };
  // TopRow / BottomRow (the shared logic's contact grid): dialing "Calling…" over the type and number; connected the
  // timer; ended "Call ended".
  function topText(k, now) { return !k.ended && now < k.connected ? T().t('incall_connecting') : ''; }
  function bottomText(c, k, now) {
    if (k.ended) return T().t('incall_call_ended');
    if (now >= k.connected && !k.hold) return elapsed(callSeconds(k, now));
    const p = k.conf ? null : P().byNumber(c, k.number);
    return p ? `${P().typeLabel()} ${P().format(k.number)}` : '';
  }
  function incall(c) {
    const t = T(), k = call(c), now = Date.now(), live = !k.ended, h = held(c), connected = now >= k.connected;
    const btn = (id, ic, label, {toggle = true, enabled = live} = {}) => `<button type="button" class="ngph-cbtn${toggle && k[id] ? ' on' : ''}" data-action="${toggle ? 'ngph-ctoggle' : `ngph-${id}`}" data-id="${id}"${toggle ? ` aria-pressed="${!!k[id]}"` : ''}${enabled ? '' : ' disabled'}><i style="--ic:url('${A(ic)}')" aria-hidden="true"></i><span>${esc(c, t.t(label))}</span></button>`;
    const banner = h ? `<div class="ngph-holdbar">${icon('quantum_ic_call_white_18')}<b>${esc(c, callName(c, h))}</b><span>${esc(c, t.t('incall_on_hold'))}</span></div>` : '';
    const grid = `<div class="ngph-cgrid">${btn('mute', 'quantum_ic_mic_off_white_36', 'incall_label_mute')}${btn('dialpad', 'quantum_ic_dialpad_white_36', 'incall_label_dialpad')}${btn('speaker', 'quantum_ic_volume_up_white_36', 'incall_label_speaker')}
      ${h ? btn('merge', 'quantum_ic_call_merge_white_36', 'incall_label_merge', {toggle: false}) : btn('addcall', 'ic_addcall_white', 'incall_label_add_call', {toggle: false, enabled: live && connected})}
      ${h ? btn('swap', 'quantum_ic_swap_calls_white_36', 'incall_label_swap', {toggle: false}) : btn('hold', 'quantum_ic_pause_white_36', 'incall_label_hold', {enabled: live && connected})}
      ${btn('video', 'quantum_ic_videocam_white_36', 'incall_label_videocall', {toggle: false, enabled: false})}</div>`;
    const pad = k.dialpad && live ? `<div class="ngph-incallpad${anim(k, 'dialpad') ? ' in' : ''}">${digitsRow(c, k.dtmf, {back: 'ngph-padclose'})}<i class="ngph-above"></i>${dialpadKeys('ngph-dtmf')}<i class="ngph-below"></i><i class="ngph-endspace"></i></div>` : '';
    const top = topText(k, now);
    return `<div class="ngph-call">${banner}<div class="ngph-contact"><span class="ngph-top${top ? '' : ' none'}">${esc(c, top)}</span><b class="ngph-name">${esc(c, callName(c, k))}</b><span class="ngph-bottom">${esc(c, bottomText(c, k, now))}</span></div>
      <div class="ngph-pagerbox">${grid}</div>${pad}
      <button type="button" class="ngph-end" data-action="ngph-hangup" aria-label="${esc(c, t.t('incall_content_description_end_call'))}"${live ? '' : ' disabled'}>${icon('quantum_ic_call_end_white_24')}</button></div>`;
  }
  function fitName(root) {
    const name = root.querySelector('.ngph-name'); if (!name) return;
    // AutoResizeTextView: 36 sp down to 28 sp until the name fits on its line.
    for (let s = 36; s >= 28; s--) { name.style.fontSize = `calc(${s} * var(--dp))`; if (name.scrollWidth <= name.clientWidth) break; }
  }
  function begin(c, number) {
    c.ui.call = {number, started: Date.now(), connected: Date.now() + 2500, mute: false, speaker: false, hold: false, dialpad: false, dtmf: '', ended: 0};
    c.data.lastDialed = number; c.save();
    tickLoop(c);
  }
  function startCall(c, number) {
    number = String(number || '').trim(); if (!number) return;
    const u = ui(c), cur = call(c);
    u.dialpad = false; u.digits = ''; u.search = null; u.expanded = null; u.addCall = false; u.screen = '';
    // A call placed while one is up (Add call): that one waits on hold.
    if (cur && !cur.ended) { cur.hold = true; cur.dialpad = false; c.ui.heldCall = cur; }
    begin(c, number);
    if (c.ui.view !== 'phone') c.open('phone'); else c.render();
  }
  function hangup(c) {
    const k = call(c); if (!k || k.ended) return;
    k.ended = Date.now(); k.dialpad = false; c.render();
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
    let wasConnected = false;
    ticker = setInterval(() => {
      const k = call(c); if (!k) { clearInterval(ticker); return; }
      if (c.ui.view !== 'phone' || c.ui.overlay || k.ended || ui(c).addCall) return;
      const root = c.el.viewport, now = Date.now(), connected = now >= k.connected;
      // Connecting enables Add call and Hold: a full redraw; after that only the texts change.
      if (connected !== wasConnected) { wasConnected = connected; if (connected) { c.render(); return; } }
      const top = root.querySelector('.ngph-top'), bottom = root.querySelector('.ngph-bottom');
      if (top) { top.textContent = topText(k, now); top.classList.toggle('none', !top.textContent); }
      if (bottom) bottom.textContent = bottomText(c, k, now);
    }, 250);
  }

  // A screen opened with a sub: 'call:<number>' places the call, 'dial:<number>' opens the dialpad with it.
  function consume(c) {
    const u = ui(c), sub = c.ui.sub || '';
    if (!sub) return;
    c.ui.sub = '';
    if (sub.startsWith('call:')) { u.dialpad = false; u.digits = ''; u.search = null; u.screen = ''; begin(c, sub.slice(5)); }
    else if (sub.startsWith('dial:')) { u.screen = ''; u.search = null; u.dialpad = true; u.digits = P().digits(sub.slice(5)); }
    else if (sub === 'history') { u.screen = ''; u.search = null; u.dialpad = false; u.tab = 1; }
  }
  function render(c) {
    consume(c);
    const u = ui(c), k = call(c);
    if (!u.dialpad) u.dialpadShown = false;
    if (k && !k.dialpad) k.dialpadShown = false;
    if (k && !u.addCall) return incall(c);
    if (u.screen.startsWith('details:')) return details(c, u.screen.slice(8));
    return main(c);
  }
  function mount(c, root) {
    const u = ui(c), page = root.querySelector('.ngph-page, .ngph-results, .ngph-detlist');
    if (page) { const key = `${u.screen}|${u.tab}|${u.dialpad}|${u.search !== null}`; page.scrollTop = u.scroll?.[key] || 0; page.addEventListener('scroll', () => { (u.scroll ||= {})[key] = page.scrollTop; }, {passive: true}); }
    const input = root.querySelector('.ngph-sinput');
    if (input) {
      input.addEventListener('input', () => { ui(c).search = input.value; const pos = input.selectionStart; c.render(); const i2 = c.el.viewport.querySelector('.ngph-sinput'); if (i2) { i2.focus(); i2.setSelectionRange(pos, pos); } });
      if (document.activeElement !== input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
    }
    fitName(root);
    // DialpadContainer (h580dp): the in-call dialpad fills the window from 8 dp under the contact grid.
    const pad = root.querySelector('.ngph-incallpad'), grid = root.querySelector('.ngph-contact');
    if (pad && grid) { const dp = c.el.screen.clientWidth / 411.4286; pad.style.top = `${grid.offsetTop + grid.offsetHeight + 8 * dp}px`; }
    // Long-pressing 0 types +, and the delete key held clears the digits (DialpadFragment.onLongClick).
    root.querySelectorAll('.ngph-key.zero, .ngph-del').forEach(el => {
      let timer = 0;
      el.addEventListener('pointerdown', () => { timer = setTimeout(() => { timer = -1; const uu = ui(c); if (el.dataset.k === '0' && el.dataset.action === 'ngph-key') uu.digits += '+'; else if (el.dataset.action === 'ngph-del') uu.digits = ''; else return; c.render(); }, 600); });
      el.addEventListener('pointerup', e => { if (timer === -1) { e.preventDefault(); el.dataset.skip = '1'; } clearTimeout(timer); });
      el.addEventListener('pointerleave', () => clearTimeout(timer));
    });
  }
  function menu(c, anchor) {
    const t = T(), u = ui(c);
    if (u.dialpad) return c.menu([{label: t.t('add_2sec_pause'), action: c => { ui(c).digits += ','; c.render(); }}, {label: t.t('add_wait'), action: c => { ui(c).digits += ';'; c.render(); }}], anchor);
    const items = [{label: t.t('call_log_delete_all'), action: c => c.dialog({title: t.t('clearCallLogConfirmation_title'), message: t.t('clearCallLogConfirmation'), buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => { c.data.calls = []; c.save(); ui(c).expanded = null; c.render(); }}]})}];
    if (frequents(c).length) items.push({label: t.t('menu_clear_frequents'), action: c => c.dialog({title: t.t('clearFrequentsConfirmation_title'), message: t.t('clearFrequentsConfirmation'), buttons: [{label: fw('cancel')}, {label: fw('ok'), action: c => { c.data.frequentsCleared = Date.now(); c.save(); c.render(); }}]})});
    items.push({label: t.t('dialer_settings_label'), action: c => NG.openPrefs(c, 'dialer', 'dialer_settings')});
    c.menu(items, anchor);
  }
  function block(c, number, on) {
    const t = T(), n = P().format(number);
    c.dialog({title: t.fmt(on ? 'block_number_confirmation_title' : 'unblock_number_confirmation_title', null, n), message: on ? t.t('block_number_confirmation_message_new_filtering') : '',
      buttons: [{label: fw('cancel')}, {label: t.t(on ? 'block_number_ok' : 'unblock_number_ok'), action: c => {
        c.data.blockedNumbers = on ? [...blocked(c), number] : blocked(c).filter(b => !P().same(b, number));
        c.save(); c.render(); NG.snackbar(c, t.fmt(on ? 'snackbar_number_blocked' : 'snackbar_number_unblocked', null, n));
      }}]});
  }

  NG.phone = {call: (c, number) => startCall(c, number), active: c => !!call(c) && !call(c).ended, isBlocked};

  /* TeleService's EmergencyDialer (EmergencyDialerTheme, Theme.DeviceDefault.Settings.Dark: the window #263238 behind
     transparent bars), opened from the bouncer's EMERGENCY CALL: emergency_dialer.xml, 16 dp in from the sides. On top
     the EmergencyActionGroup (64 dp, 16 dp down, 24 dp above the dialpad) with one button per ACTION_EMERGENCY_ASSISTANCE
     activity of the system app: EmergencyInfo's "Emergency information". A tap reveals the red (#e53935) selected
     container with the label and "Tap again to open" for 3 s; a second tap opens it. Then the dialpad in Dialpad_Dark
     (white, #d4d6d7 letters, no overflow, 29 dp above the keys) and the 67 dp call button (fab_green, fab_ic_call) 26 dp
     above the bottom. A number that is not an emergency number (112, 911: the SIM's list) gets dial_emergency_error, an
     empty one dial_emergency_empty_error. */
  const EMERGENCY = ['112', '911'];
  let revealTimer = 0;
  NG.register('emergency-dialer', {
    app: false,
    statusColor: () => '#263238',
    render(c) {
      const n = c.ui.emergency || '', t = NG.text('emergency'), sel = c.ui.emergencySelected;
      const group = `<div class="ngph-eag"><button type="button" class="ngph-eabtn" data-action="ngph-eact">${esc(c, t.t('EmergencyInfo/app_label'))}</button>${sel ? `<button type="button" class="ngph-esel" data-action="ngph-eopen"><b>${esc(c, t.t('EmergencyInfo/app_label'))}</b><span>${esc(c, t.t('emergency_action_launch_hint'))}</span></button>` : ''}</div>`;
      return `<div class="ngph-emerg">${group}<div class="ngph-edp">${digitsRow(c, n, {del: 'ngph-edel', size: 35})}<i class="ngph-above"></i>${dialpadKeys('ngph-ekey')}<i class="ngph-below"></i><i class="ngph-endspace"></i></div><button type="button" class="ngph-efab" data-action="ngph-ecall" aria-label="${esc(c, t.t('description_dial_button'))}"><img src="assets/ts-fab_green.png" alt=""><img src="assets/ts-fab_ic_call.png" alt=""></button></div>`;
    },
    back(c) { c.ui.emergency = ''; c.ui.emergencySelected = false; return false; },
    action(name, el, event, c) {
      const n = c.ui.emergency || '', t = NG.text('emergency');
      if (name === 'ngph-ekey') { c.ui.emergency = n + el.dataset.k; c.render(); return true; }
      if (name === 'ngph-edel') { c.ui.emergency = n.slice(0, -1); c.render(); return true; }
      if (name === 'ngph-eact') { c.ui.emergencySelected = true; c.render(); clearTimeout(revealTimer); revealTimer = setTimeout(() => { c.ui.emergencySelected = false; if (c.ui.view === 'emergency-dialer') c.render(); }, 3000); return true; }
      if (name === 'ngph-eopen') { clearTimeout(revealTimer); c.ui.emergencySelected = false; c.open('emergency-info'); return true; }
      if (name === 'ngph-ecall') {
        if (!n) { c.dialog({message: t.t('dial_emergency_empty_error'), buttons: [{label: NG.text('phone').t('framework/ok')}]}); return true; }
        if (!EMERGENCY.includes(n)) { c.dialog({message: t.fmt('dial_emergency_error', null, n), buttons: [{label: NG.text('phone').t('framework/ok')}]}); return true; }
        c.ui.emergency = ''; startCall(c, n); return true;
      }
      return false;
    }
  });
  NG.register('phone', {
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('phone', c.ui.phone?.screen),
    statusColor: c => call(c) && !ui(c).addCall ? 'transparent' : '#1c3aa9',
    // AlertDialogTheme: colorAccent dialer_theme_color.
    dialogAccent: () => '#2a56c6',
    render, mount,
    back(c) {
      const u = ui(c), k = call(c);
      if (k && u.addCall) { u.addCall = false; u.dialpad = false; if (!held(c)) k.hold = false; c.render(); return true; }
      if (k) { if (k.dialpad) { k.dialpad = false; c.render(); return true; } return false; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.dialpad) { u.dialpad = false; u.digits = ''; c.render(); return true; }
      if (u.search !== null) { u.search = null; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), k = call(c);
      if (el.dataset.skip) { delete el.dataset.skip; return true; }
      switch (name) {
        case 'ngph-tab': u.tab = +el.dataset.tab; u.expanded = null; c.render(); return true;
        case 'ngph-fab': if (u.tab === 2) c.open('contacts', 'new'); else { u.dialpad = true; c.render(); } return true;
        case 'ngph-makecall': u.dialpad = true; c.render(); return true;
        case 'ngph-key': if (u.digits.length < 40) u.digits += el.dataset.k; c.render(); return true;
        case 'ngph-del': u.digits = u.digits.slice(0, -1); c.render(); return true;
        case 'ngph-dialcall':
          // An empty dialpad's call button brings back the last number dialled.
          if (!u.digits) { u.digits = P().digits(c.data.lastDialed || ''); c.render(); return true; }
          startCall(c, u.digits); return true;
        case 'ngph-call': case 'ngph-dial': startCall(c, el.dataset.n); return true;
        case 'ngph-search': u.search = ''; c.render(); return true;
        case 'ngph-sback': u.search = null; c.render(); return true;
        case 'ngph-sclear': u.search = ''; c.render(); return true;
        case 'ngph-voice': if (NG.googleOpen) NG.googleOpen(c, true); else c.open('search', 'voice'); return true;
        case 'ngph-expand': if (event?.target?.closest('.ngph-callback')) return false; u.expanded = u.expanded === +el.dataset.key ? null : +el.dataset.key; c.render(); return true;
        case 'ngph-details': u.screen = `details:${el.dataset.key}`; c.render(); return true;
        case 'ngph-delcalls': {
          const g = groups(c).find(x => String(x.key) === el.dataset.key), ids = new Set(g?.calls.map(x => x.id));
          c.data.calls = P().calls(c).filter(x => !ids.has(x.id)); c.save(); u.screen = ''; u.expanded = null; c.render(); return true;
        }
        case 'ngph-copy': try { navigator.clipboard?.writeText(el.dataset.n); } catch {} c.toast(t.t('toast_text_copied')); return true;
        case 'ngph-edit': u.screen = ''; u.dialpad = true; u.digits = P().digits(el.dataset.n); c.render(); return true;
        case 'ngph-block': block(c, el.dataset.n, true); return true;
        case 'ngph-unblock': block(c, el.dataset.n, false); return true;
        case 'ngph-up': u.screen = ''; c.render(); return true;
        case 'ngph-contact': c.open('contacts', `contact:${el.dataset.id}`); return true;
        case 'ngph-newcontact': c.open('contacts', `new:${el.dataset.n || ''}`); return true;
        case 'ngph-addto': c.open('contacts', `add:${el.dataset.n || ''}`); return true;
        case 'ngph-addfav': u.tab = 2; c.render(); return true;
        case 'ngph-sms': c.open('messenger', `to:${el.dataset.n || ''}`); return true;
        case 'ngph-menu': case 'ngph-dpmenu': menu(c, el); return true;
        case 'ngph-ctoggle': if (!k || k.ended || el.disabled) return true; k[el.dataset.id] = !k[el.dataset.id]; c.render(); return true;
        case 'ngph-padclose': if (k) { k.dialpad = false; c.render(); } return true;
        case 'ngph-addcall': if (!k || k.ended) return true; k.hold = true; u.addCall = true; u.dialpad = true; u.digits = ''; u.screen = ''; u.search = null; c.render(); return true;
        case 'ngph-return': u.addCall = false; u.dialpad = false; if (k && !held(c)) k.hold = false; c.render(); return true;
        case 'ngph-swap': { const h = held(c); if (!h || !k || k.ended) return true; k.hold = true; h.hold = false; c.ui.heldCall = k; c.ui.call = h; tickLoop(c); c.render(); return true; }
        case 'ngph-merge': { const h = held(c); if (!h || !k || k.ended) return true; k.conf = [...(h.conf || [h.number]), ...(k.conf || [k.number])]; k.hold = false; c.ui.heldCall = null; c.render(); return true; }
        case 'ngph-dtmf': if (k) { k.dtmf += el.dataset.k; c.render(); } return true;
        case 'ngph-hangup': hangup(c); return true;
      }
      return false;
    }
  });
})();
