/* Android 4.3 Dialer smart dial (packages/apps/Dialer: SmartDialNameMatcher, SmartDialAdapter, dialpad_fragment.xml). */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const KEYS = {a: '2', b: '2', c: '2', d: '3', e: '3', f: '3', g: '4', h: '4', i: '4', j: '5', k: '5', l: '5', m: '6', n: '6', o: '6', p: '7', q: '7', r: '7', s: '7', t: '8', u: '8', v: '8', w: '9', x: '9', y: '9', z: '9'};
  // SmartDialNameMatcher.remapAccentedChar: letters are folded to ASCII before mapping to keys.
  const fold = text => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const digitOf = ch => /[0-9]/.test(ch) ? ch : KEYS[ch] || '';

  /* A query matches a name when its digits spell the start of one word, possibly running on into the starts of
     the following words, or the initials. Returns the matched character positions in the original name. */
  function matchName(name, query) {
    if (!query || /[^0-9]/.test(query)) return null;
    const folded = fold(name), words = [];
    folded.replace(/[a-z0-9]+/g, (word, at) => { words.push({word, at}); return word; });
    const run = (w, q, hits) => {
      if (!q.length) return hits;
      if (w >= words.length) return null;
      const {word, at} = words[w];
      let i = 0;
      while (i < word.length && i < q.length && digitOf(word[i]) === q[i]) i++;
      for (let take = i; take >= 1; take--) {
        const next = take === q.length ? hits.concat(range(at, take)) : run(w + 1, q.slice(take), hits.concat(range(at, take)));
        if (next) return next;
      }
      return null;
    };
    const range = (at, n) => Array.from({length: n}, (_, k) => at + k);
    for (let w = 0; w < words.length; w++) { const hits = run(w, query, []); if (hits) return {positions: hits, start: w}; }
    return null;
  }
  // Number matches are prefix matches on the digits, with or without the country code.
  function matchNumber(number, query) {
    const digits = String(number || '').replace(/[^0-9+]/g, ''), plain = digits.replace(/^\+/, '');
    if (!query) return null;
    if (plain.startsWith(query)) return {start: 0, length: query.length, digits: plain};
    const national = plain.replace(/^(36|1|44|49|33|34)/, '');
    if (national !== plain && national.startsWith(query)) return {start: plain.length - national.length, length: query.length, digits: plain};
    return null;
  }
  // Ranking: name matches first (earlier words better), then number matches; favourites break ties.
  function suggestions(contacts, query, limit = 3) {
    if (!query) return [];
    const found = [];
    for (const person of contacts) {
      const name = matchName(person.name, query), number = matchNumber(person.phone, query);
      if (!name && !number) continue;
      found.push({person, name, number, score: (name ? 100 - name.start * 10 : 0) + (number ? 20 : 0) + (person.favorite ? 5 : 0)});
    }
    return found.sort((a, b) => b.score - a.score).slice(0, limit);
  }
  // SmartDialAdapter: the best match sits in the middle slot, the second on the left and the third on the right.
  const SLOT_ORDER = [1, 0, 2];
  function highlight(text, positions) {
    const set = new Set(positions);
    return [...text].map((ch, i) => set.has(i) ? `<b>${e(ch)}</b>` : e(ch)).join('');
  }
  function render(contacts, query, t) {
    const list = suggestions(contacts, query), slots = [null, null, null];
    list.forEach((item, rank) => { slots[SLOT_ORDER[rank]] = item; });
    return `<div class="jb-smartdial" role="list" aria-label="${e(t('Suggestions'))}">${slots.map(item => {
      if (!item) return '<span class="jb-smartdial-item empty" aria-hidden="true"></span>';
      const phone = item.person.phone || '';
      const number = item.number ? (() => { let seen = 0, out = ''; for (const ch of phone) { const digit = /[0-9]/.test(ch); const lit = digit && seen >= item.number.start && seen < item.number.start + item.number.length; if (digit) seen++; out += lit ? `<b>${e(ch)}</b>` : e(ch); } return out; })() : e(phone);
      return `<button type="button" class="jb-smartdial-item" role="listitem" data-action="smartdial-call" data-id="${e(phone)}"><span class="jb-smartdial-name">${item.name ? highlight(item.person.name, item.name.positions) : e(item.person.name)}</span><span class="jb-smartdial-number">${number}</span></button>`;
    }).join('')}</div>`;
  }
  window.JBDialer = {KEYS, fold, matchName, matchNumber, suggestions, render, SLOT_ORDER};
})();

