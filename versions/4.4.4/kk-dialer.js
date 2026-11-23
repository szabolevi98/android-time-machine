/* Smart dial of the KitKat Dialer (GoogleDialer 1.1, com.google.android.dialer of KTU84P; com.android.dialer.dialpad's
   SmartDialNameMatcher and LatinSmartDialMap): name and number matches for the dialpad's search results. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const KEYS = {a: '2', b: '2', c: '2', d: '3', e: '3', f: '3', g: '4', h: '4', i: '4', j: '5', k: '5', l: '5', m: '6', n: '6', o: '6', p: '7', q: '7', r: '7', s: '7', t: '8', u: '8', v: '8', w: '9', x: '9', y: '9', z: '9'};
  // LatinSmartDialMap.normalizeCharacter: letters are folded to ASCII before mapping to keys.
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
  window.JBDialer = {KEYS, fold, matchName, matchNumber, suggestions};
})();

// ---- Android 4.4 Dialer over the smart dial above ----
/* Android 4.4 Dialer (packages/apps/Dialer android-4.4.4_r1, DialtactsTheme on Theme.Holo.Light).
   dialtacts_activity.xml: a white search box (search_bg, 41 dp, "Type a name or phone number" and voice search)
   over the speed dial list, and a 60 dp #3B77E7 fake action bar with call history, dialpad and overflow; while
   the dialpad is up the dial button takes the dialpad button's place.
   PhoneFavoriteFragment / PhoneFavoriteMergedAdapter: the most recent call as a card, the "Speed Dial" row with the
   ALL CONTACTS button, then starred and frequently called contacts as 2-column tiles 67 % as tall as wide
   (photo or LetterTileDrawable, name 15 sp white over shadow_contact_photo, overflow thumbnail top right).
   DialpadFragment: a white panel (digits 36 sp sans-serif-light, delete), 56 dp keys with 40 sp light #3B77E7
   numbers and 13 sp #8b8b8b letters; star and pound 26 sp grey. CallLogActivity: "History" with ALL / MISSED tabs. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  // ContactsCommon letter_tile_colors; LetterTileDrawable picks abs(String.hashCode(identifier)) % 8.
  const COLORS = ['#33b679', '#536173', '#855e86', '#df5948', '#aeb857', '#547bca', '#ae6b23', '#e5ae4f'];
  function javaHash(text) { let h = 0; for (const ch of String(text)) { h = (Math.imul(31, h) + ch.charCodeAt(0)) | 0; } return h; }
  const tileColor = id => id ? COLORS[Math.abs(javaHash(id)) % COLORS.length] : '#cccccc';
  const letter = name => /^[A-Za-z]/.test(name || '') ? name[0].toUpperCase() : '';
  function letterTile(person, cls = '') {
    const name = person?.name || '', l = letter(name);
    return `<span class="kkd-letter ${cls}" style="background:${tileColor(name)}" aria-hidden="true">${l ? `<span>${e(l)}</span>` : '<img src="assets/kd-ic_add_person_dk.png" alt="">'}</span>`;
  }
  const KEYS = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'], ['*', ''], ['0', '+'], ['#', '']];
  function speedDial(data, byPhone) {
    const counts = new Map();
    for (const call of data.callHistory || []) { const person = byPhone(call.number); if (person) counts.set(person.id, (counts.get(person.id) || 0) + 1); }
    const starred = data.contacts.filter(person => person.favorite);
    const frequent = data.contacts.filter(person => !person.favorite && counts.has(person.id)).sort((a, b) => counts.get(b.id) - counts.get(a.id));
    return [...starred, ...frequent].slice(0, Math.max(20, starred.length));
  }
  function callTypeIcon(call) {
    const type = call.type === 'missed' ? 'missed' : call.type === 'incoming' ? 'incoming' : 'outgoing';
    return `<img class="kkd-call-type" src="assets/kd-ic_call_${type}_holo_dark.png" alt="">`;
  }
  function relative(time, locale, now = Date.now()) {
    const minutes = Math.round((now - time) / 60000);
    if (minutes < 60) return new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(-minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (hours < 24) return new Intl.RelativeTimeFormat(locale, {numeric: 'auto'}).format(-hours, 'hour');
    return new Date(time).toLocaleDateString(locale, {month: 'short', day: 'numeric'});
  }
  function logRow(call, person, t, locale, card = false) {
    const name = person?.name || call.number;
    return `<div class="kkd-log-row${card ? ' kkd-log-card' : ''}"><button class="kkd-log-main" data-action="phone-log-detail" data-id="${call.time}">${letterTile(person || {name: ''}, 'kkd-log-photo')}<span class="kkd-log-copy"><span class="kkd-log-name">${e(name)}</span><span class="kkd-log-meta">${callTypeIcon(call)}<span>${e(person ? t('Mobile') : call.number)}</span><span class="kkd-log-time">${e(relative(call.time, locale))}</span></span></span></button><span class="kkd-log-divider"></span><button class="kkd-log-call" data-action="phone-redial" data-id="${e(call.number)}" aria-label="${e(t('Call'))}"><img src="assets/kd-ic_phone_dk.png" alt=""></button></div>`;
  }
  function results(data, query, t) {
    const q = String(query || '').trim();
    if (!q) return '';
    const digits = q.replace(/[^\d+*#]/g, '');
    const fold = text => String(text).toLocaleLowerCase();
    const found = window.JBDialer && digits === q ? window.JBDialer.suggestions(data.contacts, q, 20).map(item => item.person) : data.contacts.filter(person => fold(`${person.name} ${person.phone}`).includes(fold(q)) || (digits && person.phone.replace(/\D/g, '').includes(digits)));
    const rows = found.map(person => `<button class="kkd-result" data-action="contact-call" data-id="${person.id}">${letterTile(person, 'kkd-result-photo')}<span class="kkd-result-copy"><span>${e(person.name)}</span><small>${e(t('Mobile'))} ${e(person.phone)}</small></span></button>`).join('');
    const callNumber = digits ? `<button class="kkd-result kkd-result-action" data-action="phone-redial" data-id="${e(digits)}"><span class="kkd-result-icon"><img src="assets/kd-ic_phone_dk.png" alt=""></span><span class="kkd-result-copy"><span>${e(AndroidStrings.format(t('Call %s'), digits))}</span></span></button><button class="kkd-result kkd-result-action" data-action="phone-add-contact"><span class="kkd-result-icon"><img src="assets/kd-ic_add_person_dk.png" alt=""></span><span class="kkd-result-copy"><span>${e(t('Add to contacts'))}</span></span></button>` : '';
    return `<div class="kkd-results">${rows}${callNumber}</div>`;
  }
  function favorites(data, ui, t, locale, byPhone) {
    const tiles = speedDial(data, byPhone);
    const recent = [...(data.callHistory || [])].sort((a, b) => b.time - a.time)[0];
    const card = recent && !ui.kkRecentDismissed?.includes(recent.time) ? logRow(recent, byPhone(recent.number), t, locale, true) : '';
    const menu = `<div class="kkd-fav-menu"><span>${e(t('Speed Dial'))}</span><button data-action="kk-dialer-all">${e(t('ALL CONTACTS'))}</button></div>`;
    if (!tiles.length) return `${card}<div class="kkd-no-favorites"><img src="assets/kd-no_favorites_banner.png" alt=""><p>${e(t('Favorites & contacts you\ncall often will show here.\nSo, start calling.')).replace(/\n/g, '<br>')}</p><button class="kkd-all-row" data-action="kk-dialer-all">${e(t('All contacts'))}</button></div>`;
    const tile = person => `<div class="kkd-tile"><button class="kkd-tile-main" data-action="contact-call" data-id="${person.id}" aria-label="${e(person.name)}">${letterTile(person, 'kkd-tile-photo')}<span class="kkd-tile-shadow"></span><span class="kkd-tile-text"><span class="kkd-tile-name">${e(person.name)}</span><span class="kkd-tile-type">${e(t('Mobile'))}</span></span></button><button class="kkd-tile-more" data-action="contact" data-id="${person.id}" aria-label="${e(t('View contact'))}"><img src="assets/kd-overflow_thumbnail.png" alt=""></button></div>`;
    return `${card}${menu}<div class="kkd-tiles">${tiles.map(tile).join('')}</div>`;
  }
  function dialpad(dial, t) {
    return `<div class="kkd-dialpad" role="group" aria-label="${e(t('Dial pad'))}"><div class="kkd-digits"><output aria-label="${e(t('Phone number'))}">${e(dial)}</output><button data-action="dial-delete" aria-label="${e(t('Delete'))}" ${dial ? '' : 'disabled'}><img src="assets/kd-ic_dial_action_delete.png" alt=""></button></div><div class="kkd-keys">${KEYS.map(([digit, letters]) => `<button class="kkd-key${digit === '*' || digit === '#' ? ' kkd-key-sym' : ''}" data-action="dial" data-id="${digit}" aria-label="${digit}"><span class="kkd-key-num">${digit}</span><span class="kkd-key-letters">${digit === '1' ? '<img src="assets/kd-ic_dial_action_vm.png" alt="">' : e(letters)}</span></button>`).join('')}</div></div>`;
  }
  function history(data, ui, t, locale, byPhone) {
    const tab = ui.kkLogTab === 'missed' ? 'missed' : 'all';
    const calls = [...(data.callHistory || [])].filter(call => tab === 'all' || call.type === 'missed').sort((a, b) => b.time - a.time);
    return `<div class="app-view kkd-app kkd-history"><header class="kkd-ab"><button data-action="kk-dialer-back" aria-label="${e(t('Navigate up'))}"><img src="assets/kd-ic_back_arrow.png" alt=""></button><h2>${e(t('History'))}</h2></header><nav class="kkd-tabs" role="tablist">${[['all', 'All'], ['missed', 'Missed']].map(([id, label]) => `<button role="tab" aria-selected="${tab === id}" data-action="kk-dialer-log-tab" data-id="${id}">${e(t(label))}</button>`).join('')}</nav><div class="kkd-scroll">${calls.length ? calls.map(call => logRow(call, byPhone(call.number), t, locale)).join('') : `<p class="kkd-empty">${e(t('Call log is empty.'))}</p>`}</div></div>`;
  }
  function allContacts(data, t) {
    const sorted = [...data.contacts].sort((a, b) => a.name.localeCompare(b.name));
    let last = '';
    const rows = sorted.map(person => { const head = letter(person.name) || '#'; const header = head !== last ? `<div class="kkd-section">${e(head)}</div>` : ''; last = head; return `${header}<button class="kkd-result" data-action="contact-call" data-id="${person.id}">${letterTile(person, 'kkd-result-photo')}<span class="kkd-result-copy"><span>${e(person.name)}</span><small>${e(t('Mobile'))} ${e(person.phone)}</small></span></button>`; }).join('');
    return `<div class="app-view kkd-app kkd-all"><header class="kkd-ab"><button data-action="kk-dialer-back" aria-label="${e(t('Navigate up'))}"><img src="assets/kd-ic_back_arrow.png" alt=""></button><h2>${e(t('All contacts'))}</h2></header><div class="kkd-scroll">${rows}</div></div>`;
  }
  function render({data, ui, t, locale, byPhone}) {
    if (ui.sub === 'kk-history') return history(data, ui, t, locale, byPhone);
    if (ui.sub === 'kk-all') return allContacts(data, t);
    const searching = !!(ui.phoneSearch || '').trim(), pad = !!ui.kkDialpad;
    const query = pad ? ui.dial : ui.phoneSearch;
    const list = (pad && ui.dial) || searching ? results(data, query, t) : favorites(data, ui, t, locale, byPhone);
    return `<div class="app-view kkd-app kkd-main${pad ? ' kkd-pad-up' : ''}"><div class="kkd-search"><input type="text" data-kk-dialer-search aria-label="${e(t('Type a name or phone number'))}" placeholder="${e(t('Type a name or phone number'))}" value="${e(ui.phoneSearch || '')}" autocomplete="off">${searching ? `<button data-action="kk-dialer-clear" aria-label="${e(t('Clear search'))}"><img src="assets/kd-ic_close_dk.png" alt=""></button>` : ''}<button data-action="voice-search" aria-label="${e(t('Voice search'))}"><img src="assets/kd-ic_voice_search.png" alt=""></button></div><div class="kkd-list" data-kk-dialer-list>${list}</div>${pad ? dialpad(ui.dial, t) : ''}<div class="kkd-bar"><button data-action="kk-dialer-history" aria-label="${e(t('Call History'))}"><img src="assets/kd-ic_menu_history_lt.png" alt=""></button>${pad ? `<button class="kkd-dial-button" data-action="call" aria-label="${e(t('dial'))}"><img src="assets/kd-ic_dial_action_call.png" alt=""></button>` : `<button data-action="kk-dialer-pad" aria-label="${e(t('Dial pad'))}"><img src="assets/kd-ic_menu_dialpad_lt.png" alt=""></button>`}<button data-action="phone-menu" aria-label="${e(t('More options'))}"><img src="assets/kd-ic_menu_overflow_lt.png" alt=""></button></div></div>`;
  }
  window.KKDialer = {COLORS, javaHash, tileColor, letterTile, speedDial, results, render, KEYS};
})();
