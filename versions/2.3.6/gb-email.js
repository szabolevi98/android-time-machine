/* Android 2.3.6 Email (packages/apps/Email): MessageList (list_title.xml with the mailbox and account, message_list_item.xml
   rows on #404040 unread / #000000 read with the account chip, check box, star and date, the footer_organize bottom bar while
   messages are selected), MailboxList, AccountFolderList, MessageView (the #101010 newer / older bar, header_card, the
   message and the Reply / Reply all / Delete bar) and MessageCompose (the #ededed address block, quoted text bar and the
   Send / Save as draft / Discard bar). The mailbox model is email.js (ICSEmail); strings come from gb-strings-email.js.
   hdpi px x 0.575, 1 dp = 0.8625 px. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const R = AndroidStrings.resources(() => window.GBStrings?.email), text = (lang, key) => R.t(key, lang);
  const ACCOUNT = 'demo@example.com';
  // The local IMAP account's mailboxes in MailboxList order, and the AccountFolderList summary folders.
  const MAILBOXES = [['Inbox', 'inbox'], ['Drafts', 'drafts'], ['Outbox', 'outbox'], ['Sent', 'sent'], ['Trash', 'trash']];
  const SUMMARY = [['Inbox', 'combined_inbox', 'account_folder_list_summary_inbox'], ['Starred', 'starred', 'account_folder_list_summary_starred'], ['Drafts', 'drafts', 'account_folder_list_summary_drafts'], ['Outbox', 'outbox', 'account_folder_list_summary_outbox']];
  const folderName = (folder, lang) => folder === 'Starred' ? text(lang, 'account_folder_list_summary_starred') : text(lang, `mailbox_name_display_${folder.toLowerCase()}`);
  // MessageListItem dates: the time for today's mail, otherwise DateFormat.getDateFormat (the short numeric date).
  function stamp(item, ctx) {
    const day = 864e5, date = item.created ? new Date(item.created) : item.time === 'Yesterday' ? new Date(ctx.now.getTime() - day) : null;
    if (!date) return item.time || '';
    const today = date.toDateString() === ctx.now.toDateString();
    return today ? date.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24}) : date.toLocaleDateString(ctx.locale, {year: 'numeric', month: 'numeric', day: 'numeric'});
  }
  const sender = item => item.folder === 'Sent' || item.folder === 'Drafts' || item.folder === 'Outbox' ? (item.to || '') : (item.from || item.address || '');
  const titleBar = (left, right = ACCOUNT) => `<div class="gb-titlebar gbem-title"><span>${e(left)}</span><small>${e(right)}</small></div>`;
  const list = (mail, folder) => window.ICSEmail.list(mail, folder);

  function messageList(ctx) {
    const T = key => text(ctx.lang, key), folder = ctx.folder, items = ctx.query !== undefined ? window.ICSEmail.list(ctx.mail, folder, ctx.query) : list(ctx.mail, folder), selected = ctx.selected;
    const rows = items.map(item => `<div class="gbem-item${item.read ? '' : ' unread'}${selected.includes(item.id) ? ' checked' : ''}"><i class="gbem-chip"></i><button class="gbem-select" data-action="email-select" data-id="${e(item.id)}" role="checkbox" aria-checked="${selected.includes(item.id)}" aria-label="Select"></button><button class="gbem-open" data-action="email-read" data-id="${e(item.id)}" data-gbem-item="${e(item.id)}"><span class="gbem-from">${e(sender(item) || '')}</span><span class="gbem-subject">${e(item.subject || '')}${item.attachment ? '<img src="assets/gb-em-ic_email_attachment_small.png" alt="">' : ''}</span><span class="gbem-date">${e(stamp(item, ctx))}</span></button><button class="gbem-fav${item.starred ? ' on' : ''}" data-action="email-star" data-id="${e(item.id)}" role="checkbox" aria-checked="${!!item.starred}" aria-label="${e(T('favorite_action'))}"></button></div>`).join('');
    const any = selected.length, allRead = items.filter(item => selected.includes(item.id)).every(item => item.read), allStarred = items.filter(item => selected.includes(item.id)).every(item => item.starred);
    const search = ctx.query !== undefined ? `<form class="gbem-search" data-form="email-search"><input name="query" value="${e(ctx.query)}" placeholder="${e(T('search_action'))}" aria-label="${e(T('search_action'))}"></form>` : '';
    const organize = any ? `<div class="gbem-bottombar"><button data-action="email-selected-read">${e(T(allRead ? 'unread_action' : 'read_action'))}</button><button data-action="gbem-selected-star">${e(T(allStarred ? 'remove_star_action' : 'set_star_action'))}</button><button data-action="${folder === 'Trash' ? 'email-selected-restore' : 'email-selected-trash'}">${e(T('delete_action'))}</button></div>` : '';
    return `<div class="app-view gbem gbem-list" data-no-translate>${titleBar(folderName(folder, ctx.lang))}${search}<div class="gbem-scroll">${rows}</div>${organize}</div>`;
  }
  // MailboxList: mailbox_list_item rows with the folder icon, name, ind_unread / ind_sum counts.
  function mailboxList(ctx) {
    const rows = MAILBOXES.map(([folder, icon]) => {
      const items = list(ctx.mail, folder), unread = items.filter(item => !item.read).length;
      return `<button class="gbem-folder" data-action="email-folder" data-id="${folder}"><i class="gbem-chip"></i><img src="assets/gb-em-ic_list_${icon}.png" alt=""><span class="gbem-name">${e(folderName(folder, ctx.lang))}</span>${folder === 'Inbox' && unread ? `<b class="gbem-count unread">${unread}</b>` : ''}${folder !== 'Inbox' && items.length ? `<b class="gbem-count sum">${items.length}</b>` : ''}</button>`;
    }).join('');
    return `<div class="app-view gbem gbem-mailboxes" data-no-translate>${titleBar(text(ctx.lang, 'mailbox_list_title'))}<div class="gbem-scroll">${rows}</div></div>`;
  }
  // AccountFolderList: the summary folders, the "Accounts" separator and the account row with the folder button.
  function accountList(ctx) {
    const T = key => text(ctx.lang, key);
    const summary = SUMMARY.map(([folder, icon, key]) => {
      const items = list(ctx.mail, folder), unread = items.filter(item => !item.read).length;
      if (folder !== 'Inbox' && !items.length) return '';
      return `<button class="gbem-folder" data-action="email-folder" data-id="${folder}"><img src="assets/gb-em-ic_list_${icon}.png" alt=""><span class="gbem-name">${e(T(key))}</span>${folder === 'Inbox' ? (unread ? `<b class="gbem-count unread">${unread}</b>` : '') : `<b class="gbem-count sum">${items.length}</b>`}</button>`;
    }).join('');
    const unread = list(ctx.mail, 'Inbox').filter(item => !item.read).length;
    return `<div class="app-view gbem gbem-accounts" data-no-translate><div class="gb-titlebar gbem-title"><span>${e(T('app_name'))}</span></div><div class="gbem-scroll">${summary}<div class="gbem-separator">${e(T('account_folder_list_separator_accounts'))}</div><div class="gbem-account"><button class="gbem-account-main" data-action="email-folder" data-id="Inbox"><i class="gbem-chip"></i><img src="assets/gb-em-ic_list_folder.png" alt=""><span class="gbem-name"><span>${ACCOUNT}</span><small>${ACCOUNT}</small></span>${unread ? `<b class="gbem-count unread">${unread}</b>` : ''}<img class="gbem-default" src="assets/gb-em-ind_default.png" alt=""></button><i class="gbem-vsep"></i><button class="gbem-folder-btn" data-action="gbem-mailboxes" aria-label="${e(T('folders_action'))}"></button></div></div></div>`;
  }
  function messageView(ctx) {
    const T = key => text(ctx.lang, key), item = ctx.item, items = list(ctx.mail, ctx.folder), index = items.findIndex(m => m.id === item.id);
    const newer = index > 0 ? items[index - 1] : null, older = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
    const date = item.created ? new Date(item.created) : null;
    const time = date ? date.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24}) : item.time === 'Yesterday' ? '' : item.time || '';
    const day = date && date.toDateString() !== ctx.now.toDateString() ? date.toLocaleDateString(ctx.locale, {year: 'numeric', month: 'numeric', day: 'numeric'}) : item.time === 'Yesterday' ? stamp(item, ctx) : '';
    const body = e(item.body || '').replace(/\n/g, '<br>');
    return `<div class="app-view gbem gbem-view" data-no-translate><div class="gbem-scroll"><div class="gbem-arrows"><button class="left"${newer ? ` data-action="email-read" data-id="${e(newer.id)}"` : ' disabled'} aria-label="Newer"></button><button class="right"${older ? ` data-action="email-read" data-id="${e(older.id)}"` : ' disabled'} aria-label="Older"></button></div>
      <div class="gbem-header"><div class="gbem-row"><img class="gbem-presence" src="assets/gb-em-presence_inactive.png" alt=""><b class="gbem-hfrom">${e(item.from || item.address)}</b>${item.attachment ? '<img class="gbem-clip" src="assets/gb-em-ic_email_attachment_small.png" alt="">' : ''}<span>${e(day)}</span></div>
      <div class="gbem-row small"><b>${e(T('message_view_to_label'))}</b><span class="grow">${e(item.to || ACCOUNT)}</span><span class="primary">${e(time)}</span></div>
      ${item.cc ? `<div class="gbem-row small"><b>${e(T('message_view_cc_label'))}</b><span class="grow">${e(item.cc)}</span></div>` : ''}
      <div class="gbem-row small"><b class="grow">${e(item.subject)}</b><button class="gbem-bigstar${item.starred ? ' on' : ''}" data-action="email-star" data-id="${e(item.id)}" role="checkbox" aria-checked="${!!item.starred}" aria-label="${e(T('favorite_action'))}"></button></div></div>
      <div class="gbem-body">${body}${item.attachment ? `<div class="gbem-attachment"><span class="gbem-thumb" style="background:${e((item.attachment.colors || ['#888'])[0])}"></span><span>${e(item.attachment.name || 'IMG.jpg')}</span></div>` : ''}</div></div>
      <div class="gbem-bottombar"><button data-action="email-reply">${e(T('reply_action'))}</button><button data-action="gbem-reply-all">${e(T('reply_all_action'))}</button><button data-action="${item.folder === 'Trash' ? 'email-restore' : 'email-trash'}">${e(T('delete_action'))}</button></div></div>`;
  }
  function compose(ctx) {
    const T = key => text(ctx.lang, key), item = ctx.item;
    const address = (name, hint) => `<input class="gbem-field" name="${name}" value="${e(item[name] || '')}" placeholder="${e(T(hint))}" aria-label="${e(T(hint))}" autocomplete="off">`;
    return `<form class="app-view gbem gbem-compose" data-form="email" data-no-translate><div class="gb-titlebar gbem-title"><span>${e(T('compose_title'))}</span></div><div class="gbem-scroll"><div class="gbem-addresses">${address('to', 'message_compose_to_hint')}${ctx.cc || item.cc || item.bcc ? address('cc', 'message_compose_cc_hint') + address('bcc', 'message_compose_bcc_hint') : ''}<input class="gbem-field" name="subject" maxlength="160" value="${e(item.subject || '')}" placeholder="${e(T('message_compose_subject_hint'))}" aria-label="${e(T('message_compose_subject_hint'))}">${item.attachment ? `<div class="gbem-att"><span>${e(item.attachment.name || 'IMG.jpg')}</span><button type="button" data-action="email-remove-attachment" aria-label="Remove"></button></div>` : ''}<i class="gbem-emaildiv"></i></div>
      <textarea class="gbem-field gbem-bodyfield" name="body" placeholder="${e(T('message_compose_body_hint'))}" aria-label="${e(T('message_compose_body_hint'))}">${e(item.body || '')}</textarea>
      ${item.quoted ? `<div class="gbem-quoted-bar"><span>${e(T('message_compose_quoted_text_label'))}</span><button type="button" data-action="gbem-drop-quoted" aria-label="Remove"></button></div><div class="gbem-quoted">${e(item.quoted).replace(/\n/g, '<br>')}</div>` : ''}
      ${ctx.error ? `<div class="gbem-error">${e(ctx.error)}</div>` : ''}</div>
      <div class="gbem-bottombar"><button type="submit">${e(T('send_action'))}</button><button type="button" data-action="gbem-save-draft">${e(T('save_draft_action'))}</button><button type="button" data-action="gbem-discard">${e(T('discard_action'))}</button></div></form>`;
  }
  function render(ctx) {
    if (ctx.sub === 'compose' && ctx.item) return compose(ctx);
    if (ctx.sub === 'read' && ctx.item) return messageView(ctx);
    if (ctx.sub === 'mailboxes') return mailboxList(ctx);
    if (ctx.sub === 'accounts') return accountList(ctx);
    return messageList(ctx);
  }
  // message_list_option (Deselect all only while selecting), message_view_option, message_compose_option, mailbox / account menus.
  function menu(ctx) {
    const T = key => text(ctx.lang, key);
    if (ctx.sub === 'compose') return [{action: 'email-cc', title: T('add_cc_bcc_action'), icon: 'ic_menu_cc'}, {action: 'gbem-send', title: T('send_action'), icon: 'ic_menu_send'}, {action: 'gbem-save-draft', title: T('save_draft_action'), icon: 'gb-em-ic_menu_save_draft.png'}, {action: 'gbem-discard', title: T('discard_action'), icon: 'ic_menu_close_clear_cancel'}, {action: 'email-attach', title: T('add_attachment_action'), icon: 'ic_menu_attachment'}];
    if (ctx.sub === 'read') return [{action: ctx.item?.folder === 'Trash' ? 'email-restore' : 'email-trash', title: T('delete_action'), icon: 'ic_menu_delete'}, {action: 'email-forward', title: T('forward_action'), icon: 'gb-em-ic_menu_forward_mail.png'}, {action: 'email-reply', title: T('reply_action'), icon: 'gb-em-ic_menu_reply.png'}, {action: 'gbem-reply-all', title: T('reply_all_action'), icon: 'gb-em-ic_menu_reply_all.png'}, {action: 'email-unread', title: T('mark_as_unread_action'), icon: 'ic_menu_mark'}];
    const na = 'This feature is not part of the simulator.';
    if (ctx.sub === 'accounts') return [{action: 'email-refresh', title: T('refresh_action'), icon: 'ic_menu_refresh'}, {action: 'email-compose', title: T('compose_action'), icon: 'ic_menu_compose'}, {action: 'gbem-add-account', title: T('add_account_action'), icon: 'ic_menu_add'}];
    if (ctx.sub === 'mailboxes') return [{action: 'email-refresh', title: T('refresh_action'), icon: 'ic_menu_refresh'}, {action: 'email-compose', title: T('compose_action'), icon: 'ic_menu_compose'}, {action: 'gbem-accounts', title: T('accounts_action'), icon: 'ic_menu_account_list'}, {action: 'gbpref-open', id: 'email', title: T('account_settings_action'), icon: 'ic_menu_preferences'}];
    return [{action: 'email-refresh', title: T('refresh_action'), icon: 'ic_menu_refresh'}, {action: 'email-compose', title: T('compose_action'), icon: 'ic_menu_compose'}, ...(ctx.selected.length ? [{action: 'email-clear-selection', title: T('deselect_all_action'), icon: 'gb-em-ic_menu_email_deselect_mail.png'}] : []), {action: 'gbem-mailboxes', title: T('folders_action'), icon: 'gb-em-ic_menu_folder.png'}, {action: 'gbem-accounts', title: T('accounts_action'), icon: 'ic_menu_account_list'}, {action: 'gbpref-open', id: 'email', title: T('account_settings_action'), icon: 'ic_menu_preferences'}];
  }
  // message_list_context (message_list_context_trash / _drafts in those folders).
  function dialog(kind, ctx) {
    const T = key => text(ctx.lang, key), item = ctx.target;
    if (kind === 'context' && item) {
      if (item.folder === 'Trash') return {title: item.subject || '', items: [{action: 'email-read', id: item.id, title: T('open_action')}, {action: 'gbem-context-delete', id: item.id, title: T('delete_action')}]};
      if (item.folder === 'Drafts') return {title: item.subject || '', items: [{action: 'email-read', id: item.id, title: T('open_action')}, {action: 'gbem-context-delete', id: item.id, title: T('discard_action')}]};
      return {title: item.subject || '', items: [{action: 'email-read', id: item.id, title: T('open_action')}, {action: 'gbem-context-delete', id: item.id, title: T('delete_action')}, {action: 'gbem-context-forward', id: item.id, title: T('forward_action')}, {action: 'gbem-context-reply-all', id: item.id, title: T('reply_all_action')}, {action: 'gbem-context-reply', id: item.id, title: T('reply_action')}, {action: 'gbem-context-read', id: item.id, title: T(item.read ? 'mark_as_unread_action' : 'mark_as_read_action')}]};
    }
    if (kind === 'attach') return {title: T('choose_attachment_dialog_title'), items: ctx.photos.map(photo => ({action: 'email-attach-photo', id: photo.id, title: photo.name}))};
    return null;
  }
  // MessageCompose: the reply / forward header above the quoted original (message_compose_reply_header_fmt / _fwd_header_fmt).
  function quote(source, forward, lang) {
    if (forward) return `\n\n-------- Original Message --------\nSubject: ${source.subject}\nFrom: ${source.from || source.address}\nTo: ${source.to || ACCOUNT}\n\n${source.body}`;
    return AndroidStrings.format(text(lang, 'message_compose_reply_header_fmt'), source.from || source.address).replace(/^\n+/, '') + source.body;
  }
  /* AccountSetupBasics (account_setup_basics.xml): the 20 sp welcome, the email and password fields and the default-account
     checkbox between flexible gaps, then the 54 dip bottom_bar with Manual setup on the left and Next (button_indicator_next)
     on the right; both are enabled only for a valid address and a password. */
  const validAddress = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  function setup(ctx) {
    const T = key => text(ctx.lang, key), ok = validAddress(ctx.email) && !!ctx.password;
    return `<form class="app-view gbem gbem-setup" data-form="gbem-setup" data-no-translate><div class="gb-titlebar">${e(T('account_setup_basics_title'))}</div><div class="gbem-setup-body"><p>${e(T('accounts_welcome'))}</p><i></i><input class="gbem-field" name="email" type="email" autocomplete="off" spellcheck="false" placeholder="${e(T('account_setup_basics_email_hint'))}" value="${e(ctx.email || '')}"><input class="gbem-field" name="password" type="password" autocomplete="new-password" placeholder="${e(T('account_setup_basics_password_hint'))}"><label class="gbem-setup-default"><input type="checkbox" name="def"${ctx.def ? ' checked' : ''}><span></span>${e(T('account_setup_basics_default_label'))}</label><i></i></div><div class="gbem-setup-bar"><button type="button" data-action="gbem-setup-manual"${ok ? '' : ' disabled'}>${e(T('account_setup_basics_manual_setup_action'))}</button><button type="submit" class="next"${ok ? '' : ' disabled'}>${e(T('next_action'))}<img src="assets/gb-em-button_indicator_next.png" alt=""></button></div></form>`;
  }
  // AccountSetupCheckSettings: the progress dialog, then (offline) the "Cannot connect to server." failure with Edit details.
  const setupDialog = (kind, lang) => kind === 'checking'
    ? {title: '', custom: `<div class="gbdlg-progress"><img src="assets/gb-spinner_white_48.png" alt=""><span>${e(text(lang, 'account_setup_check_settings_check_incoming_msg'))}</span></div>`, cancel: 'gbem-setup-cancel', buttons: []}
    : {title: text(lang, 'account_setup_failed_dlg_title'), icon: 'ic_dialog_alert', message: text(lang, 'account_setup_failed_dlg_server_message'), buttons: [{action: 'close-overlay', title: text(lang, 'account_setup_failed_dlg_edit_details_action')}]};
  window.GBEmail = {ACCOUNT, MAILBOXES, text, folderName, stamp, render, menu, dialog, quote, setup, setupDialog, validAddress};
})();

