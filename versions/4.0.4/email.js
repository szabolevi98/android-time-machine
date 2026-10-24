/* Email 4.0.4 on the Galaxy Nexus (IMM76I EmailGoogle.apk, packages/apps/Email android-4.0.4_r2.1), one pane, Theme.Holo.Light
   with uiOptions="splitActionBarWhenNarrow" (1 dp = 0.85 px):
   - ActionBarController: the app icon (with the up caret off the top level), action_bar_spinner.xml (the mailbox name in
     16 sp over the account in the 14 sp subtitle style, the 36 dp #bbbbbb unread count at the right); the dropdown is
     AccountSelectorAdapter's: the account with its unread count, the "Recent folders (account)" header, the recent
     mailboxes (RecentMailboxManager: Drafts and Sent until others are touched), and "Show all folders".
   - The split bar: email_activity_options as UIControllerBase / UIControllerOnePane prepare it for an IMAP account
     (Compose, Search, Show all folders and Refresh; Settings in the overflow, Sync options only for Exchange). In the
     message view Delete and Move (message_view_fragment_option, orderInCategory 1000 / 1100) come before Newer and Older
     (1500 / 1600), Mark as unread (1200) and Settings (3000) overflow.
   - MessageListItem in message_list_item_normal.xml: 70 sp rows, the reply / forward badge over the check box, the 18 sp
     sender (bold while unread), the 14 sp "subject — snippet" line, the 12 sp DateUtils.getRelativeTimeSpanString date
     and the star; list_unread_holo white and list_read_holo #eeeeee rows; the selection CAB (Delete, Move, Mark read or
     Mark unread, Add star or Remove star) with "%d selected".
   - MailboxListFragment ("Show all folders"): Starred while a message is starred, then Inbox, Drafts, Outbox, Sent, Trash
     (MailboxFragmentAdapter's order) in 48 dip mailbox_list_item rows with the folder icons and FolderProperties' counts.
   - MessageViewFragment: the bold subject, the #0099cc message_view_header_upper (contact badge, 16 sp name, 14 sp
     address, star, reply, the overflow popup with Reply all and Forward), the subheader (To: …, the relative date, the
     expander and the details table), the Message / Attachment tabs and the body with 16 dp margins.
   - MessageCompose: "Compose" (or the Reply / Reply all / Forward list navigation), Send in the bar and the overflow
     (Attach file, Add Cc/Bcc, Save draft, Discard, Settings; no quick responses on a new account); compose_from, the
     To / Cc / Bcc rows with their #aaaaaa headings, Subject, "Compose email", the attachments and quoted_text.xml.
     Attach file sends GET_CONTENT for AttachmentUtilities' image/* (only the Gallery answers, so it opens directly).
   Texts are EmailGoogle.apk's (docs/tools/apk-strings.py fills STRINGS from this template); the account is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const STRINGS = {
    "Compose": {"res": "EmailGoogle:compose_action", "hu": "Levélírás", "de": "Schreiben", "fr": "Composer", "es": "Redactar"},
    "Search": {"res": "EmailGoogle:search_action", "hu": "Keresés", "de": "Suche", "fr": "Rechercher", "es": "Búsqueda"},
    "Show all folders": {"res": "EmailGoogle:mailbox_list_account_selector_show_all_folders", "hu": "Összes mappa megjelenítése", "de": "Alle Ordner anzeigen", "fr": "Afficher tous les dossiers", "es": "Mostrar todas las carpetas"},
    "Refresh": {"res": "EmailGoogle:refresh_action", "hu": "Frissítés", "de": "Aktualisieren", "fr": "Actualiser", "es": "Actualizar"},
    "Settings": {"res": "EmailGoogle:settings_action", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "Delete": {"res": "EmailGoogle:delete_action", "hu": "Törlés", "de": "Löschen", "fr": "Supprimer", "es": "Eliminar"},
    "Move": {"res": "EmailGoogle:move_action", "hu": "Áthelyezés", "de": "Verschieben", "fr": "Déplacer", "es": "Mover"},
    "Mark as unread": {"res": "EmailGoogle:mark_as_unread_action", "hu": "Megjelölés olvasatlanként", "de": "Als ungelesen markieren", "fr": "Marquer comme non lu", "es": "Marcar como no leído"},
    "Mark read": {"res": "EmailGoogle:read_action", "hu": "Megjelölés olvasottként", "de": "Als gelesen markieren", "fr": "Marquer comme lu", "es": "Marcar como leído"},
    "Mark unread": {"res": "EmailGoogle:unread_action", "hu": "Megjelölés olvasatlanként", "de": "Als ungelesen markieren", "fr": "Marquer comme non lu", "es": "Marcar como no leído"},
    "Add star": {"res": "EmailGoogle:set_star_action", "hu": "Csillagozás", "de": "Markierung hinzufügen", "fr": "Activer le suivi", "es": "Añadir estrella"},
    "Remove star": {"res": "EmailGoogle:remove_star_action", "hu": "Csillag eltávolítása", "de": "Markierung entfernen", "fr": "Désactiver le suivi", "es": "Eliminar estrella"},
    "Star": {"res": "EmailGoogle:favorite_action", "hu": "Csillagozás", "de": "Markieren", "fr": "Activer le suivi", "es": "Destacar"},
    "Reply": {"res": "EmailGoogle:reply_action", "hu": "Válasz", "de": "Antworten", "fr": "Répondre", "es": "Responder"},
    "Reply all": {"res": "EmailGoogle:reply_all_action", "hu": "Válasz mindenkinek", "de": "Allen antworten", "fr": "Répondre à tous", "es": "Responder a todos"},
    "Forward": {"res": "EmailGoogle:forward_action", "hu": "Továbbítás", "de": "Weiterleiten", "fr": "Transférer", "es": "Reenviar"},
    "Send": {"res": "EmailGoogle:send_action", "hu": "Küldés", "de": "Senden", "fr": "Envoyer", "es": "Enviar"},
    "Attach file": {"res": "EmailGoogle:add_file_attachment", "hu": "Fájl csatolása", "de": "Datei anhängen", "fr": "Joindre un fichier", "es": "Adjuntar archivo"},
    "Add Cc/Bcc": {"res": "EmailGoogle:add_cc_bcc_menu", "hu": "Másolatmezők is", "de": "Cc/Bcc hinzufügen", "fr": "Ajouter Cc/Cci", "es": "Añadir CC/CCO"},
    "Save draft": {"res": "EmailGoogle:save_draft_action", "hu": "Piszkozatmentés", "de": "Speichern", "fr": "Enregistrer", "es": "Guardar borrador"},
    "Discard": {"res": "EmailGoogle:discard_action", "hu": "Elvetés", "de": "Verwerfen", "fr": "Supprimer", "es": "Descartar"},
    "To": {"res": "EmailGoogle:to", "hu": "Címzett", "de": "An", "fr": "À", "es": "Para"},
    "Cc": {"res": "EmailGoogle:cc", "hu": "Másolatot kap", "de": "Cc", "fr": "Cc", "es": "CC"},
    "Bcc": {"res": "EmailGoogle:bcc", "hu": "Titkos másolat", "de": "Bcc", "fr": "Cci", "es": "CCO"},
    "Subject": {"res": "EmailGoogle:subject_hint", "hu": "Tárgy", "de": "Betreff", "fr": "Objet", "es": "Asunto"},
    "Compose email": {"res": "EmailGoogle:body_hint", "hu": "Levélírás", "de": "E-Mail schreiben", "fr": "Composez un message", "es": "Redactar correo"},
    "Include quoted text": {"res": "EmailGoogle:message_compose_quoted_text_label", "hu": "Idézett szöveg beillesztése", "de": "Zitierten Text einfügen", "fr": "Inclure le texte des messages précédents", "es": "Incluir texto citado"},
    "Inbox": {"res": "EmailGoogle:mailbox_name_display_inbox", "hu": "Beérkezett üzenetek", "de": "Posteingang", "fr": "Boîte de réception", "es": "Recibidos"},
    "Drafts": {"res": "EmailGoogle:mailbox_name_display_drafts", "hu": "Piszkozatok", "de": "Entwürfe", "fr": "Brouillons", "es": "Borradores"},
    "Outbox": {"res": "EmailGoogle:mailbox_name_display_outbox", "hu": "Kimenő levelek", "de": "Postausgang", "fr": "Boîte d'envoi", "es": "Enviados"},
    "Sent": {"res": "EmailGoogle:mailbox_name_display_sent", "hu": "Elküldve", "de": "Gesendet", "fr": "Éléments envoyés", "es": "Enviados"},
    "Trash": {"res": "EmailGoogle:mailbox_name_display_trash", "hu": "Kuka", "de": "Papierkorb", "fr": "Corbeille", "es": "Papelera"},
    "Starred": {"res": "EmailGoogle:account_folder_list_summary_starred", "hu": "Csillaggal megjelölt", "de": "Markiert", "fr": "Suivis", "es": "Destacados"},
    "Recent folders (%s)": {"res": "EmailGoogle:mailbox_list_account_selector_mailbox_header_fmt", "hu": "Legutóbbi mappák (%s)", "de": "Letzte Ordner (%s)", "fr": "Dossiers récents (%s)", "es": "Carpetas recientes (%s)"},
    "Move to": {"res": "EmailGoogle:move_to_folder_dialog_title", "hu": "Áthelyezés", "de": "Verschieben", "fr": "Déplacer vers", "es": "Mover a"},
    "Delete this message?": {"res": "EmailGoogle:@plurals/message_delete_confirm:one", "hu": "Törli ezt az üzenetet?", "de": "Diese Nachricht löschen?", "fr": "Supprimer ce message ?", "es": "¿Eliminar este mensaje?"},
    "Message deleted.": {"res": "EmailGoogle:@plurals/message_deleted_toast:one", "hu": "Üzenet törölve.", "de": "Nachricht gelöscht", "fr": "Message supprimé", "es": "Mensaje eliminado"},
    "Messages deleted.": {"res": "EmailGoogle:@plurals/message_deleted_toast:other", "hu": "Az üzenetek törölve.", "de": "Nachrichten gelöscht", "fr": "Messages supprimés", "es": "Mensajes eliminados"},
    "Message discarded.": {"res": "EmailGoogle:message_discarded_toast", "hu": "Üzenet elvetve.", "de": "Nachricht gelöscht", "fr": "Message supprimé.", "es": "Mensaje descartado"},
    "Message saved as draft.": {"res": "EmailGoogle:message_saved_toast", "hu": "Az üzenet mentve piszkozatként.", "de": "Nachricht als Entwurf gespeichert", "fr": "Brouillon enregistré", "es": "Mensaje guardado como borrador"},
    "%d selected": {"res": "EmailGoogle:@plurals/message_view_selected_message_count:other", "hu": "%d kiválasztva", "de": "%d ausgewählt", "fr": "%d sélectionné(s)", "es": "%d seleccionados"},
    "To:": {"res": "EmailGoogle:message_view_to_label", "hu": "Címzett:", "de": "An:", "fr": "À :", "es": "Para:"},
    "Cc:": {"res": "EmailGoogle:message_view_cc_label", "hu": "Másolatot kap:", "de": "Cc:", "fr": "Cc :", "es": "CC:"},
    "Bcc:": {"res": "EmailGoogle:message_view_bcc_label", "hu": "Titkos másolat:", "de": "Bcc:", "fr": "Cci :", "es": "CCO:"},
    "Date:": {"res": "EmailGoogle:message_view_date_label", "hu": "Dátum:", "de": "Datum:", "fr": "Date :", "es": "Fecha:"},
    "Message": {"res": "EmailGoogle:message_view_show_message_action", "hu": "Üzenet", "de": "Nachricht", "fr": "Message", "es": "Mensaje"},
    "Attachment %1$d": {"res": "EmailGoogle:@plurals/message_view_show_attachments_action:one", "hu": "Melléklet - %1$d", "de": "Anhang: %1$d", "fr": "Pièce jointe %1$d", "es": "%1$d adjunto"},
    "View": {"res": "EmailGoogle:message_view_attachment_view_action", "hu": "Megtekint", "de": "Anzeigen", "fr": "Afficher", "es": "Ver"},
    "Save": {"res": "EmailGoogle:message_view_attachment_save_action", "hu": "Mentés", "de": "Speichern", "fr": "Enregistrer", "es": "Guardar"},
    "Search %1$s": {"res": "EmailGoogle:search_mailbox_hint", "hu": "Keresés itt: %1$s", "de": "%1$s durchsuchen", "fr": "Rechercher dans %1$s", "es": "Buscar en %1$s"},
    "Search results for \"%1$s\"": {"res": "EmailGoogle:search_header_text_fmt", "hu": "Találatok a(z) \"%1$s\" kifejezésre", "de": "Suchergebnisse für \"%1$s\"", "fr": "Résultats pour \"%1$s\"", "es": "Resultados de búsqueda de \"%1$s\""},
    "No messages": {"res": "EmailGoogle:message_list_no_messages", "hu": "Nincsenek üzenetek", "de": "Keine Nachrichten", "fr": "Aucun message", "es": "No hay ningún mensaje."},
    "You must add at least one recipient.": {"res": "EmailGoogle:message_compose_error_no_recipients", "hu": "Legalább egy résztvevőt hozzá kell adnia.", "de": "Sie müssen mindestens einen Empfänger hinzufügen.", "fr": "Vous devez ajouter au moins un destinataire.", "es": "Debes especificar, al menos, un destinatario."},
    "Some email addresses are invalid.": {"res": "EmailGoogle:message_compose_error_invalid_email", "hu": "Egyes e-mail címek érvénytelenek.", "de": "Einige E-Mail-Adressen sind ungültig.", "fr": "Certaines adresses e-mail sont incorrectes.", "es": "Algunas direcciones de correo electrónico no son válidas."},
    "Compose (title)": {"res": "EmailGoogle:compose_title", "hu": "Levélírás", "de": "Schreiben", "fr": "Nouveau message", "es": "Redactar", "en": "Compose"},
    "Folders": {"res": "EmailGoogle:action_bar_mailbox_list_title", "hu": "Mappák", "de": "Ordner", "fr": "Dossiers", "es": "Carpetas"},
    "Show details": {"res": "EmailGoogle:message_view_show_details", "hu": "Részletek megjelenítése", "de": "Details anzeigen", "fr": "Afficher détails", "es": "Mostrar detalles"},
    "OK": {"res": "EmailGoogle:okay_action", "hu": "OK", "de": "OK", "fr": "OK", "es": "Aceptar"},
    "Cancel": {"res": "EmailGoogle:cancel_action", "hu": "Mégse", "de": "Abbrechen", "fr": "Annuler", "es": "Cancelar"},
    "%s wrote:": {"res": "EmailGoogle:message_compose_reply_header_fmt", "hu": "\n\n%s a következőt írta:\n\n", "de": "\n\n%s schrieb:\n\n", "fr": "\n\n%s a écrit :\n\n", "es": "\n\n%s wrote:\n\n", "en": "\n\n%s wrote:\n\n"}
  };
  // The app's own texts (with the image's English as a fifth entry where it differs), then the shared interface rows.
  const STR = AndroidStrings.table('', STRINGS, key => window.AndroidI18n?.t(key) ?? key), T = (lang, key) => STR.t(key, lang);
  const account = 'demo@example.com';
  // MailboxFragmentAdapter.MAILBOX_ORDER_BY; Starred is the combined favourites row, shown while something is starred.
  const folders = ['Inbox', 'Drafts', 'Outbox', 'Sent', 'Trash'];
  const ICONS = {Inbox: 'ic_folder_inbox_holo_light', Drafts: 'ic_folder_drafts_holo_light', Outbox: 'ic_folder_outbox_holo_light', Sent: 'ic_folder_sent_holo_light', Trash: 'email-ic_menu_trash_holo_light', Starred: 'ic_menu_star_holo_light'};
  const A = name => `assets/${name.startsWith('email-') || name.startsWith('ic_ab_') || name.startsWith('ic_menu_more') ? '' : 'em-'}${name}.png`;
  const img = name => `<img src="${A(name)}" alt="">`;

  // --- The local mailbox -----------------------------------------------------------------------------------------
  function restore(saved, samples = [], sent = [], now = Date.now()) {
    if (Array.isArray(saved)) return saved.map(item => ({...item, id: String(item.id), body: String(item.body || ''), subject: String(item.subject || ''), to: String(item.to || ''), cc: String(item.cc || ''), bcc: String(item.bcc || ''), read: !!item.read, starred: !!item.starred, created: item.created || now}));
    return [...samples.map((item, i) => ({...item, id: 'inbox-' + item.id, address: item.address || ['android@example.com', 'alex@example.com', 'calendar@example.com'][i] || 'hello@example.com', to: account, folder: 'Inbox', read: false, starred: false, created: item.created || now - (item.hoursAgo || 0) * 36e5})),
      ...sent.map(item => ({...item, id: 'sent-' + item.id, from: account, address: account, folder: 'Sent', read: true, starred: false, created: item.created || now}))];
  }
  function list(mail, folder = 'Inbox', query = '') {
    const search = String(query || '').toLocaleLowerCase();
    return mail.filter(item => (folder === 'Starred' ? item.starred && item.folder !== 'Trash' : item.folder === folder) && (!search || [item.from, item.to, item.subject, item.body].join(' ').toLocaleLowerCase().includes(search)));
  }
  // What the app lists: newest first, and an untouched new message is not a draft yet (MessageCompose saves only a
  // changed message).
  const shown = (mail, folder, query) => list(mail, folder, query).filter(item => item.folder !== 'Drafts' || changed(item)).sort((a, b) => (b.created || 0) - (a.created || 0));
  const changed = item => [item.to, item.cc, item.bcc, item.subject, item.body].some(v => String(v || '').trim()) || !!item.attachment;
  function recipients(value) { return String(value || '').split(/[;,]/).map(x => x.trim()).filter(Boolean); }
  const validAddress = x => /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(x);
  function validRecipients(draft) { const to = recipients(draft.to), all = [...to, ...recipients(draft.cc), ...recipients(draft.bcc)]; return to.length > 0 && all.every(validAddress); }
  function draft(source, forward = false, now = Date.now()) {
    return {id: 'draft-' + now, folder: 'Drafts', from: account, address: account, to: source && !forward ? (source.folder === 'Sent' ? source.to : source.address) : '', cc: '', bcc: '',
      subject: source ? `${forward ? 'Fwd' : 'Re'}: ${source.subject.replace(/^(Re|Fwd):\s*/i, '')}` : '', body: source ? `

