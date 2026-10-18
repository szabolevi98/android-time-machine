/* Android 6.0.1 Gmail (Gmail 5.7, app/PrebuiltGmail of MTC20K), the app 'gmail', signed in with the phone's demo
   Google account (MM.account, as the other versions have theirs). The mail is the simulator's own sample data.
   - First run: welcome_tour_activity.xml (the pager with welcome_tour_welcome_fragment.xml's ic_oobe_gmail_logo,
     "Welcome to Gmail" / "One app for all of your email", then welcome_tour_promo_fragment.xml's ic_oobe_002 and the tabs
     text; the 56 dp bottom bar with Skip, the page dots and Next / Done), then setup_addresses_fragment.xml (ic_oobe_003,
     the #039be5 title "You can use this app with all your email addresses. Learn more", the account, "Add an email
     address", TAKE ME TO GMAIL).
   - The inbox (conversation_list.xml): the 56 dp toolbar in primary_color #da4336 (the status bar primary_dark_color
     #b93221) with the drawer button (ic_menu_wht_24dp), the folder name and search; conversation_item_view.xml rows
     (88 dp minimum, 16 dp margins: the 40 dp letter-tile avatar 16 dp down and 16 dp before the text, the 16 sp sender,
     the 12 sp date at the end (accent_blue #4285f4 when unread), the 14 sp subject and snippet, ic_star_outline_20dp /
     ic_star_20dp); unread rows bold. Dates: the time today, else month and day, else the numeric date. The compose FAB
     (compose_button in the primary colour, ic_pencil_wht_24dp) 16 dp from the right and bottom.
   - The drawer (264 dp): selected_account.xml's 147 dp header (the cover under a 40 % black scrim, avatar_placeholder,
     the account name and address in white, the latter at 72 %), folder_item.xml rows (48 dp, the 24 dp ic_drawer_*
     icons 16 dp in, the 16 sp name 32 dp after, the unread count): Primary, Social, Promotions, Updates, Forums, then
     folder_list_header.xml's "All labels" (0.5 dp divider, 12 / 8 dp, #9e9e9e) with Starred, Important, Sent, Outbox,
     Drafts, All mail, Spam, Trash; drawer_footer_item.xml's Settings and Help & feedback.
   - A conversation: the toolbar with archive, delete, mark unread and the overflow; the 20 sp subject (16 dp sides) with
     the star; each message's header (the 40 dp avatar, the 16 sp sender, 14 sp "to me", the 12 sp date, reply and the
     overflow) and its body; reply, reply all, forward below the last one.
   - Compose (compose.xml): the toolbar with attach (ic_attach_file_wht_24dp), send (ic_send_wht_24dp) and the overflow
     (Save draft, Discard); From with the account, To, Subject and "Compose email", 0.5 dp dividers. */
