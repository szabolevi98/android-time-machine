/* Android 6.0.1 people data shared by Phone, Contacts and Messenger: the saved contacts and the call log, and the
   helpers their lists draw with.
   - The contacts and the used phone's call log (yesterday's call with Mom, then a missed call from Alex and the call back)
     are the simulator's own sample data, saved with the phone (MM.defaults).
   - LetterTileDrawable (ContactsCommon in Google Dialer 2.21 / Contacts 1.2): the colour is letter_tile_colors[|hash| %
     14] of the identifier's Java String.hashCode (letter_tile_default_color #cccccc without one), the letter the display
     name's first character upper-cased in sans-serif-medium white at letter_to_tile_ratio 67 % of the tile; a name that
     does not start with an English letter draws ic_person_white_120dp instead.
   - PhoneNumberUtils.formatNumber / the dialpad's PhoneNumberFormattingTextWatcher for the image's US SIM: NANP numbers
     as (202) 555-0148, typed digits as 555-0148 / (202) 555-01… while they are entered.
   - DateUtils.getRelativeTimeSpanString(time, now, MINUTE_IN_MILLIS, FORMAT_ABBREV_RELATIVE) (libcore's ICU
     RelativeDateTimeFormatter, short style): "5 min. ago", "2 hr. ago", "Yesterday", "3 days ago", then the abbreviated
     date. */
