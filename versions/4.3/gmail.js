/* Gmail 4.5.1 on the Nexus 4 (Gmail2.apk of the JWR66Y image). Gmail is built on the same UnifiedEmail code as
   the AOSP Email (kk-email.js renders the screens); this file adds what Gmail2 has on top, from its layouts and code:
   - the sectioned inbox teaser at the top of Primary (section_teaser_view.xml, folder_teaser_item.xml,
     SectionedInboxTeaserView): while onboarding the welcome box, every enabled section and the change-categories box;
     afterwards only the sections with unseen mail. Each section row has its ic_menu_inbox_*_holo_light icon tinted
     (SRC_IN) in the section colour on #eeeeee, the name, the unseen senders and the "%d New" count on that colour;
   - the drawer (FolderListFragment, account_item.xml, folder_list_header.xml, folder_item.xml, FolderItemView): the
     account with the radio button, the "Inbox" and "All labels" headings, the section icons (holo_dark when
     activated), unseen counts on the section colour for inbox sections, unread counts elsewhere (the total for
     Drafts and Outbox), the activated row in mail_app_blue (#33b5e5);
   - the action bar subtitle "%d unread" (actionbar_unread_messages, a plain string in 4.5.1), the personal level markers
     (Gmail2's ic_email_caret_*: » only to me, › to me and others, yellow if important),
     Archive in the conversation and selection bars, and the "Inbox" label chip under the subject in the system label
     colours (LabelColorUtils DEFAULT_COLORS #dddddd / #777777).
   Section colours come from the server, not from the APK: Social and Promotions as the Nexus 5 screenshots of
   Gmail 4.7 show them, the other sections LabelColorUtils' default label colour.
   The mailbox is a separate offline Gmail account; nothing is sent. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'jellybean.demo@gmail.com';
  // Gmail2's own words (stock-strings.js, group gmail): [hu, de, fr, es, English when it differs from the key].
  const tr = (lang, key) => { const row = window.StockStrings?.gmail?.[key]; return row ? AndroidStrings.pick(row, lang, key) : key; };
  // A plurals resource: "<key> one" holds the quantity "one" where the language has it.
  const count = (lang, key, n) => AndroidStrings.format(tr(lang, AndroidStrings.quantity(n, lang) === 'one' && window.StockStrings?.gmail?.[key + ' one'] ? key + ' one' : key), n);
  const INBOX = ['Primary', 'Social', 'Promotions', 'Updates', 'Forums', 'Priority Inbox'];
  const LABELS = ['Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  const FOLDERS = [...INBOX, ...LABELS];
  const CATEGORY = {Primary: 'primary', Social: 'social', Promotions: 'promotions', Updates: 'updates', Forums: 'forums'};
  const ICON = {primary: 'main', social: 'social', promotions: 'promotions', updates: 'notifications', forums: 'forums'};
  const COLOR = {social: '#4880d7', promotions: '#13a864'};
  const colorOf = id => COLOR[id] || '#dddddd';
  // A 2013 inbox: personal mail in Primary, Google+ in Social, Google Play offers in Promotions.
  const SAMPLES = [
    ['Google Nexus', 'nexus-noreply@google.com', 'Welcome to your Nexus 4 with Android 4.3, Jelly Bean', 'Discover what your new smartphone has to offer. Now that you own the Nexus 4, discover how you can tailor it to fit — and enhance — your life.', 'primary', true, 'only', 0],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone, the camera is supposed to be good.', 'primary', true, 'only', 1],
    ['Google Calendar', 'calendar-notification@google.com', 'Reminder: Coffee with Alex @ 11am', 'Coffee with Alex. When: 11am – 12pm. Calendar: ' + account, 'primary', false, 'only', 2],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — jelly beans are fine!', 'primary', false, 'only', 30],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', 'primary', false, 'list', 50],
    ['Google+', 'noreply-plus@google.com', 'Sam Rivera added you on Google+', 'Follow and share with Sam Rivera. Add Sam to your circles.', 'social', false, 'only', 3],
    ['Google+', 'noreply-plus@google.com', 'Taylor Lee shared a photo with you', 'Taylor Lee shared an album: Meetup 2013. View photos on Google+.', 'social', false, 'only', 26],
    ['Google Play', 'googleplay-noreply@google.com', 'New on Google Play: sweet deals for Jelly Bean', 'Apps, games, movies and books picked for your new Nexus 4 — this week only.', 'promotions', false, 'list', 6]
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id), body: String(item.body || ''), subject: String(item.subject || ''), to: String(item.to || ''), cc: String(item.cc || ''), bcc: String(item.bcc || ''), read: !!item.read, starred: !!item.starred}));
    return SAMPLES.map(([from, address, subject, body, category, important, personal, hoursAgo], i) => ({id: 'gm-' + (i + 1), from, address, to: account, subject, body, folder: 'Inbox', category, important, personal, created: now - hoursAgo * 36e5, read: i >= 3 && category === 'primary', starred: i === 1}));
  }
  /* Settings (audit step 5), Gmail 4.5.1 (Gmail2.apk of JWR66Y): preference_headers.xml (General settings, the account, About Gmail),
     general_preferences.xml, the account's account_preferences.xml and inbox_section_preferences.xml, in the
     image's words (stock-strings.js). Values live in data.gmailPrefs. Inbox categories: Primary always, Social and
     Promotions on, Updates and Forums off by default; a category turned off sends its mail back to Primary and leaves
     the inbox, the drawer and the teaser. The signature (EditTextPreference) is added to new mail as "\n\n%s". */
  const P = (lang, key) => { const row = window.StockStrings?.gmailprefs?.[key]; return row ? AndroidStrings.pick(row, lang, key) : key; };
  const GENERAL = [['list', 'removal-action', 'Archive & delete actions', ['Show archive only', 'Show delete only', 'Show archive & delete'], 0], ['check', 'swipe', 'Swipe to archive', 'In conversation list', true], ['check', 'sender-image', 'Sender image', 'Sender image summary', true], ['check', 'reply-all', 'Reply all', 'Reply all summary', false], ['check', 'auto-fit', 'Auto-fit messages', 'Auto-fit summary', true], ['list', 'auto-advance', 'Auto-advance', ['Newer', 'Older', 'Conversation list'], 2], ['list', 'text-size', 'Message text size', ['Tiny', 'Small', 'Normal', 'Large', 'Huge'], 2], ['list', 'snap-headers', 'Message actions', ['Always show', 'Only show in portrait', "Don't show"], 2], ['cat', 'Action Confirmations'], ['check', 'confirm-delete', 'Confirm before deleting', '', true], ['check', 'confirm-archive', 'Confirm before archiving', '', true], ['check', 'confirm-send', 'Confirm before sending', '', true]];
  const ACCOUNT = [['list', 'inbox-type', 'Inbox type', ['Default Inbox', 'Priority Inbox'], 0], ['screen', 'categories', 'Inbox categories'], ['check', 'notifications', 'Notifications', '', true], ['sound', 'label:Primary', 'Inbox sound & vibrate'], ['signature'], ['cat', 'Data usage'], ['check', 'sync', 'Sync Gmail', '', true], ['days'], ['screen', 'labels', 'Manage labels'], ['check', 'prefetch', 'Download attachments', 'Download attachments summary', true]];
  const CATEGORIES = [['fixed', 'primary', 'Primary', 'Primary summary'], ['check', 'social', 'Social', 'Social summary', true], ['check', 'promotions', 'Promotions', 'Promotions summary', true], ['check', 'updates', 'Updates', 'Updates summary', false], ['check', 'forums', 'Forums', 'Forums summary', false], ['cat', 'Starred category'], ['check', 'starred', 'Include starred in Primary', 'Changes appear after sync', false]];
  let categoriesOff = {}, labelSync = {}, syncDays = 30;
  const prefsOf = data => data.gmailPrefs || {};
  const pref = (data, key, fallback) => prefsOf(data)[key] ?? fallback;
  /* Inbox sound & vibrate and Manage labels (label_preferences.xml: Sync messages, then the Notifications category with
     Label notifications, Sound, Vibrate and Notify once; the label list shows each label's sync and notification
     summary, label_notification_summary_*), Days of mail to sync (IntegerPickerPreference) in the image's words
     (stock-strings.js, gmailprefs gx.*). Kept in data.gmailPrefs.labels and .days: a label synced for None shows no mail,
     Last N days only the mail of those days. */
  const G = (lang, key) => P(lang, 'gx.' + key);
  const DEFAULT_DAYS = 30;
  const toneDefault = () => { const key = window.SystemSounds?.DEFAULTS?.notifications; return window.SystemSounds?.SOUNDS?.notifications?.[key]?.[0] || ''; };
  const toneNames = () => ['', ...Object.values(window.SystemSounds?.SOUNDS?.notifications || {}).map(([title]) => title)];
  // Gmail's defaults: the inbox sections and the everyday labels sync the last days, All mail, Chats, Spam and Trash
  // nothing; notifications for the inbox (Primary) and Priority Inbox only.
  const labelDefault = name => ({sync: ['All mail', 'Chats', 'Spam', 'Trash'].includes(name) ? 'none' : 'recent', notify: ['Primary', 'Priority Inbox'].includes(name), tone: toneDefault(), vibrate: false, once: true});
  const labelOf = (data, name) => ({...labelDefault(name), ...(prefsOf(data).labels?.[name] || {})});
  const daysOf = data => Number(prefsOf(data).days) || DEFAULT_DAYS;
  const syncText = (data, name, lang) => { const l = labelOf(data, name), n = daysOf(data); return l.sync === 'none' ? G(lang, 'Sync: None') : l.sync === 'all' ? G(lang, 'Sync: All') : AndroidStrings.format(G(lang, AndroidStrings.quantity(n, lang) === 'one' ? 'Sync: Last %d days one' : 'Sync: Last %d days'), n); };
  function notifyText(data, name, lang) {
    const l = labelOf(data, name);
    if (!pref(data, 'notifications', true)) return G(lang, 'Notifications off summary');
    if (!l.notify) return '';
    return G(lang, `summary.${l.tone ? 'ring' : 'silent_ring'}${l.vibrate ? '_vibe' : ''}${l.once ? '_notify_once' : ''}`);
  }
  function labelPage(data, name, lang, row, check) {
    const l = labelOf(data, name), off = !pref(data, 'notifications', true), dim = off || !l.notify;
    const sub = (html, disabled) => disabled ? html.replace('<button type="button" class="gmp-row', '<button type="button" disabled class="gmp-row off') : html;
    return row('gmx-sync', name, G(lang, 'Sync messages'), syncText(data, name, lang)) + `<h4 class="gmp-cat">${e(G(lang, 'Label notifications header'))}</h4>`
      + sub(row('gmx-notify', name, G(lang, 'Label notifications'), off ? G(lang, 'Notifications off summary') : '', check(l.notify && !off)), off)
      + sub(row('gmx-tone', name, G(lang, 'Sound'), l.tone || G(lang, 'summary.silent_ring')), dim)
      + sub(row('gmx-vibrate', name, G(lang, 'Vibrate'), G(lang, l.vibrate ? 'Vibrate always' : 'Vibrate never')), dim)
      + sub(row('gmx-once', name, G(lang, 'Notify once'), '', check(l.once)), dim);
  }
  function labelDialog(data, ui, lang, emailT) {
    const d = ui.gmx; if (!d) return '';
    const l = labelOf(data, d.label), scrim = `<button type="button" class="gmp-scrim" data-action="gmx-close" aria-label="${e(emailT('Cancel'))}"></button>`;
    const choice = (id, label, on, action = 'gmx-pick') => `<button type="button" class="gmp-choice${on ? ' on' : ''}" data-action="${action}" data-id="${e(id)}" role="radio" aria-checked="${on}"><span>${e(label)}</span><i></i></button>`;
    const box = (title, inner, buttons) => `${scrim}<div class="gmp-dialog" role="dialog"><h3>${e(title)}</h3>${inner}<div class="gmp-buttons">${buttons}</div></div>`;
    const cancel = `<button type="button" data-action="gmx-close">${e(G(lang, 'Cancel'))}</button>`;
    if (d.kind === 'sync') { const n = daysOf(data); return box(G(lang, 'Sync messages'), choice('none', G(lang, 'Sync: None'), l.sync === 'none') + choice('recent', AndroidStrings.format(G(lang, AndroidStrings.quantity(n, lang) === 'one' ? 'Sync: Last %d days one' : 'Sync: Last %d days'), n), l.sync === 'recent') + choice('all', G(lang, 'Sync: All'), l.sync === 'all'), cancel); }
    if (d.kind === 'vibrate') return box(G(lang, 'Vibrate'), choice('1', G(lang, 'Vibrate always'), l.vibrate) + choice('0', G(lang, 'Vibrate never'), !l.vibrate), cancel);
    if (d.kind === 'tone') { const names = toneNames(), current = d.tone ?? Math.max(0, names.indexOf(l.tone)); return box(G(lang, 'Sound'), `<div class="gmx-list">${names.map((name, i) => choice(i, i ? name : G(lang, 'summary.silent_ring'), current === i, 'gmx-tone-pick')).join('')}</div>`, cancel + `<button type="button" data-action="gmx-tone-ok">${e(G(lang, 'OK'))}</button>`); }
    if (d.kind === 'days') return box(P(lang, 'Days of mail to sync'), `<input class="gmx-days" data-gmx-days type="number" inputmode="numeric" min="1" max="999" value="${daysOf(data)}" aria-label="${e(P(lang, 'Days of mail to sync'))}">`, cancel + `<button type="button" data-action="gmx-days-ok">${e(G(lang, 'OK'))}</button>`);
    return '';
  }
  function setLabel(ctx, name, change) { const prefs = ctx.data.gmailPrefs ||= {}; prefs.labels = {...(prefs.labels || {}), [name]: {...labelOf(ctx.data, name), ...change}}; ctx.save(); }
  function handlePref(action, id, ctx) {
    const {data, ui} = ctx, d = ui.gmx;
    switch (action) {
      case 'gmx-sync': case 'gmx-vibrate': case 'gmx-tone': ui.gmx = {kind: action.slice(4), label: id}; ctx.render(); return true;
      case 'gmx-days': ui.gmx = {kind: 'days'}; ctx.render(); ctx.root.querySelector('[data-gmx-days]')?.focus(); return true;
      case 'gmx-notify': setLabel(ctx, id, {notify: !labelOf(data, id).notify}); ctx.render(); return true;
      case 'gmx-once': setLabel(ctx, id, {once: !labelOf(data, id).once}); ctx.render(); return true;
      case 'gmx-pick': if (d?.kind === 'sync') setLabel(ctx, d.label, {sync: id}); if (d?.kind === 'vibrate') setLabel(ctx, d.label, {vibrate: id === '1'}); ui.gmx = null; ctx.render(); return true;
      case 'gmx-tone-pick': if (d) { d.tone = Number(id) || 0; if (d.tone) window.SystemSounds?.play('notifications', toneNames()[d.tone]); else window.SystemSounds?.stop(); } ctx.render(); return true;
      case 'gmx-tone-ok': if (d && d.tone !== undefined) setLabel(ctx, d.label, {tone: toneNames()[d.tone] || ''}); window.SystemSounds?.stop(); ui.gmx = null; ctx.render(); return true;
      case 'gmx-days-ok': { const n = Math.round(Number(ctx.root.querySelector('[data-gmx-days]')?.value)); if (n >= 1 && n <= 999) { (data.gmailPrefs ||= {}).days = n; ctx.save(); } ui.gmx = null; ctx.render(); return true; }
      case 'gmx-close': window.SystemSounds?.stop(); ui.gmx = null; ctx.render(); return true;
      
      default: return false;
    }
  }
  // Back inside Settings: a dialog, a label's page to where it was opened from, Manage labels to the account.
  function prefBack(ui, ctx) {
    if (ui.gmx) { window.SystemSounds?.stop(); ui.gmx = null; return true; }
    
    if (ui.gmPref?.startsWith('label:')) { ui.gmPref = ui.gmLabelFrom || 'account'; return true; }
    if (ui.gmPref === 'labels') { ui.gmPref = 'account'; return true; }
    return false;
  }
  /* About Gmail (preference_headers.xml's AboutFragment, about_activity.xml): the logo, "Version %s" with the
     APK's versionName, "©%d Google Inc." with the year, Send feedback and "Tell us what you think" only where Google
     Feedback is installed (Utils.isGoogleFeedbackInstalled: the Nexus 4 image ships GoogleFeedback.apk), a 2 dp #666666 rule, about_desc,
     Open source licenses (LicenseActivity's WebView over res/raw/licenses.html) and the Privacy Policy link. */
  const VERSION = '4.5.1-776638', FEEDBACK = true;
  function about(lang, T) {
    const link = (action, label) => `<button type="button" class="gmp-link" data-action="${action}">${e(label)}</button>`;
    return `<div class="gmp-about"><img class="gmp-logo" src="assets/gm-logo.png" alt="Gmail"><p class="gap">${e(AndroidStrings.format(T('Version %s'), VERSION))}</p><p>${e(AndroidStrings.format(T('©%d Google Inc.'), new Date().getFullYear()))}</p>`
      + (FEEDBACK ? `<p class="gap">${link('gmail-unavailable', T('Send feedback'))}</p><p>${e(T('Tell us what you think'))}</p>` : '')
      + `<hr><p>${e(T('About desc'))}</p><p class="gap">${link('gmail-licenses', T('Open source licenses'))}</p><p class="gap">${link('gmail-unavailable', T('Privacy Policy'))}</p></div>`;
  }
  const categoryOn = (data, id) => pref(data, 'category-' + id, (CATEGORIES.find(row => row[1] === id) || [])[4] ?? true);
  function settings(data, ui, lang, emailT) {
    const T = key => P(lang, key), page = ui.gmPref || '';
    const screens = {general: GENERAL, account: ACCOUNT, categories: CATEGORIES};
    const row = (action, id, label, summary = '', extra = '', icon = '') => `<button type="button" class="gmp-row${icon ? ' with-icon' : ''}" data-action="${action}" data-id="${e(id)}">${icon}<span class="gmp-text"><b>${e(label)}</b>${summary ? `<small>${e(summary)}</small>` : ''}</span>${extra}</button>`;
    const check = on => `<i class="gmp-check${on ? ' on' : ''}" role="checkbox" aria-checked="${!!on}"></i>`;
    const value = item => item[1].startsWith('category-') ? categoryOn(data, item[1].slice(9)) : pref(data, item[1], item[4]);
    let body = '';
    if (!page) body = [['general', 'General settings'], ['account', account], ['about', 'About Gmail']].map(([id, label]) => row('gmail-pref', id, id === 'account' ? label : T(label))).join('');
    else if (screens[page]) body = screens[page].map(item => {
      if (item[0] === 'cat') return `<h4 class="gmp-cat">${e(T(item[1]))}</h4>`;
      // Inbox sound & vibrate depends on Notifications (dependency="notifications-enabled").
      if (item[0] === 'sound') { const html = row('gmail-pref', item[1], T(item[2]), notifyText(data, 'Primary', lang)); return pref(data, 'notifications', true) ? html : html.replace('class="gmp-row', 'disabled class="gmp-row off'); }
      if (item[0] === 'days') return row('gmx-days', 'days', T('Days of mail to sync'), AndroidStrings.format(G(lang, 'Sync last %d days'), daysOf(data)));
      if (item[0] === 'signature') { const sig = pref(data, 'signature', ''); return row('gmail-signature', 'signature', T('Signature'), sig || T('Not set')); }
      if (item[0] === 'screen') return row('gmail-pref', item[1], T(item[2]));
      if (item[0] === 'unsupported') return row('gmail-unavailable', item[1], T(item[2]));
      if (item[0] === 'list') return row('gmail-pref-list', item[1], T(item[2]), T(item[3][pref(data, item[1], item[4])]));
      const icon = page === 'categories' ? `<i class="gmp-cat-icon gmp-${item[1]}"></i>` : '';
      if (item[0] === 'fixed') return row('gmail-noop', item[1], T(item[2]), T(item[3]), '', icon);
      const on = page === 'categories' && item[1] !== 'starred' ? categoryOn(data, item[1]) : pref(data, item[1], item[4]);
      return row('gmail-pref-toggle', page === 'categories' && item[1] !== 'starred' ? 'category-' + item[1] : item[1], T(item[2]), item[3] ? T(item[3]) : '', check(on), icon);
    }).join('');
    else if (page === 'about') body = about(lang, T);
    else if (page === 'licenses') body = `<iframe class="gmp-licenses" src="assets/gm-licenses.html" title="${e(T('Open source licenses'))}"></iframe>`;
    else if (page === 'labels') body = FOLDERS.map(name => row('gmail-pref', 'label:' + name, tr(lang, name), [syncText(data, name, lang), notifyText(data, name, lang)].filter(Boolean).join('\n'))).join('');
    else if (page.startsWith('label:')) body = labelPage(data, page.slice(6), lang, row, check);
    const title = !page ? T('Settings') : page === 'general' ? T('General settings') : page === 'about' ? T('About Gmail') : page === 'licenses' ? T('Open source licenses') : page === 'categories' ? T('Inbox categories') : page === 'labels' ? T('Manage labels') : page.startsWith('label:') ? (page === 'label:Primary' && ui.gmLabelFrom !== 'labels' ? T('Inbox sound & vibrate') : tr(lang, page.slice(6))) : account;
    const list = ui.gmPrefList && [...GENERAL, ...ACCOUNT].find(item => item[0] === 'list' && item[1] === ui.gmPrefList);
    const dialog = ui.gmx ? labelDialog(data, ui, lang, emailT) : list ? `<button type="button" class="gmp-scrim" data-action="gmail-pref-close" aria-label="${e(emailT('Cancel'))}"></button><div class="gmp-dialog" role="dialog"><h3>${e(T(list[2]))}</h3>${list[3].map((label, i) => `<button type="button" class="gmp-choice${pref(data, list[1], list[4]) === i ? ' on' : ''}" data-action="gmail-pref-pick" data-id="${list[1]}:${i}" role="radio" aria-checked="${pref(data, list[1], list[4]) === i}"><span>${e(T(label))}</span><i></i></button>`).join('')}<div class="gmp-buttons"><button type="button" data-action="gmail-pref-close">${e(emailT('Cancel'))}</button></div></div>`
      : ui.gmSignature !== undefined ? `<button type="button" class="gmp-scrim" data-action="gmail-pref-close" aria-label="${e(emailT('Cancel'))}"></button><div class="gmp-dialog" role="dialog"><h3>${e(T('Signature dialog'))}</h3><textarea class="gmp-signature" data-gmail-signature data-no-translate rows="3">${e(ui.gmSignature)}</textarea><div class="gmp-buttons"><button type="button" data-action="gmail-pref-close">${e(emailT('Cancel'))}</button><button type="button" data-action="gmail-signature-save">${e(emailT('OK'))}</button></div></div>` : '';
    return `<div class="app-view gmp-app"><header class="gmp-bar"><button type="button" class="gmp-up" data-action="back" aria-label="${e(emailT('Navigate up'))}"><img class="gmp-caret" src="assets/ic_ab_back_holo_light.png" alt=""><img class="gmp-icon" src="assets/gmail.png" alt=""></button><b data-no-translate>${e(title)}</b></header><div class="gmp-scroll">${body}</div>${dialog}</div>`;
  }
  const live = item => !['Trash', 'Spam'].includes(item.folder);
  function list(mail, folder = 'Primary', query = '') {
    const q = query.toLocaleLowerCase();
    const match = item => {
      if (CATEGORY[folder]) return item.folder === 'Inbox' && !categoriesOff[CATEGORY[folder]] && (categoriesOff[item.category] ? 'primary' : item.category || 'primary') === CATEGORY[folder];
      if (folder === 'Priority Inbox') return item.folder === 'Inbox' && item.important;
      if (folder === 'Starred') return item.starred && live(item);
      if (folder === 'Important') return item.important && live(item);
      if (folder === 'All mail') return live(item) && item.folder !== 'Drafts';
      if (folder === 'Chats') return false;
      return item.folder === folder;
    };
    // The sync window counts back from the newest mail (the last sync), not from the browser's clock.
    const sync = labelSync[folder] || 'recent', since = Math.max(0, ...mail.map(item => item.created || 0)) - syncDays * 864e5;
    if (sync === 'none') return [];
    return mail.filter(item => match(item) && (sync === 'all' || (item.created || Date.now()) >= since) && (!q || [item.from, item.to, item.subject, item.body].join(' ').toLocaleLowerCase().includes(q))).sort((a, b) => (b.created || 0) - (a.created || 0));
  }
  const unread = (mail, folder) => list(mail, folder).filter(item => !item.read).length;
  // Folder.unseenCount: unread mail that came after the section was last opened (data.gmailSeen); the app opens on Primary.
  let seen = {};
  const unseenItems = (mail, folder) => folder === 'Primary' || !CATEGORY[folder] ? [] : list(mail, folder).filter(item => !item.read && (item.created || 0) > (seen[folder] || 0));
  const SECTIONS = ['Social', 'Promotions', 'Updates', 'Forums'];
  // The top of Primary: SectionedInboxTeaserView (welcome and change-categories boxes until a conversation has been opened).
  function top(mail, folder, lang, data) {
    if (folder !== 'Primary') return '';
    const T = key => tr(lang, key), onboarding = !data.gmailWelcomeSeen;
    const row = name => {
      const id = CATEGORY[name], items = unseenItems(mail, name);
      if (categoriesOff[id] || (!onboarding && !items.length)) return '';
      const senders = [...new Set(items.map(item => item.from))].join(', ');
      return `<button type="button" class="gm-section" data-action="email-folder" data-id="${name}" style="--gm-color:${colorOf(id)}"><span class="gm-section-icon"><i style="--gm-icon:url('assets/gm-ic_menu_inbox_${ICON[id]}_holo_light.png')"></i></span><span class="gm-section-copy"><b>${e(T(name))}</b><small>${e(senders)}</small></span><em>${e(count(lang, '%d New', items.length))}</em></button>`;
    };
    const rows = SECTIONS.map(row).join('');
    if (!onboarding && !rows) return '';
    return `<div class="gm-teaser">${onboarding ? `<button type="button" class="gm-welcome" data-action="gmail-unavailable"><b>${e(T('Welcome to your new Inbox'))}</b><span>${e(T('Welcome text'))}</span><span class="gm-link">${e(T('Learn more'))}</span></button>` : ''}<div class="gm-sections">${rows}</div>${onboarding ? `<button type="button" class="gm-welcome gm-change" data-action="gmail-categories"><span>${e(T('Categories text'))}</span><span class="gm-link">${e(T('Change categories'))}</span></button>` : ''}</div>`;
  }
  function marker(item) {
    if (!item.personal || item.folder === 'Sent' || item.folder === 'Drafts') return '';
    const file = `ic_email_caret_${item.personal === 'only' ? 'double' : 'single'}${item.important ? '_important_unread' : ''}`;
    return `<img class="gm-caret" src="assets/kem-${file}.png" alt="">`;
  }
  function drawer(mail, ui, lang) {
    const T = key => tr(lang, key), folder = ui.emailFolder || 'Primary', total = unread(mail, 'Primary');
    const row = name => {
      const id = CATEGORY[name], on = name === folder, unseen = unseenItems(mail, name).length;
      const n = ['Drafts', 'Outbox'].includes(name) ? list(mail, name).length : unread(mail, name);
      const badge = unseen ? `<em class="gm-unseen" style="background:${colorOf(id)}">${unseen}</em>` : n ? `<em>${n}</em>` : '';
      const icon = id ? `<img class="gm-folder-icon" src="assets/gm-ic_menu_inbox_${ICON[id]}_holo_${on ? 'dark' : 'light'}.png" alt="">` : '';
      return `<button type="button" class="gm-folder${on ? ' on' : ''}${icon ? ' with-icon' : ''}" data-action="email-folder" data-id="${name}">${icon}<span>${e(T(name))}</span>${badge}</button>`;
    };
    return `<div class="kem-drawer-scrim" data-action="close-overlay"></div><nav class="kem-drawer gm-drawer" aria-label="Gmail"><button type="button" class="gm-account" data-action="close-overlay"><img src="assets/kem-ic_radiobutton_selected.png" alt=""><span>${e(account)}</span>${total ? `<em>${total}</em>` : ''}</button><h4>${e(T('Inbox heading'))}</h4>${INBOX.filter(name => !categoriesOff[CATEGORY[name]]).map(row).join('')}<h4>${e(T('All labels'))}</h4>${LABELS.map(row).join('')}</nav>`;
  }
  // Options for KKEmail.render / overlay.
  function options(data, ui, lang, emailT) {
    const mail = data.gmailbox;
    categoriesOff = Object.fromEntries(['social', 'promotions', 'updates', 'forums'].map(id => [id, !categoryOn(data, id)]));
    seen = data.gmailSeen || {};
    labelSync = Object.fromEntries(FOLDERS.map(name => [name, labelOf(data, name).sync])); syncDays = daysOf(data);
    return {
      app: 'gmail', icon: 'gmail.png', account, archive: true, teaserDismissed: !!data.gmailTeaserDismissed,
      list, folderName: folder => tr(lang, folder),
      subtitle: folder => { const n = unread(mail, folder); return n && folder !== 'Sent' && folder !== 'Drafts' ? count(lang, '%d unread', n) : account; },
      top: folder => top(mail, folder, lang, data),
      marker,
      chip: item => item.folder === 'Inbox' ? `<span class="gm-chip">${e(tr(lang, 'Inbox'))}</span>` : '',
      drawer: () => drawer(mail, ui, lang)
    };
  }
  window.GmailApp = {account, FOLDERS, tr, restore, list, unread, options, settings, handlePref, prefBack};
})();