// ---- Lollipop Dialer over the smart dial above ----
/* Google Dialer 2.1 on the Nexus 6 (GoogleDialer.apk, com.google.android.dialer, from LMY48Y: the AOSP 5.1 Dialer
   classes with Google's "Search contacts & places" and GoogleDialtactsActivity; code read from its odex). DialtactsActivity: a 64 dp #0288D1 action bar holding the white search box (8 dp
   margins, 3 dp elevation; magnifier, 14 sp #737373 hint, voice search and the overflow menu, icons tinted #A4A4A4).
   lists_fragment.xml: an OverlappingPaneLayout whose top pane, on the same blue, is the shortcut card of the most recent
   call (8 dp margins, 3 dp elevation); under it the 43 dp ViewPagerTabs (SPEED DIAL, RECENTS, CONTACTS; 14 sp
   all-caps, white with a 2 dp white underline, #A6FFFFFF when not selected, 2 dp elevation) over #FAFAFA pages.
   Speed dial: PhoneFavoriteSquareTileView in two columns, square, 1 dp apart; the photo or LetterTileDrawable (14
   Material colours by the name's String.hashCode, the letter at 67 %), a shadow over the bottom 40 % with the 15 sp
   medium name and the 11 sp number type, 12 dp in and 9 dp up, and the overflow in the corner. Recents:
   call_log_list_item rows (16 dp in, 40 dp round photo, 16 sp name, the 14 sp #737373 line with the call type
   arrows) under Today / Yesterday / Older headers; a tap reveals CALL BACK and DETAILS in #0288D1; "View full call
   history" closes the list. Contacts: the 48 dp letter column (#888888) beside photo and name.
   The 56 dp blue FAB with the dialpad icon sits 16 dp above the bottom, centred on speed dial and at the end on the
   other tabs. DialpadFragment slides the dialpad (#FCFCFC) up over the lower part: 60 dp digits (34 sp #333,
   overflow and delete tinted #B3B3B3), 14 dp, four rows of keys (36 sp light #0288D1 digits, 12 sp #737373
   letters, voicemail under 1), 65 dp for the green call FAB; smart-dial matches fill the space above. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // ContactsCommon letter_tile_colors (5.x).
  const COLORS = ['#db4437', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#4285f4', '#039be5', '#0097a7', '#009688', '#0f9d58', '#689f38', '#ef6c00', '#ff5722', '#757575'];
  function javaHash(text) { let h = 0; for (const ch of String(text)) { h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0; } return h; }
  // letter_tile_colors_dark: QuickContact's status bar for the same tile.
  const DARK = ['#c53929', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#3367d6', '#0277bd', '#006064', '#00796b', '#0b8043', '#33691e', '#e65100', '#e64a19', '#424242'];
  const tileColor = id => id ? COLORS[Math.abs(javaHash(id)) % COLORS.length] : '#cccccc';
  const tileColorDark = id => id ? DARK[Math.abs(javaHash(id)) % DARK.length] : '#9e9e9e';
  const letter = name => /^\p{L}/u.test(name || '') ? name[0].toLocaleUpperCase() : '';
  function letterTile(person, cls = '') {
    const name = person?.name || '', l = letter(name);
    return `<span class="lpd-letter ${cls}" style="background:${tileColor(name)}" aria-hidden="true">${l ? `<span>${e(l)}</span>` : '<img src="assets/gd-ic_person_white_120dp.png" alt="">'}</span>`;
  }
  const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
  // Calls before "Clear frequents" (ClearFrequentsDialog resets the contacts' usage) no longer make a contact frequent.
  function speedDial(data, byPhone) {
    const counts = new Map(), since = data.frequentsClearedAt || 0;
    for (const call of data.callHistory || []) { const person = call.time > since && byPhone(call.number); if (person) counts.set(person.id, (counts.get(person.id) || 0) + 1); }
    const starred = data.contacts.filter(person => person.favorite);
    const frequent = data.contacts.filter(person => !person.favorite && counts.has(person.id)).sort((a, b) => counts.get(b.id) - counts.get(a.id));
    return [...starred, ...frequent].slice(0, Math.max(20, starred.length));
  }
  // CallTypeIconsView: ic_call_arrow, green (#00C853) for answered, flipped for outgoing, red (#FF2E58) for missed.
  const arrow = call => `<i class="lpd-arrow ${call.type === 'missed' ? 'missed' : call.type === 'incoming' ? 'incoming' : 'outgoing'}" aria-hidden="true"></i>`;
  function relative(time, locale, t, now = Date.now()) {
    const minutes = Math.round((now - time) / 60000);
    if (minutes < 1) return t('Just now');
    if (minutes < 60) return new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (hours < 24) return new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(-hours, 'hour');
    return new Date(time).toLocaleDateString(locale, {month: 'short', day: 'numeric'});
  }
  function dayGroup(time, now = new Date()) {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    return time >= start ? 'Today' : time >= start - 86400000 ? 'Yesterday' : 'Older';
  }
  function logRow(call, person, ui, t, locale, card = false) {
    const name = person?.name || call.number, open = !card && ui.lpLogExpanded === call.time;
    const main = `<button class="lpd-log-main" data-action="${card ? 'phone-redial' : 'lpd-log-expand'}" data-id="${card ? e(call.number) : call.time}">${letterTile(person || {name: ''}, 'lpd-photo')}<span class="lpd-log-copy"><span class="lpd-log-name">${e(name)}</span><span class="lpd-log-meta">${arrow(call)}<span>${e(person ? t('Mobile') : call.number)}</span><span>${e(relative(call.time, locale, t))}</span></span></span>${card ? '<img class="lpd-card-phone" src="assets/gd-ic_card_phone.png" alt="">' : ''}</button>`;
    const actions = open ? `<div class="lpd-log-actions"><button data-action="phone-redial" data-id="${e(call.number)}">${e(t('CALL BACK'))}</button><button data-action="phone-log-detail" data-id="${call.time}">${e(t('DETAILS'))}</button></div>` : '';
    return `<div class="lpd-log-row${card ? ' lpd-card' : ''}${open ? ' open' : ''}">${main}${actions}</div>`;
  }
  // PhoneNumberUtils.normalizeNumber: digits and a leading +, letters turned into their dialpad digits.
  const normalize = text => [...String(text)].map(ch => /[0-9]/.test(ch) ? ch : window.JBDialer?.KEYS[ch.toLowerCase()] || (ch === '+' ? ch : '')).join('').replace(/(?!^)\+/g, '');
  /* DialerPhoneNumberListAdapter's shortcuts under the matches (ContactListItemView with the 40 dp #B6B6B6 circle and
     the #F8F8F8 icon). The search box (RegularSearchListAdapter) offers "Call %s" (ic_results_phone) and "Add to
     contacts" (ic_person_add_24dp) once the query normalizes to a number; the dialpad (SmartDialSearchFragment)
     only "Add to contacts", the call button being there. Video calling is off on this image (CallUtil.isVideoEnabled). */
  function results(data, query, t, pad = false) {
    const q = String(query || '').trim();
    if (!q) return '';
    const digits = q.replace(/[^\d+*#]/g, '');
    const fold = text => String(text).toLocaleLowerCase();
    const found = window.JBDialer && digits === q ? window.JBDialer.suggestions(data.contacts, q, 20).map(item => item.person) : data.contacts.filter(person => fold(`${person.name} ${person.phone}`).includes(fold(q)) || (digits && person.phone.replace(/\D/g, '').includes(digits)));
    const rows = found.map(person => `<button class="lpd-result" data-action="contact-call" data-id="${person.id}">${letterTile(person, 'lpd-photo')}<span class="lpd-result-copy"><span>${e(person.name)}</span><small>${e(t('Mobile'))} ${e(person.phone)}</small></span></button>`).join('');
    const number = pad ? q : normalize(q);
    const shortcut = (action, icon, label) => `<button class="lpd-result lpd-shortcut" data-action="${action}" data-id="${e(number)}"><span class="lpd-shortcut-icon"><img src="assets/${icon}" alt=""></span><span class="lpd-result-copy"><span>${e(label)}</span></span></button>`;
    const shortcuts = number ? `${pad ? '' : shortcut('smartdial-call', 'gd-ic_results_phone.png', AndroidStrings.format(t('Call %s'), number))}${shortcut('phone-add-contact', 'gd-ic_person_add_24dp.png', t('Add to contacts'))}` : '';
    return `<div class="lpd-results">${rows}${shortcuts}</div>`;
  }
  function speedDialPage(data, t, byPhone) {
    const tiles = speedDial(data, byPhone);
    if (!tiles.length) return `<div class="lpd-empty"><img src="assets/gd-empty_speeddial.png" alt=""><p>${e(t('Speed dial is one‑touch dialing for favorites and numbers you call often'))}</p></div>`;
    const tile = person => `<div class="lpd-tile"><button class="lpd-tile-main" data-action="contact-call" data-id="${person.id}" aria-label="${e(person.name)}">${letterTile(person, 'lpd-tile-photo')}<span class="lpd-tile-shadow"></span><span class="lpd-tile-text"><span class="lpd-tile-name">${e(person.name)}${person.favorite ? '<img src="assets/gd-ic_star.png" alt="">' : ''}</span><span class="lpd-tile-type">${e(t('Mobile'))}</span></span></button><button class="lpd-tile-more" data-action="contact" data-id="${person.id}" aria-label="${e(t('View contact'))}"><img src="assets/gd-overflow_thumbnail.png" alt=""></button></div>`;
    return `<div class="lpd-tiles">${tiles.map(tile).join('')}</div>`;
  }
  function logList(data, ui, t, locale, byPhone, filter = 'all', limit = Infinity) {
    const calls = [...(data.callHistory || [])].filter(call => filter === 'all' || call.type === 'missed').sort((a, b) => b.time - a.time).slice(0, limit);
    if (!calls.length) return `<div class="lpd-empty"><img src="assets/gd-empty_call_log.png" alt=""><p>${e(t('No calls'))}</p></div>`;
    let group = '';
    return calls.map(call => { const g = dayGroup(call.time); const head = g !== group ? `<h3 class="lpd-day">${e(t(g))}</h3>` : ''; group = g; return head + logRow(call, byPhone(call.number), ui, t, locale); }).join('');
  }
  function contactsPage(data, t) {
    // Sort by and Name format (lp-dialer-prefs): the provider's sort key and display name.
    const P = window.LPDialerPrefs, key = person => P ? P.sortKey(person, data) : person.name, named = person => P ? P.displayName(person, data) : person.name;
    const sorted = [...data.contacts].sort((a, b) => key(a).localeCompare(key(b)));
    if (!sorted.length) return `<div class="lpd-empty"><img src="assets/gd-empty_contacts.png" alt=""><p>${e(t('No contacts'))}</p></div>`;
    let last = '';
    return `<div class="lpd-contacts">${sorted.map(person => { const head = letter(key(person)) || '#'; const shown = head !== last; last = head; return `<button class="lpd-contact" data-action="contact" data-id="${person.id}"><span class="lpd-section">${shown ? e(head) : ''}</span>${letterTile(person, 'lpd-photo')}<span class="lpd-contact-name">${e(named(person))}</span></button>`; }).join('')}</div>`;
  }
  function dialpad(dial, t) {
    return `<div class="lpd-dialpad" role="group" aria-label="${e(t('Dial pad'))}"><div class="lpd-digits"><button class="lpd-digits-menu" data-action="phone-menu" data-id="dialpad" aria-label="${e(t('More options'))}" ${dial ? '' : 'hidden'}><img src="assets/gd-ic_overflow_menu.png" alt=""></button><output aria-label="${e(t('Phone number'))}">${e(dial)}</output><button class="lpd-delete" data-action="dial-delete" aria-label="${e(t('Delete'))}" ${dial ? '' : 'disabled'}><img src="assets/gd-ic_dialpad_delete.png" alt=""></button></div><div class="lpd-keys">${KEYS.map(([digit, letters]) => `<button class="lpd-key${digit === '*' ? ' star' : digit === '#' ? ' pound' : ''}" data-action="dial" data-id="${digit}" aria-label="${digit}"><span class="lpd-key-num">${digit}</span>${digit === '1' ? '<img src="assets/gd-ic_dialpad_voicemail.png" alt="">' : letters ? `<span class="lpd-key-letters">${e(letters)}</span>` : ''}</button>`).join('')}</div><button class="lpd-fab lpd-fab-call" data-action="call" aria-label="${e(t('dial'))}"><img src="assets/gd-fab_ic_call.png" alt=""></button></div>`;
  }
  // SpeedDialFragment.hasFrequents: a frequently called contact that is not starred.
  const hasFrequents = (data, byPhone) => speedDial(data, byPhone).some(person => !person.favorite);
  /* The overflow menus as the image's code leaves them. DialtactsActivity: dialtacts_options.xml in an END-gravity
     PopupMenu, OptionsPopupMenu.show hiding "Clear frequents" without frequents (Settings opens GoogleDialerSettings).
     DialpadFragment: dialpad_options.xml (Add to contacts, Add 2-sec pause, Add wait, Send SMS; the last only with
     an SMS app, Messenger here). CallLogActivity: call_log_options.xml, "Clear call history" only over a non-empty
     list. CallDetailActivity: call_details_options.xml's overflow keeps "Edit number before call" (the delete item is
     the action bar icon; Delete voicemail only for voicemail). */
  function menu(kind, {data, t, byPhone}) {
    if (kind === 'dialpad') return [['phone-add-contact', t('Add to contacts')], ['dial-pause', t('Add 2-sec pause')], ['dial-wait', t('Add wait')], ['phone-dial-sms', t('Send SMS')]];
    if (kind === 'history') return (data.callHistory || []).length ? [['lpd-clear-log', t('Clear call history')]] : [];
    if (kind === 'detail') return [['lpd-edit-before-call', t('Edit number before call')]];
    return [['kk-dialer-history', t('Call History')], ['vcf-open', t('Import/export')], ...(hasFrequents(data, byPhone) ? [['lpd-clear-frequents', t('Clear frequents')]] : []), ['phone-new-contact', t('New contact')], ['dpr-settings', t('Settings')]];
  }
  // ClearFrequentsDialog / ClearCallLogDialog: the Material alert in the dialer's #0288D1 accent (AlertDialogTheme).
  function confirm(kind, t) {
    const [title, message, ok] = kind === 'log' ? ['Clear call history?', 'This will delete all calls from your history', 'lpd-clear-log-ok'] : ['Clear frequently contacted?', "You'll clear the frequently contacted list in the People and Phone apps, and force email apps to learn your addressing preferences from scratch.", 'lpd-clear-frequents-ok'];
    return `<div class="ga-scrim" data-action="close-overlay"></div><div class="ga-dialog ga-alert lpd-alert" role="alertdialog" aria-label="${e(t(title))}"><h3 class="ga-title">${e(t(title))}</h3><p class="ga-body">${e(t(message))}</p><div class="ga-buttons"><button type="button" data-action="close-overlay">${e(t('Cancel'))}</button><button type="button" data-action="${ok}">${e(t('OK'))}</button></div></div>`;
  }
  function history(data, ui, t, locale, byPhone) {
    const tab = ui.kkLogTab === 'missed' ? 'missed' : 'all';
    const more = (data.callHistory || []).length ? `<button class="lpd-toolbar-more" data-action="phone-menu" data-id="history" aria-label="${e(t('More options'))}"><img src="assets/gd-ic_overflow_menu.png" alt=""></button>` : '';
    return `<div class="app-view lpd-app lpd-history"><header class="lpd-toolbar"><button data-action="kk-dialer-back" aria-label="${e(t('Navigate up'))}"><img src="assets/gd-ic_arrow_back_24dp.png" alt=""></button><h2>${e(t('History'))}</h2>${more}</header><nav class="lpd-tabs" role="tablist">${[['all', 'All'], ['missed', 'Missed']].map(([id, label]) => `<button role="tab" aria-selected="${tab === id}" data-action="kk-dialer-log-tab" data-id="${id}">${e(t(label))}</button>`).join('')}</nav><div class="lpd-page">${logList(data, ui, t, locale, byPhone, tab)}</div></div>`;
  }
  function render({data, ui, t, locale, byPhone}) {
    if (ui.sub === 'kk-history') return history(data, ui, t, locale, byPhone);
    const pad = !!ui.kkDialpad, search = !pad && (ui.lpSearchOpen || !!(ui.phoneSearch || '').trim());
    const tab = ['speed', 'recents', 'contacts'].includes(ui.lpDialTab) ? ui.lpDialTab : 'speed';
    const recent = [...(data.callHistory || [])].sort((a, b) => b.time - a.time)[0];
    const card = recent && !ui.kkRecentDismissed?.includes(recent.time) ? `<div class="lpd-shortcuts">${logRow(recent, byPhone(recent.number), ui, t, locale, true)}<button class="lpd-card-dismiss" data-action="lpd-dismiss-card" data-id="${recent.time}" aria-label="${e(t('Dismiss'))}"></button></div>` : '';
    const page = tab === 'speed' ? speedDialPage(data, t, byPhone) : tab === 'recents' ? `${logList(data, ui, t, locale, byPhone, 'all', 10)}${(data.callHistory || []).length ? `<button class="lpd-footer" data-action="kk-dialer-history">${e(t('View full call history'))}</button>` : ''}` : contactsPage(data, t);
    const box = search
      ? `<div class="lpd-search expanded"><button data-action="lpd-search-close" aria-label="${e(t('Navigate up'))}"><span class="lpd-back" aria-hidden="true"></span></button><input type="text" data-kk-dialer-search aria-label="${e(t('Search contacts & places'))}" placeholder="${e(t('Search contacts & places'))}" value="${e(ui.phoneSearch || '')}" autocomplete="off">${(ui.phoneSearch || '') ? `<button data-action="kk-dialer-clear" aria-label="${e(t('Clear search'))}"><img src="assets/gd-ic_close_dk.png" alt=""></button>` : ''}</div>`
      : `<div class="lpd-search"><button class="lpd-search-open" data-action="lpd-search-open"><img src="assets/gd-ic_ab_search.png" alt=""><span>${e(t('Search contacts & places'))}</span></button><button data-action="voice-search" aria-label="${e(t('Start voice search'))}"><img src="assets/gd-ic_voice_search.png" alt=""></button><button data-action="phone-menu" aria-label="${e(t('More options'))}"><img src="assets/gd-ic_overflow_menu.png" alt=""></button></div>`;
    const body = pad
      ? `<div class="lpd-list lpd-pad-results" data-kk-dialer-list>${results(data, ui.dial, t, true)}</div>${dialpad(ui.dial, t)}`
      : search
        ? `<div class="lpd-list lpd-search-results" data-kk-dialer-list>${results(data, ui.phoneSearch, t)}</div>`
        : `<div class="lpd-pane" data-kk-dialer-list>${card}<nav class="lpd-tabs" role="tablist">${[['speed', 'Speed dial'], ['recents', 'Recents'], ['contacts', 'Contacts']].map(([id, label]) => `<button role="tab" aria-selected="${tab === id}" data-action="lpd-tab" data-id="${id}">${e(t(label))}</button>`).join('')}</nav><div class="lpd-page lpd-page-${tab}">${page}</div></div><button class="lpd-fab${tab === 'speed' ? '' : ' end'}" data-action="kk-dialer-pad" aria-label="${e(t('dial pad'))}"><img src="assets/gd-fab_ic_dial.png" alt=""></button>`;
    return `<div class="app-view lpd-app${pad ? ' lpd-pad-up' : ''}${search ? ' lpd-searching' : ''}">${pad ? '' : `<header class="lpd-actionbar">${box}</header>`}${body}</div>`;
  }
  window.LPDialer = {COLORS, javaHash, tileColor, tileColorDark, letterTile, speedDial, hasFrequents, menu, confirm, results, render, KEYS, dayGroup};
})();
