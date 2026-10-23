/* Gmail 4.0.4 on the Galaxy Nexus (Gmail.apk of the IMM76I image), rebuilt from its layouts, menus and code:
   - the list (ConversationListActivity on Theme.Holo.Light with the split action bar): gmail_actionbar_view's recent
     labels spinner (the label over the account, the 36 dip #bbbbbb unread count), CanvasConversationHeaderView rows
     after conversation_header_view_normal.xml, conversation_list_menu.xml (Compose, Search, Show all labels, Refresh;
     Label settings, Settings, Help, Send feedback in the overflow) and conversation_list_selection_actions_menu.xml
     (Archive, Delete, Change labels, Mark read / unread, Star; Mark important, Mute, Report spam);
   - the conversation: conversation_view_header.xml, the blue expanded MessageHeaderView and conversation_actions.xml;
   - ComposeActivity (compose_area_*.xml, compose_menu.xml) and LabelsActivity (label_list_header / label_item.xml).
   Texts are Gmail.apk's from the image; the account is offline and made up. */
(() => {
  'use strict';
  const e = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
  const account = 'icecream.demo@gmail.com';
  // [hu, de, fr, es] from the image's Gmail.apk (docs/tools/ics-gmail-strings.py fills them in from this template, docs/templates/ics-gmail.template.js).
  const STRINGS = {
    "Compose": {"res": "Gmail:compose", "hu": "Levélírás", "de": "E-Mail schreiben", "fr": "Nouveau message", "es": "Redactar"},
    "Search": {"res": "Gmail:search", "hu": "Keresés", "de": "Suchen", "fr": "Rechercher", "es": "Buscar"},
    "Labels": {"res": "Gmail:labels", "hu": "Címkék", "de": "Labels", "fr": "Libellés", "es": "Etiquetas"},
    "Refresh": {"res": "Gmail:refresh", "hu": "Frissítés", "de": "Aktualisieren", "fr": "Actualiser", "es": "Actualizar"},
    "Archive": {"res": "Gmail:archive", "hu": "Archiválás", "de": "Archiv.", "fr": "Archiver", "es": "Archivar"},
    "Delete": {"res": "Gmail:delete", "hu": "Törlés", "de": "Löschen", "fr": "Suppr.", "es": "Suprimir"},
    "Mark unread": {"res": "Gmail:mark_unread", "hu": "Megjelölés olvasatlanként", "de": "Als ungelesen markieren", "fr": "Marquer comme non lu", "es": "Marcar como no leído"},
    "Add star": {"res": "Gmail:add_star", "hu": "Csillagozás", "de": "Markieren", "fr": "Activer le suivi", "es": "Añadir estrella"},
    "Remove star": {"res": "Gmail:remove_star", "hu": "Csillag eltávolítása", "de": "Markierung entfernen", "fr": "Désactiver le suivi", "es": "Quitar estrella"},
    "Reply": {"res": "Gmail:reply", "hu": "Válasz", "de": "Antworten", "fr": "Répondre", "es": "Responder"},
    "Reply all": {"res": "Gmail:reply_all", "hu": "Mindenkinek", "de": "Allen antw.", "fr": "Rép. à tous", "es": "Responder a todos"},
    "Forward": {"res": "Gmail:forward", "hu": "Továbbítás", "de": "Weiterleiten", "fr": "Transférer", "es": "Reenviar"},
    "Send": {"res": "Gmail:send", "hu": "Küldés", "de": "Senden", "fr": "Envoyer", "es": "Enviar"},
    "Subject": {"res": "Gmail:subject_hint", "hu": "Tárgy", "de": "Betreff", "fr": "Objet", "es": "Asunto"},
    "To": {"res": "Gmail:to", "hu": "Címzett", "de": "An", "fr": "À", "es": "Para"},
    "To:": {"res": "Gmail:to_heading", "hu": "Címzett:", "de": "An:", "fr": "À :", "es": "Para:"},
    "Cc": {"res": "Gmail:cc", "hu": "Másolat", "de": "Cc", "fr": "Cc", "es": "CC"},
    "Bcc": {"res": "Gmail:bcc", "hu": "Titkos másolat", "de": "Bcc", "fr": "Cci", "es": "CCO"},
    "Compose email": {"res": "Gmail:body_hint", "hu": "E-mail írása", "de": "E-Mail schreiben", "fr": "Composez un message", "es": "Redactar correo"},
    "me": {"res": "Gmail:me", "hu": "én", "de": "ich", "fr": "moi", "es": "Yo"},
    "Done": {"res": "Gmail:menu_done", "hu": "Kész", "de": "Fertig", "fr": "OK", "es": "Listo"},
    "Change labels": {"res": "Gmail:menu_change_labels", "hu": "Címkék módosítása", "de": "Labels ändern", "fr": "Changer de libellés", "es": "Cambiar etiquetas"},
    "Settings": {"res": "Gmail:menu_preferences", "hu": "Beállítások", "de": "Einstellungen", "fr": "Paramètres", "es": "Ajustes"},
    "%d unread": {"res": "Gmail:unread", "hu": "%d nem olv.", "de": "%d ungel.", "fr": "%d non lus", "es": "%d sin leer"},
    "No conversations.": {"res": "Gmail:no_conversations", "hu": "Nincsenek beszélgetések.", "de": "Keine Konversationen", "fr": "Aucune conversation.", "es": "No hay conversaciones."},
    "Save draft": {"res": "Gmail:save_draft", "hu": "Piszkozat mentése", "de": "Entwurf speichern", "fr": "Enregistrer le brouillon", "es": "Guardar borrador"},
    "Discard": {"res": "Gmail:discard", "hu": "Elvetés", "de": "Verwerfen", "fr": "Supprimer", "es": "Descartar"},
    "Inbox": {"res": "Gmail:label_inbox", "hu": "Beérkezett üzenetek", "de": "Posteingang", "fr": "Boîte de réception", "es": "Recibidos"},
    "Starred": {"res": "Gmail:label_starred", "hu": "Csillaggal megjelölt", "de": "Markiert", "fr": "Messages suivis", "es": "Destacados"},
    "Sent": {"res": "Gmail:label_sent", "hu": "Elküldve", "de": "Gesendet", "fr": "Messages envoyés", "es": "Enviados"},
    "Drafts": {"res": "Gmail:label_draft", "hu": "Piszkozatok", "de": "Entwürfe", "fr": "Brouillons", "es": "Borradores"},
    "Outbox": {"res": "Gmail:label_outbox", "hu": "Kimenő levelek", "de": "Postausgang", "fr": "Boîte d'envoi", "es": "Bandeja de salida"},
    "All mail": {"res": "Gmail:label_all", "hu": "Összes e-mail", "de": "Alle Nachrichten", "fr": "Tous les messages", "es": "Todo el correo"},
    "Spam": {"res": "Gmail:label_spam", "hu": "Spam", "de": "Spam", "fr": "Spam", "es": "Spam"},
    "Trash": {"res": "Gmail:label_trash", "hu": "Kuka", "de": "Papierkorb", "fr": "Corbeille", "es": "Papelera"},
    "Important": {"res": "Gmail:label_important", "hu": "Fontos", "de": "Wichtig", "fr": "Important", "es": "Importante"},
    "Chats": {"res": "Gmail:label_chat", "hu": "Csevegések", "de": "Chats", "fr": "Tous les chats", "es": "Chats"},
    "Priority Inbox": {"res": "Gmail:label_magic_inbox", "hu": "Prioritások", "de": "Sortierter Eingang", "fr": "Prioritaire", "es": "Prioritarios"},
    "Recent labels": {"res": "Gmail:recent_labels_heading", "hu": "Legutóbbi címkék", "de": "Aktuelle Labels", "fr": "Libellés récents", "es": "Etiquetas recientes"},
    "All labels": {"res": "Gmail:all_labels_heading", "hu": "Minden címke", "de": "Alle Labels", "fr": "Tous les libellés", "es": "Todas las etiquetas"},
    "Sending…": {"res": "Gmail:sending", "hu": "Küldés…", "de": "Wird gesendet...", "fr": "Envoi…", "es": "Enviando…"},
    "Message saved as draft.": {"res": "Gmail:message_saved", "hu": "Az üzenet mentve piszkozatként.", "de": "Nachricht als Entwurf gespeichert", "fr": "Message enregistré comme brouillon.", "es": "Mensaje guardado como borrador"},
    "Search mail": {"res": "Gmail:search_hint", "hu": "Keresés a levelek között", "de": "Nachr. durchsuchen", "fr": "Rech. dans les messages", "es": "Buscar mensaje"},
    "Add Cc/Bcc": {"res": "Gmail:add_cc_label", "hu": "Másolatmezők hozzáadása", "de": "Cc/Bcc hinzufügen", "fr": "Ajouter Cc/Cci", "es": "Añadir CC/CCO"},
    "Attach file": {"res": "Gmail:add_file_attachment", "hu": "Fájl csatolása", "de": "Datei anhängen", "fr": "Joindre un fichier", "es": "Adjuntar archivo"},
    "Mark read": {"res": "Gmail:mark_read", "hu": "Megjelölés olvasottként", "de": "Als gelesen markieren", "fr": "Marquer comme lu", "es": "Marcar como leído"},
    "Star": {"res": "Gmail:star", "hu": "Csillag", "de": "Markierung", "fr": "Suivi", "es": "Destacar"},
    "Mark important": {"res": "Gmail:mark_important", "hu": "Megjelölés fontosként", "de": "Als wichtig markieren", "fr": "Marquer comme important", "es": "Marcar como importante"},
    "Mark not important": {"res": "Gmail:mark_not_important", "hu": "Megjelölés nem fontosként", "de": "Als nicht wichtig markieren", "fr": "Marquer comme non important", "es": "Marcar como no importante"},
    "Mute": {"res": "Gmail:mute", "hu": "Lezárás", "de": "Ignorieren", "fr": "Ignorer", "es": "Silenciar"},
    "Report spam": {"res": "Gmail:report_spam", "hu": "Ez spam", "de": "Spam melden", "fr": "Signaler comme spam", "es": "Marcar como spam"},
    "Label settings": {"res": "Gmail:menu_label_options", "hu": "Címke beállításai", "de": "Label-Einstellungen", "fr": "Paramètres du libellé", "es": "Ajustes de etiquetas"},
    "Help": {"res": "Gmail:help_and_info", "hu": "Súgó", "de": "Hilfe", "fr": "Aide", "es": "Ayuda"},
    "Send feedback": {"res": "Gmail:feedback", "hu": "Visszajelzés", "de": "Feedback geben", "fr": "Envoyer des commentaires", "es": "Enviar comentarios"},
    "Manage labels": {"res": "Gmail:menu_manage_labels", "hu": "Címkék kezelése", "de": "Labels verwalten", "fr": "Gérer les libellés", "es": "Administrar etiquetas"},
    "Show all labels": {"res": "Gmail:show_all_labels", "hu": "Az összes címke megjelenítése", "de": "Alle Labels anzeigen", "fr": "Afficher tous les libellés", "es": "Mostrar todas las etiquetas"},
    "Recent": {"res": "Gmail:recent_labels", "hu": "Legújabbak", "de": "Neueste", "fr": "Récents", "es": "Reciente"},
    "%s — %s": {"res": "Gmail:subject_and_snippet", "hu": "%s — %s", "de": "%s – %s", "fr": "%s — %s", "es": "%s — %s"}
  };
  // Gmail's own texts first, then the shared interface rows (More options, Cancel, ...).
  const STR = AndroidStrings.table('', STRINGS, AndroidStrings.shared), T = (lang, key) => STR.t(key, lang);
  const LABELS = ['Inbox', 'Priority Inbox', 'Starred', 'Important', 'Chats', 'Sent', 'Outbox', 'Drafts', 'All mail', 'Spam', 'Trash'];
  // Gmail 4.0.4's own xhdpi drawables (g4-*: Gmail.apk; Up, Done, the overflow and the spinner from the IMM76I framework).
  const ICON = name => `<img src="assets/g4-${name}.png" alt="">`;
  // RecentLabelsCache: array default_recent_labels (^t, ^f, ^r).
  const RECENT = ['Starred', 'Sent', 'Drafts'];
  // A spring 2012 inbox; personal level: "only" (to me alone, »), "list" (to me and others, ›), "" (a mailing).
  const SAMPLES = [
    ['Google Nexus', 'nexus-noreply@google.com', 'Get started with your Galaxy Nexus', 'Welcome to Android 4.0, Ice Cream Sandwich. Swipe away notifications, take a screenshot with Power + Volume down, and unlock with your face.', true, 0, 'only'],
    ['Alex Morgan', 'alex@example.com', 'Hike on Saturday?', 'Are you up for the ridge trail this weekend? I can pick you up at 8. Bring the new phone, the panorama mode looks great.', true, 1, 'only'],
    ['Google+ team', 'noreply-plus@google.com', 'Hangouts with extras', 'Share your screen, edit documents together and watch YouTube with friends in a Hangout.', false, 5, ''],
    ['Mom', 'mom@example.com', 'Sunday lunch', 'Don’t forget Sunday lunch at ours. Bring dessert if you can — ice cream is fine!', false, 26, 'only'],
    ['Taylor Lee', 'taylor@example.com', 'Slides for Monday', 'Here are the slides from the meetup. Let me know what you think.', false, 50, 'list'],
    ['Google Play', 'googleplay-noreply@google.com', 'Welcome to Google Play', 'Android Market is now Google Play: apps, music, books and movies in one place.', false, 75, '']
  ];
  function restore(saved, now = Date.now()) {
    if (Array.isArray(saved)) return saved.map((item, i) => ({...item, id: String(item.id), personal: item.personal ?? (SAMPLES.find(row => row[2] === item.subject)?.[6] ?? 'only')}));
    return SAMPLES.map(([from, address, subject, body, important, hoursAgo, personal], i) => ({id: 'g4-' + (i + 1), from, address, to: account, subject, body, label: 'Inbox', important, personal, created: now - hoursAgo * 36e5, read: i >= 2, starred: i === 1}));
  }
  const live = item => !['Trash', 'Spam'].includes(item.label);
  function list(mail, label, query = '') {
    const q = query.toLocaleLowerCase();
    const match = item => label === 'Priority Inbox' ? item.label === 'Inbox' && item.important : label === 'Starred' ? item.starred && live(item) : label === 'Important' ? item.important && live(item) : label === 'All mail' ? live(item) && item.label !== 'Drafts' : item.label === label;
    return mail.filter(item => (query !== undefined && query !== null && q ? live(item) : match(item)) && (!q || [item.from, item.subject, item.body].join(' ').toLocaleLowerCase().includes(q))).sort((a, b) => (b.created || 0) - (a.created || 0));
  }
  const unread = (mail, label) => list(mail, label).filter(item => !item.read).length;
  // Utils.getUnreadCountString: integer maxUnreadCount 999.
  const count = n => n > 999 ? '999+' : String(n);
  const when = (item, locale, now) => { const d = new Date(item.created || now); return d.toDateString() === new Date(now).toDateString() ? d.toLocaleTimeString(locale, {hour: 'numeric', minute: '2-digit'}) : d.toLocaleDateString(locale, {month: 'short', day: 'numeric'}); };
  const btn = (action, label, icon, id = '') => `<button type="button" class="g4-btn" data-action="${action}"${id ? ` data-id="${e(id)}"` : ''} aria-label="${e(label)}" title="${e(label)}">${ICON(icon)}</button>`;
  const more = (ctx, menu) => btn('g4-more', T(ctx.lang, 'More options'), 'ic_menu_moreoverflow_normal_holo_light', menu);
  // Theme.Holo.Light's action bar: the app icon (with the Up caret), gmail_actionbar_label (label over account).
  function top(ctx, title, sub, {up = false, actions = '', spinner = '', unreadCount = 0} = {}) {
    const home = `<button type="button" class="g4-home" data-action="${up ? 'back' : 'noop'}" aria-label="Gmail">${up ? '<img class="g4-up" src="assets/g4-ic_ab_back_holo_light.png" alt="">' : ''}<img src="assets/gmail.png" alt=""></button>`;
    const label = `<b>${e(title)}</b>${sub ? `<small>${e(sub)}</small>` : ''}`;
    return `<header class="g4-top">${home}${spinner ? `<button type="button" class="g4-title g4-spinner" data-action="${spinner}">${label}</button>` : `<span class="g4-title">${label}</span>`}${unreadCount ? `<em class="g4-unread">${count(unreadCount)}</em>` : ''}${actions}</header>`;
  }
  const bottom = buttons => `<footer class="g4-bottom">${buttons}</footer>`;
  // CanvasConversationHeaderView: the personal level caret (yellow when important), ic_email_caret_* from the image.
  function caret(item) {
    const level = ['Sent', 'Drafts', 'Outbox'].includes(item.label) ? '' : item.personal ?? 'only';
    const file = level === 'only' ? 'double' : level === 'list' ? 'single' : item.important ? 'none' : '';
    return file ? `<img src="assets/g4-ic_email_caret_${file}${item.important ? '_important_unread' : ''}.png" alt="">` : '';
  }
  // conversation_header_view_normal.xml (70 sp): the caret 8 dp in, 18 sp senders, the paperclip and the 12 sp date
  // 16 dp from the end; under them the check box 8 dp in, the 14 sp two-line "subject — snippet" and the star.
  function rows(ctx, items) {
    const {ui, locale, now, lang} = ctx, selected = ui.g4Selected || [];
    if (!items.length) return `<p class="g4-empty">${e(T(lang, 'No conversations.'))}</p>`;
    return items.map(item => {
      const on = selected.includes(item.id), who = item.label === 'Drafts' ? `<span class="g4-draft">${e(T(lang, 'Drafts'))}</span>` : e(item.label === 'Sent' ? T(lang, 'me') : item.from);
      return `<div class="g4-row${item.read ? ' read' : ''}${on ? ' checked' : ''}"><button type="button" class="g4-row-main" data-action="g4-open" data-id="${e(item.id)}"><span class="g4-line1"><span class="g4-caret">${caret(item)}</span><b>${who}</b>${item.attachment ? `<img class="g4-clip" src="assets/g4-ic_attachment_holo_light.png" alt="">` : ''}<time>${e(when(item, locale, now))}</time></span><span class="g4-line2"><strong>${e(item.subject || '—')}</strong>${item.body ? `${e(T(lang, '%s — %s').slice(2, -2))}${e(item.body.replace(/\s+/g, ' '))}` : ''}</span></button><button type="button" class="g4-check" data-action="g4-select" data-id="${e(item.id)}" role="checkbox" aria-checked="${on}" aria-label="${e(item.from)}">${ICON(on ? 'btn_check_on_normal_holo_light' : 'btn_check_off_normal_holo_light')}</button><button type="button" class="g4-star" data-action="g4-star" data-id="${e(item.id)}" aria-label="${e(T(lang, item.starred ? 'Remove star' : 'Add star'))}">${ICON(item.starred ? 'btn_star_on_normal_gmail_holo_light' : 'btn_star_off_normal_gmail_holo_light')}</button></div>`;
    }).join('');
  }
  function listView(ctx) {
    const {data, ui, lang} = ctx, mail = data.gmail40, label = ui.g4Label || 'Inbox', selected = ui.g4Selected || [];
    const searching = ui.g4Query !== undefined;
    // Settings › Manage labels: a label synced for None lists nothing, Last N days only those days.
    const items = searching || !window.ICSGmailPrefs ? list(mail, label, searching ? ui.g4Query : '') : ICSGmailPrefs.synced(data, label, list(mail, label, ''));
    const picked = mail.filter(m => selected.includes(m.id));
    // The selection's action mode: Done and the count; conversation_list_selection_actions_menu.xml in the split bar.
    const head = selected.length
      ? `<header class="g4-top g4-cab"><button type="button" class="g4-done" data-action="g4-clear">${ICON('ic_cab_done_holo_light')}<b>${e(T(lang, 'Done'))}</b></button><span class="g4-count">${selected.length}</span></header>`
      : searching ? `<header class="g4-top"><button type="button" class="g4-home" data-action="g4-search-close" aria-label="Gmail"><img class="g4-up" src="assets/g4-ic_ab_back_holo_light.png" alt=""><img src="assets/gmail.png" alt=""></button><form class="g4-search" data-form="g4-search"><input name="query" autocomplete="off" value="${e(ui.g4Query)}" placeholder="${e(T(lang, 'Search mail'))}" aria-label="${e(T(lang, 'Search mail'))}"></form></header>`
      : top(ctx, T(lang, label), account, {spinner: 'g4-recent', unreadCount: unread(mail, label)});
    const anyUnread = picked.some(m => !m.read), allStarred = picked.length && picked.every(m => m.starred);
    const actions = selected.length
      ? btn('g4-archive', T(lang, 'Archive'), 'ic_menu_archive_holo_light') + btn('g4-delete', T(lang, 'Delete'), 'ic_menu_trash_holo_light') + btn('g4-labels', T(lang, 'Change labels'), 'ic_menu_labels_holo_light') + (anyUnread ? btn('g4-read', T(lang, 'Mark read'), 'ic_menu_mark_read_holo_light') : btn('g4-unread', T(lang, 'Mark unread'), 'ic_menu_mark_unread_holo_light')) + btn('g4-star-selected', T(lang, allStarred ? 'Remove star' : 'Star'), 'ic_menu_star_holo_light') + more(ctx, 'selection')
      : btn('g4-compose', T(lang, 'Compose'), 'ic_menu_compose_normal_holo_light') + btn('g4-search', T(lang, 'Search'), 'ic_menu_search_holo_light') + btn('g4-labels', T(lang, 'Show all labels'), 'ic_menu_labels_holo_light') + btn('g4-refresh', T(lang, 'Refresh'), 'ic_menu_refresh_holo_light') + more(ctx, 'list');
    return `<div class="app-view g4-app">${head}<div class="g4-scroll email-scroll">${rows(ctx, items)}</div>${bottom(actions)}</div>`;
  }
  // The hybrid conversation view: conversation_view_header.xml (14 sp bold subject, the label spans on its baseline with
  // the important caret), MessageHeaderView (an expanded message on header_convo_view_sender_bg_holo #0099cc: the 48 sp
  // contact photo, a 1 dp white spacer, the 16 sp bold white sender over the 14 sp #eeeeee address, the star, Reply and
  // the overflow) and the details line ("To: me", the date, the expander), then the message.
  function conversation(ctx) {
    const {data, ui, lang, locale, now} = ctx, item = data.gmail40.find(m => m.id === ui.g4Id);
    if (!item) return listView(ctx);
    const label = ui.g4Label || 'Inbox';
    const chips = [item.label, item.important ? 'Important' : ''].filter(l => l && l !== 'All mail').map(l => `<span class="g4-chip">${e(T(lang, l))}</span>`).join('');
    const sender = item.label === 'Sent' || item.label === 'Drafts' ? account : item.address;
    const actions = btn('g4-archive', T(lang, 'Archive'), 'ic_menu_archive_holo_light') + btn('g4-delete', T(lang, 'Delete'), 'ic_menu_trash_holo_light') + btn('g4-labels', T(lang, 'Change labels'), 'ic_menu_labels_holo_light') + btn('g4-unread', T(lang, 'Mark unread'), 'ic_menu_mark_unread_holo_light') + more(ctx, 'conversation');
    return `<div class="app-view g4-app">${top(ctx, T(lang, label), account, {up: true})}<div class="g4-scroll"><div class="g4-cv-head"><h2>${e(item.subject || '—')}</h2><span class="g4-labels-line">${item.important ? '<img src="assets/g4-ic_email_caret_none_important_unread.png" alt="">' : ''}${chips}</span></div><article class="g4-message"><div class="g4-mh"><img class="g4-photo" src="assets/g4-ic_contact_picture.png" alt=""><span class="g4-mh-spacer"></span><span class="g4-mh-title"><b>${e(item.label === 'Sent' ? T(lang, 'me') : item.from)}</b><small>${e(sender)}</small></span><button type="button" class="g4-mh-act" data-action="g4-star" data-id="${e(item.id)}" aria-label="${e(T(lang, item.starred ? 'Remove star' : 'Add star'))}">${ICON(item.starred ? 'btn_star_on_convo_holo_light' : 'btn_star_off_convo_holo_light')}</button><button type="button" class="g4-mh-act" data-action="g4-reply" aria-label="${e(T(lang, 'Reply'))}">${ICON('ic_reply_holo_dark')}</button><button type="button" class="g4-mh-act g4-mh-more" data-action="g4-more" data-id="message" aria-label="${e(T(lang, 'More options'))}">${ICON('ic_menu_moreoverflow_normal_holo_light')}</button></div><div class="g4-details"><span>${e(T(lang, 'To:'))} ${e(item.label === 'Sent' ? item.to : T(lang, 'me'))}</span><time>${e(when(item, locale, now))}</time>${ICON('ic_menu_expander_minimized_holo_light')}</div><div class="g4-body">${e(item.body).replace(/\n/g, '<br>')}</div>${item.attachment ? attachmentRow(ctx, item.attachment, false) : ''}</article></div>${bottom(actions)}</div>`;
  }
  // attachment.xml: the 48 dp attachment_bg_holo row with the 8 dp-in thumbnail over ic_attachment_holo_light, the name
  // (textAppearanceSmall, black) over the #555555 size, and ic_cancel_holo_light 8 dp from the end while composing.
  function attachmentRow(ctx, item, removable) {
    const {lang} = ctx;
    return `<div class="g4-attachment"><span class="g4-att-thumb"><img src="assets/g4-ic_attachment_holo_light.png" alt="">${ctx.photo ? `<span class="g4-att-photo">${ctx.photo(item)}</span>` : ''}</span><span class="g4-att-copy"><b>${e(item.name || 'IMG.jpg')}</b><small>${e(item.size || '')}</small></span>${removable ? `<button type="button" class="g4-att-remove" data-action="g4-remove-attachment" aria-label="${e(T(lang, 'Discard'))}"><img src="assets/g4-ic_cancel_holo_light.png" alt=""></button>` : ''}</div>`;
  }
  // Attach file → the Gallery's GET_CONTENT picker hands back a picture.
  function attach(ctx, photo) {
    const draft = ctx.data.gmail40.find(m => m.id === ctx.ui.g4Id); if (!draft || !photo) return;
    draft.attachment = {...JSON.parse(JSON.stringify(photo)), size: photo.size || '214KB'}; ctx.ui.sub = 'compose'; ctx.save();
  }
  // ComposeActivity (ComposeTheme, no split bar): Send in the bar, compose_area_layout.xml 16 dp in: the account as the
  // static From line, "To" with its field, Cc / Bcc when added, Subject and the body, each on a Holo text field line.
  function compose(ctx) {
    const {data, ui, lang} = ctx, draft = data.gmail40.find(m => m.id === ui.g4Id) || {};
    const actions = btn('g4-send', T(lang, 'Send'), 'ic_menu_send_holo_light') + more(ctx, 'compose');
    const field = (name, label, value) => `<label class="g4-field g4-recipient"><span>${e(T(lang, label))}</span><input name="${name}" type="email" multiple autocomplete="off" value="${e(value)}" aria-label="${e(T(lang, label))}"></label>`;
    return `<div class="app-view g4-app g4-compose-view">${top(ctx, T(lang, 'Compose'), '', {up: true, actions})}<form class="g4-form" data-form="g4-compose"><div class="g4-field g4-from" data-no-translate>${e(account)}</div>${field('to', 'To', draft.to === account ? '' : draft.to || '')}${ui.g4Cc ? field('cc', 'Cc', draft.cc || '') + field('bcc', 'Bcc', draft.bcc || '') : ''}<label class="g4-field"><input name="subject" autocomplete="off" value="${e(draft.subject || '')}" placeholder="${e(T(lang, 'Subject'))}" aria-label="${e(T(lang, 'Subject'))}"></label>${draft.attachment ? attachmentRow(ctx, draft.attachment, true) : ''}<label class="g4-field g4-body-field"><textarea name="body" placeholder="${e(T(lang, 'Compose email'))}" aria-label="${e(T(lang, 'Compose email'))}">${e(draft.body || '')}</textarea></label><button type="submit" hidden></button></form></div>`;
  }
  // LabelsActivity (split bar): gmail_actionbar_label ("Labels" over the account), label_list_header.xml headings
  // (Recent labels, All labels) and label_item.xml rows (18 sp names 24 dp in, 18 dip #bcbcbc counts 16 dp from the
  // end, the current label on list_activated_holo); Manage labels and the overflow below.
  function labelsView(ctx) {
    const {data, ui, lang} = ctx;
    const row = l => { const n = l === 'Drafts' || l === 'Outbox' ? list(data.gmail40, l).length : unread(data.gmail40, l); return `<button type="button" class="g4-label${l === (ui.g4Label || 'Inbox') ? ' on' : ''}" data-action="g4-label" data-id="${e(l)}"><span>${e(T(lang, l))}</span>${n ? `<em>${count(n)}</em>` : ''}</button>`; };
    const actions = `<button type="button" class="g4-text-btn" data-action="g4-manage-labels">${e(T(lang, 'Manage labels'))}</button>` + more(ctx, 'labels');
    return `<div class="app-view g4-app">${top(ctx, T(lang, 'Labels'), account, {up: true})}<div class="g4-scroll g4-labels"><h4>${e(T(lang, 'Recent labels'))}</h4>${RECENT.map(row).join('')}<h4>${e(T(lang, 'All labels'))}</h4>${LABELS.map(row).join('')}</div>${bottom(actions)}</div>`;
  }
  function render(ctx) {
    if (ctx.ui.sub === 'conversation') return conversation(ctx);
    if (ctx.ui.sub === 'compose') return compose(ctx);
    if (ctx.ui.sub === 'labels') return labelsView(ctx);
    // Settings, Manage labels and Label settings (ics-gmail-prefs.js).
    if (ctx.ui.sub === 'g4-prefs' && window.ICSGmailPrefs) return ICSGmailPrefs.render(ctx);
    return listView(ctx);
  }
  // The overflow menus (conversation_list_menu, conversation_list_selection_actions_menu, conversation_actions,
  // compose_menu, label_list_menu, message_header_overflow_menu: the items they do not show as actions).
  function menuItems(ctx, menu) {
    const {data, ui} = ctx, picked = menu === 'selection' ? data.gmail40.filter(m => (ui.g4Selected || []).includes(m.id)) : data.gmail40.filter(m => m.id === ui.g4Id);
    const important = picked.length && picked.every(m => m.important);
    const help = [['g4-settings', 'Settings'], ['g4-unsupported', 'Help'], ['g4-unsupported', 'Send feedback']];
    const mark = [important ? ['g4-not-important', 'Mark not important'] : ['g4-important', 'Mark important'], ['g4-mute', 'Mute'], ['g4-spam', 'Report spam']];
    if (menu === 'list') return [['g4-label-settings', 'Label settings'], ...help];
    if (menu === 'selection') return mark;
    if (menu === 'conversation') return [...mark, ...help];
    if (menu === 'compose') return [['g4-attach', 'Attach file'], ...(ui.g4Cc ? [] : [['g4-cc', 'Add Cc/Bcc']]), ['g4-save', 'Save draft'], ['g4-discard', 'Discard'], ...help];
    if (menu === 'labels') return help;
    if (menu === 'message') return [['g4-reply-all', 'Reply all'], ['g4-forward', 'Forward']];
    return [];
  }
  // The recent labels spinner (account_switch_spinner_dropdown_header / label_switch_spinner_dropdown_item), the
  // overflow menus and the change-labels dialog.
  function overlay(ctx) {
    const {data, ui, lang} = ctx;
    if (ui.overlay === 'g4-recent') return `<div class="menu-scrim" data-action="close-overlay"></div><div class="g4-menu g4-recent" role="menu"><h4><b>${e(T(lang, 'Recent'))}</b><span data-no-translate>${e(account)}</span></h4>${['Inbox', ...RECENT].map(l => { const n = l === 'Drafts' ? 0 : unread(data.gmail40, l); return `<button type="button" data-action="g4-label" data-id="${l}"><span>${e(T(lang, l))}</span>${n ? `<em>${count(n)}</em>` : ''}</button>`; }).join('')}<button type="button" data-action="g4-labels"><span>${e(T(lang, 'Show all labels'))}</span></button></div>`;
    if (ui.overlay === 'g4-more') { const menu = ui.g4Menu || 'list'; return `<div class="menu-scrim" data-action="close-overlay"></div><div class="g4-menu g4-overflow g4-overflow-${menu}" role="menu">${menuItems(ctx, menu).map(([a, l]) => `<button type="button" data-action="${a}">${e(T(lang, l))}</button>`).join('')}</div>`; }
    if (ui.overlay === 'g4-move') return `<div class="settings-dialog-scrim" data-action="close-overlay"></div><div class="settings-dialog g4-move" role="dialog"><h3>${e(T(lang, 'Change labels'))}</h3>${['Inbox', 'Starred', 'Important', 'Trash'].map(l => `<button class="settings-row" data-action="g4-move-to" data-id="${l}"><span class="row-copy">${e(T(lang, l))}</span></button>`).join('')}<div class="settings-dialog-actions"><button data-action="close-overlay">${e(T(lang, 'Cancel'))}</button></div></div>`;
    return null;
  }
  // Taps and forms; ctx: {data, ui, lang, save, render, renderOverlay, toast}. Returns true when handled.
  function handle(action, id, ctx) {
    const {data, ui} = ctx, mail = data.gmail40;
    const targets = () => ui.sub === 'conversation' ? [ui.g4Id] : ui.g4Selected || [];
    const done = () => { ui.g4Selected = []; if (ui.sub === 'conversation') ui.sub = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); };
    switch (action) {
      case 'g4-open': { const item = mail.find(m => m.id === id); if (!item) break; ui.g4Id = id; if (item.label === 'Drafts') { ui.sub = 'compose'; } else { item.read = true; ui.sub = 'conversation'; } ctx.save(); ctx.render(); break; }
      case 'g4-select': ui.g4Selected = (ui.g4Selected || []).includes(id) ? ui.g4Selected.filter(x => x !== id) : [...(ui.g4Selected || []), id]; ctx.render(); break;
      case 'g4-clear': ui.g4Selected = []; ctx.render(); break;
      case 'g4-star': { const item = mail.find(m => m.id === (id || ui.g4Id)); if (item) item.starred = !item.starred; ctx.save(); ctx.render(); break; }
      case 'g4-star-selected': { const picked = mail.filter(m => (ui.g4Selected || []).includes(m.id)), on = !picked.every(m => m.starred); picked.forEach(m => { m.starred = on; }); done(); break; }
      case 'g4-read': mail.filter(m => targets().includes(m.id)).forEach(m => { m.read = true; }); done(); break;
      case 'g4-important': case 'g4-not-important': mail.filter(m => targets().includes(m.id)).forEach(m => { m.important = action === 'g4-important'; }); done(); break;
      // Mute takes the conversation out of the inbox; Report spam moves it to Spam.
      case 'g4-mute': mail.filter(m => targets().includes(m.id)).forEach(m => { m.muted = true; if (m.label === 'Inbox') m.label = 'All mail'; }); done(); break;
      case 'g4-spam': mail.filter(m => targets().includes(m.id)).forEach(m => { m.label = 'Spam'; }); done(); break;
      case 'g4-more': ui.g4Menu = id || 'list'; ui.overlay = 'g4-more'; ctx.renderOverlay(); break;
      case 'g4-archive': mail.filter(m => targets().includes(m.id) && m.label === 'Inbox').forEach(m => { m.label = 'All mail'; }); done(); break;
      case 'g4-delete': mail.filter(m => targets().includes(m.id)).forEach(m => { m.label = 'Trash'; }); done(); break;
      case 'g4-unread': mail.filter(m => targets().includes(m.id)).forEach(m => { m.read = false; }); done(); break;
      case 'g4-labels': if (targets().length) { ui.overlay = 'g4-move'; ctx.renderOverlay(); } else { ui.overlay = ''; ctx.renderOverlay(); ui.sub = 'labels'; ctx.render(); } break;
      case 'g4-move-to': mail.filter(m => targets().includes(m.id)).forEach(m => { if (id === 'Starred') m.starred = true; else if (id === 'Important') m.important = true; else m.label = id; }); done(); break;
      case 'g4-label': ui.g4Label = id; ui.sub = ''; ui.g4Selected = []; ui.g4Query = undefined; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'g4-recent': ui.overlay = 'g4-recent'; ctx.renderOverlay(); break;
      case 'g4-refresh': ctx.toast(T(ctx.lang, 'Refresh')); break;
      case 'g4-search': ui.g4Query = ''; ctx.render(); ctx.focus('.g4-search input'); break;
      case 'g4-search-close': ui.g4Query = undefined; ctx.render(); break;
      case 'g4-compose': case 'g4-reply': case 'g4-reply-all': case 'g4-forward': {
        const source = action === 'g4-compose' ? null : mail.find(m => m.id === ui.g4Id);
        const draft = {id: 'g4-' + Date.now(), from: account, address: account, to: source && action !== 'g4-forward' ? source.address : '', subject: source ? `${action === 'g4-forward' ? 'Fwd' : 'Re'}: ${source.subject}` : '', body: source && action === 'g4-forward' ? `\n\n---------- Forwarded message ----------\n${source.body}` : '', label: 'Drafts', created: Date.now(), read: true};
        mail.unshift(draft); ui.g4Id = draft.id; ui.g4Cc = false; ui.sub = 'compose'; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); ctx.focus(source && action !== 'g4-forward' ? '.g4-form textarea' : '.g4-form [name=to]'); break;
      }
      case 'g4-send': ctx.submit('.g4-form'); break;
      case 'g4-attach': ctx.keep(); ui.overlay = ''; ctx.renderOverlay(); ctx.pickPicture(); break;
      case 'g4-remove-attachment': { ctx.keep(); const draft = mail.find(m => m.id === ui.g4Id); if (draft) delete draft.attachment; ctx.save(); ctx.render(); break; }
      case 'g4-cc': ctx.keep(); ui.g4Cc = true; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); break;
      case 'g4-save': ctx.keep(); ui.sub = ''; ui.overlay = ''; ctx.renderOverlay(); ctx.render(); ctx.toast(T(ctx.lang, 'Message saved as draft.')); break;
      case 'g4-discard': { const i = mail.findIndex(m => m.id === ui.g4Id); if (i >= 0) mail.splice(i, 1); ui.sub = ''; ui.overlay = ''; ctx.save(); ctx.renderOverlay(); ctx.render(); break; }
      case 'g4-settings': case 'g4-label-settings': case 'g4-manage-labels': return !!window.ICSGmailPrefs?.handle(action, id, ctx);
      case 'g4-unsupported': ui.overlay = ''; ctx.renderOverlay(); ctx.toast('This feature is not part of the simulator.'); break;
      default: return false;
    }
    return true;
  }
  // Copies the compose fields into the draft (before Back, Save draft or Add Cc/Bcc).
  function keepDraft(data, ui, form) {
    const draft = data.gmail40.find(m => m.id === ui.g4Id); if (!draft || !form) return;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) { const field = form.querySelector(`[name=${key}]`); if (field) draft[key] = field.value; }
  }
  function submit(form, values, ctx) {
    const {data, ui} = ctx;
    if (form === 'g4-search') { ui.g4Query = String(values.get('query') || '').trim(); ctx.render(); return true; }
    if (form !== 'g4-compose') return false;
    const draft = data.gmail40.find(m => m.id === ui.g4Id); if (!draft) return true;
    for (const key of ['to', 'cc', 'bcc', 'subject', 'body']) if (values.has(key)) draft[key] = String(values.get(key)).trim();
    if (!/\S+@\S+\.\S+/.test(draft.to)) { ctx.toast(T(ctx.lang, 'To')); ctx.focus('.g4-form [name=to]'); return true; }
    draft.label = 'Sent'; draft.created = Date.now(); ui.sub = ''; ctx.save(); ctx.render(); ctx.toast(T(ctx.lang, 'Sending…')); return true;
  }
  window.ICSGmail = {account, restore, list, unread, render, overlay, handle, submit, keepDraft, attach, labelName: (lang, label) => T(lang, label)};
})();
