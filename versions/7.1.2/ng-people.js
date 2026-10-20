/* Android 7.1.2 people data shared by Phone, Contacts and Messenger: the saved contacts and the call log, and the
   helpers their lists draw with. The logic is 6.0.1's (its people module); N2G48C's apps decide:
   - The contacts and the used phone's call log (yesterday's call with Mom, then a missed call from Alex and the call
     back) are the simulator's own sample data of every version (docs/demo-data.md), saved with the phone.
   - LetterTileDrawable (ContactsCommon in Google Dialer 8.0 and Contacts 1.4): letter_tile_colors[|hash| % 14] of the
     identifier's Java String.hashCode (#cccccc without one), the display name's first character upper-cased in
     sans-serif-medium white at 67 % of the tile; a name that does not start with an English letter draws the
     anonymous avatar (product_logo_avatar_anonymous_white_color_120).
   - PhoneNumberUtils.formatNumber / PhoneNumberFormattingTextWatcher for the image's US SIM: (202) 555-0148, typed
     digits as 555-0148 / (202) 555-01… while they are entered.
   - DateUtils.getRelativeTimeSpanString(time, now, MINUTE_IN_MILLIS, FORMAT_ABBREV_RELATIVE): "5 min. ago", "2 hr. ago",
     "Yesterday", "3 days ago", then the abbreviated date. */
(() => {
  'use strict';
  const H = 3600000;
  NG.defaults.contacts = [
    {id: 1, name: 'Alex Morgan', phone: '202-555-0148', email: 'alex@example.com', groups: ['friends']},
    {id: 2, name: 'Sam Rivera', phone: '202-555-0192', email: 'sam@example.com', groups: ['friends']},
    {id: 3, name: 'Taylor Lee', phone: '202-555-0116', email: 'taylor@example.com', groups: ['friends']},
    {id: 4, name: 'Mom', phone: '202-555-0107', email: 'mom@example.com', starred: true, groups: ['family']}
  ];
  NG.defaults.calls = [
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
    // A number of another length formats as PhoneNumberFormattingTextWatcher leaves it while it is typed.
    return /^\d+$/.test(d) ? typing(d) : n;
  }
  function typing(d) {
    if (!/^\d+$/.test(d) || d.length > 10 || d[0] === '1' || d[0] === '0') return d;
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }
  function tile(c, person, cls = '', circle = true) {
    const name = person?.name || '', ch = name.charAt(0);
    const color = name ? COLORS[Math.abs(javaHash(person.lookup || name)) % COLORS.length] : '#cccccc';
    const inner = /^[A-Za-z]$/.test(ch) ? `<b>${c.safe(ch.toUpperCase())}</b>` : '<img src="assets/gd-product_logo_avatar_anonymous_white_color_120.png" alt="">';
    return `<span class="ngpp-tile${circle ? ' round' : ''} ${cls}" style="background:${color}" aria-hidden="true">${inner}</span>`;
  }
  function relative(c, time, now = Date.now()) {
    const loc = c.locale(), diff = Math.max(0, now - time);
    const cap = s => s.charAt(0).toLocaleUpperCase(loc) + s.slice(1);
    const rtf = new Intl.RelativeTimeFormat(loc, {style: 'short', numeric: 'always'});
    if (diff < 60000) return cap(new Intl.RelativeTimeFormat(loc, {numeric: 'auto'}).format(0, 'minute'));
    if (diff < H) return rtf.format(-Math.floor(diff / 60000), 'minute');
    if (diff < 24 * H) return rtf.format(-Math.floor(diff / H), 'hour');
    const d0 = new Date(now), d1 = new Date(time);
    const days = Math.round((new Date(d0.getFullYear(), d0.getMonth(), d0.getDate()) - new Date(d1.getFullYear(), d1.getMonth(), d1.getDate())) / 864e5);
    if (days < 7) return cap(new Intl.RelativeTimeFormat(loc, {numeric: 'auto'}).format(-days, 'day'));
    return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric', ...(d1.getFullYear() !== d0.getFullYear() ? {year: 'numeric'} : {})}).format(d1);
  }
  NG.people = {
    COLORS, javaHash, digits, same, format, typing, tile, relative,
    list: c => c.data.contacts || (c.data.contacts = JSON.parse(JSON.stringify(NG.defaults.contacts))),
    calls: c => c.data.calls || (c.data.calls = JSON.parse(JSON.stringify(NG.defaults.calls))),
    byNumber: (c, n) => NG.people.list(c).find(p => same(p.phone, n)) || null,
    byId: (c, id) => NG.people.list(c).find(p => p.id === +id) || null,
    sorted: (c, list = NG.people.list(c)) => [...list].sort((a, b) => a.name.localeCompare(b.name, c.locale())),
    typeLabel: () => NG.text('phone').t('framework/phoneTypeMobile'),
    log(c, entry) { const calls = NG.people.calls(c); calls.push({id: Math.max(0, ...calls.map(x => x.id)) + 1, ...entry}); c.save(); }
  };
})();
