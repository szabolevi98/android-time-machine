/* Android 7.1.2 Gmail (Gmail 6.9.25, app/PrebuiltGmail of N2G48C), the app 'gmail', signed in with the phone's demo
   Google account (NG.account). The logic is 6.0.1's (its gmail module); the mail is the simulator's own sample data
   (docs/demo-data.md); the look is the image's layouts and styles:
   - First run: welcome_tour_activity.xml (ic_oobe_gmail_logo, "Welcome to Gmail" / "One app for all of your email",
     then ic_oobe_002 with the tabs text; the 56 dp bottom bar with Skip, CirclePageIndicator and Next / Done), then
     setup_addresses_fragment.xml (ic_oobe_003, the quantum_lightblue600 #039be5 title "You can use this app with all your
     email addresses. Learn more", the account, "Add an email address", TAKE ME TO GMAIL).
   - The inbox (conversation_list.xml, MailActivityTheme): the 56 dp toolbar in primary_color quantum_googred500 #db4437
     (contentInsetStart 72 dp; the status bar primary_dark_color #b93221) with the drawer toggle, the folder's name and
     search; on top of Primary the sectioned inbox teaser (section_teaser_view.xml: "Welcome to your new Inbox" 21 sp,
     folder_teaser_item.xml rows for Social, Promotions, Updates, Forums: 72 dp icon column, 16 sp bold name, 14 sp
     senders, the unread count), until it is swiped away; conversation_item_view.xml rows (88 dp at least: the 40 dp
     letter tile 16 dp down and 16 dp before the text — LetterTileProvider's 20 letter_tile_colors —, the 16 sp
     senders, the 12 sp date 8 dp after, the 14 sp subject and snippet 3 dp apart, ic_star_outline_20dp /
     ic_star_20dp); unread rows bold with the date in accent_blue. A row swiped sideways is archived: the
     swiped_bg_color_archive green behind it, then swipe_leavebehind.xml (#323232, 16 sp white "Archived", UNDO).
     The compose FAB (#db4437, ic_pencil_wht_24dp) 16 dp from the end and the bottom.
   - The drawer (GmailDrawerFragment, 264 dp): SelectedAccountNavigationView (selected_account.xml: 147 dp, the
     account_switcher_blue cover under a 40 % black scrim, the 64 dp avatar 16 dp down, the name in sans-serif-medium and
     the address at 72 %, white), folder_item.xml rows (48 dp, the 24 dp ic_drawer_* icon 16 dp in, the 16 sp
     sans-serif-medium name 32 dp after, the 14 sp unread count): Primary, Social, Promotions, Updates, Forums, then
     folder_list_header.xml's "All labels" (0.5 dp #1f000000 divider, 12 / 8 dp, #89000000) with Starred, Important,
     Sent, Outbox, Drafts, All mail, Spam, Trash; drawer_footer_item.xml's Settings and Help & feedback.
   - A conversation (secure_conversation_view.xml): the toolbar with archive, delete, mark unread and the overflow;
     conversation_view_header.xml (20 sp subject, 16 dp in and above, the 48 dp star); the message header (the 40 dp
     tile 16 dp down, the 16 sp sender, the 14 sp "to me" and the date, reply 48 dp and the overflow) and its body;
     conversation_footer.xml's Reply, Reply all, Forward (the icon over the label, 80 sp high).
   - Compose (compose.xml): the toolbar with attach and send and the overflow (Save draft, Discard); From, To (the
     ComposeHeading 56 dp: #89000000 labels 8 dp from the field, 16 dp in) and Subject, then "Compose email", 0.5 dp
     dividers.
   - Search: the toolbar's SearchView, the recent searches with ic_history_24dp, the results, empty_search. */
