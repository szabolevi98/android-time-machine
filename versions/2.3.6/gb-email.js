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