/* Email on Android 2.3.6 (Email.apk of GRK39F) as a module (docs/plans/engine-migration.md): the message list with its
   folders, selection and long press, the message, MessageCompose (Back keeps a draft), the mailboxes and accounts, the
   account setup with its offline check, search, the Menu key, the dialogs and Clear data. Other apps start a message
   through compose(c, source, forward, to, all) (the shell's composeEmail). */
(() => {
  'use strict';
  const i18n = window.AndroidI18n;
  // The demo mailbox (ICSEmail.restore keeps the visitor's changes to it).
  const emailData = [
    { id: 1, from: 'Android Team', subject: 'Welcome to Android', body: 'Your Nexus S is ready. Explore Android 2.3, customize your home screen, and discover the little surprise hidden in Settings.', time: '9:41 AM' },
    { id: 2, from: 'Alex Morgan', subject: 'Photos from the weekend', body: 'I added a few pictures to our album. Take a look when you have a moment!', time: 'Yesterday' },
    { id: 3, from: 'Calendar', subject: 'Coffee with Alex', body: 'Reminder: Coffee with Alex at 11:00.', time: 'Yesterday' }
  ];
  // The shell's bindings the screen's code uses, and its helpers on them.
  function shell(c) {
    const {data, ui, save, render, renderOverlay, toast, viewport, deviceDate} = c;
    function gbEmailContext() {
      return {lang: i18n.language, locale: i18n.locale(), hour24: !!data.settings.hour24, now: deviceDate(), sub: ui.sub, folder: ui.emailFolder || 'Inbox', mail: data.mailbox, item: data.mailbox.find(item => item.id === ui.emailId), selected: ui.emailSelected || [], query: ui.emailQuery, cc: !!ui.emailCc, error: '', photos: data.photos, target: data.mailbox.find(item => item.id === ui.gbEmTarget)};
    }
    const emailText = key => GBEmail.text(i18n.language, key);
    function gbEmDialog(kind) { ui.gbEmDialog = kind; ui.overlay = 'gb-dialog-email'; renderOverlay(); }
    // The compose form's fields are kept on the draft before menus, attachments or leaving the screen.
    function gbEmSync() {
      const form = viewport.querySelector('.gbem-compose'), item = data.mailbox.find(m => m.id === ui.emailId); if (!form || !item) return;
      for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (form.elements[key]) item[key] = String(form.elements[key].value);
    }
    function gbEmLeaveCompose(message) { ui.sub = ''; ui.overlay = ''; ui.emailCc = false; save(); render(); if (message) toast(emailText(message)); }
    const composeEmail = (...args) => compose(c, ...args);
    return {data, ui, save, render, renderOverlay, toast, viewport, clone: c.clone, gbEmailContext, emailText, gbEmDialog, gbEmSync, gbEmLeaveCompose, composeEmail};
  }
  function compose(c, ...args) {
    const {data, ui, save, render} = c;
    function composeEmail(source=null,forward=false,to='',all=false) {
      const draft=ICSEmail.draft(source,forward);if(to)draft.to=to;
      // MessageCompose keeps the original below the "Quoted text" bar; reply all adds the other recipients as Cc.
      if(source){draft.quoted=GBEmail.quote(source,forward,i18n.language);draft.body='';if(all&&!forward)draft.cc=ICSEmail.recipients([source.to,source.cc].join(',')).filter(address=>address!==ICSEmail.account&&address!==draft.to).join(', ');}
      data.mailbox.unshift(draft);ui.emailId=draft.id;ui.emailCc=false;ui.emailError='';ui.overlay='';ui.sub='compose';save();render();
    }
    composeEmail(...args);
  }
  window.GB?.register('email', {
    demo: emailData,
    compose,
    render(c) { const ui = c.ui; if (ui.gbEmSetup) return GBEmail.setup({lang: i18n.language, ...ui.gbEmSetup}); return GBEmail.render(shell(c).gbEmailContext()); },
    // A long press on a message opens its context menu.
    mount(c, root) { GB.hold(c, root, '[data-gbem-item]', held => { c.ui.gbEmTarget = held.dataset.gbemItem; shell(c).gbEmDialog('context'); }, {rightClick: false}); },
    // The account setup has no menu; MessageCompose keeps its fields first.
    menu(c) { if (c.ui.gbEmSetup) return; const {gbEmSync, gbEmailContext} = shell(c); gbEmSync(); c.gbMenu(GBEmail.menu(gbEmailContext())); },
    // The setup's check ("setup:checking", "setup:failed") and Email's own dialogs.
    dialog(kind, c) { if (kind.startsWith('setup:')) return GBEmail.setupDialog(kind.slice(6), i18n.language); return GBEmail.dialog(kind, shell(c).gbEmailContext()); },
    // The account setup closes; MessageCompose saves a draft (or drops an empty one).
    back(c) {
      const {data, ui, render, gbEmSync, gbEmLeaveCompose} = shell(c);
      if (ui.gbEmSetup) { ui.gbEmSetup = null; render(); return true; }
      if (ui.sub === 'compose') { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item && [item.to, item.subject, item.body].some(v => String(v || '').trim())) { item.folder = 'Drafts'; gbEmLeaveCompose('message_saved_toast'); } else { data.mailbox = data.mailbox.filter(m => m.id !== ui.emailId); gbEmLeaveCompose(''); } return true; }
      return false;
    },
    action(name, el, c) {
      const id = el.dataset.id, action = name, {data, ui, save, render, renderOverlay, toast, viewport, clone, emailText, gbEmDialog, gbEmSync, gbEmLeaveCompose, composeEmail} = shell(c);
      switch (name) {
        case 'gbem-add-account': ui.overlay = ''; ui.gbEmSetup = {email: '', def: false}; render(); viewport.querySelector('.gbem-setup [name=email]')?.focus(); break;
        case 'gbem-setup-manual': toast('This feature is not part of the simulator.'); break;
        case 'gbem-setup-cancel': clearTimeout(ui.gbEmSetupTimer); ui.overlay = ''; renderOverlay(); break;
        case 'email-read': {const item=data.mailbox.find(item=>item.id===id);if(!item)break;ui.emailId=id;item.read=true;ui.sub=item.folder==='Drafts'?'compose':'read';ui.emailError='';save();render();break;}
        case 'email-compose': composeEmail();break;
        case 'gbem-mailboxes': ui.sub = 'mailboxes'; ui.overlay = ''; render(); break;
        case 'gbem-accounts': ui.sub = 'accounts'; ui.overlay = ''; render(); break;
        case 'gbem-reply-all': composeEmail(data.mailbox.find(item => item.id === ui.emailId), false, '', true); break;
        case 'gbem-selected-star': { const items = data.mailbox.filter(item => (ui.emailSelected || []).includes(item.id)), on = !items.every(item => item.starred); items.forEach(item => item.starred = on); save(); render(); break; }
        case 'gbem-save-draft': { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item) item.folder = 'Drafts'; gbEmLeaveCompose('message_saved_toast'); break; }
        case 'gbem-discard': data.mailbox = data.mailbox.filter(item => item.id !== ui.emailId); gbEmLeaveCompose('message_discarded_toast'); break;
        case 'gbem-send': ui.overlay = ''; renderOverlay(); viewport.querySelector('.gbem-compose')?.requestSubmit(); break;
        case 'gbem-drop-quoted': { gbEmSync(); const item = data.mailbox.find(m => m.id === ui.emailId); if (item) delete item.quoted; render(); break; }
        case 'gbem-context-delete': { const item = data.mailbox.find(m => m.id === id); if (!item) break; if (item.folder === 'Drafts' || item.folder === 'Trash') data.mailbox = data.mailbox.filter(m => m.id !== id); else ICSEmail.trash(data.mailbox, [id]); ui.overlay = ''; save(); render(); toast(emailText(item.folder === 'Drafts' ? 'message_discarded_toast' : 'message_deleted_toast_one')); break; }
        case 'gbem-context-reply': case 'gbem-context-reply-all': case 'gbem-context-forward': ui.overlay = ''; composeEmail(data.mailbox.find(m => m.id === id), action === 'gbem-context-forward', '', action === 'gbem-context-reply-all'); break;
        case 'gbem-context-read': { const item = data.mailbox.find(m => m.id === id); if (item) item.read = !item.read; ui.overlay = ''; save(); render(); break; }
        case 'email-reply': case 'email-forward': composeEmail(data.mailbox.find(item=>item.id===ui.emailId),action==='email-forward');break;
        case 'email-folder': ui.emailFolder=id;ui.sub='';ui.emailQuery=undefined;ui.emailSelected=[];ui.overlay='';render();break;
        case 'email-star': {const item=data.mailbox.find(item=>item.id===id);if(item)item.starred=!item.starred;save();render();break;}
        case 'email-select': ui.emailSelected ||= [];ui.emailSelected=ui.emailSelected.includes(id)?ui.emailSelected.filter(key=>key!==id):[...ui.emailSelected,id];render();break;
        case 'email-clear-selection': ui.emailSelected=[];render();break;
        case 'email-trash': case 'email-selected-trash': {const ids=action==='email-trash'?[ui.emailId]:ui.emailSelected||[];ICSEmail.trash(data.mailbox,ids);ui.sub='';ui.overlay='';ui.emailSelected=[];save();render();toast(emailText(ids.length>1?'message_deleted_toast_other':'message_deleted_toast_one'));break;}
        case 'email-restore': case 'email-selected-restore': {const ids=action==='email-restore'?[ui.emailId]:ui.emailSelected||[];data.mailbox.filter(item=>ids.includes(item.id)).forEach(ICSEmail.untrash);ui.sub='';ui.emailSelected=[];save();render();break;}
        case 'email-selected-read': data.mailbox.filter(item=>(ui.emailSelected||[]).includes(item.id)).forEach(item=>item.read=true);ui.emailSelected=[];save();render();break;
        case 'email-unread': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)item.read=false;ui.sub='';ui.overlay='';save();render();break;}
        case 'email-search': ui.emailQuery='';render();viewport.querySelector('[data-form="email-search"] input')?.focus();break;
        case 'email-refresh': toast('Local mailbox is up to date');break;
        case 'email-cc': gbEmSync();ui.emailCc=true;ui.overlay='';render();break;
        case 'email-attach': gbEmSync();gbEmDialog('attach');break;
        case 'email-attach-photo': {const item=data.mailbox.find(item=>item.id===ui.emailId),photo=data.photos.find(photo=>photo.id===Number(id));if(item&&photo)item.attachment=clone(photo);ui.overlay='';save();render();break;}
        case 'email-remove-attachment': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(item)delete item.attachment;save();render();break;}
        default: return false;
      }
      return true;
    },
    submit(name, values, c) {
      const {data, ui, save, render, renderOverlay, toast, emailText} = shell(c);
      switch (name) {
        // AccountSetupCheckSettings: the simulator is offline, so the incoming server check fails like a phone without a connection.
        case 'gbem-setup': { if (!GBEmail.validAddress(values.get('email')) || !values.get('password')) break; ui.gbEmSetup = {email: String(values.get('email')).trim(), def: values.has('def')}; ui.gbEmSetupDialog = 'checking'; ui.overlay = 'gb-dialog-emsetup'; renderOverlay();
          clearTimeout(ui.gbEmSetupTimer); ui.gbEmSetupTimer = setTimeout(() => { if (ui.overlay !== 'gb-dialog-emsetup') return; ui.gbEmSetupDialog = 'failed'; renderOverlay(); }, 2500); break; }
        case 'email': {const item=data.mailbox.find(item=>item.id===ui.emailId);if(!item)break;for(const key of ['to','cc','bcc','subject','body'])if(values.has(key))item[key]=String(values.get(key)).trim();if(!ICSEmail.recipients(item.to).length){save();toast(emailText('message_compose_error_no_recipients'));break;}if(item.quoted){item.body=[item.body,item.quoted].filter(Boolean).join('\n\n');delete item.quoted;}if(!ICSEmail.send(item)){save();toast(emailText('message_compose_error_invalid_email'));break;}ui.emailCc=false;ui.sub='';ui.emailError='';save();render();break;}
        case 'email-search': ui.emailQuery=String(values.get('query')||'').trim();ui.emailSelected=[];render();break;
        default: return false;
      }
      return true;
    },
    // AccountSetupBasics.validateFields: Next and Manual setup follow the address and password (the password is never
    // stored); the inherited ICS compose form keeps its fields on the draft.
    input(event, c) {
      const {data, ui, save} = shell(c);
      if (event.target.closest('.gbem-setup') && ui.gbEmSetup) { const form = event.target.closest('form'), ok = GBEmail.validAddress(form.elements.email.value) && !!form.elements.password.value; ui.gbEmSetup.email = form.elements.email.value; ui.gbEmSetup.def = form.elements.def.checked; form.querySelectorAll('.gbem-setup-bar button').forEach(b => { b.disabled = !ok; }); return true; }
      if(event.target.closest('.email-compose')&&event.target.name){const item=data.mailbox.find(item=>item.id===ui.emailId);if(item){item[event.target.name]=event.target.value;save();}return true;}
      return false;
    },
    clearData(c) { const {data, ui} = c; data.mailbox=ICSEmail.restore(null,emailData,[]);data.sentEmails=[];ui.emailFolder='Inbox';ui.emailQuery=undefined;ui.emailSelected=[]; }
  });
})();