${source.from}:
${source.body}` : '', read: true, starred: false, created: now,
      ...(forward && source?.attachment ? {attachment: JSON.parse(JSON.stringify(source.attachment))} : {})};
  }
  function trash(items, ids) { for (const item of items) if (ids.includes(item.id) && item.folder !== 'Trash') { item.previousFolder = item.folder; item.folder = 'Trash'; } }
  function untrash(item) { item.folder = ['Inbox', 'Drafts', 'Sent'].includes(item.previousFolder) ? item.previousFolder : 'Inbox'; delete item.previousFolder; }
  function send(item, now = Date.now()) { if (!validRecipients(item)) return false; item.folder = 'Sent'; item.read = true; item.created = now; delete item.previousFolder; return true; }
  // FolderProperties.getMessageCount: unread for Inbox and user folders, all messages for Drafts and Outbox, none for Sent and Trash.
  function count(mail, folder) {
    if (folder === 'Sent' || folder === 'Trash') return 0;
    const items = shown(mail, folder);
    return folder === 'Drafts' || folder === 'Outbox' ? items.length : items.filter(item => !item.read).length;
  }
  const countText = n => n > 999 ? '999+' : n ? String(n) : '';

  // --- Pieces ------------------------------------------------------------------------------------------------------
  // DateUtils.getRelativeTimeSpanString(context, millis): the time today, else the abbreviated month and day (and year).
  function when(item, ctx) {
    const d = new Date(item.created || ctx.now), now = new Date(ctx.now);
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString(ctx.locale, {hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
    return d.toLocaleDateString(ctx.locale, {month: 'short', day: 'numeric', ...(d.getFullYear() !== now.getFullYear() ? {year: 'numeric'} : {})});
  }
  const btn = (action, label, icon, {id = '', disabled = false, cls = 'em-btn'} = {}) => `<button type="button" class="${cls}" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}${disabled ? ' disabled' : ''} aria-label="${e(label)}" title="${e(label)}">${img(icon)}</button>`;
  const overflow = (ctx, action = 'email-menu') => btn(action, T(ctx.lang, 'More options'), 'ic_menu_moreoverflow_normal_holo_light');
  // The action bar: the app icon (with ic_ab_back_holo_light when it goes up) and the custom view.
  function bar(ctx, content, {up = false, actions = ''} = {}) {
    return `<header class="em-bar"><button type="button" class="em-home" data-action="${up ? 'email-up' : 'email-home'}" aria-label="Email">${up ? img('ic_ab_back_holo_light') : ''}<img src="assets/email.png" alt=""></button>${content}${actions}</header>`;
  }
  const split = buttons => `<footer class="em-split">${buttons}</footer>`;
  const display = (ctx, folder) => T(ctx.lang, folder);
  // action_bar_spinner.xml: line 1 the mailbox, line 2 the account, the count beside it.
  function spinner(ctx, line1, line2, number, enabled = true) {
    return `<button type="button" class="em-spinner${enabled ? '' : ' off'}" data-action="${enabled ? 'email-spinner' : 'email-none'}"${enabled ? ' aria-haspopup="true"' : ' disabled'}><span><b>${e(line1)}</b>${line2 ? `<small>${e(line2)}</small>` : ''}</span></button>${number ? `<span class="em-count">${e(number)}</span>` : ''}`;
  }

  // --- Message list ------------------------------------------------------------------------------------------------
  function rows(ctx, items) {
    const {ui, lang} = ctx, selected = ui.emailSelected || [];
    if (!items.length) return `<p class="em-empty">${e(T(lang, 'No messages'))}</p>`;
    return items.map(item => {
      const on = selected.includes(item.id), badge = item.replied && item.forwarded ? 'ic_badge_reply_forward_holo_light' : item.replied ? 'ic_badge_reply_holo_light' : item.forwarded ? 'ic_badge_forward_holo_light' : '';
      const sender = item.folder === 'Sent' || item.folder === 'Drafts' || item.folder === 'Outbox' ? (item.to || account) : item.from;
      return `<div class="em-row${item.read ? ' read' : ''}${on ? ' on' : ''}"><button type="button" class="em-check" data-action="email-select" data-id="${e(item.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(item.subject)}">${badge ? `<i style="background-image:url(${A(badge)})"></i>` : '<i></i>'}<img src="${A(on ? 'btn_check_on_normal_holo_light' : 'btn_check_off_normal_holo_light')}" alt=""></button>`
        + `<button type="button" class="em-open" data-action="email-read" data-id="${e(item.id)}"><span class="em-sender">${e(sender)}</span><span class="em-date">${item.attachment ? img('ic_badge_attachment') : ''}${e(when(item, ctx))}</span><span class="em-line"><b>${e(item.subject)}</b>${item.subject && item.body ? ' — ' : ''}${e(item.body.replace(/\s+/g, ' '))}</span></button>`
        + `<button type="button" class="em-star" data-action="email-star" data-id="${e(item.id)}" aria-pressed="${item.starred}" aria-label="${e(T(lang, 'Star'))}">${img(item.starred ? 'email-btn_star_on_normal_email_holo_light' : 'email-btn_star_off_normal_email_holo_light')}</button></div>`;
    }).join('');
  }
  function listView(ctx) {
    const {data, ui, lang} = ctx, mail = data.mailbox, folder = ui.emailFolder || 'Inbox', selected = (ui.emailSelected || []).filter(id => mail.some(m => m.id === id));
    const searching = ui.emailQuery !== undefined, query = ui.emailSearched || '';
    const items = shown(mail, folder, searching ? query : '');
    let head, actions;
    if (selected.length) {
      const chosen = mail.filter(m => selected.includes(m.id)), readExists = chosen.some(m => m.read), nonStar = chosen.some(m => !m.starred);
      head = `<header class="em-bar em-cab"><button type="button" class="em-done" data-action="email-clear-selection">${img('ic_cab_done_holo_light')}<b>${e(T(lang, 'Done'))}</b></button><span class="em-cab-title">${e(AndroidStrings.format(T(lang, '%d selected'), selected.length))}</span></header>`;
      actions = btn('email-selected-trash', T(lang, 'Delete'), 'email-ic_menu_trash_holo_light') + btn('email-move', T(lang, 'Move'), 'ic_menu_move_to_holo_light')
        + (readExists ? btn('email-selected-unread', T(lang, 'Mark unread'), 'email-ic_menu_mark_unread_holo_light') : btn('email-selected-read', T(lang, 'Mark read'), 'ic_menu_mark_read_holo_light'))
        + (nonStar ? btn('email-selected-star', T(lang, 'Add star'), 'ic_menu_star_holo_light') : btn('email-selected-unstar', T(lang, 'Remove star'), 'ic_menu_star_off_holo_light'));
    } else if (searching) {
      // action_bar_search.xml: a SearchView replaces the spinner; the hint names the IMAP mailbox.
      head = bar(ctx, `<form class="em-search" data-form="email-search"><img src="assets/em-ic_search_api_holo_light.png" alt=""><input name="query" value="${e(ui.emailQuery)}" placeholder="${e(AndroidStrings.format(T(lang, 'Search %1$s'), display(ctx, folder)))}" aria-label="${e(T(lang, 'Search'))}" autocomplete="off" enterkeyhint="search">${ui.emailQuery ? `<button type="button" data-action="email-search-clear" aria-label="${e(T(lang, 'Clear query'))}">${img('ic_clear_search_api_holo_light')}</button>` : ''}</form>`, {up: true});
      actions = btn('email-compose', T(lang, 'Compose'), 'email-ic_menu_compose_normal_holo_light') + btn('email-mailboxes', T(lang, 'Show all folders'), 'ic_menu_move_to_holo_light') + overflow(ctx);
    } else {
      head = bar(ctx, spinner(ctx, display(ctx, folder), account, countText(count(mail, folder))), {up: folder !== 'Inbox'});
      actions = btn('email-compose', T(lang, 'Compose'), 'email-ic_menu_compose_normal_holo_light') + btn('email-search', T(lang, 'Search'), 'email-ic_menu_search_holo_light')
        + btn('email-mailboxes', T(lang, 'Show all folders'), 'ic_menu_move_to_holo_light')
        + (ui.emailRefreshing ? '<span class="em-btn em-progress" role="progressbar"><i></i></span>' : btn('email-refresh', T(lang, 'Refresh'), 'email-ic_menu_refresh_holo_light')) + overflow(ctx);
    }
    const header = searching && query ? `<div class="em-search-header"><span>${e(AndroidStrings.format(T(lang, 'Search results for "%1$s"'), query))}</span><span>${items.length}</span></div>` : '';
    return `<div class="app-view em-app">${head}${header}<div class="em-scroll email-scroll">${rows(ctx, items)}</div>${split(actions)}</div>`;
  }

  // --- Show all folders (MailboxListFragment) ----------------------------------------------------------------------
  function mailboxes(ctx) {
    const {data, lang} = ctx, mail = data.mailbox;
    const all = [...(mail.some(m => m.starred && m.folder !== 'Trash') ? ['Starred'] : []), ...folders];
    const rowsHtml = all.map(folder => { const n = folder === 'Starred' ? mail.filter(m => m.starred && m.folder !== 'Trash').length : count(mail, folder);
      return `<button type="button" class="em-mailbox" data-action="email-folder" data-id="${folder}">${img(ICONS[folder])}<span>${e(display(ctx, folder))}</span>${n ? `<b>${n}</b>` : ''}</button>`; }).join('');
    return `<div class="app-view em-app">${bar(ctx, spinner(ctx, T(lang, 'Folders'), account, '', false), {up: true})}<div class="em-scroll">${rowsHtml}</div>${split(overflow(ctx))}</div>`;
  }

  // --- Message view ------------------------------------------------------------------------------------------------
  function messageView(ctx, item) {
    const {data, ui, lang, locale} = ctx, folder = ui.emailFolder || 'Inbox';
    const items = shown(data.mailbox, folder, ui.emailQuery !== undefined ? ui.emailSearched || '' : ''), index = items.findIndex(m => m.id === item.id);
    const newer = index > 0 ? items[index - 1] : null, older = index >= 0 && index < items.length - 1 ? items[index + 1] : null;
    const fromName = item.folder === 'Sent' || item.folder === 'Drafts' ? account : item.from, fromAddress = item.folder === 'Sent' || item.folder === 'Drafts' ? account : item.address;
    const addresses = [['To:', item.to], ['Cc:', item.cc], ['Bcc:', item.bcc]].filter(([, v]) => v).map(([label, v]) => `<b>${e(T(lang, label))}</b> ${e(v)}`).join('  ');
    const full = new Date(item.created || ctx.now).toLocaleString(locale, {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: !ctx.hour24});
    const details = ui.emailDetails
      ? `<div class="em-details"><table><tr><th>${e(T(lang, 'Date:'))}</th><td>${e(full)}</td></tr>${[['To:', item.to], ['Cc:', item.cc], ['Bcc:', item.bcc]].filter(([, v]) => v).map(([l, v]) => `<tr><th>${e(T(lang, l))}</th><td>${e(v)}</td></tr>`).join('')}</table><button type="button" class="em-expander close" data-action="email-details" aria-expanded="true" aria-label="${e(T(lang, 'Show details'))}"></button></div>`
      : `<div class="em-sub"><span class="em-addresses">${addresses}</span><span class="em-when">${e(when(item, ctx))}</span><button type="button" class="em-expander" data-action="email-details" aria-expanded="false" aria-label="${e(T(lang, 'Show details'))}"></button></div>`;
    const tab = ui.emailTab === 'attachments' && item.attachment ? 'attachments' : 'message';
    const tabs = item.attachment ? `<div class="em-tabs"><button type="button" data-action="email-tab" data-id="message" aria-selected="${tab === 'message'}">${e(T(lang, 'Message'))}</button><button type="button" data-action="email-tab" data-id="attachments" aria-selected="${tab === 'attachments'}">${e(AndroidStrings.format(T(lang, 'Attachment %1$d'), 1))}</button></div><i class="em-divider"></i>` : '';
    const body = tab === 'attachments'
      ? `<div class="em-attachment-view"><div class="em-att-row"><span class="em-att-icon">${ctx.photo && !item.attachment.vcard ? ctx.photo(item.attachment) : img('ic_attachment_holo_light')}</span><span><b>${e(item.attachment.name)}</b><small>${e(item.attachment.size || '214KB')}</small></span></div><div class="em-att-buttons"><button type="button" data-action="email-attachment-view">${e(T(lang, 'View'))}</button><button type="button" data-action="email-attachment-save">${e(T(lang, 'Save'))}</button></div></div>`
      : `<div class="em-body">${e(item.body).replace(/\n/g, '<br>')}</div>`;
    const head = bar(ctx, `<span class="em-subject-title">${e(item.subject)}</span>`, {up: true});
    const actions = btn('email-trash', T(lang, 'Delete'), 'email-ic_menu_trash_holo_light') + (item.folder === 'Drafts' ? '' : btn('email-move', T(lang, 'Move'), 'ic_menu_move_to_holo_light'))
      + btn('email-newer', T(lang, 'Newer'), newer ? 'ic_newer_arrow_holo_light' : 'ic_newer_arrow_disabled_holo_light', {id: newer?.id || '', disabled: !newer})
      + btn('email-older', T(lang, 'Older'), older ? 'ic_older_arrow_holo_light' : 'ic_older_arrow_disabled_holo_light', {id: older?.id || '', disabled: !older}) + overflow(ctx);
    return `<div class="app-view em-app">${head}<div class="em-scroll email-scroll em-message"><div class="em-subject">${e(item.subject)}</div>`
      + `<div class="em-header"><span class="em-badge"><img src="${A('ic_contact_picture')}" alt=""></span><i class="em-vline"></i><span class="em-from"><b>${e(fromName)}</b><small>${e(fromName === fromAddress ? ' ' : fromAddress)}</small></span>`
      + `<button type="button" class="em-hbtn" data-action="email-star" data-id="${e(item.id)}" aria-pressed="${item.starred}" aria-label="${e(T(lang, 'Star'))}">${img(item.starred ? 'btn_star_on_convo_holo_light' : 'btn_star_off_convo_holo_light')}</button>`
      + `<button type="button" class="em-hbtn" data-action="email-reply" aria-label="${e(T(lang, 'Reply'))}">${img('ic_reply_holo_dark')}</button><button type="button" class="em-hbtn em-more" data-action="email-more" aria-label="${e(T(lang, 'More options'))}">${img('ic_menu_moreoverflow_normal_holo_dark')}</button></div>`
      + `${details}<i class="em-divider"></i>${tabs}${body}</div>${split(actions)}</div>`;
  }

  // --- Compose -----------------------------------------------------------------------------------------------------
  function composeView(ctx, item) {
    const {ui, lang, data} = ctx;
    const mode = item.mode || '';
    const title = mode ? `<button type="button" class="em-spinner em-mode" data-action="email-mode" aria-haspopup="true"><span><b>${e(T(lang, mode === 'reply' ? 'Reply' : mode === 'reply-all' ? 'Reply all' : 'Forward'))}</b></span></button>` : `<span class="em-title">${e(T(lang, 'Compose (title)'))}</span>`;
    const field = (key, label) => `<label class="em-field em-recipient"><span>${e(T(lang, label))}</span><input type="email" multiple name="${key}" value="${e(item[key] || '')}" aria-label="${e(T(lang, label))}" autocomplete="off"></label>`;
    const source = item.source ? data.mailbox.find(m => m.id === item.source) : null;
    const quoted = source && item.mode !== 'forward' || source && item.mode === 'forward' ? `<div class="em-quoted"><label class="em-quoted-bar"><input type="checkbox" data-action="email-quoted"${item.includeQuoted !== false ? ' checked' : ''}><span>${e(T(lang, 'Include quoted text'))}</span></label><i></i>${item.includeQuoted !== false ? `<div class="em-quoted-text">${e(source.body).replace(/\n/g, '<br>')}</div>` : ''}</div>` : '';
    const attachment = item.attachment ? `<div class="em-attachment">${img('ic_attachment_holo_light')}<span><b>${e(item.attachment.name)}</b><small>${e(item.attachment.size || '214KB')}</small></span><button type="button" data-action="email-remove-attachment" aria-label="${e(T(lang, 'Remove'))}">${img('ic_cancel_holo_light')}</button></div>` : '';
    return `<form class="app-view em-app email-compose" data-form="email" novalidate>${bar(ctx, title, {up: true, actions: `<button type="submit" class="em-btn" aria-label="${e(T(lang, 'Send'))}" title="${e(T(lang, 'Send'))}">${img('email-ic_menu_send_holo_light')}</button>${overflow(ctx)}`})}`
      + `<div class="em-scroll email-scroll em-compose"><div class="em-field em-fromrow">${e(account)}</div>${field('to', 'To')}${ui.emailCc ? field('cc', 'Cc') + field('bcc', 'Bcc') : ''}`
      + `<label class="em-field"><input name="subject" value="${e(item.subject || '')}" placeholder="${e(T(lang, 'Subject'))}" aria-label="${e(T(lang, 'Subject'))}" maxlength="160" autocomplete="off"></label>${attachment}`
      + `<label class="em-field em-body-field"><textarea name="body" placeholder="${e(T(lang, 'Compose email'))}" aria-label="${e(T(lang, 'Compose email'))}">${e(item.body || '')}</textarea></label>${quoted}</div></form>`;
  }

  function render(ctx) {
    const {data, ui} = ctx, item = data.mailbox.find(m => m.id === ui.emailId);
    if (ui.sub === 'compose' && item) return composeView(ctx, item);
    if (ui.sub === 'read' && item) return messageView(ctx, item);
    if (ui.sub === 'mailboxes') return mailboxes(ctx);
    return listView(ctx);
  }

  // --- Popups and dialogs -----------------------------------------------------------------------------------------
  function overlay(ctx) {
    const {data, ui, lang} = ctx, mail = data.mailbox, item = mail.find(m => m.id === ui.emailId);
    const popup = (cls, items) => `<div class="menu-scrim" data-action="close-overlay"></div><div class="em-popup ${cls}" role="menu">${items}</div>`;
    const entry = (action, label, id = '', extra = '') => `<button type="button" role="menuitem" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''}><span>${e(label)}</span>${extra}</button>`;
    if (ui.overlay === 'email-spinner') {
      // AccountSelectorAdapter: the account, the recent-folders header, Drafts and Sent, then Show all folders.
      const recent = ['Drafts', 'Sent'];
      return popup('em-dropdown', entry('email-folder', account, 'Inbox', `<b>${e(countText(count(mail, 'Inbox')))}</b>`)
        + `<h4>${e(AndroidStrings.format(T(lang, 'Recent folders (%s)'), account))}</h4>` + recent.map(f => entry('email-folder', display(ctx, f), f, `<b>${e(countText(count(mail, f)))}</b>`)).join('')
        + entry('email-mailboxes', T(lang, 'Show all folders')));
    }
    if (ui.overlay === 'email-menu') {
      if (ui.sub === 'compose') return popup('em-overflow', entry('email-attach', T(lang, 'Attach file')) + (ui.emailCc ? '' : entry('email-cc', T(lang, 'Add Cc/Bcc'))) + entry('email-save', T(lang, 'Save draft')) + entry('email-discard', T(lang, 'Discard')) + entry('email-settings', T(lang, 'Settings')));
      if (ui.sub === 'read') return popup('em-overflow', entry('email-unread', T(lang, 'Mark as unread')) + entry('email-settings', T(lang, 'Settings')));
      return popup('em-overflow', entry('email-settings', T(lang, 'Settings')));
    }
    if (ui.overlay === 'email-more') return popup('em-header-menu', entry('email-reply-all', T(lang, 'Reply all')) + entry('email-forward', T(lang, 'Forward')));
    if (ui.overlay === 'email-mode') return popup('em-dropdown em-mode-menu', [['reply', 'Reply'], ['reply-all', 'Reply all'], ['forward', 'Forward']].map(([id, label]) => entry('email-mode-pick', T(lang, label), id)).join(''));
    if (ui.overlay === 'email-move') {
      // MoveMessageToDialog: the mailboxes a message can move to, without its own.
      const from = ui.sub === 'read' ? [item?.folder] : [...new Set(mail.filter(m => (ui.emailSelected || []).includes(m.id)).map(m => m.folder))];
      const targets = ['Inbox', 'Sent', 'Trash'].filter(f => !(from.length === 1 && from[0] === f));
      return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="em-dialog" role="dialog" aria-label="${e(T(lang, 'Move to'))}"><h3>${e(T(lang, 'Move to'))}</h3><div class="em-dialog-list">${targets.map(f => `<button type="button" data-action="email-move-to" data-id="${f}">${e(display(ctx, f))}</button>`).join('')}</div></div>`;
    }
    if (ui.overlay === 'email-discard') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="em-dialog" role="alertdialog" aria-label="${e(T(lang, 'Delete this message?'))}"><h3 class="em-alert">${img('ic_dialog_alert_holo_light')}</h3><p>${e(T(lang, 'Delete this message?'))}</p><div class="em-dialog-buttons"><button type="button" data-action="close-overlay">${e(T(lang, 'Cancel'))}</button><button type="button" data-action="email-confirm-discard">${e(T(lang, 'OK'))}</button></div></div>`;
    return '';
  }

  // --- Actions -----------------------------------------------------------------------------------------------------
  const unsupported = ctx => { ctx.ui.overlay = ''; ctx.renderOverlay(); ctx.toast(T(ctx.lang, 'This feature is not part of the simulator.')); };
  function keep(ctx) {
    const form = ctx.root?.querySelector('.email-compose'), item = ctx.data.mailbox.find(m => m.id === ctx.ui.emailId); if (!form || !item) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) { const f = form.querySelector(`[name=${key}]`); if (f) item[key] = f.value; }
  }
  function startCompose(ctx, source = null, mode = '', to = '') {
    const {data, ui} = ctx, d = draft(source, mode === 'forward', ctx.now);
    if (to) d.to = to;
    // MessageCompose keeps the quoted original in quoted_text.xml, outside the body.
    if (source) Object.assign(d, {body: '', source: source.id, includeQuoted: true});
    if (source && mode === 'reply-all') d.cc = [...new Set([...recipients(source.to), ...recipients(source.cc)])].filter(a => a !== account).join(', ');
    if (source) d.mode = mode || 'reply';
    // The account's signature (email-prefs.js): MessageCompose adds it on a new line after the text.
    if (ctx.signature) d.body = (d.body || '') + ctx.signature;
    data.mailbox.unshift(d); ui.emailId = d.id; ui.emailCc = !!d.cc; ui.overlay = ''; ui.sub = 'compose';
    ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.focus(source && mode !== 'forward' ? '.email-compose [name=body]' : '.email-compose [name=to]');
  }
  // Leaving compose keeps a changed draft (MessageCompose.onBackPressed saves it) and drops an untouched one.
  function leaveCompose(ctx, toast = true) {
    const {data, ui} = ctx, item = data.mailbox.find(m => m.id === ui.emailId);
    keep(ctx);
    if (item && item.folder === 'Drafts') {
      if (changed(item)) { if (toast) ctx.toast(T(ctx.lang, 'Message saved as draft.')); }
      else data.mailbox.splice(data.mailbox.indexOf(item), 1);
    }
    const source = item?.source && data.mailbox.find(m => m.id === item.source);
    ui.sub = source ? 'read' : ''; if (source) ui.emailId = source.id;
    ui.emailCc = false; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render();
  }
  function open(ctx, id) {
    const {data, ui} = ctx, item = data.mailbox.find(m => m.id === id); if (!item) return;
    ui.emailId = id; ui.emailDetails = false; ui.emailTab = 'message'; ui.overlay = '';
    if (item.folder === 'Drafts') { ui.sub = 'compose'; ui.emailCc = !!(item.cc || item.bcc); }
    else { item.read = true; ui.sub = 'read'; }
    ctx.save(); ctx.renderOverlay(); ctx.render();
  }
  function handle(action, id, ctx) {
    const {data, ui, lang} = ctx, mail = data.mailbox, item = mail.find(m => m.id === ui.emailId);
    const selection = () => mail.filter(m => (ui.emailSelected || []).includes(m.id));
    const close = () => { ui.overlay = ''; ctx.renderOverlay(); };
    switch (action) {
      case 'email-home': break;
      case 'email-up': ctx.back(); break;
      case 'email-spinner': case 'email-menu': case 'email-more': case 'email-mode': if (ui.sub === 'compose') keep(ctx); ui.overlay = action; ctx.renderOverlay(); break;
      case 'email-none': break;
      case 'email-folder': ui.emailFolder = id; ui.sub = ''; ui.emailQuery = undefined; ui.emailSearched = ''; ui.emailSelected = []; close(); ctx.render(); break;
      case 'email-mailboxes': ui.sub = 'mailboxes'; ui.emailSelected = []; close(); ctx.render(); break;
      case 'email-read': open(ctx, id); break;
      case 'email-newer': case 'email-older': if (id) open(ctx, id); break;
      case 'email-compose': close(); startCompose(ctx); break;
      case 'email-reply': close(); if (item) startCompose(ctx, item, 'reply'); break;
      case 'email-reply-all': close(); if (item) startCompose(ctx, item, 'reply-all'); break;
      case 'email-forward': close(); if (item) startCompose(ctx, item, 'forward'); break;
      case 'email-mode-pick': {
        close(); if (!item?.source) break;
        const source = mail.find(m => m.id === item.source), next = draft(source, id === 'forward', ctx.now);
        Object.assign(item, {mode: id, to: next.to, subject: next.subject, cc: id === 'reply-all' ? [...new Set([...recipients(source.to), ...recipients(source.cc)])].filter(a => a !== account).join(', ') : ''});
        ui.emailCc = !!item.cc; ctx.save(); ctx.render(); break;
      }
      case 'email-star': { const m = mail.find(x => x.id === (id || ui.emailId)); if (m) m.starred = !m.starred; ctx.save(); ctx.render(); break; }
      case 'email-select': ui.emailSelected = (ui.emailSelected || []).includes(id) ? ui.emailSelected.filter(x => x !== id) : [...(ui.emailSelected || []), id]; ctx.render(); break;
      case 'email-clear-selection': ui.emailSelected = []; ctx.render(); break;
      case 'email-selected-read': case 'email-selected-unread': selection().forEach(m => { m.read = action === 'email-selected-read'; }); ui.emailSelected = []; ctx.save(); ctx.render(); break;
      case 'email-selected-star': case 'email-selected-unstar': selection().forEach(m => { m.starred = action === 'email-selected-star'; }); ui.emailSelected = []; ctx.save(); ctx.render(); break;
      case 'email-selected-trash': { const n = selection().length; trash(mail, ui.emailSelected || []); ui.emailSelected = []; ctx.save(); ctx.render(); ctx.toast(T(lang, AndroidStrings.quantity(n) === 'one' ? 'Message deleted.' : 'Messages deleted.')); break; }
      // Delete in the message view returns to the list (the default auto-advance is the message list).
      case 'email-trash': if (item) { if (item.folder === 'Trash') mail.splice(mail.indexOf(item), 1); else trash(mail, [item.id]); } ui.sub = ''; ctx.save(); ctx.render(); ctx.toast(T(lang, 'Message deleted.')); break;
      case 'email-move': ui.overlay = 'email-move'; ctx.renderOverlay(); break;
      case 'email-move-to': {
        const targets = ui.sub === 'read' && item ? [item] : selection();
        for (const m of targets) { if (id === 'Trash') trash(mail, [m.id]); else { m.folder = id; delete m.previousFolder; } }
        ui.emailSelected = []; if (ui.sub === 'read') ui.sub = ''; close(); ctx.save(); ctx.render(); break;
      }
      case 'email-unread': if (item) item.read = false; ui.sub = ''; close(); ctx.save(); ctx.render(); break;
      case 'email-details': ui.emailDetails = !ui.emailDetails; ctx.render(); break;
      case 'email-tab': ui.emailTab = id; ctx.render(); break;
      case 'email-search': ui.emailQuery = ''; ui.emailSearched = ''; ui.emailSelected = []; ctx.render(); ctx.focus('.em-search input'); break;
      case 'email-search-clear': ui.emailQuery = ''; ui.emailSearched = ''; ctx.render(); ctx.focus('.em-search input'); break;
      // RefreshManager: the refresh item turns into the indeterminate progress while the local mailbox "syncs".
      case 'email-refresh': ui.emailRefreshing = true; ctx.render(); setTimeout(() => { ui.emailRefreshing = false; if (ui.view === 'email') ctx.render(); }, 1400); break;
      case 'email-cc': keep(ctx); ui.emailCc = true; close(); ctx.render(); ctx.focus('.email-compose [name=cc]'); break;
      case 'email-attach': keep(ctx); close(); ctx.save(); ctx.pickPicture?.(); break;
      case 'email-remove-attachment': keep(ctx); if (item) delete item.attachment; ctx.save(); ctx.render(); break;
      case 'email-quoted': keep(ctx); if (item) item.includeQuoted = item.includeQuoted === false; ctx.save(); ctx.render(); break;
      case 'email-save': keep(ctx); close(); if (item && changed(item)) { ctx.toast(T(lang, 'Message saved as draft.')); ctx.save(); } break;
      case 'email-discard': keep(ctx); ui.overlay = 'email-discard'; ctx.renderOverlay(); break;
      case 'email-confirm-discard': if (item) mail.splice(mail.indexOf(item), 1); { const source = item?.source && mail.find(m => m.id === item.source); ui.sub = source ? 'read' : ''; if (source) ui.emailId = source.id; } close(); ctx.save(); ctx.render(); ctx.toast(T(lang, 'Message discarded.')); break;
      case 'email-settings': close(); ctx.openSettings(); break;
      case 'email-attachment-view': case 'email-attachment-save': unsupported(ctx); break;
      default: return false;
    }
    return true;
  }
  // Attach file → the Gallery's GET_CONTENT picker hands back a picture.
  function attach(ctx, photo) {
    const item = ctx.data.mailbox.find(m => m.id === ctx.ui.emailId); if (!item || !photo) return;
    item.attachment = {...JSON.parse(JSON.stringify(photo)), size: photo.size || '214KB'}; ctx.ui.sub = 'compose'; ctx.save();
  }
  function submit(form, values, ctx) {
    const {data, ui, lang} = ctx;
    if (form === 'email-search') { ui.emailSearched = String(values.get('query') || '').trim(); ui.emailQuery = ui.emailSearched; ui.emailSelected = []; ctx.render(); return true; }
    if (form !== 'email') return false;
    const item = data.mailbox.find(m => m.id === ui.emailId); if (!item) return true;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (values.has(key)) item[key] = String(values.get(key)).trim();
    // MessageCompose.onSend: invalid addresses first, then no recipient at all.
    const all = [...recipients(item.to), ...recipients(item.cc), ...recipients(item.bcc)];
    if (all.some(a => !validAddress(a))) { ctx.toast(T(lang, 'Some email addresses are invalid.')); return true; }
    if (!all.length) { ctx.toast(T(lang, 'You must add at least one recipient.')); return true; }
    if (!recipients(item.to).length) item.to = item.cc || item.bcc;
    if (item.source && item.includeQuoted !== false) { const source = data.mailbox.find(m => m.id === item.source); if (source) item.body = `${item.body}${AndroidStrings.format(T(lang, '%s wrote:'), source.from)}${source.body}`; }
    const source = item.source && data.mailbox.find(m => m.id === item.source);
    if (source) { if (item.mode === 'forward') source.forwarded = true; else source.replied = true; }
    send(item, ctx.now); delete item.mode; delete item.source;
    ui.sub = source ? 'read' : ''; if (source) ui.emailId = source.id; ui.emailCc = false; ctx.save(); ctx.render();
    return true;
  }
  function back(ctx) {
    const {ui} = ctx;
    if (ui.overlay) return false;
    if (ui.sub === 'compose') { leaveCompose(ctx); return true; }
    if (ui.sub === 'read' || ui.sub === 'mailboxes') { ui.sub = ''; ctx.render(); return true; }
    if ((ui.emailSelected || []).length) { ui.emailSelected = []; ctx.render(); return true; }
    if (ui.emailQuery !== undefined) { ui.emailQuery = undefined; ui.emailSearched = ''; ctx.render(); return true; }
    if ((ui.emailFolder || 'Inbox') !== 'Inbox') { ui.emailFolder = 'Inbox'; ctx.render(); return true; }
    return false;
  }
  window.ICSEmail = {account, restore, list, shown, recipients, validRecipients, draft, trash, untrash, send, count, render, overlay, handle, submit, back, attach, startCompose, keep};
})();