(() => {
  'use strict';
  const H = 3600000;
  MM.defaults.contacts = [
    {id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com'},
    {id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com'},
    {id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com'},
    {id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com', starred: true}
  ];
  MM.defaults.calls = [
    {id: 1, number: '202-555-0107', time: Date.now() - 26 * H, duration: 754, type: 'incoming'},
    {id: 2, number: '202-555-0148', time: Date.now() - 3 * H, duration: 0, type: 'missed'},
    {id: 3, number: '202-555-0148', time: Date.now() - 2.6 * H, duration: 132, type: 'outgoing'}
  ];

  const COLORS = ['#db4437', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#4285f4', '#039be5', '#0097a7', '#009688', '#0f9d58', '#689f38', '#ef6c00', '#ff5722', '#757575'];
  const javaHash = s => { let h = 0; for (const ch of String(s)) { for (let i = 0; i < ch.length; i++) h = (Math.imul(h, 31) + ch.charCodeAt(i)) | 0; } return h; };
  const digits = n => String(n || '').replace(/[^0-9+*#,;]/g, '');
  const same = (a, b) => { const x = digits(a).replace(/^\+?1(?=\d{10}$)/, ''), y = digits(b).replace(/^\+?1(?=\d{10}$)/, ''); return !!x && x === y; };

  function format(n) {
    const d = digits(n);
    if (/^\d{10}$/.test(d)) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    if (/^1\d{10}$/.test(d)) return `1 ${d.slice(1, 4)}-${d.slice(4, 7)}-${d.slice(7)}`;
    if (/^\d{7}$/.test(d)) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return n;
  }
  // As-you-type (AsYouTypeFormatter for US): 555-01 up to seven digits, (202) 555-01 up to ten.
  function typing(d) {
    if (!/^\d+$/.test(d) || d.length > 10 || d[0] === '1' || d[0] === '0') return d;
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  function tile(c, person, cls = '', circle = true) {
    const name = person?.name || '', ch = name.charAt(0);
    const color = name ? COLORS[Math.abs(javaHash(person.lookup || name)) % COLORS.length] : '#cccccc';
    const inner = /^[A-Za-z]$/.test(ch) ? `<b>${c.safe(ch.toUpperCase())}</b>` : '<img src="assets/gd-ic_person_white_120dp.png" alt="">';
    return `<span class="mmpp-tile${circle ? ' round' : ''} ${cls}" style="background:${color}" aria-hidden="true">${inner}</span>`;
  }

  function relative(c, time, now = Date.now()) {
    const loc = c.locale(), diff = Math.max(0, now - time);
    const cap = s => s.charAt(0).toLocaleUpperCase(loc) + s.slice(1);
    const rtf = new Intl.RelativeTimeFormat(loc, {style: 'short', numeric: 'always'});
    if (diff < H) return rtf.format(-Math.floor(diff / 60000), 'minute');
    if (diff < 24 * H) return rtf.format(-Math.floor(diff / H), 'hour');
    const d0 = new Date(now), d1 = new Date(time);
    const days = Math.round((new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()) - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / 864e5);
    if (days < 7) return cap(new Intl.RelativeTimeFormat(loc, {numeric: 'auto'}).format(-days, 'day'));
    return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric', ...(d1.getFullYear() !== d0.getFullYear() ? {year: 'numeric'} : {})}).format(d1);
  }

  /* vCard 2.1 as ContactsProvider's VCardComposer writes it for Export to .vcf file and Share (V21_GENERIC): N
     (family;given) and FN, TEL;CELL, EMAIL;HOME, ADR;HOME (the street field), ORG, TITLE, the nickname as
     X-ANDROID-CUSTOM:vnd.android.cursor.item/nickname, NOTE, URL; a value with non-ASCII text in
     CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE. ImportVCardActivity reads 2.1 and 3.0 back (NICKNAME too). */
  const qp = v => [...new TextEncoder().encode(v)].map(b => (b >= 33 && b <= 126 && b !== 61) ? String.fromCharCode(b) : '=' + b.toString(16).toUpperCase().padStart(2, '0')).join('');
  const prop = (name, v) => /[^ -~]/.test(v) ? `${name};CHARSET=UTF-8;ENCODING=QUOTED-PRINTABLE:${qp(v)}` : `${name}:${v}`;
  const vesc = v => String(v).replace(/([;\\])/g, '\\$1');
  function vcard(p) {
    const w = String(p.name || '').trim().split(/\s+/).filter(Boolean), family = w.length > 1 ? w.at(-1) : '', given = w.length > 1 ? w.slice(0, -1).join(' ') : w[0] || '';
    const out = ['BEGIN:VCARD', 'VERSION:2.1', prop('N', `${vesc(family)};${vesc(given)};;;`), prop('FN', p.name || '')];
    if (p.nickname) out.push(prop('X-ANDROID-CUSTOM', `vnd.android.cursor.item/nickname;${vesc(p.nickname)};1;;;;;;;;;;;;;`));
    if (p.phone) out.push(`TEL;CELL:${p.phone}`);
    if (p.email) out.push(prop('EMAIL;HOME', p.email));
    if (p.address) out.push(prop('ADR;HOME', `;;${vesc(p.address)};;;;`));
    if (p.company) out.push(prop('ORG', vesc(p.company)));
    if (p.title) out.push(prop('TITLE', p.title));
    if (p.note) out.push(prop('NOTE', p.note.replace(/\r?\n/g, '\\n')));
    if (p.website) out.push(prop('URL', p.website));
    out.push('END:VCARD');
    return out.join('\r\n');
  }
  function parseVcards(text) {
    const lines = String(text || '').replace(/=\r?\n/g, '').replace(/\r?\n[ \t]/g, '').split(/\r?\n/), out = [];
    const unq = v => v.replace(/\\n/gi, '\n').replace(/\\([;,\\])/g, '$1');
    const deqp = v => { const bytes = []; for (let i = 0; i < v.length; i++) { if (v[i] === '=' && /^[0-9A-F]{2}$/i.test(v.slice(i + 1, i + 3))) { bytes.push(parseInt(v.slice(i + 1, i + 3), 16)); i += 2; } else bytes.push(v.charCodeAt(i)); } return new TextDecoder().decode(new Uint8Array(bytes)); };
    const split = v => { const parts = []; let cur = ''; for (let i = 0; i < v.length; i++) { if (v[i] === '\\' && i + 1 < v.length) { cur += v[i] + v[i + 1]; i++; } else if (v[i] === ';') { parts.push(cur); cur = ''; } else cur += v[i]; } parts.push(cur); return parts.map(unq); };
    let p = null;
    for (const line of lines) {
      const i = line.indexOf(':'); if (i < 0) continue;
      const head = line.slice(0, i).split(';'), key = head[0].toUpperCase().replace(/^ITEM\d+\./, ''); let v = line.slice(i + 1);
      if (head.some(h => /QUOTED-PRINTABLE/i.test(h))) v = deqp(v);
      if (key === 'BEGIN') { p = {}; continue; }
      if (!p) continue;
      if (key === 'END') { if (!p.name && p.n) p.name = p.n; delete p.n; if (Object.keys(p).length) out.push(p); p = null; continue; }
      if (key === 'FN') p.name = unq(v).trim();
      else if (key === 'N') { const [f, g] = split(v); p.n = [g, f].filter(Boolean).join(' ').trim(); }
      else if (key === 'TEL' && !p.phone) p.phone = unq(v).trim();
      else if (key === 'EMAIL' && !p.email) p.email = unq(v).trim();
      else if (key === 'ADR' && !p.address) p.address = split(v).filter(Boolean).join(', ');
      else if (key === 'ORG') p.company = split(v)[0];
      else if (key === 'TITLE') p.title = unq(v);
      else if (key === 'NOTE') p.note = unq(v);
      else if (key === 'URL') p.website = unq(v);
      else if (key === 'NICKNAME') p.nickname = unq(v);
      else if (key === 'X-ANDROID-CUSTOM') { const parts = split(v); if (parts[0] === 'vnd.android.cursor.item/nickname') p.nickname = parts[1]; }
    }
    return out;
  }
  MM.people = {
    vcard, parseVcards,
    COLORS, javaHash, digits, same, format, typing, tile, relative,
    list: c => c.data.contacts || (c.data.contacts = JSON.parse(JSON.stringify(MM.defaults.contacts))),
    calls: c => c.data.calls || (c.data.calls = JSON.parse(JSON.stringify(MM.defaults.calls))),
    byNumber: (c, n) => MM.people.list(c).find(p => same(p.phone, n)) || null,
    byId: (c, id) => MM.people.list(c).find(p => p.id === +id) || null,
    // ContactsPreferences (Contacts › Settings and Phone › Display options write the same two values): Sort by first or
    // last name (sort_key / sort_key_alt) and the name format (display_name / display_name_alt, "Morgan, Alex").
    alt: p => { const w = String(p?.name || '').trim().split(/\s+/); return w.length > 1 ? `${w.at(-1)}, ${w.slice(0, -1).join(' ')}` : p?.name || ''; },
    displayName: (c, p) => MM.appPref?.(c, 'contacts', 'displayOrder', '1') === '2' ? MM.people.alt(p) : p?.name || '',
    byLast: c => MM.appPref?.(c, 'contacts', 'sortOrder', '1') === '2',
    sorted: (c, list = MM.people.list(c)) => { const key = MM.people.byLast(c) ? MM.people.alt : p => p.name; return [...list].sort((a, b) => key(a).localeCompare(key(b), c.locale())); },
    // ContactsContract.CommonDataKinds.Phone.getTypeLabel for TYPE_MOBILE (the only kind the sample contacts have).
    typeLabel: () => MM.text('phone').t('phoneTypeMobile'),
    log(c, entry) { const calls = MM.people.calls(c); calls.push({id: Math.max(0, ...calls.map(x => x.id)) + 1, ...entry}); c.save(); }
  };
})();