(() => {
  'use strict';
  const T = () => MM.text('gmail'), P = () => MM.people;
  const A = n => `assets/gm-${n}.png`;
  const M = 60000, H = 3600000, D = 864e5;
  MM.account = {name: 'Nexus 5X', email: 'nexus5x.demo@gmail.com'};
  MM.defaults.mail = [
    {id: 1, from: 'Alex Morgan', email: 'alex@example.com', subject: 'Hike on Saturday?', body: 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone — the camera is supposed to be great.', time: Date.now() - 40 * M, unread: true, cat: 'primary', box: 'inbox'},
    {id: 2, from: 'Taylor Lee', email: 'taylor@example.com', subject: 'Slides for Monday', body: 'Here are the slides from the meetup. Let me know what you think before Monday.', time: Date.now() - 5 * H, unread: true, cat: 'primary', box: 'inbox'},
    {id: 3, from: 'Mom', email: 'mom@example.com', subject: 'Sunday lunch', body: 'Don’t forget Sunday lunch at ours. Bring dessert if you can — marshmallows are fine!', time: Date.now() - 1.2 * D, unread: false, starred: true, cat: 'primary', box: 'inbox'},
    {id: 4, from: 'Sam Rivera', email: 'sam@example.com', subject: 'Photos from the trip', body: 'I finally sorted the photos from the trip. Most of them came out great, a few are blurry because someone kept moving.', time: Date.now() - 3 * D, unread: false, cat: 'primary', box: 'inbox'},
    {id: 5, from: 'Tech News', email: 'newsletter@news.example', subject: 'This week: Doze, Now on Tap and more', body: 'What Doze means for your battery, five apps to try this week and the latest Nexus security updates.', time: Date.now() - 6 * H, unread: true, cat: 'promo', box: 'inbox'}
  ];
  const mail = c => c.data.mail || (c.data.mail = JSON.parse(JSON.stringify(MM.defaults.mail)));
  const ui = c => c.ui.gmail || (c.ui.gmail = {screen: '', folder: 'primary', drawer: false, tour: 0, draft: null});
  const esc = (c, s) => c.safe(s);
  const FOLDERS = [['primary', 'label_inbox_section_personal', 'ic_drawer_inbox_24dp'], ['social', 'label_inbox_section_social', 'ic_drawer_social_24dp'], ['promo', 'label_inbox_section_promo', 'ic_drawer_promotions_24dp'],
    ['updates', 'label_inbox_section_notification', 'ic_drawer_updates_24dp'], ['forums', 'label_inbox_section_group', 'ic_drawer_forums_24dp']];
  const LABELS = [['starred', 'mailbox_name_display_starred', 'ic_drawer_starred_24dp'], ['important', 'label_important', 'ic_drawer_important_24dp'], ['sent', 'mailbox_name_display_sent', 'ic_drawer_sent_24dp'],
    ['outbox', 'mailbox_name_display_outbox', 'ic_drawer_outbox_24dp'], ['drafts', 'mailbox_name_display_drafts', 'ic_drawer_drafts_24dp'], ['all', 'label_all', 'ic_drawer_allmail_24dp'],
    ['spam', 'label_spam', 'ic_drawer_junk_24dp'], ['trash', 'mailbox_name_display_trash', 'ic_drawer_trash_24dp']];
  function inFolder(m, f) {
    if (FOLDERS.some(x => x[0] === f)) return m.box === 'inbox' && m.cat === f;
    if (f === 'starred') return m.starred && m.box !== 'trash';
    if (f === 'important') return m.box === 'inbox' && m.cat === 'primary';
    if (f === 'all') return m.box !== 'trash' && m.box !== 'spam' && m.box !== 'drafts';
    return m.box === f;
  }
  const folderName = (c, f) => T().t([...FOLDERS, ...LABELS].find(x => x[0] === f)[1]);
  function date(c, time) {
    const d = new Date(time), now = new Date(), loc = c.locale();
    if (d.toDateString() === now.toDateString()) return new Intl.DateTimeFormat(loc, {hour: 'numeric', minute: '2-digit'}).format(d);
    if (d.getFullYear() === now.getFullYear()) return new Intl.DateTimeFormat(loc, {month: 'short', day: 'numeric'}).format(d);
    return new Intl.DateTimeFormat(loc, {year: '2-digit', month: 'numeric', day: 'numeric'}).format(d);
  }
  const avatar = (c, name, cls) => P().tile(c, {name}, cls);
  // Gmail's widget (mm-widgets.js) lists the Primary inbox with the same dates.
  MM.gmailWidget = c => ({title: folderName(c, 'primary'), items: mail(c).filter(m => inFolder(m, 'primary')).sort((a, b) => b.time - a.time), date: time => date(c, time)});

  // ---- first run ---------------------------------------------------------------------------------------------------
  function tour(c) {
    const t = T(), u = ui(c), last = u.tour === 1;
    const pages = [`<div class="mmgm-tpage"><div class="mmgm-timg"><img src="${A('ic_oobe_gmail_logo')}" alt=""></div><div class="mmgm-ttext"><h1>${esc(c, t.t('welcome_tour_welcome_new_title'))}</h1><p>${esc(c, t.t('welcome_tour_welcome_new_text'))}</p></div></div>`,
      `<div class="mmgm-tpage"><div class="mmgm-timg photo"><img src="assets/gm-ic_oobe_002.jpg" alt=""></div><div class="mmgm-ttext"><p class="large">${esc(c, t.t('welcome_tour_promo_text'))}</p></div></div>`];
    return `<div class="mmgm mmgm-tour"><div class="mmgm-tpager">${pages[u.tour]}</div><i class="mmgm-tsep"></i><div class="mmgm-tbar">
      <button type="button" class="mmgm-tact${last ? ' hide' : ''}" data-action="mmgm-tdone">${esc(c, t.t('welcome_tour_bottombar_skip'))}</button><span class="mmgm-dots">${pages.map((_, i) => `<i class="${i === u.tour ? 'on' : ''}"></i>`).join('')}</span>
      ${last ? `<button type="button" class="mmgm-tact" data-action="mmgm-tdone">${esc(c, t.t('done'))}</button>` : `<button type="button" class="mmgm-tnext" data-action="mmgm-tnext" aria-label="${esc(c, t.t('next'))}"><img src="${A('ic_next_24dp')}" alt=""></button>`}</div></div>`;
  }
  function setup(c) {
    const t = T(), title = AndroidStrings.format(esc(c, t.t('setup_addresses_new_user_title')), '@@LINK@@').replace('@@LINK@@', `<u>${esc(c, t.t('learn_more'))}</u>`);
    return `<div class="mmgm mmgm-setup"><div class="mmgm-sillu"><img src="assets/gm-ic_oobe_003.jpg" alt=""></div><div class="mmgm-stitle">${title}</div>
      <div class="mmgm-slist"><div class="mmgm-acct"><img src="${A('avatar_placeholder')}" alt=""><span><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></span></div>
      <button type="button" class="mmgm-sadd" data-action="mmgm-addacct">${esc(c, t.t('welcome_tour_all_addresses_add_account'))}</button></div>
      <i class="mmgm-tsep"></i><button type="button" class="mmgm-sgo" data-action="mmgm-setupdone">${esc(c, t.t('setup_addresses_ok'))}</button></div>`;
  }

  // ---- the list and the drawer -------------------------------------------------------------------------------------
  function list(c) {
    const t = T(), u = ui(c), items = mail(c).filter(m => inFolder(m, u.folder)).sort((a, b) => b.time - a.time);
    const rows = items.map(m => `<div class="mmgm-item${m.unread ? ' unread' : ''}" data-action="mmgm-open" data-id="${m.id}">${avatar(c, m.box === 'sent' || m.box === 'drafts' ? MM.account.name : m.from, 'mmgm-av')}
      <div class="mmgm-itext"><div class="mmgm-irow"><b class="mmgm-sender">${esc(c, m.box === 'sent' || m.box === 'drafts' ? t.t('me_object_pronoun') : m.from)}</b><span class="mmgm-date">${esc(c, date(c, m.time))}</span></div>
      <div class="mmgm-irow2"><span class="mmgm-lines"><span class="mmgm-subj">${esc(c, m.subject)}</span><span class="mmgm-snip">${esc(c, m.body)}</span></span><button type="button" class="mmgm-star" data-action="mmgm-star" data-id="${m.id}" aria-label="${esc(c, t.t(m.starred ? 'remove_star' : 'add_star'))}"><img src="${A(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}" alt=""></button></div></div></div>`).join('');
    const empty = `<div class="mmgm-empty"><img src="${A('ic_empty_inbox')}" alt=""><p>${esc(c, t.t('empty_inbox'))}</p></div>`;
    return `<div class="mmgm"><div class="mmgm-bar"><button type="button" class="mmgm-btn" data-action="mmgm-drawer"><img src="${A('ic_menu_wht_24dp')}" alt=""></button><span class="mmgm-title">${esc(c, folderName(c, u.folder))}</span>
      <button type="button" class="mmgm-btn" data-action="mmgm-search" aria-label="${esc(c, t.t('search_hint'))}"><img src="${A('abc_ic_search_api_mtrl_alpha')}" alt=""></button></div>
      <div class="mmgm-page mmgm-list">${rows || empty}</div><button type="button" class="mmgm-fab" data-action="mmgm-compose" aria-label="${esc(c, t.t('compose'))}"><img src="${A('ic_pencil_wht_24dp')}" alt=""></button>${u.drawer ? drawer(c) : ''}</div>`;
  }
  function drawer(c) {
    const t = T(), u = ui(c);
    const unread = f => mail(c).filter(m => inFolder(m, f) && m.unread).length;
    const row = ([id, key, ic]) => `<button type="button" class="mmgm-fold${u.folder === id ? ' on' : ''}" data-action="mmgm-folder" data-f="${id}"><img src="${A(ic)}" alt=""><span>${esc(c, t.t(key))}</span><small>${unread(id) || ''}</small></button>`;
    return `<div class="mmgm-scrim" data-action="mmgm-drawer"></div><div class="mmgm-drawer"><div class="mmgm-head"><i class="mmgm-cover"></i><i class="mmgm-hscrim"></i><img class="mmgm-havatar" src="${A('avatar_placeholder')}" alt=""><div class="mmgm-hacct"><b>${esc(c, MM.account.name)}</b><small>${esc(c, MM.account.email)}</small></div></div>
      <div class="mmgm-folders">${FOLDERS.map(row).join('')}<div class="mmgm-fhead"><i></i><span>${esc(c, t.t('all_labels_heading'))}</span></div>${LABELS.map(row).join('')}<i class="mmgm-fdiv"></i>
      <button type="button" class="mmgm-fold" data-action="mmgm-settings"><img src="${A('ic_drawer_settings_24dp')}" alt=""><span>${esc(c, t.t('menu_settings'))}</span></button><button type="button" class="mmgm-fold" data-action="mmgm-help"><img src="${A('ic_drawer_help_24dp')}" alt=""><span>${esc(c, t.t('help_and_feedback'))}</span></button></div></div>`;
  }

  // ---- a conversation ----------------------------------------------------------------------------------------------
  function conversation(c, m) {
    const t = T(), mine = m.box === 'sent' || m.box === 'drafts', who = mine ? MM.account.name : m.from;
    const btn = (img, action, label) => `<button type="button" class="mmgm-btn" data-action="${action}" aria-label="${esc(c, t.t(label))}"><img src="${A(img)}" alt=""></button>`;
    return `<div class="mmgm mmgm-conv"><div class="mmgm-bar"><button type="button" class="mmgm-btn" data-action="mmgm-up"><img src="${A('ic_arrow_back_wht_24dp')}" alt=""></button><i class="mmgm-flex"></i>${btn('ic_archive_wht_24dp', 'mmgm-archive', 'archive')}${btn('ic_delete_wht_24dp', 'mmgm-delete', 'delete')}${btn('ic_mark_unread_wht_24dp', 'mmgm-unread', 'mark_unread')}${MM.menu.button(c, 'mmgm-over')}</div>
      <div class="mmgm-page mmgm-cview"><div class="mmgm-chead"><h1>${esc(c, m.subject)}</h1><button type="button" class="mmgm-cstar" data-action="mmgm-star" data-id="${m.id}"><img src="${A(m.starred ? 'ic_star_20dp' : 'ic_star_outline_20dp')}" alt=""></button></div>
      <div class="mmgm-msg"><div class="mmgm-mhead">${avatar(c, who, 'mmgm-av')}<div class="mmgm-mwho"><b>${esc(c, who)}</b><span>${esc(c, mine ? `${t.t('to')} ${m.email}` : `${t.t('to')} ${t.t('me_object_pronoun')}`)}</span></div><span class="mmgm-mdate">${esc(c, date(c, m.time))}</span>
        <button type="button" class="mmgm-mbtn" data-action="mmgm-reply" data-id="${m.id}" aria-label="${esc(c, t.t('reply'))}"><img src="${A('ic_reply_24dp')}" alt=""></button></div><div class="mmgm-body">${esc(c, m.body)}</div></div>
      <div class="mmgm-replies"><button type="button" data-action="mmgm-reply" data-id="${m.id}"><img src="${A('ic_reply_24dp')}" alt=""><span>${esc(c, t.t('reply'))}</span></button><button type="button" data-action="mmgm-reply" data-id="${m.id}"><img src="${A('ic_reply_all_24dp')}" alt=""><span>${esc(c, t.t('reply_all'))}</span></button><button type="button" data-action="mmgm-forward" data-id="${m.id}"><img src="${A('ic_forward_24dp')}" alt=""><span>${esc(c, t.t('forward'))}</span></button></div></div></div>`;
  }
  // ---- compose -----------------------------------------------------------------------------------------------------
  function compose(c) {
    const t = T(), d = ui(c).draft;
    const field = (key, label, value, extra = '') => `<label class="mmgm-cf"><span>${esc(c, label)}</span><input data-f="${key}" value="${esc(c, value)}" autocomplete="off" spellcheck="false"${extra}></label>`;
    return `<div class="mmgm mmgm-compose"><div class="mmgm-bar"><button type="button" class="mmgm-btn" data-action="mmgm-cback"><img src="${A('ic_arrow_back_wht_24dp')}" alt=""></button><span class="mmgm-title">${esc(c, t.t('compose'))}</span>
      <button type="button" class="mmgm-btn" data-action="mmgm-attach" aria-label="${esc(c, t.t('add_file_attachment'))}"><img src="${A('ic_attach_file_wht_24dp')}" alt=""></button><button type="button" class="mmgm-btn" data-action="mmgm-send" aria-label="${esc(c, t.t('send'))}"><img src="${A('ic_send_wht_24dp')}" alt=""></button>${MM.menu.button(c, 'mmgm-over')}</div>
      <div class="mmgm-page mmgm-cform"><div class="mmgm-cf"><span>${esc(c, t.t('from'))}</span><b>${esc(c, MM.account.email)}</b></div>${field('to', t.t('to'), d.to, ' type="email"')}
      <input class="mmgm-csubj" data-f="subject" value="${esc(c, d.subject)}" placeholder="${esc(c, t.t('subject_hint'))}" autocomplete="off"><textarea class="mmgm-cbody" data-f="body" placeholder="${esc(c, t.t('body_hint'))}">${esc(c, d.body)}</textarea></div></div>`;
  }

  function consume(c) {
    const sub = c.ui.sub || ''; if (!sub) return;
    c.ui.sub = '';
    // ComposeActivityGmail from ACTION_SEND: EXTRA_SUBJECT and EXTRA_TEXT fill the draft.
    if (sub === 'share') { const d = MM.shareTake(c) || {}; const u = ui(c); u.draft = {to: '', subject: d.subject || '', body: d.text || ''}; u.screen = 'compose'; u.external = true; return; }
    if (sub.startsWith('to:')) { const u = ui(c); u.draft = {to: sub.slice(3), subject: '', body: ''}; u.screen = 'compose'; u.external = true; }
  }
  function render(c) {
    consume(c);
    const g = c.data.gmailSetup || 0, u = ui(c);
    if (g === 0) return tour(c);
    if (g === 1) return setup(c);
    if (u.screen === 'compose' && u.draft) return compose(c);
    if (u.screen.startsWith('conv:')) { const m = mail(c).find(x => x.id === +u.screen.slice(5)); if (m) return conversation(c, m); u.screen = ''; }
    return list(c);
  }
  function closeCompose(c, save) {
    const u = ui(c), d = u.draft, t = T();
    if (save && (d.to || d.subject || d.body)) { const all = mail(c); all.push({id: Math.max(0, ...all.map(x => x.id)) + 1, from: MM.account.name, email: d.to, subject: d.subject, body: d.body, time: Date.now(), unread: false, cat: 'primary', box: 'drafts'}); c.save(); }
    u.draft = null; u.screen = '';
    if (u.external) { u.external = false; c.back(); return; }
    c.render();
  }
  function menu(c) {
    const t = T(), u = ui(c);
    if (u.screen === 'compose') return c.menu([{label: t.t('save_draft'), action: c => closeCompose(c, true)}, {label: t.t('discard'), action: c => { c.toast(t.t('message_discarded'), false); closeCompose(c, false); }}]);
    const m = mail(c).find(x => x.id === +u.screen.slice(5)); if (!m) return;
    c.menu([{label: t.t('menu_move_to'), action: c => c.open('missing-move-to')}, {label: t.t('menu_change_folders'), action: c => c.open('missing-change-labels')}, {label: t.t(m.starred ? 'remove_star' : 'add_star'), action: c => { m.starred = !m.starred; c.save(); c.render(); }},
      {label: t.t('mark_not_important'), action: c => c.open('missing-important')}, {label: t.t('mute'), action: c => c.open('missing-mute')}, {label: t.t('print'), action: c => MM.print(c, {name: m.subject, title: m.subject, lines: [m.box === 'sent' || m.box === 'drafts' ? `${MM.account.name} <${MM.account.email}>` : m.from, new Intl.DateTimeFormat(c.locale(), {dateStyle: 'full', timeStyle: 'short'}).format(new Date(m.time)), m.body]})}, {label: t.t('report_spam'), action: c => { m.box = 'spam'; u.screen = ''; c.save(); c.render(); }}, {label: t.t('help_and_feedback'), action: c => c.open('help', 'gmail')}]);
  }

  MM.register('gmail', {
    statusColor: c => ui(c).drawer ? '#8a2318' : '#b93221',
    render,
    mount(c, root) {
      root.querySelectorAll('.mmgm-compose [data-f]').forEach(i => i.addEventListener('input', () => { ui(c).draft[i.dataset.f] = i.value; }));
      const to = root.querySelector('.mmgm-compose [data-f="to"]'); if (to && !to.value) to.focus();
    },
    back(c) {
      const u = ui(c);
      if (u.drawer) { u.drawer = false; c.render(); return true; }
      if (u.screen === 'compose') { closeCompose(c, true); return true; }
      if (u.screen) { u.screen = ''; c.render(); return true; }
      if (u.folder !== 'primary') { u.folder = 'primary'; c.render(); return true; }
      return false;
    },
    action(name, el, event, c) {
      const u = ui(c), t = T(), m = mail(c).find(x => x.id === +(el.dataset.id || u.screen.slice(5)));
      switch (name) {
        case 'mmgm-tnext': u.tour = 1; c.render(); return true;
        case 'mmgm-tdone': c.data.gmailSetup = 1; c.save(); c.render(); return true;
        case 'mmgm-setupdone': c.data.gmailSetup = 2; c.save(); c.render(); return true;
        case 'mmgm-addacct': c.open('missing-add-email-account'); return true;
        case 'mmgm-drawer': u.drawer = !u.drawer; c.render(); return true;
        case 'mmgm-folder': u.folder = el.dataset.f; u.drawer = false; c.render(); return true;
        case 'mmgm-settings': c.open('missing-gmail-settings'); return true;
        case 'mmgm-help': c.open('help', 'gmail'); return true;
        case 'mmgm-search': c.open('missing-gmail-search'); return true;
        case 'mmgm-open': if (event?.target?.closest('.mmgm-star')) return false; m.unread = false; c.save(); u.screen = `conv:${m.id}`; c.render(); return true;
        case 'mmgm-star': m.starred = !m.starred; c.save(); c.render(); return true;
        case 'mmgm-up': u.screen = ''; c.render(); return true;
        case 'mmgm-archive': m.box = 'archive'; u.screen = ''; c.save(); c.toast(AndroidStrings.format(t.plural('conversation_archived', 1), 1).replace(/<\/?b>/g, ''), false); c.render(); return true;
        case 'mmgm-delete': m.box = 'trash'; u.screen = ''; c.save(); c.toast(AndroidStrings.format(t.plural('conversation_deleted', 1), 1).replace(/<\/?b>/g, ''), false); c.render(); return true;
        case 'mmgm-unread': m.unread = true; u.screen = ''; c.save(); c.render(); return true;
        case 'mmgm-compose': u.draft = {to: '', subject: '', body: ''}; u.screen = 'compose'; c.render(); return true;
        case 'mmgm-reply': u.draft = {to: m.email, subject: /^Re:/i.test(m.subject) ? m.subject : `Re: ${m.subject}`, body: ''}; u.screen = 'compose'; c.render(); return true;
        case 'mmgm-forward': u.draft = {to: '', subject: `Fwd: ${m.subject}`, body: `\n\n${m.body}`}; u.screen = 'compose'; c.render(); return true;
        case 'mmgm-cback': closeCompose(c, true); return true;
        case 'mmgm-attach': c.open('missing-attach'); return true;
        case 'mmgm-send': {
          const d = u.draft; if (!d.to.trim()) { c.root?.querySelector?.('[data-f="to"]')?.focus(); return true; }
          const all = mail(c); all.push({id: Math.max(0, ...all.map(x => x.id)) + 1, from: MM.account.name, email: d.to, subject: d.subject, body: d.body, time: Date.now(), unread: false, cat: 'primary', box: 'sent'});
          c.save(); c.toast(t.t('sending'), false); u.draft = null; u.screen = ''; if (u.external) { u.external = false; c.back(); return true; } c.render(); return true;
        }
        case 'mm-menu': menu(c); return true;
      }
      return false;
    }
  });
})();