(() => {
  'use strict';
  const T = () => NG.text('gmail'), P = () => NG.people;
  const A = n => `assets/gm-${n}.png`, V = n => `assets/gm-${n}.svg`;
  const M = 60000, H = 3600000, D = 864e5;
  NG.defaults.mail = [
    {id: 1, from: 'Alex Morgan', email: 'alex@example.com', subject: 'Hike on Saturday?', body: 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone — the camera is supposed to be great.', time: Date.now() - 40 * M, unread: true, cat: 'primary', box: 'inbox'},
    {id: 2, from: 'Taylor Lee', email: 'taylor@example.com', subject: 'Slides for Monday', body: 'Here are the slides from the meetup. Let me know what you think before Monday.', time: Date.now() - 5 * H, unread: true, cat: 'primary', box: 'inbox'},
    {id: 3, from: 'Mom', email: 'mom@example.com', subject: 'Sunday lunch', body: 'Don’t forget Sunday lunch at ours. Bring dessert if you can!', time: Date.now() - 1.2 * D, unread: false, starred: true, cat: 'primary', box: 'inbox'},
    {id: 4, from: 'Sam Rivera', email: 'sam@example.com', subject: 'Photos from the trip', body: 'I finally sorted the photos from the trip. Most of them came out great, a few are blurry because someone kept moving.', time: Date.now() - 3 * D, unread: false, cat: 'primary', box: 'inbox'},
    {id: 5, from: 'Tech News', email: 'newsletter@technews.example', subject: 'This week: Nougat tips, split screen and more', body: 'Ten Nougat tips, the apps that work best side by side and the latest Nexus security updates.', time: Date.now() - 6 * H, unread: true, cat: 'promo', box: 'inbox'}
  ];
  const mail = c => c.data.mail || (c.data.mail = JSON.parse(JSON.stringify(NG.defaults.mail)));
  const ui = c => c.ui.gmail || (c.ui.gmail = {screen: '', folder: 'primary', drawer: false, tour: 0, draft: null});
  const esc = (c, s) => c.safe(s);
  const acct = () => NG.account || {name: '', email: ''};
  const FOLDERS = [['primary', 'label_inbox_section_personal', V('ic_drawer_inbox_24dp')], ['social', 'label_inbox_section_social', A('ic_drawer_social_24dp')], ['promo', 'label_inbox_section_promo', V('ic_drawer_promotions_24dp')],
    ['updates', 'label_inbox_section_notification', A('ic_drawer_updates_24dp')], ['forums', 'label_inbox_section_group', V('ic_drawer_forums_24dp')]];
  const LABELS = [['starred', 'mailbox_name_display_starred', A('ic_drawer_starred_24dp')], ['important', 'label_important', A('ic_drawer_important_24dp')], ['sent', 'mailbox_name_display_sent', A('ic_drawer_sent_24dp')],
    ['outbox', 'mailbox_name_display_outbox', A('ic_drawer_outbox_24dp')], ['drafts', 'mailbox_name_display_drafts', V('ic_drawer_drafts_24dp')], ['all', 'label_all', A('ic_drawer_allmail_24dp')],
    ['spam', 'label_spam', A('ic_drawer_junk_24dp')], ['trash', 'mailbox_name_display_trash', V('ic_drawer_trash_24dp')]];
  function inFolder(m, f) {
    if (FOLDERS.some(x => x[0] === f)) return m.box === 'inbox' && m.cat === f;
    if (f === 'starred') return m.starred && m.box !== 'trash';
    if (f === 'important') return m.box === 'inbox' && important(m);
    if (f === 'all') return m.box !== 'trash' && m.box !== 'spam' && m.box !== 'drafts';
    return m.box === f;
  }
  // Important: Gmail's own guess (the Primary mail) until marked otherwise.
  const important = m => m.important ?? m.cat === 'primary';
  const folderName = (c, f) => T().t([...FOLDERS, ...LABELS].find(x => x[0] === f)[1]);
  function date(c, time) {
    const d = new Date(time), now = new Date(), loc = c.locale();
    if (d.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit'}).format(d);
    if (d.getFullYear() === now.getFullYear()) return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric'}).format(d);
    return new Intl.DateTimeFormat(loc, {year: '2-digit', month: 'numeric', day: 'numeric'}).format(d);
  }
  // LetterTileProvider: letter_tile_colors[|hashCode(email)| % 20], the name's first letter in white.
  const COLORS = ['#e06055', '#f06292', '#ba68c8', '#b39ddb', '#9575cd', '#7986cb', '#9fa8da', '#5e97f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#57bb8a', '#9ccc65', '#aed581', '#f6bf26', '#ffa726', '#ff8a65', '#90a4ae', '#9e9e9e', '#a1887f'];
  const avatar = (c, name, email, cls) => { const ch = String(name || '?').charAt(0).toUpperCase(); return `<span class="nggm-tile ${cls}" style="background:${COLORS[Math.abs(P().javaHash(email || name)) % 20]}" aria-hidden="true">${/[A-Z]/.test(ch) ? esc(c, ch) : ''}</span>`; };
  const fromOf = m => m.box === 'sent' || m.box === 'drafts' ? acct() : {name: m.from, email: m.email};
  const icon = (src, cls = '') => `<img class="nggm-ic ${cls}" src="${src}" alt="">`;

  // ---- first run ---------------------------------------------------------------------------------------------------
  function tour(c) {
    const t = T(), u = ui(c), last = u.tour === 1;
    const pages = [`<div class="nggm-tpage"><div class="nggm-timg"><img src="${A('ic_oobe_gmail_logo')}" alt=""></div><div class="nggm-ttext"><h1>${esc(c, t.t('welcome_tour_welcome_new_title'))}</h1><p>${esc(c, t.t('welcome_tour_welcome_new_text'))}</p></div></div>`,
      `<div class="nggm-tpage"><div class="nggm-timg photo"><img src="assets/gm-ic_oobe_002.webp" alt=""></div><div class="nggm-ttext"><p class="large">${esc(c, t.t('welcome_tour_promo_text'))}</p></div></div>`];
    return `<div class="nggm nggm-tour"><div class="nggm-tpager">${pages[u.tour]}</div><i class="nggm-tsep"></i><div class="nggm-tbar">
      <button type="button" class="nggm-tact${last ? ' hide' : ''}" data-action="nggm-tdone">${esc(c, t.t('welcome_tour_bottombar_skip'))}</button><span class="nggm-dots">${pages.map((_, i) => `<i class="${i === u.tour ? 'on' : ''}"></i>`).join('')}</span>
      ${last ? `<button type="button" class="nggm-tact" data-action="nggm-tdone">${esc(c, t.t('done'))}</button>` : `<button type="button" class="nggm-tnext" data-action="nggm-tnext" aria-label="${esc(c, t.t('next'))}">${icon(V('ic_next_24dp'))}</button>`}</div></div>`;
  }
  function setup(c) {
    const t = T(), title = esc(c, t.t('setup_addresses_new_user_title')).replace('^1', `<u>${esc(c, t.t('learn_more'))}</u>`);
    return `<div class="nggm nggm-setup"><div class="nggm-sillu"><img src="assets/gm-ic_oobe_003.jpg" alt=""></div><div class="nggm-stitle">${title}</div>
      <div class="nggm-slist"><div class="nggm-acct"><img src="${A('avatar_placeholder')}" alt=""><span><b>${esc(c, acct().name)}</b><small>${esc(c, acct().email)}</small></span></div>
      <button type="button" class="nggm-sadd" data-action="nggm-addacct">${esc(c, t.t('welcome_tour_all_addresses_add_account'))}</button></div>
      <i class="nggm-tsep"></i><button type="button" class="nggm-sgo" data-action="nggm-setupdone">${esc(c, t.t('setup_addresses_ok'))}</button></div>`;
  }

  // ---- the list and the drawer -------------------------------------------------------------------------------------
  function row(c, m) {
    const t = T(), who = fromOf(m), mine = m.box === 'sent' || m.box === 'drafts';
    return `<div class="nggm-swipe" data-id="${m.id}"><div class="nggm-sbg">${icon(A('ic_archive_wht_24dp'), 'l')}${icon(A('ic_archive_wht_24dp'), 'r')}</div><div class="nggm-item${m.unread ? ' unread' : ''}" data-action="nggm-open" data-id="${m.id}">${avatar(c, who.name, who.email, 'nggm-av')}
      <div class="nggm-itext"><div class="nggm-irow"><b class="nggm-sender">${esc(c, mine ? t.t('me_object_pronoun') : m.from)}</b><span class="nggm-date">${esc(c, date(c, m.time))}</span></div>
      <div class="nggm-irow2"><span class="nggm-lines"><span class="nggm-subj">${esc(c, m.subject)}</span><span class="nggm-snip">${esc(c, m.body)}</span></span><button type="button" class="nggm-star" data-action="nggm-star" data-id="${m.id}" aria-label="${esc(c, t.t(m.starred ? 'remove_star' : 'add_star'))}">${icon(A(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp'))}</button></div></div></div></div>`;
  }
  // SectionedInboxTeaserView: the categories' unread mail, the senders of the newest.
  function teaser(c) {
    const t = T();
    const items = FOLDERS.slice(1).map(([id, key]) => { const list = mail(c).filter(m => inFolder(m, id)).sort((a, b) => b.time - a.time), unread = list.filter(m => m.unread).length;
      return `<button type="button" class="nggm-trow" data-action="nggm-folder" data-f="${id}">${icon(A('ic_drawer_folder_24dp'))}<span class="nggm-ttxt"><b>${esc(c, t.t(key))}</b><small>${esc(c, [...new Set(list.map(m => m.from))].join(', '))}</small></span><span class="nggm-tcount">${unread || ''}</span></button>`; }).join('');
    return `<div class="nggm-swipe nggm-teaser" data-teaser="1"><div class="nggm-tbox"><h2>${esc(c, t.t('sectioned_inbox_welcome_title'))}</h2><p>${esc(c, t.t('sectioned_inbox_welcome_text1'))}</p><a>${esc(c, t.t('learn_more'))}</a></div>${items}
      <div class="nggm-tbox"><p>${esc(c, t.t('sectioned_inbox_welcome_text2'))}</p><a data-action="nggm-settings">${esc(c, t.t('sectioned_inbox_welcome_change_categories'))}</a></div></div>`;
  }
  function list(c) {
    const t = T(), u = ui(c), items = mail(c).filter(m => inFolder(m, u.folder)).sort((a, b) => b.time - a.time);
    const rows = items.map(m => row(c, m)).join('');
    const emptyText = u.folder === 'spam' ? 'empty_spam_folder' : u.folder === 'trash' ? 'empty_trash_folder' : 'empty_inbox';
    const empty = `<div class="nggm-empty"><img src="${V('ic_empty_inbox_mat')}" alt=""><p>${esc(c, t.t(emptyText))}</p></div>`;
    const lb = u.leave ? `<div class="nggm-leave"><span>${esc(c, t.t(u.leave.text))}</span><button type="button" data-action="nggm-undo">${esc(c, t.t('undo'))}</button></div>` : '';
    return `<div class="nggm"><div class="nggm-bar"><button type="button" class="nggm-btn" data-action="nggm-drawer" aria-label="${esc(c, t.t('drawer_open'))}">${icon(V('ic_menu_wht_24dp'))}</button><span class="nggm-title">${esc(c, folderName(c, u.folder))}</span>
      <button type="button" class="nggm-btn" data-action="nggm-search" aria-label="${esc(c, t.t('search_hint'))}">${icon(V('ic_menu_search'))}</button></div>
      <div class="nggm-page nggm-list">${u.folder === 'primary' && !c.data.gmailTeaserGone ? teaser(c) : ''}${lb}${rows || empty}</div><button type="button" class="nggm-fab" data-action="nggm-compose" aria-label="${esc(c, t.t('compose'))}">${icon(A('ic_pencil_wht_24dp'))}</button>${u.drawer ? drawer(c) : ''}</div>`;
  }
  function drawer(c) {
    const t = T(), u = ui(c);
    const unread = f => mail(c).filter(m => inFolder(m, f) && m.unread).length;
    const frow = ([id, key, ic]) => `<button type="button" class="nggm-fold${u.folder === id ? ' on' : ''}" data-action="nggm-folder" data-f="${id}">${icon(ic)}<span>${esc(c, t.t(key))}</span><small>${unread(id) || ''}</small></button>`;
    return `<div class="nggm-scrim" data-action="nggm-drawer"></div><div class="nggm-drawer"><div class="nggm-head"><img class="nggm-cover" src="assets/gm-account_switcher_blue.jpg" alt=""><i class="nggm-hscrim"></i><img class="nggm-havatar" src="${A('avatar_placeholder')}" alt=""><div class="nggm-hacct"><b>${esc(c, acct().name)}</b><small>${esc(c, acct().email)}</small></div></div>
      <div class="nggm-folders">${FOLDERS.map(frow).join('')}<div class="nggm-fhead"><i></i><span>${esc(c, t.t('all_labels_heading'))}</span></div>${LABELS.map(frow).join('')}<i class="nggm-fdiv"></i>
      <button type="button" class="nggm-fold" data-action="nggm-settings">${icon(A('ic_drawer_settings_24dp'))}<span>${esc(c, t.t('menu_settings'))}</span></button><button type="button" class="nggm-fold" data-action="nggm-help">${icon(A('ic_drawer_help_24dp'))}<span>${esc(c, t.t('help_and_feedback'))}</span></button></div></div>`;
  }

  // ---- a conversation ----------------------------------------------------------------------------------------------
  function conversation(c, m) {
    const t = T(), mine = m.box === 'sent' || m.box === 'drafts', who = fromOf(m);
    const btn = (img, action, label) => `<button type="button" class="nggm-btn" data-action="${action}" aria-label="${esc(c, t.t(label))}">${icon(img)}</button>`;
    return `<div class="nggm nggm-conv"><div class="nggm-bar"><button type="button" class="nggm-btn" data-action="nggm-up">${icon(V('ic_arrow_back_wht_24dp'))}</button><i class="nggm-flex"></i>${btn(A('ic_archive_wht_24dp'), 'nggm-archive', 'archive')}${btn(V('ic_delete_wht_24dp'), 'nggm-delete', 'delete')}${btn(A('ic_mark_unread_wht_24dp'), 'nggm-unread', 'mark_unread')}${NG.menu.button(c, 'nggm-over')}</div>
      <div class="nggm-page nggm-cview"><div class="nggm-chead"><h1>${esc(c, m.subject)}${m.muted ? ` <span class="nggm-chip">${esc(c, t.t('label_ignored'))}</span>` : ''}</h1><button type="button" class="nggm-cstar" data-action="nggm-star" data-id="${m.id}">${icon(A(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp'))}</button></div>
      <div class="nggm-msg"><div class="nggm-mhead">${avatar(c, who.name, who.email, 'nggm-av')}<div class="nggm-mwho"><b>${esc(c, who.name)}</b><span>${esc(c, mine ? `${t.t('to')} ${m.email}` : `${t.t('to')} ${t.t('me_object_pronoun')}`)}</span><span>${esc(c, date(c, m.time))}</span></div>
        <button type="button" class="nggm-mbtn" data-action="nggm-reply" data-id="${m.id}" aria-label="${esc(c, t.t('reply'))}">${icon(A('ic_reply_24dp'))}</button><button type="button" class="nggm-mbtn" data-action="nggm-forward" data-id="${m.id}" aria-label="${esc(c, t.t('forward'))}">${icon(V('ic_overflow_24dp'))}</button></div><div class="nggm-body">${esc(c, m.body)}</div>${attachmentTiles(c,m.attachments)}</div>
      <div class="nggm-replies"><button type="button" data-action="nggm-reply" data-id="${m.id}">${icon(A('ic_reply_24dp'))}<span>${esc(c, t.t('reply'))}</span></button><button type="button" data-action="nggm-reply" data-id="${m.id}">${icon(A('ic_reply_all_24dp'))}<span>${esc(c, t.t('reply_all'))}</span></button><button type="button" data-action="nggm-forward" data-id="${m.id}">${icon(V('ic_forward_24dp'))}<span>${esc(c, t.t('forward'))}</span></button></div></div></div>`;
  }
  // compose_attachment_tile.xml / attachment_tile_body.xml of this Gmail: a 4dp tile background,
  // optional thumbnail and a 48dp information row with the MIME icon, title and 48dp remove target.
  function attachmentTiles(c, files = [], compose = false) {
    return `<div class="nggm-attachments">${files.map((f,i)=>`<div class="nggm-attachment">${f.photo && NG.photoLibrary?.find(c,f.photo) ? NG.media.svg(NG.photoLibrary.find(c,f.photo),'nggm-attachment-thumb') : ''}<div class="nggm-attachment-info"><button type="button" class="nggm-attachment-open" data-action="nggm-open-attachment" data-index="${i}">${icon(A(`ic_file_${['pdf','text','image','video','audio'].includes(f.type)?f.type:'file'}`))}<span><b>${esc(c,f.name)}</b><small>${esc(c,NG.fileSize(c,f.size||0,true))}</small></span></button>${compose?`<button type="button" class="nggm-attachment-remove" data-action="nggm-remove-attachment" data-index="${i}" aria-label="${esc(c,T().fmt('remove_attachment_desc',null,f.name))}">${icon(A('ic_close_24dp'))}</button>`:''}</div></div>`).join('')}</div>`;
  }
  // ---- compose -----------------------------------------------------------------------------------------------------
  function compose(c) {
    const t = T(), d = ui(c).draft;
    return `<div class="nggm nggm-compose"><div class="nggm-bar"><button type="button" class="nggm-btn" data-action="nggm-cback">${icon(V('ic_arrow_back_wht_24dp'))}</button><span class="nggm-title">${esc(c, t.t('compose'))}</span>
      <button type="button" class="nggm-btn" data-action="nggm-attach" aria-label="${esc(c, t.t('add_file_attachment'))}">${icon(A('ic_attach_file_wht_24dp'))}</button><button type="button" class="nggm-btn" data-action="nggm-send" aria-label="${esc(c, t.t('send'))}">${icon(A('ic_send_wht_24dp'))}</button>${NG.menu.button(c, 'nggm-over')}</div>
      <div class="nggm-page nggm-cform"><div class="nggm-cf"><span>${esc(c, t.t('from'))}</span><b>${esc(c, acct().email)}</b></div><i class="nggm-cdiv"></i>
      <label class="nggm-cf"><span>${esc(c, t.t('to'))}</span><input data-f="to" type="email" value="${esc(c, d.to)}" autocomplete="off" spellcheck="false">${icon(A('ic_expand_more_24dp'), 'nggm-ccbcc')}</label><i class="nggm-cdiv"></i>
      <input class="nggm-csubj" data-f="subject" value="${esc(c, d.subject)}" placeholder="${esc(c, t.t('subject_hint'))}" autocomplete="off"><i class="nggm-cdiv"></i><textarea class="nggm-cbody" data-f="body" placeholder="${esc(c, t.t('body_hint'))}">${esc(c, d.body)}</textarea>${attachmentTiles(c,d.attachments,true)}</div></div>`;
  }
  // Search (the toolbar's SearchView over the list): the recent searches while typing, the results once sent.
  function search(c) {
    const t = T(), u = ui(c), q = (u.q || '').trim(), recent = c.data.gmailSearches || [];
    let body = '';
    if (u.searched && q) {
      const ql = q.toLowerCase(), hits = mail(c).filter(m => m.box !== 'trash' && m.box !== 'spam' && [m.from, m.email, m.subject, m.body].some(x => (x || '').toLowerCase().includes(ql))).sort((a, b) => b.time - a.time);
      body = hits.length ? `<div class="nggm-shead">${esc(c, t.t('search_results_header'))}</div>${hits.map(m => row(c, m)).join('')}` : `<div class="nggm-empty"><img src="${V('ic_empty_search_mat')}" alt=""><p>${esc(c, t.fmt('empty_search', null, q))}</p></div>`;
    } else body = recent.filter(r => !q || r.toLowerCase().startsWith(q.toLowerCase())).map(r => `<button type="button" class="nggm-sugg" data-action="nggm-sugg" data-q="${esc(c, r)}">${icon(A('ic_history_24dp'))}<span>${esc(c, r)}</span></button>`).join('');
    return `<div class="nggm nggm-search"><div class="nggm-sbar"><button type="button" class="nggm-btn" data-action="nggm-sback" aria-label="${esc(c, t.t('search_back_desc'))}">${icon(A('ic_arrow_back_24dp'))}</button>
      <input class="nggm-sq" value="${esc(c, u.q || '')}" placeholder="${esc(c, t.t('search_hint'))}" autocomplete="off" spellcheck="false" enterkeyhint="search">${u.q ? `<button type="button" class="nggm-btn" data-action="nggm-sclear" aria-label="${esc(c, t.t('search_clear_desc'))}">${icon(V('abc_ic_clear_material'))}</button>` : ''}</div>
      <div class="nggm-page nggm-list">${body}</div></div>`;
  }
  // "Add an email address": Gmail's Set up email landing (Google, Personal (IMAP/POP), Exchange).
  function landing(c) {
    const t = T(), r = (k, type) => `<button type="button" class="nggm-lrow" data-action="nggm-ltype" data-type="${type}">${icon(V('ic_drawer_inbox_24dp'))}<span>${esc(c, t.t(k))}</span></button>`;
    return `<div class="nggm nggm-landing"><div class="nggm-bar"><button type="button" class="nggm-btn" data-action="nggm-lback">${icon(V('ic_arrow_back_wht_24dp'))}</button><span class="nggm-title">${esc(c, t.t('account_setup_landing_headline'))}</span></div>
      <div class="nggm-page">${r('account_disambig_type_google_title', 'google')}${r('account_disambig_type_personal_title', 'email')}${r('account_disambig_type_exchange_title', 'email')}</div></div>`;
  }

  function consume(c) {
    const sub = c.ui.sub || ''; if (!sub) return;
    c.ui.sub = '';
    const u = ui(c);
    // ComposeActivityGmail from ACTION_SEND: EXTRA_SUBJECT and EXTRA_TEXT fill the draft.
    if (sub === 'share') { const d = NG.shareTake?.(c) || {}; u.draft = {to: '', subject: d.subject || '', body: d.text || '', attachments: d.kind==='image'?[{name:d.name||'Photo.jpg',type:'image',photo:d.photo,size:3200000}]:[]}; u.screen = 'compose'; u.external = true; return; }
    if (sub.startsWith('folder:')) { u.folder = sub.slice(7); u.screen = ''; u.drawer = false; return; }
    if (sub.startsWith('to:')) { u.draft = {to: sub.slice(3), subject: '', body: ''}; u.screen = 'compose'; u.external = true; }
  }
  function render(c) {
    consume(c);
    const g = c.data.gmailSetup || 0, u = ui(c);
    if (g === 0) return tour(c);
    if (u.screen === 'landing') return landing(c);
    if (g === 1) return setup(c);
    if (u.screen === 'search') return search(c);
    if (u.screen === 'compose' && u.draft) return compose(c);
    if (u.screen.startsWith('conv:')) { const m = mail(c).find(x => x.id === +u.screen.slice(5)); if (m) return conversation(c, m); u.screen = ''; }
    return list(c);
  }
  function closeCompose(c, save) {
    const u = ui(c), d = u.draft;
    if (save && (d.to || d.subject || d.body || d.attachments?.length)) storeCompose(c,d,'drafts');
    else if(d.id){c.data.mail=mail(c).filter(m=>m.id!==d.id);c.save();}
    u.draft = null; u.screen = u.composeFrom || ''; u.composeFrom = '';
    if (u.external) { u.external = false; c.back(); return; }
    c.render();
  }
  function storeCompose(c,d,box){const all=mail(c);let m=all.find(m=>m.id===d.id&&m.box==='drafts');if(!m){m={id:Math.max(0,...all.map(x=>x.id))+1};all.push(m);}Object.assign(m,{from:acct().name,email:d.to,subject:d.subject,body:d.body,attachments:d.attachments||[],time:Date.now(),unread:false,cat:'primary',box});c.save();}
  function menu(c, anchor) {
    const t = T(), u = ui(c);
    if (u.screen === 'compose') return c.menu([{label: t.t('save_draft'), action: c => closeCompose(c, true)}, {label: t.t('discard'), action: c => { c.toast(t.t('message_discarded')); closeCompose(c, false); }}], anchor);
    const m = mail(c).find(x => x.id === +u.screen.slice(5)); if (!m) return;
    // ConversationActivity's menu: Move to, Change labels, the star, Mark (not) important, Mute, Print, Report spam,
    // Help & feedback; the toasts are the undo bar's texts.
    const leave = (c, text) => { u.screen = u.prev || ''; u.prev = ''; c.save(); c.toast(text.replace(/<\/?b>/g, '')); c.render(); };
    const sections = FOLDERS.map(f => f[0]);
    c.menu([{label: t.t('menu_move_to'), action: c => c.dialog({title: t.t('move_to_selection_dialog_title'), items: sections.map(f => ({html: `<span class="ngst-choice"><i class="ngw-radio ngst-radio${m.box === 'inbox' && m.cat === f ? ' on' : ''}" style="--ngw-accent:#4285f4"></i><span>${esc(c, folderName(c, f))}</span></span>`})),
        onItem: (i, c) => { m.box = 'inbox'; m.cat = sections[i]; leave(c, t.fmt('conversation_folder_moved', null, folderName(c, sections[i]))); }})},
      {label: t.t('menu_change_folders'), action: c => {
        const opts = [['inbox', 'mailbox_name_display_inbox', m.box === 'inbox'], ['starred', 'mailbox_name_display_starred', !!m.starred], ['important', 'label_important', important(m)]], on = opts.map(o => o[2]);
        c.dialog({title: t.t('change_folders_selection_dialog_title'), keepOpen: true, items: opts.map(([, k], i) => ({html: `<span class="ngst-choice"><i class="nggm-check${on[i] ? ' on' : ''}"></i><span>${esc(c, t.t(k))}</span></span>`})),
          onItem: (i, c) => { on[i] = !on[i]; c.el.overlay.querySelectorAll('.nggm-check')[i].classList.toggle('on', on[i]); },
          buttons: [{label: t.t('framework/cancel')}, {label: t.t('framework/ok'), action: c => {
            if (on[0] !== (m.box === 'inbox')) m.box = on[0] ? 'inbox' : 'archive';
            m.starred = on[1]; m.important = on[2];
            if (m.box !== 'inbox') leave(c, t.plural('conversation_folder_changed', 1)); else { c.save(); c.toast(t.plural('conversation_folder_changed', 1)); c.render(); }
          }}]});
      }},
      {label: t.t(m.starred ? 'remove_star' : 'add_star'), action: c => { m.starred = !m.starred; c.save(); c.render(); }},
      important(m) ? {label: t.t('mark_not_important'), action: c => { m.important = false; leave(c, t.plural('conversation_not_important', 1, null, 1)); }} : {label: t.t('mark_important'), action: c => { m.important = true; c.save(); c.render(); }},
      {label: t.t('mute'), action: c => { m.muted = true; if (m.box === 'inbox') m.box = 'archive'; leave(c, t.plural('conversation_muted', 1, null, 1)); }},
      {label: t.t('report_spam'), action: c => { m.box = 'spam'; leave(c, t.plural('conversation_spammed', 1, null, 1)); }}, {label: t.t('help_and_feedback'), action: c => c.open('help', 'gmail')}], anchor);
  }
  // A search sent: remembered first among the recent searches (ten at most).
  function submit(c, q) {
    const u = ui(c); u.q = q; u.searched = true;
    c.data.gmailSearches = [q, ...(c.data.gmailSearches || []).filter(x => x !== q)].slice(0, 10); c.save(); c.render();
  }
  // SwipeableListView: a row swiped past 40 % of its width (or flung) is archived and leaves the undo bar behind; the
  // teaser goes for good.
  function bindSwipes(c, root) {
    const u = ui(c), dp = c.el.screen.clientWidth / (1440 / 3.5);
    for (const sw of root.querySelectorAll('.nggm-swipe')) {
      const item = sw.querySelector('.nggm-item') || sw;
      sw.addEventListener('pointerdown', e => {
        if (e.button || e.target.closest('.nggm-star')) return;
        const x0 = e.clientX, y0 = e.clientY, w = sw.offsetWidth; let mode = '', last = [performance.now(), x0];
        const move = ev => {
          const dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!mode) { if (Math.hypot(dx, dy) < 8 * dp) return; mode = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; }
          if (mode !== 'x') return;
          ev.preventDefault(); last = [performance.now(), ev.clientX];
          item.style.translate = `${dx}px 0`; sw.classList.add('swiping'); sw.classList.toggle('right', dx < 0);
        };
        const end = ev => {
          window.removeEventListener('pointermove', move, true); window.removeEventListener('pointerup', end, true); window.removeEventListener('pointercancel', end, true);
          if (mode !== 'x') return;
          item.dataset.swiped = '1'; setTimeout(() => delete item.dataset.swiped, 0);
          const dx = ev.clientX - x0, v = (ev.clientX - last[1]) / Math.max(1, performance.now() - last[0]) * 1000 / dp;
          if (Math.abs(dx) > w * .4 || Math.abs(v) > 800) {
            if (sw.dataset.teaser) { c.data.gmailTeaserGone = true; c.save(); c.render(); return; }
            const m = mail(c).find(x => x.id === +sw.dataset.id); if (!m) return;
            u.leave = {id: m.id, box: m.box, text: 'archived'}; m.box = 'archive'; c.save(); c.render();
          } else { item.animate([{translate: `${dx}px 0`}, {translate: '0 0'}], {duration: 150}); item.style.translate = ''; sw.classList.remove('swiping'); }
        };
        window.addEventListener('pointermove', move, true); window.addEventListener('pointerup', end, true); window.addEventListener('pointercancel', end, true);
      });
    }
  }

  // MailPreferenceActivity: General settings, then the account's own header (gmail_account_preferences); the inbox
  // categories under Inbox categories. Vacation responder and the label manager open Gmail's web settings.
  if (NG.appPrefsHooks) NG.appPrefsHooks.gmail = {
    after: (c, xml) => xml === 'preference_headers' ? `<button type="button" class="ngst-pref" data-action="nggm-acctprefs"><span class="ngst-texts"><span class="ngst-title">${esc(c, acct().email)}</span></span></button>` : '',
    action(c, name) { if (name === 'nggm-acctprefs') { NG.appPrefsGo(c, 'gmail_account_preferences', acct().email); return true; } return false; },
    fragments: {GeneralPrefsFragment: 'general_preferences', InboxSectionsPreferenceFragment: 'inbox_section_preferences'},
    screens: {'inbox-settings': 'label_preferences'},
    hidden: ['vacation-responder', 'manage-labels', 'number-picker'],
    summary(c, key) { if (key === 'signature') return NG.appPref(c, 'gmail', key, '') || NG.text('appprefs').t('PrebuiltGmail/preferences_signature_summary_not_set'); return undefined; }
  };

  NG.register('gmail', {
    // The window animation's page (ng-core.js): deeper screens open over the ones they came from.
    page: c => NG.page('gmail', c.ui.gmail?.screen),
    statusColor: c => ui(c).drawer ? '#6f1e16' : '#b93221',
    // AlertDialogTheme: colorAccent accent_blue.
    dialogAccent: () => '#4285f4',
    render,
    mount(c, root) {
      root.querySelectorAll('.nggm-compose [data-f]').forEach(i => i.addEventListener('input', () => { ui(c).draft[i.dataset.f] = i.value; }));
      const to = root.querySelector('.nggm-compose [data-f="to"]'); if (to && !to.value) to.focus();
      const q = root.querySelector('.nggm-sq');
      if (q) {
        const u = ui(c);
        q.addEventListener('input', () => { const p = q.selectionStart; u.q = q.value; u.searched = false; c.render(); const g = c.el.viewport.querySelector('.nggm-sq'); if (g) { g.focus(); g.setSelectionRange(p, p); } });
        q.addEventListener('keydown', e => { if (e.key !== 'Enter' || !q.value.trim()) return; e.preventDefault(); submit(c, q.value.trim()); });
        if (!u.searched) setTimeout(() => q.focus(), 40);
      }
      const lst = root.querySelector('.nggm-list');
      if (lst) {
        bindSwipes(c, root);
        // The list keeps its place across redraws (an archive, the drawer, a star).
        const u = ui(c), key = `${u.screen}|${u.folder}`; lst.scrollTop = u.scroll?.[key] || 0;
        lst.addEventListener('scroll', () => { (u.scroll ||= {})[key] = lst.scrollTop; }, {passive: true});
      }
    },
    back(c) {
      const u = ui(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.screen === 'compose') { closeCompose(c, true); return true; }
      if (u.screen.startsWith('conv:') && u.prev) { u.screen = u.prev; u.prev = ''; c.render(); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.folder !== 'primary') { u.folder = 'primary'; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), m = mail(c).find(x => x.id === +(el.dataset.id || u.screen.slice(5)));
      if (u.leave && name !== 'nggm-undo') u.leave = null;
      switch (name) {
        case 'nggm-tnext': u.tour = 1; c.render(); return true;
        case 'nggm-tdone': c.data.gmailSetup = 1; c.save(); c.render(); return true;
        case 'nggm-setupdone': c.data.gmailSetup = 2; c.save(); c.render(); return true;
        case 'nggm-addacct': u.screen = 'landing'; c.render(); return true;
        case 'nggm-lback': u.screen = ''; c.render(); return true;
        case 'nggm-ltype': u.screen = ''; c.open('settings', 'accounts'); return true;
        case 'nggm-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'nggm-folder': u.folder = el.dataset.f; u.drawer = false; c.render(); return true;
        case 'nggm-settings': u.drawer = false; NG.openPrefs?.(c, 'gmail', 'preference_headers', t.t('menu_settings')); return true;
        case 'nggm-help': c.open('help', 'gmail'); return true;
        case 'nggm-search': u.screen = 'search'; u.q = ''; u.searched = false; c.render(); return true;
        case 'nggm-sback': u.screen = ''; c.render(); return true;
        case 'nggm-sclear': u.q = ''; u.searched = false; c.render(); return true;
        case 'nggm-sugg': submit(c, el.dataset.q); return true;
        case 'nggm-open': if (el.dataset.swiped || event?.target?.closest('.nggm-star')) return true; if(m.box==='drafts'){u.draft={id:m.id,to:m.email,subject:m.subject,body:m.body,attachments:(m.attachments||[]).map(f=>({...f}))};u.composeFrom='';u.screen='compose';c.render();return true;}m.unread = false; c.save(); u.prev = u.screen === 'search' ? 'search' : ''; u.screen = `conv:${m.id}`; c.render(); return true;
        case 'nggm-star': m.starred = !m.starred; c.save(); c.render(); return true;
        case 'nggm-undo': { const x = mail(c).find(y => y.id === u.leave?.id); if (x) x.box = u.leave.box; u.leave = null; c.save(); c.render(); return true; }
        case 'nggm-up': u.screen = u.prev || ''; u.prev = ''; c.render(); return true;
        case 'nggm-archive': m.box = 'archive'; u.screen = u.prev || ''; u.prev = ''; c.save(); u.leave = {id: m.id, box: 'inbox', text: 'archived'}; c.render(); return true;
        case 'nggm-delete': { const was = m.box; m.box = 'trash'; u.screen = u.prev || ''; u.prev = ''; c.save(); u.leave = {id: m.id, box: was, text: 'deleted'}; c.render(); return true; }
        case 'nggm-unread': m.unread = true; u.screen = ''; c.save(); c.render(); return true;
        case 'nggm-compose': u.draft = {to: '', subject: '', body: ''}; u.screen = 'compose'; c.render(); return true;
        case 'nggm-reply': u.composeFrom = u.screen; u.draft = {to: m.email, subject: /^Re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, body: ''}; u.screen = 'compose'; c.render(); return true;
        case 'nggm-forward': u.composeFrom = u.screen; u.draft = {to: '', subject: `Fwd: ${m.subject}`, body: `\n\n${m.body}`, attachments:(m.attachments||[]).map(f=>({...f}))}; u.screen = 'compose'; c.render(); return true;
        case 'nggm-cback': closeCompose(c, true); return true;
        // Attach file: DocumentsUI's GET_CONTENT picker.
        case 'nggm-attach': NG.pickDocument(c,{onPick:(c,files)=>{u.draft.attachments=[...(u.draft.attachments||[]),...files.map(n=>({...n}))];}}); return true;
        case 'nggm-remove-attachment': u.draft.attachments.splice(+el.dataset.index,1); c.render(); return true;
        case 'nggm-open-attachment': { const files=u.screen==='compose'?u.draft.attachments:m?.attachments;const file=files?.[+el.dataset.index];if(file)NG.viewDocument(c,file);return true; }
        case 'nggm-send': {
          const d = u.draft; if (!d.to.trim()) { c.el.viewport.querySelector('[data-f="to"]')?.focus(); return true; }
          storeCompose(c,d,'sent');
          c.toast(t.t('sending')); u.draft = null; u.screen = u.composeFrom || ''; u.composeFrom = ''; if (u.external) { u.external = false; c.back(); return true; } c.render(); return true;
        }
        case 'ng-menu': menu(c, el); return true;
      }
      return false;
    }
  });
})();
